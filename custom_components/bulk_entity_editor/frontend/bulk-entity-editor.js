/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ue = globalThis, Ee = ue.ShadowRoot && (ue.ShadyCSS === void 0 || ue.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ae = Symbol(), De = /* @__PURE__ */ new WeakMap();
let Xe = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== Ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Ee && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = De.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && De.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const dt = (i) => new Xe(typeof i == "string" ? i : i + "", void 0, Ae), C = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, r, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[o + 1], i[0]);
  return new Xe(t, i, Ae);
}, pt = (i, e) => {
  if (Ee) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), r = ue.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = t.cssText, i.appendChild(s);
  }
}, Oe = Ee ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return dt(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ut, defineProperty: _t, getOwnPropertyDescriptor: ft, getOwnPropertyNames: gt, getOwnPropertySymbols: mt, getPrototypeOf: bt } = Object, P = globalThis, Re = P.trustedTypes, vt = Re ? Re.emptyScript : "", yt = P.reactiveElementPolyfillSupport, Q = (i, e) => i, fe = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? vt : null;
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
} }, ze = (i, e) => !ut(i, e), Te = { attribute: !0, type: String, converter: fe, reflect: !1, useDefault: !1, hasChanged: ze };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), P.litPropertyMetadata ?? (P.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let H = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Te) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, t);
      r !== void 0 && _t(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: r, set: o } = ft(this.prototype, e) ?? { get() {
      return this[t];
    }, set(n) {
      this[t] = n;
    } };
    return { get: r, set(n) {
      const a = r?.call(this);
      o?.call(this, n), this.requestUpdate(e, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Te;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Q("elementProperties"))) return;
    const e = bt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Q("properties"))) {
      const t = this.properties, s = [...gt(t), ...mt(t)];
      for (const r of s) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, r] of t) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const r = this._$Eu(t, s);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) t.unshift(Oe(r));
    } else e !== void 0 && t.push(Oe(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return pt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : fe).toAttribute(t, s.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = s.getPropertyOptions(r), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : fe;
      this._$Em = r;
      const a = n.fromAttribute(t, o.type);
      this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, t, s, r = !1, o) {
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (o = this[e]), s ?? (s = n.getPropertyOptions(e)), !((s.hasChanged ?? ze)(o, t) || s.useDefault && s.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: r, wrapped: o }, n) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, n ?? t ?? this[e]), o !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, o] of s) {
        const { wrapped: n } = o, a = this[r];
        n !== !0 || this._$AL.has(r) || a === void 0 || this.C(r, void 0, o, a);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
H.elementStyles = [], H.shadowRootOptions = { mode: "open" }, H[Q("elementProperties")] = /* @__PURE__ */ new Map(), H[Q("finalized")] = /* @__PURE__ */ new Map(), yt?.({ ReactiveElement: H }), (P.reactiveElementVersions ?? (P.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ee = globalThis, Le = (i) => i, ge = ee.trustedTypes, Ve = ge ? ge.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Qe = "$lit$", k = `lit$${Math.random().toFixed(9).slice(2)}$`, et = "?" + k, xt = `<${et}>`, B = document, se = () => B.createComment(""), re = (i) => i === null || typeof i != "object" && typeof i != "function", ke = Array.isArray, wt = (i) => ke(i) || typeof i?.[Symbol.iterator] == "function", $e = `[ 	
\f\r]`, J = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Be = /-->/g, Ne = />/g, R = RegExp(`>|${$e}(?:([^\\s"'>=/]+)(${$e}*=${$e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ue = /'/g, je = /"/g, tt = /^(?:script|style|textarea|title)$/i, $t = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), u = $t(1), M = Symbol.for("lit-noChange"), g = Symbol.for("lit-nothing"), He = /* @__PURE__ */ new WeakMap(), V = B.createTreeWalker(B, 129);
function it(i, e) {
  if (!ke(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ve !== void 0 ? Ve.createHTML(e) : e;
}
const St = (i, e) => {
  const t = i.length - 1, s = [];
  let r, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = J;
  for (let a = 0; a < t; a++) {
    const l = i[a];
    let h, d, c = -1, f = 0;
    for (; f < l.length && (n.lastIndex = f, d = n.exec(l), d !== null); ) f = n.lastIndex, n === J ? d[1] === "!--" ? n = Be : d[1] !== void 0 ? n = Ne : d[2] !== void 0 ? (tt.test(d[2]) && (r = RegExp("</" + d[2], "g")), n = R) : d[3] !== void 0 && (n = R) : n === R ? d[0] === ">" ? (n = r ?? J, c = -1) : d[1] === void 0 ? c = -2 : (c = n.lastIndex - d[2].length, h = d[1], n = d[3] === void 0 ? R : d[3] === '"' ? je : Ue) : n === je || n === Ue ? n = R : n === Be || n === Ne ? n = J : (n = R, r = void 0);
    const _ = n === R && i[a + 1].startsWith("/>") ? " " : "";
    o += n === J ? l + xt : c >= 0 ? (s.push(h), l.slice(0, c) + Qe + l.slice(c) + k + _) : l + k + (c === -2 ? a : _);
  }
  return [it(i, o + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class oe {
  constructor({ strings: e, _$litType$: t }, s) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const a = e.length - 1, l = this.parts, [h, d] = St(e, t);
    if (this.el = oe.createElement(h, s), V.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (r = V.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const c of r.getAttributeNames()) if (c.endsWith(Qe)) {
          const f = d[n++], _ = r.getAttribute(c).split(k), b = /([.?@])?(.*)/.exec(f);
          l.push({ type: 1, index: o, name: b[2], strings: _, ctor: b[1] === "." ? Et : b[1] === "?" ? At : b[1] === "@" ? zt : ve }), r.removeAttribute(c);
        } else c.startsWith(k) && (l.push({ type: 6, index: o }), r.removeAttribute(c));
        if (tt.test(r.tagName)) {
          const c = r.textContent.split(k), f = c.length - 1;
          if (f > 0) {
            r.textContent = ge ? ge.emptyScript : "";
            for (let _ = 0; _ < f; _++) r.append(c[_], se()), V.nextNode(), l.push({ type: 2, index: ++o });
            r.append(c[f], se());
          }
        }
      } else if (r.nodeType === 8) if (r.data === et) l.push({ type: 2, index: o });
      else {
        let c = -1;
        for (; (c = r.data.indexOf(k, c + 1)) !== -1; ) l.push({ type: 7, index: o }), c += k.length - 1;
      }
      o++;
    }
  }
  static createElement(e, t) {
    const s = B.createElement("template");
    return s.innerHTML = e, s;
  }
}
function F(i, e, t = i, s) {
  if (e === M) return e;
  let r = s !== void 0 ? t._$Co?.[s] : t._$Cl;
  const o = re(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(i), r._$AT(i, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = r : t._$Cl = r), r !== void 0 && (e = F(i, r._$AS(i, e.values), r, s)), e;
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
    const { el: { content: t }, parts: s } = this._$AD, r = (e?.creationScope ?? B).importNode(t, !0);
    V.currentNode = r;
    let o = V.nextNode(), n = 0, a = 0, l = s[0];
    for (; l !== void 0; ) {
      if (n === l.index) {
        let h;
        l.type === 2 ? h = new W(o, o.nextSibling, this, e) : l.type === 1 ? h = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (h = new kt(o, this, e)), this._$AV.push(h), l = s[++a];
      }
      n !== l?.index && (o = V.nextNode(), n++);
    }
    return V.currentNode = B, r;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class W {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, s, r) {
    this.type = 2, this._$AH = g, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = F(this, e, t), re(e) ? e === g || e == null || e === "" ? (this._$AH !== g && this._$AR(), this._$AH = g) : e !== this._$AH && e !== M && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : wt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== g && re(this._$AH) ? this._$AA.nextSibling.data = e : this.T(B.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = oe.createElement(it(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(t);
    else {
      const o = new Ct(r, this), n = o.u(this.options);
      o.p(t), this.T(n), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = He.get(e.strings);
    return t === void 0 && He.set(e.strings, t = new oe(e)), t;
  }
  k(e) {
    ke(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, r = 0;
    for (const o of e) r === t.length ? t.push(s = new W(this.O(se()), this.O(se()), this, this.options)) : s = t[r], s._$AI(o), r++;
    r < t.length && (this._$AR(s && s._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const s = Le(e).nextSibling;
      Le(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ve {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, r, o) {
    this.type = 1, this._$AH = g, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = g;
  }
  _$AI(e, t = this, s, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) e = F(this, e, t, 0), n = !re(e) || e !== this._$AH && e !== M, n && (this._$AH = e);
    else {
      const a = e;
      let l, h;
      for (e = o[0], l = 0; l < o.length - 1; l++) h = F(this, a[s + l], t, l), h === M && (h = this._$AH[l]), n || (n = !re(h) || h !== this._$AH[l]), h === g ? e = g : e !== g && (e += (h ?? "") + o[l + 1]), this._$AH[l] = h;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === g ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Et extends ve {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === g ? void 0 : e;
  }
}
class At extends ve {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== g);
  }
}
class zt extends ve {
  constructor(e, t, s, r, o) {
    super(e, t, s, r, o), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = F(this, e, t, 0) ?? g) === M) return;
    const s = this._$AH, r = e === g && s !== g || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, o = e !== g && (s === g || r);
    r && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class kt {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    F(this, e);
  }
}
const Pt = { I: W }, Mt = ee.litHtmlPolyfillSupport;
Mt?.(oe, W), (ee.litHtmlVersions ?? (ee.litHtmlVersions = [])).push("3.3.2");
const It = (i, e, t) => {
  const s = t?.renderBefore ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const o = t?.renderBefore ?? null;
    s._$litPart$ = r = new W(e.insertBefore(se(), o), o, void 0, t ?? {});
  }
  return r._$AI(i), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis;
let x = class extends H {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = It(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return M;
  }
};
x._$litElement$ = !0, x.finalized = !0, te.litElementHydrateSupport?.({ LitElement: x });
const Dt = te.litElementPolyfillSupport;
Dt?.({ LitElement: x });
(te.litElementVersions ?? (te.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const E = (i) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(i, e);
  }) : customElements.define(i, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ot = { attribute: !0, type: String, converter: fe, reflect: !1, hasChanged: ze }, Rt = (i = Ot, e, t) => {
  const { kind: s, metadata: r } = t;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), s === "setter" && ((i = Object.create(i)).wrapped = !0), o.set(t.name, i), s === "accessor") {
    const { name: n } = t;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(n, l, i, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(n, void 0, i, a), a;
    } };
  }
  if (s === "setter") {
    const { name: n } = t;
    return function(a) {
      const l = this[n];
      e.call(this, a), this.requestUpdate(n, l, i, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function p(i) {
  return (e, t) => typeof t == "object" ? Rt(i, e, t) : ((s, r, o) => {
    const n = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, s), n ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(i, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function m(i) {
  return p({ ...i, state: !0, attribute: !1 });
}
const L = {
  search: "",
  domain: "",
  areaId: "",
  integration: "",
  state: "all",
  activity: "any"
};
function Tt(i, e) {
  return i.disabled_by ? !1 : !e.has(i.entity_id);
}
const Lt = (i, e) => i.area_id ? i.area_id : i.device_id ? e.get(i.device_id)?.area_id ?? null : null, st = (i) => i.split(".", 1)[0] ?? "";
function Vt(i, e, t, s) {
  const r = new Map(e.map((n) => [n.id, n])), o = t.search.trim().toLowerCase();
  return i.filter((n) => {
    if (t.domain && st(n.entity_id) !== t.domain || t.integration && n.platform !== t.integration)
      return !1;
    if (t.areaId) {
      const a = Lt(n, r);
      if (t.areaId === "__none__") {
        if (a) return !1;
      } else if (a !== t.areaId)
        return !1;
    }
    switch (t.state) {
      case "active":
        if (n.disabled_by || n.hidden_by) return !1;
        break;
      case "disabled":
        if (!n.disabled_by) return !1;
        break;
      case "hidden":
        if (!n.hidden_by) return !1;
        break;
    }
    return !(t.activity === "never_received" && (!s || !Tt(n, s)) || o && !(n.name ?? n.original_name ?? "").toLowerCase().includes(o) && !n.entity_id.toLowerCase().includes(o));
  });
}
function Bt(i) {
  return [...new Set(i.map((e) => st(e.entity_id)))].sort();
}
function Nt(i) {
  return [...new Set(i.map((e) => e.platform))].sort();
}
async function Ut({
  items: i,
  idOf: e,
  run: t,
  concurrency: s = 8,
  onProgress: r
}) {
  const o = {
    total: i.length,
    done: 0,
    succeeded: 0,
    failed: 0,
    results: []
  }, n = i.slice(), a = [], l = async () => {
    for (; n.length > 0; ) {
      const d = n.shift();
      if (!d) return;
      const c = e(d);
      try {
        await t(d), o.results.push({ id: c, ok: !0 }), o.succeeded += 1;
      } catch (f) {
        const _ = f instanceof Error ? f.message : String(f);
        o.results.push({ id: c, ok: !1, error: _ }), o.failed += 1;
      } finally {
        o.done += 1, r?.({ ...o, results: o.results.slice() });
      }
    }
  }, h = Math.max(1, Math.min(s, i.length));
  for (let d = 0; d < h; d++) a.push(l());
  return await Promise.all(a), o;
}
var jt = Object.defineProperty, Ht = Object.getOwnPropertyDescriptor, j = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? Ht(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && jt(e, t, r), r;
};
let z = class extends x {
  constructor() {
    super(...arguments), this.options = [], this.value = "", this.placeholder = "", this.disabled = !1, this._open = !1, this._menuRect = null, this._onDocDown = (i) => {
      i.composedPath().includes(this) || this._close();
    }, this._onKey = (i) => {
      i.key === "Escape" && this._open && (i.stopPropagation(), this._close());
    }, this._toggle = (i) => {
      i.stopPropagation(), !this.disabled && (this._open ? this._close() : this._openMenu());
    }, this._close = () => {
      this._open && (this._open = !1, this._menuRect = null, this._removeGlobalListeners());
    };
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._removeGlobalListeners();
  }
  _addGlobalListeners() {
    document.addEventListener("mousedown", this._onDocDown, !0), document.addEventListener("keydown", this._onKey, !0), window.addEventListener("resize", this._close), window.addEventListener("scroll", this._close, !0);
  }
  _removeGlobalListeners() {
    document.removeEventListener("mousedown", this._onDocDown, !0), document.removeEventListener("keydown", this._onKey, !0), window.removeEventListener("resize", this._close), window.removeEventListener("scroll", this._close, !0);
  }
  _openMenu() {
    const i = this.renderRoot.querySelector(".trigger");
    if (!i) return;
    const e = i.getBoundingClientRect();
    this._menuRect = {
      top: e.bottom + 4,
      left: e.left,
      width: e.width
    }, this._open = !0, queueMicrotask(() => this._addGlobalListeners());
  }
  _pick(i, e) {
    e.stopPropagation(), this.value = i, this.dispatchEvent(
      new CustomEvent("select-change", {
        detail: i,
        bubbles: !0,
        composed: !0
      })
    ), this._close();
  }
  get _currentLabel() {
    const i = this.options.find((e) => e.value === this.value);
    return i ? i.label : this.placeholder;
  }
  render() {
    return u`
      <button
        type="button"
        class="trigger ${this._open ? "open" : ""}"
        @click=${this._toggle}
        ?disabled=${this.disabled}
        aria-haspopup="listbox"
        aria-expanded=${this._open}
      >
        <span class="label ${this.value ? "" : "placeholder"}">
          ${this._currentLabel}
        </span>
        <span class="chev" aria-hidden="true">▾</span>
      </button>
      ${this._open && this._menuRect ? u`
            <ul
              class="menu"
              role="listbox"
              style=${`top:${this._menuRect.top}px;left:${this._menuRect.left}px;min-width:${this._menuRect.width}px;`}
            >
              ${this.options.map(
      (i) => u`
                  <li
                    role="option"
                    aria-selected=${i.value === this.value}
                    class=${i.value === this.value ? "selected" : ""}
                    @click=${(e) => this._pick(i.value, e)}
                  >
                    ${i.label}
                  </li>
                `
    )}
              ${this.options.length === 0 ? u`<li class="empty">No options</li>` : g}
            </ul>
          ` : g}
    `;
  }
};
z.styles = C`
    :host {
      display: inline-block;
      position: relative;
      width: 100%;
    }
    .trigger {
      font: inherit;
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      text-align: left;
      box-sizing: border-box;
    }
    .trigger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .trigger:focus-visible,
    .trigger.open {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: -1px;
    }
    .label {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .placeholder {
      color: var(--secondary-text-color, #727272);
    }
    .chev {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      flex: 0 0 auto;
    }
    .menu {
      position: fixed;
      z-index: 100;
      margin: 0;
      padding: 4px 0;
      list-style: none;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border: 1px solid var(--divider-color, #d0d0d0);
      border-radius: 8px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
      max-height: 280px;
      overflow: auto;
    }
    .menu li {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      white-space: nowrap;
    }
    .menu li:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .menu li.selected {
      background: color-mix(
        in srgb,
        var(--primary-color, #03a9f4) 12%,
        transparent
      );
      font-weight: 500;
    }
    .menu li.empty {
      color: var(--secondary-text-color, #727272);
      cursor: default;
      font-style: italic;
    }
  `;
j([
  p({ attribute: !1 })
], z.prototype, "options", 2);
j([
  p({ type: String })
], z.prototype, "value", 2);
j([
  p({ type: String })
], z.prototype, "placeholder", 2);
j([
  p({ type: Boolean })
], z.prototype, "disabled", 2);
j([
  m()
], z.prototype, "_open", 2);
j([
  m()
], z.prototype, "_menuRect", 2);
z = j([
  E("bee-select")
], z);
var Ft = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, Pe = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? Wt(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && Ft(e, t, r), r;
};
let ne = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.heading = "", this._onKey = (i) => {
      if (!(i.key !== "Escape" || !this.open)) {
        for (const e of i.composedPath())
          if (e instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName))
            return;
        this._close();
      }
    };
  }
  _close() {
    this.dispatchEvent(
      new CustomEvent("modal-close", { bubbles: !0, composed: !0 })
    );
  }
  _onBackdrop(i) {
    const e = this.renderRoot.querySelector(".dialog");
    e && i.composedPath().includes(e) || this._close();
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", this._onKey);
  }
  render() {
    return this.open ? u`
      <div class="backdrop" @click=${this._onBackdrop}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bee-modal-heading"
        >
          <header>
            <h2 id="bee-modal-heading">${this.heading}</h2>
            <button
              class="close"
              @click=${this._close}
              aria-label="Close dialog"
            >
              ×
            </button>
          </header>
          <div class="body"><slot></slot></div>
          <footer><slot name="footer"></slot></footer>
        </div>
      </div>
    ` : null;
  }
};
ne.styles = C`
    :host([open]) {
      display: block;
    }
    :host {
      display: none;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      padding: 20px;
    }
    .dialog {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      min-width: 320px;
      max-width: 560px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
    .close {
      font-size: 24px;
      line-height: 1;
      background: transparent;
      border: 0;
      color: inherit;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .close:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }
    .body {
      padding: 20px;
      overflow: auto;
    }
    footer {
      padding: 12px 20px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `;
Pe([
  p({ type: Boolean, reflect: !0 })
], ne.prototype, "open", 2);
Pe([
  p({ type: String })
], ne.prototype, "heading", 2);
ne = Pe([
  E("bee-modal")
], ne);
var qt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, q = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? Kt(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && qt(e, t, r), r;
};
let I = class extends x {
  constructor() {
    super(...arguments), this.domains = [], this.integrations = [], this.areas = [], this._modalOpen = !1;
  }
  _emit(i) {
    this.dispatchEvent(
      new CustomEvent("filters-change", {
        detail: i,
        bubbles: !0,
        composed: !0
      })
    );
  }
  _reset() {
    this.dispatchEvent(
      new CustomEvent("filters-reset", { bubbles: !0, composed: !0 })
    );
  }
  _activeFilterCount() {
    let i = 0;
    return this.filters.domain !== L.domain && (i += 1), this.filters.areaId !== L.areaId && (i += 1), this.filters.integration !== L.integration && (i += 1), this.filters.state !== L.state && (i += 1), this.filters.activity !== L.activity && (i += 1), i;
  }
  _renderDropdowns() {
    const i = [
      { value: "", label: "All areas" },
      { value: "__none__", label: "— No area —" },
      ...this.areas.map((s) => ({ value: s.area_id, label: s.name }))
    ], e = [
      { value: "", label: "All domains" },
      ...this.domains.map((s) => ({ value: s, label: s }))
    ], t = [
      { value: "", label: "All integrations" },
      ...this.integrations.map((s) => ({ value: s, label: s }))
    ];
    return u`
      <bee-select
        .value=${this.filters.domain}
        .options=${e}
        @select-change=${(s) => this._emit({ domain: s.detail })}
      ></bee-select>
      <bee-select
        .value=${this.filters.areaId}
        .options=${i}
        @select-change=${(s) => this._emit({ areaId: s.detail })}
      ></bee-select>
      <bee-select
        .value=${this.filters.integration}
        .options=${t}
        @select-change=${(s) => this._emit({ integration: s.detail })}
      ></bee-select>
      <bee-select
        .value=${this.filters.state}
        .options=${[
      { value: "all", label: "All states" },
      { value: "active", label: "Active only" },
      { value: "disabled", label: "Disabled only" },
      { value: "hidden", label: "Hidden only" }
    ]}
        @select-change=${(s) => this._emit({ state: s.detail })}
      ></bee-select>
      <bee-select
        .value=${this.filters.activity}
        .options=${[
      { value: "any", label: "Any activity" },
      { value: "never_received", label: "Never received data" }
    ]}
        @select-change=${(s) => this._emit({ activity: s.detail })}
      ></bee-select>
    `;
  }
  render() {
    const i = this.filters.search.length > 0, e = this._activeFilterCount();
    return u`
      <div class="bar">
        <div class="search-wrap">
          <input
            type="search"
            placeholder="Search name or entity_id"
            .value=${this.filters.search}
            @input=${(t) => this._emit({ search: t.target.value })}
            class="search"
          />
          ${i ? u`<button
                type="button"
                class="search-clear"
                aria-label="Clear search"
                title="Clear search"
                @click=${() => this._emit({ search: "" })}
              >
                ×
              </button>` : g}
        </div>

        <div class="inline-filters">
          ${this._renderDropdowns()}
        </div>

        <button
          type="button"
          class="filters-button"
          @click=${() => this._modalOpen = !0}
        >
          <svg class="funnel" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3 5h18l-7 8v6l-4-2v-4L3 5z"/>
          </svg>
          Filters
          ${e > 0 ? u`<span class="badge">${e}</span>` : g}
        </button>

        <button class="reset" @click=${this._reset}>Reset</button>
      </div>

      <bee-modal
        .open=${this._modalOpen}
        heading="Filters"
        @modal-close=${() => this._modalOpen = !1}
      >
        <div class="stacked-filters">${this._renderDropdowns()}</div>
        <div slot="footer">
          <button
            class="btn"
            @click=${() => {
      this._reset(), this._modalOpen = !1;
    }}
          >
            Reset
          </button>
          <button
            class="btn primary"
            @click=${() => this._modalOpen = !1}
          >
            Done
          </button>
        </div>
      </bee-modal>
    `;
  }
};
I.styles = C`
    :host {
      display: block;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 16px;
      background: var(--card-background-color, #fff);
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      align-items: flex-start;
    }
    .search-wrap {
      position: relative;
      flex: 1 1 240px;
      min-width: 160px;
      max-width: 320px;
      display: flex;
    }
    .search {
      flex: 1 1 auto;
      padding-right: 32px;
    }
    .search::-webkit-search-cancel-button,
    .search::-webkit-search-decoration {
      appearance: none;
    }
    .search-clear {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 0;
      background: var(--secondary-background-color, #f0f0f0);
      color: var(--secondary-text-color, #727272);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .search-clear:hover {
      background: var(--divider-color, #d0d0d0);
      color: var(--primary-text-color, #212121);
    }
    .inline-filters {
      display: flex;
      gap: 8px;
      flex: 1 1 auto;
    }
    .inline-filters > bee-select {
      flex: 1 1 140px;
      min-width: 120px;
    }
    .filters-button {
      display: none;
      align-items: center;
      gap: 6px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      font-size: 12px;
      font-weight: 600;
    }
    input,
    .filters-button,
    .reset,
    .btn {
      font: inherit;
      padding: 0 12px;
      height: 40px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
      box-sizing: border-box;
    }
    input:focus {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: -1px;
      cursor: text;
    }
    input {
      cursor: text;
    }
    .reset:hover,
    .filters-button:hover,
    .btn:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .btn.primary:hover {
      filter: brightness(0.95);
    }
    .stacked-filters {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    /* Only show the full inline filter row on very wide desktops — below
       1440px the HA sidebar plus 5 dropdowns plus search crowds things and
       the filters wrap awkwardly, so collapse to the Filters button. */
    @media (max-width: 1439px) {
      .bar {
        padding: 10px 12px;
      }
      .inline-filters {
        display: none;
      }
      .filters-button {
        display: inline-flex;
      }
      .search-wrap {
        flex: 1 1 auto;
        max-width: none;
      }
    }
  `;
q([
  p({ attribute: !1 })
], I.prototype, "filters", 2);
q([
  p({ attribute: !1 })
], I.prototype, "domains", 2);
q([
  p({ attribute: !1 })
], I.prototype, "integrations", 2);
q([
  p({ attribute: !1 })
], I.prototype, "areas", 2);
q([
  m()
], I.prototype, "_modalOpen", 2);
I = q([
  E("bee-filter-bar")
], I);
function ae(i, e, t, s) {
  var r = arguments.length, o = r < 3 ? e : s === null ? s = Object.getOwnPropertyDescriptor(e, t) : s, n;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") o = Reflect.decorate(i, e, t, s);
  else for (var a = i.length - 1; a >= 0; a--) (n = i[a]) && (o = (r < 3 ? n(o) : r > 3 ? n(e, t, o) : n(e, t)) || o);
  return r > 3 && o && Object.defineProperty(e, t, o), o;
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Me = { CHILD: 2 }, rt = (i) => (...e) => ({ _$litDirective$: i, values: e });
let ot = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, s) {
    this._$Ct = e, this._$AM = t, this._$Ci = s;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: Gt } = Pt, Fe = (i) => i, Zt = (i) => i.strings === void 0, We = () => document.createComment(""), X = (i, e, t) => {
  const s = i._$AA.parentNode, r = e === void 0 ? i._$AB : e._$AA;
  if (t === void 0) {
    const o = s.insertBefore(We(), r), n = s.insertBefore(We(), r);
    t = new Gt(o, n, i, i.options);
  } else {
    const o = t._$AB.nextSibling, n = t._$AM, a = n !== i;
    if (a) {
      let l;
      t._$AQ?.(i), t._$AM = i, t._$AP !== void 0 && (l = i._$AU) !== n._$AU && t._$AP(l);
    }
    if (o !== r || a) {
      let l = t._$AA;
      for (; l !== o; ) {
        const h = Fe(l).nextSibling;
        Fe(s).insertBefore(l, r), l = h;
      }
    }
  }
  return t;
}, T = (i, e, t = i) => (i._$AI(e, t), i), Yt = {}, Jt = (i, e = Yt) => i._$AH = e, Xt = (i) => i._$AH, Se = (i) => {
  i._$AR(), i._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ie = (i, e) => {
  const t = i._$AN;
  if (t === void 0) return !1;
  for (const s of t) s._$AO?.(e, !1), ie(s, e);
  return !0;
}, me = (i) => {
  let e, t;
  do {
    if ((e = i._$AM) === void 0) break;
    t = e._$AN, t.delete(i), i = e;
  } while (t?.size === 0);
}, nt = (i) => {
  for (let e; e = i._$AM; i = e) {
    let t = e._$AN;
    if (t === void 0) e._$AN = t = /* @__PURE__ */ new Set();
    else if (t.has(i)) break;
    t.add(i), ti(e);
  }
};
function Qt(i) {
  this._$AN !== void 0 ? (me(this), this._$AM = i, nt(this)) : this._$AM = i;
}
function ei(i, e = !1, t = 0) {
  const s = this._$AH, r = this._$AN;
  if (r !== void 0 && r.size !== 0) if (e) if (Array.isArray(s)) for (let o = t; o < s.length; o++) ie(s[o], !1), me(s[o]);
  else s != null && (ie(s, !1), me(s));
  else ie(this, i);
}
const ti = (i) => {
  i.type == Me.CHILD && (i._$AP ?? (i._$AP = ei), i._$AQ ?? (i._$AQ = Qt));
};
class ii extends ot {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(e, t, s) {
    super._$AT(e, t, s), nt(this), this.isConnected = e._$AU;
  }
  _$AO(e, t = !0) {
    e !== this.isConnected && (this.isConnected = e, e ? this.reconnected?.() : this.disconnected?.()), t && (ie(this, e), me(this));
  }
  setValue(e) {
    if (Zt(this._$Ct)) this._$Ct._$AI(e, this);
    else {
      const t = [...this._$Ct._$AH];
      t[this._$Ci] = e, this._$Ct._$AI(t, this, 0);
    }
  }
  disconnected() {
  }
  reconnected() {
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qe = (i, e, t) => {
  const s = /* @__PURE__ */ new Map();
  for (let r = e; r <= t; r++) s.set(i[r], r);
  return s;
}, si = rt(class extends ot {
  constructor(i) {
    if (super(i), i.type !== Me.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(i, e, t) {
    let s;
    t === void 0 ? t = e : e !== void 0 && (s = e);
    const r = [], o = [];
    let n = 0;
    for (const a of i) r[n] = s ? s(a, n) : n, o[n] = t(a, n), n++;
    return { values: o, keys: r };
  }
  render(i, e, t) {
    return this.dt(i, e, t).values;
  }
  update(i, [e, t, s]) {
    const r = Xt(i), { values: o, keys: n } = this.dt(e, t, s);
    if (!Array.isArray(r)) return this.ut = n, o;
    const a = this.ut ?? (this.ut = []), l = [];
    let h, d, c = 0, f = r.length - 1, _ = 0, b = o.length - 1;
    for (; c <= f && _ <= b; ) if (r[c] === null) c++;
    else if (r[f] === null) f--;
    else if (a[c] === n[_]) l[_] = T(r[c], o[_]), c++, _++;
    else if (a[f] === n[b]) l[b] = T(r[f], o[b]), f--, b--;
    else if (a[c] === n[b]) l[b] = T(r[c], o[b]), X(i, l[b + 1], r[c]), c++, b--;
    else if (a[f] === n[_]) l[_] = T(r[f], o[_]), X(i, r[c], r[f]), f--, _++;
    else if (h === void 0 && (h = qe(n, _, b), d = qe(a, c, f)), h.has(a[c])) if (h.has(a[f])) {
      const S = d.get(n[_]), Y = S !== void 0 ? r[S] : null;
      if (Y === null) {
        const A = X(i, r[c]);
        T(A, o[_]), l[_] = A;
      } else l[_] = T(Y, o[_]), X(i, r[c], Y), r[S] = null;
      _++;
    } else Se(r[f]), f--;
    else Se(r[c]), c++;
    for (; _ <= b; ) {
      const S = X(i, l[b + 1]);
      T(S, o[_]), l[_++] = S;
    }
    for (; c <= f; ) {
      const S = r[c++];
      S !== null && Se(S);
    }
    return this.ut = n, Jt(i, l), M;
  }
});
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class ye extends Event {
  constructor(e) {
    super(ye.eventName, { bubbles: !1 }), this.first = e.first, this.last = e.last;
  }
}
ye.eventName = "rangeChanged";
class xe extends Event {
  constructor(e) {
    super(xe.eventName, { bubbles: !1 }), this.first = e.first, this.last = e.last;
  }
}
xe.eventName = "visibilityChanged";
class we extends Event {
  constructor() {
    super(we.eventName, { bubbles: !1 });
  }
}
we.eventName = "unpinned";
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class ri {
  constructor(e) {
    this._element = null;
    const t = e ?? window;
    this._node = t, e && (this._element = e);
  }
  get element() {
    return this._element || document.scrollingElement || document.documentElement;
  }
  get scrollTop() {
    return this.element.scrollTop || window.scrollY;
  }
  get scrollLeft() {
    return this.element.scrollLeft || window.scrollX;
  }
  get scrollHeight() {
    return this.element.scrollHeight;
  }
  get scrollWidth() {
    return this.element.scrollWidth;
  }
  get viewportHeight() {
    return this._element ? this._element.getBoundingClientRect().height : window.innerHeight;
  }
  get viewportWidth() {
    return this._element ? this._element.getBoundingClientRect().width : window.innerWidth;
  }
  get maxScrollTop() {
    return this.scrollHeight - this.viewportHeight;
  }
  get maxScrollLeft() {
    return this.scrollWidth - this.viewportWidth;
  }
}
class oi extends ri {
  constructor(e, t) {
    super(t), this._clients = /* @__PURE__ */ new Set(), this._retarget = null, this._end = null, this.__destination = null, this.correctingScrollError = !1, this._checkForArrival = this._checkForArrival.bind(this), this._updateManagedScrollTo = this._updateManagedScrollTo.bind(this), this.scrollTo = this.scrollTo.bind(this), this.scrollBy = this.scrollBy.bind(this);
    const s = this._node;
    this._originalScrollTo = s.scrollTo, this._originalScrollBy = s.scrollBy, this._originalScroll = s.scroll, this._attach(e);
  }
  get _destination() {
    return this.__destination;
  }
  get scrolling() {
    return this._destination !== null;
  }
  scrollTo(e, t) {
    const s = typeof e == "number" && typeof t == "number" ? { left: e, top: t } : e;
    this._scrollTo(s);
  }
  scrollBy(e, t) {
    const s = typeof e == "number" && typeof t == "number" ? { left: e, top: t } : e;
    s.top !== void 0 && (s.top += this.scrollTop), s.left !== void 0 && (s.left += this.scrollLeft), this._scrollTo(s);
  }
  _nativeScrollTo(e) {
    this._originalScrollTo.bind(this._element || window)(e);
  }
  _scrollTo(e, t = null, s = null) {
    this._end !== null && this._end(), e.behavior === "smooth" ? (this._setDestination(e), this._retarget = t, this._end = s) : this._resetScrollState(), this._nativeScrollTo(e);
  }
  _setDestination(e) {
    let { top: t, left: s } = e;
    return t = t === void 0 ? void 0 : Math.max(0, Math.min(t, this.maxScrollTop)), s = s === void 0 ? void 0 : Math.max(0, Math.min(s, this.maxScrollLeft)), this._destination !== null && s === this._destination.left && t === this._destination.top ? !1 : (this.__destination = { top: t, left: s, behavior: "smooth" }, !0);
  }
  _resetScrollState() {
    this.__destination = null, this._retarget = null, this._end = null;
  }
  _updateManagedScrollTo(e) {
    this._destination && this._setDestination(e) && this._nativeScrollTo(this._destination);
  }
  managedScrollTo(e, t, s) {
    return this._scrollTo(e, t, s), this._updateManagedScrollTo;
  }
  correctScrollError(e) {
    this.correctingScrollError = !0, requestAnimationFrame(() => requestAnimationFrame(() => this.correctingScrollError = !1)), this._nativeScrollTo(e), this._retarget && this._setDestination(this._retarget()), this._destination && this._nativeScrollTo(this._destination);
  }
  _checkForArrival() {
    if (this._destination !== null) {
      const { scrollTop: e, scrollLeft: t } = this;
      let { top: s, left: r } = this._destination;
      s = Math.min(s || 0, this.maxScrollTop), r = Math.min(r || 0, this.maxScrollLeft);
      const o = Math.abs(s - e), n = Math.abs(r - t);
      o < 1 && n < 1 && (this._end && this._end(), this._resetScrollState());
    }
  }
  detach(e) {
    return this._clients.delete(e), this._clients.size === 0 && (this._node.scrollTo = this._originalScrollTo, this._node.scrollBy = this._originalScrollBy, this._node.scroll = this._originalScroll, this._node.removeEventListener("scroll", this._checkForArrival)), null;
  }
  _attach(e) {
    this._clients.add(e), this._clients.size === 1 && (this._node.scrollTo = this.scrollTo, this._node.scrollBy = this.scrollBy, this._node.scroll = this.scrollTo, this._node.addEventListener("scroll", this._checkForArrival));
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let Ke = typeof window < "u" ? window.ResizeObserver : void 0;
const Ce = Symbol("virtualizerRef"), de = "virtualizer-sizer";
let Ge;
class ni {
  constructor(e) {
    if (this._benchmarkStart = null, this._layout = null, this._clippingAncestors = [], this._scrollSize = null, this._scrollError = null, this._childrenPos = null, this._childMeasurements = null, this._toBeMeasured = /* @__PURE__ */ new Map(), this._rangeChanged = !0, this._itemsChanged = !0, this._visibilityChanged = !0, this._scrollerController = null, this._isScroller = !1, this._sizer = null, this._hostElementRO = null, this._childrenRO = null, this._mutationObserver = null, this._scrollEventListeners = [], this._scrollEventListenerOptions = {
      passive: !0
    }, this._loadListener = this._childLoaded.bind(this), this._scrollIntoViewTarget = null, this._updateScrollIntoViewCoordinates = null, this._items = [], this._first = -1, this._last = -1, this._firstVisible = -1, this._lastVisible = -1, this._scheduled = /* @__PURE__ */ new WeakSet(), this._measureCallback = null, this._measureChildOverride = null, this._layoutCompletePromise = null, this._layoutCompleteResolver = null, this._layoutCompleteRejecter = null, this._pendingLayoutComplete = null, this._layoutInitialized = null, this._connected = !1, !e)
      throw new Error("Virtualizer constructor requires a configuration object");
    if (e.hostElement)
      this._init(e);
    else
      throw new Error('Virtualizer configuration requires the "hostElement" property');
  }
  set items(e) {
    Array.isArray(e) && e !== this._items && (this._itemsChanged = !0, this._items = e, this._schedule(this._updateLayout));
  }
  _init(e) {
    this._isScroller = !!e.scroller, this._initHostElement(e);
    const t = e.layout || {};
    this._layoutInitialized = this._initLayout(t);
  }
  _initObservers() {
    this._mutationObserver = new MutationObserver(this._finishDOMUpdate.bind(this)), this._hostElementRO = new Ke(() => this._hostElementSizeChanged()), this._childrenRO = new Ke(this._childrenSizeChanged.bind(this));
  }
  _initHostElement(e) {
    const t = this._hostElement = e.hostElement;
    this._applyVirtualizerStyles(), t[Ce] = this;
  }
  connected() {
    this._initObservers();
    const e = this._isScroller;
    this._clippingAncestors = hi(this._hostElement, e), this._scrollerController = new oi(this, this._clippingAncestors[0]), this._schedule(this._updateLayout), this._observeAndListen(), this._connected = !0;
  }
  _observeAndListen() {
    this._mutationObserver.observe(this._hostElement, { childList: !0 }), this._hostElementRO.observe(this._hostElement), this._scrollEventListeners.push(window), window.addEventListener("scroll", this, this._scrollEventListenerOptions), this._clippingAncestors.forEach((e) => {
      e.addEventListener("scroll", this, this._scrollEventListenerOptions), this._scrollEventListeners.push(e), this._hostElementRO.observe(e);
    }), this._hostElementRO.observe(this._scrollerController.element), this._children.forEach((e) => this._childrenRO.observe(e)), this._scrollEventListeners.forEach((e) => e.addEventListener("scroll", this, this._scrollEventListenerOptions));
  }
  disconnected() {
    this._scrollEventListeners.forEach((e) => e.removeEventListener("scroll", this, this._scrollEventListenerOptions)), this._scrollEventListeners = [], this._clippingAncestors = [], this._scrollerController?.detach(this), this._scrollerController = null, this._mutationObserver?.disconnect(), this._mutationObserver = null, this._hostElementRO?.disconnect(), this._hostElementRO = null, this._childrenRO?.disconnect(), this._childrenRO = null, this._rejectLayoutCompletePromise("disconnected"), this._connected = !1;
  }
  _applyVirtualizerStyles() {
    const t = this._hostElement.style;
    t.display = t.display || "block", t.position = t.position || "relative", t.contain = t.contain || "size layout", this._isScroller && (t.overflow = t.overflow || "auto", t.minHeight = t.minHeight || "150px");
  }
  _getSizer() {
    const e = this._hostElement;
    if (!this._sizer) {
      let t = e.querySelector(`[${de}]`);
      t || (t = document.createElement("div"), t.setAttribute(de, ""), e.appendChild(t)), Object.assign(t.style, {
        position: "absolute",
        margin: "-2px 0 0 0",
        padding: 0,
        visibility: "hidden",
        fontSize: "2px"
      }), t.textContent = "&nbsp;", t.setAttribute(de, ""), this._sizer = t;
    }
    return this._sizer;
  }
  async updateLayoutConfig(e) {
    await this._layoutInitialized;
    const t = e.type || // The new config is compatible with the current layout,
    // so we update the config and return true to indicate
    // a successful update
    Ge;
    if (typeof t == "function" && this._layout instanceof t) {
      const s = { ...e };
      return delete s.type, this._layout.config = s, !0;
    }
    return !1;
  }
  async _initLayout(e) {
    let t, s;
    if (typeof e.type == "function") {
      s = e.type;
      const r = { ...e };
      delete r.type, t = r;
    } else
      t = e;
    s === void 0 && (Ge = s = (await Promise.resolve().then(() => Hi)).FlowLayout), this._layout = new s((r) => this._handleLayoutMessage(r), t), this._layout.measureChildren && typeof this._layout.updateItemSizes == "function" && (typeof this._layout.measureChildren == "function" && (this._measureChildOverride = this._layout.measureChildren), this._measureCallback = this._layout.updateItemSizes.bind(this._layout)), this._layout.listenForChildLoadEvents && this._hostElement.addEventListener("load", this._loadListener, !0), this._schedule(this._updateLayout);
  }
  // TODO (graynorton): Rework benchmarking so that it has no API and
  // instead is always on except in production builds
  startBenchmarking() {
    this._benchmarkStart === null && (this._benchmarkStart = window.performance.now());
  }
  stopBenchmarking() {
    if (this._benchmarkStart !== null) {
      const e = window.performance.now(), t = e - this._benchmarkStart, r = performance.getEntriesByName("uv-virtualizing", "measure").filter((o) => o.startTime >= this._benchmarkStart && o.startTime < e).reduce((o, n) => o + n.duration, 0);
      return this._benchmarkStart = null, { timeElapsed: t, virtualizationTime: r };
    }
    return null;
  }
  _measureChildren() {
    const e = {}, t = this._children, s = this._measureChildOverride || this._measureChild;
    for (let r = 0; r < t.length; r++) {
      const o = t[r], n = this._first + r;
      (this._itemsChanged || this._toBeMeasured.has(o)) && (e[n] = s.call(this, o, this._items[n]));
    }
    this._childMeasurements = e, this._schedule(this._updateLayout), this._toBeMeasured.clear();
  }
  /**
   * Returns the width, height, and margins of the given child.
   */
  _measureChild(e) {
    const { width: t, height: s } = e.getBoundingClientRect();
    return Object.assign({ width: t, height: s }, li(e));
  }
  async _schedule(e) {
    this._scheduled.has(e) || (this._scheduled.add(e), await Promise.resolve(), this._scheduled.delete(e), e.call(this));
  }
  async _updateDOM(e) {
    this._scrollSize = e.scrollSize, this._adjustRange(e.range), this._childrenPos = e.childPositions, this._scrollError = e.scrollError || null;
    const { _rangeChanged: t, _itemsChanged: s } = this;
    this._visibilityChanged && (this._notifyVisibility(), this._visibilityChanged = !1), (t || s) && (this._notifyRange(), this._rangeChanged = !1), this._finishDOMUpdate();
  }
  _finishDOMUpdate() {
    this._connected && (this._children.forEach((e) => this._childrenRO.observe(e)), this._checkScrollIntoViewTarget(this._childrenPos), this._positionChildren(this._childrenPos), this._sizeHostElement(this._scrollSize), this._correctScrollError(), this._benchmarkStart && "mark" in window.performance && window.performance.mark("uv-end"));
  }
  _updateLayout() {
    this._layout && this._connected && (this._layout.items = this._items, this._updateView(), this._childMeasurements !== null && (this._measureCallback && this._measureCallback(this._childMeasurements), this._childMeasurements = null), this._layout.reflowIfNeeded(), this._benchmarkStart && "mark" in window.performance && window.performance.mark("uv-end"));
  }
  _handleScrollEvent() {
    if (this._benchmarkStart && "mark" in window.performance) {
      try {
        window.performance.measure("uv-virtualizing", "uv-start", "uv-end");
      } catch (e) {
        console.warn("Error measuring performance data: ", e);
      }
      window.performance.mark("uv-start");
    }
    this._scrollerController.correctingScrollError === !1 && this._layout?.unpin(), this._schedule(this._updateLayout);
  }
  handleEvent(e) {
    switch (e.type) {
      case "scroll":
        (e.currentTarget === window || this._clippingAncestors.includes(e.currentTarget)) && this._handleScrollEvent();
        break;
      default:
        console.warn("event not handled", e);
    }
  }
  _handleLayoutMessage(e) {
    e.type === "stateChanged" ? this._updateDOM(e) : e.type === "visibilityChanged" ? (this._firstVisible = e.firstVisible, this._lastVisible = e.lastVisible, this._notifyVisibility()) : e.type === "unpinned" && this._hostElement.dispatchEvent(new we());
  }
  get _children() {
    const e = [];
    let t = this._hostElement.firstElementChild;
    for (; t; )
      t.hasAttribute(de) || e.push(t), t = t.nextElementSibling;
    return e;
  }
  _updateView() {
    const e = this._hostElement, t = this._scrollerController?.element, s = this._layout;
    if (e && t && s) {
      let r, o, n, a;
      const l = e.getBoundingClientRect();
      r = 0, o = 0, n = window.innerHeight, a = window.innerWidth;
      const h = this._clippingAncestors.map((A) => A.getBoundingClientRect());
      h.unshift(l);
      for (const A of h)
        r = Math.max(r, A.top), o = Math.max(o, A.left), n = Math.min(n, A.bottom), a = Math.min(a, A.right);
      const d = t.getBoundingClientRect(), c = {
        left: l.left - d.left,
        top: l.top - d.top
      }, f = {
        width: t.scrollWidth,
        height: t.scrollHeight
      }, _ = r - l.top + e.scrollTop, b = o - l.left + e.scrollLeft, S = Math.max(0, n - r), Y = Math.max(0, a - o);
      s.viewportSize = { width: Y, height: S }, s.viewportScroll = { top: _, left: b }, s.totalScrollSize = f, s.offsetWithinScroller = c;
    }
  }
  /**
   * Styles the host element so that its size reflects the
   * total size of all items.
   */
  _sizeHostElement(e) {
    const s = e && e.width !== null ? Math.min(82e5, e.width) : 0, r = e && e.height !== null ? Math.min(82e5, e.height) : 0;
    if (this._isScroller)
      this._getSizer().style.transform = `translate(${s}px, ${r}px)`;
    else {
      const o = this._hostElement.style;
      o.minWidth = s ? `${s}px` : "100%", o.minHeight = r ? `${r}px` : "100%";
    }
  }
  /**
   * Sets the top and left transform style of the children from the values in
   * pos.
   */
  _positionChildren(e) {
    e && e.forEach(({ top: t, left: s, width: r, height: o, xOffset: n, yOffset: a }, l) => {
      const h = this._children[l - this._first];
      h && (h.style.position = "absolute", h.style.boxSizing = "border-box", h.style.transform = `translate(${s}px, ${t}px)`, r !== void 0 && (h.style.width = r + "px"), o !== void 0 && (h.style.height = o + "px"), h.style.left = n === void 0 ? null : n + "px", h.style.top = a === void 0 ? null : a + "px");
    });
  }
  async _adjustRange(e) {
    const { _first: t, _last: s, _firstVisible: r, _lastVisible: o } = this;
    this._first = e.first, this._last = e.last, this._firstVisible = e.firstVisible, this._lastVisible = e.lastVisible, this._rangeChanged = this._rangeChanged || this._first !== t || this._last !== s, this._visibilityChanged = this._visibilityChanged || this._firstVisible !== r || this._lastVisible !== o;
  }
  _correctScrollError() {
    if (this._scrollError) {
      const { scrollTop: e, scrollLeft: t } = this._scrollerController, { top: s, left: r } = this._scrollError;
      this._scrollError = null, this._scrollerController.correctScrollError({
        top: e - s,
        left: t - r
      });
    }
  }
  element(e) {
    return e === 1 / 0 && (e = this._items.length - 1), this._items?.[e] === void 0 ? void 0 : {
      scrollIntoView: (t = {}) => this._scrollElementIntoView({ ...t, index: e })
    };
  }
  _scrollElementIntoView(e) {
    if (e.index >= this._first && e.index <= this._last)
      this._children[e.index - this._first].scrollIntoView(e);
    else if (e.index = Math.min(e.index, this._items.length - 1), e.behavior === "smooth") {
      const t = this._layout.getScrollIntoViewCoordinates(e), { behavior: s } = e;
      this._updateScrollIntoViewCoordinates = this._scrollerController.managedScrollTo(Object.assign(t, { behavior: s }), () => this._layout.getScrollIntoViewCoordinates(e), () => this._scrollIntoViewTarget = null), this._scrollIntoViewTarget = e;
    } else
      this._layout.pin = e;
  }
  /**
   * If we are smoothly scrolling to an element and the target element
   * is in the DOM, we update our target coordinates as needed
   */
  _checkScrollIntoViewTarget(e) {
    const { index: t } = this._scrollIntoViewTarget || {};
    t && e?.has(t) && this._updateScrollIntoViewCoordinates(this._layout.getScrollIntoViewCoordinates(this._scrollIntoViewTarget));
  }
  /**
   * Emits a rangechange event with the current first, last, firstVisible, and
   * lastVisible.
   */
  _notifyRange() {
    this._hostElement.dispatchEvent(new ye({ first: this._first, last: this._last }));
  }
  _notifyVisibility() {
    this._hostElement.dispatchEvent(new xe({
      first: this._firstVisible,
      last: this._lastVisible
    }));
  }
  get layoutComplete() {
    return this._layoutCompletePromise || (this._layoutCompletePromise = new Promise((e, t) => {
      this._layoutCompleteResolver = e, this._layoutCompleteRejecter = t;
    })), this._layoutCompletePromise;
  }
  _rejectLayoutCompletePromise(e) {
    this._layoutCompleteRejecter !== null && this._layoutCompleteRejecter(e), this._resetLayoutCompleteState();
  }
  _scheduleLayoutComplete() {
    this._layoutCompletePromise && this._pendingLayoutComplete === null && (this._pendingLayoutComplete = requestAnimationFrame(() => requestAnimationFrame(() => this._resolveLayoutCompletePromise())));
  }
  _resolveLayoutCompletePromise() {
    this._layoutCompleteResolver !== null && this._layoutCompleteResolver(), this._resetLayoutCompleteState();
  }
  _resetLayoutCompleteState() {
    this._layoutCompletePromise = null, this._layoutCompleteResolver = null, this._layoutCompleteRejecter = null, this._pendingLayoutComplete = null;
  }
  /**
   * Render and update the view at the next opportunity with the given
   * hostElement size.
   */
  _hostElementSizeChanged() {
    this._schedule(this._updateLayout);
  }
  // TODO (graynorton): Rethink how this works. Probably child loading is too specific
  // to have dedicated support for; might want some more generic lifecycle hooks for
  // layouts to use. Possibly handle measurement this way, too, or maybe that remains
  // a first-class feature?
  _childLoaded() {
  }
  // This is the callback for the ResizeObserver that watches the
  // virtualizer's children. We land here at the end of every virtualizer
  // update cycle that results in changes to physical items, and we also
  // end up here if one or more children change size independently of
  // the virtualizer update cycle.
  _childrenSizeChanged(e) {
    if (this._layout?.measureChildren) {
      for (const t of e)
        this._toBeMeasured.set(t.target, t.contentRect);
      this._measureChildren();
    }
    this._scheduleLayoutComplete(), this._itemsChanged = !1, this._rangeChanged = !1;
  }
}
function li(i) {
  const e = window.getComputedStyle(i);
  return {
    marginTop: pe(e.marginTop),
    marginRight: pe(e.marginRight),
    marginBottom: pe(e.marginBottom),
    marginLeft: pe(e.marginLeft)
  };
}
function pe(i) {
  const e = i ? parseFloat(i) : NaN;
  return Number.isNaN(e) ? 0 : e;
}
function Ze(i) {
  if (i.assignedSlot !== null)
    return i.assignedSlot;
  if (i.parentElement !== null)
    return i.parentElement;
  const e = i.parentNode;
  return e && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && e.host || null;
}
function ai(i, e = !1) {
  const t = [];
  let s = e ? i : Ze(i);
  for (; s !== null; )
    t.push(s), s = Ze(s);
  return t;
}
function hi(i, e = !1) {
  let t = !1;
  return ai(i, e).filter((s) => {
    if (t)
      return !1;
    const r = getComputedStyle(s);
    return t = r.position === "fixed", r.overflow !== "visible";
  });
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = (i) => i, at = (i, e) => u`${e}: ${JSON.stringify(i, null, 2)}`;
class ci extends ii {
  constructor(e) {
    if (super(e), this._virtualizer = null, this._first = 0, this._last = -1, this._renderItem = (t, s) => at(t, s + this._first), this._keyFunction = (t, s) => lt(t, s + this._first), this._items = [], e.type !== Me.CHILD)
      throw new Error("The virtualize directive can only be used in child expressions");
  }
  render(e) {
    e && this._setFunctions(e);
    const t = [];
    if (this._first >= 0 && this._last >= this._first)
      for (let s = this._first; s <= this._last; s++)
        t.push(this._items[s]);
    return si(t, this._keyFunction, this._renderItem);
  }
  update(e, [t]) {
    this._setFunctions(t);
    const s = this._items !== t.items;
    return this._items = t.items || [], this._virtualizer ? this._updateVirtualizerConfig(e, t) : this._initialize(e, t), s ? M : this.render();
  }
  async _updateVirtualizerConfig(e, t) {
    if (!await this._virtualizer.updateLayoutConfig(t.layout || {})) {
      const r = e.parentNode;
      this._makeVirtualizer(r, t);
    }
    this._virtualizer.items = this._items;
  }
  _setFunctions(e) {
    const { renderItem: t, keyFunction: s } = e;
    t && (this._renderItem = (r, o) => t(r, o + this._first)), s && (this._keyFunction = (r, o) => s(r, o + this._first));
  }
  _makeVirtualizer(e, t) {
    this._virtualizer && this._virtualizer.disconnected();
    const { layout: s, scroller: r, items: o } = t;
    this._virtualizer = new ni({ hostElement: e, layout: s, scroller: r }), this._virtualizer.items = o, this._virtualizer.connected();
  }
  _initialize(e, t) {
    const s = e.parentNode;
    s && s.nodeType === 1 && (s.addEventListener("rangeChanged", (r) => {
      this._first = r.first, this._last = r.last, this.setValue(this.render());
    }), this._makeVirtualizer(s, t));
  }
  disconnected() {
    this._virtualizer?.disconnected();
  }
  reconnected() {
    this._virtualizer?.connected();
  }
}
const di = rt(ci);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class K extends x {
  constructor() {
    super(...arguments), this.items = [], this.renderItem = at, this.keyFunction = lt, this.layout = {}, this.scroller = !1;
  }
  createRenderRoot() {
    return this;
  }
  render() {
    const { items: e, renderItem: t, keyFunction: s, layout: r, scroller: o } = this;
    return u`${di({
      items: e,
      renderItem: t,
      keyFunction: s,
      layout: r,
      scroller: o
    })}`;
  }
  element(e) {
    return this[Ce]?.element(e);
  }
  get layoutComplete() {
    return this[Ce]?.layoutComplete;
  }
  /**
   * This scrollToIndex() shim is here to provide backwards compatibility with other 0.x versions of
   * lit-virtualizer. It is deprecated and will likely be removed in the 1.0.0 release.
   */
  scrollToIndex(e, t = "start") {
    this.element(e)?.scrollIntoView({ block: t });
  }
}
ae([
  p({ attribute: !1 })
], K.prototype, "items", void 0);
ae([
  p()
], K.prototype, "renderItem", void 0);
ae([
  p()
], K.prototype, "keyFunction", void 0);
ae([
  p({ attribute: !1 })
], K.prototype, "layout", void 0);
ae([
  p({ reflect: !0, type: Boolean })
], K.prototype, "scroller", void 0);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
customElements.define("lit-virtualizer", K);
var pi = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, G = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? ui(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && pi(e, t, r), r;
};
let D = class extends x {
  constructor() {
    super(...arguments), this.entities = [], this.areas = [], this.devices = [], this.selection = /* @__PURE__ */ new Set(), this.entityIdsWithState = /* @__PURE__ */ new Set();
  }
  _areaName(i) {
    return i ? this.areas.find((e) => e.area_id === i)?.name ?? i : "—";
  }
  _deviceAreaId(i) {
    return i ? this.devices.find((e) => e.id === i)?.area_id ?? null : null;
  }
  _displayName(i) {
    return i.name ?? i.original_name ?? i.entity_id;
  }
  _stateLabel(i) {
    return i.disabled_by ? "Disabled" : i.hidden_by ? "Hidden" : this.entityIdsWithState.has(i.entity_id) ? "Active" : "No data";
  }
  _stateClass(i) {
    return i.disabled_by ? "state-disabled" : i.hidden_by ? "state-hidden" : this.entityIdsWithState.has(i.entity_id) ? "" : "state-nodata";
  }
  _toggle(i) {
    this.dispatchEvent(
      new CustomEvent("toggle-entity", {
        detail: i,
        bubbles: !0,
        composed: !0
      })
    );
  }
  _toggleAll(i) {
    const e = i.target.checked;
    this.dispatchEvent(
      new CustomEvent("toggle-all-visible", {
        detail: e,
        bubbles: !0,
        composed: !0
      })
    );
  }
  _allVisibleSelected() {
    if (this.entities.length === 0) return !1;
    for (const i of this.entities)
      if (!this.selection.has(i.entity_id)) return !1;
    return !0;
  }
  render() {
    const i = this._allVisibleSelected();
    return u`
      <div class="grid">
        <div class="head row">
          <div class="cell cell-check">
            <input
              type="checkbox"
              .checked=${i}
              .indeterminate=${!i && this.selection.size > 0}
              @change=${this._toggleAll}
              aria-label="Select all visible"
            />
          </div>
          <div class="cell">Name</div>
          <div class="cell hide-on-narrow">Entity ID</div>
          <div class="cell">Area</div>
          <div class="cell hide-on-narrow">Integration</div>
          <div class="cell">State</div>
        </div>
        <lit-virtualizer
          scroller
          .items=${this.entities}
          .renderItem=${(e) => {
      const t = this.selection.has(e.entity_id), s = e.area_id ?? this._deviceAreaId(e.device_id), r = [
        "row",
        "body",
        t ? "selected" : "",
        e.disabled_by ? "is-disabled" : "",
        e.hidden_by ? "is-hidden" : ""
      ].filter(Boolean).join(" "), o = this._stateLabel(e), n = this._stateClass(e);
      return u`
              <div
                class=${r}
                @click=${() => this._toggle(e.entity_id)}
              >
                <div class="cell cell-check">
                  <input
                    type="checkbox"
                    .checked=${t}
                    @click=${(a) => a.stopPropagation()}
                    @change=${() => this._toggle(e.entity_id)}
                    aria-label=${`Select ${e.entity_id}`}
                  />
                </div>
                <div class="cell">
                  <div class="primary-name">${this._displayName(e)}</div>
                  <div class="secondary-id">${e.entity_id}</div>
                </div>
                <div class="cell mono hide-on-narrow">${e.entity_id}</div>
                <div class="cell">${this._areaName(s)}</div>
                <div class="cell hide-on-narrow">${e.platform}</div>
                <div class="cell">
                  <span class="state-pill ${n}">${o}</span>
                </div>
              </div>
            `;
    }}
        ></lit-virtualizer>
      </div>
    `;
  }
};
D.styles = C`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
    .grid {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      background: var(--card-background-color, #fff);
    }
    lit-virtualizer {
      flex: 1 1 auto;
      min-height: 0;
    }
    .row {
      display: grid;
      grid-template-columns: 48px minmax(140px, 2fr) minmax(200px, 2fr) minmax(
          120px,
          1fr
        ) minmax(100px, 1fr) 90px;
      align-items: center;
      font-size: 14px;
      /* lit-virtualizer positions body rows absolutely, which strips their
         automatic 100% width. Without this, fr tracks collapse to their
         minimums and misalign with the header row (which IS 100% wide). */
      width: 100%;
      box-sizing: border-box;
    }
    .head {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      font-weight: 500;
    }
    .body {
      border-bottom: 1px solid var(--divider-color, #f0f0f0);
      cursor: pointer;
    }
    .body:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .body.selected {
      background: color-mix(
        in srgb,
        var(--primary-color, #03a9f4) 10%,
        transparent
      );
    }
    .body.is-disabled .cell:not(.cell-check) {
      opacity: 0.55;
      font-style: italic;
    }
    .body.is-hidden .cell:not(.cell-check) {
      opacity: 0.75;
    }
    .state-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: color-mix(
        in srgb,
        var(--success-color, #2e7d32) 15%,
        transparent
      );
      color: var(--success-color, #2e7d32);
    }
    .state-pill.state-disabled {
      background: color-mix(
        in srgb,
        var(--error-color, #db4437) 15%,
        transparent
      );
      color: var(--error-color, #db4437);
    }
    .state-pill.state-hidden {
      background: color-mix(
        in srgb,
        var(--warning-color, #ff9800) 15%,
        transparent
      );
      color: var(--warning-color, #e65100);
    }
    .state-pill.state-nodata {
      background: var(--secondary-background-color, #ececec);
      color: var(--secondary-text-color, #727272);
      border: 1px dashed var(--divider-color, #c0c0c0);
    }
    .primary-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .secondary-id {
      display: none;
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 11px;
      color: var(--secondary-text-color, #727272);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    @media (max-width: 1439px) {
      .hide-on-narrow {
        display: none !important;
      }
      .row {
        grid-template-columns: 44px minmax(120px, 2fr) minmax(80px, 1fr) 80px;
      }
      .secondary-id {
        display: block;
      }
      .cell {
        padding: 8px 10px;
      }
      .cell-check {
        padding: 8px 0 8px 12px;
      }
    }
    .cell {
      padding: 10px 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      /* Grid items default to min-width: auto (= min-content), which lets
         a long unbreakable entity_id push its track wider than the fr unit
         would allocate — producing slightly different column widths per
         row. min-width: 0 lets the column shrink and the ellipsis kick in. */
      min-width: 0;
    }
    .cell-check {
      padding: 10px 0 10px 16px;
    }
    .mono {
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
    }
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  `;
G([
  p({ attribute: !1 })
], D.prototype, "entities", 2);
G([
  p({ attribute: !1 })
], D.prototype, "areas", 2);
G([
  p({ attribute: !1 })
], D.prototype, "devices", 2);
G([
  p({ attribute: !1 })
], D.prototype, "selection", 2);
G([
  p({ attribute: !1 })
], D.prototype, "entityIdsWithState", 2);
D = G([
  E("bee-entity-table")
], D);
var _i = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, ht = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? fi(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && _i(e, t, r), r;
};
let be = class extends x {
  constructor() {
    super(...arguments), this.count = 0;
  }
  _emit(i) {
    this.dispatchEvent(
      new CustomEvent("bulk-action", {
        detail: i,
        bubbles: !0,
        composed: !0
      })
    );
  }
  _clear() {
    this.dispatchEvent(
      new CustomEvent("clear-selection", { bubbles: !0, composed: !0 })
    );
  }
  render() {
    return this.count === 0 ? null : u`
      <div class="bar" role="toolbar" aria-label="Bulk actions">
        <div class="count">
          <span><strong>${this.count}</strong> selected</span>
          <button class="link" @click=${this._clear}>Clear</button>
        </div>
        <div class="actions">
          <button @click=${() => this._emit("change-area")}>
            Change area
          </button>
          <button @click=${() => this._emit("enable-disable")}>
            Enable / disable
          </button>
          <button @click=${() => this._emit("show-hide")}>
            Show / hide
          </button>
          <button @click=${() => this._emit("rename")}>Rename</button>
        </div>
      </div>
    `;
  }
};
be.styles = C`
    :host {
      display: block;
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-radius: 0 0 12px 12px;
    }
    .count {
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      white-space: nowrap;
    }
    .link {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.6);
      color: inherit;
      font: inherit;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    .link:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .actions {
      display: flex;
      gap: 6px;
      flex: 1 1 auto;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .actions button {
      font: inherit;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 6px;
      border: 0;
      background: rgba(255, 255, 255, 0.18);
      color: inherit;
      cursor: pointer;
      white-space: nowrap;
      flex: 0 0 auto;
    }
    .actions button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
    }
    .actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @media (max-width: 1439px) {
      .bar {
        padding: 10px 12px;
        gap: 10px;
        flex-direction: column;
        align-items: stretch;
      }
      .count {
        font-size: 12px;
        justify-content: space-between;
      }
      /* Even 2×2 grid so all four actions are always visible on mobile
         without horizontal scrolling or hidden items. */
      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        justify-content: stretch;
      }
      .actions button {
        padding: 8px 10px;
        font-size: 13px;
        width: 100%;
      }
    }
  `;
ht([
  p({ type: Number })
], be.prototype, "count", 2);
be = ht([
  E("bee-action-bar")
], be);
var gi = Object.defineProperty, mi = Object.getOwnPropertyDescriptor, Z = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? mi(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && gi(e, t, r), r;
};
let O = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.areas = [], this.count = 0, this.running = !1, this._selectedAreaId = "";
  }
  willUpdate(i) {
    i.has("open") && this.open && (this._selectedAreaId = "");
  }
  _close() {
    this.dispatchEvent(
      new CustomEvent("dialog-close", { bubbles: !0, composed: !0 })
    );
  }
  _apply() {
    this.dispatchEvent(
      new CustomEvent("apply-area", {
        detail: this._selectedAreaId === "" ? null : this._selectedAreaId,
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    return u`
      <bee-modal
        .open=${this.open}
        heading="Change area"
        @modal-close=${this._close}
      >
        <p class="desc">
          Set the area for <strong>${this.count}</strong> selected
          ${this.count === 1 ? "entity" : "entities"}.
        </p>

        <label>
          <span>New area</span>
          <bee-select
            .value=${this._selectedAreaId}
            .options=${[
      { value: "", label: "— No area —" },
      ...this.areas.map((i) => ({
        value: i.area_id,
        label: i.name
      }))
    ]}
            placeholder="Choose an area"
            ?disabled=${this.running}
            @select-change=${(i) => this._selectedAreaId = i.detail}
          ></bee-select>
        </label>

        <p class="note">
          This overrides the device's inherited area for the selected
          entities.
        </p>

        <div slot="footer">
          <button
            class="btn"
            @click=${this._close}
            ?disabled=${this.running}
          >
            Cancel
          </button>
          <button
            class="btn primary"
            @click=${this._apply}
            ?disabled=${this.running}
          >
            ${this.running ? "Applying…" : "Apply"}
          </button>
        </div>
      </bee-modal>
    `;
  }
};
O.styles = C`
    .desc {
      margin: 0 0 16px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label span {
      font-size: 13px;
      color: var(--secondary-text-color, #727272);
    }
    .note {
      margin: 12px 0 0;
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .btn {
      font: inherit;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
    }
    .btn:hover:not(:disabled) {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .btn.primary:hover:not(:disabled) {
      filter: brightness(0.95);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
Z([
  p({ type: Boolean })
], O.prototype, "open", 2);
Z([
  p({ attribute: !1 })
], O.prototype, "areas", 2);
Z([
  p({ type: Number })
], O.prototype, "count", 2);
Z([
  p({ type: Boolean })
], O.prototype, "running", 2);
Z([
  m()
], O.prototype, "_selectedAreaId", 2);
O = Z([
  E("bee-change-area-dialog")
], O);
var bi = Object.defineProperty, vi = Object.getOwnPropertyDescriptor, he = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? vi(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && bi(e, t, r), r;
};
let N = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.selected = [], this.running = !1, this._mode = "disable";
  }
  willUpdate(i) {
    if (i.has("open") && this.open) {
      const e = this.selected.filter(
        (s) => s.disabled_by !== null
      ).length, t = this.selected.length - e;
      this._mode = t >= e ? "disable" : "enable";
    }
  }
  _close() {
    this.dispatchEvent(
      new CustomEvent("dialog-close", { bubbles: !0, composed: !0 })
    );
  }
  _apply() {
    this.dispatchEvent(
      new CustomEvent("apply-enable-disable", {
        detail: this._mode,
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    const i = this.selected.filter((o) => o.disabled_by !== null), e = this.selected.filter((o) => o.disabled_by === null), t = i.filter((o) => o.disabled_by !== "user"), s = this._mode === "enable" ? i.length : e.length, r = this._mode === "enable" ? e.length : i.length;
    return u`
      <bee-modal
        .open=${this.open}
        heading="Enable / disable entities"
        @modal-close=${this._close}
      >
        <div class="segmented" role="radiogroup">
          <button
            role="radio"
            aria-checked=${this._mode === "enable"}
            class=${this._mode === "enable" ? "on" : ""}
            @click=${() => this._mode = "enable"}
            ?disabled=${this.running}
          >
            Enable
          </button>
          <button
            role="radio"
            aria-checked=${this._mode === "disable"}
            class=${this._mode === "disable" ? "on" : ""}
            @click=${() => this._mode = "disable"}
            ?disabled=${this.running}
          >
            Disable
          </button>
        </div>

        <dl class="stats">
          <div>
            <dt>Will ${this._mode}</dt>
            <dd><strong>${s}</strong></dd>
          </div>
          <div class="muted">
            <dt>Already ${this._mode === "enable" ? "enabled" : "disabled"}</dt>
            <dd>${r}</dd>
          </div>
        </dl>

        ${this._mode === "enable" && t.length > 0 ? u`
              <div class="warn">
                <strong>${t.length}</strong> of these were
                disabled by their integration or device (not by a user).
                Re-enabling them may not stick — Home Assistant can disable
                them again on reload.
              </div>
            ` : g}

        <p class="note">
          Disabled entities stop receiving state updates and are hidden from
          default dashboards.
        </p>

        <div slot="footer">
          <button class="btn" @click=${this._close} ?disabled=${this.running}>
            Cancel
          </button>
          <button
            class="btn primary"
            @click=${this._apply}
            ?disabled=${this.running || s === 0}
          >
            ${this.running ? "Applying…" : `${this._mode === "enable" ? "Enable" : "Disable"} ${s}`}
          </button>
        </div>
      </bee-modal>
    `;
  }
};
N.styles = C`
    .segmented {
      display: inline-flex;
      border: 1px solid var(--divider-color, #d0d0d0);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .segmented button {
      font: inherit;
      padding: 8px 16px;
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border: 0;
      cursor: pointer;
    }
    .segmented button + button {
      border-left: 1px solid var(--divider-color, #d0d0d0);
    }
    .segmented button.on {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }
    .segmented button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .stats {
      display: flex;
      gap: 24px;
      margin: 0 0 12px;
    }
    .stats div {
      display: flex;
      flex-direction: column;
    }
    .stats dt {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stats dd {
      margin: 0;
      font-size: 20px;
    }
    .stats .muted dd {
      color: var(--secondary-text-color, #727272);
    }
    .warn {
      padding: 10px 12px;
      border-radius: 8px;
      background: color-mix(
        in srgb,
        var(--warning-color, #ff9800) 15%,
        transparent
      );
      border: 1px solid
        color-mix(in srgb, var(--warning-color, #ff9800) 50%, transparent);
      font-size: 13px;
      margin-bottom: 12px;
    }
    .note {
      margin: 0;
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .btn {
      font: inherit;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
    }
    .btn:hover:not(:disabled) {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .btn.primary:hover:not(:disabled) {
      filter: brightness(0.95);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
he([
  p({ type: Boolean })
], N.prototype, "open", 2);
he([
  p({ attribute: !1 })
], N.prototype, "selected", 2);
he([
  p({ type: Boolean })
], N.prototype, "running", 2);
he([
  m()
], N.prototype, "_mode", 2);
N = he([
  E("bee-enable-disable-dialog")
], N);
var yi = Object.defineProperty, xi = Object.getOwnPropertyDescriptor, ce = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? xi(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && yi(e, t, r), r;
};
let U = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.selected = [], this.running = !1, this._mode = "hide";
  }
  willUpdate(i) {
    if (i.has("open") && this.open) {
      const e = this.selected.filter(
        (s) => s.hidden_by !== null
      ).length, t = this.selected.length - e;
      this._mode = t >= e ? "hide" : "show";
    }
  }
  _close() {
    this.dispatchEvent(
      new CustomEvent("dialog-close", { bubbles: !0, composed: !0 })
    );
  }
  _apply() {
    this.dispatchEvent(
      new CustomEvent("apply-show-hide", {
        detail: this._mode,
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    const i = this.selected.filter((o) => o.hidden_by !== null), e = this.selected.filter((o) => o.hidden_by === null), t = i.filter((o) => o.hidden_by !== "user"), s = this._mode === "show" ? i.length : e.length, r = this._mode === "show" ? e.length : i.length;
    return u`
      <bee-modal
        .open=${this.open}
        heading="Show / hide entities"
        @modal-close=${this._close}
      >
        <div class="segmented" role="radiogroup">
          <button
            role="radio"
            aria-checked=${this._mode === "show"}
            class=${this._mode === "show" ? "on" : ""}
            @click=${() => this._mode = "show"}
            ?disabled=${this.running}
          >
            Show
          </button>
          <button
            role="radio"
            aria-checked=${this._mode === "hide"}
            class=${this._mode === "hide" ? "on" : ""}
            @click=${() => this._mode = "hide"}
            ?disabled=${this.running}
          >
            Hide
          </button>
        </div>

        <dl class="stats">
          <div>
            <dt>Will ${this._mode}</dt>
            <dd><strong>${s}</strong></dd>
          </div>
          <div class="muted">
            <dt>Already ${this._mode === "show" ? "shown" : "hidden"}</dt>
            <dd>${r}</dd>
          </div>
        </dl>

        ${this._mode === "show" && t.length > 0 ? u`
              <div class="warn">
                <strong>${t.length}</strong> of these were hidden
                by their integration (not by a user). Showing them may not
                stick.
              </div>
            ` : g}

        <p class="note">
          Hidden entities stay active but are excluded from default dashboards
          and auto-generated views.
        </p>

        <div slot="footer">
          <button class="btn" @click=${this._close} ?disabled=${this.running}>
            Cancel
          </button>
          <button
            class="btn primary"
            @click=${this._apply}
            ?disabled=${this.running || s === 0}
          >
            ${this.running ? "Applying…" : `${this._mode === "show" ? "Show" : "Hide"} ${s}`}
          </button>
        </div>
      </bee-modal>
    `;
  }
};
U.styles = C`
    .segmented {
      display: inline-flex;
      border: 1px solid var(--divider-color, #d0d0d0);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .segmented button {
      font: inherit;
      padding: 8px 16px;
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border: 0;
      cursor: pointer;
    }
    .segmented button + button {
      border-left: 1px solid var(--divider-color, #d0d0d0);
    }
    .segmented button.on {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }
    .segmented button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .stats {
      display: flex;
      gap: 24px;
      margin: 0 0 12px;
    }
    .stats div {
      display: flex;
      flex-direction: column;
    }
    .stats dt {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stats dd {
      margin: 0;
      font-size: 20px;
    }
    .stats .muted dd {
      color: var(--secondary-text-color, #727272);
    }
    .warn {
      padding: 10px 12px;
      border-radius: 8px;
      background: color-mix(
        in srgb,
        var(--warning-color, #ff9800) 15%,
        transparent
      );
      border: 1px solid
        color-mix(in srgb, var(--warning-color, #ff9800) 50%, transparent);
      font-size: 13px;
      margin-bottom: 12px;
    }
    .note {
      margin: 0;
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .btn {
      font: inherit;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
    }
    .btn:hover:not(:disabled) {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .btn.primary:hover:not(:disabled) {
      filter: brightness(0.95);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
ce([
  p({ type: Boolean })
], U.prototype, "open", 2);
ce([
  p({ attribute: !1 })
], U.prototype, "selected", 2);
ce([
  p({ type: Boolean })
], U.prototype, "running", 2);
ce([
  m()
], U.prototype, "_mode", 2);
U = ce([
  E("bee-show-hide-dialog")
], U);
const wi = /^[a-z0-9_]+\.[a-z0-9_]+$/, $i = /[.*+?^${}()|[\]\\]/g, Si = (i) => i.replace($i, "\\$&"), Ci = (i, e) => e === "entity_id" ? i.entity_id : i.name ?? i.original_name ?? "", Ei = (i, e) => {
  if (!e.find) return i;
  if (e.regex)
    try {
      const t = new RegExp(
        e.find,
        e.caseSensitive ? "g" : "gi"
      );
      return i.replace(t, e.replace);
    } catch {
      return i;
    }
  return e.caseSensitive ? i.split(e.find).join(e.replace) : i.replace(
    new RegExp(Si(e.find), "gi"),
    e.replace
  );
}, _e = (i, e) => {
  switch (e.mode) {
    case "prefix":
      return e.text + i;
    case "suffix":
      return i + e.text;
    case "find-replace":
      return Ei(i, e);
  }
}, Ai = (i, e) => {
  if (e.mode === "find-replace") return _e(i, e);
  const t = i.indexOf(".");
  if (t < 0) return _e(i, e);
  const s = i.slice(0, t), r = i.slice(t + 1);
  return `${s}.${_e(r, e)}`;
};
function zi(i) {
  if (i.mode === "find-replace" && i.regex && i.find)
    try {
      new RegExp(i.find);
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid regex";
    }
  return null;
}
function ki(i, e, t) {
  const s = zi(t), r = new Set(i.map((l) => l.entity_id)), o = /* @__PURE__ */ new Set();
  for (const l of e)
    r.has(l) || o.add(l);
  const n = i.map((l) => {
    const h = Ci(l, t.target), d = t.target === "entity_id" ? Ai(l.entity_id, t) : _e(h, t);
    return {
      entityId: l.entity_id,
      currentValue: h,
      newValue: d,
      error: null,
      changed: d !== h
    };
  });
  if (s) {
    for (const l of n) l.error = s;
    return n;
  }
  if (t.target !== "entity_id") return n;
  const a = /* @__PURE__ */ new Map();
  for (const l of n)
    a.set(l.newValue, (a.get(l.newValue) ?? 0) + 1);
  for (const l of n) {
    if (!wi.test(l.newValue)) {
      l.error = "Invalid entity_id — must be lowercase letters, digits, underscores, and one dot.";
      continue;
    }
    const h = l.entityId.split(".", 1)[0] ?? "", d = l.newValue.split(".", 1)[0] ?? "";
    if (d !== h) {
      l.error = `Cannot change domain (${h} → ${d})`;
      continue;
    }
    if (o.has(l.newValue)) {
      l.error = "Conflicts with an existing entity";
      continue;
    }
    if ((a.get(l.newValue) ?? 0) > 1) {
      l.error = "Two or more entities would collide on this new ID";
      continue;
    }
  }
  return n;
}
function Pi(i) {
  let e = 0, t = 0, s = 0;
  for (const r of i)
    r.error ? s += 1 : r.changed ? e += 1 : t += 1;
  return { applicable: e, unchanged: t, errors: s };
}
var Mi = Object.defineProperty, Ii = Object.getOwnPropertyDescriptor, $ = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? Ii(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && Mi(e, t, r), r;
};
let w = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.selected = [], this.allEntityIds = [], this.running = !1, this._target = "friendly_name", this._mode = "prefix", this._text = "", this._find = "", this._replace = "", this._regex = !1, this._caseSensitive = !0;
  }
  willUpdate(i) {
    i.has("open") && this.open && (this._target = "friendly_name", this._mode = "prefix", this._text = "", this._find = "", this._replace = "", this._regex = !1, this._caseSensitive = !0);
  }
  get _options() {
    return {
      target: this._target,
      mode: this._mode,
      text: this._text,
      find: this._find,
      replace: this._replace,
      regex: this._regex,
      caseSensitive: this._caseSensitive
    };
  }
  get _rows() {
    return ki(this.selected, this.allEntityIds, this._options);
  }
  _close() {
    this.dispatchEvent(
      new CustomEvent("dialog-close", { bubbles: !0, composed: !0 })
    );
  }
  _apply() {
    const i = this._rows.filter((e) => !e.error && e.changed);
    this.dispatchEvent(
      new CustomEvent(
        "apply-rename",
        {
          detail: { target: this._target, rows: i },
          bubbles: !0,
          composed: !0
        }
      )
    );
  }
  render() {
    const i = this._rows, e = Pi(i), t = i.some((r) => r.error !== null), s = this.running || e.applicable === 0 || t;
    return u`
      <bee-modal
        .open=${this.open}
        heading="Rename entities"
        @modal-close=${this._close}
      >
        <div class="body">
          <div class="row">
            <label class="field">
              <span>Target</span>
              <bee-select
                .value=${this._target}
                .options=${[
      { value: "friendly_name", label: "Friendly name" },
      { value: "entity_id", label: "Entity ID" }
    ]}
                ?disabled=${this.running}
                @select-change=${(r) => this._target = r.detail}
              ></bee-select>
            </label>

            <label class="field">
              <span>Mode</span>
              <bee-select
                .value=${this._mode}
                .options=${[
      { value: "prefix", label: "Add prefix" },
      { value: "suffix", label: "Add suffix" },
      { value: "find-replace", label: "Find & replace" }
    ]}
                ?disabled=${this.running}
                @select-change=${(r) => this._mode = r.detail}
              ></bee-select>
            </label>
          </div>

          ${this._target === "entity_id" ? u`
                <div class="warn">
                  <strong>Renaming entity IDs is risky.</strong> Home
                  Assistant will not automatically update automations,
                  scripts, dashboards, or templates that reference the old
                  IDs. You'll need to update those by hand.
                </div>
              ` : g}

          ${this._mode === "prefix" || this._mode === "suffix" ? u`
                <label class="field">
                  <span
                    >${this._mode === "prefix" ? "Prefix text" : "Suffix text"}</span
                  >
                  <input
                    type="text"
                    .value=${this._text}
                    @input=${(r) => this._text = r.target.value}
                    placeholder=${this._target === "entity_id" ? "e.g. kitchen_" : "e.g. Kitchen - "}
                    ?disabled=${this.running}
                  />
                </label>
              ` : u`
                <div class="row">
                  <label class="field">
                    <span>Find</span>
                    <input
                      type="text"
                      .value=${this._find}
                      @input=${(r) => this._find = r.target.value}
                      ?disabled=${this.running}
                    />
                  </label>
                  <label class="field">
                    <span>Replace with</span>
                    <input
                      type="text"
                      .value=${this._replace}
                      @input=${(r) => this._replace = r.target.value}
                      ?disabled=${this.running}
                    />
                  </label>
                </div>
                <div class="opts">
                  <label class="check">
                    <input
                      type="checkbox"
                      .checked=${this._regex}
                      @change=${(r) => this._regex = r.target.checked}
                      ?disabled=${this.running}
                    />
                    Use regex (<code>$1</code> etc. in Replace)
                  </label>
                  <label class="check">
                    <input
                      type="checkbox"
                      .checked=${this._caseSensitive}
                      @change=${(r) => this._caseSensitive = r.target.checked}
                      ?disabled=${this.running}
                    />
                    Case-sensitive
                  </label>
                </div>
              `}

          <dl class="stats">
            <div>
              <dt>Will rename</dt>
              <dd><strong>${e.applicable}</strong></dd>
            </div>
            <div class="muted">
              <dt>Unchanged</dt>
              <dd>${e.unchanged}</dd>
            </div>
            <div class=${e.errors > 0 ? "err" : "muted"}>
              <dt>Errors</dt>
              <dd>${e.errors}</dd>
            </div>
          </dl>

          <div class="preview">
            <div class="preview-head">Preview</div>
            <div class="preview-scroll">
              <lit-virtualizer
                scroller
                .items=${i}
                .renderItem=${(r) => u`
                  <div
                    class="preview-row ${r.error ? "has-error" : r.changed ? "will-change" : "unchanged"}"
                  >
                    <div class="old">${r.currentValue || "—"}</div>
                    <div class="arrow">→</div>
                    <div class="new">${r.newValue || "—"}</div>
                    ${r.error ? u`<div class="err-msg">${r.error}</div>` : r.changed ? g : u`<div class="unchanged-msg">no change</div>`}
                  </div>
                `}
              ></lit-virtualizer>
            </div>
          </div>
        </div>

        <div slot="footer">
          <button class="btn" @click=${this._close} ?disabled=${this.running}>
            Cancel
          </button>
          <button
            class="btn primary"
            @click=${this._apply}
            ?disabled=${s}
          >
            ${this.running ? "Applying…" : e.applicable === 0 ? "Nothing to rename" : t ? "Fix errors to continue" : `Rename ${e.applicable}`}
          </button>
        </div>
      </bee-modal>
    `;
  }
};
w.styles = C`
    :host {
      display: contents;
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      justify-content: flex-start;
    }
    .row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    /* Inside a horizontal .row, fields share the width. As a direct child
       of the flex-column .body, we must NOT set flex-basis — otherwise the
       basis is interpreted along the column's main axis (height) and the
       field balloons to 180px tall. */
    .row .field {
      flex: 1 1 180px;
      min-width: 160px;
    }
    .field span {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    input[type="text"] {
      font: inherit;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
    }
    input[type="text"]:focus {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: -1px;
    }
    .opts {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 13px;
    }
    .check {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .warn {
      padding: 10px 12px;
      border-radius: 8px;
      background: color-mix(
        in srgb,
        var(--error-color, #db4437) 12%,
        transparent
      );
      border: 1px solid
        color-mix(in srgb, var(--error-color, #db4437) 50%, transparent);
      font-size: 13px;
    }
    .stats {
      display: flex;
      gap: 24px;
      margin: 0;
    }
    .stats div {
      display: flex;
      flex-direction: column;
    }
    .stats dt {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stats dd {
      margin: 0;
      font-size: 20px;
    }
    .stats .muted dd {
      color: var(--secondary-text-color, #727272);
    }
    .stats .err dd {
      color: var(--error-color, #db4437);
    }
    .preview {
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      min-height: 120px;
      max-height: 320px;
      flex: 0 1 auto;
    }
    .preview-head {
      padding: 8px 12px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      font-weight: 500;
      font-size: 13px;
    }
    .preview-scroll {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
    }
    lit-virtualizer {
      flex: 1 1 auto;
      min-height: 0;
    }
    .preview-row {
      display: grid;
      grid-template-columns: 1fr 24px 1fr auto;
      gap: 8px;
      padding: 6px 12px;
      font-size: 13px;
      align-items: baseline;
      border-bottom: 1px solid var(--divider-color, #f0f0f0);
      font-family: var(--code-font-family, ui-monospace, monospace);
    }
    .old,
    .new {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .arrow {
      color: var(--secondary-text-color, #727272);
      text-align: center;
    }
    .will-change .new {
      color: var(--primary-color, #03a9f4);
    }
    .unchanged .new,
    .unchanged .old {
      color: var(--secondary-text-color, #727272);
    }
    .has-error .new {
      color: var(--error-color, #db4437);
      text-decoration: line-through;
    }
    .err-msg {
      color: var(--error-color, #db4437);
      font-family: inherit;
      font-size: 12px;
    }
    .unchanged-msg {
      color: var(--secondary-text-color, #727272);
      font-family: inherit;
      font-size: 12px;
      font-style: italic;
    }
    .btn {
      font: inherit;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
    }
    .btn:hover:not(:disabled) {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .btn.primary:hover:not(:disabled) {
      filter: brightness(0.95);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
$([
  p({ type: Boolean })
], w.prototype, "open", 2);
$([
  p({ attribute: !1 })
], w.prototype, "selected", 2);
$([
  p({ attribute: !1 })
], w.prototype, "allEntityIds", 2);
$([
  p({ type: Boolean })
], w.prototype, "running", 2);
$([
  m()
], w.prototype, "_target", 2);
$([
  m()
], w.prototype, "_mode", 2);
$([
  m()
], w.prototype, "_text", 2);
$([
  m()
], w.prototype, "_find", 2);
$([
  m()
], w.prototype, "_replace", 2);
$([
  m()
], w.prototype, "_regex", 2);
$([
  m()
], w.prototype, "_caseSensitive", 2);
w = $([
  E("bee-rename-dialog")
], w);
var Di = Object.defineProperty, Oi = Object.getOwnPropertyDescriptor, Ie = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? Oi(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && Di(e, t, r), r;
};
let le = class extends x {
  constructor() {
    super(...arguments), this.open = !1, this.progress = null;
  }
  _close() {
    this.dispatchEvent(
      new CustomEvent("dialog-close", { bubbles: !0, composed: !0 })
    );
  }
  _retryFailed() {
    if (!this.progress) return;
    const i = this.progress.results.filter((e) => !e.ok).map((e) => e.id);
    this.dispatchEvent(
      new CustomEvent("retry-failed", {
        detail: i,
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    const i = this.progress, e = i != null && i.done < i.total, t = i != null && i.failed > 0;
    return u`
      <bee-modal
        .open=${this.open}
        heading=${e ? "Applying…" : "Done"}
        @modal-close=${this._close}
      >
        ${i ? u`
              <div class="summary">
                <div class="counts">
                  <span class="ok">${i.succeeded} succeeded</span>
                  ${i.failed > 0 ? u`<span class="err">${i.failed} failed</span>` : g}
                  <span class="total">of ${i.total}</span>
                </div>
                <div class="bar">
                  <div
                    class="fill"
                    style="width: ${i.total === 0 ? 0 : i.done / i.total * 100}%"
                  ></div>
                </div>
              </div>

              ${t ? u`
                    <details open>
                      <summary>Failures</summary>
                      <ul class="failures">
                        ${i.results.filter((s) => !s.ok).map(
      (s) => u`
                              <li>
                                <code>${s.id}</code>
                                <span class="msg">${s.error}</span>
                              </li>
                            `
    )}
                      </ul>
                    </details>
                  ` : g}
            ` : g}

        <div slot="footer">
          ${t && !e ? u`
                <button class="btn" @click=${this._retryFailed}>
                  Retry failed
                </button>
              ` : g}
          <button
            class="btn primary"
            @click=${this._close}
            ?disabled=${e}
          >
            ${e ? "Running…" : "Close"}
          </button>
        </div>
      </bee-modal>
    `;
  }
};
le.styles = C`
    .summary {
      margin-bottom: 16px;
    }
    .counts {
      display: flex;
      gap: 12px;
      align-items: baseline;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .ok {
      color: var(--success-color, #2e7d32);
      font-weight: 500;
    }
    .err {
      color: var(--error-color, #db4437);
      font-weight: 500;
    }
    .total {
      color: var(--secondary-text-color, #727272);
    }
    .bar {
      height: 6px;
      background: var(--divider-color, #e0e0e0);
      border-radius: 3px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--primary-color, #03a9f4);
      transition: width 120ms linear;
    }
    details {
      margin-top: 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      padding: 8px 12px;
    }
    summary {
      cursor: pointer;
      font-weight: 500;
    }
    .failures {
      list-style: none;
      padding: 8px 0 0;
      margin: 0;
      max-height: 240px;
      overflow: auto;
    }
    .failures li {
      padding: 6px 0;
      border-top: 1px solid var(--divider-color, #f0f0f0);
      font-size: 13px;
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }
    .failures code {
      font-family: var(--code-font-family, ui-monospace, monospace);
    }
    .msg {
      color: var(--error-color, #db4437);
      text-align: right;
    }
    .btn {
      font: inherit;
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #d0d0d0);
      background: var(--primary-background-color, #fff);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
    }
    .btn:hover:not(:disabled) {
      background: var(--secondary-background-color, #f5f5f5);
    }
    .btn.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .btn.primary:hover:not(:disabled) {
      filter: brightness(0.95);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
Ie([
  p({ type: Boolean })
], le.prototype, "open", 2);
Ie([
  p({ attribute: !1 })
], le.prototype, "progress", 2);
le = Ie([
  E("bee-results-dialog")
], le);
var Ri = Object.defineProperty, Ti = Object.getOwnPropertyDescriptor, y = (i, e, t, s) => {
  for (var r = s > 1 ? void 0 : s ? Ti(e, t) : e, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(e, t, r) : n(r)) || r);
  return s && r && Ri(e, t, r), r;
};
let v = class extends x {
  constructor() {
    super(...arguments), this.narrow = !1, this._entities = [], this._areas = [], this._devices = [], this._entityIdsWithState = /* @__PURE__ */ new Set(), this._loading = !0, this._error = null, this._filters = { ...L }, this._selection = /* @__PURE__ */ new Set(), this._activeDialog = null, this._running = !1, this._progress = null, this._resultsOpen = !1, this._lastRun = null, this._unsubscribers = [], this._onFiltersChange = (i) => {
      this._filters = { ...this._filters, ...i.detail };
    }, this._onFiltersReset = () => {
      this._filters = { ...L };
    }, this._onToggleEntity = (i) => {
      const e = new Set(this._selection);
      e.has(i.detail) ? e.delete(i.detail) : e.add(i.detail), this._selection = e;
    }, this._onToggleAllVisible = (i) => {
      const e = new Set(this._selection), t = this._filteredEntities;
      if (i.detail)
        for (const s of t) e.add(s.entity_id);
      else
        for (const s of t) e.delete(s.entity_id);
      this._selection = e;
    }, this._onClearSelection = () => {
      this._selection = /* @__PURE__ */ new Set();
    }, this._onBulkAction = (i) => {
      this._activeDialog = i.detail;
    }, this._onDialogClose = () => {
      this._running || (this._activeDialog = null);
    }, this._onResultsClose = () => {
      this._resultsOpen = !1, this._progress = null, this._lastRun = null;
    }, this._onApplyArea = (i) => {
      this._uniformUpdate("change-area", [...this._selection], {
        area_id: i.detail
      });
    }, this._onApplyEnableDisable = (i) => {
      const e = i.detail, t = this._selectedEntities.filter(
        (s) => e === "enable" ? s.disabled_by !== null : s.disabled_by === null
      ).map((s) => s.entity_id);
      this._uniformUpdate("enable-disable", t, {
        disabled_by: e === "enable" ? null : "user"
      });
    }, this._onApplyShowHide = (i) => {
      const e = i.detail, t = this._selectedEntities.filter(
        (s) => e === "show" ? s.hidden_by !== null : s.hidden_by === null
      ).map((s) => s.entity_id);
      this._uniformUpdate("show-hide", t, {
        hidden_by: e === "show" ? null : "user"
      });
    }, this._onApplyRename = (i) => {
      const { target: e, rows: t } = i.detail, s = t.map((r) => ({
        id: r.entityId,
        fields: e === "entity_id" ? { new_entity_id: r.newValue } : { name: r.newValue === "" ? null : r.newValue }
      }));
      this._executeUpdate("rename", s);
    }, this._onRetryFailed = (i) => {
      const e = i.detail;
      if (e.length === 0 || !this._lastRun) return;
      const t = new Set(e), { action: s, items: r } = this._lastRun, o = r.filter((n) => t.has(n.id));
      this._resultsOpen = !1, this._executeUpdate(s, o);
    };
  }
  connectedCallback() {
    super.connectedCallback(), this._loadData(), this._subscribeToRegistryUpdates();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    for (const i of this._unsubscribers) i();
    this._unsubscribers = [];
  }
  async _loadData() {
    if (this.hass) {
      this._loading = this._entities.length === 0, this._error = null;
      try {
        const [i, e, t, s] = await Promise.all([
          this.hass.callWS({
            type: "config/entity_registry/list"
          }),
          this.hass.callWS({ type: "config/area_registry/list" }),
          this.hass.callWS({ type: "config/device_registry/list" }),
          this.hass.callWS({ type: "get_states" })
        ]);
        this._entities = i, this._areas = e, this._devices = t, this._entityIdsWithState = new Set(s.map((r) => r.entity_id));
      } catch (i) {
        this._error = i instanceof Error ? i.message : String(i);
      } finally {
        this._loading = !1;
      }
    }
  }
  async _subscribeToRegistryUpdates() {
    if (!this.hass) return;
    const i = [
      "entity_registry_updated",
      "area_registry_updated",
      "device_registry_updated"
    ];
    let e = null;
    const t = () => {
      e && clearTimeout(e), e = setTimeout(() => {
        e = null, this._loadData();
      }, 300);
    };
    for (const s of i) {
      const r = await this.hass.connection.subscribeEvents(t, s);
      this._unsubscribers.push(r);
    }
  }
  get _filteredEntities() {
    return Vt(
      this._entities,
      this._devices,
      this._filters,
      this._entityIdsWithState
    );
  }
  get _selectedEntities() {
    return this._entities.filter((i) => this._selection.has(i.entity_id));
  }
  async _executeUpdate(i, e) {
    if (!this.hass || e.length === 0) return;
    this._lastRun = { action: i, items: e }, this._running = !0, this._progress = {
      total: e.length,
      done: 0,
      succeeded: 0,
      failed: 0,
      results: []
    }, this._resultsOpen = !0;
    const t = this.hass, s = await Ut({
      items: e,
      idOf: (o) => o.id,
      concurrency: 8,
      run: async (o) => {
        await t.callWS({
          type: "config/entity_registry/update",
          entity_id: o.id,
          ...o.fields
        });
      },
      onProgress: (o) => {
        this._progress = o;
      }
    });
    this._progress = s, this._running = !1, this._activeDialog = null;
    const r = new Set(
      s.results.filter((o) => o.ok).map((o) => o.id)
    );
    if (r.size > 0) {
      const o = new Set(this._selection);
      for (const n of r) o.delete(n);
      this._selection = o;
    }
  }
  _uniformUpdate(i, e, t) {
    return this._executeUpdate(
      i,
      e.map((s) => ({ id: s, fields: t }))
    );
  }
  _formatBuildTime() {
    try {
      return (/* @__PURE__ */ new Date("2026-04-19T02:51:35.773Z")).toLocaleString(void 0, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "2026-04-19T02:51:35.773Z";
    }
  }
  render() {
    const i = this._filteredEntities, e = this._entities.map((t) => t.entity_id);
    return u`
      <div class="app-bar">
        <ha-menu-button
          .hass=${this.hass}
          .narrow=${this.narrow}
        ></ha-menu-button>
        <div class="app-bar-title">Bulk Entity Editor</div>
        <div class="app-bar-spacer"></div>
        <div class="app-bar-count">
          ${this._loading ? "Loading…" : `${i.length} of ${this._entities.length}`}
        </div>
      </div>

      <div class="page">
        ${this._error ? u`<div class="error">Error: ${this._error}</div>` : g}

        <div class="card">
          <bee-filter-bar
            .filters=${this._filters}
            .domains=${Bt(this._entities)}
            .integrations=${Nt(this._entities)}
            .areas=${this._areas}
            @filters-change=${this._onFiltersChange}
            @filters-reset=${this._onFiltersReset}
          ></bee-filter-bar>

          <div class="table-host">
            ${this._loading ? u`<div class="loading">Loading entities…</div>` : u`
                  <bee-entity-table
                    .entities=${i}
                    .areas=${this._areas}
                    .devices=${this._devices}
                    .selection=${this._selection}
                    .entityIdsWithState=${this._entityIdsWithState}
                    @toggle-entity=${this._onToggleEntity}
                    @toggle-all-visible=${this._onToggleAllVisible}
                  ></bee-entity-table>
                `}
          </div>

          <bee-action-bar
            .count=${this._selection.size}
            @bulk-action=${this._onBulkAction}
            @clear-selection=${this._onClearSelection}
          ></bee-action-bar>
        </div>

        <bee-change-area-dialog
          .open=${this._activeDialog === "change-area"}
          .areas=${this._areas}
          .count=${this._selection.size}
          .running=${this._running}
          @dialog-close=${this._onDialogClose}
          @apply-area=${this._onApplyArea}
        ></bee-change-area-dialog>

        <bee-enable-disable-dialog
          .open=${this._activeDialog === "enable-disable"}
          .selected=${this._selectedEntities}
          .running=${this._running}
          @dialog-close=${this._onDialogClose}
          @apply-enable-disable=${this._onApplyEnableDisable}
        ></bee-enable-disable-dialog>

        <bee-show-hide-dialog
          .open=${this._activeDialog === "show-hide"}
          .selected=${this._selectedEntities}
          .running=${this._running}
          @dialog-close=${this._onDialogClose}
          @apply-show-hide=${this._onApplyShowHide}
        ></bee-show-hide-dialog>

        <bee-rename-dialog
          .open=${this._activeDialog === "rename"}
          .selected=${this._selectedEntities}
          .allEntityIds=${e}
          .running=${this._running}
          @dialog-close=${this._onDialogClose}
          @apply-rename=${this._onApplyRename}
        ></bee-rename-dialog>

        <bee-results-dialog
          .open=${this._resultsOpen}
          .progress=${this._progress}
          @dialog-close=${this._onResultsClose}
          @retry-failed=${this._onRetryFailed}
        ></bee-results-dialog>

        <footer class="build-info">
          v${"0.2.0"} · built ${this._formatBuildTime()}
        </footer>
      </div>
    `;
  }
};
v.styles = C`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
    .app-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 56px;
      padding: 0 4px 0 4px;
      background: var(
        --app-header-background-color,
        var(--primary-background-color, #fafafa)
      );
      color: var(
        --app-header-text-color,
        var(--primary-text-color, #212121)
      );
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      flex: 0 0 auto;
    }
    ha-menu-button {
      flex: 0 0 auto;
      --mdc-icon-button-size: 40px;
    }
    .app-bar-title {
      font-size: 20px;
      font-weight: 400;
      line-height: 56px;
      flex: 0 0 auto;
      padding-left: 4px;
    }
    .app-bar-spacer {
      flex: 1 1 auto;
    }
    .app-bar-count {
      color: var(--secondary-text-color, #727272);
      font-size: 13px;
      flex: 0 0 auto;
      padding-right: 16px;
    }
    .page {
      padding: 16px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    @media (max-width: 700px) {
      .page {
        padding: 8px;
      }
      .app-bar-title {
        font-size: 18px;
      }
      .app-bar-count {
        font-size: 12px;
        padding-right: 8px;
      }
    }
    .error {
      padding: 12px 16px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--error-color, #db4437);
      color: #fff;
      margin-bottom: 16px;
    }
    .card {
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(
        --ha-card-box-shadow,
        0 1px 3px rgba(0, 0, 0, 0.08),
        0 1px 1px rgba(0, 0, 0, 0.05)
      );
      border: var(--ha-card-border-width, 1px) solid
        var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .table-host {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }
    .loading {
      padding: 48px;
      text-align: center;
      color: var(--secondary-text-color, #727272);
    }
    .build-info {
      margin-top: 12px;
      font-size: 11px;
      color: var(--secondary-text-color, #727272);
      opacity: 0.6;
      text-align: right;
      font-family: var(--code-font-family, ui-monospace, monospace);
    }
  `;
y([
  p({ attribute: !1 })
], v.prototype, "hass", 2);
y([
  p({ attribute: !1 })
], v.prototype, "narrow", 2);
y([
  p({ attribute: !1 })
], v.prototype, "route", 2);
y([
  p({ attribute: !1 })
], v.prototype, "panel", 2);
y([
  m()
], v.prototype, "_entities", 2);
y([
  m()
], v.prototype, "_areas", 2);
y([
  m()
], v.prototype, "_devices", 2);
y([
  m()
], v.prototype, "_entityIdsWithState", 2);
y([
  m()
], v.prototype, "_loading", 2);
y([
  m()
], v.prototype, "_error", 2);
y([
  m()
], v.prototype, "_filters", 2);
y([
  m()
], v.prototype, "_selection", 2);
y([
  m()
], v.prototype, "_activeDialog", 2);
y([
  m()
], v.prototype, "_running", 2);
y([
  m()
], v.prototype, "_progress", 2);
y([
  m()
], v.prototype, "_resultsOpen", 2);
v = y([
  E("bulk-entity-editor-panel")
], v);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class Ye {
  constructor(e) {
    this._map = /* @__PURE__ */ new Map(), this._roundAverageSize = !1, this.totalSize = 0, e?.roundAverageSize === !0 && (this._roundAverageSize = !0);
  }
  set(e, t) {
    const s = this._map.get(e) || 0;
    this._map.set(e, t), this.totalSize += t - s;
  }
  get averageSize() {
    if (this._map.size > 0) {
      const e = this.totalSize / this._map.size;
      return this._roundAverageSize ? Math.round(e) : e;
    }
    return 0;
  }
  getSize(e) {
    return this._map.get(e);
  }
  clear() {
    this._map.clear(), this.totalSize = 0;
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ct(i) {
  return i === "horizontal" ? "width" : "height";
}
class Li {
  _getDefaultConfig() {
    return {
      direction: "vertical"
    };
  }
  constructor(e, t) {
    this._latestCoords = { left: 0, top: 0 }, this._direction = null, this._viewportSize = { width: 0, height: 0 }, this.totalScrollSize = { width: 0, height: 0 }, this.offsetWithinScroller = { left: 0, top: 0 }, this._pendingReflow = !1, this._pendingLayoutUpdate = !1, this._pin = null, this._firstVisible = 0, this._lastVisible = 0, this._physicalMin = 0, this._physicalMax = 0, this._first = -1, this._last = -1, this._sizeDim = "height", this._secondarySizeDim = "width", this._positionDim = "top", this._secondaryPositionDim = "left", this._scrollPosition = 0, this._scrollError = 0, this._items = [], this._scrollSize = 1, this._overhang = 1e3, this._hostSink = e, Promise.resolve().then(() => this.config = t || this._getDefaultConfig());
  }
  set config(e) {
    Object.assign(this, Object.assign({}, this._getDefaultConfig(), e));
  }
  get config() {
    return {
      direction: this.direction
    };
  }
  /**
   * Maximum index of children + 1, to help estimate total height of the scroll
   * space.
   */
  get items() {
    return this._items;
  }
  set items(e) {
    this._setItems(e);
  }
  _setItems(e) {
    e !== this._items && (this._items = e, this._scheduleReflow());
  }
  /**
   * Primary scrolling direction.
   */
  get direction() {
    return this._direction;
  }
  set direction(e) {
    e = e === "horizontal" ? e : "vertical", e !== this._direction && (this._direction = e, this._sizeDim = e === "horizontal" ? "width" : "height", this._secondarySizeDim = e === "horizontal" ? "height" : "width", this._positionDim = e === "horizontal" ? "left" : "top", this._secondaryPositionDim = e === "horizontal" ? "top" : "left", this._triggerReflow());
  }
  /**
   * Height and width of the viewport.
   */
  get viewportSize() {
    return this._viewportSize;
  }
  set viewportSize(e) {
    const { _viewDim1: t, _viewDim2: s } = this;
    Object.assign(this._viewportSize, e), s !== this._viewDim2 ? this._scheduleLayoutUpdate() : t !== this._viewDim1 && this._checkThresholds();
  }
  /**
   * Scroll offset of the viewport.
   */
  get viewportScroll() {
    return this._latestCoords;
  }
  set viewportScroll(e) {
    Object.assign(this._latestCoords, e);
    const t = this._scrollPosition;
    this._scrollPosition = this._latestCoords[this._positionDim], Math.abs(t - this._scrollPosition) >= 1 && this._checkThresholds();
  }
  /**
   * Perform a reflow if one has been scheduled.
   */
  reflowIfNeeded(e = !1) {
    (e || this._pendingReflow) && (this._pendingReflow = !1, this._reflow());
  }
  set pin(e) {
    this._pin = e, this._triggerReflow();
  }
  get pin() {
    if (this._pin !== null) {
      const { index: e, block: t } = this._pin;
      return {
        index: Math.max(0, Math.min(e, this.items.length - 1)),
        block: t
      };
    }
    return null;
  }
  _clampScrollPosition(e) {
    return Math.max(-this.offsetWithinScroller[this._positionDim], Math.min(e, this.totalScrollSize[ct(this.direction)] - this._viewDim1));
  }
  unpin() {
    this._pin !== null && (this._sendUnpinnedMessage(), this._pin = null);
  }
  _updateLayout() {
  }
  // protected _viewDim2Changed(): void {
  //   this._scheduleLayoutUpdate();
  // }
  /**
   * The height or width of the viewport, whichever corresponds to the scrolling direction.
   */
  get _viewDim1() {
    return this._viewportSize[this._sizeDim];
  }
  /**
   * The height or width of the viewport, whichever does NOT correspond to the scrolling direction.
   */
  get _viewDim2() {
    return this._viewportSize[this._secondarySizeDim];
  }
  _scheduleReflow() {
    this._pendingReflow = !0;
  }
  _scheduleLayoutUpdate() {
    this._pendingLayoutUpdate = !0, this._scheduleReflow();
  }
  // For triggering a reflow based on incoming changes to
  // the layout config.
  _triggerReflow() {
    this._scheduleLayoutUpdate(), Promise.resolve().then(() => this.reflowIfNeeded());
  }
  _reflow() {
    this._pendingLayoutUpdate && (this._updateLayout(), this._pendingLayoutUpdate = !1), this._updateScrollSize(), this._setPositionFromPin(), this._getActiveItems(), this._updateVisibleIndices(), this._sendStateChangedMessage();
  }
  /**
   * If we are supposed to be pinned to a particular
   * item or set of coordinates, we set `_scrollPosition`
   * accordingly and adjust `_scrollError` as needed
   * so that the virtualizer can keep the scroll
   * position in the DOM in sync
   */
  _setPositionFromPin() {
    if (this.pin !== null) {
      const e = this._scrollPosition, { index: t, block: s } = this.pin;
      this._scrollPosition = this._calculateScrollIntoViewPosition({
        index: t,
        block: s || "start"
      }) - this.offsetWithinScroller[this._positionDim], this._scrollError = e - this._scrollPosition;
    }
  }
  /**
   * Calculate the coordinates to scroll to, given
   * a request to scroll to the element at a specific
   * index.
   *
   * Supports the same positioning options (`start`,
   * `center`, `end`, `nearest`) as the standard
   * `Element.scrollIntoView()` method, but currently
   * only considers the provided value in the `block`
   * dimension, since we don't yet have any layouts
   * that support virtualization in two dimensions.
   */
  _calculateScrollIntoViewPosition(e) {
    const { block: t } = e, s = Math.min(this.items.length, Math.max(0, e.index)), r = this._getItemPosition(s)[this._positionDim];
    let o = r;
    if (t !== "start") {
      const n = this._getItemSize(s)[this._sizeDim];
      if (t === "center")
        o = r - 0.5 * this._viewDim1 + 0.5 * n;
      else {
        const a = r - this._viewDim1 + n;
        if (t === "end")
          o = a;
        else {
          const l = this._scrollPosition;
          o = Math.abs(l - r) < Math.abs(l - a) ? r : a;
        }
      }
    }
    return o += this.offsetWithinScroller[this._positionDim], this._clampScrollPosition(o);
  }
  getScrollIntoViewCoordinates(e) {
    return {
      [this._positionDim]: this._calculateScrollIntoViewPosition(e)
    };
  }
  _sendUnpinnedMessage() {
    this._hostSink({
      type: "unpinned"
    });
  }
  _sendVisibilityChangedMessage() {
    this._hostSink({
      type: "visibilityChanged",
      firstVisible: this._firstVisible,
      lastVisible: this._lastVisible
    });
  }
  _sendStateChangedMessage() {
    const e = /* @__PURE__ */ new Map();
    if (this._first !== -1 && this._last !== -1)
      for (let s = this._first; s <= this._last; s++)
        e.set(s, this._getItemPosition(s));
    const t = {
      type: "stateChanged",
      scrollSize: {
        [this._sizeDim]: this._scrollSize,
        [this._secondarySizeDim]: null
      },
      range: {
        first: this._first,
        last: this._last,
        firstVisible: this._firstVisible,
        lastVisible: this._lastVisible
      },
      childPositions: e
    };
    this._scrollError && (t.scrollError = {
      [this._positionDim]: this._scrollError,
      [this._secondaryPositionDim]: 0
    }, this._scrollError = 0), this._hostSink(t);
  }
  /**
   * Number of items to display.
   */
  get _num() {
    return this._first === -1 || this._last === -1 ? 0 : this._last - this._first + 1;
  }
  _checkThresholds() {
    if (this._viewDim1 === 0 && this._num > 0 || this._pin !== null)
      this._scheduleReflow();
    else {
      const e = Math.max(0, this._scrollPosition - this._overhang), t = Math.min(this._scrollSize, this._scrollPosition + this._viewDim1 + this._overhang);
      this._physicalMin > e || this._physicalMax < t ? this._scheduleReflow() : this._updateVisibleIndices({ emit: !0 });
    }
  }
  /**
   * Find the indices of the first and last items to intersect the viewport.
   * Emit a visibleindiceschange event when either index changes.
   */
  _updateVisibleIndices(e) {
    if (this._first === -1 || this._last === -1)
      return;
    let t = this._first;
    for (; t < this._last && Math.round(this._getItemPosition(t)[this._positionDim] + this._getItemSize(t)[this._sizeDim]) <= Math.round(this._scrollPosition); )
      t++;
    let s = this._last;
    for (; s > this._first && Math.round(this._getItemPosition(s)[this._positionDim]) >= Math.round(this._scrollPosition + this._viewDim1); )
      s--;
    (t !== this._firstVisible || s !== this._lastVisible) && (this._firstVisible = t, this._lastVisible = s, e && e.emit && this._sendVisibilityChangedMessage());
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Je(i) {
  return i === "horizontal" ? "marginLeft" : "marginTop";
}
function Vi(i) {
  return i === "horizontal" ? "marginRight" : "marginBottom";
}
function Bi(i) {
  return i === "horizontal" ? "xOffset" : "yOffset";
}
function Ni(i, e) {
  const t = [i, e].sort();
  return t[1] <= 0 ? Math.min(...t) : t[0] >= 0 ? Math.max(...t) : t[0] + t[1];
}
class Ui {
  constructor() {
    this._childSizeCache = new Ye(), this._marginSizeCache = new Ye(), this._metricsCache = /* @__PURE__ */ new Map();
  }
  update(e, t) {
    const s = /* @__PURE__ */ new Set();
    Object.keys(e).forEach((r) => {
      const o = Number(r);
      this._metricsCache.set(o, e[o]), this._childSizeCache.set(o, e[o][ct(t)]), s.add(o), s.add(o + 1);
    });
    for (const r of s) {
      const o = this._metricsCache.get(r)?.[Je(t)] || 0, n = this._metricsCache.get(r - 1)?.[Vi(t)] || 0;
      this._marginSizeCache.set(r, Ni(o, n));
    }
  }
  get averageChildSize() {
    return this._childSizeCache.averageSize;
  }
  get totalChildSize() {
    return this._childSizeCache.totalSize;
  }
  get averageMarginSize() {
    return this._marginSizeCache.averageSize;
  }
  get totalMarginSize() {
    return this._marginSizeCache.totalSize;
  }
  getLeadingMarginValue(e, t) {
    return this._metricsCache.get(e)?.[Je(t)] || 0;
  }
  getChildSize(e) {
    return this._childSizeCache.getSize(e);
  }
  getMarginSize(e) {
    return this._marginSizeCache.getSize(e);
  }
  clear() {
    this._childSizeCache.clear(), this._marginSizeCache.clear(), this._metricsCache.clear();
  }
}
class ji extends Li {
  constructor() {
    super(...arguments), this._itemSize = { width: 100, height: 100 }, this._physicalItems = /* @__PURE__ */ new Map(), this._newPhysicalItems = /* @__PURE__ */ new Map(), this._metricsCache = new Ui(), this._anchorIdx = null, this._anchorPos = null, this._stable = !0, this._measureChildren = !0, this._estimate = !0;
  }
  // protected _defaultConfig: BaseLayoutConfig = Object.assign({}, super._defaultConfig, {
  // })
  // constructor(config: Layout1dConfig) {
  //   super(config);
  // }
  get measureChildren() {
    return this._measureChildren;
  }
  /**
   * Determine the average size of all children represented in the sizes
   * argument.
   */
  updateItemSizes(e) {
    this._metricsCache.update(e, this.direction), this._scheduleReflow();
  }
  /**
   * Set the average item size based on the total length and number of children
   * in range.
   */
  // _updateItemSize() {
  //   // Keep integer values.
  //   this._itemSize[this._sizeDim] = this._metricsCache.averageChildSize;
  // }
  _getPhysicalItem(e) {
    return this._newPhysicalItems.get(e) ?? this._physicalItems.get(e);
  }
  _getSize(e) {
    return this._getPhysicalItem(e) && this._metricsCache.getChildSize(e);
  }
  _getAverageSize() {
    return this._metricsCache.averageChildSize || this._itemSize[this._sizeDim];
  }
  _estimatePosition(e) {
    const t = this._metricsCache;
    if (this._first === -1 || this._last === -1)
      return t.averageMarginSize + e * (t.averageMarginSize + this._getAverageSize());
    if (e < this._first) {
      const s = this._first - e;
      return this._getPhysicalItem(this._first).pos - (t.getMarginSize(this._first - 1) || t.averageMarginSize) - (s * t.averageChildSize + (s - 1) * t.averageMarginSize);
    } else {
      const s = e - this._last;
      return this._getPhysicalItem(this._last).pos + (t.getChildSize(this._last) || t.averageChildSize) + (t.getMarginSize(this._last) || t.averageMarginSize) + s * (t.averageChildSize + t.averageMarginSize);
    }
  }
  /**
   * Returns the position in the scrolling direction of the item at idx.
   * Estimates it if the item at idx is not in the DOM.
   */
  _getPosition(e) {
    const t = this._getPhysicalItem(e), { averageMarginSize: s } = this._metricsCache;
    return e === 0 ? this._metricsCache.getMarginSize(0) ?? s : t ? t.pos : this._estimatePosition(e);
  }
  _calculateAnchor(e, t) {
    return e <= 0 ? 0 : t > this._scrollSize - this._viewDim1 ? this.items.length - 1 : Math.max(0, Math.min(this.items.length - 1, Math.floor((e + t) / 2 / this._delta)));
  }
  _getAnchor(e, t) {
    if (this._physicalItems.size === 0)
      return this._calculateAnchor(e, t);
    if (this._first < 0)
      return this._calculateAnchor(e, t);
    if (this._last < 0)
      return this._calculateAnchor(e, t);
    const s = this._getPhysicalItem(this._first), r = this._getPhysicalItem(this._last), o = s.pos;
    if (r.pos + this._metricsCache.getChildSize(this._last) < e)
      return this._calculateAnchor(e, t);
    if (o > t)
      return this._calculateAnchor(e, t);
    let l = this._firstVisible - 1, h = -1 / 0;
    for (; h < e; )
      h = this._getPhysicalItem(++l).pos + this._metricsCache.getChildSize(l);
    return l;
  }
  /**
   * Updates _first and _last based on items that should be in the current
   * viewed range.
   */
  _getActiveItems() {
    this._viewDim1 === 0 || this.items.length === 0 ? this._clearItems() : this._getItems();
  }
  /**
   * Sets the range to empty.
   */
  _clearItems() {
    this._first = -1, this._last = -1, this._physicalMin = 0, this._physicalMax = 0;
    const e = this._newPhysicalItems;
    this._newPhysicalItems = this._physicalItems, this._newPhysicalItems.clear(), this._physicalItems = e, this._stable = !0;
  }
  /*
   * Updates _first and _last based on items that should be in the given range.
   */
  _getItems() {
    const e = this._newPhysicalItems;
    this._stable = !0;
    let t, s;
    if (this.pin !== null) {
      const { index: h } = this.pin;
      this._anchorIdx = h, this._anchorPos = this._getPosition(h);
    }
    if (t = this._scrollPosition - this._overhang, s = this._scrollPosition + this._viewDim1 + this._overhang, s < 0 || t > this._scrollSize) {
      this._clearItems();
      return;
    }
    (this._anchorIdx === null || this._anchorPos === null) && (this._anchorIdx = this._getAnchor(t, s), this._anchorPos = this._getPosition(this._anchorIdx));
    let r = this._getSize(this._anchorIdx);
    r === void 0 && (this._stable = !1, r = this._getAverageSize());
    const o = this._metricsCache.getMarginSize(this._anchorIdx) ?? this._metricsCache.averageMarginSize, n = this._metricsCache.getMarginSize(this._anchorIdx + 1) ?? this._metricsCache.averageMarginSize;
    this._anchorIdx === 0 && (this._anchorPos = o), this._anchorIdx === this.items.length - 1 && (this._anchorPos = this._scrollSize - n - r);
    let a = 0;
    for (this._anchorPos + r + n < t && (a = t - (this._anchorPos + r + n)), this._anchorPos - o > s && (a = s - (this._anchorPos - o)), a && (this._scrollPosition -= a, t -= a, s -= a, this._scrollError += a), e.set(this._anchorIdx, { pos: this._anchorPos, size: r }), this._first = this._last = this._anchorIdx, this._physicalMin = this._anchorPos - o, this._physicalMax = this._anchorPos + r + n; this._physicalMin > t && this._first > 0; ) {
      let h = this._getSize(--this._first);
      h === void 0 && (this._stable = !1, h = this._getAverageSize());
      let d = this._metricsCache.getMarginSize(this._first);
      d === void 0 && (this._stable = !1, d = this._metricsCache.averageMarginSize), this._physicalMin -= h;
      const c = this._physicalMin;
      if (e.set(this._first, { pos: c, size: h }), this._physicalMin -= d, this._stable === !1 && this._estimate === !1)
        break;
    }
    for (; this._physicalMax < s && this._last < this.items.length - 1; ) {
      let h = this._getSize(++this._last);
      h === void 0 && (this._stable = !1, h = this._getAverageSize());
      let d = this._metricsCache.getMarginSize(this._last);
      d === void 0 && (this._stable = !1, d = this._metricsCache.averageMarginSize);
      const c = this._physicalMax;
      if (e.set(this._last, { pos: c, size: h }), this._physicalMax += h + d, !this._stable && !this._estimate)
        break;
    }
    const l = this._calculateError();
    l && (this._physicalMin -= l, this._physicalMax -= l, this._anchorPos -= l, this._scrollPosition -= l, e.forEach((h) => h.pos -= l), this._scrollError += l), this._stable && (this._newPhysicalItems = this._physicalItems, this._newPhysicalItems.clear(), this._physicalItems = e);
  }
  _calculateError() {
    return this._first === 0 ? this._physicalMin : this._physicalMin <= 0 ? this._physicalMin - this._first * this._delta : this._last === this.items.length - 1 ? this._physicalMax - this._scrollSize : this._physicalMax >= this._scrollSize ? this._physicalMax - this._scrollSize + (this.items.length - 1 - this._last) * this._delta : 0;
  }
  _reflow() {
    const { _first: e, _last: t } = this;
    super._reflow(), (this._first === -1 && this._last == -1 || this._first === e && this._last === t) && this._resetReflowState();
  }
  _resetReflowState() {
    this._anchorIdx = null, this._anchorPos = null, this._stable = !0;
  }
  _updateScrollSize() {
    const { averageMarginSize: e } = this._metricsCache;
    this._scrollSize = Math.max(1, this.items.length * (e + this._getAverageSize()) + e);
  }
  /**
   * Returns the average size (precise or estimated) of an item in the scrolling direction,
   * including any surrounding space.
   */
  get _delta() {
    const { averageMarginSize: e } = this._metricsCache;
    return this._getAverageSize() + e;
  }
  /**
   * Returns the top and left positioning of the item at idx.
   */
  _getItemPosition(e) {
    return {
      [this._positionDim]: this._getPosition(e),
      [this._secondaryPositionDim]: 0,
      [Bi(this.direction)]: -(this._metricsCache.getLeadingMarginValue(e, this.direction) ?? this._metricsCache.averageMarginSize)
    };
  }
  /**
   * Returns the height and width of the item at idx.
   */
  _getItemSize(e) {
    return {
      [this._sizeDim]: this._getSize(e) || this._getAverageSize(),
      [this._secondarySizeDim]: this._itemSize[this._secondarySizeDim]
    };
  }
  _viewDim2Changed() {
    this._metricsCache.clear(), this._scheduleReflow();
  }
}
const Hi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FlowLayout: ji
}, Symbol.toStringTag, { value: "Module" }));
export {
  v as BulkEntityEditorPanel
};
