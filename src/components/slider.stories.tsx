import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Field, FieldDescription, FieldLabel } from "#components/field";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "#components/slider";

const meta = {
  title: "Primitives/Slider",
  component: Slider,
  args: {
    defaultValue: 120,
    min: 100,
    max: 200,
    step: 10,
    onValueChange: fn(),
    onValueCommit: fn(),
  },
  render: (args) => (
    <Field className="w-80">
      <Slider format={(value) => `${value}%`} {...args}>
        <div className="flex items-center justify-between">
          <FieldLabel>Text size</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <FieldDescription>Scale of document previews.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

// A range: one thumb per value, each with its own name; the label names the group.
export const Range: Story = {
  args: {
    defaultValue: [20, 80],
    min: 0,
    max: 100,
    step: 5,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  render: (args) => (
    <Field className="w-80">
      <Slider {...args}>
        <div className="flex items-center justify-between">
          <FieldLabel>Price</FieldLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="Minimum price" />
            <SliderThumb index={1} aria-label="Maximum price" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </Field>
  ),
};

/** The FieldLabel names the thumb; arrows step, End jumps to the max, and the value text follows. */
export const KeyboardTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole("slider", { name: "Text size" });
    await expect(thumb).toHaveAccessibleDescription("Scale of document previews.");
    await expect(thumb).toHaveAttribute("aria-valuetext", "120%");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuetext", "130%"));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      130,
      expect.objectContaining({ reason: "step-key" }),
    );
    await waitFor(() => expect(args.onValueCommit).toHaveBeenCalled());
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(canvas.getByText("200%")).toBeVisible());
  },
};

/** Pressing the track moves the thumb there. */
export const TrackPressTest: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement }) => {
    const track = canvasElement.querySelector<HTMLElement>("[data-slot=slider-control]")!;
    const box = track.getBoundingClientRect();
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: track,
      coords: { clientX: box.right - 1, clientY: box.top + box.height / 2 },
    });
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(
        200,
        expect.objectContaining({ reason: "track-press" }),
      ),
    );
  },
};

/** A disabled slider can't be focused or moved. */
export const DisabledTest: Story = {
  tags: ["!dev", "!autodocs"],
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const thumb = within(canvasElement).getByRole("slider", { name: "Text size" });
    await expect(thumb).toBeDisabled();
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
