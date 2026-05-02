const { Server } = require("socket.io");
const prisma = require("../utils/prisma");
const eventBus = require("./eventBus");
const { verifyAccessToken } = require("../utils/jwt");
const { ACCESS_TOKEN_COOKIE, WEB_ORIGIN } = require("../utils/env");
const logger = require("../utils/logger");
const { addUser, removeUser, getOnlineUsers } = require("./presenceStore");

const handlersRegistered = { value: false };

function roomForWorkspace(workspaceId) {
  return `workspace:${workspaceId}`;
}

function roomForUser(userId) {
  return `user:${userId}`;
}

function parseCookies(header) {
  if (!header) {
    return {};
  }

  return header.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function extractToken(socket) {
  const authHeader = socket.handshake.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return authToken;
  }

  const cookies = parseCookies(socket.handshake.headers?.cookie);
  return cookies[ACCESS_TOKEN_COOKIE];
}

async function ensureWorkspaceMember(userId, workspaceId) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  });

  return Boolean(membership);
}

function registerEventHandlers(io) {
  if (handlersRegistered.value) {
    return;
  }

  handlersRegistered.value = true;

  const forwardToWorkspace = (eventName) => {
    eventBus.on(eventName, (payload) => {
      if (!payload || !payload.workspaceId) {
        return;
      }
      io.to(roomForWorkspace(payload.workspaceId)).emit(eventName, payload);
    });
  };

  [
    "announcement.created",
    "announcement.updated",
    "announcement.deleted",
    "announcement.pinned",
    "comment.created",
    "reaction.added",
    "reaction.removed",
    "goal.created",
    "goal.updated",
    "goal.deleted",
    "milestone.created",
    "milestone.updated",
    "milestone.deleted",
    "actionItem.created",
    "actionItem.updated",
    "actionItem.deleted",
    "status.updated",
    "member.invited",
    "member.roleUpdated",
    "workspace.created",
    "workspace.updated"
  ].forEach(forwardToWorkspace);

  eventBus.on("notification.created", (payload) => {
    if (!payload || !payload.userId) {
      return;
    }
    io.to(roomForUser(payload.userId)).emit("notification.created", payload);
  });
}

function createSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: WEB_ORIGIN,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = extractToken(socket);
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = verifyAccessToken(token);
      socket.user = { id: payload.sub, email: payload.email };
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected ${socket.id}`);

    socket.data.workspaceIds = new Set();
    socket.join(roomForUser(socket.user.id));

    socket.on("workspace:join", async (workspaceId, ack) => {
      try {
        if (!workspaceId) {
          throw new Error("Workspace id required");
        }

        const isMember = await ensureWorkspaceMember(socket.user.id, workspaceId);
        if (!isMember) {
          throw new Error("Forbidden");
        }

        socket.join(roomForWorkspace(workspaceId));
        socket.data.workspaceIds.add(workspaceId);

        const onlineUsers = addUser(workspaceId, socket.user.id);
        io.to(roomForWorkspace(workspaceId)).emit("presence.updated", {
          workspaceId,
          onlineUsers
        });

        if (ack) {
          ack({ ok: true, onlineUsers });
        }
      } catch (error) {
        if (ack) {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("workspace:leave", (workspaceId, ack) => {
      if (!workspaceId) {
        if (ack) {
          ack({ ok: false, error: "Workspace id required" });
        }
        return;
      }

      socket.leave(roomForWorkspace(workspaceId));
      socket.data.workspaceIds.delete(workspaceId);

      const onlineUsers = removeUser(workspaceId, socket.user.id);
      io.to(roomForWorkspace(workspaceId)).emit("presence.updated", {
        workspaceId,
        onlineUsers
      });

      if (ack) {
        ack({ ok: true, onlineUsers });
      }
    });

    socket.on("presence:get", (workspaceId, ack) => {
      const onlineUsers = getOnlineUsers(workspaceId);
      if (ack) {
        ack({ ok: true, onlineUsers });
      }
    });

    socket.on("disconnect", () => {
      socket.data.workspaceIds.forEach((workspaceId) => {
        const onlineUsers = removeUser(workspaceId, socket.user.id);
        io.to(roomForWorkspace(workspaceId)).emit("presence.updated", {
          workspaceId,
          onlineUsers
        });
      });
      logger.info(`Socket disconnected ${socket.id}`);
    });
  });

  registerEventHandlers(io);

  return io;
}

module.exports = { createSocketServer };
