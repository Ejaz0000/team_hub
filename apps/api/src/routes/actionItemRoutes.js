const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireWorkspaceMember } = require("../middleware/workspaceAuth");
const {
  listActionItems,
  getActionItem,
  createActionItem,
  updateActionItem,
  deleteActionItem
} = require("../controllers/actionItemController");

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, listActionItems);
router.post("/", requireAuth, requireWorkspaceMember, createActionItem);
router.get("/:actionItemId", requireAuth, requireWorkspaceMember, getActionItem);
router.patch("/:actionItemId", requireAuth, requireWorkspaceMember, updateActionItem);
router.delete("/:actionItemId", requireAuth, requireWorkspaceMember, deleteActionItem);

module.exports = router;
