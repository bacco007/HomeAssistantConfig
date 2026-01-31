/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=window,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;class r{constructor(e,t,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const i=this.t;if(t&&void 0===e){const t=void 0!==i&&1===i.length;t&&(e=s.get(i)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&s.set(i,e))}return e}toString(){return this.cssText}}const o=e=>new r("string"==typeof e?e:e+"",void 0,i),a=(e,...t)=>{const s=1===e.length?e[0]:t.reduce(((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1]),e[0]);return new r(s,e,i)},n=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return o(t)})(e):e
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var l;const d=window,c=d.trustedTypes,h=c?c.emptyScript:"",u=d.reactiveElementPolyfillSupport,m={toAttribute(e,t){switch(t){case Boolean:e=e?h:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},p=(e,t)=>t!==e&&(t==t||e==e),v={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:p},g="finalized";class f extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,i)=>{const s=this._$Ep(i,t);void 0!==s&&(this._$Ev.set(s,i),e.push(s))})),e}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i="symbol"==typeof e?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);void 0!==s&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){const r=this[e];this[t]=s,this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||v}static finalize(){if(this.hasOwnProperty(g))return!1;this[g]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const i of t)this.createProperty(i,e[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Ep(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,i;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(i=e.hostConnected)||void 0===i||i.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var i;const s=null!==(i=this.shadowRoot)&&void 0!==i?i:this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{t?i.adoptedStyleSheets=s.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):s.forEach((t=>{const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}))})(s,this.constructor.elementStyles),s}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=v){var s;const r=this.constructor._$Ep(e,i);if(void 0!==r&&!0===i.reflect){const o=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:m).toAttribute(t,i.type);this._$El=e,null==o?this.removeAttribute(r):this.setAttribute(r,o),this._$El=null}}_$AK(e,t){var i;const s=this.constructor,r=s._$Ev.get(e);if(void 0!==r&&this._$El!==r){const e=s.getPropertyOptions(r),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(i=e.converter)||void 0===i?void 0:i.fromAttribute)?e.converter:m;this._$El=r,this[r]=o.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||p)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,t)=>this[t]=e)),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,t)=>this._$EO(t,this[t],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var A;f[g]=!0,f.elementProperties=new Map,f.elementStyles=[],f.shadowRootOptions={mode:"open"},null==u||u({ReactiveElement:f}),(null!==(l=d.reactiveElementVersions)&&void 0!==l?l:d.reactiveElementVersions=[]).push("1.6.3");const y=window,b=y.trustedTypes,C=b?b.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",w=`lit$${(Math.random()+"").slice(9)}$`,I="?"+w,T=`<${I}>`,k=document,_=()=>k.createComment(""),E=e=>null===e||"object"!=typeof e&&"function"!=typeof e,$=Array.isArray,P="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,R=/>/g,O=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),M=/'/g,x=/"/g,B=/^(?:script|style|textarea|title)$/i,H=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),U=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),D=new WeakMap,N=k.createTreeWalker(k,129,null,!1);function q(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const G=(e,t)=>{const i=e.length-1,s=[];let r,o=2===t?"<svg>":"",a=F;for(let t=0;t<i;t++){const i=e[t];let n,l,d=-1,c=0;for(;c<i.length&&(a.lastIndex=c,l=a.exec(i),null!==l);)c=a.lastIndex,a===F?"!--"===l[1]?a=L:void 0!==l[1]?a=R:void 0!==l[2]?(B.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=O):void 0!==l[3]&&(a=O):a===O?">"===l[0]?(a=null!=r?r:F,d=-1):void 0===l[1]?d=-2:(d=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?O:'"'===l[3]?x:M):a===x||a===M?a=O:a===L||a===R?a=F:(a=O,r=void 0);const h=a===O&&e[t+1].startsWith("/>")?" ":"";o+=a===F?i+T:d>=0?(s.push(n),i.slice(0,d)+S+i.slice(d)+w+h):i+w+(-2===d?(s.push(void 0),t):h)}return[q(e,o+(e[i]||"<?>")+(2===t?"</svg>":"")),s]};class J{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0;const a=e.length-1,n=this.parts,[l,d]=G(e,t);if(this.el=J.createElement(l,i),N.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(s=N.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes()){const e=[];for(const t of s.getAttributeNames())if(t.endsWith(S)||t.startsWith(w)){const i=d[o++];if(e.push(t),void 0!==i){const e=s.getAttribute(i.toLowerCase()+S).split(w),t=/([.?@])?(.*)/.exec(i);n.push({type:1,index:r,name:t[2],strings:e,ctor:"."===t[1]?K:"?"===t[1]?X:"@"===t[1]?Q:j})}else n.push({type:6,index:r})}for(const t of e)s.removeAttribute(t)}if(B.test(s.tagName)){const e=s.textContent.split(w),t=e.length-1;if(t>0){s.textContent=b?b.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],_()),N.nextNode(),n.push({type:2,index:++r});s.append(e[t],_())}}}else if(8===s.nodeType)if(s.data===I)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(w,e+1));)n.push({type:7,index:r}),e+=w.length-1}r++}}static createElement(e,t){const i=k.createElement("template");return i.innerHTML=e,i}}function W(e,t,i=e,s){var r,o,a,n;if(t===U)return t;let l=void 0!==s?null===(r=i._$Co)||void 0===r?void 0:r[s]:i._$Cl;const d=E(t)?void 0:t._$litDirective$;return(null==l?void 0:l.constructor)!==d&&(null===(o=null==l?void 0:l._$AO)||void 0===o||o.call(l,!1),void 0===d?l=void 0:(l=new d(e),l._$AT(e,i,s)),void 0!==s?(null!==(a=(n=i)._$Co)&&void 0!==a?a:n._$Co=[])[s]=l:i._$Cl=l),void 0!==l&&(t=W(e,l._$AS(e,t.values),l,s)),t}class Y{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:s}=this._$AD,r=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:k).importNode(i,!0);N.currentNode=r;let o=N.nextNode(),a=0,n=0,l=s[0];for(;void 0!==l;){if(a===l.index){let t;2===l.type?t=new z(o,o.nextSibling,this,e):1===l.type?t=new l.ctor(o,l.name,l.strings,this,e):6===l.type&&(t=new ee(o,this,e)),this._$AV.push(t),l=s[++n]}a!==(null==l?void 0:l.index)&&(o=N.nextNode(),a++)}return N.currentNode=k,r}v(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class z{constructor(e,t,i,s){var r;this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cp=null===(r=null==s?void 0:s.isConnected)||void 0===r||r}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=W(this,e,t),E(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==U&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>$(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==V&&E(this._$AH)?this._$AA.nextSibling.data=e:this.$(k.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:s}=e,r="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=J.createElement(q(s.h,s.h[0]),this.options)),s);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===r)this._$AH.v(i);else{const e=new Y(r,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=D.get(e.strings);return void 0===t&&D.set(e.strings,t=new J(e)),t}T(e){$(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new z(this.k(_()),this.k(_()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class j{constructor(e,t,i,s,r){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){const r=this.strings;let o=!1;if(void 0===r)e=W(this,e,t,0),o=!E(e)||e!==this._$AH&&e!==U,o&&(this._$AH=e);else{const s=e;let a,n;for(e=r[0],a=0;a<r.length-1;a++)n=W(this,s[i+a],t,a),n===U&&(n=this._$AH[a]),o||(o=!E(n)||n!==this._$AH[a]),n===V?e=V:e!==V&&(e+=(null!=n?n:"")+r[a+1]),this._$AH[a]=n}o&&!s&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class K extends j{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}const Z=b?b.emptyScript:"";class X extends j{constructor(){super(...arguments),this.type=4}j(e){e&&e!==V?this.element.setAttribute(this.name,Z):this.element.removeAttribute(this.name)}}class Q extends j{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){var i;if((e=null!==(i=W(this,e,t,0))&&void 0!==i?i:V)===U)return;const s=this._$AH,r=e===V&&s!==V||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,o=e!==V&&(s===V||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==i?i:this.element,e):this._$AH.handleEvent(e)}}class ee{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){W(this,e)}}const te=y.litHtmlPolyfillSupport;null==te||te(J,z),(null!==(A=y.litHtmlVersions)&&void 0!==A?A:y.litHtmlVersions=[]).push("2.8.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var ie,se;class re extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{var s,r;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:t;let a=o._$litPart$;if(void 0===a){const e=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:null;o._$litPart$=a=new z(t.insertBefore(_(),e),e,void 0,null!=i?i:{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return U}}re.finalized=!0,re._$litElement$=!0,null===(ie=globalThis.litElementHydrateSupport)||void 0===ie||ie.call(globalThis,{LitElement:re});const oe=globalThis.litElementPolyfillSupport;null==oe||oe({LitElement:re}),(null!==(se=globalThis.litElementVersions)&&void 0!==se?se:globalThis.litElementVersions=[]).push("3.3.3");const ae="1.0.68",ne="spotifyplus",le="media_player",de="spotifyplus-card",ce="item-selected",he="item-selected-with-hold",ue="show-section",me="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWMAAAFjCAYAAADowmrhAAAAxnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVBbDgMhCPznFD2CMOrqcdxX0hv0+EXBZnfTSRxGRhGh4/M+6dUhHCmmpeSac1DEGqs0FSUY2mAOcfBAhiu+5+lniEZohBklW+SZ9wszclOVLoXK5sZ6N2q0KOVRyB9C70hU7F6oeiGIGewFWvOv1LJcv7Ae4Y5iizqdm9SeS6t5z31cdHp70ncgcoARlIFsDaCvRGgqoMx6SBtGVi2DgTkTHci/OU3QF40xWljv26gBAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TpSIVByuoOGSoDmIXFXEsVSyChdJWaNXB5NIvaNKQpLg4Cq4FBz8Wqw4uzro6uAqC4AeIu+Ck6CIl/i8ptIjx4Lgf7+497t4BQqPCVLMrCqiaZaTiMTGbWxUDr/AjiEEMY0Jipp5IL2bgOb7u4ePrXYRneZ/7c/QpeZMBPpE4ynTDIt4gnt20dM77xCFWkhTic+JJgy5I/Mh12eU3zkWHBZ4ZMjKpeeIQsVjsYLmDWclQiWeIw4qqUb6QdVnhvMVZrdRY6578hcG8tpLmOs1RxLGEBJIQIaOGMiqwEKFVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwvSUmxSMAd0vtv0xBgR2gWbdtr+Pbbt5AvifgSut7a82gLlP0uttLXwE9G8DF9dtTd4DLneAoSddMiRH8tMUCgXg/Yy+KQcM3AK9a25vrX2cPgAZ6mr5Bjg4BMaLlL3u8e6ezt7+PdPq7wfBdHLGjypcUQAADXZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6ZDY5OWJiMzAtOTJmYi00Y2U4LTg0ZmUtMzc0MzU5Mjc2YzE2IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjg0ZDEzOTVlLTUzMmUtNGU3Zi05NmI4LTU0ODc4NjdlZjRkNCIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjFkODdlMDZiLTcwNDQtNGVjMy1iNTE3LTU0YmJlYjBlZTNlZiIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNzQxODE0NzkxODEzNDYzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMzYiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1OjAzOjEyVDE2OjI2OjMwLTA1OjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNTowMzoxMlQxNjoyNjozMC0wNTowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjY2ZTU2M2FmLTE4OTctNDU0Yy1hN2ZjLTcxMTM0YzI5YjFhZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNS0wMy0xMlQxNjoyNjozMSIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz5srmYUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH6QMMFRof1yGzNwAAIABJREFUeNrt3XmYHFW9//F39WQPW9gCNUMSQthRAghyFVlE4MI1B7gILqx62bQmKN77A1EvgiCCioLkuCAql0WWq6I1yBJlFUUDhOViwhIg2xSJLAkJWSfT9fvjnJBJMpNMz/RS1f15PU8/M5OZzHR/6/SnT586dQ6IiIiIiAgEKoFkURhHWwLD/G1b/8/DgJEl/JrZQKf/fA7QGcD8dmM7VGFRGEvDao6jgSnsCITAGGAH/7EZ2AQYBWwJDK/C3Xkd6ABmAfOAN4HEfz0LmJkYO1tHTRTGktfAHZTCrsB4YCywE7CH/3xEDh9SArwKzABeAZ4FXkyMfUlHWxTGkpWhhNHA3sA+wL7Afr6X2yhmAI8DzwN/B6Ylxr6hliEKY6lk8G4OHOhvHwY+VKXhhLx5HXgMeBJ4PDH2zyqJKIylP+E7EjgE+ChwhB9mkL55Cvij70U/khj7jkoiCmPZUM/3MOBfgSNxJ9qkMp4G7gfuT4x9WOUQhbECeDxwFHAibrxXqq8TuBe4G2hLjE1UEoWxNEYAHwUcDZyKm0Ym2TId+B1wZ2LsMyqHwljqL4BPAE7GXTgh+TATuB24Q8GsMJb8BvCHgdMVwHVjFnAbcFNi7HSVQ2Es2Q7gscCZwGeB7VSRuvUC8GPg5sTYBSqHwlgyoCWOmopwEnAebg6wNJbfADckxt6nUiiMpTa94D2As4FWoEkVaXjzgB8C1yfGvqVyKIyl8iF8HPAl3AUZIt25FbgmMfZJlUJhLOUN4GG+F3whGguW3psCfCcx9jcqhcJY+hfCI3HDEBehoQjpu3nAVQFYreWsMJbSQngX3Am5SNWQMloKfA+4OjF2kcqhMJYNh/AlwKdVDamgTuDbwHcVygpjUQiLQlkUxpkJ4ZHAlcAZqobUOJSvCOAyjSkrjBsthDfDnZT7iqohGbIMuKAAP5prbFHlUBjXLX+13HnAd9HsCMmu+cAXEmN/q1IojOuxN/wJYBKlbTUvUktTgLMSY59TKRTG9RDCuwPXAwepGpJTNwLnJ8YuVCkUxrnTHEfDUrgC+KKqIXWgE/hCE8ENc8wkjScrjHPTGz7J9yaGqhpSZ54HzkiMfUqlUBhnOYSbgf8BDlc1pM5NCuD/tRu7XKVQGGfGDnFroZP0PNylppolIY1iIfCZxNh7VQqFcRZ6w2OBO9HuytK47gA+r11HFMa17A1PBK5RNURYBpygXrLCuNq94Wbg9+oNi6znpgC+0G7sEpVCYVzpID4DuAGNDYv0ZD4wITH2CZVCYVx2zXE0PHXT1T6haoj0yjebCC7VvGSFcTl7w/sDk4EtVA2RkjwOHJ8YO1+lUBj32Y5tE4MVafF84GpVQ6TPioBJjP2DSqEw7ktveFPgduAYVUOkLK5sIviahi0UxqUE8e7AQ2iFNZFyexx3cu8tlWJtBZVgvSD+DDBNQSxSEf8CzAjjaLxKoZ5xt1ri1kKR9GrgS6qGSFWclhh7s8qgMO7aG94UiIFDVQ2RqvpBgeC/5mocWWEcxtEY4BFglJ4XIjXxAHBs0uBX7TV0GIdxdJAPYo2di9TWDODgxNjXG7UADRtCYRydCvxZQSySCeOAaY18Yq8hgyiMo28AN6n9i2TKFsCTYRwd3YgPvqGGKVriqKkIPwS+oHYvkmlnJcbeoJ5xHWqOoyFFt9CPglgk+34WxtHX1DOuwyBO4V40dU0kb749MAi+NmvCpFRhnHNhHG2Bmzqzr9q1SC7dUoAz5hrbqTDObxBvDjyJO1MrIgpkhbGCWEQUyA0WxgpiEQWywlhBLCIK5MYOYwWxiAI5r+pmnrGfNaEgFmkMpxThxpY4qptd2usijJvjaAhu+pqCWKSxAvnnCuMMBbG/oEPziEUaz+lhHF2hMK6xljhqSuFn6Mo6kUZ2URhHud+hJ9dh7Bf9OUVtUaTh/cAvi5tbuZ1N4ZfBvERtUES6ODwx9kGFcfWC+FS0HrGIrK8TeF9i7HSFceWD+CDcDh0iIt1ZCOySGPuGwrhyQTwGeAVtlSQiGzYjgL3ajV2Rlzucm1AL42hTtHmoiPTOuBRuy9NFIbkItpa4tQDEwCi1MRHppeOL8A2FcRkVSa9Gc4lFpHT/HcbRSXm4o5kfMw7j6DPArWpTItJHncCeibEvKoz7HsS7A9PUlkSkn+YDOyfGLs7qHczsMIU/YfeQ2pCIlMFI4Pad2iZmtgOayTDe0RXsdl9AEZFyOGZZWvyawrgEK9Li+cAxajsiUmaXhXH0kSzescx12cM42h+YojYjIhWyEBiXGPuWesY9aI6j4cBktRURqaAtgJt2zNj4cabCOIUbfaFERCrpmBVp8fNZukOZeWUI4+gM4JdqIyJSRe9LjH1eYbwmiJuBWUCT2oaIVNHLAezZbmxHre9IzYcpdnDrTvxeQSwiNbBzCpdn4Y7UPIw7SScC+6lNiEiNXBDG0YdqfSdqOkwRxtFY3PrEIiK1ND+AHduNXdZwPWM/PHGn2oCIZMDIFL5dyztQszDuJD0PDU+ISHZ8MYyjmmVSTYYpNHtCRDJqdgHGzjW2s1F6xv+jIBaRDBpVhIsaomfsV92/Q8dcRDJsx8TYmXXbM26Oo2HAT3WcRSTjbqj2H6xqGKdwBVp7QkSy7/Bq751XtWGKMI52BV7QMRaRnJgfwKh2Y1fWW8/4Zzq2IpIjI1O4uK56xmEcfRxo07EVkRxqSYxtz33PuCWOmqjBYLiISJlcU40/UvEwLsJ5aGNREcmvT4RxdGCuwziMo82A7+pYikjOXZv3nvFF6Eo7Ecm/A8I4+vdK/oGKncAL42gkME/HMLMWA53AIqDoP6bAO/77M4B3/b/9n/8ZgAW4dUW66hhA8I9CL1vTyjTdHNhxnX9uAvbq0ia3Z83w1k7Apv57m3fzsQBsokMqFfZSAfao1LoVAyp4xy/Vsau6RT5MFwNL/dfTgBd9iE4HXhoYBEsKPvOa/GvyjAk/TKt4PxcCT3fz70/29heMa5sYpF1eIYqkdKTpdj7E9wJGAOOAPYHhwDAf3Jv5YC+ouUiJdinC6cAvctMzDuNoFx8AUj6rfIi95T++Djzj6/zMwCB4MQCaCHhlwnWpyrW+ndomBp2kpLA6uHfxt/E+wLfocttMFZNuzCsQNM81k4p56RlfomPWZ28CbwD/BKYCTwFPDgyClwJg5oRJCto+WudF6nV/e6Trz4z1gd2ZpoUivB/YF9gHt/b2Vv62parZsLYrkp5Rid5x2XvG6hX3Sup7uPOBucCDwL1+3DVV4Ga3Z71q7aA+CPgIsKsfFhkJDFKl1DvOSs9YveK1FX0PbL4P3T83EdxdCEhnKXTz2rPuxI15Pw1cB7Bj28SgM01ZRboXsD/w78AoYDtgG1VPveOq9ozDOBoHvNzor5o+eP8I3NtE8HCTersNa3Rba+B70h8DjgYOAbYFQlVHveNK9oy/1IC93tm4YZn/BW4fGARL1eOV1Xxb6ATu97fuAvqjfohjW1UsV73j04AbM9czbpB5xUXcHNupwC+aCO5Tr1fKYVRba7AqTTcFjsdNnxoNNAODVZ3MeikxdtcshvFlwNfrdNjhBeDGJoKbFb5SDWNcOBeKcBjwOdyMjh1wc6YlO45LjP19ZsK4OY4GprCM+rj0eSXwqn9L+b0BBO2zjcJXamts28SgI02DTtIDgFbgAB/OQ1SdmpqSGPvBzIRxGEfnUYWFNCrsVeD7TQQ/HhAE6Wu6cELy0XP+N+AsYG8fzlJ9+yfGPtnfX1KuMH4dN4Unj2YCZw8Mgj/pxJvklR9z3gQ4F/gM7lJwrddRHbcmxp5S8zAO4+g44K4cFrAT+PHgoHCeesFSb1ri1kKR9BDgy7irB7dXVSpq28TYN/rzC8oxtS2P09k6gJMTY/9XbUjqkZ//+hDw0Ki4tbCKdDRwIXAkMIYqbkbcICL6ecFbvw5IGEd7AP/IWdFWAUcnxv5J7UcaTZfhjC8DpwBj0Qp25bB0AMEm/TnZ39+DcHYOi3aWglga1ewJk9LE2MWJsZcODIJdcCvUXYJbv7qoCvXZsFWkx9WkZ9wSR01Ft17usBwV7PbE2E+r3YisbXRba9CRptsC/w0ch7vgRErzSGLsoVUP4zCOPg38KkeFWghslxi7Qm1GpGc7xK2FTtLdgG8DH8YtGyq9s1Ni7Kt9+Y/9GaY4L2dFsgpikY2bYyYVE2OnJcYeWyAYCUwAnsVdECUbdmZVe8ZhHI0FXslRgRYnxmrnBpE+2rFtYrAiLW4CXA58kjX7E8raFiTG9mnzgb72jE/LWYEmq42I9N1rE65bfeLvi00EIXAobs/CVarOWkaEcXRUNcP4nJwV6Ea1EZHy8MMYjwwJCgfgtqD6BW7DW3H+oy//qeRhijCO/gX4a54qkxirCe4iFeRnV52Ju7BkDI19UUknsFli7NJK94w/m7PCtOupIlJZc43tTIz9aRPBONy+gE/TuPOWmwBT6n/qSxifnLPCvK2nikh1+CGMvwwKgtXrYTwMNOIsplNL/Q8lvZXwA9P35awoDyfGHqaniUhthHG0KfBL3HKfjbT+8paJsb0eSy+1Z3xCDgsyQE8HkdrxszA+gdvj73pgSYM89BNL+eFSw/jkHBZkaz0dRDITyucU3HoY1wPL6/whTyjlh3s9TBHG0ZH43W1z5p3E2C30VBDJlgYZvhiWGLus3D3jY3JajM3DOBqnpi+SyZ7y6uGLP1GfF5D0elZFKWF8Uo4L8lk1fZHshvKwoHAkbquoJ4F62nmn1+fZejVMEcbR+3ELheTV9MTYPdTsS9McR8Nwz4xBwMAuL+DrLps6ABhcwq9OgaU9/NvqJ+LywE2ep73EyfOSX34pzwOB24FRdfCQlibGDi9nGF8IXJnzohyQGPtEg4bqEB+oQ3yQDsZ9vQ8wFNgTt0zimC4fu75zCtZpM0E37ajUK66KPYR02uXzdX/2Wf9Wdgbwjv96hf/YgTshtBRYFcByhXh++WU8I+AyYPOcP5xDE2MfKVcYP4nb1DDPHk+M/VCdBu1wH7TDcRPtd/dB+35gvA/VoMvHvoRn1q0O8mKXAE+B54DZ/jbVB/e7uOlVSxJjG2WaVS75y6xvBT6Bu7Itj65KjP1Kv8M4jKOh3bylzKtPJsbemdPA3cyH7da4y00P9i+Q23YTtrLxXnmxS3g/BzyFG698CrcRwZIAlqh3nQ1hHB0I3AOMyOHdn5YYu2c5wtgAv6+TY/ou0JIY+05GQ3dQ6uZgbuqD9nDgMGC0D9oC2jyymmFdxG0t9ogPgil+eGRhYuxilanqgTwcmA7skMO7v11i7Pz+hvFPyN+SmRvyXAAHtvdy7l8Fg3eoD97tcZPDDW7stsnf1MPNblB34saoHwPuBh4C3gxgkXrSVQnkF8nfHn2fSoy9o79h/CqwY50d02cD+FC1njj+ZMTWuN0RTsBt+Lh7l+CV/Ov0txk+nH8FzAHe1rh02QO5BXgJd/I5L25KjD29z2EcxtFIYF6dHtM5wP4be+vQx17vgBS28YF7JnA8bvqX1slovF70KiDBTdW6A3g9gAXtxmo/uf4F8lm4S6rz4vXE2LA/YXySb0D1/GT5YgDX9+fJMaqtNViVptsAewHn+mGHger1SjdW+dtjuFkCDwFvqvfcp0B+AvhAju7y6MTY2X0N43obL+7JfODzwAOJsYt62RCG4yaln+ZrtKl6vtKP3vMM39O7G/inThD26jm4P+6kal6cnhh7U1/DeAawUwMd3w7cllLfx013WsKaeasBbmrZeKAVN7VsIDrRJuWV+nb4LPATYHIAb7Ybu1yl6Taj/gHk5eranybGnltyGIdxtBluGk8jPyk6WXMl2Op5vJpaJtW0eubG/cD3gGmDg8KC1yZcl6o0EMbRxcClObm7ryTGjutLGB+BtrgXyeK7twT4IXBnAP9s5JOBYRxt7+uRF5v3NBS6oV7eh9TuRTJnIO4ioKuBmSksDOPoB2Ec7dLsrpZtKImxrwNv5Oguf7Cnb2wojD+sdi+SaU24ubZfAl5I4e0wjm4L42j3BgvmPPWMD+zpGxs6+7+f2rpIbgS4xaI+BXwyhRVhHP0O+GYAr7YbW887NOepZ/yBksI4jKMdgC3VvkXqIpiXh3F0PXBNgWDOXDOpUyWqmf17+kZPwxT7qGYidRPMQ4EvAjOKpPPCOPp8GEdb7tQ2UdMyq2/7MI62KSWMx6tmInWnCbcE64+AecvS4iNhHL2/OY4G5/xx5e1d/B6lhPG+arcidW0gbl3sZ1JYEMbRBWEcbZXTxzImZ/f3gO7+sacTeDp5J9IYVg9jXAVcHsbRg8D5BXhprrGZH1sO42hMDnvGe5bSM25RGxVpyN7yUcDzRZgXxtERzXE0JOP3OY+71vcujMM4ep/apEhDK+DGlif7uctfCuMoq5uCnpzD+u7T257x3mqLIuINBX4A/DOMo++GcZSZIYEwjg7HbbqbN01+gfyNhvGOan8iso5BwH/hhi9uCuNo2wzcp6tyXM+dehPG49TuRKQHA4FTgblhHN1cq1AO4+hM8j3RYLfehPFOam8i0otQPsWH8k+rOabsZ1D8KOf1G9ObMN5D7UxESgjls4H5YRx9s9ntgFMxzXE0DLdl1cCc1229nA3WeaADU9BGiY0hxR3rlbjdTFb4f1u9oMxU/+8rcbtOrPYCsLgfT9y9u7S7XYHNcFeG7e07B4P991dfFTbYf3+gDlkuLAdOD+CudmM7ytwj3g74CzC2Dur0fGLsWjPXBqzz7AzVlurmCbGiy206MBN4GXgGmAa8G6zZXj71n6dVmOh/34a+2RJHTUCQrtnMdUDqwnkA7jL9Uf62j78NxZ1cGuQDe7AOf00NAe5I4c0wjo5oInhujplULEMQ7wM8gttrsh6M3WDPOIyjQ3G71Uq2dfrAXYbbp+/vwBP+9kzgdyAOoHOusavquRAtcdTkg7sANKUuDPbvctvXB/ZQHxRaHKd6isCDwGl+Efi+hPAWuI1aT6DOtjwLYFDXdw/rhvHpwI1qQ5kK3SU+dF/G7Rz8F+C5wG2/s6rcbwXrzei21mBVmg70PexBuDPwBwITcNM4hwDD0M7eldQB/An4QgDJxraJ8sOlI4Bv42Zu1OsQ1ZjE2Fk9hfHXgcvUdmpipQ/eN/27k5t96K4MoCMP6wTktFc9MHVP9v1wW419GhgJbOJ701LenvJS31v+NfC4f4e32iHAscDRvvZNdV6PQxJjH139xbq9AV3wUb1GuRhYANzjg/f5AFY28uaS1eZf4FYP+Tzsb1e0xNGAFAanbvz5Uz4g9lFA91vB19D4W6Mb1fWLdcN4a9WnYm/TFuFmJdwM3BXA8kFBYaW2XM9kSK/Cjbsvwc1n/VFzHA3ABfQoH85n4VYL20RDHNJHozcUxtpqqXzhuxg3c+FK4G8BLNf4bn61rwno6f52ZXMcDfYnDP8NN7a5P+5s/yBVTHph0IbCeLTq0yepD98XgR8Cv1f4NkRAr546+CvgV/7E01Dc2OcXfDhvrp6z9GWYYrjqU1Lv9y3gTuCHAbS3G7tcZWnocO7w7aINaPPhPAz4OHAB7hLYTdH0OnG21zBF/3rAb+BWi/pZAZZqloNsJJzfAW4Fbm2OoyEpbAt8GXdicAQa0mhkw7p+8d4rdBhHm9D3y1wbwTvA5wJo0/CD9FdLHDUV3TvRTwIXAtvpnWnDmZ0YO7q7nvEWqk2P/h7AoRqGkHLx76gWAT8b3dZ6w6o0HZrCYcBFuHU6NlGV6l6hp2GKJtWmW78twEkajpBKmTVhUoq7GOIPwB+a42hoCnsBV7NmfrPUn+16CuMdVJv1PNREcGI5FjoR6a12Y5fh1hk52AfzAcA1wC6sM84ouTagxy9kLW8EcKSCWDIQzI8A+zTH0fDUzcy4wneetKxoHSn08LnAxPY6X/FMchfMSxJj72gi2Bk3K+NK4G3cLB/Joa4bvHbtGY9Sad7zfGLsHSqDZJF/t7YQuKg5jr6Ruq3SfgR8EK2dkTfD/AvqWmGsiehrXK8SSE56yytxl2cfFsbRpsDngK8C2+g5nS8amlhfZ4HAqgySN4mxixNjrw2gBdgTt3WW5sQrjHPrhbk6aSf57i13JMZOHxgEH8CNLVvcCnSSYZpN0U0HQyWQeuDnLy8EWpvj6ILUXe33HWArNIShnnEOqAch9dhbXpoY+8sAmoFDgTm4TQ5EYSwiNQjllYmxjxbcrj574fZW1NWlCuNM0ts3qXtzje1MjJ3eRLAbLpinKJQVxlmzjUogjWKOmVRMjJ0zMAgOVCgrjLNmd5VAGs2sCZPSdUL5CTSmXFVdZ1Oo8M6IMI4OSIyd0igPeIe4tVAkbcKvdZCuWfOg0OUF+wPrvHjvV8KL+dR1elsv4taHBrevHIH7mPqvU60ZXbtQBubsELce2Em6KxDjrvDT8F0Vw3iWyvGeS4Gj8/4gWuKoyQdrU+qO9VBgvA/WbXGrgO3d6YK4iTW7Tgzq0j4q/e5ppX8BWOU7BKuAYhhHHf57zwJPA2/irjR7GugI3MUMqwKCVZoXXpnhC2B6SxztVoQPA7fhtglSKJdRAPO7fO6EcXQQ8GeV573e2qjE2Nezfkf9FvKDfOhuhpu2dChuM8ztfbAO8L3eelnlayUujFff3vZvqx/2H2cH/mfUwy5bOxucwunA93D7+EkZJMYG3YXxh4HHVJ73PJoYe0jGermDfegejOutHAOEwGB/05KKa15Ml/vQXr0E5YO4xduXBrDC7+wspYfysBS+C5yl9la5MN4BmK3yrGViYuykGgXvkNRthXUscJwfXhjmQ1dXTvavV70MeNeH9K9w22otCWCldnTpnTCORgD3sf65BOm9txNjt+oujFtwV+XIGkXgXxNj/1iFt4BDgI8BpwIfwm1OqV0dqnecl/rbFOAW4IEAljQRLJ9tJmm94G6MbmsNOtL0IODXuHMQUpq5ibE7rBfGPpDV6NbXCZwzJCj84tUJ1/W7PuPazguWpZ2DUze++yngTNxa0sPV481kQC8G2oCfAC8XYPlcbTqwbmdiSArfBL6M9tIsxUuJsbsqjEt/Yt4TwEl+G5xSG+vA1J30ML7BjsJ9rbd3+bLCh/MU3GLujxZgmcL5vfwYDzyEdprvrbXOS60bxu24E0LSvaW4Va+uHkCwpKe3rzu2TQxWpsUhqZs69hXgCGBz9XzrzkrcfOkHgR8F8FSBYFkj75sYxtF2uCmICuSN+9/E2JN6CuNZaPul3liOmx94H/Bb4Hnfe34fblqZAcagLdYbzTLckpU3ANcFsKgRZ22EcbQnbj64Zlts2C8TYz/XUxg/gps2JSL9UwQWAX8FvhHAtHZjlzZQIF+Mu3hKenZJYux7NVr3bbOmtomUR8G/VT8GOCaFJWEcvQhcHcDvBgWFZa+V4YRwViXGfjOMo08Du6kp9GhB1y/WDeM3VR+RihgO7AvcmsKyFWlxdhhH36zzYP46btqbdO+tdV+9FcYi1TUU2NUH85sr0uL0MI6OaI6joXXWO/4NME+Hu0czN9Qz1mJBIrUJ5sl+KOMp4NwAXmk3dmUdPL5nge10mLs1W2Eskk3DcSfQp6XwVhhHvwIubiJYlOPpcr8DjtKh7fadw1pXPBc21G0WkZrZCpgIzO8knR7G0ZHNcTQoh4/jbzqU3Vpv+KawoaQWkZobhLt46P4U5oVx9MMwjjYf2zYxL+sKL9Qh7NarGwzj1ZmsOolk0gjfW563PC1OCeNol5Y4yvpaEIN02Lr1Sm/CeIbqJJJpQ3BLV75QhNlhHB3lNxnI6n2VPobxK6qTSC4EuLVk7kshCePo/AyOKx+mw9St13oTxtNUJ5Hc2Qb4vh9XviqMo6yshX2MDk23ejVm/KLqJJJbI4ALyE4o761D0q3pvQnj51QnkdzbtNahHMbRacBIHYr1LEiMfWvdfwx6KKIWmRepL4uBSwK4rho7Zo9xa3q/BIxT6dfz58TYg3vTMwa3Pq+I1FdP+Wo/pvypSk+JW5kWr1AQ96jbfO0pjKeqXiJ1aUvgNj8lbvyYttayXzwSxtEBwP9TqXv0TClhrJ6xSH0Lgakr0/SJMI62LmMQ74Tbhkobk/ZsWilhPEX1Eql7AbAf0B7G0dXNcTS4n0H8Ud+RG67SbrDoU3o6GN0VdTPcRosi0jjeBE5qIniklFXimuNoUAq3AcehHc835pXE2HG9DmMfyNopujGkuP3ail0+T/3tbdzk9JWsmfL4FmtPWF9AaVdttrD2+ra7Apv5t7V7+4/j/cfVT+zVnwd6slfFXOCLAdzdFAQdsyesvwt6SxwNKLodz68CTsKdIJSNuykx9vTuvrGh69kf80WW/Or04br641TcMqmzgP/D7eDb4cN2GZAGbufrVRWc/tTrtU+a42gIUEjd+gZDfRgP92G9L24n8z2AnX1Irw5tBXb/tAC/SWHxqjR9K4yj53xbWYzbAX180b2gbo3Ghkv1VE/f2FAY/1VhnKuwfRd4ssvteR+wywNY1m7ssrw9uHZjl/tP191V+UXgjjW9tNZCkXSYD+xhwBjgEOBQ3II6g3xoDFCTKcmm/jYGMCpHWfy9p29saJjig2hh6KwMI3T62xLgYeBRf3sDWBrA0i7BJev3sIembihkCx/OE3BrJgz2Aa2etFRFYmxQchj7QNaVeNXv6a7yoXsPEK9+exjAojz2brPMn6jeDDdWbYBP+t61Aloq4cnE2P37MkyBf7v7AdWwIlb58H0a+BPwG9/TXZgYu0TlqUovZRGwCHfC6g/AOT6gtwT+BTjbfxyAxkal//60oW8O6MV/VhiXr8c7FWgDfg0sCmBhu7ErVJ5MBvRM4DY/bWtr3AnDs4GPsWYMWqQUj2/omxsbpjgSuF81LMnqE2oLgBt8j+u1AN5W8OZfl3A+GPhP4P3AwI09l0SALRJj3+lrGA/GTXWSDUtxGy9eBtyFWyJPF800gDDbsT6OAAAO60lEQVSONgW2B84DTsPN5lCvWdY1LTF2zz73jH1jexJ3yaR0723gmAI8OdfYTpWjoXvNA1K3fu+JwH/h5uIqmAXgmsTY8zf0A72ZdzlZYdyjR4F/S4x9V6WQdmNXAe3ANcA1YRxth5tCdwnualYFc+O6d2M/0Jue8cHAI6rleh4J4IhqLNQt+eeD+UTgUtxlxJo611iGJhu5FiDoZUNapVf1tbwSwG6+JyTSazvErYVO0lHAObhx5mGqSt17LDH2Ixv7od6+Ot+jeq7lRAWx9MUcM6mYGDszMfaiwM3KOAD4C24GjtSntt78UG+v1b8bdwmpwF8SY59WGaS//BWVTwAH+WGMTwKXA5uoOnXlvt78UG97xrHq+R6rEki5JcbOS4y9NoCtfG/5Wdycdcm31xNjnytbGCfGzqOHrUIaTEehy2phIhXoLa9MjH0iMXY8sCPwczSEkWd39vYHSzmje4vqSvtcY9VbkWr1lmcnxp6Jm7v8JdySqJIv9/b2BwuV+KV1TCftpBah/FZi7LU+lD+FWztDsm9pYmyvl5MolNAgnsEtniIitQnlxYmxdwTuyr7DcXvWSXb9upQfLnXi+e0NXtwRal9Sa+3GLkuMfTBwa2J8VKGcWb8t5YdLWmkqjKPxuPV3G9lWibFvN+IDHxW3BgBFCNx2eWvaUdq7xpau/XWQBpASQHebXkrv+DUxDsYtUrWZKpIJnU0Eg0rZZbvkZf/COJoJjG7gIl+VGPuVPD+AHdsmBp1pGhRJg9S1gQAYkLrlILfCncXfFbf55z7++wNxG4OC2w2j6xWZg/33N2YZa88MWP11itvdpIjbhbrDf3wbmBG4aV6dLsyDtBBQVHh3G8pDU7djyc/9sZPa+Vli7NkV6xn7ML4UuLiBizwrMXZM1nuwRdKC77EOSt22QuNxCz7thtvJYrB/wm7Cmr3gsqwDWIHbePVd3E7Fz+J2250auNsqCNJBQVB8dcJ1DRvWfreSc3EXkAxEauFfSzl519cw3g2Y3uCFvjAx9js1Ddy21qCYpoXUBe5o4CDcjsjj/VvVTXA7+zbS2gdLfEi/jZsX/zDwUAAvBQTFuSW8ZayTUN4at4LcZ9Di99W0IDF2y1L/U9DHgzzVv31tVB3AuMTY2VUM3QEpHOgD9yBgrA/bLXDbAEnPluMW/5+Pu/z4zgAeDQg6GiGgwzjaCbc+wu5qClWx0bWLyxnG5wI/bvCCLwLeV85AHhW3FoqkhSJsg5tPegiwJ27JxRE5GErI2wvqW8A83NordxRg+oAgKM6sw/Fov1rcIcDv0Em+ShufGPtstcJ4OG7crtEtAY4dGhQefKXEMUofvEERdsKddDketwD5SNwJMqnNC2yC21Dh5wX4R72Fs3/uXgh8XUMXFfFCYmyf3oEE/TiovwZOUO0pAn8GThpA8MZss/4Td2zbxGBlmhaKpJvhVub6d2BnBW8uwrkdN2XsuiaCf86pk2GNMI72wo2pb6XDXFbnJcZeV+0wPhR4SLV/TwrMAqYCf+zy7wcC+/vgVcPPt3n++F5XgD/mfc/DMI62BZ7HDYtJeWySGLukqmHsD+ZMGnvOsTR2r/lV4LoAbhkSFDpeyeF0On9y73nWzCGXvrs5Mfa0vv7n/u7Dda3qLw1qM9w0wp+n8M6ytPhsGEf/0RxHuZrZkhj7Cm7DVOm/n/TnP/e3Z7wVui5eZN0e8wzga00Ek/MwxtwSR01FmItbgEj65qXE2F378wv61TNOjH0LuFnHQWStHvO+wL2dpPPDOLojjKNwTFtrZmcu+LFvnf/pnyv7+wvKsV24hipEurc1cBLQvjJNXwjj6KzmOMrqXPGrdLj6bGlQhs03yvJqHcbR33H7donIhi3AzbY5a1hQWDwjIyf9xrZNDJanxWW4dUqkNN9JjL0wCz3jsnTRRRrECN9bXrA0LT4dxtH+WRjC8K8IK3R4+uT75fglZQnjxNi7cHMwRaT3z729gSkr0/TlMI5OHp3hcWXp0W2JsfMzE8bepTouIn2yE3BLR5q2h3H05ZY4aqr2HSi6vrGGKEp3dTlfncsicAtaL9WxEemz7YGrizC32qHckab7KoxLNjkx9qnMhXG7sR3Af+v4iPTbdjUI5S+o7CUr67myQpnv3A2sva2OiJQnlM+t1B/xY9XHqtwlmZIYW9a52WUN48TYRcC3dZxEyh7KPw7j6LUwjo4s9y/vSNNvoUWsSvXVcv/Csp+99ftvvc3aG1aKSPk8BxyfGPtqGZ6vuwL/h/bKK7VX/MFy/9JyD1OodyxSee8HXg7j6O7mOOrzHod+ofnHFMS17xVXpGes3rFIVS0BLi3A1XONLZbwHN0Ht7i8tmDKQK+4Ij3jLr3jC3XcRCpuOPCdIkwP4+hjvekNh3F0G/Ckgjg7veKK9YwBmuNoUOp25NW2QiLV8xrwIHA7MMffdgMOx+2zuB/aTbyvJifGHpW7MPavwmcCP9MxFJE60Kddn3urUMl7XoBfArN1DEUk526rZBBXPIz9otWRjqOI5Nx/VvoPFCr9BxJj78ZtZS8ikkffSox9Pfdh7J2j4ykiObQsgMur8YeqEsaJsdOBn+q4ikjOnNVu7PK6CWPvQrSIkIjkx5TE2Fur9ceqFsaJse+gZfpEJD/OreYfq2bPmCaCG4CndIxFJOOuTYx9um7DeI6ZVATO0nEWkQxbGFTwsudMhDGAf7W5VsdbRDLqc+3GVn0LuUItHmkAXwHm65iLSMbc43e7r7qahLGfKvJZHXcRyZBO4PRa/fFCrf5wYuy9wE06/iKSEZ9PjH2z4cIYIIDP45bZFBGppccSY2u6wmRNw9gPkn9G7UBEaqgTOKHWd6JQ6zvghyt+ofYgIjXy2cTYfzZ8GAME0IpmV4hI9d2VGHtzFu5IJsK43dhlwDFqFyJSRQuB/8jKnSlk5Y4kxk6lBle9iEjDOiExdoHCuBtNBFcBj6uNiEiFXZUY+2CW7lCmwtivXXEssExtRUQqZGoAX8/anSpk7Q4lxr4BTFB7EZEKKALHtBu7SmHcu0B+APiW2o2IlNnRibGZnLlVyGrFCgQXAw+o7YhImVyeGDs5u5mXUXPd+PEJ6HJpEem/BwoE38jyHQyyXsEwjnYHpqktiUgfzQd2ToxdnOU7Wch6Ff3O0ierPYlIH3QCh2Q9iHMRxj6QfwV8V+1KREp0YmLsi3m4o4W8VLQAFwH3qG2JSC99vVa7dvRFkKfKNsfR0BSeA8apnYnIBtySGHtqnu5wIU931i8odBCaYSEiPXs4yNACQHXZM14tjKO9gGeAJrU7EeniZeCAxNjcddgKeax2YuzzwNFqdyLSxULg8DwGcW7D2AfyH4HT1P5EBDeF7SOJsXPy+gAKea6+X6H/fLVDkYb3Uf+OObdyP+a6+LYn/rbppw8YDHxE7VGkIR3jFxfLtUI9HInE2K8CP1ebFGk4Z/lNjXOvUC9HpADnALeobYo0jM8nxt5QLw8mqKcj0xJHTUW4EThF7VSk7oP4J/X0gIJ6O0IKZBEFscJYgSwiCmKFsQJZREGsMFYgi4iCuM8K9fzg5hrbWYAzgB+oLYvk1ln1HsR13zPuKoyjK3BrIotIfhxTL/OIFcZrB/K5wI/VvkUyrxM4NDH2sUZ5wEGjHeEwjk4E7lRbF8mshbhFf55vpAcdNOKRDuPoYOBBtB6ySNa8jFsGc06jPfBCIx7txNhHgT3RjiEiWfIwbmH4OY344AuNetT9jrHjgH/oOSBSc7cEcFReF4Yvh6DRW0BzHA1J4ZfAp/R8EKmJryfGfqvRixCoHcDottagI00vBi5RNUSqphM4MTH2LpVCYbyWMI4M8Ft0Yk+k0uYDh/jhQqGBx4y7kxgbA7sDs1UNkYp5ANhZQaww3lggvwzsAeitk0j5XV4gODIxdrFKsTYNU/RgTFtrsDJNzweuVjVE+q0IHJ0YO1mlUBj3SRhH+wOTgS1UDZE+mYpbY2K+StEzDVNsRGLsE8Ao4B5VQ6Rk3wrggwpi9YzL3Us+B/iJKiGyUQuBExJjH1QpFMaVCuSdcdPf9lI1RLp1F3BaYuy7KoXCuKL8DiJXABeoGiLv6QQ+mxh7s0qhMK52L3lf3wsYpWpIg3sMOD4x9k2VQmFcE81xNDCFy9VLlgbuDZ+dGPsLlUJhnJVe8n64zU81liyN4h7gdPWGFcaZ48eSvwx8R9WQOrYQ+JwW+FEY56GX3Az8D3C4qiF15toAvtpu7FKVQmGcp1A2wPXASFVDcm4KcEZi7HSVQmGcS81xNCh1J/cuUzUkhxYCrYmxt6oUCuN66SVvj1t06NOqhuTEZQFc3m7sSpVCYVyPofwBwAIHqBqSUbcB52s9CYVxo4Tyx4HvAzurGpIRk4ELEmOfVSkUxo0YyqcA3wW2UzWkRqYAX02MfUClUBg3tJa4tVAkPQP4lkJZFMIKY1Eoi0JYFMayTigfj1sZbhdVRMpkMnBlYuxDKoXCWEoUxtHRwMXAgaqG9NFtwNWJsU+pFApj6X8o7wd8EThV1ZBeWApMAr6vKWoKY6lMKG8FnIW7qm+EKiLreAH4TgC3tBvboXIojKU6wXwccB5wmKrR8G4GfpIY+1eVQmEstQvlFuBM4Bw0C6PResHXALckxi5RORTGkq1gPgo4BbcGRpMqUncW4JZnvVFXyimMJQda4mhAET4BnAx8XBXJtaXArcBvEmPvVzkUxpLf3vJQ4FgFswJYFMaSrWA+EviMD+ZhqkpmzAR+D9yTGDtZ5VAYS2OF84GA8T3nPVSRqnsAaAPuT4x9QeVQGIsQxtEI4Ajgo773vKOqUnbTfPg+ODAI/jhrwqRUJRGFsWwsnEcCh/hw/oh6zn3yF+DPwMPA3xJj31FJRGEs/Q3nwbg1Mj4IfBj4ABCqMu95xYfvX4GpibFPqCSiMJZqBfSmwL7A+4H9gD19D7qeTwwuAJ73t78D0xS8ojCWrIZ0CzDW33YFdurydR7W1EiAV7u5PZsY+66OsCiMpV7CehQwGhiFG+oY7j/fCtgCd1n3MH/bskzhWgTm4ebwzgI6/Mf5wFvA68DMxNh2HSFRGIv0oDmOBqYwspc/nipURURERERE8ub/A7TVqErkqJ7CAAAAAElFTkSuQmCC",pe="30%",ve=" Radio ",ge="#000000BB",fe="2.0rem",Ae="#2196F3",ye=a`
  .list {
    --mdc-theme-primary: var(--accent-color);
    --mdc-list-vertical-padding: 0px;
    overflow: hidden;
  }
`,be='Preset info copied to clipboard; please edit the card configuration (via show code editor) and paste copied text under the "userPresets:" key.',Ce="Preset JSON copied to clipboard; please edit the userPresets.json file and paste the copied text at the desired position.  Be sure to remove ending comma if last (or only) entry in the file.",Se="Function requires Spotify Premium.";function we(e,t,i,s){var r,o=arguments.length,a=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(a=(o<3?r(a):o>3?r(t,i,a):r(t,i))||a);return o>3&&a&&Object.defineProperty(t,i,a),a}function Ie(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}"function"==typeof SuppressedError&&SuppressedError;var Te,ke,_e={exports:{}};function Ee(){if(ke)return Te;ke=1;var e=1e3,t=60*e,i=60*t,s=24*i,r=7*s,o=365.25*s;function a(e,t,i,s){var r=t>=1.5*i;return Math.round(e/i)+" "+s+(r?"s":"")}return Te=function(n,l){l=l||{};var d=typeof n;if("string"===d&&n.length>0)return function(a){if((a=String(a)).length>100)return;var n=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(a);if(!n)return;var l=parseFloat(n[1]);switch((n[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return l*o;case"weeks":case"week":case"w":return l*r;case"days":case"day":case"d":return l*s;case"hours":case"hour":case"hrs":case"hr":case"h":return l*i;case"minutes":case"minute":case"mins":case"min":case"m":return l*t;case"seconds":case"second":case"secs":case"sec":case"s":return l*e;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return l;default:return}}(n);if("number"===d&&isFinite(n))return l.long?function(r){var o=Math.abs(r);if(o>=s)return a(r,o,s,"day");if(o>=i)return a(r,o,i,"hour");if(o>=t)return a(r,o,t,"minute");if(o>=e)return a(r,o,e,"second");return r+" ms"}(n):function(r){var o=Math.abs(r);if(o>=s)return Math.round(r/s)+"d";if(o>=i)return Math.round(r/i)+"h";if(o>=t)return Math.round(r/t)+"m";if(o>=e)return Math.round(r/e)+"s";return r+"ms"}(n);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(n))},Te}var $e=function(e){function t(e){let s,r,o,a=null;function n(...e){if(!n.enabled)return;const i=n,r=Number(new Date),o=r-(s||r);i.diff=o,i.prev=s,i.curr=r,s=r,e[0]=t.coerce(e[0]),"string"!=typeof e[0]&&e.unshift("%O");let a=0;e[0]=e[0].replace(/%([a-zA-Z%])/g,((s,r)=>{if("%%"===s)return"%";a++;const o=t.formatters[r];if("function"==typeof o){const t=e[a];s=o.call(i,t),e.splice(a,1),a--}return s})),t.formatArgs.call(i,e);(i.log||t.log).apply(i,e)}return n.namespace=e,n.useColors=t.useColors(),n.color=t.selectColor(e),n.extend=i,n.destroy=t.destroy,Object.defineProperty(n,"enabled",{enumerable:!0,configurable:!1,get:()=>null!==a?a:(r!==t.namespaces&&(r=t.namespaces,o=t.enabled(e)),o),set:e=>{a=e}}),"function"==typeof t.init&&t.init(n),n}function i(e,i){const s=t(this.namespace+(void 0===i?":":i)+e);return s.log=this.log,s}function s(e){return e.toString().substring(2,e.toString().length-2).replace(/\.\*\?$/,"*")}return t.debug=t,t.default=t,t.coerce=function(e){if(e instanceof Error)return e.stack||e.message;return e},t.disable=function(){const e=[...t.names.map(s),...t.skips.map(s).map((e=>"-"+e))].join(",");return t.enable(""),e},t.enable=function(e){let i;t.save(e),t.namespaces=e,t.names=[],t.skips=[];const s=("string"==typeof e?e:"").split(/[\s,]+/),r=s.length;for(i=0;i<r;i++)s[i]&&("-"===(e=s[i].replace(/\*/g,".*?"))[0]?t.skips.push(new RegExp("^"+e.slice(1)+"$")):t.names.push(new RegExp("^"+e+"$")))},t.enabled=function(e){if("*"===e[e.length-1])return!0;let i,s;for(i=0,s=t.skips.length;i<s;i++)if(t.skips[i].test(e))return!1;for(i=0,s=t.names.length;i<s;i++)if(t.names[i].test(e))return!0;return!1},t.humanize=Ee(),t.destroy=function(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")},Object.keys(e).forEach((i=>{t[i]=e[i]})),t.names=[],t.skips=[],t.formatters={},t.selectColor=function(e){let i=0;for(let t=0;t<e.length;t++)i=(i<<5)-i+e.charCodeAt(t),i|=0;return t.colors[Math.abs(i)%t.colors.length]},t.enable(t.load()),t};!function(e,t){t.formatArgs=function(t){if(t[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+t[0]+(this.useColors?"%c ":" ")+"+"+e.exports.humanize(this.diff),!this.useColors)return;const i="color: "+this.color;t.splice(1,0,i,"color: inherit");let s=0,r=0;t[0].replace(/%[a-zA-Z%]/g,(e=>{"%%"!==e&&(s++,"%c"===e&&(r=s))})),t.splice(r,0,i)},t.save=function(e){try{e?t.storage.setItem("debug",e):t.storage.removeItem("debug")}catch(e){}},t.load=function(){let e;try{e=t.storage.getItem("debug")}catch(e){}!e&&"undefined"!=typeof process&&"env"in process&&(e=process.env.DEBUG);return e},t.useColors=function(){if("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))return!0;if("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))return!1;let e;return"undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&(e=navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/))&&parseInt(e[1],10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)},t.storage=function(){try{return localStorage}catch(e){}}(),t.destroy=(()=>{let e=!1;return()=>{e||(e=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),t.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],t.log=console.debug||console.log||(()=>{}),e.exports=$e(t);const{formatters:i}=e.exports;i.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}}(_e,_e.exports);var Pe=Ie(_e.exports);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Fe=1;class Le{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Re="important",Oe=" !"+Re,Me=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends Le{constructor(e){var t;if(super(e),e.type!==Fe||"style"!==e.name||(null===(t=e.strings)||void 0===t?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce(((t,i)=>{const s=e[i];return null==s?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`}),"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ht){this.ht=new Set;for(const e in t)this.ht.add(e);return this.render(t)}this.ht.forEach((e=>{null==t[e]&&(this.ht.delete(e),e.includes("-")?i.removeProperty(e):i[e]="")}));for(const e in t){const s=t[e];if(null!=s){this.ht.add(e);const t="string"==typeof s&&s.endsWith(Oe);e.includes("-")||t?i.setProperty(e,t?s.slice(0,-11):s,t?Re:""):i[e]=s}}return U}}),xe=e=>t=>"function"==typeof t?((e,t)=>(customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:i,elements:s}=t;return{kind:i,elements:s,finisher(t){customElements.define(e,t)}}})(e,t)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,Be=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(i){i.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}},He=(e,t,i)=>{t.constructor.createProperty(i,e)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ue(e){return(t,i)=>void 0!==i?He(e,t,i):Be(e,t)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function Ve(e){return Ue({...e,state:!0})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const De=({finisher:e,descriptor:t})=>(i,s)=>{var r;if(void 0===s){const s=null!==(r=i.originalKey)&&void 0!==r?r:i.key,o=null!=t?{kind:"method",placement:"prototype",key:s,descriptor:t(i.key)}:{...i,key:s};return null!=e&&(o.finisher=function(t){e(t,s)}),o}{const r=i.constructor;void 0!==t&&Object.defineProperty(i,s,t(s)),null==e||e(r,s)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ne(e,t){return De({descriptor:i=>{const s={get(){var t,i;return null!==(i=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(e))&&void 0!==i?i:null},enumerable:!0,configurable:!0};if(t){const t="symbol"==typeof i?Symbol():"__"+i;s.get=function(){var i,s;return void 0===this[t]&&(this[t]=null!==(s=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(e))&&void 0!==s?s:null),this[t]}}return s}})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var qe;null===(qe=window.HTMLSlotElement)||void 0===qe||qe.prototype.assignedElements;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ge=(e,t,i)=>{for(const i of t)if(i[0]===e)return(0,i[1])();return null==i?void 0:i()};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Je(e,t,i){return e?t():null==i?void 0:i()}const We=[];for(let e=0;e<256;++e)We.push((e+256).toString(16).slice(1));let Ye;const ze=new Uint8Array(16);var je={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};function Ke(e,t,i){if(je.randomUUID&&!t&&!e)return je.randomUUID();const s=(e=e||{}).random??e.rng?.()??function(){if(!Ye){if("undefined"==typeof crypto||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");Ye=crypto.getRandomValues.bind(crypto)}return Ye(ze)}();if(s.length<16)throw new Error("Random bytes length must be >= 16");if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,t){if((i=i||0)<0||i+16>t.length)throw new RangeError(`UUID byte range ${i}:${i+15} is out of buffer bounds`);for(let e=0;e<16;++e)t[i+e]=s[e];return t}return function(e,t=0){return(We[e[t+0]]+We[e[t+1]]+We[e[t+2]]+We[e[t+3]]+"-"+We[e[t+4]]+We[e[t+5]]+"-"+We[e[t+6]]+We[e[t+7]]+"-"+We[e[t+8]]+We[e[t+9]]+"-"+We[e[t+10]]+We[e[t+11]]+We[e[t+12]]+We[e[t+13]]+We[e[t+14]]+We[e[t+15]]).toLowerCase()}(s)}var Ze,Xe={exports:{}};window,Ze=function(){return function(e){var t={};function i(s){if(t[s])return t[s].exports;var r=t[s]={i:s,l:!1,exports:{}};return e[s].call(r.exports,r,r.exports,i),r.l=!0,r.exports}return i.m=e,i.c=t,i.d=function(e,t,s){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(s,r,function(t){return e[t]}.bind(null,r));return s},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=10)}([function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0}),t.assignDeep=t.mapValues=void 0,t.mapValues=function(e,t){var i={};for(var s in e)if(e.hasOwnProperty(s)){var r=e[s];i[s]=t(r)}return i},t.assignDeep=function e(t){for(var i=[],s=1;s<arguments.length;s++)i[s-1]=arguments[s];return i.forEach((function(i){if(i)for(var s in i)if(i.hasOwnProperty(s)){var r=i[s];Array.isArray(r)?t[s]=r.slice(0):"object"==typeof r?(t[s]||(t[s]={}),e(t[s],r)):t[s]=r}})),t}},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=i(7),o=s(i(8)),a=i(0),n=function(){function e(t,i){this._src=t,this.opts=a.assignDeep({},e.DefaultOpts,i)}return e.use=function(e){this._pipeline=e},e.from=function(e){return new o.default(e)},Object.defineProperty(e.prototype,"result",{get:function(){return this._result},enumerable:!1,configurable:!0}),e.prototype._process=function(t,i){this.opts.quantizer,t.scaleDown(this.opts);var s=r.buildProcessOptions(this.opts,i);return e._pipeline.process(t.getImageData(),s)},e.prototype.palette=function(){return this.swatches()},e.prototype.swatches=function(){throw new Error("Method deprecated. Use `Vibrant.result.palettes[name]` instead")},e.prototype.getPalette=function(){var e=this,t=arguments[0],i="string"==typeof t?t:"default",s="string"==typeof t?arguments[1]:t,r=new this.opts.ImageClass;return r.load(this._src).then((function(t){return e._process(t,{generators:[i]})})).then((function(t){return e._result=t,t.palettes[i]})).then((function(e){return r.remove(),s&&s(void 0,e),e})).catch((function(e){return r.remove(),s&&s(e),Promise.reject(e)}))},e.prototype.getPalettes=function(){var e=this,t=arguments[0],i=arguments[1],s=Array.isArray(t)?t:["*"],r=Array.isArray(t)?i:t,o=new this.opts.ImageClass;return o.load(this._src).then((function(t){return e._process(t,{generators:s})})).then((function(t){return e._result=t,t.palettes})).then((function(e){return o.remove(),r&&r(void 0,e),e})).catch((function(e){return o.remove(),r&&r(e),Promise.reject(e)}))},e.DefaultOpts={colorCount:64,quality:5,filters:[]},e}();t.default=n},function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0}),t.applyFilters=t.ImageBase=void 0;var s=function(){function e(){}return e.prototype.scaleDown=function(e){var t=this.getWidth(),i=this.getHeight(),s=1;if(e.maxDimension>0){var r=Math.max(t,i);r>e.maxDimension&&(s=e.maxDimension/r)}else s=1/e.quality;s<1&&this.resize(t*s,i*s,s)},e}();t.ImageBase=s,t.applyFilters=function(e,t){if(t.length>0)for(var i=e.data,s=i.length/4,r=void 0,o=void 0,a=void 0,n=void 0,l=void 0,d=0;d<s;d++){o=i[0+(r=4*d)],a=i[r+1],n=i[r+2],l=i[r+3];for(var c=0;c<t.length;c++)if(!t[c](o,a,n,l)){i[r+3]=0;break}}return e}},function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0}),t.Swatch=void 0;var s=i(4),r=function(){function e(e,t){this._rgb=e,this._population=t}return e.applyFilters=function(e,t){return t.length>0?e.filter((function(e){for(var i=e.r,s=e.g,r=e.b,o=0;o<t.length;o++)if(!t[o](i,s,r,255))return!1;return!0})):e},e.clone=function(t){return new e(t._rgb,t._population)},Object.defineProperty(e.prototype,"r",{get:function(){return this._rgb[0]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"g",{get:function(){return this._rgb[1]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"b",{get:function(){return this._rgb[2]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"rgb",{get:function(){return this._rgb},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"hsl",{get:function(){if(!this._hsl){var e=this._rgb,t=e[0],i=e[1],r=e[2];this._hsl=s.rgbToHsl(t,i,r)}return this._hsl},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"hex",{get:function(){if(!this._hex){var e=this._rgb,t=e[0],i=e[1],r=e[2];this._hex=s.rgbToHex(t,i,r)}return this._hex},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"population",{get:function(){return this._population},enumerable:!1,configurable:!0}),e.prototype.toJSON=function(){return{rgb:this.rgb,population:this.population}},e.prototype.getRgb=function(){return this._rgb},e.prototype.getHsl=function(){return this.hsl},e.prototype.getPopulation=function(){return this._population},e.prototype.getHex=function(){return this.hex},e.prototype.getYiq=function(){if(!this._yiq){var e=this._rgb;this._yiq=(299*e[0]+587*e[1]+114*e[2])/1e3}return this._yiq},Object.defineProperty(e.prototype,"titleTextColor",{get:function(){return this._titleTextColor&&(this._titleTextColor=this.getYiq()<200?"#fff":"#000"),this._titleTextColor},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"bodyTextColor",{get:function(){return this._bodyTextColor&&(this._bodyTextColor=this.getYiq()<150?"#fff":"#000"),this._bodyTextColor},enumerable:!1,configurable:!0}),e.prototype.getTitleTextColor=function(){return this.titleTextColor},e.prototype.getBodyTextColor=function(){return this.bodyTextColor},e}();t.Swatch=r},function(e,t,i){function s(e){var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);if(!t)throw new RangeError("'"+e+"' is not a valid hex color");return[t[1],t[2],t[3]].map((function(e){return parseInt(e,16)}))}function r(e,t,i){return t/=255,i/=255,e=(e/=255)>.04045?Math.pow((e+.005)/1.055,2.4):e/12.92,t=t>.04045?Math.pow((t+.005)/1.055,2.4):t/12.92,i=i>.04045?Math.pow((i+.005)/1.055,2.4):i/12.92,[.4124*(e*=100)+.3576*(t*=100)+.1805*(i*=100),.2126*e+.7152*t+.0722*i,.0193*e+.1192*t+.9505*i]}function o(e,t,i){return t/=100,i/=108.883,e=(e/=95.047)>.008856?Math.pow(e,1/3):7.787*e+16/116,[116*(t=t>.008856?Math.pow(t,1/3):7.787*t+16/116)-16,500*(e-t),200*(t-(i=i>.008856?Math.pow(i,1/3):7.787*i+16/116))]}function a(e,t,i){var s=r(e,t,i);return o(s[0],s[1],s[2])}function n(e,t){var i=e[0],s=e[1],r=e[2],o=t[0],a=t[1],n=t[2],l=i-o,d=s-a,c=r-n,h=Math.sqrt(s*s+r*r),u=o-i,m=Math.sqrt(a*a+n*n)-h,p=Math.sqrt(l*l+d*d+c*c),v=Math.sqrt(p)>Math.sqrt(Math.abs(u))+Math.sqrt(Math.abs(m))?Math.sqrt(p*p-u*u-m*m):0;return u/=1,m/=1*(1+.045*h),v/=1*(1+.015*h),Math.sqrt(u*u+m*m+v*v)}function l(e,t){return n(a.apply(void 0,e),a.apply(void 0,t))}Object.defineProperty(t,"__esModule",{value:!0}),t.getColorDiffStatus=t.hexDiff=t.rgbDiff=t.deltaE94=t.rgbToCIELab=t.xyzToCIELab=t.rgbToXyz=t.hslToRgb=t.rgbToHsl=t.rgbToHex=t.hexToRgb=t.DELTAE94_DIFF_STATUS=void 0,t.DELTAE94_DIFF_STATUS={NA:0,PERFECT:1,CLOSE:2,GOOD:10,SIMILAR:50},t.hexToRgb=s,t.rgbToHex=function(e,t,i){return"#"+((1<<24)+(e<<16)+(t<<8)+i).toString(16).slice(1,7)},t.rgbToHsl=function(e,t,i){e/=255,t/=255,i/=255;var s=Math.max(e,t,i),r=Math.min(e,t,i),o=0,a=0,n=(s+r)/2;if(s!==r){var l=s-r;switch(a=n>.5?l/(2-s-r):l/(s+r),s){case e:o=(t-i)/l+(t<i?6:0);break;case t:o=(i-e)/l+2;break;case i:o=(e-t)/l+4}o/=6}return[o,a,n]},t.hslToRgb=function(e,t,i){var s,r,o;function a(e,t,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?e+6*(t-e)*i:i<.5?t:i<2/3?e+(t-e)*(2/3-i)*6:e}if(0===t)s=r=o=i;else{var n=i<.5?i*(1+t):i+t-i*t,l=2*i-n;s=a(l,n,e+1/3),r=a(l,n,e),o=a(l,n,e-1/3)}return[255*s,255*r,255*o]},t.rgbToXyz=r,t.xyzToCIELab=o,t.rgbToCIELab=a,t.deltaE94=n,t.rgbDiff=l,t.hexDiff=function(e,t){return l(s(e),s(t))},t.getColorDiffStatus=function(e){return e<t.DELTAE94_DIFF_STATUS.NA?"N/A":e<=t.DELTAE94_DIFF_STATUS.PERFECT?"Perfect":e<=t.DELTAE94_DIFF_STATUS.CLOSE?"Close":e<=t.DELTAE94_DIFF_STATUS.GOOD?"Good":e<t.DELTAE94_DIFF_STATUS.SIMILAR?"Similar":"Wrong"}},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},r=s(i(6)),o=s(i(9));r.default.DefaultOpts.ImageClass=o.default,e.exports=r.default},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=s(i(1));r.default.DefaultOpts.quantizer="mmcq",r.default.DefaultOpts.generators=["default"],r.default.DefaultOpts.filters=["default"],t.default=r.default},function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0}),t.buildProcessOptions=void 0;var s=i(0);t.buildProcessOptions=function(e,t){var i=e.colorCount,r=e.quantizer,o=e.generators,a=e.filters,n={colorCount:i},l="string"==typeof r?{name:r,options:{}}:r;return l.options=s.assignDeep({},n,l.options),s.assignDeep({},{quantizer:l,generators:o,filters:a},t)}},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=s(i(1)),o=i(0),a=function(){function e(e,t){void 0===t&&(t={}),this._src=e,this._opts=o.assignDeep({},r.default.DefaultOpts,t)}return e.prototype.maxColorCount=function(e){return this._opts.colorCount=e,this},e.prototype.maxDimension=function(e){return this._opts.maxDimension=e,this},e.prototype.addFilter=function(e){return this._opts.filters?this._opts.filters.push(e):this._opts.filters=[e],this},e.prototype.removeFilter=function(e){if(this._opts.filters){var t=this._opts.filters.indexOf(e);t>0&&this._opts.filters.splice(t)}return this},e.prototype.clearFilters=function(){return this._opts.filters=[],this},e.prototype.quality=function(e){return this._opts.quality=e,this},e.prototype.useImageClass=function(e){return this._opts.ImageClass=e,this},e.prototype.useGenerator=function(e,t){return this._opts.generators||(this._opts.generators=[]),this._opts.generators.push(t?{name:e,options:t}:e),this},e.prototype.useQuantizer=function(e,t){return this._opts.quantizer=t?{name:e,options:t}:e,this},e.prototype.build=function(){return new r.default(this._src,this._opts)},e.prototype.getPalette=function(e){return this.build().getPalette(e)},e.prototype.getSwatches=function(e){return this.build().getPalette(e)},e}();t.default=a},function(e,t,i){var s,r=this&&this.__extends||(s=function(e,t){return s=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var i in t)t.hasOwnProperty(i)&&(e[i]=t[i])},s(e,t)},function(e,t){function i(){this.constructor=e}s(e,t),e.prototype=null===t?Object.create(t):(i.prototype=t.prototype,new i)});Object.defineProperty(t,"__esModule",{value:!0});var o=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return r(t,e),t.prototype._initCanvas=function(){var e=this.image,t=this._canvas=document.createElement("canvas"),i=t.getContext("2d");if(!i)throw new ReferenceError("Failed to create canvas context");this._context=i,t.className="@vibrant/canvas",t.style.display="none",this._width=t.width=e.width,this._height=t.height=e.height,i.drawImage(e,0,0),document.body.appendChild(t)},t.prototype.load=function(e){var t,i,s=this;if("string"==typeof e)t=document.createElement("img"),function(e){var t=new URL(e,location.href);return t.protocol===location.protocol&&t.host===location.host&&t.port===location.port}(i=e)||function(e,t){var i=new URL(e),s=new URL(t);return i.protocol===s.protocol&&i.hostname===s.hostname&&i.port===s.port}(window.location.href,i)||(t.crossOrigin="anonymous"),t.src=i;else{if(!(e instanceof HTMLImageElement))return Promise.reject(new Error("Cannot load buffer as an image in browser"));t=e,i=e.src}return this.image=t,new Promise((function(e,r){var o=function(){s._initCanvas(),e(s)};t.complete?o():(t.onload=o,t.onerror=function(e){return r(new Error("Fail to load image: "+i))})}))},t.prototype.clear=function(){this._context.clearRect(0,0,this._width,this._height)},t.prototype.update=function(e){this._context.putImageData(e,0,0)},t.prototype.getWidth=function(){return this._width},t.prototype.getHeight=function(){return this._height},t.prototype.resize=function(e,t,i){var s=this,r=s._canvas,o=s._context,a=s.image;this._width=r.width=e,this._height=r.height=t,o.scale(i,i),o.drawImage(a,0,0)},t.prototype.getPixelCount=function(){return this._width*this._height},t.prototype.getImageData=function(){return this._context.getImageData(0,0,this._width,this._height)},t.prototype.remove=function(){this._canvas&&this._canvas.parentNode&&this._canvas.parentNode.removeChild(this._canvas)},t}(i(2).ImageBase);t.default=o},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},r=i(5),o=s(i(11));r.use(o.default),e.exports=r},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=s(i(12)),o=s(i(16)),a=(new(i(17).BasicPipeline)).filter.register("default",(function(e,t,i,s){return s>=125&&!(e>250&&t>250&&i>250)})).quantizer.register("mmcq",r.default).generator.register("default",o.default);t.default=a},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=i(3),o=s(i(13)),a=s(i(15));function n(e,t){for(var i=e.size();e.size()<t;){var s=e.pop();if(!(s&&s.count()>0))break;var r=s.split(),o=r[0],a=r[1];if(e.push(o),a&&a.count()>0&&e.push(a),e.size()===i)break;i=e.size()}}t.default=function(e,t){if(0===e.length||t.colorCount<2||t.colorCount>256)throw new Error("Wrong MMCQ parameters");var i=o.default.build(e);i.histogram.colorCount;var s=new a.default((function(e,t){return e.count()-t.count()}));s.push(i),n(s,.75*t.colorCount);var l=new a.default((function(e,t){return e.count()*e.volume()-t.count()*t.volume()}));return l.contents=s.contents,n(l,t.colorCount-l.size()),function(e){for(var t=[];e.size();){var i=e.pop(),s=i.avg();s[0],s[1],s[2],t.push(new r.Swatch(s,i.count()))}return t}(l)}},function(e,t,i){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=s(i(14)),o=function(){function e(e,t,i,s,r,o,a){this.histogram=a,this._volume=-1,this._count=-1,this.dimension={r1:e,r2:t,g1:i,g2:s,b1:r,b2:o}}return e.build=function(t){var i=new r.default(t,{sigBits:5});return new e(i.rmin,i.rmax,i.gmin,i.gmax,i.bmin,i.bmax,i)},e.prototype.invalidate=function(){this._volume=this._count=-1,this._avg=null},e.prototype.volume=function(){if(this._volume<0){var e=this.dimension,t=e.r1,i=e.r2,s=e.g1,r=e.g2,o=e.b1,a=e.b2;this._volume=(i-t+1)*(r-s+1)*(a-o+1)}return this._volume},e.prototype.count=function(){if(this._count<0){for(var e=this.histogram,t=e.hist,i=e.getColorIndex,s=this.dimension,r=s.r1,o=s.r2,a=s.g1,n=s.g2,l=s.b1,d=s.b2,c=0,h=r;h<=o;h++)for(var u=a;u<=n;u++)for(var m=l;m<=d;m++)c+=t[i(h,u,m)];this._count=c}return this._count},e.prototype.clone=function(){var t=this.histogram,i=this.dimension;return new e(i.r1,i.r2,i.g1,i.g2,i.b1,i.b2,t)},e.prototype.avg=function(){if(!this._avg){var e=this.histogram,t=e.hist,i=e.getColorIndex,s=this.dimension,r=s.r1,o=s.r2,a=s.g1,n=s.g2,l=s.b1,d=s.b2,c=0,h=void 0,u=void 0,m=void 0;h=u=m=0;for(var p=r;p<=o;p++)for(var v=a;v<=n;v++)for(var g=l;g<=d;g++){var f=t[i(p,v,g)];c+=f,h+=f*(p+.5)*8,u+=f*(v+.5)*8,m+=f*(g+.5)*8}this._avg=c?[~~(h/c),~~(u/c),~~(m/c)]:[~~(8*(r+o+1)/2),~~(8*(a+n+1)/2),~~(8*(l+d+1)/2)]}return this._avg},e.prototype.contains=function(e){var t=e[0],i=e[1],s=e[2],r=this.dimension,o=r.r1,a=r.r2,n=r.g1,l=r.g2,d=r.b1,c=r.b2;return i>>=3,s>>=3,(t>>=3)>=o&&t<=a&&i>=n&&i<=l&&s>=d&&s<=c},e.prototype.split=function(){var e=this.histogram,t=e.hist,i=e.getColorIndex,s=this.dimension,r=s.r1,o=s.r2,a=s.g1,n=s.g2,l=s.b1,d=s.b2,c=this.count();if(!c)return[];if(1===c)return[this.clone()];var h,u,m=o-r+1,p=n-a+1,v=d-l+1,g=Math.max(m,p,v),f=null;h=u=0;var A=null;if(g===m){A="r",f=new Uint32Array(o+1);for(var y=r;y<=o;y++){h=0;for(var b=a;b<=n;b++)for(var C=l;C<=d;C++)h+=t[i(y,b,C)];u+=h,f[y]=u}}else if(g===p)for(A="g",f=new Uint32Array(n+1),b=a;b<=n;b++){for(h=0,y=r;y<=o;y++)for(C=l;C<=d;C++)h+=t[i(y,b,C)];u+=h,f[b]=u}else for(A="b",f=new Uint32Array(d+1),C=l;C<=d;C++){for(h=0,y=r;y<=o;y++)for(b=a;b<=n;b++)h+=t[i(y,b,C)];u+=h,f[C]=u}for(var S=-1,w=new Uint32Array(f.length),I=0;I<f.length;I++){var T=f[I];S<0&&T>u/2&&(S=I),w[I]=u-T}var k=this;return function(e){var t=e+"1",i=e+"2",s=k.dimension[t],r=k.dimension[i],o=k.clone(),a=k.clone(),n=S-s,l=r-S;for(n<=l?(r=Math.min(r-1,~~(S+l/2)),r=Math.max(0,r)):(r=Math.max(s,~~(S-1-n/2)),r=Math.min(k.dimension[i],r));!f[r];)r++;for(var d=w[r];!d&&f[r-1];)d=w[--r];return o.dimension[i]=r,a.dimension[t]=r+1,[o,a]}(A)},e}();t.default=o},function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){this.pixels=e,this.opts=t;var i=t.sigBits,s=function(e,t,s){return(e<<2*i)+(t<<i)+s};this.getColorIndex=s;var r,o,a,n,l,d,c,h,u,m=8-i,p=new Uint32Array(1<<3*i);r=a=l=0,o=n=d=Number.MAX_VALUE;for(var v=e.length/4,g=0;g<v;){var f=4*g;g++,c=e[f+0],h=e[f+1],u=e[f+2],0!==e[f+3]&&(p[s(c>>=m,h>>=m,u>>=m)]+=1,c>r&&(r=c),c<o&&(o=c),h>a&&(a=h),h<n&&(n=h),u>l&&(l=u),u<d&&(d=u))}this._colorCount=p.reduce((function(e,t){return t>0?e+1:e}),0),this.hist=p,this.rmax=r,this.rmin=o,this.gmax=a,this.gmin=n,this.bmax=l,this.bmin=d}return Object.defineProperty(e.prototype,"colorCount",{get:function(){return this._colorCount},enumerable:!1,configurable:!0}),e}();t.default=s},function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e){this._comparator=e,this.contents=[],this._sorted=!1}return e.prototype._sort=function(){this._sorted||(this.contents.sort(this._comparator),this._sorted=!0)},e.prototype.push=function(e){this.contents.push(e),this._sorted=!1},e.prototype.peek=function(e){return this._sort(),e="number"==typeof e?e:this.contents.length-1,this.contents[e]},e.prototype.pop=function(){return this._sort(),this.contents.pop()},e.prototype.size=function(){return this.contents.length},e.prototype.map=function(e){return this._sort(),this.contents.map(e)},e}();t.default=s},function(e,t,i){Object.defineProperty(t,"__esModule",{value:!0});var s=i(3),r=i(4),o={targetDarkLuma:.26,maxDarkLuma:.45,minLightLuma:.55,targetLightLuma:.74,minNormalLuma:.3,targetNormalLuma:.5,maxNormalLuma:.7,targetMutesSaturation:.3,maxMutesSaturation:.4,targetVibrantSaturation:1,minVibrantSaturation:.35,weightSaturation:3,weightLuma:6.5,weightPopulation:.5};function a(e,t,i,s,r,o,a,n,l,d){var c=null,h=0;return t.forEach((function(t){var u=t.hsl,m=u[1],p=u[2];if(m>=n&&m<=l&&p>=r&&p<=o&&!function(e,t){return e.Vibrant===t||e.DarkVibrant===t||e.LightVibrant===t||e.Muted===t||e.DarkMuted===t||e.LightMuted===t}(e,t)){var v=function(e,t,i,s,r,o,a){function n(e,t){return 1-Math.abs(e-t)}return function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var i=0,s=0,r=0;r<e.length;r+=2){var o=e[r],a=e[r+1];i+=o*a,s+=a}return i/s}(n(e,t),a.weightSaturation,n(i,s),a.weightLuma,r/o,a.weightPopulation)}(m,a,p,s,t.population,i,d);(null===c||v>h)&&(c=t,h=v)}})),c}t.default=function(e,t){t=Object.assign({},o,t);var i=function(e){var t=0;return e.forEach((function(e){t=Math.max(t,e.population)})),t}(e),n=function(e,t,i){var s={Vibrant:null,DarkVibrant:null,LightVibrant:null,Muted:null,DarkMuted:null,LightMuted:null};return s.Vibrant=a(s,e,t,i.targetNormalLuma,i.minNormalLuma,i.maxNormalLuma,i.targetVibrantSaturation,i.minVibrantSaturation,1,i),s.LightVibrant=a(s,e,t,i.targetLightLuma,i.minLightLuma,1,i.targetVibrantSaturation,i.minVibrantSaturation,1,i),s.DarkVibrant=a(s,e,t,i.targetDarkLuma,0,i.maxDarkLuma,i.targetVibrantSaturation,i.minVibrantSaturation,1,i),s.Muted=a(s,e,t,i.targetNormalLuma,i.minNormalLuma,i.maxNormalLuma,i.targetMutesSaturation,0,i.maxMutesSaturation,i),s.LightMuted=a(s,e,t,i.targetLightLuma,i.minLightLuma,1,i.targetMutesSaturation,0,i.maxMutesSaturation,i),s.DarkMuted=a(s,e,t,i.targetDarkLuma,0,i.maxDarkLuma,i.targetMutesSaturation,0,i.maxMutesSaturation,i),s}(e,i,t);return function(e,t,i){if(!e.Vibrant&&!e.DarkVibrant&&!e.LightVibrant){if(!e.DarkVibrant&&e.DarkMuted){var o=e.DarkMuted.hsl,a=o[0],n=o[1],l=o[2];l=i.targetDarkLuma,e.DarkVibrant=new s.Swatch(r.hslToRgb(a,n,l),0)}if(!e.LightVibrant&&e.LightMuted){var d=e.LightMuted.hsl;a=d[0],n=d[1],l=d[2],l=i.targetDarkLuma,e.DarkVibrant=new s.Swatch(r.hslToRgb(a,n,l),0)}}if(!e.Vibrant&&e.DarkVibrant){var c=e.DarkVibrant.hsl;a=c[0],n=c[1],l=c[2],l=i.targetNormalLuma,e.Vibrant=new s.Swatch(r.hslToRgb(a,n,l),0)}else if(!e.Vibrant&&e.LightVibrant){var h=e.LightVibrant.hsl;a=h[0],n=h[1],l=h[2],l=i.targetNormalLuma,e.Vibrant=new s.Swatch(r.hslToRgb(a,n,l),0)}if(!e.DarkVibrant&&e.Vibrant){var u=e.Vibrant.hsl;a=u[0],n=u[1],l=u[2],l=i.targetDarkLuma,e.DarkVibrant=new s.Swatch(r.hslToRgb(a,n,l),0)}if(!e.LightVibrant&&e.Vibrant){var m=e.Vibrant.hsl;a=m[0],n=m[1],l=m[2],l=i.targetLightLuma,e.LightVibrant=new s.Swatch(r.hslToRgb(a,n,l),0)}if(!e.Muted&&e.Vibrant){var p=e.Vibrant.hsl;a=p[0],n=p[1],l=p[2],l=i.targetMutesSaturation,e.Muted=new s.Swatch(r.hslToRgb(a,n,l),0)}if(!e.DarkMuted&&e.DarkVibrant){var v=e.DarkVibrant.hsl;a=v[0],n=v[1],l=v[2],l=i.targetMutesSaturation,e.DarkMuted=new s.Swatch(r.hslToRgb(a,n,l),0)}if(!e.LightMuted&&e.LightVibrant){var g=e.LightVibrant.hsl;a=g[0],n=g[1],l=g[2],l=i.targetMutesSaturation,e.LightMuted=new s.Swatch(r.hslToRgb(a,n,l),0)}}(n,0,t),n}},function(e,t,i){var s=this&&this.__awaiter||function(e,t,i,s){return new(i||(i=Promise))((function(r,o){function a(e){try{l(s.next(e))}catch(e){o(e)}}function n(e){try{l(s.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?r(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(a,n)}l((s=s.apply(e,t||[])).next())}))},r=this&&this.__generator||function(e,t){var i,s,r,o,a={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return o={next:n(0),throw:n(1),return:n(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function n(o){return function(n){return function(o){if(i)throw new TypeError("Generator is already executing.");for(;a;)try{if(i=1,s&&(r=2&o[0]?s.return:o[0]?s.throw||((r=s.return)&&r.call(s),0):s.next)&&!(r=r.call(s,o[1])).done)return r;switch(s=0,r&&(o=[2&o[0],r.value]),o[0]){case 0:case 1:r=o;break;case 4:return a.label++,{value:o[1],done:!1};case 5:a.label++,s=o[1],o=[0];continue;case 7:o=a.ops.pop(),a.trys.pop();continue;default:if(!((r=(r=a.trys).length>0&&r[r.length-1])||6!==o[0]&&2!==o[0])){a=0;continue}if(3===o[0]&&(!r||o[1]>r[0]&&o[1]<r[3])){a.label=o[1];break}if(6===o[0]&&a.label<r[1]){a.label=r[1],r=o;break}if(r&&a.label<r[2]){a.label=r[2],a.ops.push(o);break}r[2]&&a.ops.pop(),a.trys.pop();continue}o=t.call(e,a)}catch(e){o=[6,e],s=0}finally{i=r=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,n])}}};Object.defineProperty(t,"__esModule",{value:!0}),t.BasicPipeline=t.Stage=void 0;var o=i(2),a=function(){function e(e){this.pipeline=e,this._map={}}return e.prototype.names=function(){return Object.keys(this._map)},e.prototype.has=function(e){return!!this._map[e]},e.prototype.get=function(e){return this._map[e]},e.prototype.register=function(e,t){return this._map[e]=t,this.pipeline},e}();t.Stage=a;var n=function(){function e(){this.filter=new a(this),this.quantizer=new a(this),this.generator=new a(this)}return e.prototype._buildProcessTasks=function(e){var t=this,i=e.filters,s=e.quantizer,r=e.generators;return 1===r.length&&"*"===r[0]&&(r=this.generator.names()),{filters:i.map((function(e){return o(t.filter,e)})),quantizer:o(this.quantizer,s),generators:r.map((function(e){return o(t.generator,e)}))};function o(e,t){var i,s;return"string"==typeof t?i=t:(i=t.name,s=t.options),{name:i,fn:e.get(i),options:s}}},e.prototype.process=function(e,t){return s(this,void 0,void 0,(function(){var i,s,o,a,n,l,d;return r(this,(function(r){switch(r.label){case 0:return i=this._buildProcessTasks(t),s=i.filters,o=i.quantizer,a=i.generators,[4,this._filterColors(s,e)];case 1:return n=r.sent(),[4,this._generateColors(o,n)];case 2:return l=r.sent(),[4,this._generatePalettes(a,l)];case 3:return d=r.sent(),[2,{colors:l,palettes:d}]}}))}))},e.prototype._filterColors=function(e,t){return Promise.resolve(o.applyFilters(t,e.map((function(e){return e.fn}))))},e.prototype._generateColors=function(e,t){return Promise.resolve(e.fn(t.data,e.options))},e.prototype._generatePalettes=function(e,t){return s(this,void 0,void 0,(function(){var i;return r(this,(function(s){switch(s.label){case 0:return[4,Promise.all(e.map((function(e){var i=e.fn,s=e.options;return Promise.resolve(i(t,s))})))];case 1:return i=s.sent(),[2,Promise.resolve(i.reduce((function(t,i,s){return t[e[s].name]=i,t}),{}))]}}))}))},e}();t.BasicPipeline=n}])};var Qe,et,tt=Ie(Xe.exports=Ze());function it(e,{target:t=document.body}={}){if("string"!=typeof e)throw new TypeError(`Expected parameter \`text\` to be a \`string\`, got \`${typeof e}\`.`);const i=document.createElement("textarea"),s=document.activeElement;i.value=e,i.setAttribute("readonly",""),i.style.contain="strict",i.style.position="absolute",i.style.left="-9999px",i.style.fontSize="12pt";const r=document.getSelection(),o=r.rangeCount>0&&r.getRangeAt(0);t.append(i),i.select(),i.selectionStart=0,i.selectionEnd=e.length;let a=!1;try{a=document.execCommand("copy")}catch{}return i.remove(),o&&(r.removeAllRanges(),r.addRange(o)),s&&s.focus(),a}!function(e){e.ALBUM_FAVORITES="albumfavorites",e.ARTIST_FAVORITES="artistfavorites",e.AUDIOBOOK_FAVORITES="audiobookfavorites",e.CATEGORYS="categorys",e.DEVICES="devices",e.EPISODE_FAVORITES="episodefavorites",e.PLAYER="player",e.PLAYLIST_FAVORITES="playlistfavorites",e.RECENTS="recents",e.SEARCH_MEDIA="searchmedia",e.SHOW_FAVORITES="showfavorites",e.TRACK_FAVORITES="trackfavorites",e.USERPRESETS="userpresets",e.UNDEFINED="undefined"}(Qe||(Qe={})),function(e){e.ALBUM_FAVORITES="Albums",e.ARTIST_FAVORITES="Artists",e.AUDIOBOOK_FAVORITES="Audiobooks",e.CATEGORY_BROWSER="Categorys",e.DEVICE_BROWSER="Devices",e.EPISODE_FAVORITES="Episodes",e.GENERAL="General",e.PLAYER="Player",e.PLAYLIST_FAVORITES="Playlists",e.RECENT_BROWSER="Recents",e.SEARCH_MEDIA_BROWSER="Search",e.SHOW_FAVORITES="Shows",e.TRACK_FAVORITES="Tracks",e.USERPRESET_BROWSER="Presets"}(et||(et={}));const st=Pe(de+":utils");function rt(e,t){return new CustomEvent(e,{bubbles:!0,composed:!0,detail:t})}function ot(e){return e?e.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'"):""}function at(){const e=new Date;return(e.getTime()+6e4*e.getTimezoneOffset())/1e3}function nt(e){if(!e)return;return function(e){const t=new Date(e.getTime()+60*e.getTimezoneOffset()*1e3),i=e.getTimezoneOffset()/60,s=e.getHours();return t.setHours(s-i),t}(new Date(1e3*(e||0))).toLocaleString()}function lt(e){const t=new Date(e).toISOString().substring(11,19);return t.startsWith("00:")?t.substring(3):t}function dt(e){let t=!0,i="";if(!e)return i;for(let s=0,r=e.length;s<r;s++)" "!=e[s]?(i+=t?e[s].toUpperCase():e[s].toLowerCase(),t=!1):(t=!0,i+=" ");return i}function ct(e){let t=Qe.UNDEFINED;return e==et.ALBUM_FAVORITES?t=Qe.ALBUM_FAVORITES:e==et.ARTIST_FAVORITES?t=Qe.ARTIST_FAVORITES:e==et.AUDIOBOOK_FAVORITES?t=Qe.AUDIOBOOK_FAVORITES:e==et.CATEGORY_BROWSER?t=Qe.CATEGORYS:e==et.DEVICE_BROWSER?t=Qe.DEVICES:e==et.EPISODE_FAVORITES?t=Qe.EPISODE_FAVORITES:e==et.GENERAL||e==et.PLAYER?t=Qe.PLAYER:e==et.PLAYLIST_FAVORITES?t=Qe.PLAYLIST_FAVORITES:e==et.RECENT_BROWSER?t=Qe.RECENTS:e==et.SEARCH_MEDIA_BROWSER?t=Qe.SEARCH_MEDIA:e==et.SHOW_FAVORITES?t=Qe.SHOW_FAVORITES:e==et.TRACK_FAVORITES?t=Qe.TRACK_FAVORITES:e==et.USERPRESET_BROWSER&&(t=Qe.USERPRESETS),t}function ht(e){let t=et.GENERAL;return e==Qe.ALBUM_FAVORITES?t=et.ALBUM_FAVORITES:e==Qe.ARTIST_FAVORITES?t=et.ARTIST_FAVORITES:e==Qe.AUDIOBOOK_FAVORITES?t=et.AUDIOBOOK_FAVORITES:e==Qe.CATEGORYS?t=et.CATEGORY_BROWSER:e==Qe.DEVICES?t=et.DEVICE_BROWSER:e==Qe.EPISODE_FAVORITES?t=et.EPISODE_FAVORITES:e==Qe.PLAYER?t=et.PLAYER:e==Qe.PLAYLIST_FAVORITES?t=et.PLAYLIST_FAVORITES:e==Qe.RECENTS?t=et.RECENT_BROWSER:e==Qe.SEARCH_MEDIA?t=et.SEARCH_MEDIA_BROWSER:e==Qe.SHOW_FAVORITES?t=et.SHOW_FAVORITES:e==Qe.TRACK_FAVORITES?t=et.TRACK_FAVORITES:e==Qe.USERPRESETS&&(t=et.USERPRESET_BROWSER),t}function ut(e){if(e){const t=vt("hui-card",e);if(t){return!!vt(".element-preview",t)}return!1}return!1}function mt(e){return!isNaN(parseFloat(e))&&!isNaN(+e)}function pt(e,t){if("object"!=typeof e||"object"!=typeof t)return e!==t?[e,t]:void 0;const i=Object.keys(e),s=Object.keys(t),r=new Set([...i,...s]),o={};for(const i of r){const s=e[i]||"",r=t[i]||"";if("object"==typeof s&&"object"==typeof r){const e=pt(s,r);e&&(o[i]=e)}else s!==r&&(o[i]=[s,r])}return 0===Object.keys(o).length?void 0:o}function vt(e,t){return function t(i){if(!i||i===document||i===window)return null;i.assignedSlot&&(i=i.assignedSlot);const s=i.closest(e);return s||t(i.getRootNode().host)}(t)}const gt=async()=>{if(customElements.get("search-input-outlined")&&customElements.get("ha-md-button-menu")&&customElements.get("ha-alert"))return;st.enabled&&st("loadHaFormLazyControls - loading lazy controls via partial-panel-resolver"),await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");e.hass={panels:[{url_path:"tmp",component_name:"config"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config");const t=document.createElement("ha-panel-config");await t.routerOptions.routes.automation.load(),st.enabled&&st("loadHaFormLazyControls - done; lazy controls should now be loaded")};function ft(e){const t=e.currentTarget,i=it(t.innerText);return st.enabled&&st("copyToClipboard - text copied to clipboard:\n%s",JSON.stringify(t.innerText)),window.status="text copied to clipboard",i}function At(e){let t="",i="";for(;;){if(null===e){i="no ex argument";break}if("object"==typeof e&&"code"in e&&"message"in e){const s=e.code,r=e.message;if("service_validation_error"==s&&r.startsWith("Validation error: ")){t=r.substring(18),i="ServiceValidationError";break}t=r,i="HomeAssistantError";break}if("object"==typeof e&&"message"in e){t=e.message,i="Error interface";break}st.enabled&&st("%cgetHomeAssistantErrorMessage - error message (string):\n%s","color:red",e+""),t=e+"",i="string";break}return st.enabled&&st("%cgetHomeAssistantErrorMessage - parsed %s message:\n- %s","color:red",i,JSON.stringify(t)),t}const yt=Pe(de+":media-browser-utils");function bt(e){let t=e.replace(/[^a-zA-Z0-9 ]/g,"");return t&&(t=t.trim()),t}function Ct(e,t,i,s){if(!i)return;let r=function(e,t){for(const i in e)if(i===bt(t))return e[i]}(t.customImageUrls,e.name||e.Name||"")??e.image_url;return r||(r=t.customImageUrls?.default||s),r?.match(/https:\/\/brands\.home-assistant\.io\/.+\/logo.png/)&&(r=r?.replace("logo.png","icon.png")),r||""}function St(e){return'\'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="'+e+"\"></path></svg>'"}function wt(e,t,i=void 0,s=void 0,r=void 0,o=void 0){let a=function(e){return e}(e);return a=function(e,t){if(!t)return e;if(e){if((e=(e=(e=(e=(e=(e=(e=(e=e.replace("{player.name}",t.name)).replace("{player.friendly_name}",t.attributes.friendly_name||"")).replace("{player.source}",t.attributes.source||"")).replace("{player.media_album_name}",t.attributes.media_album_name||"")).replace("{player.media_artist}",t.attributes.media_artist||"")).replace("{player.media_title}",t.attributes.media_title||"")).replace("{player.media_track}",t.attributes.media_track?.toString()||"")).replace("{player.state}",t.state||"")).indexOf("{player.state_ad}")>-1){let i=t.state+"";"ad"==t.attributes.sp_playing_type&&(i+=" Advertisement"),e=e.replace("{player.state_ad}",i)}if(e.indexOf("{player.source_noaccount}")>-1){let i=t.attributes.source||"";const s=i.indexOf("(");s>0&&(i=i.substring(0,s-1)),e=e.replace("{player.source_noaccount}",(i||"").trim())}e=(e=(e=(e=(e=(e=(e=(e=(e=e.replace("{player.sp_context_uri}",t.attributes.sp_context_uri||"")).replace("{player.sp_device_id}",t.attributes.sp_device_id||"")).replace("{player.sp_device_is_brand_sonos}",t.attributes.sp_device_is_brand_sonos+""||"")).replace("{player.sp_device_is_chromecast}",t.attributes.sp_device_is_chromecast+""||"")).replace("{player.sp_device_music_source}",t.attributes.sp_device_music_source+""||"")).replace("{player.sp_device_name}",t.attributes.sp_device_name||"")).replace("{player.sp_item_type}",t.attributes.sp_item_type||"")).replace("{player.sp_playing_type}",t.attributes.sp_playing_type||"")).replace("{player.sp_playlist_name}",t.attributes.sp_playlist_name||""),e=(e=(e=(e=(e=(e=(e=(e=(e=(e=t.attributes.sp_playlist_name&&"Unknown"!=t.attributes.sp_playlist_name?e.replace("{player.sp_playlist_name_title}"," ("+t.attributes.sp_playlist_name+")"):e.replace("{player.sp_playlist_name_title}","")).replace("{player.sp_playlist_uri}",t.attributes.sp_playlist_uri||"")).replace("{player.sp_track_is_explicit}",t.attributes.sp_track_is_explicit+""||"")).replace("{player.sp_user_country}",t.attributes.sp_user_country||"")).replace("{player.sp_user_display_name}",t.attributes.sp_user_display_name||"")).replace("{player.sp_user_email}",t.attributes.sp_user_email||"")).replace("{player.sp_user_has_web_player_credentials}",t.attributes.sp_user_has_web_player_credentials+"")).replace("{player.sp_user_id}",t.attributes.sp_user_id||"")).replace("{player.sp_user_product}",t.attributes.sp_user_product||"")).replace("{player.sp_user_uri}",t.attributes.sp_user_uri||"")}return e}(a,i),a=function(e,t,i,s){if(!e)return e;if(e.indexOf("{medialist.itemcount}")>-1){const t=(i||[]).length.toString();e=e.replace("{medialist.itemcount}",t)}if(e.indexOf("{medialist.lastupdatedon}")>-1){const i=nt(t||0);e=e.replace("{medialist.lastupdatedon}",i||"")}if(e.indexOf("{medialist.filteritemcount}")>-1){let t="";t=s?(s||[]).length.toString():(i||[]).length.toString(),e=e.replace("{medialist.filteritemcount}",t)}return e}(a,s,r,o),""==(a+"").trim()&&(a=void 0),a}function It(e){window.open(e,"_blank")}function Tt(e,t,i=50,s=!0){const r=new Array,o=new Array;let a=0,n=!1;for(const l of e||[])if(l.uri==t.uri&&(n=!0),n){let e=!1;if(s)for(const t of r)if(l.uri==t){e=!0;break}if(!e&&(r.push(l.uri),o.push(l.name+" (id="+l.id+")"),a+=1,a>=(i||50)))break}return yt.enabled&&yt("getMediaListTrackUrisRemaining - track name(s) remaining:\n%s",JSON.stringify(o,null,2)),{uris:r,names:o}}var kt;function _t(e,t){null==t&&(t="; ");let i="";if(e)for(const s of e.authors||[])null!=s&&null!=s.name&&s.name.length>0&&(i.length>0&&(i+=t),i+=s.name);return i}function Et(e,t){null==t&&(t="; ");let i="";if(e)for(const s of e.narrators||[])null!=s&&null!=s.name&&s.name.length>0&&(i.length>0&&(i+=t),i+=s.name);return i}!function(e){e.ALBUMS="Albums",e.ARTISTS="Artists",e.AUDIOBOOKS="AudioBooks",e.EPISODES="Episodes",e.PLAYLISTS="Playlists",e.SHOWS="Shows",e.TRACKS="Tracks",e.ALBUM_NEW_RELEASES="Album New Releases",e.ALBUM_TRACKS="Album Tracks",e.ARTIST_ALBUMS="Artist Albums",e.ARTIST_ALBUMS_APPEARSON="Artist Album ApearsOn",e.ARTIST_ALBUMS_COMPILATION="Artist Album Compilations",e.ARTIST_ALBUMS_SINGLE="Artist Album Singles",e.ARTIST_RELATED_ARTISTS="Artist Related Artists",e.ARTIST_TOP_TRACKS="Artist Top Tracks",e.AUDIOBOOK_EPISODES="Audiobook Chapters",e.SHOW_EPISODES="Show Episodes",e.MAIN_MENU="Menu"}(kt||(kt={}));const $t=Pe(de+":media-browser-base");class Pt extends re{constructor(){super(),this.nowPlayingBars=H`
      <div class="bars" slot="meta">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
      `,this.mousedownTimestamp=0,this.touchstartScrollTop=0}render(){this.config=this.store.config,this.section=this.store.section,this.hideTitle=!0,this.hideSubTitle=!0,this.listItemClass="button",this.itemsHaveImages=(this.items||[]).some((e=>e.image_url)),this.section!=Qe.SEARCH_MEDIA?this.mediaItemType=this.section:this.searchMediaType==kt.ALBUMS?this.mediaItemType=Qe.ALBUM_FAVORITES:this.searchMediaType==kt.ARTISTS?this.mediaItemType=Qe.ARTIST_FAVORITES:this.searchMediaType==kt.AUDIOBOOKS?this.mediaItemType=Qe.AUDIOBOOK_FAVORITES:this.searchMediaType==kt.EPISODES?this.mediaItemType=Qe.EPISODE_FAVORITES:this.searchMediaType==kt.PLAYLISTS?this.mediaItemType=Qe.PLAYLIST_FAVORITES:this.searchMediaType==kt.SHOWS?this.mediaItemType=Qe.SHOW_FAVORITES:this.searchMediaType==kt.TRACKS||this.searchMediaType==kt.ALBUM_TRACKS?this.mediaItemType=Qe.TRACK_FAVORITES:this.searchMediaType==kt.ARTIST_ALBUMS||this.searchMediaType==kt.ARTIST_ALBUMS_APPEARSON||this.searchMediaType==kt.ARTIST_ALBUMS_COMPILATION||this.searchMediaType==kt.ARTIST_ALBUMS_SINGLE?this.mediaItemType=Qe.ALBUM_FAVORITES:this.searchMediaType==kt.ARTIST_RELATED_ARTISTS?this.mediaItemType=Qe.ARTIST_FAVORITES:this.searchMediaType==kt.ARTIST_TOP_TRACKS?this.mediaItemType=Qe.TRACK_FAVORITES:this.searchMediaType==kt.SHOW_EPISODES&&(this.mediaItemType=Qe.EPISODE_FAVORITES),this.mediaItemType==Qe.ALBUM_FAVORITES?(this.hideTitle=this.config.albumFavBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.albumFavBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.ARTIST_FAVORITES?(this.hideTitle=this.config.artistFavBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.artistFavBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.AUDIOBOOK_FAVORITES?(this.hideTitle=this.config.audiobookFavBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.audiobookFavBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.CATEGORYS?(this.hideTitle=this.config.categoryBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.categoryBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.DEVICES?(this.hideTitle=this.config.deviceBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.deviceBrowserItemsHideSubTitle||!1,this.listItemClass+=" button-device"):this.mediaItemType==Qe.EPISODE_FAVORITES?(this.hideTitle=this.config.episodeFavBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.episodeFavBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.PLAYLIST_FAVORITES?(this.hideTitle=this.config.playlistFavBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.playlistFavBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.RECENTS?(this.hideTitle=this.config.recentBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.recentBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.SHOW_FAVORITES?(this.hideTitle=this.config.showFavBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.showFavBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.TRACK_FAVORITES?(this.hideTitle=this.config.trackFavBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.trackFavBrowserItemsHideSubTitle||!1):this.mediaItemType==Qe.USERPRESETS&&(this.hideTitle=this.config.userPresetBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.userPresetBrowserItemsHideSubTitle||!1),this.section==Qe.SEARCH_MEDIA&&this.config.searchMediaBrowserUseDisplaySettings&&(this.hideTitle=this.config.searchMediaBrowserItemsHideTitle||!1,this.hideSubTitle=this.config.searchMediaBrowserItemsHideSubTitle||!1)}styleMediaBrowser(){const e=this.config.mediaBrowserItemsColor,t=this.config.mediaBrowserItemsListColor,i=this.config.mediaBrowserItemsSvgIconColor,s=this.config.mediaBrowserItemsTitleFontSize,r=this.config.mediaBrowserItemsSubTitleFontSize,o={};return o["--items-per-row"]=`${this.itemsPerRow}`,e&&(o["--spc-media-browser-items-color"]=`${e}`),t&&(o["--spc-media-browser-items-list-color"]=`${t}`),i&&(o["--spc-media-browser-items-svgicon-color"]=`${i}`),s&&(o["--spc-media-browser-items-title-font-size"]=`${s}`),r&&(o["--spc-media-browser-items-subtitle-font-size"]=`${r}`),Me(o)}connectedCallback(){super.connectedCallback(),this.store.config.touchSupportDisabled?(this.isTouchDevice=!1,$t("connectedCallback - touch supported events are disabled via card configuration\n- isTouchDevice=%s",JSON.stringify(this.isTouchDevice))):(this.isTouchDevice=function(){let e=!1;return window.PointerEvent&&"maxTouchPoints"in navigator?navigator.maxTouchPoints>0&&(e=!0):(window.matchMedia&&window.matchMedia("(any-pointer:coarse)").matches||window.TouchEvent||"ontouchstart"in window)&&(e=!0),e}(),$t("connectedCallback - touch supported events are enabled programatically\n- isTouchDevice=%s",JSON.stringify(this.isTouchDevice))),this.isTouchDevice&&this.addEventListener("touchend",(function(e){e.cancelable&&e.preventDefault()}),{passive:!1})}onMediaBrowserItemClick(e){if(-1==this.mousedownTimestamp)return!0;const t=Date.now()-this.mousedownTimestamp;return this.mousedownTimestamp=-1,t<1e3?this.dispatchEvent(rt(ce,e.detail)):this.dispatchEvent(rt(he,e.detail))}onMediaBrowserItemMouseDown(){return this.mousedownTimestamp=Date.now(),setTimeout((()=>{this.shadowRoot?.activeElement?.dispatchEvent(new Event("click"))}),1100),!0}onMediaBrowserItemMouseUp(e){if(-1==this.mousedownTimestamp)return!0;const t=Date.now()-this.mousedownTimestamp;return this.mousedownTimestamp=-1,t<1e3?this.dispatchEvent(rt(ce,e.detail)):this.dispatchEvent(rt(he,e.detail))}onMediaBrowserItemTouchStart(e){this.mousedownTimestamp=Date.now();const t=vt("#mediaBrowserContentElement",this);return t&&(this.touchstartScrollTop=t.scrollTop),setTimeout((()=>{if(-1==this.mousedownTimestamp)return;const t=vt("#mediaBrowserContentElement",this);let i=0;return t&&(i=this.touchstartScrollTop-t.scrollTop,0!=i)?void 0:(this.mousedownTimestamp=-1,this.dispatchEvent(rt(he,e.detail)))}),1100),!0}onMediaBrowserItemTouchEnd(e){if(-1==this.mousedownTimestamp)return!0;const t=vt("#mediaBrowserContentElement",this);let i=0;if(t&&(i=this.touchstartScrollTop-t.scrollTop,0!=i))return!0;const s=Date.now()-this.mousedownTimestamp;return this.mousedownTimestamp=-1,s<1e3?this.dispatchEvent(rt(ce,e.detail)):this.dispatchEvent(rt(he,e.detail))}styleMediaBrowserItemBackgroundImage(e,t){let i="100%";return this.section==Qe.DEVICES&&(i="50%"),e.includes("svg+xml")?H`
      <style>
        .button:nth-of-type(${t+1}) .thumbnail {
          mask-image: url(${e});
          mask-size: ${i};
          background-color: var(--spc-media-browser-items-svgicon-color, ${o(Ae)});
        }
      </style>
    `:H`
      <style>
        .button:nth-of-type(${t+1}) .thumbnail {
          background-image: url(${e});
          background-size: ${i};
          background-color: var(--spc-media-browser-items-svgicon-color, transparent);
        }
      </style>
    `}buildMediaBrowserItems(){return(this.items||[]).map((e=>{const t={image_url:Ct(e,this.config,this.itemsHaveImages,"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw1AUhU9TS0UqDnYQcchQnexiRXQrVSyChdJWaNXB5KV/0KQhSXFxFFwLDv4sVh1cnHV1cBUEwR8QZwcnRRcp8b6k0CLGC4/3cd49h/fuA4RWjalmXxxQNcvIJBNivrAqBl8RgA8hxDAnMVNPZRdz8Kyve+qluovyLO++P2tQKZoM8InEcaYbFvEG8cympXPeJw6ziqQQnxNPGnRB4keuyy6/cS47LPDMsJHLzBOHicVyD8s9zCqGSjxNHFFUjfKFvMsK5y3Oaq3BOvfkLwwVtZUs12mNIYklpJCGCBkNVFGDhSjtGikmMnSe8PCPOv40uWRyVcHIsYA6VEiOH/wPfs/WLMWm3KRQAgi82PbHOBDcBdpN2/4+tu32CeB/Bq60rr/eAmY/SW92tcgRMLQNXFx3NXkPuNwBRp50yZAcyU9LKJWA9zP6pgIwfAsMrLlz65zj9AHI0ayWb4CDQ2CiTNnrHu/u753bvz2d+f0A+AZy3KgprtwAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfoBQEMNhNCJ/KVAAACg0lEQVR42u3BgQAAAADDoPlTX+EAVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwG/GFwABsN92WwAAAABJRU5ErkJggg=="),title:e.name||e.Name,subtitle:e.type,is_active:!1};if(this.mediaItemType==Qe.ALBUM_FAVORITES){const i=e;i.artists&&i.artists.length>0&&(this.searchMediaType==kt.ARTIST_ALBUMS?t.subtitle=i.release_date||i.artists[0]?.name||i.total_tracks||"0 tracks":t.subtitle=i.artists[0]?.name||i.total_tracks||"0 tracks"),i.name==this.store.player.attributes.media_album_name&&(t.is_active=!0)}else if(this.mediaItemType==Qe.ARTIST_FAVORITES){const i=e;t.subtitle=(i?.followers?.total||0)+" followers"||e.type,i.uri==this.store.player.attributes.sp_artist_uri&&(t.is_active=!0)}else if(this.mediaItemType==Qe.AUDIOBOOK_FAVORITES){const i=e;t.subtitle=_t(i,", ")||e.type,i.uri==this.store.player.attributes.sp_context_uri&&(t.is_active=!0)}else if(this.mediaItemType==Qe.CATEGORYS){const i=e;t.subtitle=i.type}else if(this.mediaItemType==Qe.DEVICES){const i=e;t.title=i.Name,t.subtitle=(i.DeviceInfo.BrandDisplayName||"unknown")+", "+(i.DeviceInfo.ModelDisplayName||"unknown"),""!=(i.Id||"")?i.Id==this.store.player.attributes.sp_device_id?t.is_active=!0:t.is_active=!1:i.Name==this.store.player.attributes.source?t.is_active=!0:t.is_active=!1}else if(this.mediaItemType==Qe.EPISODE_FAVORITES){const i=e;t.subtitle=i.show?.name||i.release_date||"",i.uri==this.store.player.attributes.media_content_id&&(t.is_active=!0)}else if(this.mediaItemType==Qe.PLAYLIST_FAVORITES){const i=e;t.subtitle=(i.tracks?.total||0)+" tracks",i.uri==this.store.player.attributes.sp_playlist_uri&&(t.is_active=!0)}else if(this.mediaItemType==Qe.RECENTS);else if(this.mediaItemType==Qe.SHOW_FAVORITES){const i=e;t.subtitle=(i.total_episodes||0)+" episodes",i.uri==this.store.player.attributes.sp_context_uri&&(t.is_active=!0)}else if(this.mediaItemType==Qe.TRACK_FAVORITES){const i=e;i.artists&&i.artists.length>0&&(t.subtitle=i.artists[0].name||e.type),i.uri==this.store.player.attributes.media_content_id&&(t.is_active=!0)}else if(this.mediaItemType==Qe.USERPRESETS){const i=e;t.subtitle=i.subtitle||e.uri}else this.mediaItemType==Qe.PLAYER||console.log("%cmedia-browser-utils - unknown mediaItemType = %s; mbi_info not set!","color:red",JSON.stringify(this.mediaItemType));return{...e,mbi_item:t}}))}}we([Ue({attribute:!1})],Pt.prototype,"store",void 0),we([Ue({attribute:!1})],Pt.prototype,"items",void 0),we([Ue({attribute:!1})],Pt.prototype,"itemsPerRow",void 0),we([Ue({attribute:!1})],Pt.prototype,"searchMediaType",void 0),we([function(e){return De({finisher:(t,i)=>{Object.assign(t.prototype[i],e)}})}({passive:!0})],Pt.prototype,"onMediaBrowserItemTouchStart",null);customElements.define("spc-media-browser-list",class extends Pt{constructor(){super()}render(){return super.render(),H`
      <mwc-list multi class="list" style=${this.styleMediaBrowser()}">
        ${this.buildMediaBrowserItems().map(((e,t)=>H`
            ${this.styleMediaBrowserItemBackgroundImage(e.mbi_item.image_url,t)}
            ${(()=>this.isTouchDevice?H`
                  <mwc-list-item
                    hasMeta
                    class="${this.listItemClass}"
                    @touchstart=${{handleEvent:()=>this.onMediaBrowserItemTouchStart(rt(ce,e)),passive:!0}}
                    @touchend=${()=>this.onMediaBrowserItemTouchEnd(rt(ce,e))}
                  >
                    <div class="row">${this.renderMediaBrowserItem(e,!e.mbi_item.image_url||!this.hideTitle,!this.hideSubTitle)}</div>
                    ${Je(e.mbi_item.is_active&&this.store.player.isPlaying(),(()=>H`${this.nowPlayingBars}`))}
                  </mwc-list-item>
                `:H`
                  <mwc-list-item
                    hasMeta
                    class="${this.listItemClass}"
                    @click=${()=>this.onMediaBrowserItemClick(rt(ce,e))}
                    @mousedown=${()=>this.onMediaBrowserItemMouseDown()}
                    @mouseup=${()=>this.onMediaBrowserItemMouseUp(rt(ce,e))}
                  >
                    <div class="row">${this.renderMediaBrowserItem(e,!e.mbi_item.image_url||!this.hideTitle,!this.hideSubTitle)}</div>
                    ${Je(e.mbi_item.is_active&&this.store.player.isPlaying(),(()=>H`${this.nowPlayingBars}`))}
                  </mwc-list-item>
                `)()}
          `))}
      </mwc-list>
    `}renderMediaBrowserItem(e,t=!0,i=!0){let s="";return e.mbi_item.is_active&&(s=" title-active"),H`
      <div class="thumbnail"></div>
      <div class="title${s}" ?hidden=${!t}>
        ${e.mbi_item.title}
        <div class="subtitle" ?hidden=${!i}>${dt(e.mbi_item.subtitle||"")}</div>
      </div>
    `}static get styles(){return[a`
        .button {
          --control-button-padding: 0px;
          --icon-width: 94px;
          height: var(--icon-width);
          margin: 0.4rem 0.0rem;
        }

        .button-device {
          --icon-width: 50px !important;
          margin: 0 !important;
        }

        .button-track {
          --icon-width: 80px !important;
          margin: 0 !important;
          padding: 0.25rem;
        }

        .row {
          display: flex;
        }

        .thumbnail {
          width: var(--icon-width);
          height: var(--icon-width);
          background-size: contain;
          background-repeat: no-repeat;
          background-position: left;
          mask-repeat: no-repeat;
          mask-position: left;
          border-radius: 0.5rem;
        }

        .title {
          color: var(--spc-media-browser-items-list-color, var(--spc-media-browser-items-color, var(--primary-text-color, #ffffff)));
          font-size: var(--spc-media-browser-items-title-font-size, 1.1rem);
          font-weight: normal;
          padding: 0 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          align-self: center;
          flex: 1;
        }

        .title-active {
          color: var(--spc-media-browser-items-list-color, var(--spc-media-browser-items-color, var(--primary-text-color, #ffffff)));
        }

        .subtitle {
          font-size: var(--spc-media-browser-items-subtitle-font-size, 0.8rem);
          font-weight: normal;
          line-height: 120%;
          padding-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        /* *********************************************************** */
        /* the remaining styles are used for the sound animation icon. */
        /* *********************************************************** */
        .bars {
          height: 30px;
          left: 50%;
          margin: -30px 0 0 -20px;
          position: relative;
          top: 65%;
          width: 40px;
        }

        .bar {
          background: var(--dark-primary-color);
          bottom: 1px;
          height: 3px;
          position: absolute;
          width: 3px;      
          animation: sound 0ms -800ms linear infinite alternate;
          display: block;
        }

        @keyframes sound {
          0% {
            opacity: .35;
            height: 3px; 
          }
          100% {
            opacity: 1;       
            height: 1rem;        
          }
        }

        .bar:nth-child(1)  { left: 1px; animation-duration: 474ms; }
        .bar:nth-child(2)  { left: 5px; animation-duration: 433ms; }
        .bar:nth-child(3)  { left: 9px; animation-duration: 407ms; }
        .bar:nth-child(4)  { left: 13px; animation-duration: 458ms; }
        /*.bar:nth-child(5)  { left: 17px; animation-duration: 400ms; }*/
        /*.bar:nth-child(6)  { left: 21px; animation-duration: 427ms; }*/
        /*.bar:nth-child(7)  { left: 25px; animation-duration: 441ms; }*/
        /*.bar:nth-child(8)  { left: 29px; animation-duration: 419ms; }*/
        /*.bar:nth-child(9)  { left: 33px; animation-duration: 487ms; }*/
        /*.bar:nth-child(10) { left: 37px; animation-duration: 442ms; }*/

      `,ye]}});customElements.define("spc-media-browser-icons",class extends Pt{constructor(){super()}render(){return super.render(),H`
      <div class="icons" style=${this.styleMediaBrowser()}>
        ${this.buildMediaBrowserItems().map(((e,t)=>H`
          ${this.styleMediaBrowserItemBackgroundImage(e.mbi_item.image_url,t)}
          ${(()=>this.isTouchDevice?H`
                <ha-control-button
                  class="button"
                  isTouchDevice="${this.isTouchDevice}"
                  @touchstart=${{handleEvent:()=>this.onMediaBrowserItemTouchStart(rt(ce,e)),passive:!0}}
                  @touchend=${()=>this.onMediaBrowserItemTouchEnd(rt(ce,e))}
                >
                  ${this.renderMediaBrowserItem(e,!e.mbi_item.image_url||!this.hideTitle,!this.hideSubTitle)}
                </ha-control-button>
              `:H`
                <ha-control-button
                  class="button"
                  isTouchDevice="${this.isTouchDevice}"
                  @click=${()=>this.onMediaBrowserItemClick(rt(ce,e))}
                  @mousedown=${()=>this.onMediaBrowserItemMouseDown()}
                  @mouseup=${()=>this.onMediaBrowserItemMouseUp(rt(ce,e))}
                >
                  ${this.renderMediaBrowserItem(e,!e.mbi_item.image_url||!this.hideTitle,!this.hideSubTitle)}
                </ha-control-button>
              `)()}
        `))}
      </div>
    `}renderMediaBrowserItem(e,t=!0,i=!0){let s="",r=H``;return e.mbi_item.is_active&&(s=" title-active",r=this.nowPlayingBars),H`
      <div class="thumbnail">
        ${r}
      </div>
      <div class="title${s}" ?hidden=${!t}>
        ${e.mbi_item.title}
        <div class="subtitle" ?hidden=${!i}>${dt(e.mbi_item.subtitle||"")}</div>
      </div>
    `}static get styles(){return[a`
        .icons {
          display: flex;
          flex-wrap: wrap;
        }

        .button {
          --control-button-padding: 0px;
          --margin: 0.6%;
          --width: calc(100% / var(--items-per-row) - (var(--margin) * 2));
          width: var(--width);
          height: var(--width);
          margin: var(--margin);
        }

        .thumbnail {
          width: 100%;
          padding-bottom: 100%;
          background-size: 100%;
          background-repeat: no-repeat;
          background-position: center;
          mask-repeat: no-repeat;
          mask-position: center;
        }

        .title {
          color: var(--spc-media-browser-items-color, #ffffff);
          font-size: var(--spc-media-browser-items-title-font-size, 0.8rem);
          font-weight: normal;
          line-height: 160%;
          padding: 0.75rem 0.5rem 0rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          position: absolute;
          width: 100%;
          bottom: 0;
          background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6));
        }

        .title-active {
          color: var(--spc-media-browser-items-color, #ffffff);
        }

        .subtitle {
          font-size: var(--spc-media-browser-items-subtitle-font-size, 0.8rem);
          line-height: 120%;
          width: 100%;
          padding-bottom: 0.25rem;
        }

        /* *********************************************************** */
        /* the remaining styles are used for the sound animation icon. */
        /* *********************************************************** */
        .bars {
          position: absolute;
          width: 20px;
          height: 10px;
          margin-top: 20px;
          margin-left: 10px;

          /*height: 30px;*/
          /*left: 10%;*/
          /*margin: 0 0 0 0;*/
          /*position: absolute;*/
          /*top: -4%;*/
          /*width: 40px;*/
        }

        .bar {
          background: var(--dark-primary-color);
          bottom: 1px;
          height: 3px;
          position: absolute;
          width: 3px;      
          animation: sound 0ms -800ms linear infinite alternate;
          display: block;
        }

        @keyframes sound {
          0% {
            opacity: .35;
            height: 3px; 
          }
          100% {
            opacity: 1;       
            height: 1rem;        
          }
        }

        .bar:nth-child(1)  { left: 1px; animation-duration: 474ms; }
        .bar:nth-child(2)  { left: 5px; animation-duration: 433ms; }
        .bar:nth-child(3)  { left: 9px; animation-duration: 407ms; }
        .bar:nth-child(4)  { left: 13px; animation-duration: 458ms; }
        /*.bar:nth-child(5)  { left: 17px; animation-duration: 400ms; }*/
        /*.bar:nth-child(6)  { left: 21px; animation-duration: 427ms; }*/
        /*.bar:nth-child(7)  { left: 25px; animation-duration: 441ms; }*/
        /*.bar:nth-child(8)  { left: 29px; animation-duration: 419ms; }*/
        /*.bar:nth-child(9)  { left: 33px; animation-duration: 487ms; }*/
        /*.bar:nth-child(10) { left: 37px; animation-duration: 442ms; }*/

      `]}});var Ft="M11 9C11 10.66 9.66 12 8 12C6.34 12 5 10.66 5 9C5 7.34 6.34 6 8 6C9.66 6 11 7.34 11 9M14 20H2V18C2 15.79 4.69 14 8 14C11.31 14 14 15.79 14 18M7 9C7 9.55 7.45 10 8 10C8.55 10 9 9.55 9 9C9 8.45 8.55 8 8 8C7.45 8 7 8.45 7 9M4 18H12C12 16.9 10.21 16 8 16C5.79 16 4 16.9 4 18M22 12V14H13V12M22 8V10H13V8M22 4V6H13V4Z",Lt="M11,14C12,14 13.05,14.16 14.2,14.44C13.39,15.31 13,16.33 13,17.5C13,18.39 13.25,19.23 13.78,20H3V18C3,16.81 3.91,15.85 5.74,15.12C7.57,14.38 9.33,14 11,14M11,12C9.92,12 9,11.61 8.18,10.83C7.38,10.05 7,9.11 7,8C7,6.92 7.38,6 8.18,5.18C9,4.38 9.92,4 11,4C12.11,4 13.05,4.38 13.83,5.18C14.61,6 15,6.92 15,8C15,9.11 14.61,10.05 13.83,10.83C13.05,11.61 12.11,12 11,12M18.5,10H20L22,10V12H20V17.5A2.5,2.5 0 0,1 17.5,20A2.5,2.5 0 0,1 15,17.5A2.5,2.5 0 0,1 17.5,15C17.86,15 18.19,15.07 18.5,15.21V10Z",Rt="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,16.5C9.5,16.5 7.5,14.5 7.5,12C7.5,9.5 9.5,7.5 12,7.5C14.5,7.5 16.5,9.5 16.5,12C16.5,14.5 14.5,16.5 12,16.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Ot="M12 21.5C10.65 20.65 8.2 20 6.5 20C4.85 20 3.15 20.3 1.75 21.05C1.65 21.1 1.6 21.1 1.5 21.1C1.25 21.1 1 20.85 1 20.6V6C1.6 5.55 2.25 5.25 3 5C4.11 4.65 5.33 4.5 6.5 4.5C8.45 4.5 10.55 4.9 12 6C13.45 4.9 15.55 4.5 17.5 4.5C18.67 4.5 19.89 4.65 21 5C21.75 5.25 22.4 5.55 23 6V20.6C23 20.85 22.75 21.1 22.5 21.1C22.4 21.1 22.35 21.1 22.25 21.05C20.85 20.3 19.15 20 17.5 20C15.8 20 13.35 20.65 12 21.5M12 8V19.5C13.35 18.65 15.8 18 17.5 18C18.7 18 19.9 18.15 21 18.5V7C19.9 6.65 18.7 6.5 17.5 6.5C15.8 6.5 13.35 7.15 12 8M13 11.5C14.11 10.82 15.6 10.5 17.5 10.5C18.41 10.5 19.26 10.59 20 10.78V9.23C19.13 9.08 18.29 9 17.5 9C15.73 9 14.23 9.28 13 9.84V11.5M17.5 11.67C15.79 11.67 14.29 11.93 13 12.46V14.15C14.11 13.5 15.6 13.16 17.5 13.16C18.54 13.16 19.38 13.24 20 13.4V11.9C19.13 11.74 18.29 11.67 17.5 11.67M20 14.57C19.13 14.41 18.29 14.33 17.5 14.33C15.67 14.33 14.17 14.6 13 15.13V16.82C14.11 16.16 15.6 15.83 17.5 15.83C18.54 15.83 19.38 15.91 20 16.07V14.57Z",Mt="M7 3C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.89 18.1 3 17 3H7M7 5H17V18L12 15.82L7 18V5M12 6V11.3C11.7 11.1 11.4 11 11 11C9.9 11 9 11.9 9 13C9 14.11 9.9 15 11 15C12.11 15 13 14.11 13 13V8H15V6H12Z",xt="M2 11V13C7 13 11 17 11 22H13C13 15.9 8.1 11 2 11M20 2H10C8.9 2 8 2.9 8 4V10.5C9 11 9.9 11.7 10.7 12.4C11.6 11 13.2 10 15 10C17.8 10 20 12.2 20 15S17.8 20 15 20H14.8C14.9 20.7 15 21.3 15 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2M15 8C13.9 8 13 7.1 13 6C13 4.9 13.9 4 15 4C16.1 4 17 4.9 17 6S16.1 8 15 8M15 18C14.8 18 14.5 18 14.3 17.9C13.8 16.4 13.1 15.1 12.2 13.9C12.6 12.8 13.7 11.9 15 11.9C16.7 11.9 18 13.2 18 14.9S16.7 18 15 18M2 15V17C4.8 17 7 19.2 7 22H9C9 18.1 5.9 15 2 15M2 19V22H5C5 20.3 3.7 19 2 19",Bt="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.9 20.11 3 19 3M12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3M7 7H17V5H19V19H5V5H7V7M13 12H16V14H13V17H11V14H8V12H11V9H13V12Z",Ht="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z",Ut="M12,20L15.46,14H15.45C15.79,13.4 16,12.73 16,12C16,10.8 15.46,9.73 14.62,9H19.41C19.79,9.93 20,10.94 20,12A8,8 0 0,1 12,20M4,12C4,10.54 4.39,9.18 5.07,8L8.54,14H8.55C9.24,15.19 10.5,16 12,16C12.45,16 12.88,15.91 13.29,15.77L10.89,19.91C7,19.37 4,16.04 4,12M15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12M12,4C14.96,4 17.54,5.61 18.92,8H12C10.06,8 8.45,9.38 8.08,11.21L5.7,7.08C7.16,5.21 9.44,4 12,4M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Vt="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z",Dt="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z",Nt="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z",qt="M10.86 15.37C10.17 14.6 9.7 13.68 9.55 12.65C9.25 13.11 9 13.61 8.82 14.15C7.9 16.9 9.5 20.33 12.22 21.33C14.56 22.11 17.19 20.72 18.92 19.2C19.18 18.85 21.23 17.04 20.21 16.84C17.19 18.39 13.19 17.95 10.86 15.37M11.46 9.56C12.5 9.55 11.5 9.13 11.07 8.81C10.03 8.24 8.81 7.96 7.63 7.96C3.78 8 .995 10.41 2.3 14.4C3.24 18.28 6.61 21.4 10.59 21.9C8.54 20.61 7.3 18.19 7.3 15.78C7.38 13.25 8.94 10.28 11.46 9.56M2.78 8.24C5.82 6 10.66 6.18 13.28 9C14.3 10.11 15 12 14.07 13.37C12.33 15.25 17.15 15.5 18.18 15.22C21.92 14.5 22.91 10.15 21.13 7.15C19.43 3.75 15.66 1.97 11.96 2C7.9 1.93 4.25 4.5 2.78 8.24Z",Gt="M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z",Jt="M8,5.14V19.14L19,12.14L8,5.14Z",Wt="M15,6H3V8H15V6M15,10H3V12H15V10M3,16H11V14H3V16M17,6V14.18C16.69,14.07 16.35,14 16,14A3,3 0 0,0 13,17A3,3 0 0,0 16,20A3,3 0 0,0 19,17V8H22V6H17Z",Yt="M3 10H14V12H3V10M3 6H14V8H3V6M3 14H10V16H3V14M16 13V21L22 17L16 13Z",zt="M17,18.25V21.5H7V18.25C7,16.87 9.24,15.75 12,15.75C14.76,15.75 17,16.87 17,18.25M12,5.5A6.5,6.5 0 0,1 18.5,12C18.5,13.25 18.15,14.42 17.54,15.41L16,14.04C16.32,13.43 16.5,12.73 16.5,12C16.5,9.5 14.5,7.5 12,7.5C9.5,7.5 7.5,9.5 7.5,12C7.5,12.73 7.68,13.43 8,14.04L6.46,15.41C5.85,14.42 5.5,13.25 5.5,12A6.5,6.5 0 0,1 12,5.5M12,1.5A10.5,10.5 0 0,1 22.5,12C22.5,14.28 21.77,16.39 20.54,18.11L19.04,16.76C19.96,15.4 20.5,13.76 20.5,12A8.5,8.5 0 0,0 12,3.5A8.5,8.5 0 0,0 3.5,12C3.5,13.76 4.04,15.4 4.96,16.76L3.46,18.11C2.23,16.39 1.5,14.28 1.5,12A10.5,10.5 0 0,1 12,1.5M12,9.5A2.5,2.5 0 0,1 14.5,12A2.5,2.5 0 0,1 12,14.5A2.5,2.5 0 0,1 9.5,12A2.5,2.5 0 0,1 12,9.5Z",jt="M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",Kt="M20,6A2,2 0 0,1 22,8V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V8C2,7.15 2.53,6.42 3.28,6.13L15.71,1L16.47,2.83L8.83,6H20M20,8H4V12H16V10H18V12H20V8M7,14A3,3 0 0,0 4,17A3,3 0 0,0 7,20A3,3 0 0,0 10,17A3,3 0 0,0 7,14Z",Zt="M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8C10.89,8 10,7.1 10,6C10,4.89 10.89,4 12,4M17,2H7C5.89,2 5,2.89 5,4V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V4C19,2.89 18.1,2 17,2Z",Xt="M14,10A3,3 0 0,0 11,13A3,3 0 0,0 14,16A3,3 0 0,0 17,13A3,3 0 0,0 14,10M14,18A5,5 0 0,1 9,13A5,5 0 0,1 14,8A5,5 0 0,1 19,13A5,5 0 0,1 14,18M14,2A2,2 0 0,1 16,4A2,2 0 0,1 14,6A2,2 0 0,1 12,4A2,2 0 0,1 14,2M19,0H9A2,2 0 0,0 7,2V18A2,2 0 0,0 9,20H19A2,2 0 0,0 21,18V2A2,2 0 0,0 19,0M5,22H17V24H5A2,2 0 0,1 3,22V4H5",Qt="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z";const ei=a`

  /* define a style in the main object to specify the "grid-template-columns: 80px auto ..." value. */
  .grid {
    display: grid;
    width: 100%;
  }

  /* style grid container */
  .grid-container-scrollable {
    overflow-y: auto;
    scrollbar-color: var(--primary-text-color) var(--secondary-background-color);
    scrollbar-width: inherit;
    max-height: 100vh;
    margin: 0.25rem;
    align-self: stretch
  }

  .grid-entry, .grid-header {
    padding: 2px;
    align-self: normal;
    /* background-color: white; */
    /* border-right: 1px solid gray; */
    /* border-bottom: 1px solid gray; */
  }

  .grid-entry-last, .grid-header-last {
    margin-right: 4px;    /* a little padding if scrollbars are present */
    /* border-right: none; */
  }

  .grid-entry-r {
    padding: 2px;
    justify-self: right;
  }

  .grid-entry-c {
    padding: 2px;
    justify-self: center;
  }

  /* scrolling text bleeds through if you set BG-COLOR to transparent! */
  .grid-header {
    background-color: var(--card-background-color);
    color: var(--accent-color);
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 2px;
    border-bottom: 1px solid gray;
    border-top: 1px solid gray;
  }

  .grid-header-fixed-left {
    z-index: 2;
  }

  .grid-fixed-left {
    position: sticky;
    left: 0;
  }

  .grid-fixed-right {
    /* border-left: 1px solid gray; */
    /* border-right: none; */
    position: sticky;
    right: 0;
  }

  .grid-fixed-right2 {
    /* border-left: 1px solid gray; */
    /* border-right: none; */
    position: sticky;
    right: 200px;
  }

  .grid-placeholder {
    grid-column-start: 1;
    grid-column-end: 21;
    /* border-right: none; */
  }

  /* styles for action item info grid items. */
  .grid-action-info-hdr-s {
    font-size: 0.85rem;
    line-height: 1rem;
    justify-self: right;
    text-wrap-mode: nowrap;
    padding-right: 6px;
    color: var(--accent-color);
  }

  .grid-action-info-text-s {
    font-size: 0.85rem;
    line-height: 1rem;
    justify-self: left;
  }

  .copy2cb:hover {
    cursor: copy;
  }

`,ti=a`

  .media-info-content {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    width: inherit;
    gap: 0.25rem;
    margin: 0.25rem;
  }

  .media-info-content > div {
    flex: max(23rem, 100%/3 + 0.1%);  /* flexbox is responsive */
    /*border: 1px solid blue;*/       /* FOR TESTING LAYOUT */
  }

  .media-info-content .img {
    background-size: contain !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    max-width: 128px;
    min-height: 128px;
    border-radius: var(--control-button-border-radius, 10px) !important;
    background-size: cover !important;
  }

  .media-info-description {
    overflow-y: auto;
    scrollbar-color: var(--primary-text-color) var(--secondary-background-color);
    scrollbar-width: inherit;
    display: block;
    height: inherit;  
    padding-top: 10px;
  }

  .media-info-details {
    display: flex;
    flex: 1 1 0%;
    flex-direction: column;
    max-width: 400rem;
    margin: 0.5rem;
  }

  .media-info-text-l {
    font-size: 2.1rem;
    font-weight: 400;
    line-height: 1.8rem;
    padding-bottom: 0.5rem;
    width: 100%;
    color: var(--dark-primary-color);
  }

  .media-info-text-ms, .media-info-text-ms-c {
    font-size: 1.2rem;
    line-height: 1.5rem;
    padding-bottom: 0.20rem;
    width: 100%;
  }

  .media-info-text-ms-c {
    color: var(--dark-primary-color);
  }

  .media-info-text-m {
    font-size: 1.5rem;
    line-height: 1.8rem;
    padding-bottom: 0.5rem;
    width: 100%;
  }

  .media-info-text-s {
    font-size: 0.85rem;
    line-height: 1rem;
    width: 100%;
  }

  ha-icon-button[slot="media-info-icon-link-s"] {
    --mdc-icon-button-size: 14px;
    --mdc-icon-size: 14px;
    padding-left: 2px;
    padding-right: 2px;
  }

`,ii=a`

  .player-body-container {
    box-sizing: border-box;
    height: inherit;
    background: linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65));
    border-radius: 1.0rem;
    padding: 0.25rem;
    text-align: left;
  }

  .player-body-container-scrollable {
    /* border: 1px solid green;     /* FOR TESTING CONTROL LAYOUT CHANGES */
    box-sizing: border-box;
    height: inherit;
    overflow-y: auto;
    overflow-x: clip;
    scrollbar-color: var(--primary-text-color) var(--secondary-background-color);
    scrollbar-width: inherit;
    color: white;
  }

  /* style actions 3 dots ("...") <ha-md-button-menu> dropdown menu */
  .actions-dropdown-menu {
    white-space: nowrap;
    display: inline-flex;
    flex-direction: row;
    justify-content: left;
    vertical-align: text-top;
    --ha-select-height: 2.5rem;           /* ha dropdown control height */
    --mdc-menu-item-height: 2.5rem;       /* mdc dropdown list item height */
    --mdc-icon-button-size: 2.5rem;       /* mdc icon button size */
    --md-menu-item-top-space: 0.5rem;     /* top spacing between items */
    --md-menu-item-bottom-space: 0.5rem;  /* bottom spacing between items */
    --md-menu-item-one-line-container-height: 2.0rem;  /* menu item height */
  }

  /* style actions 3 dots ("...") <ha-md-button-menu><ha-assist-chip> dropdown menu */
  .actions-dropdown-menu > ha-md-button-menu > ha-assist-chip {
    /*--ha-assist-chip-container-color: var(--card-background-color);*/ /* transparent is default. */
    --ha-assist-chip-container-shape: 10px;     /* 0px=square corner, 10px=rounded corner */
    --md-assist-chip-trailing-space: 0px;       /* no label, so no trailing space */
    --md-assist-chip-container-height: 1.5rem;  /* height of the dropdown menu container */
  }

  /* style ha-icon-button controls in header actions: icon size, title text */
  ha-icon-button[slot="icon-button"] {
    --mdc-icon-button-size: 30px;
    --mdc-icon-size: 24px;
    vertical-align: middle;
    padding: 2px;
  }

  ha-icon-button[slot="icon-button-selected"] {
    --mdc-icon-button-size: 30px;
    --mdc-icon-size: 24px;
    vertical-align: middle;
    padding: 2px;
    color: red;
  }

  /* style ha-icon-button controls in header actions: icon size, title text */
  ha-icon-button[slot="icon-button-small"] {
    --mdc-icon-button-size: 20px;
    --mdc-icon-size: 20px;
    vertical-align: middle;
    padding: 2px;
  }

  ha-icon-button[slot="icon-button-small-selected"] {
    --mdc-icon-button-size: 20px;
    --mdc-icon-size: 20px;
    vertical-align: middle;
    padding: 2px;
    color: red;
  }

  /* style ha-alert controls */
  ha-alert {
    display: block;
    margin-bottom: 0.25rem;
  }

  .icon-button {
    width: 100%;
  }

  *[hide="true"] {
    display: none !important;
  }

  *[hide="false"] {
    display: block !important;
  }

  *[hide] {
    display: none;
  }

  .flex-1 {
    flex: 1;
  }

  .flex-items {
    display: block;
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: auto;
    align-self: auto;
    order: 0;
  }

  .display-inline {
    display: inline;
  }
`,si=ne+"-card-progress-ended";const ri=ne+"-card-progress-started";class oi extends re{constructor(){super(),this.isUpdateInProgress=!1,this.isCardInEditPreview=!1}connectedCallback(){super.connectedCallback(),this.store&&this.store.card&&(this.isCardInEditPreview=ut(this.store.card))}alertClear(){this.alertError=void 0,this.alertInfo=void 0}alertErrorClear(){this.alertError=void 0}alertErrorSet(e){this.alertError=e,this.alertInfo=void 0}alertInfoClear(){this.alertInfo=void 0}alertInfoSet(e){this.alertInfo=e,this.alertError=void 0}progressHide(){this.isUpdateInProgress=!1,this.store&&this.store.card&&this.store.card.dispatchEvent(new CustomEvent(si,{bubbles:!0,composed:!0,detail:{}}))}progressShow(){this.store&&this.store.card&&this.store.card.dispatchEvent(new CustomEvent(ri,{bubbles:!0,composed:!0,detail:{}}))}}we([Ue({attribute:!1})],oi.prototype,"store",void 0),we([Ve()],oi.prototype,"alertError",void 0),we([Ve()],oi.prototype,"alertInfo",void 0);const ai=Pe(de+":fav-actions-base");class ni extends oi{constructor(e){super(),this.section=e}render(){this.player=this.store.player,this.spotifyPlusService=this.store.spotifyPlusService}firstUpdated(e){super.firstUpdated(e),this.updateActions(this.player,[])}hideSearchType(e){return!!(this.store.config.searchMediaBrowserSearchTypes&&this.store.config.searchMediaBrowserSearchTypes.length>0)&&!this.store.config.searchMediaBrowserSearchTypes?.includes(e)}onClickMediaItem(e){this.PlayMediaItem(e)}async AddPlayerQueueItem(e){try{this.progressShow(),await this.spotifyPlusService.AddPlayerQueueItems(this.player,e.uri)}catch(e){this.alertErrorSet("Could not add media item to play queue.  "+At(e))}finally{this.progressHide()}}async PlayMediaItem(e){try{this.progressShow(),await this.spotifyPlusService.Card_PlayMediaBrowserItem(this.player,e),this.store.card.SetSection(Qe.PLAYER)}catch(e){this.alertErrorSet("Could not play media item.  "+At(e))}finally{this.progressHide()}}async onClickAction(e){throw new Error('onClickAction not implemented for action "'+e+'".')}updateActions(e,t){return ai.enabled&&ai("updateActions - updating actions: %s",JSON.stringify(Array.from(t.values()))),this.isUpdateInProgress?(this.alertErrorSet("Previous refresh is still in progress - please wait"),!1):(this.isUpdateInProgress=!0,this.isCardInEditPreview?(this.isUpdateInProgress=!1,!1):e||this.section==Qe.DEVICES?this.mediaItem.uri||this.section==Qe.DEVICES?(this.alertClear(),!0):(this.isUpdateInProgress=!1,this.alertErrorSet("MediaItem not set in updateActions"),!1):(this.isUpdateInProgress=!1,this.alertErrorSet("Player reference not set in updateActions"),!1))}}we([Ue({attribute:!1})],ni.prototype,"mediaItem",void 0);const li=ne+"-card-search-media";class di{constructor(e,t=null,i=null,s=null,r=null,o=null){this.searchType=e||kt.PLAYLISTS,this.searchCriteria=t||"",this.title=i||"",this.uri=s||"",this.subtype=r||"",this.parentMediaItem=o}}function ci(e,t,i=null,s=null,r=null,o=null){const a=new di(e);return a.searchCriteria=(t||"").trim(),a.title=i||"",a.uri=s||"",a.subtype=r||"",a.parentMediaItem=o,a.subtype||(e==kt.AUDIOBOOK_EPISODES?a.subtype="audiobook":e==kt.SHOW_EPISODES&&(a.subtype="podcast")),new CustomEvent(li,{bubbles:!0,composed:!0,detail:a})}const hi="turn_on",ui="turn_off",mi="volume_down",pi="volume_up",vi="volume_mute",gi="volume_set",fi="select_source";class Ai{constructor(e){this.hassService=e}async clear_playlist(e){const t={domain:le,service:"clear_playlist",serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async join(e,t){const i={domain:le,service:"join",serviceData:{entity_id:e,group_members:t}};await this.hassService.CallService(i)}async media_next_track(e){const t={domain:le,service:"media_next_track",serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async media_pause(e){const t={domain:le,service:"media_pause",serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async media_play(e){const t={domain:le,service:"media_play",serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async media_play_pause(e){const t={domain:le,service:"media_play_pause",serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async media_previous_track(e){if(!e.isUserProductPremium())throw new Error(Se);const t={domain:le,service:"media_previous_track",serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async media_seek(e,t){if(!e.isUserProductPremium())throw new Error(Se);const i={domain:le,service:"media_seek",serviceData:{entity_id:e.id,seek_position:t}};await this.hassService.CallService(i)}async media_stop(e){const t={domain:le,service:"media_stop",serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async play_media(e,t){const i={domain:le,service:"play_media",serviceData:{entity_id:e.id,media_content_id:t.media_content_id,media_content_type:t.media_content_type}};await this.hassService.CallService(i)}async repeat_set(e,t){const i={domain:le,service:"repeat_set",serviceData:{entity_id:e.id,repeat:t}};await this.hassService.CallService(i)}async select_sound_mode(e,t){const i={domain:le,service:"select_sound_mode",serviceData:{entity_id:e.id,sound_mode:t}};await this.hassService.CallService(i)}async select_source(e,t){if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);const i={domain:le,service:fi,serviceData:{entity_id:e.id,source:t}};await this.hassService.CallService(i)}async shuffle_set(e,t){if(!e.isUserProductPremium())throw new Error(Se);const i={domain:le,service:"shuffle_set",serviceData:{entity_id:e.id,shuffle:t}};await this.hassService.CallService(i)}async turn_off(e){const t={domain:le,service:ui,serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async turn_on(e){const t={domain:le,service:hi,serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async unJoin(e){const t={domain:le,service:"unjoin",serviceData:{entity_id:e}};await this.hassService.CallService(t)}async volume_mute(e,t){const i={domain:le,service:vi,serviceData:{entity_id:e.id,is_volume_muted:t}};await this.hassService.CallService(i)}async volume_mute_toggle(e){const t=!e.isMuted();await this.volume_mute(e,t)}async volume_set(e,t){const i=t/100,s={domain:le,service:gi,serviceData:{entity_id:e.id,volume_level:i}};await this.hassService.CallService(s)}async volume_down(e){const t={domain:le,service:mi,serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}async volume_up(e){const t={domain:le,service:pi,serviceData:{entity_id:e.id}};await this.hassService.CallService(t)}}var yi,bi,Ci;!function(e){e.ALL="all",e.OFF="off",e.ONE="one"}(yi||(yi={})),function(e){e[e.PAUSE=1]="PAUSE",e[e.SEEK=2]="SEEK",e[e.VOLUME_SET=4]="VOLUME_SET",e[e.VOLUME_MUTE=8]="VOLUME_MUTE",e[e.PREVIOUS_TRACK=16]="PREVIOUS_TRACK",e[e.NEXT_TRACK=32]="NEXT_TRACK",e[e.TURN_ON=128]="TURN_ON",e[e.TURN_OFF=256]="TURN_OFF",e[e.PLAY_MEDIA=512]="PLAY_MEDIA",e[e.VOLUME_STEP=1024]="VOLUME_STEP",e[e.SELECT_SOURCE=2048]="SELECT_SOURCE",e[e.STOP=4096]="STOP",e[e.CLEAR_PLAYLIST=8192]="CLEAR_PLAYLIST",e[e.PLAY=16384]="PLAY",e[e.SHUFFLE_SET=32768]="SHUFFLE_SET",e[e.SELECT_SOUND_MODE=65536]="SELECT_SOUND_MODE",e[e.BROWSE_MEDIA=131072]="BROWSE_MEDIA",e[e.REPEAT_SET=262144]="REPEAT_SET",e[e.GROUPING=524288]="GROUPING",e[e.MEDIA_ANNOUNCE=1048576]="MEDIA_ANNOUNCE",e[e.MEDIA_ENQUEUE=2097152]="MEDIA_ENQUEUE"}(bi||(bi={})),function(e){e.OFF="off",e.ON="on",e.IDLE="idle",e.PLAYING="playing",e.PAUSED="paused",e.STANDBY="standby",e.BUFFERING="buffering",e.UNKNOWN="unknown"}(Ci||(Ci={}));const Si=Pe(de+":spotifyplus-service");class wi{constructor(e,t,i){this.hass=e,this.card=t,this.config=i}getDeviceId(e,t=null){return null==t&&(t=e.attributes.sp_device_is_brand_sonos?e.attributes.source||null:this.config.deviceControlByName?e.attributes.source||e.attributes.sp_device_id||null:e.attributes.sp_device_id||e.attributes.source||null),this.config.deviceDefaultId&&(t=this.config.deviceDefaultId,Si("getDeviceId - overriding device_id with config option deviceDefaultId: \n%s",JSON.stringify(this.config.deviceDefaultId))),t}async CallService(e){try{Si.enabled&&Si("%cCallService - Calling service %s (no response)\n%s","color: orange",JSON.stringify(e.service),JSON.stringify(e,null,2)),await this.hass.callService(e.domain,e.service,e.serviceData,e.target)}finally{}}async CallServiceWithResponse(e){try{Si.enabled&&Si("%cCallServiceWithResponse - Calling service %s (with response)\n%s","color: orange",JSON.stringify(e.service),JSON.stringify(e,null,2));return(await this.hass.callService(e.domain,e.service,e.serviceData,e.target,void 0,!0)).response||{}}finally{}}async AddPlayerQueueItems(e,t=null,i=null,s=!0,r=null){try{if(!e.isUserProductPremium())throw new Error(Se);i=this.getDeviceId(e,i);const o={entity_id:e.id,uris:t};null!=i&&(o.device_id=i),null!=s&&(o.verify_device_id=s),null!=r&&(o.delay=r);const a={domain:ne,service:"add_player_queue_items",serviceData:o};await this.CallService(a)}finally{}}async CheckAlbumFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"check_album_favorites",serviceData:i};return(await this.CallServiceWithResponse(s)).result}finally{}}async CheckArtistsFollowing(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"check_artists_following",serviceData:i};return(await this.CallServiceWithResponse(s)).result}finally{}}async CheckAudiobookFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"check_audiobook_favorites",serviceData:i};return(await this.CallServiceWithResponse(s)).result}finally{}}async CheckEpisodeFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"check_episode_favorites",serviceData:i};return(await this.CallServiceWithResponse(s)).result}finally{}}async CheckPlaylistFollowers(e,t,i=null){try{const s={entity_id:e.id,playlist_id:t};null!=i&&(s.user_ids=i);const r={domain:ne,service:"check_playlist_followers",serviceData:s};return(await this.CallServiceWithResponse(r)).result}finally{}}async CheckShowFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"check_show_favorites",serviceData:i};return(await this.CallServiceWithResponse(s)).result}finally{}}async CheckTrackFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"check_track_favorites",serviceData:i};return(await this.CallServiceWithResponse(s)).result}finally{}}async FollowArtists(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"follow_artists",serviceData:i};await this.CallService(s)}finally{}}async FollowPlaylist(e,t=null,i=!0){try{const s={entity_id:e.id};null!=t&&(s.playlist_id=t),null!=i&&(s.public=i);const r={domain:ne,service:"follow_playlist",serviceData:s};await this.CallService(r)}finally{}}async GetAlbum(e,t=null,i=null,s=!0){try{const r={entity_id:e.id};null!=t&&(r.album_id=t),null!=i&&(r.market=i);const o={domain:ne,service:"get_album",serviceData:r},a=(await this.CallServiceWithResponse(o)).result;return s&&null!=a&&null!=a.tracks&&(a.available_markets=[],a.images=[],a.tracks.items.forEach((e=>{e.available_markets=[]}))),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(o.service),JSON.stringify(a,null,2)),a}finally{}}async GetAlbumFavorites(e,t=null,i=null,s=null,r=null,o=null,a=!0){try{const n={entity_id:e.id};null!=t&&(n.limit=t),null!=i&&(n.offset=i),null!=s&&(n.market=s),null!=r&&(n.limit_total=r),null!=o&&(n.sort_result=o);const l={domain:ne,service:"get_album_favorites",serviceData:n},d=(await this.CallServiceWithResponse(l)).result;return a&&null!=d&&null!=d.items&&d.items.forEach((e=>{e.album.images=[],e.album.available_markets=[],e.album.tracks&&(e.album.tracks=JSON.parse("{ }"))})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(l.service),JSON.stringify(d,null,2)),d}finally{}}async GetAlbumTracks(e,t=null,i=null,s=null,r=null,o=null,a=!0){try{const n={entity_id:e.id};null!=t&&(n.album_id=t),null!=i&&(n.limit=i),null!=s&&(n.offset=s),null!=r&&(n.market=r),null!=o&&(n.limit_total=o);const l={domain:ne,service:"get_album_tracks",serviceData:n},d=(await this.CallServiceWithResponse(l)).result;return a&&null!=d&&null!=d.items&&d.items.forEach((e=>{e.available_markets=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(l.service),JSON.stringify(d,null,2)),d}finally{}}async GetArtistAlbums(e,t=null,i=null,s=null,r=null,o=null,a=null,n=null,l=!0){try{const d={entity_id:e.id};null!=t&&(d.artist_id=t),null!=i&&(d.include_groups=i),null!=s&&(d.limit=s),null!=r&&(d.offset=r),null!=o&&(d.market=o),null!=a&&(d.limit_total=a),null!=n&&(d.sort_result=n);const c={domain:ne,service:"get_artist_albums",serviceData:d},h=(await this.CallServiceWithResponse(c)).result;return l&&null!=h&&null!=h.items&&h.items.forEach((e=>{e.images=[],e.available_markets=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(c.service),JSON.stringify(h,null,2)),h}finally{}}async GetArtistInfo(e,t=null,i=!0){try{const i={entity_id:e.id};null!=t&&(i.artist_id=t);const s={domain:ne,service:"get_artist_info",serviceData:i},r=(await this.CallServiceWithResponse(s)).result;return Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(s.service),JSON.stringify(r,null,2)),r}finally{}}async GetArtistRelatedArtists(e,t=null,i=null,s=!0){try{const r={entity_id:e.id};null!=t&&(r.artist_id=t),null!=i&&(r.sort_result=i);const o={domain:ne,service:"get_artist_related_artists",serviceData:r},a=(await this.CallServiceWithResponse(o)).result;return s&&null!=a&&a.forEach((e=>{e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(o.service),JSON.stringify(a,null,2)),a}finally{}}async GetArtistTopTracks(e,t=null,i=null,s=null,r=!0){try{const o={entity_id:e.id};null!=t&&(o.artist_id=t),null!=i&&(o.market=i),null!=s&&(o.sort_result=s);const a={domain:ne,service:"get_artist_top_tracks",serviceData:o},n=(await this.CallServiceWithResponse(a)).result;return r&&null!=n&&n.forEach((e=>{e.available_markets=[],e.album.available_markets=[],e.album.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(a.service),JSON.stringify(n,null,2)),n}finally{}}async GetArtistsFollowed(e,t=null,i=null,s=null,r=null,o=!0){try{const a={entity_id:e.id};null!=t&&(a.after=t),null!=i&&(a.limit=i),null!=s&&(a.limit_total=s),null!=r&&(a.sort_result=r);const n={domain:ne,service:"get_artists_followed",serviceData:a},l=(await this.CallServiceWithResponse(n)).result;return o&&null!=l&&null!=l.items&&l.items.forEach((e=>{e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(n.service),JSON.stringify(l,null,2)),l}finally{}}async GetAudiobook(e,t=null,i=null,s=!0){try{const r={entity_id:e.id};null!=t&&(r.audiobook_id=t),null!=i&&(r.market=i);const o={domain:ne,service:"get_audiobook",serviceData:r},a=(await this.CallServiceWithResponse(o)).result;return s&&null!=a&&(a.available_markets=[],a.images=[],a.chapters?.forEach((e=>{e.items?.forEach((e=>{e.available_markets=[],e.description="see html_description",e.images=[]}))}))),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(o.service),JSON.stringify(a,null,2)),a}finally{}}async GetAudiobookChapters(e,t=null,i=null,s=null,r=null,o=null,a=!0){try{const n={entity_id:e.id};null!=t&&(n.audiobook_id=t),null!=i&&(n.limit=i),null!=s&&(n.offset=s),null!=r&&(n.market=r),null!=o&&(n.limit_total=o);const l={domain:ne,service:"get_audiobook_chapters",serviceData:n},d=(await this.CallServiceWithResponse(l)).result;return a&&null!=d&&null!=d.items&&d.items.forEach((e=>{e.available_markets=[],e.description="see html_description",e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(l.service),JSON.stringify(d,null,2)),d}finally{}}async GetAudiobookFavorites(e,t=null,i=null,s=null,r=null,o=!0){try{const a={entity_id:e.id};null!=t&&(a.limit=t),null!=i&&(a.offset=i),null!=s&&(a.limit_total=s),null!=r&&(a.sort_result=r);const n={domain:ne,service:"get_audiobook_favorites",serviceData:a},l=(await this.CallServiceWithResponse(n)).result;return o&&null!=l&&null!=l.items&&l.items.forEach((e=>{e.available_markets=[],e.description="see html_description",e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(n.service),JSON.stringify(l,null,2)),l}finally{}}async GetBrowseCategorysList(e,t=null,i=null,s=null,r=!0){try{const o={entity_id:e.id};null!=t&&(o.country=t),null!=i&&(o.locale=i),null!=s&&(o.refresh=s);const a={domain:ne,service:"get_browse_categorys_list",serviceData:o},n=(await this.CallServiceWithResponse(a)).result;return r&&null!=n&&null!=n.items&&n.items.forEach((e=>{e.icons=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(a.service),JSON.stringify(n,null,2)),n}finally{}}async GetCategoryPlaylists(e,t=null,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,category_id:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.country=r),null!=o&&(l.limit_total=o),null!=a&&(l.sort_result=a);const d={domain:ne,service:"get_category_playlists",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async GetChapter(e,t=null,i=null,s=!0){try{const r={entity_id:e.id};null!=t&&(r.chapter_id=t),null!=i&&(r.market=i);const o={domain:ne,service:"get_chapter",serviceData:r},a=(await this.CallServiceWithResponse(o)).result;return s&&null!=a&&(a.available_markets=[],a.description="see html_description",a.images=[],a.audiobook&&(a.audiobook.available_markets=[],a.audiobook.images=[],a.audiobook.description="see html_description")),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(o.service),JSON.stringify(a,null,2)),a}finally{}}async GetEpisode(e,t=null,i=null,s=!0){try{const r={entity_id:e.id};null!=t&&(r.episode_id=t),null!=i&&(r.market=i);const o={domain:ne,service:"get_episode",serviceData:r},a=(await this.CallServiceWithResponse(o)).result;return s&&null!=a&&(a.description="see html_description",a.images=[],a.show&&(a.show.available_markets=[],a.show.images=[],a.show.description="see html_description")),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(o.service),JSON.stringify(a,null,2)),a}finally{}}async GetEpisodeFavorites(e,t=null,i=null,s=null,r=null,o=!0){try{const a={entity_id:e.id};null!=t&&(a.limit=t),null!=i&&(a.offset=i),null!=s&&(a.limit_total=s),null!=r&&(a.sort_result=r);const n={domain:ne,service:"get_episode_favorites",serviceData:a},l=(await this.CallServiceWithResponse(n)).result;return o&&null!=l&&null!=l.items&&l.items.forEach((e=>{e.episode.description="see html_description",e.episode.images=[],e.episode.show.available_markets=[],e.episode.show.description="see html_description",e.episode.show.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(n.service),JSON.stringify(l,null,2)),l}finally{}}async GetPlayerQueueInfo(e,t=!0){try{if(!e.isUserProductPremium())throw new Error(Se);const i={entity_id:e.id},s={domain:ne,service:"get_player_queue_info",serviceData:i},r=(await this.CallServiceWithResponse(s)).result;if(t&&null!=r&&null!=r.queue){if(null!=r.currently_playing)if("track"==r.currently_playing_type){const e=r.currently_playing;e.available_markets=[],e.album&&(e.album.available_markets=[],e.album.images=[])}else if("episode"==r.currently_playing_type){const e=r.currently_playing;e.description="see html_description",e.show&&(e.show.available_markets=[],e.show.description="see html_description",e.show.images=[])}r.queue.forEach((e=>{if("track"==e.type){const t=e;t.available_markets=[],t.album&&(t.album.available_markets=[],t.album.images=[])}else if("episode"==e.type){const t=e;t.description="see html_description",t.show&&(t.show.available_markets=[],t.show.description="see html_description",t.show.images=[])}}))}return Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(s.service),JSON.stringify(r,null,2)),r}finally{}}async GetPlayerRecentTracks(e,t=null,i=null,s=null,r=null,o=!0){try{const a={entity_id:e.id};null!=t&&(a.limit=t),null!=i&&(a.after=i),null!=s&&(a.before=s),null!=r&&(a.limit_total=r);const n={domain:ne,service:"get_player_recent_tracks",serviceData:a},l=(await this.CallServiceWithResponse(n)).result;return o&&null!=l&&null!=l.items&&l.items.forEach((e=>{e.track.available_markets=[],e.track.album.images=[],e.track.album.available_markets=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(n.service),JSON.stringify(l,null,2)),l}finally{}}async GetPlaylistFavorites(e,t=null,i=null,s=null,r=null,o=!0){try{const a={entity_id:e.id};null!=t&&(a.limit=t),null!=i&&(a.offset=i),null!=s&&(a.limit_total=s),null!=r&&(a.sort_result=r);const n={domain:ne,service:"get_playlist_favorites",serviceData:a},l=(await this.CallServiceWithResponse(n)).result;return o&&null!=l&&null!=l.items&&l.items.forEach((e=>{e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(n.service),JSON.stringify(l,null,2)),l}finally{}}async GetPlaylistItems(e,t=null,i=null,s=null,r=null,o=null,a=null,n=null,l=!0){try{const d={entity_id:e.id};null!=t&&(d.playlist_id=t),null!=i&&(d.limit=i),null!=s&&(d.offset=s),null!=r&&(d.market=r),null!=o&&(d.fields=o),null!=a&&(d.additional_types=a),null!=n&&(d.limit_total=n);const c={domain:ne,service:"get_playlist_items",serviceData:d},h=(await this.CallServiceWithResponse(c)).result;return l&&null!=h&&null!=h.items&&h.items.forEach((e=>{e.track&&(e.track.available_markets&&(e.track.available_markets=[]),e.track.album&&(e.track.album.images=[],e.track.album.available_markets&&(e.track.album.available_markets=[])))})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(c.service),JSON.stringify(h,null,2)),h}finally{}}async GetSpotifyConnectDevice(e,t,i=null,s=null,r=null,o=null,a=null){try{const n={entity_id:e.id,device_value:t};null!=i&&(n.verify_user_context=i),null!=s&&(n.verify_timeout=s),null!=r&&(n.refresh_device_list=r),null!=o&&(n.activate_device=o),null!=a&&(n.delay=a);const l={domain:ne,service:"get_spotify_connect_device",serviceData:n},d=(await this.CallServiceWithResponse(l)).result;if(null!=d){const e=(d.Name||"").toLocaleLowerCase();"group"==(d.DeviceInfo.GroupStatus||"").toLocaleLowerCase()?d.image_url=St(Xt):e.includes("web player (chrome)")?d.image_url=St(Ut):e.includes("web player (microsoft edge)")?d.image_url=St(qt):e.includes("web player")?d.image_url=St(Qt):1==d.IsChromeCast?d.image_url=St(xt):d.image_url=St(Zt)}return Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(l.service),JSON.stringify(d,null,2)),d}finally{}}async GetSpotifyConnectDevices(e,t=null,i=null,s=null){try{Si.enabled&&Si("%cGetSpotifyConnectDevices - retrieving device list from %s","color: orange;",t?"real-time query":"internal device cache");const r={entity_id:e.id};null!=t&&(r.refresh=t),null!=i&&(r.sort_result=i);const o={domain:ne,service:"get_spotify_connect_devices",serviceData:r},a=(await this.CallServiceWithResponse(o)).result;if(null!=a&&null!=a.Items){for(let e=a.Items.length-1;e>=0;e--){let t=a.Items[e].Name.toLowerCase();t=t.replaceAll("\n",""),t=t.replaceAll("\r",""),(s?.includes(t)||s?.includes(a.Items[e].Id.toLowerCase()))&&a.Items.splice(e,1)}a.Items.forEach((e=>{const t=(e.Name||"").toLocaleLowerCase();"group"==(e.DeviceInfo.GroupStatus||"").toLocaleLowerCase()?e.image_url=St(Xt):t.includes("web player (chrome)")?e.image_url=St(Ut):t.includes("web player (microsoft edge)")?e.image_url=St(qt):t.includes("web player")?e.image_url=St(Qt):1==e.IsChromeCast?e.image_url=St(xt):e.image_url=St(Zt)}))}return Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(o.service),JSON.stringify(a,null,2)),a}finally{}}async GetShowEpisodes(e,t=null,i=null,s=null,r=null,o=null,a=!0){try{const n={entity_id:e.id};null!=t&&(n.show_id=t),null!=i&&(n.limit=i),null!=s&&(n.offset=s),null!=r&&(n.market=r),null!=o&&(n.limit_total=o);const l={domain:ne,service:"get_show_episodes",serviceData:n},d=(await this.CallServiceWithResponse(l)).result;return a&&null!=d&&null!=d.items&&d.items.forEach((e=>{e.description="see html_description",e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(l.service),JSON.stringify(d,null,2)),d}finally{}}async GetShowFavorites(e,t=null,i=null,s=null,r=null,o=!0,a=!0){try{const n={entity_id:e.id};null!=t&&(n.limit=t),null!=i&&(n.offset=i),null!=s&&(n.limit_total=s),null!=r&&(n.sort_result=r),null!=o&&(n.exclude_audiobooks=o);const l={domain:ne,service:"get_show_favorites",serviceData:n},d=(await this.CallServiceWithResponse(l)).result;return a&&null!=d&&null!=d.items&&d.items.forEach((e=>{e.show.available_markets=[],e.show.description="see html_description",e.show.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(l.service),JSON.stringify(d,null,2)),d}finally{}}async GetTrack(e,t=null,i=!0){try{const s={entity_id:e.id};null!=t&&(s.track_id=t);const r={domain:ne,service:"get_track",serviceData:s},o=(await this.CallServiceWithResponse(r)).result;return i&&null!=o&&(o.available_markets=[],o.album.available_markets=[],o.album.images=[]),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(r.service),JSON.stringify(o,null,2)),o}finally{}}async GetTrackFavorites(e,t=null,i=null,s=null,r=null,o=null,a=null,n=null,l=!0){try{const d={entity_id:e.id};null!=t&&(d.limit=t),null!=i&&(d.offset=i),null!=s&&(d.market=s),null!=r&&(d.limit_total=r),null!=o&&(d.sort_result=o),null!=a&&(d.filter_artist=a),null!=n&&(d.filter_album=n);const c={domain:ne,service:"get_track_favorites",serviceData:d},h=(await this.CallServiceWithResponse(c)).result;return l&&null!=h&&null!=h.items&&h.items.forEach((e=>{e.track.available_markets=[],e.track.album.available_markets=[],e.track.album.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(c.service),JSON.stringify(h,null,2)),h}finally{}}async GetTrackRecommendations(e,t=null,i=null,s=null,r=!0){try{const o={entity_id:e.id};null!=i&&(o.limit=i),null!=s&&(o.market=s),t&&(t.seed_artists&&(o.seed_artists=t.seed_artists),t.seed_genres&&(o.seed_genres=t.seed_genres),t.seed_tracks&&(o.seed_tracks=t.seed_tracks),t.max_acousticness&&(o.max_acousticness=t.max_acousticness),t.min_acousticness&&(o.min_acousticness=t.min_acousticness),t.target_acousticness&&(o.target_acousticness=t.target_acousticness),t.max_danceability&&(o.max_danceability=t.max_danceability),t.min_danceability&&(o.min_danceability=t.min_danceability),t.target_danceability&&(o.target_danceability=t.target_danceability),t.max_duration_ms&&(o.max_duration_ms=t.max_duration_ms),t.min_duration_ms&&(o.min_duration_ms=t.min_duration_ms),t.target_duration_ms&&(o.target_duration_ms=t.target_duration_ms),t.max_energy&&(o.max_energy=t.max_energy),t.min_energy&&(o.min_energy=t.min_energy),t.target_energy&&(o.target_energy=t.target_energy),t.max_instrumentalness&&(o.max_instrumentalness=t.max_instrumentalness),t.min_instrumentalness&&(o.min_instrumentalness=t.min_instrumentalness),t.target_instrumentalness&&(o.target_instrumentalness=t.target_instrumentalness),t.max_key&&(o.max_key=t.max_key),t.min_key&&(o.min_key=t.min_key),t.target_key&&(o.target_key=t.target_key),t.max_liveness&&(o.max_liveness=t.max_liveness),t.min_liveness&&(o.min_liveness=t.min_liveness),t.target_liveness&&(o.target_liveness=t.target_liveness),t.max_loudness&&(o.max_loudness=t.max_loudness),t.min_loudness&&(o.min_loudness=t.min_loudness),t.target_loudness&&(o.target_loudness=t.target_loudness),t.max_mode&&(o.max_mode=t.max_mode),t.min_mode&&(o.min_mode=t.min_mode),t.target_mode&&(o.target_mode=t.target_mode),t.max_popularity&&(o.max_popularity=t.max_popularity),t.min_popularity&&(o.min_popularity=t.min_popularity),t.target_popularity&&(o.target_popularity=t.target_popularity),t.max_speechiness&&(o.max_speechiness=t.max_speechiness),t.min_speechiness&&(o.min_speechiness=t.min_speechiness),t.target_speechiness&&(o.target_speechiness=t.target_speechiness),t.max_tempo&&(o.max_tempo=t.max_tempo),t.min_tempo&&(o.min_tempo=t.min_tempo),t.target_tempo&&(o.target_tempo=t.target_tempo),t.max_time_signature&&(o.max_time_signature=t.max_time_signature),t.min_time_signature&&(o.min_time_signature=t.min_time_signature),t.target_time_signature&&(o.target_time_signature=t.target_time_signature),t.max_valence&&(o.max_valence=t.max_valence),t.min_valence&&(o.min_valence=t.min_valence),t.target_valence&&(o.target_valence=t.target_valence));const a={domain:ne,service:"get_track_recommendations",serviceData:o},n=(await this.CallServiceWithResponse(a)).result;return r&&null!=n&&n.tracks.forEach((e=>{e.available_markets=[],e.album.available_markets=[],e.album.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(a.service),JSON.stringify(n,null,2)),n}finally{}}async PlayerMediaPlayContext(e,t,i=null,s=null,r=null,o=null,a=null,n=null){try{if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);if(!t)throw new Error("STPC0005 context_uri argument was not supplied to the PlayerMediaPlayContext service.");o=this.getDeviceId(e,o);const l={entity_id:e.id,context_uri:t};null!=i&&(l.offset_uri=i),null!=s&&(l.offset_position=s),null!=r&&(l.position_ms=r),null!=o&&(l.device_id=o),null!=a&&(l.delay=a),null!=n&&(l.shuffle=n);const d={domain:ne,service:"player_media_play_context",serviceData:l};await this.CallService(d)}finally{}}async PlayerMediaPlayTrackFavorites(e,t=null,i=null,s=null,r=null,o=null,a=null,n=null){try{if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);t=this.getDeviceId(e,t);const l={entity_id:e.id};null!=t&&(l.device_id=t),null!=i&&(l.shuffle=i),null!=s&&(l.delay=s),null!=r&&(l.resolve_device_id=r),null!=o&&(l.limit_total=o),null!=a&&(l.filter_artist=a),null!=n&&(l.filter_album=n);const d={domain:ne,service:"player_media_play_track_favorites",serviceData:l};await this.CallService(d)}finally{}}async PlayerMediaPlayTracks(e,t,i=null,s=null,r=null,o=null){try{if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);if(!t)throw new Error("STPC0005 uris argument was not supplied to the PlayerMediaPlayTracks service.");null==i&&(i=0),s=this.getDeviceId(e,s);const a={entity_id:e.id,uris:t};null!=i&&(a.position_ms=i),null!=s&&(a.device_id=s),null!=r&&(a.delay=r),null!=o&&(a.shuffle=o);const n={domain:ne,service:"player_media_play_tracks",serviceData:a};await this.CallService(n)}finally{}}async PlayerSetShuffleMode(e,t=null,i=null,s=null){try{if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);t=this.getDeviceId(e,t);const r={entity_id:e.id};null!=i&&(r.state=i),null!=t&&(r.device_id=t),null!=s&&(r.delay=s);const o={domain:ne,service:"player_set_shuffle_mode",serviceData:r};await this.CallService(o)}finally{}}async PlayerTransferPlayback(e,t=null,i=!0,s=null,r=!0,o=!0,a=null){try{if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);null==i&&(i=!0),t=this.getDeviceId(e,t);const n={entity_id:e.id};null!=t&&(n.device_id=t),null!=i&&(n.play=i),null!=s&&(n.delay=s),null!=r&&(n.refresh_device_list=r),null!=o&&(n.force_activate_device=o),null!=a&&(n.device_id_from=a);const l={domain:ne,service:"player_transfer_playback",serviceData:n};await this.CallService(l)}finally{}}async RemoveAlbumFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"remove_album_favorites",serviceData:i};await this.CallService(s)}finally{}}async RemoveAudiobookFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"remove_audiobook_favorites",serviceData:i};await this.CallService(s)}finally{}}async RemoveEpisodeFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"remove_episode_favorites",serviceData:i};await this.CallService(s)}finally{}}async RemoveShowFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"remove_show_favorites",serviceData:i};await this.CallService(s)}finally{}}async RemoveTrackFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"remove_track_favorites",serviceData:i};await this.CallService(s)}finally{}}async SaveAlbumFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"save_album_favorites",serviceData:i};await this.CallService(s)}finally{}}async SaveAudiobookFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"save_audiobook_favorites",serviceData:i};await this.CallService(s)}finally{}}async SaveEpisodeFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"save_episode_favorites",serviceData:i};await this.CallService(s)}finally{}}async SaveShowFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"save_show_favorites",serviceData:i};await this.CallService(s)}finally{}}async SaveTrackFavorites(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"save_track_favorites",serviceData:i};await this.CallService(s)}finally{}}async Search(e,t,i,s=null,r=null,o=null,a=null,n=null){try{if(e==kt.ALBUMS)return await this.SearchAlbums(t,i,s,r,o,a,n);if(e==kt.ARTISTS)return await this.SearchArtists(t,i,s,r,o,a,n);if(e==kt.AUDIOBOOKS)return await this.SearchAudiobooks(t,i,s,r,o,a,n);if(e==kt.EPISODES)return await this.SearchEpisodes(t,i,s,r,o,a,n);if(e==kt.PLAYLISTS)return await this.SearchPlaylists(t,i,s,r,o,a,n);if(e==kt.SHOWS)return await this.SearchShows(t,i,s,r,o,a,n);if(e==kt.TRACKS)return await this.SearchTracks(t,i,s,r,o,a,n);throw new Error('searchMediaType was not recognized: "'+e+'".')}finally{}}async SearchAlbums(e,t,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,criteria:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.market=r),null!=o&&(l.include_external=o),null!=a&&(l.limit_total=a);const d={domain:ne,service:"search_albums",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.images=[],e.available_markets=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async SearchArtists(e,t,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,criteria:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.market=r),null!=o&&(l.include_external=o),null!=a&&(l.limit_total=a);const d={domain:ne,service:"search_artists",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async SearchAudiobooks(e,t,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,criteria:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.market=r),null!=o&&(l.include_external=o),null!=a&&(l.limit_total=a);const d={domain:ne,service:"search_audiobooks",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.images=[],e.available_markets=[],e.description="see html_description"})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async SearchEpisodes(e,t,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,criteria:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.market=r),null!=o&&(l.include_external=o),null!=a&&(l.limit_total=a);const d={domain:ne,service:"search_episodes",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.images=[],e.description="see html_description"})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async SearchPlaylists(e,t,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,criteria:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.market=r),null!=o&&(l.include_external=o),null!=a&&(l.limit_total=a);const d={domain:ne,service:"search_playlists",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.images=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async SearchShows(e,t,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,criteria:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.market=r),null!=o&&(l.include_external=o),null!=a&&(l.limit_total=a);const d={domain:ne,service:"search_shows",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.images=[],e.available_markets=[],e.description="see html_description"})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async SearchTracks(e,t,i=null,s=null,r=null,o=null,a=null,n=!0){try{const l={entity_id:e.id,criteria:t};null!=i&&(l.limit=i),null!=s&&(l.offset=s),null!=r&&(l.market=r),null!=o&&(l.include_external=o),null!=a&&(l.limit_total=a);const d={domain:ne,service:"search_tracks",serviceData:l},c=(await this.CallServiceWithResponse(d)).result;return n&&null!=c&&null!=c.items&&c.items.forEach((e=>{e.album&&(e.album.images=[],e.album.available_markets=[]),e.available_markets=[]})),Si.enabled&&Si("%cCallServiceWithResponse - Service %s response (trimmed):\n%s","color: orange",JSON.stringify(d.service),JSON.stringify(c,null,2)),c}finally{}}async UnfollowArtists(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.ids=t);const s={domain:ne,service:"unfollow_artists",serviceData:i};await this.CallService(s)}finally{}}async UnfollowPlaylist(e,t=null){try{const i={entity_id:e.id};null!=t&&(i.playlist_id=t);const s={domain:ne,service:"unfollow_playlist",serviceData:i};await this.CallService(s)}finally{}}async VolumeSetStepLevel(e,t){const i=t/100,s={domain:ne,service:"volume_set_step",serviceData:{entity_id:e.id,level:i}};await this.CallService(s)}async ZeroconfDeviceConnect(e,t,i=null,s=null,r=null,o=!0,a=!0,n=null){try{Si.enabled&&Si("ZeroconfDeviceDisconnect - device item:\n%s",JSON.stringify(t,null,2));const l={entity_id:e.id,host_ipv4_address:t.DiscoveryResult.HostIpAddress,host_ip_port:t.DiscoveryResult.HostIpPort,cpath:t.DiscoveryResult.SpotifyConnectCPath,version:t.DiscoveryResult.SpotifyConnectVersion,use_ssl:t.DiscoveryResult.ZeroconfApiEndpointAddUser.startsWith("https:")};null!=i&&(l.username=i),null!=s&&(l.password=s),null!=r&&(l.loginid=r),null!=o&&(l.pre_disconnect=o),null!=a&&(l.verify_device_list_entry=a),null!=n&&(l.delay=n);const d={domain:ne,service:"zeroconf_device_connect",serviceData:l};return(await this.CallServiceWithResponse(d)).result}finally{}}async ZeroconfDeviceDisconnect(e,t,i=null){try{Si.enabled&&Si("ZeroconfDeviceDisconnect - device item:\n%s",JSON.stringify(t,null,2));const s={entity_id:e.id,host_ipv4_address:t.DiscoveryResult.HostIpAddress,host_ip_port:t.DiscoveryResult.HostIpPort,cpath:t.DiscoveryResult.SpotifyConnectCPath,version:t.DiscoveryResult.SpotifyConnectVersion,use_ssl:t.DiscoveryResult.ZeroconfApiEndpointAddUser.startsWith("https:")};null!=i&&(s.delay=i);const r={domain:ne,service:"zeroconf_device_disconnect",serviceData:s};return(await this.CallServiceWithResponse(r)).result}finally{}}async select_source(e,t=null){if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);const i={entity_id:e.id};t&&(i.source=t);const s={domain:le,service:fi,serviceData:i};await this.CallService(s)}async turn_off(e){const t={entity_id:e.id},i={domain:le,service:ui,serviceData:t};await this.CallService(i)}async turn_on(e){const t={entity_id:e.id},i={domain:le,service:hi,serviceData:t};await this.CallService(i),this.config.deviceDefaultId&&(e.isUserProductPremium()||e.attributes.sp_user_has_web_player_credentials)&&await this.PlayerTransferPlayback(e,this.config.deviceDefaultId,!0)}async volume_mute(e,t){if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);const i={domain:le,service:vi,serviceData:{entity_id:e.id,is_volume_muted:t}};await this.CallService(i)}async volume_mute_toggle(e){const t=!e.isMuted();await this.volume_mute(e,t)}async volume_set(e,t){if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);const i=t/100,s={domain:le,service:gi,serviceData:{entity_id:e.id,volume_level:i}};await this.CallService(s)}async volume_down(e){const t={domain:le,service:mi,serviceData:{entity_id:e.id}};await this.CallService(t)}async volume_up(e){const t={domain:le,service:pi,serviceData:{entity_id:e.id}};await this.CallService(t)}async Card_PlayMediaBrowserItem(e,t){if(!e.isUserProductPremium()&&!e.attributes.sp_user_has_web_player_credentials)throw new Error(Se);if(!e)throw new Error("Media player argument was not supplied to the PlayMediaBrowserItem service.");if(!t)throw new Error("Media browser item argument was not supplied to the PlayMediaBrowserItem service.");try{const i=function(e){let t=e;if(e){const i=e.indexOf(":");if(i>-1){const s=e.lastIndexOf(":");s>-1&&(t=e.substring(i+1,s))}}return t}(t.uri)||"";if(Si.enabled&&Si("Card_PlayMediaBrowserItem - play media item\n- player.id = %s\n- mediaItem.uri = %s\n- uriType = %s",JSON.stringify(e.id),JSON.stringify(t.uri),JSON.stringify(i)),["album","artist","playlist","show","audiobook","podcast"].indexOf(i)>-1)await this.PlayerMediaPlayContext(e,t.uri||"");else{if(!(["track","episode","chapter"].indexOf(i)>-1))throw new Error('unknown media type "'+i+'".');await this.PlayerMediaPlayTracks(e,t.uri||"")}}finally{}}}function Ii(e){let t=e;if(e){const i=e.lastIndexOf(":");i>-1&&(t=e.substring(i+1))}return t}function Ti(e,t){null==t&&(t="; ");let i="";if(e)for(const s of e.copyrights||[])null!=s&&null!=s.text&&s.text.length>0&&(i.length>0&&(i+=t),i+=s.text);return i}const ki=Pe(de+":user-presets");function _i(e,t=null){const i={name:e.name,image_url:e.image_url||"",subtitle:t||e.type,type:e.type,uri:e.uri};return ki.enabled&&ki("%cGetUserPresetConfigEntry - preset object:\n%s","color: orange",JSON.stringify(i,null,2)),i}function Ei(e,t=null){const i=_i(e,t),s="\n";let r="";return r+="  - name: "+i.name+s,r+="    subtitle: "+i.type+s,r+="    image_url: "+i.image_url+s,r+="    uri: "+i.uri+s,r+="    type: "+i.type+s,r}function $i(e,t=null){const i=_i(e,t),s="\n";let r="";return r+="  {\n",r+='    "name": "'+i.name+'",'+s,r+='    "subtitle": "'+i.type+'",'+s,r+='    "image_url": "'+i.image_url+'",'+s,r+='    "uri": "'+i.uri+'",'+s,r+='    "type": "'+i.type+'"'+s,r+="  },\n",r}function Pi(e){if(!e||"object"!=typeof e)return e;if("[object Date]"==Object.prototype.toString.call(e))return new Date(e.getTime());if(Array.isArray(e))return e.map(Pi);var t={};return Object.keys(e).forEach((function(i){t[i]=Pi(e[i])})),t}const Fi=Pe(de+":hass-service");class Li{constructor(e){this.hass=e}async CallService(e){try{Fi.enabled&&Fi("%cCallService - Calling service %s (no response)\n%s","color: orange;",JSON.stringify(e.service),JSON.stringify(e,null,2)),await this.hass.callService(e.domain,e.service,e.serviceData,e.target)}finally{}}async browseMedia(e,t,i){return await this.hass.callWS({type:"media_player/browse_media",entity_id:e.id,media_content_id:i,media_content_type:t})}async getRelatedEntities(e,...t){return new Promise((async(i,s)=>{const r={type:"render_template",template:"{{ device_entities(device_id('"+e.id+"')) }}"};try{const e=await this.hass.connection.subscribeMessage((s=>{e(),i(s.result.filter((e=>t.some((t=>e.includes(t))))).map((e=>this.hass.states[e])))}),r)}catch(e){s(e)}}))}}class Ri{constructor(e){this.id=e.entity_id,this.state=e.state,this.attributes=e.attributes,this.name=this.attributes.friendly_name||""}getVolume(){return this.attributes.volume_level?Math.round(100*this.attributes.volume_level):0}isIdle(){return this.state===Ci.IDLE}isIdleOrUnknown(){return this.state===Ci.IDLE||this.state===Ci.UNKNOWN}isUserProductPremium(){return"premium"===this.attributes.sp_user_product}isPlaying(){return this.state===Ci.PLAYING}isPoweredOff(){return this.state===Ci.OFF}isPoweredOffOrIdle(){return this.state===Ci.OFF||this.state===Ci.IDLE||this.state===Ci.UNKNOWN}isPoweredOffOrUnknown(){return this.state===Ci.OFF||this.state===Ci.UNKNOWN}isMuted(){return this.attributes.is_volume_muted||!1}supportsFeature(e){return!!((this.attributes.supported_features||0)&e)}}function Oi(e,t){let i=null;const s=Object.values(e.entities).filter((e=>e.entity_id.match(t)));if(!s)return i;const r=t.toLowerCase();return s.forEach((e=>{const t=e;t.entity_id.toLowerCase()==r&&(i=t)})),i}function Mi(e,t){let i=null;const s=Object.values(e.states).filter((e=>e.entity_id.match(t)));if(!s)return i;const r=t.toLowerCase();return s.forEach((e=>{const t=e;t.entity_id.toLowerCase()==r&&(i=t)})),i}const xi=Pe(de+":store");class Bi{constructor(e,t,i,s){if(!e)throw new Error("STPC0005 hass property has not been set!");this.hass=e,this.config=t,this.card=i,this.hassService=new Li(e),this.mediaControlService=new Ai(this.hassService),this.spotifyPlusService=new wi(e,i,t),this.player=this.getMediaPlayerObject(),this.section=s,xi.enabled}getMediaPlayerObject(){const e=this.config.entity+"";let t=null,i="";for(;;){if(!this.config||!this.config.entity||""==this.config.entity.trim())break;const s=Oi(this.hass,e);if(!s){i="Card configuration `entity` value "+JSON.stringify(e)+" is not defined in HA entities table; is it disabled? is `entity` value spelled correctly (search is case-sensitive)?";break}if(s.platform!=ne){i="Card configuration `entity` value "+JSON.stringify(e)+" is not a "+JSON.stringify(ne)+" platform media player.";break}const r=Mi(this.hass,this.config.entity);if(!r){i="Card configuration `entity` value "+JSON.stringify(e)+" could not be found in the HA state machine.";break}if(t=new Ri(r),t)return t;i="Card configuration `entity` value "+JSON.stringify(e)+" was not found in the HA state machine; is it disabled?";break}return t=new Ri({entity_id:"",state:"",last_changed:"",last_updated:"",attributes:{sp_config_state:i},context:{id:"",user_id:"",parent_id:""}}),t}}Bi.selectedConfigArea=et.GENERAL,Bi.hasCardEditLoadedMediaList={};const Hi=Pe(de+":lovelace-config-utils");function Ui(e,t,i,s){if("object"!=typeof e||null===e)return e;if(e.hasOwnProperty("type")&&e.type===s.type&&e.hasOwnProperty(t)&&e[t]===i)return s;const r=Pi(e);for(const o in e)e.hasOwnProperty(o)&&(r[o]=Ui(e[o],t,i,s));return r}async function Vi(e){try{if(Hi.enabled&&Hi("%cupdateCardConfigurationStorage - updating Lovelace Card Configuration storage\n- cardUniqueId = %s\n- card configuration object:\n%s","color: white",JSON.stringify(e.cardUniqueId),JSON.stringify(e,null,2)),!e.cardUniqueId)throw new Error("Card Configuration does not have a cardUniqueId option value; this value is required in order to update the card programatically outside of the card editor UI.");const t=function(){let e=document.querySelector("home-assistant");if(e=e&&e.shadowRoot,e=e&&e.querySelector("home-assistant-main"),e=e&&e.shadowRoot,e=e&&e.querySelector("app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver"),e=e&&e.shadowRoot||e,e=e&&e.querySelector("ha-panel-lovelace"),e=e&&e.shadowRoot,e=e&&e.querySelector("hui-root"),e){const t=e.lovelace;return t.current_view=e.___curView,t}return null}();if(!t)throw new Error("Could not get HA lovelace object reference; please notify the card developer of this error.");Hi.enabled&&(Hi("%cupdateCardConfigurationStorage - Lovelace.rawConfig object BEFORE replace:\n%s","color: orange",JSON.stringify(t.rawConfig,null,2)),Hi("%cupdateCardConfigurationStorage - card configuration that contains cardUniqueId = %s will be replaced","color: gold",JSON.stringify(e.cardUniqueId)));const i=Ui(t.rawConfig,"cardUniqueId",e.cardUniqueId,e);Hi.enabled&&(Hi("%cupdateCardConfigurationStorage - Lovelace.rawConfig object AFTER replace:\n%s","color: gold",JSON.stringify(i,null,2)),Hi("%cupdateCardConfigurationStorage - Saving Lovelace raw configuration to storage","color: white")),t.saveConfig(i),Hi.enabled&&Hi("%cupdateCardConfigurationStorage - Lovelace raw configuration saved to storage","color: white"),Bi.selectedConfigArea=ht(Qe.USERPRESETS)}catch(e){const t=At(e);throw Hi.enabled&&Hi("%cupdateCardConfigurationStorage - Configuration update failed:\n%s","color: red",JSON.stringify(t)),new Error("Configuration update failed: "+t)}}var Di;!function(e){e.AlbumCopyPresetToClipboard="AlbumCopyPresetToClipboard",e.AlbumCopyPresetJsonToClipboard="AlbumCopyPresetJsonToClipboard",e.AlbumCopyUriToClipboard="AlbumCopyUriToClipboard",e.AlbumFavoriteAdd="AlbumFavoriteAdd",e.AlbumFavoriteRemove="AlbumFavoriteRemove",e.AlbumFavoriteUpdate="AlbumFavoriteUpdate",e.AlbumPlayTrackFavorites="AlbumPlayTrackFavorites",e.AlbumTrackQueueAdd="AlbumTrackQueueAdd",e.AlbumTracksUpdate="AlbumTracksUpdate",e.AlbumSearchRadio="AlbumSearchRadio",e.AlbumShowTracks="AlbumShowTracks",e.AlbumUserPresetAdd="AlbumUserPresetAdd",e.ArtistCopyPresetToClipboard="ArtistCopyPresetToClipboard",e.ArtistCopyPresetJsonToClipboard="ArtistCopyPresetJsonToClipboard",e.ArtistCopyUriToClipboard="ArtistCopyUriToClipboard",e.ArtistFavoriteAdd="ArtistFavoriteAdd",e.ArtistFavoriteRemove="ArtistFavoriteRemove",e.ArtistFavoriteUpdate="ArtistFavoriteUpdate",e.ArtistPlayTrackFavorites="ArtistPlayTrackFavorites",e.ArtistSearchPlaylists="ArtistSearchPlaylists",e.ArtistSearchRadio="ArtistSearchRadio",e.ArtistSearchTracks="ArtistSearchTracks",e.ArtistShowAlbums="ArtistShowAlbums",e.ArtistShowAlbumsAppearsOn="ArtistShowAlbumsAppearsOn",e.ArtistShowAlbumsCompilation="ArtistShowAlbumsCompilation",e.ArtistShowAlbumsSingle="ArtistShowAlbumsSingle",e.ArtistShowRelatedArtists="ArtistShowRelatedArtists",e.ArtistShowTopTracks="ArtistShowTopTracks",e.ArtistUserPresetAdd="ArtistUserPresetAdd"}(Di||(Di={}));class Ni extends ni{constructor(){super(Qe.ALBUM_FAVORITES)}render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Artist &quot;${this.mediaItem.artists[0].name}&quot; to Favorites"
          @click=${()=>this.onClickAction(Di.ArtistFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Artist &quot;${this.mediaItem.artists[0].name}&quot; from Favorites"
          @click=${()=>this.onClickAction(Di.ArtistFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Dt}
          label="Add Album &quot;${this.mediaItem.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(Di.AlbumFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Album &quot;${this.mediaItem.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(Di.AlbumFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,r=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Lt}
          .label="View Artist &quot;${this.mediaItem.artists[0].name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.artists[0].external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,o=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Rt}
          .label="View Album &quot;${this.mediaItem.name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,a=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.AlbumPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play Favorite Tracks from this Album</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.AlbumShowTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Show Album Tracks</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.AlbumSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Album Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.AlbumUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Album to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.AlbumCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Album Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.AlbumCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Album Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.AlbumCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Album URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,n=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play Favorite Tracks from this Artist</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistSearchPlaylists)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Search Playlists for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistSearchTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Search Tracks for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Artist Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistShowTopTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Show Artist Top Tracks</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistShowAlbums)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistShowAlbumsCompilation)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Compilations</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistShowAlbumsSingle)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Singles</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistShowAlbumsAppearsOn)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums AppearsOn</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistShowRelatedArtists)} hide=${this.hideSearchType(kt.ARTISTS)}>
          <ha-svg-icon slot="start" .path=${Lt}></ha-svg-icon>
          <div slot="headline">Show Related Artists</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Artist to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Di.ArtistCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Artist URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H` 
      <div class="album-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.mediaItem.image_url});"></div>
          <div class="media-info-details">
            <div class="media-info-text-ms-c">
              ${o}
              ${this.mediaItem.name}
              ${this.isAlbumFavorite?s:i}
              <span class="actions-dropdown-menu">
                ${a}
              </span>
            </div>
            <div class="media-info-text-ms">
              ${r}
              ${this.mediaItem.artists[0].name}
              ${this.isArtistFavorite?t:e}
              <span class="actions-dropdown-menu">
                ${n}
              </span>
            </div>
            <div class="grid album-info-grid">
              <div class="grid-action-info-hdr-s">Released</div>
              <div class="grid-action-info-text-s">${this.mediaItem.release_date}</div>

              <div class="grid-action-info-hdr-s"># Tracks</div>
              <div class="grid-action-info-text-s">${this.mediaItem.total_tracks}</div>

              ${"label"in this.mediaItem?H`
                <div class="grid-action-info-hdr-s">Label</div>
                <div class="grid-action-info-text-s">${this.mediaItem.label}</div>
                `:""}

              ${"copyrights"in this.mediaItem?H`
                <div class="grid-action-info-hdr-s">Copyright</div>
                <div class="grid-action-info-text-s">${Ti(this.mediaItem,"; ")}</div>
                `:""}

              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.mediaItem.uri}</div>
            </div>
          </div>
        </div>
        <div class="grid-container-scrollable">
          <div class="grid tracks-grid">
            <div class="grid-header">&nbsp;</div>
            <div class="grid-header">#</div>
            <div class="grid-header">Title</div>
            <div class="grid-header">Artist</div>
            <div class="grid-header grid-header-last">Duration</div>
            ${this.albumTracks?.items.map((e=>H`
              <ha-icon-button
                .path=${Yt}
                .label="Add track &quot;${e.name}&quot; to Play Queue"
                @click=${()=>this.AddPlayerQueueItem(e)}
                slot="icon-button"
              >&nbsp;</ha-icon-button>
              <div class="grid-entry">${e.track_number}</div>
              <div class="grid-entry">${e.name}</div>
              <div class="grid-entry">${e.artists[0].name}</div>
              <div class="grid-entry">${lt(e.duration_ms)}</div>
            `))}
          </div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .album-info-grid {
        grid-template-columns: auto auto;
        justify-content: left;
      }

      .album-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      /* style tracks container and grid */
      .tracks-grid {
        grid-template-columns: 40px 30px auto auto 60px;
      }

      /* style ha-icon-button controls in tracks grid: icon size, title text */
      .tracks-grid > ha-icon-button[slot="icon-button"] {
        --mdc-icon-button-size: 24px;
        --mdc-icon-size: 20px;
        vertical-align: top;
        padding: 0px;
      }

    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{if(e==Di.AlbumCopyPresetToClipboard)return it(Ei(this.mediaItem,this.mediaItem.artists[0].name)),this.alertInfoSet(be),!0;if(e==Di.AlbumCopyPresetJsonToClipboard)return it($i(this.mediaItem,this.mediaItem.artists[0].name)),this.alertInfoSet(Ce),!0;if(e==Di.AlbumCopyUriToClipboard)return it(this.mediaItem.uri),!0;if(e==Di.AlbumSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.name+ve+this.mediaItem.artists[0].name)),!0;if(e==Di.AlbumShowTracks)return this.dispatchEvent(ci(kt.ALBUM_TRACKS,this.mediaItem.name+"; "+this.mediaItem.artists[0].name,this.mediaItem.name,this.mediaItem.uri,null,this.mediaItem)),!0;if(e==Di.ArtistCopyPresetToClipboard)return this.mediaItem.artists[0].image_url=this.mediaItem.image_url,it(Ei(this.mediaItem.artists[0])),this.alertInfoSet(be),!0;if(e==Di.ArtistCopyPresetJsonToClipboard)return this.mediaItem.artists[0].image_url=this.mediaItem.image_url,it($i(this.mediaItem.artists[0])),this.alertInfoSet(Ce),!0;if(e==Di.ArtistCopyUriToClipboard)return it(this.mediaItem.artists[0].uri),!0;if(e==Di.ArtistSearchPlaylists)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.artists[0].name)),!0;if(e==Di.ArtistSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.artists[0].name+ve)),!0;if(e==Di.ArtistShowAlbums)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==Di.ArtistShowAlbumsAppearsOn)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_APPEARSON,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==Di.ArtistShowAlbumsCompilation)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_COMPILATION,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==Di.ArtistShowAlbumsSingle)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_SINGLE,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==Di.ArtistShowRelatedArtists)return this.dispatchEvent(ci(kt.ARTIST_RELATED_ARTISTS,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==Di.ArtistShowTopTracks)return this.dispatchEvent(ci(kt.ARTIST_TOP_TRACKS,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==Di.ArtistSearchTracks)return this.dispatchEvent(ci(kt.TRACKS,this.mediaItem.artists[0].name)),!0;this.progressShow();const t=Ii(this.mediaItem.artists[0].uri);if(e==Di.AlbumUserPresetAdd)this.store.config.userPresets?.unshift(_i(this.mediaItem)),await Vi(this.store.config),this.progressHide();else if(e==Di.AlbumFavoriteAdd)await this.spotifyPlusService.SaveAlbumFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[Di.AlbumFavoriteUpdate]);else if(e==Di.AlbumFavoriteRemove)await this.spotifyPlusService.RemoveAlbumFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[Di.AlbumFavoriteUpdate]);else if(e==Di.AlbumPlayTrackFavorites){const e=this.store.config.albumFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,999,null,this.mediaItem.uri),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else if(e==Di.ArtistUserPresetAdd)this.mediaItem.artists[0].image_url=this.mediaItem.image_url,this.store.config.userPresets?.unshift(_i(this.mediaItem.artists[0])),await Vi(this.store.config),this.progressHide();else if(e==Di.ArtistFavoriteAdd)await this.spotifyPlusService.FollowArtists(this.player,t),this.updateActions(this.player,[Di.ArtistFavoriteUpdate]);else if(e==Di.ArtistFavoriteRemove)await this.spotifyPlusService.UnfollowArtists(this.player,t),this.updateActions(this.player,[Di.ArtistFavoriteUpdate]);else if(e==Di.ArtistPlayTrackFavorites){const e=this.store.config.artistFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,999,this.mediaItem.artists[0].uri,null),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else this.progressHide();return!0}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(Di.AlbumTracksUpdate)||0==t.length){const t=new Promise(((t,i)=>{const s=this.mediaItem.total_tracks;this.spotifyPlusService.GetAlbumTracks(e,this.mediaItem.id,0,0,null,s).then((e=>{this.albumTracks=e,t(!0)})).catch((e=>{this.albumTracks=void 0,this.alertErrorSet("Get Album Tracks failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(Di.AlbumFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckAlbumFavorites(e,this.mediaItem.id).then((e=>{this.isAlbumFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isAlbumFavorite=void 0,this.alertErrorSet("Check Album Favorite failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(Di.ArtistFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckArtistsFollowing(e,this.mediaItem.artists[0].id).then((e=>{this.isArtistFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isArtistFavorite=void 0,this.alertErrorSet("Check Artist Following failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Album actions refresh failed: "+At(e)),!0}}}we([Ue({attribute:!1})],Ni.prototype,"mediaItem",void 0),we([Ve()],Ni.prototype,"albumTracks",void 0),we([Ve()],Ni.prototype,"isAlbumFavorite",void 0),we([Ve()],Ni.prototype,"isArtistFavorite",void 0),customElements.define("spc-album-actions",Ni);const qi=a`

  .media-browser-section {
    color: var(--secondary-text-color);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .media-browser-section-title {
    padding: 0.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: bold;
    font-size: var(--spc-media-browser-section-title-font-size, 1.0rem);
    line-height: var(--spc-media-browser-section-title-font-size, 1.0rem);
    color: var(--spc-media-browser-section-title-color, var(--secondary-text-color, #ffffff)); 
    color: var(--spc-media-browser-section-title-color);
  }

  .media-browser-section-subtitle {
    padding: 0.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: normal;
    font-size: var(--spc-media-browser-section-subtitle-font-size, 0.85rem);
    line-height: var(--spc-media-browser-section-subtitle-font-size, 0.85rem);
    color: var(--spc-media-browser-section-subtitle-color, var(--secondary-text-color, #ffffff));
  }

  .media-browser-controls {
    padding: 0.2rem 0.4rem 0.2rem;
    white-space: nowrap;
    --ha-select-height: 2.5rem;           /* ha dropdown control height */
    --mdc-menu-item-height: 2.5rem;       /* mdc dropdown list item height */
    --mdc-icon-button-size: 2.5rem;       /* mdc icon button size */
    --md-menu-item-top-space: 0.5rem;     /* top spacing between items */
    --md-menu-item-bottom-space: 0.5rem;  /* bottom spacing between items */
    --md-menu-item-one-line-container-height: 2.0rem;  /* menu item height */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
  }

  .media-browser-control-filter {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    width: 100%;
  }

  .media-browser-control-filter-disabled {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    width: 100%;
    align-self: center;
    color: var(--dark-primary-color);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .media-browser-content {
    margin: 0.5rem;
    flex: 3;
    max-height: 100vh;
    overflow-y: auto;
    scrollbar-color: var(--primary-text-color) var(--secondary-background-color);
    scrollbar-width: inherit;
  }

  .media-browser-list {
    height: 100%;
  }

  .media-browser-actions {
    height: 100%;
  }

  ha-alert {
    display: block;
    margin-bottom: 0.25rem;
  }

  *[hide] {
    display: none;
  }

`;const Gi=new class{constructor(){this._propValues={}}addPropertyValue(e){if(!this._propValues.hasOwnProperty(e)){const t=window.localStorage.getItem(e);this._propValues[e]=t?JSON.parse(t):null}}getPropertyValue(e){return this._propValues[e]}setPropertyValue(e,t){this._propValues[e]=t}saveProperties(){for(const e in this._propValues)this._propValues.hasOwnProperty(e)&&window.localStorage.setItem(e,JSON.stringify(this._propValues[e]))}saveProperty(e){this._propValues.hasOwnProperty(e)&&window.localStorage.setItem(e,JSON.stringify(this._propValues[e]))}getStorageValue(e,t=null){const i=window.localStorage.getItem(e);return i?JSON.parse(i):t}setStorageValue(e,t){window.localStorage.setItem(e,JSON.stringify(t))}clearStorageValue(e){window.localStorage.removeItem(e)}clearStorage(){window.localStorage.clear();for(const e in this._propValues)this._propValues.hasOwnProperty(e)&&(this._propValues[e]=null)}clearStorageByKey(e){this._propValues.hasOwnProperty(e)&&(window.localStorage.removeItem(e),this._propValues[e]=null)}},Ji=Pe(de+":fav-browser-base"),Wi="_filtercriteria",Yi="_medialist",zi="_medialistlastupdated",ji="Previous refresh is still in progress - please wait";class Ki extends oi{constructor(e){super(),this.EDITOR_LIMIT_TOTAL_MAX=25,this.LIMIT_TOTAL_MAX=200,this.isActionsEnabled=!0,this.isMediaListRefreshedOnSectionEntry=!1,this.mediaType=e,this.shuffleOnPlay=!1,this.onKeyDown_EventListenerBound=this.onKeyDown.bind(this)}render(){Ji.enabled&&Ji("render - rendering control: %s\n- mediaListLastUpdatedOn = %s\n- scrollTopSaved = %s\n- filterItemCount = %s (pre-render)",JSON.stringify(this.mediaType),JSON.stringify(this.mediaListLastUpdatedOn),JSON.stringify(this.scrollTopSaved),JSON.stringify(this.filterItemCount)),this.hass=this.store.hass,this.config=this.store.config,this.player=this.store.player,this.spotifyPlusService=this.store.spotifyPlusService,this.isCardInEditPreview=ut(this.store.card),this.setScrollPosition(),this.isFilterCriteriaReadOnly=!1,this.isFilterCriteriaVisible=!0,this.filterCriteriaHtml=H`
      <search-input-outlined id="filterCriteria" 
        class="media-browser-control-filter"
        .hass=${this.hass}
        .filter=${this.filterCriteria}
        .value=${this.filterCriteria}
        .autofocus=true
        placeholder=${this.filterCriteriaPlaceholder||"search by name"}
        @value-changed=${this.onFilterCriteriaChange}
        @keypress=${this.onFilterCriteriaKeyPress}
      ></search-input-outlined>
      `,this.filterCriteriaReadOnlyHtml=H`
      <span id="filterCriteriaDisabled" 
        class="media-browser-control-filter-disabled"
      >${this.filterCriteria}</span>
      `,this.refreshMediaListHtml=H`
      <ha-icon-button
        slot="refresh-button"
        label="Refresh Media List"
        action="refresh"
        .path=${"M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"}
        @click=${this.onFilterActionsClick}
      ></ha-icon-button>
      `,this.formatMediaListHtml=H`
      <ha-button-menu y="0" x="-180" style="display:none">
        <ha-icon-button
          slot="trigger"
          label="Format Media List"
          .path=${"M3,3H11V5H3V3M13,3H21V5H13V3M3,7H11V9H3V7M13,7H21V9H13V7M3,11H11V13H3V11M13,11H21V13H13V11M3,15H11V17H3V15M13,15H21V17H13V15M3,19H11V21H3V19M13,19H21V21H13V19Z"}
        ></ha-icon-button>
        <div style="width:220px; padding:10px; border:1px solid var(--ha-card-border-color,var(--divider-color,#e0e0e0))">
          <ha-slider
            hint="Tiles per row (1-12)"
            min="1"
            max="12"
            step="1"
            .value=${this.favBrowserItemsPerRow}
            @change=${this.onFormatMediaListChanged}
          >
          </ha-slider>
        </div>
      </ha-button-menu>
      `,this.btnHideActionsHtml=H`
      <ha-icon-button
        style="margin-right: 0.25rem;"
        slot="back-button"
        label="Back to Media List"
        action="hideactions"
        .path=${"M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"}
        @click=${this.onFilterActionsClick}
      ></ha-icon-button>
      `}styleMediaBrowser(){const e=this.config.mediaBrowserSectionTitleColor,t=this.config.mediaBrowserSectionTitleFontSize,i=this.config.mediaBrowserSectionSubTitleColor,s=this.config.mediaBrowserSectionSubTitleFontSize,r=this.config.mediaBrowserItemsSvgIconColor,o={};return e&&(o["--spc-media-browser-section-title-color"]=`${e}`),t&&(o["--spc-media-browser-section-title-font-size"]=`${t}`),i&&(o["--spc-media-browser-section-subtitle-color"]=`${i}`),s&&(o["--spc-media-browser-section-subtitle-font-size"]=`${s}`),r&&(o["--spc-media-browser-items-svgicon-color"]=`${r}`),Me(o)}static get styles(){return[qi,a`

      /* extra styles not defined in sharedStylesFavBrowser would go here. */

      /* you can also copy this method into any inheriting class to apply fav-browser specific styles. */
      `]}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.onKeyDown_EventListenerBound)}disconnectedCallback(){document.removeEventListener("keydown",this.onKeyDown_EventListenerBound),super.disconnectedCallback()}firstUpdated(e){if(super.firstUpdated(e),(async()=>{await gt()})(),this.cacheKeyBase=ne+"_"+(this.player.attributes.sp_user_id||"nospuserid")+"_",this.isMediaListRefreshedOnSectionEntry&&(this.isCardInEditPreview||(Ji.enabled&&Ji("%cfirstUpdated - %s mediaList will be updated on section entry","color: yellow;",JSON.stringify(this.mediaType)),this.storageValuesClear())),this.storageValuesLoad(),0==(this.mediaListLastUpdatedOn||0)){if(this.isCardInEditPreview&&this.mediaType in Bi.hasCardEditLoadedMediaList)return void(Ji.enabled&&Ji("%cfirstUpdated - %s mediaList already updated; updateMediaList will not be called again while editing card configuration!","color: yellow;",JSON.stringify(this.mediaType)));Ji.enabled&&Ji("%cfirstUpdated - %s mediaList will be updated on first update","color: yellow;",JSON.stringify(this.mediaType)),this.updateMediaList(this.player)}else this.isCardInEditPreview&&this.updatedMediaListOk(!1)}filterSectionMedia(e){Ji.enabled&&Ji("filterSectionMedia - filtering section media:\n%s",JSON.stringify(e,null,2)),this.filterCriteria=e.filterCriteria,this.updateMediaList(this.player)}storageValuesClear(){Gi.clearStorageValue(this.cacheKeyBase+this.mediaType+zi),Gi.clearStorageValue(this.cacheKeyBase+this.mediaType+Yi),Gi.clearStorageValue(this.cacheKeyBase+this.mediaType+Wi),this.mediaType in Bi.hasCardEditLoadedMediaList&&delete Bi.hasCardEditLoadedMediaList[this.mediaType],Ji.enabled&&Ji("storageValuesClear - %s parameters were cleared from cache:\n mediaListLastUpdatedOn, mediaList, filterCriteria",JSON.stringify(this.mediaType))}storageValuesLoad(){this.mediaListLastUpdatedOn=Gi.getStorageValue(this.cacheKeyBase+this.mediaType+zi,0),this.mediaList=Gi.getStorageValue(this.cacheKeyBase+this.mediaType+Yi,void 0),this.filterCriteria=Gi.getStorageValue(this.cacheKeyBase+this.mediaType+Wi,void 0),Ji.enabled&&Ji("storageValuesLoad - %s parameters were loaded from cache:\n mediaListLastUpdatedOn, mediaList, filterCriteria",JSON.stringify(this.mediaType))}storageValuesSave(){Gi.setStorageValue(this.cacheKeyBase+this.mediaType+zi,this.mediaListLastUpdatedOn),Gi.setStorageValue(this.cacheKeyBase+this.mediaType+Yi,this.mediaList),Gi.setStorageValue(this.cacheKeyBase+this.mediaType+Wi,this.filterCriteria),Ji.enabled&&Ji("storageValuesSave - %s parameters were saved to cache:\n mediaListLastUpdatedOn, mediaList, filterCriteria",JSON.stringify(this.mediaType))}onFilterCriteriaChange(e){this.filterCriteria=e.detail.value,""==e.detail.value&&Gi.clearStorageValue(this.cacheKeyBase+this.mediaType+Wi)}onFilterCriteriaKeyPress(e){"Enter"===e.key&&this.updateMediaList(this.player)}onFilterActionsClick(e){const t=e.currentTarget.getAttribute("action");"refresh"===t?(this.storageValuesClear(),this.updateMediaList(this.player)):"hideactions"===t&&(this.isActionsVisible=!1,setTimeout((()=>{this.requestUpdate()}),50))}onItemSelected(e){Ji.enabled&&Ji("onItemSelected - media item selected:\n%s",JSON.stringify(e.detail,null,2));const t=e.detail;this.PlayMediaItem(t)}onItemSelectedWithHold(e){Ji.enabled&&Ji("onItemSelectedWithHold - media item selected:\n%s",JSON.stringify(e.detail,null,2)),this.isActionsEnabled?this.isCardInEditPreview?this.alertInfo="Cannot display actions while editing card configuration":(this.mediaItem=e.detail,this.scrollTopSaved=this.mediaBrowserContentElement.scrollTop,this.isActionsVisible=!this.isActionsVisible,this.isActionsVisible&&this.alertClear()):this.onItemSelected(e)}onKeyDown(e){"Escape"===e.key&&(this.isActionsVisible=!1,setTimeout((()=>{this.requestUpdate()}),50))}onFormatMediaListChanged(e){const t=Number(e.target.value);null!=t&&(this.favBrowserItemsPerRow=t,Ji.enabled&&Ji("onFormatMediaListChanged - changed favBrowserItemsPerRow, value = %s",JSON.stringify(this.favBrowserItemsPerRow)))}async PlayMediaItem(e){try{this.progressShow(),Ji.enabled&&Ji("PlayMediaItem \n- shuffleOnPlay = %s\n- player.attributes.shuffle = %s",JSON.stringify(this.shuffleOnPlay),JSON.stringify(this.player.attributes.shuffle)),this.shuffleOnPlay&&!this.player.attributes.shuffle&&await this.spotifyPlusService.PlayerSetShuffleMode(this.player,null,!0),await this.spotifyPlusService.Card_PlayMediaBrowserItem(this.player,e),this.store.card.SetSection(Qe.PLAYER)}catch(e){this.alertErrorSet("Could not play media item.  "+At(e)),this.mediaBrowserContentElement.scrollTop=0}finally{this.progressHide()}}async QueueMediaItem(e){try{this.progressShow(),await this.spotifyPlusService.AddPlayerQueueItems(this.player,e.uri),this.alertInfo='Item added to play queue: "'+e.name+'".',this.mediaBrowserContentElement.scrollTop=0}catch(e){this.alertErrorSet("Could not queue media item.  "+At(e)),this.mediaBrowserContentElement.scrollTop=0}finally{this.progressHide()}}setScrollPosition(){if(this.isActionsVisible)return;if(0==this.scrollTopSaved)return;if(!this.hasUpdated)return;const e=this.shadowRoot?.querySelector(".media-browser-list");e&&e.shadowRoot&&e?.updateComplete&&(this.mediaBrowserContentElement.scrollTop=this.scrollTopSaved||0,setTimeout((()=>{this.setScrollPosition(),this.scrollTopSaved=0}),50))}updateMediaList(e){return this.isUpdateInProgress?(this.alertErrorSet(ji),!1):(this.isUpdateInProgress=!0,e?(this.isActionsVisible=!1,this.mediaBrowserContentElement.scrollTop=0,this.scrollTopSaved=0,this.mediaListLastUpdatedOn=Gi.getStorageValue(this.cacheKeyBase+this.mediaType+zi,0),this.isCardInEditPreview&&0!=this.mediaListLastUpdatedOn?(this.isUpdateInProgress=!1,!1):(this.alertClear(),Ji.enabled&&Ji("%cupdateMediaList - updating %s medialist","color: yellow;",JSON.stringify(this.mediaType)),!0)):(this.isUpdateInProgress=!1,this.alertErrorSet("Player reference not set in updateMediaList"),!1))}updatedMediaListOk(e=!0){if(this.alertError==ji&&this.alertErrorClear(),this.mediaList&&0==this.mediaList.length&&(this.alertInfo="No items found"),e&&this.storageValuesSave(),this.isCardInEditPreview){const e=function(e,t){let i;if((e?.length||0)>t){i="Limited to "+t+" items while editing card configuration.";for(let i=0,s=e?.length||0;i<=s;i++)i>t&&e?.pop()}return i}(this.mediaList,this.EDITOR_LIMIT_TOTAL_MAX);this.mediaType in Bi.hasCardEditLoadedMediaList||(this.alertInfo=e),Bi.hasCardEditLoadedMediaList[this.mediaType]=!0}}updatedMediaListError(e=null){this.alertInfoClear(),Ji.enabled&&Ji("%cupdatedMediaListError - error updating %s mediaList:\n %s","color:red",JSON.stringify(this.mediaType),JSON.stringify(e)),this.alertErrorSet(e||"Unknown Error")}}we([Ue({attribute:!1})],Ki.prototype,"hass",void 0),we([Ve()],Ki.prototype,"isActionsEnabled",void 0),we([Ve()],Ki.prototype,"isActionsVisible",void 0),we([Ve()],Ki.prototype,"isMediaListRefreshedOnSectionEntry",void 0),we([Ve()],Ki.prototype,"scrollTopSaved",void 0),we([Ve()],Ki.prototype,"mediaItem",void 0),we([Ve()],Ki.prototype,"filterCriteria",void 0),we([Ve()],Ki.prototype,"isFilterCriteriaReadOnly",void 0),we([Ve()],Ki.prototype,"isFilterCriteriaVisible",void 0),we([Ve()],Ki.prototype,"favBrowserItemsPerRow",void 0),we([Ne("#mediaBrowserContentElement",!0)],Ki.prototype,"mediaBrowserContentElement",void 0),we([Ne("#filterCriteria",!0)],Ki.prototype,"filterCriteriaElement",void 0);let Zi=class extends Ki{constructor(){super(Qe.ALBUM_FAVORITES),this.filterCriteriaPlaceholder="filter by album name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t)||-1!==e.artists[0].name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.albumFavBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.albumFavBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.shuffleOnPlay=this.config.albumFavBrowserShuffleOnPlay||!1,this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.albumFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-album-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-album-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.config.albumFavBrowserItemsLimit||this.LIMIT_TOTAL_MAX,r=this.config.albumFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetAlbumFavorites(e,0,0,null,s,r).then((e=>{this.mediaList=function(e){const t=new Array;if(e)for(const i of e.items||[])t.push(i.album);return t}(e),this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Album Favorites failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Album favorites refresh failed: "+At(e)),!0}}};Zi=we([xe("spc-album-fav-browser")],Zi);const Xi=Pe(de+":artist-actions");var Qi;!function(e){e.ArtistAlbumsUpdate="ArtistAlbumsUpdate",e.ArtistCopyPresetToClipboard="ArtistCopyPresetToClipboard",e.ArtistCopyPresetJsonToClipboard="ArtistCopyPresetJsonToClipboard",e.ArtistCopyUriToClipboard="ArtistCopyUriToClipboard",e.ArtistGetInfo="ArtistGetInfo",e.ArtistFavoriteAdd="ArtistFavoriteAdd",e.ArtistFavoriteRemove="ArtistFavoriteRemove",e.ArtistFavoriteUpdate="ArtistFavoriteUpdate",e.ArtistPlayTrackFavorites="ArtistPlayTrackFavorites",e.ArtistSearchPlaylists="ArtistSearchPlaylists",e.ArtistSearchRadio="ArtistSearchRadio",e.ArtistSearchTracks="ArtistSearchTracks",e.ArtistShowAlbums="ArtistShowAlbums",e.ArtistShowAlbumsAppearsOn="ArtistShowAlbumsAppearsOn",e.ArtistShowAlbumsCompilation="ArtistShowAlbumsCompilation",e.ArtistShowAlbumsSingle="ArtistShowAlbumsSingle",e.ArtistShowRelatedArtists="ArtistShowRelatedArtists",e.ArtistShowTopTracks="ArtistShowTopTracks",e.ArtistUserPresetAdd="ArtistUserPresetAdd"}(Qi||(Qi={}));class es extends ni{constructor(){super(Qe.ARTIST_FAVORITES)}render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Artist &quot;${this.mediaItem.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(Qi.ArtistFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Artist &quot;${this.mediaItem.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(Qi.ArtistFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Lt}
          .label="View Artist &quot;${this.mediaItem.name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play Favorite Tracks from this Artist</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistSearchPlaylists)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Search Playlists for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistSearchTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Search Tracks for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Artist Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistShowTopTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Show Artist Top Tracks</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistShowAlbums)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistShowAlbumsCompilation)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Compilations</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistShowAlbumsSingle)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Singles</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistShowAlbumsAppearsOn)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums AppearsOn</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistShowRelatedArtists)} hide=${this.hideSearchType(kt.ARTISTS)}>
          <ha-svg-icon slot="start" .path=${Lt}></ha-svg-icon>
          <div slot="headline">Show Related Artists</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Artist to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Qi.ArtistCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Artist URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H` 
      <div class="artist-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.mediaItem.image_url});"></div>
          <div class="media-info-details">
            <div class="media-info-text-ms-c">
              ${i}
              ${this.mediaItem.name}
              ${this.isArtistFavorite?t:e}
              <span class="actions-dropdown-menu">
                ${s}
              </span>
            </div>
            <div class="grid artist-info-grid">
              ${this.mediaItem.followers?H`
                <div class="grid-action-info-hdr-s"># Followers</div>
                <div class="grid-action-info-text-s">${this.mediaItem.followers.total||0}</div>
              `:H`<div></div><div></div>`}

              <div class="grid-action-info-text-s"></div>
              ${this.mediaItem.genres.length>0?H`
                <div class="grid-action-info-hdr-s">Genres</div>
                <div class="grid-action-info-text-s">${function(e,t=null){null==t&&(t="; ");let i="";if(e)for(const s of e.genres||[])null!=s&&s.length>0&&(i.length>0&&(i+=t),i+=s);return i}(this.mediaItem)}</div>
              `:H`<div></div><div></div>`}

              <div class="grid-action-info-text-s"></div>
              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.mediaItem.uri}</div>
            </div>
          </div>
        </div>
        <div class="grid-container-scrollable">
          ${this.artistInfo?.about_url_facebook?H`
            <div class="display-inline">
              <ha-icon-button
                .path=${"M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"}
                .label="View Artist &quot;${this.mediaItem.name}&quot; info on Facebook"
                @click=${()=>It(this.artistInfo?.about_url_facebook||"")}
                slot="icon-button-small"
              ></ha-icon-button>
            </div>
          `:""}
          ${this.artistInfo?.about_url_instagram?H`
            <div class="display-inline">
              <ha-icon-button
                .path=${"M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"}
                .label="View Artist &quot;${this.mediaItem.name}&quot; info on Instagram"
                @click=${()=>It(this.artistInfo?.about_url_instagram||"")}
                slot="icon-button-small"
              ></ha-icon-button>
            </div>
          `:""}
          ${this.artistInfo?.about_url_twitter?H`
            <div class="display-inline">
              <ha-icon-button
                .path=${"M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"}
                .label="View Artist &quot;${this.mediaItem.name}&quot; info on Twitter"
                @click=${()=>It(this.artistInfo?.about_url_twitter||"")}
                slot="icon-button-small"
              ></ha-icon-button>
            </div>
          `:""}
          ${this.artistInfo?.about_url_wikipedia?H`
            <div class="display-inline">
              <ha-icon-button
                .path=${"M14.97,18.95L12.41,12.92C11.39,14.91 10.27,17 9.31,18.95C9.3,18.96 8.84,18.95 8.84,18.95C7.37,15.5 5.85,12.1 4.37,8.68C4.03,7.84 2.83,6.5 2,6.5C2,6.4 2,6.18 2,6.05H7.06V6.5C6.46,6.5 5.44,6.9 5.7,7.55C6.42,9.09 8.94,15.06 9.63,16.58C10.1,15.64 11.43,13.16 12,12.11C11.55,11.23 10.13,7.93 9.71,7.11C9.39,6.57 8.58,6.5 7.96,6.5C7.96,6.35 7.97,6.25 7.96,6.06L12.42,6.07V6.47C11.81,6.5 11.24,6.71 11.5,7.29C12.1,8.53 12.45,9.42 13,10.57C13.17,10.23 14.07,8.38 14.5,7.41C14.76,6.76 14.37,6.5 13.29,6.5C13.3,6.38 13.3,6.17 13.3,6.07C14.69,6.06 16.78,6.06 17.15,6.05V6.47C16.44,6.5 15.71,6.88 15.33,7.46L13.5,11.3C13.68,11.81 15.46,15.76 15.65,16.2L19.5,7.37C19.2,6.65 18.34,6.5 18,6.5C18,6.37 18,6.2 18,6.05L22,6.08V6.1L22,6.5C21.12,6.5 20.57,7 20.25,7.75C19.45,9.54 17,15.24 15.4,18.95C15.4,18.95 14.97,18.95 14.97,18.95Z"}
                .label="View Artist &quot;${this.mediaItem.name}&quot; info on Wikipedia"
                @click=${()=>It(this.artistInfo?.about_url_wikipedia||"")}
                slot="icon-button-small"
              ></ha-icon-button>
            </div>
          `:""}
          <div class="media-info-text-s" .innerHTML="${ot(this.artistInfo?.bio_html||"Artist biography was not found")}"></div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .artist-info-grid {
        grid-template-columns: auto auto auto;
        justify-content: left;
      }

      .artist-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      /* style albums container and grid */
      .albums-grid {
        grid-template-columns: 40px 30px auto auto auto;
      }

      /* style ha-icon-button controls in tracks grid: icon size, title text */
      .albums-grid > ha-icon-button[slot="icon-button"] {
        --mdc-icon-button-size: 24px;
        --mdc-icon-size: 20px;
        vertical-align: top;
        padding: 0px;
      }
    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{if(e==Qi.ArtistCopyPresetToClipboard)return it(Ei(this.mediaItem)),this.alertInfoSet(be),!0;if(e==Qi.ArtistCopyPresetJsonToClipboard)return it($i(this.mediaItem)),this.alertInfoSet(Ce),!0;if(e==Qi.ArtistCopyUriToClipboard)return it(this.mediaItem.uri),!0;if(e==Qi.ArtistSearchPlaylists)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.name)),!0;if(e==Qi.ArtistSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.name+" Radio")),!0;if(e==Qi.ArtistShowAlbums)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS,this.mediaItem.name,this.mediaItem.name,this.mediaItem.uri)),!0;if(e==Qi.ArtistShowAlbumsAppearsOn)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_APPEARSON,this.mediaItem.name,this.mediaItem.name,this.mediaItem.uri)),!0;if(e==Qi.ArtistShowAlbumsCompilation)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_COMPILATION,this.mediaItem.name,this.mediaItem.name,this.mediaItem.uri)),!0;if(e==Qi.ArtistShowAlbumsSingle)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_SINGLE,this.mediaItem.name,this.mediaItem.name,this.mediaItem.uri)),!0;if(e==Qi.ArtistShowRelatedArtists)return this.dispatchEvent(ci(kt.ARTIST_RELATED_ARTISTS,this.mediaItem.name,this.mediaItem.name,this.mediaItem.uri)),!0;if(e==Qi.ArtistShowTopTracks)return this.dispatchEvent(ci(kt.ARTIST_TOP_TRACKS,this.mediaItem.name,this.mediaItem.name,this.mediaItem.uri)),!0;if(e==Qi.ArtistSearchTracks)return this.dispatchEvent(ci(kt.TRACKS,this.mediaItem.name)),!0;if(this.progressShow(),e==Qi.ArtistFavoriteAdd)await this.spotifyPlusService.FollowArtists(this.player,this.mediaItem.id),this.updateActions(this.player,[Qi.ArtistFavoriteUpdate]);else if(e==Qi.ArtistFavoriteRemove)await this.spotifyPlusService.UnfollowArtists(this.player,this.mediaItem.id),this.updateActions(this.player,[Qi.ArtistFavoriteUpdate]);else if(e==Qi.ArtistPlayTrackFavorites){const e=this.store.config.artistFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,999,this.mediaItem.uri,null),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else e==Qi.ArtistUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.mediaItem)),await Vi(this.store.config),this.progressHide()):this.progressHide();return!0}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(Qi.ArtistGetInfo)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.GetArtistInfo(e,this.mediaItem.id).then((e=>{this.artistInfo=e,t(!0)})).catch((e=>{Xi.enabled&&Xi("updateActions - Get Artist Info failed: "+At(e)),this.artistInfo=void 0,i(!0)}))}));i.push(t)}if(-1!=t.indexOf(Qi.ArtistFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckArtistsFollowing(e,this.mediaItem.id).then((e=>{this.isArtistFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isArtistFavorite=void 0,this.alertErrorSet("Check Artist Favorites failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Artist actions refresh failed: "+At(e)),!0}}}we([Ue({attribute:!1})],es.prototype,"mediaItem",void 0),we([Ve()],es.prototype,"artistInfo",void 0),we([Ve()],es.prototype,"isArtistFavorite",void 0),customElements.define("spc-artist-actions",es);let ts=class extends Ki{constructor(){super(Qe.ARTIST_FAVORITES),this.filterCriteriaPlaceholder="filter by artist name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.artistFavBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.artistFavBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.shuffleOnPlay=this.config.artistFavBrowserShuffleOnPlay||!1,this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.artistFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-artist-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-artist-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.config.artistFavBrowserItemsLimit||this.LIMIT_TOTAL_MAX,r=this.config.artistFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetArtistsFollowed(e,0,0,s,r).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Artist Followed failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Artist followed refresh failed: "+At(e)),!0}}};function is(e){let t="";return e&&(t=e.fully_played?"completed":0==(e.resume_position_ms||0)?"starts at beginning":"resumes at "+lt(e.resume_position_ms||0)),t}var ss;ts=we([xe("spc-artist-fav-browser")],ts),function(e){e.AudiobookCopyPresetToClipboard="AudiobookCopyPresetToClipboard",e.AudiobookCopyPresetJsonToClipboard="AudiobookCopyPresetJsonToClipboard",e.AudiobookCopyUriToClipboard="AudiobookCopyUriToClipboard",e.AudiobookFavoriteAdd="AudiobookFavoriteAdd",e.AudiobookFavoriteRemove="AudiobookFavoriteRemove",e.AudiobookFavoriteUpdate="AudiobookFavoriteUpdate",e.AudiobookChaptersUpdate="AudiobookChaptersUpdate",e.AudiobookSearchAuthor="AudiobookSearchAuthor",e.AudiobookSearchNarrator="AudiobookSearchNarrator",e.AudiobookUserPresetAdd="AudiobookUserPresetAdd"}(ss||(ss={}));class rs extends ni{constructor(){super(Qe.AUDIOBOOK_FAVORITES)}render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Dt}
          label="Add Audiobook &quot;${this.mediaItem.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(ss.AudiobookFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Audiobook &quot;${this.mediaItem.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(ss.AudiobookFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Ot}
          .label="View Audiobook &quot;${this.mediaItem.name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(ss.AudiobookSearchAuthor)} hide=${this.hideSearchType(kt.AUDIOBOOKS)}>
          <ha-svg-icon slot="start" .path=${Ft}></ha-svg-icon>
          <div slot="headline">Other Audiobooks by same Author</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ss.AudiobookSearchNarrator)} hide=${this.hideSearchType(kt.AUDIOBOOKS)}>
          <ha-svg-icon slot="start" .path=${Ft}></ha-svg-icon>
          <div slot="headline">Other Audiobooks by same Narrator</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(ss.AudiobookUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Audiobook to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ss.AudiobookCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Audiobook Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ss.AudiobookCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Audiobook Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ss.AudiobookCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Audiobook URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H`
      <div class="audiobook-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.mediaItem.image_url});"></div>
          <div class="media-info-details">
            <div class="media-info-text-ms-c">
              ${i}
              ${this.mediaItem.name}
              ${this.isAudiobookFavorite?t:e}
              <span class="actions-dropdown-menu">
                ${s}
              </span>
            </div>
            <div class="grid audiobook-info-grid">

              <div class="grid-action-info-hdr-s">Authors</div>
              <div class="grid-action-info-text-s">${_t(this.mediaItem,", ")}</div>

              <div class="grid-action-info-hdr-s">Narrators</div>
              <div class="grid-action-info-text-s">${Et(this.mediaItem,", ")}</div>

              <div class="grid-action-info-hdr-s">Publisher</div>
              <div class="grid-action-info-text-s">${this.mediaItem.publisher||"unknown"}</div>

              ${"copyrights"in this.mediaItem?H`
                <div class="grid-action-info-hdr-s">Copyright</div>
                <div class="grid-action-info-text-s">${Ti(this.mediaItem,"; ")}</div>
                `:""}

              <div class="grid-action-info-hdr-s">Edition</div>
              <div class="grid-action-info-text-s">${this.mediaItem.edition||"unknown"}</div>

              <div class="grid-action-info-hdr-s">Released</div>
              <div class="grid-action-info-text-s">${this.audiobookChapters?.items[0].release_date||"unknown"}</div>

              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.mediaItem.uri}</div>

            </div>
          </div>
        </div>
        <div class="grid-container-scrollable">
          <div class="media-info-text-s" .innerHTML="${ot(this.mediaItem.html_description)}"></div>
          <div class="grid chapters-grid">
            <div class="grid-header">&nbsp;</div>
            <div class="grid-header">Title</div>
            <div class="grid-header">Status</div>
            <div class="grid-header grid-header-last">Duration</div>
            ${this.audiobookChapters?.items.map((e=>H`
              <ha-icon-button
                .path=${Yt}
                .label="Add chapter &quot;${e.name}&quot; to Play Queue"
                @click=${()=>this.AddPlayerQueueItem(e)}
                slot="icon-button"
              >&nbsp;</ha-icon-button>
              <div class="grid-entry">${e.name}</div>
              <div class="grid-entry">${is(e.resume_point)}</div>
              <div class="grid-entry">${lt(e.duration_ms||0)}</div>
            `))}
          </div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .audiobook-info-grid {
        grid-template-columns: auto auto;
        justify-content: left;
      }

      .audiobook-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      /* style chapters container and grid */
      .chapters-grid {
        grid-template-columns: 40px auto auto auto;
        margin-top: 1.0rem;
      }

      /* style ha-icon-button controls in tracks grid: icon size, title text */
      .chapters-grid > ha-icon-button[slot="icon-button"] {
        --mdc-icon-button-size: 24px;
        --mdc-icon-size: 20px;
        vertical-align: top;
        padding: 0px;
      }

    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{return e==ss.AudiobookCopyPresetToClipboard?(it(Ei(this.mediaItem,_t(this.mediaItem,", "))),this.alertInfoSet(be),!0):e==ss.AudiobookCopyPresetJsonToClipboard?(it($i(this.mediaItem,_t(this.mediaItem,", "))),this.alertInfoSet(Ce),!0):e==ss.AudiobookCopyUriToClipboard?(it(this.mediaItem.uri||""),!0):e==ss.AudiobookSearchAuthor?(this.dispatchEvent(ci(kt.AUDIOBOOKS,_t(this.mediaItem," "))),!0):e==ss.AudiobookSearchNarrator?(this.dispatchEvent(ci(kt.AUDIOBOOKS,Et(this.mediaItem," "))),!0):(this.progressShow(),e==ss.AudiobookUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.mediaItem)),await Vi(this.store.config),this.progressHide()):e==ss.AudiobookFavoriteAdd?(await this.spotifyPlusService.SaveAudiobookFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[ss.AudiobookFavoriteUpdate])):e==ss.AudiobookFavoriteRemove?(await this.spotifyPlusService.RemoveAudiobookFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[ss.AudiobookFavoriteUpdate])):this.progressHide(),!0)}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(ss.AudiobookChaptersUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.GetAudiobookChapters(e,this.mediaItem.id,0,0,null,200).then((e=>{this.audiobookChapters=e,t(!0)})).catch((e=>{this.audiobookChapters=void 0,this.alertErrorSet("Get Audiobook Chapters failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(ss.AudiobookFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckAudiobookFavorites(e,this.mediaItem.id).then((e=>{this.isAudiobookFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isAudiobookFavorite=void 0,this.alertErrorSet("Check Audiobook Favorites failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Audiobook actions refresh failed: "+At(e)),!0}}}we([Ue({attribute:!1})],rs.prototype,"mediaItem",void 0),we([Ve()],rs.prototype,"audiobookChapters",void 0),we([Ve()],rs.prototype,"isAudiobookFavorite",void 0),customElements.define("spc-audiobook-actions",rs);let os=class extends Ki{constructor(){super(Qe.AUDIOBOOK_FAVORITES),this.filterCriteriaPlaceholder="filter by audiobook name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t)||-1!==e.authors[0].name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.audiobookFavBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.audiobookFavBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.audiobookFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-audiobook-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-audiobook-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.config.audiobookFavBrowserItemsLimit||this.LIMIT_TOTAL_MAX,r=this.config.audiobookFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetAudiobookFavorites(e,0,0,s,r).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Audiobook Favorites failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Audiobook favorites refresh failed: "+At(e)),!0}}};var as;os=we([xe("spc-audiobook-fav-browser")],os),function(e){e.PlaylistCopyPresetToClipboard="PlaylistCopyPresetToClipboard",e.PlaylistCopyPresetJsonToClipboard="PlaylistCopyPresetJsonToClipboard",e.PlaylistCopyUriToClipboard="PlaylistCopyUriToClipboard",e.PlaylistDelete="PlaylistDelete",e.PlaylistFavoriteAdd="PlaylistFavoriteAdd",e.PlaylistFavoriteRemove="PlaylistFavoriteRemove",e.PlaylistFavoriteUpdate="PlaylistFavoriteUpdate",e.PlaylistItemsUpdate="PlaylistItemsUpdate",e.PlaylistRecoverWebUI="PlaylistRecoverWebUI",e.PlaylistUserPresetAdd="PlaylistUserPresetAdd"}(as||(as={}));class ns extends ni{constructor(){super(Qe.PLAYLIST_FAVORITES)}render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Playlist &quot;${this.mediaItem.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(as.PlaylistFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Playlist &quot;${this.mediaItem.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(as.PlaylistFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Yt}
          .label="View Playlist &quot;${this.mediaItem.name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(as.PlaylistRecoverWebUI)}>
          <ha-svg-icon slot="start" .path=${"M12,3A9,9 0 0,0 3,12H0L4,16L8,12H5A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19C10.5,19 9.09,18.5 7.94,17.7L6.5,19.14C8.04,20.3 9.94,21 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M14,12A2,2 0 0,0 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12Z"}></ha-svg-icon>
          <div slot="headline">Recover Playlist via Spotify Web UI</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(as.PlaylistDelete)}>
          <ha-svg-icon slot="start" .path=${"M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"}></ha-svg-icon>
          <div slot="headline">Delete (unfollow) Playlist</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(as.PlaylistUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Playlist to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(as.PlaylistCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Playlist Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(as.PlaylistCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Playlist Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(as.PlaylistCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Playlist URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H` 
      <div class="playlist-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.mediaItem.image_url});"></div>
          <div class="media-info-details">

            <div class="media-info-text-ms-c">
              ${i}
              ${this.mediaItem.name}
              ${this.isPlaylistFavorite?t:e}
              <span class="actions-dropdown-menu">
                ${s}
              </span>
            </div>
            <div class="grid playlist-info-grid">

              <div class="grid-action-info-hdr-s"># Tracks</div>
              <div class="grid-action-info-text-s">${this.mediaItem.tracks.total}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Collaborative?</div>
              <div class="grid-action-info-text-s">${String(this.mediaItem.collaborative||!1)}</div>

              <div class="grid-action-info-hdr-s"># Followers</div>
              <div class="grid-action-info-text-s">${this.mediaItem.owner.followers.total||0}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Public?</div>
              <div class="grid-action-info-text-s">${String(this.mediaItem.public||!1)}</div>

              <div class="grid-action-info-hdr-s">Snapshot ID</div>
              <div class="grid-action-info-text-s colspan-r3-c2">${this.mediaItem.snapshotId}</div>

              <div class="grid-action-info-hdr-s">Owned By</div>
              ${this.mediaItem.owner?H`
                <div class="grid-action-info-text-s colspan-r4-c2"><a href="${this.mediaItem.owner.external_urls.spotify}" target="_blank">${this.mediaItem.owner.display_name}</a></div>
              `:H`<div class="colspan-r4-c2">unknown</div>`}

              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s colspan-r5-c2 copy2cb" @click=${ft}>${this.mediaItem.uri}</div>

            </div>
          </div>
        </div>
        <div class="grid-container-scrollable">
          <div class="media-info-text-s" .innerHTML="${ot(this.mediaItem.description)}"></div>
          <div class="grid tracks-grid">
            <div class="grid-header">&nbsp;</div>
            <div class="grid-header">#</div>
            <div class="grid-header">Title</div>
            <div class="grid-header">Artist</div>
            <div class="grid-header">Album</div>
            <div class="grid-header grid-header-last">Duration</div>
            ${this.playlistTracks?.map(((e,t)=>H`
              <ha-icon-button
                .path=${Yt}
                .label="Add track &quot;${e.track.name}&quot; to Play Queue"
                @click=${()=>this.AddPlayerQueueItem(e.track)}
                slot="icon-button"
              >&nbsp;</ha-icon-button>
              <div class="grid-entry">${t+1}</div>
              <div class="grid-entry">${e.track.name||""}</div>
              <div class="grid-entry">${e.track?.artists[0].name||""}</div>
              <div class="grid-entry">${e.track?.album.name||""}</div>
              <div class="grid-entry">${lt(e.track.duration_ms||0)}</div>
            `))}
          </div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .playlist-info-grid {
        grid-template-columns: 80px auto 10px auto auto;
        justify-content: left;
        margin: 0.5rem;
        max-width: 21rem;
      }

      .playlist-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      .colspan-r3-c2 {
        grid-row: 3 / 3;    /* grid row 3 */
        grid-column: 2 / 6; /* grid columns 2 thru 5 */
      }

      .colspan-r4-c2 {
        grid-row: 4 / 4;    /* grid row 4 */
        grid-column: 2 / 6; /* grid columns 2 thru 5 */
      }

      .colspan-r5-c2 {
        grid-row: 5 / 5;    /* grid row 5 */
        grid-column: 2 / 6; /* grid columns 2 thru 5 */
      }

      /* style tracks container and grid */
      .tracks-grid {
        grid-template-columns: 30px 45px auto auto auto 60px;
        margin-top: 1.0rem;
      }

      /* style ha-icon-button controls in tracks grid: icon size, title text */
      .tracks-grid > ha-icon-button[slot="icon-button"] {
        --mdc-icon-button-size: 24px;
        --mdc-icon-size: 20px;
        vertical-align: top;
        padding: 0px;
      }

    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{return e==as.PlaylistCopyUriToClipboard?(it(this.mediaItem.uri),!0):e==as.PlaylistRecoverWebUI?(It("https://www.spotify.com/us/account/recover-playlists/"),!0):e==as.PlaylistCopyPresetToClipboard?(it(Ei(this.mediaItem)),this.alertInfoSet(be),!0):e==as.PlaylistCopyPresetJsonToClipboard?(it($i(this.mediaItem)),this.alertInfoSet(Ce),!0):(this.progressShow(),e==as.PlaylistUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.mediaItem)),await Vi(this.store.config),this.progressHide()):e==as.PlaylistDelete?(await this.spotifyPlusService.UnfollowPlaylist(this.player,this.mediaItem.id),this.updateActions(this.player,[as.PlaylistFavoriteUpdate])):e==as.PlaylistFavoriteAdd?(await this.spotifyPlusService.FollowPlaylist(this.player,this.mediaItem.id),this.updateActions(this.player,[as.PlaylistFavoriteUpdate])):e==as.PlaylistFavoriteRemove?(await this.spotifyPlusService.UnfollowPlaylist(this.player,this.mediaItem.id),this.updateActions(this.player,[as.PlaylistFavoriteUpdate])):this.progressHide(),!0)}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(as.PlaylistItemsUpdate)||0==t.length){const t=new Promise(((t,i)=>{const s=this.mediaItem.tracks.total;this.spotifyPlusService.GetPlaylistItems(e,this.mediaItem.id,0,0,null,null,null,s).then((e=>{this.playlistTracks=function(e){const t=new Array;return e&&e.items.forEach((e=>{null!=e.track.name&&t.push(e)})),t}(e),t(!0)})).catch((e=>{this.playlistTracks=void 0,this.alertErrorSet("Get Playlist Items failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(as.PlaylistFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckPlaylistFollowers(e,this.mediaItem.id).then((e=>{this.isPlaylistFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isPlaylistFavorite=void 0,this.alertErrorSet("Check Playlist Followers failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Playlist actions refresh failed: "+At(e)),!0}}}we([Ue({attribute:!1})],ns.prototype,"mediaItem",void 0),we([Ve()],ns.prototype,"playlistTracks",void 0),we([Ve()],ns.prototype,"isPlaylistFavorite",void 0),customElements.define("spc-playlist-actions",ns);const ls=Pe(de+":category-browser");let ds=class extends Ki{constructor(){super(Qe.CATEGORYS),this.filterCriteriaPlaceholder="filter by category name"}render(){let e,t;if(super.render(),!this.isActionsVisible){const i=(this.filterCriteria||"").toLocaleLowerCase();this.isCategoryVisible?(e=this.categoryPlaylists?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(i))),this.filterItemCount=e?.length):(t=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(i))),this.filterItemCount=t?.length)}let i="",s="";return this.isCategoryVisible?(i=wt(this.config.categoryBrowserTitle,this.config,this.player,this.categoryPlaylistsLastUpdatedOn,this.categoryPlaylists,e),s=wt(this.config.categoryBrowserSubTitle,this.config,this.player,this.categoryPlaylistsLastUpdatedOn,this.categoryPlaylists,e)):(i=wt(this.config.categoryBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,t),s=wt(this.config.categoryBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,t)),this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.categoryBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${i?H`<div class="media-browser-section-title">${i}</div>`:H``}
        ${s?H`<div class="media-browser-section-subtitle">${s}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible||this.isCategoryVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-playlist-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-playlist-actions>`:this.isCategoryVisible?1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${t}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${t}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}displayCategory(e){ls.enabled&&ls("displayCategory - displaying Spotify category:\n%s",JSON.stringify(e,null,2)),this.categoryId=Ii(e.uri)||"",this.isCategoryVisible=!0,this.categoryListFilter=e.title||"",this.categoryListScrollTopSaved=this.scrollTopSaved,this.filterCriteria=e.filterCriteria,this.categoryPlaylists=void 0,this.requestUpdate(),this.updateMediaList(this.player)}onFilterActionsClick(e){"hideactions"===e.currentTarget.getAttribute("action")?this.isActionsVisible?super.onFilterActionsClick(e):this.isCategoryVisible&&(this.categoryId="",this.isCategoryVisible=!1,this.filterCriteria=this.categoryListFilter,this.scrollTopSaved=this.categoryListScrollTopSaved,setTimeout((()=>{this.requestUpdate()}),50)):super.onFilterActionsClick(e)}onItemSelected(e){ls.enabled&&ls("onItemSelected - media item selected:\n%s",JSON.stringify(e.detail,null,2));if("category"==e.detail.type){const t=e.detail;this.scrollTopSaved=this.mediaBrowserContentElement.scrollTop,this.categoryId=t.id,this.isCategoryVisible=!0,this.categoryListFilter=this.filterCriteria,this.categoryListScrollTopSaved=this.scrollTopSaved,this.filterCriteria="",this.categoryPlaylists=void 0,this.requestUpdate(),this.updateMediaList(this.player)}else super.onItemSelected(e)}onItemSelectedWithHold(e){ls.enabled&&ls("onItemSelectedWithHold - media item selected:\n%s",JSON.stringify(e.detail,null,2));"category"==e.detail.type?this.onItemSelected(e):super.onItemSelectedWithHold(e)}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array;if(this.isCategoryVisible){const i=new Promise(((t,i)=>{const s=this.config.searchMediaBrowserSearchLimit||50,r=this.config.searchMediaBrowserItemsSortTitle||!1;this.spotifyPlusService.GetCategoryPlaylists(e,this.categoryId,0,0,null,s,r).then((e=>{this.categoryPlaylists=e.items,this.categoryPlaylistsLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.categoryPlaylists=void 0,this.categoryPlaylistsLastUpdatedOn=0,super.updatedMediaListError("Get Category Playlist failed: "+At(e)),i(e)}))}));t.push(i)}else{const i=new Promise(((t,i)=>{this.spotifyPlusService.GetBrowseCategorysList(e,null,null,!0).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Category List failed: "+At(e)),i(e)}))}));t.push(i)}return this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Category List refresh failed: "+At(e)),!0}}};var cs;we([Ve()],ds.prototype,"isCategoryVisible",void 0),we([Ve()],ds.prototype,"categoryId",void 0),ds=we([xe("spc-category-browser")],ds),function(e){e.DeviceDisconnect="DeviceDisconnect",e.DeviceConnect="DeviceConnect",e.DeviceGetInfo="DeviceGetInfo"}(cs||(cs={}));class hs extends ni{constructor(){super(Qe.DEVICES)}render(){super.render(),this.deviceInfo||(this.deviceInfo=this.mediaItem);const e=this.deviceInfo?.IsInDeviceList?"device-list-in":"device-list-out",t=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(cs.DeviceConnect)}>
          <ha-svg-icon slot="start" .path=${"M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H13V9H10C11.11,9 12,8.11 12,7V3C12,1.89 11.11,1 10,1H4M4,3H10V7H4V3M3,13V18L3,20H10V18H5V13H3M14,13C12.89,13 12,13.89 12,15V19C12,20.11 12.89,21 14,21H11V23H23V21H20C21.11,21 22,20.11 22,19V15C22,13.89 21.11,13 20,13H14M14,15H20V19H14V15Z"}></ha-svg-icon>
          <div slot="headline">Connect / Login to this device</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(cs.DeviceDisconnect)}>
          <ha-svg-icon slot="start" .path=${"M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H13V9H10C11.11,9 12,8.11 12,7V3C12,1.89 11.11,1 10,1H4M4,3H10V7H4V3M14,13C12.89,13 12,13.89 12,15V19C12,20.11 12.89,21 14,21H11V23H23V21H20C21.11,21 22,20.11 22,19V15C22,13.89 21.11,13 20,13H14M3.88,13.46L2.46,14.88L4.59,17L2.46,19.12L3.88,20.54L6,18.41L8.12,20.54L9.54,19.12L7.41,17L9.54,14.88L8.12,13.46L6,15.59L3.88,13.46M14,15H20V19H14V15Z"}></ha-svg-icon>
          <div slot="headline">Disconnect / Logout from this device</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H` 
      <div class="device-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style=${this.styleMediaBrowserItemImage(this.deviceInfo?.image_url)}></div>
          <div class="media-info-details">
            <div class="media-info-text-ms-c">
              ${this.deviceInfo?.Name}
              <span class="actions-dropdown-menu padL">
                ${t}
              </span>
            </div>
            <div class="media-info-text-ms">${this.deviceInfo?.DeviceInfo.BrandDisplayName}</div>
            <div class="media-info-text-s">${this.deviceInfo?.DeviceInfo.ModelDisplayName}</div>
            ${this.deviceInfo?.IsSonos?H`
              <div class="media-info-text-s padT">
                Sonos device (will not appear in Spotify Web API device list)
              </div>
            `:""}
            ${this.deviceInfo?.IsChromeCast?H`
              <div class="media-info-text-s padT">
                Chromecast device
              </div>
            `:""}
          </div>
        </div>
        <div class="grid-container-scrollable">
          <div class="grid device-grid">
            
            <div class="grid-action-info-hdr-s">Device ID</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DeviceInfo.DeviceId}</div>
                    
            <div class="grid-action-info-hdr-s">Device Name</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DiscoveryResult.DeviceName}</div>
            
            <div class="grid-action-info-hdr-s">Device Type</div>
            <div class="grid-action-info-text-s">${this.deviceInfo?.DeviceInfo.DeviceType}</div>
                    
            <div class="grid-action-info-hdr-s">Group Status</div>
            <div class="grid-action-info-text-s">${this.deviceInfo?.DeviceInfo.GroupStatus}</div>
                    
            <div class="grid-action-info-hdr-s">Product ID</div>
            <div class="grid-action-info-text-s">${this.deviceInfo?.DeviceInfo.ProductId}</div>
                    
            <div class="grid-action-info-hdr-s">Voice Support?</div>
            <div class="grid-action-info-text-s">${this.deviceInfo?.DeviceInfo.VoiceSupport}</div>

            <div class="grid-action-info-hdr-s">IP DNS Alias</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DiscoveryResult.Server}</div>
            
            <div class="grid-action-info-hdr-s">IP Address</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DiscoveryResult.HostIpAddress}</div>
            
            <div class="grid-action-info-hdr-s">Zeroconf IP Port</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DiscoveryResult.HostIpPort}</div>
            
            <div class="grid-action-info-hdr-s">Zeroconf CPath</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DiscoveryResult.SpotifyConnectCPath}</div>

            <div class="grid-action-info-hdr-s">Is Dynamic Device?</div>
            <div class="grid-action-info-text-s">${this.deviceInfo?.DiscoveryResult.IsDynamicDevice}</div>

            <div class="grid-action-info-hdr-s">Is in Device List?</div>
            <div class="grid-action-info-text-s ${e}">${this.deviceInfo?.IsInDeviceList}</div>

            <div class="grid-action-info-hdr-s">Auth Token Type</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DeviceInfo.TokenType}</div>
                    
            <div class="grid-action-info-hdr-s">Client ID</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DeviceInfo.ClientId}</div>

            <div class="grid-action-info-hdr-s">Library Version</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DeviceInfo.LibraryVersion}</div>

            <div class="grid-action-info-hdr-s">Active User</div>
            <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.deviceInfo?.DeviceInfo.ActiveUser}</div>

          </div>
        </div>    
      </div>`}static get styles(){return[ei,ti,ii,a`

      .device-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      .device-grid {
        grid-template-columns: auto auto;
        justify-content: left;
      }

      .device-list-in {
        color: limegreen;
        font-weight: bold;
      }

      .device-list-out {
        color: red;
        font-weight: bold;
      }

      /* reduce image size for device */
      .media-info-content .img {
        background-size: cover !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        mask-repeat: no-repeat !important;
        mask-position: center !important;
        max-width: 100px;
        min-height: 100px;
        border-radius: var(--control-button-border-radius, 10px) !important;
      }

      .padT {
        padding-top: 0.2rem;
      }

      .padL {
        padding-left: 0.2rem;
      }

      /* style ha-alert controls */
      ha-alert {
        display: block;
        margin-bottom: 0.25rem;
      }

    `]}styleMediaBrowserItemImage(e){const t={};return e?.includes("svg+xml")?(t["mask-image"]=`url(${e})`,t["background-color"]=`var(--spc-media-browser-items-svgicon-color, ${o(Ae)})`):(t["background-image"]=`url(${e})`,t["background-color"]="var(--spc-media-browser-items-svgicon-color, transparent)"),Me(t)}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{return this.progressShow(),e==cs.DeviceConnect?this.deviceInfo?.DiscoveryResult.IsDynamicDevice?(this.alertInfoSet("Dynamic devices cannot be managed."),this.progressHide()):this.mediaItem.IsChromeCast?(this.alertInfoSet("Chromecast devices do not support Spotify Connect connect."),this.progressHide()):(this.alertInfoSet("Connecting to Spotify Connect device ..."),await this.spotifyPlusService.ZeroconfDeviceConnect(this.player,this.mediaItem,null,null,null,!0,!0,1),this.alertInfoSet("Spotify Connect device should be connected."),this.updateActions(this.player,[cs.DeviceGetInfo])):e==cs.DeviceDisconnect?this.mediaItem.DiscoveryResult.IsDynamicDevice?(this.alertInfoSet("Dynamic devices cannot be managed."),this.progressHide()):this.mediaItem.IsChromeCast?(this.alertInfoSet("Chromecast devices do not support Spotify Connect disconnect."),this.progressHide()):"librespot"==this.mediaItem.DeviceInfo.BrandDisplayName?(this.alertInfoSet("Librespot devices do not support Spotify Connect disconnect."),this.progressHide()):(this.alertInfoSet("Disconnecting from Spotify Connect device ..."),await this.spotifyPlusService.ZeroconfDeviceDisconnect(this.player,this.mediaItem,1),this.alertInfoSet("Spotify Connect device was disconnected."),this.updateActions(this.player,[cs.DeviceGetInfo])):this.progressHide(),!0}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(cs.DeviceGetInfo)){const t=new Promise(((t,i)=>{this.alertInfo='Retrieving Spotify Connect status for "'+this.mediaItem.Name+'" ...';this.spotifyPlusService.GetSpotifyConnectDevice(e,this.mediaItem.Id,null,null,!0,!1).then((e=>{this.alertInfo?.startsWith("Retrieving ")&&this.alertInfoClear(),this.deviceInfo=e,e&&(this.mediaItem=e),t(!0)})).catch((e=>{this.deviceInfo=void 0,this.alertErrorSet("Get Spotify Connect Device failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Update device actions failed: "+At(e)),!0}}}we([Ue({attribute:!1})],hs.prototype,"mediaItem",void 0),we([Ve()],hs.prototype,"deviceInfo",void 0),customElements.define("spc-device-actions",hs);const us=Pe(de+":device-browser");let ms=class extends Ki{constructor(){super(Qe.DEVICES),this.filterCriteriaPlaceholder="filter by device name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.Name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.deviceBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.deviceBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.deviceFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-device-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-device-actions>`:1===(this.config.deviceBrowserItemsPerRow||1)?H`<spc-media-browser-list
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}firstUpdated(e){super.firstUpdated(e),this.isCardInEditPreview||(us.enabled&&us("firstUpdated - updating mediaList on form entry"),this.updateMediaList(this.player))}onFilterActionsClick(e){"refresh"===e.currentTarget.getAttribute("action")&&(this.refreshDeviceList=!0),super.onFilterActionsClick(e)}onItemSelected(e){us.enabled&&us("onItemSelected - device item selected:\n%s",JSON.stringify(e.detail,null,2));const t=e.detail;this.SelectSource(t)}async SelectSource(e){try{this.progressShow(),this.alertInfo='Transferring playback to device "'+e.Name+'" ...';let t="";t=e.IsSonos?e.Name:this.config.deviceControlByName?e.Name||e.Id||"":e.Id||e.Name||"",await this.store.mediaControlService.select_source(this.player,t),this.store.card.SetSection(Qe.PLAYER)}catch(e){this.alertErrorSet("Could not select source.  "+At(e)),this.mediaBrowserContentElement.scrollTop=0}finally{this.progressHide()}}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.refreshDeviceList||!1;let r=e.attributes.sp_source_list_hide||[];1==(this.config.deviceBrowserItemsShowHiddenDevices&&!0)&&(r=[]),this.spotifyPlusService.GetSpotifyConnectDevices(e,s,!0,r).then((e=>{this.mediaList=e.Items,this.mediaListLastUpdatedOn=e.DateLastRefreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Spotify Connect Devices failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Spotify Connect Device refresh failed: "+At(e)),!0}}};var ps;ms=we([xe("spc-device-browser")],ms),function(e){e.EpisodeCopyPresetToClipboard="EpisodeCopyPresetToClipboard",e.EpisodeCopyPresetJsonToClipboard="EpisodeCopyPresetJsonToClipboard",e.EpisodeCopyUriToClipboard="EpisodeCopyUriToClipboard",e.EpisodeFavoriteAdd="EpisodeFavoriteAdd",e.EpisodeFavoriteRemove="EpisodeFavoriteRemove",e.EpisodeFavoriteUpdate="EpisodeFavoriteUpdate",e.EpisodeUpdate="EpisodeUpdate",e.EpisodeUserPresetAdd="EpisodeUserPresetAdd",e.ShowCopyPresetToClipboard="ShowCopyPresetToClipboard",e.ShowCopyPresetJsonToClipboard="ShowCopyPresetJsonToClipboard",e.ShowCopyUriToClipboard="ShowCopyUriToClipboard",e.ShowFavoriteAdd="ShowFavoriteAdd",e.ShowFavoriteRemove="ShowFavoriteRemove",e.ShowFavoriteUpdate="ShowFavoriteUpdate",e.ShowSearchEpisodes="ShowSearchEpisodes",e.ShowUserPresetAdd="ShowUserPresetAdd"}(ps||(ps={}));class vs extends ni{constructor(){super(Qe.EPISODE_FAVORITES)}render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Dt}
          label="Add Show &quot;${this.episode?.show.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(ps.ShowFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Show &quot;${this.episode?.show.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(ps.ShowFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Episode &quot;${this.episode?.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(ps.EpisodeFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Episode &quot;${this.episode?.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(ps.EpisodeFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,r=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${zt}
          .label="View Show &quot;${this.episode?.show.name}&quot; info on Spotify.com"
          @click=${()=>It(this.episode?.show.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,o=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Nt}
          .label="View Episode &quot;${this.episode?.name}&quot; info on Spotify.com"
          @click=${()=>It(this.episode?.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,a=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.ShowSearchEpisodes)} hide=${this.hideSearchType(kt.EPISODES)}>
          <ha-svg-icon slot="start" .path=${Nt}></ha-svg-icon>
          <div slot="headline">Search for Show Episodes</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.ShowUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Show to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.ShowCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Show Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.ShowCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Show Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.ShowCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Show URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,n=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.EpisodeUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Episode to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.EpisodeCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Episode Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.EpisodeCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Episode Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ps.EpisodeCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Episode URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H` 
      <div class="episode-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.episode?.image_url});"></div>
          <div class="media-info-details">
            <div class="media-info-text-ms-c">
              ${o}
              ${this.episode?.name}
              ${this.isEpisodeFavorite?s:i}
              <span class="actions-dropdown-menu">
                ${n}
              </span>
            </div>
            <div class="media-info-text-ms">
              ${r}
              ${this.episode?.show.name}
              ${this.isShowFavorite?t:e}
              <span class="actions-dropdown-menu">
                ${a}
              </span>
            </div>
            <div class="grid episode-info-grid">
              <div class="grid-action-info-hdr-s">Duration</div>
              <div class="grid-action-info-text-s">${lt(this.episode?.duration_ms||0)}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Released</div>
              <div class="grid-action-info-text-s">${this.episode?.release_date}</div>

              <div class="grid-action-info-hdr-s">Explicit</div>
              <div class="grid-action-info-text-s">${this.episode?.explicit||!1}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Links</div>
              <div class="grid-action-info-text-s">
                <ha-icon-button style="padding-left:10px;"
                  .path=${zt}
                  label="View Show &quot;${this.episode?.show.name}&quot; info on Spotify.com"
                  @click=${()=>It(this.episode?.show.external_urls.spotify||"")}
                  slot="media-info-icon-link-s"
                ></ha-icon-button>
                <ha-icon-button style="padding-left:10px;"
                  .path=${Nt}
                  label="View Episode &quot;${this.episode?.name}&quot; info on Spotify.com"
                  @click=${()=>It(this.episode?.external_urls.spotify||"")}
                  slot="media-info-icon-link-s"
                ></ha-icon-button>
              </div>

              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s colspan-r3-c2 copy2cb" @click=${ft}>${this.mediaItem.uri}</div>

            </div>
          </div>
        </div>
        <div class="media-info-description">
          <div class="media-info-text-s" .innerHTML="${ot(this.episode?.html_description||"")}"></div>
        </div>
      </div>
      `}static get styles(){return[ei,ti,ii,a`

      .episode-info-grid {
        grid-template-columns: auto auto 30px auto auto;
        justify-content: left;
      }

      .episode-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      .colspan-r3-c2 {
        grid-row: 3 / 3;    /* grid row 3 */
        grid-column: 2 / 6; /* grid columns 2 thru 5 */
      }
    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{return e==ps.EpisodeCopyPresetToClipboard?(it(Ei(this.episode,this.episode?.show.name)),this.alertInfoSet(be),!0):e==ps.EpisodeCopyPresetJsonToClipboard?(it($i(this.episode,this.episode?.show.name)),this.alertInfoSet(Ce),!0):e==ps.EpisodeCopyUriToClipboard?(it(this.episode?.uri||""),!0):e==ps.ShowCopyPresetToClipboard?(it(Ei(this.episode?.show,"Podcast")),this.alertInfoSet(be),!0):e==ps.ShowCopyPresetJsonToClipboard?(it($i(this.episode?.show,"Podcast")),this.alertInfoSet(Ce),!0):e==ps.ShowCopyUriToClipboard?(it(this.episode?.show.uri||""),!0):e==ps.ShowSearchEpisodes?(this.dispatchEvent(ci(kt.SHOW_EPISODES,this.episode?.show.name,this.episode?.show.name,this.episode?.show.uri)),!0):(this.progressShow(),e==ps.EpisodeUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.episode)),await Vi(this.store.config),this.progressHide()):e==ps.EpisodeFavoriteAdd?(await this.spotifyPlusService.SaveEpisodeFavorites(this.player,this.episode?.id),this.updateActions(this.player,[ps.EpisodeFavoriteUpdate])):e==ps.EpisodeFavoriteRemove?(await this.spotifyPlusService.RemoveEpisodeFavorites(this.player,this.episode?.id),this.updateActions(this.player,[ps.EpisodeFavoriteUpdate])):e==ps.ShowUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.episode?.show)),await Vi(this.store.config),this.progressHide()):e==ps.ShowFavoriteAdd?(await this.spotifyPlusService.SaveShowFavorites(this.player,this.episode?.show.id),this.updateActions(this.player,[ps.ShowFavoriteUpdate])):e==ps.ShowFavoriteRemove?(await this.spotifyPlusService.RemoveShowFavorites(this.player,this.episode?.show.id),this.updateActions(this.player,[ps.ShowFavoriteUpdate])):this.progressHide(),!0)}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const s=new Array;if(-1!=t.indexOf(ps.EpisodeUpdate)||0==t.length){if(this.isEpisodeFavorite=void 0,this.isShowFavorite=void 0,"object"==typeof(i=this.mediaItem)&&null!==i&&"show"in i)return this.episode=this.mediaItem,this.isUpdateInProgress=!1,setTimeout((()=>{this.updateActions(e,[ps.EpisodeFavoriteUpdate,ps.ShowFavoriteUpdate])}),50),!0;const t=new Promise(((t,i)=>{this.spotifyPlusService.GetEpisode(e,this.mediaItem.id).then((i=>{this.episode=i,setTimeout((()=>{this.updateActions(e,[ps.EpisodeFavoriteUpdate,ps.ShowFavoriteUpdate])}),50),t(!0)})).catch((e=>{this.episode=void 0,this.alertErrorSet("Get Episode call failed: "+At(e)),i(e)}))}));s.push(t)}if(-1!=t.indexOf(ps.ShowFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckShowFavorites(e,this.episode?.show.id).then((e=>{this.isShowFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isShowFavorite=void 0,this.alertErrorSet("Check Show Favorite failed: "+At(e)),i(e)}))}));s.push(t)}if(-1!=t.indexOf(ps.EpisodeFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckEpisodeFavorites(e,this.episode?.id).then((e=>{this.isEpisodeFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isEpisodeFavorite=void 0,this.alertErrorSet("Check Episode Favorites failed: "+At(e)),i(e)}))}));s.push(t)}return this.progressShow(),Promise.allSettled(s).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Episode actions refresh failed: "+At(e)),!0}var i}}we([Ue({attribute:!1})],vs.prototype,"mediaItem",void 0),we([Ve()],vs.prototype,"isEpisodeFavorite",void 0),we([Ve()],vs.prototype,"isShowFavorite",void 0),we([Ve()],vs.prototype,"episode",void 0),customElements.define("spc-episode-actions",vs);let gs=class extends Ki{constructor(){super(Qe.EPISODE_FAVORITES),this.filterCriteriaPlaceholder="filter by episode name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t)||-1!==e.show.name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.episodeFavBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.episodeFavBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.episodeFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-episode-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-episode-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.config.episodeFavBrowserItemsLimit||this.LIMIT_TOTAL_MAX,r=this.config.episodeFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetEpisodeFavorites(e,0,0,s,r).then((e=>{this.mediaList=function(e){const t=new Array;if(e)for(const i of e.items||[])t.push(i.episode);return t}(e),this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Episode Favorites failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Episode favorites refresh failed: "+At(e)),!0}}};gs=we([xe("spc-episode-fav-browser")],gs);class fs extends oi{constructor(){super(...arguments),this.mediaDuration=0}render(){this.player=this.store.player,this.mediaDuration=this.player?.attributes.media_duration||0;return this.mediaDuration>0?(this.trackProgress(),H`
        <div class="progress">
          <span class="progress-time progress-pad-left">${As(this.playingProgress)}</span>
          <div class="bar" @click=${this.onSeekBarClick}>
            <div class="progress-bar" style=${this.styleProgressBar(this.mediaDuration)}></div>
          </div>
          <span class="progress-time progress-pad-right"> -${As(this.mediaDuration-this.playingProgress)}</span>
        </div>
      `):H``}disconnectedCallback(){this.tracker&&(clearInterval(this.tracker),this.tracker=void 0),super.disconnectedCallback()}async onSeekBarClick(e){try{const t=this.progressBar.offsetWidth,i=e.offsetX/t,s=this.mediaDuration*i;return this.progressShow(),await this.store.mediaControlService.media_seek(this.player,s),!0}catch(e){return this.alertErrorSet("Seek position failed: "+At(e)),!0}finally{this.progressHide()}}alertErrorSet(e){const t=vt("#spcPlayer",this);t&&t.alertErrorSet(e)}styleProgressBar(e){return Me({width:this.playingProgress/e*100+"%"})}trackProgress(){const e=this.player?.attributes.media_position||0,t=this.player?.isPlaying(),i=this.player?.attributes.media_position_updated_at||0;this.playingProgress=t?e+(Date.now()-new Date(i).getTime())/1e3:e,this.tracker||(this.tracker=setInterval((()=>this.trackProgress()),1e3)),t||(clearInterval(this.tracker),this.tracker=void 0)}static get styles(){return a`
      .progress {
        width: 100%;
        font-size: x-small;
        display: flex;
        color: var(--spc-player-progress-label-color, var(--spc-player-controls-color, #ffffff));
        padding-bottom: 0.2rem;
      }

      .progress-pad-left {
        padding-left: var(--spc-player-progress-label-padding-lr, 0rem);
      }

      .progress-pad-right {
        padding-right: var(--spc-player-progress-label-padding-lr, 0rem);
      }

      .bar {
        display: flex;
        flex-grow: 1;
        align-items: center;
        align-self: center;
        margin-left: 5px;
        margin-right: 5px;
        height: 14px;
        cursor: pointer;
        background-clip: padding-box;
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 0.25rem;
      }

      .progress-bar {
        align-self: center;
        background-color: var(--spc-player-progress-slider-color, var(--spc-player-controls-color, var(--dark-primary-color, ${o(Ae)})));
        margin-left: 2px;
        margin-right: 2px;
        height: 50%;
        transition: width 0.1s linear;
        border-radius: 0.18rem;
      }

      .progress-time {
        mix-blend-mode: normal;
      }
    `}}we([Ve()],fs.prototype,"playingProgress",void 0),we([Ne(".bar")],fs.prototype,"progressBar",void 0);const As=e=>{const t=new Date(1e3*e).toISOString().substring(11,19);return t.startsWith("00:")?t.substring(3):t};customElements.define("spc-player-progress",fs);class ys extends re{render(){this.config=this.store.config,this.player=this.store.player;const e=this.config.playerHeaderHideProgressBar||!1,t=wt(this.config.playerHeaderTitle,this.config,this.player);let i=wt(this.config.playerHeaderArtistTrack,this.config,this.player),s=wt(this.config.playerHeaderAlbum,this.config,this.player);i&&(i=i.replace(/^ - | - $/g,""));let r,o=!1,a=H``,n=H``;if(this.player.isPlaying()){const e=this.parentElement?.querySelector(".player-section-body-content");if(e){const t=e.tagName.toLowerCase();if("spc-player-body-track"==t){const t=e;r=t.isTrackFavorite,a=t.actionTrackFavoriteAdd,n=t.actionTrackFavoriteRemove,o=!0,t.mediaContentId=this.player.attributes.media_content_id}else if("spc-player-body-show"==t){const t=e;r=t.isEpisodeFavorite,a=t.actionEpisodeFavoriteAdd,n=t.actionEpisodeFavoriteRemove,o=!0,t.mediaContentId=this.player.attributes.media_content_id}else if("spc-player-body-audiobook"==t){const t=e;r=t.isAudiobookFavorite,a=t.actionAudiobookFavoriteAdd,n=t.actionAudiobookFavoriteRemove,o=!0,t.mediaContentId=this.player.attributes.media_content_id}}}return this.player.attributes.media_title||(i=wt(this.config.playerHeaderNoMediaPlayingText,this.config,this.player)||"No Media Playing",s=void 0),H` 
      <div class="player-header-container" style=${this.styleContainer()}>
        ${e?H``:H`<spc-player-progress .store=${this.store}></spc-player-progress>`}
        ${t?H`<div class="header-title">${t}</div>`:H``}
        ${i?H`
          <div class="header-artist-track">${i}
            ${o?H`${r?n:a}`:H``}
          </div>
        `:H``}
        ${s?H`<div class="header-artist-album">${s}</div>`:H``}
      </div>`}styleContainer(){return Me({})}static get styles(){return[ii,a`

      .player-header-container {
        margin-top: 0rem;
        padding: 0.5rem;
        padding-top: 0rem;
        padding-bottom: 0rem;
        max-width: 40rem;
        text-align: center;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        /*border: 1px solid red;  /*  FOR TESTING CONTROL LAYOUT CHANGES */
      }

      .header-title {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: var(--spc-player-header-title1-font-size, 1.0rem);
        line-height: var(--spc-player-header-title1-font-size, 1.0rem);
        font-weight: 500;
        text-shadow: 0 0 2px var(--spc-player-palette-vibrant);
        color: var(--spc-player-header-title1-color, #ffffff);
        white-space: nowrap;
        mix-blend-mode: normal;
        min-height: 0.5rem;
        padding: 0.2rem;
      }

      .header-artist-track {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: var(--spc-player-header-title2-font-size, 1.15rem);
        line-height: var(--spc-player-header-title2-font-size, 1.15rem);
        font-weight: 400;
        text-shadow: 0 0 2px var(--spc-player-palette-vibrant);
        color: var(--spc-player-header-title2-color, #ffffff);
        mix-blend-mode: normal;
        padding: 0.1rem;
      }

      .header-artist-album {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: var(--spc-player-header-title3-font-size, 1.0rem);
        line-height: var(--spc-player-header-title3-font-size, 1.0rem);
        font-weight: 400;
        text-shadow: 0 0 2px var(--spc-player-palette-vibrant);
        color: var(--spc-player-header-title3-color, #ffffff);
        mix-blend-mode: normal;
        padding: 0.1rem;
      }

      ///* when the user prefers dark theme mode */
      //@media (prefers-color-scheme: dark) {

      //  .header-title {
      //    color: var(--spc-player-header-title1-color, #ffffff);
      //  }

      //  .header-artist-track {
      //    color: var(--spc-player-header-title2-color, #ffffff);
      //  }

      //  .header-artist-album {
      //    color: var(--spc-player-header-title3-color, #ffffff);
      //  }
      //}
    `]}}we([Ue({attribute:!1})],ys.prototype,"store",void 0),customElements.define("spc-player-header",ys);const bs=Pe(de+":player-body-base");class Cs extends oi{constructor(){super(),this.mediaType=Qe.PLAYER}render(){this.player=this.store.player,this.spotifyPlusService=this.store.spotifyPlusService,this.isPlayerStopped=[Ci.PLAYING,Ci.PAUSED,Ci.BUFFERING].includes(this.player.state)&&V}firstUpdated(e){super.firstUpdated(e),(async()=>{await gt()})(),this.isCardInEditPreview||this.updateActions(this.store.player,[])}update(e){super.update(e);const t=Array.from(e.keys());if(this.hasUpdated&&!this.isCardInEditPreview)return t.includes("mediaContentId")?(bs.enabled&&bs("%cupdate - player content changed:\n- NEW CONTENT ID = %s\n- isCardInEditPreview = %s","color: gold;",JSON.stringify(this.player.attributes.media_content_id),JSON.stringify(this.isCardInEditPreview)),void setTimeout((()=>{this.updateActions(this.store.player,[])}),100)):void 0}hideSearchType(e){return!!(this.store.config.searchMediaBrowserSearchTypes&&this.store.config.searchMediaBrowserSearchTypes.length>0)&&!this.store.config.searchMediaBrowserSearchTypes?.includes(e)}async onClickAction(e,t=null){throw new Error('onClickAction not implemented for action "'+e+'".')}updateActions(e,t){return bs.enabled&&bs("updateActions - updating actions: %s\n- isCardInEditPreview = %s\n- hasCardEditLoadedMediaList:\n%s",JSON.stringify(Array.from(t.values())),JSON.stringify(this.isCardInEditPreview),JSON.stringify(Bi.hasCardEditLoadedMediaList,null,2)),this.isUpdateInProgress?(bs.enabled&&bs("updateActions - update in progress; ignoring updateActions request"),!1):(this.isUpdateInProgress=!0,this.isCardInEditPreview?(this.isUpdateInProgress=!1,bs.enabled&&bs("updateActions - card is in editpreview; ignoring updateActions request"),!1):e?this.player.attributes.media_content_id?(this.alertClear(),!0):(this.isUpdateInProgress=!1,bs.enabled&&bs("updateActions - player media_content_id reference not set; ignoring updateActions request"),!1):(this.isUpdateInProgress=!1,bs.enabled&&bs("updateActions - player reference not set; ignoring updateActions request"),!1))}updateActionsComplete(e){this.isCardInEditPreview&&0==e.length&&(Bi.hasCardEditLoadedMediaList[this.mediaType]=!0)}}var Ss;we([Ve()],Cs.prototype,"mediaContentId",void 0),function(e){e.AudiobookCopyPresetToClipboard="AudiobookCopyPresetToClipboard",e.AudiobookCopyPresetJsonToClipboard="AudiobookCopyPresetJsonToClipboard",e.AudiobookCopyUriToClipboard="AudiobookCopyUriToClipboard",e.AudiobookFavoriteAdd="AudiobookFavoriteAdd",e.AudiobookFavoriteRemove="AudiobookFavoriteRemove",e.AudiobookFavoriteUpdate="AudiobookFavoriteUpdate",e.AudiobookSearchAuthor="AudiobookSearchAuthor",e.AudiobookSearchNarrator="AudiobookSearchNarrator",e.AudiobookUserPresetAdd="AudiobookUserPresetAdd",e.ChapterCopyPresetToClipboard="ChapterCopyPresetToClipboard",e.ChapterCopyPresetJsonToClipboard="ChapterCopyPresetJsonToClipboard",e.ChapterCopyUriToClipboard="ChapterCopyUriToClipboard",e.ChapterFavoriteAdd="ChapterFavoriteAdd",e.ChapterFavoriteRemove="ChapterFavoriteRemove",e.ChapterFavoriteUpdate="ChapterFavoriteUpdate",e.GetPlayingItem="GetPlayingItem"}(Ss||(Ss={}));class ws extends Cs{render(){super.render(),this.actionAudiobookFavoriteAdd=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Audiobook &quot;${this.chapter?.audiobook.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(Ss.AudiobookFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,this.actionAudiobookFavoriteRemove=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Audiobook &quot;${this.chapter?.audiobook.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(Ss.AudiobookFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `;const e=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Chapter &quot;${this.chapter?.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(Ss.ChapterFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Chapter &quot;${this.chapter?.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(Ss.ChapterFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Ot}
          .label="View Audiobook &quot;${this.chapter?.audiobook.name}&quot; info on Spotify.com"
          @click=${()=>It(this.chapter?.audiobook.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Nt}
          .label="View Chapter &quot;${this.chapter?.name}&quot; info on Spotify.com"
          @click=${()=>It(this.chapter?.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,r=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.AudiobookSearchAuthor)} hide=${this.hideSearchType(kt.AUDIOBOOKS)}>
          <ha-svg-icon slot="start" .path=${Ft}></ha-svg-icon>
          <div slot="headline">Other Audiobooks by same Author</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.AudiobookSearchNarrator)} hide=${this.hideSearchType(kt.AUDIOBOOKS)}>
          <ha-svg-icon slot="start" .path=${Ft}></ha-svg-icon>
          <div slot="headline">Other Audiobooks by same Narrator</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.AudiobookUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Audiobook to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.AudiobookCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Audiobook Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.AudiobookCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Audiobook Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.AudiobookCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Audiobook URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,o=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.ChapterCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Chapter Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.ChapterCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Chapter Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(Ss.ChapterCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Chapter URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,a=H`
      <div class="media-info-content">
        <div class="media-info-details">
          <div class="media-info-text-ms-c">
            ${i}
            ${this.chapter?.audiobook.name}
            ${this.isAudiobookFavorite?this.actionAudiobookFavoriteRemove:this.actionAudiobookFavoriteAdd}
            <span class="actions-dropdown-menu">
              ${r}
            </span>
          </div>
          <div class="media-info-text-ms">
            ${s}
            ${this.chapter?.name}
            ${this.isChapterFavorite?t:e}
            <span class="actions-dropdown-menu">
              ${o}
            </span>
          </div>
          <div class="grid audiobook-info-grid">

            <div class="grid-action-info-hdr-s">Released</div>
            <div class="grid-action-info-text-s">${this.chapter?.release_date||"unknown"}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Duration</div>
            <div class="grid-action-info-text-s">${lt(this.chapter?.duration_ms||0)}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Links</div>
            <div class="grid-action-info-text-s">
              <ha-icon-button
                .path=${Ot}
                label="View Audiobook &quot;${this.chapter?.audiobook.name}&quot; info on Spotify.com"
                @click=${()=>It(this.chapter?.audiobook.external_urls.spotify||"")}
                slot="media-info-icon-link-s"
              ></ha-icon-button>
              <ha-icon-button style="padding-left:10px;"
                .path=${Nt}
                label="View Chapter &quot;${this.chapter?.name}&quot; info on Spotify.com"
                @click=${()=>It(this.chapter?.external_urls.spotify||"")}
                slot="media-info-icon-link-s"
              ></ha-icon-button>
            </div>

            <div class="grid-action-info-hdr-s">Edition</div>
            <div class="grid-action-info-text-s">${this.chapter?.audiobook.edition||"unknown"}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Publisher</div>
            <div class="grid-action-info-text-s colspan-r2-c5">${this.chapter?.audiobook.publisher||"unknown"}</div>

            <div class="grid-action-info-hdr-s">Authors</div>
            <div class="grid-action-info-text-s colspan-r3-c2">${_t(this.chapter?.audiobook,"; ")}</div>

            <div class="grid-action-info-hdr-s">Narrators</div>
            <div class="grid-action-info-text-s colspan-r4-c2">${Et(this.chapter?.audiobook,"; ")}</div>

            <div class="grid-action-info-hdr-s">Audiobook URI</div>
            <div class="grid-action-info-text-s colspan-r5-c2 copy2cb" @click=${ft}>${this.chapter?.audiobook.uri}</div>

            <div class="grid-action-info-hdr-s">Episode URI</div>
            <div class="grid-action-info-text-s colspan-r6-c2 copy2cb" @click=${ft}>${this.chapter?.uri}</div>

          </div>

          <div style="padding-top: 10px;">
            <div class="media-info-text-s" .innerHTML="${ot(this.chapter?.html_description||"")}"></div>
          </div>

        </div>
      </div>
     `;return H` 
      <div class="player-body-container" hide=${this.isPlayerStopped}>
        <div class="player-body-container-scrollable">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>"audiobook"==this.player.attributes.sp_item_type?H`${a}`:H``)()}
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .audiobook-info-grid {
        grid-template-columns: auto auto 30px auto auto 30px auto auto;
        justify-content: left;
      }

      .colspan-r2-c5 {
        grid-row: 2 / 2;    /* grid row 2 */
        grid-column: 5 / 9; /* grid columns 5 thru 8 */
      }

      .colspan-r3-c2 {
        grid-row: 3 / 3;    /* grid row 3 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }

      .colspan-r4-c2 {
        grid-row: 4 / 4;    /* grid row 4 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }

      .colspan-r5-c2 {
        grid-row: 5 / 5;    /* grid row 5 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }

      .colspan-r6-c2 {
        grid-row: 6 / 6;    /* grid row 6 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }

    `]}async onClickAction(e){try{return e==Ss.AudiobookCopyPresetToClipboard?(it(Ei(this.chapter?.audiobook,_t(this.chapter?.audiobook,", "))),this.alertInfoSet(be),!0):e==Ss.AudiobookCopyPresetJsonToClipboard?(it($i(this.chapter?.audiobook,_t(this.chapter?.audiobook,", "))),this.alertInfoSet(Ce),!0):e==Ss.AudiobookCopyUriToClipboard?(it(this.chapter?.audiobook.uri||""),!0):e==Ss.AudiobookSearchAuthor?(this.dispatchEvent(ci(kt.AUDIOBOOKS,_t(this.chapter?.audiobook," "))),!0):e==Ss.AudiobookSearchNarrator?(this.dispatchEvent(ci(kt.AUDIOBOOKS,Et(this.chapter?.audiobook," "))),!0):e==Ss.ChapterCopyPresetToClipboard?(it(Ei(this.chapter,this.chapter?.audiobook.name)),this.alertInfoSet(be),!0):e==Ss.ChapterCopyPresetJsonToClipboard?(it($i(this.chapter,this.chapter?.audiobook.name)),this.alertInfoSet(Ce),!0):e==Ss.ChapterCopyUriToClipboard?(it(this.chapter?.uri||""),!0):(this.progressShow(),e==Ss.AudiobookUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.chapter?.audiobook)),await Vi(this.store.config),this.progressHide()):e==Ss.AudiobookFavoriteAdd?(await this.spotifyPlusService.SaveAudiobookFavorites(this.player,this.chapter?.audiobook.id),this.updateActions(this.player,[Ss.AudiobookFavoriteUpdate])):e==Ss.AudiobookFavoriteRemove?(await this.spotifyPlusService.RemoveAudiobookFavorites(this.player,this.chapter?.audiobook.id),this.updateActions(this.player,[Ss.AudiobookFavoriteUpdate])):e==Ss.ChapterFavoriteAdd?(await this.spotifyPlusService.SaveEpisodeFavorites(this.player,this.chapter?.id),this.updateActions(this.player,[Ss.ChapterFavoriteUpdate])):e==Ss.ChapterFavoriteRemove?(await this.spotifyPlusService.RemoveEpisodeFavorites(this.player,this.chapter?.id),this.updateActions(this.player,[Ss.ChapterFavoriteUpdate])):this.progressHide(),!0)}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(Ss.GetPlayingItem)||0==t.length){this.isAudiobookFavorite=void 0,this.isChapterFavorite=void 0;const t=new Promise(((t,i)=>{const s=Ii(this.player.attributes.media_content_id);this.spotifyPlusService.GetChapter(e,s).then((i=>{this.chapter=i,setTimeout((()=>{this.updateActions(e,[Ss.AudiobookFavoriteUpdate,Ss.ChapterFavoriteUpdate])}),50),t(!0)})).catch((e=>{this.chapter=void 0,this.alertErrorSet("Get Episode call failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(Ss.AudiobookFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckAudiobookFavorites(e,this.chapter?.audiobook.id).then((e=>{this.isAudiobookFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isAudiobookFavorite=void 0,this.alertErrorSet("Check Audiobook Favorites failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(Ss.ChapterFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckEpisodeFavorites(e,this.chapter?.id).then((e=>{this.isChapterFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isChapterFavorite=void 0,this.alertErrorSet("Check Episode Favorites failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide(),this.updateActionsComplete(t)})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Audiobook actions refresh failed: "+At(e)),!0}}}we([Ve()],ws.prototype,"isAudiobookFavorite",void 0),we([Ve()],ws.prototype,"isChapterFavorite",void 0),we([Ve()],ws.prototype,"chapter",void 0),customElements.define("spc-player-body-audiobook",ws);customElements.define("spc-player-body-idle",class extends Cs{render(){super.render();const e=wt(this.store.config.playerHeaderNoMediaPlayingText,this.store.config,this.player)||"No Media Playing";return H` 
      <div class="player-idle-container">
        <div class="thumbnail" style=${this.styleMediaBrowserItemImage(me)}></div>
        <div class="title">${e}</div>
      </div>`}static get styles(){return[ei,ti,ii,a`

        /* style container */
        .player-idle-container {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-top: 0.5rem;
        }

        .thumbnail {
          min-height: var(--spc-player-controls-icon-size, ${o(fe)});
          min-width: var(--spc-player-controls-icon-size, ${o(fe)});
          max-height: var(--spc-player-controls-icon-size, ${o(fe)});
          max-width: var(--spc-player-controls-icon-size, ${o(fe)});
          background-repeat: no-repeat;
          background-position: center center;
          background-size: 70%;
        }

        .title {
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: var(--spc-player-minimized-title-font-size, 1.0rem);
          line-height: var(--spc-player-minimized-title-font-size, 1.3rem);
          font-weight: 500;
          text-shadow: 0 0 2px;
          color: var(--spc-player-minimized-title-color, #ffffff);
          white-space: nowrap;
          mix-blend-mode: normal;
          min-height: 0.5rem;
          padding-left: 0.5rem;
        }
      `]}styleMediaBrowserItemImage(e){const t={};return e?.includes("svg+xml")?(t["mask-image"]=`url(${e})`,t["background-color"]=`var(--spc-media-browser-items-svgicon-color, ${o(Ae)})`):(t["background-image"]=`url(${e})`,t["background-color"]="var(--spc-media-browser-items-svgicon-color, transparent)"),Me(t)}});const Is=Pe(de+":player-body-queue");var Ts,ks,_s;!function(e){e.EpisodePlay="EpisodePlay",e.GetPlayerQueueInfo="GetPlayerQueueInfo",e.TrackPlay="TrackPlay"}(Ts||(Ts={}));class Es extends Cs{render(){super.render();let e=H`<div class="grid-entry queue-info-grid-no-items">No items found in Queue</div>`;return(this.queueInfo?.queue||[]).length>0&&(e=H`${this.queueInfo?.queue.map(((e,t)=>H`
          ${(()=>"episode"==e.type?H`
                <ha-icon-button
                  .path=${Jt}
                  .label="Play episode &quot;${e.name||""}&quot;"
                  @click=${()=>this.onClickAction(Ts.EpisodePlay,e)}
                  slot="icon-button"
                >&nbsp;</ha-icon-button>
                <div class="grid-entry">${t+1}</div>
                <div class="grid-entry">${e.name||""}</div>
                <div class="grid-entry">${e.show?.name||""}</div>
              `:H`
                <ha-icon-button
                  .path=${Jt}
                  .label="Play track &quot;${e.name||""}&quot;"
                  @click=${()=>this.onClickAction(Ts.TrackPlay,e)}
                  slot="icon-button"
                >&nbsp;</ha-icon-button>
                <div class="grid-entry">${t+1}</div>
                <div class="grid-entry">${e.name||""}</div>
                <div class="grid-entry">${e.artists[0].name||""}</div>
              `)()}
      `))}`),H` 
      <div class="player-body-container" hide=${this.isPlayerStopped}>
        <div class="player-body-container-scrollable">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          <div class="media-info-text-ms-c queue-info-grid-container">
            Player Queue Items
          </div>
          <div class="queue-info-grid-container">
            <div class="grid queue-info-grid">
              <div class="grid-header">&nbsp;</div>
              <div class="grid-header">#</div>
              <div class="grid-header">Title</div>
              <div class="grid-header">Artist / Show / Book</div>
              ${e}
            </div>
          </div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

        /* style grid container */
        .queue-info-grid-container {
          margin: 0.25rem;
        }

        /* style grid container and grid items */
        .queue-info-grid {
          grid-template-columns: 30px 45px auto auto;
        }

        /* style grid container and grid items */
        .queue-info-grid-no-items {
          grid-column-start: 1;
          grid-column-end: 4;
        }

        /* style ha-icon-button controls in grid: icon size, title text */
        .queue-info-grid > ha-icon-button[slot="icon-button"] {
          --mdc-icon-button-size: 24px;
          --mdc-icon-size: 20px;
          vertical-align: top;
          padding: 0px;
        }
      `]}refreshQueueItems(){this.updateActions(this.player,[Ts.GetPlayerQueueInfo])}async onClickAction(e,t=null){try{if(this.progressShow(),e==Ts.GetPlayerQueueInfo)this.updateActions(this.player,[Ts.GetPlayerQueueInfo]);else if(e==Ts.EpisodePlay)await this.spotifyPlusService.Card_PlayMediaBrowserItem(this.player,t),this.progressHide();else if(e==Ts.TrackPlay){const{uris:e}=Tt(this.queueInfo?.queue,t);this.spotifyPlusService.PlayerMediaPlayTracks(this.player,e.join(","),null,null,null,!1),this.progressHide()}else this.progressHide();return!0}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(Ts.GetPlayerQueueInfo)){if(!e.isUserProductPremium())throw new Error(Se);const t=new Promise(((t,i)=>{this.spotifyPlusService.GetPlayerQueueInfo(e).then((e=>{this.queueInfo=e,Is.enabled&&Is("updateActions - queueInfo refreshed successfully"),t(!0)})).catch((e=>{this.queueInfo=void 0,this.alertErrorSet("Get Player Queue Info call failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide(),this.updateActionsComplete(t)})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Queue info refresh failed: "+At(e)),!0}}}we([Ve()],Es.prototype,"queueInfo",void 0),customElements.define("spc-player-body-queue",Es),function(e){e.EpisodeCopyPresetToClipboard="EpisodeCopyPresetToClipboard",e.EpisodeCopyPresetJsonToClipboard="EpisodeCopyPresetJsonToClipboard",e.EpisodeCopyUriToClipboard="EpisodeCopyUriToClipboard",e.EpisodeFavoriteAdd="EpisodeFavoriteAdd",e.EpisodeFavoriteRemove="EpisodeFavoriteRemove",e.EpisodeFavoriteUpdate="EpisodeFavoriteUpdate",e.EpisodeUserPresetAdd="EpisodeUserPresetAdd",e.GetPlayingItem="GetPlayingItem",e.ShowCopyPresetToClipboard="ShowCopyPresetToClipboard",e.ShowCopyPresetJsonToClipboard="ShowCopyPresetJsonToClipboard",e.ShowCopyUriToClipboard="ShowCopyUriToClipboard",e.ShowFavoriteAdd="ShowFavoriteAdd",e.ShowFavoriteRemove="ShowFavoriteRemove",e.ShowFavoriteUpdate="ShowFavoriteUpdate",e.ShowSearchEpisodes="ShowSearchEpisodes",e.ShowUserPresetAdd="ShowUserPresetAdd"}(ks||(ks={}));class $s extends Cs{render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Show &quot;${this.episode?.show.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(ks.ShowFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Show &quot;${this.episode?.show.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(ks.ShowFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `;this.actionEpisodeFavoriteAdd=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Episode &quot;${this.episode?.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(ks.EpisodeFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,this.actionEpisodeFavoriteRemove=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Episode &quot;${this.episode?.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(ks.EpisodeFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `;const i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${zt}
          .label="View Show &quot;${this.episode?.show.name}&quot; info on Spotify.com"
          @click=${()=>It(this.episode?.show.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Nt}
          .label="View Episode &quot;${this.episode?.name}&quot; info on Spotify.com"
          @click=${()=>It(this.episode?.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,r=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.ShowSearchEpisodes)} hide=${this.hideSearchType(kt.EPISODES)}>
          <ha-svg-icon slot="start" .path=${Nt}></ha-svg-icon>
          <div slot="headline">Search for Show Episodes</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.ShowUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Show to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.ShowCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Show Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.ShowCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Show Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.ShowCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Show URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,o=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.EpisodeUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Episode to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.EpisodeCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Episode Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.EpisodeCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Episode Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(ks.EpisodeCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Episode URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,a=H`
      <div class="media-info-content">
        <div class="media-info-details">
          <div class="media-info-text-ms-c">
            ${i}
            ${this.episode?.show.name}
            ${this.isShowFavorite?t:e}
            <span class="actions-dropdown-menu">
              ${r}
            </span>
          </div>
          <div class="media-info-text-ms">
            ${s}
            ${this.episode?.name}
            ${this.isEpisodeFavorite?this.actionEpisodeFavoriteRemove:this.actionEpisodeFavoriteAdd}
            <span class="actions-dropdown-menu">
              ${o}
            </span>
          </div>
          <div class="grid show-info-grid">
            <div class="grid-action-info-hdr-s">Released On</div>
            <div class="grid-action-info-text-s">${this.episode?.release_date||"unknown"}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Duration</div>
            <div class="grid-action-info-text-s">${lt(this.episode?.duration_ms||0)}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Links</div>
            <div class="grid-action-info-text-s">
              <ha-icon-button
                .path=${zt}
                label="View Show &quot;${this.episode?.show.name}&quot; info on Spotify.com"
                @click=${()=>It(this.episode?.show.external_urls.spotify||"")}
                slot="media-info-icon-link-s"
              ></ha-icon-button>
              <ha-icon-button style="padding-left:10px;"
                .path=${Nt}
                label="View Episode &quot;${this.episode?.name}&quot; info on Spotify.com"
                @click=${()=>It(this.episode?.external_urls.spotify||"")}
                slot="media-info-icon-link-s"
              ></ha-icon-button>
            </div>
            <div class="grid-action-info-hdr-s">Show URI</div>
            <div class="grid-action-info-text-s colspan-r2-c2 copy2cb" @click=${ft}>${this.episode?.show.uri}</div>
            <div class="grid-action-info-hdr-s">Episode URI</div>
            <div class="grid-action-info-text-s colspan-r3-c2 copy2cb" @click=${ft}>${this.episode?.uri}</div>
          </div>
          <div style="padding-top: 10px;">
            <div class="media-info-text-s" .innerHTML="${ot(this.episode?.html_description||"")}"></div>
          </div>
        </div>
      </div>
     `;return H` 
      <div class="player-body-container" hide=${this.isPlayerStopped}>
        <div class="player-body-container-scrollable">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>"podcast"==this.player.attributes.sp_item_type?H`${a}`:H``)()}
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .show-info-grid {
        grid-template-columns: auto auto 30px auto auto 30px auto auto;
        justify-content: left;
      }

      .colspan-r2-c2 {
        grid-row: 2 / 2;    /* grid row 2 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }

      .colspan-r3-c2 {
        grid-row: 3 / 3;    /* grid row 3 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }

    `]}async onClickAction(e){try{return e==ks.EpisodeCopyPresetToClipboard?(it(Ei(this.episode,this.episode?.show.name)),this.alertInfoSet(be),!0):e==ks.EpisodeCopyPresetJsonToClipboard?(it($i(this.episode,this.episode?.show.name)),this.alertInfoSet(Ce),!0):e==ks.EpisodeCopyUriToClipboard?(it(this.episode?.uri||""),!0):e==ks.ShowCopyPresetToClipboard?(it(Ei(this.episode?.show,"Podcast")),this.alertInfoSet(be),!0):e==ks.ShowCopyPresetJsonToClipboard?(it($i(this.episode?.show,"Podcast")),this.alertInfoSet(Ce),!0):e==ks.ShowCopyUriToClipboard?(it(this.episode?.show.uri||""),!0):e==ks.ShowSearchEpisodes?(this.dispatchEvent(ci(kt.SHOW_EPISODES,this.episode?.show.name,this.episode?.show.name,this.episode?.show.uri)),!0):(this.progressShow(),e==ks.ShowUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.episode?.show)),await Vi(this.store.config),this.progressHide()):e==ks.ShowFavoriteAdd?(await this.spotifyPlusService.SaveShowFavorites(this.player,this.episode?.show.id),this.updateActions(this.player,[ks.ShowFavoriteUpdate])):e==ks.ShowFavoriteRemove?(await this.spotifyPlusService.RemoveShowFavorites(this.player,this.episode?.show.id),this.updateActions(this.player,[ks.ShowFavoriteUpdate])):e==ks.EpisodeUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.episode)),await Vi(this.store.config),this.progressHide()):e==ks.EpisodeFavoriteAdd?(await this.spotifyPlusService.SaveEpisodeFavorites(this.player,this.episode?.id),this.updateActions(this.player,[ks.EpisodeFavoriteUpdate])):e==ks.EpisodeFavoriteRemove?(await this.spotifyPlusService.RemoveEpisodeFavorites(this.player,this.episode?.id),this.updateActions(this.player,[ks.EpisodeFavoriteUpdate])):this.progressHide(),!0)}catch(e){return this.progressHide(),this.alertErrorSet("Show action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(ks.GetPlayingItem)||0==t.length){this.isEpisodeFavorite=void 0,this.isShowFavorite=void 0;const t=new Promise(((t,i)=>{const s=Ii(this.player.attributes.media_content_id);this.spotifyPlusService.GetEpisode(e,s).then((i=>{this.episode=i,setTimeout((()=>{this.updateActions(e,[ks.ShowFavoriteUpdate,ks.EpisodeFavoriteUpdate])}),50),t(!0)})).catch((e=>{this.episode=void 0,this.alertErrorSet("Get Episode call failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(ks.ShowFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckShowFavorites(e,this.episode?.show.id).then((e=>{this.isShowFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isShowFavorite=void 0,this.alertErrorSet("Check Show Favorites failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(ks.EpisodeFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckEpisodeFavorites(e,this.episode?.id).then((e=>{this.isEpisodeFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isEpisodeFavorite=void 0,this.alertErrorSet("Check Episode Favorites failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide(),this.updateActionsComplete(t)})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Show actions refresh failed: "+At(e)),!0}}}we([Ve()],$s.prototype,"isShowFavorite",void 0),we([Ve()],$s.prototype,"isEpisodeFavorite",void 0),we([Ve()],$s.prototype,"episode",void 0),customElements.define("spc-player-body-show",$s),function(e){e.GetPlayingItem="GetPlayingItem",e.AlbumCopyPresetToClipboard="AlbumCopyPresetToClipboard",e.AlbumCopyPresetJsonToClipboard="AlbumCopyPresetJsonToClipboard",e.AlbumCopyUriToClipboard="AlbumCopyUriToClipboard",e.AlbumFavoriteAdd="AlbumFavoriteAdd",e.AlbumFavoriteRemove="AlbumFavoriteRemove",e.AlbumFavoriteUpdate="AlbumFavoriteUpdate",e.AlbumPlay="AlbumPlay",e.AlbumPlayTrackFavorites="AlbumPlayTrackFavorites",e.AlbumSearchRadio="AlbumSearchRadio",e.AlbumShowTracks="AlbumShowTracks",e.AlbumUserPresetAdd="AlbumUserPresetAdd",e.ArtistCopyPresetToClipboard="ArtistCopyPresetToClipboard",e.ArtistCopyPresetJsonToClipboard="ArtistCopyPresetJsonToClipboard",e.ArtistCopyUriToClipboard="ArtistCopyUriToClipboard",e.ArtistFavoriteAdd="ArtistFavoriteAdd",e.ArtistFavoriteRemove="ArtistFavoriteRemove",e.ArtistFavoriteUpdate="ArtistFavoriteUpdate",e.ArtistPlayTrackFavorites="ArtistPlayTrackFavorites",e.ArtistSearchPlaylists="ArtistSearchPlaylists",e.ArtistSearchRadio="ArtistSearchRadio",e.ArtistSearchTracks="ArtistSearchTracks",e.ArtistShowAlbums="ArtistShowAlbums",e.ArtistShowAlbumsAppearsOn="ArtistShowAlbumsAppearsOn",e.ArtistShowAlbumsCompilation="ArtistShowAlbumsCompilation",e.ArtistShowAlbumsSingle="ArtistShowAlbumsSingle",e.ArtistShowRelatedArtists="ArtistShowRelatedArtists",e.ArtistShowTopTracks="ArtistShowTopTracks",e.ArtistUserPresetAdd="ArtistUserPresetAdd",e.TrackCopyPresetToClipboard="TrackCopyPresetToClipboard",e.TrackCopyPresetJsonToClipboard="TrackCopyPresetJsonToClipboard",e.TrackCopyUriToClipboard="TrackCopyUriToClipboard",e.TrackFavoriteAdd="TrackFavoriteAdd",e.TrackFavoriteRemove="TrackFavoriteRemove",e.TrackFavoriteUpdate="TrackFavoriteUpdate",e.TrackSearchPlaylists="TrackSearchPlaylists",e.TrackSearchRadio="TrackSearchRadio",e.TrackUserPresetAdd="TrackUserPresetAdd"}(_s||(_s={}));class Ps extends Cs{render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Artist &quot;${this.track?.artists[0].name}&quot; to Favorites"
          @click=${()=>this.onClickAction(_s.ArtistFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Artist &quot;${this.track?.artists[0].name}&quot; from Favorites"
          @click=${()=>this.onClickAction(_s.ArtistFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Album &quot;${this.track?.album.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(_s.AlbumFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Album &quot;${this.track?.album.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(_s.AlbumFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `;this.actionTrackFavoriteAdd=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Track &quot;${this.track?.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(_s.TrackFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,this.actionTrackFavoriteRemove=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Track &quot;${this.track?.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(_s.TrackFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `;const r=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Lt}
          .label="View Artist &quot;${this.track?.artists[0].name}&quot; info on Spotify.com"
          @click=${()=>It(this.track?.artists[0].external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,o=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Rt}
          .label="View Album &quot;${this.track?.album.name}&quot; info on Spotify.com"
          @click=${()=>It(this.track?.album.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,a=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Gt}
          .label="View Track &quot;${this.track?.name}&quot; info on Spotify.com"
          @click=${()=>It(this.track?.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,n=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.TrackSearchPlaylists)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Search Playlists for Track</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.TrackSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Track Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.TrackUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Track to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.TrackCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Track Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.TrackCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Track Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.TrackCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Track URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,l=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumPlay)}>
          <ha-svg-icon slot="start" .path=${Jt}></ha-svg-icon>
          <div slot="headline">Play Album</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play Favorite Tracks from this Album</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumShowTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Show Album Tracks</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Album Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Album to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Album Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Album Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.AlbumCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Album URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,d=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play Favorite Tracks from this Artist</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistSearchPlaylists)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Search Playlists for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistSearchTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Search Tracks for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Artist Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistShowTopTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Show Artist Top Tracks</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistShowAlbums)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistShowAlbumsCompilation)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Compilations</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistShowAlbumsSingle)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Singles</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistShowAlbumsAppearsOn)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums AppearsOn</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistShowRelatedArtists)} hide=${this.hideSearchType(kt.ARTISTS)}>
          <ha-svg-icon slot="start" .path=${Lt}></ha-svg-icon>
          <div slot="headline">Show Related Artists</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Artist to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(_s.ArtistCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Artist URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,c=H`
      <div class="media-info-content">
        <div class="media-info-details">
          <div class="media-info-text-ms-c">
            ${a}
            ${this.track?.name}
            ${this.isTrackFavorite?this.actionTrackFavoriteRemove:this.actionTrackFavoriteAdd}
            <span class="actions-dropdown-menu">
              ${n}
            </span>
          </div>
          <div class="media-info-text-ms">
            ${o}
            ${this.track?.album.name}
            ${this.isAlbumFavorite?s:i}
            <span class="actions-dropdown-menu">
              ${l}
            </span>
          </div>
          <div class="media-info-text-ms">
            ${r}
            ${this.track?.artists[0].name}
            ${this.isArtistFavorite?t:e}
            <span class="actions-dropdown-menu">
              ${d}
            </span>
          </div>
          <div class="grid track-info-grid">
            <div class="grid-action-info-hdr-s">Track #</div>
            <div class="grid-action-info-text-s">${this.track?.track_number||"unknown"}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Duration</div>
            <div class="grid-action-info-text-s">${lt(this.track?.duration_ms||0)}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Released</div>
            <div class="grid-action-info-text-s">${this.track?.album.release_date}</div>

            <div class="grid-action-info-hdr-s">Disc #</div>
            <div class="grid-action-info-text-s">${this.track?.disc_number||"unknown"}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Explicit</div>
            <div class="grid-action-info-text-s">${this.track?.explicit||!1}</div>
            <div class="grid-action-info-text-s">&nbsp;</div>
            <div class="grid-action-info-hdr-s">Links</div>
            <div class="grid-action-info-text-s">
              <ha-icon-button
                .path=${Lt}
                label="View Artist &quot;${this.track?.artists[0].name}&quot; info on Spotify.com"
                @click=${()=>It(this.track?.artists[0].external_urls.spotify||"")}
                slot="media-info-icon-link-s"
              ></ha-icon-button>
              <ha-icon-button style="padding-left:10px;"
                .path=${Rt}
                label="View Album &quot;${this.track?.album.name}&quot; info on Spotify.com"
                @click=${()=>It(this.track?.album.external_urls.spotify||"")}
                slot="media-info-icon-link-s"
              ></ha-icon-button>
              <ha-icon-button style="padding-left:10px;"
                .path=${Gt}
                label="View Track &quot;${this.track?.name}&quot; info on Spotify.com"
                @click=${()=>It(this.track?.external_urls.spotify||"")}
                slot="media-info-icon-link-s"
              ></ha-icon-button>
            </div>

            <div class="grid-action-info-hdr-s">URI</div>
            <div class="grid-action-info-text-s colspan-r3-c2 copy2cb" @click=${ft}>${this.track?.uri}</div>

            ${this.track?.is_linked_from?H`
              <div class="grid-action-info-hdr-s">Origin URI</div>
              <div class="grid-action-info-text-s colspan-r4-c2 copy2cb" @click=${ft}>${this.track?.uri_origin}</div>
            `:""}

          </div>
        </div>
      </div>
     `;return H` 
      <div class="player-body-container" hide=${this.isPlayerStopped}>
        <div class="player-body-container-scrollable">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>"track"==this.player.attributes.sp_item_type?H`${c}`:H``)()}
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .track-info-grid {
        grid-template-columns: auto auto 30px auto auto 30px auto auto;
        justify-content: left;
      }

      .colspan-r3-c2 {
        grid-row: 3 / 3;    /* grid row 3 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }

      .colspan-r4-c2 {
        grid-row: 4 / 4;    /* grid row 4 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }
    `]}async onClickAction(e){try{if(this.isCardInEditPreview)return!1;if(e==_s.AlbumCopyPresetToClipboard)return it(Ei(this.track?.album,this.track?.album.artists[0].name)),this.alertInfoSet(be),!0;if(e==_s.AlbumCopyPresetJsonToClipboard)return it($i(this.track?.album,this.track?.album.artists[0].name)),this.alertInfoSet(Ce),!0;if(e==_s.AlbumCopyUriToClipboard)return it(this.track?.album.uri||""),!0;if(e==_s.AlbumSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.track?.album.name+ve+this.track?.artists[0].name)),!0;if(e==_s.AlbumShowTracks)return this.dispatchEvent(ci(kt.ALBUM_TRACKS,this.track?.album.name+"; "+this.track?.artists[0].name,this.track?.album.name,this.track?.album.uri,null,this.track?.album)),!0;if(e==_s.ArtistCopyPresetToClipboard)return it(Ei(this.track?.artists[0])),this.alertInfoSet(be),!0;if(e==_s.ArtistCopyPresetJsonToClipboard)return it($i(this.track?.artists[0])),this.alertInfoSet(Ce),!0;if(e==_s.ArtistCopyUriToClipboard)return it(this.track?.artists[0].uri||""),!0;if(e==_s.ArtistSearchPlaylists)return this.dispatchEvent(ci(kt.PLAYLISTS,this.track?.artists[0].name)),!0;if(e==_s.ArtistSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.track?.artists[0].name+ve)),!0;if(e==_s.ArtistSearchTracks)return this.dispatchEvent(ci(kt.TRACKS,this.track?.artists[0].name)),!0;if(e==_s.ArtistShowAlbums)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS,this.track?.artists[0].name,this.track?.artists[0].name,this.track?.artists[0].uri)),!0;if(e==_s.ArtistShowAlbumsAppearsOn)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_APPEARSON,this.track?.artists[0].name,this.track?.artists[0].name,this.track?.artists[0].uri)),!0;if(e==_s.ArtistShowAlbumsCompilation)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_COMPILATION,this.track?.artists[0].name,this.track?.artists[0].name,this.track?.artists[0].uri)),!0;if(e==_s.ArtistShowAlbumsSingle)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_SINGLE,this.track?.artists[0].name,this.track?.artists[0].name,this.track?.artists[0].uri)),!0;if(e==_s.ArtistShowRelatedArtists)return this.dispatchEvent(ci(kt.ARTIST_RELATED_ARTISTS,this.track?.artists[0].name,this.track?.artists[0].name,this.track?.artists[0].uri)),!0;if(e==_s.ArtistShowTopTracks)return this.dispatchEvent(ci(kt.ARTIST_TOP_TRACKS,this.track?.artists[0].name,this.track?.artists[0].name,this.track?.artists[0].uri)),!0;if(e==_s.TrackCopyPresetToClipboard)return it(Ei(this.track,this.track?.artists[0].name)),this.alertInfoSet(be),!0;if(e==_s.TrackCopyPresetJsonToClipboard)return it($i(this.track,this.track?.artists[0].name)),this.alertInfoSet(Ce),!0;if(e==_s.TrackCopyUriToClipboard)return it(this.track?.uri||""),!0;if(e==_s.TrackSearchPlaylists)return this.dispatchEvent(ci(kt.PLAYLISTS,this.track?.name+" "+this.track?.artists[0].name)),!0;if(e==_s.TrackSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.track?.name+ve+this.track?.artists[0].name)),!0;if(this.progressShow(),e==_s.AlbumUserPresetAdd)this.store.config.userPresets?.unshift(_i(this.track?.album)),await Vi(this.store.config),this.progressHide();else if(e==_s.AlbumFavoriteAdd)await this.spotifyPlusService.SaveAlbumFavorites(this.player,this.track?.album.id),this.updateActions(this.player,[_s.AlbumFavoriteUpdate]);else if(e==_s.AlbumFavoriteRemove)await this.spotifyPlusService.RemoveAlbumFavorites(this.player,this.track?.album.id),this.updateActions(this.player,[_s.AlbumFavoriteUpdate]);else if(e==_s.AlbumPlay)await this.spotifyPlusService.PlayerMediaPlayContext(this.player,this.track?.album.uri),this.progressHide(),this.store.card.SetSection(Qe.PLAYER);else if(e==_s.AlbumPlayTrackFavorites){const e=this.store.config.albumFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,999,null,this.track?.album.uri),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else if(e==_s.ArtistUserPresetAdd)this.track&&(this.track.artists[0].image_url=this.track?.album.image_url,this.store.config.userPresets?.unshift(_i(this.track?.artists[0])),await Vi(this.store.config),this.progressHide());else if(e==_s.ArtistFavoriteAdd)await this.spotifyPlusService.FollowArtists(this.player,this.track?.artists[0].id),this.updateActions(this.player,[_s.ArtistFavoriteUpdate]);else if(e==_s.ArtistFavoriteRemove)await this.spotifyPlusService.UnfollowArtists(this.player,this.track?.artists[0].id),this.updateActions(this.player,[_s.ArtistFavoriteUpdate]);else if(e==_s.ArtistPlayTrackFavorites){const e=this.store.config.artistFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,999,this.track?.artists[0].uri,null),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else e==_s.TrackUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.track)),await Vi(this.store.config),this.progressHide()):e==_s.TrackFavoriteAdd?(await this.spotifyPlusService.SaveTrackFavorites(this.player,this.track?.id),this.updateActions(this.player,[_s.TrackFavoriteUpdate])):e==_s.TrackFavoriteRemove?(await this.spotifyPlusService.RemoveTrackFavorites(this.player,this.track?.id),this.updateActions(this.player,[_s.TrackFavoriteUpdate])):this.progressHide();return!0}catch(e){return this.progressHide(),this.alertErrorSet("Track action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(_s.GetPlayingItem)||0==t.length){this.isAlbumFavorite=void 0,this.isArtistFavorite=void 0,this.isTrackFavorite=void 0;const t=new Promise(((t,i)=>{const s=Ii(this.player.attributes.media_content_id);this.spotifyPlusService.GetTrack(e,s).then((i=>{this.track=i,setTimeout((()=>{this.updateActions(e,[_s.TrackFavoriteUpdate,_s.AlbumFavoriteUpdate,_s.ArtistFavoriteUpdate])}),50),t(!0)})).catch((e=>{this.track=void 0,this.alertErrorSet("Get Track call failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(_s.AlbumFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckAlbumFavorites(e,this.track?.album.id).then((e=>{this.isAlbumFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isAlbumFavorite=void 0,this.alertErrorSet("Check Album Favorites failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(_s.ArtistFavoriteUpdate)){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckArtistsFollowing(e,this.track?.artists[0].id).then((e=>{this.isArtistFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isArtistFavorite=void 0,this.alertErrorSet("Check Artist Favorites failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(_s.TrackFavoriteUpdate)){const t=new Promise(((t,i)=>{let s=this.track?.id;this.track?.is_linked_from&&(s=this.track?.id+","+this.track?.id_origin),this.spotifyPlusService.CheckTrackFavorites(e,s).then((e=>{const i=Object.keys(e);this.isTrackFavorite=e[i[0]],i.length>1&&(this.isTrackFavorite=e[i[0]]||e[i[1]]),t(!0)})).catch((e=>{this.isTrackFavorite=void 0,this.alertErrorSet("Check Track Favorites failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide(),this.updateActionsComplete(t)})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Track actions refresh failed: "+At(e)),!0}}}we([Ve()],Ps.prototype,"isAlbumFavorite",void 0),we([Ve()],Ps.prototype,"isArtistFavorite",void 0),we([Ve()],Ps.prototype,"isTrackFavorite",void 0),we([Ve()],Ps.prototype,"track",void 0),customElements.define("spc-player-body-track",Ps);const Fs=Pe(de+":player-controls"),{NEXT_TRACK:Ls,PAUSE:Rs,PLAY:Os,PREVIOUS_TRACK:Ms,REPEAT_SET:xs,SHUFFLE_SET:Bs,TURN_ON:Hs,TURN_OFF:Us}=bi,Vs=9e11,Ds=99e10,Ns=999e9;class qs extends oi{render(){this.config=this.store.config,this.player=this.store.player,this.mediaControlService=this.store.mediaControlService,this.spotifyPlusService=this.store.spotifyPlusService;const e=[Ci.ON,Ci.PLAYING,Ci.PAUSED,Ci.BUFFERING].includes(this.player.state)&&V,t=[Ci.IDLE].includes(this.player.state)&&V,i=[Ci.OFF].includes(this.player.state)&&V,s=[yi.ONE,yi.ALL].includes(this.player.attributes.repeat||yi.OFF),r=this.player.attributes.shuffle,o=this.player.state==Ci.PAUSED,a=this.player.state==Ci.OFF,n=this.isActionFavoritesVisible,l=this.isQueueItemsVisible;return H`
      <div class="player-controls-container" style=${this.styleContainer(t,i)}>
          <div class="icons" hide=${e}>
              <div class="flex-1"></div>
              <ha-icon-button @click=${()=>this.onClickAction(Vs)}   hide=${this.hideFeature(Vs)}   .path=${"M11 9H13V7H11V9M14 17V15H13V11H10V13H11V15H10V17H14M5 3H19C20.1 3 21 3.89 21 5V19C21 19.53 20.79 20.04 20.41 20.41C20.04 20.79 19.53 21 19 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 3.89 3.89 3 5 3M19 19V5H5V19H19Z"} label="More Information" style=${this.styleIcon(n)} ></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Bs)}    hide=${this.hideFeature(Bs)}    .path=${this.getShuffleIcon()} label="Shuffle" style=${this.styleIcon(r)}></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Ms)} hide=${this.hideFeature(Ms)} .path=${"M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z"} label="Previous Track"></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Os)}           hide=${this.hideFeature(Os)}           .path=${Jt} label="Play" style=${this.styleIcon(o)}></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Rs)}          hide=${this.hideFeature(Rs)}          .path=${"M14,19H18V5H14M6,19H10V5H6V19Z"} label="Pause"></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Ls)}     hide=${this.hideFeature(Ls)}     .path=${"M16,18H18V6H16M6,18L14.5,12L6,6V18Z"} label="Next Track"></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(xs)}     hide=${this.hideFeature(xs)}     .path=${this.getRepeatIcon()} label="Repeat" style=${this.styleIcon(s)} ></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Ds)}     hide=${this.hideFeature(Ds)}     .path=${Wt} label="Play Queue Information" style=${this.styleIcon(l)} ></ha-icon-button>
          </div>
          <div class="iconsPower" hide=${i}>
              <ha-icon-button @click=${()=>this.onClickAction(Hs)}        hide=${this.hideFeature(Hs)}        .path=${jt} label="Turn On" style=${this.styleIcon(a)}></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Ns)}        hide=${this.hideFeature(Ns)}        .path=${Zt} label="Devices"></ha-icon-button>
          </div>
          <div class="iconsPower" hide=${t}>
              <ha-icon-button @click=${()=>this.onClickAction(Us)}       hide=${this.hideFeature(Us)}       .path=${jt} label="Turn Off"></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Os)}           hide=${this.hideFeature(Os)}           .path=${Jt} label="Play" style=${this.styleIcon(!0)}></ha-icon-button>
              <ha-icon-button @click=${()=>this.onClickAction(Ns)}        hide=${this.hideFeature(Ns)}        .path=${Zt} label="Devices"></ha-icon-button>
          </div>
          <spc-player-volume hide=${e} .store=${this.store} .player=${this.player} class="player-volume-container"></spc-player-volume>
      </div>
    `}static get styles(){return a`
      .player-controls-container {
        margin: 0.75rem 3.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        max-width: 40rem;
        text-align: center;
        overflow: hidden auto;
        /*border: 1px solid red;  /*  FOR TESTING CONTROL LAYOUT CHANGES */
      }

      .player-volume-container {
        display: block;
      }

      .icons {
        justify-content: center;
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        color: var(--spc-player-controls-icon-color, #ffffff);
        --mdc-icon-button-size: var(--spc-player-controls-icon-button-size, 2.75rem);
        --mdc-icon-size: var(--spc-player-controls-icon-size, ${o(fe)});
        mix-blend-mode: normal;
      }

      .iconsPower {
        justify-content: center;
        display: block;
        align-items: center;
        overflow: hidden;
        color: var(--spc-player-controls-icon-color, #ffffff);
        --mdc-icon-button-size: var(--spc-player-controls-icon-button-size, 2.75rem);
        --mdc-icon-size: var(--spc-player-controls-icon-size, ${o(fe)});
      }

      *[hide] {
        display: none;
      }

      .flex-1 {
        flex: 1;
      }
    `}constructor(){super(),this.onKeyDown_EventListenerBound=this.onKeyDown.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.onKeyDown_EventListenerBound)}disconnectedCallback(){document.removeEventListener("keydown",this.onKeyDown_EventListenerBound),super.disconnectedCallback()}update(e){super.update(e);Array.from(e.keys()).includes("mediaContentId")&&setTimeout((()=>{this.toggleDisplayPlayerBodyQueue()}),50)}toggleDisplayActionFavorites(){const e=this.parentElement?.querySelector(".player-section-body-content");e&&(e.style.display=this.isActionFavoritesVisible?"block":"none",e.style.opacity=this.isActionFavoritesVisible?"1":"0")}toggleDisplayPlayerBodyQueue(){const e=this.parentElement?.querySelector("#elmPlayerBodyQueue");e?(e.style.display=this.isQueueItemsVisible?"block":"none",e.style.opacity=this.isQueueItemsVisible?"1":"0",this.isQueueItemsVisible?(Fs("toggleDisplayPlayerBodyQueue - calling for refresh of queue items"),e.refreshQueueItems()):Fs("toggleDisplayPlayerBodyQueue - queue items not visible; isQueueItemsVisible = %s",JSON.stringify(this.isQueueItemsVisible))):Fs("toggleDisplayPlayerBodyQueue - could not find queue items #elmPlayerBodyQueue selector!")}onKeyDown(e){"Escape"===e.key&&(this.isActionFavoritesVisible?this.onClickAction(Vs):this.isQueueItemsVisible&&this.onClickAction(Ds))}async onClickAction(e){try{if(e==Vs)return this.isCardInEditPreview?(this.alertInfoSet("Action Favorites cannot be displayed while editing card configuration"),!0):(this.isActionFavoritesVisible=!this.isActionFavoritesVisible,Fs.enabled&&Fs("update - action favorites toggled - isActionFavoritesVisible = %s",JSON.stringify(this.isActionFavoritesVisible)),this.isQueueItemsVisible?(Fs("update - queue items visible; imediately closing queue items, and delay opening action favorites"),this.isQueueItemsVisible=!1,this.toggleDisplayPlayerBodyQueue(),setTimeout((()=>{this.toggleDisplayActionFavorites()}),250)):(Fs("update - queue items not visible; immediately toggling action favorites"),this.toggleDisplayActionFavorites()),!0);if(e==Ns)this.store.card.SetSection(Qe.DEVICES);else if(e==Ds)return this.isCardInEditPreview?(this.alertInfoSet("Queue items cannot be displayed while editing card configuration"),!0):(this.isQueueItemsVisible=!this.isQueueItemsVisible,Fs.enabled&&Fs("update - queue items toggled - isQueueItemsVisible = %s",JSON.stringify(this.isQueueItemsVisible)),this.isActionFavoritesVisible?(Fs("update - action favorites visible; imeediately closing action favorites, and delay opening queue items"),this.isActionFavoritesVisible=!1,this.toggleDisplayActionFavorites(),setTimeout((()=>{this.toggleDisplayPlayerBodyQueue()}),250)):(Fs("update - action favorites not visible; immediately opening queue items"),this.toggleDisplayPlayerBodyQueue()),!0);if(this.progressShow(),e==Rs)await this.mediaControlService.media_pause(this.player);else if(e==Os)await this.mediaControlService.media_play(this.player);else if(e==Ls)await this.mediaControlService.media_next_track(this.player);else if(e==Ms){const e=this.player?.attributes.media_position||0,t=this.player?.isPlaying(),i=this.player?.attributes.media_position_updated_at||0;let s=e;t&&(s=e+(Date.now()-new Date(i).getTime())/1e3),s>8?await this.mediaControlService.media_seek(this.player,0):await this.mediaControlService.media_previous_track(this.player)}else if(e==xs){let e=yi.OFF;this.player.attributes.repeat==yi.OFF?e=yi.ONE:this.player.attributes.repeat==yi.ONE?e=yi.ALL:this.player.attributes.repeat==yi.ALL&&(e=yi.OFF),await this.mediaControlService.repeat_set(this.player,e)}else e==Bs?await this.mediaControlService.shuffle_set(this.player,!this.player.attributes.shuffle):e==Us?await this.spotifyPlusService.turn_off(this.player):e==Hs&&await this.spotifyPlusService.turn_on(this.player);return this.progressHide(),!0}catch(e){return this.alertErrorSet("Control action failed: "+At(e)),this.progressHide(),!0}}hideFeature(e){if(e==Rs){if(this.player.supportsFeature(Rs)){if(this.player.state==Ci.PAUSED)return;return this.config.playerControlsHidePlayPause||V}}else if(e==Os){if(this.player.supportsFeature(Os)){if(this.player.state==Ci.PLAYING)return;return this.config.playerControlsHidePlayPause||V}}else if(e==Ls){if(this.player.supportsFeature(Ls))return this.config.playerControlsHideTrackNext||V}else if(e==Ms){if(this.player.supportsFeature(Ms))return this.config.playerControlsHideTrackPrev||V}else if(e==xs){if(this.player.supportsFeature(xs))return this.config.playerControlsHideRepeat||V}else if(e==Bs){if(this.player.supportsFeature(Bs))return this.config.playerControlsHideShuffle||V}else{if(e==Vs)return this.config.playerControlsHideFavorites||V;if(e==Ds)return this.config.playerControlsHidePlayQueue||V;if(e==Hs){if(this.player.supportsFeature(Hs))return![Ci.OFF,Ci.STANDBY].includes(this.player.state)||(!!this.config.playerVolumeControlsHidePower||V)}else if(e==Us){if(this.player.supportsFeature(Us))return![Ci.IDLE].includes(this.player.state)||(!!this.config.playerVolumeControlsHidePower||V)}else if(e==Ns&&this.config.playerMinimizeOnIdle&&this.config.sections?.includes(Qe.DEVICES))return V}return!0}alertInfoSet(e){const t=vt("#spcPlayer",this);t&&t.alertInfoSet(e)}alertErrorSet(e){const t=vt("#spcPlayer",this);t&&t.alertErrorSet(e)}getRepeatIcon(){return this.player.attributes.repeat==yi.ALL?"M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z":this.player.attributes.repeat==yi.ONE?"M13,15V9H12L10,10V11H11.5V15M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z":"M2,5.27L3.28,4L20,20.72L18.73,22L15.73,19H7V22L3,18L7,14V17H13.73L7,10.27V11H5V8.27L2,5.27M17,13H19V17.18L17,15.18V13M17,5V2L21,6L17,10V7H8.82L6.82,5H17Z"}getShuffleIcon(){return this.player.attributes.shuffle?"M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z":"M16,4.5V7H5V9H16V11.5L19.5,8M16,12.5V15H5V17H16V19.5L19.5,16"}styleContainer(e,t){const i={"margin-bottom":"0px"};return this.config.playerMinimizeOnIdle&&(e||t)&&(i.margin="0px",i.padding="2px"),Me(i)}styleIcon(e){const t={};return e&&(t.color=`var(--spc-player-controls-icon-toggle-color, ${Ae})`),Me(t)}}we([Ue({attribute:!1})],qs.prototype,"mediaContentId",void 0),we([Ve()],qs.prototype,"isActionFavoritesVisible",void 0),we([Ve()],qs.prototype,"isQueueItemsVisible",void 0),customElements.define("spc-player-controls",qs);const{TURN_OFF:Gs,TURN_ON:Js,VOLUME_MUTE:Ws,VOLUME_SET:Ys,VOLUME_STEP:zs}=bi,js=9e11,Ks=900000000001;class Zs extends oi{constructor(){super(...arguments),this.slim=!1}render(){this.config=this.store.config,this.spotifyPlusService=this.store.spotifyPlusService;const e=this.config.playerVolumeControlsHideMute||!1,t=this.config.playerVolumeControlsHideLevels||!1,i=this.player.isMuted()?"M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z":"M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",s=this.config.playerVolumeControlsShowPlusMinus&&!0,r=this.player.state==Ci.OFF,o=this.player.attributes.is_volume_muted,a=this.player.getVolume(),n=Math.round(Math.abs((a-0)/100*100));return H`
      <div class="volume-container icons" slim=${this.slim||V}>
        ${e?H``:H`
          <ha-icon-button
            hide=${this.hideFeature(Ws)}
            @click=${this.onMuteClick} 
            .path=${i} 
            label="Mute Toggle"
            style=${this.styleIcon(o)}></ha-icon-button>
          `}
        ${s?H`
          <ha-icon-button .path=${"M3,9H7L12,4V20L7,15H3V9M14,11H22V13H14V11Z"} @click=${()=>this.onClickAction(js)} hide=${this.hideFeature(zs)} label="Decrease"></ha-icon-button>
          `:H``}
        <div class="volume-slider" hide=${this.hideFeature(Ys)} style=${this.styleVolumeSlider()}>
          <ha-control-slider
            .value=${a}
            step=${1}
            min=${0}
            max=${100}
            @value-changed=${this.onVolumeValueChanged}
          ></ha-control-slider>
          ${t?H``:H`
            <div class="volume-level">
              <div class="volume-level-min">${0}%</div>
              <div class="volume-level-pct" style="flex: ${n}%;">${a}%</div>
              <div class="volume-level-max">${100}%</div>
            </div>
          `}
        </div>
        ${s?H`
          <ha-icon-button .path=${"M3,9H7L12,4V20L7,15H3V9M14,11H17V8H19V11H22V13H19V16H17V13H14V11Z"} @click=${()=>this.onClickAction(Ks)} hide=${this.hideFeature(zs)} label="Increase"></ha-icon-button>
          `:H``}
        <ha-icon-button .path=${jt} @click=${()=>this.onClickAction(Js)}  hide=${this.hideFeature(Js)}  label="Turn On"  style=${this.styleIcon(r)}></ha-icon-button>
        <ha-icon-button .path=${jt} @click=${()=>this.onClickAction(Gs)} hide=${this.hideFeature(Gs)} label="Turn Off"></ha-icon-button>
      </div>
    `}async onVolumeValueChanged(e){try{this.progressShow();let t=Number.parseInt(e?.target?.value);const i=this.config.playerVolumeMaxValue||100;if(t>i){t=i;const s=e?.target;s&&(s.value=t+""),this.alertInfoSet("Selected volume level was greater than Max Volume limit set in card configuration; max limit value of "+i+" was applied.")}return await this.spotifyPlusService.volume_set(this.player,t),!0}catch(e){return this.alertErrorSet("Volume set failed: "+At(e)),!0}finally{this.progressHide()}}async onMuteClick(){try{return this.progressShow(),await this.spotifyPlusService.volume_mute_toggle(this.player),!0}catch(e){return this.alertErrorSet("Volume mute failed: "+At(e)),!0}finally{this.progressHide()}}styleVolumeSlider(){if(this.config.playerVolumeControlsHideSlider||!1)return"display: none"}async onClickAction(e){try{return this.progressShow(),e==Gs?await this.spotifyPlusService.turn_off(this.player):e==Js?await this.spotifyPlusService.turn_on(this.player):e==js?await this.spotifyPlusService.volume_down(this.player):e==Ks&&await this.spotifyPlusService.volume_up(this.player),!0}catch(e){return this.alertErrorSet("Volume action failed: "+At(e)),!0}finally{this.progressHide()}}hideFeature(e){if(e==Js){if(this.player.supportsFeature(Js))return![Ci.OFF,Ci.UNKNOWN,Ci.STANDBY].includes(this.player.state)||(!!this.config.playerVolumeControlsHidePower||V)}else if(e==Gs){if(this.player.supportsFeature(Gs))return!![Ci.OFF,Ci.UNKNOWN,Ci.STANDBY].includes(this.player.state)||(!!this.config.playerVolumeControlsHidePower||V)}else if(e==Ws){if(this.player.supportsFeature(Ws))return V}else if(e==Ys){if(this.player.supportsFeature(Ys))return V}else if(e==zs&&this.player.supportsFeature(zs))return V;return!0}alertErrorSet(e){const t=vt("#spcPlayer",this);t&&t.alertErrorSet(e)}alertInfoSet(e){const t=vt("#spcPlayer",this);t&&t.alertInfoSet(e)}styleIcon(e){if(e)return`color: var(--spc-player-controls-icon-toggle-color, ${Ae})`}static get styles(){return a`
      ha-control-slider {
        --control-slider-color: var(--spc-player-volume-slider-color, var(--spc-player-controls-color, var(--dark-primary-color, ${o(Ae)})));
        --control-slider-thickness: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.10);
        box-sizing: border-box;
      }

      ha-control-slider[disabled] {
        --control-slider-color: var(--disabled-text-color);
        --control-slider-thickness: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.10);
        box-sizing: border-box;
      }

      .volume-container {
        flex: 1;
        /*border: 1px solid blue;  /*  FOR TESTING CONTROL LAYOUT CHANGES */
      }

      .volume-slider {
        flex: 1;
        padding-right: 0.0rem;
        align-content: flex-end;
        color: var(--spc-player-volume-label-color, var(--spc-player-controls-color, #ffffff));
      }

      .volume-level {
        font-size: x-small;
        display: flex;
      }

      .volume-level-min {
        flex: 0;
        text-align: left;
        margin-right: 4px;
      }

      .volume-level-pct {
        text-align: right;
        font-weight: normal;
        font-size: 10px;
        color: var(--spc-player-volume-slider-color, var(--spc-player-controls-color, var(--dark-primary-color, ${o(Ae)})));
      }

      .volume-level-max {
        flex: 100;
        text-align: right;
        margin-left: 4px;
      }

      *[slim] * {
        --control-slider-thickness: 10px;
        --mdc-icon-button-size: 30px;
        --mdc-icon-size: 20px;
      }

      *[slim] .volume-level {
        display: none;
      }

      *[slim] .volume-slider {
        display: flex;
        align-items: center;
      }

      .icons {
        justify-content: center;
        display: inline-flex;
        align-items: center;
        mix-blend-mode: normal;
        overflow: hidden;
        color: var(--spc-player-controls-icon-color, #ffffff);
        width: 100%;
        --mdc-icon-button-size: var(--spc-player-controls-icon-button-size, 2.75rem);
        --mdc-icon-size: var(--spc-player-controls-icon-size, ${o(fe)});
      }

      *[hide] {
        display: none;
      }
    `}}we([Ue({attribute:!1})],Zs.prototype,"player",void 0),we([Ue()],Zs.prototype,"slim",void 0),customElements.define("spc-player-volume",Zs);let Xs=class extends oi{render(){this.config=this.store.config,this.player=this.store.player;const e=this.player.isPoweredOffOrIdle();return H`
      <div class="player-section-container" style=${this.stylePlayerSection()}>
        <spc-player-header style=${this.stylePlayerHeader()}
          class="player-section-header"
          .store=${this.store}
        ></spc-player-header>
        <div class="player-section-body">
          <div class="player-alert-bgcolor">
            ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
            ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          </div>
          ${(()=>e&&this.config.playerMinimizeOnIdle&&"fill"!=this.config.height?H`<spc-player-body-idle class="player-section-body-content" style="display:block" .store=${this.store}></spc-player-body-idle>`:1==(this.config.playerControlsHideFavorites||!1)?H``:"track"==this.player.attributes.sp_item_type?H`<spc-player-body-track class="player-section-body-content" .store=${this.store} .mediaContentId=${this.mediaContentId}></spc-player-body-track>`:"podcast"==this.player.attributes.sp_item_type?H`<spc-player-body-show class="player-section-body-content" .store=${this.store} .mediaContentId=${this.mediaContentId}></spc-player-body-show>`:"audiobook"==this.player.attributes.sp_item_type?H`<spc-player-body-audiobook class="player-section-body-content" .store=${this.store} .mediaContentId=${this.mediaContentId}></spc-player-body-audiobook>`:H`<div class="player-section-body-content"></div>`)()}
          ${(()=>e&&this.config.playerMinimizeOnIdle&&"fill"!=this.config.height||1==(this.config.playerControlsHidePlayQueue||!1)?H``:"track"==this.player.attributes.sp_item_type||"podcast"==this.player.attributes.sp_item_type||"audiobook"==this.player.attributes.sp_item_type?H`<spc-player-body-queue class="player-section-body-queue" .store=${this.store} .mediaContentId=${this.mediaContentId} id="elmPlayerBodyQueue"></spc-player-body-queue>`:H`<div class="player-section-body-queue"></div>`)()}
        </div>
        <spc-player-controls style=${this.stylePlayerControls()}
          class="player-section-controls"
          .store=${this.store}
          .mediaContentId=${this.mediaContentId}
        ></spc-player-controls>
      </div>
    `}static get styles(){return a`

      .hoverable:focus,
      .hoverable:hover {
        color: var(--dark-primary-color);
      }

      .hoverable:active {
        color: var(--primary-color);
      }

      .player-section-container {
        display: grid;
        grid-template-columns: 100%;
        grid-template-rows: min-content auto min-content;
        grid-template-areas:
          'header'
          'body'
          'controls';
        align-items: center;
        background-position: center;
        background-repeat: no-repeat;
        background-size: var(--spc-player-background-size, var(--spc-player-background-size-default, 100% 100%));  /* PLAYER_BACKGROUND_IMAGE_SIZE_DEFAULT */
        text-align: -webkit-center;
        height: 100%;
        width: 100%;
      }

      .player-section-header {
        /* border: 1px solid red;      /* FOR TESTING CONTROL LAYOUT CHANGES */
        grid-area: header;
        background: linear-gradient(180deg, var(--spc-player-header-bg-color, ${o(ge)}) 30%, transparent 100%);
        background-repeat: no-repeat;
        padding: 0.2rem;
      }

      .player-section-body {
        /* border: 1px solid orange;   /* FOR TESTING CONTROL LAYOUT CHANGES */
        grid-area: body;
        height: 100%;
        overflow: hidden;
        padding: 0rem 0.5rem 0rem 0.5rem;
        box-sizing: border-box;
        background: transparent;
      }

      .player-section-body-content {
        /* border: 1px solid yellow;   /* FOR TESTING CONTROL LAYOUT CHANGES */
        height: inherit;
        background: transparent;
        overflow: hidden;
        display: none;              /* don't display initially */
        /* for fade-in, fade-out support */
        transition: opacity 0.25s, display 0.25s;
        transition-behavior: allow-discrete;    /* Note: be sure to write this after the shorthand */
      }

      .player-section-body-queue {
        /* border: 1px solid yellow;   /* FOR TESTING CONTROL LAYOUT CHANGES */
        height: inherit;
        background: transparent;
        overflow: hidden;
        display: none;              /* don't display initially */
        /* for fade-in, fade-out support */
        transition: opacity 0.25s, display 0.25s;
        transition-behavior: allow-discrete;    /* Note: be sure to write this after the shorthand */
      }

      .player-section-controls {
        /* border: 1px solid blue;     /* FOR TESTING CONTROL LAYOUT CHANGES */
        grid-area: controls;
        overflow-y: auto;
        background: linear-gradient(0deg, var(--spc-player-controls-bg-color, ${o(ge)}) 30%, transparent 100%);
        background-repeat: no-repeat;
      }

      /* have to set a background color for alerts due to parent background transparency. */
      .player-alert-bgcolor {
        background-color: rgba(var(--rgb-card-background-color), 0.92);
      }

    `}stylePlayerSection(){const e={},t=this.player.isPoweredOffOrUnknown(),i=this.player.isIdle();let s,r=!1;const o=this.config.customImageUrls?.default,a=this.config.customImageUrls?.playerBackground,n=this.config.customImageUrls?.playerIdleBackground,l=this.config.customImageUrls?.playerOffBackground;let d,c;this.store.player&&(d=this.store.player.attributes.media_content_id,c=this.store.player.attributes.entity_picture||this.store.player.attributes.entity_picture_local,c&&(c=this.store.hass.hassUrl(c))),this.config.playerBackgroundImageSize?e["--spc-player-background-size"]=`${this.config.playerBackgroundImageSize}`:"fill"==this.config.width&&(e["--spc-player-background-size-default"]="contain"),t?(this.store.card.playerMediaContentId="configImagePlayerBgOff","none"==(l||"").toLowerCase()?e["background-image"]=void 0:l?(e["background-image"]=`url(${l})`,s=l):this.config.playerMinimizeOnIdle?e["background-image"]="var(--spc-player-background-image-off)":(e["background-image"]=`var(--spc-player-background-image-off, url(${me}))`,e["--spc-player-background-size-default"]=`${pe}`,r=!0),this.config.playerBackgroundImageSize&&(e["--spc-player-background-size"]=`${this.config.playerBackgroundImageSize}`)):i?(this.store.card.playerMediaContentId="configImagePlayerBgIdle","none"==(n||"").toLowerCase()?e["background-image"]=void 0:n?(e["background-image"]=`url(${n})`,s=n):this.config.playerMinimizeOnIdle?e["background-image"]="var(--spc-player-background-image-off)":(e["background-image"]=`var(--spc-player-background-image-off, url(${me}))`,e["--spc-player-background-size-default"]=`${pe}`,r=!0),this.config.playerBackgroundImageSize&&(e["--spc-player-background-size"]=`${this.config.playerBackgroundImageSize}`)):a?(this.store.card.playerMediaContentId="configImagePlayerBg","none"==(a||"").toLowerCase()?e["background-image"]=void 0:a&&(e["background-image"]=`url(${a})`,s=a)):c?(this.store.card.playerMediaContentId=d,s=c,e["background-image"]=`var(--spc-player-background-image, url(${c}))`):o?(this.store.card.playerMediaContentId="configImageDefault",s=o,e["background-image"]=`url(${o}`):(this.store.card.playerMediaContentId="BRAND_LOGO_IMAGE_BASE64",this.config.playerMinimizeOnIdle?e["background-image"]="var(--spc-player-background-image-off)":(e["background-image"]=`var(--spc-player-background-image-off, url(${me}))`,e["--spc-player-background-size-default"]=`${pe}`,r=!0),this.config.playerBackgroundImageSize&&(e["--spc-player-background-size"]=`${this.config.playerBackgroundImageSize}`));let h=this.config.playerControlsBackgroundColor;const u=this.config.playerControlsColor,m=this.config.playerControlsIconSize||fe;let p=this.config.playerControlsIconColor;const v=this.config.playerControlsIconToggleColor;let g=this.config.playerHeaderBackgroundColor,f=this.config.playerHeaderTitle1Color;const A=this.config.playerHeaderTitle1FontSize;let y=this.config.playerHeaderTitle2Color;const b=this.config.playerHeaderTitle2FontSize;let C=this.config.playerHeaderTitle3Color;const S=this.config.playerHeaderTitle3FontSize,w=this.config.playerMinimizedTitleColor,I=this.config.playerMinimizedTitleFontSize,T=this.config.playerProgressSliderColor,k=this.config.playerProgressLabelColor,_=this.config.playerProgressLabelPaddingLR,E=this.config.playerVolumeSliderColor;let $=this.config.playerVolumeLabelColor;return r&&(h=h||"transparent",p=p||"var(--primary-text-color, PLAYER_CONTROLS_BACKGROUND_COLOR_DEFAULT)",g=g||"transparent",f=f||"var(--primary-text-color, PLAYER_CONTROLS_BACKGROUND_COLOR_DEFAULT)",y=y||"var(--primary-text-color, PLAYER_CONTROLS_BACKGROUND_COLOR_DEFAULT)",C=C||"var(--primary-text-color, PLAYER_CONTROLS_BACKGROUND_COLOR_DEFAULT)",$=$||"var(--primary-text-color, PLAYER_CONTROLS_BACKGROUND_COLOR_DEFAULT)"),this.store.card.playerImage=s,h&&(e["--spc-player-controls-bg-color"]=`${h} `),u&&(e["--spc-player-controls-color"]=`${u}`),v&&(e["--spc-player-controls-icon-toggle-color"]=`${v}`),p&&(e["--spc-player-controls-icon-color"]=`${p}`),m&&(e["--spc-player-controls-icon-size"]=`${m}`),e["--spc-player-controls-icon-button-size"]=`var(--spc-player-controls-icon-size, ${fe}) + 0.75rem`,g&&(e["--spc-player-header-bg-color"]=`${g}`),f&&(e["--spc-player-header-title1-color"]=`${f}`),A&&(e["--spc-player-header-title1-font-size"]=`${A}`),y&&(e["--spc-player-header-title2-color"]=`${y}`),b&&(e["--spc-player-header-title2-font-size"]=`${b}`),C&&(e["--spc-player-header-title3-color"]=`${C}`),S&&(e["--spc-player-header-title3-font-size"]=`${S}`),w&&(e["--spc-player-minimized-title-color"]=`${w}`),I&&(e["--spc-player-minimized-title-font-size"]=`${I}`),k&&(e["--spc-player-progress-label-color"]=`${k}`),_&&(e["--spc-player-progress-label-padding-lr"]=`${_}`),T&&(e["--spc-player-progress-slider-color"]=`${T}`),$&&(e["--spc-player-volume-label-color"]=`${$}`),E&&(e["--spc-player-volume-slider-color"]=`${E}`),Me(e)}stylePlayerHeader(){const e={};return this.config.playerHeaderHide&&(e.display="none"),this.config.playerMinimizeOnIdle&&this.store.player.isPoweredOffOrIdle()&&"fill"!=this.config.height&&(e.display="none"),Me(e)}stylePlayerControls(){const e={};return this.config.playerControlsHide&&(e.display="none"),this.config.playerMinimizeOnIdle&&this.store.player.isPoweredOffOrIdle()&&"fill"!=this.config.height&&(e["justify-items"]="flex-start"),Me(e)}};we([Ue({attribute:!1})],Xs.prototype,"mediaContentId",void 0),we([Ve()],Xs.prototype,"config",void 0),Xs=we([xe("spc-player")],Xs);let Qs=class extends Ki{constructor(){super(Qe.PLAYLIST_FAVORITES),this.filterCriteriaPlaceholder="filter by playlist name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.playlistFavBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.playlistFavBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.shuffleOnPlay=this.config.playlistFavBrowserShuffleOnPlay||!1,this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.playlistFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-playlist-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-playlist-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.config.playlistFavBrowserItemsLimit||this.LIMIT_TOTAL_MAX,r=this.config.playlistFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetPlaylistFavorites(e,0,0,s,r).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Playlist Followed failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Playlist followed refresh failed: "+At(e)),!0}}};var er;Qs=we([xe("spc-playlist-fav-browser")],Qs),function(e){e.AlbumCopyPresetToClipboard="AlbumCopyPresetToClipboard",e.AlbumCopyPresetJsonToClipboard="AlbumCopyPresetJsonToClipboard",e.AlbumCopyUriToClipboard="AlbumCopyUriToClipboard",e.AlbumFavoriteAdd="AlbumFavoriteAdd",e.AlbumFavoriteRemove="AlbumFavoriteRemove",e.AlbumFavoriteUpdate="AlbumFavoriteUpdate",e.AlbumPlayTrackFavorites="AlbumPlayTrackFavorites",e.AlbumSearchRadio="AlbumSearchRadio",e.AlbumShowTracks="AlbumShowTracks",e.AlbumUserPresetAdd="AlbumUserPresetAdd",e.ArtistCopyPresetToClipboard="ArtistCopyPresetToClipboard",e.ArtistCopyPresetJsonToClipboard="ArtistCopyPresetJsonToClipboard",e.ArtistCopyUriToClipboard="ArtistCopyUriToClipboard",e.ArtistFavoriteAdd="ArtistFavoriteAdd",e.ArtistFavoriteRemove="ArtistFavoriteRemove",e.ArtistFavoriteUpdate="ArtistFavoriteUpdate",e.ArtistPlayTrackFavorites="ArtistPlayTrackFavorites",e.ArtistSearchPlaylists="ArtistSearchPlaylists",e.ArtistSearchRadio="ArtistSearchRadio",e.ArtistSearchTracks="ArtistSearchTracks",e.ArtistShowAlbums="ArtistShowAlbums",e.ArtistShowAlbumsAppearsOn="ArtistShowAlbumsAppearsOn",e.ArtistShowAlbumsCompilation="ArtistShowAlbumsCompilation",e.ArtistShowAlbumsSingle="ArtistShowAlbumsSingle",e.ArtistShowRelatedArtists="ArtistShowRelatedArtists",e.ArtistShowTopTracks="ArtistShowTopTracks",e.ArtistUserPresetAdd="ArtistUserPresetAdd",e.TrackCopyPresetToClipboard="TrackCopyPresetToClipboard",e.TrackCopyPresetJsonToClipboard="TrackCopyPresetJsonToClipboard",e.TrackCopyUriToClipboard="TrackCopyUriToClipboard",e.TrackFavoriteAdd="TrackFavoriteAdd",e.TrackFavoriteRemove="TrackFavoriteRemove",e.TrackFavoriteUpdate="TrackFavoriteUpdate",e.TrackPlayQueueAdd="TrackPlayQueueAdd",e.TrackPlayTrackFavorites="TrackPlayTrackFavorites",e.TrackSearchPlaylists="TrackSearchPlaylists",e.TrackSearchRadio="TrackSearchRadio",e.TrackUserPresetAdd="TrackUserPresetAdd"}(er||(er={}));class tr extends ni{constructor(){super(Qe.TRACK_FAVORITES)}render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Artist &quot;${this.mediaItem.artists[0].name}&quot; to Favorites"
          @click=${()=>this.onClickAction(er.ArtistFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Artist &quot;${this.mediaItem.artists[0].name}&quot; from Favorites"
          @click=${()=>this.onClickAction(er.ArtistFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Dt}
          label="Add Album &quot;${this.mediaItem.album.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(er.AlbumFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Album &quot;${this.mediaItem.album.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(er.AlbumFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,r=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Dt}
          label="Add Track &quot;${this.mediaItem.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(er.TrackFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,o=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Vt}
          label="Remove Track &quot;${this.mediaItem.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(er.TrackFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,a=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Lt}
          .label="View Artist &quot;${this.mediaItem.artists[0].name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.artists[0].external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,n=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Rt}
          .label="View Album &quot;${this.mediaItem.album.name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.album.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,l=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${Gt}
          .label="View Track &quot;${this.mediaItem.name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,d=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackSearchPlaylists)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Search Playlists for Track</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Track Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackPlayQueueAdd)}>
          <ha-svg-icon slot="start" .path=${Wt}></ha-svg-icon>
          <div slot="headline">Add Track to Play Queue</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play All Track Favorites</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Track to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Track Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Track Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.TrackCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Track URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,c=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.AlbumPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play Favorite Tracks from this Album</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.AlbumShowTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Show Album Tracks</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.AlbumSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Album Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.AlbumUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Album to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.AlbumCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Album Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.AlbumCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Album Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.AlbumCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Album URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `,h=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistPlayTrackFavorites)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Play Favorite Tracks from this Artist</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistSearchPlaylists)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">Search Playlists for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistSearchTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Search Tracks for Artist</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistSearchRadio)} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Kt}></ha-svg-icon>
          <div slot="headline">Search for Artist Radio</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistShowTopTracks)} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">Show Artist Top Tracks</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistShowAlbums)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistShowAlbumsCompilation)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Compilations</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistShowAlbumsSingle)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums Singles</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistShowAlbumsAppearsOn)} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">Show Artist Albums AppearsOn</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistShowRelatedArtists)} hide=${this.hideSearchType(kt.ARTISTS)}>
          <ha-svg-icon slot="start" .path=${Lt}></ha-svg-icon>
          <div slot="headline">Show Related Artists</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Artist to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Artist Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(er.ArtistCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Artist URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H` 
      <div class="track-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.mediaItem.image_url});"></div>
          <div class="media-info-details">
            <div class="media-info-text-ms-c">
              ${l}
              ${this.mediaItem.name}
              ${this.isTrackFavorite?o:r}
              <span class="actions-dropdown-menu">
                ${d}
              </span>
            </div>
            <div class="media-info-text-ms">
              ${n}
              ${this.mediaItem.album.name}
              ${this.isAlbumFavorite?s:i}
              <span class="actions-dropdown-menu">
                ${c}
              </span>
            </div>
            <div class="media-info-text-ms">
              ${a}
              ${this.mediaItem.artists[0].name}
              ${this.isArtistFavorite?t:e}
              <span class="actions-dropdown-menu">
                ${h}
              </span>
            </div>
            <div class="grid track-info-grid">
              <div class="grid-action-info-hdr-s">Track #</div>
              <div class="grid-action-info-text-s">${this.mediaItem.track_number||"unknown"}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Duration</div>
              <div class="grid-action-info-text-s">${lt(this.mediaItem.duration_ms||0)}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Released</div>
              <div class="grid-action-info-text-s">${this.mediaItem.album.release_date}</div>

              <div class="grid-action-info-hdr-s">Disc #</div>
              <div class="grid-action-info-text-s">${this.mediaItem.disc_number||"unknown"}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Explicit</div>
              <div class="grid-action-info-text-s">${this.mediaItem.explicit||!1}</div>
              <div class="grid-action-info-text-s">&nbsp;</div>
              <div class="grid-action-info-hdr-s">Links</div>
              <div class="grid-action-info-text-s">
                <ha-icon-button
                  .path=${Lt}
                  label="View Artist &quot;${this.mediaItem.artists[0].name}&quot; info on Spotify.com"
                  @click=${()=>It(this.mediaItem.artists[0].external_urls.spotify||"")}
                  slot="media-info-icon-link-s"
                ></ha-icon-button>
                <ha-icon-button style="padding-left:10px;"
                  .path=${Rt}
                  label="View Album &quot;${this.mediaItem.album.name}&quot; info on Spotify.com"
                  @click=${()=>It(this.mediaItem.album.external_urls.spotify||"")}
                  slot="media-info-icon-link-s"
                ></ha-icon-button>
                <ha-icon-button style="padding-left:10px;"
                  .path=${Gt}
                  label="View Track &quot;${this.mediaItem.name}&quot; info on Spotify.com"
                  @click=${()=>It(this.mediaItem.external_urls.spotify||"")}
                  slot="media-info-icon-link-s"
                ></ha-icon-button>
              </div>

              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s colspan-r3-c2 copy2cb" @click=${ft}>${this.mediaItem.uri}</div>

            </div>
          </div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .track-info-grid {
        grid-template-columns: auto auto 30px auto auto 30px auto auto;
        justify-content: left;
      }

      .track-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      .colspan-r3-c2 {
        grid-row: 3 / 3;    /* grid row 3 */
        grid-column: 2 / 9; /* grid columns 2 thru 8 */
      }
    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{if(e==er.AlbumCopyPresetToClipboard)return it(Ei(this.mediaItem.album,this.mediaItem.album.artists[0].name)),this.alertInfoSet(be),!0;if(e==er.AlbumCopyPresetJsonToClipboard)return it($i(this.mediaItem.album,this.mediaItem.album.artists[0].name)),this.alertInfoSet(Ce),!0;if(e==er.AlbumCopyUriToClipboard)return it(this.mediaItem.album.uri),!0;if(e==er.AlbumSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.album.name+ve+this.mediaItem.artists[0].name)),!0;if(e==er.AlbumShowTracks)return this.dispatchEvent(ci(kt.ALBUM_TRACKS,this.mediaItem.album.name+"; "+this.mediaItem.artists[0].name,this.mediaItem.album.name,this.mediaItem.album.uri,null,this.mediaItem.album)),!0;if(e==er.ArtistCopyPresetToClipboard)return it(Ei(this.mediaItem.artists[0])),this.alertInfoSet(be),!0;if(e==er.ArtistCopyPresetJsonToClipboard)return it($i(this.mediaItem.artists[0])),this.alertInfoSet(Ce),!0;if(e==er.ArtistCopyUriToClipboard)return it(this.mediaItem.artists[0].uri),!0;if(e==er.ArtistSearchPlaylists)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.artists[0].name)),!0;if(e==er.ArtistSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.artists[0].name+ve)),!0;if(e==er.ArtistShowAlbums)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==er.ArtistShowAlbumsAppearsOn)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_APPEARSON,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==er.ArtistShowAlbumsCompilation)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_COMPILATION,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==er.ArtistShowAlbumsSingle)return this.dispatchEvent(ci(kt.ARTIST_ALBUMS_SINGLE,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==er.ArtistShowRelatedArtists)return this.dispatchEvent(ci(kt.ARTIST_RELATED_ARTISTS,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==er.ArtistShowTopTracks)return this.dispatchEvent(ci(kt.ARTIST_TOP_TRACKS,this.mediaItem.artists[0].name,this.mediaItem.artists[0].name,this.mediaItem.artists[0].uri)),!0;if(e==er.ArtistSearchTracks)return this.dispatchEvent(ci(kt.TRACKS,this.mediaItem.artists[0].name)),!0;if(e==er.TrackCopyPresetToClipboard)return it(Ei(this.mediaItem,this.mediaItem.artists[0].name)),this.alertInfoSet(be),!0;if(e==er.TrackCopyPresetJsonToClipboard)return it($i(this.mediaItem,this.mediaItem.artists[0].name)),this.alertInfoSet(Ce),!0;if(e==er.TrackCopyUriToClipboard)return it(this.mediaItem.uri),!0;if(e==er.TrackSearchPlaylists)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.name+" "+this.mediaItem.artists[0].name)),!0;if(e==er.TrackSearchRadio)return this.dispatchEvent(ci(kt.PLAYLISTS,this.mediaItem.name+ve+this.mediaItem.artists[0].name)),!0;if(this.progressShow(),e==er.AlbumUserPresetAdd)this.store.config.userPresets?.unshift(_i(this.mediaItem)),await Vi(this.store.config),this.progressHide();else if(e==er.AlbumFavoriteAdd)await this.spotifyPlusService.SaveAlbumFavorites(this.player,this.mediaItem.album.id),this.updateActions(this.player,[er.AlbumFavoriteUpdate]);else if(e==er.AlbumFavoriteRemove)await this.spotifyPlusService.RemoveAlbumFavorites(this.player,this.mediaItem.album.id),this.updateActions(this.player,[er.AlbumFavoriteUpdate]);else if(e==er.AlbumPlayTrackFavorites){const e=this.store.config.albumFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,999,null,this.mediaItem.album.uri),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else if(e==er.ArtistFavoriteAdd)await this.spotifyPlusService.FollowArtists(this.player,this.mediaItem.artists[0].id),this.updateActions(this.player,[er.ArtistFavoriteUpdate]);else if(e==er.ArtistFavoriteRemove)await this.spotifyPlusService.UnfollowArtists(this.player,this.mediaItem.artists[0].id),this.updateActions(this.player,[er.ArtistFavoriteUpdate]);else if(e==er.ArtistPlayTrackFavorites){const e=this.store.config.artistFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,999,this.mediaItem.artists[0].uri,null),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else if(e==er.ArtistUserPresetAdd)this.mediaItem.artists[0].image_url=this.mediaItem.album.image_url,this.store.config.userPresets?.unshift(_i(this.mediaItem.artists[0])),await Vi(this.store.config),this.progressHide();else if(e==er.TrackUserPresetAdd)this.store.config.userPresets?.unshift(_i(this.mediaItem)),await Vi(this.store.config),this.progressHide();else if(e==er.TrackFavoriteAdd)await this.spotifyPlusService.SaveTrackFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[er.TrackFavoriteUpdate]);else if(e==er.TrackFavoriteRemove)await this.spotifyPlusService.RemoveTrackFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[er.TrackFavoriteUpdate]);else if(e==er.TrackPlayQueueAdd)await this.spotifyPlusService.AddPlayerQueueItems(this.player,this.mediaItem.uri),this.progressHide();else if(e==er.TrackPlayTrackFavorites){const e=this.store.config.trackFavBrowserShuffleOnPlay;await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e,null,!1,this.store.config.trackFavBrowserItemsLimit||200),this.progressHide(),this.store.card.SetSection(Qe.PLAYER)}else this.progressHide();return!0}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(er.AlbumFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckAlbumFavorites(e,this.mediaItem.album.id).then((e=>{this.isAlbumFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isAlbumFavorite=void 0,this.alertErrorSet("Check Album Favorite failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(er.ArtistFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckArtistsFollowing(e,this.mediaItem.artists[0].id).then((e=>{this.isArtistFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isArtistFavorite=void 0,this.alertErrorSet("Check Artist Following failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(er.TrackFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{let s=this.mediaItem.id;this.mediaItem.is_linked_from&&(s=this.mediaItem.id+","+this.mediaItem.id_origin),this.spotifyPlusService.CheckTrackFavorites(e,s).then((e=>{const i=Object.keys(e);this.isTrackFavorite=e[i[0]],i.length>1&&(this.isTrackFavorite=e[i[0]]||e[i[1]]),t(!0)})).catch((e=>{this.isTrackFavorite=void 0,this.alertErrorSet("Check Track Favorites failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Track actions refresh failed: "+At(e)),!0}}}function ir(e){const t=new Array;if(e)for(const i of e.items||[])t.push(i.track);return t}we([Ue({attribute:!1})],tr.prototype,"mediaItem",void 0),we([Ve()],tr.prototype,"isAlbumFavorite",void 0),we([Ve()],tr.prototype,"isArtistFavorite",void 0),we([Ve()],tr.prototype,"isTrackFavorite",void 0),customElements.define("spc-track-actions",tr);const sr=Pe(de+":recent-browser");let rr=class extends Ki{constructor(){super(Qe.RECENTS),this.filterCriteriaPlaceholder="filter by name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.recentBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.recentBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.recentFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-track-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-track-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}onItemSelected(e){sr.enabled&&sr("onItemSelected - media item selected:\n%s",JSON.stringify(e.detail,null,2));try{if(this.progressShow(),!this.player.isUserProductPremium()&&!this.player.attributes.sp_user_has_web_player_credentials)throw new Error(Se);const t=e.detail,{uris:i}=Tt(this.mediaList||[],t);this.spotifyPlusService.PlayerMediaPlayTracks(this.player,i.join(","),null,null,null,!1),this.store.card.SetSection(Qe.PLAYER)}catch(e){this.alertErrorSet("Could not play media item.  "+At(e)),this.mediaBrowserContentElement.scrollTop=0}finally{this.progressHide()}}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.LIMIT_TOTAL_MAX;this.spotifyPlusService.GetPlayerRecentTracks(e,0,0,0,s).then((e=>{this.mediaList=ir(e),this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Player Recent Tracks failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Recently Played items refresh failed: "+At(e)),!0}}};var or;rr=we([xe("spc-recent-browser")],rr),function(e){e.ShowCopyPresetToClipboard="ShowCopyPresetToClipboard",e.ShowCopyPresetJsonToClipboard="ShowCopyPresetJsonToClipboard",e.ShowCopyUriToClipboard="ShowCopyUriToClipboard",e.ShowEpisodesUpdate="ShowEpisodesUpdate",e.ShowFavoriteAdd="ShowFavoriteAdd",e.ShowFavoriteRemove="ShowFavoriteRemove",e.ShowFavoriteUpdate="ShowFavoriteUpdate",e.ShowSearchEpisodes="ShowSearchEpisodes",e.ShowUserPresetAdd="ShowUserPresetAdd"}(or||(or={}));class ar extends ni{constructor(){super(Qe.SHOW_FAVORITES)}render(){super.render();const e=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Dt}
          label="Add Show &quot;${this.mediaItem.name}&quot; to Favorites"
          @click=${()=>this.onClickAction(or.ShowFavoriteAdd)}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,t=H`
      <div class="display-inline">
        <ha-icon-button 
          .path=${Vt}
          label="Remove Show &quot;${this.mediaItem.name}&quot; from Favorites"
          @click=${()=>this.onClickAction(or.ShowFavoriteRemove)}
          slot="icon-button-small-selected"
        ></ha-icon-button>
      </div>
     `,i=H`
      <div class="display-inline">
        <ha-icon-button
          .path=${zt}
          .label="View Show &quot;${this.mediaItem.name}&quot; info on Spotify.com"
          @click=${()=>It(this.mediaItem.external_urls.spotify||"")}
          slot="icon-button-small"
        ></ha-icon-button>
      </div>
     `,s=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(or.ShowSearchEpisodes)} hide=${this.hideSearchType(kt.EPISODES)}>
          <ha-svg-icon slot="start" .path=${Nt}></ha-svg-icon>
          <div slot="headline">Search for Show Episodes</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1"></ha-md-divider>
        <ha-md-menu-item @click=${()=>this.onClickAction(or.ShowUserPresetAdd)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Add Show to User Presets</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(or.ShowCopyPresetToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Show Preset Info to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(or.ShowCopyPresetJsonToClipboard)}>
          <ha-svg-icon slot="start" .path=${Mt}></ha-svg-icon>
          <div slot="headline">Copy Show Preset JSON to Clipboard</div>
        </ha-md-menu-item>
        <ha-md-menu-item @click=${()=>this.onClickAction(or.ShowCopyUriToClipboard)}>
          <ha-svg-icon slot="start" .path=${Bt}></ha-svg-icon>
          <div slot="headline">Copy Show URI to Clipboard</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H`
      <div class="show-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.mediaItem.image_url});"></div>
          <div class="media-info-details">
            <div class="media-info-text-ms-c">
              ${i}
              ${this.mediaItem.name}
              ${this.isShowFavorite?t:e}
              <span class="actions-dropdown-menu">
                ${s}
              </span>
            </div>
            <div class="grid show-info-grid">
              <div class="grid-action-info-hdr-s"># Episodes</div>
              <div class="grid-action-info-text-s">${this.mediaItem.total_episodes||"unknown"}</div>
              
              <div class="grid-action-info-hdr-s">Explicit?</div>
              <div class="grid-action-info-text-s">${this.mediaItem.explicit||!1}</div>
              
              <div class="grid-action-info-hdr-s">Publisher</div>
              <div class="grid-action-info-text-s">${this.mediaItem.publisher||"unknown"}</div>

              ${"copyrights"in this.mediaItem?H`
                <div class="grid-action-info-hdr-s">Copyright</div>
                <div class="grid-action-info-text-s">${Ti(this.mediaItem,"; ")}</div>
                `:""}

              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s copy2cb" @click=${ft}>${this.mediaItem.uri}</div>

            </div>
          </div>
        </div>
        <div class="grid-container-scrollable">
          <div class="media-info-text-s" .innerHTML="${ot(this.mediaItem.html_description)}"></div>
          <div class="grid episodes-grid">
            <div class="grid-header">&nbsp;</div>
            <div class="grid-header">Title</div>
            <div class="grid-header">Status</div>
            <div class="grid-header grid-header-last">Duration</div>
            ${this.showEpisodes?.items.map((e=>H`
              <ha-icon-button
                .path=${Yt}
                .label="Add episode &quot;${e.name}&quot; to Play Queue"
                @click=${()=>this.AddPlayerQueueItem(e)}
                slot="icon-button"
              >&nbsp;</ha-icon-button>
              <div class="grid-entry">${e.name}</div>
              <div class="grid-entry">${is(e.resume_point)}</div>
              <div class="grid-entry">${lt(e.duration_ms||0)}</div>
            `))}
          </div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .show-info-grid {
        grid-template-columns: auto auto;
        justify-content: left;
      }

      .show-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      /* style episodes container and grid */
      .episodes-grid {
        grid-template-columns: 40px auto auto auto;
        margin-top: 1.0rem;
      }

      /* style ha-icon-button controls in tracks grid: icon size, title text */
      .episodes-grid > ha-icon-button[slot="icon-button"] {
        --mdc-icon-button-size: 24px;
        --mdc-icon-size: 20px;
        vertical-align: top;
        padding: 0px;
      }

    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{return e==or.ShowCopyPresetToClipboard?(it(Ei(this.mediaItem,"Podcast")),this.alertInfoSet(be),!0):e==or.ShowCopyPresetJsonToClipboard?(it($i(this.mediaItem,"Podcast")),this.alertInfoSet(Ce),!0):e==or.ShowCopyUriToClipboard?(it(this.mediaItem.uri),!0):e==or.ShowSearchEpisodes?(this.dispatchEvent(ci(kt.SHOW_EPISODES,this.mediaItem.name,this.mediaItem.name,this.mediaItem.uri)),!0):(this.progressShow(),e==or.ShowUserPresetAdd?(this.store.config.userPresets?.unshift(_i(this.mediaItem)),await Vi(this.store.config),this.progressHide()):e==or.ShowFavoriteAdd?(await this.spotifyPlusService.SaveShowFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[or.ShowFavoriteUpdate])):e==or.ShowFavoriteRemove?(await this.spotifyPlusService.RemoveShowFavorites(this.player,this.mediaItem.id),this.updateActions(this.player,[or.ShowFavoriteUpdate])):this.progressHide(),!0)}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{const i=new Array;if(-1!=t.indexOf(or.ShowEpisodesUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.GetShowEpisodes(e,this.mediaItem.id,0,0,null,20).then((e=>{this.showEpisodes=e,t(!0)})).catch((e=>{this.showEpisodes=void 0,this.alertErrorSet("Get Show Episodes failed: "+At(e)),i(e)}))}));i.push(t)}if(-1!=t.indexOf(or.ShowFavoriteUpdate)||0==t.length){const t=new Promise(((t,i)=>{this.spotifyPlusService.CheckShowFavorites(e,this.mediaItem.id).then((e=>{this.isShowFavorite=e[Object.keys(e)[0]],t(!0)})).catch((e=>{this.isShowFavorite=void 0,this.alertErrorSet("Check Show Favorites failed: "+At(e)),i(e)}))}));i.push(t)}return this.progressShow(),Promise.allSettled(i).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),this.alertErrorSet("Show actions refresh failed: "+At(e)),!0}}}we([Ue({attribute:!1})],ar.prototype,"mediaItem",void 0),we([Ve()],ar.prototype,"showEpisodes",void 0),we([Ve()],ar.prototype,"isShowFavorite",void 0),customElements.define("spc-show-actions",ar);const nr=Pe(de+":search-media-browser"),lr="_searchmediatype",dr="_searcheventargs",cr="Search for ",hr=[kt.ALBUMS,kt.ARTISTS,kt.AUDIOBOOKS,kt.EPISODES,kt.PLAYLISTS,kt.SHOWS,kt.TRACKS];let ur=class extends Ki{constructor(){super(Qe.SEARCH_MEDIA),this.filterCriteriaPlaceholder="search by name"}render(){super.render();const e=wt(this.config.searchMediaBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList),t=wt(this.config.searchMediaBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList),i=this.searchMediaType;this.favBrowserItemsPerRow=this.config.searchMediaBrowserItemsPerRow||4,this.config.searchMediaBrowserUseDisplaySettings||(i==kt.ALBUMS?this.favBrowserItemsPerRow=this.config.albumFavBrowserItemsPerRow||4:i==kt.ARTISTS?this.favBrowserItemsPerRow=this.config.artistFavBrowserItemsPerRow||4:i==kt.AUDIOBOOKS?this.favBrowserItemsPerRow=this.config.audiobookFavBrowserItemsPerRow||4:i==kt.EPISODES?this.favBrowserItemsPerRow=this.config.episodeFavBrowserItemsPerRow||4:i==kt.PLAYLISTS?this.favBrowserItemsPerRow=this.config.playlistFavBrowserItemsPerRow||4:i==kt.SHOWS?this.favBrowserItemsPerRow=this.config.showFavBrowserItemsPerRow||4:i==kt.TRACKS?this.favBrowserItemsPerRow=this.config.trackFavBrowserItemsPerRow||4:i==kt.ALBUM_TRACKS?(this.favBrowserItemsPerRow=this.config.trackFavBrowserItemsPerRow||4,this.isFilterCriteriaReadOnly=!0):i==kt.ARTIST_ALBUMS||i==kt.ARTIST_ALBUMS_APPEARSON||i==kt.ARTIST_ALBUMS_COMPILATION||i==kt.ARTIST_ALBUMS_SINGLE?(this.favBrowserItemsPerRow=this.config.albumFavBrowserItemsPerRow||4,this.isFilterCriteriaReadOnly=!0):i==kt.ARTIST_RELATED_ARTISTS?(this.favBrowserItemsPerRow=this.config.artistFavBrowserItemsPerRow||4,this.isFilterCriteriaReadOnly=!0):i==kt.ARTIST_TOP_TRACKS?(this.favBrowserItemsPerRow=this.config.trackFavBrowserItemsPerRow||4,this.isFilterCriteriaReadOnly=!0):(i==kt.AUDIOBOOK_EPISODES||i==kt.SHOW_EPISODES)&&(this.favBrowserItemsPerRow=this.config.episodeFavBrowserItemsPerRow||4,this.isFilterCriteriaReadOnly=!0)),!this.isFilterCriteriaReadOnly&&this.config.searchMediaBrowserSearchTypes&&this.config.searchMediaBrowserSearchTypes.length>0&&(this.config.searchMediaBrowserSearchTypes?.includes(this.searchMediaType)||(this.searchMediaType=this.config.searchMediaBrowserSearchTypes[0],this.searchMediaTypeTitle=cr+this.searchMediaType,this.mediaList=void 0,this.mediaListLastUpdatedOn=0,this.scrollTopSaved=0));const s=(this.searchEventArgs?.uri||"").indexOf(":album:")>-1,r=(this.searchEventArgs?.uri||"").indexOf(":artist:")>-1,o=(this.searchEventArgs?.uri||"").indexOf(":show:")>-1&&"audiobook"==this.searchEventArgs?.subtype,a=(this.searchEventArgs?.uri||"").indexOf(":show:")>-1&&"podcast"==this.searchEventArgs?.subtype,n=s||r||o||a,l=H`
      <ha-md-button-menu id="searchMediaType" slot="selection-bar" positioning="popover" style="padding-right: 0.5rem;">
        <ha-assist-chip id="searchMediaTypeTitle" slot="trigger" .label=${this.searchMediaTypeTitle||cr+" ..."}>
          <ha-svg-icon slot="trailing-icon" .path=${"M7,10L12,15L17,10H7Z"}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item .value=${kt.ALBUMS} @click=${this.onSearchMediaTypeChanged} hide=${this.hideSearchType(kt.ALBUMS)}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">${kt.ALBUMS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.ARTISTS} @click=${this.onSearchMediaTypeChanged} hide=${this.hideSearchType(kt.ARTISTS)}>
          <ha-svg-icon slot="start" .path=${Lt}></ha-svg-icon>
          <div slot="headline">${kt.ARTISTS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.AUDIOBOOKS} @click=${this.onSearchMediaTypeChanged} hide=${this.hideSearchType(kt.AUDIOBOOKS)}>
          <ha-svg-icon slot="start" .path=${Ot}></ha-svg-icon>
          <div slot="headline">${kt.AUDIOBOOKS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.EPISODES} @click=${this.onSearchMediaTypeChanged} hide=${this.hideSearchType(kt.EPISODES)}>
          <ha-svg-icon slot="start" .path=${Nt}></ha-svg-icon>
          <div slot="headline">${kt.EPISODES}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.PLAYLISTS} @click=${this.onSearchMediaTypeChanged} hide=${this.hideSearchType(kt.PLAYLISTS)}>
          <ha-svg-icon slot="start" .path=${Yt}></ha-svg-icon>
          <div slot="headline">${kt.PLAYLISTS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.SHOWS} @click=${this.onSearchMediaTypeChanged} hide=${this.hideSearchType(kt.SHOWS)}>
          <ha-svg-icon slot="start" .path=${zt}></ha-svg-icon>
          <div slot="headline">${kt.SHOWS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.TRACKS} @click=${this.onSearchMediaTypeChanged} hide=${this.hideSearchType(kt.TRACKS)}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">${kt.TRACKS}</div>
        </ha-md-menu-item>
        <ha-md-divider role="separator" tabindex="-1" hide=${!n}></ha-md-divider>
        <ha-md-menu-item .value=${kt.ALBUM_TRACKS} @click=${this.onSearchMediaTypeChanged} hide=${!s}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">${kt.ALBUM_TRACKS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.ARTIST_TOP_TRACKS} @click=${this.onSearchMediaTypeChanged} hide=${!r}>
          <ha-svg-icon slot="start" .path=${Gt}></ha-svg-icon>
          <div slot="headline">${kt.ARTIST_TOP_TRACKS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.ARTIST_ALBUMS} @click=${this.onSearchMediaTypeChanged} hide=${!r}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">${kt.ARTIST_ALBUMS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.ARTIST_ALBUMS_COMPILATION} @click=${this.onSearchMediaTypeChanged} hide=${!r}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">${kt.ARTIST_ALBUMS_COMPILATION}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.ARTIST_ALBUMS_SINGLE} @click=${this.onSearchMediaTypeChanged} hide=${!r}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">${kt.ARTIST_ALBUMS_SINGLE}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.ARTIST_ALBUMS_APPEARSON} @click=${this.onSearchMediaTypeChanged} hide=${!r}>
          <ha-svg-icon slot="start" .path=${Rt}></ha-svg-icon>
          <div slot="headline">${kt.ARTIST_ALBUMS_APPEARSON}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.ARTIST_RELATED_ARTISTS} @click=${this.onSearchMediaTypeChanged} hide=${!r}>
          <ha-svg-icon slot="start" .path=${Lt}></ha-svg-icon>
          <div slot="headline">${kt.ARTIST_RELATED_ARTISTS}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.AUDIOBOOK_EPISODES} @click=${this.onSearchMediaTypeChanged} hide=${!o}>
          <ha-svg-icon slot="start" .path=${Nt}></ha-svg-icon>
          <div slot="headline">${kt.AUDIOBOOK_EPISODES}</div>
        </ha-md-menu-item>
        <ha-md-menu-item .value=${kt.SHOW_EPISODES} @click=${this.onSearchMediaTypeChanged} hide=${!a}>
          <ha-svg-icon slot="start" .path=${Nt}></ha-svg-icon>
          <div slot="headline">${kt.SHOW_EPISODES}</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return this.setScrollPosition(),H`

      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${e?H`<div class="media-browser-section-title">${e}</div>`:H``}
        ${t?H`<div class="media-browser-section-subtitle">${t}</div>`:H``}
        <div class="search-media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${l}
          ${this.isFilterCriteriaVisible?H`
            ${this.isFilterCriteriaReadOnly?H`${this.filterCriteriaReadOnlyHtml}`:H`${this.filterCriteriaHtml}`}
            `:H``}
          ${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?[kt.ALBUMS,kt.ARTIST_ALBUMS,kt.ARTIST_ALBUMS_APPEARSON,kt.ARTIST_ALBUMS_COMPILATION,kt.ARTIST_ALBUMS_SINGLE].indexOf(this.searchMediaType)>-1?H`<spc-album-actions class="search-media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-album-actions>`:[kt.ARTISTS,kt.ARTIST_RELATED_ARTISTS].indexOf(this.searchMediaType)>-1?H`<spc-artist-actions class="search-media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-artist-actions>`:this.searchMediaType==kt.AUDIOBOOKS?H`<spc-audiobook-actions class="search-media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-audiobook-actions>`:[kt.EPISODES,kt.AUDIOBOOK_EPISODES,kt.SHOW_EPISODES].indexOf(this.searchMediaType)>-1?H`<spc-episode-actions class="search-media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-episode-actions>`:[kt.PLAYLISTS].indexOf(this.searchMediaType)>-1?H`<spc-playlist-actions class="search-media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-playlist-actions>`:this.searchMediaType==kt.SHOWS?H`<spc-show-actions class="search-media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-show-actions>`:[kt.TRACKS,kt.ALBUM_TRACKS,kt.ARTIST_TOP_TRACKS].indexOf(this.searchMediaType)>-1?H`<spc-track-actions class="search-media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-track-actions>`:H``:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list class="media-browser-list"
                        .items=${this.mediaList}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        .searchMediaType=${this.searchMediaType}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                      ></spc-media-browser-list>`:H`<spc-media-browser-icons class="media-browser-list"
                        .items=${this.mediaList}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        .searchMediaType=${this.searchMediaType}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                      ></spc-media-browser-icons>`)()}
        </div>
      </div>
    `}static get styles(){return[qi,a`

      /* extra styles not defined in sharedStylesFavBrowser would go here. */

      .search-media-browser-controls {
        margin-top: 0.5rem;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
        margin-bottom: 0rem;
        white-space: nowrap;
        align-items: left;
        --ha-select-height: 2.5rem;           /* ha dropdown control height */
        --mdc-menu-item-height: 2.5rem;       /* mdc dropdown list item height */
        --mdc-icon-button-size: 2.5rem;       /* mdc icon button size */
        --md-menu-item-top-space: 0.5rem;     /* top spacing between items */
        --md-menu-item-bottom-space: 0.5rem;  /* bottom spacing between items */
        --md-menu-item-one-line-container-height: 2.0rem;  /* menu item height */
        display: inline-flex;
        flex-direction: row;
        justify-content: space-between;
      }

      .search-media-browser-actions {
        height: 100%;
      }

      /* <ha-md-button-menu> related styles */
      ha-assist-chip {
        --ha-assist-chip-container-shape: 10px;  /* 0px=square corner, 10px=rounded corner */
        --ha-assist-chip-container-color: var(--card-background-color);
      }

      .selection-bar {
        background: rgba(var(--rgb-primary-color), 0.1);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        box-sizing: border-box;
        font-size: 14px;
        --ha-assist-chip-container-color: var(--card-background-color);
      }

      .selection-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .selection-controls p {
        margin-left: 8px;
        margin-inline-start: 8px;
        margin-inline-end: initial;
      }

      .center-vertical {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .relative {
        position: relative;
      }

      *[hide="true"] {
        display: none;
      }

      *[hide="false"] {
        display: flex;
      }
    `]}onItemSelected(e){nr.enabled&&nr("onItemSelected - search media item selected:\n%s",JSON.stringify(e.detail,null,2));const t=e.detail;!this.config.searchMediaBrowserQueueSelection||"track"!=t.type&&"episode"!=t.type?this.PlayMediaItem(t):this.QueueMediaItem(t)}hideSearchType(e){return!!(this.config.searchMediaBrowserSearchTypes&&this.config.searchMediaBrowserSearchTypes.length>0)&&(!this.config.searchMediaBrowserSearchTypes?.includes(e)&&(!this.searchEventArgs||this.searchEventArgs?.searchCriteria!=e))}searchExecute(e){nr.enabled&&nr("searchExecute - searching Spotify media:\n%s",JSON.stringify(e,null,2)),this.initSearchValues(e.searchType),this.filterCriteria=e.searchCriteria,this.searchMediaType=e.searchType,hr.includes(e.searchType)?this.searchEventArgs=null:this.searchEventArgs=e,this.updateMediaList(this.player)}storageValuesLoad(){super.storageValuesLoad();let e=kt.PLAYLISTS;this.isFilterCriteriaReadOnly||this.config.searchMediaBrowserSearchTypes&&this.config.searchMediaBrowserSearchTypes.length>0&&(this.config.searchMediaBrowserSearchTypes.includes(e)||(e=this.config?.searchMediaBrowserSearchTypes[0]||"")),this.searchMediaType=Gi.getStorageValue(this.cacheKeyBase+this.mediaType+lr,e),this.searchEventArgs=Gi.getStorageValue(this.cacheKeyBase+this.mediaType+dr,e),this.searchMediaTypeTitle=cr+this.searchMediaType,nr.enabled&&nr("storageValuesLoad - parameters loaded from cache: searchMediaType, searchEventArgs")}storageValuesSave(){super.storageValuesSave(),Gi.setStorageValue(this.cacheKeyBase+this.mediaType+lr,this.searchMediaType),Gi.setStorageValue(this.cacheKeyBase+this.mediaType+dr,this.searchEventArgs),nr.enabled&&nr("storageValuesSave - parameters saved to cache: searchMediaType, searchEventArgs")}onSearchMediaTypeChanged(e){this.initSearchValues(e.currentTarget.value);const t=e.currentTarget.value;nr.enabled&&nr("onSearchMediaTypeChanged - selected value = %s ",JSON.stringify(t)),hr.includes(t)?this.searchEventArgs=null:this.searchEventArgs?(this.searchEventArgs.searchType=t,this.updateMediaList(this.player)):nr("%conSearchMediaTypeChanged - searchEventArgs not set; event ignored!","color:red")}initSearchValues(e){this.searchMediaType!=e&&(nr.enabled&&nr("initSearchValues - preparing to search for type: %s",JSON.stringify(e)),this.searchMediaType=e,this.searchMediaTypeTitle=cr+this.searchMediaType,this.mediaList=void 0,this.mediaListLastUpdatedOn=0,this.scrollTopSaved=0,this.alertClear(),this.isActionsVisible&&(this.isActionsVisible=!1))}updateMediaList(e){if(!this.searchMediaType)return this.alertErrorSet("Please select the type of content to search for"),this.searchMediaTypeElement.focus(),!1;if(!this.isFilterCriteriaReadOnly&&!this.filterCriteria)return this.alertErrorSet("Please enter criteria to search for"),this.filterCriteriaElement.focus(),!1;if(!super.updateMediaList(e))return!1;try{const t=new Array;if(nr.enabled&&nr("%cupdateMediaList\n- mediaType = %s\n- searchMediaType = %s\n- searchEventArgs = %s","color:green",JSON.stringify(this.mediaType),JSON.stringify(this.searchMediaType),JSON.stringify(this.searchEventArgs,null,2)),hr.includes(this.searchMediaType)){const i=new Promise(((t,i)=>{this.alertInfo="Searching Spotify "+this.searchMediaType+' catalog for "'+this.filterCriteria+'" ...';const s=this.config.searchMediaBrowserSearchLimit||50;this.spotifyPlusService.Search(this.searchMediaType,e,this.filterCriteria||"",0,0,null,null,s).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.ALBUM_TRACKS){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserSearchLimit||50;this.spotifyPlusService.GetAlbumTracks(e,s,0,0,null,r).then((e=>{nr.enabled&&nr("%cupdateMediaList - Appending album to SearchMediaTypes.ALBUM_TRACKS items.\n- Album parentMediaItem:\n%s","color.red",JSON.stringify(this.searchEventArgs?.parentMediaItem,null,2)),e.items.forEach((e=>{const t=e;t.album=this.searchEventArgs?.parentMediaItem,t.album&&(t.image_url=t.album.image_url)})),this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.ARTIST_ALBUMS){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserSearchLimit||50,o=this.config.artistFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetArtistAlbums(e,s,"album",0,0,null,r,o).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.ARTIST_ALBUMS_APPEARSON){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserSearchLimit||50,o=this.config.artistFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetArtistAlbums(e,s,"appears_on",0,0,null,r,o).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.ARTIST_ALBUMS_COMPILATION){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserSearchLimit||50,o=this.config.artistFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetArtistAlbums(e,s,"compilation",0,0,null,r,o).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.ARTIST_ALBUMS_SINGLE){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserSearchLimit||50,o=this.config.artistFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetArtistAlbums(e,s,"single",0,0,null,r,o).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.ARTIST_RELATED_ARTISTS){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserItemsSortTitle||!1;this.spotifyPlusService.GetArtistRelatedArtists(e,s,r).then((e=>{this.mediaList=e,this.mediaListLastUpdatedOn=at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.ARTIST_TOP_TRACKS){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserItemsSortTitle||!1;this.spotifyPlusService.GetArtistTopTracks(e,s,null,r).then((e=>{this.mediaList=e,this.mediaListLastUpdatedOn=at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else if(this.searchMediaType==kt.SHOW_EPISODES){const i=new Promise(((t,i)=>{this.alertInfo="Searching "+this.searchMediaType+' for "'+this.searchEventArgs?.title+'" ...';const s=Ii(this.searchEventArgs?.uri),r=this.config.searchMediaBrowserSearchLimit||50;this.spotifyPlusService.GetShowEpisodes(e,s,0,0,null,r).then((e=>{this.mediaList=e.items,this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),this.alertInfo?.startsWith("Searching ")&&this.alertInfoClear(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),i(e)}))}));t.push(i)}else this.isUpdateInProgress=!1,console.log("%cSpotifyPlus Card: updateMediaList - searchMediaType was not processed:\n- mediaType = %s\n- searchMediaType = %s\n- searchEventArgs = %s","color:red",JSON.stringify(this.mediaType),JSON.stringify(this.searchMediaType),JSON.stringify(this.searchEventArgs,null,2));return this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Spotify "+this.searchMediaType+" search failed: "+At(e)),!0}}};we([Ve()],ur.prototype,"searchMediaType",void 0),we([Ve()],ur.prototype,"searchMediaTypeTitle",void 0),we([Ve()],ur.prototype,"searchEventArgs",void 0),we([Ne("#searchMediaType",!1)],ur.prototype,"searchMediaTypeElement",void 0),ur=we([xe("spc-search-media-browser")],ur);let mr=class extends Ki{constructor(){super(Qe.SHOW_FAVORITES),this.filterCriteriaPlaceholder="filter by show name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.showFavBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.showFavBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.showFavBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-show-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-show-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons class="media-browser-list"
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.config.showFavBrowserItemsLimit||this.LIMIT_TOTAL_MAX,r=this.config.showFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetShowFavorites(e,0,0,s,r,!0).then((e=>{this.mediaList=function(e){const t=new Array;if(e)for(const i of e.items||[])t.push(i.show);return t}(e),this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Show Favorites failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Show favorites refresh failed: "+At(e)),!0}}};mr=we([xe("spc-show-fav-browser")],mr);const pr=Pe(de+":track-fav-browser");let vr=class extends Ki{constructor(){super(Qe.TRACK_FAVORITES),this.filterCriteriaPlaceholder="filter by track name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name.toLocaleLowerCase().indexOf(t)||-1!==e.artists[0].name.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.trackFavBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.trackFavBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.shuffleOnPlay=this.config.trackFavBrowserShuffleOnPlay||!1,this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.trackFavBrowserItemsPerRow||4,pr.enabled&&pr("render - loaded favBrowserItemsPerRow, value = %s",JSON.stringify(this.favBrowserItemsPerRow))),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-track-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-track-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}onItemSelected(e){pr.enabled&&pr("onItemSelected - media item selected:\n%s",JSON.stringify(e.detail,null,2));try{if(this.progressShow(),!this.player.isUserProductPremium()&&!this.player.attributes.sp_user_has_web_player_credentials)throw new Error(Se);const t=e.detail,{uris:i}=Tt(this.mediaList||[],t);this.spotifyPlusService.PlayerMediaPlayTracks(this.player,i.join(","),null,null,null,!1),this.store.card.SetSection(Qe.PLAYER)}catch(e){this.alertErrorSet("Could not play media item.  "+At(e)),this.mediaBrowserContentElement.scrollTop=0}finally{this.progressHide()}}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{const t=new Array,i=new Promise(((t,i)=>{const s=this.config.trackFavBrowserItemsLimit||this.LIMIT_TOTAL_MAX,r=this.config.trackFavBrowserItemsSortTitle||!1;this.spotifyPlusService.GetTrackFavorites(e,0,0,null,s,r).then((e=>{this.mediaList=ir(e),this.mediaListLastUpdatedOn=e.date_last_refreshed||at(),super.updatedMediaListOk(),t(!0)})).catch((e=>{this.mediaList=void 0,this.mediaListLastUpdatedOn=0,super.updatedMediaListError("Get Track Favorites failed: "+At(e)),i(e)}))}));return t.push(i),this.progressShow(),Promise.allSettled(t).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("Track favorites refresh failed: "+At(e)),!0}}};var gr;vr=we([xe("spc-track-fav-browser")],vr),function(e){e.UserPresetRemove="UserPresetRemove"}(gr||(gr={}));class fr extends ni{constructor(){super(Qe.USERPRESETS)}render(){super.render();const e=H`
      <ha-md-button-menu slot="selection-bar" positioning="popover">
        <ha-assist-chip slot="trigger">
          <ha-svg-icon slot="icon" .path=${Ht}></ha-svg-icon>
        </ha-assist-chip>
        <ha-md-menu-item @click=${()=>this.onClickAction(gr.UserPresetRemove)}>
          <ha-svg-icon slot="start" .path=${"M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M9,8H11V17H9V8M13,8H15V17H13V8Z"}></ha-svg-icon>
          <div slot="headline">Remove User Preset Item</div>
        </ha-md-menu-item>
      </ha-md-button-menu>
      `;return H` 
      <div class="userpreset-actions-container">
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="media-info-content">
          <div class="img" style="background:url(${this.mediaItem.image_url});"></div>
          <div class="media-info-details">
            <div class="grid userpreset-info-grid">
              <div class="grid-action-info-hdr-s">Name</div>
              <div class="grid-action-info-text-s">${this.mediaItem.name}</div>

              <div class="grid-action-info-hdr-s">Sub-Title</div>
              <div class="grid-action-info-text-s">${this.mediaItem.subtitle}</div>

              <div class="grid-action-info-hdr-s">Type</div>
              <div class="grid-action-info-text-s">${this.mediaItem.type}</div>

              <div class="grid-action-info-hdr-s">URI</div>
              <div class="grid-action-info-text-s">${this.mediaItem.uri}</div>

              <div class="grid-action-info-hdr-s">Origin</div>
              <div class="grid-action-info-text-s">${this.mediaItem.origin}</div>

            </div>
            <div class="media-info-text-ms-c pad-top">
              <span class="actions-dropdown-menu">
                ${e}
              </span>
            </div>
          </div>
        </div>
      </div>`}static get styles(){return[ei,ti,ii,a`

      .userpreset-info-grid {
        grid-template-columns: auto auto;
        justify-content: left;
      }

      .userpreset-actions-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;  
      }

      .pad-top {
        padding-top: 0.50rem;
      }
    `]}async onClickAction(e){if(this.isCardInEditPreview)return!0;try{if(this.progressShow(),e==gr.UserPresetRemove){if("card config"!=this.mediaItem.origin)return this.progressHide(),this.alertInfoSet("JSON File preset items must be removed via a file editor, since they may affect other card configurations."),!0;const e=this.store.config.userPresets||[];for(let t=e.length-1;t>=0;t--)if(e[t].name==this.mediaItem.name&&e[t].subtitle==this.mediaItem.subtitle&&(e[t].image_url||"")==(this.mediaItem.image_url||"")){e.splice(t,1);break}this.store.config.userPresets=e,await Vi(this.store.config),this.progressHide(),Bi.selectedConfigArea=et.USERPRESET_BROWSER,this.alertInfoSet('User Preset was removed: "'+this.mediaItem.name+'".')}else this.progressHide();return!0}catch(e){return this.progressHide(),this.alertErrorSet("Action failed: "+At(e)),!0}}updateActions(e,t){if(!super.updateActions(e,t))return!1;try{return!0}catch(e){return this.progressHide(),this.alertErrorSet("UserPreset actions refresh failed: "+At(e)),!0}}}we([Ue({attribute:!1})],fr.prototype,"mediaItem",void 0),customElements.define("spc-userpreset-actions",fr);const Ar=ne+"-card-category-display";class yr{constructor(e=null,t=null,i=null){this.filterCriteria=e||"",this.title=t||"",this.uri=i||""}}const br=ne+"-card-filter-section-media";class Cr{constructor(e,t=null){this.section=e||"",this.filterCriteria=t||""}}const Sr=Pe(de+":userpreset-browser");let wr=class extends Ki{constructor(){super(Qe.USERPRESETS),this.filterCriteriaPlaceholder="filter by preset name"}render(){let e;if(super.render(),!this.isActionsVisible){const t=(this.filterCriteria||"").toLocaleLowerCase();e=this.mediaList?.filter((e=>-1!==e.name?.toLocaleLowerCase().indexOf(t)||-1!==e.subtitle?.toLocaleLowerCase().indexOf(t))),this.filterItemCount=e?.length}const t=wt(this.config.userPresetBrowserTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e),i=wt(this.config.userPresetBrowserSubTitle,this.config,this.player,this.mediaListLastUpdatedOn,this.mediaList,e);return this.favBrowserItemsPerRow||(this.favBrowserItemsPerRow=this.config.userPresetBrowserItemsPerRow||4),H`
      <div class="media-browser-section" style=${this.styleMediaBrowser()}>
        ${t?H`<div class="media-browser-section-title">${t}</div>`:H``}
        ${i?H`<div class="media-browser-section-subtitle">${i}</div>`:H``}
        <div class="media-browser-controls">
          ${this.isActionsVisible?H`${this.btnHideActionsHtml}`:H``}
          ${this.filterCriteriaHtml}${this.formatMediaListHtml}${this.refreshMediaListHtml}
        </div>
        <div id="mediaBrowserContentElement" class="media-browser-content">
          ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
          ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
          ${(()=>this.isActionsVisible?H`<spc-userpreset-actions class="media-browser-actions" .store=${this.store} .mediaItem=${this.mediaItem}></spc-userpreset-actions>`:1===this.favBrowserItemsPerRow?H`<spc-media-browser-list 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-list>`:H`<spc-media-browser-icons 
                        class="media-browser-list"
                        .items=${e}
                        .itemsPerRow=${this.favBrowserItemsPerRow}
                        .store=${this.store}
                        @item-selected=${this.onItemSelected}
                        @item-selected-with-hold=${this.onItemSelectedWithHold}
                       ></spc-media-browser-icons>`)()}  
        </div>
      </div>
    `}onItemSelected(e){if(Sr.enabled&&Sr("onItemSelected - media item selected:\n%s",JSON.stringify(e.detail,null,2)),"recommendations"==e.detail.type){const t=e.detail;this.PlayTrackRecommendations(t)}else if("filtersection"==e.detail.type){const t=e.detail;if(!Object.values(Qe).includes(t.filter_section||""))return void this.alertErrorSet('Preset filter_section "'+t.filter_section+'" is not a valid section identifier.');this.dispatchEvent(function(e,t){const i=new Cr(e);return i.filterCriteria=(t||"").trim(),new CustomEvent(br,{bubbles:!0,composed:!0,detail:i})}(t.filter_section,t.filter_criteria))}else if("category"==e.detail.type){const t=e.detail;this.dispatchEvent(function(e,t=null,i=null){const s=new yr;return s.filterCriteria=(e||"").trim(),s.title=t||"",s.uri=i||"",new CustomEvent(Ar,{bubbles:!0,composed:!0,detail:s})}(t.subtitle,t.name,t.uri))}else if("trackfavorites"==e.detail.type){const t=e.detail;this.PlayTrackFavorites(t)}else super.onItemSelected(e)}onItemSelectedWithHold(e){""==(e.detail.uri||"")&&(e.detail.uri="unknown"),super.onItemSelectedWithHold(e)}async PlayTrackRecommendations(e){try{if(!this.player.isUserProductPremium()&&!this.player.attributes.sp_user_has_web_player_credentials)throw new Error(Se);this.progressShow(),this.alertInfo="Searching for track recommendations ...",this.requestUpdate();const t=50,i=await this.spotifyPlusService.GetTrackRecommendations(this.player,e.recommendations,t,null),s=new Array;if(i.tracks.forEach((e=>{s.push(e.uri)})),0==s.length)return void(this.alertInfo="No recommended tracks were found for the preset criteria; adjust the preset criteria settings and try again.");this.alertInfo="Playing recommended tracks ...",this.requestUpdate(),this.spotifyPlusService.PlayerMediaPlayTracks(this.player,s.join(","),null,null,null,!1),this.store.card.SetSection(Qe.PLAYER)}catch(e){this.alertErrorSet("Could not get track recommendations for user preset.  "+At(e)),this.mediaBrowserContentElement.scrollTop=0}finally{this.progressHide()}}async PlayTrackFavorites(e){try{if(!this.player.isUserProductPremium()&&!this.player.attributes.sp_user_has_web_player_credentials)throw new Error(Se);this.progressShow(),this.alertInfo="Playing track favorites ...",this.requestUpdate(),await this.spotifyPlusService.PlayerMediaPlayTrackFavorites(this.player,null,e.shuffle,null,!0,this.config.trackFavBrowserItemsLimit||200),this.store.card.SetSection(Qe.PLAYER)}catch(e){this.alertErrorSet("Could not play track favorites for user preset.  "+At(e)),this.mediaBrowserContentElement.scrollTop=0}finally{this.progressHide()}}updateMediaList(e){if(!super.updateMediaList(e))return!1;try{this.mediaListLastUpdatedOn=at(),this.mediaList=new Array;const e=new Array,t=new Promise(((e,t)=>{try{const t=JSON.parse(JSON.stringify(this.config.userPresets||[]));if(t){const e="nocache="+at();t.forEach((t=>{t.origin="card config",t.image_url=(t.image_url||"").replace("{nocache}",e)})),(this.mediaList||[]).push(...t)}e(!0)}catch(e){super.updatedMediaListError("Load User Presets from config failed: "+At(e)),t(e)}}));if(e.push(t),this.config.userPresetsFile){const t=new Promise(((e,t)=>{fetch(this.config.userPresetsFile+"?nocache="+Date.now()).then((e=>{if(!e.ok)throw new Error("server response: "+e.status+" "+e.statusText);return e.json()})).then((t=>{const i=t;if(i){const e="nocache="+at();i.forEach((t=>{t.origin=this.config.userPresetsFile,t.image_url=(t.image_url||"").replace("{nocache}",e)})),(this.mediaList||[]).push(...i)}e(!0)})).catch((e=>{super.updatedMediaListError("Could not fetch data from configuration `userPresetsFile` ("+this.config.userPresetsFile+"); "+At(e)),t(e)}))}));e.push(t)}return this.progressShow(),Promise.allSettled(e).then((e=>{})).finally((()=>{this.progressHide()})),!0}catch(e){return this.progressHide(),super.updatedMediaListError("User Presets favorites refresh failed: "+At(e)),!0}}};wr=we([xe("spc-userpreset-browser")],wr);let Ir=class extends re{render(){return H`
      <ha-icon-button
        .path=${"M10,16.5V7.5L16,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"}
        label="Player"
        @click=${()=>this.onSectionClick(Qe.PLAYER)}
        selected=${this.getSectionSelected(Qe.PLAYER)}
        hide=${this.getSectionEnabled(Qe.PLAYER)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Zt}
        label="Devices"
        @click=${()=>this.onSectionClick(Qe.DEVICES)}
        selected=${this.getSectionSelected(Qe.DEVICES)}
        hide=${this.getSectionEnabled(Qe.DEVICES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Mt}
        label="User Presets"
        @click=${()=>this.onSectionClick(Qe.USERPRESETS)}
        selected=${this.getSectionSelected(Qe.USERPRESETS)}
        hide=${this.getSectionEnabled(Qe.USERPRESETS)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${"M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"}
        label="Recently Played"
        @click=${()=>this.onSectionClick(Qe.RECENTS)}
        selected=${this.getSectionSelected(Qe.RECENTS)}
        hide=${this.getSectionEnabled(Qe.RECENTS)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${"M8.11,19.45C5.94,18.65 4.22,16.78 3.71,14.35L2.05,6.54C1.81,5.46 2.5,4.4 3.58,4.17L13.35,2.1L13.38,2.09C14.45,1.88 15.5,2.57 15.72,3.63L16.07,5.3L20.42,6.23H20.45C21.5,6.47 22.18,7.53 21.96,8.59L20.3,16.41C19.5,20.18 15.78,22.6 12,21.79C10.42,21.46 9.08,20.61 8.11,19.45V19.45M20,8.18L10.23,6.1L8.57,13.92V13.95C8,16.63 9.73,19.27 12.42,19.84C15.11,20.41 17.77,18.69 18.34,16L20,8.18M16,16.5C15.37,17.57 14.11,18.16 12.83,17.89C11.56,17.62 10.65,16.57 10.5,15.34L16,16.5M8.47,5.17L4,6.13L5.66,13.94L5.67,13.97C5.82,14.68 6.12,15.32 6.53,15.87C6.43,15.1 6.45,14.3 6.62,13.5L7.05,11.5C6.6,11.42 6.21,11.17 6,10.81C6.06,10.2 6.56,9.66 7.25,9.5C7.33,9.5 7.4,9.5 7.5,9.5L8.28,5.69C8.32,5.5 8.38,5.33 8.47,5.17M15.03,12.23C15.35,11.7 16.03,11.42 16.72,11.57C17.41,11.71 17.91,12.24 18,12.86C17.67,13.38 17,13.66 16.3,13.5C15.61,13.37 15.11,12.84 15.03,12.23M10.15,11.19C10.47,10.66 11.14,10.38 11.83,10.53C12.5,10.67 13.03,11.21 13.11,11.82C12.78,12.34 12.11,12.63 11.42,12.5C10.73,12.33 10.23,11.8 10.15,11.19M11.97,4.43L13.93,4.85L13.77,4.05L11.97,4.43Z"}
        label='Categories'
        @click=${()=>this.onSectionClick(Qe.CATEGORYS)}
        selected=${this.getSectionSelected(Qe.CATEGORYS)}
        hide=${this.getSectionEnabled(Qe.CATEGORYS)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Yt}
        label='Playlist Favorites'
        @click=${()=>this.onSectionClick(Qe.PLAYLIST_FAVORITES)}
        selected=${this.getSectionSelected(Qe.PLAYLIST_FAVORITES)}
        hide=${this.getSectionEnabled(Qe.PLAYLIST_FAVORITES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Rt}
        label='Album Favorites'
        @click=${()=>this.onSectionClick(Qe.ALBUM_FAVORITES)}
        selected=${this.getSectionSelected(Qe.ALBUM_FAVORITES)}
        hide=${this.getSectionEnabled(Qe.ALBUM_FAVORITES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Lt}
        label='Artist Favorites'
        @click=${()=>this.onSectionClick(Qe.ARTIST_FAVORITES)}
        selected=${this.getSectionSelected(Qe.ARTIST_FAVORITES)}
        hide=${this.getSectionEnabled(Qe.ARTIST_FAVORITES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Gt}
        label='Track Favorites'
        @click=${()=>this.onSectionClick(Qe.TRACK_FAVORITES)}
        selected=${this.getSectionSelected(Qe.TRACK_FAVORITES)}
        hide=${this.getSectionEnabled(Qe.TRACK_FAVORITES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Ot}
        label='Audiobook Favorites'
        @click=${()=>this.onSectionClick(Qe.AUDIOBOOK_FAVORITES)}
        selected=${this.getSectionSelected(Qe.AUDIOBOOK_FAVORITES)}
        hide=${this.getSectionEnabled(Qe.AUDIOBOOK_FAVORITES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${zt}
        label='Show Favorites'
        @click=${()=>this.onSectionClick(Qe.SHOW_FAVORITES)}
        selected=${this.getSectionSelected(Qe.SHOW_FAVORITES)}
        hide=${this.getSectionEnabled(Qe.SHOW_FAVORITES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${Nt}
        label='Episode Favorites'
        @click=${()=>this.onSectionClick(Qe.EPISODE_FAVORITES)}
        selected=${this.getSectionSelected(Qe.EPISODE_FAVORITES)}
        hide=${this.getSectionEnabled(Qe.EPISODE_FAVORITES)}
      ></ha-icon-button>
      <ha-icon-button
        .path=${"M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,4.5L8.95,4.53C8.71,5.05 8.34,5.93 8.07,7H10.93C10.66,5.93 10.29,5.05 10.05,4.53C9.87,4.5 9.69,4.5 9.5,4.5M13.83,7C13.24,5.97 12.29,5.17 11.15,4.78C11.39,5.31 11.7,6.08 11.93,7H13.83M5.17,7H7.07C7.3,6.08 7.61,5.31 7.85,4.78C6.71,5.17 5.76,5.97 5.17,7M4.5,9.5C4.5,10 4.58,10.53 4.73,11H6.87L6.75,9.5L6.87,8H4.73C4.58,8.47 4.5,9 4.5,9.5M14.27,11C14.42,10.53 14.5,10 14.5,9.5C14.5,9 14.42,8.47 14.27,8H12.13C12.21,8.5 12.25,9 12.25,9.5C12.25,10 12.21,10.5 12.13,11H14.27M7.87,8L7.75,9.5L7.87,11H11.13C11.21,10.5 11.25,10 11.25,9.5C11.25,9 11.21,8.5 11.13,8H7.87M9.5,14.5C9.68,14.5 9.86,14.5 10.03,14.47C10.28,13.95 10.66,13.07 10.93,12H8.07C8.34,13.07 8.72,13.95 8.97,14.47L9.5,14.5M13.83,12H11.93C11.7,12.92 11.39,13.69 11.15,14.22C12.29,13.83 13.24,13.03 13.83,12M5.17,12C5.76,13.03 6.71,13.83 7.85,14.22C7.61,13.69 7.3,12.92 7.07,12H5.17Z"}
        label='Search Spotify'
        @click=${()=>this.onSectionClick(Qe.SEARCH_MEDIA)}
        selected=${this.getSectionSelected(Qe.SEARCH_MEDIA)}
        hide=${this.getSectionEnabled(Qe.SEARCH_MEDIA)}
      ></ha-icon-button>
    `}static get styles(){return a`
      :host > * {
        color: var(--spc-footer-icon-color, inherit);
      }

      :host > *[selected] {
        color: var(--spc-footer-icon-color-selected, var(--dark-primary-color));
      }

      :host > *[hide] {
        display: none;
      }
    `}onSectionClick(e){this.dispatchEvent(rt(ue,e))}getSectionSelected(e){return this.section===e||V}getSectionEnabled(e){return this.config.sections&&!this.config.sections?.includes(e)||V}};we([Ue({attribute:!1})],Ir.prototype,"config",void 0),we([Ue()],Ir.prototype,"section",void 0),Ir=we([xe("spc-footer")],Ir);const Tr=ne+"-card-editor-config-area-selected";class kr{constructor(e){this.section=e||Qe.UNDEFINED}}function _r(e){const t=new kr;return t.section=e,new CustomEvent(Tr,{bubbles:!0,composed:!0,detail:t})}class Er extends re{constructor(){super()}static get styles(){return a`
      ha-svg-icon {
        margin: 5px;
      }
      ha-control-button {
        white-space: nowrap;
      }
      ha-control-button-group {
        margin: 5px;
      }
      div {
        margin-top: 20px;
      }
    `}setConfig(e){const t=JSON.parse(JSON.stringify(e));t.sections&&0!==t.sections.length||(t.sections=[Qe.PLAYER],Bi.selectedConfigArea=et.GENERAL),this.config=t}configChanged(e=void 0){let t={};e&&(t=pt(this.config,e),this.config={...this.config,...e});const i=ct(Bi.selectedConfigArea);this.section!=i&&(this.section=i,this.store.section=this.section,document.dispatchEvent(_r(this.section))),((e,t,i,s)=>{s=s||{},i=null==i?{}:i;const r=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});r.detail=i,e.dispatchEvent(r)})(this,"config-changed",{config:this.config}),super.requestUpdate(),function(e,t){const i=rt(e,t);document.dispatchEvent(i)}("spc-dispatch-event-config-updated",t)}dispatchClose(){return super.dispatchEvent(new CustomEvent("closed"))}createStore(){if(this.store)return;const e=ct(Bi.selectedConfigArea);this.config.sections&&0!==this.config.sections.length||(this.config.sections=[Qe.PLAYER],Bi.selectedConfigArea=et.GENERAL),this.store=new Bi(this.hass,this.config,this,e),this.player=this.store.player,this.section=this.store.section}SetSection(e){(!this.config.sections||this.config.sections.indexOf(e)>-1)&&(this.section=e,this.store.section=this.section,super.requestUpdate())}}we([Ue({attribute:!1})],Er.prototype,"hass",void 0),we([Ue({attribute:!1})],Er.prototype,"config",void 0),we([Ue({attribute:!1})],Er.prototype,"store",void 0),we([Ue({attribute:!0})],Er.prototype,"section",void 0),we([Ue({attribute:!1})],Er.prototype,"footerBackgroundColor",void 0),we([Ve()],Er.prototype,"playerImage",void 0),we([Ve()],Er.prototype,"playerMediaContentId",void 0),we([Ve()],Er.prototype,"vibrantImage",void 0),we([Ve()],Er.prototype,"vibrantMediaContentId",void 0);class $r extends Er{render(){return this._styleRenderRootElements(),H`
      <ha-form id="elmHaForm"
        .data=${this.data||this.config}
        .schema=${this.schema}
        .computeLabel=${Pr}
        .hass=${this.hass}
        @value-changed=${this.changed||this.onValueChanged}
      ></ha-form>
    `}static get styles(){return a`
    `}firstUpdated(e){super.firstUpdated(e),this.isRenderRootStylesUpdated||this.requestUpdate()}onValueChanged(e){const t=e.detail.value;this.configChanged(t)}_styleRenderRootElements(){if(this.isRenderRootStylesUpdated)return;if(!this._elmHaForm)return void this.requestUpdate();if(!this._elmHaForm.shadowRoot)return void this.requestUpdate();if(!this._elmHaForm?.updateComplete)return void this.requestUpdate();if(!this.hasUpdated)return void this.requestUpdate();const e=this._elmHaForm.renderRoot.querySelector(".root");if(e){for(let t=0;t<e.children.length;t++){const i=e.children[t];if("HA-FORM-STRING"==i.tagName)i.setAttribute("style","margin-bottom: var(--ha-form-style-string-margin-bottom, 24px);");else if("HA-SELECTOR"==i.tagName){i.setAttribute("style","margin-bottom: var(--ha-form-style-selector-margin-bottom, 24px);");const s=e.children[t].shadowRoot?.firstElementChild;if(s&&"HA-SELECTOR-BOOLEAN"==s.tagName){const e=s.shadowRoot?.firstElementChild;"HA-FORMFIELD"==e?.tagName?e.setAttribute("style","min-height: var(--ha-form-style-selector-boolean-min-height, 56px);"):console.log("%c HA-SELECTOR underlying type was not styled: %s","color:red",i.tagName)}}else"HA-FORM-MULTI_SELECT"==i.tagName?i.setAttribute("style","margin-bottom: var(--ha-form-style-multiselect-margin-bottom, 24px);"):"HA-FORM-SELECT"==i.tagName?i.setAttribute("style","margin-bottom: var(--ha-form-style-multiselect-margin-bottom, 24px); --mdc-menu-item-height: 2.5rem;"):"HA-FORM-INTEGER"==i.tagName?i.setAttribute("style","margin-bottom: var(--ha-form-style-integer-margin-bottom, 24px);"):console.log("%c _styleRenderRootElements (editor-form) - did not style %s element","color:red",i.tagName)}setTimeout((()=>{this._styleRenderRootElements(),this.isRenderRootStylesUpdated=!0}),50),this._elmHaForm.requestUpdate()}else;}}function Pr({help:e,label:t,name:i}){if(t)return t+(e?` (${e})`:"");let s=i.replace(/([A-Z])/g," $1");return s=s.charAt(0).toUpperCase()+s.slice(1),s+(e?` (${e})`:"")}we([Ue({attribute:!1})],$r.prototype,"schema",void 0),we([Ue({attribute:!1})],$r.prototype,"data",void 0),we([Ue()],$r.prototype,"changed",void 0),we([Ue()],$r.prototype,"isRenderRootStylesUpdated",void 0),we([Ne("#elmHaForm")],$r.prototype,"_elmHaForm",void 0),customElements.define("spc-editor-form",$r);const Fr=[{name:"sections",label:"Card sections to enable",help:"unchecked items will not be shown",required:!1,type:"multi_select",options:{player:"Player",albumfavorites:"Album Favorites",artistfavorites:"Artist Favorites",audiobookfavorites:"Audiobook Favorites",categorys:"Categorys",devices:"Devices",episodefavorites:"Episode Favorites",playlistfavorites:"Playlist Favorites",recents:"Recently Played",searchmedia:"Search Media",showfavorites:"Show Favorites",trackfavorites:"Track Favorites",userpresets:"User Presets"}},{name:"entity",label:"SpotifyPlus media player entity to retrieve data from",help:"required",required:!0,selector:{entity:{multiple:!1,filter:{domain:le,integration:ne}}}},{name:"title",label:"Card title text",help:"displayed at the top of the card above the section",required:!1,type:"string"},{name:"width",label:"Width of the card",help:'in rem units; or "fill" for 100% width',required:!1,type:"string",default:35.15},{name:"height",label:"Height of the card",help:'in rem units; or "fill" for 100% height',required:!1,type:"string",default:35.15},{name:"sectionDefault",label:"Default card section to display",required:!1,type:"select",options:[["player","Player"],["albumfavorites","Album Favorites"],["artistfavorites","Artist Favorites"],["audiobookfavorites","Audiobook Favorites"],["categorys","Categorys"],["devices","Devices"],["episodefavorites","Episode Favorites"],["playlistfavorites","Playlist Favorites"],["recents","Recently Played"],["searchmedia","Search Media"],["showfavorites","Show Favorites"],["trackfavorites","Track Favorites"],["userpresets","User Presets"]]},{name:"touchSupportDisabled",label:"Disable touch event support",help:"force mouse events",required:!1,selector:{boolean:{}}}];customElements.define("spc-general-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control overall look of card - version ${ae}
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Fr}
        .section=${Qe.PLAYER}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}});const Lr=[{name:"playerBackgroundImageSize",label:"Size of the player background image",help:'default is "100% 100%"',required:!1,type:"string"},{name:"playerMinimizeOnIdle",label:"Minimize player height when state is off / idle",help:'if height not "fill"',required:!1,selector:{boolean:{}}}];customElements.define("spc-player-general-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Player General area settings
      </div>
      <spc-editor-form
        .schema=${Lr}
        .section=${Qe.PLAYER}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
    `}static get styles(){return a`
      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }
      `}});const Rr=[{name:"playerHeaderTitle",label:"Section title text displayed in the header area",required:!1,type:"string"},{name:"playerHeaderArtistTrack",label:"Artist and Track info displayed in the header area",required:!1,type:"string"},{name:"playerHeaderAlbum",label:"Album info displayed in the header area",required:!1,type:"string"},{name:"playerHeaderNoMediaPlayingText",label:"Text to display in the header area when no media is currently playing",required:!1,type:"string"},{name:"playerHeaderBackgroundColor",label:'Color value (e.g. "#hhrrggbb") for header area background gradient',help:"'transparent' to disable",required:!1,type:"string",default:ge},{name:"playerHeaderHideProgressBar",label:"Hide progress bar in the header area",required:!1,selector:{boolean:{}}},{name:"playerHeaderHide",label:"Hide header area of the Player section form",required:!1,selector:{boolean:{}}}];customElements.define("spc-player-header-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Player Header Status area settings
      </div>
      <spc-editor-form
        .schema=${Rr}
        .section=${Qe.PLAYER}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
    `}static get styles(){return a`
      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }
      `}});const Or=[{name:"playerControlsIconSize",label:"Size of the icons in the Player controls area.",help:'default is "'+fe+'"',required:!1,type:"string",default:fe},{name:"playerControlsHideFavorites",label:"Hide favorite actions control button in the controls area",required:!1,selector:{boolean:{}}},{name:"playerControlsHideShuffle",label:"Hide shuffle control button in the controls area",required:!1,selector:{boolean:{}}},{name:"playerControlsHideTrackPrev",label:"Hide previous track control button in the controls area",required:!1,selector:{boolean:{}}},{name:"playerControlsHidePlayPause",label:"Hide play / pause control button in the controls area",required:!1,selector:{boolean:{}}},{name:"playerControlsHideTrackNext",label:"Hide next track control button in the controls area",required:!1,selector:{boolean:{}}},{name:"playerControlsHideRepeat",label:"Hide repeat control button in the controls area",required:!1,selector:{boolean:{}}},{name:"playerControlsHidePlayQueue",label:"Hide play queue control button in the controls area",required:!1,selector:{boolean:{}}},{name:"playerControlsHide",label:"Hide controls area of the Player section form",required:!1,selector:{boolean:{}}}];customElements.define("spc-player-controls-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Player Media Control area settings
      </div>
      <spc-editor-form
        .schema=${Or}
        .section=${Qe.PLAYER}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
    `}static get styles(){return a`
      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }
      `}});const Mr=[{name:"playerControlsBackgroundColor",label:'Color value (e.g. "#hhrrggbb") for controls area background gradient',help:"'transparent' to disable",required:!1,type:"string",default:ge},{name:"playerVolumeMaxValue",label:"Maximum volume value allowed via card UI",help:"range 10 - 100",required:!0,type:"integer",default:100,valueMin:10,valueMax:100},{name:"playerVolumeStepValue",label:"Amount used to adjust volume when step buttons are used",help:"range 1 - 30",required:!0,type:"integer",default:10,valueMin:1,valueMax:30},{name:"playerVolumeControlsHideMute",label:"Hide mute button in the volume controls area",required:!1,selector:{boolean:{}}},{name:"playerVolumeControlsHidePower",label:"Hide power button in the volume controls area",required:!1,selector:{boolean:{}}},{name:"playerVolumeControlsHideSlider",label:"Hide volume slider and levels in the volume controls area",required:!1,selector:{boolean:{}}},{name:"playerVolumeControlsShowPlusMinus",label:"Show plus / minus buttons in the volume controls area",required:!1,selector:{boolean:{}}},{name:"playerVolumeControlsHideLevels",label:"Hide volume level numbers / %'s in the volume controls area",required:!1,selector:{boolean:{}}}];var xr;customElements.define("spc-player-volume-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Player Volume Control area settings
      </div>
      <spc-editor-form
        .schema=${Mr}
        .section=${Qe.PLAYER}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
    `}static get styles(){return a`
      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }
      `}}),function(e){e.GENERAL="General",e.HEADER="Header",e.CONTROLS="Controls",e.VOLUME="Volume"}(xr||(xr={}));const{GENERAL:Br,HEADER:Hr,CONTROLS:Ur,VOLUME:Vr}=xr;class Dr extends Er{constructor(){super(...arguments),this.configArea=Br}render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Player section look and feel
      </div>
      <ha-control-button-group>
        ${[Br,Hr,Ur,Vr].map((e=>H`
            <ha-control-button
              selected=${this.configArea===e||V}
              @click=${()=>this.onConfigPlayerSectionClick(e)}
            >
              ${e}
            </ha-control-button>
          `))}
      </ha-control-button-group>

      ${this.subEditor()}
    `}subEditor(){return Ge(this.configArea,[[Br,()=>H`<spc-player-general-editor .config=${this.config} .hass=${this.hass}></spc-player-general-editor>`],[Hr,()=>H`<spc-player-header-editor .config=${this.config} .hass=${this.hass}></spc-player-header-editor>`],[Ur,()=>H`<spc-player-controls-editor .config=${this.config} .hass=${this.hass}></spc-player-controls-editor>`],[Vr,()=>H`<spc-player-volume-editor .config=${this.config} .hass=${this.hass}></spc-player-volume-editor>`]])}onConfigPlayerSectionClick(e){this.configArea=e}static get styles(){return a`
      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      ha-control-button[selected] {
        --control-button-background-color: var(--primary-color);
      }
    `}}we([Ve()],Dr.prototype,"configArea",void 0),customElements.define("spc-player-editor",Dr);const Nr=[{name:"albumFavBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"albumFavBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"albumFavBrowserItemsLimit",label:"Maximum # of favorite items to return",help:"1000 max, 200 default",required:!1,type:"integer",default:200,valueMin:1,valueMax:1e3},{name:"albumFavBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"albumFavBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"albumFavBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"albumFavBrowserItemsSortTitle",label:"Sort items by Title",required:!1,selector:{boolean:{}}},{name:"albumFavBrowserShuffleOnPlay",label:"Enable shuffle prior to starting play",required:!1,selector:{boolean:{}}}];customElements.define("spc-album-fav-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Album Favorites section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Nr}
        .section=${Qe.ALBUM_FAVORITES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const qr=[{name:"artistFavBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"artistFavBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"artistFavBrowserItemsLimit",label:"Maximum # of favorite items to return",help:"1000 max, 200 default",required:!1,type:"integer",default:200,valueMin:1,valueMax:1e3},{name:"artistFavBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"artistFavBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"artistFavBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"artistFavBrowserItemsSortTitle",label:"Sort items by Title",required:!1,selector:{boolean:{}}},{name:"artistFavBrowserShuffleOnPlay",label:"Enable shuffle prior to starting play",required:!1,selector:{boolean:{}}}];customElements.define("spc-artist-fav-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Artist Favorites section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${qr}
        .section=${Qe.ARTIST_FAVORITES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const Gr=[{name:"audiobookFavBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"audiobookFavBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"audiobookFavBrowserItemsLimit",label:"Maximum # of favorite items to return",help:"1000 max, 200 default",required:!1,type:"integer",default:200,valueMin:1,valueMax:1e3},{name:"audiobookFavBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"audiobookFavBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"audiobookFavBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"audiobookFavBrowserItemsSortTitle",label:"Sort items by Title",required:!1,selector:{boolean:{}}}];customElements.define("spc-audiobook-fav-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Audiobook Favorites section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Gr}
        .section=${Qe.AUDIOBOOK_FAVORITES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const Jr=[{name:"categoryBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"categoryBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"categoryBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"categoryBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"categoryBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"categoryBrowserItemsSortTitle",label:"Sort Playlist items by Title",required:!1,selector:{boolean:{}}}];customElements.define("spc-category-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Category section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Jr}
        .section=${Qe.CATEGORYS}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const Wr=[{name:"deviceBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"deviceBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"deviceDefaultId",label:"Device name / id to use for all SpotifyPlus service calls",help:"e.g. Office Speaker",required:!1,type:"string"},{name:"deviceBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"deviceBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"deviceBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"deviceBrowserItemsShowHiddenDevices",label:"Show SpotifyPlus configured hidden devices in Device browser",required:!1,selector:{boolean:{}}},{name:"deviceControlByName",label:"Control the device by its name instead of ID",required:!1,selector:{boolean:{}}}];customElements.define("spc-device-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Sources section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Wr}
        .section=${Qe.DEVICES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}});const Yr=[{name:"episodeFavBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"episodeFavBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"episodeFavBrowserItemsLimit",label:"Maximum # of favorite items to return",help:"1000 max, 200 default",required:!1,type:"integer",default:200,valueMin:1,valueMax:1e3},{name:"episodeFavBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"episodeFavBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"episodeFavBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"episodeFavBrowserItemsSortTitle",label:"Sort items by Title",required:!1,selector:{boolean:{}}}];customElements.define("spc-episode-fav-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Episode Favorites section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Yr}
        .section=${Qe.EPISODE_FAVORITES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const zr=[{name:"playlistFavBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"playlistFavBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"playlistFavBrowserItemsLimit",label:"Maximum # of favorite items to return",help:"1000 max, 200 default",required:!1,type:"integer",default:200,valueMin:1,valueMax:1e3},{name:"playlistFavBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"playlistFavBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"playlistFavBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"playlistFavBrowserItemsSortTitle",label:"Sort items by Title",required:!1,selector:{boolean:{}}},{name:"playlistFavBrowserShuffleOnPlay",label:"Enable shuffle prior to starting play",required:!1,selector:{boolean:{}}}];customElements.define("spc-playlist-fav-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Playlist Favorites section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${zr}
        .section=${Qe.PLAYLIST_FAVORITES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const jr=[{name:"recentBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"recentBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"recentBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"recentBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"recentBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}}];customElements.define("spc-recent-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Recently Played Browser section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${jr}
        .section=${Qe.RECENTS}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}});const Kr=[{name:"searchMediaBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"searchMediaBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"searchMediaBrowserSearchTypes",label:"Search media types to enable",help:"unchecked items will not be shown; all enabled if none checked",required:!1,type:"multi_select",options:{Albums:"Albums",Artists:"Artists",AudioBooks:"AudioBooks",Episodes:"Episodes",Playlists:"Playlists",Shows:"Shows",Tracks:"Tracks"}},{name:"searchMediaBrowserSearchLimit",label:"Maximum # of items to return by the search",required:!1,type:"integer",default:50,valueMin:25,valueMax:500},{name:"searchMediaBrowserUseDisplaySettings",label:"Use search display settings when displaying results:",required:!1,selector:{boolean:{}}},{name:"searchMediaBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"searchMediaBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"searchMediaBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"searchMediaBrowserQueueSelection",label:"Queue track / episode when selected",help:"otherwise play immediately",required:!1,selector:{boolean:{}}}];customElements.define("spc-search-media-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Search Media section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Kr}
        .section=${Qe.SEARCH_MEDIA}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const Zr=[{name:"showFavBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"showFavBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"showFavBrowserItemsLimit",label:"Maximum # of favorite items to return",help:"1000 max, 200 default",required:!1,type:"integer",default:200,valueMin:1,valueMax:1e3},{name:"showFavBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"showFavBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"showFavBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"showFavBrowserItemsSortTitle",label:"Sort items by Title",required:!1,selector:{boolean:{}}}];customElements.define("spc-show-fav-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Show Favorites section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Zr}
        .section=${Qe.SHOW_FAVORITES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const Xr=[{name:"trackFavBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"trackFavBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"trackFavBrowserItemsLimit",label:"Maximum # of favorite items to return",help:"1000 max, 200 default",required:!1,type:"integer",default:200,valueMin:1,valueMax:1e3},{name:"trackFavBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"trackFavBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"trackFavBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}},{name:"trackFavBrowserItemsSortTitle",label:"Sort items by Title",required:!1,selector:{boolean:{}}},{name:"trackFavBrowserShuffleOnPlay",label:"Enable shuffle prior to starting play of favorites",required:!1,selector:{boolean:{}}}];customElements.define("spc-track-fav-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the Track Favorites section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Xr}
        .section=${Qe.TRACK_FAVORITES}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
        @value-changed=${this.onValueChanged}
      ></spc-editor-form>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}onValueChanged(e){}});const Qr=[{name:"userPresetBrowserTitle",label:"Section title text",help:"displayed at the top of the section",required:!1,type:"string"},{name:"userPresetBrowserSubTitle",label:"Section sub-title text",help:"displayed below the section title",required:!1,type:"string"},{name:"userPresetsFile",label:"File that contains user-defined preset items",help:'e.g. "/local/spotifyplus/userpresets.json"',required:!1,type:"string"},{name:"userPresetBrowserItemsPerRow",label:"# of items to display per row",help:"use 1 for list format",required:!0,type:"integer",default:4,valueMin:1,valueMax:12},{name:"userPresetBrowserItemsHideTitle",label:"Hide item row title text",required:!1,selector:{boolean:{}}},{name:"userPresetBrowserItemsHideSubTitle",label:"Hide item row sub-title text",help:"if Title visible",required:!1,selector:{boolean:{}}}];customElements.define("spc-userpreset-browser-editor",class extends Er{render(){return super.createStore(),H`
      <div class="schema-title">
        Settings that control the User Preset Browser section look and feel
      </div>
      <spc-editor-form class="spc-editor-form"
        .schema=${Qr}
        .section=${Qe.USERPRESETS}
        .store=${this.store}
        .config=${this.config}
        .hass=${this.hass}
      ></spc-editor-form>
      <div class="schema-title">
        User Preset items must be defined manually in the configuration code editor.
        Please refer to the <a href="https://github.com/thlucas1/spotifyplus_card/wiki/Configuration-Options#userpresets-user-preset-content-items" target="_blank">
        wiki documentation</a> for more details and examples.
      </div>
    `}static get styles(){return a`

      .schema-title {
        margin: 0.4rem 0;
        text-align: left;
        font-size: 1rem;
        color: var(--secondary-text-color);
      }

      /* control the look and feel of the HA-FORM element. */
      .spc-editor-form {
      }

      `}});const eo=Pe(de+":editor");class to extends Er{constructor(){super(...arguments),this.configArea=et.GENERAL,this.onFooterShowSection=e=>{const t=ht(e.detail);this.configArea=t,Bi.selectedConfigArea=this.configArea}}render(){return this.hass&&this.config?(super.createStore(),H`
      <ha-control-button-group>
        ${[et.GENERAL,et.PLAYER,et.DEVICE_BROWSER,et.USERPRESET_BROWSER,et.RECENT_BROWSER].map((e=>H`
            <ha-control-button
              selected=${this.configArea===e||V}
              @click=${()=>this.onConfigSectionClick(e)}
            >
              ${e}
            </ha-control-button>
          `))}
      </ha-control-button-group>
      <ha-control-button-group>
        ${[et.PLAYLIST_FAVORITES,et.ALBUM_FAVORITES,et.ARTIST_FAVORITES,et.TRACK_FAVORITES,et.AUDIOBOOK_FAVORITES].map((e=>H`
            <ha-control-button
              selected=${this.configArea===e||V}
              @click=${()=>this.onConfigSectionClick(e)}
            >
              ${e}
            </ha-control-button>
          `))}
      </ha-control-button-group>
      <ha-control-button-group>
        ${[et.EPISODE_FAVORITES,et.SHOW_FAVORITES,et.CATEGORY_BROWSER,et.SEARCH_MEDIA_BROWSER].map((e=>H`
            <ha-control-button
              selected=${this.configArea===e||V}
              @click=${()=>this.onConfigSectionClick(e)}
            >
              ${e}
            </ha-control-button>
          `))}
      </ha-control-button-group>

      <div class="spc-card-editor">
        ${this.subEditor()}
      </div>
    `):H``}static get styles(){return a`

      .spc-card-editor {
        /* control the look and feel of the HA-FORM element. */
        --ha-form-style-integer-margin-bottom: 0.5rem;
        --ha-form-style-multiselect-margin-bottom: 0.5rem;
        --ha-form-style-selector-margin-bottom: 0.5rem;
        --ha-form-style-selector-boolean-min-height: 28px;
        --ha-form-style-string-margin-bottom: 0.5rem;
      }

      ha-control-button-group {
        margin-bottom: 8px;
      }

      ha-control-button[selected] {
        --control-button-background-color: var(--primary-color);
      }
    `}subEditor(){return Ge(this.configArea,[[et.ALBUM_FAVORITES,()=>H`<spc-album-fav-browser-editor .config=${this.config} .hass=${this.hass}></spc-album-fav-browser-editor>`],[et.ARTIST_FAVORITES,()=>H`<spc-artist-fav-browser-editor .config=${this.config} .hass=${this.hass}></spc-artist-fav-browser-editor>`],[et.AUDIOBOOK_FAVORITES,()=>H`<spc-audiobook-fav-browser-editor .config=${this.config} .hass=${this.hass}></spc-audiobook-fav-browser-editor>`],[et.CATEGORY_BROWSER,()=>H`<spc-category-browser-editor .config=${this.config} .hass=${this.hass}></spc-category-browser-editor>`],[et.DEVICE_BROWSER,()=>H`<spc-device-browser-editor .config=${this.config} .hass=${this.hass}></spc-device-browser-editor>`],[et.EPISODE_FAVORITES,()=>H`<spc-episode-fav-browser-editor .config=${this.config} .hass=${this.hass}></spc-episode-fav-browser-editor>`],[et.GENERAL,()=>H`<spc-general-editor .config=${this.config} .hass=${this.hass}></spc-general-editor>`],[et.PLAYER,()=>H`<spc-player-editor .config=${this.config} .hass=${this.hass}></spc-player-editor>`],[et.PLAYLIST_FAVORITES,()=>H`<spc-playlist-fav-browser-editor .config=${this.config} .hass=${this.hass}></spc-playlist-fav-browser-editor>`],[et.RECENT_BROWSER,()=>H`<spc-recent-browser-editor .config=${this.config} .hass=${this.hass}></spc-recent-browser-editor>`],[et.SEARCH_MEDIA_BROWSER,()=>H`<spc-search-media-browser-editor .config=${this.config} .hass=${this.hass}></spc-search-media-browser-editor>`],[et.SHOW_FAVORITES,()=>H`<spc-show-fav-browser-editor .config=${this.config} .hass=${this.hass}></spc-show-fav-browser-editor>`],[et.TRACK_FAVORITES,()=>H`<spc-track-fav-browser-editor .config=${this.config} .hass=${this.hass}></spc-track-fav-browser-editor>`],[et.USERPRESET_BROWSER,()=>H`<spc-userpreset-browser-editor .config=${this.config} .hass=${this.hass}></spc-userpreset-browser-editor>`]])}onConfigSectionClick(e){const t=ct(e);Bi.selectedConfigArea=e,this.configArea=e,this.section=t,this.store.section=t,document.dispatchEvent(_r(this.section))}connectedCallback(){super.connectedCallback(),window.addEventListener(ue,this.onFooterShowSection)}disconnectedCallback(){window.removeEventListener(ue,this.onFooterShowSection),super.disconnectedCallback()}firstUpdated(e){super.firstUpdated(e),eo.enabled&&eo("firstUpdated (editor) - 1st render complete - changedProperties keys:\n%s",JSON.stringify(Array.from(e.keys())));let t=ht(this.section);this.config&&(this.config.entity||(t=et.GENERAL)),this.configArea=t,Bi.selectedConfigArea=this.configArea,super.requestUpdate()}}we([Ve()],to.prototype,"configArea",void 0),customElements.define("spc-editor",to);const io=Pe(de+":card"),so="100%";let ro=class extends oi{constructor(){super(),this.isFirstTimeSetup=!0,this.onEditorConfigAreaSelectedEventHandler=e=>{const t=e.detail;this.config.sections?.includes(t.section)?(io.enabled&&io("onEditorConfigAreaSelectedEventHandler - set section reference for selected ConfigArea and display the section\n- OLD section=%s\n- NEW section=%s",JSON.stringify(this.section),JSON.stringify(t.section)),this.SetSection(t.section)):io.enabled&&io("onEditorConfigAreaSelectedEventHandler - section is not active: %s",JSON.stringify(t.section))},this.onFooterShowSection=e=>{const t=e.detail;(!this.config.sections||this.config.sections.indexOf(t)>-1)&&(this.section=t,this.store.section=this.section,super.requestUpdate())},this.onMediaListItemSelected=()=>{},this.onProgressEndedEventHandler=()=>{this.cancelLoader=!0;const e=Date.now()-this.loaderTimestamp;this.showLoader&&(e<1e3?setTimeout((()=>this.showLoader=!1),1e3-e):this.showLoader=!1)},this.onProgressStartedEventHandler=()=>{this.showLoader||(this.cancelLoader=!1,setTimeout((()=>{this.cancelLoader||(this.showLoader=!0,this.loaderTimestamp=Date.now())}),250))},this.onFilterSectionMediaEventHandler=e=>{const t=e.detail;Object.values(Qe).includes(t.section||"")||io("%conFilterSectionMediaEventHandler - Ignoring Filter request; section is not a valid Section enum value:\n%s","color:red",JSON.stringify(t,null,2)),this.config.sections?.includes(t.section)?(this.section=t.section,this.store.section=this.section,setTimeout((()=>{let e;if(io.enabled&&io("onFilterSectionMediaEventHandler - executing filter:\n%s",JSON.stringify(t,null,2)),t.section==Qe.ALBUM_FAVORITES)e=this.elmAlbumFavBrowserForm;else if(t.section==Qe.ARTIST_FAVORITES)e=this.elmArtistFavBrowserForm;else if(t.section==Qe.AUDIOBOOK_FAVORITES)e=this.elmAudiobookFavBrowserForm;else if(t.section==Qe.DEVICES)e=this.elmDeviceBrowserForm;else if(t.section==Qe.EPISODE_FAVORITES)e=this.elmEpisodeFavBrowserForm;else if(t.section==Qe.PLAYLIST_FAVORITES)e=this.elmPlaylistFavBrowserForm;else if(t.section==Qe.RECENTS)e=this.elmRecentBrowserForm;else if(t.section==Qe.SHOW_FAVORITES)e=this.elmShowFavBrowserForm;else if(t.section==Qe.TRACK_FAVORITES)e=this.elmTrackFavBrowserForm;else{if(t.section!=Qe.USERPRESETS)return;e=this.elmUserPresetBrowserForm}e.filterSectionMedia(t)}),50)):io("%onFilterSectionMediaEventHandler - Filter section is not enabled; ignoring filter request:\n%s","color:red",JSON.stringify(t,null,2))},this.onSearchMediaEventHandler=e=>{const t=e.detail;this.config.sections?.includes(Qe.SEARCH_MEDIA)?(this.section=Qe.SEARCH_MEDIA,this.store.section=this.section,setTimeout((()=>{io.enabled&&io("onSearchMediaEventHandler - executing search:\n%s",JSON.stringify(t,null,2)),this.elmSearchMediaBrowserForm.searchExecute(t)}),250)):(io("%conSearchMediaEventHandler - Search section is not enabled; ignoring search request:\n%s","color:red",JSON.stringify(t,null,2)),this.alertInfoSet("Search section is not enabled; ignoring search request."))},this.onCategoryDisplayEventHandler=e=>{const t=e.detail;this.config.sections?.includes(Qe.CATEGORYS)?(this.section=Qe.CATEGORYS,this.store.section=this.section,setTimeout((()=>{io.enabled&&io("onCategoryDisplayEventHandler - displaying category:\n%s",JSON.stringify(t,null,2)),this.elmCategoryBrowserForm.displayCategory(t)}),250)):io("%conCategoryDisplayEventHandler - Category section is not enabled; ignoring display request:\n%s","color:red",JSON.stringify(t,null,2))},this.showLoader=!1,this.cancelLoader=!1,this.loaderTimestamp=0}render(){if(!this.hass)return H``;this.createStore(),this.config.sections&&0!==this.config.sections.length||(this.config.sections=[Qe.PLAYER],Bi.selectedConfigArea=et.GENERAL);const e=this.config.sections,t=!e||e.length>1,i=wt(this.config.title,this.config,this.store.player);return this.checkForBackgroundImageChange(),H`
      <ha-card class="spc-card" style=${this.styleCard()}>
        <div class="spc-loader" ?hidden=${!this.showLoader}>
          <ha-spinner size="large"></ha-spinner>
        </div>
        ${i?H`<div class="spc-card-header" style=${this.styleCardHeader()}>${i}</div>`:""}
        ${this.alertError?H`<ha-alert alert-type="error" dismissable @alert-dismissed-clicked=${this.alertErrorClear}>${this.alertError}</ha-alert>`:""}
        ${this.alertInfo?H`<ha-alert alert-type="info" dismissable @alert-dismissed-clicked=${this.alertInfoClear}>${this.alertInfo}</ha-alert>`:""}
        <div class="spc-card-content-section" style=${this.styleCardContent()}>
          ${""!=this.store.player.id?Ge(this.section,[[Qe.ALBUM_FAVORITES,()=>H`<spc-album-fav-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmAlbumFavBrowserForm"></spc-album-fav-browser>`],[Qe.ARTIST_FAVORITES,()=>H`<spc-artist-fav-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmArtistFavBrowserForm"></spc-artist-fav-browser>`],[Qe.AUDIOBOOK_FAVORITES,()=>H`<spc-audiobook-fav-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmAudiobookFavBrowserForm"></spc-audiobook-fav-browser>`],[Qe.CATEGORYS,()=>H`<spc-category-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmCategoryBrowserForm"></spc-category-browser>`],[Qe.DEVICES,()=>H`<spc-device-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmDeviceBrowserForm"></spc-device-browser>`],[Qe.EPISODE_FAVORITES,()=>H`<spc-episode-fav-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmEpisodeFavBrowserForm"></spc-episode-fav-browser>`],[Qe.PLAYER,()=>H`<spc-player id="spcPlayer" .store=${this.store}></spc-player>`],[Qe.PLAYLIST_FAVORITES,()=>H`<spc-playlist-fav-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmPlaylistFavBrowserForm"></spc-playlist-fav-browser>`],[Qe.RECENTS,()=>H`<spc-recent-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmRecentBrowserForm"></spc-recents-browser>`],[Qe.SEARCH_MEDIA,()=>H`<spc-search-media-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmSearchMediaBrowserForm"></spc-search-media-browser>`],[Qe.SHOW_FAVORITES,()=>H`<spc-show-fav-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmShowFavBrowserForm"></spc-show-fav-browser>`],[Qe.TRACK_FAVORITES,()=>H`<spc-track-fav-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmTrackFavBrowserForm"></spc-track-fav-browser>`],[Qe.USERPRESETS,()=>H`<spc-userpreset-browser .store=${this.store} @item-selected=${this.onMediaListItemSelected} id="elmUserPresetBrowserForm"></spc-userpresets-browser>`],[Qe.UNDEFINED,()=>H`<div class="spc-not-configured">SpotifyPlus card configuration error.<br/>Please configure section(s) to display.</div>`]]):H`
                  <div class="spc-initial-config">
                    Welcome to the SpotifyPlus media player card.<br/>
                    Start by editing the card configuration media player "entity" value.<br/>
                    <div class="spc-not-configured">
                      ${this.store.player.attributes.sp_config_state}
                    </div>
                  </div>`}
        </div>
        ${Je(t,(()=>H`<div class="spc-card-footer-container" style=${this.styleCardFooter()}>
            <spc-footer 
              class="spc-card-footer"
              .config=${this.config}
              .section=${this.section}
              @show-section=${this.onFooterShowSection}
            ></spc-footer>
          </div>`))}
      </ha-card>
    `}static get styles(){return a`
      :host {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }

      * { 
        margin: 0; 
      }

      html,
      body {
        height: 100%;
        margin: 0;
      }

      spotifyplus-card {
        display: block;
        height: 100% !important;
        width: 100% !important;
      }

      hui-card-preview {
        min-height: 10rem;
        height: 40rem;
        min-width: 10rem;
        width: 40rem;
      }

      .spc-card {
        --spc-card-header-height: ${2}rem;
        --spc-card-footer-height: ${4}rem;
        --spc-card-edit-tab-height: 0px;
        --spc-card-edit-bottom-toolbar-height: 0px;
        box-sizing: border-box;
        padding: 0rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: calc(100vh - var(--spc-card-footer-height) - var(--spc-card-edit-tab-height) - var(--spc-card-edit-bottom-toolbar-height));
        min-width: 20rem;
        width: calc(100vw - var(--mdc-drawer-width));
        color: var(--secondary-text-color);
      }

      .spc-card-header {
        box-sizing: border-box;
        padding: 0.2rem;
        display: flex;
        align-self: flex-start;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        font-weight: bold;
        font-size: 1.2rem;
        color: var(--secondary-text-color);
      }

      .spc-card-content-section {
        margin: 0.0rem;
        flex-grow: 1;
        flex-shrink: 0;
        height: 1vh;
        overflow: hidden;
      }

      .spc-card-footer-container {
        width: 100%;
        display: flex;
        align-items: center;
        background-repeat: no-repeat;
        background-color: var(--spc-footer-background-color, var(--spc-player-footer-bg-color, var(--card-background-color, transparent)));
        background-image: var(--spc-footer-background-image, linear-gradient(rgba(0, 0, 0, 0.6), rgb(0, 0, 0)));
      }

      .spc-card-footer {
        margin: 0.2rem;
        display: flex;
        align-self: flex-start;
        align-items: center;
        justify-content: space-around;
        flex-wrap: wrap;
        width: 100%;
        --mdc-icon-button-size: var(--spc-footer-icon-button-size, 2.5rem);
        --mdc-icon-size: var(--spc-footer-icon-size, 1.75rem);
        --mdc-ripple-top: 0px;
        --mdc-ripple-left: 0px;
        --mdc-ripple-fg-size: 10px;
      }

      .spc-loader {
        position: absolute;
        z-index: 1000;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        --ha-spinner-indicator-color: var(--spc-card-wait-progress-slider-color, var(--dark-primary-color, ${o(Ae)}));
      }

      .spc-not-configured {
        text-align: center;
        margin: 1rem;
        color: #fa2643;
      }

      .spc-initial-config {
        text-align: center;
        margin-top: 1rem;
      }

      ha-icon-button {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    `}createStore(){if(this.store=new Bi(this.hass,this.config,this,this.section),this.isCardInEditPreview=ut(this),this.playerId||(this.playerId=this.config.entity),this.isFirstTimeSetup&&this.playerId){io("createStore - isFirstTimeSetup logic invoked; creating store area");const e=this.store.config.playerVolumeStepValue||0;e>0&&10!=e&&(io("createStore - isFirstTimeSetup is setting media player volume step level"),this.store.spotifyPlusService.VolumeSetStepLevel(this.store.player,e)),this.config.sections&&0!=this.config.sections.length?this.config.sectionDefault?(io("createStore - isFirstTimeSetup defaulting section to config.sectionDefault (%s)",JSON.stringify(this.config.sectionDefault)),this.SetSection(this.config.sectionDefault)):this.section||(io("createStore - isFirstTimeSetup defaulting section to Store.selectedConfigArea (%s)",JSON.stringify(Bi.selectedConfigArea)),this.SetSection(ct(Bi.selectedConfigArea))):(io("createStore - isFirstTimeSetup defaulting section to PLAYER"),this.config.sections=[Qe.PLAYER],Bi.selectedConfigArea=et.GENERAL,this.SetSection(Qe.PLAYER)),this.isFirstTimeSetup=!1}}SetSection(e){!this.config.sections||this.config.sections.indexOf(e)>-1?(io.enabled&&io("SetSection - set section reference and display the section\n- OLD section=%s\n- NEW section=%s",JSON.stringify(this.section),JSON.stringify(e)),this.section=e,this.store.section=this.section,super.requestUpdate()):io.enabled&&io("SetSection - section is not active: %s",JSON.stringify(e))}connectedCallback(){super.connectedCallback(),this.addEventListener(si,this.onProgressEndedEventHandler),this.addEventListener(ri,this.onProgressStartedEventHandler),this.addEventListener(li,this.onSearchMediaEventHandler),this.addEventListener(Ar,this.onCategoryDisplayEventHandler),this.addEventListener(br,this.onFilterSectionMediaEventHandler),document.addEventListener(Tr,this.onEditorConfigAreaSelectedEventHandler)}disconnectedCallback(){this.removeEventListener(si,this.onProgressEndedEventHandler),this.removeEventListener(ri,this.onProgressStartedEventHandler),this.removeEventListener(li,this.onSearchMediaEventHandler),this.removeEventListener(Ar,this.onCategoryDisplayEventHandler),this.removeEventListener(br,this.onFilterSectionMediaEventHandler),document.removeEventListener(Tr,this.onEditorConfigAreaSelectedEventHandler),super.disconnectedCallback()}firstUpdated(e){super.firstUpdated(e),io.enabled&&io("firstUpdated (card) - 1st render complete - changedProperties keys:\n%s",JSON.stringify(Array.from(e.keys())));const t=this.config.sections||[];if(t.includes(this.section))this.isCardInEditPreview&&super.requestUpdate();else{let e=Qe.PLAYER;t.includes(Qe.PLAYER)?e=Qe.PLAYER:t.includes(Qe.DEVICES)?e=Qe.DEVICES:t.includes(Qe.USERPRESETS)?e=Qe.USERPRESETS:t.includes(Qe.RECENTS)?e=Qe.RECENTS:t.includes(Qe.CATEGORYS)?e=Qe.CATEGORYS:t.includes(Qe.PLAYLIST_FAVORITES)?e=Qe.PLAYLIST_FAVORITES:t.includes(Qe.ALBUM_FAVORITES)?e=Qe.ALBUM_FAVORITES:t.includes(Qe.ARTIST_FAVORITES)?e=Qe.ARTIST_FAVORITES:t.includes(Qe.TRACK_FAVORITES)?e=Qe.TRACK_FAVORITES:t.includes(Qe.AUDIOBOOK_FAVORITES)?e=Qe.AUDIOBOOK_FAVORITES:t.includes(Qe.SHOW_FAVORITES)?e=Qe.SHOW_FAVORITES:t.includes(Qe.EPISODE_FAVORITES)?e=Qe.EPISODE_FAVORITES:t.includes(Qe.SEARCH_MEDIA)&&(e=Qe.SEARCH_MEDIA),Bi.selectedConfigArea=ht(e),this.section=e,this.store.section=e,super.requestUpdate()}}setConfig(e){const t=JSON.parse(JSON.stringify(e));for(const[e,i]of Object.entries(t))Array.isArray(i)&&0===i.length&&delete t[e];const i={};for(const e in t.customImageUrls){const s=bt(e);let r=t.customImageUrls[e];r=r?.replace(" ","%20"),i[s]=r}t.customImageUrls=i,t.sections&&0!==t.sections.length||(t.sections=[Qe.PLAYER],Bi.selectedConfigArea=et.GENERAL),this.config=t,io("%csetConfig - Configuration reference set\n%s","color:orange",JSON.stringify(t,null,2))}getCardSize(){return 3}static getConfigElement(){return Bi.selectedConfigArea=et.GENERAL,Bi.hasCardEditLoadedMediaList={},document.createElement("spc-editor")}static getStubConfig(){return{cardUniqueId:Ke(),sections:[Qe.PLAYER,Qe.ALBUM_FAVORITES,Qe.ARTIST_FAVORITES,Qe.PLAYLIST_FAVORITES,Qe.RECENTS,Qe.DEVICES,Qe.TRACK_FAVORITES,Qe.USERPRESETS,Qe.AUDIOBOOK_FAVORITES,Qe.SHOW_FAVORITES,Qe.EPISODE_FAVORITES,Qe.SEARCH_MEDIA],entity:"",playerHeaderTitle:"{player.source}",playerHeaderArtistTrack:"{player.media_artist} - {player.media_title}",playerHeaderAlbum:"{player.media_album_name} {player.sp_playlist_name_title}",playerHeaderNoMediaPlayingText:'"{player.name}" state is "{player.state}"',albumFavBrowserTitle:"Album Favorites for {player.sp_user_display_name} ({medialist.filteritemcount} items)",albumFavBrowserSubTitle:"click a tile item to play the content; click-hold for actions",albumFavBrowserItemsPerRow:4,albumFavBrowserItemsHideTitle:!1,albumFavBrowserItemsHideSubTitle:!1,albumFavBrowserItemsSortTitle:!0,artistFavBrowserTitle:"Artist Favorites for {player.sp_user_display_name} ({medialist.filteritemcount} items)",artistFavBrowserSubTitle:"click a tile item to play the content; click-hold for actions",artistFavBrowserItemsPerRow:4,artistFavBrowserItemsHideTitle:!1,artistFavBrowserItemsHideSubTitle:!0,artistFavBrowserItemsSortTitle:!0,audiobookFavBrowserTitle:"Audiobook Favorites for {player.sp_user_display_name} ({medialist.filteritemcount} items)",audiobookFavBrowserSubTitle:"click a tile item to play the content; click-hold for actions",audiobookFavBrowserItemsPerRow:4,audiobookFavBrowserItemsHideTitle:!1,audiobookFavBrowserItemsHideSubTitle:!1,audiobookFavBrowserItemsSortTitle:!0,categoryBrowserTitle:"Categorys for {player.sp_user_display_name} ({medialist.filteritemcount} items)",categoryBrowserSubTitle:"click a tile item to view the content; click-hold for actions",categoryBrowserItemsPerRow:4,categoryBrowserItemsHideTitle:!1,categoryBrowserItemsHideSubTitle:!0,categoryBrowserItemsSortTitle:!0,deviceBrowserTitle:"Spotify Connect Devices ({medialist.filteritemcount} items)",deviceBrowserSubTitle:"click an item to select the device; click-hold for device info",deviceBrowserItemsPerRow:1,deviceBrowserItemsHideTitle:!1,deviceBrowserItemsHideSubTitle:!0,episodeFavBrowserTitle:"Episode Favorites for {player.sp_user_display_name} ({medialist.filteritemcount} items)",episodeFavBrowserSubTitle:"click a tile item to play the content; click-hold for actions",episodeFavBrowserItemsPerRow:4,episodeFavBrowserItemsHideTitle:!1,episodeFavBrowserItemsHideSubTitle:!1,episodeFavBrowserItemsSortTitle:!0,playlistFavBrowserTitle:"Playlist Favorites for {player.sp_user_display_name} ({medialist.filteritemcount} items)",playlistFavBrowserSubTitle:"click a tile item to play the content; click-hold for actions",playlistFavBrowserItemsPerRow:4,playlistFavBrowserItemsHideTitle:!1,playlistFavBrowserItemsHideSubTitle:!1,playlistFavBrowserItemsSortTitle:!0,recentBrowserTitle:"Recently Played by {player.sp_user_display_name} ({medialist.filteritemcount} items)",recentBrowserSubTitle:"click a tile item to play the content; click-hold for actions",recentBrowserItemsPerRow:4,recentBrowserItemsHideTitle:!1,recentBrowserItemsHideSubTitle:!1,searchMediaBrowserTitle:"Search Media for {player.sp_user_display_name} ({medialist.filteritemcount} items)",searchMediaBrowserSubTitle:"click a tile item to play the content; click-hold for actions",searchMediaBrowserUseDisplaySettings:!1,searchMediaBrowserItemsPerRow:4,searchMediaBrowserItemsHideTitle:!1,searchMediaBrowserItemsHideSubTitle:!0,searchMediaBrowserItemsSortTitle:!1,searchMediaBrowserSearchLimit:50,searchMediaBrowserSearchTypes:[kt.ALBUMS,kt.ARTISTS,kt.PLAYLISTS,kt.TRACKS,kt.AUDIOBOOKS,kt.SHOWS,kt.EPISODES],showFavBrowserTitle:"Show Favorites for {player.sp_user_display_name} ({medialist.filteritemcount} items)",showFavBrowserSubTitle:"click a tile item to play the content; click-hold for actions",showFavBrowserItemsPerRow:4,showFavBrowserItemsHideTitle:!1,showFavBrowserItemsHideSubTitle:!0,showFavBrowserItemsSortTitle:!0,trackFavBrowserTitle:"Track Favorites for {player.sp_user_display_name} ({medialist.filteritemcount} items)",trackFavBrowserSubTitle:"click a tile item to play the content; click-hold for actions",trackFavBrowserItemsPerRow:4,trackFavBrowserItemsHideTitle:!1,trackFavBrowserItemsHideSubTitle:!1,trackFavBrowserItemsSortTitle:!1,userPresetBrowserTitle:"User Presets for {player.sp_user_display_name} ({medialist.filteritemcount} items)",userPresetBrowserSubTitle:"click a tile item to play the content; click-hold for actions",userPresetBrowserItemsPerRow:4,userPresetBrowserItemsHideTitle:!1,userPresetBrowserItemsHideSubTitle:!1,userPresets:[{name:"Daily Mix 1",subtitle:"Various Artists",image_url:"https://dailymix-images.scdn.co/v2/img/ab6761610000e5ebcd3f796bd7ea49ed7615a550/1/en/default",uri:"spotify:playlist:37i9dQZF1E39vTG3GurFPW",type:"playlist"},{name:"My Track Favorites",subtitle:"Shuffled",image_url:"https://t.scdn.co/images/728ed47fc1674feb95f7ac20236eb6d7.jpeg",shuffle:!0,type:"trackfavorites"}],customImageUrls:{X_default:"/local/images/spotifyplus_card_customimages/default.png","X_empty preset":"/local/images/spotifyplus_card_customimages/empty_preset.png","X_Daily Mix 1":"https://brands.home-assistant.io/spotifyplus/icon.png",X_playerBackground:"/local/images/spotifyplus_card_customimages/playerBackground.png",X_playerIdleBackground:"/local/images/spotifyplus_card_customimages/playerIdleBackground.png",X_playerOffBackground:"/local/images/spotifyplus_card_customimages/playerOffBackground.png"}}}styleCard(){const e={};let t="0px",i="0px";const s=this.config.cardWaitProgressSliderColor;return s&&(e["--spc-card-wait-progress-slider-color"]=`${s}`),""==(this.playerId||"")&&(e["background-repeat"]="no-repeat",e["background-position"]="center",e["background-image"]=`url(${me})`,e["background-size"]=`${pe}`),this.isCardInEditPreview?(e["--spc-card-edit-tab-height"]=`${t}`,e["--spc-card-edit-bottom-toolbar-height"]=`${i}`,e.height="42rem",e.width="100%",this.config.playerMinimizeOnIdle&&this.section==Qe.PLAYER&&this.store.player.isPoweredOffOrIdle()&&"fill"!=this.config.height&&(e.height="unset !important",e["min-height"]="unset !important"),Me(e)):function(e){let t,i,s;if(e){const r=e.parentElement;if(r){t=(r.className||"").trim();const e=r.parentElement;if(e){i=(e.className||"").trim();const t=e.parentElement;t&&(s=(t.className||"").trim())}}}let r=!1;return"preview"===t&&"card"===i&&"cards-container"===s&&(r=!0),r}(this)?(e["--spc-card-edit-tab-height"]=`${t}`,e["--spc-card-edit-bottom-toolbar-height"]=`${i}`,e.height="100%",e.width=`${so}`,e["min-height"]="22rem",e["min-width"]=`${so}`,Me(e)):(function(){const e=window.location.search;let t=!1;return"1"==new URLSearchParams(e).get("edit")&&(t=!0),t}()&&(t="48px",i="59px"),"fill"==this.config.width?e.width="100%":mt(String(this.config.width))?e.width=String(this.config.width)+"rem":e.width="35.15rem","fill"==this.config.height?e.height="calc(100vh - var(--spc-card-footer-height) - var(--spc-card-edit-tab-height) - var(--spc-card-edit-bottom-toolbar-height))":mt(String(this.config.height))?e.height=String(this.config.height)+"rem":e.height="35.15rem",this.config.playerMinimizeOnIdle&&this.section==Qe.PLAYER&&this.store.player.isPoweredOffOrIdle()&&"fill"!=this.config.height&&(e.height="unset !important",e["min-height"]="unset !important"),e["--spc-card-edit-tab-height"]=`${t}`,e["--spc-card-edit-bottom-toolbar-height"]=`${i}`,e["--spc-player-palette-vibrant"]=`${this.vibrantColorVibrant}`,e["--spc-player-palette-muted"]=`${this.vibrantColorMuted}`,e["--spc-player-palette-darkvibrant"]=`${this.vibrantColorDarkVibrant}`,e["--spc-player-palette-darkmuted"]=`${this.vibrantColorDarkMuted}`,e["--spc-player-palette-lightvibrant"]=`${this.vibrantColorLightVibrant}`,e["--spc-player-palette-lightmuted"]=`${this.vibrantColorLightMuted}`,Me(e))}styleCardHeader(){const e={};return this.section==Qe.PLAYER&&this.footerBackgroundColor&&(e["--spc-player-footer-bg-color"]=`${this.footerBackgroundColor||"transparent"}`,e["background-color"]="var(--spc-player-footer-bg-color)",e["background-image"]="linear-gradient(rgba(0, 0, 0, 1.6), rgba(0, 0, 0, 0.6))"),Me(e)}styleCardContent(){const e={};return this.config.playerMinimizeOnIdle&&this.section==Qe.PLAYER&&this.store.player.isPoweredOffOrIdle()&&"fill"!=this.config.height&&(e.height="unset !important"),Me(e)}styleCardFooter(){const e={};this.config.playerMinimizeOnIdle&&(this.alertError||this.store.player.isPoweredOffOrIdle()&&(this.config.sections||[]).indexOf(Qe.PLAYER)>-1&&this.section==Qe.PLAYER&&(e.display="none",this.section=Qe.PLAYER,Bi.selectedConfigArea=et.PLAYER));const t=this.config.footerBackgroundColor,i=this.config.footerBackgroundImage,s=this.config.footerIconColor,r=this.config.footerIconColorSelected,o=this.config.footerIconSize;return s&&(e["--spc-footer-icon-color"]=`${s}`),r&&(e["--spc-footer-icon-color-selected"]=`${r}`),o&&(e["--spc-footer-icon-size"]=`${o}`,e["--spc-footer-icon-button-size"]="var(--spc-footer-icon-size, 1.75rem) + 0.75rem"),i&&(e["--spc-footer-background-image"]=`${i}`),t?e["--spc-footer-background-color"]=`${t}`:this.section==Qe.PLAYER&&this.vibrantColorVibrant?e["--spc-player-footer-bg-color"]=`${this.footerBackgroundColor||"transparent"}`:e.background="unset",Me(e)}checkForBackgroundImageChange(){try{if(this.isUpdateInProgressAsync)return;this.isUpdateInProgressAsync=!0;const e=this.playerImage,t=this.playerMediaContentId;if(this.isCardInEditPreview)return this.isUpdateInProgressAsync=!1,void(this.footerBackgroundColor=void 0);if(this.vibrantMediaContentId===t)return void(this.isUpdateInProgressAsync=!1);if(null==e||""==e||"BRAND_LOGO_IMAGE_BASE64"==t)return this.vibrantImage=e,this.vibrantMediaContentId=t,this.vibrantColorVibrant=void 0,this.footerBackgroundColor=this.vibrantColorVibrant,void(this.isUpdateInProgressAsync=!1);io.enabled&&io("checkForBackgroundImageChange - player content changed:\n- OLD vibrantMediaContentId = %s\n- NEW playerMediaContentId = %s\n- OLD vibrantImage = %s\n- NEW playerImage = %s\n- isCardInEditPreview = %s\n- footerBackgroundColor = %s",JSON.stringify(this.vibrantMediaContentId),JSON.stringify(t),JSON.stringify(this.vibrantImage),JSON.stringify(e),JSON.stringify(this.isCardInEditPreview),JSON.stringify(this.footerBackgroundColor));const i=new Array,s=new Promise(((i,s)=>{const r=new Image;r.crossOrigin="Anonymous",r.src=e+"?not-from-cache-please";new tt(r,{colorCount:64,quality:3}).getPalette().then((s=>{io.enabled&&io("%ccheckForBackgroundImageChange - colors found by getPalette:\n- Vibrant      = %s\n- Muted        = %s\n- DarkVibrant  = %s\n- DarkMuted    = %s\n- LightVibrant = %s\n- LightMuted   = %s","color:orange",s.Vibrant?.hex||"undefined",s.Muted?.hex||"undefined",s.DarkVibrant?.hex||"undefined",s.DarkMuted?.hex||"undefined",s.LightVibrant?.hex||"undefined",s.LightMuted?.hex||"undefined"),this.vibrantColorVibrant=s.Vibrant?.hex||void 0,this.vibrantColorMuted=s.Muted?.hex||void 0,this.vibrantColorDarkVibrant=s.DarkVibrant?.hex||void 0,this.vibrantColorDarkMuted=s.DarkMuted?.hex||void 0,this.vibrantColorLightVibrant=s.LightVibrant?.hex||void 0,this.vibrantColorLightMuted=s.LightMuted?.hex||void 0,this.vibrantImage=e,this.vibrantMediaContentId=t,this.footerBackgroundColor=this.vibrantColorVibrant,this.isUpdateInProgressAsync=!1,i(!0)})).catch((i=>{io.enabled&&io("%ccheckForBackgroundImageChange - Could not retrieve color palette info for player background image\nreason = %s",JSON.stringify(At(i))),this.vibrantColorVibrant=void 0,this.vibrantColorMuted=void 0,this.vibrantColorDarkVibrant=void 0,this.vibrantColorDarkMuted=void 0,this.vibrantColorLightVibrant=void 0,this.vibrantColorLightMuted=void 0,this.vibrantImage=e,this.vibrantMediaContentId=t,this.footerBackgroundColor=this.vibrantColorVibrant,this.isUpdateInProgressAsync=!1,this.checkForBackgroundImageChangeError("Vibrant getPalette method failed: "+At(i)),s(i)}))}));return i.push(s),void Promise.allSettled(i).finally((()=>{this.progressHide()}))}catch(e){return void this.checkForBackgroundImageChangeError("Background Image processing error: "+At(e))}}checkForBackgroundImageChangeError(e=null){this.alertInfoClear(),io.enabled&&io("%ccheckForBackgroundImageChangeError - error processing background image:\n %s","color:red",JSON.stringify(e)),this.alertErrorSet(e||"Unknown Error")}};we([Ue({attribute:!1})],ro.prototype,"hass",void 0),we([Ue({attribute:!1})],ro.prototype,"config",void 0),we([Ue({attribute:!1})],ro.prototype,"footerBackgroundColor",void 0),we([Ve()],ro.prototype,"section",void 0),we([Ve()],ro.prototype,"showLoader",void 0),we([Ve()],ro.prototype,"loaderTimestamp",void 0),we([Ve()],ro.prototype,"cancelLoader",void 0),we([Ve()],ro.prototype,"playerId",void 0),we([Ve()],ro.prototype,"playerImage",void 0),we([Ve()],ro.prototype,"playerMediaContentId",void 0),we([Ve()],ro.prototype,"vibrantImage",void 0),we([Ve()],ro.prototype,"vibrantMediaContentId",void 0),we([Ve()],ro.prototype,"vibrantColorVibrant",void 0),we([Ve()],ro.prototype,"vibrantColorMuted",void 0),we([Ve()],ro.prototype,"vibrantColorDarkVibrant",void 0),we([Ve()],ro.prototype,"vibrantColorDarkMuted",void 0),we([Ve()],ro.prototype,"vibrantColorLightVibrant",void 0),we([Ve()],ro.prototype,"vibrantColorLightMuted",void 0),we([Ne("#elmSearchMediaBrowserForm",!1)],ro.prototype,"elmSearchMediaBrowserForm",void 0),we([Ne("#elmCategoryBrowserForm",!1)],ro.prototype,"elmCategoryBrowserForm",void 0),we([Ne("#elmAlbumFavBrowserForm",!1)],ro.prototype,"elmAlbumFavBrowserForm",void 0),we([Ne("#elmArtistFavBrowserForm",!1)],ro.prototype,"elmArtistFavBrowserForm",void 0),we([Ne("#elmAudiobookFavBrowserForm",!1)],ro.prototype,"elmAudiobookFavBrowserForm",void 0),we([Ne("#elmDeviceBrowserForm",!1)],ro.prototype,"elmDeviceBrowserForm",void 0),we([Ne("#elmEpisodeFavBrowserForm",!1)],ro.prototype,"elmEpisodeFavBrowserForm",void 0),we([Ne("#elmPlaylistFavBrowserForm",!1)],ro.prototype,"elmPlaylistFavBrowserForm",void 0),we([Ne("#elmRecentBrowserForm",!1)],ro.prototype,"elmRecentBrowserForm",void 0),we([Ne("#elmShowFavBrowserForm",!1)],ro.prototype,"elmShowFavBrowserForm",void 0),we([Ne("#elmTrackFavBrowserForm",!1)],ro.prototype,"elmTrackFavBrowserForm",void 0),we([Ne("#elmUserPresetBrowserForm",!1)],ro.prototype,"elmUserPresetBrowserForm",void 0),ro=we([xe("spotifyplus-card")],ro),console.groupCollapsed(`%cSPOTIFYPLUS-CARD ${ae} IS INSTALLED`,"color: green; font-weight: bold"),console.log("SpotifyPlus Card Wiki Docs:","https://github.com/thlucas1/spotifyplus_card/wiki/Configuration-Options"),console.log("SpotifyPlus Integration Wiki Docs:","https://github.com/thlucas1/homeassistantcomponent_spotifyplus/wiki"),console.log("SpotifyPlus Card Debug Logging Console Commands:\n","- enable:  localStorage.setItem('debug', 'spotifyplus-card:*');\n","- disable: localStorage.setItem('debug', '');"),console.groupEnd(),window.customCards.push({type:"spotifyplus-card",name:"SpotifyPlus Card",description:"Home Assistant UI card that supports features unique to the SpotifyPlus custom integration",preview:!0});
//# sourceMappingURL=spotifyplus_card.js.map
