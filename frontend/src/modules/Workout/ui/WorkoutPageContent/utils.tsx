export const drawWorkoutProgressBar = (completedExercisesCount: number, exercisesCount: number) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      {
        Array(exercisesCount).fill(0).map((v, i) => (
          <hr key={i} style={{ width: "50px", height: "2px", border: i < completedExercisesCount ? "2px solid #15ff00" : "2px solid #fff", borderRadius: "2px" }} />
        ))
      }
    </div>
  )
}