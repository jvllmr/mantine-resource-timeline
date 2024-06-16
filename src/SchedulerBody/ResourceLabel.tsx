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

  return getResourceId(resource);
}