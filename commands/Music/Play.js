const { PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");
const { Database } = require("st.db");
const resolvePlayQuery = require("../../structures/resolvePlayQuery");

const GSetup = new Database("./settings/models/setup.json", { databaseInObject: true });

module.exports = {
  name: ["play"],
  description: "Play a song by name or link.",
  category: "Music",
  options: [
    {
      name: "song",
      type: ApplicationCommandOptionType.String,
      description: "Song name or music link.",
      required: true,
    },
  ],
  run: async (client, interaction) => {
    try {
      const query = interaction.options.getString("song", true).trim();
      if (!query) return interaction.reply("Type a song name or paste a link.");

      if (query) {
        const db = await GSetup.get(interaction.guild.id);
        if (db.setup_enable === true)
          return interaction.reply("Command is disable already have song request channel!");

        await interaction.reply(`🎵 **Loading...** \`${query}\``);

        const message = await interaction.fetchReply();
        await client.createPlay(interaction, message.id);

        const { channel } = interaction.member.voice;
        if (!channel) return interaction.editReply("You need to be in voice channel.");
        if (
          !channel
            .permissionsFor(interaction.guild.members.me)
            .has(PermissionsBitField.Flags.Connect)
        )
          return interaction.editReply(
            `I don't have perm \`CONNECT\` in ${channel.name} to join voice!`,
          );
        if (
          !channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Speak)
        )
          return interaction.editReply(
            `I don't have perm \`SPEAK\` in ${channel.name} to join voice!`,
          );

        try {
          const url = await resolvePlayQuery(query);
          const options = {
            member: interaction.member,
            textChannel: interaction.channel,
            interaction,
          };

          await client.distube.play(interaction.member.voice.channel, url, options);
        } catch (e) {
          console.error("[play] Playback failed:", e);
          await interaction
            .editReply(`Could not play this track: ${e.message || "unknown error"}`)
            .catch(console.error);
        }
      }
    } catch (e) {
      console.error("[play] Command failed:", e);
      const reply = `Could not start playback: ${e.message || "unknown error"}`;
      if (interaction.replied || interaction.deferred)
        await interaction.editReply(reply).catch(console.error);
      else await interaction.reply(reply).catch(console.error);
    }
  },
};
