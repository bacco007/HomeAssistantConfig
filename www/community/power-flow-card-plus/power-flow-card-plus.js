function e(e,t,i,o){var n,l=arguments.length,r=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(l<3?n(r):l>3?n(t,i,r):n(t,i))||r);return l>3&&r&&Object.defineProperty(t,i,r),r}var t,i;function o(){return(o=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var o in i)Object.prototype.hasOwnProperty.call(i,o)&&(e[o]=i[o])}return e}).apply(this,arguments)}!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(t||(t={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(i||(i={}));var n=function(e,i,o){var n=i?function(e){switch(e.number_format){case t.comma_decimal:return["en-US","en"];case t.decimal_comma:return["de","es","it"];case t.space_comma:return["fr","sv","cs"];case t.system:return;default:return e.language}}(i):void 0;if(Number.isNaN=Number.isNaN||function e(t){return"number"==typeof t&&e(t)},(null==i?void 0:i.number_format)!==t.none&&!Number.isNaN(Number(e))&&Intl)try{return new Intl.NumberFormat(n,l(e,o)).format(Number(e))}catch(t){return console.error(t),new Intl.NumberFormat(void 0,l(e,o)).format(Number(e))}return"string"==typeof e?e:function(e,t){return void 0===t&&(t=2),Math.round(e*Math.pow(10,t))/Math.pow(10,t)}(e,null==o?void 0:o.maximumFractionDigits).toString()+("currency"===(null==o?void 0:o.style)?" "+o.currency:"")},l=function(e,t){var i=o({maximumFractionDigits:2},t);if("string"!=typeof e)return i;if(!t||!t.minimumFractionDigits&&!t.maximumFractionDigits){var n=e.indexOf(".")>-1?e.split(".")[1].length:0;i.minimumFractionDigits=n,i.maximumFractionDigits=n}return i};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r=window,a=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),d=new WeakMap;class c{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=d.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&d.set(t,e))}return e}toString(){return this.cssText}}const u=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1]),e[0]);return new c(i,e,s)},v=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new c("string"==typeof e?e:e+"",void 0,s))(t)})(e):e
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var h;const p=window,y=p.trustedTypes,m=y?y.emptyScript:"",f=p.reactiveElementPolyfillSupport,_={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},g=(e,t)=>t!==e&&(t==t||e==e),b={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:g};class $ extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,i)=>{const o=this._$Ep(i,t);void 0!==o&&(this._$Ev.set(o,i),e.push(o))})),e}static createProperty(e,t=b){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i="symbol"==typeof e?Symbol():"__"+e,o=this.getPropertyDescriptor(e,i,t);void 0!==o&&Object.defineProperty(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(o){const n=this[e];this[t]=o,this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||b}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const i of t)this.createProperty(i,e[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(v(e))}else void 0!==e&&t.push(v(e));return t}static _$Ep(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,i;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(i=e.hostConnected)||void 0===i||i.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;const t=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{a?e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):t.forEach((t=>{const i=document.createElement("style"),o=r.litNonce;void 0!==o&&i.setAttribute("nonce",o),i.textContent=t.cssText,e.appendChild(i)}))})(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=b){var o;const n=this.constructor._$Ep(e,i);if(void 0!==n&&!0===i.reflect){const l=(void 0!==(null===(o=i.converter)||void 0===o?void 0:o.toAttribute)?i.converter:_).toAttribute(t,i.type);this._$El=e,null==l?this.removeAttribute(n):this.setAttribute(n,l),this._$El=null}}_$AK(e,t){var i;const o=this.constructor,n=o._$Ev.get(e);if(void 0!==n&&this._$El!==n){const e=o.getPropertyOptions(n),l="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(i=e.converter)||void 0===i?void 0:i.fromAttribute)?e.converter:_;this._$El=n,this[n]=l.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let o=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||g)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):o=!1),!this.isUpdatePending&&o&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,t)=>this[t]=e)),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,t)=>this._$EO(t,this[t],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var w;$.finalized=!0,$.elementProperties=new Map,$.elementStyles=[],$.shadowRootOptions={mode:"open"},null==f||f({ReactiveElement:$}),(null!==(h=p.reactiveElementVersions)&&void 0!==h?h:p.reactiveElementVersions=[]).push("1.6.1");const x=window,k=x.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",A=`lit$${(Math.random()+"").slice(9)}$`,C="?"+A,M=`<${C}>`,P=document,D=()=>P.createComment(""),O=e=>null===e||"object"!=typeof e&&"function"!=typeof e,z=Array.isArray,R="[ \t\n\f\r]",T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,j=/>/g,H=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,I=/"/g,F=/^(?:script|style|textarea|title)$/i,L=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),W=L(1),V=L(2),B=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),G=new WeakMap,Y=P.createTreeWalker(P,129,null,!1),q=(e,t)=>{const i=e.length-1,o=[];let n,l=2===t?"<svg>":"",r=T;for(let t=0;t<i;t++){const i=e[t];let a,s,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,s=r.exec(i),null!==s);)c=r.lastIndex,r===T?"!--"===s[1]?r=N:void 0!==s[1]?r=j:void 0!==s[2]?(F.test(s[2])&&(n=RegExp("</"+s[2],"g")),r=H):void 0!==s[3]&&(r=H):r===H?">"===s[0]?(r=null!=n?n:T,d=-1):void 0===s[1]?d=-2:(d=r.lastIndex-s[2].length,a=s[1],r=void 0===s[3]?H:'"'===s[3]?I:U):r===I||r===U?r=H:r===N||r===j?r=T:(r=H,n=void 0);const u=r===H&&e[t+1].startsWith("/>")?" ":"";l+=r===T?i+M:d>=0?(o.push(a),i.slice(0,d)+E+i.slice(d)+A+u):i+A+(-2===d?(o.push(void 0),t):u)}const a=l+(e[i]||"<?>")+(2===t?"</svg>":"");if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==S?S.createHTML(a):a,o]};class K{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let n=0,l=0;const r=e.length-1,a=this.parts,[s,d]=q(e,t);if(this.el=K.createElement(s,i),Y.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(o=Y.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes()){const e=[];for(const t of o.getAttributeNames())if(t.endsWith(E)||t.startsWith(A)){const i=d[l++];if(e.push(t),void 0!==i){const e=o.getAttribute(i.toLowerCase()+E).split(A),t=/([.?@])?(.*)/.exec(i);a.push({type:1,index:n,name:t[2],strings:e,ctor:"."===t[1]?te:"?"===t[1]?oe:"@"===t[1]?ne:ee})}else a.push({type:6,index:n})}for(const t of e)o.removeAttribute(t)}if(F.test(o.tagName)){const e=o.textContent.split(A),t=e.length-1;if(t>0){o.textContent=k?k.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],D()),Y.nextNode(),a.push({type:2,index:++n});o.append(e[t],D())}}}else if(8===o.nodeType)if(o.data===C)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=o.data.indexOf(A,e+1));)a.push({type:7,index:n}),e+=A.length-1}n++}}static createElement(e,t){const i=P.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,o){var n,l,r,a;if(t===B)return t;let s=void 0!==o?null===(n=i._$Co)||void 0===n?void 0:n[o]:i._$Cl;const d=O(t)?void 0:t._$litDirective$;return(null==s?void 0:s.constructor)!==d&&(null===(l=null==s?void 0:s._$AO)||void 0===l||l.call(s,!1),void 0===d?s=void 0:(s=new d(e),s._$AT(e,i,o)),void 0!==o?(null!==(r=(a=i)._$Co)&&void 0!==r?r:a._$Co=[])[o]=s:i._$Cl=s),void 0!==s&&(t=J(e,s._$AS(e,t.values),s,o)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:o}=this._$AD,n=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:P).importNode(i,!0);Y.currentNode=n;let l=Y.nextNode(),r=0,a=0,s=o[0];for(;void 0!==s;){if(r===s.index){let t;2===s.type?t=new X(l,l.nextSibling,this,e):1===s.type?t=new s.ctor(l,s.name,s.strings,this,e):6===s.type&&(t=new le(l,this,e)),this._$AV.push(t),s=o[++a]}r!==(null==s?void 0:s.index)&&(l=Y.nextNode(),r++)}return n}v(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{constructor(e,t,i,o){var n;this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cp=null===(n=null==o?void 0:o.isConnected)||void 0===n||n}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),O(e)?e===Z||null==e||""===e?(this._$AH!==Z&&this._$AR(),this._$AH=Z):e!==this._$AH&&e!==B&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>z(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==Z&&O(this._$AH)?this._$AA.nextSibling.data=e:this.$(P.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:o}=e,n="number"==typeof o?this._$AC(e):(void 0===o.el&&(o.el=K.createElement(o.h,this.options)),o);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===n)this._$AH.v(i);else{const e=new Q(n,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new K(e)),t}T(e){z(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const n of e)o===t.length?t.push(i=new X(this.k(D()),this.k(D()),this,this.options)):i=t[o],i._$AI(n),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class ee{constructor(e,t,i,o,n){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,o){const n=this.strings;let l=!1;if(void 0===n)e=J(this,e,t,0),l=!O(e)||e!==this._$AH&&e!==B,l&&(this._$AH=e);else{const o=e;let r,a;for(e=n[0],r=0;r<n.length-1;r++)a=J(this,o[i+r],t,r),a===B&&(a=this._$AH[r]),l||(l=!O(a)||a!==this._$AH[r]),a===Z?e=Z:e!==Z&&(e+=(null!=a?a:"")+n[r+1]),this._$AH[r]=a}l&&!o&&this.j(e)}j(e){e===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Z?void 0:e}}const ie=k?k.emptyScript:"";class oe extends ee{constructor(){super(...arguments),this.type=4}j(e){e&&e!==Z?this.element.setAttribute(this.name,ie):this.element.removeAttribute(this.name)}}class ne extends ee{constructor(e,t,i,o,n){super(e,t,i,o,n),this.type=5}_$AI(e,t=this){var i;if((e=null!==(i=J(this,e,t,0))&&void 0!==i?i:Z)===B)return;const o=this._$AH,n=e===Z&&o!==Z||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,l=e!==Z&&(o===Z||n);n&&this.element.removeEventListener(this.name,this,o),l&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==i?i:this.element,e):this._$AH.handleEvent(e)}}class le{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re=x.litHtmlPolyfillSupport;null==re||re(K,X),(null!==(w=x.litHtmlVersions)&&void 0!==w?w:x.litHtmlVersions=[]).push("2.7.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ae,se;class de extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{var o,n;const l=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:t;let r=l._$litPart$;if(void 0===r){const e=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;l._$litPart$=r=new X(t.insertBefore(D(),e),e,void 0,null!=i?i:{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return B}}de.finalized=!0,de._$litElement$=!0,null===(ae=globalThis.litElementHydrateSupport)||void 0===ae||ae.call(globalThis,{LitElement:de});const ce=globalThis.litElementPolyfillSupport;null==ce||ce({LitElement:de}),(null!==(se=globalThis.litElementVersions)&&void 0!==se?se:globalThis.litElementVersions=[]).push("3.3.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ue=e=>t=>"function"==typeof t?((e,t)=>(customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:i,elements:o}=t;return{kind:i,elements:o,finisher(t){customElements.define(e,t)}}})(e,t)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,ve=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(i){i.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}};function he(e){return(t,i)=>void 0!==i?((e,t,i)=>{t.constructor.createProperty(i,e)})(e,t,i):ve(e,t)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function pe(e){return he({...e,state:!0})}
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
function ye(e,t){return(({finisher:e,descriptor:t})=>(i,o)=>{var n;if(void 0===o){const o=null!==(n=i.originalKey)&&void 0!==n?n:i.key,l=null!=t?{kind:"method",placement:"prototype",key:o,descriptor:t(i.key)}:{...i,key:o};return null!=e&&(l.finisher=function(t){e(t,o)}),l}{const n=i.constructor;void 0!==t&&Object.defineProperty(i,o,t(o)),null==e||e(n,o)}})({descriptor:i=>{const o={get(){var t,i;return null!==(i=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(e))&&void 0!==i?i:null},enumerable:!0,configurable:!0};if(t){const t="symbol"==typeof i?Symbol():"__"+i;o.get=function(){var i,o;return void 0===this[t]&&(this[t]=null!==(o=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(e))&&void 0!==o?o:null),this[t]}}return o}})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var me;null===(me=window.HTMLSlotElement)||void 0===me||me.prototype.assignedElements;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fe=1;class _e{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ge=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends _e{constructor(e){var t;if(super(e),e.type!==fe||"class"!==e.name||(null===(t=e.strings)||void 0===t?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter((t=>e[t])).join(" ")+" "}update(e,[t]){var i,o;if(void 0===this.it){this.it=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter((e=>""!==e))));for(const e in t)t[e]&&!(null===(i=this.nt)||void 0===i?void 0:i.has(e))&&this.it.add(e);return this.render(t)}const n=e.element.classList;this.it.forEach((e=>{e in t||(n.remove(e),this.it.delete(e))}));for(const e in t){const i=!!t[e];i===this.it.has(e)||(null===(o=this.nt)||void 0===o?void 0:o.has(e))||(i?(n.add(e),this.it.add(e)):(n.remove(e),this.it.delete(e)))}return B}}),be=(e,t)=>Number(`${Math.round(Number(`${e}e${t}`))}e-${t}`)
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */;function $e(e){return!isNaN(parseFloat(e))&&!isNaN(Number(e))}function we(e,t=0){return $e(e)?Number(e):t}function xe(e,t=/\s+/){const i=[];if(null!=e){const o=Array.isArray(e)?e:`${e}`.split(t);for(const e of o){const t=`${e}`.trim();t&&i.push(t)}}return i}var ke="0.1beta";console.groupCollapsed(`%c⚡ Power Flow Card Plus v${ke} is installed`,"color: #488fc2; font-weight: bold"),console.log("Readme:","https://github.com/flixlix/power-flow-card-plus"),console.groupEnd();const Se=function(e,t,i){var o;return void 0===i&&(i=!1),function(){var n=[].slice.call(arguments),l=this,r=i&&!o;clearTimeout(o),o=setTimeout((function(){o=null,i||e.apply(l,n)}),t),r&&e.apply(l,n)}}((e=>{console.log(`%c⚡ Power Flow Card Plus v${ke} %cError: ${e}`,"color: #488fc2; font-weight: bold","color: #b33a3a; font-weight: normal")}),6e4);const Ee=u`
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
    --secondary-text-non-fossil-color: var(--primary-text-color);
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
    max-width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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
    max-width: 60px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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
  .low-carbon ha-icon:not(.small) {
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

  span.low-carbon.secondary-info {
    color: var(--secondary-text-non-fossil-color);
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
`,Ae=6,Ce=.75,Me=0,Pe=1,De=.01,Oe=2e3,ze=1e3;const Re=238.76104;!function(e){const t=window;t.customCards=t.customCards||[],t.customCards.push(Object.assign(Object.assign({},e),{preview:!0,documentationURL:"https://github.com/flixlix/power-flow-card-plus"}))}({type:"power-flow-card-plus",name:"Power Flow Card Plus",description:"An extended version of the power flow card with richer options, advanced features and a few small UI enhancements. Inspired by the Energy Dashboard."});let Te=class extends de{constructor(){super(...arguments),this._config={},this._templateResults={},this._unsubRenderTemplates=new Map,this.unavailableOrMisconfiguredError=e=>Se(`Entity "${null!=e?e:"Unknown"}" is not available or misconfigured`),this.entityExists=e=>e in this.hass.states,this.entityAvailable=e=>{var t;return $e(null===(t=this.hass.states[e])||void 0===t?void 0:t.state)},this.entityInverted=e=>this._config.inverted_entities.includes(e),this.previousDur={},this.circleRate=(e,t)=>{var i,o;if(this._config.use_new_flow_rate_model){const t=this._config.max_expected_power,i=this._config.min_expected_power,o=this._config.max_flow_rate,n=this._config.min_flow_rate;return this.mapRange(e,o,n,i,t)}const n=null===(i=this._config)||void 0===i?void 0:i.min_flow_rate,l=null===(o=this._config)||void 0===o?void 0:o.max_flow_rate;return l-e/t*(l-n)},this.getEntityStateObj=e=>{if(e&&this.entityAvailable(e))return this.hass.states[e];this.unavailableOrMisconfiguredError(e)},this.additionalCircleRate=(e,t)=>!0===e&&t?t:$e(e)?e:1.66,this.getEntityState=e=>e&&this.entityAvailable(e)?we(this.hass.states[e].state):(this.unavailableOrMisconfiguredError(e),0),this.getEntityStateWatts=e=>{if(!e||!this.entityAvailable(e))return this.unavailableOrMisconfiguredError(e),0;const t=this.hass.states[e],i=we(t.state);return"kW"===t.attributes.unit_of_measurement?1e3*i:i},this.displayNonFossilState=(e,t)=>{var i,o,n,l,r;if(!e||!this.entityAvailable(e))return this.unavailableOrMisconfiguredError(e),"NaN";const a=null===(o=null===(i=this._config.entities.fossil_fuel_percentage)||void 0===i?void 0:i.unit_white_space)||void 0===o||o,s="percentage"===(null===(n=this._config.entities.fossil_fuel_percentage)||void 0===n?void 0:n.state_type)?"%":"W",d=1-this.getEntityState(e)/100;let c,u;c="string"==typeof this._config.entities.grid.entity?t:this.getEntityStateWatts(this._config.entities.grid.entity.consumption)||0;const v=null!==(r=null===(l=this._config.entities.fossil_fuel_percentage)||void 0===l?void 0:l.display_zero_tolerance)&&void 0!==r?r:0;if("W"===s){let e=c*d;v&&e<v&&(e=0),u=this.displayValue(e,"W",a)}else{let t=100-this.getEntityState(e);v&&t<v&&(t=0),u=t.toFixed(0).toString().concat(!1===a?"":" ").concat(s)}return u},this.displayValue=(e,t,i)=>{if(null===e)return"0";if(Number.isNaN(+e))return e;const o=Number(e),l=void 0===t&&o>=this._config.watt_threshold;return`${n(l?be(o/1e3,this._config.kw_decimals):be(o,this._config.w_decimals),this.hass.locale)}${!1===i?"":" "}${t||(l?"kW":"W")}`}}setConfig(e){var t,i,o,n,l,r;if(!e.entities||!(null===(i=null===(t=e.entities)||void 0===t?void 0:t.battery)||void 0===i?void 0:i.entity)&&!(null===(n=null===(o=e.entities)||void 0===o?void 0:o.grid)||void 0===n?void 0:n.entity)&&!(null===(r=null===(l=e.entities)||void 0===l?void 0:l.solar)||void 0===r?void 0:r.entity))throw new Error("At least one entity for battery, grid or solar must be defined");this._config=Object.assign(Object.assign({},e),{inverted_entities:xe(e.inverted_entities,","),kw_decimals:we(e.kw_decimals,Pe),min_flow_rate:we(e.min_flow_rate,Ce),max_flow_rate:we(e.max_flow_rate,Ae),w_decimals:we(e.w_decimals,Me),watt_threshold:we(e.watt_threshold,ze),max_expected_power:we(e.max_expected_power,Oe),min_expected_power:we(e.min_expected_power,De)})}connectedCallback(){super.connectedCallback(),this._tryConnectAll()}disconnectedCallback(){this._tryDisconnectAll()}static async getConfigElement(){return await Promise.resolve().then((function(){return _t})),document.createElement("power-flow-card-plus-editor")}static getStubConfig(e){return function(e){function t(t,i){const o=e.states[t].attributes.friendly_name;return i.some((e=>t.includes(e)||(null==o?void 0:o.includes(e))))}const i=Object.keys(e.states).filter((t=>{const i=e.states[t];return i.state&&i.attributes&&"power"===i.attributes.device_class||i.entity_id.includes("power")})),o=["grid","utility","net","meter"],n=["solar","pv","photovoltaic","inverter"],l=["battery"],r=["battery_percent","battery_level","state_of_charge","soc","percentage"],a=i.filter((e=>t(e,o)))[0],s=i.filter((e=>t(e,n)))[0],d=i.filter((e=>t(e,l)))[0],c=Object.keys(e.states).filter((t=>{const i=e.states[t];return i&&i.state&&i.attributes&&"%"===i.attributes.unit_of_measurement})).filter((e=>t(e,r)))[0];return{entities:{battery:{entity:null!=d?d:"",state_of_charge:null!=c?c:""},grid:a?{entity:a}:void 0,solar:s?{entity:s,display_zero_state:!0}:void 0},clickable_entities:!0,display_zero_lines:!0,use_new_flow_rate_model:!0,w_decimals:Me,kw_decimals:Pe,min_flow_rate:Ce,max_flow_rate:Ae,max_expected_power:Oe,min_expected_power:De,watt_threshold:ze}}(e)}getCardSize(){return 3}mapRange(e,t,i,o,n){return e>n?i:(e-o)*(i-t)/(n-o)+t}openDetails(e){if(!e||!this._config.clickable_entities)return;if(!this.entityExists(e))return;const t=new CustomEvent("hass-more-info",{composed:!0,detail:{entityId:e}});this.dispatchEvent(t)}hasField(e,t){var i,o;return!!(void 0!==e&&!0===(null==e?void 0:e.display_zero)||this.getEntityStateWatts(null==e?void 0:e.entity)>(null!==(i=null==e?void 0:e.display_zero_tolerance)&&void 0!==i?i:0)&&this.entityAvailable(null==e?void 0:e.entity)||t)&&"string"==typeof(null===(o=this.hass.states[null==e?void 0:e.entity])||void 0===o?void 0:o.state)}showLine(e){var t;return!1!==(null===(t=this._config)||void 0===t?void 0:t.display_zero_lines)||e>0}render(){var e,t,i,o,l,r,a,s,d,c,u,v,h,p,y,m,f,_,g,b,$,w,x,k,S,E,A,C,M,P,D,O,z,R,T,N,j,H,U,I,F,L,B,Z,G,Y,q,K,J,Q,X,ee,te,ie,oe,ne,le,re,ae,se,de,ce,ue,ve,he,pe,ye,me,fe,_e,be,$e,xe,ke,Se,Ee,Ae,Ce,Me,Pe,De,Oe,ze,Te,Ne,je,He,Ue,Ie,Fe,Le,We,Ve,Be,Ze,Ge,Ye,qe,Ke,Je,Qe,Xe,et,tt,it,ot,nt,lt,rt,at,st,dt,ct,ut,vt,ht,pt,yt,mt,ft,_t,gt,bt,$t,wt,xt,kt,St,Et,At,Ct,Mt,Pt,Dt,Ot,zt,Rt,Tt,Nt,jt,Ht,Ut,It,Ft,Lt,Wt,Vt,Bt,Zt,Gt,Yt,qt,Kt,Jt,Qt,Xt,ei,ti,ii,oi,ni,li,ri,ai,si,di,ci,ui,vi,hi,pi,yi,mi,fi,_i,gi,bi,$i,wi,xi,ki,Si,Ei,Ai,Ci,Mi,Pi,Di,Oi,zi,Ri,Ti,Ni,ji,Hi,Ui,Ii,Fi,Li,Wi,Vi,Bi,Zi,Gi,Yi,qi,Ki,Ji,Qi,Xi,eo,to,io,oo,no,lo,ro,ao,so,co,uo,vo,ho,po,yo,mo,fo,_o,go,bo,$o,wo,xo,ko,So;if(!this._config||!this.hass)return W``;const{entities:Eo}=this._config;function Ao(e){return"#".concat(e.map((e=>e.toString(16).padStart(2,"0"))).join(""))}this.style.setProperty("--clickable-cursor",this._config.clickable_entities?"pointer":"default");const Co=void 0!==(null===(e=null==Eo?void 0:Eo.grid)||void 0===e?void 0:e.entity),Mo=this.hasField(null===(t=Eo.grid)||void 0===t?void 0:t.power_outage,!0)&&this.hass.states[Eo.grid.power_outage.entity].state===(null!==(o=null===(i=Eo.grid)||void 0===i?void 0:i.power_outage.state_alert)&&void 0!==o?o:"on"),Po=void 0!==(null===(l=null==Eo?void 0:Eo.battery)||void 0===l?void 0:l.entity),Do=this.hasField(Eo.individual2),Oo=this.hasField(null===(r=Eo.individual2)||void 0===r?void 0:r.secondary_info,!0),zo=this.hasField(Eo.individual1),Ro=this.hasField(null===(a=Eo.individual1)||void 0===a?void 0:a.secondary_info,!0),To=void 0!==Eo.solar,No=this.hasField(null===(s=Eo.solar)||void 0===s?void 0:s.secondary_info),jo=this.hasField(null===(d=Eo.home)||void 0===d?void 0:d.secondary_info),Ho=Co&&("string"==typeof Eo.grid.entity||Eo.grid.entity.production);let Uo=0,Io=0,Fo=null===(u=null===(c=this._config.entities.grid)||void 0===c?void 0:c.color)||void 0===u?void 0:u.consumption;void 0!==Fo&&("object"==typeof Fo&&(Fo=Ao(Fo)),this.style.setProperty("--energy-grid-consumption-color",Fo||"var(--energy-grid-consumption-color)")),Co&&(Uo="string"==typeof Eo.grid.entity?this.entityInverted("grid")?Math.abs(Math.min(this.getEntityStateWatts(null===(v=Eo.grid)||void 0===v?void 0:v.entity),0)):Math.max(this.getEntityStateWatts(null===(h=Eo.grid)||void 0===h?void 0:h.entity),0):this.getEntityStateWatts(Eo.grid.entity.consumption)),void 0!==(null===(p=this._config.entities.grid)||void 0===p?void 0:p.display_zero_tolerance)&&(Uo=Uo>(null===(y=this._config.entities.grid)||void 0===y?void 0:y.display_zero_tolerance)?Uo:0);const Lo=this.hasField(null===(m=Eo.grid)||void 0===m?void 0:m.secondary_info);let Wo=null;if(Lo){const e=this.hass.states[null!==(g=null===(_=null===(f=this._config.entities.grid)||void 0===f?void 0:f.secondary_info)||void 0===_?void 0:_.entity)&&void 0!==g?g:0],t=Number(e.state);Wo=this.entityInverted("gridSecondary")?Math.abs(Math.min(t,0)):Math.max(t,0)}let Vo=null===($=null===(b=this._config.entities.grid)||void 0===b?void 0:b.color)||void 0===$?void 0:$.production;void 0!==Vo&&("object"==typeof Vo&&(Vo=Ao(Vo)),this.style.setProperty("--energy-grid-return-color",Vo||"#a280db")),Ho&&(Io="string"==typeof Eo.grid.entity?this.entityInverted("grid")?Math.max(this.getEntityStateWatts(Eo.grid.entity),0):Math.abs(Math.min(this.getEntityStateWatts(Eo.grid.entity),0)):this.getEntityStateWatts(null===(w=Eo.grid)||void 0===w?void 0:w.entity.production)),void 0!==(null===(x=this._config.entities.grid)||void 0===x?void 0:x.display_zero_tolerance)&&(Io=Io>(null===(k=this._config.entities.grid)||void 0===k?void 0:k.display_zero_tolerance)?Io:0);const Bo=null===(S=this._config.entities.grid)||void 0===S?void 0:S.color_icon;this.style.setProperty("--icon-grid-color","consumption"===Bo?"var(--energy-grid-consumption-color)":"production"===Bo?"var(--energy-grid-return-color)":!0===Bo?Uo>=Io?"var(--energy-grid-consumption-color)":"var(--energy-grid-return-color)":"var(--primary-text-color)");const Zo=null===(A=null===(E=this._config.entities.grid)||void 0===E?void 0:E.secondary_info)||void 0===A?void 0:A.color_value;this.style.setProperty("--secondary-text-grid-color","consumption"===Zo?"var(--energy-grid-consumption-color)":"production"===Zo?"var(--energy-grid-return-color)":!0===Zo?Uo>=Io?"var(--energy-grid-consumption-color)":"var(--energy-grid-return-color)":"var(--primary-text-color)");const Go=null===(C=this._config.entities.grid)||void 0===C?void 0:C.color_circle;this.style.setProperty("--circle-grid-color","consumption"===Go?"var(--energy-grid-consumption-color)":"production"===Go?"var(--energy-grid-return-color)":!0===Go?Uo>=Io?"var(--energy-grid-consumption-color)":"var(--energy-grid-return-color)":"var(--energy-grid-consumption-color)");let Yo=null,qo=null;const Ko=(null===(M=this._config.entities.individual1)||void 0===M?void 0:M.name)||(null===(D=this.getEntityStateObj(null===(P=Eo.individual1)||void 0===P?void 0:P.entity))||void 0===D?void 0:D.attributes.friendly_name)||"Car",Jo=(null===(O=this._config.entities.individual1)||void 0===O?void 0:O.icon)||(null===(R=this.getEntityStateObj(null===(z=Eo.individual1)||void 0===z?void 0:z.entity))||void 0===R?void 0:R.attributes.icon)||"mdi:car-electric";let Qo=null===(T=this._config.entities.individual1)||void 0===T?void 0:T.color;if(void 0!==Qo&&("object"==typeof Qo&&(Qo=Ao(Qo)),this.style.setProperty("--individualone-color",Qo)),this.style.setProperty("--icon-individualone-color",(null===(N=this._config.entities.individual1)||void 0===N?void 0:N.color_icon)?"var(--individualone-color)":"var(--primary-text-color)"),zo){const e=this.hass.states[null===(j=this._config.entities.individual1)||void 0===j?void 0:j.entity],t=Number(e.state);Yo=this.entityInverted("individual1")?Math.abs(Math.min(t,0)):Math.max(t,0)}if(Ro){const e=this.hass.states[null===(U=null===(H=this._config.entities.individual1)||void 0===H?void 0:H.secondary_info)||void 0===U?void 0:U.entity].state;"number"==typeof e?qo=this.entityInverted("individual1Secondary")?Math.abs(Math.min(e,0)):Math.max(e,0):"string"==typeof e&&(qo=e)}let Xo=null,en=null;const tn=(null===(I=this._config.entities.individual2)||void 0===I?void 0:I.name)||(null===(L=this.getEntityStateObj(null===(F=Eo.individual2)||void 0===F?void 0:F.entity))||void 0===L?void 0:L.attributes.friendly_name)||"Motorcycle",on=(null===(B=this._config.entities.individual2)||void 0===B?void 0:B.icon)||(null===(G=this.getEntityStateObj(null===(Z=Eo.individual2)||void 0===Z?void 0:Z.entity))||void 0===G?void 0:G.attributes.icon)||"mdi:motorbike-electric";let nn=null===(Y=this._config.entities.individual2)||void 0===Y?void 0:Y.color;if(void 0!==nn&&("object"==typeof nn&&(nn=Ao(nn)),this.style.setProperty("--individualtwo-color",nn)),this.style.setProperty("--icon-individualtwo-color",(null===(q=this._config.entities.individual2)||void 0===q?void 0:q.color_icon)?"var(--individualtwo-color)":"var(--primary-text-color)"),Do){const e=this.hass.states[null===(K=this._config.entities.individual2)||void 0===K?void 0:K.entity],t=Number(e.state);Xo=this.entityInverted("individual2")?Math.abs(Math.min(t,0)):Math.max(t,0)}if(Oo){const e=this.hass.states[null===(Q=null===(J=this._config.entities.individual2)||void 0===J?void 0:J.secondary_info)||void 0===Q?void 0:Q.entity].state;"number"==typeof e?en=this.entityInverted("individual2Secondary")?Math.abs(Math.min(e,0)):Math.max(e,0):"string"==typeof e&&(en=e)}let ln=null;if(No){const e=this.hass.states[null===(ee=null===(X=this._config.entities.solar)||void 0===X?void 0:X.secondary_info)||void 0===ee?void 0:ee.entity],t=Number(e.state);ln=this.entityInverted("solarSecondary")?Math.abs(Math.min(t,0)):Math.max(t,0)}let rn=null;if(jo){const e=this.hass.states[null===(ie=null===(te=this._config.entities.home)||void 0===te?void 0:te.secondary_info)||void 0===ie?void 0:ie.entity],t=Number(e.state);rn=this.entityInverted("homeSecondary")?Math.abs(Math.min(t,0)):Math.max(t,0)}let an=0;if(void 0!==(null===(oe=this._config.entities.solar)||void 0===oe?void 0:oe.color)){let e=null===(ne=this._config.entities.solar)||void 0===ne?void 0:ne.color;"object"==typeof e&&(e=Ao(e)),this.style.setProperty("--energy-solar-color",e||"#ff9800")}this.style.setProperty("--icon-solar-color",(null===(le=this._config.entities.solar)||void 0===le?void 0:le.color_icon)?"var(--energy-solar-color)":"var(--primary-text-color)"),To&&(an=this.entityInverted("solar")?Math.abs(Math.min(this.getEntityStateWatts(null===(re=Eo.solar)||void 0===re?void 0:re.entity),0)):Math.max(this.getEntityStateWatts(null===(ae=Eo.solar)||void 0===ae?void 0:ae.entity),0),(null===(se=Eo.solar)||void 0===se?void 0:se.display_zero_tolerance)&&Eo.solar.display_zero_tolerance>=an&&(an=0));let sn=0,dn=0;Po&&("string"==typeof(null===(de=Eo.battery)||void 0===de?void 0:de.entity)?(sn=this.entityInverted("battery")?Math.max(this.getEntityStateWatts(Eo.battery.entity),0):Math.abs(Math.min(this.getEntityStateWatts(Eo.battery.entity),0)),dn=this.entityInverted("battery")?Math.abs(Math.min(this.getEntityStateWatts(Eo.battery.entity),0)):Math.max(this.getEntityStateWatts(Eo.battery.entity),0)):(sn=this.getEntityStateWatts(null===(ue=null===(ce=Eo.battery)||void 0===ce?void 0:ce.entity)||void 0===ue?void 0:ue.production),dn=this.getEntityStateWatts(null===(he=null===(ve=Eo.battery)||void 0===ve?void 0:ve.entity)||void 0===he?void 0:he.consumption)),(null===(pe=null==Eo?void 0:Eo.battery)||void 0===pe?void 0:pe.display_zero_tolerance)&&(Eo.battery.display_zero_tolerance>=sn&&(sn=0),Eo.battery.display_zero_tolerance>=dn&&(dn=0)));let cn=null;To&&(cn=an-(null!=Io?Io:0)-(null!=sn?sn:0));let un=null,vn=null;null!==cn&&cn<0&&(Po&&(un=Math.abs(cn),un>Uo&&(vn=Math.min(un-Uo,0),un=Uo)),cn=0);let hn=null;To&&Po?(vn||(vn=Math.max(0,(Io||0)-(an||0)-(sn||0)-(un||0))),hn=sn-(un||0)):!To&&Po&&(vn=Io);let pn=0;To&&Io&&(pn=Io-(null!=vn?vn:0));let yn=0;Po&&(yn=(null!=dn?dn:0)-(null!=vn?vn:0));let mn=null===(me=null===(ye=this._config.entities.battery)||void 0===ye?void 0:ye.color)||void 0===me?void 0:me.consumption;void 0!==mn&&("object"==typeof mn&&(mn=Ao(mn)),this.style.setProperty("--energy-battery-out-color",mn||"#4db6ac"));let fn=null===(_e=null===(fe=this._config.entities.battery)||void 0===fe?void 0:fe.color)||void 0===_e?void 0:_e.production;void 0!==fn&&("object"==typeof fn&&(fn=Ao(fn)),this.style.setProperty("--energy-battery-in-color",fn||"#a280db"));const _n=null===(be=this._config.entities.battery)||void 0===be?void 0:be.color_icon;this.style.setProperty("--icon-battery-color","consumption"===_n?"var(--energy-battery-in-color)":"production"===_n?"var(--energy-battery-out-color)":!0===_n?dn>=sn?"var(--energy-battery-out-color)":"var(--energy-battery-in-color)":"var(--primary-text-color)");const gn=null===($e=this._config.entities.battery)||void 0===$e?void 0:$e.color_state_of_charge_value;this.style.setProperty("--text-battery-state-of-charge-color","consumption"===gn?"var(--energy-battery-in-color)":"production"===gn?"var(--energy-battery-out-color)":!0===gn?dn>=sn?"var(--energy-battery-out-color)":"var(--energy-battery-in-color)":"var(--primary-text-color)");const bn=null===(xe=this._config.entities.battery)||void 0===xe?void 0:xe.color_circle;this.style.setProperty("--circle-battery-color","consumption"===bn?"var(--energy-battery-in-color)":"production"===bn||!0===bn&&dn>=sn?"var(--energy-battery-out-color)":"var(--energy-battery-in-color)");const $n=Math.max(Uo-(null!=un?un:0),0),wn=we(Yo,0)+we(Xo,0),xn=Math.max($n+(null!=cn?cn:0)+(null!=yn?yn:0),0);let kn=0;yn&&(kn=Re*(yn/xn));let Sn=0;To&&(Sn=Re*(cn/xn));const En=this.hasField(null===(ke=Eo.fossil_fuel_percentage)||void 0===ke?void 0:ke.secondary_info,!0);let An=null;if(En){const e=this.hass.states[null===(Ee=null===(Se=this._config.entities.fossil_fuel_percentage)||void 0===Se?void 0:Se.secondary_info)||void 0===Ee?void 0:Ee.entity].state;"number"==typeof e?An=this.entityInverted("nonFossilSecondary")?Math.abs(Math.min(e,0)):Math.max(e,0):"string"==typeof e&&(An=e)}const Cn=1*$n-this.getEntityState(null===(Ae=Eo.fossil_fuel_percentage)||void 0===Ae?void 0:Ae.entity)/100>0&&void 0!==(null===(Ce=Eo.fossil_fuel_percentage)||void 0===Ce?void 0:Ce.entity)&&this.entityAvailable(null===(Me=Eo.fossil_fuel_percentage)||void 0===Me?void 0:Me.entity),Mn=void 0!==(null===(Pe=Eo.fossil_fuel_percentage)||void 0===Pe?void 0:Pe.entity)&&!0===(null===(De=Eo.fossil_fuel_percentage)||void 0===De?void 0:De.display_zero)||Cn;let Pn,Dn=0;if(Cn){Pn=$n*(1-this.getEntityState(null===(Oe=Eo.fossil_fuel_percentage)||void 0===Oe?void 0:Oe.entity)/100),Dn=Re*(Pn/xn)}const On=Re*((xn-(null!=Pn?Pn:0)-(null!=yn?yn:0)-(null!=cn?cn:0))/xn),zn=$n+(null!=cn?cn:0)+pn+(null!=hn?hn:0)+(null!=yn?yn:0)+(null!=un?un:0)+(null!=vn?vn:0),Rn=(null===(Te=null===(ze=Eo.battery)||void 0===ze?void 0:ze.state_of_charge)||void 0===Te?void 0:Te.length)?this.getEntityState(null===(Ne=Eo.battery)||void 0===Ne?void 0:Ne.state_of_charge):null;let Tn="mdi:battery-high";null===Rn?Tn="mdi:battery":Rn<=72&&Rn>44?Tn="mdi:battery-medium":Rn<=44&&Rn>16?Tn="mdi:battery-low":Rn<=16&&(Tn="mdi:battery-outline"),void 0!==(null===(je=Eo.battery)||void 0===je?void 0:je.icon)&&(Tn=null===(He=Eo.battery)||void 0===He?void 0:He.icon);const Nn={batteryGrid:this.circleRate(null!==(Ue=null!=un?un:vn)&&void 0!==Ue?Ue:0,zn),batteryToHome:this.circleRate(null!=yn?yn:0,zn),gridToHome:this.circleRate($n,zn),solarToBattery:this.circleRate(null!=hn?hn:0,zn),solarToGrid:this.circleRate(pn,zn),solarToHome:this.circleRate(null!=cn?cn:0,zn),individual1:this.circleRate(null!=Yo?Yo:0,wn),individual2:this.circleRate(null!=Xo?Xo:0,wn),nonFossil:this.circleRate(null!=Pn?Pn:0,zn)};["batteryGrid","batteryToHome","gridToHome","solarToBattery","solarToGrid","solarToHome"].forEach((e=>{const t=this[`${e}Flow`];t&&this.previousDur[e]&&this.previousDur[e]!==Nn[e]&&(t.pauseAnimations(),t.setCurrentTime(t.getCurrentTime()*(Nn[e]/this.previousDur[e])),t.unpauseAnimations()),this.previousDur[e]=Nn[e]}));let jn=null===(Ie=this._config.entities.fossil_fuel_percentage)||void 0===Ie?void 0:Ie.color;void 0!==jn&&("object"==typeof jn&&(jn=Ao(jn)),this.style.setProperty("--non-fossil-color",jn||"var(--energy-non-fossil-color)")),this.style.setProperty("--icon-non-fossil-color",(null===(Fe=this._config.entities.fossil_fuel_percentage)||void 0===Fe?void 0:Fe.color_icon)?"var(--non-fossil-color)":"var(--primary-text-color)");const Hn=null===(Le=this._config.entities.home)||void 0===Le?void 0:Le.color_icon,Un={battery:{value:kn,color:"var(--energy-battery-out-color)"},solar:{value:Sn,color:"var(--energy-solar-color)"},grid:{value:On,color:"var(--energy-grid-consumption-color)"},gridNonFossil:{value:Dn,color:"var(--energy-non-fossil-color)"}},In=Object.keys(Un).reduce(((e,t)=>Un[e].value>Un[t].value?e:t));let Fn="var(--primary-text-color)";"solar"===Hn?Fn="var(--energy-solar-color)":"battery"===Hn?Fn="var(--energy-battery-out-color)":"grid"===Hn?Fn="var(--energy-grid-consumption-color)":!0===Hn&&(Fn=Un[In].color),this.style.setProperty("--icon-home-color",Fn);const Ln=null===(We=this._config.entities.home)||void 0===We?void 0:We.color_value;let Wn="var(--primary-text-color)";"solar"===Ln?Wn="var(--energy-solar-color)":"battery"===Ln?Wn="var(--energy-battery-out-color)":"grid"===Ln?Wn="var(--energy-grid-consumption-color)":!0===Ln&&(Wn=Un[In].color),this.style.setProperty("--text-home-color",Wn),this.style.setProperty("--text-solar-color",(null===(Ve=this._config.entities.solar)||void 0===Ve?void 0:Ve.color_value)?"var(--energy-solar-color)":"var(--primary-text-color)"),this.style.setProperty("--text-non-fossil-color",(null===(Be=this._config.entities.fossil_fuel_percentage)||void 0===Be?void 0:Be.color_value)?"var(--energy-non-fossil-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-non-fossil-color",(null===(Ge=null===(Ze=this._config.entities.fossil_fuel_percentage)||void 0===Ze?void 0:Ze.secondary_info)||void 0===Ge?void 0:Ge.color_value)?"var(--energy-non-fossil-color)":"var(--primary-text-color)"),this.style.setProperty("--text-individualone-color",(null===(Ye=this._config.entities.individual1)||void 0===Ye?void 0:Ye.color_value)?"var(--individualone-color)":"var(--primary-text-color)"),this.style.setProperty("--text-individualtwo-color",(null===(qe=this._config.entities.individual2)||void 0===qe?void 0:qe.color_value)?"var(--individualtwo-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-individualone-color",(null===(Je=null===(Ke=this._config.entities.individual1)||void 0===Ke?void 0:Ke.secondary_info)||void 0===Je?void 0:Je.color_value)?"var(--individualone-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-individualtwo-color",(null===(Xe=null===(Qe=this._config.entities.individual2)||void 0===Qe?void 0:Qe.secondary_info)||void 0===Xe?void 0:Xe.color_value)?"var(--individualtwo-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-solar-color",(null===(tt=null===(et=this._config.entities.solar)||void 0===et?void 0:et.secondary_info)||void 0===tt?void 0:tt.color_value)?"var(--energy-solar-color)":"var(--primary-text-color)"),this.style.setProperty("--secondary-text-home-color",(null===(ot=null===(it=this._config.entities.home)||void 0===it?void 0:it.secondary_info)||void 0===ot?void 0:ot.color_value)?"var(--text-home-color)":"var(--primary-text-color)");const Vn=null===(nt=this._templateResults.gridSecondary)||void 0===nt?void 0:nt.result,Bn=null===(lt=this._templateResults.solarSecondary)||void 0===lt?void 0:lt.result,Zn=null===(rt=this._templateResults.homeSecondary)||void 0===rt?void 0:rt.result,Gn=null===(at=this._templateResults.individual1Secondary)||void 0===at?void 0:at.result,Yn=null===(st=this._templateResults.individual2Secondary)||void 0===st?void 0:st.result,qn=null===(dt=this._templateResults.nonFossilFuelSecondary)||void 0===dt?void 0:dt.result;return W`
      <ha-card .header=${this._config.title}>
        <div class="card-content">
          ${To||Do||zo||Mn?W`<div class="row">
                ${Mn?W`<div class="circle-container low-carbon">
                      <span class="label"
                        >${(null===(ct=Eo.fossil_fuel_percentage)||void 0===ct?void 0:ct.name)?null===(ut=Eo.fossil_fuel_percentage)||void 0===ut?void 0:ut.name:this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.low_carbon")}</span
                      >
                      <div
                        class="circle"
                        @click=${e=>{var t;e.stopPropagation(),this.openDetails(null===(t=Eo.fossil_fuel_percentage)||void 0===t?void 0:t.entity)}}
                        @keyDown=${e=>{var t;"Enter"===e.key&&(e.stopPropagation(),this.openDetails(null===(t=Eo.fossil_fuel_percentage)||void 0===t?void 0:t.entity))}}
                      >
                        ${En?W`
                              <span class="secondary-info low-carbon">
                                ${(null===(ht=null===(vt=Eo.fossil_fuel_percentage)||void 0===vt?void 0:vt.secondary_info)||void 0===ht?void 0:ht.icon)?W`<ha-icon
                                      class="secondary-info small"
                                      .icon=${null===(yt=null===(pt=Eo.fossil_fuel_percentage)||void 0===pt?void 0:pt.secondary_info)||void 0===yt?void 0:yt.icon}
                                    ></ha-icon>`:""}
                                ${this.displayValue(An,null===(ft=null===(mt=Eo.fossil_fuel_percentage)||void 0===mt?void 0:mt.secondary_info)||void 0===ft?void 0:ft.unit_of_measurement,null===(gt=null===(_t=Eo.fossil_fuel_percentage)||void 0===_t?void 0:_t.secondary_info)||void 0===gt?void 0:gt.unit_white_space)}
                              </span>
                            `:(null===($t=null===(bt=Eo.fossil_fuel_percentage)||void 0===bt?void 0:bt.secondary_info)||void 0===$t?void 0:$t.template)?W`<span class="secondary-info low-carbon"> ${qn} </span>`:""}
                        <ha-icon
                          .icon=${(null===(wt=Eo.fossil_fuel_percentage)||void 0===wt?void 0:wt.icon)?null===(xt=Eo.fossil_fuel_percentage)||void 0===xt?void 0:xt.icon:"mdi:leaf"}
                          class="low-carbon"
                          style="${En?"padding-top: 2px;":"padding-top: 0px;"}
                          ${!1!==(null===(kt=Eo.fossil_fuel_percentage)||void 0===kt?void 0:kt.display_zero_state)||(Pn||0)>((null===(St=Eo.fossil_fuel_percentage)||void 0===St?void 0:St.display_zero_tolerance)||0)?"padding-bottom: 2px;":"padding-bottom: 0px;"}"
                        ></ha-icon>
                        ${!1!==(null===(Et=Eo.fossil_fuel_percentage)||void 0===Et?void 0:Et.display_zero_state)||(Pn||0)>((null===(At=Eo.fossil_fuel_percentage)||void 0===At?void 0:At.display_zero_tolerance)||0)?W`
                              <span class="low-carbon">${this.displayNonFossilState(Eo.fossil_fuel_percentage.entity,Uo)}</span>
                            `:""}
                      </div>
                      ${this.showLine(Pn||0)?W`
                            <svg width="80" height="30">
                              <path d="M40 -10 v40" class="low-carbon" id="low-carbon" />
                              ${Cn?V`<circle
                              r="2.4"
                              class="low-carbon"
                              vector-effect="non-scaling-stroke"
                            >
                                <animateMotion
                                  dur="${this.additionalCircleRate(null===(Ct=Eo.fossil_fuel_percentage)||void 0===Ct?void 0:Ct.calculate_flow_rate,Nn.nonFossil)}s"
                                  repeatCount="indefinite"
                                  calcMode="linear"
                                >
                                  <mpath xlink:href="#low-carbon" />
                                </animateMotion>
                            </circle>`:""}
                            </svg>
                          `:""}
                    </div>`:W`<div class="spacer"></div>`}
                ${To?W`<div class="circle-container solar">
                      <span class="label"
                        >${Eo.solar.name||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.solar")}</span
                      >
                      <div
                        class="circle"
                        @click=${e=>{e.stopPropagation(),this.openDetails(Eo.solar.entity)}}
                        @keyDown=${e=>{"Enter"===e.key&&(e.stopPropagation(),this.openDetails(Eo.solar.entity))}}
                      >
                        ${No?W`
                              <span class="secondary-info solar">
                                ${(null===(Pt=null===(Mt=Eo.solar)||void 0===Mt?void 0:Mt.secondary_info)||void 0===Pt?void 0:Pt.icon)?W`<ha-icon class="secondary-info small" .icon=${null===(Ot=null===(Dt=Eo.solar)||void 0===Dt?void 0:Dt.secondary_info)||void 0===Ot?void 0:Ot.icon}></ha-icon>`:""}
                                ${this.displayValue(ln,null===(Rt=null===(zt=Eo.solar)||void 0===zt?void 0:zt.secondary_info)||void 0===Rt?void 0:Rt.unit_of_measurement,null===(Nt=null===(Tt=Eo.solar)||void 0===Tt?void 0:Tt.secondary_info)||void 0===Nt?void 0:Nt.unit_white_space)}
                              </span>
                            `:(null===(Ht=null===(jt=Eo.solar)||void 0===jt?void 0:jt.secondary_info)||void 0===Ht?void 0:Ht.template)?W`<span class="secondary-info solar"> ${Bn} </span>`:""}

                        <ha-icon
                          id="solar-icon"
                          .icon=${Eo.solar.icon||"mdi:solar-power"}
                          style="${No?"padding-top: 2px;":"padding-top: 0px;"}
                          ${!1!==(null===(Ut=Eo.solar)||void 0===Ut?void 0:Ut.display_zero_state)||(an||0)>0?"padding-bottom: 2px;":"padding-bottom: 0px;"}"
                        ></ha-icon>
                        ${!1!==(null===(It=Eo.solar)||void 0===It?void 0:It.display_zero_state)||(an||0)>0?W` <span class="solar"> ${this.displayValue(an)}</span>`:""}
                      </div>
                    </div>`:Do||zo?W`<div class="spacer"></div>`:""}
                ${Do?W`<div class="circle-container individual2">
                      <span class="label">${tn}</span>
                      <div
                        class="circle"
                        @click=${e=>{var t;e.stopPropagation(),this.openDetails(null===(t=Eo.individual2)||void 0===t?void 0:t.entity)}}
                        @keyDown=${e=>{var t;"Enter"===e.key&&(e.stopPropagation(),this.openDetails(null===(t=Eo.individual2)||void 0===t?void 0:t.entity))}}
                      >
                        ${Oo?W`
                              <span class="secondary-info individual2">
                                ${(null===(Lt=null===(Ft=Eo.individual2)||void 0===Ft?void 0:Ft.secondary_info)||void 0===Lt?void 0:Lt.icon)?W`<ha-icon class="secondary-info small" .icon=${null===(Vt=null===(Wt=Eo.individual2)||void 0===Wt?void 0:Wt.secondary_info)||void 0===Vt?void 0:Vt.icon}></ha-icon>`:""}
                                ${this.displayValue(en,null===(Zt=null===(Bt=Eo.individual2)||void 0===Bt?void 0:Bt.secondary_info)||void 0===Zt?void 0:Zt.unit_of_measurement,null===(Yt=null===(Gt=Eo.individual2)||void 0===Gt?void 0:Gt.secondary_info)||void 0===Yt?void 0:Yt.unit_white_space)}
                              </span>
                            `:(null===(Kt=null===(qt=Eo.individual2)||void 0===qt?void 0:qt.secondary_info)||void 0===Kt?void 0:Kt.template)?W`<span class="secondary-info individual2"> ${Yn} </span>`:""}
                        <ha-icon
                          id="individual2-icon"
                          .icon=${on}
                          style="${Oo?"padding-top: 2px;":"padding-top: 0px;"}
                          ${!1!==(null===(Jt=Eo.individual2)||void 0===Jt?void 0:Jt.display_zero_state)||(Xo||0)>0?"padding-bottom: 2px;":"padding-bottom: 0px;"}"
                        ></ha-icon>
                        ${!1!==(null===(Qt=Eo.individual2)||void 0===Qt?void 0:Qt.display_zero_state)||(Xo||0)>0?W` <span class="individual2"
                              >${this.displayValue(Xo,null===(Xt=this._config.entities.individual2)||void 0===Xt?void 0:Xt.unit_of_measurement)}
                            </span>`:""}
                      </div>
                      ${this.showLine(Xo||0)?W`
                            <svg width="80" height="30">
                              <path d="M40 -10 v50" id="individual2" />
                              ${Xo?V`<circle
                              r="2.4"
                              class="individual2"
                              vector-effect="non-scaling-stroke"
                            >
                              <animateMotion
                                dur="${this.additionalCircleRate(null===(ei=Eo.individual2)||void 0===ei?void 0:ei.calculate_flow_rate,Nn.individual2)}s"    
                                repeatCount="indefinite"
                                calcMode="linear"
                                keyPoints=${(null===(ti=Eo.individual2)||void 0===ti?void 0:ti.inverted_animation)?"0;1":"1;0"}
                                keyTimes="0;1"
                              >
                                <mpath xlink:href="#individual2" />
                              </animateMotion>
                            </circle>`:""}
                            </svg>
                          `:""}
                    </div>`:zo?W`<div class="circle-container individual1">
                      <span class="label">${Ko}</span>
                      <div
                        class="circle"
                        @click=${e=>{var t;e.stopPropagation(),this.openDetails(null===(t=Eo.individual1)||void 0===t?void 0:t.entity)}}
                        @keyDown=${e=>{var t;"Enter"===e.key&&(e.stopPropagation(),this.openDetails(null===(t=Eo.individual1)||void 0===t?void 0:t.entity))}}
                      >
                        ${Ro?W`
                              <span class="secondary-info individual1">
                                ${(null===(oi=null===(ii=Eo.individual1)||void 0===ii?void 0:ii.secondary_info)||void 0===oi?void 0:oi.icon)?W`<ha-icon class="secondary-info small" .icon=${null===(li=null===(ni=Eo.individual1)||void 0===ni?void 0:ni.secondary_info)||void 0===li?void 0:li.icon}></ha-icon>`:""}
                                ${this.displayValue(qo,null===(ai=null===(ri=Eo.individual1)||void 0===ri?void 0:ri.secondary_info)||void 0===ai?void 0:ai.unit_of_measurement,null===(di=null===(si=Eo.individual1)||void 0===si?void 0:si.secondary_info)||void 0===di?void 0:di.unit_white_space)}
                              </span>
                            `:(null===(ui=null===(ci=Eo.individual1)||void 0===ci?void 0:ci.secondary_info)||void 0===ui?void 0:ui.template)?W`<span class="secondary-info individual1"> ${Gn} </span>`:""}
                        <ha-icon
                          id="individual1-icon"
                          .icon=${Jo}
                          style="${Ro?"padding-top: 2px;":"padding-top: 0px;"}
                          ${!1!==(null===(vi=Eo.individual1)||void 0===vi?void 0:vi.display_zero_state)||(Yo||0)>0?"padding-bottom: 2px;":"padding-bottom: 0px;"}"
                        ></ha-icon>
                        ${!1!==(null===(hi=Eo.individual1)||void 0===hi?void 0:hi.display_zero_state)||(Yo||0)>0?W` <span class="individual1"
                              >${this.displayValue(Yo,null===(pi=this._config.entities.individual1)||void 0===pi?void 0:pi.unit_of_measurement)}
                            </span>`:""}
                      </div>
                      ${this.showLine(Yo||0)?W`
                            <svg width="80" height="30">
                              <path d="M40 -10 v40" id="individual1" />
                              ${Yo?V`<circle
                                r="2.4"
                                class="individual1"
                                vector-effect="non-scaling-stroke"
                              >
                                <animateMotion
                                  dur="${this.additionalCircleRate(null===(yi=Eo.individual1)||void 0===yi?void 0:yi.calculate_flow_rate,Nn.individual1)}s"
                                  repeatCount="indefinite"
                                  calcMode="linear"
                                  keyPoints=${(null===(mi=Eo.individual1)||void 0===mi?void 0:mi.inverted_animation)?"0;1":"1;0"}
                                  keyTimes="0;1"

                                >
                                  <mpath xlink:href="#individual1" />
                                </animateMotion>
                              </circle>`:""}
                            </svg>
                          `:W``}
                    </div> `:W`<div class="spacer"></div>`}
              </div>`:W``}
          <div class="row">
            ${Co?W` <div class="circle-container grid">
                  <div
                    class="circle"
                    @click=${e=>{const t="string"==typeof Eo.grid.entity?Eo.grid.entity:Eo.grid.entity.consumption||Eo.grid.entity.production;e.stopPropagation(),this.openDetails(t)}}
                    @keyDown=${e=>{if("Enter"===e.key){const t="string"==typeof Eo.grid.entity?Eo.grid.entity:Eo.grid.entity.consumption||Eo.grid.entity.production;e.stopPropagation(),this.openDetails(t)}}}
                  >
                    ${Lo?W`
                          <span class="secondary-info grid">
                            ${(null===(_i=null===(fi=Eo.grid)||void 0===fi?void 0:fi.secondary_info)||void 0===_i?void 0:_i.icon)?W`<ha-icon class="secondary-info small" .icon=${null===(bi=null===(gi=Eo.grid)||void 0===gi?void 0:gi.secondary_info)||void 0===bi?void 0:bi.icon}></ha-icon>`:""}
                            ${this.displayValue(Wo,null===(wi=null===($i=Eo.grid)||void 0===$i?void 0:$i.secondary_info)||void 0===wi?void 0:wi.unit_of_measurement,null===(ki=null===(xi=Eo.grid)||void 0===xi?void 0:xi.secondary_info)||void 0===ki?void 0:ki.unit_white_space)}
                          </span>
                        `:(null===(Ei=null===(Si=Eo.grid)||void 0===Si?void 0:Si.secondary_info)||void 0===Ei?void 0:Ei.template)?W`<span class="secondary-info grid"> ${Vn} </span>`:""}
                    <ha-icon
                      .icon=${Mo?(null===(Ai=Eo.grid)||void 0===Ai?void 0:Ai.power_outage.icon_alert)||"mdi:transmission-tower-off":(null===(Ci=Eo.grid)||void 0===Ci?void 0:Ci.icon)||"mdi:transmission-tower"}
                    ></ha-icon>
                    ${("two_way"===(null===(Mi=Eo.grid)||void 0===Mi?void 0:Mi.display_state)||void 0===(null===(Pi=Eo.grid)||void 0===Pi?void 0:Pi.display_state)||"one_way"===(null===(Di=Eo.grid)||void 0===Di?void 0:Di.display_state)&&Io>0||"one_way_no_zero"===(null===(Oi=Eo.grid)||void 0===Oi?void 0:Oi.display_state)&&(null===Uo||0===Uo)&&0!==Io)&&null!==Io&&!Mo?W`<span
                          class="return"
                          @click=${e=>{const t="string"==typeof Eo.grid.entity?Eo.grid.entity:Eo.grid.entity.production;e.stopPropagation(),this.openDetails(t)}}
                          @keyDown=${e=>{if("Enter"===e.key){const t="string"==typeof Eo.grid.entity?Eo.grid.entity:Eo.grid.entity.production;e.stopPropagation(),this.openDetails(t)}}}
                        >
                          <ha-icon class="small" .icon=${"mdi:arrow-left"}></ha-icon>
                          ${this.displayValue(Io)}
                        </span>`:null}
                    ${("two_way"===(null===(zi=Eo.grid)||void 0===zi?void 0:zi.display_state)||void 0===(null===(Ri=Eo.grid)||void 0===Ri?void 0:Ri.display_state)||"one_way"===(null===(Ti=Eo.grid)||void 0===Ti?void 0:Ti.display_state)&&Uo>0||"one_way_no_zero"===(null===(Ni=Eo.grid)||void 0===Ni?void 0:Ni.display_state)&&(null===Io||0===Io))&&null!==Uo&&!Mo?W` <span class="consumption">
                          <ha-icon class="small" .icon=${"mdi:arrow-right"}></ha-icon>${this.displayValue(Uo)}
                        </span>`:""}
                    ${Mo?W`<span class="grid power-outage"> ${(null===(ji=Eo.grid)||void 0===ji?void 0:ji.power_outage.label_alert)||W`Power<br />Outage`} </span>`:""}
                  </div>
                  <span class="label">${Eo.grid.name||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.grid")}</span>
                </div>`:W`<div class="spacer"></div>`}
            <div class="circle-container home">
              <div
                class="circle"
                id="home-circle"
                @click=${e=>{var t;e.stopPropagation(),this.openDetails(null===(t=Eo.home)||void 0===t?void 0:t.entity)}}
                @keyDown=${e=>{var t;"Enter"===e.key&&(e.stopPropagation(),this.openDetails(null===(t=Eo.home)||void 0===t?void 0:t.entity))}}
              >
                ${jo?W`
                      <span class="secondary-info home">
                        ${(null===(Ui=null===(Hi=Eo.home)||void 0===Hi?void 0:Hi.secondary_info)||void 0===Ui?void 0:Ui.icon)?W`<ha-icon class="secondary-info small" .icon=${null===(Fi=null===(Ii=Eo.home)||void 0===Ii?void 0:Ii.secondary_info)||void 0===Fi?void 0:Fi.icon}></ha-icon>`:""}
                        ${this.displayValue(rn,null===(Wi=null===(Li=Eo.home)||void 0===Li?void 0:Li.secondary_info)||void 0===Wi?void 0:Wi.unit_of_measurement,null===(Bi=null===(Vi=Eo.home)||void 0===Vi?void 0:Vi.secondary_info)||void 0===Bi?void 0:Bi.unit_white_space)}
                      </span>
                    `:(null===(Gi=null===(Zi=Eo.home)||void 0===Zi?void 0:Zi.secondary_info)||void 0===Gi?void 0:Gi.template)?W`<span class="secondary-info home"> ${Zn} </span>`:""}
                <ha-icon .icon=${(null===(Yi=Eo.home)||void 0===Yi?void 0:Yi.icon)||"mdi:home"}></ha-icon>
                ${(null===(qi=this._config.entities.home)||void 0===qi?void 0:qi.override_state)&&this._config.entities.home.entity?this.displayValue(this.hass.states[this._config.entities.home.entity].state):(null===(Ki=this._config.entities.home)||void 0===Ki?void 0:Ki.subtract_individual)?this.displayValue(xn-wn||0):this.displayValue(xn)}
                <svg>
                  ${void 0!==Sn?V`<circle
                            class="solar"
                            cx="40"
                            cy="40"
                            r="38"
                            stroke-dasharray="${Sn} ${Re-Sn}"
                            shape-rendering="geometricPrecision"
                            stroke-dashoffset="-${Re-Sn}"
                          />`:""}
                  ${kn?V`<circle
                            class="battery"
                            cx="40"
                            cy="40"
                            r="38"
                            stroke-dasharray="${kn} ${Re-kn}"
                            stroke-dashoffset="-${Re-kn-(Sn||0)}"
                            shape-rendering="geometricPrecision"
                          />`:""}
                  ${void 0!==Dn?V`<circle
                            class="low-carbon"
                            cx="40"
                            cy="40"
                            r="38"
                            stroke-dasharray="${Dn} ${Re-Dn}"
                            stroke-dashoffset="-${Re-Dn-(kn||0)-(Sn||0)}"
                            shape-rendering="geometricPrecision"
                          />`:""}
                  <circle
                    class="grid"
                    cx="40"
                    cy="40"
                    r="38"
                    stroke-dasharray="${null!=On?On:Re-Sn-(kn||0)} ${void 0!==On?Re-On:Sn+(kn||0)}"
                    stroke-dashoffset="0"
                    shape-rendering="geometricPrecision"
                  />
                </svg>
              </div>
              ${this.showLine(Yo||0)&&Do?"":W` <span class="label"
                    >${(null===(Ji=Eo.home)||void 0===Ji?void 0:Ji.name)||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.home")}</span
                  >`}
            </div>
          </div>
          ${Po||zo&&Do?W`<div class="row">
                <div class="spacer"></div>
                ${Po?W` <div class="circle-container battery">
                      <div
                        class="circle"
                        @click=${e=>{var t,i,o,n,l;const r=(null===(t=Eo.battery)||void 0===t?void 0:t.state_of_charge)?null===(i=Eo.battery)||void 0===i?void 0:i.state_of_charge:"string"==typeof(null===(o=Eo.battery)||void 0===o?void 0:o.entity)?null===(n=Eo.battery)||void 0===n?void 0:n.entity:null===(l=Eo.battery)||void 0===l?void 0:l.entity.production;e.stopPropagation(),this.openDetails(r)}}
                        @keyDown=${e=>{var t,i;if("Enter"===e.key){const o=(null===(t=Eo.battery)||void 0===t?void 0:t.state_of_charge)?null===(i=Eo.battery)||void 0===i?void 0:i.state_of_charge:"string"==typeof Eo.battery.entity?Eo.battery.entity:Eo.battery.entity.production;e.stopPropagation(),this.openDetails(o)}}}
                      >
                        ${null!==Rn?W` <span
                              @click=${e=>{var t;e.stopPropagation(),this.openDetails(null===(t=Eo.battery)||void 0===t?void 0:t.state_of_charge)}}
                              @keyDown=${e=>{var t;"Enter"===e.key&&(e.stopPropagation(),this.openDetails(null===(t=Eo.battery)||void 0===t?void 0:t.state_of_charge))}}
                              id="battery-state-of-charge-text"
                            >
                              ${n(Rn,this.hass.locale,{maximumFractionDigits:0,minimumFractionDigits:0})}${!1===(null===(Xi=null===(Qi=this._config.entities)||void 0===Qi?void 0:Qi.battery)||void 0===Xi?void 0:Xi.state_of_charge_unit_white_space)?"":" "}%
                            </span>`:null}
                        <ha-icon
                          .icon=${Tn}
                          style=${"two_way"===(null===(eo=Eo.battery)||void 0===eo?void 0:eo.display_state)?"padding-top: 0px; padding-bottom: 2px;":"one_way"===(null===(to=Eo.battery)||void 0===to?void 0:to.display_state)&&0===sn&&0===dn?"padding-top: 2px; padding-bottom: 0px;":"padding-top: 2px; padding-bottom: 2px;"}
                          @click=${e=>{var t;e.stopPropagation(),this.openDetails(null===(t=Eo.battery)||void 0===t?void 0:t.state_of_charge)}}
                          @keyDown=${e=>{var t;"Enter"===e.key&&(e.stopPropagation(),this.openDetails(null===(t=Eo.battery)||void 0===t?void 0:t.state_of_charge))}}
                        ></ha-icon>
                        ${"two_way"===(null===(io=Eo.battery)||void 0===io?void 0:io.display_state)||void 0===(null===(oo=Eo.battery)||void 0===oo?void 0:oo.display_state)||"one_way"===(null===(no=Eo.battery)||void 0===no?void 0:no.display_state)&&sn>0||"one_way_no_zero"===(null===(lo=Eo.battery)||void 0===lo?void 0:lo.display_state)&&0!==sn?W`<span
                              class="battery-in"
                              @click=${e=>{const t="string"==typeof Eo.battery.entity?Eo.battery.entity:Eo.battery.entity.production;e.stopPropagation(),this.openDetails(t)}}
                              @keyDown=${e=>{if("Enter"===e.key){const t="string"==typeof Eo.battery.entity?Eo.battery.entity:Eo.battery.entity.production;e.stopPropagation(),this.openDetails(t)}}}
                            >
                              <ha-icon class="small" .icon=${"mdi:arrow-down"}></ha-icon>
                              ${this.displayValue(sn)}</span
                            >`:""}
                        ${"two_way"===(null===(ro=Eo.battery)||void 0===ro?void 0:ro.display_state)||void 0===(null===(ao=Eo.battery)||void 0===ao?void 0:ao.display_state)||"one_way"===(null===(so=Eo.battery)||void 0===so?void 0:so.display_state)&&dn>0||"one_way_no_zero"===(null===(co=Eo.battery)||void 0===co?void 0:co.display_state)&&(0===sn||0!==dn)?W`<span
                              class="battery-out"
                              @click=${e=>{const t="string"==typeof Eo.battery.entity?Eo.battery.entity:Eo.battery.entity.consumption;e.stopPropagation(),this.openDetails(t)}}
                              @keyDown=${e=>{if("Enter"===e.key){const t="string"==typeof Eo.battery.entity?Eo.battery.entity:Eo.battery.entity.consumption;e.stopPropagation(),this.openDetails(t)}}}
                            >
                              <ha-icon class="small" .icon=${"mdi:arrow-up"}></ha-icon>
                              ${this.displayValue(dn)}</span
                            >`:""}
                      </div>
                      <span class="label"
                        >${Eo.battery.name||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.battery")}</span
                      >
                    </div>`:W`<div class="spacer"></div>`}
                ${Do&&zo?W`<div class="circle-container individual1 bottom">
                      ${this.showLine(Yo||0)?W`
                            <svg width="80" height="30">
                              <path d="M40 40 v-40" id="individual1" />
                              ${Yo?V`<circle
                                r="2.4"
                                class="individual1"
                                vector-effect="non-scaling-stroke"
                              >
                                <animateMotion
                                  dur="${this.additionalCircleRate(null===(uo=Eo.individual1)||void 0===uo?void 0:uo.calculate_flow_rate,Nn.individual1)}s"
                                  repeatCount="indefinite"
                                  calcMode="linear"
                                  keyPoints=${(null===(vo=Eo.individual1)||void 0===vo?void 0:vo.inverted_animation)?"0;1":"1;0"}
                                  keyTimes="0;1"
                                >
                                  <mpath xlink:href="#individual1" />
                                </animateMotion>
                              </circle>`:""}
                            </svg>
                          `:W` <svg width="80" height="30"></svg> `}
                      <div
                        class="circle"
                        @click=${e=>{var t;e.stopPropagation(),this.openDetails(null===(t=Eo.individual1)||void 0===t?void 0:t.entity)}}
                        @keyDown=${e=>{var t;"Enter"===e.key&&(e.stopPropagation(),this.openDetails(null===(t=Eo.individual1)||void 0===t?void 0:t.entity))}}
                      >
                        ${Ro?W`
                              <span class="secondary-info individual1">
                                ${(null===(po=null===(ho=Eo.individual1)||void 0===ho?void 0:ho.secondary_info)||void 0===po?void 0:po.icon)?W`<ha-icon class="secondary-info small" .icon=${null===(mo=null===(yo=Eo.individual1)||void 0===yo?void 0:yo.secondary_info)||void 0===mo?void 0:mo.icon}></ha-icon>`:""}
                                ${this.displayValue(qo,null===(_o=null===(fo=Eo.individual1)||void 0===fo?void 0:fo.secondary_info)||void 0===_o?void 0:_o.unit_of_measurement,null===(bo=null===(go=Eo.individual1)||void 0===go?void 0:go.secondary_info)||void 0===bo?void 0:bo.unit_white_space)}
                              </span>
                            `:(null===(wo=null===($o=Eo.individual1)||void 0===$o?void 0:$o.secondary_info)||void 0===wo?void 0:wo.template)?W`<span class="secondary-info individual1"> ${Gn} </span>`:""}
                        <ha-icon
                          id="individual1-icon"
                          .icon=${Jo}
                          style="${Ro?"padding-top: 2px;":"padding-top: 0px;"}
                          ${!1!==(null===(xo=Eo.individual1)||void 0===xo?void 0:xo.display_zero_state)||(Yo||0)>0?"padding-bottom: 2px;":"padding-bottom: 0px;"}"
                        ></ha-icon>
                        ${!1!==(null===(ko=Eo.individual1)||void 0===ko?void 0:ko.display_zero_state)||(Yo||0)>0?W` <span class="individual1"
                              >${this.displayValue(Yo,null===(So=this._config.entities.individual1)||void 0===So?void 0:So.unit_of_measurement)}
                            </span>`:""}
                      </div>
                      <span class="label">${Ko}</span>
                    </div>`:W`<div class="spacer"></div>`}
              </div>`:W`<div class="spacer"></div>`}
          ${To&&this.showLine(cn||0)?W`<div
                class="lines ${ge({high:Po,"individual1-individual2":!Po&&Do&&zo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="solar-home-flow">
                  <path
                    id="solar"
                    class="solar"
                    d="M${Po?55:53},0 v${Co?15:17} c0,${Po?"30 10,30 30,30":"35 10,35 30,35"} h25"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${cn?V`<circle
                            r="1"
                            class="solar"
                            vector-effect="non-scaling-stroke"
                          >
                            <animateMotion
                              dur="${Nn.solarToHome}s"
                              repeatCount="indefinite"
                              calcMode="linear"
                            >
                              <mpath xlink:href="#solar" />
                            </animateMotion>
                          </circle>`:""}
                </svg>
              </div>`:""}
          ${Ho&&To&&this.showLine(pn)?W`<div
                class="lines ${ge({high:Po,"individual1-individual2":!Po&&Do&&zo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="solar-grid-flow">
                  <path
                    id="return"
                    class="return"
                    d="M${Po?45:47},0 v15 c0,${Po?"30 -10,30 -30,30":"35 -10,35 -30,35"} h-20"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${pn&&To?V`<circle
                        r="1"
                        class="return"
                        vector-effect="non-scaling-stroke"
                      >
                        <animateMotion
                          dur="${Nn.solarToGrid}s"
                          repeatCount="indefinite"
                          calcMode="linear"
                        >
                          <mpath xlink:href="#return" />
                        </animateMotion>
                      </circle>`:""}
                </svg>
              </div>`:""}
          ${Po&&To&&this.showLine(hn||0)?W`<div
                class="lines ${ge({high:Po,"individual1-individual2":!Po&&Do&&zo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="solar-battery-flow">
                  <path id="battery-solar" class="battery-solar" d="M50,0 V100" vector-effect="non-scaling-stroke"></path>
                  ${hn?V`<circle
                            r="1"
                            class="battery-solar"
                            vector-effect="non-scaling-stroke"
                          >
                            <animateMotion
                              dur="${Nn.solarToBattery}s"
                              repeatCount="indefinite"
                              calcMode="linear"
                            >
                              <mpath xlink:href="#battery-solar" />
                            </animateMotion>
                          </circle>`:""}
                </svg>
              </div>`:""}
          ${Co&&this.showLine($n)?W`<div
                class="lines ${ge({high:Po,"individual1-individual2":!Po&&Do&&zo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="grid-home-flow">
                  <path
                    class="grid"
                    id="grid"
                    d="M0,${Po?50:To?56:53} H100"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${$n?V`<circle
                    r="1"
                    class="grid"
                    vector-effect="non-scaling-stroke"
                  >
                    <animateMotion
                      dur="${Nn.gridToHome}s"
                      repeatCount="indefinite"
                      calcMode="linear"
                    >
                      <mpath xlink:href="#grid" />
                    </animateMotion>
                  </circle>`:""}
                </svg>
              </div>`:null}
          ${Po&&this.showLine(yn)?W`<div
                class="lines ${ge({high:Po,"individual1-individual2":!Po&&Do&&zo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="battery-home-flow">
                  <path
                    id="battery-home"
                    class="battery-home"
                    d="M55,100 v-${Co?15:17} c0,-30 10,-30 30,-30 h20"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${yn?V`<circle
                        r="1"
                        class="battery-home"
                        vector-effect="non-scaling-stroke"
                      >
                        <animateMotion
                          dur="${Nn.batteryToHome}s"
                          repeatCount="indefinite"
                          calcMode="linear"
                        >
                          <mpath xlink:href="#battery-home" />
                        </animateMotion>
                      </circle>`:""}
                </svg>
              </div>`:""}
          ${Co&&Po&&this.showLine(Math.max(un||0,vn||0))?W`<div
                class="lines ${ge({high:Po,"individual1-individual2":!Po&&Do&&zo})}"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="battery-grid-flow">
                  <path
                    id="battery-grid"
                    class=${ge({"battery-from-grid":Boolean(un),"battery-to-grid":Boolean(vn)})}
                    d="M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20"
                    vector-effect="non-scaling-stroke"
                  ></path>
                  ${un?V`<circle
                    r="1"
                    class="battery-from-grid"
                    vector-effect="non-scaling-stroke"
                  >
                    <animateMotion
                      dur="${Nn.batteryGrid}s"
                      repeatCount="indefinite"
                      keyPoints="1;0" keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath xlink:href="#battery-grid" />
                    </animateMotion>
                  </circle>`:""}
                  ${vn?V`<circle
                        r="1"
                        class="battery-to-grid"
                        vector-effect="non-scaling-stroke"
                      >
                        <animateMotion
                          dur="${Nn.batteryGrid}s"
                          repeatCount="indefinite"
                          calcMode="linear"
                        >
                          <mpath xlink:href="#battery-grid" />
                        </animateMotion>
                      </circle>`:""}
                </svg>
              </div>`:""}
        </div>
        ${this._config.dashboard_link?W`
              <div class="card-actions">
                <a href=${this._config.dashboard_link}
                  ><mwc-button>
                    ${this._config.dashboard_link_label||this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.go_to_energy_dashboard")}
                  </mwc-button></a
                >
              </div>
            `:""}
      </ha-card>
    `}updated(e){super.updated(e),this._config&&this.hass&&this._tryConnectAll()}_tryConnectAll(){var e,t,i,o,n,l,r,a,s,d,c,u;const{entities:v}=this._config,h={gridSecondary:null===(t=null===(e=v.grid)||void 0===e?void 0:e.secondary_info)||void 0===t?void 0:t.template,solarSecondary:null===(o=null===(i=v.solar)||void 0===i?void 0:i.secondary_info)||void 0===o?void 0:o.template,homeSecondary:null===(l=null===(n=v.home)||void 0===n?void 0:n.secondary_info)||void 0===l?void 0:l.template,individual1Secondary:null===(a=null===(r=v.individual1)||void 0===r?void 0:r.secondary_info)||void 0===a?void 0:a.template,individual2Secondary:null===(d=null===(s=v.individual2)||void 0===s?void 0:s.secondary_info)||void 0===d?void 0:d.template,nonFossilFuelSecondary:null===(u=null===(c=v.fossil_fuel_percentage)||void 0===c?void 0:c.secondary_info)||void 0===u?void 0:u.template};for(const[e,t]of Object.entries(h))t&&this._tryConnect(t,e)}async _tryConnect(e,t){var i,o,n,l,r,a;if(this.hass&&this._config&&void 0===(null===(i=this._unsubRenderTemplates)||void 0===i?void 0:i.get(t))&&""!==e)try{const i=(l=this.hass.connection,r=e=>{this._templateResults[t]=e},a={template:e,entity_ids:this._config.entity_id,variables:{config:this._config,user:this.hass.user.name},strict:!0},l.subscribeMessage((e=>r(e)),Object.assign({type:"render_template"},a)));null===(o=this._unsubRenderTemplates)||void 0===o||o.set(t,i),await i}catch(i){this._templateResults=Object.assign(Object.assign({},this._templateResults),{[t]:{result:e,listeners:{all:!1,domains:[],entities:[],time:!1}}}),null===(n=this._unsubRenderTemplates)||void 0===n||n.delete(t)}}async _tryDisconnectAll(){var e,t,i,o,n,l,r,a,s,d;const{entities:c}=this._config,u={gridSecondary:null===(t=null===(e=c.grid)||void 0===e?void 0:e.secondary_info)||void 0===t?void 0:t.template,solarSecondary:null===(o=null===(i=c.solar)||void 0===i?void 0:i.secondary_info)||void 0===o?void 0:o.template,homeSecondary:null===(l=null===(n=c.home)||void 0===n?void 0:n.secondary_info)||void 0===l?void 0:l.template,individual1Secondary:null===(a=null===(r=c.individual1)||void 0===r?void 0:r.secondary_info)||void 0===a?void 0:a.template,individual2Secondary:null===(d=null===(s=c.individual2)||void 0===s?void 0:s.secondary_info)||void 0===d?void 0:d.template};for(const[e,t]of Object.entries(u))t&&this._tryDisconnect(e)}async _tryDisconnect(e){var t,i;const o=null===(t=this._unsubRenderTemplates)||void 0===t?void 0:t.get(e);if(o)try{(await o)(),null===(i=this._unsubRenderTemplates)||void 0===i||i.delete(e)}catch(e){if("not_found"!==e.code&&"template_error"!==e.code)throw e}}};Te.styles=Ee,e([he({attribute:!1})],Te.prototype,"hass",void 0),e([pe()],Te.prototype,"_config",void 0),e([pe()],Te.prototype,"_templateResults",void 0),e([pe()],Te.prototype,"_unsubRenderTemplate",void 0),e([pe()],Te.prototype,"_unsubRenderTemplates",void 0),e([ye("#battery-grid-flow")],Te.prototype,"batteryGridFlow",void 0),e([ye("#battery-home-flow")],Te.prototype,"batteryToHomeFlow",void 0),e([ye("#grid-home-flow")],Te.prototype,"gridToHomeFlow",void 0),e([ye("#solar-battery-flow")],Te.prototype,"solarToBatteryFlow",void 0),e([ye("#solar-grid-flow")],Te.prototype,"solarToGridFlow",void 0),e([ye("#solar-home-flow")],Te.prototype,"solarToHomeFlow",void 0),Te=e([ue("power-flow-card-plus")],Te);class Ne extends TypeError{constructor(e,t){let i;const{message:o,explanation:n,...l}=e,{path:r}=e,a=0===r.length?o:`At path: ${r.join(".")} -- ${o}`;super(n??a),null!=n&&(this.cause=a),Object.assign(this,l),this.name=this.constructor.name,this.failures=()=>i??(i=[e,...t()])}}function je(e){return"object"==typeof e&&null!=e}function He(e){return"symbol"==typeof e?e.toString():"string"==typeof e?JSON.stringify(e):`${e}`}function Ue(e,t,i,o){if(!0===e)return;!1===e?e={}:"string"==typeof e&&(e={message:e});const{path:n,branch:l}=t,{type:r}=i,{refinement:a,message:s=`Expected a value of type \`${r}\`${a?` with refinement \`${a}\``:""}, but received: \`${He(o)}\``}=e;return{value:o,type:r,refinement:a,key:n[n.length-1],path:n,branch:l,...e,message:s}}function*Ie(e,t,i,o){(function(e){return je(e)&&"function"==typeof e[Symbol.iterator]})(e)||(e=[e]);for(const n of e){const e=Ue(n,t,i,o);e&&(yield e)}}function*Fe(e,t,i={}){const{path:o=[],branch:n=[e],coerce:l=!1,mask:r=!1}=i,a={path:o,branch:n};if(l&&(e=t.coercer(e,a),r&&"type"!==t.type&&je(t.schema)&&je(e)&&!Array.isArray(e)))for(const i in e)void 0===t.schema[i]&&delete e[i];let s="valid";for(const o of t.validator(e,a))o.explanation=i.message,s="not_valid",yield[o,void 0];for(let[d,c,u]of t.entries(e,a)){const t=Fe(c,u,{path:void 0===d?o:[...o,d],branch:void 0===d?n:[...n,c],coerce:l,mask:r,message:i.message});for(const i of t)i[0]?(s=null!=i[0].refinement?"not_refined":"not_valid",yield[i[0],void 0]):l&&(c=i[1],void 0===d?e=c:e instanceof Map?e.set(d,c):e instanceof Set?e.add(c):je(e)&&(void 0!==c||d in e)&&(e[d]=c))}if("not_valid"!==s)for(const o of t.refiner(e,a))o.explanation=i.message,s="not_refined",yield[o,void 0];"valid"===s&&(yield[void 0,e])}class Le{constructor(e){const{type:t,schema:i,validator:o,refiner:n,coercer:l=(e=>e),entries:r=function*(){}}=e;this.type=t,this.schema=i,this.entries=r,this.coercer=l,this.validator=o?(e,t)=>Ie(o(e,t),t,this,e):()=>[],this.refiner=n?(e,t)=>Ie(n(e,t),t,this,e):()=>[]}assert(e,t){return We(e,this,t)}create(e,t){return function(e,t,i){const o=Ve(e,t,{coerce:!0,message:i});if(o[0])throw o[0];return o[1]}(e,this,t)}is(e){return function(e,t){const i=Ve(e,t);return!i[0]}(e,this)}mask(e,t){return function(e,t,i){const o=Ve(e,t,{coerce:!0,mask:!0,message:i});if(o[0])throw o[0];return o[1]}(e,this,t)}validate(e,t={}){return Ve(e,this,t)}}function We(e,t,i){const o=Ve(e,t,{message:i});if(o[0])throw o[0]}function Ve(e,t,i={}){const o=Fe(e,t,i),n=function(e){const{done:t,value:i}=e.next();return t?void 0:i}(o);if(n[0]){const e=new Ne(n[0],(function*(){for(const e of o)e[0]&&(yield e[0])}));return[e,void 0]}return[void 0,n[1]]}function Be(e,t){return new Le({type:e,schema:null,validator:t})}function Ze(){return Be("any",(()=>!0))}function Ge(){return Be("boolean",(e=>"boolean"==typeof e))}function Ye(){return Be("integer",(e=>"number"==typeof e&&!isNaN(e)&&Number.isInteger(e)||`Expected an integer, but received: ${He(e)}`))}function qe(){return Be("number",(e=>"number"==typeof e&&!isNaN(e)||`Expected a number, but received: ${He(e)}`))}function Ke(e){const t=e?Object.keys(e):[],i=Be("never",(()=>!1));return new Le({type:"object",schema:e||null,*entries(o){if(e&&je(o)){const n=new Set(Object.keys(o));for(const i of t)n.delete(i),yield[i,o[i],e[i]];for(const e of n)yield[e,o[e],i]}},validator:e=>je(e)||`Expected an object, but received: ${He(e)}`,coercer:e=>je(e)?{...e}:e})}function Je(e){return new Le({...e,validator:(t,i)=>void 0===t||e.validator(t,i),refiner:(t,i)=>void 0===t||e.refiner(t,i)})}function Qe(){return Be("string",(e=>"string"==typeof e||`Expected a string, but received: ${He(e)}`))}function Xe(e){return{type:"expandable",title:`Combined ${e||"Grid"} Entity (positive & negative values)`,schema:[{name:"entity",selector:{entity:{}}}]}}function et(e){return{type:"expandable",title:`Separated ${e||"Grid"} Entities (One for production, one for consumption)`,name:"entity",schema:[{name:"consumption",label:"Consumption Entity",selector:{entity:{}}},{name:"production",label:"Production Entity",selector:{entity:{}}}]}}const tt={name:"color",title:"Custom Colors",type:"expandable",schema:[{type:"grid",column_min_width:"200px",schema:[{name:"consumption",label:"Consumption",selector:{color_rgb:{}}},{name:"production",label:"Production",selector:{color_rgb:{}}}]}]},it=[{name:"entity",selector:{entity:{}}},{name:"template",label:"Template (overrides entity, save to update)",selector:{template:{}}},{type:"grid",column_min_width:"200px",schema:[{name:"icon",selector:{icon:{}}},{name:"unit_of_measurement",label:"Unit of Measurement",selector:{text:{}}},{name:"color_value",label:"Color Value",selector:{boolean:{}}},{name:"unit_white_space",label:"Unit White Space",selector:{boolean:{}}},{name:"display_zero",label:"Display Zero",selector:{boolean:{}}},{name:"display_zero_tolerance",label:"Display Zero Tolerance",selector:{number:{mode:"box",min:0,max:1e6,step:.1}}}]}],ot=[{name:"color_icon",label:"Color of Icon",selector:{select:{options:[{value:!1,label:"Do not Color"},{value:!0,label:"Color dynamically"},{value:"production",label:"Production"},{value:"consumption",label:"Consumption"}],custom_value:!0}}},{name:"color_circle",label:"Color of Circle",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Consumption"},{value:"production",label:"Production"}],custom_value:!0}}},{name:"display_zero_tolerance",label:"Display Zero Tolerance",selector:{number:{min:0,max:1e6,step:1,mode:"box"}}},{name:"display_state",label:"Display State",selector:{select:{options:[{value:"two_way",label:"Two Way"},{value:"one_way",label:"One Way"},{value:"one_way_no_zero",label:"One Way (Show Zero)"}],custom_value:!0}}}];function nt(e){const t={type:"grid",column_min_width:"200px",schema:[{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}}]};return"battery"!==e&&"grid"!==e||t.schema.push(...ot),t}const lt=[Xe(),et(),nt("grid"),tt,{title:"Secondary Info",name:"secondary_info",type:"expandable",schema:it},{title:"Power Outage",name:"power_outage",type:"expandable",schema:[{name:"entity",selector:{entity:{}}},{type:"grid",column_min_width:"200px",schema:[{name:"label_alert",label:"Outage Label",selector:{text:{}}},{name:"icon_alert",label:"Outage Icon",selector:{icon:{}}},{name:"state_alert",label:"Outage State",selector:{text:{}}}]}]}],rt=Object.assign(Object.assign({},nt("battery")),{schema:[...nt("battery").schema,{name:"color_state_of_charge_value",label:"Color State of Charge Value",selector:{select:{options:[{value:!1,label:"Do Not Color"},{value:!0,label:"Color dynamically"},{value:"consumption",label:"Consumption"},{value:"production",label:"Production"}],custom_value:!0}}}]}),at=[Xe("battery"),et("battery"),{name:"state_of_charge",label:"State of Charge Entity",selector:{entity:{}}},rt,tt],st=[{name:"entity",selector:{entity:{}}},Object.assign(Object.assign({},nt()),{schema:[...nt().schema,{name:"color_value",label:"Color Value",selector:{boolean:{}}},{name:"color_icon",label:"Color Icon",selector:{boolean:{}}},{name:"display_zero_state",label:"Display State When Zero?",selector:{boolean:{}}},{name:"display_zero_tolerance",label:"Display Zero Tolerance",selector:{number:{mode:"box",min:0,max:1e6,step:.1}}}]}),{name:"color",label:"Color",selector:{color_rgb:{}}},{title:"Secondary Info",name:"secondary_info",type:"expandable",schema:it}],dt=[{name:"entity",selector:{entity:{}}},Object.assign(Object.assign({},nt()),{schema:[...nt().schema,{name:"color_value",label:"Color Value",selector:{boolean:{}}},{name:"color_icon",label:"Color Icon",selector:{boolean:{}}},{name:"unit_of_measurement",label:"Unit of Measurement",selector:{text:{}}},{name:"display_zero",label:"Display Zero",selector:{boolean:{}}},{name:"inverted_animation",label:"Invert Animation",selector:{boolean:{}}},{name:"display_zero_tolerance",label:"Display Zero Tolerance",selector:{number:{mode:"box",min:0,max:1e6,step:.1}}},{name:"display_zero_state",label:"Display Zero State",selector:{boolean:{}}}]}),{name:"color",label:"Color",selector:{color_rgb:{}}},{title:"Secondary Info",name:"secondary_info",type:"expandable",schema:it}],ct=[{name:"entity",selector:{entity:{}}},Object.assign(Object.assign({},nt()),{schema:[...nt().schema,{name:"state_type",label:"State Type",selector:{select:{options:[{value:"power",label:"Power"},{value:"percentage",label:"Percentage"}],custom_value:!0}}},{name:"color_value",label:"Color Value",selector:{boolean:{}}},{name:"color_icon",label:"Color Icon",selector:{boolean:{}}},{name:"display_zero",label:"Display Zero",selector:{boolean:{}}},{name:"display_zero_tolerance",label:"Display Zero Tolerance",selector:{number:{mode:"box",min:0,max:1e6,step:.1}}},{name:"display_zero_state",label:"Display Zero State",selector:{boolean:{}}},{name:"unit_white_space",label:"Unit White Space",selector:{boolean:{}}}]}),{name:"color",label:"Color",selector:{color_rgb:{}}},{title:"Secondary Info",name:"secondary_info",type:"expandable",schema:it}],ut=[{name:"entity",selector:{entity:{}}},Object.assign(Object.assign({},nt()),{schema:[...nt().schema,{name:"color_value",label:"Color Value",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Do Not Color"},{value:"solar",label:"Solar"},{value:"grid",label:"Grid"},{value:"battery",label:"Battery"}],custom_value:!0}}},{name:"color_icon",label:"Color Icon",selector:{select:{options:[{value:!0,label:"Color dynamically"},{value:!1,label:"Do Not Color"},{value:"solar",label:"Solar"},{value:"grid",label:"Grid"},{value:"battery",label:"Battery"}],custom_value:!0}}},{name:"subtract_individual",label:"Subtract Individual",selector:{boolean:{}}},{name:"override_state",label:"Override State (With Home Entity)",selector:{boolean:{}}}]}),{title:"Secondary Info",name:"secondary_info",type:"expandable",schema:it}],vt=function(...e){const t="type"===e[0].type,i=e.map((e=>e.schema)),o=Object.assign({},...i);return t?function(e){const t=Object.keys(e);return new Le({type:"type",schema:e,*entries(i){if(je(i))for(const o of t)yield[o,i[o],e[o]]},validator:e=>je(e)||`Expected an object, but received: ${He(e)}`,coercer:e=>je(e)?{...e}:e})}(o):Ke(o)}(Ke({type:Qe(),view_layout:Ze()}),Ke({title:Je(Qe()),theme:Je(Qe()),dashboard_link:Je(Qe()),dashboard_link_label:Je(Qe()),inverted_entities:Je(Ze()),w_decimals:Je(Ye()),kw_decimals:Je(Ye()),min_flow_rate:Je(qe()),max_flow_rate:Je(qe()),min_expected_power:Je(qe()),max_expected_power:Je(qe()),watt_threshold:Je(qe()),clickable_entities:Je(Ge()),display_zero_lines:Je(Ge()),use_new_flow_rate_model:Je(Ge()),entities:Ke({battery:Je(Ze()),grid:Je(Ze()),solar:Je(Ze()),home:Je(Ze()),fossil_fuel_percentage:Je(Ze()),individual1:Je(Ze()),individual2:Je(Ze())})})),ht=[{name:"title",label:"Title",selector:{text:{}}}],pt=[{name:"entities",type:"grid",column_min_width:"400px",schema:[{title:"Grid",name:"grid",type:"expandable",schema:lt},{title:"Solar",name:"solar",type:"expandable",schema:st},{title:"Battery",name:"battery",type:"expandable",schema:at},{title:"Non-Fossil",name:"fossil_fuel_percentage",type:"expandable",schema:ct},{title:"Home",name:"home",type:"expandable",schema:ut},{title:"Individual 1",name:"individual1",type:"expandable",schema:dt},{title:"Individual 2",name:"individual2",type:"expandable",schema:dt}]}],yt=[{title:"Advanced Options",type:"expandable",schema:[{type:"grid",column_min_width:"200px",schema:[{name:"dashboard_link",label:"Dashboard Link",selector:{navigation:{}}},{name:"dashboard_link_label",label:"Dashboard Link Label",selector:{text:{}}},{name:"w_decimals",label:"Watt Decimals",selector:{number:{mode:"box",min:0,max:5,step:1}}},{name:"kw_decimals",label:"kW Decimals",selector:{number:{mode:"box",min:0,max:5,step:1}}},{name:"max_flow_rate",label:"Max Flow Rate (Sec/Dot)",selector:{number:{mode:"box",min:0,max:1e6,step:.01}}},{name:"min_flow_rate",label:"Min Flow Rate (Sec/Dot)",selector:{number:{mode:"box",min:0,max:1e6,step:.01}}},{name:"max_expected_power",label:"Max Expected Power (in Watts)",selector:{number:{mode:"box",min:0,max:1e6,step:.01}}},{name:"min_expected_power",label:"Min Expected Power (in Watts)",selector:{number:{mode:"box",min:0,max:1e6,step:.01}}},{name:"watt_threshold",label:"Watt to Kilowatt Threshold",selector:{number:{mode:"box",min:0,max:1e6,step:1}}},{name:"display_zero_lines",label:"Display Zero Lines",selector:{boolean:{}}},{name:"clickable_entities",label:"Clickable Entities",selector:{boolean:{}}},{name:"use_new_flow_rate_model",label:"New Flow Model?",selector:{boolean:{}}}]},{name:"inverted_entities",label:"Inverted Entities",selector:{code_editor:{}}}]}],mt=async()=>{var e,t;if(customElements.get("ha-form"))return;const i=await(null===(t=(e=window).loadCardHelpers)||void 0===t?void 0:t.call(e));if(!i)return;const o=await i.createCardElement({type:"entity"});o&&await o.getConfigElement()};let ft=class extends de{constructor(){super(...arguments),this.showOther=!1,this._computeLabelCallback=e=>(null==e?void 0:e.label)||this.hass.localize(`ui.panel.lovelace.editor.card.generic.${null==e?void 0:e.name}`||(null==e?void 0:e.name)||"")}async setConfig(e){We(e,vt),this._config=e}connectedCallback(){super.connectedCallback(),mt()}render(){if(!this.hass||!this._config)return Z;const e=Object.assign({},this._config);return W`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${e}
          .schema=${ht}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div style="height: 24px"></div>
        <ha-form
          .hass=${this.hass}
          .data=${e}
          .schema=${pt}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
          class="entities-section"
        ></ha-form>
        <div style="height: 24px"></div>
        <ha-form
          .hass=${this.hass}
          .data=${e}
          .schema=${yt}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `}_valueChanged(e){const t=e.detail.value||"";this._config&&this.hass&&function(e,t,i,o){o=o||{},i=null==i?{}:i;var n=new Event(t,{bubbles:void 0===o.bubbles||o.bubbles,cancelable:Boolean(o.cancelable),composed:void 0===o.composed||o.composed});n.detail=i,e.dispatchEvent(n)}(this,"config-changed",{config:t})}static get styles(){return u`
      ha-form {
        width: 100%;
      }

      ha-icon-button {
        align-self: center;
      }

      .entities-section * {
        background-color: #f00;
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
    `}};e([he({attribute:!1})],ft.prototype,"hass",void 0),e([pe()],ft.prototype,"_config",void 0),e([pe()],ft.prototype,"showOther",void 0),ft=e([ue("power-flow-card-plus-editor")],ft);var _t=Object.freeze({__proto__:null,loadHaForm:mt,get PowerFlowCardPlusEditor(){return ft}});export{Te as PowerFlowCardPlus};
