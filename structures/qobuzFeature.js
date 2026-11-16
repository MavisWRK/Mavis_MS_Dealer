const provider = require("./qobuzProvider");

function isQobuzAvailable(config) {
  return config.QOBUZ_ENABLED === true && provider.available === true;
}

function isCommandAvailable(command, config) {
  return command.feature !== "qobuz" || isQobuzAvailable(config);
}

module.exports = { isQobuzAvailable, isCommandAvailable };
