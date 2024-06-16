import { Center, Flex, Grid, MantineStyleProps, Paper } from "@mantine/core";
import { useGesture } from "@use-gesture/react";
import { Dayjs } from "dayjs";
import React, { useMemo, useRef } from "react";
import { SchedulerController, useControllerContext } from "../controller";
import { useDateAccessor, useStringAccessor } from "../utils";
import { NowMarker, NowMarkerController, NowMarkerProps } from "./NowMarker";
import { ResourceLabel, ResourceLabelProps } from "./ResourceLabel";
import { SchedulerEntry, SchedulerEntryProps } from "./SchedulerEntry";
import {
  SchedulerMoment,
  SchedulerMomentProps,
} from "./SchedulerMoment/SchedulerMoment";
import { determineSchedulerSubMomentsCount } from "./SchedulerMoment/util";

export interface SchedulerResource {
  id: string;
  label?: React.ReactNode;
}

export interface SchedulerData {
  resourceId: string;
  startDate: Date;
  endDate: Date;
}

export interface SchedulerBodyProps<TData, TResource> {
  startDate?: Date;
  endDate?: Date;
  data: TData[];
  resources: TResource[];
  startDateField: keyof TData;
  endDateField: keyof TData;
  dataResourceIdField: keyof TData;
  resourceIdField: keyof TResource;
  controller: SchedulerController;
  rowHeight: NonNullable<MantineStyleProps["h"]>;
  resourceLabelComponent?: React.FC<ResourceLabelProps<TResource>>;
  entryComponent?: React.FC<SchedulerEntryProps<TData>>;
  nowMarkerComponent?: React.FC<NowMarkerProps>;
  customDetermineSchedulerSubMomentsCount?: SchedulerMomentProps["customDetermineSchedulerSubMomentsCount"];
}

function SchedulerBodyRow<TData, TResource>({
  data,
  customNowMarker,
  calculateDistancePercentage,
  getDataResourceId,
  resourceId,
  getEndDate,
  getStartDate,
  entryComponent,
  moments,
  momentWidths,
  displayUnit,
  firstMomentLoss,
  lastMomentLoss,
  rowHeight,
  resources,
  rowIndex,
  customDetermineSchedulerSubMomentsCount,
}: {
  data: TData[];
  resources: TResource[];
  customNowMarker: NonNullable<
    SchedulerBodyProps<TData, TResource>["nowMarkerComponent"]
  >;
  calculateDistancePercentage: SchedulerController["calculateDistancePercentage"];
  getDataResourceId: (dataItem: TData) => string;
  getEndDate: (dataItem: TData) => Dayjs;
  getStartDate: (dataItem: TData) => Dayjs;
  resourceId: string;
  entryComponent: NonNullable<
    SchedulerBodyProps<TData, TResource>["entryComponent"]
  >;
  moments: SchedulerController["moments"];
  momentWidths: SchedulerController["momentWidths"];
  rowHeight: SchedulerBodyProps<TData, TResource>["rowHeight"];
  firstMomentLoss: number;
  lastMomentLoss: number;
  displayUnit: SchedulerController["displayUnit"];
  rowIndex: number;
  customDetermineSchedulerSubMomentsCount: NonNullable<
    SchedulerBodyProps<
      TData,
      TResource
    >["customDetermineSchedulerSubMomentsCount"]
  >;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const controller = useControllerContext();

  useGesture(
    {
      onDrag: ({ event, offset: [x] }) => {
        event.preventDefault();
        if (!controller.enableGestures) return;
        if (x < 0) {
          controller.setViewEndDate(
            controller.viewEndDate.add(1, controller.displayUnit),
          );
          controller.setViewStartDate(
            controller.viewStartDate.add(1, controller.displayUnit),
          );
        } else {
          controller.setViewEndDate(
            controller.viewEndDate.subtract(1, controller.displayUnit),
          );
          controller.setViewStartDate(
            controller.viewStartDate.subtract(1, controller.displayUnit),
          );
        }
      },
      onWheel: ({ event, offset: [, y] }) => {
        event.preventDefault();
        if (!controller.enableGestures) return;
        if (y > 0) {
          controller.setViewEndDate(
            controller.viewEndDate.add(1, controller.displayUnit),
          );
          controller.setViewStartDate(
            controller.viewStartDate.subtract(1, controller.displayUnit),
          );
        } else {
          controller.setViewEndDate(
            controller.viewEndDate.subtract(1, controller.displayUnit),
          );
          controller.setViewStartDate(
            controller.viewStartDate.add(1, controller.displayUnit),
          );
        }
      },
    },
    { target: rowRef, wheel: { eventOptions: { passive: false } } },
  );
  const CustomSchedulerEntry = useMemo(() => entryComponent, [entryComponent]);
  return (
    <Flex pos="relative" ref={rowRef} style={{ touchAction: "none" }}>
      <NowMarkerController
        distanceCalculator={calculateDistancePercentage}
        markerComponent={customNowMarker}
      />

      {data
        .filter((item) => getDataResourceId(item) === resourceId)
        .map((item) => {
          const startDate = getStartDate(item);
          const endDate = getEndDate(item);
          const startDistance = calculateDistancePercentage(startDate, "left");
          const endDistance = calculateDistancePercentage(endDate, "right");

          return (
            <CustomSchedulerEntry
              pos="absolute"
              data={item}
              top="10%"
              left={`${startDistance}%`}
              h="80%"
              right={`${endDistance}%`}
            />
          );
        })}

      {moments
        .map((moment, index): [Dayjs, number] => [moment, momentWidths[index]])
        .map(([moment, distance], momentIndex) => {
          return (
            <SchedulerMoment
              displayUnit={displayUnit}
              height={rowHeight}
              moment={moment}
              resourceId={resourceId}
              width={`${distance}%`}
              isTop={rowIndex === 0}
              isBottom={rowIndex === resources.length - 1}
              isLeft={momentIndex === 0}
              isRight={momentIndex === moments.length - 1}
              customDetermineSchedulerSubMomentsCount={
                customDetermineSchedulerSubMomentsCount
              }
              loss={
                momentIndex === 0
                  ? firstMomentLoss
                  : momentIndex === moments.length - 1
                    ? lastMomentLoss
                    : 1
              }
            />
          );
        })}
    </Flex>
  );
}

export function SchedulerBody<TData, TResource>({
  resources,
  resourceIdField,
  data,
  dataResourceIdField,
  endDateField,
  startDateField,
  resourceLabelComponent,
  entryComponent,
  nowMarkerComponent,
  controller: {
    calculateDistancePercentage,
    moments,
    momentWidths,
    displayUnit,
  },
  customDetermineSchedulerSubMomentsCount:
    customDetermineSchedulerSubMomentsCountParam,
  rowHeight,
}: SchedulerBodyProps<TData, TResource>) {
  const getResourceId = useStringAccessor(resourceIdField);
  const getDataResourceId = useStringAccessor(dataResourceIdField);
  const getStartDate = useDateAccessor(startDateField);
  const getEndDate = useDateAccessor(endDateField);
  const CustomResourceLabel = useMemo(
    () => resourceLabelComponent ?? ResourceLabel,
    [resourceLabelComponent],
  );
  const customSchedulerEntry = useMemo(
    () => entryComponent ?? SchedulerEntry,
    [entryComponent],
  );
  const customNowMarker = useMemo(
    () => nowMarkerComponent ?? NowMarker,
    [nowMarkerComponent],
  );

  const customDetermineSchedulerSubMomentsCount = useMemo(
    () =>
      customDetermineSchedulerSubMomentsCountParam ??
      determineSchedulerSubMomentsCount,
    [customDetermineSchedulerSubMomentsCountParam],
  );

  const firstMomentLoss = useMemo(
    () => (momentWidths[0] / 100) * (momentWidths.length - 1),
    [momentWidths],
  );

  const lastMomentLoss = useMemo(
    () =>
      (momentWidths[momentWidths.length - 1] / 100) * (momentWidths.length - 1),
    [momentWidths],
  );

  return (
    <>
      {resources.map((resource, rowIndex) => {
        const resourceId = getResourceId(resource);
        return (
          <React.Fragment>
            <Grid.Col span={2}>
              <Paper
                withBorder
                radius={0}
                w="100%"
                h="100%"
                style={{
                  borderLeftWidth: 0,
                  borderBottomWidth: 0,
                }}
              >
                <Center>
                  <CustomResourceLabel
                    resource={resource}
                    resourceIdField={resourceIdField}
                  />
                </Center>
              </Paper>
            </Grid.Col>
            <Grid.Col span={10}>
              <SchedulerBodyRow
                rowIndex={rowIndex}
                calculateDistancePercentage={calculateDistancePercentage}
                customDetermineSchedulerSubMomentsCount={
                  customDetermineSchedulerSubMomentsCount
                }
                customNowMarker={customNowMarker}
                data={data}
                displayUnit={displayUnit}
                entryComponent={customSchedulerEntry}
                firstMomentLoss={firstMomentLoss}
                lastMomentLoss={lastMomentLoss}
                getDataResourceId={getDataResourceId}
                getEndDate={getEndDate}
                getStartDate={getStartDate}
                momentWidths={momentWidths}
                moments={moments}
                resourceId={resourceId}
                resources={resources}
                rowHeight={rowHeight}
              />
            </Grid.Col>
          </React.Fragment>
        );
      })}
    </>
  );
}
