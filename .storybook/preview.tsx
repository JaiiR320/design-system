import type { Preview } from "@storybook/react-vite";
import { themes } from "storybook/theming";
import "./storybook.css";

const preview: Preview = {
  // Docs pages don't inherit body styles, so stories carry the system font and colour themselves.
  decorators: [
    (Story) => (
      <div className="font-sans text-foreground antialiased">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    backgrounds: { options: { dark: { name: "Dark", value: "#09090b" } } },
    docs: { theme: themes.dark },
  },
  initialGlobals: { backgrounds: { value: "dark" } },
  tags: ["autodocs"],
};

export default preview;
