import { useGesture } from "@use-gesture/react";
import { useEffect, useRef } from "react";
import { subscribeKey } from "valtio/utils";
import { SchedulerController } from "./controller";

export const useSchedulerGestures = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: SchedulerController<any, any>,
) => {
  const artificialRef = useRef(controller.bodyRef);

  useEffect(() => {
    const unsubscribe = subscribeKey(controller, "bodyRef", (value) => {
      artificialRef.current = value;
      console.log(artificialRef.current);
    });

    return () => {
      unsubscribe();
    };
  }, [controller]);

  useGesture(
    {
      // @ts-expect-error we don't need x, but unpacking is just so much more elegant
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            controller.viewStartDate = newStartDate;
            controller.viewEndDate = newEndDate;
          }
        }
      },
      onMove({ ctrlKey, pressed, delta: [x], event }) {
        if (ctrlKey && pressed) {
          event.preventDefault();
          const movement = x / 7;

          const newStartDate = controller.viewStartDate.subtract(
            movement,
            controller.displayUnit,
          );

          const newEndDate = controller.viewEndDate.subtract(
            movement,
            controller.displayUnit,
          );
          controller.viewStartDate = newStartDate;
          controller.viewEndDate = newEndDate;
        }
      },
    },
    {
      target: artificialRef,
      eventOptions: { passive: false },
      move: { threshold: 1 },
    },
  );
};
