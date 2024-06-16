import { Box, Flex, Grid, Paper } from "@mantine/core";
import { Dayjs } from "dayjs";
import React from "react";
import { SchedulerController, SchedulerDisplayUnit } from "./controller";

export interface SchedulerHeaderProps {
  controller: SchedulerController;
}

interface TopLabelProps {
  displayUnit: SchedulerDisplayUnit;
  moments: Dayjs[];
}
const TopLabel = React.memo(({ displayUnit, moments }: TopLabelProps) => {
  if (moments.length < 2) return null;
  const firstMoment = moments[0];
  const lastMoment = moments[moments.length - 1];
  switch (displayUnit) {
    case "year":
      return null;
    case "month":
      if (firstMoment.year() === lastMoment.year())
        return String(lastMoment.year());
      return `${firstMoment.year()} - ${lastMoment.year()}`;
    case "week":
      return null;
    case "day":
      if (
        firstMoment.year() === lastMoment.year() &&
        firstMoment.month() === lastMoment.month()
      )
        return lastMoment.format("MMMM YYYY");
      return `${firstMoment.format("MMMM YYYY")} - ${lastMoment.format("MMMM YYYY")}`;
    case "hour":
      if (
        firstMoment.year() === lastMoment.year() &&
        firstMoment.month() === lastMoment.month() &&
        firstMoment.date() === lastMoment.date()
      )
        return lastMoment.format("dddd MMMM YYYY");

      return `${firstMoment.format("dddd MMMM YYYY")} - ${lastMoment.format("dddd MMMM YYYY")}`;
  }

  return null;
});

interface BottomLabelProps {
  moment: Dayjs;
  displayUnit: SchedulerDisplayUnit;
}

const BottomLabel = React.memo(({ moment, displayUnit }: BottomLabelProps) => {
  switch (displayUnit) {
    case "year":
      return String(moment.year());
    case "month":
      return moment.format("MMMM");
    case "week":
      return String(moment.week());
    case "day":
      return (
        <Flex direction="column">
          <Box>{moment.format("dddd")}</Box>
          <Box>{moment.format("D MMMM")}</Box>
        </Flex>
      );
    case "hour":
      return moment.format("LT");
  }

  return null;
});

export function SchedulerHeader({ controller }: SchedulerHeaderProps) {
  return (
    <>
      <Grid.Col span={2}>
        <Paper
          withBorder
          h="100%"
          w="100%"
          radius={0}
          style={{
            borderTopWidth: 0,
            borderLeftWidth: 0,

            borderBottomWidth: 0,
          }}
        />
      </Grid.Col>
      <Grid.Col span={10}>
        <Flex direction="column" w="100%">
          <Paper
            withBorder
            radius={0}
            style={{
              borderTopWidth: 0,
              borderLeftWidth: 0,
              borderRightWidth: 0,
            }}
            p="xs"
          >
            <TopLabel
              displayUnit={controller.displayUnit}
              moments={controller.moments}
            />
          </Paper>
          <Flex w="100%">
            {controller.moments
              .map((moment, index): [Dayjs, number] => [
                moment,
                controller.momentWidths[index],
              ])
              .map(([moment, momentWidth], index) => {
                return (
                  <Paper
                    withBorder
                    radius={0}
                    style={{
                      borderTopWidth: 0,
                      borderLeftWidth: 0,
                      borderBottomWidth: 0,
                      borderRightWidth:
                        index === controller.moments.length - 1 ? 0 : undefined,
                      overflow: "hidden",
                    }}
                    w={`${momentWidth}%`}
                    p="xs"
                  >
                    <BottomLabel
                      moment={moment}
                      displayUnit={controller.displayUnit}
                    />
                  </Paper>
                );
              })}
          </Flex>
        </Flex>
      </Grid.Col>
    </>
  );
}
