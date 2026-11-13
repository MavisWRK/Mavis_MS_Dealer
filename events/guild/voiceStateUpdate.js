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

	if (oldState.guild.members.cache.get(client.user.id).voice.channelId === oldState.channelId) {
		if (oldState.guild.members.me.voice?.channel && oldState.guild.members.me.voice.channel.members.filter((m) => !m.user.bot).size === 0) {

			await delay(client.config.LEAVE_EMPTY);

			const vcMembers = oldState.guild.members.me.voice.channel?.members.size;
			if (!vcMembers || vcMembers === 1) {
				if(!queue) return;
				await client.distube.voices.leave(queue.textChannel.guild);
				await client.UpdateMusic(queue);
			}
		}
	}
}
