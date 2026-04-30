function buildHealthPayload() {
  return {
    status: "ok",
    service: "team-hub-api",
    timestamp: new Date().toISOString()
  };
}

module.exports = { buildHealthPayload };
