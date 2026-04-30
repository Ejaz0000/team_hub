const prisma = require("../utils/prisma");
const { HttpError } = require("../utils/errors");
const { userPublicSelect } = require("../utils/selects");
const mediaService = require("./mediaService");

async function updateProfile({ userId, name, avatarUrl }) {
  const updates = {};

  if (name !== undefined) {
    if (!name || !name.trim()) {
      throw new HttpError(400, "Name cannot be empty");
    }
    updates.name = name.trim();
  }

  if (avatarUrl !== undefined) {
    updates.avatarUrl = avatarUrl || null;
  }

  if (!Object.keys(updates).length) {
    throw new HttpError(400, "No profile updates provided");
  }

  return prisma.user.update({
    where: { id: userId },
    data: updates,
    select: userPublicSelect
  });
}

async function updateAvatar({ userId, file }) {
  if (!file) {
    throw new HttpError(400, "Avatar file is required");
  }

  const avatarUrl = await mediaService.uploadAvatar(file, userId);

  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: userPublicSelect
  });
}

module.exports = {
  updateProfile,
  updateAvatar
};
