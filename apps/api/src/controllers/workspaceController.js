const workspaceService = require("../services/workspaceService");
const { asyncHandler } = require("../utils/errors");

const createWorkspace = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  const workspace = await workspaceService.createWorkspace({
    userId: req.user.id,
    name,
    slug,
    description
  });

  res.status(201).json({ workspace });
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  const workspace = await workspaceService.updateWorkspace({
    workspaceId: req.params.workspaceId,
    name,
    slug,
    description
  });

  res.json({ workspace });
});

const switchWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.switchWorkspace({
    userId: req.user.id,
    workspaceId: req.workspaceId
  });

  res.json({ workspace: req.workspace });
});

module.exports = {
  createWorkspace,
  updateWorkspace,
  switchWorkspace
};
