const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const eventBus = require("../realtime/eventBus");

async function ensureAnnouncement(announcementId, workspaceId) {
  const announcement = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId }
  });

  if (!announcement) {
    throw new HttpError(404, "Announcement not found");
  }
}

function normalizeReactionType(type) {
  if (!type || !String(type).trim()) {
    throw new HttpError(400, "Reaction type is required");
  }

  return String(type).trim();
}

async function addReaction({ workspaceId, announcementId, userId, type }) {
  await ensureAnnouncement(announcementId, workspaceId);

  const normalizedType = normalizeReactionType(type);

  const reaction = await prisma.reaction.upsert({
    where: {
      announcementId_userId_type: {
        announcementId,
        userId,
        type: normalizedType
      }
    },
    update: {},
    create: {
      announcementId,
      userId,
      type: normalizedType
    }
  });

  eventBus.emit("reaction.added", {
    workspaceId,
    announcementId,
    reaction
  });

  return reaction;
}

async function removeReaction({ workspaceId, announcementId, userId, type }) {
  await ensureAnnouncement(announcementId, workspaceId);

  const normalizedType = normalizeReactionType(type);

  await prisma.reaction.deleteMany({
    where: {
      announcementId,
      userId,
      type: normalizedType
    }
  });

  eventBus.emit("reaction.removed", {
    workspaceId,
    announcementId,
    userId,
    type: normalizedType
  });
}

module.exports = {
  addReaction,
  removeReaction
};
