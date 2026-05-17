---
name: barbearia-telas
description: Use when creating or refactoring screens for this barbershop SaaS, especially new pages, reusable components, layouts, dark theme UI, and responsive front-end patterns in Vue 3 + Quasar.
---

# Barbearia Telas

Use this skill when building future screens for the barbershop SaaS.

## What To Follow

- Keep new work aligned with the existing dark visual system.
- Prefer Quasar components already used in the app.
- Place full screens in `src/pages`.
- Extract shared UI into `src/components`.
- Put app-wide structure and navigation in `src/layouts`.
- Keep business logic out of the template when possible.

## Screen Rules

- Preserve the current dark theme as the default experience.
- Match the existing visual language: dark cards, soft borders, subtle gradients, blur where already used, and high contrast text.
- Make every new screen responsive by default.
- Design mobile first, then expand cleanly for desktop.
- Avoid fixed widths unless they are safe on small screens.

## Layout Rules

- Reuse the current app shell and drawer/navigation pattern.
- Keep page headers, actions, and content areas consistent with the existing layout.
- When a screen needs a recurring block, move it into a component instead of duplicating markup.
- Keep dialogs and modals visually aligned with the dark UI used across the app.

## Component Rules

- Prefer reusable components for forms, cards, dialogs, and action areas.
- Keep props small and focused.
- Avoid overengineering; use simple composition first.
- If a component will appear in more than one screen, isolate it early.

## Validation Checklist

- Does the screen work well on mobile?
- Does it keep the dark theme?
- Does it follow the current page, component, and layout patterns?
- Did you reuse existing Quasar patterns instead of inventing a new style?
- Is the structure clean enough for future barbershop features like agendamentos, servicos, clientes, horarios, and financeiro?

