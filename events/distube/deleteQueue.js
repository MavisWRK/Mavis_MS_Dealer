const releaseSongAudio = require("../../structures/releaseSongAudio");
const { clearVoiceChannelStatus } = require("../../structures/voiceChannelStatus");

module.exports = (client, queue) => {
  void clearVoiceChannelStatus(client, queue);
  for (const song of [...queue.songs, ...queue.previousSongs]) releaseSongAudio(song);
};
