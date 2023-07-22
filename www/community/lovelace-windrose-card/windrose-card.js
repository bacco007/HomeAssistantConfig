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

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=window,e$3=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),n$4=new WeakMap;class o$4{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$4.set(s,t));}return t}toString(){return this.cssText}}const r$2=t=>new o$4("string"==typeof t?t:t+"",void 0,s$3),i$2=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$4(n,t,s$3)},S$1=(s,n)=>{e$3?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$1.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$1=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var s$2;const e$2=window,r$1=e$2.trustedTypes,h$1=r$1?r$1.emptyScript:"",o$3=e$2.reactiveElementPolyfillSupport,n$3={toAttribute(t,i){switch(i){case Boolean:t=t?h$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:n$3,reflect:!1,hasChanged:a$1};class d$1 extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$1(i));}else void 0!==i&&s.push(c$1(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$2){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$3).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$3;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}}d$1.finalized=!0,d$1.elementProperties=new Map,d$1.elementStyles=[],d$1.shadowRootOptions={mode:"open"},null==o$3||o$3({ReactiveElement:d$1}),(null!==(s$2=e$2.reactiveElementVersions)&&void 0!==s$2?s$2:e$2.reactiveElementVersions=[]).push("1.6.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t;const i$1=window,s$1=i$1.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$2=`lit$${(Math.random()+"").slice(9)}$`,n$2="?"+o$2,l$1=`<${n$2}>`,h=document,r=(t="")=>h.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,c=t=>u(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,a=/-->/g,f=/>/g,_=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),m=/'/g,p=/"/g,$=/^(?:script|style|textarea|title)$/i,g=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),y=g(1),x=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),T=new WeakMap,A=h.createTreeWalker(h,129,null,!1),E=(t,i)=>{const s=t.length-1,n=[];let h,r=2===i?"<svg>":"",d=v;for(let i=0;i<s;i++){const s=t[i];let e,u,c=-1,g=0;for(;g<s.length&&(d.lastIndex=g,u=d.exec(s),null!==u);)g=d.lastIndex,d===v?"!--"===u[1]?d=a:void 0!==u[1]?d=f:void 0!==u[2]?($.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=_):void 0!==u[3]&&(d=_):d===_?">"===u[0]?(d=null!=h?h:v,c=-1):void 0===u[1]?c=-2:(c=d.lastIndex-u[2].length,e=u[1],d=void 0===u[3]?_:'"'===u[3]?p:m):d===p||d===m?d=_:d===a||d===f?d=v:(d=_,h=void 0);const y=d===_&&t[i+1].startsWith("/>")?" ":"";r+=d===v?s+l$1:c>=0?(n.push(e),s.slice(0,c)+"$lit$"+s.slice(c)+o$2+y):s+o$2+(-2===c?(n.push(void 0),i):y);}const u=r+(t[s]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==e$1?e$1.createHTML(u):u,n]};class C{constructor({strings:t,_$litType$:i},e){let l;this.parts=[];let h=0,d=0;const u=t.length-1,c=this.parts,[v,a]=E(t,i);if(this.el=C.createElement(v,e),A.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(o$2)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(o$2),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:h,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?k:"@"===i[1]?H:S});}else c.push({type:6,index:h});}for(const i of t)l.removeAttribute(i);}if($.test(l.tagName)){const t=l.textContent.split(o$2),i=t.length-1;if(i>0){l.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)l.append(t[s],r()),A.nextNode(),c.push({type:2,index:++h});l.append(t[i],r());}}}else if(8===l.nodeType)if(l.data===n$2)c.push({type:2,index:h});else {let t=-1;for(;-1!==(t=l.data.indexOf(o$2,t+1));)c.push({type:7,index:h}),t+=o$2.length-1;}h++;}}static createElement(t,i){const s=h.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===x)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=P(t,r._$AS(t,i.values),r,e)),i}class V{constructor(t,i){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:h).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),l=0,r=0,d=e[0];for(;void 0!==d;){if(l===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new I(n,this,t)),this.u.push(i),d=e[++r];}l!==(null==d?void 0:d.index)&&(n=A.nextNode(),l++);}return o}p(t){let i=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cm=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),d(t)?t===b||null==t||""===t?(this._$AH!==b&&this._$AR(),this._$AH=b):t!==this._$AH&&t!==x&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):c(t)?this.k(t):this.g(t);}O(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}g(t){this._$AH!==b&&d(this._$AH)?this._$AA.nextSibling.data=t:this.T(h.createTextNode(t)),this._$AH=t;}$(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=C.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.p(s);else {const t=new V(o,this),i=t.v(this.options);t.p(s),this.T(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new C(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.O(r()),this.O(r()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cm=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=b,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==x,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===x&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===b?t=b:t!==b&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===b?void 0:t;}}const R=s$1?s$1.emptyScript:"";class k extends S{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==b?this.element.setAttribute(this.name,R):this.element.removeAttribute(this.name);}}class H extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:b)===x)return;const e=this._$AH,o=t===b&&e!==b||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==b&&(e===b||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class I{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=i$1.litHtmlPolyfillSupport;null==z||z(C,N),(null!==(t=i$1.litHtmlVersions)&&void 0!==t?t:i$1.litHtmlVersions=[]).push("2.6.1");const Z=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(r(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var l,o$1;class s extends d$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Z(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return x}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n$1=globalThis.litElementPolyfillSupport;null==n$1||n$1({LitElement:s});(null!==(o$1=globalThis.litElementVersions)&&void 0!==o$1?o$1:globalThis.litElementVersions=[]).push("3.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=e=>n=>"function"==typeof n?((e,n)=>(customElements.define(e,n),n))(e,n):((e,n)=>{const{kind:t,elements:s}=n;return {kind:t,elements:s,finisher(n){customElements.define(e,n);}}})(e,n);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o=({finisher:e,descriptor:t})=>(o,n)=>{var r;if(void 0===n){const n=null!==(r=o.originalKey)&&void 0!==r?r:o.key,i=null!=t?{kind:"method",placement:"prototype",key:n,descriptor:t(o.key)}:{...o,key:n};return null!=e&&(i.finisher=function(t){e(t,n);}),i}{const r=o.constructor;void 0!==t&&Object.defineProperty(o,n,t(n)),null==e||e(r,n);}};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function i(i,n){return o({descriptor:o=>{const t={get(){var o,n;return null!==(n=null===(o=this.renderRoot)||void 0===o?void 0:o.querySelector(i))&&void 0!==n?n:null},enumerable:!0,configurable:!0};if(n){const n="symbol"==typeof o?Symbol():"__"+o;t.get=function(){var o,t;return void 0===this[n]&&(this[n]=null!==(t=null===(o=this.renderRoot)||void 0===o?void 0:o.querySelector(i))&&void 0!==t?t:null),this[n]};}return t}})}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var n;null!=(null===(n=window.HTMLSlotElement)||void 0===n?void 0:n.prototype.assignedElements)?(o,n)=>o.assignedElements(n):(o,n)=>o.assignedNodes(n).filter((o=>o.nodeType===Node.ELEMENT_NODE));

class GlobalConfig {
}
GlobalConfig.defaultCardinalDirectionLetters = "NESW";
GlobalConfig.defaultWindspeedBarLocation = 'bottom';
GlobalConfig.defaultHoursToShow = 4;
GlobalConfig.defaultRefreshInterval = 300;
GlobalConfig.defaultWindDirectionCount = 16;
GlobalConfig.defaultWindDirectionUnit = 'degrees';
GlobalConfig.defaultInputSpeedUnit = 'auto';
GlobalConfig.defaultOutputSpeedUnit = 'mps';
GlobalConfig.defaultWindspeedBarFull = true;
GlobalConfig.defaultMatchingStategy = 'direction-first';
GlobalConfig.defaultDirectionSpeedTimeDiff = 1;
GlobalConfig.defaultCenterCalmPercentage = true;
GlobalConfig.defaultSpeedRangeBeaufort = true;
GlobalConfig.verticalBarHeight = 30;
GlobalConfig.horizontalBarHeight = 15;

class SpeedRange {
    constructor(range, minSpeed, maxSpeed, color) {
        this.range = range;
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.color = color;
    }
    isRangeMatch(speed) {
        return speed >= this.minSpeed && (speed < this.maxSpeed || this.maxSpeed === -1);
    }
}

class CardColors {
    constructor() {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
        this.roseLines = 'rgb(160, 160, 160)';
        this.roseDirectionLetters = primaryColor;
        this.rosePercentages = primaryColor;
        this.barBorder = 'rgb(160, 160, 160)';
        this.barUnitName = primaryColor;
        this.barName = primaryColor;
        this.barUnitValues = primaryColor;
        this.barPercentages = 'black';
    }
}

class Log {
    static setLevel(level) {
        switch (level) {
            case 'NONE':
                this.level = 0;
                break;
            case 'ERROR':
                this.level = 1;
                break;
            case 'WARN':
                this.level = 2;
                break;
            case 'INFO':
                this.level = 3;
                break;
            case 'DEBUG':
                this.level = 4;
                break;
            case 'TRACE':
                this.level = 5;
                break;
            default:
                this.level = 0;
                this.error('Unkonwn log level set: ', level, ' default to WARN');
                break;
        }
        if (this.level > 2) {
            console.log('LOG level set to:', level);
        }
    }
    static checkLogLevel(logLevel) {
        if (logLevel === undefined) {
            return 'WARN';
        }
        if (logLevel === 'NONE' || logLevel === 'ERROR' || logLevel === 'WARN' || logLevel === 'INFO' ||
            logLevel === 'DEBUG' || logLevel === 'TRACE') {
            return logLevel;
        }
        throw new Error('Unkonwn log level configurated: ' + logLevel);
    }
    static error(message, ...optionalParams) {
        if (this.level >= 1) {
            if (optionalParams.length === 0) {
                console.error('ERROR ' + message);
            }
            else {
                console.error('ERROR ' + message, optionalParams[0]);
            }
        }
    }
    static warn(message, ...optionalParams) {
        if (this.level >= 2) {
            if (optionalParams.length === 0) {
                console.warn('WARN ' + message);
            }
            else {
                console.warn('WARN ' + message, optionalParams[0]);
            }
        }
    }
    static info(message, ...optionalParams) {
        if (this.level >= 3) {
            this.log('INFO ' + message, optionalParams);
        }
    }
    static debug(message, ...optionalParams) {
        if (this.level >= 4) {
            this.log('DEBUG ' + message, optionalParams);
        }
    }
    static trace(message, ...optionalParams) {
        if (this.level === 5) {
            this.log('TRACE ' + message, optionalParams);
        }
    }
    static log(message, ...optionalParams) {
        if (optionalParams[0].length === 0) {
            console.log(message);
        }
        else {
            console.log(message, optionalParams[0]);
        }
    }
}
Log.level = 0;

class WindSpeedEntity {
    constructor(entity, name, useStatistics, renderRelativeScale, speedUnit) {
        this.entity = entity;
        this.name = name;
        this.useStatistics = useStatistics;
        this.renderRelativeScale = renderRelativeScale;
        this.speedUnit = speedUnit;
    }
}

class WindDirectionEntity {
    constructor(entity, useStatistics, directionUnit, directionCompensation, directionLetters) {
        this.entity = entity;
        this.useStatistics = useStatistics;
        this.directionUnit = directionUnit;
        this.directionCompensation = directionCompensation;
        this.directionLetters = directionLetters;
    }
}

class DataPeriod {
    constructor(hourstoShow, fromHourOfDay) {
        this.hourstoShow = hourstoShow;
        this.fromHourOfDay = fromHourOfDay;
    }
}

class CardConfigWrapper {
    static exampleConfig() {
        return {
            title: 'Wind direction',
            data_period: {
                hours_to_show: GlobalConfig.defaultHoursToShow
            },
            max_width: 400,
            refresh_interval: GlobalConfig.defaultRefreshInterval,
            windspeed_bar_location: GlobalConfig.defaultWindspeedBarLocation,
            windspeed_bar_full: GlobalConfig.defaultWindspeedBarFull,
            wind_direction_entity: {
                entity: '',
                direction_unit: GlobalConfig.defaultWindDirectionUnit,
                use_statistics: false,
                direction_compensation: 0
            },
            windspeed_entities: [
                {
                    entity: '',
                    name: '',
                    speed_unit: GlobalConfig.defaultInputSpeedUnit,
                    use_statistics: false
                }
            ],
            output_speed_unit: GlobalConfig.defaultOutputSpeedUnit,
            speed_range_beaufort: GlobalConfig.defaultSpeedRangeBeaufort,
            speed_range_step: undefined,
            speed_range_max: undefined,
            speed_ranges: undefined,
            windrose_draw_north_offset: 0,
            cardinal_direction_letters: GlobalConfig.defaultCardinalDirectionLetters,
            matching_strategy: GlobalConfig.defaultMatchingStategy,
            center_calm_percentage: GlobalConfig.defaultCenterCalmPercentage,
            log_level: GlobalConfig.defaultLogLevel
        };
    }
    constructor(cardConfig) {
        this.cardConfig = cardConfig;
        this.speedRanges = [];
        this.title = this.cardConfig.title;
        this.dataPeriod = this.checkDataPeriod(cardConfig.hours_to_show, cardConfig.data_period);
        this.refreshInterval = this.checkRefreshInterval();
        this.maxWidth = this.checkMaxWidth();
        this.windDirectionEntity = this.checkWindDirectionEntity();
        this.windspeedEntities = this.checkWindspeedEntities();
        this.windRoseDrawNorthOffset = this.checkwindRoseDrawNorthOffset();
        this.windspeedBarLocation = this.checkWindspeedBarLocation();
        this.windspeedBarFull = this.checkBooleanDefaultTrue(cardConfig.windspeed_bar_full);
        this.hideWindspeedBar = this.checkBooleanDefaultFalse(cardConfig.hide_windspeed_bar);
        this.centerCalmPercentage = this.checkBooleanDefaultTrue(cardConfig.center_calm_percentage);
        this.cardinalDirectionLetters = this.checkCardinalDirectionLetters();
        this.windDirectionCount = this.checkWindDirectionCount();
        this.outputSpeedUnit = this.checkOutputSpeedUnit();
        this.outputSpeedUnitLabel = this.checkOutputSpeedUnitLabel();
        this.speedRangeBeaufort = this.checkBooleanDefaultTrue(cardConfig.speed_range_beaufort);
        this.speedRangeStep = this.checkSpeedRangeStep();
        this.speedRangeMax = this.checkSpeedRangeMax();
        this.speedRanges = this.checkSpeedRanges();
        this.checkSpeedRangeCombi();
        this.matchingStrategy = this.checkMatchingStrategy();
        this.filterEntitiesQueryParameter = this.createEntitiesQueryParameter();
        this.cardColor = this.checkCardColors();
        this.logLevel = Log.checkLogLevel(this.cardConfig.log_level);
        Log.info('Config check OK');
    }
    windBarCount() {
        if (this.hideWindspeedBar) {
            return 0;
        }
        return this.windspeedEntities.length;
    }
    checkDataPeriod(oldHoursToShow, dataPeriod) {
        const oldHoursToShowCheck = this.checkHoursToShow(oldHoursToShow);
        const hoursToShowCheck = this.checkHoursToShow(dataPeriod === null || dataPeriod === void 0 ? void 0 : dataPeriod.hours_to_show);
        const fromHourOfDayCheck = this.checkFromHourOfDay(dataPeriod === null || dataPeriod === void 0 ? void 0 : dataPeriod.from_hour_of_day);
        if (oldHoursToShowCheck) {
            Log.warn('WindRoseCard: hours_to_show config is deprecated, use the data_period object.');
            return new DataPeriod(oldHoursToShow, undefined);
        }
        if (hoursToShowCheck && fromHourOfDayCheck) {
            throw new Error('WindRoseCard: Only one is allowed: hours_to_show or from_hour_of_day');
        }
        if (!hoursToShowCheck && !fromHourOfDayCheck) {
            throw new Error('WindRoseCard: One config option object data_period should be filled.');
        }
        return new DataPeriod(dataPeriod.hours_to_show, dataPeriod.from_hour_of_day);
    }
    checkHoursToShow(hoursToShow) {
        if (hoursToShow && isNaN(hoursToShow)) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number above 0.');
        }
        else if (hoursToShow) {
            return true;
        }
        return false;
    }
    checkFromHourOfDay(fromHourOfDay) {
        if (fromHourOfDay && (isNaN(fromHourOfDay) || fromHourOfDay < 0 || fromHourOfDay > 23)) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number between 0 and 23, hour of the day..');
        }
        else if (fromHourOfDay != null && fromHourOfDay >= 0) {
            return true;
        }
        return false;
    }
    checkRefreshInterval() {
        if (this.cardConfig.refresh_interval && isNaN(this.cardConfig.refresh_interval)) {
            throw new Error('WindRoseCard: Invalid refresh_interval, should be a number in seconds.');
        }
        else if (this.cardConfig.refresh_interval) {
            return this.cardConfig.refresh_interval;
        }
        return GlobalConfig.defaultRefreshInterval;
    }
    checkMaxWidth() {
        if (this.cardConfig.max_width && isNaN(this.cardConfig.max_width)) {
            throw new Error('WindRoseCard: Invalid max_width, should be a number in pixels.');
        }
        else if (this.cardConfig.max_width <= 0) {
            throw new Error('WindRoseCard: Invalid max_width, should be a positive number.');
        }
        else if (this.cardConfig.max_width) {
            return this.cardConfig.max_width;
        }
        return undefined;
    }
    checkWindDirectionEntity() {
        if (this.cardConfig.wind_direction_entity) {
            const entityConfig = this.cardConfig.wind_direction_entity;
            if (entityConfig.entity === undefined) {
                throw new Error("WindRoseCard: No wind_direction_entity.entity configured.");
            }
            const entity = entityConfig.entity;
            const useStatistics = this.checkBooleanDefaultFalse(entityConfig.use_statistics);
            const directionUnit = this.checkWindDirectionUnit(entityConfig.direction_unit);
            const directionCompensation = this.checkDirectionCompensation(entityConfig.direction_compensation);
            const directionLetters = this.checkDirectionLetters(directionUnit, entityConfig.direction_letters);
            return new WindDirectionEntity(entity, useStatistics, directionUnit, directionCompensation, directionLetters);
        }
        throw new Error("WindRoseCard: No wind_direction_entity configured.");
    }
    checkWindDirectionUnit(unit) {
        if (unit) {
            if (unit !== 'degrees'
                && unit !== 'letters') {
                throw new Error('Invalid wind direction unit configured: ' + unit +
                    '. Valid options: degrees, letters');
            }
            return unit;
        }
        return GlobalConfig.defaultWindDirectionUnit;
    }
    checkWindspeedEntities() {
        if (!this.cardConfig.windspeed_entities || this.cardConfig.windspeed_entities.length == 0) {
            throw new Error('WindRoseCard: No wind_speed_entities configured, minimal 1 needed.');
        }
        const entities = [];
        for (const entityConfig of this.cardConfig.windspeed_entities) {
            const entity = entityConfig.entity;
            const name = entityConfig.name;
            const useStatistics = this.checkBooleanDefaultFalse(entityConfig.use_statistics);
            const inputSpeedUnit = this.checkInputSpeedUnit(entityConfig.speed_unit);
            const renderRelativeScale = this.checkBooleanDefaultTrue(entityConfig.render_relative_scale);
            entities.push(new WindSpeedEntity(entity, name, useStatistics, renderRelativeScale, inputSpeedUnit));
        }
        return entities;
    }
    checkInputSpeedUnit(inputSpeedUnit) {
        if (inputSpeedUnit) {
            if (inputSpeedUnit !== 'mps'
                && inputSpeedUnit !== 'kph'
                && inputSpeedUnit !== 'mph'
                && inputSpeedUnit !== 'fps'
                && inputSpeedUnit !== 'knots'
                && inputSpeedUnit !== 'auto') {
                throw new Error('Invalid windspeed unit configured: ' + inputSpeedUnit +
                    '. Valid options: mps, fps, kph, mph, knots, auto');
            }
            return inputSpeedUnit;
        }
        return GlobalConfig.defaultInputSpeedUnit;
    }
    checkDirectionCompensation(directionCompensation) {
        if (directionCompensation && isNaN(directionCompensation)) {
            throw new Error('WindRoseCard: Invalid direction compensation, should be a number in degress between 0 and 360.');
        }
        else if (directionCompensation) {
            return directionCompensation;
        }
        return 0;
    }
    checkDirectionLetters(directionUnit, directionLetters) {
        if (directionLetters) {
            if (directionUnit === 'letters') {
                if (directionLetters && directionLetters.length === 5) {
                    return directionLetters.toUpperCase();
                }
                else {
                    throw new Error('WindRoseCard: direction_letters config should be 5 letters.');
                }
            }
            else {
                throw new Error('WindRoseCard: config direction_letters should only be use in combination with direction_unit letters.');
            }
        }
        return undefined;
    }
    checkwindRoseDrawNorthOffset() {
        if (this.cardConfig.windrose_draw_north_offset && isNaN(this.cardConfig.windrose_draw_north_offset)) {
            throw new Error('WindRoseCard: Invalid render direction offset, should be a number in degress between 0 and 360.');
        }
        else if (this.cardConfig.windrose_draw_north_offset) {
            return this.cardConfig.windrose_draw_north_offset;
        }
        return 0;
    }
    checkWindspeedBarLocation() {
        if (this.cardConfig.windspeed_bar_location) {
            if (this.cardConfig.windspeed_bar_location !== 'bottom' && this.cardConfig.windspeed_bar_location !== 'right') {
                throw new Error('Invalid windspeed bar location ' + this.cardConfig.windspeed_bar_location +
                    '. Valid options: bottom, right');
            }
            return this.cardConfig.windspeed_bar_location;
        }
        return GlobalConfig.defaultWindspeedBarLocation;
    }
    checkBooleanDefaultFalse(value) {
        if (value === undefined || value === null) {
            return false;
        }
        return value;
    }
    checkBooleanDefaultTrue(value) {
        if (value === undefined || value === null) {
            return true;
        }
        return value;
    }
    checkCardinalDirectionLetters() {
        if (this.cardConfig.cardinal_direction_letters) {
            if (this.cardConfig.cardinal_direction_letters.length !== 4) {
                throw new Error("Cardinal direction letters option should contain 4 letters.");
            }
            return this.cardConfig.cardinal_direction_letters;
        }
        return GlobalConfig.defaultCardinalDirectionLetters;
    }
    checkWindDirectionCount() {
        if (this.cardConfig.wind_direction_count) {
            if (isNaN(this.cardConfig.wind_direction_count) || this.cardConfig.wind_direction_count < 4 ||
                this.cardConfig.wind_direction_count > 32) {
                throw new Error("Wind direction count can a number between 4 and 32");
            }
            return this.cardConfig.wind_direction_count;
        }
        return GlobalConfig.defaultWindDirectionCount;
    }
    checkOutputSpeedUnit() {
        if (this.cardConfig.output_speed_unit) {
            if (this.cardConfig.output_speed_unit !== 'mps'
                && this.cardConfig.output_speed_unit !== 'kph'
                && this.cardConfig.output_speed_unit !== 'mph'
                && this.cardConfig.output_speed_unit !== 'fps'
                && this.cardConfig.output_speed_unit !== 'knots') {
                throw new Error('Invalid output windspeed unit configured: ' + this.cardConfig.output_speed_unit +
                    '. Valid options: mps, fps, kph, mph, knots');
            }
            return this.cardConfig.output_speed_unit;
        }
        return GlobalConfig.defaultOutputSpeedUnit;
    }
    checkOutputSpeedUnitLabel() {
        if (this.cardConfig.output_speed_unit_label) {
            return this.cardConfig.output_speed_unit_label;
        }
        return undefined;
    }
    checkSpeedRangeStep() {
        if (this.cardConfig.speed_range_step && isNaN(this.cardConfig.speed_range_step)) {
            throw new Error('WindRoseCard: Invalid speed_range_step, should be a positive number.');
        }
        else if (this.cardConfig.max_width <= 0) {
            throw new Error('WindRoseCard: Invalid speed_range_step, should be a positive number.');
        }
        else if (this.cardConfig.speed_range_step) {
            return this.cardConfig.speed_range_step;
        }
        return undefined;
    }
    checkSpeedRangeMax() {
        if (this.cardConfig.speed_range_max && isNaN(this.cardConfig.speed_range_max)) {
            throw new Error('WindRoseCard: Invalid speed_range_max, should be a positive number.');
        }
        else if (this.cardConfig.max_width <= 0) {
            throw new Error('WindRoseCard: Invalid speed_range_max, should be a positive number.');
        }
        else if (this.cardConfig.speed_range_max) {
            return this.cardConfig.speed_range_max;
        }
        return undefined;
    }
    checkSpeedRanges() {
        const speedRangeConfigs = [];
        if (this.cardConfig.speed_ranges && this.cardConfig.speed_ranges.length > 0) {
            const sortSpeedRanges = this.cardConfig.speed_ranges.slice();
            sortSpeedRanges.sort((a, b) => a.from_value - b.from_value);
            const lastIndex = sortSpeedRanges.length - 1;
            for (let i = 0; i < lastIndex; i++) {
                speedRangeConfigs.push(new SpeedRange(i, sortSpeedRanges[i].from_value, sortSpeedRanges[i + 1].from_value, sortSpeedRanges[i].color));
            }
            speedRangeConfigs.push(new SpeedRange(lastIndex, sortSpeedRanges[lastIndex].from_value, -1, sortSpeedRanges[lastIndex].color));
        }
        return speedRangeConfigs;
    }
    checkSpeedRangeCombi() {
        if (this.outputSpeedUnit === 'bft' && (this.speedRangeStep || this.speedRangeMax)) {
            throw new Error("WindRoseCard: speed_range_step and/or speed_range_max should not be set when using output " +
                "speed unit Beaufort (bft). Beaufort uses fixed speed ranges.");
        }
        if ((this.speedRangeStep && !this.speedRangeMax) || (!this.speedRangeStep && this.speedRangeMax)) {
            throw new Error("WindRoseCard: speed_range_step and speed_range_max should both be set.");
        }
    }
    checkMatchingStrategy() {
        if (this.cardConfig.matching_strategy) {
            if (this.cardConfig.matching_strategy !== 'direction-first' && this.cardConfig.matching_strategy !== 'speed-first') {
                throw new Error('Invalid matching stategy ' + this.cardConfig.matching_strategy +
                    '. Valid options: direction-first, speed-first');
            }
            return this.cardConfig.matching_strategy;
        }
        return GlobalConfig.defaultMatchingStategy;
    }
    checkDirectionSpeedTimeDiff() {
        if (this.cardConfig.direction_speed_time_diff || this.cardConfig.direction_speed_time_diff === 0) {
            if (isNaN(this.cardConfig.direction_speed_time_diff)) {
                throw new Error("Direction speed time difference is not a number: " +
                    this.cardConfig.direction_speed_time_diff);
            }
            return this.cardConfig.direction_speed_time_diff;
        }
        return GlobalConfig.defaultDirectionSpeedTimeDiff;
    }
    createEntitiesQueryParameter() {
        return this.windDirectionEntity + ',' + this.windspeedEntities
            .map(config => config.entity)
            .join(',');
    }
    createRawEntitiesArray() {
        const entities = [];
        if (!this.windDirectionEntity.useStatistics) {
            entities.push(this.windDirectionEntity.entity);
        }
        return entities.concat(this.windspeedEntities.filter(config => !config.useStatistics).map(config => config.entity));
    }
    createStatisticsEntitiesArray() {
        const entities = [];
        if (this.windDirectionEntity.useStatistics) {
            entities.push(this.windDirectionEntity.entity);
        }
        return entities.concat(this.windspeedEntities.filter(config => config.useStatistics).map(config => config.entity));
    }
    checkCardColors() {
        const cardColors = new CardColors();
        if (this.cardConfig.colors) {
            if (this.cardConfig.colors.rose_direction_letters) {
                cardColors.roseDirectionLetters = this.cardConfig.colors.rose_direction_letters;
            }
            if (this.cardConfig.colors.rose_lines) {
                cardColors.roseLines = this.cardConfig.colors.rose_lines;
            }
            if (this.cardConfig.colors.rose_percentages) {
                cardColors.rosePercentages = this.cardConfig.colors.rose_percentages;
            }
            if (this.cardConfig.colors.bar_border) {
                cardColors.barBorder = this.cardConfig.colors.bar_border;
            }
            if (this.cardConfig.colors.bar_name) {
                cardColors.barName = this.cardConfig.colors.bar_name;
            }
            if (this.cardConfig.colors.bar_percentages) {
                cardColors.barPercentages = this.cardConfig.colors.bar_percentages;
            }
            if (this.cardConfig.colors.bar_unit_name) {
                cardColors.barUnitName = this.cardConfig.colors.bar_unit_name;
            }
            if (this.cardConfig.colors.bar_unit_values) {
                cardColors.barUnitValues = this.cardConfig.colors.bar_unit_values;
            }
        }
        return cardColors;
    }
}

class DrawUtil {
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}

class WindRoseRendererStandaard {
    constructor(config, speedRanges) {
        this.config = config;
        this.speedRanges = speedRanges;
        this.rangeCount = this.speedRanges.length;
    }
    updateDimensions(dimensions) {
        this.dimensions = dimensions;
    }
    drawWindRose(windRoseData, canvasContext) {
        if (this.dimensions === undefined) {
            Log.error("drawWindRose(): Can't draw, dimensions not set");
            return;
        }
        if (windRoseData === undefined) {
            Log.error("drawWindRose(): Can't draw, no windrose data set.");
            return;
        }
        Log.trace('drawWindRose()', windRoseData);
        this.windRoseData = windRoseData;
        canvasContext.clearRect(0, 0, 7000, 5000);
        canvasContext.save();
        canvasContext.translate(this.dimensions.centerX, this.dimensions.centerY);
        canvasContext.rotate(DrawUtil.toRadians(this.config.windRoseDrawNorthOffset));
        this.drawBackground(canvasContext);
        this.drawWindDirections(canvasContext);
        this.drawCircleLegend(canvasContext);
        canvasContext.restore();
    }
    drawWindDirections(canvasContext) {
        for (let i = 0; i < this.windRoseData.directionPercentages.length; i++) {
            this.drawWindDirection(this.windRoseData.directionSpeedRangePercentages[i], this.windRoseData.directionPercentages[i], this.windRoseData.directionDegrees[i], canvasContext);
        }
    }
    drawWindDirection(speedRangePercentages, directionPercentage, degrees, canvasContext) {
        if (directionPercentage === 0)
            return;
        const percentages = Array(speedRangePercentages.length).fill(0);
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            percentages[i] = speedRangePercentages[i];
            if (speedRangePercentages[i] > 0) {
                for (let x = i - 1; x >= 0; x--) {
                    percentages[i] += speedRangePercentages[x];
                }
            }
        }
        const maxDirectionRadius = (directionPercentage * this.dimensions.outerRadius) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            this.drawSpeedPart(canvasContext, degrees - 90, (maxDirectionRadius * (percentages[i] / 100)), this.speedRanges[i].color);
        }
    }
    drawSpeedPart(canvasContext, degrees, radius, color) {
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.arc(0, 0, radius, DrawUtil.toRadians(degrees - (this.config.leaveArc / 2)), DrawUtil.toRadians(degrees + (this.config.leaveArc / 2)));
        canvasContext.lineTo(0, 0);
        canvasContext.stroke();
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }
    drawBackground(canvasContext) {
        // Clear
        canvasContext.clearRect(0, 0, 5000, 5000);
        // Cross
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.moveTo(0 - this.dimensions.outerRadius, 0);
        canvasContext.lineTo(this.dimensions.outerRadius, 0);
        canvasContext.stroke();
        canvasContext.moveTo(0, 0 - this.dimensions.outerRadius);
        canvasContext.lineTo(0, this.dimensions.outerRadius);
        canvasContext.stroke();
        // Cirlces
        const circleCount = this.windRoseData.circleCount;
        canvasContext.strokeStyle = this.config.roseLinesColor;
        const radiusStep = this.dimensions.outerRadius / circleCount;
        for (let i = 1; i <= circleCount; i++) {
            canvasContext.beginPath();
            canvasContext.arc(0, 0, (radiusStep * i), 0, 2 * Math.PI);
            canvasContext.stroke();
        }
        // Wind direction text
        const textCirlceSpace = 15;
        canvasContext.fillStyle = this.config.roseDirectionLettersColor;
        canvasContext.font = '22px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[0], 0, 0 - this.dimensions.outerRadius - textCirlceSpace + 2);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[2], 0, this.dimensions.outerRadius + textCirlceSpace);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[1], this.dimensions.outerRadius + textCirlceSpace, 0);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[3], 0 - this.dimensions.outerRadius - textCirlceSpace, 0);
    }
    drawCircleLegend(canvasContext) {
        canvasContext.font = "10px Arial";
        canvasContext.fillStyle = this.config.rosePercentagesColor;
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        const radiusStep = this.dimensions.outerRadius / this.windRoseData.circleCount;
        const centerXY = 0;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;
        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const xPos = centerXY + (xy * i);
            const yPos = centerXY + (xy * i);
            this.drawText(canvasContext, (this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
        }
    }
    drawText(canvasContext, text, x, y) {
        canvasContext.save();
        canvasContext.translate(x, y);
        canvasContext.rotate(DrawUtil.toRadians(-this.config.windRoseDrawNorthOffset));
        canvasContext.fillText(text, 0, 0);
        canvasContext.restore();
    }
}

class WindBarRenderer {
    constructor(config, outputSpeedUnit) {
        Log.debug('WindBarRenderer init', config, outputSpeedUnit);
        this.config = config;
        if (config.outputUnitLabel) {
            this.outputUnitName = config.outputUnitLabel;
        }
        else if (config.speedRangeBeaufort) {
            this.outputUnitName = 'Beaufort';
        }
        else {
            this.outputUnitName = outputSpeedUnit.name;
        }
        this.speedRanges = outputSpeedUnit.speedRanges;
    }
    updateDimensions(dimensions) {
        this.dimensions = dimensions;
        Log.debug('WindBarRenderer.updateDimensions()', this.dimensions);
    }
    drawWindBar(windBarData, canvasContext) {
        if (this.dimensions === undefined) {
            Log.error("drawWindBar(): Can't draw bar, dimensions not set.");
            return;
        }
        if (windBarData === undefined) {
            Log.error("drawWindBar(): Can't draw bar, windRoseData not set.");
            return;
        }
        Log.trace('drawWindBar(): ', windBarData, this.dimensions);
        if (this.config.orientation === 'horizontal') {
            this.drawBarLegendHorizontal(windBarData.speedRangePercentages, canvasContext);
        }
        else if (this.config.orientation === 'vertical') {
            this.drawBarLegendVertical(windBarData.speedRangePercentages, canvasContext);
        }
    }
    drawBarLegendVertical(speedRangePercentages, canvasContext) {
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }
        const lengthMaxRange = (this.dimensions.length / highestRangeMeasured);
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;
        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.save();
        canvasContext.translate(this.dimensions.posX, this.dimensions.posY);
        canvasContext.rotate(DrawUtil.toRadians(-90));
        canvasContext.fillText(this.config.label, 0, 0);
        canvasContext.restore();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        let posY = this.dimensions.posY;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (!this.config.renderRelativeScale || i === highestRangeMeasured - 1) {
                length = lengthMaxRange * -1;
            }
            else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensions.length - lengthMaxRange) / maxScale) * -1;
            }
            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(this.dimensions.posX, posY, this.dimensions.height, length);
            canvasContext.fill();
            canvasContext.textAlign = 'left';
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            if (this.config.speedRangeBeaufort === true) {
                if (i == 12) {
                    canvasContext.fillText(i + '', this.dimensions.posX + this.dimensions.height + 5, posY - 6);
                }
                else {
                    canvasContext.fillText(i + '', this.dimensions.posX + this.dimensions.height + 5, posY + (length / 2));
                }
            }
            else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', this.dimensions.posX + this.dimensions.height + 5, posY);
            }
            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, this.dimensions.posX + (this.dimensions.height / 2), posY + (length / 2));
            }
            canvasContext.stroke();
            posY += length;
        }
        if (!this.config.speedRangeBeaufort && !this.config.full && highestRangeMeasured < speedRangePercentages.length) {
            canvasContext.textAlign = 'left';
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            canvasContext.fillText(this.speedRanges[highestRangeMeasured].minSpeed + '', this.dimensions.posX + this.dimensions.height + 5, posY);
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.dimensions.posX, this.dimensions.posY, this.dimensions.height, this.dimensions.length * -1);
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.dimensions.posX + (this.dimensions.height / 2), this.dimensions.posY - this.dimensions.length - 2);
        canvasContext.fill();
    }
    drawBarLegendHorizontal(speedRangePercentages, canvasContext) {
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }
        const lengthMaxRange = (this.dimensions.length / highestRangeMeasured);
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;
        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.lineWidth = 1;
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.fillText(this.config.label, this.dimensions.posX, this.dimensions.posY);
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'top';
        let posX = this.dimensions.posX;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (!this.config.renderRelativeScale || i === highestRangeMeasured - 1) {
                length = lengthMaxRange;
            }
            else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensions.length - lengthMaxRange) / maxScale);
            }
            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(posX, this.dimensions.posY, length, this.dimensions.height);
            canvasContext.fill();
            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            if (this.config.speedRangeBeaufort === true) {
                canvasContext.fillText(i + '', posX + (length / 2), this.dimensions.posY + this.dimensions.height + 2);
            }
            else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', posX, this.dimensions.posY + this.dimensions.height + 2);
            }
            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, posX + (length / 2), this.dimensions.posY + 2);
            }
            canvasContext.stroke();
            posX += length;
        }
        if (!this.config.speedRangeBeaufort && !this.config.full && highestRangeMeasured < speedRangePercentages.length) {
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            canvasContext.fillText(this.speedRanges[highestRangeMeasured].minSpeed + '', posX, this.dimensions.posY + this.dimensions.height + 2);
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.dimensions.posX, this.dimensions.posY, this.dimensions.length, this.dimensions.height);
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.textAlign = 'right';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.dimensions.posX + this.dimensions.length, this.dimensions.posY);
        canvasContext.fill();
    }
    getIndexHighestRangeWithMeasurements(speedRangePercentages) {
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            if (speedRangePercentages[i] > 0) {
                return i + 1;
            }
        }
        return speedRangePercentages.length;
    }
}

class WindRoseData {
    constructor(speedRangePercentages, directionSpeedRangePercentages, directionPercentages, directionDegrees, circleCount, percentagePerCircle, maxCirclePercentage) {
        this.speedRangePercentages = speedRangePercentages;
        this.directionSpeedRangePercentages = directionSpeedRangePercentages;
        this.directionPercentages = directionPercentages;
        this.directionDegrees = directionDegrees;
        this.circleCount = circleCount;
        this.percentagePerCircle = percentagePerCircle;
        this.maxCirclePercentage = maxCirclePercentage;
    }
}

class PercentageCalculator {
    calculate(windCounts) {
        const maxDirectionTotal = Math.max(...windCounts.directionTotals);
        Log.trace("Max direction total:", maxDirectionTotal);
        const speedRangePercentages = this.calculateSpeedRangePercentages(windCounts.speedRangeCounts, windCounts.total);
        Log.trace("Speed range percentages:", speedRangePercentages);
        const directionSpeedRangePercentages = this.calculateDirectionSpeedRangePercentages(windCounts.directionSpeedRangeCounts, windCounts.directionTotals);
        Log.trace("Direction speed range percentages:", directionSpeedRangePercentages);
        const directionPercentages = this.calculateDirectionPercentages(windCounts.directionTotals, windCounts.total);
        Log.trace("Direction percentages:", directionPercentages);
        const directionDegrees = windCounts.speedRangeDegrees;
        Log.trace("Direction degrees:", directionDegrees);
        const circleData = this.calculateCirclePercentages(maxDirectionTotal, windCounts.total);
        Log.trace("Number of circles:", circleData[0]);
        Log.trace("Percentage per circle:", circleData[1]);
        Log.trace("Max circle percentage:", circleData[2]);
        return new WindRoseData(speedRangePercentages, directionSpeedRangePercentages, directionPercentages, directionDegrees, circleData[0], circleData[1], circleData[2]);
    }
    calculateSpeedRangePercentages(speedRangeCounts, total) {
        const onePercent = total / 100;
        const speedRangePercentages = [];
        for (const speedRangeCount of speedRangeCounts) {
            speedRangePercentages.push(speedRangeCount / onePercent);
        }
        return speedRangePercentages;
    }
    calculateDirectionSpeedRangePercentages(directionSpeedRangeCounts, directionTotals) {
        const directionSpeedRangePercentages = [];
        for (let index = 0; index < directionTotals.length; index++) {
            const speedRangePercentages = [];
            const onePerc = directionTotals[index] / 100;
            for (const speedRangeCount of directionSpeedRangeCounts[index]) {
                if (onePerc === 0) {
                    speedRangePercentages.push(0);
                }
                else {
                    speedRangePercentages.push(speedRangeCount / onePerc);
                }
            }
            directionSpeedRangePercentages.push(speedRangePercentages);
        }
        return directionSpeedRangePercentages;
    }
    calculateDirectionPercentages(directionTotals, total) {
        const onePercTotal = total / 100;
        const directionPercentages = [];
        for (const directionTotal of directionTotals) {
            directionPercentages.push(directionTotal / onePercTotal);
        }
        return directionPercentages;
    }
    calculateCirclePercentages(maxDirectionTotal, total) {
        const maxRosePercentage = maxDirectionTotal / (total / 100);
        let percentagePerCircle = 0;
        let numberOfCircles = 0;
        if (maxRosePercentage <= 30) {
            percentagePerCircle = Math.ceil(maxRosePercentage / 6);
            numberOfCircles = Math.ceil(maxRosePercentage / percentagePerCircle);
        }
        else {
            percentagePerCircle = Math.ceil(maxRosePercentage / 5);
            numberOfCircles = 5;
        }
        return [numberOfCircles, percentagePerCircle, numberOfCircles * percentagePerCircle];
    }
}

class ColorUtil {
    getColorArray(count) {
        const startHue = 240;
        const endHue = 0;
        const saturation = 100;
        const lightness = 60;
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (startHue - (((startHue - endHue) / (count - 1)) * i));
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    }
}

class SpeedUnit {
    constructor(name, configs, toMpsFunc, fromMpsFunc, speedRangeStep, speedRangeMax) {
        this.name = name;
        this.configs = configs;
        this.toMpsFunc = toMpsFunc;
        this.fromMpsFunc = fromMpsFunc;
        this.speedRangeStep = speedRangeStep;
        this.speedRangeMax = speedRangeMax;
        this.speedRanges = [];
    }
}

class WindSpeedConverter {
    constructor(outputUnit, rangeBeaufort, rangeStep, rangeMax, speedRanges) {
        this.outputUnit = outputUnit;
        this.rangeBeaufort = rangeBeaufort;
        this.rangeStep = rangeStep;
        this.rangeMax = rangeMax;
        this.speedRanges = speedRanges;
        this.bft = new SpeedUnit('Beaufort', ['bft'], (speed) => speed, (speed) => speed, undefined, undefined);
        this.mps = new SpeedUnit('m/s', ['mps', 'm/s'], (speed) => speed, (speed) => speed, 5, 30);
        this.kph = new SpeedUnit('km/h', ['kph', 'km/h'], (speed) => speed / 3.6, (speed) => speed * 3.6, 10, 100);
        this.mph = new SpeedUnit('m/h', ['mph', 'm/h'], (speed) => speed / 2.2369, (speed) => speed * 2.2369, 10, 70);
        this.fps = new SpeedUnit('ft/s', ['fps', 'ft/s'], (speed) => speed / 3.2808399, (speed) => speed * 3.2808399, 10, 100);
        this.knots = new SpeedUnit('knots', ['knots', 'kts', 'knts', 'kn'], (speed) => speed / 1.9438444924406, (speed) => speed * 1.9438444924406, 5, 60);
        this.units = [this.bft, this.mps, this.kph, this.mph, this.fps, this.knots];
        this.outputSpeedUnit = this.getSpeedUnit(this.outputUnit);
        if (rangeBeaufort === true) {
            this.outputSpeedUnit.speedRanges = this.generateBeaufortSpeedRanges(outputUnit);
        }
        else if (speedRanges && speedRanges.length > 0) {
            this.outputSpeedUnit.speedRanges = speedRanges;
        }
        else if (rangeStep && rangeMax) {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(rangeStep, rangeMax);
        }
        else {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(this.outputSpeedUnit.speedRangeStep, this.outputSpeedUnit.speedRangeMax);
        }
        Log.trace('Speed ranges: ', this.outputSpeedUnit.speedRanges);
    }
    getOutputSpeedUnit() {
        return this.outputSpeedUnit;
    }
    getSpeedConverter(inputUnit) {
        if (inputUnit === this.outputUnit) {
            return (inputSpeed) => inputSpeed;
        }
        else if (inputUnit === 'mps') {
            return this.outputSpeedUnit.fromMpsFunc;
        }
        const inputSpeedUnit = this.getSpeedUnit(inputUnit);
        const toMpsFunction = inputSpeedUnit.toMpsFunc;
        const fromMpsFunction = this.outputSpeedUnit.fromMpsFunc;
        return (speed) => fromMpsFunction(toMpsFunction(speed));
    }
    getRangeFunction() {
        return (speed) => {
            const speedRange = this.outputSpeedUnit.speedRanges.find((speedRange) => speedRange.isRangeMatch(speed));
            if (speedRange) {
                return speedRange.range;
            }
            throw new Error("Speed is not in a speedrange: " + speed + " unit: " + this.outputUnit);
        };
    }
    getSpeedRanges() {
        return this.outputSpeedUnit.speedRanges;
    }
    getSpeedUnit(unit) {
        const speedUnit = this.units.find(speedUnit => speedUnit.configs.includes(unit));
        if (speedUnit === undefined) {
            throw new Error("Unknown speed unit: " + unit);
        }
        else {
            Log.debug(`Matched speedunit ${speedUnit.name}`);
        }
        return speedUnit;
    }
    generateSpeedRanges(step, max) {
        const colors = new ColorUtil().getColorArray(Math.floor(max / step) + 1);
        const speedRanges = [];
        let currentSpeed = 0;
        let range = 0;
        while (currentSpeed <= max - step) {
            speedRanges.push(new SpeedRange(range, currentSpeed, currentSpeed + step, colors[range]));
            range++;
            currentSpeed += step;
        }
        speedRanges.push(new SpeedRange(range, currentSpeed, -1, colors[range]));
        return speedRanges;
    }
    generateBeaufortSpeedRanges(beaufortType) {
        const colors = new ColorUtil().getColorArray(13);
        if (beaufortType === undefined || beaufortType === 'mps') {
            return [
                new SpeedRange(0, 0, 0.5, colors[0]),
                new SpeedRange(1, 0.5, 1.6, colors[1]),
                new SpeedRange(2, 1.6, 3.4, colors[2]),
                new SpeedRange(3, 3.4, 5.5, colors[3]),
                new SpeedRange(4, 5.5, 8, colors[4]),
                new SpeedRange(5, 8, 10.8, colors[5]),
                new SpeedRange(6, 10.8, 13.9, colors[6]),
                new SpeedRange(7, 13.9, 17.2, colors[7]),
                new SpeedRange(8, 17.2, 20.8, colors[8]),
                new SpeedRange(9, 20.8, 24.5, colors[9]),
                new SpeedRange(10, 24.5, 28.5, colors[10]),
                new SpeedRange(11, 28.5, 32.7, colors[11]),
                new SpeedRange(12, 32.7, -1, colors[12])
            ];
        }
        else if (beaufortType === 'kph') {
            return [
                new SpeedRange(0, 0, 2, colors[0]),
                new SpeedRange(1, 2, 6, colors[1]),
                new SpeedRange(2, 6, 12, colors[2]),
                new SpeedRange(3, 12, 20, colors[3]),
                new SpeedRange(4, 20, 29, colors[4]),
                new SpeedRange(5, 29, 39, colors[5]),
                new SpeedRange(6, 39, 50, colors[6]),
                new SpeedRange(7, 50, 62, colors[7]),
                new SpeedRange(8, 62, 75, colors[8]),
                new SpeedRange(9, 75, 89, colors[9]),
                new SpeedRange(10, 89, 103, colors[10]),
                new SpeedRange(11, 103, 118, colors[11]),
                new SpeedRange(12, 118, -1, colors[12])
            ];
        }
        else if (beaufortType === 'mph') {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 8, colors[2]),
                new SpeedRange(3, 8, 13, colors[3]),
                new SpeedRange(4, 13, 19, colors[4]),
                new SpeedRange(5, 19, 25, colors[5]),
                new SpeedRange(6, 25, 32, colors[6]),
                new SpeedRange(7, 32, 39, colors[7]),
                new SpeedRange(8, 39, 47, colors[8]),
                new SpeedRange(9, 47, 55, colors[9]),
                new SpeedRange(10, 55, 64, colors[10]),
                new SpeedRange(11, 64, 73, colors[11]),
                new SpeedRange(12, 73, -1, colors[12])
            ];
        }
        else if (beaufortType === 'fps') {
            return [
                new SpeedRange(0, 0, 1.6, colors[0]),
                new SpeedRange(1, 1.6, 5.2, colors[1]),
                new SpeedRange(2, 5.2, 11.2, colors[2]),
                new SpeedRange(3, 11.2, 18, colors[3]),
                new SpeedRange(4, 18, 26.2, colors[4]),
                new SpeedRange(5, 26.2, 35.4, colors[5]),
                new SpeedRange(6, 35.4, 45.6, colors[6]),
                new SpeedRange(7, 45.6, 56.4, colors[7]),
                new SpeedRange(8, 56.4, 68.2, colors[8]),
                new SpeedRange(9, 68.2, 80.4, colors[9]),
                new SpeedRange(10, 80.4, 93.5, colors[10]),
                new SpeedRange(11, 93.5, 107, colors[11]),
                new SpeedRange(12, 107, -1, colors[12])
            ];
        }
        else if (beaufortType === 'knots') {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 7, colors[2]),
                new SpeedRange(3, 7, 11, colors[3]),
                new SpeedRange(4, 11, 17, colors[4]),
                new SpeedRange(5, 17, 22, colors[5]),
                new SpeedRange(6, 22, 28, colors[6]),
                new SpeedRange(7, 28, 34, colors[7]),
                new SpeedRange(8, 34, 41, colors[8]),
                new SpeedRange(9, 41, 48, colors[9]),
                new SpeedRange(10, 48, 56, colors[10]),
                new SpeedRange(11, 56, 64, colors[11]),
                new SpeedRange(12, 64, -1, colors[12])
            ];
        }
        throw new Error("No Bft reanges for type: " + beaufortType);
    }
}

class WindRoseConfig {
    constructor(centerRadius, windDirectionCount, windDirectionUnit, windDirectionLetters, leaveArc, cardinalDirectionLetters, directionCompensation, windRoseDrawNorthOffset, roseLinesColor, roseDirectionLettersColor, rosePercentagesColor) {
        this.centerRadius = centerRadius;
        this.windDirectionCount = windDirectionCount;
        this.windDirectionUnit = windDirectionUnit;
        this.windDirectionLetters = windDirectionLetters;
        this.leaveArc = leaveArc;
        this.cardinalDirectionLetters = cardinalDirectionLetters;
        this.directionCompensation = directionCompensation;
        this.windRoseDrawNorthOffset = windRoseDrawNorthOffset;
        this.roseLinesColor = roseLinesColor;
        this.roseDirectionLettersColor = roseDirectionLettersColor;
        this.rosePercentagesColor = rosePercentagesColor;
    }
}

class WindBarConfig {
    constructor(label, orientation, full, renderRelativeScale, outputUnitLabel, speedRangeBeaufort, barBorderColor, barUnitNameColor, barNameColor, barUnitValuesColor, barPercentagesColor) {
        this.label = label;
        this.orientation = orientation;
        this.full = full;
        this.renderRelativeScale = renderRelativeScale;
        this.outputUnitLabel = outputUnitLabel;
        this.speedRangeBeaufort = speedRangeBeaufort;
        this.barBorderColor = barBorderColor;
        this.barUnitNameColor = barUnitNameColor;
        this.barNameColor = barNameColor;
        this.barUnitValuesColor = barUnitValuesColor;
        this.barPercentagesColor = barPercentagesColor;
    }
}

class WindRoseConfigFactory {
    constructor(cardConfig) {
        this.cardConfig = cardConfig;
    }
    createWindRoseConfig() {
        return new WindRoseConfig(25, this.cardConfig.windDirectionCount, this.cardConfig.windDirectionEntity.directionUnit, this.cardConfig.windDirectionEntity.directionLetters, (360 / this.cardConfig.windDirectionCount) - 8, this.cardConfig.cardinalDirectionLetters, this.cardConfig.windDirectionEntity.directionCompensation, this.cardConfig.windRoseDrawNorthOffset, this.cardConfig.cardColor.roseLines, this.cardConfig.cardColor.roseDirectionLetters, this.cardConfig.cardColor.rosePercentages);
    }
    createWindBarConfigs() {
        const windBarConfigs = [];
        for (let i = 0; i < this.cardConfig.windspeedEntities.length; i++) {
            const entity = this.cardConfig.windspeedEntities[i];
            let windBarConfig;
            if (this.cardConfig.windspeedBarLocation === 'bottom') {
                windBarConfig = new WindBarConfig(entity.name, 'horizontal', this.cardConfig.windspeedBarFull, entity.renderRelativeScale, this.cardConfig.outputSpeedUnitLabel, this.cardConfig.speedRangeBeaufort, this.cardConfig.cardColor.barBorder, this.cardConfig.cardColor.barUnitName, this.cardConfig.cardColor.barName, this.cardConfig.cardColor.barUnitValues, this.cardConfig.cardColor.barPercentages);
            }
            else if (this.cardConfig.windspeedBarLocation === 'right') {
                windBarConfig = new WindBarConfig(entity.name, 'vertical', this.cardConfig.windspeedBarFull, entity.renderRelativeScale, this.cardConfig.outputSpeedUnitLabel, this.cardConfig.speedRangeBeaufort, this.cardConfig.cardColor.barBorder, this.cardConfig.cardColor.barUnitName, this.cardConfig.cardColor.barName, this.cardConfig.cardColor.barUnitValues, this.cardConfig.cardColor.barPercentages);
            }
            else {
                throw Error('Unknown windspeed bar location: ' + this.cardConfig.windspeedBarLocation);
            }
            windBarConfigs.push(windBarConfig);
        }
        return windBarConfigs;
    }
}

class WindRoseDimensions {
    constructor(centerX, centerY, offsetWidth, outerRadius, canvasHeight) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.offsetWidth = offsetWidth;
        this.outerRadius = outerRadius;
        this.canvasHeight = canvasHeight;
    }
}

class WindBarDimensions {
    constructor(posX, posY, height, length) {
        this.posX = posX;
        this.posY = posY;
        this.height = height;
        this.length = length;
    }
}

class DimensionsCalculator {
    calculateWindRoseDimensions(canvasWidth, maxWidth, windBarCount, windspeedBarLocation) {
        let offsetWidth = 0;
        let roseWidth = canvasWidth;
        if (maxWidth && canvasWidth > maxWidth) {
            roseWidth = maxWidth;
            offsetWidth = (canvasWidth - roseWidth) / 2;
        }
        if (windspeedBarLocation == 'right') {
            roseWidth = roseWidth - ((60 + 12) * windBarCount);
            offsetWidth = (canvasWidth - roseWidth - ((60 + 12) * windBarCount)) / 2;
        }
        let outerRadius = (roseWidth / 2) - 35;
        let roseCenterX = offsetWidth + (roseWidth / 2);
        let roseCenterY = outerRadius + 25;
        let canvasHeight = 0;
        if (windspeedBarLocation === 'right') {
            canvasHeight = roseCenterY + outerRadius + 25;
        }
        else if (windspeedBarLocation === 'bottom') {
            canvasHeight = roseCenterY + outerRadius + (40 * windBarCount) + 35;
        }
        else {
            Log.error('Unknown windspeed bar location', windspeedBarLocation);
        }
        return new WindRoseDimensions(roseCenterX, roseCenterY, offsetWidth, outerRadius, canvasHeight);
    }
    calculatorWindBarDimensions(dimensions, barLocation, index) {
        if (barLocation === 'bottom') {
            return new WindBarDimensions(dimensions.offsetWidth + 5, dimensions.centerY + dimensions.outerRadius + 30 + ((GlobalConfig.horizontalBarHeight + 40) * index), GlobalConfig.horizontalBarHeight, ((dimensions.outerRadius + 30) * 2));
        }
        if (barLocation === 'right') {
            return new WindBarDimensions(dimensions.centerX + dimensions.outerRadius + 35 + ((GlobalConfig.verticalBarHeight + 60) * index), dimensions.centerY + dimensions.outerRadius + 20, GlobalConfig.verticalBarHeight, dimensions.outerRadius * 2 + 24);
        }
        throw Error('Unknown windspeed bar location: ' + barLocation);
    }
}

class WindDirectionConverter {
    constructor(windDirectionLetters) {
        this.windDirectionLetters = windDirectionLetters;
        this.defaultLetters = ['N', 'E', 'S', 'W'];
        this.directions = {
            N: 0,
            NXE: 11.25,
            NNE: 22.5,
            NEXN: 33.75,
            NE: 45,
            NEXE: 56.25,
            ENE: 67.5,
            EXN: 78.75,
            E: 90,
            EXS: 101.25,
            ESE: 112.50,
            SEXE: 123.75,
            SE: 135,
            SEXS: 146.25,
            SSE: 157.50,
            SXE: 168.75,
            S: 180,
            SXW: 191.25,
            SSW: 202.5,
            SWXS: 213.75,
            SW: 225,
            SWXW: 236.25,
            WSW: 247.5,
            WXS: 258.75,
            W: 270,
            WXN: 281.25,
            WNW: 292.50,
            NWXW: 303.75,
            NW: 315,
            NWXN: 326.25,
            NNW: 337.5,
            NXW: 348.5,
            CALM: 0
        };
    }
    getDirection(direction) {
        let convertedDirection = direction.toUpperCase();
        if (this.windDirectionLetters) {
            convertedDirection = this.convertDirectionLetters(direction);
        }
        return this.directions[convertedDirection];
    }
    convertDirectionLetters(direction) {
        let convertedDirection = '';
        for (let i = 0; i < direction.length; i++) {
            const index = this.windDirectionLetters.indexOf(direction[i]);
            if (index < 0) {
                Log.info('Could not translate cardinal direction, letters not found in config wind_direction_entity.direction_letters');
            }
            convertedDirection += this.defaultLetters[index];
        }
        return convertedDirection;
    }
}

class WindCounts {
    constructor() {
        this.total = 0;
        this.speedRangeDegrees = [];
        this.speedRangeCounts = [];
        this.directionTotals = [];
        this.directionSpeedRangeCounts = [];
    }
    init(speedRangeCount, directionCount) {
        this.total = 0;
        this.speedRangeCounts = new Array(speedRangeCount).fill(0);
        this.directionTotals = new Array(directionCount).fill(0);
        this.directionSpeedRangeCounts = new Array(directionCount).fill([]);
        for (let i = 0; i < this.directionSpeedRangeCounts.length; i++) {
            this.directionSpeedRangeCounts[i] = new Array(speedRangeCount).fill(0);
        }
    }
    add(windDirectionIndex, speedRangeIndex) {
        this.total++;
        this.speedRangeCounts[speedRangeIndex]++;
        this.directionTotals[windDirectionIndex]++;
        this.directionSpeedRangeCounts[windDirectionIndex][speedRangeIndex]++;
    }
}

class WindDirection {
    constructor(minDegrees, maxDegrees) {
        this.minDegrees = minDegrees;
        this.maxDegrees = maxDegrees;
    }
    checkDirection(direction) {
        if (this.minDegrees < 0) {
            return (direction - 360) > this.minDegrees || direction <= this.maxDegrees;
        }
        return direction > this.minDegrees && direction <= this.maxDegrees;
    }
}

class MeasurementCounter {
    constructor(config, windSpeedConverter) {
        this.windDirections = [];
        this.windData = new WindCounts();
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.windDirectionConverter = new WindDirectionConverter(config.windDirectionLetters);
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction();
        const leaveDegrees = 360 / config.windDirectionCount;
        for (let i = 0; i < config.windDirectionCount; i++) {
            const degrees = (i * leaveDegrees);
            const minDegrees = degrees - (leaveDegrees / 2);
            const maxDegrees = degrees + (leaveDegrees / 2);
            this.windDirections.push(new WindDirection(minDegrees, maxDegrees));
            this.windData.speedRangeDegrees.push(degrees);
        }
    }
    init(inputSpeedUnit) {
        this.windData.init(this.windSpeedConverter.getSpeedRanges().length, this.config.windDirectionCount);
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter(inputSpeedUnit);
    }
    getMeasurementCounts() {
        Log.debug('Wind counts: ', this.windData);
        return this.windData;
    }
    addWindMeasurements(direction, speed) {
        const convertedSpeed = this.speedConverterFunction(speed);
        const speedRangeIndex = this.speedRangeFunction(convertedSpeed);
        const convertedDirection = this.convertDirection(direction);
        if (convertedDirection === undefined) {
            return;
        }
        const compensatedDirection = this.compensateDirection(convertedDirection);
        const windDirectionIndex = this.windDirections.findIndex(windDirection => windDirection.checkDirection(compensatedDirection));
        Log.trace("Wind measurement: ", direction, speed, windDirectionIndex, speedRangeIndex);
        this.windData.add(windDirectionIndex, speedRangeIndex);
    }
    convertDirection(direction) {
        let degrees = 0;
        if (this.config.windDirectionUnit === 'letters') {
            degrees = this.windDirectionConverter.getDirection(direction);
            if (isNaN(degrees)) {
                Log.info("Could not convert direction " + direction + " to degrees.");
                return undefined;
            }
        }
        else {
            if (isNaN(direction)) {
                Log.info("Direction " + direction + " is not a number.");
                return undefined;
            }
            degrees = direction;
        }
        return degrees;
    }
    compensateDirection(degrees) {
        let compensatedDegrees = degrees;
        if (this.config.directionCompensation !== 0) {
            compensatedDegrees = +compensatedDegrees + this.config.directionCompensation;
            if (compensatedDegrees < 0) {
                compensatedDegrees = 360 + compensatedDegrees;
            }
            else if (compensatedDegrees >= 360) {
                compensatedDegrees = compensatedDegrees - 360;
            }
        }
        return compensatedDegrees;
    }
}

class WindRoseRendererCenterCalm {
    constructor(config, speedRanges) {
        this.config = config;
        this.speedRanges = speedRanges;
        this.rangeCount = this.speedRanges.length;
    }
    updateDimensions(dimensions) {
        this.dimensions = dimensions;
    }
    drawWindRose(windRoseData, canvasContext) {
        if (this.dimensions === undefined) {
            Log.error("drawWindRose(): Can't draw, dimensions not set");
            return;
        }
        if (windRoseData === undefined) {
            Log.error("drawWindRose(): Can't draw, no windrose data.");
            return;
        }
        Log.trace('drawWindRose()', windRoseData);
        this.windRoseData = windRoseData;
        canvasContext.clearRect(0, 0, 7000, 5000);
        canvasContext.save();
        canvasContext.translate(this.dimensions.centerX, this.dimensions.centerY);
        canvasContext.rotate(DrawUtil.toRadians(this.config.windRoseDrawNorthOffset));
        this.drawBackground(canvasContext);
        this.drawWindDirections(canvasContext);
        this.drawCircleLegend(canvasContext);
        this.drawCenterZeroSpeed(canvasContext);
        canvasContext.restore();
    }
    drawWindDirections(canvasContext) {
        for (let i = 0; i < this.windRoseData.directionPercentages.length; i++) {
            this.drawWindDirection(this.windRoseData.directionSpeedRangePercentages[i], this.windRoseData.directionPercentages[i], this.windRoseData.directionDegrees[i], canvasContext);
        }
    }
    drawWindDirection(speedRangePercentages, directionPercentage, degrees, canvasContext) {
        if (directionPercentage === 0)
            return;
        const percentages = Array(speedRangePercentages.length).fill(0);
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            percentages[i] = speedRangePercentages[i];
            if (speedRangePercentages[i] > 0) {
                for (let x = i - 1; x >= 0; x--) {
                    percentages[i] += speedRangePercentages[x];
                }
            }
        }
        const maxDirectionRadius = (directionPercentage * (this.dimensions.outerRadius - this.config.centerRadius)) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            this.drawSpeedPart(canvasContext, degrees - 90, (maxDirectionRadius * (percentages[i] / 100)) + this.config.centerRadius, this.speedRanges[i].color);
        }
    }
    drawSpeedPart(canvasContext, degrees, radius, color) {
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.arc(0, 0, radius, DrawUtil.toRadians(degrees - (this.config.leaveArc / 2)), DrawUtil.toRadians(degrees + (this.config.leaveArc / 2)));
        canvasContext.lineTo(0, 0);
        canvasContext.stroke();
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }
    drawBackground(canvasContext) {
        // Clear
        canvasContext.clearRect(0, 0, 5000, 5000);
        // Cross
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.moveTo(0 - this.dimensions.outerRadius, 0);
        canvasContext.lineTo(this.dimensions.outerRadius, 0);
        canvasContext.stroke();
        canvasContext.moveTo(0, 0 - this.dimensions.outerRadius);
        canvasContext.lineTo(0, this.dimensions.outerRadius);
        canvasContext.stroke();
        // Cirlces
        const circleCount = this.windRoseData.circleCount;
        canvasContext.strokeStyle = this.config.roseLinesColor;
        const radiusStep = (this.dimensions.outerRadius - this.config.centerRadius) / circleCount;
        let circleRadius = this.config.centerRadius + radiusStep;
        for (let i = 1; i <= circleCount; i++) {
            canvasContext.beginPath();
            canvasContext.arc(0, 0, circleRadius, 0, 2 * Math.PI);
            canvasContext.stroke();
            circleRadius += radiusStep;
        }
        // Wind direction text
        const textCirlceSpace = 15;
        canvasContext.fillStyle = this.config.roseDirectionLettersColor;
        canvasContext.font = '22px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[0], 0, 0 - this.dimensions.outerRadius - textCirlceSpace + 2);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[2], 0, this.dimensions.outerRadius + textCirlceSpace);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[1], this.dimensions.outerRadius + textCirlceSpace, 0);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[3], 0 - this.dimensions.outerRadius - textCirlceSpace, 0);
    }
    drawCircleLegend(canvasContext) {
        canvasContext.font = "10px Arial";
        canvasContext.fillStyle = this.config.rosePercentagesColor;
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        const radiusStep = (this.dimensions.outerRadius - this.config.centerRadius) / this.windRoseData.circleCount;
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.config.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;
        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const xPos = centerXY + (xy * i);
            const yPos = centerXY + (xy * i);
            this.drawText(canvasContext, (this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
        }
    }
    drawCenterZeroSpeed(canvasContext) {
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.arc(0, 0, this.config.centerRadius, 0, 2 * Math.PI);
        canvasContext.stroke();
        canvasContext.fillStyle = this.speedRanges[0].color;
        canvasContext.fill();
        canvasContext.font = '12px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.strokeStyle = this.config.rosePercentagesColor;
        canvasContext.fillStyle = this.config.rosePercentagesColor;
        this.drawText(canvasContext, Math.round(this.windRoseData.speedRangePercentages[0]) + '%', 0, 0);
    }
    drawText(canvasContext, text, x, y) {
        canvasContext.save();
        canvasContext.translate(x, y);
        canvasContext.rotate(DrawUtil.toRadians(-this.config.windRoseDrawNorthOffset));
        canvasContext.fillText(text, 0, 0);
        canvasContext.restore();
    }
}

class PercentageCalculatorCenterCalm extends PercentageCalculator {
    calculate(windCounts) {
        for (let i = 0; i < windCounts.directionTotals.length; i++) {
            windCounts.directionSpeedRangeCounts[i][0] = 0;
            const directionTotal = windCounts.directionSpeedRangeCounts[i].reduce((sum, current) => sum + current, 0);
            windCounts.directionTotals[i] = directionTotal;
        }
        return super.calculate(windCounts);
    }
}

class WindRoseDirigent {
    constructor() {
        this.windBarRenderers = [];
        //Calculated data
        this.windRoseData = [];
        this.initReady = false;
        this.dimensionsReady = false;
        this.measurementsReady = false;
    }
    init(cardConfig, measurementProvider) {
        this.initReady = true;
        this.dimensionsReady = false;
        this.measurementsReady = false;
        this.cardConfig = cardConfig;
        this.measurementProvider = measurementProvider;
        this.configFactory = new WindRoseConfigFactory(cardConfig);
        const windRoseConfig = this.configFactory.createWindRoseConfig();
        this.windSpeedConverter = new WindSpeedConverter(cardConfig.outputSpeedUnit, cardConfig.speedRangeBeaufort, cardConfig.speedRangeStep, cardConfig.speedRangeMax, cardConfig.speedRanges);
        this.measurementCounter = new MeasurementCounter(windRoseConfig, this.windSpeedConverter);
        this.dimensionCalculator = new DimensionsCalculator();
        if (this.cardConfig.centerCalmPercentage) {
            this.percentageCalculator = new PercentageCalculatorCenterCalm();
            this.windRoseRenderer = new WindRoseRendererCenterCalm(windRoseConfig, this.windSpeedConverter.getSpeedRanges());
        }
        else {
            this.percentageCalculator = new PercentageCalculator();
            this.windRoseRenderer = new WindRoseRendererStandaard(windRoseConfig, this.windSpeedConverter.getSpeedRanges());
        }
        this.windBarRenderers = [];
        if (!cardConfig.hideWindspeedBar) {
            const barConfigs = this.configFactory.createWindBarConfigs();
            for (let i = 0; i < cardConfig.windBarCount(); i++) {
                this.windBarRenderers.push(new WindBarRenderer(barConfigs[i], this.windSpeedConverter.getOutputSpeedUnit()));
            }
        }
        this.windRoseData = [];
    }
    resize(width) {
        if (this.initReady) {
            Log.debug('resize()', width);
            const roseDimensions = this.dimensionCalculator.calculateWindRoseDimensions(width, this.cardConfig.maxWidth, this.cardConfig.windBarCount(), this.cardConfig.windspeedBarLocation);
            this.windRoseRenderer.updateDimensions(roseDimensions);
            for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
                this.windBarRenderers[i].updateDimensions(this.dimensionCalculator.calculatorWindBarDimensions(roseDimensions, this.cardConfig.windspeedBarLocation, i));
            }
            this.dimensionsReady = true;
            return roseDimensions.canvasHeight;
        }
        else {
            Log.debug('resize() ignored, not inited yet');
        }
        return 400;
    }
    refreshData() {
        if (this.initReady) {
            Log.debug('refreshData()');
            return this.measurementProvider.getMeasurements().then((matchedGroups) => {
                this.windRoseData = [];
                Log.debug('Matched measurements:', matchedGroups);
                for (let i = 0; i < matchedGroups.length; i++) {
                    this.measurementCounter.init(this.cardConfig.windspeedEntities[i].speedUnit);
                    for (const measurement of matchedGroups[i]) {
                        this.measurementCounter.addWindMeasurements(measurement.direction, measurement.speed);
                    }
                    const windCounts = this.measurementCounter.getMeasurementCounts();
                    this.windRoseData.push(this.percentageCalculator.calculate(windCounts));
                }
                this.measurementsReady = true;
                return Promise.resolve(true);
            });
        }
        else {
            Log.debug('refreshData() ignored, not inited yet');
            return Promise.resolve(false);
        }
    }
    render(canvasContext) {
        if (canvasContext && this.initReady && this.dimensionsReady && this.measurementsReady) {
            Log.debug('render()', canvasContext, this.windRoseData, this.windBarRenderers);
            this.windRoseRenderer.drawWindRose(this.windRoseData[0], canvasContext);
            for (let i = 0; i < this.windBarRenderers.length; i++) {
                this.windBarRenderers[i].drawWindBar(this.windRoseData[i], canvasContext);
            }
        }
        else {
            Log.debug("render(): Could not render, no canvasContext, dimensions or windRoseData", canvasContext, this.windRoseData);
        }
    }
}

class DirectionSpeed {
    constructor(direction, speed) {
        this.direction = direction;
        this.speed = speed;
    }
}

class MeasurementMatcher {
    constructor(matchingStrategy) {
        this.matchingStrategy = matchingStrategy;
        Log.debug('Matching init:', matchingStrategy);
        if (this.matchingStrategy !== 'direction-first' && this.matchingStrategy !== 'speed-first') {
            throw Error('Unkown matchfing strategy: ' + this.matchingStrategy);
        }
    }
    matchStatsHistory(directionStats, speedHistory) {
        const directionSpeed = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const direction of directionStats) {
                const speed = this.findHistoryInPeriod(direction, speedHistory);
                if (speed) {
                    if (this.isInvalidSpeed(speed.s)) {
                        Log.warn("Speed " + speed.s + " at timestamp " + direction.start + " is not a number.");
                    }
                    else {
                        directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                    }
                }
                else {
                    Log.trace('No matching speed found for direction ' + direction.mean + " at timestamp " + direction.start);
                }
            }
        }
        else {
            for (const speed of speedHistory) {
                const direction = this.findStatsAtTime(speed.lu * 1000, directionStats);
                if (direction) {
                    directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                    if (speed.s === '' || speed.s === null || isNaN(+speed.s)) {
                        Log.warn("Speed " + speed.s + " at timestamp " + direction.start + " is not a number.");
                    }
                    else {
                        directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                    }
                }
                else {
                    Log.trace('No matching direction found for speed ' + speed.s + " at timestamp " + speed.lu);
                }
            }
        }
        return directionSpeed;
    }
    matchHistoryStats(directionHistory, speedStats) {
        const directionSpeed = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const direction of directionHistory) {
                const speed = this.findStatsAtTime(direction.lu * 1000, speedStats);
                if (speed) {
                    directionSpeed.push(new DirectionSpeed(direction.s, speed.mean));
                }
                else {
                    Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
                }
            }
        }
        else {
            for (const speed of speedStats) {
                const direction = this.findHistoryInPeriod(speed, directionHistory);
                if (direction) {
                    if (direction.s === '' || direction.s === null || isNaN(+direction.s)) {
                        Log.warn("Direction " + direction.s + " at timestamp " + direction.lu + " is not a number.");
                    }
                    else {
                        directionSpeed.push(new DirectionSpeed(direction.s, speed.mean));
                    }
                }
                else {
                    Log.trace('No matching direction found for speed ' + speed.start + " at timestamp " + speed.mean);
                }
            }
        }
        return directionSpeed;
    }
    matchHistoryHistory(directionHistory, speedHistory) {
        const directionSpeed = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const direction of directionHistory) {
                const speed = this.findHistoryBackAtTime(direction.lu, speedHistory);
                if (speed) {
                    if (this.isInvalidSpeed(speed.s)) {
                        Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                    }
                    else {
                        directionSpeed.push(new DirectionSpeed(direction.s, +speed.s));
                    }
                }
                else {
                    Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
                }
            }
        }
        else {
            for (const speed of speedHistory) {
                if (this.isValidSpeed(speed.s)) {
                    const direction = this.findHistoryBackAtTime(speed.lu, directionHistory);
                    if (direction) {
                        if (direction.s === '' || direction.s === null || isNaN(+direction.s)) {
                            Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                        }
                        else {
                            directionSpeed.push(new DirectionSpeed(direction.s, +speed.s));
                        }
                    }
                    else {
                        Log.trace('No matching direction found for speed ' + speed.s + " at timestamp " + speed.lu);
                    }
                }
            }
        }
        return directionSpeed;
    }
    matchStatsStats(directionStats, speedStats) {
        const directionSpeed = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const directionStat of directionStats) {
                const matchedSpeed = this.findMatchingStatistic(directionStat, speedStats);
                if (matchedSpeed) {
                    directionSpeed.push(new DirectionSpeed(directionStat.mean, matchedSpeed.mean));
                }
                else {
                    Log.trace(`No matching speed found for direction ${directionStat.mean} at timestamp start:${directionStat.start} end:${directionStat.end}`);
                }
            }
        }
        else {
            for (const speedStat of speedStats) {
                const matchedDirection = this.findMatchingStatistic(speedStat, directionStats);
                if (matchedDirection) {
                    directionSpeed.push(new DirectionSpeed(matchedDirection.mean, speedStat.mean));
                }
                else {
                    Log.trace(`No matching direction found for speed ${speedStat.mean} at timestamp start:${speedStat.start} end:${speedStat.end}`);
                }
            }
        }
        return directionSpeed;
    }
    findStatsAtTime(timestamp, stats) {
        return stats.find((stat) => stat.start <= timestamp && timestamp <= stat.end);
    }
    findHistoryInPeriod(stat, history) {
        const start = stat.start / 1000;
        const end = stat.end / 1000;
        const selection = history.filter((measurement) => start < measurement.lu && end >= measurement.lu);
        if (selection.length == 1) {
            return selection[0];
        }
        else if (selection.length > 1) {
            selection.sort((a, b) => b.lu - a.lu);
            return selection[Math.trunc(selection.length / 2)];
        }
        return undefined;
    }
    findMatchingStatistic(statistic, stats) {
        return stats.find((stat) => statistic.start === stat.start && statistic.end === stat.end);
    }
    findHistoryBackAtTime(timestamp, history) {
        let match;
        for (const measurement of history) {
            if (measurement.lu <= timestamp) {
                match = measurement;
            }
            else {
                break;
            }
        }
        return match;
    }
    isInvalidSpeed(speed) {
        return speed === '' || speed === null || speed === undefined || isNaN(+speed);
    }
    isValidSpeed(speed) {
        return speed !== '' && speed !== null && speed !== undefined && !isNaN(+speed);
    }
}

class HomeAssistantMeasurementProvider {
    constructor(cardConfig) {
        this.waitingForMeasurements = false;
        this.cardConfig = cardConfig;
        this.rawEntities = cardConfig.createRawEntitiesArray();
        this.statsEntities = cardConfig.createStatisticsEntitiesArray();
        this.measurementMatcher = new MeasurementMatcher(this.cardConfig.matchingStrategy);
    }
    setHass(hass) {
        this.hass = hass;
    }
    getMeasurements() {
        Log.debug('getMeasurements()');
        if (this.hass === undefined) {
            Log.error('Cant read measurements, HASS not set.');
            return Promise.resolve([]);
        }
        if (this.waitingForMeasurements) {
            Log.error('Measurements already requested, waiting');
            return Promise.resolve([]);
        }
        this.waitingForMeasurements = true;
        return Promise.all([this.getHistory(), this.getStatistics()]).then(results => {
            this.checkLoadedData(results);
            this.waitingForMeasurements = false;
            Log.debug("Measurements loaded:", results);
            const directionSpeedData = [];
            if (this.cardConfig.windDirectionEntity.useStatistics) {
                const directionStats = results[1][this.cardConfig.windDirectionEntity.entity];
                for (let speedEntity of this.cardConfig.windspeedEntities) {
                    if (speedEntity.useStatistics) {
                        const speedStats = results[1][speedEntity.entity];
                        const directionSpeeds = this.measurementMatcher.matchStatsStats(directionStats, speedStats);
                        directionSpeedData.push(directionSpeeds);
                        this.logMatchingStats(speedEntity.entity, directionStats.length, speedStats.length, directionSpeeds.length);
                    }
                    else {
                        const speedHistory = results[0][speedEntity.entity];
                        const directionSpeeds = this.measurementMatcher.matchStatsHistory(directionStats, speedHistory);
                        directionSpeedData.push(directionSpeeds);
                        this.logMatchingStats(speedEntity.entity, directionStats.length, speedHistory.length, directionSpeeds.length);
                    }
                }
            }
            else {
                const directionHistory = results[0][this.cardConfig.windDirectionEntity.entity];
                for (let speedEntity of this.cardConfig.windspeedEntities) {
                    if (speedEntity.useStatistics) {
                        const speedStats = results[1][speedEntity.entity];
                        const directionSpeeds = this.measurementMatcher.matchHistoryStats(directionHistory, speedStats);
                        directionSpeedData.push(directionSpeeds);
                        this.logMatchingStats(speedEntity.entity, directionHistory.length, speedStats.length, directionSpeeds.length);
                    }
                    else {
                        const speedHistory = results[0][speedEntity.entity];
                        const directionSpeeds = this.measurementMatcher.matchHistoryHistory(directionHistory, speedHistory);
                        directionSpeedData.push(directionSpeeds);
                        this.logMatchingStats(speedEntity.entity, directionHistory.length, speedHistory.length, directionSpeeds.length);
                    }
                }
            }
            return Promise.resolve(directionSpeedData);
        });
    }
    checkLoadedData(results) {
        const directionEntity = this.cardConfig.windDirectionEntity.entity;
        if (results[0][directionEntity] === undefined && results[1][directionEntity] === undefined) {
            throw new Error(`Entity ${directionEntity} did not return data, is this the correct entity name?`);
        }
        for (const speedEntity of this.cardConfig.windspeedEntities) {
            if (results[0][speedEntity.entity] === undefined && results[1][speedEntity.entity] === undefined) {
                throw new Error(`Entity ${speedEntity.entity} did not return data, is this the correct entity name?`);
            }
        }
    }
    logMatchingStats(speedEntity, directionMeasurements, speedMeasurements, matchedMeasurements) {
        Log.info(`Loaded measurements: directions: ${directionMeasurements}, speeds: ${speedMeasurements}, entity: ${speedEntity}`);
        if (this.cardConfig.matchingStrategy === 'direction-first') {
            if (matchedMeasurements < directionMeasurements) {
                Log.warn(`Matching results entity ${speedEntity}, ${directionMeasurements - matchedMeasurements} not matched of total ${directionMeasurements} direction measurements`);
            }
            else {
                Log.info(`Matched measurements, direction-first: ${matchedMeasurements}`);
            }
        }
        else {
            if (matchedMeasurements < speedMeasurements) {
                Log.warn(`Matching results entity ${speedEntity}, ${speedMeasurements - matchedMeasurements}  not matched of total ${speedMeasurements} speed measurements`);
            }
            else {
                Log.info(`Matched measurements, speed-first: ${matchedMeasurements}`);
            }
        }
    }
    getHistory() {
        if (this.rawEntities.length === 0) {
            return Promise.resolve({});
        }
        const startTime = this.calculateStartTime(this.cardConfig.dataPeriod);
        const endTime = new Date();
        const historyMessage = {
            "type": "history/history_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "minimal_response": true,
            "no_attributes": true,
            "entity_ids": this.rawEntities
        };
        return this.hass.callWS(historyMessage);
    }
    getStatistics() {
        if (this.statsEntities.length === 0) {
            return Promise.resolve({});
        }
        const startTime = this.calculateStartTime(this.cardConfig.dataPeriod);
        const statisticsMessage = {
            "type": "recorder/statistics_during_period",
            "start_time": startTime,
            "period": "5minute",
            "statistic_ids": this.statsEntities,
            "types": ["mean"]
        };
        return this.hass.callWS(statisticsMessage);
    }
    calculateStartTime(dataPeriod) {
        const startTime = new Date();
        if (dataPeriod.hourstoShow) {
            startTime.setHours(startTime.getHours() - dataPeriod.hourstoShow);
        }
        else if ((dataPeriod.fromHourOfDay && dataPeriod.fromHourOfDay > 0) || dataPeriod.fromHourOfDay === 0) {
            if (startTime.getHours() < dataPeriod.fromHourOfDay) {
                startTime.setDate(startTime.getDate() - 1);
            }
            startTime.setHours(dataPeriod.fromHourOfDay, 0, 0, 0);
        }
        else {
            throw new Error("No data period config option available.");
        }
        Log.info('Using start time for data query', startTime);
        return startTime;
    }
}

class EntityCheckResult {
    constructor(entity, unit, error) {
        this.entity = entity;
        this.unit = unit;
        this.error = error;
    }
}

class EntityChecker {
    async checkEntities(cardConfig, hass) {
        this.hass = hass;
        if (!this.hass) {
            Log.warn('Can\'t check entities, hass not set.');
        }
        const entityCheckResults = await this.getEntityStates(cardConfig);
        for (const result of entityCheckResults) {
            if (result.error) {
                throw new Error(`Entity ${result.entity} not found.`);
            }
            if (result.unit) {
                const speedEntity = cardConfig.windspeedEntities.find(entity => entity.entity === result.entity);
                if (speedEntity && speedEntity.speedUnit === 'auto') {
                    speedEntity.speedUnit = result.unit;
                    Log.info(`Windspeed unit detected for ${speedEntity.entity}: ${result.unit}`);
                }
            }
        }
    }
    async getEntityStates(cardConfig) {
        const stateCallResults = [];
        for (const entity of cardConfig.windspeedEntities) {
            stateCallResults.push(await this.callEntityState(entity.entity));
        }
        return Promise.resolve(stateCallResults);
    }
    async callEntityState(entity) {
        var _a;
        try {
            const result = await this.hass.callApi('GET', 'states/' + entity);
            const unit = (_a = result === null || result === void 0 ? void 0 : result.attributes) === null || _a === void 0 ? void 0 : _a.unit_of_measurement;
            return new EntityCheckResult(entity, unit, undefined);
        }
        catch (error) {
            return new EntityCheckResult(entity, undefined, error);
        }
    }
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});
/* eslint no-console: 0 */
console.info(`%c  WINROSE-CARD  %c Version 1.4.0 `, 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');
let WindRoseCard = class WindRoseCard extends s {
    static getStubConfig() {
        return CardConfigWrapper.exampleConfig();
    }
    constructor() {
        super();
        this.canvasWidth = 400;
        this.canvasHeight = 400;
        this.ro = new ResizeObserver(entries => {
            if (this.cardConfig) {
                for (const entry of entries) {
                    Log.trace('ResizeObserver entries:', entries);
                    const cs = entry.contentRect;
                    this.recalculateCanvasSize(cs.width);
                    this.requestUpdate();
                    Log.debug("Request update, because of resize.");
                }
            }
        });
        this.windRoseDirigent = new WindRoseDirigent();
        this.entityChecker = new EntityChecker();
    }
    set hass(hass) {
        this._hass = hass;
    }
    render() {
        var _a;
        super.render();
        Log.debug('card render()');
        return y `
            <ha-card header="${(_a = this.cardConfig) === null || _a === void 0 ? void 0 : _a.title}">
                <div class="card-content">
                    <canvas id="windRose"
                            width=${this.canvasWidth}
                            height=${this.canvasHeight}>
                    </canvas>
                </div>
            </ha-card>
        `;
    }
    firstUpdated() {
        Log.debug('firstUpdated()');
        this.canvasContext = this.canvas.getContext('2d');
        Log.debug('Canvas context found: ', this.canvasContext, this.measurementProvider);
        this.refreshCardConfig();
    }
    update(changedProperties) {
        Log.debug('update()');
        super.update(changedProperties);
        this.windRoseDirigent.render(this.canvasContext);
    }
    initInterval() {
        Log.debug('initInterval()');
        if (this.cardConfig && this.updateInterval === undefined) {
            this.updateInterval = setInterval(() => this.refreshMeasurements(), this.cardConfig.refreshInterval * 1000);
            Log.info('Interval running with ' + this.cardConfig.refreshInterval + ' seconds.');
        }
    }
    static get styles() {
        return i$2 `
          :host {
            display: block;
          }
          canvas {
            background-color: var(--ha-card-background);
            max-height: var(--chart-max-height);
          }`;
    }
    connectedCallback() {
        super.connectedCallback();
        Log.debug('connectedCallBack()');
        this.ro.observe(this);
        this.initInterval();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        Log.debug('disconnectedCallback()');
        this.ro.unobserve(this);
        clearInterval(this.updateInterval);
    }
    setConfig(config) {
        this.config = config;
        this.cardConfig = new CardConfigWrapper(config);
        Log.setLevel(this.cardConfig.logLevel);
        Log.debug('setConfig(): ', config, this._hass);
        if (this._hass && this.canvasContext) {
            this.refreshCardConfig();
        }
    }
    getCardSize() {
        Log.debug('getCardSize()');
        return 4;
    }
    refreshCardConfig() {
        this.entityChecker.checkEntities(this.cardConfig, this._hass).then(() => {
            this.measurementProvider = new HomeAssistantMeasurementProvider(this.cardConfig);
            this.measurementProvider.setHass(this._hass);
            this.windRoseDirigent.init(this.cardConfig, this.measurementProvider);
            this.recalculateCanvasSize(this.canvas.width);
            this.refreshMeasurements();
        });
    }
    refreshMeasurements() {
        this.windRoseDirigent.refreshData().then((refresh) => {
            Log.debug('refreshData() ready, requesting update.');
            if (refresh) {
                this.requestUpdate();
            }
        });
    }
    recalculateCanvasSize(width) {
        const canvasHeight = this.windRoseDirigent.resize(width - 32);
        this.canvas.width = width - 32;
        this.canvas.height = canvasHeight;
    }
};
__decorate([
    i('#windRose')
], WindRoseCard.prototype, "canvas", void 0);
__decorate([
    i('.card-content')
], WindRoseCard.prototype, "parentDiv", void 0);
WindRoseCard = __decorate([
    e('windrose-card')
], WindRoseCard);

export { Log, WindRoseCard };
