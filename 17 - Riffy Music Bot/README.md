# Riffy Music Bot with Command Handler

A Discord.js v14 music bot example that uses a lightweight command handler and [Riffy](https://npmjs.com/package/riffy) to connect to Lavalink.

## Setup

1. Copy `.env.example` to `.env` and fill in your bot token, test guild ID, and Lavalink credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the bot:
   ```bash
   npm start
   ```

Commands register automatically in the guild set with `GUILD_ID` (or globally if omitted).

## Available Commands
- `/play <query>` — search YouTube Music or play a URL/playlist.
- `/skip` — skip the current track.
- `/pause` — pause or resume playback.
- `/stop` — clear the queue and disconnect the player.
- `/queue` — view the first tracks in the queue.
- `/nowplaying` — show details about the current track.
