import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { PropertyValues } from "lit";
import { DOMAIN } from "@/constants";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./anomaly-monitors-panel.styles";
import {
  fetchMonitors,
  updateMonitor,
  deleteMonitor,
  monitorEntityIds,
  fetchMonitorAnomalies,
  dismissMonitorAnomaly,
  undismissMonitorAnomaly,
  type AnomalyMonitor,
  type CombinedMonitor,
  type AnomalyCluster,
  type DismissedWindow,
  type ScanHistoryEntry,
} from "@/lib/data/monitors-api";
import type { HassLike } from "@/lib/types";
import { confirmDestructiveAction } from "@/lib/ha/ha-components";
import "@/molecules/anomaly-monitor-wizard/anomaly-monitor-wizard";
import "@/atoms/form/entity-chip/entity-chip";

/**
 * `anomaly-monitors-panel` shows a management view of all anomaly monitors.
 *
 * @fires dp-monitors-panel-close  — user clicked the back/close button
 * @fires dp-monitors-panel-new    — user clicked "New monitor"
 */
@localized()
export class AnomalyMonitorsPanel extends LitElement {
  static styles = styles;

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  @state() accessor _monitors: AnomalyMonitor[] = [];

  @state() accessor _loading: boolean = true;

  @state() accessor _editMonitor: AnomalyMonitor | null = null;

  @state() accessor _wizardOpen: boolean = false;

  /** Clusters loaded per monitor ID (only for monitors currently showing anomalies). */
  @state() accessor _monitorClusters: Map<string, AnomalyCluster[]> = new Map();

  /** Monitor IDs currently loading their cluster list. */
  @state() accessor _loadingClusters: Set<string> = new Set();

  /** Tracks which monitor+cluster is showing the dismiss expiry picker. Key: `${monitorId}:${clusterIndex}` */
  @state() accessor _dismissPickerKey: string | null = null;

  private _pollInterval: ReturnType<typeof setInterval> | null = null;

  private _monitorsEventUnsubscribe: Nullable<() => void> = null;

  private _monitorsSubscriptionToken = 0;

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) {
      this._scheduleLoad();
      this._scheduleMonitorSubscription();
    }
    this._pollInterval = setInterval(() => this._load(), 30_000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._pollInterval !== null) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
    this._teardownMonitorSubscription();
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("hass")) {
      this._teardownMonitorSubscription();
      this._scheduleMonitorSubscription();
      this._scheduleLoad();
    }
  }

  private _scheduleLoad() {
    this._load().catch(() => {});
  }

  private _scheduleMonitorSubscription() {
    this._ensureMonitorSubscription().catch(() => {});
  }

  private async _ensureMonitorSubscription() {
    if (!this.hass?.connection || this._monitorsEventUnsubscribe) {
      return;
    }

    const token = ++this._monitorsSubscriptionToken;
    try {
      const unsubscribe = await this.hass.connection.subscribeEvents(() => {
        this._scheduleLoad();
      }, `${DOMAIN}_monitors_updated`);
      if (!this.isConnected || token !== this._monitorsSubscriptionToken) {
        unsubscribe();
        return;
      }
      this._monitorsEventUnsubscribe = unsubscribe;
    } catch {
      // ignore
    }
  }

  private _teardownMonitorSubscription() {
    this._monitorsSubscriptionToken += 1;
    if (this._monitorsEventUnsubscribe) {
      this._monitorsEventUnsubscribe();
      this._monitorsEventUnsubscribe = null;
    }
  }

  private async _load() {
    if (!this.hass) {
      return;
    }
    try {
      this._monitors = await fetchMonitors(this.hass);
    } catch {
      // ignore
    } finally {
      this._loading = false;
    }
  }

  private _emit(name: string, detail: RecordWithUnknownValues = {}) {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true })
    );
  }

  private _onNewMonitor() {
    this._editMonitor = null;
    this._wizardOpen = true;
  }

  private _onClose() {
    this._emit("dp-monitors-panel-close");
  }

  private _onEdit(monitor: AnomalyMonitor) {
    this._editMonitor = monitor;
    this._wizardOpen = true;
  }

  private _onWizardClose() {
    this._wizardOpen = false;
    this._editMonitor = null;
  }

  private async _onWizardSaved() {
    this._wizardOpen = false;
    this._editMonitor = null;
    await this._load();
  }

  private async _onToggleEnabled(monitor: AnomalyMonitor) {
    if (!this.hass) return;
    await updateMonitor(this.hass, {
      monitor_id: monitor.id,
      enabled: !monitor.enabled,
    });
    await this._load();
  }

  private async _onDelete(monitor: AnomalyMonitor) {
    if (!this.hass) return;

    const confirmed = await confirmDestructiveAction(this, {
      title: msg(`Delete "${monitor.name}"?`),
      message: msg(
        "This cannot be undone. The monitor device and all its sensors will be removed."
      ),
      confirmLabel: msg("Delete"),
    });
    if (!confirmed) {
      return;
    }
    await deleteMonitor(this.hass, monitor.id);
    await this._load();
  }

  private async _loadClusters(monitorId: string) {
    if (!this.hass || this._loadingClusters.has(monitorId)) return;
    this._loadingClusters = new Set([...this._loadingClusters, monitorId]);
    try {
      const result = await fetchMonitorAnomalies(this.hass, monitorId);
      const updated = new Map(this._monitorClusters);
      updated.set(monitorId, result.anomaly_clusters);
      this._monitorClusters = updated;
    } catch {
      // ignore — UI will fall back to count display
    } finally {
      const next = new Set(this._loadingClusters);
      next.delete(monitorId);
      this._loadingClusters = next;
    }
  }

  private async _onDismiss(
    monitor: AnomalyMonitor,
    cluster: AnomalyCluster,
    expiresAt: string | null | undefined
  ) {
    if (!this.hass) return;
    const times = cluster.points.map((p) => p.timeMs);
    const startMs = Math.min(...times);
    const endMs = Math.max(...times);
    await dismissMonitorAnomaly(
      this.hass,
      monitor.id,
      startMs,
      endMs,
      expiresAt
    );
    this._dismissPickerKey = null;
    // Invalidate cluster cache so next render re-fetches
    const updated = new Map(this._monitorClusters);
    updated.delete(monitor.id);
    this._monitorClusters = updated;
    await this._load();
  }

  private async _onUndismiss(monitor: AnomalyMonitor, windowId: string) {
    if (!this.hass) return;
    await undismissMonitorAnomaly(this.hass, monitor.id, windowId);
    await this._load();
  }

  private _formatClusterRange(cluster: AnomalyCluster): string {
    const times = cluster.points.map((p) => p.timeMs);
    if (times.length === 0) return "—";
    const start = new Date(Math.min(...times)).toLocaleString();
    const end = new Date(Math.max(...times)).toLocaleString();
    return start === end ? start : `${start} – ${end}`;
  }

  private _renderDismissExpiry(
    monitor: AnomalyMonitor,
    cluster: AnomalyCluster,
    clusterIndex: number
  ) {
    const pickerKey = `${monitor.id}:${clusterIndex}`;
    const isOpen = this._dismissPickerKey === pickerKey;
    const lookBackHours = monitor.look_back_hours ?? 24;

    if (!isOpen) {
      return html`
        <ha-button
          class="dismiss-btn"
          @click=${() => {
            this._dismissPickerKey = pickerKey;
          }}
          >${msg("Dismiss")}</ha-button
        >
      `;
    }

    const autoLabel =
      lookBackHours < 48
        ? `${lookBackHours * 2}h`
        : `${Math.round(lookBackHours / 12)}d`;

    return html`
      <div class="dismiss-picker">
        <span class="dismiss-picker-label">${msg("Dismiss until:")}</span>
        <ha-button @click=${() => this._onDismiss(monitor, cluster, undefined)}>
          ${msg("Auto")} (${autoLabel})
        </ha-button>
        <ha-button
          @click=${() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            this._onDismiss(monitor, cluster, d.toISOString());
          }}
          >${msg("1 day")}</ha-button
        >
        <ha-button
          @click=${() => {
            const d = new Date();
            d.setDate(d.getDate() + 7);
            this._onDismiss(monitor, cluster, d.toISOString());
          }}
          >${msg("1 week")}</ha-button
        >
        <ha-button @click=${() => this._onDismiss(monitor, cluster, null)}>
          ${msg("Permanent")}
        </ha-button>
        <ha-button
          @click=${() => {
            this._dismissPickerKey = null;
          }}
        >
          ${msg("Cancel")}
        </ha-button>
      </div>
    `;
  }

  private _renderClusterList(monitor: AnomalyMonitor) {
    const clusters = this._monitorClusters.get(monitor.id);
    const isLoading = this._loadingClusters.has(monitor.id);

    if (isLoading) {
      return html`<div class="clusters-loading">
        ${msg("Loading anomaly details…")}
      </div>`;
    }
    if (!clusters) return nothing;
    if (clusters.length === 0) {
      return html`<div class="clusters-empty">
        ${msg("No active anomaly clusters after dismissals.")}
      </div>`;
    }

    return html`
      <div class="cluster-list">
        ${clusters.map(
          (cluster, i) => html`
            <div class="cluster-item">
              <span class="cluster-method">${cluster.anomalyMethod}</span>
              <span class="cluster-range"
                >${this._formatClusterRange(cluster)}</span
              >
              ${this._renderDismissExpiry(monitor, cluster, i)}
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderDismissedWindows(monitor: AnomalyMonitor) {
    const windows: DismissedWindow[] = monitor.dismissed_windows ?? [];
    if (windows.length === 0) return nothing;

    return html`
      <details class="dismissed-windows">
        <summary>${msg("Dismissed")} (${windows.length})</summary>
        <div class="dismissed-list">
          ${windows.map((w) => {
            const start = new Date(w.start_ms).toLocaleString();
            const end = new Date(w.end_ms).toLocaleString();
            const expiry = w.expires_at
              ? new Date(w.expires_at).toLocaleString()
              : msg("Permanent");
            return html`
              <div class="dismissed-item">
                <span class="dismissed-range">${start} – ${end}</span>
                <span class="dismissed-expiry"
                  >${msg("Expires:")} ${expiry}</span
                >
                <ha-button
                  class="undismiss-btn"
                  @click=${() => this._onUndismiss(monitor, w.id)}
                  >${msg("Remove")}</ha-button
                >
              </div>
            `;
          })}
        </div>
      </details>
    `;
  }

  private _renderSparkline(history: ScanHistoryEntry[]) {
    const W = 120;
    const H = 28;
    const PAD = 2;
    const counts = history.map((e) => e.count);
    if (counts.length < 2) {
      return html`<svg width=${W} height=${H}></svg>`;
    }
    const max = Math.max(...counts, 1);
    const pts = counts
      .map((c, i) => {
        const x = PAD + (i / Math.max(counts.length - 1, 1)) * (W - PAD * 2);
        const y = H - PAD - (c / max) * (H - PAD * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return html`<svg
      class="monitor-sparkline"
      width=${W}
      height=${H}
      aria-hidden="true"
    >
      <polyline
        points=${pts}
        fill="none"
        stroke="var(--primary-color)"
        stroke-width="1.5"
      />
    </svg>`;
  }

  private _renderEntityDisplay(monitor: AnomalyMonitor) {
    const entityIds = monitorEntityIds(monitor);

    if (monitor.type === "individual" || entityIds.length <= 1) {
      return html`
        <div class="monitor-entities">
          ${entityIds.map(
            (eid) => html`
              <entity-chip
                .hass=${this.hass}
                type="entity"
                .itemId=${eid}
              ></entity-chip>
            `
          )}
        </div>
      `;
    }

    // Combined monitor — show overlap logic
    const m = monitor as CombinedMonitor;
    const mode = m.overlap_mode ?? "all";

    if (mode === "any") {
      return html`
        <div class="monitor-overlap-row">
          ${entityIds.map(
            (eid, i) => html`
              ${i > 0 ? html`<span class="overlap-op">OR</span>` : nothing}
              <entity-chip
                .hass=${this.hass}
                type="entity"
                .itemId=${eid}
              ></entity-chip>
            `
          )}
        </div>
      `;
    }

    const anyMatch =
      /^any_(\d+)$/.exec(mode) ?? (mode === "any_two_plus" ? ["", "2"] : null);
    if (anyMatch) {
      const n = parseInt(anyMatch[1], 10);
      return html`
        <div class="monitor-overlap-row">
          <span class="overlap-prefix"
            >${msg("AT LEAST")} ${n} ${msg("OF")}</span
          >
          ${entityIds.map(
            (eid) => html`
              <entity-chip
                .hass=${this.hass}
                type="entity"
                .itemId=${eid}
              ></entity-chip>
            `
          )}
        </div>
      `;
    }

    // Default: "all" — every entity must have an overlapping anomaly
    return html`
      <div class="monitor-overlap-row">
        ${entityIds.map(
          (eid, i) => html`
            ${i > 0 ? html`<span class="overlap-op">AND</span>` : nothing}
            <entity-chip
              .hass=${this.hass}
              type="entity"
              .itemId=${eid}
            ></entity-chip>
          `
        )}
      </div>
    `;
  }

  private _renderMonitorCard(monitor: AnomalyMonitor) {
    const clusterCount = monitor.last_cluster_count ?? 0;
    const isDisabled = !monitor.enabled;
    const hasAnomaly = !isDisabled && clusterCount > 0;

    // Consecutive anomalous scans
    const history = monitor.scan_history ?? [];
    let consecutive = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if ((history[i].count ?? 0) > 0) consecutive++;
      else break;
    }

    // Lazily load clusters when anomaly is active
    if (hasAnomaly && !this._monitorClusters.has(monitor.id)) {
      this._loadClusters(monitor.id);
    }

    return html`
      <div class="monitor-card" data-enabled=${monitor.enabled}>
        <div class="monitor-card-header">
          <span class="monitor-name">${monitor.name}</span>
          ${hasAnomaly
            ? html`<span class="monitor-anomaly-indicator"
                >${msg("Anomaly detected")}</span
              >`
            : nothing}
          <button
            class="monitor-toggle-btn"
            title=${monitor.enabled
              ? msg("Disable monitor")
              : msg("Enable monitor")}
            @click=${() => this._onToggleEnabled(monitor)}
          >
            <ha-icon
              icon=${monitor.enabled
                ? "mdi:toggle-switch"
                : "mdi:toggle-switch-off-outline"}
            ></ha-icon>
          </button>
        </div>

        ${this._renderEntityDisplay(monitor)}

        <div class="monitor-stats">
          ${this._renderSparkline(history)}
          <span>
            ${clusterCount} ${msg("cluster(s)")}
            ${consecutive > 0
              ? html`· ${msg(`persistent for ${consecutive} scans`)}`
              : nothing}
          </span>
          ${monitor.last_scan_at
            ? html`<span
                >${msg("Last scan:")}
                ${new Date(monitor.last_scan_at).toLocaleString()}</span
              >`
            : nothing}
        </div>

        ${hasAnomaly ? this._renderClusterList(monitor) : nothing}
        ${this._renderDismissedWindows(monitor)}

        <div class="monitor-actions">
          <ha-button class="small-btn" @click=${() => this._onEdit(monitor)}
            >${msg("Edit")}</ha-button
          >
          ${monitor.device_id
            ? html`<a
                class="device-link"
                href=${`/config/devices/device/${monitor.device_id}`}
                title=${msg("View device")}
              >
                <ha-icon icon="mdi:chip"></ha-icon>
                ${msg("Device")}
              </a>`
            : nothing}
          <div class="monitor-actions-spacer"></div>
          <ha-button
            class="small-btn delete-btn"
            @click=${() => this._onDelete(monitor)}
            >${msg("Delete")}</ha-button
          >
        </div>
      </div>
    `;
  }

  private _renderMonitorList() {
    if (this._loading) {
      return html`<div class="monitors-empty">${msg("Loading…")}</div>`;
    }
    if (this._monitors.length === 0) {
      return html`<div class="monitors-empty">
        ${msg('No monitors configured. Click "New monitor" to get started.')}
      </div>`;
    }
    return html`<div class="monitors-grid">
      ${this._monitors.map((m) => this._renderMonitorCard(m))}
    </div>`;
  }

  render() {
    return html`
      <div class="monitors-panel">
        <div class="monitors-header">
          <ha-icon-button label=${msg("Back")} @click=${this._onClose}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </ha-icon-button>
          <h2>${msg("Anomaly monitors")}</h2>
          <button class="new-monitor-btn" @click=${this._onNewMonitor}>
            <ha-icon icon="mdi:bell-plus-outline"></ha-icon>
            ${msg("New monitor")}
          </button>
        </div>

        ${this._renderMonitorList()}
      </div>

      <anomaly-monitor-wizard
        .hass=${this.hass}
        .open=${this._wizardOpen}
        .editMonitor=${this._editMonitor}
        @dp-monitor-wizard-close=${this._onWizardClose}
        @dp-monitor-wizard-saved=${this._onWizardSaved}
      ></anomaly-monitor-wizard>
    `;
  }
}

customElements.define("anomaly-monitors-panel", AnomalyMonitorsPanel);

declare global {
  interface HTMLElementTagNameMap {
    "anomaly-monitors-panel": AnomalyMonitorsPanel;
  }
}
