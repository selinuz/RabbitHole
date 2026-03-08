# 🐇 RabbitHole

> *A guide for navigating difficult conversations.*

RabbitHole is a reflective, AI-powered web app that helps you prepare for challenging conversations — not by writing scripts, but by helping you think. It walks you through four evidence-based pillars so you show up grounded, empathetic, and clear.

---

## How it works

RabbitHole guides you through a structured 4-stage process before you ever say a word:

| Stage | Pillar | What happens |
|-------|--------|--------------|
| **0** | Entry | You describe the situation — by typing or speaking aloud. The AI listens and identifies what it already understands. |
| **1** | Preparation | Smart follow-up questions fill in the gaps: area of life, how you're feeling, your position, what matters. |
| **2** | Mapping the Situation | The AI surfaces the core tension and prompts you to define your goal and desired outcome. |
| **3** | Open with Empathy | Perspective flip-cards help you see through the other person's eyes. You pick a tone and emotional intentions. |
| **4** | Phrasing & Rehearsal | Your instinct phrase gets rewritten into three science-backed templates (I-statements, Gottman-style, collaborative framing) with fill-in-the-blank blanks you complete in your own words. |
| **5** | Conversation Compass | A summary of everything you've built — your bases, your opener, a space to reflect after the conversation. |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React + Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js + Express (local dev), Vercel serverless functions (production) |
| **AI** | Google Gemini 2.5 Flash via `@google/generative-ai` |
| **Speech** | Web Speech API (browser-native) |
| **Fonts** | Fraunces (headings), Figtree (UI elements) |
| **Deploy** | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API key

### Setup

```bash
# Install all dependencies
make install

# Add your API key
echo "GEMINI_API_KEY=your_key_here" > server/.env
```

### Running locally

```bash
# Run frontend + backend together
make dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001](http://localhost:3001)

### Other commands

```bash
make client    # Run only the frontend
make server    # Run only the backend
make build     # Build the frontend for production
```

---

## Deployment (Vercel)

The project is configured for Vercel with `vercel.json`. The serverless API lives in `/api/facilitator.js`.

Set `GEMINI_API_KEY` as an environment variable in your Vercel project settings.

---

## API Endpoints

All requests go to `POST /api/facilitator` with a `stage` and `message` in the body.

| `stage` | What it does |
|---------|-------------|
| `ack` | Warmly acknowledges the user's initial situation |
| `analyze` | Infers life area, feeling, timeline, and importance from the user's text |
| `core_issue` | Extracts the core tension in 1–2 sentences |
| `perspectives` | Generates 3 empathy flip-cards from the other person's point of view |
| `rewrite` | Rewrites the user's instinct phrase as 3 science-backed fill-in-the-blank templates |

---

## Design Principles

- **No scripts.** The AI never tells you what to say. It gives you templates with blanks you fill in yourself.
- **Evidence-based.** Inspired by Gottman Method principles and Nonviolent Communication (NVC).
- **Private by design.** Nothing is stored. Each session lives only in your browser.
- **Reflective, not prescriptive.** The app asks questions, not advice.