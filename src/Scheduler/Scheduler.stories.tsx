import { alpha, Box, getThemeColor, Grid, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";

import {
  DefaultMomentLabel,
  DetermineSubMomentCountsFn,
  MomentLabelProps,
  type MomentStyleFn,
  OnSelectFn,
  Scheduler,
  SchedulerHeaderOnClickProp,
  useSchedulerController,
} from "mantine-resource-timeline";
import { useMemo } from "react";

export default { title: "Advanced" };

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
    id: 1,
    resourceId: "b",
    startDate: dayjs().subtract(4, "days"),
    endDate: dayjs().add(5, "hours"),
  },
];

const headerOnClick: SchedulerHeaderOnClickProp<
  (typeof data)[number],
  (typeof resources)[number]
> = {
  day: ({ moment, controller }) => {
    controller.setViewStartDate(
      moment.hour(9).minute(0).second(0).millisecond(0),
    );
    controller.setViewEndDate(
      moment.hour(17).minute(0).second(0).millisecond(0),
    );
  },
};

const onSelect: OnSelectFn<
  (typeof data)[number],
  (typeof resources)[number]
> = ({ firstMoment, lastMoment, resource }) => {
  alert(
    `${firstMoment.toISOString()} to ${lastMoment.toISOString()} on ${resource.label} `,
  );
};

const determineSubMomentCounts: DetermineSubMomentCountsFn = () => 2;

function GermanMomentLabel(
  props: MomentLabelProps<(typeof data)[number], (typeof resources)[number]>,
) {
  if (props.controller.displayUnit === "day") {
    const dayStr = props.moment.format("DD.MM.");
    if (props.moment.day() === 1) {
      return (
        <Stack gap={2}>
          <Box>KW {props.moment.week()}</Box>
          <Box>{dayStr}</Box>
        </Stack>
      );
    }
    return dayStr;
  }
  return <DefaultMomentLabel {...props} />;
}

const momentStyle: MomentStyleFn<
  (typeof data)[number],
  (typeof resources)[number]
> = ({ moment, theme, isSelected }) => {
  const momentDay = moment.day();

  if (!isSelected && (momentDay === 0 || momentDay === 6)) {
    const bgColor = alpha(getThemeColor(`${theme.primaryColor}.1`, theme), 0.3);

    return { background: bgColor };
  }
  return undefined;
};

export function AdvancedScheduler() {
  const controller = useSchedulerController({
    onSelect,
  });

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
        momentLabelComponent={GermanMomentLabel}
        momentStyle={momentStyle}
        determineSubMomentCounts={determineSubMomentCounts}
        dataIdAccessor="id"
      />
    </Stack>
  );
}

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
  >({});

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
    />
  );
}
