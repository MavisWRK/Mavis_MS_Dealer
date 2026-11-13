const { EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");

const GMessage = new Database("./settings/models/message.json", { databaseInObject: true });
const GSetup = new Database("./settings/models/setup.json", { databaseInObject: true });

module.exports = async (client, queue, song) => {
  const db = await GSetup.get(queue.textChannel.guild.id);
  if (db.setup_enable === true) return;

  const data = await GMessage.get(queue.textChannel.guild.id);
  const msg =
    data?.message_id && (await queue.textChannel.messages.fetch(data.message_id).catch(() => null));

  const embed = new EmbedBuilder()
    .setDescription(
      `**Queued • [${song.name || "Anonymous"}](${song.url || "https://www.github.com/Adivise"})** \`${song.formattedDuration}\` • ${song.user}`,
    )
    .setColor("#000001");

  if (msg) await msg.edit({ content: " ", embeds: [embed] });
};
