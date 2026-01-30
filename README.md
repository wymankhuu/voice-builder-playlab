# Voice Builder for Playlab.ai

A voice-based interview application that helps educators and school leaders create custom AI assistant templates through natural conversation. Built with React, TypeScript, Express, Socket.io, and ElevenLabs API.

![Playlab Colors](https://img.shields.io/badge/Playlab-Powered-00BFA5?style=for-the-badge)

## Features

- 🎤 **Voice-First Experience**: Natural voice conversations using Web Speech API and ElevenLabs
- 🎨 **Beautiful UI**: Designed with Playlab's vibrant color palette
- ⚡ **Real-Time**: WebSocket-powered for instant communication
- 🤖 **AI-Powered**: Intelligent template generation with model recommendations
- 📱 **Responsive**: Works on desktop and mobile browsers
- 🔄 **Fallback Support**: Text input available if voice isn't supported

## Quick Start

### Prerequisites

- Node.js 18+ installed
- ElevenLabs API key (optional, for voice output)
- Modern browser with Web Speech API support (Chrome, Edge recommended)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   ```env
   # Optional: Add your ElevenLabs API key for voice output
   ELEVENLABS_API_KEY=your_api_key_here
   ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL

   # Server configuration
   PORT=3000
   NODE_ENV=development

   # Client configuration (already set)
   VITE_API_URL=http://localhost:3000
   VITE_WS_URL=ws://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   This runs both the backend server (port 3000) and frontend dev server (port 5173) concurrently.

5. **Open your browser:**
   ```
   http://localhost:5173
   ```

## Usage

### For Users

1. **Start Interview**: Click "Start Voice Interview" on the welcome screen
2. **Answer Questions**: Respond to 5 questions using your voice or typing
3. **Review Answers**: Confirm each answer or retry if needed
4. **Get Template**: Receive a complete AI assistant template customized to your needs
5. **Copy & Use**: Copy the template and use it in Playlab.ai

### For Developers

#### Project Structure

```
Voice Builder/
├── src/
│   ├── server/              # Backend (Express + Socket.io)
│   │   ├── api/
│   │   │   └── elevenlabs.ts
│   │   ├── services/
│   │   │   ├── interviewService.ts
│   │   │   └── templateGenerator.ts
│   │   └── index.ts
│   │
│   ├── client/              # Frontend (React + TypeScript)
│   │   ├── components/
│   │   │   ├── Interview/
│   │   │   │   ├── InterviewContainer.tsx
│   │   │   │   ├── VoiceRecorder.tsx
│   │   │   │   ├── AudioPlayer.tsx
│   │   │   │   └── ProgressIndicator.tsx
│   │   │   └── Template/
│   │   │       └── TemplatePreview.tsx
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.html
│   │
│   └── shared/              # Shared types and constants
│       ├── types/
│       │   ├── interview.types.ts
│       │   └── template.types.ts
│       └── constants/
│           ├── questions.ts
│           ├── models.ts
│           └── playlabFeatures.ts
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

#### Key Components

**Server:**
- `elevenlabs.ts`: ElevenLabs API integration for text-to-speech
- `interviewService.ts`: Manages interview sessions and state
- `templateGenerator.ts`: Transforms responses into Playlab.ai templates

**Client:**
- `InterviewContainer.tsx`: Main interview flow orchestration
- `VoiceRecorder.tsx`: Voice input with Web Speech API
- `AudioPlayer.tsx`: Displays audio playback status
- `TemplatePreview.tsx`: Renders and copies generated template

#### WebSocket Events

**Client → Server:**
- `interview:start` - Create new session
- `interview:begin` - Start the interview
- `interview:answer` - Submit answer for current question

**Server → Client:**
- `interview:session-created` - Session ID assigned
- `interview:welcome` - Welcome message
- `interview:question` - Next question with audio
- `interview:completion` - Interview complete message
- `template:generated` - Final template ready

## Configuration

### ElevenLabs Voice Settings

Edit `src/server/api/elevenlabs.ts` to customize voice settings:

```typescript
voice_settings: {
  stability: 0.5,        // 0-1: Lower = more expressive
  similarity_boost: 0.75 // 0-1: Higher = more consistent
}
```

### Interview Questions

Modify questions in `src/shared/constants/questions.ts`:

```typescript
export const INTERVIEW_QUESTIONS: Question[] = [
  {
    id: 'q1_role_expertise',
    order: 1,
    text: 'What role or expertise should your AI assistant have?',
    voicePrompt: '...',
    // ...
  },
  // Add more questions
];
```

### AI Model Selection

The template generator automatically recommends models based on:
- Workflow complexity (simple → Haiku, complex → Opus)
- Reasoning requirements (problem-solving → Reasoning models)
- Educational focus (prioritizes Claude models for safety)

Customize logic in `src/server/services/templateGenerator.ts`.

## Customization

### Adding New Color Schemes

The app uses Playlab's color palette defined in CSS variables:

```css
:root {
  --playlab-teal: #00BFA5;
  --playlab-orange: #FF6B35;
  --playlab-red: #E63946;
  --playlab-blue: #1E88E5;
  --playlab-magenta: #D81B60;
}
```

Edit `src/client/styles/main.css` to customize colors.

### Extending Template Generation

Add custom sections to templates in `templateGenerator.ts`:

```typescript
private generateCustomSection(answer: string) {
  // Your custom logic
  return {
    customField: extractedData,
  };
}
```

## Troubleshooting

### Voice Input Not Working

- **Issue**: Microphone not detected
- **Solution**:
  - Use Chrome or Edge browser
  - Allow microphone permissions when prompted
  - Check browser console for errors
  - Use text input as fallback

### ElevenLabs API Errors

- **Issue**: Voice output fails
- **Solution**:
  - Verify API key in `.env`
  - Check ElevenLabs quota at [elevenlabs.io](https://elevenlabs.io)
  - App works without voice output (questions show as text)

### Port Already in Use

- **Issue**: Port 3000 or 5173 already in use
- **Solution**:
  - Change `PORT` in `.env` for backend
  - Change `server.port` in `vite.config.ts` for frontend
  - Update `VITE_API_URL` and `VITE_WS_URL` accordingly

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, Socket.io Client
- **Backend**: Express, Socket.io, Node.js
- **Voice**: Web Speech API (STT), ElevenLabs API (TTS)
- **Styling**: Custom CSS with Playlab color palette
- **State Management**: React Hooks, Zustand (optional)

## License

MIT

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Verify environment variables are set correctly

---

Built with ❤️ for educators and school leaders
