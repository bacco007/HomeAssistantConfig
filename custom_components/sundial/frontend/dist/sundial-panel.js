/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, ce = J.ShadowRoot && (J.ShadyCSS === void 0 || J.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, de = Symbol(), fe = /* @__PURE__ */ new WeakMap();
let Ne = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== de) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (ce && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = fe.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && fe.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ke = (t) => new Ne(typeof t == "string" ? t : t + "", void 0, de), T = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, n, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + t[r + 1], t[0]);
  return new Ne(i, t, de);
}, Ze = (t, e) => {
  if (ce) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), n = J.litNonce;
    n !== void 0 && s.setAttribute("nonce", n), s.textContent = i.cssText, t.appendChild(s);
  }
}, ve = ce ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return Ke(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ge, defineProperty: We, getOwnPropertyDescriptor: Je, getOwnPropertyNames: Xe, getOwnPropertySymbols: Ye, getPrototypeOf: Qe } = Object, ie = globalThis, _e = ie.trustedTypes, et = _e ? _e.emptyScript : "", tt = ie.reactiveElementPolyfillSupport, U = (t, e) => t, X = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? et : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, he = (t, e) => !Ge(t, e), be = { attribute: !0, type: String, converter: X, reflect: !1, useDefault: !1, hasChanged: he };
Symbol.metadata ??= Symbol("metadata"), ie.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let R = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = be) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), n = this.getPropertyDescriptor(e, s, i);
      n !== void 0 && We(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: n, set: r } = Je(this.prototype, e) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: n, set(o) {
      const c = n?.call(this);
      r?.call(this, o), this.requestUpdate(e, c, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? be;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const e = Qe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const i = this.properties, s = [...Xe(i), ...Ye(i)];
      for (const n of s) this.createProperty(n, i[n]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [s, n] of i) this.elementProperties.set(s, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const n = this._$Eu(i, s);
      n !== void 0 && this._$Eh.set(n, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const n of s) i.unshift(ve(n));
    } else e !== void 0 && i.push(ve(e));
    return i;
  }
  static _$Eu(e, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ze(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, i, s) {
    this._$AK(e, s);
  }
  _$ET(e, i) {
    const s = this.constructor.elementProperties.get(e), n = this.constructor._$Eu(e, s);
    if (n !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : X).toAttribute(i, s.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, i) {
    const s = this.constructor, n = s._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = s.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : X;
      this._$Em = n;
      const c = o.fromAttribute(i, r.type);
      this[n] = c ?? this._$Ej?.get(n) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, n = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[e]), s ??= o.getPropertyOptions(e), !((s.hasChanged ?? he)(r, i) || s.useDefault && s.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, s)))) return;
      this.C(e, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: s, reflect: n, wrapped: r }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? i ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (i = void 0), this._$AL.set(e, i)), n === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [n, r] of s) {
        const { wrapped: o } = r, c = this[n];
        o !== !0 || this._$AL.has(n) || c === void 0 || this.C(n, void 0, r, c);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
R.elementStyles = [], R.shadowRootOptions = { mode: "open" }, R[U("elementProperties")] = /* @__PURE__ */ new Map(), R[U("finalized")] = /* @__PURE__ */ new Map(), tt?.({ ReactiveElement: R }), (ie.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pe = globalThis, $e = (t) => t, Y = pe.trustedTypes, xe = Y ? Y.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, De = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, je = "?" + S, it = `<${je}>`, P = document, V = () => P.createComment(""), F = (t) => t === null || typeof t != "object" && typeof t != "function", ue = Array.isArray, st = (t) => ue(t) || typeof t?.[Symbol.iterator] == "function", re = `[ 	
\f\r]`, j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, we = /-->/g, ye = />/g, C = RegExp(`>|${re}(?:([^\\s"'>=/]+)(${re}*=${re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ae = /'/g, Se = /"/g, Ie = /^(?:script|style|textarea|title)$/i, nt = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), a = nt(1), O = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), ke = /* @__PURE__ */ new WeakMap(), L = P.createTreeWalker(P, 129);
function Ue(t, e) {
  if (!ue(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return xe !== void 0 ? xe.createHTML(e) : e;
}
const rt = (t, e) => {
  const i = t.length - 1, s = [];
  let n, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = j;
  for (let c = 0; c < i; c++) {
    const l = t[c];
    let p, u, h = -1, m = 0;
    for (; m < l.length && (o.lastIndex = m, u = o.exec(l), u !== null); ) m = o.lastIndex, o === j ? u[1] === "!--" ? o = we : u[1] !== void 0 ? o = ye : u[2] !== void 0 ? (Ie.test(u[2]) && (n = RegExp("</" + u[2], "g")), o = C) : u[3] !== void 0 && (o = C) : o === C ? u[0] === ">" ? (o = n ?? j, h = -1) : u[1] === void 0 ? h = -2 : (h = o.lastIndex - u[2].length, p = u[1], o = u[3] === void 0 ? C : u[3] === '"' ? Se : Ae) : o === Se || o === Ae ? o = C : o === we || o === ye ? o = j : (o = C, n = void 0);
    const A = o === C && t[c + 1].startsWith("/>") ? " " : "";
    r += o === j ? l + it : h >= 0 ? (s.push(p), l.slice(0, h) + De + l.slice(h) + S + A) : l + S + (h === -2 ? c : A);
  }
  return [Ue(t, r + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class q {
  constructor({ strings: e, _$litType$: i }, s) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const c = e.length - 1, l = this.parts, [p, u] = rt(e, i);
    if (this.el = q.createElement(p, s), L.currentNode = this.el.content, i === 2 || i === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = L.nextNode()) !== null && l.length < c; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const h of n.getAttributeNames()) if (h.endsWith(De)) {
          const m = u[o++], A = n.getAttribute(h).split(S), G = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: r, name: G[2], strings: A, ctor: G[1] === "." ? at : G[1] === "?" ? lt : G[1] === "@" ? ct : se }), n.removeAttribute(h);
        } else h.startsWith(S) && (l.push({ type: 6, index: r }), n.removeAttribute(h));
        if (Ie.test(n.tagName)) {
          const h = n.textContent.split(S), m = h.length - 1;
          if (m > 0) {
            n.textContent = Y ? Y.emptyScript : "";
            for (let A = 0; A < m; A++) n.append(h[A], V()), L.nextNode(), l.push({ type: 2, index: ++r });
            n.append(h[m], V());
          }
        }
      } else if (n.nodeType === 8) if (n.data === je) l.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = n.data.indexOf(S, h + 1)) !== -1; ) l.push({ type: 7, index: r }), h += S.length - 1;
      }
      r++;
    }
  }
  static createElement(e, i) {
    const s = P.createElement("template");
    return s.innerHTML = e, s;
  }
}
function z(t, e, i = t, s) {
  if (e === O) return e;
  let n = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const r = F(e) ? void 0 : e._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(t), n._$AT(t, i, s)), s !== void 0 ? (i._$Co ??= [])[s] = n : i._$Cl = n), n !== void 0 && (e = z(t, n._$AS(t, e.values), n, s)), e;
}
class ot {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: s } = this._$AD, n = (e?.creationScope ?? P).importNode(i, !0);
    L.currentNode = n;
    let r = L.nextNode(), o = 0, c = 0, l = s[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let p;
        l.type === 2 ? p = new K(r, r.nextSibling, this, e) : l.type === 1 ? p = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (p = new dt(r, this, e)), this._$AV.push(p), l = s[++c];
      }
      o !== l?.index && (r = L.nextNode(), o++);
    }
    return L.currentNode = P, n;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class K {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, i, s, n) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = n, this._$Cv = n?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && e?.nodeType === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = z(this, e, i), F(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== O && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : st(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && F(this._$AH) ? this._$AA.nextSibling.data = e : this.T(P.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: i, _$litType$: s } = e, n = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = q.createElement(Ue(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === n) this._$AH.p(i);
    else {
      const r = new ot(n, this), o = r.u(this.options);
      r.p(i), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let i = ke.get(e.strings);
    return i === void 0 && ke.set(e.strings, i = new q(e)), i;
  }
  k(e) {
    ue(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, n = 0;
    for (const r of e) n === i.length ? i.push(s = new K(this.O(V()), this.O(V()), this, this.options)) : s = i[n], s._$AI(r), n++;
    n < i.length && (this._$AR(s && s._$AB.nextSibling, n), i.length = n);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); e !== this._$AB; ) {
      const s = $e(e).nextSibling;
      $e(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class se {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, n, r) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = i, this._$AM = n, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(e, i = this, s, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = z(this, e, i, 0), o = !F(e) || e !== this._$AH && e !== O, o && (this._$AH = e);
    else {
      const c = e;
      let l, p;
      for (e = r[0], l = 0; l < r.length - 1; l++) p = z(this, c[s + l], i, l), p === O && (p = this._$AH[l]), o ||= !F(p) || p !== this._$AH[l], p === d ? e = d : e !== d && (e += (p ?? "") + r[l + 1]), this._$AH[l] = p;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class at extends se {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class lt extends se {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class ct extends se {
  constructor(e, i, s, n, r) {
    super(e, i, s, n, r), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = z(this, e, i, 0) ?? d) === O) return;
    const s = this._$AH, n = e === d && s !== d || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, r = e !== d && (s === d || n);
    n && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class dt {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    z(this, e);
  }
}
const ht = pe.litHtmlPolyfillSupport;
ht?.(q, K), (pe.litHtmlVersions ??= []).push("3.3.3");
const pt = (t, e, i) => {
  const s = i?.renderBefore ?? e;
  let n = s._$litPart$;
  if (n === void 0) {
    const r = i?.renderBefore ?? null;
    s._$litPart$ = n = new K(e.insertBefore(V(), r), r, void 0, i ?? {});
  }
  return n._$AI(t), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ge = globalThis;
class _ extends R {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = pt(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return O;
  }
}
_._$litElement$ = !0, _.finalized = !0, ge.litElementHydrateSupport?.({ LitElement: _ });
const ut = ge.litElementPolyfillSupport;
ut?.({ LitElement: _ });
(ge.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const gt = { attribute: !0, type: String, converter: X, reflect: !1, hasChanged: he }, mt = (t = gt, e, i) => {
  const { kind: s, metadata: n } = i;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(i.name, t), s === "accessor") {
    const { name: o } = i;
    return { set(c) {
      const l = e.get.call(this);
      e.set.call(this, c), this.requestUpdate(o, l, t, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(o, void 0, t, c), c;
    } };
  }
  if (s === "setter") {
    const { name: o } = i;
    return function(c) {
      const l = this[o];
      e.call(this, c), this.requestUpdate(o, l, t, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function g(t) {
  return (e, i) => typeof i == "object" ? mt(t, e, i) : ((s, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, s), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(t, e, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function w(t) {
  return g({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ft = (t, e, i) => (i.configurable = !0, i.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, i), i);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function vt(t, e) {
  return (i, s, n) => {
    const r = (o) => o.renderRoot?.querySelector(t) ?? null;
    return ft(i, s, { get() {
      return r(this);
    } });
  };
}
class _t {
  constructor(e) {
    this.hass = e;
  }
  setHass(e) {
    this.hass = e;
  }
  getConfig() {
    return this.send("sundial/get_config");
  }
  updateSettings(e) {
    return this.send("sundial/update_settings", { settings: e });
  }
  saveSchema(e) {
    return this.send("sundial/save_schema", { schema: e });
  }
  deleteSchema(e) {
    return this.send("sundial/delete_schema", { schema_id: e });
  }
  setActiveSchema(e) {
    return this.send("sundial/set_active_schema", { schema_id: e });
  }
  // Pass the (possibly unsaved) draft schema so the timeline/preview reflect
  // edits live, without persisting on every change.
  timeline(e) {
    return this.send("sundial/timeline", { schema: e });
  }
  preview(e, i, s) {
    return this.send("sundial/preview", { schema: e, hour: i, apply: s });
  }
  apply(e) {
    return this.send("sundial/apply", e ? { entity_id: e } : {});
  }
  // Full-configuration backup: the raw store document (all schemas + settings).
  exportConfig() {
    return this.send("sundial/export");
  }
  importConfig(e) {
    return this.send("sundial/import", { data: e });
  }
  send(e, i = {}) {
    return this.hass.connection.sendMessagePromise({ type: e, ...i });
  }
}
const bt = T`
  :host {
    --bg: #fbf3e9;
    --surface: #fffaf2;
    --surface-alt: #f9f0e4;
    --border: #dec4a1;
    --text: #3d2c1e;
    --text-soft: #836a52;
    --accent: #c8743a;
    --accent-strong: #a8521f;
    --accent-soft: #f0dcc3;
    --danger: #9c3b2e;
    --radius: 12px;
    --shadow: 0 2px 10px rgba(120, 80, 40, 0.12);

    display: block;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    /* Home Assistant's own typography (Roboto), themable via its token. */
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
  }
`, Z = T`
  * {
    box-sizing: border-box;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 18px;
    margin-bottom: 16px;
  }

  .grow {
    flex: 1;
    min-width: 0;
  }

  .muted {
    color: var(--text-soft);
    font-size: 0.85rem;
  }

  /* Sub-heading shown directly under an editor's title (e.g. a light's area). */
  .subtitle {
    margin: -6px 0 10px;
    color: var(--text-soft);
    font-size: 0.82rem;
  }

  /* Inline caution note inside an editor. */
  .warn {
    margin: 10px 0 0;
    padding: 8px 10px;
    font-size: 0.8rem;
    line-height: 1.35;
    color: var(--danger);
    background: var(--accent-soft);
    border-left: 3px solid var(--danger);
    border-radius: 6px;
  }

  label.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
  }

  div.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
  }

  /* iOS-style single-line field: label left, control right. */
  label.field.inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  label.field.inline select {
    width: auto;
    flex: 0 1 auto;
  }

  /* Small uppercase section heading; as a <details> it reveals its info text.
     Darker than the field labels so the hierarchy reads: tight to its fields,
     generous space above. */
  .section {
    margin: 28px 0 6px;
    color: var(--text);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .section:first-child {
    margin-top: 0;
  }
  details.section summary {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    list-style: none;
  }
  details.section summary::-webkit-details-marker {
    display: none;
  }
  details.section summary svg {
    width: 14px;
    height: 14px;
    flex: none;
    opacity: 0.6;
  }
  details.section[open] summary svg {
    opacity: 1;
    color: var(--accent-strong);
  }
  details.section p {
    margin: 8px 0 0;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
    line-height: 1.4;
  }

  /* Two-part values (e.g. sunrise + sunset) on one row. minmax(0, 1fr) so
     wide intrinsic inputs (type=time) can't stretch their column. */
  .pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .pair + .pair {
    margin-top: 14px;
  }
  .pair > button.btn {
    width: 100%;
  }

  /* Indication strip above a slider (e.g. the Kelvin spectrum). */
  .temp-gradient {
    height: 8px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  /* Parsed value shown underneath duration sliders. */
  .duration-preview {
    margin-top: -4px;
    text-align: right;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--accent-strong);
    font-variant-numeric: tabular-nums;
  }

  /* Dual-thumb min–max slider: two overlapped native ranges, thumbs only. */
  .minmax {
    position: relative;
    height: 24px;
  }
  .minmax-track {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 4px;
    transform: translateY(-50%);
    border-radius: 2px;
    background: var(--accent-soft);
  }
  .minmax-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 2px;
    background: var(--accent);
  }
  .minmax input[type="range"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 24px;
    margin: 0;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    pointer-events: none;
  }
  .minmax input[type="range"]::-webkit-slider-runnable-track {
    background: transparent;
    border: none;
  }
  .minmax input[type="range"]::-moz-range-track {
    background: transparent;
    border: none;
  }
  .minmax input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 18px;
    height: 18px;
    /* 18px + 2×2px border = 22px outer on a 24px-high input. */
    margin-top: 1px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
    box-shadow: 0 1px 3px rgba(120, 80, 40, 0.4);
    cursor: pointer;
  }
  .minmax input[type="range"]::-moz-range-thumb {
    pointer-events: auto;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
    cursor: pointer;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 14px;
  }

  @media (max-width: 960px) {
    /* More breathing room in the drawer forms. */
    .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    .section {
      margin: 34px 0 8px;
    }
    /* Flatten cards on mobile so they don't add a second horizontal padding
       inside the panel's own padding. */
    .card {
      padding-left: 0;
      padding-right: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
      background: transparent;
    }
  }

  input[type="text"],
  input[type="number"],
  input[type="time"],
  select {
    font: inherit;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--accent);
    border-color: var(--accent);
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
    padding: 0;
    border: none;
    background: transparent;
  }

  .field-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }

  .field-head b {
    color: var(--accent-strong);
    font-variant-numeric: tabular-nums;
  }

  /* iOS-style row: label on the left, switch pinned to the right edge. */
  .toggle {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
    cursor: pointer;
  }

  /* Custom switch in the panel's palette instead of the system checkbox. */
  .toggle input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    flex: none;
    width: 40px;
    height: 24px;
    margin: 0;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--accent-soft);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
  }
  .toggle input[type="checkbox"]::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: 0 1px 3px rgba(120, 80, 40, 0.4);
    transition: transform 150ms ease;
  }
  .toggle input[type="checkbox"]:checked {
    background: var(--accent);
    border-color: var(--accent);
  }
  .toggle input[type="checkbox"]:checked::before {
    transform: translateX(16px);
  }
  .toggle input[type="checkbox"]:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  button.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    padding: 8px 14px;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: #fff8ef;
  }

  button.btn svg {
    width: 16px;
    height: 16px;
    flex: none;
  }

  button.btn.ghost {
    background: transparent;
    color: var(--accent-strong);
  }

  /* Danger differs by content colour only — the border stays like its
     neighbours' so the button doesn't shout while idle. */
  button.btn.danger {
    background: transparent;
    color: var(--danger);
  }

  /* Compact variant for secondary corrective actions. */
  button.btn.small {
    padding: 4px 10px;
    font-size: 0.78rem;
  }

  /* Borderless variant for controls that aren't schema actions (settings). */
  button.btn.plain {
    border-color: transparent;
    background: transparent;
    color: var(--accent-strong);
    padding-left: 10px;
    padding-right: 10px;
  }

  button.btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .actions:not(:last-child) {
    margin-bottom: 14px;
  }

  .empty {
    text-align: center;
    color: var(--text-soft);
    padding: 28px;
  }
`, oe = Array.from({ length: 24 }, (t, e) => e), E = 1500, M = 6500;
function $t() {
  return {
    min_brightness: 5,
    max_brightness: 100,
    min_color_temp: 2e3,
    max_color_temp: 5500,
    ramp_dark: 5e3,
    ramp_light: 9e3,
    sunrise_time: null,
    sunset_time: null,
    sunrise_offset: 5e3,
    sunset_offset: -5e3,
    min_sunrise_time: null,
    max_sunrise_time: null,
    min_sunset_time: null,
    max_sunset_time: null
  };
}
function xt() {
  return {
    min_brightness: 1,
    max_brightness: 100,
    min_color_temp: 2e3,
    max_color_temp: 5500,
    separate_turn_on_commands: !1,
    limit_mode: "cap",
    render_mode: "auto",
    hours: Array.from({ length: 24 }, () => null)
  };
}
function wt(t, e) {
  return { id: t, name: e, sun: $t(), lights: {} };
}
function me(t) {
  const e = Math.max(1e3, Math.min(12e3, t)) / 100;
  let i, s, n;
  e <= 66 ? (i = 255, s = 99.47 * Math.log(e) - 161.12) : (i = 329.7 * Math.pow(e - 60, -0.1332), s = 288.12 * Math.pow(e - 60, -0.0755)), e >= 66 ? n = 255 : e <= 19 ? n = 0 : n = 138.52 * Math.log(e - 10) - 305.04;
  const r = (o) => Math.max(0, Math.min(255, Math.round(o)));
  return `rgb(${r(i)}, ${r(s)}, ${r(n)})`;
}
function ae(t, e) {
  const s = [];
  for (let n = 0; n <= 10; n++)
    s.push(me(t + (e - t) * n / 10));
  return `linear-gradient(90deg, ${s.join(", ")})`;
}
function yt(t) {
  const e = t < 0 ? "−" : "", i = Math.round(Math.abs(t) / 60), s = Math.floor(i / 60), n = i % 60;
  return s === 0 ? `${e}${n} min` : n === 0 ? `${e}${s} h` : `${e}${s} h ${n} min`;
}
function At(t) {
  return String(t).padStart(2, "0");
}
function St(t) {
  return "#" + t.map((e) => Math.max(0, Math.min(255, Math.round(e))).toString(16).padStart(2, "0")).join("");
}
function kt(t) {
  const e = t.replace("#", "");
  return [
    parseInt(e.slice(0, 2), 16) || 0,
    parseInt(e.slice(2, 4), 16) || 0,
    parseInt(e.slice(4, 6), 16) || 0
  ];
}
function le() {
  const t = /* @__PURE__ */ new Date(), e = t.getHours() * 60 + t.getMinutes();
  return Math.min(1435, Math.round(e / 5) * 5) / 60;
}
const y = (t) => a`<svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d=${t} />
  </svg>`, Ce = y("M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"), Ee = y(
  "M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z"
), Me = y(
  "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
), Le = y(
  "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
), Ct = y(
  "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21M12,4A5,5 0 0,1 17,9C17,10.82 15.98,12.41 14.5,13.28L14,13.58V16H10V13.58L9.5,13.28C8.02,12.41 7,10.82 7,9A5,5 0 0,1 12,4Z"
), Et = y(
  "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
), Mt = y(
  "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
), Pe = y(
  "M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a7 7 0 0 0-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.31 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96a7 7 0 0 0 1.62.94l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54a7 7 0 0 0 1.62-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
), Te = y(
  "M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z"
);
function f(t, e) {
  return e ? a`<details class="section">
    <summary>${t} ${Mt}</summary>
    <p class="muted">${e}</p>
  </details>` : a`<div class="section">${t}</div>`;
}
function Be(t, e, i, s, n) {
  const r = Math.max(0, Math.min(100, (t - e) / (i - e) * 100));
  return a`<div class="minmax">
    <div class="minmax-track">
      <div class="minmax-fill" style="left:0;width:${r}%"></div>
    </div>
    <input
      type="range"
      min=${e}
      max=${i}
      step=${s}
      .value=${String(t)}
      @input=${(o) => n(Number(o.target.value))}
    />
  </div>`;
}
function Q(t, e, i, s, n, r, o, c, l) {
  const p = (u) => (u - n) / (r - n) * 100;
  return a`<div class="field">
    <span class="field-head">
      <span>${t}</span>
      <b>${i}–${s}${e}</b>
    </span>
    ${l ? a`<div class="temp-gradient" style="background:${l}"></div>` : d}
    <div class="minmax">
      <div class="minmax-track">
        <div
          class="minmax-fill"
          style="left:${p(i)}%;width:${Math.max(0, p(s) - p(i))}%"
        ></div>
      </div>
      <input
        type="range"
        min=${n}
        max=${r}
        step=${o}
        .value=${String(i)}
        @input=${(u) => {
    const h = u.target, m = Math.min(Number(h.value), s);
    h.value = String(m), c(m, s);
  }}
      />
      <input
        type="range"
        min=${n}
        max=${r}
        step=${o}
        .value=${String(s)}
        @input=${(u) => {
    const h = u.target, m = Math.max(Number(h.value), i);
    h.value = String(m), c(i, m);
  }}
      />
    </div>
  </div>`;
}
function I(t, e, i, s, n, r) {
  const o = e === 0 && r ? r : yt(e);
  return a`<label class="field">
    ${t}
    ${Be(e, i, s, 60, n)}
    <span class="duration-preview">${o}</span>
  </label>`;
}
function Lt(t, e, i) {
  return a`<label class="field"
    >${t}
    <input
      type="number"
      .value=${String(e)}
      @change=${(s) => i(Number(s.target.value))}
    />
  </label>`;
}
function He(t, e, i, s) {
  return a`<label class="field"
    >${t}
    <input
      type="number"
      step="any"
      placeholder=${i}
      .value=${e != null ? String(e) : ""}
      @change=${(n) => {
    const r = n.target.value.trim(), o = Number(r);
    s(r === "" || !Number.isFinite(o) ? null : o);
  }}
    />
  </label>`;
}
function B(t, e, i, s, n, r, o, c) {
  return a`<label class="field">
    <span class="field-head">
      <span>${t}</span>
      <b>${e}${r}</b>
    </span>
    ${c ? a`<div class="temp-gradient" style="background:${c}"></div>` : d}
    ${Be(e, i, s, n, o)}
  </label>`;
}
function Re(t, e, i) {
  return a`<label class="field"
    >${t}
    <input
      type="time"
      step="1"
      .value=${e ?? ""}
      @change=${(s) => i(s.target.value || null)}
    />
  </label>`;
}
function Ve(t, e, i) {
  return a`<label class="toggle">
    <input
      type="checkbox"
      .checked=${e}
      @change=${(s) => i(s.target.checked)}
    />
    ${t}
  </label>`;
}
function Oe(t, e, i, s) {
  return a`<label class="field inline"
    >${t}
    <select
      @change=${(n) => s(n.target.value)}
    >
      ${i.map(
    (n) => a`<option value=${n.value} ?selected=${n.value === e}>
            ${n.label}
          </option>`
  )}
    </select>
  </label>`;
}
var Pt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, k = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Tt(e, i) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (s ? o(e, i, n) : o(n)) || n);
  return s && n && Pt(e, i, n), n;
};
let b = class extends _ {
  constructor() {
    super(...arguments), this.lights = [], this.selected = null, this.selectedRow = null, this.previewHour = 12, this.scrollLocked = !1, this.previewActive = !1;
  }
  render() {
    if (!this.timeline)
      return a`<div class="card"><div class="empty">Loading timeline…</div></div>`;
    const t = Math.floor(this.previewHour) % 24;
    return a`<div class="card">
      ${this.previewActive ? this._scrubBar() : d}
      <div class="scroll ${this.scrollLocked ? "locked" : ""}">
        <div class="rows">
          ${this._scrubRow()}
          ${this._headerRow(t)}
          ${this._sunRow()}
          ${this._lightGroups().map(
      (e) => a`
              <div class="gridrow section-row">
                <div class="label section-label">${e.area}</div>
              </div>
              ${e.lights.map((i) => this._lightRow(i))}
            `
    )}
        </div>
        <div class="legend">
          <span class="legend-item"><span class="legend-dot overridden"></span>Overridden</span>
          <span class="legend-item"><span class="legend-dot selected"></span>Selected</span>
        </div>
      </div>
    </div>`;
  }
  get _clockLabel() {
    const t = Math.floor(this.previewHour), e = Math.round((this.previewHour - t) * 60);
    return `${String(t).padStart(2, "0")}:${String(e).padStart(2, "0")}`;
  }
  // Both scrubbers work in minutes with 5-minute steps.
  get _minutes() {
    return Math.round(this.previewHour * 60 / 5) * 5;
  }
  _slider() {
    return a`<input
      type="range"
      min="0"
      max="1435"
      step="5"
      .value=${String(this._minutes)}
      @input=${(t) => this._emit("scrub", Number(t.target.value) / 60)}
    />`;
  }
  // Desktop: part of the grid, so the track lines up with the hour columns.
  _scrubRow() {
    return a`<div class="gridrow scrubrow">
      <div class="label">
        <span class="clock">${this._clockLabel}</span>
        <button class="now-btn" @click=${this._jumpToNow} title="Jump to now">now</button>
      </div>
      <div class="track">${this._slider()}</div>
    </div>`;
  }
  // Mobile-only, shown while previewing: a full-width custom slider in the
  // min–max component's styling — whole hours, no readout (the playhead in
  // the charts shows the position).
  _scrubBar() {
    const t = this._minutes;
    return a`<div class="scrub-bar">
      <div class="minmax">
        <div class="minmax-track">
          <div
            class="minmax-fill"
            style="left:0;width:${t / 1435 * 100}%"
          ></div>
        </div>
        <input
          type="range"
          min="0"
          max="1435"
          step="5"
          .value=${String(t)}
          @input=${(e) => this._emit("scrub", Number(e.target.value) / 60)}
        />
      </div>
    </div>`;
  }
  _jumpToNow() {
    this._emit("scrub", le());
  }
  _headerRow(t) {
    return a`<div class="gridrow headrow">
      <div class="label"></div>
      <div class="hours">
        ${oe.map(
      (e) => a`<div class="hourhead ${e === t ? "now" : ""}">
            ${At(e)}
          </div>`
    )}
      </div>
    </div>`;
  }
  /** Row-level playhead line at the currently shown time. */
  _playhead() {
    const t = this.previewHour % 24 / 24 * 100;
    return a`<div class="playhead" style="left:${t}%"></div>`;
  }
  _sunRow() {
    const t = this.timeline.sun, e = this.selectedRow === "sun" ? "rowselected" : "";
    return a`<div class="gridrow sunrow ${e}">
      <div
        class="label clickable"
        title="Edit the sun"
        @click=${() => this._emit("select-sun", null)}
      >
        <span class="text-col">
          <span class="lname">☀️ Sun</span>
        </span>
        ${Pe}
      </div>
      <div class="cells">
        ${oe.map((i) => this._cell(t[i], "readonly", !1, !1))}
        ${this._playhead()}
      </div>
    </div>`;
  }
  // Consecutive lights that share an area render under one area heading (the
  // backend sorts by area already); unassigned lights group under "Other".
  _lightGroups() {
    const t = [];
    for (const e of this.lights) {
      const i = e.area_name ?? "Other", s = t[t.length - 1];
      s && s.area === i ? s.lights.push(e) : t.push({ area: i, lights: [e] });
    }
    return t.length === 1 && t[0].area === "Other" && (t[0].area = "Lights"), t;
  }
  _lightRow(t) {
    const e = this.timeline.lights[t.entity_id] ?? [], i = this.selectedRow === t.entity_id ? "rowselected" : "";
    return a`<div class="gridrow lightrow ${i}">
      <div
        class="label clickable"
        title="Edit light range"
        @click=${() => this._emit("select-light", t.entity_id)}
      >
        <span class="text-col">
          <span class="lname">${t.name}</span>
        </span>
        ${Pe}
      </div>
      <div class="cells">
        ${oe.map((s) => {
      const n = e[s], r = this.selected?.entityId === t.entity_id && this.selected?.hour === s;
      return this._cell(
        n,
        "",
        !!n?.explicit,
        r,
        () => this._emit("select-cell", { entityId: t.entity_id, hour: s })
      );
    })}
        ${this._playhead()}
      </div>
    </div>`;
  }
  _cell(t, e, i, s, n) {
    const r = t ? t.brightness : 0, o = t && "rgb_color" in t ? t.rgb_color : null, c = t ? o ? `rgb(${o[0]}, ${o[1]}, ${o[2]})` : me(t.color_temp) : "transparent", l = [
      "cell",
      e,
      i ? "explicit" : "",
      s ? "selected" : ""
    ].join(" ");
    return a`<div
      class=${l}
      @click=${n}
      title=${t ? `${t.brightness}% · ${t.color_temp} K` : ""}
    >
      <div class="fill" style="height:${r}%;background:${c}"></div>
    </div>`;
  }
  _emit(t, e) {
    this.dispatchEvent(
      new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 })
    );
  }
};
b.styles = [
  Z,
  T`
      :host {
        display: block;
        height: 100%;
      }
      .card {
        box-sizing: border-box;
      }
      .scroll {
        max-width: 100%;
        padding-bottom: 6px;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .gridrow {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 1px;
        align-items: center;
      }
      /* Air between charts of the same room (desktop stacks them tightly). */
      @media (min-width: 961px) {
        .lightrow + .lightrow {
          margin-top: 6px;
        }
      }
      /* The 24 cells of one row, with row-level overlays (max line, playhead). */
      .cells {
        position: relative;
        display: grid;
        grid-template-columns: repeat(24, 1fr);
        gap: 1px;
      }
      /* Continuous dim reference lines at the 100% mark (top) and baseline
         (bottom). Fills paint above them so even 1px values stay visible. */
      .cells::before,
      .cells::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--border);
        opacity: 0.5;
        z-index: 2;
        pointer-events: none;
      }
      .cells::before {
        top: 0;
      }
      .cells::after {
        bottom: 0;
      }
      /* Thin light playhead at the currently shown time. */
      .cells .playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--accent);
        opacity: 0.55;
        z-index: 4;
        pointer-events: none;
      }
      .hours {
        display: grid;
        grid-template-columns: repeat(24, 1fr);
        gap: 1px;
      }
      .label {
        z-index: 3;
        align-self: stretch;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text);
        white-space: nowrap;
        overflow: hidden;
        padding-right: 4px;
      }
      .label .text-col {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .label .lname {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .label svg {
        width: 12px;
        height: 12px;
        flex: none;
        opacity: 0.4;
      }
      .label.clickable:hover svg {
        opacity: 0.9;
      }
      .label.clickable {
        cursor: pointer;
      }
      .sunrow .label {
        color: var(--accent-strong);
      }
      .gridrow.rowselected .label {
        color: var(--accent-strong);
      }
      /* Matches the form section headings (.section in baseStyles). */
      .label.section-label {
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text);
        padding-top: 8px;
      }
      .hourhead {
        font-size: 0.7rem;
        text-align: center;
        color: var(--text-soft);
      }
      .hourhead.now {
        color: var(--accent-strong);
        font-weight: 700;
      }
      .scrubrow .track {
        grid-column: 2 / -1;
        display: flex;
        align-items: center;
      }
      .scrubrow input[type="range"] {
        width: 100%;
      }
      .clock {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        color: var(--accent-strong);
      }
      .now-btn {
        background: none;
        border: none;
        padding: 0;
        margin-left: auto;
        font-size: 0.7rem;
        color: var(--text-soft);
        cursor: pointer;
        text-transform: lowercase;
      }
      .now-btn:hover {
        color: var(--accent-strong);
      }
      /* Sun-following cells have no background — that's the default state;
         only overrides get a marker. */
      .cell {
        position: relative;
        height: 42px;
        overflow: hidden;
        cursor: pointer;
      }
      @media (max-width: 960px) {
        .cell {
          height: 52px;
        }
      }
      .cell.readonly {
        cursor: default;
      }
      .cell .fill {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
      }
      .cell.explicit {
        background: var(--border);
      }
      .cell.selected {
        border: 2px var(--accent-strong) solid;
      }
      .legend {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 10px;
        font-size: 0.75rem;
        color: var(--text-soft);
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }
      .legend-dot.overridden {
        background: var(--border);
      }
      .legend-dot.selected {
        border: 2px var(--accent-strong) solid;
      }
      /* Preview-only scrub bar above the grid on small screens. */
      .scrub-bar {
        display: none;
      }
      @media (max-width: 960px) {
        :host {
          min-height: 0;
        }
        /* Fill the viewport to the very bottom; the grid fits the width (no
           horizontal scrolling) and scrolls internally only vertically. */
        .card {
          padding: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          margin-bottom: 0;
        }
        .scrub-bar {
          display: block;
          padding: 10px 14px 6px;
          flex: none;
        }
        .scrubrow {
          display: none;
        }
        .scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          /* The content scrolls clear of the iOS home indicator. */
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        }
        /* The scrollview is edge to edge (indicator at the screen edge);
           the content re-applies the gutter. */
        .rows {
          padding: 0 12px;
        }
        .scroll.locked {
          overflow: hidden;
          touch-action: none;
        }
        /* Stacked rows: the name spans the full width and the 24 cells sit
           underneath, edge to edge. minmax(0, 1fr) so the cells can shrink
           below the hour digits' width. */
        .gridrow {
          grid-template-columns: minmax(0, 1fr);
          margin-bottom: 6px;
        }
        .cells,
        .hours {
          grid-template-columns: repeat(24, minmax(0, 1fr));
        }
        .gridrow .label {
          font-size: 0.8rem;
          padding: 4px 0 2px;
          margin-bottom: 3px;
        }
        .gridrow .label.section-label {
          padding-top: 10px;
        }
        /* Keep the room heading tight to the first light under it. */
        .section-row {
          margin-bottom: 0;
        }
        .section-row .label {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .headrow .label {
          display: none;
        }
        .headrow {
          margin-bottom: 0;
          padding-bottom: 4px;
        }
        .hourhead {
          font-size: 0.55rem;
          overflow: hidden;
        }
        /* Above the rows' playheads (z-index 4) so scrolling content always
           passes underneath the hour numbers. */
        .headrow {
          position: sticky;
          top: 0;
          z-index: 6;
          background: var(--bg);
        }
        /* Scrolls with the content as its last item. */
        .legend {
          padding: 6px 12px 0;
        }
      }
    `
];
k([
  g({ attribute: !1 })
], b.prototype, "lights", 2);
k([
  g({ attribute: !1 })
], b.prototype, "timeline", 2);
k([
  g({ attribute: !1 })
], b.prototype, "selected", 2);
k([
  g({ attribute: !1 })
], b.prototype, "selectedRow", 2);
k([
  g({ type: Number })
], b.prototype, "previewHour", 2);
k([
  g({ type: Boolean })
], b.prototype, "scrollLocked", 2);
k([
  g({ type: Boolean })
], b.prototype, "previewActive", 2);
b = k([
  D("sundial-timeline-grid")
], b);
var Ht = Object.defineProperty, Rt = Object.getOwnPropertyDescriptor, Fe = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Rt(e, i) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (s ? o(e, i, n) : o(n)) || n);
  return s && n && Ht(e, i, n), n;
};
let ee = class extends _ {
  constructor() {
    super(...arguments), this.cells = [];
  }
  render() {
    return a`<div class="strip">
      ${this.cells.map((t) => {
      const e = t.rgb_color, i = e ? `rgb(${e[0]}, ${e[1]}, ${e[2]})` : me(t.color_temp);
      return a`<div class="cell ${t.explicit ? "explicit" : ""}">
          <div
            class="fill"
            style="height:${t.brightness}%;background:${i}"
          ></div>
        </div>`;
    })}
    </div>`;
  }
};
ee.styles = T`
    :host {
      display: block;
    }
    .strip {
      position: relative;
      display: grid;
      grid-template-columns: repeat(24, minmax(0, 1fr));
      gap: 1px;
      height: 42px;
      overflow: hidden;
    }
    /* Continuous dim reference lines, mirroring the timeline rows; fills
       paint above them so even 1px values stay visible. */
    .strip::before,
    .strip::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border);
      opacity: 0.5;
      z-index: 2;
      pointer-events: none;
    }
    .strip::before {
      top: 0;
    }
    .strip::after {
      bottom: 0;
    }
    .cell {
      position: relative;
      overflow: hidden;
    }
    .cell.explicit {
      background: var(--border);
    }
    .fill {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 3;
    }
  `;
Fe([
  g({ attribute: !1 })
], ee.prototype, "cells", 2);
ee = Fe([
  D("sundial-row-preview")
], ee);
var Ot = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, qe = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? zt(e, i) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (s ? o(e, i, n) : o(n)) || n);
  return s && n && Ot(e, i, n), n;
};
const W = 4 * 3600, ze = 4 * 3600;
let te = class extends _ {
  render() {
    const t = this.sun;
    return a`
      ${f(
      "Brightness",
      "The sun drives every light's fallback: empty timeline cells follow it, scaled into each light's own range."
    )}
      ${Q(
      "Range",
      "%",
      t.min_brightness,
      t.max_brightness,
      0,
      100,
      1,
      (e, i) => this._patch({ min_brightness: e, max_brightness: i })
    )}
      ${t.min_brightness <= 0 ? a`<p class="warn">
            At 0% lights following the sun can turn off at night, and Sundial
            won't turn them back on automatically.
          </p>` : d}
      ${f("Color temperature")}
      ${Q(
      "Range",
      " K",
      t.min_color_temp,
      t.max_color_temp,
      E,
      M,
      50,
      (e, i) => this._patch({ min_color_temp: e, max_color_temp: i }),
      ae(E, M)
    )}
      ${f(
      "Sunrise & sunset",
      "Fixed times override the location-based calculation; offsets shift the calculated moment."
    )}
      <div class="pair">
        ${Re(
      "Fixed sunrise",
      t.sunrise_time,
      (e) => this._patch({ sunrise_time: e })
    )}
        ${Re(
      "Fixed sunset",
      t.sunset_time,
      (e) => this._patch({ sunset_time: e })
    )}
      </div>
      <div class="pair">
        ${I(
      "Sunrise offset",
      t.sunrise_offset,
      Math.min(-W, t.sunrise_offset),
      Math.max(W, t.sunrise_offset),
      (e) => this._patch({ sunrise_offset: e })
    )}
        ${I(
      "Sunset offset",
      t.sunset_offset,
      Math.min(-W, t.sunset_offset),
      Math.max(W, t.sunset_offset),
      (e) => this._patch({ sunset_offset: e })
    )}
      </div>
      ${f(
      "Ramp",
      "Width of the smooth brightness ramp around sunrise and sunset: the dark side eases in from night, the light side out into full day."
    )}
      <div class="pair">
        ${I(
      "Dark side",
      t.ramp_dark,
      0,
      Math.max(ze, t.ramp_dark),
      (e) => this._patch({ ramp_dark: e })
    )}
        ${I(
      "Light side",
      t.ramp_light,
      0,
      Math.max(ze, t.ramp_light),
      (e) => this._patch({ ramp_light: e })
    )}
      </div>
    `;
  }
  _patch(t) {
    this.dispatchEvent(
      new CustomEvent("sun-changed", {
        detail: { ...this.sun, ...t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
te.styles = Z;
qe([
  g({ attribute: !1 })
], te.prototype, "sun", 2);
te = qe([
  D("sundial-sun-config")
], te);
var Nt = Object.defineProperty, Dt = Object.getOwnPropertyDescriptor, ne = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Dt(e, i) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (s ? o(e, i, n) : o(n)) || n);
  return s && n && Nt(e, i, n), n;
};
let N = class extends _ {
  /** Run an API mutation and bubble the resulting config (or error) up. */
  async run(t) {
    try {
      const e = await t;
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: e,
          bubbles: !0,
          composed: !0
        })
      );
    } catch (e) {
      this._error(e);
    }
  }
  _error(t) {
    this.dispatchEvent(
      new CustomEvent("panel-error", {
        detail: String(t),
        bubbles: !0,
        composed: !0
      })
    );
  }
  async _export() {
    try {
      const t = await this.api.exportConfig(), e = new Blob([JSON.stringify(t, null, 2)], {
        type: "application/json"
      }), i = URL.createObjectURL(e), s = document.createElement("a");
      s.href = i, s.download = "sundial-config.json", s.click(), URL.revokeObjectURL(i);
    } catch (t) {
      this._error(t);
    }
  }
  async _onImportFile(t) {
    const e = t.target, i = e.files?.[0];
    if (e.value = "", !!i)
      try {
        const s = JSON.parse(await i.text());
        await this.run(this.api.importConfig(s));
      } catch (s) {
        this._error(s);
      }
  }
  render() {
    const t = this.config.settings, e = (i) => void this.run(this.api.updateSettings(i));
    return a`
      ${f("Adaptation")}
      <div class="grid">
        ${B(
      "Interval",
      t.interval,
      10,
      300,
      5,
      " s",
      (i) => e({ interval: i })
    )}
        ${B(
      "Transition",
      t.transition,
      0,
      300,
      1,
      " s",
      (i) => e({ transition: i })
    )}
        ${B(
      "Turn-on transition",
      t.initial_transition,
      0,
      300,
      1,
      " s",
      (i) => e({ initial_transition: i })
    )}
      </div>
      ${f(
      "Manual control",
      "When a light is changed by hand, Sundial pauses for it. Auto-reset hands control back after this many seconds (0 = never)."
    )}
      <div class="actions">
        ${Ve(
      "Pause when controlled manually",
      t.take_over_control,
      (i) => e({ take_over_control: i })
    )}
      </div>
      <div class="grid">
        ${I(
      "Auto-reset override",
      t.autoreset_control,
      0,
      3600,
      (i) => e({ autoreset_control: i }),
      "Never"
    )}
      </div>
      ${f(
      "Light commands",
      "Gap between the two turn-on calls for lights that get brightness and colour sent separately (e.g. IKEA)."
    )}
      <div class="grid">
        ${Lt(
      "Split-command delay (ms)",
      t.send_split_delay,
      (i) => e({ send_split_delay: i })
    )}
      </div>
      ${f(
      "Location",
      "Coordinates used to calculate sunrise and sunset. Leave blank to use your home's location."
    )}
      <div class="pair">
        ${He(
      "Latitude",
      t.sun_latitude,
      this.config.home_latitude.toFixed(4),
      (i) => e({ sun_latitude: i })
    )}
        ${He(
      "Longitude",
      t.sun_longitude,
      this.config.home_longitude.toFixed(4),
      (i) => e({ sun_longitude: i })
    )}
      </div>
      ${f(
      "Backup",
      "Download the full configuration — every schema plus these settings — as a JSON file, or restore a previous export."
    )}
      <div class="pair">
        <button class="btn ghost" @click=${() => void this._export()}>
          Export
        </button>
        <button class="btn ghost" @click=${() => this._fileInput.click()}>
          Import
        </button>
      </div>
      <input
        type="file"
        accept=".json,application/json"
        hidden
        @change=${this._onImportFile}
      />
      <p class="about">Sundial · v${this.config.version}</p>
    `;
  }
};
N.styles = [
  Z,
  T`
      .about {
        margin: 28px 0 2px;
        text-align: center;
        font-size: 0.72rem;
        color: var(--text-soft);
        opacity: 0.8;
      }
    `
];
ne([
  g({ attribute: !1 })
], N.prototype, "config", 2);
ne([
  g({ attribute: !1 })
], N.prototype, "api", 2);
ne([
  vt("input[type=file]")
], N.prototype, "_fileInput", 2);
N = ne([
  D("sundial-settings-tab")
], N);
var jt = Object.defineProperty, It = Object.getOwnPropertyDescriptor, $ = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? It(e, i) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (s ? o(e, i, n) : o(n)) || n);
  return s && n && jt(e, i, n), n;
};
const Ut = "(max-width: 960px)";
let v = class extends _ {
  constructor() {
    super(...arguments), this.preview = !1, this._sel = null, this._previewHour = le(), this._isMobile = !1, this._onMqChange = (t) => {
      this._isMobile = t.matches;
    }, this._closeDrawer = () => {
      const t = this.renderRoot.querySelector("dialog.drawer");
      if (!t || !t.open || !t.classList.contains("shown")) return;
      const e = () => {
        window.clearTimeout(s), t.removeEventListener("transitionend", i), t.open && t.close();
      }, i = (n) => {
        n.target === t && n.propertyName === "transform" && e();
      };
      t.addEventListener("transitionend", i), t.classList.remove("shown");
      const s = window.setTimeout(e, 400);
    }, this._onDrawerCancel = (t) => {
      t.preventDefault(), this._closeDrawer();
    }, this._onDrawerClick = (t) => {
      t.target instanceof HTMLDialogElement && this._closeDrawer();
    }, this._setActive = () => {
      this.api.setActiveSchema(this._draft.id).then((t) => this._emit("config-changed", t)).catch((t) => this._emit("panel-error", String(t)));
    }, this._rename = () => {
      const t = window.prompt("Schema name", this._draft.name);
      if (t === null) return;
      const e = t.trim();
      !e || e === this._draft.name || this._patchSchema({ name: e });
    }, this._delete = () => {
      const t = this._draft.name || this._draft.id;
      window.confirm(`Delete schema "${t}"? This cannot be undone.`) && this._emit("schema-delete", this._draft.id);
    };
  }
  get _active() {
    return this.schema.id === this.config.active_schema_id;
  }
  connectedCallback() {
    super.connectedCallback(), this._mql = window.matchMedia(Ut), this._isMobile = this._mql.matches, this._mql.addEventListener("change", this._onMqChange);
  }
  willUpdate(t) {
    t.has("schema") && (this._draft?.id !== this.schema.id ? (this._flushSave(), this._draft = structuredClone(this.schema), this._sel = null, this._loadTimeline()) : this._saveTimer === void 0 && JSON.stringify(this.schema) !== JSON.stringify(this._draft) && (this._draft = structuredClone(this.schema), this._loadTimeline())), t.has("preview") && t.get("preview") !== void 0 && (this.preview ? this._sendPreview() : (this._previewHour = le(), this.api.apply()));
  }
  disconnectedCallback() {
    this._flushSave(), window.clearTimeout(this._previewTimer), window.clearTimeout(this._timelineTimer), this._mql?.removeEventListener("change", this._onMqChange), super.disconnectedCallback();
  }
  // The drawer is rendered only while something is selected on mobile; open
  // it as a modal (backdrop, Esc, focus trap for free) right after render.
  // The forced reflow between showModal and .shown makes the off-screen
  // start state stick, so the class change transitions instead of snapping.
  updated() {
    const t = this.renderRoot.querySelector("dialog.drawer");
    t && !t.open && (t.showModal(), t.getBoundingClientRect(), t.classList.add("shown"));
  }
  // Render/preview the *draft* (unsaved) schema so edits are visible live.
  async _loadTimeline() {
    try {
      this._timeline = await this.api.timeline(this._draft);
    } catch {
      this._timeline = void 0;
    }
  }
  // Called after every edit: fast visual refresh + live preview, with a
  // slower debounce for the actual save.
  _afterEdit() {
    this._scheduleSave(), this._scheduleTimeline(), this.preview && this._sendPreview();
  }
  _scheduleTimeline() {
    window.clearTimeout(this._timelineTimer), this._timelineTimer = window.setTimeout(() => void this._loadTimeline(), 120);
  }
  // --- persistence ---------------------------------------------------------
  _scheduleSave() {
    window.clearTimeout(this._saveTimer), this._saveTimer = window.setTimeout(() => {
      this._saveTimer = void 0, this._saveAndRefresh();
    }, 400);
  }
  _flushSave() {
    this._saveTimer !== void 0 && (window.clearTimeout(this._saveTimer), this._saveTimer = void 0, this._saveAndRefresh());
  }
  async _saveAndRefresh() {
    try {
      const t = await this.api.saveSchema(this._draft);
      this._emit("config-changed", t);
    } catch (t) {
      this._emit("panel-error", String(t));
    }
  }
  _lightCfg(t) {
    const e = this._draft.lights[t];
    if (e) return e;
    const i = xt(), s = this._bulbCtRange(t);
    return s && (i.min_color_temp = s[0], i.max_color_temp = s[1]), i;
  }
  /** The bulb's supported colour-temperature range, normalised to the
   *  editor's 50 K slider grid and bounds; null when unknown/RGB-only. */
  _bulbCtRange(t) {
    const e = this.config.lights.find((s) => s.entity_id === t);
    if (e?.min_color_temp_kelvin == null || e?.max_color_temp_kelvin == null)
      return null;
    const i = (s) => Math.min(M, Math.max(E, Math.round(s / 50) * 50));
    return [i(e.min_color_temp_kelvin), i(e.max_color_temp_kelvin)];
  }
  _patchSchema(t) {
    this._draft = { ...this._draft, ...t }, this._afterEdit();
  }
  _patchLight(t, e) {
    const i = { ...this._lightCfg(t), ...e };
    this._draft = {
      ...this._draft,
      lights: { ...this._draft.lights, [t]: i }
    }, this._afterEdit();
  }
  _setCell(t, e) {
    const s = [...this._lightCfg(t.entityId).hours];
    s[t.hour] = e, this._patchLight(t.entityId, { hours: s });
  }
  // --- render --------------------------------------------------------------
  render() {
    return a`
      <div class="head">
        <div class="switcher" title="Switch schema">
          <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 10l4-4 4 4M8 14l4 4 4-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <select
            @change=${(t) => this._emit("schema-select", t.target.value)}
          >
            ${Object.values(this.config.schemas).map(
      (t) => a`<option
                value=${t.id}
                ?selected=${t.id === this.schema.id}
              >
                ${t.name}${t.id === this.config.active_schema_id ? " (active)" : ""}
              </option>`
    )}
          </select>
        </div>
        <span class="name">${this._draft.name}</span>
        <button
          class="icon-btn plain rename"
          title="Rename schema"
          @click=${this._rename}
        >
          ${Et}
        </button>
        ${this._isMobile ? d : this._renderSchemaActions()}
        <span class="grow"></span>
        ${this._renderActions()}
      </div>

      <div class="layout">
        <div class="main">
          <sundial-timeline-grid
            .lights=${this.config.lights}
            .timeline=${this._timeline}
            .selected=${this._sel?.kind === "cell" ? this._sel.ref : null}
            .selectedRow=${this._selectedRow}
            .previewHour=${this._previewHour}
            .previewActive=${this.preview}
            .scrollLocked=${this._isMobile && this._sel !== null}
            @select-cell=${(t) => this._onSelectCell(t.detail)}
            @select-light=${(t) => this._sel = { kind: "light", entityId: t.detail }}
            @select-sun=${() => this._sel = { kind: "sun" }}
            @scrub=${(t) => this._onScrub(t.detail)}
          ></sundial-timeline-grid>
        </div>

        ${this._isMobile ? d : this._renderSide()}
      </div>

      ${this._isMobile && this._sel ? this._renderDrawer() : d}
    `;
  }
  // A fixed set of controls in a fixed order — unavailable ones are disabled
  // rather than hidden, so nothing shifts around.
  _renderActions() {
    const t = this._draft.id !== "default";
    return this._isMobile ? a`
      <button
        class="icon-btn"
        title="New schema"
        @click=${() => this._emit("schema-new", null)}
      >
        ${Ce}
      </button>
      <button
        class="icon-btn danger"
        ?disabled=${!t}
        title=${t ? "Delete schema" : "The default schema cannot be deleted"}
        @click=${this._delete}
      >
        ${Le}
      </button>
      <button
        class="icon-btn ${this.preview ? "active" : ""}"
        title="Preview on lights"
        @click=${() => this._emit("preview-toggle", !this.preview)}
      >
        ${Ee}
      </button>
      <button
        class="icon-btn ${this._active ? "active" : ""}"
        ?disabled=${this._active}
        title=${this._active ? "This schema is active" : "Apply this schema"}
        @click=${this._setActive}
      >
        ${Me}
      </button>
      <button
        class="icon-btn plain"
        title="Global settings"
        @click=${() => this._sel = { kind: "settings" }}
      >
        ${Te}
      </button>
    ` : a`
        <button
          class="btn ${this.preview ? "" : "ghost"}"
          @click=${() => this._emit("preview-toggle", !this.preview)}
        >
          ${Ee} Preview
        </button>
        <button
          class="btn ghost"
          ?disabled=${this._active}
          title=${this._active ? "This schema is active" : "Apply this schema"}
          @click=${this._setActive}
        >
          ${Me} ${this._active ? "Active" : "Apply"}
        </button>
        <button
          class="btn plain"
          title="Global settings"
          @click=${() => this._sel = { kind: "settings" }}
        >
          ${Te} Settings
        </button>
      `;
  }
  // Desktop: schema-scoped actions sit next to the title; the rest of the
  // controls stay on the right.
  _renderSchemaActions() {
    const t = this._draft.id !== "default";
    return a`
      <button class="btn ghost" @click=${() => this._emit("schema-new", null)}>
        ${Ce} New
      </button>
      <button
        class="btn danger"
        ?disabled=${!t}
        title=${t ? "Delete schema" : "The default schema cannot be deleted"}
        @click=${this._delete}
      >
        ${Le} Delete
      </button>
    `;
  }
  _renderSide() {
    if (!this._sel)
      return a`<div class="side">
        <div class="side-placeholder">
          ${Ct}
          <span>Select a light to configure it</span>
        </div>
      </div>`;
    const t = this._contextSubtitle();
    return a`<div class="side editing">
      <button class="close" title="Close" @click=${() => this._sel = null}>
        ✕
      </button>
      <h2>${this._contextTitle()}</h2>
      ${t ? a`<p class="subtitle">${t}</p>` : d}
      ${this._renderContextBody()}
    </div>`;
  }
  _renderDrawer() {
    const t = this._contextSubtitle();
    return a`<dialog
      class="drawer"
      @close=${() => this._sel = null}
      @cancel=${this._onDrawerCancel}
      @click=${this._onDrawerClick}
    >
      <div class="drawer-head">
        <div class="drawer-titles">
          <h2>${this._contextTitle()}</h2>
          ${t ? a`<span class="area">${t}</span>` : d}
        </div>
        <button class="close" title="Close" @click=${this._closeDrawer}>✕</button>
      </div>
      <div class="drawer-body">${this._renderContextBody()}</div>
    </dialog>`;
  }
  get _selectedRow() {
    const t = this._sel;
    return t?.kind === "sun" ? "sun" : t?.kind === "light" ? t.entityId : t?.kind === "cell" ? t.ref.entityId : null;
  }
  _lightName(t) {
    return this.config.lights.find((e) => e.entity_id === t)?.name ?? t;
  }
  _contextTitle() {
    const t = this._sel;
    if (t?.kind === "sun") return "☀️ Sun";
    if (t?.kind === "light") return this._lightName(t.entityId);
    if (t?.kind === "cell") {
      const e = String(t.ref.hour).padStart(2, "0");
      return `${this._lightName(t.ref.entityId)} · ${e}:00`;
    }
    return "Global settings";
  }
  /** The room (area) of the selected light, for the header subtitle. */
  _contextSubtitle() {
    const t = this._sel, e = t?.kind === "light" ? t.entityId : t?.kind === "cell" ? t.ref.entityId : null;
    return e ? this.config.lights.find((i) => i.entity_id === e)?.area_name ?? null : null;
  }
  _renderContextBody() {
    const t = this._sel;
    return t?.kind === "sun" ? a`
        ${this._renderRowPreview(this._timeline?.sun)}
        <sundial-sun-config
          .sun=${this._draft.sun}
          @sun-changed=${(e) => this._patchSchema({ sun: e.detail })}
        ></sundial-sun-config>
      ` : t?.kind === "light" ? a`
        ${this._renderRowPreview(this._timeline?.lights[t.entityId])}
        ${this._renderLightEditor(t.entityId)}
      ` : t?.kind === "cell" ? this._renderCellEditor(t.ref) : a`<sundial-settings-tab
      .config=${this.config}
      .api=${this.api}
    ></sundial-settings-tab>`;
  }
  // The edited row's 24 cells, mirrored live above the editor.
  _renderRowPreview(t) {
    return t?.length ? a`<sundial-row-preview .cells=${t}></sundial-row-preview>` : d;
  }
  _renderCellEditor(t) {
    const e = this.config.lights.find((l) => l.entity_id === t.entityId), i = this._lightCfg(t.entityId).hours[t.hour], s = this._timeline?.lights[t.entityId]?.[t.hour], n = i?.brightness ?? s?.brightness ?? 50, r = i?.color_temp ?? s?.color_temp ?? 3e3, o = i?.rgb_color ?? null, c = (l) => this._setCell(t, {
      brightness: n,
      color_temp: r,
      rgb_color: o,
      ...l
    });
    return i ? a`
      ${B(
      "Brightness",
      n,
      0,
      100,
      1,
      "%",
      (l) => c({ brightness: l })
    )}
      ${n <= 0 ? a`<p class="warn">
            At 0% this light turns off at this hour, and Sundial won't turn it
            back on automatically.
          </p>` : d}
      ${B(
      "Color temp",
      r,
      E,
      M,
      50,
      "K",
      (l) => c({ color_temp: l }),
      ae(E, M)
    )}
      ${e?.supports_rgb ? a`<label class="toggle">
              <input
                type="checkbox"
                .checked=${o !== null}
                @change=${(l) => c({
      rgb_color: l.target.checked ? o ?? [255, 255, 255] : null
    })}
              />
              RGB colour (overrides temp)
            </label>
            ${o !== null ? a`<input
                  type="color"
                  .value=${St(o)}
                  @input=${(l) => c({
      rgb_color: kt(l.target.value)
    })}
                />` : d}` : d}
      <div class="center-cta">
        <button class="btn ghost" @click=${() => this._setCell(t, null)}>
          Use sun
        </button>
      </div>
    ` : a`
        <div class="sun-indicator">
          <span class="sun-emoji">☀️</span>
          Following the sun
        </div>
        <div class="center-cta">
          <button class="btn" @click=${() => c({})}>Override</button>
        </div>
      `;
  }
  /** A one-tap reset when the configured range deviates from the bulb's. */
  _renderBulbRangeReset(t, e) {
    const i = this._bulbCtRange(t);
    return !i || e.min_color_temp === i[0] && e.max_color_temp === i[1] ? d : a`<div class="actions">
      <button
        class="btn ghost small"
        title="Set the bounds to ${i[0]}–${i[1]} K"
        @click=${() => this._patchLight(t, {
      min_color_temp: i[0],
      max_color_temp: i[1]
    })}
      >
        Use reported range
      </button>
    </div>`;
  }
  /** Colour-rendering choice, only for lights supporting both CT and RGB. */
  _renderRenderModeSelect(t, e) {
    const i = this.config.lights.find((s) => s.entity_id === t);
    return !i?.supports_rgb || i.min_color_temp_kelvin == null ? d : Oe(
      "Rendering",
      e.render_mode,
      [
        { value: "auto", label: "Color temperature" },
        { value: "rgb", label: "RGB" }
      ],
      (s) => this._patchLight(t, { render_mode: s })
    );
  }
  _renderLightEditor(t) {
    const e = this._lightCfg(t);
    return a`
      ${f("Brightness")}
      ${Q(
      "Range",
      "%",
      e.min_brightness,
      e.max_brightness,
      0,
      100,
      1,
      (i, s) => this._patchLight(t, { min_brightness: i, max_brightness: s })
    )}
      ${e.min_brightness <= 0 ? a`<p class="warn">
            At 0% this light can turn off during the day, and Sundial won't
            turn it back on automatically.
          </p>` : d}
      ${f("Color temperature")}
      ${Q(
      "Range",
      " K",
      e.min_color_temp,
      e.max_color_temp,
      E,
      M,
      50,
      (i, s) => this._patchLight(t, { min_color_temp: i, max_color_temp: s }),
      ae(E, M)
    )}
      ${this._renderBulbRangeReset(t, e)}
      ${f(
      "Behaviour",
      "Cap keeps the light tracking the sun, clamped into its range; Scale sweeps the whole range across the day. Sending brightness and colour separately helps lights that drop combined commands (e.g. IKEA)."
    )}
      ${Oe(
      "Limits",
      e.limit_mode,
      [
        { value: "cap", label: "Cap (clamp to range)" },
        { value: "scale", label: "Scale (map onto range)" }
      ],
      (i) => this._patchLight(t, { limit_mode: i })
    )}
      ${this._renderRenderModeSelect(t, e)}
      <div class="actions">
        ${Ve(
      "Send brightness and colour separately",
      e.separate_turn_on_commands,
      (i) => this._patchLight(t, { separate_turn_on_commands: i })
    )}
      </div>
    `;
  }
  _onScrub(t) {
    this._previewHour = t, this.preview && this._sendPreview();
  }
  // Selecting an hour cell opens its editor; the playhead only follows the
  // selection while preview mode is on.
  _onSelectCell(t) {
    this._sel = { kind: "cell", ref: t }, this.preview && (this._previewHour = t.hour, this._sendPreview());
  }
  _sendPreview() {
    window.clearTimeout(this._previewTimer), this._previewTimer = window.setTimeout(() => {
      this.api.preview(this._draft, this._previewHour, !0);
    }, 150);
  }
  _emit(t, e) {
    this.dispatchEvent(
      new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 })
    );
  }
};
v.styles = [
  Z,
  T`
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .name {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--text);
        min-width: 0;
        flex: 0 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .icon-btn.rename {
        width: 30px;
        height: 30px;
      }
      .icon-btn.rename svg {
        width: 16px;
        height: 16px;
      }
      .switcher {
        position: relative;
        display: inline-flex;
        align-items: center;
        color: var(--text-soft);
      }
      .switcher .chev {
        width: 18px;
        height: 18px;
        pointer-events: none;
      }
      .switcher select {
        position: absolute;
        inset: 0;
        width: 100%;
        opacity: 0;
        cursor: pointer;
      }
      .grow {
        flex: 1;
      }
      input[type="color"] {
        width: 52px;
        height: 34px;
        padding: 2px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        cursor: pointer;
      }
      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex: none;
        padding: 0;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--accent-strong);
        cursor: pointer;
      }
      .icon-btn svg {
        width: 20px;
        height: 20px;
      }
      .icon-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff8ef;
      }
      .icon-btn.danger {
        color: var(--danger);
      }
      /* Borderless: visually separate from the schema actions. */
      .icon-btn.plain {
        border-color: transparent;
        background: transparent;
      }
      .icon-btn:disabled {
        opacity: 0.45;
        cursor: default;
      }
      /* Disabled because it's already applied — state, not a dead control. */
      .icon-btn.active:disabled {
        opacity: 0.9;
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 16px;
        align-items: stretch;
      }
      /* Let both columns shrink below their content so the timeline scrolls
         internally instead of overflowing the viewport. */
      .main,
      .side {
        min-width: 0;
      }
      /* The side holds global settings flat by default; when something is
         selected it becomes a temporary editing card. */
      .side {
        position: relative;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .side.editing {
        background: var(--surface);
        border: 1px solid var(--accent);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 18px;
      }
      .side h2 {
        margin: 0 0 4px;
        font-size: 1.05rem;
        font-weight: 650;
        padding-right: 28px;
      }
      /* Empty-selection state, centred across the card's full height. */
      .side-placeholder {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--text-soft);
        text-align: center;
        font-size: 0.9rem;
      }
      .side-placeholder svg {
        width: 34px;
        height: 34px;
        opacity: 0.5;
      }
      .close {
        position: absolute;
        top: 12px;
        right: 12px;
        border: none;
        background: transparent;
        color: var(--text-soft);
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
      }
      .close:hover {
        color: var(--accent-strong);
        background: var(--accent-soft);
      }
      .close:focus-visible {
        outline: 2px solid var(--accent);
      }

      /* "Following the sun" state of the hour-cell editor. */
      .sun-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 18px 0 4px;
        text-align: center;
        color: var(--text-soft);
        font-size: 0.9rem;
      }
      .sun-indicator .sun-emoji {
        font-size: 1.8rem;
      }
      .center-cta {
        display: flex;
        justify-content: center;
        margin-top: 14px;
      }

      sundial-row-preview {
        margin-bottom: 14px;
      }
      /* The strip provides the top spacing; the first heading after it
         shouldn't add its own. */
      sundial-row-preview + .section {
        margin-top: 0;
      }

      /* --- bottom drawer (native <dialog>, small screens only) ----------- */
      dialog.drawer {
        position: fixed;
        /* Pin to the bottom only — a top of 0 would stretch the box to the
           full viewport regardless of height: auto. */
        inset: auto 0 0 0;
        margin: 0;
        width: 100%;
        max-width: 100%;
        /* Size to the content; the body scrolls once this cap binds. */
        height: auto;
        max-height: calc(100vh - 40px);
        max-height: calc(100dvh - 40px);
        border: none;
        border-radius: 16px 16px 0 0;
        padding: 0;
        background: var(--surface);
        color: var(--text);
        box-shadow: 0 -8px 30px rgba(120, 80, 40, 0.3);
      }
      /* Class-driven transitions: the dialog opens off-screen, .shown slides
         it in; removing .shown slides it back out (and fades the backdrop)
         before _closeDrawer actually closes it. */
      dialog.drawer[open] {
        display: flex;
        flex-direction: column;
        transform: translateY(100%);
        transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
      }
      dialog.drawer[open].shown {
        transform: translateY(0);
      }
      dialog.drawer::backdrop {
        background: rgba(61, 44, 30, 0.4);
        opacity: 0;
        transition: opacity 240ms ease-out;
      }
      dialog.drawer[open].shown::backdrop {
        opacity: 1;
      }
      .drawer-head {
        flex: none;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 10px 10px 16px;
        border-bottom: 1px solid var(--surface-alt);
      }
      .drawer-titles {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .drawer-titles h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 650;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .drawer-titles .area {
        font-size: 0.75rem;
        color: var(--text-soft);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .drawer-head .close {
        position: static;
        flex: none;
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
      }
      .drawer-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));
      }
      /* Extra breathing room between stacked fields in the drawer. */
      .drawer-body .field,
      .drawer-body label.field {
        margin-bottom: 16px;
      }

      @media (max-width: 960px) {
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
        }
        /* Fixed-height single-row sticky bar on a soft surface. */
        .head {
          flex: none;
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--surface);
          box-shadow: var(--shadow);
          flex-wrap: nowrap;
          gap: 6px;
          /* Matches the Home Assistant app header height. */
          height: 56px;
          margin: 0 0 8px;
          padding: 0 12px;
        }
        .name {
          font-size: 1.05rem;
        }
        .layout {
          flex: 1;
          min-height: 0;
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: minmax(0, 1fr);
          gap: 0;
        }
        .main {
          min-height: 0;
        }
      }
    `
];
$([
  g({ attribute: !1 })
], v.prototype, "schema", 2);
$([
  g({ attribute: !1 })
], v.prototype, "config", 2);
$([
  g({ attribute: !1 })
], v.prototype, "api", 2);
$([
  g({ type: Boolean })
], v.prototype, "preview", 2);
$([
  w()
], v.prototype, "_draft", 2);
$([
  w()
], v.prototype, "_timeline", 2);
$([
  w()
], v.prototype, "_sel", 2);
$([
  w()
], v.prototype, "_previewHour", 2);
$([
  w()
], v.prototype, "_isMobile", 2);
v = $([
  D("sundial-schema-editor")
], v);
var Bt = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, H = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Vt(e, i) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (s ? o(e, i, n) : o(n)) || n);
  return s && n && Bt(e, i, n), n;
};
let x = class extends _ {
  constructor() {
    super(...arguments), this.narrow = !1, this._preview = !1, this._loaded = !1;
  }
  updated() {
    this.hass && (this._api ? this._api.setHass(this.hass) : this._api = new _t(this.hass), this._loaded || (this._loaded = !0, this._load()));
  }
  async _load() {
    try {
      this._config = await this._api.getConfig(), this._error = void 0;
    } catch (t) {
      this._error = String(t);
    }
  }
  get _currentId() {
    const t = this._config;
    return this._selectedId && t.schemas[this._selectedId] ? this._selectedId : t.active_schema_id;
  }
  _onConfigChanged(t) {
    this._config = t.detail, this._error = void 0;
  }
  _onError(t) {
    this._error = t.detail;
  }
  render() {
    if (!this._config)
      return a`<div class="wrap">
        <div class="empty">${this._error ?? "Loading…"}</div>
      </div>`;
    const t = this._config, e = this._currentId, i = t.schemas[e];
    return a`<div
      class="wrap"
      @config-changed=${this._onConfigChanged}
      @panel-error=${this._onError}
      @preview-toggle=${(s) => this._preview = s.detail}
      @schema-select=${(s) => this._selectedId = s.detail}
      @schema-new=${() => void this._new()}
    >
      ${this._error ? a`<div class="card error">${this._error}</div>` : d}

      ${i ? a`<sundial-schema-editor
            .schema=${i}
            .config=${t}
            .api=${this._api}
            .preview=${this._preview}
            @schema-delete=${this._onDelete}
          ></sundial-schema-editor>` : d}
    </div>`;
  }
  async _new() {
    const t = `schema_${Date.now().toString(36)}`;
    this._selectedId = t, await this._run(this._api.saveSchema(wt(t, "New schema")));
  }
  async _onDelete(t) {
    this._selectedId = void 0, await this._run(this._api.deleteSchema(t.detail));
  }
  async _run(t) {
    try {
      this._config = await t, this._error = void 0;
    } catch (e) {
      this._error = String(e);
    }
  }
};
x.styles = [
  bt,
  Z,
  T`
      .wrap {
        width: 100%;
        padding: 18px 20px 64px;
        overflow-x: clip;
      }
      .error {
        border-color: var(--danger);
        color: var(--danger);
      }
      @media (max-width: 960px) {
        /* Pin the whole panel to the viewport on small screens: with the
           host fixed, no drag anywhere can scroll the page — the timeline
           scrolls internally and that's it. The explicit height matters:
           inside Home Assistant an ancestor with transform/contain can
           become the fixed-position containing block, and inset alone would
           then size the panel to that (possibly short) ancestor instead of
           the screen. */
        :host {
          position: fixed;
          inset: 0;
          height: 100vh;
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          overscroll-behavior: none;
        }
        /* Edge to edge: the timeline's scroll indicator should sit at the
           screen edge, so the gutter lives on the inner content instead. */
        .wrap {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          overscroll-behavior: none;
        }
        .wrap > .card {
          flex: none;
          margin: 8px 12px 0;
        }
        sundial-schema-editor {
          flex: 1 1 auto;
          min-height: 0;
        }
      }
    `
];
H([
  g({ attribute: !1 })
], x.prototype, "hass", 2);
H([
  g({ attribute: !1 })
], x.prototype, "narrow", 2);
H([
  w()
], x.prototype, "_config", 2);
H([
  w()
], x.prototype, "_error", 2);
H([
  w()
], x.prototype, "_selectedId", 2);
H([
  w()
], x.prototype, "_preview", 2);
x = H([
  D("sundial-panel")
], x);
export {
  x as SundialPanel
};
