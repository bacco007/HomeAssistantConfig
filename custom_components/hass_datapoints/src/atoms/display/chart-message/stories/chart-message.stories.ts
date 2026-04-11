import { html } from "lit";
import { expect } from "@storybook/test";
import "../chart-message";

export default {
  title: "Atoms/Display/Chart Message",
  component: "chart-message",
  argTypes: {
    message: { control: "text" },
  },
};

export const Hidden = {
  render: () => html`
    <div style="position: relative; height: 200px; background: #1c1c1c;">
      <chart-message></chart-message>
    </div>
  `,
};

export const WithMessage = {
  render: () => html`
    <div style="position: relative; height: 200px; background: #1c1c1c;">
      <chart-message
        .message=${"No data available for this period"}
      ></chart-message>
    </div>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("chart-message") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    expect(el.shadowRoot.textContent).toContain(
      "No data available for this period"
    );
  },
};

export const ErrorMessage = {
  render: () => html`
    <div style="position: relative; height: 200px; background: #1c1c1c;">
      <chart-message .message=${"Failed to load history data"}></chart-message>
    </div>
  `,
};
