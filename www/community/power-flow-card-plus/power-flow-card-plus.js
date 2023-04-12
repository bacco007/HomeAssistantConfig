function t(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a}var e,i;function o(){return(o=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var o in i)Object.prototype.hasOwnProperty.call(i,o)&&(t[o]=i[o])}return t}).apply(this,arguments)}!function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(e||(e={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(i||(i={}));var n=function(t,i,o){var n=i?function(t){switch(t.number_format){case e.comma_decimal:return["en-US","en"];case e.decimal_comma:return["de","es","it"];case e.space_comma:return["fr","sv","cs"];case e.system:return;default:return t.language}}(i):void 0;if(Number.isNaN=Number.isNaN||function t(e){return"number"==typeof e&&t(e)},(null==i?void 0:i.number_format)!==e.none&&!Number.isNaN(Number(t))&&Intl)try{return new Intl.NumberFormat(n,r(t,o)).format(Number(t))}catch(e){return console.error(e),new Intl.NumberFormat(void 0,r(t,o)).format(Number(t))}return"string"==typeof t?t:function(t,e){return void 0===e&&(e=2),Math.round(t*Math.pow(10,e))/Math.pow(10,e)}(t,null==o?void 0:o.maximumFractionDigits).toString()+("currency"===(null==o?void 0:o.style)?" "+o.currency:"")},r=function(t,e){var i=o({maximumFractionDigits:2},e);if("string"!=typeof t)return i;if(!e||!e.minimumFractionDigits&&!e.maximumFractionDigits){var n=t.indexOf(".")>-1?t.split(".")[1].length:0;i.minimumFractionDigits=n,i.maximumFractionDigits=n}return i};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const a=window,l=a.ShadowRoot&&(void 0===a.ShadyCSS||a.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),d=new WeakMap;class c{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(l&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=d.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&d.set(e,t))}return t}toString(){return this.cssText}}const h=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1]),t[0]);return new c(i,t,s)},v=l?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new c("string"==typeof t?t:t+"",void 0,s))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var u;const y=window,p=y.trustedTypes,m=p?p.emptyScript:"",f=y.reactiveElementPolyfillSupport,g={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},_=(t,e)=>e!==t&&(e==e||t==t),b={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:_};class $ extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const o=this._$Ep(i,e);void 0!==o&&(this._$Ev.set(o,i),t.push(o))})),t}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,o=this.getPropertyDescriptor(t,i,e);void 0!==o&&Object.defineProperty(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(o){const n=this[t];this[e]=o,this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||b}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(v(t))}else void 0!==t&&e.push(v(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{l?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),o=a.litNonce;void 0!==o&&i.setAttribute("nonce",o),i.textContent=e.cssText,t.appendChild(i)}))})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=b){var o;const n=this.constructor._$Ep(t,i);if(void 0!==n&&!0===i.reflect){const r=(void 0!==(null===(o=i.converter)||void 0===o?void 0:o.toAttribute)?i.converter:g).toAttribute(e,i.type);this._$El=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$El=null}}_$AK(t,e){var i;const o=this.constructor,n=o._$Ev.get(t);if(void 0!==n&&this._$El!==n){const t=o.getPropertyOptions(n),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:g;this._$El=n,this[n]=r.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let o=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||_)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):o=!1),!this.isUpdatePending&&o&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var w;$.finalized=!0,$.elementProperties=new Map,$.elementStyles=[],$.shadowRootOptions={mode:"open"},null==f||f({ReactiveElement:$}),(null!==(u=y.reactiveElementVersions)&&void 0!==u?u:y.reactiveElementVersions=[]).push("1.6.1");const x=window,k=x.trustedTypes,C=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",E=`lit$${(Math.random()+"").slice(9)}$`,A="?"+E,M=`<${A}>`,P=document,D=()=>P.createComment(""),N=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,T="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,H=/>/g,R=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,j=/"/g,L=/^(?:script|style|textarea|title)$/i,W=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),B=W(1),F=W(2),V=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),Z=new WeakMap,Y=P.createTreeWalker(P,129,null,!1),q=(t,e)=>{const i=t.length-1,o=[];let n,r=2===e?"<svg>":"",a=I;for(let e=0;e<i;e++){const i=t[e];let l,s,d=-1,c=0;for(;c<i.length&&(a.lastIndex=c,s=a.exec(i),null!==s);)c=a.lastIndex,a===I?"!--"===s[1]?a=O:void 0!==s[1]?a=H:void 0!==s[2]?(L.test(s[2])&&(n=RegExp("</"+s[2],"g")),a=R):void 0!==s[3]&&(a=R):a===R?">"===s[0]?(a=null!=n?n:I,d=-1):void 0===s[1]?d=-2:(d=a.lastIndex-s[2].length,l=s[1],a=void 0===s[3]?R:'"'===s[3]?j:U):a===j||a===U?a=R:a===O||a===H?a=I:(a=R,n=void 0);const h=a===R&&t[e+1].startsWith("/>")?" ":"";r+=a===I?i+M:d>=0?(o.push(l),i.slice(0,d)+S+i.slice(d)+E+h):i+E+(-2===d?(o.push(void 0),e):h)}const l=r+(t[i]||"<?>")+(2===e?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==C?C.createHTML(l):l,o]};class K{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,r=0;const a=t.length-1,l=this.parts,[s,d]=q(t,e);if(this.el=K.createElement(s,i),Y.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(o=Y.nextNode())&&l.length<a;){if(1===o.nodeType){if(o.hasAttributes()){const t=[];for(const e of o.getAttributeNames())if(e.endsWith(S)||e.startsWith(E)){const i=d[r++];if(t.push(e),void 0!==i){const t=o.getAttribute(i.toLowerCase()+S).split(E),e=/([.?@])?(.*)/.exec(i);l.push({type:1,index:n,name:e[2],strings:t,ctor:"."===e[1]?et:"?"===e[1]?ot:"@"===e[1]?nt:tt})}else l.push({type:6,index:n})}for(const e of t)o.removeAttribute(e)}if(L.test(o.tagName)){const t=o.textContent.split(E),e=t.length-1;if(e>0){o.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],D()),Y.nextNode(),l.push({type:2,index:++n});o.append(t[e],D())}}}else if(8===o.nodeType)if(o.data===A)l.push({type:2,index:n});else{let t=-1;for(;-1!==(t=o.data.indexOf(E,t+1));)l.push({type:7,index:n}),t+=E.length-1}n++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,o){var n,r,a,l;if(e===V)return e;let s=void 0!==o?null===(n=i._$Co)||void 0===n?void 0:n[o]:i._$Cl;const d=N(e)?void 0:e._$litDirective$;return(null==s?void 0:s.constructor)!==d&&(null===(r=null==s?void 0:s._$AO)||void 0===r||r.call(s,!1),void 0===d?s=void 0:(s=new d(t),s._$AT(t,i,o)),void 0!==o?(null!==(a=(l=i)._$Co)&&void 0!==a?a:l._$Co=[])[o]=s:i._$Cl=s),void 0!==s&&(e=J(t,s._$AS(t,e.values),s,o)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:o}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:P).importNode(i,!0);Y.currentNode=n;let r=Y.nextNode(),a=0,l=0,s=o[0];for(;void 0!==s;){if(a===s.index){let e;2===s.type?e=new X(r,r.nextSibling,this,t):1===s.type?e=new s.ctor(r,s.name,s.strings,this,t):6===s.type&&(e=new rt(r,this,t)),this._$AV.push(e),s=o[++l]}a!==(null==s?void 0:s.index)&&(r=Y.nextNode(),a++)}return n}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{constructor(t,e,i,o){var n;this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cp=null===(n=null==o?void 0:o.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),N(t)?t===G||null==t||""===t?(this._$AH!==G&&this._$AR(),this._$AH=G):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>z(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==G&&N(this._$AH)?this._$AA.nextSibling.data=t:this.$(P.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:o}=t,n="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=K.createElement(o.h,this.options)),o);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.v(i);else{const t=new Q(n,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=Z.get(t.strings);return void 0===e&&Z.set(t.strings,e=new K(t)),e}T(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const n of t)o===e.length?e.push(i=new X(this.k(D()),this.k(D()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class tt{constructor(t,e,i,o,n){this.type=1,this._$AH=G,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,o){const n=this.strings;let r=!1;if(void 0===n)t=J(this,t,e,0),r=!N(t)||t!==this._$AH&&t!==V,r&&(this._$AH=t);else{const o=t;let a,l;for(t=n[0],a=0;a<n.length-1;a++)l=J(this,o[i+a],e,a),l===V&&(l=this._$AH[a]),r||(r=!N(l)||l!==this._$AH[a]),l===G?t=G:t!==G&&(t+=(null!=l?l:"")+n[a+1]),this._$AH[a]=l}r&&!o&&this.j(t)}j(t){t===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===G?void 0:t}}const it=k?k.emptyScript:"";class ot extends tt{constructor(){super(...arguments),this.type=4}j(t){t&&t!==G?this.element.setAttribute(this.name,it):this.element.removeAttribute(this.name)}}class nt extends tt{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=J(this,t,e,0))&&void 0!==i?i:G)===V)return;const o=this._$AH,n=t===G&&o!==G||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,r=t!==G&&(o===G||n);n&&this.element.removeEventListener(this.name,this,o),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const at=x.litHtmlPolyfillSupport;null==at||at(K,X),(null!==(w=x.litHtmlVersions)&&void 0!==w?w:x.litHtmlVersions=[]).push("2.7.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var lt,st;class dt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var o,n;const r=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:e;let a=r._$litPart$;if(void 0===a){const t=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;r._$litPart$=a=new X(e.insertBefore(D(),t),t,void 0,null!=i?i:{})}return a._$AI(t),a})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return V}}dt.finalized=!0,dt._$litElement$=!0,null===(lt=globalThis.litElementHydrateSupport)||void 0===lt||lt.call(globalThis,{LitElement:dt});const ct=globalThis.litElementPolyfillSupport;null==ct||ct({LitElement:dt}),(null!==(st=globalThis.litElementVersions)&&void 0!==st?st:globalThis.litElementVersions=[]).push("3.3.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:o}=e;return{kind:i,elements:o,finisher(e){customElements.define(t,e)}}})(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,vt=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function ut(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):vt(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function yt(t){return ut({...t,state:!0})}
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
function pt(t,e){return(({finisher:t,descriptor:e})=>(i,o)=>{var n;if(void 0===o){const o=null!==(n=i.originalKey)&&void 0!==n?n:i.key,r=null!=e?{kind:"method",placement:"prototype",key:o,descriptor:e(i.key)}:{...i,key:o};return null!=t&&(r.finisher=function(e){t(e,o)}),r}{const n=i.constructor;void 0!==e&&Object.defineProperty(i,o,e(o)),null==t||t(n,o)}})({descriptor:i=>{const o={get(){var e,i;return null!==(i=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(t))&&void 0!==i?i:null},enumerable:!0,configurable:!0};if(e){const e="symbol"==typeof i?Symbol():"__"+i;o.get=function(){var i,o;return void 0===this[e]&&(this[e]=null!==(o=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(t))&&void 0!==o?o:null),this[e]}}return o}})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var mt;null===(mt=window.HTMLSlotElement)||void 0===mt||mt.prototype.assignedElements;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ft=1;class gt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _t=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends gt{constructor(t){var e;if(super(t),t.type!==ft||"class"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter((e=>t[e])).join(" ")+" "}update(t,[e]){var i,o;if(void 0===this.it){this.it=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in e)e[t]&&!(null===(i=this.nt)||void 0===i?void 0:i.has(t))&&this.it.add(t);return this.render(e)}const n=t.element.classList;this.it.forEach((t=>{t in e||(n.remove(t),this.it.delete(t))}));for(const t in e){const i=!!e[t];i===this.it.has(t)||(null===(o=this.nt)||void 0===o?void 0:o.has(t))||(i?(n.add(t),this.it.add(t)):(n.remove(t),this.it.delete(t)))}return V}}),bt=(t,e)=>Number(`${Math.round(Number(`${t}e${e}`))}e-${e}`)
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */;function $t(t){return!isNaN(parseFloat(t))&&!isNaN(Number(t))}function wt(t,e=0){return $t(t)?Number(t):e}function xt(t,e=/\s+/){const i=[];if(null!=t){const o=Array.isArray(t)?t:`${t}`.split(e);for(const t of o){const e=`${t}`.trim();e&&i.push(e)}}return i}var kt="0.0.8";console.groupCollapsed(`%c⚡ Power Flow Card Plus v${kt} is installed`,"color: #488fc2; font-weight: bold"),console.log("Readme:","https://github.com/flixlix/power-flow-card-plus"),console.groupEnd();const Ct=function(t,e,i){var o;return void 0===i&&(i=!1),function(){var n=[].slice.call(arguments),r=this,a=i&&!o;clearTimeout(o),o=setTimeout((function(){o=null,i||t.apply(r,n)}),e),a&&t.apply(r,n)}}((t=>{console.log(`%c⚡ Power Flow Card Plus v${kt} %cError: ${t}`,"color: #488fc2; font-weight: bold","color: #b33a3a; font-weight: normal")}),6e4);class St extends TypeError{constructor(t,e){let i;const{message:o,explanation:n,...r}=t,{path:a}=t,l=0===a.length?o:`At path: ${a.join(".")} -- ${o}`;super(n??l),null!=n&&(this.cause=l),Object.assign(this,r),this.name=this.constructor.name,this.failures=()=>i??(i=[t,...e()])}}function Et(t){return"object"==typeof t&&null!=t}function At(t){return"symbol"==typeof t?t.toString():"string"==typeof t?JSON.stringify(t):`${t}`}function Mt(t,e,i,o){if(!0===t)return;!1===t?t={}:"string"==typeof t&&(t={message:t});const{path:n,branch:r}=e,{type:a}=i,{refinement:l,message:s=`Expected a value of type \`${a}\`${l?` with refinement \`${l}\``:""}, but received: \`${At(o)}\``}=t;return{value:o,type:a,refinement:l,key:n[n.length-1],path:n,branch:r,...t,message:s}}function*Pt(t,e,i,o){(function(t){return Et(t)&&"function"==typeof t[Symbol.iterator]})(t)||(t=[t]);for(const n of t){const t=Mt(n,e,i,o);t&&(yield t)}}function*Dt(t,e,i={}){const{path:o=[],branch:n=[t],coerce:r=!1,mask:a=!1}=i,l={path:o,branch:n};if(r&&(t=e.coercer(t,l),a&&"type"!==e.type&&Et(e.schema)&&Et(t)&&!Array.isArray(t)))for(const i in t)void 0===e.schema[i]&&delete t[i];let s="valid";for(const o of e.validator(t,l))o.explanation=i.message,s="not_valid",yield[o,void 0];for(let[d,c,h]of e.entries(t,l)){const e=Dt(c,h,{path:void 0===d?o:[...o,d],branch:void 0===d?n:[...n,c],coerce:r,mask:a,message:i.message});for(const i of e)i[0]?(s=null!=i[0].refinement?"not_refined":"not_valid",yield[i[0],void 0]):r&&(c=i[1],void 0===d?t=c:t instanceof Map?t.set(d,c):t instanceof Set?t.add(c):Et(t)&&(void 0!==c||d in t)&&(t[d]=c))}if("not_valid"!==s)for(const o of e.refiner(t,l))o.explanation=i.message,s="not_refined",yield[o,void 0];"valid"===s&&(yield[void 0,t])}class Nt{constructor(t){const{type:e,schema:i,validator:o,refiner:n,coercer:r=(t=>t),entries:a=function*(){}}=t;this.type=e,this.schema=i,this.entries=a,this.coercer=r,this.validator=o?(t,e)=>Pt(o(t,e),e,this,t):()=>[],this.refiner=n?(t,e)=>Pt(n(t,e),e,this,t):()=>[]}assert(t,e){return zt(t,this,e)}create(t,e){return function(t,e,i){const o=Tt(t,e,{coerce:!0,message:i});if(o[0])throw o[0];return o[1]}(t,this,e)}is(t){return function(t,e){const i=Tt(t,e);return!i[0]}(t,this)}mask(t,e){return function(t,e,i){const o=Tt(t,e,{coerce:!0,mask:!0,message:i});if(o[0])throw o[0];return o[1]}(t,this,e)}validate(t,e={}){return Tt(t,this,e)}}function zt(t,e,i){const o=Tt(t,e,{message:i});if(o[0])throw o[0]}function Tt(t,e,i={}){const o=Dt(t,e,i),n=function(t){const{done:e,value:i}=t.next();return e?void 0:i}(o);if(n[0]){const t=new St(n[0],(function*(){for(const t of o)t[0]&&(yield t[0])}));return[t,void 0]}return[void 0,n[1]]}function It(t,e){return new Nt({type:t,schema:null,validator:e})}function Ot(){return It("any",(()=>!0))}function Ht(){return It("boolean",(t=>"boolean"==typeof t))}function Rt(){return It("integer",(t=>"number"==typeof t&&!isNaN(t)&&Number.isInteger(t)||`Expected an integer, but received: ${At(t)}`))}function Ut(t){const e=t?Object.keys(t):[],i=It("never",(()=>!1));return new Nt({type:"object",schema:t||null,*entries(o){if(t&&Et(o)){const n=new Set(Object.keys(o));for(const i of e)n.delete(i),yield[i,o[i],t[i]];for(const t of n)yield[t,o[t],i]}},validator:t=>Et(t)||`Expected an object, but received: ${At(t)}`,coercer:t=>Et(t)?{...t}:t})}function jt(t){return new Nt({...t,validator:(e,i)=>void 0===e||t.validator(e,i),refiner:(e,i)=>void 0===e||t.refiner(e,i)})}function Lt(){return It("string",(t=>"string"==typeof t||`Expected a string, but received: ${At(t)}`))}const Wt=t=>t.includes("."),Bt=()=>{return t=Lt(),e="entity ID (domain.entity)",i=Wt,new Nt({...t,*refiner(o,n){yield*t.refiner(o,n);const r=Pt(i(o,n),n,t,o);for(const t of r)yield{...t,refinement:e}}});var t,e,i},Ft=function(...t){const e="type"===t[0].type,i=t.map((t=>t.schema)),o=Object.assign({},...i);return e?function(t){const e=Object.keys(t);return new Nt({type:"type",schema:t,*entries(i){if(Et(i))for(const o of e)yield[o,i[o],t[o]]},validator:t=>Et(t)||`Expected an object, but received: ${At(t)}`,coercer:t=>Et(t)?{...t}:t})}(o):Ut(o)}(Ut({type:Lt(),view_layout:Ot()}),Ut({title:jt(Lt()),theme:jt(Lt()),dashboard_link:jt(Lt()),dashboard_link_label:jt(Lt()),inverted_entities:jt(Ot()),kw_decimals:jt(Rt()),min_flow_rate:jt(Rt()),max_flow_rate:jt(Rt()),max_expected_flow_w:jt(Rt()),w_decimals:jt(Rt()),watt_threshold:jt(Rt()),clickable_entities:jt(Ht()),entities:jt(Ut({battery:jt(Ut({entity:jt(Bt()),state_of_charge:jt(Bt()),name:jt(Lt()),icon:jt(Lt()),color:jt(Ut({consumption:jt(Lt()),production:jt(Lt())})),color_icon:jt(Ot()),display_state:jt(Lt()),state_of_charge_unit_white_space:jt(Ht())})),grid:jt(Ut({entity:jt(Bt()||Ut()),name:jt(Lt()),icon:jt(Lt()),color:jt(Ut({consumption:jt(Lt()),production:jt(Lt())})),color_icon:jt(Ot()),display_state:jt(Lt())})),solar:jt(Ut({entity:jt(Bt()),name:jt(Lt()),icon:jt(Lt()),color:jt(Lt()),color_icon:jt(Ht())})),home:jt(Ut({entity:jt(Bt()),name:jt(Lt()),icon:jt(Lt()),color_icon:jt(Ot())})),fossil_fuel_percentage:jt(Ut({entity:jt(Bt()),name:jt(Lt()),icon:jt(Lt()),color:jt(Lt()),state_type:jt(Lt()),color_icon:jt(Ht()),display_zero:jt(Ht()),display_zero_tolerance:jt(Rt())})),individual1:jt(Ut({entity:jt(Bt()),name:jt(Lt()),icon:jt(Lt()),color:jt(Lt()),color_icon:jt(Ht()),inverted_animation:jt(Ht()),unit_of_measurement:jt(Lt()),display_zero:jt(Ht()),display_zero_tolerance:jt(Rt()),secondary_info:jt(Ut({entity:jt(Bt()),unit_of_measurement:jt(Lt()),icon:jt(Lt()),display_zero:jt(Ht()),unit_white_space:jt(Ht()),display_zero_tolerance:jt(Rt())}))})),individual2:jt(Ut({entity:jt(Bt()),name:jt(Lt()),icon:jt(Lt()),color:jt(Lt()),color_icon:jt(Ht()),inverted_animation:jt(Ht()),unit_of_measurement:jt(Lt()),display_zero:jt(Ht()),display_zero_tolerance:jt(Rt()),secondary_info:jt(Ut({entity:jt(Bt()),unit_of_measurement:jt(Lt()),icon:jt(Lt()),display_zero:jt(Ht()),unit_white_space:jt(Ht()),display_zero_tolerance:jt(Rt())}))}))}))})),Vt=[{name:"title",label:"Title",selector:{text:{}}}],Gt=[{name:"entities",type:"grid",schema:[{name:"grid",type:"grid",schema:[{name:"entity",selector:{entity:{domain:["counter","input_number","number","sensor"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color_icon",label:"Color of Icon",selector:{select:{options:[{value:!1,label:"Do not Color"},{value:!0,label:"Color dynamically"},{value:"production",label:"Color of Production"},{value:"consumption",label:"Color of Consumption"}],custom_value:!0}}},{name:"display_state",label:"Display State",selector:{select:{options:[{value:"two_way",label:"Two Way"},{value:"one_way",label:"One Way"},{value:"one_way_no_zero",label:"One Way (Show Zero)"}],custom_value:!0}}}]}]}],Zt=[{name:"entities",type:"grid",schema:[{name:"battery",type:"grid",schema:[{name:"entity",label:"Entity",selector:{entity:{domain:["counter","input_number","number","sensor"]}}},{name:"state_of_charge",label:"State of Charge Entity",selector:{entity:{domain:["counter","input_number","number","sensor"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color_icon",label:"Color of Icon",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Do not Color"},{value:"production",label:"Color of Production"},{value:"consumption",label:"Color of Consumption"}],custom_value:!0}}},{name:"display_state",label:"Display State",selector:{select:{options:[{value:"two_way",label:"Two Way"},{value:"one_way",label:"One Way"},{value:"one_way_no_zero",label:"One Way (Show Zero)"}],custom_value:!0}}},{name:"state_of_charge_unit_white_space",label:"White-Space for State of Charge Unit?",selector:{boolean:{}}}]}]}],Yt=[{name:"entities",type:"grid",schema:[{name:"solar",type:"grid",schema:[{name:"entity",label:"Entity",selector:{entity:{domain:["counter","input_number","number","sensor"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color_icon",label:"Color of Icon",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Do not Color"}],custom_value:!0}}}]}]}],qt=[{name:"entities",type:"grid",schema:[{name:"home",type:"grid",schema:[{name:"entity",label:"Entity",selector:{entity:{domain:["counter","input_number","number","sensor"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color_icon",label:"Color of Icon",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Do not Color"},{value:"grid",label:"Color of Grid"},{value:"solar",label:"Color of Solar"},{value:"battery",label:"Color of Battery"}],custom_value:!0}}}]}]}],Kt=[{name:"entities",type:"grid",schema:[{name:"fossil_fuel_percentage",type:"grid",schema:[{name:"entity",label:"Entity",selector:{entity:{domain:["counter","input_number","number","sensor"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color_icon",label:"Color of Icon",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Do not Color"}],custom_value:!0}}},{name:"display_zero",label:"Display Zero",selector:{boolean:{}}}]}]}],Jt=[{name:"entity",selector:{entity:{domain:["counter","input_number","number","sensor"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color_icon",label:"Color of Icon",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Do not Color"}],custom_value:!0}}},{name:"display_zero",label:"Display Zero",selector:{boolean:{}}},{name:"display_zero_tolerance",label:"Display Zero with Tolerance",selector:{number:{min:0,max:1e6,step:1,mode:"box"}}}],Qt=[{name:"secondary_info",type:"grid",schema:[{name:"entity",selector:{entity:{}}},{name:"name",label:"Name",selector:{text:{}}},{name:"unit_of_measurement",label:"Unit of Measurement",selector:{text:{}}},{name:"unit_white_space",label:"White-Space for Unit?",selector:{boolean:{}}},{name:"display_zero",label:"Display Zero",selector:{boolean:{}}},{name:"display_zero_tolerance",label:"Display Zero with Tolerance",selector:{number:{min:0,max:1e6,step:1,mode:"box"}}}]}],Xt=[{name:"entities",type:"grid",schema:[{name:"individual1",type:"grid",schema:Qt}]}],te=[{name:"entities",type:"grid",schema:[{name:"individual2",type:"grid",schema:Qt}]}],ee=[{name:"entities",type:"grid",schema:[{name:"individual1",type:"grid",schema:Jt}]}],ie=[{name:"entities",type:"grid",schema:[{name:"individual2",type:"grid",schema:Jt}]}],oe=[{name:"clickable_entities",label:"Clickable Entities",selector:{boolean:{}}},{name:"",type:"grid",schema:[{name:"dashboard_link",label:"Dashboard Link",selector:{navigation:{}}},{name:"dashboard_link_label",label:"Dashboard Link Label",selector:{text:{}}}]},{name:"inverted_entities",label:"Inverted Entities (e.g.: 'grid, battery')",selector:{object(){}}},{name:"watt_threshold",label:"Watt Threshold",selector:{number:{min:0,max:1e7,step:1,unit_of_measurement:"W",mode:"box"}}},{name:"",type:"grid",schema:[{name:"w_decimals",label:"Watt Decimal Places",selector:{number:{min:0,max:10,step:1,mode:"box"}}},{name:"kw_decimals",label:"Kilowatt Decimal Places",selector:{number:{min:0,max:10,step:1,mode:"box"}}}]},{name:"max_expected_flow_w",label:"Maximum Expected Power (Used in Flow Rate Calculation)",selector:{number:{min:0,max:1e7,step:1,unit_of_measurement:"W",mode:"box"}}},{name:"",type:"grid",schema:[{name:"min_flow_rate",label:"Lowest Flow Rate",selector:{number:{min:0,max:1e7,step:1,mode:"box"}}},{name:"max_flow_rate",label:"Highest Flow Rate",selector:{number:{min:0,max:1e7,step:1,mode:"box"}}}]}];let ne=class extends dt{constructor(){super(...arguments),this.showGrid=!1,this.showBattery=!1,this.showSolar=!1,this.showHome=!1,this.showNonFossil=!1,this.showIndividual1=!1,this.showIndividual1Secondary=!1,this.showIndividual2=!1,this.showIndividual2Secondary=!1,this.showOther=!1,this._computeLabelCallback=t=>t.label||this.hass.localize(`ui.panel.lovelace.editor.card.generic.${t.name}`)}async setConfig(t){zt(t,Ft),this._config=t}connectedCallback(){super.connectedCallback(),(async()=>{var t,e;if(customElements.get("ha-form"))return;const i=await(null===(e=(t=window).loadCardHelpers)||void 0===e?void 0:e.call(t));if(!i)return;const o=await i.createCardElement({type:"entity"});o&&await o.getConfigElement()})()}render(){if(!this.hass||!this._config)return G;const t=Object.assign({},this._config);return B`
      <div class="card-config">
        <div class="config-header">
          <h2>Power Flow Card Plus</h2>
          <ha-icon-button @click=${()=>window.open("https://github.com/flixlix/power-flow-card-plus","_blank")}>
            <ha-icon icon="hass:help-circle"></ha-icon>
          </ha-icon-button>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${t}
          .schema=${Vt}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>

        <div class="grid config-header sub-header">
          <h3>Grid Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showGrid}
              @change=${t=>{this.showGrid=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showGrid?B`
              <ha-form
                class="grid-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${Gt}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
            `:G}

        <div class="solar config-header sub-header">
          <h3>Solar Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showSolar}
              @change=${t=>{this.showSolar=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showSolar?B`
              <ha-form
                class="solar-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${Yt}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
            `:G}

        <div class="battery config-header sub-header">
          <h3>Battery Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showBattery}
              @change=${t=>{this.showBattery=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showBattery?B`
              <ha-form
                class="battery-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${Zt}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
            `:G}

        <div class="home config-header sub-header">
          <h3>Home Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showHome}
              @change=${t=>{this.showHome=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showHome?B`
              <ha-form
                class="home-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${qt}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
            `:G}

        <div class="non-fossil config-header sub-header">
          <h3>Non-Fossil Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showNonFossil}
              @change=${t=>{this.showNonFossil=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showNonFossil?B`
              <ha-form
                class="non-fossil-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${Kt}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
            `:G}

        <div class="individual1 config-header sub-header">
          <h3>Individual 1 Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showIndividual1}
              @change=${t=>{this.showIndividual1=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showIndividual1?B`
              <ha-form
                class="individual1-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${ee}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
              <div class="individual1 config-header sub-header">
                <h4>Secondary Information</h4>
                <ha-formfield label="Show Configuration">
                  <ha-switch
                    .checked=${this.showIndividual1Secondary}
                    @change=${t=>{this.showIndividual1Secondary=t.target.checked,this._valueChanged(t)}}
                  ></ha-switch>
                </ha-formfield>
              </div>
              ${this.showIndividual1Secondary?B`
                    <ha-form
                      class="individual1-secondary-config"
                      .hass=${this.hass}
                      .data=${t}
                      .schema=${Xt}
                      .computeLabel=${this._computeLabelCallback}
                      @value-changed=${this._valueChanged}
                    ></ha-form>
                  `:G}
            `:G}

        <div class="individual2 config-header sub-header">
          <h3>Individual 2 Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showIndividual2}
              @change=${t=>{this.showIndividual2=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showIndividual2?B`
              <ha-form
                class="individual2-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${ie}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
              <div class="individual2 config-header sub-header">
                <h4>Secondary Information</h4>
                <ha-formfield label="Show Configuration">
                  <ha-switch
                    .checked=${this.showIndividual2Secondary}
                    @change=${t=>{this.showIndividual2Secondary=t.target.checked,this._valueChanged(t)}}
                  ></ha-switch>
                </ha-formfield>
              </div>
              ${this.showIndividual2Secondary?B`
                    <ha-form
                      class="individual2-secondary-config"
                      .hass=${this.hass}
                      .data=${t}
                      .schema=${te}
                      .computeLabel=${this._computeLabelCallback}
                      @value-changed=${this._valueChanged}
                    ></ha-form>
                  `:G}
            `:G}

        <div class="other config-header sub-header">
          <h3>Advanced Configuration</h3>
          <ha-formfield label="Show Configuration">
            <ha-switch
              .checked=${this.showOther}
              @change=${t=>{this.showOther=t.target.checked,this._valueChanged(t)}}
            ></ha-switch>
          </ha-formfield>
        </div>
        ${this.showOther?B`
              <ha-form
                class="other-config"
                .hass=${this.hass}
                .data=${t}
                .schema=${oe}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>
            `:G}
      </div>
    `}_valueChanged(t){const e=t.detail.value;this._config&&this.hass&&function(t,e,i,o){o=o||{},i=null==i?{}:i;var n=new Event(e,{bubbles:void 0===o.bubbles||o.bubbles,cancelable:Boolean(o.cancelable),composed:void 0===o.composed||o.composed});n.detail=i,t.dispatchEvent(n)}(this,"config-changed",{config:e})}static get styles(){return h`
      ha-form {
        width: 100%;
      }

      ha-icon-button {
        align-self: center;
      }

      .card-config {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .config-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .config-header.sub-header {
        margin-top: 24px;
      }

      ha-icon {
        padding-bottom: 2px;
        position: relative;
        top: -4px;
        right: 1px;
      }
    `}};t([ut({attribute:!1})],ne.prototype,"hass",void 0),t([yt()],ne.prototype,"_config",void 0),t([yt()],ne.prototype,"showGrid",void 0),t([yt()],ne.prototype,"showBattery",void 0),t([yt()],ne.prototype,"showSolar",void 0),t([yt()],ne.prototype,"showHome",void 0),t([yt()],ne.prototype,"showNonFossil",void 0),t([yt()],ne.prototype,"showIndividual1",void 0),t([yt()],ne.prototype,"showIndividual1Secondary",void 0),t([yt()],ne.prototype,"showIndividual2",void 0),t([yt()],ne.prototype,"showIndividual2Secondary",void 0),t([yt()],ne.prototype,"showOther",void 0),ne=t([ht("power-flow-card-plus-editor")],ne);const re=238.76104;let ae=class extends dt{constructor(){super(...arguments),this._config={},this.unavailableOrMisconfiguredError=t=>Ct(`entity "${null!=t?t:"Unknown"}" is not available or misconfigured`),this.entityExists=t=>t in this.hass.states,this.entityAvailable=t=>{var e;return $t(null===(e=this.hass.states[t])||void 0===e?void 0:e.state)},this.entityInverted=t=>this._config.inverted_entities.includes(t),this.previousDur={},this.circleRate=(t,e)=>{var i,o;const n=null===(i=this._config)||void 0===i?void 0:i.min_flow_rate,r=null===(o=this._config)||void 0===o?void 0:o.max_flow_rate;return r-t/e*(r-n)},this.getEntityState=t=>t&&this.entityAvailable(t)?wt(this.hass.states[t].state):(this.unavailableOrMisconfiguredError(t),0),this.getEntityStateWatts=t=>{if(!t||!this.entityAvailable(t))return this.unavailableOrMisconfiguredError(t),0;const e=this.hass.states[t],i=wt(e.state);return"W"===e.attributes.unit_of_measurement?i:1e3*i},this.displayNonFossilState=(t,e)=>{var i;if(!t||!this.entityAvailable(t))return this.unavailableOrMisconfiguredError(t),"NaN";const o="percentage"===(null===(i=this._config.entities.fossil_fuel_percentage)||void 0===i?void 0:i.state_type)?"%":"W",n=1-this.getEntityState(t)/100;let r,a;if(r="string"==typeof this._config.entities.grid.entity?e:this.getEntityStateWatts(this._config.entities.grid.entity.consumption)||0,"W"===o){const t=r*n;a=this.displayValue(t)}else{a=(100-this.getEntityState(t)).toFixed(0).toString().concat(o)}return a},this.displayValue=(t,e,i)=>{if(null===t)return"0";const o=void 0===e&&t>=this._config.watt_threshold;return`${n(o?bt(t/1e3,this._config.kw_decimals):bt(t,this._config.w_decimals),this.hass.locale)}${!1===i?"":" "}${e||(o?"kW":"W")}`}}setConfig(t){var e,i,o,n,r,a;if(!t.entities||!(null===(i=null===(e=t.entities)||void 0===e?void 0:e.battery)||void 0===i?void 0:i.entity)&&!(null===(n=null===(o=t.entities)||void 0===o?void 0:o.grid)||void 0===n?void 0:n.entity)&&!(null===(a=null===(r=t.entities)||void 0===r?void 0:r.solar)||void 0===a?void 0:a.entity))throw new Error("At least one entity for battery, grid or solar must be defined");this._config=Object.assign(Object.assign({},t),{inverted_entities:xt(t.inverted_entities,","),kw_decimals:wt(t.kw_decimals,1),min_flow_rate:wt(t.min_flow_rate,.75),max_flow_rate:wt(t.max_flow_rate,6),w_decimals:wt(t.w_decimals,1),watt_threshold:wt(t.watt_threshold),max_expected_flow_w:wt(t.max_expected_flow_w,5e3)})}getCardSize(){return 3}openDetails(t){if(!t||!this._config.clickable_entities)return;if(!this.entityExists(t))return;const e=new CustomEvent("hass-more-info",{composed:!0,detail:{entityId:t}});this.dispatchEvent(e)}render(){var t,e,i,o,r,a,l,s,d,c,h,v,u,y,p,m,f,g,_,b,$,w,x,k,C,S,E,A,M,P,D,N,z,T,I,O,H,R,U,j,L,W,V,G,Z,Y,q,K,J,Q,X,tt,et,it,ot,nt,rt,at,lt,st,dt,ct,ht,vt,ut,yt,pt,mt,ft,gt,bt,$t,wt,xt,kt,Ct,St,Et,At,Mt,Pt,Dt,Nt,zt,Tt,It,Ot,Ht,Rt,Ut,jt,Lt,Wt,Bt,Ft,Vt,Gt,Zt,Yt,qt,Kt,Jt,Qt,Xt,te,ee,ie,oe,ne,ae,le,se,de,ce,he,ve,ue,ye,pe,me,fe,ge,_e,be,$e,we,xe,ke,Ce,Se,Ee,Ae,Me,Pe,De,Ne,ze,Te,Ie,Oe,He,Re,Ue,je,Le,We,Be,Fe,Ve,Ge,Ze,Ye,qe,Ke,Je,Qe,Xe,ti,ei,ii,oi,ni,ri,ai,li,si,di,ci,hi,vi,ui,yi,pi,mi,fi,gi,_i,bi,$i,wi,xi,ki,Ci,Si,Ei,Ai,Mi,Pi,Di,Ni,zi,Ti,Ii,Oi,Hi,Ri,Ui,ji,Li,Wi,Bi,Fi,Vi,Gi,Zi,Yi,qi,Ki,Ji,Qi,Xi,to,eo;if(!this._config||!this.hass)return B``;const{entities:io}=this._config;this.style.setProperty("--clickable-cursor",this._config.clickable_entities?"pointer":"default");const oo=void 0!==(null===(t=null==io?void 0:io.grid)||void 0===t?void 0:t.entity),no=void 0!==(null===(e=null==io?void 0:io.battery)||void 0===e?void 0:e.entity),ro=void 0!==io.individual2&&!0===(null===(i=io.individual2)||void 0===i?void 0:i.display_zero)||this.getEntityStateWatts(null===(o=io.individual2)||void 0===o?void 0:o.entity)>(null!==(a=null===(r=io.individual2)||void 0===r?void 0:r.display_zero_tolerance)&&void 0!==a?a:0)&&this.entityAvailable(null===(l=io.individual2)||void 0===l?void 0:l.entity),ao=void 0!==(null===(d=null===(s=io.individual2)||void 0===s?void 0:s.secondary_info)||void 0===d?void 0:d.entity)&&(this.getEntityState(null===(h=null===(c=io.individual2)||void 0===c?void 0:c.secondary_info)||void 0===h?void 0:h.entity)>(null!==(y=null===(u=null===(v=null==io?void 0:io.individual2)||void 0===v?void 0:v.secondary_info)||void 0===u?void 0:u.display_zero_tolerance)&&void 0!==y?y:0)||!0===(null===(p=io.individual2.secondary_info)||void 0===p?void 0:p.display_zero)),lo=void 0!==io.individual1&&!0===(null===(m=io.individual1)||void 0===m?void 0:m.display_zero)||this.getEntityStateWatts(null===(f=io.individual1)||void 0===f?void 0:f.entity)>(null!==(_=null===(g=null==io?void 0:io.individual1)||void 0===g?void 0:g.display_zero_tolerance)&&void 0!==_?_:0)&&this.entityAvailable(null===(b=io.individual1)||void 0===b?void 0:b.entity),so=void 0!==(null===(w=null===($=io.individual1)||void 0===$?void 0:$.secondary_info)||void 0===w?void 0:w.entity)&&(this.getEntityState(null===(k=null===(x=io.individual1)||void 0===x?void 0:x.secondary_info)||void 0===k?void 0:k.entity)>(null!==(E=null===(S=null===(C=null==io?void 0:io.individual1)||void 0===C?void 0:C.secondary_info)||void 0===S?void 0:S.display_zero_tolerance)&&void 0!==E?E:0)||!0===io.individual1.secondary_info.display_zero),co=void 0!==(null===(M=null===(A=io.solar)||void 0===A?void 0:A.secondary_info)||void 0===M?void 0:M.entity)&&(this.getEntityState(null===(D=null===(P=io.solar)||void 0===P?void 0:P.secondary_info)||void 0===D?void 0:D.entity)>(null!==(T=null===(z=null===(N=null==io?void 0:io.solar)||void 0===N?void 0:N.secondary_info)||void 0===z?void 0:z.display_zero_tolerance)&&void 0!==T?T:0)||!0===io.solar.secondary_info.display_zero),ho=void 0!==(null===(O=null===(I=io.home)||void 0===I?void 0:I.secondary_info)||void 0===O?void 0:O.entity)&&(this.getEntityState(null===(R=null===(H=io.home)||void 0===H?void 0:H.secondary_info)||void 0===R?void 0:R.entity)>(null!==(L=null===(j=null===(U=null==io?void 0:io.home)||void 0===U?void 0:U.secondary_info)||void 0===j?void 0:j.display_zero_tolerance)&&void 0!==L?L:0)||!0===io.home.secondary_info.display_zero),vo=void 0!==io.solar,uo=oo&&("string"==typeof io.grid.entity||io.grid.entity.production);let yo=0,po=0;void 0!==(null===(V=null===(W=this._config.entities.grid)||void 0===W?void 0:W.color)||void 0===V?void 0:V.consumption)&&this.style.setProperty("--energy-grid-consumption-color",(null===(Z=null===(G=this._config.entities.grid)||void 0===G?void 0:G.color)||void 0===Z?void 0:Z.consumption)||"var(--energy-grid-consumption-color)"),oo&&(yo="string"==typeof io.grid.entity?this.entityInverted("grid")?Math.abs(Math.min(this.getEntityStateWatts(null===(Y=io.grid)||void 0===Y?void 0:Y.entity),0)):Math.max(this.getEntityStateWatts(null===(q=io.grid)||void 0===q?void 0:q.entity),0):this.getEntityStateWatts(io.grid.entity.consumption));const mo=void 0!==(null===(J=null===(K=io.grid)||void 0===K?void 0:K.secondary_info)||void 0===J?void 0:J.entity)&&(this.getEntityState(null===(X=null===(Q=io.grid)||void 0===Q?void 0:Q.secondary_info)||void 0===X?void 0:X.entity)>(null!==(it=null===(et=null===(tt=null==io?void 0:io.grid)||void 0===tt?void 0:tt.secondary_info)||void 0===et?void 0:et.display_zero_tolerance)&&void 0!==it?it:0)||!0===io.grid.secondary_info.display_zero);let fo=null;if(mo){const t=this.hass.states[this._config.entities.grid.secondary_info.entity],e=Number(t.state);fo=this.entityInverted("gridSecondary")?Math.abs(Math.min(e,0)):Math.max(e,0)}void 0!==(null===(nt=null===(ot=this._config.entities.grid)||void 0===ot?void 0:ot.color)||void 0===nt?void 0:nt.production)&&this.style.setProperty("--energy-grid-return-color",(null===(at=null===(rt=this._config.entities.grid)||void 0===rt?void 0:rt.color)||void 0===at?void 0:at.production)||"#a280db"),uo&&(po="string"==typeof io.grid.entity?this.entityInverted("grid")?Math.max(this.getEntityStateWatts(io.grid.entity),0):Math.abs(Math.min(this.getEntityStateWatts(io.grid.entity),0)):this.getEntityStateWatts(null===(lt=io.grid)||void 0===lt?void 0:lt.entity.production));const go=null===(st=this._config.entities.grid)||void 0===st?void 0:st.color_icon;this.style.setProperty("--icon-grid-color","consumption"===go?"var(--energy-grid-consumption-color)":"production"===go?"var(--energy-grid-return-color)":!0===go?yo>=po?"var(--energy-grid-consumption-color)":"var(--energy-grid-return-color)":"var(--primary-text-color)");const _o=null===(ct=null===(dt=this._config.entities.grid)||void 0===dt?void 0:dt.secondary_info)||void 0===ct?void 0:ct.color_value;this.style.setProperty("--secondary-text-grid-color","consumption"===_o?"var(--energy-grid-consumption-color)":"production"===_o?"var(--energy-grid-return-color)":!0===_o?yo>=po?"var(--energy-grid-consumption-color)":"var(--energy-grid-return-color)":"var(--primary-text-color)");const bo=null===(ht=this._config.entities.grid)||void 0===ht?void 0:ht.color_circle;this.style.setProperty("--circle-grid-color","consumption"===bo?"var(--energy-grid-consumption-color)":"production"===bo?"var(--energy-grid-return-color)":!0===bo?yo>=po?"var(--energy-grid-consumption-color)":"var(--energy-grid-return-color)":"var(--energy-grid-consumption-color)");let $o=null,wo=null;const xo=(null===(vt=this._config.entities.individual1)||void 0===vt?void 0:vt.name)||"Car",ko=(null===(ut=this._config.entities.individual1)||void 0===ut?void 0:ut.icon)||"mdi:car-electric",Co=(null===(yt=this._config.entities.individual1)||void 0===yt?void 0:yt.color)||"#D0CC5B";if(this.style.setProperty("--individualone-color",Co),this.style.setProperty("--icon-individualone-color",(null===(pt=this._config.entities.individual1)||void 0===pt?void 0:pt.color_icon)?"var(--individualone-color)":"var(--primary-text-color)"),lo){const t=this.hass.states[null===(mt=this._config.entities.individual1)||void 0===mt?void 0:mt.entity],e=Number(t.state);$o=this.entityInverted("individual1")?Math.abs(Math.min(e,0)):Math.max(e,0)}if(so){const t=this.hass.states[null===(gt=null===(ft=this._config.entities.individual1)||void 0===ft?void 0:ft.secondary_info)||void 0===gt?void 0:gt.entity],e=Number(t.state);wo=this.entityInverted("individual1Secondary")?Math.abs(Math.min(e,0)):Math.max(e,0)}let So=null,Eo=null;const Ao=(null===(bt=this._config.entities.individual2)||void 0===bt?void 0:bt.name)||"Motorcycle",Mo=(null===($t=this._config.entities.individual2)||void 0===$t?void 0:$t.icon)||"mdi:motorbike-electric",Po=(null===(wt=this._config.entities.individual2)||void 0===wt?void 0:wt.color)||"#964CB5";if(this.style.setProperty("--individualtwo-color",Po),this.style.setProperty("--icon-individualtwo-color",(null===(xt=this._config.entities.individual2)||void 0===xt?void 0:xt.color_icon)?"var(--individualtwo-color)":"var(--primary-text-color)"),ro){const t=this.hass.states[null===(kt=this._config.entities.individual2)||void 0===kt?void 0:kt.entity],e=Number(t.state);So=this.entityInverted("individual2")?Math.abs(Math.min(e,0)):Math.max(e,0)}if(ao){const t=this.hass.states[null===(St=null===(Ct=this._config.entities.individual2)||void 0===Ct?void 0:Ct.secondary_info)||void 0===St?void 0:St.entity],e=Number(t.state);Eo=this.entityInverted("individual2Secondary")?Math.abs(Math.min(e,0)):Math.max(e,0)}let Do=null;if(co){const t=this.hass.states[null===(At=null===(Et=this._config.entities.solar)||void 0===Et?void 0:Et.secondary_info)||void 0===At?void 0:At.entity],e=Number(t.state);Do=this.entityInverted("solarSecondary")?Math.abs(Math.min(e,0)):Math.max(e,0)}let No=null;if(ho){const t=this.hass.states[null===(Pt=null===(Mt=this._config.entities.home)||void 0===Mt?void 0:Mt.secondary_info)||void 0===Pt?void 0:Pt.entity],e=Number(t.state);No=this.entityInverted("homeSecondary")?Math.abs(Math.min(e,0)):Math.max(e,0)}let zo=0;void 0!==(null===(Dt=this._config.entities.solar)||void 0===Dt?void 0:Dt.color)&&this.style.setProperty("--energy-solar-color",(null===(Nt=this._config.entities.solar)||void 0===Nt?void 0:Nt.color)||"#ff9800"),this.style.setProperty("--icon-solar-color",(null===(zt=this._config.entities.solar)||void 0===zt?void 0:zt.color_icon)?"var(--energy-solar-color)":"var(--primary-text-color)"),vo&&(zo=this.entityInverted("solar")?Math.abs(Math.min(this.getEntityStateWatts(null===(Tt=io.solar)||void 0===Tt?void 0:Tt.entity),0)):Math.max(this.getEntityStateWatts(null===(It=io.solar)||void 0===It?void 0:It.entity),0));let To=0,Io=0;no&&("string"==typeof(null===(Ot=io.battery)||void 0===Ot?void 0:Ot.entity)?(To=this.entityInverted("battery")?Math.max(this.getEntityStateWatts(io.battery.entity),0):Math.abs(Math.min(this.getEntityStateWatts(io.battery.entity),0)),Io=this.entityInverted("battery")?Math.abs(Math.min(this.getEntityStateWatts(io.battery.entity),0)):Math.max(this.getEntityStateWatts(io.battery.entity),0)):(To=this.getEntityStateWatts(null===(Rt=null===(Ht=io.battery)||void 0===Ht?void 0:Ht.entity)||void 0===Rt?void 0:Rt.production),Io=this.getEntityStateWatts(null===(jt=null===(Ut=io.battery)||void 0===Ut?void 0:Ut.entity)||void 0===jt?void 0:jt.consumption)));let Oo=null;vo&&(Oo=zo-(null!=po?po:0)-(null!=To?To:0));let Ho=null,Ro=null;null!==Oo&&Oo<0&&(no&&(Ho=Math.abs(Oo),Ho>yo&&(Ro=Math.min(Ho-yo,0),Ho=yo)),Oo=0);let Uo=null;vo&&no?(Ro||(Ro=Math.max(0,(po||0)-(zo||0)-(To||0)-(Ho||0))),Uo=To-(Ho||0)):!vo&&no&&(Ro=po);let jo=0;vo&&po&&(jo=po-(null!=Ro?Ro:0));let Lo=0;no&&(Lo=(null!=Io?Io:0)-(null!=Ro?Ro:0)),void 0!==(null===(Wt=null===(Lt=this._config.entities.battery)||void 0===Lt?void 0:Lt.color)||void 0===Wt?void 0:Wt.consumption)&&this.style.setProperty("--energy-battery-out-color",(null===(Ft=null===(Bt=this._config.entities.battery)||void 0===Bt?void 0:Bt.color)||void 0===Ft?void 0:Ft.consumption)||"#4db6ac"),void 0!==(null===(Gt=null===(Vt=this._config.entities.battery)||void 0===Vt?void 0:Vt.color)||void 0===Gt?void 0:Gt.production)&&this.style.setProperty("--energy-battery-in-color",(null===(Yt=null===(Zt=this._config.entities.battery)||void 0===Zt?void 0:Zt.color)||void 0===Yt?void 0:Yt.production)||"#a280db");const Wo=null===(qt=this._config.entities.battery)||void 0===qt?void 0:qt.color_icon;this.style.setProperty("--icon-battery-color","consumption"===Wo?"var(--energy-battery-in-color)":"production"===Wo?"var(--energy-battery-out-color)":!0===Wo?To>=Io?"var(--energy-battery-in-color)":"var(--energy-battery-out-color)":"var(--primary-text-color)");const Bo=null===(Kt=this._config.entities.battery)||void 0===Kt?void 0:Kt.color_state_of_charge_value;this.style.setProperty("--text-battery-state-of-charge-color","consumption"===Bo?"var(--energy-battery-in-color)":"production"===Bo?"var(--energy-battery-out-color)":!0===Bo?To>=Io?"var(--energy-battery-in-color)":"var(--energy-battery-out-color)":"var(--primary-text-color)");const Fo=null===(Jt=this._config.entities.battery)||void 0===Jt?void 0:Jt.color_circle;this.style.setProperty("--circle-battery-color","consumption"===Fo?"var(--energy-battery-in-color)":"production"===Fo?"var(--energy-battery-out-color)":!0===Fo?To>=Io?"var(--energy-battery-in-color)":"var(--energy-battery-out-color)":"var(--energy-battery-in-color)");const Vo=Math.max(yo-(null!=Ho?Ho:0),0),Go=Math.max(Vo+(null!=Oo?Oo:0)+(null!=Lo?Lo:0),0);let Zo=0;Lo&&(Zo=re*(Lo/Go));let Yo=0;vo&&(Yo=re*(Oo/Go));const qo=1*Vo-this.getEntityState(null===(Qt=io.fossil_fuel_percentage)||void 0===Qt?void 0:Qt.entity)/100>0&&void 0!==(null===(Xt=io.fossil_fuel_percentage)||void 0===Xt?void 0:Xt.entity)&&this.entityAvailable(null===(te=io.fossil_fuel_percentage)||void 0===te?void 0:te.entity),Ko=void 0!==(null===(ee=io.fossil_fuel_percentage)||void 0===ee?void 0:ee.entity)&&!0===(null===(ie=io.fossil_fuel_percentage)||void 0===ie?void 0:ie.display_zero)||qo;let Jo,Qo=0;if(qo){Jo=Vo*(1-this.getEntityState(null===(oe=io.fossil_fuel_percentage)||void 0===oe?void 0:oe.entity)/100),Qo=re*(Jo/Go)}const Xo=re*((Go-(null!=Jo?Jo:0)-(null!=Lo?Lo:0)-(null!=Oo?Oo:0))/Go),tn=Vo+(null!=Oo?Oo:0)+jo+(null!=Uo?Uo:0)+(null!=Lo?Lo:0)+(null!=Ho?Ho:0)+(null!=Ro?Ro:0),en=(null===(ae=null===(ne=io.battery)||void 0===ne?void 0:ne.state_of_charge)||void 0===ae?void 0:ae.length)?this.getEntityState(null===(le=io.battery)||void 0===le?void 0:le.state_of_charge):null;let on="mdi:battery-high";null===en?on="mdi:battery":en<=72&&en>44?on="mdi:battery-medium":en<=44&&en>16?on="mdi:battery-low":en<=16&&(on="mdi:battery-outline"),void 0!==(null===(se=io.battery)||void 0===se?void 0:se.icon)&&(on=null===(de=io.battery)||void 0===de?void 0:de.icon);const nn={batteryGrid:this.circleRate(null!==(ce=null!=Ho?Ho:Ro)&&void 0!==ce?ce:0,tn),batteryToHome:this.circleRate(null!=Lo?Lo:0,tn),gridToHome:this.circleRate(Vo,tn),solarToBattery:this.circleRate(null!=Uo?Uo:0,tn),solarToGrid:this.circleRate(jo,tn),solarToHome:this.circleRate(null!=Oo?Oo:0,tn)};["batteryGrid","batteryToHome","gridToHome","solarToBattery","solarToGrid","solarToHome"].forEach((t=>{const e=this[`${t}Flow`];e&&this.previousDur[t]&&this.previousDur[t]!==nn[t]&&(e.pauseAnimations(),e.setCurrentTime(e.getCurrentTime()*(nn[t]/this.previousDur[t])),e.unpauseAnimations()),this.previousDur[t]=nn[t]})),this.style.setProperty("--non-fossil-color",(null===(he=this._config.entities.fossil_fuel_percentage)||void 0===he?void 0:he.color)||"var(--energy-non-fossil-color)"),this.style.setProperty("--icon-non-fossil-color",(null===(ve=this._config.entities.fossil_fuel_percentage)||void 0===ve?void 0:ve.color_icon)?"var(--non-fossil-color)":"var(--primary-text-color)");const rn=null===(ue=this._config.entities.home)||void 0===ue?void 0:ue.color_icon,an={battery:{value:Zo,color:"var(--energy-battery-out-color)"},solar:{value:Yo,color:"var(--energy-solar-color)"},grid:{value:Xo,color:"var(--energy-grid-consumption-color)"},gridNonFossil:{value:Qo,color:"var(--energy-non-fossil-color)"}},ln=Object.keys(an).reduce(((t,e)=>an[t].value>an[e].value?t:e));let sn="var(--primary-text-color)";"solar"===rn?sn="var(--energy-solar-color)":"battery"===rn?sn="var(--energy-battery-out-color)":"grid"===rn?sn="var(--energy-grid-consumption-color)":!0===rn&&(sn=an[ln].color),this.style.setProperty("--icon-home-color",sn);const dn=null===(ye=this._config.entities.home)||void 0===ye?void 0:ye.color_value;let cn="var(--primary-text-color)";return"solar"===dn?cn="var(--energy-solar-color)":"battery"===dn?cn="var(--energy-battery-out-color)":"grid"===dn?cn="var(--energy-grid-consumption-color)":!0===dn&&(cn=ln),this.style.setProperty("--text-home-color",cn),this.style.setProperty("--text-solar-color",(null===(pe=this._config.entities.solar)||void 0===pe?void 0:pe.color_value)?"var(--energy-solar-color)":"var(--primary-text-color)"),this.style.setProperty("--text-non-fossil-color",(null===(me=this._config.entities.fossil_fuel_percentage)||void 0===me?void 0:me.color_value)?"var(--energy-non-fossil-color)":"var(--primary-text-color)"),this.style.setProperty("--text-individualone-color",(null===(fe=this._config.entities.individual1)||void 0===fe?void 0:fe.color_value)?"var(--individualone-color)":"var(--primary-text-color)"),this.style.setProperty("--text-individualtwo-color",(null===(ge=this._config.entities.individual2)||void 0===ge?void 0:ge.color_value)?"var(--individualtwo-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-individualone-color",(null===(be=null===(_e=this._config.entities.individual1)||void 0===_e?void 0:_e.secondary_info)||void 0===be?void 0:be.color_value)?"var(--individualone-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-individualtwo-color",(null===(we=null===($e=this._config.entities.individual2)||void 0===$e?void 0:$e.secondary_info)||void 0===we?void 0:we.color_value)?"var(--individualtwo-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-solar-color",(null===(ke=null===(xe=this._config.entities.solar)||void 0===xe?void 0:xe.secondary_info)||void 0===ke?void 0:ke.color_value)?"var(--energy-solar-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-home-color",(null===(Se=null===(Ce=this._config.entities.home)||void 0===Ce?void 0:Ce.secondary_info)||void 0===Se?void 0:Se.color_value)?"var(--text-home-color)":"var(--primary-text-color)"),B`
      <ha-card .header=${this._config.title}>
        <div class="card-content">
          ${vo||ro||lo?B`<div class="row">
                ${Ko?B`<div class="circle-container low-carbon">
                      <span class="label"
                        >${(null===(Ee=io.fossil_fuel_percentage)||void 0===Ee?void 0:Ee.name)?null===(Ae=io.fossil_fuel_percentage)||void 0===Ae?void 0:Ae.name:this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.low_carbon")}</span
                      >
                      <div
                        class="circle"
                        @click=${t=>{var e;t.stopPropagation(),this.openDetails(null===(e=io.fossil_fuel_percentage)||void 0===e?void 0:e.entity)}}
                        @keyDown=${t=>{var e;"Enter"===t.key&&(t.stopPropagation(),this.openDetails(null===(e=io.fossil_fuel_percentage)||void 0===e?void 0:e.entity))}}
                      >
                        <ha-icon
                          .icon=${(null===(Me=io.fossil_fuel_percentage)||void 0===Me?void 0:Me.icon)?null===(Pe=io.fossil_fuel_percentage)||void 0===Pe?void 0:Pe.icon:"mdi:leaf"}
                          class="low-carbon"
                        ></ha-icon>
                        <span class="low-carbon">${this.displayNonFossilState(io.fossil_fuel_percentage.entity,yo)}</span>
                      </div>
                      <svg width="80" height="30">
                        <path d="M40 -10 v40" class="low-carbon" id="low-carbon" />
                        ${qo?F`<circle
                              r="2.4"
                              class="low-carbon"
                              vector-effect="non-scaling-stroke"
                            >
                                <animateMotion
                                  dur="1.66s"
                                  repeatCount="indefinite"
                                  calcMode="linear"
                                >
                                  <mpath xlink:href="#low-carbon" />
                                </animateMotion>
                            </circle>`:""}
                      </svg>
                    </div>`:B`<div class="spacer"></div>`}
                ${vo?B`<div class="circle-container solar">
                      <span class="label"
                        >${io.solar.name||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.solar")}</span
                      >
                      <div
                        class="circle"
                        @click=${t=>{t.stopPropagation(),this.openDetails(io.solar.entity)}}
                        @keyDown=${t=>{"Enter"===t.key&&(t.stopPropagation(),this.openDetails(io.solar.entity))}}
                      >
                        ${co?B`
                              <span class="secondary-info solar">
                                ${(null===(Ne=null===(De=io.solar)||void 0===De?void 0:De.secondary_info)||void 0===Ne?void 0:Ne.icon)?B`<ha-icon class="secondary-info small" .icon=${null===(Te=null===(ze=io.solar)||void 0===ze?void 0:ze.secondary_info)||void 0===Te?void 0:Te.icon}></ha-icon>`:""}
                                ${this.displayValue(Do,null===(Oe=null===(Ie=io.solar)||void 0===Ie?void 0:Ie.secondary_info)||void 0===Oe?void 0:Oe.unit_of_measurement,null===(Re=null===(He=io.solar)||void 0===He?void 0:He.secondary_info)||void 0===Re?void 0:Re.unit_white_space)}
                              </span>
                            `:""}

                        <ha-icon id="solar-icon" .icon=${io.solar.icon||"mdi:solar-power"}></ha-icon>
                        <span class="solar"> ${this.displayValue(zo)}</span>
                      </div>
                    </div>`:ro||lo?B`<div class="spacer"></div>`:""}
                ${ro?B`<div class="circle-container individual2">
                      <span class="label">${Ao}</span>
                      <div
                        class="circle"
                        @click=${t=>{var e;t.stopPropagation(),this.openDetails(null===(e=io.individual2)||void 0===e?void 0:e.entity)}}
                        @keyDown=${t=>{var e;"Enter"===t.key&&(t.stopPropagation(),this.openDetails(null===(e=io.individual2)||void 0===e?void 0:e.entity))}}
                      >
                        ${ao?B`
                              <span class="secondary-info individual2">
                                ${(null===(je=null===(Ue=io.individual2)||void 0===Ue?void 0:Ue.secondary_info)||void 0===je?void 0:je.icon)?B`<ha-icon class="secondary-info small" .icon=${null===(We=null===(Le=io.individual2)||void 0===Le?void 0:Le.secondary_info)||void 0===We?void 0:We.icon}></ha-icon>`:""}
                                ${this.displayValue(Eo,null===(Fe=null===(Be=io.individual2)||void 0===Be?void 0:Be.secondary_info)||void 0===Fe?void 0:Fe.unit_of_measurement,null===(Ge=null===(Ve=io.individual2)||void 0===Ve?void 0:Ve.secondary_info)||void 0===Ge?void 0:Ge.unit_white_space)}
                              </span>
                            `:""}
                        <ha-icon
                          id="individual2-icon"
                          .icon=${Mo}
                          style=${ao?"padding-top: 2px;":"padding-top: 0px;"}
                        ></ha-icon>
                        ${this.displayValue(So,null===(Ze=this._config.entities.individual2)||void 0===Ze?void 0:Ze.unit_of_measurement)}
                      </div>
                      <svg width="80" height="30">
                        <path d="M40 -10 v50" id="individual2" />
                        ${So?F`<circle
                              r="2.4"
                              class="individual2"
                              vector-effect="non-scaling-stroke"
                            >
                              <animateMotion
                                dur="1.66s"
                                repeatCount="indefinite"
                                calcMode="linear"
                                keyPoints=${(null===(Ye=io.individual2)||void 0===Ye?void 0:Ye.inverted_animation)?"0;1":"1;0"}
                                keyTimes="0;1"
                              >
                                <mpath xlink:href="#individual2" />
                              </animateMotion>
                            </circle>`:""}
                      </svg>
                    </div>`:lo?B`<div class="circle-container individual1">
                      <span class="label">${xo}</span>
                      <div
                        class="circle"
                        @click=${t=>{var e;t.stopPropagation(),this.openDetails(null===(e=io.individual1)||void 0===e?void 0:e.entity)}}
                        @keyDown=${t=>{var e;"Enter"===t.key&&(t.stopPropagation(),this.openDetails(null===(e=io.individual1)||void 0===e?void 0:e.entity))}}
                      >
                        ${so?B`
                              <span class="secondary-info individual1">
                                ${(null===(Ke=null===(qe=io.individual1)||void 0===qe?void 0:qe.secondary_info)||void 0===Ke?void 0:Ke.icon)?B`<ha-icon class="secondary-info small" .icon=${null===(Qe=null===(Je=io.individual1)||void 0===Je?void 0:Je.secondary_info)||void 0===Qe?void 0:Qe.icon}></ha-icon>`:""}
                                ${this.displayValue(wo,null===(ti=null===(Xe=io.individual1)||void 0===Xe?void 0:Xe.secondary_info)||void 0===ti?void 0:ti.unit_of_measurement,null===(ii=null===(ei=io.individual1)||void 0===ei?void 0:ei.secondary_info)||void 0===ii?void 0:ii.unit_white_space)}
                              </span>
                            `:""}
                        <ha-icon
                          id="individual1-icon"
                          .icon=${ko}
                          style=${so?"padding-top: 2px;":"padding-top: 0px;"}
                        ></ha-icon>
                        ${(null===(oi=this._config.entities.individual1)||void 0===oi?void 0:oi.unit_of_measurement)?this.displayValue($o,null===(ni=this._config.entities.individual1)||void 0===ni?void 0:ni.unit_of_measurement):this.displayValue($o)}
                      </div>
                      <svg width="80" height="30">
                        <path d="M40 -10 v40" id="individual1" />
                        ${$o?F`<circle
                                r="2.4"
                                class="individual1"
                                vector-effect="non-scaling-stroke"
                              >
                                <animateMotion
                                  dur="1.66s"
                                  repeatCount="indefinite"
                                  keyPoints=${(null===(ri=io.individual1)||void 0===ri?void 0:ri.inverted_animation)?"0;1":"1;0"}
                                  keyTimes="0;1"

                                >
                                  <mpath xlink:href="#individual1" />
                                </animateMotion>
                              </circle>`:""}
                      </svg>
                    </div> `:B`<div class="spacer"></div>`}
              </div>`:B``}
          <div class="row">
            ${oo?B` <div class="circle-container grid">
                  <div
                    class="circle"
                    @click=${t=>{const e="string"==typeof io.grid.entity?io.grid.entity:io.grid.entity.consumption||io.grid.entity.production;t.stopPropagation(),this.openDetails(e)}}
                    @keyDown=${t=>{if("Enter"===t.key){const e="string"==typeof io.grid.entity?io.grid.entity:io.grid.entity.consumption||io.grid.entity.production;t.stopPropagation(),this.openDetails(e)}}}
                  >
                    ${mo?B`
                          <span class="secondary-info grid">
                            ${(null===(li=null===(ai=io.grid)||void 0===ai?void 0:ai.secondary_info)||void 0===li?void 0:li.icon)?B`<ha-icon class="secondary-info small" .icon=${null===(di=null===(si=io.grid)||void 0===si?void 0:si.secondary_info)||void 0===di?void 0:di.icon}></ha-icon>`:""}
                            ${this.displayValue(fo,null===(hi=null===(ci=io.grid)||void 0===ci?void 0:ci.secondary_info)||void 0===hi?void 0:hi.unit_of_measurement,null===(ui=null===(vi=io.grid)||void 0===vi?void 0:vi.secondary_info)||void 0===ui?void 0:ui.unit_white_space)}
                          </span>
                        `:""}
                    <ha-icon .icon=${(null===(yi=io.grid)||void 0===yi?void 0:yi.icon)||"mdi:transmission-tower"}></ha-icon>
                    ${("two_way"===(null===(pi=io.grid)||void 0===pi?void 0:pi.display_state)||void 0===(null===(mi=io.grid)||void 0===mi?void 0:mi.display_state)||"one_way"===(null===(fi=io.grid)||void 0===fi?void 0:fi.display_state)&&po>0||"one_way_no_zero"===(null===(gi=io.grid)||void 0===gi?void 0:gi.display_state)&&(null===yo||0===yo)&&0!==po)&&null!==po?B`<span
                          class="return"
                          @click=${t=>{const e="string"==typeof io.grid.entity?io.grid.entity:io.grid.entity.production;t.stopPropagation(),this.openDetails(e)}}
                          @keyDown=${t=>{if("Enter"===t.key){const e="string"==typeof io.grid.entity?io.grid.entity:io.grid.entity.production;t.stopPropagation(),this.openDetails(e)}}}
                        >
                          <ha-icon class="small" .icon=${"mdi:arrow-left"}></ha-icon>
                          ${this.displayValue(po)}
                        </span>`:null}
                    ${("two_way"===(null===(_i=io.grid)||void 0===_i?void 0:_i.display_state)||void 0===(null===(bi=io.grid)||void 0===bi?void 0:bi.display_state)||"one_way"===(null===($i=io.grid)||void 0===$i?void 0:$i.display_state)&&yo>0||"one_way_no_zero"===(null===(wi=io.grid)||void 0===wi?void 0:wi.display_state)&&(null===po||0===po))&&null!==yo?B` <span class="consumption">
                          <ha-icon class="small" .icon=${"mdi:arrow-right"}></ha-icon>${this.displayValue(yo)}
                        </span>`:""}
                  </div>
                  <span class="label">${io.grid.name||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.grid")}</span>
                </div>`:B`<div class="spacer"></div>`}
            <div class="circle-container home">
              <div
                class="circle"
                id="home-circle"
                @click=${t=>{var e;t.stopPropagation(),this.openDetails(null===(e=io.home)||void 0===e?void 0:e.entity)}}
                @keyDown=${t=>{var e;"Enter"===t.key&&(t.stopPropagation(),this.openDetails(null===(e=io.home)||void 0===e?void 0:e.entity))}}
              >
                ${ho?B`
                      <span class="secondary-info home">
                        ${(null===(ki=null===(xi=io.home)||void 0===xi?void 0:xi.secondary_info)||void 0===ki?void 0:ki.icon)?B`<ha-icon class="secondary-info small" .icon=${null===(Si=null===(Ci=io.home)||void 0===Ci?void 0:Ci.secondary_info)||void 0===Si?void 0:Si.icon}></ha-icon>`:""}
                        ${this.displayValue(No,null===(Ai=null===(Ei=io.home)||void 0===Ei?void 0:Ei.secondary_info)||void 0===Ai?void 0:Ai.unit_of_measurement,null===(Pi=null===(Mi=io.home)||void 0===Mi?void 0:Mi.secondary_info)||void 0===Pi?void 0:Pi.unit_white_space)}
                      </span>
                    `:""}
                <ha-icon .icon=${(null===(Di=io.home)||void 0===Di?void 0:Di.icon)||"mdi:home"}></ha-icon>
                ${this.displayValue(Go)}
                <svg>
                  ${void 0!==Yo?F`<circle
                            class="solar"
                            cx="40"
                            cy="40"
                            r="38"
                            stroke-dasharray="${Yo} ${re-Yo}"
                            shape-rendering="geometricPrecision"
                            stroke-dashoffset="-${re-Yo}"
                          />`:""}
                  ${Zo?F`<circle
                            class="battery"
                            cx="40"
                            cy="40"
                            r="38"
                            stroke-dasharray="${Zo} ${re-Zo}"
                            stroke-dashoffset="-${re-Zo-(Yo||0)}"
                            shape-rendering="geometricPrecision"
                          />`:""}
                  ${void 0!==Qo?F`<circle
                            class="low-carbon"
                            cx="40"
                            cy="40"
                            r="38"
                            stroke-dasharray="${Qo} ${re-Qo}"
                            stroke-dashoffset="-${re-Qo-(Zo||0)-(Yo||0)}"
                            shape-rendering="geometricPrecision"
                          />`:""}
                  <circle
                    class="grid"
                    cx="40"
                    cy="40"
                    r="38"
                    stroke-dasharray="${null!=Xo?Xo:re-Yo-(Zo||0)} ${void 0!==Xo?re-Xo:Yo+(Zo||0)}"
                    stroke-dashoffset="0"
                    shape-rendering="geometricPrecision"
                  />
                </svg>
              </div>
              ${ro&&lo?"":B` <span class="label"
                    >${(null===(Ni=io.home)||void 0===Ni?void 0:Ni.name)||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.home")}</span
                  >`}
            </div>
          </div>
          ${no||lo&&ro?B`<div class="row">
                <div class="spacer"></div>
                ${no?B` <div class="circle-container battery">
                      <div
                        class="circle"
                        @click=${t=>{var e,i,o,n,r;const a=(null===(e=io.battery)||void 0===e?void 0:e.state_of_charge)?null===(i=io.battery)||void 0===i?void 0:i.state_of_charge:"string"==typeof(null===(o=io.battery)||void 0===o?void 0:o.entity)?null===(n=io.battery)||void 0===n?void 0:n.entity:null===(r=io.battery)||void 0===r?void 0:r.entity.production;t.stopPropagation(),this.openDetails(a)}}
                        @keyDown=${t=>{var e,i;if("Enter"===t.key){const o=(null===(e=io.battery)||void 0===e?void 0:e.state_of_charge)?null===(i=io.battery)||void 0===i?void 0:i.state_of_charge:"string"==typeof io.battery.entity?io.battery.entity:io.battery.entity.production;t.stopPropagation(),this.openDetails(o)}}}
                      >
                        ${null!==en?B` <span
                              @click=${t=>{var e;t.stopPropagation(),this.openDetails(null===(e=io.battery)||void 0===e?void 0:e.state_of_charge)}}
                              @keyDown=${t=>{var e;"Enter"===t.key&&(t.stopPropagation(),this.openDetails(null===(e=io.battery)||void 0===e?void 0:e.state_of_charge))}}
                              id="battery-state-of-charge-text"
                            >
                              ${n(en,this.hass.locale,{maximumFractionDigits:0,minimumFractionDigits:0})}${!1===(null===(Ti=null===(zi=this._config.entities)||void 0===zi?void 0:zi.battery)||void 0===Ti?void 0:Ti.state_of_charge_unit_white_space)?"":" "}%
                            </span>`:null}
                        <ha-icon
                          .icon=${on}
                          style=${"two_way"===(null===(Ii=io.battery)||void 0===Ii?void 0:Ii.display_state)?"padding-top: 0px; padding-bottom: 2px;":"one_way"===(null===(Oi=io.battery)||void 0===Oi?void 0:Oi.display_state)&&0===To&&0===Io?"padding-top: 2px; padding-bottom: 0px;":"padding-top: 2px; padding-bottom: 2px;"}
                          @click=${t=>{var e;t.stopPropagation(),this.openDetails(null===(e=io.battery)||void 0===e?void 0:e.state_of_charge)}}
                          @keyDown=${t=>{var e;"Enter"===t.key&&(t.stopPropagation(),this.openDetails(null===(e=io.battery)||void 0===e?void 0:e.state_of_charge))}}
                        ></ha-icon>
                        ${"two_way"===(null===(Hi=io.battery)||void 0===Hi?void 0:Hi.display_state)||void 0===(null===(Ri=io.battery)||void 0===Ri?void 0:Ri.display_state)||"one_way"===(null===(Ui=io.battery)||void 0===Ui?void 0:Ui.display_state)&&To>0||"one_way_no_zero"===(null===(ji=io.battery)||void 0===ji?void 0:ji.display_state)&&0!==To?B`<span
                              class="battery-in"
                              @click=${t=>{const e="string"==typeof io.battery.entity?io.battery.entity:io.battery.entity.production;t.stopPropagation(),this.openDetails(e)}}
                              @keyDown=${t=>{if("Enter"===t.key){const e="string"==typeof io.battery.entity?io.battery.entity:io.battery.entity.production;t.stopPropagation(),this.openDetails(e)}}}
                            >
                              <ha-icon class="small" .icon=${"mdi:arrow-down"}></ha-icon>
                              ${this.displayValue(To)}</span
                            >`:""}
                        ${"two_way"===(null===(Li=io.battery)||void 0===Li?void 0:Li.display_state)||void 0===(null===(Wi=io.battery)||void 0===Wi?void 0:Wi.display_state)||"one_way"===(null===(Bi=io.battery)||void 0===Bi?void 0:Bi.display_state)&&Io>0||"one_way_no_zero"===(null===(Fi=io.battery)||void 0===Fi?void 0:Fi.display_state)&&(0===To||0!==Io)?B`<span
                              class="battery-out"
                              @click=${t=>{const e="string"==typeof io.battery.entity?io.battery.entity:io.battery.entity.consumption;t.stopPropagation(),this.openDetails(e)}}
                              @keyDown=${t=>{if("Enter"===t.key){const e="string"==typeof io.battery.entity?io.battery.entity:io.battery.entity.consumption;t.stopPropagation(),this.openDetails(e)}}}
                            >
                              <ha-icon class="small" .icon=${"mdi:arrow-up"}></ha-icon>
                              ${this.displayValue(Io)}</span
                            >`:""}
                      </div>
                      <span class="label"
                        >${io.battery.name||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.battery")}</span
                      >
                    </div>`:B`<div class="spacer"></div>`}
                ${ro&&lo?B`<div class="circle-container individual1 bottom">
                      <svg width="80" height="30">
                        <path d="M40 40 v-40" id="individual1" />
                        ${$o?F`<circle
                                r="2.4"
                                class="individual1"
                                vector-effect="non-scaling-stroke"
                              >
                                <animateMotion
                                  dur="1.66s"
                                  repeatCount="indefinite"
                                  calcMode="linear"
                                  keyPoints=${(null===(Vi=io.individual1)||void 0===Vi?void 0:Vi.inverted_animation)?"0;1":"1;0"}
                                  keyTimes="0;1"
                                >
                                  <mpath xlink:href="#individual1" />
                                </animateMotion>
                              </circle>`:""}
                      </svg>
                      <div
                        class="circle"
                        @click=${t=>{var e;t.stopPropagation(),this.openDetails(null===(e=io.individual1)||void 0===e?void 0:e.entity)}}
                        @keyDown=${t=>{var e;"Enter"===t.key&&(t.stopPropagation(),this.openDetails(null===(e=io.individual1)||void 0===e?void 0:e.entity))}}
                      >
                        ${so?B`
                              <span class="secondary-info individual1">
                                ${(null===(Zi=null===(Gi=io.individual1)||void 0===Gi?void 0:Gi.secondary_info)||void 0===Zi?void 0:Zi.icon)?B`<ha-icon class="secondary-info small" .icon=${null===(qi=null===(Yi=io.individual1)||void 0===Yi?void 0:Yi.secondary_info)||void 0===qi?void 0:qi.icon}></ha-icon>`:""}
                                ${this.displayValue(wo,null===(Ji=null===(Ki=io.individual1)||void 0===Ki?void 0:Ki.secondary_info)||void 0===Ji?void 0:Ji.unit_of_measurement,null===(Xi=null===(Qi=io.individual1)||void 0===Qi?void 0:Qi.secondary_info)||void 0===Xi?void 0:Xi.unit_white_space)}
                              </span>
                            `:""}
                        <ha-icon
                          id="individual1-icon"
                          .icon=${ko}
                          style=${so?"padding-top: 2px;":"padding-top: 0px;"}
                        ></ha-icon>
                        ${(null===(to=this._config.entities.individual1)||void 0===to?void 0:to.unit_of_measurement)?this.displayValue($o,null===(eo=this._config.entities.individual1)||void 0===eo?void 0:eo.unit_of_measurement):this.displayValue($o)}
                      </div>
                      <span class="label">${xo}</span>
                    </div>`:B`<div class="spacer"></div>`}
              </div>`:B`<div class="spacer"></div>`}
          ${vo?B`<div
                class="lines ${_t({high:no,"individual1-individual2":!no&&ro&&lo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="solar-home-flow">
                  <path
                    id="solar"
                    class="solar"
                    d="M${no?55:53},0 v${oo?15:17} c0,${no?"30 10,30 30,30":"35 10,35 30,35"} h25"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${Oo?F`<circle
                            r="1"
                            class="solar"
                            vector-effect="non-scaling-stroke"
                          >
                            <animateMotion
                              dur="${nn.solarToHome}s"
                              repeatCount="indefinite"
                              calcMode="linear"
                            >
                              <mpath xlink:href="#solar" />
                            </animateMotion>
                          </circle>`:""}
                </svg>
              </div>`:""}
          ${uo&&vo?B`<div
                class="lines ${_t({high:no,"individual1-individual2":!no&&ro&&lo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="solar-grid-flow">
                  <path
                    id="return"
                    class="return"
                    d="M${no?45:47},0 v15 c0,${no?"30 -10,30 -30,30":"35 -10,35 -30,35"} h-20"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${jo&&vo?F`<circle
                        r="1"
                        class="return"
                        vector-effect="non-scaling-stroke"
                      >
                        <animateMotion
                          dur="${nn.solarToGrid}s"
                          repeatCount="indefinite"
                          calcMode="linear"
                        >
                          <mpath xlink:href="#return" />
                        </animateMotion>
                      </circle>`:""}
                </svg>
              </div>`:""}
          ${no&&vo?B`<div
                class="lines ${_t({high:no,"individual1-individual2":!no&&ro&&lo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="solar-battery-flow">
                  <path id="battery-solar" class="battery-solar" d="M50,0 V100" vector-effect="non-scaling-stroke"></path>
                  ${Uo?F`<circle
                            r="1"
                            class="battery-solar"
                            vector-effect="non-scaling-stroke"
                          >
                            <animateMotion
                              dur="${nn.solarToBattery}s"
                              repeatCount="indefinite"
                              calcMode="linear"
                            >
                              <mpath xlink:href="#battery-solar" />
                            </animateMotion>
                          </circle>`:""}
                </svg>
              </div>`:""}
          ${oo?B`<div
                class="lines ${_t({high:no,"individual1-individual2":!no&&ro&&lo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="grid-home-flow">
                  <path
                    class="grid"
                    id="grid"
                    d="M0,${no?50:vo?56:53} H100"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${Vo?F`<circle
                    r="1"
                    class="grid"
                    vector-effect="non-scaling-stroke"
                  >
                    <animateMotion
                      dur="${nn.gridToHome}s"
                      repeatCount="indefinite"
                      calcMode="linear"
                    >
                      <mpath xlink:href="#grid" />
                    </animateMotion>
                  </circle>`:""}
                </svg>
              </div>`:null}
          ${no?B`<div
                class="lines ${_t({high:no,"individual1-individual2":!no&&ro&&lo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="battery-home-flow">
                  <path
                    id="battery-home"
                    class="battery-home"
                    d="M55,100 v-${oo?15:17} c0,-30 10,-30 30,-30 h20"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${Lo?F`<circle
                        r="1"
                        class="battery-home"
                        vector-effect="non-scaling-stroke"
                      >
                        <animateMotion
                          dur="${nn.batteryToHome}s"
                          repeatCount="indefinite"
                          calcMode="linear"
                        >
                          <mpath xlink:href="#battery-home" />
                        </animateMotion>
                      </circle>`:""}
                </svg>
              </div>`:""}
          ${oo&&no?B`<div
                class="lines ${_t({high:no,"individual1-individual2":!no&&ro&&lo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="battery-grid-flow">
                  <path
                    id="battery-grid"
                    class=${_t({"battery-from-grid":Boolean(Ho),"battery-to-grid":Boolean(Ro)})}
                    d="M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${Ho?F`<circle
                    r="1"
                    class="battery-from-grid"
                    vector-effect="non-scaling-stroke"
                  >
                    <animateMotion
                      dur="${nn.batteryGrid}s"
                      repeatCount="indefinite"
                      keyPoints="1;0" keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath xlink:href="#battery-grid" />
                    </animateMotion>
                  </circle>`:""}
                  ${Ro?F`<circle
                        r="1"
                        class="battery-to-grid"
                        vector-effect="non-scaling-stroke"
                      >
                        <animateMotion
                          dur="${nn.batteryGrid}s"
                          repeatCount="indefinite"
                          calcMode="linear"
                        >
                          <mpath xlink:href="#battery-grid" />
                        </animateMotion>
                      </circle>`:""}
                </svg>
              </div>`:""}
        </div>
        ${this._config.dashboard_link?B`
              <div class="card-actions">
                <a href=${this._config.dashboard_link}
                  ><mwc-button>
                    ${this._config.dashboard_link_label||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.go_to_energy_dashboard")}
                  </mwc-button></a
                >
              </div>
            `:""}
      </ha-card>
    `}};ae.styles=h`
    :host {
      --mdc-icon-size: 24px;
      --clickable-cursor: pointer;
      --individualone-color: #d0cc5b;
      --individualtwo-color: #964cb5;
      --non-fossil-color: var(--energy-non-fossil-color, #0f9d58);
      --icon-non-fossil-color: var(--non-fossil-color, #0f9d58);
      --icon-solar-color: var(--energy-solar-color, #ff9800);
      --icon-individualone-color: var(--individualone-color, #d0cc5b);
      --icon-individualtwo-color: var(--individualtwo-color, #964cb5);
      --icon-grid-color: var(--energy-grid-consumption-color, #488fc2);
      --icon-battery-color: var(--energy-battery-in-color, #f06292);
      --icon-home-color: var(--energy-grid-consumption-color, #488fc2);
      --text-solar-color: var(--primary-text-color);
      --text-non-fossil-color: var(--primary-text-color);
      --text-individualone-color: var(--primary-text-color);
      --text-individualtwo-color: var(--primary-text-color);
      --text-home-color: var(--primary-text-color);
      --secondary-text-individualone-color: var(--primary-text-color);
      --secondary-text-individualtwo-color: var(--primary-text-color);
      --text-battery-state-of-charge-color: var(--primary-text-color);
      --cirlce-grid-color: var(--energy-grid-consumption-color, #488fc2);
      --circle-battery-color: var(--energy-battery-in-color, #f06292);
      --secondary-text-solar-color: var(--primary-text-color);
      --secondary-text-grid-color: var(--primary-text-color);
      --secondary-text-home-color: var(--primary-text-color);
    }
    :root {
    }
    .card-content {
      position: relative;
    }
    .lines {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 146px;
      display: flex;
      justify-content: center;
      padding: 0 16px 16px;
      box-sizing: border-box;
    }
    .lines.individual1-individual2 {
      bottom: 110px;
    }
    .lines.high {
      bottom: 100px;
      height: 156px;
    }
    .lines svg {
      width: calc(100% - 160px);
      height: 100%;
      max-width: 340px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      max-width: 500px;
      margin: 0 auto;
    }
    .circle-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
    }
    .circle-container.solar {
      margin: 0 4px;
      height: 130px;
    }
    .circle-container.individual2 {
      margin-left: 4px;
      height: 130px;
    }
    .circle-container.individual1 {
      margin-left: 4px;
      height: 130px;
    }
    .circle-container.individual1.bottom {
      position: relative;
      top: -20px;
      margin-bottom: -20px;
    }
    .circle-container.battery {
      height: 110px;
      justify-content: flex-end;
    }
    .spacer {
      width: 84px;
    }
    .circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      box-sizing: border-box;
      border: 2px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 12px;
      line-height: 12px;
      position: relative;
      text-decoration: none;
      color: var(--primary-text-color);
    }
    .circle-container .circle {
      cursor: var(--clickable-cursor);
    }
    #battery-grid {
      stroke: var(--energy-grid-return-color);
    }
    ha-icon {
      padding-bottom: 2px;
    }
    ha-icon.small {
      --mdc-icon-size: 12px;
    }
    .label {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    line,
    path {
      stroke: var(--disabled-text-color);
      stroke-width: 1;
      fill: none;
    }
    .circle svg {
      position: absolute;
      fill: none;
      stroke-width: 4px;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    span.secondary-info {
      color: var(--primary-text-color);
      font-size: 12px;
    }

    .individual2 path,
    .individual2 circle {
      stroke: var(--individualtwo-color);
    }

    #individual1-icon {
      color: var(--icon-individualone-color);
    }
    #individual2-icon {
      color: var(--icon-individualtwo-color);
    }
    #solar-icon {
      color: var(--icon-solar-color);
    }
    circle.individual2 {
      stroke-width: 4;
      fill: var(--individualtwo-color);
    }
    .individual2 .circle {
      border-color: var(--individualtwo-color);
    }
    .individual1 path,
    .individual1 circle {
      stroke: var(--individualone-color);
    }
    circle.individual1 {
      stroke-width: 4;
      fill: var(--individualone-color);
    }
    .individual1 .circle {
      border-color: var(--individualone-color);
    }
    .circle-container.low-carbon {
      margin-right: 4px;
      height: 130px;
    }
    .low-carbon path {
      stroke: var(--non-fossil-color);
    }
    .low-carbon .circle {
      border-color: var(--non-fossil-color);
    }
    .low-carbon ha-icon {
      color: var(--icon-non-fossil-color);
    }
    circle.low-carbon {
      stroke-width: 4;
      fill: var(--non-fossil-color);
      stroke: var(--non-fossil-color);
    }
    .solar {
      color: var(--primary-text-color);
    }
    .solar .circle {
      border-color: var(--energy-solar-color);
    }
    .solar ha-icon:not(.small) {
      color: var(--icon-solar-color);
    }
    circle.solar,
    path.solar {
      stroke: var(--energy-solar-color);
    }
    circle.solar {
      stroke-width: 4;
      fill: var(--energy-solar-color);
    }
    .battery .circle {
      border-color: var(--circle-battery-color);
    }
    circle.battery,
    path.battery {
      stroke: var(--energy-battery-out-color);
    }
    path.battery-home,
    circle.battery-home {
      stroke: var(--energy-battery-out-color);
    }
    circle.battery-home {
      stroke-width: 4;
      fill: var(--energy-battery-out-color);
    }
    path.battery-solar,
    circle.battery-solar {
      stroke: var(--energy-battery-in-color);
    }
    circle.battery-solar {
      stroke-width: 4;
      fill: var(--energy-battery-in-color);
    }
    .battery-in {
      color: var(--energy-battery-in-color);
    }
    .battery-out {
      color: var(--energy-battery-out-color);
    }
    path.battery-from-grid {
      stroke: var(--energy-grid-consumption-color);
    }
    path.battery-to-grid {
      stroke: var(--energy-grid-return-color);
    }
    .battery ha-icon:not(.small) {
      color: var(--icon-battery-color);
    }

    path.return,
    circle.return,
    circle.battery-to-grid {
      stroke: var(--energy-grid-return-color);
    }
    circle.return,
    circle.battery-to-grid {
      stroke-width: 4;
      fill: var(--energy-grid-return-color);
    }
    .return {
      color: var(--energy-grid-return-color);
    }
    .grid .circle {
      border-color: var(--circle-grid-color);
    }
    .consumption {
      color: var(--energy-grid-consumption-color);
    }
    circle.grid,
    circle.battery-from-grid,
    path.grid {
      stroke: var(--energy-grid-consumption-color);
    }
    circle.grid,
    circle.battery-from-grid {
      stroke-width: 4;
      fill: var(--energy-grid-consumption-color);
    }
    .grid ha-icon:not(.small) {
      color: var(--icon-grid-color);
    }
    .home .circle {
      border-width: 0;
      border-color: var(--primary-color);
    }
    .home .circle.border {
      border-width: 2px;
    }
    .home ha-icon:not(.small) {
      color: var(--icon-home-color);
    }
    .circle svg circle {
      animation: rotate-in 0.6s ease-in;
      transition: stroke-dashoffset 0.4s, stroke-dasharray 0.4s;
      fill: none;
    }
    span.solar {
      color: var(--text-solar-color);
    }

    span.low-carbon {
      color: var(--text-non-fossil-color);
    }

    #home-circle {
      color: var(--text-home-color);
    }

    .individual1 .circle {
      color: var(--text-individualone-color);
    }

    .individual2 .circle {
      color: var(--text-individualtwo-color);
    }

    .individual1 span.secondary-info {
      color: var(--secondary-text-individualone-color);
    }

    .individual2 span.secondary-info {
      color: var(--secondary-text-individualtwo-color);
    }

    .solar span.secondary-info {
      color: var(--secondary-text-solar-color);
    }

    .grid span.secondary-info {
      color: var(--secondary-text-grid-color);
    }

    .home span.secondary-info {
      color: var(--secondary-text-home-color);
    }

    #battery-state-of-charge-text {
      color: var(--text-battery-state-of-charge-color);
    }

    @keyframes rotate-in {
      from {
        stroke-dashoffset: 238.76104;
        stroke-dasharray: 238.76104;
      }
    }

    .card-actions a {
      text-decoration: none;
    }
  `,t([ut({attribute:!1})],ae.prototype,"hass",void 0),t([yt()],ae.prototype,"_config",void 0),t([pt("#battery-grid-flow")],ae.prototype,"batteryGridFlow",void 0),t([pt("#battery-home-flow")],ae.prototype,"batteryToHomeFlow",void 0),t([pt("#grid-home-flow")],ae.prototype,"gridToHomeFlow",void 0),t([pt("#solar-battery-flow")],ae.prototype,"solarToBatteryFlow",void 0),t([pt("#solar-grid-flow")],ae.prototype,"solarToGridFlow",void 0),t([pt("#solar-home-flow")],ae.prototype,"solarToHomeFlow",void 0),ae=t([ht("power-flow-card-plus")],ae);const le=window;le.customCards=le.customCards||[],le.customCards.push({type:"power-flow-card-plus",name:"Power Flow Card Plus",description:"An extended version of the power flow card with richer options, advanced features and a few small enhancements. Inspired by the Energy Dashboard."});
