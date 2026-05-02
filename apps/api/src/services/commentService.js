const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { userPublicSelect } = require("../utils/selects");
const eventBus = require("../realtime/eventBus");
const notificationService = require("./notificationService");

async function ensureAnnouncement(announcementId, workspaceId) {
  const announcement = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
    select: { id: true, title: true, createdById: true }
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }

  return announcement;
}

async function listComments({ workspaceId, announcementId }) {
  const announcement = await ensureAnnouncement(announcementId, workspaceId);

  return prisma.comment.findMany({
    where: { announcementId },
    include: { author: { select: userPublicSelect } },
    orderBy: { createdAt: "asc" }
  });
}

async function addComment({ workspaceId, announcementId, authorId, body }) {
  await ensureAnnouncement(announcementId, workspaceId);

  if (!body || !body.trim()) {
    throw new HttpError(400, "Comment body is required");
  }

  const comment = await prisma.comment.create({
    data: {
      announcementId,
      authorId,
      body: body.trim()
    },
    include: { author: { select: userPublicSelect } }
  });

  await notificationService.notifyComment({
    workspaceId,
    actorId: authorId,
    announcementId,
    announcementTitle: announcement.title,
    announcementCreatorId: announcement.createdById,
    commentId: comment.id,
    body: comment.body
  });

  eventBus.emit("comment.created", {
    workspaceId,
    announcementId,
    comment
  });

  return comment;
}

module.exports = { listComments, addComment };
