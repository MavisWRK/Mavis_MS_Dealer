const playbackLog = require("../../structures/playbackLog");

module.exports = async (client, error, queue, song) => {
  playbackLog(
    "DisTube",
    `Error in guild ${queue?.id || "unknown"}, song ${song?.id || "unknown"}, queue length ${queue?.songs?.length ?? "unknown"}: ${error.stack || error}`,
  );
  if (queue?.textChannel) {
    await queue.textChannel
      .send(`Playback failed: ${error.message || "unknown error"}`)
      .catch(console.error);
  }
};
