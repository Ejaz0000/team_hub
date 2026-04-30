const { verifyAccessToken } = require("../utils/jwt");
const { ACCESS_TOKEN_COOKIE } = require("../utils/env");
const { HttpError } = require("../utils/errors");

function requireAuth(req, res, next) {
  const token = req.cookies[ACCESS_TOKEN_COOKIE];

  if (!token) {
    return next(new HttpError(401, "Unauthorized"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (error) {
    return next(new HttpError(401, "Unauthorized"));
  }
}

module.exports = { requireAuth };
