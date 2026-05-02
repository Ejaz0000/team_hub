const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireWorkspaceMember } = require("../middleware/workspaceAuth");
const { addReaction, removeReaction } = require("../controllers/reactionController");

const router = express.Router({ mergeParams: true });

router.post("/", requireAuth, requireWorkspaceMember, addReaction);
router.delete("/:type", requireAuth, requireWorkspaceMember, removeReaction);

module.exports = router;
