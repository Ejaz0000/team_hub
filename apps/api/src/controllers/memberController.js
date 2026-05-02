const memberService = require("../services/memberService");
const { asyncHandler } = require("../utils/errors");

const listMembers = asyncHandler(async (req, res) => {
  const members = await memberService.listMembers({
    workspaceId: req.workspaceId
  });

  res.json({ members });
});

const inviteMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const member = await memberService.inviteMember({
    workspaceId: req.workspaceId,
    email,
    role,
    actorId: req.user.id
  });

  res.status(201).json({ member });
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const member = await memberService.updateMemberRole({
    workspaceId: req.workspaceId,
    memberId: req.params.memberId,
    role,
    actorId: req.user.id
  });

  await memberService.postUpdateMemberRole({
    workspaceId: req.workspaceId,
    member,
    actorId: req.user.id
  });

  res.json({ member });
});

module.exports = {
  listMembers,
  inviteMember,
  updateMemberRole
};
