var We = Object.defineProperty;
var Ze = (i, e, t) => e in i ? We(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var x = (i, e, t) => Ze(i, typeof e != "symbol" ? e + "" : e, t);
var qe = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
async function Fe(i, e, t, n) {
  const a = encodeURI(`?start=${e.toISOString()}&end=${t.toISOString()}`), s = n.map(async (r) => {
    try {
      const d = await i.callApi("GET", `calendars/${r}${a}`);
      if (!Array.isArray(d))
        throw new Error("Response is not an array");
      return d.map((l) => {
        var y, v, C, E, _, f;
        const h = ((y = l.start) == null ? void 0 : y.dateTime) || ((v = l.start) == null ? void 0 : v.date) || l.start, u = ((C = l.end) == null ? void 0 : C.dateTime) || ((E = l.end) == null ? void 0 : E.date) || l.end;
        return {
          ...l,
          start: { dateTime: h.includes("T") ? h : void 0, date: h.includes("T") ? void 0 : h },
          end: { dateTime: u.includes("T") ? u : void 0, date: u.includes("T") ? void 0 : u },
          summary: l.summary || l.title || "Unknown Event",
          entity_id: r,
          calendar_name: ((f = (_ = i.states[r]) == null ? void 0 : _.attributes) == null ? void 0 : f.friendly_name) || r
        };
      });
    } catch {
      const c = i.states[r];
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
const se = globalThis, fe = se.ShadowRoot && (se.ShadyCSS === void 0 || se.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, we = Symbol(), ke = /* @__PURE__ */ new WeakMap();
let Be = class {
  constructor(e, t, n) {
    if (this._$cssResult$ = !0, n !== we) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (fe && e === void 0) {
      const n = t !== void 0 && t.length === 1;
      n && (e = ke.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ke.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ye = (i) => new Be(typeof i == "string" ? i : i + "", void 0, we), ye = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((n, a, s) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(a) + i[s + 1], i[0]);
  return new Be(t, i, we);
}, Ge = (i, e) => {
  if (fe) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const n = document.createElement("style"), a = se.litNonce;
    a !== void 0 && n.setAttribute("nonce", a), n.textContent = t.cssText, i.appendChild(n);
  }
}, Ce = fe ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const n of e.cssRules) t += n.cssText;
  return Ye(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Qe, defineProperty: Je, getOwnPropertyDescriptor: Xe, getOwnPropertyNames: et, getOwnPropertySymbols: tt, getPrototypeOf: nt } = Object, L = globalThis, Ae = L.trustedTypes, at = Ae ? Ae.emptyScript : "", _e = L.reactiveElementPolyfillSupport, Q = (i, e) => i, oe = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? at : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, $e = (i, e) => !Qe(i, e), Ee = { attribute: !0, type: String, converter: oe, reflect: !1, useDefault: !1, hasChanged: $e };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), L.litPropertyMetadata ?? (L.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let K = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Ee) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const n = Symbol(), a = this.getPropertyDescriptor(e, n, t);
      a !== void 0 && Je(this.prototype, e, a);
    }
  }
  static getPropertyDescriptor(e, t, n) {
    const { get: a, set: s } = Xe(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: a, set(o) {
      const r = a == null ? void 0 : a.call(this);
      s == null || s.call(this, o), this.requestUpdate(e, r, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ee;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Q("elementProperties"))) return;
    const e = nt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Q("properties"))) {
      const t = this.properties, n = [...et(t), ...tt(t)];
      for (const a of n) this.createProperty(a, t[a]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [n, a] of t) this.elementProperties.set(n, a);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, n] of this.elementProperties) {
      const a = this._$Eu(t, n);
      a !== void 0 && this._$Eh.set(a, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const n = new Set(e.flat(1 / 0).reverse());
      for (const a of n) t.unshift(Ce(a));
    } else e !== void 0 && t.push(Ce(e));
    return t;
  }
  static _$Eu(e, t) {
    const n = t.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ge(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var n;
      return (n = t.hostConnected) == null ? void 0 : n.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var n;
      return (n = t.hostDisconnected) == null ? void 0 : n.call(t);
    });
  }
  attributeChangedCallback(e, t, n) {
    this._$AK(e, n);
  }
  _$ET(e, t) {
    var s;
    const n = this.constructor.elementProperties.get(e), a = this.constructor._$Eu(e, n);
    if (a !== void 0 && n.reflect === !0) {
      const o = (((s = n.converter) == null ? void 0 : s.toAttribute) !== void 0 ? n.converter : oe).toAttribute(t, n.type);
      this._$Em = e, o == null ? this.removeAttribute(a) : this.setAttribute(a, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var s, o;
    const n = this.constructor, a = n._$Eh.get(e);
    if (a !== void 0 && this._$Em !== a) {
      const r = n.getPropertyOptions(a), d = typeof r.converter == "function" ? { fromAttribute: r.converter } : ((s = r.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? r.converter : oe;
      this._$Em = a;
      const c = d.fromAttribute(t, r.type);
      this[a] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(a)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, n, a = !1, s) {
    var o;
    if (e !== void 0) {
      const r = this.constructor;
      if (a === !1 && (s = this[e]), n ?? (n = r.getPropertyOptions(e)), !((n.hasChanged ?? $e)(s, t) || n.useDefault && n.reflect && s === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(r._$Eu(e, n)))) return;
      this.C(e, t, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: n, reflect: a, wrapped: s }, o) {
    n && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), s !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), a === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
    var n;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [s, o] of this._$Ep) this[s] = o;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [s, o] of a) {
        const { wrapped: r } = o, d = this[s];
        r !== !0 || this._$AL.has(s) || d === void 0 || this.C(s, void 0, o, d);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (n = this._$EO) == null || n.forEach((a) => {
        var s;
        return (s = a.hostUpdate) == null ? void 0 : s.call(a);
      }), this.update(t)) : this._$EM();
    } catch (a) {
      throw e = !1, this._$EM(), a;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((n) => {
      var a;
      return (a = n.hostUpdated) == null ? void 0 : a.call(n);
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
K.elementStyles = [], K.shadowRootOptions = { mode: "open" }, K[Q("elementProperties")] = /* @__PURE__ */ new Map(), K[Q("finalized")] = /* @__PURE__ */ new Map(), _e == null || _e({ ReactiveElement: K }), (L.reactiveElementVersions ?? (L.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, ze = (i) => i, re = J.trustedTypes, Se = re ? re.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Ne = "$lit$", M = `lit$${Math.random().toFixed(9).slice(2)}$`, Ue = "?" + M, it = `<${Ue}>`, I = document, X = () => I.createComment(""), ee = (i) => i === null || typeof i != "object" && typeof i != "function", xe = Array.isArray, st = (i) => xe(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", he = `[ 	
\f\r]`, G = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Te = /-->/g, Pe = />/g, N = RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), De = /'/g, Me = /"/g, He = /^(?:script|style|textarea|title)$/i, ot = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), $ = ot(1), W = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), Le = /* @__PURE__ */ new WeakMap(), U = I.createTreeWalker(I, 129);
function Re(i, e) {
  if (!xe(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Se !== void 0 ? Se.createHTML(e) : e;
}
const rt = (i, e) => {
  const t = i.length - 1, n = [];
  let a, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = G;
  for (let r = 0; r < t; r++) {
    const d = i[r];
    let c, l, h = -1, u = 0;
    for (; u < d.length && (o.lastIndex = u, l = o.exec(d), l !== null); ) u = o.lastIndex, o === G ? l[1] === "!--" ? o = Te : l[1] !== void 0 ? o = Pe : l[2] !== void 0 ? (He.test(l[2]) && (a = RegExp("</" + l[2], "g")), o = N) : l[3] !== void 0 && (o = N) : o === N ? l[0] === ">" ? (o = a ?? G, h = -1) : l[1] === void 0 ? h = -2 : (h = o.lastIndex - l[2].length, c = l[1], o = l[3] === void 0 ? N : l[3] === '"' ? Me : De) : o === Me || o === De ? o = N : o === Te || o === Pe ? o = G : (o = N, a = void 0);
    const y = o === N && i[r + 1].startsWith("/>") ? " " : "";
    s += o === G ? d + it : h >= 0 ? (n.push(c), d.slice(0, h) + Ne + d.slice(h) + M + y) : d + M + (h === -2 ? r : y);
  }
  return [Re(i, s + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class te {
  constructor({ strings: e, _$litType$: t }, n) {
    let a;
    this.parts = [];
    let s = 0, o = 0;
    const r = e.length - 1, d = this.parts, [c, l] = rt(e, t);
    if (this.el = te.createElement(c, n), U.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (a = U.nextNode()) !== null && d.length < r; ) {
      if (a.nodeType === 1) {
        if (a.hasAttributes()) for (const h of a.getAttributeNames()) if (h.endsWith(Ne)) {
          const u = l[o++], y = a.getAttribute(h).split(M), v = /([.?@])?(.*)/.exec(u);
          d.push({ type: 1, index: s, name: v[2], strings: y, ctor: v[1] === "." ? lt : v[1] === "?" ? ct : v[1] === "@" ? _t : de }), a.removeAttribute(h);
        } else h.startsWith(M) && (d.push({ type: 6, index: s }), a.removeAttribute(h));
        if (He.test(a.tagName)) {
          const h = a.textContent.split(M), u = h.length - 1;
          if (u > 0) {
            a.textContent = re ? re.emptyScript : "";
            for (let y = 0; y < u; y++) a.append(h[y], X()), U.nextNode(), d.push({ type: 2, index: ++s });
            a.append(h[u], X());
          }
        }
      } else if (a.nodeType === 8) if (a.data === Ue) d.push({ type: 2, index: s });
      else {
        let h = -1;
        for (; (h = a.data.indexOf(M, h + 1)) !== -1; ) d.push({ type: 7, index: s }), h += M.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const n = I.createElement("template");
    return n.innerHTML = e, n;
  }
}
function Z(i, e, t = i, n) {
  var o, r;
  if (e === W) return e;
  let a = n !== void 0 ? (o = t._$Co) == null ? void 0 : o[n] : t._$Cl;
  const s = ee(e) ? void 0 : e._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== s && ((r = a == null ? void 0 : a._$AO) == null || r.call(a, !1), s === void 0 ? a = void 0 : (a = new s(i), a._$AT(i, t, n)), n !== void 0 ? (t._$Co ?? (t._$Co = []))[n] = a : t._$Cl = a), a !== void 0 && (e = Z(i, a._$AS(i, e.values), a, n)), e;
}
class dt {
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
    const { el: { content: t }, parts: n } = this._$AD, a = ((e == null ? void 0 : e.creationScope) ?? I).importNode(t, !0);
    U.currentNode = a;
    let s = U.nextNode(), o = 0, r = 0, d = n[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let c;
        d.type === 2 ? c = new ae(s, s.nextSibling, this, e) : d.type === 1 ? c = new d.ctor(s, d.name, d.strings, this, e) : d.type === 6 && (c = new ht(s, this, e)), this._$AV.push(c), d = n[++r];
      }
      o !== (d == null ? void 0 : d.index) && (s = U.nextNode(), o++);
    }
    return U.currentNode = I, a;
  }
  p(e) {
    let t = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, t), t += n.strings.length - 2) : n._$AI(e[t])), t++;
  }
}
class ae {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, n, a) {
    this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = a, this._$Cv = (a == null ? void 0 : a.isConnected) ?? !0;
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
    e = Z(this, e, t), ee(e) ? e === k || e == null || e === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : e !== this._$AH && e !== W && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : st(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== k && ee(this._$AH) ? this._$AA.nextSibling.data = e : this.T(I.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: t, _$litType$: n } = e, a = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = te.createElement(Re(n.h, n.h[0]), this.options)), n);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === a) this._$AH.p(t);
    else {
      const o = new dt(a, this), r = o.u(this.options);
      o.p(t), this.T(r), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = Le.get(e.strings);
    return t === void 0 && Le.set(e.strings, t = new te(e)), t;
  }
  k(e) {
    xe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let n, a = 0;
    for (const s of e) a === t.length ? t.push(n = new ae(this.O(X()), this.O(X()), this, this.options)) : n = t[a], n._$AI(s), a++;
    a < t.length && (this._$AR(n && n._$AB.nextSibling, a), t.length = a);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var n;
    for ((n = this._$AP) == null ? void 0 : n.call(this, !1, !0, t); e !== this._$AB; ) {
      const a = ze(e).nextSibling;
      ze(e).remove(), e = a;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class de {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, n, a, s) {
    this.type = 1, this._$AH = k, this._$AN = void 0, this.element = e, this.name = t, this._$AM = a, this.options = s, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = k;
  }
  _$AI(e, t = this, n, a) {
    const s = this.strings;
    let o = !1;
    if (s === void 0) e = Z(this, e, t, 0), o = !ee(e) || e !== this._$AH && e !== W, o && (this._$AH = e);
    else {
      const r = e;
      let d, c;
      for (e = s[0], d = 0; d < s.length - 1; d++) c = Z(this, r[n + d], t, d), c === W && (c = this._$AH[d]), o || (o = !ee(c) || c !== this._$AH[d]), c === k ? e = k : e !== k && (e += (c ?? "") + s[d + 1]), this._$AH[d] = c;
    }
    o && !a && this.j(e);
  }
  j(e) {
    e === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class lt extends de {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === k ? void 0 : e;
  }
}
class ct extends de {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== k);
  }
}
class _t extends de {
  constructor(e, t, n, a, s) {
    super(e, t, n, a, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = Z(this, e, t, 0) ?? k) === W) return;
    const n = this._$AH, a = e === k && n !== k || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, s = e !== k && (n === k || a);
    a && this.element.removeEventListener(this.name, this, n), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ht {
  constructor(e, t, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Z(this, e);
  }
}
const ue = J.litHtmlPolyfillSupport;
ue == null || ue(te, ae), (J.litHtmlVersions ?? (J.litHtmlVersions = [])).push("3.3.2");
const ut = (i, e, t) => {
  const n = (t == null ? void 0 : t.renderBefore) ?? e;
  let a = n._$litPart$;
  if (a === void 0) {
    const s = (t == null ? void 0 : t.renderBefore) ?? null;
    n._$litPart$ = a = new ae(e.insertBefore(X(), s), s, void 0, t ?? {});
  }
  return a._$AI(i), a;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const H = globalThis;
class R extends K {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ut(t, this.renderRoot, this.renderOptions);
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
    return W;
  }
}
var Oe;
R._$litElement$ = !0, R.finalized = !0, (Oe = H.litElementHydrateSupport) == null || Oe.call(H, { LitElement: R });
const ve = H.litElementPolyfillSupport;
ve == null || ve({ LitElement: R });
(H.litElementVersions ?? (H.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const be = (i) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(i, e);
  }) : customElements.define(i, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vt = { attribute: !0, type: String, converter: oe, reflect: !1, hasChanged: $e }, gt = (i = vt, e, t) => {
  const { kind: n, metadata: a } = t;
  let s = globalThis.litPropertyMetadata.get(a);
  if (s === void 0 && globalThis.litPropertyMetadata.set(a, s = /* @__PURE__ */ new Map()), n === "setter" && ((i = Object.create(i)).wrapped = !0), s.set(t.name, i), n === "accessor") {
    const { name: o } = t;
    return { set(r) {
      const d = e.get.call(this);
      e.set.call(this, r), this.requestUpdate(o, d, i, !0, r);
    }, init(r) {
      return r !== void 0 && this.C(o, void 0, i, r), r;
    } };
  }
  if (n === "setter") {
    const { name: o } = t;
    return function(r) {
      const d = this[o];
      e.call(this, r), this.requestUpdate(o, d, i, !0, r);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function T(i) {
  return (e, t) => typeof t == "object" ? gt(i, e, t) : ((n, a, s) => {
    const o = a.hasOwnProperty(s);
    return a.constructor.createProperty(s, n), o ? Object.getOwnPropertyDescriptor(a, s) : void 0;
  })(i, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ie(i) {
  return T({ ...i, state: !0, attribute: !1 });
}
const V = {
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
    editor_background_color: "Background Color"
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
    editor_background_color: "Hintergrundfarbe"
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
    editor_background_color: "Couleur de fond"
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
    editor_background_color: "Colore di sfondo"
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
    editor_background_color: "Color de fondo"
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
    editor_background_color: "Achtergrondkleur"
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
    editor_background_color: "Cor de fundo"
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
    editor_background_color: "Цвет фона"
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
    editor_background_color: "Kolor tła"
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
    editor_background_color: "Bakgrundsfärg"
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
    editor_background_color: "Baggrundsfarve"
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
    editor_background_color: "Bakgrunnsfarge"
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
    editor_background_color: "Taustaväri"
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
    editor_background_color: "Barva pozadí"
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
    editor_background_color: "Háttérszín"
  }
};
function b(i, e, t, n) {
  var o;
  const a = ((o = i.locale) == null ? void 0 : o.language) || i.language || "en";
  let s;
  if (V[a] && V[a][e])
    s = V[a][e];
  else if (V.en && V.en[e])
    s = V.en[e];
  else
    return e;
  return t && n && (s = s.replace(t, n)), s;
}
function mt(i, e, t) {
  var a, s, o;
  const n = (t == null ? void 0 : t.unfold_events) || !1;
  if (e === void 0)
    return $`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--primary-color, #03a9f4);">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${b(i, "loading")}</div>
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
                    <div class="event-title">${b(i, "no_events")}</div>
                </div>
            </div>
        </div>
        `;
  if (!n) {
    const r = e[0], d = e.length - 1, c = r.summary;
    let l, h;
    try {
      if (l = new Date(r.start.dateTime || r.start.date), h = new Date(r.end.dateTime || r.end.date), isNaN(l.getTime()) || isNaN(h.getTime())) throw new Error("Invalid Date");
    } catch {
      return $`<div class="error">Date Error</div>`;
    }
    const u = /* @__PURE__ */ new Date(), y = !r.start.dateTime;
    let v;
    if (l > u)
      if (t != null && t.show_date) {
        const m = ((a = i.locale) == null ? void 0 : a.language) || i.language || navigator.language, w = l.toLocaleDateString(m, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (y)
          v = w;
        else {
          const P = l.toLocaleTimeString(m, { hour: "2-digit", minute: "2-digit" });
          v = `${w}, ${P}${m.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const m = l.getTime() - u.getTime(), w = Math.ceil(m / 6e4);
        v = je(i, w);
      }
    else if (y)
      v = i.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const m = ((s = i.locale) == null ? void 0 : s.language) || i.language || navigator.language, w = (P) => P.toLocaleTimeString(m, { hour: "2-digit", minute: "2-digit" });
      v = `${w(l)} - ${w(h)}`;
    }
    if (d > 0 && (v += ` ${b(i, "more_events", "{x}", d.toString())}`), t != null && t.show_weekday) {
      const m = ((o = i.locale) == null ? void 0 : o.language) || i.language || navigator.language, w = l.toLocaleDateString(m, { weekday: t.show_weekday_long ? "long" : "short" });
      v += ` • ${w}`;
    }
    t != null && t.show_calendar_name && r.calendar_name && (v += ` • ${r.calendar_name}`);
    const E = l <= u && h >= u ? u : l, _ = ge(r.entity_id, t), f = pe(i, E, _, (t == null ? void 0 : t.dark_mode) ?? !1), p = me(r.entity_id, t), g = p ? `background-color: ${p}; border: none;` : "";
    return $`
            <div class="calendar-container">
                <div class="calendar-item"  
                     style="${g}"
                     title="${c}"
                     @click=${(m) => pt(m, i, e)}>
                     <div class="calendar-icon dynamic">
                        ${f}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${c}</div>
                        <div class="event-time">${v}</div>
                    </div>
                </div>
            </div>
        `;
  }
  return $`
        <div class="calendar-container">
            ${e.map((r, d) => {
    var P, F, Y;
    const c = r.summary;
    let l, h;
    try {
      if (l = new Date(r.start.dateTime || r.start.date), h = new Date(r.end.dateTime || r.end.date), isNaN(l.getTime())) throw new Error("Invalid start date");
      if (isNaN(h.getTime())) throw new Error("Invalid end date");
    } catch {
      return $`<div class="error">Date Error for ${c}</div>`;
    }
    const u = /* @__PURE__ */ new Date(), y = !r.start.dateTime;
    let v, C = -1;
    if (l > u)
      if (t != null && t.show_date) {
        const A = ((P = i.locale) == null ? void 0 : P.language) || i.language || navigator.language, z = l.toLocaleDateString(A, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (y)
          v = z;
        else {
          const O = l.toLocaleTimeString(A, { hour: "2-digit", minute: "2-digit" });
          v = `${z}, ${O}${A.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const A = l.getTime() - u.getTime(), z = Math.ceil(A / 6e4);
        v = je(i, z);
      }
    else if (y)
      v = i.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const A = ((F = i.locale) == null ? void 0 : F.language) || i.language || navigator.language, z = (Ke) => Ke.toLocaleTimeString(A, { hour: "2-digit", minute: "2-digit" });
      v = `${z(l)} - ${z(h)}`;
      const O = h.getTime() - l.getTime(), B = u.getTime() - l.getTime();
      O > 0 && (C = Math.max(0, Math.min(100, B / O * 100)));
    }
    if (t != null && t.show_weekday) {
      const A = ((Y = i.locale) == null ? void 0 : Y.language) || i.language || navigator.language, z = l.toLocaleDateString(A, { weekday: t.show_weekday_long ? "long" : "short" });
      v += ` • ${z}`;
    }
    t != null && t.show_calendar_name && r.calendar_name && (v += ` • ${r.calendar_name}`);
    const _ = l <= u && h >= u ? u : l, f = ge(r.entity_id, t), p = pe(i, _, f, (t == null ? void 0 : t.dark_mode) ?? !1), g = me(r.entity_id, t), m = g ? `background-color: ${g}; border: none;` : "", w = (t == null ? void 0 : t.show_divider) && d > 0 && e[d - 1].entity_id !== r.entity_id;
    return $`
                ${w ? $`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item"  
                     style="${m}"
                     title="${c}"
                     @click=${(A) => ft(A, r.entity_id)}>
                     <div class="calendar-icon dynamic">
                        ${p}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${c}</div>
                        <div class="event-time">${v}</div>
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
function ge(i, e) {
  var n;
  const t = ((n = e == null ? void 0 : e.calendar_colors) == null ? void 0 : n[i]) || (e == null ? void 0 : e.calendar_icon_color) || "#fa3e3e";
  return Ie(t);
}
function me(i, e) {
  var n;
  const t = ((n = e == null ? void 0 : e.calendar_background_colors) == null ? void 0 : n[i]) || (e == null ? void 0 : e.background_color) || "";
  return t ? Ie(t) : "";
}
function Ie(i) {
  return i.startsWith("#") || i.startsWith("rgb") || i.startsWith("hsl") || i.startsWith("var") ? i : `var(--${i}-color)`;
}
function pt(i, e, t) {
  const n = new CustomEvent("calendar-card-show-detail", {
    bubbles: !0,
    composed: !0,
    detail: {
      title: b(e, "popup_upcoming_events"),
      entities: t
    }
  });
  i.target.dispatchEvent(n);
}
function ft(i, e) {
  const t = new CustomEvent("hass-more-info", {
    bubbles: !0,
    composed: !0,
    detail: { entityId: e }
  });
  i.target.dispatchEvent(t);
}
function pe(i, e, t, n = !1) {
  var l;
  const a = ((l = i.locale) == null ? void 0 : l.language) || i.language || navigator.language, s = e.toLocaleDateString(a, { month: "short" }).toUpperCase(), o = e.getDate();
  return $`
        <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
            <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${n ? "#222222" : "white"}"></rect>
            <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
            <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${n ? "#222222" : "white"}" text-anchor="middle">${s}</text>
            <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${n ? "white" : "#333"}" text-anchor="middle">${o}</text>
        </svg>
    `;
}
function je(i, e) {
  if (e < 60)
    return e === 1 ? b(i, "starts_in_min", "{x}", e.toString()) : b(i, "starts_in_mins", "{x}", e.toString());
  if (e < 1440) {
    const n = Math.round(e / 60);
    return n === 1 ? b(i, "starts_in_hour", "{x}", n.toString()) : b(i, "starts_in_hours", "{x}", n.toString());
  }
  if (e < 43200) {
    const n = Math.round(e / 1440);
    return n === 1 ? b(i, "starts_in_day", "{x}", n.toString()) : b(i, "starts_in_days", "{x}", n.toString());
  }
  const t = Math.round(e / 10080);
  return t === 1 ? b(i, "starts_in_week", "{x}", t.toString()) : b(i, "starts_in_weeks", "{x}", t.toString());
}
function wt(i, e) {
  const t = Object.keys(i.states).filter((c) => c.startsWith("calendar.")).filter((c) => {
    var l;
    return !((l = e.exclude_entities) != null && l.includes(c));
  }), n = t.length > 0 ? t[0] : void 0, a = /* @__PURE__ */ new Date(), s = new Date(a);
  s.setHours(s.getHours() + 1, 0, 0, 0);
  const o = new Date(s);
  o.setHours(o.getHours() + 1, 0, 0, 0);
  const r = (c) => c.toString().padStart(2, "0"), d = (c) => `${c.getFullYear()}-${r(c.getMonth() + 1)}-${r(c.getDate())} ${r(c.getHours())}:${r(c.getMinutes())}:00`;
  return {
    open: !0,
    calendar_id: n,
    name: "",
    start: d(s),
    end: d(o),
    location: "",
    description: "",
    recurrence: "none",
    all_day: !1
  };
}
async function yt(i, e, t, n) {
  if (!(!e.calendar_id || !e.name || !e.start || !e.end))
    try {
      const a = {
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
        a.start_date = s, a.end_date = o;
      } else
        a.start_date_time = e.start, a.end_date_time = e.end, e.location && (a.location = e.location), e.description && (a.description = e.description);
      if (e.recurrence && e.recurrence !== "none") {
        const s = {
          DAILY: "FREQ=DAILY",
          WEEKLY: "FREQ=WEEKLY",
          MONTHLY: "FREQ=MONTHLY",
          YEARLY: "FREQ=YEARLY"
        };
        s[e.recurrence] && (a.rrule = s[e.recurrence]);
      }
      await i.callService("calendar", "create_event", a), t();
    } catch (a) {
      n(a);
    }
}
function $t(i, e, t, n, a, s) {
  var r, d, c, l, h, u, y, v, C, E;
  const o = Object.keys(i.states).filter((_) => _.startsWith("calendar.")).filter((_) => {
    var f;
    return !((f = e.exclude_entities) != null && f.includes(_));
  });
  return $`
        <div class="add-event-form">
            <ha-textfield
                    label=${i.localize("ui.components.calendar.event.summary") || "Title"}
                    .value=${t.name || ""}
                    @input=${(_) => n({ name: _.target.value })}
                    dialogInitialFocus
                ></ha-textfield>

                <ha-textfield
                    label=${i.localize("ui.components.calendar.event.location") || "Location"}
                    .value=${t.location || ""}
                    @input=${(_) => n({ location: _.target.value })}
                ></ha-textfield>

                <ha-textfield
                    label=${i.localize("ui.components.calendar.event.description") || "Description"}
                    .value=${t.description || ""}
                    @input=${(_) => n({ description: _.target.value })}
                ></ha-textfield>

                <ha-selector
                    .hass=${i}
                    .selector=${{ select: { options: o.map((_) => {
    var f, p;
    return { value: _, label: ((p = (f = i.states[_]) == null ? void 0 : f.attributes) == null ? void 0 : p.friendly_name) || _ };
  }) } }}
                    .value=${t.calendar_id}
                    .label=${i.localize("ui.components.calendar.my_calendars") || "Calendar"}
                    @value-changed=${(_) => n({ calendar_id: _.detail.value })}
                ></ha-selector>

                <div class="row-flex">
                    <ha-formfield .label=${i.localize("ui.components.calendar.event.all_day") || "All Day"}>
                        <ha-switch
                            .checked=${t.all_day || !1}
                            @change=${(_) => n({ all_day: _.target.checked })}
                        ></ha-switch>
                    </ha-formfield>
                </div>

                <div class="row-label">${i.localize("ui.components.calendar.event.start") || "Start"}:</div>
                <div class="date-row">
                    <ha-selector
                        class="date-selector"
                        .hass=${i}
                        .selector=${{ date: {} }}
                        .required=${!1}
                        .value=${((r = t.start) == null ? void 0 : r.split(" ")[0]) || ""}
                        @value-changed=${(_) => {
    var p;
    const f = ((p = t.start) == null ? void 0 : p.split(" ")[1]) || "00:00:00";
    n({ start: `${_.detail.value} ${f}` });
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
    var g, m, w;
    const f = ((g = t.start) == null ? void 0 : g.split(" ")[0]) || "", p = ((w = (m = t.start) == null ? void 0 : m.split(" ")[1]) == null ? void 0 : w.substring(3, 5)) || "00";
    n({ start: `${f} ${_.target.value.padStart(2, "0")}:${p}:00` });
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
    var g, m, w;
    const f = ((g = t.start) == null ? void 0 : g.split(" ")[0]) || "", p = ((w = (m = t.start) == null ? void 0 : m.split(" ")[1]) == null ? void 0 : w.substring(0, 2)) || "00";
    n({ start: `${f} ${p}:${_.target.value.padStart(2, "0")}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                    </div>
                </div>
                
                <div class="row-label">${i.localize("ui.components.calendar.event.end") || "End"}:</div>
                <div class="date-row">
                    <ha-selector
                        class="date-selector"
                        .hass=${i}
                        .selector=${{ date: {} }}
                        .required=${!1}
                        .value=${((u = t.end) == null ? void 0 : u.split(" ")[0]) || ""}
                        @value-changed=${(_) => {
    var p;
    const f = ((p = t.end) == null ? void 0 : p.split(" ")[1]) || "00:00:00";
    n({ end: `${_.detail.value} ${f}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((v = (y = t.end) == null ? void 0 : y.split(" ")[1]) == null ? void 0 : v.substring(0, 2)) || "00"}
                            @change=${(_) => {
    var g, m, w;
    const f = ((g = t.end) == null ? void 0 : g.split(" ")[0]) || "", p = ((w = (m = t.end) == null ? void 0 : m.split(" ")[1]) == null ? void 0 : w.substring(3, 5)) || "00";
    n({ end: `${f} ${_.target.value.padStart(2, "0")}:${p}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((E = (C = t.end) == null ? void 0 : C.split(" ")[1]) == null ? void 0 : E.substring(3, 5)) || "00"}
                            @change=${(_) => {
    var g, m, w;
    const f = ((g = t.end) == null ? void 0 : g.split(" ")[0]) || "", p = ((w = (m = t.end) == null ? void 0 : m.split(" ")[1]) == null ? void 0 : w.substring(0, 2)) || "00";
    n({ end: `${f} ${p}:${_.target.value.padStart(2, "0")}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                    </div>
                </div>

                <ha-selector
                    .hass=${i}
                    .selector=${{ select: {
    options: [
      { value: "none", label: i.localize("ui.components.calendar.event.repeat.freq.none") || "None" },
      { value: "DAILY", label: i.localize("ui.components.calendar.event.repeat.freq.daily") || "Daily" },
      { value: "WEEKLY", label: i.localize("ui.components.calendar.event.repeat.freq.weekly") || "Weekly" },
      { value: "MONTHLY", label: i.localize("ui.components.calendar.event.repeat.freq.monthly") || "Monthly" },
      { value: "YEARLY", label: i.localize("ui.components.calendar.event.repeat.freq.yearly") || "Yearly" }
    ],
    mode: "dropdown"
  } }}
                    .value=${t.recurrence || "none"}
                    .label=${i.localize("ui.components.calendar.event.repeat.label") || "Repeat"}
                    @value-changed=${(_) => n({ recurrence: _.detail.value })}
                ></ha-selector>

                <div class="dialog-actions">
                    <ha-button @click=${a}>
                        ${i.localize("ui.common.cancel") || "Cancel"}
                    </ha-button>
                    <ha-button
                        unelevated
                        @click=${s}
                        ?disabled=${!t.name || !t.calendar_id}
                    >
                        ${i.localize("ui.common.save") || "Save"}
                    </ha-button>
                </div>
        </div>
    `;
}
var Ve = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, bt = (i, e, t) => e in i ? Ve(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, j = (i, e, t, n) => {
  for (var a = n > 1 ? void 0 : n ? xt(e, t) : e, s = i.length - 1, o; s >= 0; s--)
    (o = i[s]) && (a = (n ? o(e, t, a) : o(a)) || a);
  return n && a && Ve(e, t, a), a;
}, kt = (i, e, t) => bt(i, e + "", t);
let S = class extends R {
  constructor() {
    super(...arguments);
    x(this, "hass");
    x(this, "config");
    x(this, "open", !1);
    x(this, "mode", "detail");
    x(this, "detailTitle", "");
    x(this, "detailEvents", []);
    x(this, "_addEventState", { open: !1 });
    x(this, "_opener", null);
    x(this, "_onEventSaved", null);
    x(this, "_onPopState", (e) => {
      var t;
      this.open && !((t = window.history.state) != null && t.calendarCardPlusPopup) && this._close();
    });
    x(this, "_close", () => {
      if (!this.open) return;
      this.open = !1, this.requestUpdate();
      const e = { dialog: this };
      this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("popup-closed", { bubbles: !0, composed: !0, detail: e }));
    });
    // Guard: only close if event originates from ha-adaptive-dialog itself, not from child elements
    x(this, "_onDialogClosed", (e) => {
      var t;
      if (e && e.type !== "click") {
        const n = e.target;
        if (n && n.tagName !== "HA-ADAPTIVE-DIALOG" && n.tagName !== "HA-DIALOG")
          return;
      }
      this._close(), (t = window.history.state) != null && t.calendarCardPlusPopup && window.history.back();
    });
    x(this, "_closeDialog", () => {
      var e;
      this.open && (this._close(), (e = window.history.state) != null && e.calendarCardPlusPopup && window.history.back());
    });
  }
  async showDialog(e) {
    this.hass = e.hass, this.config = e.config, this._opener = e.opener, this.mode = e.mode, e.title && (this.detailTitle = e.title), e.events && (this.detailEvents = e.events), e.addEventState && (this._addEventState = e.addEventState), e.onEventSaved && (this._onEventSaved = e.onEventSaved), this.open = !0, window.history.pushState({ calendarCardPlusPopup: !0 }, ""), this.requestUpdate(), await this.updateComplete;
    const t = this.renderRoot.querySelector("ha-adaptive-dialog");
    if (t && t.shadowRoot) {
      const n = t.shadowRoot.querySelector("ha-bottom-sheet");
      n && (n.style.removeProperty("--dialog-transform"), n.style.removeProperty("--dialog-transition"));
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
    await yt(
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
    var n;
    const e = this.mode === "add-event", t = e ? ((n = this.hass) == null ? void 0 : n.localize("ui.components.calendar.event.add")) || "Add Event" : this.detailTitle;
    return $`
            <ha-adaptive-dialog
                .hass=${this.hass}
                .open=${this.open}
                .headerTitle=${t}
                @closed=${this._onDialogClosed}
                @ha-dialog-closed=${this._onDialogClosed}
                flexcontent
            >
                <div class="dialog-content scrollable ha-scrollbar">
                    ${e ? $t(
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
      var E, _, f;
      const n = e.summary;
      let a = "", s, o;
      try {
        s = new Date(e.start.dateTime || e.start.date), o = new Date(e.end.dateTime || e.end.date);
      } catch {
        return $`<div class="error">Date Error</div>`;
      }
      const r = /* @__PURE__ */ new Date(), d = !e.start.dateTime;
      if (s > r) {
        const p = ((E = this.hass.locale) == null ? void 0 : E.language) || this.hass.language || navigator.language, g = s.toLocaleDateString(p, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (d)
          a = g;
        else {
          const m = s.toLocaleTimeString(p, { hour: "2-digit", minute: "2-digit" });
          a = `${g}, ${m}${p.startsWith("de") ? " Uhr" : ""}`;
        }
      } else if (d)
        a = this.hass.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
      else {
        const p = ((_ = this.hass.locale) == null ? void 0 : _.language) || this.hass.language || navigator.language, g = (m) => m.toLocaleTimeString(p, { hour: "2-digit", minute: "2-digit" });
        a = `${g(s)} - ${g(o)}`;
      }
      if (this.config.show_weekday) {
        const p = ((f = this.hass.locale) == null ? void 0 : f.language) || this.hass.language || navigator.language, g = s.toLocaleDateString(p, { weekday: "short" });
        a += ` • ${g}`;
      }
      this.config.show_calendar_name && e.calendar_name && (a += ` • ${e.calendar_name}`);
      const l = s <= r && o >= r ? r : s, h = ge(e.entity_id, this.config), u = pe(this.hass, l, h, this.config.dark_mode ?? !1), y = this.config.show_divider && t > 0, v = me(e.entity_id, this.config), C = v ? `background-color: ${v}; border: none;` : "";
      return $`
                ${y ? $`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item detail" style=${C} @click=${() => this._handleMoreInfo(e.entity_id)}>
                    <div class="calendar-icon dynamic">
                        ${u}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${n}</div>
                        <div class="event-time">${a}</div>
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
kt(S, "styles", ye`
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
j([
  T({ attribute: !1 })
], S.prototype, "hass", 2);
j([
  T({ attribute: !1 })
], S.prototype, "config", 2);
j([
  T({ type: Boolean })
], S.prototype, "open", 2);
j([
  T({ type: String })
], S.prototype, "mode", 2);
j([
  T({ type: String })
], S.prototype, "detailTitle", 2);
j([
  T({ type: Array })
], S.prototype, "detailEvents", 2);
j([
  ie()
], S.prototype, "_addEventState", 2);
S = j([
  be("calendar-card-plus-popup")
], S);
const Ct = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusPopup() {
    return S;
  }
}, Symbol.toStringTag, { value: "Module" }));
var At = Object.defineProperty, Et = Object.getOwnPropertyDescriptor, le = (i, e, t, n) => {
  for (var a = n > 1 ? void 0 : n ? Et(e, t) : e, s = i.length - 1, o; s >= 0; s--)
    (o = i[s]) && (a = (n ? o(e, t, a) : o(a)) || a);
  return n && a && At(e, t, a), a;
};
let ne = class extends R {
  constructor() {
    super(...arguments);
    x(this, "hass");
    x(this, "config");
    x(this, "_events");
    x(this, "_handleShowDetail", async (e) => {
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "detail",
        title: e.detail.title,
        events: e.detail.entities
      });
    });
    x(this, "_openAddEventPopup", async () => {
      const e = wt(this.hass, this.config);
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "add-event",
        addEventState: e
      });
    });
    x(this, "_onEventSaved", () => {
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
    const n = Object.keys(this.hass.states).filter((s) => s.startsWith("calendar.")).filter((s) => {
      var o;
      return !((o = this.config.exclude_entities) != null && o.includes(s));
    });
    if (n.length === 0) {
      this._events = [];
      return;
    }
    const a = await Fe(this.hass, e, t, n);
    a.sort((s, o) => {
      const r = new Date(s.start.dateTime || s.start.date).getTime(), d = new Date(o.start.dateTime || o.start.date).getTime();
      return r - d;
    }), this._events = a, this.requestUpdate();
  }
  render() {
    if (!this.config || !this.hass)
      return $``;
    const e = mt(this.hass, this._events, this.config);
    return $`
            <ha-card>
                <div class="add-event-btn" @click=${this._openAddEventPopup} style=${this.config.show_add_event ? "" : "display: none;"}>
                    <ha-icon-button .path=${qe}></ha-icon-button>
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
          dialogImport: () => Promise.resolve().then(() => Ct),
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
    return ye`
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
            }
            .calendar-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: var(--ha-card-border-radius, 12px);
                margin-bottom: 8px;
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
    return await Promise.resolve().then(() => Tt), document.createElement("calendar-card-plus-editor");
  }
  static getStubConfig(e) {
    return {
      type: "custom:calendar-card-plus",
      exclude_entities: [],
      unfold_events: !1
    };
  }
};
le([
  T({ attribute: !1 })
], ne.prototype, "hass", 2);
le([
  ie()
], ne.prototype, "config", 2);
le([
  ie()
], ne.prototype, "_events", 2);
ne = le([
  be("calendar-card-plus")
], ne);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-card-plus",
  name: "Dynamic Calendar Card Plus",
  preview: !0,
  description: "A standalone calendar card with dynamic grid styling"
});
const D = (i, e, t, n) => {
  n = n || {}, t = t ?? {};
  const a = new Event(e, {
    bubbles: n.bubbles === void 0 ? !0 : n.bubbles,
    cancelable: !!n.cancelable,
    composed: n.composed === void 0 ? !0 : n.composed
  });
  return a.detail = t, i.dispatchEvent(a), a;
};
var zt = Object.defineProperty, St = Object.getOwnPropertyDescriptor, ce = (i, e, t, n) => {
  for (var a = n > 1 ? void 0 : n ? St(e, t) : e, s = i.length - 1, o; s >= 0; s--)
    (o = i[s]) && (a = (n ? o(e, t, a) : o(a)) || a);
  return n && a && zt(e, t, a), a;
};
let q = class extends R {
  constructor() {
    super(...arguments);
    x(this, "hass");
    x(this, "_config", { type: "custom:calendar-card-plus" });
    x(this, "_showAllCalendars", !1);
  }
  set config(e) {
    this.setConfig(e);
  }
  setConfig(e) {
    this._config = e, this.requestUpdate();
  }
  render() {
    var r, d, c, l, h, u, y, v, C, E;
    if (!this.hass)
      return $``;
    const e = this._config.upcoming_events ?? !1, t = this._config.unfold_events ?? !1, n = this._config.days ?? 1, a = this._config.hours ?? 0, s = this._config.minutes ?? 0, o = this._config.exclude_entities ?? [];
    return $`
            <div class="card-config">


                <div class="settings-grid">
                    <div class="settings-row">
                        <span class="label">${b(this.hass, "editor_unfold_events")}</span>
                        <ha-switch
                            .checked=${t}
                            @change=${this._compactModeChanged}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${b(this.hass, "editor_show_divider")}</span>
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
                        <span class="label">${b(this.hass, "editor_show_weekday")}</span>
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

                ${this._config.show_weekday ? $`
                    <div class="settings-row">
                        <span class="label" style="color: var(--secondary-text-color);">${b(this.hass, "editor_show_weekday_long")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday_long ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "show_weekday_long")}
                        ></ha-switch>
                    </div>
                    <div></div>
                ` : ""}

                    <div class="settings-row">
                        <span class="label">${b(this.hass, "editor_show_add_event")}</span>
                        <ha-switch
                            .checked=${this._config.show_add_event ?? !1}
                            @change=${(_) => this._toggleBooleanConfig(_, "show_add_event")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${b(this.hass, "editor_show_upcoming")}</span>
                        <ha-switch
                            .checked=${e}
                            @change=${this._calendarShowAllChanged}
                        ></ha-switch>
                    </div>                
                </div>

            ${e ? $`
                <div class="settings-row full-width">
                     <span class="label" style="margin-bottom: 8px;">${((u = this.hass) == null ? void 0 : u.localize("ui.panel.lovelace.editor.card.statistic.period")) || "Period"}</span>
                     <div class="period-selectors">
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 365, mode: "box" } }}
                            .value=${n}
                            .label=${((y = this.hass) == null ? void 0 : y.localize("component.input_datetime.entity_component._.state_attributes.day.name")) || "Days"}
                            .configValue=${"days"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 23, mode: "box" } }}
                            .value=${a}
                            .label=${((v = this.hass) == null ? void 0 : v.localize("component.input_datetime.entity_component._.state_attributes.hour.name")) || "Hours"}
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

                <div class="settings-row full-width">
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ ui_color: {} }}
                        .value=${this._config.background_color || ""}
                        .label=${b(this.hass, "editor_background_color")}
                        .configValue=${"background_color"}
                        @value-changed=${this._valueChanged}
                    ></ha-selector>
                </div>

                <h4>${((E = this.hass) == null ? void 0 : E.localize("ui.components.calendar.my_calendars")) || "Calendars"}</h4>
                <div class="entities-list">
                    ${(() => {
      const _ = this._getCalendarEntities(), f = this._showAllCalendars ? _ : _.slice(0, 3), p = _.length > 3;
      return $`
                            ${f.map((g) => {
        var F, Y, A, z, O;
        const m = !o.includes(g.entity_id), w = ((F = this._config.calendar_colors) == null ? void 0 : F[g.entity_id]) || "", P = this._toCssColor(w || this._config.calendar_icon_color || "#fa3e3e");
        return $`
                                    <div class="entity-row ${m ? "" : "disabled"}">
                                        <div class="entity-row-top">
                                            <div class="entity-icon dynamic" style="background: transparent;">
                                                ${this._renderDynamicIcon(/* @__PURE__ */ new Date(), P, this._config.dark_mode ?? !1)}
                                            </div>
                                            <div class="entity-info">
                                                <span class="entity-name">${g.attributes.friendly_name || g.entity_id}</span>
                                                <span class="entity-id">${g.entity_id}</span>
                                            </div>
                                            <ha-button
                                                size="small" 
                                                appearance="filled" 
                                                variant="brand" 
                                                class="${m ? "action-hide" : "action-show"}"
                                                @click=${(B) => this._calendarToggleEntity(B, g.entity_id)}
                                            >
                                                ${m ? ((Y = this.hass) == null ? void 0 : Y.localize("ui.common.hide")) || "Hide" : ((A = this.hass) == null ? void 0 : A.localize("ui.common.show")) || "Show"}
                                            </ha-button>
                                        </div>
                                        <div class="entity-row-bottom">
                                             <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${w}
                                                .label=${((z = this.hass) == null ? void 0 : z.localize("ui.panel.lovelace.editor.card.tile.color")) || "Color"}
                                                @value-changed=${(B) => this._calendarColorChanged(B, g.entity_id)}
                                            ></ha-selector>
                                            <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${((O = this._config.calendar_background_colors) == null ? void 0 : O[g.entity_id]) || ""}
                                                .label=${b(this.hass, "editor_background_color")}
                                                @value-changed=${(B) => this._calendarBackgroundColorChanged(B, g.entity_id)}
                                            ></ha-selector>
                                        </div>
                                    </div>
                                `;
      })}
                            ${p ? $`
                                <div class="show-more-row">
                                    <ha-button @click=${() => {
        this._showAllCalendars = !this._showAllCalendars, this.requestUpdate();
      }}>
                                        ${this._showAllCalendars ? b(this.hass, "editor_show_less") : b(this.hass, "editor_show_more")}
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
    const n = [...this._config.exclude_entities ?? []], a = n.indexOf(t);
    a === -1 ? n.push(t) : n.splice(a, 1), this._config = {
      ...this._config,
      exclude_entities: n
    }, D(this, "config-changed", { config: this._config });
  }
  _calendarShowAllChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      upcoming_events: t
    }, D(this, "config-changed", { config: this._config });
  }
  _compactModeChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      unfold_events: t
    }, D(this, "config-changed", { config: this._config });
  }
  _calendarDividerChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      show_divider: t
    }, D(this, "config-changed", { config: this._config });
  }
  _toggleBooleanConfig(e, t) {
    const n = e.target.checked;
    this._config = {
      ...this._config,
      [t]: n
    }, D(this, "config-changed", { config: this._config });
  }
  _valueChanged(e) {
    var o;
    if (!this._config || !this.hass)
      return;
    const n = e.target.configValue;
    if (!n)
      return;
    const a = (o = e.detail) == null ? void 0 : o.value;
    if (this._config[n] === a)
      return;
    const s = { ...this._config };
    a == null || a === "" ? delete s[n] : s[n] = a, this._config = s, D(this, "config-changed", { config: this._config });
  }
  _calendarColorChanged(e, t) {
    const n = e.detail.value, a = { ...this._config.calendar_colors || {} };
    if (n == null || n === "" ? delete a[t] : a[t] = n, Object.keys(a).length === 0) {
      const s = { ...this._config };
      delete s.calendar_colors, this._config = s;
    } else
      this._config = {
        ...this._config,
        calendar_colors: a
      };
    D(this, "config-changed", { config: this._config });
  }
  _calendarBackgroundColorChanged(e, t) {
    const n = e.detail.value, a = { ...this._config.calendar_background_colors || {} };
    if (n == null || n === "" ? delete a[t] : a[t] = n, Object.keys(a).length === 0) {
      const s = { ...this._config };
      delete s.calendar_background_colors, this._config = s;
    } else
      this._config = {
        ...this._config,
        calendar_background_colors: a
      };
    D(this, "config-changed", { config: this._config });
  }
  static get styles() {
    return ye`
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
  _renderDynamicIcon(e, t, n = !1) {
    var l, h, u;
    const a = ((h = (l = this.hass) == null ? void 0 : l.locale) == null ? void 0 : h.language) || ((u = this.hass) == null ? void 0 : u.language) || navigator.language || "en", s = e.toLocaleDateString(a, { month: "short" }).toUpperCase(), o = e.getDate();
    return $`
            <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
                <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${n ? "#222222" : "white"}"></rect>
                <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
                <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${n ? "#222222" : "white"}" text-anchor="middle">${s}</text>
                <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${n ? "white" : "#333"}" text-anchor="middle">${o}</text>
            </svg>
        `;
  }
};
ce([
  T({ attribute: !1 })
], q.prototype, "hass", 2);
ce([
  ie()
], q.prototype, "_config", 2);
ce([
  ie()
], q.prototype, "_showAllCalendars", 2);
q = ce([
  be("calendar-card-plus-editor")
], q);
const Tt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusEditor() {
    return q;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  ne as CalendarCardPlus
};
