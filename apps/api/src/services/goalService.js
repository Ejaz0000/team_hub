const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { userPublicSelect } = require("../utils/selects");
const { normalizeStatus, normalizePriority, parseDate } = require("../utils/validation");
const eventBus = require("../realtime/eventBus");
const { logAudit } = require("./auditLogService");

async function ensureMember(userId, workspaceId, message) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  });

  if (!membership) {
    throw new HttpError(400, message);
  }
}

async function getGoalOrThrow(goalId, workspaceId) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId }
  });

  if (!goal) {
    throw new HttpError(404, "Goal not found");
  }

  return goal;
}

async function listGoals({ workspaceId }) {
  return prisma.goal.findMany({
    where: { workspaceId },
    include: {
      owner: { select: userPublicSelect },
      createdBy: { select: userPublicSelect }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getGoal({ workspaceId, goalId }) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId },
    include: {
      owner: { select: userPublicSelect },
      createdBy: { select: userPublicSelect }
    }
  });

  if (!goal) {
    throw new HttpError(404, "Goal not found");
  }

  return goal;
}

async function createGoal({ workspaceId, userId, title, ownerId, dueDate, status, priority, description }) {
  if (!title || !title.trim()) {
    throw new HttpError(400, "Goal title is required");
  }

  const normalizedStatus = normalizeStatus(status) || "ACTIVE";
  const normalizedPriority = normalizePriority(priority) || "MEDIUM";
  const parsedDueDate = parseDate(dueDate, "Due date");
  const resolvedOwnerId = ownerId || userId;

  await ensureMember(resolvedOwnerId, workspaceId, "Owner must be a workspace member");

  return prisma.goal.create({
    data: {
      workspaceId,
      title: title.trim(),
      description: description || null,
      status: normalizedStatus,
      priority: normalizedPriority,
      dueDate: parsedDueDate || undefined,
      ownerId: resolvedOwnerId,
      createdById: userId
    },
    include: {
      owner: { select: userPublicSelect },
      createdBy: { select: userPublicSelect }
    }
  }).then(async (goal) => {
    await logAudit({
      workspaceId,
      actorId: userId,
      action: "goal.created",
      entityType: "goal",
      entityId: goal.id,
      metadata: { title: goal.title, status: goal.status }
    });

    eventBus.emit("goal.created", { workspaceId, goal });

    return goal;
  });
}

async function updateGoal({
  workspaceId,
  goalId,
  title,
  ownerId,
  dueDate,
  status,
  priority,
  description,
  actorId
}) {
  const goal = await getGoalOrThrow(goalId, workspaceId);

  const updates = {};

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new HttpError(400, "Goal title cannot be empty");
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description || null;
  }

  if (status !== undefined) {
    updates.status = normalizeStatus(status);
  }

  if (priority !== undefined) {
    updates.priority = normalizePriority(priority);
  }

  if (dueDate !== undefined) {
    updates.dueDate = parseDate(dueDate, "Due date");
  }

  if (ownerId !== undefined) {
    await ensureMember(ownerId, workspaceId, "Owner must be a workspace member");
    updates.ownerId = ownerId;
  }

  if (!Object.keys(updates).length) {
    throw new HttpError(400, "No goal updates provided");
  }

  const updated = await prisma.goal.update({
    where: { id: goal.id },
    data: updates,
    include: {
      owner: { select: userPublicSelect },
      createdBy: { select: userPublicSelect }
    }
  });

  await logAudit({
    workspaceId,
    actorId,
    action: "goal.updated",
    entityType: "goal",
    entityId: updated.id,
    metadata: updates
  });

  eventBus.emit("goal.updated", { workspaceId, goal: updated });

  if (updates.status && updates.status !== goal.status) {
    eventBus.emit("status.updated", {
      workspaceId,
      entityType: "goal",
      entityId: updated.id,
      status: updated.status
    });
  }

  return updated;
}

async function deleteGoal({ workspaceId, goalId, actorId }) {
  const goal = await getGoalOrThrow(goalId, workspaceId);
  const result = await prisma.goal.deleteMany({
    where: { id: goalId, workspaceId }
  });

  if (result.count === 0) {
    throw new HttpError(404, "Goal not found");
  }

  await logAudit({
    workspaceId,
    actorId,
    action: "goal.deleted",
    entityType: "goal",
    entityId: goalId,
    metadata: { title: goal.title }
  });

  eventBus.emit("goal.deleted", { workspaceId, goalId });
}

module.exports = {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal
};
