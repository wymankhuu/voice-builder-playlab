import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import audiowaveImg from '../../assets/audiowave.png';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  disabled?: boolean;
  socket?: Socket | null;
  questionIndex?: number;
}

function VoiceRecorder({ onTranscriptComplete, disabled = false, socket, questionIndex = 0 }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const retryCountRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const useWhisper = useRef<boolean>(!!socket);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      // Reset retry count on successful recognition
      retryCountRef.current = 0;

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      const currentTranscript = (finalTranscript || interimTranscript).trim();
      transcriptRef.current = currentTranscript;
      setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (transcriptRef.current) {
        onTranscriptComplete(transcriptRef.current);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error, event);
      setIsRecording(false);

      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'aborted') {
        // Aborted errors can be ignored (happens when stopping manually)
        setError('');
      } else if (event.error === 'network') {
        // Network errors are common and often transient - suggest retry or text input
        if (retryCountRef.current < 2) {
          retryCountRef.current += 1;
          setError(`Connection issue. Retrying (${retryCountRef.current}/2)...`);
          // Auto-retry after a short delay
          setTimeout(() => {
            if (!isRecording && recognitionRef.current) {
              try {
                setError('');
                setIsRecording(true);
                recognitionRef.current.start();
              } catch (err) {
                console.error('Retry failed:', err);
                setError('Speech recognition unavailable. Please use text input below.');
              }
            }
          }, 1000);
        } else {
          retryCountRef.current = 0;
          setError('Speech recognition unavailable. Please use text input below or check your internet connection.');
        }
      } else {
        setError(`Speech recognition error: ${event.error}. Please try again or use text input.`);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [onTranscriptComplete]);

  const sendAudioChunk = async (blob: Blob, isLastChunk: boolean) => {
    if (!socket) return;

    try {
      const arrayBuffer = await blob.arrayBuffer();
      socket.emit('interview:audio-chunk', {
        questionIndex,
        audioChunk: arrayBuffer,
        format: 'webm',
        isLastChunk,
      });
    } catch (error) {
      console.error('Failed to send audio chunk:', error);
    }
  };

  const startRecording = async () => {
    if (!isSupported || disabled || isRecording) return;

    try {
      // Request microphone permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setError('');
      setTranscript('');
      transcriptRef.current = '';
      retryCountRef.current = 0;

      // Start Web Speech API (for interim results)
      if (recognitionRef.current) {
        // Stop any existing recognition first
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition already stopped');
        }

        // Small delay to ensure recognition is fully stopped
        setTimeout(() => {
          try {
            console.log('Starting speech recognition...');
            setIsRecording(true);
            recognitionRef.current.start();
          } catch (err: any) {
            console.error('Recognition start error:', err);
            setIsRecording(false);
            setError('Could not start recording. Please try again.');
          }
        }, 100);
      } else {
        setIsRecording(true);
      }

      // Start MediaRecorder for Whisper (if socket is available)
      if (useWhisper.current && socket) {
        try {
          // Check if MediaRecorder is supported
          if (!window.MediaRecorder) {
            console.warn('MediaRecorder not supported, using Web Speech API only');
            useWhisper.current = false;
            return;
          }

          // Check for supported mime types
          let mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              console.warn('WebM not supported, using Web Speech API only');
              useWhisper.current = false;
              return;
            }
          }

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: 16000, // 16kbps for speech
          });

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              console.log(`Audio chunk available: ${event.data.size} bytes`);
              sendAudioChunk(event.data, false);
            }
          };

          mediaRecorder.onstop = () => {
            console.log('MediaRecorder stopped');
            // Send final chunk signal
            if (mediaRecorderRef.current) {
              sendAudioChunk(new Blob([]), true);
            }
            // Stop stream tracks
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
          };

          mediaRecorder.onerror = (event: any) => {
            console.error('MediaRecorder error:', event.error);
            setError('Audio recording error. Using fallback.');
          };

          mediaRecorderRef.current = mediaRecorder;

          // Start recording with 2-second chunks
          mediaRecorder.start(2000);
          console.log('MediaRecorder started with 2s chunks');
        } catch (err) {
          console.error('MediaRecorder setup error:', err);
          console.warn('Falling back to Web Speech API only');
          useWhisper.current = false;
        }
      }
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    // Stop Web Speech API
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
  };

  if (!isSupported) {
    return (
      <div>
        <div className="error-message">{error}</div>
        <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>
          You can still type your answer below:
        </p>
        <textarea
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '1rem',
            borderRadius: '8px',
            border: '2px solid var(--gray-300)',
            fontSize: '1rem',
            fontFamily: 'inherit',
          }}
          placeholder="Type your answer here..."
          onChange={(e) => {
            setTranscript(e.target.value);
            if (e.target.value.trim()) {
              onTranscriptComplete(e.target.value.trim());
            }
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isRecording ? (
        <div className="recording-indicator-wave">
          <img src={audiowaveImg} alt="Recording" className="audiowave-icon pulsing" />
          <p className="recording-text">Recording... Speak now</p>
          <button className="btn btn-danger" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        </div>
      ) : (
        <div className="recording-start-container">
          <button
            className="btn-record-circle"
            onClick={startRecording}
            disabled={disabled}
            title={disabled ? 'Please wait for audio to finish...' : 'Click to start recording'}
          >
            <span className="mic-icon">🎤</span>
          </button>
          {disabled && (
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Please wait for audio to finish...
            </p>
          )}
        </div>
      )}

      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)', textAlign: 'center' }}>
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
          marginTop: '0.5rem',
        }}
        placeholder="Type your answer here..."
        value={transcript}
        onChange={(e) => {
          const value = e.target.value;
          transcriptRef.current = value;
          setTranscript(value);
          if (value.trim()) {
            onTranscriptComplete(value.trim());
          }
        }}
        disabled={isRecording}
      />
    </div>
  );
}

export default VoiceRecorder;
