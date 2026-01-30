/**
 * Feature flags for client-side functionality
 */

export const FEATURES = {
  // Enable Whisper speech-to-text (requires VITE_ENABLE_WHISPER env var)
  enableWhisper: import.meta.env.VITE_ENABLE_WHISPER === 'true',

  // Fallback to Web Speech API if Whisper fails
  whisperFallback: true,

  // Show transcription provider info in development mode
  showTranscriptionProvider: import.meta.env.DEV,
};
