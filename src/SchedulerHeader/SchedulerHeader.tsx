import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Paper,
  useMantineTheme,
} from "@mantine/core";
import { Dayjs } from "dayjs";
import React, { useMemo } from "react";
import {
  SchedulerController,
  SchedulerDisplayUnit,
  UnknownSchedulerController,
  useControllerContext,
} from "../controller/controller";
import { MomentStyleFn } from "../SchedulerBody/SchedulerMoment/momentStyling";
import { DefaultMomentLabel, MomentLabelProps } from "./DefaultMomentLabel";

export type SchedulerHeaderOnClickFn = (
  moment: Dayjs,
  controller: UnknownSchedulerController,
) => void;

export type SchedulerHeaderOnClickProp = Partial<
  Record<SchedulerDisplayUnit, SchedulerHeaderOnClickFn>
>;

export interface SchedulerHeaderProps<TData, TResource> {
  controller: SchedulerController<TData, TResource>;
  onClick?: SchedulerHeaderOnClickProp;
  momentLabelComponent?: React.FC<MomentLabelProps<TData, TResource>>;
  momentStyle?: MomentStyleFn<TData, TResource>;
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

interface BottomLabelProps<TData, TResource> {
  moment: Dayjs;
  momentLabelComponent?: SchedulerHeaderProps<
    TData,
    TResource
  >["momentLabelComponent"];
  onClick?: SchedulerHeaderOnClickFn;
  momentStyle?: MomentStyleFn<TData, TResource>;
}

const BottomLabel = <TData, TResource>({
  onClick,
  moment,
  momentLabelComponent,
  momentStyle,
}: BottomLabelProps<TData, TResource>) => {
  const controller = useControllerContext();

  const wrappedOnClick = useMemo(
    () => (onClick ? () => onClick(moment, controller) : undefined),
    [controller, moment, onClick],
  );
  const MomentLabel = useMemo(
    () => momentLabelComponent ?? DefaultMomentLabel,
    [momentLabelComponent],
  );
  const theme = useMantineTheme();
  const resolvedStyle = useMemo(
    () => ({
      ...momentStyle?.({ moment, controller, theme }),
      height: "100%",
      width: "100%",
      padding: 0,
      margin: 0,
    }),
    [controller, moment, momentStyle, theme],
  );

  if (!wrappedOnClick)
    return (
      <Box style={resolvedStyle}>
        <Center>
          <MomentLabel controller={controller} moment={moment} />
        </Center>
      </Box>
    );
  return (
    <Button
      variant="subtle"
      radius={0}
      onClick={wrappedOnClick}
      style={resolvedStyle}
    >
      <MomentLabel controller={controller} moment={moment} />
    </Button>
  );
};

export function SchedulerHeader<TData, TResource>({
  controller,
  onClick,
  momentLabelComponent,
  momentStyle,
}: SchedulerHeaderProps<TData, TResource>) {
  const resolvedOnClick = useMemo(
    () => onClick?.[controller.displayUnit],
    [controller.displayUnit, onClick],
  );

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
                    key={`header_moment_${moment.toISOString()}`}
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
                  >
                    <BottomLabel
                      moment={moment}
                      onClick={resolvedOnClick}
                      momentLabelComponent={momentLabelComponent}
                      momentStyle={momentStyle}
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
