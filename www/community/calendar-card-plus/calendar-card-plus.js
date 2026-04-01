var tt = Object.defineProperty;
var at = (n, e, t) => e in n ? tt(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var E = (n, e, t) => at(n, typeof e != "symbol" ? e + "" : e, t);
var it = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
async function nt(n, e, t, a) {
  const i = encodeURI(`?start=${e.toISOString()}&end=${t.toISOString()}`), s = a.map(async (l) => {
    try {
      const d = await n.callApi("GET", `calendars/${l}${i}`);
      if (!Array.isArray(d))
        throw new Error("Response is not an array");
      return d.map((_) => {
        var f, p, b, k, c, g;
        const u = ((f = _.start) == null ? void 0 : f.dateTime) || ((p = _.start) == null ? void 0 : p.date) || _.start, h = ((b = _.end) == null ? void 0 : b.dateTime) || ((k = _.end) == null ? void 0 : k.date) || _.end;
        return {
          ..._,
          start: { dateTime: u.includes("T") ? u : void 0, date: u.includes("T") ? void 0 : u },
          end: { dateTime: h.includes("T") ? h : void 0, date: h.includes("T") ? void 0 : h },
          summary: _.summary || _.title || "Unknown Event",
          entity_id: l,
          calendar_name: ((g = (c = n.states[l]) == null ? void 0 : c.attributes) == null ? void 0 : g.friendly_name) || l
        };
      });
    } catch {
      const r = n.states[l];
      return r && r.attributes.start_time && r.attributes.end_time ? [{
        start: { dateTime: r.attributes.start_time.replace(" ", "T") },
        end: { dateTime: r.attributes.end_time.replace(" ", "T") },
        summary: r.attributes.message || r.attributes.friendly_name,
        location: r.attributes.location,
        description: r.attributes.description,
        entity_id: l,
        calendar_name: r.attributes.friendly_name || l
      }] : [];
    }
  });
  return (await Promise.all(s)).flat();
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _e = globalThis, Ce = _e.ShadowRoot && (_e.ShadyCSS === void 0 || _e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ae = Symbol(), Me = /* @__PURE__ */ new WeakMap();
let qe = class {
  constructor(e, t, a) {
    if (this._$cssResult$ = !0, a !== Ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Ce && e === void 0) {
      const a = t !== void 0 && t.length === 1;
      a && (e = Me.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), a && Me.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const st = (n) => new qe(typeof n == "string" ? n : n + "", void 0, Ae), Ee = (n, ...e) => {
  const t = n.length === 1 ? n[0] : e.reduce((a, i, s) => a + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[s + 1], n[0]);
  return new qe(t, n, Ae);
}, ot = (n, e) => {
  if (Ce) n.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const a = document.createElement("style"), i = _e.litNonce;
    i !== void 0 && a.setAttribute("nonce", i), a.textContent = t.cssText, n.appendChild(a);
  }
}, Le = Ce ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const a of e.cssRules) t += a.cssText;
  return st(t);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: rt, defineProperty: dt, getOwnPropertyDescriptor: lt, getOwnPropertyNames: ct, getOwnPropertySymbols: _t, getPrototypeOf: ht } = Object, U = globalThis, je = U.trustedTypes, ut = je ? je.emptyScript : "", fe = U.reactiveElementPolyfillSupport, te = (n, e) => n, he = { toAttribute(n, e) {
  switch (e) {
    case Boolean:
      n = n ? ut : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, e) {
  let t = n;
  switch (e) {
    case Boolean:
      t = n !== null;
      break;
    case Number:
      t = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(n);
      } catch {
        t = null;
      }
  }
  return t;
} }, ze = (n, e) => !rt(n, e), Oe = { attribute: !0, type: String, converter: he, reflect: !1, useDefault: !1, hasChanged: ze };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), U.litPropertyMetadata ?? (U.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let F = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Oe) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const a = Symbol(), i = this.getPropertyDescriptor(e, a, t);
      i !== void 0 && dt(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, a) {
    const { get: i, set: s } = lt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: i, set(o) {
      const l = i == null ? void 0 : i.call(this);
      s == null || s.call(this, o), this.requestUpdate(e, l, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(te("elementProperties"))) return;
    const e = ht(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(te("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(te("properties"))) {
      const t = this.properties, a = [...ct(t), ..._t(t)];
      for (const i of a) this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [a, i] of t) this.elementProperties.set(a, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, a] of this.elementProperties) {
      const i = this._$Eu(t, a);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const a = new Set(e.flat(1 / 0).reverse());
      for (const i of a) t.unshift(Le(i));
    } else e !== void 0 && t.push(Le(e));
    return t;
  }
  static _$Eu(e, t) {
    const a = t.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const a of t.keys()) this.hasOwnProperty(a) && (e.set(a, this[a]), delete this[a]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ot(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var a;
      return (a = t.hostConnected) == null ? void 0 : a.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var a;
      return (a = t.hostDisconnected) == null ? void 0 : a.call(t);
    });
  }
  attributeChangedCallback(e, t, a) {
    this._$AK(e, a);
  }
  _$ET(e, t) {
    var s;
    const a = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, a);
    if (i !== void 0 && a.reflect === !0) {
      const o = (((s = a.converter) == null ? void 0 : s.toAttribute) !== void 0 ? a.converter : he).toAttribute(t, a.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var s, o;
    const a = this.constructor, i = a._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const l = a.getPropertyOptions(i), d = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((s = l.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? l.converter : he;
      this._$Em = i;
      const r = d.fromAttribute(t, l.type);
      this[i] = r ?? ((o = this._$Ej) == null ? void 0 : o.get(i)) ?? r, this._$Em = null;
    }
  }
  requestUpdate(e, t, a, i = !1, s) {
    var o;
    if (e !== void 0) {
      const l = this.constructor;
      if (i === !1 && (s = this[e]), a ?? (a = l.getPropertyOptions(e)), !((a.hasChanged ?? ze)(s, t) || a.useDefault && a.reflect && s === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(l._$Eu(e, a)))) return;
      this.C(e, t, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: a, reflect: i, wrapped: s }, o) {
    a && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), s !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || a || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var a;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [s, o] of this._$Ep) this[s] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, o] of i) {
        const { wrapped: l } = o, d = this[s];
        l !== !0 || this._$AL.has(s) || d === void 0 || this.C(s, void 0, o, d);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (a = this._$EO) == null || a.forEach((i) => {
        var s;
        return (s = i.hostUpdate) == null ? void 0 : s.call(i);
      }), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((a) => {
      var i;
      return (i = a.hostUpdated) == null ? void 0 : i.call(a);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
F.elementStyles = [], F.shadowRootOptions = { mode: "open" }, F[te("elementProperties")] = /* @__PURE__ */ new Map(), F[te("finalized")] = /* @__PURE__ */ new Map(), fe == null || fe({ ReactiveElement: F }), (U.reactiveElementVersions ?? (U.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ae = globalThis, Be = (n) => n, ue = ae.trustedTypes, Ne = ue ? ue.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, Fe = "$lit$", H = `lit$${Math.random().toFixed(9).slice(2)}$`, Ye = "?" + H, mt = `<${Ye}>`, Z = document, se = () => Z.createComment(""), oe = (n) => n === null || typeof n != "object" && typeof n != "function", Se = Array.isArray, vt = (n) => Se(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", ye = `[ 	
\f\r]`, ee = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, He = /-->/g, Ue = />/g, I = RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Re = /'/g, Ie = /"/g, Ge = /^(?:script|style|textarea|title)$/i, pt = (n) => (e, ...t) => ({ _$litType$: n, strings: e, values: t }), m = pt(1), Y = Symbol.for("lit-noChange"), T = Symbol.for("lit-nothing"), Ve = /* @__PURE__ */ new WeakMap(), V = Z.createTreeWalker(Z, 129);
function Qe(n, e) {
  if (!Se(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ne !== void 0 ? Ne.createHTML(e) : e;
}
const gt = (n, e) => {
  const t = n.length - 1, a = [];
  let i, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ee;
  for (let l = 0; l < t; l++) {
    const d = n[l];
    let r, _, u = -1, h = 0;
    for (; h < d.length && (o.lastIndex = h, _ = o.exec(d), _ !== null); ) h = o.lastIndex, o === ee ? _[1] === "!--" ? o = He : _[1] !== void 0 ? o = Ue : _[2] !== void 0 ? (Ge.test(_[2]) && (i = RegExp("</" + _[2], "g")), o = I) : _[3] !== void 0 && (o = I) : o === I ? _[0] === ">" ? (o = i ?? ee, u = -1) : _[1] === void 0 ? u = -2 : (u = o.lastIndex - _[2].length, r = _[1], o = _[3] === void 0 ? I : _[3] === '"' ? Ie : Re) : o === Ie || o === Re ? o = I : o === He || o === Ue ? o = ee : (o = I, i = void 0);
    const f = o === I && n[l + 1].startsWith("/>") ? " " : "";
    s += o === ee ? d + mt : u >= 0 ? (a.push(r), d.slice(0, u) + Fe + d.slice(u) + H + f) : d + H + (u === -2 ? l : f);
  }
  return [Qe(n, s + (n[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), a];
};
class re {
  constructor({ strings: e, _$litType$: t }, a) {
    let i;
    this.parts = [];
    let s = 0, o = 0;
    const l = e.length - 1, d = this.parts, [r, _] = gt(e, t);
    if (this.el = re.createElement(r, a), V.currentNode = this.el.content, t === 2 || t === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = V.nextNode()) !== null && d.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(Fe)) {
          const h = _[o++], f = i.getAttribute(u).split(H), p = /([.?@])?(.*)/.exec(h);
          d.push({ type: 1, index: s, name: p[2], strings: f, ctor: p[1] === "." ? yt : p[1] === "?" ? wt : p[1] === "@" ? $t : me }), i.removeAttribute(u);
        } else u.startsWith(H) && (d.push({ type: 6, index: s }), i.removeAttribute(u));
        if (Ge.test(i.tagName)) {
          const u = i.textContent.split(H), h = u.length - 1;
          if (h > 0) {
            i.textContent = ue ? ue.emptyScript : "";
            for (let f = 0; f < h; f++) i.append(u[f], se()), V.nextNode(), d.push({ type: 2, index: ++s });
            i.append(u[h], se());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ye) d.push({ type: 2, index: s });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(H, u + 1)) !== -1; ) d.push({ type: 7, index: s }), u += H.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const a = Z.createElement("template");
    return a.innerHTML = e, a;
  }
}
function G(n, e, t = n, a) {
  var o, l;
  if (e === Y) return e;
  let i = a !== void 0 ? (o = t._$Co) == null ? void 0 : o[a] : t._$Cl;
  const s = oe(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== s && ((l = i == null ? void 0 : i._$AO) == null || l.call(i, !1), s === void 0 ? i = void 0 : (i = new s(n), i._$AT(n, t, a)), a !== void 0 ? (t._$Co ?? (t._$Co = []))[a] = i : t._$Cl = i), i !== void 0 && (e = G(n, i._$AS(n, e.values), i, a)), e;
}
class ft {
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
    const { el: { content: t }, parts: a } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? Z).importNode(t, !0);
    V.currentNode = i;
    let s = V.nextNode(), o = 0, l = 0, d = a[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let r;
        d.type === 2 ? r = new le(s, s.nextSibling, this, e) : d.type === 1 ? r = new d.ctor(s, d.name, d.strings, this, e) : d.type === 6 && (r = new xt(s, this, e)), this._$AV.push(r), d = a[++l];
      }
      o !== (d == null ? void 0 : d.index) && (s = V.nextNode(), o++);
    }
    return V.currentNode = Z, i;
  }
  p(e) {
    let t = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(e, a, t), t += a.strings.length - 2) : a._$AI(e[t])), t++;
  }
}
class le {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, a, i) {
    this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = a, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
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
    e = G(this, e, t), oe(e) ? e === T || e == null || e === "" ? (this._$AH !== T && this._$AR(), this._$AH = T) : e !== this._$AH && e !== Y && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : vt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== T && oe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Z.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: t, _$litType$: a } = e, i = typeof a == "number" ? this._$AC(e) : (a.el === void 0 && (a.el = re.createElement(Qe(a.h, a.h[0]), this.options)), a);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === i) this._$AH.p(t);
    else {
      const o = new ft(i, this), l = o.u(this.options);
      o.p(t), this.T(l), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = Ve.get(e.strings);
    return t === void 0 && Ve.set(e.strings, t = new re(e)), t;
  }
  k(e) {
    Se(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let a, i = 0;
    for (const s of e) i === t.length ? t.push(a = new le(this.O(se()), this.O(se()), this, this.options)) : a = t[i], a._$AI(s), i++;
    i < t.length && (this._$AR(a && a._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var a;
    for ((a = this._$AP) == null ? void 0 : a.call(this, !1, !0, t); e !== this._$AB; ) {
      const i = Be(e).nextSibling;
      Be(e).remove(), e = i;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class me {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, a, i, s) {
    this.type = 1, this._$AH = T, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = s, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = T;
  }
  _$AI(e, t = this, a, i) {
    const s = this.strings;
    let o = !1;
    if (s === void 0) e = G(this, e, t, 0), o = !oe(e) || e !== this._$AH && e !== Y, o && (this._$AH = e);
    else {
      const l = e;
      let d, r;
      for (e = s[0], d = 0; d < s.length - 1; d++) r = G(this, l[a + d], t, d), r === Y && (r = this._$AH[d]), o || (o = !oe(r) || r !== this._$AH[d]), r === T ? e = T : e !== T && (e += (r ?? "") + s[d + 1]), this._$AH[d] = r;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class yt extends me {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === T ? void 0 : e;
  }
}
class wt extends me {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== T);
  }
}
class $t extends me {
  constructor(e, t, a, i, s) {
    super(e, t, a, i, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = G(this, e, t, 0) ?? T) === Y) return;
    const a = this._$AH, i = e === T && a !== T || e.capture !== a.capture || e.once !== a.once || e.passive !== a.passive, s = e !== T && (a === T || i);
    i && this.element.removeEventListener(this.name, this, a), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class xt {
  constructor(e, t, a) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    G(this, e);
  }
}
const we = ae.litHtmlPolyfillSupport;
we == null || we(re, le), (ae.litHtmlVersions ?? (ae.litHtmlVersions = [])).push("3.3.2");
const bt = (n, e, t) => {
  const a = (t == null ? void 0 : t.renderBefore) ?? e;
  let i = a._$litPart$;
  if (i === void 0) {
    const s = (t == null ? void 0 : t.renderBefore) ?? null;
    a._$litPart$ = i = new le(e.insertBefore(se(), s), s, void 0, t ?? {});
  }
  return i._$AI(n), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis;
class W extends F {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = bt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return Y;
  }
}
var Ze;
W._$litElement$ = !0, W.finalized = !0, (Ze = K.litElementHydrateSupport) == null || Ze.call(K, { LitElement: W });
const $e = K.litElementPolyfillSupport;
$e == null || $e({ LitElement: W });
(K.litElementVersions ?? (K.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Te = (n) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(n, e);
  }) : customElements.define(n, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kt = { attribute: !0, type: String, converter: he, reflect: !1, hasChanged: ze }, Ct = (n = kt, e, t) => {
  const { kind: a, metadata: i } = t;
  let s = globalThis.litPropertyMetadata.get(i);
  if (s === void 0 && globalThis.litPropertyMetadata.set(i, s = /* @__PURE__ */ new Map()), a === "setter" && ((n = Object.create(n)).wrapped = !0), s.set(t.name, n), a === "accessor") {
    const { name: o } = t;
    return { set(l) {
      const d = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(o, d, n, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, n, l), l;
    } };
  }
  if (a === "setter") {
    const { name: o } = t;
    return function(l) {
      const d = this[o];
      e.call(this, l), this.requestUpdate(o, d, n, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + a);
};
function B(n) {
  return (e, t) => typeof t == "object" ? Ct(n, e, t) : ((a, i, s) => {
    const o = i.hasOwnProperty(s);
    return i.constructor.createProperty(s, a), o ? Object.getOwnPropertyDescriptor(i, s) : void 0;
  })(n, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ce(n) {
  return B({ ...n, state: !0, attribute: !1 });
}
const q = {
  en: {
    starts_in_min: "Starts in {x} minute",
    starts_in_mins: "Starts in {x} minutes",
    starts_in_hour: "Starts in {x} hour",
    starts_in_hours: "Starts in {x} hours",
    starts_in_day: "Starts in {x} day",
    starts_in_days: "Starts in {x} days",
    starts_in_week: "Starts in {x} week",
    starts_in_weeks: "Starts in {x} weeks",
    loading: "Loading events...",
    no_events: "No active events",
    more_events: "+{x} more",
    editor_show_upcoming: "Show upcoming events",
    editor_unfold_events: "Unfold Events",
    editor_show_divider: "Show Divider",
    editor_show_weekday: "Show Weekday",
    editor_show_weekday_long: "Use long weekday (e.g. Monday)",
    editor_show_add_event: "Show 'Add Event' Button",
    add_event_title: "Add Event",
    add_event_name: "Title",
    add_event_start: "Start",
    add_event_end: "End",
    add_event_all_day: "All Day",
    add_event_location: "Location",
    add_event_description: "Description",
    add_event_calendar: "Calendar",
    add_event_save: "Save",
    add_event_cancel: "Cancel",
    popup_upcoming_events: "Upcoming events",
    editor_show_more: "Show More",
    editor_show_less: "Show Less",
    editor_background_color: "Background Color",
    editor_show_location: "Show Location",
    editor_show_duration: "Show Duration",
    editor_show_time: "Show Time",
    duration_min: "min",
    duration_hour: "h",
    duration_day: "day",
    duration_days: "days",
    editor_max_lines: "Max. displayed events",
    group_by_date: "Group by Day"
  },
  de: {
    starts_in_min: "Beginnt in {x} Minute",
    starts_in_mins: "Beginnt in {x} Minuten",
    starts_in_hour: "Beginnt in {x} Stunde",
    starts_in_hours: "Beginnt in {x} Stunden",
    starts_in_day: "Beginnt in {x} Tag",
    starts_in_days: "Beginnt in {x} Tagen",
    starts_in_week: "Beginnt in {x} Woche",
    starts_in_weeks: "Beginnt in {x} Wochen",
    loading: "Lade Termine...",
    no_events: "Keine aktiven Termine",
    more_events: "+{x} weitere",
    editor_show_upcoming: "Zeige bevorstehende Ereignisse",
    editor_unfold_events: "Ereignisse ausklappen",
    editor_show_divider: "Zeige Trenner",
    editor_show_weekday: "Zeige Wochentag",
    editor_show_weekday_long: "Ausgeschrieben (z.B. Montag)",
    editor_show_add_event: "Zeige 'Neuer Termin' Button",
    add_event_title: "Neuer Termin",
    add_event_name: "Titel",
    add_event_start: "Start",
    add_event_end: "Ende",
    add_event_all_day: "Ganztägig",
    add_event_location: "Ort",
    add_event_description: "Beschreibung",
    add_event_calendar: "Kalender",
    add_event_save: "Speichern",
    add_event_cancel: "Abbrechen",
    popup_upcoming_events: "Bevorstehende Ereignisse",
    editor_show_more: "Mehr anzeigen",
    editor_show_less: "Weniger anzeigen",
    editor_background_color: "Hintergrundfarbe",
    editor_show_location: "Zeige Ort",
    editor_show_duration: "Zeige Dauer",
    editor_show_time: "Zeige Zeit",
    duration_min: "Minuten",
    duration_hour: "h",
    duration_day: "Tag",
    duration_days: "Tage",
    editor_max_lines: "Max. angezeigte Termine",
    group_by_date: "Nach Tag gruppieren"
  },
  fr: {
    starts_in_min: "Commence dans {x} minute",
    starts_in_mins: "Commence dans {x} minutes",
    starts_in_hour: "Commence dans {x} heure",
    starts_in_hours: "Commence dans {x} heures",
    starts_in_day: "Commence dans {x} jour",
    starts_in_days: "Commence dans {x} jours",
    starts_in_week: "Commence dans {x} semaine",
    starts_in_weeks: "Commence dans {x} semaines",
    loading: "Chargement...",
    no_events: "Aucun événement",
    more_events: "+{x} autres",
    editor_show_upcoming: "Afficher les événements à venir",
    editor_unfold_events: "Déplier les événements",
    editor_show_divider: "Afficher le séparateur",
    editor_show_weekday: "Afficher le jour de la semaine",
    editor_show_weekday_long: "Format long (ex. Lundi)",
    editor_show_add_event: "Bouton Nouveau",
    add_event_title: "Nouvel événement",
    add_event_name: "Titre",
    add_event_start: "Début",
    add_event_end: "Fin",
    add_event_all_day: "Toute la journée",
    add_event_location: "Lieu",
    add_event_description: "Description",
    add_event_calendar: "Calendrier",
    add_event_save: "Enregistrer",
    add_event_cancel: "Annuler",
    popup_upcoming_events: "Événements à venir",
    editor_show_more: "Afficher plus",
    editor_show_less: "Afficher moins",
    editor_background_color: "Couleur de fond",
    group_by_date: "Grouper par jour"
  },
  it: {
    starts_in_min: "Inizia tra {x} minuto",
    starts_in_mins: "Inizia tra {x} minuti",
    starts_in_hour: "Inizia tra {x} ora",
    starts_in_hours: "Inizia tra {x} ore",
    starts_in_day: "Inizia tra {x} giorno",
    starts_in_days: "Inizia tra {x} giorni",
    starts_in_week: "Inizia tra {x} settimana",
    starts_in_weeks: "Inizia tra {x} settimane",
    loading: "Caricamento...",
    no_events: "Nessun evento",
    more_events: "+{x} altri",
    editor_show_upcoming: "Mostra prossimi eventi",
    editor_unfold_events: "Espandi gli eventi",
    editor_show_divider: "Mostra divisore",
    editor_show_weekday: "Mostra giorno della settimana",
    editor_show_weekday_long: "Usa nome completo (es. Lunedì)",
    editor_show_add_event: "Mostra pulsante Aggiungi",
    add_event_title: "Aggiungi Evento",
    add_event_name: "Titolo",
    add_event_start: "Inizio",
    add_event_end: "Fine",
    add_event_all_day: "Tutto il giorno",
    add_event_location: "Luogo",
    add_event_description: "Descrizione",
    add_event_calendar: "Calendario",
    add_event_save: "Salva",
    add_event_cancel: "Annulla",
    popup_upcoming_events: "Prossimi eventi",
    editor_show_more: "Mostra di più",
    editor_show_less: "Mostra meno",
    editor_background_color: "Colore di sfondo",
    group_by_date: "Raggruppa per giorno"
  },
  es: {
    starts_in_min: "Empieza en {x} minuto",
    starts_in_mins: "Empieza en {x} minutos",
    starts_in_hour: "Empieza en {x} hora",
    starts_in_hours: "Empieza en {x} horas",
    starts_in_day: "Empieza en {x} día",
    starts_in_days: "Empieza en {x} días",
    starts_in_week: "Empieza en {x} semana",
    starts_in_weeks: "Empieza en {x} semanas",
    loading: "Cargando...",
    no_events: "No hay eventos",
    more_events: "+{x} más",
    editor_show_upcoming: "Mostrar próximos eventos",
    editor_unfold_events: "Desplegar eventos",
    editor_show_divider: "Mostrar divisor",
    editor_show_weekday: "Mostrar día de la semana",
    editor_show_weekday_long: "Formato largo (ej. Lunes)",
    editor_show_add_event: "Mostrar botón Añadir Evento",
    add_event_title: "Añadir Evento",
    add_event_name: "Título",
    add_event_start: "Inicio",
    add_event_end: "Fin",
    add_event_all_day: "Todo el día",
    add_event_location: "Ubicación",
    add_event_description: "Descripción",
    add_event_calendar: "Calendario",
    add_event_save: "Guardar",
    add_event_cancel: "Cancelar",
    popup_upcoming_events: "Próximos eventos",
    editor_show_more: "Mostrar más",
    editor_show_less: "Mostrar menos",
    editor_background_color: "Color de fondo",
    group_by_date: "Agrupar por día"
  },
  nl: {
    starts_in_min: "Begint over {x} minuut",
    starts_in_mins: "Begint over {x} minuten",
    starts_in_hour: "Begint over {x} uur",
    starts_in_hours: "Begint over {x} uur",
    starts_in_day: "Begint over {x} dag",
    starts_in_days: "Begint over {x} dagen",
    starts_in_week: "Begint over {x} week",
    starts_in_weeks: "Begint over {x} weken",
    loading: "Laden...",
    no_events: "Geen evenementen",
    more_events: "+{x} meer",
    editor_show_upcoming: "Toon aankomende evenementen",
    editor_unfold_events: "Evenementen uitvouwen",
    editor_show_divider: "Toon verdeler",
    editor_show_weekday: "Toon weekdag",
    editor_show_weekday_long: "Gebruik lange notatie (bijv. Maandag)",
    editor_show_add_event: "Toon Toevoegen knop",
    add_event_title: "Evenement toevoegen",
    add_event_name: "Titel",
    add_event_start: "Start",
    add_event_end: "Eind",
    add_event_all_day: "Hele dag",
    add_event_location: "Locatie",
    add_event_description: "Beschrijving",
    add_event_calendar: "Kalender",
    add_event_save: "Opslaan",
    add_event_cancel: "Annuleren",
    popup_upcoming_events: "Aankomende evenementen",
    editor_show_more: "Toon meer",
    editor_show_less: "Toon minder",
    editor_background_color: "Achtergrondkleur",
    group_by_date: "Groepeer per dag"
  },
  pt: {
    starts_in_min: "Começa em {x} minuto",
    starts_in_mins: "Começa em {x} minutos",
    starts_in_hour: "Começa em {x} hora",
    starts_in_hours: "Começa em {x} horas",
    starts_in_day: "Começa em {x} dia",
    starts_in_days: "Começa em {x} dias",
    starts_in_week: "Começa em {x} semana",
    starts_in_weeks: "Começa em {x} semanas",
    loading: "A carregar...",
    no_events: "Sem eventos",
    more_events: "+{x} mais",
    editor_show_upcoming: "Mostrar próximos eventos",
    editor_unfold_events: "Desdobrar eventos",
    editor_show_divider: "Mostrar divisor",
    editor_show_weekday: "Mostrar dia da semana",
    editor_show_weekday_long: "Formato longo (ex. Segunda-feira)",
    editor_show_add_event: "Mostrar botão Adicionar",
    add_event_title: "Adicionar evento",
    add_event_name: "Título",
    add_event_start: "Início",
    add_event_end: "Fim",
    add_event_all_day: "Dia inteiro",
    add_event_location: "Local",
    add_event_description: "Descrição",
    add_event_calendar: "Calendário",
    add_event_save: "Salvar",
    add_event_cancel: "Cancelar",
    popup_upcoming_events: "Próximos eventos",
    editor_show_more: "Mostrar mais",
    editor_show_less: "Mostrar menos",
    editor_background_color: "Cor de fundo",
    group_by_date: "Agrupar por dia"
  },
  ru: {
    starts_in_min: "Начнется через {x} минуту",
    starts_in_mins: "Начнется через {x} мин.",
    starts_in_hour: "Начнется через {x} час",
    starts_in_hours: "Начнется через {x} ч.",
    starts_in_day: "Начнется через {x} день",
    starts_in_days: "Начнется через {x} дн.",
    starts_in_week: "Начнется через {x} неделю",
    starts_in_weeks: "Начнется через {x} нед.",
    loading: "Загрузка...",
    no_events: "Нет событий",
    more_events: "ещё +{x}",
    editor_show_upcoming: "Показать предстоящие события",
    editor_unfold_events: "Развернуть события",
    editor_show_divider: "Показать разделитель",
    editor_show_weekday: "Показать день недели",
    editor_show_weekday_long: "Использовать полное название (напр. Понедельник)",
    editor_show_add_event: "Показать кнопку Добавить",
    add_event_title: "Добавить событие",
    add_event_name: "Название",
    add_event_start: "Начало",
    add_event_end: "Конец",
    add_event_all_day: "Весь день",
    add_event_location: "Место",
    add_event_description: "Описание",
    add_event_calendar: "Календарь",
    add_event_save: "Сохранить",
    add_event_cancel: "Отмена",
    popup_upcoming_events: "Предстоящие события",
    editor_show_more: "Показать больше",
    editor_show_less: "Показать меньше",
    editor_background_color: "Цвет фона",
    group_by_date: "Группировать по дням"
  },
  pl: {
    starts_in_min: "Rozpoczyna się za {x} minutę",
    starts_in_mins: "Rozpoczyna się za {x} min.",
    starts_in_hour: "Rozpoczyna się za {x} godzinę",
    starts_in_hours: "Rozpoczyna się za {x} godz.",
    starts_in_day: "Rozpoczyna się za {x} dzień",
    starts_in_days: "Rozpoczyna się za {x} dni",
    starts_in_week: "Rozpoczyna się za {x} tydzień",
    starts_in_weeks: "Rozpoczyna się za {x} tyg.",
    loading: "Ładowanie...",
    no_events: "Brak wydarzeń",
    more_events: "+{x} więcej",
    editor_show_upcoming: "Pokaż nadchodzące wydarzenia",
    editor_unfold_events: "Rozwiń wydarzenia",
    editor_show_divider: "Pokaż dzielnik",
    editor_show_weekday: "Pokaż dzień tygodnia",
    editor_show_weekday_long: "Użyj pełnej nazwy (np. Poniedziałek)",
    editor_show_add_event: "Pokaż przycisk Dodaj",
    add_event_title: "Dodaj wydarzenie",
    add_event_name: "Tytuł",
    add_event_start: "Początek",
    add_event_end: "Koniec",
    add_event_all_day: "Cały dzień",
    add_event_location: "Lokalizacja",
    add_event_description: "Opis",
    add_event_calendar: "Kalendarz",
    add_event_save: "Zapisz",
    add_event_cancel: "Anuluj",
    popup_upcoming_events: "Nadchodzące wydarzenia",
    editor_show_more: "Pokaż więcej",
    editor_show_less: "Pokaż mniej",
    editor_background_color: "Kolor tła",
    group_by_date: "Grupuj według dnia"
  },
  sv: {
    starts_in_min: "Börjar om {x} minut",
    starts_in_mins: "Börjar om {x} minuter",
    starts_in_hour: "Börjar om {x} timme",
    starts_in_hours: "Börjar om {x} timmar",
    starts_in_day: "Börjar om {x} dag",
    starts_in_days: "Börjar om {x} dagar",
    starts_in_week: "Börjar om {x} vecka",
    starts_in_weeks: "Börjar om {x} veckor",
    loading: "Laddar...",
    no_events: "Inga händelser",
    more_events: "+{x} till",
    editor_show_upcoming: "Visa kommande händelser",
    editor_unfold_events: "Fäll ut evenemang",
    editor_show_divider: "Visa avdelare",
    editor_show_weekday: "Visa veckodag",
    editor_show_weekday_long: "Använd långt format (t.ex. Måndag)",
    editor_show_add_event: "Visa Lägg till-knapp",
    add_event_title: "Lägg till händelse",
    add_event_name: "Titel",
    add_event_start: "Start",
    add_event_end: "Slut",
    add_event_all_day: "Heldag",
    add_event_location: "Plats",
    add_event_description: "Beskrivning",
    add_event_calendar: "Kalender",
    add_event_save: "Spara",
    add_event_cancel: "Avbryt",
    popup_upcoming_events: "Kommande händelser",
    editor_show_more: "Visa mer",
    editor_show_less: "Visa mindre",
    editor_background_color: "Bakgrundsfärg",
    group_by_date: "Gruppera per dag"
  },
  da: {
    starts_in_min: "Starter om {x} minut",
    starts_in_mins: "Starter om {x} minutter",
    starts_in_hour: "Starter om {x} time",
    starts_in_hours: "Starter om {x} timer",
    starts_in_day: "Starter om {x} dag",
    starts_in_days: "Starter om {x} dage",
    starts_in_week: "Starter om {x} uge",
    starts_in_weeks: "Starter om {x} uger",
    loading: "Indlæser...",
    no_events: "Ingen begivenheder",
    more_events: "+{x} mere",
    editor_show_upcoming: "Vis kommende begivenheder",
    editor_unfold_events: "Udfold begivenheder",
    editor_show_divider: "Vis skillelinje",
    editor_show_weekday: "Vis ugedag",
    editor_show_weekday_long: "Brug langt format (f.eks. Mandag)",
    editor_show_add_event: "Vis Tilføj-knap",
    add_event_title: "Tilføj begivenhed",
    add_event_name: "Titel",
    add_event_start: "Start",
    add_event_end: "Slut",
    add_event_all_day: "Hele dagen",
    add_event_location: "Sted",
    add_event_description: "Beskrivelse",
    add_event_calendar: "Kalender",
    add_event_save: "Gem",
    add_event_cancel: "Annuller",
    popup_upcoming_events: "Kommende begivenheder",
    editor_show_more: "Vis mere",
    editor_show_less: "Vis mindre",
    editor_background_color: "Baggrundsfarve",
    group_by_date: "Gruppér efter dag"
  },
  no: {
    starts_in_min: "Starter om {x} minutt",
    starts_in_mins: "Starter om {x} minutter",
    starts_in_hour: "Starter om {x} time",
    starts_in_hours: "Starter om {x} timer",
    starts_in_day: "Starter om {x} dag",
    starts_in_days: "Starter om {x} dager",
    starts_in_week: "Starter om {x} uke",
    starts_in_weeks: "Starter om {x} uker",
    loading: "Laster...",
    no_events: "Ingen hendelser",
    more_events: "+{x} til",
    editor_show_upcoming: "Vis kommende hendelser",
    editor_unfold_events: "Brett ut hendelser",
    editor_show_divider: "Vis skillelinje",
    editor_show_weekday: "Vis ukedag",
    editor_show_weekday_long: "Bruk langt format (f.eks. Mandag)",
    editor_show_add_event: "Vis Legg til-knapp",
    add_event_title: "Legg til hendelse",
    add_event_name: "Tittel",
    add_event_start: "Start",
    add_event_end: "Slutt",
    add_event_all_day: "Hele dagen",
    add_event_location: "Sted",
    add_event_description: "Beskrivelse",
    add_event_calendar: "Kalender",
    add_event_save: "Lagre",
    add_event_cancel: "Avbryt",
    popup_upcoming_events: "Kommende hendelser",
    editor_show_more: "Vis mer",
    editor_show_less: "Vis mindre",
    editor_background_color: "Bakgrunnsfarge",
    group_by_date: "Grupper etter dag"
  },
  fi: {
    starts_in_min: "Alkaa {x} minuutin kuluttua",
    starts_in_mins: "Alkaa {x} minuutin kuluttua",
    starts_in_hour: "Alkaa {x} tunnin kuluttua",
    starts_in_hours: "Alkaa {x} tunnin kuluttua",
    starts_in_day: "Alkaa {x} päivän kuluttua",
    starts_in_days: "Alkaa {x} päivän kuluttua",
    starts_in_week: "Alkaa {x} viikon kuluttua",
    starts_in_weeks: "Alkaa {x} viikon kuluttua",
    loading: "Ladataan...",
    no_events: "Ei tapahtumia",
    more_events: "+{x} lisää",
    editor_show_upcoming: "Näytä tulevat tapahtumat",
    editor_unfold_events: "Avaa tapahtumat",
    editor_show_divider: "Näytä jakaja",
    editor_show_weekday: "Näytä viikonpäivä",
    editor_show_weekday_long: "Käytä pitkää nimeä (esim. Maanantai)",
    editor_show_add_event: "Paina Lisää näppäintä",
    add_event_title: "Lisää tapahtuma",
    add_event_name: "Nimi",
    add_event_start: "Alku",
    add_event_end: "Loppu",
    add_event_all_day: "Koko päivä",
    add_event_location: "Sijainti",
    add_event_description: "Kuvaus",
    add_event_calendar: "Kalenteri",
    add_event_save: "Tallenna",
    add_event_cancel: "Peruuta",
    popup_upcoming_events: "Tulevat tapahtumat",
    editor_show_more: "Näytä enemmän",
    editor_show_less: "Näytä vähemmän",
    editor_background_color: "Taustaväri",
    group_by_date: "Ryhmittele päivän mukaan"
  },
  cs: {
    starts_in_min: "Začíná za {x} minutu",
    starts_in_mins: "Začíná za {x} minut",
    starts_in_hour: "Začíná za {x} hodinu",
    starts_in_hours: "Začíná za {x} hodin",
    starts_in_day: "Začíná za {x} den",
    starts_in_days: "Začíná za {x} dní",
    starts_in_week: "Začíná za {x} týden",
    starts_in_weeks: "Začíná za {x} týdnů",
    loading: "Načítání...",
    no_events: "Žádné události",
    more_events: "+{x} další",
    editor_show_upcoming: "Zobrazit nadcházející události",
    editor_unfold_events: "Rozvinout události",
    editor_show_divider: "Zobrazit dělič",
    editor_show_weekday: "Zobrazit den v týdnu",
    editor_show_weekday_long: "Použít celý název (např. Pondělí)",
    editor_show_add_event: "Zobrazit tlačítko Přidat",
    add_event_title: "Přidat událost",
    add_event_name: "Název",
    add_event_start: "Začátek",
    add_event_end: "Konec",
    add_event_all_day: "Celý den",
    add_event_location: "Místo",
    add_event_description: "Popis",
    add_event_calendar: "Kalendář",
    add_event_save: "Uložit",
    add_event_cancel: "Zrušit",
    popup_upcoming_events: "Nadcházející události",
    editor_show_more: "Zobrazit více",
    editor_show_less: "Zobrazit méně",
    editor_background_color: "Barva pozadí",
    group_by_date: "Seskupit podle dne"
  },
  hu: {
    starts_in_min: "Kezdés {x} perc múlva",
    starts_in_mins: "Kezdés {x} perc múlva",
    starts_in_hour: "Kezdés {x} óra múlva",
    starts_in_hours: "Kezdés {x} óra múlva",
    starts_in_day: "Kezdés {x} nap múlva",
    starts_in_days: "Kezdés {x} nap múlva",
    starts_in_week: "Kezdés {x} hét múlva",
    starts_in_weeks: "Kezdés {x} hét múlva",
    loading: "Betöltés...",
    no_events: "Nincs esemény",
    more_events: "+{x} további",
    editor_show_upcoming: "Közelgő események megjelenítése",
    editor_unfold_events: "Események kibontása",
    editor_show_divider: "Osztó megjelenítése",
    editor_show_weekday: "Hét napjának mutatása",
    editor_show_weekday_long: "Hosszú formátum (pl. Hétfő)",
    editor_show_add_event: "Hozzáadás gomb mutatása",
    add_event_title: "Esemény Hozzáadása",
    add_event_name: "Cím",
    add_event_start: "Kezdés",
    add_event_end: "Befejezés",
    add_event_all_day: "Egész napos",
    add_event_location: "Helyszín",
    add_event_description: "Leírás",
    add_event_calendar: "Naptár",
    add_event_save: "Mentés",
    add_event_cancel: "Mégse",
    popup_upcoming_events: "Közelgő események",
    editor_show_more: "Több mutatása",
    editor_show_less: "Kevesebb mutatása",
    editor_background_color: "Háttérszín",
    group_by_date: "Csoportosítás nap szerint"
  }
};
function x(n, e, t, a) {
  var o;
  const i = ((o = n.locale) == null ? void 0 : o.language) || n.language || "en";
  let s;
  if (q[i] && q[i][e])
    s = q[i][e];
  else if (q.en && q.en[e])
    s = q.en[e];
  else
    return e;
  return t && a && (s = s.replace(t, a)), s;
}
function At(n, e, t) {
  var l, d;
  const a = (t == null ? void 0 : t.unfold_events) || !1;
  if (e === void 0)
    return m`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--primary-color, #03a9f4);">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${x(n, "loading")}</div>
                </div>
            </div>
        </div>
        `;
  if (e.length === 0)
    return m`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--disabled-text-color, #bdbdbb);">
                    <ha-icon icon="mdi:calendar-remove"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${x(n, "no_events")}</div>
                </div>
            </div>
        </div>
        `;
  if (!a) {
    const r = e[0], _ = e.length - 1, u = r.summary;
    let h, f;
    try {
      if (h = new Date(r.start.dateTime || r.start.date), f = new Date(r.end.dateTime || r.end.date), isNaN(h.getTime()) || isNaN(f.getTime())) throw new Error("Invalid Date");
    } catch {
      return m`<div class="error">Date Error</div>`;
    }
    const p = /* @__PURE__ */ new Date(), b = !r.start.dateTime, k = ne(n, h, f, b), c = ((l = n.locale) == null ? void 0 : l.language) || n.language || navigator.language, g = (D) => D.toLocaleTimeString(c, { hour: "2-digit", minute: "2-digit" }), $ = `${g(h)} - ${g(f)}`, v = (t == null ? void 0 : t.show_date) ?? !1, w = (t == null ? void 0 : t.show_time) ?? !1;
    let y = "";
    const C = n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    if (v || w)
      if (b) {
        const D = v ? h.toLocaleDateString(c, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
        v && w ? y = `${D}, ${C}` : y = D || C;
      } else {
        const D = [];
        v && D.push(h.toLocaleDateString(c, { day: "2-digit", month: "2-digit", year: "numeric" })), w && D.push($), y = D.join(", ");
      }
    else if (h > p) {
      const D = h.getTime() - p.getTime(), J = Math.ceil(D / 6e4);
      y = ke(n, J);
    } else
      y = b ? C : g(h);
    if (t != null && t.show_duration && (y ? y.endsWith(k) || (y += ` • ${k}`) : y = k), _ > 0 && (y += ` ${x(n, "more_events", "{x}", _.toString())}`), t != null && t.show_weekday) {
      const D = ((d = n.locale) == null ? void 0 : d.language) || n.language || navigator.language, J = h.toLocaleDateString(D, { weekday: t.show_weekday_long ? "long" : "short" });
      y += ` • ${J}`;
    }
    const M = h <= p && f >= p ? p : h, P = xe(r.entity_id, t), O = ie(n, M, P, (t == null ? void 0 : t.dark_mode) ?? !1), z = be(r.entity_id, t), j = z ? `background-color: ${z}; border: none;` : "";
    return m`
            <div class="calendar-container">
                <div class="calendar-item"  
                     style="${j}"
                     title="${u}"
                     @click=${(D) => Ke(D, n, e)}>
                     <div class="calendar-icon dynamic">
                        ${O}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${u}</div>
                        <div class="event-time">
                            ${v || w ? m`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
                            ${y}
                        </div>
                        ${t != null && t.show_location && r.location ? m`
                                <div class="event-location">
                                    <ha-icon icon="mdi:map-marker"></ha-icon>
                                    ${r.location}
                                </div>
                            ` : ""}
                        ${t != null && t.show_calendar_name && r.calendar_name ? m`
                                <div class="event-calendar">
                                    <ha-icon icon="mdi:calendar-blank-multiple"></ha-icon>
                                    ${r.calendar_name}
                                </div>
                            ` : ""}
                    </div>
                </div>
            </div>
        `;
  }
  if (t != null && t.group_by_date && a) {
    const r = Xe(e);
    return m`
            <div class="calendar-container">
                ${r.map((_) => {
      const u = _.date, h = t.calendar_icon_color || "#fa3e3e", f = ie(n, u, h, (t == null ? void 0 : t.dark_mode) ?? !1);
      return m`
                        <div class="calendar-item grouped" style="align-items: center;">
                            <div class="calendar-icon dynamic">
                                ${f}
                            </div>
                            <div class="calendar-content">
                                ${_.events.map((p) => {
        var O;
        const b = p.summary, k = new Date(p.start.dateTime || p.start.date), c = new Date(p.end.dateTime || p.end.date), g = !p.start.dateTime, $ = ne(n, k, c, g), v = ((O = n.locale) == null ? void 0 : O.language) || n.language || navigator.language, w = (z) => z.toLocaleTimeString(v, { hour: "2-digit", minute: "2-digit" }), y = `${w(k)} - ${w(c)}`, C = (t == null ? void 0 : t.show_date) ?? !1, A = (t == null ? void 0 : t.show_time) ?? !1, M = n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
        let P = "";
        if (C || A)
          if (g) {
            const z = C ? k.toLocaleDateString(v, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
            C && A ? P = `${z}, ${M}` : P = z || M;
          } else {
            const z = [];
            C && z.push(k.toLocaleDateString(v, { day: "2-digit", month: "2-digit", year: "numeric" })), A && z.push(y), P = z.join(", ");
          }
        else
          P = g ? M : w(k);
        if (t != null && t.show_duration && (P.endsWith($) || (P += ` • ${$}`)), t != null && t.show_weekday) {
          const z = k.toLocaleDateString(v, { weekday: t.show_weekday_long ? "long" : "short" });
          P.includes(z) || (P += ` • ${z}`);
        }
        return m`
                                        <div class="event-entry" @click=${(z) => We(z, p.entity_id)} style="margin-bottom: 4px;">
                                            <div class="event-title">${b}</div>
                                            <div class="event-time" style="display: flex; align-items: center; gap: 4px;">
                                                ${C || A ? m`<ha-icon icon="mdi:clock-time-four-outline" style="--mdc-icon-size: 14px;"></ha-icon>` : ""}
                                                ${P}
                                            </div>
                                            ${t != null && t.show_location && p.location ? m`
                                                    <div class="event-location" style="display: flex; align-items: center; gap: 4px; font-size: 0.9em; color: var(--secondary-text-color);">
                                                        <ha-icon icon="mdi:map-marker" style="--mdc-icon-size: 14px;"></ha-icon>
                                                        ${p.location}
                                                    </div>
                                                ` : ""}
                                            ${t != null && t.show_calendar_name && p.calendar_name ? m`
                                                    <div class="event-calendar" style="display: flex; align-items: center; gap: 4px; font-size: 0.9em; color: var(--secondary-text-color);">
                                                        <ha-icon icon="mdi:calendar-blank-multiple" style="--mdc-icon-size: 14px;"></ha-icon>
                                                        ${p.calendar_name}
                                                    </div>
                                                ` : ""}
                                        </div>
                                    `;
      })}
                            </div>
                        </div>
                        ${t != null && t.show_divider ? m`<div class="calendar-divider"></div>` : ""}
                    `;
    })}
            </div>
        `;
  }
  const i = (t == null ? void 0 : t.max_lines) || 0, s = i > 0 ? e.slice(0, i) : e, o = e.length - s.length;
  return m`
        <div class="calendar-container">
            ${s.map((r, _) => {
    var De, Pe;
    const u = r.summary;
    let h, f;
    try {
      if (h = new Date(r.start.dateTime || r.start.date), f = new Date(r.end.dateTime || r.end.date), isNaN(h.getTime())) throw new Error("Invalid start date");
      if (isNaN(f.getTime())) throw new Error("Invalid end date");
    } catch {
      return m`<div class="error">Date Error for ${u}</div>`;
    }
    const p = /* @__PURE__ */ new Date(), b = !r.start.dateTime;
    let k = -1;
    const c = ne(n, h, f, b), g = ((De = n.locale) == null ? void 0 : De.language) || n.language || navigator.language, $ = (S) => S.toLocaleTimeString(g, { hour: "2-digit", minute: "2-digit" }), v = `${$(h)} - ${$(f)}`, w = (t == null ? void 0 : t.show_date) ?? !1, y = (t == null ? void 0 : t.show_time) ?? !1;
    let C = "";
    const A = n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    if (w || y)
      if (b) {
        const S = w ? h.toLocaleDateString(g, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
        w && y ? C = `${S}, ${A}` : C = S || A;
      } else {
        const S = [];
        w && S.push(h.toLocaleDateString(g, { day: "2-digit", month: "2-digit", year: "numeric" })), y && S.push(v), C = S.join(", ");
      }
    else if (h > p) {
      const S = h.getTime() - p.getTime(), X = Math.ceil(S / 6e4);
      C = ke(n, X);
    } else
      C = b ? A : $(h);
    if (t != null && t.show_duration && (C ? C.endsWith(c) || (C += ` • ${c}`) : C = c), !b && h <= p && f >= p) {
      const S = f.getTime() - h.getTime(), X = p.getTime() - h.getTime();
      S > 0 && (k = Math.max(0, Math.min(100, X / S * 100)));
    }
    if (t != null && t.show_weekday) {
      const S = ((Pe = n.locale) == null ? void 0 : Pe.language) || n.language || navigator.language, X = h.toLocaleDateString(S, { weekday: t.show_weekday_long ? "long" : "short" });
      C += ` • ${X}`;
    }
    const P = h <= p && f >= p ? p : h, O = xe(r.entity_id, t), z = ie(n, P, O, (t == null ? void 0 : t.dark_mode) ?? !1), j = be(r.entity_id, t), D = j ? `background-color: ${j}; border: none;` : "", J = (t == null ? void 0 : t.show_divider) && _ > 0, ge = i > 0 && _ === i - 1 && o > 0;
    return m`
                ${J ? m`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item"  
                     style="${D}"
                     title="${ge ? x(n, "popup_upcoming_events") : u}"
                     @click=${(S) => ge ? Ke(S, n, e) : We(S, r.entity_id)}>
                     <div class="calendar-icon dynamic">
                        ${z}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${u}</span>
                            ${ge ? m`
                                <span class="more-indicator" style="display: flex; align-items: center; gap: 4px; color: var(--secondary-text-color); font-size: 0.85em; font-style: italic; flex-shrink: 0;">
                                    <ha-icon icon="mdi:dots-horizontal" style="--mdc-icon-size: 16px; color: var(--secondary-text-color);"></ha-icon>
                                    (${o})
                                </span>
                            ` : ""}
                        </div>
                        <div class="event-time">
                            ${w || y ? m`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
                            ${C}
                        </div>
                        ${t != null && t.show_location && r.location ? m`
                                <div class="event-location">
                                    <ha-icon icon="mdi:map-marker"></ha-icon>
                                    ${r.location}
                                </div>
                            ` : ""}
                        ${t != null && t.show_calendar_name && r.calendar_name ? m`
                                <div class="event-calendar">
                                    <ha-icon icon="mdi:calendar-blank-multiple"></ha-icon>
                                    ${r.calendar_name}
                                </div>
                            ` : ""}
                        ${k >= 0 ? m`
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${k}%"></div>
                            </div>
                        ` : ""}
                    </div>
                </div>
                `;
  })}
        </div>
    `;
}
function xe(n, e) {
  var a;
  const t = ((a = e == null ? void 0 : e.calendar_colors) == null ? void 0 : a[n]) || (e == null ? void 0 : e.calendar_icon_color) || "#fa3e3e";
  return Je(t);
}
function be(n, e) {
  var a;
  const t = ((a = e == null ? void 0 : e.calendar_background_colors) == null ? void 0 : a[n]) || (e == null ? void 0 : e.background_color) || "";
  return t ? Je(t) : "";
}
function Je(n) {
  return n.startsWith("#") || n.startsWith("rgb") || n.startsWith("hsl") || n.startsWith("var") ? n : `var(--${n}-color)`;
}
function Ke(n, e, t) {
  const a = new CustomEvent("calendar-card-show-detail", {
    bubbles: !0,
    composed: !0,
    detail: {
      title: x(e, "popup_upcoming_events"),
      entities: t
    }
  });
  n.target.dispatchEvent(a);
}
function We(n, e) {
  const t = new CustomEvent("hass-more-info", {
    bubbles: !0,
    composed: !0,
    detail: { entityId: e }
  });
  n.target.dispatchEvent(t);
}
function Xe(n) {
  const e = {};
  return n.forEach((t) => {
    const a = new Date(t.start.dateTime || t.start.date), i = a.toISOString().split("T")[0];
    e[i] || (e[i] = {
      date: a,
      events: []
    }), e[i].events.push(t);
  }), Object.values(e).sort((t, a) => t.date.getTime() - a.date.getTime());
}
function ie(n, e, t, a = !1) {
  var _;
  const i = ((_ = n.locale) == null ? void 0 : _.language) || n.language || navigator.language, s = e.toLocaleDateString(i, { month: "short" }).toUpperCase(), o = e.getDate();
  return m`
        <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
            <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${a ? "#222222" : "white"}"></rect>
            <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
            <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${a ? "#222222" : "white"}" text-anchor="middle">${s}</text>
            <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${a ? "white" : "#333"}" text-anchor="middle">${o}</text>
        </svg>
    `;
}
function ne(n, e, t, a) {
  const i = t.getTime() - e.getTime(), s = Math.round(i / 6e4);
  if (a && s === 1440)
    return n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
  if (s < 60)
    return `${s} ${x(n, "duration_min")}`;
  const o = Math.floor(s / 1440), l = s % 1440, d = Math.floor(l / 60), r = l % 60, _ = [];
  return o >= 1 && _.push(`${o} ${x(n, o === 1 ? "duration_day" : "duration_days")}`), d > 0 && _.push(`${d} ${x(n, "duration_hour")}`), r > 0 && _.push(`${r} ${x(n, "duration_min")}`), _.join(" ");
}
function ke(n, e) {
  if (e < 60)
    return e === 1 ? x(n, "starts_in_min", "{x}", e.toString()) : x(n, "starts_in_mins", "{x}", e.toString());
  if (e < 1440) {
    const a = Math.round(e / 60);
    return a === 1 ? x(n, "starts_in_hour", "{x}", a.toString()) : x(n, "starts_in_hours", "{x}", a.toString());
  }
  if (e < 43200) {
    const a = Math.round(e / 1440);
    return a === 1 ? x(n, "starts_in_day", "{x}", a.toString()) : x(n, "starts_in_days", "{x}", a.toString());
  }
  const t = Math.round(e / 10080);
  return t === 1 ? x(n, "starts_in_week", "{x}", t.toString()) : x(n, "starts_in_weeks", "{x}", t.toString());
}
function Et(n, e) {
  const t = Object.keys(n.states).filter((r) => r.startsWith("calendar.")).filter((r) => {
    var _;
    return !((_ = e.exclude_entities) != null && _.includes(r));
  }), a = t.length > 0 ? t[0] : void 0, i = /* @__PURE__ */ new Date(), s = new Date(i);
  s.setHours(s.getHours() + 1, 0, 0, 0);
  const o = new Date(s);
  o.setHours(o.getHours() + 1, 0, 0, 0);
  const l = (r) => r.toString().padStart(2, "0"), d = (r) => `${r.getFullYear()}-${l(r.getMonth() + 1)}-${l(r.getDate())} ${l(r.getHours())}:${l(r.getMinutes())}:00`;
  return {
    open: !0,
    calendar_id: a,
    name: "",
    start: d(s),
    end: d(o),
    location: "",
    description: "",
    recurrence: "none",
    all_day: !1
  };
}
async function zt(n, e, t, a) {
  if (!(!e.calendar_id || !e.name || !e.start || !e.end))
    try {
      const i = {
        entity_id: e.calendar_id,
        summary: e.name
      };
      if (e.all_day) {
        const s = e.start.split(" ")[0];
        let o = e.end.split(" ")[0];
        if (s === o) {
          const l = o.split("-"), d = new Date(Number(l[0]), Number(l[1]) - 1, Number(l[2]));
          d.setDate(d.getDate() + 1);
          const r = (_) => _.toString().padStart(2, "0");
          o = `${d.getFullYear()}-${r(d.getMonth() + 1)}-${r(d.getDate())}`;
        }
        i.start_date = s, i.end_date = o;
      } else
        i.start_date_time = e.start, i.end_date_time = e.end, e.location && (i.location = e.location), e.description && (i.description = e.description);
      if (e.recurrence && e.recurrence !== "none") {
        const s = {
          DAILY: "FREQ=DAILY",
          WEEKLY: "FREQ=WEEKLY",
          MONTHLY: "FREQ=MONTHLY",
          YEARLY: "FREQ=YEARLY"
        };
        s[e.recurrence] && (i.rrule = s[e.recurrence]);
      }
      await n.callService("calendar", "create_event", i), t();
    } catch (i) {
      a(i);
    }
}
function St(n, e, t, a, i, s) {
  var l, d, r, _, u, h, f, p, b, k;
  const o = Object.keys(n.states).filter((c) => c.startsWith("calendar.")).filter((c) => {
    var g;
    return !((g = e.exclude_entities) != null && g.includes(c));
  });
  return m`
        <div class="add-event-form">
            <ha-textfield
                    label=${n.localize("ui.components.calendar.event.summary") || "Title"}
                    .value=${t.name || ""}
                    @input=${(c) => a({ name: c.target.value })}
                    dialogInitialFocus
                ></ha-textfield>

                <ha-textfield
                    label=${n.localize("ui.components.calendar.event.location") || "Location"}
                    .value=${t.location || ""}
                    @input=${(c) => a({ location: c.target.value })}
                ></ha-textfield>

                <ha-textfield
                    label=${n.localize("ui.components.calendar.event.description") || "Description"}
                    .value=${t.description || ""}
                    @input=${(c) => a({ description: c.target.value })}
                ></ha-textfield>

                <ha-selector
                    .hass=${n}
                    .selector=${{ select: { options: o.map((c) => {
    var g, $;
    return { value: c, label: (($ = (g = n.states[c]) == null ? void 0 : g.attributes) == null ? void 0 : $.friendly_name) || c };
  }) } }}
                    .value=${t.calendar_id}
                    .label=${n.localize("ui.components.calendar.my_calendars") || "Calendar"}
                    @value-changed=${(c) => a({ calendar_id: c.detail.value })}
                ></ha-selector>

                <div class="row-flex">
                    <ha-formfield .label=${n.localize("ui.components.calendar.event.all_day") || "All Day"}>
                        <ha-switch
                            .checked=${t.all_day || !1}
                            @change=${(c) => a({ all_day: c.target.checked })}
                        ></ha-switch>
                    </ha-formfield>
                </div>

                <div class="row-label">${n.localize("ui.components.calendar.event.start") || "Start"}:</div>
                <div class="date-row">
                    <ha-selector
                        class="date-selector"
                        .hass=${n}
                        .selector=${{ date: {} }}
                        .required=${!1}
                        .value=${((l = t.start) == null ? void 0 : l.split(" ")[0]) || ""}
                        @value-changed=${(c) => {
    var $;
    const g = (($ = t.start) == null ? void 0 : $.split(" ")[1]) || "00:00:00";
    a({ start: `${c.detail.value} ${g}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((r = (d = t.start) == null ? void 0 : d.split(" ")[1]) == null ? void 0 : r.substring(0, 2)) || "00"}
                            @change=${(c) => {
    var v, w, y;
    const g = ((v = t.start) == null ? void 0 : v.split(" ")[0]) || "", $ = ((y = (w = t.start) == null ? void 0 : w.split(" ")[1]) == null ? void 0 : y.substring(3, 5)) || "00";
    a({ start: `${g} ${c.target.value.padStart(2, "0")}:${$}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((u = (_ = t.start) == null ? void 0 : _.split(" ")[1]) == null ? void 0 : u.substring(3, 5)) || "00"}
                            @change=${(c) => {
    var v, w, y;
    const g = ((v = t.start) == null ? void 0 : v.split(" ")[0]) || "", $ = ((y = (w = t.start) == null ? void 0 : w.split(" ")[1]) == null ? void 0 : y.substring(0, 2)) || "00";
    a({ start: `${g} ${$}:${c.target.value.padStart(2, "0")}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                    </div>
                </div>
                
                <div class="row-label">${n.localize("ui.components.calendar.event.end") || "End"}:</div>
                <div class="date-row">
                    <ha-selector
                        class="date-selector"
                        .hass=${n}
                        .selector=${{ date: {} }}
                        .required=${!1}
                        .value=${((h = t.end) == null ? void 0 : h.split(" ")[0]) || ""}
                        @value-changed=${(c) => {
    var $;
    const g = (($ = t.end) == null ? void 0 : $.split(" ")[1]) || "00:00:00";
    a({ end: `${c.detail.value} ${g}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((p = (f = t.end) == null ? void 0 : f.split(" ")[1]) == null ? void 0 : p.substring(0, 2)) || "00"}
                            @change=${(c) => {
    var v, w, y;
    const g = ((v = t.end) == null ? void 0 : v.split(" ")[0]) || "", $ = ((y = (w = t.end) == null ? void 0 : w.split(" ")[1]) == null ? void 0 : y.substring(3, 5)) || "00";
    a({ end: `${g} ${c.target.value.padStart(2, "0")}:${$}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((k = (b = t.end) == null ? void 0 : b.split(" ")[1]) == null ? void 0 : k.substring(3, 5)) || "00"}
                            @change=${(c) => {
    var v, w, y;
    const g = ((v = t.end) == null ? void 0 : v.split(" ")[0]) || "", $ = ((y = (w = t.end) == null ? void 0 : w.split(" ")[1]) == null ? void 0 : y.substring(0, 2)) || "00";
    a({ end: `${g} ${$}:${c.target.value.padStart(2, "0")}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                    </div>
                </div>

                <ha-selector
                    .hass=${n}
                    .selector=${{ select: {
    options: [
      { value: "none", label: n.localize("ui.components.calendar.event.repeat.freq.none") || "None" },
      { value: "DAILY", label: n.localize("ui.components.calendar.event.repeat.freq.daily") || "Daily" },
      { value: "WEEKLY", label: n.localize("ui.components.calendar.event.repeat.freq.weekly") || "Weekly" },
      { value: "MONTHLY", label: n.localize("ui.components.calendar.event.repeat.freq.monthly") || "Monthly" },
      { value: "YEARLY", label: n.localize("ui.components.calendar.event.repeat.freq.yearly") || "Yearly" }
    ],
    mode: "dropdown"
  } }}
                    .value=${t.recurrence || "none"}
                    .label=${n.localize("ui.components.calendar.event.repeat.label") || "Repeat"}
                    @value-changed=${(c) => a({ recurrence: c.detail.value })}
                ></ha-selector>

                <div class="dialog-actions">
                    <ha-button @click=${i}>
                        ${n.localize("ui.common.cancel") || "Cancel"}
                    </ha-button>
                    <ha-button
                        unelevated
                        @click=${s}
                        ?disabled=${!t.name || !t.calendar_id}
                    >
                        ${n.localize("ui.common.save") || "Save"}
                    </ha-button>
                </div>
        </div>
    `;
}
var et = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, Dt = (n, e, t) => e in n ? et(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, R = (n, e, t, a) => {
  for (var i = a > 1 ? void 0 : a ? Tt(e, t) : e, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (i = (a ? o(e, t, i) : o(i)) || i);
  return a && i && et(e, t, i), i;
}, Pt = (n, e, t) => Dt(n, e + "", t);
let L = class extends W {
  constructor() {
    super(...arguments);
    E(this, "hass");
    E(this, "config");
    E(this, "open", !1);
    E(this, "mode", "detail");
    E(this, "detailTitle", "");
    E(this, "detailEvents", []);
    E(this, "_addEventState", { open: !1 });
    E(this, "_opener", null);
    E(this, "_onEventSaved", null);
    E(this, "_onPopState", (e) => {
      var t;
      this.open && !((t = window.history.state) != null && t.calendarCardPlusPopup) && this._close();
    });
    E(this, "_close", () => {
      if (!this.open) return;
      this.open = !1, this.requestUpdate();
      const e = { dialog: this };
      this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("popup-closed", { bubbles: !0, composed: !0, detail: e }));
    });
    E(this, "_onDialogClosed", (e) => {
      var t;
      if (e && e.type !== "click") {
        const a = e.target;
        if (a && a.tagName !== "HA-ADAPTIVE-DIALOG" && a.tagName !== "HA-DIALOG")
          return;
      }
      this._close(), (t = window.history.state) != null && t.calendarCardPlusPopup && window.history.back();
    });
    E(this, "_closeDialog", () => {
      var e;
      this.open && (this._close(), (e = window.history.state) != null && e.calendarCardPlusPopup && window.history.back());
    });
  }
  async showDialog(e) {
    this.hass = e.hass, this.config = e.config, this._opener = e.opener, this.mode = e.mode, e.title && (this.detailTitle = e.title), e.events && (this.detailEvents = e.events), e.addEventState && (this._addEventState = e.addEventState), e.onEventSaved && (this._onEventSaved = e.onEventSaved), this.open = !0, window.history.pushState({ calendarCardPlusPopup: !0 }, ""), this.requestUpdate(), await this.updateComplete;
    const t = this.renderRoot.querySelector("ha-adaptive-dialog");
    if (t && t.shadowRoot) {
      const a = t.shadowRoot.querySelector("ha-bottom-sheet");
      a && (a.style.removeProperty("--dialog-transform"), a.style.removeProperty("--dialog-transition"));
    }
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("popstate", this._onPopState);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("popstate", this._onPopState);
  }
  _updateAddEventState(e) {
    this._addEventState = { ...this._addEventState, ...e }, this.requestUpdate();
  }
  async _handleSave() {
    await zt(
      this.hass,
      this._addEventState,
      () => {
        this.dispatchEvent(new CustomEvent("event-saved", { bubbles: !0, composed: !0 })), this._onEventSaved && this._onEventSaved(), this._closeDialog();
      },
      (e) => {
        alert("Error saving event: " + e.message);
      }
    );
  }
  render() {
    var a;
    const e = this.mode === "add-event", t = e ? ((a = this.hass) == null ? void 0 : a.localize("ui.components.calendar.event.add")) || "Add Event" : this.detailTitle;
    return m`
            <ha-adaptive-dialog
                .hass=${this.hass}
                .open=${this.open}
                .headerTitle=${t}
                @closed=${this._onDialogClosed}
                @ha-dialog-closed=${this._onDialogClosed}
                flexcontent
            >
                <div class="dialog-content scrollable ha-scrollbar">
                    ${e ? St(
      this.hass,
      this.config,
      this._addEventState,
      this._updateAddEventState.bind(this),
      this._closeDialog.bind(this),
      this._handleSave.bind(this)
    ) : this._renderDetailContent()}
                </div>
            </ha-adaptive-dialog>
        `;
  }
  _renderDetailContent() {
    return this.config.group_by_date ? Xe(this.detailEvents).map((t) => {
      const a = t.date, i = this.config.calendar_icon_color || "#fa3e3e", s = ie(this.hass, a, i, this.config.dark_mode ?? !1);
      return m`
                    <div class="calendar-item grouped detail" style="align-items: center;">
                        <div class="calendar-icon dynamic">
                            ${s}
                        </div>
                        <div class="calendar-content">
                            ${t.events.map((o) => {
        var $;
        const l = o.summary, d = new Date(o.start.dateTime || o.start.date), r = new Date(o.end.dateTime || o.end.date), _ = !o.start.dateTime, u = ne(this.hass, d, r, _), h = (($ = this.hass.locale) == null ? void 0 : $.language) || this.hass.language || navigator.language, f = (v) => v.toLocaleTimeString(h, { hour: "2-digit", minute: "2-digit" }), p = `${f(d)} - ${f(r)}`, b = this.config.show_date ?? !1, k = this.config.show_time ?? !1, c = this.hass.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
        let g = "";
        if (b || k)
          if (_) {
            const v = b ? d.toLocaleDateString(h, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
            b && k ? g = `${v}, ${c}` : g = v || c;
          } else {
            const v = [];
            b && v.push(d.toLocaleDateString(h, { day: "2-digit", month: "2-digit", year: "numeric" })), k && v.push(p), g = v.join(", ");
          }
        else
          g = _ ? c : f(d);
        if (this.config.show_duration && (g.endsWith(u) || (g += ` • ${u}`)), this.config.show_weekday) {
          const v = d.toLocaleDateString(h, { weekday: this.config.show_weekday_long ? "long" : "short" });
          g.includes(v) || (g += ` • ${v}`);
        }
        return m`
                                    <div class="event-entry" @click=${() => this._handleMoreInfo(o.entity_id)} style="margin-bottom: 4px;">
                                        <div class="event-title">${l}</div>
                                        <div class="event-time" style="display: flex; align-items: center; gap: 4px;">
                                            ${b || k ? m`<ha-icon icon="mdi:clock-time-four-outline" style="--mdc-icon-size: 14px;"></ha-icon>` : ""}
                                            ${g}
                                        </div>
                                        ${this.config.show_location && o.location ? m`
                                                <div class="event-location">
                                                    <ha-icon icon="mdi:map-marker" style="--mdc-icon-size: 14px;"></ha-icon>
                                                    ${o.location}
                                                </div>
                                            ` : ""}
                                        ${this.config.show_calendar_name && o.calendar_name ? m`
                                                <div class="event-calendar">
                                                    <ha-icon icon="mdi:calendar-blank-multiple" style="--mdc-icon-size: 14px;"></ha-icon>
                                                    ${o.calendar_name}
                                                </div>
                                            ` : ""}
                                    </div>
                                `;
      })}
                        </div>
                    </div>
                    ${this.config.show_divider ? m`<div class="calendar-divider"></div>` : ""}
                `;
    }) : this.detailEvents.map((e, t) => {
      var C;
      const a = e.summary;
      let i = "", s, o;
      try {
        s = new Date(e.start.dateTime || e.start.date), o = new Date(e.end.dateTime || e.end.date);
      } catch {
        return m`<div class="error">Date Error</div>`;
      }
      const l = /* @__PURE__ */ new Date(), d = !e.start.dateTime, r = ((C = this.hass.locale) == null ? void 0 : C.language) || this.hass.language || navigator.language, _ = (A) => A.toLocaleTimeString(r, { hour: "2-digit", minute: "2-digit" }), u = ne(this.hass, s, o, d), h = `${_(s)} - ${_(o)}`, f = this.config.show_date ?? !1, p = this.config.show_time ?? !1, b = this.hass.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
      if (f || p)
        if (d) {
          const A = f ? s.toLocaleDateString(r, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
          f && p ? i = `${A}, ${b}` : i = A || b;
        } else {
          const A = [];
          f && A.push(s.toLocaleDateString(r, { day: "2-digit", month: "2-digit", year: "numeric" })), p && A.push(h), i = A.join(", ");
        }
      else if (s > l) {
        const A = s.getTime() - l.getTime(), M = Math.ceil(A / 6e4);
        i = ke(this.hass, M);
      } else
        i = d ? b : _(s);
      if (this.config.show_duration && (i ? i.endsWith(u) || (i += ` • ${u}`) : i = u), this.config.show_weekday) {
        const A = s.toLocaleDateString(r, { weekday: this.config.show_weekday_long ? "long" : "short" });
        i += ` • ${A}`;
      }
      const c = s <= l && o >= l ? l : s, g = xe(e.entity_id, this.config), $ = ie(this.hass, c, g, this.config.dark_mode ?? !1), v = this.config.show_divider && t > 0, w = be(e.entity_id, this.config), y = w ? `background-color: ${w}; border: none;` : "";
      return m`
                ${v ? m`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item detail" style=${y} @click=${() => this._handleMoreInfo(e.entity_id)}>
                    <div class="calendar-icon dynamic">
                        ${$}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${a}</div>
                        <div class="event-time">
                            ${f || p ? m`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
                            ${i}
                        </div>
                        ${this.config.show_location && e.location ? m`
                                <div class="event-location">
                                    <ha-icon icon="mdi:map-marker"></ha-icon>
                                    ${e.location}
                                </div>
                            ` : ""}
                        ${this.config.show_calendar_name && e.calendar_name ? m`
                                <div class="event-calendar">
                                    <ha-icon icon="mdi:calendar-blank-multiple"></ha-icon>
                                    ${e.calendar_name}
                                </div>
                            ` : ""}
                    </div>
                </div>
            `;
    });
  }
  _handleMoreInfo(e) {
    const t = new CustomEvent("hass-more-info", {
      bubbles: !0,
      composed: !0,
      detail: { entityId: e }
    });
    this._opener ? this._opener.dispatchEvent(t) : window.dispatchEvent(t);
  }
};
Pt(L, "styles", Ee`
        :host {
            display: block;
        }

        ha-adaptive-dialog {
            --dialog-content-padding: 0px 12px 12px;
            --ha-dialog-max-width: 96vw !important;
            --ha-bottom-sheet-height: calc(100dvh - max(var(--safe-area-inset-top), 48px)) !important;
            --ha-bottom-sheet-max-height: var(--ha-bottom-sheet-height) !important;
        }

        .dialog-header {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .dialog-title {
            font-size: 1.1em;
            font-weight: 500;
            flex: 1;
        }

        .dialog-content {
            padding: 0 8px 8px 8px;
            min-width: 320px;
        }

        .dialog-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 8px 16px 16px;
        }

        .calendar-item {
            display: flex;
            align-items: center;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .calendar-item.detail {
            background-color: var(--ha-card-background, var(--card-background-color, white));
            border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
            border-radius: var(--ha-card-border-radius, 12px);
            padding: 12px;
            margin-bottom: 8px;
            box-shadow: var(--ha-card-box-shadow, none);
        }

        .calendar-item.detail:hover {
            background-color: var(--secondary-background-color);
        }

        .calendar-icon {
            width: 40px;
            height: 40px;
            margin-right: 12px;
            flex-shrink: 0;
            border-radius: 8px;
            overflow: hidden;
        }

        .calendar-content {
            flex: 1;
            min-width: 0;
        }

        .event-title {
            font-weight: 500;
            font-size: 1.1em;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .event-time {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.9em;
            color: var(--secondary-text-color);
        }
        .event-time ha-icon {
            --mdc-icon-size: 14px;
            color: var(--secondary-text-color);
        }
        .event-location, .event-calendar {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.9em;
            color: var(--secondary-text-color);
            margin-top: 1px;
        }
        .event-location ha-icon, .event-calendar ha-icon {
            --mdc-icon-size: 14px;
            color: var(--secondary-text-color);
        }
        
        .calendar-divider {
            border-top: 1px solid var(--divider-color, #e0e0e0);
            margin: 4px 12px;
        }

        .add-event-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .row-flex {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .date-row {
            display: flex;
            gap: 8px;
            align-items: flex-start;
        }
        
        .date-selector {
            flex: 2;
        }
        
        .time-inputs-wrap {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 8px;
        }

        .calendar-item.grouped .calendar-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .calendar-item.grouped .event-entry {
            display: flex;
            flex-direction: column;
        }
        .calendar-item.grouped .calendar-icon {
            align-self: center;
        }
    `);
R([
  B({ attribute: !1 })
], L.prototype, "hass", 2);
R([
  B({ attribute: !1 })
], L.prototype, "config", 2);
R([
  B({ type: Boolean })
], L.prototype, "open", 2);
R([
  B({ type: String })
], L.prototype, "mode", 2);
R([
  B({ type: String })
], L.prototype, "detailTitle", 2);
R([
  B({ type: Array })
], L.prototype, "detailEvents", 2);
R([
  ce()
], L.prototype, "_addEventState", 2);
L = R([
  Te("calendar-card-plus-popup")
], L);
const Mt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusPopup() {
    return L;
  }
}, Symbol.toStringTag, { value: "Module" }));
var Lt = Object.defineProperty, jt = Object.getOwnPropertyDescriptor, ve = (n, e, t, a) => {
  for (var i = a > 1 ? void 0 : a ? jt(e, t) : e, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (i = (a ? o(e, t, i) : o(i)) || i);
  return a && i && Lt(e, t, i), i;
};
let de = class extends W {
  constructor() {
    super(...arguments);
    E(this, "hass");
    E(this, "config");
    E(this, "_events");
    E(this, "_handleShowDetail", async (e) => {
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "detail",
        title: e.detail.title,
        events: e.detail.entities
      });
    });
    E(this, "_openAddEventPopup", async () => {
      const e = Et(this.hass, this.config);
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "add-event",
        addEventState: e
      });
    });
    E(this, "_onEventSaved", () => {
      this._events = void 0, this.requestUpdate(), this._fetchEvents();
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("calendar-card-show-detail", this._handleShowDetail);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("calendar-card-show-detail", this._handleShowDetail);
  }
  willUpdate(e) {
    super.willUpdate(e), this.hass && this.config && (this._events === void 0 || e.has("config")) && this._fetchEvents();
  }
  setConfig(e) {
    if (!e)
      throw new Error("Invalid configuration");
    this.config = e;
  }
  async _fetchEvents() {
    if (!this.hass || !this.config) return;
    const e = /* @__PURE__ */ new Date();
    let t;
    if (this.config.upcoming_events) {
      let s = 1440;
      this.config.days !== void 0 || this.config.hours !== void 0 || this.config.minutes !== void 0 ? s = (this.config.days || 0) * 1440 + (this.config.hours || 0) * 60 + (this.config.minutes || 0) : this.config.max_minutes_until_start !== void 0 && (s = this.config.max_minutes_until_start), t = new Date(e.getTime() + s * 6e4);
    } else
      t = new Date(e), t.setHours(23, 59, 59, 999);
    const a = Object.keys(this.hass.states).filter((s) => s.startsWith("calendar.")).filter((s) => {
      var o;
      return !((o = this.config.exclude_entities) != null && o.includes(s));
    });
    if (a.length === 0) {
      this._events = [];
      return;
    }
    const i = await nt(this.hass, e, t, a);
    i.sort((s, o) => {
      const l = new Date(s.start.dateTime || s.start.date).getTime(), d = new Date(o.start.dateTime || o.start.date).getTime();
      return l - d;
    }), this._events = i, this.requestUpdate();
  }
  render() {
    if (!this.config || !this.hass)
      return m``;
    const e = At(this.hass, this._events, this.config);
    return m`
            <ha-card>
                <div class="add-event-btn" @click=${this._openAddEventPopup} style=${this.config.show_add_event ? "" : "display: none;"}>
                    <ha-icon-button .path=${it}></ha-icon-button>
                </div>
                ${e}
            </ha-card>
        `;
  }
  _showPopup(e, t) {
    this.dispatchEvent(
      new CustomEvent("show-dialog", {
        detail: {
          dialogTag: e,
          dialogImport: () => Promise.resolve().then(() => Mt),
          dialogParams: {
            ...t,
            onEventSaved: this._onEventSaved
          }
        },
        bubbles: !0,
        composed: !0
      })
    );
  }
  static get styles() {
    return Ee`
            :host {
                display: block;
            }
            ha-card {
                height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .calendar-container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
            }
            .calendar-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: var(--ha-card-border-radius, 12px);
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .calendar-item:last-child {
                margin-bottom: 0px;
            }
            .calendar-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: var(--primary-color, #03a9f4);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }
            .calendar-icon ha-icon {
                --mdc-icon-size: 20px;
            }
            .calendar-content {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                flex: 1;
            }
            .event-title {
                font-size: 14px;
                font-weight: 500;
                color: var(--primary-text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .event-time {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: var(--secondary-text-color);
            }
            .event-time ha-icon {
                --mdc-icon-size: 14px;
                color: var(--secondary-text-color);
            }
            .event-location, .event-calendar {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 0.9em;
                color: var(--secondary-text-color);
                margin-top: 1px;
            }
            .event-location ha-icon, .event-calendar ha-icon {
                --mdc-icon-size: 14px;
                color: var(--secondary-text-color);
            }
            .progress-bar {
                margin-top: 4px;
                height: 4px;
                background-color: var(--secondary-background-color, #444);
                border-radius: 2px;
                overflow: hidden;
                width: 100%;
            }
            .progress-fill {
                height: 100%;
                background-color: var(--primary-text-color, #fff);
                border-radius: 2px;
                opacity: 0.7;
            }
            .calendar-divider {
                border-top: 1px solid var(--divider-color, #e0e0e0);
                margin: 4px 12px;
            }

            .add-event-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 2;
                color: var(--secondary-text-color);
            }
            .add-event-btn:hover {
                color: var(--primary-text-color);
            }
            .calendar-item.grouped .calendar-content {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .calendar-item.grouped .event-entry {
                display: flex;
                flex-direction: column;
            }
            .calendar-item.grouped .calendar-icon {
                align-self: center;
            }
        `;
  }
  getCardSize() {
    return 1;
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => Nt), document.createElement("calendar-card-plus-editor");
  }
  static getStubConfig(e) {
    return {
      type: "custom:calendar-card-plus",
      exclude_entities: [],
      unfold_events: !1
    };
  }
};
ve([
  B({ attribute: !1 })
], de.prototype, "hass", 2);
ve([
  ce()
], de.prototype, "config", 2);
ve([
  ce()
], de.prototype, "_events", 2);
de = ve([
  Te("calendar-card-plus")
], de);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-card-plus",
  name: "Dynamic Calendar Card Plus",
  preview: !0,
  description: "A standalone calendar card with dynamic grid styling"
});
const N = (n, e, t, a) => {
  a = a || {}, t = t ?? {};
  const i = new Event(e, {
    bubbles: a.bubbles === void 0 ? !0 : a.bubbles,
    cancelable: !!a.cancelable,
    composed: a.composed === void 0 ? !0 : a.composed
  });
  return i.detail = t, n.dispatchEvent(i), i;
};
var Ot = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, pe = (n, e, t, a) => {
  for (var i = a > 1 ? void 0 : a ? Bt(e, t) : e, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (i = (a ? o(e, t, i) : o(i)) || i);
  return a && i && Ot(e, t, i), i;
};
let Q = class extends W {
  constructor() {
    super(...arguments);
    E(this, "hass");
    E(this, "_config", { type: "custom:calendar-card-plus" });
    E(this, "_showAllCalendars", !1);
  }
  set config(e) {
    this.setConfig(e);
  }
  setConfig(e) {
    this._config = e, this.requestUpdate();
  }
  render() {
    var l, d, r, _, u, h, f, p, b, k;
    if (!this.hass)
      return m``;
    const e = this._config.upcoming_events ?? !1, t = this._config.unfold_events ?? !1, a = this._config.days ?? 1, i = this._config.hours ?? 0, s = this._config.minutes ?? 0, o = this._config.exclude_entities ?? [];
    return m`
            <div class="card-config">


                <div class="settings-grid">
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_unfold_events")}</span>
                        <ha-switch
                            .checked=${t}
                            @change=${this._compactModeChanged}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_divider")}</span>
                        <ha-switch
                            .checked=${this._config.show_divider ?? !1}
                            @change=${this._calendarDividerChanged}
                        ></ha-switch>
                    </div>

                    <div class="settings-row">
                        <span class="label">${(l = this.hass) == null ? void 0 : l.localize("ui.common.show")} ${(d = this.hass) == null ? void 0 : d.localize("component.calendar.entity_component._.name")} ${(r = this.hass) == null ? void 0 : r.localize("ui.common.name")}</span>
                        <ha-switch
                            .checked=${this._config.show_calendar_name ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_calendar_name")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${(_ = this.hass) == null ? void 0 : _.localize("ui.common.show")} ${((u = this.hass) == null ? void 0 : u.localize("ui.dialogs.helper_settings.input_datetime.date")) || "Date"}</span>
                        <ha-switch
                            .checked=${this._config.show_date ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_date")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_location")}</span>
                        <ha-switch
                            .checked=${this._config.show_location ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_location")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_duration")}</span>
                        <ha-switch
                            .checked=${this._config.show_duration ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_duration")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_time")}</span>
                        <ha-switch
                            .checked=${this._config.show_time ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_time")}
                        ></ha-switch>
                    </div>

                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_weekday")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_weekday")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">Dark Mode</span>
                        <ha-switch
                            .checked=${this._config.dark_mode ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "dark_mode")}
                        ></ha-switch>
                    </div>

                ${this._config.show_weekday ? m`
                    <div class="settings-row">
                        <span class="label" style="color: var(--secondary-text-color);">${x(this.hass, "editor_show_weekday_long")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday_long ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_weekday_long")}
                        ></ha-switch>
                    </div>
                    <div></div>
                ` : ""}

                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_add_event")}</span>
                        <ha-switch
                            .checked=${this._config.show_add_event ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_add_event")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_upcoming")}</span>
                        <ha-switch
                            .checked=${e}
                            @change=${this._calendarShowAllChanged}
                        ></ha-switch>
                    </div>     
                    ${t ? m`
                        <div class="settings-row full-width" style="margin-top: 8px;">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ number: { min: 0, max: 20, mode: "box" } }}
                                .value=${this._config.max_lines || 0}
                                .label=${x(this.hass, "editor_max_lines")}
                                .configValue=${"max_lines"}
                                @value-changed=${this._valueChanged}
                            ></ha-selector>
                        </div>
                    ` : ""}
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "group_by_date")}</span>
                        <ha-switch
                            .checked=${this._config.group_by_date ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "group_by_date")}
                        ></ha-switch>
                    </div>
                </div>

            ${e ? m`
                <div class="settings-row full-width">
                     <span class="label" style="margin-bottom: 8px;">${((h = this.hass) == null ? void 0 : h.localize("ui.panel.lovelace.editor.card.statistic.period")) || "Period"}</span>
                     <div class="period-selectors">
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 365, mode: "box" } }}
                            .value=${a}
                            .label=${((f = this.hass) == null ? void 0 : f.localize("component.input_datetime.entity_component._.state_attributes.day.name")) || "Days"}
                            .configValue=${"days"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 23, mode: "box" } }}
                            .value=${i}
                            .label=${((p = this.hass) == null ? void 0 : p.localize("component.input_datetime.entity_component._.state_attributes.hour.name")) || "Hours"}
                            .configValue=${"hours"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 59, mode: "box" } }}
                            .value=${s}
                            .label=${((b = this.hass) == null ? void 0 : b.localize("component.input_datetime.entity_component._.state_attributes.minute.name")) || "Minutes"}
                            .configValue=${"minutes"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                     </div>
                </div>
            ` : ""}

                <div class="settings-row full-width">
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ ui_color: {} }}
                        .value=${this._config.calendar_icon_color || ""}
                        .label="Global ${this.hass.localize("ui.panel.lovelace.editor.card.tile.color") || "Color"}"
                        .configValue=${"calendar_icon_color"}
                        @value-changed=${this._valueChanged}
                    ></ha-selector>
                </div>

                <div class="settings-row full-width">
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ ui_color: {} }}
                        .value=${this._config.background_color || ""}
                        .label=${x(this.hass, "editor_background_color")}
                        .configValue=${"background_color"}
                        @value-changed=${this._valueChanged}
                    ></ha-selector>
                </div>

                <h4>${((k = this.hass) == null ? void 0 : k.localize("ui.components.calendar.my_calendars")) || "Calendars"}</h4>
                <div class="entities-list">
                    ${(() => {
      const c = this._getCalendarEntities(), g = this._showAllCalendars ? c : c.slice(0, 3), $ = c.length > 3;
      return m`
                            ${g.map((v) => {
        var A, M, P, O, z;
        const w = !o.includes(v.entity_id), y = ((A = this._config.calendar_colors) == null ? void 0 : A[v.entity_id]) || "", C = this._toCssColor(y || this._config.calendar_icon_color || "#fa3e3e");
        return m`
                                    <div class="entity-row ${w ? "" : "disabled"}">
                                        <div class="entity-row-top">
                                            <div class="entity-icon dynamic" style="background: transparent;">
                                                ${this._renderDynamicIcon(/* @__PURE__ */ new Date(), C, this._config.dark_mode ?? !1)}
                                            </div>
                                            <div class="entity-info">
                                                <span class="entity-name">${v.attributes.friendly_name || v.entity_id}</span>
                                                <span class="entity-id">${v.entity_id}</span>
                                            </div>
                                            <ha-button
                                                size="small" 
                                                appearance="filled" 
                                                variant="brand" 
                                                class="${w ? "action-hide" : "action-show"}"
                                                @click=${(j) => this._calendarToggleEntity(j, v.entity_id)}
                                            >
                                                ${w ? ((M = this.hass) == null ? void 0 : M.localize("ui.common.hide")) || "Hide" : ((P = this.hass) == null ? void 0 : P.localize("ui.common.show")) || "Show"}
                                            </ha-button>
                                        </div>
                                        <div class="entity-row-bottom">
                                             <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${y}
                                                .label=${((O = this.hass) == null ? void 0 : O.localize("ui.panel.lovelace.editor.card.tile.color")) || "Color"}
                                                @value-changed=${(j) => this._calendarColorChanged(j, v.entity_id)}
                                            ></ha-selector>
                                            <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${((z = this._config.calendar_background_colors) == null ? void 0 : z[v.entity_id]) || ""}
                                                .label=${x(this.hass, "editor_background_color")}
                                                @value-changed=${(j) => this._calendarBackgroundColorChanged(j, v.entity_id)}
                                            ></ha-selector>
                                        </div>
                                    </div>
                                `;
      })}
                            ${$ ? m`
                                <div class="show-more-row">
                                    <ha-button @click=${() => {
        this._showAllCalendars = !this._showAllCalendars, this.requestUpdate();
      }}>
                                        ${this._showAllCalendars ? x(this.hass, "editor_show_less") : x(this.hass, "editor_show_more")}
                                    </ha-button>
                                </div>
                            ` : ""}
                        `;
    })()}
                </div>
            </div>
        `;
  }
  _getCalendarEntities() {
    return this.hass ? Object.keys(this.hass.states).filter((e) => e.startsWith("calendar.")).map((e) => {
      var t;
      return (t = this.hass) == null ? void 0 : t.states[e];
    }) : [];
  }
  _calendarToggleEntity(e, t) {
    e.stopPropagation();
    const a = [...this._config.exclude_entities ?? []], i = a.indexOf(t);
    i === -1 ? a.push(t) : a.splice(i, 1), this._config = {
      ...this._config,
      exclude_entities: a
    }, N(this, "config-changed", { config: this._config });
  }
  _calendarShowAllChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      upcoming_events: t
    }, N(this, "config-changed", { config: this._config });
  }
  _compactModeChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      unfold_events: t
    }, N(this, "config-changed", { config: this._config });
  }
  _calendarDividerChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      show_divider: t
    }, N(this, "config-changed", { config: this._config });
  }
  _toggleBooleanConfig(e, t) {
    const a = e.target.checked;
    this._config = {
      ...this._config,
      [t]: a
    }, N(this, "config-changed", { config: this._config });
  }
  _valueChanged(e) {
    var o;
    if (!this._config || !this.hass)
      return;
    const a = e.target.configValue;
    if (!a)
      return;
    const i = (o = e.detail) == null ? void 0 : o.value;
    if (this._config[a] === i)
      return;
    const s = { ...this._config };
    i == null || i === "" ? delete s[a] : s[a] = i, this._config = s, N(this, "config-changed", { config: this._config });
  }
  _calendarColorChanged(e, t) {
    const a = e.detail.value, i = { ...this._config.calendar_colors || {} };
    if (a == null || a === "" ? delete i[t] : i[t] = a, Object.keys(i).length === 0) {
      const s = { ...this._config };
      delete s.calendar_colors, this._config = s;
    } else
      this._config = {
        ...this._config,
        calendar_colors: i
      };
    N(this, "config-changed", { config: this._config });
  }
  _calendarBackgroundColorChanged(e, t) {
    const a = e.detail.value, i = { ...this._config.calendar_background_colors || {} };
    if (a == null || a === "" ? delete i[t] : i[t] = a, Object.keys(i).length === 0) {
      const s = { ...this._config };
      delete s.calendar_background_colors, this._config = s;
    } else
      this._config = {
        ...this._config,
        calendar_background_colors: i
      };
    N(this, "config-changed", { config: this._config });
  }
  static get styles() {
    return Ee`
            .card-config {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .ha-select {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--divider-color, #eee);
                background: var(--card-background-color, #fff);
                color: var(--primary-text-color);
                width: 50%;
            }
            .settings-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 32px 16px;
            }
            @media (min-width: 600px) {
                .settings-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            .settings-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }
            .settings-row.full-width {
                flex-direction: column;
                align-items: stretch;
            }
            .settings-row.full-width ha-selector {
                width: 100%;
            }
            .period-selectors {
                display: flex;
                flex-direction: row;
                gap: 8px;
                width: 100%;
            }
            .period-selectors ha-selector {
                 flex: 1;
            }
            .entities-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding-bottom: 12px;
            }
            .show-more-row {
                display: flex;
                justify-content: center;
                margin-top: 8px;
            }
            .entity-row {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px;
                border: 1px solid var(--divider-color, #eee);
                border-radius: 8px;
                transition: opacity 0.2s;
            }
            .entity-row-top {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
            }
            .entity-row-bottom {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .entity-row.disabled {
                opacity: 0.6;
            }
            .entity-icon {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--secondary-text-color);
            }
            .entity-info {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            .entity-name {
                font-weight: 500;
            }
            .entity-id {
                font-size: 0.85em;
                color: var(--secondary-text-color);
            }
            .action-hide {
                --mdc-theme-primary: var(--error-color, #db4437);
            }
            .action-show {
                --mdc-theme-primary: var(--primary-color, #03a9f4);
            }
            h4 {
                margin-bottom: 0px;
                margin-top: 8px;
            }
            ha-textfield {
                width: 100%;
            }
        `;
  }
  _toCssColor(e) {
    return e.startsWith("#") || e.startsWith("rgb") || e.startsWith("hsl") || e.startsWith("var") ? e : `var(--${e}-color)`;
  }
  _renderDynamicIcon(e, t, a = !1) {
    var _, u, h;
    const i = ((u = (_ = this.hass) == null ? void 0 : _.locale) == null ? void 0 : u.language) || ((h = this.hass) == null ? void 0 : h.language) || navigator.language || "en", s = e.toLocaleDateString(i, { month: "short" }).toUpperCase(), o = e.getDate();
    return m`
            <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
                <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${a ? "#222222" : "white"}"></rect>
                <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
                <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${a ? "#222222" : "white"}" text-anchor="middle">${s}</text>
                <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${a ? "white" : "#333"}" text-anchor="middle">${o}</text>
            </svg>
        `;
  }
};
pe([
  B({ attribute: !1 })
], Q.prototype, "hass", 2);
pe([
  ce()
], Q.prototype, "_config", 2);
pe([
  ce()
], Q.prototype, "_showAllCalendars", 2);
Q = pe([
  Te("calendar-card-plus-editor")
], Q);
const Nt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusEditor() {
    return Q;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  de as CalendarCardPlus
};
