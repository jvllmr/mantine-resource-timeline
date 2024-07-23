import { MantineStyleProps, Paper } from "@mantine/core";
import { useContext } from "react";
import { resourceContext } from "../contexts";
import { schedulerEntryContext } from "./context";

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
  return (
    <Paper bg="blue" style={{ overflow: "hidden" }} {...props}>
      Pass your own component to entryComponent prop to render your own thing
      here
    </Paper>
  );
};

export function SchedulerEntryRenderer<TData, TResource>(
  props: Omit<SchedulerEntryProps<TData, TResource>, "resource">,
) {
  const CustomSchedulerEntry: SchedulerEntryComponent<TData, TResource> =
    useContext(schedulerEntryContext);
  const resource = useContext<TResource>(resourceContext);
  return <CustomSchedulerEntry {...props} resource={resource} />;
}
