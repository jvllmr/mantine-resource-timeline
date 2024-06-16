import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import type { Preview } from "@storybook/react";
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, parameters) => {
      return (
        <MantineProvider>
          <Story />
        </MantineProvider>
      );
    },
  ],
};

export default preview;
