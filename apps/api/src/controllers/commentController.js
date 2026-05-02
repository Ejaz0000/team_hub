const commentService = require("../services/commentService");
const { asyncHandler } = require("../utils/errors");

const listComments = asyncHandler(async (req, res) => {
  const comments = await commentService.listComments({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId
  });

  res.json({ comments });
});

const addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment({
    workspaceId: req.workspaceId,
    announcementId: req.params.announcementId,
    authorId: req.user.id,
    body: req.body.body
  });

  res.status(201).json({ comment });
});

module.exports = {
  listComments,
  addComment
};
