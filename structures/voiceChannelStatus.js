const { ChannelType, PermissionsBitField, Routes } = require("discord.js");

const activeChannels = new Map();
const pendingUpdates = new Map();

function schedule(guildId, update) {
  const previous = pendingUpdates.get(guildId) || Promise.resolve();
  const next = previous
    .then(update)
    .catch((error) => {
      console.warn(`[voice] Could not update channel status in guild ${guildId}: ${error.message}`);
    })
    .finally(() => {
      if (pendingUpdates.get(guildId) === next) pendingUpdates.delete(guildId);
    });

  pendingUpdates.set(guildId, next);
  return next;
}

function setVoiceChannelStatus(client, queue, song) {
  const channel = queue.voiceChannel;
  if (!channel || channel.type !== ChannelType.GuildVoice) return Promise.resolve();

  const member = channel.guild.members.me;
  if (
    !member ||
    !channel.permissionsFor(member)?.has(PermissionsBitField.Flags.SetVoiceChannelStatus)
  ) {
    return Promise.resolve();
  }

  const guildId = channel.guild.id;
  const status = `🎵 ${song.name}`.slice(0, 500);

  return schedule(guildId, async () => {
    const previousChannelId = activeChannels.get(guildId);
    if (previousChannelId && previousChannelId !== channel.id) {
      await client.rest.put(Routes.channelVoiceStatus(previousChannelId), {
        body: { status: null },
      });
    }

    await client.rest.put(Routes.channelVoiceStatus(channel.id), { body: { status } });
    activeChannels.set(guildId, channel.id);
  });
}

function clearVoiceChannelStatus(client, queue) {
  return schedule(queue.id, async () => {
    const channelId = activeChannels.get(queue.id);
    if (!channelId) return;

    await client.rest.put(Routes.channelVoiceStatus(channelId), { body: { status: null } });
    activeChannels.delete(queue.id);
  });
}

module.exports = { setVoiceChannelStatus, clearVoiceChannelStatus };
