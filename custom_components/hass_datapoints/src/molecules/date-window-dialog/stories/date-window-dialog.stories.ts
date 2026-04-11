import { html } from "lit";
import { expect, fn, userEvent, within } from "@storybook/test";
import "../date-window-dialog";

/**
 * `date-window-dialog` renders the Add / Edit date window dialog.
 * It wraps `ha-dialog` and provides a controlled form for setting a named date range.
 *
 * The component is fully controlled — all field values come from props and
 * the parent updates them in response to events.
 *
 * @fires dp-window-close - `{}` fired when Cancel is clicked or the dialog is dismissed
 * @fires dp-window-submit - `{ name: string, start: string, end: string }` fired on submit
 * @fires dp-window-delete - `{}` fired when the Delete button is clicked
 * @fires dp-window-shortcut - `{ direction: -1 | 1 }` fired when a shortcut button is clicked
 * @fires dp-window-date-change - `{ start: string, end: string }` fired when a date input changes
 */
export default {
  title: "Molecules/Date Window Dialog",
  component: "date-window-dialog",
  parameters: {
    actions: {
      handles: [
        "dp-window-close",
        "dp-window-submit",
        "dp-window-delete",
        "dp-window-shortcut",
        "dp-window-date-change",
      ],
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the dialog is open.",
    },
    heading: {
      control: "text",
      description: "Title shown in the dialog header.",
    },
    name: {
      control: "text",
      description: "Current value of the name text field.",
    },
    startValue: {
      control: "text",
      description: "Current value of the start datetime-local input.",
    },
    endValue: {
      control: "text",
      description: "Current value of the end datetime-local input.",
    },
    showDelete: {
      control: "boolean",
      description:
        "Whether the Delete button is shown (true when editing an existing window).",
    },
    showShortcuts: {
      control: "boolean",
      description:
        "Whether the 'Use previous/next range' shortcut buttons are shown.",
    },
    submitLabel: {
      control: "text",
      description:
        'Label for the submit button. E.g. "Create date window" or "Save date window".',
    },
  },
  args: {
    open: true,
    heading: "Add date window",
    name: "",
    startValue: "",
    endValue: "",
    showDelete: false,
    showShortcuts: false,
    submitLabel: "Create date window",
  },
  render: (args: RecordWithUnknownValues) => html`
    <date-window-dialog
      .open=${args.open}
      .heading=${args.heading}
      .name=${args.name}
      .startValue=${args.startValue}
      .endValue=${args.endValue}
      .showDelete=${args.showDelete}
      .showShortcuts=${args.showShortcuts}
      .submitLabel=${args.submitLabel}
    ></date-window-dialog>
  `,
};

/** Add mode — empty name field, no delete button, shortcut buttons visible. */
export const AddMode = {
  args: {
    heading: "Add date window",
    startValue: "2025-01-01T00:00",
    endValue: "2025-01-07T00:00",
    showShortcuts: true,
    submitLabel: "Create date window",
  },
};

/** Edit mode — pre-filled name, delete button shown, no shortcuts. */
export const EditMode = {
  args: {
    heading: "Edit date window",
    name: "Heating season",
    startValue: "2024-11-01T00:00",
    endValue: "2025-03-31T00:00",
    showDelete: true,
    showShortcuts: false,
    submitLabel: "Save date window",
  },
};

/** Dialog closed — open=false, dialog is not visible. */
export const Closed = {
  args: { open: false },
};

/** Fires dp-window-submit when the submit button is clicked. */
export const EmitsSubmit = {
  args: {
    name: "Test window",
    startValue: "2025-01-01T00:00",
    endValue: "2025-01-07T00:00",
    submitLabel: "Create date window",
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector(
      "date-window-dialog"
    ) as HTMLElement;
    const handler = fn();
    host.addEventListener("dp-window-submit", handler);
    const canvas = within(host.shadowRoot as unknown as HTMLElement);
    await userEvent.click(canvas.getByText("Create date window"));
    await expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail as {
      name: string;
      start: string;
      end: string;
    };
    await expect(detail).toHaveProperty("name");
    await expect(detail).toHaveProperty("start");
    await expect(detail).toHaveProperty("end");
  },
};

/** Fires dp-window-delete when the delete button is clicked in edit mode. */
export const EmitsDelete = {
  args: {
    heading: "Edit date window",
    name: "Heating season",
    startValue: "2024-11-01T00:00",
    endValue: "2025-03-31T00:00",
    showDelete: true,
    submitLabel: "Save date window",
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector(
      "date-window-dialog"
    ) as HTMLElement;
    const handler = fn();
    host.addEventListener("dp-window-delete", handler);
    const canvas = within(host.shadowRoot as unknown as HTMLElement);
    await userEvent.click(canvas.getByText("Delete date window"));
    await expect(handler).toHaveBeenCalledOnce();
  },
};
