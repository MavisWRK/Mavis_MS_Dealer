const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');
const { DeezerPlugin } = require('@distube/deezer');
const ResilientYouTubePlugin = require('./structures/ResilientYouTubePlugin');
const { DirectLinkPlugin } = require('@distube/direct-link');
const ModernYtDlpPlugin = require('./structures/ModernYtDlpPlugin');
const { AppleMusicPlugin } = require('distube-apple-music');
const { TidalPlugin } = require('distube-tidal');

class MainClient extends Client {
    constructor() {
        super({
            shards: "auto",
            allowedMentions: { parse: ["users", "roles"] },
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Channel, Partials.Message]
        });

    process.on('unhandledRejection', error => console.log(error));
    process.on('uncaughtException', error => console.log(error));

    this.config = require('./settings/config.js');
    this.owner = this.config.OWNER_ID;
    this.color = this.config.EMBED_COLOR;
    if (!this.token) this.token = this.config.TOKEN;

    const client = this;

    const ytDlpPlugin = new ModernYtDlpPlugin();
    this.distube = new DisTube(client, {
        savePreviousSongs: true,
        emitAddListWhenCreatingQueue: true,
        emitAddSongWhenCreatingQueue: true,
        plugins: [
            new TidalPlugin(),
            new AppleMusicPlugin(),
            new DirectLinkPlugin(),
            new ResilientYouTubePlugin(ytDlpPlugin),
            new SoundCloudPlugin(),
            new DeezerPlugin(),
            checkSpotify(client),
            ytDlpPlugin
        ],
    });

    ["slash"].forEach(x => client[x] = new Collection());
    ["loadCommands", "loadEvents", "loadPlayer", "loadDatabase"].forEach(x => require(`./handlers/${x}`)(client));

    }
    connect() {
        return super.login(this.token);
    };
};

module.exports = MainClient;

function checkSpotify(client) {
    if (client.config.SPOTIFY_TRACKS) {
    //    console.log("[INFO] You're (Enabled) Spotify More Tracks Support!");
        return spotifyOn(client);
    } else {
    //    console.log("[INFO] You're (Not Enabled) Spotify More Tracks Support!");
        return spotifyOff();
    }
}

function spotifyOn(client) {
    return new SpotifyPlugin({
        api: {
            clientId: client.config.SPOTIFY_ID,
            clientSecret: client.config.SPOTIFY_SECRET
        }
    })
}

function spotifyOff() {
    return new SpotifyPlugin({})
}
