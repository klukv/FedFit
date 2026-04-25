export const buildResumeWorkoutHref = (isCompleted: boolean, workoutId?: number): string => {
  if (!workoutId) return "/profile";
  return isCompleted ? `/workout/${workoutId}` : `/workout/${workoutId}?isCompleted=false`;
};
