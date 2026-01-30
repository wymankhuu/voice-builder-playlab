interface AudioPlayerProps {
  audioBuffer: ArrayBuffer | null;
  isPlaying: boolean;
}

function AudioPlayer({ audioBuffer, isPlaying }: AudioPlayerProps) {
  if (!audioBuffer) {
    return null;
  }

  return (
    <div className={`audio-player ${isPlaying ? 'playing' : ''}`}>
      <div className="play-pause-btn">
        {isPlaying ? '🔊' : '🔈'}
      </div>

      <div className="waveform">
        {isPlaying ? (
          <>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
            <div className="waveform-bar"></div>
          </>
        ) : (
          <span style={{ color: 'var(--gray-600)' }}>Audio ready to play</span>
        )}
      </div>
    </div>
  );
}

export default AudioPlayer;
