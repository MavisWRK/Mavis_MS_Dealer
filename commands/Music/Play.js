const { PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");
const { Database } = require("st.db");
const resolvePlayQuery = require("../../structures/resolvePlayQuery");

const GSetup = new Database("./settings/models/setup.json", { databaseInObject: true });

module.exports = {
  name: ["play"],
  description: "Plays a song from the source.",
  category: "Music",
  options: [
    {
      name: "search",
      type: ApplicationCommandOptionType.String,
      description: "The song to play.",
      required: true,
      autocomplete: true,
    },
  ],
  run: async (client, interaction) => {
    try {
      if (interaction.options.getString("search")) {
        const db = await GSetup.get(interaction.guild.id);
        if (db.setup_enable === true)
          return interaction.reply("Command is disable already have song request channel!");

        await interaction.reply(
          `🔍 **Searching...** \`${interaction.options.getString("search")}\``,
        );

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
          const string = await resolvePlayQuery(interaction.options.getString("search"));

          const options = {
            member: interaction.member,
            textChannel: interaction.channel,
            interaction,
          };

          await client.distube.play(interaction.member.voice.channel, string, options);
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
