export const buildResumeWorkoutHref = (
  isCompleted: boolean,
  workoutId?: number,
  workoutHistoryId?: number,
): string => {
  if (!workoutId) return "/profile";
  const params = new URLSearchParams({
    source: "history",
    isCompleted: String(isCompleted),
  });
  if (workoutHistoryId) params.set("historyId", String(workoutHistoryId));

  return `/workout/${workoutId}?${params.toString()}`;
};
