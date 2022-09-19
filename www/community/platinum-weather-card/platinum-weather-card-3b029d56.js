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
var t=function(e,i){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},t(e,i)};function e(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}var i=function(){return i=Object.assign||function(t){for(var e,i=1,s=arguments.length;i<s;i++)for(var o in e=arguments[i])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t},i.apply(this,arguments)};function s(t,e,i,s){var o,n=arguments.length,r=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(r=(n<3?o(r):n>3?o(e,i,r):o(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r}function o(t){var e="function"==typeof Symbol&&Symbol.iterator,i=e&&t[e],s=0;if(i)return i.call(t);if(t&&"number"==typeof t.length)return{next:function(){return t&&s>=t.length&&(t=void 0),{value:t&&t[s++],done:!t}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const n=window,r=n.ShadowRoot&&(void 0===n.ShadyCSS||n.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),c=new WeakMap;class l{constructor(t,e,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(r&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=c.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&c.set(e,t))}return t}toString(){return this.cssText}}const h=r?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new l("string"==typeof t?t:t+"",void 0,a))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var d;const u=window,_=u.trustedTypes,p=_?_.emptyScript:"",g=u.reactiveElementPolyfillSupport,f={toAttribute(t,e){switch(e){case Boolean:t=t?p:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>e!==t&&(e==e||t==t),m={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:v};class y extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;null!==(e=this.h)&&void 0!==e||(this.h=[]),this.h.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))})),t}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const o=this[t];this[e]=s,this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||m}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(h(t))}else void 0!==t&&e.push(h(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{r?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),s=n.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=e.cssText,t.appendChild(i)}))})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=m){var s;const o=this.constructor._$Ep(t,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:f).toAttribute(e,i.type);this._$El=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,o=s._$Ev.get(t);if(void 0!==o&&this._$El!==o){const t=s.getPropertyOptions(o),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:f;this._$El=o,this[o]=n.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||v)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var b;y.finalized=!0,y.elementProperties=new Map,y.elementStyles=[],y.shadowRootOptions={mode:"open"},null==g||g({ReactiveElement:y}),(null!==(d=u.reactiveElementVersions)&&void 0!==d?d:u.reactiveElementVersions=[]).push("1.4.1");const w=window,$=w.trustedTypes,x=$?$.createPolicy("lit-html",{createHTML:t=>t}):void 0,S=`lit$${(Math.random()+"").slice(9)}$`,E="?"+S,O=`<${E}>`,N=document,A=(t="")=>N.createComment(t),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,C=Array.isArray,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,T=/-->/g,k=/>/g,F=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),L=/'/g,U=/"/g,D=/^(?:script|style|textarea|title)$/i,R=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),z=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),H=new WeakMap,V=N.createTreeWalker(N,129,null,!1);class j{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,n=0;const r=t.length-1,a=this.parts,[c,l]=((t,e)=>{const i=t.length-1,s=[];let o,n=2===e?"<svg>":"",r=P;for(let e=0;e<i;e++){const i=t[e];let a,c,l=-1,h=0;for(;h<i.length&&(r.lastIndex=h,c=r.exec(i),null!==c);)h=r.lastIndex,r===P?"!--"===c[1]?r=T:void 0!==c[1]?r=k:void 0!==c[2]?(D.test(c[2])&&(o=RegExp("</"+c[2],"g")),r=F):void 0!==c[3]&&(r=F):r===F?">"===c[0]?(r=null!=o?o:P,l=-1):void 0===c[1]?l=-2:(l=r.lastIndex-c[2].length,a=c[1],r=void 0===c[3]?F:'"'===c[3]?U:L):r===U||r===L?r=F:r===T||r===k?r=P:(r=F,o=void 0);const d=r===F&&t[e+1].startsWith("/>")?" ":"";n+=r===P?i+O:l>=0?(s.push(a),i.slice(0,l)+"$lit$"+i.slice(l)+S+d):i+S+(-2===l?(s.push(void 0),e):d)}const a=n+(t[i]||"<?>")+(2===e?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==x?x.createHTML(a):a,s]})(t,e);if(this.el=j.createElement(c,i),V.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=V.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith("$lit$")||e.startsWith(S)){const i=l[n++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+"$lit$").split(S),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:o,name:e[2],strings:t,ctor:"."===e[1]?G:"?"===e[1]?J:"@"===e[1]?X:K})}else a.push({type:6,index:o})}for(const e of t)s.removeAttribute(e)}if(D.test(s.tagName)){const t=s.textContent.split(S),e=t.length-1;if(e>0){s.textContent=$?$.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],A()),V.nextNode(),a.push({type:2,index:++o});s.append(t[e],A())}}}else if(8===s.nodeType)if(s.data===E)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(S,t+1));)a.push({type:7,index:o}),t+=S.length-1}o++}}static createElement(t,e){const i=N.createElement("template");return i.innerHTML=t,i}}function I(t,e,i=t,s){var o,n,r,a;if(e===z)return e;let c=void 0!==s?null===(o=i._$Cl)||void 0===o?void 0:o[s]:i._$Cu;const l=M(e)?void 0:e._$litDirective$;return(null==c?void 0:c.constructor)!==l&&(null===(n=null==c?void 0:c._$AO)||void 0===n||n.call(c,!1),void 0===l?c=void 0:(c=new l(t),c._$AT(t,i,s)),void 0!==s?(null!==(r=(a=i)._$Cl)&&void 0!==r?r:a._$Cl=[])[s]=c:i._$Cu=c),void 0!==c&&(e=I(t,c._$AS(t,e.values),c,s)),e}class B{constructor(t,e){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var e;const{el:{content:i},parts:s}=this._$AD,o=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:N).importNode(i,!0);V.currentNode=o;let n=V.nextNode(),r=0,a=0,c=s[0];for(;void 0!==c;){if(r===c.index){let e;2===c.type?e=new q(n,n.nextSibling,this,t):1===c.type?e=new c.ctor(n,c.name,c.strings,this,t):6===c.type&&(e=new Y(n,this,t)),this.v.push(e),c=s[++a]}r!==(null==c?void 0:c.index)&&(n=V.nextNode(),r++)}return o}m(t){let e=0;for(const i of this.v)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class q{constructor(t,e,i,s){var o;this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$C_=null===(o=null==s?void 0:s.isConnected)||void 0===o||o}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$C_}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=I(this,t,e),M(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==z&&this.$(t):void 0!==t._$litType$?this.T(t):void 0!==t.nodeType?this.k(t):(t=>C(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.O(t):this.$(t)}S(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}k(t){this._$AH!==t&&(this._$AR(),this._$AH=this.S(t))}$(t){this._$AH!==W&&M(this._$AH)?this._$AA.nextSibling.data=t:this.k(N.createTextNode(t)),this._$AH=t}T(t){var e;const{values:i,_$litType$:s}=t,o="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=j.createElement(s.h,this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===o)this._$AH.m(i);else{const t=new B(o,this),e=t.p(this.options);t.m(i),this.k(e),this._$AH=t}}_$AC(t){let e=H.get(t.strings);return void 0===e&&H.set(t.strings,e=new j(t)),e}O(t){C(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new q(this.S(A()),this.S(A()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$C_=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class K{constructor(t,e,i,s,o){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const o=this.strings;let n=!1;if(void 0===o)t=I(this,t,e,0),n=!M(t)||t!==this._$AH&&t!==z,n&&(this._$AH=t);else{const s=t;let r,a;for(t=o[0],r=0;r<o.length-1;r++)a=I(this,s[i+r],e,r),a===z&&(a=this._$AH[r]),n||(n=!M(a)||a!==this._$AH[r]),a===W?t=W:t!==W&&(t+=(null!=a?a:"")+o[r+1]),this._$AH[r]=a}n&&!s&&this.P(t)}P(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class G extends K{constructor(){super(...arguments),this.type=3}P(t){this.element[this.name]=t===W?void 0:t}}const Z=$?$.emptyScript:"";class J extends K{constructor(){super(...arguments),this.type=4}P(t){t&&t!==W?this.element.setAttribute(this.name,Z):this.element.removeAttribute(this.name)}}class X extends K{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=I(this,t,e,0))&&void 0!==i?i:W)===z)return;const s=this._$AH,o=t===W&&s!==W||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==W&&(s===W||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class Y{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){I(this,t)}}const Q=w.litHtmlPolyfillSupport;null==Q||Q(j,q),(null!==(b=w.litHtmlVersions)&&void 0!==b?b:w.litHtmlVersions=[]).push("2.3.1");
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tt=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,et=Symbol(),it=new Map;class st{constructor(t,e){if(this._$cssResult$=!0,e!==et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){let t=it.get(this.cssText);return tt&&void 0===t&&(it.set(this.cssText,t=new CSSStyleSheet),t.replaceSync(this.cssText)),t}toString(){return this.cssText}}const ot=t=>new st("string"==typeof t?t:t+"",et),nt=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new st(i,et)},rt=(t,e)=>{tt?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),s=window.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=e.cssText,t.appendChild(i)}))},at=tt?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return ot(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var ct;const lt=window.trustedTypes,ht=lt?lt.emptyScript:"",dt=window.reactiveElementPolyfillSupport,ut={toAttribute(t,e){switch(e){case Boolean:t=t?ht:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},_t=(t,e)=>e!==t&&(e==e||t==t),pt={attribute:!0,type:String,converter:ut,reflect:!1,hasChanged:_t};class gt extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(t){var e;null!==(e=this.l)&&void 0!==e||(this.l=[]),this.l.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Eh(i,e);void 0!==s&&(this._$Eu.set(s,i),t.push(s))})),t}static createProperty(t,e=pt){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const o=this[t];this[e]=s,this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||pt}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(at(t))}else void 0!==t&&e.push(at(t));return e}static _$Eh(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Em(),this.requestUpdate(),null===(t=this.constructor.l)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$Eg)&&void 0!==e?e:this._$Eg=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$Eg)||void 0===e||e.splice(this._$Eg.indexOf(t)>>>0,1)}_$Em(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Et.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return rt(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ES(t,e,i=pt){var s,o;const n=this.constructor._$Eh(t,i);if(void 0!==n&&!0===i.reflect){const r=(null!==(o=null===(s=i.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==o?o:ut.toAttribute)(e,i.type);this._$Ei=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$Ei=null}}_$AK(t,e){var i,s,o;const n=this.constructor,r=n._$Eu.get(t);if(void 0!==r&&this._$Ei!==r){const t=n.getPropertyOptions(r),a=t.converter,c=null!==(o=null!==(s=null===(i=a)||void 0===i?void 0:i.fromAttribute)&&void 0!==s?s:"function"==typeof a?a:null)&&void 0!==o?o:ut.fromAttribute;this._$Ei=r,this[r]=c(e,t.type),this._$Ei=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||_t)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$Ei!==t&&(void 0===this._$E_&&(this._$E_=new Map),this._$E_.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$Ep=this._$EC())}async _$EC(){this.isUpdatePending=!0;try{await this._$Ep}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach(((t,e)=>this[e]=t)),this._$Et=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$Eg)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return!0}update(t){void 0!==this._$E_&&(this._$E_.forEach(((t,e)=>this._$ES(e,this[e],t))),this._$E_=void 0),this._$EU()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ft,vt;gt.finalized=!0,gt.elementProperties=new Map,gt.elementStyles=[],gt.shadowRootOptions={mode:"open"},null==dt||dt({ReactiveElement:gt}),(null!==(ct=globalThis.reactiveElementVersions)&&void 0!==ct?ct:globalThis.reactiveElementVersions=[]).push("1.2.1");class mt extends gt{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=((t,e,i)=>{var s,o;const n=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let r=n._$litPart$;if(void 0===r){const t=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:null;n._$litPart$=r=new q(e.insertBefore(A(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!1)}render(){return z}}mt.finalized=!0,mt._$litElement$=!0,null===(ft=globalThis.litElementHydrateSupport)||void 0===ft||ft.call(globalThis,{LitElement:mt});const yt=globalThis.litElementPolyfillSupport;null==yt||yt({LitElement:mt}),(null!==(vt=globalThis.litElementVersions)&&void 0!==vt?vt:globalThis.litElementVersions=[]).push("3.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bt=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(e){customElements.define(t,e)}}})(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,wt=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function $t(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):wt(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function xt(t){return $t({...t,state:!0})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const St=({finisher:t,descriptor:e})=>(i,s)=>{var o;if(void 0===s){const s=null!==(o=i.originalKey)&&void 0!==o?o:i.key,n=null!=e?{kind:"method",placement:"prototype",key:s,descriptor:e(i.key)}:{...i,key:s};return null!=t&&(n.finisher=function(e){t(e,s)}),n}{const o=i.constructor;void 0!==e&&Object.defineProperty(i,s,e(s)),null==t||t(o,s)}}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var Et;const Ot=null!=(null===(Et=window.HTMLSlotElement)||void 0===Et?void 0:Et.prototype.assignedElements)?(t,e)=>t.assignedElements(e):(t,e)=>t.assignedNodes(e).filter((t=>t.nodeType===Node.ELEMENT_NODE));function Nt(t){const{slot:e,selector:i}=null!=t?t:{};return St({descriptor:s=>({get(){var s;const o="slot"+(e?`[name=${e}]`:":not([name])"),n=null===(s=this.renderRoot)||void 0===s?void 0:s.querySelector(o),r=null!=n?Ot(n,t):[];return i?r.filter((t=>t.matches(i))):r},enumerable:!0,configurable:!0})})}var At,Mt,Ct=function(t){return new Intl.DateTimeFormat(t.language,{year:"numeric",month:"long",day:"numeric"})};!function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(At||(At={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(Mt||(Mt={}));var Pt=function(t){if(t.time_format===Mt.language||t.time_format===Mt.system){var e=t.time_format===Mt.language?t.language:void 0,i=(new Date).toLocaleString(e);return i.includes("AM")||i.includes("PM")}return t.time_format===Mt.am_pm},Tt=function(t){return new Intl.DateTimeFormat(t.language,{year:"numeric",month:"long",day:"numeric",hour:Pt(t)?"numeric":"2-digit",minute:"2-digit",hour12:Pt(t)})},kt=function(t){return new Intl.DateTimeFormat(t.language,{hour:"numeric",minute:"2-digit",hour12:Pt(t)})},Ft=function(t,e,i,s){s=s||{},i=null==i?{}:i;var o=new Event(e,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return o.detail=i,t.dispatchEvent(o),o},Lt=function(){if("undefined"!=typeof Map)return Map;function t(t,e){var i=-1;return t.some((function(t,s){return t[0]===e&&(i=s,!0)})),i}return function(){function e(){this.__entries__=[]}return Object.defineProperty(e.prototype,"size",{get:function(){return this.__entries__.length},enumerable:!0,configurable:!0}),e.prototype.get=function(e){var i=t(this.__entries__,e),s=this.__entries__[i];return s&&s[1]},e.prototype.set=function(e,i){var s=t(this.__entries__,e);~s?this.__entries__[s][1]=i:this.__entries__.push([e,i])},e.prototype.delete=function(e){var i=this.__entries__,s=t(i,e);~s&&i.splice(s,1)},e.prototype.has=function(e){return!!~t(this.__entries__,e)},e.prototype.clear=function(){this.__entries__.splice(0)},e.prototype.forEach=function(t,e){void 0===e&&(e=null);for(var i=0,s=this.__entries__;i<s.length;i++){var o=s[i];t.call(e,o[1],o[0])}},e}()}(),Ut="undefined"!=typeof window&&"undefined"!=typeof document&&window.document===document,Dt="undefined"!=typeof global&&global.Math===Math?global:"undefined"!=typeof self&&self.Math===Math?self:"undefined"!=typeof window&&window.Math===Math?window:Function("return this")(),Rt="function"==typeof requestAnimationFrame?requestAnimationFrame.bind(Dt):function(t){return setTimeout((function(){return t(Date.now())}),1e3/60)};var zt=["top","right","bottom","left","width","height","size","weight"],Wt="undefined"!=typeof MutationObserver,Ht=function(){function t(){this.connected_=!1,this.mutationEventsAdded_=!1,this.mutationsObserver_=null,this.observers_=[],this.onTransitionEnd_=this.onTransitionEnd_.bind(this),this.refresh=function(t,e){var i=!1,s=!1,o=0;function n(){i&&(i=!1,t()),s&&a()}function r(){Rt(n)}function a(){var t=Date.now();if(i){if(t-o<2)return;s=!0}else i=!0,s=!1,setTimeout(r,e);o=t}return a}(this.refresh.bind(this),20)}return t.prototype.addObserver=function(t){~this.observers_.indexOf(t)||this.observers_.push(t),this.connected_||this.connect_()},t.prototype.removeObserver=function(t){var e=this.observers_,i=e.indexOf(t);~i&&e.splice(i,1),!e.length&&this.connected_&&this.disconnect_()},t.prototype.refresh=function(){this.updateObservers_()&&this.refresh()},t.prototype.updateObservers_=function(){var t=this.observers_.filter((function(t){return t.gatherActive(),t.hasActive()}));return t.forEach((function(t){return t.broadcastActive()})),t.length>0},t.prototype.connect_=function(){Ut&&!this.connected_&&(document.addEventListener("transitionend",this.onTransitionEnd_),window.addEventListener("resize",this.refresh),Wt?(this.mutationsObserver_=new MutationObserver(this.refresh),this.mutationsObserver_.observe(document,{attributes:!0,childList:!0,characterData:!0,subtree:!0})):(document.addEventListener("DOMSubtreeModified",this.refresh),this.mutationEventsAdded_=!0),this.connected_=!0)},t.prototype.disconnect_=function(){Ut&&this.connected_&&(document.removeEventListener("transitionend",this.onTransitionEnd_),window.removeEventListener("resize",this.refresh),this.mutationsObserver_&&this.mutationsObserver_.disconnect(),this.mutationEventsAdded_&&document.removeEventListener("DOMSubtreeModified",this.refresh),this.mutationsObserver_=null,this.mutationEventsAdded_=!1,this.connected_=!1)},t.prototype.onTransitionEnd_=function(t){var e=t.propertyName,i=void 0===e?"":e;zt.some((function(t){return!!~i.indexOf(t)}))&&this.refresh()},t.getInstance=function(){return this.instance_||(this.instance_=new t),this.instance_},t.instance_=null,t}(),Vt=function(t,e){for(var i=0,s=Object.keys(e);i<s.length;i++){var o=s[i];Object.defineProperty(t,o,{value:e[o],enumerable:!1,writable:!1,configurable:!0})}return t},jt=function(t){return t&&t.ownerDocument&&t.ownerDocument.defaultView||Dt},It=Jt(0,0,0,0);function Bt(t){return parseFloat(t)||0}function qt(t){for(var e=[],i=1;i<arguments.length;i++)e[i-1]=arguments[i];return e.reduce((function(e,i){return e+Bt(t["border-"+i+"-width"])}),0)}function Kt(t){var e=t.clientWidth,i=t.clientHeight;if(!e&&!i)return It;var s=jt(t).getComputedStyle(t),o=function(t){for(var e={},i=0,s=["top","right","bottom","left"];i<s.length;i++){var o=s[i],n=t["padding-"+o];e[o]=Bt(n)}return e}(s),n=o.left+o.right,r=o.top+o.bottom,a=Bt(s.width),c=Bt(s.height);if("border-box"===s.boxSizing&&(Math.round(a+n)!==e&&(a-=qt(s,"left","right")+n),Math.round(c+r)!==i&&(c-=qt(s,"top","bottom")+r)),!function(t){return t===jt(t).document.documentElement}(t)){var l=Math.round(a+n)-e,h=Math.round(c+r)-i;1!==Math.abs(l)&&(a-=l),1!==Math.abs(h)&&(c-=h)}return Jt(o.left,o.top,a,c)}var Gt="undefined"!=typeof SVGGraphicsElement?function(t){return t instanceof jt(t).SVGGraphicsElement}:function(t){return t instanceof jt(t).SVGElement&&"function"==typeof t.getBBox};function Zt(t){return Ut?Gt(t)?function(t){var e=t.getBBox();return Jt(0,0,e.width,e.height)}(t):Kt(t):It}function Jt(t,e,i,s){return{x:t,y:e,width:i,height:s}}var Xt=function(){function t(t){this.broadcastWidth=0,this.broadcastHeight=0,this.contentRect_=Jt(0,0,0,0),this.target=t}return t.prototype.isActive=function(){var t=Zt(this.target);return this.contentRect_=t,t.width!==this.broadcastWidth||t.height!==this.broadcastHeight},t.prototype.broadcastRect=function(){var t=this.contentRect_;return this.broadcastWidth=t.width,this.broadcastHeight=t.height,t},t}(),Yt=function(t,e){var i=function(t){var e=t.x,i=t.y,s=t.width,o=t.height,n="undefined"!=typeof DOMRectReadOnly?DOMRectReadOnly:Object,r=Object.create(n.prototype);return Vt(r,{x:e,y:i,width:s,height:o,top:i,right:e+s,bottom:o+i,left:e}),r}(e);Vt(this,{target:t,contentRect:i})},Qt=function(){function t(t,e,i){if(this.activeObservations_=[],this.observations_=new Lt,"function"!=typeof t)throw new TypeError("The callback provided as parameter 1 is not a function.");this.callback_=t,this.controller_=e,this.callbackCtx_=i}return t.prototype.observe=function(t){if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");if("undefined"!=typeof Element&&Element instanceof Object){if(!(t instanceof jt(t).Element))throw new TypeError('parameter 1 is not of type "Element".');var e=this.observations_;e.has(t)||(e.set(t,new Xt(t)),this.controller_.addObserver(this),this.controller_.refresh())}},t.prototype.unobserve=function(t){if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");if("undefined"!=typeof Element&&Element instanceof Object){if(!(t instanceof jt(t).Element))throw new TypeError('parameter 1 is not of type "Element".');var e=this.observations_;e.has(t)&&(e.delete(t),e.size||this.controller_.removeObserver(this))}},t.prototype.disconnect=function(){this.clearActive(),this.observations_.clear(),this.controller_.removeObserver(this)},t.prototype.gatherActive=function(){var t=this;this.clearActive(),this.observations_.forEach((function(e){e.isActive()&&t.activeObservations_.push(e)}))},t.prototype.broadcastActive=function(){if(this.hasActive()){var t=this.callbackCtx_,e=this.activeObservations_.map((function(t){return new Yt(t.target,t.broadcastRect())}));this.callback_.call(t,e,t),this.clearActive()}},t.prototype.clearActive=function(){this.activeObservations_.splice(0)},t.prototype.hasActive=function(){return this.activeObservations_.length>0},t}(),te="undefined"!=typeof WeakMap?new WeakMap:new Lt,ee=function t(e){if(!(this instanceof t))throw new TypeError("Cannot call a class as a function.");if(!arguments.length)throw new TypeError("1 argument required, but only 0 present.");var i=Ht.getInstance(),s=new Qt(e,i,this);te.set(this,s)};["observe","unobserve","disconnect"].forEach((function(t){ee.prototype[t]=function(){var e;return(e=te.get(this))[t].apply(e,arguments)}}));var ie=void 0!==Dt.ResizeObserver?Dt.ResizeObserver:ee;const se=t=>t.locale||{language:t.language,number_format:At.system};const oe=(t,e,i)=>{if("unknown"===e.state||"unavailable"===e.state)return t(`state.default.${e.state}`);if(e.attributes.unit_of_measurement)return`${e.state}${e.attributes.unit_of_measurement}`;const s=e.entity_id.split(".")[0];if("input_datetime"===s){let t;if(!e.attributes.has_time)return t=new Date(e.attributes.year,e.attributes.month-1,e.attributes.day),function(t,e){return Ct(e).format(t)}(t,i);if(!e.attributes.has_date){const s=new Date;return t=new Date(s.getFullYear(),s.getMonth(),s.getDay(),e.attributes.hour,e.attributes.minute),function(t,e){return kt(e).format(t)}(t,i)}return t=new Date(e.attributes.year,e.attributes.month-1,e.attributes.day,e.attributes.hour,e.attributes.minute),function(t,e){return Tt(e).format(t)}(t,i)}return e.attributes.device_class&&t(`component.${s}.state.${e.attributes.device_class}.${e.state}`)||t(`component.${s}.state._.${e.state}`)||e.state};console.info("%c  PLATINUM-WEATHER-CARD  \n%c  Version 0.0.4          ","color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),window.customCards=window.customCards||[],window.customCards.push({type:"platinum-weather-card",name:"Platinum Weather Card",description:"An fully customisable weather card with a GUI configuration"});let ne=class extends mt{constructor(){super(...arguments),this._cardWidth=492,this._error=[]}static async getConfigElement(){return await import("./editor-26b1b33b.js"),document.createElement("platinum-weather-card-editor")}static getStubConfig(){return{}}getCardSize(){var t=16;if(!1!==this._config.show_section_overview&&("observations"!==this._config.overview_layout&&(t+=void 0!==this._config.text_card_title?37:0,t+=void 0!==this._config.text_card_title_2?37:0,t+=void 0!==this._config.entity_update_time?21:0),"observations"===this._config.overview_layout?t+=80:t+=void 0!==this._config.entity_current_text?153:128),!1!==this._config.show_section_extended&&(t+=17,t+=this._config.entity_daily_summary?40:0,t+=void 0!==this._config.entity_todays_uv_forecast||void 0!==this._config.entity_todays_fire_danger?20:0),!1!==this._config.show_section_slots){var e=("remove"!==this._config.slot_l1?1:0)+("remove"!==this._config.slot_l2?1:0)+("remove"!==this._config.slot_l3?1:0)+("remove"!==this._config.slot_l4?1:0)+("remove"!==this._config.slot_l5?1:0)+(void 0!==this._config.slot_l6&&"remove"!==this._config.slot_l6?1:0)+(void 0!==this._config.slot_l7&&"remove"!==this._config.slot_l7?1:0)+(void 0!==this._config.slot_l8&&"remove"!==this._config.slot_l8?1:0),i=("remove"!==this._config.slot_r1?1:0)+("remove"!==this._config.slot_r2?1:0)+("remove"!==this._config.slot_r3?1:0)+("remove"!==this._config.slot_r4?1:0)+("remove"!==this._config.slot_r5?1:0)+(void 0!==this._config.slot_r6&&"remove"!==this._config.slot_r6?1:0)+(void 0!==this._config.slot_r7&&"remove"!==this._config.slot_r7?1:0)+(void 0!==this._config.slot_r8&&"remove"!==this._config.slot_r8?1:0);t+=16+24*Math.max(e,i)}!1!==this._config.show_section_daily_forecast&&("vertical"!==this._config.daily_forecast_layout?t+=146:(t+=18+88*(this._config.daily_forecast_days||5),0!==this._config.daily_extended_forecast_days&&(t+=49*Math.min(this._config.daily_forecast_days||5,this._config.daily_extended_forecast_days||7))));return Math.ceil(t/50)}setConfig(t){if(!t)throw new Error("Invalid configuration");t.test_gui&&function(){var t=document.querySelector("home-assistant");if(t=(t=(t=(t=(t=(t=(t=(t=t&&t.shadowRoot)&&t.querySelector("home-assistant-main"))&&t.shadowRoot)&&t.querySelector("app-drawer-layout partial-panel-resolver"))&&t.shadowRoot||t)&&t.querySelector("ha-panel-lovelace"))&&t.shadowRoot)&&t.querySelector("hui-root")){var e=t.lovelace;return e.current_view=t.___curView,e}return null}().setEditMode(!0),this._config=Object.assign({name:"Weather"},t)}shouldUpdate(t){if(!this._config)return!1;const e=t.get("hass")||void 0;if(!e||e.themes!==this.hass.themes||e.locale!==this.hass.locale)return!0;if(!1===Object.keys(this._config).every((t=>null===t.match(/^entity_/)||e.states[this._config[t]]===this.hass.states[this._config[t]])))return!0;if(this._config.show_section_daily_forecast){const t=this._config.daily_forecast_days||5;for(const s of["entity_forecast_icon_1","entity_summary_1","entity_forecast_low_temp_1","entity_forecast_high_temp_1","entity_pop_1","entity_pos_1"])if(void 0!==this._config[s]&&null===this._config[s].match("^weather.")){const o=this._config[s].match(/(\d+)(?!.*\d)/g);if(o)for(var i=1;i<t;i++){const t=this._config[s].replace(/(\d+)(?!.*\d)/g,Number(o)+i);if(e.states[t]!==this.hass.states[t])return!0}}}return t.has("config")}firstUpdated(){this._resize(),this._attachObserver(),console.info(`Initial cardwdith = ${this._cardWidth}`)}_attachObserver(){var t;this._resizeObserver||(this._resizeObserver=new ie(function(t,e,i){var s;return void 0===i&&(i=!1),function(){var o=[].slice.call(arguments),n=this,r=function(){s=null,i||t.apply(n,o)},a=i&&!s;clearTimeout(s),s=setTimeout(r,e),a&&t.apply(n,o)}}((()=>this._resize()),250,!1)));(null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card"))&&this._resizeObserver.observe(this)}_resize(){var t;if(!this.isConnected)return;const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");e&&(this._cardWidth=e.getBoundingClientRect().width,console.info(`Resize cardwdith = ${this._cardWidth}`))}_checkForErrors(){this._error=[],Object.keys(this._config).forEach((t=>{null!==t.match(/^entity_/)&&void 0===this.hass.states[this._config[t]]&&this._error.push(`'${t}=${this._config[t]}' not found`)}));const t=this._config.daily_forecast_days||5;for(const i of["entity_forecast_icon_1","entity_summary_1","entity_forecast_low_temp_1","entity_forecast_high_temp_1","entity_pop_1","entity_pos_1"])if(void 0!==this._config[i]){const s=this.hass.states[this._config[i]];if(this._config[i].match("^weather."))for(var e=1;e<=t;e++){const t=new Date;switch(t.setDate(t.getDate()+e),i){case"entity_forecast_icon_1":void 0===this._getForecastPropFromWeather(s.attributes.forecast,t,"condition")&&this._error.push(`'${i} attribute forecast[${e}].condition not found`);break;case"entity_forecast_low_temp_1":void 0===this._getForecastPropFromWeather(s.attributes.forecast,t,"templow")&&this._error.push(`'${i} attribute forecast[${e}].templow not found`);break;case"entity_forecast_high_temp_1":void 0===this._getForecastPropFromWeather(s.attributes.forecast,t,"temperature")&&this._error.push(`'${i} attribute forecast[${e}].temperature not found`);break;case"entity_pop_1":void 0===this._getForecastPropFromWeather(s.attributes.forecast,t,"precipitation_probability")&&this._error.push(`'${i} attribute forecast[${e}].precipitation_probability not found`);break;case"entity_pos_1":void 0===this._getForecastPropFromWeather(s.attributes.forecast,t,"precipitation")&&this._error.push(`'${i} attribute forecast[${e}].precipitation not found`)}}else{const s=this._config[i].match(/(\d+)(?!.*\d)/g);if(s)for(e=1;e<t;e++){const t=this._config[i].replace(/(\d+)(?!.*\d)/g,Number(s)+e);void 0===this.hass.states[t]&&this._error.push(`'${i}'+${e}=${t}' not found`)}else this._error.push(`'${i}=${this._config[i]}' value needs to have a number`)}}return 0!==this._error.length}_renderUpdateTime(){if(this._config.entity_update_time&&this.hass.states[this._config.entity_update_time]&&void 0!==this.hass.states[this._config.entity_update_time].state)if(!0===this._config.update_time_use_attr){if(void 0!==this._config.update_time_name_attr){const t=this._config.update_time_name_attr.toLowerCase().split(".").reduce(((t,e)=>void 0!==t?t[e]:void 0),this.hass.states[this._config.entity_update_time].attributes);if(void 0!==t){const e=new Date(`${t}`);switch(this.timeFormat){case"12hour":return R`${e.toLocaleString(this.locale||navigator.language,{hour:"numeric",minute:"2-digit",hour12:!0}).replace(" ","")+", "+e.toLocaleDateString(this.locale,{weekday:"short",day:"numeric",month:"short",year:"numeric"}).replace(",","")}`;case"24hour":return R`${e.toLocaleString(this.locale||navigator.language,{hour:"2-digit",minute:"2-digit",hour12:!1})+", "+e.toLocaleDateString(this.locale,{weekday:"short",day:"numeric",month:"short",year:"numeric"}).replace(",","")}`;case"system":return R`${e.toLocaleTimeString(navigator.language,{timeStyle:"short"}).replace(" ","")+", "+e.toLocaleDateString(navigator.language).replace(",","")}`}}}}else{const t=new Date(this.hass.states[this._config.entity_update_time].state);switch(this.timeFormat){case"12hour":return R`${t.toLocaleString(this.locale||navigator.language,{hour:"numeric",minute:"2-digit",hour12:!0}).replace(" ","")+", "+t.toLocaleDateString(this.locale,{weekday:"short",day:"numeric",month:"short",year:"numeric"}).replace(",","")}`;case"24hour":return R`${t.toLocaleString(this.locale||navigator.language,{hour:"2-digit",minute:"2-digit",hour12:!1})+", "+t.toLocaleDateString(this.locale,{weekday:"short",day:"numeric",month:"short",year:"numeric"}).replace(",","")}`;case"system":return R`${t.toLocaleTimeString(navigator.language,{timeStyle:"short"}).replace(" ","")+", "+t.toLocaleDateString(navigator.language).replace(",","")}`}}return R`---`}_renderCompleteOverviewSection(){var t,e;if(!1===(null===(t=this._config)||void 0===t?void 0:t.show_section_overview))return R``;const i=this._weatherIcon(this.currentConditions),s=new URL((this._config.option_static_icons?"s-":"a-")+i+".svg",import.meta.url),o="unknown"!==i?"":`Unknown condition\n${this.currentConditions}`,n="unknown"!==i?R``:R`<div class="unknown-condition">${this.currentConditions}</div>`,r=R`<div class="big-icon"><img src="${s.href}" width="100%" height="100%" title="${o}"></div>`,a=R`
      <div class="current-temp">
        <div class="temp" id="current-temp-text">${this.currentTemperature}</div>
        <div class="unit-temp-big">${this.getUOM("temperature")}</div>
      </div>
    `,c=this.currentApparentTemperature,l=""!=c?R`
      <div class="apparent-temp">
        <div class="apparent">${this.localeTextFeelsLike}&nbsp;${c}</div>
        <div class="unit-temp-small"> ${this.getUOM("temperature")}</div>
      </div>
    `:R``,h=!0===this._config.show_separator?R`<hr class=line>`:"",d=this._config.entity_current_text&&this.hass.states[this._config.entity_current_text]?null!==(e=R`<div class="current-text">${oe(this.hass.localize,this.hass.states[this._config.entity_current_text],se(this.hass))}</div>`)&&void 0!==e?e:R`<div class="current-text">---</div>`:R``;return R`
      <div class="overview-section section">
        ${this._config.text_card_title?R`<div class="card-header">${this._config.text_card_title}</div>`:R``}
        ${this._config.text_card_title_2?R`<div class="card-header">${this._config.text_card_title_2}</div>`:R``}
        ${this._config.entity_update_time?R`<div class="updated">${this._config.text_update_time_prefix?this._config.text_update_time_prefix+" ":""}${this._renderUpdateTime()}</div>`:R``}
        <div class="overview-top">
          <div class="top-left">${r}${n}</div>
          <div class="currentTemps">${a}${l}</div>
        </div>
        ${d}
        ${h}
      </div>
    `}_renderObservationsOverviewSection(){var t;if(!1===(null===(t=this._config)||void 0===t?void 0:t.show_section_overview))return R``;const e=this._cardWidth>=344?" stacked":"",i=R`
      <div class="current-temp">
        <div class="temp" id="current-temp-text">${this.currentTemperature}</div>
        <div class="unit-temp-big">${this.getUOM("temperature")}</div>
      </div>
    `,s=this.currentApparentTemperature,o=""!=s?R`
      <div class="apparent-temp">
        <div class="apparent">${this.localeTextFeelsLike}&nbsp;${s}</div>
        <div class="unit-temp-small"> ${this.getUOM("temperature")}</div>
      </div>
    `:R``,n=!0===this._config.show_separator?R`<hr class=line>`:"";return R`
      <div class="overview-section section${e}">
        ${this._config.text_card_title?R`<div class="card-header">${this._config.text_card_title}</div>`:R``}
        ${this._config.text_card_title_2?R`<div class="card-header">${this._config.text_card_title_2}</div>`:R``}
        ${this._config.entity_update_time?R`<div class="updated">${this._config.text_update_time_prefix?this._config.text_update_time_prefix+" ":""}${this._renderUpdateTime()}</div>`:R``}
      </div>
      <div class="overview-section section">
        <div class="overview-top">
          <div class="top-left-obs"></div>
          <div class="currentTemps">${i}${o}</div>
        </div>
        ${n}
      </div>
    `}_renderForecastOverviewSection(){var t,e;if(!1===(null===(t=this._config)||void 0===t?void 0:t.show_section_overview))return R``;const i=this._weatherIcon(this.currentConditions),s=new URL((this._config.option_static_icons?"s-":"a-")+i+".svg",import.meta.url),o="unknown"!==i?"":`Unknown condition\n${this.currentConditions}`,n="unknown"!==i?R``:R`<div class="unknown-condition">${this.currentConditions}</div>`,r=R`<div class="big-icon"><img src="${s.href}" width="100%" height="100%" title="${o}"></div>`,a=!0===this._config.show_separator?R`<hr class=line>`:"",c=this._config.entity_current_text&&this.hass.states[this._config.entity_current_text]?null!==(e=R`<div class="current-text-right">${oe(this.hass.localize,this.hass.states[this._config.entity_current_text],se(this.hass))}</div>`)&&void 0!==e?e:R`<div class="current-text-right">---</div>`:R``;return R`
      <div class="overview-section section">
        ${this._config.text_card_title?R`<div class="card-header">${this._config.text_card_title}</div>`:R``}
        ${this._config.text_card_title_2?R`<div class="card-header">${this._config.text_card_title_2}</div>`:R``}
        ${this._config.entity_update_time?R`<div class="updated">${this._config.text_update_time_prefix?this._config.text_update_time_prefix+" ":""}${this._renderUpdateTime()}</div>`:R``}
        <div class="overview-top">
          <div class="top-left">${r}${n}</div>
          ${c}
        </div>
        ${a}
      </div>
    `}_renderOverviewSection(){var t;if(!1===(null===(t=this._config)||void 0===t?void 0:t.show_section_overview))return R``;switch(this._config.overview_layout||"complete"){case"observations":return this._renderObservationsOverviewSection();case"forecast":return this._renderForecastOverviewSection();default:return this._renderCompleteOverviewSection()}}_renderExtendedSection(){var t;if(!1===(null===(t=this._config)||void 0===t?void 0:t.show_section_extended)||void 0===this._config.entity_daily_summary&&void 0===this._config.entity_todays_uv_forecast&&void 0===this._config.entity_todays_fire_danger)return R``;const e=this._config.entity_daily_summary||"";var i=[];if(void 0!==this.hass.states[e])if(!0===this._config.extended_use_attr){if(void 0!==this._config.extended_name_attr){const t=this._config.extended_name_attr.toLowerCase().split(".").reduce(((t,e)=>void 0!==t?t[e]:void 0),this.hass.states[e].attributes);void 0!==t&&i.push(R`${t}`)}}else void 0!==this.hass.states[e]&&i.push(R`${this.hass.states[e].state}`);return i.push(R`${this._config.entity_todays_uv_forecast&&this.hass.states[this._config.entity_todays_uv_forecast]&&"unknown"!==this.hass.states[this._config.entity_todays_uv_forecast].state?" "+this.hass.states[this._config.entity_todays_uv_forecast].state:""}`),i.push(R`${this._config.entity_todays_fire_danger&&this.hass.states[this._config.entity_todays_fire_danger]&&"unknown"!==this.hass.states[this._config.entity_todays_fire_danger].state?" "+this.hass.states[this._config.entity_todays_fire_danger].state:""}`),R`
      <div class="extended-section section">
        <div class="f-extended">
          ${i}
        </div>
      </div>
    `}_renderSlotsSection(){var t;if(!1===(null===(t=this._config)||void 0===t?void 0:t.show_section_slots))return R``;var e=!0===this._config.use_old_column_format?R`
      <div>
        <ul class="variations-ugly">
          <li>
            <ul class="slot-list">${this.slotL1}${this.slotL2}${this.slotL3}${this.slotL4}${this.slotL5}${this.slotL6}${this.slotL7}${this.slotL8}</ul>
          </li>
          <li>
            <ul class="slot-list">${this.slotR1}${this.slotR2}${this.slotR3}${this.slotR4}${this.slotR5}${this.slotR6}${this.slotR7}${this.slotR8}</ul>
          </li>
        </ul>
      </div>
    `:R`
      <div>
        <ul class="variations">
          <li class="slot-list-item-1">
            <ul class="slot-list">
              ${this.slotL1}${this.slotL2}${this.slotL3}${this.slotL4}${this.slotL5}${this.slotL6}${this.slotL7}${this.slotL8}
            </ul>
          </li>
          <li>
            <ul class="slot-list">
              ${this.slotR1}${this.slotR2}${this.slotR3}${this.slotR4}${this.slotR5}${this.slotR6}${this.slotR7}${this.slotR8}
            </ul>
          </li>
        </ul>
      </div>
    `;return R`
      <div class="slot-section section">${e}</div>
    `}_renderHorizontalDailyForecastSection(){var t,e,i,s,o,n,r;const a=[],c=this._config.daily_forecast_days||5;for(var l=0;l<c;l++){const c=new Date;var h,d,u;if(c.setDate(c.getDate()+l+1),null===(t=this._config.entity_forecast_icon_1)||void 0===t?void 0:t.match("^weather.")){const t=this._config.entity_forecast_icon_1,e=this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,c,"condition");if(void 0===e)break;const i=new URL(((this._config.option_static_icons?"s-":"a-")+(t&&e?this._weatherIcon(e):"unknown")+".svg").replace("-night","-day"),import.meta.url);h=R`<li class="f-slot-horiz-icon"><i class="icon" style="background: none, url(${i.href}) no-repeat; background-size: contain;"></i></li>`}else{var _=!!this._config.entity_forecast_icon_1&&this._config.entity_forecast_icon_1.match(/(\d+)(?!.*\d)/g);const t=this._config.entity_forecast_icon_1?this._config.entity_forecast_icon_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+l)):void 0,e=new URL(((this._config.option_static_icons?"s-":"a-")+(t&&this.hass.states[t]?this._weatherIcon(this.hass.states[t].state):"unknown")+".svg").replace("-night","-day"),import.meta.url);h=R`<i class="icon" style="background: none, url(${e.href}) no-repeat; background-size: contain;"></i>`}d=(null===(e=this._config.entity_forecast_high_temp_1)||void 0===e?void 0:e.match("^weather."))?this._getForecastPropFromWeather(this.hass.states[this._config.entity_forecast_high_temp_1].attributes.forecast,c,"temperature"):(_=!!this._config.entity_forecast_high_temp_1&&this._config.entity_forecast_high_temp_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_forecast_high_temp_1?this.hass.states[this._config.entity_forecast_high_temp_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+l))].state:void 0,u=(null===(i=this._config.entity_forecast_low_temp_1)||void 0===i?void 0:i.match("^weather."))?this._getForecastPropFromWeather(this.hass.states[this._config.entity_forecast_low_temp_1].attributes.forecast,c,"templow"):(_=!!this._config.entity_forecast_low_temp_1&&this._config.entity_forecast_low_temp_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_forecast_low_temp_1?this.hass.states[this._config.entity_forecast_low_temp_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+l))].state:void 0;const y=R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`,b=!0===this._config.old_daily_format?R`
          <li class="f-slot-horiz-text">
            <span>
              <div class="slot-text highTemp">${d?Math.round(Number(d)):"---"}</div>
              ${y}
            </span>
          </li>
          <li class="f-slot-horiz-text">
            <span>
              <div class="slot-text lowTemp">${u?Math.round(Number(u)):"---"}</div>
              ${y}
            </span>
          </li>`:"highlow"===this._config.tempformat?R`
            <li class="f-slot-horiz-text">
              <span>
                <div class="slot-text highTemp">${d?Math.round(Number(d)):"---"}</div>
                <div class="slot-text slash">/</div>
                <div class="slot-text lowTemp">${u?Math.round(Number(u)):"---"}</div>
                ${y}
              </span>
            </li>`:R`
            <li class="f-slot-horiz-text">
              <span>
                <div class="slot-text lowTemp">${u?Math.round(Number(u)):"---"}</div>
                <div class="slot-text slash">/</div>
                <div class="slot-text highTemp">${d?Math.round(Number(d)):"---"}</div>
                ${y}
              </span>
            </li>
          `;var p,g,f;if(null===(s=this._config.entity_pop_1)||void 0===s?void 0:s.match("^weather.")){const t=this._config.entity_pop_1,e=this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,c,"precipitation_probability");p=t?R`<li class="f-slot-horiz-text"><span><div class="slot-text pop">${this.hass.states[t]&&void 0!==e?Math.round(Number(e)):"---"}</div><div class="unit">%</div></span></li>`:R``}else{const t=(_=!!this._config.entity_pop_1&&this._config.entity_pop_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_pop_1?this._config.entity_pop_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+l)):void 0;p=_?R`<li class="f-slot-horiz-text"><span><div class="slot-text pop">${t&&this.hass.states[t]?Math.round(Number(this.hass.states[t].state)):"---"}</div><div class="unit">%</div></span></li>`:R``}if(null===(o=this._config.entity_pos_1)||void 0===o?void 0:o.match("^weather.")){const t=this._config.entity_pos_1,e=this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,c,"precipitation");g=t?R`<li class="f-slot-horiz-text"><span><div class="pos">${this.hass.states[t]&&void 0!==e?e:"---"}</div><div class="unit">${this.getUOM("precipitation")}</div></span></li>`:R``}else{const t=(_=!!this._config.entity_pos_1&&this._config.entity_pos_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_pos_1?this._config.entity_pos_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+l)):void 0;g=_?R`<li class="f-slot-horiz-text"><span><div class="pos">${t&&this.hass.states[t]?this.hass.states[t].state:"---"}</div><div class="unit">${this.getUOM("precipitation")}</div></span></li>`:R``}if(null===(n=this._config.entity_summary_1)||void 0===n?void 0:n.match("^weather.")){const t=this._config.entity_summary_1,e=null!==(r=this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,c,"detailed_description"))&&void 0!==r?r:this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,c,"condition");f=R`<div class="fcasttooltiptext" id="fcast-summary-${l}">${this.hass.states[t]&&void 0!==e?(v=this.hass.localize,m=e,v(`component.weather.state._.${m}`)||m):"---"}</div>`}else{const t=(_=!!this._config.entity_summary_1&&this._config.entity_summary_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_summary_1?this._config.entity_summary_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+l)):void 0;f=R`<div class="fcasttooltiptext" id="fcast-summary-${l}">${this._config.option_tooltips&&t?this.hass.states[t]?this.hass.states[t].state:"---":""}</div>`}a.push(R`
        <div class="day-horiz fcasttooltip">
          <ul class="f-slot-horiz">
            <li class="f-slot-horiz-text"><span class="dayname">${c?c.toLocaleDateString(this.locale,{weekday:"short"}):"---"}</span></li>
            ${h}
            ${b}
            ${p}
            ${g}
            ${f}
          </ul>
        </div>
      `)}var v,m;return R`
      <div class="daily-forecast-horiz-section section">
        ${a}
      </div>
    `}_renderVerticalDailyForecastSection(){var t,e,i,s,o;const n=[],r=this._config.daily_forecast_days||5;for(var a=0;a<r;a++){const r=new Date;var c,l,h,d,u;if(r.setDate(r.getDate()+a+1),null===(t=this._config.entity_forecast_icon_1)||void 0===t?void 0:t.match("^weather.")){const t=this._config.entity_forecast_icon_1,e=this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,r,"condition");if(void 0===e)break;const i=new URL(((this._config.option_static_icons?"s-":"a-")+(t&&e?this._weatherIcon(e):"unknown")+".svg").replace("-night","-day"),import.meta.url);c=R`<i class="icon" style="background: none, url(${i.href}) no-repeat; background-size: contain;"></i><br>`}else{var _=!!this._config.entity_forecast_icon_1&&this._config.entity_forecast_icon_1.match(/(\d+)(?!.*\d)/g);const t=_&&this._config.entity_forecast_icon_1?this._config.entity_forecast_icon_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a)):void 0;if(!t||void 0===this.hass.states[t]||"unknown"===this.hass.states[t].state)break;const e=new URL(((this._config.option_static_icons?"s-":"a-")+(void 0!==this.hass.states[t]?this._weatherIcon(this.hass.states[t].state):"unknown")+".svg").replace("-night","-day"),import.meta.url);c=R`<i class="icon" style="background: none, url(${e.href}) no-repeat; background-size: contain;"></i><br>`}const g=(_=!!this._config.entity_summary_1&&this._config.entity_summary_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_summary_1?this._config.entity_summary_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a)):void 0,f=_?R`
        <div class="f-summary-vert">${g&&this.hass.states[g]?this.hass.states[g].state:"---"}</div>`:"";l=(null===(e=this._config.entity_forecast_high_temp_1)||void 0===e?void 0:e.match("^weather."))?this._getForecastPropFromWeather(this.hass.states[this._config.entity_forecast_high_temp_1].attributes.forecast,r,"temperature"):(_=!!this._config.entity_forecast_high_temp_1&&this._config.entity_forecast_high_temp_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_forecast_high_temp_1?this.hass.states[this._config.entity_forecast_high_temp_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a))].state:void 0,h=(null===(i=this._config.entity_forecast_low_temp_1)||void 0===i?void 0:i.match("^weather."))?this._getForecastPropFromWeather(this.hass.states[this._config.entity_forecast_low_temp_1].attributes.forecast,r,"templow"):(_=!!this._config.entity_forecast_low_temp_1&&this._config.entity_forecast_low_temp_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_forecast_low_temp_1?this.hass.states[this._config.entity_forecast_low_temp_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a))].state:void 0;const v=R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`,m=h?R`
        <div class="f-slot-vert">
          <div class="temp-label">Min: </div>
          <div class="low-temp">${Math.round(Number(h))}</div>${v}
        </div>`:R`---`,y=l?R`
        <div class="f-slot-vert">
          <div class="temp-label">Max: </div>
          <div class="high-temp">${Math.round(Number(l))}</div>${v}
        </div>`:R`---`;if(null===(s=this._config.entity_pop_1)||void 0===s?void 0:s.match("^weather.")){const t=this._config.entity_pop_1,e=this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,r,"precipitation_probability");d=t?R`<div class="f-slot-vert"><div class="f-label">Chance of rain </div>
        <div class="pop">${this.hass.states[t]&&void 0!==e?Math.round(Number(e)):"---"}</div><div class="unit">%</div></div>`:R``}else{const t=(_=!!this._config.entity_pop_1&&this._config.entity_pop_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_pop_1?this._config.entity_pop_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a)):void 0;d=_?R`
          <div class="f-slot-vert"><div class="f-label">Chance of rain </div>
          <div class="pop">${t&&this.hass.states[t]?Math.round(Number(this.hass.states[t].state)):"---"}</div><div class="unit">%</div></div>`:R``}if(null===(o=this._config.entity_pos_1)||void 0===o?void 0:o.match("^weather.")){const t=this._config.entity_pos_1,e=this._getForecastPropFromWeather(this.hass.states[t].attributes.forecast,r,"precipitation");u=t?R`<div class="f-slot-vert"><div class="f-label">Possible rain </div>
        <div class="pos">${this.hass.states[t]&&void 0!==e?e:"---"}</div><div class="unit">${this.getUOM("precipitation")}</div></div>`:R``}else{const t=(_=!!this._config.entity_pos_1&&this._config.entity_pos_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_pos_1?this._config.entity_pos_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a)):void 0;u=_?R`
          <div class="f-slot-vert"><div class="f-label">Possible rain </div>
          <div class="pos">${t&&this.hass.states[t]?this.hass.states[t].state:"---"}</div>
          <div class="unit">${this.getUOM("precipitation")}</div></div>`:R``}_=!!(this._config.entity_extended_1&&a<(0!==this._config.daily_extended_forecast_days?this._config.daily_extended_forecast_days||7:0))&&this._config.entity_extended_1.match(/(\d+)(?!.*\d)/g);var p=R``;if(!0===this._config.option_daily_show_extended)if(!0===this._config.daily_extended_use_attr){const t=(_=!!this._config.entity_extended_1&&this._config.entity_extended_1.match(/(\d+)(?!.*\d)/g))&&this._config.entity_extended_1?this._config.entity_extended_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a)):this._config.entity_extended_1;if(t&&void 0!==this.hass.states[t]){const e=null==(_=!!(this._config.daily_extended_name_attr&&a<(0!==this._config.daily_extended_forecast_days?this._config.daily_extended_forecast_days||7:0))&&this._config.daily_extended_name_attr.match(/(\d+)(?!.*\d)/g))&&t&&this._config.daily_extended_name_attr?this.hass.states[t].attributes[this._config.daily_extended_name_attr]:_&&this._config.daily_extended_name_attr&&t?this._config.daily_extended_name_attr.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a)).toLowerCase().split(".").reduce(((t,e)=>void 0!==t?t[e]:void 0),this.hass.states[t].attributes):void 0;p=e?R`<div class="f-extended">${e}</div>`:R``}}else{const t=_&&this._config.entity_extended_1?this._config.entity_extended_1.replace(/(\d+)(?!.*\d)/g,String(Number(_)+a)):void 0;p=_?R`<div class="f-extended">${t&&this.hass.states[t]?this.hass.states[t].state:"---"}</div>`:R``}n.push(R`
        <div class="day-vert fcasttooltip">
          <div class="day-vert-top">
            <div class="dayname-vert">${r?r.toLocaleDateString(this.locale,{weekday:"short"}):"---"}</div>
            ${f}
          </div>
          <div class="day-vert-middle">
            <div class="day-vert-dayicon">
              ${c}
            </div>
            <div class="day-vert-temps">
              ${m}
              ${y}
            </div>
            <div class="day-vert-rain">
              ${d}
              ${u}
            </div>
          </div>
          <div class="day-vert-bottom">
            ${p}
          </div>
        </div>
      `)}return R`
      <div class="daily-forecast-vert-section section">
        ${n}
      </div>
    `}_getForecastPropFromWeather(t,e,i){const s=e.toISOString().substring(0,10),o=t.filter((t=>{var e;return(null===(e=t.datetime)||void 0===e?void 0:e.substring(0,10))===s}));if(1===o.length)return String(o[0][i]);if(2===o.length){const t=o.find((t=>!0===t.daytime)),e=o.find((t=>!1===t.daytime));return String("templow"===i?e.temperature:t[i])}}_renderDailyForecastSection(){var t;return!1===(null===(t=this._config)||void 0===t?void 0:t.show_section_daily_forecast)?R``:"vertical"!==this._config.daily_forecast_layout?this._renderHorizontalDailyForecastSection():this._renderVerticalDailyForecastSection()}render(){const t=[];this._checkForErrors()&&t.push(this._showConfigWarning(this._error));const e=[];return void 0!==this._config.section_order&&this._config.section_order.forEach((t=>{switch(t){case"overview":e.push(this._renderOverviewSection());break;case"extended":e.push(this._renderExtendedSection());break;case"slots":e.push(this._renderSlotsSection());break;case"daily_forecast":e.push(this._renderDailyForecastSection())}})),t.push(R`
      <style>
        ${this.styles}
      </style>
      <ha-card class="card">
        <div class="content">
          ${e}
        </div>
      </ha-card>
    `),R`${t}`}get slotL1(){return this.slotValue("l1",this._config.slot_l1)}get slotL2(){return this.slotValue("l2",this._config.slot_l2)}get slotL3(){return this.slotValue("l3",this._config.slot_l3)}get slotL4(){return this.slotValue("l4",this._config.slot_l4)}get slotL5(){return this.slotValue("l5",this._config.slot_l5)}get slotL6(){return this.slotValue("l6",this._config.slot_l6)}get slotL7(){return this.slotValue("l7",this._config.slot_l7)}get slotL8(){return this.slotValue("l8",this._config.slot_l8)}get slotR1(){return this.slotValue("r1",this._config.slot_r1)}get slotR2(){return this.slotValue("r2",this._config.slot_r2)}get slotR3(){return this.slotValue("r3",this._config.slot_r3)}get slotR4(){return this.slotValue("r4",this._config.slot_r4)}get slotR5(){return this.slotValue("r5",this._config.slot_r5)}get slotR6(){return this.slotValue("r6",this._config.slot_r6)}get slotR7(){return this.slotValue("r7",this._config.slot_r7)}get slotR8(){return this.slotValue("r8",this._config.slot_r8)}slotValue(t,e){switch(e){case"pop":return this.slotPop;case"popforecast":return this.slotPopForecast;case"possible_today":return this.slotPossibleToday;case"possible_tomorrow":return this.slotPossibleTomorrow;case"rainfall":return this.slotRainfall;case"humidity":return this.slotHumidity;case"pressure":return this.slotPressure;case"observed_max":return this.slotObservedMax;case"observed_min":return this.slotObservedMin;case"forecast_max":return this.slotForecastMax;case"forecast_min":return this.slotForecastMin;case"temp_next":return this.slotTempNext;case"temp_following":return this.slotTempFollowing;case"temp_maximums":return this.slotTempMaximums;case"temp_minimums":return this.slotTempMinimums;case"uv_summary":return this.slotUvSummary;case"fire_summary":return this.slotFireSummary;case"wind":return this.slotWind;case"wind_kt":return this.slotWindKt;case"visibility":return this.slotVisibility;case"sun_next":return this.slotSunNext;case"sun_following":return this.slotSunFollowing;case"custom1":return this.slotCustom1;case"custom2":return this.slotCustom2;case"custom3":return this.slotCustom3;case"custom4":return this.slotCustom4;case"empty":return this.slotEmpty;case"remove":return this.slotRemove}switch(t){case"l1":return this.slotForecastMax;case"l2":return this.slotForecastMin;case"l3":return this.slotWind;case"l4":return this.slotPressure;case"l5":return this.slotSunNext;case"l6":case"l7":case"l8":case"r6":case"r7":case"r8":return this.slotRemove;case"r1":return this.slotPopForecast;case"r2":return this.slotHumidity;case"r3":return this.slotUvSummary;case"r4":return this.slotFireSummary;case"r5":return this.slotSunFollowing}return this.slotEmpty}get slotEmpty(){return R`<li>&nbsp;</li>`}get slotRemove(){return R``}get slotPopForecast(){const t=this._config.entity_pop?null===this._config.entity_pop.match("^weather.")?Math.round(Number(this.hass.states[this._config.entity_pop].state)):void 0!==this.hass.states[this._config.entity_pop]&&void 0!==this.hass.states[this._config.entity_pop].attributes.forecast[0].precipitation_probability?Math.round(Number(this.hass.states[this._config.entity_pop].attributes.forecast[0].precipitation_probability)):"---":"---",e="---"!==t?R`<div class="slot-text unit">%</div>`:R``,i=this._config.entity_possible_today?null===this._config.entity_possible_today.match("^weather.")?this.hass.states[this._config.entity_possible_today].state:void 0!==this.hass.states[this._config.entity_possible_today]&&void 0!==this.hass.states[this._config.entity_possible_today].attributes.forecast[0].precipitation?this.hass.states[this._config.entity_possible_today].attributes.forecast[0].precipitation:"---":"---",s="---"!==i?R`<div class="slot-text unit">${this.getUOM("precipitation")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-rainy"></ha-icon>
          </div>
          <div class="slot-text pop-text">${t}</div>${e}<div class="slot-text">&nbsp;-&nbsp;</div>
          <div class="slot-text pop-text-today">${i}</div>${s}
        </div>
      </li>
    `}get slotPop(){const t=this._config.entity_pop?null===this._config.entity_pop.match("^weather.")?Math.round(Number(this.hass.states[this._config.entity_pop].state)):void 0!==this.hass.states[this._config.entity_pop]&&void 0!==this.hass.states[this._config.entity_pop].attributes.forecast[0].precipitation_probability?Math.round(Number(this.hass.states[this._config.entity_pop].attributes.forecast[0].precipitation_probability)):"---":"---",e="---"!==t?R`<div class="slot-text unit">%</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-rainy"></ha-icon>
          </div>
          <div class="slot-text pop-text">${t}</div>${e}<div class="slot-text"></div>
        </div>
      </li>
    `}get slotPossibleToday(){const t=this._config.entity_possible_today?null===this._config.entity_possible_today.match("^weather.")?this.hass.states[this._config.entity_possible_today].state:void 0!==this.hass.states[this._config.entity_possible_today]&&void 0!==this.hass.states[this._config.entity_possible_today].attributes.forecast[0].precipitation?this.hass.states[this._config.entity_possible_today].attributes.forecast[0].precipitation:"---":"---",e="---"!==t?R`<div class="slot-text unit">${this.getUOM("precipitation")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-rainy"></ha-icon>
          </div>${this.localeTextPosToday}&nbsp;<div class="slot-text possible_today-text">${t}</div>${e}
        </div>
      </li>
    `}get slotPossibleTomorrow(){const t=this._config.entity_possible_tomorrow?null===this._config.entity_possible_tomorrow.match("^weather.")?this.hass.states[this._config.entity_possible_tomorrow].state:void 0!==this.hass.states[this._config.entity_possible_tomorrow]&&void 0!==this.hass.states[this._config.entity_possible_tomorrow].attributes.forecast[1].precipitation?this.hass.states[this._config.entity_possible_tomorrow].attributes.forecast[1].precipitation:"---":"---",e="---"!==t?R`<div class="slot-text unit">${this.getUOM("precipitation")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-rainy"></ha-icon>
          </div>${this.localeTextPosTomorrow}&nbsp;<div class="slot-text possible_tomorrow-text">${t}</div>${e}
        </div>
      </li>
    `}get slotRainfall(){const t=this.currentRainfall,e="---"!==t?R`<div class="slot-text unit"></span>${this.getUOM("precipitation")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-rainy"></ha-icon>
          </div>
          <div class="slot-text rainfall-text">${t}</div>${e}
        </div>
      </li>
    `}get slotHumidity(){const t=this.currentHumidity,e="---"!==t?R`<div class="slot-text unit">%</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:water-percent"></ha-icon>
          </div>
          <div class="slot-text humidity-text">${t}</div>${e}
        </div>
      </li>`}get slotPressure(){const t="---"!==this.currentPressure?R`<div class="slot-text unit">${this._config.pressure_units?this._config.pressure_units:this.getUOM("air_pressure")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:gauge"></ha-icon>
          </div>
          <div class="slot-text pressure-text">${this.currentPressure}</div>${t}
        </div>
      </li>
    `}get slotObservedMax(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_observed_max?Number(this.hass.states[this._config.entity_observed_max].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",i="---"!==e?R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:thermometer-high"></ha-icon>
          </div>
          <div class="slot-text">${this.localeTextObservedMax}&nbsp;</div>
          <div class="slot-text observed-max-text">${e}</div>${i}
        </div>
      </li>
    `}get slotObservedMin(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_observed_min?Number(this.hass.states[this._config.entity_observed_min].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",i="---"!==e?R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:thermometer-low"></ha-icon>
          </div>
          <div class="slot-text">${this.localeTextObservedMin}&nbsp;</div>
          <div class="slot-text observed-min-text">${e}</div>${i}
        </div>
      </li>
    `}get slotForecastMax(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_forecast_max?null===this._config.entity_forecast_max.match("^weather.")?Number(this.hass.states[this._config.entity_forecast_max].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):void 0!==this.hass.states[this._config.entity_forecast_max]&&void 0!==this.hass.states[this._config.entity_forecast_max].attributes.forecast[0].temperature?Number(this.hass.states[this._config.entity_forecast_max].attributes.forecast[0].temperature).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---":"---",i="---"!==e?R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:thermometer-high"></ha-icon>
          </div>
          <div class="slot-text">${this.localeTextForecastMax}&nbsp;</div>
          <div class="slot-text forecast-max-text">${e}</div>${i}
        </div>
      </li>
    `}get slotForecastMin(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_forecast_min?null===this._config.entity_forecast_min.match("^weather.")?Number(this.hass.states[this._config.entity_forecast_min].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):void 0!==this.hass.states[this._config.entity_forecast_min]&&void 0!==this.hass.states[this._config.entity_forecast_min].attributes.forecast[0].templow?Number(this.hass.states[this._config.entity_forecast_min].attributes.forecast[0].templow).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---":"---",i="---"!==e?R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:thermometer-low"></ha-icon>
          </div>
          <div class="slot-text">${this.localeTextForecastMin}&nbsp;</div>
          <div class="slot-text forecast-min-text">${e}</div>${i}
        </div>
      </li>
    `}get slotTempNext(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_temp_next_label?this.hass.states[this._config.entity_temp_next_label].state.toLowerCase().includes("min")||this.hass.states[this._config.entity_temp_next_label].state.toLowerCase().includes("low")?"mdi:thermometer-low":"mdi:thermometer-high":"mdi:help-box",i=this._config.entity_temp_next?Number(this.hass.states[this._config.entity_temp_next].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",s=this._config.entity_temp_next_label?this.hass.states[this._config.entity_temp_next_label].state:"",o="---"!==i?R`<div class="slot-text unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="${e}"></ha-icon>
          </div>
          <div class="slot-text temp-next-text">${s} ${i}</div>
          ${o}
        </div>
      </li>
    `}get slotTempFollowing(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_temp_following_label?this.hass.states[this._config.entity_temp_following_label].state.toLowerCase().includes("min")||this.hass.states[this._config.entity_temp_following_label].state.toLowerCase().includes("low")?"mdi:thermometer-low":"mdi:thermometer-high":"mdi:help-box",i=this._config.entity_temp_following?Number(this.hass.states[this._config.entity_temp_following].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",s=this._config.entity_temp_following_label?this.hass.states[this._config.entity_temp_following_label].state:"",o="---"!==i?R`<div class="slot-text unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="${e}"></ha-icon>
          </div>
          <div class="slot-text temp-following-text">${s} ${i}</div>
          ${o}
        </div>
      </li>
    `}get slotTempMaximums(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_observed_max?Number(this.hass.states[this._config.entity_observed_max].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",i=this._config.entity_forecast_max?Number(this.hass.states[this._config.entity_forecast_max].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",s="---"!==e?R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:thermometer-high"></ha-icon>
          </div>
          <div class="slot-text">${this.localeTextObsMax}&nbsp;</div>
          <div class="slot-text observed-max-text">${e}</div>${s}
          <div class="slot-text">&nbsp;(${this.localeTextFore}&nbsp;</div>
          <div class="slot-text forecast-max-text">${i}</div>${s}
          <div class="slot-text">)</div>
        </div>
      </li>
    `}get slotTempMinimums(){const t=!0===this._config.option_today_temperature_decimals?1:0,e=this._config.entity_observed_min?Number(this.hass.states[this._config.entity_observed_min].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",i=this._config.entity_forecast_min?Number(this.hass.states[this._config.entity_forecast_min].state).toLocaleString(this.locale,{minimumFractionDigits:t,maximumFractionDigits:t}):"---",s="---"!==e?R`<div class="unit-temp-small">${this.getUOM("temperature")}</div>`:R``;return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:thermometer-low"></ha-icon>
          </div>
          <div class="slot-text">${this.localeTextObsMin}&nbsp;</div>
          <div class="slot-text observed-min-text">${e}</div>${s}
          <div class="slot-text">&nbsp;(${this.localeTextFore}&nbsp;</div>
          <div class="slot-text forecast-min-text">${i}</div>${s}
          <div class="slot-text">)</div>
        </div>
      </li>
    `}get slotUvSummary(){const t=this._config.entity_uv_alert_summary?"unknown"!==this.hass.states[this._config.entity_uv_alert_summary].state?this.hass.states[this._config.entity_uv_alert_summary].state:"n/a":"---";return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-sunny"></ha-icon>
          </div>
          <div class="slot-text daytime-uv-text">${this.localeTextUVRating} ${t}</div>
        </div>
      </li>
    `}get slotFireSummary(){const t=this._config.entity_fire_danger_summary?"unknown"!==this.hass.states[this._config.entity_fire_danger_summary].state?this.hass.states[this._config.entity_fire_danger_summary].state:"n/a":"---";return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:fire"></ha-icon>
          </div>
          <div class="slot-text fire-danger-text">${this.localeTextFireDanger} ${t}</div>
        </div>
      </li>`}get slotWind(){const t=this._config.entity_wind_speed&&this._config.option_show_beaufort?R`<div class="slot-text"></div>BFT: ${this.currentBeaufort} -&nbsp;</div>`:"",e=this._config.entity_wind_bearing?R`<div class="slot-text">${this.currentWindBearing}&nbsp;</div>`:"",i=R`<div class="slot-text unit">${this.getUOM("length")}/h</div>`,s=this._config.entity_wind_speed?R`<div class="slot-text">${this.currentWindSpeed}</div>${i}&nbsp;`:"",o=this._config.entity_wind_gust?R`<div class="slot-text">(Gust ${this.currentWindGust}</div>${i})`:"";return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-windy"></ha-icon>
          </div>
          ${t}${e}${s}${o}
        </div>
      </li>
    `}get slotWindKt(){const t=this._config.entity_wind_speed_kt&&this._config.option_show_beaufort?R`<div class="slot-text"></div>BFT: ${this.currentBeaufortKt} -&nbsp;</div>`:"",e=this._config.entity_wind_bearing?R`<div class="slot-text">${this.currentWindBearing}&nbsp;</div>`:"",i=R`<div class="slot-text unit">Kt</div>`,s=this._config.entity_wind_speed_kt?R`<div class="slot-text">${this.currentWindSpeedKt}</div>${i}&nbsp;`:"",o=this._config.entity_wind_gust_kt?R`<div class="slot-text">(Gust ${this.currentWindGustKt}</div>${i})`:"";return R`
      <li>
        <div class="slot">
          <div class="slot-icon">
            <ha-icon icon="mdi:weather-windy"></ha-icon>
          </div>
          ${t}${e}${s}${o}
        </div>
      </li>
    `}get slotVisibility(){const t=this.currentVisibility,e="---"!==t?this.getUOM("length"):"";return R`
      <li>
        <div class="slot-icon">
          <ha-icon icon="mdi:weather-fog"></ha-icon>
        </div>
        <div class="slot-text visibility-text">${t}</div>
        <div class="slot-text unit"> ${e}
        </div>
      </li>
    `}get slotSunNext(){return this._config.entity_sun?this.sunSet.next:R``}get slotSunFollowing(){return this._config.entity_sun?this.sunSet.following:R``}get slotCustom1(){var t=this._config.custom1_icon?this._config.custom1_icon:"mdi:help-box",e=this._config.custom1_value?this.hass.states[this._config.custom1_value].state:"unknown",i=this._config.custom1_units?this._config.custom1_units:"";return R`
      <li>
        <div class="slot-icon">
          <ha-icon icon=${t}></ha-icon>
        </div>
        <div class="slot-text custom-1-text">${e}</div><div class="slot-text unit">${i}</div>
      </li>
    `}get slotCustom2(){var t=this._config.custom2_icon?this._config.custom2_icon:"mdi:help-box",e=this._config.custom2_value?this.hass.states[this._config.custom2_value].state:"unknown",i=this._config.custom2_units?this._config.custom2_units:"";return R`
      <li>
        <div class="slot-icon">
          <ha-icon icon=${t}></ha-icon>
        </div>
        <div class="slot-text custom-2-text">${e}</div><div class="slot-text unit">${i}</div>
      </li>
    `}get slotCustom3(){var t=this._config.custom3_icon?this._config.custom3_icon:"mdi:help-box",e=this._config.custom3_value?this.hass.states[this._config.custom3_value].state:"unknown",i=this._config.custom3_units?this._config.custom3_units:"";return R`
      <li>
        <div class="slot-icon">
          <ha-icon icon=${t}></ha-icon>
        </div>
        <div class="slot-text custom-3-text">${e}</div><div class="slot-text unit">${i}</div>
      </li>
    `}get slotCustom4(){var t=this._config.custom4_icon?this._config.custom4_icon:"mdi:help-box",e=this._config.custom4_value?this.hass.states[this._config.custom4_value].state:"unknown",i=this._config.custom4_units?this._config.custom4_units:"";return R`
      <li>
        <div class="slot-icon">
          <ha-icon icon=${t}></ha-icon>
        </div>
        <div class="slot-text custom-4-text">${e}</div><div class="slot-text unit">${i}</div>
      </li>
    `}get currentConditions(){const t=this._config.entity_current_conditions;return t&&this.hass.states[t]?this.hass.states[t].state:"---"}get currentTemperature(){const t=this._config.entity_temperature,e=!0===this._config.show_decimals?1:0;return t&&this.hass.states[t]?null===t.match("^weather.")?Number(this.hass.states[t].state).toLocaleString(this.locale,{minimumFractionDigits:e,maximumFractionDigits:e}):void 0!==this.hass.states[t].attributes.temperature?Number(this.hass.states[t].attributes.temperature).toLocaleString(this.locale,{minimumFractionDigits:e,maximumFractionDigits:e}):"---":"---"}get currentApparentTemperature(){const t=this._config.entity_apparent_temp,e=!0===this._config.show_decimals?1:0;return t&&this.hass.states[t]?Number(this.hass.states[t].state).toLocaleString(this.locale,{minimumFractionDigits:e,maximumFractionDigits:e}):""}get currentHumidity(){const t=this._config.entity_humidity;return t&&this.hass.states[t]?null===t.match("^weather.")?Number(this.hass.states[t].state).toLocaleString(this.locale):void 0!==this.hass.states[t].attributes.humidity?Number(this.hass.states[t].attributes.humidity).toLocaleString(this.locale):"---":"---"}get currentRainfall(){const t=this._config.entity_rainfall,e=!0===this._config.option_today_rainfall_decimals?1:0;return t&&this.hass.states[t]?Number(this.hass.states[t].state).toLocaleString(this.locale,{minimumFractionDigits:e,maximumFractionDigits:e}):"---"}get currentPressure(){const t=this._config.entity_pressure;var e=this._config.option_pressure_decimals?Math.max(Math.min(this._config.option_pressure_decimals,3),0):0;return t&&this.hass.states[t]?null===t.match("^weather.")?Number(this.hass.states[t].state).toLocaleString(this.locale,{minimumFractionDigits:e,maximumFractionDigits:e}):void 0!==this.hass.states[t].attributes.pressure?Number(this.hass.states[t].attributes.pressure).toLocaleString(this.locale):"---":"---"}get currentVisibility(){const t=this._config.entity_visibility;return t&&this.hass.states[t]?null===t.match("^weather.")?Number(this.hass.states[t].state).toLocaleString(this.locale):void 0!==this.hass.states[t].attributes.visibility?Number(this.hass.states[t].attributes.visibility).toLocaleString(this.locale):"---":"---"}get currentWindBearing(){const t=this._config.entity_wind_bearing;return t&&this.hass.states[t]?null===t.match("^weather.")?isNaN(Number(this.hass.states[t].state))?this.hass.states[t].state:this.windDirections[Math.round(Number(this.hass.states[t].state)/360*16)]:void 0!==this.hass.states[t].attributes.wind_bearing?isNaN(Number(this.hass.states[t].attributes.wind_bearing))?this.hass.states[t].attributes.wind_bearing:this.windDirections[Math.round(Number(this.hass.states[t].attributes.wind_bearing)/360*16)]:"---":"---"}get currentWindSpeed(){const t=this._config.entity_wind_speed;return t&&this.hass.states[t]?null===t.match("^weather.")?Math.round(Number(this.hass.states[t].state)).toLocaleString(this.locale):void 0!==this.hass.states[t].attributes.wind_speed?Math.round(Number(this.hass.states[t].attributes.wind_speed)).toLocaleString(this.locale):"---":"---"}get currentWindGust(){const t=this._config.entity_wind_gust;return t&&this.hass.states[t]?Math.round(Number(this.hass.states[t].state)).toLocaleString(this.locale):"---"}get currentWindSpeedKt(){const t=this._config.entity_wind_speed_kt;return t&&this.hass.states[t]?null===t.match("^weather.")?Math.round(Number(this.hass.states[t].state)).toLocaleString(this.locale):void 0!==this.hass.states[t].attributes.wind_speed?Math.round(Number(this.hass.states[t].attributes.wind_speed)).toLocaleString(this.locale):"---":"---"}get currentWindGustKt(){const t=this._config.entity_wind_gust_kt;return t&&this.hass.states[t]?Math.round(Number(this.hass.states[t].state)).toLocaleString(this.locale):"---"}get windDirections(){const t=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"],e=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO","N"],i=["N","NNO","NO","ONO","O","OSO","SO","SSO","S","SSW","SW","WSW","W","WNW","NW","NNW","N"],s=["N","NNO","NO","ONO","O","OZO","ZO","ZZO","Z","ZZW","ZW","WZW","W","WNW","NW","NNW","N"],o=["צפון","צ-צ-מז","צפון מזרח","מז-צ-מז","מזרח","מז-ד-מז","דרום מזרח","ד-ד-מז","דרום","ד-ד-מע","דרום מערב","מע-ד-מע","מערב","מע-צ-מע","צפון מערב","צ-צ-מע","צפון"],n=["N","NNØ","NØ","ØNØ","Ø","ØSØ","SØ","SSØ","S","SSV","SV","VSV","V","VNV","NV","NNV","N"],r=["С","ССВ","СВ","ВСВ","В","ВЮВ","ЮВ","ЮЮВ","Ю","ЮЮЗ","ЮЗ","ЗЮЗ","З","ЗСЗ","СЗ","ССЗ","С"];switch(this.locale){case"it":case"fr":return e;case"de":return i;case"nl":return s;case"he":return o;case"ru":return r;case"da":return n;default:return t}}get currentBeaufort(){const t=this._config.entity_wind_speed;if(t&&this.hass.states[t]&&!isNaN(Number(this.hass.states[t].state))){const e=Number(this.hass.states[t].state);switch(this.hass.states[t].attributes.unit_of_measurement){case"mph":return e>=73?"12":e>=64?"11":e>=55?"10":e>=47?"9":e>=39?"8":e>=32?"7":e>=25?"6":e>=19?"5":e>=13?"4":e>=8?"3":e>=4?"2":e>=1?"1":"0";case"m/s":return e>=32.7?"12":e>=28.5?"11":e>=24.5?"10":e>=20.8?"9":e>=17.2?"8":e>=13.9?"7":e>=10.8?"6":e>=8?"5":e>=5.5?"4":e>=3.4?"3":e>=1.6?"2":e>=.5?"1":"0";default:return e>=118?"12":e>=103?"11":e>=89?"10":e>=75?"9":e>=62?"8":e>=50?"7":e>=39?"6":e>=29?"5":e>=20?"4":e>=12?"3":e>=6?"2":e>=2?"1":"0"}}return"---"}get currentBeaufortKt(){const t=this._config.entity_wind_speed_kt;if(t&&this.hass.states[t]&&!isNaN(Number(this.hass.states[t].state))){const e=Number(this.hass.states[t].state);return e>=64?"12":e>=56?"11":e>=48?"10":e>=41?"9":e>=34?"8":e>=28?"7":e>=22?"6":e>=17?"5":e>=11?"4":e>=7?"3":e>=4?"2":e>=1?"1":"0"}return"---"}get sunSet(){var t,e;switch(this.timeFormat){case"12hour":t=this._config.entity_sun?new Date(this.hass.states[this._config.entity_sun].attributes.next_setting).toLocaleTimeString(this.locale,{hour:"numeric",minute:"2-digit",hour12:!0}).replace(" am","am").replace(" pm","pm"):"",e=this._config.entity_sun?new Date(this.hass.states[this._config.entity_sun].attributes.next_rising).toLocaleTimeString(this.locale,{hour:"numeric",minute:"2-digit",hour12:!0}).replace(" am","am").replace(" pm","pm"):"";break;case"24hour":t=this._config.entity_sun?new Date(this.hass.states[this._config.entity_sun].attributes.next_setting).toLocaleTimeString(this.locale,{hour:"2-digit",minute:"2-digit",hour12:!1}):"",e=this._config.entity_sun?new Date(this.hass.states[this._config.entity_sun].attributes.next_rising).toLocaleTimeString(this.locale,{hour:"2-digit",minute:"2-digit",hour12:!1}):"";break;case"system":t=this._config.entity_sun?new Date(this.hass.states[this._config.entity_sun].attributes.next_setting).toLocaleTimeString(navigator.language,{timeStyle:"short"}).replace(" am","am").replace(" pm","pm"):"",e=this._config.entity_sun?new Date(this.hass.states[this._config.entity_sun].attributes.next_rising).toLocaleTimeString(navigator.language,{timeStyle:"short"}).replace(" am","am").replace(" pm","pm"):""}var i=new Date;return i.setDate(i.getDate()+1),this._config.entity_sun?"above_horizon"==this.hass.states[this._config.entity_sun].state?(e=i.toLocaleDateString(this.locale,{weekday:"short"})+" "+e,{next:R`
            <li>
              <div class="slot-icon">
                <ha-icon id="sun-next-icon" icon="mdi:weather-sunset-down"></ha-icon>
              </div>
              <div class="slot-text sun-next-text">${t}</div>
            </li>`,following:R`
            <li>
              <div class="slot-icon">
                <ha-icon id="sun-following-icon" icon="mdi:weather-sunset-up"></ha-icon>
              </div>
              <div class="slot-text sun-following-text">${e}</div>
            </li>`,nextText:t,followingText:e,nextIcon:"mdi:weather-sunset-down",followingIcon:"mdi:weather-sunset-up"}):((new Date).getDate()!=new Date(this.hass.states[this._config.entity_sun].attributes.next_rising).getDate()&&(e=i.toLocaleDateString(this.locale,{weekday:"short"})+" "+e,t=i.toLocaleDateString(this.locale,{weekday:"short"})+" "+t),{next:R`
            <li>
              <div class="slot-icon">
                <ha-icon id="sun-next-icon" icon="mdi:weather-sunset-up"></ha-icon>
              </div>
              <div class="slot-text sun-next-text">${e}</div>
            </li>`,following:R`
            <li>
              <div class="slot-icon">
                <ha-icon id="sun-following-icon" icon="mdi:weather-sunset-down"></ha-icon>
              </div>
              <div class="slot-text sun-following-text">${t}</div>
            </li>`,nextText:e,followingText:t,nextIcon:"mdi:weather-sunset-up",followingIcon:"mdi:weather-sunset-down"}):{next:R``,following:R``,nextText:"",followingText:"",nextIcon:"",followingIcon:""}}get timeFormat(){return this._config.option_time_format?this._config.option_time_format:"system"}_weatherIcon(t){switch(t){case"sunny":return this.iconSunny;case"clear":return this.iconClear;case"mostly-sunny":case"mostly_sunny":return this.iconMostlySunny;case"partly-cloudy":case"partly_cloudy":case"partlycloudy":return this.iconPartlyCloudy;case"cloudy":return this.iconCloudy;case"hazy":case"hazey":case"haze":return this.iconHazy;case"frost":return this.iconFrost;case"light-rain":case"light_rain":return this.iconLightRain;case"wind":case"windy":return this.iconWindy;case"fog":case"foggy":return this.iconFog;case"showers":case"shower":return this.iconShowers;case"rain":case"rainy":return this.iconRain;case"dust":case"dusty":return this.iconDust;case"snow":case"snowy":return this.iconSnow;case"snowy-rainy":case"snowy_rainy":case"snowyrainy":return this.iconSnowRain;case"storm":case"stormy":return this.iconStorm;case"light-showers":case"light-shower":case"light_showers":case"light_shower":return this.iconLightShowers;case"heavy-showers":case"heavy-shower":case"heavy_showers":case"heavy_shower":case"pouring":return this.iconHeavyShowers;case"tropical-cyclone":case"tropical_cyclone":case"tropicalcyclone":return this.iconCyclone;case"clear-day":case"clear_day":return this.iconClearDay;case"clear-night":case"clear_night":return this.iconClearNight;case"sleet":return this.iconSleet;case"partly-cloudy-day":case"partly_cloudy_day":return this.iconPartlyCloudyDay;case"partly-cloudy-night":case"partly_cloudy_night":return this.iconPartlyCloudyNight;case"hail":return this.iconHail;case"lightning":case"lightning-rainy":case"lightning_rainy":case"thunderstorm":return this.iconLightning;case"windy-variant":case"windy_variant":return this.iconWindyVariant}return"unknown"}get dayOrNight(){return this._config.entity_sun&&void 0!==this.hass.states[this._config.entity_sun]?{below_horizon:"night",above_horizon:"day"}[this.hass.states[this._config.entity_sun].state]:"day"}get iconStyle(){return this._config.option_icon_set?this._config.option_icon_set:"old"}get iconSunny(){const t=this.iconStyle;return"old"===t?`${this.dayOrNight}`:`sunny-${this.dayOrNight}`}get iconClear(){const t=this.iconStyle;return"old"===t?`${this.dayOrNight}`:"hybrid"===t?`sunny-${this.dayOrNight}`:`clear-${this.dayOrNight}`}get iconMostlySunny(){this.iconStyle;return`fair-${this.dayOrNight}`}get iconPartlyCloudy(){const t=this.iconStyle;return"old"===t||"hybrid"===t?`cloudy-${this.dayOrNight}-3`:`partly-cloudy-${this.dayOrNight}`}get iconCloudy(){const t=this.iconStyle;return"old"===t||"hybrid"===t?"cloudy-original":"cloudy"}get iconHazy(){const t=this.iconStyle;return"old"===t?`cloudy-${this.dayOrNight}-1`:"haze"}get iconFrost(){this.iconStyle;return`cloudy-${this.dayOrNight}-1`}get iconLightRain(){const t=this.iconStyle;return"old"===t?"rainy-1":`rainy-1-${this.dayOrNight}`}get iconWindy(){const t=this.iconStyle;return"old"===t?"cloudy-original":"wind"}get iconFog(){const t=this.iconStyle;return"old"===t?"cloudy-original":"fog"}get iconShowers(){const t=this.iconStyle;return"old"===t?"rainy-1":`rainy-1-${this.dayOrNight}`}get iconRain(){const t=this.iconStyle;return"old"===t||"hybrid"===t?"rainy-5":"rain"}get iconDust(){const t=this.iconStyle;return"old"===t?`cloudy-${this.dayOrNight}-1`:"haze"}get iconSnow(){const t=this.iconStyle;return"old"===t||"hybrid"===t?"snowy-6":"snow"}get iconSnowRain(){const t=this.iconStyle;return"old"===t?"snowy-6":"rain-and-snow-mix"}get iconStorm(){this.iconStyle;return"scattered-thunderstorms"}get iconLightShowers(){this.iconStyle;return"rainy-2"}get iconHeavyShowers(){this.iconStyle;return"rainy-6"}get iconCyclone(){this.iconStyle;return"tornado"}get iconClearDay(){const t=this.iconStyle;return"old"===t||"hybrid"===t?"day":"clear-day"}get iconClearNight(){const t=this.iconStyle;return"old"===t||"hybrid"===t?"night":"clear-night"}get iconSleet(){const t=this.iconStyle;return"old"===t?"rainy-2":"rain-and-sleet-mix"}get iconPartlyCloudyDay(){const t=this.iconStyle;return"old"===t||"hybrid"===t?"cloudy-day-3":"partly-cloudy-day"}get iconPartlyCloudyNight(){const t=this.iconStyle;return"old"===t||"hybrid"===t?"cloudy-night-3":"partly-cloudy-night"}get iconHail(){this.iconStyle;return"rainy-7"}get iconLightning(){this.iconStyle;return"thunder"}get iconWindyVariant(){this.iconStyle;return`cloudy-${this.dayOrNight}-3`}get locale(){try{return Intl.NumberFormat(this._config.option_locale),this._config.option_locale}catch(t){return}}get localeTextFeelsLike(){switch(this.locale){case"it":return"Percepito";case"fr":return"Ressenti";case"de":return"Gefühlt";case"nl":return"Voelt als";case"pl":return"Odczuwalne";case"he":return"מרגיש כמו";case"da":return"Føles som";case"ru":return"Ощущается как";case"ua":return"Відчувається як";default:return"Feels like"}}get localeTextObservedMax(){return this.locale,"Observed Max"}get localeTextObservedMin(){return this.locale,"Observed Min"}get localeTextObsMax(){return this.locale,"Obs Max"}get localeTextObsMin(){return this.locale,"Obs Min"}get localeTextForecastMax(){switch(this.locale){case"it":return"Max oggi";case"fr":return"Max aujourd'hui";case"de":return"Max heute";case"nl":return"Max vandaag";case"pl":return"Najwyższa dziś";case"he":return"מקסימלי היום";case"da":return"Højeste i dag";case"ru":return"Макс сегодня";case"ua":return"Макс сьогодні";default:return"Forecast Max"}}get localeTextForecastMin(){switch(this.locale){case"it":return"Min oggi";case"fr":return"Min aujourd'hui";case"de":return"Min heute";case"nl":return"Min vandaag";case"pl":return"Najniższa dziś";case"he":return"דקות היום";case"da":return"Laveste i dag";case"ru":return"мин сегодня";case"ua":return"Мін сьогодні";default:return"Forecast Min"}}get localeTextPosToday(){switch(this.locale){case"it":return"Previsione";case"fr":return"Prévoir";case"de":return"Vorhersage";case"nl":return"Prognose";case"pl":return"Prognoza";case"he":return"תַחֲזִית";case"da":return"Vejrudsigt";case"ru":case"ua":return"Прогноз";default:return"Forecast"}}get localeTextPosTomorrow(){switch(this.locale){case"it":return"Prev per domani";case"fr":return"Prév demain";case"de":case"nl":return"Prog morgen";case"pl":return"Prog jutro";case"he":return"תחזית מחר";case"da":return"Prog i morgen";case"ru":case"ua":return"Прогноз на завтра";default:return"Fore Tom"}}get localeTextFore(){switch(this.locale){case"it":return"Prev";case"fr":return"Prév";case"de":case"nl":case"pl":case"da":return"Prog";case"he":return"תַחֲזִית";case"ru":case"ua":return"Прогноз";default:return"Fore"}}get localeTextUVRating(){switch(this.locale){default:return"UV";case"ru":case"ua":return"УФ"}}get localeTextFireDanger(){switch(this.locale){case"it":return"Fuoco";case"fr":return"Feu";case"de":return"Feuer";case"nl":case"da":return"Brand";case"pl":return"Ogień";case"he":return"אֵשׁ";case"ru":return"Огонь";case"ua":return"Вогонь";default:return"Fire"}}getUOM(t){const e=this.hass.config.unit_system.length;switch(t){case"air_pressure":return void 0!==this._config.entity_pressure&&void 0!==this.hass.states[this._config.entity_pressure].attributes.unit_of_measurement?this.hass.states[this._config.entity_pressure].attributes.unit_of_measurement:"km"===e?"hPa":"mbar";case"length":return e;case"precipitation":return"km"===e?"mm":"in";case"intensity":return"km"===e?"mm/h":"in/h";default:return this.hass.config.unit_system[t]||""}}_showConfigWarning(t){return R`
      <hui-warning>
        <div>Weather Card</div>
        ${t.map((t=>R`<div>${t}</div>`))}
      </hui-warning>
    `}_showWarning(t){return R`<hui-warning>${t}</hui-warning>`}_showError(t){const e=document.createElement("hui-error-card");return e.setConfig({type:"error",error:t,origConfig:this._config}),R`${e}`}get styles(){const t=this._config.tooltip_bg_color||"rgb( 75,155,239)",e=this._config.tooltip_fg_color||"#fff",i=this._config.tooltip_border_color||"rgb(255,161,0)",s=this._config.tooltip_border_width||"1",o=this._config.tooltip_caret_size||"5",n=this._config.tooltip_width||"110",r=this._config.option_tooltips?"visible":"hidden",a=this._config.temp_font_weight||"300",c=this._config.temp_font_size||"4em",l=this._config.current_text_font_size||"21px",h=this._config.current_text_alignment||"center";return nt`
      .card {
        padding: 8px 16px 8px 16px;
      }
      .content {
        align-items: center;
      }
      .card-header {
        font-size: 1.5em;
        color: var(--primary-text-color);
      }
      .section {
        margin: -1px;
        border: 1px solid transparent;
        padding-top: 8px;
        padding-bottom: 8px;
      }
      .updated {
        font-size: 0.9em;
        font-weight: 300;
        color: var(--primary-text-color);
      }
      .overview-top {
        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
      }
      .stacked {
        position: absolute;
      }
      .top-left {
        display: flex;
        flex-direction: column;
        height: 112px;
      }
      .top-left-obs {
        display: flex;
        flex-direction: column;
      }
      .big-icon {
        height: 140px;
        width: 140px;
        position: relative;
        left: -8px;
        top: -20px;
      }
      .unknown-condition {
        position: relative;
        top: -60px;
        left: 16px;
      }
      .currentTemps {
        display: flex;
        align-self: flex-start;
        flex-direction: column;
        height: 64px;
      }
      .current-temp {
        display: table-row;
        margin-left: auto;
        padding: 4px 0px;
      }
      .temp {
        display:table-cell;
        font-weight: ${ot(a)};
        font-size: ${ot(c)};
        color: var(--primary-text-color);
        position: relative;
        line-height: 74%;
      }
      .unit-temp-big {
        display: table-cell;
        vertical-align: top;
        font-weight: ${ot(a)};
        font-size: 1.5em;
        color: var(--primary-text-color);
        position: relative;
        line-height: 74%;
      }
      .apparent-temp {
        display: table-row;
        margin-left: auto;
        height: 24px;
      }
      .apparent {
        display: table-cell;
        color: var(--primary-text-color);
        font-weight: 300;
        position: relative;
        line-height: 24px;
      }
      .unit-temp-small {
        display: table-cell;
        vertical-align: top;
        font-size: 10.5px;
        color: var(--primary-text-color);
        position: relative;
        line-height: 14px;
        padding-top: 3.6px;
        padding-left: 1px;
      }
      .line {
        margin-top : 7px;
        margin-bottom: -9px;
        color: var(--primary-text-color);
      }
      .current-text {
        font-size: ${ot(l)};
        text-align: ${ot(h)};
        line-height: 25px;
      }
      .current-text-right {
        font-size: ${ot(l)};
        text-align: ${ot(h)};
        width: 100%;
        align-items: center;
        display: flex;
        justify-content: center;
        line-height: 25px;
        margin-left: -40px;
      }
      .variations {
        display: flex;
        flex-flow: row wrap;
        font-weight: 300;
        color: var(--primary-text-color);
        list-style: none;
        margin-block-start: 0px;
        margin-block-end: 0px;
        padding-inline-start: 8px;
      }
      .slot-list-item-1 {
        min-width:50%;
        padding-right: 8px;
      }
      .slot-list {
        list-style: none;
        padding: 0;
      }
      .slot-list li {
        height:24px;
      }
      .variations-ugly {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        font-weight: 300;
        color: var(--primary-text-color);
        list-style: none;
        margin-block-start: 0px;
        margin-block-end: 0px;
        padding-inline-start: 8px;
      }
      .ha-icon {
        height: 24px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }
      .unit {
        font-size: 0.8em;
        display: table-cell;
        padding-left: 1px;
      }
      .slot {
        display: table-row;
      }
      .slot-icon {
        display: table-cell;
        position: relative;
        height: 18px;
        padding-right: 5px;
        color: var(--paper-item-icon-color);
      }
      .slot-text {
        display: table-cell;
        position: relative;
      }
      .daily-forecast-horiz-section {
        display: flex;
        flex-flow: row wrap;
        width: 100%;
        margin: 0 auto;
        clear: both;
      }
      .daily-forecast-horiz-section .day-horiz:nth-last-child(1) {
        border-right: none;
      }
      .day-horiz {
        flex: 1;
        float: left;
        text-align: center;
        color: var(--primary-text-color);
        border-right: .1em solid #d9d9d9;
        box-sizing: border-box;
      }
      .daily-forecast-vert-section {
        display: flex;
        flex-flow: column nowrap;
        margin: 0 auto;
        clear: both;
      }
      .day-vert {
        flex: 1;
        color: var(--primary-text-color);
        border-top: 1px solid #d9d9d9;
        line-height: 24px;
        box-sizing: border-box;
        padding-bottom: 8px;
      }
      .day-vert-top {
        display: flex;
        width: 100%;
      }
      .day-vert-middle {
        display: flex;
        float: left;
        width: 100%;
      }
      .day-vert-bottom {
        text-align: left;
        float: left;
      }
      .day-vert-dayicon {
        width: 40px;
        text-align: left;
        float: left;
        margin-bottom: -8px;
      }
      .day-vert-temps {
        flex: 1;
        text-align: left;
        float: left;
        padding-left: 1em;
        padding-top: 0.5em;
      }
      .day-vert-rain {
        flex: 2;
        text-align: left;
        float: left;
        padding-left: 1em;
        padding-top: 0.5em;
      }
      .dayname {
        text-transform: uppercase;
      }
      .dayname-vert {
        min-width: 40px;
        max-width: 40px;
        text-transform: uppercase;
      }
      .icon {
        width: 50px;
        height: 50px;
        margin: auto;
        display: inline-block;
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        text-indent: -9999px;
      }
      .f-slot-horiz {
        display: inline-block;
        text-align: center;
        list-style: none;
        overflow: hidden;
        font-weight: 300;
        padding: 0;
        margin-block-start: 0;
        margin-block-end: -12px;
      }
      .f-slot-horiz-text {
        height:20px;
      }
      .f-slot-horiz-icon {
        height:50px;
      }
      .f-summary-vert {
        padding-left: 1em;
        font-weight: 400;
      }
      .f-slot-vert {
        display: table;
        overflow: hidden;
        height: 24px;
        font-weight: 300;
      }
      .f-slot-minmax {
        width: 100%;
      }
      .f-extended {
        display: inline-table;
        font-size: 13px;
        font-weight: 300;
        padding-top: 8px;
        line-height:20px;
      }
      .extended-section .f-extended {
        padding-top: 0;
      }
      .highTemp {
        display: table-cell;
        font-weight: bold;
      }
      .lowTemp {
        display: table-cell;
        font-weight: 300;
      }
      .slash {
        padding-left: 2px;
        padding-right: 2px;
      }
      .high-temp {
        display: table-cell;
        font-weight: bold;
        width: 21px;
        text-align: right;
      }
      .low-temp {
        display: table-cell;
        font-weight: 300;
        width: 21px;
        text-align: right;
      }
      .temp-label {
        display: table-cell;
        width: 32px;
        font-weight: 300;
      }
      .f-label {
        display: table-cell;
        white-space: nowrap;
        padding-right: 0.2em;
      }
      .pop {
        display: table-cell;
        font-weight: 300;
        color: var(--primary-text-color);
      }
      .pos {
        display: table-cell;
        font-weight: 300;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .fcasttooltip {
        position: relative;
        display: inline-block;
      }
      .fcasttooltip .fcasttooltiptext {
        visibility: hidden;
        width: ${ot(n)}px;
        background-color: ${ot(t)};
        color: ${ot(e)};
        text-align: center;
        border-radius: 6px;
        border-style: solid;
        border-color: ${ot(i)};
        border-width: ${ot(s)}px;
        padding: 5px 0;
        /* Position the tooltip */
        position: absolute;
        z-index: 1;
        bottom: 100%;
        left: 50%;
        -webkit-transform: translateX(-50%); /* Safari iOS */
        transform: translateX(-50%);
      }
      .fcasttooltip .fcasttooltiptext:after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -${ot(o)}px;
        border-width: ${ot(o)}px;
        border-style: solid;
        border-color: ${ot(i)} transparent transparent transparent;
      }
      .fcasttooltip:hover .fcasttooltiptext {
        visibility: ${ot(r)};
      }
    `}};s([$t({attribute:!1})],ne.prototype,"hass",void 0),s([xt()],ne.prototype,"_config",void 0),s([xt()],ne.prototype,"_cardWidth",void 0),ne=s([bt("platinum-weather-card")],ne);export{ne as P,e as _,i as a,s as b,W as c,o as d,$t as e,bt as f,rt as i,Nt as l,Ft as n,St as o,nt as r,mt as s,xt as t,z as x,R as y};
