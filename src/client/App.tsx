import { useState } from 'react';
import InterviewContainer from './components/Interview/InterviewContainer';
import playlabLogo from './assets/playlab_logo.png';

type AppState = 'welcome' | 'interview' | 'complete';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');

  const handleStart = () => {
    setAppState('interview');
  };

  const handleComplete = (template: string) => {
    setGeneratedTemplate(template);
    setAppState('complete');
  };

  const handleRestart = () => {
    setAppState('welcome');
  };

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <img src={playlabLogo} alt="Playlab" className="logo-image" />
        </div>
        <p className="subtitle">Playlab Voice Assistant</p>
      </header>

      <div className="container">
        {appState === 'welcome' && (
          <div className="card">
            <div className="welcome-screen">
              <h2 className="welcome-title">Ready to get started?</h2>
              <p className="welcome-description">
                We'll ask you a series of questions to help you build your Playlab app. Click start to begin
              </p>

              <button className="btn btn-primary" onClick={handleStart}>
                ▶︎ Start
              </button>
            </div>
          </div>
        )}

        {appState === 'interview' && (
          <InterviewContainer onComplete={handleComplete} onRestart={handleRestart} />
        )}

        {appState === 'complete' && (
          <div className="card">
            <h2 style={{ color: 'var(--playlab-blue)', marginBottom: '1rem' }}>
              Your Playlab Template is Ready!
            </h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
              Copy the template below and paste it into Playlab.ai to create your custom AI assistant.
            </p>

            <div
              style={{
                background: 'var(--gray-50)',
                border: '2px solid var(--gray-300)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                maxHeight: '400px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
            >
              {generatedTemplate}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(generatedTemplate);
                  alert('Template copied to clipboard!');
                }}
              >
                📋 Copy to Clipboard
              </button>
              <button className="btn btn-secondary" onClick={handleRestart}>
                ↺ Start New Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
