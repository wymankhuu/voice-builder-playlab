import { useState } from 'react';
import InterviewContainer from './components/Interview/InterviewContainer';
import playlabLogo from './assets/playlab_logo.png';

type AppState = 'welcome' | 'interview' | 'complete';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');

  const handleStart = () => {
    setAppState('interview');
  };

  const handleComplete = () => {
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
      </div>
    </>
  );
}

export default App;
