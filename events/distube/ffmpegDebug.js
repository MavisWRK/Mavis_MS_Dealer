const playbackLog = require("../../structures/playbackLog");

module.exports = (client, debug) => {
  if (!/\[ffmpeg\] log:|\[process\] (exit|error):/.test(debug)) return;
  playbackLog("FFmpeg", debug);
};
