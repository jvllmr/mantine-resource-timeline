import { MantineStyleProps, Paper } from "@mantine/core";

export interface SchedulerEntryProps<TData> {
  top: NonNullable<MantineStyleProps["top"]>;
  left: NonNullable<MantineStyleProps["left"]>;
  h: NonNullable<MantineStyleProps["h"]>;
  right: NonNullable<MantineStyleProps["right"]>;
  pos: NonNullable<MantineStyleProps["pos"]>;
  data: TData;
}

export function SchedulerEntry<TData>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data,
  ...props
}: SchedulerEntryProps<TData>) {
  return (
    <Paper bg="blue" style={{ overflow: "hidden" }} {...props}>
      Pass your own component to entryComponent prop to render your own thing
      here
    </Paper>
  );
}
