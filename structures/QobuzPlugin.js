const { PlayableExtractorPlugin, Song } = require("distube");

function trackIdFromUrl(input) {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.hostname !== "qobuz.com" && !url.hostname.endsWith(".qobuz.com")) return null;
    return url.pathname.match(/(?:^|\/)track\/(?:[^/]+\/)?(\d+)\/?$/i)?.[1] ?? null;
  } catch {
    return null;
  }
}

class QobuzPlugin extends PlayableExtractorPlugin {
  constructor(provider) {
    super();
    this.provider = provider;
  }

  validate(url) {
    return Boolean(trackIdFromUrl(url));
  }

  async resolve(url, options) {
    const id = trackIdFromUrl(url);
    if (!id) throw new Error("Enter a Qobuz track link.");
    return this.songFromTrack(await this.provider.getTrack(id), options);
  }

  async search(query, options) {
    const track = await this.provider.searchTrack(query);
    if (!track) throw new Error("No Qobuz track found for that search.");
    return this.songFromTrack(track, options);
  }

  songFromTrack(track, options) {
    if (!track?.id || !track?.title) throw new Error("Qobuz returned incomplete track details.");
    return new Song(
      {
        plugin: this,
        source: "qobuz",
        playFromSource: true,
        id: String(track.id),
        name: track.title,
        url: track.url || `https://open.qobuz.com/track/${track.id}`,
        thumbnail: track.thumbnail,
        duration: track.duration,
        uploader: { name: track.artist || "Qobuz" },
      },
      options,
    );
  }

  async getStreamURL(song) {
    const url = await this.provider.getStreamUrl(song.id);
    if (!/^https:\/\//i.test(url)) throw new Error("Qobuz did not return a playable HTTPS stream.");
    return url;
  }

  getRelatedSongs() {
    return [];
  }
}

module.exports = { QobuzPlugin, trackIdFromUrl };
