const playbackLog = require("../../structures/playbackLog");
const releaseSongAudio = require("../../structures/releaseSongAudio");

module.exports = async (client, error, queue, song) => {
  releaseSongAudio(song);
  playbackLog(
    "DisTube",
    `Playback failed in guild ${queue?.id || "unknown"}, song ${song?.id || "unknown"}: ${error.message || error}`,
  );
  if (queue?.textChannel) {
    await queue.textChannel
      .send(`Playback failed: ${error.message || "unknown error"}`)
      .catch(console.error);
  }
};
