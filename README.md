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

The frontend reads runtime settings from `public/config.js`. For local development the default middleware URL is:

```bash
http://localhost:3000
```

For deployment, replace `public/config.js` or generate it during hosting with the deployed middleware URL.

## Build

```bash
npm run build
```

## Mobile Sync

```bash
npx cap sync android
```
