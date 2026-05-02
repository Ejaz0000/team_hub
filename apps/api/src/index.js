const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const userRoutes = require("./routes/userRoutes");
const goalRoutes = require("./routes/goalRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const actionItemRoutes = require("./routes/actionItemRoutes");
const { createSocketServer } = require("./realtime/socketServer");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { PORT, WEB_ORIGIN } = require("./utils/env");
const logger = require("./utils/logger");

const app = express();

app.use(cors({ origin: WEB_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ service: "team-hub-api", status: "ok" });
});

app.use("/health", healthRoutes);
app.use(authRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/users", userRoutes);
app.use("/workspaces/:workspaceId/goals", goalRoutes);
app.use("/workspaces/:workspaceId/announcements", announcementRoutes);
app.use("/workspaces/:workspaceId/action-items", actionItemRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
createSocketServer(server);

server.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});
