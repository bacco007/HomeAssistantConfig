/* Waterfall History Card v4.4.1 */
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$2=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$2,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$2+x):s+o$2+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$2),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$2)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$2),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$2,t+1));)d.push({type:7,index:l}),t+=o$2.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

// Special state values for unknown and unavailable states
const UNKNOWN_STATE = -999;
const UNAVAILABLE_STATE = -998;
// Default thresholds for numeric sensors (temperature-based)
const DEFAULT_THRESHOLDS_NUMERIC = [
    { value: 60, color: '#5b8fce' }, // cold - precise blue
    { value: 70, color: '#52a870' }, // cool - measured green
    { value: 80, color: '#d4894a' }, // warm - amber
    { value: 100, color: '#c85c4a' } // hot - alert
];
// Default thresholds for binary sensors
const DEFAULT_THRESHOLDS_BOOLEAN = [
    { value: 0, color: '#2d3245' }, // off - dark recessed
    { value: 1, color: '#4a9eff' }, // on - electric blue
];
// Default icons by domain
const DEFAULT_DOMAIN_ICONS = {
    sensor: "mdi:gauge",
    binary_sensor: "mdi:eye",
    switch: "mdi:toggle-switch",
    light: "mdi:lightbulb",
    climate: "mdi:thermostat",
    lock: "mdi:lock",
    cover: "mdi:window-shutter",
    media_player: "mdi:play-circle",
    person: "mdi:account",
    device_tracker: "mdi:map-marker",
};
// Translations for UI text
const TRANSLATIONS = {
    en: {
        history: 'History',
        error_loading_data: 'Error loading historical data',
        no_data: 'No data',
        min_label: 'Min',
        max_label: 'Max',
        hours_ago: 'h ago',
        minutes_ago: 'm ago',
        now: 'Now',
    },
    fr: {
        history: 'Historique',
        error_loading_data: 'Erreur lors du chargement des données historiques',
        no_data: 'Aucune donnée',
        min_label: 'Min',
        max_label: 'Max',
        hours_ago: 'h',
        minutes_ago: 'min',
        now: 'Actuel',
    }
};
// Default configuration values
const DEFAULTS = {
    title: 'History',
    hours: 24,
    intervals: 48,
    start_offset: 0, // No offset by default (show recent history ending at "now")
    height: 60,
    label_count: 1,
    label_format: 'relative',
    show_min_max: false,
    digits: 1,
    compact: false,
    inline_layout: false,
    gradient: false,
    state_on: 'On',
    state_off: 'Off',
    state_unknown: 'Unknown',
    state_unavailable: 'INOP',
    color_on: '#4a9eff',
    color_off: '#2d3245',
    color_unknown: '#FF9800', // Orange
    color_unavailable: '#9E9E9E', // Gray
    interval_value: 'last',
    cell_gap: 1, // px gap between bar segments; set to 0 to disable
};

class WaterfallHistoryCard extends i {
    constructor() {
        super();
        this.processedHistories = {};
        this._lastHistoryFetch = {};
        this._historyRefreshInterval = 15 * 60 * 1000; // 15 minutes by default
        this._cardModApplied = false;
        this.language = 'en';
        this.translations = TRANSLATIONS;
        this.config = {};
        this.processedHistories = {};
    }
    // Enable visual configuration editor
    static async getConfigElement() {
        await Promise.resolve().then(function () { return editor; });
        return document.createElement('waterfall-history-card-editor');
    }
    // Provide default stub configuration for the card picker preview.
    // HA passes the hass object so we can pick a real entity to display.
    static getStubConfig(hass) {
        const sensorEntity = hass
            ? Object.keys(hass.states).find((entityId) => entityId.startsWith('sensor.'))
            : undefined;
        return {
            title: 'History',
            hours: 24,
            entities: sensorEntity ? [sensorEntity] : [],
        };
    }
    setConfig(config) {
        // Use empty array as fallback - auto-entities calls setConfig without entities on first render
        const entities = Array.isArray(config.entities) ? config.entities : [];
        const globalConfig = {
            title: config.title || 'History',
            hours: config.hours || DEFAULTS.hours,
            intervals: config.intervals || DEFAULTS.intervals,
            start_offset: config.start_offset ?? DEFAULTS.start_offset,
            height: config.height || DEFAULTS.height,
            min_value: config.min_value || null,
            max_value: config.max_value || null,
            thresholds: config.thresholds ?? undefined,
            gradient: config.gradient || DEFAULTS.gradient,
            show_current: config.show_current !== false,
            show_labels: config.show_labels !== false,
            label_count: typeof config.label_count === 'number' ? config.label_count : DEFAULTS.label_count,
            label_format: config.label_format || DEFAULTS.label_format,
            show_min_max: config.show_min_max || DEFAULTS.show_min_max,
            show_icons: config.show_icons !== false,
            unit: config.unit ?? undefined,
            icon: config.icon ?? undefined,
            compact: config.compact || DEFAULTS.compact,
            inline_layout: config.inline_layout || DEFAULTS.inline_layout,
            default_value: config.default_value ?? null,
            digits: typeof config.digits === 'number' ? config.digits : DEFAULTS.digits,
            card_mod: config.card_mod || {},
            binary_colors: config.binary_colors ?? undefined,
            color_on: config.color_on ?? undefined,
            color_off: config.color_off ?? undefined,
            state_on: config.state_on || DEFAULTS.state_on,
            state_off: config.state_off || DEFAULTS.state_off,
            color_unknown: config.color_unknown || DEFAULTS.color_unknown,
            color_unavailable: config.color_unavailable || DEFAULTS.color_unavailable,
            state_unknown: config.state_unknown || DEFAULTS.state_unknown,
            state_unavailable: config.state_unavailable || DEFAULTS.state_unavailable,
            interval_value: config.interval_value || DEFAULTS.interval_value,
            cell_gap: config.cell_gap ?? DEFAULTS.cell_gap,
        };
        this.config = {
            type: 'custom:waterfall-history-card',
            ...globalConfig,
            entities: entities.map(entityConfig => {
                if (typeof entityConfig === 'string') {
                    return { entity: entityConfig };
                }
                return entityConfig;
            }),
        };
        // Apply compact class to host
        if (this.config.compact) {
            this.classList.add('compact');
        }
        else {
            this.classList.remove('compact');
        }
        // Set CSS custom properties for dynamic values
        this.style.setProperty('--header-font-size', this.config.compact ? '10px' : '11px');
        this.style.setProperty('--entity-name-font-size', this.config.compact ? '10px' : '11px');
        this.style.setProperty('--waterfall-height', `${this.config.height}px`);
        this.style.setProperty('--labels-margin-top', this.config.compact ? '2px' : '5px');
        this.style.setProperty('--waterfall-cell-gap', `${this.config.cell_gap ?? DEFAULTS.cell_gap}px`);
    }
    shouldUpdate(changedProps) {
        if (!this.config || !this.hass) {
            return false;
        }
        // Always update if config changed
        if (changedProps.has('config')) {
            return true;
        }
        // Check if any of our tracked entities changed
        if (changedProps.has('hass')) {
            const oldHass = changedProps.get('hass');
            if (!oldHass) {
                return true; // First render
            }
            // Check if any tracked entity state changed
            return this._entitiesChanged(oldHass, this.hass);
        }
        // Update if processed histories changed
        if (changedProps.has('processedHistories')) {
            return true;
        }
        return true;
    }
    _entitiesChanged(oldHass, newHass) {
        if (!oldHass || !newHass)
            return true;
        return this.config.entities.some(entityConfig => {
            const entityId = typeof entityConfig === 'string' ? entityConfig : entityConfig.entity;
            return oldHass.states[entityId] !== newHass.states[entityId];
        });
    }
    updated(changedProps) {
        if (changedProps.has('hass')) {
            const oldHass = changedProps.get('hass');
            // Update language if changed
            if (this.hass?.language) {
                this.language = this.hass.language.split('-')[0];
            }
            // Fetch history on first render or when entities need updates
            if (!oldHass) {
                this.updateCard();
            }
            else if (this._entitiesChanged(oldHass, this.hass)) {
                // Only update current values, not full history fetch
                this.requestUpdate();
            }
            // Check if we need to refresh history data
            this._checkHistoryRefresh();
        }
        this._syncInlineColumnWidths();
        // Apply card-mod once
        if (!this._cardModApplied && this.config?.card_mod) {
            customElements.whenDefined("card-mod").then(() => {
                const cardMod = customElements.get("card-mod");
                if (cardMod?.applyToElement) {
                    cardMod.applyToElement(this, "card", this.config.card_mod);
                    this._cardModApplied = true;
                }
            }).catch(() => {
                // card-mod not available, ignore
            });
        }
    }
    _syncInlineColumnWidths() {
        requestAnimationFrame(() => {
            this._syncColumnWidth('.entity-inline-name');
            this._syncColumnWidth('.entity-inline-value');
        });
    }
    _syncColumnWidth(selector) {
        const els = this.shadowRoot?.querySelectorAll(selector);
        if (!els?.length)
            return;
        els.forEach(el => { el.style.width = 'auto'; });
        let maxWidth = 0;
        els.forEach(el => { maxWidth = Math.max(maxWidth, el.offsetWidth); });
        if (maxWidth > 0) {
            els.forEach(el => { el.style.width = `${maxWidth}px`; });
        }
    }
    _checkHistoryRefresh() {
        if (!this.hass || !this.config)
            return;
        const now = Date.now();
        const entitiesToUpdate = this.config.entities.filter(entityConfig => {
            const entityId = typeof entityConfig === 'string' ? entityConfig : entityConfig.entity;
            const hours = typeof entityConfig !== 'string' ? (entityConfig.hours ?? this.config.hours) : this.config.hours;
            const intervals = typeof entityConfig !== 'string' ? (entityConfig.intervals ?? this.config.intervals) : this.config.intervals;
            const startOffset = typeof entityConfig !== 'string' ? (entityConfig.start_offset ?? this.config.start_offset ?? 0) : (this.config.start_offset ?? 0);
            // Use composite key to support same entity with different offsets
            const cacheKey = `${entityId}_${startOffset}`;
            // For offset data (historical), use longer refresh interval since it doesn't change as frequently
            const baseRefreshInterval = ((hours / intervals) * 60 * 60 * 1000) / 2;
            const refreshInterval = startOffset && startOffset > 0 ? baseRefreshInterval * 4 : baseRefreshInterval;
            return !this._lastHistoryFetch[cacheKey] || (now - this._lastHistoryFetch[cacheKey] > refreshInterval);
        });
        if (entitiesToUpdate.length > 0) {
            this.updateCard();
        }
    }
    async updateCard() {
        if (!this.hass || !this.config)
            return;
        const now = Date.now();
        const entitiesToUpdate = this.config.entities.filter(entityConfig => {
            const entityId = typeof entityConfig === 'string' ? entityConfig : entityConfig.entity;
            const hours = typeof entityConfig !== 'string' ? (entityConfig.hours ?? this.config.hours) : this.config.hours;
            const intervals = typeof entityConfig !== 'string' ? (entityConfig.intervals ?? this.config.intervals) : this.config.intervals;
            const startOffset = typeof entityConfig !== 'string' ? (entityConfig.start_offset ?? this.config.start_offset ?? 0) : (this.config.start_offset ?? 0);
            // Use composite key to support same entity with different offsets
            const cacheKey = `${entityId}_${startOffset}`;
            const baseRefreshInterval = ((hours / intervals) * 60 * 60 * 1000) / 2;
            const refreshInterval = startOffset && startOffset > 0 ? baseRefreshInterval * 4 : baseRefreshInterval;
            return !this._lastHistoryFetch[cacheKey] || (now - this._lastHistoryFetch[cacheKey] > refreshInterval);
        });
        if (entitiesToUpdate.length === 0) {
            return;
        }
        const historyPromises = entitiesToUpdate.map(async (entityConfig) => {
            const entityObj = typeof entityConfig === 'string' ? { entity: entityConfig } : entityConfig;
            const entityId = entityObj.entity;
            const hours = entityObj.hours ?? this.config.hours;
            const startOffset = entityObj.start_offset ?? this.config.start_offset ?? 0;
            // Use composite key to support same entity with different offsets
            const cacheKey = `${entityId}_${startOffset}`;
            // Calculate time window with offset
            // endTime is now shifted back by start_offset hours
            const endTime = new Date(Date.now() - startOffset * 60 * 60 * 1000);
            const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
            try {
                const history = await this.hass.callApi('GET', `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}&significant_changes_only=1&minimal_response&no_attributes`);
                this._lastHistoryFetch[cacheKey] = now;
                return { entityId, history: history[0], entityConfig: entityObj, startOffset, cacheKey };
            }
            catch (error) {
                console.error(`Error fetching history for ${entityId}:`, error);
                return { entityId, history: null, entityConfig: entityObj, startOffset, cacheKey };
            }
        });
        const results = await Promise.all(historyPromises);
        const processedHistories = { ...this.processedHistories };
        results.forEach(({ entityId, history, entityConfig, startOffset, cacheKey }) => {
            const intervals = entityConfig.intervals ?? this.config.intervals;
            const hours = entityConfig.hours ?? this.config.hours;
            const timeStep = (hours * 60 * 60 * 1000) / intervals;
            if (history && history.length > 0) {
                // API returned data - process normally (no behavior change)
                processedHistories[cacheKey] = {
                    data: this.processHistoryData(history, intervals, timeStep, entityConfig, startOffset),
                    minValue: 0,
                    maxValue: 100
                };
            }
            else if (!processedHistories[cacheKey]) {
                // No API data and no cached data (first load for a stable entity).
                // Backfill all buckets with the entity's current state so stable sensors
                // show a solid bar rather than a blank chart.
                const currentState = this.hass?.states[entityId]?.state;
                const currentValue = currentState ? this.parseState(currentState, entityConfig) : null;
                const endTime = Date.now() - (startOffset * 60 * 60 * 1000);
                const startTime = endTime - (hours * 60 * 60 * 1000);
                processedHistories[cacheKey] = {
                    data: Array.from({ length: intervals }, (_, i) => ({
                        time: new Date(startTime + i * timeStep),
                        value: currentValue
                    })),
                    minValue: 0,
                    maxValue: 100
                };
            }
            // If history is empty AND cached data exists, do nothing - preserve the cache.
            // This protects brief events (interval_value: max/min) from being erased by
            // a refresh that returns empty due to HA API changes (e.g. HA 2026.4).
        });
        this.processedHistories = processedHistories;
    }
    processHistoryData(historyData, intervals, timeStep, entityConfig, startOffset = 0) {
        const defaultValue = entityConfig.default_value ?? this.config.default_value;
        const processed = new Array(intervals).fill(defaultValue);
        const hours = entityConfig.hours ?? this.config.hours;
        const intervalValue = entityConfig.interval_value ?? this.config.interval_value ?? DEFAULTS.interval_value;
        // Calculate start time with offset - endTime is (now - offset), startTime is (endTime - hours)
        const endTime = Date.now() - (startOffset * 60 * 60 * 1000);
        const startTime = endTime - (hours * 60 * 60 * 1000);
        // When using min or max mode, track the extreme real value per bucket separately.
        // Special sentinel values (unknown/unavailable) are excluded from min/max comparison.
        const bucketExtreme = (intervalValue === 'min' || intervalValue === 'max')
            ? new Array(intervals).fill(null)
            : null;
        // Track initial state: when the API returns a point with last_changed before startTime,
        // it represents the state that was active at startTime (but hasn't changed since before
        // our time window). We need to capture this to fill bucket 0.
        let initialState = null;
        let bucket0ExplicitlySet = false;
        if (historyData) {
            historyData.forEach(point => {
                const pointTime = new Date(point.last_changed || point.last_updated).getTime();
                const timeDiff = pointTime - startTime;
                if (timeDiff < 0) {
                    // This point's last_changed is before our window, but it represents
                    // the state that was active at startTime. Capture it as initial state.
                    initialState = this.parseState(point.state, entityConfig);
                }
                else {
                    const bucketIndex = Math.floor(timeDiff / timeStep);
                    if (bucketIndex >= 0 && bucketIndex < intervals) {
                        const value = this.parseState(point.state, entityConfig);
                        // Always track the last value (needed for special state handling)
                        processed[bucketIndex] = value;
                        if (bucketIndex === 0) {
                            bucket0ExplicitlySet = true;
                        }
                        // Track extreme (min/max) for real numeric values only
                        if (bucketExtreme !== null && value !== null &&
                            value !== UNKNOWN_STATE && value !== UNAVAILABLE_STATE) {
                            if (bucketExtreme[bucketIndex] === null) {
                                bucketExtreme[bucketIndex] = value;
                            }
                            else if (intervalValue === 'min' && value < bucketExtreme[bucketIndex]) {
                                bucketExtreme[bucketIndex] = value;
                            }
                            else if (intervalValue === 'max' && value > bucketExtreme[bucketIndex]) {
                                bucketExtreme[bucketIndex] = value;
                            }
                        }
                    }
                }
            });
        }
        // For min/max mode: include initialState in bucket 0's extreme comparison.
        // The pre-window state was active from the start of the window until the first change
        // in bucket 0, so it must be considered as a candidate extreme for that bucket.
        if (bucketExtreme !== null && initialState !== null &&
            initialState !== UNKNOWN_STATE && initialState !== UNAVAILABLE_STATE) {
            if (bucketExtreme[0] === null) {
                bucketExtreme[0] = initialState;
            }
            else if (intervalValue === 'min' && initialState < bucketExtreme[0]) {
                bucketExtreme[0] = initialState;
            }
            else if (intervalValue === 'max' && initialState > bucketExtreme[0]) {
                bucketExtreme[0] = initialState;
            }
        }
        // In min/max mode capture a copy of last raw values before overwriting with extremes.
        // This is used for fill operations so empty buckets get the carry-over state (the value
        // that was actually active during the gap), not an adjacent bucket's extreme.
        const fillValues = bucketExtreme !== null ? [...processed] : null;
        // Merge extreme values into processed array.
        // Where a real extreme exists, it replaces the last value for that bucket.
        // Buckets that only had special states (unknown/unavailable) are left as-is.
        if (bucketExtreme !== null) {
            for (let i = 0; i < intervals; i++) {
                if (bucketExtreme[i] !== null) {
                    processed[i] = bucketExtreme[i];
                }
            }
        }
        // Apply initial state to bucket 0 if it wasn't set by a state change within the window
        if (initialState !== null && !bucket0ExplicitlySet) {
            processed[0] = initialState;
            if (fillValues !== null)
                fillValues[0] = initialState;
        }
        // Forward fill - Propagate all states (including unavailable/unknown) until next actual state change.
        // In min/max mode, fill from the raw last-value array so empty buckets get the carry-over
        // state rather than an adjacent bucket's extreme.
        const fwd = fillValues ?? processed;
        for (let i = 1; i < processed.length; i++) {
            if (fwd[i] === null && fwd[i - 1] !== null)
                fwd[i] = fwd[i - 1];
            if (processed[i] === null && fwd[i - 1] !== null)
                processed[i] = fwd[i - 1];
        }
        // NOTE: No backward fill (removed for issue #81). After forward fill, the only
        // remaining null buckets are leading ones - time before the entity's first
        // recorded state (entity did not exist yet, or the recorder purged the data).
        // The HA history API already returns the state active at the window start
        // (include_start_time_state), which initialState/bucket 0 handling covers, so
        // backward fill could only ever fabricate values for periods with no data.
        // Leading nulls now render as transparent "no data" segments.
        return processed.map((value, index) => ({
            time: new Date(startTime + index * timeStep),
            value
        }));
    }
    getMinMax(data) {
        let min = Infinity;
        let max = -Infinity;
        data.forEach(d => {
            // Skip null and special sentinel values (unavailable/unknown)
            if (d === null || d === UNKNOWN_STATE || d === UNAVAILABLE_STATE)
                return;
            if (d > max)
                max = d;
            if (d < min)
                min = d;
        });
        // Handle edge case where all values are null/unknown/unavailable
        if (min === Infinity || max === -Infinity) {
            return [0, 0];
        }
        return [min, max];
    }
    // Returns the state_colors map for an entity, checking per-entity then global config.
    getStateColors(entityConfig) {
        return entityConfig?.state_colors ?? this.config?.state_colors;
    }
    parseState(state, entityConfig) {
        if (typeof state === 'number')
            return state;
        if (typeof state === 'string') {
            const lowerState = state.toLowerCase();
            if (lowerState === 'unknown')
                return UNKNOWN_STATE;
            if (lowerState === 'unavailable')
                return UNAVAILABLE_STATE;
            // Multi-state: check state_colors before binary on/off so that states like 'off'
            // in an HVAC context map to their configured index rather than binary 0.
            const stateColors = this.getStateColors(entityConfig);
            if (stateColors) {
                const keys = Object.keys(stateColors);
                const matchIndex = keys.findIndex(k => k.toLowerCase() === lowerState);
                if (matchIndex !== -1)
                    return matchIndex;
            }
            if (lowerState === 'off')
                return 0;
            if (lowerState === 'on')
                return 1;
            // Check configured state_on / state_off so custom states (e.g. 'home', 'not_home') map to binary 1/0
            const stateOnCfg = (entityConfig?.state_on ?? this.config.state_on ?? '').toLowerCase();
            const stateOffCfg = (entityConfig?.state_off ?? this.config.state_off ?? '').toLowerCase();
            if (stateOnCfg && lowerState === stateOnCfg)
                return 1;
            if (stateOffCfg && lowerState === stateOffCfg)
                return 0;
            const casted = parseFloat(state);
            if (!Number.isNaN(casted))
                return casted;
        }
        return null;
    }
    displayState(state, entityConfig) {
        // Handle special states first
        if (state === UNKNOWN_STATE) {
            return entityConfig.state_unknown ?? this.config.state_unknown ?? DEFAULTS.state_unknown;
        }
        if (state === UNAVAILABLE_STATE) {
            return entityConfig.state_unavailable ?? this.config.state_unavailable ?? DEFAULTS.state_unavailable;
        }
        // Multi-state: return the original state name for the given index
        const stateColors = this.getStateColors(entityConfig);
        if (stateColors && state !== null) {
            const keys = Object.keys(stateColors);
            if (Number.isInteger(state) && state >= 0 && state < keys.length) {
                return keys[state];
            }
        }
        // Only treat 0/1 as binary when no thresholds are configured. A numeric sensor whose
        // current reading happens to be 0 or 1 (e.g. PM2.5 = 1.0) must not be shown as On/Off.
        // This mirrors the guard already present in getColorForValue().
        const hasThresholds = !!(entityConfig.thresholds ?? this.config.thresholds);
        if (!hasThresholds && this.isBinaryValue(state)) {
            const stateOn = entityConfig.state_on ?? this.config.state_on ?? DEFAULTS.state_on;
            const stateOff = entityConfig.state_off ?? this.config.state_off ?? DEFAULTS.state_off;
            return (state === 1) ? stateOn : stateOff;
        }
        // Numeric values
        if (typeof state === 'number') {
            const digits = entityConfig.digits ?? this.config.digits ?? DEFAULTS.digits;
            return state.toFixed(digits) + this.getUnit(entityConfig);
        }
        // Fallback
        return (state ?? 'N/A') + this.getUnit(entityConfig);
    }
    isBinaryValue(value) {
        return value === 0 || value === 1;
    }
    getBinaryColors(entityConfig) {
        // Per-entity binary_colors object
        if (entityConfig.binary_colors) {
            return [
                { value: 0, color: entityConfig.binary_colors.off || entityConfig.binary_colors[0] || DEFAULTS.color_off },
                { value: 1, color: entityConfig.binary_colors.on || entityConfig.binary_colors[1] || DEFAULTS.color_on }
            ];
        }
        // Per-entity color_on/color_off
        if (entityConfig.color_on || entityConfig.color_off) {
            return [
                { value: 0, color: entityConfig.color_off || DEFAULTS.color_off },
                { value: 1, color: entityConfig.color_on || DEFAULTS.color_on }
            ];
        }
        // Global binary_colors object
        if (this.config.binary_colors) {
            return [
                { value: 0, color: this.config.binary_colors.off || this.config.binary_colors[0] || DEFAULTS.color_off },
                { value: 1, color: this.config.binary_colors.on || this.config.binary_colors[1] || DEFAULTS.color_on }
            ];
        }
        // Global color_on/color_off
        if (this.config.color_on || this.config.color_off) {
            return [
                { value: 0, color: this.config.color_off || DEFAULTS.color_off },
                { value: 1, color: this.config.color_on || DEFAULTS.color_on }
            ];
        }
        // Default fallback
        return DEFAULT_THRESHOLDS_BOOLEAN;
    }
    getColorForValue(value, entityConfig) {
        // Null means no data exists for the bucket (e.g. before the entity was created).
        // Render transparent so the container background shows through as an empty track.
        if (value === null || isNaN(value))
            return 'transparent';
        // Handle special states first
        if (value === UNKNOWN_STATE) {
            return entityConfig.color_unknown ?? this.config.color_unknown ?? DEFAULTS.color_unknown;
        }
        if (value === UNAVAILABLE_STATE) {
            return entityConfig.color_unavailable ?? this.config.color_unavailable ?? DEFAULTS.color_unavailable;
        }
        // Multi-state: look up color by index into state_colors keys
        const stateColors = this.getStateColors(entityConfig);
        if (stateColors) {
            const keys = Object.keys(stateColors);
            if (Number.isInteger(value) && value >= 0 && value < keys.length) {
                return stateColors[keys[value]] || '#666666';
            }
        }
        let thresholds = entityConfig.thresholds ?? this.config.thresholds;
        // Check if this is a binary value and apply binary colors
        if (!thresholds && this.isBinaryValue(value)) {
            thresholds = this.getBinaryColors(entityConfig);
        }
        else if (!thresholds) {
            thresholds = DEFAULT_THRESHOLDS_NUMERIC;
        }
        const gradient = entityConfig.gradient ?? this.config.gradient ?? DEFAULTS.gradient;
        if (!gradient) {
            let color = thresholds[0].color;
            for (const t of thresholds) {
                if (value >= t.value) {
                    color = t.color;
                }
            }
            return color;
        }
        // Gradient mode
        for (let i = 0; i < thresholds.length - 1; i++) {
            const current = thresholds[i];
            const next = thresholds[i + 1];
            if (value >= current.value && value <= next.value) {
                const factor = (next.value - current.value === 0) ? 0 : (value - current.value) / (next.value - current.value);
                return this.interpolateColor(current.color, next.color, factor);
            }
        }
        return value < thresholds[0].value ? thresholds[0].color : thresholds[thresholds.length - 1].color;
    }
    getUnit(entityConfig) {
        const entity = this.hass.states[entityConfig.entity];
        return entityConfig.unit ?? this.config.unit ?? entity?.attributes?.unit_of_measurement ?? '';
    }
    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    }
    hexToRgb(hex) {
        const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : { r: 0, g: 0, b: 0 };
    }
    getTimeLabel(index, totalIntervals, hours, startOffset = 0) {
        // Calculate hours ago from "now", accounting for offset
        // With offset=0: rightmost bar is "now" (0h ago), leftmost is "hours" ago
        // With offset=24: rightmost bar is "24h ago", leftmost is "24+hours" ago
        const intervalHoursAgo = (hours * (totalIntervals - index)) / totalIntervals;
        const actualHoursAgo = intervalHoursAgo + startOffset;
        if (hours <= 24) {
            // Show actual timestamps
            const date = new Date(Date.now() - actualHoursAgo * 60 * 60 * 1000);
            const nextDate = new Date(date.getTime() + (hours / totalIntervals) * 60 * 60 * 1000);
            const locale = this.hass?.locale?.language || this.hass?.language || undefined;
            const timeFormatter = new Intl.DateTimeFormat(locale, {
                hour: 'numeric',
                minute: '2-digit'
            });
            return `${timeFormatter.format(date)} - ${timeFormatter.format(nextDate)}`;
        }
        if (actualHoursAgo < 1) {
            return `${Math.round(actualHoursAgo * 60)}${this.t('minutes_ago')}`;
        }
        return `${actualHoursAgo.toFixed(1)}${this.t('hours_ago')}`;
    }
    _handleEntityClick(entityId, e) {
        e.stopPropagation();
        const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId }
        });
        this.dispatchEvent(event);
    }
    t(key) {
        return (this.translations[this.language]?.[key]) || this.translations.en[key] || key;
    }
    render() {
        if (!this.config || !this.hass) {
            return b ``;
        }
        return b `
      <div class="card-header">
        <span>${this.config.title}</span>
      </div>
      ${this.config.entities.map(entityConfig => this._renderEntity(entityConfig))}
    `;
    }
    _renderEntity(entityConfig) {
        const entityObj = typeof entityConfig === 'string' ? { entity: entityConfig } : entityConfig;
        const entityId = entityObj.entity;
        const entity = this.hass.states[entityId];
        if (!entity) {
            return b `<div class="error">Entity not found: ${entityId}</div>`;
        }
        const name = entityObj.name || entity.attributes.friendly_name || entityId;
        // Resolve icon
        let icon = entity.attributes?.icon;
        if (!icon) {
            const domain = entityId.split('.')[0];
            icon = DEFAULT_DOMAIN_ICONS[domain] || 'mdi:bookmark';
        }
        // Check if icon should be shown
        const showIcons = entityObj.show_icons !== undefined ? entityObj.show_icons : this.config.show_icons;
        // Get offset for this entity
        const startOffset = entityObj.start_offset ?? this.config.start_offset ?? 0;
        // Use composite key to support same entity with different offsets
        const cacheKey = `${entityId}_${startOffset}`;
        // Get history data using composite key
        const historyData = this.processedHistories[cacheKey]?.data || [];
        // For offset entities, don't append current state (it's historical data)
        // For non-offset entities, append current state as the last bar
        const history = startOffset > 0
            ? historyData.map(d => d.value)
            : [...historyData.map(d => d.value), this.parseState(entity.state, entityObj)];
        const [actualMin, actualMax] = this.getMinMax(history);
        const showLabels = entityObj.show_labels ?? this.config.show_labels;
        const labelCount = entityObj.label_count ?? this.config.label_count ?? DEFAULTS.label_count;
        const labelFormat = entityObj.label_format ?? this.config.label_format ?? DEFAULTS.label_format;
        const showMinMax = entityObj.show_min_max ?? this.config.show_min_max;
        const showCurrent = entityObj.show_current ?? this.config.show_current;
        const hours = entityObj.hours ?? this.config.hours;
        const intervals = entityObj.intervals ?? this.config.intervals;
        const current = this.parseState(entity.state, entityObj);
        const inlineLayout = entityObj.inline_layout ?? this.config.inline_layout;
        // Build evenly-spaced time labels. label_count=1 gives [start, end].
        // label_count=N gives N+1 labels spaced (hours/N) apart, capped at hours.
        const segments = Math.max(1, Math.min(Math.round(labelCount), hours));
        const endTime = Date.now() - startOffset * 60 * 60 * 1000;
        const timeLabels = Array.from({ length: segments + 1 }, (_, i) => {
            const hoursAgo = (hours + startOffset) - (i * hours / segments);
            if (labelFormat === 'relative') {
                if (hoursAgo <= startOffset && startOffset === 0)
                    return this.t('now');
                return `${Math.round(hoursAgo)}${this.t('hours_ago')}`;
            }
            const ts = new Date(endTime - (segments - i) * (hours / segments) * 60 * 60 * 1000);
            return ts.toLocaleTimeString([], labelFormat === '12h'
                ? { hour: 'numeric', minute: '2-digit', hour12: true }
                : { hour: '2-digit', minute: '2-digit', hour12: false });
        });
        // Render waterfall bars
        const waterfallBars = b `
      ${history.map((value, index) => {
            const isLast = index === history.length - 1;
            const color = this.getColorForValue(value, entityObj);
            const title = `${this.getTimeLabel(index, intervals, hours, startOffset)} : ${value !== null ? this.displayState(value, entityObj) : this.t('no_data')}`;
            return b `
          <div
            class="bar-segment ${isLast ? 'last-bar' : ''}"
            style="background-color: ${color};"
            title=${title}>
          </div>
        `;
        })}
    `;
        // Inline layout
        if (inlineLayout) {
            return b `
        <div class="entity-inline-container" @click=${(e) => this._handleEntityClick(entityId, e)}>
          <div class="entity-inline-name">
            ${showIcons ? b `<ha-icon class="entity-icon" .icon=${icon}></ha-icon>` : ''}
            <span class="entity-name">${name}</span>
          </div>
          <div class="entity-inline-graph">
            <div class="waterfall-container">
              ${waterfallBars}
            </div>
            ${showLabels ? b `
              <div class="labels">
                ${timeLabels.map(l => b `<span>${l}</span>`)}
              </div>
            ` : ''}
          </div>
          ${showCurrent ? b `<div class="entity-inline-value">${this.displayState(current, entityObj)}</div>` : ''}
        </div>
        ${showMinMax ? b `
          <div class="min-max-label">
            ${this.t('min_label')}: ${this.displayState(actualMin, entityObj)} / ${this.t('max_label')}: ${this.displayState(actualMax, entityObj)}
          </div>
        ` : ''}
      `;
        }
        // Default layout
        return b `
      <div class="entity-container" @click=${(e) => this._handleEntityClick(entityId, e)}>
        <div class="entity-header">
          ${showIcons ? b `<ha-icon class="entity-icon" .icon=${icon}></ha-icon>` : ''}
          <span class="entity-name">${name}</span>
          ${showCurrent ? b `<span class="current-value">${this.displayState(current, entityObj)}</span>` : ''}
        </div>
        <div class="waterfall-container">
          ${waterfallBars}
        </div>
        ${showLabels ? b `
          <div class="labels">
            ${timeLabels.map(l => b `<span>${l}</span>`)}
          </div>
        ` : ''}
        ${showMinMax ? b `
          <div class="min-max-label">
            ${this.t('min_label')}: ${this.displayState(actualMin, entityObj)} / ${this.t('max_label')}: ${this.displayState(actualMax, entityObj)}
          </div>
        ` : ''}
      </div>
    `;
    }
    getCardSize() {
        return this.config?.entities?.length * 2 || 2;
    }
    // Sections view (grid layout) sizing - 12-column grid system
    getGridOptions() {
        return {
            rows: 3,
            columns: 12,
            min_rows: 2,
            min_columns: 6,
        };
    }
}
WaterfallHistoryCard.styles = i$3 `
    :host {
      padding: 16px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: var(--ha-card-box-shadow, none);
      box-sizing: border-box;
      border-radius: var(--ha-card-border-radius, 12px);
      border-width: var(--ha-card-border-width, 1px);
      border-style: solid;
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      color: var(--primary-text-color);
      display: block;
      height: 100%;
      position: relative;
    }

    .card-header {
      font-size: var(--header-font-size, 11px);
      font-weight: 600;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      padding-bottom: 10px;
      margin-bottom: 2px;
      color: var(--secondary-text-color, #727272);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .entity-container {
      margin-bottom: 12px;
      cursor: pointer;
    }

    .entity-container:last-child {
      margin-bottom: 0;
    }

    .entity-container + .entity-container {
      padding-top: 10px;
    }

    .entity-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .entity-icon {
      --mdc-icon-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      opacity: 0.45;
    }

    .entity-name {
      font-size: var(--entity-name-font-size, 11px);
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--primary-text-color);
    }

    .current-value {
      margin-left: auto;
      font-size: var(--entity-name-font-size, 11px);
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums lining-nums;
      font-feature-settings: 'tnum' 1;
    }

    .waterfall-container {
      position: relative;
      height: var(--waterfall-height, 60px);
      border-radius: 3px;
      overflow: hidden;
      display: flex;
      gap: var(--waterfall-cell-gap, 1px);
      background: var(--divider-color, rgba(0,0,0,0.35));
    }

    .bar-segment {
      flex: 1;
      height: 100%;
      transition: filter 0.15s ease;
    }

    .bar-segment:hover {
      filter: brightness(1.18);
    }

    .labels {
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      letter-spacing: 0.04em;
      color: var(--primary-text-color);
      margin-top: var(--labels-margin-top, 5px);
    }

    .min-max-label {
      display: block;
      width: 100%;
      font-size: 10px;
      letter-spacing: 0.03em;
      color: var(--primary-text-color);
      text-align: center;
    }

    .error {
      color: var(--error-color, red);
    }

    /* Compact mode overrides */
    :host(.compact) .card-header {
      font-size: 10px;
    }

    :host(.compact) .entity-name {
      font-size: 10px;
    }

    :host(.compact) .labels {
      margin-top: 2px;
    }

    :host(.compact) .entity-container {
      margin-bottom: 6px;
    }

    :host(.compact) .entity-container + .entity-container {
      padding-top: 5px;
    }

    /* Inline layout styles */
    .entity-inline-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .entity-inline-container + .entity-inline-container {
      padding-top: 10px;
    }

    .entity-inline-container .entity-inline-name {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .entity-inline-container .entity-icon {
      --mdc-icon-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .entity-inline-container .entity-name {
      font-size: var(--entity-name-font-size, 11px);
      font-weight: 500;
      white-space: nowrap;
      line-height: var(--waterfall-height, 60px);
    }

    .entity-inline-container .entity-inline-graph {
      flex: 1;
      min-width: 0;
    }

    .entity-inline-container .waterfall-container {
      margin-bottom: 0;
    }

    .entity-inline-container .labels {
      display: none;
    }

    .entity-inline-container .entity-inline-value {
      flex-shrink: 0;
      text-align: right;
      font-size: var(--entity-name-font-size, 11px);
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums lining-nums;
      font-feature-settings: 'tnum' 1;
      white-space: nowrap;
      line-height: var(--waterfall-height, 60px);
    }

    /* Compact mode for inline layout */
    :host(.compact) .entity-inline-container {
      margin-bottom: 6px;
    }

    :host(.compact) .entity-inline-container + .entity-inline-container {
      padding-top: 5px;
    }

    :host(.compact) .entity-inline-container .entity-icon {
      width: 12px;
      height: 12px;
    }

    :host(.compact) .entity-inline-container .entity-name {
      font-size: 10px;
    }

  `;
__decorate([
    n({ attribute: false })
], WaterfallHistoryCard.prototype, "hass", void 0);
__decorate([
    r()
], WaterfallHistoryCard.prototype, "config", void 0);
__decorate([
    r()
], WaterfallHistoryCard.prototype, "processedHistories", void 0);
// Register custom element with guard to prevent duplicate registration
if (!customElements.get('waterfall-history-card')) {
    customElements.define('waterfall-history-card', WaterfallHistoryCard);
}
// Register with Home Assistant card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'waterfall-history-card',
    name: 'Waterfall History Card',
    description: 'A horizontal waterfall display for historical sensor data with visual editor',
    preview: true,
});
console.info(`%c WATERFALL-HISTORY-CARD %c 2026.7.18 `, 'color: black; background: #F2720C; font-weight: 600;', 'color: black; background: #00a5c9; font-weight: 600;');

var NumberFormat;
(function (NumberFormat) {
    NumberFormat["language"] = "language";
    NumberFormat["system"] = "system";
    NumberFormat["comma_decimal"] = "comma_decimal";
    NumberFormat["decimal_comma"] = "decimal_comma";
    NumberFormat["space_comma"] = "space_comma";
    NumberFormat["none"] = "none";
})(NumberFormat || (NumberFormat = {}));
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["language"] = "language";
    TimeFormat["system"] = "system";
    TimeFormat["am_pm"] = "12";
    TimeFormat["twenty_four"] = "24";
})(TimeFormat || (TimeFormat = {}));

// Polymer legacy event helpers used courtesy of the Polymer project.
//
// Copyright (c) 2017 The Polymer Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
/**
 * Dispatches a custom event with an optional detail value.
 *
 * @param {string} type Name of event type.
 * @param {*=} detail Detail value containing event-specific
 *   payload.
 * @param {{ bubbles: (boolean|undefined),
 *           cancelable: (boolean|undefined),
 *           composed: (boolean|undefined) }=}
 *  options Object specifying options.  These may include:
 *  `bubbles` (boolean, defaults to `true`),
 *  `cancelable` (boolean, defaults to false), and
 *  `node` on which to fire the event (HTMLElement, defaults to `this`).
 * @return {Event} The new event that was fired.
 */
const fireEvent = (node, type, detail, options) => {
    options = options || {};
    // @ts-ignore
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

class WaterfallHistoryCardEditor extends i {
    setConfig(config) {
        this._config = config;
    }
    // Global configuration change handler
    _configValueChanged(key, value) {
        if (!this._config || !this.hass)
            return;
        const newConfig = { ...this._config, [key]: value };
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    // Entity management methods
    _addEntity() {
        const newConfig = { ...this._config };
        if (!newConfig.entities) {
            newConfig.entities = [];
        }
        newConfig.entities = [...newConfig.entities, { entity: '' }];
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _removeEntity(index) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        newConfig.entities.splice(index, 1);
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _entityChanged(index, key, value) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        // Normalize string entities to objects
        const currentEntity = newConfig.entities[index];
        const entityConfig = typeof currentEntity === 'string'
            ? { entity: currentEntity }
            : { ...currentEntity };
        // Update the specific key
        entityConfig[key] = value;
        newConfig.entities[index] = entityConfig;
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    // Global threshold management
    _addThreshold() {
        const newConfig = { ...this._config };
        if (!newConfig.thresholds) {
            newConfig.thresholds = [];
        }
        newConfig.thresholds = [...newConfig.thresholds, { value: 0, color: '#cccccc' }];
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _removeThreshold(index) {
        const newConfig = { ...this._config };
        if (!newConfig.thresholds)
            return;
        newConfig.thresholds = [...newConfig.thresholds];
        newConfig.thresholds.splice(index, 1);
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _thresholdChanged(index, key, value) {
        const newConfig = { ...this._config };
        if (!newConfig.thresholds)
            return;
        newConfig.thresholds = [...newConfig.thresholds];
        newConfig.thresholds[index] = {
            ...newConfig.thresholds[index],
            [key]: key === 'value' ? Number(value) : value
        };
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    // Global state_colors management
    _addStateColor() {
        const entries = Object.entries(this._config.state_colors || {});
        entries.push(['', '#cccccc']);
        this._configValueChanged('state_colors', Object.fromEntries(entries));
    }
    _removeStateColor(index) {
        const entries = Object.entries(this._config.state_colors || {});
        entries.splice(index, 1);
        this._configValueChanged('state_colors', entries.length > 0 ? Object.fromEntries(entries) : undefined);
    }
    _stateColorChanged(index, key, value) {
        const entries = Object.entries(this._config.state_colors || {});
        if (key === 'state') {
            entries[index] = [value, entries[index][1]];
        }
        else {
            entries[index] = [entries[index][0], value];
        }
        this._configValueChanged('state_colors', Object.fromEntries(entries));
    }
    // Per-entity state_colors management
    _addEntityStateColor(entityIndex) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        const currentEntity = newConfig.entities[entityIndex];
        const entityConfig = typeof currentEntity === 'string' ? { entity: currentEntity } : { ...currentEntity };
        const entries = Object.entries(entityConfig.state_colors || {});
        entries.push(['', '#cccccc']);
        entityConfig.state_colors = Object.fromEntries(entries);
        newConfig.entities[entityIndex] = entityConfig;
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _removeEntityStateColor(entityIndex, stateIndex) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        const currentEntity = newConfig.entities[entityIndex];
        const entityConfig = typeof currentEntity === 'string' ? { entity: currentEntity } : { ...currentEntity };
        const entries = Object.entries(entityConfig.state_colors || {});
        entries.splice(stateIndex, 1);
        entityConfig.state_colors = entries.length > 0 ? Object.fromEntries(entries) : undefined;
        newConfig.entities[entityIndex] = entityConfig;
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _entityStateColorChanged(entityIndex, stateIndex, key, value) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        const currentEntity = newConfig.entities[entityIndex];
        const entityConfig = typeof currentEntity === 'string' ? { entity: currentEntity } : { ...currentEntity };
        const entries = Object.entries(entityConfig.state_colors || {});
        if (key === 'state') {
            entries[stateIndex] = [value, entries[stateIndex][1]];
        }
        else {
            entries[stateIndex] = [entries[stateIndex][0], value];
        }
        entityConfig.state_colors = Object.fromEntries(entries);
        newConfig.entities[entityIndex] = entityConfig;
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    // Per-entity threshold management
    _addEntityThreshold(entityIndex) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        const currentEntity = newConfig.entities[entityIndex];
        const entityConfig = typeof currentEntity === 'string'
            ? { entity: currentEntity }
            : { ...currentEntity };
        if (!entityConfig.thresholds) {
            entityConfig.thresholds = [];
        }
        entityConfig.thresholds = [...entityConfig.thresholds, { value: 0, color: '#cccccc' }];
        newConfig.entities[entityIndex] = entityConfig;
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _removeEntityThreshold(entityIndex, thresholdIndex) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        const currentEntity = newConfig.entities[entityIndex];
        const entityConfig = typeof currentEntity === 'string'
            ? { entity: currentEntity }
            : { ...currentEntity };
        if (!entityConfig.thresholds)
            return;
        entityConfig.thresholds = [...entityConfig.thresholds];
        entityConfig.thresholds.splice(thresholdIndex, 1);
        newConfig.entities[entityIndex] = entityConfig;
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    _entityThresholdChanged(entityIndex, thresholdIndex, key, value) {
        const newConfig = { ...this._config };
        newConfig.entities = [...newConfig.entities];
        const currentEntity = newConfig.entities[entityIndex];
        const entityConfig = typeof currentEntity === 'string'
            ? { entity: currentEntity }
            : { ...currentEntity };
        if (!entityConfig.thresholds)
            return;
        entityConfig.thresholds = [...entityConfig.thresholds];
        entityConfig.thresholds[thresholdIndex] = {
            ...entityConfig.thresholds[thresholdIndex],
            [key]: key === 'value' ? Number(value) : value
        };
        newConfig.entities[entityIndex] = entityConfig;
        fireEvent(this, 'config-changed', { config: newConfig });
    }
    render() {
        if (!this._config || !this.hass) {
            return b ``;
        }
        return b `
      <div class="card-config">
        ${this._renderBasicSettings()}
        ${this._renderDisplayOptions()}
        ${this._renderBinaryStateConfig()}
        ${this._renderGlobalThresholds()}
        ${this._renderEntities()}
      </div>
    `;
    }
    // Section 1: Basic Settings
    _renderBasicSettings() {
        return b `
      <div class="section">
        <h3>Basic Settings</h3>

        <ha-selector
          .hass=${this.hass}
          .label=${'Card Title'}
          .value=${this._config.title || DEFAULTS.title}
          .selector=${{ text: {} }}
          @value-changed=${(ev) => this._configValueChanged('title', ev.detail.value)}
        ></ha-selector>

        <ha-selector
          .hass=${this.hass}
          .label=${'Time Window (hours)'}
          .value=${this._config.hours || DEFAULTS.hours}
          .selector=${{ number: { min: 1, max: 168, mode: 'box', step: 1 } }}
          @value-changed=${(ev) => this._configValueChanged('hours', Number(ev.detail.value))}
        ></ha-selector>

        <ha-selector
          .hass=${this.hass}
          .label=${'Intervals'}
          .value=${this._config.intervals || DEFAULTS.intervals}
          .selector=${{ number: { min: 24, max: 96, mode: 'box', step: 1 } }}
          @value-changed=${(ev) => this._configValueChanged('intervals', Number(ev.detail.value))}
        ></ha-selector>

        <ha-selector
          .hass=${this.hass}
          .label=${'Bar Height (pixels)'}
          .value=${this._config.height || DEFAULTS.height}
          .selector=${{ number: { min: 30, max: 200, mode: 'box', step: 1 } }}
          @value-changed=${(ev) => this._configValueChanged('height', Number(ev.detail.value))}
        ></ha-selector>

        <ha-selector
          .hass=${this.hass}
          .label=${'Decimal Places'}
          .value=${this._config.digits ?? DEFAULTS.digits}
          .selector=${{ number: { min: 0, max: 5, mode: 'box', step: 1 } }}
          @value-changed=${(ev) => this._configValueChanged('digits', Number(ev.detail.value))}
        ></ha-selector>

        <ha-selector
          .hass=${this.hass}
          .selector=${{
            select: {
                options: [
                    { value: 'last', label: 'Last (default) - use final value in each interval' },
                    { value: 'min', label: 'Minimum - show lowest value (reveals brief dips)' },
                    { value: 'max', label: 'Maximum - show highest value (reveals brief spikes/activations)' },
                ]
            }
        }}
          .value=${this._config.interval_value || DEFAULTS.interval_value}
          @value-changed=${(ev) => this._configValueChanged('interval_value', ev.detail.value)}
          .label=${'Interval Value'}
        ></ha-selector>
      </div>
    `;
    }
    // Section 2: Display Options
    _renderDisplayOptions() {
        return b `
      <div class="section">
        <h3>Display Options</h3>

        <div class="toggle-row">
          <label>Show Icons</label>
          <ha-switch
            .checked=${this._config.show_icons !== false}
            @change=${(ev) => this._configValueChanged('show_icons', ev.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Show Labels</label>
          <ha-switch
            .checked=${this._config.show_labels !== false}
            @change=${(ev) => this._configValueChanged('show_labels', ev.target.checked)}
          ></ha-switch>
        </div>

        <ha-selector
          .hass=${this.hass}
          .label=${'Label Count'}
          .value=${this._config.label_count ?? DEFAULTS.label_count}
          .selector=${{ number: { min: 1, max: 168, mode: 'box', step: 1 } }}
          @value-changed=${(ev) => this._configValueChanged('label_count', Number(ev.detail.value))}
        ></ha-selector>

        <ha-selector
          .hass=${this.hass}
          .label=${'Label Format'}
          .selector=${{
            select: {
                options: [
                    { value: 'relative', label: 'Relative (e.g. 24h ago, Now)' },
                    { value: '24h', label: '24-hour time (e.g. 14:30)' },
                    { value: '12h', label: '12-hour time (e.g. 2:30 PM)' },
                ]
            }
        }}
          .value=${this._config.label_format || DEFAULTS.label_format}
          @value-changed=${(ev) => this._configValueChanged('label_format', ev.detail.value)}
        ></ha-selector>

        <div class="toggle-row">
          <label>Show Current Value</label>
          <ha-switch
            .checked=${this._config.show_current !== false}
            @change=${(ev) => this._configValueChanged('show_current', ev.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Show Min/Max</label>
          <ha-switch
            .checked=${this._config.show_min_max || false}
            @change=${(ev) => this._configValueChanged('show_min_max', ev.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Compact Mode</label>
          <ha-switch
            .checked=${this._config.compact || false}
            @change=${(ev) => this._configValueChanged('compact', ev.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Inline Layout</label>
          <ha-switch
            .checked=${this._config.inline_layout || false}
            @change=${(ev) => this._configValueChanged('inline_layout', ev.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Gradient Mode</label>
          <ha-switch
            .checked=${this._config.gradient || false}
            @change=${(ev) => this._configValueChanged('gradient', ev.target.checked)}
          ></ha-switch>
        </div>

        <ha-selector
          .hass=${this.hass}
          .label=${'Cell Gap (pixels)'}
          .value=${this._config.cell_gap ?? DEFAULTS.cell_gap}
          .selector=${{ number: { min: 0, max: 10, mode: 'box', step: 1 } }}
          @value-changed=${(ev) => this._configValueChanged('cell_gap', Number(ev.detail.value))}
        ></ha-selector>
      </div>
    `;
    }
    // Section 3: Binary State Configuration
    _renderBinaryStateConfig() {
        return b `
      <ha-expansion-panel header="Binary State Configuration (Advanced)" .expanded=${false}>
        <div class="section">
          <p class="helper-text">
            Configure colors and labels for binary sensors (on/off states).
          </p>

          <ha-selector
            .hass=${this.hass}
            .label=${'On State Color'}
            .value=${this._config.color_on || DEFAULTS.color_on}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('color_on', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Off State Color'}
            .value=${this._config.color_off || DEFAULTS.color_off}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('color_off', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'On State Label'}
            .value=${this._config.state_on || DEFAULTS.state_on}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('state_on', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Off State Label'}
            .value=${this._config.state_off || DEFAULTS.state_off}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('state_off', ev.detail.value)}
          ></ha-selector>

          <h4>Unknown & Unavailable States</h4>

          <ha-selector
            .hass=${this.hass}
            .label=${'Unknown State Color'}
            .value=${this._config.color_unknown || DEFAULTS.color_unknown}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('color_unknown', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Unknown State Label'}
            .value=${this._config.state_unknown || DEFAULTS.state_unknown}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('state_unknown', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Unavailable State Color'}
            .value=${this._config.color_unavailable || DEFAULTS.color_unavailable}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('color_unavailable', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Unavailable State Label'}
            .value=${this._config.state_unavailable || DEFAULTS.state_unavailable}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._configValueChanged('state_unavailable', ev.detail.value)}
          ></ha-selector>

          ${this._renderGlobalStateColors()}
        </div>
      </ha-expansion-panel>
    `;
    }
    // Section 4: Global Thresholds
    _renderGlobalThresholds() {
        const thresholds = this._config.thresholds || [];
        return b `
      <ha-expansion-panel header="Global Thresholds (Advanced)" .expanded=${false}>
        <div class="section">
          <p class="helper-text">
            Define color thresholds for numeric sensors. Colors apply when value is greater than or equal to the threshold value.
            These thresholds apply to all entities unless overridden per-entity.
          </p>

          ${thresholds.length === 0 ? b `
            <p class="info-text">No thresholds defined. Using default temperature-based thresholds.</p>
          ` : ''}

          ${thresholds.map((threshold, index) => b `
            <div class="threshold-item">
              <input
                type="number"
                .value=${String(threshold.value)}
                style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
                @change=${(ev) => this._thresholdChanged(index, 'value', ev.target.value)}
              >
              <input
                type="text"
                placeholder="e.g., #FF0000"
                .value=${threshold.color}
                style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
                @input=${(ev) => this._thresholdChanged(index, 'color', ev.target.value)}
              >
              <mwc-button @click=${() => this._removeThreshold(index)}>
                Remove
              </mwc-button>
            </div>
          `)}

          <mwc-button raised @click=${this._addThreshold}>
            Add Threshold
          </mwc-button>
        </div>
      </ha-expansion-panel>
    `;
    }
    // Section 5: Entity Management
    _renderEntities() {
        const entities = this._config.entities || [];
        return b `
      <div class="section">
        <h3>Entities</h3>
        <p class="helper-text">
          Add entities to display in the card. Each entity can override global settings.
        </p>

        ${entities.length === 0 ? b `
          <p class="info-text">No entities configured. Add at least one entity.</p>
        ` : ''}

        ${entities.map((entity, index) => this._renderEntityConfig(entity, index))}

        <mwc-button raised @click=${this._addEntity}>
          Add Entity
        </mwc-button>
      </div>
    `;
    }
    _renderEntityConfig(entity, index) {
        const entityConfig = typeof entity === 'string' ? { entity } : entity;
        const entityId = entityConfig.entity;
        return b `
      <ha-expansion-panel
        header="${entityConfig.name || entityId || `Entity ${index + 1}`}"
        .expanded=${false}>
        <div class="entity-config">
          <div class="entity-header-row">
            <mwc-button @click=${() => this._removeEntity(index)}>
              Remove Entity
            </mwc-button>
          </div>

          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: {} }}
            .value=${entityId}
            @value-changed=${(ev) => this._entityChanged(index, 'entity', ev.detail.value)}
            .label=${'Entity'}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Custom Name (optional)'}
            .value=${entityConfig.name || ''}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._entityChanged(index, 'name', ev.detail.value)}
          ></ha-selector>

          ${this._renderEntityAdvancedOptions(entityConfig, index)}
        </div>
      </ha-expansion-panel>
    `;
    }
    _renderEntityAdvancedOptions(entityConfig, index) {
        return b `
      <ha-expansion-panel header="Advanced Overrides (Optional)" .expanded=${false}>
        <div class="entity-overrides">
          <p class="helper-text">
            Override global settings for this entity only. Leave blank to use global values.
          </p>

          <h4>Time Window Overrides</h4>

          <ha-selector
            .hass=${this.hass}
            .label=${'Hours (override)'}
            .value=${entityConfig.hours || ''}
            .selector=${{ number: { min: 1, max: 168, mode: 'box', step: 1 } }}
            @value-changed=${(ev) => this._entityChanged(index, 'hours', ev.detail.value ? Number(ev.detail.value) : undefined)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Intervals (override)'}
            .value=${entityConfig.intervals || ''}
            .selector=${{ number: { min: 24, max: 96, mode: 'box', step: 1 } }}
            @value-changed=${(ev) => this._entityChanged(index, 'intervals', ev.detail.value ? Number(ev.detail.value) : undefined)}
          ></ha-selector>

          <h4>Display Overrides</h4>

          <div class="toggle-row">
            <label>Show Icons (override)</label>
            <ha-switch
              .checked=${entityConfig.show_icons ?? true}
              @change=${(ev) => this._entityChanged(index, 'show_icons', ev.target.checked)}
            ></ha-switch>
          </div>

          <div class="toggle-row">
            <label>Show Labels (override)</label>
            <ha-switch
              .checked=${entityConfig.show_labels ?? true}
              @change=${(ev) => this._entityChanged(index, 'show_labels', ev.target.checked)}
            ></ha-switch>
          </div>

          <ha-selector
            .hass=${this.hass}
            .label=${'Label Count (override)'}
            .value=${entityConfig.label_count || ''}
            .selector=${{ number: { min: 1, max: 168, mode: 'box', step: 1 } }}
            @value-changed=${(ev) => this._entityChanged(index, 'label_count', ev.detail.value ? Number(ev.detail.value) : undefined)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Label Format (override)'}
            .selector=${{
            select: {
                options: [
                    { value: 'relative', label: 'Relative (e.g. 24h ago, Now)' },
                    { value: '24h', label: '24-hour time (e.g. 14:30)' },
                    { value: '12h', label: '12-hour time (e.g. 2:30 PM)' },
                ]
            }
        }}
            .value=${entityConfig.label_format || ''}
            @value-changed=${(ev) => this._entityChanged(index, 'label_format', ev.detail.value || undefined)}
          ></ha-selector>

          <div class="toggle-row">
            <label>Show Current (override)</label>
            <ha-switch
              .checked=${entityConfig.show_current ?? true}
              @change=${(ev) => this._entityChanged(index, 'show_current', ev.target.checked)}
            ></ha-switch>
          </div>

          <div class="toggle-row">
            <label>Inline Layout (override)</label>
            <ha-switch
              .checked=${entityConfig.inline_layout ?? false}
              @change=${(ev) => this._entityChanged(index, 'inline_layout', ev.target.checked)}
            ></ha-switch>
          </div>

          <h4>Styling Overrides</h4>

          <ha-selector
            .hass=${this.hass}
            .label=${'Custom Icon'}
            .value=${entityConfig.icon || ''}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._entityChanged(index, 'icon', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Custom Unit'}
            .value=${entityConfig.unit || ''}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._entityChanged(index, 'unit', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Decimal Places (override)'}
            .value=${entityConfig.digits ?? ''}
            .selector=${{ number: { min: 0, max: 5, mode: 'box', step: 1 } }}
            @value-changed=${(ev) => this._entityChanged(index, 'digits', ev.detail.value ? Number(ev.detail.value) : undefined)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .selector=${{
            select: {
                options: [
                    { value: 'last', label: 'Last (default)' },
                    { value: 'min', label: 'Minimum (show lowest value per interval)' },
                    { value: 'max', label: 'Maximum (show highest value per interval)' },
                ]
            }
        }}
            .value=${entityConfig.interval_value || ''}
            @value-changed=${(ev) => this._entityChanged(index, 'interval_value', ev.detail.value || undefined)}
            .label=${'Interval Value (override)'}
          ></ha-selector>

          <h4>Binary State Overrides</h4>

          <ha-selector
            .hass=${this.hass}
            .label=${'On State Color (override)'}
            .value=${entityConfig.color_on || ''}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._entityChanged(index, 'color_on', ev.detail.value)}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .label=${'Off State Color (override)'}
            .value=${entityConfig.color_off || ''}
            .selector=${{ text: {} }}
            @value-changed=${(ev) => this._entityChanged(index, 'color_off', ev.detail.value)}
          ></ha-selector>

          ${this._renderEntityStateColors(entityConfig, index)}
          ${this._renderEntityThresholds(entityConfig, index)}
        </div>
      </ha-expansion-panel>
    `;
    }
    _renderGlobalStateColors() {
        const entries = Object.entries(this._config.state_colors || {});
        return b `
      <div class="entity-thresholds">
        <h4>Multi-State Colors (Global)</h4>
        <p class="helper-text">
          Map HA state strings to colors for multi-state entities (e.g. HVAC modes).
          Add one row per state in the order they should appear. The state name must
          match the HA state value exactly (case-insensitive).
        </p>

        ${entries.length === 0 ? b `
          <p class="info-text">No state colors defined.</p>
        ` : ''}

        ${entries.map(([stateName, color], index) => b `
          <div class="threshold-item">
            <input
              type="text"
              placeholder="State name (e.g. cool)"
              .value=${stateName}
              style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
              @change=${(ev) => this._stateColorChanged(index, 'state', ev.target.value)}
            >
            <input
              type="text"
              placeholder="e.g., #FF0000"
              .value=${color}
              style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
              @input=${(ev) => this._stateColorChanged(index, 'color', ev.target.value)}
            >
            <mwc-button @click=${() => this._removeStateColor(index)}>
              Remove
            </mwc-button>
          </div>
        `)}

        <mwc-button @click=${this._addStateColor}>
          Add State Color
        </mwc-button>
      </div>
    `;
    }
    _renderEntityStateColors(entityConfig, entityIndex) {
        const entries = Object.entries(entityConfig.state_colors || {});
        return b `
      <div class="entity-thresholds">
        <h4>Multi-State Colors (Per-Entity)</h4>
        <p class="helper-text">
          Map HA state strings to colors for this entity. Overrides global state colors.
          Add one row per state in the order they should appear.
        </p>

        ${entries.length === 0 ? b `
          <p class="info-text">No entity-specific state colors. Using global state colors.</p>
        ` : ''}

        ${entries.map(([stateName, color], stateIndex) => b `
          <div class="threshold-item">
            <input
              type="text"
              placeholder="State name (e.g. cool)"
              .value=${stateName}
              style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
              @change=${(ev) => this._entityStateColorChanged(entityIndex, stateIndex, 'state', ev.target.value)}
            >
            <input
              type="text"
              placeholder="e.g., #FF0000"
              .value=${color}
              style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
              @input=${(ev) => this._entityStateColorChanged(entityIndex, stateIndex, 'color', ev.target.value)}
            >
            <mwc-button @click=${() => this._removeEntityStateColor(entityIndex, stateIndex)}>
              Remove
            </mwc-button>
          </div>
        `)}

        <mwc-button @click=${() => this._addEntityStateColor(entityIndex)}>
          Add State Color
        </mwc-button>
      </div>
    `;
    }
    _renderEntityThresholds(entityConfig, entityIndex) {
        const thresholds = entityConfig.thresholds || [];
        return b `
      <div class="entity-thresholds">
        <h4>Per-Entity Thresholds</h4>
        <p class="helper-text">
          Define custom thresholds for this entity only. Overrides global thresholds.
        </p>

        ${thresholds.length === 0 ? b `
          <p class="info-text">No entity-specific thresholds. Using global thresholds.</p>
        ` : ''}

        ${thresholds.map((threshold, thresholdIndex) => b `
          <div class="threshold-item">
            <input
              type="number"
              .value=${String(threshold.value)}
              style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
              @change=${(ev) => this._entityThresholdChanged(entityIndex, thresholdIndex, 'value', ev.target.value)}
            >
            <input
              type="text"
              placeholder="e.g., #FF0000"
              .value=${threshold.color}
              style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
              @input=${(ev) => this._entityThresholdChanged(entityIndex, thresholdIndex, 'color', ev.target.value)}
            >
            <mwc-button @click=${() => this._removeEntityThreshold(entityIndex, thresholdIndex)}>
              Remove
            </mwc-button>
          </div>
        `)}

        <mwc-button @click=${() => this._addEntityThreshold(entityIndex)}>
          Add Entity Threshold
        </mwc-button>
      </div>
    `;
    }
    static get styles() {
        return i$3 `
      :host {
        display: block;
        padding: 16px;
      }

      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .section {
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      h4 {
        margin: 16px 0 8px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      ha-selector {
        display: block;
        margin-bottom: 12px;
        width: 100%;
      }

      ha-expansion-panel {
        display: block;
        margin-bottom: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
      }

      .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .toggle-row:last-child {
        border-bottom: none;
      }

      .toggle-row label {
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .threshold-item {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 8px;
        margin-bottom: 8px;
        align-items: start;
      }

      .entity-config {
        padding: 12px;
      }

      .entity-header-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }

      .entity-overrides {
        padding: 12px;
      }

      .helper-text {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 12px 0;
      }

      .info-text {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin: 8px 0;
      }

      mwc-button {
        margin-top: 8px;
      }

      mwc-button[raised] {
        --mdc-theme-primary: var(--primary-color);
      }
    `;
    }
}
__decorate([
    n({ attribute: false })
], WaterfallHistoryCardEditor.prototype, "hass", void 0);
__decorate([
    r()
], WaterfallHistoryCardEditor.prototype, "_config", void 0);
// Register custom element with guard to prevent duplicate registration
if (!customElements.get('waterfall-history-card-editor')) {
    customElements.define('waterfall-history-card-editor', WaterfallHistoryCardEditor);
}

var editor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    WaterfallHistoryCardEditor: WaterfallHistoryCardEditor
});

export { WaterfallHistoryCard };
//# sourceMappingURL=horizontal-waterfall-history-card.js.map
