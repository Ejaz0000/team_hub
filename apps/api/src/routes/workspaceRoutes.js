const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  requireWorkspaceMember,
  requireWorkspaceAdmin
} = require("../middleware/workspaceAuth");
const {
  createWorkspace,
  updateWorkspace,
  switchWorkspace
} = require("../controllers/workspaceController");
const {
  listMembers,
  inviteMember,
  updateMemberRole
} = require("../controllers/memberController");

const router = express.Router();

router.post("/", requireAuth, createWorkspace);
router.patch("/:workspaceId", requireAuth, requireWorkspaceAdmin, updateWorkspace);
router.post("/:workspaceId/switch", requireAuth, requireWorkspaceMember, switchWorkspace);

router.get("/:workspaceId/members", requireAuth, requireWorkspaceMember, listMembers);
router.post("/:workspaceId/members/invite", requireAuth, requireWorkspaceAdmin, inviteMember);
router.patch(
  "/:workspaceId/members/:memberId",
  requireAuth,
  requireWorkspaceAdmin,
  updateMemberRole
);

module.exports = router;
