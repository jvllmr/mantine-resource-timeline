import { MantineStyleProps, Paper, useMantineTheme } from "@mantine/core";
import deepEqual from "fast-deep-equal";
import React from "react";
export interface SchedulerEntryProps<TData, TResource> {
  top: NonNullable<MantineStyleProps["top"]>;
  left: NonNullable<MantineStyleProps["left"]>;
  h: NonNullable<MantineStyleProps["h"]>;
  right: NonNullable<MantineStyleProps["right"]>;
  pos: NonNullable<MantineStyleProps["pos"]>;
  data: TData;
  resource: TResource;
  display: MantineStyleProps["display"];
}

export type SchedulerEntryComponent<TData, TResource> = React.FC<
  SchedulerEntryProps<TData, TResource>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DefaultSchedulerEntry: SchedulerEntryComponent<any, any> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data,

  ...props
}) => {
  const theme = useMantineTheme();

  return (
    <Paper bg={theme.primaryColor} style={{ overflow: "hidden" }} {...props}>
      Pass your own component to entryComponent prop to render your own thing
      here
    </Paper>
  );
};

interface SchedulerEntryRendererProps<TData, TResource>
  extends SchedulerEntryProps<TData, TResource> {
  CustomSchedulerEntry: SchedulerEntryComponent<TData, TResource>;
}

function SchedulerEntryRenderer_<TData, TResource>({
  CustomSchedulerEntry,
  ...props
}: SchedulerEntryRendererProps<TData, TResource>) {
  return <CustomSchedulerEntry {...props} />;
}

export const SchedulerEntryRenderer = React.memo(
  <TData, TResource>(props: SchedulerEntryRendererProps<TData, TResource>) => (
    <SchedulerEntryRenderer_ {...props} />
  ),
  (prev, next) => {
    return (
      prev.display == next.display &&
      prev.left === next.left &&
      prev.right === next.right &&
      prev.CustomSchedulerEntry == next.CustomSchedulerEntry &&
      deepEqual(prev.resource, next.resource) &&
      deepEqual(prev.data, next.data)
    );
  },
);
