// Orphan Entity Cleaner — Custom Panel per Home Assistant
// Registrato come panel_custom: riceve `hass` con il token già autenticato.

class OrphanCleanerPanel extends HTMLElement {
  constructor() {
    super();
    this._hass     = null;
    this._rendered = false;
    this._shadow   = this.attachShadow({ mode: "open" });
    this._state    = {
      allOrphans: [],
      selected:   new Set(),
      scanning:   false,
      deleting:   false,
      logs:       [],
      scannedAt:  null,
      total:      null,
    };
    // Show placeholder immediately so we know JS is loaded
    this._shadow.innerHTML = `<div style="padding:20px;color:#9aa0a6;font-family:sans-serif">
      Loading Orphan Entity Cleaner…
    </div>`;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._rendered = true;
      try {
        this._render();
        this._updateAll();
      } catch(e) {
        this._shadow.innerHTML = `<div style="color:red;padding:20px;font-family:monospace">
          <b>Orphan Cleaner render error:</b><br>${e.message}<br><pre>${e.stack}</pre>
        </div>`;
      }
    }
  }

  connectedCallback() {
    // Fallback: if hass was already set but render didn't happen
    if (this._hass && !this._rendered) {
      this._rendered = true;
      this._render();
      this._updateAll();
    }
    // If coming back from another page, repaint
    if (this._rendered && !this._shadow.getElementById("btn-scan")) {
      this._render();
      this._updateAll();
    }
  }

  // ── Chiamate API ───────────────────────────────────────────────────
  async _apiFetch(path, options = {}) {
    const token = this._hass.auth.data.access_token;
    const base  = `${location.protocol}//${location.host}`;
    const resp  = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type":  "application/json",
        ...(options.headers || {}),
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  async _doScan() {
    if (this._state.scanning) return;
    this._state.scanning  = true;
    this._state.allOrphans = [];
    this._state.selected   = new Set();
    this._state.logs       = [];
    this._updateAll();

    try {
      const data = await this._apiFetch("/api/orphan_cleaner/scan");
      if (data.error) throw new Error(data.error);
      this._state.allOrphans = data.orphans || [];
      this._state.total      = data.total;
      this._state.scannedAt  = new Date().toLocaleTimeString("en-GB");
      const ts_n = this._state.allOrphans.filter(o => o.method === "timestamp").length;
      const he_n = this._state.allOrphans.filter(o => o.method === "heuristic").length;
      const de_n = this._state.allOrphans.filter(o => o.method === 'dead_entry').length;
      const un_n = this._state.allOrphans.filter(o => o.method === 'unavailable').length;
      this._log(`Scan: ${data.total} total, ${this._state.allOrphans.length} orphans (${ts_n} timestamp, ${de_n} dead entries, ${un_n} unavailable, ${he_n} heuristic).`, 'ok');
    } catch (e) {
      this._log("Scan error: " + e.message, "err");
    } finally {
      this._state.scanning = false;
      this._updateAll();
    }
  }

  async _doDelete(ids) {
    if (this._state.deleting || !ids.length) return;
    this._state.deleting = true;
    this._log(`Deleting ${ids.length} entities…`, "info");
    this._updateAll();

    try {
      const data = await this._apiFetch("/api/orphan_cleaner/delete", {
        method: "POST",
        body:   JSON.stringify({ entity_ids: ids }),
      });
      data.deleted.forEach(id => {
        this._state.allOrphans = this._state.allOrphans.filter(e => e.entity_id !== id);
        this._state.selected.delete(id);
        this._log(`✓ Deleted: ${id}`, "ok");
      });
      (data.failed || []).forEach(id => this._log(`✗ Failed: ${id}`, "err"));
      this._log(`Done: ${data.deleted_count} deleted, ${data.failed_count} failed.`,
                data.failed_count > 0 ? "warn" : "ok");
    } catch (e) {
      this._log("Delete error: " + e.message, "err");
    } finally {
      this._state.deleting = false;
      this._updateAll();
    }
  }

  _log(msg, type = "info") {
    const time = new Date().toLocaleTimeString("en-GB");
    this._state.logs.push({ msg, type, time });
    const box = this._shadow.getElementById("log-box");
    if (box) {
      const line = document.createElement("div");
      line.className = "log-line " + type;
      line.textContent = `[${time}]  ${msg}`;
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    }
  }

  // ── Selezione ──────────────────────────────────────────────────────
  _toggleRow(id, checked) {
    checked ? this._state.selected.add(id) : this._state.selected.delete(id);
    this._updateStats();
    this._updateButtons();
  }
  _selAll() {
    this._filtered().forEach(e => this._state.selected.add(e.entity_id));
    this._updateTable();
    this._updateStats();
    this._updateButtons();
  }
  _deselAll() {
    this._state.selected.clear();
    this._updateTable();
    this._updateStats();
    this._updateButtons();
  }
  _filtered() {
    const q = (this._shadow.getElementById("filter")?.value || "").toLowerCase();
    return q
      ? this._state.allOrphans.filter(e => e.entity_id.includes(q) || e.platform.includes(q))
      : this._state.allOrphans;
  }

  // ── Partial updates ────────────────────────────────────────────────
  _updateStats() {
    const s = this._state;
    const he = s.allOrphans.filter(o => o.method === "heuristic").length;
    this._setText("s-total",  s.total != null ? s.total : "—");
    this._setText("s-orphan", s.allOrphans.length || (s.total != null ? "0" : "—"));
    this._setText("s-heur",   s.total != null ? he : "—");
    this._setText("s-sel",    s.selected.size);
  }
  _setText(id, val) {
    const el = this._shadow.getElementById(id);
    if (el) el.textContent = val;
  }
  _updateButtons() {
    const s    = this._state;
    const has  = s.allOrphans.length > 0;
    this._setDisabled("btn-selall",  !has);
    this._setDisabled("btn-desel",   !has);
    this._setDisabled("btn-del",     s.selected.size === 0 || s.deleting);
    this._setDisabled("btn-scan",    s.scanning);
    const filterEl = this._shadow.getElementById("filter");
    if (filterEl) filterEl.disabled = !has;
    const scanBtn = this._shadow.getElementById("btn-scan");
    if (scanBtn) scanBtn.textContent = s.scanning ? "Scanning…" : "Scan";
  }
  _setDisabled(id, val) {
    const el = this._shadow.getElementById(id);
    if (el) el.disabled = val;
  }
  _updateTable() {
    const wrap = this._shadow.getElementById("tbl-wrap");
    if (!wrap) return;
    const items = this._filtered();
    if (!items.length) {
      wrap.innerHTML = this._emptyHTML(
        this._state.total != null
          ? "No orphan entities found."
          : "Press Scan to search for orphan entities."
      );
      return;
    }
    wrap.innerHTML = this._tableHTML(items);
    // Re-attach checkbox listeners
    wrap.querySelectorAll("input[data-eid]").forEach(chk => {
      chk.addEventListener("change", () => this._toggleRow(chk.dataset.eid, chk.checked));
    });
    const allChk = wrap.querySelector("#chk-all");
    if (allChk) {
      allChk.addEventListener("change", () => allChk.checked ? this._selAll() : this._deselAll());
    }
  }
  _updateAll() {
    this._updateStats();
    this._updateButtons();
    this._updateTable();
  }

  // ── HTML helpers ───────────────────────────────────────────────────
  _emptyHTML(msg) {
    return `<div class="empty"><p>${msg}</p></div>`;
  }
  _tableHTML(items) {
    const rows = items.map(e => {
      const chk   = this._state.selected.has(e.entity_id) ? "checked" : "";
      const badge = e.method === "timestamp"
        ? `<span class="badge badge-ts">orphaned_timestamp</span>`
        : e.method === "dead_entry"
        ? `<span class="badge badge-dead">dead entry</span>`
        : e.method === "unavailable"
        ? `<span class="badge badge-unavail">unavailable</span>`
        : `<span class="badge badge-heuristic">heuristic</span>`;
      const dis   = e.disabled_by ? `<span class="badge badge-disabled">disabled</span>` : "";
      const age   = e.age_hours != null ? `${e.age_hours}h` : "—";
      return `<tr>
        <td class="td-chk"><input type="checkbox" data-eid="${e.entity_id}" ${chk}></td>
        <td><span class="eid">${e.entity_id}</span>${dis}</td>
        <td><span class="platform-badge">${e.platform}</span></td>
        <td class="td-method">${badge}</td>
        <td class="td-age"><span class="age-text">${age}</span></td>
      </tr>`;
    }).join("");
    return `<table>
      <thead><tr>
        <th class="th-chk"><input type="checkbox" id="chk-all"></th>
        <th>Entity ID</th><th>Platform</th>
        <th class="th-method">Detection</th>
        <th class="th-age">Age</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  // ── Confirm modal ──────────────────────────────────────────────────
  _showConfirm() {
    const n   = this._state.selected.size;
    const msg = this._shadow.getElementById("modal-msg");
    if (msg) msg.innerHTML =
      `You are about to delete <strong>${n} entities</strong>.<br>This operation is <strong>irreversible</strong>. Continue?`;
    const ov = this._shadow.getElementById("overlay");
    if (ov) ov.classList.add("show");
  }
  _closeModal() {
    const ov = this._shadow.getElementById("overlay");
    if (ov) ov.classList.remove("show");
  }

  // ── Full render (first time only) ─────────────────────────────────
  _render() {
    this._shadow.innerHTML = `
<style>
  :host { display: block; font-family: var(--primary-font-family, sans-serif);
    background: var(--primary-background-color, #111); color: var(--primary-text-color, #eee);
    min-height: 100vh; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  --c-green:    #1D9E75;
  --c-green-dk: #0F6E56;
  --c-green-lt: #E1F5EE;
  --c-green-tx: #085041;
  --c-red:      #A32D2D;
  --c-red-lt:   #FCEBEB;
  --c-red-tx:   #501313;

  .topbar { background: var(--card-background-color, #1e1f21);
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    padding: 0 20px; height: 52px; display: flex; align-items: center; gap: 10px; }
  .topbar-icon { width: 30px; height: 30px; background: #1D9E75; border-radius: 6px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .topbar-icon svg { width: 16px; height: 16px; fill: white; }
  .topbar-title { font-size: 15px; font-weight: 500; }
  .topbar-spacer { flex: 1; }
  .cfg-pill { font-size: 11px; background: var(--secondary-background-color, #2a2b2d);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    border-radius: 20px; padding: 4px 10px; color: var(--secondary-text-color, #9aa0a6); }

  .main { padding: 20px; max-width: 980px; margin: 0 auto; }

  .stat-row { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; margin-bottom: 18px; }
  .stat { background: var(--secondary-background-color, #2a2b2d); border-radius: 8px; padding: 14px 16px; }
  .s-label { font-size: 11px; color: var(--secondary-text-color, #9aa0a6); margin-bottom: 5px;
    text-transform: uppercase; letter-spacing: 0.03em; }
  .s-val { font-size: 24px; font-weight: 500; }
  .s-danger .s-val { color: #E24B4A; }
  .s-ok     .s-val { color: #1D9E75; }
  .s-warn   .s-val { color: #EF9F27; }

  .toolbar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
  button { font-family: inherit; font-size: 13px;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.18));
    background: var(--card-background-color, #1e1f21);
    color: var(--primary-text-color, #eee);
    border-radius: 6px; padding: 7px 14px; cursor: pointer; white-space: nowrap; }
  button:hover:not(:disabled) { background: var(--secondary-background-color, #2a2b2d); }
  button:active:not(:disabled) { transform: scale(0.98); }
  button:disabled { opacity: 0.38; cursor: default; }
  .btn-primary { background: #1D9E75; border-color: #1D9E75; color: #fff; font-weight: 500; }
  .btn-primary:hover:not(:disabled) { background: #0F6E56; }
  .btn-danger  { background: #A32D2D; border-color: #A32D2D; color: #fff; font-weight: 500; }
  .btn-danger:hover:not(:disabled)  { background: #791F1F; }
  input[type="text"] {
    flex: 1; min-width: 200px;
    border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    border-radius: 6px; padding: 7px 12px; font-size: 13px; font-family: inherit;
    background: var(--card-background-color, #1e1f21);
    color: var(--primary-text-color, #eee); }
  input[type="text"]::placeholder { color: var(--secondary-text-color, #9aa0a6); }
  input[type="text"]:focus { outline: none; }

  .card { background: var(--card-background-color, #1e1f21);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
  .card-header { padding: 11px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    display: flex; align-items: center; gap: 10px;
    background: var(--secondary-background-color, #2a2b2d); }
  .ch-title { font-size: 13px; font-weight: 500; flex: 1; }
  .ch-meta  { font-size: 11px; color: var(--secondary-text-color, #9aa0a6); }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th { padding: 8px 14px; text-align: left; font-size: 11px; font-weight: 500;
    color: var(--secondary-text-color, #9aa0a6); text-transform: uppercase; letter-spacing: 0.03em;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    background: var(--secondary-background-color, #2a2b2d); }
  .th-chk { width: 38px; text-align: center; }
  .th-age { width: 90px; }
  .th-method { width: 170px; }
  tbody tr { border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.07)); }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--secondary-background-color, #2a2b2d); }
  tbody td { padding: 9px 14px; vertical-align: middle; }
  .td-chk { text-align: center; }
  input[type="checkbox"] { width: 14px; height: 14px; cursor: pointer; accent-color: #1D9E75; }
  .eid { font-family: monospace; font-size: 12px; word-break: break-all; }
  .platform-badge { display: inline-block; background: var(--secondary-background-color, #2a2b2d);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    border-radius: 4px; padding: 2px 7px; font-size: 11px;
    color: var(--secondary-text-color, #9aa0a6); white-space: nowrap; }
  .badge { display: inline-block; border-radius: 4px; padding: 2px 8px; font-size: 11px; white-space: nowrap; }
  .badge-ts        { background: #04342C; color: #9FE1CB; }
  .badge-heuristic { background: #412402; color: #FAC775; }
  .badge-dead     { background: #501313; color: #F7C1C1; }
  .badge-unavail  { background: #26215C; color: #CECBF6; }
  .badge-disabled  { background: #042C53; color: #B5D4F4; margin-left: 4px; }
  .age-text { font-size: 12px; color: var(--secondary-text-color, #9aa0a6); }

  .empty { padding: 48px 20px; text-align: center; color: var(--secondary-text-color, #9aa0a6); }
  .empty p { font-size: 14px; }

  .log-box { background: var(--card-background-color, #1e1f21);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    border-radius: 10px; padding: 12px 16px; font-family: monospace; font-size: 12px;
    color: var(--secondary-text-color, #9aa0a6); max-height: 200px; overflow-y: auto;
    line-height: 1.8; margin-bottom: 14px; }
  .log-line.ok   { color: #1D9E75; }
  .log-line.err  { color: #E24B4A; }
  .log-line.warn { color: #EF9F27; }
  .log-line.info { color: var(--secondary-text-color, #9aa0a6); }

  .statusbar { font-size: 11px; color: var(--secondary-text-color, #9aa0a6);
    padding: 0 2px 14px; display: flex; gap: 10px; align-items: center; }

  .overlay-wrap { position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    display: none; align-items: center; justify-content: center; z-index: 999; }
  .overlay-wrap.show { display: flex; }
  .modal { background: var(--card-background-color, #1e1f21);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.18));
    border-radius: 10px; padding: 24px 28px; max-width: 420px; width: 90%; }
  .modal h2 { font-size: 16px; font-weight: 500; margin-bottom: 10px; }
  .modal p  { font-size: 13px; color: var(--secondary-text-color, #9aa0a6); margin-bottom: 20px; line-height: 1.6; }
  .modal-btns { display: flex; gap: 8px; justify-content: flex-end; }

  .info-card { background: var(--card-background-color, #1e1f21);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    border-radius: 10px; padding: 16px 20px; margin-bottom: 14px; }
  .info-card h3 { font-size: 11px; font-weight: 500; margin-bottom: 10px;
    color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: 0.04em; }
  .service-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
  .service-row:last-child { margin-bottom: 0; }
  .svc-name { font-family: monospace; font-size: 12px;
    background: var(--secondary-background-color, #2a2b2d);
    border: 1px solid var(--divider-color); border-radius: 4px; padding: 3px 8px;
    white-space: nowrap; flex-shrink: 0; color: #1D9E75; }
  .svc-desc { font-size: 12px; color: var(--secondary-text-color, #9aa0a6); line-height: 1.6; }

  @media (max-width: 600px) {
    .stat-row { grid-template-columns: 1fr 1fr; }
    .th-method, .td-method, .th-age, .td-age { display: none; }
  }
</style>

<div class="topbar">
  <div class="topbar-icon">
    <svg viewBox="0 0 24 24"><path d="M19.36 2.72 20.78 4.14l-1.4 1.41 1.41 1.41-4.24 4.24-1.41-1.41-6.89 6.9a4 4 0 0 1-1.2 4.71l-2.83 2.12-1.41-1.41 2.12-2.83a2 2 0 0 0 .27-2.1l-.27-.42L3 15.36l1.41-1.41 1.42 1.42 5.65-5.66-1.41-1.41 4.24-4.24 1.41 1.41z"/></svg>
  </div>
  <div>
    <div class="topbar-title">Orphan Entity Cleaner</div>
  </div>
  <div class="topbar-spacer"></div>
  <div class="cfg-pill" id="cfg-pill">—</div>
</div>

<div class="main">
  <div class="stat-row">
    <div class="stat">          <div class="s-label">Total entities</div>  <div class="s-val" id="s-total">—</div></div>
    <div class="stat s-danger"> <div class="s-label">Orphans found</div> <div class="s-val" id="s-orphan">—</div></div>
    <div class="stat s-warn">   <div class="s-label">Heuristic</div><div class="s-val" id="s-heur">—</div></div>
    <div class="stat s-ok">     <div class="s-label">Selected</div>    <div class="s-val" id="s-sel">0</div></div>
  </div>

  <div class="toolbar">
    <button class="btn-primary" id="btn-scan">Scan</button>
    <button id="btn-selall" disabled>Select all</button>
    <button id="btn-desel"  disabled>Deselect</button>
    <input type="text" id="filter" placeholder="Filter by entity_id or platform…" disabled>
    <button class="btn-danger" id="btn-del" disabled>Delete selected</button>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="ch-title" id="tbl-title">No scan performed yet</span>
      <span class="ch-meta"  id="tbl-meta"></span>
    </div>
    <div id="tbl-wrap"><div class="empty"><p>Press <strong>Scan</strong> to search for orphan entities.</p></div></div>
  </div>

  <div class="statusbar" id="statusbar"></div>
  <div class="log-box" id="log-box"></div>

  <div class="info-card">
    <h3>Available services</h3>
    <div class="service-row">
      <span class="svc-name">orphan_cleaner.scan</span>
      <span class="svc-desc">Scans the registry and fires the <code>orphan_cleaner_orphans_found</code> event — useful in automations.</span>
    </div>
    <div class="service-row">
      <span class="svc-name">orphan_cleaner.delete_orphans</span>
      <span class="svc-desc">Deletes specified entities or all orphans. Supports <code>dry_run: true</code>.</span>
    </div>
  </div>
</div>

<div class="overlay-wrap" id="overlay">
  <div class="modal">
    <h2>Confirm deletion</h2>
    <p id="modal-msg"></p>
    <div class="modal-btns">
      <button id="btn-cancel">Cancel</button>
      <button class="btn-danger" id="btn-confirm">Delete</button>
    </div>
  </div>
</div>
`;
    this._attachListeners();
  }

  _attachListeners() {
    const s = this._shadow;
    s.getElementById("btn-scan").addEventListener("click", () => this._doScan());
    s.getElementById("btn-selall").addEventListener("click", () => this._selAll());
    s.getElementById("btn-desel").addEventListener("click",  () => this._deselAll());
    s.getElementById("btn-del").addEventListener("click",    () => this._showConfirm());
    s.getElementById("btn-cancel").addEventListener("click", () => this._closeModal());
    s.getElementById("btn-confirm").addEventListener("click", () => {
      this._closeModal();
      this._doDelete([...this._state.selected]);
    });
    s.getElementById("filter").addEventListener("input", () => {
      this._updateTable();
      const q = s.getElementById("filter").value;
      s.getElementById("tbl-meta").textContent =
        q ? `${this._filtered().length} of ${this._state.allOrphans.length}` : "";
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") this._closeModal(); });
  }
}

customElements.define("orphan-cleaner-panel-1-3-4", OrphanCleanerPanel);
