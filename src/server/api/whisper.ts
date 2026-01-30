import OpenAI from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

let whisperClient: OpenAI | null = null;

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  language?: string;
}

/**
 * Initialize Whisper client
 */
export function initializeWhisper(apiKey?: string): OpenAI | null {
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (key) {
    console.log('[Whisper] Initializing client');
    whisperClient = new OpenAI({ apiKey: key });
    return whisperClient;
  } else {
    console.log('[Whisper] No API key found, Whisper will be disabled');
    return null;
  }
}

/**
 * Get Whisper client instance
 */
export function getWhisperClient(): OpenAI | null {
  return whisperClient;
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  format: 'webm' | 'mp3' | 'wav' = 'webm'
): Promise<TranscriptionResult> {
  if (!whisperClient) {
    throw new Error('Whisper client not initialized');
  }

  let tempFilePath: string | null = null;

  try {
    // Create temporary file for audio (Whisper API requires file input)
    const fileExtension = format === 'webm' ? 'webm' : format === 'mp3' ? 'mp3' : 'wav';
    tempFilePath = join(tmpdir(), `whisper-${randomUUID()}.${fileExtension}`);

    // Write audio buffer to temp file
    await writeFile(tempFilePath, audioBuffer);

    console.log(`[Whisper] Transcribing ${audioBuffer.length} bytes from ${tempFilePath}`);

    // Call Whisper API
    const transcription = await whisperClient.audio.transcriptions.create({
      file: createReadStream(tempFilePath),
      model: 'whisper-1',
      language: 'en', // Can be made configurable
      response_format: 'verbose_json', // Get confidence scores
    }, {
      timeout: 15000, // 15 second timeout
    });

    // Extract transcript and metadata
    const transcript = transcription.text || '';
    const language = transcription.language;

    // Whisper doesn't provide overall confidence, but we can use segment data if available
    // For now, we'll use a default confidence of 0.9 for successful transcriptions
    const confidence = 0.9;

    console.log(`[Whisper] Transcription complete: "${transcript.substring(0, 50)}..."`);

    return {
      transcript,
      confidence,
      language,
    };
  } catch (error: any) {
    console.error('[Whisper] Transcription failed:', error.message);

    // Handle specific error types
    if (error.status === 429) {
      throw new Error('Whisper API rate limit exceeded');
    } else if (error.status === 401) {
      throw new Error('Whisper API authentication failed');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error('Whisper API connection failed');
    } else {
      throw new Error(`Whisper API error: ${error.message}`);
    }
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log(`[Whisper] Cleaned up temp file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error('[Whisper] Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}
