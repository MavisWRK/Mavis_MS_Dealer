const { json } = require('@distube/yt-dlp');

module.exports = async (query) => {
    if (/^https?:\/\//i.test(query)) return query;

    const result = await json(`ytsearch1:${query}`, {
        dumpSingleJson: true,
        flatPlaylist: true,
        skipDownload: true,
        noWarnings: true,
    });
    const first = result.entries?.[0];
    const url = first?.webpage_url || first?.url;
    if (!url) throw new Error(`No YouTube result found for: ${query}`);
    return /^https?:\/\//i.test(url) ? url : `https://www.youtube.com/watch?v=${url}`;
};
