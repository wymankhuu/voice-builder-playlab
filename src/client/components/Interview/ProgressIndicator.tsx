interface ProgressIndicatorProps {
  current: number;
  total: number;
}

function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="progress-text">
        Question {current} of {total}
      </p>
    </div>
  );
}

export default ProgressIndicator;
