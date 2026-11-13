const { Song, Playlist, DisTubeError } = require("distube");
const { YtDlpPlugin, json } = require("@distube/yt-dlp");

const flags = {
  dumpSingleJson: true,
  noWarnings: true,
  preferFreeFormats: true,
  skipDownload: true,
  simulate: true,
};

function makeSong(plugin, info, options) {
  return new Song(
    {
      plugin,
      source: info.extractor || "yt-dlp",
      playFromSource: true,
      id: String(info.id || info.url),
      name: info.title || info.fulltitle,
      url: info.webpage_url || info.original_url || info.url,
      isLive: Boolean(info.is_live),
      thumbnail: info.thumbnail || info.thumbnails?.[0]?.url,
      duration: info.is_live ? 0 : info.duration,
      uploader: { name: info.uploader, url: info.uploader_url },
      views: info.view_count,
      ageRestricted: Boolean(info.age_limit) && info.age_limit >= 18,
    },
    options,
  );
}

class ModernYtDlpPlugin extends YtDlpPlugin {
  async resolve(url, options) {
    const info = await json(url, flags);
    if (!Array.isArray(info.entries)) return makeSong(this, info, options);
    const songs = info.entries.filter(Boolean).map((entry) => makeSong(this, entry, options));
    if (!songs.length) throw new DisTubeError("YTDLP_ERROR", "The playlist is empty");
    return new Playlist(
      {
        source: info.extractor || "yt-dlp",
        songs,
        id: String(info.id),
        name: info.title,
        url: info.webpage_url,
        thumbnail: info.thumbnails?.[0]?.url,
      },
      options,
    );
  }

  async getStreamURL(song) {
    if (!song.url) throw new DisTubeError("YTDLP_PLUGIN_INVALID_SONG", "Missing song URL");
    const info = await json(song.url, { ...flags, format: "ba/ba*" });
    if (Array.isArray(info.entries) || !info.url) {
      throw new DisTubeError("YTDLP_ERROR", "No playable stream URL");
    }
    return info.url;
  }
}

module.exports = ModernYtDlpPlugin;
