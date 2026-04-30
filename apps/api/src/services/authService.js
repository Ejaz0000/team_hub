const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { hashToken } = require("../utils/tokens");
const { HttpError } = require("../utils/errors");

const SALT_ROUNDS = 12;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function buildDisplayName(email, name) {
  if (name && name.trim()) {
    return name.trim();
  }

  return email.split("@")[0];
}

function toSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    activeWorkspaceId: user.activeWorkspaceId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash }
  });

  return { accessToken, refreshToken };
}

async function register({ email, password, name }) {
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  if (password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw new HttpError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: buildDisplayName(normalizedEmail, name),
      passwordHash
    }
  });

  const tokens = await issueTokens(user);

  return { user: toSafeUser(user), tokens };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const tokens = await issueTokens(user);

  return { user: toSafeUser(user), tokens };
}

async function logout({ refreshToken }) {
  if (!refreshToken) {
    return;
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    return;
  }

  await prisma.user.updateMany({
    where: { id: payload.sub },
    data: { refreshTokenHash: null }
  });
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new HttpError(401, "Unauthorized");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });

  if (!user || !user.refreshTokenHash) {
    throw new HttpError(401, "Unauthorized");
  }

  const refreshTokenHash = hashToken(refreshToken);
  if (refreshTokenHash !== user.refreshTokenHash) {
    throw new HttpError(401, "Unauthorized");
  }

  const tokens = await issueTokens(user);

  return { user: toSafeUser(user), tokens };
}

module.exports = {
  register,
  login,
  logout,
  refresh
};
