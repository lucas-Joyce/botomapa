# AGENTS.md — BotoMapa

## What this is
Political / elections data visualisation. Multi-country (France, Germany,
Philippines, UK, USA). Interactive choropleth maps and hex cartograms of
voting data. Portfolio piece — code quality is the showcase.

## Stack
- Frontend: React (Vite), D3.js for maps/cartograms
- Styling: SCSS — BEM naming, CSS custom properties for theme tokens
- State: React Context (theme), localStorage for theme persistence
- Backend: Express / Node — thin static-JSON server (no DB yet; SQL later, not MongoDB)

## Structure
- client/src/pages/       route-level, one per country
- client/src/components/  persistent/reusable UI (nav, icons, credit)
- client/src/context/     React context (theme)
- server/                 Express API, separate from client

## Conventions
- SCSS: block__element--modifier. Colours/spacing via CSS custom properties,
  never hardcoded.
- One component per file, named to match the file.
- Keep D3 map-rendering logic separate from React render where practical.

## Gotchas
- Theme is localStorage-backed — don't break the theme context contract.
- Country pages share structure — a change to one's pattern likely applies
  to all. Keep them consistent.
