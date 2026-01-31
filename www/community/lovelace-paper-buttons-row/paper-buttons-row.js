var ne = Object.defineProperty, oe = Object.defineProperties;
var ae = Object.getOwnPropertyDescriptors;
var mt = Object.getOwnPropertySymbols;
var le = Object.prototype.hasOwnProperty, ce = Object.prototype.propertyIsEnumerable;
var yt = (r, t, e) => t in r ? ne(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e, x = (r, t) => {
  for (var e in t || (t = {}))
    le.call(t, e) && yt(r, e, t[e]);
  if (mt)
    for (var e of mt(t))
      ce.call(t, e) && yt(r, e, t[e]);
  return r;
}, Y = (r, t) => oe(r, ae(t));
var _t = (r, t, e) => new Promise((s, i) => {
  var n = (a) => {
    try {
      c(e.next(a));
    } catch (l) {
      i(l);
    }
  }, o = (a) => {
    try {
      c(e.throw(a));
    } catch (l) {
      i(l);
    }
  }, c = (a) => a.done ? s(a.value) : Promise.resolve(a.value).then(n, o);
  c((e = e.apply(r, t)).next());
});
function V() {
  if (document.querySelector("hc-main"))
    return document.querySelector("hc-main").hass;
  if (document.querySelector("home-assistant"))
    return document.querySelector("home-assistant").hass;
}
function ue(r) {
  if (document.querySelector("hc-main"))
    return document.querySelector("hc-main").provideHass(r);
  if (document.querySelector("home-assistant"))
    return document.querySelector("home-assistant").provideHass(r);
}
var bt, $t;
(function(r) {
  r.language = "language", r.system = "system", r.comma_decimal = "comma_decimal", r.decimal_comma = "decimal_comma", r.space_comma = "space_comma", r.none = "none";
})(bt || (bt = {})), function(r) {
  r.language = "language", r.system = "system", r.am_pm = "12", r.twenty_four = "24";
}($t || ($t = {}));
function ct(r) {
  return r.substr(0, r.indexOf("."));
}
function de(r) {
  return r.substr(r.indexOf(".") + 1);
}
var he = ["closed", "locked", "off"], $ = function(r, t, e, s) {
  s = s || {}, e = e == null ? {} : e;
  var i = new Event(t, { bubbles: s.bubbles === void 0 || s.bubbles, cancelable: !!s.cancelable, composed: s.composed === void 0 || s.composed });
  return i.detail = e, r.dispatchEvent(i), i;
}, pe = /* @__PURE__ */ new Set(["call-service", "divider", "section", "weblink", "cast", "select"]), fe = { alert: "toggle", automation: "toggle", climate: "climate", cover: "cover", fan: "toggle", group: "group", input_boolean: "toggle", input_number: "input-number", input_select: "input-select", input_text: "input-text", light: "toggle", lock: "lock", media_player: "media-player", remote: "toggle", scene: "scene", script: "script", sensor: "sensor", timer: "timer", switch: "toggle", vacuum: "toggle", water_heater: "climate", input_datetime: "input-datetime" }, ve = function(r, t) {
  var e = function(a, l) {
    return s("hui-error-card", { type: "error", error: a, config: l });
  }, s = function(a, l) {
    var h = window.document.createElement(a);
    try {
      if (!h.setConfig) return;
      h.setConfig(l);
    } catch (p) {
      return console.error(a, p), e(p.message, l);
    }
    return h;
  };
  if (!r || typeof r != "object") return e("No type defined", r);
  var i = r.type;
  if (i && i.startsWith("custom:")) i = i.substr(7);
  else if (pe.has(i)) i = "hui-" + i + "-row";
  else {
    if (!r.entity) return e("Invalid config given.", r);
    var n = r.entity.split(".", 1)[0];
    i = "hui-" + (fe[n] || "text") + "-entity-row";
  }
  if (customElements.get(i)) return s(i, r);
  var o = e("Custom element doesn't exist: " + r.type + ".", r);
  o.style.display = "None";
  var c = setTimeout(function() {
    o.style.display = "";
  }, 2e3);
  return customElements.whenDefined(r.type).then(function() {
    clearTimeout(c), $(o, "ll-rebuild", {}, o);
  }), o;
}, b = function(r) {
  $(window, "haptic", r);
}, me = function(r, t, e) {
  e === void 0 && (e = !1), e ? history.replaceState(null, "", t) : history.pushState(null, "", t), $(window, "location-changed", { replace: e });
}, ye = function(r, t, e) {
  e === void 0 && (e = !0);
  var s, i = ct(t), n = i === "group" ? "homeassistant" : i;
  switch (i) {
    case "lock":
      s = e ? "unlock" : "lock";
      break;
    case "cover":
      s = e ? "open_cover" : "close_cover";
      break;
    default:
      s = e ? "turn_on" : "turn_off";
  }
  return r.callService(n, s, { entity_id: t });
}, _e = function(r, t) {
  var e = he.includes(r.states[t].state);
  return ye(r, t, e);
};
function jt(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var G, gt;
function be() {
  if (gt) return G;
  gt = 1;
  var r = function(d) {
    return t(d) && !e(d);
  };
  function t(u) {
    return !!u && typeof u == "object";
  }
  function e(u) {
    var d = Object.prototype.toString.call(u);
    return d === "[object RegExp]" || d === "[object Date]" || n(u);
  }
  var s = typeof Symbol == "function" && Symbol.for, i = s ? Symbol.for("react.element") : 60103;
  function n(u) {
    return u.$$typeof === i;
  }
  function o(u) {
    return Array.isArray(u) ? [] : {};
  }
  function c(u, d) {
    return d.clone !== !1 && d.isMergeableObject(u) ? g(o(u), u, d) : u;
  }
  function a(u, d, f) {
    return u.concat(d).map(function(A) {
      return c(A, f);
    });
  }
  function l(u, d) {
    if (!d.customMerge)
      return g;
    var f = d.customMerge(u);
    return typeof f == "function" ? f : g;
  }
  function h(u) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(u).filter(function(d) {
      return Object.propertyIsEnumerable.call(u, d);
    }) : [];
  }
  function p(u) {
    return Object.keys(u).concat(h(u));
  }
  function v(u, d) {
    try {
      return d in u;
    } catch (f) {
      return !1;
    }
  }
  function _(u, d) {
    return v(u, d) && !(Object.hasOwnProperty.call(u, d) && Object.propertyIsEnumerable.call(u, d));
  }
  function J(u, d, f) {
    var A = {};
    return f.isMergeableObject(u) && p(u).forEach(function(y) {
      A[y] = c(u[y], f);
    }), p(d).forEach(function(y) {
      _(u, y) || (v(u, y) && f.isMergeableObject(d[y]) ? A[y] = l(y, f)(u[y], d[y], f) : A[y] = c(d[y], f));
    }), A;
  }
  function g(u, d, f) {
    f = f || {}, f.arrayMerge = f.arrayMerge || a, f.isMergeableObject = f.isMergeableObject || r, f.cloneUnlessOtherwiseSpecified = c;
    var A = Array.isArray(d), y = Array.isArray(u), ie = A === y;
    return ie ? A ? f.arrayMerge(u, d, f) : J(u, d, f) : c(d, f);
  }
  g.all = function(d, f) {
    if (!Array.isArray(d))
      throw new Error("first argument should be an array");
    return d.reduce(function(A, y) {
      return g(A, y, f);
    }, {});
  };
  var se = g;
  return G = se, G;
}
var $e = be();
const ut = /* @__PURE__ */ jt($e);
const K = window, ft = K.ShadowRoot && (K.ShadyCSS === void 0 || K.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, zt = Symbol(), At = /* @__PURE__ */ new WeakMap();
let ge = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== zt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ft && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = At.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && At.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const qt = (r) => new ge(typeof r == "string" ? r : r + "", void 0, zt), Ae = (r, t) => {
  ft ? r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach((e) => {
    const s = document.createElement("style"), i = K.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
  });
}, wt = ft ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return qt(e);
})(r) : r;
var X;
const W = window, Et = W.trustedTypes, we = Et ? Et.emptyScript : "", St = W.reactiveElementPolyfillSupport, dt = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? we : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, t) {
  let e = r;
  switch (t) {
    case Boolean:
      e = r !== null;
      break;
    case Number:
      e = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(r);
      } catch (s) {
        e = null;
      }
  }
  return e;
} }, Bt = (r, t) => t !== r && (t == t || r == r), Q = { attribute: !0, type: String, converter: dt, reflect: !1, hasChanged: Bt }, ht = "finalized";
let R = class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
  }
  static addInitializer(t) {
    var e;
    this.finalize(), ((e = this.h) !== null && e !== void 0 ? e : this.h = []).push(t);
  }
  static get observedAttributes() {
    this.finalize();
    const t = [];
    return this.elementProperties.forEach((e, s) => {
      const i = this._$Ep(s, e);
      i !== void 0 && (this._$Ev.set(i, s), t.push(i));
    }), t;
  }
  static createProperty(t, e = Q) {
    if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
      const s = typeof t == "symbol" ? Symbol() : "__" + t, i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Object.defineProperty(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    return { get() {
      return this[e];
    }, set(i) {
      const n = this[t];
      this[e] = i, this.requestUpdate(t, n, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) || Q;
  }
  static finalize() {
    if (this.hasOwnProperty(ht)) return !1;
    this[ht] = !0;
    const t = Object.getPrototypeOf(this);
    if (t.finalize(), t.h !== void 0 && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const e = this.properties, s = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), !0;
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(wt(i));
    } else t !== void 0 && e.push(wt(t));
    return e;
  }
  static _$Ep(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  _$Eu() {
    var t;
    this._$E_ = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t = this.constructor.h) === null || t === void 0 || t.forEach((e) => e(this));
  }
  addController(t) {
    var e, s;
    ((e = this._$ES) !== null && e !== void 0 ? e : this._$ES = []).push(t), this.renderRoot !== void 0 && this.isConnected && ((s = t.hostConnected) === null || s === void 0 || s.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t, e) => {
      this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e]);
    });
  }
  createRenderRoot() {
    var t;
    const e = (t = this.shadowRoot) !== null && t !== void 0 ? t : this.attachShadow(this.constructor.shadowRootOptions);
    return Ae(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var t;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) === null || s === void 0 ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$ES) === null || t === void 0 || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) === null || s === void 0 ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$EO(t, e, s = Q) {
    var i;
    const n = this.constructor._$Ep(t, s);
    if (n !== void 0 && s.reflect === !0) {
      const o = (((i = s.converter) === null || i === void 0 ? void 0 : i.toAttribute) !== void 0 ? s.converter : dt).toAttribute(e, s.type);
      this._$El = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$El = null;
    }
  }
  _$AK(t, e) {
    var s;
    const i = this.constructor, n = i._$Ev.get(t);
    if (n !== void 0 && this._$El !== n) {
      const o = i.getPropertyOptions(n), c = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) === null || s === void 0 ? void 0 : s.fromAttribute) !== void 0 ? o.converter : dt;
      this._$El = n, this[n] = c.fromAttribute(e, o.type), this._$El = null;
    }
  }
  requestUpdate(t, e, s) {
    let i = !0;
    t !== void 0 && (((s = s || this.constructor.getPropertyOptions(t)).hasChanged || Bt)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), s.reflect === !0 && this._$El !== t && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t, s))) : i = !1), !this.isUpdatePending && i && (this._$E_ = this._$Ej());
  }
  _$Ej() {
    return _t(this, null, function* () {
      this.isUpdatePending = !0;
      try {
        yield this._$E_;
      } catch (e) {
        Promise.reject(e);
      }
      const t = this.scheduleUpdate();
      return t != null && (yield t), !this.isUpdatePending;
    });
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t;
    if (!this.isUpdatePending) return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((i, n) => this[n] = i), this._$Ei = void 0);
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), (t = this._$ES) === null || t === void 0 || t.forEach((i) => {
        var n;
        return (n = i.hostUpdate) === null || n === void 0 ? void 0 : n.call(i);
      }), this.update(s)) : this._$Ek();
    } catch (i) {
      throw e = !1, this._$Ek(), i;
    }
    e && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$ES) === null || e === void 0 || e.forEach((s) => {
      var i;
      return (i = s.hostUpdated) === null || i === void 0 ? void 0 : i.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$EC !== void 0 && (this._$EC.forEach((e, s) => this._$EO(s, this[s], e)), this._$EC = void 0), this._$Ek();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
R[ht] = !0, R.elementProperties = /* @__PURE__ */ new Map(), R.elementStyles = [], R.shadowRootOptions = { mode: "open" }, St == null || St({ ReactiveElement: R }), ((X = W.reactiveElementVersions) !== null && X !== void 0 ? X : W.reactiveElementVersions = []).push("1.6.3");
var tt;
const F = window, M = F.trustedTypes, xt = M ? M.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, pt = "$lit$", E = `lit$${(Math.random() + "").slice(9)}$`, Vt = "?" + E, Ee = `<${Vt}>`, H = document, C = () => H.createComment(""), j = (r) => r === null || typeof r != "object" && typeof r != "function", Kt = Array.isArray, Se = (r) => Kt(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function", et = `[ 	
\f\r]`, L = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Tt = /-->/g, Pt = />/g, T = RegExp(`>|${et}(?:([^\\s"'>=/]+)(${et}*=${et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), kt = /'/g, Ht = /"/g, Wt = /^(?:script|style|textarea|title)$/i, xe = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), w = xe(1), S = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), Ot = /* @__PURE__ */ new WeakMap(), k = H.createTreeWalker(H, 129, null, !1);
function Ft(r, t) {
  if (!Array.isArray(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return xt !== void 0 ? xt.createHTML(t) : t;
}
const Te = (r, t) => {
  const e = r.length - 1, s = [];
  let i, n = t === 2 ? "<svg>" : "", o = L;
  for (let c = 0; c < e; c++) {
    const a = r[c];
    let l, h, p = -1, v = 0;
    for (; v < a.length && (o.lastIndex = v, h = o.exec(a), h !== null); ) v = o.lastIndex, o === L ? h[1] === "!--" ? o = Tt : h[1] !== void 0 ? o = Pt : h[2] !== void 0 ? (Wt.test(h[2]) && (i = RegExp("</" + h[2], "g")), o = T) : h[3] !== void 0 && (o = T) : o === T ? h[0] === ">" ? (o = i != null ? i : L, p = -1) : h[1] === void 0 ? p = -2 : (p = o.lastIndex - h[2].length, l = h[1], o = h[3] === void 0 ? T : h[3] === '"' ? Ht : kt) : o === Ht || o === kt ? o = T : o === Tt || o === Pt ? o = L : (o = T, i = void 0);
    const _ = o === T && r[c + 1].startsWith("/>") ? " " : "";
    n += o === L ? a + Ee : p >= 0 ? (s.push(l), a.slice(0, p) + pt + a.slice(p) + E + _) : a + E + (p === -2 ? (s.push(void 0), c) : _);
  }
  return [Ft(r, n + (r[e] || "<?>") + (t === 2 ? "</svg>" : "")), s];
};
class z {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
    const c = t.length - 1, a = this.parts, [l, h] = Te(t, e);
    if (this.el = z.createElement(l, s), k.currentNode = this.el.content, e === 2) {
      const p = this.el.content, v = p.firstChild;
      v.remove(), p.append(...v.childNodes);
    }
    for (; (i = k.nextNode()) !== null && a.length < c; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) {
          const p = [];
          for (const v of i.getAttributeNames()) if (v.endsWith(pt) || v.startsWith(E)) {
            const _ = h[o++];
            if (p.push(v), _ !== void 0) {
              const J = i.getAttribute(_.toLowerCase() + pt).split(E), g = /([.?@])?(.*)/.exec(_);
              a.push({ type: 1, index: n, name: g[2], strings: J, ctor: g[1] === "." ? ke : g[1] === "?" ? Oe : g[1] === "@" ? Re : Z });
            } else a.push({ type: 6, index: n });
          }
          for (const v of p) i.removeAttribute(v);
        }
        if (Wt.test(i.tagName)) {
          const p = i.textContent.split(E), v = p.length - 1;
          if (v > 0) {
            i.textContent = M ? M.emptyScript : "";
            for (let _ = 0; _ < v; _++) i.append(p[_], C()), k.nextNode(), a.push({ type: 2, index: ++n });
            i.append(p[v], C());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Vt) a.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(E, p + 1)) !== -1; ) a.push({ type: 7, index: n }), p += E.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = H.createElement("template");
    return s.innerHTML = t, s;
  }
}
function N(r, t, e = r, s) {
  var i, n, o, c;
  if (t === S) return t;
  let a = s !== void 0 ? (i = e._$Co) === null || i === void 0 ? void 0 : i[s] : e._$Cl;
  const l = j(t) ? void 0 : t._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== l && ((n = a == null ? void 0 : a._$AO) === null || n === void 0 || n.call(a, !1), l === void 0 ? a = void 0 : (a = new l(r), a._$AT(r, e, s)), s !== void 0 ? ((o = (c = e)._$Co) !== null && o !== void 0 ? o : c._$Co = [])[s] = a : e._$Cl = a), a !== void 0 && (t = N(r, a._$AS(r, t.values), a, s)), t;
}
class Pe {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var e;
    const { el: { content: s }, parts: i } = this._$AD, n = ((e = t == null ? void 0 : t.creationScope) !== null && e !== void 0 ? e : H).importNode(s, !0);
    k.currentNode = n;
    let o = k.nextNode(), c = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (c === l.index) {
        let h;
        l.type === 2 ? h = new B(o, o.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(o, l.name, l.strings, this, t) : l.type === 6 && (h = new Ue(o, this, t)), this._$AV.push(h), l = i[++a];
      }
      c !== (l == null ? void 0 : l.index) && (o = k.nextNode(), c++);
    }
    return k.currentNode = H, n;
  }
  v(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class B {
  constructor(t, e, s, i) {
    var n;
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cp = (n = i == null ? void 0 : i.isConnected) === null || n === void 0 || n;
  }
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) === null || t === void 0 ? void 0 : t._$AU) !== null && e !== void 0 ? e : this._$Cp;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = N(this, t, e), j(t) ? t === m || t == null || t === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : t !== this._$AH && t !== S && this._(t) : t._$litType$ !== void 0 ? this.g(t) : t.nodeType !== void 0 ? this.$(t) : Se(t) ? this.T(t) : this._(t);
  }
  k(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  $(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
  }
  _(t) {
    this._$AH !== m && j(this._$AH) ? this._$AA.nextSibling.data = t : this.$(H.createTextNode(t)), this._$AH = t;
  }
  g(t) {
    var e;
    const { values: s, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = z.createElement(Ft(i.h, i.h[0]), this.options)), i);
    if (((e = this._$AH) === null || e === void 0 ? void 0 : e._$AD) === n) this._$AH.v(s);
    else {
      const o = new Pe(n, this), c = o.u(this.options);
      o.v(s), this.$(c), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Ot.get(t.strings);
    return e === void 0 && Ot.set(t.strings, e = new z(t)), e;
  }
  T(t) {
    Kt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const n of t) i === e.length ? e.push(s = new B(this.k(C()), this.k(C()), this, this.options)) : s = e[i], s._$AI(n), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) === null || s === void 0 || s.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const i = t.nextSibling;
      t.remove(), t = i;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cp = t, (e = this._$AP) === null || e === void 0 || e.call(this, t));
  }
}
class Z {
  constructor(t, e, s, i, n) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = m;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t, e = this, s, i) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = N(this, t, e, 0), o = !j(t) || t !== this._$AH && t !== S, o && (this._$AH = t);
    else {
      const c = t;
      let a, l;
      for (t = n[0], a = 0; a < n.length - 1; a++) l = N(this, c[s + a], e, a), l === S && (l = this._$AH[a]), o || (o = !j(l) || l !== this._$AH[a]), l === m ? t = m : t !== m && (t += (l != null ? l : "") + n[a + 1]), this._$AH[a] = l;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t != null ? t : "");
  }
}
class ke extends Z {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === m ? void 0 : t;
  }
}
const He = M ? M.emptyScript : "";
class Oe extends Z {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    t && t !== m ? this.element.setAttribute(this.name, He) : this.element.removeAttribute(this.name);
  }
}
class Re extends Z {
  constructor(t, e, s, i, n) {
    super(t, e, s, i, n), this.type = 5;
  }
  _$AI(t, e = this) {
    var s;
    if ((t = (s = N(this, t, e, 0)) !== null && s !== void 0 ? s : m) === S) return;
    const i = this._$AH, n = t === m && i !== m || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, o = t !== m && (i === m || n);
    n && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, s;
    typeof this._$AH == "function" ? this._$AH.call((s = (e = this.options) === null || e === void 0 ? void 0 : e.host) !== null && s !== void 0 ? s : this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ue {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    N(this, t);
  }
}
const Rt = F.litHtmlPolyfillSupport;
Rt == null || Rt(z, B), ((tt = F.litHtmlVersions) !== null && tt !== void 0 ? tt : F.litHtmlVersions = []).push("2.8.0");
const Me = (r, t, e) => {
  var s, i;
  const n = (s = e == null ? void 0 : e.renderBefore) !== null && s !== void 0 ? s : t;
  let o = n._$litPart$;
  if (o === void 0) {
    const c = (i = e == null ? void 0 : e.renderBefore) !== null && i !== void 0 ? i : null;
    n._$litPart$ = o = new B(t.insertBefore(C(), c), c, void 0, e != null ? e : {});
  }
  return o._$AI(r), o;
};
var rt, st;
class D extends R {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t, e;
    const s = super.createRenderRoot();
    return (t = (e = this.renderOptions).renderBefore) !== null && t !== void 0 || (e.renderBefore = s.firstChild), s;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Me(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) === null || t === void 0 || t.setConnected(!1);
  }
  render() {
    return S;
  }
}
D.finalized = !0, D._$litElement$ = !0, (rt = globalThis.litElementHydrateSupport) === null || rt === void 0 || rt.call(globalThis, { LitElement: D });
const Ut = globalThis.litElementPolyfillSupport;
Ut == null || Ut({ LitElement: D });
((st = globalThis.litElementVersions) !== null && st !== void 0 ? st : globalThis.litElementVersions = []).push("3.3.3");
const Ne = (r) => (t) => typeof t == "function" ? ((e, s) => (customElements.define(e, s), s))(r, t) : ((e, s) => {
  const { kind: i, elements: n } = s;
  return { kind: i, elements: n, finisher(o) {
    customElements.define(e, o);
  } };
})(r, t);
const Le = (r, t) => t.kind === "method" && t.descriptor && !("value" in t.descriptor) ? Y(x({}, t), { finisher(e) {
  e.createProperty(t.key, r);
} }) : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: t.key, initializer() {
  typeof t.initializer == "function" && (this[t.key] = t.initializer.call(this));
}, finisher(e) {
  e.createProperty(t.key, r);
} }, Ie = (r, t, e) => {
  t.constructor.createProperty(e, r);
};
function Zt(r) {
  return (t, e) => e !== void 0 ? Ie(r, t, e) : Le(r, t);
}
var it;
((it = window.HTMLSlotElement) === null || it === void 0 ? void 0 : it.prototype.assignedElements) != null;
const nt = (r) => r != null ? r : m;
const De = { ATTRIBUTE: 1 }, Jt = (r) => (...t) => ({ _$litDirective$: r, values: t });
let Yt = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, s) {
    this._$Ct = t, this._$AM = e, this._$Ci = s;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
const Gt = "important", Ce = " !" + Gt, P = Jt(class extends Yt {
  constructor(r) {
    var t;
    if (super(r), r.type !== De.ATTRIBUTE || r.name !== "style" || ((t = r.strings) === null || t === void 0 ? void 0 : t.length) > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(r) {
    return Object.keys(r).reduce((t, e) => {
      const s = r[e];
      return s == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
    }, "");
  }
  update(r, [t]) {
    const { style: e } = r.element;
    if (this.ht === void 0) {
      this.ht = /* @__PURE__ */ new Set();
      for (const s in t) this.ht.add(s);
      return this.render(t);
    }
    this.ht.forEach((s) => {
      t[s] == null && (this.ht.delete(s), s.includes("-") ? e.removeProperty(s) : e[s] = "");
    });
    for (const s in t) {
      const i = t[s];
      if (i != null) {
        this.ht.add(s);
        const n = typeof i == "string" && i.endsWith(Ce);
        s.includes("-") || n ? e.setProperty(s, n ? i.slice(0, -11) : i, n ? Gt : "") : e[s] = i;
      }
    }
    return S;
  }
}), O = (r, t) => $(r, "hass-notification", t), ot = (r) => Array.isArray(r) ? (
  // biome-ignore lint/performance/noAccumulatingSpread: rework this
  r.reduce((t, e) => Object.assign(t, e), {})
) : r, je = (r, t, e, s) => {
  let i;
  s === "double_tap" && e.double_tap_action ? i = e.double_tap_action : s === "hold" && e.hold_action ? i = e.hold_action : s === "tap" && e.tap_action && (i = e.tap_action), ze(r, t, e, i);
};
function ze(r, t, e, s) {
  if (s || (s = {
    action: "more-info"
  }), !(s.confirmation && (!s.confirmation.exemptions || !s.confirmation.exemptions.some(
    (i) => {
      var n;
      return i.user === ((n = t == null ? void 0 : t.user) == null ? void 0 : n.id);
    }
  )) && (b("warning"), !confirm(
    s.confirmation.text || `Are you sure you want to ${s.action}?`
  ))))
    switch (s.action) {
      case "more-info": {
        const i = s.entity || e.entity;
        i ? $(r, "hass-more-info", { entityId: i }) : (O(r, {
          message: t.localize(
            "ui.panel.lovelace.cards.actions.no_entity_more_info"
          )
        }), b("failure"));
        break;
      }
      case "navigate":
        if (!s.navigation_path) {
          O(r, {
            message: t.localize(
              "ui.panel.lovelace.cards.actions.no_navigation_path"
            )
          }), b("failure");
          return;
        }
        me(r, s.navigation_path), b("light");
        break;
      case "url":
        if (!s.url_path) {
          O(r, {
            message: t.localize("ui.panel.lovelace.cards.actions.no_url")
          }), b("failure");
          return;
        }
        window.open(s.url_path), b("light");
        break;
      case "toggle":
        if (!e.entity) {
          O(r, {
            message: t.localize(
              "ui.panel.lovelace.cards.actions.no_entity_toggle"
            )
          }), b("failure");
          return;
        }
        _e(t, e.entity), b("light");
        break;
      case "call-service": {
        if (!s.service) {
          O(r, {
            message: t.localize("ui.panel.lovelace.cards.actions.no_service")
          }), b("failure");
          return;
        }
        const [i, n] = s.service.split(".", 2);
        t.callService(
          i,
          n,
          s.service_data,
          s.target
        ), b("light");
        break;
      }
      case "fire-event": {
        if (!s.event_type) {
          O(r, {
            message: "No event to call specified"
          }), b("failure");
          return;
        }
        t.callApi(
          "POST",
          `events/${s.event_type}`,
          s.event_data || {}
        ), b("light");
        break;
      }
      case "fire-dom-event":
        $(r, "ll-custom", s), b("light");
    }
}
function Mt(r) {
  return r !== void 0 && r.action !== "none";
}
var at, Nt;
function qe() {
  return Nt || (Nt = 1, at = function r(t, e) {
    if (t === e) return !0;
    if (t && e && typeof t == "object" && typeof e == "object") {
      if (t.constructor !== e.constructor) return !1;
      var s, i, n;
      if (Array.isArray(t)) {
        if (s = t.length, s != e.length) return !1;
        for (i = s; i-- !== 0; )
          if (!r(t[i], e[i])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === e.source && t.flags === e.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === e.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === e.toString();
      if (n = Object.keys(t), s = n.length, s !== Object.keys(e).length) return !1;
      for (i = s; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(e, n[i])) return !1;
      for (i = s; i-- !== 0; ) {
        var o = n[i];
        if (!r(t[o], e[o])) return !1;
      }
      return !0;
    }
    return t !== t && e !== e;
  }), at;
}
var Be = qe();
const Ve = /* @__PURE__ */ jt(Be), Lt = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
class Ke extends HTMLElement {
  constructor() {
    super(), this.holdTime = 500, this.held = !1, this.cancelled = !1, this.isRepeating = !1, this.ripple = document.createElement("mwc-ripple");
  }
  connectedCallback() {
    Object.assign(this.style, {
      position: "fixed",
      width: Lt ? "100px" : "50px",
      height: Lt ? "100px" : "50px",
      transform: "translate(-50%, -50%) scale(0)",
      pointerEvents: "none",
      zIndex: "999",
      background: "var(--primary-color)",
      display: null,
      opacity: "0.2",
      borderRadius: "50%",
      transition: "transform 180ms ease-in-out"
    }), this.appendChild(this.ripple), this.ripple.primary = !0;
    for (const t of [
      "touchcancel",
      "mouseout",
      "mouseup",
      "touchmove",
      "mousewheel",
      "wheel",
      "scroll"
    ])
      document.addEventListener(
        t,
        () => {
          this.cancelled = !0, this.timer && (this._stopAnimation(), clearTimeout(this.timer), this.timer = void 0, this.isRepeating && this.repeatTimeout && (clearInterval(this.repeatTimeout), this.isRepeating = !1));
        },
        { passive: !0 }
      );
  }
  bind(t, e = {}) {
    t.actionHandler && Ve(e, t.actionHandler.options) || (t.actionHandler ? (t.actionHandler.start && (t.removeEventListener("touchstart", t.actionHandler.start), t.removeEventListener("mousedown", t.actionHandler.start)), t.actionHandler.end && (t.removeEventListener("touchend", t.actionHandler.end), t.removeEventListener("touchcancel", t.actionHandler.end), t.removeEventListener("click", t.actionHandler.end)), t.actionHandler.handleKeyDown && t.removeEventListener(
      "keydown",
      t.actionHandler.handleKeyDown
    )) : t.addEventListener("contextmenu", (s) => {
      const i = s || window.event;
      return i.preventDefault && i.preventDefault(), i.stopPropagation && i.stopPropagation(), i.cancelBubble = !0, i.returnValue = !1, !1;
    }), t.actionHandler = { options: e }, !e.disabled && (t.actionHandler.start = (s) => {
      e.stopPropagation && s.stopPropagation(), this.cancelled = !1;
      let i, n;
      s.touches ? (i = s.touches[0].clientX, n = s.touches[0].clientY) : (i = s.clientX, n = s.clientY), e.hasHold && (this.held = !1, this.timer = window.setTimeout(() => {
        this._startAnimation(i, n), this.held = !0, e.repeat && !this.isRepeating && (this.isRepeating = !0, this.repeatTimeout = setInterval(() => {
          $(t, "action", { action: "hold" });
        }, e.repeat));
      }, this.holdTime));
    }, t.actionHandler.end = (s) => {
      if (e.stopPropagation && s.stopPropagation(), s.type === "touchcancel" || s.type === "touchend" && this.cancelled) {
        this.isRepeating && this.repeatTimeout && (clearInterval(this.repeatTimeout), this.isRepeating = !1);
        return;
      }
      const i = s.target;
      s.cancelable && s.preventDefault(), e.hasHold && (clearTimeout(this.timer), this.isRepeating && this.repeatTimeout && clearInterval(this.repeatTimeout), this.isRepeating = !1, this._stopAnimation(), this.timer = void 0), e.hasHold && this.held ? e.repeat || $(i, "action", { action: "hold" }) : e.hasDoubleClick ? s.type === "click" && s.detail < 2 || !this.dblClickTimeout ? this.dblClickTimeout = window.setTimeout(() => {
        this.dblClickTimeout = void 0, $(i, "action", { action: "tap" });
      }, 250) : (clearTimeout(this.dblClickTimeout), this.dblClickTimeout = void 0, $(i, "action", { action: "double_tap" })) : $(i, "action", { action: "tap" });
    }, t.actionHandler.handleKeyDown = (s) => {
      var i, n;
      ["Enter", " "].includes(s.key) && ((n = (i = s.currentTarget.actionHandler) == null ? void 0 : i.end) == null || n.call(i, s));
    }, t.addEventListener("touchstart", t.actionHandler.start, {
      passive: !0
    }), t.addEventListener("touchend", t.actionHandler.end), t.addEventListener("touchcancel", t.actionHandler.end), t.addEventListener("mousedown", t.actionHandler.start, {
      passive: !0
    }), t.addEventListener("click", t.actionHandler.end), t.addEventListener("keydown", t.actionHandler.handleKeyDown)));
  }
  _startAnimation(t, e) {
    Object.assign(this.style, {
      left: `${t}px`,
      top: `${e}px`,
      transform: "translate(-50%, -50%) scale(1)"
    }), this.ripple.disabled = !1, this.ripple.startPress(), this.ripple.unbounded = !0;
  }
  _stopAnimation() {
    this.ripple.endPress(), this.ripple.disabled = !0, Object.assign(this.style, {
      left: null,
      top: null,
      transform: "translate(-50%, -50%) scale(0)"
    });
  }
}
customElements.define("paper-buttons-row-action-handler", Ke);
const We = () => {
  const r = document.body;
  if (r.querySelector("paper-buttons-row-action-handler"))
    return r.querySelector(
      "paper-buttons-row-action-handler"
    );
  const t = document.createElement(
    "paper-buttons-row-action-handler"
  );
  return r.appendChild(t), t;
}, Fe = (r, t) => {
  const e = We();
  e && e.bind(r, t);
}, Ze = Jt(
  class extends Yt {
    update(r, [t]) {
      return Fe(r.element, t), S;
    }
    render(r) {
    }
  }
), Je = /* @__PURE__ */ new Set([
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
]), Ye = /* @__PURE__ */ new Set(["open", "unlocked", "on"]), lt = "on", Ge = "off", Xe = "unavailable", Qe = ["name", "icon", "image", "state"], Xt = (r) => {
  var t;
  return (t = r == null ? void 0 : r.attributes) != null && t.friendly_name ? r.attributes.friendly_name : r != null && r.entity_id ? de(r.entity_id).replace(/_/g, " ") : "Unknown";
};
function It(r, t, e, s) {
  if (!e || !e.action || e.action === "none")
    return "";
  let i = `${s ? r.localize("ui.panel.lovelace.cards.picture-elements.hold") : r.localize("ui.panel.lovelace.cards.picture-elements.tap")} `;
  switch (e.action) {
    case "navigate":
      i += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.navigate_to",
        "location",
        e.navigation_path
      )}`;
      break;
    case "url":
      i += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.url",
        "url_path",
        e.url_path
      )}`;
      break;
    case "toggle":
      i += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.toggle",
        "name",
        t
      )}`;
      break;
    case "call-service":
      i += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.call_service",
        "name",
        e.service
      )}`;
      break;
    case "more-info":
      i += `${r.localize(
        "ui.panel.lovelace.cards.picture-elements.more_info",
        "name",
        t
      )}`;
      break;
  }
  return i;
}
const tr = (r, t) => {
  if (!t || r.tooltip === !1)
    return "";
  if (r.tooltip)
    return r.tooltip;
  let e = "", s = "";
  if (r.entity && (e = r.entity in t.states ? Xt(t.states[r.entity]) : r.entity), !r.tap_action && !r.hold_action)
    return e;
  const i = r.tap_action ? It(t, e, r.tap_action, !1) : "", n = r.hold_action ? It(t, e, r.hold_action, !0) : "";
  return s = i + (i && n ? `
` : "") + n, s;
}, Qt = () => {
  var s, i, n, o, c, a;
  const r = (n = (i = (s = document.querySelector("home-assistant")) == null ? void 0 : s.shadowRoot) == null ? void 0 : i.querySelector("home-assistant-main")) == null ? void 0 : n.shadowRoot, t = (r == null ? void 0 : r.querySelector("ha-drawer partial-panel-resolver")) || (r == null ? void 0 : r.querySelector("app-drawer-layout partial-panel-resolver")), e = (a = (c = (o = (t == null ? void 0 : t.shadowRoot) || t) == null ? void 0 : o.querySelector("ha-panel-lovelace")) == null ? void 0 : c.shadowRoot) == null ? void 0 : a.querySelector("hui-root");
  if (e) {
    const l = e.lovelace;
    return l.current_view = e.___curView, l;
  }
  return null;
};
let I = Qt();
function er(r, t) {
  var i, n;
  I || (I = Qt());
  const e = ((n = (i = I == null ? void 0 : I.config) == null ? void 0 : i.paper_buttons_row) == null ? void 0 : n.presets) || {}, s = r.preset || (t == null ? void 0 : t.preset);
  return s ? ut(
    {
      mushroom: rr
    }[s] || e[s] || {},
    r
  ) : r;
}
const rr = {
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
}, sr = ".flex-box{display:flex;justify-content:space-evenly;align-items:center}.flex-column{display:inline-flex;flex-direction:column;align-items:center}.hidden{display:none}paper-button{--pbs-button-rgb-fallback: 68, 115, 158;color:var( --pbs-button-color, rgb( var( --pbs-button-rgb-color, var( --pbs-button-rgb-state-color, var( --pbs-button-rgb-default-color, var(--rgb-state-default-color, var(--pbs-button-rgb-fallback)) ) ) ) ) );background-color:var( --pbs-button-bg-color, rgba(var(--pbs-button-rgb-bg-color), var(--pbs-button-rgb-bg-opacity, 1)) );padding:6px;cursor:pointer;position:relative;display:inline-flex;align-items:center;justify-content:center;user-select:none}span{padding:2px;text-align:center}ha-icon{padding:2px}.button-active{color:var( --paper-item-icon-active-color, var( --pbs-button-active-color, rgb( var( --pbs-button-rgb-active-color, var( --pbs-button-rgb-state-color, var( --pbs-button-rgb-default-color, var(--rgb-state-default-color, var(--pbs-button-rgb-fallback)) ) ) ) ) ) );background-color:var( --pbs-button-bg-active-color, rgba( var(--pbs-button-rgb-bg-active-color, var(--pbs-button-rgb-bg-color)), var( --pbs-button-rgb-bg-active-opacity, var(--pbs-button-rgb-bg-opacity, 1) ) ) )}.button-unavailable{color:var( --pbs-button-unavailable-color, rgb(var(--pbs-button-rgb-unavailable-color, var(--rgb-disabled-color))) )}.image{position:relative;display:inline-block;width:28px;border-radius:50%;height:28px;text-align:center;background-size:cover;line-height:28px;vertical-align:middle;box-sizing:border-box}@keyframes blink{0%{opacity:0}50%{opacity:1}to{opacity:0}}@-webkit-keyframes rotating{0%{-webkit-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0)}to{-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes rotating{0%{-ms-transform:rotate(0deg);-moz-transform:rotate(0deg);-webkit-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0)}to{-ms-transform:rotate(360deg);-moz-transform:rotate(360deg);-webkit-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}[rotating]{-webkit-animation:rotating 2s linear infinite;-moz-animation:rotating 2s linear infinite;-ms-animation:rotating 2s linear infinite;-o-animation:rotating 2s linear infinite;animation:rotating 2s linear infinite}", U = "lovelace-player-device-id";
function te() {
  if (!localStorage[U]) {
    const r = () => Math.floor((1 + Math.random()) * 1e5).toString(16).substring(1);
    window.fully && typeof fully.getDeviceId == "function" ? localStorage[U] = fully.getDeviceId() : localStorage[U] = `${r()}${r()}-${r()}${r()}`;
  }
  return localStorage[U];
}
let ee = te();
const ir = (r) => {
  r !== null && (r === "clear" ? localStorage.removeItem(U) : localStorage[U] = r, ee = te());
}, Dt = new URLSearchParams(window.location.search);
Dt.get("deviceID") && ir(Dt.get("deviceID"));
function nr(r) {
  if (String(r).includes("{%") || String(r).includes("{{"))
    return !0;
}
function or(r, t, e, s = !0) {
  r || (r = V().connection);
  let i = x({
    user: V().user.name,
    browser: ee,
    hash: location.hash.substr(1) || " "
  }, e.variables), n = e.template, o = e.entity_ids;
  return r.subscribeMessage(
    (c) => {
      if (s) {
        let a = String(c.result);
        const l = /_\([^)]*\)/g;
        a = a.replace(l, (h) => V().localize(h.substring(2, h.length - 1)) || h), t(a);
      } else
        t(c.result);
    },
    {
      type: "render_template",
      template: n,
      variables: i,
      entity_ids: o
    }
  );
}
function ar(r, t) {
  for (const e of r)
    e.callback(lr(e.template, t));
}
function lr(r, t) {
  let e = t.states[r.entity];
  if (!e) return;
  r.attribute ? e = e.attributes[r.attribute] : e = e.state;
  let s = (r.prefix || "") + e + (r.postfix || "");
  return r.case && (s = cr(s, r.case)), s;
}
function cr(r, t) {
  switch (t) {
    case "upper":
      return r.toUpperCase();
    case "lower":
      return r.toLowerCase();
    case "first":
      return r[0].toUpperCase() + r.slice(1);
  }
}
function Ct(r, t, e) {
  var i, n;
  const s = t[e];
  typeof s == "object" ? (s.entity || (s.entity = r.entity), s.entity !== r.entity && ((i = this._entities) == null || i.push(s.entity)), (n = this._templates) == null || n.push({
    template: s,
    callback: (o) => {
      o && (t[e] = o);
    }
  })) : nr(s) && (or(
    null,
    (o) => {
      t[e] = o, this.requestUpdate();
    },
    {
      template: s,
      variables: { config: r }
    }
  ), t[e] = "");
}
function ur(r, t) {
  customElements.whenDefined(r).then(() => {
    const e = customElements.get(r), s = e.prototype.firstUpdated;
    e.prototype.firstUpdated = function(i) {
      s.call(this, i), t.call(this, i);
    }, $(window, "ll-rebuild", {});
  });
}
ur("hui-generic-entity-row", function() {
  var r;
  if ((r = this.config) != null && r.extend_paper_buttons_row && this.shadowRoot) {
    const t = this.config.extend_paper_buttons_row, e = ve(
      Y(x({
        type: "custom:paper-buttons-row"
      }, t), {
        is_extended_row: !0
      })
    );
    ue(e);
    let s = this.shadowRoot.querySelector("slot");
    if (!s) return;
    if (s.parentElement && (s.parentElement.parentElement ? s.parentElement.classList.contains("state") && s.parentElement.parentElement.classList.contains("text-content") ? s = s.parentElement.parentElement : console.error("unexpected parent node found") : s.parentElement.classList.contains("text-content") ? s = s.parentElement : console.error("unexpected parent node found")), t.hide_state && (s.style.display = "none"), t.hide_badge) {
      const i = this.shadowRoot.querySelector("state-badge");
      i && (i.style.visibility = "hidden", i.style.marginLeft = "-48px");
    }
    t.position === "right" ? dr(e, s) : re(e, s);
  }
});
function re(r, t) {
  var e;
  (e = t.parentNode) == null || e.insertBefore(r, t);
}
function dr(r, t) {
  var e;
  t.nextElementSibling ? re(r, t.nextElementSibling) : (e = t.parentNode) == null || e.appendChild(r);
}
var hr = Object.defineProperty, pr = Object.getOwnPropertyDescriptor, vt = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? pr(t, e) : t, n = r.length - 1, o; n >= 0; n--)
    (o = r[n]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && hr(t, e, i), i;
};
console.groupCollapsed(
  "%c PAPER-BUTTONS-ROW %c 2.3.1 ",
  "color: white; background: #039be5; font-weight: 700;",
  "color: #039be5; background: white; font-weight: 700;"
);
console.info("branch   : main");
console.info("commit   : 09d134f9bfdaaad7a3868544fcb2b84aefcb8706");
console.info("built at : 2025-08-04T10:53:03.868Z");
console.info("https://github.com/jcwillox/lovelace-paper-buttons-row");
console.groupEnd();
const fr = (r) => {
  if (r.state_icons && typeof r.state == "string")
    return r.state_icons[r.state.toLowerCase()];
}, vr = (r) => r.state_text && typeof r.state == "string" && r.state_text[r.state.toLowerCase()] || r.state, mr = (r) => {
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
let q = class extends D {
  constructor() {
    super(...arguments), this._getStateColor = (r, t) => {
      const e = getComputedStyle(this);
      if (r.attributes.device_class) {
        const i = e.getPropertyValue(
          `--state-${t}-${r.attributes.device_class}-${r.state}-color`
        );
        if (i)
          return this._hexToRgb(i);
      }
      let s = e.getPropertyValue(
        `--state-${t}-${r.state}-color`
      );
      if (s) return this._hexToRgb(s);
      if (r.state === lt || r.state === Ge) {
        const i = r.state === lt ? "active" : "inactive";
        if (s = e.getPropertyValue(`--state-${t}-${i}-color`), s) return this._hexToRgb(s);
        if (r.state === lt && (s = e.getPropertyValue("--state-active-color"), s))
          return this._hexToRgb(s);
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
    if (r = JSON.parse(JSON.stringify(r)), r.buttons.every((t) => !Array.isArray(t)))
      r.buttons = [r.buttons];
    else if (!r.buttons.every((t) => Array.isArray(t)))
      throw new Error("Cannot mix rows and buttons");
    if (r.styles === void 0)
      r.styles = {};
    else
      for (const t in r.styles)
        r.styles[t] = ot(r.styles[t]);
    return r.buttons = r.buttons.map(
      (t) => t.map((e) => {
        if (typeof e == "string" && (e = { entity: e }), e = ut(r.base_config || {}, e), typeof e.layout == "string" && (e.layout = e.layout.split("|").map(
          (s) => s.includes("_") ? s.split("_") : s
        )), typeof e.active == "string" && (e.active = [e.active]), e.styles === void 0 && (e.styles = e.style), e.styles === void 0)
          e.styles = {};
        else
          for (const s in e.styles)
            e.styles[s] = ot(e.styles[s]);
        if (e.state_styles)
          for (const s in e.state_styles)
            for (const i in e.state_styles[s])
              e.state_styles[s][i] = ot(
                e.state_styles[s][i]
              );
        return e = this._defaultConfig(r, e), e;
      })
    ), r;
  }
  setConfig(r) {
    this._config = this._transformConfig(r), this.hass || (this.hass = V()), this._entities = [], this._templates = [], this._config.buttons = this._config.buttons.map((t) => t.map((e) => {
      var s;
      e = er(e, this._config), e.entity && ((s = this._entities) == null || s.push(e.entity));
      for (const i of Qe)
        Ct.call(this, e, e, i);
      for (const i of Object.values(e.styles))
        if (typeof i == "object")
          for (const n of Object.keys(i))
            Ct.call(this, e, i, n);
      return e;
    }));
  }
  render() {
    return !this._config || !this.hass ? w`` : (ar(this._templates, this.hass), w`
      ${this._config.extra_styles ? w`
            <style>
              ${this._config.extra_styles}
            </style>
          ` : ""}
      ${this._config.buttons.map((r) => {
      var t;
      return w`
          <div
            class="flex-box"
            style="${P((t = this._config) == null ? void 0 : t.styles)}"
          >
            ${r.map((e) => {
        var a, l, h, p;
        const s = e.entity !== void 0 && ((a = this.hass) == null ? void 0 : a.states[e.entity]) || void 0, i = e.entity && ct(e.entity), n = this._getStyles(e), o = x(x(x({}, this._getBaseStyles()), this._getStateStyles(i, s)), n.button || {}), c = e.active ? new Set(e.active) : Ye;
        return w`
                <paper-button
                  @action="${(v) => this._handleAction(v, e)}"
                  .actionHandler="${Ze({
          hasHold: Mt(e.hold_action),
          hasDoubleClick: Mt(e.double_tap_action),
          repeat: (l = e.hold_action) == null ? void 0 : l.repeat,
          stopPropagation: !!((h = this._config) != null && h.is_extended_row)
        })}"
                  style="${P(o)}"
                  class="${this._getClass(
          c,
          e.state,
          s == null ? void 0 : s.state
        )}"
                  title="${tr(e, this.hass)}"
                  data-domain="${nt(i)}"
                  data-entity-state="${nt(s == null ? void 0 : s.state)}"
                  data-state="${nt(
          typeof e.state == "string" && e.state.toLowerCase()
        )}"
                >
                  ${(p = e.layout) == null ? void 0 : p.map((v) => Array.isArray(v) ? w`
                        <div class="flex-column">
                          ${v.map(
          (_) => this.renderElement(_, e, n, s)
        )}
                        </div>
                      ` : this.renderElement(v, e, n, s))}

                  <paper-ripple
                    center
                    style="${P(n.ripple || {})}"
                    class="${this._getRippleClass(e)}"
                  ></paper-ripple>
                </paper-button>
              `;
      })}
          </div>
        `;
    })}
    `);
  }
  renderElement(r, t, e, s) {
    const i = (e == null ? void 0 : e[r]) || {};
    switch (r) {
      case "icon":
        return this.renderIcon(t, i, s);
      case "name":
        return this.renderName(t, i, s);
      case "state":
        return this.renderState(t, i);
    }
  }
  renderIcon(r, t, e) {
    const s = r.icon !== !1 && (r.icon || r.entity) ? fr(r) || r.icon : !1;
    return r.image ? w`<img
          src="${r.image}"
          class="image"
          style="${P(t)}"
          alt="icon"
        />` : s || e ? w`
          <ha-state-icon
          style="${P(t)}"
          .hass=${this.hass}
          .stateObj=${e}
          .state=${e}
          .icon="${s}"
        />` : "";
  }
  renderName(r, t, e) {
    return r.name !== !1 && (r.name || r.entity) ? w`
        <span style="${P(t)}">
            ${r.name || Xt(e)}
          </span>
      ` : "";
  }
  renderState(r, t) {
    return r.state !== !1 ? w`
        <span style="${P(t)}"> ${vr(r)} </span>
      ` : "";
  }
  _handleAction(r, t) {
    var e;
    this.hass && t && r.detail.action && ((e = this._config) != null && e.is_extended_row && r.stopPropagation(), je(this, this.hass, t, r.detail.action));
  }
  _getClass(r, t, e) {
    return typeof t == "string" && r.has(t.toLowerCase()) ? "button-active" : Xe === e ? "button-unavailable" : "";
  }
  _getBaseStyles() {
    var t;
    const r = getComputedStyle(this).getPropertyValue("--state-icon-color");
    return {
      "--rgb-state-default-color": (t = this._hexToRgb(r)) == null ? void 0 : t.join(", ")
    };
  }
  _getStateStyles(r, t) {
    if (!r || !t) return {};
    if (t.attributes.rgb_color)
      return {
        "--pbs-button-rgb-state-color": t.attributes.rgb_color
      };
    const e = this._getStateColor(t, r);
    return e ? {
      "--pbs-button-rgb-state-color": e.join(", ")
    } : {};
  }
  _hexToRgb(r) {
    var t;
    return (t = r.match(/[A-Za-z0-9]{2}/g)) == null ? void 0 : t.map((e) => Number.parseInt(e, 16));
  }
  _getRippleClass(r) {
    var t, e;
    switch (r.ripple) {
      case "none":
        return "hidden";
      case "circle":
        return "circle";
      case "fill":
        return "";
    }
    return ((t = r.layout) == null ? void 0 : t.length) === 1 && r.layout[0] === "icon" ? "circle" : r.name || r.name !== !1 && r.entity || (e = r.layout) != null && e.includes("state") ? "" : "circle";
  }
  _getStyles(r) {
    if (typeof r.state != "string" || !r.state_styles)
      return r.styles;
    const t = r.state_styles[r.state.toLowerCase()];
    return t ? ut(r.styles, t) : r.styles;
  }
  _defaultConfig(r, t) {
    if (!t.layout) {
      const e = t.align_icon || r.align_icons;
      e ? t.layout = mr(e) : t.layout = ["icon", "name"];
    }
    if (!t.state && t.entity && (t.state = { case: "upper" }), t.entity) {
      const e = ct(t.entity);
      t.hold_action || (t.hold_action = { action: "more-info" }), t.tap_action || (Je.has(e) ? t.tap_action = { action: "toggle" } : e === "scene" ? t.tap_action = {
        action: "call-service",
        service: "scene.turn_on",
        service_data: {
          entity_id: t.entity
        }
      } : t.tap_action = { action: "more-info" });
    }
    return t;
  }
  shouldUpdate(r) {
    if (r.has("_config"))
      return !0;
    if (this._entities) {
      const t = r.get("hass");
      return t ? this._entities.some(
        (e) => {
          var s;
          return t.states[e] !== ((s = this.hass) == null ? void 0 : s.states[e]);
        }
      ) : !0;
    }
    return !1;
  }
};
q.styles = qt(sr);
vt([
  Zt()
], q.prototype, "hass", 2);
vt([
  Zt()
], q.prototype, "_config", 2);
q = vt([
  Ne("paper-buttons-row")
], q);
export {
  q as PaperButtonsRow
};
