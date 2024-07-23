import { Center } from "@mantine/core";
import { DataFieldAccessor, useStringAccessor } from "../utils";

export interface ResourceLabelProps<TResource> {
  resource: TResource;
  resourceIdField: DataFieldAccessor<TResource, string>;
}

export function DefaultResourceLabel<TResource>({
  resource,
  resourceIdField,
}: ResourceLabelProps<TResource>) {
  const getResourceId = useStringAccessor(resourceIdField);

  return <Center>{getResourceId(resource)}</Center>;
}
