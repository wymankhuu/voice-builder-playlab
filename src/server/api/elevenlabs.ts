import axios from 'axios';

/**
 * ElevenLabs API Client
 * Handles text-to-speech conversion using ElevenLabs API
 */
export class ElevenLabsClient {
  private apiKey: string;
  private voiceId: string;
  private baseURL = 'https://api.elevenlabs.io/v1';
  private cache: Map<string, Buffer> = new Map();

  constructor(apiKey: string, voiceId: string = 'EXAVITQu4vr4xnSDxMaL') {
    this.apiKey = apiKey;
    this.voiceId = voiceId; // Default: Bella voice
  }

  /**
   * Convert text to speech and return audio buffer
   */
  async textToSpeech(text: string, useCache: boolean = true): Promise<Buffer> {
    // Check cache first
    if (useCache && this.cache.has(text)) {
      console.log('[ElevenLabs] Using cached audio for text:', text.substring(0, 50));
      return this.cache.get(text)!;
    }

    try {
      console.log('[ElevenLabs] Generating speech for:', text.substring(0, 50));

      const response = await axios.post(
        `${this.baseURL}/text-to-speech/${this.voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 30000,
        }
      );

      const audioBuffer = Buffer.from(response.data);

      // Cache the result
      if (useCache) {
        this.cache.set(text, audioBuffer);
      }

      console.log('[ElevenLabs] Audio generated successfully');
      return audioBuffer;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[ElevenLabs] API Error:', error.response?.status, error.response?.data);
        throw new Error(`ElevenLabs API error: ${error.response?.status || 'Unknown'}`);
      }
      throw error;
    }
  }

  /**
   * Pre-generate and cache audio for multiple texts
   */
  async preGenerateAudio(texts: string[]): Promise<void> {
    console.log(`[ElevenLabs] Pre-generating ${texts.length} audio files...`);

    for (const text of texts) {
      try {
        await this.textToSpeech(text, true);
      } catch (error) {
        console.error(`[ElevenLabs] Failed to pre-generate audio for: ${text.substring(0, 50)}`, error);
      }
    }

    console.log('[ElevenLabs] Pre-generation complete');
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.data.voices;
    } catch (error) {
      console.error('[ElevenLabs] Failed to fetch voices:', error);
      return [];
    }
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ElevenLabs] Cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Singleton instance
let elevenLabsClient: ElevenLabsClient | null = null;

export function initializeElevenLabs(apiKey: string, voiceId?: string): ElevenLabsClient {
  elevenLabsClient = new ElevenLabsClient(apiKey, voiceId);
  return elevenLabsClient;
}

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsClient) {
    throw new Error('ElevenLabs client not initialized. Call initializeElevenLabs first.');
  }
  return elevenLabsClient;
}
