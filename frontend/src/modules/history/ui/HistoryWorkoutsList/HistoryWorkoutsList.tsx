import { HistoryService } from "../../service";
import { CarouselWorkoutsHistoryWrapper } from "../Carousel";

interface HistoryWorkoutsListProps {
  userId: number;
}

export async function HistoryWorkoutsList({ userId }: HistoryWorkoutsListProps) {
  const historyService = new HistoryService();
  const items = await historyService.getHistoryWorkouts(userId);

  if (!items.length) {
    return <p>Нет данных о тренировках</p>;
  }

  return <CarouselWorkoutsHistoryWrapper items={items} />;
}
