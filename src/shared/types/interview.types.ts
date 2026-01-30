// Interview state machine states
export enum InterviewState {
  WELCOME = 'welcome',
  QUESTION_1 = 'question_1',
  QUESTION_2 = 'question_2',
  QUESTION_3 = 'question_3',
  QUESTION_4 = 'question_4',
  QUESTION_5 = 'question_5',
  CLARIFICATION = 'clarification',
  REVIEW = 'review',
  TEMPLATE_PREVIEW = 'template_preview',
  COMPLETE = 'complete',
}

// Individual interview response
export interface InterviewResponse {
  questionId: string;
  question: string;
  rawTranscript: string;
  confirmedAnswer: string;
  clarifications: string[];
  timestamp: Date;
  confidence: number; // 0-1 scale
}

// Complete interview data
export interface InterviewData {
  sessionId: string;
  responses: Map<number, InterviewResponse>;
  metadata: {
    startTime: Date;
    endTime?: Date;
    userType: string; // 'educator' | 'school_leader' | 'other'
  };
}

// Question definition
export interface Question {
  id: string;
  order: number;
  text: string;
  voicePrompt: string;
  extractionHints: string[]; // Keywords to look for in response
  clarificationPrompts: string[]; // Follow-up questions if unclear
}

// WebSocket event types
export interface InterviewEvents {
  // Client → Server
  'interview:start': () => void;
  'interview:answer': (audioBlob: Blob, transcript: string) => void;
  'interview:confirm': (questionId: string, confirmed: boolean) => void;
  'interview:edit': (questionId: string) => void;
  'interview:audio-chunk': (data: {
    questionIndex: number;
    audioChunk: ArrayBuffer;
    format: 'webm' | 'mp3' | 'wav';
    isLastChunk: boolean;
  }) => void;

  // Server → Client
  'interview:question': (data: { questionId: string; text: string; audio: ArrayBuffer }) => void;
  'interview:transcription': (data: {
    questionIndex: number;
    transcript: string | null;
    confidence: number;
    provider: 'whisper' | 'web-speech';
    language?: string;
    useFallback?: boolean;
    error?: string;
  }) => void;
  'interview:clarification': (data: { questionId: string; text: string; audio?: ArrayBuffer }) => void;
  'interview:progress': (data: { current: number; total: number }) => void;
  'interview:error': (error: { message: string; recoverable: boolean }) => void;
  'template:generated': (template: string) => void;
}
