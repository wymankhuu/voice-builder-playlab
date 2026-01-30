# Voice Builder for Playlab.ai

Voice interview app generating custom AI assistant templates. 7 questions via voice/text → Playlab.ai-ready template.

## Tech Stack
**Frontend:** React 18, TypeScript, Vite, Socket.io Client, Web Speech API, Playlab CSS
**Backend:** Node.js, Express, Socket.io, ElevenLabs (optional)
**Build:** TypeScript (client + server configs), Vite, concurrent dev servers

## Structure
```
src/
├── server/              # Backend (port 3000) - Express + Socket.io
│   ├── index.ts        # Server entry, WebSocket handlers
│   ├── api/elevenlabs.ts
│   └── services/       # interviewService, templateGenerator
├── client/             # Frontend (port 5173) - React app
│   ├── components/     # Interview/, Template/
│   └── styles/main.css
└── shared/             # Cross-boundary types & constants
    ├── types/          # interview.types, template.types
    └── constants/      # questions, models, playlabFeatures
```

**`src/server/`** WebSocket handlers, API clients, business logic
**`src/client/`** React UI for interview flow and template display
**`src/shared/`** Shared TypeScript types/constants (type-safe boundaries)

## Commands
```bash
npm run dev          # Both servers (3000 + 5173)
npm run dev:server   # Backend only
npm run dev:client   # Frontend only
npm run build        # Production build
npm run type-check   # TypeScript validation
```

## Environment
`.env` file (optional): `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
Production: `PORT`, `VITE_API_URL`, `VITE_WS_URL`

## Flow
WebSocket interview → 7 questions → voice/text answers → template generated → copy to Playlab.ai

**Key files:**
- Server: `src/server/index.ts:46-170`
- Client: `src/client/components/Interview/InterviewContainer.tsx`
- Template: `src/server/services/templateGenerator.ts:24-62`
- Questions: `src/shared/constants/questions.ts:4-110`

## Additional Documentation
- **`.claude/docs/architectural_patterns.md`** - Design patterns, conventions, extension points

## Quick Reference
- Add question: `src/shared/constants/questions.ts` + template generator
- Change models: `src/shared/constants/models.ts:6-26`
- Template format: `src/server/services/templateGenerator.ts:481-555`
- Colors: `src/client/styles/main.css:2-11`
- Events: `src/shared/types/interview.types.ts:37-59`

**Browser:** Voice input needs Chrome/Edge. Text fallback always available.
