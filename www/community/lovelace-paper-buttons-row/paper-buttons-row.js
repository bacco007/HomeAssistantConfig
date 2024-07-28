var rt = Object.defineProperty, it = Object.defineProperties;
var st = Object.getOwnPropertyDescriptors;
var de = Object.getOwnPropertySymbols;
var nt = Object.prototype.hasOwnProperty, ot = Object.prototype.propertyIsEnumerable;
var he = (r, e, t) => e in r ? rt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, _ = (r, e) => {
  for (var t in e || (e = {}))
    nt.call(e, t) && he(r, t, e[t]);
  if (de)
    for (var t of de(e))
      ot.call(e, t) && he(r, t, e[t]);
  return r;
}, pe = (r, e) => it(r, st(e));
var me = (r, e, t) => new Promise((i, s) => {
  var n = (a) => {
    try {
      c(t.next(a));
    } catch (l) {
      s(l);
    }
  }, o = (a) => {
    try {
      c(t.throw(a));
    } catch (l) {
      s(l);
    }
  }, c = (a) => a.done ? i(a.value) : Promise.resolve(a.value).then(n, o);
  c((t = t.apply(r, e)).next());
});
function D() {
  if (document.querySelector("hc-main"))
    return document.querySelector("hc-main").hass;
  if (document.querySelector("home-assistant"))
    return document.querySelector("home-assistant").hass;
}
function at(r) {
  if (document.querySelector("hc-main"))
    return document.querySelector("hc-main").provideHass(r);
  if (document.querySelector("home-assistant"))
    return document.querySelector("home-assistant").provideHass(r);
}
var fe, ve;
(function(r) {
  r.language = "language", r.system = "system", r.comma_decimal = "comma_decimal", r.decimal_comma = "decimal_comma", r.space_comma = "space_comma", r.none = "none";
})(fe || (fe = {})), function(r) {
  r.language = "language", r.system = "system", r.am_pm = "12", r.twenty_four = "24";
}(ve || (ve = {}));
function W(r) {
  return r.substr(0, r.indexOf("."));
}
function lt(r) {
  return r.substr(r.indexOf(".") + 1);
}
var ct = ["closed", "locked", "off"], f = function(r, e, t, i) {
  i = i || {}, t = t == null ? {} : t;
  var s = new Event(e, { bubbles: i.bubbles === void 0 || i.bubbles, cancelable: !!i.cancelable, composed: i.composed === void 0 || i.composed });
  return s.detail = t, r.dispatchEvent(s), s;
}, ut = /* @__PURE__ */ new Set(["call-service", "divider", "section", "weblink", "cast", "select"]), dt = { alert: "toggle", automation: "toggle", climate: "climate", cover: "cover", fan: "toggle", group: "group", input_boolean: "toggle", input_number: "input-number", input_select: "input-select", input_text: "input-text", light: "toggle", lock: "lock", media_player: "media-player", remote: "toggle", scene: "scene", script: "script", sensor: "sensor", timer: "timer", switch: "toggle", vacuum: "toggle", water_heater: "climate", input_datetime: "input-datetime" }, ht = function(r, e) {
  var t = function(a, l) {
    return i("hui-error-card", { type: "error", error: a, config: l });
  }, i = function(a, l) {
    var u = window.document.createElement(a);
    try {
      if (!u.setConfig) return;
      u.setConfig(l);
    } catch (d) {
      return console.error(a, d), t(d.message, l);
    }
    return u;
  };
  if (!r || typeof r != "object" || !e) return t("No type defined", r);
  var s = r.type;
  if (s && s.startsWith("custom:")) s = s.substr(7);
  else if (ut.has(s)) s = "hui-" + s + "-row";
  else {
    if (!r.entity) return t("Invalid config given.", r);
    var n = r.entity.split(".", 1)[0];
    s = "hui-" + (dt[n] || "text") + "-entity-row";
  }
  if (customElements.get(s)) return i(s, r);
  var o = t("Custom element doesn't exist: " + r.type + ".", r);
  o.style.display = "None";
  var c = setTimeout(function() {
    o.style.display = "";
  }, 2e3);
  return customElements.whenDefined(r.type).then(function() {
    clearTimeout(c), f(o, "ll-rebuild", {}, o);
  }), o;
}, ye = { alert: "mdi:alert", automation: "mdi:playlist-play", calendar: "mdi:calendar", camera: "mdi:video", climate: "mdi:thermostat", configurator: "mdi:settings", conversation: "mdi:text-to-speech", device_tracker: "mdi:account", fan: "mdi:fan", group: "mdi:google-circles-communities", history_graph: "mdi:chart-line", homeassistant: "mdi:home-assistant", homekit: "mdi:home-automation", image_processing: "mdi:image-filter-frames", input_boolean: "mdi:drawing", input_datetime: "mdi:calendar-clock", input_number: "mdi:ray-vertex", input_select: "mdi:format-list-bulleted", input_text: "mdi:textbox", light: "mdi:lightbulb", mailbox: "mdi:mailbox", notify: "mdi:comment-alert", person: "mdi:account", plant: "mdi:flower", proximity: "mdi:apple-safari", remote: "mdi:remote", scene: "mdi:google-pages", script: "mdi:file-document", sensor: "mdi:eye", simple_alarm: "mdi:bell", sun: "mdi:white-balance-sunny", switch: "mdi:flash", timer: "mdi:timer", updater: "mdi:cloud-upload", vacuum: "mdi:robot-vacuum", water_heater: "mdi:thermometer", weblink: "mdi:open-in-new" };
function B(r, e) {
  if (r in ye) return ye[r];
  switch (r) {
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
      return console.warn("Unable to find icon for domain " + r + " (" + e + ")"), "mdi:bookmark";
  }
}
var m = function(r) {
  f(window, "haptic", r);
}, pt = function(r, e, t) {
  t === void 0 && (t = !1), t ? history.replaceState(null, "", e) : history.pushState(null, "", e), f(window, "location-changed", { replace: t });
}, mt = function(r, e, t) {
  t === void 0 && (t = !0);
  var i, s = W(e), n = s === "group" ? "homeassistant" : s;
  switch (s) {
    case "lock":
      i = t ? "unlock" : "lock";
      break;
    case "cover":
      i = t ? "open_cover" : "close_cover";
      break;
    default:
      i = t ? "turn_on" : "turn_off";
  }
  return r.callService(n, i, { entity_id: e });
}, ft = function(r, e) {
  var t = ct.includes(r.states[e].state);
  return mt(r, e, t);
}, _e = { humidity: "mdi:water-percent", illuminance: "mdi:brightness-5", temperature: "mdi:thermometer", pressure: "mdi:gauge", power: "mdi:flash", signal_strength: "mdi:wifi" }, be = { binary_sensor: function(r, e) {
  var t = r === "off";
  switch (e == null ? void 0 : e.attributes.device_class) {
    case "battery":
      return t ? "mdi:battery" : "mdi:battery-outline";
    case "battery_charging":
      return t ? "mdi:battery" : "mdi:battery-charging";
    case "cold":
      return t ? "mdi:thermometer" : "mdi:snowflake";
    case "connectivity":
      return t ? "mdi:server-network-off" : "mdi:server-network";
    case "door":
      return t ? "mdi:door-closed" : "mdi:door-open";
    case "garage_door":
      return t ? "mdi:garage" : "mdi:garage-open";
    case "power":
      return t ? "mdi:power-plug-off" : "mdi:power-plug";
    case "gas":
    case "problem":
    case "safety":
    case "tamper":
      return t ? "mdi:check-circle" : "mdi:alert-circle";
    case "smoke":
      return t ? "mdi:check-circle" : "mdi:smoke";
    case "heat":
      return t ? "mdi:thermometer" : "mdi:fire";
    case "light":
      return t ? "mdi:brightness-5" : "mdi:brightness-7";
    case "lock":
      return t ? "mdi:lock" : "mdi:lock-open";
    case "moisture":
      return t ? "mdi:water-off" : "mdi:water";
    case "motion":
      return t ? "mdi:walk" : "mdi:run";
    case "occupancy":
      return t ? "mdi:home-outline" : "mdi:home";
    case "opening":
      return t ? "mdi:square" : "mdi:square-outline";
    case "plug":
      return t ? "mdi:power-plug-off" : "mdi:power-plug";
    case "presence":
      return t ? "mdi:home-outline" : "mdi:home";
    case "running":
      return t ? "mdi:stop" : "mdi:play";
    case "sound":
      return t ? "mdi:music-note-off" : "mdi:music-note";
    case "update":
      return t ? "mdi:package" : "mdi:package-up";
    case "vibration":
      return t ? "mdi:crop-portrait" : "mdi:vibrate";
    case "window":
      return t ? "mdi:window-closed" : "mdi:window-open";
    default:
      return t ? "mdi:radiobox-blank" : "mdi:checkbox-marked-circle";
  }
}, cover: function(r) {
  var e = r.state !== "closed";
  switch (r.attributes.device_class) {
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
      return B("cover", r.state);
  }
}, sensor: function(r) {
  var e = r.attributes.device_class;
  if (e && e in _e) return _e[e];
  if (e === "battery") {
    var t = Number(r.state);
    if (isNaN(t)) return "mdi:battery-unknown";
    var i = 10 * Math.round(t / 10);
    return i >= 100 ? "mdi:battery" : i <= 0 ? "mdi:battery-alert" : "hass:battery-" + i;
  }
  var s = r.attributes.unit_of_measurement;
  return s === "°C" || s === "°F" ? "mdi:thermometer" : B("sensor");
}, input_datetime: function(r) {
  return r.attributes.has_date ? r.attributes.has_time ? B("input_datetime") : "mdi:calendar" : "mdi:clock";
} }, vt = function(r) {
  if (!r) return "mdi:bookmark";
  if (r.attributes.icon) return r.attributes.icon;
  var e = W(r.entity_id);
  return e in be ? be[e](r) : B(e, r.state);
};
function yt(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var _t = function(e) {
  return bt(e) && !gt(e);
};
function bt(r) {
  return !!r && typeof r == "object";
}
function gt(r) {
  var e = Object.prototype.toString.call(r);
  return e === "[object RegExp]" || e === "[object Date]" || At(r);
}
var $t = typeof Symbol == "function" && Symbol.for, wt = $t ? Symbol.for("react.element") : 60103;
function At(r) {
  return r.$$typeof === wt;
}
function Et(r) {
  return Array.isArray(r) ? [] : {};
}
function N(r, e) {
  return e.clone !== !1 && e.isMergeableObject(r) ? k(Et(r), r, e) : r;
}
function St(r, e, t) {
  return r.concat(e).map(function(i) {
    return N(i, t);
  });
}
function xt(r, e) {
  if (!e.customMerge)
    return k;
  var t = e.customMerge(r);
  return typeof t == "function" ? t : k;
}
function Tt(r) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(r).filter(function(e) {
    return Object.propertyIsEnumerable.call(r, e);
  }) : [];
}
function ge(r) {
  return Object.keys(r).concat(Tt(r));
}
function ze(r, e) {
  try {
    return e in r;
  } catch (t) {
    return !1;
  }
}
function kt(r, e) {
  return ze(r, e) && !(Object.hasOwnProperty.call(r, e) && Object.propertyIsEnumerable.call(r, e));
}
function Ot(r, e, t) {
  var i = {};
  return t.isMergeableObject(r) && ge(r).forEach(function(s) {
    i[s] = N(r[s], t);
  }), ge(e).forEach(function(s) {
    kt(r, s) || (ze(r, s) && t.isMergeableObject(e[s]) ? i[s] = xt(s, t)(r[s], e[s], t) : i[s] = N(e[s], t));
  }), i;
}
function k(r, e, t) {
  t = t || {}, t.arrayMerge = t.arrayMerge || St, t.isMergeableObject = t.isMergeableObject || _t, t.cloneUnlessOtherwiseSpecified = N;
  var i = Array.isArray(e), s = Array.isArray(r), n = i === s;
  return n ? i ? t.arrayMerge(r, e, t) : Ot(r, e, t) : N(e, t);
}
k.all = function(e, t) {
  if (!Array.isArray(e))
    throw new Error("first argument should be an array");
  return e.reduce(function(i, s) {
    return k(i, s, t);
  }, {});
};
var Ht = k, Pt = Ht;
const ne = /* @__PURE__ */ yt(Pt);
const q = window, ce = q.ShadowRoot && (q.ShadyCSS === void 0 || q.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ce = Symbol(), $e = /* @__PURE__ */ new WeakMap();
let Rt = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== Ce) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ce && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = $e.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && $e.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const je = (r) => new Rt(typeof r == "string" ? r : r + "", void 0, Ce), Mt = (r, e) => {
  ce ? r.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet) : e.forEach((t) => {
    const i = document.createElement("style"), s = q.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, r.appendChild(i);
  });
}, we = ce ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return je(t);
})(r) : r;
var Y;
const Z = window, Ae = Z.trustedTypes, Nt = Ae ? Ae.emptyScript : "", Ee = Z.reactiveElementPolyfillSupport, oe = { toAttribute(r, e) {
  switch (e) {
    case Boolean:
      r = r ? Nt : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, e) {
  let t = r;
  switch (e) {
    case Boolean:
      t = r !== null;
      break;
    case Number:
      t = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(r);
      } catch (i) {
        t = null;
      }
  }
  return t;
} }, De = (r, e) => e !== r && (e == e || r == r), J = { attribute: !0, type: String, converter: oe, reflect: !1, hasChanged: De }, ae = "finalized";
let x = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
  }
  static addInitializer(e) {
    var t;
    this.finalize(), ((t = this.h) !== null && t !== void 0 ? t : this.h = []).push(e);
  }
  static get observedAttributes() {
    this.finalize();
    const e = [];
    return this.elementProperties.forEach((t, i) => {
      const s = this._$Ep(i, t);
      s !== void 0 && (this._$Ev.set(s, i), e.push(s));
    }), e;
  }
  static createProperty(e, t = J) {
    if (t.state && (t.attribute = !1), this.finalize(), this.elementProperties.set(e, t), !t.noAccessor && !this.prototype.hasOwnProperty(e)) {
      const i = typeof e == "symbol" ? Symbol() : "__" + e, s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && Object.defineProperty(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    return { get() {
      return this[t];
    }, set(s) {
      const n = this[e];
      this[t] = s, this.requestUpdate(e, n, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) || J;
  }
  static finalize() {
    if (this.hasOwnProperty(ae)) return !1;
    this[ae] = !0;
    const e = Object.getPrototypeOf(this);
    if (e.finalize(), e.h !== void 0 && (this.h = [...e.h]), this.elementProperties = new Map(e.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const t = this.properties, i = [...Object.getOwnPropertyNames(t), ...Object.getOwnPropertySymbols(t)];
      for (const s of i) this.createProperty(s, t[s]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const s of i) t.unshift(we(s));
    } else e !== void 0 && t.push(we(e));
    return t;
  }
  static _$Ep(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  _$Eu() {
    var e;
    this._$E_ = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (e = this.constructor.h) === null || e === void 0 || e.forEach((t) => t(this));
  }
  addController(e) {
    var t, i;
    ((t = this._$ES) !== null && t !== void 0 ? t : this._$ES = []).push(e), this.renderRoot !== void 0 && this.isConnected && ((i = e.hostConnected) === null || i === void 0 || i.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$ES) === null || t === void 0 || t.splice(this._$ES.indexOf(e) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((e, t) => {
      this.hasOwnProperty(t) && (this._$Ei.set(t, this[t]), delete this[t]);
    });
  }
  createRenderRoot() {
    var e;
    const t = (e = this.shadowRoot) !== null && e !== void 0 ? e : this.attachShadow(this.constructor.shadowRootOptions);
    return Mt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var e;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$ES) === null || e === void 0 || e.forEach((t) => {
      var i;
      return (i = t.hostConnected) === null || i === void 0 ? void 0 : i.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((t) => {
      var i;
      return (i = t.hostDisconnected) === null || i === void 0 ? void 0 : i.call(t);
    });
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$EO(e, t, i = J) {
    var s;
    const n = this.constructor._$Ep(e, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((s = i.converter) === null || s === void 0 ? void 0 : s.toAttribute) !== void 0 ? i.converter : oe).toAttribute(t, i.type);
      this._$El = e, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$El = null;
    }
  }
  _$AK(e, t) {
    var i;
    const s = this.constructor, n = s._$Ev.get(e);
    if (n !== void 0 && this._$El !== n) {
      const o = s.getPropertyOptions(n), c = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((i = o.converter) === null || i === void 0 ? void 0 : i.fromAttribute) !== void 0 ? o.converter : oe;
      this._$El = n, this[n] = c.fromAttribute(t, o.type), this._$El = null;
    }
  }
  requestUpdate(e, t, i) {
    let s = !0;
    e !== void 0 && (((i = i || this.constructor.getPropertyOptions(e)).hasChanged || De)(this[e], t) ? (this._$AL.has(e) || this._$AL.set(e, t), i.reflect === !0 && this._$El !== e && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(e, i))) : s = !1), !this.isUpdatePending && s && (this._$E_ = this._$Ej());
  }
  _$Ej() {
    return me(this, null, function* () {
      this.isUpdatePending = !0;
      try {
        yield this._$E_;
      } catch (t) {
        Promise.reject(t);
      }
      const e = this.scheduleUpdate();
      return e != null && (yield e), !this.isUpdatePending;
    });
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var e;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((s, n) => this[n] = s), this._$Ei = void 0);
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), (e = this._$ES) === null || e === void 0 || e.forEach((s) => {
        var n;
        return (n = s.hostUpdate) === null || n === void 0 ? void 0 : n.call(s);
      }), this.update(i)) : this._$Ek();
    } catch (s) {
      throw t = !1, this._$Ek(), s;
    }
    t && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((i) => {
      var s;
      return (s = i.hostUpdated) === null || s === void 0 ? void 0 : s.call(i);
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
    this._$EC !== void 0 && (this._$EC.forEach((t, i) => this._$EO(i, this[i], t)), this._$EC = void 0), this._$Ek();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
x[ae] = !0, x.elementProperties = /* @__PURE__ */ new Map(), x.elementStyles = [], x.shadowRootOptions = { mode: "open" }, Ee == null || Ee({ ReactiveElement: x }), ((Y = Z.reactiveElementVersions) !== null && Y !== void 0 ? Y : Z.reactiveElementVersions = []).push("1.6.3");
var G;
const F = window, O = F.trustedTypes, Se = O ? O.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, le = "$lit$", b = `lit$${(Math.random() + "").slice(9)}$`, Be = "?" + b, Ut = `<${Be}>`, E = document, U = () => E.createComment(""), L = (r) => r === null || typeof r != "object" && typeof r != "function", qe = Array.isArray, Lt = (r) => qe(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function", X = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xe = /-->/g, Te = />/g, $ = RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ke = /'/g, Oe = /"/g, Ve = /^(?:script|style|textarea|title)$/i, It = (r) => (e, ...t) => ({ _$litType$: r, strings: e, values: t }), y = It(1), g = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), He = /* @__PURE__ */ new WeakMap(), A = E.createTreeWalker(E, 129, null, !1);
function We(r, e) {
  if (!Array.isArray(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Se !== void 0 ? Se.createHTML(e) : e;
}
const zt = (r, e) => {
  const t = r.length - 1, i = [];
  let s, n = e === 2 ? "<svg>" : "", o = P;
  for (let c = 0; c < t; c++) {
    const a = r[c];
    let l, u, d = -1, p = 0;
    for (; p < a.length && (o.lastIndex = p, u = o.exec(a), u !== null); ) p = o.lastIndex, o === P ? u[1] === "!--" ? o = xe : u[1] !== void 0 ? o = Te : u[2] !== void 0 ? (Ve.test(u[2]) && (s = RegExp("</" + u[2], "g")), o = $) : u[3] !== void 0 && (o = $) : o === $ ? u[0] === ">" ? (o = s != null ? s : P, d = -1) : u[1] === void 0 ? d = -2 : (d = o.lastIndex - u[2].length, l = u[1], o = u[3] === void 0 ? $ : u[3] === '"' ? Oe : ke) : o === Oe || o === ke ? o = $ : o === xe || o === Te ? o = P : (o = $, s = void 0);
    const v = o === $ && r[c + 1].startsWith("/>") ? " " : "";
    n += o === P ? a + Ut : d >= 0 ? (i.push(l), a.slice(0, d) + le + a.slice(d) + b + v) : a + b + (d === -2 ? (i.push(void 0), c) : v);
  }
  return [We(r, n + (r[t] || "<?>") + (e === 2 ? "</svg>" : "")), i];
};
class I {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let n = 0, o = 0;
    const c = e.length - 1, a = this.parts, [l, u] = zt(e, t);
    if (this.el = I.createElement(l, i), A.currentNode = this.el.content, t === 2) {
      const d = this.el.content, p = d.firstChild;
      p.remove(), d.append(...p.childNodes);
    }
    for (; (s = A.nextNode()) !== null && a.length < c; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) {
          const d = [];
          for (const p of s.getAttributeNames()) if (p.endsWith(le) || p.startsWith(b)) {
            const v = u[o++];
            if (d.push(p), v !== void 0) {
              const tt = s.getAttribute(v.toLowerCase() + le).split(b), j = /([.?@])?(.*)/.exec(v);
              a.push({ type: 1, index: n, name: j[2], strings: tt, ctor: j[1] === "." ? jt : j[1] === "?" ? Bt : j[1] === "@" ? qt : K });
            } else a.push({ type: 6, index: n });
          }
          for (const p of d) s.removeAttribute(p);
        }
        if (Ve.test(s.tagName)) {
          const d = s.textContent.split(b), p = d.length - 1;
          if (p > 0) {
            s.textContent = O ? O.emptyScript : "";
            for (let v = 0; v < p; v++) s.append(d[v], U()), A.nextNode(), a.push({ type: 2, index: ++n });
            s.append(d[p], U());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Be) a.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = s.data.indexOf(b, d + 1)) !== -1; ) a.push({ type: 7, index: n }), d += b.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = E.createElement("template");
    return i.innerHTML = e, i;
  }
}
function H(r, e, t = r, i) {
  var s, n, o, c;
  if (e === g) return e;
  let a = i !== void 0 ? (s = t._$Co) === null || s === void 0 ? void 0 : s[i] : t._$Cl;
  const l = L(e) ? void 0 : e._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== l && ((n = a == null ? void 0 : a._$AO) === null || n === void 0 || n.call(a, !1), l === void 0 ? a = void 0 : (a = new l(r), a._$AT(r, t, i)), i !== void 0 ? ((o = (c = t)._$Co) !== null && o !== void 0 ? o : c._$Co = [])[i] = a : t._$Cl = a), a !== void 0 && (e = H(r, a._$AS(r, e.values), a, i)), e;
}
class Ct {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    var t;
    const { el: { content: i }, parts: s } = this._$AD, n = ((t = e == null ? void 0 : e.creationScope) !== null && t !== void 0 ? t : E).importNode(i, !0);
    A.currentNode = n;
    let o = A.nextNode(), c = 0, a = 0, l = s[0];
    for (; l !== void 0; ) {
      if (c === l.index) {
        let u;
        l.type === 2 ? u = new C(o, o.nextSibling, this, e) : l.type === 1 ? u = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (u = new Vt(o, this, e)), this._$AV.push(u), l = s[++a];
      }
      c !== (l == null ? void 0 : l.index) && (o = A.nextNode(), c++);
    }
    return A.currentNode = E, n;
  }
  v(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class C {
  constructor(e, t, i, s) {
    var n;
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cp = (n = s == null ? void 0 : s.isConnected) === null || n === void 0 || n;
  }
  get _$AU() {
    var e, t;
    return (t = (e = this._$AM) === null || e === void 0 ? void 0 : e._$AU) !== null && t !== void 0 ? t : this._$Cp;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = H(this, e, t), L(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== g && this._(e) : e._$litType$ !== void 0 ? this.g(e) : e.nodeType !== void 0 ? this.$(e) : Lt(e) ? this.T(e) : this._(e);
  }
  k(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  $(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.k(e));
  }
  _(e) {
    this._$AH !== h && L(this._$AH) ? this._$AA.nextSibling.data = e : this.$(E.createTextNode(e)), this._$AH = e;
  }
  g(e) {
    var t;
    const { values: i, _$litType$: s } = e, n = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = I.createElement(We(s.h, s.h[0]), this.options)), s);
    if (((t = this._$AH) === null || t === void 0 ? void 0 : t._$AD) === n) this._$AH.v(i);
    else {
      const o = new Ct(n, this), c = o.u(this.options);
      o.v(i), this.$(c), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = He.get(e.strings);
    return t === void 0 && He.set(e.strings, t = new I(e)), t;
  }
  T(e) {
    qe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const n of e) s === t.length ? t.push(i = new C(this.k(U()), this.k(U()), this, this.options)) : i = t[s], i._$AI(n), s++;
    s < t.length && (this._$AR(i && i._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, !1, !0, t); e && e !== this._$AB; ) {
      const s = e.nextSibling;
      e.remove(), e = s;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cp = e, (t = this._$AP) === null || t === void 0 || t.call(this, e));
  }
}
class K {
  constructor(e, t, i, s, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e, t = this, i, s) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = H(this, e, t, 0), o = !L(e) || e !== this._$AH && e !== g, o && (this._$AH = e);
    else {
      const c = e;
      let a, l;
      for (e = n[0], a = 0; a < n.length - 1; a++) l = H(this, c[i + a], t, a), l === g && (l = this._$AH[a]), o || (o = !L(l) || l !== this._$AH[a]), l === h ? e = h : e !== h && (e += (l != null ? l : "") + n[a + 1]), this._$AH[a] = l;
    }
    o && !s && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e != null ? e : "");
  }
}
class jt extends K {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
const Dt = O ? O.emptyScript : "";
class Bt extends K {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    e && e !== h ? this.element.setAttribute(this.name, Dt) : this.element.removeAttribute(this.name);
  }
}
class qt extends K {
  constructor(e, t, i, s, n) {
    super(e, t, i, s, n), this.type = 5;
  }
  _$AI(e, t = this) {
    var i;
    if ((e = (i = H(this, e, t, 0)) !== null && i !== void 0 ? i : h) === g) return;
    const s = this._$AH, n = e === h && s !== h || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, o = e !== h && (s === h || n);
    n && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (t = this.options) === null || t === void 0 ? void 0 : t.host) !== null && i !== void 0 ? i : this.element, e) : this._$AH.handleEvent(e);
  }
}
class Vt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    H(this, e);
  }
}
const Pe = F.litHtmlPolyfillSupport;
Pe == null || Pe(I, C), ((G = F.litHtmlVersions) !== null && G !== void 0 ? G : F.litHtmlVersions = []).push("2.8.0");
const Wt = (r, e, t) => {
  var i, s;
  const n = (i = t == null ? void 0 : t.renderBefore) !== null && i !== void 0 ? i : e;
  let o = n._$litPart$;
  if (o === void 0) {
    const c = (s = t == null ? void 0 : t.renderBefore) !== null && s !== void 0 ? s : null;
    n._$litPart$ = o = new C(e.insertBefore(U(), c), c, void 0, t != null ? t : {});
  }
  return o._$AI(r), o;
};
var Q, ee;
class M extends x {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e, t;
    const i = super.createRenderRoot();
    return (e = (t = this.renderOptions).renderBefore) !== null && e !== void 0 || (t.renderBefore = i.firstChild), i;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Wt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) === null || e === void 0 || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) === null || e === void 0 || e.setConnected(!1);
  }
  render() {
    return g;
  }
}
M.finalized = !0, M._$litElement$ = !0, (Q = globalThis.litElementHydrateSupport) === null || Q === void 0 || Q.call(globalThis, { LitElement: M });
const Re = globalThis.litElementPolyfillSupport;
Re == null || Re({ LitElement: M });
((ee = globalThis.litElementVersions) !== null && ee !== void 0 ? ee : globalThis.litElementVersions = []).push("3.3.3");
const Zt = (r) => (e) => typeof e == "function" ? ((t, i) => (customElements.define(t, i), i))(r, e) : ((t, i) => {
  const { kind: s, elements: n } = i;
  return { kind: s, elements: n, finisher(o) {
    customElements.define(t, o);
  } };
})(r, e);
const Ft = (r, e) => e.kind === "method" && e.descriptor && !("value" in e.descriptor) ? pe(_({}, e), { finisher(t) {
  t.createProperty(e.key, r);
} }) : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: e.key, initializer() {
  typeof e.initializer == "function" && (this[e.key] = e.initializer.call(this));
}, finisher(t) {
  t.createProperty(e.key, r);
} }, Kt = (r, e, t) => {
  e.constructor.createProperty(t, r);
};
function Ze(r) {
  return (e, t) => t !== void 0 ? Kt(r, e, t) : Ft(r, e);
}
var te;
((te = window.HTMLSlotElement) === null || te === void 0 ? void 0 : te.prototype.assignedElements) != null;
const re = (r) => r != null ? r : h;
const Yt = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, Fe = (r) => (...e) => ({ _$litDirective$: r, values: e });
let Ke = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, i) {
    this._$Ct = e, this._$AM = t, this._$Ci = i;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
};
const Ye = "important", Jt = " !" + Ye, w = Fe(class extends Ke {
  constructor(r) {
    var e;
    if (super(r), r.type !== Yt.ATTRIBUTE || r.name !== "style" || ((e = r.strings) === null || e === void 0 ? void 0 : e.length) > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(r) {
    return Object.keys(r).reduce((e, t) => {
      const i = r[t];
      return i == null ? e : e + `${t = t.includes("-") ? t : t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${i};`;
    }, "");
  }
  update(r, [e]) {
    const { style: t } = r.element;
    if (this.ht === void 0) {
      this.ht = /* @__PURE__ */ new Set();
      for (const i in e) this.ht.add(i);
      return this.render(e);
    }
    this.ht.forEach((i) => {
      e[i] == null && (this.ht.delete(i), i.includes("-") ? t.removeProperty(i) : t[i] = "");
    });
    for (const i in e) {
      const s = e[i];
      if (s != null) {
        this.ht.add(i);
        const n = typeof s == "string" && s.endsWith(Jt);
        i.includes("-") || n ? t.setProperty(i, n ? s.slice(0, -11) : s, n ? Ye : "") : t[i] = s;
      }
    }
    return g;
  }
}), S = (r, e) => f(r, "hass-notification", e), ie = (r) => Array.isArray(r) ? r.reduce((e, t) => _(_({}, e), t), {}) : r, Gt = (r, e, t, i) => {
  let s;
  i === "double_tap" && t.double_tap_action ? s = t.double_tap_action : i === "hold" && t.hold_action ? s = t.hold_action : i === "tap" && t.tap_action && (s = t.tap_action), Xt(r, e, t, s);
};
function Xt(r, e, t, i) {
  if (i || (i = {
    action: "more-info"
  }), !(i.confirmation && (!i.confirmation.exemptions || !i.confirmation.exemptions.some(
    (s) => {
      var n;
      return s.user === ((n = e == null ? void 0 : e.user) == null ? void 0 : n.id);
    }
  )) && (m("warning"), !confirm(
    i.confirmation.text || `Are you sure you want to ${i.action}?`
  ))))
    switch (i.action) {
      case "more-info": {
        const s = i.entity || t.entity;
        s ? f(r, "hass-more-info", { entityId: s }) : (S(r, {
          message: e.localize(
            "ui.panel.lovelace.cards.actions.no_entity_more_info"
          )
        }), m("failure"));
        break;
      }
      case "navigate":
        if (!i.navigation_path) {
          S(r, {
            message: e.localize(
              "ui.panel.lovelace.cards.actions.no_navigation_path"
            )
          }), m("failure");
          return;
        }
        pt(r, i.navigation_path), m("light");
        break;
      case "url":
        if (!i.url_path) {
          S(r, {
            message: e.localize("ui.panel.lovelace.cards.actions.no_url")
          }), m("failure");
          return;
        }
        window.open(i.url_path), m("light");
        break;
      case "toggle":
        if (!t.entity) {
          S(r, {
            message: e.localize(
              "ui.panel.lovelace.cards.actions.no_entity_toggle"
            )
          }), m("failure");
          return;
        }
        ft(e, t.entity), m("light");
        break;
      case "call-service": {
        if (!i.service) {
          S(r, {
            message: e.localize("ui.panel.lovelace.cards.actions.no_service")
          }), m("failure");
          return;
        }
        const [s, n] = i.service.split(".", 2);
        e.callService(
          s,
          n,
          i.service_data,
          i.target
        ), m("light");
        break;
      }
      case "fire-event": {
        if (!i.event_type) {
          S(r, {
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
        f(r, "ll-custom", i), m("light");
    }
}
function Me(r) {
  return r !== void 0 && r.action !== "none";
}
const V = (r, e) => {
  if (r === e)
    return !0;
  if (r && e && typeof r == "object" && typeof e == "object") {
    if (r.constructor !== e.constructor)
      return !1;
    let t, i;
    if (Array.isArray(r)) {
      if (i = r.length, i !== e.length)
        return !1;
      for (t = i; t-- !== 0; )
        if (!V(r[t], e[t]))
          return !1;
      return !0;
    }
    if (r instanceof Map && e instanceof Map) {
      if (r.size !== e.size)
        return !1;
      for (t of r.entries())
        if (!e.has(t[0]))
          return !1;
      for (t of r.entries())
        if (!V(t[1], e.get(t[0])))
          return !1;
      return !0;
    }
    if (r instanceof Set && e instanceof Set) {
      if (r.size !== e.size)
        return !1;
      for (t of r.entries())
        if (!e.has(t[0]))
          return !1;
      return !0;
    }
    if (ArrayBuffer.isView(r) && ArrayBuffer.isView(e)) {
      if (i = r.length, i !== e.length)
        return !1;
      for (t = i; t-- !== 0; )
        if (r[t] !== e[t])
          return !1;
      return !0;
    }
    if (r.constructor === RegExp)
      return r.source === e.source && r.flags === e.flags;
    if (r.valueOf !== Object.prototype.valueOf)
      return r.valueOf() === e.valueOf();
    if (r.toString !== Object.prototype.toString)
      return r.toString() === e.toString();
    const s = Object.keys(r);
    if (i = s.length, i !== Object.keys(e).length)
      return !1;
    for (t = i; t-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(e, s[t]))
        return !1;
    for (t = i; t-- !== 0; ) {
      const n = s[t];
      if (!V(r[n], e[n]))
        return !1;
    }
    return !0;
  }
  return r !== r && e !== e;
}, Ne = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
class Qt extends HTMLElement {
  constructor() {
    super(), this.holdTime = 500, this.held = !1, this.cancelled = !1, this.isRepeating = !1, this.ripple = document.createElement("mwc-ripple");
  }
  connectedCallback() {
    Object.assign(this.style, {
      position: "absolute",
      width: Ne ? "100px" : "50px",
      height: Ne ? "100px" : "50px",
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
  bind(e, t = {}) {
    e.actionHandler && V(t, e.actionHandler.options) || (e.actionHandler ? (e.actionHandler.start && (e.removeEventListener("touchstart", e.actionHandler.start), e.removeEventListener("mousedown", e.actionHandler.start)), e.actionHandler.end && (e.removeEventListener("touchend", e.actionHandler.end), e.removeEventListener("touchcancel", e.actionHandler.end), e.removeEventListener("click", e.actionHandler.end)), e.actionHandler.handleEnter && e.removeEventListener("keyup", e.actionHandler.handleEnter)) : e.addEventListener("contextmenu", (i) => {
      const s = i || window.event;
      return s.preventDefault && s.preventDefault(), s.stopPropagation && s.stopPropagation(), s.cancelBubble = !0, s.returnValue = !1, !1;
    }), e.actionHandler = { options: t }, !t.disabled && (e.actionHandler.start = (i) => {
      this.cancelled = !1;
      let s, n;
      i.touches ? (s = i.touches[0].pageX, n = i.touches[0].pageY) : (s = i.pageX, n = i.pageY), t.hasHold && (this.held = !1, this.timer = window.setTimeout(() => {
        this.startAnimation(s, n), this.held = !0, t.repeat && !this.isRepeating && (this.isRepeating = !0, this.repeatTimeout = setInterval(() => {
          f(e, "action", { action: "hold" });
        }, t.repeat));
      }, this.holdTime));
    }, e.actionHandler.end = (i) => {
      if (["touchend", "touchcancel"].includes(i.type) && this.cancelled) {
        this.isRepeating && this.repeatTimeout && (clearInterval(this.repeatTimeout), this.isRepeating = !1);
        return;
      }
      const s = i.target;
      i.cancelable && i.preventDefault(), t.hasHold && (clearTimeout(this.timer), this.isRepeating && this.repeatTimeout && clearInterval(this.repeatTimeout), this.isRepeating = !1, this.stopAnimation(), this.timer = void 0), t.hasHold && this.held ? t.repeat || f(s, "action", { action: "hold" }) : t.hasDoubleClick ? i.type === "click" && i.detail < 2 || !this.dblClickTimeout ? this.dblClickTimeout = window.setTimeout(() => {
        this.dblClickTimeout = void 0, f(s, "action", { action: "tap" });
      }, 250) : (clearTimeout(this.dblClickTimeout), this.dblClickTimeout = void 0, f(s, "action", { action: "double_tap" })) : f(s, "action", { action: "tap" });
    }, e.actionHandler.handleEnter = (i) => {
      var s, n;
      i.keyCode === 13 && ((n = (s = i.currentTarget.actionHandler) == null ? void 0 : s.end) == null || n.call(s, i));
    }, e.addEventListener("touchstart", e.actionHandler.start, {
      passive: !0
    }), e.addEventListener("touchend", e.actionHandler.end), e.addEventListener("touchcancel", e.actionHandler.end), e.addEventListener("mousedown", e.actionHandler.start, {
      passive: !0
    }), e.addEventListener("click", e.actionHandler.end), e.addEventListener("keyup", e.actionHandler.handleEnter)));
  }
  startAnimation(e, t) {
    Object.assign(this.style, {
      left: `${e}px`,
      top: `${t}px`,
      display: null
    }), this.ripple.disabled = !1, this.ripple.startPress(), this.ripple.unbounded = !0;
  }
  stopAnimation() {
    this.ripple.endPress(), this.ripple.disabled = !0, this.style.display = "none";
  }
}
customElements.define("paper-buttons-row-action-handler", Qt);
const er = () => {
  const r = document.body;
  if (r.querySelector("paper-buttons-row-action-handler"))
    return r.querySelector(
      "paper-buttons-row-action-handler"
    );
  const e = document.createElement(
    "paper-buttons-row-action-handler"
  );
  return r.appendChild(e), e;
}, tr = (r, e) => {
  const t = er();
  t && t.bind(r, e);
}, rr = Fe(
  class extends Ke {
    update(r, [e]) {
      return tr(r.element, e), g;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    render(r) {
    }
  }
), ir = /* @__PURE__ */ new Set([
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
]), sr = /* @__PURE__ */ new Set(["open", "unlocked", "on"]), se = "on", nr = "off", or = "unavailable", ar = ["name", "icon", "image", "state"], Je = (r) => r.attributes && r.attributes.friendly_name ? r.attributes.friendly_name : r.entity_id ? lt(r.entity_id).replace(/_/g, " ") : "Unknown";
function Ue(r, e, t, i) {
  if (!t || !t.action || t.action === "none")
    return "";
  let s = (i ? r.localize("ui.panel.lovelace.cards.picture-elements.hold") : r.localize("ui.panel.lovelace.cards.picture-elements.tap")) + " ";
  switch (t.action) {
    case "navigate":
      s += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.navigate_to",
        "location",
        t.navigation_path
      )}`;
      break;
    case "url":
      s += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.url",
        "url_path",
        t.url_path
      )}`;
      break;
    case "toggle":
      s += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.toggle",
        "name",
        e
      )}`;
      break;
    case "call-service":
      s += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.call_service",
        "name",
        t.service
      )}`;
      break;
    case "more-info":
      s += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.more_info",
        "name",
        e
      )}`;
      break;
  }
  return s;
}
const lr = (r, e) => {
  if (!e || r.tooltip === !1)
    return "";
  if (r.tooltip)
    return r.tooltip;
  let t = "", i = "";
  if (r.entity && (t = r.entity in e.states ? Je(e.states[r.entity]) : r.entity), !r.tap_action && !r.hold_action)
    return t;
  const s = r.tap_action ? Ue(e, t, r.tap_action, !1) : "", n = r.hold_action ? Ue(e, t, r.hold_action, !0) : "";
  return i = s + (s && n ? `
` : "") + n, i;
}, Ge = () => {
  var i, s, n, o, c, a;
  const r = (n = (s = (i = document.querySelector("home-assistant")) == null ? void 0 : i.shadowRoot) == null ? void 0 : s.querySelector("home-assistant-main")) == null ? void 0 : n.shadowRoot, e = (r == null ? void 0 : r.querySelector("ha-drawer partial-panel-resolver")) || (r == null ? void 0 : r.querySelector("app-drawer-layout partial-panel-resolver")), t = (a = (c = (o = (e == null ? void 0 : e.shadowRoot) || e) == null ? void 0 : o.querySelector("ha-panel-lovelace")) == null ? void 0 : c.shadowRoot) == null ? void 0 : a.querySelector("hui-root");
  if (t) {
    const l = t.lovelace;
    return l.current_view = t.___curView, l;
  }
  return null;
};
let R = Ge();
function cr(r, e) {
  var s, n;
  R || (R = Ge());
  const t = ((n = (s = R == null ? void 0 : R.config) == null ? void 0 : s.paper_buttons_row) == null ? void 0 : n.presets) || {}, i = r.preset || (e == null ? void 0 : e.preset);
  return i ? ne(
    {
      mushroom: ur
    }[i] || t[i] || {},
    r
  ) : r;
}
const ur = {
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
}, dr = ".flex-box{display:flex;justify-content:space-evenly;align-items:center}.flex-column{display:inline-flex;flex-direction:column;align-items:center}.hidden{display:none}paper-button{--pbs-button-rgb-fallback: 68, 115, 158;color:var( --pbs-button-color, rgb( var( --pbs-button-rgb-color, var( --pbs-button-rgb-state-color, var( --pbs-button-rgb-default-color, var(--rgb-state-default-color, var(--pbs-button-rgb-fallback)) ) ) ) ) );background-color:var( --pbs-button-bg-color, rgba(var(--pbs-button-rgb-bg-color), var(--pbs-button-rgb-bg-opacity, 1)) );padding:6px;cursor:pointer;position:relative;display:inline-flex;align-items:center;justify-content:center;user-select:none}span{padding:2px;text-align:center}ha-icon{padding:2px}.button-active{color:var( --paper-item-icon-active-color, var( --pbs-button-active-color, rgb( var( --pbs-button-rgb-active-color, var( --pbs-button-rgb-state-color, var( --pbs-button-rgb-default-color, var(--rgb-state-default-color, var(--pbs-button-rgb-fallback)) ) ) ) ) ) );background-color:var( --pbs-button-bg-active-color, rgba( var(--pbs-button-rgb-bg-active-color, var(--pbs-button-rgb-bg-color)), var( --pbs-button-rgb-bg-active-opacity, var(--pbs-button-rgb-bg-opacity, 1) ) ) )}.button-unavailable{color:var( --pbs-button-unavailable-color, rgb(var(--pbs-button-rgb-unavailable-color, var(--rgb-disabled-color))) )}.image{position:relative;display:inline-block;width:28px;border-radius:50%;height:28px;text-align:center;background-size:cover;line-height:28px;vertical-align:middle;box-sizing:border-box}@keyframes blink{0%{opacity:0}50%{opacity:1}to{opacity:0}}@-webkit-keyframes rotating{0%{-webkit-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0)}to{-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes rotating{0%{-ms-transform:rotate(0deg);-moz-transform:rotate(0deg);-webkit-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0)}to{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}[rotating]{-webkit-animation:rotating 2s linear infinite;-moz-animation:rotating 2s linear infinite;-ms-animation:rotating 2s linear infinite;-o-animation:rotating 2s linear infinite;animation:rotating 2s linear infinite}", T = "lovelace-player-device-id";
function Xe() {
  if (!localStorage[T]) {
    const r = () => Math.floor((1 + Math.random()) * 1e5).toString(16).substring(1);
    window.fully && typeof fully.getDeviceId == "function" ? localStorage[T] = fully.getDeviceId() : localStorage[T] = `${r()}${r()}-${r()}${r()}`;
  }
  return localStorage[T];
}
let Qe = Xe();
const hr = (r) => {
  r !== null && (r === "clear" ? localStorage.removeItem(T) : localStorage[T] = r, Qe = Xe());
}, Le = new URLSearchParams(window.location.search);
Le.get("deviceID") && hr(Le.get("deviceID"));
function pr(r) {
  if (String(r).includes("{%") || String(r).includes("{{"))
    return !0;
}
function mr(r, e, t, i = !0) {
  r || (r = D().connection);
  let s = _({
    user: D().user.name,
    browser: Qe,
    hash: location.hash.substr(1) || " "
  }, t.variables), n = t.template, o = t.entity_ids;
  return r.subscribeMessage(
    (c) => {
      if (i) {
        let a = String(c.result);
        const l = /_\([^)]*\)/g;
        a = a.replace(l, (u) => D().localize(u.substring(2, u.length - 1)) || u), e(a);
      } else
        e(c.result);
    },
    {
      type: "render_template",
      template: n,
      variables: s,
      entity_ids: o
    }
  );
}
function fr(r, e) {
  r.forEach((t) => {
    t.callback(vr(t.template, e));
  });
}
function vr(r, e) {
  let t = e.states[r.entity];
  if (!t) return;
  r.attribute ? t = t.attributes[r.attribute] : t = t.state;
  let i = (r.prefix || "") + t + (r.postfix || "");
  return r.case && (i = yr(i, r.case)), i;
}
function yr(r, e) {
  switch (e) {
    case "upper":
      return r.toUpperCase();
    case "lower":
      return r.toLowerCase();
    case "first":
      return r[0].toUpperCase() + r.slice(1);
  }
}
function Ie(r, e, t) {
  var s, n;
  const i = e[t];
  typeof i == "object" ? (i.entity || (i.entity = r.entity), i.entity !== r.entity && ((s = this._entities) == null || s.push(i.entity)), (n = this._templates) == null || n.push({
    template: i,
    callback: (o) => o && (e[t] = o)
  })) : pr(i) && (mr(
    null,
    (o) => {
      e[t] = o, this.requestUpdate();
    },
    {
      template: i,
      variables: { config: r }
    }
  ), e[t] = "");
}
function _r(r, e) {
  customElements.whenDefined(r).then(() => {
    const t = customElements.get(r), i = t.prototype.firstUpdated;
    t.prototype.firstUpdated = function(s) {
      i.call(this, s), e.call(this, s);
    }, f(window, "ll-rebuild", {});
  });
}
_r("hui-generic-entity-row", function() {
  var r;
  if ((r = this.config) != null && r.extend_paper_buttons_row && this.shadowRoot) {
    const e = this.config.extend_paper_buttons_row, t = ht(
      _({
        type: "custom:paper-buttons-row"
      }, e),
      !0
    );
    at(t);
    let i = this.shadowRoot.querySelector("slot");
    if (!i) return;
    if (i.parentElement && (i.parentElement.parentElement ? i.parentElement.classList.contains("state") && i.parentElement.parentElement.classList.contains("text-content") ? i = i.parentElement.parentElement : console.error("unexpected parent node found") : i.parentElement.classList.contains("text-content") ? i = i.parentElement : console.error("unexpected parent node found")), e.hide_state && (i.style.display = "none"), e.hide_badge) {
      const s = this.shadowRoot.querySelector("state-badge");
      s && (s.style.visibility = "hidden", s.style.marginLeft = "-48px");
    }
    e.position === "right" ? br(t, i) : et(t, i);
  }
});
function et(r, e) {
  var t;
  (t = e.parentNode) == null || t.insertBefore(r, e);
}
function br(r, e) {
  var t;
  e.nextElementSibling ? et(r, e.nextElementSibling) : (t = e.parentNode) == null || t.appendChild(r);
}
var gr = Object.defineProperty, $r = Object.getOwnPropertyDescriptor, ue = (r, e, t, i) => {
  for (var s = i > 1 ? void 0 : i ? $r(e, t) : e, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (s = (i ? o(e, t, s) : o(s)) || s);
  return i && s && gr(e, t, s), s;
};
console.groupCollapsed(
  "%c PAPER-BUTTONS-ROW %c 2.2.0 ",
  "color: white; background: #039be5; font-weight: 700;",
  "color: #039be5; background: white; font-weight: 700;"
);
console.info("branch   : main");
console.info("commit   : 51525db3a22e8ff1f2e39b67c79cba7380259d4f");
console.info("built at : 2024-07-27T17:06:05.515Z");
console.info("https://github.com/jcwillox/lovelace-paper-buttons-row");
console.groupEnd();
const wr = (r) => {
  if (r.state_icons && typeof r.state == "string")
    return r.state_icons[r.state.toLowerCase()];
}, Ar = (r) => r.state_text && typeof r.state == "string" && r.state_text[r.state.toLowerCase()] || r.state, Er = (r) => {
  switch (console.warn(
    "PAPER-BUTTONS-ROW",
    "'align_icon' and 'align_icons' is deprecated and will be removed in a future version"
  ), r) {
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
let z = class extends M {
  constructor() {
    super(...arguments), this._getStateColor = (r, e) => {
      const t = getComputedStyle(this);
      if (r.attributes.device_class) {
        const s = t.getPropertyValue(
          `--state-${e}-${r.attributes.device_class}-${r.state}-color`
        );
        if (s)
          return this._hexToRgb(s);
      }
      let i = t.getPropertyValue(
        `--state-${e}-${r.state}-color`
      );
      if (i) return this._hexToRgb(i);
      if (r.state === se || r.state === nr) {
        const s = r.state === se ? "active" : "inactive";
        if (i = t.getPropertyValue(`--state-${e}-${s}-color`), i) return this._hexToRgb(i);
        if (r.state === se && (i = t.getPropertyValue("--state-active-color"), i))
          return this._hexToRgb(i);
      }
    };
  }
  // convert an externally set config to the correct internal structure
  _transformConfig(r) {
    if (!r) throw new Error("Invalid configuration");
    if (!r.buttons) throw new Error("Missing buttons.");
    if (!Array.isArray(r.buttons))
      throw new Error("Buttons must be an array.");
    if (r.buttons.length <= 0)
      throw new Error("At least one button required.");
    if (r = JSON.parse(JSON.stringify(r)), r.buttons.every((e) => !Array.isArray(e)))
      r.buttons = [r.buttons];
    else if (!r.buttons.every((e) => Array.isArray(e)))
      throw new Error("Cannot mix rows and buttons");
    if (r.styles === void 0)
      r.styles = {};
    else
      for (const e in r.styles)
        r.styles[e] = ie(r.styles[e]);
    return r.buttons = r.buttons.map(
      (e) => e.map((t) => {
        if (typeof t == "string" && (t = { entity: t }), t = ne(r.base_config || {}, t), typeof t.layout == "string" && (t.layout = t.layout.split("|").map(
          (i) => i.includes("_") ? i.split("_") : i
        )), typeof t.active == "string" && (t.active = [t.active]), t.styles == null && (t.styles = t.style), t.styles === void 0)
          t.styles = {};
        else
          for (const i in t.styles)
            t.styles[i] = ie(t.styles[i]);
        if (t.state_styles)
          for (const i in t.state_styles)
            for (const s in t.state_styles[i])
              t.state_styles[i][s] = ie(
                t.state_styles[i][s]
              );
        return t = this._defaultConfig(r, t), t;
      })
    ), r;
  }
  setConfig(r) {
    this._config = this._transformConfig(r), this.hass || (this.hass = D()), this._entities = [], this._templates = [], this._config.buttons = this._config.buttons.map((e) => e.map((t) => {
      var i;
      return t = cr(t, this._config), t.entity && ((i = this._entities) == null || i.push(t.entity)), ar.forEach(
        (s) => Ie.call(this, t, t, s)
      ), Object.values(t.styles).forEach((s) => {
        typeof s == "object" && Object.keys(s).forEach(
          (n) => Ie.call(this, t, s, n)
        );
      }), t;
    }));
  }
  render() {
    return !this._config || !this.hass ? y`` : (fr(this._templates, this.hass), y`
      ${this._config.extra_styles ? y`
            <style>
              ${this._config.extra_styles}
            </style>
          ` : ""}
      ${this._config.buttons.map((r) => {
      var e;
      return y`
          <div
            class="flex-box"
            style="${w((e = this._config) == null ? void 0 : e.styles)}"
          >
            ${r.map((t) => {
        var a, l, u;
        const i = t.entity != null && ((a = this.hass) == null ? void 0 : a.states[t.entity]) || void 0, s = t.entity && W(t.entity), n = this._getStyles(t), o = _(_(_({}, this._getBaseStyles()), this._getStateStyles(s, i)), n.button || {}), c = t.active ? new Set(t.active) : sr;
        return y`
                <paper-button
                  @action="${(d) => this._handleAction(d, t)}"
                  .actionHandler="${rr({
          hasHold: Me(t.hold_action),
          hasDoubleClick: Me(t.double_tap_action),
          repeat: (l = t.hold_action) == null ? void 0 : l.repeat
        })}"
                  style="${w(o)}"
                  class="${this._getClass(
          c,
          t.state,
          i == null ? void 0 : i.state
        )}"
                  title="${lr(t, this.hass)}"
                  data-domain="${re(s)}"
                  data-entity-state="${re(i == null ? void 0 : i.state)}"
                  data-state="${re(
          typeof t.state == "string" && t.state.toLowerCase()
        )}"
                >
                  ${(u = t.layout) == null ? void 0 : u.map((d) => Array.isArray(d) ? y`
                        <div class="flex-column">
                          ${d.map(
          (p) => this.renderElement(p, t, n, i)
        )}
                        </div>
                      ` : this.renderElement(d, t, n, i))}

                  <paper-ripple
                    center
                    style="${w(n.ripple || {})}"
                    class="${this._getRippleClass(t)}"
                  ></paper-ripple>
                </paper-button>
              `;
      })}
          </div>
        `;
    })}
    `);
  }
  renderElement(r, e, t, i) {
    const s = (t == null ? void 0 : t[r]) || {};
    switch (r) {
      case "icon":
        return this.renderIcon(e, s, i);
      case "name":
        return this.renderName(e, s, i);
      case "state":
        return this.renderState(e, s);
    }
  }
  renderIcon(r, e, t) {
    const i = r.icon !== !1 && (r.icon || r.entity) ? wr(r) || r.icon || t && vt(t) : !1;
    return r.image ? y`<img
          src="${r.image}"
          class="image"
          style="${w(e)}"
          alt="icon"
        />` : i ? y` <ha-icon style="${w(e)}" .icon="${i}" />` : "";
  }
  renderName(r, e, t) {
    return r.name !== !1 && (r.name || r.entity) ? y`
          <span style="${w(e)}">
            ${r.name || Je(t)}
          </span>
        ` : "";
  }
  renderState(r, e) {
    return r.state !== !1 ? y`
          <span style="${w(e)}"> ${Ar(r)} </span>
        ` : "";
  }
  _handleAction(r, e) {
    this.hass && e && r.detail.action && Gt(this, this.hass, e, r.detail.action);
  }
  _getClass(r, e, t) {
    return typeof e == "string" && r.has(e.toLowerCase()) ? "button-active" : or === t ? "button-unavailable" : "";
  }
  _getBaseStyles() {
    var e;
    const r = getComputedStyle(this).getPropertyValue("--state-icon-color");
    return {
      "--rgb-state-default-color": (e = this._hexToRgb(r)) == null ? void 0 : e.join(", ")
    };
  }
  _getStateStyles(r, e) {
    if (!r || !e) return {};
    if (e.attributes.rgb_color)
      return {
        "--pbs-button-rgb-state-color": e.attributes.rgb_color
      };
    {
      const t = this._getStateColor(e, r);
      if (t)
        return {
          "--pbs-button-rgb-state-color": t.join(", ")
        };
    }
    return {};
  }
  _hexToRgb(r) {
    var e;
    return (e = r.match(/[A-Za-z0-9]{2}/g)) == null ? void 0 : e.map((t) => parseInt(t, 16));
  }
  _getRippleClass(r) {
    var e, t;
    switch (r.ripple) {
      case "none":
        return "hidden";
      case "circle":
        return "circle";
      case "fill":
        return "";
    }
    return ((e = r.layout) == null ? void 0 : e.length) === 1 && r.layout[0] === "icon" ? "circle" : r.name || r.name !== !1 && r.entity || (t = r.layout) != null && t.includes("state") ? "" : "circle";
  }
  _getStyles(r) {
    if (!r.state || !r.state_styles)
      return r.styles;
    const e = r.state_styles[r.state.toLowerCase()];
    return e ? ne(r.styles, e) : r.styles;
  }
  _defaultConfig(r, e) {
    if (!e.layout) {
      const t = e.align_icon || r.align_icons;
      t ? e.layout = Er(t) : e.layout = ["icon", "name"];
    }
    if (!e.state && e.entity && (e.state = { case: "upper" }), e.entity) {
      const t = W(e.entity);
      e.hold_action || (e.hold_action = { action: "more-info" }), e.tap_action || (ir.has(t) ? e.tap_action = { action: "toggle" } : t === "scene" ? e.tap_action = {
        action: "call-service",
        service: "scene.turn_on",
        service_data: {
          entity_id: e.entity
        }
      } : e.tap_action = { action: "more-info" });
    }
    return e;
  }
  shouldUpdate(r) {
    if (r.has("_config"))
      return !0;
    if (this._entities) {
      const e = r.get("hass");
      return e ? this._entities.some(
        (t) => {
          var i;
          return e.states[t] !== ((i = this.hass) == null ? void 0 : i.states[t]);
        }
      ) : !0;
    }
    return !1;
  }
};
z.styles = je(dr);
ue([
  Ze()
], z.prototype, "hass", 2);
ue([
  Ze()
], z.prototype, "_config", 2);
z = ue([
  Zt("paper-buttons-row")
], z);
export {
  z as PaperButtonsRow
};
