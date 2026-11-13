const releaseSongAudio = require("../../structures/releaseSongAudio");

module.exports = (client, queue) => {
  for (const song of [...queue.songs, ...queue.previousSongs]) releaseSongAudio(song);
};
