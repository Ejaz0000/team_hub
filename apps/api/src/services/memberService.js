const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { userPublicSelect } = require("../utils/selects");

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

async function inviteMember({ workspaceId, email, role }) {
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

  return member;
}

async function updateMemberRole({ workspaceId, memberId, role }) {
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

module.exports = {
  listMembers,
  inviteMember,
  updateMemberRole
};
