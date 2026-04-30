const logger = {
  info: (message) => console.log(`[info] ${message}`),
  error: (message, err) => {
    console.error(`[error] ${message}`);
    if (err) {
      console.error(err);
    }
  }
};

module.exports = logger;
