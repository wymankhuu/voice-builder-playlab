import { useState, useEffect, useRef } from 'react';
import audiowaveImg from '../../assets/audiowave.png';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  disabled?: boolean;
}

function VoiceRecorder({ onTranscriptComplete, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

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
      } else {
        setError(`Speech recognition error: ${event.error}. Please try again.`);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptComplete]);

  const startRecording = async () => {
    if (!isSupported || disabled || isRecording) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setError('');
      setTranscript('');
      transcriptRef.current = '';

      if (recognitionRef.current) {
        // Stop any existing recognition first
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
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
        setError('Speech recognition not initialized. Please refresh the page.');
      }
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
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
