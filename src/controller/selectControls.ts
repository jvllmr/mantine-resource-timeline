import { useListState } from "@mantine/hooks";
import { Dayjs } from "dayjs";
import { DragEvent, useMemo, useRef } from "react";
import { SchedulerController } from "./controller";

export type OnSelectFn<TData, TResource> = (params: {
  firstMoment: Dayjs;
  lastMoment: Dayjs;
  controller: SchedulerController<TData, TResource>;
  resource: TResource;
}) => void;

export type SchedulerMomentOnDragStartOverFactory<TResource> = (
  moment: Dayjs,
  resource: TResource,
) => (event: DragEvent<HTMLDivElement>) => void;
export type SchedulerMomentOnDragEndFn<TResource> = (
  event: DragEvent<HTMLDivElement>,
  resource: TResource,
) => void;
export type SelectedMoments = Dayjs[];

const constantDiv = document.createElement("div");

export const useSchedulerSelect = <TData, TResource>(
  onSelect?: OnSelectFn<TData, TResource>,
) => {
  const [selectedMoments, selectedMomentsHandlers] = useListState<Dayjs>([]);

  const controllerRef = useRef<SchedulerController<TData, TResource> | null>(
    null,
  );
  const selectedResourceRef = useRef<TResource | null>(null);

  const onDragStartOverFactory:
    | SchedulerMomentOnDragStartOverFactory<TResource>
    | undefined = useMemo(
    () =>
      onSelect
        ? (moment: Dayjs, resource: TResource) => (event) => {
            if (
              resource == selectedResourceRef.current ||
              selectedResourceRef.current === null
            ) {
              event.dataTransfer.setDragImage(constantDiv, 0, 0);

              selectedMomentsHandlers.filter(
                (selected) => !selected.isSame(moment),
              );
              selectedMomentsHandlers.append(moment);
              selectedResourceRef.current = resource;
            }
          }
        : undefined,
    [onSelect, selectedMomentsHandlers],
  );

  const onDragEnd: SchedulerMomentOnDragEndFn<TResource> | undefined = useMemo(
    () =>
      onSelect
        ? (event, resource) => {
            event.preventDefault();
            if (onSelect && controllerRef.current && selectedMoments.length) {
              const sortedMoments = [...selectedMoments].sort((a, b) =>
                a.isBefore(b) ? -1 : a.isSame(b) ? 0 : 1,
              );
              onSelect({
                firstMoment: sortedMoments[0],
                lastMoment: sortedMoments.pop()!,
                resource,
                controller: controllerRef.current,
              });
              selectedMomentsHandlers.setState([]);
              selectedResourceRef.current = null;
            }
          }
        : undefined,
    [onSelect, selectedMoments, selectedMomentsHandlers],
  );

  return useMemo(
    () => ({
      setController: (controller: SchedulerController<TData, TResource>) =>
        (controllerRef.current = controller),
      onDragStartOverFactory,
      onDragEnd,
      selectedMoments,
      selectedResource: selectedResourceRef.current,
    }),
    [onDragStartOverFactory, onDragEnd, selectedMoments],
  );
};
