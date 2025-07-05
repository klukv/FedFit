import {
  WorkoutItem,
  WorkoutItemVariants,
  WorkoutService,
} from "@/modules/workout";
import { ContainerSection } from "@/shared/ui";
import ArmsPng from "@/assets/workout/cardio_training.png";

type IProps = {
  params: Promise<{ id: string }>;
};

const Page = async ({ params }: IProps) => {
  const { id } = await params;
  const workoutService = new WorkoutService();
  const workoutsData = await workoutService.getWorkoutsById(Number(id));

  return (
    <ContainerSection
      title="Тренировки"
      styles={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}
      contentStyles={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))",
        gap: "20px",
      }}
    >
      {workoutsData.map((workout) => (
        <WorkoutItem
          key={workout.id}
          type={WorkoutItemVariants.LARGE_WITH_BUTTON}
          title={workout.name}
          buttonLink={{
            href: "123",
            title: "Перейти",
          }}
          backgroundImage={{ image: ArmsPng.src }}
        />
      ))}
    </ContainerSection>
  );
};

export default Page;
