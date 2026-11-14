const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: ["utilities", "restart"],
  description: "Restart the bot.",
  category: "Utilities",
  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });
    if (interaction.user.id != client.owner)
      return interaction.channel.send("You not the client the owner!");

    const embed = new EmbedBuilder()
      .setDescription("**Bot is**: `Restarting...`")
      .setColor(client.color);

    await interaction.editReply({ embeds: [embed] });
    process.exit();
  },
};
