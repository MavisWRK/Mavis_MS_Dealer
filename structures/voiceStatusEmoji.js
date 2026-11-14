const { Database } = require("st.db");

const preferences = new Database("./settings/models/voiceStatus.json", {
  databaseInObject: true,
});

async function getVoiceStatusEmoji(guild) {
  const emojiId = await preferences.get(guild.id);
  let emoji = emojiId && guild.emojis.cache.get(emojiId);
  if (emojiId && emojiId !== "default" && !emoji) {
    emoji = await guild.emojis.fetch(emojiId).catch(() => null);
  }
  return emoji?.available !== false && emoji ? emoji.toString() : "🎵";
}

async function setVoiceStatusEmoji(guildId, emojiId) {
  await preferences.set(guildId, emojiId);
}

module.exports = { getVoiceStatusEmoji, setVoiceStatusEmoji };
