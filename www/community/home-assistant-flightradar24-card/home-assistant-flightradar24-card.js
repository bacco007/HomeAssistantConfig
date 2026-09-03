var ft = Object.defineProperty, Q = (t, e) => () => (t && (e = t(t = 0)), e), St = (t, e) => {
  let a = {};
  for (var i in t)
    ft(a, i, {
      get: t[i],
      enumerable: !0
    });
  return e || ft(a, Symbol.toStringTag, { value: "Module" }), a;
};
function Dt(t, e) {
  const a = e.querySelector("style[data-fr24-style]");
  a && a.remove();
  const i = t.radar, o = i["background-color"] || i["primary-color"] || "var(--dark-primary-color)", r = i["aircraft-color"] || i["accent-color"] || "var(--accent-color)", n = i["aircraft-selected-color"] || i["aircraft-color"] || i["accent-color"] || "var(--accent-color)", d = i["radar-grid-color"] || i["feature-color"] || "var(--secondary-text-color)", l = i["local-features-color"] || i["feature-color"] || i["radar-grid-color"] || "var(--secondary-text-color)", u = i["callsign-label-color"] || "var(--primary-background-color)", _ = i["background-opacity"] !== void 0 ? Math.max(0, Math.min(1, i["background-opacity"])) : 0.05, m = i.radar_size !== void 0 ? Math.max(30, Math.min(90, i.radar_size)) : 70, g = (100 - m) / 2, y = t.config.scale !== void 0 ? Math.max(0.5, Math.min(3, t.config.scale)) : 1, k = document.createElement("style");
  k.setAttribute("data-fr24-style", "1"), k.textContent = `
    :host {
      --radar-background-color: ${o};
      --radar-aircraft-color: ${r};
      --radar-aircraft-selected-color: ${n};
      --radar-grid-color: ${d};
      --radar-local-features-color: ${l};
      --radar-callsign-label-color: ${u};
    }
    #flights-card {
      padding: 16px;
      transform: scale(${y});
      transform-origin: top center;
      container-type: inline-size;
    }
    #layout-root {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    /*
      Responsive list position: when the list is configured to sit on the
      left or right of the radar/map, only keep it side by side when the card
      is wide enough. Narrower cards fall back to the stacked "below" layout.
    */
    @container (min-width: 560px) {
      #layout-root.layout-left,
      #layout-root.layout-right {
        flex-direction: row;
        align-items: stretch;
        gap: 16px;
      }
      #layout-root.layout-left #radar-container,
      #layout-root.layout-right #radar-container {
        flex: 1 1 60%;
        min-width: 0;
      }
      #layout-root.layout-left #flights,
      #layout-root.layout-right #flights {
        flex: 1 1 40%;
        min-width: 0;
      }
      #layout-root.layout-left #flights {
        order: -1;
      }
    }
    #flights {
      padding: 0px;
      min-width: 0;
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
      min-width: 0;
    }
    #radar-overlay {
      position: absolute;
      width: ${m}%;
      left: ${g}%;
      padding: 0 0 ${m}% 0;
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
      width: ${m}%;
      height: 0;
      margin: 0 ${g}%;
      padding-bottom: ${m}%;
      margin-bottom: 5%;
      border-radius: 50%;
      overflow: hidden;
    }
    /* Square map view: full-bleed square map instead of the circular radar screen */
    #layout-root.view-map #radar {
      width: 100%;
      margin: 0;
      padding-bottom: 100%;
      border-radius: 0;
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
      opacity: ${_};
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
  `, e.appendChild(k);
}
function zt(t, e) {
  if (!e) return;
  e.innerHTML = "";
  const a = t.config.toggles || {}, i = !!window.customElements && !!customElements.get("ha-switch");
  Object.keys(a).forEach((o) => {
    const r = a[o], n = document.createElement("div");
    n.className = "toggle";
    const d = document.createElement("label");
    d.textContent = r.label || o, n.appendChild(d);
    let l;
    i ? l = document.createElement("ha-switch") : (l = document.createElement("input"), l.type = "checkbox"), l.checked = r.default === !0, l.addEventListener("change", () => {
      t.setToggleValue && t.setToggleValue(o, l.checked);
    }), n.appendChild(l), e.appendChild(n);
  });
}
function N(t) {
  return t * (Math.PI / 180);
}
function it(t) {
  return t * (180 / Math.PI);
}
function j(t, e, a, i, o = "km") {
  const n = N(a - t), d = N(i - e), l = Math.sin(n / 2) * Math.sin(n / 2) + Math.cos(N(t)) * Math.cos(N(a)) * Math.sin(d / 2) * Math.sin(d / 2), u = 2 * Math.atan2(Math.sqrt(l), Math.sqrt(1 - l));
  return o === "km" ? 6371 * u : 6371 * u / 1.60934;
}
function V(t, e, a, i) {
  const o = N(i - e), r = Math.sin(o) * Math.cos(N(a)), n = Math.cos(N(t)) * Math.sin(N(a)) - Math.sin(N(t)) * Math.cos(N(a)) * Math.cos(o);
  return (it(Math.atan2(r, n)) + 360) % 360;
}
function nt(t, e, a, i) {
  const r = N(a), n = N(t), d = N(e), l = i / 6371, u = Math.asin(Math.sin(n) * Math.cos(l) + Math.cos(n) * Math.sin(l) * Math.cos(r)), _ = d + Math.atan2(Math.sin(r) * Math.sin(l) * Math.cos(n), Math.cos(l) - Math.sin(n) * Math.sin(u));
  return {
    lat: it(u),
    lon: it(_)
  };
}
function Pt(t, e, a, i, o) {
  const r = V(a, i, t, e), n = Math.abs((o - r + 360) % 360);
  return nt(a, i, o, j(t, e, a, i) * Math.cos(N(n)));
}
function Nt(t) {
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
function ht(t, e, a = 60) {
  const i = Math.abs((t - e + 360) % 360);
  return i <= a || i >= 360 - a;
}
function K(t) {
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
function tt(t) {
  if (t)
    return Ct.get(t);
}
function xt(t) {
  return !!tt(t)?.apiKeyParam;
}
function gt(t) {
  return tt(t)?.apiKeyHelp || "";
}
function jt(t, e) {
  const a = tt(t);
  return a ? a.apiKeyParam && e && e.trim().length > 0 ? a.url + a.apiKeyParam + encodeURIComponent(e.trim()) : a.url : "";
}
var X, Ct, J, $t = Q((() => {
  X = [
    {
      id: "color",
      label: "Color (OpenStreetMap)",
      group: "keyless",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c"
      ]
    },
    {
      id: "satellite",
      label: "Satellite",
      group: "keyless",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
      subdomains: []
    },
    {
      id: "topo",
      label: "Topographic",
      group: "keyless",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenTopoMap, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c"
      ]
    },
    {
      id: "light",
      label: "Light (CARTO)",
      group: "keyed",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      apiKeyParam: "?key=",
      apiKeyHelp: 'Required for Light, Dark and Voyager. <a href="https://carto.com/basemaps/apikey" target="_blank" rel="noopener noreferrer">Request a free CARTO key</a>.',
      attribution: "&copy; CartoDB, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c",
        "d"
      ]
    },
    {
      id: "dark",
      label: "Dark (CARTO)",
      group: "keyed",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      apiKeyParam: "?key=",
      apiKeyHelp: 'Required for Light, Dark and Voyager. <a href="https://carto.com/basemaps/apikey" target="_blank" rel="noopener noreferrer">Request a free CARTO key</a>.',
      attribution: "&copy; CartoDB, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c",
        "d"
      ]
    },
    {
      id: "voyager",
      label: "Voyager (CARTO)",
      group: "keyed",
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      apiKeyParam: "?key=",
      apiKeyHelp: 'Required for Light, Dark and Voyager. <a href="https://carto.com/basemaps/apikey" target="_blank" rel="noopener noreferrer">Request a free CARTO key</a>.',
      attribution: "&copy; CartoDB, &copy; OpenStreetMap contributors",
      subdomains: [
        "a",
        "b",
        "c",
        "d"
      ]
    },
    {
      id: "bw",
      label: "Black &amp; White (Stadia)",
      group: "keyed",
      url: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
      apiKeyParam: "?api_key=",
      apiKeyHelp: 'Required for Black &amp; White and Outlines. <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">Get a free Stadia Maps key</a>.',
      attribution: "Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap",
      subdomains: []
    },
    {
      id: "outlines",
      label: "Outlines (Stadia)",
      group: "keyed",
      url: "https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}.png",
      apiKeyParam: "?api_key=",
      apiKeyHelp: 'Required for Black &amp; White and Outlines. <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">Get a free Stadia Maps key</a>.',
      attribution: "Map tiles by Stamen Design, hosted by Stadia Maps; Data by OpenStreetMap",
      subdomains: []
    }
  ], Ct = new Map(X.map((t) => [t.id, t])), J = new Set(X.map((t) => t.id));
}));
$t();
function Mt(t) {
  const e = t?.radar;
  if (!e || e.hide === !0) return !1;
  const a = t?.config?.radar?.background_map, i = !!a && (J.has(a) || a === "system");
  return e.view === "map" ? !a || i : !a || a === "none" ? !1 : i;
}
function qt() {
  const t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  let e = !1;
  try {
    e = !!(window.parent && window.parent.document && window.parent.document.body.classList.contains("dark"));
  } catch {
  }
  return e || t;
}
function Bt(t, e, a) {
  if (!Mt(t)) {
    t.radar?.hide !== !0 && a();
    return;
  }
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
function Ht(t, e) {
  const { config: a, dimensions: i } = t;
  if (!Mt(t)) {
    t._leafletMap && (t._leafletMap.remove(), t._leafletMap = null);
    const E = e.querySelector("#radar-map-bg");
    E && E.remove();
    return;
  }
  const o = a?.radar?.background_map;
  let r = o;
  t.radar?.view === "map" && (!o || o === "none" || !J.has(o)) && (r = "system");
  const n = t.radar?.view === "map" ? 1 : typeof a?.radar?.background_map_opacity == "number" ? Math.max(0, Math.min(1, a.radar.background_map_opacity)) : 1;
  let d = e.querySelector("#radar-map-bg");
  d ? d.style.opacity = String(n) : (d = document.createElement("div"), d.id = "radar-map-bg", d.style.position = "absolute", d.style.top = "0", d.style.left = "0", d.style.width = "100%", d.style.height = "100%", d.style.zIndex = "0", d.style.pointerEvents = "none", d.style.opacity = String(n), e.appendChild(d)), d.style.transform = "", t._leafletMap && t._leafletMap.getContainer() !== d && (t._leafletMap.remove(), t._leafletMap = null);
  const l = K(t), u = Math.max(i?.range || 1, 1), _ = t.units?.distance === "miles" ? u * 1.60934 : u, m = l?.latitude || 0, g = l?.longitude || 0, y = Math.PI / 180, k = 111.13209 - 0.56605 * Math.cos(2 * m * y) + 12e-4 * Math.cos(4 * m * y), A = 111.32 * Math.cos(m * y) - 0.094 * Math.cos(3 * m * y), R = _ / k, F = _ / A, S = [[m - R, g - F], [m + R, g + F]];
  let x, $;
  r === "system" ? qt() ? (x = a?.radar?.background_map_dark || "dark", $ = a?.radar?.background_map_dark_api_key || "") : (x = a?.radar?.background_map_light || "color", $ = a?.radar?.background_map_light_api_key || "") : (x = o && J.has(o) ? o : "color", $ = a?.radar?.background_map_api_key || "");
  const C = tt(x);
  if (!C) return d;
  const M = jt(x, $);
  if (!M) return d;
  const w = {
    attribution: C.attribution,
    subdomains: C.subdomains
  };
  if (xt(x) && !($ && $.trim().length > 0))
    return t._leafletMap && (t._leafletMap.remove(), t._leafletMap = null), d.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--secondary-text-color); text-align: center; padding: 20px; font-size: 0.9em;">API key required for this map type. Configure in Background Map settings.</div>', d;
  if (t._leafletMap || (d.innerHTML = ""), window.L) {
    const E = {
      type: x,
      apiKey: $
    }, L = !t._currentMapConfig || t._currentMapConfig.type !== E.type || t._currentMapConfig.apiKey !== E.apiKey;
    t._leafletMap ? L && (t._leafletMap.eachLayer((O) => {
      t._leafletMap.removeLayer(O);
    }), window.L.tileLayer(M, w).addTo(t._leafletMap), t._currentMapConfig = E) : (t._leafletMap = window.L.map(d, {
      attributionControl: !1,
      zoomControl: !1,
      dragging: !1,
      scrollWheelZoom: !1,
      boxZoom: !1,
      doubleClickZoom: !1,
      keyboard: !1,
      touchZoom: !1,
      pointerEvents: !1
    }), window.L.tileLayer(M, w).addTo(t._leafletMap), t._currentMapConfig = E), Lt(t._leafletMap, d, S, _), t.mapCenter = {
      lat: Math.round(m * 100) / 100,
      lon: Math.round(g * 100) / 100
    }, t.mapZoom = Math.round(t._leafletMap.getZoom());
  }
  return d;
}
function Lt(t, e, a, i, o = 15) {
  e.offsetHeight;
  const r = t.getContainer(), n = r.offsetWidth, d = r.offsetHeight;
  if (n > 0 && d > 0) {
    t.fitBounds(a, {
      animate: !1,
      padding: [0, 0]
    });
    const l = window.L.point(0, d / 2), u = window.L.point(n, d / 2), _ = t.containerPointToLatLng(l), m = t.containerPointToLatLng(u), g = j(_.lat, _.lng, m.lat, m.lng, "km") / (i * 2);
    e.style.transform = `scale(${g})`;
  } else o > 0 && setTimeout(() => {
    Lt(t, e, a, i, o - 1);
  }, 50);
}
function Vt(t) {
  const e = t._leafletMap;
  if (!e) return;
  const a = K(t), i = Math.max(t.dimensions?.range || 1, 1), o = t.units?.distance === "miles" ? i * 1.60934 : i, r = a?.latitude || 0, n = a?.longitude || 0, d = Math.PI / 180, l = 111.13209 - 0.56605 * Math.cos(2 * r * d) + 12e-4 * Math.cos(4 * r * d), u = 111.32 * Math.cos(r * d) - 0.094 * Math.cos(3 * r * d), _ = o / l, m = o / u, g = [[r - _, n - m], [r + _, n + m]], y = e.getContainer();
  y.offsetHeight;
  const k = y.offsetWidth, A = y.offsetHeight;
  if (k > 0 && A > 0) {
    e.fitBounds(g, {
      animate: !1,
      padding: [0, 0]
    });
    const R = window.L.point(0, A / 2), F = window.L.point(k, A / 2), S = e.containerPointToLatLng(R), x = e.containerPointToLatLng(F), $ = j(S.lat, S.lng, x.lat, x.lng, "km") / (o * 2);
    y.style.transform = `scale(${$})`;
  }
}
function Et(t = {}, e, a = []) {
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
    const d = r[1];
    n[d] || (n[d] = Et(t, d, [...a, e])), i = i.replace(`tpl.${d}`, "(`" + n[d] + '`).replace(/^undefined$/, "")');
  }
  return t["compiled_" + e] = i, i;
}
function pt(t, e, a, i) {
  const o = t.templates || {}, r = t.flightsContext || {}, n = t.units || {
    distance: "km",
    altitude: "ft",
    speed: "kts"
  }, d = t.radar || { range: 35 }, l = Et(o, e);
  try {
    const u = new Function("flights", "flight", "tpl", "units", "radar_range", "joinList", `return \`${l.replace(/\${(.*?)}/g, (_, m) => `\${${m}}`)}\``)(r, a, {}, n, Math.round(d.range), i);
    return u !== "undefined" ? u : "";
  } catch (u) {
    return console.error("Error when rendering: " + l, u), "";
  }
}
function ot(t, e, a, i) {
  const { defines: o = {}, config: r = {}, radar: n = { range: 35 }, selectedFlights: d = [] } = t;
  if (typeof e == "string" && e.startsWith("${") && e.endsWith("}")) {
    const l = e.slice(2, -1);
    if (l === "selectedFlights") return d;
    if (l === "radar_range")
      return i && i(!0), n.range;
    if (l in o) return o[l];
    if (r.toggles && l in r.toggles) return r.toggles[l].default;
    if (a !== void 0) return a;
    console.error("Unresolved placeholder: " + l), console.debug("Defines", o);
  }
  return e;
}
function rt(t, e) {
  if (!t) return "";
  try {
    const a = new Function("map_lat", "map_lon", "zoom", "radar_range", "click_lat", "click_lon", "flight", "entity", "return `" + t.replace(/\${(.*?)}/g, "${$1}") + "`")(e.map_lat, e.map_lon, e.zoom, e.radar_range, e.click_lat, e.click_lon, e.flight ?? null, e.entity ?? null);
    return a !== "undefined" ? a : "";
  } catch (a) {
    return console.error("Error rendering URL path:", t, a), t;
  }
}
function st(t) {
  const { units: e, radar: a, dom: i, dimensions: o, hass: r } = t, n = i?.radarInfoDisplay || i && i.radarContainer?.querySelector("#radar-info");
  n && (n.innerHTML = [a?.hide_range !== !0 ? pt(t, "radar_range", null, void 0) : ""].filter((x) => x).join("<br />"));
  const d = i?.radarScreen || i && i.radarContainer?.querySelector("#radar-screen") || t.mainCard?.shadowRoot && t.mainCard.shadowRoot.getElementById("radar-screen");
  if (!d) return;
  Array.from(d.childNodes).forEach((x) => {
    const $ = x;
    $.id !== "radar-map-bg" && $.id !== "radar-screen-background" && d.removeChild(x);
  });
  let l = d.querySelector("#radar-screen-background");
  l || (l = document.createElement("div"), l.id = "radar-screen-background", d.appendChild(l));
  const u = K(t);
  t.mapCenter = {
    lat: Math.round(u.latitude * 100) / 100,
    lon: Math.round(u.longitude * 100) / 100
  }, t._leafletMap || (t.mapZoom = 8), Ht(t, d);
  const { width: _, height: m, range: g, scaleFactor: y, centerX: k, centerY: A } = o || {};
  if (!_ || !m || !g || !y || k == null || A == null) return;
  const R = g * 1.15;
  if (a?.rings ?? a?.view !== "map") {
    const x = a?.ring_distance ?? 10, $ = Math.floor(g / x);
    for (let C = 1; C <= $; C++) {
      const M = C * x * y, w = document.createElement("div");
      w.className = "ring", w.style.width = w.style.height = M * 2 + "px", w.style.top = Math.floor(A - M) + "px", w.style.left = Math.floor(k - M) + "px", d.appendChild(w);
    }
    for (let C = 0; C < 360; C += 45) {
      const M = document.createElement("div");
      M.className = "dotted-line", M.style.transform = `rotate(${C - 90}deg)`, d.appendChild(M);
    }
  }
  const F = K(t), S = a?.local_features;
  if (S && r && F) {
    const x = F.latitude, $ = F.longitude;
    S.forEach((C) => {
      if (!(C.max_range && a.range && C.max_range <= a.range)) {
        if (C.type === "outline" && C.points && C.points.length > 1) for (let M = 0; M < C.points.length - 1; M++) {
          const w = C.points[M], E = C.points[M + 1], L = j(x, $, w.lat, w.lon, e.distance), O = j(x, $, E.lat, E.lon, e.distance);
          if (L <= R || O <= R) {
            const z = V(x, $, w.lat, w.lon), T = V(x, $, E.lat, E.lon), c = k + Math.cos((z - 90) * Math.PI / 180) * L * y, p = A + Math.sin((z - 90) * Math.PI / 180) * L * y, s = k + Math.cos((T - 90) * Math.PI / 180) * O * y, h = A + Math.sin((T - 90) * Math.PI / 180) * O * y, v = document.createElement("div");
            v.className = "outline-line", v.style.width = Math.hypot(s - c, h - p) + "px", v.style.height = "1px", v.style.top = p + "px", v.style.left = c + "px", v.style.transformOrigin = "0 0", v.style.transform = `rotate(${Math.atan2(h - p, s - c) * (180 / Math.PI)}deg)`, d.appendChild(v);
          }
        }
        else if ("position" in C && C.position) {
          const { lat: M, lon: w } = C.position, E = j(x, $, M, w, e.distance);
          if (E <= R) {
            const L = V(x, $, M, w), O = k + Math.cos((L - 90) * Math.PI / 180) * E * y, z = A + Math.sin((L - 90) * Math.PI / 180) * E * y;
            if (C.type === "runway") {
              const T = C.heading ?? 0, c = C.length ?? 0, p = e.distance === "km" ? c * 3048e-7 : c * 18939e-8, s = document.createElement("div");
              s.className = "runway", s.style.width = p * y + "px", s.style.height = "1px", s.style.top = z + "px", s.style.left = O + "px", s.style.transformOrigin = "0 50%", s.style.transform = `rotate(${T - 90}deg)`, d.appendChild(s);
            }
            if (C.type === "location") {
              const T = document.createElement("div");
              T.className = "location-dot";
              const c = C.label;
              if (T.title = c ?? "Location", T.style.top = z + "px", T.style.left = O + "px", d.appendChild(T), c) {
                const p = document.createElement("div");
                p.className = "location-label", p.textContent = c || "Location", d.appendChild(p);
                const s = p.getBoundingClientRect(), h = s.width, v = s.height;
                p.style.top = z - v - 4 + "px", p.style.left = O - h / 2 + "px";
              }
            }
          }
        }
      }
    });
  }
}
function At(t, e) {
  let a = null, i = null;
  function o(u) {
    const _ = u[0], m = u[1], g = _.clientX - m.clientX, y = _.clientY - m.clientY;
    return Math.sqrt(g * g + y * y);
  }
  function r(u) {
    u.preventDefault();
    const _ = Math.sign(u.deltaY);
    t.radar.range += _ * 2;
    const m = t.radar.min_range || 1, g = t.radar.max_range || Math.max(100, t.radar.initialRange || 35);
    t.radar.range < m && (t.radar.range = m), t.radar.range > g && (t.radar.range = g), t.mainCard.updateRadarRange(_ * 2);
  }
  function n(u) {
    u.touches.length === 2 && (a = o(u.touches), i = t.radar.range);
  }
  function d(u) {
    if (u.touches.length === 2 && a !== null && i !== null) {
      u.preventDefault();
      const _ = o(u.touches), m = a / _, g = t.radar.min_range || 1, y = t.radar.max_range || Math.max(100, t.radar.initialRange || 35);
      let k = Math.round(i * m);
      k < g && (k = g), k > y && (k = y), t.radar.range = k, t.mainCard.updateRadarRange(0);
    }
  }
  function l() {
    a !== null && (a = null, i = null, t.config.updateRangeFilterOnTouchEnd && t.renderDynamicOnRangeChange && t.mainCard.renderDynamic());
  }
  return e && (e.addEventListener("wheel", r, { passive: !1 }), e.addEventListener("touchstart", n, { passive: !0 }), e.addEventListener("touchmove", d, { passive: !1 }), e.addEventListener("touchend", l, { passive: !0 })), () => {
    e && (e.removeEventListener("wheel", r), e.removeEventListener("touchstart", n), e.removeEventListener("touchmove", d), e.removeEventListener("touchend", l));
  };
}
function Ut(t, e, a) {
  const i = t.config?.tap_action;
  if (!i) return;
  const o = t.dom?.radar;
  if (!o) {
    ct(rt(i, {
      map_lat: t.mapCenter?.lat,
      map_lon: t.mapCenter?.lon,
      zoom: t.mapZoom,
      radar_range: t.radar?.range,
      entity: dt(t)
    }));
    return;
  }
  const r = o.getBoundingClientRect(), n = e - r.left, d = a - r.top, l = r.width, u = r.height, _ = t.units?.distance === "miles" ? (t.radar?.range || 1) * 1.60934 : t.radar?.range || 1, m = l / 2, g = u / 2, y = n - m, k = d - g, A = Math.sqrt(y * y + k * k) / Math.min(m, g) * _, R = (Math.atan2(y, -k) * (180 / Math.PI) + 360) % 360, F = t.mapCenter?.lat || 0, S = t.mapCenter?.lon || 0, x = R * Math.PI / 180, $ = 111.32, C = 111.32 * Math.cos(F * Math.PI / 180), M = Math.round((F + A / $ * Math.cos(x)) * 100) / 100, w = Math.round((S + A / C * Math.sin(x)) * 100) / 100;
  ct(rt(i, {
    map_lat: t.mapCenter?.lat,
    map_lon: t.mapCenter?.lon,
    zoom: t.mapZoom,
    radar_range: t.radar?.range,
    click_lat: M,
    click_lon: w,
    entity: dt(t)
  }));
}
function lt(t, e) {
  const a = (t.config?.flight_tap_action || "toggle").split("|").map((r) => r.trim()), i = a.includes("toggle"), o = a.find((r) => r !== "toggle") || "";
  i && t.toggleSelectedFlight(e), o && ct(rt(o, {
    map_lat: t.mapCenter?.lat,
    map_lon: t.mapCenter?.lon,
    zoom: t.mapZoom,
    radar_range: t.radar?.range,
    flight: e,
    entity: dt(t)
  }));
}
function dt(t) {
  const e = t.config?.flights_entity;
  if (!e || !t.hass?.states) return;
  const a = t.hass.states[e];
  if (a)
    return a;
}
function ct(t) {
  t && window.open(t, "_blank");
}
function Wt(t, e) {
  e.shadowRoot.innerHTML = "";
  const a = document.createElement("ha-card");
  a.id = "flights-card";
  const i = document.createElement("div");
  i.id = "layout-root";
  const o = t.list?.position || "below";
  if (i.classList.add(`layout-${o}`), t.radar?.view === "map" && i.classList.add("view-map"), !t.radar?.hide) {
    const n = document.createElement("div");
    n.id = "radar-container";
    const d = document.createElement("div");
    d.id = "radar-overlay", n.appendChild(d);
    const l = document.createElement("div");
    l.id = "radar-info", n.appendChild(l);
    const u = document.createElement("div");
    u.id = "toggle-container";
    const _ = document.createElement("div");
    _.id = "radar";
    const m = document.createElement("div");
    m.id = "radar-screen", _.appendChild(m);
    const g = document.createElement("div");
    g.id = "tracker", _.appendChild(g);
    const y = document.createElement("div");
    y.id = "planes", _.appendChild(y), n.appendChild(_), n.appendChild(u), i.appendChild(n), requestAnimationFrame(() => {
      st(t), e.observeRadarResize(), At(t, _), _.addEventListener("click", (k) => {
        k.composedPath().some((A) => A.classList?.contains?.("plane")) || Ut(t, k.clientX, k.clientY);
      });
    }), t.dom = t.dom || {}, t.dom.toggleContainer = u, t.dom.planesContainer = y, t.dom.radar = _, t.dom.radarScreen = m, t.dom.radarInfoDisplay = l, t.dom.radarContainer = n, t.dom.shadowRoot = e.shadowRoot, t.mainCard = e;
  }
  const r = document.createElement("div");
  r.id = "flights", t.list && t.list.hide === !0 && (r.style.display = "none"), i.appendChild(r), a.appendChild(i), e.shadowRoot.appendChild(a), Dt(t, e.shadowRoot), t.dom?.toggleContainer && zt(t, t.dom.toggleContainer);
}
function Rt(t, e) {
  return (t.flights || []).filter((a) => Ot(t, a, e));
}
function Ot(t, e, a) {
  return Array.isArray(a) ? a.every((i) => U(t, e, i)) : U(t, e, a);
}
function U(t, e, a) {
  let i = !0;
  if (a.type === "AND" && a.conditions) i = a.conditions.every((o) => U(t, e, o));
  else if (a.type === "OR" && a.conditions) i = a.conditions.some((o) => U(t, e, o));
  else if (a.type === "NOT" && a.condition) i = !U(t, e, a.condition);
  else {
    const { field: o, defined: r, defaultValue: n, comparator: d } = a, l = ot(t, a.value), u = o ? e[o] : r ? ot(t, "${" + r + "}", n) : void 0;
    switch (d) {
      case "eq":
        i = u === l;
        break;
      case "lt":
        i = Number(u) < Number(l);
        break;
      case "lte":
        i = Number(u) <= Number(l);
        break;
      case "gt":
        i = Number(u) > Number(l);
        break;
      case "gte":
        i = Number(u) >= Number(l);
        break;
      case "oneOf":
        i = (Array.isArray(l) ? l : typeof l == "string" ? l.split(",").map((_) => _.trim()) : []).includes(u);
        break;
      case "containsOneOf": {
        const _ = Array.isArray(l) ? l : typeof l == "string" ? l.split(",").map((m) => m.trim()) : [];
        i = !!u && _.some((m) => u.includes(m));
        break;
      }
      default:
        i = !1;
    }
  }
  return a.debugIf === i && console.debug("applyCondition", a, e, i), i;
}
var Kt = 12, mt = /* @__PURE__ */ new Map(), _t = /* @__PURE__ */ new Map();
function Yt(t) {
  if (!t) return [0, 0];
  const e = t.split(",").map(Number);
  return [e[0] || 0, e[1] || 0];
}
function Gt(t) {
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
function Xt(t) {
  const e = mt.get(t);
  if (e) return e;
  const a = new Promise((i, o) => {
    const r = new Image();
    r.onload = () => i(r), r.onerror = () => o(/* @__PURE__ */ new Error(`Failed to load marker image: ${t}`)), r.src = t;
  });
  return mt.set(t, a), a;
}
function Zt(t, e) {
  const a = t.width, i = t.height, o = a / Kt, r = e["aircraft-marker-color-overlay"], n = e["aircraft-marker-outline-width"] ?? 0, d = e["aircraft-marker-outline-color"] || "#000000", l = e["aircraft-marker-shadow"] || "", u = Gt(l), _ = Math.round(u.offsetX * o), m = Math.round(u.offsetY * o), g = Math.round(u.blur * o), y = Math.ceil(n * o), k = Math.max(1, Math.round(y * 0.4)), A = Math.ceil(Math.max(y + k * 2, Math.abs(_) + g * 2, Math.abs(m) + g * 2)), R = a + 2 * A, F = i + 2 * A, S = document.createElement("canvas");
  S.width = R, S.height = F;
  const x = S.getContext("2d"), $ = A, C = A;
  if (l && (_ !== 0 || m !== 0 || g > 0)) {
    const M = document.createElement("canvas");
    M.width = a, M.height = i;
    const w = M.getContext("2d");
    w.drawImage(t, 0, 0, a, i), w.globalCompositeOperation = "source-atop", w.fillStyle = u.color, w.fillRect(0, 0, a, i), x.save(), g > 0 && (x.filter = `blur(${g}px)`), x.drawImage(M, $ + _, C + m, a, i), x.restore();
  }
  if (y > 0) {
    const M = document.createElement("canvas");
    M.width = R, M.height = F;
    const w = M.getContext("2d"), E = a + 2 * y, L = i + 2 * y;
    w.save(), w.filter = `blur(${k}px)`, w.drawImage(t, $ - y, C - y, E, L), w.filter = "none", w.globalCompositeOperation = "source-atop", w.fillStyle = d, w.fillRect(0, 0, R, F), w.restore(), x.drawImage(M, 0, 0);
  }
  return x.drawImage(t, $, C, a, i), r && (x.globalCompositeOperation = "source-atop", x.fillStyle = r, x.fillRect($, C, a, i)), S;
}
function Jt(t) {
  return `${t["aircraft-marker-url"]}|${t["aircraft-marker-color-overlay"]}|${t["aircraft-marker-outline-width"]}|${t["aircraft-marker-outline-color"]}|${t["aircraft-marker-shadow"]}`;
}
function Qt(t) {
  const e = Jt(t), a = _t.get(e);
  if (a) return a;
  const i = Xt(t["aircraft-marker-url"]).then((o) => Zt(o, t));
  return _t.set(e, i), i;
}
function te(t, e) {
  const a = document.createElement("div");
  a.className = "custom-marker";
  const i = document.createElement("div");
  i.className = "custom-marker-transform", a.appendChild(i);
  const o = t["aircraft-marker-url"], r = t["aircraft-marker-color-overlay"], n = t["aircraft-marker-outline-width"] ?? 0;
  t["aircraft-marker-outline-color"];
  const d = t["aircraft-marker-shadow"] || "";
  if (r || n > 0 || d.length > 0) {
    const g = document.createElement("canvas");
    i.appendChild(g), Qt(t).then((y) => {
      g.width = y.width, g.height = y.height, g.getContext("2d").drawImage(y, 0, 0);
    }).catch(() => {
    });
  } else {
    const g = document.createElement("img");
    g.src = o, g.draggable = !1, i.appendChild(g);
  }
  const l = t["aircraft-marker-rotation"] ?? 0, u = t["aircraft-marker-scale"] ?? 1, [_, m] = Yt(t["aircraft-marker-center"]);
  return i.style.transform = `rotate(${e + l}deg) scale(${u})`, i.style.transformOrigin = `calc(50% + ${_}px) calc(50% + ${m}px)`, a;
}
function at(t) {
  const { flights: e, radar: a, selectedFlights: i, dimensions: o, dom: r } = t;
  let n;
  a && a.filter === !0 ? n = t.flightsFiltered || e : a && a.filter && typeof a.filter == "object" ? n = Rt(t, a.filter) : n = e;
  const d = r?.planesContainer || t.mainCard?.shadowRoot && t.mainCard.shadowRoot.getElementById("planes");
  if (!d) return;
  d.innerHTML = "";
  const { range: l, scaleFactor: u, centerX: _, centerY: m } = o;
  if (!l || !u || _ === void 0 || m === void 0) return;
  const g = l * 1.15, y = a?.["aircraft-marker"]?.default;
  n.slice().reverse().forEach((k) => {
    const A = k.distance_to_tracker;
    if (A !== void 0 && A <= g) {
      const R = document.createElement("div");
      R.className = "plane";
      const F = k.heading_from_tracker ?? 0, S = _ + Math.cos((F - 90) * Math.PI / 180) * A * u, x = m + Math.sin((F - 90) * Math.PI / 180) * A * u;
      if (R.style.top = x + "px", R.style.left = S + "px", y?.["aircraft-marker-url"]) {
        R.classList.add("plane-custom");
        const L = te(y, k.heading ?? 0);
        R.appendChild(L);
      } else {
        const L = document.createElement("div");
        L.className = "arrow", L.style.transform = `rotate(${k.heading}deg)`, R.appendChild(L), (k.altitude ?? 0) <= 0 ? R.classList.add("plane-small") : R.classList.add("plane-medium");
      }
      const $ = document.createElement("div");
      $.className = "callsign-label", $.textContent = k.callsign ?? k.aircraft_registration ?? "n/a", d.appendChild($);
      const C = $.getBoundingClientRect(), M = C.width + 3, w = C.height + 6;
      $.style.top = x - w + "px", $.style.left = S - M + "px";
      const E = a["aircraft-marker-size"];
      E && E !== "normal" && R.classList.add(`marker-size-${E}`), i && i.includes(k.id) && R.classList.add("selected"), R.addEventListener("click", (L) => {
        L.stopPropagation(), lt(t, k);
      }), $.addEventListener("click", (L) => {
        L.stopPropagation(), lt(t, k);
      }), d.appendChild(R);
    }
  });
}
function vt(t, e) {
  const a = document.createElement("img");
  return a.setAttribute("src", `https://flagsapi.com/${t}/shiny/16.png`), a.setAttribute("title", `${e}`), a.style.position = "relative", a.style.top = "3px", a.style.left = "2px", a;
}
function ee(t, e, a) {
  try {
    let i = e[a];
    if (t.config.annotate) {
      const o = Object.assign({}, e);
      t.config.annotate.filter((r) => r.field === a).forEach((r) => {
        Ot(t, e, r.conditions) && (o[a] = r.render.replace(/\$\{([^}]*)\}/g, (n, d) => String(o[d] || "")));
      }), i = String(o[a] || "");
    }
    return i;
  } catch (i) {
    return console.error(`[FR24Card] flightField error for field '${a}':`, i), "";
  }
}
function ae(t, e) {
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
      a[o] = ee(t, a, o);
    }), a.origin_flag = a.airport_origin_country_code ? vt(a.airport_origin_country_code, a.airport_origin_country_name || "").outerHTML : "", a.destination_flag = a.airport_destination_country_code ? vt(a.airport_destination_country_code, a.airport_destination_country_name || "").outerHTML : "", a.climb_descend_indicator = Math.abs(a.vertical_speed) > 100 ? a.vertical_speed > 100 ? "↑" : "↓" : "", a.alt_in_unit = a.altitude >= 17750 ? `FL${Math.round(a.altitude / 1e3) * 10}` : a.altitude > 0 ? t.units.altitude === "m" ? `${Math.round(a.altitude * 0.3048)} m` : `${Math.round(a.altitude)} ft` : void 0, a.spd_in_unit = a.ground_speed > 0 ? t.units.speed === "kmh" ? `${Math.round(a.ground_speed * 1.852)} km/h` : t.units.speed === "mph" ? `${Math.round(a.ground_speed * 1.15078)} mph` : `${Math.round(a.ground_speed)} kts` : void 0, a.approach_indicator = a.ground_speed > 70 ? a.is_approaching ? "↓" : a.is_receding ? "↑" : "" : "", a.dist_in_unit = `${Math.round(a.distance_to_tracker || 0)} ${t.units.distance}`, a.direction_info = `${Math.round(a.heading_from_tracker || 0)}° ${a.cardinal_direction_from_tracker || ""}`;
    const i = document.createElement("div");
    return i.style.clear = "both", i.className = "flight", t.selectedFlights && t.selectedFlights.includes(a.id) && (i.className += " selected"), i.innerHTML = pt(t, "flight_element", a, (o) => (...r) => r?.filter((n) => n).join(o || " ")), i.addEventListener("click", (o) => {
      o.stopPropagation(), lt(t, a);
    }), i;
  } catch (a) {
    console.error("[FR24Card] renderFlight error:", a);
    const i = document.createElement("div");
    return i.className = "flight error", i.textContent = `Error rendering flight: ${a}`, i;
  }
}
var bt = {
  altitude: "ft",
  speed: "kts",
  distance: "km"
}, ie = [
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
], W, Ft = Q((() => {
  W = {
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
Ft();
function yt(t, e) {
  return e.split(" ?? ").reduce((a, i) => a ?? t[i], void 0);
}
function ne(t, e = (a) => a) {
  return function(a, i) {
    for (const o of t) {
      const { field: r, comparator: n, order: d = "ASC" } = o, l = e(o.value), u = yt(a, r), _ = yt(i, r);
      let m = 0;
      switch (n) {
        case "eq":
          u === l && _ !== l ? m = 1 : u !== l && _ === l && (m = -1);
          break;
        case "lt":
          u < l && _ >= l ? m = 1 : u >= l && _ < l && (m = -1);
          break;
        case "lte":
          u <= l && _ > l ? m = 1 : u > l && _ <= l && (m = -1);
          break;
        case "gt":
          u > l && _ <= l ? m = 1 : u <= l && _ > l && (m = -1);
          break;
        case "gte":
          u >= l && _ < l ? m = 1 : u < l && _ >= l && (m = -1);
          break;
        case "oneOf":
          if (l != null && (Array.isArray(l) || typeof l == "string")) {
            const g = l.includes(u), y = l.includes(_);
            g && !y ? m = 1 : !g && y && (m = -1);
          }
          break;
        case "containsOneOf":
          if (Array.isArray(l) && l.length > 0) {
            const g = l.some((k) => (Array.isArray(u) || typeof u == "string") && u.includes(k)), y = l.some((k) => (Array.isArray(_) || typeof _ == "string") && _.includes(k));
            g && !y ? m = 1 : !g && y && (m = -1);
          }
          break;
        default:
          m = u - _;
          break;
      }
      if (m !== 0) return d.toUpperCase() === "DESC" ? -m : m;
    }
    return 0;
  };
}
var P = {
  flights_entity: "sensor.flightradar24_current_in_area",
  projection_interval: 5,
  no_flights_message: "No flights are currently visible. Please check back later.",
  list: {
    hide: !1,
    showListStatus: !0,
    position: "below"
  },
  units: bt,
  radar: {
    range: bt.distance === "km" ? 35 : 25,
    view: "radar",
    background_map: "none",
    background_map_opacity: 0,
    background_map_api_key: "",
    background_map_light: "color",
    background_map_dark: "dark",
    background_map_light_api_key: "",
    background_map_dark_api_key: ""
  },
  sort: ie,
  templates: W,
  defines: {}
}, kt = class {
  constructor() {
    this.hass = null, this.config = {}, this.radar = { range: 35 }, this.list = {}, this.templates = {}, this.defines = {}, this.units = {
      altitude: "ft",
      speed: "kts",
      distance: "km"
    }, this.flightsContext = {}, this.dimensions = {}, this.flights = [], this.selectedFlights = [], this.renderDynamicOnRangeChange = !1, this._leafletMap = null, this.sortFn = () => 0;
  }
  setConfig(t) {
    if (!t) throw new Error("Configuration is missing.");
    this.config = { ...t }, this.config.flights_entity = t.flights_entity ?? P.flights_entity, this.config.projection_interval = t.projection_interval ?? P.projection_interval, this.config.no_flights_message = t.no_flights_message ?? P.no_flights_message, this.list = {
      ...P.list,
      ...t.list
    }, this.units = {
      ...P.units,
      ...t.units
    }, this.radar = {
      range: this.units.distance === "km" ? P.radar.range : 25,
      view: t.radar?.view ?? P.radar.view,
      background_map: t.radar?.background_map ?? P.radar.background_map,
      background_map_opacity: t.radar?.background_map_opacity ?? P.radar.background_map_opacity,
      background_map_api_key: t.radar?.background_map_api_key ?? P.radar.background_map_api_key,
      background_map_light: t.radar?.background_map_light ?? P.radar.background_map_light,
      background_map_dark: t.radar?.background_map_dark ?? P.radar.background_map_dark,
      background_map_light_api_key: t.radar?.background_map_light_api_key ?? P.radar.background_map_light_api_key,
      background_map_dark_api_key: t.radar?.background_map_dark_api_key ?? P.radar.background_map_dark_api_key,
      ...t.radar
    }, this.radar.initialRange = this.radar.range, this.defines = {
      ...P.defines,
      ...t.defines
    }, this.sortFn = ne(t.sort ?? P.sort, (e) => ot(this, e, void 0, (a) => {
      this.renderDynamicOnRangeChange = a;
    })), this.templates = {
      ...P.templates,
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
async function oe() {
  if (q) return q;
  try {
    const e = await fetch("/local/flightradar24-card/runways.csv");
    if (e.ok)
      return q = await e.text(), q;
  } catch {
  }
  try {
    const e = await fetch("data/runways.csv");
    if (e.ok)
      return q = await e.text(), q;
  } catch {
  }
  const t = await fetch("https://davidmegginson.github.io/ourairports-data/runways.csv");
  if (!t.ok) throw new Error(`Failed to fetch runway data: ${t.status}`);
  return q = await t.text(), q;
}
async function re() {
  if (B) return B;
  try {
    const e = await fetch("/local/flightradar24-card/airports.csv");
    if (e.ok)
      return B = await e.text(), B;
  } catch {
  }
  try {
    const e = await fetch("data/airports.csv");
    if (e.ok)
      return B = await e.text(), B;
  } catch {
  }
  const t = await fetch("https://davidmegginson.github.io/ourairports-data/airports.csv");
  if (!t.ok) throw new Error(`Failed to fetch airport data: ${t.status}`);
  return B = await t.text(), B;
}
function G(t) {
  const e = [];
  let a = "", i = !1;
  for (let o = 0; o < t.length; o++) {
    const r = t[o];
    r === '"' ? i = !i : r === "," && !i ? (e.push(a), a = "") : a += r;
  }
  return e.push(a), e;
}
function se(t, e, a, i, o) {
  let r = 0;
  a && a === t && (r += 1e3), a && a.startsWith(t) && (r += 500), e === t && (r += 900), e.startsWith(t) && (r += 400), o && `${e}${o}`.includes(t) && (r += 300);
  const n = i.toUpperCase().split(/[\s,/-]+/);
  for (const d of n) if (d.startsWith(t)) {
    r += 250;
    break;
  }
  return i.toUpperCase().includes(t) && (r += 100), r;
}
async function le(t) {
  if (!t || t.length < 2) return [];
  const e = t.trim().toUpperCase(), a = [], [i, o] = await Promise.all([oe(), re()]), r = /* @__PURE__ */ new Map(), n = o.split(`
`), d = G(n[0]), l = d.indexOf("ident"), u = d.indexOf("name"), _ = d.indexOf("iata_code");
  for (let w = 1; w < n.length; w++) {
    const E = n[w].trim();
    if (!E) continue;
    const L = G(E), O = L[l], z = L[u], T = L[_];
    O && r.set(O, {
      name: z || "",
      iata: T || ""
    });
  }
  const m = i.split(`
`), g = G(m[0]), y = g.indexOf("airport_ident"), k = g.indexOf("le_ident"), A = g.indexOf("he_ident"), R = g.indexOf("le_latitude_deg"), F = g.indexOf("le_longitude_deg"), S = g.indexOf("he_latitude_deg"), x = g.indexOf("he_longitude_deg"), $ = g.indexOf("le_heading_degT"), C = g.indexOf("he_heading_degT"), M = g.indexOf("length_ft");
  for (let w = 1; w < m.length; w++) {
    const E = m[w].trim();
    if (!E) continue;
    const L = G(E), O = L[y], z = L[k], T = L[A], c = r.get(O);
    if (!c) continue;
    const { name: p, iata: s } = c, h = O.startsWith(e), v = s && s.toUpperCase().startsWith(e), f = p.toUpperCase().includes(e), b = z && `${O}${z}`.includes(e), I = T && `${O}${T}`.includes(e);
    if (!h && !v && !f && !b && !I) continue;
    const H = se(e, O, s, p, z || T || "");
    if (z) {
      const D = [];
      s && D.push(s), D.push(O), D.push(`RWY${z}`), p && D.push(`- ${p}`), a.push({
        displayText: D.join(" "),
        airportCode: O,
        airportName: p,
        iataCode: s,
        runwayDesignator: z,
        data: {
          airportCode: O,
          runwayDesignator: z,
          latitude: parseFloat(L[R]),
          longitude: parseFloat(L[F]),
          heading: parseFloat(L[$]),
          length: parseFloat(L[M])
        },
        score: H
      });
    }
    if (T) {
      const D = [];
      s && D.push(s), D.push(O), D.push(`RWY${T}`), p && D.push(`- ${p}`), a.push({
        displayText: D.join(" "),
        airportCode: O,
        airportName: p,
        iataCode: s,
        runwayDesignator: T,
        data: {
          airportCode: O,
          runwayDesignator: T,
          latitude: parseFloat(L[S]),
          longitude: parseFloat(L[x]),
          heading: parseFloat(L[C]),
          length: parseFloat(L[M])
        },
        score: H
      });
    }
  }
  return a.sort((w, E) => E.score - w.score).slice(0, 10).map(({ score: w, ...E }) => E);
}
var q, B, de = Q((() => {
  q = null, B = null;
})), ce = /* @__PURE__ */ St({ Flightradar24CardEditor: () => Z }), Z, Tt = Q((() => {
  if (de(), Ft(), $t(), Z = class extends HTMLElement {
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
      return xt(t);
    }
    _backgroundMapOptionsHtml(t) {
      const e = (a, i) => `<optgroup label="${a}">${X.filter((o) => o.group === i).map((o) => `<option value="${o.id}" ${t === o.id ? "selected" : ""}>${o.label}</option>`).join("")}</optgroup>`;
      return e("Keyless", "keyless") + e("Requires API key", "keyed");
    }
    _themeMapOptionsHtml(t) {
      return this._backgroundMapOptionsHtml(t);
    }
    _themeApiKeyRowHtml(t, e, a, i) {
      return this._mapTypeRequiresApiKey(a) ? `
            <div class="form-row">
                <label>${e}:</label>
                <div class="input-with-help">
                    <input type="text" class="full-width" id="radar-background-map-${t}-api-key"
                        value="${i || ""}" placeholder="Paste your API key" />
                    <span class="help-text">${gt(a)}</span>
                </div>
            </div>` : "";
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
        for (const d of n) {
          const l = d[1];
          this.allDefineAndToggleKeys.has(l) && t.add(l);
        }
      });
      const o = (r) => {
        r.forEach((n) => {
          if ("type" in n && (n.type === "AND" || n.type === "OR")) o(n.conditions || []);
          else if ("type" in n && n.type === "NOT") o([n.condition]);
          else {
            const d = n;
            d.field && this.allDefineAndToggleKeys.has(d.field) && t.add(d.field), d.defined && this.allDefineAndToggleKeys.has(d.defined) && t.add(d.defined);
            const l = d.value;
            if (typeof l == "string" && l.startsWith("${") && l.endsWith("}")) {
              const u = l.slice(2, -1);
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
        ...W,
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
          const d = n[1];
          e[d] !== void 0 && t.add(d);
        }
        const r = i.matchAll(/tpl\.(\w+)/g);
        for (const n of r) {
          const d = n[1];
          e[d] !== void 0 && t.add(d);
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
      for (const [d, l] of Object.entries(i))
        l.includes(`\${${e}}`) && (i[d] = l.replace(o, `\${${a}}`)), t === "template" && (l.includes(`\${tpl.${e}}`) || l.includes(`tpl.${e}`)) && (i[d] = l.replace(new RegExp(`tpl\\.${e}`, "g"), `tpl.${a}`));
      t === "template" && e in i && (i[a] = i[e], delete i[e]);
      const r = this._config.filter ? JSON.parse(JSON.stringify(this._config.filter)) : void 0;
      if (r) {
        const d = (l) => {
          l.forEach((u) => {
            u.type === "AND" || u.type === "OR" ? d(u.conditions || []) : u.type === "NOT" ? d([u.condition]) : (u.field === e && (u.field = a), u.defined === e && (u.defined = a), typeof u.value == "string" && (u.value = u.value.replace(o, `\${${a}}`)));
          });
        };
        d(r);
      }
      const n = (this._config.sort || []).map((d) => {
        if (d.field === e) return {
          ...d,
          field: a
        };
        if (d.field?.includes(" ?? ")) {
          const l = d.field.split(" ?? ").map((u) => u === e ? a : u);
          return {
            ...d,
            field: l.join(" ?? ")
          };
        }
        return d;
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
            .input-with-help {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 8px;
            }
            .input-with-help .full-width {
                flex: 1;
                min-width: 0;
            }
            .input-with-help .help-text {
                flex: 0 0 auto;
                max-width: 60%;
                margin: 0;
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

                    <div class="form-row">
                        <label>View:</label>
                        <select id="radar-view">
                            <option value="radar" ${(t.view || "radar") === "radar" ? "selected" : ""}>Radar (circular screen)</option>
                            <option value="map" ${t.view === "map" ? "selected" : ""}>Map (square, full-bleed)</option>
                        </select>
                        <span class="help-text">"Map" displays a square map that fills the available width (great for fullscreen and wide layouts) instead of the circular radar screen. The radar size setting is ignored in map view.</span>
                    </div>

                    <div class="form-row">
                        <label>
                            <input type="checkbox" id="radar-rings" ${t.rings ?? t.view !== "map" ? "checked" : ""} />
                            Show Radar Rings / Lines
                        </label>
                        <span class="help-text">Draw the radar grid rings and bearing lines on top of the display. On by default for the circular "Radar" view and off by default for the "Map" view; tick or untick to override.</span>
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
        }[a], r = t["background-color"] || t["primary-color"] || "#1a1a1a", n = t["aircraft-color"] || t["accent-color"] || "#ff0000", d = t["background-opacity"] ?? 0.05;
        return `
                                            <button class="marker-size-option ${i ? "selected" : ""}" data-size="${a}">
                                                <div class="marker-button-background" style="background-color: ${r}; opacity: ${d};"></div>
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
                                    ${this._backgroundMapOptionsHtml(t.background_map || "none")}
                                </select>
                            </div>
                            ${t.background_map === "system" ? `
                                    <p class="help-text">Pick one map for light themes and one for dark themes. Each map can have its own API key.</p>
                                    <div class="form-row">
                                        <label>Light Theme Map:</label>
                                        <select id="radar-background-map-light">
                                            ${this._themeMapOptionsHtml(t.background_map_light || "color")}
                                        </select>
                                    </div>
                                    ${this._themeApiKeyRowHtml("light", "Light Map API Key", t.background_map_light || "color", t.background_map_light_api_key)}
                                    <div class="form-row">
                                        <label>Dark Theme Map:</label>
                                        <select id="radar-background-map-dark">
                                            ${this._themeMapOptionsHtml(t.background_map_dark || "dark")}
                                        </select>
                                    </div>
                                    ${this._themeApiKeyRowHtml("dark", "Dark Map API Key", t.background_map_dark || "dark", t.background_map_dark_api_key)}
                                ` : this._mapTypeRequiresApiKey(t.background_map) ? `
                                    <div class="form-row">
                                        <label>Map Tile API Key:</label>
                                        <div class="input-with-help">
                                            <input type="text" class="full-width" id="radar-background-map-api-key"
                                                value="${t.background_map_api_key || ""}" placeholder="Paste your API key" />
                                            <span class="help-text">${gt(t.background_map)}</span>
                                        </div>
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
                        <label>Position:</label>
                        <select id="list-position">
                            <option value="below" ${(t.position || "below") === "below" ? "selected" : ""}>Below (default)</option>
                            <option value="left" ${t.position === "left" ? "selected" : ""}>Left</option>
                            <option value="right" ${t.position === "right" ? "selected" : ""}>Right</option>
                        </select>
                        <span class="help-text">Place the flight list to the side of the radar/map on wide cards. If the card is too narrow to fit the flight list side by side, it automatically falls back to the "below" layout.</span>
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
      ], a = Object.keys(W).filter((n) => !(n in t)), i = a.filter((n) => e.includes(n)), o = a.filter((n) => !e.includes(n)), r = this.getUnusedTemplates();
      return `
            <details data-section-id="templates-config">
                <summary>
                    <h3>Templates</h3>
                    ${r.length > 0 ? `<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="Unused templates: ${r.join(", ")}">⚠️</span>` : ""}
                </summary>
                <div class="section-content">
                    <p class="help-text">Customize HTML templates for flight list items using \${flight.field} placeholders. Main templates are used directly by renderers; helper templates are used by other templates.</p>
                    <div id="templates-list">
                        ${Object.entries(t).map(([n, d]) => {
        const l = e.includes(n), u = r.includes(n);
        return `
                            <div class="item-box" ${u ? 'style="border-color: #ff9800;"' : ""}>
                                <div class="form-row">
                                    <label>Template Name:</label>
                                    <div style="display: flex; align-items: center;">
                                        <input type="text" value="${n}" data-template-name="${n}" style="flex: 1;" />
                                        ${l ? '<span style="background: var(--primary-color, #03a9f4); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 8px; font-weight: bold;">MAIN</span>' : ""}
                                        ${u ? '<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="This template is not used by renderers or other templates">⚠️</span>' : ""}
                                    </div>
                                </div>
                                <div class="form-row">
                                    <label>Template:</label>
                                    <textarea class="full-width" rows="3" data-template-value="${n}">${this._escapeHtml(d)}</textarea>
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
      const a = this._getConditionDescription(t), i = !!t.defined, o = Object.keys(this._config.defines || {}), r = Object.keys(this._config.toggles || {}), n = [...o, ...r], d = i ? t.defined : t.field, l = d ? this.validateConditionField(d) : { valid: !0 }, u = !l.valid;
      this._formatValue(t.value);
      const _ = typeof t.value == "string" && t.value.startsWith("${") && t.value.endsWith("}"), m = _ ? t.value.slice(2, -1) : "";
      return `
            <details class="condition-box" data-condition-path="${e}" ${u ? 'style="border-color: #ff9800;"' : ""}>
                <summary class="condition-summary">
                    <span class="condition-type-badge">Value</span>
                    <span class="condition-description">${a}</span>
                    ${u ? `<span style="color: #ff9800; font-size: 1.2em; margin-left: 0.5em;" title="${l.error || "Invalid field"}">⚠️</span>` : ""}
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
                                ${n.map((g) => {
        const y = this._config.toggles && g in this._config.toggles ? `toggle: ${this._config.toggles[g].label}` : this._formatValueForDisplay(this._config.defines[g]);
        return `<option value="${g}" ${t.defined === g ? "selected" : ""}>${g} (${y})</option>`;
      }).join("")}
                            </select>
                        ` : `
                            <input type="text" class="full-width condition-field" data-path="${e}" data-prop="defined"
                                value="${t.defined || ""}" placeholder="e.g., max_altitude" ${u ? 'style="border-color: #ff9800;"' : ""} />
                        ` : `
                        <select class="full-width condition-field" data-path="${e}" data-prop="field" ${u ? 'style="border-color: #ff9800;"' : ""}>
                            <option value="">Select a field...</option>
                            ${this.availableFlightFields.map((g, y, k) => {
        const A = y > 0 ? k[y - 1].group : null;
        return `${g.group && g.group !== A ? `<option disabled style="font-weight: bold; font-style: italic;">— ${g.group} —</option>` : ""}<option value="${g.value}" ${t.field === g.value ? "selected" : ""}>${g.label}</option>`;
      }).join("")}
                        </select>
                    `}
                </div>
                ${u ? `<div class="form-row"><p style="color: #ff9800; margin: 0; font-size: 0.9em;">${l.error || "Invalid field"}</p></div>` : ""}
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
                        <option value="direct" ${_ ? "" : "selected"}>Value</option>
                        <option value="defined" ${_ ? "selected" : ""}>Defined Value</option>
                    </select>
                    ${_ && n.length > 0 ? `
                        <select class="full-width condition-field-value-defined" data-path="${e}">
                            <option value="" ${m === "" ? "selected" : ""}>Select a define...</option>
                            ${n.map((g) => {
        const y = this._config.toggles && g in this._config.toggles ? `toggle: ${this._config.toggles[g].label}` : this._formatValueForDisplay(this._config.defines[g]);
        return `<option value="${g}" ${m === g ? "selected" : ""}>${g} (${y})</option>`;
      }).join("")}
                        </select>
                    ` : `
                        <input type="text" class="full-width condition-field" data-path="${e}" data-prop="value"
                            value="${_ ? m : this._formatValue(t.value)}" placeholder="Value or comma-separated list" />
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
            const d = this._getConditionDescription(n);
            return d.length > 30 ? d.substring(0, 27) + "..." : d;
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
      e && e.addEventListener("change", (c) => {
        this._config = {
          ...this._config,
          flights_entity: c.target.value
        }, this._emitConfigChanged();
      });
      const a = t.getElementById("location-tracker");
      a && a.addEventListener("change", (c) => {
        const p = c.target.value;
        if (this._config = {
          ...this._config,
          location_tracker: p || void 0
        }, p) {
          const { location: s, ...h } = this._config;
          this._config = h;
        }
        this._emitConfigChanged(), this._render();
      }), ["lat", "lon"].forEach((c) => {
        const p = t.getElementById(`location-${c}`);
        p && p.addEventListener("input", (s) => {
          const h = parseFloat(s.target.value);
          if (!isNaN(h)) {
            const v = this._config.location || {
              lat: 0,
              lon: 0
            };
            this._config = {
              ...this._config,
              location: {
                ...v,
                [c]: h
              }
            }, this._emitConfigChanged();
          }
        });
      }), [
        "altitude",
        "speed",
        "distance"
      ].forEach((c) => {
        const p = t.getElementById(`unit-${c}`);
        p && p.addEventListener("change", (s) => {
          const h = this._config.units || {};
          this._config = {
            ...this._config,
            units: {
              ...h,
              [c]: s.target.value
            }
          }, this._emitConfigChanged(), c === "distance" && this._render();
        });
      });
      const i = t.getElementById("projection-interval");
      i && i.addEventListener("input", (c) => {
        this._config = {
          ...this._config,
          projection_interval: parseInt(c.target.value)
        }, this._emitConfigChanged();
      });
      const o = t.getElementById("scale");
      o && o.addEventListener("input", (c) => {
        this._config = {
          ...this._config,
          scale: parseFloat(c.target.value)
        }, this._emitConfigChanged();
      });
      const r = t.getElementById("max-flights");
      r && r.addEventListener("input", (c) => {
        const p = c.target.value, s = parseInt(p);
        this._config = {
          ...this._config,
          max_flights: !p || isNaN(s) || s <= 0 ? void 0 : s
        }, this._emitConfigChanged();
      });
      const n = t.getElementById("radar-show");
      n && n.addEventListener("change", (c) => {
        const p = this._config.radar || {}, s = c.target.checked ? void 0 : !0;
        this._config = {
          ...this._config,
          radar: {
            ...p,
            hide: s
          }
        }, this._emitConfigChanged();
      }), [
        "range",
        "min-range",
        "max-range",
        "ring-distance"
      ].forEach((c) => {
        const p = t.getElementById(`radar-${c}`);
        p && p.addEventListener("input", (s) => {
          const h = this._config.radar || {}, v = c.replace(/-/g, "_");
          this._config = {
            ...this._config,
            radar: {
              ...h,
              [v]: parseFloat(s.target.value)
            }
          }, this._emitConfigChanged();
        });
      });
      const d = t.getElementById("radar-view");
      d && d.addEventListener("change", (c) => {
        const p = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...p,
            view: c.target.value
          }
        }, this._emitConfigChanged(), this._render();
      });
      const l = t.getElementById("radar-rings");
      l && l.addEventListener("change", (c) => {
        const p = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...p,
            rings: c.target.checked
          }
        }, this._emitConfigChanged();
      }), [
        "background-color",
        "aircraft-color",
        "aircraft-selected-color",
        "radar-grid-color",
        "local-features-color"
      ].forEach((c) => {
        const p = c.startsWith("radar-") ? c : `radar-${c}`, s = t.getElementById(p);
        s && s.addEventListener("input", (h) => {
          const v = this._config.radar || {}, f = { ...this._config };
          c === "background-color" && f.radar && delete f.radar["primary-color"], c === "aircraft-color" && f.radar && delete f.radar["accent-color"], (c === "radar-grid-color" || c === "local-features-color") && f.radar && delete f.radar["feature-color"], this._config = {
            ...f,
            radar: {
              ...v,
              [c]: h.target.value
            }
          }, this._emitConfigChanged(), (c === "background-color" || c === "aircraft-color") && this._render();
        });
      });
      const u = t.getElementById("radar-background-opacity");
      u && u.addEventListener("input", (c) => {
        const p = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...p,
            "background-opacity": parseFloat(c.target.value)
          }
        }, this._emitConfigChanged(), this._render();
      }), t.querySelectorAll(".marker-size-option").forEach((c) => {
        c.addEventListener("click", (p) => {
          const s = p.currentTarget.getAttribute("data-size"), h = this._config.radar || {};
          this._config = {
            ...this._config,
            radar: {
              ...h,
              "aircraft-marker-size": s === "normal" ? void 0 : s
            }
          }, this._emitConfigChanged(), this._render();
        });
      });
      const _ = (c, p) => {
        const s = this._config.radar || {}, h = { ...s["aircraft-marker"]?.default || {} };
        p === "" || p === void 0 || p === 0 ? delete h[c] : h[c] = p;
        const v = Object.keys(h).length > 0 && h["aircraft-marker-url"];
        this._config = {
          ...this._config,
          radar: {
            ...s,
            "aircraft-marker": v ? { default: h } : void 0
          }
        }, this._emitConfigChanged();
      }, m = t.getElementById("radar-custom-marker-url");
      m && m.addEventListener("input", (c) => {
        _("aircraft-marker-url", c.target.value);
      });
      const g = t.getElementById("radar-custom-marker-rotation");
      g && g.addEventListener("input", (c) => {
        const p = parseInt(c.target.value);
        _("aircraft-marker-rotation", isNaN(p) ? 0 : p);
      });
      const y = t.getElementById("radar-custom-marker-center");
      y && y.addEventListener("input", (c) => {
        _("aircraft-marker-center", c.target.value || void 0);
      });
      const k = t.getElementById("radar-custom-marker-scale");
      k && k.addEventListener("input", (c) => {
        const p = parseFloat(c.target.value);
        _("aircraft-marker-scale", isNaN(p) ? 1 : p);
      });
      const A = t.getElementById("radar-custom-marker-overlay");
      A && A.addEventListener("input", (c) => {
        const p = c.target.value;
        _("aircraft-marker-color-overlay", p || void 0);
      });
      const R = t.getElementById("radar-background-map");
      R && R.addEventListener("change", (c) => {
        const p = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...p,
            background_map: c.target.value
          }
        }, this._emitConfigChanged(), this._render();
      });
      const F = (c, p) => {
        const s = t.getElementById(c);
        s && s.addEventListener("change", (h) => {
          const v = this._config.radar || {};
          this._config = {
            ...this._config,
            radar: {
              ...v,
              [p]: h.target.value
            }
          }, this._emitConfigChanged(), this._render();
        });
      };
      F("radar-background-map-light", "background_map_light"), F("radar-background-map-dark", "background_map_dark");
      const S = (c, p) => {
        const s = t.getElementById(c);
        s && s.addEventListener("input", (h) => {
          const v = this._config.radar || {}, f = h.target.value;
          this._config = {
            ...this._config,
            radar: {
              ...v,
              [p]: f || void 0
            }
          }, this._emitConfigChanged();
        });
      };
      S("radar-background-map-light-api-key", "background_map_light_api_key"), S("radar-background-map-dark-api-key", "background_map_dark_api_key");
      const x = t.getElementById("radar-background-map-api-key");
      x && x.addEventListener("input", (c) => {
        const p = this._config.radar || {}, s = c.target.value;
        this._config = {
          ...this._config,
          radar: {
            ...p,
            background_map_api_key: s || void 0
          }
        }, this._emitConfigChanged();
      });
      const $ = t.getElementById("radar-background-map-opacity");
      $ && $.addEventListener("input", (c) => {
        const p = this._config.radar || {};
        this._config = {
          ...this._config,
          radar: {
            ...p,
            background_map_opacity: parseFloat(c.target.value)
          }
        }, this._emitConfigChanged();
      });
      const C = t.getElementById("list-show");
      C && C.addEventListener("change", (c) => {
        const p = this._config.list || {}, s = c.target.checked ? void 0 : !0;
        this._config = {
          ...this._config,
          list: {
            ...p,
            hide: s
          }
        }, this._emitConfigChanged();
      });
      const M = t.getElementById("list-show-status");
      M && M.addEventListener("change", (c) => {
        const p = this._config.list || {}, s = c.target.checked ? void 0 : !1;
        this._config = {
          ...this._config,
          list: {
            ...p,
            showListStatus: s
          }
        }, this._emitConfigChanged();
      });
      const w = t.getElementById("list-position");
      w && w.addEventListener("change", (c) => {
        const p = this._config.list || {}, s = c.target.value, h = s === "below" ? void 0 : s;
        this._config = {
          ...this._config,
          list: {
            ...p,
            position: h
          }
        }, this._emitConfigChanged(), this._render();
      });
      const E = t.getElementById("no-flights-message");
      E && E.addEventListener("input", (c) => {
        this._config = {
          ...this._config,
          no_flights_message: c.target.value
        }, this._emitConfigChanged();
      });
      const L = t.getElementById("add-template-button"), O = t.getElementById("template-dropdown");
      L && O && (L.addEventListener("click", (c) => {
        c.stopPropagation();
        const p = O.classList.contains("open");
        t.querySelectorAll(".template-dropdown").forEach((s) => s.classList.remove("open")), p || O.classList.add("open");
      }), O.querySelectorAll(".template-dropdown-item").forEach((c) => {
        c.addEventListener("click", (p) => {
          p.stopPropagation();
          const s = p.target.getAttribute("data-template-key");
          if (!s) return;
          const h = this._config.templates || {};
          if (s === "__custom__") {
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
            const v = W[s];
            this._config = {
              ...this._config,
              templates: {
                ...h,
                [s]: v
              }
            };
          }
          this._emitConfigChanged(), this._render(), O.classList.remove("open");
        });
      }), document.addEventListener("click", () => {
        O.classList.remove("open");
      })), t.querySelectorAll("[data-action]").forEach((c) => {
        c.addEventListener("click", (p) => {
          const s = p.target.getAttribute("data-action"), h = p.target.getAttribute("data-index"), v = p.target.getAttribute("data-key");
          if (s === "add-sort") {
            const f = this._config.sort || [];
            this._config = {
              ...this._config,
              sort: [...f, {
                field: "distance",
                order: "asc"
              }]
            }, this._emitConfigChanged(), this._render();
          } else if (s === "remove-sort" && h) {
            const f = [...this._config.sort || []];
            f.splice(parseInt(h), 1), this._config = {
              ...this._config,
              sort: f.length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (s === "add-define") {
            const f = this._config.defines || {};
            let b = 1;
            for (; f[`define${b}`]; ) b++;
            this._config = {
              ...this._config,
              defines: {
                ...f,
                [`define${b}`]: ""
              }
            }, this._emitConfigChanged(), this._render();
          } else if (s === "remove-define" && v) {
            const f = { ...this._config.defines };
            delete f[v], this._config = {
              ...this._config,
              defines: Object.keys(f).length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (s === "add-toggle") {
            const f = this._config.toggles || {};
            let b = 1;
            for (; f[`toggle${b}`]; ) b++;
            this._config = {
              ...this._config,
              toggles: {
                ...f,
                [`toggle${b}`]: {
                  label: "Toggle",
                  default: !1
                }
              }
            }, this._emitConfigChanged(), this._render();
          } else if (s === "remove-toggle" && v) {
            const f = { ...this._config.toggles };
            delete f[v], this._config = {
              ...this._config,
              toggles: Object.keys(f).length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (s === "remove-template" && v) {
            const f = { ...this._config.templates };
            delete f[v], this._config = {
              ...this._config,
              templates: Object.keys(f).length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (s === "add-filter-condition") {
            const f = this._config.filter || [], b = f.length;
            this._config = {
              ...this._config,
              filter: [...f, {
                field: "",
                comparator: "eq",
                value: ""
              }]
            }, this._openConditions.add(`filter:${b}`), this._emitConfigChanged(), this._render();
          } else if (s === "add-filter-group") {
            const f = this._config.filter || [], b = f.length;
            this._config = {
              ...this._config,
              filter: [...f, {
                type: "AND",
                conditions: []
              }]
            }, this._openConditions.add(`filter:${b}`), this._emitConfigChanged(), this._render();
          } else if (s === "add-filter-not") {
            const f = this._config.filter || [], b = f.length;
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
            }, this._openConditions.add(`filter:${b}`), this._emitConfigChanged(), this._render();
          } else if (s === "remove-condition") {
            const f = p.target.getAttribute("data-path");
            f && (this._removeConditionAtPath(f), this._emitConfigChanged(), this._render());
          } else if (s === "add-group-condition") {
            const f = p.target.getAttribute("data-path");
            if (f) {
              const b = this._addConditionToGroup(f, {
                field: "",
                comparator: "eq",
                value: ""
              });
              b && this._openConditions.add(b), this._emitConfigChanged(), this._render();
            }
          } else if (s === "add-group-group") {
            const f = p.target.getAttribute("data-path");
            if (f) {
              const b = this._addConditionToGroup(f, {
                type: "AND",
                conditions: []
              });
              b && this._openConditions.add(b), this._emitConfigChanged(), this._render();
            }
          } else if (s === "add-group-not") {
            const f = p.target.getAttribute("data-path");
            if (f) {
              const b = this._addConditionToGroup(f, {
                type: "NOT",
                condition: {
                  field: "",
                  comparator: "eq",
                  value: ""
                }
              });
              b && this._openConditions.add(b), this._emitConfigChanged(), this._render();
            }
          } else if (s === "add-local-feature-location") {
            const f = this._config.radar || {}, b = f.local_features || [], I = b.length;
            this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: [...b, {
                  type: "location",
                  label: "",
                  position: {
                    lat: 0,
                    lon: 0
                  }
                }]
              }
            }, this._openFeatures.add(`feature-${I}`), this._emitConfigChanged(), this._render();
          } else if (s === "add-local-feature-runway") {
            const f = this._config.radar || {}, b = f.local_features || [], I = b.length;
            this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: [...b, {
                  type: "runway",
                  position: {
                    lat: 0,
                    lon: 0
                  },
                  heading: 0,
                  length: 0
                }]
              }
            }, this._openFeatures.add(`feature-${I}`), this._emitConfigChanged(), this._render();
          } else if (s === "add-local-feature-outline") {
            const f = this._config.radar || {}, b = f.local_features || [], I = b.length;
            this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: [...b, {
                  type: "outline",
                  points: []
                }]
              }
            }, this._openFeatures.add(`feature-${I}`), this._emitConfigChanged(), this._render();
          } else if (s === "remove-local-feature" && h) {
            const f = this._config.radar || {}, b = [...f.local_features || []];
            b.splice(parseInt(h), 1), this._config = {
              ...this._config,
              radar: {
                ...f,
                local_features: b.length > 0 ? b : void 0
              }
            }, this._emitConfigChanged(), this._render();
          } else if (s === "select-location-on-map" && h) this._openMapModal("location", parseInt(h));
          else if (s === "draw-outline-on-map" && h) this._openMapModal("outline", parseInt(h));
          else if (s === "add-annotation") {
            const f = this._config.annotate || [], b = f.length;
            this._config = {
              ...this._config,
              annotate: [...f, {
                field: "",
                render: "",
                conditions: []
              }]
            }, this._openAnnotations.add(`annotation-${b}`), this._emitConfigChanged(), this._render();
          } else if (s === "remove-annotation" && h) {
            const f = [...this._config.annotate || []];
            f.splice(parseInt(h), 1), this._config = {
              ...this._config,
              annotate: f.length > 0 ? f : void 0
            }, this._emitConfigChanged(), this._render();
          } else if (s === "add-annotation-condition" && h) {
            const f = [...this._config.annotate || []], b = parseInt(h);
            if (f[b]) {
              const I = (f[b].conditions || []).length;
              f[b] = {
                ...f[b],
                conditions: [...f[b].conditions || [], {
                  field: "",
                  comparator: "eq",
                  value: ""
                }]
              }, this._config = {
                ...this._config,
                annotate: f
              }, this._openConditions.add(`annotate:${b}:${I}`), this._emitConfigChanged(), this._render();
            }
          } else if (s === "add-annotation-group" && h) {
            const f = [...this._config.annotate || []], b = parseInt(h);
            if (f[b]) {
              const I = (f[b].conditions || []).length;
              f[b] = {
                ...f[b],
                conditions: [...f[b].conditions || [], {
                  type: "AND",
                  conditions: []
                }]
              }, this._config = {
                ...this._config,
                annotate: f
              }, this._openConditions.add(`annotate:${b}:${I}`), this._emitConfigChanged(), this._render();
            }
          } else if (s === "add-annotation-not" && h) {
            const f = [...this._config.annotate || []], b = parseInt(h);
            if (f[b]) {
              const I = (f[b].conditions || []).length;
              f[b] = {
                ...f[b],
                conditions: [...f[b].conditions || [], {
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
              }, this._openConditions.add(`annotate:${b}:${I}`), this._emitConfigChanged(), this._render();
            }
          }
        });
      }), t.querySelectorAll("[data-runway-index]").forEach((c) => {
        const p = parseInt(c.getAttribute("data-runway-index")), s = t.getElementById(`runway-dropdown-${p}`), h = t.getElementById(`runway-lookup-status-${p}`);
        let v;
        c.addEventListener("input", (f) => {
          const b = f.target.value.trim();
          if (clearTimeout(v), !b || b.length < 2) {
            s && (s.style.display = "none"), h && (h.textContent = "");
            return;
          }
          s && (s.innerHTML = '<div class="runway-dropdown-loading">⏳ Searching runways...</div>', s.style.display = "block"), v = window.setTimeout(() => {
            le(b).then((I) => {
              s && (I.length === 0 ? s.innerHTML = '<div class="runway-dropdown-empty">No runways found</div>' : (s.innerHTML = I.map((H) => `<div class="runway-dropdown-item" data-runway-result='${JSON.stringify(H.data)}'>${H.displayText}</div>`).join(""), s.querySelectorAll(".runway-dropdown-item").forEach((H) => {
                H.addEventListener("click", () => {
                  const D = JSON.parse(H.getAttribute("data-runway-result")), ut = this._config.radar || {}, et = [...ut.local_features || []], Y = { ...et[p] };
                  Y.position = {
                    lat: D.latitude,
                    lon: D.longitude
                  }, Y.heading = Math.round(D.heading), Y.length = Math.round(D.length), et[p] = Y, this._config = {
                    ...this._config,
                    radar: {
                      ...ut,
                      local_features: et
                    }
                  }, this._emitConfigChanged(), c.value = `${D.airportCode} ${D.runwayDesignator}`, s.style.display = "none", h && (h.style.color = "var(--success-color, #43a047)", h.textContent = `✓ ${D.airportCode} RWY${D.runwayDesignator} - ${Math.round(D.length)}ft`), this._render();
                });
              })));
            }).catch((I) => {
              s && (s.innerHTML = `<div class="runway-dropdown-empty">Error: ${I.message}</div>`), h && (h.style.color = "var(--error-color, #f44336)", h.textContent = `❌ ${I.message}`);
            });
          }, 300);
        }), c.addEventListener("blur", () => {
          setTimeout(() => {
            s && (s.style.display = "none");
          }, 200);
        });
      }), t.querySelectorAll(".condition-field-type").forEach((c) => {
        const p = c.getAttribute("data-path"), s = c.getAttribute("data-target");
        p && c.addEventListener("change", (h) => {
          const v = h.target.value;
          s === "value" ? this._switchConditionValueType(p, v) : this._switchConditionFieldType(p, v), this._emitConfigChanged(), this._render();
        });
      }), t.querySelectorAll(".condition-field").forEach((c) => {
        const p = c.getAttribute("data-path"), s = c.getAttribute("data-prop");
        if (p && s) {
          c.addEventListener("input", (v) => {
            this._updateConditionAtPath(p, s, v.target.value), this._emitConfigChanged();
          });
          const h = () => {
            this._render();
          };
          c.tagName === "SELECT" ? c.addEventListener("change", h) : c.addEventListener("blur", h);
        }
      }), t.querySelectorAll(".condition-field-value-defined").forEach((c) => {
        const p = c.getAttribute("data-path");
        p && c.addEventListener("change", (s) => {
          const h = s.target.value, v = h ? `\${${h}}` : "${}";
          this._updateConditionAtPath(p, "value", v), this._emitConfigChanged(), this._render();
        });
      }), t.querySelectorAll("[data-define-key]").forEach((c) => {
        c.addEventListener("input", (p) => {
          const s = p.target, h = s.getAttribute("data-define-key"), v = s.value;
          h !== v && v.trim() && (this._renameConfigKey("define", h, v), s.setAttribute("data-define-key", v), s.closest(".item-box")?.querySelector("[data-define-value]")?.setAttribute("data-define-value", v), this._emitConfigChanged());
        });
      }), t.querySelectorAll("[data-toggle-key]").forEach((c) => {
        c.addEventListener("input", (p) => {
          const s = p.target, h = s.getAttribute("data-toggle-key"), v = s.value;
          if (h !== v && v.trim()) {
            this._renameConfigKey("toggle", h, v), s.setAttribute("data-toggle-key", v);
            const f = s.closest(".item-box");
            f?.querySelector("[data-toggle-label]")?.setAttribute("data-toggle-label", v), f?.querySelector("[data-toggle-default]")?.setAttribute("data-toggle-default", v), this._emitConfigChanged();
          }
        });
      }), t.querySelectorAll("[data-template-name]").forEach((c) => {
        c.addEventListener("input", (p) => {
          const s = p.target, h = s.getAttribute("data-template-name"), v = s.value;
          h !== v && v.trim() && (this._renameConfigKey("template", h, v), s.setAttribute("data-template-name", v), s.closest(".item-box")?.querySelector("[data-template-value]")?.setAttribute("data-template-value", v), this._emitConfigChanged());
        });
      }), t.querySelectorAll("[data-define-value]").forEach((c) => {
        c.addEventListener("input", (p) => {
          const s = p.target.getAttribute("data-define-value"), h = { ...this._config.defines };
          h[s] = p.target.value, this._config = {
            ...this._config,
            defines: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-toggle-label]").forEach((c) => {
        c.addEventListener("input", (p) => {
          const s = p.target.getAttribute("data-toggle-label"), h = { ...this._config.toggles };
          h[s] = {
            ...h[s],
            label: p.target.value
          }, this._config = {
            ...this._config,
            toggles: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-toggle-default]").forEach((c) => {
        c.addEventListener("change", (p) => {
          const s = p.target.getAttribute("data-toggle-default"), h = { ...this._config.toggles }, v = p.target.checked ? !0 : void 0;
          h[s] = {
            ...h[s],
            default: v
          }, this._config = {
            ...this._config,
            toggles: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-template-value]").forEach((c) => {
        c.addEventListener("input", (p) => {
          const s = p.target.getAttribute("data-template-value"), h = { ...this._config.templates };
          h[s] = p.target.value, this._config = {
            ...this._config,
            templates: h
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-sort-prop]").forEach((c) => {
        c.addEventListener("input", (p) => {
          const [s, h] = p.target.getAttribute("data-sort-prop").split(":"), v = [...this._config.sort || []];
          v[parseInt(s)] = {
            ...v[parseInt(s)],
            [h]: p.target.value
          }, this._config = {
            ...this._config,
            sort: v
          }, this._emitConfigChanged();
        });
      }), t.querySelectorAll("[data-feature-prop]").forEach((c) => {
        const [p, s] = c.getAttribute("data-feature-prop").split(":");
        c.addEventListener("input", (h) => {
          const v = this._config.radar || {}, f = [...v.local_features || []], b = { ...f[parseInt(p)] };
          if (s === "label") b.label = h.target.value;
          else if (s === "lat")
            "position" in b && (b.position = {
              ...b.position,
              lat: parseFloat(h.target.value) || 0
            });
          else if (s === "lon")
            "position" in b && (b.position = {
              ...b.position,
              lon: parseFloat(h.target.value) || 0
            });
          else if (s === "heading") b.heading = parseFloat(h.target.value) || 0;
          else if (s === "length") b.length = parseFloat(h.target.value) || 0;
          else if (s === "max_range") {
            const I = h.target.value;
            b.max_range = I ? parseFloat(I) : void 0;
          } else if (s === "points") try {
            b.points = JSON.parse(h.target.value);
          } catch {
            return;
          }
          f[parseInt(p)] = b, this._config = {
            ...this._config,
            radar: {
              ...v,
              local_features: f
            }
          }, this._emitConfigChanged();
        }), s === "label" && c.addEventListener("blur", () => {
          this._render();
        });
      }), t.querySelectorAll("[data-annotation-prop]").forEach((c) => {
        const [p, s] = c.getAttribute("data-annotation-prop").split(":");
        c.addEventListener("input", (h) => {
          const v = [...this._config.annotate || []], f = { ...v[parseInt(p)] };
          s === "field" ? f.field = h.target.value : s === "render" && (f.render = h.target.value), v[parseInt(p)] = f, this._config = {
            ...this._config,
            annotate: v
          }, this._emitConfigChanged();
        }), s === "field" && c.addEventListener("blur", () => {
          this._render();
        });
      });
      const z = t.getElementById("tap-action");
      z && z.addEventListener("input", (c) => {
        const p = c.target.value;
        this._config = {
          ...this._config,
          tap_action: p || void 0
        }, this._emitConfigChanged();
      });
      const T = t.getElementById("flight-tap-action");
      T && T.addEventListener("input", (c) => {
        const p = c.target.value;
        this._config = {
          ...this._config,
          flight_tap_action: p || void 0
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
        const d = parseInt(e[n]), l = i[d];
        if (!l) return null;
        if ("type" in l) l.type === "NOT" ? (o = l, i = [l.condition]) : (o = i, i = l.conditions);
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
            const d = n.getLatLng();
            this._mapModal.points[r] = {
              lat: d.lat,
              lon: d.lng
            };
            const l = this._mapModal.points.map((u) => [u.lat, u.lon]);
            this._mapModal.polygon.setLatLngs(l);
          }), n.on("contextmenu", (d) => {
            d.originalEvent.preventDefault(), this._removeOutlinePoint(r);
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
  }, customElements.define("flightradar24-radar-card-editor", Z), !customElements.get("flightradar24-card-editor")) try {
    customElements.define("flightradar24-card-editor", class extends Z {
    });
  } catch (t) {
    console.error("[FR24Card] Could not register flightradar24-card-editor alias:", t);
  }
}));
Tt();
var wt = "0.4.0";
wt !== "___CARD_VERSION___" && console.info(`%cFLIGHTRADAR24-CARD%c v${wt} `, "color: #236597; font-weight: bold", "color: inherit; font-weight: normal");
var It = class extends HTMLElement {
  constructor() {
    super(), this._radarResizeObserver = null, this._zoomCleanup = null, this._updateRequired = !0, this._timer = null, this._unsubStateChangesPromise = null, this._intersectionObserver = null, this._visibilityChangeHandler = null, this._layoutOptions = null;
    try {
      this.attachShadow({ mode: "open" }), this.cardState = new kt(), this.cardState.setRenderDynamic(() => this.renderDynamic());
    } catch (t) {
      console.error("[FR24Card] constructor error:", t), this.cardState = new kt();
    }
  }
  setConfig(t) {
    try {
      if (!t) throw new Error("Configuration is missing.");
      this.cardState._leafletMap && (this.cardState._leafletMap.remove(), this.cardState._leafletMap = null, this.cardState._currentMapConfig = void 0), this.cardState.setConfig(t), Wt(this.cardState, this), this.observeRadarResize();
    } catch (e) {
      console.error("[FR24Card] setConfig error:", e);
    }
  }
  static async getConfigElement(t) {
    await Promise.resolve().then(() => (Tt(), ce));
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
  getGridSize() {
    return 1;
  }
  getLayoutOptions() {
    return this._layoutOptions ?? {
      columns: 1,
      rows: 1
    };
  }
  setLayoutOptions(t) {
    this._layoutOptions = t;
  }
  cardSize() {
    return 2;
  }
  set hass(t) {
    try {
      this.cardState.hass = t, this._unsubStateChangesPromise || (this._unsubStateChangesPromise = this.subscribeToStateChanges(t)), this._updateRequired && (this._updateRequired = !1, setTimeout(() => {
        this.fetchFlightsData(), requestAnimationFrame(() => {
          this.updateCardDimensions(), Bt(this.cardState, this.shadowRoot, () => {
            try {
              st(this.cardState), at(this.cardState);
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
      }, this.cardState.radar.hide !== !0 && (st(this.cardState), at(this.cardState)));
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
              this.cardState._leafletMap?.invalidateSize({ pan: !1 }), Vt(this.cardState);
            } catch (e) {
              console.error("[FR24Card] ResizeObserver map refresh error:", e);
            }
          });
        } catch (e) {
          console.error("[FR24Card] ResizeObserver error:", e);
        }
      }), this._radarResizeObserver.observe(t), this._zoomCleanup && this._zoomCleanup(), this._zoomCleanup = At(this.cardState, t);
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
      }] : this.cardState.config.filter : void 0, i = this.cardState.flights.length, o = a ? Rt(this.cardState, a) : this.cardState.flights, r = o.length;
      if (o.sort(this.cardState.sortFn), this.cardState.radar.hide !== !0 && requestAnimationFrame(() => {
        try {
          at(this.cardState);
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
        n.className = "list-status", n.innerHTML = pt(this.cardState, "list_status", null, (d) => (...l) => l?.filter((u) => u).join(d || " ")), e.appendChild(n);
      }
      if (r === 0) {
        if (this.cardState.config.no_flights_message !== "") {
          const n = document.createElement("div");
          n.className = "no-flights-message", n.textContent = this.cardState.config.no_flights_message || "", e.appendChild(n);
        }
      } else {
        const n = this.cardState.config.max_flights;
        (n && n > 0 ? o.slice(0, n) : o).forEach((d, l) => {
          const u = ae(this.cardState, d);
          l === 0 && (u.className += " first"), e.appendChild(u);
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
      const a = Date.now() / 1e3, i = K(this.cardState);
      if (i) {
        const o = i.latitude, r = i.longitude;
        this.cardState.flights.forEach((n) => {
          n._timestamp || (n._timestamp = a), e = e || n.ground_speed > 0;
          const d = a - (n._timestamp || a);
          if (d > 1) {
            t = !0, n._timestamp = a;
            const l = nt(n.latitude, n.longitude, n.heading, n.ground_speed * 1.852 / 3600 * d);
            n.latitude = l.lat, n.longitude = l.lon;
            const u = Math.max(n.altitude + d / 60 * n.vertical_speed, 0);
            (n.landed || u !== n.altitude && u === 0) && (n.landed = !0, n.ground_speed = Math.max(n.ground_speed - 15 * d, 15)), n.altitude = u;
          }
          if (n.distance_to_tracker = j(o, r, n.latitude, n.longitude, this.cardState.units.distance), n.heading_from_tracker = V(o, r, n.latitude, n.longitude), n.cardinal_direction_from_tracker = Nt(n.heading_from_tracker), n.is_approaching = ht((n.heading_from_tracker + 180) % 360, n.heading), n.is_receding = ht(n.heading_from_tracker, n.heading), n.is_approaching) {
            let l = Pt(o, r, n.latitude, n.longitude, n.heading);
            n.closest_passing_distance = Math.round(j(o, r, l.lat, l.lon, this.cardState.units.distance));
            const u = this.calculateETA(n.latitude, n.longitude, l.lat, l.lon, n.ground_speed);
            if (n.eta_to_closest_distance = Math.round(u), n.vertical_speed < 0 && n.altitude > 0) {
              const _ = n.altitude / Math.abs(n.vertical_speed), m = nt(n.latitude, n.longitude, n.heading, n.ground_speed * _ / 60), g = j(o, r, m.lat, m.lon, this.cardState.units.distance);
              _ < u && (n.is_landing = !0, n.closest_passing_distance = Math.round(g), n.eta_to_closest_distance = Math.round(_), l = m);
            }
            n.heading_from_tracker_to_closest_passing = Math.round(V(o, r, l.lat, l.lon));
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
      const r = j(t, e, a, i, this.cardState.units.distance);
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
customElements.define("flightradar24-radar-card", It);
if (!customElements.get("flightradar24-card")) try {
  customElements.define("flightradar24-card", class extends It {
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
