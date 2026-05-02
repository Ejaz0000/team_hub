const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { userPublicSelect } = require("../utils/selects");
const { normalizeStatus } = require("../utils/validation");
const eventBus = require("../realtime/eventBus");
const { logAudit } = require("./auditLogService");
const notificationService = require("./notificationService");

async function getAnnouncementOrThrow(announcementId, workspaceId) {
  const announcement = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
    include: { createdBy: { select: userPublicSelect } }
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }

  return announcement;
}

async function listAnnouncements({ workspaceId }) {
  return prisma.announcement.findMany({
    where: { workspaceId },
    include: { createdBy: { select: userPublicSelect } },
    orderBy: [{ isPinned: "desc" }, { pinnedAt: "desc" }, { createdAt: "desc" }]
  });
}

async function getAnnouncement({ workspaceId, announcementId }) {
  return getAnnouncementOrThrow(announcementId, workspaceId);
}

async function createAnnouncement({ workspaceId, userId, title, content, status, isPinned }) {
  if (!title || !title.trim()) {
    throw new HttpError(400, "Announcement title is required");
  }

  if (!content || !content.trim()) {
    throw new HttpError(400, "Announcement content is required");
  }

  const normalizedStatus = normalizeStatus(status) || "ACTIVE";
  const pinned = Boolean(isPinned);

  const announcement = await prisma.announcement.create({
    data: {
      workspaceId,
      title: title.trim(),
      content: content.trim(),
      status: normalizedStatus,
      isPinned: pinned,
      pinnedAt: pinned ? new Date() : null,
      createdById: userId
    },
    include: { createdBy: { select: userPublicSelect } }
  });

  await logAudit({
    workspaceId,
    actorId: userId,
    action: "announcement.created",
    entityType: "announcement",
    entityId: announcement.id,
    metadata: { title: announcement.title, isPinned: announcement.isPinned }
  });

  eventBus.emit("announcement.created", { workspaceId, announcement });

  await notificationService.notifyMentions({
    workspaceId,
    actorId: userId,
    text: announcement.content,
    entityType: "announcement",
    entityId: announcement.id,
    title: "You were mentioned"
  });

  return announcement;
}

function assertCanEdit(announcement, userId, isAdmin) {
  if (isAdmin) {
    return;
  }

  if (announcement.createdById !== userId) {
    throw new HttpError(403, "Forbidden");
  }
}

async function updateAnnouncement({ workspaceId, announcementId, title, content, status, userId, isAdmin }) {
  const announcement = await getAnnouncementOrThrow(announcementId, workspaceId);
  assertCanEdit(announcement, userId, isAdmin);

  const updates = {};

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new HttpError(400, "Announcement title cannot be empty");
    }
    updates.title = title.trim();
  }

  if (content !== undefined) {
    if (!content || !content.trim()) {
      throw new HttpError(400, "Announcement content cannot be empty");
    }
    updates.content = content.trim();
  }

  if (status !== undefined) {
    updates.status = normalizeStatus(status);
  }

  if (!Object.keys(updates).length) {
    throw new HttpError(400, "No announcement updates provided");
  }

  const updated = await prisma.announcement.update({
    where: { id: announcement.id },
    data: updates,
    include: { createdBy: { select: userPublicSelect } }
  });

  await logAudit({
    workspaceId,
    actorId: userId,
    action: "announcement.updated",
    entityType: "announcement",
    entityId: updated.id,
    metadata: updates
  });

  eventBus.emit("announcement.updated", { workspaceId, announcement: updated });

  if (updates.status && updates.status !== announcement.status) {
    eventBus.emit("status.updated", {
      workspaceId,
      entityType: "announcement",
      entityId: updated.id,
      status: updated.status
    });
  }

  return updated;
}

async function deleteAnnouncement({ workspaceId, announcementId, userId, isAdmin }) {
  const announcement = await getAnnouncementOrThrow(announcementId, workspaceId);
  assertCanEdit(announcement, userId, isAdmin);

  await prisma.announcement.delete({ where: { id: announcement.id } });

  await logAudit({
    workspaceId,
    actorId: userId,
    action: "announcement.deleted",
    entityType: "announcement",
    entityId: announcement.id,
    metadata: { title: announcement.title }
  });

  eventBus.emit("announcement.deleted", { workspaceId, announcementId: announcement.id });
}

async function setPinned({ workspaceId, announcementId, isPinned, actorId }) {
  await getAnnouncementOrThrow(announcementId, workspaceId);

  const updated = await prisma.announcement.update({
    where: { id: announcementId },
    data: {
      isPinned,
      pinnedAt: isPinned ? new Date() : null
    }
  });

  await logAudit({
    workspaceId,
    actorId: actorId || null,
    action: "announcement.pinned",
    entityType: "announcement",
    entityId: announcementId,
    metadata: { isPinned }
  });

  eventBus.emit("announcement.pinned", {
    workspaceId,
    announcementId,
    isPinned
  });

  return updated;
}

module.exports = {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  setPinned
};
