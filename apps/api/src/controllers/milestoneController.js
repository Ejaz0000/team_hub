const milestoneService = require("../services/milestoneService");
const { asyncHandler } = require("../utils/errors");

const listMilestones = asyncHandler(async (req, res) => {
  const milestones = await milestoneService.listMilestones({
    workspaceId: req.workspaceId,
    goalId: req.params.goalId
  });

  res.json({ milestones });
});

const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.createMilestone({
    workspaceId: req.workspaceId,
    goalId: req.params.goalId,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    progress: req.body.progress,
    dueDate: req.body.dueDate,
    actorId: req.user.id
  });

  res.status(201).json({ milestone });
});

const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.updateMilestone({
    workspaceId: req.workspaceId,
    goalId: req.params.goalId,
    milestoneId: req.params.milestoneId,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    progress: req.body.progress,
    dueDate: req.body.dueDate,
    actorId: req.user.id
  });

  res.json({ milestone });
});

const deleteMilestone = asyncHandler(async (req, res) => {
  await milestoneService.deleteMilestone({
    workspaceId: req.workspaceId,
    goalId: req.params.goalId,
    milestoneId: req.params.milestoneId,
    actorId: req.user.id
  });

  res.status(204).send();
});

module.exports = {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
};
