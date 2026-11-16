const { ApplicationCommandOptionType, MessageFlags, PermissionsBitField } = require("discord.js");
const { Database } = require("st.db");
const { isQobuzAvailable } = require("../../structures/qobuzFeature");

const setup = new Database("./settings/models/setup.json", { databaseInObject: true });

module.exports = {
  name: ["qobuz"],
  description: "Play original audio from an authorized Qobuz connection.",
  category: "Music",
  feature: "qobuz",
  options: [
    {
      name: "song",
      type: ApplicationCommandOptionType.String,
      description: "Qobuz track link or song name.",
      required: true,
    },
  ],
  run: async (client, interaction) => {
    if (!isQobuzAvailable(client.config) || !client.qobuzPlugin) {
      return interaction.reply({
        content: "Qobuz playback is not available yet.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const query = interaction.options.getString("song", true).trim();
    if (!query) return interaction.reply("Enter a Qobuz track link or song name.");
    if ((await setup.get(interaction.guild.id))?.setup_enable) {
      return interaction.reply(
        "This command is unavailable while the song request channel is active.",
      );
    }

    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply("You need to be in a voice channel.");
    const permissions = channel.permissionsFor(interaction.guild.members.me);
    if (!permissions?.has(PermissionsBitField.Flags.Connect)) {
      return interaction.reply(`I cannot connect to ${channel.name}.`);
    }
    if (!permissions.has(PermissionsBitField.Flags.Speak)) {
      return interaction.reply(`I cannot speak in ${channel.name}.`);
    }

    await interaction.deferReply();
    try {
      let song = query;
      if (!/^https?:\/\//i.test(query)) {
        song = await client.qobuzPlugin.search(query, { member: interaction.member });
      } else if (!client.qobuzPlugin.validate(query)) {
        throw new Error("Enter a Qobuz track link, not a link to another site.");
      }

      await client.distube.play(channel, song, {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction,
      });
      return interaction.editReply("Added the Qobuz track to the queue.");
    } catch (error) {
      console.warn(`[qobuz] Playback failed: ${error.message}`);
      return interaction.editReply(`Could not play from Qobuz: ${error.message}`);
    }
  },
};
