const goalService = require("../services/goalService");
const { asyncHandler } = require("../utils/errors");

const listGoals = asyncHandler(async (req, res) => {
  const goals = await goalService.listGoals({ workspaceId: req.workspaceId });
  res.json({ goals });
});

const getGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoal({
    workspaceId: req.workspaceId,
    goalId: req.params.goalId
  });
  res.json({ goal });
});

const createGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal({
    workspaceId: req.workspaceId,
    userId: req.user.id,
    title: req.body.title,
    ownerId: req.body.ownerId,
    dueDate: req.body.dueDate,
    status: req.body.status,
    priority: req.body.priority,
    description: req.body.description
  });

  res.status(201).json({ goal });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.updateGoal({
    workspaceId: req.workspaceId,
    goalId: req.params.goalId,
    title: req.body.title,
    ownerId: req.body.ownerId,
    dueDate: req.body.dueDate,
    status: req.body.status,
    priority: req.body.priority,
    description: req.body.description,
    actorId: req.user.id
  });

  res.json({ goal });
});

const deleteGoal = asyncHandler(async (req, res) => {
  await goalService.deleteGoal({
    workspaceId: req.workspaceId,
    goalId: req.params.goalId,
    actorId: req.user.id
  });

  res.status(204).send();
});

module.exports = {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal
};
