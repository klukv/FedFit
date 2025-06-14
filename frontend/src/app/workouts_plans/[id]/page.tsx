import React from "react";
import { WorkoutService } from "@/modules/workout";
import { ContainerSection } from "@/shared/ui";
import { ClientWorkoutItem } from "./ClientWorkoutItem";

type Props = {
  params: Promise<{ id: string }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  const workoutService = new WorkoutService();

  const workoutsData = await workoutService.getWorkoutsById(id);

  return (
    <ContainerSection
      title="Тренировки"
      contentStyles={{
        display: "grid",
        gridTemplateColumns: "repeat(2, auto)",
      }}
    >
      {workoutsData.map((workout) => (
        <ClientWorkoutItem key={workout.id} workout={workout} />
      ))}
    </ContainerSection>
  );
};

export default Page;
