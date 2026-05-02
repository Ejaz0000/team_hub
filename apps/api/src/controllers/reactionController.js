const reactionService = require("../services/reactionService");
const { asyncHandler } = require("../utils/errors");

const addReaction = asyncHandler(async (req, res) => {
  const reaction = await reactionService.addReaction({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId,
    userId: req.user.id,
    type: req.body.type
  });

  res.status(201).json({ reaction });
});

const removeReaction = asyncHandler(async (req, res) => {
  await reactionService.removeReaction({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId,
    userId: req.user.id,
    type: req.params.type
  });

  res.status(204).send();
});

module.exports = {
  addReaction,
  removeReaction
};
