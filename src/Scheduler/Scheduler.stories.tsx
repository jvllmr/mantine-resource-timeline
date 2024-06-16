import { Grid, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useSchedulerController } from "../controller";
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

export function BasicScheduler() {
  const controller = useSchedulerController({});

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
        dataResourceIdField="resourceId"
        endDateField="endDate"
        startDateField="startDate"
        resourceIdField="id"
        controller={controller}
      />
    </Stack>
  );
}
