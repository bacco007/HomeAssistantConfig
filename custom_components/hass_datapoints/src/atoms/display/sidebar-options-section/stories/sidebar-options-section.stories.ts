import { html } from "lit";
import "../sidebar-options-section";

/**
 * `sidebar-options-section` is a layout atom that wraps a titled sidebar section.
 * It composes `sidebar-section-header` for the heading and exposes a default slot
 * for any body content (radio groups, checkbox lists, selects, etc.).
 */
export default {
  title: "Atoms/Display/Sidebar Options Section",
  component: "sidebar-options-section",
  argTypes: {
    title: {
      control: "text",
      description: "The section heading text.",
    },
    subtitle: {
      control: "text",
      description:
        "Optional subtitle shown below the heading in a smaller muted style.",
    },
  },
  args: {
    title: "Chart Display",
    subtitle: "Configure visual and interaction behaviour for the chart.",
  },
  render: (args: RecordWithUnknownValues) => html`
    <sidebar-options-section .title=${args.title} .subtitle=${args.subtitle}>
      <div style="color: var(--secondary-text-color); font-size: 0.9rem;">
        Slotted body content goes here.
      </div>
    </sidebar-options-section>
  `,
};

/** Default section with title, subtitle, and placeholder body content. */
export const Default = {};

/** Section with no subtitle — only the title is shown. */
export const TitleOnly = {
  args: { subtitle: "" },
};

/** A realistic example with a checkbox-list as the slotted body. */
export const WithCheckboxList = {
  render: () => html`
    <sidebar-options-section
      title="Datapoints"
      subtitle="Choose which annotation datapoints appear on the chart."
    >
      <p
        style="margin: 0; color: var(--secondary-text-color); font-size: 0.9rem;"
      >
        (Body content slotted in here)
      </p>
    </sidebar-options-section>
  `,
};
