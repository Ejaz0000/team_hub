const actionItemService = require("../services/actionItemService");
const { asyncHandler } = require("../utils/errors");

const listActionItems = asyncHandler(async (req, res) => {
  const items = await actionItemService.listActionItems({
    workspaceId: req.workspaceId
  });

  res.json({ actionItems: items });
});

const getActionItem = asyncHandler(async (req, res) => {
  const actionItem = await actionItemService.getActionItem({
    workspaceId: req.workspaceId,
    actionItemId: req.params.actionItemId
  });

  res.json({ actionItem });
});

const createActionItem = asyncHandler(async (req, res) => {
  const actionItem = await actionItemService.createActionItem({
    workspaceId: req.workspaceId,
    userId: req.user.id,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    dueDate: req.body.dueDate,
    assigneeId: req.body.assigneeId,
    goalId: req.body.goalId
  });

  res.status(201).json({ actionItem });
});

const updateActionItem = asyncHandler(async (req, res) => {
  const actionItem = await actionItemService.updateActionItem({
    workspaceId: req.workspaceId,
    actionItemId: req.params.actionItemId,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    dueDate: req.body.dueDate,
    assigneeId: req.body.assigneeId,
    goalId: req.body.goalId,
    actorId: req.user.id
  });

  res.json({ actionItem });
});

const deleteActionItem = asyncHandler(async (req, res) => {
  await actionItemService.deleteActionItem({
    workspaceId: req.workspaceId,
    actionItemId: req.params.actionItemId,
    actorId: req.user.id
  });

  res.status(204).send();
});

module.exports = {
  listActionItems,
  getActionItem,
  createActionItem,
  updateActionItem,
  deleteActionItem
};
