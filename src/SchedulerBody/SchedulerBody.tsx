import { Flex, Grid, MantineStyleProps, Paper } from "@mantine/core";
import { useGesture } from "@use-gesture/react";
import { Dayjs } from "dayjs";
import React, { useMemo, useRef } from "react";
import {
  SchedulerController,
  SchedulerDisplayUnit,
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
import { SchedulerMoments } from "./SchedulerMoment/SchedulerMoment";

export type DetermineSubMomentCountsFn = (
  displayUnit: SchedulerDisplayUnit,
) => number;
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
  determineSubMomentCounts?: DetermineSubMomentCountsFn;
  momentStyle?: MomentStyleFn<TData, TResource>;
}

function SchedulerBodyRow<TData, TResource>({
  data,
  customNowMarker,

  getDataResourceId,
  resourceId,
  getEndDate,
  getStartDate,
  resourcesCount,
  rowHeight,
  rowIndex,
  momentStyle,
  subMomentCount,
}: {
  data: TData[];
  resourcesCount: number;
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

  rowIndex: number;
  subMomentCount: number;
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
        const isOverlap =
          controller.viewStartDate.isBefore(endDate) &&
          controller.viewEndDate.isAfter(startDate);
        const display: MantineStyleProps["display"] = isOverlap
          ? undefined
          : "none";

        return (
          <SchedulerEntryRenderer
            key={`entry_${index}`}
            pos="absolute"
            data={item}
            top="10%"
            left={`${startDistance}%`}
            h="80%"
            right={`${endDistance}%`}
            display={display}
          />
        );
      })}

      <SchedulerMoments
        resourceId={resourceId}
        resourcesCount={resourcesCount}
        rowHeight={rowHeight}
        rowIndex={rowIndex}
        momentStyle={momentStyle}
        subMomentCount={subMomentCount}
      />
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
  determineSubMomentCounts,
  rowHeight,
  momentStyle,
}: SchedulerBodyProps<TData, TResource>) {
  const controller = useControllerContext();
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

  const subMomentCount = useMemo(
    () => determineSubMomentCounts?.(controller.displayUnit) ?? 0,
    [controller.displayUnit, determineSubMomentCounts],
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
                mah={rowHeight}
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
                customNowMarker={customNowMarker}
                data={data}
                entryComponent={customSchedulerEntry}
                getDataResourceId={getDataResourceId}
                getEndDate={getEndDate}
                getStartDate={getStartDate}
                resourceId={resourceId}
                rowHeight={rowHeight}
                momentStyle={momentStyle}
                resourcesCount={resources.length}
                subMomentCount={subMomentCount}
              />
            </Grid.Col>
          </resourceContext.Provider>
        );
      })}
    </schedulerEntryContext.Provider>
  );
}
