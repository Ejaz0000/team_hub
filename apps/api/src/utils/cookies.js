const {
  NODE_ENV,
  JWT_ACCESS_TTL,
  JWT_REFRESH_TTL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE
} = require("./env");

const isProd = NODE_ENV === "production";

function parseDurationToMs(value) {
  if (!value) {
    return undefined;
  }

  const match = value.toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * multipliers[unit];
}

function buildCookieOptions(maxAge) {
  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/"
  };

  if (Number.isFinite(maxAge)) {
    options.maxAge = maxAge;
  }

  return options;
}

const accessMaxAge = parseDurationToMs(JWT_ACCESS_TTL);
const refreshMaxAge = parseDurationToMs(JWT_REFRESH_TTL);

function setAuthCookies(res, tokens) {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, buildCookieOptions(accessMaxAge));
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, buildCookieOptions(refreshMaxAge));
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, buildCookieOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, buildCookieOptions());
}

module.exports = { setAuthCookies, clearAuthCookies };
