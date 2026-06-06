# Human vs Bot Frontend

Angular frontend for the Human vs Bot Turing Test game.

For the production source of truth, start at the repository root:

- `../README.md`
- `../docs/GAME_RULES.md`
- `../docs/PRODUCTION_ROADMAP.md`

## Responsibilities

- Lobby and matchmaking UI.
- Chat room UI.
- Timer and message-limit display.
- Guess submission.
- Result reveal.
- Mobile support through Capacitor.

## Local Development

```bash
npm install
npm start
```

Default local URL:

```bash
http://localhost:4200
```

The frontend reads runtime settings from `public/config.js`. The committed `config.js` points at the deployed middleware:

```bash
https://humanvsbot-middleware.onrender.com
```

For local development, temporarily change `public/config.js` to:

```bash
http://localhost:3000
```

Never deploy `public/config.js` with a localhost middleware URL. A deployed browser will otherwise try to connect to the visitor's own machine and fail with `ERR_CONNECTION_REFUSED`.

## Build

```bash
npm run build
```

## Mobile Sync

```bash
npx cap sync android
```
