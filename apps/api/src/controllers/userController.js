const userService = require("../services/userService");
const { asyncHandler } = require("../utils/errors");

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;
  const user = await userService.updateProfile({
    userId: req.user.id,
    name,
    avatarUrl
  });

  res.json({ user });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar({
    userId: req.user.id,
    file: req.file
  });

  res.json({ user });
});

module.exports = {
  updateProfile,
  uploadAvatar
};
