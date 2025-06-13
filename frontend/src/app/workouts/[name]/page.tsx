import { WorkoutService } from "@/modules/workout";
import React from "react";

type Props = {
  params: Promise<{ name: string }>;
};

const Page = async ({ params }: Props) => {
  const { name } = await params;
  const workoutService = new WorkoutService();

  const data = await workoutService.getWorkouts(name);

  return <div>Это страница с тренировками {name}</div>;
};

export default Page;
