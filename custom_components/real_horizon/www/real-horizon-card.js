// Real Horizon Lovelace card. Reads sensor.real_horizon_local_horizon_profile.
// Renders horizon silhouette + today's sun/moon arcs + rise/set markers + current
// sun and moon (with phase) as SVG.

const DEFAULT_ENTITY = "sensor.real_horizon_local_horizon_profile";

const CARDINALS = [
  [0, "N"], [45, "NE"], [90, "E"], [135, "SE"],
  [180, "S"], [225, "SW"], [270, "W"], [315, "NW"], [360, "N"],
];

class RealHorizonCard extends HTMLElement {
  setConfig(config) {
    this._config = { entity: DEFAULT_ENTITY, ...(config || {}) };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 4; }

  static getStubConfig() { return { entity: DEFAULT_ENTITY }; }

  _render() {
    if (!this._hass || !this._config) return;
    const state = this._hass.states[this._config.entity];
    if (!state) {
      this._mount(`<div class="rh-error">Entity ${this._config.entity} not found.</div>`);
      return;
    }

    const a = state.attributes || {};
    const profile = a.profile || [];
    const sunPath = a.sun_path_today || [];
    const moonPath = a.moon_path_today || [];
    const crossings = a.crossings || [];
    const sunAz = a.sun_azimuth;
    const sunEl = a.sun_elevation;
    const moonAz = a.moon_azimuth;
    const moonEl = a.moon_elevation;
    const moonPhase = a.moon_phase ?? 0;

    if (!profile.length) {
      this._mount(`<div class="rh-error">No horizon profile yet.</div>`);
      return;
    }

    // Vertical extent: tallest of (terrain, sun arc, moon arc) + a bit of headroom.
    const profileMax = profile.reduce((m, p) => Math.max(m, p.elev), 0);
    const sunPathMax = sunPath.reduce((m, p) => Math.max(m, p.elev), 0);
    const moonPathMax = moonPath.reduce((m, p) => Math.max(m, p.elev), 0);
    const yMax = Math.max(profileMax + 5, sunPathMax + 5, moonPathMax + 5, 30);

    // viewBox: x in [0, 360], y in [-yMax, 0]. Cardinal labels live in an HTML
    // row beneath the SVG (so they render at theme font-size, not viewBox-scaled).
    const vbW = 360;
    const vbH = yMax;
    const vb = `0 ${-yMax} ${vbW} ${vbH}`;

    // Helper: interpolate (az, elev) at a given timestamp from a path array.
    const interp = (path, iso, fallbackAz) => {
      const t = new Date(iso).getTime();
      let prev = null, next = null;
      for (const p of path) {
        const pt = new Date(p.time).getTime();
        if (pt <= t) prev = p;
        if (pt >= t && !next) { next = p; break; }
      }
      if (prev && next && prev !== next) {
        const tp = new Date(prev.time).getTime();
        const tn = new Date(next.time).getTime();
        const f = (t - tp) / (tn - tp);
        return [prev.az + f * (next.az - prev.az), prev.elev + f * (next.elev - prev.elev)];
      }
      if (prev) return [prev.az, prev.elev];
      return [fallbackAz, 0];
    };

    // Silhouette polygon (wraps az 0..360 by repeating the first point).
    const silPts = [
      `0,0`,
      ...profile.map((p) => `${p.az},${-p.elev}`),
      `360,${-profile[0].elev}`,
      `360,0`,
    ].join(" ");

    // Sun arc -- one continuous above-horizon segment per day.
    const sunPts = sunPath
      .filter((p) => p.elev > 0)
      .map((p) => `${p.az},${-p.elev}`)
      .join(" ");

    // Moon arc -- the coordinator returns a single continuous arc spanning rise..set.
    // It can still wrap across az=0/360. Split only on >180° jumps in azimuth.
    const moonPolylines = (() => {
      const segs = [];
      let run = [];
      let lastAz = null;
      for (const p of moonPath) {
        if (lastAz !== null && Math.abs(p.az - lastAz) > 180) {
          if (run.length) segs.push(run);
          run = [];
        }
        run.push(p);
        lastAz = p.az;
      }
      if (run.length) segs.push(run);
      return segs
        .map((seg) => `<polyline points="${
          seg.map((p) => `${p.az},${-p.elev}`).join(" ")
        }" class="rh-moon-path"/>`)
        .join("");
    })();

    // Crossing markers (no time labels -- summary at top already shows them).
    const sunCrossMarkers = crossings.map((c) => {
      const [az, el] = interp(sunPath, c.time, sunAz);
      const fill = c.kind === "rise" ? "#10b981" : "#ef4444";
      return `<circle cx="${az}" cy="${-el}" r="2.4"
                fill="${fill}" stroke="#0b1426" stroke-width="0.5"/>`;
    }).join("");
    const moonCrossings = a.moon_crossings || [];
    const moonCrossMarkers = moonCrossings.map((c) => {
      const [az, el] = interp(moonPath, c.time, moonAz);
      const stroke = c.kind === "rise" ? "#10b981" : "#ef4444";
      return `<circle cx="${az}" cy="${-el}" r="1.8"
                fill="#f5f3e7" stroke="${stroke}" stroke-width="0.6"/>`;
    }).join("");

    // Faint vertical gridlines at the cardinal directions (no in-SVG labels).
    const cardinalGrid = CARDINALS.map(([az]) => `
      <line x1="${az}" y1="0" x2="${az}" y2="${-yMax}" class="rh-grid"/>
    `).join("");

    // Cardinal labels: HTML row below the SVG, theme-sized. The "N" at 360°
    // is intentionally kept (mirrors the 0° N) so the axis reads symmetrically.
    const cardinalLabels = CARDINALS
      .map(([az, label]) => `
        <span style="left:${(az / 360) * 100}%">${label}</span>
      `).join("");

    // No elevation labels -- the user calls them clutter.

    // Local horizon at the body's azimuth -- used to decide if we draw "now" markers.
    const horizonAt = (az) => {
      const norm = ((az % 360) + 360) % 360;
      // Walk profile (sorted by az). Linear interpolate.
      for (let i = 0; i < profile.length - 1; i++) {
        if (profile[i].az <= norm && norm < profile[i + 1].az) {
          const t = (norm - profile[i].az) / (profile[i + 1].az - profile[i].az);
          return profile[i].elev + t * (profile[i + 1].elev - profile[i].elev);
        }
      }
      // Wrap-around segment.
      const last = profile[profile.length - 1];
      const span = 360 - last.az + profile[0].az;
      const t = ((norm - last.az + 360) % 360) / span;
      return last.elev + t * (profile[0].elev - last.elev);
    };

    // Current sun (only if above local horizon).
    const sunVisible = sunEl !== undefined && sunEl > horizonAt(sunAz);
    const sunNow = sunVisible
      ? `<circle cx="${sunAz}" cy="${-sunEl}" r="3.2"
                 fill="#fde047" stroke="#b45309" stroke-width="0.7"
                 class="rh-sun-now"/>`
      : "";

    // Current moon (only if above local horizon).
    const moonVisible = moonEl !== undefined && moonEl > horizonAt(moonAz);
    const moonNow = moonVisible ? this._moonSvg(moonAz, -moonEl, 2.6, moonPhase) : "";

    // Summary header.
    const fmtTime = (iso) => {
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    };
    const sunRise = crossings.find((c) => c.kind === "rise");
    const sunSet = [...crossings].reverse().find((c) => c.kind === "set");
    const mRise = a.moon_rise;
    const mSet = a.moon_set;
    const phasePct = Math.round(((1 - Math.cos(moonPhase * 2 * Math.PI)) / 2) * 100);
    const phaseName = this._phaseName(moonPhase);
    const sunIcon = `
      <svg class="rh-icon-svg" viewBox="-6 -6 12 12" width="18" height="18">
        <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#b45309" stroke-width="0.7"/>
      </svg>`;
    const sunBlock = (sunRise && sunSet)
      ? `<span class="rh-block" title="True sunrise / true sunset">
           ${sunIcon}
           <span class="rh-rs"><span class="rh-arrow rh-arrow-rise">↑</span>${fmtTime(sunRise.time)}</span>
           <span class="rh-rs"><span class="rh-arrow rh-arrow-set">↓</span>${fmtTime(sunSet.time)}</span>
         </span>`
      : `<span class="rh-block"><span class="rh-dim">no sun above horizon today</span></span>`;
    const moonInline = `
      <svg class="rh-icon-svg" viewBox="-6 -6 12 12" width="18" height="18">
        ${this._moonSvg(0, 0, 5, moonPhase)}
      </svg>`;
    const moonBlock = `
      <span class="rh-block" title="${phaseName} · ${phasePct}% lit">
        ${moonInline}
        ${mRise || mSet
          ? `${mRise ? `<span class="rh-rs"><span class="rh-arrow rh-arrow-rise">↑</span>${fmtTime(mRise)}</span>` : ""}
             ${mSet  ? `<span class="rh-rs"><span class="rh-arrow rh-arrow-set">↓</span>${fmtTime(mSet)}</span>` : ""}`
          : `<span class="rh-dim">no moon up in next 30h</span>`}
        <span class="rh-pct">${phasePct}%</span>
      </span>
    `;
    const summary = `<div class="rh-summary">${sunBlock}${moonBlock}</div>`;

    const html = `
      <ha-card>
        <div class="rh-wrap">
          ${summary}
          <div class="rh-chart">
            <svg viewBox="${vb}" preserveAspectRatio="none" class="rh-svg"
                 style="aspect-ratio: ${vbW} / ${vbH};">
              <defs>
                <linearGradient id="rhSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0b2447"/>
                  <stop offset="60%" stop-color="#1a4d80"/>
                  <stop offset="100%" stop-color="#3a7ca8"/>
                </linearGradient>
                <linearGradient id="rhTerrain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1f4d2a"/>
                  <stop offset="100%" stop-color="#0e2a16"/>
                </linearGradient>
              </defs>
              <rect x="0" y="${-yMax}" width="360" height="${yMax}" fill="url(#rhSky)"/>
              ${cardinalGrid}
              ${moonPolylines}
              ${sunPts ? `<polyline points="${sunPts}" class="rh-sun-path"/>` : ""}
              <polygon points="${silPts}" class="rh-silhouette"/>
              ${sunCrossMarkers}
              ${moonCrossMarkers}
              ${moonNow}
              ${sunNow}
            </svg>
            <div class="rh-axis">${cardinalLabels}</div>
          </div>
        </div>
      </ha-card>
    `;
    this._mount(html);
  }

  // SVG for the moon at (cx, cy) with body radius r and a normalized phase.
  // phase: 0=new, 0.25=first quarter (waxing), 0.5=full, 0.75=last quarter (waning).
  // For northern-hemisphere viewers: waxing => lit on the right; waning => lit on the left.
  _moonSvg(cx, cy, r, phase) {
    const body = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#f5f3e7" stroke="#b8b099" stroke-width="0.25"/>
    `;
    // Dark cap: bounded by half-moon outer arc and a terminator ellipse.
    const k = Math.cos(phase * 2 * Math.PI);   // +1 at new, -1 at full, 0 at quarters
    const rx = Math.abs(k) * r;                 // terminator ellipse half-width
    const waxing = phase < 0.5;
    // SVG y increases downward. We want top=(cx, cy-r), bottom=(cx, cy+r).
    // Outer arc: half-circle on the DARK side.
    //   - Waxing  (lit right): dark on left  -> outer arc curves left (sweep=0).
    //   - Waning  (lit left ): dark on right -> outer arc curves right (sweep=1).
    const outerSweep = waxing ? 0 : 1;
    // Terminator: ellipse arc back to top. For a crescent (phase < 0.25 or > 0.75)
    // the terminator bulges TOWARD the lit side; for a gibbous it bulges INTO it.
    const isCrescent = phase < 0.25 || phase > 0.75;
    const termSweep = (waxing === !isCrescent) ? 1 : 0;
    const darkCap = `
      <path d="M ${cx},${cy - r}
               A ${r},${r} 0 0 ${outerSweep} ${cx},${cy + r}
               A ${rx},${r} 0 0 ${termSweep} ${cx},${cy - r} Z"
            fill="#2a2e3a" opacity="0.92"/>
    `;
    return body + darkCap;
  }

  _phaseName(p) {
    if (p < 0.03 || p > 0.97) return "New moon";
    if (p < 0.22) return "Waxing crescent";
    if (p < 0.28) return "First quarter";
    if (p < 0.47) return "Waxing gibbous";
    if (p < 0.53) return "Full moon";
    if (p < 0.72) return "Waning gibbous";
    if (p < 0.78) return "Last quarter";
    return "Waning crescent";
  }

  _mount(inner) {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { padding: 12px; }
        .rh-wrap { display: flex; flex-direction: column; gap: 10px; }
        .rh-chart { display: flex; flex-direction: column; gap: 4px; }
        .rh-svg {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 6px;
          overflow: hidden;
          background: transparent;
        }
        .rh-axis {
          position: relative;
          height: 1.2em;
          font-size: 0.95em;
        }
        .rh-axis > span {
          position: absolute;
          transform: translateX(-50%);
          color: var(--primary-text-color);
          white-space: nowrap;
          font-variant: small-caps;
          letter-spacing: 0.04em;
        }
        .rh-silhouette { fill: url(#rhTerrain); stroke: #061608; stroke-width: 0.25; }
        .rh-sun-path  { fill: none; stroke: #fbbf24; stroke-width: 1.1; stroke-linejoin: round; }
        .rh-moon-path { fill: none; stroke: #e2e8f0; stroke-width: 0.8;
                        stroke-dasharray: 1.4 1.4; opacity: 0.8;
                        stroke-linejoin: round; }
        .rh-grid { stroke: rgba(255,255,255,0.13); stroke-width: 0.15; stroke-dasharray: 1 1.5; }
        /* SVG-internal label classes were dropped; cardinals now live in .rh-axis HTML. */
        .rh-sun-now { filter: drop-shadow(0 0 1.6px rgba(251,191,36,0.95)); }
        .rh-summary {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.95em; flex-wrap: wrap; gap: 10px;
          padding: 0 2px;
        }
        .rh-block { display: inline-flex; align-items: center; gap: 8px; }
        .rh-icon-svg { vertical-align: middle; flex-shrink: 0; }
        .rh-rs { display: inline-flex; align-items: center; gap: 2px;
                 font-variant-numeric: tabular-nums; }
        .rh-arrow { font-weight: 700; }
        .rh-arrow-rise { color: #10b981; }
        .rh-arrow-set  { color: #ef4444; }
        .rh-pct { color: var(--secondary-text-color); font-size: 0.9em; }
        .rh-dim { color: var(--secondary-text-color); }
        .rh-error { color: var(--error-color); padding: 8px; }
      </style>
      ${inner}
    `;
  }
}

customElements.define("real-horizon-card", RealHorizonCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "real-horizon-card",
  name: "Real Horizon",
  description: "Sun + moon over local terrain horizon (PVGIS).",
  preview: false,
});

console.info(
  "%c REAL-HORIZON-CARD %c v0.3.2 ",
  "color:#f5f3e7;background:#0b2447;padding:2px 4px;border-radius:3px",
  "color:#0b2447;background:#fbbf24;padding:2px 4px;border-radius:3px"
);
