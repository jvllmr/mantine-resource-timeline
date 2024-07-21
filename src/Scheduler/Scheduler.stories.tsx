import { Grid, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useSchedulerController } from "../controller/controller";

import { SchedulerHeaderOnClickProp } from "../SchedulerHeader/SchedulerHeader";
import { onSelectFn } from "../controller/selectControls";
import { Scheduler } from "./Scheduler";
export default { title: "Basic Examples" };

const resources = [
  {
    id: "a",
    label: "Resource A",
  },
  {
    id: "b",
    label: "Resource B",
  },
  {
    id: "c",
    label: "Resource c",
  },
];

const data = [
  {
    resourceId: "b",
    startDate: dayjs().subtract(4, "days"),
    endDate: dayjs().add(5, "hours"),
  },
];

const headerOnClick: SchedulerHeaderOnClickProp = {
  day: (moment, controller) => {
    controller.setViewStartDate(
      moment.hour(9).minute(0).second(0).millisecond(0),
    );
    controller.setViewEndDate(
      moment.hour(17).minute(0).second(0).millisecond(0),
    );
  },
};

const onSelect: onSelectFn<
  (typeof data)[number],
  (typeof resources)[number]
> = ({ firstMoment, lastMoment, resource }) => {
  alert(
    `${firstMoment.toISOString()} to ${lastMoment.toISOString()} on ${resource.label} `,
  );
};

export function AdvancedScheduler() {
  const controller = useSchedulerController({ onSelect });

  return (
    <Stack>
      <Grid>
        <Grid.Col span={6}>
          <DateTimePicker
            label="Start"
            value={controller.viewStartDate.toDate()}
            onChange={(value) => {
              if (!value) return;
              controller.setViewStartDate(dayjs(value));
            }}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <DateTimePicker
            label="End"
            value={controller.viewEndDate.toDate()}
            onChange={(value) => {
              if (!value) return;
              controller.setViewEndDate(dayjs(value));
            }}
          />
        </Grid.Col>
      </Grid>
      <Scheduler
        data={data}
        resources={resources}
        width="100%"
        height="95vh"
        dataResourceIdAccessor="resourceId"
        endDateAccessor="endDate"
        startDateAccessor={(dataItem) => dataItem.startDate}
        resourceIdAccessor="id"
        controller={controller}
        headerOnClick={headerOnClick}
      />
    </Stack>
  );
}
