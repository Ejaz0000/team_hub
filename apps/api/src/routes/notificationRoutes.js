const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { listNotifications } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", requireAuth, listNotifications);

module.exports = router;
