# Architectural Patterns

## WebSocket Communication
Event-based Socket.io: `src/server/index.ts:46-170`, `InterviewContainer.tsx:24-89`
Convention: `namespace:action` events, unique session IDs

## Service Layer (Singletons)
- Interview: `src/server/services/interviewService.ts:165`
- Templates: `src/server/services/templateGenerator.ts:557`
- APIs: `src/server/api/elevenlabs.ts`

## Shared Types
`src/shared/types/` - Single source for client/server type safety

## Graceful Degradation
`VoiceRecorder.tsx:20-70` - Web Speech API → text input fallback

## State Machine
`interview.types.ts:2-12` - Server-controlled: WELCOME → QUESTION_1-7 → COMPLETE

## Template Method
`templateGenerator.ts:24-62` - Extract → Recommend → Format markdown

## Caching
`elevenlabs.ts:12,22-40` - Map-based, pre-generate question audio

## Progressive Flow
`interviewService.ts:65-94` - Sequential questions, server tracks progress

## Extensions
- Questions: `constants/questions.ts:4-110` + template extraction
- Models: `constants/models.ts:6-26` + characteristics
- Sections: Extend `PlaylabTemplate` in `template.types.ts:29-60`

## Why
**WebSockets:** Real-time audio, bidirectional, persistent state
**Shared Types:** Prevents client/server mismatches
**Rule-Based:** Deterministic, fast (<100ms), no API costs
