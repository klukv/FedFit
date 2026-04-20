import WorkoutProgressBar from "./WorkoutProgressBar";

interface WorkoutProgressSectionProps {
  completedExercisesCount: number;
  exercisesCount: number;
}

const WorkoutProgressSection = ({
  completedExercisesCount,
  exercisesCount,
}: WorkoutProgressSectionProps) => {
  console.log(exercisesCount);
  
  return (
  <div className="workout-progress-section">
    <h1 className="workout-progress-section__title">Прогресс выполнения</h1>
    <WorkoutProgressBar
      completedExercisesCount={completedExercisesCount}
      exercisesCount={exercisesCount}
    />
  </div>
)
};

export default WorkoutProgressSection;
