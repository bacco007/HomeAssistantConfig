import { html } from "lit";
import { expect } from "@storybook/test";
import "../panel-shell";
import { setFrontendLocale } from "@/lib/i18n/localize";

/**
 * `panel-shell` provides the outer layout shell for the Datapoints panel.
 * It renders the top app bar, collapsible sidebar, controls bar, and main content area.
 *
 * Content is projected via named slots:
 * - `controls` — range toolbar in the controls bar
 * - `sidebar` — history targets in the sidebar
 * - `sidebar-options` — options panel at the bottom of the sidebar
 * - (default) — main chart content
 */
export default {
  title: "Panels/Datapoints/Panel Shell",
  component: "panel-shell",
  parameters: {
    layout: "fullscreen",
    actions: {
      handles: [
        "dp-shell-menu-download",
        "dp-shell-menu-save",
        "dp-shell-menu-restore",
        "dp-shell-menu-clear",
        "dp-shell-sidebar-toggle",
        "dp-shell-scrim-click",
      ],
    },
  },
  argTypes: {
    sidebarCollapsed: {
      control: "boolean",
      description: "Whether the sidebar is in collapsed state.",
    },
    hasSavedState: {
      control: "boolean",
      description:
        "Whether a saved page state exists (shows Restore/Clear menu items).",
    },
    layoutMode: {
      control: { type: "select" },
      options: ["desktop", "tablet", "mobile"],
      description: "Layout mode — affects sidebar scrim visibility.",
    },
  },
  args: {
    sidebarCollapsed: false,
    hasSavedState: false,
    layoutMode: "desktop",
  },
  loaders: [
    async () => {
      await setFrontendLocale("en");
      return {};
    },
  ],
  render: (args: RecordWithUnknownValues) => html`
    <panel-shell
      .sidebarCollapsed=${args.sidebarCollapsed}
      .hasSavedState=${args.hasSavedState}
      .layoutMode=${args.layoutMode}
      style="display: block; height: 100vh;"
    >
      <div
        slot="controls"
        style="padding: 8px 16px; color: var(--secondary-text-color); font-size: 0.9rem;"
      >
        [Range toolbar slot]
      </div>
      <div
        slot="sidebar"
        style="padding: 8px; color: var(--secondary-text-color); font-size: 0.85rem;"
      >
        [Sidebar targets slot]
      </div>
      <div
        slot="sidebar-options"
        style="padding: 8px; color: var(--secondary-text-color); font-size: 0.85rem;"
      >
        [Sidebar options slot]
      </div>
      <div style="padding: 24px; color: var(--secondary-text-color);">
        [Main chart content slot]
      </div>
    </panel-shell>
  `,
};

/** Default desktop layout — sidebar expanded, no saved state. */
export const Default = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const shell = canvasElement.querySelector("panel-shell") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const title = shell.shadowRoot.querySelector('[slot="title"]');
    expect(title?.textContent).toBe("Datapoints");
  },
};

/** Sidebar collapsed — sidebar shows narrow icon strip. */
export const SidebarCollapsed = {
  args: {
    sidebarCollapsed: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const shell = canvasElement.querySelector("panel-shell") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const sidebarOptions =
      shell.shadowRoot.querySelector<HTMLElement>(".sidebar-options");

    expect(getComputedStyle(sidebarOptions!).visibility).toBe("hidden");
    expect(getComputedStyle(sidebarOptions!).pointerEvents).toBe("none");
  },
};

/** Has saved state — Restore and Clear items visible in the page menu. */
export const WithSavedState = {
  args: {
    hasSavedState: true,
  },
};

/** Sidebar expanded with all page menu items shown. */
export const AllMenuItems = {
  args: {
    hasSavedState: true,
    sidebarCollapsed: false,
  },
};

export const Finnish = {
  args: {
    hasSavedState: true,
  },
  loaders: [
    async () => {
      await setFrontendLocale("fi");
      return {};
    },
  ],
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const shell = canvasElement.querySelector("panel-shell") as HTMLElement & {
      shadowRoot: ShadowRoot;
    };
    const menuButton = shell.shadowRoot.querySelector("#page-menu-button");
    const sidebarToggle = shell.shadowRoot.querySelector("#sidebar-toggle");

    expect(menuButton?.getAttribute("label")).toBe("Sivun asetukset");
    expect(sidebarToggle?.getAttribute("label")).toBe(
      "Kutista kohteiden sivupalkki"
    );
  },
};
