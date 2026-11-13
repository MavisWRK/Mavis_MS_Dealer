module.exports = (category, message) => {
  const safe = String(message)
    .replace(/https?:\/\/\S+/gi, "[URL]")
    .replace(/\s+/g, " ")
    .slice(0, 300);
  console.error(`[${category}] ${safe}`);
};
