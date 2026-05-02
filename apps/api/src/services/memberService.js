const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { userPublicSelect } = require("../utils/selects");
const eventBus = require("../realtime/eventBus");
const { logAudit } = require("./auditLogService");
const notificationService = require("./notificationService");

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeRole(role) {
  if (!role) {
    return "MEMBER";
  }

  const upper = role.toUpperCase();
  if (upper !== "ADMIN" && upper !== "MEMBER") {
    throw new HttpError(400, "Invalid role");
  }

  return upper;
}

async function listMembers({ workspaceId }) {
  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: userPublicSelect }
    },
    orderBy: { joinedAt: "asc" }
  });
}

async function inviteMember({ workspaceId, email, role, actorId }) {
  if (!email) {
    throw new HttpError(400, "Email is required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    throw new HttpError(404, "User not found for invite");
  }

  const normalizedRole = normalizeRole(role);

  const existing = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId
      }
    }
  });

  const member = await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId
      }
    },
    update: {
      role: normalizedRole
    },
    create: {
      userId: user.id,
      workspaceId,
      role: normalizedRole
    },
    include: {
      user: { select: userPublicSelect }
    }
  });

  if (!existing) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true }
    });

    await notificationService.notifyInvite({
      workspaceId,
      actorId,
      userId: user.id,
      workspaceName: workspace ? workspace.name : null
    });
  }

  await logAudit({
    workspaceId,
    actorId,
    action: existing ? "member.roleUpdated" : "member.invited",
    entityType: "workspaceMember",
    entityId: member.id,
    metadata: { role: normalizedRole, userId: user.id }
  });

  eventBus.emit(existing ? "member.roleUpdated" : "member.invited", {
    workspaceId,
    member
  });

  return member;
}

async function updateMemberRole({ workspaceId, memberId, role, actorId }) {
  const normalizedRole = normalizeRole(role);

  const result = await prisma.workspaceMember.updateMany({
    where: {
      id: memberId,
      workspaceId
    },
    data: { role: normalizedRole }
  });

  if (result.count === 0) {
    throw new HttpError(404, "Member not found");
  }

  return prisma.workspaceMember.findUnique({
    where: { id: memberId },
    include: { user: { select: userPublicSelect } }
  });
}

async function postUpdateMemberRole({ workspaceId, member, actorId }) {
  await logAudit({
    workspaceId,
    actorId,
    action: "member.roleUpdated",
    entityType: "workspaceMember",
    entityId: member.id,
    metadata: { role: member.role, userId: member.userId }
  });

  eventBus.emit("member.roleUpdated", { workspaceId, member });
}

module.exports = {
  listMembers,
  inviteMember,
  updateMemberRole,
  postUpdateMemberRole
};
