import {
  DEFAULT_THEME,
  MantineProvider,
  MantineTheme,
  MantineThemeProvider,
  useMantineColorScheme,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/core/styles.layer.css";
import "@mantine/dates/styles.layer.css";
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import { addons } from "@storybook/preview-api";
import type { Preview, ReactRenderer } from "@storybook/react";
import { useEffect } from "react";
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode";
const allColorThemes: MantineTheme[] = Object.keys(DEFAULT_THEME.colors)
  .sort()
  .map((primaryColor) => ({ ...DEFAULT_THEME, primaryColor }));

const channel = addons.getChannel();

function ColorSchemeWrapper({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useMantineColorScheme();
  const handleColorScheme = (value: boolean) =>
    setColorScheme(value ? "dark" : "light");

  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
  }, [channel]);

  return <>{children}</>;
}
const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <ColorSchemeWrapper>
          <Story />
        </ColorSchemeWrapper>
      );
    },

    (Story) => {
      return (
        <MantineProvider>
          <Story />
        </MantineProvider>
      );
    },
    withThemeFromJSXProvider<ReactRenderer>({
      defaultTheme: "blue",
      Provider: MantineThemeProvider,
      themes: Object.fromEntries(
        allColorThemes.map((theme) => [theme.primaryColor, theme]),
      ),
    }),
  ],
};

export default preview;
