const notificationService = require("../services/notificationService");
const { asyncHandler } = require("../utils/errors");

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.listNotifications({
    userId: req.user.id
  });

  res.json({ notifications });
});

module.exports = { listNotifications };
