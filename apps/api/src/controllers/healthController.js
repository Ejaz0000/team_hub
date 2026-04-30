const { buildHealthPayload } = require("../services/healthService");

function getHealth(req, res) {
  res.json(buildHealthPayload());
}

module.exports = { getHealth };
