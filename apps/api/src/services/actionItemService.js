const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { userPublicSelect } = require("../utils/selects");
const { normalizeStatus, normalizePriority, parseDate } = require("../utils/validation");
const eventBus = require("../realtime/eventBus");
const { logAudit } = require("./auditLogService");

async function ensureGoal(goalId, workspaceId) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId }
  });

  if (!goal) {
    throw new HttpError(404, "Goal not found");
  }
}

async function ensureAssignee(assigneeId, workspaceId) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: assigneeId,
        workspaceId
      }
    }
  });

  if (!membership) {
    throw new HttpError(400, "Assignee must be a workspace member");
  }
}

async function listActionItems({ workspaceId }) {
  return prisma.actionItem.findMany({
    where: { workspaceId },
    include: {
      assignee: { select: userPublicSelect },
      createdBy: { select: userPublicSelect },
      goal: true
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getActionItem({ workspaceId, actionItemId }) {
  const actionItem = await prisma.actionItem.findFirst({
    where: { id: actionItemId, workspaceId },
    include: {
      assignee: { select: userPublicSelect },
      createdBy: { select: userPublicSelect },
      goal: true
    }
  });

  if (!actionItem) {
    throw new HttpError(404, "Action item not found");
  }

  return actionItem;
}

async function createActionItem({
  workspaceId,
  userId,
  title,
  description,
  status,
  priority,
  dueDate,
  assigneeId,
  goalId
}) {
  if (!title || !title.trim()) {
    throw new HttpError(400, "Action item title is required");
  }

  const normalizedStatus = normalizeStatus(status) || "ACTIVE";
  const normalizedPriority = normalizePriority(priority) || "MEDIUM";
  const parsedDueDate = parseDate(dueDate, "Due date");

  if (goalId) {
    await ensureGoal(goalId, workspaceId);
  }

  if (assigneeId) {
    await ensureAssignee(assigneeId, workspaceId);
  }

  return prisma.actionItem.create({
    data: {
      workspaceId,
      title: title.trim(),
      description: description || null,
      status: normalizedStatus,
      priority: normalizedPriority,
      dueDate: parsedDueDate || undefined,
      assigneeId: assigneeId || null,
      goalId: goalId || null,
      createdById: userId
    },
    include: {
      assignee: { select: userPublicSelect },
      createdBy: { select: userPublicSelect },
      goal: true
    }
  }).then(async (actionItem) => {
    await logAudit({
      workspaceId,
      actorId: userId,
      action: "actionItem.created",
      entityType: "actionItem",
      entityId: actionItem.id,
      metadata: { title: actionItem.title, status: actionItem.status }
    });

    eventBus.emit("actionItem.created", { workspaceId, actionItem });

    return actionItem;
  });
}

async function updateActionItem({
  workspaceId,
  actionItemId,
  title,
  description,
  status,
  priority,
  dueDate,
  assigneeId,
  goalId,
  actorId
}) {
  const actionItem = await prisma.actionItem.findFirst({
    where: { id: actionItemId, workspaceId }
  });

  if (!actionItem) {
    throw new HttpError(404, "Action item not found");
  }

  const updates = {};

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new HttpError(400, "Action item title cannot be empty");
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

  if (goalId !== undefined) {
    if (goalId) {
      await ensureGoal(goalId, workspaceId);
      updates.goalId = goalId;
    } else {
      updates.goalId = null;
    }
  }

  if (assigneeId !== undefined) {
    if (assigneeId) {
      await ensureAssignee(assigneeId, workspaceId);
      updates.assigneeId = assigneeId;
    } else {
      updates.assigneeId = null;
    }
  }

  if (!Object.keys(updates).length) {
    throw new HttpError(400, "No action item updates provided");
  }

  const updated = await prisma.actionItem.update({
    where: { id: actionItem.id },
    data: updates,
    include: {
      assignee: { select: userPublicSelect },
      createdBy: { select: userPublicSelect },
      goal: true
    }
  });

  await logAudit({
    workspaceId,
    actorId,
    action: "actionItem.updated",
    entityType: "actionItem",
    entityId: updated.id,
    metadata: updates
  });

  eventBus.emit("actionItem.updated", { workspaceId, actionItem: updated });

  if (updates.status && updates.status !== actionItem.status) {
    eventBus.emit("status.updated", {
      workspaceId,
      entityType: "actionItem",
      entityId: updated.id,
      status: updated.status
    });
  }

  return updated;
}

async function deleteActionItem({ workspaceId, actionItemId, actorId }) {
  const actionItem = await prisma.actionItem.findFirst({
    where: { id: actionItemId, workspaceId }
  });

  if (!actionItem) {
    throw new HttpError(404, "Action item not found");
  }

  const result = await prisma.actionItem.deleteMany({
    where: { id: actionItemId, workspaceId }
  });

  if (result.count === 0) {
    throw new HttpError(404, "Action item not found");
  }

  await logAudit({
    workspaceId,
    actorId,
    action: "actionItem.deleted",
    entityType: "actionItem",
    entityId: actionItemId,
    metadata: { title: actionItem.title }
  });

  eventBus.emit("actionItem.deleted", { workspaceId, actionItemId });
}

module.exports = {
  listActionItems,
  getActionItem,
  createActionItem,
  updateActionItem,
  deleteActionItem
};
