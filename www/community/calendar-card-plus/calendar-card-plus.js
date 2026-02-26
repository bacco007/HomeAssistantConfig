var Lt = Object.defineProperty;
var jt = (n, t, e) => t in n ? Lt(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var S = (n, t, e) => jt(n, typeof t != "symbol" ? t + "" : t, e);
var Nt = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
async function Bt(n, t, e, i) {
  const s = encodeURI(`?start=${t.toISOString()}&end=${e.toISOString()}`), r = i.map(async (o) => {
    try {
      const l = await n.callApi("GET", `calendars/${o}${s}`);
      if (!Array.isArray(l))
        throw new Error("Response is not an array");
      return l.map((h) => {
        var _, v, b, w, u, m;
        const c = ((_ = h.start) == null ? void 0 : _.dateTime) || ((v = h.start) == null ? void 0 : v.date) || h.start, p = ((b = h.end) == null ? void 0 : b.dateTime) || ((w = h.end) == null ? void 0 : w.date) || h.end;
        return {
          ...h,
          start: { dateTime: c.includes("T") ? c : void 0, date: c.includes("T") ? void 0 : c },
          end: { dateTime: p.includes("T") ? p : void 0, date: p.includes("T") ? void 0 : p },
          summary: h.summary || h.title || "Unknown Event",
          entity_id: o,
          calendar_name: ((m = (u = n.states[o]) == null ? void 0 : u.attributes) == null ? void 0 : m.friendly_name) || o
        };
      });
    } catch {
      const d = n.states[o];
      return d && d.attributes.start_time && d.attributes.end_time ? [{
        start: { dateTime: d.attributes.start_time.replace(" ", "T") },
        end: { dateTime: d.attributes.end_time.replace(" ", "T") },
        summary: d.attributes.message || d.attributes.friendly_name,
        location: d.attributes.location,
        description: d.attributes.description,
        entity_id: o,
        calendar_name: d.attributes.friendly_name || o
      }] : [];
    }
  });
  return (await Promise.all(r)).flat();
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, ct = X.ShadowRoot && (X.ShadyCSS === void 0 || X.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ht = Symbol(), gt = /* @__PURE__ */ new WeakMap();
let kt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== ht) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ct && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = gt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && gt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Rt = (n) => new kt(typeof n == "string" ? n : n + "", void 0, ht), zt = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((i, s, r) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + n[r + 1], n[0]);
  return new kt(e, n, ht);
}, Ht = (n, t) => {
  if (ct) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = X.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, n.appendChild(i);
  }
}, vt = ct ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Rt(e);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: It, defineProperty: Wt, getOwnPropertyDescriptor: Vt, getOwnPropertyNames: Zt, getOwnPropertySymbols: Kt, getPrototypeOf: qt } = Object, k = globalThis, ft = k.trustedTypes, Gt = ft ? ft.emptyScript : "", st = k.reactiveElementPolyfillSupport, V = (n, t) => n, Y = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? Gt : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, _t = (n, t) => !It(n, t), yt = { attribute: !0, type: String, converter: Y, reflect: !1, useDefault: !1, hasChanged: _t };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), k.litPropertyMetadata ?? (k.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let L = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = yt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && Wt(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: r } = Vt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: s, set(a) {
      const o = s == null ? void 0 : s.call(this);
      r == null || r.call(this, a), this.requestUpdate(t, o, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? yt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(V("elementProperties"))) return;
    const t = qt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(V("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(V("properties"))) {
      const e = this.properties, i = [...Zt(e), ...Kt(e)];
      for (const s of i) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, s] of e) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const s = this._$Eu(e, i);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i) e.unshift(vt(s));
    } else t !== void 0 && e.push(vt(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ht(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) == null ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) == null ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    var r;
    const i = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, i);
    if (s !== void 0 && i.reflect === !0) {
      const a = (((r = i.converter) == null ? void 0 : r.toAttribute) !== void 0 ? i.converter : Y).toAttribute(e, i.type);
      this._$Em = t, a == null ? this.removeAttribute(s) : this.setAttribute(s, a), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r, a;
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const o = i.getPropertyOptions(s), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((r = o.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? o.converter : Y;
      this._$Em = s;
      const d = l.fromAttribute(e, o.type);
      this[s] = d ?? ((a = this._$Ej) == null ? void 0 : a.get(s)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, r) {
    var a;
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (r = this[t]), i ?? (i = o.getPropertyOptions(t)), !((i.hasChanged ?? _t)(r, e) || i.useDefault && i.reflect && r === ((a = this._$Ej) == null ? void 0 : a.get(t)) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: s, wrapped: r }, a) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, a] of this._$Ep) this[r] = a;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, a] of s) {
        const { wrapped: o } = a, l = this[r];
        o !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, a, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((s) => {
        var r;
        return (r = s.hostUpdate) == null ? void 0 : r.call(s);
      }), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var s;
      return (s = i.hostUpdated) == null ? void 0 : s.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
L.elementStyles = [], L.shadowRootOptions = { mode: "open" }, L[V("elementProperties")] = /* @__PURE__ */ new Map(), L[V("finalized")] = /* @__PURE__ */ new Map(), st == null || st({ ReactiveElement: L }), (k.reactiveElementVersions ?? (k.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Z = globalThis, $t = (n) => n, tt = Z.trustedTypes, xt = tt ? tt.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, Tt = "$lit$", E = `lit$${Math.random().toFixed(9).slice(2)}$`, Pt = "?" + E, Ft = `<${Pt}>`, U = document, K = () => U.createComment(""), q = (n) => n === null || typeof n != "object" && typeof n != "function", ut = Array.isArray, Jt = (n) => ut(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", nt = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, wt = /-->/g, bt = />/g, T = RegExp(`>|${nt}(?:([^\\s"'>=/]+)(${nt}*=${nt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), At = /'/g, Ct = /"/g, Dt = /^(?:script|style|textarea|title)$/i, Qt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), g = Qt(1), N = Symbol.for("lit-noChange"), f = Symbol.for("lit-nothing"), St = /* @__PURE__ */ new WeakMap(), D = U.createTreeWalker(U, 129);
function Mt(n, t) {
  if (!ut(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return xt !== void 0 ? xt.createHTML(t) : t;
}
const Xt = (n, t) => {
  const e = n.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = W;
  for (let o = 0; o < e; o++) {
    const l = n[o];
    let d, h, c = -1, p = 0;
    for (; p < l.length && (a.lastIndex = p, h = a.exec(l), h !== null); ) p = a.lastIndex, a === W ? h[1] === "!--" ? a = wt : h[1] !== void 0 ? a = bt : h[2] !== void 0 ? (Dt.test(h[2]) && (s = RegExp("</" + h[2], "g")), a = T) : h[3] !== void 0 && (a = T) : a === T ? h[0] === ">" ? (a = s ?? W, c = -1) : h[1] === void 0 ? c = -2 : (c = a.lastIndex - h[2].length, d = h[1], a = h[3] === void 0 ? T : h[3] === '"' ? Ct : At) : a === Ct || a === At ? a = T : a === wt || a === bt ? a = W : (a = T, s = void 0);
    const _ = a === T && n[o + 1].startsWith("/>") ? " " : "";
    r += a === W ? l + Ft : c >= 0 ? (i.push(d), l.slice(0, c) + Tt + l.slice(c) + E + _) : l + E + (c === -2 ? o : _);
  }
  return [Mt(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class G {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let r = 0, a = 0;
    const o = t.length - 1, l = this.parts, [d, h] = Xt(t, e);
    if (this.el = G.createElement(d, i), D.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (s = D.nextNode()) !== null && l.length < o; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const c of s.getAttributeNames()) if (c.endsWith(Tt)) {
          const p = h[a++], _ = s.getAttribute(c).split(E), v = /([.?@])?(.*)/.exec(p);
          l.push({ type: 1, index: r, name: v[2], strings: _, ctor: v[1] === "." ? te : v[1] === "?" ? ee : v[1] === "@" ? ie : et }), s.removeAttribute(c);
        } else c.startsWith(E) && (l.push({ type: 6, index: r }), s.removeAttribute(c));
        if (Dt.test(s.tagName)) {
          const c = s.textContent.split(E), p = c.length - 1;
          if (p > 0) {
            s.textContent = tt ? tt.emptyScript : "";
            for (let _ = 0; _ < p; _++) s.append(c[_], K()), D.nextNode(), l.push({ type: 2, index: ++r });
            s.append(c[p], K());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Pt) l.push({ type: 2, index: r });
      else {
        let c = -1;
        for (; (c = s.data.indexOf(E, c + 1)) !== -1; ) l.push({ type: 7, index: r }), c += E.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = U.createElement("template");
    return i.innerHTML = t, i;
  }
}
function B(n, t, e = n, i) {
  var a, o;
  if (t === N) return t;
  let s = i !== void 0 ? (a = e._$Co) == null ? void 0 : a[i] : e._$Cl;
  const r = q(t) ? void 0 : t._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== r && ((o = s == null ? void 0 : s._$AO) == null || o.call(s, !1), r === void 0 ? s = void 0 : (s = new r(n), s._$AT(n, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = s : e._$Cl = s), s !== void 0 && (t = B(n, s._$AS(n, t.values), s, i)), t;
}
class Yt {
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
    const { el: { content: e }, parts: i } = this._$AD, s = ((t == null ? void 0 : t.creationScope) ?? U).importNode(e, !0);
    D.currentNode = s;
    let r = D.nextNode(), a = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let d;
        l.type === 2 ? d = new J(r, r.nextSibling, this, t) : l.type === 1 ? d = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (d = new se(r, this, t)), this._$AV.push(d), l = i[++o];
      }
      a !== (l == null ? void 0 : l.index) && (r = D.nextNode(), a++);
    }
    return D.currentNode = U, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class J {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = f, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
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
    t = B(this, t, e), q(t) ? t === f || t == null || t === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : t !== this._$AH && t !== N && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Jt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== f && q(this._$AH) ? this._$AA.nextSibling.data = t : this.T(U.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = G.createElement(Mt(i.h, i.h[0]), this.options)), i);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === s) this._$AH.p(e);
    else {
      const a = new Yt(s, this), o = a.u(this.options);
      a.p(e), this.T(o), this._$AH = a;
    }
  }
  _$AC(t) {
    let e = St.get(t.strings);
    return e === void 0 && St.set(t.strings, e = new G(t)), e;
  }
  k(t) {
    ut(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const r of t) s === e.length ? e.push(i = new J(this.O(K()), this.O(K()), this, this.options)) : i = e[s], i._$AI(r), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const s = $t(t).nextSibling;
      $t(t).remove(), t = s;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class et {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, s, r) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = f;
  }
  _$AI(t, e = this, i, s) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = B(this, t, e, 0), a = !q(t) || t !== this._$AH && t !== N, a && (this._$AH = t);
    else {
      const o = t;
      let l, d;
      for (t = r[0], l = 0; l < r.length - 1; l++) d = B(this, o[i + l], e, l), d === N && (d = this._$AH[l]), a || (a = !q(d) || d !== this._$AH[l]), d === f ? t = f : t !== f && (t += (d ?? "") + r[l + 1]), this._$AH[l] = d;
    }
    a && !s && this.j(t);
  }
  j(t) {
    t === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class te extends et {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === f ? void 0 : t;
  }
}
class ee extends et {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== f);
  }
}
class ie extends et {
  constructor(t, e, i, s, r) {
    super(t, e, i, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = B(this, t, e, 0) ?? f) === N) return;
    const i = this._$AH, s = t === f && i !== f || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== f && (i === f || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class se {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    B(this, t);
  }
}
const at = Z.litHtmlPolyfillSupport;
at == null || at(G, J), (Z.litHtmlVersions ?? (Z.litHtmlVersions = [])).push("3.3.2");
const ne = (n, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = s = new J(t.insertBefore(K(), r), r, void 0, e ?? {});
  }
  return s._$AI(n), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M = globalThis;
class j extends L {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ne(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return N;
  }
}
var Et;
j._$litElement$ = !0, j.finalized = !0, (Et = M.litElementHydrateSupport) == null || Et.call(M, { LitElement: j });
const rt = M.litElementPolyfillSupport;
rt == null || rt({ LitElement: j });
(M.litElementVersions ?? (M.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ut = (n) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(n, t);
  }) : customElements.define(n, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ae = { attribute: !0, type: String, converter: Y, reflect: !1, hasChanged: _t }, re = (n = ae, t, e) => {
  const { kind: i, metadata: s } = e;
  let r = globalThis.litPropertyMetadata.get(s);
  if (r === void 0 && globalThis.litPropertyMetadata.set(s, r = /* @__PURE__ */ new Map()), i === "setter" && ((n = Object.create(n)).wrapped = !0), r.set(e.name, n), i === "accessor") {
    const { name: a } = e;
    return { set(o) {
      const l = t.get.call(this);
      t.set.call(this, o), this.requestUpdate(a, l, n, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(a, void 0, n, o), o;
    } };
  }
  if (i === "setter") {
    const { name: a } = e;
    return function(o) {
      const l = this[a];
      t.call(this, o), this.requestUpdate(a, l, n, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function mt(n) {
  return (t, e) => typeof e == "object" ? re(n, t, e) : ((i, s, r) => {
    const a = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, i), a ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(n, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function it(n) {
  return mt({ ...n, state: !0, attribute: !1 });
}
const O = {
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
    popup_upcoming_events: "Upcoming events"
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
    popup_upcoming_events: "Bevorstehende Ereignisse"
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
    popup_upcoming_events: "Événements à venir"
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
    popup_upcoming_events: "Prossimi eventi"
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
    popup_upcoming_events: "Próximos eventos"
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
    popup_upcoming_events: "Aankomende evenementen"
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
    popup_upcoming_events: "Próximos eventos"
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
    popup_upcoming_events: "Предстоящие события"
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
    popup_upcoming_events: "Nadchodzące wydarzenia"
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
    popup_upcoming_events: "Kommande händelser"
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
    popup_upcoming_events: "Kommende begivenheder"
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
    popup_upcoming_events: "Kommende hendelser"
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
    popup_upcoming_events: "Tulevat tapahtumat"
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
    popup_upcoming_events: "Nadcházející události"
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
    popup_upcoming_events: "Közelgő események"
  }
};
function $(n, t, e, i) {
  var a;
  const s = ((a = n.locale) == null ? void 0 : a.language) || n.language || "en";
  let r;
  if (O[s] && O[s][t])
    r = O[s][t];
  else if (O.en && O.en[t])
    r = O.en[t];
  else
    return t;
  return e && i && (r = r.replace(e, i)), r;
}
function oe(n, t, e) {
  var s, r;
  const i = (e == null ? void 0 : e.unfold_events) || !1;
  if (t === void 0)
    return g`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--primary-color, #03a9f4);">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${$(n, "loading")}</div>
                </div>
            </div>
        </div>
        `;
  if (t.length === 0)
    return g`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--disabled-text-color, #bdbdbb);">
                    <ha-icon icon="mdi:calendar-remove"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${$(n, "no_events")}</div>
                </div>
            </div>
        </div>
        `;
  if (!i) {
    const a = t[0], o = t.length - 1, l = a.summary;
    let d, h;
    try {
      if (d = new Date(a.start.dateTime || a.start.date), h = new Date(a.end.dateTime || a.end.date), isNaN(d.getTime()) || isNaN(h.getTime())) throw new Error("Invalid Date");
    } catch {
      return g`<div class="error">Date Error</div>`;
    }
    const c = /* @__PURE__ */ new Date(), p = !a.start.dateTime;
    let _;
    if (d > c)
      if (e != null && e.show_date) {
        const m = ((s = n.locale) == null ? void 0 : s.language) || n.language || navigator.language, y = d.toLocaleDateString(m, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (p)
          _ = y;
        else {
          const C = d.toLocaleTimeString(m, { hour: "2-digit", minute: "2-digit" });
          _ = `${y}, ${C}${m.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const m = d.getTime() - c.getTime(), y = Math.ceil(m / 6e4);
        _ = dt(n, y);
      }
    else if (p)
      _ = n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const m = ((r = n.locale) == null ? void 0 : r.language) || n.language || navigator.language, y = (C) => C.toLocaleTimeString(m, { hour: "2-digit", minute: "2-digit" });
      _ = `${y(d)} - ${y(h)}`;
    }
    o > 0 && (_ += ` ${$(n, "more_events", "{x}", o.toString())}`), e != null && e.show_calendar_name && a.calendar_name && (_ += ` • ${a.calendar_name}`);
    const b = d <= c && h >= c ? c : d, w = ot(a.entity_id, e), u = lt(n, b, w);
    return g`
            <div class="calendar-container">
                <div class="calendar-item"  
                     title="${l}"
                     @click=${(m) => de(m, n, t)}>
                     <div class="calendar-icon dynamic">
                        ${u}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${l}</div>
                        <div class="event-time">${_}</div>
                    </div>
                    <ha-icon-button icon="mdi:chevron-right"></ha-icon-button>
                </div>
            </div>
        `;
  }
  return g`
        <div class="calendar-container">
            ${t.map((a, o) => {
    var C, H;
    const l = a.summary;
    let d, h;
    try {
      if (d = new Date(a.start.dateTime || a.start.date), h = new Date(a.end.dateTime || a.end.date), isNaN(d.getTime())) throw new Error("Invalid start date");
      if (isNaN(h.getTime())) throw new Error("Invalid end date");
    } catch {
      return g`<div class="error">Date Error for ${l}</div>`;
    }
    const c = /* @__PURE__ */ new Date(), p = !a.start.dateTime;
    let _, v = -1;
    if (d > c)
      if (e != null && e.show_date) {
        const x = ((C = n.locale) == null ? void 0 : C.language) || n.language || navigator.language, A = d.toLocaleDateString(x, { day: "2-digit", month: "2-digit", year: "numeric" });
        if (p)
          _ = A;
        else {
          const z = d.toLocaleTimeString(x, { hour: "2-digit", minute: "2-digit" });
          _ = `${A}, ${z}${x.startsWith("de") ? " Uhr" : ""}`;
        }
      } else {
        const x = d.getTime() - c.getTime(), A = Math.ceil(x / 6e4);
        _ = dt(n, A);
      }
    else if (p)
      _ = n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    else {
      const x = ((H = n.locale) == null ? void 0 : H.language) || n.language || navigator.language, A = (Ot) => Ot.toLocaleTimeString(x, { hour: "2-digit", minute: "2-digit" });
      _ = `${A(d)} - ${A(h)}`;
      const z = h.getTime() - d.getTime(), I = c.getTime() - d.getTime();
      z > 0 && (v = Math.max(0, Math.min(100, I / z * 100)));
    }
    e != null && e.show_calendar_name && a.calendar_name && (_ += ` • ${a.calendar_name}`);
    const w = d <= c && h >= c ? c : d, u = ot(a.entity_id, e), m = lt(n, w, u), y = (e == null ? void 0 : e.show_divider) && o > 0 && t[o - 1].entity_id !== a.entity_id;
    return g`
                ${y ? g`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item"  
                     style="margin-bottom: 6px;"
                     title="${l}"
                     @click=${(x) => ce(x, a.entity_id)}>
                     <div class="calendar-icon dynamic">
                        ${m}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${l}</div>
                        <div class="event-time">${_}</div>
                        ${v >= 0 ? g`
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${v}%"></div>
                            </div>
                        ` : ""}
                    </div>
                </div>
                `;
  })}
        </div>
    `;
}
function ot(n, t) {
  var i;
  const e = ((i = t == null ? void 0 : t.calendar_colors) == null ? void 0 : i[n]) || (t == null ? void 0 : t.calendar_icon_color) || "#fa3e3e";
  return le(e);
}
function le(n) {
  return n.startsWith("#") || n.startsWith("rgb") || n.startsWith("hsl") || n.startsWith("var") ? n : `var(--${n}-color)`;
}
function de(n, t, e) {
  const i = new CustomEvent("calendar-card-show-detail", {
    bubbles: !0,
    composed: !0,
    detail: {
      title: $(t, "popup_upcoming_events"),
      entities: e
    }
  });
  n.target.dispatchEvent(i);
}
function ce(n, t) {
  const e = new CustomEvent("hass-more-info", {
    bubbles: !0,
    composed: !0,
    detail: { entityId: t }
  });
  n.target.dispatchEvent(e);
}
function lt(n, t, e) {
  var a;
  const i = ((a = n.locale) == null ? void 0 : a.language) || n.language || navigator.language, s = t.toLocaleDateString(i, { month: "short" }).toUpperCase(), r = t.getDate();
  return g`
        <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
            <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="white"></rect>
            <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${e}"></path>
            <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">${s}</text>
            <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="#333" text-anchor="middle">${r}</text>
        </svg>
    `;
}
function dt(n, t) {
  if (t < 60)
    return t === 1 ? $(n, "starts_in_min", "{x}", t.toString()) : $(n, "starts_in_mins", "{x}", t.toString());
  if (t < 1440) {
    const i = Math.round(t / 60);
    return i === 1 ? $(n, "starts_in_hour", "{x}", i.toString()) : $(n, "starts_in_hours", "{x}", i.toString());
  }
  if (t < 43200) {
    const i = Math.round(t / 1440);
    return i === 1 ? $(n, "starts_in_day", "{x}", i.toString()) : $(n, "starts_in_days", "{x}", i.toString());
  }
  const e = Math.round(t / 10080);
  return e === 1 ? $(n, "starts_in_week", "{x}", e.toString()) : $(n, "starts_in_weeks", "{x}", e.toString());
}
var he = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, Q = (n, t, e, i) => {
  for (var s = i > 1 ? void 0 : i ? _e(t, e) : t, r = n.length - 1, a; r >= 0; r--)
    (a = n[r]) && (s = (i ? a(t, e, s) : a(s)) || s);
  return i && s && he(t, e, s), s;
};
let R = class extends j {
  constructor() {
    super(...arguments);
    S(this, "hass");
    S(this, "config");
    S(this, "_detailPopup", { open: !1, title: "", events: [] });
    S(this, "_events");
    S(this, "_handleShowDetail", (t) => {
      this._detailPopup = {
        open: !0,
        title: t.detail.title,
        events: t.detail.entities
      }, this.requestUpdate();
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("calendar-card-show-detail", this._handleShowDetail);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("calendar-card-show-detail", this._handleShowDetail);
  }
  willUpdate(t) {
    super.willUpdate(t), this.hass && this.config && (this._events === void 0 || t.has("config")) && this._fetchEvents();
  }
  setConfig(t) {
    if (!t)
      throw new Error("Invalid configuration");
    this.config = t;
  }
  async _fetchEvents() {
    if (!this.hass || !this.config) return;
    const t = /* @__PURE__ */ new Date();
    let e;
    if (this.config.upcoming_events) {
      let r = 1440;
      this.config.days !== void 0 || this.config.hours !== void 0 || this.config.minutes !== void 0 ? r = (this.config.days || 0) * 1440 + (this.config.hours || 0) * 60 + (this.config.minutes || 0) : this.config.max_minutes_until_start !== void 0 && (r = this.config.max_minutes_until_start), e = new Date(t.getTime() + r * 6e4);
    } else
      e = new Date(t), e.setHours(23, 59, 59, 999);
    const i = Object.keys(this.hass.states).filter((r) => r.startsWith("calendar.")).filter((r) => {
      var a;
      return !((a = this.config.exclude_entities) != null && a.includes(r));
    });
    if (i.length === 0) {
      this._events = [];
      return;
    }
    const s = await Bt(this.hass, t, e, i);
    s.sort((r, a) => {
      const o = new Date(r.start.dateTime || r.start.date).getTime(), l = new Date(a.start.dateTime || a.start.date).getTime();
      return o - l;
    }), this._events = s, this.requestUpdate();
  }
  _closeDetailPopup() {
    this._detailPopup = { ...this._detailPopup, open: !1 }, this.requestUpdate();
  }
  render() {
    if (!this.config || !this.hass)
      return g``;
    const t = oe(this.hass, this._events, this.config);
    return g`
            <ha-card>
                ${t}

                ${this._detailPopup.open ? g`
                    <ha-dialog
                        open
                        hideActions
                        @closed=${this._closeDetailPopup}
                        class="detail-dialog"
                    >
                        <div class="dialog-header">
                            <ha-icon-button .path=${Nt} @click=${this._closeDetailPopup}></ha-icon-button>
                            <h2 class="mdc-dialog__title">${this._detailPopup.title}</h2>
                        </div>
                        <div class="dialog-content">
                            ${this._renderGroupedEntities(this._detailPopup.events)}
                        </div>
                    </ha-dialog>
                ` : ""}
            </ha-card>
        `;
  }
  _renderGroupedEntities(t) {
    return t.map((e) => {
      var _, v, b, w;
      const i = e.summary;
      let s = "", r, a;
      try {
        r = new Date(e.start.dateTime || e.start.date), a = new Date(e.end.dateTime || e.end.date);
      } catch {
        return g`<div class="error">Date Error</div>`;
      }
      const o = /* @__PURE__ */ new Date(), l = !e.start.dateTime;
      if (r > o)
        if ((_ = this.config) != null && _.show_date) {
          const u = ((v = this.hass.locale) == null ? void 0 : v.language) || this.hass.language || navigator.language, m = r.toLocaleDateString(u, { day: "2-digit", month: "2-digit", year: "numeric" });
          if (l)
            s = m;
          else {
            const y = r.toLocaleTimeString(u, { hour: "2-digit", minute: "2-digit" });
            s = `${m}, ${y}${u.startsWith("de") ? " Uhr" : ""}`;
          }
        } else {
          const u = r.getTime() - o.getTime(), m = Math.ceil(u / 6e4);
          s = dt(this.hass, m);
        }
      else if (l)
        s = this.hass.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
      else {
        const u = ((b = this.hass.locale) == null ? void 0 : b.language) || this.hass.language || navigator.language, m = (y) => y.toLocaleTimeString(u, { hour: "2-digit", minute: "2-digit" });
        s = `${m(r)} - ${m(a)}`;
      }
      (w = this.config) != null && w.show_calendar_name && e.calendar_name && (s += ` • ${e.calendar_name}`);
      const h = r <= o && a >= o ? o : r, c = ot(e.entity_id, this.config), p = lt(this.hass, h, c);
      return g`
            <div class="event-item" @click=${() => this._handleMoreInfo(e.entity_id)}>
                <div class="event-icon dynamic" style="background: transparent;">
                     ${p}
                </div>
                <div class="event-info">
                    <div class="event-name">${i}</div>
                    <div class="event-state">${s}</div>
                </div>
            </div>
            `;
    });
  }
  _handleMoreInfo(t) {
    const e = new CustomEvent("hass-more-info", {
      bubbles: !0,
      composed: !0,
      detail: { entityId: t }
    });
    this.dispatchEvent(e);
  }
  static get styles() {
    return zt`
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
                --mdc-dialog-min-width: 400px;
                --mdc-dialog-max-width: 600px;
                --dialog-content-padding: 12px;
            }

            .dialog-header {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: 8px;
                position: sticky;
                top: 0;
                z-index: 10;
                border-bottom: 1px solid rgba(0, 0, 0, 0.07);
                background: var(--mdc-theme-surface, #fff);
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
    return await Promise.resolve().then(() => pe), document.createElement("calendar-card-plus-editor");
  }
  static getStubConfig(t) {
    return {
      type: "custom:calendar-card-plus",
      exclude_entities: [],
      unfold_events: !1
    };
  }
};
Q([
  mt({ attribute: !1 })
], R.prototype, "hass", 2);
Q([
  it()
], R.prototype, "config", 2);
Q([
  it()
], R.prototype, "_detailPopup", 2);
Q([
  it()
], R.prototype, "_events", 2);
R = Q([
  Ut("calendar-card-plus")
], R);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-card-plus",
  name: "Dynamic Calendar Card Plus",
  preview: !0,
  description: "A standalone calendar card with dynamic grid styling"
});
const P = (n, t, e, i) => {
  i = i || {}, e = e ?? {};
  const s = new Event(t, {
    bubbles: i.bubbles === void 0 ? !0 : i.bubbles,
    cancelable: !!i.cancelable,
    composed: i.composed === void 0 ? !0 : i.composed
  });
  return s.detail = e, n.dispatchEvent(s), s;
};
var ue = Object.defineProperty, me = Object.getOwnPropertyDescriptor, pt = (n, t, e, i) => {
  for (var s = i > 1 ? void 0 : i ? me(t, e) : t, r = n.length - 1, a; r >= 0; r--)
    (a = n[r]) && (s = (i ? a(t, e, s) : a(s)) || s);
  return i && s && ue(t, e, s), s;
};
let F = class extends j {
  constructor() {
    super(...arguments);
    S(this, "hass");
    S(this, "_config", { type: "custom:calendar-card-plus" });
  }
  set config(t) {
    this.setConfig(t);
  }
  setConfig(t) {
    this._config = t, this.requestUpdate();
  }
  render() {
    var o, l, d, h, c, p, _, v, b, w;
    if (!this.hass)
      return g``;
    const t = this._config.upcoming_events ?? !1, e = this._config.unfold_events ?? !1, i = this._config.days ?? 1, s = this._config.hours ?? 0, r = this._config.minutes ?? 0, a = this._config.exclude_entities ?? [];
    return g`
            <div class="card-config">


                <div class="settings-row">
                    <span class="label">${$(this.hass, "editor_unfold_events")}</span>
                    <ha-switch
                        .checked=${e}
                        @change=${this._compactModeChanged}
                    ></ha-switch>
                </div>

            ${e ? g`
                <div class="settings-row">
                    <span class="label">${$(this.hass, "editor_show_divider")}</span>
                    <ha-switch
                        .checked=${this._config.show_divider ?? !1}
                        @change=${this._calendarDividerChanged}
                    ></ha-switch>
                </div>
            ` : ""}

                <div class="settings-row">
                    <span class="label">${(o = this.hass) == null ? void 0 : o.localize("ui.common.show")} ${(l = this.hass) == null ? void 0 : l.localize("component.calendar.entity_component._.name")} ${(d = this.hass) == null ? void 0 : d.localize("ui.common.name")}</span>
                    <ha-switch
                        .checked=${this._config.show_calendar_name ?? !1}
                        @change=${(u) => this._toggleBooleanConfig(u, "show_calendar_name")}
                    ></ha-switch>
                </div>

                <div class="settings-row">
                    <span class="label">${(h = this.hass) == null ? void 0 : h.localize("ui.common.show")} ${((c = this.hass) == null ? void 0 : c.localize("ui.dialogs.helper_settings.input_datetime.date")) || "Date"}</span>
                    <ha-switch
                        .checked=${this._config.show_date ?? !1}
                        @change=${(u) => this._toggleBooleanConfig(u, "show_date")}
                    ></ha-switch>
                </div>

                <div class="settings-row">
                    <span class="label">${$(this.hass, "editor_show_upcoming")}</span>
                    <ha-switch
                        .checked=${t}
                        @change=${this._calendarShowAllChanged}
                    ></ha-switch>
                </div>                

            ${t ? g`
                <div class="settings-row full-width">
                     <span class="label" style="margin-bottom: 8px;">${((p = this.hass) == null ? void 0 : p.localize("ui.panel.lovelace.editor.card.statistic.period")) || "Period"}</span>
                     <div class="period-selectors">
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 365, mode: "box" } }}
                            .value=${i}
                            .label=${((_ = this.hass) == null ? void 0 : _.localize("component.input_datetime.entity_component._.state_attributes.day.name")) || "Days"}
                            .configValue=${"days"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 23, mode: "box" } }}
                            .value=${s}
                            .label=${((v = this.hass) == null ? void 0 : v.localize("component.input_datetime.entity_component._.state_attributes.hour.name")) || "Hours"}
                            .configValue=${"hours"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 59, mode: "box" } }}
                            .value=${r}
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

                <h4>${((w = this.hass) == null ? void 0 : w.localize("ui.components.calendar.my_calendars")) || "Calendars"}</h4>
                <div class="entities-list">
                    ${this._getCalendarEntities().map((u) => {
      var H, x, A, z;
      const m = !a.includes(u.entity_id), y = ((H = this._config.calendar_colors) == null ? void 0 : H[u.entity_id]) || "", C = this._toCssColor(y || this._config.calendar_icon_color || "#fa3e3e");
      return g`
                            <div class="entity-row ${m ? "" : "disabled"}">
                                <div class="entity-row-top">
                                    <div class="entity-icon dynamic" style="background: transparent;">
                                        ${this._renderDynamicIcon(/* @__PURE__ */ new Date(), C)}
                                    </div>
                                    <div class="entity-info">
                                        <span class="entity-name">${u.attributes.friendly_name || u.entity_id}</span>
                                        <span class="entity-id">${u.entity_id}</span>
                                    </div>
                                    <ha-button
                                        size="small" 
                                        appearance="filled" 
                                        variant="brand" 
                                        class="${m ? "action-hide" : "action-show"}"
                                        @click=${(I) => this._calendarToggleEntity(I, u.entity_id)}
                                    >
                                        ${m ? ((x = this.hass) == null ? void 0 : x.localize("ui.common.hide")) || "Hide" : ((A = this.hass) == null ? void 0 : A.localize("ui.common.show")) || "Show"}
                                    </ha-button>
                                </div>
                                <div class="entity-row-bottom">
                                     <ha-selector
                                        .hass=${this.hass}
                                        .selector=${{ ui_color: {} }}
                                        .value=${y}
                                        .label=${((z = this.hass) == null ? void 0 : z.localize("ui.panel.lovelace.editor.card.tile.color")) || "Color"}
                                        @value-changed=${(I) => this._calendarColorChanged(I, u.entity_id)}
                                    ></ha-selector>
                                </div>
                            </div>
                        `;
    })}
                </div>
            </div>
        `;
  }
  _getCalendarEntities() {
    return this.hass ? Object.keys(this.hass.states).filter((t) => t.startsWith("calendar.")).map((t) => {
      var e;
      return (e = this.hass) == null ? void 0 : e.states[t];
    }) : [];
  }
  _calendarToggleEntity(t, e) {
    t.stopPropagation();
    const i = [...this._config.exclude_entities ?? []], s = i.indexOf(e);
    s === -1 ? i.push(e) : i.splice(s, 1), this._config = {
      ...this._config,
      exclude_entities: i
    }, P(this, "config-changed", { config: this._config });
  }
  _calendarShowAllChanged(t) {
    const e = t.target.checked;
    this._config = {
      ...this._config,
      upcoming_events: e
    }, P(this, "config-changed", { config: this._config });
  }
  _compactModeChanged(t) {
    const e = t.target.checked;
    this._config = {
      ...this._config,
      unfold_events: e
    }, P(this, "config-changed", { config: this._config });
  }
  _calendarDividerChanged(t) {
    const e = t.target.checked;
    this._config = {
      ...this._config,
      show_divider: e
    }, P(this, "config-changed", { config: this._config });
  }
  _toggleBooleanConfig(t, e) {
    const i = t.target.checked;
    this._config = {
      ...this._config,
      [e]: i
    }, P(this, "config-changed", { config: this._config });
  }
  _valueChanged(t) {
    var s;
    if (!this._config || !this.hass)
      return;
    const e = t.target, i = ((s = t.detail) == null ? void 0 : s.value) ?? e.value;
    this._config[e.configValue] !== i && e.configValue && (this._config = {
      ...this._config,
      [e.configValue]: i
    }, P(this, "config-changed", { config: this._config }));
  }
  _calendarColorChanged(t, e) {
    const i = t.detail.value, s = this._config.calendar_colors || {};
    this._config = {
      ...this._config,
      calendar_colors: {
        ...s,
        [e]: i
      }
    }, P(this, "config-changed", { config: this._config });
  }
  static get styles() {
    return zt`
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
  _toCssColor(t) {
    return t.startsWith("#") || t.startsWith("rgb") || t.startsWith("hsl") || t.startsWith("var") ? t : `var(--${t}-color)`;
  }
  _renderDynamicIcon(t, e) {
    var a, o, l;
    const i = ((o = (a = this.hass) == null ? void 0 : a.locale) == null ? void 0 : o.language) || ((l = this.hass) == null ? void 0 : l.language) || navigator.language || "en", s = t.toLocaleDateString(i, { month: "short" }).toUpperCase(), r = t.getDate();
    return g`
            <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
                <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="white"></rect>
                <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${e}"></path>
                <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">${s}</text>
                <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="#333" text-anchor="middle">${r}</text>
            </svg>
        `;
  }
};
pt([
  mt({ attribute: !1 })
], F.prototype, "hass", 2);
pt([
  it()
], F.prototype, "_config", 2);
F = pt([
  Ut("calendar-card-plus-editor")
], F);
const pe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusEditor() {
    return F;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  R as CalendarCardPlus
};
