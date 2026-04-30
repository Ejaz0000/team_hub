const jwt = require("jsonwebtoken");
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_TTL,
  JWT_REFRESH_TTL
} = require("./env");

function assertSecrets() {
  if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets are not configured");
  }
}

function signAccessToken(payload) {
  assertSecrets();
  return jwt.sign({ ...payload, type: "access" }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_TTL
  });
}

function signRefreshToken(payload) {
  assertSecrets();
  return jwt.sign({ ...payload, type: "refresh" }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_TTL
  });
}

function verifyAccessToken(token) {
  assertSecrets();
  const payload = jwt.verify(token, JWT_ACCESS_SECRET);
  if (payload.type !== "access") {
    throw new Error("Invalid access token");
  }
  return payload;
}

function verifyRefreshToken(token) {
  assertSecrets();
  const payload = jwt.verify(token, JWT_REFRESH_SECRET);
  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return payload;
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
