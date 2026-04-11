import type { HistoryOrchestrationContext } from "./types";

type DrawHost = HTMLElement & {
  _drawChart?: (...args: unknown[]) => void;
  _queueDrawChart?: (...args: unknown[]) => void;
  _lastDrawArgs?: unknown[];
};

type PickerLike = Element & { open?: () => void };

function getInnerHistoryChart(
  chartEl: Nullable<HTMLElement>
): Nullable<HTMLElement> {
  if (!chartEl?.shadowRoot) {
    return null;
  }

  return (
    chartEl.shadowRoot.querySelector?.("hass-datapoints-history-chart") ??
    chartEl.shadowRoot.querySelector?.("dp-history-chart") ??
    chartEl.shadowRoot.querySelector?.("history-chart") ??
    null
  );
}

function getComparisonTabsHost(
  chartEl: Nullable<HTMLElement>
): Nullable<HTMLElement> {
  const innerChart = getInnerHistoryChart(chartEl);
  return innerChart?.querySelector?.("#chart-top-slot") ?? null;
}

function ensureCollapsedPickerAnchor(
  targetControl: HTMLElement,
  anchorEl: Nullable<HTMLElement> | undefined
): void {
  const assignedSlot =
    (
      targetControl as HTMLElement & {
        assignedSlot?: Nullable<HTMLSlotElement>;
      }
    ).assignedSlot ?? null;
  if (!assignedSlot) {
    return;
  }

  const slotContainer =
    assignedSlot.parentElement instanceof HTMLElement
      ? assignedSlot.parentElement
      : null;
  let hiddenAnchorHost: Nullable<HTMLElement> = null;
  if (
    slotContainer &&
    window.getComputedStyle(slotContainer).display === "none"
  ) {
    hiddenAnchorHost = slotContainer;
  } else if (window.getComputedStyle(assignedSlot).display === "none") {
    hiddenAnchorHost = assignedSlot;
  }
  if (!hiddenAnchorHost) {
    return;
  }

  const anchorRect = anchorEl?.getBoundingClientRect();
  const popupWidth = Math.max(320, Math.round(anchorRect?.width ?? 1));
  const viewportPadding = 8;
  const left = Math.max(
    viewportPadding,
    Math.min(
      Math.round(anchorRect?.left ?? 0),
      window.innerWidth - popupWidth - viewportPadding
    )
  );
  const top = Math.round(anchorRect?.top ?? 0);
  const width = popupWidth;
  const height = Math.max(1, Math.round(anchorRect?.height ?? 1));

  hiddenAnchorHost.style.display = "block";
  hiddenAnchorHost.style.position = "fixed";
  hiddenAnchorHost.style.left = `${left}px`;
  hiddenAnchorHost.style.top = `${top}px`;
  hiddenAnchorHost.style.width = `${width}px`;
  hiddenAnchorHost.style.height = `${height}px`;
  hiddenAnchorHost.style.margin = "0";
  hiddenAnchorHost.style.padding = "0";
  hiddenAnchorHost.style.opacity = "0";
  hiddenAnchorHost.style.pointerEvents = "none";
  hiddenAnchorHost.style.overflow = "visible";
  hiddenAnchorHost.style.zIndex = "2147483647";

  targetControl.style.display = "block";
  targetControl.style.width = `${width}px`;
  targetControl.style.height = `${height}px`;
  targetControl.style.opacity = "0";
  targetControl.style.pointerEvents = "none";
}

export function createHistoryPageOrchestrationContext(): HistoryOrchestrationContext {
  let chartResizeRaf: Nullable<number> = null;

  return {
    requestChartResizeRedraw(chartEl: Nullable<HTMLElement>): void {
      if (chartResizeRaf != null) {
        return;
      }

      let ranSynchronously = false;
      const rafId = window.requestAnimationFrame(() => {
        ranSynchronously = true;
        chartResizeRaf = null;
        if (!chartEl) {
          return;
        }
        if (
          Array.isArray(
            (chartEl as { _lastDrawArgs?: unknown[] })._lastDrawArgs
          ) &&
          (chartEl as { _lastDrawArgs?: unknown[] })._lastDrawArgs!.length >
            0 &&
          typeof (chartEl as { _drawChart?: (...args: unknown[]) => void })
            ._drawChart === "function"
        ) {
          (chartEl as unknown as DrawHost)._drawChart!(
            ...(chartEl as unknown as DrawHost)._lastDrawArgs!
          );
          return;
        }

        const innerChart = getInnerHistoryChart(chartEl);
        if (
          innerChart &&
          Array.isArray(
            (innerChart as { _lastDrawArgs?: unknown[] })._lastDrawArgs
          ) &&
          (innerChart as { _lastDrawArgs?: unknown[] })._lastDrawArgs!.length >
            0
        ) {
          if (
            typeof (
              innerChart as { _queueDrawChart?: (...args: unknown[]) => void }
            )._queueDrawChart === "function"
          ) {
            (innerChart as unknown as DrawHost)._queueDrawChart!(
              ...(innerChart as unknown as DrawHost)._lastDrawArgs!
            );
            return;
          }

          if (
            typeof (innerChart as { _drawChart?: (...args: unknown[]) => void })
              ._drawChart === "function"
          ) {
            (innerChart as unknown as DrawHost)._drawChart!(
              ...(innerChart as unknown as DrawHost)._lastDrawArgs!
            );
          }
        }
      });

      chartResizeRaf = ranSynchronously ? null : rafId;
    },

    cancelChartResizeRedraw(): void {
      if (chartResizeRaf != null) {
        window.cancelAnimationFrame(chartResizeRaf);
        chartResizeRaf = null;
      }
    },

    openTargetPicker(
      targetControl: Nullable<HTMLElement>,
      anchorEl?: Nullable<HTMLElement>
    ): void {
      if (!targetControl) {
        return;
      }

      ensureCollapsedPickerAnchor(targetControl, anchorEl);

      const genericPicker =
        (targetControl.shadowRoot?.querySelector?.(
          "ha-generic-picker"
        ) as Nullable<PickerLike>) ?? null;
      if (genericPicker && typeof genericPicker.open === "function") {
        genericPicker.open();
        return;
      }
      if (
        typeof (targetControl as { focus?: () => void }).focus === "function"
      ) {
        (targetControl as { focus: () => void }).focus();
      }
      if (
        typeof (targetControl as { click?: () => void }).click === "function"
      ) {
        (targetControl as { click: () => void }).click();
      }
    },

    renderComparisonTabs(options) {
      const tabsEl = getComparisonTabsHost(options.chartEl);
      if (!tabsEl || !options.startTime || !options.endTime) {
        return {
          comparisonTabRailComp: options.comparisonTabRailComp,
          comparisonTabsHostEl: options.comparisonTabsHostEl,
        };
      }

      const activeComparisonWindowId =
        options.selectedComparisonWindowId || null;
      const currentTab =
        options.startTime && options.endTime
          ? {
              id: "current-range",
              label: "Selected range",
              detail: options.formatComparisonLabel(
                options.startTime,
                options.endTime
              ),
              active: activeComparisonWindowId == null,
              editable: false,
            }
          : null;
      const tabs = [
        ...(currentTab ? [currentTab] : []),
        ...options.comparisonWindows.map((window) => ({
          ...window,
          detail: options.formatComparisonLabel(
            new Date(window.start_time),
            new Date(window.end_time)
          ),
          active: window.id === activeComparisonWindowId,
          editable: true,
        })),
      ];
      tabsEl.hidden = false;

      let comparisonTabRailComp = options.comparisonTabRailComp;
      let comparisonTabsHostEl = options.comparisonTabsHostEl;

      if (!comparisonTabRailComp || comparisonTabsHostEl !== tabsEl) {
        tabsEl.innerHTML = "";
        const rail = document.createElement("comparison-tab-rail");
        rail.addEventListener("dp-tab-activate", (ev) =>
          options.onActivate((ev as CustomEvent).detail.tabId)
        );
        rail.addEventListener("dp-tab-hover", (ev) =>
          options.onHover((ev as CustomEvent).detail.tabId)
        );
        rail.addEventListener("dp-tab-leave", (ev) =>
          options.onLeave((ev as CustomEvent).detail.tabId)
        );
        rail.addEventListener("dp-tab-edit", (ev) =>
          options.onEdit((ev as CustomEvent).detail.tabId)
        );
        rail.addEventListener("dp-tab-delete", (ev) =>
          options.onDelete((ev as CustomEvent).detail.tabId)
        );
        rail.addEventListener("dp-tab-add", () => options.onAdd());
        tabsEl.appendChild(rail);
        comparisonTabRailComp = rail;
        comparisonTabsHostEl = tabsEl;
      }

      (
        comparisonTabRailComp as unknown as {
          tabs: unknown[];
          loadingIds: string[];
          hoveredId: string;
        }
      ).tabs = tabs;
      (
        comparisonTabRailComp as unknown as {
          tabs: unknown[];
          loadingIds: string[];
          hoveredId: string;
        }
      ).loadingIds = [...options.loadingComparisonWindowIds];
      (
        comparisonTabRailComp as unknown as {
          tabs: unknown[];
          loadingIds: string[];
          hoveredId: string;
        }
      ).hoveredId = options.hoveredComparisonWindowId || "";

      return {
        comparisonTabRailComp,
        comparisonTabsHostEl,
      };
    },

    updateComparisonTabsOverflow(chartEl: Nullable<HTMLElement>): void {
      window.requestAnimationFrame(() => {
        const innerChart = getInnerHistoryChart(chartEl);
        const shell = innerChart?.querySelector?.("#chart-tabs-shell") ?? null;
        const rail = innerChart?.querySelector?.("#chart-tabs-rail") ?? null;
        if (!shell || !rail) {
          return;
        }
        shell.classList.toggle(
          "overflowing",
          rail.scrollWidth > rail.clientWidth + 4
        );
      });
    },

    handleComparisonTabHover(options): void {
      if (!options.id || options.hoveredComparisonWindowId === options.id) {
        return;
      }
      options.setHoveredComparisonWindowId(options.id);
      options.updateComparisonRangePreview();
      options.updateChartHoverIndicator();
      options.renderContent();
    },

    handleComparisonTabLeave(options): void {
      if (!options.id || options.hoveredComparisonWindowId !== options.id) {
        return;
      }
      options.setHoveredComparisonWindowId(null);
      options.updateComparisonRangePreview();
      options.updateChartHoverIndicator();
      options.renderContent();
    },

    handleComparisonTabActivate(options): void {
      if (!options.id || options.id === "current-range") {
        options.setSelectedComparisonWindowId(null);
        options.setHoveredComparisonWindowId(null);
        options.clearDeltaAnalysisSelectionState();
        options.updateComparisonRangePreview();
        options.renderComparisonTabs();
        options.setAdjustComparisonAxisScale(false);
        options.renderContent();
        return;
      }

      const targetWindow = options.comparisonWindows.find(
        (window) => window.id === options.id
      );
      if (!targetWindow) {
        return;
      }

      const nextSelectedWindowId =
        options.selectedComparisonWindowId === options.id ? null : options.id;
      options.setSelectedComparisonWindowId(nextSelectedWindowId);
      if (!nextSelectedWindowId) {
        options.clearDeltaAnalysisSelectionState();
      }
      options.updateComparisonRangePreview();
      options.updateChartHoverIndicator();
      options.renderContent();
    },
  };
}
