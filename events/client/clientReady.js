const { white, green } = require("chalk");
const { ActivityType } = require("discord.js");

module.exports = async (client) => {
  console.log(
    white("[") +
      green("INFO") +
      white("] ") +
      green(`${client.user.tag} (${client.user.id})`) +
      white(` is Ready!`),
  );

  client.user.setPresence({
    activities: [{ name: "🎧 MVS Radio • /play", type: ActivityType.Listening }],
    status: "online",
  });
};
