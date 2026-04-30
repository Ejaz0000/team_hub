const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { updateProfile, uploadAvatar } = require("../controllers/userController");

const router = express.Router();

router.patch("/me", requireAuth, updateProfile);
router.post("/me/avatar", requireAuth, upload.single("file"), uploadAvatar);

module.exports = router;
