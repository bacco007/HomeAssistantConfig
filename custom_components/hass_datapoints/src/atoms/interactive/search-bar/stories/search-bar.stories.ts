import { html } from "lit";
import { expect, userEvent } from "@storybook/test";
import "../search-bar";

export default {
  title: "Atoms/Interactive/Search Bar",
  component: "search-bar",
};

export const Empty = {
  render: () => html`
    <search-bar .placeholder=${"Search records..."}></search-bar>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("search-bar") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const input = el.shadowRoot.querySelector("input") as HTMLInputElement;
    expect(input.placeholder).toBe("Search records...");
    await userEvent.type(input, "motion");
    expect(input.value).toBe("motion");
  },
};

export const WithQuery = {
  render: () => html`
    <search-bar
      .query=${"temperature"}
      .placeholder=${"Search records..."}
    ></search-bar>
  `,
};
