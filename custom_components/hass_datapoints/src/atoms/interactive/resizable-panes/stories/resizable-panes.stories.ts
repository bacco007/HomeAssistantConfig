import { html } from "lit";
import "../resizable-panes";

export default {
  title: "Atoms/Interactive/Resizable Panes",
  component: "resizable-panes",
  parameters: {
    actions: { handles: ["dp-panes-resize"] },
  },
};

const paneStyle = (color: string) =>
  `display:flex;align-items:center;justify-content:center;height:100%;background:${color};color:#fff;font-size:0.85rem;border-radius:4px;`;

export const Default = {
  render: () => html`
    <resizable-panes style="display:block;height:300px;">
      <div slot="first" style=${paneStyle("var(--primary-color, #03a9f4)")}>
        First pane
      </div>
      <div slot="second" style=${paneStyle("var(--accent-color, #ff9800)")}>
        Second pane
      </div>
    </resizable-panes>
  `,
};

export const Horizontal = {
  render: () => html`
    <resizable-panes
      .direction=${"horizontal"}
      style="display:block;height:300px;"
    >
      <div slot="first" style=${paneStyle("var(--primary-color, #03a9f4)")}>
        Left pane
      </div>
      <div slot="second" style=${paneStyle("var(--accent-color, #ff9800)")}>
        Right pane
      </div>
    </resizable-panes>
  `,
};

export const CustomRatio = {
  render: () => html`
    <resizable-panes .ratio=${0.3} style="display:block;height:300px;">
      <div slot="first" style=${paneStyle("var(--primary-color, #03a9f4)")}>
        30% pane
      </div>
      <div slot="second" style=${paneStyle("var(--accent-color, #ff9800)")}>
        70% pane
      </div>
    </resizable-panes>
  `,
};

export const SecondHidden = {
  render: () => html`
    <resizable-panes .secondHidden=${true} style="display:block;height:300px;">
      <div slot="first" style=${paneStyle("var(--primary-color, #03a9f4)")}>
        Full-width pane
      </div>
      <div slot="second" style=${paneStyle("var(--accent-color, #ff9800)")}>
        Hidden pane
      </div>
    </resizable-panes>
  `,
};
