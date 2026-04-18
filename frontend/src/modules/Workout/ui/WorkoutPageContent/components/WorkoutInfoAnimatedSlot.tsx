import { ReactNode } from "react";

interface WorkoutInfoAnimatedSlotProps {
  isHidden: boolean;
  children: ReactNode;
}

const WorkoutInfoAnimatedSlot = ({
  isHidden,
  children,
}: WorkoutInfoAnimatedSlotProps) => (
  <div
    className={`workout-info-animated ${isHidden ? "workout-info-animated--hidden" : "workout-info-animated--visible"}`}
  >
    {children}
  </div>
);

export default WorkoutInfoAnimatedSlot;
