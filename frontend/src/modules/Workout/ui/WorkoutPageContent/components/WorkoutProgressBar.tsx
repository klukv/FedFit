import "./workout-progress-bar.css";

interface WorkoutProgressBarProps {
  completedExercisesCount: number;
  exercisesCount: number;
}

const WorkoutProgressBar = ({
  completedExercisesCount,
  exercisesCount,
}: WorkoutProgressBarProps) => (
  <div className="workout-progress-bar" role="list" aria-label="Прогресс по упражнениям">
    {Array.from({ length: exercisesCount }, (_, i) => (
      <span
        key={i}
        role="listitem"
        className={`workout-progress-bar__segment ${
          i < completedExercisesCount
            ? "workout-progress-bar__segment--done"
            : "workout-progress-bar__segment--pending"
        }`}
      />
    ))}
  </div>
);

export default WorkoutProgressBar;
