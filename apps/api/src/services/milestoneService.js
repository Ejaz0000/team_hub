const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { normalizeStatus, normalizeProgress, parseDate } = require("../utils/validation");
const eventBus = require("../realtime/eventBus");
const { logAudit } = require("./auditLogService");

async function ensureGoal(goalId, workspaceId) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId }
  });

  if (!goal) {
    throw new HttpError(404, "Goal not found");
  }

  return goal;
}

async function listMilestones({ workspaceId, goalId }) {
  await ensureGoal(goalId, workspaceId);

  return prisma.milestone.findMany({
    where: { goalId },
    orderBy: { createdAt: "asc" }
  });
}

async function createMilestone({ workspaceId, goalId, title, description, status, progress, dueDate, actorId }) {
  await ensureGoal(goalId, workspaceId);

  if (!title || !title.trim()) {
    throw new HttpError(400, "Milestone title is required");
  }

  const normalizedStatus = normalizeStatus(status) || "ACTIVE";
  const normalizedProgress = normalizeProgress(progress) ?? 0;
  const parsedDueDate = parseDate(dueDate, "Due date");

  const milestone = await prisma.milestone.create({
    data: {
      goalId,
      title: title.trim(),
      description: description || null,
      status: normalizedStatus,
      progress: normalizedProgress,
      dueDate: parsedDueDate || undefined
    }
  });

  await logAudit({
    workspaceId,
    actorId,
    action: "milestone.created",
    entityType: "milestone",
    entityId: milestone.id,
    metadata: { goalId, title: milestone.title, status: milestone.status }
  });

  eventBus.emit("milestone.created", { workspaceId, goalId, milestone });

  return milestone;
}

async function updateMilestone({
  workspaceId,
  goalId,
  milestoneId,
  title,
  description,
  status,
  progress,
  dueDate,
  actorId
}) {
  await ensureGoal(goalId, workspaceId);

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, goalId }
  });

  if (!milestone) {
    throw new HttpError(404, "Milestone not found");
  }

  const updates = {};

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new HttpError(400, "Milestone title cannot be empty");
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description || null;
  }

  if (status !== undefined) {
    updates.status = normalizeStatus(status);
  }

  if (progress !== undefined) {
    updates.progress = normalizeProgress(progress);
  }

  if (dueDate !== undefined) {
    updates.dueDate = parseDate(dueDate, "Due date");
  }

  if (!Object.keys(updates).length) {
    throw new HttpError(400, "No milestone updates provided");
  }

  const updated = await prisma.milestone.update({
    where: { id: milestone.id },
    data: updates
  });

  await logAudit({
    workspaceId,
    actorId,
    action: "milestone.updated",
    entityType: "milestone",
    entityId: updated.id,
    metadata: updates
  });

  eventBus.emit("milestone.updated", { workspaceId, goalId, milestone: updated });

  if (
    (updates.status && updates.status !== milestone.status) ||
    (updates.progress !== undefined && updates.progress !== milestone.progress)
  ) {
    eventBus.emit("status.updated", {
      workspaceId,
      entityType: "milestone",
      entityId: updated.id,
      status: updated.status,
      progress: updated.progress
    });
  }

  return updated;
}

async function deleteMilestone({ workspaceId, goalId, milestoneId, actorId }) {
  await ensureGoal(goalId, workspaceId);

  const result = await prisma.milestone.deleteMany({
    where: { id: milestoneId, goalId }
  });

  if (result.count === 0) {
    throw new HttpError(404, "Milestone not found");
  }

  await logAudit({
    workspaceId,
    actorId,
    action: "milestone.deleted",
    entityType: "milestone",
    entityId: milestoneId,
    metadata: { goalId }
  });

  eventBus.emit("milestone.deleted", { workspaceId, goalId, milestoneId });
}

module.exports = {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
};
