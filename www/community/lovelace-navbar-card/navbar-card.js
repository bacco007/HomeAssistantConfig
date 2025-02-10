function t(t,e,i,o){var s,n=arguments.length,r=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,o);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=window,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),s=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const r=t=>new n("string"==typeof t?t:t+"",void 0,o),l=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1]),t[0]);return new n(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return r(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var d;const c=window,h=c.trustedTypes,u=h?h.emptyScript:"",p=c.reactiveElementPolyfillSupport,v={toAttribute(t,e){switch(e){case Boolean:t=t?u:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},f=(t,e)=>e!==t&&(e==e||t==t),m={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:f},_="finalized";let $=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const o=this._$Ep(i,e);void 0!==o&&(this._$Ev.set(o,i),t.push(o))})),t}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,o=this.getPropertyDescriptor(t,i,e);void 0!==o&&Object.defineProperty(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(o){const s=this[t];this[e]=o,this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||m}static finalize(){if(this.hasOwnProperty(_))return!1;this[_]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const o=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{i?t.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):o.forEach((i=>{const o=document.createElement("style"),s=e.litNonce;void 0!==s&&o.setAttribute("nonce",s),o.textContent=i.cssText,t.appendChild(o)}))})(o,this.constructor.elementStyles),o}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=m){var o;const s=this.constructor._$Ep(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==(null===(o=i.converter)||void 0===o?void 0:o.toAttribute)?i.converter:v).toAttribute(e,i.type);this._$El=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$El=null}}_$AK(t,e){var i;const o=this.constructor,s=o._$Ev.get(t);if(void 0!==s&&this._$El!==s){const t=o.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:v;this._$El=s,this[s]=n.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let o=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||f)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):o=!1),!this.isUpdatePending&&o&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var g;$[_]=!0,$.elementProperties=new Map,$.elementStyles=[],$.shadowRootOptions={mode:"open"},null==p||p({ReactiveElement:$}),(null!==(d=c.reactiveElementVersions)&&void 0!==d?d:c.reactiveElementVersions=[]).push("1.6.3");const b=window,y=b.trustedTypes,A=y?y.createPolicy("lit-html",{createHTML:t=>t}):void 0,w="$lit$",E=`lit$${(Math.random()+"").slice(9)}$`,x="?"+E,S=`<${x}>`,C=document,k=()=>C.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,U="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,T=/>/g,N=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),M=/'/g,z=/"/g,j=/^(?:script|style|textarea|title)$/i,D=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),I=new WeakMap,W=C.createTreeWalker(C,129,null,!1);function q(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const V=(t,e)=>{const i=t.length-1,o=[];let s,n=2===e?"<svg>":"",r=R;for(let e=0;e<i;e++){const i=t[e];let l,a,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,a=r.exec(i),null!==a);)c=r.lastIndex,r===R?"!--"===a[1]?r=H:void 0!==a[1]?r=T:void 0!==a[2]?(j.test(a[2])&&(s=RegExp("</"+a[2],"g")),r=N):void 0!==a[3]&&(r=N):r===N?">"===a[0]?(r=null!=s?s:R,d=-1):void 0===a[1]?d=-2:(d=r.lastIndex-a[2].length,l=a[1],r=void 0===a[3]?N:'"'===a[3]?z:M):r===z||r===M?r=N:r===H||r===T?r=R:(r=N,s=void 0);const h=r===N&&t[e+1].startsWith("/>")?" ":"";n+=r===R?i+S:d>=0?(o.push(l),i.slice(0,d)+w+i.slice(d)+E+h):i+E+(-2===d?(o.push(void 0),e):h)}return[q(t,n+(t[i]||"<?>")+(2===e?"</svg>":"")),o]};class K{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let s=0,n=0;const r=t.length-1,l=this.parts,[a,d]=V(t,e);if(this.el=K.createElement(a,i),W.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(o=W.nextNode())&&l.length<r;){if(1===o.nodeType){if(o.hasAttributes()){const t=[];for(const e of o.getAttributeNames())if(e.endsWith(w)||e.startsWith(E)){const i=d[n++];if(t.push(e),void 0!==i){const t=o.getAttribute(i.toLowerCase()+w).split(E),e=/([.?@])?(.*)/.exec(i);l.push({type:1,index:s,name:e[2],strings:t,ctor:"."===e[1]?Q:"?"===e[1]?Y:"@"===e[1]?tt:G})}else l.push({type:6,index:s})}for(const e of t)o.removeAttribute(e)}if(j.test(o.tagName)){const t=o.textContent.split(E),e=t.length-1;if(e>0){o.textContent=y?y.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],k()),W.nextNode(),l.push({type:2,index:++s});o.append(t[e],k())}}}else if(8===o.nodeType)if(o.data===x)l.push({type:2,index:s});else{let t=-1;for(;-1!==(t=o.data.indexOf(E,t+1));)l.push({type:7,index:s}),t+=E.length-1}s++}}static createElement(t,e){const i=C.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,o){var s,n,r,l;if(e===L)return e;let a=void 0!==o?null===(s=i._$Co)||void 0===s?void 0:s[o]:i._$Cl;const d=P(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==d&&(null===(n=null==a?void 0:a._$AO)||void 0===n||n.call(a,!1),void 0===d?a=void 0:(a=new d(t),a._$AT(t,i,o)),void 0!==o?(null!==(r=(l=i)._$Co)&&void 0!==r?r:l._$Co=[])[o]=a:i._$Cl=a),void 0!==a&&(e=J(t,a._$AS(t,e.values),a,o)),e}class Z{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:o}=this._$AD,s=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:C).importNode(i,!0);W.currentNode=s;let n=W.nextNode(),r=0,l=0,a=o[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new F(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new et(n,this,t)),this._$AV.push(e),a=o[++l]}r!==(null==a?void 0:a.index)&&(n=W.nextNode(),r++)}return W.currentNode=C,s}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class F{constructor(t,e,i,o){var s;this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cp=null===(s=null==o?void 0:o.isConnected)||void 0===s||s}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),P(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>O(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==B&&P(this._$AH)?this._$AA.nextSibling.data=t:this.$(C.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:o}=t,s="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=K.createElement(q(o.h,o.h[0]),this.options)),o);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===s)this._$AH.v(i);else{const t=new Z(s,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=I.get(t.strings);return void 0===e&&I.set(t.strings,e=new K(t)),e}T(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const s of t)o===e.length?e.push(i=new F(this.k(k()),this.k(k()),this,this.options)):i=e[o],i._$AI(s),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class G{constructor(t,e,i,o,s){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,o){const s=this.strings;let n=!1;if(void 0===s)t=J(this,t,e,0),n=!P(t)||t!==this._$AH&&t!==L,n&&(this._$AH=t);else{const o=t;let r,l;for(t=s[0],r=0;r<s.length-1;r++)l=J(this,o[i+r],e,r),l===L&&(l=this._$AH[r]),n||(n=!P(l)||l!==this._$AH[r]),l===B?t=B:t!==B&&(t+=(null!=l?l:"")+s[r+1]),this._$AH[r]=l}n&&!o&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Q extends G{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}const X=y?y.emptyScript:"";class Y extends G{constructor(){super(...arguments),this.type=4}j(t){t&&t!==B?this.element.setAttribute(this.name,X):this.element.removeAttribute(this.name)}}class tt extends G{constructor(t,e,i,o,s){super(t,e,i,o,s),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=J(this,t,e,0))&&void 0!==i?i:B)===L)return;const o=this._$AH,s=t===B&&o!==B||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,n=t!==B&&(o===B||s);s&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class et{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const it=b.litHtmlPolyfillSupport;null==it||it(K,F),(null!==(g=b.litHtmlVersions)&&void 0!==g?g:b.litHtmlVersions=[]).push("2.8.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ot,st;class nt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var o,s;const n=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:e;let r=n._$litPart$;if(void 0===r){const t=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:null;n._$litPart$=r=new F(e.insertBefore(k(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return L}}nt.finalized=!0,nt._$litElement$=!0,null===(ot=globalThis.litElementHydrateSupport)||void 0===ot||ot.call(globalThis,{LitElement:nt});const rt=globalThis.litElementPolyfillSupport;null==rt||rt({LitElement:nt}),(null!==(st=globalThis.litElementVersions)&&void 0!==st?st:globalThis.litElementVersions=[]).push("3.3.3");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function at(t){return function(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):lt(t,e)}({...t,state:!0})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var dt;null===(dt=window.HTMLSlotElement)||void 0===dt||dt.prototype.assignedElements;var ct,ht;!function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(ct||(ct={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(ht||(ht={}));var ut,pt=function(t,e,i){void 0===i&&(i=!1),i?history.replaceState(null,"",e):history.pushState(null,"",e),function(t,e,i,o){o=o||{},i=null==i?{}:i;var s=new Event(e,{bubbles:void 0===o.bubbles||o.bubbles,cancelable:Boolean(o.cancelable),composed:void 0===o.composed||o.composed});s.detail=i,t.dispatchEvent(s)}(window,"location-changed",{replace:i})};!function(t){t.top="top",t.left="left",t.bottom="bottom",t.right="right"}(ut||(ut={}));window.customCards=window.customCards||[],window.customCards.push({type:"navbar-card",name:"Navbar card",preview:!0,description:"Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen."});let vt=class extends nt{constructor(){super(...arguments),this._onResize=()=>{this.screenWidth=window.innerWidth},this._handleClick=t=>{if(null!=t.tap_action){const e=new Event("hass-action",{bubbles:!0,composed:!0});e.detail={action:"tap",config:{tap_action:t.tap_action}},this.dispatchEvent(e)}else pt(0,t.url)}}evaluateBadge(t){if(!t||!this.hass)return!1;try{return new Function("states",`return ${t}`)(this.hass.states)}catch(t){return console.warn(`NavbarCard: Error evaluating badge template: ${t}`),!1}}connectedCallback(){var t,e,i,o,s;super.connectedCallback(),this._location=window.location.pathname,window.addEventListener("resize",this._onResize),this.screenWidth=window.innerWidth,this._inEditMode=null!=(null===(t=this.parentElement)||void 0===t?void 0:t.closest("hui-card-edit-mode")),this._inPreviewMode=null!=(null===(s=null===(o=null===(i=null===(e=document.querySelector("body > home-assistant"))||void 0===e?void 0:e.shadowRoot)||void 0===i?void 0:i.querySelector("hui-dialog-edit-card"))||void 0===o?void 0:o.shadowRoot)||void 0===s?void 0:s.querySelector("ha-dialog > div.content > div.element-preview"))}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this._onResize)}setConfig(t){if(null==t?void 0:t.template){const e=(()=>{var t,e,i,o;const s=null===(o=null===(i=null===(e=null===(t=null===document||void 0===document?void 0:document.querySelector("home-assistant"))||void 0===t?void 0:t.shadowRoot)||void 0===e?void 0:e.querySelector("home-assistant-main"))||void 0===i?void 0:i.shadowRoot)||void 0===o?void 0:o.querySelector("ha-drawer partial-panel-resolver ha-panel-lovelace");return s?s.lovelace.config["navbar-templates"]:null})();if(e){const i=e[t.template];i&&(t=Object.assign(Object.assign({},i),t))}else console.warn('[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.\n\nhttps://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates\n')}if(!t.routes)throw new Error('"routes" param is required for navbar card');t.routes.forEach((t=>{if(null==t.icon)throw new Error('Each route must have an "icon" property configured');if(null==t.tap_action&&null==t.url)throw new Error('Each route must either have a "url" or a "tap_action" param')})),this._config=t}shouldUpdate(t){let e=!1;return t.forEach(((t,i)=>{var o;(["_config","screenWidth","_inEditMode","_inPreviewMode","_location"].includes(i)||"hass"==i&&(new Date).getTime()-(null!==(o=this._lastRender)&&void 0!==o?o:0)>1e3)&&(e=!0)})),e}render(){var t,e;if(!this._config)return D``;const{routes:i,desktop:o,mobile:s}=this._config,{position:n,show_labels:r,min_width:l}=null!=o?o:{},{show_labels:a}=null!=s?s:{};this._lastRender=(new Date).getTime();const d=(null!==(t=this.screenWidth)&&void 0!==t?t:0)>=(null!=l?l:768),c=null!==(e=((t,e)=>{if(Object.values(t).includes(e))return e})(ut,n))&&void 0!==e?e:ut.bottom,h=d?"desktop":"mobile",u=this._inEditMode||this._inPreviewMode?"edit-mode":"";return D`
      <style>
        ${this.customStyles}
      </style>
      <ha-card
        class="navbar ${u} ${h} ${c}">
        ${null==i?void 0:i.map(((t,e)=>{var i,o,s;const n=this._location==t.url,l=this.evaluateBadge(null===(i=t.badge)||void 0===i?void 0:i.template);return D`
            <div
              key="navbar_item_${e}"
              class="route ${n?"active":""}"
              @click=${()=>this._handleClick(t)}>
              ${l?D`<div
                    class="badge ${n?"active":""}"
                    style="background-color: ${(null===(o=t.badge)||void 0===o?void 0:o.color)||"red"};"></div>`:D``}

              <div class="button ${n?"active":""}">
                <ha-icon
                  class="icon ${n?"active":""}"
                  icon="${n&&t.icon_selected?t.icon_selected:t.icon}"></ha-icon>
              </div>
              ${d&&r||!d&&a?D`<div class="label ${n?"active":""}">
                    ${null!==(s=t.label)&&void 0!==s?s:" "}
                  </div>`:D``}
            </div>
          `}))}
      </ha-card>
    `}get customStyles(){var t;const e=(null===(t=this._config)||void 0===t?void 0:t.styles)?r(this._config.styles):l``;return[this.defaultStyles,e]}get defaultStyles(){return l`
      .navbar {
        --navbar-background-color: var(--card-background-color);
        --navbar-route-icon-size: 24px;
        --navbar-primary-color: var(--primary-color);

        background: var(--navbar-background-color);
        border-radius: 0px;
        /* TODO harcoded box shadow? */
        box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14);
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
        z-index: 2; /* TODO check if needed */
      }
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
        transition: filter 0.2s ease;
        --icon-primary-color: var(--state-inactive-color);
      }
      .route:hover {
        filter: brightness(1.2);
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

      /* Icon styling */
      .icon {
        --mdc-icon-size: var(--navbar-route-icon-size);
      }

      /* Label styling */
      .label {
        flex: 1;
        width: 100%;
        /* TODO fix ellipsis*/
        text-align: center;
        font-size: var(--paper-font-caption_-_font-size);
        font-weight: 500;
        font-family: var(--paper-font-caption_-_font-size);
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
        box-shadow: var(--material-shadow-elevation-2dp);
        width: auto;
        justify-content: space-evenly;

        --navbar-route-icon-size: 28px;
      }
      .navbar.desktop.bottom {
        flex-direction: row;
        top: unset;
        right: unset;
        bottom: 16px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      .navbar.desktop.top {
        flex-direction: row;
        bottom: unset;
        right: unset;
        top: 16px;
        left: 50%;
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
      .navbar.desktop .route {
        height: 60px;
        width: 60px;
      }
      .navbar.desktop .button {
        flex: unset;
        height: 100%;
      }
    `}};t([at()],vt.prototype,"hass",void 0),t([at()],vt.prototype,"_config",void 0),t([at()],vt.prototype,"screenWidth",void 0),t([at()],vt.prototype,"_inEditMode",void 0),t([at()],vt.prototype,"_inPreviewMode",void 0),t([at()],vt.prototype,"_lastRender",void 0),t([at()],vt.prototype,"_location",void 0),vt=t([(t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:o}=e;return{kind:i,elements:o,finisher(e){customElements.define(t,e)}}})(t,e))("navbar-card")],vt),console.info("%c navbar-card %c 0.1.1 ","background-color: #555;      padding: 6px 4px;      color: #fff;      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);       border-radius: 10px 0 0 10px;","background-color: #00abd1;       padding: 6px 4px;      color: #fff;      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);       border-radius: 0 10px 10px 0;");export{vt as NavbarCard};
