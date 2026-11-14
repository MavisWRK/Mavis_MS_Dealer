const { ApplicationCommandOptionType, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { setVoiceStatusEmoji } = require("../../structures/voiceStatusEmoji");
const { setVoiceChannelStatus } = require("../../structures/voiceChannelStatus");

module.exports = {
  name: ["voiceemoji"],
  description: "Choose the emoji shown in the voice channel status.",
  category: "Music",
  options: [
    {
      name: "emoji",
      description: "Server emoji or Default to restore 🎵.",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ],
  run: async (client, interaction) => {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "You need the Manage Server permission to change the voice status emoji.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const selected = interaction.options.getString("emoji", true);
    let emoji = null;

    if (selected !== "default") {
      emoji = interaction.guild.emojis.cache.get(selected);
      if (!emoji) emoji = await interaction.guild.emojis.fetch(selected).catch(() => null);
      if (!emoji || emoji.guild.id !== interaction.guild.id || emoji.available === false) {
        return interaction.editReply("Choose an available emoji from this server.");
      }
    }

    await setVoiceStatusEmoji(interaction.guild.id, emoji?.id ?? "default");

    const queue = client.distube.getQueue(interaction.guild.id);
    if (queue?.songs[0]) await setVoiceChannelStatus(client, queue, queue.songs[0]);

    return interaction.editReply(`Voice channel status emoji set to ${emoji ?? "🎵"}.`);
  },
};
