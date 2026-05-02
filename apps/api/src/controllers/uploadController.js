const { asyncHandler } = require("../utils/errors");
const mediaService = require("../services/mediaService");

const uploadAttachment = asyncHandler(async (req, res) => {
  const payload = await mediaService.uploadAttachment(req.file, req.user.id);
  res.status(201).json({ attachment: payload });
});

module.exports = { uploadAttachment };
