const BAR_LENGTH = 12;

module.exports = (song, currentTime = 0, formattedCurrentTime = "0:00", paused = false) => {
  const elapsed = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  const elapsedLabel = formattedCurrentTime || "0:00";
  const duration = Number(song.duration);

  if (song.isLive || !Number.isFinite(duration) || duration <= 0) {
    return {
      name: "🔴 Live stream",
      value: `▶️ Playing • ${elapsedLabel}`,
      inline: false,
    };
  }

  const progress = Math.min(elapsed / duration, 1);
  const filled = Math.round(progress * BAR_LENGTH);
  const bar = `${"🟩".repeat(filled)}${"⬜".repeat(BAR_LENGTH - filled)}`;

  return {
    name: `${paused ? "⏸️ Paused" : "▶️ Progress"} • ${elapsedLabel} / ${song.formattedDuration}`,
    value: `${bar}  **${Math.round(progress * 100)}%**`,
    inline: false,
  };
};
