import { Center } from "@mantine/core";
import { useStringAccessor } from "../utils";

export interface ResourceLabelProps<TResource> {
  resource: TResource;
  resourceIdField: keyof TResource;
}

export function ResourceLabel<TResource>({
  resource,
  resourceIdField,
}: ResourceLabelProps<TResource>) {
  const getResourceId = useStringAccessor(resourceIdField);

  return <Center>{getResourceId(resource)}</Center>;
}
