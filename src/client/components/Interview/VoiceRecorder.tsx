import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  disabled?: boolean;
  socket?: Socket | null;
  questionIndex?: number;
}

function VoiceRecorder({ onTranscriptComplete, disabled = false, socket, questionIndex = 0 }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioFormatRef = useRef<string>('webm');

  // Listen for Whisper transcriptions
  useEffect(() => {
    if (!socket) return;

    const handleTranscription = (data: {
      questionIndex: number;
      transcript: string | null;
      confidence: number;
      provider: 'whisper' | 'web-speech';
    }) => {
      if (data.transcript && data.questionIndex === questionIndex) {
        console.log('[VoiceRecorder] Received transcription:', data.transcript);
        setTranscript(data.transcript);
        setIsProcessing(false);
        onTranscriptComplete(data.transcript);
      }
    };

    socket.on('interview:transcription', handleTranscription);
    return () => {
      socket.off('interview:transcription', handleTranscription);
    };
  }, [socket, questionIndex, onTranscriptComplete]);

  const startRecording = async () => {
    if (disabled || isRecording) return;

    setError('');
    setTranscript('');
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Detect best audio format
      let mimeType = '';
      const formats = ['audio/mp4', 'audio/mpeg', 'audio/webm;codecs=opus', 'audio/webm'];

      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          mimeType = format;
          break;
        }
      }

      if (!mimeType) {
        throw new Error('No supported audio format found');
      }

      // Set format for server
      if (mimeType.includes('mp4')) {
        audioFormatRef.current = 'mp4';
      } else if (mimeType.includes('mpeg')) {
        audioFormatRef.current = 'mp3';
      } else {
        audioFormatRef.current = 'webm';
      }

      console.log(`[VoiceRecorder] Using format: ${audioFormatRef.current}`);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 32000,
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[VoiceRecorder] Recording stopped');

        if (audioChunksRef.current.length > 0 && socket) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log(`[VoiceRecorder] Sending ${audioBlob.size} bytes`);

          setIsProcessing(true);

          try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            socket.emit('interview:audio-complete', {
              questionIndex,
              audioData: arrayBuffer,
              format: audioFormatRef.current,
            });
          } catch (err) {
            console.error('[VoiceRecorder] Failed to send audio:', err);
            setError('Failed to send recording');
            setIsProcessing(false);
          }
        }

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        audioChunksRef.current = [];
      };

      mediaRecorder.onerror = () => {
        setError('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err: any) {
      console.error('[VoiceRecorder] Error:', err);
      setError(err.message || 'Could not access microphone');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            disabled={disabled}
            title="Click to start recording"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '2px solid var(--blue-500)',
              background: 'white',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              transition: 'all 0.2s',
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = 'var(--blue-50)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        )}

        {isRecording && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--red-500)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>Recording</span>
            </div>
            <button
              onClick={stopRecording}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '6px',
                border: '1px solid var(--red-500)',
                background: 'var(--red-500)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--red-600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--red-500)';
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  background: 'white',
                  borderRadius: '2px',
                }}
              />
              Stop
            </button>
          </div>
        )}

        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--blue-500)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>Processing</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', textAlign: 'center', marginBottom: '0.5rem' }}>
          Or type your answer:
        </p>
        <textarea
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '2px solid var(--gray-300)',
            fontSize: '1rem',
            fontFamily: 'inherit',
          }}
          placeholder="Type your answer here..."
          value={transcript}
          onChange={(e) => {
            const value = e.target.value;
            setTranscript(value);
            if (value.trim()) {
              onTranscriptComplete(value.trim());
            }
          }}
          disabled={isRecording || isProcessing}
        />
      </div>
    </div>
  );
}

export default VoiceRecorder;
