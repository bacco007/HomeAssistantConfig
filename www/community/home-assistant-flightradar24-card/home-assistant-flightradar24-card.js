var st = Object.defineProperty, nt = (t, e) => () => (t && (e = t(t = 0)), e), $t = (t, e) => {
  let a = {};
  for (var i in t)
    st(a, i, {
      get: t[i],
      enumerable: !0
    });
  return e || st(a, Symbol.toStringTag, { value: "Module" }), a;
};
function Mt(t, e) {
  const a = e.querySelector("style[data-fr24-style]");
  a && a.remove();
  const i = t.radar, o = i["background-color"] || i["primary-color"] || "var(--dark-primary-color)", r = i["aircraft-color"] || i["accent-color"] || "var(--accent-color)", n = i["aircraft-selected-color"] || i["aircraft-color"] || i["accent-color"] || "var(--accent-color)", l = i["radar-grid-color"] || i["feature-color"] || "var(--secondary-text-color)", s = i["local-features-color"] || i["feature-color"] || i["radar-grid-color"] || "var(--secondary-text-color)", u = i["callsign-label-color"] || "var(--primary-background-color)", b = i["background-opacity"] !== void 0 ? Math.max(0, Math.min(1, i["background-opacity"])) : 0.05, _ = i.radar_size !== void 0 ? Math.max(30, Math.min(90, i.radar_size)) : 70, m = (100 - _) / 2, y = t.config.scale !== void 0 ? Math.max(0.5, Math.min(3, t.config.scale)) : 1, x = document.createElement("style");
  x.setAttribute("data-fr24-style", "1"), x.textContent = `
    :host {
      --radar-background-color: ${o};
      --radar-aircraft-color: ${r};
      --radar-aircraft-selected-color: ${n};
      --radar-grid-color: ${l};
      --radar-local-features-color: ${s};
      --radar-callsign-label-color: ${u};
    }
    #flights-card {
      padding: 16px;
      transform: scale(${y});
      transform-origin: top center;
    }
    #flights {
      padding: 0px;
    }
    #flights .flight {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    #flights .flight.first {
      margin-top: 0px;
    }
    #flights .flight.selected {
      margin-left: -3px;
      margin-right: -3px;
      padding: 3px;
      background-color: var(--primary-background-color);
      border: 1px solid var(--fc-border-color);
      border-radius: 4px;
    }
    #flights .flight {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    #flights > :first-child {
      margin-top: 0px;
    }
    #flights > :last-child {
      margin-bottom: 0px;
    }
    #flights .flight a {
      text-decoration: none;
      font-size: 0.8em;
      margin-left: 0.2em;
    }
    #flights .description {
      flex-grow: 1;
    }
    #flights .no-flights-message {
      text-align: center;
      font-size: 1.2em;
      color: gray;
      margin-top: 20px;
    }
    #radar-container {
      display: flex;
      justify-content: space-between;
      position: relative;
    }
    #radar-overlay {
      position: absolute;
      width: ${_}%;
      left: ${m}%;
      padding: 0 0 ${_}% 0;
      margin-bottom: 5%;
      z-index: 1;
      opacity: 0;
      pointer-events: none;
      border-radius: 50%;
      overflow: hidden;
    }
    #radar-info {
      position: absolute;
      width: 30%;
      text-align: left;
      font-size: 0.9em;
      padding: 0;
      margin: 0;
    }
    #toggle-container {
      position: absolute;
      right: 0;
      width: 25%;
      text-align: left;
      font-size: 0.9em;
      padding: 0;
      margin: 0 15px;
      z-index: 10;
    }
    .toggle {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    .toggle label {
      margin-right: 10px;
      flex: 1;
    }
    #radar {
      position: relative;
      width: ${_}%;
      height: 0;
      margin: 0 ${m}%;
      padding-bottom: ${_}%;
      margin-bottom: 5%;
      border-radius: 50%;
      overflow: hidden;
    }
    #radar-screen {
      position: absolute;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0%;
    }
    #radar-screen-background {
      position: absolute;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0%;
      background-color: var(--radar-background-color);
      opacity: ${b};
    }
    #tracker {
      position: absolute;
      width: 3px;
      height: 3px;
      background-color: var(--info-color);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .plane {
      position: absolute;
      translate: -50% -50%;
      z-index: 2;
      --marker-base-scale: 1.0;
      --selected-scale: 1.0;
      scale: calc(var(--marker-base-scale) * var(--selected-scale));
    }
    .plane.marker-size-small { --marker-base-scale: 0.7; }
    .plane.marker-size-large { --marker-base-scale: 1.4; }
    .plane.marker-size-x-large { --marker-base-scale: 2.0; }
    .plane.marker-size-xx-large { --marker-base-scale: 2.8; }
    .plane.plane-small {
      width: 4px;
      height: 6px;
    }
    .plane.plane-medium {
      width: 6px;
      height: 8px;
    }
    .plane.plane-large {
      width: 8px;
      height: 16px;
    }
    .plane.plane-custom {
      width: 12px;
      height: 14px;
    }
    .plane .arrow {
      position: absolute;
      width: 0;
      height: 0;
      transform-origin: center center;
    }
    .plane.plane-small .arrow {
      border-left: 2px solid transparent;
      border-right: 2px solid transparent;
      border-bottom: 6px solid var(--radar-aircraft-color);
    }
    .plane.plane-medium .arrow {
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      border-bottom: 8px solid var(--radar-aircraft-color);
    }
    .plane.plane-large .arrow {
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 16px solid var(--radar-aircraft-color);
    }
    .plane.selected {
      z-index: 3;
      --selected-scale: 1.2;
    }
    .plane.selected .arrow {
      border-bottom-color: var(--radar-aircraft-selected-color);
    }
    .custom-marker {
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
    }
    .custom-marker img,
    .custom-marker canvas {
      display: block;
      width: 12px;
      height: auto;
    }

    .callsign-label {
      position: absolute;
      background-color: var(--radar-callsign-label-color);
      opacity: 0.7;
      border: 1px solid lightgray;
      line-height: 1em;
      padding: 0px;
      margin: 0px;
      border-radius: 3px;
      font-size: 9px;
      color: var(--primary-text-color);
      z-index: 2;
    }
    .ring {
      position: absolute;
      border: 1px dashed var(--radar-grid-color);
      border-radius: 50%;
      pointer-events: none;
    }
    .dotted-line {
      position: absolute;
      top: 50%;
      left: 50%;
      border-bottom: 1px dotted var(--radar-grid-color);
      width: 50%;
      height: 0px;
      transform-origin: 0 0;
      pointer-events: none;
    }
    .runway {
      position: absolute;
      background-color: var(--radar-local-features-color);
      height: 2px;
    }
    .location-dot {
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: var(--radar-local-features-color);
      border-radius: 50%;
    }
    .location-label {
      position: absolute;
      background: none;
      line-height: 0;
      border: none;
      padding: 0px;
      font-size: 10px;
      color: var(--radar-local-features-color);
      opacity: 0.5;
    }
    .outline-line {
      position: absolute;
      background-color: var(--radar-local-features-color);
      opacity: 0.35;
    }
    /* Inline critical Leaflet pane CSS — survives Shadow DOM clears and CSP */
    .leaflet-pane {
      position: absolute;
      left: 0;
      top: 0;
    }
    .leaflet-tile {
      pointer-events: none;
    }
  `, e.appendChild(x);
}
function Lt(t, e) {
  if (!e) return;
  e.innerHTML = "";
  const a = t.config.toggles || {}, i = !!window.customElements && !!customElements.get("ha-switch");
  Object.keys(a).forEach((o) => {
    const r = a[o], n = document.createElement("div");
    n.className = "toggle";
    const l = document.createElement("label");
    l.textContent = r.label || o, n.appendChild(l);
    let s;
    i ? s = document.createElement("ha-switch") : (s = document.createElement("input"), s.type = "checkbox"), s.checked = r.default === !0, s.addEventListener("change", () => {
      t.setToggleValue && t.setToggleValue(o, s.checked);
    }), n.appendChild(s), e.appendChild(n);
  });
}
function S(t) {
  return t * (Math.PI / 180);
}
function Z(t) {
  return t * (180 / Math.PI);
}
function N(t, e, a, i, o = "km") {
  const n = S(a - t), l = S(i - e), s = Math.sin(n / 2) * Math.sin(n / 2) + Math.cos(S(t)) * Math.cos(S(a)) * Math.sin(l / 2) * Math.sin(l / 2), u = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return o === "km" ? 6371 * u : 6371 * u / 1.60934;
}
function V(t, e, a, i) {
  const o = S(i - e), r = Math.sin(o) * Math.cos(S(a)), n = Math.cos(S(t)) * Math.sin(S(a)) - Math.sin(S(t)) * Math.cos(S(a)) * Math.cos(o);
  return (Z(Math.atan2(r, n)) + 360) % 360;
}
function K(t, e, a, i) {
  const r = S(a), n = S(t), l = S(e), s = i / 6371, u = Math.asin(Math.sin(n) * Math.cos(s) + Math.cos(n) * Math.sin(s) * Math.cos(r)), b = l + Math.atan2(Math.sin(r) * Math.sin(s) * Math.cos(n), Math.cos(s) - Math.sin(n) * Math.sin(u));
  return {
    lat: Z(u),
    lon: Z(b)
  };
}
function Et(t, e, a, i, o) {
  const r = V(a, i, t, e), n = Math.abs((o - r + 360) % 360);
  return K(a, i, o, N(t, e, a, i) * Math.cos(S(n)));
}
function At(t) {
  return [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW"
  ][Math.round(t / 45) % 8];
}
function lt(t, e, a = 60) {
  const i = Math.abs((t - e + 360) % 360);
  return i <= a || i >= 360 - a;
}
function W(t) {
  if (!t || !t.config)
    return console.error("Config not set in getLocation"), {
      latitude: 0,
      longitude: 0
    };
  const { config: e, hass: a } = t;
  if (e.location_tracker && a && a.states && e.location_tracker in a.states) {
    const i = a.states[e.location_tracker].attributes;
    return {
      latitude: i.latitude,
      longitude: i.longitude
    };
  } else {
    if (e.location) return {
      latitude: e.location.lat,
      longitude: e.location.lon
    };
    if (a && a.config) return {
      latitude: a.config.latitude,
      longitude: a.config.longitude
    };
  }
  return {
    latitude: 0,
    longitude: 0
  };
}
var Rt = /* @__PURE__ */ new Set([
  "bw",
  "light",
  "color",
  "dark",
  "voyager",
  "satellite",
  "topo",
  "outlines",
  "system"
]);
function mt(t) {
  const e = t?.radar;
  return !(!e || e.hide === !0 || !e.background_map || !Rt.has(e.background_map));
}
function Ft(t, e, a) {
  if (mt(t)) {
    if (!e.querySelector("#leaflet-css-loader")) {
      const i = document.createElement("link");
      i.id = "leaflet-css-loader", i.rel = "stylesheet", i.href = "https://unpkg.com/leaflet/dist/leaflet.css", e.appendChild(i);
    }
    if (window.L) {
      a();
      return;
    }
    if (e.querySelector("#leaflet-js-loader")) {
      const i = setInterval(() => {
        window.L && (clearInterval(i), a());
      }, 50);
    } else {
      const i = document.createElement("script");
      i.id = "leaflet-js-loader", i.src = "https://unpkg.com/leaflet/dist/leaflet.js", i.async = !0, i.onload = a, i.onerror = () => {
        i.remove(), console.error("[FR24] Leaflet script load failed");
      }, e.appendChild(i);
    }
  }
}
function Ot(t, e) {
  const { config: a, dimensions: i } = t;
  if (!mt(t)) {
    t._leafletMap && (t._leafletMap.remove(), t._leafletMap = null);
    const c = e.querySelector("#radar-map-bg");
    c && c.remove();
    return;
  }
  const o = a?.radar?.background_map, r = {
    bw: ["https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png", {
      api_key: "?api_key=",
      attribution: "Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap",
      subdomains: []
    }],
    light: ["https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
      attribution: "&copy; CartoDB, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c",
        "d"
      ]
    }],
    color: ["https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c"
      ]
    }],
    dark: ["https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
      attribution: "&copy; CartoDB, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c",
        "d"
      ]
    }],
    voyager: ["https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png", {
      attribution: "&copy; CartoDB, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c",
        "d"
      ]
    }],
    satellite: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
      subdomains: []
    }],
    topo: ["https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenTopoMap, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c"
      ]
    }],
    outlines: ["https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}.png", {
      api_key: "?api_key=",
      attribution: "Map tiles by Stamen Design, hosted by Stadia Maps; Data by OpenStreetMap",
      subdomains: []
    }],
    system: null
  }, n = typeof a?.radar?.background_map_opacity == "number" ? Math.max(0, Math.min(1, a.radar.background_map_opacity)) : 1;
  let l = e.querySelector("#radar-map-bg");
  l ? l.style.opacity = String(n) : (l = document.createElement("div"), l.id = "radar-map-bg", l.style.position = "absolute", l.style.top = "0", l.style.left = "0", l.style.width = "100%", l.style.height = "100%", l.style.zIndex = "0", l.style.pointerEvents = "none", l.style.opacity = String(n), e.appendChild(l)), l.style.transform = "", t._leafletMap && t._leafletMap.getContainer() !== l && (t._leafletMap.remove(), t._leafletMap = null);
  const s = W(t), u = Math.max(i?.range || 1, 1), b = t.units?.distance === "miles" ? u * 1.60934 : u, _ = s?.latitude || 0, m = s?.longitude || 0, y = Math.PI / 180, x = 111.13209 - 0.56605 * Math.cos(2 * _ * y) + 12e-4 * Math.cos(4 * _ * y), E = 111.32 * Math.cos(_ * y) - 0.094 * Math.cos(3 * _ * y), M = b / x, F = b / E, O = [[_ - M, m - F], [_ + M, m + F]];
  let L = o;
  if (o === "system") {
    const c = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    let d = !1;
    try {
      d = !!(window.parent && window.parent.document && window.parent.document.body.classList.contains("dark"));
    } catch {
    }
    d || c ? L = "dark" : L = "color";
  }
  const A = r[L || "color"] || r.color;
  if (!A) return l;
  let [C, k] = A;
  const w = k && "api_key" in k, p = a?.radar?.background_map_api_key && a.radar.background_map_api_key.trim().length > 0;
  if (w && !p)
    return t._leafletMap && (t._leafletMap.remove(), t._leafletMap = null), l.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--secondary-text-color); text-align: center; padding: 20px; font-size: 0.9em;">API key required for this map type. Configure in Background Map settings.</div>', l;
  if (t._leafletMap || (l.innerHTML = ""), w && p && a?.radar?.background_map_api_key && (C = C + k.api_key + encodeURIComponent(a.radar.background_map_api_key)), window.L) {
    const c = {
      type: L || "color",
      apiKey: a?.radar?.background_map_api_key
    }, d = !t._currentMapConfig || t._currentMapConfig.type !== c.type || t._currentMapConfig.apiKey !== c.apiKey;
    t._leafletMap ? d && (t._leafletMap.eachLayer((h) => {
      t._leafletMap.removeLayer(h);
    }), window.L.tileLayer(C, k).addTo(t._leafletMap), t._currentMapConfig = c) : (t._leafletMap = window.L.map(l, {
      attributionControl: !1,
      zoomControl: !1,
      dragging: !1,
      scrollWheelZoom: !1,
      boxZoom: !1,
      doubleClickZoom: !1,
      keyboard: !1,
      touchZoom: !1,
      pointerEvents: !1
    }), window.L.tileLayer(C, k).addTo(t._leafletMap), t._currentMapConfig = c), _t(t._leafletMap, l, O, b), t.mapCenter = {
      lat: Math.round(_ * 100) / 100,
      lon: Math.round(m * 100) / 100
    }, t.mapZoom = Math.round(t._leafletMap.getZoom());
  }
  return l;
}
function _t(t, e, a, i, o = 15) {
  e.offsetHeight;
  const r = t.getContainer(), n = r.offsetWidth, l = r.offsetHeight;
  if (n > 0 && l > 0) {
    t.fitBounds(a, {
      animate: !1,
      padding: [0, 0]
    });
    const s = window.L.point(0, l / 2), u = window.L.point(n, l / 2), b = t.containerPointToLatLng(s), _ = t.containerPointToLatLng(u), m = N(b.lat, b.lng, _.lat, _.lng, "km") / (i * 2);
    e.style.transform = `scale(${m})`;
  } else o > 0 && setTimeout(() => {
    _t(t, e, a, i, o - 1);
  }, 50);
}
function Tt(t) {
  const e = t._leafletMap;
  if (!e) return;
  const a = W(t), i = Math.max(t.dimensions?.range || 1, 1), o = t.units?.distance === "miles" ? i * 1.60934 : i, r = a?.latitude || 0, n = a?.longitude || 0, l = Math.PI / 180, s = 111.13209 - 0.56605 * Math.cos(2 * r * l) + 12e-4 * Math.cos(4 * r * l), u = 111.32 * Math.cos(r * l) - 0.094 * Math.cos(3 * r * l), b = o / s, _ = o / u, m = [[r - b, n - _], [r + b, n + _]], y = e.getContainer();
  y.offsetHeight;
  const x = y.offsetWidth, E = y.offsetHeight;
  if (x > 0 && E > 0) {
    e.fitBounds(m, {
      animate: !1,
      padding: [0, 0]
    });
    const M = window.L.point(0, E / 2), F = window.L.point(x, E / 2), O = e.containerPointToLatLng(M), L = e.containerPointToLatLng(F), A = N(O.lat, O.lng, L.lat, L.lng, "km") / (o * 2);
    y.style.transform = `scale(${A})`;
  }
}
function vt(t = {}, e, a = []) {
  if (a.includes(e))
    return console.error("Circular template dependencies detected. " + a.join(" -> ") + " -> " + e), "";
  if (t["compiled_" + e]) return t["compiled_" + e];
  let i = t[e];
  if (i === void 0)
    return console.error("Missing template reference: " + e), "";
  const o = /tpl\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let r;
  const n = {};
  for (; (r = o.exec(i)) !== null; ) {
    const l = r[1];
    n[l] || (n[l] = vt(t, l, [...a, e])), i = i.replace(`tpl.${l}`, "(`" + n[l] + '`).replace(/^undefined$/, "")');
  }
  return t["compiled_" + e] = i, i;
}
function ot(t, e, a, i) {
  const o = t.templates || {}, r = t.flightsContext || {}, n = t.units || {
    distance: "km",
    altitude: "ft",
    speed: "kts"
  }, l = t.radar || { range: 35 }, s = vt(o, e);
  try {
    const u = new Function("flights", "flight", "tpl", "units", "radar_range", "joinList", `return \`${s.replace(/\${(.*?)}/g, (b, _) => `\${${_}}`)}\``)(r, a, {}, n, Math.round(l.range), i);
    return u !== "undefined" ? u : "";
  } catch (u) {
    return console.error("Error when rendering: " + s, u), "";
  }
}
function J(t, e, a, i) {
  const { defines: o = {}, config: r = {}, radar: n = { range: 35 }, selectedFlights: l = [] } = t;
  if (typeof e == "string" && e.startsWith("${") && e.endsWith("}")) {
    const s = e.slice(2, -1);
    if (s === "selectedFlights") return l;
    if (s === "radar_range")
      return i && i(!0), n.range;
    if (s in o) return o[s];
    if (r.toggles && s in r.toggles) return r.toggles[s].default;
    if (a !== void 0) return a;
    console.error("Unresolved placeholder: " + s), console.debug("Defines", o);
  }
  return e;
}
function Q(t, e) {
  if (!t) return "";
  try {
    const a = new Function("map_lat", "map_lon", "zoom", "radar_range", "click_lat", "click_lon", "flight", "entity", "return `" + t.replace(/\${(.*?)}/g, "${$1}") + "`")(e.map_lat, e.map_lon, e.zoom, e.radar_range, e.click_lat, e.click_lon, e.flight ?? null, e.entity ?? null);
    return a !== "undefined" ? a : "";
  } catch (a) {
    return console.error("Error rendering URL path:", t, a), t;
  }
}
function tt(t) {
  const { units: e, radar: a, dom: i, dimensions: o, hass: r } = t, n = i?.radarInfoDisplay || i && i.radarContainer?.querySelector("#radar-info");
  n && (n.innerHTML = [a?.hide_range !== !0 ? ot(t, "radar_range", null, void 0) : ""].filter((C) => C).join("<br />"));
  const l = i?.radarScreen || i && i.radarContainer?.querySelector("#radar-screen") || t.mainCard?.shadowRoot && t.mainCard.shadowRoot.getElementById("radar-screen");
  if (!l) return;
  Array.from(l.childNodes).forEach((C) => {
    const k = C;
    k.id !== "radar-map-bg" && k.id !== "radar-screen-background" && l.removeChild(C);
  });
  let s = l.querySelector("#radar-screen-background");
  s || (s = document.createElement("div"), s.id = "radar-screen-background", l.appendChild(s));
  const u = W(t);
  t.mapCenter = {
    lat: Math.round(u.latitude * 100) / 100,
    lon: Math.round(u.longitude * 100) / 100
  }, t._leafletMap || (t.mapZoom = 8), Ot(t, l);
  const { width: b, height: _, range: m, scaleFactor: y, centerX: x, centerY: E } = o || {};
  if (!b || !_ || !m || !y || x == null || E == null) return;
  const M = m * 1.15, F = a?.ring_distance ?? 10, O = Math.floor(m / F);
  for (let C = 1; C <= O; C++) {
    const k = C * F * y, w = document.createElement("div");
    w.className = "ring", w.style.width = w.style.height = k * 2 + "px", w.style.top = Math.floor(E - k) + "px", w.style.left = Math.floor(x - k) + "px", l.appendChild(w);
  }
  for (let C = 0; C < 360; C += 45) {
    const k = document.createElement("div");
    k.className = "dotted-line", k.style.transform = `rotate(${C - 90}deg)`, l.appendChild(k);
  }
  const L = W(t), A = a?.local_features;
  if (A && r && L) {
    const C = L.latitude, k = L.longitude;
    A.forEach((w) => {
      if (!(w.max_range && a.range && w.max_range <= a.range)) {
        if (w.type === "outline" && w.points && w.points.length > 1) for (let p = 0; p < w.points.length - 1; p++) {
          const c = w.points[p], d = w.points[p + 1], h = N(C, k, c.lat, c.lon, e.distance), v = N(C, k, d.lat, d.lon, e.distance);
          if (h <= M || v <= M) {
            const f = V(C, k, c.lat, c.lon), g = V(C, k, d.lat, d.lon), $ = x + Math.cos((f - 90) * Math.PI / 180) * h * y, T = E + Math.sin((f - 90) * Math.PI / 180) * h * y, R = x + Math.cos((g - 90) * Math.PI / 180) * v * y, j = E + Math.sin((g - 90) * Math.PI / 180) * v * y, I = document.createElement("div");
            I.className = "outline-line", I.style.width = Math.hypot(R - $, j - T) + "px", I.style.height = "1px", I.style.top = T + "px", I.style.left = $ + "px", I.style.transformOrigin = "0 0", I.style.transform = `rotate(${Math.atan2(j - T, R - $) * (180 / Math.PI)}deg)`, l.appendChild(I);
          }
        }
        else if ("position" in w && w.position) {
          const { lat: p, lon: c } = w.position, d = N(C, k, p, c, e.distance);
          if (d <= M) {
            const h = V(C, k, p, c), v = x + Math.cos((h - 90) * Math.PI / 180) * d * y, f = E + Math.sin((h - 90) * Math.PI / 180) * d * y;
            if (w.type === "runway") {
              const g = w.heading ?? 0, $ = w.length ?? 0, T = e.distance === "km" ? $ * 3048e-7 : $ * 18939e-8, R = document.createElement("div");
              R.className = "runway", R.style.width = T * y + "px", R.style.height = "1px", R.style.top = f + "px", R.style.left = v + "px", R.style.transformOrigin = "0 50%", R.style.transform = `rotate(${g - 90}deg)`, l.appendChild(R);
            }
            if (w.type === "location") {
              const g = document.createElement("div");
              g.className = "location-dot";
              const $ = w.label;
              if (g.title = $ ?? "Location", g.style.top = f + "px", g.style.left = v + "px", l.appendChild(g), $) {
                const T = document.createElement("div");
                T.className = "location-label", T.textContent = $ || "Location", l.appendChild(T);
                const R = T.getBoundingClientRect(), j = R.width, I = R.height;
                T.style.top = f - I - 4 + "px", T.style.left = v - j / 2 + "px";
              }
            }
          }
        }
      }
    });
  }
}
function bt(t, e) {
  let a = null, i = null;
  function o(u) {
    const b = u[0], _ = u[1], m = b.clientX - _.clientX, y = b.clientY - _.clientY;
    return Math.sqrt(m * m + y * y);
  }
  function r(u) {
    u.preventDefault();
    const b = Math.sign(u.deltaY);
    t.radar.range += b * 2;
    const _ = t.radar.min_range || 1, m = t.radar.max_range || Math.max(100, t.radar.initialRange || 35);
    t.radar.range < _ && (t.radar.range = _), t.radar.range > m && (t.radar.range = m), t.mainCard.updateRadarRange(b * 2);
  }
  function n(u) {
    u.touches.length === 2 && (a = o(u.touches), i = t.radar.range);
  }
  function l(u) {
    if (u.touches.length === 2 && a !== null && i !== null) {
      u.preventDefault();
      const b = o(u.touches), _ = a / b, m = t.radar.min_range || 1, y = t.radar.max_range || Math.max(100, t.radar.initialRange || 35);
      let x = Math.round(i * _);
      x < m && (x = m), x > y && (x = y), t.radar.range = x, t.mainCard.updateRadarRange(0);
    }
  }
  function s() {
    a !== null && (a = null, i = null, t.config.updateRangeFilterOnTouchEnd && t.renderDynamicOnRangeChange && t.mainCard.renderDynamic());
  }
  return e && (e.addEventListener("wheel", r, { passive: !1 }), e.addEventListener("touchstart", n, { passive: !0 }), e.addEventListener("touchmove", l, { passive: !1 }), e.addEventListener("touchend", s, { passive: !0 })), () => {
    e && (e.removeEventListener("wheel", r), e.removeEventListener("touchstart", n), e.removeEventListener("touchmove", l), e.removeEventListener("touchend", s));
  };
}
function It(t, e, a) {
  const i = t.config?.tap_action;
  if (!i) return;
  const o = t.dom?.radar;
  if (!o) {
    it(Q(i, {
      map_lat: t.mapCenter?.lat,
      map_lon: t.mapCenter?.lon,
      zoom: t.mapZoom,
      radar_range: t.radar?.range,
      entity: at(t)
    }));
    return;
  }
  const r = o.getBoundingClientRect(), n = e - r.left, l = a - r.top, s = r.width, u = r.height, b = t.units?.distance === "miles" ? (t.radar?.range || 1) * 1.60934 : t.radar?.range || 1, _ = s / 2, m = u / 2, y = n - _, x = l - m, E = Math.sqrt(y * y + x * x) / Math.min(_, m) * b, M = (Math.atan2(y, -x) * (180 / Math.PI) + 360) % 360, F = t.mapCenter?.lat || 0, O = t.mapCenter?.lon || 0, L = M * Math.PI / 180, A = 111.32, C = 111.32 * Math.cos(F * Math.PI / 180), k = Math.round((F + E / A * Math.cos(L)) * 100) / 100, w = Math.round((O + E / C * Math.sin(L)) * 100) / 100;
  it(Q(i, {
    map_lat: t.mapCenter?.lat,
    map_lon: t.mapCenter?.lon,
    zoom: t.mapZoom,
    radar_range: t.radar?.range,
    click_lat: k,
    click_lon: w,
    entity: at(t)
  }));
}
function et(t, e) {
  const a = (t.config?.flight_tap_action || "toggle").split("|").map((r) => r.trim()), i = a.includes("toggle"), o = a.find((r) => r !== "toggle") || "";
  i && t.toggleSelectedFlight(e), o && it(Q(o, {
    map_lat: t.mapCenter?.lat,
    map_lon: t.mapCenter?.lon,
    zoom: t.mapZoom,
    radar_range: t.radar?.range,
    flight: e,
    entity: at(t)
  }));
}
function at(t) {
  const e = t.config?.flights_entity;
  if (!e || !t.hass?.states) return;
  const a = t.hass.states[e];
  if (a)
    return a;
}
function it(t) {
  t && window.open(t, "_blank");
}
function St(t, e) {
  e.shadowRoot.innerHTML = "";
  const a = document.createElement("ha-card");
  if (a.id = "flights-card", !t.radar?.hide) {
    const o = document.createElement("div");
    o.id = "radar-container";
    const r = document.createElement("div");
    r.id = "radar-overlay", o.appendChild(r);
    const n = document.createElement("div");
    n.id = "radar-info", o.appendChild(n);
    const l = document.createElement("div");
    l.id = "toggle-container";
    const s = document.createElement("div");
    s.id = "radar";
    const u = document.createElement("div");
    u.id = "radar-screen", s.appendChild(u);
    const b = document.createElement("div");
    b.id = "tracker", s.appendChild(b);
    const _ = document.createElement("div");
    _.id = "planes", s.appendChild(_), o.appendChild(s), o.appendChild(l), a.appendChild(o), requestAnimationFrame(() => {
      tt(t), e.observeRadarResize(), bt(t, s), s.addEventListener("click", (m) => {
        m.composedPath().some((y) => y.classList?.contains?.("plane")) || It(t, m.clientX, m.clientY);
      });
    }), t.dom = t.dom || {}, t.dom.toggleContainer = l, t.dom.planesContainer = _, t.dom.radar = s, t.dom.radarScreen = u, t.dom.radarInfoDisplay = n, t.dom.shadowRoot = e.shadowRoot, t.mainCard = e;
  }
  const i = document.createElement("div");
  i.id = "flights", t.list && t.list.hide === !0 && (i.style.display = "none"), a.appendChild(i), e.shadowRoot.appendChild(a), Mt(t, e.shadowRoot), t.dom?.toggleContainer && Lt(t, t.dom.toggleContainer);
}
function yt(t, e) {
  return (t.flights || []).filter((a) => wt(t, a, e));
}
function wt(t, e, a) {
  return Array.isArray(a) ? a.every((i) => H(t, e, i)) : H(t, e, a);
}
function H(t, e, a) {
  let i = !0;
  if (a.type === "AND" && a.conditions) i = a.conditions.every((o) => H(t, e, o));
  else if (a.type === "OR" && a.conditions) i = a.conditions.some((o) => H(t, e, o));
  else if (a.type === "NOT" && a.condition) i = !H(t, e, a.condition);
  else {
    const { field: o, defined: r, defaultValue: n, comparator: l } = a, s = J(t, a.value), u = o ? e[o] : r ? J(t, "${" + r + "}", n) : void 0;
    switch (l) {
      case "eq":
        i = u === s;
        break;
      case "lt":
        i = Number(u) < Number(s);
        break;
      case "lte":
        i = Number(u) <= Number(s);
        break;
      case "gt":
        i = Number(u) > Number(s);
        break;
      case "gte":
        i = Number(u) >= Number(s);
        break;
      case "oneOf":
        i = (Array.isArray(s) ? s : typeof s == "string" ? s.split(",").map((b) => b.trim()) : []).includes(u);
        break;
      case "containsOneOf": {
        const b = Array.isArray(s) ? s : typeof s == "string" ? s.split(",").map((_) => _.trim()) : [];
        i = !!u && b.some((_) => u.includes(_));
        break;
      }
      default:
        i = !1;
    }
  }
  return a.debugIf === i && console.debug("applyCondition", a, e, i), i;
}
var Dt = 12, dt = /* @__PURE__ */ new Map(), ct = /* @__PURE__ */ new Map();
function zt(t) {
  if (!t) return [0, 0];
  const e = t.split(",").map(Number);
  return [e[0] || 0, e[1] || 0];
}
function Nt(t) {
  const e = {
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    color: "rgba(0,0,0,0.5)"
  };
  if (!t) return e;
  const a = t.trim().split(/\s+/);
  if (a.length < 2) return e;
  e.offsetX = parseFloat(a[0]) || 0, e.offsetY = parseFloat(a[1]) || 0;
  let i = 2;
  return a.length > 2 && /^[\d.]+(?:px|em|rem|pt|cm|mm|in|pc|ex|ch|vw|vh|vmin|vmax)$/i.test(a[2]) && (e.blur = Math.max(0, parseFloat(a[2]) || 0), i = 3), a.length > i && (e.color = a.slice(i).join(" ")), e;
}
function jt(t) {
  const e = dt.get(t);
  if (e) return e;
  const a = new Promise((i, o) => {
    const r = new Image();
    r.onload = () => i(r), r.onerror = () => o(/* @__PURE__ */ new Error(`Failed to load marker image: ${t}`)), r.src = t;
  });
  return dt.set(t, a), a;
}
function Pt(t, e) {
  const a = t.width, i = t.height, o = a / Dt, r = e["aircraft-marker-color-overlay"], n = e["aircraft-marker-outline-width"] ?? 0, l = e["aircraft-marker-outline-color"] || "#000000", s = e["aircraft-marker-shadow"] || "", u = Nt(s), b = Math.round(u.offsetX * o), _ = Math.round(u.offsetY * o), m = Math.round(u.blur * o), y = Math.ceil(n * o), x = Math.max(1, Math.round(y * 0.4)), E = Math.ceil(Math.max(y + x * 2, Math.abs(b) + m * 2, Math.abs(_) + m * 2)), M = a + 2 * E, F = i + 2 * E, O = document.createElement("canvas");
  O.width = M, O.height = F;
  const L = O.getContext("2d"), A = E, C = E;
  if (s && (b !== 0 || _ !== 0 || m > 0)) {
    const k = document.createElement("canvas");
    k.width = a, k.height = i;
    const w = k.getContext("2d");
    w.drawImage(t, 0, 0, a, i), w.globalCompositeOperation = "source-atop", w.fillStyle = u.color, w.fillRect(0, 0, a, i), L.save(), m > 0 && (L.filter = `blur(${m}px)`), L.drawImage(k, A + b, C + _, a, i), L.restore();
  }
  if (y > 0) {
    const k = document.createElement("canvas");
    k.width = M, k.height = F;
    const w = k.getContext("2d"), p = a + 2 * y, c = i + 2 * y;
    w.save(), w.filter = `blur(${x}px)`, w.drawImage(t, A - y, C - y, p, c), w.filter = "none", w.globalCompositeOperation = "source-atop", w.fillStyle = l, w.fillRect(0, 0, M, F), w.restore(), L.drawImage(k, 0, 0);
  }
  return L.drawImage(t, A, C, a, i), r && (L.globalCompositeOperation = "source-atop", L.fillStyle = r, L.fillRect(A, C, a, i)), O;
}
function qt(t) {
  return `${t["aircraft-marker-url"]}|${t["aircraft-marker-color-overlay"]}|${t["aircraft-marker-outline-width"]}|${t["aircraft-marker-outline-color"]}|${t["aircraft-marker-shadow"]}`;
}
function Bt(t) {
  const e = qt(t), a = ct.get(e);
  if (a) return a;
  const i = jt(t["aircraft-marker-url"]).then((o) => Pt(o, t));
  return ct.set(e, i), i;
}
function Vt(t, e) {
  const a = document.createElement("div");
  a.className = "custom-marker";
  const i = document.createElement("div");
  i.className = "custom-marker-transform", a.appendChild(i);
  const o = t["aircraft-marker-url"], r = t["aircraft-marker-color-overlay"], n = t["aircraft-marker-outline-width"] ?? 0;
  t["aircraft-marker-outline-color"];
  const l = t["aircraft-marker-shadow"] || "";
  if (r || n > 0 || l.length > 0) {
    const m = document.createElement("canvas");
    i.appendChild(m), Bt(t).then((y) => {
      m.width = y.width, m.height = y.height, m.getContext("2d").drawImage(y, 0, 0);
    }).catch(() => {
    });
  } else {
    const m = document.createElement("img");
    m.src = o, m.draggable = !1, i.appendChild(m);
  }
  const s = t["aircraft-marker-rotation"] ?? 0, u = t["aircraft-marker-scale"] ?? 1, [b, _] = zt(t["aircraft-marker-center"]);
  return i.style.transform = `rotate(${e + s}deg) scale(${u})`, i.style.transformOrigin = `calc(50% + ${b}px) calc(50% + ${_}px)`, a;
}
function X(t) {
  const { flights: e, radar: a, selectedFlights: i, dimensions: o, dom: r } = t;
  let n;
  a && a.filter === !0 ? n = t.flightsFiltered || e : a && a.filter && typeof a.filter == "object" ? n = yt(t, a.filter) : n = e;
  const l = r?.planesContainer || t.mainCard?.shadowRoot && t.mainCard.shadowRoot.getElementById("planes");
  if (!l) return;
  l.innerHTML = "";
  const { range: s, scaleFactor: u, centerX: b, centerY: _ } = o;
  if (!s || !u || b === void 0 || _ === void 0) return;
  const m = s * 1.15, y = a?.["aircraft-marker"]?.default;
  n.slice().reverse().forEach((x) => {
    const E = x.distance_to_tracker;
    if (E !== void 0 && E <= m) {
      const M = document.createElement("div");
      M.className = "plane";
      const F = x.heading_from_tracker ?? 0, O = b + Math.cos((F - 90) * Math.PI / 180) * E * u, L = _ + Math.sin((F - 90) * Math.PI / 180) * E * u;
      if (M.style.top = L + "px", M.style.left = O + "px", y?.["aircraft-marker-url"]) {
        M.classList.add("plane-custom");
        const c = Vt(y, x.heading ?? 0);
        M.appendChild(c);
      } else {
        const c = document.createElement("div");
        c.className = "arrow", c.style.transform = `rotate(${x.heading}deg)`, M.appendChild(c), (x.altitude ?? 0) <= 0 ? M.classList.add("plane-small") : M.classList.add("plane-medium");
      }
      const A = document.createElement("div");
      A.className = "callsign-label", A.textContent = x.callsign ?? x.aircraft_registration ?? "n/a", l.appendChild(A);
      const C = A.getBoundingClientRect(), k = C.width + 3, w = C.height + 6;
      A.style.top = L - w + "px", A.style.left = O - k + "px";
      const p = a["aircraft-marker-size"];
      p && p !== "normal" && M.classList.add(`marker-size-${p}`), i && i.includes(x.id) && M.classList.add("selected"), M.addEventListener("click", (c) => {
        c.stopPropagation(), et(t, x);
      }), A.addEventListener("click", (c) => {
        c.stopPropagation(), et(t, x);
      }), l.appendChild(M);
    }
  });
}
function pt(t, e) {
  const a = document.createElement("img");
  return a.setAttribute("src", `https://flagsapi.com/${t}/shiny/16.png`), a.setAttribute("title", `${e}`), a.style.position = "relative", a.style.top = "3px", a.style.left = "2px", a;
}
function Ht(t, e, a) {
  try {
    let i = e[a];
    if (t.config.annotate) {
      const o = Object.assign({}, e);
      t.config.annotate.filter((r) => r.field === a).forEach((r) => {
        wt(t, e, r.conditions) && (o[a] = r.render.replace(/\$\{([^}]*)\}/g, (n, l) => String(o[l] || "")));
      }), i = String(o[a] || "");
    }
    return i;
  } catch (i) {
    return console.error(`[FR24Card] flightField error for field '${a}':`, i), "";
  }
}
function Ut(t, e) {
  try {
    const a = Object.assign({}, e);
    [
      "flight_number",
      "callsign",
      "aircraft_registration",
      "aircraft_model",
      "aircraft_code",
      "airline",
      "airline_short",
      "airline_iata",
      "airline_icao",
      "airport_origin_name",
      "airport_origin_code_iata",
      "airport_origin_code_icao",
      "airport_origin_country_name",
      "airport_origin_country_code",
      "airport_destination_name",
      "airport_destination_code_iata",
      "airport_destination_code_icao",
      "airport_destination_country_name",
      "airport_destination_country_code"
    ].forEach((o) => {
      a[o] = Ht(t, a, o);
    }), a.origin_flag = a.airport_origin_country_code ? pt(a.airport_origin_country_code, a.airport_origin_country_name || "").outerHTML : "", a.destination_flag = a.airport_destination_country_code ? pt(a.airport_destination_country_code, a.airport_destination_country_name || "").outerHTML : "", a.climb_descend_indicator = Math.abs(a.vertical_speed) > 100 ? a.vertical_speed > 100 ? "↑" : "↓" : "", a.alt_in_unit = a.altitude >= 17750 ? `FL${Math.round(a.altitude / 1e3) * 10}` : a.altitude > 0 ? t.units.altitude === "m" ? `${Math.round(a.altitude * 0.3048)} m` : `${Math.round(a.altitude)} ft` : void 0, a.spd_in_unit = a.ground_speed > 0 ? t.units.speed === "kmh" ? `${Math.round(a.ground_speed * 1.852)} km/h` : t.units.speed === "mph" ? `${Math.round(a.ground_speed * 1.15078)} mph` : `${Math.round(a.ground_speed)} kts` : void 0, a.approach_indicator = a.ground_speed > 70 ? a.is_approaching ? "↓" : a.is_receding ? "↑" : "" : "", a.dist_in_unit = `${Math.round(a.distance_to_tracker || 0)} ${t.units.distance}`, a.direction_info = `${Math.round(a.heading_from_tracker || 0)}° ${a.cardinal_direction_from_tracker || ""}`;
    const i = document.createElement("div");
    return i.style.clear = "both", i.className = "flight", t.selectedFlights && t.selectedFlights.includes(a.id) && (i.className += " selected"), i.innerHTML = ot(t, "flight_element", a, (o) => (...r) => r?.filter((n) => n).join(o || " ")), i.addEventListener("click", (o) => {
      o.stopPropagation(), et(t, a);
    }), i;
  } catch (a) {
    console.error("[FR24Card] renderFlight error:", a);
    const i = document.createElement("div");
    return i.className = "flight error", i.textContent = `Error rendering flight: ${a}`, i;
  }
}
var ut = {
  altitude: "ft",
  speed: "kts",
  distance: "km"
}, Wt = [
  {
    field: "id",
    comparator: "oneOf",
    value: "${selectedFlights}",
    order: "DESC"
  },
  {
    field: "altitude",
    comparator: "eq",
    value: 0,
    order: "ASC"
  },
  {
    field: "closest_passing_distance ?? distance_to_tracker",
    order: "ASC"
  }
], U, xt = nt((() => {
  U = {
    img_element: '${flight.aircraft_photo_small ? `<img style="float: right; width: 120px; height: auto; marginLeft: 8px; border: 1px solid black;" src="${flight.aircraft_photo_small}" />` : ""}',
    icon: '${flight.altitude > 0 ? (flight.vertical_speed > 100 ? "airplane-takeoff" : flight.vertical_speed < -100 ? "airplane-landing" : "airplane") : "airport"}',
    icon_element: '<ha-icon style="float: left;" icon="mdi:${tpl.icon}"></ha-icon>',
    flight_info: '${joinList(" - ")(flight.airline_short, flight.flight_number, flight.callsign !== flight.flight_number ? flight.callsign : "")}',
    flight_info_element: '<div style="font-weight: bold; padding-left: 5px; padding-top: 5px;">${tpl.flight_info}</div>',
    header: "<div>${tpl.img_element}${tpl.icon_element}${tpl.flight_info_element}</div>",
    aircraft_info: '${joinList(" - ")(flight.aircraft_registration, flight.aircraft_model)}',
    aircraft_info_element: '${tpl.aircraft_info ? `<div>${tpl.aircraft_info}</div>` : ""}',
    departure_info: '${flight.altitude === 0 && flight.time_scheduled_departure ? ` (${new Date(flight.time_scheduled_departure * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}',
    origin_info: '${joinList("")(flight.airport_origin_code_iata, tpl.departure_info, flight.origin_flag)}',
    arrival_info: "",
    destination_info: '${joinList("")(flight.airport_destination_code_iata, tpl.arrival_info, flight.destination_flag)}',
    route_info: '${joinList(" -> ")(tpl.origin_info, tpl.destination_info)}',
    route_element: "<div>${tpl.route_info}</div>",
    alt_info: '${flight.alt_in_unit ? "Alt: " + flight.alt_in_unit + flight.climb_descend_indicator : undefined}',
    spd_info: '${flight.spd_in_unit ? "Spd: " + flight.spd_in_unit : undefined}',
    hdg_info: '${flight.heading ? "Hdg: " + flight.heading + "°" : undefined}',
    dist_info: '${flight.dist_in_unit ? "Dist: " + flight.dist_in_unit + flight.approach_indicator : undefined}',
    flight_status: '<div>${joinList(" - ")(tpl.alt_info, tpl.spd_info, tpl.hdg_info)}</div>',
    position_status: '<div>${joinList(" - ")(tpl.dist_info, flight.direction_info)}</div>',
    proximity_info: '<div style="font-weight: bold; font-style: italic;">${flight.is_approaching && flight.ground_speed > 70 && flight.closest_passing_distance < 15 ? `Closest Distance: ${flight.closest_passing_distance} ${units.distance}, ETA: ${flight.eta_to_closest_distance} min` : ""}</div>',
    flight_element: "${tpl.header}${tpl.aircraft_info_element}${tpl.route_element}${tpl.flight_status}${tpl.position_status}${tpl.proximity_info}",
    radar_range: "Range: ${radar_range} ${units.distance}",
    list_status: "${flights.shown}/${flights.total}"
  };
}));
xt();
function ft(t, e) {
  return e.split(" ?? ").reduce((a, i) => a ?? t[i], void 0);
}
function Yt(t, e = (a) => a) {
  return function(a, i) {
    for (const o of t) {
      const { field: r, comparator: n, order: l = "ASC" } = o, s = e(o.value), u = ft(a, r), b = ft(i, r);
      let _ = 0;
      switch (n) {
        case "eq":
          u === s && b !== s ? _ = 1 : u !== s && b === s && (_ = -1);
          break;
        case "lt":
          u < s && b >= s ? _ = 1 : u >= s && b < s && (_ = -1);
          break;
        case "lte":
          u <= s && b > s ? _ = 1 : u > s && b <= s && (_ = -1);
          break;
        case "gt":
          u > s && b <= s ? _ = 1 : u <= s && b > s && (_ = -1);
          break;
        case "gte":
          u >= s && b < s ? _ = 1 : u < s && b >= s && (_ = -1);
          break;
        case "oneOf":
          if (s != null && (Array.isArray(s) || typeof s == "string")) {
            const m = s.includes(u), y = s.includes(b);
            m && !y ? _ = 1 : !m && y && (_ = -1);
          }
          break;
        case "containsOneOf":
          if (Array.isArray(s) && s.length > 0) {
            const m = s.some((x) => (Array.isArray(u) || typeof u == "string") && u.includes(x)), y = s.some((x) => (Array.isArray(b) || typeof b == "string") && b.includes(x));
            m && !y ? _ = 1 : !m && y && (_ = -1);
          }
          break;
        default:
          _ = u - b;
          break;
      }
      if (_ !== 0) return l.toUpperCase() === "DESC" ? -_ : _;
    }
    return 0;
  };
}
var D = {
  flights_entity: "sensor.flightradar24_current_in_area",
  projection_interval: 5,
  no_flights_message: "No flights are currently visible. Please check back later.",
  list: {
    hide: !1,
    showListStatus: !0
  },
  units: ut,
  radar: {
    range: ut.distance === "km" ? 35 : 25,
    background_map: "none",
    background_map_opacity: 0,
    background_map_api_key: ""
  },
  sort: Wt,
  templates: U,
  defines: {}
}, ht = class {
  constructor() {
    this.hass = null, this.config = {}, this.radar = { range: 35 }, this.list = {}, this.templates = {}, this.defines = {}, this.units = {
      altitude: "ft",
      speed: "kts",
      distance: "km"
    }, this.flightsContext = {}, this.dimensions = {}, this.flights = [], this.selectedFlights = [], this.renderDynamicOnRangeChange = !1, this._leafletMap = null, this.sortFn = () => 0;
  }
  setConfig(t) {
    if (!t) throw new Error("Configuration is missing.");
    this.config = { ...t }, this.config.flights_entity = t.flights_entity ?? D.flights_entity, this.config.projection_interval = t.projection_interval ?? D.projection_interval, this.config.no_flights_message = t.no_flights_message ?? D.no_flights_message, this.list = {
      ...D.list,
      ...t.list
    }, this.units = {
      ...D.units,
      ...t.units
    }, this.radar = {
      range: this.units.distance === "km" ? D.radar.range : 25,
      background_map: t.radar?.background_map ?? D.radar.background_map,
      background_map_opacity: t.radar?.background_map_opacity ?? D.radar.background_map_opacity,
      background_map_api_key: t.radar?.background_map_api_key ?? D.radar.background_map_api_key,
      ...t.radar
    }, this.radar.initialRange = this.radar.range, this.defines = {
      ...D.defines,
      ...t.defines
    }, this.sortFn = Yt(t.sort ?? D.sort, (e) => J(this, e, void 0, (a) => {
      this.renderDynamicOnRangeChange = a;
    })), this.templates = {
      ...D.templates,
      ...t.templates
    };
  }
  toggleSelectedFlight(t) {
    this.selectedFlights || (this.selectedFlights = []), this.selectedFlights.includes(t.id) ? this.selectedFlights = this.selectedFlights.filter((e) => e !== t.id) : this.selectedFlights.push(t.id), typeof this.renderDynamicFn == "function" && this.renderDynamicFn();
  }
  setRenderDynamic(t) {
    this.renderDynamicFn = t;
  }
  setToggleValue(t, e) {
    this.config && this.config.toggles && (this.defines[t] = [
      "true",
      !0,
      1
    ].includes(e), typeof this.renderDynamicFn == "function" && this.renderDynamicFn());
  }
};
async function Gt() {
  if (P) return P;
  try {
    const e = await fetch("/local/flightradar24-card/runways.csv");
    if (e.ok)
      return P = await e.text(), P;
  } catch {
  }
  try {
    const e = await fetch("data/runways.csv");
    if (e.ok)
      return P = await e.text(), P;
  } catch {
  }
  const t = await fetch("https://davidmegginson.github.io/ourairports-data/runways.csv");
  if (!t.ok) throw new Error(`Failed to fetch runway data: ${t.status}`);
  return P = await t.text(), P;
}
async function Xt() {
  if (q) return q;
  try {
    const e = await fetch("/local/flightradar24-card/airports.csv");
    if (e.ok)
      return q = await e.text(), q;
  } catch {
  }
  try {
    const e = await fetch("data/airports.csv");
    if (e.ok)
      return q = await e.text(), q;
  } catch {
  }
  const t = await fetch("https://davidmegginson.github.io/ourairports-data/airports.csv");
  if (!t.ok) throw new Error(`Failed to fetch airport data: ${t.status}`);
  return q = await t.text(), q;
}
function Y(t) {
  const e = [];
  let a = "", i = !1;
  for (let o = 0; o < t.length; o++) {
    const r = t[o];
    r === '"' ? i = !i : r === "," && !i ? (e.push(a), a = "") : a += r;
  }
  return e.push(a), e;
}
function Zt(t, e, a, i, o) {
  let r = 0;
  a && a === t && (r += 1e3), a && a.startsWith(t) && (r += 500), e === t && (r += 900), e.startsWith(t) && (r += 400), o && `${e}${o}`.includes(t) && (r += 300);
  const n = i.toUpperCase().split(/[\s,/-]+/);
  for (const l of n) if (l.startsWith(t)) {
    r += 250;
    break;
  }
  return i.toUpperCase().includes(t) && (r += 100), r;
}
async function Kt(t) {
  if (!t || t.length < 2) return [];
  const e = t.trim().toUpperCase(), a = [], [i, o] = await Promise.all([Gt(), Xt()]), r = /* @__PURE__ */ new Map(), n = o.split(`
`), l = Y(n[0]), s = l.indexOf("ident"), u = l.indexOf("name"), b = l.indexOf("iata_code");
  for (let w = 1; w < n.length; w++) {
    const p = n[w].trim();
    if (!p) continue;
    const c = Y(p), d = c[s], h = c[u], v = c[b];
    d && r.set(d, {
      name: h || "",
      iata: v || ""
    });
  }
  const _ = i.split(`
`), m = Y(_[0]), y = m.indexOf("airport_ident"), x = m.indexOf("le_ident"), E = m.indexOf("he_ident"), M = m.indexOf("le_latitude_deg"), F = m.indexOf("le_longitude_deg"), O = m.indexOf("he_latitude_deg"), L = m.indexOf("he_longitude_deg"), A = m.indexOf("le_heading_degT"), C = m.indexOf("he_heading_degT"), k = m.indexOf("length_ft");
  for (let w = 1; w < _.length; w++) {
    const p = _[w].trim();
    if (!p) continue;
    const c = Y(p), d = c[y], h = c[x], v = c[E], f = r.get(d);
    if (!f) continue;
    const { name: g, iata: $ } = f, T = d.startsWith(e), R = $ && $.toUpperCase().startsWith(e), j = g.toUpperCase().includes(e), I = h && `${d}${h}`.includes(e), B = v && `${d}${v}`.includes(e);
    if (!T && !R && !j && !I && !B) continue;
    const rt = Zt(e, d, $, g, h || v || "");
    if (h) {
      const z = [];
      $ && z.push($), z.push(d), z.push(`RWY${h}`), g && z.push(`- ${g}`), a.push({
        displayText: z.join(" "),
        airportCode: d,
        airportName: g,
        iataCode: $,
        runwayDesignator: h,
        data: {
          airportCode: d,
          runwayDesignator: h,
          latitude: parseFloat(c[M]),
          longitude: parseFloat(c[F]),
          heading: parseFloat(c[A]),
          length: parseFloat(c[k])
        },
        score: rt
      });
    }
    if (v) {
      const z = [];
      $ && z.push($), z.push(d), z.push(`RWY${v}`), g && z.push(`- ${g}`), a.push({
        displayText: z.join(" "),
        airportCode: d,
        airportName: g,
        iataCode: $,
        runwayDesignator: v,
        data: {
          airportCode: d,
          runwayDesignator: v,
          latitude: parseFloat(c[O]),
          longitude: parseFloat(c[L]),
          heading: parseFloat(c[C]),
          length: parseFloat(c[k])
        },
        score: rt
      });
    }
  }
  return a.sort((w, p) => p.score - w.score).slice(0, 10).map(({ score: w, ...p }) => p);
}
var P, q, Jt = nt((() => {
  P = null, q = null;
})), Qt = /* @__PURE__ */ $t({ Flightradar24CardEditor: () => G }), G, Ct = nt((() => {
  if (Jt(), xt(), G = class extends HTMLElement {
    constructor() {
      super(), this._config = {}, this._openSections = /* @__PURE__ */ new Set(["basic-settings"]), this._openConditions = /* @__PURE__ */ new Set(), this._openFeatures = /* @__PURE__ */ new Set(), this._openAnnotations = /* @__PURE__ */ new Set(), this._mapModal = null, this._internalUpdate = !1, this._shadowRoot = this.attachShadow({ mode: "open" });
    }
    setConfig(t) {
      this._config = { ...t }, this._internalUpdate || this._render(), this._internalUpdate = !1;
    }
    get availableFlightEntities() {
      return this.hass ? Object.keys(this.hass.states).filter((t) => t.includes("flightradar")).sort() : [];
    }
    get availableTrackerEntities() {
      return this.hass ? Object.keys(this.hass.states).filter((t) => t.startsWith("device_tracker.") || t.startsWith("person.") || t.startsWith("zone.")).sort() : [];
    }
    get availableFlightFields() {
      return [
        {
          value: "id",
          label: "ID",
          group: "Basic"
        },
        {
          value: "flight_number",
          label: "Flight Number",
          group: "Basic"
        },
        {
          value: "callsign",
          label: "Callsign",
          group: "Basic"
        },
        {
          value: "aircraft_registration",
          label: "Aircraft Registration",
          group: "Aircraft"
        },
        {
          value: "aircraft_model",
          label: "Aircraft Model",
          group: "Aircraft"
        },
        {
          value: "aircraft_code",
          label: "Aircraft Code",
          group: "Aircraft"
        },
        {
          value: "airline",
          label: "Airline Name",
          group: "Airline"
        },
        {
          value: "airline_short",
          label: "Airline Short",
          group: "Airline"
        },
        {
          value: "airline_iata",
          label: "Airline IATA",
          group: "Airline"
        },
        {
          value: "airline_icao",
          label: "Airline ICAO",
          group: "Airline"
        },
        {
          value: "airport_origin_name",
          label: "Origin Airport",
          group: "Origin"
        },
        {
          value: "airport_origin_code_iata",
          label: "Origin IATA",
          group: "Origin"
        },
        {
          value: "airport_origin_country_name",
          label: "Origin Country",
          group: "Origin"
        },
        {
          value: "airport_origin_country_code",
          label: "Origin Country Code",
          group: "Origin"
        },
        {
          value: "airport_destination_name",
          label: "Destination Airport",
          group: "Destination"
        },
        {
          value: "airport_destination_code_iata",
          label: "Destination IATA",
          group: "Destination"
        },
        {
          value: "airport_destination_country_name",
          label: "Destination Country",
          group: "Destination"
        },
        {
          value: "airport_destination_country_code",
          label: "Destination Country Code",
          group: "Destination"
        },
        {
          value: "latitude",
          label: "Latitude",
          group: "Position"
        },
        {
          value: "longitude",
          label: "Longitude",
          group: "Position"
        },
        {
          value: "altitude",
          label: "Altitude",
          group: "Position"
        },
        {
          value: "vertical_speed",
          label: "Vertical Speed",
          group: "Movement"
        },
        {
          value: "ground_speed",
          label: "Ground Speed",
          group: "Movement"
        },
        {
          value: "heading",
          label: "Heading",
          group: "Movement"
        },
        {
          value: "distance_to_tracker",
          label: "Distance to Tracker",
          group: "Tracking"
        },
        {
          value: "heading_from_tracker",
          label: "Heading from Tracker",
          group: "Tracking"
        },
        {
          value: "cardinal_direction_from_tracker",
          label: "Cardinal Direction",
          group: "Tracking"
        },
        {
          value: "is_approaching",
          label: "Is Approaching",
          group: "Tracking"
        },
        {
          value: "is_receding",
          label: "Is Receding",
          group: "Tracking"
        },
        {
          value: "closest_passing_distance",
          label: "Closest Passing Distance",
          group: "Approach"
        },
        {
          value: "eta_to_closest_distance",
          label: "ETA to Closest",
          group: "Approach"
        },
        {
          value: "heading_from_tracker_to_closest_passing",
          label: "Heading to Closest",
          group: "Approach"
        }
      ];
    }
    _mapTypeRequiresApiKey(t) {
      return t === "bw" || t === "outlines";
    }
    get validFlightFields() {
      return new Set(this.availableFlightFields.map((t) => t.value));
    }
    get allDefineAndToggleKeys() {
      const t = /* @__PURE__ */ new Set();
      return Object.keys(this._config.toggles || {}).forEach((e) => t.add(e)), Object.keys(this._config.defines || {}).forEach((e) => t.add(e)), t;
    }
    getUsedDefinesAndToggles() {
      const t = /* @__PURE__ */ new Set(), e = this._config.templates || {}, a = this._config.filter, i = this._config.sort || [];
      Object.values(e).forEach((r) => {
        const n = r.matchAll(/\$\{(\w+)\}/g);
        for (const l of n) {
          const s = l[1];
          this.allDefineAndToggleKeys.has(s) && t.add(s);
        }
      });
      const o = (r) => {
        r.forEach((n) => {
          if ("type" in n && (n.type === "AND" || n.type === "OR")) o(n.conditions || []);
          else if ("type" in n && n.type === "NOT") o([n.condition]);
          else {
            const l = n;
            l.field && this.allDefineAndToggleKeys.has(l.field) && t.add(l.field), l.defined && this.allDefineAndToggleKeys.has(l.defined) && t.add(l.defined);
            const s = l.value;
            if (typeof s == "string" && s.startsWith("${") && s.endsWith("}")) {
              const u = s.slice(2, -1);
              this.allDefineAndToggleKeys.has(u) && t.add(u);
            }
          }
        });
      };
      return a && Array.isArray(a) && o(a), i.forEach((r) => {
        r.field && this.allDefineAndToggleKeys.has(r.field) && t.add(r.field);
      }), t;
    }
    getUnusedDefinesAndToggles() {
      const t = this.getUsedDefinesAndToggles(), e = [], a = [];
      return Object.keys(this._config.toggles || {}).forEach((i) => {
        t.has(i) || e.push(i);
      }), Object.keys(this._config.defines || {}).forEach((i) => {
        t.has(i) || a.push(i);
      }), {
        toggles: e,
        defines: a
      };
    }
    getUsedTemplateKeys() {
      const t = /* @__PURE__ */ new Set(), e = this._config.templates || {}, a = {
        ...U,
        ...e
      };
      return [
        "flight_element",
        "radar_range",
        "list_status"
      ].forEach((i) => {
        e[i] !== void 0 && t.add(i);
      }), Object.values(a).forEach((i) => {
        const o = i.matchAll(/\$\{(\w+)\([\s\S]*?\)\}/g);
        for (const n of o) {
          const l = n[1];
          e[l] !== void 0 && t.add(l);
        }
        const r = i.matchAll(/tpl\.(\w+)/g);
        for (const n of r) {
          const l = n[1];
          e[l] !== void 0 && t.add(l);
        }
      }), t;
    }
    getUnusedTemplates() {
      const t = this.getUsedTemplateKeys(), e = this._config.templates || {}, a = [];
      return Object.keys(e).forEach((i) => {
        t.has(i) || a.push(i);
      }), a;
    }
    validateConditionField(t) {
      const e = t.split(" ?? ");
      for (const a of e)
        if (!this.validFlightFields.has(a) && !this.allDefineAndToggleKeys.has(a))
          return {
            valid: !1,
            error: `Unknown field: "${a}". Not a flight property or define/toggle.`
          };
      return { valid: !0 };
    }
    _renameConfigKey(t, e, a) {
      if (e === a || !a.trim()) return;
      const i = { ...this._config.templates }, o = new RegExp(`\\$\\{${e}\\}`, "g");
      for (const [l, s] of Object.entries(i))
        s.includes(`\${${e}}`) && (i[l] = s.replace(o, `\${${a}}`)), t === "template" && (s.includes(`\${tpl.${e}}`) || s.includes(`tpl.${e}`)) && (i[l] = s.replace(new RegExp(`tpl\\.${e}`, "g"), `tpl.${a}`));
      t === "template" && e in i && (i[a] = i[e], delete i[e]);
      const r = this._config.filter ? JSON.parse(JSON.stringify(this._config.filter)) : void 0;
      if (r) {
        const l = (s) => {
          s.forEach((u) => {
            u.type === "AND" || u.type === "OR" ? l(u.conditions || []) : u.type === "NOT" ? l([u.condition]) : (u.field === e && (u.field = a), u.defined === e && (u.defined = a), typeof u.value == "string" && (u.value = u.value.replace(o, `\${${a}}`)));
          });
        };
        l(r);
      }
      const n = (this._config.sort || []).map((l) => {
        if (l.field === e) return {
          ...l,
          field: a
        };
        if (l.field?.includes(" ?? ")) {
          const s = l.field.split(" ?? ").map((u) => u === e ? a : u);
          return {
            ...l,
            field: s.join(" ?? ")
          };
        }
        return l;
      });
      this._config = {
        ...this._config,
        templates: Object.keys(i).length > 0 ? i : void 0,
        filter: r && r.length > 0 ? r : void 0,
        sort: n.length > 0 ? n : void 0
      };
    }
    hasValidationErrors() {
      const t = this.getUnusedDefinesAndToggles();
      if (t.toggles.length > 0 || t.defines.length > 0 || this.getUnusedTemplates().length > 0) return !0;
      const e = this._config.filter;
      if (e && Array.isArray(e) && this._checkConditionsForInvalidFields(e))
        return !0;
      const a = this._config.sort || [];
      for (const i of a) if (i.field && !this.validateConditionField(i.field).valid)
        return !0;
      return !1;
    }
    _checkConditionsForInvalidFields(t) {
      for (const e of t) if ("type" in e && (e.type === "AND" || e.type === "OR")) {
        if (this._checkConditionsForInvalidFields(e.conditions || [])) return !0;
      } else if ("type" in e && e.type === "NOT") {
        if (this._checkConditionsForInvalidFields([e.condition])) return !0;
      } else {
        const a = e;
        if (a.field && !this.validateConditionField(a.field).valid || a.defined && !this.allDefineAndToggleKeys.has(a.defined)) return !0;
      }
      return !1;
    }
    _render() {
      this.hass && (this._saveOpenSections(), this._shadowRoot.innerHTML = `
            <style>
                ${this._getStyles()}
            </style>
            <div class="editor-container">
                ${this._renderBasicSettings()}
                ${this._renderAdvancedSettings()}
                ${this._renderRadarConfig()}
                ${this._renderListConfig()}
                ${this._renderTogglesAndDefinesConfig()}
                ${this._renderTemplatesConfig()}
            </div>
        `, this._attachEventListeners(), this._restoreOpenSections());
    }
    _saveOpenSections() {
      this._shadowRoot.querySelectorAll("details").forEach((t) => {
        const e = t.getAttribute("data-section-id");
        e && (t.open ? this._openSections.add(e) : this._openSections.delete(e));
        const a = t.getAttribute("data-condition-path");
        a && (t.open ? this._openConditions.add(a) : this._openConditions.delete(a));
        const i = t.getAttribute("data-feature-id");
        i && (t.open ? this._openFeatures.add(i) : this._openFeatures.delete(i));
        const o = t.getAttribute("data-annotation-id");
        o && (t.open ? this._openAnnotations.add(o) : this._openAnnotations.delete(o));
      });
    }
    _restoreOpenSections() {
      this._shadowRoot.querySelectorAll("details").forEach((t) => {
        const e = t.getAttribute("data-section-id");
        e && this._openSections.has(e) && (t.open = !0);
        const a = t.getAttribute("data-condition-path");
        a && this._openConditions.has(a) && (t.open = !0);
        const i = t.getAttribute("data-feature-id");
        i && this._openFeatures.has(i) && (t.open = !0);
        const o = t.getAttribute("data-annotation-id");
        o && this._openAnnotations.has(o) && (t.open = !0);
      });
    }
    _getStyles() {
      return `
            .editor-container {
                position: relative;
                z-index: 1000;
                background: var(--card-background-color, #fff);
            }
            details {
                margin-bottom: 12px;
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 4px;
                padding: 6px;
            }
            summary {
                cursor: pointer;
                user-select: none;
                font-weight: bold;
                padding: 6px;
                margin: -6px;
            }
            summary:hover {
                background: var(--secondary-background-color, #f0f0f0);
            }
            h3 {
                display: inline;
                margin: 0;
            }
            h4 {
                margin: 12px 0 6px 0;
                font-size: 0.95em;
                font-weight: 600;
                color: var(--secondary-text-color, #666);
            }
            summary h4 {
                display: inline;
                margin: 0;
            }
            h5 {
                margin: 8px 0 4px 0;
                font-size: 0.9em;
                font-weight: 600;
                color: var(--secondary-text-color, #666);
            }
            summary h5 {
                display: inline;
                margin: 0;
            }
            details details {
                margin-bottom: 8px;
                border: 1px solid var(--divider-color, #e0e0e0);
                background: var(--secondary-background-color, #f5f5f5);
            }
            details details summary {
                padding: 4px;
                margin: -4px;
            }
            details details .section-content {
                padding: 8px 6px 6px 6px;
            }
            .subsection {
                margin-bottom: 12px;
                padding: 8px;
                border: 1px solid var(--divider-color, #e0e0e0);
                border-radius: 4px;
            }
            .subsection legend {
                padding: 0 6px;
                font-size: 0.95em;
                font-weight: 600;
                color: var(--secondary-text-color, #666);
            }
            .section-content {
                padding: 12px 6px 6px 6px;
            }
            .form-row {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: 10px;
            }
            .form-row label {
                font-weight: 500;
                font-size: 0.9em;
                color: var(--secondary-text-color, #666);
            }
            input[type="text"],
            input[type="number"],
            input[type="color"],
            select,
            textarea {
                padding: 6px 8px;
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 4px;
                font-family: inherit;
                font-size: 14px;
                width: 100%;
                box-sizing: border-box;
            }
            input[type="number"] {
                max-width: 120px;
            }
            input[type="checkbox"] {
                width: 18px;
                height: 18px;
            }
            .full-width {
                width: 100%;
            }
            textarea.full-width {
                min-height: 60px;
            }
            .help-text {
                color: var(--secondary-text-color, #666);
                font-size: 0.85em;
                margin: 2px 0;
                line-height: 1.3;
            }
            .item-box {
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 4px;
                padding: 0;
                margin-bottom: 8px;
                background: var(--secondary-background-color, #f5f5f5);
            }
            .item-box summary.item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                margin: 0;
                font-weight: bold;
                cursor: pointer;
                user-select: none;
                list-style: none;
                font-size: 0.9em;
            }
            .item-box summary.item-header::-webkit-details-marker {
                display: none;
            }
            .item-box summary.item-header::before {
                content: '▶';
                font-size: 9px;
                margin-right: 6px;
                transition: transform 0.2s;
            }
            .item-box[open] summary.item-header::before {
                transform: rotate(90deg);
            }
            .item-box summary.item-header:hover {
                background: rgba(0, 0, 0, 0.03);
            }
            .item-box .section-content {
                padding: 0 8px 8px 8px;
            }
            .button-group {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            button {
                padding: 5px 10px;
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 4px;
                background: var(--card-background-color, #fff);
                cursor: pointer;
                font-size: 13px;
            }
            button:hover {
                background: var(--secondary-background-color, #f0f0f0);
            }
            .add-button {
                background: var(--primary-color, #03a9f4);
                color: white;
                border: none;
            }
            .add-button:hover {
                background: var(--dark-primary-color, #0288d1);
            }
            .remove-button {
                background: var(--error-color, #f44336);
                color: white;
                border: none;
            }
            .remove-button:hover {
                background: #d32f2f;
            }
            .small-button {
                font-size: 11px;
                padding: 3px 6px;
            }
            .icon-button {
                padding: 3px 6px;
                font-weight: bold;
            }
            .condition-box {
                border-left: 3px solid var(--primary-color, #03a9f4);
                padding: 0;
                margin: 6px 0;
                background: var(--card-background-color, #fff);
                border-radius: 4px;
                border: 1px solid var(--divider-color, #e0e0e0);
            }
            .condition-box[open] {
                padding-bottom: 8px;
            }
            .condition-group {
                background: var(--secondary-background-color, #f5f5f5);
                border-left: 3px solid var(--accent-color, #ff9800);
            }
            .condition-not {
                background: #fff3e0;
                border-left: 3px solid #fb8c00;
            }
            .condition-summary {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px;
                cursor: pointer;
                user-select: none;
                list-style: none;
                font-size: 0.9em;
            }
            .condition-summary::-webkit-details-marker {
                display: none;
            }
            .condition-summary::before {
                content: '▶';
                font-size: 9px;
                transition: transform 0.2s;
                flex-shrink: 0;
            }
            .condition-box[open] > .condition-summary::before {
                transform: rotate(90deg);
            }
            .condition-summary:hover {
                background: rgba(0, 0, 0, 0.02);
            }
            .condition-type-badge {
                background: var(--primary-color, #03a9f4);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                flex-shrink: 0;
            }
            .condition-group .condition-type-badge {
                background: var(--accent-color, #ff9800);
            }
            .condition-not .condition-type-badge {
                background: #fb8c00;
            }
            .condition-description {
                flex: 1;
                font-size: 13px;
                color: var(--secondary-text-color, #666);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-family: 'Courier New', monospace;
            }
            .condition-content {
                padding: 0 8px 0 8px;
            }
            .condition-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .conditions-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .empty-state {
                color: var(--secondary-text-color, #999);
                font-style: italic;
                text-align: center;
                padding: 12px;
                font-size: 0.9em;
            }
            .map-modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            .map-modal-overlay.open {
                display: flex;
            }
            .map-modal {
                background: var(--card-background-color, #fff);
                border-radius: 8px;
                width: 90%;
                max-width: 800px;
                height: 80%;
                max-height: 600px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            .map-modal-header {
                padding: 16px;
                border-bottom: 1px solid var(--divider-color, #e0e0e0);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .map-modal-header h3 {
                margin: 0;
            }
            .map-modal-body {
                flex: 1;
                position: relative;
                overflow: hidden;
            }
            .map-modal-map {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }
            .map-modal-footer {
                padding: 16px;
                border-top: 1px solid var(--divider-color, #e0e0e0);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .map-modal-instructions {
                color: var(--secondary-text-color, #666);
                font-size: 0.9em;
            }
            .runway-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--card-background-color, #fff);
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 4px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
                margin-top: 4px;
            }
            .runway-dropdown-item {
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid var(--divider-color, #f0f0f0);
            }
            .runway-dropdown-item:last-child {
                border-bottom: none;
            }
            .runway-dropdown-item:hover {
                background: var(--secondary-background-color, #f5f5f5);
            }
            .runway-dropdown-loading {
                padding: 12px;
                text-align: center;
                color: var(--secondary-text-color, #666);
                font-style: italic;
            }
            .runway-dropdown-empty {
                padding: 12px;
                text-align: center;
                color: var(--secondary-text-color, #666);
                font-style: italic;
            }
            .template-button-container {
                position: relative;
            }
            .template-dropdown-button {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
            }
            .template-dropdown-button::after {
                content: '▼';
                font-size: 10px;
                margin-left: 8px;
            }
            .template-dropdown {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--card-background-color, #fff);
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 4px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
                margin-top: 4px;
            }
            .template-dropdown.open {
                display: block;
            }
            .template-dropdown-header {
                padding: 8px 12px;
                font-weight: 600;
                font-size: 0.85em;
                color: var(--secondary-text-color, #666);
                background: var(--secondary-background-color, #f5f5f5);
                border-bottom: 1px solid var(--divider-color, #e0e0e0);
            }
            .template-dropdown-item {
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid var(--divider-color, #f0f0f0);
            }
            .template-dropdown-item:last-child {
                border-bottom: none;
            }
            .template-dropdown-item:hover {
                background: var(--secondary-background-color, #f5f5f5);
            }

            /* Responsive adjustments for narrow editor panes (typical HA editor width ~460px) */
            .button-group {
                flex-wrap: wrap;
            }
            .condition-field-type {
                flex: 1;
                min-width: 100px;
            }

            /* Aircraft marker size selector */
            .marker-size-selector {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .marker-size-option {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
                border: 2px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 50px;
                min-height: 50px;
                overflow: hidden;
            }
            .marker-size-option:hover {
                border-color: var(--primary-color, #03a9f4);
            }
            .marker-size-option.selected {
                border-color: var(--primary-color, #03a9f4);
                box-shadow: 0 0 0 1px var(--primary-color, #03a9f4);
            }
            .marker-button-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
            }
            .marker-preview {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                z-index: 1;
            }
        `;
    }
    _renderBasicSettings() {
      return `
            <details data-section-id="basic-settings">
                <summary><h3>Basic</h3></summary>
                <div class="section-content">
                    <div class="form-row">
                        <label>Flights Entity:</label>
                        <select class="full-width" id="flights-entity" data-config="flights_entity">
                            <option value="">Select entity...</option>
                            ${this.availableFlightEntities.map((t) => `<option value="${t}" ${this._config.flights_entity === t ? "selected" : ""}>${t}</option>`).join("")}
                        </select>
                    </div>

                    <div class="form-row">
                        <label>Location Tracker:</label>
                        <select class="full-width" id="location-tracker" data-config="location_tracker">
                            <option value="">Manual coordinates...</option>
                            ${this.availableTrackerEntities.map((t) => `<option value="${t}" ${this._config.location_tracker === t ? "selected" : ""}>${t}</option>`).join("")}
                        </select>
                    </div>

                    ${this._config.location_tracker ? "" : `
                        <div class="form-row">
                            <label>Latitude:</label>
                            <input type="number" step="0.0001" id="location-lat"
                                value="${this._config.location?.lat ?? ""}" placeholder="63.4041" />
                        </div>
                        <div class="form-row">
                            <label>Longitude:</label>
                            <input type="number" step="0.0001" id="location-lon"
                                value="${this._config.location?.lon ?? ""}" placeholder="10.4301" />
                        </div>
                    `}

                    <fieldset class="subsection">
                        <legend>Units</legend>
                        <div class="form-row">
                            <label>Altitude:</label>
                            <select id="unit-altitude" data-unit="altitude">
                                <option value="ft" ${(this._config.units?.altitude || "ft") === "ft" ? "selected" : ""}>Feet (ft)</option>
                                <option value="m" ${(this._config.units?.altitude || "ft") === "m" ? "selected" : ""}>Meters (m)</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Speed:</label>
                            <select id="unit-speed" data-unit="speed">
                                <option value="kts" ${(this._config.units?.speed || "kts") === "kts" ? "selected" : ""}>Knots (kts)</option>
                                <option value="kmh" ${(this._config.units?.speed || "kts") === "kmh" ? "selected" : ""}>Km/h</option>
                                <option value="mph" ${(this._config.units?.speed || "kts") === "mph" ? "selected" : ""}>Mph</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Distance:</label>
                            <select id="unit-distance" data-unit="distance">
                                <option value="km" ${(this._config.units?.distance || "km") === "km" ? "selected" : ""}>Kilometers (km)</option>
                                <option value="miles" ${(this._config.units?.distance || "km") === "miles" ? "selected" : ""}>Miles</option>
                            </select>
                        </div>
                    </fieldset>

                    <div class="form-row">
                        <label>Max Flights:</label>
                        <input type="number" min="1" step="1" id="max-flights"
                            value="${this._config.max_flights ?? ""}" placeholder="unlimited" />
                    </div>
                </div>
            </details>
        `;
    }
    _renderAdvancedSettings() {
      const t = this._config.annotate || [];
      JSON.stringify(t, null, 2);
      const e = this._config.filter || [];
      return `
            <details data-section-id="advanced-settings">
                <summary><h3>Advanced</h3></summary>
                <div class="section-content">
                    <div class="form-row">
                        <label>Projection Interval (ms):</label>
                        <input type="number" min="100" step="100" id="projection-interval"
                            value="${this._config.projection_interval ?? 1e3}" />
                        <span class="help-text">Flight position update frequency</span>
                    </div>
                    <div class="form-row">
                        <label>Scale:</label>
                        <input type="number" min="0.5" max="2" step="0.1" id="scale"
                            value="${this._config.scale ?? 1}" />
                        <span class="help-text">Card zoom level - Use with caution: values > 1 may cause the card to overflow and break page layout</span>
                    </div>

                    <details data-section-id="advanced-filter">
                        <summary>
                            <h4>Filter</h4>
                            ${e.length > 0 && this._checkConditionsForInvalidFields(e) ? '<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="Contains invalid filter fields">⚠️</span>' : ""}
                        </summary>
                        <div class="section-content">
                            <p class="help-text">Filter which flights are displayed. All top-level conditions must match (implicit AND).</p>
                            <div id="filter-conditions">
                                ${e.length > 0 ? this._renderConditionsList(e, "filter") : '<p class="empty-state">No filters defined</p>'}
                            </div>
                            <div class="button-group" style="margin-top: 12px;">
                                <button class="add-button" data-action="add-filter-condition">Add Value Condition</button>
                                <button class="add-button" data-action="add-filter-group">Add AND/OR Group</button>
                                <button class="add-button" data-action="add-filter-not">Add NOT Condition</button>
                            </div>
                        </div>
                    </details>

                    <details data-section-id="advanced-sort">
                        <summary>
                            <h4>Sort</h4>
                            ${(this._config.sort || []).some((a) => a.field ? !this.validateConditionField(a.field).valid : !1) ? '<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="Contains invalid sort fields">⚠️</span>' : ""}
                        </summary>
                        <div class="section-content">
                            <p class="help-text">Define how flights are sorted in the list</p>
                            <div id="sort-list">
                                ${(this._config.sort || []).map((a, i) => {
        const o = a.field ? this.validateConditionField(a.field) : { valid: !0 }, r = !o.valid;
        return `
                                    <div class="item-box" ${r ? 'style="border-color: #ff9800;"' : ""}>
                                        <div class="item-header">
                                            <span>Sort ${i + 1}</span>
                                            ${r ? `<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="${o.error || "Invalid field"}">⚠️</span>` : ""}
                                            <button class="remove-button" data-action="remove-sort" data-index="${i}">Remove</button>
                                        </div>
                                        <div class="form-row">
                                            <label>Field:</label>
                                            <input type="text" value="${a.field}" data-sort-prop="${i}:field" placeholder="distance, altitude, speed, etc." ${r ? 'style="border-color: #ff9800;"' : ""} />
                                        </div>
                                        ${r ? `<div class="form-row"><p style="color: #ff9800; margin: 0; font-size: 0.9em;">${o.error || "Invalid field"}</p></div>` : ""}
                                        <div class="form-row">
                                            <label>Order:</label>
                                            <select data-sort-prop="${i}:order">
                                                <option value="asc" ${(a.order || "asc") === "asc" ? "selected" : ""}>Ascending</option>
                                                <option value="desc" ${a.order === "desc" ? "selected" : ""}>Descending</option>
                                            </select>
                                        </div>
                                    </div>
                                `;
      }).join("")}
                            </div>
                            <button class="add-button" data-action="add-sort">Add Sort Criterion</button>
                        </div>
                    </details>

                    <details data-section-id="advanced-annotations">
                        <summary><h4>Annotations</h4></summary>
                        <div class="section-content">
                            <p class="help-text">Conditional rendering with custom templates for specific flight fields</p>
                            <div id="annotations-list">
                                ${t.length > 0 ? t.map((a, i) => this._renderAnnotation(a, i)).join("") : '<p class="empty-state">No annotations defined</p>'}
                            </div>
                            <button class="add-button" data-action="add-annotation">Add Annotation</button>
                        </div>
                    </details>
                </div>
            </details>
        `;
    }
    _renderRadarConfig() {
      const t = this._config.radar || {}, e = (this._config.units?.distance || "km") === "miles" ? "miles" : "km";
      return `
            <details data-section-id="radar-config">
                <summary><h3>Radar</h3></summary>
                <div class="section-content">
                    <div class="form-row">
                        <label>
                            <input type="checkbox" id="radar-show" ${t.hide !== !0 ? "checked" : ""} />
                            Show Radar
                        </label>
                    </div>

                    <details data-section-id="radar-range">
                        <summary><h4>Range</h4></summary>
                        <div class="section-content">
                            <div class="form-row">
                                <label>Default Range (${e}):</label>
                                <input type="number" min="1" step="1" id="radar-range" value="${t.range ?? 50}" />
                            </div>
                            <div class="form-row">
                                <label>Min Range (${e}):</label>
                                <input type="number" min="1" step="1" id="radar-min-range" value="${t.min_range ?? 5}" />
                            </div>
                            <div class="form-row">
                                <label>Max Range (${e}):</label>
                                <input type="number" min="1" step="1" id="radar-max-range" value="${t.max_range ?? 100}" />
                            </div>
                            <div class="form-row">
                                <label>Ring Distance (${e}):</label>
                                <input type="number" min="1" step="1" id="radar-ring-distance" value="${t.ring_distance ?? 10}" />
                            </div>
                        </div>
                    </details>

                    <details data-section-id="radar-colors">
                        <summary><h4>Colors</h4></summary>
                        <div class="section-content">
                            <div class="form-row">
                                <label>Background Color:</label>
                                <input type="color" id="radar-background-color" value="${t["background-color"] ?? t["primary-color"] ?? "#ffffff"}" />
                            </div>
                            <div class="form-row">
                                <label>Background Opacity:</label>
                                <input type="number" min="0" max="1" step="0.05" id="radar-background-opacity" value="${t["background-opacity"] ?? 0.05}" />
                            </div>
                            <div class="form-row">
                                <label>Aircraft Marker:</label>
                                <input type="color" id="radar-aircraft-color" value="${t["aircraft-color"] ?? t["accent-color"] ?? "#ff0000"}" />
                            </div>
                            <div class="form-row">
                                <label>Aircraft Marker (Selected):</label>
                                <input type="color" id="radar-aircraft-selected-color" value="${t["aircraft-selected-color"] ?? t["aircraft-color"] ?? t["accent-color"] ?? "#ff6600"}" />
                            </div>
                            <div class="form-row">
                                <label>Radar Grid:</label>
                                <input type="color" id="radar-grid-color" value="${t["radar-grid-color"] ?? t["feature-color"] ?? "#888888"}" />
                            </div>
                            <div class="form-row">
                                <label>Local Features:</label>
                                <input type="color" id="radar-local-features-color" value="${t["local-features-color"] ?? t["feature-color"] ?? t["radar-grid-color"] ?? "#888888"}" />
                            </div>
                        </div>
                    </details>

                    <details data-section-id="radar-aircraft-marker">
                        <summary><h4>Aircraft Marker</h4></summary>
                        <div class="section-content">
                            <div class="form-row">
                                <label>Marker Size:</label>
                                <div class="marker-size-selector">
                                    ${[
        "small",
        "normal",
        "large",
        "x-large",
        "xx-large"
      ].map((a) => {
        const i = (t["aircraft-marker-size"] || "normal") === a, o = {
          small: 0.7,
          normal: 1,
          large: 1.4,
          "x-large": 2,
          "xx-large": 2.8
        }[a], r = t["background-color"] || t["primary-color"] || "#1a1a1a", n = t["aircraft-color"] || t["accent-color"] || "#ff0000", l = t["background-opacity"] ?? 0.05;
        return `
                                            <button class="marker-size-option ${i ? "selected" : ""}" data-size="${a}">
                                                <div class="marker-button-background" style="background-color: ${r}; opacity: ${l};"></div>
                                                <div class="marker-preview">
                                                    <div class="preview-arrow" style="
                                                        width: 0;
                                                        height: 0;
                                                        border-left: ${3 * o}px solid transparent;
                                                        border-right: ${3 * o}px solid transparent;
                                                        border-bottom: ${8 * o}px solid ${n};
                                                        transform: rotate(45deg);
                                                    "></div>
                                                </div>
                                            </button>
                                        `;
      }).join("")}
                                </div>
                            </div>
                            <fieldset class="subsection">
                                <legend>Custom Image Marker</legend>
                                <p class="help-text">Use a PNG image as aircraft marker instead of the default triangle. Image should have a transparent background.</p>
                                ${(() => {
        const a = t["aircraft-marker"]?.default || {};
        return `
                                    <div class="form-row">
                                        <label>Image URL:</label>
                                        <input type="text" class="full-width" id="radar-custom-marker-url" value="${a["aircraft-marker-url"] || ""}" placeholder="https://..." />
                                    </div>
                                    <div class="form-row">
                                        <label>Rotation Offset (degrees):</label>
                                        <input type="number" min="0" max="360" step="1" id="radar-custom-marker-rotation" value="${a["aircraft-marker-rotation"] ?? 0}" />
                                        <span class="help-text">Extra rotation if the image does not point due north</span>
                                    </div>
                                    <div class="form-row">
                                        <label>Rotation Center (x,y):</label>
                                        <input type="text" id="radar-custom-marker-center" value="${a["aircraft-marker-center"] || ""}" placeholder="0,0" />
                                        <span class="help-text">Offset from image center for rotation pivot (px)</span>
                                    </div>
                                    <div class="form-row">
                                        <label>Scale:</label>
                                        <input type="number" min="0.1" step="0.1" id="radar-custom-marker-scale" value="${a["aircraft-marker-scale"] ?? 1}" />
                                    </div>
                                    <div class="form-row">
                                        <label>Color Overlay:</label>
                                        <input type="color" id="radar-custom-marker-overlay" value="${a["aircraft-marker-color-overlay"] || "#000000"}" />
                                        <span class="help-text">Fills the image shape with this color</span>
                                    </div>`;
      })()}
                            </fieldset>
                        </div>
                    </details>

                    <details data-section-id="radar-background-map">
                        <summary><h4>Background Map</h4></summary>
                        <div class="section-content">
                            <div class="form-row">
                                <label>Background Map:</label>
                                <select id="radar-background-map">
                                    <option value="none" ${(t.background_map || "none") === "none" ? "selected" : ""}>None</option>
                                    <option value="system" ${t.background_map === "system" ? "selected" : ""}>System (auto dark/light)</option>
                                    <option value="bw" ${t.background_map === "bw" ? "selected" : ""}>Black & White (requires API key)</option>
                                    <option value="light" ${t.background_map === "light" ? "selected" : ""}>Light</option>
                                    <option value="color" ${t.background_map === "color" ? "selected" : ""}>Color</option>
                                    <option value="dark" ${t.background_map === "dark" ? "selected" : ""}>Dark</option>
                                    <option value="voyager" ${t.background_map === "voyager" ? "selected" : ""}>Voyager</option>
                                    <option value="satellite" ${t.background_map === "satellite" ? "selected" : ""}>Satellite</option>
                                    <option value="topo" ${t.background_map === "topo" ? "selected" : ""}>Topographic</option>
                                    <option value="outlines" ${t.background_map === "outlines" ? "selected" : ""}>Outlines (requires API key)</option>
                                </select>
                            </div>
                            ${this._mapTypeRequiresApiKey(t.background_map) ? `
                                <div class="form-row">
                                    <label>Stadia Maps API Key:</label>
                                    <input type="text" class="full-width" id="radar-background-map-api-key"
                                        value="${t.background_map_api_key || ""}" placeholder="Get free key at stadiamaps.com" />
                                    <span class="help-text">Required for Black & White and Outlines map types. <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">Get a free API key</a></span>
                                </div>
                            ` : ""}
                            <div class="form-row">
                                <label>Map Opacity:</label>
                                <input type="number" min="0" max="1" step="0.1" id="radar-background-map-opacity"
                                    value="${t.background_map_opacity ?? 0.3}" />
                            </div>
                        </div>
                    </details>

                    <details data-section-id="radar-local-features">
                        <summary><h4>Local Features</h4></summary>
                        <div class="section-content">
                            <p class="help-text">Add custom locations, runways, and outlines to the radar</p>
                            <div id="local-features-list">
                                ${(t.local_features || []).map((a, i) => this._renderLocalFeature(a, i)).join("")}
                            </div>
                            <div class="button-group" style="margin-top: 12px;">
                                <button class="add-button small-button" data-action="add-local-feature-location">+ Location</button>
                                <button class="add-button small-button" data-action="add-local-feature-runway">+ Runway</button>
                                <button class="add-button small-button" data-action="add-local-feature-outline">+ Outline</button>
                            </div>
                        </div>
                    </details>

                    ${this._renderTapActionsConfig()}
                </div>
            </details>
        `;
    }
    _renderListConfig() {
      const t = this._config.list || {};
      return `
            <details data-section-id="list-config">
                <summary><h3>Flight List</h3></summary>
                <div class="section-content">
                    <div class="form-row">
                        <label>
                            <input type="checkbox" id="list-show" ${t.hide !== !0 ? "checked" : ""} />
                            Show Flight List
                        </label>
                    </div>
                    <div class="form-row">
                        <label>
                            <input type="checkbox" id="list-show-status" ${t.showListStatus !== !1 ? "checked" : ""} />
                            Show List Status
                        </label>
                    </div>
                    <div class="form-row">
                        <label>No Flights Message:</label>
                        <input type="text" class="full-width" id="no-flights-message"
                            value="${this._config.no_flights_message ?? ""}" placeholder="No flights in range" />
                    </div>
                </div>
            </details>
        `;
    }
    _renderTogglesAndDefinesConfig() {
      const t = this._config.defines || {}, e = this._config.toggles || {}, a = this.getUnusedDefinesAndToggles();
      return `
            <details data-section-id="toggles-defines-config">
                <summary>
                    <h3>Toggles & Defines</h3>
                    ${a.toggles.length > 0 || a.defines.length > 0 ? '<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="Contains unused items">⚠️</span>' : ""}
                </summary>
                <div class="section-content">
                    <details data-section-id="toggles-section">
                        <summary>
                            <h4>Toggles</h4>
                            ${a.toggles.length > 0 ? `<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="Unused toggles: ${a.toggles.join(", ")}">⚠️</span>` : ""}
                        </summary>
                        <div class="section-content">
                            <p class="help-text">UI buttons that set define values dynamically</p>
                            <div id="toggles-list">
                                ${Object.entries(e).map(([i, o]) => {
        const r = a.toggles.includes(i);
        return `
                                    <div class="item-box" ${r ? 'style="border-color: #ff9800;"' : ""}>
                                        <div class="form-row">
                                            <label>Name:</label>
                                            <input type="text" value="${i}" data-toggle-key="${i}" />
                                            ${r ? '<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="This toggle is not used in templates, filters, or sort">⚠️</span>' : ""}
                                        </div>
                                        <div class="form-row">
                                            <label>Label:</label>
                                            <input type="text" class="full-width" value="${o.label}" data-toggle-label="${i}" />
                                        </div>
                                        <div class="form-row">
                                            <label>
                                                <input type="checkbox" ${o.default ? "checked" : ""} data-toggle-default="${i}" />
                                                Default State
                                            </label>
                                        </div>
                                        <button class="remove-button" data-action="remove-toggle" data-key="${i}">Remove</button>
                                    </div>
                                `;
      }).join("")}
                            </div>
                            <button class="add-button" data-action="add-toggle">Add Toggle</button>
                        </div>
                    </details>

                    <details data-section-id="defines-section">
                        <summary>
                            <h4>Defines</h4>
                            ${a.defines.length > 0 ? `<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="Unused defines: ${a.defines.join(", ")}">⚠️</span>` : ""}
                        </summary>
                        <div class="section-content">
                            <p class="help-text">Reusable values referenced as \${defineName} in filters and sort</p>
                            <div id="defines-list">
                                ${Object.entries(t).map(([i, o]) => {
        const r = a.defines.includes(i);
        return `
                                    <div class="item-box" ${r ? 'style="border-color: #ff9800;"' : ""}>
                                        <div class="form-row">
                                            <label>Name:</label>
                                            <input type="text" value="${i}" data-define-key="${i}" />
                                            ${r ? '<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="This define is not used in templates, filters, or sort">⚠️</span>' : ""}
                                        </div>
                                        <div class="form-row">
                                            <label>Value:</label>
                                            <input type="text" class="full-width" value="${String(o)}" data-define-value="${i}" />
                                        </div>
                                        <button class="remove-button" data-action="remove-define" data-key="${i}">Remove</button>
                                    </div>
                                `;
      }).join("")}
                            </div>
                            <button class="add-button" data-action="add-define">Add Define</button>
                        </div>
                    </details>
                </div>
            </details>
        `;
    }
    _renderTapActionsConfig() {
      return `
            <details data-section-id="radar-tap-actions">
                <summary><h4>Tap Actions</h4></summary>
                <div class="section-content">
                    <p class="help-text">Configure what happens when tapping on the radar or flights (only applies when Show Radar is enabled)</p>
                    <div class="item-box">
                        <div class="form-row">
                            <label>Radar tap URL:</label>
                            <input type="text" class="full-width" id="tap-action" placeholder="https://www.flightradar24.com/\${map_lat},\${map_lon}/\${zoom}" value="${this._config.tap_action || ""}" />
                        </div>
                        <p class="help-text" style="margin-top: 4px; font-size: 0.85em;">Available variables: \${map_lat}, \${map_lon}, \${zoom}, \${radar_range}, \${click_lat}, \${click_lon}, \${entity.state}, \${flight.*}</p>
                    </div>
                    <div class="item-box">
                        <div class="form-row">
                            <label>Flight tap:</label>
                            <input type="text" class="full-width" id="flight-tap-action" placeholder="toggle, URL, or toggle|URL" value="${this._config.flight_tap_action || ""}" />
                        </div>
                        <p class="help-text" style="margin-top: 4px; font-size: 0.85em;">Enter "toggle", a URL, or "toggle|URL". Leave empty for default toggle behavior.</p>
                        <p class="help-text" style="margin-top: 4px; font-size: 0.85em;">Available variables: \${map_lat}, \${map_lon}, \${zoom}, \${radar_range}, \${flight.callsign}, \${flight.latitude}, \${flight.longitude}, \${entity.state}</p>
                    </div>
                </div>
            </details>
        `;
    }
    _renderTemplatesConfig() {
      const t = this._config.templates || {}, e = [
        "flight_element",
        "radar_range",
        "list_status"
      ], a = Object.keys(U).filter((n) => !(n in t)), i = a.filter((n) => e.includes(n)), o = a.filter((n) => !e.includes(n)), r = this.getUnusedTemplates();
      return `
            <details data-section-id="templates-config">
                <summary>
                    <h3>Templates</h3>
                    ${r.length > 0 ? `<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="Unused templates: ${r.join(", ")}">⚠️</span>` : ""}
                </summary>
                <div class="section-content">
                    <p class="help-text">Customize HTML templates for flight list items using \${flight.field} placeholders. Main templates are used directly by renderers; helper templates are used by other templates.</p>
                    <div id="templates-list">
                        ${Object.entries(t).map(([n, l]) => {
        const s = e.includes(n), u = r.includes(n);
        return `
                            <div class="item-box" ${u ? 'style="border-color: #ff9800;"' : ""}>
                                <div class="form-row">
                                    <label>Template Name:</label>
                                    <div style="display: flex; align-items: center;">
                                        <input type="text" value="${n}" data-template-name="${n}" style="flex: 1;" />
                                        ${s ? '<span style="background: var(--primary-color, #03a9f4); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 8px; font-weight: bold;">MAIN</span>' : ""}
                                        ${u ? '<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="This template is not used by renderers or other templates">⚠️</span>' : ""}
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label>Template:</label>
                                    <textarea class="full-width" rows="3" data-template-value="${n}">${this._escapeHtml(l)}</textarea>
                                </div>
                                <button class="remove-button" data-action="remove-template" data-key="${n}">Remove</button>
                            </div>
                        `;
      }).join("")}
                    </div>
                    <div class="template-button-container" style="margin-top: 12px;">
                        <button class="add-button template-dropdown-button" id="add-template-button">
                            <span>Add Template</span>
                        </button>
                        <div class="template-dropdown" id="template-dropdown">
                            <div class="template-dropdown-item" data-template-key="__custom__">New custom template...</div>
                            ${i.length > 0 ? `
                                <div class="template-dropdown-header">Main Templates (used by renderers)</div>
                                ${i.map((n) => `
                                    <div class="template-dropdown-item" data-template-key="${n}"><strong>${n}</strong></div>
                                `).join("")}
                            ` : ""}
                            ${o.length > 0 ? `
                                <div class="template-dropdown-header">Helper Templates (used by other templates)</div>
                                ${o.map((n) => `
                                    <div class="template-dropdown-item" data-template-key="${n}">${n}</div>
                                `).join("")}
                            ` : ""}
                        </div>
                    </div>
                </div>
            </details>
        `;
    }
    _renderLocalFeature(t, e) {
      if (t.type === "location") {
        const a = t;
        return `
                <details class="item-box" data-feature-id="feature-${e}">
                    <summary class="item-header">
                        <span>Location: ${a.label || "Unnamed"}</span>
                        <button class="remove-button small-button" data-action="remove-local-feature" data-index="${e}">Remove</button>
                    </summary>
                    <div class="section-content">
                        <div class="form-row">
                            <label>Label:</label>
                            <input type="text" class="full-width" value="${a.label || ""}" data-feature-prop="${e}:label" placeholder="Airport, Tower, etc." />
                        </div>
                        <div class="form-row">
                            <label>Latitude:</label>
                            <input type="number" step="0.0001" value="${a.position.lat}" data-feature-prop="${e}:lat" />
                            <button class="small-button" data-action="select-location-on-map" data-index="${e}" style="margin-left: 8px;">Select on Map</button>
                        </div>
                        <div class="form-row">
                            <label>Longitude:</label>
                            <input type="number" step="0.0001" value="${a.position.lon}" data-feature-prop="${e}:lon" />
                        </div>
                        <div class="form-row">
                            <label>Max Range (optional):</label>
                            <input type="number" min="0" step="1" value="${a.max_range ?? ""}" data-feature-prop="${e}:max_range" placeholder="Show only within range" />
                        </div>
                    </div>
                </details>
            `;
      } else if (t.type === "runway") {
        const a = t;
        return `
                <details class="item-box" data-feature-id="feature-${e}">
                    <summary class="item-header">
                        <span>Runway (${a.heading}°)</span>
                        <button class="remove-button small-button" data-action="remove-local-feature" data-index="${e}">Remove</button>
                    </summary>
                    <div class="section-content">
                        <div class="form-row" style="gap: 4px; position: relative;">
                            <label>Lookup Runway:</label>
                            <div style="position: relative; flex: 1;">
                                <input type="text" id="runway-lookup-${e}" placeholder="Start typing airport name or code..." style="width: 100%;" data-runway-index="${e}" />
                                <div id="runway-dropdown-${e}" class="runway-dropdown" style="display: none;"></div>
                            </div>
                        </div>
                        <div id="runway-lookup-status-${e}" style="margin: 8px 0; font-size: 0.9em;"></div>
                        <p class="help-text">Position is the endpoint at the given runway heading</p>
                        <p class="help-text" style="font-size: 0.85em; font-style: italic;">Runway data from <a href="https://ourairports.com/data/" target="_blank" rel="noopener noreferrer">OurAirports</a></p>
                        <div class="form-row">
                            <label>Latitude:</label>
                            <input type="number" step="0.0001" value="${a.position.lat}" data-feature-prop="${e}:lat" />
                        </div>
                        <div class="form-row">
                            <label>Longitude:</label>
                            <input type="number" step="0.0001" value="${a.position.lon}" data-feature-prop="${e}:lon" />
                        </div>
                        <div class="form-row">
                            <label>Heading (degrees):</label>
                            <input type="number" min="0" max="359" step="1" value="${a.heading}" data-feature-prop="${e}:heading" />
                        </div>
                        <div class="form-row">
                            <label>Length (feet):</label>
                            <input type="number" min="0" step="1" value="${a.length}" data-feature-prop="${e}:length" />
                        </div>
                        <div class="form-row">
                            <label>Max Range (optional):</label>
                            <input type="number" min="0" step="1" value="${a.max_range ?? ""}" data-feature-prop="${e}:max_range" placeholder="Show only within range" />
                        </div>
                    </div>
                </details>
            `;
      } else if (t.type === "outline") {
        const a = t, i = JSON.stringify(a.points);
        return `
                <details class="item-box" data-feature-id="feature-${e}">
                    <summary class="item-header">
                        <span>Outline (${a.points.length} points)</span>
                        <button class="remove-button small-button" data-action="remove-local-feature" data-index="${e}">Remove</button>
                    </summary>
                    <div class="section-content">
                        <div class="form-row">
                            <label>Points (JSON):</label>
                            <textarea class="full-width" rows="4" style="font-family: 'Courier New', monospace;" data-feature-prop="${e}:points" placeholder='[{"lat": 63.4, "lon": 10.4}, ...]'>${this._escapeHtml(i)}</textarea>
                            <button class="small-button" data-action="draw-outline-on-map" data-index="${e}" style="margin-top: 4px;">Draw on Map</button>
                        </div>
                        <p class="help-text">Array of {"lat": number, "lon": number} objects</p>
                        <div class="form-row">
                            <label>Max Range (optional):</label>
                            <input type="number" min="0" step="1" value="${a.max_range ?? ""}" data-feature-prop="${e}:max_range" placeholder="Show only within range" />
                        </div>
                    </div>
                </details>
            `;
      }
      return "";
    }
    _renderAnnotation(t, e) {
      const a = t.conditions || [];
      return `
            <details class="item-box" data-annotation-id="annotation-${e}">
                <summary class="item-header">
                    <span>Annotation: ${t.field || "Unnamed"}</span>
                    <button class="remove-button small-button" data-action="remove-annotation" data-index="${e}">Remove</button>
                </summary>
                <div class="section-content">
                    <div class="form-row">
                        <label>Field:</label>
                        <select class="full-width" data-annotation-prop="${e}:field">
                            <option value="">Select field...</option>
                            ${(() => {
        const i = this.availableFlightFields.reduce((o, r) => {
          const n = r.group || "Other";
          return o[n] || (o[n] = []), o[n].push(r), o;
        }, {});
        return Object.entries(i).map(([o, r]) => `
                                    <optgroup label="${o}">
                                        ${r.map((n) => `<option value="${n.value}" ${t.field === n.value ? "selected" : ""}>${n.label}</option>`).join("")}
                                    </optgroup>
                                `).join("");
      })()}
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Render Template:</label>
                        <textarea class="full-width" rows="3" data-annotation-prop="${e}:render" placeholder="HTML template with \${flight.field} placeholders">${this._escapeHtml(t.render || "")}</textarea>
                    </div>

                    <details data-section-id="annotation-${e}-conditions" style="margin-top: 12px;">
                        <summary><h5>Conditions</h5></summary>
                        <div class="section-content">
                            <p class="help-text">Define when this annotation should be displayed. All conditions must match (implicit AND).</p>
                            <div id="annotation-${e}-conditions">
                                ${a.length > 0 ? this._renderConditionsList(a, `annotate:${e}`) : '<p class="empty-state">No conditions defined</p>'}
                            </div>
                            <div class="button-group" style="margin-top: 12px;">
                                <button class="add-button" data-action="add-annotation-condition" data-index="${e}">Add Value Condition</button>
                                <button class="add-button" data-action="add-annotation-group" data-index="${e}">Add AND/OR Group</button>
                                <button class="add-button" data-action="add-annotation-not" data-index="${e}">Add NOT Condition</button>
                            </div>
                        </div>
                    </details>
                </div>
            </details>
        `;
    }
    _renderConditionsList(t, e) {
      return t.map((a, i) => this._renderCondition(a, `${e}:${i}`)).join("");
    }
    _renderCondition(t, e) {
      return "type" in t ? t.type === "NOT" ? this._renderNotCondition(t, e) : this._renderGroupCondition(t, e) : this._renderFieldCondition(t, e);
    }
    _renderFieldCondition(t, e) {
      const a = this._getConditionDescription(t), i = !!t.defined, o = Object.keys(this._config.defines || {}), r = Object.keys(this._config.toggles || {}), n = [...o, ...r], l = i ? t.defined : t.field, s = l ? this.validateConditionField(l) : { valid: !0 }, u = !s.valid;
      this._formatValue(t.value);
      const b = typeof t.value == "string" && t.value.startsWith("${") && t.value.endsWith("}"), _ = b ? t.value.slice(2, -1) : "";
      return `
            <details class="condition-box" data-condition-path="${e}" ${u ? 'style="border-color: #ff9800;"' : ""}>
                <summary class="condition-summary">
                    <span class="condition-type-badge">Value</span>
                    <span class="condition-description">${a}</span>
                    ${u ? `<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="${s.error || "Invalid field"}">⚠️</span>` : ""}
                    <button class="remove-button" data-action="remove-condition" data-path="${e}"
                        onclick="event.preventDefault(); event.stopPropagation();">Remove</button>
                </summary>
                <div class="condition-content">
                <div class="form-row">
                    <select class="condition-field-type" data-path="${e}" data-target="field">
                        <option value="field" ${i ? "" : "selected"}>Flight Field</option>
                        <option value="defined" ${i ? "selected" : ""}>Defined Value</option>
                    </select>
                    ${i ? n.length > 0 ? `
                            <select class="full-width condition-field" data-path="${e}" data-prop="defined" ${u ? 'style="border-color: #ff9800;"' : ""}>
                                <option value="">Select a define...</option>
                                ${n.map((m) => {
        const y = this._config.toggles && m in this._config.toggles ? `toggle: ${this._config.toggles[m].label}` : this._formatValueForDisplay(this._config.defines[m]);
        return `<option value="${m}" ${t.defined === m ? "selected" : ""}>${m} (${y})</option>`;
      }).join("")}
                            </select>
                        ` : `
                            <input type="text" class="full-width condition-field" data-path="${e}" data-prop="defined"
                                value="${t.defined || ""}" placeholder="e.g., max_altitude" ${u ? 'style="border-color: #ff9800;"' : ""} />
                        ` : `
                        <select class="full-width condition-field" data-path="${e}" data-prop="field" ${u ? 'style="border-color: #ff9800;"' : ""}>
                            <option value="">Select a field...</option>
                            ${this.availableFlightFields.map((m, y, x) => {
        const E = y > 0 ? x[y - 1].group : null;
        return `${m.group && m.group !== E ? `<option disabled style="font-weight: bold; font-style: italic;">— ${m.group} —</option>` : ""}<option value="${m.value}" ${t.field === m.value ? "selected" : ""}>${m.label}</option>`;
      }).join("")}
                        </select>
                    `}
                </div>
                ${u ? `<div class="form-row"><p style="color: #ff9800; margin: 0; font-size: 0.9em;">${s.error || "Invalid field"}</p></div>` : ""}
                <div class="form-row">
                <div class="form-row">
                    <label>Comparator:</label>
                    <select class="condition-field" data-path="${e}" data-prop="comparator">
                        <option value="eq" ${t.comparator === "eq" ? "selected" : ""}>Equals (eq)</option>
                        <option value="lt" ${t.comparator === "lt" ? "selected" : ""}>Less Than (lt)</option>
                        <option value="lte" ${t.comparator === "lte" ? "selected" : ""}>Less Than or Equal (lte)</option>
                        <option value="gt" ${t.comparator === "gt" ? "selected" : ""}>Greater Than (gt)</option>
                        <option value="gte" ${t.comparator === "gte" ? "selected" : ""}>Greater Than or Equal (gte)</option>
                        <option value="oneOf" ${t.comparator === "oneOf" ? "selected" : ""}>One Of (array)</option>
                        <option value="containsOneOf" ${t.comparator === "containsOneOf" ? "selected" : ""}>Contains One Of (array)</option>
                    </select>
                </div>
                <div class="form-row">
                    <select class="condition-field-type" data-path="${e}" data-target="value">
                        <option value="direct" ${b ? "" : "selected"}>Value</option>
                        <option value="defined" ${b ? "selected" : ""}>Defined Value</option>
                    </select>
                    ${b && n.length > 0 ? `
                        <select class="full-width condition-field-value-defined" data-path="${e}">
                            <option value="" ${_ === "" ? "selected" : ""}>Select a define...</option>
                            ${n.map((m) => {
        const y = this._config.toggles && m in this._config.toggles ? `toggle: ${this._config.toggles[m].label}` : this._formatValueForDisplay(this._config.defines[m]);
        return `<option value="${m}" ${_ === m ? "selected" : ""}>${m} (${y})</option>`;
      }).join("")}
                        </select>
                    ` : `
                        <input type="text" class="full-width condition-field" data-path="${e}" data-prop="value"
                            value="${b ? _ : this._formatValue(t.value)}" placeholder="Value or comma-separated list" />
                    `}
                </div>
                ${t.defaultValue !== void 0 ? `
                    <div class="form-row">
                        <label>Default Value:</label>
                        <input type="text" class="full-width condition-field" data-path="${e}" data-prop="defaultValue"
                            value="${this._formatValue(t.defaultValue)}" />
                    </div>
                ` : ""}
                </div>
            </details>
        `;
    }
    _renderGroupCondition(t, e) {
      const a = this._getConditionDescription(t);
      return `
            <details class="condition-box condition-group" data-condition-path="${e}">
                <summary class="condition-summary">
                    <span class="condition-type-badge">${t.type}</span>
                    <span class="condition-description">${a}</span>
                    <button class="remove-button" data-action="remove-condition" data-path="${e}"
                        onclick="event.preventDefault(); event.stopPropagation();">Remove</button>
                </summary>
                <div class="condition-content">
                    <div class="form-row" style="margin-bottom: 12px;">
                        <label>Logic Type:</label>
                        <select class="condition-field" data-path="${e}" data-prop="type">
                            <option value="AND" ${t.type === "AND" ? "selected" : ""}>AND (all must match)</option>
                            <option value="OR" ${t.type === "OR" ? "selected" : ""}>OR (any can match)</option>
                        </select>
                    </div>
                <div class="conditions-list" style="margin-left: 16px;">
                    ${t.conditions.length > 0 ? this._renderConditionsList(t.conditions, e) : '<p class="empty-state">No conditions in this group</p>'}
                </div>
                <div class="button-group" style="margin-top: 8px; margin-left: 16px;">
                    <button class="small-button add-button" data-action="add-group-condition" data-path="${e}">+ Value</button>
                    <button class="small-button add-button" data-action="add-group-group" data-path="${e}">+ Group</button>
                    <button class="small-button add-button" data-action="add-group-not" data-path="${e}">+ NOT</button>
                </div>
                </div>
            </details>
        `;
    }
    _renderNotCondition(t, e) {
      return `
            <details class="condition-box condition-not" data-condition-path="${e}">
                <summary class="condition-summary">
                    <span class="condition-type-badge">NOT</span>
                    <span class="condition-description">${this._getConditionDescription(t.condition)}</span>
                    <button class="remove-button" data-action="remove-condition" data-path="${e}"
                        onclick="event.preventDefault(); event.stopPropagation();">Remove</button>
                </summary>
                <div class="condition-content" style="margin-left: 16px;">
                    ${this._renderCondition(t.condition, e)}
                </div>
            </details>
        `;
    }
    _getConditionDescription(t) {
      if ("type" in t) {
        if (t.type === "NOT") return this._getConditionDescription(t.condition);
        {
          const e = t, a = e.conditions.length;
          if (a === 0) return "(empty group)";
          const i = e.conditions.slice(0, 2).map((n) => {
            const l = this._getConditionDescription(n);
            return l.length > 30 ? l.substring(0, 27) + "..." : l;
          }), o = a - i.length, r = i.join(` ${e.type} `);
          return o > 0 ? `${r} + ${o} more` : r;
        }
      } else {
        const e = t;
        return `${e.defined ? `\${${e.defined}}` : e.field || "(no field)"} ${this._getComparatorSymbol(e.comparator)} ${this._formatValueForDisplay(e.value)}`;
      }
    }
    _getComparatorSymbol(t) {
      switch (t) {
        case "eq":
          return "=";
        case "lt":
          return "<";
        case "lte":
          return "≤";
        case "gt":
          return ">";
        case "gte":
          return "≥";
        case "oneOf":
          return "in";
        case "containsOneOf":
          return "contains";
        default:
          return t;
      }
    }
    _formatValueForDisplay(t) {
      if (Array.isArray(t))
        return t.length > 2 ? `[${t.slice(0, 2).join(", ")}, +${t.length - 2}]` : `[${t.join(", ")}]`;
      const e = String(t ?? "");
      return e === "${}" ? "(select define)" : e.length > 20 ? e.substring(0, 17) + "..." : e;
    }
    _formatValue(t) {
      return Array.isArray(t) ? t.join(", ") : String(t ?? "");
    }
    _attachEventListeners() {
      const t = this._shadowRoot, e = t.getElementById("flights-entity");
      e && e.addEventListener("change", (p) => {
        this._config = {
          ...this._config,
          flights_entity: p.target.value
        }, this._emitConfigChanged();
      });
      const a = t.getElementById("location-tracker");
      a && a.addEventListener("change", (p) => {
        const c = p.target.value;
        if (this._config = {
          ...this._config,
          location_tracker: c || void 0
        }, c) {
          const { location: d, ...h } = this._config;
          this._config = h;
        }
        this._emitConfigChanged(), this._render();
      }), ["lat", "lon"].forEach((p) => {
        const c = t.getElementById(`location-${p}`);
        c && c.addEventListener("input", (d) => {
          const h = parseFloat(d.target.value);
          if (!isNaN(h)) {
            const v = this._config.location || {
              lat: 0,
              lon: 0
            };
            this._config = {
              ...this._config,
              location: {
                ...v,
                [p]: h
              }
            }, this._emitConfigChanged();
          }
        });
      }), [
        "altitude",
        "speed",
        "distance"
      ].forEach((p) => {
        const c = t.getElementById(`unit-${p}`);
        c && c.addEventListener("change", (d) => {
          const h = this._config.units || {};
          this._config = {
            ...this._config,
            units: {
              ...h,
              [p]: d.target.value
            }
          }, this._emitConfigChanged(), p === "distance" && this._render();
        });
      });
      const i = t.getElementById("projection-interval");
      i && i.addEventListener("input", (p) => {
        this._config = {
          ...this._config,
          projection_interval: parseInt(p.target.value)
        }, this._emitConfigChanged();
      });
      const o = t.getElementById("scale");
      o && o.addEventListener("input", (p) => {
        this._config = {
          ...this._config,
          scale: parseFloat(p.target.value)
        }, this._emitConfigChanged();
      });
      const r = t.getElementById("max-flights");
      r && r.addEventListener("input", (p) => {
        const c = p.target.value, d = parseInt(c);
        this._config = {
          ...this._config,
          max_flights: !c || isNaN(d) || d <= 0 ? void 0 : d
        }, this._emitConfigChanged();
      });
      const n = t.getElementById("radar-show");
      n && n.addEventListener("change", (p) => {
        const c = this._config.radar || {}, d = p.target.checked ? void 0 : !0;
        this._config = {
          ...this._config,
          radar: {
            ...c,
            hide: d
          }
        }, this._emitConfigChanged();
      }), [
        "range",
        "min-range",
        "max-range",
        "ring-distance"
      ].forEach((p) => {
        const c = t.getElementById(`radar-${p}`);
        c && c.addEventListener("input", (d) => {
          const h = this._config.radar || {}, v = p.replace(/-/g, "_");
          this._config = {
            ...this._config,
            radar: {
              ...h,
              [v]: parseFloat(d.target.value)
            }
          }, this._emitConfigChanged();
        });
      }), [
        "background-color",
        "aircraft-color",
        "aircraft-selected-color",
        "radar-grid-color",
        "local-features-color"
      ].forEach((p) => {
        const c = p.startsWith("radar-") ? p : `radar-${p}`, d = t.getElementById(c);
        d && d.addEventListener("input", (h) => {
          const v = this._config.radar || {}, f = { ...this._config };
          p === "background-color" && f.radar && delete f.radar["primary-color"], p === "aircraft-color" && f.radar && delete f.radar["accent-color"], (p === "radar-grid-color" || p === "local-features-color") && f.radar && delete f.radar["feature-color"], this._config = {
            ...f,
            radar: {
              ...v,
              [p]: h.target.value
            }
          }, this._emitConfigChanged(), (p === "background-color" || p === "aircraft-color") && this._render();
        });
      });
      const l = t.getElementById("radar-background-opacity");
      l && l.addEventListener("input", (p) => {
        const c = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...c,
            "background-opacity": parseFloat(p.target.value)
          }
        }, this._emitConfigChanged(), this._render();
      }), t.querySelectorAll(".marker-size-option").forEach((p) => {
        p.addEventListener("click", (c) => {
          const d = c.currentTarget.getAttribute("data-size"), h = this._config.radar || {};
          this._config = {
            ...this._config,
            radar: {
              ...h,
              "aircraft-marker-size": d === "normal" ? void 0 : d
            }
          }, this._emitConfigChanged(), this._render();
        });
      });
      const s = (p, c) => {
        const d = this._config.radar || {}, h = { ...d["aircraft-marker"]?.default || {} };
        c === "" || c === void 0 || c === 0 ? delete h[p] : h[p] = c;
        const v = Object.keys(h).length > 0 && h["aircraft-marker-url"];
        this._config = {
          ...this._config,
          radar: {
            ...d,
            "aircraft-marker": v ? { default: h } : void 0
          }
        }, this._emitConfigChanged();
      }, u = t.getElementById("radar-custom-marker-url");
      u && u.addEventListener("input", (p) => {
        s("aircraft-marker-url", p.target.value);
      });
      const b = t.getElementById("radar-custom-marker-rotation");
      b && b.addEventListener("input", (p) => {
        const c = parseInt(p.target.value);
        s("aircraft-marker-rotation", isNaN(c) ? 0 : c);
      });
      const _ = t.getElementById("radar-custom-marker-center");
      _ && _.addEventListener("input", (p) => {
        s("aircraft-marker-center", p.target.value || void 0);
      });
      const m = t.getElementById("radar-custom-marker-scale");
      m && m.addEventListener("input", (p) => {
        const c = parseFloat(p.target.value);
        s("aircraft-marker-scale", isNaN(c) ? 1 : c);
      });
      const y = t.getElementById("radar-custom-marker-overlay");
      y && y.addEventListener("input", (p) => {
        const c = p.target.value;
        s("aircraft-marker-color-overlay", c || void 0);
      });
      const x = t.getElementById("radar-background-map");
      x && x.addEventListener("change", (p) => {
        const c = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...c,
            background_map: p.target.value
          }
        }, this._emitConfigChanged(), this._render();
      });
      const E = t.getElementById("radar-background-map-api-key");
      E && E.addEventListener("input", (p) => {
        const c = this._config.radar || {}, d = p.target.value;
        this._config = {
          ...this._config,
          radar: {
            ...c,
            background_map_api_key: d || void 0
          }
        }, this._emitConfigChanged();
      });
      const M = t.getElementById("radar-background-map-opacity");
      M && M.addEventListener("input", (p) => {
        const c = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...c,
            background_map_opacity: parseFloat(p.target.value)
          }
        }, this._emitConfigChanged();
      });
      const F = t.getElementById("list-show");
      F && F.addEventListener("change", (p) => {
        const c = this._config.list || {}, d = p.target.checked ? void 0 : !0;
        this._config = {
          ...this._config,
          list: {
            ...c,
            hide: d
          }
        }, this._emitConfigChanged();
      });
      const O = t.getElementById("list-show-status");
      O && O.addEventListener("change", (p) => {
        const c = this._config.list || {}, d = p.target.checked ? void 0 : !1;
        this._config = {
          ...this._config,
          list: {
            ...c,
            showListStatus: d
          }
        }, this._emitConfigChanged();
      });
      const L = t.getElementById("no-flights-message");
      L && L.addEventListener("input", (p) => {
        this._config = {
          ...this._config,
          no_flights_message: p.target.value
        }, this._emitConfigChanged();
      });
      const A = t.getElementById("add-template-button"), C = t.getElementById("template-dropdown");
      A && C && (A.addEventListener("click", (p) => {
        p.stopPropagation();
        const c = C.classList.contains("open");
        t.querySelectorAll(".template-dropdown").forEach((d) => d.classList.remove("open")), c || C.classList.add("open");
      }), C.querySelectorAll(".template-dropdown-item").forEach((p) => {
        p.addEventListener("click", (c) => {
          c.stopPropagation();
          const d = c.target.getAttribute("data-template-key");
          if (!d) return;
          const h = this._config.templates || {};
          if (d === "__custom__") {
            let v = 1;
            for (; h[`template${v}`]; ) v++;
            this._config = {
              ...this._config,
              templates: {
                ...h,
                [`template${v}`]: ""
              }
            };
          } else {
            const v = U[d];
            this._config = {
              ...this._config,
              templates: {
                ...h,
                [d]: v
              }
            };
          }
          this._emitConfigChanged(), this._render(), C.classList.remove("open");
        });
      }), document.addEventListener("click", () => {
        C.classList.remove("open");
      })), t.querySelectorAll("[data-action]").forEach((p) => {
        p.addEventListener("click", (c) => {
          const d = c.target.getAttribute("data-action"), h = c.target.getAttribute("data-index"), v = c.target.getAttribute("data-key");
          if (d === "add-sort") {
            const f = this._config.sort || [];
            this._config = {
              ...this._config,
              sort: [...f, {
                field: "distance",
                order: "asc"
              }]
            }, this._emitConfigChanged(), this._render();
          } else if (d === "remove-sort" && h) {
            const f = [...this._config.sort || []];
            f.splice(parseInt(h), 1), this._config = {
              ...this._config,
              sort: f.length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (d === "add-define") {
            const f = this._config.defines || {};
            let g = 1;
            for (; f[`define${g}`]; ) g++;
            this._config = {
              ...this._config,
              defines: {
                ...f,
                [`define${g}`]: ""
              }
            }, this._emitConfigChanged(), this._render();
          } else if (d === "remove-define" && v) {
            const f = { ...this._config.defines };
            delete f[v], this._config = {
              ...this._config,
              defines: Object.keys(f).length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (d === "add-toggle") {
            const f = this._config.toggles || {};
            let g = 1;
            for (; f[`toggle${g}`]; ) g++;
            this._config = {
              ...this._config,
              toggles: {
                ...f,
                [`toggle${g}`]: {
                  label: "Toggle",
                  default: !1
                }
              }
            }, this._emitConfigChanged(), this._render();
          } else if (d === "remove-toggle" && v) {
            const f = { ...this._config.toggles };
            delete f[v], this._config = {
              ...this._config,
              toggles: Object.keys(f).length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (d === "remove-template" && v) {
            const f = { ...this._config.templates };
            delete f[v], this._config = {
              ...this._config,
              templates: Object.keys(f).length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (d === "add-filter-condition") {
            const f = this._config.filter || [], g = f.length;
            this._config = {
              ...this._config,
              filter: [...f, {
                field: "",
                comparator: "eq",
                value: ""
              }]
            }, this._openConditions.add(`filter:${g}`), this._emitConfigChanged(), this._render();
          } else if (d === "add-filter-group") {
            const f = this._config.filter || [], g = f.length;
            this._config = {
              ...this._config,
              filter: [...f, {
                type: "AND",
                conditions: []
              }]
            }, this._openConditions.add(`filter:${g}`), this._emitConfigChanged(), this._render();
          } else if (d === "add-filter-not") {
            const f = this._config.filter || [], g = f.length;
            this._config = {
              ...this._config,
              filter: [...f, {
                type: "NOT",
                condition: {
                  field: "",
                  comparator: "eq",
                  value: ""
                }
              }]
            }, this._openConditions.add(`filter:${g}`), this._emitConfigChanged(), this._render();
          } else if (d === "remove-condition") {
            const f = c.target.getAttribute("data-path");
            f && (this._removeConditionAtPath(f), this._emitConfigChanged(), this._render());
          } else if (d === "add-group-condition") {
            const f = c.target.getAttribute("data-path");
            if (f) {
              const g = this._addConditionToGroup(f, {
                field: "",
                comparator: "eq",
                value: ""
              });
              g && this._openConditions.add(g), this._emitConfigChanged(), this._render();
            }
          } else if (d === "add-group-group") {
            const f = c.target.getAttribute("data-path");
            if (f) {
              const g = this._addConditionToGroup(f, {
                type: "AND",
                conditions: []
              });
              g && this._openConditions.add(g), this._emitConfigChanged(), this._render();
            }
          } else if (d === "add-group-not") {
            const f = c.target.getAttribute("data-path");
            if (f) {
              const g = this._addConditionToGroup(f, {
                type: "NOT",
                condition: {
                  field: "",
                  comparator: "eq",
                  value: ""
                }
              });
              g && this._openConditions.add(g), this._emitConfigChanged(), this._render();
            }
          } else if (d === "add-local-feature-location") {
            const f = this._config.radar || {}, g = f.local_features || [], $ = g.length;
            this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: [...g, {
                  type: "location",
                  label: "",
                  position: {
                    lat: 0,
                    lon: 0
                  }
                }]
              }
            }, this._openFeatures.add(`feature-${$}`), this._emitConfigChanged(), this._render();
          } else if (d === "add-local-feature-runway") {
            const f = this._config.radar || {}, g = f.local_features || [], $ = g.length;
            this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: [...g, {
                  type: "runway",
                  position: {
                    lat: 0,
                    lon: 0
                  },
                  heading: 0,
                  length: 0
                }]
              }
            }, this._openFeatures.add(`feature-${$}`), this._emitConfigChanged(), this._render();
          } else if (d === "add-local-feature-outline") {
            const f = this._config.radar || {}, g = f.local_features || [], $ = g.length;
            this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: [...g, {
                  type: "outline",
                  points: []
                }]
              }
            }, this._openFeatures.add(`feature-${$}`), this._emitConfigChanged(), this._render();
          } else if (d === "remove-local-feature" && h) {
            const f = this._config.radar || {}, g = [...f.local_features || []];
            g.splice(parseInt(h), 1), this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: g.length > 0 ? g : void 0
              }
            }, this._emitConfigChanged(), this._render();
          } else if (d === "select-location-on-map" && h) this._openMapModal("location", parseInt(h));
          else if (d === "draw-outline-on-map" && h) this._openMapModal("outline", parseInt(h));
          else if (d === "add-annotation") {
            const f = this._config.annotate || [], g = f.length;
            this._config = {
              ...this._config,
              annotate: [...f, {
                field: "",
                render: "",
                conditions: []
              }]
            }, this._openAnnotations.add(`annotation-${g}`), this._emitConfigChanged(), this._render();
          } else if (d === "remove-annotation" && h) {
            const f = [...this._config.annotate || []];
            f.splice(parseInt(h), 1), this._config = {
              ...this._config,
              annotate: f.length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (d === "add-annotation-condition" && h) {
            const f = [...this._config.annotate || []], g = parseInt(h);
            if (f[g]) {
              const $ = (f[g].conditions || []).length;
              f[g] = {
                ...f[g],
                conditions: [...f[g].conditions || [], {
                  field: "",
                  comparator: "eq",
                  value: ""
                }]
              }, this._config = {
                ...this._config,
                annotate: f
              }, this._openConditions.add(`annotate:${g}:${$}`), this._emitConfigChanged(), this._render();
            }
          } else if (d === "add-annotation-group" && h) {
            const f = [...this._config.annotate || []], g = parseInt(h);
            if (f[g]) {
              const $ = (f[g].conditions || []).length;
              f[g] = {
                ...f[g],
                conditions: [...f[g].conditions || [], {
                  type: "AND",
                  conditions: []
                }]
              }, this._config = {
                ...this._config,
                annotate: f
              }, this._openConditions.add(`annotate:${g}:${$}`), this._emitConfigChanged(), this._render();
            }
          } else if (d === "add-annotation-not" && h) {
            const f = [...this._config.annotate || []], g = parseInt(h);
            if (f[g]) {
              const $ = (f[g].conditions || []).length;
              f[g] = {
                ...f[g],
                conditions: [...f[g].conditions || [], {
                  type: "NOT",
                  condition: {
                    field: "",
                    comparator: "eq",
                    value: ""
                  }
                }]
              }, this._config = {
                ...this._config,
                annotate: f
              }, this._openConditions.add(`annotate:${g}:${$}`), this._emitConfigChanged(), this._render();
            }
          }
        });
      }), t.querySelectorAll("[data-runway-index]").forEach((p) => {
        const c = parseInt(p.getAttribute("data-runway-index")), d = t.getElementById(`runway-dropdown-${c}`), h = t.getElementById(`runway-lookup-status-${c}`);
        let v;
        p.addEventListener("input", (f) => {
          const g = f.target.value.trim();
          if (clearTimeout(v), !g || g.length < 2) {
            d && (d.style.display = "none"), h && (h.textContent = "");
            return;
          }
          d && (d.innerHTML = '<div class="runway-dropdown-loading">⏳ Searching runways...</div>', d.style.display = "block"), v = window.setTimeout(() => {
            Kt(g).then(($) => {
              d && ($.length === 0 ? d.innerHTML = '<div class="runway-dropdown-empty">No runways found</div>' : (d.innerHTML = $.map((T) => `<div class="runway-dropdown-item" data-runway-result='${JSON.stringify(T.data)}'>${T.displayText}</div>`).join(""), d.querySelectorAll(".runway-dropdown-item").forEach((T) => {
                T.addEventListener("click", () => {
                  const R = JSON.parse(T.getAttribute("data-runway-result")), j = this._config.radar || {}, I = [...j.local_features || []], B = { ...I[c] };
                  B.position = {
                    lat: R.latitude,
                    lon: R.longitude
                  }, B.heading = Math.round(R.heading), B.length = Math.round(R.length), I[c] = B, this._config = {
                    ...this._config,
                    radar: {
                      ...j,
                      local_features: I
                    }
                  }, this._emitConfigChanged(), p.value = `${R.airportCode} ${R.runwayDesignator}`, d.style.display = "none", h && (h.style.color = "var(--success-color, #43a047)", h.textContent = `✓ ${R.airportCode} RWY${R.runwayDesignator} - ${Math.round(R.length)}ft`), this._render();
                });
              })));
            }).catch(($) => {
              d && (d.innerHTML = `<div class="runway-dropdown-empty">Error: ${$.message}</div>`), h && (h.style.color = "var(--error-color, #f44336)", h.textContent = `❌ ${$.message}`);
            });
          }, 300);
        }), p.addEventListener("blur", () => {
          setTimeout(() => {
            d && (d.style.display = "none");
          }, 200);
        });
      }), t.querySelectorAll(".condition-field-type").forEach((p) => {
        const c = p.getAttribute("data-path"), d = p.getAttribute("data-target");
        c && p.addEventListener("change", (h) => {
          const v = h.target.value;
          d === "value" ? this._switchConditionValueType(c, v) : this._switchConditionFieldType(c, v), this._emitConfigChanged(), this._render();
        });
      }), t.querySelectorAll(".condition-field").forEach((p) => {
        const c = p.getAttribute("data-path"), d = p.getAttribute("data-prop");
        if (c && d) {
          p.addEventListener("input", (v) => {
            this._updateConditionAtPath(c, d, v.target.value), this._emitConfigChanged();
          });
          const h = () => {
            this._render();
          };
          p.tagName === "SELECT" ? p.addEventListener("change", h) : p.addEventListener("blur", h);
        }
      }), t.querySelectorAll(".condition-field-value-defined").forEach((p) => {
        const c = p.getAttribute("data-path");
        c && p.addEventListener("change", (d) => {
          const h = d.target.value, v = h ? `\${${h}}` : "${}";
          this._updateConditionAtPath(c, "value", v), this._emitConfigChanged(), this._render();
        });
      }), t.querySelectorAll("[data-define-key]").forEach((p) => {
        p.addEventListener("input", (c) => {
          const d = c.target, h = d.getAttribute("data-define-key"), v = d.value;
          h !== v && v.trim() && (this._renameConfigKey("define", h, v), d.setAttribute("data-define-key", v), d.closest(".item-box")?.querySelector("[data-define-value]")?.setAttribute("data-define-value", v), this._emitConfigChanged());
        });
      }), t.querySelectorAll("[data-toggle-key]").forEach((p) => {
        p.addEventListener("input", (c) => {
          const d = c.target, h = d.getAttribute("data-toggle-key"), v = d.value;
          if (h !== v && v.trim()) {
            this._renameConfigKey("toggle", h, v), d.setAttribute("data-toggle-key", v);
            const f = d.closest(".item-box");
            f?.querySelector("[data-toggle-label]")?.setAttribute("data-toggle-label", v), f?.querySelector("[data-toggle-default]")?.setAttribute("data-toggle-default", v), this._emitConfigChanged();
          }
        });
      }), t.querySelectorAll("[data-template-name]").forEach((p) => {
        p.addEventListener("input", (c) => {
          const d = c.target, h = d.getAttribute("data-template-name"), v = d.value;
          h !== v && v.trim() && (this._renameConfigKey("template", h, v), d.setAttribute("data-template-name", v), d.closest(".item-box")?.querySelector("[data-template-value]")?.setAttribute("data-template-value", v), this._emitConfigChanged());
        });
      }), t.querySelectorAll("[data-define-value]").forEach((p) => {
        p.addEventListener("input", (c) => {
          const d = c.target.getAttribute("data-define-value"), h = { ...this._config.defines };
          h[d] = c.target.value, this._config = {
            ...this._config,
            defines: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-toggle-label]").forEach((p) => {
        p.addEventListener("input", (c) => {
          const d = c.target.getAttribute("data-toggle-label"), h = { ...this._config.toggles };
          h[d] = {
            ...h[d],
            label: c.target.value
          }, this._config = {
            ...this._config,
            toggles: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-toggle-default]").forEach((p) => {
        p.addEventListener("change", (c) => {
          const d = c.target.getAttribute("data-toggle-default"), h = { ...this._config.toggles }, v = c.target.checked ? !0 : void 0;
          h[d] = {
            ...h[d],
            default: v
          }, this._config = {
            ...this._config,
            toggles: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-template-value]").forEach((p) => {
        p.addEventListener("input", (c) => {
          const d = c.target.getAttribute("data-template-value"), h = { ...this._config.templates };
          h[d] = c.target.value, this._config = {
            ...this._config,
            templates: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-sort-prop]").forEach((p) => {
        p.addEventListener("input", (c) => {
          const [d, h] = c.target.getAttribute("data-sort-prop").split(":"), v = [...this._config.sort || []];
          v[parseInt(d)] = {
            ...v[parseInt(d)],
            [h]: c.target.value
          }, this._config = {
            ...this._config,
            sort: v
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-feature-prop]").forEach((p) => {
        const [c, d] = p.getAttribute("data-feature-prop").split(":");
        p.addEventListener("input", (h) => {
          const v = this._config.radar || {}, f = [...v.local_features || []], g = { ...f[parseInt(c)] };
          if (d === "label") g.label = h.target.value;
          else if (d === "lat")
            "position" in g && (g.position = {
              ...g.position,
              lat: parseFloat(h.target.value) || 0
            });
          else if (d === "lon")
            "position" in g && (g.position = {
              ...g.position,
              lon: parseFloat(h.target.value) || 0
            });
          else if (d === "heading") g.heading = parseFloat(h.target.value) || 0;
          else if (d === "length") g.length = parseFloat(h.target.value) || 0;
          else if (d === "max_range") {
            const $ = h.target.value;
            g.max_range = $ ? parseFloat($) : void 0;
          } else if (d === "points") try {
            g.points = JSON.parse(h.target.value);
          } catch {
            return;
          }
          f[parseInt(c)] = g, this._config = {
            ...this._config,
            radar: {
              ...v,
              local_features: f
            }
          }, this._emitConfigChanged();
        }), d === "label" && p.addEventListener("blur", () => {
          this._render();
        });
      }), t.querySelectorAll("[data-annotation-prop]").forEach((p) => {
        const [c, d] = p.getAttribute("data-annotation-prop").split(":");
        p.addEventListener("input", (h) => {
          const v = [...this._config.annotate || []], f = { ...v[parseInt(c)] };
          d === "field" ? f.field = h.target.value : d === "render" && (f.render = h.target.value), v[parseInt(c)] = f, this._config = {
            ...this._config,
            annotate: v
          }, this._emitConfigChanged();
        }), d === "field" && p.addEventListener("blur", () => {
          this._render();
        });
      });
      const k = t.getElementById("tap-action");
      k && k.addEventListener("input", (p) => {
        const c = p.target.value;
        this._config = {
          ...this._config,
          tap_action: c || void 0
        }, this._emitConfigChanged();
      });
      const w = t.getElementById("flight-tap-action");
      w && w.addEventListener("input", (p) => {
        const c = p.target.value;
        this._config = {
          ...this._config,
          flight_tap_action: c || void 0
        }, this._emitConfigChanged();
      });
    }
    _emitConfigChanged() {
      this._internalUpdate = !0, this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: !0,
        composed: !0
      }));
    }
    _getConditionAtPath(t) {
      const e = t.split(":"), a = e[0];
      let i = null;
      if (a === "filter") {
        if (!this._config.filter) return null;
        i = this._config.filter;
      } else if (a === "annotate") {
        if (!this._config.annotate || e.length < 2) return null;
        const n = parseInt(e[1]);
        if (!this._config.annotate[n]) return null;
        i = this._config.annotate[n].conditions || [], e.splice(1, 1);
      } else return null;
      let o = i;
      for (let n = 1; n < e.length - 1; n++) {
        if (!i) return null;
        const l = parseInt(e[n]), s = i[l];
        if (!s) return null;
        if ("type" in s) s.type === "NOT" ? (o = s, i = [s.condition]) : (o = i, i = s.conditions);
        else return null;
      }
      const r = parseInt(e[e.length - 1]);
      return {
        parent: o,
        index: r,
        condition: Array.isArray(o) ? o[r] : o.condition
      };
    }
    _updateConditionAtPath(t, e, a) {
      const i = this._getConditionAtPath(t);
      if (!i || !i.condition) return;
      const o = i.condition;
      if (e === "type" && "type" in o && o.type !== "NOT") o.type = a;
      else if (!("type" in o)) {
        const r = o;
        e === "field" || e === "defined" ? r[e] = a || void 0 : e === "comparator" ? r.comparator = a : (e === "value" || e === "defaultValue") && (r[e] = this._parseValue(a));
      }
      this._updateConditionsConfig(t);
    }
    _updateConditionsConfig(t) {
      const e = t.split(":")[0];
      e === "filter" ? this._config = {
        ...this._config,
        filter: [...this._config.filter || []]
      } : e === "annotate" && (this._config = {
        ...this._config,
        annotate: [...this._config.annotate || []]
      });
    }
    _removeConditionAtPath(t) {
      const e = this._getConditionAtPath(t);
      if (!e) return;
      if (Array.isArray(e.parent) && e.index !== void 0) e.parent.splice(e.index, 1);
      else if ("type" in e.parent && e.parent.type === "NOT") return;
      const a = t.split(":")[0];
      if (a === "filter") if (this._config.filter?.length === 0) {
        const { filter: i, ...o } = this._config;
        this._config = o;
      } else this._config = {
        ...this._config,
        filter: [...this._config.filter || []]
      };
      else a === "annotate" && (this._config = {
        ...this._config,
        annotate: [...this._config.annotate || []]
      });
    }
    _addConditionToGroup(t, e) {
      const a = this._getConditionAtPath(t);
      if (!a || !a.condition) return null;
      const i = a.condition;
      if ("type" in i && i.type !== "NOT") {
        const o = i, r = o.conditions.length;
        return o.conditions.push(e), this._updateConditionsConfig(t), `${t}:${r}`;
      }
      return null;
    }
    _switchConditionFieldType(t, e) {
      const a = this._getConditionAtPath(t);
      if (!a || !a.condition) return;
      const i = a.condition;
      e === "defined" ? (i.defined = i.field || "", delete i.field) : (i.field = i.defined || "", delete i.defined), this._updateConditionsConfig(t);
    }
    _switchConditionValueType(t, e) {
      const a = this._getConditionAtPath(t);
      if (!a || !a.condition) return;
      const i = a.condition, o = i.value;
      if (e === "defined") {
        if (typeof o == "string" && o.startsWith("${") && o.endsWith("}")) return;
        i.value = "${}";
      } else if (typeof o == "string" && o.startsWith("${") && o.endsWith("}")) {
        const r = o.slice(2, -1), n = this._config.defines || {};
        i.value = n[r] !== void 0 ? n[r] : "";
      }
      this._updateConditionsConfig(t);
    }
    _parseValue(t) {
      if (!t) return "";
      if (t.includes(",")) return t.split(",").map((a) => a.trim()).filter((a) => a);
      const e = parseFloat(t);
      return !isNaN(e) && t === String(e) ? e : t === "true" ? !0 : t === "false" ? !1 : t;
    }
    _escapeHtml(t) {
      const e = document.createElement("div");
      return e.textContent = t, e.innerHTML;
    }
    _getLocation() {
      const t = this._config;
      if (t.location_tracker && this.hass && this.hass.states && t.location_tracker in this.hass.states) {
        const e = this.hass.states[t.location_tracker].attributes;
        return {
          latitude: e.latitude,
          longitude: e.longitude
        };
      } else {
        if (t.location) return {
          latitude: t.location.lat,
          longitude: t.location.lon
        };
        if (this.hass && this.hass.config) return {
          latitude: this.hass.config.latitude,
          longitude: this.hass.config.longitude
        };
      }
      return {
        latitude: 0,
        longitude: 0
      };
    }
    _openMapModal(t, e) {
      if (this._mapModal = {
        type: t,
        index: e,
        points: []
      }, this._renderModalOverlay(), !this._shadowRoot.getElementById("leaflet-css-shadow")) {
        const a = document.createElement("link");
        a.id = "leaflet-css-shadow", a.rel = "stylesheet", a.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", this._shadowRoot.appendChild(a);
      }
      if (window.L)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this._initializeMap();
          });
        });
      else {
        if (!document.getElementById("leaflet-css")) {
          const a = document.createElement("link");
          a.id = "leaflet-css", a.rel = "stylesheet", a.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", document.head.appendChild(a);
        }
        if (document.getElementById("leaflet-js")) {
          const a = setInterval(() => {
            window.L && (clearInterval(a), this._initializeMap());
          }, 50);
        } else {
          const a = document.createElement("script");
          a.id = "leaflet-js", a.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", a.onload = () => this._initializeMap(), document.head.appendChild(a);
        }
      }
    }
    _initializeMap() {
      const t = this._shadowRoot.querySelector(".map-modal-map");
      if (!t || !window.L || !this._mapModal) return;
      const e = t.getBoundingClientRect();
      if (e.width === 0 || e.height === 0) {
        setTimeout(() => this._initializeMap(), 100);
        return;
      }
      t.innerHTML = "", t.removeAttribute("data-leaflet-id");
      const a = this._getLocation(), i = (this._config.radar || {}).range || 50, o = window.L.map(t, {
        center: [a.latitude, a.longitude],
        zoom: this._calculateZoomLevel(i),
        zoomControl: !0,
        attributionControl: !1
      });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(o), window.L.circleMarker([a.latitude, a.longitude], {
        radius: 6,
        color: "#2196f3",
        fillColor: "#2196f3",
        fillOpacity: 0.8
      }).addTo(o), window.L.circle([a.latitude, a.longitude], {
        radius: i * 1e3,
        color: "#2196f3",
        fillColor: "#2196f3",
        fillOpacity: 0.1,
        weight: 2
      }).addTo(o), this._mapModal.map = o, this._mapModal.type === "location" ? this._setupLocationSelection(o) : this._mapModal.type === "outline" && this._setupOutlineDrawing(o), setTimeout(() => o.invalidateSize(), 10);
    }
    _calculateZoomLevel(t) {
      return t <= 10 ? 13 : t <= 25 ? 12 : t <= 50 ? 11 : t <= 100 ? 10 : 9;
    }
    _setupLocationSelection(t) {
      const e = ((this._config.radar || {}).local_features || [])[this._mapModal.index];
      e && e.position.lat !== 0 && e.position.lon !== 0 && (this._mapModal.marker = window.L.circleMarker([e.position.lat, e.position.lon], {
        radius: 10,
        color: "#ff9800",
        fillColor: "#ff9800",
        fillOpacity: 0.8,
        weight: 3,
        draggable: !0
      }).addTo(t), this._mapModal.marker.on("dragend", () => {
        const a = this._mapModal.marker.getLatLng();
        this._updateLocationCoordinates(a.lat, a.lng);
      })), t.on("click", (a) => {
        const i = a.latlng.lat, o = a.latlng.lng;
        this._mapModal.marker ? this._mapModal.marker.setLatLng([i, o]) : (this._mapModal.marker = window.L.circleMarker([i, o], {
          radius: 10,
          color: "#ff9800",
          fillColor: "#ff9800",
          fillOpacity: 0.8,
          weight: 3,
          draggable: !0
        }).addTo(t), this._mapModal.marker.on("dragend", () => {
          const r = this._mapModal.marker.getLatLng();
          this._updateLocationCoordinates(r.lat, r.lng);
        })), this._updateLocationCoordinates(i, o);
      });
    }
    _setupOutlineDrawing(t) {
      const e = ((this._config.radar || {}).local_features || [])[this._mapModal.index];
      this._mapModal.markers = [], e && e.points && e.points.length > 0 && (this._mapModal.points = [...e.points], this._updateOutlinePolyline(t)), t.on("click", (a) => {
        if (a.originalEvent.target.classList?.contains("leaflet-marker-icon") || a.originalEvent.target.closest(".leaflet-marker-icon")) return;
        const i = a.latlng.lat, o = a.latlng.lng;
        this._mapModal.points.push({
          lat: i,
          lon: o
        }), this._updateOutlinePolyline(t);
      });
    }
    _updateLocationCoordinates(t, e) {
      const a = this._shadowRoot.querySelector(".map-modal-instructions");
      a && (a.textContent = `Location: ${t.toFixed(4)}, ${e.toFixed(4)} - Click "Apply" to save`);
    }
    _updateOutlinePolyline(t) {
      this._mapModal.polygon && this._mapModal.polygon.remove(), this._mapModal.markers && (this._mapModal.markers.forEach((i) => i.remove()), this._mapModal.markers = []);
      const e = this._mapModal.points;
      if (e.length > 0) {
        const i = e.map((o) => [o.lat, o.lon]);
        this._mapModal.polygon = window.L.polyline(i, {
          color: "#ff9800",
          weight: 3
        }).addTo(t), e.forEach((o, r) => {
          const n = window.L.circleMarker([o.lat, o.lon], {
            radius: 8,
            color: "#ff9800",
            fillColor: "#fff",
            fillOpacity: 1,
            weight: 3,
            draggable: !0
          }).addTo(t);
          n.on("drag", () => {
            const l = n.getLatLng();
            this._mapModal.points[r] = {
              lat: l.lat,
              lon: l.lng
            };
            const s = this._mapModal.points.map((u) => [u.lat, u.lon]);
            this._mapModal.polygon.setLatLngs(s);
          }), n.on("contextmenu", (l) => {
            l.originalEvent.preventDefault(), this._removeOutlinePoint(r);
          }), this._mapModal.markers.push(n);
        });
      }
      const a = this._shadowRoot.querySelector(".map-modal-instructions");
      a && (a.textContent = `${e.length} points - Click to add, drag to move, right-click to remove, "Clear Last" to undo`);
    }
    _removeOutlinePoint(t) {
      this._mapModal && this._mapModal.points && t >= 0 && t < this._mapModal.points.length && (this._mapModal.points.splice(t, 1), this._updateOutlinePolyline(this._mapModal.map));
    }
    _clearLastOutlinePoint() {
      this._mapModal && this._mapModal.points && this._mapModal.points.length > 0 && (this._mapModal.points.pop(), this._updateOutlinePolyline(this._mapModal.map));
    }
    _applyMapSelection() {
      if (!this._mapModal) return;
      const t = this._config.radar || {}, e = [...t.local_features || []], a = this._mapModal.index;
      if (this._mapModal.type === "location" && this._mapModal.marker) {
        const i = this._mapModal.marker.getLatLng(), o = { ...e[a] };
        o.position = {
          lat: i.lat,
          lon: i.lng
        }, e[a] = o;
      } else if (this._mapModal.type === "outline" && this._mapModal.points && this._mapModal.points.length > 0) {
        const i = { ...e[a] };
        i.points = [...this._mapModal.points], e[a] = i;
      }
      this._config = {
        ...this._config,
        radar: {
          ...t,
          local_features: e
        }
      }, this._emitConfigChanged(), this._closeMapModal(), this._render();
    }
    _closeMapModal() {
      this._mapModal && this._mapModal.map && this._mapModal.map.remove(), this._mapModal = null;
      const t = this._shadowRoot.querySelector(".map-modal-overlay");
      t && t.classList.remove("open");
    }
    _renderModalOverlay() {
      let t = this._shadowRoot.querySelector(".map-modal-overlay");
      t || (t = document.createElement("div"), t.className = "map-modal-overlay", t.innerHTML = `
                <div class="map-modal">
                    <div class="map-modal-header">
                        <h3>${this._mapModal?.type === "location" ? "Select Location" : "Draw Outline"}</h3>
                        <button class="small-button" data-action="close-map-modal">Close</button>
                    </div>
                    <div class="map-modal-body">
                        <div class="map-modal-map"></div>
                    </div>
                    <div class="map-modal-footer">
                        <div class="map-modal-instructions">
                            ${this._mapModal?.type === "location" ? "Click on the map to select a location" : "Click on the map to add points to the outline"}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${this._mapModal?.type === "outline" ? '<button class="small-button" data-action="clear-last-point">Clear Last</button>' : ""}
                            <button class="small-button" data-action="close-map-modal">Cancel</button>
                            <button class="add-button small-button" data-action="apply-map-selection">Apply</button>
                        </div>
                    </div>
                </div>
            `, this._shadowRoot.appendChild(t), t.querySelector(".map-modal").addEventListener("click", (o) => o.stopPropagation()), t.addEventListener("click", () => this._closeMapModal()), t.querySelectorAll("[data-action]").forEach((o) => {
        o.addEventListener("click", (r) => {
          const n = r.target.getAttribute("data-action");
          n === "close-map-modal" ? this._closeMapModal() : n === "apply-map-selection" ? this._applyMapSelection() : n === "clear-last-point" && this._clearLastOutlinePoint();
        });
      })), t.classList.add("open");
      const e = t.querySelector(".map-modal-header h3");
      e && (e.textContent = this._mapModal?.type === "location" ? "Select Location" : "Draw Outline");
      const a = t.querySelector(".map-modal-instructions");
      a && (a.textContent = this._mapModal?.type === "location" ? "Click on the map to select a location" : "Click on the map to add points to the outline");
      const i = t.querySelector(".map-modal-footer > div:last-child");
      i && (i.innerHTML = `
                ${this._mapModal?.type === "outline" ? '<button class="small-button" data-action="clear-last-point">Clear Last</button>' : ""}
                <button class="small-button" data-action="close-map-modal">Cancel</button>
                <button class="add-button small-button" data-action="apply-map-selection">Apply</button>
            `, i.querySelectorAll("[data-action]").forEach((o) => {
        o.addEventListener("click", (r) => {
          const n = r.target.getAttribute("data-action");
          n === "close-map-modal" ? this._closeMapModal() : n === "apply-map-selection" ? this._applyMapSelection() : n === "clear-last-point" && this._clearLastOutlinePoint();
        });
      }));
    }
  }, customElements.define("flightradar24-radar-card-editor", G), !customElements.get("flightradar24-card-editor")) try {
    customElements.define("flightradar24-card-editor", class extends G {
    });
  } catch (t) {
    console.error("[FR24Card] Could not register flightradar24-card-editor alias:", t);
  }
}));
Ct();
var gt = "0.3.0";
gt !== "___CARD_VERSION___" && console.info(`%cFLIGHTRADAR24-CARD%c v${gt} `, "color: #236597; font-weight: bold", "color: inherit; font-weight: normal");
var kt = class extends HTMLElement {
  constructor() {
    super(), this._radarResizeObserver = null, this._zoomCleanup = null, this._updateRequired = !0, this._timer = null, this._unsubStateChangesPromise = null, this._intersectionObserver = null, this._visibilityChangeHandler = null;
    try {
      this.attachShadow({ mode: "open" }), this.cardState = new ht(), this.cardState.setRenderDynamic(() => this.renderDynamic());
    } catch (t) {
      console.error("[FR24Card] constructor error:", t), this.cardState = new ht();
    }
  }
  setConfig(t) {
    try {
      if (!t) throw new Error("Configuration is missing.");
      this.cardState._leafletMap && (this.cardState._leafletMap.remove(), this.cardState._leafletMap = null, this.cardState._currentMapConfig = void 0), this.cardState.setConfig(t), St(this.cardState, this), this.observeRadarResize();
    } catch (e) {
      console.error("[FR24Card] setConfig error:", e);
    }
  }
  static async getConfigElement(t) {
    await Promise.resolve().then(() => (Ct(), Qt));
    const e = document.createElement("flightradar24-radar-card-editor");
    return e.setConfig(t), e;
  }
  static getStubConfig(t) {
    return {
      flights_entity: Object.keys(t.states).filter((e) => e.includes("flightradar")).sort()[0] || "sensor.flightradar24_current_in_area",
      radar: {
        range: 50,
        min_range: 5,
        max_range: 100
      }
    };
  }
  set hass(t) {
    try {
      this.cardState.hass = t, this._unsubStateChangesPromise || (this._unsubStateChangesPromise = this.subscribeToStateChanges(t)), this._updateRequired && (this._updateRequired = !1, setTimeout(() => {
        this.fetchFlightsData(), requestAnimationFrame(() => {
          this.updateCardDimensions(), Ft(this.cardState, this.shadowRoot, () => {
            try {
              tt(this.cardState), X(this.cardState);
            } catch (e) {
              console.error("[FR24Card] Leaflet render error:", e);
            }
          }), requestAnimationFrame(() => {
            this.renderDynamic();
          });
        });
      }, 0));
    } catch (e) {
      console.error("[FR24Card] set hass error:", e);
    }
  }
  connectedCallback() {
    try {
      this.observeRadarResize(), this.observeVisibility();
    } catch (t) {
      console.error("[FR24Card] connectedCallback error:", t);
    }
  }
  disconnectedCallback() {
    try {
      this._radarResizeObserver && (this._radarResizeObserver.disconnect(), this._radarResizeObserver = null), this._intersectionObserver && (this._intersectionObserver.disconnect(), this._intersectionObserver = null), this._visibilityChangeHandler && (document.removeEventListener("visibilitychange", this._visibilityChangeHandler), this._visibilityChangeHandler = null), this.cardState._leafletMap && (this.cardState._leafletMap.remove(), this.cardState._leafletMap = null), this._zoomCleanup && (this._zoomCleanup(), this._zoomCleanup = null), this._unsubStateChangesPromise && (this._unsubStateChangesPromise.then((t) => t()), this._unsubStateChangesPromise = null);
    } catch (t) {
      console.error("[FR24Card] disconnectedCallback error:", t);
    }
  }
  updateCardDimensions() {
    try {
      const t = this.shadowRoot?.getElementById("radar"), e = t?.clientWidth || 400, a = t?.clientHeight || 400, i = this.cardState.radar.range, o = e / (i * 2);
      (e !== this.cardState.dimensions.width || a !== this.cardState.dimensions.height || i !== this.cardState.dimensions.range || o !== this.cardState.dimensions.scaleFactor) && (this.cardState.dimensions = {
        width: e,
        height: a,
        range: i,
        scaleFactor: o,
        centerX: e / 2,
        centerY: a / 2
      }, this.cardState.radar.hide !== !0 && (tt(this.cardState), X(this.cardState)));
    } catch (t) {
      console.error("[FR24Card] updateCardDimensions error:", t);
    }
  }
  observeRadarResize() {
    try {
      const t = this.shadowRoot?.getElementById("radar");
      if (!t) return;
      this._radarResizeObserver && this._radarResizeObserver.disconnect(), this._radarResizeObserver = new ResizeObserver(() => {
        try {
          this.updateCardDimensions(), this.cardState._leafletMap && requestAnimationFrame(() => {
            try {
              this.cardState._leafletMap?.invalidateSize({ pan: !1 }), Tt(this.cardState);
            } catch (e) {
              console.error("[FR24Card] ResizeObserver map refresh error:", e);
            }
          });
        } catch (e) {
          console.error("[FR24Card] ResizeObserver error:", e);
        }
      }), this._radarResizeObserver.observe(t), this._zoomCleanup && this._zoomCleanup(), this._zoomCleanup = bt(this.cardState, t);
    } catch (t) {
      console.error("[FR24Card] observeRadarResize error:", t);
    }
  }
  observeVisibility() {
    try {
      this._intersectionObserver && this._intersectionObserver.disconnect(), this._intersectionObserver = new IntersectionObserver((t) => {
        try {
          t.some((e) => e.isIntersecting) && this.invalidateMapOnVisible();
        } catch (e) {
          console.error("[FR24Card] IntersectionObserver error:", e);
        }
      }), this._intersectionObserver.observe(this), this._visibilityChangeHandler && document.removeEventListener("visibilitychange", this._visibilityChangeHandler), this._visibilityChangeHandler = () => {
        try {
          document.hidden || this.invalidateMapOnVisible();
        } catch (t) {
          console.error("[FR24Card] visibilitychange error:", t);
        }
      }, document.addEventListener("visibilitychange", this._visibilityChangeHandler);
    } catch (t) {
      console.error("[FR24Card] observeVisibility error:", t);
    }
  }
  invalidateMapOnVisible() {
    try {
      if (!this.cardState._leafletMap) return;
      const t = (e) => {
        requestAnimationFrame(() => {
          const a = this.cardState._leafletMap?.getContainer();
          if (!a || a.offsetWidth === 0 || a.offsetHeight === 0) {
            e > 0 && setTimeout(() => t(e - 1), 50);
            return;
          }
          try {
            this.cardState._leafletMap?.invalidateSize({ pan: !1 }), this.updateCardDimensions();
          } catch (i) {
            console.error("[FR24Card] invalidateMapOnVisible error:", i);
          }
        });
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          t(20);
        });
      });
    } catch (t) {
      console.error("[FR24Card] invalidateMapOnVisible error:", t);
    }
  }
  renderDynamic() {
    try {
      const t = this.shadowRoot?.getElementById("flights");
      if (!t) return;
      const e = document.createDocumentFragment();
      if (this.cardState.list && this.cardState.list.hide === !0) {
        t.style.display = "none";
        return;
      } else t.style.display = "";
      const a = this.cardState.config.filter ? this.cardState.selectedFlights && this.cardState.selectedFlights.length > 0 ? [{
        type: "OR",
        conditions: [{
          field: "id",
          comparator: "oneOf",
          value: this.cardState.selectedFlights
        }, {
          type: "AND",
          conditions: this.cardState.config.filter
        }]
      }] : this.cardState.config.filter : void 0, i = this.cardState.flights.length, o = a ? yt(this.cardState, a) : this.cardState.flights, r = o.length;
      if (o.sort(this.cardState.sortFn), this.cardState.radar.hide !== !0 && requestAnimationFrame(() => {
        try {
          X(this.cardState);
        } catch (n) {
          console.error("[FR24Card] requestAnimationFrame renderRadar error:", n);
        }
      }), this.cardState.list && this.cardState.list.showListStatus === !0 && i > 0) {
        this.cardState.flightsContext = {
          shown: r,
          total: i,
          filtered: o.length
        };
        const n = document.createElement("div");
        n.className = "list-status", n.innerHTML = ot(this.cardState, "list_status", null, (l) => (...s) => s?.filter((u) => u).join(l || " ")), e.appendChild(n);
      }
      if (r === 0) {
        if (this.cardState.config.no_flights_message !== "") {
          const n = document.createElement("div");
          n.className = "no-flights-message", n.textContent = this.cardState.config.no_flights_message || "", e.appendChild(n);
        }
      } else {
        const n = this.cardState.config.max_flights;
        (n && n > 0 ? o.slice(0, n) : o).forEach((l, s) => {
          const u = Ut(this.cardState, l);
          s === 0 && (u.className += " first"), e.appendChild(u);
        });
      }
      t.innerHTML = "", t.appendChild(e);
    } catch (t) {
      console.error("[FR24Card] renderDynamic error:", t);
    }
  }
  updateRadarRange(t) {
    try {
      const e = this.cardState.radar.min_range || 1, a = this.cardState.radar.max_range || Math.max(100, this.cardState.radar.initialRange || 35);
      let i = this.cardState.radar.range + t;
      i < e && (i = e), i > a && (i = a), this.cardState.radar.range = i, this.updateCardDimensions(), this.cardState.renderDynamicOnRangeChange && this.cardState.config.updateRangeFilterOnTouchEnd !== !0 && this.renderDynamic();
    } catch (e) {
      console.error("[FR24Card] updateRadarRange error:", e);
    }
  }
  subscribeToStateChanges(t) {
    try {
      if (!this.cardState.config.test && this.cardState.config.update !== !1) return t.connection.subscribeEvents((e) => {
        try {
          (e.data.entity_id === this.cardState.config.flights_entity || e.data.entity_id === this.cardState.config.location_tracker) && (this._updateRequired = !0);
        } catch (a) {
          console.error("[FR24Card] subscribeEvents callback error:", a);
        }
      }, "state_changed");
    } catch (e) {
      console.error("[FR24Card] subscribeToStateChanges error:", e);
    }
    return Promise.resolve(() => {
    });
  }
  fetchFlightsData() {
    try {
      this._timer && (clearInterval(this._timer), this._timer = null);
      const t = this.cardState.hass?.states[this.cardState.config.flights_entity || ""];
      if (t) try {
        this.cardState.flights = parseFloat(t.state) > 0 && t.attributes.flights ? JSON.parse(JSON.stringify(t.attributes.flights)) : [];
      } catch (a) {
        console.error("Error fetching or parsing flight data:", a), this.cardState.flights = [];
      }
      else throw new Error("Flights entity state is undefined. Check the configuration.");
      const { moving: e } = this.calculateFlightData();
      this.cardState.config.projection_interval && (e && !this._timer ? this._timer = setInterval(() => {
        try {
          if (this.cardState.hass) {
            const { projected: a } = this.calculateFlightData();
            a && this.renderDynamic();
          }
        } catch (a) {
          console.error("[FR24Card] projectionInterval setInterval error:", a);
        }
      }, this.cardState.config.projection_interval * 1e3) : !e && this._timer && (clearInterval(this._timer), this._timer = null));
    } catch (t) {
      console.error("[FR24Card] fetchFlightsData error:", t);
    }
  }
  calculateFlightData() {
    try {
      let t = !1, e = !1;
      const a = Date.now() / 1e3, i = W(this.cardState);
      if (i) {
        const o = i.latitude, r = i.longitude;
        this.cardState.flights.forEach((n) => {
          n._timestamp || (n._timestamp = a), e = e || n.ground_speed > 0;
          const l = a - (n._timestamp || a);
          if (l > 1) {
            t = !0, n._timestamp = a;
            const s = K(n.latitude, n.longitude, n.heading, n.ground_speed * 1.852 / 3600 * l);
            n.latitude = s.lat, n.longitude = s.lon;
            const u = Math.max(n.altitude + l / 60 * n.vertical_speed, 0);
            (n.landed || u !== n.altitude && u === 0) && (n.landed = !0, n.ground_speed = Math.max(n.ground_speed - 15 * l, 15)), n.altitude = u;
          }
          if (n.distance_to_tracker = N(o, r, n.latitude, n.longitude, this.cardState.units.distance), n.heading_from_tracker = V(o, r, n.latitude, n.longitude), n.cardinal_direction_from_tracker = At(n.heading_from_tracker), n.is_approaching = lt((n.heading_from_tracker + 180) % 360, n.heading), n.is_receding = lt(n.heading_from_tracker, n.heading), n.is_approaching) {
            let s = Et(o, r, n.latitude, n.longitude, n.heading);
            n.closest_passing_distance = Math.round(N(o, r, s.lat, s.lon, this.cardState.units.distance));
            const u = this.calculateETA(n.latitude, n.longitude, s.lat, s.lon, n.ground_speed);
            if (n.eta_to_closest_distance = Math.round(u), n.vertical_speed < 0 && n.altitude > 0) {
              const b = n.altitude / Math.abs(n.vertical_speed), _ = K(n.latitude, n.longitude, n.heading, n.ground_speed * b / 60), m = N(o, r, _.lat, _.lon, this.cardState.units.distance);
              b < u && (n.is_landing = !0, n.closest_passing_distance = Math.round(m), n.eta_to_closest_distance = Math.round(b), s = _);
            }
            n.heading_from_tracker_to_closest_passing = Math.round(V(o, r, s.lat, s.lon));
          } else
            delete n.closest_passing_distance, delete n.eta_to_closest_distance, delete n.heading_from_tracker_to_closest_passing, delete n.is_landing;
        });
      } else console.error("Tracker state is undefined. Make sure the location tracker entity ID is correct.");
      return {
        projected: t,
        moving: e
      };
    } catch (t) {
      return console.error("[FR24Card] calculateFlightData error:", t), {
        projected: !1,
        moving: !1
      };
    }
  }
  calculateETA(t, e, a, i, o) {
    try {
      const r = N(t, e, a, i, this.cardState.units.distance);
      return o === 0 ? 1 / 0 : r / (o * (this.cardState.units.distance === "km" ? 1.852 : 1.15078) / 60);
    } catch (r) {
      return console.error("[FR24Card] calculateETA error:", r), 1 / 0;
    }
  }
  toggleSelectedFlight(t) {
    try {
      this.cardState.selectedFlights || (this.cardState.selectedFlights = []), this.cardState.selectedFlights.includes(t.id) ? this.cardState.selectedFlights = this.cardState.selectedFlights.filter((e) => e !== t.id) : this.cardState.selectedFlights.push(t.id), this.renderDynamic();
    } catch (e) {
      console.error("[FR24Card] toggleSelectedFlight error:", e);
    }
  }
  get hass() {
    return this.cardState.hass;
  }
};
customElements.define("flightradar24-radar-card", kt);
if (!customElements.get("flightradar24-card")) try {
  customElements.define("flightradar24-card", class extends kt {
  });
} catch (t) {
  console.error("[FR24Card] Could not register flightradar24-card alias:", t);
}
typeof window < "u" && (window.customCards = window.customCards || [], window.customCards.push({
  type: "flightradar24-radar-card",
  name: "Flightradar24 Radar Card",
  preview: !0,
  description: "A custom card for displaying Flightradar24 flight tracking data.",
  getEntitySuggestion: (t, e) => {
    const a = t.states[e];
    return !a || !Array.isArray(a.attributes?.flights) ? null : { config: {
      type: "custom:flightradar24-radar-card",
      flights_entity: e
    } };
  }
}));
