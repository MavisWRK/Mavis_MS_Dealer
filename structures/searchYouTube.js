const { json } = require("@distube/yt-dlp");

module.exports = async (query, { limit = 5 } = {}) => {
  const target = /^https?:\/\//i.test(query) ? query : `ytsearch${limit}:${query}`;
  const result = await json(target, {
    dumpSingleJson: true,
    flatPlaylist: true,
    skipDownload: true,
    noWarnings: true,
  });
  const entries = Array.isArray(result.entries) ? result.entries : [result];
  return {
    items: entries
      .filter(Boolean)
      .slice(0, limit)
      .map((entry) => ({
        name: entry.title || entry.fulltitle || "Unknown",
        url:
          entry.webpage_url ||
          (entry.id ? `https://www.youtube.com/watch?v=${entry.id}` : entry.url),
        author: entry.uploader || entry.channel || "Unknown",
        thumbnail: /^[\w-]{11}$/.test(entry.id || "")
          ? `https://i.ytimg.com/vi/${entry.id}/mqdefault.jpg`
          : entry.thumbnail,
      })),
  };
};
