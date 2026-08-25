import { html } from "lit";
import { EditorBase } from "../editor-base";
import "@/atoms/form/editor-text-field/editor-text-field";
import "@/atoms/form/editor-switch/editor-switch";
import { setFrontendLocale } from "@/lib/i18n/localize";

// Minimal concrete subclass used only in these stories.
class DemoEditor extends EditorBase {
  render() {
    return html`
      <editor-text-field
        label="Title"
        .value=${this._config.title ?? ""}
        @dp-change=${(e: CustomEvent<{ value: string }>) =>
          this._set("title", e.detail.value)}
      ></editor-text-field>
      <editor-switch
        label="Show footer"
        .checked=${this._config.show_footer !== false}
        @dp-change=${(e: CustomEvent<{ checked: boolean }>) =>
          this._set("show_footer", e.detail.checked)}
      ></editor-switch>
    `;
  }
}
if (!customElements.get("demo-editor")) {
  customElements.define("demo-editor", DemoEditor);
}

export default {
  title: "Molecules/Editor Base",
  component: "demo-editor",
  loaders: [
    async () => {
      await setFrontendLocale("en");
    },
  ],
  parameters: {
    actions: { handles: ["config-changed"] },
  },
};

export const Default = {
  render: () => html`<demo-editor></demo-editor>`,
};

export const WithConfig = {
  render: () => {
    const el = document.createElement("demo-editor") as HTMLElement & {
      setConfig(cfg: Record<string, unknown>): void;
    };
    el.setConfig({ title: "My Card", show_footer: false });
    return el;
  },
};
