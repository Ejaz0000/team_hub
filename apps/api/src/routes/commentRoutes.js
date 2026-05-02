const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireWorkspaceMember } = require("../middleware/workspaceAuth");
const { listComments, addComment } = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, listComments);
router.post("/", requireAuth, requireWorkspaceMember, addComment);

module.exports = router;
