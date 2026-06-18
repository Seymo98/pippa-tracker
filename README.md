# Pippa Tracker

A Vite/React travel tracker for Pippa, Abi, Lily and Lucy's SE Asia trip.

## Local Development

```bash
npm install
npm run dev -- --host 127.0.0.1
```

## Photo Workflow

Raw WhatsApp uploads can be placed in `photos/`. That folder is intentionally ignored by Git. Curated, optimized images that should deploy live belong in `public/travel-photos/` and are referenced from `TRAVEL_PHOTOS` in `src/App.jsx`.

## Checks

```bash
npm run check
```

This runs lint and a production build.

## Deployment

Netlify production site:

- Site name: `girls-on-tour`
- Site id: `1c2e4465-5142-49a4-b348-6cac39eea40f`
- Live URL: `https://girls-on-tour.netlify.app`

The deploy scripts target the site id explicitly, so the project does not depend on global `NETLIFY_*` environment variables or a committed `.netlify/` folder.

Preview deploy:

```bash
npm run deploy:preview
```

Production deploy:

```bash
npm run deploy:prod
```

After deploying, verify the public URL and at least one newly added photo asset.
