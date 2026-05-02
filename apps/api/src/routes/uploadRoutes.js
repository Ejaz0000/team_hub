const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { uploadAttachment } = require("../controllers/uploadController");

const router = express.Router();

router.post("/attachments", requireAuth, upload.single("file"), uploadAttachment);

module.exports = router;
