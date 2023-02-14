function S() {
  if (document.querySelector("hc-main"))
    return document.querySelector("hc-main").hass;
  if (document.querySelector("home-assistant"))
    return document.querySelector("home-assistant").hass;
}
function Xe(t) {
  if (document.querySelector("hc-main"))
    return document.querySelector("hc-main").provideHass(t);
  if (document.querySelector("home-assistant"))
    return document.querySelector("home-assistant").provideHass(t);
}
function Qe() {
  var t = document.querySelector("hc-main");
  return t ? (t = t && t.shadowRoot, t = t && t.querySelector("hc-lovelace"), t = t && t.shadowRoot, t = t && t.querySelector("hui-view") || t.querySelector("hui-panel-view"), t) : (t = document.querySelector("home-assistant"), t = t && t.shadowRoot, t = t && t.querySelector("home-assistant-main"), t = t && t.shadowRoot, t = t && t.querySelector("app-drawer-layout partial-panel-resolver"), t = t && t.shadowRoot || t, t = t && t.querySelector("ha-panel-lovelace"), t = t && t.shadowRoot, t = t && t.querySelector("hui-root"), t = t && t.shadowRoot, t = t && t.querySelector("ha-app-layout"), t = t && t.querySelector("#view"), t = t && t.firstElementChild, t);
}
async function et() {
  if (customElements.get("hui-view"))
    return !0;
  await customElements.whenDefined("partial-panel-resolver");
  const t = document.createElement("partial-panel-resolver");
  if (t.hass = { panels: [{
    url_path: "tmp",
    component_name: "lovelace"
  }] }, t._updateRoutes(), await t.routerOptions.routes.tmp.load(), !customElements.get("ha-panel-lovelace"))
    return !1;
  const e = document.createElement("ha-panel-lovelace");
  return e.hass = S(), e.hass === void 0 && (await new Promise((r) => {
    window.addEventListener("connection-status", (i) => {
      console.log(i), r();
    }, { once: !0 });
  }), e.hass = S()), e.panel = { config: { mode: null } }, e._fetchConfig(), !0;
}
var he, pe;
(function(t) {
  t.language = "language", t.system = "system", t.comma_decimal = "comma_decimal", t.decimal_comma = "decimal_comma", t.space_comma = "space_comma", t.none = "none";
})(he || (he = {})), function(t) {
  t.language = "language", t.system = "system", t.am_pm = "12", t.twenty_four = "24";
}(pe || (pe = {}));
function Y(t) {
  return t.substr(0, t.indexOf("."));
}
function tt(t) {
  return t.substr(t.indexOf(".") + 1);
}
var rt = ["closed", "locked", "off"], v = function(t, e, r, i) {
  i = i || {}, r = r ?? {};
  var n = new Event(e, { bubbles: i.bubbles === void 0 || i.bubbles, cancelable: Boolean(i.cancelable), composed: i.composed === void 0 || i.composed });
  return n.detail = r, t.dispatchEvent(n), n;
}, me = { alert: "mdi:alert", automation: "mdi:playlist-play", calendar: "mdi:calendar", camera: "mdi:video", climate: "mdi:thermostat", configurator: "mdi:settings", conversation: "mdi:text-to-speech", device_tracker: "mdi:account", fan: "mdi:fan", group: "mdi:google-circles-communities", history_graph: "mdi:chart-line", homeassistant: "mdi:home-assistant", homekit: "mdi:home-automation", image_processing: "mdi:image-filter-frames", input_boolean: "mdi:drawing", input_datetime: "mdi:calendar-clock", input_number: "mdi:ray-vertex", input_select: "mdi:format-list-bulleted", input_text: "mdi:textbox", light: "mdi:lightbulb", mailbox: "mdi:mailbox", notify: "mdi:comment-alert", person: "mdi:account", plant: "mdi:flower", proximity: "mdi:apple-safari", remote: "mdi:remote", scene: "mdi:google-pages", script: "mdi:file-document", sensor: "mdi:eye", simple_alarm: "mdi:bell", sun: "mdi:white-balance-sunny", switch: "mdi:flash", timer: "mdi:timer", updater: "mdi:cloud-upload", vacuum: "mdi:robot-vacuum", water_heater: "mdi:thermometer", weblink: "mdi:open-in-new" };
function V(t, e) {
  if (t in me)
    return me[t];
  switch (t) {
    case "alarm_control_panel":
      switch (e) {
        case "armed_home":
          return "mdi:bell-plus";
        case "armed_night":
          return "mdi:bell-sleep";
        case "disarmed":
          return "mdi:bell-outline";
        case "triggered":
          return "mdi:bell-ring";
        default:
          return "mdi:bell";
      }
    case "binary_sensor":
      return e && e === "off" ? "mdi:radiobox-blank" : "mdi:checkbox-marked-circle";
    case "cover":
      return e === "closed" ? "mdi:window-closed" : "mdi:window-open";
    case "lock":
      return e && e === "unlocked" ? "mdi:lock-open" : "mdi:lock";
    case "media_player":
      return e && e !== "off" && e !== "idle" ? "mdi:cast-connected" : "mdi:cast";
    case "zwave":
      switch (e) {
        case "dead":
          return "mdi:emoticon-dead";
        case "sleeping":
          return "mdi:sleep";
        case "initializing":
          return "mdi:timer-sand";
        default:
          return "mdi:z-wave";
      }
    default:
      return console.warn("Unable to find icon for domain " + t + " (" + e + ")"), "mdi:bookmark";
  }
}
var m = function(t) {
  v(window, "haptic", t);
}, it = function(t, e, r) {
  r === void 0 && (r = !1), r ? history.replaceState(null, "", e) : history.pushState(null, "", e), v(window, "location-changed", { replace: r });
}, nt = function(t, e, r) {
  r === void 0 && (r = !0);
  var i, n = Y(e), s = n === "group" ? "homeassistant" : n;
  switch (n) {
    case "lock":
      i = r ? "unlock" : "lock";
      break;
    case "cover":
      i = r ? "open_cover" : "close_cover";
      break;
    default:
      i = r ? "turn_on" : "turn_off";
  }
  return t.callService(s, i, { entity_id: e });
}, st = function(t, e) {
  var r = rt.includes(t.states[e].state);
  return nt(t, e, r);
}, Le = function() {
  var t = document.querySelector("home-assistant");
  if (t = (t = (t = (t = (t = (t = (t = (t = t && t.shadowRoot) && t.querySelector("home-assistant-main")) && t.shadowRoot) && t.querySelector("app-drawer-layout partial-panel-resolver")) && t.shadowRoot || t) && t.querySelector("ha-panel-lovelace")) && t.shadowRoot) && t.querySelector("hui-root")) {
    var e = t.lovelace;
    return e.current_view = t.___curView, e;
  }
  return null;
}, fe = { humidity: "mdi:water-percent", illuminance: "mdi:brightness-5", temperature: "mdi:thermometer", pressure: "mdi:gauge", power: "mdi:flash", signal_strength: "mdi:wifi" }, ve = { binary_sensor: function(t, e) {
  var r = t === "off";
  switch (e == null ? void 0 : e.attributes.device_class) {
    case "battery":
      return r ? "mdi:battery" : "mdi:battery-outline";
    case "battery_charging":
      return r ? "mdi:battery" : "mdi:battery-charging";
    case "cold":
      return r ? "mdi:thermometer" : "mdi:snowflake";
    case "connectivity":
      return r ? "mdi:server-network-off" : "mdi:server-network";
    case "door":
      return r ? "mdi:door-closed" : "mdi:door-open";
    case "garage_door":
      return r ? "mdi:garage" : "mdi:garage-open";
    case "power":
      return r ? "mdi:power-plug-off" : "mdi:power-plug";
    case "gas":
    case "problem":
    case "safety":
    case "tamper":
      return r ? "mdi:check-circle" : "mdi:alert-circle";
    case "smoke":
      return r ? "mdi:check-circle" : "mdi:smoke";
    case "heat":
      return r ? "mdi:thermometer" : "mdi:fire";
    case "light":
      return r ? "mdi:brightness-5" : "mdi:brightness-7";
    case "lock":
      return r ? "mdi:lock" : "mdi:lock-open";
    case "moisture":
      return r ? "mdi:water-off" : "mdi:water";
    case "motion":
      return r ? "mdi:walk" : "mdi:run";
    case "occupancy":
      return r ? "mdi:home-outline" : "mdi:home";
    case "opening":
      return r ? "mdi:square" : "mdi:square-outline";
    case "plug":
      return r ? "mdi:power-plug-off" : "mdi:power-plug";
    case "presence":
      return r ? "mdi:home-outline" : "mdi:home";
    case "running":
      return r ? "mdi:stop" : "mdi:play";
    case "sound":
      return r ? "mdi:music-note-off" : "mdi:music-note";
    case "update":
      return r ? "mdi:package" : "mdi:package-up";
    case "vibration":
      return r ? "mdi:crop-portrait" : "mdi:vibrate";
    case "window":
      return r ? "mdi:window-closed" : "mdi:window-open";
    default:
      return r ? "mdi:radiobox-blank" : "mdi:checkbox-marked-circle";
  }
}, cover: function(t) {
  var e = t.state !== "closed";
  switch (t.attributes.device_class) {
    case "garage":
      return e ? "mdi:garage-open" : "mdi:garage";
    case "door":
      return e ? "mdi:door-open" : "mdi:door-closed";
    case "shutter":
      return e ? "mdi:window-shutter-open" : "mdi:window-shutter";
    case "blind":
      return e ? "mdi:blinds-open" : "mdi:blinds";
    case "window":
      return e ? "mdi:window-open" : "mdi:window-closed";
    default:
      return V("cover", t.state);
  }
}, sensor: function(t) {
  var e = t.attributes.device_class;
  if (e && e in fe)
    return fe[e];
  if (e === "battery") {
    var r = Number(t.state);
    if (isNaN(r))
      return "mdi:battery-unknown";
    var i = 10 * Math.round(r / 10);
    return i >= 100 ? "mdi:battery" : i <= 0 ? "mdi:battery-alert" : "hass:battery-" + i;
  }
  var n = t.attributes.unit_of_measurement;
  return n === "°C" || n === "°F" ? "mdi:thermometer" : V("sensor");
}, input_datetime: function(t) {
  return t.attributes.has_date ? t.attributes.has_time ? V("input_datetime") : "mdi:calendar" : "mdi:clock";
} }, ot = function(t) {
  if (!t)
    return "mdi:bookmark";
  if (t.attributes.icon)
    return t.attributes.icon;
  var e = Y(t.entity_id);
  return e in ve ? ve[e](t) : V(e, t.state);
}, at = function(e) {
  return lt(e) && !ct(e);
};
function lt(t) {
  return !!t && typeof t == "object";
}
function ct(t) {
  var e = Object.prototype.toString.call(t);
  return e === "[object RegExp]" || e === "[object Date]" || ht(t);
}
var ut = typeof Symbol == "function" && Symbol.for, dt = ut ? Symbol.for("react.element") : 60103;
function ht(t) {
  return t.$$typeof === dt;
}
function pt(t) {
  return Array.isArray(t) ? [] : {};
}
function M(t, e) {
  return e.clone !== !1 && e.isMergeableObject(t) ? T(pt(t), t, e) : t;
}
function mt(t, e, r) {
  return t.concat(e).map(function(i) {
    return M(i, r);
  });
}
function ft(t, e) {
  if (!e.customMerge)
    return T;
  var r = e.customMerge(t);
  return typeof r == "function" ? r : T;
}
function vt(t) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(e) {
    return Object.propertyIsEnumerable.call(t, e);
  }) : [];
}
function ye(t) {
  return Object.keys(t).concat(vt(t));
}
function Ie(t, e) {
  try {
    return e in t;
  } catch {
    return !1;
  }
}
function yt(t, e) {
  return Ie(t, e) && !(Object.hasOwnProperty.call(t, e) && Object.propertyIsEnumerable.call(t, e));
}
function bt(t, e, r) {
  var i = {};
  return r.isMergeableObject(t) && ye(t).forEach(function(n) {
    i[n] = M(t[n], r);
  }), ye(e).forEach(function(n) {
    yt(t, n) || (Ie(t, n) && r.isMergeableObject(e[n]) ? i[n] = ft(n, r)(t[n], e[n], r) : i[n] = M(e[n], r));
  }), i;
}
function T(t, e, r) {
  r = r || {}, r.arrayMerge = r.arrayMerge || mt, r.isMergeableObject = r.isMergeableObject || at, r.cloneUnlessOtherwiseSpecified = M;
  var i = Array.isArray(e), n = Array.isArray(t), s = i === n;
  return s ? i ? r.arrayMerge(t, e, r) : bt(t, e, r) : M(e, r);
}
T.all = function(e, r) {
  if (!Array.isArray(e))
    throw new Error("first argument should be an array");
  return e.reduce(function(i, n) {
    return T(i, n, r);
  }, {});
};
var _t = T, oe = _t;
const W = window, ce = W.ShadowRoot && (W.ShadyCSS === void 0 || W.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ce = Symbol(), be = /* @__PURE__ */ new WeakMap();
let gt = class {
  constructor(e, r, i) {
    if (this._$cssResult$ = !0, i !== Ce)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = r;
  }
  get styleSheet() {
    let e = this.o;
    const r = this.t;
    if (ce && e === void 0) {
      const i = r !== void 0 && r.length === 1;
      i && (e = be.get(r)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && be.set(r, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ze = (t) => new gt(typeof t == "string" ? t : t + "", void 0, Ce), $t = (t, e) => {
  ce ? t.adoptedStyleSheets = e.map((r) => r instanceof CSSStyleSheet ? r : r.styleSheet) : e.forEach((r) => {
    const i = document.createElement("style"), n = W.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = r.cssText, t.appendChild(i);
  });
}, _e = ce ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let r = "";
  for (const i of e.cssRules)
    r += i.cssText;
  return ze(r);
})(t) : t;
var G;
const Z = window, ge = Z.trustedTypes, wt = ge ? ge.emptyScript : "", $e = Z.reactiveElementPolyfillSupport, ae = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? wt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let r = t;
  switch (e) {
    case Boolean:
      r = t !== null;
      break;
    case Number:
      r = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        r = JSON.parse(t);
      } catch {
        r = null;
      }
  }
  return r;
} }, je = (t, e) => e !== t && (e == e || t == t), X = { attribute: !0, type: String, converter: ae, reflect: !1, hasChanged: je };
let E = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this.u();
  }
  static addInitializer(e) {
    var r;
    this.finalize(), ((r = this.h) !== null && r !== void 0 ? r : this.h = []).push(e);
  }
  static get observedAttributes() {
    this.finalize();
    const e = [];
    return this.elementProperties.forEach((r, i) => {
      const n = this._$Ep(i, r);
      n !== void 0 && (this._$Ev.set(n, i), e.push(n));
    }), e;
  }
  static createProperty(e, r = X) {
    if (r.state && (r.attribute = !1), this.finalize(), this.elementProperties.set(e, r), !r.noAccessor && !this.prototype.hasOwnProperty(e)) {
      const i = typeof e == "symbol" ? Symbol() : "__" + e, n = this.getPropertyDescriptor(e, i, r);
      n !== void 0 && Object.defineProperty(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, r, i) {
    return { get() {
      return this[r];
    }, set(n) {
      const s = this[e];
      this[r] = n, this.requestUpdate(e, s, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) || X;
  }
  static finalize() {
    if (this.hasOwnProperty("finalized"))
      return !1;
    this.finalized = !0;
    const e = Object.getPrototypeOf(this);
    if (e.finalize(), e.h !== void 0 && (this.h = [...e.h]), this.elementProperties = new Map(e.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const r = this.properties, i = [...Object.getOwnPropertyNames(r), ...Object.getOwnPropertySymbols(r)];
      for (const n of i)
        this.createProperty(n, r[n]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(e) {
    const r = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const n of i)
        r.unshift(_e(n));
    } else
      e !== void 0 && r.push(_e(e));
    return r;
  }
  static _$Ep(e, r) {
    const i = r.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  u() {
    var e;
    this._$E_ = new Promise((r) => this.enableUpdating = r), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (e = this.constructor.h) === null || e === void 0 || e.forEach((r) => r(this));
  }
  addController(e) {
    var r, i;
    ((r = this._$ES) !== null && r !== void 0 ? r : this._$ES = []).push(e), this.renderRoot !== void 0 && this.isConnected && ((i = e.hostConnected) === null || i === void 0 || i.call(e));
  }
  removeController(e) {
    var r;
    (r = this._$ES) === null || r === void 0 || r.splice(this._$ES.indexOf(e) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((e, r) => {
      this.hasOwnProperty(r) && (this._$Ei.set(r, this[r]), delete this[r]);
    });
  }
  createRenderRoot() {
    var e;
    const r = (e = this.shadowRoot) !== null && e !== void 0 ? e : this.attachShadow(this.constructor.shadowRootOptions);
    return $t(r, this.constructor.elementStyles), r;
  }
  connectedCallback() {
    var e;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$ES) === null || e === void 0 || e.forEach((r) => {
      var i;
      return (i = r.hostConnected) === null || i === void 0 ? void 0 : i.call(r);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((r) => {
      var i;
      return (i = r.hostDisconnected) === null || i === void 0 ? void 0 : i.call(r);
    });
  }
  attributeChangedCallback(e, r, i) {
    this._$AK(e, i);
  }
  _$EO(e, r, i = X) {
    var n;
    const s = this.constructor._$Ep(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const o = (((n = i.converter) === null || n === void 0 ? void 0 : n.toAttribute) !== void 0 ? i.converter : ae).toAttribute(r, i.type);
      this._$El = e, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$El = null;
    }
  }
  _$AK(e, r) {
    var i;
    const n = this.constructor, s = n._$Ev.get(e);
    if (s !== void 0 && this._$El !== s) {
      const o = n.getPropertyOptions(s), u = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((i = o.converter) === null || i === void 0 ? void 0 : i.fromAttribute) !== void 0 ? o.converter : ae;
      this._$El = s, this[s] = u.fromAttribute(r, o.type), this._$El = null;
    }
  }
  requestUpdate(e, r, i) {
    let n = !0;
    e !== void 0 && (((i = i || this.constructor.getPropertyOptions(e)).hasChanged || je)(this[e], r) ? (this._$AL.has(e) || this._$AL.set(e, r), i.reflect === !0 && this._$El !== e && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(e, i))) : n = !1), !this.isUpdatePending && n && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = !0;
    try {
      await this._$E_;
    } catch (r) {
      Promise.reject(r);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var e;
    if (!this.isUpdatePending)
      return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((n, s) => this[s] = n), this._$Ei = void 0);
    let r = !1;
    const i = this._$AL;
    try {
      r = this.shouldUpdate(i), r ? (this.willUpdate(i), (e = this._$ES) === null || e === void 0 || e.forEach((n) => {
        var s;
        return (s = n.hostUpdate) === null || s === void 0 ? void 0 : s.call(n);
      }), this.update(i)) : this._$Ek();
    } catch (n) {
      throw r = !1, this._$Ek(), n;
    }
    r && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var r;
    (r = this._$ES) === null || r === void 0 || r.forEach((i) => {
      var n;
      return (n = i.hostUpdated) === null || n === void 0 ? void 0 : n.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$EC !== void 0 && (this._$EC.forEach((r, i) => this._$EO(i, this[i], r)), this._$EC = void 0), this._$Ek();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
E.finalized = !0, E.elementProperties = /* @__PURE__ */ new Map(), E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, $e == null || $e({ ReactiveElement: E }), ((G = Z.reactiveElementVersions) !== null && G !== void 0 ? G : Z.reactiveElementVersions = []).push("1.6.1");
var Q;
const J = window, k = J.trustedTypes, we = k ? k.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, b = `lit$${(Math.random() + "").slice(9)}$`, De = "?" + b, Et = `<${De}>`, O = document, L = (t = "") => O.createComment(t), I = (t) => t === null || typeof t != "object" && typeof t != "function", qe = Array.isArray, At = (t) => qe(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ee = /-->/g, Ae = />/g, g = RegExp(`>|[ 	
\f\r](?:([^\\s"'>=/]+)([ 	
\f\r]*=[ 	
\f\r]*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Se = /'/g, xe = /"/g, Be = /^(?:script|style|textarea|title)$/i, St = (t) => (e, ...r) => ({ _$litType$: t, strings: e, values: r }), y = St(1), _ = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Te = /* @__PURE__ */ new WeakMap(), x = O.createTreeWalker(O, 129, null, !1), xt = (t, e) => {
  const r = t.length - 1, i = [];
  let n, s = e === 2 ? "<svg>" : "", o = P;
  for (let a = 0; a < r; a++) {
    const l = t[a];
    let p, c, d = -1, f = 0;
    for (; f < l.length && (o.lastIndex = f, c = o.exec(l), c !== null); )
      f = o.lastIndex, o === P ? c[1] === "!--" ? o = Ee : c[1] !== void 0 ? o = Ae : c[2] !== void 0 ? (Be.test(c[2]) && (n = RegExp("</" + c[2], "g")), o = g) : c[3] !== void 0 && (o = g) : o === g ? c[0] === ">" ? (o = n ?? P, d = -1) : c[1] === void 0 ? d = -2 : (d = o.lastIndex - c[2].length, p = c[1], o = c[3] === void 0 ? g : c[3] === '"' ? xe : Se) : o === xe || o === Se ? o = g : o === Ee || o === Ae ? o = P : (o = g, n = void 0);
    const q = o === g && t[a + 1].startsWith("/>") ? " " : "";
    s += o === P ? l + Et : d >= 0 ? (i.push(p), l.slice(0, d) + "$lit$" + l.slice(d) + b + q) : l + b + (d === -2 ? (i.push(void 0), a) : q);
  }
  const u = s + (t[r] || "<?>") + (e === 2 ? "</svg>" : "");
  if (!Array.isArray(t) || !t.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return [we !== void 0 ? we.createHTML(u) : u, i];
};
class C {
  constructor({ strings: e, _$litType$: r }, i) {
    let n;
    this.parts = [];
    let s = 0, o = 0;
    const u = e.length - 1, a = this.parts, [l, p] = xt(e, r);
    if (this.el = C.createElement(l, i), x.currentNode = this.el.content, r === 2) {
      const c = this.el.content, d = c.firstChild;
      d.remove(), c.append(...d.childNodes);
    }
    for (; (n = x.nextNode()) !== null && a.length < u; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) {
          const c = [];
          for (const d of n.getAttributeNames())
            if (d.endsWith("$lit$") || d.startsWith(b)) {
              const f = p[o++];
              if (c.push(d), f !== void 0) {
                const q = n.getAttribute(f.toLowerCase() + "$lit$").split(b), B = /([.?@])?(.*)/.exec(f);
                a.push({ type: 1, index: s, name: B[2], strings: q, ctor: B[1] === "." ? kt : B[1] === "?" ? Ht : B[1] === "@" ? Pt : K });
              } else
                a.push({ type: 6, index: s });
            }
          for (const d of c)
            n.removeAttribute(d);
        }
        if (Be.test(n.tagName)) {
          const c = n.textContent.split(b), d = c.length - 1;
          if (d > 0) {
            n.textContent = k ? k.emptyScript : "";
            for (let f = 0; f < d; f++)
              n.append(c[f], L()), x.nextNode(), a.push({ type: 2, index: ++s });
            n.append(c[d], L());
          }
        }
      } else if (n.nodeType === 8)
        if (n.data === De)
          a.push({ type: 2, index: s });
        else {
          let c = -1;
          for (; (c = n.data.indexOf(b, c + 1)) !== -1; )
            a.push({ type: 7, index: s }), c += b.length - 1;
        }
      s++;
    }
  }
  static createElement(e, r) {
    const i = O.createElement("template");
    return i.innerHTML = e, i;
  }
}
function H(t, e, r = t, i) {
  var n, s, o, u;
  if (e === _)
    return e;
  let a = i !== void 0 ? (n = r._$Co) === null || n === void 0 ? void 0 : n[i] : r._$Cl;
  const l = I(e) ? void 0 : e._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== l && ((s = a == null ? void 0 : a._$AO) === null || s === void 0 || s.call(a, !1), l === void 0 ? a = void 0 : (a = new l(t), a._$AT(t, r, i)), i !== void 0 ? ((o = (u = r)._$Co) !== null && o !== void 0 ? o : u._$Co = [])[i] = a : r._$Cl = a), a !== void 0 && (e = H(t, a._$AS(t, e.values), a, i)), e;
}
class Tt {
  constructor(e, r) {
    this.u = [], this._$AN = void 0, this._$AD = e, this._$AM = r;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  v(e) {
    var r;
    const { el: { content: i }, parts: n } = this._$AD, s = ((r = e == null ? void 0 : e.creationScope) !== null && r !== void 0 ? r : O).importNode(i, !0);
    x.currentNode = s;
    let o = x.nextNode(), u = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (u === l.index) {
        let p;
        l.type === 2 ? p = new D(o, o.nextSibling, this, e) : l.type === 1 ? p = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (p = new Rt(o, this, e)), this.u.push(p), l = n[++a];
      }
      u !== (l == null ? void 0 : l.index) && (o = x.nextNode(), u++);
    }
    return s;
  }
  p(e) {
    let r = 0;
    for (const i of this.u)
      i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, r), r += i.strings.length - 2) : i._$AI(e[r])), r++;
  }
}
class D {
  constructor(e, r, i, n) {
    var s;
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = r, this._$AM = i, this.options = n, this._$Cm = (s = n == null ? void 0 : n.isConnected) === null || s === void 0 || s;
  }
  get _$AU() {
    var e, r;
    return (r = (e = this._$AM) === null || e === void 0 ? void 0 : e._$AU) !== null && r !== void 0 ? r : this._$Cm;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const r = this._$AM;
    return r !== void 0 && e.nodeType === 11 && (e = r.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, r = this) {
    e = H(this, e, r), I(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== _ && this.g(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : At(e) ? this.k(e) : this.g(e);
  }
  O(e, r = this._$AB) {
    return this._$AA.parentNode.insertBefore(e, r);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  g(e) {
    this._$AH !== h && I(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var r;
    const { values: i, _$litType$: n } = e, s = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = C.createElement(n.h, this.options)), n);
    if (((r = this._$AH) === null || r === void 0 ? void 0 : r._$AD) === s)
      this._$AH.p(i);
    else {
      const o = new Tt(s, this), u = o.v(this.options);
      o.p(i), this.T(u), this._$AH = o;
    }
  }
  _$AC(e) {
    let r = Te.get(e.strings);
    return r === void 0 && Te.set(e.strings, r = new C(e)), r;
  }
  k(e) {
    qe(this._$AH) || (this._$AH = [], this._$AR());
    const r = this._$AH;
    let i, n = 0;
    for (const s of e)
      n === r.length ? r.push(i = new D(this.O(L()), this.O(L()), this, this.options)) : i = r[n], i._$AI(s), n++;
    n < r.length && (this._$AR(i && i._$AB.nextSibling, n), r.length = n);
  }
  _$AR(e = this._$AA.nextSibling, r) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, !1, !0, r); e && e !== this._$AB; ) {
      const n = e.nextSibling;
      e.remove(), e = n;
    }
  }
  setConnected(e) {
    var r;
    this._$AM === void 0 && (this._$Cm = e, (r = this._$AP) === null || r === void 0 || r.call(this, e));
  }
}
class K {
  constructor(e, r, i, n, s) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = r, this._$AM = n, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e, r = this, i, n) {
    const s = this.strings;
    let o = !1;
    if (s === void 0)
      e = H(this, e, r, 0), o = !I(e) || e !== this._$AH && e !== _, o && (this._$AH = e);
    else {
      const u = e;
      let a, l;
      for (e = s[0], a = 0; a < s.length - 1; a++)
        l = H(this, u[i + a], r, a), l === _ && (l = this._$AH[a]), o || (o = !I(l) || l !== this._$AH[a]), l === h ? e = h : e !== h && (e += (l ?? "") + s[a + 1]), this._$AH[a] = l;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class kt extends K {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
const Ot = k ? k.emptyScript : "";
class Ht extends K {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    e && e !== h ? this.element.setAttribute(this.name, Ot) : this.element.removeAttribute(this.name);
  }
}
class Pt extends K {
  constructor(e, r, i, n, s) {
    super(e, r, i, n, s), this.type = 5;
  }
  _$AI(e, r = this) {
    var i;
    if ((e = (i = H(this, e, r, 0)) !== null && i !== void 0 ? i : h) === _)
      return;
    const n = this._$AH, s = e === h && n !== h || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, o = e !== h && (n === h || s);
    s && this.element.removeEventListener(this.name, this, n), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var r, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (r = this.options) === null || r === void 0 ? void 0 : r.host) !== null && i !== void 0 ? i : this.element, e) : this._$AH.handleEvent(e);
  }
}
class Rt {
  constructor(e, r, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = r, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    H(this, e);
  }
}
const ke = J.litHtmlPolyfillSupport;
ke == null || ke(C, D), ((Q = J.litHtmlVersions) !== null && Q !== void 0 ? Q : J.litHtmlVersions = []).push("2.6.1");
const Nt = (t, e, r) => {
  var i, n;
  const s = (i = r == null ? void 0 : r.renderBefore) !== null && i !== void 0 ? i : e;
  let o = s._$litPart$;
  if (o === void 0) {
    const u = (n = r == null ? void 0 : r.renderBefore) !== null && n !== void 0 ? n : null;
    s._$litPart$ = o = new D(e.insertBefore(L(), u), u, void 0, r ?? {});
  }
  return o._$AI(t), o;
};
var ee, te;
class N extends E {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Dt = void 0;
  }
  createRenderRoot() {
    var e, r;
    const i = super.createRenderRoot();
    return (e = (r = this.renderOptions).renderBefore) !== null && e !== void 0 || (r.renderBefore = i.firstChild), i;
  }
  update(e) {
    const r = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Dt = Nt(r, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Dt) === null || e === void 0 || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Dt) === null || e === void 0 || e.setConnected(!1);
  }
  render() {
    return _;
  }
}
N.finalized = !0, N._$litElement$ = !0, (ee = globalThis.litElementHydrateSupport) === null || ee === void 0 || ee.call(globalThis, { LitElement: N });
const Oe = globalThis.litElementPolyfillSupport;
Oe == null || Oe({ LitElement: N });
((te = globalThis.litElementVersions) !== null && te !== void 0 ? te : globalThis.litElementVersions = []).push("3.2.0");
const Ut = (t) => (e) => typeof e == "function" ? ((r, i) => (customElements.define(r, i), i))(t, e) : ((r, i) => {
  const { kind: n, elements: s } = i;
  return { kind: n, elements: s, finisher(o) {
    customElements.define(r, o);
  } };
})(t, e);
const Mt = (t, e) => e.kind === "method" && e.descriptor && !("value" in e.descriptor) ? { ...e, finisher(r) {
  r.createProperty(e.key, t);
} } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: e.key, initializer() {
  typeof e.initializer == "function" && (this[e.key] = e.initializer.call(this));
}, finisher(r) {
  r.createProperty(e.key, t);
} };
function Ve(t) {
  return (e, r) => r !== void 0 ? ((i, n, s) => {
    n.constructor.createProperty(s, i);
  })(t, e, r) : Mt(t, e);
}
var re;
((re = window.HTMLSlotElement) === null || re === void 0 ? void 0 : re.prototype.assignedElements) != null;
const ie = (t) => t ?? h;
const Lt = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, We = (t) => (...e) => ({ _$litDirective$: t, values: e });
let Fe = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, r, i) {
    this._$Ct = e, this._$AM = r, this._$Ci = i;
  }
  _$AS(e, r) {
    return this.update(e, r);
  }
  update(e, r) {
    return this.render(...r);
  }
};
const $ = We(class extends Fe {
  constructor(t) {
    var e;
    if (super(t), t.type !== Lt.ATTRIBUTE || t.name !== "style" || ((e = t.strings) === null || e === void 0 ? void 0 : e.length) > 2)
      throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(t) {
    return Object.keys(t).reduce((e, r) => {
      const i = t[r];
      return i == null ? e : e + `${r = r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${i};`;
    }, "");
  }
  update(t, [e]) {
    const { style: r } = t.element;
    if (this.vt === void 0) {
      this.vt = /* @__PURE__ */ new Set();
      for (const i in e)
        this.vt.add(i);
      return this.render(e);
    }
    this.vt.forEach((i) => {
      e[i] == null && (this.vt.delete(i), i.includes("-") ? r.removeProperty(i) : r[i] = "");
    });
    for (const i in e) {
      const n = e[i];
      n != null && (this.vt.add(i), i.includes("-") ? r.setProperty(i, n) : r[i] = n);
    }
    return _;
  }
}), w = (t, e) => v(t, "hass-notification", e), ne = (t) => Array.isArray(t) ? t.reduce((e, r) => ({ ...e, ...r }), {}) : t, It = (t, e, r, i) => {
  let n;
  i === "double_tap" && r.double_tap_action ? n = r.double_tap_action : i === "hold" && r.hold_action ? n = r.hold_action : i === "tap" && r.tap_action && (n = r.tap_action), Ct(t, e, r, n);
};
function Ct(t, e, r, i) {
  if (i || (i = {
    action: "more-info"
  }), !(i.confirmation && (!i.confirmation.exemptions || !i.confirmation.exemptions.some(
    (n) => {
      var s;
      return n.user === ((s = e == null ? void 0 : e.user) == null ? void 0 : s.id);
    }
  )) && (m("warning"), !confirm(
    i.confirmation.text || `Are you sure you want to ${i.action}?`
  ))))
    switch (i.action) {
      case "more-info": {
        const n = i.entity || r.entity;
        n ? v(t, "hass-more-info", { entityId: n }) : (w(t, {
          message: e.localize(
            "ui.panel.lovelace.cards.actions.no_entity_more_info"
          )
        }), m("failure"));
        break;
      }
      case "navigate":
        if (!i.navigation_path) {
          w(t, {
            message: e.localize(
              "ui.panel.lovelace.cards.actions.no_navigation_path"
            )
          }), m("failure");
          return;
        }
        it(t, i.navigation_path), m("light");
        break;
      case "url":
        if (!i.url_path) {
          w(t, {
            message: e.localize("ui.panel.lovelace.cards.actions.no_url")
          }), m("failure");
          return;
        }
        window.open(i.url_path), m("light");
        break;
      case "toggle":
        if (!r.entity) {
          w(t, {
            message: e.localize(
              "ui.panel.lovelace.cards.actions.no_entity_toggle"
            )
          }), m("failure");
          return;
        }
        st(e, r.entity), m("light");
        break;
      case "call-service": {
        if (!i.service) {
          w(t, {
            message: e.localize("ui.panel.lovelace.cards.actions.no_service")
          }), m("failure");
          return;
        }
        const [n, s] = i.service.split(".", 2);
        e.callService(
          n,
          s,
          i.service_data,
          i.target
        ), m("light");
        break;
      }
      case "fire-event": {
        if (!i.event_type) {
          w(t, {
            message: "No event to call specified"
          }), m("failure");
          return;
        }
        e.callApi(
          "POST",
          `events/${i.event_type}`,
          i.event_data || {}
        ), m("light");
        break;
      }
      case "fire-dom-event":
        v(t, "ll-custom", i), m("light");
    }
}
function He(t) {
  return t !== void 0 && t.action !== "none";
}
const F = (t, e) => {
  if (t === e)
    return !0;
  if (t && e && typeof t == "object" && typeof e == "object") {
    if (t.constructor !== e.constructor)
      return !1;
    let r, i;
    if (Array.isArray(t)) {
      if (i = t.length, i !== e.length)
        return !1;
      for (r = i; r-- !== 0; )
        if (!F(t[r], e[r]))
          return !1;
      return !0;
    }
    if (t instanceof Map && e instanceof Map) {
      if (t.size !== e.size)
        return !1;
      for (r of t.entries())
        if (!e.has(r[0]))
          return !1;
      for (r of t.entries())
        if (!F(r[1], e.get(r[0])))
          return !1;
      return !0;
    }
    if (t instanceof Set && e instanceof Set) {
      if (t.size !== e.size)
        return !1;
      for (r of t.entries())
        if (!e.has(r[0]))
          return !1;
      return !0;
    }
    if (ArrayBuffer.isView(t) && ArrayBuffer.isView(e)) {
      if (i = t.length, i !== e.length)
        return !1;
      for (r = i; r-- !== 0; )
        if (t[r] !== e[r])
          return !1;
      return !0;
    }
    if (t.constructor === RegExp)
      return t.source === e.source && t.flags === e.flags;
    if (t.valueOf !== Object.prototype.valueOf)
      return t.valueOf() === e.valueOf();
    if (t.toString !== Object.prototype.toString)
      return t.toString() === e.toString();
    const n = Object.keys(t);
    if (i = n.length, i !== Object.keys(e).length)
      return !1;
    for (r = i; r-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(e, n[r]))
        return !1;
    for (r = i; r-- !== 0; ) {
      const s = n[r];
      if (!F(t[s], e[s]))
        return !1;
    }
    return !0;
  }
  return t !== t && e !== e;
}, Pe = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
class zt extends HTMLElement {
  constructor() {
    super(), this.holdTime = 500, this.held = !1, this.cancelled = !1, this.isRepeating = !1, this.ripple = document.createElement("mwc-ripple");
  }
  connectedCallback() {
    Object.assign(this.style, {
      position: "absolute",
      width: Pe ? "100px" : "50px",
      height: Pe ? "100px" : "50px",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      zIndex: "999"
    }), this.appendChild(this.ripple), this.ripple.primary = !0, [
      "touchcancel",
      "mouseout",
      "mouseup",
      "touchmove",
      "mousewheel",
      "wheel",
      "scroll"
    ].forEach((e) => {
      document.addEventListener(
        e,
        () => {
          this.cancelled = !0, this.timer && (this.stopAnimation(), clearTimeout(this.timer), this.timer = void 0, this.isRepeating && this.repeatTimeout && (clearInterval(this.repeatTimeout), this.isRepeating = !1));
        },
        { passive: !0 }
      );
    });
  }
  bind(e, r = {}) {
    e.actionHandler && F(r, e.actionHandler.options) || (e.actionHandler ? (e.actionHandler.start && (e.removeEventListener("touchstart", e.actionHandler.start), e.removeEventListener("mousedown", e.actionHandler.start)), e.actionHandler.end && (e.removeEventListener("touchend", e.actionHandler.end), e.removeEventListener("touchcancel", e.actionHandler.end), e.removeEventListener("click", e.actionHandler.end)), e.actionHandler.handleEnter && e.removeEventListener("keyup", e.actionHandler.handleEnter)) : e.addEventListener("contextmenu", (i) => {
      const n = i || window.event;
      return n.preventDefault && n.preventDefault(), n.stopPropagation && n.stopPropagation(), n.cancelBubble = !0, n.returnValue = !1, !1;
    }), e.actionHandler = { options: r }, !r.disabled && (e.actionHandler.start = (i) => {
      this.cancelled = !1;
      let n, s;
      i.touches ? (n = i.touches[0].pageX, s = i.touches[0].pageY) : (n = i.pageX, s = i.pageY), r.hasHold && (this.held = !1, this.timer = window.setTimeout(() => {
        this.startAnimation(n, s), this.held = !0, r.repeat && !this.isRepeating && (this.isRepeating = !0, this.repeatTimeout = setInterval(() => {
          v(e, "action", { action: "hold" });
        }, r.repeat));
      }, this.holdTime));
    }, e.actionHandler.end = (i) => {
      if (["touchend", "touchcancel"].includes(i.type) && this.cancelled) {
        this.isRepeating && this.repeatTimeout && (clearInterval(this.repeatTimeout), this.isRepeating = !1);
        return;
      }
      const n = i.target;
      i.cancelable && i.preventDefault(), r.hasHold && (clearTimeout(this.timer), this.isRepeating && this.repeatTimeout && clearInterval(this.repeatTimeout), this.isRepeating = !1, this.stopAnimation(), this.timer = void 0), r.hasHold && this.held ? r.repeat || v(n, "action", { action: "hold" }) : r.hasDoubleClick ? i.type === "click" && i.detail < 2 || !this.dblClickTimeout ? this.dblClickTimeout = window.setTimeout(() => {
        this.dblClickTimeout = void 0, v(n, "action", { action: "tap" });
      }, 250) : (clearTimeout(this.dblClickTimeout), this.dblClickTimeout = void 0, v(n, "action", { action: "double_tap" })) : v(n, "action", { action: "tap" });
    }, e.actionHandler.handleEnter = (i) => {
      var n, s;
      i.keyCode === 13 && ((s = (n = i.currentTarget.actionHandler) == null ? void 0 : n.end) == null || s.call(n, i));
    }, e.addEventListener("touchstart", e.actionHandler.start, {
      passive: !0
    }), e.addEventListener("touchend", e.actionHandler.end), e.addEventListener("touchcancel", e.actionHandler.end), e.addEventListener("mousedown", e.actionHandler.start, {
      passive: !0
    }), e.addEventListener("click", e.actionHandler.end), e.addEventListener("keyup", e.actionHandler.handleEnter)));
  }
  startAnimation(e, r) {
    Object.assign(this.style, {
      left: `${e}px`,
      top: `${r}px`,
      display: null
    }), this.ripple.disabled = !1, this.ripple.startPress(), this.ripple.unbounded = !0;
  }
  stopAnimation() {
    this.ripple.endPress(), this.ripple.disabled = !0, this.style.display = "none";
  }
}
customElements.define("paper-buttons-row-action-handler", zt);
const jt = () => {
  const t = document.body;
  if (t.querySelector("paper-buttons-row-action-handler"))
    return t.querySelector(
      "paper-buttons-row-action-handler"
    );
  const e = document.createElement(
    "paper-buttons-row-action-handler"
  );
  return t.appendChild(e), e;
}, Dt = (t, e) => {
  const r = jt();
  r && r.bind(t, e);
}, qt = We(
  class extends Fe {
    update(t, [e]) {
      return Dt(t.element, e), _;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    render(t) {
    }
  }
), Bt = /* @__PURE__ */ new Set([
  "fan",
  "input_boolean",
  "light",
  "switch",
  "group",
  "automation",
  "cover",
  "script",
  "vacuum",
  "lock"
]), Vt = /* @__PURE__ */ new Set(["open", "unlocked", "on"]), se = "on", Wt = "off", Ft = "unavailable", Yt = ["name", "icon", "image", "state"], Ye = (t) => t.attributes && t.attributes.friendly_name ? t.attributes.friendly_name : t.entity_id ? tt(t.entity_id).replace(/_/g, " ") : "Unknown";
function Re(t, e, r, i) {
  if (!r || !r.action || r.action === "none")
    return "";
  let n = (i ? t.localize("ui.panel.lovelace.cards.picture-elements.hold") : t.localize("ui.panel.lovelace.cards.picture-elements.tap")) + " ";
  switch (r.action) {
    case "navigate":
      n += `${t.localize(
        "ui.panel.lovelace.cards.picture-elements.navigate_to",
        "location",
        r.navigation_path
      )}`;
      break;
    case "url":
      n += `${t.localize(
        "ui.panel.lovelace.cards.picture-elements.url",
        "url_path",
        r.url_path
      )}`;
      break;
    case "toggle":
      n += `${t.localize(
        "ui.panel.lovelace.cards.picture-elements.toggle",
        "name",
        e
      )}`;
      break;
    case "call-service":
      n += `${t.localize(
        "ui.panel.lovelace.cards.picture-elements.call_service",
        "name",
        r.service
      )}`;
      break;
    case "more-info":
      n += `${t.localize(
        "ui.panel.lovelace.cards.picture-elements.more_info",
        "name",
        e
      )}`;
      break;
  }
  return n;
}
const Zt = (t, e) => {
  if (!e || t.tooltip === !1)
    return "";
  if (t.tooltip)
    return t.tooltip;
  let r = "", i = "";
  if (t.entity && (r = t.entity in e.states ? Ye(e.states[t.entity]) : t.entity), !t.tap_action && !t.hold_action)
    return r;
  const n = t.tap_action ? Re(e, r, t.tap_action, !1) : "", s = t.hold_action ? Re(e, r, t.hold_action, !0) : "";
  return i = n + (n && s ? `
` : "") + s, i;
};
let R = Le();
function Jt(t, e) {
  var n, s;
  R || (R = Le());
  const r = ((s = (n = R == null ? void 0 : R.config) == null ? void 0 : n.paper_buttons_row) == null ? void 0 : s.presets) || {}, i = t.preset || (e == null ? void 0 : e.preset);
  return i ? oe(
    {
      mushroom: Kt
    }[i] || r[i] || {},
    t
  ) : t;
}
const Kt = {
  ripple: "none",
  styles: {
    button: {
      "min-width": "42px",
      "min-height": "42px",
      "border-radius": "12px",
      "box-sizing": "border-box",
      transition: "background-color 280ms ease-in-out 0s",
      "--pbs-button-rgb-color": "var(--rgb-primary-text-color)",
      "--pbs-button-rgb-default-color": "var(--rgb-primary-text-color)",
      "--pbs-button-rgb-active-color": "var(--pbs-button-rgb-state-color)",
      "--pbs-button-rgb-bg-color": "var(--pbs-button-rgb-color)",
      "--pbs-button-rgb-bg-active-color": "var(--pbs-button-rgb-active-color)",
      "--pbs-button-rgb-bg-opacity": "0.05",
      "--pbs-button-rgb-bg-active-opacity": "0.2"
    }
  }
}, Gt = `.flex-box{display:flex;justify-content:space-evenly;align-items:center}.flex-column{display:inline-flex;flex-direction:column;align-items:center}.hidden{display:none}paper-button{--pbs-button-rgb-fallback: 68, 115, 158;color:var( --pbs-button-color, rgb( var( --pbs-button-rgb-color, var( --pbs-button-rgb-state-color, var( --pbs-button-rgb-default-color, var(--rgb-state-default-color, var(--pbs-button-rgb-fallback)) ) ) ) ) );background-color:var( --pbs-button-bg-color, rgba(var(--pbs-button-rgb-bg-color), var(--pbs-button-rgb-bg-opacity, 1)) );padding:6px;cursor:pointer;position:relative;display:inline-flex;align-items:center;justify-content:center;user-select:none}span{padding:2px;text-align:center}ha-icon{padding:2px}.button-active{color:var( --paper-item-icon-active-color, var( --pbs-button-active-color, rgb( var( --pbs-button-rgb-active-color, var( --pbs-button-rgb-state-color, var( --pbs-button-rgb-default-color, var(--rgb-state-default-color, var(--pbs-button-rgb-fallback)) ) ) ) ) ) );background-color:var( --pbs-button-bg-active-color, rgba( var(--pbs-button-rgb-bg-active-color, var(--pbs-button-rgb-bg-color)), var( --pbs-button-rgb-bg-active-opacity, var(--pbs-button-rgb-bg-opacity, 1) ) ) )}.button-unavailable{color:var( --pbs-button-unavailable-color, rgb(var(--pbs-button-rgb-unavailable-color, var(--rgb-disabled-color))) )}.image{position:relative;display:inline-block;width:28px;border-radius:50%;height:28px;text-align:center;background-size:cover;line-height:28px;vertical-align:middle;box-sizing:border-box}@keyframes blink{0%{opacity:0}50%{opacity:1}to{opacity:0}}@-webkit-keyframes rotating{0%{-webkit-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0)}to{-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes rotating{0%{-ms-transform:rotate(0deg);-moz-transform:rotate(0deg);-webkit-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0)}to{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}[rotating]{-webkit-animation:rotating 2s linear infinite;-moz-animation:rotating 2s linear infinite;-ms-animation:rotating 2s linear infinite;-o-animation:rotating 2s linear infinite;animation:rotating 2s linear infinite}
`, A = "lovelace-player-device-id";
function Ze() {
  if (!localStorage[A]) {
    const t = () => Math.floor((1 + Math.random()) * 1e5).toString(16).substring(1);
    window.fully && typeof fully.getDeviceId == "function" ? localStorage[A] = fully.getDeviceId() : localStorage[A] = `${t()}${t()}-${t()}${t()}`;
  }
  return localStorage[A];
}
let Je = Ze();
const Xt = (t) => {
  t !== null && (t === "clear" ? localStorage.removeItem(A) : localStorage[A] = t, Je = Ze());
}, Ne = new URLSearchParams(window.location.search);
Ne.get("deviceID") && Xt(Ne.get("deviceID"));
function Qt(t) {
  if (String(t).includes("{%") || String(t).includes("{{"))
    return !0;
}
function er(t, e, r, i = !0) {
  t || (t = S().connection);
  let n = {
    user: S().user.name,
    browser: Je,
    hash: location.hash.substr(1) || " ",
    ...r.variables
  }, s = r.template, o = r.entity_ids;
  return t.subscribeMessage(
    (u) => {
      if (i) {
        let a = String(u.result);
        const l = /_\([^)]*\)/g;
        a = a.replace(l, (p) => S().localize(p.substring(2, p.length - 1)) || p), e(a);
      } else
        e(u.result);
    },
    {
      type: "render_template",
      template: s,
      variables: n,
      entity_ids: o
    }
  );
}
function tr(t, e) {
  t.forEach((r) => {
    r.callback(rr(r.template, e));
  });
}
function rr(t, e) {
  let r = e.states[t.entity];
  if (!r)
    return;
  t.attribute ? r = r.attributes[t.attribute] : r = r.state;
  let i = (t.prefix || "") + r + (t.postfix || "");
  return t.case && (i = ir(i, t.case)), i;
}
function ir(t, e) {
  switch (e) {
    case "upper":
      return t.toUpperCase();
    case "lower":
      return t.toLowerCase();
    case "first":
      return t[0].toUpperCase() + t.slice(1);
  }
}
function Ue(t, e, r) {
  var n, s;
  const i = e[r];
  typeof i == "object" ? (i.entity || (i.entity = t.entity), i.entity !== t.entity && ((n = this._entities) == null || n.push(i.entity)), (s = this._templates) == null || s.push({
    template: i,
    callback: (o) => o && (e[r] = o)
  })) : Qt(i) && (er(
    null,
    (o) => {
      e[r] = o, this.requestUpdate();
    },
    {
      template: i,
      variables: { config: t }
    }
  ), e[r] = "");
}
function ue(t, e, r = null) {
  if (t = new Event(t, {
    bubbles: !0,
    cancelable: !1,
    composed: !0
  }), t.detail = e || {}, r)
    r.dispatchEvent(t);
  else {
    var i = Qe();
    i && i.dispatchEvent(t);
  }
}
const le = "custom:";
let U = window.cardHelpers;
const Ke = new Promise(async (t, e) => {
  U && t();
  const r = async () => {
    U = await window.loadCardHelpers(), window.cardHelpers = U, t();
  };
  window.loadCardHelpers ? r() : window.addEventListener("load", async () => {
    et(), window.loadCardHelpers && r();
  });
});
function z(t, e) {
  const r = {
    type: "error",
    error: t,
    origConfig: e
  }, i = document.createElement("hui-error-card");
  return customElements.whenDefined("hui-error-card").then(() => {
    const n = document.createElement("hui-error-card");
    n.setConfig(r), i.parentElement && i.parentElement.replaceChild(n, i);
  }), Ke.then(() => {
    ue("ll-rebuild", {}, i);
  }), i;
}
function nr(t, e) {
  let r = document.createElement(t);
  try {
    r.setConfig(JSON.parse(JSON.stringify(e)));
  } catch (i) {
    r = z(i, e);
  }
  return Ke.then(() => {
    ue("ll-rebuild", {}, r);
  }), r;
}
function Me(t, e) {
  if (!e || typeof e != "object" || !e.type)
    return z(`No ${t} type configured`, e);
  let r = e.type;
  if (r.startsWith(le) ? r = r.substr(le.length) : r = `hui-${r}-${t}`, customElements.get(r))
    return nr(r, e);
  const i = z(`Custom element doesn't exist: ${r}.`, e);
  i.style.display = "None";
  const n = setTimeout(() => {
    i.style.display = "";
  }, 2e3);
  return customElements.whenDefined(r).then(() => {
    clearTimeout(n), ue("ll-rebuild", {}, i);
  }), i;
}
function sr(t) {
  if (U)
    return U.createRowElement(t);
  const e = /* @__PURE__ */ new Set([
    "call-service",
    "cast",
    "conditional",
    "divider",
    "section",
    "select",
    "weblink"
  ]), r = {
    alert: "toggle",
    automation: "toggle",
    climate: "climate",
    cover: "cover",
    fan: "toggle",
    group: "group",
    input_boolean: "toggle",
    input_number: "input-number",
    input_select: "input-select",
    input_text: "input-text",
    light: "toggle",
    lock: "lock",
    media_player: "media-player",
    remote: "toggle",
    scene: "scene",
    script: "script",
    sensor: "sensor",
    timer: "timer",
    switch: "toggle",
    vacuum: "toggle",
    water_heater: "climate",
    input_datetime: "input-datetime",
    none: void 0
  };
  if (!t || (typeof t == "string" && (t = { entity: t }), typeof t != "object" || !t.entity && !t.type))
    return z("Invalid configuration given.", t);
  const i = t.type || "default";
  if (e.has(i) || i.startsWith(le))
    return Me("row", t);
  const n = t.entity ? t.entity.split(".", 1)[0] : "none";
  return Me("entity-row", {
    type: r[n] || "text",
    ...t
  });
}
function or(t, e) {
  customElements.whenDefined(t).then(() => {
    const r = customElements.get(t), i = r.prototype.firstUpdated;
    r.prototype.firstUpdated = function(n) {
      i.call(this, n), e.call(this, n);
    }, v(window, "ll-rebuild", {});
  });
}
or("hui-generic-entity-row", function() {
  var t;
  if ((t = this.config) != null && t.extend_paper_buttons_row && this.shadowRoot) {
    const e = this.config.extend_paper_buttons_row, r = sr({
      type: "custom:paper-buttons-row",
      ...e
    });
    Xe(r);
    let i = this.shadowRoot.querySelector("slot");
    if (!i)
      return;
    if (i.parentElement && (i.parentElement.parentElement ? i.parentElement.classList.contains("state") && i.parentElement.parentElement.classList.contains("text-content") ? i = i.parentElement.parentElement : console.error("unexpected parent node found") : i.parentElement.classList.contains("text-content") ? i = i.parentElement : console.error("unexpected parent node found")), e.hide_state && (i.style.display = "none"), e.hide_badge) {
      const n = this.shadowRoot.querySelector("state-badge");
      n && (n.style.visibility = "hidden", n.style.marginLeft = "-48px");
    }
    e.position === "right" ? ar(r, i) : Ge(r, i);
  }
});
function Ge(t, e) {
  var r;
  (r = e.parentNode) == null || r.insertBefore(t, e);
}
function ar(t, e) {
  var r;
  e.nextElementSibling ? Ge(t, e.nextElementSibling) : (r = e.parentNode) == null || r.appendChild(t);
}
var lr = Object.defineProperty, cr = Object.getOwnPropertyDescriptor, de = (t, e, r, i) => {
  for (var n = i > 1 ? void 0 : i ? cr(e, r) : e, s = t.length - 1, o; s >= 0; s--)
    (o = t[s]) && (n = (i ? o(e, r, n) : o(n)) || n);
  return i && n && lr(e, r, n), n;
};
console.groupCollapsed(
  "%c PAPER-BUTTONS-ROW %c 2.1.2 ",
  "color: white; background: #039be5; font-weight: 700;",
  "color: #039be5; background: white; font-weight: 700;"
);
console.info("branch   : HEAD");
console.info("commit   : 3cd45066a222be1d913b3be308a6d6c7a9b99bf2");
console.info("built at : 2023-02-14T01:24:05.319Z");
console.info("https://github.com/jcwillox/lovelace-paper-buttons-row");
console.groupEnd();
const ur = (t) => {
  if (t.state_icons && typeof t.state == "string")
    return t.state_icons[t.state.toLowerCase()];
}, dr = (t) => t.state_text && typeof t.state == "string" && t.state_text[t.state.toLowerCase()] || t.state, hr = (t) => {
  switch (console.warn(
    "PAPER-BUTTONS-ROW",
    "'align_icon' and 'align_icons' is deprecated and will be removed in a future version"
  ), t) {
    case "top":
      return [["icon", "name"]];
    case "bottom":
      return [["name", "icon"]];
    case "right":
      return ["name", "icon"];
    default:
      return ["icon", "name"];
  }
};
let j = class extends N {
  constructor() {
    super(...arguments), this._getStateColor = (t, e) => {
      const r = getComputedStyle(this);
      if (t.attributes.device_class) {
        const n = r.getPropertyValue(
          `--state-${e}-${t.attributes.device_class}-${t.state}-color`
        );
        if (n)
          return this._hexToRgb(n);
      }
      let i = r.getPropertyValue(
        `--state-${e}-${t.state}-color`
      );
      if (i)
        return this._hexToRgb(i);
      if (t.state === se || t.state === Wt) {
        const n = t.state === se ? "active" : "inactive";
        if (i = r.getPropertyValue(`--state-${e}-${n}-color`), i)
          return this._hexToRgb(i);
        if (t.state === se && (i = r.getPropertyValue("--state-active-color"), i))
          return this._hexToRgb(i);
      }
    };
  }
  // convert an externally set config to the correct internal structure
  _transformConfig(t) {
    if (!t)
      throw new Error("Invalid configuration");
    if (!t.buttons)
      throw new Error("Missing buttons.");
    if (!Array.isArray(t.buttons))
      throw new Error("Buttons must be an array.");
    if (t.buttons.length <= 0)
      throw new Error("At least one button required.");
    if (t = JSON.parse(JSON.stringify(t)), t.buttons.every((e) => !Array.isArray(e)))
      t.buttons = [t.buttons];
    else if (!t.buttons.every((e) => Array.isArray(e)))
      throw new Error("Cannot mix rows and buttons");
    if (t.styles === void 0)
      t.styles = {};
    else
      for (const e in t.styles)
        t.styles[e] = ne(t.styles[e]);
    return t.buttons = t.buttons.map(
      (e) => e.map((r) => {
        if (typeof r == "string" && (r = { entity: r }), r = oe(t.base_config || {}, r), typeof r.layout == "string" && (r.layout = r.layout.split("|").map(
          (i) => i.includes("_") ? i.split("_") : i
        )), typeof r.active == "string" && (r.active = [r.active]), r.styles == null && (r.styles = r.style), r.styles === void 0)
          r.styles = {};
        else
          for (const i in r.styles)
            r.styles[i] = ne(r.styles[i]);
        if (r.state_styles)
          for (const i in r.state_styles)
            for (const n in r.state_styles[i])
              r.state_styles[i][n] = ne(
                r.state_styles[i][n]
              );
        return r = this._defaultConfig(t, r), r;
      })
    ), t;
  }
  setConfig(t) {
    this._config = this._transformConfig(t), this.hass || (this.hass = S()), this._entities = [], this._templates = [], this._config.buttons = this._config.buttons.map((e) => e.map((r) => {
      var i;
      return r = Jt(r, this._config), r.entity && ((i = this._entities) == null || i.push(r.entity)), Yt.forEach(
        (n) => Ue.call(this, r, r, n)
      ), Object.values(r.styles).forEach((n) => {
        typeof n == "object" && Object.keys(n).forEach(
          (s) => Ue.call(this, r, n, s)
        );
      }), r;
    }));
  }
  render() {
    return !this._config || !this.hass ? y`` : (tr(this._templates, this.hass), y`
      ${this._config.extra_styles ? y`
            <style>
              ${this._config.extra_styles}
            </style>
          ` : ""}
      ${this._config.buttons.map((t) => {
      var e;
      return y`
          <div
            class="flex-box"
            style="${$((e = this._config) == null ? void 0 : e.styles)}"
          >
            ${t.map((r) => {
        var a, l, p;
        const i = r.entity != null && ((a = this.hass) == null ? void 0 : a.states[r.entity]) || void 0, n = r.entity && Y(r.entity), s = this._getStyles(r), o = {
          ...this._getBaseStyles(),
          ...this._getStateStyles(n, i),
          ...s.button || {}
        }, u = r.active ? new Set(r.active) : Vt;
        return y`
                <paper-button
                  @action="${(c) => this._handleAction(c, r)}"
                  .actionHandler="${qt({
          hasHold: He(r.hold_action),
          hasDoubleClick: He(r.double_tap_action),
          repeat: (l = r.hold_action) == null ? void 0 : l.repeat
        })}"
                  style="${$(o)}"
                  class="${this._getClass(
          u,
          r.state,
          i == null ? void 0 : i.state
        )}"
                  title="${Zt(r, this.hass)}"
                  data-domain="${ie(n)}"
                  data-entity-state="${ie(i == null ? void 0 : i.state)}"
                  data-state="${ie(
          typeof r.state == "string" && r.state.toLowerCase()
        )}"
                >
                  ${(p = r.layout) == null ? void 0 : p.map((c) => Array.isArray(c) ? y`
                        <div class="flex-column">
                          ${c.map(
          (d) => this.renderElement(d, r, s, i)
        )}
                        </div>
                      ` : this.renderElement(c, r, s, i))}

                  <paper-ripple
                    center
                    style="${$(s.ripple || {})}"
                    class="${this._getRippleClass(r)}"
                  ></paper-ripple>
                </paper-button>
              `;
      })}
          </div>
        `;
    })}
    `);
  }
  renderElement(t, e, r, i) {
    const n = (r == null ? void 0 : r[t]) || {};
    switch (t) {
      case "icon":
        return this.renderIcon(e, n, i);
      case "name":
        return this.renderName(e, n, i);
      case "state":
        return this.renderState(e, n);
    }
  }
  renderIcon(t, e, r) {
    const i = t.icon !== !1 && (t.icon || t.entity) ? ur(t) || t.icon || r && ot(r) : !1;
    return t.image ? y`<img
          src="${t.image}"
          class="image"
          style="${$(e)}"
          alt="icon"
        />` : i ? y` <ha-icon style="${$(e)}" .icon="${i}" />` : "";
  }
  renderName(t, e, r) {
    return t.name !== !1 && (t.name || t.entity) ? y`
          <span style="${$(e)}">
            ${t.name || Ye(r)}
          </span>
        ` : "";
  }
  renderState(t, e) {
    return t.state !== !1 ? y`
          <span style="${$(e)}"> ${dr(t)} </span>
        ` : "";
  }
  _handleAction(t, e) {
    this.hass && e && t.detail.action && It(this, this.hass, e, t.detail.action);
  }
  _getClass(t, e, r) {
    return typeof e == "string" && t.has(e.toLowerCase()) ? "button-active" : Ft === r ? "button-unavailable" : "";
  }
  _getBaseStyles() {
    var e;
    const t = getComputedStyle(this).getPropertyValue("--state-icon-color");
    return {
      "--rgb-state-default-color": (e = this._hexToRgb(t)) == null ? void 0 : e.join(", ")
    };
  }
  _getStateStyles(t, e) {
    if (!t || !e)
      return {};
    if (e.attributes.rgb_color)
      return {
        "--pbs-button-rgb-state-color": e.attributes.rgb_color
      };
    {
      const r = this._getStateColor(e, t);
      if (r)
        return {
          "--pbs-button-rgb-state-color": r.join(", ")
        };
    }
    return {};
  }
  _hexToRgb(t) {
    var e;
    return (e = t.match(/[A-Za-z0-9]{2}/g)) == null ? void 0 : e.map((r) => parseInt(r, 16));
  }
  _getRippleClass(t) {
    var e, r;
    switch (t.ripple) {
      case "none":
        return "hidden";
      case "circle":
        return "circle";
      case "fill":
        return "";
    }
    return ((e = t.layout) == null ? void 0 : e.length) === 1 && t.layout[0] === "icon" ? "circle" : t.name || t.name !== !1 && t.entity || (r = t.layout) != null && r.includes("state") ? "" : "circle";
  }
  _getStyles(t) {
    if (!t.state || !t.state_styles)
      return t.styles;
    const e = t.state_styles[t.state.toLowerCase()];
    return e ? oe(t.styles, e) : t.styles;
  }
  _defaultConfig(t, e) {
    if (!e.layout) {
      const r = e.align_icon || t.align_icons;
      r ? e.layout = hr(r) : e.layout = ["icon", "name"];
    }
    if (!e.state && e.entity && (e.state = { case: "upper" }), e.entity) {
      const r = Y(e.entity);
      e.hold_action || (e.hold_action = { action: "more-info" }), e.tap_action || (Bt.has(r) ? e.tap_action = { action: "toggle" } : r === "scene" ? e.tap_action = {
        action: "call-service",
        service: "scene.turn_on",
        service_data: {
          entity_id: e.entity
        }
      } : e.tap_action = { action: "more-info" });
    }
    return e;
  }
  shouldUpdate(t) {
    if (t.has("_config"))
      return !0;
    if (this._entities) {
      const e = t.get("hass");
      return e ? this._entities.some(
        (r) => {
          var i;
          return e.states[r] !== ((i = this.hass) == null ? void 0 : i.states[r]);
        }
      ) : !0;
    }
    return !1;
  }
};
j.styles = ze(Gt);
de([
  Ve()
], j.prototype, "hass", 2);
de([
  Ve()
], j.prototype, "_config", 2);
j = de([
  Ut("paper-buttons-row")
], j);
export {
  j as PaperButtonsRow
};
