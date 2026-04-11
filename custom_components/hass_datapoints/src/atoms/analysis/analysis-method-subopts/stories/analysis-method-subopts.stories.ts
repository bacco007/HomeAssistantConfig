import { html } from "lit";
import "../analysis-method-subopts";

export default {
  title: "Atoms/Analysis/Analysis Method Subopts",
  component: "analysis-method-subopts",
};

export const Default = {
  render: () => html`
    <analysis-method-subopts>
      <label style="display:grid;gap:4px;">
        <span
          style="font-size:0.72rem;font-weight:600;color:var(--secondary-text-color);"
          >Rate window</span
        >
        <select
          style="padding:6px 7px;border-radius:10px;border:1px solid rgba(0,0,0,0.12);"
        >
          <option>1 hour</option>
          <option>6 hours</option>
          <option>24 hours</option>
        </select>
      </label>
    </analysis-method-subopts>
  `,
};

export const WithMultipleOptions = {
  render: () => html`
    <analysis-method-subopts>
      <label style="display:grid;gap:4px;">
        <span
          style="font-size:0.72rem;font-weight:600;color:var(--secondary-text-color);"
          >Rolling window</span
        >
        <select
          style="padding:6px 7px;border-radius:10px;border:1px solid rgba(0,0,0,0.12);"
        >
          <option>1 hour</option>
          <option>6 hours</option>
          <option>24 hours</option>
          <option>7 days</option>
        </select>
      </label>
    </analysis-method-subopts>
  `,
};
