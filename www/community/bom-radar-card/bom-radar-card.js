/*! *****************************************************************************
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
function e(e,t,n,i){var a,r=arguments.length,o=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(o=(r<3?a(o):r>3?a(t,n,o):a(t,n))||o);return r>3&&o&&Object.defineProperty(t,n,o),o
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}const t=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),i=new Map;class a{constructor(e,t){if(this._$cssResult$=!0,t!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){let e=i.get(this.cssText);return t&&void 0===e&&(i.set(this.cssText,e=new CSSStyleSheet),e.replaceSync(this.cssText)),e}toString(){return this.cssText}}const r=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,n,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1]),e[0]);return new a(i,n)},o=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new a("string"==typeof e?e:e+"",n))(t)})(e):e
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var s;const l=window.reactiveElementPolyfillSupport,c={toAttribute(e,t){switch(t){case Boolean:e=e?"":null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},d=(e,t)=>t!==e&&(t==t||e==e),h={attribute:!0,type:String,converter:c,reflect:!1,hasChanged:d};class u extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(e){var t;null!==(t=this.l)&&void 0!==t||(this.l=[]),this.l.push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,n)=>{const i=this._$Eh(n,t);void 0!==i&&(this._$Eu.set(i,n),e.push(i))})),e}static createProperty(e,t=h){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const n="symbol"==typeof e?Symbol():"__"+e,i=this.getPropertyDescriptor(e,n,t);void 0!==i&&Object.defineProperty(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){return{get(){return this[t]},set(i){const a=this[e];this[t]=i,this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||h}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),this.elementProperties=new Map(e.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const n of t)this.createProperty(n,e[n])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eh(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}o(){var e;this._$Ev=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Ep(),this.requestUpdate(),null===(e=this.constructor.l)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,n;(null!==(t=this._$Em)&&void 0!==t?t:this._$Em=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(n=e.hostConnected)||void 0===n||n.call(e))}removeController(e){var t;null===(t=this._$Em)||void 0===t||t.splice(this._$Em.indexOf(e)>>>0,1)}_$Ep(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Et.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;const n=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,n)=>{t?e.adoptedStyleSheets=n.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):n.forEach((t=>{const n=document.createElement("style"),i=window.litNonce;void 0!==i&&n.setAttribute("nonce",i),n.textContent=t.cssText,e.appendChild(n)}))})(n,this.constructor.elementStyles),n}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$Em)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$Em)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$Eg(e,t,n=h){var i,a;const r=this.constructor._$Eh(e,n);if(void 0!==r&&!0===n.reflect){const o=(null!==(a=null===(i=n.converter)||void 0===i?void 0:i.toAttribute)&&void 0!==a?a:c.toAttribute)(t,n.type);this._$Ei=e,null==o?this.removeAttribute(r):this.setAttribute(r,o),this._$Ei=null}}_$AK(e,t){var n,i,a;const r=this.constructor,o=r._$Eu.get(e);if(void 0!==o&&this._$Ei!==o){const e=r.getPropertyOptions(o),s=e.converter,l=null!==(a=null!==(i=null===(n=s)||void 0===n?void 0:n.fromAttribute)&&void 0!==i?i:"function"==typeof s?s:null)&&void 0!==a?a:c.fromAttribute;this._$Ei=o,this[o]=l(t,e.type),this._$Ei=null}}requestUpdate(e,t,n){let i=!0;void 0!==e&&(((n=n||this.constructor.getPropertyOptions(e)).hasChanged||d)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===n.reflect&&this._$Ei!==e&&(void 0===this._$ES&&(this._$ES=new Map),this._$ES.set(e,n))):i=!1),!this.isUpdatePending&&i&&(this._$Ev=this._$EC())}async _$EC(){this.isUpdatePending=!0;try{await this._$Ev}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach(((e,t)=>this[t]=e)),this._$Et=void 0);let t=!1;const n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),null===(e=this._$Em)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(n)):this._$EU()}catch(e){throw t=!1,this._$EU(),e}t&&this._$AE(n)}willUpdate(e){}_$AE(e){var t;null===(t=this._$Em)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ev}shouldUpdate(e){return!0}update(e){void 0!==this._$ES&&(this._$ES.forEach(((e,t)=>this._$Eg(t,this[t],e))),this._$ES=void 0),this._$EU()}updated(e){}firstUpdated(e){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var p;u.finalized=!0,u.elementProperties=new Map,u.elementStyles=[],u.shadowRootOptions={mode:"open"},null==l||l({ReactiveElement:u}),(null!==(s=globalThis.reactiveElementVersions)&&void 0!==s?s:globalThis.reactiveElementVersions=[]).push("1.0.1");const m=globalThis.trustedTypes,g=m?m.createPolicy("lit-html",{createHTML:e=>e}):void 0,f=`lit$${(Math.random()+"").slice(9)}$`,_="?"+f,v=`<${_}>`,b=document,y=(e="")=>b.createComment(e),$=e=>null===e||"object"!=typeof e&&"function"!=typeof e,w=Array.isArray,A=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,x=/-->/g,S=/>/g,C=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,k=/'/g,E=/"/g,T=/^(?:script|style|textarea)$/i,M=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),L=Symbol.for("lit-noChange"),O=Symbol.for("lit-nothing"),R=new WeakMap,P=b.createTreeWalker(b,129,null,!1),I=(e,t)=>{const n=e.length-1,i=[];let a,r=2===t?"<svg>":"",o=A;for(let t=0;t<n;t++){const n=e[t];let s,l,c=-1,d=0;for(;d<n.length&&(o.lastIndex=d,l=o.exec(n),null!==l);)d=o.lastIndex,o===A?"!--"===l[1]?o=x:void 0!==l[1]?o=S:void 0!==l[2]?(T.test(l[2])&&(a=RegExp("</"+l[2],"g")),o=C):void 0!==l[3]&&(o=C):o===C?">"===l[0]?(o=null!=a?a:A,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?C:'"'===l[3]?E:k):o===E||o===k?o=C:o===x||o===S?o=A:(o=C,a=void 0);const h=o===C&&e[t+1].startsWith("/>")?" ":"";r+=o===A?n+v:c>=0?(i.push(s),n.slice(0,c)+"$lit$"+n.slice(c)+f+h):n+f+(-2===c?(i.push(void 0),t):h)}const s=r+(e[n]||"<?>")+(2===t?"</svg>":"");return[void 0!==g?g.createHTML(s):s,i]};class z{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let a=0,r=0;const o=e.length-1,s=this.parts,[l,c]=I(e,t);if(this.el=z.createElement(l,n),P.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(i=P.nextNode())&&s.length<o;){if(1===i.nodeType){if(i.hasAttributes()){const e=[];for(const t of i.getAttributeNames())if(t.endsWith("$lit$")||t.startsWith(f)){const n=c[r++];if(e.push(t),void 0!==n){const e=i.getAttribute(n.toLowerCase()+"$lit$").split(f),t=/([.?@])?(.*)/.exec(n);s.push({type:1,index:a,name:t[2],strings:e,ctor:"."===t[1]?D:"?"===t[1]?j:"@"===t[1]?W:N})}else s.push({type:6,index:a})}for(const t of e)i.removeAttribute(t)}if(T.test(i.tagName)){const e=i.textContent.split(f),t=e.length-1;if(t>0){i.textContent=m?m.emptyScript:"";for(let n=0;n<t;n++)i.append(e[n],y()),P.nextNode(),s.push({type:2,index:++a});i.append(e[t],y())}}}else if(8===i.nodeType)if(i.data===_)s.push({type:2,index:a});else{let e=-1;for(;-1!==(e=i.data.indexOf(f,e+1));)s.push({type:7,index:a}),e+=f.length-1}a++}}static createElement(e,t){const n=b.createElement("template");return n.innerHTML=e,n}}function B(e,t,n=e,i){var a,r,o,s;if(t===L)return t;let l=void 0!==i?null===(a=n._$Cl)||void 0===a?void 0:a[i]:n._$Cu;const c=$(t)?void 0:t._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(r=null==l?void 0:l._$AO)||void 0===r||r.call(l,!1),void 0===c?l=void 0:(l=new c(e),l._$AT(e,n,i)),void 0!==i?(null!==(o=(s=n)._$Cl)&&void 0!==o?o:s._$Cl=[])[i]=l:n._$Cu=l),void 0!==l&&(t=B(e,l._$AS(e,t.values),l,i)),t}class H{constructor(e,t){this.v=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(e){var t;const{el:{content:n},parts:i}=this._$AD,a=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:b).importNode(n,!0);P.currentNode=a;let r=P.nextNode(),o=0,s=0,l=i[0];for(;void 0!==l;){if(o===l.index){let t;2===l.type?t=new U(r,r.nextSibling,this,e):1===l.type?t=new l.ctor(r,l.name,l.strings,this,e):6===l.type&&(t=new F(r,this,e)),this.v.push(t),l=i[++s]}o!==(null==l?void 0:l.index)&&(r=P.nextNode(),o++)}return a}m(e){let t=0;for(const n of this.v)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class U{constructor(e,t,n,i){var a;this.type=2,this._$AH=O,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cg=null===(a=null==i?void 0:i.isConnected)||void 0===a||a}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cg}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=B(this,e,t),$(e)?e===O||null==e||""===e?(this._$AH!==O&&this._$AR(),this._$AH=O):e!==this._$AH&&e!==L&&this.$(e):void 0!==e._$litType$?this.T(e):void 0!==e.nodeType?this.S(e):(e=>{var t;return w(e)||"function"==typeof(null===(t=e)||void 0===t?void 0:t[Symbol.iterator])})(e)?this.M(e):this.$(e)}A(e,t=this._$AB){return this._$AA.parentNode.insertBefore(e,t)}S(e){this._$AH!==e&&(this._$AR(),this._$AH=this.A(e))}$(e){this._$AH!==O&&$(this._$AH)?this._$AA.nextSibling.data=e:this.S(b.createTextNode(e)),this._$AH=e}T(e){var t;const{values:n,_$litType$:i}=e,a="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=z.createElement(i.h,this.options)),i);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===a)this._$AH.m(n);else{const e=new H(a,this),t=e.p(this.options);e.m(n),this.S(t),this._$AH=e}}_$AC(e){let t=R.get(e.strings);return void 0===t&&R.set(e.strings,t=new z(e)),t}M(e){w(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const a of e)i===t.length?t.push(n=new U(this.A(y()),this.A(y()),this,this.options)):n=t[i],n._$AI(a),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){var n;for(null===(n=this._$AP)||void 0===n||n.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cg=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class N{constructor(e,t,n,i,a){this.type=1,this._$AH=O,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=a,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=O}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,n,i){const a=this.strings;let r=!1;if(void 0===a)e=B(this,e,t,0),r=!$(e)||e!==this._$AH&&e!==L,r&&(this._$AH=e);else{const i=e;let o,s;for(e=a[0],o=0;o<a.length-1;o++)s=B(this,i[n+o],t,o),s===L&&(s=this._$AH[o]),r||(r=!$(s)||s!==this._$AH[o]),s===O?e=O:e!==O&&(e+=(null!=s?s:"")+a[o+1]),this._$AH[o]=s}r&&!i&&this.k(e)}k(e){e===O?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class D extends N{constructor(){super(...arguments),this.type=3}k(e){this.element[this.name]=e===O?void 0:e}}class j extends N{constructor(){super(...arguments),this.type=4}k(e){e&&e!==O?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class W extends N{constructor(e,t,n,i,a){super(e,t,n,i,a),this.type=5}_$AI(e,t=this){var n;if((e=null!==(n=B(this,e,t,0))&&void 0!==n?n:O)===L)return;const i=this._$AH,a=e===O&&i!==O||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==O&&(i===O||a);a&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,n;"function"==typeof this._$AH?this._$AH.call(null!==(n=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==n?n:this.element,e):this._$AH.handleEvent(e)}}class F{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){B(this,e)}}const Z=window.litHtmlPolyfillSupport;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var V,q;null==Z||Z(z,U),(null!==(p=globalThis.litHtmlVersions)&&void 0!==p?p:globalThis.litHtmlVersions=[]).push("2.0.1");class G extends u{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var e,t;const n=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=n.firstChild),n}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Dt=((e,t,n)=>{var i,a;const r=null!==(i=null==n?void 0:n.renderBefore)&&void 0!==i?i:t;let o=r._$litPart$;if(void 0===o){const e=null!==(a=null==n?void 0:n.renderBefore)&&void 0!==a?a:null;r._$litPart$=o=new U(t.insertBefore(y(),e),e,void 0,null!=n?n:{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Dt)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Dt)||void 0===e||e.setConnected(!1)}render(){return L}}G.finalized=!0,G._$litElement$=!0,null===(V=globalThis.litElementHydrateSupport)||void 0===V||V.call(globalThis,{LitElement:G});const J=globalThis.litElementPolyfillSupport;null==J||J({LitElement:G}),(null!==(q=globalThis.litElementVersions)&&void 0!==q?q:globalThis.litElementVersions=[]).push("3.0.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K=e=>t=>"function"==typeof t?((e,t)=>(window.customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:n,elements:i}=t;return{kind:n,elements:i,finisher(t){window.customElements.define(e,t)}}})(e,t)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,Y=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(n){n.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(n){n.createProperty(t.key,e)}};function Q(e){return(t,n)=>void 0!==n?((e,t,n)=>{t.constructor.createProperty(n,e)})(e,t,n):Y(e,t)}var X="[^\\s]+";function ee(e,t){for(var n=[],i=0,a=e.length;i<a;i++)n.push(e[i].substr(0,t));return n}var te=function(e){return function(t,n){var i=n[e].map((function(e){return e.toLowerCase()})),a=i.indexOf(t.toLowerCase());return a>-1?a:null}};function ne(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];for(var i=0,a=t;i<a.length;i++){var r=a[i];for(var o in r)e[o]=r[o]}return e}var ie=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ae=["January","February","March","April","May","June","July","August","September","October","November","December"],re=ee(ae,3),oe={dayNamesShort:ee(ie,3),dayNames:ie,monthNamesShort:re,monthNames:ae,amPm:["am","pm"],DoFn:function(e){return e+["th","st","nd","rd"][e%10>3?0:(e-e%10!=10?1:0)*e%10]}},se=(ne({},oe),function(e){return+e-1}),le=[null,"[1-9]\\d?"],ce=[null,X],de=["isPm",X,function(e,t){var n=e.toLowerCase();return n===t.amPm[0]?0:n===t.amPm[1]?1:null}],he=["timezoneOffset","[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",function(e){var t=(e+"").match(/([+-]|\d\d)/gi);if(t){var n=60*+t[1]+parseInt(t[2],10);return"+"===t[0]?n:-n}return 0}];te("monthNamesShort"),te("monthNames");var ue,pe;!function(){try{(new Date).toLocaleDateString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(e){return"RangeError"===e.name}}(),function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(ue||(ue={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(pe||(pe={}));var me=function(e,t,n,i){i=i||{},n=null==n?{}:n;var a=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return a.detail=n,e.dispatchEvent(a),a};let ge=class extends G{setConfig(e){this._config=e}get _name(){return this._config&&this._config.name||""}get _entity(){return this._config&&this._config.entity||""}render(){if(!this.hass)return M``;let e;return e=this._config,M`
      <div class="values">
        <div class="side-by-side">
          <paper-dropdown-menu
            label="Map Style (optional)"
            .value=${e.map_style?e.map_style:""}
            editable
            .configAttribute=${"map_style"}
            .configObject=${e}
            @value-changed=${this._valueChangedString}
            ><paper-listbox
              slot="dropdown-content"
              attr-for-selected="item-name"
              selected="${e.map_style?e.map_style:""}"
            >
              <paper-item item-name="Light">Light</paper-item>
              <paper-item item-name="Voyager">Voyager</paper-item>
              <paper-item item-name="Satellite">Satellite</paper-item>
              <paper-item item-name="Dark">Dark</paper-item>
            </paper-listbox></paper-dropdown-menu
          >
          <paper-dropdown-menu
            label="Zoom Level (optional)"
            .value=${e.zoom_level?e.zoom_level:null}
            editable
            .configAttribute=${"zoom_level"}
            .configObject=${e}
            @value-changed=${this._valueChangedNumber}
            ><paper-listbox
              slot="dropdown-content"
              attr-for-selected="item-name"
              selected="${e.zoom_level?e.zoom_level:null}"
            >
              <paper-item item-name="4">4</paper-item>
              <paper-item item-name="5">5</paper-item>
              <paper-item item-name="6">6</paper-item>
              <paper-item item-name="7">7</paper-item>
              <paper-item item-name="8">8</paper-item>
              <paper-item item-name="9">9</paper-item>
              <paper-item item-name="10">10</paper-item>
            </paper-listbox></paper-dropdown-menu
          >
        </div>
        <paper-input
          label="Map Centre Latitude (optional)"
          .value=${e.center_latitude?e.center_latitude:""}
          editable
          .configAttribute=${"center_latitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
        <paper-input
          label="Map Centre Longitude (optional)"
          .value=${e.center_longitude?e.center_longitude:""}
          editable
          .configAttribute=${"center_longitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
        <paper-input
          label="Marker Latitude (optional)"
          .value=${e.marker_latitude?e.marker_latitude:""}
          editable
          .configAttribute=${"marker_latitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
        <paper-input
          label="Marker Longitude (optional)"
          .value=${e.marker_longitude?e.marker_longitude:""}
          editable
          .configAttribute=${"marker_longitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
        <div class="side-by-side">
          <paper-input
            label="Frame Count (optional)"
            .value=${e.frame_count?e.frame_count:""}
            editable
            .configAttribute=${"frame_count"}
            .configObject=${e}
            @value-changed=${this._valueChangedNumber}
          ></paper-input>
          <paper-input
            label="Frame Delay(ms) (optional)"
            .value=${e.frame_delay?e.frame_delay:""}
            editable
            .configAttribute=${"frame_delay"}
            .configObject=${e}
            @value-changed=${this._valueChangedNumber}
          ></paper-input>
        </div>
        <div class="side-by-side">
          <ha-formfield label="Static Map">
            <ha-switch
              ?checked=${e.static_map}
              .value=${e.static_map}
              name="style_mode"
              .configAttribute=${"static_map"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show Zoom">
            <ha-switch
              ?checked=${e.show_zoom}
              .value=${e.show_zoom}
              name="style_mode"
              .configAttribute=${"show_zoom"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Square Map">
            <ha-switch
              ?checked=${e.square_map}
              .value=${e.square_map}
              name="style_mode"
              .configAttribute=${"square_map"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
        </div>
        <div class="side-by-side">
          <ha-formfield label="Show Marker">
            <ha-switch
              ?checked=${e.show_marker}
              .value=${e.show_marker}
              name="style_mode"
              .configAttribute=${"show_marker"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show Playback">
            <ha-switch
              ?checked=${e.show_playback}
              .value=${e.show_playback}
              name="style_mode"
              .configAttribute=${"show_playback"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show Recenter">
            <ha-switch
              ?checked=${e.show_recenter}
              .value=${e.show_recenter}
              name="style_mode"
              .configAttribute=${"show_recenter"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
        </div>
        <div class="side-by-side">
          <ha-formfield label="Show Scale">
            <ha-switch
              ?checked=${e.show_scale}
              .value=${e.show_scale}
              name="style_mode"
              .configAttribute=${"show_scale"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show Range">
            <ha-switch
              ?checked=${e.show_range}
              .value=${e.show_range}
              name="style_mode"
              .configAttribute=${"show_range"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show Extra Labels">
            <ha-switch
              ?checked=${e.extra_labels}
              .value=${e.extra_labels}
              name="style_mode"
              .configAttribute=${"extra_labels"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
        </div>
        <div class="side-by-side">
          <ha-formfield label="Show Radar Locations">
            <ha-switch
              ?checked=${e.show_radar_location}
              .value=${e.show_radar_location}
              name="style_mode"
              .configAttribute=${"show_radar_location"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show Radar Coverage">
            <ha-switch
              ?checked=${e.show_radar_coverage}
              .value=${e.show_radar_coverage}
              name="style_mode"
              .configAttribute=${"show_radar_coverage"}
              .configObject=${e}
              @change="${this._valueChangedSwitch}"
            ></ha-switch>
          </ha-formfield>
          <div></div>
        </div>
        <div class="side-by-side">
          <paper-input
            label="Radar Location Radius (optional)"
            .value=${e.radar_location_radius?e.radar_location_radius:""}
            editable
            .configAttribute=${"radar_location_radius"}
            .configObject=${e}
            @value-changed=${this._valueChangedString}
          ></paper-input>
        </div>
        <div class="side-by-side">
          <paper-input
            label="Radar Line Colour (optional)"
            .value=${e.radar_location_line_colour?e.radar_location_line_colour:""}
            editable
            .configAttribute=${"radar_location_line_colour"}
            .configObject=${e}
            @value-changed=${this._valueChangedString}
          ></paper-input>
          <paper-input
            label="Radar Fill Colour (optional)"
            .value=${e.radar_location_fill_colour?e.radar_location_fill_colour:""}
            editable
            .configAttribute=${"radar_location_fill_colour"}
            .configObject=${e}
            @value-changed=${this._valueChangedString}
          ></paper-input>
        </div>
      </div>
    `}_valueChangedSwitch(e){const t=e.target;this._config&&this.hass&&t&&(this._config=Object.assign(Object.assign({},this._config),{[t.configAttribute]:Boolean(t.checked)}),me(this,"config-changed",{config:this._config}))}_valueChangedNumber(e){if(!this._config||!this.hass)return;const t=e.target;this[`_${t.configAttribute}`]!==t.value&&(t.configAttribute&&(""===t.value||null===t.value?delete this._config[t.configAttribute]:this._config=Object.assign(Object.assign({},this._config),{[t.configAttribute]:Number(t.value)})),me(this,"config-changed",{config:this._config}))}_valueChangedString(e){if(!this._config||!this.hass)return;const t=e.target;this[`_${t.configAttribute}`]!==t.value&&(t.configAttribute&&(""===t.value?delete this._config[t.configAttribute]:this._config=Object.assign(Object.assign({},this._config),{[t.configAttribute]:t.value})),me(this,"config-changed",{config:this._config}))}static get styles(){return r`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
      }
      ha-switch {
        padding: 16px 6px;
      }
      .side-by-side {
        display: flex;
      }
      .side-by-side > * {
        flex: 1;
        padding-right: 4px;
      }
    `}};e([Q()],ge.prototype,"hass",void 0),e([Q()],ge.prototype,"_config",void 0),ge=e([K("bom-radar-card-editor")],ge);var fe={version:"Version",invalid_configuration:"Invalid configuration",show_warning:"Show Warning"},_e={common:fe},ve={version:"Versjon",invalid_configuration:"Ikke gyldig konfiguration",show_warning:"Vis advarsel"},be={common:ve};const ye={en:Object.freeze({__proto__:null,common:fe,default:_e}),nb:Object.freeze({__proto__:null,common:ve,default:be})};function $e(e,t="",n=""){const i=(localStorage.getItem("selectedLanguage")||"en").replace(/['"]+/g,"").replace("-","_");let a;try{a=e.split(".").reduce(((e,t)=>e[t]),ye[i])}catch(t){a=e.split(".").reduce(((e,t)=>e[t]),ye.en)}return void 0===a&&(a=e.split(".").reduce(((e,t)=>e[t]),ye.en)),""!==t&&""!==n&&(a=a.replace(t,n)),a}console.info(`%c  BOM-RADAR-CARD \n%c  ${$e("common.version")} 1.4.5    `,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),window.customCards=window.customCards||[],window.customCards.push({type:"bom-radar-card",name:"BoM Radar Card",description:"A rain radar card using the new tiled images from the Australian BoM"});let we=class extends G{constructor(){super(...arguments),this.isPanel=!1}static async getConfigElement(){return document.createElement("bom-radar-card-editor")}static getStubConfig(){return{}}setConfig(e){this._config=e}getCardSize(){return 10}shouldUpdate(){return!0}render(){if(this._config.show_warning)return this.showWarning($e("common.show_warning"));const e=`\n      <!DOCTYPE html>\n      <html>\n        <head>\n          <title>BOM Radar Card</title>\n          <meta charset="utf-8" />\n          <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n          <link rel="stylesheet" href="/local/community/bom-radar-card/leaflet.css"/>\n          <link rel="stylesheet" href="/local/community/bom-radar-card/leaflet.toolbar.min.css"/>\n          <script src="/local/community/bom-radar-card/leaflet.js"><\/script>\n          <script src="/local/community/bom-radar-card/leaflet.toolbar.min.js"><\/script>\n          <style>\n            body {\n              margin: 0;\n              padding: 0;\n            }\n            .text-container {\n              font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;\n              margin: 0px 2.5px 0px 10px;\n            }\n            .text-container-small {\n              font: 10px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;\n              margin: 0px 10px 0px 2.5px;\n            }\n            .light-links a {\n              color: blue;\n            }\n            .dark-links a {\n              color: steelblue;\n            }\n            #timestamp {\n              margin: 0px 0px;\n            }\n            #color-bar {\n              margin: 0px 0px;\n            }\n          </style>\n        </head>\n        <body onresize="resizeWindow()">\n          <span>\n            <div id="color-bar" style="height: 8px;">\n              <img id="img-color-bar" src="/local/community/bom-radar-card/radar-colour-bar.png" height="8" style="vertical-align: top" />\n            </div>\n            <div id="mapid" style="height: ${this.isPanel?this.offsetParent?this.offsetParent.clientHeight-34-(!0===this.editMode?59:0)+"px":"526px":void 0!==this._config.square_map&&this._config.square_map?this.getBoundingClientRect().width+"px":"492px"};"></div>\n            <div id="div-progress-bar" style="height: 8px; background-color: white;">\n              <div id="progress-bar" style="height:8px;width:0; background-color: #ccf2ff;"></div>\n            </div>\n            <div id="bottom-container" class="light-links" style="height: 18px; background-color: white;">\n              <div id="timestampid" class="text-container" style="width: 110px; height: 18px; float:left; position: absolute;">\n                <p id="timestamp"></p>\n              </div>\n              <div id="attribution" class="text-container-small" style="height: 18px; float:right;">\n                <span class="Map__Attribution-LjffR DKiFh" id="attribution"\n                  ></span\n                >\n              </div>\n            </div>\n            <script>\n              const radarLocations = [\n                [-29.971116, 146.813845, "Brewarrina"],\n                [-35.661387, 149.512229, "Canberra (Captain's Flat)"],\n                [-29.620633, 152.963328, "Grafton"],\n                [-33.552222, 145.528610, "Hillston"],\n                [-29.496994, 149.850825, "Moree"],\n                [-31.024219, 150.192037, "Namoi (BlackJack Mountain)"],\n                [-32.729802, 152.025422, "Newcastle"],\n                [-29.038524, 167.941679, "Norfolk Island"],\n                [-33.700764, 151.209470, "Sydney (Terry Hills)"],\n                [-35.158170, 147.456307, "Wagga Wagga"],\n                [-34.262389, 150.875099, "Wollongong (Appin)"],\n                [-37.855210, 144.755512, "Melbourne"],\n                [-34.287096, 141.598250, "Mildura"],\n                [-37.887532, 147.575475, "Bairnsdale"],\n                [-35.997652, 142.013441, "Rainbow"],\n                [-36.029663, 146.022772, "Yarrawonga"],\n                [-19.885737, 148.075693, "Bowen"],\n                [-27.717739, 153.240015, "Brisbane (Mt Stapylton)"],\n                [-16.818145, 145.662895, "Cairns"],\n                [-23.549558, 148.239166, "Emerald (Central Highlands)"],\n                [-23.855056, 151.262567, "Gladstone"],\n                [-18.995000, 144.995000, "Greenvale"],\n                [-25.957342, 152.576898, "Gympie (Mt Kanigan)"],\n                [-23.439783, 144.282270, "Longreach"],\n                [-21.117243, 149.217213, "Mackay"],\n                [-27.606344, 152.540084, "Marburg"],\n                [-16.670000, 139.170000, "Mornington Island"],\n                [-20.711204, 139.555281, "Mount Isa"],\n                [-19.419800, 146.550974, "Townsville (Hervey Range)"],\n                [-26.440193, 147.349130, "Warrego"],\n                [-12.666413, 141.924640, "Weipa"],\n                [-16.287199, 149.964539, "Willis Island"],\n                [-34.617016, 138.468782, "Adelaide (Buckland Park)"],\n                [-35.329531, 138.502498, "Adelaide (Sellicks Hill)"],\n                [-32.129823, 133.696361, "Ceduna"],\n                [-37.747713, 140.774605, "Mt Gambier"],\n                [-31.155811, 136.804400, "Woomera"],\n                [-43.112593, 147.805241, "Hobart (Mt Koonya)"],\n                [-41.179147, 145.579986, "West Takone"],\n                [-23.795064, 133.888935, "Alice Springs"],\n                [-12.455933, 130.926599, "Darwin/Berrimah"],\n                [-12.274995, 136.819911, "Gove"],\n                [-14.510918, 132.447010, "Katherine/Tindal"],\n                [-11.648500, 133.379977, "Warruwi"],\n                [-34.941838, 117.816370, "Albany"],\n                [-17.948234, 122.235334, "Broome"],\n                [-24.887978, 113.669386, "Carnarvon"],\n                [-20.653613, 116.683144, "Dampier"],\n                [-31.777795, 117.952768, "South Doodlakine"],\n                [-33.830150, 121.891734, "Esperance"],\n                [-28.804648, 114.697349, "Geraldton"],\n                [-25.033225, 128.301756, "Giles"],\n                [-18.228916, 127.662836, "Halls Creek"],\n                [-30.784261, 121.454814, "Kalgoorlie-Boulder"],\n                [-22.103197, 113.999698, "Learmonth"],\n                [-33.096956, 119.008796, "Newdegate"],\n                [-32.391761, 115.866955, "Perth (Serpentine)"],\n                [-20.371845, 118.631670, "Port Hedland"],\n                [-30.358887, 116.305769, "Watheroo"],\n                [-15.451711, 128.120856, "Wyndham"]];\n              const maxZoom = 10;\n              const minZoom = 4;\n              var zoomLevel = ${void 0!==this._config.zoom_level?this._config.zoom_level:4};\n              var centerLat = ${void 0!==this._config.center_latitude?this._config.center_latitude:-27.85};\n              var centerLon = ${void 0!==this._config.center_longitude?this._config.center_longitude:133.75};\n              var markerLat = (${this._config.marker_latitude}) ? ${this._config.marker_latitude} : centerLat;\n              var markerLon = (${this._config.marker_longitude}) ? ${this._config.marker_longitude} : centerLon;\n              var timeout = ${void 0!==this._config.frame_delay?this._config.frame_delay:500};\n              var frameCount = ${null!=this._config.frame_count?this._config.frame_count:10};\n              resizeWindow();\n              var labelSize = ${void 0!==this._config.extra_labels&&this._config.extra_labels?128:256};\n              var labelZoom = ${void 0!==this._config.extra_labels&&this._config.extra_labels?1:0};\n              var locationRadius = '${void 0!==this._config.radar_location_radius?this._config.radar_location_radius:2}';\n              var locationLineColour = '${void 0!==this._config.radar_location_line_colour?this._config.radar_location_line_colour:"#00FF00"}';\n              var locationFillColour = '${void 0!==this._config.radar_location_fill_colour?this._config.radar_location_fill_colour:"#FF0000"}';\n              var map_style = '${void 0!==this._config.map_style?this._config.map_style.toLowerCase():"light"}';\n              switch (map_style) {\n                case "dark":\n                  var basemap_url = 'https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png';\n                  var basemap_style = 'dark_nolabels';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'dark_only_labels';\n                  var svg_icon = 'home-circle-light.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>';\n                  break;\n                case "voyager":\n                  var basemap_url = 'https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png';\n                  var basemap_style = 'rastertiles/voyager_nolabels';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'rastertiles/voyager_only_labels';\n                  var svg_icon = 'home-circle-dark.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>';\n                  break;\n                case 'satellite':\n                  var basemap_url = 'https://server.arcgisonline.com/ArcGIS/rest/services/{style}/MapServer/tile/{z}/{y}/{x}';\n                  var basemap_style = 'World_Imagery';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'proton_labels_std';\n                  var svg_icon = 'home-circle-dark.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="http://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank">ESRI</a>';\n                  break;\n                case "light":\n                default:\n                  var basemap_url = 'https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png';\n                  var basemap_style = 'light_nolabels';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'light_only_labels';\n                  var svg_icon = 'home-circle-dark.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>';\n              }\n\n              var idx = 0;\n              var run = true;\n              var doRadarUpdate = false;\n              var radarMap = L.map('mapid', {\n                zoomControl: ${!0===this._config.show_zoom&&!0!==this._config.static_map?"true":"false"},\n                ${!0===this._config.static_map?"scrollWheelZoom: false,                 doubleClickZoom: false,                 boxZoom: false,                 dragging: false,                 keyboard: false,                 touchZoom: false,":""}\n                attributionControl: false,\n                minZoom: minZoom,\n                maxZoom: maxZoom,\n                maxBounds: [\n                  [0, 101.25],\n                  [-55.77657, 168.75],\n                ],\n                maxBoundsViscosity: 1.0,\n              }).setView([centerLat, centerLon], zoomLevel);\n              var radarImage = [];\n              var radarTime = [];\n              var weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];\n              var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];\n              var d = new Date();\n              d.setTime(Math.trunc(d.valueOf() / 600000) * 600000 - frameCount * 600000);\n\n              document.getElementById("progress-bar").style.width = barSize+"px";\n              document.getElementById("attribution").innerHTML = attribution;\n\n              var t2actions = [];\n\n              if (${!0===this._config.show_recenter&&!0!==this._config.static_map}) {\n                var recenterAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img src="/local/community/bom-radar-card/recenter.png" width="24" height="24">',\n                          tooltip: 'Re-center'\n                      }\n                  },\n\n                  addHooks: function () {\n                    radarMap.setView([centerLat, centerLon], zoomLevel);\n                  }\n                });\n                t2actions.push(recenterAction);\n              }\n\n              if (${!0===this._config.show_playback}) {\n                var playAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img id="playButton" src="/local/community/bom-radar-card/pause.png" width="24" height="24">',\n                          tooltip: 'Pause'\n                      }\n                  },\n\n                  addHooks: function () {\n                    run = !run;\n                    if (run) {\n                      document.getElementById("playButton").src = "/local/community/bom-radar-card/pause.png"\n                    } else {\n                      document.getElementById("playButton").src = "/local/community/bom-radar-card/play.png"\n                    }\n                  }\n                });\n                t2actions.push(playAction);\n\n                var skipbackAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img src="/local/community/bom-radar-card/skip-back.png" width="24" height="24">',\n                          tooltip: 'Previous Frame'\n                      }\n                  },\n\n                  addHooks: function () {\n                    skipBack();\n                  }\n                });\n                t2actions.push(skipbackAction);\n\n                var skipnextAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img src="/local/community/bom-radar-card/skip-next.png" width="24" height="24">',\n                          tooltip: 'Next Frame'\n                      }\n                  },\n\n                  addHooks: function () {\n                    skipNext();\n                  }\n                });\n                t2actions.push(skipnextAction);\n              }\n\n              if (t2actions.length > 0) {\n                new L.Toolbar2.Control({\n                  position: 'bottomright',\n                  actions: t2actions\n                }).addTo(radarMap);\n              }\n\n              if (${!0===this._config.show_scale}) {\n                L.control.scale({\n                  position: 'bottomleft',\n                  metric: true,\n                  imperial: false,\n                  maxWidth: 100,\n                }).addTo(radarMap);\n\n                if ((map_style === "dark") || (map_style == "satellite")) {\n                  var scaleDiv = this.document.getElementsByClassName("leaflet-control-scale-line")[0];\n                  scaleDiv.style.color = "#BBB";\n                  scaleDiv.style.borderColor = "#BBB";\n                  scaleDiv.style.background = "#00000080";\n                }\n              }\n\n              if ((map_style === "dark") || (map_style == "satellite")) {\n                this.document.getElementById("div-progress-bar").style.background = "#1C1C1C";\n                this.document.getElementById("progress-bar").style.background = "steelblue";\n                this.document.getElementById("bottom-container").style.background = "#1C1C1C";\n                this.document.getElementById("bottom-container").style.color = "#DDDDDD";\n                this.document.getElementById("bottom-container").className = "dark-links";\n              }\n\n              L.tileLayer(\n                basemap_url,\n                {\n                  style: basemap_style,\n                  subdomains: 'abcd',\n                  detectRetina: true,\n                  tileSize: 256,\n                  zoomOffset: 0,\n                },\n              ).addTo(radarMap);\n\n              for (i = 0; i < frameCount; i++) {\n                radarImage[i] = L.tileLayer(\n                  'https://radar-tiles.service.bom.gov.au/tiles/{time}/{z}/{x}/{y}.png',\n                  {\n                    time: getRadarTime(d.valueOf() + i * 600000),\n                    detectRetina: true,\n                    tileSize: 256,\n                    zoomOffset: 0,\n                    opacity: 0,\n                  },\n                ).addTo(radarMap);\n                radarTime[i] = getRadarTimeString(d.valueOf() + i * 600000);\n              }\n              radarImage[idx].setOpacity(1);\n              document.getElementById('timestamp').innerHTML = radarTime[idx];\n              d.setTime(d.valueOf() + frameCount * 600000);\n\n              townLayer = L.tileLayer(\n                label_url,\n                {\n                  subdomains: 'abcd',\n                  detectRetina: false,\n                  tileSize: labelSize,\n                  zoomOffset: labelZoom,\n                },\n              ).addTo(radarMap);\n              townLayer.setZIndex(2);\n\n              ${!0===this._config.show_marker?"var myIcon = L.icon({                        iconUrl: '/local/community/bom-radar-card/'+svg_icon,                        iconSize: [16, 16],                      });                      L.marker([markerLat, markerLon], { icon: myIcon, interactive: false }).addTo(radarMap);":""}\n\n              ${!0===this._config.show_range?"L.circle([markerLat, markerLon], { radius: 50000, weight: 1, fill: false, opacity: 0.3, interactive: false }).addTo(radarMap);                      L.circle([markerLat, markerLon], { radius: 100000, weight: 1, fill: false, opacity: 0.3, interactive: false }).addTo(radarMap);                      L.circle([markerLat, markerLon], { radius: 200000, weight: 1, fill: false, opacity: 0.3, interactive: false }).addTo(radarMap);":""}\n\n              ${!0===this._config.show_radar_location?"radarMap.createPane('overlayRadarLocation');                      radarMap.getPane('overlayRadarLocation').style.zIndex = 401;                      radarMap.getPane('overlayRadarLocation').style.pointerEvents = 'none';                      radarLocations.forEach(function (coords) {                        L.circleMarker([coords[0], coords[1]], { radius: locationRadius, weight: locationRadius/2, color: locationLineColour, fillColor: locationFillColour, fillOpacity: 1.0, interactive: false, pane: 'overlayRadarLocation' }).addTo(radarMap);                        L.circleMarker([coords[0], coords[1]], { radius: Math.max(10, locationRadius*1.5), stroke: false, fill: true, fillOpacity: 0.0, interactive: true, pane: 'overlayRadarLocation' }).addTo(radarMap).bindTooltip(coords[2]);                       });":""}\n\n              ${!0===this._config.show_radar_coverage?"radarMap.createPane('overlayRadarCoverage');                      radarMap.getPane('overlayRadarCoverage').style.opacity = 0.1;                      radarMap.getPane('overlayRadarCoverage').style.zIndex = 400;                      radarMap.getPane('overlayRadarCoverage').style.pointerEvents = 'none';                      radarLocations.forEach(function (coords) {                        L.circle([coords[0], coords[1]], { radius: 250000, weight: 1, stroke: false, fill: true, fillOpacity: 1, interactive: false, pane: 'overlayRadarCoverage' }).addTo(radarMap);                      });":""}\n\n              setTimeout(function() {\n                nextFrame();\n              }, timeout);\n              setUpdateTimeout();\n\n              function setUpdateTimeout() {\n                d.setTime(d.valueOf() + 600000);\n                x = new Date();\n                setTimeout(triggerRadarUpdate, d.valueOf() - x.valueOf());\n              }\n\n              function triggerRadarUpdate() {\n                doRadarUpdate = true;\n              }\n\n              function updateRadar() {\n                newLayer = L.tileLayer('https://radar-tiles.service.bom.gov.au/tiles/{time}/{z}/{x}/{y}.png', {\n                  time: getRadarTime(d.valueOf() - 600000),\n                  maxZoom: maxZoom,\n                  tileSize: 256,\n                  zoomOffset: 0,\n                  opacity: 0,\n                }).addTo(radarMap);\n                newTime = getRadarTimeString(d.valueOf() - 600000);\n\n                radarImage[0].remove();\n                for (i = 0; i < frameCount - 1; i++) {\n                  radarImage[i] = radarImage[i + 1];\n                  radarTime[i] = radarTime[i + 1];\n                }\n                radarImage[frameCount - 1] = newLayer;\n                radarTime[frameCount - 1] = newTime;\n                idx = 0;\n                doRadarUpdate = false;\n\n                setUpdateTimeout();\n              }\n\n              function getRadarTime(date) {\n                x = new Date(date);\n                return (\n                  x.getUTCFullYear().toString() +\n                  (x.getUTCMonth() + 1).toString().padStart(2, '0') +\n                  x\n                    .getUTCDate()\n                    .toString()\n                    .padStart(2, '0') +\n                  x\n                    .getUTCHours()\n                    .toString()\n                    .padStart(2, '0') +\n                  x\n                    .getUTCMinutes()\n                    .toString()\n                    .padStart(2, '0')\n                );\n              }\n\n              function getRadarTimeString(date) {\n                x = new Date(date);\n                return (\n                  weekday[x.getDay()] +\n                  ' ' +\n                  month[x.getMonth()] +\n                  ' ' +\n                  x\n                    .getDate()\n                    .toString()\n                    .padStart(2, '0') +\n                  ' ' +\n                  x\n                    .getHours()\n                    .toString()\n                    .padStart(2, '0') +\n                  ':' +\n                  x\n                    .getMinutes()\n                    .toString()\n                    .padStart(2, '0')\n                );\n              }\n\n              function nextFrame() {\n                if (run) {\n                  nextImage();\n                }\n                setTimeout(function() {\n                  nextFrame();\n                }, timeout);\n              }\n\n              function skipNext() {\n                if (idx == frameCount-1) {\n                  idx += 1;\n                }\n                nextImage();\n              }\n\n              function skipBack() {\n                if (idx == frameCount) {\n                  radarImage[frameCount - 1].setOpacity(0);\n                  idx -= 1;\n                } else if (idx < frameCount) {\n                  radarImage[idx].setOpacity(0);\n                }\n                idx -= 1;\n                if (doRadarUpdate && idx == 1) {\n                  updateRadar();\n                }\n                if (idx < 0) {\n                  idx = frameCount-1;\n                }\n                document.getElementById("progress-bar").style.width = (idx+1)*barSize+"px";\n                document.getElementById('timestamp').innerHTML = radarTime[idx];\n                radarImage[idx].setOpacity(1);\n              }\n\n              function nextImage() {\n                if (idx == frameCount) {\n                  radarImage[frameCount - 1].setOpacity(0);\n                } else if (idx < frameCount - 1) {\n                  radarImage[idx].setOpacity(0);\n                }\n                idx += 1;\n                if (doRadarUpdate && idx == 1) {\n                  updateRadar();\n                }\n                if (idx == frameCount + 1) {\n                  idx = 0;\n                }\n                if (idx != frameCount + 1) {\n                  document.getElementById("progress-bar").style.width = (idx+1)*barSize+"px";\n                }\n                if (idx < frameCount) {\n                  document.getElementById('timestamp').innerHTML = radarTime[idx];\n                  radarImage[idx].setOpacity(1);\n                }\n              }\n\n              function resizeWindow() {\n                this.document.getElementById("color-bar").width = this.frameElement.offsetWidth;\n                this.document.getElementById("img-color-bar").width = this.frameElement.offsetWidth;\n                this.document.getElementById("mapid").width = this.frameElement.offsetWidth;\n                this.document.getElementById("mapid").height = ${this.isPanel?this.offsetParent?this.offsetParent.clientHeight-34-(!0===this.editMode?59:0):492:void 0!==this._config.square_map&&this._config.square_map?this.getBoundingClientRect().width:492}\n                this.document.getElementById("div-progress-bar").width = this.frameElement.offsetWidth;\n                this.document.getElementById("bottom-container").width = this.frameElement.offsetWidth;\n                barSize = this.frameElement.offsetWidth/frameCount;\n              }\n            <\/script>\n          </span>\n        </body>\n      </html>\n    `,t=this.isPanel?this.offsetParent?this.offsetParent.clientHeight-(!0===this.editMode?59:0)+"px":"526px":void 0!==this._config.square_map&&this._config.square_map?`${this.getBoundingClientRect().width+34}px`:"526px";return M`
      <style>
        ${this.styles}
      </style>
      <ha-card class="type-iframe">
        <div id="root" style="padding-top: ${t}">
          <iframe srcdoc=${e} scrolling="no"></iframe>
        </div>
      </ha-card>
    `}showWarning(e){return M`
      <hui-warning>${e}</hui-warning>
    `}showError(e){const t=document.createElement("hui-error-card");return t.setConfig({type:"error",error:e,origConfig:this._config}),M`
      ${t}
    `}get styles(){return r`
      .text-container {
        font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;
      }
      #timestamp {
        margin: 2px 0px;
      }
      #color-bar {
        margin: 0px 0px;
      }
      ha-card {
        overflow: hidden;
      }
      #root {
        width: 100%;
        position: relative;
      }
      iframe {
        position: absolute;
        border: none;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    `}};e([Q({type:Boolean,reflect:!0})],we.prototype,"isPanel",void 0),e([Q()],we.prototype,"hass",void 0),e([Q()],we.prototype,"_config",void 0),e([Q()],we.prototype,"editMode",void 0),we=e([K("bom-radar-card")],we);export{we as BomRadarCard};
