import { html } from "lit";
import "../chart-shell";

export default {
  title: "Molecules/Chart Shell",
  component: "chart-shell",
};

export const WithTitle = {
  render: () => html`
    <chart-shell card-title="Temperature History">
      <div
        style="height: 200px; background: #333; display: flex; align-items: center; justify-content: center; color: #888;"
      >
        Canvas area
      </div>
    </chart-shell>
  `,
};

export const Loading = {
  render: () => html`
    <chart-shell card-title="Loading..." .loading=${true}>
      <div style="height: 200px; background: #333;"></div>
    </chart-shell>
  `,
};

export const WithMessage = {
  render: () => html`
    <chart-shell card-title="History" .message=${"No data available"}>
      <div style="height: 200px; background: #333;"></div>
    </chart-shell>
  `,
};
