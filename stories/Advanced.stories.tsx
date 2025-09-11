/* eslint-disable react-compiler/react-compiler */
import { alpha, Box, getThemeColor, Grid, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { addHours, formatDate, getDay, subDays } from "date-fns";

import {
  DefaultMomentLabel,
  DefaultNowMarker,
  DetermineSubMomentCountsFn,
  MomentLabelProps,
  type MomentStyleFn,
  NowMarkerProps,
  OnSelectFn,
  Scheduler,
  SchedulerHeaderOnClickProp,
  useSchedulerController,
} from "mantine-resource-timeline";
import { useSnapshot } from "valtio";

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
    startDate: subDays(new Date(), 4),
    endDate: addHours(new Date(), 5),
  },
];

const headerOnClick: SchedulerHeaderOnClickProp<
  (typeof data)[number],
  (typeof resources)[number]
> = {
  day: ({ moment, controller }) => {
    controller.viewStartDate = moment
      .hour(9)
      .minute(0)
      .second(0)
      .millisecond(0);
    controller.viewEndDate = moment.hour(17).minute(0).second(0).millisecond(0);
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

const determineSubMomentsCount: DetermineSubMomentCountsFn = () => 2;

function GermanMomentLabel(
  props: MomentLabelProps<(typeof data)[number], (typeof resources)[number]>,
) {
  const snap = useSnapshot(props.controller);
  if (snap.displayUnit === "day") {
    const dayStr = formatDate(props.moment, "dd.MM.");
    if (getDay(props.moment) === 1) {
      return (
        <Stack gap={2}>
          <Box>KW {formatDate(props.moment, "w")}</Box>
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
  const momentDay = getDay(moment);

  if (!isSelected && (momentDay === 0 || momentDay === 6)) {
    const bgColor = alpha(getThemeColor(`${theme.primaryColor}.1`, theme), 0.3);

    return { background: bgColor };
  }
  return undefined;
};

function CustomNowMarker(props: NowMarkerProps) {
  return (
    <DefaultNowMarker {...props} format="dd.MM.yyyy HH:mm:ss 'Uhr' OOOO" />
  );
}

export function Advanced() {
  const controller = useSchedulerController({
    onSelect,
    determineSubMomentsCount,
  });

  const snap = useSnapshot(controller);
  return (
    <Stack>
      <Grid>
        <Grid.Col span={6}>
          <DateTimePicker
            label="Start"
            value={snap.viewStartDate}
            onChange={(value) => {
              if (!value) return;
              controller.viewStartDate = new Date(value);
            }}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <DateTimePicker
            label="End"
            value={snap.viewEndDate}
            onChange={(value) => {
              if (!value) return;
              controller.viewEndDate = new Date(value);
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
        dataIdAccessor="id"
        tz="Europe/Berlin"
        nowMarkerComponent={CustomNowMarker}
      />
    </Stack>
  );
}
