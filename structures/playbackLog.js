const fs = require("fs");
const path = require("path");

const logDirectory = path.resolve(__dirname, "..", "logs");
const logFile = path.join(logDirectory, "playback.log");

module.exports = (category, message) => {
  const safe = String(message)
    .replace(/https?:\/\/\S+/gi, "[stream URL]")
    .slice(0, 2000);
  const line = `${new Date().toISOString()} [${category}] ${safe}\n`;
  console.log(line.trimEnd());
  try {
    fs.mkdirSync(logDirectory, { recursive: true });
    fs.appendFileSync(logFile, line);
  } catch (error) {
    console.error("[playbackLog] Could not write log:", error);
  }
};
