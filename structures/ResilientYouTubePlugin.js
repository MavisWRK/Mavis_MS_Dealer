const { YouTubePlugin } = require("@distube/youtube");
const searchYouTube = require("./searchYouTube");

class ResilientYouTubePlugin extends YouTubePlugin {
  constructor(ytDlpPlugin) {
    super();
    this.ytDlpPlugin = ytDlpPlugin;
  }

  validate(url) {
    // Let yt-dlp resolve direct YouTube URLs. The legacy extractor is kept
    // for search results used by other DisTube plugins.
    if (/^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i.test(url)) return false;
    return super.validate(url);
  }

  async searchSong(query, options) {
    const result = await searchYouTube(query, { limit: 1 });
    if (!result.items.length) return null;
    return this.ytDlpPlugin.resolve(result.items[0].url, options);
  }

  async getStreamURL(song) {
    if (song.plugin === this.ytDlpPlugin) {
      return this.ytDlpPlugin.getStreamURL(song);
    }
    try {
      return await super.getStreamURL(song);
    } catch (youtubeError) {
      console.warn("[YouTube] Native extraction failed; trying yt-dlp:", youtubeError);
      try {
        return await this.ytDlpPlugin.getStreamURL(song);
      } catch (ytDlpError) {
        console.error("[YouTube] yt-dlp fallback failed:", ytDlpError);
        throw ytDlpError;
      }
    }
  }
}

module.exports = ResilientYouTubePlugin;
