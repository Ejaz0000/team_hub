const authService = require("../services/authService");
const { setAuthCookies, clearAuthCookies } = require("../utils/cookies");
const { asyncHandler } = require("../utils/errors");
const { REFRESH_TOKEN_COOKIE } = require("../utils/env");

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const { user, tokens } = await authService.register({ email, password, name });

  setAuthCookies(res, tokens);
  res.status(201).json({ user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login({ email, password });

  setAuthCookies(res, tokens);
  res.json({ user });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  await authService.logout({ refreshToken });

  clearAuthCookies(res);
  res.status(204).send();
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  const { user, tokens } = await authService.refresh({ refreshToken });

  setAuthCookies(res, tokens);
  res.json({ user });
});

module.exports = {
  register,
  login,
  logout,
  refresh
};
