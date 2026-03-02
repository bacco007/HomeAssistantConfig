var He = Object.defineProperty;
var Re = (a, e, t) => e in a ? He(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var P = (a, e, t) => Re(a, typeof e != "symbol" ? e + "" : e, t);
var De = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Ie = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
async function Ve(a, e, t, i) {
  const n = encodeURI(`?start=${e.toISOString()}&end=${t.toISOString()}`), s = i.map(async (r) => {
    try {
      const d = await a.callApi("GET", `calendars/${r}${n}`);
      if (!Array.isArray(d))
        throw new Error("Response is not an array");
      return d.map((l) => {
        var x, g, C, z, f, h;
        const _ = ((x = l.start) == null ? void 0 : x.dateTime) || ((g = l.start) == null ? void 0 : g.date) || l.start, v = ((C = l.end) == null ? void 0 : C.dateTime) || ((z = l.end) == null ? void 0 : z.date) || l.end;
        return {
          ...l,
          start: { dateTime: _.includes("T") ? _ : void 0, date: _.includes("T") ? void 0 : _ },
          end: { dateTime: v.includes("T") ? v : void 0, date: v.includes("T") ? void 0 : v },
          summary: l.summary || l.title || "Unknown Event",
          entity_id: r,
          calendar_name: ((h = (f = a.states[r]) == null ? void 0 : f.attributes) == null ? void 0 : h.friendly_name) || r
        };
      });
    } catch {
      const c = a.states[r];
      return c && c.attributes.start_time && c.attributes.end_time ? [{
        start: { dateTime: c.attributes.start_time.replace(" ", "T") },
        end: { dateTime: c.attributes.end_time.replace(" ", "T") },
        summary: c.attributes.message || c.attributes.friendly_name,
        location: c.attributes.location,
        description: c.attributes.description,
        entity_id: r,
        calendar_name: c.attributes.friendly_name || r
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
const ie = globalThis, me = ie.ShadowRoot && (ie.ShadyCSS === void 0 || ie.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ve = Symbol(), ye = /* @__PURE__ */ new WeakMap();
let Me = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ve) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (me && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = ye.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ye.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ke = (a) => new Me(typeof a == "string" ? a : a + "", void 0, ve), Le = (a, ...e) => {
  const t = a.length === 1 ? a[0] : e.reduce((i, n, s) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + a[s + 1], a[0]);
  return new Me(t, a, ve);
}, We = (a, e) => {
  if (me) a.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), n = ie.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = t.cssText, a.appendChild(i);
  }
}, $e = me ? (a) => a : (a) => a instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return Ke(t);
})(a) : a;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: qe, defineProperty: Ze, getOwnPropertyDescriptor: Fe, getOwnPropertyNames: Ye, getOwnPropertySymbols: Ge, getPrototypeOf: Qe } = Object, L = globalThis, xe = L.trustedTypes, Je = xe ? xe.emptyScript : "", re = L.reactiveElementPolyfillSupport, G = (a, e) => a, ne = { toAttribute(a, e) {
  switch (e) {
    case Boolean:
      a = a ? Je : null;
      break;
    case Object:
    case Array:
      a = a == null ? a : JSON.stringify(a);
  }
  return a;
}, fromAttribute(a, e) {
  let t = a;
  switch (e) {
    case Boolean:
      t = a !== null;
      break;
    case Number:
      t = a === null ? null : Number(a);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(a);
      } catch {
        t = null;
      }
  }
  return t;
} }, ge = (a, e) => !qe(a, e), be = { attribute: !0, type: String, converter: ne, reflect: !1, useDefault: !1, hasChanged: ge };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), L.litPropertyMetadata ?? (L.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let I = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = be) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(e, i, t);
      n !== void 0 && Ze(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: n, set: s } = Fe(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: n, set(o) {
      const r = n == null ? void 0 : n.call(this);
      s == null || s.call(this, o), this.requestUpdate(e, r, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? be;
  }
  static _$Ei() {
    if (this.hasOwnProperty(G("elementProperties"))) return;
    const e = Qe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(G("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(G("properties"))) {
      const t = this.properties, i = [...Ye(t), ...Ge(t)];
      for (const n of i) this.createProperty(n, t[n]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, n] of t) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const n = this._$Eu(t, i);
      n !== void 0 && this._$Eh.set(n, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const n of i) t.unshift($e(n));
    } else e !== void 0 && t.push($e(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return We(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostConnected) == null ? void 0 : i.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostDisconnected) == null ? void 0 : i.call(t);
    });
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    var s;
    const i = this.constructor.elementProperties.get(e), n = this.constructor._$Eu(e, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : ne).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var s, o;
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), d = typeof r.converter == "function" ? { fromAttribute: r.converter } : ((s = r.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? r.converter : ne;
      this._$Em = n;
      const c = d.fromAttribute(t, r.type);
      this[n] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(n)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, n = !1, s) {
    var o;
    if (e !== void 0) {
      const r = this.constructor;
      if (n === !1 && (s = this[e]), i ?? (i = r.getPropertyOptions(e)), !((i.hasChanged ?? ge)(s, t) || i.useDefault && i.reflect && s === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(r._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: n, wrapped: s }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), s !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), n === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [s, o] of this._$Ep) this[s] = o;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [s, o] of n) {
        const { wrapped: r } = o, d = this[s];
        r !== !0 || this._$AL.has(s) || d === void 0 || this.C(s, void 0, o, d);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((n) => {
        var s;
        return (s = n.hostUpdate) == null ? void 0 : s.call(n);
      }), this.update(t)) : this._$EM();
    } catch (n) {
      throw e = !1, this._$EM(), n;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((i) => {
      var n;
      return (n = i.hostUpdated) == null ? void 0 : n.call(i);
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
I.elementStyles = [], I.shadowRootOptions = { mode: "open" }, I[G("elementProperties")] = /* @__PURE__ */ new Map(), I[G("finalized")] = /* @__PURE__ */ new Map(), re == null || re({ ReactiveElement: I }), (L.reactiveElementVersions ?? (L.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Q = globalThis, ke = (a) => a, ae = Q.trustedTypes, Ae = ae ? ae.createPolicy("lit-html", { createHTML: (a) => a }) : void 0, je = "$lit$", M = `lit$${Math.random().toFixed(9).slice(2)}$`, Ue = "?" + M, Xe = `<${Ue}>`, B = document, J = () => B.createComment(""), X = (a) => a === null || typeof a != "object" && typeof a != "function", pe = Array.isArray, et = (a) => pe(a) || typeof (a == null ? void 0 : a[Symbol.iterator]) == "function", de = `[ 	
\f\r]`, Y = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ee = /-->/g, Ce = />/g, j = RegExp(`>|${de}(?:([^\\s"'>=/]+)(${de}*=${de}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ze = /'/g, Se = /"/g, Ne = /^(?:script|style|textarea|title)$/i, tt = (a) => (e, ...t) => ({ _$litType$: a, strings: e, values: t }), $ = tt(1), K = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), Pe = /* @__PURE__ */ new WeakMap(), N = B.createTreeWalker(B, 129);
function Oe(a, e) {
  if (!pe(a) || !a.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ae !== void 0 ? Ae.createHTML(e) : e;
}
const it = (a, e) => {
  const t = a.length - 1, i = [];
  let n, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = Y;
  for (let r = 0; r < t; r++) {
    const d = a[r];
    let c, l, _ = -1, v = 0;
    for (; v < d.length && (o.lastIndex = v, l = o.exec(d), l !== null); ) v = o.lastIndex, o === Y ? l[1] === "!--" ? o = Ee : l[1] !== void 0 ? o = Ce : l[2] !== void 0 ? (Ne.test(l[2]) && (n = RegExp("</" + l[2], "g")), o = j) : l[3] !== void 0 && (o = j) : o === j ? l[0] === ">" ? (o = n ?? Y, _ = -1) : l[1] === void 0 ? _ = -2 : (_ = o.lastIndex - l[2].length, c = l[1], o = l[3] === void 0 ? j : l[3] === '"' ? Se : ze) : o === Se || o === ze ? o = j : o === Ee || o === Ce ? o = Y : (o = j, n = void 0);
    const x = o === j && a[r + 1].startsWith("/>") ? " " : "";
    s += o === Y ? d + Xe : _ >= 0 ? (i.push(c), d.slice(0, _) + je + d.slice(_) + M + x) : d + M + (_ === -2 ? r : x);
  }
  return [Oe(a, s + (a[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class ee {
  constructor({ strings: e, _$litType$: t }, i) {
    let n;
    this.parts = [];
    let s = 0, o = 0;
    const r = e.length - 1, d = this.parts, [c, l] = it(e, t);
    if (this.el = ee.createElement(c, i), N.currentNode = this.el.content, t === 2 || t === 3) {
      const _ = this.el.content.firstChild;
      _.replaceWith(..._.childNodes);
    }
    for (; (n = N.nextNode()) !== null && d.length < r; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const _ of n.getAttributeNames()) if (_.endsWith(je)) {
          const v = l[o++], x = n.getAttribute(_).split(M), g = /([.?@])?(.*)/.exec(v);
          d.push({ type: 1, index: s, name: g[2], strings: x, ctor: g[1] === "." ? at : g[1] === "?" ? st : g[1] === "@" ? ot : se }), n.removeAttribute(_);
        } else _.startsWith(M) && (d.push({ type: 6, index: s }), n.removeAttribute(_));
        if (Ne.test(n.tagName)) {
          const _ = n.textContent.split(M), v = _.length - 1;
          if (v > 0) {
            n.textContent = ae ? ae.emptyScript : "";
            for (let x = 0; x < v; x++) n.append(_[x], J()), N.nextNode(), d.push({ type: 2, index: ++s });
            n.append(_[v], J());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Ue) d.push({ type: 2, index: s });
      else {
        let _ = -1;
        for (; (_ = n.data.indexOf(M, _ + 1)) !== -1; ) d.push({ type: 7, index: s }), _ += M.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const i = B.createElement("template");
    return i.innerHTML = e, i;
  }
}
function W(a, e, t = a, i) {
  var o, r;
  if (e === K) return e;
  let n = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const s = X(e) ? void 0 : e._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== s && ((r = n == null ? void 0 : n._$AO) == null || r.call(n, !1), s === void 0 ? n = void 0 : (n = new s(a), n._$AT(a, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = n : t._$Cl = n), n !== void 0 && (e = W(a, n._$AS(a, e.values), n, i)), e;
}
class nt {
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
    const { el: { content: t }, parts: i } = this._$AD, n = ((e == null ? void 0 : e.creationScope) ?? B).importNode(t, !0);
    N.currentNode = n;
    let s = N.nextNode(), o = 0, r = 0, d = i[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let c;
        d.type === 2 ? c = new te(s, s.nextSibling, this, e) : d.type === 1 ? c = new d.ctor(s, d.name, d.strings, this, e) : d.type === 6 && (c = new rt(s, this, e)), this._$AV.push(c), d = i[++r];
      }
      o !== (d == null ? void 0 : d.index) && (s = N.nextNode(), o++);
    }
    return N.currentNode = B, n;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class te {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, n) {
    this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
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
    e = W(this, e, t), X(e) ? e === E || e == null || e === "" ? (this._$AH !== E && this._$AR(), this._$AH = E) : e !== this._$AH && e !== K && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : et(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== E && X(this._$AH) ? this._$AA.nextSibling.data = e : this.T(B.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: t, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = ee.createElement(Oe(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === n) this._$AH.p(t);
    else {
      const o = new nt(n, this), r = o.u(this.options);
      o.p(t), this.T(r), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = Pe.get(e.strings);
    return t === void 0 && Pe.set(e.strings, t = new ee(e)), t;
  }
  k(e) {
    pe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, n = 0;
    for (const s of e) n === t.length ? t.push(i = new te(this.O(J()), this.O(J()), this, this.options)) : i = t[n], i._$AI(s), n++;
    n < t.length && (this._$AR(i && i._$AB.nextSibling, n), t.length = n);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const n = ke(e).nextSibling;
      ke(e).remove(), e = n;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class se {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, n, s) {
    this.type = 1, this._$AH = E, this._$AN = void 0, this.element = e, this.name = t, this._$AM = n, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = E;
  }
  _$AI(e, t = this, i, n) {
    const s = this.strings;
    let o = !1;
    if (s === void 0) e = W(this, e, t, 0), o = !X(e) || e !== this._$AH && e !== K, o && (this._$AH = e);
    else {
      const r = e;
      let d, c;
      for (e = s[0], d = 0; d < s.length - 1; d++) c = W(this, r[i + d], t, d), c === K && (c = this._$AH[d]), o || (o = !X(c) || c !== this._$AH[d]), c === E ? e = E : e !== E && (e += (c ?? "") + s[d + 1]), this._$AH[d] = c;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class at extends se {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === E ? void 0 : e;
  }
}
class st extends se {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== E);
  }
}
class ot extends se {
  constructor(e, t, i, n, s) {
    super(e, t, i, n, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = W(this, e, t, 0) ?? E) === K) return;
    const i = this._$AH, n = e === E && i !== E || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== E && (i === E || n);
    n && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class rt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    W(this, e);
  }
}
const le = Q.litHtmlPolyfillSupport;
le == null || le(ee, te), (Q.litHtmlVersions ?? (Q.litHtmlVersions = [])).push("3.3.2");
const dt = (a, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const s = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = n = new te(e.insertBefore(J(), s), s, void 0, t ?? {});
  }
  return n._$AI(a), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis;
class V extends I {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = dt(t, this.renderRoot, this.renderOptions);
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
    return K;
  }
}
var Te;
V._$litElement$ = !0, V.finalized = !0, (Te = O.litElementHydrateSupport) == null || Te.call(O, { LitElement: V });
const ce = O.litElementPolyfillSupport;
ce == null || ce({ LitElement: V });
(O.litElementVersions ?? (O.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Be = (a) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(a, e);
  }) : customElements.define(a, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = { attribute: !0, type: String, converter: ne, reflect: !1, hasChanged: ge }, ct = (a = lt, e, t) => {
  const { kind: i, metadata: n } = t;
  let s = globalThis.litPropertyMetadata.get(n);
  if (s === void 0 && globalThis.litPropertyMetadata.set(n, s = /* @__PURE__ */ new Map()), i === "setter" && ((a = Object.create(a)).wrapped = !0), s.set(t.name, a), i === "accessor") {
    const { name: o } = t;
    return { set(r) {
      const d = e.get.call(this);
      e.set.call(this, r), this.requestUpdate(o, d, a, !0, r);
    }, init(r) {
      return r !== void 0 && this.C(o, void 0, a, r), r;
    } };
  }
  if (i === "setter") {
    const { name: o } = t;
    return function(r) {
      const d = this[o];
      e.call(this, r), this.requestUpdate(o, d, a, !0, r);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function fe(a) {
  return (e, t) => typeof t == "object" ? ct(a, e, t) : ((i, n, s) => {
    const o = n.hasOwnProperty(s);
    return n.constructor.createProperty(s, i), o ? Object.getOwnPropertyDescriptor(n, s) : void 0;
  })(a, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Z(a) {
  return fe({ ...a, state: !0, attribute: !1 });
}
const R = {
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
    editor_show_less: "Show Less"
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
    editor_show_less: "Weniger anzeigen"
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
    editor_show_less: "Afficher moins"
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
    editor_show_less: "Mostra meno"
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
    editor_show_less: "Mostrar menos"
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
    editor_show_less: "Toon minder"
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
    editor_show_less: "Mostrar menos"
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
    editor_show_less: "Показать меньше"
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
    editor_show_less: "Pokaż mniej"
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
    editor_show_less: "Visa mindre"
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
    editor_show_less: "Vis mindre"
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
    editor_show_less: "Vis mindre"
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
    editor_show_less: "Näytä vähemmän"
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
    editor_show_less: "Zobrazit méně"
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
    editor_show_less: "Kevesebb mutatása"
  }
};
function k(a, e, t, i) {
  var o;
  const n = ((o = a.locale) == null ? void 0 : o.language) || a.language || "en";
  let s;
  if (R[n] && R[n][e])
    s = R[n][e];
  else if (R.en && R.en[e])
    s = R.en[e];
  else
    return e;
  return t && i && (s = s.replace(t, i)), s;
}
function _t(a, e, t) {
  var n, s, o;
  const i = (t == null ? void 0 : t.unfold_events) || !1;
  if (e === void 0)
    return $`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--primary-color, #03a9f4);">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${k(a, "loading")}</div>
                </div>
            </div>
        </div>
        `;
  if (e.length === 0)
    return $`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--disabled-text-color, #bdbdbb);">
                    <ha-icon icon="mdi:calendar-remove"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${k(a, "no_events")}</div>
                </div>
            </div>
        </div>
        `;
  if (!i) {
    const r = e[0], d = e.length - 1, c = r.summary;
    let l, _;
    try {
      if (l = new Date(r.start.dateTime || r.start.date), _ = new Date(r.end.dateTime || r.end.date), isNaN(l.getTime()) || isNaN(_.getTime())) throw new Error("Invalid Date");
    } catch {
      return $`<div class="error">Date Error</div>`;
    }
    const v = /* @__PURE__ */ new Date(), x = !r.start.dateTime;
    let g;
    if (l > v)
      if (t != null && t.show_date) {
        const u = ((n = a.locale) == null ? void 0 : n.language) || a.language || navigator.language, m = l.toLocaleDateString(u, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (x)
          g = m;
        else {
          const y = l.toLocaleTimeString(u, { hour: "2-digit", minute: "2-digit" });
          g = `${m}, ${y}${u.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const u = l.getTime() - v.getTime(), m = Math.ceil(u / 6e4);
        g = ue(a, m);
      }
    else if (x)
      g = a.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const u = ((s = a.locale) == null ? void 0 : s.language) || a.language || navigator.language, m = (y) => y.toLocaleTimeString(u, { hour: "2-digit", minute: "2-digit" });
      g = `${m(l)} - ${m(_)}`;
    }
    if (d > 0 && (g += ` ${k(a, "more_events", "{x}", d.toString())}`), t != null && t.show_weekday) {
      const u = ((o = a.locale) == null ? void 0 : o.language) || a.language || navigator.language, m = l.toLocaleDateString(u, { weekday: t.show_weekday_long ? "long" : "short" });
      g += ` • ${m}`;
    }
    t != null && t.show_calendar_name && r.calendar_name && (g += ` • ${r.calendar_name}`);
    const z = l <= v && _ >= v ? v : l, f = _e(r.entity_id, t), h = he(a, z, f, (t == null ? void 0 : t.dark_mode) ?? !1);
    return $`
            <div class="calendar-container">
                <div class="calendar-item"  
                     title="${c}"
                     @click=${(u) => ut(u, a, e)}>
                     <div class="calendar-icon dynamic">
                        ${h}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${c}</div>
                        <div class="event-time">${g}</div>
                    </div>
                </div>
            </div>
        `;
  }
  return $`
        <div class="calendar-container">
            ${e.map((r, d) => {
    var y, b, p;
    const c = r.summary;
    let l, _;
    try {
      if (l = new Date(r.start.dateTime || r.start.date), _ = new Date(r.end.dateTime || r.end.date), isNaN(l.getTime())) throw new Error("Invalid start date");
      if (isNaN(_.getTime())) throw new Error("Invalid end date");
    } catch {
      return $`<div class="error">Date Error for ${c}</div>`;
    }
    const v = /* @__PURE__ */ new Date(), x = !r.start.dateTime;
    let g, C = -1;
    if (l > v)
      if (t != null && t.show_date) {
        const w = ((y = a.locale) == null ? void 0 : y.language) || a.language || navigator.language, A = l.toLocaleDateString(w, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (x)
          g = A;
        else {
          const S = l.toLocaleTimeString(w, { hour: "2-digit", minute: "2-digit" });
          g = `${A}, ${S}${w.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const w = l.getTime() - v.getTime(), A = Math.ceil(w / 6e4);
        g = ue(a, A);
      }
    else if (x)
      g = a.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const w = ((b = a.locale) == null ? void 0 : b.language) || a.language || navigator.language, A = (T) => T.toLocaleTimeString(w, { hour: "2-digit", minute: "2-digit" });
      g = `${A(l)} - ${A(_)}`;
      const S = _.getTime() - l.getTime(), D = v.getTime() - l.getTime();
      S > 0 && (C = Math.max(0, Math.min(100, D / S * 100)));
    }
    if (t != null && t.show_weekday) {
      const w = ((p = a.locale) == null ? void 0 : p.language) || a.language || navigator.language, A = l.toLocaleDateString(w, { weekday: t.show_weekday_long ? "long" : "short" });
      g += ` • ${A}`;
    }
    t != null && t.show_calendar_name && r.calendar_name && (g += ` • ${r.calendar_name}`);
    const f = l <= v && _ >= v ? v : l, h = _e(r.entity_id, t), u = he(a, f, h, (t == null ? void 0 : t.dark_mode) ?? !1), m = (t == null ? void 0 : t.show_divider) && d > 0 && e[d - 1].entity_id !== r.entity_id;
    return $`
                ${m ? $`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item"  
                     style="margin-bottom: 6px;"
                     title="${c}"
                     @click=${(w) => mt(w, r.entity_id)}>
                     <div class="calendar-icon dynamic">
                        ${u}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${c}</div>
                        <div class="event-time">${g}</div>
                        ${C >= 0 ? $`
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${C}%"></div>
                            </div>
                        ` : ""}
                    </div>
                </div>
                `;
  })}
        </div>
    `;
}
function _e(a, e) {
  var i;
  const t = ((i = e == null ? void 0 : e.calendar_colors) == null ? void 0 : i[a]) || (e == null ? void 0 : e.calendar_icon_color) || "#fa3e3e";
  return ht(t);
}
function ht(a) {
  return a.startsWith("#") || a.startsWith("rgb") || a.startsWith("hsl") || a.startsWith("var") ? a : `var(--${a}-color)`;
}
function ut(a, e, t) {
  const i = new CustomEvent("calendar-card-show-detail", {
    bubbles: !0,
    composed: !0,
    detail: {
      title: k(e, "popup_upcoming_events"),
      entities: t
    }
  });
  a.target.dispatchEvent(i);
}
function mt(a, e) {
  const t = new CustomEvent("hass-more-info", {
    bubbles: !0,
    composed: !0,
    detail: { entityId: e }
  });
  a.target.dispatchEvent(t);
}
function he(a, e, t, i = !1) {
  var l;
  const n = ((l = a.locale) == null ? void 0 : l.language) || a.language || navigator.language, s = e.toLocaleDateString(n, { month: "short" }).toUpperCase(), o = e.getDate();
  return $`
        <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
            <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${i ? "#222222" : "white"}"></rect>
            <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
            <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${i ? "#222222" : "white"}" text-anchor="middle">${s}</text>
            <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${i ? "white" : "#333"}" text-anchor="middle">${o}</text>
        </svg>
    `;
}
function ue(a, e) {
  if (e < 60)
    return e === 1 ? k(a, "starts_in_min", "{x}", e.toString()) : k(a, "starts_in_mins", "{x}", e.toString());
  if (e < 1440) {
    const i = Math.round(e / 60);
    return i === 1 ? k(a, "starts_in_hour", "{x}", i.toString()) : k(a, "starts_in_hours", "{x}", i.toString());
  }
  if (e < 43200) {
    const i = Math.round(e / 1440);
    return i === 1 ? k(a, "starts_in_day", "{x}", i.toString()) : k(a, "starts_in_days", "{x}", i.toString());
  }
  const t = Math.round(e / 10080);
  return t === 1 ? k(a, "starts_in_week", "{x}", t.toString()) : k(a, "starts_in_weeks", "{x}", t.toString());
}
function vt(a, e) {
  const t = Object.keys(a.states).filter((c) => c.startsWith("calendar.")).filter((c) => {
    var l;
    return !((l = e.exclude_entities) != null && l.includes(c));
  }), i = t.length > 0 ? t[0] : void 0, n = /* @__PURE__ */ new Date(), s = new Date(n);
  s.setHours(s.getHours() + 1, 0, 0, 0);
  const o = new Date(s);
  o.setHours(o.getHours() + 1, 0, 0, 0);
  const r = (c) => c.toString().padStart(2, "0"), d = (c) => `${c.getFullYear()}-${r(c.getMonth() + 1)}-${r(c.getDate())} ${r(c.getHours())}:${r(c.getMinutes())}:00`;
  return {
    open: !0,
    calendar_id: i,
    name: "",
    start: d(s),
    end: d(o),
    location: "",
    description: "",
    recurrence: "none",
    all_day: !1
  };
}
async function gt(a, e, t, i) {
  if (!(!e.calendar_id || !e.name || !e.start || !e.end))
    try {
      const n = {
        entity_id: e.calendar_id,
        summary: e.name
      };
      if (e.all_day) {
        const s = e.start.split(" ")[0];
        let o = e.end.split(" ")[0];
        if (s === o) {
          const r = o.split("-"), d = new Date(Number(r[0]), Number(r[1]) - 1, Number(r[2]));
          d.setDate(d.getDate() + 1);
          const c = (l) => l.toString().padStart(2, "0");
          o = `${d.getFullYear()}-${c(d.getMonth() + 1)}-${c(d.getDate())}`;
        }
        n.start_date = s, n.end_date = o;
      } else
        n.start_date_time = e.start, n.end_date_time = e.end, e.location && (n.location = e.location), e.description && (n.description = e.description);
      if (e.recurrence && e.recurrence !== "none") {
        const s = {
          DAILY: "FREQ=DAILY",
          WEEKLY: "FREQ=WEEKLY",
          MONTHLY: "FREQ=MONTHLY",
          YEARLY: "FREQ=YEARLY"
        };
        s[e.recurrence] && (n.rrule = s[e.recurrence]);
      }
      await a.callService("calendar", "create_event", n), t();
    } catch (n) {
      i(n);
    }
}
function pt(a, e, t, i, n, s) {
  var d, c, l, _, v, x, g, C, z, f;
  const o = Object.keys(a.states).filter((h) => h.startsWith("calendar.")).filter((h) => {
    var u;
    return !((u = e.exclude_entities) != null && u.includes(h));
  });
  return $`
        <ha-dialog
            open
            hideActions
            @opened=${(h) => {
    const u = h.target;
    u && setTimeout(() => {
      u.querySelectorAll(".time-selector").forEach((y) => {
        var b, p, w, A;
        try {
          const S = (b = y.shadowRoot) == null ? void 0 : b.querySelector("ha-selector-time"), D = (p = S == null ? void 0 : S.shadowRoot) == null ? void 0 : p.querySelector("ha-time-input"), T = (w = D == null ? void 0 : D.shadowRoot) == null ? void 0 : w.querySelector("ha-base-time-input"), we = (A = T == null ? void 0 : T.shadowRoot) == null ? void 0 : A.querySelector('ha-icon-button[label="clear"], ha-icon-button[title="clear"]');
          we && (we.style.display = "none");
        } catch (S) {
          console.warn("Could not hide clear button", S);
        }
      });
    }, 100);
  }}
            @closed=${n}
            class="add-event-dialog"
        >
            <div class="dialog-header">
                <ha-icon-button .path=${De} @click=${n}></ha-icon-button>
                <h2 class="mdc-dialog__title">${a.localize("ui.components.calendar.event.add") || "Add Event"}</h2>
            </div>
            <div class="dialog-content add-event-form">
                <ha-textfield
                    label=${a.localize("ui.components.calendar.event.summary") || "Title"}
                    .value=${t.name || ""}
                    @input=${(h) => i({ name: h.target.value })}
                    dialogInitialFocus
                ></ha-textfield>

                <ha-textfield
                    label=${a.localize("ui.components.calendar.event.location") || "Location"}
                    .value=${t.location || ""}
                    @input=${(h) => i({ location: h.target.value })}
                ></ha-textfield>

                <ha-textfield
                    label=${a.localize("ui.components.calendar.event.description") || "Description"}
                    .value=${t.description || ""}
                    @input=${(h) => i({ description: h.target.value })}
                ></ha-textfield>

                <ha-select
                    label=${a.localize("ui.components.calendar.my_calendars") || "Calendar"}
                    .value=${t.calendar_id || ""}
                    @change=${(h) => i({ calendar_id: h.target.value })}
                    @closed=${(h) => h.stopPropagation()}
                >
                    ${o.map((h) => {
    var u, m;
    return $`
                        <mwc-list-item value=${h}>
                            ${((m = (u = a.states[h]) == null ? void 0 : u.attributes) == null ? void 0 : m.friendly_name) || h}
                        </mwc-list-item>
                    `;
  })}
                </ha-select>

                <div class="row-flex">
                    <ha-formfield .label=${a.localize("ui.components.calendar.event.all_day") || "All Day"}>
                        <ha-switch
                            .checked=${t.all_day || !1}
                            @change=${(h) => i({ all_day: h.target.checked })}
                        ></ha-switch>
                    </ha-formfield>
                </div>

                <div class="row-label">${a.localize("ui.components.calendar.event.start") || "Start"}:</div>
                <div class="date-row">
                    <ha-selector
                        class="date-selector"
                        .hass=${a}
                        .selector=${{ date: {} }}
                        .required=${!1}
                        .value=${((d = t.start) == null ? void 0 : d.split(" ")[0]) || ""}
                        @value-changed=${(h) => {
    var m;
    const u = ((m = t.start) == null ? void 0 : m.split(" ")[1]) || "00:00:00";
    i({ start: `${h.detail.value} ${u}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((l = (c = t.start) == null ? void 0 : c.split(" ")[1]) == null ? void 0 : l.substring(0, 2)) || "00"}
                            @change=${(h) => {
    var y, b, p;
    const u = ((y = t.start) == null ? void 0 : y.split(" ")[0]) || "", m = ((p = (b = t.start) == null ? void 0 : b.split(" ")[1]) == null ? void 0 : p.substring(3, 5)) || "00";
    i({ start: `${u} ${h.target.value.padStart(2, "0")}:${m}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((v = (_ = t.start) == null ? void 0 : _.split(" ")[1]) == null ? void 0 : v.substring(3, 5)) || "00"}
                            @change=${(h) => {
    var y, b, p;
    const u = ((y = t.start) == null ? void 0 : y.split(" ")[0]) || "", m = ((p = (b = t.start) == null ? void 0 : b.split(" ")[1]) == null ? void 0 : p.substring(0, 2)) || "00";
    i({ start: `${u} ${m}:${h.target.value.padStart(2, "0")}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                    </div>
                </div>
                
                <div class="row-label">${a.localize("ui.components.calendar.event.end") || "End"}:</div>
                <div class="date-row">
                    <ha-selector
                        class="date-selector"
                        .hass=${a}
                        .selector=${{ date: {} }}
                        .required=${!1}
                        .value=${((x = t.end) == null ? void 0 : x.split(" ")[0]) || ""}
                        @value-changed=${(h) => {
    var m;
    const u = ((m = t.end) == null ? void 0 : m.split(" ")[1]) || "00:00:00";
    i({ end: `${h.detail.value} ${u}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((C = (g = t.end) == null ? void 0 : g.split(" ")[1]) == null ? void 0 : C.substring(0, 2)) || "00"}
                            @change=${(h) => {
    var y, b, p;
    const u = ((y = t.end) == null ? void 0 : y.split(" ")[0]) || "", m = ((p = (b = t.end) == null ? void 0 : b.split(" ")[1]) == null ? void 0 : p.substring(3, 5)) || "00";
    i({ end: `${u} ${h.target.value.padStart(2, "0")}:${m}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((f = (z = t.end) == null ? void 0 : z.split(" ")[1]) == null ? void 0 : f.substring(3, 5)) || "00"}
                            @change=${(h) => {
    var y, b, p;
    const u = ((y = t.end) == null ? void 0 : y.split(" ")[0]) || "", m = ((p = (b = t.end) == null ? void 0 : b.split(" ")[1]) == null ? void 0 : p.substring(0, 2)) || "00";
    i({ end: `${u} ${m}:${h.target.value.padStart(2, "0")}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                    </div>
                </div>

                <ha-select
                    label=${a.localize("ui.components.calendar.event.repeat.label") || "Repeat"}
                    .value=${t.recurrence || "none"}
                    @change=${(h) => i({ recurrence: h.target.value })}
                    @closed=${(h) => h.stopPropagation()}
                >
                    <mwc-list-item value="none">${a.localize("ui.components.calendar.event.repeat.freq.none") || "None"}</mwc-list-item>
                    <mwc-list-item value="DAILY">${a.localize("ui.components.calendar.event.repeat.freq.daily") || "Daily"}</mwc-list-item>
                    <mwc-list-item value="WEEKLY">${a.localize("ui.components.calendar.event.repeat.freq.weekly") || "Weekly"}</mwc-list-item>
                    <mwc-list-item value="MONTHLY">${a.localize("ui.components.calendar.event.repeat.freq.monthly") || "Monthly"}</mwc-list-item>
                    <mwc-list-item value="YEARLY">${a.localize("ui.components.calendar.event.repeat.freq.yearly") || "Yearly"}</mwc-list-item>
                </ha-select>

                <div class="dialog-actions">
                    <ha-button @click=${n}>
                        ${a.localize("ui.common.cancel") || "Cancel"}
                    </ha-button>
                    <ha-button elevated @click=${s} ?disabled=${!t.name || !t.calendar_id}>
                        ${a.localize("ui.common.save") || "Save"}
                    </ha-button>
                </div>
            </div>
        </ha-dialog>
    `;
}
var ft = Object.defineProperty, wt = Object.getOwnPropertyDescriptor, F = (a, e, t, i) => {
  for (var n = i > 1 ? void 0 : i ? wt(e, t) : e, s = a.length - 1, o; s >= 0; s--)
    (o = a[s]) && (n = (i ? o(e, t, n) : o(n)) || n);
  return i && n && ft(e, t, n), n;
};
let H = class extends V {
  constructor() {
    super(...arguments);
    P(this, "hass");
    P(this, "config");
    P(this, "_detailPopup", { open: !1, title: "", events: [] });
    P(this, "_addEventPopup", { open: !1 });
    P(this, "_events");
    P(this, "_handleShowDetail", (e) => {
      this._detailPopup = {
        open: !0,
        title: e.detail.title,
        events: e.detail.entities
      }, this.requestUpdate();
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
    const i = Object.keys(this.hass.states).filter((s) => s.startsWith("calendar.")).filter((s) => {
      var o;
      return !((o = this.config.exclude_entities) != null && o.includes(s));
    });
    if (i.length === 0) {
      this._events = [];
      return;
    }
    const n = await Ve(this.hass, e, t, i);
    n.sort((s, o) => {
      const r = new Date(s.start.dateTime || s.start.date).getTime(), d = new Date(o.start.dateTime || o.start.date).getTime();
      return r - d;
    }), this._events = n, this.requestUpdate();
  }
  _closeDetailPopup() {
    this._detailPopup = { ...this._detailPopup, open: !1 }, this.requestUpdate();
  }
  render() {
    if (!this.config || !this.hass)
      return $``;
    const e = _t(this.hass, this._events, this.config);
    return $`
            <ha-card>
                <div class="add-event-btn" @click=${this._openAddEventPopup} style=${this.config.show_add_event ? "" : "display: none;"}>
                    <ha-icon-button .path=${Ie}></ha-icon-button>
                </div>
                ${e}

                ${this._detailPopup.open ? $`
                    <ha-dialog
                        open
                        hideActions
                        @closed=${this._closeDetailPopup}
                        class="detail-dialog"
                    >
                        <div class="dialog-header">
                            <ha-icon-button .path=${De} @click=${this._closeDetailPopup}></ha-icon-button>
                            <h2 class="mdc-dialog__title">${this._detailPopup.title}</h2>
                        </div>
                        <div class="dialog-content">
                            ${this._renderGroupedEntities(this._detailPopup.events)}
                        </div>
                    </ha-dialog>
                ` : ""}

                ${this._addEventPopup.open ? this._renderAddEventDialog() : ""}
            </ha-card>
        `;
  }
  _renderGroupedEntities(e) {
    return e.map((t, i) => {
      var C, z, f, h, u, m, y, b;
      const n = t.summary;
      let s = "", o, r;
      try {
        o = new Date(t.start.dateTime || t.start.date), r = new Date(t.end.dateTime || t.end.date);
      } catch {
        return $`<div class="error">Date Error</div>`;
      }
      const d = /* @__PURE__ */ new Date(), c = !t.start.dateTime;
      if (o > d)
        if ((C = this.config) != null && C.show_date) {
          const p = ((z = this.hass.locale) == null ? void 0 : z.language) || this.hass.language || navigator.language, w = o.toLocaleDateString(p, { day: "2-digit", month: "2-digit", year: "numeric" });
          if (c)
            s = w;
          else {
            const A = o.toLocaleTimeString(p, { hour: "2-digit", minute: "2-digit" });
            s = `${w}, ${A}${p.startsWith("de") ? " Uhr" : ""}`;
          }
        } else {
          const p = o.getTime() - d.getTime(), w = Math.ceil(p / 6e4);
          s = ue(this.hass, w);
        }
      else if (c)
        s = this.hass.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
      else {
        const p = ((f = this.hass.locale) == null ? void 0 : f.language) || this.hass.language || navigator.language, w = (A) => A.toLocaleTimeString(p, { hour: "2-digit", minute: "2-digit" });
        s = `${w(o)} - ${w(r)}`;
      }
      if ((h = this.config) != null && h.show_weekday) {
        const p = ((u = this.hass.locale) == null ? void 0 : u.language) || this.hass.language || navigator.language, w = o.toLocaleDateString(p, { weekday: this.config.show_weekday_long ? "long" : "short" });
        s += ` • ${w}`;
      }
      (m = this.config) != null && m.show_calendar_name && t.calendar_name && (s += ` • ${t.calendar_name}`);
      const _ = o <= d && r >= d ? d : o, v = _e(t.entity_id, this.config), x = he(this.hass, _, v, ((y = this.config) == null ? void 0 : y.dark_mode) ?? !1), g = ((b = this.config) == null ? void 0 : b.show_divider) && i > 0 && e[i - 1].entity_id !== t.entity_id;
      return $`
            ${g ? $`<div class="calendar-divider" style="margin: 0;"></div>` : ""}
            <div class="event-item" @click=${() => this._handleMoreInfo(t.entity_id)}>
                <div class="event-icon dynamic" style="background: transparent;">
                     ${x}
                </div>
                <div class="event-info">
                    <div class="event-name">${n}</div>
                    <div class="event-state">${s}</div>
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
    this.dispatchEvent(t);
  }
  _openAddEventPopup() {
    this._addEventPopup = vt(this.hass, this.config), this.requestUpdate();
  }
  _closeAddEventPopup() {
    this._addEventPopup = { open: !1 }, this.requestUpdate();
  }
  _renderAddEventDialog() {
    return pt(
      this.hass,
      this.config,
      this._addEventPopup,
      (e) => {
        this._addEventPopup = { ...this._addEventPopup, ...e }, this.requestUpdate();
      },
      () => this._closeAddEventPopup(),
      () => this._saveNewEvent()
    );
  }
  async _saveNewEvent() {
    await gt(
      this.hass,
      this._addEventPopup,
      () => {
        this._closeAddEventPopup(), this._events = void 0, this.requestUpdate(), this._fetchEvents();
      },
      (e) => {
        console.error("Failed to create event", e), alert(`Failed to create event: ${e.message || "Unknown error"}`);
      }
    );
  }
  static get styles() {
    return Le`
            :host {
                display: block;
            }
            ha-card {
                height: 100%;
                box-sizing: border-box;
                padding: 12px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            /* Calendar Styles ported from module */
            .calendar-container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
                width: 100%;
            }
            .calendar-item {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
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
                font-size: 12px;
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
                width: 100%;
                border-top: 1px solid var(--divider-color, #e0e0e0);
                margin: 0 0 4px ;
            }

            /* Dialog Styles */
            ha-dialog {
                --mdc-dialog-min-width: 500px;
                --mdc-dialog-max-width: 700px;
                --dialog-content-padding: 16px;
            }

            @media all and (max-width: 450px), all and (max-height: 500px) {
                ha-dialog {
                    --mdc-dialog-min-width: 100vw;
                    --mdc-dialog-max-width: 100vw;
                    --mdc-shape-medium: 0px;
                }
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

            .dialog-header {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: 8px;
                position: sticky;
                top: -16px;
                margin: -16px;
                padding: 16px;
                z-index: 10;
                border-bottom: 1px solid rgba(0, 0, 0, 0.07);
                background: var(--mdc-theme-surface, var(--ha-card-background, #fff));
            }
            h2.mdc-dialog__title {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 500;
            }
            .dialog-content {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 16px;
            }

            .add-event-form {
                gap: 16px;
                padding-top: 8px;
            }
            .add-event-form ha-textfield,
            .add-event-form ha-select,
            .add-event-form ha-selector {
                width: 100%;
                display: block;
            }
            .row-label {
                font-size: 14px;
                font-weight: 500;
                color: var(--primary-text-color);
                margin-bottom: -10px;
                margin-top: 8px;
            }
            .date-row {
                display: flex;
                gap: 16px;
                align-items: flex-end;
                width: 100%;
            }
            .date-row ha-selector.date-selector {
                flex: 1 1 50%;
                min-width: 0;
            }
            .date-row .time-inputs-wrap {
                flex: 1 1 50%;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .date-row ha-selector.time-selector {
                flex: 1;
                min-width: 0;
            }
            /* Hide the clear button (X) inside the time selector */
            .time-selector {
                --mdc-icon-button-size: 0px;
            }
            .dialog-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 8px;
            }

            /* Simple Event Item Styles */
            .event-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background-color: var(--ha-card-background, var(--card-background-color, #fff));
                border: 1px solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .event-item:hover {
                background-color: rgba(var(--rgb-primary-text-color), 0.05);
            }
            .event-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: var(--secondary-background-color);
                color: var(--primary-text-color);
                flex-shrink: 0;
            }
            .event-info {
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow: hidden;
            }
            .event-name {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .event-state {
                font-size: 12px;
                color: var(--secondary-text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
  }
  getCardSize() {
    return 1;
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => xt), document.createElement("calendar-card-plus-editor");
  }
  static getStubConfig(e) {
    return {
      type: "custom:calendar-card-plus",
      exclude_entities: [],
      unfold_events: !1
    };
  }
};
F([
  fe({ attribute: !1 })
], H.prototype, "hass", 2);
F([
  Z()
], H.prototype, "config", 2);
F([
  Z()
], H.prototype, "_detailPopup", 2);
F([
  Z()
], H.prototype, "_addEventPopup", 2);
F([
  Z()
], H.prototype, "_events", 2);
H = F([
  Be("calendar-card-plus")
], H);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-card-plus",
  name: "Dynamic Calendar Card Plus",
  preview: !0,
  description: "A standalone calendar card with dynamic grid styling"
});
const U = (a, e, t, i) => {
  i = i || {}, t = t ?? {};
  const n = new Event(e, {
    bubbles: i.bubbles === void 0 ? !0 : i.bubbles,
    cancelable: !!i.cancelable,
    composed: i.composed === void 0 ? !0 : i.composed
  });
  return n.detail = t, a.dispatchEvent(n), n;
};
var yt = Object.defineProperty, $t = Object.getOwnPropertyDescriptor, oe = (a, e, t, i) => {
  for (var n = i > 1 ? void 0 : i ? $t(e, t) : e, s = a.length - 1, o; s >= 0; s--)
    (o = a[s]) && (n = (i ? o(e, t, n) : o(n)) || n);
  return i && n && yt(e, t, n), n;
};
let q = class extends V {
  constructor() {
    super(...arguments);
    P(this, "hass");
    P(this, "_config", { type: "custom:calendar-card-plus" });
    P(this, "_showAllCalendars", !1);
  }
  set config(e) {
    this.setConfig(e);
  }
  setConfig(e) {
    this._config = e, this.requestUpdate();
  }
  render() {
    var r, d, c, l, _, v, x, g, C, z;
    if (!this.hass)
      return $``;
    const e = this._config.upcoming_events ?? !1, t = this._config.unfold_events ?? !1, i = this._config.days ?? 1, n = this._config.hours ?? 0, s = this._config.minutes ?? 0, o = this._config.exclude_entities ?? [];
    return $`
            <div class="card-config">


                <div class="settings-grid">
                    <div class="settings-row">
                        <span class="label">${k(this.hass, "editor_unfold_events")}</span>
                        <ha-switch
                            .checked=${t}
                            @change=${this._compactModeChanged}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${k(this.hass, "editor_show_divider")}</span>
                        <ha-switch
                            .checked=${this._config.show_divider ?? !1}
                            @change=${this._calendarDividerChanged}
                        ></ha-switch>
                    </div>

                    <div class="settings-row">
                        <span class="label">${(r = this.hass) == null ? void 0 : r.localize("ui.common.show")} ${(d = this.hass) == null ? void 0 : d.localize("component.calendar.entity_component._.name")} ${(c = this.hass) == null ? void 0 : c.localize("ui.common.name")}</span>
                        <ha-switch
                            .checked=${this._config.show_calendar_name ?? !1}
                            @change=${(f) => this._toggleBooleanConfig(f, "show_calendar_name")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${(l = this.hass) == null ? void 0 : l.localize("ui.common.show")} ${((_ = this.hass) == null ? void 0 : _.localize("ui.dialogs.helper_settings.input_datetime.date")) || "Date"}</span>
                        <ha-switch
                            .checked=${this._config.show_date ?? !1}
                            @change=${(f) => this._toggleBooleanConfig(f, "show_date")}
                        ></ha-switch>
                    </div>

                    <div class="settings-row">
                        <span class="label">${k(this.hass, "editor_show_weekday")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday ?? !1}
                            @change=${(f) => this._toggleBooleanConfig(f, "show_weekday")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">Dark Mode</span>
                        <ha-switch
                            .checked=${this._config.dark_mode ?? !1}
                            @change=${(f) => this._toggleBooleanConfig(f, "dark_mode")}
                        ></ha-switch>
                    </div>

                ${this._config.show_weekday ? $`
                    <div class="settings-row">
                        <span class="label" style="color: var(--secondary-text-color);">${k(this.hass, "editor_show_weekday_long")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday_long ?? !1}
                            @change=${(f) => this._toggleBooleanConfig(f, "show_weekday_long")}
                        ></ha-switch>
                    </div>
                    <div></div>
                ` : ""}

                    <div class="settings-row">
                        <span class="label">${k(this.hass, "editor_show_add_event")}</span>
                        <ha-switch
                            .checked=${this._config.show_add_event ?? !1}
                            @change=${(f) => this._toggleBooleanConfig(f, "show_add_event")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${k(this.hass, "editor_show_upcoming")}</span>
                        <ha-switch
                            .checked=${e}
                            @change=${this._calendarShowAllChanged}
                        ></ha-switch>
                    </div>                
                </div>

            ${e ? $`
                <div class="settings-row full-width">
                     <span class="label" style="margin-bottom: 8px;">${((v = this.hass) == null ? void 0 : v.localize("ui.panel.lovelace.editor.card.statistic.period")) || "Period"}</span>
                     <div class="period-selectors">
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 365, mode: "box" } }}
                            .value=${i}
                            .label=${((x = this.hass) == null ? void 0 : x.localize("component.input_datetime.entity_component._.state_attributes.day.name")) || "Days"}
                            .configValue=${"days"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 23, mode: "box" } }}
                            .value=${n}
                            .label=${((g = this.hass) == null ? void 0 : g.localize("component.input_datetime.entity_component._.state_attributes.hour.name")) || "Hours"}
                            .configValue=${"hours"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 59, mode: "box" } }}
                            .value=${s}
                            .label=${((C = this.hass) == null ? void 0 : C.localize("component.input_datetime.entity_component._.state_attributes.minute.name")) || "Minutes"}
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

                <h4>${((z = this.hass) == null ? void 0 : z.localize("ui.components.calendar.my_calendars")) || "Calendars"}</h4>
                <div class="entities-list">
                    ${(() => {
      const f = this._getCalendarEntities(), h = this._showAllCalendars ? f : f.slice(0, 3), u = f.length > 3;
      return $`
                            ${h.map((m) => {
        var w, A, S, D;
        const y = !o.includes(m.entity_id), b = ((w = this._config.calendar_colors) == null ? void 0 : w[m.entity_id]) || "", p = this._toCssColor(b || this._config.calendar_icon_color || "#fa3e3e");
        return $`
                                    <div class="entity-row ${y ? "" : "disabled"}">
                                        <div class="entity-row-top">
                                            <div class="entity-icon dynamic" style="background: transparent;">
                                                ${this._renderDynamicIcon(/* @__PURE__ */ new Date(), p, this._config.dark_mode ?? !1)}
                                            </div>
                                            <div class="entity-info">
                                                <span class="entity-name">${m.attributes.friendly_name || m.entity_id}</span>
                                                <span class="entity-id">${m.entity_id}</span>
                                            </div>
                                            <ha-button
                                                size="small" 
                                                appearance="filled" 
                                                variant="brand" 
                                                class="${y ? "action-hide" : "action-show"}"
                                                @click=${(T) => this._calendarToggleEntity(T, m.entity_id)}
                                            >
                                                ${y ? ((A = this.hass) == null ? void 0 : A.localize("ui.common.hide")) || "Hide" : ((S = this.hass) == null ? void 0 : S.localize("ui.common.show")) || "Show"}
                                            </ha-button>
                                        </div>
                                        <div class="entity-row-bottom">
                                             <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${b}
                                                .label=${((D = this.hass) == null ? void 0 : D.localize("ui.panel.lovelace.editor.card.tile.color")) || "Color"}
                                                @value-changed=${(T) => this._calendarColorChanged(T, m.entity_id)}
                                            ></ha-selector>
                                        </div>
                                    </div>
                                `;
      })}
                            ${u ? $`
                                <div class="show-more-row">
                                    <ha-button @click=${() => {
        this._showAllCalendars = !this._showAllCalendars, this.requestUpdate();
      }}>
                                        ${this._showAllCalendars ? k(this.hass, "editor_show_less") : k(this.hass, "editor_show_more")}
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
    const i = [...this._config.exclude_entities ?? []], n = i.indexOf(t);
    n === -1 ? i.push(t) : i.splice(n, 1), this._config = {
      ...this._config,
      exclude_entities: i
    }, U(this, "config-changed", { config: this._config });
  }
  _calendarShowAllChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      upcoming_events: t
    }, U(this, "config-changed", { config: this._config });
  }
  _compactModeChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      unfold_events: t
    }, U(this, "config-changed", { config: this._config });
  }
  _calendarDividerChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      show_divider: t
    }, U(this, "config-changed", { config: this._config });
  }
  _toggleBooleanConfig(e, t) {
    const i = e.target.checked;
    this._config = {
      ...this._config,
      [t]: i
    }, U(this, "config-changed", { config: this._config });
  }
  _valueChanged(e) {
    var n;
    if (!this._config || !this.hass)
      return;
    const t = e.target, i = ((n = e.detail) == null ? void 0 : n.value) ?? t.value;
    this._config[t.configValue] !== i && t.configValue && (this._config = {
      ...this._config,
      [t.configValue]: i
    }, U(this, "config-changed", { config: this._config }));
  }
  _calendarColorChanged(e, t) {
    const i = e.detail.value, n = this._config.calendar_colors || {};
    this._config = {
      ...this._config,
      calendar_colors: {
        ...n,
        [t]: i
      }
    }, U(this, "config-changed", { config: this._config });
  }
  static get styles() {
    return Le`
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
                grid-template-columns: repeat(2, 1fr);
                gap: 0 16px;
            }
            .settings-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
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
  _renderDynamicIcon(e, t, i = !1) {
    var l, _, v;
    const n = ((_ = (l = this.hass) == null ? void 0 : l.locale) == null ? void 0 : _.language) || ((v = this.hass) == null ? void 0 : v.language) || navigator.language || "en", s = e.toLocaleDateString(n, { month: "short" }).toUpperCase(), o = e.getDate();
    return $`
            <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
                <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${i ? "#222222" : "white"}"></rect>
                <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
                <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${i ? "#222222" : "white"}" text-anchor="middle">${s}</text>
                <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${i ? "white" : "#333"}" text-anchor="middle">${o}</text>
            </svg>
        `;
  }
};
oe([
  fe({ attribute: !1 })
], q.prototype, "hass", 2);
oe([
  Z()
], q.prototype, "_config", 2);
oe([
  Z()
], q.prototype, "_showAllCalendars", 2);
q = oe([
  Be("calendar-card-plus-editor")
], q);
const xt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusEditor() {
    return q;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  H as CalendarCardPlus
};
