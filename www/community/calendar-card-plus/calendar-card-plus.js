var Xe = Object.defineProperty;
var et = (n, e, t) => e in n ? Xe(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var b = (n, e, t) => et(n, typeof e != "symbol" ? e + "" : e, t);
var tt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
async function it(n, e, t, i) {
  const a = encodeURI(`?start=${e.toISOString()}&end=${t.toISOString()}`), s = i.map(async (d) => {
    try {
      const l = await n.callApi("GET", `calendars/${d}${a}`);
      if (!Array.isArray(l))
        throw new Error("Response is not an array");
      return l.map((_) => {
        var v, p, k, S, c, f;
        const u = ((v = _.start) == null ? void 0 : v.dateTime) || ((p = _.start) == null ? void 0 : p.date) || _.start, h = ((k = _.end) == null ? void 0 : k.dateTime) || ((S = _.end) == null ? void 0 : S.date) || _.end;
        return {
          ..._,
          start: { dateTime: u.includes("T") ? u : void 0, date: u.includes("T") ? void 0 : u },
          end: { dateTime: h.includes("T") ? h : void 0, date: h.includes("T") ? void 0 : h },
          summary: _.summary || _.title || "Unknown Event",
          entity_id: d,
          calendar_name: ((f = (c = n.states[d]) == null ? void 0 : c.attributes) == null ? void 0 : f.friendly_name) || d
        };
      });
    } catch {
      const r = n.states[d];
      return r && r.attributes.start_time && r.attributes.end_time ? [{
        start: { dateTime: r.attributes.start_time.replace(" ", "T") },
        end: { dateTime: r.attributes.end_time.replace(" ", "T") },
        summary: r.attributes.message || r.attributes.friendly_name,
        location: r.attributes.location,
        description: r.attributes.description,
        entity_id: d,
        calendar_name: r.attributes.friendly_name || d
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
const le = globalThis, Ce = le.ShadowRoot && (le.ShadyCSS === void 0 || le.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ae = Symbol(), Me = /* @__PURE__ */ new WeakMap();
let Ze = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== Ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Ce && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = Me.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Me.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const at = (n) => new Ze(typeof n == "string" ? n : n + "", void 0, Ae), Ee = (n, ...e) => {
  const t = n.length === 1 ? n[0] : e.reduce((i, a, s) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(a) + n[s + 1], n[0]);
  return new Ze(t, n, Ae);
}, nt = (n, e) => {
  if (Ce) n.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), a = le.litNonce;
    a !== void 0 && i.setAttribute("nonce", a), i.textContent = t.cssText, n.appendChild(i);
  }
}, Le = Ce ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return at(t);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: st, defineProperty: ot, getOwnPropertyDescriptor: rt, getOwnPropertyNames: dt, getOwnPropertySymbols: lt, getPrototypeOf: ct } = Object, O = globalThis, je = O.trustedTypes, _t = je ? je.emptyScript : "", ge = O.reactiveElementPolyfillSupport, te = (n, e) => n, ce = { toAttribute(n, e) {
  switch (e) {
    case Boolean:
      n = n ? _t : null;
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
} }, ze = (n, e) => !st(n, e), Oe = { attribute: !0, type: String, converter: ce, reflect: !1, useDefault: !1, hasChanged: ze };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), O.litPropertyMetadata ?? (O.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let F = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Oe) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), a = this.getPropertyDescriptor(e, i, t);
      a !== void 0 && ot(this.prototype, e, a);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: a, set: s } = rt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: a, set(o) {
      const d = a == null ? void 0 : a.call(this);
      s == null || s.call(this, o), this.requestUpdate(e, d, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(te("elementProperties"))) return;
    const e = ct(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(te("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(te("properties"))) {
      const t = this.properties, i = [...dt(t), ...lt(t)];
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
    var s;
    const i = this.constructor.elementProperties.get(e), a = this.constructor._$Eu(e, i);
    if (a !== void 0 && i.reflect === !0) {
      const o = (((s = i.converter) == null ? void 0 : s.toAttribute) !== void 0 ? i.converter : ce).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(a) : this.setAttribute(a, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var s, o;
    const i = this.constructor, a = i._$Eh.get(e);
    if (a !== void 0 && this._$Em !== a) {
      const d = i.getPropertyOptions(a), l = typeof d.converter == "function" ? { fromAttribute: d.converter } : ((s = d.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? d.converter : ce;
      this._$Em = a;
      const r = l.fromAttribute(t, d.type);
      this[a] = r ?? ((o = this._$Ej) == null ? void 0 : o.get(a)) ?? r, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, a = !1, s) {
    var o;
    if (e !== void 0) {
      const d = this.constructor;
      if (a === !1 && (s = this[e]), i ?? (i = d.getPropertyOptions(e)), !((i.hasChanged ?? ze)(s, t) || i.useDefault && i.reflect && s === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(d._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: a, wrapped: s }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), s !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), a === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [s, o] of a) {
        const { wrapped: d } = o, l = this[s];
        d !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, o, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((a) => {
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
F.elementStyles = [], F.shadowRootOptions = { mode: "open" }, F[te("elementProperties")] = /* @__PURE__ */ new Map(), F[te("finalized")] = /* @__PURE__ */ new Map(), ge == null || ge({ ReactiveElement: F }), (O.reactiveElementVersions ?? (O.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ie = globalThis, Be = (n) => n, _e = ie.trustedTypes, Ne = _e ? _e.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, qe = "$lit$", j = `lit$${Math.random().toFixed(9).slice(2)}$`, Fe = "?" + j, ht = `<${Fe}>`, K = document, ae = () => K.createComment(""), ne = (n) => n === null || typeof n != "object" && typeof n != "function", Se = Array.isArray, ut = (n) => Se(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", pe = `[ 	
\f\r]`, ee = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, He = /-->/g, Ue = />/g, U = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Re = /'/g, Ie = /"/g, Ye = /^(?:script|style|textarea|title)$/i, vt = (n) => (e, ...t) => ({ _$litType$: n, strings: e, values: t }), m = vt(1), Y = Symbol.for("lit-noChange"), z = Symbol.for("lit-nothing"), Ve = /* @__PURE__ */ new WeakMap(), R = K.createTreeWalker(K, 129);
function Ge(n, e) {
  if (!Se(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ne !== void 0 ? Ne.createHTML(e) : e;
}
const mt = (n, e) => {
  const t = n.length - 1, i = [];
  let a, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ee;
  for (let d = 0; d < t; d++) {
    const l = n[d];
    let r, _, u = -1, h = 0;
    for (; h < l.length && (o.lastIndex = h, _ = o.exec(l), _ !== null); ) h = o.lastIndex, o === ee ? _[1] === "!--" ? o = He : _[1] !== void 0 ? o = Ue : _[2] !== void 0 ? (Ye.test(_[2]) && (a = RegExp("</" + _[2], "g")), o = U) : _[3] !== void 0 && (o = U) : o === U ? _[0] === ">" ? (o = a ?? ee, u = -1) : _[1] === void 0 ? u = -2 : (u = o.lastIndex - _[2].length, r = _[1], o = _[3] === void 0 ? U : _[3] === '"' ? Ie : Re) : o === Ie || o === Re ? o = U : o === He || o === Ue ? o = ee : (o = U, a = void 0);
    const v = o === U && n[d + 1].startsWith("/>") ? " " : "";
    s += o === ee ? l + ht : u >= 0 ? (i.push(r), l.slice(0, u) + qe + l.slice(u) + j + v) : l + j + (u === -2 ? d : v);
  }
  return [Ge(n, s + (n[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class se {
  constructor({ strings: e, _$litType$: t }, i) {
    let a;
    this.parts = [];
    let s = 0, o = 0;
    const d = e.length - 1, l = this.parts, [r, _] = mt(e, t);
    if (this.el = se.createElement(r, i), R.currentNode = this.el.content, t === 2 || t === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (a = R.nextNode()) !== null && l.length < d; ) {
      if (a.nodeType === 1) {
        if (a.hasAttributes()) for (const u of a.getAttributeNames()) if (u.endsWith(qe)) {
          const h = _[o++], v = a.getAttribute(u).split(j), p = /([.?@])?(.*)/.exec(h);
          l.push({ type: 1, index: s, name: p[2], strings: v, ctor: p[1] === "." ? pt : p[1] === "?" ? ft : p[1] === "@" ? wt : he }), a.removeAttribute(u);
        } else u.startsWith(j) && (l.push({ type: 6, index: s }), a.removeAttribute(u));
        if (Ye.test(a.tagName)) {
          const u = a.textContent.split(j), h = u.length - 1;
          if (h > 0) {
            a.textContent = _e ? _e.emptyScript : "";
            for (let v = 0; v < h; v++) a.append(u[v], ae()), R.nextNode(), l.push({ type: 2, index: ++s });
            a.append(u[h], ae());
          }
        }
      } else if (a.nodeType === 8) if (a.data === Fe) l.push({ type: 2, index: s });
      else {
        let u = -1;
        for (; (u = a.data.indexOf(j, u + 1)) !== -1; ) l.push({ type: 7, index: s }), u += j.length - 1;
      }
      s++;
    }
  }
  static createElement(e, t) {
    const i = K.createElement("template");
    return i.innerHTML = e, i;
  }
}
function G(n, e, t = n, i) {
  var o, d;
  if (e === Y) return e;
  let a = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const s = ne(e) ? void 0 : e._$litDirective$;
  return (a == null ? void 0 : a.constructor) !== s && ((d = a == null ? void 0 : a._$AO) == null || d.call(a, !1), s === void 0 ? a = void 0 : (a = new s(n), a._$AT(n, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = a : t._$Cl = a), a !== void 0 && (e = G(n, a._$AS(n, e.values), a, i)), e;
}
class gt {
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
    const { el: { content: t }, parts: i } = this._$AD, a = ((e == null ? void 0 : e.creationScope) ?? K).importNode(t, !0);
    R.currentNode = a;
    let s = R.nextNode(), o = 0, d = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let r;
        l.type === 2 ? r = new re(s, s.nextSibling, this, e) : l.type === 1 ? r = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (r = new yt(s, this, e)), this._$AV.push(r), l = i[++d];
      }
      o !== (l == null ? void 0 : l.index) && (s = R.nextNode(), o++);
    }
    return R.currentNode = K, a;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class re {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, a) {
    this.type = 2, this._$AH = z, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = a, this._$Cv = (a == null ? void 0 : a.isConnected) ?? !0;
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
    e = G(this, e, t), ne(e) ? e === z || e == null || e === "" ? (this._$AH !== z && this._$AR(), this._$AH = z) : e !== this._$AH && e !== Y && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ut(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== z && ne(this._$AH) ? this._$AA.nextSibling.data = e : this.T(K.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: t, _$litType$: i } = e, a = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = se.createElement(Ge(i.h, i.h[0]), this.options)), i);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === a) this._$AH.p(t);
    else {
      const o = new gt(a, this), d = o.u(this.options);
      o.p(t), this.T(d), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = Ve.get(e.strings);
    return t === void 0 && Ve.set(e.strings, t = new se(e)), t;
  }
  k(e) {
    Se(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, a = 0;
    for (const s of e) a === t.length ? t.push(i = new re(this.O(ae()), this.O(ae()), this, this.options)) : i = t[a], i._$AI(s), a++;
    a < t.length && (this._$AR(i && i._$AB.nextSibling, a), t.length = a);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const a = Be(e).nextSibling;
      Be(e).remove(), e = a;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class he {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, a, s) {
    this.type = 1, this._$AH = z, this._$AN = void 0, this.element = e, this.name = t, this._$AM = a, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = z;
  }
  _$AI(e, t = this, i, a) {
    const s = this.strings;
    let o = !1;
    if (s === void 0) e = G(this, e, t, 0), o = !ne(e) || e !== this._$AH && e !== Y, o && (this._$AH = e);
    else {
      const d = e;
      let l, r;
      for (e = s[0], l = 0; l < s.length - 1; l++) r = G(this, d[i + l], t, l), r === Y && (r = this._$AH[l]), o || (o = !ne(r) || r !== this._$AH[l]), r === z ? e = z : e !== z && (e += (r ?? "") + s[l + 1]), this._$AH[l] = r;
    }
    o && !a && this.j(e);
  }
  j(e) {
    e === z ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class pt extends he {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === z ? void 0 : e;
  }
}
class ft extends he {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== z);
  }
}
class wt extends he {
  constructor(e, t, i, a, s) {
    super(e, t, i, a, s), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = G(this, e, t, 0) ?? z) === Y) return;
    const i = this._$AH, a = e === z && i !== z || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, s = e !== z && (i === z || a);
    a && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class yt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    G(this, e);
  }
}
const fe = ie.litHtmlPolyfillSupport;
fe == null || fe(se, re), (ie.litHtmlVersions ?? (ie.litHtmlVersions = [])).push("3.3.2");
const $t = (n, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let a = i._$litPart$;
  if (a === void 0) {
    const s = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = a = new re(e.insertBefore(ae(), s), s, void 0, t ?? {});
  }
  return a._$AI(n), a;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = globalThis;
class V extends F {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = $t(t, this.renderRoot, this.renderOptions);
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
var We;
V._$litElement$ = !0, V.finalized = !0, (We = I.litElementHydrateSupport) == null || We.call(I, { LitElement: V });
const we = I.litElementPolyfillSupport;
we == null || we({ LitElement: V });
(I.litElementVersions ?? (I.litElementVersions = [])).push("4.2.2");
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
const xt = { attribute: !0, type: String, converter: ce, reflect: !1, hasChanged: ze }, bt = (n = xt, e, t) => {
  const { kind: i, metadata: a } = t;
  let s = globalThis.litPropertyMetadata.get(a);
  if (s === void 0 && globalThis.litPropertyMetadata.set(a, s = /* @__PURE__ */ new Map()), i === "setter" && ((n = Object.create(n)).wrapped = !0), s.set(t.name, n), i === "accessor") {
    const { name: o } = t;
    return { set(d) {
      const l = e.get.call(this);
      e.set.call(this, d), this.requestUpdate(o, l, n, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(o, void 0, n, d), d;
    } };
  }
  if (i === "setter") {
    const { name: o } = t;
    return function(d) {
      const l = this[o];
      e.call(this, d), this.requestUpdate(o, l, n, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function M(n) {
  return (e, t) => typeof t == "object" ? bt(n, e, t) : ((i, a, s) => {
    const o = a.hasOwnProperty(s);
    return a.constructor.createProperty(s, i), o ? Object.getOwnPropertyDescriptor(a, s) : void 0;
  })(n, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function de(n) {
  return M({ ...n, state: !0, attribute: !1 });
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
    editor_max_lines: "Max. displayed events"
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
    editor_max_lines: "Max. angezeigte Termine"
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
function y(n, e, t, i) {
  var o;
  const a = ((o = n.locale) == null ? void 0 : o.language) || n.language || "en";
  let s;
  if (q[a] && q[a][e])
    s = q[a][e];
  else if (q.en && q.en[e])
    s = q.en[e];
  else
    return e;
  return t && i && (s = s.replace(t, i)), s;
}
function kt(n, e, t) {
  var d, l;
  const i = (t == null ? void 0 : t.unfold_events) || !1;
  if (e === void 0)
    return m`
        <div class="calendar-container">
            <div class="calendar-item" style="cursor: default;">
                 <div class="calendar-icon" style="background-color: var(--primary-color, #03a9f4);">
                    <ha-icon icon="mdi:calendar-clock"></ha-icon>
                </div>
                <div class="calendar-content">
                    <div class="event-title">${y(n, "loading")}</div>
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
                    <div class="event-title">${y(n, "no_events")}</div>
                </div>
            </div>
        </div>
        `;
  if (!i) {
    const r = e[0], _ = e.length - 1, u = r.summary;
    let h, v;
    try {
      if (h = new Date(r.start.dateTime || r.start.date), v = new Date(r.end.dateTime || r.end.date), isNaN(h.getTime()) || isNaN(v.getTime())) throw new Error("Invalid Date");
    } catch {
      return m`<div class="error">Date Error</div>`;
    }
    const p = /* @__PURE__ */ new Date(), k = !r.start.dateTime, S = be(n, h, v, k), c = ((d = n.locale) == null ? void 0 : d.language) || n.language || navigator.language, f = (T) => T.toLocaleTimeString(c, { hour: "2-digit", minute: "2-digit" }), x = `${f(h)} - ${f(v)}`, w = (t == null ? void 0 : t.show_date) ?? !1, $ = (t == null ? void 0 : t.show_time) ?? !1;
    let g = "";
    const A = n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    if (w || $)
      if (k) {
        const T = w ? h.toLocaleDateString(c, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
        w && $ ? g = `${T}, ${A}` : g = T || A;
      } else {
        const T = [];
        w && T.push(h.toLocaleDateString(c, { day: "2-digit", month: "2-digit", year: "numeric" })), $ && T.push(x), g = T.join(", ");
      }
    else if (h > p) {
      const T = h.getTime() - p.getTime(), J = Math.ceil(T / 6e4);
      g = ke(n, J);
    } else
      g = k ? A : f(h);
    if (t != null && t.show_duration && (g ? g.endsWith(S) || (g += ` • ${S}`) : g = S), _ > 0 && (g += ` ${y(n, "more_events", "{x}", _.toString())}`), t != null && t.show_weekday) {
      const T = ((l = n.locale) == null ? void 0 : l.language) || n.language || navigator.language, J = h.toLocaleDateString(T, { weekday: t.show_weekday_long ? "long" : "short" });
      g += ` • ${J}`;
    }
    const N = h <= p && v >= p ? p : h, W = ye(r.entity_id, t), Z = xe(n, N, W, (t == null ? void 0 : t.dark_mode) ?? !1), H = $e(r.entity_id, t), D = H ? `background-color: ${H}; border: none;` : "";
    return m`
            <div class="calendar-container">
                <div class="calendar-item"  
                     style="${D}"
                     title="${u}"
                     @click=${(T) => Ke(T, n, e)}>
                     <div class="calendar-icon dynamic">
                        ${Z}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${u}</div>
                        <div class="event-time">
                            ${w || $ ? m`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
                            ${g}
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
  const a = (t == null ? void 0 : t.max_lines) || 0, s = a > 0 ? e.slice(0, a) : e, o = e.length - s.length;
  return m`
        <div class="calendar-container">
            ${s.map((r, _) => {
    var Pe, De;
    const u = r.summary;
    let h, v;
    try {
      if (h = new Date(r.start.dateTime || r.start.date), v = new Date(r.end.dateTime || r.end.date), isNaN(h.getTime())) throw new Error("Invalid start date");
      if (isNaN(v.getTime())) throw new Error("Invalid end date");
    } catch {
      return m`<div class="error">Date Error for ${u}</div>`;
    }
    const p = /* @__PURE__ */ new Date(), k = !r.start.dateTime;
    let S = -1;
    const c = be(n, h, v, k), f = ((Pe = n.locale) == null ? void 0 : Pe.language) || n.language || navigator.language, x = (E) => E.toLocaleTimeString(f, { hour: "2-digit", minute: "2-digit" }), w = `${x(h)} - ${x(v)}`, $ = (t == null ? void 0 : t.show_date) ?? !1, g = (t == null ? void 0 : t.show_time) ?? !1;
    let A = "";
    const C = n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
    if ($ || g)
      if (k) {
        const E = $ ? h.toLocaleDateString(f, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
        $ && g ? A = `${E}, ${C}` : A = E || C;
      } else {
        const E = [];
        $ && E.push(h.toLocaleDateString(f, { day: "2-digit", month: "2-digit", year: "numeric" })), g && E.push(w), A = E.join(", ");
      }
    else if (h > p) {
      const E = h.getTime() - p.getTime(), X = Math.ceil(E / 6e4);
      A = ke(n, X);
    } else
      A = k ? C : x(h);
    if (t != null && t.show_duration && (A ? A.endsWith(c) || (A += ` • ${c}`) : A = c), !k && h <= p && v >= p) {
      const E = v.getTime() - h.getTime(), X = p.getTime() - h.getTime();
      E > 0 && (S = Math.max(0, Math.min(100, X / E * 100)));
    }
    if (t != null && t.show_weekday) {
      const E = ((De = n.locale) == null ? void 0 : De.language) || n.language || navigator.language, X = h.toLocaleDateString(E, { weekday: t.show_weekday_long ? "long" : "short" });
      A += ` • ${X}`;
    }
    const W = h <= p && v >= p ? p : h, Z = ye(r.entity_id, t), H = xe(n, W, Z, (t == null ? void 0 : t.dark_mode) ?? !1), D = $e(r.entity_id, t), T = D ? `background-color: ${D}; border: none;` : "", J = (t == null ? void 0 : t.show_divider) && _ > 0, me = a > 0 && _ === a - 1 && o > 0;
    return m`
                ${J ? m`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item"  
                     style="${T}"
                     title="${me ? y(n, "popup_upcoming_events") : u}"
                     @click=${(E) => me ? Ke(E, n, e) : Ct(E, r.entity_id)}>
                     <div class="calendar-icon dynamic">
                        ${H}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${u}</span>
                            ${me ? m`
                                <span class="more-indicator" style="display: flex; align-items: center; gap: 4px; color: var(--secondary-text-color); font-size: 0.85em; font-style: italic; flex-shrink: 0;">
                                    <ha-icon icon="mdi:dots-horizontal" style="--mdc-icon-size: 16px; color: var(--secondary-text-color);"></ha-icon>
                                    (${o})
                                </span>
                            ` : ""}
                        </div>
                        <div class="event-time">
                            ${$ || g ? m`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
                            ${A}
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
                        ${S >= 0 ? m`
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${S}%"></div>
                            </div>
                        ` : ""}
                    </div>
                </div>
                `;
  })}
        </div>
    `;
}
function ye(n, e) {
  var i;
  const t = ((i = e == null ? void 0 : e.calendar_colors) == null ? void 0 : i[n]) || (e == null ? void 0 : e.calendar_icon_color) || "#fa3e3e";
  return Qe(t);
}
function $e(n, e) {
  var i;
  const t = ((i = e == null ? void 0 : e.calendar_background_colors) == null ? void 0 : i[n]) || (e == null ? void 0 : e.background_color) || "";
  return t ? Qe(t) : "";
}
function Qe(n) {
  return n.startsWith("#") || n.startsWith("rgb") || n.startsWith("hsl") || n.startsWith("var") ? n : `var(--${n}-color)`;
}
function Ke(n, e, t) {
  const i = new CustomEvent("calendar-card-show-detail", {
    bubbles: !0,
    composed: !0,
    detail: {
      title: y(e, "popup_upcoming_events"),
      entities: t
    }
  });
  n.target.dispatchEvent(i);
}
function Ct(n, e) {
  const t = new CustomEvent("hass-more-info", {
    bubbles: !0,
    composed: !0,
    detail: { entityId: e }
  });
  n.target.dispatchEvent(t);
}
function xe(n, e, t, i = !1) {
  var _;
  const a = ((_ = n.locale) == null ? void 0 : _.language) || n.language || navigator.language, s = e.toLocaleDateString(a, { month: "short" }).toUpperCase(), o = e.getDate();
  return m`
        <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
            <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${i ? "#222222" : "white"}"></rect>
            <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
            <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${i ? "#222222" : "white"}" text-anchor="middle">${s}</text>
            <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${i ? "white" : "#333"}" text-anchor="middle">${o}</text>
        </svg>
    `;
}
function be(n, e, t, i) {
  const a = t.getTime() - e.getTime(), s = Math.round(a / 6e4);
  if (i && s === 1440)
    return n.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
  if (s < 60)
    return `${s} ${y(n, "duration_min")}`;
  const o = Math.floor(s / 1440), d = s % 1440, l = Math.floor(d / 60), r = d % 60, _ = [];
  return o >= 1 && _.push(`${o} ${y(n, o === 1 ? "duration_day" : "duration_days")}`), l > 0 && _.push(`${l} ${y(n, "duration_hour")}`), r > 0 && _.push(`${r} ${y(n, "duration_min")}`), _.join(" ");
}
function ke(n, e) {
  if (e < 60)
    return e === 1 ? y(n, "starts_in_min", "{x}", e.toString()) : y(n, "starts_in_mins", "{x}", e.toString());
  if (e < 1440) {
    const i = Math.round(e / 60);
    return i === 1 ? y(n, "starts_in_hour", "{x}", i.toString()) : y(n, "starts_in_hours", "{x}", i.toString());
  }
  if (e < 43200) {
    const i = Math.round(e / 1440);
    return i === 1 ? y(n, "starts_in_day", "{x}", i.toString()) : y(n, "starts_in_days", "{x}", i.toString());
  }
  const t = Math.round(e / 10080);
  return t === 1 ? y(n, "starts_in_week", "{x}", t.toString()) : y(n, "starts_in_weeks", "{x}", t.toString());
}
function At(n, e) {
  const t = Object.keys(n.states).filter((r) => r.startsWith("calendar.")).filter((r) => {
    var _;
    return !((_ = e.exclude_entities) != null && _.includes(r));
  }), i = t.length > 0 ? t[0] : void 0, a = /* @__PURE__ */ new Date(), s = new Date(a);
  s.setHours(s.getHours() + 1, 0, 0, 0);
  const o = new Date(s);
  o.setHours(o.getHours() + 1, 0, 0, 0);
  const d = (r) => r.toString().padStart(2, "0"), l = (r) => `${r.getFullYear()}-${d(r.getMonth() + 1)}-${d(r.getDate())} ${d(r.getHours())}:${d(r.getMinutes())}:00`;
  return {
    open: !0,
    calendar_id: i,
    name: "",
    start: l(s),
    end: l(o),
    location: "",
    description: "",
    recurrence: "none",
    all_day: !1
  };
}
async function Et(n, e, t, i) {
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
          const d = o.split("-"), l = new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]));
          l.setDate(l.getDate() + 1);
          const r = (_) => _.toString().padStart(2, "0");
          o = `${l.getFullYear()}-${r(l.getMonth() + 1)}-${r(l.getDate())}`;
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
      await n.callService("calendar", "create_event", a), t();
    } catch (a) {
      i(a);
    }
}
function zt(n, e, t, i, a, s) {
  var d, l, r, _, u, h, v, p, k, S;
  const o = Object.keys(n.states).filter((c) => c.startsWith("calendar.")).filter((c) => {
    var f;
    return !((f = e.exclude_entities) != null && f.includes(c));
  });
  return m`
        <div class="add-event-form">
            <ha-textfield
                    label=${n.localize("ui.components.calendar.event.summary") || "Title"}
                    .value=${t.name || ""}
                    @input=${(c) => i({ name: c.target.value })}
                    dialogInitialFocus
                ></ha-textfield>

                <ha-textfield
                    label=${n.localize("ui.components.calendar.event.location") || "Location"}
                    .value=${t.location || ""}
                    @input=${(c) => i({ location: c.target.value })}
                ></ha-textfield>

                <ha-textfield
                    label=${n.localize("ui.components.calendar.event.description") || "Description"}
                    .value=${t.description || ""}
                    @input=${(c) => i({ description: c.target.value })}
                ></ha-textfield>

                <ha-selector
                    .hass=${n}
                    .selector=${{ select: { options: o.map((c) => {
    var f, x;
    return { value: c, label: ((x = (f = n.states[c]) == null ? void 0 : f.attributes) == null ? void 0 : x.friendly_name) || c };
  }) } }}
                    .value=${t.calendar_id}
                    .label=${n.localize("ui.components.calendar.my_calendars") || "Calendar"}
                    @value-changed=${(c) => i({ calendar_id: c.detail.value })}
                ></ha-selector>

                <div class="row-flex">
                    <ha-formfield .label=${n.localize("ui.components.calendar.event.all_day") || "All Day"}>
                        <ha-switch
                            .checked=${t.all_day || !1}
                            @change=${(c) => i({ all_day: c.target.checked })}
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
                        .value=${((d = t.start) == null ? void 0 : d.split(" ")[0]) || ""}
                        @value-changed=${(c) => {
    var x;
    const f = ((x = t.start) == null ? void 0 : x.split(" ")[1]) || "00:00:00";
    i({ start: `${c.detail.value} ${f}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((r = (l = t.start) == null ? void 0 : l.split(" ")[1]) == null ? void 0 : r.substring(0, 2)) || "00"}
                            @change=${(c) => {
    var w, $, g;
    const f = ((w = t.start) == null ? void 0 : w.split(" ")[0]) || "", x = ((g = ($ = t.start) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : g.substring(3, 5)) || "00";
    i({ start: `${f} ${c.target.value.padStart(2, "0")}:${x}:00` });
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
    var w, $, g;
    const f = ((w = t.start) == null ? void 0 : w.split(" ")[0]) || "", x = ((g = ($ = t.start) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : g.substring(0, 2)) || "00";
    i({ start: `${f} ${x}:${c.target.value.padStart(2, "0")}:00` });
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
    var x;
    const f = ((x = t.end) == null ? void 0 : x.split(" ")[1]) || "00:00:00";
    i({ end: `${c.detail.value} ${f}` });
  }}
                    ></ha-selector>
                    <div class="time-inputs-wrap">
                        <ha-textfield
                            type="number"
                            min="0"
                            max="23"
                            .disabled=${t.all_day}
                            .value=${((p = (v = t.end) == null ? void 0 : v.split(" ")[1]) == null ? void 0 : p.substring(0, 2)) || "00"}
                            @change=${(c) => {
    var w, $, g;
    const f = ((w = t.end) == null ? void 0 : w.split(" ")[0]) || "", x = ((g = ($ = t.end) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : g.substring(3, 5)) || "00";
    i({ end: `${f} ${c.target.value.padStart(2, "0")}:${x}:00` });
  }}
                            style="flex: 1; min-width: 0;"
                        ></ha-textfield>
                        <span>:</span>
                        <ha-textfield
                            type="number"
                            min="0"
                            max="59"
                            .disabled=${t.all_day}
                            .value=${((S = (k = t.end) == null ? void 0 : k.split(" ")[1]) == null ? void 0 : S.substring(3, 5)) || "00"}
                            @change=${(c) => {
    var w, $, g;
    const f = ((w = t.end) == null ? void 0 : w.split(" ")[0]) || "", x = ((g = ($ = t.end) == null ? void 0 : $.split(" ")[1]) == null ? void 0 : g.substring(0, 2)) || "00";
    i({ end: `${f} ${x}:${c.target.value.padStart(2, "0")}:00` });
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
                    @value-changed=${(c) => i({ recurrence: c.detail.value })}
                ></ha-selector>

                <div class="dialog-actions">
                    <ha-button @click=${a}>
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
var Je = Object.defineProperty, St = Object.getOwnPropertyDescriptor, Tt = (n, e, t) => e in n ? Je(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, B = (n, e, t, i) => {
  for (var a = i > 1 ? void 0 : i ? St(e, t) : e, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (a = (i ? o(e, t, a) : o(a)) || a);
  return i && a && Je(e, t, a), a;
}, Pt = (n, e, t) => Tt(n, e + "", t);
let P = class extends V {
  constructor() {
    super(...arguments);
    b(this, "hass");
    b(this, "config");
    b(this, "open", !1);
    b(this, "mode", "detail");
    b(this, "detailTitle", "");
    b(this, "detailEvents", []);
    b(this, "_addEventState", { open: !1 });
    b(this, "_opener", null);
    b(this, "_onEventSaved", null);
    b(this, "_onPopState", (e) => {
      var t;
      this.open && !((t = window.history.state) != null && t.calendarCardPlusPopup) && this._close();
    });
    b(this, "_close", () => {
      if (!this.open) return;
      this.open = !1, this.requestUpdate();
      const e = { dialog: this };
      this.dispatchEvent(new CustomEvent("closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: !0, composed: !0, detail: e })), this.dispatchEvent(new CustomEvent("popup-closed", { bubbles: !0, composed: !0, detail: e }));
    });
    // Guard: only close if event originates from ha-adaptive-dialog itself, not from child elements
    b(this, "_onDialogClosed", (e) => {
      var t;
      if (e && e.type !== "click") {
        const i = e.target;
        if (i && i.tagName !== "HA-ADAPTIVE-DIALOG" && i.tagName !== "HA-DIALOG")
          return;
      }
      this._close(), (t = window.history.state) != null && t.calendarCardPlusPopup && window.history.back();
    });
    b(this, "_closeDialog", () => {
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
        this.dispatchEvent(new CustomEvent("event-saved", { bubbles: !0, composed: !0 })), this._onEventSaved && this._onEventSaved(), this._closeDialog();
      },
      (e) => {
        alert("Error saving event: " + e.message);
      }
    );
  }
  render() {
    var i;
    const e = this.mode === "add-event", t = e ? ((i = this.hass) == null ? void 0 : i.localize("ui.components.calendar.event.add")) || "Add Event" : this.detailTitle;
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
                    ${e ? zt(
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
      var A;
      const i = e.summary;
      let a = "", s, o;
      try {
        s = new Date(e.start.dateTime || e.start.date), o = new Date(e.end.dateTime || e.end.date);
      } catch {
        return m`<div class="error">Date Error</div>`;
      }
      const d = /* @__PURE__ */ new Date(), l = !e.start.dateTime, r = ((A = this.hass.locale) == null ? void 0 : A.language) || this.hass.language || navigator.language, _ = (C) => C.toLocaleTimeString(r, { hour: "2-digit", minute: "2-digit" }), u = be(this.hass, s, o, l), h = `${_(s)} - ${_(o)}`, v = this.config.show_date ?? !1, p = this.config.show_time ?? !1, k = this.hass.localize("component.calendar.entity_component._.state_attributes.all_day.name") || "All day";
      if (v || p)
        if (l) {
          const C = v ? s.toLocaleDateString(r, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
          v && p ? a = `${C}, ${k}` : a = C || k;
        } else {
          const C = [];
          v && C.push(s.toLocaleDateString(r, { day: "2-digit", month: "2-digit", year: "numeric" })), p && C.push(h), a = C.join(", ");
        }
      else if (s > d) {
        const C = s.getTime() - d.getTime(), N = Math.ceil(C / 6e4);
        a = ke(this.hass, N);
      } else
        a = l ? k : _(s);
      if (this.config.show_duration && (a ? a.endsWith(u) || (a += ` • ${u}`) : a = u), this.config.show_weekday) {
        const C = s.toLocaleDateString(r, { weekday: this.config.show_weekday_long ? "long" : "short" });
        a += ` • ${C}`;
      }
      const c = s <= d && o >= d ? d : s, f = ye(e.entity_id, this.config), x = xe(this.hass, c, f, this.config.dark_mode ?? !1), w = this.config.show_divider && t > 0, $ = $e(e.entity_id, this.config), g = $ ? `background-color: ${$}; border: none;` : "";
      return m`
                ${w ? m`<div class="calendar-divider"></div>` : ""}
                <div class="calendar-item detail" style=${g} @click=${() => this._handleMoreInfo(e.entity_id)}>
                    <div class="calendar-icon dynamic">
                        ${x}
                    </div>
                    <div class="calendar-content">
                        <div class="event-title">${i}</div>
                        <div class="event-time">
                            ${v || p ? m`<ha-icon icon="mdi:clock-time-four-outline"></ha-icon>` : ""}
                            ${a}
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
Pt(P, "styles", Ee`
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

        .row-label {
            font-weight: 500;
            margin-bottom: -8px;
        }
    `);
B([
  M({ attribute: !1 })
], P.prototype, "hass", 2);
B([
  M({ attribute: !1 })
], P.prototype, "config", 2);
B([
  M({ type: Boolean })
], P.prototype, "open", 2);
B([
  M({ type: String })
], P.prototype, "mode", 2);
B([
  M({ type: String })
], P.prototype, "detailTitle", 2);
B([
  M({ type: Array })
], P.prototype, "detailEvents", 2);
B([
  de()
], P.prototype, "_addEventState", 2);
P = B([
  Te("calendar-card-plus-popup")
], P);
const Dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusPopup() {
    return P;
  }
}, Symbol.toStringTag, { value: "Module" }));
var Mt = Object.defineProperty, Lt = Object.getOwnPropertyDescriptor, ue = (n, e, t, i) => {
  for (var a = i > 1 ? void 0 : i ? Lt(e, t) : e, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (a = (i ? o(e, t, a) : o(a)) || a);
  return i && a && Mt(e, t, a), a;
};
let oe = class extends V {
  constructor() {
    super(...arguments);
    b(this, "hass");
    b(this, "config");
    b(this, "_events");
    b(this, "_handleShowDetail", async (e) => {
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "detail",
        title: e.detail.title,
        events: e.detail.entities
      });
    });
    b(this, "_openAddEventPopup", async () => {
      const e = At(this.hass, this.config);
      this._showPopup("calendar-card-plus-popup", {
        hass: this.hass,
        config: this.config,
        opener: this,
        mode: "add-event",
        addEventState: e
      });
    });
    b(this, "_onEventSaved", () => {
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
    const i = Object.keys(this.hass.states).filter((s) => s.startsWith("calendar.")).filter((s) => {
      var o;
      return !((o = this.config.exclude_entities) != null && o.includes(s));
    });
    if (i.length === 0) {
      this._events = [];
      return;
    }
    const a = await it(this.hass, e, t, i);
    a.sort((s, o) => {
      const d = new Date(s.start.dateTime || s.start.date).getTime(), l = new Date(o.start.dateTime || o.start.date).getTime();
      return d - l;
    }), this._events = a, this.requestUpdate();
  }
  render() {
    if (!this.config || !this.hass)
      return m``;
    const e = kt(this.hass, this._events, this.config);
    return m`
            <ha-card>
                <div class="add-event-btn" @click=${this._openAddEventPopup} style=${this.config.show_add_event ? "" : "display: none;"}>
                    <ha-icon-button .path=${tt}></ha-icon-button>
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
          dialogImport: () => Promise.resolve().then(() => Dt),
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
        `;
  }
  getCardSize() {
    return 1;
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => Bt), document.createElement("calendar-card-plus-editor");
  }
  static getStubConfig(e) {
    return {
      type: "custom:calendar-card-plus",
      exclude_entities: [],
      unfold_events: !1
    };
  }
};
ue([
  M({ attribute: !1 })
], oe.prototype, "hass", 2);
ue([
  de()
], oe.prototype, "config", 2);
ue([
  de()
], oe.prototype, "_events", 2);
oe = ue([
  Te("calendar-card-plus")
], oe);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "calendar-card-plus",
  name: "Dynamic Calendar Card Plus",
  preview: !0,
  description: "A standalone calendar card with dynamic grid styling"
});
const L = (n, e, t, i) => {
  i = i || {}, t = t ?? {};
  const a = new Event(e, {
    bubbles: i.bubbles === void 0 ? !0 : i.bubbles,
    cancelable: !!i.cancelable,
    composed: i.composed === void 0 ? !0 : i.composed
  });
  return a.detail = t, n.dispatchEvent(a), a;
};
var jt = Object.defineProperty, Ot = Object.getOwnPropertyDescriptor, ve = (n, e, t, i) => {
  for (var a = i > 1 ? void 0 : i ? Ot(e, t) : e, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (a = (i ? o(e, t, a) : o(a)) || a);
  return i && a && jt(e, t, a), a;
};
let Q = class extends V {
  constructor() {
    super(...arguments);
    b(this, "hass");
    b(this, "_config", { type: "custom:calendar-card-plus" });
    b(this, "_showAllCalendars", !1);
  }
  set config(e) {
    this.setConfig(e);
  }
  setConfig(e) {
    this._config = e, this.requestUpdate();
  }
  render() {
    var d, l, r, _, u, h, v, p, k, S;
    if (!this.hass)
      return m``;
    const e = this._config.upcoming_events ?? !1, t = this._config.unfold_events ?? !1, i = this._config.days ?? 1, a = this._config.hours ?? 0, s = this._config.minutes ?? 0, o = this._config.exclude_entities ?? [];
    return m`
            <div class="card-config">


                <div class="settings-grid">
                    <div class="settings-row">
                        <span class="label">${y(this.hass, "editor_unfold_events")}</span>
                        <ha-switch
                            .checked=${t}
                            @change=${this._compactModeChanged}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${y(this.hass, "editor_show_divider")}</span>
                        <ha-switch
                            .checked=${this._config.show_divider ?? !1}
                            @change=${this._calendarDividerChanged}
                        ></ha-switch>
                    </div>

                    <div class="settings-row">
                        <span class="label">${(d = this.hass) == null ? void 0 : d.localize("ui.common.show")} ${(l = this.hass) == null ? void 0 : l.localize("component.calendar.entity_component._.name")} ${(r = this.hass) == null ? void 0 : r.localize("ui.common.name")}</span>
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
                        <span class="label">${y(this.hass, "editor_show_location")}</span>
                        <ha-switch
                            .checked=${this._config.show_location ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_location")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${y(this.hass, "editor_show_duration")}</span>
                        <ha-switch
                            .checked=${this._config.show_duration ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_duration")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${y(this.hass, "editor_show_time")}</span>
                        <ha-switch
                            .checked=${this._config.show_time ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_time")}
                        ></ha-switch>
                    </div>

                    <div class="settings-row">
                        <span class="label">${y(this.hass, "editor_show_weekday")}</span>
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
                        <span class="label" style="color: var(--secondary-text-color);">${y(this.hass, "editor_show_weekday_long")}</span>
                        <ha-switch
                            .checked=${this._config.show_weekday_long ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_weekday_long")}
                        ></ha-switch>
                    </div>
                    <div></div>
                ` : ""}

                    <div class="settings-row">
                        <span class="label">${y(this.hass, "editor_show_add_event")}</span>
                        <ha-switch
                            .checked=${this._config.show_add_event ?? !1}
                            @change=${(c) => this._toggleBooleanConfig(c, "show_add_event")}
                        ></ha-switch>
                    </div>
                    <div class="settings-row">
                        <span class="label">${y(this.hass, "editor_show_upcoming")}</span>
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
                                .label=${y(this.hass, "editor_max_lines")}
                                .configValue=${"max_lines"}
                                @value-changed=${this._valueChanged}
                            ></ha-selector>
                        </div>
                    ` : ""}
                </div>

            ${e ? m`
                <div class="settings-row full-width">
                     <span class="label" style="margin-bottom: 8px;">${((h = this.hass) == null ? void 0 : h.localize("ui.panel.lovelace.editor.card.statistic.period")) || "Period"}</span>
                     <div class="period-selectors">
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 365, mode: "box" } }}
                            .value=${i}
                            .label=${((v = this.hass) == null ? void 0 : v.localize("component.input_datetime.entity_component._.state_attributes.day.name")) || "Days"}
                            .configValue=${"days"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 23, mode: "box" } }}
                            .value=${a}
                            .label=${((p = this.hass) == null ? void 0 : p.localize("component.input_datetime.entity_component._.state_attributes.hour.name")) || "Hours"}
                            .configValue=${"hours"}
                            @value-changed=${this._valueChanged}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 59, mode: "box" } }}
                            .value=${s}
                            .label=${((k = this.hass) == null ? void 0 : k.localize("component.input_datetime.entity_component._.state_attributes.minute.name")) || "Minutes"}
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
                        .label=${y(this.hass, "editor_background_color")}
                        .configValue=${"background_color"}
                        @value-changed=${this._valueChanged}
                    ></ha-selector>
                </div>

                <h4>${((S = this.hass) == null ? void 0 : S.localize("ui.components.calendar.my_calendars")) || "Calendars"}</h4>
                <div class="entities-list">
                    ${(() => {
      const c = this._getCalendarEntities(), f = this._showAllCalendars ? c : c.slice(0, 3), x = c.length > 3;
      return m`
                            ${f.map((w) => {
        var C, N, W, Z, H;
        const $ = !o.includes(w.entity_id), g = ((C = this._config.calendar_colors) == null ? void 0 : C[w.entity_id]) || "", A = this._toCssColor(g || this._config.calendar_icon_color || "#fa3e3e");
        return m`
                                    <div class="entity-row ${$ ? "" : "disabled"}">
                                        <div class="entity-row-top">
                                            <div class="entity-icon dynamic" style="background: transparent;">
                                                ${this._renderDynamicIcon(/* @__PURE__ */ new Date(), A, this._config.dark_mode ?? !1)}
                                            </div>
                                            <div class="entity-info">
                                                <span class="entity-name">${w.attributes.friendly_name || w.entity_id}</span>
                                                <span class="entity-id">${w.entity_id}</span>
                                            </div>
                                            <ha-button
                                                size="small" 
                                                appearance="filled" 
                                                variant="brand" 
                                                class="${$ ? "action-hide" : "action-show"}"
                                                @click=${(D) => this._calendarToggleEntity(D, w.entity_id)}
                                            >
                                                ${$ ? ((N = this.hass) == null ? void 0 : N.localize("ui.common.hide")) || "Hide" : ((W = this.hass) == null ? void 0 : W.localize("ui.common.show")) || "Show"}
                                            </ha-button>
                                        </div>
                                        <div class="entity-row-bottom">
                                             <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${g}
                                                .label=${((Z = this.hass) == null ? void 0 : Z.localize("ui.panel.lovelace.editor.card.tile.color")) || "Color"}
                                                @value-changed=${(D) => this._calendarColorChanged(D, w.entity_id)}
                                            ></ha-selector>
                                            <ha-selector
                                                .hass=${this.hass}
                                                .selector=${{ ui_color: {} }}
                                                .value=${((H = this._config.calendar_background_colors) == null ? void 0 : H[w.entity_id]) || ""}
                                                .label=${y(this.hass, "editor_background_color")}
                                                @value-changed=${(D) => this._calendarBackgroundColorChanged(D, w.entity_id)}
                                            ></ha-selector>
                                        </div>
                                    </div>
                                `;
      })}
                            ${x ? m`
                                <div class="show-more-row">
                                    <ha-button @click=${() => {
        this._showAllCalendars = !this._showAllCalendars, this.requestUpdate();
      }}>
                                        ${this._showAllCalendars ? y(this.hass, "editor_show_less") : y(this.hass, "editor_show_more")}
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
    }, L(this, "config-changed", { config: this._config });
  }
  _calendarShowAllChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      upcoming_events: t
    }, L(this, "config-changed", { config: this._config });
  }
  _compactModeChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      unfold_events: t
    }, L(this, "config-changed", { config: this._config });
  }
  _calendarDividerChanged(e) {
    const t = e.target.checked;
    this._config = {
      ...this._config,
      show_divider: t
    }, L(this, "config-changed", { config: this._config });
  }
  _toggleBooleanConfig(e, t) {
    const i = e.target.checked;
    this._config = {
      ...this._config,
      [t]: i
    }, L(this, "config-changed", { config: this._config });
  }
  _valueChanged(e) {
    var o;
    if (!this._config || !this.hass)
      return;
    const i = e.target.configValue;
    if (!i)
      return;
    const a = (o = e.detail) == null ? void 0 : o.value;
    if (this._config[i] === a)
      return;
    const s = { ...this._config };
    a == null || a === "" ? delete s[i] : s[i] = a, this._config = s, L(this, "config-changed", { config: this._config });
  }
  _calendarColorChanged(e, t) {
    const i = e.detail.value, a = { ...this._config.calendar_colors || {} };
    if (i == null || i === "" ? delete a[t] : a[t] = i, Object.keys(a).length === 0) {
      const s = { ...this._config };
      delete s.calendar_colors, this._config = s;
    } else
      this._config = {
        ...this._config,
        calendar_colors: a
      };
    L(this, "config-changed", { config: this._config });
  }
  _calendarBackgroundColorChanged(e, t) {
    const i = e.detail.value, a = { ...this._config.calendar_background_colors || {} };
    if (i == null || i === "" ? delete a[t] : a[t] = i, Object.keys(a).length === 0) {
      const s = { ...this._config };
      delete s.calendar_background_colors, this._config = s;
    } else
      this._config = {
        ...this._config,
        calendar_background_colors: a
      };
    L(this, "config-changed", { config: this._config });
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
  _renderDynamicIcon(e, t, i = !1) {
    var _, u, h;
    const a = ((u = (_ = this.hass) == null ? void 0 : _.locale) == null ? void 0 : u.language) || ((h = this.hass) == null ? void 0 : h.language) || navigator.language || "en", s = e.toLocaleDateString(a, { month: "short" }).toUpperCase(), o = e.getDate();
    return m`
            <svg viewBox="0 0 100 100" class="dynamic-calendar-icon" style="width: 100%; height: 100%; display: block;">
                <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="${i ? "#222222" : "white"}"></rect>
                <path d="M0 20 C0 8 8 0 20 0 L80 0 C92 0 100 8 100 20 L100 30 L0 30 Z" fill="${t}"></path>
                <text x="50" y="23" font-family="sans-serif" font-size="22" font-weight="bold" fill="${i ? "#222222" : "white"}" text-anchor="middle">${s}</text>
                <text x="50" y="82" font-family="sans-serif" font-size="52" font-weight="bold" fill="${i ? "white" : "#333"}" text-anchor="middle">${o}</text>
            </svg>
        `;
  }
};
ve([
  M({ attribute: !1 })
], Q.prototype, "hass", 2);
ve([
  de()
], Q.prototype, "_config", 2);
ve([
  de()
], Q.prototype, "_showAllCalendars", 2);
Q = ve([
  Te("calendar-card-plus-editor")
], Q);
const Bt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get CalendarCardPlusEditor() {
    return Q;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  oe as CalendarCardPlus
};
