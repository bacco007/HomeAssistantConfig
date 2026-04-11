import { html } from "lit";
import "../page-menu-item";

export default {
  title: "Atoms/Interactive/Page Menu Item",
  component: "page-menu-item",
};

export const Default = {
  render: () => html`
    <page-menu-item
      .icon=${"mdi:chart-line"}
      .label=${"History"}
    ></page-menu-item>
  `,
};

export const Settings = {
  render: () => html`
    <page-menu-item .icon=${"mdi:cog"} .label=${"Settings"}></page-menu-item>
  `,
};

export const Disabled = {
  render: () => html`
    <page-menu-item
      .icon=${"mdi:delete"}
      .label=${"Delete"}
      .disabled=${true}
    ></page-menu-item>
  `,
};
