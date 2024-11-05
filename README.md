# mantine-resource-timeline

[![NPM Downloads](https://img.shields.io/npm/dw/mantine-resource-timeline)](https://www.npmjs.com/package/mantine-resource-timeline)

A simple but customizable resource scheduler/timeline component built with mantine.

## Compatibility:

This library uses subgrids, which is a rather new browser feature.

## Peer dependencies

- `@mantine/hooks` for @mantine/core
- `@mantine/core` for styling
- `dayjs` for handling of dates
- `@tanstack/react-virtual` for virtualization of bigger timelines
- `valtio` for more granular render control
- `@use-gesture/react` for panning and zoom gestures when holding CTRL

## Minimal usage

```tsx
import { type Dayjs } from "dayjs";
import { useSchedulerController, Scheduler } from "mantine-resource-timeline";

interface MyDataType {
  id: string | number;
  resourceId: string | number | number[] | string[];
  startDate: Date;
  endDate: Date;
}

interface MyResourceType {
  id: string | number;
  name: string;
}

const data: MyDataType[] = [
  {
    id: "appointment-1",
    title: "Bob & Alice Meet",
    resourceId: [1, 2],
    startDate: Dayjs,
    endDate: Dayjs,
  },
];

const resources: MyResourceType[] = [
  {
    id: 1,
    name: "Bob",
  },
  {
    id: 2,
    name: "Alice",
  },
];

function MyTimeline() {
  const controller = useSchedulerController<MyDataType, MyResourceType>({});

  return (
    <Scheduler
      controller={controller}
      data={data}
      resources={resources}
      width="100%"
      height="95vh"
      dataResourceIdAccessor="resourceId"
      endDateAccessor="endDate"
      startDateAccessor="startDate"
      dataIdAccessor="id"
      resourceIdAccessor="id"
      tz="Europe/Berlin"
    />
  );
}
```

For how to activate other features of this library and adapting the timeline component to your needs take a look at the [Advanced Example](https://github.com/jvllmr/mantine-resource-timeline/blob/dev/stories/Advanced.stories.tsx).

The controller object allows us to control multiple components state, such as the time to be displayed, from the outside. It's a valtio proxy object which allows us to pass it around in our app without having to fear unnecessary re-renders. Take a look at [valtio's documentation](https://valtio.dev/docs/introduction/getting-started) to find out how a valtio proxy object is handled correctly.

## Future development

I have mostly achieved what I initially wanted to achieve with this component library. This means I most likely won't re-iterate on it because I have lost mostly lost my interest in this project.
I'm still eager to answer questions via issues or review Pull Requests to this project though. Feel free to contribute anything you'd like as long as it's within the scope of this project. Especially if it includes documentation/tests.

## Contributing

To develop code for this project you need pnpm. If you don't use pnpm already, you can follow their [installation guide](https://pnpm.io/installation) to install it. I personally recommend installation via corepack.

After that you can install dependencies via:

```shell
pnpm install
```

Next you should be able to start the storybook server via:

```shell
pnpm storybook
```

Then you can open the storybook via http://127.0.0.1:6006.

Before committing and pushing you should format and lint the project via the following commands:

```shell
pnpm format
pnpm lint
```
