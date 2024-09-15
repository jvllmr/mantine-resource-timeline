import { useGesture } from "@use-gesture/react";
import { SchedulerController } from "./controller";

export const useSchedulerGestures = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: SchedulerController<any, any>,
) => {
  useGesture(
    {
      onWheel({ ctrlKey, movement: [x, y], event }) {
        if (ctrlKey) {
          event.preventDefault();

          const newStartDate = controller.viewStartDate.subtract(
            y / 420,
            controller.displayUnit,
          );

          const newEndDate = controller.viewEndDate.add(
            y / 420,
            controller.displayUnit,
          );

          if (newStartDate.isBefore(newEndDate)) {
            controller.setViewStartDate(newStartDate);
            controller.setViewEndDate(newEndDate);
          }
        }
      },
      onDrag({ ctrlKey, movement: [x] }) {
        if (ctrlKey) {
          const newStartDate = controller.viewStartDate.subtract(
            x / 420,
            controller.displayUnit,
          );

          const newEndDate = controller.viewEndDate.subtract(
            x / 420,
            controller.displayUnit,
          );

          controller.setViewStartDate(newStartDate);
          controller.setViewEndDate(newEndDate);
        }
      },
    },
    { target: controller.bodyRef, eventOptions: { passive: false } },
  );
};
