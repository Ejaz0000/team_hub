const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireWorkspaceMember } = require("../middleware/workspaceAuth");
const {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
} = require("../controllers/milestoneController");

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, listMilestones);
router.post("/", requireAuth, requireWorkspaceMember, createMilestone);
router.patch("/:milestoneId", requireAuth, requireWorkspaceMember, updateMilestone);
router.delete("/:milestoneId", requireAuth, requireWorkspaceMember, deleteMilestone);

module.exports = router;
