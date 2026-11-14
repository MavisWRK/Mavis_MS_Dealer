const {
  PermissionsBitField,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  escapeMarkdown,
} = require("discord.js");
const { Database } = require("st.db");
const searchYouTube = require("../../structures/searchYouTube");

const GSetup = new Database("./settings/models/setup.json", { databaseInObject: true });

module.exports = {
  name: ["search"],
  description: "Search YouTube and choose a song to play.",
  category: "Music",
  options: [
    {
      name: "browser",
      type: ApplicationCommandOptionType.String,
      description: "Type a song or artist name.",
      required: true,
      autocomplete: true,
    },
  ],
  run: async (client, interaction) => {
    const query = (
      interaction.options.getString("browser") ?? interaction.options.getString("search", true)
    ).trim();
    if (!query) return interaction.reply("Type a song or artist name to search.");

    const db = await GSetup.get(interaction.guild.id);
    if (db.setup_enable === true)
      return interaction.reply("Command is disabled while the song request channel is active.");

    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply("You need to be in a voice channel.");
    const permissions = channel.permissionsFor(interaction.guild.members.me);
    if (!permissions?.has(PermissionsBitField.Flags.Connect))
      return interaction.reply(`I don't have permission to connect to ${channel.name}.`);
    if (!permissions.has(PermissionsBitField.Flags.Speak))
      return interaction.reply(`I don't have permission to speak in ${channel.name}.`);

    await interaction.deferReply();

    try {
      const { items } = await searchYouTube(query, { limit: 5 });
      if (!items.length) return interaction.editReply("No songs found. Try another search.");

      const row = new ActionRowBuilder().addComponents(
        items.map((_, index) =>
          new ButtonBuilder()
            .setCustomId(`search:${index}`)
            .setLabel(String(index + 1))
            .setStyle(ButtonStyle.Secondary),
        ),
      );

      const embeds = items.map((item, index) => {
        const embed = new EmbedBuilder()
          .setTitle(`${index + 1}. ${item.name.slice(0, 240)}`)
          .setURL(item.url)
          .setColor(client.color)
          .setDescription(`by ${escapeMarkdown(item.author.slice(0, 100))}`);
        if (item.thumbnail) embed.setThumbnail(item.thumbnail);
        return embed;
      });
      embeds[0].setFooter({ text: "Choose a number within 30 seconds" });

      const message = await interaction.editReply({
        content: null,
        embeds,
        components: [row],
      });
      const collector = message.createMessageComponentCollector({
        filter: (button) => button.user.id === interaction.user.id,
        time: 30_000,
        max: 1,
      });

      collector.on("collect", async (button) => {
        await button.deferUpdate();
        await interaction.editReply({ components: [] });

        const selected = Number(button.customId.split(":")[1]);
        const song = items[selected];
        const currentChannel = button.member.voice.channel;
        if (!song || currentChannel?.id !== channel.id) {
          await interaction.editReply("Join the same voice channel and search again.");
          return;
        }

        try {
          await client.createPlay(interaction, message.id);
          await client.distube.play(currentChannel, song.url, {
            member: button.member,
            textChannel: interaction.channel,
            interaction,
          });
        } catch (error) {
          console.error("[search] Playback failed:", error);
          await interaction.editReply(
            `Could not play this track: ${error.message || "unknown error"}`,
          );
        }
      });

      collector.on("end", (_, reason) => {
        if (reason === "time") void interaction.editReply({ components: [] }).catch(console.error);
      });
    } catch (error) {
      console.error("[search] Failed:", error);
      await interaction.editReply(`Search failed: ${error.message || "unknown error"}`);
    }
  },
};
