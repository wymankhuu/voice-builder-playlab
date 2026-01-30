import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeElevenLabs, getElevenLabsClient } from './api/elevenlabs.js';
import { initializeOpenAI } from './api/openai.js';
import { initializeWhisper, transcribeAudio } from './api/whisper.js';
import { interviewService } from './services/interviewService.js';
import { templateGenerator } from './services/templateGenerator.js';
import { INTERVIEW_QUESTIONS, WELCOME_MESSAGE, COMPLETION_MESSAGE } from '../shared/constants/questions.js';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
initializeOpenAI();

// Initialize Whisper if enabled
const enableWhisper = process.env.ENABLE_WHISPER === 'true';
const whisperEnabled = enableWhisper && process.env.OPENAI_API_KEY;

if (whisperEnabled) {
  initializeWhisper();
  console.log('[Server] Whisper speech-to-text initialized');
} else {
  console.log('[Server] Whisper disabled, using browser-based speech recognition');
}

// Map to track audio chunks per session
interface AudioChunkBuffer {
  chunks: Buffer[];
  lastProcessed: Date;
}
const audioChunkBuffers = new Map<string, AudioChunkBuffer>();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize ElevenLabs if API key is provided
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID;

if (elevenLabsApiKey) {
  initializeElevenLabs(elevenLabsApiKey, elevenLabsVoiceId);
  console.log('[Server] ElevenLabs initialized');

  // Pre-generate audio for all questions
  const questionTexts = [
    WELCOME_MESSAGE,
    ...INTERVIEW_QUESTIONS.map((q) => q.voicePrompt),
    COMPLETION_MESSAGE,
  ];

  getElevenLabsClient()
    .preGenerateAudio(questionTexts)
    .then(() => {
      console.log('[Server] Question audio pre-generated and cached');
    })
    .catch((error) => {
      console.error('[Server] Failed to pre-generate audio:', error);
    });
} else {
  console.warn('[Server] ElevenLabs API key not found. Voice features will be disabled.');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  let sessionId: string | null = null;

  // Create new interview session
  socket.on('interview:start', async () => {
    try {
      const session = interviewService.createSession();
      sessionId = session.sessionId;

      socket.emit('interview:session-created', { sessionId });
      console.log(`[Socket] Session created: ${sessionId}`);

      // Send welcome message with audio
      if (elevenLabsApiKey) {
        try {
          const audioBuffer = await getElevenLabsClient().textToSpeech(WELCOME_MESSAGE);
          socket.emit('interview:welcome', {
            text: WELCOME_MESSAGE,
            audio: audioBuffer,
          });
        } catch (error) {
          console.error('[Socket] Failed to generate welcome audio:', error);
          socket.emit('interview:welcome', {
            text: WELCOME_MESSAGE,
            audio: null,
          });
        }
      } else {
        socket.emit('interview:welcome', {
          text: WELCOME_MESSAGE,
          audio: null,
        });
      }
    } catch (error) {
      console.error('[Socket] Error starting interview:', error);
      socket.emit('interview:error', {
        message: 'Failed to start interview',
        recoverable: false,
      });
    }
  });

  // Begin interview (after welcome)
  socket.on('interview:begin', async () => {
    if (!sessionId) {
      socket.emit('interview:error', { message: 'No active session', recoverable: false });
      return;
    }

    try {
      interviewService.startInterview(sessionId);
      const question = interviewService.getCurrentQuestion(sessionId);
      const progress = interviewService.getProgress(sessionId);

      // Send first question with audio
      if (elevenLabsApiKey) {
        try {
          const audioBuffer = await getElevenLabsClient().textToSpeech(question.voicePrompt);
          socket.emit('interview:question', {
            questionIndex: 0,
            questionId: question.id,
            text: question.text,
            voicePrompt: question.voicePrompt,
            audio: audioBuffer,
            progress,
          });
        } catch (error) {
          console.error('[Socket] Failed to generate question audio:', error);
          socket.emit('interview:question', {
            questionIndex: 0,
            questionId: question.id,
            text: question.text,
            voicePrompt: question.voicePrompt,
            audio: null,
            progress,
          });
        }
      } else {
        socket.emit('interview:question', {
          questionIndex: 0,
          questionId: question.id,
          text: question.text,
          voicePrompt: question.voicePrompt,
          audio: null,
          progress,
        });
      }
    } catch (error) {
      console.error('[Socket] Error beginning interview:', error);
      socket.emit('interview:error', {
        message: 'Failed to begin interview',
        recoverable: false,
      });
    }
  });

  // Save answer and move to next question
  socket.on('interview:answer', async (data: { questionIndex: number; transcript: string }) => {
    if (!sessionId) {
      socket.emit('interview:error', { message: 'No active session', recoverable: false });
      return;
    }

    try {
      const { questionIndex, transcript } = data;

      // Save the response
      interviewService.saveResponse(sessionId, questionIndex, transcript);

      // Move to next question
      const hasMore = interviewService.nextQuestion(sessionId);

      if (hasMore) {
        // Send next question
        const question = interviewService.getCurrentQuestion(sessionId);
        const progress = interviewService.getProgress(sessionId);

        if (elevenLabsApiKey) {
          try {
            const audioBuffer = await getElevenLabsClient().textToSpeech(question.voicePrompt);
            socket.emit('interview:question', {
              questionIndex: progress.current - 1,
              questionId: question.id,
              text: question.text,
              voicePrompt: question.voicePrompt,
              audio: audioBuffer,
              progress,
            });
          } catch (error) {
            console.error('[Socket] Failed to generate question audio:', error);
            socket.emit('interview:question', {
              questionIndex: progress.current - 1,
              questionId: question.id,
              text: question.text,
              voicePrompt: question.voicePrompt,
              audio: null,
              progress,
            });
          }
        } else {
          socket.emit('interview:question', {
            questionIndex: progress.current - 1,
            questionId: question.id,
            text: question.text,
            voicePrompt: question.voicePrompt,
            audio: null,
            progress,
          });
        }
      } else {
        // Interview complete - generate template
        socket.emit('interview:generating-template');

        if (elevenLabsApiKey) {
          try {
            const audioBuffer = await getElevenLabsClient().textToSpeech(COMPLETION_MESSAGE);
            socket.emit('interview:completion', {
              text: COMPLETION_MESSAGE,
              audio: audioBuffer,
            });
          } catch (error) {
            console.error('[Socket] Failed to generate completion audio:', error);
            socket.emit('interview:completion', {
              text: COMPLETION_MESSAGE,
              audio: null,
            });
          }
        } else {
          socket.emit('interview:completion', {
            text: COMPLETION_MESSAGE,
            audio: null,
          });
        }

        // Generate template
        const responses = interviewService.getAllResponses(sessionId);
        const result = await templateGenerator.generateTemplate({
          sessionId,
          responses,
        });

        if (result.success) {
          socket.emit('template:generated', {
            template: result.template,
            formattedTemplate: result.formattedTemplate,
          });
        } else {
          socket.emit('interview:error', {
            message: 'Failed to generate template: ' + result.error,
            recoverable: false,
          });
        }
      }
    } catch (error) {
      console.error('[Socket] Error processing answer:', error);
      socket.emit('interview:error', {
        message: 'Failed to process answer',
        recoverable: true,
      });
    }
  });

  // Handle audio chunk for Whisper transcription
  socket.on(
    'interview:audio-chunk',
    async (data: { questionIndex: number; audioChunk: ArrayBuffer; format: string; isLastChunk: boolean }) => {
      if (!sessionId) {
        socket.emit('interview:error', {
          message: 'No active session',
          recoverable: false,
        });
        return;
      }

      try {
        // Check if Whisper is enabled
        if (!whisperEnabled) {
          socket.emit('interview:transcription', {
            questionIndex: data.questionIndex,
            transcript: null,
            confidence: 0,
            provider: 'web-speech',
            useFallback: true,
          });
          return;
        }

        // Initialize buffer for this session if not exists
        if (!audioChunkBuffers.has(sessionId)) {
          audioChunkBuffers.set(sessionId, {
            chunks: [],
            lastProcessed: new Date(),
          });
        }

        const buffer = audioChunkBuffers.get(sessionId)!;

        // Convert ArrayBuffer to Buffer and add to chunks
        const chunk = Buffer.from(data.audioChunk);
        buffer.chunks.push(chunk);

        const now = new Date();
        const timeSinceLastProcess = now.getTime() - buffer.lastProcessed.getTime();
        const shouldProcess = data.isLastChunk || timeSinceLastProcess >= 2000;

        if (shouldProcess && buffer.chunks.length > 0) {
          // Concatenate all chunks
          const completeAudio = Buffer.concat(buffer.chunks);

          console.log(
            `[Socket] Processing ${buffer.chunks.length} audio chunks (${completeAudio.length} bytes) for question ${data.questionIndex}`
          );

          try {
            // Transcribe with Whisper
            const result = await transcribeAudio(completeAudio, data.format as 'webm' | 'mp3' | 'wav');

            // Send transcription back to client
            socket.emit('interview:transcription', {
              questionIndex: data.questionIndex,
              transcript: result.transcript,
              confidence: result.confidence,
              provider: 'whisper',
              language: result.language,
            });

            // Clear chunks and update last processed time
            buffer.chunks = [];
            buffer.lastProcessed = now;
          } catch (error: any) {
            console.error('[Socket] Whisper transcription error:', error.message);

            // Emit fallback instruction
            socket.emit('interview:transcription', {
              questionIndex: data.questionIndex,
              transcript: null,
              confidence: 0,
              provider: 'web-speech',
              useFallback: true,
              error: 'Transcription failed, using browser speech recognition',
            });

            // Clear chunks for retry
            buffer.chunks = [];
            buffer.lastProcessed = now;
          }
        }
      } catch (error) {
        console.error('[Socket] Error handling audio chunk:', error);
        socket.emit('interview:error', {
          message: 'Failed to process audio',
          recoverable: true,
        });
      }
    }
  );

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    if (sessionId) {
      // Clean up audio chunk buffer
      audioChunkBuffers.delete(sessionId);

      // Clean up session after a delay (in case user reconnects)
      setTimeout(() => {
        if (sessionId) {
          interviewService.deleteSession(sessionId);
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] WebSocket ready on ws://localhost:${PORT}`);
});
