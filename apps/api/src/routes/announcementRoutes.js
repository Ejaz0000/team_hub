const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  requireWorkspaceMember,
  requireWorkspaceAdmin
} = require("../middleware/workspaceAuth");
const commentRoutes = require("./commentRoutes");
const reactionRoutes = require("./reactionRoutes");
const {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
  unpinAnnouncement
} = require("../controllers/announcementController");

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, listAnnouncements);
router.get("/:announcementId", requireAuth, requireWorkspaceMember, getAnnouncement);
router.post("/", requireAuth, requireWorkspaceAdmin, createAnnouncement);
router.patch("/:announcementId", requireAuth, requireWorkspaceMember, updateAnnouncement);
router.delete("/:announcementId", requireAuth, requireWorkspaceMember, deleteAnnouncement);
router.post("/:announcementId/pin", requireAuth, requireWorkspaceAdmin, pinAnnouncement);
router.post("/:announcementId/unpin", requireAuth, requireWorkspaceAdmin, unpinAnnouncement);

router.use("/:announcementId/comments", commentRoutes);
router.use("/:announcementId/reactions", reactionRoutes);

module.exports = router;
