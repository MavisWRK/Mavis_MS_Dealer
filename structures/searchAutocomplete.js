const searchYouTube = require("./searchYouTube");

const cache = new Map();
const CACHE_MS = 30_000;
const RESPONSE_MS = 2_000;

module.exports = async (query) => {
  const term = query.trim();
  if (term.length < 3 || /^https?:\/\//i.test(term)) return [];

  const key = term.toLowerCase();
  const now = Date.now();
  let entry = cache.get(key);
  if (!entry || entry.expires <= now) {
    for (const [cachedKey, cachedEntry] of cache) {
      if (cachedEntry.expires <= now) cache.delete(cachedKey);
    }
    if (cache.size >= 200) cache.delete(cache.keys().next().value);

    const results = searchYouTube(term, { limit: 5 })
      .then(({ items }) =>
        items
          .filter((item) => item.url && item.url.length <= 100)
          .map((item) => ({
            name: `${item.name} — ${item.author}`.slice(0, 100),
            value: item.url,
          }))
          .filter(
            (item, index, choices) =>
              choices.findIndex((choice) => choice.value === item.value) === index,
          ),
      )
      .catch((error) => {
        console.warn(`[search] Autocomplete failed: ${error.message.split("\n")[0]}`);
        return [];
      });
    entry = { results, expires: now + CACHE_MS };
    cache.set(key, entry);
  }

  let timeout;
  try {
    return await Promise.race([
      entry.results,
      new Promise((resolve) => {
        timeout = setTimeout(() => resolve([]), RESPONSE_MS);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
};
