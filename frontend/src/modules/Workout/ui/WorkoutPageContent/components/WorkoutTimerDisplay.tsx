interface WorkoutTimerDisplayProps {
  elapsedSeconds: number;
  isVisible: boolean;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`;
};

const WorkoutTimerDisplay = ({
  elapsedSeconds,
  isVisible,
}: WorkoutTimerDisplayProps) => (
  <div
    className={`workout-timer ${isVisible ? "workout-timer--visible" : "workout-timer--hidden"}`}
    role="timer"
    aria-live="off"
  >
    <span className="workout-timer__time">{formatTime(elapsedSeconds)}</span>
  </div>
);

export default WorkoutTimerDisplay;
