const { PermissionsBitField } = require("discord.js");
const delay = require("delay");
const { Database } = require("st.db");

const GVoice = new Database("./settings/models/voice.json", { databaseInObject: true });

module.exports = async (client, oldState, newState) => {
  const queue = client.distube.getQueue(newState.guild.id);
  if (!queue) return;
  if (newState.id === client.user.id) {
    if (!newState.channelId) {
      console.warn(`[voice] Bot left ${newState.guild.id}; clearing queue`);
      await client.distube.voices.leave(newState.guild);
      await client.UpdateMusic(queue);
    } else if (newState.channel?.type === 13 && newState.suppress) {
      const me = newState.guild.members.me;
      if (me && newState.channel.permissionsFor(me)?.has(PermissionsBitField.Flags.Speak)) {
        await me.voice.setSuppressed(false);
      }
    }
    return;
  }
  if (!newState.guild.members.me?.voice.channelId) return;

  const db = await GVoice.get(queue.textChannel.guild.id);
  if (db.voice_enable) return;

  if (newState.guild.members.me?.voice.channelId === oldState.channelId) {
    if (
      oldState.guild.members.me.voice?.channel &&
      oldState.guild.members.me.voice.channel.members.filter((m) => !m.user.bot).size === 0
    ) {
      await delay(client.config.LEAVE_EMPTY);

      const currentQueue = client.distube.getQueue(newState.guild.id);
      const channel = newState.guild.members.me?.voice.channel;
      const humanMembers = channel?.members.filter((member) => !member.user.bot).size;
      if (currentQueue === queue && channel?.id === oldState.channelId && humanMembers === 0) {
        await client.distube.voices.leave(queue.textChannel.guild);
        await client.UpdateMusic(queue);
      }
    }
  }
};
