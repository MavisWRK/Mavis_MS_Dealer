module.exports = async (client, error, queue, song) => {
    console.error(`[DisTube] Playback error in guild ${queue?.id || 'unknown'}, song ${song?.id || 'unknown'}, queue length ${queue?.songs?.length ?? 'unknown'}:`, error);
    if (queue?.textChannel) {
        await queue.textChannel.send(`Playback failed: ${error.message || 'unknown error'}`).catch(console.error);
    }
};
