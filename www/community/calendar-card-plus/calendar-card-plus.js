var it = Object.defineProperty;
var at = (s, e, t) => e in s ? it(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var S = (s, e, t) => at(s, typeof e != "symbol" ? e + "" : e, t);
async function st(s, e, t, i) {
  const a = encodeURI(`?start=${e.toISOString()}&end=${t.toISOString()}`), o = i.map(async (c) => {
    try {
      const n = await s.callApi("GET", `calendars/${c}${a}`);
      if (!Array.isArray(n))
        throw new Error("Response is not an array");
      return n.map((l) => {
        var y, w, b, p, g, x;
        const u = ((y = l.start) == null ? void 0 : y.dateTime) || ((w = l.start) == null ? void 0 : w.date) || l.start, h = ((b = l.end) == null ? void 0 : b.dateTime) || ((p = l.end) == null ? void 0 : p.date) || l.end;
        return {
          ...l,
          start: { dateTime: u.includes("T") ? u : void 0, date: u.includes("T") ? void 0 : u },
          end: { dateTime: h.includes("T") ? h : void 0, date: h.includes("T") ? void 0 : h },
          summary: l.summary || l.title || "Unknown Event",
          entity_id: c,
          calendar_name: ((x = (g = s.states[c]) == null ? void 0 : g.attributes) == null ? void 0 : x.friendly_name) || c
        };
      });
    } catch {
      const d = s.states[c];
      return d && d.attributes.start_time && d.attributes.end_time ? [{
        start: { dateTime: d.attributes.start_time.replace(" ", "T") },
        end: { dateTime: d.attributes.end_time.replace(" ", "T") },
        summary: d.attributes.message || d.attributes.friendly_name,
        location: d.attributes.location,
        description: d.attributes.description,
        entity_id: c,
        calendar_name: d.attributes.friendly_name || c
      }] : [];
    }
  });
  return (await Promise.all(o)).flat();
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ue = globalThis, ze = ue.ShadowRoot && (ue.ShadyCSS === void 0 || ue.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ae = Symbol(), je = /* @__PURE__ */ new WeakMap();
let Ge = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== Ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ze && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = je.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && je.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ot = (s) => new Ge(typeof s == "string" ? s : s + "", void 0, Ae), Ee = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, a, o) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(a) + s[o + 1], s[0]);
  return new Ge(t, s, Ae);
}, nt = (s, e) => {
  if (ze) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), a = ue.litNonce;
    a !== void 0 && i.setAttribute("nonce", a), i.textContent = t.cssText, s.appendChild(i);
  }
}, Le = ze ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return ot(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: rt, defineProperty: dt, getOwnPropertyDescriptor: lt, getOwnPropertyNames: ct, getOwnPropertySymbols: _t, getPrototypeOf: ht } = Object, V = globalThis, Be = V.trustedTypes, ut = Be ? Be.emptyScript : "", fe = V.reactiveElementPolyfillSupport, oe = (s, e) => s, me = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? ut : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, Se = (s, e) => !rt(s, e), Ne = { attribute: !0, type: String, converter: me, reflect: !1, useDefault: !1, hasChanged: Se };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), V.litPropertyMetadata ?? (V.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Q = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Ne) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), a = this.getPropertyDescriptor(e, i, t);
      a !== void 0 && dt(this.prototype, e, a);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: a, set: o } = lt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: a, set(r) {
      const c = a == null ? void 0 : a.call(this);
      o == null || o.call(this, r), this.requestUpdate(e, c, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ne;
  }
  static _$Ei() {
    if (this.hasOwnProperty(oe("elementProperties"))) return;
    const e = ht(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(oe("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(oe("properties"))) {
      const t = this.properties, i = [...ct(t), ..._t(t)];
      for (const a of i) this.createProperty(a, t[a]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, a] of t) this.elementProperties.set(i, a);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const a = this._$Eu(t, i);
      a !== void 0 && this._$Eh.set(a, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const a of i) t.unshift(Le(a));
    } else e !== void 0 && t.push(Le(e));
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
    return nt(e, this.constructor.elementStyles), e;
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
    var o;
    const i = this.constructor.elementProperties.get(e), a = this.constructor._$Eu(e, i);
    if (a !== void 0 && i.reflect === !0) {
      const r = (((o = i.converter) == null ? void 0 : o.toAttribute) !== void 0 ? i.converter : me).toAttribute(t, i.type);
      this._$Em = e, r == null ? this.removeAttribute(a) : this.setAttribute(a, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var o, r;
    const i = this.constructor, a = i._$Eh.get(e);
    if (a !== void 0 && this._$Em !== a) {
      const c = i.getPropertyOptions(a), n = typeof c.converter == "function" ? { fromAttribute: c.converter } : ((o = c.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? c.converter : me;
      this._$Em = a;
      const d = n.fromAttribute(t, c.type);
      this[a] = d ?? ((r = this._$Ej) == null ? void 0 : r.get(a)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, a = !1, o) {
    var r;
    if (e !== void 0) {
      const c = this.constructor;
      if (a === !1 && (o = this[e]), i ?? (i = c.getPropertyOptions(e)), !((i.hasChanged ?? Se)(o, t) || i.useDefault && i.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(e)) && !this.hasAttribute(c._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: a, wrapped: o }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), o !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), a === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [o, r] of a) {
        const { wrapped: c } = r, n = this[o];
        c !== !0 || this._$AL.has(o) || n === void 0 || this.C(o, void 0, r, n);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((a) => {
        var o;
        return (o = a.hostUpdate) == null ? void 0 : o.call(a);
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
    (t = this._$EO) == null || t.forEach((i) => {
      var a;
      return (a = i.hostUpdated) == null ? void 0 : a.call(i);
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
Q.elementStyles = [], Q.shadowRootOptions = { mode: "open" }, Q[oe("elementProperties")] = /* @__PURE__ */ new Map(), Q[oe("finalized")] = /* @__PURE__ */ new Map(), fe == null || fe({ ReactiveElement: Q }), (V.reactiveElementVersions ?? (V.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = globalThis, Oe = (s) => s, pe = ne.trustedTypes, He = pe ? pe.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, qe = "$lit$", U = `lit$${Math.random().toFixed(9).slice(2)}$`, Fe = "?" + U, mt = `<${Fe}>`, Y = document, re = () => Y.createComment(""), de = (s) => s === null || typeof s != "object" && typeof s != "function", Te = Array.isArray, pt = (s) => Te(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", $e = `[ 	
\f\r]`, se = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ue = /-->/g, Ve = />/g, I = RegExp(`>|${$e}(?:([^\\s"'>=/]+)(${$e}*=${$e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Re = /'/g, Ie = /"/g, Ye = /^(?:script|style|textarea|title)$/i, gt = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), _ = gt(1), X = Symbol.for("lit-noChange"), M = Symbol.for("lit-nothing"), Ke = /* @__PURE__ */ new WeakMap(), K = Y.createTreeWalker(Y, 129);
function Je(s, e) {
  if (!Te(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return He !== void 0 ? He.createHTML(e) : e;
}
const vt = (s, e) => {
  const t = s.length - 1, i = [];
  let a, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = se;
  for (let c = 0; c < t; c++) {
    const n = s[c];
    let d, l, u = -1, h = 0;
    for (; h < n.length && (r.lastIndex = h, l = r.exec(n), l !== null); ) h = r.lastIndex, r === se ? l[1] === "!--" ? r = Ue : l[1] !== void 0 ? r = Ve : l[2] !== void 0 ? (Ye.test(l[2]) && (a = RegExp("</" + l[2], "g")), r = I) : l[3] !== void 0 && (r = I) : r === I ? l[0] === ">" ? (r = a ?? se, u = -1) : l[1] === void 0 ? u = -2 : (u = r.lastIndex - l[2].length, d = l[1], r = l[3] === void 0 ? I : l[3] === '"' ? Ie : Re) : r === Ie || r === Re ? r = I : r === Ue || r === Ve ? r = se : (r = I, a = void 0);
    const y = r === I && s[c + 1].startsWith("/>") ? " " : "";
    o += r === se ? n + mt : u >= 0 ? (i.push(d), n.slice(0, u) + qe + n.slice(u) + U + y) : n + U + (u === -2 ? c : y);
  }
  return [Je(s, o + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class le {
  constructor({ strings: e, _$litType$: t }, i) {
    let a;
    this.parts = [];
    let o = 0, r = 0;
    const c = e.length - 1, n = this.parts, [d, l] = vt(e, t);
    if (this.el = le.createElement(d, i), K.currentNode = this.el.content, t === 2 || t === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (a = K.nextNode()) !== null && n.length < c; ) {
      if (a.nodeType === 1) {
        if (a.hasAttributes()) for (const u of a.getAttributeNames()) if (u.endsWith(qe)) {
          const h = l[r++], y = a.getAttribute(u).split(U), w = /([.?@])?(.*)/.exec(h);
          n.push({ type: 1, index: o, name: w[2], strings: y, ctor: w[1] === "." ? wt : w[1] === "?" ? ft : w[1] === "@" ? $t : ge }), a.removeAttribute(u);
        } else u.startsWith(U) && (n.push({ type: 6, index: o }), a.removeAttribute(u));
        if (Ye.test(a.tagName)) {
          const u = a.textContent.split(U), h = u.length - 1;
          if (h > 0) {
            a.textContent = pe ? pe.emptyScript : "";
            for (let y = 0; y < h; y++) a.append(u[y], re()), K.nextNode(), n.push({ type: 2, index: ++o });
            a.append(u[h], re());
          }
        }
      } else if (a.nodeType === 8) if (a.data === Fe) n.push({ type: 2, index: o });
      else {
        let u = -1;
        for (; (u = a.data.indexOf(U, u + 1)) !== -1; ) n.push({ type: 7, index: o }), u += U.length - 1;
      }
      o++;
    }
  }
  static createElement(e, t) {
    const i = Y.createElement("template");
    return i.innerHTML = e, i;
  }
}
function ee(s, e, t = s, i) {
  var r, c;
  if (e === X) return e;
  let a = i !== void 0 ? (r = t._$Co) == null ? void 0 : r[i] : t._$Cl;
  const o = de(e) ? void 0 : e._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== o && ((c = a == null ? void 0 : a._$AO) == null || c.call(a, !1), o === void 0 ? a = void 0 : (a = new o(s), a._$AT(s, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = a : t._$Cl = a), a !== void 0 && (e = ee(s, a._$AS(s, e.values), a, i)), e;
}
class yt {
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
    const { el: { content: t }, parts: i } = this._$AD, a = ((e == null ? void 0 : e.creationScope) ?? Y).importNode(t, !0);
    K.currentNode = a;
    let o = K.nextNode(), r = 0, c = 0, n = i[0];
    for (; n !== void 0; ) {
      if (r === n.index) {
        let d;
        n.type === 2 ? d = new _e(o, o.nextSibling, this, e) : n.type === 1 ? d = new n.ctor(o, n.name, n.strings, this, e) : n.type === 6 && (d = new xt(o, this, e)), this._$AV.push(d), n = i[++c];
      }
      r !== (n == null ? void 0 : n.index) && (o = K.nextNode(), r++);
    }
    return K.currentNode = Y, a;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class _e {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, a) {
    this.type = 2, this._$AH = M, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = a, this._$Cv = (a == null ? void 0 : a.isConnected) ?? !0;
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
    e = ee(this, e, t), de(e) ? e === M || e == null || e === "" ? (this._$AH !== M && this._$AR(), this._$AH = M) : e !== this._$AH && e !== X && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : pt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== M && de(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Y.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var o;
    const { values: t, _$litType$: i } = e, a = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = le.createElement(Je(i.h, i.h[0]), this.options)), i);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === a) this._$AH.p(t);
    else {
      const r = new yt(a, this), c = r.u(this.options);
      r.p(t), this.T(c), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = Ke.get(e.strings);
    return t === void 0 && Ke.set(e.strings, t = new le(e)), t;
  }
  k(e) {
    Te(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, a = 0;
    for (const o of e) a === t.length ? t.push(i = new _e(this.O(re()), this.O(re()), this, this.options)) : i = t[a], i._$AI(o), a++;
    a < t.length && (this._$AR(i && i._$AB.nextSibling, a), t.length = a);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const a = Oe(e).nextSibling;
      Oe(e).remove(), e = a;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class ge {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, a, o) {
    this.type = 1, this._$AH = M, this._$AN = void 0, this.element = e, this.name = t, this._$AM = a, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = M;
  }
  _$AI(e, t = this, i, a) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = ee(this, e, t, 0), r = !de(e) || e !== this._$AH && e !== X, r && (this._$AH = e);
    else {
      const c = e;
      let n, d;
      for (e = o[0], n = 0; n < o.length - 1; n++) d = ee(this, c[i + n], t, n), d === X && (d = this._$AH[n]), r || (r = !de(d) || d !== this._$AH[n]), d === M ? e = M : e !== M && (e += (d ?? "") + o[n + 1]), this._$AH[n] = d;
    }
    r && !a && this.j(e);
  }
  j(e) {
    e === M ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class wt extends ge {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === M ? void 0 : e;
  }
}
class ft extends ge {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== M);
  }
}
class $t extends ge {
  constructor(e, t, i, a, o) {
    super(e, t, i, a, o), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = ee(this, e, t, 0) ?? M) === X) return;
    const i = this._$AH, a = e === M && i !== M || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, o = e !== M && (i === M || a);
    a && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class xt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ee(this, e);
  }
}
const xe = ne.litHtmlPolyfillSupport;
xe == null || xe(le, _e), (ne.litHtmlVersions ?? (ne.litHtmlVersions = [])).push("3.3.2");
const bt = (s, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let a = i._$litPart$;
  if (a === void 0) {
    const o = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = a = new _e(e.insertBefore(re(), o), o, void 0, t ?? {});
  }
  return a._$AI(s), a;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const q = globalThis;
class F extends Q {
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
    return X;
  }
}
var We;
F._$litElement$ = !0, F.finalized = !0, (We = q.litElementHydrateSupport) == null || We.call(q, { LitElement: F });
const be = q.litElementPolyfillSupport;
be == null || be({ LitElement: F });
(q.litElementVersions ?? (q.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const De = (s) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(s, e);
  }) : customElements.define(s, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kt = { attribute: !0, type: String, converter: me, reflect: !1, hasChanged: Se }, Ct = (s = kt, e, t) => {
  const { kind: i, metadata: a } = t;
  let o = globalThis.litPropertyMetadata.get(a);
  if (o === void 0 && globalThis.litPropertyMetadata.set(a, o = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), o.set(t.name, s), i === "accessor") {
    const { name: r } = t;
    return { set(c) {
      const n = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(r, n, s, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(r, void 0, s, c), c;
    } };
  }
  if (i === "setter") {
    const { name: r } = t;
    return function(c) {
      const n = this[r];
      e.call(this, c), this.requestUpdate(r, n, s, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function O(s) {
  return (e, t) => typeof t == "object" ? Ct(s, e, t) : ((i, a, o) => {
    const r = a.hasOwnProperty(o);
    return a.constructor.createProperty(o, i), r ? Object.getOwnPropertyDescriptor(a, o) : void 0;
  })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function he(s) {
  return O({ ...s, state: !0, attribute: !1 });
}
const J = {
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
    editor_configuration: "Configuration",
    editor_text_visibility: "Text Visibility",
    editor_show_divider: "Show Divider",
    editor_show_weekday: "Show Weekday",
    editor_show_weekday_long: "Use long weekday (e.g. Monday)",
    editor_show_month: "Show Month",
    editor_show_month_long: "Use long month (e.g. December)",
    editor_icon_show_weekday: "Swap Month and Weekday",
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
    group_by_date: "Group by Day",
    group_by_date_and_calendar: "Group by Day and Calendar",
    empty: "Empty",
    editor_show_empty_days: "Show Empty Days"
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
    editor_configuration: "Konfiguration",
    editor_text_visibility: "Text & Sichtbarkeit",
    editor_show_divider: "Zeige Trenner",
    editor_show_weekday: "Zeige Wochentag",
    editor_show_weekday_long: "Ausgeschrieben (z.B. Montag)",
    editor_show_month: "Zeige Monat",
    editor_show_month_long: "Ausgeschrieben (z.B. Dezember)",
    editor_icon_show_weekday: "Monat und Wochentag tauschen",
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
    group_by_date: "Nach Tag gruppieren",
    group_by_date_and_calendar: "Nach Tag und Kalender gruppieren",
    empty: "Leer",
    editor_show_empty_days: "Zeige leere Tage"
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
    no_events: "Pas d'événement",
    more_events: "+{x} autres",
    editor_show_upcoming: "Afficher les événements futurs",
    editor_unfold_events: "Déplier les événements",
    editor_configuration: "Configuration",
    editor_text_visibility: "Visibilité du texte",
    editor_show_divider: "Afficher le séparateur",
    editor_show_weekday: "Afficher le jour de la semaine",
    editor_show_weekday_long: "Format long (ex. Lundi)",
    editor_show_month: "Afficher le mois",
    editor_show_month_long: "Format long (ex. Décembre)",
    editor_icon_show_weekday: "Permuter Mois et Jour de semaine",
    editor_show_add_event: "Afficher bouton 'Nouvel événement'",
    add_event_title: "Nouvel événement",
    add_event_name: "Titre",
    add_event_start: "De",
    add_event_end: "A",
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
    editor_show_location: "Afficher le lieu",
    editor_show_duration: "Afficher la durée",
    editor_show_time: "Montrer les heures",
    duration_min: "min",
    duration_hour: "h",
    duration_day: "jour",
    duration_days: "jours",
    editor_max_lines: "Nombre max. d'événements",
    group_by_date: "Grouper par jour",
    group_by_date_and_calendar: "Grouper par jour et calendrier",
    empty: "Aucun événement",
    editor_show_empty_days: "Montrer les jours vides"
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
    editor_configuration: "Configurazione",
    editor_text_visibility: "Visibilità testo",
    editor_show_divider: "Mostra divisore",
    editor_show_weekday: "Mostra giorno della settimana",
    editor_show_weekday_long: "Usa nome completo (es. Lunedì)",
    editor_show_month: "Mostra mese",
    editor_show_month_long: "Usa nome completo (es. Dicembre)",
    editor_icon_show_weekday: "Scambia Mese e Giorno della settimana",
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
    editor_show_location: "Mostra luogo",
    editor_show_duration: "Mostra durata",
    editor_show_time: "Mostra tempo",
    duration_min: "min",
    duration_hour: "h",
    duration_day: "giorno",
    duration_days: "giorni",
    editor_max_lines: "Numero massimo di eventi",
    group_by_date: "Raggruppa per giorno",
    group_by_date_and_calendar: "Raggruppa per giorno e calendario",
    empty: "Vuoto",
    editor_show_empty_days: "Mostra giorni vuoti"
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
    editor_configuration: "Configuración",
    editor_text_visibility: "Visibilidad de texto",
    editor_show_divider: "Mostrar divisor",
    editor_show_weekday: "Mostrar día de la semana",
    editor_show_weekday_long: "Formato largo (ej. Lunes)",
    editor_show_month: "Mostrar mes",
    editor_show_month_long: "Formato largo (ej. Diciembre)",
    editor_icon_show_weekday: "Intercambiar Mes y Día de la semana",
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
    editor_show_location: "Mostrar ubicación",
    editor_show_duration: "Mostrar duración",
    editor_show_time: "Mostrar tiempo",
    duration_min: "min",
    duration_hour: "h",
    duration_day: "día",
    duration_days: "días",
    editor_max_lines: "Número máximo de eventos",
    group_by_date: "Agrupar por día",
    group_by_date_and_calendar: "Agrupar por día y calendario",
    empty: "Vacío",
    editor_show_empty_days: "Mostrar días vacíos"
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
    editor_configuration: "Configuratie",
    editor_text_visibility: "Zichtbaarheid tekst",
    editor_show_divider: "Toon verdeler",
    editor_show_weekday: "Toon weekdag",
    editor_show_weekday_long: "Gebruik lange notatie (bijv. Maandag)",
    editor_show_month: "Toon maand",
    editor_show_month_long: "Lange notatie (bijv. December)",
    editor_icon_show_weekday: "Maand en weekdag omwisselen",
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
    editor_show_location: "Toon locatie",
    editor_show_duration: "Toon duur",
    editor_show_time: "Toon tijd",
    duration_min: "min",
    duration_hour: "u",
    duration_day: "dag",
    duration_days: "dagen",
    editor_max_lines: "Max. weergegeven evenementen",
    group_by_date: "Groepeer per dag",
    group_by_date_and_calendar: "Groepeer per dag en kalender",
    empty: "Leeg",
    editor_show_empty_days: "Toon lege dagen"
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
    editor_configuration: "Configuração",
    editor_text_visibility: "Visibilidade do texto",
    editor_show_divider: "Mostrar divisor",
    editor_show_weekday: "Mostrar dia da semana",
    editor_show_weekday_long: "Formato longo (ex. Segunda-feira)",
    editor_show_month: "Mostrar mês",
    editor_show_month_long: "Formato longo (ex. Dezembro)",
    editor_icon_show_weekday: "Trocar Mês e Dia da semana",
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
    editor_show_location: "Mostrar local",
    editor_show_duration: "Mostrar duração",
    editor_show_time: "Mostrar hora",
    duration_min: "min",
    duration_hour: "h",
    duration_day: "dia",
    duration_days: "dias",
    editor_max_lines: "Máximo de eventos exibidos",
    group_by_date: "Agrupar por dia",
    group_by_date_and_calendar: "Agrupar por dia e calendário",
    empty: "Vazio",
    editor_show_empty_days: "Mostrar dias vazios"
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
    editor_configuration: "Конфигурация",
    editor_text_visibility: "Видимость текста",
    editor_show_divider: "Показать разделитель",
    editor_show_weekday: "Показать день недели",
    editor_show_weekday_long: "Использовать полное название (напр. Понедельник)",
    editor_show_month: "Показать месяц",
    editor_show_month_long: "Использовать полное название (напр. Декабрь)",
    editor_icon_show_weekday: "Поменять местами Месяц и День недели",
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
    editor_show_location: "Показать место",
    editor_show_duration: "Показать продолжительность",
    editor_show_time: "Показать время",
    duration_min: "мин",
    duration_hour: "ч",
    duration_day: "день",
    duration_days: "дней",
    editor_max_lines: "Максимум отобр. событий",
    group_by_date: "Группировать по дням",
    group_by_date_and_calendar: "Группировать по дням и календарю",
    empty: "Пусто",
    editor_show_empty_days: "Показать пустые дни"
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
    editor_configuration: "Konfiguracja",
    editor_text_visibility: "Widoczność tekstu",
    editor_show_divider: "Pokaż dzielnik",
    editor_show_weekday: "Pokaż dzień tygodnia",
    editor_show_weekday_long: "Użyj pełnej nazwy (np. Poniedziałek)",
    editor_show_month: "Pokaż miesiąc",
    editor_show_month_long: "Użyj pełnej nazwy (np. Grudzień)",
    editor_icon_show_weekday: "Zamień Miesiąc i Dzień tygodnia",
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
    editor_show_location: "Pokaż lokalizację",
    editor_show_duration: "Pokaż czas trwania",
    editor_show_time: "Pokaż czas",
    duration_min: "min",
    duration_hour: "godz",
    duration_day: "dzień",
    duration_days: "dni",
    editor_max_lines: "Maks. wyświetlane wydarzenia",
    group_by_date: "Grupuj według dnia",
    group_by_date_and_calendar: "Grupuj według dnia i kalendarza",
    empty: "Pusty",
    editor_show_empty_days: "Pokaż puste dni"
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
    editor_configuration: "Konfiguration",
    editor_text_visibility: "Textsynlighet",
    editor_show_divider: "Visa avdelare",
    editor_show_weekday: "Visa veckodag",
    editor_show_weekday_long: "Använd långt format (t.ex. Måndag)",
    editor_show_month: "Visa månad",
    editor_show_month_long: "Använd långt format (t.ex. December)",
    editor_icon_show_weekday: "Byt plats mellan Månad och Veckodag",
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
    editor_show_location: "Visa plats",
    editor_show_duration: "Visa varaktighet",
    editor_show_time: "Visa tid",
    duration_min: "min",
    duration_hour: "h",
    duration_day: "dag",
    duration_days: "dagar",
    editor_max_lines: "Max. visade händelser",
    group_by_date: "Gruppera per dag",
    group_by_date_and_calendar: "Gruppera per dag och kalender",
    empty: "Tom",
    editor_show_empty_days: "Visa tomma dagar"
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
    editor_configuration: "Konfiguration",
    editor_text_visibility: "Tekst og synlighed",
    editor_show_divider: "Vis skillelinje",
    editor_show_weekday: "Vis ugedag",
    editor_show_weekday_long: "Brug langt format (f.eks. Mandag)",
    editor_show_month: "Vis måned",
    editor_show_month_long: "Brug langt format (f.eks. December)",
    editor_icon_show_weekday: "Skift Måned og Ugedag",
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
    editor_show_location: "Vis sted",
    editor_show_duration: "Vis varighed",
    editor_show_time: "Vis tid",
    duration_min: "min",
    duration_hour: "t",
    duration_day: "dag",
    duration_days: "dage",
    editor_max_lines: "Maks. viste begivenheder",
    group_by_date: "Gruppér efter dag",
    group_by_date_and_calendar: "Gruppér efter dag og kalender",
    empty: "Tom",
    editor_show_empty_days: "Vis tomme dage"
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
    editor_configuration: "Konfigurasjon",
    editor_text_visibility: "Tekstsynlighet",
    editor_show_divider: "Vis skillelinje",
    editor_show_weekday: "Vis ukedag",
    editor_show_weekday_long: "Bruk langt format (f.eks. Mandag)",
    editor_show_month: "Vis måned",
    editor_show_month_long: "Bruk langt format (f.eks. Desember)",
    editor_icon_show_weekday: "Bytt Måned og Ukedag",
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
    editor_show_location: "Vis sted",
    editor_show_duration: "Vis varighet",
    editor_show_time: "Vis tid",
    duration_min: "min",
    duration_hour: "t",
    duration_day: "dag",
    duration_days: "dager",
    editor_max_lines: "Maks. viste hendelser",
    group_by_date: "Grupper etter dag",
    group_by_date_and_calendar: "Grupper etter dag og kalender",
    empty: "Tom",
    editor_show_empty_days: "Vis tomme dager"
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
    editor_configuration: "Määritys",
    editor_text_visibility: "Tekstin näkyvyys",
    editor_show_divider: "Näytä jakaja",
    editor_show_weekday: "Näytä viikonpäivä",
    editor_show_weekday_long: "Käytä pitkää nimeä (esim. Maanantai)",
    editor_show_month: "Näytä kuukausi",
    editor_show_month_long: "Käytä pitkää nimeä (esim. Joulukuu)",
    editor_icon_show_weekday: "Vaihda Kuukausi ja Viikonpäivä",
    editor_show_add_event: "Näytä Lisää-painike",
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
    editor_show_location: "Näytä sijainti",
    editor_show_duration: "Näytä kesto",
    editor_show_time: "Näytä aika",
    duration_min: "min",
    duration_hour: "t",
    duration_day: "päivä",
    duration_days: "päivää",
    editor_max_lines: "Näytettävien tapahtumien enimmäismäärä",
    group_by_date: "Ryhmittele päivän mukaan",
    group_by_date_and_calendar: "Ryhmittele päivän ja kalenterin mukaan",
    empty: "Tyhjä",
    editor_show_empty_days: "Näytä tyhjät päivät"
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
    editor_configuration: "Konfigurace",
    editor_text_visibility: "Viditelnost textu",
    editor_show_divider: "Zobrazit dělič",
    editor_show_weekday: "Zobrazit den v týdnu",
    editor_show_weekday_long: "Použít celý název (např. Pondělí)",
    editor_show_month: "Zobrazit měsíc",
    editor_show_month_long: "Použít celý název (např. Prosinec)",
    editor_icon_show_weekday: "Vyměnit Měsíc a Den v týdnu",
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
    editor_show_location: "Zobrazit místo",
    editor_show_duration: "Zobrazit dobu trvání",
    editor_show_time: "Zobrazit čas",
    duration_min: "min",
    duration_hour: "h",
    duration_day: "den",
    duration_days: "dní",
    editor_max_lines: "Max. zobrazované události",
    group_by_date: "Seskupit podle dne",
    group_by_date_and_calendar: "Seskupit podle dne a kalendáře",
    empty: "Prázdné",
    editor_show_empty_days: "Zobrazit prázdné dny"
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
    editor_configuration: "Konfiguráció",
    editor_text_visibility: "Szöveg láthatósága",
    editor_show_divider: "Osztó megjelenítése",
    editor_show_weekday: "Hét napjának mutatása",
    editor_show_weekday_long: "Hosszú formátum (pl. Hétfő)",
    editor_show_month: "Hó megjelenítése",
    editor_show_month_long: "Hosszú formátum (pl. December)",
    editor_icon_show_weekday: "Hó és Hét napja felcserélése",
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
    editor_show_location: "Helyszín mutatása",
    editor_show_duration: "Időtartam mutatása",
    editor_show_time: "Idő mutatása",
    duration_min: "perc",
    duration_hour: "ó",
    duration_day: "nap",
    duration_days: "nap",
    editor_max_lines: "Max. megjelenített események",
    group_by_date: "Csoportosítás nap szerint",
    group_by_date_and_calendar: "Csoportosítás nap és naptár szerint",
    empty: "Üres",
    editor_show_empty_days: "Üres napok mutatása"
  }
};
function $(s, e, t, i) {
  var r;
  const a = ((r = s.locale) == null ? void 0 : r.language) || s.language || "en";
  let o;
  if (J[a] && J[a][e])
    o = J[a][e];
  else if (J.en && J.en[e])
    o = J.en[e];
  else
    return e;
  return t && i && (o = o.replace(t, i)), o;
}
function zt(s, e, t) {
  var c, n;
  const i = (t == null ? void 0 : t.unfold_events) || !1;
  if (e === void 0)
    return _`
      <div class="calendar-container">
        <div class="calendar-item" style="cursor: default;">
          <div
            class="calendar-icon"
            style="background-color: var(--primary-color, #03a9f4);"
          >
            <ha-icon icon="mdi:calendar-clock"></ha-icon>
          </div>
          <div class="calendar-content">
            <div class="event-title">${$(s, "loading")}</div>
          </div>
        </div>
      </div>
    `;
  if (e.length === 0)
    return _`
      <div class="calendar-container">
        <div class="calendar-item" style="cursor: default;">
          <div
            class="calendar-icon"
            style="background-color: var(--disabled-text-color, #bdbdbb);"
          >
            <ha-icon icon="mdi:calendar-remove"></ha-icon>
          </div>
          <div class="calendar-content">
            <div class="event-title">${$(s, "no_events")}</div>
          </div>
        </div>
      </div>
    `;
  if (!i) {
    const d = e[0], l = e.length - 1, u = d.is_empty ? $(s, "empty") : d.summary;
    let h, y;
    try {
      if (h = new Date(d.start.dateTime || d.start.date), y = new Date(d.end.dateTime || d.end.date), isNaN(h.getTime()) || isNaN(y.getTime()))
        throw new Error("Invalid Date");
    } catch {
      return _`<div class="error">Date Error</div>`;
    }
    const w = /* @__PURE__ */ new Date(), b = !d.start.dateTime, p = G(s, h, y, b), g = ((c = s.locale) == null ? void 0 : c.language) || s.language || navigator.language, x = (f) => f.toLocaleTimeString(g, { hour: "2-digit", minute: "2-digit" }), E = `${x(h)} - ${x(y)}`, v = (t == null ? void 0 : t.show_date) ?? !1, k = (t == null ? void 0 : t.show_time) ?? !1;
    let m = "";
    const C = s.localize(
      "component.calendar.entity_component._.state_attributes.all_day.name"
    ) || "All day";
    if (d.is_empty)
      m = "";
    else if (v || k)
      if (b) {
        const f = v ? h.toLocaleDateString(g, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }) : "";
        v && k ? m = `${f}, ${C}` : m = f || C;
      } else {
        const f = [];
        v && f.push(
          h.toLocaleDateString(g, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })
        ), k && f.push(E), m = f.join(", ");
      }
    else if (h > w) {
      const f = h.getTime() - w.getTime(), ie = Math.ceil(f / 6e4);
      m = Ce(s, ie);
    } else
      m = b ? C : x(h);
    if (!d.is_empty && (t != null && t.show_duration) && (m ? m.endsWith(p) || (m += ` • ${p}`) : m = p), l > 0 && (m += ` ${$(s, "more_events", "{x}", l.toString())}`), !d.is_empty && (t != null && t.show_weekday)) {
      const f = ((n = s.locale) == null ? void 0 : n.language) || s.language || navigator.language, ie = t != null && t.icon_show_weekday ? h.toLocaleDateString(f, {
        month: t.show_weekday_long ? "long" : "short"
      }) : h.toLocaleDateString(f, {
        weekday: t.show_weekday_long ? "long" : "short"
      });
      m += ` • ${ie}`;
    }
    const D = h <= w && y >= w ? w : h, P = d.is_empty ? N(d.entity_id, t) || "var(--disabled-text-color, #bdbdbb)" : N(d.entity_id, t), L = W(
      s,
      D,
      P,
      (t == null ? void 0 : t.dark_mode) ?? !1,
      (t == null ? void 0 : t.icon_show_weekday) ?? !1
    ), z = Z(d.entity_id, t), j = z ? `background-color: ${z}; border: none;` : "";
    return _`
      <div class="calendar-container">
        <div
          class="calendar-item"
          style="${j} ${d.is_empty ? "cursor: default; opacity: 0.7;" : ""}"
          title="${u}"
          @click=${(f) => d.is_empty ? null : Ze(f, s, e)}
        >
          <div class="calendar-icon dynamic">${L}</div>
          <div class="calendar-content">
            <div class="event-title">${u}</div>
            <div class="event-time">
              ${!d.is_empty && (v || k) ? _`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
              ${m}
            </div>
            ${!d.is_empty && (t != null && t.show_location) && d.location ? _`
                  <div class="event-location">
                    <ha-icon icon="mdi:map-marker"></ha-icon>
                    ${d.location}
                  </div>
                ` : ""}
            ${t != null && t.show_calendar_name && d.calendar_name ? _`
                  <div class="event-calendar">
                    <ha-icon icon="mdi:calendar-blank-multiple"></ha-icon>
                    ${d.calendar_name}
                  </div>
                ` : ""}
          </div>
        </div>
      </div>
    `;
  }
  if (t != null && t.group_by_date_and_calendar && i) {
    const d = et(e);
    return _`
      <div class="calendar-container">
        ${d.map((l) => {
      const u = l.date, h = N(l.events[0].entity_id, t), y = W(
        s,
        u,
        h,
        (t == null ? void 0 : t.dark_mode) ?? !1,
        (t == null ? void 0 : t.icon_show_weekday) ?? !1
      ), w = Z(
        l.events[0].entity_id,
        t
      ), b = w ? `background-color: ${w}; border: none;` : "";
      return _`
            <div
              class="calendar-item grouped"
              style="align-items: center; ${b}"
            >
              <div class="calendar-icon dynamic">${y}</div>
              <div class="calendar-content">
                ${l.events.map((p) => {
        var j;
        const g = p.is_empty ? $(s, "empty") : p.summary, x = new Date(
          p.start.dateTime || p.start.date
        ), E = new Date(p.end.dateTime || p.end.date), v = !p.start.dateTime, k = G(s, x, E, v), m = ((j = s.locale) == null ? void 0 : j.language) || s.language || navigator.language, C = (f) => f.toLocaleTimeString(m, {
          hour: "2-digit",
          minute: "2-digit"
        }), A = `${C(x)} - ${C(E)}`, D = (t == null ? void 0 : t.show_date) ?? !1, P = (t == null ? void 0 : t.show_time) ?? !1, L = s.localize(
          "component.calendar.entity_component._.state_attributes.all_day.name"
        ) || "All day";
        let z = "";
        if (p.is_empty)
          z = "";
        else if (D || P)
          if (v) {
            const f = D ? x.toLocaleDateString(m, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }) : "";
            D && P ? z = `${f}, ${L}` : z = f || L;
          } else {
            const f = [];
            D && f.push(
              x.toLocaleDateString(m, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })
            ), P && f.push(A), z = f.join(", ");
          }
        else
          z = v ? L : C(x);
        if (!p.is_empty && (t != null && t.show_duration) && (z.endsWith(k) || (z += ` • ${k}`)), !p.is_empty && (t != null && t.show_weekday)) {
          const f = t != null && t.icon_show_weekday ? x.toLocaleDateString(m, {
            month: t.show_weekday_long ? "long" : "short"
          }) : x.toLocaleDateString(m, {
            weekday: t.show_weekday_long ? "long" : "short"
          });
          z.includes(f) || (z += ` • ${f}`);
        }
        return _`
                    <div
                      class="event-entry"
                      @click=${(f) => p.is_empty ? null : ke(f, p.entity_id)}
                      style="margin-bottom: 4px; ${p.is_empty ? "opacity: 0.7; cursor: default;" : ""}"
                    >
                      <div class="event-title">${g}</div>
                      <div
                        class="event-time"
                        style="display: flex; align-items: center; gap: 4px;"
                      >
                        ${!p.is_empty && (D || P) ? _`<ha-icon
                              icon="mdi:clock-time-four-outline"
                              style="--mdc-icon-size: 14px;"
                            ></ha-icon>` : ""}
                        ${z}
                      </div>
                      ${!p.is_empty && (t != null && t.show_location) && p.location ? _`
                            <div
                              class="event-location"
                              style="display: flex; align-items: center; gap: 4px; font-size: 0.9em; color: var(--secondary-text-color);"
                            >
                              <ha-icon
                                icon="mdi:map-marker"
                                style="--mdc-icon-size: 14px;"
                              ></ha-icon>
                              ${p.location}
                            </div>
                          ` : ""}
                      ${t != null && t.show_calendar_name && p.calendar_name ? _`
                            <div
                              class="event-calendar"
                              style="display: flex; align-items: center; gap: 4px; font-size: 0.9em; color: var(--secondary-text-color);"
                            >
                              <ha-icon
                                icon="mdi:calendar-blank-multiple"
                                style="--mdc-icon-size: 14px;"
                              ></ha-icon>
                              ${p.calendar_name}
                            </div>
                          ` : ""}
                    </div>
                  `;
      })}
              </div>
            </div>
            ${t != null && t.show_divider ? _`<div class="calendar-divider"></div>` : ""}
          `;
    })}
      </div>
    `;
  }
  if (t != null && t.group_by_date && i) {
    const d = Xe(e);
    return _`
      <div class="calendar-container">
        ${d.map((l) => {
      const u = l.date, h = N(l.events[0].entity_id, t), y = W(
        s,
        u,
        h,
        (t == null ? void 0 : t.dark_mode) ?? !1,
        (t == null ? void 0 : t.icon_show_weekday) ?? !1
      ), w = Z(
        l.events[0].entity_id,
        t
      ), b = w ? `background-color: ${w}; border: none;` : "";
      return _`
            <div
              class="calendar-item grouped"
              style="align-items: center; ${b}"
            >
              <div class="calendar-icon dynamic">${y}</div>
              <div class="calendar-content">
                ${l.events.map((p) => {
        var j;
        const g = p.is_empty ? $(s, "empty") : p.summary, x = new Date(
          p.start.dateTime || p.start.date
        ), E = new Date(p.end.dateTime || p.end.date), v = !p.start.dateTime, k = G(s, x, E, v), m = ((j = s.locale) == null ? void 0 : j.language) || s.language || navigator.language, C = (f) => f.toLocaleTimeString(m, {
          hour: "2-digit",
          minute: "2-digit"
        }), A = `${C(x)} - ${C(E)}`, D = (t == null ? void 0 : t.show_date) ?? !1, P = (t == null ? void 0 : t.show_time) ?? !1, L = s.localize(
          "component.calendar.entity_component._.state_attributes.all_day.name"
        ) || "All day";
        let z = "";
        if (p.is_empty)
          z = "";
        else if (D || P)
          if (v) {
            const f = D ? x.toLocaleDateString(m, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }) : "";
            D && P ? z = `${f}, ${L}` : z = f || L;
          } else {
            const f = [];
            D && f.push(
              x.toLocaleDateString(m, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })
            ), P && f.push(A), z = f.join(", ");
          }
        else
          z = v ? L : C(x);
        if (!p.is_empty && (t != null && t.show_duration) && (z.endsWith(k) || (z += ` • ${k}`)), !p.is_empty && (t != null && t.show_weekday)) {
          const f = t != null && t.icon_show_weekday ? x.toLocaleDateString(m, {
            month: t.show_weekday_long ? "long" : "short"
          }) : x.toLocaleDateString(m, {
            weekday: t.show_weekday_long ? "long" : "short"
          });
          z.includes(f) || (z += ` • ${f}`);
        }
        return _`
                    <div
                      class="event-entry"
                      @click=${(f) => p.is_empty ? null : ke(f, p.entity_id)}
                      style="margin-bottom: 4px; ${p.is_empty ? "opacity: 0.7; cursor: default;" : ""}"
                    >
                      <div class="event-title">${g}</div>
                      <div
                        class="event-time"
                        style="display: flex; align-items: center; gap: 4px;"
                      >
                        ${!p.is_empty && (D || P) ? _`<ha-icon
                              icon="mdi:clock-time-four-outline"
                              style="--mdc-icon-size: 14px;"
                            ></ha-icon>` : ""}
                        ${z}
                      </div>
                      ${!p.is_empty && (t != null && t.show_location) && p.location ? _`
                            <div
                              class="event-location"
                              style="display: flex; align-items: center; gap: 4px; font-size: 0.9em; color: var(--secondary-text-color);"
                            >
                              <ha-icon
                                icon="mdi:map-marker"
                                style="--mdc-icon-size: 14px;"
                              ></ha-icon>
                              ${p.location}
                            </div>
                          ` : ""}
                      ${t != null && t.show_calendar_name && p.calendar_name ? _`
                            <div
                              class="event-calendar"
                              style="display: flex; align-items: center; gap: 4px; font-size: 0.9em; color: var(--secondary-text-color);"
                            >
                              <ha-icon
                                icon="mdi:calendar-blank-multiple"
                                style="--mdc-icon-size: 14px;"
                              ></ha-icon>
                              ${p.calendar_name}
                            </div>
                          ` : ""}
                    </div>
                  `;
      })}
              </div>
            </div>
            ${t != null && t.show_divider ? _`<div class="calendar-divider"></div>` : ""}
          `;
    })}
      </div>
    `;
  }
  const a = (t == null ? void 0 : t.max_lines) || 0, o = a > 0 ? e.slice(0, a) : e, r = e.length - o.length;
  return _`
    <div class="calendar-container">
      ${o.map((d, l) => {
    var Me, Pe;
    const u = d.is_empty ? $(s, "empty") : d.summary;
    let h, y;
    try {
      if (h = new Date(d.start.dateTime || d.start.date), y = new Date(d.end.dateTime || d.end.date), isNaN(h.getTime())) throw new Error("Invalid start date");
      if (isNaN(y.getTime())) throw new Error("Invalid end date");
    } catch {
      return _`<div class="error">Date Error for ${u}</div>`;
    }
    const w = /* @__PURE__ */ new Date(), b = !d.start.dateTime;
    let p = -1;
    const g = G(s, h, y, b), x = ((Me = s.locale) == null ? void 0 : Me.language) || s.language || navigator.language, E = (T) => T.toLocaleTimeString(x, { hour: "2-digit", minute: "2-digit" }), v = `${E(h)} - ${E(y)}`, k = (t == null ? void 0 : t.show_date) ?? !1, m = (t == null ? void 0 : t.show_time) ?? !1;
    let C = "";
    const A = s.localize(
      "component.calendar.entity_component._.state_attributes.all_day.name"
    ) || "All day";
    if (d.is_empty)
      C = "";
    else if (k || m)
      if (b) {
        const T = k ? h.toLocaleDateString(x, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }) : "";
        k && m ? C = `${T}, ${A}` : C = T || A;
      } else {
        const T = [];
        k && T.push(
          h.toLocaleDateString(x, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })
        ), m && T.push(v), C = T.join(", ");
      }
    else if (h > w) {
      const T = h.getTime() - w.getTime(), ae = Math.ceil(T / 6e4);
      C = Ce(s, ae);
    } else
      C = b ? A : E(h);
    if (!d.is_empty && (t != null && t.show_duration) && (C ? C.endsWith(g) || (C += ` • ${g}`) : C = g), !d.is_empty && !b && h <= w && y >= w) {
      const T = y.getTime() - h.getTime(), ae = w.getTime() - h.getTime();
      T > 0 && (p = Math.max(
        0,
        Math.min(100, ae / T * 100)
      ));
    }
    if (!d.is_empty && (t != null && t.show_weekday)) {
      const T = ((Pe = s.locale) == null ? void 0 : Pe.language) || s.language || navigator.language, ae = t != null && t.icon_show_weekday ? h.toLocaleDateString(T, {
        month: t.show_weekday_long ? "long" : "short"
      }) : h.toLocaleDateString(T, {
        weekday: t.show_weekday_long ? "long" : "short"
      });
      C += ` • ${ae}`;
    }
    const P = h <= w && y >= w ? w : h, L = d.is_empty ? N(d.entity_id, t) || "var(--disabled-text-color, #bdbdbb)" : N(d.entity_id, t), z = W(
      s,
      P,
      L,
      (t == null ? void 0 : t.dark_mode) ?? !1,
      (t == null ? void 0 : t.icon_show_weekday) ?? !1
    ), j = Z(d.entity_id, t), f = j ? `background-color: ${j}; border: none;` : "", ie = (t == null ? void 0 : t.show_divider) && l > 0, we = a > 0 && l === a - 1 && r > 0;
    return _`
          ${ie ? _`<div class="calendar-divider"></div>` : ""}
          <div
            class="calendar-item"
            style="${f} ${d.is_empty ? "cursor: default; opacity: 0.7;" : ""}"
            title="${we ? $(s, "popup_upcoming_events") : u}"
            @click=${(T) => d.is_empty ? null : we ? Ze(T, s, e) : ke(T, d.entity_id)}
          >
            <div class="calendar-icon dynamic">${z}</div>
            <div
              class="calendar-content"
              style="${d.is_empty ? "opacity: 0.8;" : ""}"
            >
              <div
                class="event-title"
                style="display: flex; align-items: center; justify-content: space-between; gap: 8px;"
              >
                <span
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;"
                  >${u}</span
                >
                ${we ? _`
                      <span
                        class="more-indicator"
                        style="display: flex; align-items: center; gap: 4px; color: var(--secondary-text-color); font-size: 0.85em; font-style: italic; flex-shrink: 0;"
                      >
                        <ha-icon
                          icon="mdi:dots-horizontal"
                          style="--mdc-icon-size: 16px; color: var(--secondary-text-color);"
                        ></ha-icon>
                        (${r})
                      </span>
                    ` : ""}
              </div>
              <div class="event-time">
                ${!d.is_empty && (k || m) ? _`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
                ${C}
              </div>
              ${!d.is_empty && (t != null && t.show_location) && d.location ? _`
                    <div class="event-location">
                      <ha-icon icon="mdi:map-marker"></ha-icon>
                      ${d.location}
                    </div>
                  ` : ""}
              ${t != null && t.show_calendar_name && d.calendar_name ? _`
                    <div class="event-calendar">
                      <ha-icon icon="mdi:calendar-blank-multiple"></ha-icon>
                      ${d.calendar_name}
                    </div>
                  ` : ""}
              ${p >= 0 ? _`
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        style="width: ${p}%"
                      ></div>
                    </div>
                  ` : ""}
            </div>
          </div>
        `;
  })}
    </div>
  `;
}
function N(s, e) {
  var i;
  const t = ((i = e == null ? void 0 : e.calendar_colors) == null ? void 0 : i[s]) || (e == null ? void 0 : e.calendar_icon_color) || "#fa3e3e";
  return Qe(t);
}
function Z(s, e) {
  var i;
  const t = ((i = e == null ? void 0 : e.calendar_background_colors) == null ? void 0 : i[s]) || (e == null ? void 0 : e.background_color) || "";
  return t ? Qe(t) : "";
}
function Qe(s) {
  return s.startsWith("#") || s.startsWith("rgb") || s.startsWith("hsl") || s.startsWith("var") ? s : `var(--${s}-color)`;
}
function Ze(s, e, t) {
  const i = new CustomEvent("calendar-card-show-detail", {
    bubbles: !0,
    composed: !0,
    detail: {
      title: $(e, "popup_upcoming_events"),
      entities: t
    }
  });
  s.target.dispatchEvent(i);
}
function ke(s, e) {
  const t = new CustomEvent("hass-more-info", {
    bubbles: !0,
    composed: !0,
    detail: { entityId: e }
  });
  s.target.dispatchEvent(t);
}
function Xe(s) {
  const e = {};
  return s.forEach((t) => {
    const i = new Date(t.start.dateTime || t.start.date), a = i.toISOString().split("T")[0];
    e[a] || (e[a] = {
      date: i,
      events: []
    }), e[a].events.push(t);
  }), Object.values(e).sort(
    (t, i) => t.date.getTime() - i.date.getTime()
  );
}
function et(s) {
  const e = {};
  return s.forEach((t) => {
    const i = new Date(t.start.dateTime || t.start.date), a = i.toISOString().split("T")[0], o = t.calendar_name || t.entity_id, r = `${a}|${o}`;
    e[r] || (e[r] = {
      date: i,
      calendar: o,
      events: []
    }), e[r].events.push(t);
  }), Object.values(e).sort((t, i) => {
    const a = t.date.getTime() - i.date.getTime();
    return a !== 0 ? a : t.calendar.localeCompare(i.calendar);
  });
}
function W(s, e, t, i = !1, a = !1) {
  var u;
  const o = ((u = s.locale) == null ? void 0 : u.language) || s.language || navigator.language;
  let r;
  a ? r = e.toLocaleDateString(o, { weekday: "short" }).toUpperCase() : r = e.toLocaleDateString(o, { month: "short" }).toUpperCase();
  const c = e.getDate();
  return _`
    <svg
      viewBox="0 0 100 100"
      class="dynamic-calendar-icon"
      style="width: 100%; height: 100%; display: block;"
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx="20"
        ry="20"
        fill="${i ? "#222222" : "white"}"
      ></rect>
      <path
        d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z"
        fill="${t}"
      ></path>
      <text
        x="50"
        y="23"
        font-family="sans-serif"
        font-size="22"
        font-weight="bold"
        fill="${i ? "#222222" : "white"}"
        text-anchor="middle"
      >
        ${r}
      </text>
      <text
        x="50"
        y="82"
        font-family="sans-serif"
        font-size="52"
        font-weight="bold"
        fill="${i ? "white" : "#333"}"
        text-anchor="middle"
      >
        ${c}
      </text>
    </svg>
  `;
}
function G(s, e, t, i) {
  const a = t.getTime() - e.getTime(), o = Math.round(a / 6e4);
  if (i && o === 1440)
    return s.localize(
      "component.calendar.entity_component._.state_attributes.all_day.name"
    ) || "All day";
  if (o < 60)
    return `${o} ${$(s, "duration_min")}`;
  const r = Math.floor(o / 1440), c = o % 1440, n = Math.floor(c / 60), d = c % 60, l = [];
  return r >= 1 && l.push(
    `${r} ${$(s, r === 1 ? "duration_day" : "duration_days")}`
  ), n > 0 && l.push(`${n} ${$(s, "duration_hour")}`), d > 0 && l.push(`${d} ${$(s, "duration_min")}`), l.join(" ");
}
function Ce(s, e) {
  if (e < 60)
    return e === 1 ? $(s, "starts_in_min", "{x}", e.toString()) : $(s, "starts_in_mins", "{x}", e.toString());
  if (e < 1440) {
    const i = Math.round(e / 60);
    return i === 1 ? $(s, "starts_in_hour", "{x}", i.toString()) : $(s, "starts_in_hours", "{x}", i.toString());
  }
  if (e < 43200) {
    const i = Math.round(e / 1440);
    return i === 1 ? $(s, "starts_in_day", "{x}", i.toString()) : $(s, "starts_in_days", "{x}", i.toString());
  }
  const t = Math.round(e / 10080);
  return t === 1 ? $(s, "starts_in_week", "{x}", t.toString()) : $(s, "starts_in_weeks", "{x}", t.toString());
}
function At(s, e) {
  const t = Object.keys(s.states).filter((l) => l.startsWith("calendar.")).filter((l) => {
    var u;
    return !((u = e.exclude_entities) != null && u.includes(l));
  }), i = t.length > 0 ? t[0] : void 0, a = /* @__PURE__ */ new Date(), o = new Date(a);
  o.setHours(o.getHours() + 1, 0, 0, 0);
  const r = new Date(o);
  r.setHours(r.getHours() + 1, 0, 0, 0);
  const c = (l) => l.toString().padStart(2, "0"), n = (l) => `${l.getFullYear()}-${c(l.getMonth() + 1)}-${c(l.getDate())}`, d = (l) => `${c(l.getHours())}:${c(l.getMinutes())}`;
  return {
    open: !0,
    calendar_id: i,
    name: "",
    start_date: n(o),
    start_time: d(o),
    end_date: n(r),
    end_time: d(r),
    location: "",
    description: "",
    recurrence: "none",
    all_day: !1
  };
}
async function Et(s, e, t, i) {
  if (!(!e.calendar_id || !e.name || !e.start_date || !e.end_date))
    try {
      const a = {
        entity_id: e.calendar_id,
        summary: e.name
      };
      if (e.all_day) {
        let o = e.end_date;
        if (e.start_date === o) {
          const r = o.split("-"), c = new Date(Number(r[0]), Number(r[1]) - 1, Number(r[2]));
          c.setDate(c.getDate() + 1);
          const n = (d) => d.toString().padStart(2, "0");
          o = `${c.getFullYear()}-${n(c.getMonth() + 1)}-${n(c.getDate())}`;
        }
        a.start_date = e.start_date, a.end_date = o;
      } else {
        const o = e.start_time || "09:00", r = e.end_time || "10:00";
        a.start_date_time = `${e.start_date} ${o}:00`, a.end_date_time = `${e.end_date} ${r}:00`, e.location && (a.location = e.location), e.description && (a.description = e.description);
      }
      if (e.recurrence && e.recurrence !== "none") {
        const o = {
          DAILY: "FREQ=DAILY",
          WEEKLY: "FREQ=WEEKLY",
          MONTHLY: "FREQ=MONTHLY",
          YEARLY: "FREQ=YEARLY"
        };
        o[e.recurrence] && (a.rrule = o[e.recurrence]);
      }
      await s.callService("calendar", "create_event", a), t();
    } catch (a) {
      i(a);
    }
}
function St(s, e, t, i, a, o) {
  const r = Object.keys(s.states).filter((n) => n.startsWith("calendar.")).filter((n) => {
    var d;
    return !((d = e.exclude_entities) != null && d.includes(n));
  }), c = t.all_day || !1;
  return _`
        <div class="add-event-form">
            <div class="field">
                <label class="field-label">${s.localize("ui.components.calendar.event.summary") || "Title"}</label>
                <input
                    type="text"
                    class="field-input"
                    .value=${t.name || ""}
                    @input=${(n) => i({ name: n.target.value })}
                />
            </div>

            <div class="field">
                <label class="field-label">${s.localize("ui.components.calendar.event.location") || "Location"}</label>
                <input
                    type="text"
                    class="field-input"
                    .value=${t.location || ""}
                    @input=${(n) => i({ location: n.target.value })}
                />
            </div>

            <div class="field">
                <label class="field-label">${s.localize("ui.components.calendar.event.description") || "Description"}</label>
                <input
                    type="text"
                    class="field-input"
                    .value=${t.description || ""}
                    @input=${(n) => i({ description: n.target.value })}
                />
            </div>

            <div class="field">
                <label class="field-label">${s.localize("ui.components.calendar.my_calendars") || "Calendar"}</label>
                <select
                    class="field-input"
                    .value=${t.calendar_id || ""}
                    @change=${(n) => i({ calendar_id: n.target.value })}
                >
                    ${r.length === 0 ? _`<option value="">-- ${s.localize("ui.common.none") || "no calendars"} --</option>` : r.map((n) => {
    var d, l;
    return _`
                            <option value=${n} ?selected=${n === t.calendar_id}>
                                ${((l = (d = s.states[n]) == null ? void 0 : d.attributes) == null ? void 0 : l.friendly_name) || n}
                            </option>
                        `;
  })}
                </select>
            </div>

            <div class="row-flex">
                <ha-formfield .label=${s.localize("ui.components.calendar.event.all_day") || "All Day"}>
                    <ha-switch
                        .checked=${c}
                        @change=${(n) => i({ all_day: n.target.checked })}
                    ></ha-switch>
                </ha-formfield>
            </div>

            <div class="field">
                <label class="field-label">${s.localize("ui.components.calendar.event.start") || "Start"}</label>
                <div class="date-row">
                    <input
                        type="date"
                        class="field-input"
                        .value=${t.start_date || ""}
                        @change=${(n) => i({ start_date: n.target.value })}
                    />
                    ${c ? "" : _`
                        <input
                            type="time"
                            class="field-input"
                            .value=${t.start_time || "09:00"}
                            @change=${(n) => i({ start_time: n.target.value })}
                        />
                    `}
                </div>
            </div>

            <div class="field">
                <label class="field-label">${s.localize("ui.components.calendar.event.end") || "End"}</label>
                <div class="date-row">
                    <input
                        type="date"
                        class="field-input"
                        .value=${t.end_date || ""}
                        @change=${(n) => i({ end_date: n.target.value })}
                    />
                    ${c ? "" : _`
                        <input
                            type="time"
                            class="field-input"
                            .value=${t.end_time || "10:00"}
                            @change=${(n) => i({ end_time: n.target.value })}
                        />
                    `}
                </div>
            </div>

            <div class="field">
                <label class="field-label">${s.localize("ui.components.calendar.event.repeat.label") || "Repeat"}</label>
                <select
                    class="field-input"
                    .value=${t.recurrence || "none"}
                    @change=${(n) => i({ recurrence: n.target.value })}
                >
                    <option value="none">${s.localize("ui.components.calendar.event.repeat.freq.none") || "None"}</option>
                    <option value="DAILY">${s.localize("ui.components.calendar.event.repeat.freq.daily") || "Daily"}</option>
                    <option value="WEEKLY">${s.localize("ui.components.calendar.event.repeat.freq.weekly") || "Weekly"}</option>
                    <option value="MONTHLY">${s.localize("ui.components.calendar.event.repeat.freq.monthly") || "Monthly"}</option>
                    <option value="YEARLY">${s.localize("ui.components.calendar.event.repeat.freq.yearly") || "Yearly"}</option>
                </select>
            </div>

            <div class="dialog-actions">
                <ha-button @click=${a}>
                    ${s.localize("ui.common.cancel") || "Cancel"}
                </ha-button>
                <ha-button
                    unelevated
                    @click=${o}
                    ?disabled=${!t.name || !t.calendar_id}
                >
                    ${s.localize("ui.common.save") || "Save"}
                </ha-button>
            </div>
        </div>
    `;
}
var tt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, Dt = (s, e, t) => e in s ? tt(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t, R = (s, e, t, i) => {
  for (var a = i > 1 ? void 0 : i ? Tt(e, t) : e, o = s.length - 1, r; o >= 0; o--)
    (r = s[o]) && (a = (i ? r(e, t, a) : r(a)) || a);
  return i && a && tt(e, t, a), a;
}, Mt = (s, e, t) => Dt(s, e + "", t);
let B = class extends F {
  constructor() {
    super(...arguments);
    S(this, "hass");
    S(this, "config");
    S(this, "open", !1);
    S(this, "mode", "detail");
    S(this, "detailTitle", "");
    S(this, "detailEvents", []);
    S(this, "_addEventState", { open: !1 });
    S(this, "_opener", null);
    S(this, "_onEventSaved", null);
    S(this, "_onPopState", (e) => {
      var t;
      this.open && !((t = window.history.state) != null && t.calendarCardPlusPopup) && this._close();
    });
    S(this, "_close", () => {
      if (!this.open) return;
      this.open = !1, this.requestUpdate();
      const e = { dialog: this };
      this.dispatchEvent(
        new CustomEvent("closed", { bubbles: !0, composed: !0, detail: e })
      ), this.dispatchEvent(
        new CustomEvent("dialog-closed", {
          bubbles: !0,
          composed: !0,
          detail: e
        })
      ), this.dispatchEvent(
        new CustomEvent("popup-closed", {
          bubbles: !0,
          composed: !0,
          detail: e
        })
      );
    });
    S(this, "_onDialogClosed", (e) => {
      var t;
      if (e && e.type !== "click") {
        const i = e.target;
        if (i && i.tagName !== "HA-ADAPTIVE-DIALOG" && i.tagName !== "HA-DIALOG")
          return;
      }
      this._close(), (t = window.history.state) != null && t.calendarCardPlusPopup && window.history.back();
    });
    S(this, "_closeDialog", () => {
      var e;
      this.open && (this._close(), (e = window.history.state) != null && e.calendarCardPlusPopup && window.history.back());
    });
  }
  async showDialog(e) {
    this.hass = e.hass, this.config = e.config, this._opener = e.opener, this.mode = e.mode, e.title && (this.detailTitle = e.title), e.events && (this.detailEvents = e.events), e.addEventState && (this._addEventState = e.addEventState), e.onEventSaved && (this._onEventSaved = e.onEventSaved), this.open = !0, window.history.pushState({ calendarCardPlusPopup: !0 }, ""), this.requestUpdate(), await this.updateComplete;
    const t = this.renderRoot.querySelector("ha-adaptive-dialog");
    if (t && t.shadowRoot) {
      const i = t.shadowRoot.querySelector("ha-bottom-sheet");
      i && (i.style.removeProperty("--dialog-transform"), i.style.removeProperty("--dialog-transition"));
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
    await Et(
      this.hass,
      this._addEventState,
      () => {
        this.dispatchEvent(
          new CustomEvent("event-saved", { bubbles: !0, composed: !0 })
        ), this._onEventSaved && this._onEventSaved(), this._closeDialog();
      },
      (e) => {
        this.hass.callService("persistent_notification", "create", {
          title: "Calendar Card Plus",
          message: "Error saving event: " + e.message
        });
      }
    );
  }
  render() {
    var i;
    const e = this.mode === "add-event", t = e ? ((i = this.hass) == null ? void 0 : i.localize("ui.components.calendar.event.add")) || "Add Event" : this.detailTitle;
    return _`
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
    return this.config.group_by_date_and_calendar ? et(this.detailEvents).map((t) => {
      const i = t.date, a = N(t.events[0].entity_id, this.config), o = W(
        this.hass,
        i,
        a,
        this.config.dark_mode ?? !1
      ), r = Z(
        t.events[0].entity_id,
        this.config
      ), c = r ? `background-color: ${r}; border: none;` : "";
      return _`
          <div
            class="calendar-item grouped detail"
            style="align-items: center; ${c}"
          >
            <div class="calendar-icon dynamic">${o}</div>
            <div class="calendar-content">
              ${t.events.map((n) => {
        var k;
        const d = n.is_empty ? $(this.hass, "empty") : n.summary, l = new Date(
          n.start.dateTime || n.start.date
        ), u = new Date(n.end.dateTime || n.end.date), h = !n.start.dateTime, y = G(
          this.hass,
          l,
          u,
          h
        ), w = ((k = this.hass.locale) == null ? void 0 : k.language) || this.hass.language || navigator.language, b = (m) => m.toLocaleTimeString(w, {
          hour: "2-digit",
          minute: "2-digit"
        }), p = `${b(l)} - ${b(u)}`, g = this.config.show_date ?? !1, x = this.config.show_time ?? !1, E = this.hass.localize(
          "component.calendar.entity_component._.state_attributes.all_day.name"
        ) || "All day";
        let v = "";
        if (n.is_empty)
          v = "";
        else if (g || x)
          if (h) {
            const m = g ? l.toLocaleDateString(w, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }) : "";
            g && x ? v = `${m}, ${E}` : v = m || E;
          } else {
            const m = [];
            g && m.push(
              l.toLocaleDateString(w, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })
            ), x && m.push(p), v = m.join(", ");
          }
        else
          v = h ? E : b(l);
        if (!n.is_empty && this.config.show_duration && (v.endsWith(y) || (v += ` • ${y}`)), !n.is_empty && this.config.show_weekday) {
          const m = l.toLocaleDateString(w, {
            weekday: this.config.show_weekday_long ? "long" : "short"
          });
          v.includes(m) || (v += ` • ${m}`);
        }
        return _`
                  <div
                    class="event-entry"
                    @click=${() => n.is_empty ? null : this._handleMoreInfo(n.entity_id)}
                    style="margin-bottom: 4px; ${n.is_empty ? "opacity: 0.7; cursor: default;" : ""}"
                  >
                    <div class="event-title">${d}</div>
                    <div
                      class="event-time"
                      style="display: flex; align-items: center; gap: 4px;"
                    >
                      ${!n.is_empty && (g || x) ? _`<ha-icon
                            icon="mdi:clock-time-four-outline"
                            style="--mdc-icon-size: 14px;"
                          ></ha-icon>` : ""}
                      ${v}
                    </div>
                    ${!n.is_empty && this.config.show_location && n.location ? _`
                          <div class="event-location">
                            <ha-icon
                              icon="mdi:map-marker"
                              style="--mdc-icon-size: 14px;"
                            ></ha-icon>
                            ${n.location}
                          </div>
                        ` : ""}
                    ${this.config.show_calendar_name && n.calendar_name ? _`
                          <div class="event-calendar">
                            <ha-icon
                              icon="mdi:calendar-blank-multiple"
                              style="--mdc-icon-size: 14px;"
                            ></ha-icon>
                            ${n.calendar_name}
                          </div>
                        ` : ""}
                  </div>
                `;
      })}
            </div>
          </div>
          ${this.config.show_divider ? _`<div class="calendar-divider"></div>` : ""}
        `;
    }) : this.config.group_by_date ? Xe(this.detailEvents).map((t) => {
      const i = t.date, a = N(t.events[0].entity_id, this.config), o = W(
        this.hass,
        i,
        a,
        this.config.dark_mode ?? !1
      ), r = Z(
        t.events[0].entity_id,
        this.config
      ), c = r ? `background-color: ${r}; border: none;` : "";
      return _`
          <div
            class="calendar-item grouped detail"
            style="align-items: center; ${c}"
          >
            <div class="calendar-icon dynamic">${o}</div>
            <div class="calendar-content">
              ${t.events.map((n) => {
        var k;
        const d = n.is_empty ? $(this.hass, "empty") : n.summary, l = new Date(
          n.start.dateTime || n.start.date
        ), u = new Date(n.end.dateTime || n.end.date), h = !n.start.dateTime, y = G(
          this.hass,
          l,
          u,
          h
        ), w = ((k = this.hass.locale) == null ? void 0 : k.language) || this.hass.language || navigator.language, b = (m) => m.toLocaleTimeString(w, {
          hour: "2-digit",
          minute: "2-digit"
        }), p = `${b(l)} - ${b(u)}`, g = this.config.show_date ?? !1, x = this.config.show_time ?? !1, E = this.hass.localize(
          "component.calendar.entity_component._.state_attributes.all_day.name"
        ) || "All day";
        let v = "";
        if (n.is_empty)
          v = "";
        else if (g || x)
          if (h) {
            const m = g ? l.toLocaleDateString(w, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }) : "";
            g && x ? v = `${m}, ${E}` : v = m || E;
          } else {
            const m = [];
            g && m.push(
              l.toLocaleDateString(w, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })
            ), x && m.push(p), v = m.join(", ");
          }
        else
          v = h ? E : b(l);
        if (!n.is_empty && this.config.show_duration && (v.endsWith(y) || (v += ` • ${y}`)), !n.is_empty && this.config.show_weekday) {
          const m = l.toLocaleDateString(w, {
            weekday: this.config.show_weekday_long ? "long" : "short"
          });
          v.includes(m) || (v += ` • ${m}`);
        }
        return _`
                  <div
                    class="event-entry"
                    @click=${() => n.is_empty ? null : this._handleMoreInfo(n.entity_id)}
                    style="margin-bottom: 4px; ${n.is_empty ? "opacity: 0.7; cursor: default;" : ""}"
                  >
                    <div class="event-title">${d}</div>
                    <div
                      class="event-time"
                      style="display: flex; align-items: center; gap: 4px;"
                    >
                      ${!n.is_empty && (g || x) ? _`<ha-icon
                            icon="mdi:clock-time-four-outline"
                            style="--mdc-icon-size: 14px;"
                          ></ha-icon>` : ""}
                      ${v}
                    </div>
                    ${!n.is_empty && this.config.show_location && n.location ? _`
                          <div class="event-location">
                            <ha-icon
                              icon="mdi:map-marker"
                              style="--mdc-icon-size: 14px;"
                            ></ha-icon>
                            ${n.location}
                          </div>
                        ` : ""}
                    ${this.config.show_calendar_name && n.calendar_name ? _`
                          <div class="event-calendar">
                            <ha-icon
                              icon="mdi:calendar-blank-multiple"
                              style="--mdc-icon-size: 14px;"
                            ></ha-icon>
                            ${n.calendar_name}
                          </div>
                        ` : ""}
                  </div>
                `;
      })}
            </div>
          </div>
          ${this.config.show_divider ? _`<div class="calendar-divider"></div>` : ""}
        `;
    }) : this.detailEvents.map((e, t) => {
      var C;
      const i = e.is_empty ? $(this.hass, "empty") : e.summary;
      let a = "", o, r;
      try {
        o = new Date(e.start.dateTime || e.start.date), r = new Date(e.end.dateTime || e.end.date);
      } catch {
        return _`<div class="error">Date Error</div>`;
      }
      const c = /* @__PURE__ */ new Date(), n = !e.start.dateTime, d = ((C = this.hass.locale) == null ? void 0 : C.language) || this.hass.language || navigator.language, l = (A) => A.toLocaleTimeString(d, { hour: "2-digit", minute: "2-digit" }), u = G(this.hass, o, r, n), h = `${l(o)} - ${l(r)}`, y = this.config.show_date ?? !1, w = this.config.show_time ?? !1, b = this.hass.localize(
        "component.calendar.entity_component._.state_attributes.all_day.name"
      ) || "All day";
      if (e.is_empty)
        a = "";
      else if (y || w)
        if (n) {
          const A = y ? o.toLocaleDateString(d, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          }) : "";
          y && w ? a = `${A}, ${b}` : a = A || b;
        } else {
          const A = [];
          y && A.push(
            o.toLocaleDateString(d, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })
          ), w && A.push(h), a = A.join(", ");
        }
      else if (o > c) {
        const A = o.getTime() - c.getTime(), D = Math.ceil(A / 6e4);
        a = Ce(this.hass, D);
      } else
        a = n ? b : l(o);
      if (!e.is_empty && this.config.show_duration && (a ? a.endsWith(u) || (a += ` • ${u}`) : a = u), !e.is_empty && this.config.show_weekday) {
        const A = o.toLocaleDateString(d, {
          weekday: this.config.show_weekday_long ? "long" : "short"
        });
        a += ` • ${A}`;
      }
      const g = !e.is_empty && o <= c && r >= c ? c : o, x = e.is_empty ? "var(--disabled-text-color, #bdbdbb)" : N(e.entity_id, this.config), E = W(
        this.hass,
        g,
        x,
        this.config.dark_mode ?? !1
      ), v = this.config.show_divider && t > 0, k = Z(e.entity_id, this.config), m = k ? `background-color: ${k}; border: none;` : "";
      return _`
        ${v ? _`<div class="calendar-divider"></div>` : ""}
        <div
          class="calendar-item detail"
          style="${m} ${e.is_empty ? "cursor: default; opacity: 0.7;" : ""}"
          @click=${() => e.is_empty ? null : this._handleMoreInfo(e.entity_id)}
        >
          <div class="calendar-icon dynamic">${E}</div>
          <div class="calendar-content">
            <div class="event-title">${i}</div>
            <div class="event-time">
              ${!e.is_empty && (y || w) ? _`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
              ${a}
            </div>
            ${!e.is_empty && this.config.show_location && e.location ? _`
                  <div class="event-location">
                    <ha-icon icon="mdi:map-marker"></ha-icon>
                    ${e.location}
                  </div>
                ` : ""}
            ${this.config.show_calendar_name && e.calendar_name ? _`
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
Mt(B, "styles", Ee`
    :host {
      display: block;
    }

    ha-adaptive-dialog {
      --dialog-content-padding: 0px 12px 12px;
      --ha-dialog-max-width: 96vw !important;
      --ha-bottom-sheet-height: calc(
        100dvh - max(var(--safe-area-inset-top), 48px)
      ) !important;
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
      background-color: var(
        --ha-card-background,
        var(--card-background-color, white)
      );
      border: var(--ha-card-border-width, 1px) solid
        var(--ha-card-border-color, var(--divider-color, #e0e0e0));
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
    .event-location,
    .event-calendar {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
      margin-top: 1px;
    }
    .event-location ha-icon,
    .event-calendar ha-icon {
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

    .add-event-form .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .add-event-form .field-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
    }

    .add-event-form .field-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      font-size: 14px;
      font-family: inherit;
      box-sizing: border-box;
    }

    .add-event-form .field-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .add-event-form select.field-input {
      cursor: pointer;
      appearance: auto;
    }

    .row-flex {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .date-row .field-input {
      flex: 1;
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
  O({ attribute: !1 })
], B.prototype, "hass", 2);
R([
  O({ attribute: !1 })
], B.prototype, "config", 2);
R([
  O({ type: Boolean })
], B.prototype, "open", 2);
R([
  O({ type: String })
], B.prototype, "mode", 2);
R([
  O({ type: String })
], B.prototype, "detailTitle", 2);
R([
  O({ type: Array })
], B.prototype, "detailEvents", 2);
R([
  he()
], B.prototype, "_addEventState", 2);
B = R([
  De("calendar-card-plus-popup")
], B);
const Pt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusPopup() {
    return B;
  }
}, Symbol.toStringTag, { value: "Module" }));
var jt = Object.defineProperty, Lt = Object.getOwnPropertyDescriptor, ve = (s, e, t, i) => {
  for (var a = i > 1 ? void 0 : i ? Lt(e, t) : e, o = s.length - 1, r; o >= 0; o--)
    (r = s[o]) && (a = (i ? r(e, t, a) : r(a)) || a);
  return i && a && jt(e, t, a), a;
};
const Bt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
let ce = class extends F {
  constructor() {
    super(...arguments);
    S(this, "hass");
    S(this, "config");
    S(this, "_events");
    S(this, "_handleShowDetail", async (e) => {
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "detail",
        title: e.detail.title,
        events: e.detail.entities
      });
    });
    S(this, "_openAddEventPopup", async () => {
      const e = At(this.hass, this.config);
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "add-event",
        addEventState: e
      });
    });
    S(this, "_onEventSaved", () => {
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
      let o = 1440;
      this.config.days !== void 0 || this.config.hours !== void 0 || this.config.minutes !== void 0 ? o = (this.config.days || 0) * 1440 + (this.config.hours || 0) * 60 + (this.config.minutes || 0) : this.config.max_minutes_until_start !== void 0 && (o = this.config.max_minutes_until_start), t = new Date(e.getTime() + o * 6e4);
    } else
      t = new Date(e), t.setHours(23, 59, 59, 999);
    const i = Object.keys(this.hass.states).filter((o) => o.startsWith("calendar.")).filter((o) => {
      var r;
      return !((r = this.config.exclude_entities) != null && r.includes(o));
    });
    if (i.length === 0) {
      this._events = [];
      return;
    }
    const a = await st(this.hass, e, t, i);
    this.config.show_empty_days ? this._events = this._injectEmptyDays(a, e, t) : this._events = a, this.requestUpdate();
  }
  _injectEmptyDays(e, t, i) {
    const a = [...e], o = /* @__PURE__ */ new Set();
    e.forEach((n) => {
      const d = n.start.date || n.start.dateTime;
      if (d) {
        const l = new Date(d);
        o.add(l.toISOString().split("T")[0]);
      }
    });
    const r = new Date(t);
    r.setHours(0, 0, 0, 0);
    const c = new Date(i);
    for (c.setHours(0, 0, 0, 0); r <= c; ) {
      const n = r.toISOString().split("T")[0];
      o.has(n) || a.push({
        start: { date: n },
        end: { date: n },
        summary: "empty",
        is_empty: !0,
        entity_id: "empty",
        calendar_name: ""
      }), r.setDate(r.getDate() + 1);
    }
    return a.sort((n, d) => {
      const l = new Date(n.start.dateTime || n.start.date).getTime(), u = new Date(d.start.dateTime || d.start.date).getTime();
      return l - u;
    });
  }
  render() {
    if (!this.config || !this.hass)
      return _``;
    const e = zt(this.hass, this._events, this.config);
    return _`
            <ha-card>
                <div class="add-event-btn" @click=${this._openAddEventPopup} style=${this.config.show_add_event ? "" : "display: none;"}>
                    <ha-icon-button .path=${Bt}></ha-icon-button>
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
          dialogImport: () => Promise.resolve().then(() => Pt),
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
    return await Promise.resolve().then(() => Ht), document.createElement("calendar-card-plus-editor");
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
  O({ attribute: !1 })
], ce.prototype, "hass", 2);
ve([
  he()
], ce.prototype, "config", 2);
ve([
  he()
], ce.prototype, "_events", 2);
ce = ve([
  De("calendar-card-plus")
], ce);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-card-plus",
  name: "Dynamic Calendar Card Plus",
  preview: !0,
  description: "A standalone calendar card with dynamic grid styling"
});
const H = (s, e, t, i) => {
  i = i || {}, t = t ?? {};
  const a = new Event(e, {
    bubbles: i.bubbles === void 0 ? !0 : i.bubbles,
    cancelable: !!i.cancelable,
    composed: i.composed === void 0 ? !0 : i.composed
  });
  return a.detail = t, s.dispatchEvent(a), a;
};
var Nt = Object.defineProperty, Ot = Object.getOwnPropertyDescriptor, ye = (s, e, t, i) => {
  for (var a = i > 1 ? void 0 : i ? Ot(e, t) : e, o = s.length - 1, r; o >= 0; o--)
    (r = s[o]) && (a = (i ? r(e, t, a) : r(a)) || a);
  return i && a && Nt(e, t, a), a;
};
let te = class extends F {
  constructor() {
    super(...arguments);
    S(this, "hass");
    S(this, "_config", {
      type: "custom:calendar-card-plus"
    });
    S(this, "_showAllCalendars", !1);
  }
  set config(e) {
    this.setConfig(e);
  }
  setConfig(e) {
    this._config = e, this.requestUpdate();
  }
  render() {
    var c, n, d, l, u, h, y, w, b, p;
    if (!this.hass)
      return _``;
    const e = this._config.upcoming_events ?? !1, t = this._config.unfold_events ?? !1, i = this._config.days ?? 1, a = this._config.hours ?? 0, o = this._config.minutes ?? 0, r = this._config.exclude_entities ?? [];
    return _`
      <div class="card-config">
        <ha-expansion-panel outlined>
          <div
            slot="header"
            role="heading"
            aria-level="3"
            style="display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon
              icon="mdi:cog"
              style="color: var(--secondary-text-color);"
            ></ha-icon>
            ${$(this.hass, "editor_configuration")}
          </div>
          <div
            class="settings-grid"
            style="margin-top: 16px; margin-bottom: 16px;"
          >
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_unfold_events")}</span
              >
              <ha-switch
                .checked=${t}
                @change=${this._compactModeChanged}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_show_divider")}</span
              >
              <ha-switch
                .checked=${this._config.show_divider ?? !1}
                @change=${this._calendarDividerChanged}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_show_add_event")}</span
              >
              <ha-switch
                .checked=${this._config.show_add_event ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_add_event")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label">${$(this.hass, "group_by_date")}</span>
              <ha-switch
                .checked=${this._config.group_by_date ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "group_by_date")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "group_by_date_and_calendar")}</span
              >
              <ha-switch
                .checked=${this._config.group_by_date_and_calendar ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "group_by_date_and_calendar")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label">Dark Mode</span>
              <ha-switch
                .checked=${this._config.dark_mode ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "dark_mode")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_show_upcoming")}</span
              >
              <ha-switch
                .checked=${e}
                @change=${this._calendarShowAllChanged}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_show_empty_days")}</span
              >
              <ha-switch
                .checked=${this._config.show_empty_days ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_empty_days")}
              ></ha-switch>
            </div>
          </div>

          ${t ? _`
                <div
                  class="settings-row full-width"
                  style="margin-bottom: 16px;"
                >
                  <ha-selector
                    .hass=${this.hass}
                    .selector=${{ number: { min: 0, max: 20, mode: "box" } }}
                    .value=${this._config.max_lines || 0}
                    .label=${$(this.hass, "editor_max_lines")}
                    .configValue=${"max_lines"}
                    @value-changed=${this._valueChanged}
                  ></ha-selector>
                </div>
              ` : ""}
          ${e ? _`
                <div
                  class="settings-row full-width"
                  style="margin-bottom: 8px;"
                >
                  <span class="label" style="margin-bottom: 8px;"
                    >${((c = this.hass) == null ? void 0 : c.localize(
      "ui.panel.lovelace.editor.card.statistic.period"
    )) || "Period"}</span
                  >
                  <div class="period-selectors">
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ number: { min: 0, max: 365, mode: "box" } }}
                      .value=${i}
                      .label=${((n = this.hass) == null ? void 0 : n.localize(
      "component.input_datetime.entity_component._.state_attributes.day.name"
    )) || "Days"}
                      .configValue=${"days"}
                      @value-changed=${this._valueChanged}
                    ></ha-selector>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ number: { min: 0, max: 23, mode: "box" } }}
                      .value=${a}
                      .label=${((d = this.hass) == null ? void 0 : d.localize(
      "component.input_datetime.entity_component._.state_attributes.hour.name"
    )) || "Hours"}
                      .configValue=${"hours"}
                      @value-changed=${this._valueChanged}
                    ></ha-selector>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ number: { min: 0, max: 59, mode: "box" } }}
                      .value=${o}
                      .label=${((l = this.hass) == null ? void 0 : l.localize(
      "component.input_datetime.entity_component._.state_attributes.minute.name"
    )) || "Minutes"}
                      .configValue=${"minutes"}
                      @value-changed=${this._valueChanged}
                    ></ha-selector>
                  </div>
                </div>
              ` : ""}

          <div class="settings-row full-width" style="margin-bottom: 16px;">
            <ha-selector
              .hass=${this.hass}
              .selector=${{ ui_color: {} }}
              .value=${this._config.calendar_icon_color || ""}
              .label="Global ${this.hass.localize(
      "ui.panel.lovelace.editor.card.tile.color"
    ) || "Color"}"
              .configValue=${"calendar_icon_color"}
              @value-changed=${this._valueChanged}
            ></ha-selector>
          </div>

          <div class="settings-row full-width" style="margin-bottom: 16px;">
            <ha-selector
              .hass=${this.hass}
              .selector=${{ ui_color: {} }}
              .value=${this._config.background_color || ""}
              .label=${$(this.hass, "editor_background_color")}
              .configValue=${"background_color"}
              @value-changed=${this._valueChanged}
            ></ha-selector>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel outlined>
          <div
            slot="header"
            role="heading"
            aria-level="3"
            style="display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon
              icon="mdi:card-text"
              style="color: var(--secondary-text-color);"
            ></ha-icon>
            ${$(this.hass, "editor_text_visibility")}
          </div>
          <div
            class="settings-grid"
            style="margin-top: 16px; margin-bottom: 16px;"
          >
            <div class="settings-row">
              <span class="label"
                >${(u = this.hass) == null ? void 0 : u.localize("ui.common.show")}
                ${(h = this.hass) == null ? void 0 : h.localize(
      "component.calendar.entity_component._.name"
    )}
                ${(y = this.hass) == null ? void 0 : y.localize("ui.common.name")}</span
              >
              <ha-switch
                .checked=${this._config.show_calendar_name ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_calendar_name")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${(w = this.hass) == null ? void 0 : w.localize("ui.common.show")}
                ${((b = this.hass) == null ? void 0 : b.localize(
      "ui.dialogs.helper_settings.input_datetime.date"
    )) || "Date"}</span
              >
              <ha-switch
                .checked=${this._config.show_date ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_date")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_show_location")}</span
              >
              <ha-switch
                .checked=${this._config.show_location ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_location")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_show_duration")}</span
              >
              <ha-switch
                .checked=${this._config.show_duration ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_duration")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_show_time")}</span
              >
              <ha-switch
                .checked=${this._config.show_time ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_time")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${$(this.hass, "editor_icon_show_weekday")}</span
              >
              <ha-switch
                .checked=${this._config.icon_show_weekday ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "icon_show_weekday")}
              ></ha-switch>
            </div>
            <div class="settings-row">
              <span class="label"
                >${this._config.icon_show_weekday ? $(this.hass, "editor_show_month") : $(this.hass, "editor_show_weekday")}</span
              >
              <ha-switch
                .checked=${this._config.show_weekday ?? !1}
                @change=${(g) => this._toggleBooleanConfig(g, "show_weekday")}
              ></ha-switch>
            </div>
            ${this._config.show_weekday ? _`
                  <div class="settings-row">
                    <span
                      class="label"
                      style="color: var(--secondary-text-color);"
                      >${this._config.icon_show_weekday ? $(this.hass, "editor_show_month_long") : $(this.hass, "editor_show_weekday_long")}</span
                    >
                    <ha-switch
                      .checked=${this._config.show_weekday_long ?? !1}
                      @change=${(g) => this._toggleBooleanConfig(g, "show_weekday_long")}
                    ></ha-switch>
                  </div>
                  <div></div>
                ` : ""}
          </div>
        </ha-expansion-panel>

        <h4>
          ${((p = this.hass) == null ? void 0 : p.localize("ui.components.calendar.my_calendars")) || "Calendars"}
        </h4>
        <div class="entities-list">
          ${(() => {
      const g = this._getCalendarEntities(), x = this._showAllCalendars ? g : g.slice(0, 3), E = g.length > 3;
      return _`
              ${x.map((v) => {
        var A, D, P, L, z;
        const k = !r.includes(v.entity_id), m = ((A = this._config.calendar_colors) == null ? void 0 : A[v.entity_id]) || "", C = this._toCssColor(
          m || this._config.calendar_icon_color || "#fa3e3e"
        );
        return _`
                  <div class="entity-row ${k ? "" : "disabled"}">
                    <div class="entity-row-top">
                      <div
                        class="entity-icon dynamic"
                        style="background: transparent;"
                      >
                        ${this._renderDynamicIcon(
          /* @__PURE__ */ new Date(),
          C,
          this._config.dark_mode ?? !1,
          this._config.icon_show_weekday ?? !1
        )}
                      </div>
                      <div class="entity-info">
                        <span class="entity-name"
                          >${v.attributes.friendly_name || v.entity_id}</span
                        >
                        <span class="entity-id">${v.entity_id}</span>
                      </div>
                      <ha-button
                        size="small"
                        appearance="filled"
                        variant="brand"
                        class="${k ? "action-hide" : "action-show"}"
                        @click=${(j) => this._calendarToggleEntity(j, v.entity_id)}
                      >
                        ${k ? ((D = this.hass) == null ? void 0 : D.localize("ui.common.hide")) || "Hide" : ((P = this.hass) == null ? void 0 : P.localize("ui.common.show")) || "Show"}
                      </ha-button>
                    </div>
                    <div class="entity-row-bottom">
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{ ui_color: {} }}
                        .value=${m}
                        .label=${((L = this.hass) == null ? void 0 : L.localize(
          "ui.panel.lovelace.editor.card.tile.color"
        )) || "Color"}
                        @value-changed=${(j) => this._calendarColorChanged(j, v.entity_id)}
                      ></ha-selector>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{ ui_color: {} }}
                        .value=${((z = this._config.calendar_background_colors) == null ? void 0 : z[v.entity_id]) || ""}
                        .label=${$(
          this.hass,
          "editor_background_color"
        )}
                        @value-changed=${(j) => this._calendarBackgroundColorChanged(
          j,
          v.entity_id
        )}
                      ></ha-selector>
                    </div>
                  </div>
                `;
      })}
              ${E ? _`
                    <div class="show-more-row">
                      <ha-button
                        @click=${() => {
        this._showAllCalendars = !this._showAllCalendars, this.requestUpdate();
      }}
                      >
                        ${this._showAllCalendars ? $(this.hass, "editor_show_less") : $(this.hass, "editor_show_more")}
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
    const i = [...this._config.exclude_entities ?? []], a = i.indexOf(t);
    a === -1 ? i.push(t) : i.splice(a, 1), this._config = {
      ...this._config,
      exclude_entities: i
    }, H(this, "config-changed", { config: this._config });
  }
  _calendarShowAllChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      upcoming_events: t
    }, H(this, "config-changed", { config: this._config });
  }
  _compactModeChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      unfold_events: t
    }, H(this, "config-changed", { config: this._config });
  }
  _calendarDividerChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      show_divider: t
    }, H(this, "config-changed", { config: this._config });
  }
  _toggleBooleanConfig(e, t) {
    const i = e.target.checked;
    this._config = {
      ...this._config,
      [t]: i
    }, H(this, "config-changed", { config: this._config });
  }
  _valueChanged(e) {
    var r;
    if (!this._config || !this.hass)
      return;
    const i = e.target.configValue;
    if (!i)
      return;
    const a = (r = e.detail) == null ? void 0 : r.value;
    if (this._config[i] === a)
      return;
    const o = { ...this._config };
    a == null || a === "" ? delete o[i] : o[i] = a, this._config = o, H(this, "config-changed", { config: this._config });
  }
  _calendarColorChanged(e, t) {
    const i = e.detail.value, a = { ...this._config.calendar_colors || {} };
    if (i == null || i === "" ? delete a[t] : a[t] = i, Object.keys(a).length === 0) {
      const o = { ...this._config };
      delete o.calendar_colors, this._config = o;
    } else
      this._config = {
        ...this._config,
        calendar_colors: a
      };
    H(this, "config-changed", { config: this._config });
  }
  _calendarBackgroundColorChanged(e, t) {
    const i = e.detail.value, a = {
      ...this._config.calendar_background_colors || {}
    };
    if (i == null || i === "" ? delete a[t] : a[t] = i, Object.keys(a).length === 0) {
      const o = { ...this._config };
      delete o.calendar_background_colors, this._config = o;
    } else
      this._config = {
        ...this._config,
        calendar_background_colors: a
      };
    H(this, "config-changed", { config: this._config });
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
  _renderDynamicIcon(e, t, i = !1, a = !1) {
    var u, h, y;
    const o = ((h = (u = this.hass) == null ? void 0 : u.locale) == null ? void 0 : h.language) || ((y = this.hass) == null ? void 0 : y.language) || navigator.language || "en";
    let r;
    a ? r = e.toLocaleDateString(o, { weekday: "short" }).toUpperCase() : r = e.toLocaleDateString(o, { month: "short" }).toUpperCase();
    const c = e.getDate();
    return _`
      <svg
        viewBox="0 0 100 100"
        class="dynamic-calendar-icon"
        style="width: 100%; height: 100%; display: block;"
      >
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx="20"
          ry="20"
          fill="${i ? "#222222" : "white"}"
        ></rect>
        <path
          d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z"
          fill="${t}"
        ></path>
        <text
          x="50"
          y="23"
          font-family="sans-serif"
          font-size="22"
          font-weight="bold"
          fill="${i ? "#222222" : "white"}"
          text-anchor="middle"
        >
          ${r}
        </text>
        <text
          x="50"
          y="82"
          font-family="sans-serif"
          font-size="52"
          font-weight="bold"
          fill="${i ? "white" : "#333"}"
          text-anchor="middle"
        >
          ${c}
        </text>
      </svg>
    `;
  }
};
ye([
  O({ attribute: !1 })
], te.prototype, "hass", 2);
ye([
  he()
], te.prototype, "_config", 2);
ye([
  he()
], te.prototype, "_showAllCalendars", 2);
te = ye([
  De("calendar-card-plus-editor")
], te);
const Ht = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusEditor() {
    return te;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  ce as CalendarCardPlus
};
