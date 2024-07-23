import { Flex, Grid, MantineStyleProps, Paper } from "@mantine/core";
import { useGesture } from "@use-gesture/react";
import { Dayjs } from "dayjs";
import React, { useMemo, useRef } from "react";
import {
  SchedulerController,
  UnknownSchedulerController,
  useControllerContext,
} from "../controller/controller";
import {
  DataFieldAccessor,
  useDateAccessor,
  useStringAccessor,
  useStringArrayAccessor,
} from "../utils";
import { resourceContext } from "./contexts";
import {
  DefaultNowMarker,
  NowMarkerController,
  NowMarkerProps,
} from "./NowMarker";
import { DefaultResourceLabel, ResourceLabelProps } from "./ResourceLabel";
import { schedulerEntryContext } from "./SchedulerEntry/context";
import {
  DefaultSchedulerEntry,
  SchedulerEntryProps,
  SchedulerEntryRenderer,
} from "./SchedulerEntry/SchedulerEntry";
import { MomentStyleFn } from "./SchedulerMoment/momentStyling";
import { SchedulerMoment } from "./SchedulerMoment/SchedulerMoment";
import { determineSchedulerSubMomentsCount } from "./SchedulerMoment/util";

export interface SchedulerBodyProps<TData, TResource> {
  startDate?: Date;
  endDate?: Date;
  data: TData[];
  resources: TResource[];
  startDateAccessor: DataFieldAccessor<TData, Dayjs>;
  endDateAccessor: DataFieldAccessor<TData, Dayjs>;
  dataResourceIdAccessor: DataFieldAccessor<TData, string>;
  resourceIdAccessor: DataFieldAccessor<TResource, string>;
  controller: SchedulerController<TData, TResource>;
  rowHeight: NonNullable<MantineStyleProps["h"]>;
  resourceLabelComponent?: React.FC<ResourceLabelProps<TResource>>;
  entryComponent?: React.FC<SchedulerEntryProps<TData, TResource>>;
  nowMarkerComponent?: React.FC<NowMarkerProps>;
  customDetermineSchedulerSubMomentsCount?: (
    controller: UnknownSchedulerController,
  ) => number;
  momentStyle?: MomentStyleFn<TData, TResource>;
}

function SchedulerBodyRow<TData, TResource>({
  data,
  customNowMarker,

  getDataResourceId,
  resourceId,
  getEndDate,
  getStartDate,

  firstMomentLoss,
  lastMomentLoss,
  rowHeight,
  resources,
  rowIndex,
  customDetermineSchedulerSubMomentsCount,
  momentStyle,
}: {
  data: TData[];
  resources: TResource[];
  customNowMarker: NonNullable<
    SchedulerBodyProps<TData, TResource>["nowMarkerComponent"]
  >;

  getDataResourceId: (dataItem: TData) => string[];
  getEndDate: (dataItem: TData) => Dayjs;
  getStartDate: (dataItem: TData) => Dayjs;
  resourceId: string;
  entryComponent: NonNullable<
    SchedulerBodyProps<TData, TResource>["entryComponent"]
  >;

  rowHeight: SchedulerBodyProps<TData, TResource>["rowHeight"];
  firstMomentLoss: number;
  lastMomentLoss: number;

  rowIndex: number;
  customDetermineSchedulerSubMomentsCount: NonNullable<
    SchedulerBodyProps<
      TData,
      TResource
    >["customDetermineSchedulerSubMomentsCount"]
  >;
  momentStyle?: MomentStyleFn<TData, TResource>;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const controller = useControllerContext();

  useGesture(
    {
      onDrag: ({ offset: [x] }) => {
        // event.preventDefault();
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

  const subMomentsCount = useMemo(
    () => customDetermineSchedulerSubMomentsCount(controller),
    [controller, customDetermineSchedulerSubMomentsCount],
  );
  const filteredData = useMemo(
    () => data.filter((item) => getDataResourceId(item).includes(resourceId)),
    [data, getDataResourceId, resourceId],
  );
  return (
    <Flex pos="relative" ref={rowRef} style={{ touchAction: "none" }}>
      <NowMarkerController
        distanceCalculator={controller.calculateDistancePercentage}
        markerComponent={customNowMarker}
      />

      {filteredData.map((item, index) => {
        const startDate = getStartDate(item);
        const endDate = getEndDate(item);
        const startDistance = controller.calculateDistancePercentage(
          startDate,
          "left",
        );
        const endDistance = controller.calculateDistancePercentage(
          endDate,
          "right",
        );

        return (
          <SchedulerEntryRenderer
            key={`entry_${index}`}
            pos="absolute"
            data={item}
            top="10%"
            left={`${startDistance}%`}
            h="80%"
            right={`${endDistance}%`}
          />
        );
      })}

      {controller.moments
        .map((moment, index): [Dayjs, number] => [
          moment,
          controller.momentWidths[index],
        ])
        .map(([moment, distance], momentIndex) => {
          return (
            <SchedulerMoment
              key={`moment_top_${moment.toISOString()}`}
              displayUnit={controller.displayUnit}
              height={rowHeight}
              moment={moment}
              resourceId={resourceId}
              width={`${distance}%`}
              isTop={rowIndex === 0}
              isBottom={rowIndex === resources.length - 1}
              isLeft={momentIndex === 0}
              isRight={momentIndex === controller.moments.length - 1}
              subMomentCount={subMomentsCount}
              onDragEnd={controller.momentDragEnd}
              onDragStartOverFactory={controller.momentDragStartOver}
              selectedMoments={controller.selectedMoments}
              selectedResource={controller.selectedResource}
              loss={
                momentIndex === 0
                  ? firstMomentLoss
                  : momentIndex === controller.moments.length - 1
                    ? lastMomentLoss
                    : 1
              }
              momentStyle={momentStyle}
            />
          );
        })}
    </Flex>
  );
}

export function SchedulerBody<TData, TResource>({
  resources,
  resourceIdAccessor: resourceIdField,
  data,
  dataResourceIdAccessor: dataResourceIdField,
  endDateAccessor: endDateField,
  startDateAccessor: startDateField,
  resourceLabelComponent,
  entryComponent,
  nowMarkerComponent,

  customDetermineSchedulerSubMomentsCount:
    customDetermineSchedulerSubMomentsCountParam,
  rowHeight,
  momentStyle,
}: SchedulerBodyProps<TData, TResource>) {
  const controller: SchedulerController<TData, TResource> =
    useControllerContext();
  const getResourceId = useStringAccessor(resourceIdField);
  const getDataResourceId = useStringArrayAccessor(dataResourceIdField);
  const getStartDate = useDateAccessor(startDateField);
  const getEndDate = useDateAccessor(endDateField);
  const CustomResourceLabel = useMemo(
    () => resourceLabelComponent ?? DefaultResourceLabel,
    [resourceLabelComponent],
  );
  const customSchedulerEntry = useMemo(
    () => entryComponent ?? DefaultSchedulerEntry,
    [entryComponent],
  );
  const customNowMarker = useMemo(
    () => nowMarkerComponent ?? DefaultNowMarker,
    [nowMarkerComponent],
  );

  const customDetermineSchedulerSubMomentsCount = useMemo(
    () =>
      customDetermineSchedulerSubMomentsCountParam ??
      determineSchedulerSubMomentsCount,
    [customDetermineSchedulerSubMomentsCountParam],
  );

  const firstMomentLoss = useMemo(
    () =>
      (controller.momentWidths[0] / 100) * (controller.momentWidths.length - 1),
    [controller.momentWidths],
  );

  const lastMomentLoss = useMemo(
    () =>
      (controller.momentWidths[controller.momentWidths.length - 1] / 100) *
      (controller.momentWidths.length - 1),
    [controller.momentWidths],
  );

  return (
    <schedulerEntryContext.Provider value={customSchedulerEntry}>
      {resources.map((resource, rowIndex) => {
        const resourceId = getResourceId(resource);
        return (
          <resourceContext.Provider key={`row_${rowIndex}`} value={resource}>
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
                <CustomResourceLabel
                  resource={resource}
                  resourceIdField={resourceIdField}
                />
              </Paper>
            </Grid.Col>
            <Grid.Col span={10}>
              <SchedulerBodyRow
                key={rowIndex}
                rowIndex={rowIndex}
                customDetermineSchedulerSubMomentsCount={
                  customDetermineSchedulerSubMomentsCount
                }
                customNowMarker={customNowMarker}
                data={data}
                entryComponent={customSchedulerEntry}
                firstMomentLoss={firstMomentLoss}
                lastMomentLoss={lastMomentLoss}
                getDataResourceId={getDataResourceId}
                getEndDate={getEndDate}
                getStartDate={getStartDate}
                resourceId={resourceId}
                resources={resources}
                rowHeight={rowHeight}
                momentStyle={momentStyle}
              />
            </Grid.Col>
          </resourceContext.Provider>
        );
      })}
    </schedulerEntryContext.Provider>
  );
}
