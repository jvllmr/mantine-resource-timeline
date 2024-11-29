import dayjs from "dayjs";
import { Scheduler, useSchedulerController } from "mantine-resource-timeline";
import { useMemo } from "react";

export function Overlaps() {
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
      {
        id: 2,
        resourceId: 3,
        startDate: dayjs().subtract(2, "weeks"),
        endDate: dayjs().add(1, "day"),
      },
      {
        id: 3,
        resourceId: 3,
        startDate: dayjs().subtract(1, "day"),
        endDate: dayjs().add(1, "day"),
      },
    ],
    [],
  );

  const controller = useSchedulerController<
    (typeof data)[number],
    (typeof resources)[number]
  >({ clip: true });

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
      enableGestures
    />
  );
}

export default { title: "Overlapping entries" };
