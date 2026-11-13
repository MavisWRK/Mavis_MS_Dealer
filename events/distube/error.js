module.exports = async (client, error, queue) => {
    console.error('[DisTube] Playback error:', error);
    if (queue?.textChannel) {
        await queue.textChannel.send(`Playback failed: ${error.message || 'unknown error'}`).catch(console.error);
    }
};
