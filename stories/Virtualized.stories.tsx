import dayjs from "dayjs";
import { Scheduler, useSchedulerController } from "mantine-resource-timeline";
import { useMemo } from "react";

export function Virtualized() {
  const resources = useMemo(
    () => [...Array(10_000).keys()].map((resourceId) => ({ resourceId })),
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
  >({ clip: true });

  return (
    <Scheduler
      controller={controller}
      data={data}
      resources={resources}
      dataIdAccessor="id"
      dataResourceIdAccessor="resourceId"
      endDateAccessor="endDate"
      resourceIdAccessor="resourceId"
      startDateAccessor="startDate"
      width="100%"
      enableVirtualizer
      stickyHeader
      stickyHeaderOffset={0}
    />
  );
}
export default { title: "Virtualized" };
