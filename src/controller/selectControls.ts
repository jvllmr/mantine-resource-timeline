import { Dayjs } from "dayjs";
import { DragEvent, useMemo, useRef, useState } from "react";
import { SchedulerController } from "./controller";

export type OnSelectFn<TData, TResource> = (params: {
  firstMoment: Dayjs;
  lastMoment: Dayjs;
  controller: SchedulerController<TData, TResource>;
  resource: TResource;
}) => void;

export type SchedulerMomentOnDragStartOverFactory<TResource> = (
  moment: Dayjs,
  nextMoment: Dayjs,
  resource: TResource,
) => (event: DragEvent<HTMLDivElement>) => void;
export type SchedulerMomentOnDragEndFn<TResource> = (
  event: DragEvent<HTMLDivElement>,
  resource: TResource,
) => void;

export type SchedulerMomentSelectClickFnFactory<TResource> = (
  resource: TResource,
  moment: Dayjs,
  nextMoment: Dayjs,
) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

export const useSchedulerSelect = <TData, TResource>(
  onSelect?: OnSelectFn<TData, TResource>,
) => {
  const constantDiv = useMemo(() => document.createElement("div"), []);
  const [firstMoment, setFirstMoment] = useState<Dayjs | null>(null);
  const [lastMoment, setLastMoment] = useState<Dayjs | null>(null);

  const controllerRef = useRef<SchedulerController<TData, TResource> | null>(
    null,
  );
  const selectedResourceRef = useRef<TResource | null>(null);

  const onDragStartOverFactory:
    | SchedulerMomentOnDragStartOverFactory<TResource>
    | undefined = useMemo(
    () =>
      onSelect
        ? (moment: Dayjs, nextMoment: Dayjs, resource: TResource) =>
            (event) => {
              if (
                !event.ctrlKey &&
                (resource === selectedResourceRef.current ||
                  selectedResourceRef.current === null)
              ) {
                event.dataTransfer.setDragImage(constantDiv, 0, 0);
                if (!firstMoment || moment.isBefore(firstMoment)) {
                  setFirstMoment(moment);
                } else if (!lastMoment?.isSame(nextMoment)) {
                  setLastMoment(nextMoment);
                }

                selectedResourceRef.current = resource;
              }
            }
        : undefined,
    [constantDiv, firstMoment, lastMoment, onSelect],
  );

  const onDragEnd: SchedulerMomentOnDragEndFn<TResource> | undefined = useMemo(
    () =>
      onSelect
        ? (event, resource) => {
            event.preventDefault();
            if (
              !event.ctrlKey &&
              onSelect &&
              controllerRef.current &&
              firstMoment &&
              lastMoment
            ) {
              onSelect({
                firstMoment,
                lastMoment,
                resource,
                controller: controllerRef.current,
              });

              setFirstMoment(null);
              setLastMoment(null);
              selectedResourceRef.current = null;
            }
          }
        : undefined,
    [firstMoment, lastMoment, onSelect],
  );

  const selectClick:
    | SchedulerMomentSelectClickFnFactory<TResource>
    | undefined = useMemo(
    () =>
      onSelect
        ? (resource, firstMoment, lastMoment) => (event) => {
            event.preventDefault();
            if (controllerRef.current) {
              onSelect({
                controller: controllerRef.current,
                resource,
                firstMoment,
                lastMoment,
              });
            }
          }
        : undefined,
    [onSelect],
  );

  return useMemo(
    () => ({
      setController: (controller: SchedulerController<TData, TResource>) =>
        (controllerRef.current = controller),
      onDragStartOverFactory,
      onDragEnd,
      firstMoment,
      lastMoment,
      selectedResource: selectedResourceRef.current,
      selectClick,
    }),
    [onDragStartOverFactory, onDragEnd, firstMoment, lastMoment, selectClick],
  );
};
