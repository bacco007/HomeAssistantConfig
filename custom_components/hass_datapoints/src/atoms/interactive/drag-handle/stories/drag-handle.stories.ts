import { html } from "lit";
import "../drag-handle";

export default {
  title: "Atoms/Interactive/Drag Handle",
  component: "drag-handle",
};

export const Default = {
  render: () => html` <drag-handle></drag-handle> `,
};

export const WithLabel = {
  render: () => html`
    <drag-handle .label=${"Reorder temperature"}></drag-handle>
  `,
};
