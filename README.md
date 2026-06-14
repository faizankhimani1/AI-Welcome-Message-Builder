# AI Welcome Message Builder

<p align="center">
  <strong>Template-Locked Streebo Welcome Message HTML Generator</strong><br />
  Build beautiful, production-ready chatbot welcome messages locally from storyboard input.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-purple?logo=vite" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" />
  <img alt="Local First" src="https://img.shields.io/badge/Works-100%25_Local-success" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## What Is This?

**AI Welcome Message Builder** is a local web app that converts storyboard text into **Streebo-compatible welcome message HTML** using a **strict master template**.

It is designed for teams that need speed, consistency, and safe output formatting without changing the approved welcome message structure.

---

## Why This Tool?

- Keeps your generated welcome message format consistent.
- Prevents accidental redesign of approved template layout.
- Supports dynamic business content (title, description, buttons, intents, colors).
- Works completely local (no backend, no API cost).
- Gives instant OneCompiler-style live preview.

---

## Core Capabilities

- Storyboard input by typing or paste.
- Auto-extraction of welcome title and bot description.
- Dynamic CTA button generation.
- Button count support:
  - 2
  - 4
  - 6
  - 8
  - Custom
- Streebo-compatible intent generation:
  - `onclick="Streebo.inAppChatBot.sendMessage('...')"`
- RGB color customization with auto shadow color mapping:
  - Primary: `rgba(R,G,B,1)`
  - Shadow: `rgba(R,G,B,0.15)`
- Generated HTML output panel.
- Live preview via `iframe srcDoc`.
- Copy HTML button.
- Download HTML button.

---

## Template Protection (Important)

This project follows a strict template policy.

### Locked (Never Redesigned)

- HTML structure
- Inline CSS layout
- Font family and sizing style pattern
- Border radius and spacing system
- Hover effects
- Streebo integration pattern

### Dynamic (Allowed to Change)

- Welcome title
- Description text
- Button count
- Button labels
- Button intents
- Primary RGBA color
- Shadow color from RGB + alpha 0.15

---

## How It Works

1. User pastes storyboard text.
2. Tool analyzes lines and identifies relevant context.
3. Generates:
   - welcome title
   - description
   - CTA buttons
   - intents
4. Applies dynamic values to master template.
5. Renders generated HTML.
6. Shows live preview in iframe.
7. User copies or downloads final HTML.

---

## Local Preview Streebo Mock

For local testing, preview injects:

```js
window.Streebo = {
  inAppChatBot: {
    sendMessage: function (message) {
      alert(message);
    },
  },
};
