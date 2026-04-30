const logger = require("../utils/logger");
const { HttpError } = require("../utils/errors");

function notFound(req, res, next) {
  res.status(404).json({ error: "Not Found" });
}

function errorHandler(err, req, res, next) {
  if (err && err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Internal Server Error";

  if (status >= 500) {
    logger.error("Unhandled error", err);
  }

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
