import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import VoiceRecorder from './VoiceRecorder';
import AudioPlayer from './AudioPlayer';
import ProgressIndicator from './ProgressIndicator';
import TemplatePreview from '../Template/TemplatePreview';

interface InterviewContainerProps {
  onComplete: (template: string) => void;
  onRestart: () => void;
}

type InterviewState = 'connecting' | 'welcome' | 'questioning' | 'generating' | 'complete' | 'error';

interface Question {
  questionIndex: number;
  questionId: string;
  text: string;
  voicePrompt: string;
  audio: ArrayBuffer | null;
  progress: { current: number; total: number };
}

function InterviewContainer({ onComplete, onRestart }: InterviewContainerProps) {
  const [state, setState] = useState<InterviewState>('connecting');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [transcript, setTranscript] = useState('');
  const [template, setTemplate] = useState('');
  const [error, setError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [welcomeAudio, setWelcomeAudio] = useState<ArrayBuffer | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Client] Connected to server');
      // Start interview
      socket.emit('interview:start');
    });

    socket.on('interview:session-created', (data: { sessionId: string }) => {
      sessionIdRef.current = data.sessionId;
      console.log('[Client] Session created:', data.sessionId);
    });

    socket.on('interview:welcome', (data: { text: string; audio: ArrayBuffer | null }) => {
      console.log('[Client] Received welcome message');
      // Skip welcome screen, automatically begin interview
      if (socket) {
        socket.emit('interview:begin');
      }
    });

    socket.on('interview:question', (data: Question) => {
      console.log('[Client] Received question:', data.questionIndex + 1);
      setCurrentQuestion(data);
      setState('questioning');
      setTranscript('');
      setAudioReady(false);
      setAudioFinished(false);

      if (data.audio) {
        playAudio(data.audio);
      }
    });

    socket.on('interview:completion', (data: { text: string; audio: ArrayBuffer | null }) => {
      console.log('[Client] Interview completed');
      if (data.audio) {
        playAudio(data.audio);
      }
    });

    socket.on('interview:generating-template', () => {
      console.log('[Client] Generating template...');
      setState('generating');
    });

    socket.on('template:generated', (data: { formattedTemplate: string }) => {
      console.log('[Client] Template generated');
      setTemplate(data.formattedTemplate);
      setState('complete');
      onComplete(data.formattedTemplate);
    });

    socket.on(
      'interview:transcription',
      (data: {
        questionIndex: number;
        transcript: string | null;
        confidence: number;
        provider: 'whisper' | 'web-speech';
        language?: string;
        useFallback?: boolean;
        error?: string;
      }) => {
        console.log('[Client] Received transcription:', data);

        if (data.useFallback) {
          console.log('Using Web Speech API fallback');
          return; // Web Speech already providing transcripts
        }

        if (data.transcript && currentQuestion?.questionIndex === data.questionIndex) {
          // Replace interim Web Speech transcript with Whisper result
          console.log(`[Client] Updating transcript with Whisper (confidence: ${data.confidence})`);
          setTranscript(data.transcript);
        }

        if (data.error) {
          console.warn('[Client] Transcription error:', data.error);
        }
      }
    );

    socket.on('interview:error', (data: { message: string; recoverable: boolean }) => {
      console.error('[Client] Error:', data.message);
      setError(data.message);
      setState('error');
    });

    socket.on('disconnect', () => {
      console.log('[Client] Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [onComplete]);

  const playAudio = (audioBuffer: ArrayBuffer) => {
    // Stop any currently playing audio
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    blob.arrayBuffer().then((buffer) => {
      audioContext.decodeAudioData(buffer).then((decodedData) => {
        const source = audioContext.createBufferSource();
        source.buffer = decodedData;
        source.connect(audioContext.destination);
        audioSourceRef.current = source;
        setIsPlayingAudio(true);
        setAudioFinished(false);
        setAudioReady(true);
        source.start(0);

        source.onended = () => {
          setIsPlayingAudio(false);
          setAudioFinished(true);
          audioSourceRef.current = null;
        };
      });
    });
  };

  const pauseAudio = () => {
    if (audioContextRef.current && isPlayingAudio) {
      audioContextRef.current.suspend();
      setIsPlayingAudio(false);
    }
  };

  const resumeAudio = () => {
    if (audioContextRef.current && !isPlayingAudio && audioReady && !audioFinished) {
      audioContextRef.current.resume();
      setIsPlayingAudio(true);
    }
  };

  const skipAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      setIsPlayingAudio(false);
      setAudioFinished(true);
      audioSourceRef.current = null;
    }
  };

  const handleBeginInterview = () => {
    // Play welcome audio first if available
    if (welcomeAudio && !audioReady) {
      playAudio(welcomeAudio);
    } else if (socketRef.current && audioFinished) {
      // Only emit begin after audio is finished
      socketRef.current.emit('interview:begin');
    }
  };

  const handleProceedAfterWelcome = () => {
    if (socketRef.current) {
      socketRef.current.emit('interview:begin');
    }
  };

  const handleTranscriptComplete = (transcriptText: string) => {
    setTranscript(transcriptText);
  };

  const handleConfirmAnswer = () => {
    if (socketRef.current && currentQuestion && transcript) {
      socketRef.current.emit('interview:answer', {
        questionIndex: currentQuestion.questionIndex,
        transcript,
      });
    }
  };

  const handleRetry = () => {
    setTranscript('');
  };

  if (state === 'connecting') {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="card">
        <div className="error-message">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
        <button className="btn btn-primary" onClick={onRestart}>
          Start Over
        </button>
      </div>
    );
  }

  if (state === 'welcome') {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  if (state === 'generating') {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <h3>Generating Your AI Assistant Template...</h3>
          <p>This will just take a moment</p>
        </div>
      </div>
    );
  }

  if (state === 'complete') {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>🎉 Your AI Assistant Template is Ready!</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--gray-600)' }}>
          Copy the template below and use it to create your custom AI assistant.
        </p>
        <TemplatePreview template={template} />
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={onRestart}>
            Create Another
          </button>
        </div>
      </div>
    );
  }

  // Questioning state
  return (
    <div className="card">
      {currentQuestion && (
        <>
          <ProgressIndicator
            current={currentQuestion.progress.current}
            total={currentQuestion.progress.total}
          />

          <div className="question-section">
            <h2 className="question-text">
              {currentQuestion.progress.current}. {currentQuestion.text}
            </h2>
          </div>

          {audioReady && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              {isPlayingAudio ? (
                <button className="btn btn-secondary" onClick={pauseAudio}>
                  ⏸ Pause Audio
                </button>
              ) : !audioFinished ? (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={resumeAudio}>
                    ▶️ Resume Audio
                  </button>
                  <button className="btn btn-primary" onClick={skipAudio}>
                    ⏭ Skip Audio
                  </button>
                </div>
              ) : (
                <p style={{ color: 'var(--playlab-teal)', fontWeight: 600 }}>
                  ✓ Ready to answer
                </p>
              )}
            </div>
          )}

          <div className="transcript-box">
            <div className="transcript-label">Your Answer:</div>
            {transcript ? (
              <p className="transcript-text">{transcript}</p>
            ) : (
              <p className="transcript-text transcript-empty">Speak your answer below...</p>
            )}
          </div>

          <VoiceRecorder
            onTranscriptComplete={handleTranscriptComplete}
            disabled={!audioFinished}
            socket={socketRef.current}
            questionIndex={currentQuestion.questionIndex}
          />

          {transcript && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={handleConfirmAnswer}>
                ✓ Confirm & Continue
              </button>
              <button className="btn btn-danger" onClick={handleRetry}>
                ↺ Try Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InterviewContainer;
