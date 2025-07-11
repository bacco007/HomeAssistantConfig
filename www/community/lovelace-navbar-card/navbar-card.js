var __legacyDecorateClassTS = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1;i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

// node_modules/lit/node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (t.ShadyCSS === undefined || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = new WeakMap;

class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e && t2 === undefined) {
      const e2 = s2 !== undefined && s2.length === 1;
      e2 && (t2 = o.get(s2)), t2 === undefined && ((this.o = t2 = new CSSStyleSheet).replaceSync(this.cssText), e2 && o.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
}
var r = (t2) => new n(typeof t2 == "string" ? t2 : t2 + "", undefined, s);
var S = (s2, o2) => {
  if (e)
    s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else
    for (const e2 of o2) {
      const o3 = document.createElement("style"), n2 = t.litNonce;
      n2 !== undefined && o3.setAttribute("nonce", n2), o3.textContent = e2.cssText, s2.appendChild(o3);
    }
};
var c = e ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules)
    e2 += s2.cssText;
  return r(e2);
})(t2) : t2;

// node_modules/lit/node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t2, s2) => t2;
var u = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l : null;
      break;
    case Object:
    case Array:
      t2 = t2 == null ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i3 = t2;
  switch (s2) {
    case Boolean:
      i3 = t2 !== null;
      break;
    case Number:
      i3 = t2 === null ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i3 = JSON.parse(t2);
      } catch (t3) {
        i3 = null;
      }
  }
  return i3;
} };
var f = (t2, s2) => !i2(t2, s2);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= new WeakMap;

class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ??= []).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i3 = Symbol(), h2 = this.getPropertyDescriptor(t2, i3, s2);
      h2 !== undefined && e2(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i3) {
    const { get: e3, set: r3 } = h(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e3, set(s3) {
      const h2 = e3?.call(this);
      r3?.call(this, s3), this.requestUpdate(t2, h2, i3);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties")))
      return;
    const t2 = n2(this);
    t2.finalize(), t2.l !== undefined && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized")))
      return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t3 = this.properties, s2 = [...r2(t3), ...o2(t3)];
      for (const i3 of s2)
        this.createProperty(i3, t3[i3]);
    }
    const t2 = this[Symbol.metadata];
    if (t2 !== null) {
      const s2 = litPropertyMetadata.get(t2);
      if (s2 !== undefined)
        for (const [t3, i3] of s2)
          this.elementProperties.set(t3, i3);
    }
    this._$Eh = new Map;
    for (const [t3, s2] of this.elementProperties) {
      const i3 = this._$Eu(t3, s2);
      i3 !== undefined && this._$Eh.set(i3, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i3 = [];
    if (Array.isArray(s2)) {
      const e3 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e3)
        i3.unshift(c(s3));
    } else
      s2 !== undefined && i3.push(c(s2));
    return i3;
  }
  static _$Eu(t2, s2) {
    const i3 = s2.attribute;
    return i3 === false ? undefined : typeof i3 == "string" ? i3 : typeof t2 == "string" ? t2.toLowerCase() : undefined;
  }
  constructor() {
    super(), this._$Ep = undefined, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = new Map, this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t2) => t2(this));
  }
  addController(t2) {
    (this._$EO ??= new Set).add(t2), this.renderRoot !== undefined && this.isConnected && t2.hostConnected?.();
  }
  removeController(t2) {
    this._$EO?.delete(t2);
  }
  _$E_() {
    const t2 = new Map, s2 = this.constructor.elementProperties;
    for (const i3 of s2.keys())
      this.hasOwnProperty(i3) && (t2.set(i3, this[i3]), delete this[i3]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t2) => t2.hostConnected?.());
  }
  enableUpdating(t2) {}
  disconnectedCallback() {
    this._$EO?.forEach((t2) => t2.hostDisconnected?.());
  }
  attributeChangedCallback(t2, s2, i3) {
    this._$AK(t2, i3);
  }
  _$ET(t2, s2) {
    const i3 = this.constructor.elementProperties.get(t2), e3 = this.constructor._$Eu(t2, i3);
    if (e3 !== undefined && i3.reflect === true) {
      const h2 = (i3.converter?.toAttribute !== undefined ? i3.converter : u).toAttribute(s2, i3.type);
      this._$Em = t2, h2 == null ? this.removeAttribute(e3) : this.setAttribute(e3, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    const i3 = this.constructor, e3 = i3._$Eh.get(t2);
    if (e3 !== undefined && this._$Em !== e3) {
      const t3 = i3.getPropertyOptions(e3), h2 = typeof t3.converter == "function" ? { fromAttribute: t3.converter } : t3.converter?.fromAttribute !== undefined ? t3.converter : u;
      this._$Em = e3, this[e3] = h2.fromAttribute(s2, t3.type) ?? this._$Ej?.get(e3) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i3) {
    if (t2 !== undefined) {
      const e3 = this.constructor, h2 = this[t2];
      if (i3 ??= e3.getPropertyOptions(t2), !((i3.hasChanged ?? f)(h2, s2) || i3.useDefault && i3.reflect && h2 === this._$Ej?.get(t2) && !this.hasAttribute(e3._$Eu(t2, i3))))
        return;
      this.C(t2, s2, i3);
    }
    this.isUpdatePending === false && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i3, reflect: e3, wrapped: h2 }, r3) {
    i3 && !(this._$Ej ??= new Map).has(t2) && (this._$Ej.set(t2, r3 ?? s2 ?? this[t2]), h2 !== true || r3 !== undefined) || (this._$AL.has(t2) || (this.hasUpdated || i3 || (s2 = undefined), this._$AL.set(t2, s2)), e3 === true && this._$Em !== t2 && (this._$Eq ??= new Set).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return t2 != null && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t4, s3] of this._$Ep)
          this[t4] = s3;
        this._$Ep = undefined;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0)
        for (const [s3, i3] of t3) {
          const { wrapped: t4 } = i3, e3 = this[s3];
          t4 !== true || this._$AL.has(s3) || e3 === undefined || this.C(s3, undefined, i3, e3);
        }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), this._$EO?.forEach((t3) => t3.hostUpdate?.()), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {}
  _$AE(t2) {
    this._$EO?.forEach((t3) => t3.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = new Map, this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq &&= this._$Eq.forEach((t3) => this._$ET(t3, this[t3])), this._$EM();
  }
  updated(t2) {}
  firstUpdated(t2) {}
}
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = new Map, y[d("finalized")] = new Map, p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.0");

// node_modules/lit/node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = t2.trustedTypes;
var s2 = i3 ? i3.createPolicy("lit-html", { createHTML: (t3) => t3 }) : undefined;
var e3 = "$lit$";
var h2 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var o3 = "?" + h2;
var n3 = `<${o3}>`;
var r3 = document;
var l2 = () => r3.createComment("");
var c3 = (t3) => t3 === null || typeof t3 != "object" && typeof t3 != "function";
var a2 = Array.isArray;
var u2 = (t3) => a2(t3) || typeof t3?.[Symbol.iterator] == "function";
var d2 = `[ 	
\f\r]`;
var f2 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var v = /-->/g;
var _ = />/g;
var m = RegExp(`>|${d2}(?:([^\\s"'>=/]+)(${d2}*=${d2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var p2 = /'/g;
var g = /"/g;
var $ = /^(?:script|style|textarea|title)$/i;
var y2 = (t3) => (i4, ...s3) => ({ _$litType$: t3, strings: i4, values: s3 });
var x = y2(1);
var b2 = y2(2);
var w = y2(3);
var T = Symbol.for("lit-noChange");
var E = Symbol.for("lit-nothing");
var A = new WeakMap;
var C = r3.createTreeWalker(r3, 129);
function P(t3, i4) {
  if (!a2(t3) || !t3.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return s2 !== undefined ? s2.createHTML(i4) : i4;
}
var V = (t3, i4) => {
  const s3 = t3.length - 1, o4 = [];
  let r4, l3 = i4 === 2 ? "<svg>" : i4 === 3 ? "<math>" : "", c4 = f2;
  for (let i5 = 0;i5 < s3; i5++) {
    const s4 = t3[i5];
    let a3, u3, d3 = -1, y3 = 0;
    for (;y3 < s4.length && (c4.lastIndex = y3, u3 = c4.exec(s4), u3 !== null); )
      y3 = c4.lastIndex, c4 === f2 ? u3[1] === "!--" ? c4 = v : u3[1] !== undefined ? c4 = _ : u3[2] !== undefined ? ($.test(u3[2]) && (r4 = RegExp("</" + u3[2], "g")), c4 = m) : u3[3] !== undefined && (c4 = m) : c4 === m ? u3[0] === ">" ? (c4 = r4 ?? f2, d3 = -1) : u3[1] === undefined ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = u3[3] === undefined ? m : u3[3] === '"' ? g : p2) : c4 === g || c4 === p2 ? c4 = m : c4 === v || c4 === _ ? c4 = f2 : (c4 = m, r4 = undefined);
    const x2 = c4 === m && t3[i5 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === f2 ? s4 + n3 : d3 >= 0 ? (o4.push(a3), s4.slice(0, d3) + e3 + s4.slice(d3) + h2 + x2) : s4 + h2 + (d3 === -2 ? i5 : x2);
  }
  return [P(t3, l3 + (t3[s3] || "<?>") + (i4 === 2 ? "</svg>" : i4 === 3 ? "</math>" : "")), o4];
};

class N {
  constructor({ strings: t3, _$litType$: s3 }, n4) {
    let r4;
    this.parts = [];
    let c4 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = V(t3, s3);
    if (this.el = N.createElement(f3, n4), C.currentNode = this.el.content, s3 === 2 || s3 === 3) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (;(r4 = C.nextNode()) !== null && d3.length < u3; ) {
      if (r4.nodeType === 1) {
        if (r4.hasAttributes())
          for (const t4 of r4.getAttributeNames())
            if (t4.endsWith(e3)) {
              const i4 = v2[a3++], s4 = r4.getAttribute(t4).split(h2), e4 = /([.?@])?(.*)/.exec(i4);
              d3.push({ type: 1, index: c4, name: e4[2], strings: s4, ctor: e4[1] === "." ? H : e4[1] === "?" ? I : e4[1] === "@" ? L : k }), r4.removeAttribute(t4);
            } else
              t4.startsWith(h2) && (d3.push({ type: 6, index: c4 }), r4.removeAttribute(t4));
        if ($.test(r4.tagName)) {
          const t4 = r4.textContent.split(h2), s4 = t4.length - 1;
          if (s4 > 0) {
            r4.textContent = i3 ? i3.emptyScript : "";
            for (let i4 = 0;i4 < s4; i4++)
              r4.append(t4[i4], l2()), C.nextNode(), d3.push({ type: 2, index: ++c4 });
            r4.append(t4[s4], l2());
          }
        }
      } else if (r4.nodeType === 8)
        if (r4.data === o3)
          d3.push({ type: 2, index: c4 });
        else {
          let t4 = -1;
          for (;(t4 = r4.data.indexOf(h2, t4 + 1)) !== -1; )
            d3.push({ type: 7, index: c4 }), t4 += h2.length - 1;
        }
      c4++;
    }
  }
  static createElement(t3, i4) {
    const s3 = r3.createElement("template");
    return s3.innerHTML = t3, s3;
  }
}
function S2(t3, i4, s3 = t3, e4) {
  if (i4 === T)
    return i4;
  let h3 = e4 !== undefined ? s3._$Co?.[e4] : s3._$Cl;
  const o4 = c3(i4) ? undefined : i4._$litDirective$;
  return h3?.constructor !== o4 && (h3?._$AO?.(false), o4 === undefined ? h3 = undefined : (h3 = new o4(t3), h3._$AT(t3, s3, e4)), e4 !== undefined ? (s3._$Co ??= [])[e4] = h3 : s3._$Cl = h3), h3 !== undefined && (i4 = S2(t3, h3._$AS(t3, i4.values), h3, e4)), i4;
}

class M {
  constructor(t3, i4) {
    this._$AV = [], this._$AN = undefined, this._$AD = t3, this._$AM = i4;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i4 }, parts: s3 } = this._$AD, e4 = (t3?.creationScope ?? r3).importNode(i4, true);
    C.currentNode = e4;
    let h3 = C.nextNode(), o4 = 0, n4 = 0, l3 = s3[0];
    for (;l3 !== undefined; ) {
      if (o4 === l3.index) {
        let i5;
        l3.type === 2 ? i5 = new R(h3, h3.nextSibling, this, t3) : l3.type === 1 ? i5 = new l3.ctor(h3, l3.name, l3.strings, this, t3) : l3.type === 6 && (i5 = new z(h3, this, t3)), this._$AV.push(i5), l3 = s3[++n4];
      }
      o4 !== l3?.index && (h3 = C.nextNode(), o4++);
    }
    return C.currentNode = r3, e4;
  }
  p(t3) {
    let i4 = 0;
    for (const s3 of this._$AV)
      s3 !== undefined && (s3.strings !== undefined ? (s3._$AI(t3, s3, i4), i4 += s3.strings.length - 2) : s3._$AI(t3[i4])), i4++;
  }
}

class R {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i4, s3, e4) {
    this.type = 2, this._$AH = E, this._$AN = undefined, this._$AA = t3, this._$AB = i4, this._$AM = s3, this.options = e4, this._$Cv = e4?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i4 = this._$AM;
    return i4 !== undefined && t3?.nodeType === 11 && (t3 = i4.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i4 = this) {
    t3 = S2(this, t3, i4), c3(t3) ? t3 === E || t3 == null || t3 === "" ? (this._$AH !== E && this._$AR(), this._$AH = E) : t3 !== this._$AH && t3 !== T && this._(t3) : t3._$litType$ !== undefined ? this.$(t3) : t3.nodeType !== undefined ? this.T(t3) : u2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== E && c3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(r3.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i4, _$litType$: s3 } = t3, e4 = typeof s3 == "number" ? this._$AC(t3) : (s3.el === undefined && (s3.el = N.createElement(P(s3.h, s3.h[0]), this.options)), s3);
    if (this._$AH?._$AD === e4)
      this._$AH.p(i4);
    else {
      const t4 = new M(e4, this), s4 = t4.u(this.options);
      t4.p(i4), this.T(s4), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i4 = A.get(t3.strings);
    return i4 === undefined && A.set(t3.strings, i4 = new N(t3)), i4;
  }
  k(t3) {
    a2(this._$AH) || (this._$AH = [], this._$AR());
    const i4 = this._$AH;
    let s3, e4 = 0;
    for (const h3 of t3)
      e4 === i4.length ? i4.push(s3 = new R(this.O(l2()), this.O(l2()), this, this.options)) : s3 = i4[e4], s3._$AI(h3), e4++;
    e4 < i4.length && (this._$AR(s3 && s3._$AB.nextSibling, e4), i4.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, i4) {
    for (this._$AP?.(false, true, i4);t3 && t3 !== this._$AB; ) {
      const i5 = t3.nextSibling;
      t3.remove(), t3 = i5;
    }
  }
  setConnected(t3) {
    this._$AM === undefined && (this._$Cv = t3, this._$AP?.(t3));
  }
}

class k {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i4, s3, e4, h3) {
    this.type = 1, this._$AH = E, this._$AN = undefined, this.element = t3, this.name = i4, this._$AM = e4, this.options = h3, s3.length > 2 || s3[0] !== "" || s3[1] !== "" ? (this._$AH = Array(s3.length - 1).fill(new String), this.strings = s3) : this._$AH = E;
  }
  _$AI(t3, i4 = this, s3, e4) {
    const h3 = this.strings;
    let o4 = false;
    if (h3 === undefined)
      t3 = S2(this, t3, i4, 0), o4 = !c3(t3) || t3 !== this._$AH && t3 !== T, o4 && (this._$AH = t3);
    else {
      const e5 = t3;
      let n4, r4;
      for (t3 = h3[0], n4 = 0;n4 < h3.length - 1; n4++)
        r4 = S2(this, e5[s3 + n4], i4, n4), r4 === T && (r4 = this._$AH[n4]), o4 ||= !c3(r4) || r4 !== this._$AH[n4], r4 === E ? t3 = E : t3 !== E && (t3 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
    }
    o4 && !e4 && this.j(t3);
  }
  j(t3) {
    t3 === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
}

class H extends k {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === E ? undefined : t3;
  }
}

class I extends k {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== E);
  }
}

class L extends k {
  constructor(t3, i4, s3, e4, h3) {
    super(t3, i4, s3, e4, h3), this.type = 5;
  }
  _$AI(t3, i4 = this) {
    if ((t3 = S2(this, t3, i4, 0) ?? E) === T)
      return;
    const s3 = this._$AH, e4 = t3 === E && s3 !== E || t3.capture !== s3.capture || t3.once !== s3.once || t3.passive !== s3.passive, h3 = t3 !== E && (s3 === E || e4);
    e4 && this.element.removeEventListener(this.name, this, s3), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
}

class z {
  constructor(t3, i4, s3) {
    this.element = t3, this.type = 6, this._$AN = undefined, this._$AM = i4, this.options = s3;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    S2(this, t3);
  }
}
var j = t2.litHtmlPolyfillSupport;
j?.(N, R), (t2.litHtmlVersions ??= []).push("3.3.0");

// node_modules/lit-element/node_modules/@lit/reactive-element/css-tag.js
var t3 = globalThis;
var e4 = t3.ShadowRoot && (t3.ShadyCSS === undefined || t3.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s3 = Symbol();
var o4 = new WeakMap;

class n4 {
  constructor(t4, e5, o5) {
    if (this._$cssResult$ = true, o5 !== s3)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e4 && t4 === undefined) {
      const e5 = s4 !== undefined && s4.length === 1;
      e5 && (t4 = o4.get(s4)), t4 === undefined && ((this.o = t4 = new CSSStyleSheet).replaceSync(this.cssText), e5 && o4.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
}
var r4 = (t4) => new n4(typeof t4 == "string" ? t4 : t4 + "", undefined, s3);
var i4 = (t4, ...e5) => {
  const o5 = t4.length === 1 ? t4[0] : e5.reduce((e6, s4, o6) => e6 + ((t5) => {
    if (t5._$cssResult$ === true)
      return t5.cssText;
    if (typeof t5 == "number")
      return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o6 + 1], t4[0]);
  return new n4(o5, t4, s3);
};
var S3 = (s4, o5) => {
  if (e4)
    s4.adoptedStyleSheets = o5.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else
    for (const e5 of o5) {
      const o6 = document.createElement("style"), n5 = t3.litNonce;
      n5 !== undefined && o6.setAttribute("nonce", n5), o6.textContent = e5.cssText, s4.appendChild(o6);
    }
};
var c4 = e4 ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules)
    e5 += s4.cssText;
  return r4(e5);
})(t4) : t4;

// node_modules/lit-element/node_modules/@lit/reactive-element/reactive-element.js
var { is: i5, defineProperty: e5, getOwnPropertyDescriptor: h3, getOwnPropertyNames: r5, getOwnPropertySymbols: o5, getPrototypeOf: n5 } = Object;
var a3 = globalThis;
var c5 = a3.trustedTypes;
var l3 = c5 ? c5.emptyScript : "";
var p3 = a3.reactiveElementPolyfillSupport;
var d3 = (t4, s4) => t4;
var u3 = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l3 : null;
      break;
    case Object:
    case Array:
      t4 = t4 == null ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i6 = t4;
  switch (s4) {
    case Boolean:
      i6 = t4 !== null;
      break;
    case Number:
      i6 = t4 === null ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i6 = JSON.parse(t4);
      } catch (t5) {
        i6 = null;
      }
  }
  return i6;
} };
var f3 = (t4, s4) => !i5(t4, s4);
var b3 = { attribute: true, type: String, converter: u3, reflect: false, useDefault: false, hasChanged: f3 };
Symbol.metadata ??= Symbol("metadata"), a3.litPropertyMetadata ??= new WeakMap;

class y3 extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ??= []).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b3) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i6 = Symbol(), h4 = this.getPropertyDescriptor(t4, i6, s4);
      h4 !== undefined && e5(this.prototype, t4, h4);
    }
  }
  static getPropertyDescriptor(t4, s4, i6) {
    const { get: e6, set: r6 } = h3(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e6, set(s5) {
      const h4 = e6?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h4, i6);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b3;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d3("elementProperties")))
      return;
    const t4 = n5(this);
    t4.finalize(), t4.l !== undefined && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d3("finalized")))
      return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d3("properties"))) {
      const t5 = this.properties, s4 = [...r5(t5), ...o5(t5)];
      for (const i6 of s4)
        this.createProperty(i6, t5[i6]);
    }
    const t4 = this[Symbol.metadata];
    if (t4 !== null) {
      const s4 = litPropertyMetadata.get(t4);
      if (s4 !== undefined)
        for (const [t5, i6] of s4)
          this.elementProperties.set(t5, i6);
    }
    this._$Eh = new Map;
    for (const [t5, s4] of this.elementProperties) {
      const i6 = this._$Eu(t5, s4);
      i6 !== undefined && this._$Eh.set(i6, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i6 = [];
    if (Array.isArray(s4)) {
      const e6 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e6)
        i6.unshift(c4(s5));
    } else
      s4 !== undefined && i6.push(c4(s4));
    return i6;
  }
  static _$Eu(t4, s4) {
    const i6 = s4.attribute;
    return i6 === false ? undefined : typeof i6 == "string" ? i6 : typeof t4 == "string" ? t4.toLowerCase() : undefined;
  }
  constructor() {
    super(), this._$Ep = undefined, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = new Map, this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ??= new Set).add(t4), this.renderRoot !== undefined && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = new Map, s4 = this.constructor.elementProperties;
    for (const i6 of s4.keys())
      this.hasOwnProperty(i6) && (t4.set(i6, this[i6]), delete this[i6]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S3(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {}
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i6) {
    this._$AK(t4, i6);
  }
  _$ET(t4, s4) {
    const i6 = this.constructor.elementProperties.get(t4), e6 = this.constructor._$Eu(t4, i6);
    if (e6 !== undefined && i6.reflect === true) {
      const h4 = (i6.converter?.toAttribute !== undefined ? i6.converter : u3).toAttribute(s4, i6.type);
      this._$Em = t4, h4 == null ? this.removeAttribute(e6) : this.setAttribute(e6, h4), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i6 = this.constructor, e6 = i6._$Eh.get(t4);
    if (e6 !== undefined && this._$Em !== e6) {
      const t5 = i6.getPropertyOptions(e6), h4 = typeof t5.converter == "function" ? { fromAttribute: t5.converter } : t5.converter?.fromAttribute !== undefined ? t5.converter : u3;
      this._$Em = e6, this[e6] = h4.fromAttribute(s4, t5.type) ?? this._$Ej?.get(e6) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i6) {
    if (t4 !== undefined) {
      const e6 = this.constructor, h4 = this[t4];
      if (i6 ??= e6.getPropertyOptions(t4), !((i6.hasChanged ?? f3)(h4, s4) || i6.useDefault && i6.reflect && h4 === this._$Ej?.get(t4) && !this.hasAttribute(e6._$Eu(t4, i6))))
        return;
      this.C(t4, s4, i6);
    }
    this.isUpdatePending === false && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i6, reflect: e6, wrapped: h4 }, r6) {
    i6 && !(this._$Ej ??= new Map).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), h4 !== true || r6 !== undefined) || (this._$AL.has(t4) || (this.hasUpdated || i6 || (s4 = undefined), this._$AL.set(t4, s4)), e6 === true && this._$Em !== t4 && (this._$Eq ??= new Set).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return t4 != null && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t6, s5] of this._$Ep)
          this[t6] = s5;
        this._$Ep = undefined;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0)
        for (const [s5, i6] of t5) {
          const { wrapped: t6 } = i6, e6 = this[s5];
          t6 !== true || this._$AL.has(s5) || e6 === undefined || this.C(s5, undefined, i6, e6);
        }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {}
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = new Map, this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq &&= this._$Eq.forEach((t5) => this._$ET(t5, this[t5])), this._$EM();
  }
  updated(t4) {}
  firstUpdated(t4) {}
}
y3.elementStyles = [], y3.shadowRootOptions = { mode: "open" }, y3[d3("elementProperties")] = new Map, y3[d3("finalized")] = new Map, p3?.({ ReactiveElement: y3 }), (a3.reactiveElementVersions ??= []).push("2.1.0");
// node_modules/lit-element/node_modules/lit-html/lit-html.js
var t4 = globalThis;
var i6 = t4.trustedTypes;
var s4 = i6 ? i6.createPolicy("lit-html", { createHTML: (t5) => t5 }) : undefined;
var e6 = "$lit$";
var h4 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var o6 = "?" + h4;
var n6 = `<${o6}>`;
var r6 = document;
var l4 = () => r6.createComment("");
var c6 = (t5) => t5 === null || typeof t5 != "object" && typeof t5 != "function";
var a4 = Array.isArray;
var u4 = (t5) => a4(t5) || typeof t5?.[Symbol.iterator] == "function";
var d4 = `[ 	
\f\r]`;
var f4 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var v2 = /-->/g;
var _2 = />/g;
var m2 = RegExp(`>|${d4}(?:([^\\s"'>=/]+)(${d4}*=${d4}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var p4 = /'/g;
var g2 = /"/g;
var $2 = /^(?:script|style|textarea|title)$/i;
var y4 = (t5) => (i7, ...s5) => ({ _$litType$: t5, strings: i7, values: s5 });
var x2 = y4(1);
var b4 = y4(2);
var w2 = y4(3);
var T2 = Symbol.for("lit-noChange");
var E2 = Symbol.for("lit-nothing");
var A2 = new WeakMap;
var C2 = r6.createTreeWalker(r6, 129);
function P2(t5, i7) {
  if (!a4(t5) || !t5.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return s4 !== undefined ? s4.createHTML(i7) : i7;
}
var V2 = (t5, i7) => {
  const s5 = t5.length - 1, o7 = [];
  let r7, l5 = i7 === 2 ? "<svg>" : i7 === 3 ? "<math>" : "", c7 = f4;
  for (let i8 = 0;i8 < s5; i8++) {
    const s6 = t5[i8];
    let a5, u5, d5 = -1, y5 = 0;
    for (;y5 < s6.length && (c7.lastIndex = y5, u5 = c7.exec(s6), u5 !== null); )
      y5 = c7.lastIndex, c7 === f4 ? u5[1] === "!--" ? c7 = v2 : u5[1] !== undefined ? c7 = _2 : u5[2] !== undefined ? ($2.test(u5[2]) && (r7 = RegExp("</" + u5[2], "g")), c7 = m2) : u5[3] !== undefined && (c7 = m2) : c7 === m2 ? u5[0] === ">" ? (c7 = r7 ?? f4, d5 = -1) : u5[1] === undefined ? d5 = -2 : (d5 = c7.lastIndex - u5[2].length, a5 = u5[1], c7 = u5[3] === undefined ? m2 : u5[3] === '"' ? g2 : p4) : c7 === g2 || c7 === p4 ? c7 = m2 : c7 === v2 || c7 === _2 ? c7 = f4 : (c7 = m2, r7 = undefined);
    const x3 = c7 === m2 && t5[i8 + 1].startsWith("/>") ? " " : "";
    l5 += c7 === f4 ? s6 + n6 : d5 >= 0 ? (o7.push(a5), s6.slice(0, d5) + e6 + s6.slice(d5) + h4 + x3) : s6 + h4 + (d5 === -2 ? i8 : x3);
  }
  return [P2(t5, l5 + (t5[s5] || "<?>") + (i7 === 2 ? "</svg>" : i7 === 3 ? "</math>" : "")), o7];
};

class N2 {
  constructor({ strings: t5, _$litType$: s5 }, n7) {
    let r7;
    this.parts = [];
    let c7 = 0, a5 = 0;
    const u5 = t5.length - 1, d5 = this.parts, [f5, v3] = V2(t5, s5);
    if (this.el = N2.createElement(f5, n7), C2.currentNode = this.el.content, s5 === 2 || s5 === 3) {
      const t6 = this.el.content.firstChild;
      t6.replaceWith(...t6.childNodes);
    }
    for (;(r7 = C2.nextNode()) !== null && d5.length < u5; ) {
      if (r7.nodeType === 1) {
        if (r7.hasAttributes())
          for (const t6 of r7.getAttributeNames())
            if (t6.endsWith(e6)) {
              const i7 = v3[a5++], s6 = r7.getAttribute(t6).split(h4), e7 = /([.?@])?(.*)/.exec(i7);
              d5.push({ type: 1, index: c7, name: e7[2], strings: s6, ctor: e7[1] === "." ? H2 : e7[1] === "?" ? I2 : e7[1] === "@" ? L2 : k2 }), r7.removeAttribute(t6);
            } else
              t6.startsWith(h4) && (d5.push({ type: 6, index: c7 }), r7.removeAttribute(t6));
        if ($2.test(r7.tagName)) {
          const t6 = r7.textContent.split(h4), s6 = t6.length - 1;
          if (s6 > 0) {
            r7.textContent = i6 ? i6.emptyScript : "";
            for (let i7 = 0;i7 < s6; i7++)
              r7.append(t6[i7], l4()), C2.nextNode(), d5.push({ type: 2, index: ++c7 });
            r7.append(t6[s6], l4());
          }
        }
      } else if (r7.nodeType === 8)
        if (r7.data === o6)
          d5.push({ type: 2, index: c7 });
        else {
          let t6 = -1;
          for (;(t6 = r7.data.indexOf(h4, t6 + 1)) !== -1; )
            d5.push({ type: 7, index: c7 }), t6 += h4.length - 1;
        }
      c7++;
    }
  }
  static createElement(t5, i7) {
    const s5 = r6.createElement("template");
    return s5.innerHTML = t5, s5;
  }
}
function S4(t5, i7, s5 = t5, e7) {
  if (i7 === T2)
    return i7;
  let h5 = e7 !== undefined ? s5._$Co?.[e7] : s5._$Cl;
  const o7 = c6(i7) ? undefined : i7._$litDirective$;
  return h5?.constructor !== o7 && (h5?._$AO?.(false), o7 === undefined ? h5 = undefined : (h5 = new o7(t5), h5._$AT(t5, s5, e7)), e7 !== undefined ? (s5._$Co ??= [])[e7] = h5 : s5._$Cl = h5), h5 !== undefined && (i7 = S4(t5, h5._$AS(t5, i7.values), h5, e7)), i7;
}

class M2 {
  constructor(t5, i7) {
    this._$AV = [], this._$AN = undefined, this._$AD = t5, this._$AM = i7;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t5) {
    const { el: { content: i7 }, parts: s5 } = this._$AD, e7 = (t5?.creationScope ?? r6).importNode(i7, true);
    C2.currentNode = e7;
    let h5 = C2.nextNode(), o7 = 0, n7 = 0, l5 = s5[0];
    for (;l5 !== undefined; ) {
      if (o7 === l5.index) {
        let i8;
        l5.type === 2 ? i8 = new R2(h5, h5.nextSibling, this, t5) : l5.type === 1 ? i8 = new l5.ctor(h5, l5.name, l5.strings, this, t5) : l5.type === 6 && (i8 = new z2(h5, this, t5)), this._$AV.push(i8), l5 = s5[++n7];
      }
      o7 !== l5?.index && (h5 = C2.nextNode(), o7++);
    }
    return C2.currentNode = r6, e7;
  }
  p(t5) {
    let i7 = 0;
    for (const s5 of this._$AV)
      s5 !== undefined && (s5.strings !== undefined ? (s5._$AI(t5, s5, i7), i7 += s5.strings.length - 2) : s5._$AI(t5[i7])), i7++;
  }
}

class R2 {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t5, i7, s5, e7) {
    this.type = 2, this._$AH = E2, this._$AN = undefined, this._$AA = t5, this._$AB = i7, this._$AM = s5, this.options = e7, this._$Cv = e7?.isConnected ?? true;
  }
  get parentNode() {
    let t5 = this._$AA.parentNode;
    const i7 = this._$AM;
    return i7 !== undefined && t5?.nodeType === 11 && (t5 = i7.parentNode), t5;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t5, i7 = this) {
    t5 = S4(this, t5, i7), c6(t5) ? t5 === E2 || t5 == null || t5 === "" ? (this._$AH !== E2 && this._$AR(), this._$AH = E2) : t5 !== this._$AH && t5 !== T2 && this._(t5) : t5._$litType$ !== undefined ? this.$(t5) : t5.nodeType !== undefined ? this.T(t5) : u4(t5) ? this.k(t5) : this._(t5);
  }
  O(t5) {
    return this._$AA.parentNode.insertBefore(t5, this._$AB);
  }
  T(t5) {
    this._$AH !== t5 && (this._$AR(), this._$AH = this.O(t5));
  }
  _(t5) {
    this._$AH !== E2 && c6(this._$AH) ? this._$AA.nextSibling.data = t5 : this.T(r6.createTextNode(t5)), this._$AH = t5;
  }
  $(t5) {
    const { values: i7, _$litType$: s5 } = t5, e7 = typeof s5 == "number" ? this._$AC(t5) : (s5.el === undefined && (s5.el = N2.createElement(P2(s5.h, s5.h[0]), this.options)), s5);
    if (this._$AH?._$AD === e7)
      this._$AH.p(i7);
    else {
      const t6 = new M2(e7, this), s6 = t6.u(this.options);
      t6.p(i7), this.T(s6), this._$AH = t6;
    }
  }
  _$AC(t5) {
    let i7 = A2.get(t5.strings);
    return i7 === undefined && A2.set(t5.strings, i7 = new N2(t5)), i7;
  }
  k(t5) {
    a4(this._$AH) || (this._$AH = [], this._$AR());
    const i7 = this._$AH;
    let s5, e7 = 0;
    for (const h5 of t5)
      e7 === i7.length ? i7.push(s5 = new R2(this.O(l4()), this.O(l4()), this, this.options)) : s5 = i7[e7], s5._$AI(h5), e7++;
    e7 < i7.length && (this._$AR(s5 && s5._$AB.nextSibling, e7), i7.length = e7);
  }
  _$AR(t5 = this._$AA.nextSibling, i7) {
    for (this._$AP?.(false, true, i7);t5 && t5 !== this._$AB; ) {
      const i8 = t5.nextSibling;
      t5.remove(), t5 = i8;
    }
  }
  setConnected(t5) {
    this._$AM === undefined && (this._$Cv = t5, this._$AP?.(t5));
  }
}

class k2 {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t5, i7, s5, e7, h5) {
    this.type = 1, this._$AH = E2, this._$AN = undefined, this.element = t5, this.name = i7, this._$AM = e7, this.options = h5, s5.length > 2 || s5[0] !== "" || s5[1] !== "" ? (this._$AH = Array(s5.length - 1).fill(new String), this.strings = s5) : this._$AH = E2;
  }
  _$AI(t5, i7 = this, s5, e7) {
    const h5 = this.strings;
    let o7 = false;
    if (h5 === undefined)
      t5 = S4(this, t5, i7, 0), o7 = !c6(t5) || t5 !== this._$AH && t5 !== T2, o7 && (this._$AH = t5);
    else {
      const e8 = t5;
      let n7, r7;
      for (t5 = h5[0], n7 = 0;n7 < h5.length - 1; n7++)
        r7 = S4(this, e8[s5 + n7], i7, n7), r7 === T2 && (r7 = this._$AH[n7]), o7 ||= !c6(r7) || r7 !== this._$AH[n7], r7 === E2 ? t5 = E2 : t5 !== E2 && (t5 += (r7 ?? "") + h5[n7 + 1]), this._$AH[n7] = r7;
    }
    o7 && !e7 && this.j(t5);
  }
  j(t5) {
    t5 === E2 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t5 ?? "");
  }
}

class H2 extends k2 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t5) {
    this.element[this.name] = t5 === E2 ? undefined : t5;
  }
}

class I2 extends k2 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t5) {
    this.element.toggleAttribute(this.name, !!t5 && t5 !== E2);
  }
}

class L2 extends k2 {
  constructor(t5, i7, s5, e7, h5) {
    super(t5, i7, s5, e7, h5), this.type = 5;
  }
  _$AI(t5, i7 = this) {
    if ((t5 = S4(this, t5, i7, 0) ?? E2) === T2)
      return;
    const s5 = this._$AH, e7 = t5 === E2 && s5 !== E2 || t5.capture !== s5.capture || t5.once !== s5.once || t5.passive !== s5.passive, h5 = t5 !== E2 && (s5 === E2 || e7);
    e7 && this.element.removeEventListener(this.name, this, s5), h5 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
  }
  handleEvent(t5) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t5) : this._$AH.handleEvent(t5);
  }
}

class z2 {
  constructor(t5, i7, s5) {
    this.element = t5, this.type = 6, this._$AN = undefined, this._$AM = i7, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t5) {
    S4(this, t5);
  }
}
var j2 = t4.litHtmlPolyfillSupport;
j2?.(N2, R2), (t4.litHtmlVersions ??= []).push("3.3.0");
var B = (t5, i7, s5) => {
  const e7 = s5?.renderBefore ?? i7;
  let h5 = e7._$litPart$;
  if (h5 === undefined) {
    const t6 = s5?.renderBefore ?? null;
    e7._$litPart$ = h5 = new R2(i7.insertBefore(l4(), t6), t6, undefined, s5 ?? {});
  }
  return h5._$AI(t5), h5;
};

// node_modules/lit-element/lit-element.js
var s5 = globalThis;

class i7 extends y3 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = undefined;
  }
  createRenderRoot() {
    const t5 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t5.firstChild, t5;
  }
  update(t5) {
    const r7 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = B(r7, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return T2;
  }
}
i7._$litElement$ = true, i7["finalized"] = true, s5.litElementHydrateSupport?.({ LitElement: i7 });
var o7 = s5.litElementPolyfillSupport;
o7?.({ LitElement: i7 });
(s5.litElementVersions ??= []).push("4.2.0");
// node_modules/lit/node_modules/@lit/reactive-element/decorators/custom-element.js
var t5 = (t6) => (e7, o8) => {
  o8 !== undefined ? o8.addInitializer(() => {
    customElements.define(t6, e7);
  }) : customElements.define(t6, e7);
};
// node_modules/lit/node_modules/@lit/reactive-element/decorators/property.js
var o8 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r7 = (t6 = o8, e7, r8) => {
  const { kind: n7, metadata: i8 } = r8;
  let s6 = globalThis.litPropertyMetadata.get(i8);
  if (s6 === undefined && globalThis.litPropertyMetadata.set(i8, s6 = new Map), n7 === "setter" && ((t6 = Object.create(t6)).wrapped = true), s6.set(r8.name, t6), n7 === "accessor") {
    const { name: o9 } = r8;
    return { set(r9) {
      const n8 = e7.get.call(this);
      e7.set.call(this, r9), this.requestUpdate(o9, n8, t6);
    }, init(e8) {
      return e8 !== undefined && this.C(o9, undefined, t6, e8), e8;
    } };
  }
  if (n7 === "setter") {
    const { name: o9 } = r8;
    return function(r9) {
      const n8 = this[o9];
      e7.call(this, r9), this.requestUpdate(o9, n8, t6);
    };
  }
  throw Error("Unsupported decorator location: " + n7);
};
function n7(t6) {
  return (e7, o9) => typeof o9 == "object" ? r7(t6, e7, o9) : ((t7, e8, o10) => {
    const r8 = e8.hasOwnProperty(o10);
    return e8.constructor.createProperty(o10, t7), r8 ? Object.getOwnPropertyDescriptor(e8, o10) : undefined;
  })(t6, e7, o9);
}
// node_modules/lit/node_modules/@lit/reactive-element/decorators/state.js
function r8(r9) {
  return n7({ ...r9, state: true, attribute: false });
}
// package.json
var version = "0.12.0";

// node_modules/custom-card-helpers/dist/index.m.js
var t6;
var r9;
(function(e8) {
  e8.language = "language", e8.system = "system", e8.comma_decimal = "comma_decimal", e8.decimal_comma = "decimal_comma", e8.space_comma = "space_comma", e8.none = "none";
})(t6 || (t6 = {})), function(e8) {
  e8.language = "language", e8.system = "system", e8.am_pm = "12", e8.twenty_four = "24";
}(r9 || (r9 = {}));
var $3 = new Set(["fan", "input_boolean", "light", "switch", "group", "automation"]);
var ne = function(e8, t7, r10, n8) {
  n8 = n8 || {}, r10 = r10 == null ? {} : r10;
  var i8 = new Event(t7, { bubbles: n8.bubbles === undefined || n8.bubbles, cancelable: Boolean(n8.cancelable), composed: n8.composed === undefined || n8.composed });
  return i8.detail = r10, e8.dispatchEvent(i8), i8;
};
var ie = new Set(["call-service", "divider", "section", "weblink", "cast", "select"]);
var de = function(e8, t7, r10) {
  r10 === undefined && (r10 = false), r10 ? history.replaceState(null, "", t7) : history.pushState(null, "", t7), ne(window, "location-changed", { replace: r10 });
};

// src/types.ts
var DesktopPosition;
((DesktopPosition2) => {
  DesktopPosition2["top"] = "top";
  DesktopPosition2["left"] = "left";
  DesktopPosition2["bottom"] = "bottom";
  DesktopPosition2["right"] = "right";
})(DesktopPosition ||= {});

// src/utils.ts
var mapStringToEnum = (enumType, value) => {
  if (Object.values(enumType).includes(value)) {
    return value;
  }
  return;
};
var processBadgeTemplate = (hass, template) => {
  if (!template || !hass)
    return false;
  try {
    const func = new Function("states", `return ${template}`);
    return func(hass.states);
  } catch (e8) {
    console.error(`NavbarCard: Error evaluating badge template: ${e8}`);
    return false;
  }
};
var processTemplate = (hass, template) => {
  if (!template || !hass)
    return template;
  if (typeof template !== "string")
    return template;
  if (!(template.trim().startsWith("[[[") && template.trim().endsWith("]]]"))) {
    return template;
  }
  try {
    const cleanTemplate = template.replace(/\[\[\[|\]\]\]/g, "");
    const func = new Function("states", "user", "hass", cleanTemplate);
    return func(hass.states, hass.user, hass);
  } catch (e8) {
    console.error(`NavbarCard: Error evaluating template: ${e8}`);
    return template;
  }
};
var fireDOMEvent = (node, type, options, detail) => {
  const event = new Event(type, options ?? {});
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};
var hapticFeedback = (hapticType = "selection") => {
  return fireDOMEvent(window, "haptic", undefined, hapticType);
};

// src/dom-utils.ts
var getNavbarTemplates = () => {
  const lovelacePanel = document?.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-drawer partial-panel-resolver ha-panel-lovelace");
  if (lovelacePanel) {
    return lovelacePanel.lovelace.config["navbar-templates"];
  }
  return null;
};
var forceResetRipple = (target) => {
  const ripple = target?.querySelector("md-ripple");
  if (ripple != null) {
    setTimeout(() => {
      ripple.shadowRoot?.querySelector(".surface")?.classList?.remove("hovered");
      ripple.shadowRoot?.querySelector(".surface")?.classList?.remove("pressed");
    }, 10);
  }
};

// src/styles.ts
var HOST_STYLES = i4`
  :host {
    --navbar-background-color: var(--card-background-color);
    --navbar-route-icon-size: 24px;
    --navbar-route-image-size: 32px;
    --navbar-primary-color: var(--primary-color);
    --navbar-box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14);
    --navbar-box-shadow-desktop: var(--material-shadow-elevation-2dp);

    --navbar-z-index: 3;
    --navbar-popup-backdrop-index: 900;
    --navbar-popup-index: 901;
  }
`;
var NAVBAR_STYLES = i4`
  .navbar {
    background: var(--navbar-background-color);
    border-radius: 0px;
    box-shadow: var(--navbar-box-shadow);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    gap: 10px;
    width: 100vw;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: unset;
    z-index: var(--navbar-z-index);
  }

  /* Edit mode styles */
  .navbar.edit-mode {
    position: relative !important;
    flex-direction: row !important;
    left: unset !important;
    right: unset !important;
    bottom: unset !important;
    top: unset !important;
    width: auto !important;
    transform: none !important;
  }

  /* Desktop mode styles */
  .navbar.desktop {
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--navbar-box-shadow-desktop);
    width: auto;
    justify-content: space-evenly;

    --navbar-route-icon-size: 28px;
  }
  .navbar.desktop.bottom {
    flex-direction: row;
    top: unset;
    right: unset;
    bottom: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }
  .navbar.desktop.top {
    flex-direction: row;
    bottom: unset;
    right: unset;
    top: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }
  .navbar.desktop.left {
    flex-direction: column;
    left: calc(var(--mdc-drawer-width, 0px) + 16px);
    right: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }
  .navbar.desktop.right {
    flex-direction: column;
    right: 16px;
    left: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }
`;
var ROUTE_STYLES = i4`
  .route {
    cursor: pointer;
    max-width: 60px;
    width: 100%;
    position: relative;
    text-decoration: none;
    color: var(--primary-text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    --icon-primary-color: var(--state-inactive-color);
  }

  /* Button styling */
  .button {
    height: 36px;
    width: 100%;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .button.active {
    background: color-mix(
      in srgb,
      var(--navbar-primary-color) 30%,
      transparent
    );
    --icon-primary-color: var(--navbar-primary-color);
  }

  /* Icon and Image styling */
  .icon {
    --mdc-icon-size: var(--navbar-route-icon-size);
  }

  .image {
    width: var(--navbar-route-image-size);
    height: var(--navbar-route-image-size);
    object-fit: contain;
  }

  .image.active {
  }

  /* Label styling */
  .label {
    flex: 1;
    width: 100%;
    /* TODO fix ellipsis*/
    text-align: center;
    font-size: var(--paper-font-caption_-_font-size, 12px);
    font-weight: 500;
  }

  /* Badge styling */
  .badge {
    border-radius: 999px;
    width: 12px;
    height: 12px;
    position: absolute;
    top: 0;
    right: 0;
  }
  .badge.with-counter {
    min-width: 16px;
    width: auto !important;
    padding: 0px 2px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 11px;
    line-height: 11px;
  }

  /* Desktop mode styles */
  .navbar.desktop .route {
    height: 60px;
    width: 60px;
  }
  .navbar.desktop .button {
    flex: unset;
    height: 100%;
  }
`;
var POPUP_STYLES = i4`
  /****************************************/
  /* Backdrop */
  /****************************************/
  .navbar-popup-backdrop {
    position: fixed;
    background: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: var(--navbar-popup-backdrop-index);
    transition: opacity 0.2s ease;
  }

  .navbar-popup-backdrop.visible {
    opacity: 1;
  }

  /****************************************/
  /* Main popup container */
  /****************************************/
  .navbar-popup {
    pointer-events: none;
    position: fixed;
    opacity: 0;
    padding: 6px;
    gap: 10px;
    z-index: var(--navbar-popup-index);

    display: flex;
    justify-content: center;

    transition: all 0.2s ease;
    transform-origin: bottom left;
  }

  .navbar-popup.open-up {
    flex-direction: column-reverse;
    margin-bottom: 32px;
    transform: translate(0, -100%);
  }

  .navbar-popup.open-bottom {
    flex-direction: column;
    margin-top: 32px;
  }

  .navbar-popup.open-right {
    flex-direction: row;
    margin-left: 32px;
  }

  .navbar-popup.open-left {
    flex-direction: row-reverse;
    margin-right: 32px;
  }

  .navbar-popup.label-right {
    align-items: flex-start;
  }

  .navbar-popup.label-left {
    align-items: flex-end;
  }

  .navbar-popup.visible {
    opacity: 1;
  }

  /****************************************/
  /* Popup item styles */
  /****************************************/

  .popup-item {
    pointer-events: auto;
    cursor: pointer;
    color: var(--primary-text-color);
    display: flex;
    flex-direction: column;
    --icon-primary-color: var(--primary-text-color);
    display: flex;
    flex-direction: row-reverse;
    width: fit-content;
    height: fit-content;
    gap: 6px;
    align-items: center;

    opacity: 0;
    transform: translateY(10px);
    transition: filter 0.2s ease;
    transition: all 0.2s ease;
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .popup-item.label-bottom {
    flex-direction: column;
    max-width: 80px;
  }

  .popup-item.label-left {
    flex-direction: row-reverse;
  }

  .popup-item.label-right {
    flex-direction: row;
  }

  .popup-item.label-left .label {
    text-align: end;
  }

  .popup-item.label-right .label {
    text-align: start;
  }

  .popup-item .button {
    width: 50px;
    height: 50px;
    background: var(--navbar-background-color);
    box-shadow: var(--navbar-box-shadow-desktop);
  }
`;
var getDefaultStyles = () => {
  return i4`
    ${HOST_STYLES}
    ${NAVBAR_STYLES}
    ${ROUTE_STYLES}
    ${POPUP_STYLES}
  `;
};

// src/color.ts
var hexToDecimal = (hex) => parseInt(hex, 16);
var decimalToHex = (decimal) => decimal.toString(16).padStart(2, "0");
var isValidInt = (value) => {
  try {
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue))
      return false;
  } catch {
    return false;
  }
  return true;
};
var hue2rgb = (p5, q, t7) => {
  if (t7 < 0)
    t7 += 1;
  if (t7 > 1)
    t7 -= 1;
  if (t7 < 1 / 6)
    return p5 + (q - p5) * 6 * t7;
  if (t7 < 1 / 2)
    return q;
  if (t7 < 2 / 3)
    return p5 + (q - p5) * (2 / 3 - t7) * 6;
  return p5;
};
var complementaryRGBColor = (r10, g3, b5) => {
  if (Math.max(r10, g3, b5) == Math.min(r10, g3, b5)) {
    return { r: 255 - r10, g: 255 - g3, b: 255 - b5 };
  } else {
    r10 /= 255, g3 /= 255, b5 /= 255;
    const max = Math.max(r10, g3, b5), min = Math.min(r10, g3, b5);
    let h5 = 0;
    const l5 = (max + min) / 2;
    const d5 = max - min;
    const s6 = l5 > 0.5 ? d5 / (2 - max - min) : d5 / (max + min);
    switch (max) {
      case r10:
        h5 = (g3 - b5) / d5 + (g3 < b5 ? 6 : 0);
        break;
      case g3:
        h5 = (b5 - r10) / d5 + 2;
        break;
      case b5:
        h5 = (r10 - g3) / d5 + 4;
        break;
    }
    h5 = Math.round(h5 * 60 + 180) % 360;
    h5 /= 360;
    const q = l5 < 0.5 ? l5 * (1 + s6) : l5 + s6 - l5 * s6;
    const p5 = 2 * l5 - q;
    r10 = hue2rgb(p5, q, h5 + 1 / 3);
    g3 = hue2rgb(p5, q, h5);
    b5 = hue2rgb(p5, q, h5 - 1 / 3);
    return {
      r: Math.round(r10 * 255),
      g: Math.round(g3 * 255),
      b: Math.round(b5 * 255)
    };
  }
};

class Color {
  r = 0;
  g = 0;
  b = 0;
  a = 255;
  constructor(data) {
    if (data instanceof Color) {
      this.r = data.r;
      this.g = data.g;
      this.b = data.b;
      this.a = data.a;
    } else if (typeof data == "string") {
      if (data.startsWith("#")) {
        this._parseHexString(data);
      } else if (data.startsWith("rgb(")) {
        this._parseRGBString(data);
      } else if (data.startsWith("rgba(")) {
        this._parseRGBAString(data);
      } else if (isValidInt(data)) {
        this._parseHexString(`#${data}`);
      } else {
        try {
          this._readColorFromDOM(data);
        } catch {
          throw Error(`Format not supported for color string: "${data}"`);
        }
      }
    } else if (Array.isArray(data)) {
      this._parseColorArray(data);
    } else {
      throw Error(`Format not supported for color: "${typeof data}"`);
    }
  }
  _readColorFromDOM(color) {
    const d5 = document.createElement("div");
    d5.style.color = color;
    document.body.appendChild(d5);
    const parsedColor = window.getComputedStyle(d5).color;
    this._parseRGBString(parsedColor);
  }
  _parseColorArray(data) {
    const colorArray = data.map((x3) => parseInt(x3));
    if (colorArray.length < 3) {
      throw Error(`Invalid array format color string: "${data}"
Supported formats: [r,g,b] | [r,g,b,a]`);
    }
    this.r = colorArray[0];
    this.g = colorArray[1];
    this.b = colorArray[2];
    this.a = colorArray.at(3) ?? this.a;
  }
  _parseRGBString(data) {
    const colorString = data.replace("rgb(", "").replace(")", "");
    const colorComponents = colorString.split(",");
    if (data.indexOf("rgb(") == -1 || colorComponents.length != 3) {
      throw Error(`Invalid 'rgb(r,g,b)' format for color string: "${data}"`);
    }
    this.r = parseInt(colorComponents[0]);
    this.g = parseInt(colorComponents[1]);
    this.b = parseInt(colorComponents[2]);
  }
  _parseRGBAString(data) {
    const colorString = data.replace("rgba(", "").replace(")", "");
    const colorComponents = colorString.split(",");
    if (data.indexOf("rgba(") == -1 || colorComponents.length != 4) {
      throw Error(`Invalid 'rgba(r,g,b,a)' format for color string: "${data}"`);
    }
    this.r = parseInt(colorComponents[0]);
    this.g = parseInt(colorComponents[1]);
    this.b = parseInt(colorComponents[2]);
    this.a = parseInt(colorComponents[3]);
  }
  _parseHexString(data) {
    const colorString = data.replace("#", "");
    switch (colorString.length) {
      case 3:
        this.r = hexToDecimal(colorString.slice(0, 1) + colorString.slice(0, 1));
        this.g = hexToDecimal(colorString.slice(1, 2) + colorString.slice(1, 2));
        this.b = hexToDecimal(colorString.slice(2, 3) + colorString.slice(2, 3));
        break;
      case 6:
        this.r = hexToDecimal(colorString.slice(0, 2));
        this.g = hexToDecimal(colorString.slice(2, 4));
        this.b = hexToDecimal(colorString.slice(4, 6));
        break;
      case 8:
        this.r = hexToDecimal(colorString.slice(0, 2));
        this.g = hexToDecimal(colorString.slice(2, 4));
        this.b = hexToDecimal(colorString.slice(4, 6));
        this.a = hexToDecimal(colorString.slice(6, 8));
        break;
      default:
        throw Error(`Invalid hex format for color string: "${data}"`);
    }
  }
  opacity(opacity) {
    this.a = Math.max(0, Math.min(opacity * 255, 255));
    return this;
  }
  complementary() {
    const { r: r10, g: g3, b: b5 } = complementaryRGBColor(this.r, this.g, this.b);
    return new Color([r10, g3, b5, this.a]);
  }
  shade(percent) {
    let R3 = this.r * (100 + percent) / 100;
    let G = this.g * (100 + percent) / 100;
    let B2 = this.b * (100 + percent) / 100;
    R3 = R3 < 255 ? R3 : 255;
    G = G < 255 ? G : 255;
    B2 = B2 < 255 ? B2 : 255;
    R3 = Math.round(R3);
    G = Math.round(G);
    B2 = Math.round(B2);
    const brightness = Math.round((R3 * 299 + G * 587 + B2 * 114) / 1000);
    if (brightness == 0)
      return this.complementary();
    if (brightness < 80 && percent < 100)
      return this.shade(percent + 50);
    return new Color([R3, G, B2]);
  }
  contrastingColor() {
    return new Color(this.luma() >= 165 ? "#000" : "#fff");
  }
  luma() {
    return 0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b;
  }
  rgb() {
    return { r: this.r, g: this.g, b: this.b };
  }
  rgba() {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }
  hex() {
    return `#${decimalToHex(this.r)}${decimalToHex(this.g)}${decimalToHex(this.b)}`;
  }
  hexa() {
    return `#${decimalToHex(this.a)}${decimalToHex(this.r)}${decimalToHex(this.g)}${decimalToHex(this.b)}`;
  }
  array() {
    return [this.r, this.g, this.b, this.a];
  }
}

// src/navbar-card.ts
window.customCards = window.customCards || [];
window.customCards.push({
  type: "navbar-card",
  name: "Navbar card",
  preview: true,
  description: "Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen."
});
var PROPS_TO_FORCE_UPDATE = [
  "_config",
  "_isDesktop",
  "_inEditDashboardMode",
  "_inEditCardMode",
  "_inPreviewMode",
  "_location",
  "_popup"
];
var DEFAULT_DESKTOP_POSITION = "bottom" /* bottom */;
var DOUBLE_TAP_DELAY = 250;
var HOLD_ACTION_DELAY = 500;

class NavbarCard extends i7 {
  holdTimeoutId = null;
  holdTriggered = false;
  pointerStartX = 0;
  pointerStartY = 0;
  lastTapTime = 0;
  lastTapTarget = null;
  tapTimeoutId = null;
  connectedCallback() {
    super.connectedCallback();
    forceResetRipple(this);
    this._location = window.location.pathname;
    window.addEventListener("resize", this._checkDesktop);
    this._checkDesktop();
    const homeAssistantRoot = document.querySelector("body > home-assistant");
    this._inEditDashboardMode = this.parentElement?.closest("hui-card-edit-mode") != null;
    this._inEditCardMode = homeAssistantRoot?.shadowRoot?.querySelector("hui-dialog-edit-card")?.shadowRoot?.querySelector("ha-dialog") != null;
    this._inPreviewMode = this.parentElement?.closest(".card > .preview") != null;
    const style = document.createElement("style");
    style.textContent = this.generateCustomStyles().cssText;
    this.shadowRoot?.appendChild(style);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("resize", this._checkDesktop);
    this._popup = null;
  }
  setConfig(config) {
    if (config?.template) {
      const templates = getNavbarTemplates();
      if (!templates) {
        console.warn('[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.' + `

` + `https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates
`);
      } else {
        const templateConfig = templates[config.template];
        if (templateConfig) {
          config = {
            ...templateConfig,
            ...config
          };
        }
      }
    }
    if (!config.routes) {
      throw new Error('"routes" param is required for navbar card');
    }
    config.routes.forEach((route) => {
      if (route.icon == null && route.image == null) {
        throw new Error('Each route must have either an "icon" or "image" property configured');
      }
      if (route.popup == null && route.submenu == null && route.tap_action == null && route.hold_action == null && route.url == null && route.double_tap_action == null) {
        throw new Error('Each route must have either "url", "popup", "tap_action", "hold_action" or "double_tap_action" property configured');
      }
      if (route.tap_action && route.tap_action.action == null) {
        throw new Error('"tap_action" must have an "action" property');
      }
      if (route.hold_action && route.hold_action.action == null) {
        throw new Error('"hold_action" must have an "action" property');
      }
      if (route.double_tap_action && route.double_tap_action.action == null) {
        throw new Error('"double_tap_action" must have an "action" property');
      }
    });
    this._config = config;
  }
  shouldUpdate(changedProperties) {
    for (const propName of changedProperties.keys()) {
      if (PROPS_TO_FORCE_UPDATE.includes(propName)) {
        return true;
      }
      if (propName === "hass") {
        return true;
      }
    }
    return false;
  }
  static getStubConfig() {
    return {
      routes: [
        { url: window.location.pathname, icon: "mdi:home", label: "Home" },
        {
          url: `${window.location.pathname}/devices`,
          icon: "mdi:devices",
          label: "Devices",
          hold_action: {
            action: "navigate",
            navigation_path: "/config/devices/dashboard"
          }
        },
        {
          url: "/config/automation/dashboard",
          icon: "mdi:creation",
          label: "Automations"
        },
        { url: "/config/dashboard", icon: "mdi:cog", label: "Settings" },
        {
          icon: "mdi:dots-horizontal",
          label: "More",
          tap_action: {
            action: "open-popup"
          },
          popup: [
            { icon: "mdi:cog", url: "/config/dashboard" },
            {
              icon: "mdi:hammer",
              url: "/developer-tools/yaml"
            },
            {
              icon: "mdi:power",
              tap_action: {
                action: "call-service",
                service: "homeassistant.restart",
                service_data: {},
                confirmation: {
                  text: "Are you sure you want to restart Home Assistant?"
                }
              }
            }
          ]
        }
      ]
    };
  }
  _getRouteIcon(route, isActive) {
    return route.image ? x2`<img
          class="image ${isActive ? "active" : ""}"
          src="${isActive && route.image_selected ? route.image_selected : route.image}"
          alt="${route.label || ""}" />` : x2`<ha-icon
          class="icon ${isActive ? "active" : ""}"
          icon="${isActive && route.icon_selected ? route.icon_selected : route.icon}"></ha-icon>`;
  }
  _renderBadge(route, isRouteActive) {
    let showBadge = false;
    if (route.badge?.show) {
      showBadge = processTemplate(this.hass, route.badge?.show);
    } else if (route.badge?.template) {
      showBadge = processBadgeTemplate(this.hass, route.badge?.template);
    }
    const count = processTemplate(this.hass, route.badge?.count) ?? null;
    const hasCount = count != null;
    const backgroundColor = processTemplate(this.hass, route.badge?.color) ?? "red";
    const contrastingColor = processTemplate(this.hass, route.badge?.textColor) ?? new Color(backgroundColor).contrastingColor().hex();
    return showBadge ? x2`<div
          class="badge ${isRouteActive ? "active" : ""} ${hasCount ? "with-counter" : ""}"
          style="background-color: ${backgroundColor}; color: ${contrastingColor}">
          ${count}
        </div>` : x2``;
  }
  _shouldShowLabels = (isSubmenu) => {
    const config = this._isDesktop ? this._config?.desktop?.show_labels : this._config?.mobile?.show_labels;
    if (typeof config === "boolean")
      return config;
    return config === "popup_only" && isSubmenu || config === "routes_only" && !isSubmenu;
  };
  _checkDesktop = () => {
    this._isDesktop = (window.innerWidth ?? 0) >= (this._config?.desktop?.min_width ?? 768);
  };
  _renderRoute = (route) => {
    const isActive = route.selected != null ? processTemplate(this.hass, route.selected) : this._location == route.url;
    if (processTemplate(this.hass, route.hidden)) {
      return null;
    }
    return x2`
      <div
        class="route ${isActive ? "active" : ""}"
        @pointerdown=${(e8) => this._handlePointerDown(e8, route)}
        @pointermove=${(e8) => this._handlePointerMove(e8, route)}
        @pointerup=${(e8) => this._handlePointerUp(e8, route)}
        @pointercancel=${(e8) => this._handlePointerMove(e8, route)}>
        ${this._renderBadge(route, isActive)}

        <div class="button ${isActive ? "active" : ""}">
          ${this._getRouteIcon(route, isActive)}
          <md-ripple></md-ripple>
        </div>
        ${this._shouldShowLabels(false) ? x2`<div class="label ${isActive ? "active" : ""}">
              ${processTemplate(this.hass, route.label) ?? " "}
            </div>` : x2``}
      </div>
    `;
  };
  _closePopup = () => {
    const popup = this.shadowRoot?.querySelector(".navbar-popup");
    const backdrop = this.shadowRoot?.querySelector(".navbar-popup-backdrop");
    if (popup && backdrop) {
      popup.classList.remove("visible");
      backdrop.classList.remove("visible");
      setTimeout(() => {
        this._popup = null;
      }, 200);
    } else {
      this._popup = null;
    }
    window.removeEventListener("keydown", this._onPopupKeyDownListener);
  };
  _getPopupStyles(anchorRect, position) {
    const windowWidth = window.innerWidth;
    switch (position) {
      case "top":
        return {
          style: i4`
            top: ${anchorRect.top + anchorRect.height}px;
            left: ${anchorRect.x}px;
          `,
          labelPositionClassName: "label-right",
          popupDirectionClassName: "open-bottom"
        };
      case "left":
        return {
          style: i4`
            top: ${anchorRect.top}px;
            left: ${anchorRect.x + anchorRect.width}px;
          `,
          labelPositionClassName: "label-bottom",
          popupDirectionClassName: "open-right"
        };
      case "right":
        return {
          style: i4`
            top: ${anchorRect.top}px;
            right: ${windowWidth - anchorRect.x}px;
          `,
          labelPositionClassName: "label-bottom",
          popupDirectionClassName: "open-left"
        };
      case "bottom":
      case "mobile":
      default:
        if (anchorRect.x > windowWidth / 2) {
          return {
            style: i4`
              top: ${anchorRect.top}px;
              right: ${windowWidth - anchorRect.x - anchorRect.width}px;
            `,
            labelPositionClassName: "label-left",
            popupDirectionClassName: "open-up"
          };
        } else {
          return {
            style: i4`
              top: ${anchorRect.top}px;
              left: ${anchorRect.left}px;
            `,
            labelPositionClassName: "label-right",
            popupDirectionClassName: "open-up"
          };
        }
    }
  }
  _openPopup = (popupItems, target) => {
    if (!popupItems || popupItems.length === 0) {
      console.warn("No popup items provided");
      return;
    }
    const anchorRect = target.getBoundingClientRect();
    const { style, labelPositionClassName, popupDirectionClassName } = this._getPopupStyles(anchorRect, !this._isDesktop ? "mobile" : this._config?.desktop?.position ?? DEFAULT_DESKTOP_POSITION);
    this._popup = x2`
      <div
        class="navbar-popup-backdrop"</div>
      <div
        class="
          navbar-popup
          ${popupDirectionClassName}
          ${labelPositionClassName}
          ${this._isDesktop ? "desktop" : "mobile"}
        "
        style="${style}">
        ${popupItems.map((popupItem, index) => {
      if (processTemplate(this.hass, popupItem.hidden)) {
        return null;
      }
      return x2`<div
              class="
              popup-item 
              ${popupDirectionClassName}
              ${labelPositionClassName}
            "
              style="--index: ${index}"
              @click=${(e8) => this._handlePointerUp(e8, popupItem, true)}>
              ${this._renderBadge(popupItem, false)}

              <div class="button">
                ${this._getRouteIcon(popupItem, false)}
                <md-ripple></md-ripple>
              </div>
              ${this._shouldShowLabels(true) ? x2`<div class="label">
                    ${processTemplate(this.hass, popupItem.label) ?? " "}
                  </div>` : x2``}
            </div>`;
    }).filter((x3) => x3 != null)}
      </div>
    `;
    requestAnimationFrame(() => {
      const popup = this.shadowRoot?.querySelector(".navbar-popup");
      const backdrop = this.shadowRoot?.querySelector(".navbar-popup-backdrop");
      if (popup && backdrop) {
        popup.classList.add("visible");
        backdrop.classList.add("visible");
      }
    });
    window.addEventListener("keydown", this._onPopupKeyDownListener);
    setTimeout(() => {
      const backdrop = this.shadowRoot?.querySelector(".navbar-popup-backdrop");
      if (backdrop) {
        backdrop.addEventListener("click", (e8) => {
          e8.preventDefault();
          e8.stopPropagation();
          this._closePopup();
        });
      }
    }, 400);
  };
  _onPopupKeyDownListener = (e8) => {
    if (e8.key === "Escape" && this._popup) {
      e8.preventDefault();
      this._closePopup();
    }
  };
  _handlePointerDown = (e8, route) => {
    this.pointerStartX = e8.clientX;
    this.pointerStartY = e8.clientY;
    if (route.hold_action) {
      this.holdTriggered = false;
      this.holdTimeoutId = window.setTimeout(() => {
        if (this._shouldTriggerHaptic("hold")) {
          hapticFeedback();
        }
        this.holdTriggered = true;
      }, HOLD_ACTION_DELAY);
    }
  };
  _handlePointerMove = (e8, _route) => {
    if (!this.holdTimeoutId) {
      return;
    }
    const moveX = Math.abs(e8.clientX - this.pointerStartX);
    const moveY = Math.abs(e8.clientY - this.pointerStartY);
    if (moveX > 10 || moveY > 10) {
      if (this.holdTimeoutId !== null) {
        clearTimeout(this.holdTimeoutId);
        this.holdTimeoutId = null;
      }
    }
  };
  _handlePointerUp = (e8, route, isPopup = false) => {
    if (this.holdTimeoutId !== null) {
      clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }
    const currentTarget = e8.currentTarget;
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastTapTime;
    const isDoubleTap = timeDiff < DOUBLE_TAP_DELAY && e8.target === this.lastTapTarget;
    if (isDoubleTap && route.double_tap_action) {
      if (this.tapTimeoutId !== null) {
        clearTimeout(this.tapTimeoutId);
        this.tapTimeoutId = null;
      }
      this._handleDoubleTapAction(currentTarget, route, isPopup);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else if (this.holdTriggered && route.hold_action) {
      this._handleHoldAction(currentTarget, route, isPopup);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else {
      this.lastTapTime = currentTime;
      this.lastTapTarget = e8.target;
      this._handleTapAction(currentTarget, route, isPopup);
    }
    this.holdTriggered = false;
  };
  _handleHoldAction = (target, route, isPopupItem = false) => {
    this._executeAction(target, route, route.hold_action, "hold", isPopupItem);
  };
  _handleDoubleTapAction = (target, route, isPopupItem = false) => {
    this._executeAction(target, route, route.double_tap_action, "double_tap", isPopupItem);
  };
  _handleTapAction = (target, route, isPopupItem = false) => {
    if (route.double_tap_action) {
      this.tapTimeoutId = window.setTimeout(() => {
        this._executeAction(target, route, route.tap_action, "tap", isPopupItem);
      }, DOUBLE_TAP_DELAY);
    } else {
      this._executeAction(target, route, route.tap_action, "tap", isPopupItem);
    }
  };
  _executeAction = (target, route, action, actionType, isPopupItem = false) => {
    forceResetRipple(target);
    if (action?.action !== "open-popup" && isPopupItem) {
      this._closePopup();
    }
    if (!isPopupItem && action?.action === "open-popup") {
      const popupItems = route.popup ?? route.submenu;
      if (!popupItems) {
        console.error("No popup items found for route:", route);
      } else {
        if (this._shouldTriggerHaptic(actionType)) {
          hapticFeedback();
        }
        this._openPopup(popupItems, target);
      }
    } else if (action?.action === "toggle-menu") {
      if (this._shouldTriggerHaptic(actionType)) {
        hapticFeedback();
      }
      fireDOMEvent(this, "hass-toggle-menu", { bubbles: true, composed: true });
    } else if (action?.action === "navigate-back") {
      if (this._shouldTriggerHaptic(actionType, true)) {
        hapticFeedback();
      }
      window.history.back();
    } else if (action != null) {
      if (this._shouldTriggerHaptic(actionType)) {
        hapticFeedback();
      }
      fireDOMEvent(this, "hass-action", { bubbles: true, composed: true }, {
        action: actionType,
        config: {
          [`${actionType}_action`]: action
        }
      });
    } else if (actionType === "tap" && route.url) {
      if (this._shouldTriggerHaptic(actionType, true)) {
        hapticFeedback();
      }
      de(this, route.url);
    }
  };
  render() {
    if (!this._config) {
      return x2``;
    }
    const { routes, desktop, mobile } = this._config;
    const { position: desktopPosition, hidden: desktopHidden } = desktop ?? {};
    const { hidden: mobileHidden } = mobile ?? {};
    this._lastRender = new Date().getTime();
    const isEditMode = this._inEditDashboardMode || this._inPreviewMode || this._inEditCardMode;
    const desktopPositionClassname = mapStringToEnum(DesktopPosition, desktopPosition) ?? DEFAULT_DESKTOP_POSITION;
    const deviceModeClassName = this._isDesktop ? "desktop" : "mobile";
    const editModeClassname = isEditMode ? "edit-mode" : "";
    if (!isEditMode && (this._isDesktop && !!processTemplate(this.hass, desktopHidden) || !this._isDesktop && !!processTemplate(this.hass, mobileHidden))) {
      return x2``;
    }
    return x2`
      <ha-card
        class="navbar ${editModeClassname} ${deviceModeClassName} ${desktopPositionClassname}">
        ${routes?.map(this._renderRoute).filter((x3) => x3 != null)}
      </ha-card>
      ${this._popup}
    `;
  }
  generateCustomStyles() {
    const userStyles = this._config?.styles ? r4(this._config.styles) : i4``;
    return i4`
      ${getDefaultStyles()}
      ${userStyles}
    `;
  }
  _shouldTriggerHaptic(actionType, isNavigation = false) {
    const hapticConfig = this._config?.haptic;
    if (typeof hapticConfig === "boolean") {
      return hapticConfig;
    }
    if (!hapticConfig) {
      return !isNavigation;
    }
    if (isNavigation) {
      return hapticConfig.url ?? false;
    }
    switch (actionType) {
      case "tap":
        return hapticConfig.tap_action ?? false;
      case "hold":
        return hapticConfig.hold_action ?? false;
      case "double_tap":
        return hapticConfig.double_tap_action ?? false;
      default:
        return false;
    }
  }
}
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "hass", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_config", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_isDesktop", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_inEditDashboardMode", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_inEditCardMode", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_inPreviewMode", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_lastRender", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_location", undefined);
__legacyDecorateClassTS([
  r8()
], NavbarCard.prototype, "_popup", undefined);
NavbarCard = __legacyDecorateClassTS([
  t5("navbar-card")
], NavbarCard);
console.info(`%c navbar-card %c ${version} `, "background-color: #555;      padding: 6px 4px;      color: #fff;      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);       border-radius: 10px 0 0 10px;", "background-color: #00abd1;       padding: 6px 4px;      color: #fff;      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);       border-radius: 0 10px 10px 0;");
export {
  NavbarCard
};
