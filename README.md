# REX AI — responsive web assistant

A Vercel-ready Next.js web app with a dark, minimal interface, animated red Orb, responsive desktop/mobile layouts, chat history in the current browser, optional web search, browser speech input/output, image generation, and an About page.

## Deploy to Vercel

1. Extract this ZIP and upload the project to a new GitHub repository.
2. Import that repository in Vercel and keep the detected **Next.js** framework settings.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `OPENAI_API_KEY` = a **newly created** OpenAI API key
   - `OPENAI_MODEL` = `gpt-4.1` (or a model enabled for your API project)
4. Deploy. If you add/change environment variables later, redeploy.

Do not paste an API key into source code, GitHub, chat messages, or any `NEXT_PUBLIC_` variable. The key belongs only in Vercel server-side Environment Variables. The key previously pasted into chat should be revoked and replaced immediately.

## Local development

Requires Node.js 20 or later.

```bash
npm install
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000.

## Features and honest limitations

- **Chat:** calls the OpenAI Responses API from a server route. The model is selected with `OPENAI_MODEL`.
- **Web search:** optional Responses API web search tool. Availability and billing depend on the model/API project and OpenAI platform policies. It is not every tool available inside ChatGPT.
- **Image studio:** calls the OpenAI image generation API (`gpt-image-1`). Image API access, billing, and account verification may be required.
- **Voice:** uses the browser's built-in SpeechRecognition / SpeechSynthesis. Browser and language support vary; it is not continuous always-on voice.
- **Memory:** chat history is stored in this browser's localStorage. It is not cloud-synced across devices and can be cleared by clearing browser data.
- **About:** developer portrait and profile text are in `public/developer.png` and `app/page.tsx`.
- **Responsive UI:** layouts adapt for desktop, tablet and mobile screen widths.

This project does not contain a model running locally, and it does not reproduce every internal ChatGPT capability. It requires an OpenAI API key and API usage may incur charges. Never promise unlimited free usage.

## Before sharing publicly

This is a starter deployment, not a fully hardened multi-user SaaS. Add authentication, per-user quotas, server-side rate limiting (for example with Upstash Redis), abuse monitoring, privacy/terms pages, and spending limits before making it public. Vercel serverless instances do not provide a reliable in-memory global rate limiter. Do not store personal or sensitive information in chat history on shared devices.

## Project structure

- `app/page.tsx` — responsive chat UI, orb, voice, image mode, About page
- `app/globals.css` — visual design and responsive styles
- `app/api/chat/route.ts` — server-side Responses API integration + optional web search
- `app/api/image/route.ts` — server-side image generation
- `public/developer.png` — supplied developer portrait
- `.env.example` — safe environment variable template
