const releaseSongAudio = require("../../structures/releaseSongAudio");

module.exports = (client, queue, song) => {
  if (queue.repeatMode !== 1) releaseSongAudio(song);
};
