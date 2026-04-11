import { html } from "lit";
import { expect, userEvent } from "@storybook/test";
import "../analysis-checkbox";

export default {
  title: "Atoms/Form/Analysis Checkbox",
  component: "analysis-checkbox",
};

export const Unchecked = {
  render: () => html`
    <analysis-checkbox .label=${"Enable threshold"}></analysis-checkbox>
  `,
};

export const Checked = {
  render: () => html`
    <analysis-checkbox
      .checked=${true}
      .label=${"Show trend line"}
    ></analysis-checkbox>
  `,
};

export const Disabled = {
  render: () => html`
    <analysis-checkbox
      .label=${"Moving average"}
      .disabled=${true}
    ></analysis-checkbox>
  `,
};

export const WithHelpText = {
  render: () => html`
    <analysis-checkbox
      .label=${"Threshold"}
      .helpText=${"Draws a horizontal reference line at the specified value"}
      .helpId=${"threshold-help"}
    ></analysis-checkbox>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector(
      "analysis-checkbox"
    ) as HTMLElement & { shadowRoot: ShadowRoot };
    const input = el.shadowRoot.querySelector("input") as HTMLInputElement;
    const tooltip = el.shadowRoot.querySelector("ha-tooltip");
    expect(tooltip).toBeTruthy();
    await userEvent.click(input);
    expect(input.checked).toBe(true);
  },
};

export const CheckedWithHelp = {
  render: () => html`
    <analysis-checkbox
      .checked=${true}
      .label=${"Standard deviation"}
      .helpText=${"Shows the standard deviation band around the mean"}
      .helpId=${"stddev-help"}
    ></analysis-checkbox>
  `,
};
