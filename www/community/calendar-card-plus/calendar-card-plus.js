var Re = Object.defineProperty;
var Ie = (a, e, t) => e in a ? Re(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var y = (a, e, t) => Ie(a, typeof e != "symbol" ? e + "" : e, t);
var Ve = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
async function Ke(a, e, t, i) {
  const n = encodeURI(`?start=${e.toISOString()}&end=${t.toISOString()}`), s = i.map(async (r) => {
    try {
      const d = await a.callApi("GET", `calendars/${r}${n}`);
      if (!Array.isArray(d))
        throw new Error("Response is not an array");
      return d.map((l) => {
        var f, m, A, E, _, g;
        const h = ((f = l.start) == null ? void 0 : f.dateTime) || ((m = l.start) == null ? void 0 : m.date) || l.start, u = ((A = l.end) == null ? void 0 : A.dateTime) || ((E = l.end) == null ? void 0 : E.date) || l.end;
        return {
          ...l,
          start: { dateTime: h.includes("T") ? h : void 0, date: h.includes("T") ? void 0 : h },
          end: { dateTime: u.includes("T") ? u : void 0, date: u.includes("T") ? void 0 : u },
          summary: l.summary || l.title || "Unknown Event",
          entity_id: r,
          calendar_name: ((g = (_ = a.states[r]) == null ? void 0 : _.attributes) == null ? void 0 : g.friendly_name) || r
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
const ae = globalThis, ge = ae.ShadowRoot && (ae.ShadyCSS === void 0 || ae.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, pe = Symbol(), xe = /* @__PURE__ */ new WeakMap();
let je = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== pe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ge && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = xe.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && xe.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const We = (a) => new je(typeof a == "string" ? a : a + "", void 0, pe), fe = (a, ...e) => {
  const t = a.length === 1 ? a[0] : e.reduce((i, n, s) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + a[s + 1], a[0]);
  return new je(t, a, pe);
}, Ze = (a, e) => {
  if (ge) a.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), n = ae.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = t.cssText, a.appendChild(i);
  }
}, be = ge ? (a) => a : (a) => a instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return We(t);
})(a) : a;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: qe, defineProperty: Fe, getOwnPropertyDescriptor: Ye, getOwnPropertyNames: Ge, getOwnPropertySymbols: Qe, getPrototypeOf: Je } = Object, D = globalThis, ke = D.trustedTypes, Xe = ke ? ke.emptyScript : "", ce = D.reactiveElementPolyfillSupport, F = (a, e) => a, se = { toAttribute(a, e) {
  switch (e) {
    case Boolean:
      a = a ? Xe : null;
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
} }, we = (a, e) => !qe(a, e), Ae = { attribute: !0, type: String, converter: se, reflect: !1, useDefault: !1, hasChanged: we };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), D.litPropertyMetadata ?? (D.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let I = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Ae) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(e, i, t);
      n !== void 0 && Fe(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: n, set: s } = Ye(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Ae;
  }
  static _$Ei() {
    if (this.hasOwnProperty(F("elementProperties"))) return;
    const e = Je(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(F("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(F("properties"))) {
      const t = this.properties, i = [...Ge(t), ...Qe(t)];
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
      for (const n of i) t.unshift(be(n));
    } else e !== void 0 && t.push(be(e));
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
    return Ze(e, this.constructor.elementStyles), e;
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
      const o = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : se).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var s, o;
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), d = typeof r.converter == "function" ? { fromAttribute: r.converter } : ((s = r.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? r.converter : se;
      this._$Em = n;
      const c = d.fromAttribute(t, r.type);
      this[n] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(n)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, n = !1, s) {
    var o;
    if (e !== void 0) {
      const r = this.constructor;
      if (n === !1 && (s = this[e]), i ?? (i = r.getPropertyOptions(e)), !((i.hasChanged ?? we)(s, t) || i.useDefault && i.reflect && s === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(r._$Eu(e, i)))) return;
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
I.elementStyles = [], I.shadowRootOptions = { mode: "open" }, I[F("elementProperties")] = /* @__PURE__ */ new Map(), I[F("finalized")] = /* @__PURE__ */ new Map(), ce == null || ce({ ReactiveElement: I }), (D.reactiveElementVersions ?? (D.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = globalThis, Ce = (a) => a, oe = Y.trustedTypes, Ee = oe ? oe.createPolicy("lit-html", { createHTML: (a) => a }) : void 0, Oe = "$lit$", P = `lit$${Math.random().toFixed(9).slice(2)}$`, Ne = "?" + P, et = `<${Ne}>`, B = document, G = () => B.createComment(""), Q = (a) => a === null || typeof a != "object" && typeof a != "function", ye = Array.isArray, tt = (a) => ye(a) || typeof (a == null ? void 0 : a[Symbol.iterator]) == "function", _e = `[ 	
\f\r]`, q = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ze = /-->/g, Se = />/g, j = RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Te = /'/g, Pe = /"/g, Ue = /^(?:script|style|textarea|title)$/i, it = (a) => (e, ...t) => ({ _$litType$: a, strings: e, values: t }), w = it(1), V = Symbol.for("lit-noChange"), b = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), N = B.createTreeWalker(B, 129);
function He(a, e) {
  if (!ye(a) || !a.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ee !== void 0 ? Ee.createHTML(e) : e;
}
const nt = (a, e) => {
  const t = a.length - 1, i = [];
  let n, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = q;
  for (let r = 0; r < t; r++) {
    const d = a[r];
    let c, l, h = -1, u = 0;
    for (; u < d.length && (o.lastIndex = u, l = o.exec(d), l !== null); ) u = o.lastIndex, o === q ? l[1] === "!--" ? o = ze : l[1] !== void 0 ? o = Se : l[2] !== void 0 ? (Ue.test(l[2]) && (n = RegExp("</" + l[2], "g")), o = j) : l[3] !== void 0 && (o = j) : o === j ? l[0] === ">" ? (o = n ?? q, h = -1) : l[1] === void 0 ? h = -2 : (h = o.lastIndex - l[2].length, c = l[1], o = l[3] === void 0 ? j : l[3] === '"' ? Pe : Te) : o === Pe || o === Te ? o = j : o === ze || o === Se ? o = q : (o = j, n = void 0);
    const f = o === j && a[r + 1].startsWith("/>") ? " " : "";
    s += o === q ? d + et : h >= 0 ? (i.push(c), d.slice(0, h) + Oe + d.slice(h) + P + f) : d + P + (h === -2 ? r : f);
  }
  return [He(a, s + (a[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class J {
  constructor({ strings: e, _$litType$: t }, i) {
    let n;
    this.parts = [];
    let s = 0, o = 0;
    const r = e.length - 1, d = this.parts, [c, l] = nt(e, t);
    if (this.el = J.createElement(c, i), N.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = N.nextNode()) !== null && d.length < r; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const h of n.getAttributeNames()) if (h.endsWith(Oe)) {
          const u = l[o++], f = n.getAttribute(h).split(P), m = /([.?@])?(.*)/.exec(u);
          d.push({ type: 1, index: s, name: m[2], strings: f, ctor: m[1] === "." ? st : m[1] === "?" ? ot : m[1] === "@" ? rt : re }), n.removeAttribute(h);
        } else h.startsWith(P) && (d.push({ type: 6, index: s }), n.removeAttribute(h));
        if (Ue.test(n.tagName)) {
          const h = n.textContent.split(P), u = h.length - 1;
          if (u > 0) {
            n.textContent = oe ? oe.emptyScript : "";
            for (let f = 0; f < u; f++) n.append(h[f], G()), N.nextNode(), d.push({ type: 2, index: ++s });
            n.append(h[u], G());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Ne) d.push({ type: 2, index: s });
      else {
        let h = -1;
        for (; (h = n.data.indexOf(P, h + 1)) !== -1; ) d.push({ type: 7, index: s }), h += P.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const i = B.createElement("template");
    return i.innerHTML = e, i;
  }
}
function K(a, e, t = a, i) {
  var o, r;
  if (e === V) return e;
  let n = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const s = Q(e) ? void 0 : e._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== s && ((r = n == null ? void 0 : n._$AO) == null || r.call(n, !1), s === void 0 ? n = void 0 : (n = new s(a), n._$AT(a, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = n : t._$Cl = n), n !== void 0 && (e = K(a, n._$AS(a, e.values), n, i)), e;
}
class at {
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
        d.type === 2 ? c = new ee(s, s.nextSibling, this, e) : d.type === 1 ? c = new d.ctor(s, d.name, d.strings, this, e) : d.type === 6 && (c = new dt(s, this, e)), this._$AV.push(c), d = i[++r];
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
class ee {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, n) {
    this.type = 2, this._$AH = b, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
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
    e = K(this, e, t), Q(e) ? e === b || e == null || e === "" ? (this._$AH !== b && this._$AR(), this._$AH = b) : e !== this._$AH && e !== V && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : tt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== b && Q(this._$AH) ? this._$AA.nextSibling.data = e : this.T(B.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: t, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = J.createElement(He(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === n) this._$AH.p(t);
    else {
      const o = new at(n, this), r = o.u(this.options);
      o.p(t), this.T(r), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = De.get(e.strings);
    return t === void 0 && De.set(e.strings, t = new J(e)), t;
  }
  k(e) {
    ye(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, n = 0;
    for (const s of e) n === t.length ? t.push(i = new ee(this.O(G()), this.O(G()), this, this.options)) : i = t[n], i._$AI(s), n++;
    n < t.length && (this._$AR(i && i._$AB.nextSibling, n), t.length = n);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const n = Ce(e).nextSibling;
      Ce(e).remove(), e = n;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class re {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, n, s) {
    this.type = 1, this._$AH = b, this._$AN = void 0, this.element = e, this.name = t, this._$AM = n, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = b;
  }
  _$AI(e, t = this, i, n) {
    const s = this.strings;
    let o = !1;
    if (s === void 0) e = K(this, e, t, 0), o = !Q(e) || e !== this._$AH && e !== V, o && (this._$AH = e);
    else {
      const r = e;
      let d, c;
      for (e = s[0], d = 0; d < s.length - 1; d++) c = K(this, r[i + d], t, d), c === V && (c = this._$AH[d]), o || (o = !Q(c) || c !== this._$AH[d]), c === b ? e = b : e !== b && (e += (c ?? "") + s[d + 1]), this._$AH[d] = c;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === b ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class st extends re {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === b ? void 0 : e;
  }
}
class ot extends re {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== b);
  }
}
class rt extends re {
  constructor(e, t, i, n, s) {
    super(e, t, i, n, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = K(this, e, t, 0) ?? b) === V) return;
    const i = this._$AH, n = e === b && i !== b || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== b && (i === b || n);
    n && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class dt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    K(this, e);
  }
}
const he = Y.litHtmlPolyfillSupport;
he == null || he(J, ee), (Y.litHtmlVersions ?? (Y.litHtmlVersions = [])).push("3.3.2");
const lt = (a, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const s = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = n = new ee(e.insertBefore(G(), s), s, void 0, t ?? {});
  }
  return n._$AI(a), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const U = globalThis;
class H extends I {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = lt(t, this.renderRoot, this.renderOptions);
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
    return V;
  }
}
var Le;
H._$litElement$ = !0, H.finalized = !0, (Le = U.litElementHydrateSupport) == null || Le.call(U, { LitElement: H });
const ue = U.litElementPolyfillSupport;
ue == null || ue({ LitElement: H });
(U.litElementVersions ?? (U.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $e = (a) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(a, e);
  }) : customElements.define(a, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = { attribute: !0, type: String, converter: se, reflect: !1, hasChanged: we }, _t = (a = ct, e, t) => {
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
function T(a) {
  return (e, t) => typeof t == "object" ? _t(a, e, t) : ((i, n, s) => {
    const o = n.hasOwnProperty(s);
    return n.constructor.createProperty(s, i), o ? Object.getOwnPropertyDescriptor(n, s) : void 0;
  })(a, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function te(a) {
  return T({ ...a, state: !0, attribute: !1 });
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
function x(a, e, t, i) {
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
function ht(a, e, t) {
  var n, s, o;
  const i = (t == null ? void 0 : t.unfold_events) || !1;
  if (e === void 0)
    return w`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--primary-color, #03a9f4);">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${x(a, "loading")}</div>
                </div>
            </div>
        </div>
        `;
  if (e.length === 0)
    return w`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--disabled-text-color, #bdbdbb);">
                    <ha-icon icon="mdi:calendar-remove"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${x(a, "no_events")}</div>
                </div>
            </div>
        </div>
        `;
  if (!i) {
    const r = e[0], d = e.length - 1, c = r.summary;
    let l, h;
    try {
      if (l = new Date(r.start.dateTime || r.start.date), h = new Date(r.end.dateTime || r.end.date), isNaN(l.getTime()) || isNaN(h.getTime())) throw new Error("Invalid Date");
    } catch {
      return w`<div class="error">Date Error</div>`;
    }
    const u = /* @__PURE__ */ new Date(), f = !r.start.dateTime;
    let m;
    if (l > u)
      if (t != null && t.show_date) {
        const v = ((n = a.locale) == null ? void 0 : n.language) || a.language || navigator.language, p = l.toLocaleDateString(v, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (f)
          m = p;
        else {
          const $ = l.toLocaleTimeString(v, { hour: "2-digit", minute: "2-digit" });
          m = `${p}, ${$}${v.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const v = l.getTime() - u.getTime(), p = Math.ceil(v / 6e4);
        m = Me(a, p);
      }
    else if (f)
      m = a.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const v = ((s = a.locale) == null ? void 0 : s.language) || a.language || navigator.language, p = ($) => $.toLocaleTimeString(v, { hour: "2-digit", minute: "2-digit" });
      m = `${p(l)} - ${p(h)}`;
    }
    if (d > 0 && (m += ` ${x(a, "more_events", "{x}", d.toString())}`), t != null && t.show_weekday) {
      const v = ((o = a.locale) == null ? void 0 : o.language) || a.language || navigator.language, p = l.toLocaleDateString(v, { weekday: t.show_weekday_long ? "long" : "short" });
      m += ` • ${p}`;
    }
    t != null && t.show_calendar_name && r.calendar_name && (m += ` • ${r.calendar_name}`);
    const E = l <= u && h >= u ? u : l, _ = ve(r.entity_id, t), g = me(a, E, _, (t == null ? void 0 : t.dark_mode) ?? !1);
    return w`
            <div class="calendar-container">
                <div class="calendar-item"  
                     title="${c}"
                     @click=${(v) => vt(v, a, e)}>
                     <div class="calendar-icon dynamic">
                        ${g}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${c}</div>
                        <div class="event-time">${m}</div>
                    </div>
                </div>
            </div>
        `;
  }
  return w`
        <div class="calendar-container">
            ${e.map((r, d) => {
    var $, k, ie;
    const c = r.summary;
    let l, h;
    try {
      if (l = new Date(r.start.dateTime || r.start.date), h = new Date(r.end.dateTime || r.end.date), isNaN(l.getTime())) throw new Error("Invalid start date");
      if (isNaN(h.getTime())) throw new Error("Invalid end date");
    } catch {
      return w`<div class="error">Date Error for ${c}</div>`;
    }
    const u = /* @__PURE__ */ new Date(), f = !r.start.dateTime;
    let m, A = -1;
    if (l > u)
      if (t != null && t.show_date) {
        const C = (($ = a.locale) == null ? void 0 : $.language) || a.language || navigator.language, z = l.toLocaleDateString(C, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (f)
          m = z;
        else {
          const L = l.toLocaleTimeString(C, { hour: "2-digit", minute: "2-digit" });
          m = `${z}, ${L}${C.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const C = l.getTime() - u.getTime(), z = Math.ceil(C / 6e4);
        m = Me(a, z);
      }
    else if (f)
      m = a.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const C = ((k = a.locale) == null ? void 0 : k.language) || a.language || navigator.language, z = (Z) => Z.toLocaleTimeString(C, { hour: "2-digit", minute: "2-digit" });
      m = `${z(l)} - ${z(h)}`;
      const L = h.getTime() - l.getTime(), ne = u.getTime() - l.getTime();
      L > 0 && (A = Math.max(0, Math.min(100, ne / L * 100)));
    }
    if (t != null && t.show_weekday) {
      const C = ((ie = a.locale) == null ? void 0 : ie.language) || a.language || navigator.language, z = l.toLocaleDateString(C, { weekday: t.show_weekday_long ? "long" : "short" });
      m += ` • ${z}`;
    }
    t != null && t.show_calendar_name && r.calendar_name && (m += ` • ${r.calendar_name}`);
    const _ = l <= u && h >= u ? u : l, g = ve(r.entity_id, t), v = me(a, _, g, (t == null ? void 0 : t.dark_mode) ?? !1), p = (t == null ? void 0 : t.show_divider) && d > 0 && e[d - 1].entity_id !== r.entity_id;
    return w`
                ${p ? w`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item"  
                     style="margin-bottom: 6px;"
                     title="${c}"
                     @click=${(C) => mt(C, r.entity_id)}>
                     <div class="calendar-icon dynamic">
                        ${v}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${c}</div>
                        <div class="event-time">${m}</div>
                        ${A >= 0 ? w`
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${A}%"></div>
                            </div>
                        ` : ""}
                    </div>
                </div>
                `;
  })}
        </div>
    `;
}
function ve(a, e) {
  var i;
  const t = ((i = e == null ? void 0 : e.calendar_colors) == null ? void 0 : i[a]) || (e == null ? void 0 : e.calendar_icon_color) || "#fa3e3e";
  return ut(t);
}
function ut(a) {
  return a.startsWith("#") || a.startsWith("rgb") || a.startsWith("hsl") || a.startsWith("var") ? a : `var(--${a}-color)`;
}
function vt(a, e, t) {
  const i = new CustomEvent("calendar-card-show-detail", {
    bubbles: !0,
    composed: !0,
    detail: {
      title: x(e, "popup_upcoming_events"),
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
function me(a, e, t, i = !1) {
  var l;
  const n = ((l = a.locale) == null ? void 0 : l.language) || a.language || navigator.language, s = e.toLocaleDateString(n, { month: "short" }).toUpperCase(), o = e.getDate();
  return w`
        <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
            <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${i ? "#222222" : "white"}"></rect>
            <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
            <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${i ? "#222222" : "white"}" text-anchor="middle">${s}</text>
            <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${i ? "white" : "#333"}" text-anchor="middle">${o}</text>
        </svg>
    `;
}
function Me(a, e) {
  if (e < 60)
    return e === 1 ? x(a, "starts_in_min", "{x}", e.toString()) : x(a, "starts_in_mins", "{x}", e.toString());
  if (e < 1440) {
    const i = Math.round(e / 60);
    return i === 1 ? x(a, "starts_in_hour", "{x}", i.toString()) : x(a, "starts_in_hours", "{x}", i.toString());
  }
  if (e < 43200) {
    const i = Math.round(e / 1440);
    return i === 1 ? x(a, "starts_in_day", "{x}", i.toString()) : x(a, "starts_in_days", "{x}", i.toString());
  }
  const t = Math.round(e / 10080);
  return t === 1 ? x(a, "starts_in_week", "{x}", t.toString()) : x(a, "starts_in_weeks", "{x}", t.toString());
}
function gt(a, e) {
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
async function pt(a, e, t, i) {
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
function ft(a, e, t, i, n, s) {
  var r, d, c, l, h, u, f, m, A, E;
  const o = Object.keys(a.states).filter((_) => _.startsWith("calendar.")).filter((_) => {
    var g;
    return !((g = e.exclude_entities) != null && g.includes(_));
  });
  return w`
        <div class="add-event-form">
            <ha-textfield
                    label=${a.localize("ui.components.calendar.event.summary") || "Title"}
                    .value=${t.name || ""}
                    @input=${(_) => i({ name: _.target.value })}
                    dialogInitialFocus
                ></ha-textfield>

                <ha-textfield
                    label=${a.localize("ui.components.calendar.event.location") || "Location"}
                    .value=${t.location || ""}
                    @input=${(_) => i({ location: _.target.value })}
                ></ha-textfield>

                <ha-textfield
                    label=${a.localize("ui.components.calendar.event.description") || "Description"}
                    .value=${t.description || ""}
                    @input=${(_) => i({ description: _.target.value })}
                ></ha-textfield>

                <ha-selector
                    .hass=${a}
                    .selector=${{ select: { options: o.map((_) => {
    var g, v;
    return { value: _, label: ((v = (g = a.states[_]) == null ? void 0 : g.attributes) == null ? void 0 : v.friendly_name) || _ };
  }) } }}
                    .value=${t.calendar_id}
                    .label=${a.localize("ui.components.calendar.my_calendars") || "Calendar"}
                    @value-changed=${(_) => i({ calendar_id: _.detail.value })}
                ></ha-selector>

                <div class="row-flex">
                    <ha-formfield .label=${a.localize("ui.components.calendar.event.all_day") || "All Day"}>
                        <ha-switch
                            .checked=${t.all_day || !1}
                            @change=${(_) => i({ all_day: _.target.checked })}
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
                        .value=${((r = t.start) == null ? void 0 : r.split(" ")[0]) || ""}
                        @value-changed=${(_) => {
    var v;
    const g = ((v = t.start) == null ? void 0 : v.split(" ")[1]) || "00:00:00";
    i({ start: `${_.detail.value} ${g}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((c = (d = t.start) == null ? void 0 : d.split(" ")[1]) == null ? void 0 : c.substring(0, 2)) || "00"}
                            @change=${(_) => {
    var p, $, k;
    const g = ((p = t.start) == null ? void 0 : p.split(" ")[0]) || "", v = ((k = ($ = t.start) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : k.substring(3, 5)) || "00";
    i({ start: `${g} ${_.target.value.padStart(2, "0")}:${v}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((h = (l = t.start) == null ? void 0 : l.split(" ")[1]) == null ? void 0 : h.substring(3, 5)) || "00"}
                            @change=${(_) => {
    var p, $, k;
    const g = ((p = t.start) == null ? void 0 : p.split(" ")[0]) || "", v = ((k = ($ = t.start) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : k.substring(0, 2)) || "00";
    i({ start: `${g} ${v}:${_.target.value.padStart(2, "0")}:00` });
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
                        .value=${((u = t.end) == null ? void 0 : u.split(" ")[0]) || ""}
                        @value-changed=${(_) => {
    var v;
    const g = ((v = t.end) == null ? void 0 : v.split(" ")[1]) || "00:00:00";
    i({ end: `${_.detail.value} ${g}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((m = (f = t.end) == null ? void 0 : f.split(" ")[1]) == null ? void 0 : m.substring(0, 2)) || "00"}
                            @change=${(_) => {
    var p, $, k;
    const g = ((p = t.end) == null ? void 0 : p.split(" ")[0]) || "", v = ((k = ($ = t.end) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : k.substring(3, 5)) || "00";
    i({ end: `${g} ${_.target.value.padStart(2, "0")}:${v}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((E = (A = t.end) == null ? void 0 : A.split(" ")[1]) == null ? void 0 : E.substring(3, 5)) || "00"}
                            @change=${(_) => {
    var p, $, k;
    const g = ((p = t.end) == null ? void 0 : p.split(" ")[0]) || "", v = ((k = ($ = t.end) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : k.substring(0, 2)) || "00";
    i({ end: `${g} ${v}:${_.target.value.padStart(2, "0")}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                    </div>
                </div>

                <ha-selector
                    .hass=${a}
                    .selector=${{ select: {
    options: [
      { value: "none", label: a.localize("ui.components.calendar.event.repeat.freq.none") || "None" },
      { value: "DAILY", label: a.localize("ui.components.calendar.event.repeat.freq.daily") || "Daily" },
      { value: "WEEKLY", label: a.localize("ui.components.calendar.event.repeat.freq.weekly") || "Weekly" },
      { value: "MONTHLY", label: a.localize("ui.components.calendar.event.repeat.freq.monthly") || "Monthly" },
      { value: "YEARLY", label: a.localize("ui.components.calendar.event.repeat.freq.yearly") || "Yearly" }
    ],
    mode: "dropdown"
  } }}
                    .value=${t.recurrence || "none"}
                    .label=${a.localize("ui.components.calendar.event.repeat.label") || "Repeat"}
                    @value-changed=${(_) => i({ recurrence: _.detail.value })}
                ></ha-selector>

                <div class="dialog-actions">
                    <ha-button @click=${n}>
                        ${a.localize("ui.common.cancel") || "Cancel"}
                    </ha-button>
                    <ha-button
                        unelevated
                        @click=${s}
                        ?disabled=${!t.name || !t.calendar_id}
                    >
                        ${a.localize("ui.common.save") || "Save"}
                    </ha-button>
                </div>
        </div>
    `;
}
var Be = Object.defineProperty, wt = Object.getOwnPropertyDescriptor, yt = (a, e, t) => e in a ? Be(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t, M = (a, e, t, i) => {
  for (var n = i > 1 ? void 0 : i ? wt(e, t) : e, s = a.length - 1, o; s >= 0; s--)
    (o = a[s]) && (n = (i ? o(e, t, n) : o(n)) || n);
  return i && n && Be(e, t, n), n;
}, $t = (a, e, t) => yt(a, e + "", t);
let S = class extends H {
  constructor() {
    super(...arguments);
    y(this, "hass");
    y(this, "config");
    y(this, "open", !1);
    y(this, "mode", "detail");
    y(this, "detailTitle", "");
    y(this, "detailEvents", []);
    y(this, "_addEventState", { open: !1 });
    y(this, "_opener", null);
    y(this, "_onPopState", (e) => {
      var t;
      this.open && !((t = window.history.state) != null && t.calendarCardPlusPopup) && this._close();
    });
    y(this, "_close", () => {
      if (!this.open) return;
      this.open = !1, this.requestUpdate();
      const e = { dialog: this };
      this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("popup-closed", { bubbles: !0, composed: !0, detail: e }));
    });
    // Guard: only close if event originates from ha-adaptive-dialog itself, not from child elements
    y(this, "_onDialogClosed", (e) => {
      var t;
      if (e && e.type !== "click") {
        const i = e.target;
        if (i && i.tagName !== "HA-ADAPTIVE-DIALOG" && i.tagName !== "HA-DIALOG")
          return;
      }
      this._close(), (t = window.history.state) != null && t.calendarCardPlusPopup && window.history.back();
    });
    y(this, "_closeDialog", () => {
      var e;
      this.open && (this._close(), (e = window.history.state) != null && e.calendarCardPlusPopup && window.history.back());
    });
  }
  async showDialog(e) {
    this.hass = e.hass, this.config = e.config, this._opener = e.opener, this.mode = e.mode, e.title && (this.detailTitle = e.title), e.events && (this.detailEvents = e.events), e.addEventState && (this._addEventState = e.addEventState), this.open = !0, window.history.pushState({ calendarCardPlusPopup: !0 }, ""), this.requestUpdate(), await this.updateComplete;
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
    await pt(
      this.hass,
      this._addEventState,
      () => {
        this.dispatchEvent(new CustomEvent("event-saved", { bubbles: !0, composed: !0 })), this._closeDialog();
      },
      (e) => {
        alert("Error saving event: " + e.message);
      }
    );
  }
  render() {
    var i;
    const e = this.mode === "add-event", t = e ? ((i = this.hass) == null ? void 0 : i.localize("ui.components.calendar.event.add")) || "Add Event" : this.detailTitle;
    return w`
            <ha-adaptive-dialog
                .hass=${this.hass}
                .open=${this.open}
                .headerTitle=${t}
                @closed=${this._onDialogClosed}
                @ha-dialog-closed=${this._onDialogClosed}
                flexcontent
            >
                <div class="dialog-content scrollable ha-scrollbar">
                    ${e ? ft(
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
    return this.detailEvents.map((e, t) => {
      var m, A, E;
      const i = e.summary;
      let n = "", s, o;
      try {
        s = new Date(e.start.dateTime || e.start.date), o = new Date(e.end.dateTime || e.end.date);
      } catch {
        return w`<div class="error">Date Error</div>`;
      }
      const r = /* @__PURE__ */ new Date(), d = !e.start.dateTime;
      if (s > r) {
        const _ = ((m = this.hass.locale) == null ? void 0 : m.language) || this.hass.language || navigator.language, g = s.toLocaleDateString(_, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (d)
          n = g;
        else {
          const v = s.toLocaleTimeString(_, { hour: "2-digit", minute: "2-digit" });
          n = `${g}, ${v}${_.startsWith("de") ? " Uhr" : ""}`;
        }
      } else if (d)
        n = this.hass.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
      else {
        const _ = ((A = this.hass.locale) == null ? void 0 : A.language) || this.hass.language || navigator.language, g = (v) => v.toLocaleTimeString(_, { hour: "2-digit", minute: "2-digit" });
        n = `${g(s)} - ${g(o)}`;
      }
      if (this.config.show_weekday) {
        const _ = ((E = this.hass.locale) == null ? void 0 : E.language) || this.hass.language || navigator.language, g = s.toLocaleDateString(_, { weekday: "short" });
        n += ` • ${g}`;
      }
      this.config.show_calendar_name && e.calendar_name && (n += ` • ${e.calendar_name}`);
      const l = s <= r && o >= r ? r : s, h = ve(e.entity_id, this.config), u = me(this.hass, l, h, this.config.dark_mode ?? !1), f = this.config.show_divider && t > 0;
      return w`
                ${f ? w`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item detail" @click=${() => this._handleMoreInfo(e.entity_id)}>
                    <div class="calendar-icon dynamic">
                        ${u}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${i}</div>
                        <div class="event-time">${n}</div>
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
$t(S, "styles", fe`
        :host {
            display: block;
        }

        ha-adaptive-dialog {
            --dialog-content-padding: 0px 12px 12px;
            --ha-dialog-max-width: 96vw !important;
            --ha-bottom-sheet-height: calc(100dvh - max(var(--safe-area-inset-top), 48px));
            --ha-bottom-sheet-max-height: var(--ha-bottom-sheet-height);
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
            font-size: 0.9em;
            color: var(--secondary-text-color);
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

        .row-label {
            font-weight: 500;
            margin-bottom: -8px;
        }
    `);
M([
  T({ attribute: !1 })
], S.prototype, "hass", 2);
M([
  T({ attribute: !1 })
], S.prototype, "config", 2);
M([
  T({ type: Boolean })
], S.prototype, "open", 2);
M([
  T({ type: String })
], S.prototype, "mode", 2);
M([
  T({ type: String })
], S.prototype, "detailTitle", 2);
M([
  T({ type: Array })
], S.prototype, "detailEvents", 2);
M([
  te()
], S.prototype, "_addEventState", 2);
S = M([
  $e("calendar-card-plus-popup")
], S);
var xt = Object.defineProperty, bt = Object.getOwnPropertyDescriptor, de = (a, e, t, i) => {
  for (var n = i > 1 ? void 0 : i ? bt(e, t) : e, s = a.length - 1, o; s >= 0; s--)
    (o = a[s]) && (n = (i ? o(e, t, n) : o(n)) || n);
  return i && n && xt(e, t, n), n;
};
let X = class extends H {
  constructor() {
    super(...arguments);
    y(this, "hass");
    y(this, "config");
    y(this, "_events");
    y(this, "_popup", null);
    y(this, "_handleShowDetail", async (e) => {
      this._popup && await this._popup.showDialog({
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "detail",
        title: e.detail.title,
        events: e.detail.entities
      });
    });
    y(this, "_openAddEventPopup", async () => {
      if (this._popup) {
        const e = gt(this.hass, this.config);
        await this._popup.showDialog({
          hass: this.hass,
          config: this.config,
          opener: this,
          mode: "add-event",
          addEventState: e
        });
      }
    });
    y(this, "_onEventSaved", () => {
      this._events = void 0, this.requestUpdate(), this._fetchEvents();
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("calendar-card-show-detail", this._handleShowDetail), this._popup || (this._popup = document.createElement("calendar-card-plus-popup"), this._popup.addEventListener("event-saved", this._onEventSaved), document.body.appendChild(this._popup));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("calendar-card-show-detail", this._handleShowDetail), this._popup && (this._popup.removeEventListener("event-saved", this._onEventSaved), this._popup.remove(), this._popup = null);
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
    const n = await Ke(this.hass, e, t, i);
    n.sort((s, o) => {
      const r = new Date(s.start.dateTime || s.start.date).getTime(), d = new Date(o.start.dateTime || o.start.date).getTime();
      return r - d;
    }), this._events = n, this.requestUpdate();
  }
  render() {
    if (!this.config || !this.hass)
      return w``;
    const e = ht(this.hass, this._events, this.config);
    return w`
            <ha-card>
                <div class="add-event-btn" @click=${this._openAddEventPopup} style=${this.config.show_add_event ? "" : "display: none;"}>
                    <ha-icon-button .path=${Ve}></ha-icon-button>
                </div>
                ${e}
            </ha-card>
        `;
  }
  static get styles() {
    return fe`
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
        `;
  }
  getCardSize() {
    return 1;
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => Ct), document.createElement("calendar-card-plus-editor");
  }
  static getStubConfig(e) {
    return {
      type: "custom:calendar-card-plus",
      exclude_entities: [],
      unfold_events: !1
    };
  }
};
de([
  T({ attribute: !1 })
], X.prototype, "hass", 2);
de([
  te()
], X.prototype, "config", 2);
de([
  te()
], X.prototype, "_events", 2);
X = de([
  $e("calendar-card-plus")
], X);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-card-plus",
  name: "Dynamic Calendar Card Plus",
  preview: !0,
  description: "A standalone calendar card with dynamic grid styling"
});
const O = (a, e, t, i) => {
  i = i || {}, t = t ?? {};
  const n = new Event(e, {
    bubbles: i.bubbles === void 0 ? !0 : i.bubbles,
    cancelable: !!i.cancelable,
    composed: i.composed === void 0 ? !0 : i.composed
  });
  return n.detail = t, a.dispatchEvent(n), n;
};
var kt = Object.defineProperty, At = Object.getOwnPropertyDescriptor, le = (a, e, t, i) => {
  for (var n = i > 1 ? void 0 : i ? At(e, t) : e, s = a.length - 1, o; s >= 0; s--)
    (o = a[s]) && (n = (i ? o(e, t, n) : o(n)) || n);
  return i && n && kt(e, t, n), n;
};
let W = class extends H {
  constructor() {
    super(...arguments);
    y(this, "hass");
    y(this, "_config", { type: "custom:calendar-card-plus" });
    y(this, "_showAllCalendars", !1);
  }
  set config(e) {
    this.setConfig(e);
  }
  setConfig(e) {
    this._config = e, this.requestUpdate();
  }
  render() {
    var r, d, c, l, h, u, f, m, A, E;
    if (!this.hass)
      return w``;
    const e = this._config.upcoming_events ?? !1, t = this._config.unfold_events ?? !1, i = this._config.days ?? 1, n = this._config.hours ?? 0, s = this._config.minutes ?? 0, o = this._config.exclude_entities ?? [];
    return w`
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
                        <span class="label">${(r = this.hass) == null ? void 0 : r.localize("ui.common.show")} ${(d = this.hass) == null ? void 0 : d.localize("component.calendar.entity_component._.name")} ${(c = this.hass) == null ? void 0 : c.localize("ui.common.name")}</span>
                        <ha-switch
                            .checked=${this._config.show_calendar_name ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "show_calendar_name")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${(l = this.hass) == null ? void 0 : l.localize("ui.common.show")} ${((h = this.hass) == null ? void 0 : h.localize("ui.dialogs.helper_settings.input_datetime.date")) || "Date"}</span>
                        <ha-switch
                            .checked=${this._config.show_date ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "show_date")}
                        ></ha-switch>
                    </div>

                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_weekday")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "show_weekday")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">Dark Mode</span>
                        <ha-switch
                            .checked=${this._config.dark_mode ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "dark_mode")}
                        ></ha-switch>
                    </div>

                ${this._config.show_weekday ? w`
                    <div class="settings-row">
                        <span class="label" style="color: var(--secondary-text-color);">${x(this.hass, "editor_show_weekday_long")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday_long ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "show_weekday_long")}
                        ></ha-switch>
                    </div>
                    <div></div>
                ` : ""}

                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_add_event")}</span>
                        <ha-switch
                            .checked=${this._config.show_add_event ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "show_add_event")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${x(this.hass, "editor_show_upcoming")}</span>
                        <ha-switch
                            .checked=${e}
                            @change=${this._calendarShowAllChanged}
                        ></ha-switch>
                    </div>                
                </div>

            ${e ? w`
                <div class="settings-row full-width">
                     <span class="label" style="margin-bottom: 8px;">${((u = this.hass) == null ? void 0 : u.localize("ui.panel.lovelace.editor.card.statistic.period")) || "Period"}</span>
                     <div class="period-selectors">
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 365, mode: "box" } }}
                            .value=${i}
                            .label=${((f = this.hass) == null ? void 0 : f.localize("component.input_datetime.entity_component._.state_attributes.day.name")) || "Days"}
                            .configValue=${"days"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 23, mode: "box" } }}
                            .value=${n}
                            .label=${((m = this.hass) == null ? void 0 : m.localize("component.input_datetime.entity_component._.state_attributes.hour.name")) || "Hours"}
                            .configValue=${"hours"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 59, mode: "box" } }}
                            .value=${s}
                            .label=${((A = this.hass) == null ? void 0 : A.localize("component.input_datetime.entity_component._.state_attributes.minute.name")) || "Minutes"}
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

                <h4>${((E = this.hass) == null ? void 0 : E.localize("ui.components.calendar.my_calendars")) || "Calendars"}</h4>
                <div class="entities-list">
                    ${(() => {
      const _ = this._getCalendarEntities(), g = this._showAllCalendars ? _ : _.slice(0, 3), v = _.length > 3;
      return w`
                            ${g.map((p) => {
        var C, z, L, ne;
        const $ = !o.includes(p.entity_id), k = ((C = this._config.calendar_colors) == null ? void 0 : C[p.entity_id]) || "", ie = this._toCssColor(k || this._config.calendar_icon_color || "#fa3e3e");
        return w`
                                    <div class="entity-row ${$ ? "" : "disabled"}">
                                        <div class="entity-row-top">
                                            <div class="entity-icon dynamic" style="background: transparent;">
                                                ${this._renderDynamicIcon(/* @__PURE__ */ new Date(), ie, this._config.dark_mode ?? !1)}
                                            </div>
                                            <div class="entity-info">
                                                <span class="entity-name">${p.attributes.friendly_name || p.entity_id}</span>
                                                <span class="entity-id">${p.entity_id}</span>
                                            </div>
                                            <ha-button
                                                size="small" 
                                                appearance="filled" 
                                                variant="brand" 
                                                class="${$ ? "action-hide" : "action-show"}"
                                                @click=${(Z) => this._calendarToggleEntity(Z, p.entity_id)}
                                            >
                                                ${$ ? ((z = this.hass) == null ? void 0 : z.localize("ui.common.hide")) || "Hide" : ((L = this.hass) == null ? void 0 : L.localize("ui.common.show")) || "Show"}
                                            </ha-button>
                                        </div>
                                        <div class="entity-row-bottom">
                                             <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${k}
                                                .label=${((ne = this.hass) == null ? void 0 : ne.localize("ui.panel.lovelace.editor.card.tile.color")) || "Color"}
                                                @value-changed=${(Z) => this._calendarColorChanged(Z, p.entity_id)}
                                            ></ha-selector>
                                        </div>
                                    </div>
                                `;
      })}
                            ${v ? w`
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
    const i = [...this._config.exclude_entities ?? []], n = i.indexOf(t);
    n === -1 ? i.push(t) : i.splice(n, 1), this._config = {
      ...this._config,
      exclude_entities: i
    }, O(this, "config-changed", { config: this._config });
  }
  _calendarShowAllChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      upcoming_events: t
    }, O(this, "config-changed", { config: this._config });
  }
  _compactModeChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      unfold_events: t
    }, O(this, "config-changed", { config: this._config });
  }
  _calendarDividerChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      show_divider: t
    }, O(this, "config-changed", { config: this._config });
  }
  _toggleBooleanConfig(e, t) {
    const i = e.target.checked;
    this._config = {
      ...this._config,
      [t]: i
    }, O(this, "config-changed", { config: this._config });
  }
  _valueChanged(e) {
    var n;
    if (!this._config || !this.hass)
      return;
    const t = e.target, i = ((n = e.detail) == null ? void 0 : n.value) ?? t.value;
    this._config[t.configValue] !== i && t.configValue && (this._config = {
      ...this._config,
      [t.configValue]: i
    }, O(this, "config-changed", { config: this._config }));
  }
  _calendarColorChanged(e, t) {
    const i = e.detail.value, n = this._config.calendar_colors || {};
    this._config = {
      ...this._config,
      calendar_colors: {
        ...n,
        [t]: i
      }
    }, O(this, "config-changed", { config: this._config });
  }
  static get styles() {
    return fe`
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
    var l, h, u;
    const n = ((h = (l = this.hass) == null ? void 0 : l.locale) == null ? void 0 : h.language) || ((u = this.hass) == null ? void 0 : u.language) || navigator.language || "en", s = e.toLocaleDateString(n, { month: "short" }).toUpperCase(), o = e.getDate();
    return w`
            <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
                <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${i ? "#222222" : "white"}"></rect>
                <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
                <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${i ? "#222222" : "white"}" text-anchor="middle">${s}</text>
                <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${i ? "white" : "#333"}" text-anchor="middle">${o}</text>
            </svg>
        `;
  }
};
le([
  T({ attribute: !1 })
], W.prototype, "hass", 2);
le([
  te()
], W.prototype, "_config", 2);
le([
  te()
], W.prototype, "_showAllCalendars", 2);
W = le([
  $e("calendar-card-plus-editor")
], W);
const Ct = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusEditor() {
    return W;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  X as CalendarCardPlus
};
