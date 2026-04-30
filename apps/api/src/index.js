const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const healthRoutes = require("./routes/healthRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { PORT } = require("./utils/env");
const logger = require("./utils/logger");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ service: "team-hub-api", status: "ok" });
});

app.use("/health", healthRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});
