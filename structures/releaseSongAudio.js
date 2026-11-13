const { release } = require("./localAudioServer");

module.exports = (song) => {
  const playable = song?.stream?.song || song;
  if (!playable?.localAudioKey) return;
  release(playable.localAudioKey);
  delete playable.localAudioKey;
};
