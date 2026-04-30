const logger = require("../utils/logger");

function notFound(req, res, next) {
  res.status(404).json({ error: "Not Found" });
}

function errorHandler(err, req, res, next) {
  logger.error("Unhandled error", err);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = { notFound, errorHandler };
