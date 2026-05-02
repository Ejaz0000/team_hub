const { HttpError } = require("./errors");

const STATUS_VALUES = new Set(["DRAFT", "ACTIVE", "BLOCKED", "COMPLETED", "ARCHIVED"]);
const PRIORITY_VALUES = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

function normalizeStatus(value) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = String(value).toUpperCase();
  if (!STATUS_VALUES.has(normalized)) {
    throw new HttpError(400, "Invalid status");
  }

  return normalized;
}

function normalizePriority(value) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = String(value).toUpperCase();
  if (!PRIORITY_VALUES.has(normalized)) {
    throw new HttpError(400, "Invalid priority");
  }

  return normalized;
}

function normalizeProgress(value) {
  if (value === undefined) {
    return undefined;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 100) {
    throw new HttpError(400, "Progress must be between 0 and 100");
  }

  if (!Number.isInteger(numberValue)) {
    throw new HttpError(400, "Progress must be an integer");
  }

  return numberValue;
}

function parseDate(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${fieldName} is invalid`);
  }

  return date;
}

module.exports = {
  normalizeStatus,
  normalizePriority,
  normalizeProgress,
  parseDate
};
