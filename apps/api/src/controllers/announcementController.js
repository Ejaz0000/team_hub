const announcementService = require("../services/announcementService");
const { asyncHandler } = require("../utils/errors");

const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.listAnnouncements({
    workspaceId: req.workspaceId
  });

  res.json({ announcements });
});

const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.getAnnouncement({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId
  });

  res.json({ announcement });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement({
    workspaceId: req.workspaceId,
    userId: req.user.id,
    title: req.body.title,
    content: req.body.content,
    status: req.body.status,
    isPinned: req.body.isPinned
  });

  res.status(201).json({ announcement });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncement({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId,
    title: req.body.title,
    content: req.body.content,
    status: req.body.status,
    userId: req.user.id,
    isAdmin: req.membership.role === "ADMIN"
  });

  res.json({ announcement });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId,
    userId: req.user.id,
    isAdmin: req.membership.role === "ADMIN"
  });

  res.status(204).send();
});

const pinAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.setPinned({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId,
    isPinned: true,
    actorId: req.user.id
  });

  res.json({ announcement });
});

const unpinAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.setPinned({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId,
    isPinned: false,
    actorId: req.user.id
  });

  res.json({ announcement });
});

module.exports = {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
  unpinAnnouncement
};
