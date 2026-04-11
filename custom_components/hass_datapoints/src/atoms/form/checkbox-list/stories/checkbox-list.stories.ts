import { html } from "lit";
import "../checkbox-list";

export default {
  title: "Atoms/Form/Checkbox List",
  component: "checkbox-list",
};

export const Default = {
  render: () => html`
    <checkbox-list
      .items=${[
        { name: "temperature", label: "Temperature", checked: true },
        { name: "humidity", label: "Humidity", checked: false },
        { name: "pressure", label: "Pressure", checked: true },
      ]}
    ></checkbox-list>
  `,
};

export const AllChecked = {
  render: () => html`
    <checkbox-list
      .items=${[
        { name: "mean", label: "Mean", checked: true },
        { name: "min", label: "Min", checked: true },
        { name: "max", label: "Max", checked: true },
      ]}
    ></checkbox-list>
  `,
};

export const NoneChecked = {
  render: () => html`
    <checkbox-list
      .items=${[
        { name: "series_a", label: "Series A", checked: false },
        { name: "series_b", label: "Series B", checked: false },
      ]}
    ></checkbox-list>
  `,
};
