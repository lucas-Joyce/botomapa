@~/.config/opencode/AGENTS.md

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

## Task completion
- Any task with 2+ steps: create a todo list before starting.
- After finishing AND verifying each item, immediately call todowrite to
  mark it `completed`. Do not batch completion to the end.
- Keep working through all pending items without waiting for confirmation.
  Stop only when every item is `completed`, or genuinely blocked — then keep
  it `in_progress` and add a follow-up todo naming the blocker.
- When the whole task is done, tick the matching checkbox in ROADMAP.md to [x].
