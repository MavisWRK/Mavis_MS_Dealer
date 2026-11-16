// Replace this adapter only after Qobuz grants access for streaming to a voice channel.
// A personal subscription or scraped application credentials are not a provider.
// getTrack(id) and searchTrack(query) must return normalized track details:
// { id, title, artist, duration, url, thumbnail } (or null for no search result).
// getStreamUrl(id) must fetch a fresh, authorized HTTPS audio URL at playback time.
// Set available to true only after those operations and the required access are in place.
module.exports = {
  available: false,
  async getTrack() {
    throw new Error("Qobuz streaming access has not been configured.");
  },
  async searchTrack() {
    throw new Error("Qobuz streaming access has not been configured.");
  },
  async getStreamUrl() {
    throw new Error("Qobuz streaming access has not been configured.");
  },
};
