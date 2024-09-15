import dayjs from "dayjs";
import {
  Scheduler,
  useSchedulerController,
  useSchedulerGestures,
} from "mantine-resource-timeline";
import { useMemo } from "react";

export function GestureControls() {
  const resources = useMemo(
    () => [...Array(5).keys()].map((resourceId) => ({ resourceId })),
    [],
  );
  const data = useMemo(
    () => [
      {
        id: 1,
        resourceId: 3,
        startDate: dayjs().subtract(8, "hours"),
        endDate: dayjs().add(1, "week"),
      },
    ],
    [],
  );

  const controller = useSchedulerController<
    (typeof data)[number],
    (typeof resources)[number]
  >({});
  useSchedulerGestures(controller);

  return (
    <Scheduler
      controller={controller}
      resources={resources}
      data={data}
      dataIdAccessor="id"
      dataResourceIdAccessor="resourceId"
      endDateAccessor="endDate"
      resourceIdAccessor="resourceId"
      startDateAccessor="startDate"
    ></Scheduler>
  );
}

export default { title: "Gesture Controls" };
