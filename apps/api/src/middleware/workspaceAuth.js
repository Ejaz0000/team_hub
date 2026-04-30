const prisma = require("../utils/prisma");
const { HttpError, asyncHandler } = require("../utils/errors");

async function loadMembership(req) {
  const workspaceId = req.params.workspaceId || req.body.workspaceId;

  if (!workspaceId) {
    throw new HttpError(400, "Workspace id is required");
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: req.user.id,
        workspaceId
      }
    },
    include: {
      workspace: true
    }
  });

  if (!membership) {
    throw new HttpError(403, "Forbidden");
  }

  req.workspaceId = workspaceId;
  req.membership = membership;
  req.workspace = membership.workspace;
}

const requireWorkspaceMember = asyncHandler(async (req, res, next) => {
  await loadMembership(req);
  next();
});

const requireWorkspaceAdmin = asyncHandler(async (req, res, next) => {
  await loadMembership(req);

  if (req.membership.role !== "ADMIN") {
    throw new HttpError(403, "Admin access required");
  }

  next();
});

module.exports = { requireWorkspaceMember, requireWorkspaceAdmin };
