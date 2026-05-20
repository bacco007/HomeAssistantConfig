import { html } from "lit";
import "../ai-query-brief-dialog";

const meta = {
  title: "Panels/Datapoints/AiQueryBriefDialog",
  component: "ai-query-brief-dialog",
};

export default meta;

export const Default = {
  render: () => html`
    <ai-query-brief-dialog
      .open=${true}
      .heading=${"AI query brief"}
      .text=${`AI query brief for the Home Assistant Datapoints panel\n\nSelected entity ids: sensor.temperature`}
    ></ai-query-brief-dialog>
  `,
};
