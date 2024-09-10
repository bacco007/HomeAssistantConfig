let $4fcaa3c95ba349ea$export$a4ad2735b021c132 = "v0.14.9";
let $4fcaa3c95ba349ea$export$6df7962ea75d9a39 = "https://a.espncdn.com/i/headshots/golf/players/full/";
let $4fcaa3c95ba349ea$export$7e154a1de2266268 = "https://a.espncdn.com/i/headshots/mma/players/full/";
let $4fcaa3c95ba349ea$export$c8a00e33d990d0fa = "https://a.espncdn.com/i/headshots/rpm/players/full/";
let $4fcaa3c95ba349ea$export$54565cc34e8d24d2 = "https://a.espncdn.com/i/headshots/tennis/players/full/";
let $4fcaa3c95ba349ea$export$607dc1951b62972e = "https://cdn-icons-png.freepik.com/512/9706/9706583.png";


//
//  Define and register the UI Card Editor 
//
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $def2de46b9306e8a$var$t = globalThis, $def2de46b9306e8a$export$b4d10f6001c083c2 = $def2de46b9306e8a$var$t.ShadowRoot && (void 0 === $def2de46b9306e8a$var$t.ShadyCSS || $def2de46b9306e8a$var$t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $def2de46b9306e8a$var$s = Symbol(), $def2de46b9306e8a$var$o = new WeakMap;
class $def2de46b9306e8a$export$505d1e8739bad805 {
    constructor(t, e, o){
        if (this._$cssResult$ = !0, o !== $def2de46b9306e8a$var$s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
        this.cssText = t, this.t = e;
    }
    get styleSheet() {
        let t = this.o;
        const s = this.t;
        if ($def2de46b9306e8a$export$b4d10f6001c083c2 && void 0 === t) {
            const e = void 0 !== s && 1 === s.length;
            e && (t = $def2de46b9306e8a$var$o.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), e && $def2de46b9306e8a$var$o.set(s, t));
        }
        return t;
    }
    toString() {
        return this.cssText;
    }
}
const $def2de46b9306e8a$export$8d80f9cac07cdb3 = (t)=>new $def2de46b9306e8a$export$505d1e8739bad805("string" == typeof t ? t : t + "", void 0, $def2de46b9306e8a$var$s), $def2de46b9306e8a$export$dbf350e5966cf602 = (t, ...e)=>{
    const o = 1 === t.length ? t[0] : e.reduce((e, s, o)=>e + ((t)=>{
            if (!0 === t._$cssResult$) return t.cssText;
            if ("number" == typeof t) return t;
            throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s) + t[o + 1], t[0]);
    return new $def2de46b9306e8a$export$505d1e8739bad805(o, t, $def2de46b9306e8a$var$s);
}, $def2de46b9306e8a$export$2ca4a66ec4cecb90 = (s, o)=>{
    if ($def2de46b9306e8a$export$b4d10f6001c083c2) s.adoptedStyleSheets = o.map((t)=>t instanceof CSSStyleSheet ? t : t.styleSheet);
    else for (const e of o){
        const o = document.createElement("style"), n = $def2de46b9306e8a$var$t.litNonce;
        void 0 !== n && o.setAttribute("nonce", n), o.textContent = e.cssText, s.appendChild(o);
    }
}, $def2de46b9306e8a$export$ee69dfd951e24778 = $def2de46b9306e8a$export$b4d10f6001c083c2 ? (t)=>t : (t)=>t instanceof CSSStyleSheet ? ((t)=>{
        let e = "";
        for (const s of t.cssRules)e += s.cssText;
        return $def2de46b9306e8a$export$8d80f9cac07cdb3(e);
    })(t) : t;


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const { is: $19fe8e3abedf4df0$var$i, defineProperty: $19fe8e3abedf4df0$var$e, getOwnPropertyDescriptor: $19fe8e3abedf4df0$var$r, getOwnPropertyNames: $19fe8e3abedf4df0$var$h, getOwnPropertySymbols: $19fe8e3abedf4df0$var$o, getPrototypeOf: $19fe8e3abedf4df0$var$n } = Object, $19fe8e3abedf4df0$var$a = globalThis, $19fe8e3abedf4df0$var$c = $19fe8e3abedf4df0$var$a.trustedTypes, $19fe8e3abedf4df0$var$l = $19fe8e3abedf4df0$var$c ? $19fe8e3abedf4df0$var$c.emptyScript : "", $19fe8e3abedf4df0$var$p = $19fe8e3abedf4df0$var$a.reactiveElementPolyfillSupport, $19fe8e3abedf4df0$var$d = (t, s)=>t, $19fe8e3abedf4df0$export$7312b35fbf521afb = {
    toAttribute (t, s) {
        switch(s){
            case Boolean:
                t = t ? $19fe8e3abedf4df0$var$l : null;
                break;
            case Object:
            case Array:
                t = null == t ? t : JSON.stringify(t);
        }
        return t;
    },
    fromAttribute (t, s) {
        let i = t;
        switch(s){
            case Boolean:
                i = null !== t;
                break;
            case Number:
                i = null === t ? null : Number(t);
                break;
            case Object:
            case Array:
                try {
                    i = JSON.parse(t);
                } catch (t) {
                    i = null;
                }
        }
        return i;
    }
}, $19fe8e3abedf4df0$export$53a6892c50694894 = (t, s)=>!$19fe8e3abedf4df0$var$i(t, s), $19fe8e3abedf4df0$var$y = {
    attribute: !0,
    type: String,
    converter: $19fe8e3abedf4df0$export$7312b35fbf521afb,
    reflect: !1,
    hasChanged: $19fe8e3abedf4df0$export$53a6892c50694894
};
Symbol.metadata ??= Symbol("metadata"), $19fe8e3abedf4df0$var$a.litPropertyMetadata ??= new WeakMap;
class $19fe8e3abedf4df0$export$c7c07a37856565d extends HTMLElement {
    static addInitializer(t) {
        this._$Ei(), (this.l ??= []).push(t);
    }
    static get observedAttributes() {
        return this.finalize(), this._$Eh && [
            ...this._$Eh.keys()
        ];
    }
    static createProperty(t, s = $19fe8e3abedf4df0$var$y) {
        if (s.state && (s.attribute = !1), this._$Ei(), this.elementProperties.set(t, s), !s.noAccessor) {
            const i = Symbol(), r = this.getPropertyDescriptor(t, i, s);
            void 0 !== r && $19fe8e3abedf4df0$var$e(this.prototype, t, r);
        }
    }
    static getPropertyDescriptor(t, s, i) {
        const { get: e, set: h } = $19fe8e3abedf4df0$var$r(this.prototype, t) ?? {
            get () {
                return this[s];
            },
            set (t) {
                this[s] = t;
            }
        };
        return {
            get () {
                return e?.call(this);
            },
            set (s) {
                const r = e?.call(this);
                h.call(this, s), this.requestUpdate(t, r, i);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) ?? $19fe8e3abedf4df0$var$y;
    }
    static _$Ei() {
        if (this.hasOwnProperty($19fe8e3abedf4df0$var$d("elementProperties"))) return;
        const t = $19fe8e3abedf4df0$var$n(this);
        t.finalize(), void 0 !== t.l && (this.l = [
            ...t.l
        ]), this.elementProperties = new Map(t.elementProperties);
    }
    static finalize() {
        if (this.hasOwnProperty($19fe8e3abedf4df0$var$d("finalized"))) return;
        if (this.finalized = !0, this._$Ei(), this.hasOwnProperty($19fe8e3abedf4df0$var$d("properties"))) {
            const t = this.properties, s = [
                ...$19fe8e3abedf4df0$var$h(t),
                ...$19fe8e3abedf4df0$var$o(t)
            ];
            for (const i of s)this.createProperty(i, t[i]);
        }
        const t = this[Symbol.metadata];
        if (null !== t) {
            const s = litPropertyMetadata.get(t);
            if (void 0 !== s) for (const [t, i] of s)this.elementProperties.set(t, i);
        }
        this._$Eh = new Map;
        for (const [t, s] of this.elementProperties){
            const i = this._$Eu(t, s);
            void 0 !== i && this._$Eh.set(i, t);
        }
        this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s) {
        const i = [];
        if (Array.isArray(s)) {
            const e = new Set(s.flat(1 / 0).reverse());
            for (const s of e)i.unshift((0, $def2de46b9306e8a$export$ee69dfd951e24778)(s));
        } else void 0 !== s && i.push((0, $def2de46b9306e8a$export$ee69dfd951e24778)(s));
        return i;
    }
    static _$Eu(t, s) {
        const i = s.attribute;
        return !1 === i ? void 0 : "string" == typeof i ? i : "string" == typeof t ? t.toLowerCase() : void 0;
    }
    constructor(){
        super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
    }
    _$Ev() {
        this._$ES = new Promise((t)=>this.enableUpdating = t), this._$AL = new Map, this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t)=>t(this));
    }
    addController(t) {
        (this._$EO ??= new Set).add(t), void 0 !== this.renderRoot && this.isConnected && t.hostConnected?.();
    }
    removeController(t) {
        this._$EO?.delete(t);
    }
    _$E_() {
        const t = new Map, s = this.constructor.elementProperties;
        for (const i of s.keys())this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
        t.size > 0 && (this._$Ep = t);
    }
    createRenderRoot() {
        const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
        return (0, $def2de46b9306e8a$export$2ca4a66ec4cecb90)(t, this.constructor.elementStyles), t;
    }
    connectedCallback() {
        this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t)=>t.hostConnected?.());
    }
    enableUpdating(t) {}
    disconnectedCallback() {
        this._$EO?.forEach((t)=>t.hostDisconnected?.());
    }
    attributeChangedCallback(t, s, i) {
        this._$AK(t, i);
    }
    _$EC(t, s) {
        const i = this.constructor.elementProperties.get(t), e = this.constructor._$Eu(t, i);
        if (void 0 !== e && !0 === i.reflect) {
            const r = (void 0 !== i.converter?.toAttribute ? i.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb).toAttribute(s, i.type);
            this._$Em = t, null == r ? this.removeAttribute(e) : this.setAttribute(e, r), this._$Em = null;
        }
    }
    _$AK(t, s) {
        const i = this.constructor, e = i._$Eh.get(t);
        if (void 0 !== e && this._$Em !== e) {
            const t = i.getPropertyOptions(e), r = "function" == typeof t.converter ? {
                fromAttribute: t.converter
            } : void 0 !== t.converter?.fromAttribute ? t.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb;
            this._$Em = e, this[e] = r.fromAttribute(s, t.type), this._$Em = null;
        }
    }
    requestUpdate(t, s, i) {
        if (void 0 !== t) {
            if (i ??= this.constructor.getPropertyOptions(t), !(i.hasChanged ?? $19fe8e3abedf4df0$export$53a6892c50694894)(this[t], s)) return;
            this.P(t, s, i);
        }
        !1 === this.isUpdatePending && (this._$ES = this._$ET());
    }
    P(t, s, i) {
        this._$AL.has(t) || this._$AL.set(t, s), !0 === i.reflect && this._$Em !== t && (this._$Ej ??= new Set).add(t);
    }
    async _$ET() {
        this.isUpdatePending = !0;
        try {
            await this._$ES;
        } catch (t) {
            Promise.reject(t);
        }
        const t = this.scheduleUpdate();
        return null != t && await t, !this.isUpdatePending;
    }
    scheduleUpdate() {
        return this.performUpdate();
    }
    performUpdate() {
        if (!this.isUpdatePending) return;
        if (!this.hasUpdated) {
            if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
                for (const [t, s] of this._$Ep)this[t] = s;
                this._$Ep = void 0;
            }
            const t = this.constructor.elementProperties;
            if (t.size > 0) for (const [s, i] of t)!0 !== i.wrapped || this._$AL.has(s) || void 0 === this[s] || this.P(s, this[s], i);
        }
        let t = !1;
        const s = this._$AL;
        try {
            t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((t)=>t.hostUpdate?.()), this.update(s)) : this._$EU();
        } catch (s) {
            throw t = !1, this._$EU(), s;
        }
        t && this._$AE(s);
    }
    willUpdate(t) {}
    _$AE(t) {
        this._$EO?.forEach((t)=>t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$EU() {
        this._$AL = new Map, this.isUpdatePending = !1;
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
        this._$Ej &&= this._$Ej.forEach((t)=>this._$EC(t, this[t])), this._$EU();
    }
    updated(t) {}
    firstUpdated(t) {}
}
$19fe8e3abedf4df0$export$c7c07a37856565d.elementStyles = [], $19fe8e3abedf4df0$export$c7c07a37856565d.shadowRootOptions = {
    mode: "open"
}, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("elementProperties")] = new Map, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("finalized")] = new Map, $19fe8e3abedf4df0$var$p?.({
    ReactiveElement: $19fe8e3abedf4df0$export$c7c07a37856565d
}), ($19fe8e3abedf4df0$var$a.reactiveElementVersions ??= []).push("2.0.4");


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $f58f44579a4747ac$var$n = globalThis, $f58f44579a4747ac$var$c = $f58f44579a4747ac$var$n.trustedTypes, $f58f44579a4747ac$var$h = $f58f44579a4747ac$var$c ? $f58f44579a4747ac$var$c.createPolicy("lit-html", {
    createHTML: (t)=>t
}) : void 0, $f58f44579a4747ac$var$f = "$lit$", $f58f44579a4747ac$var$v = `lit$${Math.random().toFixed(9).slice(2)}$`, $f58f44579a4747ac$var$m = "?" + $f58f44579a4747ac$var$v, $f58f44579a4747ac$var$_ = `<${$f58f44579a4747ac$var$m}>`, $f58f44579a4747ac$var$w = document, $f58f44579a4747ac$var$lt = ()=>$f58f44579a4747ac$var$w.createComment(""), $f58f44579a4747ac$var$st = (t)=>null === t || "object" != typeof t && "function" != typeof t, $f58f44579a4747ac$var$g = Array.isArray, $f58f44579a4747ac$var$$ = (t)=>$f58f44579a4747ac$var$g(t) || "function" == typeof t?.[Symbol.iterator], $f58f44579a4747ac$var$x = "[ 	\n\f\r]", $f58f44579a4747ac$var$T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, $f58f44579a4747ac$var$E = /-->/g, $f58f44579a4747ac$var$k = />/g, $f58f44579a4747ac$var$O = RegExp(`>|${$f58f44579a4747ac$var$x}(?:([^\\s"'>=/]+)(${$f58f44579a4747ac$var$x}*=${$f58f44579a4747ac$var$x}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), $f58f44579a4747ac$var$S = /'/g, $f58f44579a4747ac$var$j = /"/g, $f58f44579a4747ac$var$M = /^(?:script|style|textarea|title)$/i, $f58f44579a4747ac$var$P = (t)=>(i, ...s)=>({
            _$litType$: t,
            strings: i,
            values: s
        }), $f58f44579a4747ac$export$c0bb0b647f701bb5 = $f58f44579a4747ac$var$P(1), $f58f44579a4747ac$export$7ed1367e7fa1ad68 = $f58f44579a4747ac$var$P(2), $f58f44579a4747ac$export$47d5b44d225be5b4 = $f58f44579a4747ac$var$P(3), $f58f44579a4747ac$export$9c068ae9cc5db4e8 = Symbol.for("lit-noChange"), $f58f44579a4747ac$export$45b790e32b2810ee = Symbol.for("lit-nothing"), $f58f44579a4747ac$var$V = new WeakMap, $f58f44579a4747ac$var$I = $f58f44579a4747ac$var$w.createTreeWalker($f58f44579a4747ac$var$w, 129);
function $f58f44579a4747ac$var$N(t, i) {
    if (!$f58f44579a4747ac$var$g(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== $f58f44579a4747ac$var$h ? $f58f44579a4747ac$var$h.createHTML(i) : i;
}
const $f58f44579a4747ac$var$U = (t, i)=>{
    const s = t.length - 1, e = [];
    let h, o = 2 === i ? "<svg>" : 3 === i ? "<math>" : "", n = $f58f44579a4747ac$var$T;
    for(let i = 0; i < s; i++){
        const s = t[i];
        let r, l, c = -1, a = 0;
        for(; a < s.length && (n.lastIndex = a, l = n.exec(s), null !== l);)a = n.lastIndex, n === $f58f44579a4747ac$var$T ? "!--" === l[1] ? n = $f58f44579a4747ac$var$E : void 0 !== l[1] ? n = $f58f44579a4747ac$var$k : void 0 !== l[2] ? ($f58f44579a4747ac$var$M.test(l[2]) && (h = RegExp("</" + l[2], "g")), n = $f58f44579a4747ac$var$O) : void 0 !== l[3] && (n = $f58f44579a4747ac$var$O) : n === $f58f44579a4747ac$var$O ? ">" === l[0] ? (n = h ?? $f58f44579a4747ac$var$T, c = -1) : void 0 === l[1] ? c = -2 : (c = n.lastIndex - l[2].length, r = l[1], n = void 0 === l[3] ? $f58f44579a4747ac$var$O : '"' === l[3] ? $f58f44579a4747ac$var$j : $f58f44579a4747ac$var$S) : n === $f58f44579a4747ac$var$j || n === $f58f44579a4747ac$var$S ? n = $f58f44579a4747ac$var$O : n === $f58f44579a4747ac$var$E || n === $f58f44579a4747ac$var$k ? n = $f58f44579a4747ac$var$T : (n = $f58f44579a4747ac$var$O, h = void 0);
        const u = n === $f58f44579a4747ac$var$O && t[i + 1].startsWith("/>") ? " " : "";
        o += n === $f58f44579a4747ac$var$T ? s + $f58f44579a4747ac$var$_ : c >= 0 ? (e.push(r), s.slice(0, c) + $f58f44579a4747ac$var$f + s.slice(c) + $f58f44579a4747ac$var$v + u) : s + $f58f44579a4747ac$var$v + (-2 === c ? i : u);
    }
    return [
        $f58f44579a4747ac$var$N(t, o + (t[s] || "<?>") + (2 === i ? "</svg>" : 3 === i ? "</math>" : "")),
        e
    ];
};
class $f58f44579a4747ac$var$B {
    constructor({ strings: t, _$litType$: i }, s){
        let e;
        this.parts = [];
        let h = 0, o = 0;
        const n = t.length - 1, r = this.parts, [l, a] = $f58f44579a4747ac$var$U(t, i);
        if (this.el = $f58f44579a4747ac$var$B.createElement(l, s), $f58f44579a4747ac$var$I.currentNode = this.el.content, 2 === i || 3 === i) {
            const t = this.el.content.firstChild;
            t.replaceWith(...t.childNodes);
        }
        for(; null !== (e = $f58f44579a4747ac$var$I.nextNode()) && r.length < n;){
            if (1 === e.nodeType) {
                if (e.hasAttributes()) for (const t of e.getAttributeNames())if (t.endsWith($f58f44579a4747ac$var$f)) {
                    const i = a[o++], s = e.getAttribute(t).split($f58f44579a4747ac$var$v), n = /([.?@])?(.*)/.exec(i);
                    r.push({
                        type: 1,
                        index: h,
                        name: n[2],
                        strings: s,
                        ctor: "." === n[1] ? $f58f44579a4747ac$var$Y : "?" === n[1] ? $f58f44579a4747ac$var$Z : "@" === n[1] ? $f58f44579a4747ac$var$q : $f58f44579a4747ac$var$G
                    }), e.removeAttribute(t);
                } else t.startsWith($f58f44579a4747ac$var$v) && (r.push({
                    type: 6,
                    index: h
                }), e.removeAttribute(t));
                if ($f58f44579a4747ac$var$M.test(e.tagName)) {
                    const t = e.textContent.split($f58f44579a4747ac$var$v), i = t.length - 1;
                    if (i > 0) {
                        e.textContent = $f58f44579a4747ac$var$c ? $f58f44579a4747ac$var$c.emptyScript : "";
                        for(let s = 0; s < i; s++)e.append(t[s], $f58f44579a4747ac$var$lt()), $f58f44579a4747ac$var$I.nextNode(), r.push({
                            type: 2,
                            index: ++h
                        });
                        e.append(t[i], $f58f44579a4747ac$var$lt());
                    }
                }
            } else if (8 === e.nodeType) {
                if (e.data === $f58f44579a4747ac$var$m) r.push({
                    type: 2,
                    index: h
                });
                else {
                    let t = -1;
                    for(; -1 !== (t = e.data.indexOf($f58f44579a4747ac$var$v, t + 1));)r.push({
                        type: 7,
                        index: h
                    }), t += $f58f44579a4747ac$var$v.length - 1;
                }
            }
            h++;
        }
    }
    static createElement(t, i) {
        const s = $f58f44579a4747ac$var$w.createElement("template");
        return s.innerHTML = t, s;
    }
}
function $f58f44579a4747ac$var$z(t, i, s = t, e) {
    if (i === $f58f44579a4747ac$export$9c068ae9cc5db4e8) return i;
    let h = void 0 !== e ? s.o?.[e] : s.l;
    const o = $f58f44579a4747ac$var$st(i) ? void 0 : i._$litDirective$;
    return h?.constructor !== o && (h?._$AO?.(!1), void 0 === o ? h = void 0 : (h = new o(t), h._$AT(t, s, e)), void 0 !== e ? (s.o ??= [])[e] = h : s.l = h), void 0 !== h && (i = $f58f44579a4747ac$var$z(t, h._$AS(t, i.values), h, e)), i;
}
class $f58f44579a4747ac$var$F {
    constructor(t, i){
        this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
    }
    get parentNode() {
        return this._$AM.parentNode;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    u(t) {
        const { el: { content: i }, parts: s } = this._$AD, e = (t?.creationScope ?? $f58f44579a4747ac$var$w).importNode(i, !0);
        $f58f44579a4747ac$var$I.currentNode = e;
        let h = $f58f44579a4747ac$var$I.nextNode(), o = 0, n = 0, r = s[0];
        for(; void 0 !== r;){
            if (o === r.index) {
                let i;
                2 === r.type ? i = new $f58f44579a4747ac$var$et(h, h.nextSibling, this, t) : 1 === r.type ? i = new r.ctor(h, r.name, r.strings, this, t) : 6 === r.type && (i = new $f58f44579a4747ac$var$K(h, this, t)), this._$AV.push(i), r = s[++n];
            }
            o !== r?.index && (h = $f58f44579a4747ac$var$I.nextNode(), o++);
        }
        return $f58f44579a4747ac$var$I.currentNode = $f58f44579a4747ac$var$w, e;
    }
    p(t) {
        let i = 0;
        for (const s of this._$AV)void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
    }
}
class $f58f44579a4747ac$var$et {
    get _$AU() {
        return this._$AM?._$AU ?? this.v;
    }
    constructor(t, i, s, e){
        this.type = 2, this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this.v = e?.isConnected ?? !0;
    }
    get parentNode() {
        let t = this._$AA.parentNode;
        const i = this._$AM;
        return void 0 !== i && 11 === t?.nodeType && (t = i.parentNode), t;
    }
    get startNode() {
        return this._$AA;
    }
    get endNode() {
        return this._$AB;
    }
    _$AI(t, i = this) {
        t = $f58f44579a4747ac$var$z(this, t, i), $f58f44579a4747ac$var$st(t) ? t === $f58f44579a4747ac$export$45b790e32b2810ee || null == t || "" === t ? (this._$AH !== $f58f44579a4747ac$export$45b790e32b2810ee && this._$AR(), this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee) : t !== this._$AH && t !== $f58f44579a4747ac$export$9c068ae9cc5db4e8 && this._(t) : void 0 !== t._$litType$ ? this.$(t) : void 0 !== t.nodeType ? this.T(t) : $f58f44579a4747ac$var$$(t) ? this.k(t) : this._(t);
    }
    O(t) {
        return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    T(t) {
        this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
    }
    _(t) {
        this._$AH !== $f58f44579a4747ac$export$45b790e32b2810ee && $f58f44579a4747ac$var$st(this._$AH) ? this._$AA.nextSibling.data = t : this.T($f58f44579a4747ac$var$w.createTextNode(t)), this._$AH = t;
    }
    $(t) {
        const { values: i, _$litType$: s } = t, e = "number" == typeof s ? this._$AC(t) : (void 0 === s.el && (s.el = $f58f44579a4747ac$var$B.createElement($f58f44579a4747ac$var$N(s.h, s.h[0]), this.options)), s);
        if (this._$AH?._$AD === e) this._$AH.p(i);
        else {
            const t = new $f58f44579a4747ac$var$F(e, this), s = t.u(this.options);
            t.p(i), this.T(s), this._$AH = t;
        }
    }
    _$AC(t) {
        let i = $f58f44579a4747ac$var$V.get(t.strings);
        return void 0 === i && $f58f44579a4747ac$var$V.set(t.strings, i = new $f58f44579a4747ac$var$B(t)), i;
    }
    k(t) {
        $f58f44579a4747ac$var$g(this._$AH) || (this._$AH = [], this._$AR());
        const i = this._$AH;
        let s, e = 0;
        for (const h of t)e === i.length ? i.push(s = new $f58f44579a4747ac$var$et(this.O($f58f44579a4747ac$var$lt()), this.O($f58f44579a4747ac$var$lt()), this, this.options)) : s = i[e], s._$AI(h), e++;
        e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
    }
    _$AR(t = this._$AA.nextSibling, i) {
        for(this._$AP?.(!1, !0, i); t && t !== this._$AB;){
            const i = t.nextSibling;
            t.remove(), t = i;
        }
    }
    setConnected(t) {
        void 0 === this._$AM && (this.v = t, this._$AP?.(t));
    }
}
class $f58f44579a4747ac$var$G {
    get tagName() {
        return this.element.tagName;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    constructor(t, i, s, e, h){
        this.type = 1, this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = h, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String), this.strings = s) : this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee;
    }
    _$AI(t, i = this, s, e) {
        const h = this.strings;
        let o = !1;
        if (void 0 === h) t = $f58f44579a4747ac$var$z(this, t, i, 0), o = !$f58f44579a4747ac$var$st(t) || t !== this._$AH && t !== $f58f44579a4747ac$export$9c068ae9cc5db4e8, o && (this._$AH = t);
        else {
            const e = t;
            let n, r;
            for(t = h[0], n = 0; n < h.length - 1; n++)r = $f58f44579a4747ac$var$z(this, e[s + n], i, n), r === $f58f44579a4747ac$export$9c068ae9cc5db4e8 && (r = this._$AH[n]), o ||= !$f58f44579a4747ac$var$st(r) || r !== this._$AH[n], r === $f58f44579a4747ac$export$45b790e32b2810ee ? t = $f58f44579a4747ac$export$45b790e32b2810ee : t !== $f58f44579a4747ac$export$45b790e32b2810ee && (t += (r ?? "") + h[n + 1]), this._$AH[n] = r;
        }
        o && !e && this.j(t);
    }
    j(t) {
        t === $f58f44579a4747ac$export$45b790e32b2810ee ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
    }
}
class $f58f44579a4747ac$var$Y extends $f58f44579a4747ac$var$G {
    constructor(){
        super(...arguments), this.type = 3;
    }
    j(t) {
        this.element[this.name] = t === $f58f44579a4747ac$export$45b790e32b2810ee ? void 0 : t;
    }
}
class $f58f44579a4747ac$var$Z extends $f58f44579a4747ac$var$G {
    constructor(){
        super(...arguments), this.type = 4;
    }
    j(t) {
        this.element.toggleAttribute(this.name, !!t && t !== $f58f44579a4747ac$export$45b790e32b2810ee);
    }
}
class $f58f44579a4747ac$var$q extends $f58f44579a4747ac$var$G {
    constructor(t, i, s, e, h){
        super(t, i, s, e, h), this.type = 5;
    }
    _$AI(t, i = this) {
        if ((t = $f58f44579a4747ac$var$z(this, t, i, 0) ?? $f58f44579a4747ac$export$45b790e32b2810ee) === $f58f44579a4747ac$export$9c068ae9cc5db4e8) return;
        const s = this._$AH, e = t === $f58f44579a4747ac$export$45b790e32b2810ee && s !== $f58f44579a4747ac$export$45b790e32b2810ee || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, h = t !== $f58f44579a4747ac$export$45b790e32b2810ee && (s === $f58f44579a4747ac$export$45b790e32b2810ee || e);
        e && this.element.removeEventListener(this.name, this, s), h && this.element.addEventListener(this.name, this, t), this._$AH = t;
    }
    handleEvent(t) {
        "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
    }
}
class $f58f44579a4747ac$var$K {
    constructor(t, i, s){
        this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t) {
        $f58f44579a4747ac$var$z(this, t);
    }
}
const $f58f44579a4747ac$export$8613d1ca9052b22e = {
    M: $f58f44579a4747ac$var$f,
    P: $f58f44579a4747ac$var$v,
    A: $f58f44579a4747ac$var$m,
    C: 1,
    L: $f58f44579a4747ac$var$U,
    R: $f58f44579a4747ac$var$F,
    D: $f58f44579a4747ac$var$$,
    V: $f58f44579a4747ac$var$z,
    I: $f58f44579a4747ac$var$et,
    H: $f58f44579a4747ac$var$G,
    N: $f58f44579a4747ac$var$Z,
    U: $f58f44579a4747ac$var$q,
    B: $f58f44579a4747ac$var$Y,
    F: $f58f44579a4747ac$var$K
}, $f58f44579a4747ac$var$Re = $f58f44579a4747ac$var$n.litHtmlPolyfillSupport;
$f58f44579a4747ac$var$Re?.($f58f44579a4747ac$var$B, $f58f44579a4747ac$var$et), ($f58f44579a4747ac$var$n.litHtmlVersions ??= []).push("3.2.0");
const $f58f44579a4747ac$export$b3890eb0ae9dca99 = (t, i, s)=>{
    const e = s?.renderBefore ?? i;
    let h = e._$litPart$;
    if (void 0 === h) {
        const t = s?.renderBefore ?? null;
        e._$litPart$ = h = new $f58f44579a4747ac$var$et(i.insertBefore($f58f44579a4747ac$var$lt(), t), t, void 0, s ?? {});
    }
    return h._$AI(t), h;
};




/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ class $ab210b2da7b39b9d$export$3f2f9f5909897157 extends (0, $19fe8e3abedf4df0$export$c7c07a37856565d) {
    constructor(){
        super(...arguments), this.renderOptions = {
            host: this
        }, this.o = void 0;
    }
    createRenderRoot() {
        const t = super.createRenderRoot();
        return this.renderOptions.renderBefore ??= t.firstChild, t;
    }
    update(t) {
        const e = this.render();
        this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this.o = (0, $f58f44579a4747ac$export$b3890eb0ae9dca99)(e, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
        super.connectedCallback(), this.o?.setConnected(!0);
    }
    disconnectedCallback() {
        super.disconnectedCallback(), this.o?.setConnected(!1);
    }
    render() {
        return 0, $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
}
$ab210b2da7b39b9d$export$3f2f9f5909897157._$litElement$ = !0, $ab210b2da7b39b9d$export$3f2f9f5909897157["finalized"] = !0, globalThis.litElementHydrateSupport?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$var$f = globalThis.litElementPolyfillSupport;
$ab210b2da7b39b9d$var$f?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$export$f5c524615a7708d6 = {
    _$AK: (t, e, s)=>{
        t._$AK(e, s);
    },
    _$AL: (t)=>t._$AL
};
(globalThis.litElementVersions ??= []).push("4.1.0");


/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $a00bca1a101a9088$export$6acf61af03e62db = !1;




class $de5768471e29ae80$export$c622f67f045f310d extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    static get properties() {
        return {
            _config: {
                type: Object
            },
            currentPage: {
                type: String
            },
            entities: {
                type: Array
            },
            hass: {
                type: Object
            },
            _entity: {
                type: String
            }
        };
    }
    constructor(){
        super();
        this.currentPage = "card";
        this._entity = "";
        this.entities = [];
        this._formValueChanged = this._formValueChanged.bind(this);
    }
    setConfig(config) {
        if (!config) throw new Error("Invalid configuration");
        this._config = config;
        this._entity = config.entity || "";
    }
    get config() {
        return this._config;
    }
    updated(changedProperties) {
        if (changedProperties.has("hass")) this.fetchEntities();
        if (changedProperties.has("_config") && this._config && this._config.entity) this._entity = this._config.entity;
    }
    fetchEntities() {
        if (this.hass) this.entities = Object.keys(this.hass.states).filter((e)=>e.startsWith("sensor.") && this.hass.states[e].attributes.hasOwnProperty("sport")).sort((a, b)=>a.localeCompare(b));
    }
    configChanged(newConfig) {
        const event = new Event("config-changed", {
            bubbles: true,
            composed: true
        });
        event.detail = {
            config: newConfig
        };
        this.dispatchEvent(event);
    }
    _EntityChanged(event, key) {
        if (!this._config) return;
        const newConfig = {
            ...this._config
        };
        if (key === "entity") {
            newConfig.entity = event.target.value;
            this._entity = event.target.value;
        }
        this.configChanged(newConfig);
        this.requestUpdate();
    }
    _valueChanged(event, key) {
        if (!this._config) return;
        let newConfig = {
            ...this._config
        };
        if (key.includes(".")) {
            const parts = key.split(".");
            let currentLevel = newConfig;
            for(let i = 0; i < parts.length - 1; i++){
                const part = parts[i];
                currentLevel[part] = {
                    ...currentLevel[part]
                };
                currentLevel = currentLevel[part];
            }
            const finalKey = parts[parts.length - 1];
            if (event.target.checked !== undefined) currentLevel[finalKey] = event.target.checked;
            else currentLevel[finalKey] = event.target.value;
        } else if (event.target.checked !== undefined) newConfig[key] = event.target.checked;
        else newConfig[key] = event.target.value;
        this.configChanged(newConfig);
        this.requestUpdate();
    }
    _formValueChanged(event) {
        if (event.target.tagName.toLowerCase() === "ha-form") {
            const newConfig = event.detail.value;
            this.configChanged(newConfig);
            this.requestUpdate();
        }
    }
    // This function is called when the input element of the editor loses focus
    entityChanged(ev) {
        // We make a copy of the current config so we don't accidentally overwrite anything too early
        const _config = Object.assign({}, this._config);
        // Then we update the entity value with what we just got from the input field
        _config.entity = ev.target.value;
        // And finally write back the updated configuration all at once
        this._config = _config;
        // A config-changed event will tell lovelace we have made changed to the configuration
        // this make sure the changes are saved correctly later and will update the preview
        const event = new CustomEvent("config-changed", {
            detail: {
                config: _config
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
    render() {
        if (!this.hass || !this._config) return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)``;
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
        <style>
        .switch-label {
            padding-left: 14px;
        }
        .switch-container {
            margin-top: 12px;
            margin-left: 15px;

        }
        .textfield-container {
            display: flex;
            flex-direction: column;
            margin-bottom: 10px;
            gap: 0px;
        }
        .ha-textfield {
            flex-basis: 50%;
            flex-grow: 1;
        }
        .indented-container {
            margin-left: 55px;
        }
        h4 {
            margin-bottom: 0px;
        }
        </style>
        <div>
            <h4>Teamtracker Sensor:</h4>
            <div class="textfield-container">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Entity"
                    .configValue=${"entity"}
                    .value=${this._entity}
                    @change=${(e)=>this._EntityChanged(e, "entity")}
                    @closed=${(ev)=>ev.stopPropagation()}
                    >
                    ${this.entities.map((entity)=>{
            return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<ha-list-item .value=${entity}>${entity}</ha-list-item>`;
        })}
                </ha-select>
            </div>
            <hr>
            <h4>Settings:</h4>
            <ha-select
                naturalMenuWidth
                fixedMenuPosition
                .configValue=${"home_side"}
                .value=${this._config.home_side}
                @change=${(e)=>this._valueChanged(e, "home_side")}
                @closed=${(ev)=>ev.stopPropagation()}
                >
                <ha-list-item .value=${""}>Team on Left</ha-list-item>
                <ha-list-item .value=${"left"}>Home on Left</ha-list-item>
                <ha-list-item .value=${"right"}>Home on Right</ha-list-item>
            </ha-select>
            <div class="switch-container">
                <ha-switch
                    @change="${(e)=>this._valueChanged(e, "show_league")}"
                    .checked="${this._config.show_league === true}"
                    >
                </ha-switch>
                <label class="switch-label">
                    Show League
                </label>
            </div>
            <div class="switch-container">
                <ha-switch
                    @change="${(e)=>this._valueChanged(e, "show_rank")}"
                    .checked="${this._config.show_rank !== false}"
                    >
                </ha-switch>
                <label class="switch-label">
                    Show Rank
                </label>
            </div>
            <div class="switch-container">    
                <ha-switch
                    @change="${(e)=>this._valueChanged(e, "show_timeouts")}"
                    .checked="${this._config.show_timeouts !== false}"
                    >
                </ha-switch>
                <label class="switch-label">
                    Show Timeouts
                </label>
            </div>
            <div class="switch-container">    
                <ha-switch
                    @change="${(e)=>this._valueChanged(e, "outline")}"
                    .checked="${this._config.outline === true}"
                    >
                </ha-switch>
                <label class="switch-label">
                    Show Outline
                </label>
            </div>
            <div class="indented-container">
                <ha-textfield
                    label="Outline Color"
                    .value="${this._config.outline_color || "lightgrey"}"
                    @change="${(e)=>this._valueChanged(e, "outline_color")}"
                    >
                </ha-textfield>
            </div>
            <hr>
            <h4>Overrides:</h4>
            <ha-textfield
                label="Title"
                .value="${this._config.card_title || ""}"
                @change="${(e)=>this._valueChanged(e, "card_title")}"
                >
            </ha-textfield>
            </br>
            <ha-textfield
                label="Team URL"
                .value="${this._config.team_url || ""}"
                @change="${(e)=>this._valueChanged(e, "team_url")}"
                >
            </ha-textfield>
            </br>
            <ha-textfield
                label="Opponent URL"
                .value="${this._config.opponent_url || ""}"
                @change="${(e)=>this._valueChanged(e, "opponent_url")}"
                >
            </ha-textfield>
            </br>
            <ha-textfield
                label="Bottom URL"
                .value="${this._config.bottom_url || ""}"
                @change="${(e)=>this._valueChanged(e, "bottom_url")}"
                >
            </ha-textfield>
            <hr>
            <div class="switch-container">    
                <ha-switch
                    @change="${(e)=>this._valueChanged(e, "debug")}"
                    .checked="${this._config.debug === true}"
                    >
                </ha-switch>
                <label class="switch-label">
                    Show Debug Info
                </label>
            </div>
        </div>
        `;
    }
}



const $044e49bbd03ccfb1$export$2fa162a495d26869 = {
    "common": {
        "api_error": "API Error",
        "no_upcoming_games": "Keine anstehenden Spiele bis %s",
        "finalTerm": "%s - Endergebnis",
        "byeTerm": "BYE",
        "tourney2": "Finale",
        "tourney4": "Halbfinale",
        "tourney8": "Viertelfinale",
        "tourney16": "Achtelfinale",
        "tourney32": "Sechzehntelfinale",
        "tourney64": "Vorrunde",
        "tourney128": "Vorrunde",
        "tourney256": "Vorrunde",
        "today": "Heute",
        "tomorrow": "Morgen"
    },
    "australian-football": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Gewinnchance",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "First Pitch",
        "overUnder": "O/U: %s",
        "gameStat1": "Balls %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Gewinnchance",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Tipoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Gewinnchance",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Gewinnchance",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Kickoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Gewinnchance",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Round Starts",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots (Thru)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Puck Drop",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Torsch\xfcsse",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Gewinnchance",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Runden",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Ansto\xdf",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Torsch\xfcsse",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "First Serve",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Aufschlag",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Score",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Gewinnchance",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $e5e336768a089693$export$c3da0dad1b44eea9 = {
    "common": {
        "api_error": "\u03A3\u03C6\u03AC\u03BB\u03BC\u03B1 API",
        "no_upcoming_games": "\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03C0\u03C1\u03BF\u03C3\u03B5\u03C7\u03B5\u03AF\u03C2 \u03B1\u03B3\u03CE\u03BD\u03B5\u03C2 \u03AD\u03C9\u03C2 %s",
        "finalTerm": "%s - \u03A4\u03B5\u03BB\u03B9\u03BA\u03CC\u03C2",
        "byeTerm": "\u0391\u039D\u0391\u03A0\u0391\u03A5\u03A3\u0397",
        "tourney2": "\u03A4\u03B5\u03BB\u03B9\u03BA\u03CC\u03C2",
        "tourney4": "\u0397\u03BC\u03B9\u03C4\u03B5\u03BB\u03B9\u03BA\u03BF\u03AF",
        "tourney8": "\u03A0\u03C1\u03BF\u03B7\u03BC\u03B9\u03C4\u03B5\u03BB\u03B9\u03BA\u03BF\u03AF",
        "tourney16": "\u03A6\u03AC\u03C3\u03B7 \u03C4\u03C9\u03BD 16",
        "tourney32": "\u03A6\u03AC\u03C3\u03B7 \u03C4\u03C9\u03BD 32",
        "tourney64": "\u03A6\u03AC\u03C3\u03B7 \u03C4\u03C9\u03BD 64",
        "tourney128": "\u03A0\u03C1\u03CE\u03B9\u03BC\u03B5\u03C2 \u03A6\u03AC\u03C3\u03B5\u03B9\u03C2",
        "tourney256": "\u03A0\u03C1\u03CE\u03B9\u03BC\u03B5\u03C2 \u03A6\u03AC\u03C3\u03B5\u03B9\u03C2",
        "today": "\u03A3\u03AE\u03BC\u03B5\u03C1\u03B1",
        "tomorrow": "\u0391\u03CD\u03C1\u03B9\u03BF"
    },
    "australian-football": {
        "startTerm": "\u0388\u03BD\u03B1\u03C1\u03BE\u03B7",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u039D\u03AF\u03BA\u03B7\u03C2",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "\u03A0\u03C1\u03CE\u03C4\u03B7 \u03A1\u03AF\u03C8\u03B7",
        "overUnder": "O/U: %s",
        "gameStat1": "\u039C\u03C0\u03AC\u03BB\u03B5\u03C2 %s",
        "gameStat2": "\u03A7\u03C4\u03C5\u03C0\u03AE\u03BC\u03B1\u03C4\u03B1 %s",
        "gameStat3": "%s \u0386\u03BF\u03C5\u03C4",
        "gameBar": "\u03A0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u039D\u03AF\u03BA\u03B7\u03C2",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "\u03A4\u03B6\u03AC\u03BC\u03C0\u03BF\u03BB",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u039D\u03AF\u03BA\u03B7\u03C2",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "\u0388\u03BD\u03B1\u03C1\u03BE\u03B7",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u039D\u03AF\u03BA\u03B7\u03C2",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "\u03A3\u03AD\u03BD\u03C4\u03C1\u03B1",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u039D\u03AF\u03BA\u03B7\u03C2",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "\u0388\u03BD\u03B1\u03C1\u03BE\u03B7 \u0393\u03CD\u03C1\u03BF\u03C5",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A7\u03C4\u03C5\u03C0\u03AE\u03BC\u03B1\u03C4\u03B1 (\u039C\u03AD\u03C7\u03C1\u03B9)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "\u0388\u03BD\u03B1\u03C1\u03BE\u03B7 \u03A0\u03B1\u03B9\u03C7\u03BD\u03B9\u03B4\u03B9\u03BF\u03CD",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A3\u03BF\u03C5\u03C4 \u03C3\u03C4\u03BF \u03A4\u03AD\u03C1\u03BC\u03B1",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "\u0388\u03BD\u03B1\u03C1\u03BE\u03B7",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u039D\u03AF\u03BA\u03B7\u03C2",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "\u0388\u03BD\u03B1\u03C1\u03BE\u03B7",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u0393\u03CD\u03C1\u03BF\u03B9",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "\u03A3\u03AD\u03BD\u03C4\u03C1\u03B1",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A3\u03BF\u03C5\u03C4 (\u03A3\u03C4\u03BF\u03BD \u03A3\u03C4\u03CC\u03C7\u03BF)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "\u03A0\u03C1\u03CE\u03C4\u03BF \u03A3\u03B5\u03C1\u03B2\u03AF\u03C2",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "\u03A0\u03C1\u03CE\u03C4\u03BF \u03A3\u03B5\u03C1\u03B2\u03AF\u03C2",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A3\u03BA\u03BF\u03C1 %s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "\u0388\u03BD\u03B1\u03C1\u03BE\u03B7",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\u03A0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u039D\u03AF\u03BA\u03B7\u03C2",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $9bf8d9821f43b5a3$export$84584c2a98eb6753 = {
    "common": {
        "api_error": "API Error",
        "no_upcoming_games": "No upcoming games through %s",
        "finalTerm": "%s - Final",
        "byeTerm": "BYE",
        "tourney2": "Final",
        "tourney4": "Semifinals",
        "tourney8": "Quarterfinals",
        "tourney16": "Round of 16",
        "tourney32": "Round of 32",
        "tourney64": "Round of 64",
        "tourney128": "Early Rounds",
        "tourney256": "Early Rounds",
        "today": "Today",
        "tomorrow": "Tomorrow"
    },
    "australian-football": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "First Pitch",
        "overUnder": "O/U: %s",
        "gameStat1": "Balls %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Tipoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Kickoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Round Starts",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots (Thru)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Puck Drop",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots on Goal",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Laps",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Kickoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots (On Target)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "First Serve",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "First Serve",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Score",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $738479ced03534bd$export$25dc44e90bc68e13 = {
    "common": {
        "api_error": "API Error",
        "no_upcoming_games": "No upcoming games through %s",
        "finalTerm": "%s - Final",
        "byeTerm": "BYE",
        "tourney2": "Final",
        "tourney4": "Semifinals",
        "tourney8": "Quarterfinals",
        "tourney16": "Round of 16",
        "tourney32": "Round of 32",
        "tourney64": "Round of 64",
        "tourney128": "Early Rounds",
        "tourney256": "Early Rounds",
        "today": "Today",
        "tomorrow": "Tomorrow"
    },
    "australian-football": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "First Pitch",
        "overUnder": "O/U: %s",
        "gameStat1": "Balls %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Tipoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Kickoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Round Starts",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots (Thru)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Puck Drop",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots on Goal",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Laps",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Kickoff",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots (On Target)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "First Serve",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "First Serve",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Score",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $fa59b11c3970eda2$export$ca5e4045a55e76d2 = {
    "common": {
        "api_error": "Error de API",
        "no_upcoming_games": "No hay pr\xf3ximos juegos hasta el %s",
        "finalTerm": "%s - Final",
        "byeTerm": "DESCANSO",
        "tourney2": "Final",
        "tourney4": "Semifinales",
        "tourney8": "Cuartos de Finals",
        "tourney16": "Octavos de Finals",
        "tourney32": "Ronda de 32",
        "tourney64": "Ronda de 64",
        "tourney128": "Primeras Rondas",
        "tourney256": "Primeras Rondas",
        "today": "Hoy",
        "tomorrow": "Ma\xf1ana"
    },
    "australian-football": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "Bolas %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiros (Trav\xe9s De)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiros a Puerta",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vueltas",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiros (A Puerta)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": " Puntaje de %s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $b35902dfc88d0d3b$export$13aa9a2e371cd2fd = {
    "common": {
        "api_error": "Error de API",
        "no_upcoming_games": "No hay pr\xf3ximos juegos hasta el %s",
        "finalTerm": "%s - Final",
        "byeTerm": "DESCANSO",
        "tourney2": "Final",
        "tourney4": "Semifinales",
        "tourney8": "Cuartos de Finals",
        "tourney16": "Octavos de Finals",
        "tourney32": "Ronda de 32",
        "tourney64": "Ronda de 64",
        "tourney128": "Primeras Rondas",
        "tourney256": "Primeras Rondas",
        "today": "Hoy",
        "tomorrow": "Ma\xf1ana"
    },
    "australian-football": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "Bolas %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiros (Trav\xe9s De)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiros a Puerta",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vueltas",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiros (A Puerta)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": " Puntaje de %s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Comienzo",
        "overUnder": "M\xe1s/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidad de Ganar",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $4f808b6be6c4ddc7$export$acb2a88f7d552ebf = {
    "common": {
        "api_error": "Erreur API",
        "no_upcoming_games": "Aucun match pr\xe9vu pour l'instant %s",
        "finalTerm": "%s - Terminer",
        "byeTerm": "Au revoir",
        "tourney2": "Terminer",
        "tourney4": "Demi finale",
        "tourney8": "Quart de finale",
        "tourney16": "Round de 16",
        "tourney32": "Round de 32",
        "tourney64": "Round de 64",
        "tourney128": "Premier round",
        "tourney256": "Premiers Rounds",
        "today": "Aujourd'hui",
        "tomorrow": "Demain"
    },
    "australian-football": {
        "startTerm": "Commencer",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe9 de victoire",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "Premier lancer",
        "overUnder": "O/U: %s",
        "gameStat1": "Balls %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Probabilit\xe9 de victoire",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Astuce",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe9 de victoire",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Commencer",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe9 de victoire",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "D\xe9marrer",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe9 de victoire",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Debut du Round",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tirs (\xe0 travers)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Lancer de rondelle",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tirs au but",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Commencer",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe9 de victoire",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Commencer",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tours",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "D\xe9marrer",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tirs (cadrer)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "Premier service",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Premier service",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Score",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Commencer",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe9 de victoire",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $d573fc5554189e19$export$3486a10f30cf1ee4 = {
    "common": {
        "api_error": "API Error",
        "no_upcoming_games": "Nessun Match imminente %s",
        "finalTerm": "%s - Finale",
        "byeTerm": "Ciao",
        "tourney2": "Finale",
        "tourney4": "Semifinale",
        "tourney8": "Quarti di finale",
        "tourney16": "Sedicesimi",
        "tourney32": "Trentaduesimi",
        "tourney64": "Sessantaquattresimi",
        "tourney128": "Gironi",
        "tourney256": "Gironi",
        "today": "Oggi",
        "tomorrow": "Domani"
    },
    "australian-football": {
        "startTerm": "Inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe0 di vittoria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "Primo lancio",
        "overUnder": "O/U: %s",
        "gameStat1": "Balls %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Probabilit\xe0 di vittoria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Palla a due",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe0 di vittoria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe0 di vittoria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Calcio di inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe0 di vittoria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Colpi (attraverso)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiri in porta",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe0 di vittoria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Partenza",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Giri",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Calcio di inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Tiri (In porta)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "Primo servizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Primo servizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Punteggio",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Inizio",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilit\xe0 di vittoria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $48e4764806fa7a6b$export$9c64ee4d84d79ce1 = {
    "common": {
        "api_error": "API Fout",
        "no_upcoming_games": "Geen aanstaande wedstrijden t/m %s",
        "finalTerm": "Einduitslag - %s",
        "byeTerm": "D\xe1\xe1\xe1g!",
        "tourney2": "Finale",
        "tourney4": "Halve Finale",
        "tourney8": "Kwart Finale",
        "tourney16": "Achtste Finale",
        "tourney32": "Zestiende Finale",
        "tourney64": "Twee\xebndertigste Finale",
        "tourney128": "Voorronde",
        "tourney256": "Voorronde",
        "today": "Vandaag",
        "tomorrow": "Morgen"
    },
    "australian-football": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Win Probability",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "Eerste Worp",
        "overUnder": "O/U: %s",
        "gameStat1": "%s Wijd",
        "gameStat2": "%s Slag",
        "gameStat3": "%s Uit",
        "gameBar": "Winstwaarschijnlijkheid",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Sprongbal",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Winstwaarschijnlijkheid",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Winstwaarschijnlijkheid",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Aftrap",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Winstwaarschijnlijkheid",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Ronde Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Schoten (Thru)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Puck Drop",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Schoten op Doel",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Winstwaarschijnlijkheid",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Rondes",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Aftrap",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Schoten (Op Doel)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "Eerste Service",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Eerste Service",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Score",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Winstwaarschijnlijkheid",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $60a4d35e5022a9df$export$9dc8766c8c230075 = {
    "common": {
        "api_error": "Erro de API",
        "no_upcoming_games": "Sem pr\xf3ximos jogos %s",
        "finalTerm": "%s - Final",
        "byeTerm": "DESCANSO",
        "today": "Hoje",
        "tomorrow": "Amanh\xe3"
    },
    "baseball": {
        "startTerm": "Come\xe7a",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "Bolas %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Fora",
        "gameBar": "Probabilidade de Vit\xf3ria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Come\xe7a",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidade de Vit\xf3ria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Come\xe7a",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidade de Vit\xf3ria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Come\xe7a",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidade de Vit\xf3ria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "hockey": {
        "startTerm": "Come\xe7a",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Chutes no Gol",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Come\xe7a",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Chutes no Gol",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Primeiro servi\xe7o",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": " Pontos %s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Come\xe7a",
        "overUnder": "Mais/Menos: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Probabilidade de Vit\xf3ria",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $06041e2b1c26c877$export$d608fa5b5bfd2021 = {
    "common": {
        "api_error": "Chyba API",
        "no_upcoming_games": "\u017Diadn\xfd nadch\xe1dzaj\xfaci z\xe1pas do %s",
        "finalTerm": "%s - Koniec",
        "byeTerm": "Vo\u013Eno",
        "tourney2": "Fin\xe1le",
        "tourney4": "Semifin\xe1le",
        "tourney8": "\u0160tvr\u0165fin\xe1le",
        "tourney16": "Posledn\xfdch 16",
        "tourney32": "Posledn\xfdch 32",
        "tourney64": "Posledn\xfdch 64",
        "tourney128": "Prv\xe9 kol\xe1",
        "tourney256": "Prv\xe9 kol\xe1",
        "today": "Dnes",
        "tomorrow": "Zajtra"
    },
    "australian-football": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "Prv\xfd nadhod",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "Odpaly %s",
        "gameStat2": "Minut\xe9 odpaly %s",
        "gameStat3": "%s Outy",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Rozkok",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "V\xfdkop",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Za\u010Diatky kola",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\xdadery (Cez)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Strata Puku",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Strely na br\xe1nu",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Okruhy",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "V\xfdkop",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Strely (Na br\xe1nu)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "Prv\xfd servis",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Prv\xfd servis",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Sk\xf3re",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $125926858f90b59c$export$b2bcf639de11a4af = {
    "common": {
        "api_error": "Chyba API",
        "no_upcoming_games": "\u017Diadn\xfd nadch\xe1dzaj\xfaci z\xe1pas do %s",
        "finalTerm": "%s - Koniec",
        "byeTerm": "Vo\u013Eno",
        "tourney2": "Fin\xe1le",
        "tourney4": "Semifin\xe1le",
        "tourney8": "\u0160tvr\u0165fin\xe1le",
        "tourney16": "Posledn\xfdch 16",
        "tourney32": "Posledn\xfdch 32",
        "tourney64": "Posledn\xfdch 64",
        "tourney128": "Prv\xe9 kol\xe1",
        "tourney256": "Prv\xe9 kol\xe1",
        "today": "Dnes",
        "tomorrow": "Zajtra"
    },
    "australian-football": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "Prv\xfd nadhod",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "Odpaly %s",
        "gameStat2": "Minut\xe9 odpaly %s",
        "gameStat3": "%s Outy",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Rozkok",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "V\xfdkop",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Za\u010Diatky kola",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "\xdadery (Cez)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Strata Puku",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Strely na br\xe1nu",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Okruhy",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "V\xfdkop",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Strely (Na br\xe1nu)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "Prv\xfd servis",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "Prv\xfd servis",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Sk\xf3re",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "\u0160tart",
        "overUnder": "Viac/Menej: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Pravdepodobnos\u0165 v\xfdhry",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


const $f594c62d0c6e32a5$export$65540e5f7f6e7dce = {
    "common": {
        "api_error": "API Error",
        "no_upcoming_games": "Inga kommande matcher %s",
        "finalTerm": "%s - Final",
        "byeTerm": "BYE",
        "tourney2": "Final",
        "tourney4": "Semifinaler",
        "tourney8": "Kvartsfinaler",
        "tourney16": "\xc5ttondelsfinal",
        "tourney32": "Sextondelsfinal",
        "today": "Idag",
        "tomorrow": "Imorgon"
    },
    "australian-football": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vinstsannolikhet",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "baseball": {
        "startTerm": "F\xf6rsta pitch",
        "overUnder": "O/U: %s",
        "gameStat1": "Bollar %s",
        "gameStat2": "Strikes %s",
        "gameStat3": "%s Outs",
        "gameBar": "Vinstsannolikhet",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "basketball": {
        "startTerm": "Avkast",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vinstsannolikhet",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "cricket": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vinstsannolikhet",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "football": {
        "startTerm": "Avspark",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vinstsannolikhet",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "golf": {
        "startTerm": "Omg\xe5ngen startar",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Shots (Thru)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "hockey": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Skott p\xe5 m\xe5l",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "mma": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vinstsannolikhet",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    },
    "racing": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Varv",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "soccer": {
        "startTerm": "Avspark",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Skott (p\xe5 m\xe5l)",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "tennis": {
        "startTerm": "F\xf6rsta serve",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "volleyball": {
        "startTerm": "F\xf6rsta serve",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "%s Score",
        "teamBarLabel": "%s",
        "oppoBarLabel": "%s"
    },
    "default": {
        "startTerm": "Start",
        "overUnder": "O/U: %s",
        "gameStat1": "%s",
        "gameStat2": "%s",
        "gameStat3": "",
        "gameBar": "Vinstsannolikhet",
        "teamBarLabel": "%s%",
        "oppoBarLabel": "%s%"
    }
};


var $cfd70fadc94c42c5$var$languages = {
    de: (0, $044e49bbd03ccfb1$export$2fa162a495d26869),
    el: (0, $e5e336768a089693$export$c3da0dad1b44eea9),
    en: (0, $9bf8d9821f43b5a3$export$84584c2a98eb6753),
    en_US: (0, $738479ced03534bd$export$25dc44e90bc68e13),
    es: (0, $fa59b11c3970eda2$export$ca5e4045a55e76d2),
    es_419: (0, $b35902dfc88d0d3b$export$13aa9a2e371cd2fd),
    nl: (0, $48e4764806fa7a6b$export$9c64ee4d84d79ce1),
    fr: (0, $4f808b6be6c4ddc7$export$acb2a88f7d552ebf),
    it: (0, $d573fc5554189e19$export$3486a10f30cf1ee4),
    pt_BR: (0, $60a4d35e5022a9df$export$9dc8766c8c230075),
    sk: (0, $06041e2b1c26c877$export$d608fa5b5bfd2021),
    sk_SK: (0, $125926858f90b59c$export$b2bcf639de11a4af),
    sv: (0, $f594c62d0c6e32a5$export$65540e5f7f6e7dce)
};
class $cfd70fadc94c42c5$export$9850010f89e291bb {
    constructor(lang = "en"){
        this.lang = lang.replace(/['"]+/g, "").replace("-", "_");
    }
    translate(key, search, replace) {
        var lang = this.lang;
        var translated;
        search = search || "";
        replace = replace || "";
        try {
            translated = key.split(".").reduce(function(o, i) {
                return o[i];
            }, $cfd70fadc94c42c5$var$languages[lang]);
        } catch (e) {
            try {
                translated = key.split(".").reduce(function(o, i) {
                    return o[i];
                }, $cfd70fadc94c42c5$var$languages[lang].substring(0, 2));
            } catch (e) {
                try {
                    translated = key.split(".").reduce(function(o, i) {
                        return o[i];
                    }, $cfd70fadc94c42c5$var$languages["en"]);
                } catch (e) {
                    translated = "{" + key + "}";
                }
            }
        }
        if (translated === undefined || !(typeof translated === "string") && !(translated instanceof String)) translated = "{" + key + "}";
        if (search !== "" && replace !== "") translated = translated.replace(search, replace);
        return translated;
    }
}




function $6af844b6602814f2$export$eac7a64041e7dd4f(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <ha-card>
        <div class="card">
            <img class="team-bg" src="${c.logoBG[team]}"
                onerror="this.onerror=null; this.src='${c.logoBGAlternate[team]}';" />
            <div class="card-content">
                <div class="team">
                    <img class="logo" src="${c.logo[team]}" 
                        onerror="this.onerror=null; this.src='${c.logoAlternate[team]}'; this.onerror=function() { this.src='${c.logoError[team]}'; };" />
                    <div class="name">${c.name[team]}</div>
                </div>
                <div class="bye">${c.byeTerm}</div>
            </div>
        </div>
    </ha-card>
`;
    // Return the HTML template
    return htmlTemplate;
}



function $07b3e4094688f328$export$b2e19b637b85e37f() {
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)``;
    // Return the HTML template
    return htmlTemplate;
}
function $07b3e4094688f328$export$adab126bb38c4dbc(entity) {
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
        <ha-card>Unknown entity: ${entity}</ha-card> 
    `;
    // Return the HTML template
    return htmlTemplate;
}
function $07b3e4094688f328$export$83a5095ba0388927(entity) {
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <style>
        ha-card {padding: 10px 16px;}
    </style>
    <ha-card>
        Sensor unavailable: ${entity}
    </ha-card>
    `;
    // Return the HTML template
    return htmlTemplate;
}
function $07b3e4094688f328$export$e26cf6a49fd1ec72() {
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <style>
        ha-card {padding: 10px 16px;}
    </style>
    <ha-card>
        State Invalid: ${this._config.state}
    </ha-card>
    `;
    // Return the HTML template
    return htmlTemplate;
}




/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $107bb7d062dde330$export$9ba3b3f20a85bfa = {
    ATTRIBUTE: 1,
    CHILD: 2,
    PROPERTY: 3,
    BOOLEAN_ATTRIBUTE: 4,
    EVENT: 5,
    ELEMENT: 6
}, $107bb7d062dde330$export$99b43ad1ed32e735 = (t)=>(...e)=>({
            _$litDirective$: t,
            values: e
        });
class $107bb7d062dde330$export$befdefbdce210f91 {
    constructor(t){}
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AT(t, e, i) {
        this.t = t, this._$AM = e, this.i = i;
    }
    _$AS(t, e) {
        return this.update(t, e);
    }
    update(t, e) {
        return this.render(...e);
    }
}


/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $19f464fcda7d2482$var$ee = "important", $19f464fcda7d2482$var$ie = " !" + $19f464fcda7d2482$var$ee, $19f464fcda7d2482$export$1e5b4ce2fa884e6a = (0, $107bb7d062dde330$export$99b43ad1ed32e735)(class extends (0, $107bb7d062dde330$export$befdefbdce210f91) {
    constructor(e){
        if (super(e), e.type !== (0, $107bb7d062dde330$export$9ba3b3f20a85bfa).ATTRIBUTE || "style" !== e.name || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
    }
    render(t) {
        return Object.keys(t).reduce((e, r)=>{
            const s = t[r];
            return null == s ? e : e + `${r = r.includes("-") ? r : r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
        }, "");
    }
    update(t, [e]) {
        const { style: r } = t.element;
        if (void 0 === this.ft) return this.ft = new Set(Object.keys(e)), this.render(e);
        for (const t of this.ft)null == e[t] && (this.ft.delete(t), t.includes("-") ? r.removeProperty(t) : r[t] = null);
        for(const t in e){
            const s = e[t];
            if (null != s) {
                this.ft.add(t);
                const e = "string" == typeof s && s.endsWith($19f464fcda7d2482$var$ie);
                t.includes("-") || e ? r.setProperty(t, e ? s.slice(0, -11) : s, e ? $19f464fcda7d2482$var$ee : "") : r[t] = s;
            }
        }
        return 0, $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
});




function $654f96c20a3bcd40$export$3f4c9efb42c5bfd8(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <ha-card>
        <div class="card">
            <div class="title">${c.title}</div>
            <img class="team-bg" src="${c.logoBG[1]}"
                onerror="this.onerror=null; this.src='${c.logoBGAlternate[1]}';" />
            <img class="opponent-bg" src="${c.logoBG[2]}"
                onerror="this.onerror=null; this.src='${c.logoBGAlternate[2]}';" />
            <div class="card-content">
                <div class="team">
                    <a class="left-clickable ${!c.url[1] ? "disabled" : ""}" href="${c.url[1] ? c.url[1] : "#"}" target="_blank">
                        <img class="logo" src="${c.logo[1]}" 
                            onerror="this.onerror=null; this.src='${c.logoAlternate[1]}'; this.onerror=function() { this.src='${c.logoError[1]}'; };" />
                        <div class="name"><span class="rank" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--rank-display": `${c.rankDisplay}`
    })}>${c.rank[1]}</span> ${c.name[1]}</div>
                        <div class="record">${c.record[1]}</div>
                        <div class="timeouts-wrapper" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeouts-display": `${c.timeoutsDisplay}`
    })}>
                            <div class="timeout" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeout-opacity": `${c.timeoutsOp[1][1]}`,
        "--timeout-color": `${c.color[1]}`,
        "--timeout-border": `${c.outlineWidth}px`,
        "--timeout-border-color": `${c.outlineColor}`
    })}></div>
                            <div class="timeout" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeout-opacity": `${c.timeoutsOp[1][2]}`,
        "--timeout-color": `${c.color[1]}`,
        "--timeout-border": `${c.outlineWidth}px`,
        "--timeout-border-color": `${c.outlineColor}`
    })}></div>
                            <div class="timeout" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeout-opacity": `${c.timeoutsOp[1][3]}`,
        "--timeout-color": `${c.color[1]}`,
        "--timeout-border": `${c.outlineWidth}px`,
        "--timeout-border-color": `${c.outlineColor}`
    })}></div>
                        </div>
                    </a>
                </div>
                <div class="possession" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--possession-opacity": `${c.possessionOp[1]}`
    })}>&bull;</div>
                <div class="score" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--score_size": `${c.scoreSize}`
    })}>${c.score[1]}</div>
                <div class="divider">&nbsp&nbsp&nbsp</div>
                <div class="score" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--score_size": `${c.scoreSize}`
    })}>${c.score[2]}</div>
                <div class="possession" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--possession-opacity": `${c.possessionOp[2]}`
    })}>&bull;</div>
                <div class="team">
                    <a class="right-clickable ${!c.url[2] ? "disabled" : ""}" href="${c.url[2] ? c.url[2] : "#"}" target="_blank">
                        <img class="logo" src="${c.logo[2]}" 
                            onerror="this.onerror=null; this.src='${c.logoAlternate[2]}'; this.onerror=function() { this.src='${c.logoError[2]}'; };" />
                        <div class="name"><span class="rank" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--rank-display": `${c.rankDisplay}`
    })}>${c.rank[2]}</span> ${c.name[2]}</div>
                        <div class="record">${c.record[2]}</div>
                        <div class="timeouts-wrapper" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeouts-display": `${c.timeoutsDisplay}`
    })}>
                            <div class="timeout" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeout-opacity": `${c.timeoutsOp[2][1]}`,
        "--timeout-color": `${c.color[2]}`,
        "--timeout-border": `${c.outlineWidth}px`,
        "--timeout-border-color": `${c.outlineColor}`
    })}></div>
                            <div class="timeout" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeout-opacity": `${c.timeoutsOp[2][2]}`,
        "--timeout-color": `${c.color[2]}`,
        "--timeout-border": `${c.outlineWidth}px`,
        "--timeout-border-color": `${c.outlineColor}`
    })}></div>
                            <div class="timeout" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--timeout-opacity": `${c.timeoutsOp[2][3]}`,
        "--timeout-color": `${c.color[2]}`,
        "--timeout-border": `${c.outlineWidth}px`,
        "--timeout-border-color": `${c.outlineColor}`
    })}></div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="play-clock">${c.playClock}</div>
            <div class="bases" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--bases-display": `${c.basesDisplay}`
    })}>
                <div class="on-base" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--on-base-opacity": `${c.onSecondOp}`
    })}>&bull;</div>
            </div>
            <div class="bases" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--bases-display": `${c.basesDisplay}`
    })}>
                <div class="on-base" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--on-base-opacity": `${c.onThirdOp}`
    })}>&bull;</div>
                <div class="pitcher"></div>
                <div class="on-base" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--on-base-opacity": `${c.onFirstOp}`
    })}>&bull;</div>
            </div>
            <div class="outs" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--outs-display": `${c.outsDisplay}`
    })}>${c.in0}</div>
            <div class="in-series-info" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--series_summary-display": `${c.seriesSummaryDisplay}`
    })}>${c.seriesSummary}</div>
            <div class="line"></div>
            <a class="bottom-clickable ${!c.bottomURL ? "disabled" : ""}" href="${c.bottomURL ? c.bottomURL : "#"}" target="_blank">
                <div class="in-row1">
                    <div class="venue">${c.venue}</div>
                    <div class="down-distance">${c.in1}</div>
                </div>
                <div class="in-row2">
                    <div class="location">${c.location}</div>
                    <div class="network">${c.in2}</div>
                </div>
                <div class="line"></div>
                <div class="last-play" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--last-play-speed": `${c.lastPlaySpeed}s`
    })}>
                    <p>${c.lastPlay}</p>
                </div>
                <div class="bar-wrapper" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--bar-display": `${c.barDisplay}`
    })}>
                    <div class="bar-text">${c.gameBar}</div>
                    <div class="bar">
                        <div class="bar1-label">${c.barLabel[1]}</div>
                        <div class="bar-flex">
                            <div class="bar-left"  style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--bar-length": `${c.barLength[1]}%`,
        "--bar-color": `${c.color[1]}`,
        "--bar-border": `${c.outlineWidth}px`,
        "--bar-border-color": `${c.outlineColor}`
    })}></div>
                            <div class="bar-right" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--bar-length": `${c.barLength[2]}%`,
        "--bar-color": `${c.color[2]}`,
        "--bar-border": `${c.outlineWidth}px`,
        "--bar-border-color": `${c.outlineColor}`
    })}></div>
                        </div>
                        <div class="bar2-label">${c.barLabel[2]}</div>
                    </div>
                </div>
            </a>
        </div>
    </ha-card>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a.disabled').forEach(function(link) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                });
            });
        });
    </script>
    `; // Return the HTML template
    return htmlTemplate;
}



function $5cc9eebd21270610$export$cbe2629e62de17f0(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
        <ha-card>
            <div class="card">
                <div class="title">${c.title}</div>
                <img class="team-bg" src="${c.notFoundLogoBG}" />
                <div class="card-content">
                    <div class="team">
                        <img class="logo" src="${c.notFoundLogoBG}" />
                        <div class="notFoundLeague">${c.notFoundLeague}</div>
                    </div>
                    <div class="notFoundWrapper">
                        <div class="notFound1">${c.notFoundTerm1}</div>
                        <div class="notFound2">${c.notFoundTerm2}</div>
                    </div>
                </div>
            </div>
        </ha-card>
    `;
    // Return the HTML template
    return htmlTemplate;
}




function $ba84a5acf45954c4$export$823f4865e91cfbff(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <ha-card>
        <div class="card">
            <div class="title">${c.title}</div>
            <img class="team-bg" src="${c.logoBG[1]}"
                onerror="this.onerror=null; this.src='${c.logoBGAlternate[1]}';" />
            <img class="opponent-bg" src="${c.logoBG[2]}"
                onerror="this.onerror=null; this.src='${c.logoBGAlternate[2]}';" />
            <div class="card-content">
                <div class="team">
                    <a class="left-clickable ${!c.url[1] ? "disabled" : ""}" href="${c.url[1] ? c.url[1] : "#"}" target="_blank">
                        <img class="logo" src="${c.logo[1]}" 
                            onerror="this.onerror=null; this.src='${c.logoAlternate[1]}'; this.onerror=function() { this.src='${c.logoError[1]}'; };" />
                        <div class="name"><span class="rank" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--rank-display": c.rankDisplay
    })}>${c.rank[1]}</span> ${c.name[1]}</div>
                        <div class="record">${c.record[1]}</div>
                    </a>
                </div>
                <div class="score" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--score_opacity": c.scoreOp[1],
        "--score_size": c.scoreSize
    })}>${c.score[1]}</div>
                <div class="divider">&nbsp&nbsp&nbsp</div>
                <div class="score" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--score_opacity": c.scoreOp[2],
        "--score_size": c.scoreSize
    })}>${c.score[2]}</div>
                <div class="team">
                    <a class="right-clickable ${!c.url[2] ? "disabled" : ""}" href="${c.url[2] ? c.url[2] : "#"}" target="_blank">
                        <img class="logo" src="${c.logo[2]}" 
                            onerror="this.onerror=null; this.src='${c.logoAlternate[2]}'; this.onerror=function() { this.src='${c.logoError[2]}'; };" />
                        <div class="name"><span class="rank" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--rank-display": c.rankDisplay
    })}>${c.rank[2]}</span> ${c.name[2]}</div>
                        <div class="record">${c.record[2]}</div>
                    </a>
                </div>
            </div>
            <a class="bottom-clickable ${!c.bottomURL ? "disabled" : ""}" href="${c.bottomURL ? c.bottomURL : "#"}" target="_blank">
                <div class="post-row1">${c.finalTerm}</div>
                <div class="post-series-info" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--series-summary-display": c.seriesSummaryDisplay
    })}>${c.seriesSummary}</div>
            </a>
        </div>
    </ha-card>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a.disabled').forEach(function(link) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                });
            });
        });
    </script>
    `; // Return the HTML template
    return htmlTemplate;
}




function $32e2f72be859b718$export$d6bad15bd473a528(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <ha-card>
        <div class="card">
            <div class="title">${c.title}</div>
            <img class="team-bg" src="${c.logoBG[1]}"
                onerror="this.onerror=null; this.src='${c.logoBGAlternate[1]}';" />
            <img class="opponent-bg" src="${c.logoBG[2]}"
                onerror="this.onerror=null; this.src='${c.logoBGAlternate[2]}';" />
            <div class="card-content">
                <div class="team">
                    <a class="left-clickable ${!c.url[1] ? "disabled" : ""}" href="${c.url[1] ? c.url[1] : "#"}" target="_blank">
                        <img class="logo" src="${c.logo[1]}" 
                            onerror="this.onerror=null; this.src='${c.logoAlternate[1]}'; this.onerror=function() { this.src='${c.logoError[1]}'; };" />
                        <div class="name"><span class="rank" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--rank-display": `${c.rankDisplay}`
    })}>${c.rank[1]}</span> ${c.name[1]}</div>
                        <div class="record">${c.record[1]}</div>
                    </a>
                </div>
                <div class="gamewrapper">
                    <div class="gameday">${c.gameWeekday}</div>
                    <div class="gamedate">${c.gameDatePRE}</div>
                    <div class="gametime">${c.gameTime}</div>
                </div>
                <div class="team">
                    <a class="right-clickable ${!c.url[2] ? "disabled" : ""}" href="${c.url[2] ? c.url[2] : "#"}" target="_blank">
                        <img class="logo" src="${c.logo[2]}" 
                            onerror="this.onerror=null; this.src='${c.logoAlternate[2]}'; this.onerror=function() { this.src='${c.logoError[2]}'; };" />
                        <div class="name"><span class="rank" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--rank-display": `${c.rankDisplay}`
    })}>${c.rank[2]}</span> ${c.name[2]}</div>
                        <div class="record">${c.record[2]}</div>
                    </a>
                </div>
            </div>
            <div class="pre-series-info" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        "--series_summary-display": `${c.seriesSummaryDisplay}`
    })}>${c.seriesSummary}</div>
            <div class="line"></div>
            <a class="bottom-clickable ${!c.bottomURL ? "disabled" : ""}" href="${c.bottomURL ? c.bottomURL : "#"}" target="_blank">
                <div class="pre-row1">
                    <div class="date">${c.startTerm} ${c.startTime}</div>
                    <div class="odds">${c.pre1}</div>
                </div>
                <div class="pre-row2">
                    <div class="venue">${c.venue}</div>
                    <div class="overunder"> ${c.pre2}</div>
                </div>
                <div class="pre-row3">
                    <div class="location">${c.location}</div>
                    <div class="network">${c.pre3}</div>
                </div>
            </a>
        </div>
    </ha-card>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a.disabled').forEach(function(link) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                });
            });
        });
    </script>
    `; // Return the HTML template
    return htmlTemplate;
}



function $84bc952fd23869d6$export$554552fb00f06e66(c) {
    c.logoBG = [];
    c.logoBGAlternate = [];
    c.logo = [];
    c.logoAlternate = [];
    c.logoError = [];
    c.name = [];
    c.url = [];
    c.initials = [];
    c.rank = [];
    c.record = [];
    c.score = [];
    c.scoreOp = [];
    c.scoreSize = "3em";
    c.barLabel = [];
    c.barLength = [];
    c.color = [];
    c.possessionOp = [];
    c.winner = [];
    c.timeoutsOp = [];
    c.timeoutsOp[1] = [];
    c.timeoutsOp[2] = [];
}
function $84bc952fd23869d6$export$2e2366488d12e20d(t, lang, stateObj, c, o, sport, team, oppo) {
    // Set default sections to display / hide
    c.initialsDisplay = "none";
    c.outsDisplay = "none";
    c.basesDisplay = "none";
    c.barDisplay = "inherit";
    c.timeoutsDisplay = "inline";
    c.rankDisplay = "inline";
    c.seriesSummaryDisplay = "none";
    if (o.bottomURL == "more-info") c.bottomURL = null;
    else c.bottomURL = o.bottomURL || stateObj.attributes.event_url;
    if (o.show_timeouts == false) c.timeoutsDisplay = "none";
    if (o.show_rank == false) c.rankDisplay = "none";
    c.onFirstOp = 0.2;
    c.onSecondOp = 0.2;
    c.onThirdOp = 0.2;
    if (stateObj.attributes.on_first) c.onFirstOp = 1;
    if (stateObj.attributes.on_second) c.onSecondOp = 1;
    if (stateObj.attributes.on_third) c.onThirdOp = 1;
    // Set Title data
    c.title = o.cardTitle;
    if (o.showLeague) c.title = c.title || stateObj.attributes.league;
    // Set Scoreboard data
    c.logo[team] = stateObj.attributes.team_logo;
    c.logoAlternate[team] = stateObj.attributes.team_logo;
    if (c.logo[team] && o.darkMode) c.logo[team] = c.logo[team].replace("/500/", "/500-dark/");
    c.logoError[team] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
    c.logoBG[team] = stateObj.attributes.team_logo;
    c.logoBGAlternate[team] = stateObj.attributes.team_logo;
    c.name[team] = stateObj.attributes.team_name;
    if (o.teamURL == "more-info") c.url[team] = null;
    else c.url[team] = o.teamURL || stateObj.attributes.team_url;
    c.rank[team] = stateObj.attributes.team_rank;
    c.record[team] = stateObj.attributes.team_record;
    c.winner[team] = stateObj.attributes.team_winner || false;
    c.logo[oppo] = stateObj.attributes.opponent_logo;
    c.logoAlternate[oppo] = stateObj.attributes.opponent_logo;
    if (c.logo[oppo] && o.darkMode) c.logo[oppo] = c.logo[oppo].replace("/500/", "/500-dark/");
    c.logoError[oppo] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
    c.logoBG[oppo] = stateObj.attributes.opponent_logo;
    c.logoBGAlternate[oppo] = stateObj.attributes.opponent_logo;
    c.name[oppo] = stateObj.attributes.opponent_name;
    if (o.opponentURL == "more-info") c.url[oppo] = null;
    else c.url[oppo] = o.opponentURL || stateObj.attributes.opponent_url;
    c.rank[oppo] = stateObj.attributes.opponent_rank;
    c.record[oppo] = stateObj.attributes.opponent_record;
    c.winner[oppo] = stateObj.attributes.opponent_winner || false;
    c.playClock = stateObj.attributes.clock;
    if (o.showLeague) {
        c.logoBG[team] = stateObj.attributes.league_logo;
        c.logoBGAlternate[team] = stateObj.attributes.league_logo;
        c.logoBG[oppo] = stateObj.attributes.league_logo;
        c.logoBGAlternate[oppo] = stateObj.attributes.league_logo;
    }
    if (c.logoBG[team] && o.darkMode) c.logoBG[team] = c.logoBG[team].replace("/500/", "/500-dark/");
    if (c.logoBG[oppo] && o.darkMode) c.logoBG[oppo] = c.logoBG[oppo].replace("/500/", "/500-dark/");
    c.score[team] = stateObj.attributes.team_score;
    c.score[oppo] = stateObj.attributes.opponent_score;
    c.scoreOp[1] = .6;
    c.scoreOp[2] = .6;
    if (c.winner[team]) c.scoreOp[team] = 1;
    if (c.winner[oppo]) c.scoreOp[oppo] = 1;
    if (stateObj.attributes.team_homeaway == "home") {
        c.color[team] = stateObj.attributes.team_colors[0];
        c.color[oppo] = stateObj.attributes.opponent_colors[1];
    } else if (stateObj.attributes.team_homeaway == "away") {
        c.color[team] = stateObj.attributes.team_colors[1];
        c.color[oppo] = stateObj.attributes.opponent_colors[0];
    } else {
        c.color[team] = "#ffffff";
        c.color[oppo] = "#000000";
    }
    c.possessionOp[team] = 0;
    c.possessionOp[oppo] = 0;
    if (stateObj.attributes.possession == stateObj.attributes.team_id) c.possessionOp[team] = 1;
    if (stateObj.attributes.possession == stateObj.attributes.opponent_id) c.possessionOp[oppo] = 1;
    c.timeoutsOp[team][1] = stateObj.attributes.team_timeouts >= 1 ? 1 : 0.2;
    c.timeoutsOp[team][2] = stateObj.attributes.team_timeouts >= 2 ? 1 : 0.2;
    c.timeoutsOp[team][3] = stateObj.attributes.team_timeouts >= 3 ? 1 : 0.2;
    c.timeoutsOp[oppo][1] = stateObj.attributes.opponent_timeouts >= 1 ? 1 : 0.2;
    c.timeoutsOp[oppo][2] = stateObj.attributes.opponent_timeouts >= 2 ? 1 : 0.2;
    c.timeoutsOp[oppo][3] = stateObj.attributes.opponent_timeouts >= 3 ? 1 : 0.2;
    // Set Location / Context data
    c.startTerm = t.translate(sport + ".startTerm");
    c.startTime = stateObj.attributes.kickoff_in;
    c.venue = stateObj.attributes.venue;
    c.location = stateObj.attributes.location;
    c.pre1 = stateObj.attributes.odds;
    c.pre2 = "";
    if (stateObj.attributes.overunder) c.pre2 = t.translate(sport + ".overUnder", "%s", String(stateObj.attributes.overunder));
    c.pre3 = stateObj.attributes.tv_network;
    c.in0 = "";
    c.in1 = "";
    if (stateObj.attributes.down_distance_text) c.in1 = t.translate(sport + ".gameStat1", "%s", stateObj.attributes.down_distance_text);
    c.in2 = "";
    if (stateObj.attributes.tv_network) c.in2 = t.translate(sport + ".gameStat2", "%s", stateObj.attributes.tv_network);
    c.finalTerm = stateObj.attributes.clock + " - " + c.gameDatePOST;
    // Set Play data
    c.lastPlay = stateObj.attributes.last_play;
    c.lastPlaySpeed = 18;
    if (c.lastPlay) c.lastPlaySpeed = 18 + Math.floor(c.lastPlay.length / 40) * 5;
    // Set Game Bar data
    c.gameBar = t.translate(sport + ".gameBar");
    c.barLength[team] = 0;
    if (stateObj.attributes.team_win_probability) c.barLength[team] = (stateObj.attributes.team_win_probability * 100).toFixed(0);
    c.barLength[oppo] = 0;
    if (stateObj.attributes.opponent_win_probability) c.barLength[oppo] = (stateObj.attributes.opponent_win_probability * 100).toFixed(0);
    c.barLabel[team] = t.translate(sport + ".teamBarLabel", "%s", String(c.barLength[team]));
    c.barLabel[oppo] = t.translate(sport + ".oppoBarLabel", "%s", String(c.barLength[oppo]));
    // Situation specific data
    c.notFoundLogo = stateObj.attributes.league_logo;
    c.notFoundLogoBG = c.notFoundLogo;
    c.notFoundLeague = null;
    if (stateObj.attributes.league != "XXX") c.notFoundLeague = stateObj.attributes.league;
    c.notFoundTerm1 = stateObj.attributes.team_abbr;
    c.notFoundTerm2 = "NOT_FOUND";
    if (stateObj.attributes.api_message) {
        c.notFoundTerm2 = t.translate("common.api_error");
        var apiTail = stateObj.attributes.api_message.substring(stateObj.attributes.api_message.length - 17);
        if (apiTail.slice(-1) == "Z") {
            var lastDateForm = new Date(apiTail);
            c.notFoundTerm2 = t.translate("common.no_upcoming_games", "%s", lastDateForm.toLocaleDateString(lang));
        }
    }
    c.byeTerm = t.translate("common.byeTerm");
    c.seriesSummary = stateObj.attributes.series_summary;
    if (c.seriesSummary) c.seriesSummaryDisplay = "inherit";
}
function $84bc952fd23869d6$export$f8996dc3406efa5a(o, c) {
    c.outlineWidth = 0;
    c.outlineColor = o.outlineColor;
    if (o.outline == true) c.outlineWidth = 1;
}
function $84bc952fd23869d6$export$539ef78a097046ba(c, stateObj, t, lang, time_format) {
    var gameDate = new Date(stateObj.attributes.date);
    var gameDateStr = gameDate.toLocaleDateString(lang, {
        month: "short",
        day: "2-digit"
    });
    var todayDate = new Date();
    var todayDateStr = todayDate.toLocaleDateString(lang, {
        month: "short",
        day: "2-digit"
    });
    var tomorrowDate = new Date();
    tomorrowDate.setDate(todayDate.getDate() + 1);
    var tomorrowDateStr = tomorrowDate.toLocaleDateString(lang, {
        month: "short",
        day: "2-digit"
    });
    var nextweekDate = new Date();
    nextweekDate.setDate(todayDate.getDate() + 6);
    c.gameWeekday = gameDate.toLocaleDateString(lang, {
        weekday: "long"
    });
    if (gameDateStr === todayDateStr) c.gameWeekday = t.translate("common.today");
    else if (gameDateStr === tomorrowDateStr) c.gameWeekday = t.translate("common.tomorrow");
    c.gameDatePOST = gameDateStr;
    c.gameDatePRE = null;
    if (gameDate > nextweekDate) c.gameDatePRE = gameDateStr;
    c.gameTime = gameDate.toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit"
    });
    if (time_format == "24") c.gameTime = gameDate.toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
    if (time_format == "12") c.gameTime = gameDate.toLocaleTimeString(lang, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
    if (time_format == "system") {
        var sys_lang = navigator.language || "en";
        c.gameTime = gameDate.toLocaleTimeString(sys_lang, {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
}



function $8d10daf0cda71373$export$42406174c4ed4231(sport, t, stateObj, c, team, oppo) {
    switch(sport){
        case "baseball":
            return $8d10daf0cda71373$export$e9b71e702ec65841(t, stateObj, c, team, oppo);
        case "basketball":
            return $8d10daf0cda71373$export$d7bcdef8b0eb1304(t, stateObj, c, team, oppo);
        case "cricket":
            return $8d10daf0cda71373$export$8e398608f504e816(t, stateObj, c, team, oppo);
        case "golf":
            return $8d10daf0cda71373$export$d4f0019d7c6b6a3d(t, stateObj, c, team, oppo);
        case "hockey":
            return $8d10daf0cda71373$export$5a6583dd53975e58(t, stateObj, c, team, oppo);
        case "mma":
            return $8d10daf0cda71373$export$b95402321280aab2(t, stateObj, c, team, oppo);
        case "racing":
            return $8d10daf0cda71373$export$75a82cd3fb272a60(t, stateObj, c, team, oppo);
        case "soccer":
            return $8d10daf0cda71373$export$215e00a8cdeadf2(t, stateObj, c, team, oppo);
        case "tennis":
            return $8d10daf0cda71373$export$b80102c1df210e4f(t, stateObj, c, team, oppo);
        case "volleyball":
            return $8d10daf0cda71373$export$ae478c65328ff5a5(t, stateObj, c, team, oppo);
        default:
            return;
    }
}
function $8d10daf0cda71373$export$e9b71e702ec65841(t, stateObj, c, team, oppo) {
    c.in1 = t.translate("baseball.gameStat1", "%s", String(stateObj.attributes.balls));
    c.in2 = t.translate("baseball.gameStat2", "%s", String(stateObj.attributes.strikes));
    c.in0 = t.translate("baseball.gameStat3", "%s", String(stateObj.attributes.outs));
    c.outsDisplay = "inherit";
    c.timeoutsDisplay = "none";
    c.basesDisplay = "inherit";
}
function $8d10daf0cda71373$export$d7bcdef8b0eb1304(t, stateObj, c, team, oppo) {
    c.timeoutsDisplay = "none";
    c.barDisplay = "none";
}
function $8d10daf0cda71373$export$8e398608f504e816(t, stateObj, c, team, oppo) {
    var subscores = [];
    c.timeoutsDisplay = "none";
    c.barDisplay = "none";
    c.in1 = stateObj.attributes.odds;
    c.in2 = stateObj.attributes.quarter;
    if (c.score != []) {
        if (c.score[1] || c.score[2]) {
            subscores[1] = c.score[1].split("(");
            subscores[2] = c.score[2].split("(");
            c.score[1] = subscores[1][0];
            c.score[2] = subscores[2][0];
            if (subscores[1].length > 1) c.record[1] = "(" + subscores[1][1];
            if (subscores[2].length > 1) c.record[2] = "(" + subscores[2][1];
        }
    }
}
function $8d10daf0cda71373$export$d4f0019d7c6b6a3d(t, stateObj, c, team, oppo) {
    c.title = c.title || stateObj.attributes.event_name;
    c.venue = stateObj.attributes.event_name;
    c.barLength[team] = stateObj.attributes.team_shots_on_target;
    c.barLength[oppo] = stateObj.attributes.opponent_shots_on_target;
    c.barLabel[team] = t.translate("golf.teamBarLabel", "%s", stateObj.attributes.team_total_shots + "(" + stateObj.attributes.team_shots_on_target + ")");
    c.barLabel[oppo] = t.translate("golf.oppoBarLabel", "%s", stateObj.attributes.opponent_total_shots + "(" + stateObj.attributes.opponent_shots_on_target + ")");
    c.finalTerm = stateObj.attributes.clock;
    c.timeoutsDisplay = "none";
    c.logo[team] = (0, $4fcaa3c95ba349ea$export$6df7962ea75d9a39) + stateObj.attributes.team_id + ".png";
    c.logo[oppo] = (0, $4fcaa3c95ba349ea$export$6df7962ea75d9a39) + stateObj.attributes.opponent_id + ".png";
    c.logoAlternate[team] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
    c.logoAlternate[oppo] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
}
function $8d10daf0cda71373$export$5a6583dd53975e58(t, stateObj, c, team, oppo) {
    c.barLength[team] = stateObj.attributes.team_shots_on_target;
    c.barLength[oppo] = stateObj.attributes.opponent_shots_on_target;
    c.barLabel[team] = t.translate("hockey.teamBarLabel", "%s", String(stateObj.attributes.team_shots_on_target));
    c.barLabel[oppo] = t.translate("hockey.oppoBarLabel", "%s", String(stateObj.attributes.opponent_shots_on_target));
    c.timeoutsDisplay = "none";
}
function $8d10daf0cda71373$export$b95402321280aab2(t, stateObj, c, team, oppo) {
    c.title = c.title || stateObj.attributes.event_name;
    c.timeoutsDisplay = "none";
    c.barDisplay = "none";
    c.logo[team] = (0, $4fcaa3c95ba349ea$export$7e154a1de2266268) + stateObj.attributes.team_id + ".png";
    c.logo[oppo] = (0, $4fcaa3c95ba349ea$export$7e154a1de2266268) + stateObj.attributes.opponent_id + ".png";
    c.logoAlternate[team] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
    c.logoAlternate[oppo] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
}
function $8d10daf0cda71373$export$75a82cd3fb272a60(t, stateObj, c, team, oppo) {
    c.title = c.title || stateObj.attributes.event_name;
    if (stateObj.attributes.quarter) {
        c.pre1 = stateObj.attributes.quarter;
        c.in1 = stateObj.attributes.quarter;
        c.finalTerm = stateObj.attributes.clock + " - " + c.gameDatePOST + " (" + stateObj.attributes.quarter + ")";
    }
    c.timeoutsDisplay = "none";
    c.barLength[team] = stateObj.attributes.team_total_shots;
    c.barLength[oppo] = stateObj.attributes.team_total_shots;
    c.barLabel[team] = t.translate("racing.teamBarLabel", "%s", String(stateObj.attributes.team_total_shots));
    c.barLabel[oppo] = t.translate("racing.teamBarLabel", "%s", String(stateObj.attributes.team_total_shots));
    //    if (stateObj.attributes.league.includes("NASCAR")) {
    //        c.logo[team] = null;
    //        c.logo[oppo] = null;
    //        c.initials[team] = "";
    //        c.initials[oppo] = "";
    //        if (c.name[team] && c.name[oppo]) {
    //            c.initials[team] = c.name[team].split(" ").map((n)=>n[0]).join("");
    //            c.initials[oppo] = c.name[oppo].split(" ").map((n)=>n[0]).join("");
    //            c.initialsDisplay = 'inline';
    //       }
    //    }
    c.logo[team] = (0, $4fcaa3c95ba349ea$export$c8a00e33d990d0fa) + stateObj.attributes.team_id + ".png";
    c.logo[oppo] = (0, $4fcaa3c95ba349ea$export$c8a00e33d990d0fa) + stateObj.attributes.opponent_id + ".png";
    c.logoAlternate[team] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
    c.logoAlternate[oppo] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
}
function $8d10daf0cda71373$export$215e00a8cdeadf2(t, stateObj, c, team, oppo) {
    c.barLength[team] = stateObj.attributes.team_total_shots;
    c.barLength[oppo] = stateObj.attributes.opponent_total_shots;
    c.barLabel[team] = t.translate("soccer.teamBarLabel", "%s", stateObj.attributes.team_total_shots + "(" + stateObj.attributes.team_shots_on_target + ")");
    c.barLabel[oppo] = t.translate("soccer.oppoBarLabel", "%s", stateObj.attributes.opponent_total_shots + "(" + stateObj.attributes.opponent_shots_on_target + ")");
    c.timeoutsDisplay = "none";
}
function $8d10daf0cda71373$export$b80102c1df210e4f(t, stateObj, c, team, oppo) {
    c.venue = stateObj.attributes.venue;
    c.location = stateObj.attributes.location;
    c.pre1 = stateObj.attributes.event_name;
    c.pre2 = stateObj.attributes.overunder;
    c.pre3 = stateObj.attributes.down_distance_text;
    c.in1 = c.pre1;
    c.in2 = c.pre3;
    c.finalTerm = stateObj.attributes.clock + " - " + c.gameDatePOST + " (" + c.pre3 + ")";
    c.gameBar = t.translate("tennis.gameBar", "%s", stateObj.attributes.clock);
    c.barLength[team] = stateObj.attributes.team_score;
    c.barLength[oppo] = stateObj.attributes.opponent_score;
    if (stateObj.attributes.team_shots_on_target) {
        c.gameBar = t.translate("tennis.gameBar", "%s", stateObj.attributes.clock + "(tiebreak)");
        c.barLabel[team] = t.translate("tennis.teamBarLabel", "%s", stateObj.attributes.team_score + "(" + stateObj.attributes.team_shots_on_target + ")");
    } else c.barLabel[team] = t.translate("tennis.teamBarLabel", "%s", String(stateObj.attributes.team_score));
    if (stateObj.attributes.team_shots_on_target) {
        c.gameBar = t.translate("tennis.gameBar", "%s", stateObj.attributes.clock + "(tiebreak)");
        c.barLabel[oppo] = t.translate("tennis.oppoBarLabel", "%s", stateObj.attributes.opponent_score + "(" + stateObj.attributes.opponent_shots_on_target + ")");
    } else c.barLabel[oppo] = t.translate("tennis.oppoBarLabel", "%s", String(stateObj.attributes.opponent_score));
    c.timeoutsOp[team][1] = stateObj.attributes.team_sets_won >= 1 ? 1 : 0.2;
    c.timeoutsOp[team][2] = stateObj.attributes.team_sets_won >= 2 ? 1 : 0.2;
    c.timeoutsOp[team][3] = stateObj.attributes.team_sets_won >= 3 ? 1 : 0.2;
    c.timeoutsOp[oppo][1] = stateObj.attributes.opponent_sets_won >= 1 ? 1 : 0.2;
    c.timeoutsOp[oppo][2] = stateObj.attributes.opponent_sets_won >= 2 ? 1 : 0.2;
    c.timeoutsOp[oppo][3] = stateObj.attributes.opponent_sets_won >= 3 ? 1 : 0.2;
    c.logo[team] = (0, $4fcaa3c95ba349ea$export$54565cc34e8d24d2) + stateObj.attributes.team_id + ".png";
    c.logo[oppo] = (0, $4fcaa3c95ba349ea$export$54565cc34e8d24d2) + stateObj.attributes.opponent_id + ".png";
    c.logoAlternate[team] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
    c.logoAlternate[oppo] = (0, $4fcaa3c95ba349ea$export$607dc1951b62972e);
    c.title = c.title || stateObj.attributes.event_name;
    c.timeoutsDisplay = "inline";
}
function $8d10daf0cda71373$export$ae478c65328ff5a5(t, stateObj, c, team, oppo) {
    c.gameBar = t.translate("volleyball.gameBar", "%s", stateObj.attributes.clock);
    c.barLength[team] = stateObj.attributes.team_score;
    c.barLength[oppo] = stateObj.attributes.opponent_score;
    c.barLabel[team] = t.translate("volleyball.teamBarLabel", "%s", String(stateObj.attributes.team_score));
    c.barLabel[oppo] = t.translate("volleyball.oppoBarLabel", "%s", String(stateObj.attributes.opponent_score));
    c.timeoutsOp[team][1] = stateObj.attributes.team_sets_won >= 1 ? 1 : 0.2;
    c.timeoutsOp[team][2] = stateObj.attributes.team_sets_won >= 2 ? 1 : 0.2;
    c.timeoutsOp[team][3] = stateObj.attributes.team_sets_won >= 3 ? 1 : 0.2;
    c.timeoutsOp[oppo][1] = stateObj.attributes.opponent_sets_won >= 1 ? 1 : 0.2;
    c.timeoutsOp[oppo][2] = stateObj.attributes.opponent_sets_won >= 2 ? 1 : 0.2;
    c.timeoutsOp[oppo][3] = stateObj.attributes.opponent_sets_won >= 3 ? 1 : 0.2;
    c.timeoutsDisplay = "inline";
}



const $1a7c5d625ead7579$export$c579ff79a032fc68 = (0, $def2de46b9306e8a$export$dbf350e5966cf602)`
.card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; border-radius: var(--ha-card-border-radius, 10px); }
.title { text-align: center; font-size: 1.2em; font-weight: 500; }
.team-bg { opacity: 0.08; position: absolute; top: -20%; left: -20%; width: 58%; z-index: 0; }
.opponent-bg { opacity: 0.08; position: absolute; top: -20%; right: -20%; width: 58%; z-index: 0; }
.card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 1; }
.team { text-align: center; width: 35%; }
.team img { max-width: 90px; }
.logo { max-height: 6.5em; }
.score { font-size: var(--score_size, 3em); opacity: var(--score_opacity, 1); text-align: center; line-height: 1; }
.line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
.left-clickable { text-decoration: none; color: inherit; }
.right-clickable { text-decoration: none; color: inherit; }
.bottom-clickable { text-decoration: none; color: inherit; }
.disabled { pointer-events: none; cursor: default; }

.possession { opacity: var(--possession-opacity, 1); font-size: 2.5em; text-align: center; font-weight:900; }
.divider { font-size: 2.5em; text-align: center; margin: 0 4px; }
.name { font-size: 1.4em; margin-bottom: 4px; }
.rank { display: var(--rank-display, inline); font-size:0.8em; }
.record { font-size:1.0em; height 1.0em; }
.timeouts-wrapper { margin: 0.4em auto; width: 70%; display: var(--timeouts-display, inline); }
.timeout { height: 0.6em; border-radius: 0.3em; background-color: var(--timeout-color, #000000); border: var(--timeout-border, 1px) solid var(--timeout-border-color, #ffffff); width: 20%; display: inline-block; margin: 0.4em auto; position: relative; opacity: var(--timeout-opacity, 0.2); }
.bases { display: var(--bases-display, inherit); font-size: 2.5em; text-align: center; font-weight:900; }
.on-base { opacity: var(--on-base-opacity, 1); display: inline-block; }
.pitcher { opacity: 0.0; display: inline-block; }
.in-row1 { font-size: 1em; height: 1em; margin: 6px 0 2px; }
.in-row2 { ; font-size: 1em; height: 1em; margin: 6px 0 2px; }
.in-row1, .in-row2 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
.last-play { font-size: 1.2em; width: 100%; white-space: nowrap; overflow: hidden; box-sizing: border-box; }
.last-play p { animation : slide var(--last-play-speed, 18s) linear infinite; display: inline-block; padding-left: 100%; margin: 2px 0 12px; }
@keyframes slide { 0%   { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
.down-distance { text-align: right; }
.play-clock { font-size: 1.4em; height: 1.4em; text-align: center; }
.outs { display: var(--outs-display, inherit); text-align: center; }

.bar-wrapper { display: var(--bar-display, inherit) }
.bar-text { text-align: center; }
.bar-flex { width: 100%; display: flex; justify-content: center; margin-top: 4px; }
.bar-right { width: var(--bar-length, 0); background-color: var(--bar-color, red); height: 0.8em; border-radius: 0 0.4em 0.4em 0; border: var(--bar-border, 1px) solid var(--bar-border-color, lightgrey); border-left: 0; transition: all 1s ease-out; }
.bar-left { width: var(--bar-length, 0); background-color: var(--bar-color, blue); height: 0.8em; border-radius: 0.4em 0 0 0.4em; border: var(--bar-border, 1px) solid var(--bar-border-color, lightgrey); border-right: 0; transition: all 1s ease-out; }
.bar { display: flex; align-items: center; }
.bar1-label { flex: 0 0 10px; padding: 0 10px 0 0; margin-top: 4px; }
.bar2-label { flex: 0 0 10px; padding: 0 0 0 10px; text-align: right; margin-top: 4px; }
.in-series-info { display: var(--series-summary-display, none); font-size: 1.2em; text-align: center; margin: 4px; }

.gameday { font-size: 1.4em; height: 1.4em; }
.gamedate { font-size: 1.1em; height: 1.1em; }
.gametime { font-size: 1.1em; height: 1.1em; }
.pre-row1 { font-weight: 500; font-size: 1.2em; height: 1.2em; margin: 6px 0 2px; }
.pre-row1, .pre-row2, .pre-row3 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
.pre-series-info { display: var(--series-summary-display, none); font-size: 1.2em; text-align: center; margin: 4px; }

.post-row1 { font-size: 1.2em; text-align: center; }
.post-series-info { display: var(--series-summary-display, none); font-size: 1.2em; text-align: center; margin: 4px; }

.notFound1 { font-size: 1.4em; line-height: 1.2em; text-align: center; width: 100%; margin-bottom: 4px; }
.notFound2 { font-size: 1.4em; line-height: 1.2em; text-align: center; width: 100%; margin-bottom: 4px; }

.bye { font-size: 1.8em; text-align: center; width: 50%; }

`;


class $a510245ba2c1e365$export$c12aa10d47d2f051 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    static get properties() {
        return {
            hass: {},
            _config: {}
        };
    }
    static get styles() {
        return (0, $def2de46b9306e8a$export$dbf350e5966cf602)`
            ${0, $1a7c5d625ead7579$export$c579ff79a032fc68}
        `;
    }
    setConfig(config) {
        this._config = config;
        this._actionConfig = {
            entity: this._config.entity,
            //            tap_action: {
            //                action: "more-info",
            //            },
            dblclick_action: {
                action: "more-info"
            }
        };
    }
    getCardSize() {
        const stateObj = this.hass.states[this._config.entity];
        switch(stateObj.state){
            case "PRE":
                return 7;
            case "IN":
                return 10;
            case "POST":
                return 5;
            case "BYE":
                return 4;
            case "NOT_FOUND":
                return 4;
            default:
                return 4;
        }
    }
    render() {
        var o = {}; // o is the object that holds the card options from the configuration
        var c = {}; // c is the object that holds the card data used to render the HTML
        //
        //  Render error message if missing configuration, entity, or state
        //
        if (!this.hass || !this._config) return (0, $07b3e4094688f328$export$b2e19b637b85e37f)();
        const stateObj = this.hass.states[this._config.entity];
        if (!stateObj) return (0, $07b3e4094688f328$export$adab126bb38c4dbc)(this._config.entity);
        if (stateObj.state == "unavailable") return (0, $07b3e4094688f328$export$83a5095ba0388927)(this._config.entity);
        //
        //  Set card options based on configuration
        //
        o.cardTitle = this._config.card_title || "";
        o.outline = this._config.outline;
        o.outlineColor = this._config.outline_color || "#ffffff";
        o.showLeague = this._config.show_league;
        o.homeSide = String(this._config.home_side).toUpperCase();
        o.teamURL = this._config.team_url;
        o.opponentURL = this._config.opponent_url;
        o.bottomURL = this._config.bottom_url;
        o.show_timeouts = true;
        if (this._config.show_timeouts == false) o.show_timeouts = false;
        o.show_rank = true;
        if (this._config.show_rank == false) o.show_rank = false;
        o.debug = this._config.debug;
        o.darkMode = this.hass.themes.darkMode;
        //
        //  Set sport, team, and oppo 
        //
        var team = 1;
        var oppo = 2;
        if (o.homeSide == "RIGHT" && stateObj.attributes.team_homeaway == "home" || o.homeSide == "LEFT" && stateObj.attributes.opponent_homeaway == "home") {
            team = 2;
            oppo = 1;
        }
        //
        // Set language, time_format (12hr or 24hr), and translator
        //
        var lang = this.hass.selectedLanguage || this.hass.language || navigator.language || "en";
        var time_format = "language";
        try {
            time_format = this.hass.locale["time_format"] || "language";
        } catch (e) {
            time_format = "language";
        }
        var t = new (0, $cfd70fadc94c42c5$export$9850010f89e291bb)(lang);
        var sport = stateObj.attributes.sport || "default";
        if (t.translate(sport + ".startTerm") == "{" + sport + ".startTerm" + "}") sport = "default";
        //
        //  Set card data
        //
        (0, $84bc952fd23869d6$export$554552fb00f06e66)(c);
        (0, $84bc952fd23869d6$export$539ef78a097046ba)(c, stateObj, t, lang, time_format);
        (0, $84bc952fd23869d6$export$f8996dc3406efa5a)(o, c);
        (0, $84bc952fd23869d6$export$2e2366488d12e20d)(t, lang, stateObj, c, o, sport, team, oppo);
        (0, $8d10daf0cda71373$export$42406174c4ed4231)(sport, t, stateObj, c, team, oppo);
        //
        //  NCAA Specific Changes
        //
        if (stateObj.attributes.league) {
            if (stateObj.attributes.league.includes("NCAA")) c.notFoundLogo = "https://a.espncdn.com/i/espn/misc_logos/500/ncaa.png";
        }
        //
        //  Reduce score font size if needed
        //
        if (Math.max(String(c.score[1]).length, String(c.score[2]).length) > 4) c.scoreSize = "2em";
        //
        //  Add info to title if debug mode is turned on
        //
        if (o.debug) {
            var lastUpdate = new Date(stateObj.attributes.last_update);
            var updateTime = lastUpdate.toLocaleTimeString(lang, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
            c.title = this._config.entity + " " + c.title + "(";
            if (stateObj.attributes.api_message) c.title = c.title + stateObj.attributes.api_message[0];
            c.title = c.title + updateTime + ") " + (0, $4fcaa3c95ba349ea$export$a4ad2735b021c132);
        }
        //
        //  Render the card based on the state
        //
        switch(stateObj.state){
            case "PRE":
                return (0, $32e2f72be859b718$export$d6bad15bd473a528)(c);
            case "IN":
                return (0, $654f96c20a3bcd40$export$3f4c9efb42c5bfd8)(c);
            case "POST":
                return (0, $ba84a5acf45954c4$export$823f4865e91cfbff)(c);
            case "BYE":
                return (0, $6af844b6602814f2$export$eac7a64041e7dd4f)(c);
            case "NOT_FOUND":
                return (0, $5cc9eebd21270610$export$cbe2629e62de17f0)(c);
            default:
                return (0, $07b3e4094688f328$export$e26cf6a49fd1ec72)(c);
        }
    }
    firstUpdated() {
        // Add the double-click event listener to the card
        this.shadowRoot.querySelector("ha-card").addEventListener("dblclick", ()=>this._handleDoubleClick());
    }
    _handleDoubleClick() {
        const event = new Event("hass-action", {
            bubbles: true,
            composed: true
        });
        event.detail = {
            config: this._actionConfig,
            action: "dblclick"
        };
        this.dispatchEvent(event);
    }
    //
    // Trigger the UI Card Editor from Card Picker
    //    Uncomment to enable visual editor
    //
    static getConfigElement() {
        // Create and return an editor element
        return document.createElement("teamtracker-card-editor");
    }
}


customElements.define("teamtracker-card", (0, $a510245ba2c1e365$export$c12aa10d47d2f051));
customElements.define("teamtracker-card-editor", (0, $de5768471e29ae80$export$c622f67f045f310d));
console.info("%c TEAMTRACKER-CARD %s IS INSTALLED", "color: blue; font-weight: bold", (0, $4fcaa3c95ba349ea$export$a4ad2735b021c132));
//
//  Add card to list of Custom Cards in the Card Picker
//
window.customCards = window.customCards || []; // Create the list if it doesn't exist. Careful not to overwrite it
window.customCards.push({
    type: "teamtracker-card",
    name: "Team Tracker Card",
    preview: false,
    description: "Card to display the ha-teamtracker sensor"
});


//# sourceMappingURL=ha-teamtracker-card.js.map
