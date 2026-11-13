module.exports = async (interaction, error) => {
  console.error("[playback] Failed:", error);
  const content = `Could not play this track: ${error.message || "unknown error"}`;
  try {
    if (interaction.replied || interaction.deferred) await interaction.editReply(content);
    else await interaction.reply({ content, ephemeral: true });
  } catch (replyError) {
    console.error("[playback] Could not report error:", replyError);
  }
};
