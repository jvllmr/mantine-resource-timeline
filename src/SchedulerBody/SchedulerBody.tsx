import { Box, Flex, MantineStyleProps, Paper } from "@mantine/core";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Dayjs } from "dayjs";
import React, { useMemo, useRef } from "react";
import { useSnapshot } from "valtio";
import { SchedulerController } from "../controller/controller";
import gridClasses from "../Scheduler/SchedulerGrid.module.css";
import {
  DataFieldAccessor,
  useDateAccessor,
  useStringAccessor,
  useStringArrayAccessor,
} from "../utils";

import {
  DefaultNowMarker,
  NowMarkerController,
  NowMarkerProps,
} from "./NowMarker";
import { DefaultResourceLabel, ResourceLabelProps } from "./ResourceLabel";

import { useSchedulerGestures } from "../controller/gestureControls";
import {
  DefaultSchedulerEntry,
  SchedulerEntryProps,
  SchedulerEntryRenderer,
} from "./SchedulerEntry/SchedulerEntry";
import { MomentStyleFn } from "./SchedulerMoment/momentStyling";
import { SchedulerMoments } from "./SchedulerMoment/SchedulerMoment";

export interface SchedulerBodyProps<TData, TResource> {
  startDate?: Date;
  endDate?: Date;
  data: TData[];
  resources: TResource[];
  startDateAccessor: DataFieldAccessor<TData, Dayjs>;
  endDateAccessor: DataFieldAccessor<TData, Dayjs>;
  dataIdAccessor: DataFieldAccessor<TData, string | number>;
  dataResourceIdAccessor: DataFieldAccessor<
    TData,
    string | number | string[] | number[]
  >;
  resourceIdAccessor: DataFieldAccessor<TResource, string | number>;
  controller: SchedulerController<TData, TResource>;
  rowHeight: number;
  resourceLabelComponent?: React.FC<ResourceLabelProps<TResource>>;
  entryComponent?: React.FC<SchedulerEntryProps<TData, TResource>>;
  nowMarkerComponent?: React.FC<NowMarkerProps>;

  momentStyle?: MomentStyleFn<TData, TResource>;
  enableVirtualizer?: boolean;
  gridLabelSize: number;
  totalGridSize: number;
  tz?: string;
  enableGestures?: boolean;
}

const SchedulerEntries = <TData, TResource>({
  data,
  dataIdAccessor,
  getDataResourceId,
  entryComponent,
  resourceId,
  getEndDate,
  getStartDate,
  controller,
  resource,
}: {
  data: TData[];
  dataIdAccessor: DataFieldAccessor<TData, string | number>;
  getDataResourceId: (dataItem: TData) => string[];
  resourceId: string;
  getEndDate: (dataItem: TData) => Dayjs;
  getStartDate: (dataItem: TData) => Dayjs;
  entryComponent: NonNullable<
    SchedulerBodyProps<TData, TResource>["entryComponent"]
  >;
  controller: SchedulerController<TData, TResource>;
  resource: TResource;
}) => {
  const getDataId = useStringAccessor(dataIdAccessor);

  const { viewStartDate, viewEndDate, calculateDistancePercentage } =
    useSnapshot(controller);

  const filteredData = useMemo(
    () => data.filter((item) => getDataResourceId(item).includes(resourceId)),
    [data, getDataResourceId, resourceId],
  );

  return (
    <>
      {filteredData.map((item) => {
        const startDate = getStartDate(item);
        const endDate = getEndDate(item);
        const isOverlap =
          viewStartDate.isBefore(endDate) && viewEndDate.isAfter(startDate);
        if (!isOverlap) return null;
        const startDistance = calculateDistancePercentage(startDate, "left");
        const endDistance = calculateDistancePercentage(endDate, "right");

        const display: MantineStyleProps["display"] = isOverlap
          ? undefined
          : "none";
        const entryId = getDataId(item);

        return (
          <SchedulerEntryRenderer
            CustomSchedulerEntry={entryComponent}
            key={`entry_${entryId}`}
            pos="absolute"
            data={item}
            top="10%"
            left={`${startDistance}%`}
            h="80%"
            right={`${endDistance}%`}
            display={display}
            resource={resource}
          />
        );
      })}
    </>
  );
};

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

  dataIdAccessor,
  entryComponent,
  controller,
  resource,

  tz,
}: {
  data: TData[];
  tz?: string;
  resourcesCount: number;
  customNowMarker: NonNullable<
    SchedulerBodyProps<TData, TResource>["nowMarkerComponent"]
  >;
  dataIdAccessor: DataFieldAccessor<TData, string | number>;
  getDataResourceId: (dataItem: TData) => string[];
  getEndDate: (dataItem: TData) => Dayjs;
  getStartDate: (dataItem: TData) => Dayjs;

  resourceId: string;
  entryComponent: NonNullable<
    SchedulerBodyProps<TData, TResource>["entryComponent"]
  >;

  rowHeight: number;

  rowIndex: number;

  momentStyle?: MomentStyleFn<TData, TResource>;
  controller: SchedulerController<TData, TResource>;
  resource: TResource;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const { calculateDistancePercentage } = useSnapshot(controller);

  return (
    <Flex pos="relative" ref={rowRef} style={{ touchAction: "pan-y" }}>
      <NowMarkerController
        distanceCalculator={calculateDistancePercentage}
        markerComponent={customNowMarker}
        tz={tz}
      />
      <SchedulerEntries
        data={data}
        dataIdAccessor={dataIdAccessor}
        getDataResourceId={getDataResourceId}
        getEndDate={getEndDate}
        getStartDate={getStartDate}
        resourceId={resourceId}
        entryComponent={entryComponent}
        controller={controller}
        resource={resource}
      />
      <SchedulerMoments
        resourceId={resourceId}
        resourcesCount={resourcesCount}
        rowHeight={rowHeight}
        rowIndex={rowIndex}
        momentStyle={momentStyle}
        resource={resource}
        controller={controller}
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

  rowHeight,
  controller,
  momentStyle,
  dataIdAccessor,
  enableVirtualizer,
  totalGridSize,
  gridLabelSize,
  tz,
  enableGestures,
}: SchedulerBodyProps<TData, TResource>) {
  const localBodyRef = useRef<HTMLDivElement | null>(null);
  useSchedulerGestures(controller, localBodyRef, enableGestures);
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

  const virtualizer = useWindowVirtualizer({
    count: resources.length,
    estimateSize: () => rowHeight,
    enabled: enableVirtualizer,
    overscan: 5,
    scrollMargin: localBodyRef.current?.offsetTop ?? 0,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = useMemo(
    () =>
      virtualItems.length > 0
        ? virtualItems?.[0]?.start
          ? virtualItems?.[0]?.start - (localBodyRef.current?.offsetTop ?? 0)
          : 0
        : 0,
    [virtualItems],
  );
  const paddingBottom = useMemo(
    () =>
      virtualItems.length > 0
        ? totalSize -
          (virtualItems?.[virtualItems.length - 1]?.end || 0) +
          (localBodyRef.current?.offsetTop ?? 0)
        : 0,
    [totalSize, virtualItems],
  );

  return (
    <Box
      className={gridClasses.subGrid}
      ref={localBodyRef}
      w="100%"
      style={{
        "--mantine-scheduler-grid-size": `span ${totalGridSize}`,
        height: `${totalSize}px`,
        zIndex: 1,
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <Box
        className={gridClasses.subGrid}
        w="100%"
        style={{
          "--mantine-scheduler-grid-size": `span ${totalGridSize}`,
          height: `${totalSize}px`,
          zIndex: 1,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {paddingTop ? (
          <Box className={gridClasses.fullRow} style={{ height: paddingTop }} />
        ) : null}
        {virtualItems.map((virtualItem, rowIndex) => {
          const resource = resources[virtualItem.index];
          const resourceId = getResourceId(resource);
          return (
            <Box
              key={`resource_row_${virtualItem.key}`}
              className={gridClasses.subGrid}
              style={{
                "--mantine-scheduler-grid-size": `span ${totalGridSize}`,
              }}
            >
              <Box
                className={gridClasses.resourceLabels}
                style={{
                  "--mantine-scheduler-grid-label-size": `span ${gridLabelSize}`,
                }}
              >
                <Paper
                  withBorder
                  radius={0}
                  w="100%"
                  mah={rowHeight}
                  style={{
                    borderLeftWidth: 0,
                    borderBottomWidth: 0,
                    borderRightWidth: 0,
                  }}
                >
                  <CustomResourceLabel
                    resource={resource}
                    getResourceId={getResourceId}
                  />
                </Paper>
              </Box>
              <Box
                className={gridClasses.mainBody}
                style={{
                  "--mantine-scheduler-grid-main-size": `span ${totalGridSize - gridLabelSize}`,
                }}
              >
                <SchedulerBodyRow
                  key={`row_content_${resourceId}`}
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
                  dataIdAccessor={dataIdAccessor}
                  controller={controller}
                  tz={tz}
                  resource={resource}
                />
              </Box>
            </Box>
          );
        })}
        {paddingBottom ? (
          <Box
            className={gridClasses.fullRow}
            style={{ height: paddingBottom }}
          />
        ) : null}
      </Box>
    </Box>
  );
}
