import { addDays, addWeeks, subDays, subHours, subWeeks } from "date-fns";
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
        startDate: subHours(new Date(), 8),
        endDate: addWeeks(new Date(), 1),
      },
      {
        id: 2,
        resourceId: 3,
        startDate: subWeeks(new Date(), 2),
        endDate: addDays(new Date(), 1),
      },
      {
        id: 3,
        resourceId: 3,
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
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

export default { title: "Overlaps" };
