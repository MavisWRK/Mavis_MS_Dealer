# Mavis Music Dealer

Originally created by [Nanotect (Adivise)](https://github.com/Adivise) as [DisSpaceX](https://github.com/Adivise/DisSpaceX). This fork is maintained by [MavisWRK](https://github.com/MavisWRK).

A Discord music bot that can play a song by name or URL, search YouTube with selectable results, manage a queue, apply audio filters, and show the current song in the voice channel status.

## Requirements

- Node.js 22.12 or newer
- A Discord bot token
- FFmpeg: place `ffmpeg.exe` in the project directory on Windows, or make FFmpeg available on `PATH`

The bot needs permission to connect and speak in voice channels. To show the current song in a voice channel's status, it also needs **Set Voice Channel Status** permission in that channel.

## Install and run

```bash
git clone https://github.com/MavisWRK/Mavis_MS_Dealer.git
cd Mavis_MS_Dealer
npm ci
```

Copy `.env.example` to `.env` and set your bot token and owner user ID:

```dotenv
TOKEN=YOUR_BOT_TOKEN
OWNER_ID=YOUR_DISCORD_USER_ID
EMBED_COLOR=#000001
LEAVE_EMPTY=120000
```

`LEAVE_EMPTY` is the delay in milliseconds before the bot leaves an empty voice channel. Spotify API credentials are optional; see `.env.example` for those settings.

Register slash commands after the first install or whenever command definitions change:

```bash
node deploySlash.js global
```

Start the bot yourself with `npm start`. On Windows, `Start.bat` checks the prerequisites and restarts the bot five seconds after it exits. Run `Start.bat --check` to check prerequisites without connecting to Discord. Avoid running both startup methods at the same time, since that would start two bot instances.

## Main commands

| Command | Purpose |
| --- | --- |
| `/play song:<name or URL>` | Play a song by name or link. |
| `/search browser:<song or artist>` | Browse YouTube results and choose a song. |
| `/playfile file:<attachment>` | Play an attached audio file. |
| `/nowplaying` | Show the current song. |
| `/queue` | Show the queue. |
| `/music pause`, `/music resume`, `/music skip` | Control playback. |
| `/music loop`, `/music loopqueue`, `/music autoplay` | Control repeat and autoplay. |
| `/music volume`, `/music seek`, `/music shuffle` | Adjust playback and queue order. |
| `/music 247` | Keep the bot connected to the voice channel. |
| `/voiceemoji emoji:<server emoji>` | Set the emoji used in the voice channel status. |
| `/filter reset` | Remove active audio filters. |
| `/help` | List the available commands. |

The bot also includes more queue controls, audio filters, message context commands, and a song request channel setup under `/utilities setup`.

### Voice channel status emoji

Use `/voiceemoji` to select one of the current server's custom emojis, including animated emojis. Choose **🎵 Default** to restore the original symbol. The selection applies only to that server, updates the status of a song already playing, and persists across bot restarts in `settings/models/voiceStatus.json`. If the selected emoji is removed or unavailable, the status falls back to 🎵.

Changing this setting requires the **Manage Server** permission. The JSON files in `settings/models/` are local runtime data and are excluded from Git; back them up if you move the bot to another machine.

## Supported sources

The bot includes plugins for YouTube, SoundCloud, Spotify, Deezer, Apple Music, Tidal, direct audio links, and other sites handled by yt-dlp. Source availability depends on the provider and may change over time.

## Development

Run `npm run format:check` to check formatting or `npm run format` to apply Prettier.

## Credits and license

The project is licensed under MIT; see [LICENSE](LICENSE), which retains the original 2021 Nanotect copyright notice.
