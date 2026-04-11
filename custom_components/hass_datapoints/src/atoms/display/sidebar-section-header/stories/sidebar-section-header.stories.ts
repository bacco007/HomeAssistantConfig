import { html } from "lit";
import "../sidebar-section-header";

export default {
  title: "Atoms/Display/Sidebar Section Header",
  component: "sidebar-section-header",
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
  },
};

export const Default = {
  render: () => html`
    <sidebar-section-header
      .title=${"Target Analysis"}
      .subtitle=${"3 entities tracked"}
    ></sidebar-section-header>
  `,
};

export const TitleOnly = {
  render: () => html`
    <sidebar-section-header .title=${"Filters"}></sidebar-section-header>
  `,
};

export const LongSubtitle = {
  render: () => html`
    <sidebar-section-header
      .title=${"Data Points"}
      .subtitle=${"Showing results for the last 30 days across all entities"}
    ></sidebar-section-header>
  `,
};
