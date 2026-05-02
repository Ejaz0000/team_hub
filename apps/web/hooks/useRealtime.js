"use client";

import { useEffect, useRef, useState } from "react";
import { createSocket } from "@/lib/socket";

const WORKSPACE_EVENTS = [
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
  "workspace.updated"
];

export default function useRealtime(workspaceId, handlers = {}) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!workspaceId) {
      return undefined;
    }

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("workspace:join", workspaceId, (ack) => {
        if (ack && ack.ok && Array.isArray(ack.onlineUsers)) {
          setOnlineUsers(ack.onlineUsers);
        }
      });
    });

    socket.on("presence.updated", (payload) => {
      if (payload && payload.workspaceId === workspaceId) {
        setOnlineUsers(payload.onlineUsers || []);
      }
    });

    WORKSPACE_EVENTS.forEach((eventName) => {
      socket.on(eventName, (payload) => {
        if (handlersRef.current.onEvent) {
          handlersRef.current.onEvent(eventName, payload);
        }
      });
    });

    socket.on("notification.created", (payload) => {
      if (handlersRef.current.onEvent) {
        handlersRef.current.onEvent("notification.created", payload);
      }
    });

    return () => {
      try {
        socket.emit("workspace:leave", workspaceId);
      } catch (error) {
        // ignore cleanup errors
      }
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [workspaceId]);

  return { onlineUsers };
}
