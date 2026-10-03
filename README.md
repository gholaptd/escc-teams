# East Side Cricket Club – Team Picker

TypeScript + Vite web app for splitting the day's players into two balanced teams.

- Tick who's playing today; add guests for the day.
- Each player has a category (High performer / All rounder / Batsman). Teams are dealt category by category so both sides get a fair mix.
- Set a player to Team A / Team B to pre-assign them (e.g. captains); everyone on "Random" is shuffled in.
- Share the result to WhatsApp.

Default categories live in `src/players.ts` — edit there so they apply on every device. Changes made in the app are saved in that browser only.

## Develop

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

1. Create a public repo on GitHub (e.g. `escc-teams`) and push this folder to its `main` branch.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` deploys to `https://<your-username>.github.io/escc-teams/`.
