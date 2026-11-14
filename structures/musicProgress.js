const BAR_LENGTH = 12;

module.exports = (song, currentTime = 0, formattedCurrentTime = "0:00", paused = false) => {
  const elapsed = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  const elapsedLabel = formattedCurrentTime || "0:00";
  const duration = Number(song.duration);
  const controls = `↻  ◁  ${paused ? "▶" : "Ⅱ"}  ▷  ↺`;

  if (song.isLive || !Number.isFinite(duration) || duration <= 0) {
    return {
      name: "Player",
      value: `${controls}\n\`${elapsedLabel}  ● LIVE\``,
      inline: false,
    };
  }

  const progress = Math.min(elapsed / duration, 1);
  const position = Math.round(progress * BAR_LENGTH);
  const bar = `${"─".repeat(position)}●${"─".repeat(BAR_LENGTH - position)}`;

  return {
    name: "Player",
    value: `${controls}\n\`${elapsedLabel}  ${bar}  ${song.formattedDuration}\``,
    inline: false,
  };
};
