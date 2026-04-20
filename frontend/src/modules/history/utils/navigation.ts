export const buildResumeWorkoutHref = (workoutId?: number): string => {
  if (!workoutId) return "/profile";
  return `/workout/${workoutId}?fromHistory=1`;
};
