function e(e,t,i,o){var r,s=arguments.length,n=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(n=(s<3?r(n):s>3?r(t,i,n):r(t,i))||n);return s>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),r=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new s(i,e,o)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:l,defineProperty:h,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,m=globalThis,f=m.trustedTypes,g=f?f.emptyScript:"",v=m.reactiveElementPolyfillSupport,y=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},$=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:$};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let k=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&h(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:r}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const s=o?.call(this);r?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=p(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...d(e),...u(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,o)=>{if(i)e.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of o){const o=document.createElement("style"),r=t.litNonce;void 0!==r&&o.setAttribute("nonce",r),o.textContent=i.cssText,e.appendChild(o)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(o):this.setAttribute(o,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=o;const s=r.fromAttribute(t,e.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(e,t,i,o=!1,r){if(void 0!==e){const s=this.constructor;if(!1===o&&(r=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??$)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:r},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==r||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[y("elementProperties")]=new Map,k[y("finalized")]=new Map,v?.({ReactiveElement:k}),(m.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,_=e=>e,z=x.trustedTypes,T=z?z.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+C,S=`<${M}>`,E=document,P=()=>E.createComment(""),D=e=>null===e||"object"!=typeof e&&"function"!=typeof e,L=Array.isArray,I="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,H=/>/g,U=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,F=/"/g,B=/^(?:script|style|textarea|title)$/i,j=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),V=j(1),W=j(2),Z=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),q=new WeakMap,K=E.createTreeWalker(E,129);function X(e,t){if(!L(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(t):t}const Y=(e,t)=>{const i=e.length-1,o=[];let r,s=2===t?"<svg>":3===t?"<math>":"",n=N;for(let t=0;t<i;t++){const i=e[t];let a,l,h=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===N?"!--"===l[1]?n=O:void 0!==l[1]?n=H:void 0!==l[2]?(B.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=U):void 0!==l[3]&&(n=U):n===U?">"===l[0]?(n=r??N,h=-1):void 0===l[1]?h=-2:(h=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?U:'"'===l[3]?F:R):n===F||n===R?n=U:n===O||n===H?n=N:(n=U,r=void 0);const d=n===U&&e[t+1].startsWith("/>")?" ":"";s+=n===N?i+S:h>=0?(o.push(a),i.slice(0,h)+A+i.slice(h)+C+d):i+C+(-2===h?t:d)}return[X(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class J{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let r=0,s=0;const n=e.length-1,a=this.parts,[l,h]=Y(e,t);if(this.el=J.createElement(l,i),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=K.nextNode())&&a.length<n;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(A)){const t=h[s++],i=o.getAttribute(e).split(C),n=/([.?@])?(.*)/.exec(t);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?oe:"?"===n[1]?re:"@"===n[1]?se:ie}),o.removeAttribute(e)}else e.startsWith(C)&&(a.push({type:6,index:r}),o.removeAttribute(e));if(B.test(o.tagName)){const e=o.textContent.split(C),t=e.length-1;if(t>0){o.textContent=z?z.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],P()),K.nextNode(),a.push({type:2,index:++r});o.append(e[t],P())}}}else if(8===o.nodeType)if(o.data===M)a.push({type:2,index:r});else{let e=-1;for(;-1!==(e=o.data.indexOf(C,e+1));)a.push({type:7,index:r}),e+=C.length-1}r++}}static createElement(e,t){const i=E.createElement("template");return i.innerHTML=e,i}}function Q(e,t,i=e,o){if(t===Z)return t;let r=void 0!==o?i._$Co?.[o]:i._$Cl;const s=D(t)?void 0:t._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),void 0===s?r=void 0:(r=new s(e),r._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=r:i._$Cl=r),void 0!==r&&(t=Q(e,r._$AS(e,t.values),r,o)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??E).importNode(t,!0);K.currentNode=o;let r=K.nextNode(),s=0,n=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new te(r,r.nextSibling,this,e):1===a.type?t=new a.ctor(r,a.name,a.strings,this,e):6===a.type&&(t=new ne(r,this,e)),this._$AV.push(t),a=i[++n]}s!==a?.index&&(r=K.nextNode(),s++)}return K.currentNode=E,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),D(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==Z&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>L(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new ee(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new J(e)),t}k(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const r of e)o===t.length?t.push(i=new te(this.O(P()),this.O(P()),this,this.options)):i=t[o],i._$AI(r),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=_(e).nextSibling;_(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,r){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(e,t=this,i,o){const r=this.strings;let s=!1;if(void 0===r)e=Q(this,e,t,0),s=!D(e)||e!==this._$AH&&e!==Z,s&&(this._$AH=e);else{const o=e;let n,a;for(e=r[0],n=0;n<r.length-1;n++)a=Q(this,o[i+n],t,n),a===Z&&(a=this._$AH[n]),s||=!D(a)||a!==this._$AH[n],a===G?e=G:e!==G&&(e+=(a??"")+r[n+1]),this._$AH[n]=a}s&&!o&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class oe extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}class re extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}}class se extends ie{constructor(e,t,i,o,r){super(e,t,i,o,r),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??G)===Z)return;const i=this._$AH,o=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==G&&(i===G||o);o&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const ae=x.litHtmlPolyfillSupport;ae?.(J,te),(x.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let he=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let r=o._$litPart$;if(void 0===r){const e=i?.renderBefore??null;o._$litPart$=r=new te(t.insertBefore(P(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}};he._$litElement$=!0,he.finalized=!0,le.litElementHydrateSupport?.({LitElement:he});const ce=le.litElementPolyfillSupport;ce?.({LitElement:he}),(le.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ue={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:$},pe=(e=ue,t,i)=>{const{kind:o,metadata:r}=i;let s=globalThis.litPropertyMetadata.get(r);if(void 0===s&&globalThis.litPropertyMetadata.set(r,s=new Map),"setter"===o&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===o){const{name:o}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(o,r,e,!0,i)},init(t){return void 0!==t&&this.C(o,void 0,e,t),t}}}if("setter"===o){const{name:o}=i;return function(i){const r=this[o];t.call(this,i),this.requestUpdate(o,r,e,!0,i)}}throw Error("Unsupported decorator location: "+o)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function me(e){return(t,i)=>"object"==typeof i?pe(e,t,i):((e,t,i)=>{const o=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),o?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function fe(e){return me({...e,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let ge=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ve={},ye=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends ge{constructor(){super(...arguments),this.ot=ve}render(e,t){return t()}update(e,[t,i]){if(Array.isArray(t)){if(Array.isArray(this.ot)&&this.ot.length===t.length&&t.every((e,t)=>e===this.ot[t]))return Z}else if(this.ot===t)return Z;return this.ot=Array.isArray(t)?Array.from(t):t,this.render(t,i)}});function be(e,t,i){return Math.max(t,Math.min(i,e))}function $e(e,t){if(null==e)return t;const i="number"==typeof e?e:Number(e);return Number.isFinite(i)?i:t}function we(e){if(e)try{return new Intl.DateTimeFormat(e),e}catch{return void console.warn(`geo-clock-card: invalid locale "${e}" — using the browser default`)}}function ke(e){if("string"!=typeof e)return;const t=e.trim();return/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t)||/^(?:rgb|rgba|hsl|hsla)\([\d.,%\s/]+\)$/i.test(t)||/^[a-z]+$/i.test(t)?t:void 0}const xe=Math.PI/180,_e=180/Math.PI,ze=Date.UTC(2e3,0,1,12,0,0),Te=e=>((e+180)%360+360)%360-180;function Ae(e){const t=(e.getTime()-ze)/864e5,i=280.46+.9856474*t,o=(357.528+.9856003*t)*xe,r=(i+1.915*Math.sin(o)+.02*Math.sin(2*o))*xe,s=(23.439-4e-7*t)*xe,n=Math.asin(Math.sin(s)*Math.sin(r))*_e,a=Math.atan2(Math.cos(s)*Math.sin(r),Math.cos(r))*_e,l=Te(i-a),h=e.getUTCHours()+e.getUTCMinutes()/60+e.getUTCSeconds()/3600+e.getUTCMilliseconds()/36e5;return{lat:n,lon:Te(-15*(h-12)-l)}}function Ce(e,t,i){return function(e,t,i){const o=e*xe,r=i.lat*xe,s=(t-i.lon)*xe;return Math.asin(Math.sin(o)*Math.sin(r)+Math.cos(o)*Math.cos(r)*Math.cos(s))*_e}(e,t,i)>0}const Me=Math.PI/180,Se=180/Math.PI,Ee=1e-4;function Pe(e,t,i,o,r=180){return{x:((t-(r-180))%360+360)%360/360*i,y:(90-e)/180*o}}function De(e,t,i){const o=[];for(const[r,s]of e){const e=r/360*t,n=(90-s)/180*i;o.push(`${e.toFixed(2)},${n.toFixed(2)}`)}return o.join(" ")}const Le=44;function Ie(e,t,i=180){const o=function(e,t,i=180){const o=e.getUTCHours()+e.getUTCMinutes()/60+e.getUTCSeconds()/3600,r=t/24,s=i-180,n=[];for(let e=0;e<=24;e++){const t=s+15*e;let i=t/15;for(;i>12;)i-=24;for(;i<=-12;)i+=24;const a=Math.round(((o+t/15)%24+24)%24)%24;n.push({offset:i,realLon:t,centerX:e*r,hour12:(a+11)%12+1,isNoon:12===a,isMidnight:0===a})}return n}(e,t,i),r=t/24,s=[];for(let e=1;e<24;e++)s.push(e*r);return W`
    <g class="tz-band">
      <rect class="tz-bg"
            x="0" y="${-44}"
            width="${t}" height="${Le}"/>

      ${o.map(e=>W`
        <text class="tz-hour${e.isNoon?" noon":""}${e.isMidnight?" mid":""}"
              x="${e.centerX}" y="${-21}"
              text-anchor="middle" dominant-baseline="central">${e.hour12}</text>`)}

      ${s.map(e=>W`
        <line class="tz-tick"
              x1="${e}" y1="${0}"
              x2="${e}" y2="${12}"/>`)}
    </g>
  `}let Ne=null,Oe=null;function He(e,t,i,o=180){if(e.length<3)return"";const r=o-180,s=[];let n=null,a=1/0,l=-1/0;for(const[o,h]of e){let e=((o-r)%360+360)%360;if(null!==n){for(;e-n>180;)e-=360;for(;e-n<-180;)e+=360}n=e;const c=e/360*t,d=(90-h)/180*i;s.push([c,d]),c<a&&(a=c),c>l&&(l=c)}const h=s,c=e=>{let t="";for(let i=0;i<h.length;i++){const[o,r]=h[i];t+=`${0===i?"M":"L"}${(o+e).toFixed(1)},${r.toFixed(1)}`}return t+"Z"};let d=c(0);return l>t&&(d+=c(-t)),a<0&&(d+=c(t)),d}function Ue(e,t,i){let o=!1;for(let r=0,s=e.length-1;r<e.length;s=r++){const n=e[r][0],a=e[r][1],l=e[s][0],h=e[s][1];a>i!=h>i&&t<(l-n)*(i-a)/(h-a||Number.EPSILON)+n&&(o=!o)}return o}function Re(e){const t=e.split("/");return t.length<2?e:t[t.length-1].replace(/_/g," ")}const Fe=new Map;function Be(e,t,i){const o=function(e,t){const i=`${e}|${Array.isArray(t)?t.join(","):t??""}`;let o=Fe.get(i);return o||(o={time:new Intl.DateTimeFormat(t,{timeZone:e,hour:"numeric",minute:"2-digit",second:"2-digit"}),date:new Intl.DateTimeFormat(t,{timeZone:e,weekday:"short",month:"short",day:"numeric"}),zoneName:new Intl.DateTimeFormat(t,{timeZone:e,hour:"numeric",timeZoneName:"long"}),offset:new Intl.DateTimeFormat("en-US",{timeZone:e,timeZoneName:"longOffset"})},Fe.set(i,o)),o}(t,i),r=(e,t)=>e.find(e=>e.type===t)?.value??"",s=o.zoneName.formatToParts(e),n=o.offset.formatToParts(e);return{time:o.time.format(e),date:o.date.format(e),name:r(s,"timeZoneName"),offset:r(n,"timeZoneName").replace(/^GMT/,"UTC")}}let je=null,Ve=null;function We(e,t){if(t&&/^UTC[+−\-]\d/.test(t))return t;const i=e>=0?"+":"-",o=Math.abs(e);return`UTC${i}${String(Math.trunc(o)).padStart(2,"0")}:${String(Math.round(60*(o-Math.trunc(o)))).padStart(2,"0")}`}function Ze(e){const t=e.trim();return t.length<=80?t:t.slice(0,77)+"…"}var Ge;const qe=2048,Ke=1024;let Xe=class extends he{constructor(){super(...arguments),this.displayNow=new Date,this.mapNow=new Date,this.tzPolygons=null,this.tzIanaPolygons=null,this.tzPolygonsCenterLon=null,this.tzData=null,this.tzIanaData=null,this.ianaTzCache=new Map,this.hoveredIana=null,this.hoveredOffset=null,this.hoveredMarker=null,this.hoverPos=null,this.terminatorCache=null,this.hoverPosPending=null,this.hoverPosRaf=0,this.isCardVisible=!0,this.intersecting=!0,this.warnedFallback="",this.onIanaEnter=(e,t)=>{this.clearDismissTimer(),this.hoveredIana=t,this.updateHoverPos(e),"touch"===e.pointerType&&this.armTouchAutoDismiss()},this.onIanaLeave=e=>{"touch"!==e.pointerType?(this.hoveredIana=null,this.hoveredOffset||this.hoveredMarker||(this.hoverPos=null)):this.scheduleTouchDismiss(()=>{this.hoveredIana=null,this.hoveredOffset||this.hoveredMarker||(this.hoverPos=null)})},this.onOffsetEnter=(e,t)=>{this.clearDismissTimer(),this.hoveredOffset=t,this.updateHoverPos(e),"touch"===e.pointerType&&this.armTouchAutoDismiss()},this.onOffsetLeave=e=>{"touch"!==e.pointerType?(this.hoveredOffset=null,this.hoveredIana||this.hoveredMarker||(this.hoverPos=null)):this.scheduleTouchDismiss(()=>{this.hoveredOffset=null,this.hoveredIana||this.hoveredMarker||(this.hoverPos=null)})},this.onZoneMove=e=>{this.updateHoverPos(e)},this.onMarkerEnter=(e,t)=>{this.clearDismissTimer(),this.hoveredMarker=t,this.updateHoverPos(e),"touch"===e.pointerType&&this.armTouchAutoDismiss()},this.onMarkerLeave=e=>{"touch"!==e.pointerType?(this.hoveredMarker=null,this.hoveredIana||this.hoveredOffset||(this.hoverPos=null)):this.scheduleTouchDismiss(()=>{this.hoveredMarker=null,this.hoveredIana||this.hoveredOffset||(this.hoverPos=null)})}}static{Ge=this}static{this.styles=n`
    :host {
      display: block;
      background: var(--ha-card-background, var(--card-background-color, #111));
      border-radius: var(--ha-card-border-radius, 12px);
      overflow: hidden;
      color: var(--primary-text-color, #fff);
      --geo-tz-bg: rgba(8, 14, 28, 0.85);
      --geo-tz-hour: #d8e2f0;
      --geo-tz-noon: #ffd866;
      --geo-tz-mid: #6ab0ff;
      --geo-tz-tick: rgba(255, 255, 255, 0.35);
      --geo-tz-line: rgba(255, 255, 255, 0.18);
      --geo-tz-line-width: 1;
      --geo-home-marker: var(--accent-color, #ff7a3d);
      --geo-marker-color: #3da9fc;
      --geo-day-brightness: 1.15;
      --geo-night-contrast: 1;
      --geo-twilight-color: #463701;
      --geo-twilight-opacity: 0.26;
    }
    .day-image {
      filter: brightness(var(--geo-day-brightness));
    }
    .night-image {
      filter: contrast(var(--geo-night-contrast));
    }
    /* Warm sunrise/sunset glow stroked along the terminator great
       circle. Blurred + screen-blended so it brightens the day side
       without dimming the night side. */
    .twilight-glow {
      fill: none;
      stroke: var(--geo-twilight-color);
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: var(--geo-twilight-opacity);
      mix-blend-mode: screen;
      pointer-events: none;
    }
    .frame {
      position: relative;
      width: 100%;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    .readout {
      position: absolute;
      bottom: 10px;
      left: 14px;
      font-family: var(--paper-font-headline_-_font-family, system-ui, sans-serif);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
      line-height: 1.15;
    }
    .local-time {
      font-size: clamp(1rem, 2.4vw, 1.7rem);
      font-weight: 500;
    }
    .utc-time {
      font-size: clamp(0.75rem, 1.4vw, 1rem);
      color: #ffd866;
      opacity: 0.92;
    }
    .date {
      position: absolute;
      bottom: 10px;
      right: 14px;
      font-family: var(--paper-font-headline_-_font-family, system-ui, sans-serif);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
      font-size: clamp(0.85rem, 1.6vw, 1.15rem);
    }

    /* Hour band */
    .tz-bg {
      fill: var(--geo-tz-bg);
    }
    .tz-hour {
      fill: var(--geo-tz-hour);
      font-family: var(--paper-font-headline_-_font-family, system-ui, sans-serif);
      font-weight: 500;
      font-size: 26px;
    }
    .tz-hour.noon {
      fill: var(--geo-tz-noon);
      font-weight: 700;
    }
    .tz-hour.mid {
      fill: var(--geo-tz-mid);
      font-weight: 600;
    }
    .tz-tick {
      stroke: var(--geo-tz-tick);
      stroke-width: 1;
    }

    /* Time-zone boundary overlay — visible offset boundaries with a
       transparent fill so the polygon interior is hit-testable.
       Renders BELOW the IANA layer; IANA captures hover where it
       has coverage (land), and we fall back to this layer's hover
       in the gaps (open ocean, polar strips). */
    .tz-region {
      fill: rgba(255, 255, 255, 0);
      stroke: var(--geo-tz-line);
      stroke-width: var(--geo-tz-line-width);
      stroke-linejoin: round;
      stroke-linecap: round;
      pointer-events: visiblePainted;
      cursor: default;
      transition: fill 120ms ease;
    }
    .tz-region:hover {
      fill: rgba(255, 255, 255, 0.05);
    }
    /* Bands shown as pure chrome (showTimezoneRegions on, hover/popup
       off): no hit-testing, no hover tint. This compound selector
       outranks the bare .tz-region pointer-events rule above, which a
       presentation attribute alone would NOT (CSS beats attributes). */
    .tz-region.is-inert {
      pointer-events: none;
    }
    .tz-region.is-inert:hover {
      fill: rgba(255, 255, 255, 0);
    }
    /* Invisible IANA hit-test layer — tagged with each region's IANA
       tzid so the popup can ask Intl.DateTimeFormat for DST-aware
       local time. Faint tint on hover gives visual feedback that
       the user is over an interactive region. */
    .tz-iana-region {
      fill: rgba(255, 255, 255, 0);
      stroke: rgba(255, 255, 255, 0);
      stroke-width: 0;
      pointer-events: visiblePainted;
      cursor: default;
      transition: fill 120ms ease, stroke 120ms ease, stroke-width 120ms ease;
    }
    .tz-iana-region:hover,
    .tz-iana-region.is-active {
      fill: rgba(255, 255, 255, 0.08);
      stroke: rgba(255, 255, 255, 0.65);
      stroke-width: 1.5;
    }
    /* Home marker — overlay sibling of the SVG, same shape/CSS as
       a regular marker but coloured via the home-specific theme
       variable so users can restyle without touching card config.
       The selector specificity (.home-marker .marker-halo /
       .marker-dot) beats the bare .marker-halo / .marker-dot rules
       above, so the home marker uses --geo-home-marker rather than
       --geo-marker-color. The dot is non-interactive (no popup);
       the label is rendered inline when showHomeMarkerLabel is true. */
    .home-marker .marker-halo,
    .home-marker .marker-dot {
      background: var(--geo-home-marker);
    }
    .home-marker .marker-dot {
      pointer-events: none;
      cursor: default;
    }
    /* User-configured location markers. Rendered as HTML overlay
       (not SVG) so their dot, halo, and label keep a constant CSS
       pixel size regardless of the card's rendered width — SVG
       <text> and circle radii live in viewBox units and shrink
       linearly with the card, which made labels illegible at any
       size below full-screen. The marker container itself is
       positioned in percent (so it tracks the map's drift) but
       its children are sized in px. */
    .marker {
      position: absolute;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 3;
    }
    .marker-halo {
      position: absolute;
      width: 36px;
      height: 36px;
      left: -18px;
      top: -18px;
      border-radius: 50%;
      opacity: 0.22;
      pointer-events: none;
      /* Default fill — themes override via --geo-marker-color, and
         per-marker overrides via inline style still win because the
         element-level style attribute beats a host-scope variable. */
      background: var(--geo-marker-color);
    }
    .marker-dot {
      position: absolute;
      width: 14px;
      height: 14px;
      left: -7px;
      top: -7px;
      border-radius: 50%;
      border: 1.2px solid rgba(0, 0, 0, 0.7);
      box-sizing: border-box;
      pointer-events: auto;
      cursor: default;
      transition: transform 120ms ease;
      background: var(--geo-marker-color);
    }
    .marker.is-active .marker-dot {
      transform: scale(1.3);
    }
    .marker-text {
      position: absolute;
      top: 9px;
      left: 0;
      transform: translateX(-50%);
      text-align: center;
      white-space: nowrap;
      pointer-events: none;
      font-family: var(--paper-font-headline_-_font-family, system-ui, sans-serif);
      /* Multi-direction shadow gives a readable outline against
         either bright daylight or dark city-lights imagery without
         the cost of a true SVG paint-order stroke. */
      text-shadow:
        0 1px 2px rgba(0, 0, 0, 0.95),
        0 0 3px rgba(0, 0, 0, 0.85),
        0 0 6px rgba(0, 0, 0, 0.6);
      color: #fff;
    }
    .marker-label {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.15;
    }
    .marker-time {
      font-size: 12px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      line-height: 1.15;
      margin-top: 1px;
    }
    /* Custom popup. Positioned via inline transform from JS so it
       follows the cursor; ignores its own pointer events so it never
       steals hover from the underlying region. */
    .tz-popup {
      position: absolute;
      left: 0;
      top: 0;
      pointer-events: none;
      background: rgba(8, 14, 28, 0.92);
      color: var(--primary-text-color, #fff);
      border-radius: 8px;
      padding: 8px 12px;
      font-family: var(--paper-font-headline_-_font-family, system-ui, sans-serif);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.55);
      max-width: 280px;
      z-index: 5;
    }
    .tz-popup-time {
      font-size: 1.15rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    .tz-popup-date {
      font-size: 0.78rem;
      opacity: 0.78;
      margin-top: 1px;
    }
    .tz-popup-name {
      font-size: 0.9rem;
      color: #ffd866;
      font-weight: 600;
      margin-top: 2px;
    }
    .tz-popup-city {
      font-size: 0.82rem;
      opacity: 0.92;
      margin-top: 1px;
    }
    .tz-popup-offset {
      font-size: 0.72rem;
      opacity: 0.62;
      margin-top: 4px;
      font-variant-numeric: tabular-nums;
    }
    .tz-popup-places {
      font-size: 0.72rem;
      opacity: 0.62;
      margin-top: 3px;
      line-height: 1.3;
    }
  `}setConfig(e){if(!e)throw new Error("geo-clock-card: missing config");const t=function(e,t){if("string"==typeof e&&0!==e.length)try{const i=new URL(e,t),o="undefined"!=typeof location?location.protocol:"https:";return"https:"===i.protocol||"http:"===i.protocol||i.protocol===o?i.href:void 0}catch{return}}(e.imageryBase,import.meta.url)??new URL(".",import.meta.url).href,i=function(e){if(null==e)return;const t=e instanceof Date?e:new Date(e);return Number.isFinite(t.getTime())?t:void 0}(e.now);this.config={twilightDegrees:be($e(e.twilightDegrees,8),1,18),updateInterval:be($e(e.updateInterval,1),1,600),showUTC:e.showUTC??!0,showTimezoneBand:e.showTimezoneBand??!0,showTimezoneBoundaries:e.showTimezoneBoundaries??!0,showTimezoneRegions:e.showTimezoneRegions??e.showTimezoneBoundaries??!0,showTimezonePopup:e.showTimezonePopup??!0,timezoneLineColor:ke(e.timezoneLineColor)??"rgba(255, 255, 255, 0.18)",dayBrightness:be($e(e.dayBrightness,1.15),0,5),nightContrast:be($e(e.nightContrast,1),0,5),twilightColor:ke(e.twilightColor)??"#463701",twilightOpacity:be($e(e.twilightOpacity,.26),0,1),imageryBase:t.endsWith("/")?t:t+"/",center:e.center??"sun",centerLongitude:Number.isFinite(e.centerLongitude)?be(e.centerLongitude,-180,180):void 0,centerEntity:e.centerEntity,showHomeMarker:e.showHomeMarker??!1,showHomeMarkerLabel:e.showHomeMarkerLabel??!1,markers:Je(e.markers),markerLabelMode:"hover"===e.markerLabelMode?"hover":"always",markerColor:ke(e.markerColor),markerDayColor:ke(e.markerDayColor),markerNightColor:ke(e.markerNightColor),markerShowDay:e.markerShowDay??!0,mainTimeSource:Qe(e.mainTimeSource),mainTimeEntity:e.mainTimeEntity,locale:we(e.locale||void 0),frozenNow:i};const o=i??new Date;this.displayNow=o,this.mapNow=o,this.ianaTzCache.clear(),this.tzPolygons=null,this.tzIanaPolygons=null,this.tzPolygonsCenterLon=null,this.restartTimer(),this.maybeLoadTimezones(),this.maybeLoadIanaTimezones()}connectedCallback(){if(super.connectedCallback(),!this.config?.frozenNow){const e=new Date;this.displayNow=e,this.mapNow=e}this.attachVisibilityObservers(),this.restartTimer(),this.maybeLoadTimezones(),this.maybeLoadIanaTimezones()}disconnectedCallback(){super.disconnectedCallback(),this.stopTimer(),this.clearDismissTimer(),this.clearIdleTimer(),this.detachVisibilityObservers(),this.hoverPosRaf&&(cancelAnimationFrame(this.hoverPosRaf),this.hoverPosRaf=0)}attachVisibilityObservers(){"undefined"==typeof IntersectionObserver||this.intersectionObserver||(this.intersectionObserver=new IntersectionObserver(e=>{const t=e[e.length-1];this.intersecting=!t||t.isIntersecting,this.recomputeVisibility()},{threshold:0}),this.intersectionObserver.observe(this)),"undefined"==typeof document||this.onTabVisibility||(this.onTabVisibility=()=>this.recomputeVisibility(),document.addEventListener("visibilitychange",this.onTabVisibility))}detachVisibilityObservers(){this.intersectionObserver?.disconnect(),this.intersectionObserver=void 0,this.onTabVisibility&&"undefined"!=typeof document&&document.removeEventListener("visibilitychange",this.onTabVisibility),this.onTabVisibility=void 0}recomputeVisibility(){const e="undefined"==typeof document||"hidden"!==document.visibilityState,t=this.intersecting&&e;if(t!==this.isCardVisible){if(this.isCardVisible=t,t){const e=new Date;this.displayNow=e,this.mapNow=e}this.restartTimer()}}restartTimer(){if(this.stopTimer(),!this.config||!this.isConnected)return;if(this.config.frozenNow)return;const e=this.isCardVisible?1e3*this.config.updateInterval:18e5;this.timer=setInterval(()=>this.tick(),e)}tick(){const e=new Date;this.displayNow=e,Math.abs(e.getTime()-this.mapNow.getTime())>=10546.875&&(this.mapNow=e)}stopTimer(){void 0!==this.timer&&(clearInterval(this.timer),this.timer=void 0)}maybeLoadTimezones(){if(!this.config?.showTimezoneRegions||null!==this.tzData)return;(function(e){if(je&&Ve===e)return je;Ve=e;const t=fetch(e).then(e=>{if(!e.ok)throw new Error(`tz fetch failed: ${e.status}`);return e.json()}).catch(e=>{throw je===t&&(je=null,Ve=null),e});return je=t,t})(this.config.imageryBase+"timezones.json").then(e=>{this.tzData=e,this.requestUpdate()}).catch(e=>{console.warn("geo-clock-card: timezone overlay failed to load:",e)})}maybeLoadIanaTimezones(){if(!this.config||null!==this.tzIanaData)return;const e=this.config.markers.length>0,t="entity"===this.config.mainTimeSource,i="home"===this.config.mainTimeSource&&"string"!=typeof this.hass?.config?.time_zone;if(!(this.config.showTimezoneBoundaries||e||t||i))return;(function(e){if(Ne&&Oe===e)return Ne;Oe=e;const t=fetch(e).then(e=>{if(!e.ok)throw new Error(`iana tz fetch failed: ${e.status}`);return e.json()}).catch(e=>{throw Ne===t&&(Ne=null,Oe=null),e});return Ne=t,t})(this.config.imageryBase+"timezones-iana.json").then(e=>{this.tzIanaData=e,this.ianaTzCache.clear(),this.requestUpdate()}).catch(e=>{console.warn("geo-clock-card: IANA timezone overlay failed to load:",e)})}static{this.FALLBACK_CENTER_LON=0}resolveCenterLon(e){if(!this.config)return Ae(e).lon;switch(this.config.center){case"home":{const e=this.hass?.config?.longitude;return"number"==typeof e?e:(this.warnFallback("home","hass.config.longitude is not set; falling back to Greenwich (0°)"),Ge.FALLBACK_CENTER_LON)}case"longitude":return"number"==typeof this.config.centerLongitude?this.config.centerLongitude:(this.warnFallback("longitude","centerLongitude not set; falling back to Greenwich (0°)"),Ge.FALLBACK_CENTER_LON);case"entity":{const e=this.config.centerEntity,t=e?this.hass?.states?.[e]:void 0,i=t?.attributes?.longitude;return"number"==typeof i?i:(this.warnFallback("entity",e?`entity '${e}' has no numeric longitude attribute; falling back to Greenwich (0°)`:"centerEntity not set; falling back to Greenwich (0°)"),Ge.FALLBACK_CENTER_LON)}default:return Ae(e).lon}}warnFallback(e,t){const i=`${e}|${t}`;this.warnedFallback!==i&&(this.warnedFallback=i,console.warn(`geo-clock-card: center mode '${e}' — ${t}`))}resolveHomeLatLon(){const e=this.hass?.config?.latitude,t=this.hass?.config?.longitude;return"number"!=typeof e||"number"!=typeof t?null:{lat:e,lon:t}}lookupIanaTz(e,t){if(!this.tzIanaData)return null;const i=`${e.toFixed(2)},${t.toFixed(2)}`;let o=this.ianaTzCache.get(i);return void 0===o&&(o=function(e,t,i){if("number"!=typeof t||"number"!=typeof i||!Number.isFinite(t)||!Number.isFinite(i))return null;const o=((i+180)%360+360)%360-180;for(const i of e.features){const e="Polygon"===i.geometry.type?[i.geometry.coordinates]:i.geometry.coordinates;for(const r of e)if(0!==r.length&&Ue(r[0],o,t))return i.properties.tzid}return null}(this.tzIanaData,e,t),this.ianaTzCache.size>=512&&this.ianaTzCache.clear(),this.ianaTzCache.set(i,o)),o}resolveMainTimezone(){if(this.config)switch(this.config.mainTimeSource){case"device":return;case"home":{const e=this.hass?.config?.time_zone;if("string"==typeof e&&e)return e;const t=this.resolveHomeLatLon();return t&&this.tzIanaData?this.lookupIanaTz(t.lat,t.lon)??void 0:void 0}case"entity":{const e=this.config.mainTimeEntity,t=e?this.hass?.states?.[e]:void 0,i=t?.attributes?.latitude,o=t?.attributes?.longitude;return"number"==typeof i&&"number"==typeof o&&this.tzIanaData?this.lookupIanaTz(i,o)??void 0:void 0}}}resolveMarkers(){if(!this.config||0===this.config.markers.length)return[];const e=[];for(const t of this.config.markers){const i=this.hass?.states?.[t.entity];if(!i)continue;const o=i.attributes?.latitude,r=i.attributes?.longitude;if("number"!=typeof o||"number"!=typeof r)continue;const s="string"==typeof i.attributes?.friendly_name?i.attributes.friendly_name:t.entity,n="string"==typeof t.label&&t.label.trim()||s,a=this.lookupIanaTz(o,r);e.push({entity:t.entity,label:n,color:ke(t.color)??this.config.markerColor,dayColor:ke(t.dayColor)??this.config.markerDayColor,nightColor:ke(t.nightColor)??this.config.markerNightColor,lat:o,lon:r,tzid:a})}return e}terminatorGeometry(e,t){const i=e.getTime(),o=this.terminatorCache;if(o&&o.mapNowMs===i&&o.centerLon===t)return o;const r=Ae(e),s=function(e,t={}){const i=t.stepDeg??1,o=(t.centerLon??180)-180;let r=e.lat;Math.abs(r)<Ee&&(r=r>=0?Ee:-1e-4);const s=Math.tan(r*Me),n=[];for(let t=0;t<=360;t+=i){const i=(o+t-e.lon)*Me,r=Math.atan(-Math.cos(i)/s)*Se;n.push([t,r])}return n}(r,{centerLon:t}),n=r.lat>=0?-90:90,a=s.slice(0,-1),l=[...a.map(([e,t])=>[e-360,t]),...a,...s.map(([e,t])=>[e+360,t])],h={mapNowMs:i,centerLon:t,points:De([...a.slice(a.length-45).map(([e,t])=>[e-360,t]),...a.map(([e,t])=>[e,t]),...s.slice(0,46).map(([e,t])=>[e+360,t]),[405,n],[-45,n]],qe,Ke),curvePoints:De(l,qe,Ke)};return this.terminatorCache=h,h}render(){if(!this.config)return V``;const e=this.config.frozenNow??this.mapNow,t=this.config.frozenNow??this.displayNow,i=this.resolveCenterLon(e),o=Ae(e),{points:r,curvePoints:s}=this.terminatorGeometry(e,i),n=2*this.config.twilightDegrees*Ke/180,a=Math.max(.5,n/8),l=Math.max(4,.55*n),h=Math.max(1,n/5),c=this.config.imageryBase+function(e){const t=e.getUTCDate();let i,o=e.getUTCMonth()+1;return t<8?i="start":t<23?i="mid":(i="start",o=12===o?1:o+1),`blue-marble-${String(o).padStart(2,"0")}-${i}-2048.jpg`}(e),d=this.config.imageryBase+"black-marble-2048.jpg",u=(-i/360*qe%qe+qe)%qe;let p=0;if(this.config.showTimezoneRegions||this.config.showTimezoneBoundaries){const e=this.tzPolygonsCenterLon,t=null===e||Math.abs(e-i)>.5,o=t?i:e??i;this.tzData&&(t||null===this.tzPolygons)&&(this.tzPolygons=function(e,t,i,o=180){const r=[];for(const s of e.features){const e="Polygon"===s.geometry.type?[s.geometry.coordinates]:s.geometry.coordinates;let n="";for(const r of e)0!==r.length&&(n+=He(r[0],t,i,o));n&&r.push({offset:s.properties.zone,offsetLabel:We(s.properties.zone,s.properties.time_zone),name:s.properties.name??null,places:Ze(s.properties.places??""),d:n})}return r}(this.tzData,qe,Ke,o)),this.tzIanaData&&(t||null===this.tzIanaPolygons)&&(this.tzIanaPolygons=function(e){const t=e=>{let t=1/0,i=1/0,o=-1/0,r=-1/0;const s=/[ML]([\d.\-]+),([\d.\-]+)/g;let n;for(;n=s.exec(e);){const e=parseFloat(n[1]),s=parseFloat(n[2]);e<t&&(t=e),e>o&&(o=e),s<i&&(i=s),s>r&&(r=s)}return isFinite(t)?(o-t)*(r-i):0};return[...e].sort((e,i)=>t(i.d)-t(e.d))}(function(e,t,i,o=180){const r=[];for(const s of e.features){const e="Polygon"===s.geometry.type?[s.geometry.coordinates]:s.geometry.coordinates;let n="";for(const r of e)0!==r.length&&(n+=He(r[0],t,i,o));n&&r.push({tzid:s.properties.tzid,cityLabel:Re(s.properties.tzid),d:n})}return r}(this.tzIanaData,qe,Ke,o))),this.tzPolygonsCenterLon=o,p=(o-i)/360*qe}const m=this.resolveMainTimezone(),f=function(e,t,i){return e.toLocaleTimeString(i,{hour:"numeric",minute:"2-digit",second:"2-digit",timeZoneName:"short",...t?{timeZone:t}:{}})}(t,m,this.config.locale),g=function(e){const t=String(e.getUTCHours()).padStart(2,"0"),i=String(e.getUTCMinutes()).padStart(2,"0"),o=String(e.getUTCSeconds()).padStart(2,"0");return`${t}:${i}:${o} UTC`}(t),v=function(e,t,i){return e.toLocaleDateString(i,{weekday:"short",month:"short",day:"numeric",year:"numeric",...t?{timeZone:t}:{}})}(t,m,this.config.locale),y=this.resolveMarkers(),b=this.config.showTimezoneBand,$=b?-44:0,w=b?1068:Ke,k=`aspect-ratio: 2048 / ${w}; --geo-frame-ar: ${(qe/w).toFixed(6)}; --geo-day-brightness: ${this.config.dayBrightness}; --geo-night-contrast: ${this.config.nightContrast}; --geo-twilight-color: ${this.config.twilightColor}; --geo-twilight-opacity: ${this.config.twilightOpacity}; --geo-tz-line: ${this.config.timezoneLineColor};`;return V`
      <div class="frame" style="${k}">
        <svg
          viewBox="0 ${$} ${qe} ${w}"
          preserveAspectRatio="xMidYMid slice"
          aria-label="World map with current day/night terminator"
        >
          <defs>
            <!-- objectBoundingBox percentages, NOT userSpaceOnUse:
                 WebKit rasterizes mask content per masked element,
                 and an explicit user-space filter region spanning
                 the full 3×MAP_W tile range made the mask resolve
                 to black for the second night-image tile — a hard
                 day/night edge at the image seam. Percentages of
                 the polygon's bbox (which always spans the full
                 tiled width and nearly full map height) sidestep
                 that and still leave 3σ headroom: 5% of 6144 px
                 horizontally and ~10% of ≥757 px vertically both
                 comfortably exceed 3σ at the max twilightDegrees
                 of 18 (σ ≈ 51 px). -->
            <filter
              id="feather"
              x="-5%"
              y="-10%"
              width="110%"
              height="120%"
              filterUnits="objectBoundingBox"
            >
              <feGaussianBlur stdDeviation="${a}" />
            </filter>
            <!-- Mask region is exactly ONE viewport (x 0..MAP_W):
                 WebKit silently drops mask content beyond roughly
                 a viewport's width, so the previous 3x-wide
                 region truncated the night layer with a hard
                 vertical edge at the image-tile boundary. The
                 polygon overhangs the region by OVERHANG_DEG (45°)
                 on each side (see tiledPolyVertices) so the feather
                 blur never reaches its closing edges, and the
                 region's own hard clip at x=0/MAP_W is invisible
                 because adjacent <use> instances of the night
                 unit abut exactly there with periodic content. -->
            <mask
              id="night-mask"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="${qe}"
              height="${Ke}"
            >
              <rect
                x="0" y="0"
                width="${qe}" height="${Ke}"
                fill="black" />
              <!-- Three copies of the feathered night polygon at
                   ±MAP_W. WebKit clips each FILTERED mask element
                   to ~one viewport's width from the element's own
                   left edge (measured empirically: the night
                   layer always truncated at polygonLeft + MAP_W).
                   Tiling the polygon as separate copies means
                   each copy's clipped right tail is covered by
                   the next copy — and because every copy blurs
                   the SAME periodic geometry, the hand-off pixels
                   compute identical values, so no seam. -->
              <polygon id="night-poly" points="${r}" fill="white" filter="url(#feather)" />
              <use href="#night-poly" x="${-2048}" />
              <use href="#night-poly" x="${qe}" />
            </mask>
            <!-- Same objectBoundingBox rationale as #feather above.
                 The vertical margin is the one that was clipping:
                 the polyline's bbox height at solstice is ~757 px
                 and the glow needs 3σ + strokeWidth/2 ≈ 180 px at
                 twilightDegrees 18, so ±25% (~190 px) clears it.
                 Horizontally the bbox spans the full 6144 px tiled
                 width, so even 3% is over 180 px. -->
            <filter
              id="twilight-blur"
              x="-5%"
              y="-25%"
              width="110%"
              height="150%"
              filterUnits="objectBoundingBox"
            >
              <feGaussianBlur stdDeviation="${h}" />
            </filter>
          </defs>

          <image class="day-image" href="${c}"
                 x="${u-qe}" y="0"
                 width="${qe}" height="${Ke}"
                 preserveAspectRatio="none"/>
          <image class="day-image" href="${c}"
                 x="${u}" y="0"
                 width="${qe}" height="${Ke}"
                 preserveAspectRatio="none"/>
          <!-- The night unit: both wrap tiles of the night image
               under one mask whose region is a single viewport.
               Letterbox bars are covered by <use> copies of the
               whole unit — each instance carries its mask region
               along with it, so every copy is self-consistently
               masked and the seams at x=0/MAP_W are invisible
               (periodic content meets exactly). This sidesteps
               the WebKit wide-mask truncation described at the
               mask definition above. -->
          <g id="night-unit" mask="url(#night-mask)">
            <image class="night-image" href="${d}"
                   x="${u-qe}" y="0"
                   width="${qe}" height="${Ke}"
                   preserveAspectRatio="none"/>
            <image class="night-image" href="${d}"
                   x="${u}" y="0"
                   width="${qe}" height="${Ke}"
                   preserveAspectRatio="none"/>
          </g>
          <use href="#night-unit" x="${-2048}" pointer-events="none"/>
          <use href="#night-unit" x="${qe}" pointer-events="none"/>

          <!-- Single tiled twilight-glow polyline. Points are
               pre-tiled at x = curve, curve-MAP_W, curve+MAP_W
               (see tiledCurve above) so the dusk rim is one
               continuous stroke across the wrap range — no
               per-segment round-caps creating jags at the
               seams, and the Gaussian-blur filter has a single
               bounding box to work against. -->
          <polyline class="twilight-glow"
                    points="${s}"
                    stroke-width="${l}"
                    filter="url(#twilight-blur)"/>

          <!-- Wrap-tile copies are <use> references to the central
               layer, not duplicated subtrees: one node per copy
               instead of ~419, no duplicated path data in the DOM,
               and the instances track the referenced subtree live
               (a hover highlight on the central copy mirrors into
               the wrap copies, which is correct — it IS the same
               zone). The outer translate absorbs sub-threshold
               centerLon drift (see tzDriftPx above). -->
          ${this.tzPolygons&&this.config.showTimezoneRegions?W`
                <g transform="translate(${p} 0)">
                  ${ye([this.tzPolygons,this.config.showTimezoneBoundaries],()=>W`
                  <g id="tz-offset-layer">
                    ${this.tzPolygons.map(e=>this.config?.showTimezoneBoundaries?W`<path class="tz-region" d="${e.d}"
                                       @pointerenter=${t=>this.onOffsetEnter(t,e)}
                                       @pointermove=${this.onZoneMove}
                                       @pointerleave=${this.onOffsetLeave}/>`:W`<path class="tz-region is-inert" d="${e.d}"/>`)}
                  </g>
                  <use href="#tz-offset-layer" x="${-2048}" pointer-events="none"/>
                  <use href="#tz-offset-layer" x="${qe}" pointer-events="none"/>`)}
                </g>
              `:""}
          ${this.tzIanaPolygons&&this.config.showTimezoneBoundaries?W`
                <g transform="translate(${p} 0)">
                  ${ye([this.tzIanaPolygons,this.hoveredIana?.tzid],()=>W`
                  <g id="tz-iana-layer">
                    ${this.tzIanaPolygons.map(e=>W`<path class="tz-iana-region${this.hoveredIana?.tzid===e.tzid?" is-active":""}" d="${e.d}"
                                       @pointerenter=${t=>this.onIanaEnter(t,e)}
                                       @pointermove=${this.onZoneMove}
                                       @pointerleave=${this.onIanaLeave}/>`)}
                  </g>
                  <use href="#tz-iana-layer" x="${-2048}" pointer-events="none"/>
                  <use href="#tz-iana-layer" x="${qe}" pointer-events="none"/>`)}
                </g>
              `:""}

          ${b?W`
                <g id="hour-band">${Ie(e,qe,i)}</g>
                <use href="#hour-band" x="${-2048}" pointer-events="none"/>
                <use href="#hour-band" x="${qe}" pointer-events="none"/>
              `:""}
        </svg>
        ${this.config.showHomeMarker?this.renderHomeMarkerOverlay(t,i,$,w):""}
        ${y.length>0?this.renderMarkerOverlay(y,t,i,$,w,o):""}
        <div class="readout">
          <div class="local-time">${f}</div>
          ${this.config.showUTC?V`<div class="utc-time">${g}</div>`:""}
        </div>
        <div class="date">${v}</div>
        ${this.renderPopup(t)}
      </div>
    `}getCardSize(){return 4}static async getConfigElement(){return await Promise.resolve().then(function(){return it}),document.createElement("geo-clock-card-editor")}static getStubConfig(){return{type:"custom:geo-clock-card",center:"sun"}}static{this.TOUCH_DISMISS_MS=2500}static{this.HOVER_IDLE_MS=3e4}clearDismissTimer(){void 0!==this.dismissTimer&&(clearTimeout(this.dismissTimer),this.dismissTimer=void 0)}clearIdleTimer(){void 0!==this.idleTimer&&(clearTimeout(this.idleTimer),this.idleTimer=void 0)}armIdleDismiss(){this.clearIdleTimer(),this.idleTimer=setTimeout(()=>{this.idleTimer=void 0,this.hoveredIana=null,this.hoveredOffset=null,this.hoveredMarker=null,this.hoverPos=null},Ge.HOVER_IDLE_MS)}scheduleTouchDismiss(e){this.clearDismissTimer(),this.dismissTimer=setTimeout(()=>{this.dismissTimer=void 0,e()},Ge.TOUCH_DISMISS_MS)}updateHoverPos(e){"touch"!==e.pointerType&&this.armIdleDismiss();const t=e.currentTarget.closest(".frame");if(!t)return;const i=t.getBoundingClientRect();this.hoverPosPending={x:e.clientX-i.left,y:e.clientY-i.top},this.hoverPosRaf||(this.hoverPosRaf=requestAnimationFrame(()=>{this.hoverPosRaf=0,this.hoverPosPending&&(this.hoverPos=this.hoverPosPending)}))}renderHomeMarkerOverlay(e,t,i,o){const r=this.resolveHomeLatLon();if(!r)return"";if(!this.config)return"";const{x:s,y:n}=Pe(r.lat,r.lon,qe,Ke,t),a=s/qe*100,l=(n-i)/o*100,h=this.config.showHomeMarkerLabel,c=this.resolveHomeTimezone(),d=this.hass?.config?.location_name&&"string"==typeof this.hass.config.location_name?this.hass.config.location_name:"Home",u=c?Ye(e,c,this.config.markerShowDay,this.config.locale):"";return V`
      <div
        class="marker home-marker"
        style="left: ${a}%; top: ${l}%;"
      >
        <div class="marker-halo"></div>
        <div class="marker-dot"></div>
        ${h?V`
              <div class="marker-text">
                <div class="marker-label">${d}</div>
                ${u?V`<div class="marker-time">${u}</div>`:""}
              </div>
            `:""}
      </div>
    `}resolveHomeTimezone(){const e=this.hass?.config?.time_zone;if("string"==typeof e&&e)return e;const t=this.resolveHomeLatLon();return t&&this.tzIanaData?this.lookupIanaTz(t.lat,t.lon)??void 0:void 0}renderMarkerOverlay(e,t,i,o,r,s){if(!this.config)return"";const n=this.config.markerLabelMode;return e.map(e=>{const{x:a,y:l}=Pe(e.lat,e.lon,qe,Ke,i),h=a/qe*100,c=(l-o)/r*100,d=e.tzid?Ye(t,e.tzid,this.config.markerShowDay,this.config.locale):"",u=this.hoveredMarker?.entity===e.entity,p=function(e,t,i){if(e||t)return i?e??t:t??e}(e.dayColor,e.nightColor,Ce(e.lat,e.lon,s))??e.color,m=p?`background: ${p};`:"";return V`
        <div
          class="marker${u?" is-active":""}"
          style="left: ${h}%; top: ${c}%;"
        >
          <div class="marker-halo" style=${m}></div>
          <div
            class="marker-dot"
            style=${m}
            @pointerenter=${t=>this.onMarkerEnter(t,e)}
            @pointermove=${this.onZoneMove}
            @pointerleave=${this.onMarkerLeave}
          ></div>
          ${"always"===n?V`
                <div class="marker-text">
                  <div class="marker-label">${e.label}</div>
                  ${d?V`<div class="marker-time">${d}</div>`:""}
                </div>
              `:""}
        </div>
      `})}armTouchAutoDismiss(){this.scheduleTouchDismiss(()=>{this.hoveredIana=null,this.hoveredOffset=null,this.hoveredMarker=null,this.hoverPos=null})}renderPopup(e){if(!this.hoverPos)return V``;if(!1===this.config?.showTimezonePopup)return V``;const t=this.shadowRoot?.querySelector(".frame"),i=t?.clientWidth??1280,o=t?.clientHeight??720,r=this.hoverPos.x>.55*i,s=this.hoverPos.y>.5*o,n=r?-260:14,a=s?-14:14,l=s?" translateY(-100%)":"",h=`transform: translate(${this.hoverPos.x+n}px, ${this.hoverPos.y+a}px)${l};`;if(this.hoveredMarker){const t=this.hoveredMarker;if(t.tzid){const i=Be(e,t.tzid,this.config?.locale);return V`
          <div class="tz-popup" style=${h}>
            <div class="tz-popup-time">${i.time}</div>
            <div class="tz-popup-date">${i.date}</div>
            <div class="tz-popup-name">${t.label}</div>
            <div class="tz-popup-offset">${i.offset} · ${t.tzid}</div>
          </div>
        `}return V`
        <div class="tz-popup" style=${h}>
          <div class="tz-popup-name">${t.label}</div>
          <div class="tz-popup-offset">${t.entity}</div>
        </div>
      `}if(this.hoveredIana){const t=this.hoveredIana,i=Be(e,t.tzid,this.config?.locale);return V`
        <div class="tz-popup" style=${h}>
          <div class="tz-popup-time">${i.time}</div>
          <div class="tz-popup-date">${i.date}</div>
          <div class="tz-popup-name">${i.name}</div>
          <div class="tz-popup-city">${t.cityLabel}</div>
          <div class="tz-popup-offset">${i.offset} · ${t.tzid}</div>
        </div>
      `}if(this.hoveredOffset){const t=this.hoveredOffset,i=function(e,t,i){const o=new Date(e.getTime()+36e5*t),r=new Intl.DateTimeFormat(i,{timeZone:"UTC",hour:"numeric",minute:"2-digit",second:"2-digit"}).format(o),s=new Intl.DateTimeFormat(i,{timeZone:"UTC",weekday:"short",month:"short",day:"numeric"}).format(o);return{time:r,date:s}}(e,t.offset,this.config?.locale);return V`
        <div class="tz-popup" style=${h}>
          <div class="tz-popup-time">${i.time}</div>
          <div class="tz-popup-date">${i.date}</div>
          ${t.name?V`<div class="tz-popup-name">${t.name}</div>`:""}
          <div class="tz-popup-offset">${t.offsetLabel}</div>
          ${t.places?V`<div class="tz-popup-places">${t.places}</div>`:""}
        </div>
      `}return V``}};function Ye(e,t,i,o){const r={hour:"numeric",minute:"2-digit",...t?{timeZone:t}:{}},s=new Intl.DateTimeFormat(o,r).format(e);if(!i)return s;const n={weekday:"short",...t?{timeZone:t}:{}};return`${s} ${new Intl.DateTimeFormat(o,n).format(e)}`}function Je(e){if(!Array.isArray(e))return[];const t=[];for(const i of e){if(!i||"string"!=typeof i.entity)continue;const e=i.entity.trim();e&&t.push({entity:e,label:"string"==typeof i.label&&""!==i.label.trim()?i.label:void 0,color:"string"==typeof i.color?i.color:void 0,dayColor:"string"==typeof i.dayColor?i.dayColor:void 0,nightColor:"string"==typeof i.nightColor?i.nightColor:void 0})}return t}function Qe(e){return"device"===e||"entity"===e?e:"home"}var et;e([me({attribute:!1})],Xe.prototype,"hass",void 0),e([fe()],Xe.prototype,"displayNow",void 0),e([fe()],Xe.prototype,"mapNow",void 0),e([fe()],Xe.prototype,"hoveredIana",void 0),e([fe()],Xe.prototype,"hoveredOffset",void 0),e([fe()],Xe.prototype,"hoveredMarker",void 0),e([fe()],Xe.prototype,"hoverPos",void 0),Xe=Ge=e([de("geo-clock-card")],Xe),window.customCards=window.customCards||[],window.customCards.push({type:"geo-clock-card",name:"Geo Clock Card",description:"World map with a live day/night terminator (NASA Blue/Black Marble).",preview:!0});let tt=class extends he{static{et=this}setConfig(e){this._config=e,this.loadCardHelpers()}async loadCardHelpers(){if(!this._helpers)try{const e=window.loadCardHelpers;if("function"!=typeof e)return void(this._helpers={});this._helpers=await e()}catch(e){console.warn("geo-clock-card editor: loadCardHelpers failed",e),this._helpers={}}}static{this.styles=n`
    :host {
      display: block;
    }
    .section {
      padding: 12px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .section + .section {
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .section-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--primary-text-color, #000);
      margin-bottom: 4px;
    }
    .help {
      font-size: 0.8rem;
      color: var(--secondary-text-color, #666);
      margin-top: -6px;
    }
    ha-textfield,
    ha-select {
      width: 100%;
    }
    ha-formfield {
      display: block;
      padding: 4px 0;
    }
    .color-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .color-row label {
      flex: 1;
      font-size: 0.95rem;
      color: var(--primary-text-color);
    }
    .color-row input[type='color'] {
      width: 56px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      border-radius: 4px;
      cursor: pointer;
      background: transparent;
    }
    /* Native select styled to match HA's input look. We use this for
       the center-mode dropdown because ha-select's selected event
       has been fragile across HA frontend versions. */
    .native-select {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .native-select label {
      font-size: 0.85rem;
      color: var(--secondary-text-color, #666);
    }
    .native-select select {
      width: 100%;
      padding: 12px 8px;
      font-size: 1rem;
      color: var(--primary-text-color, #000);
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      border-radius: 4px;
      box-sizing: border-box;
    }
    /* Marker rows: each gets entity picker + label + color + remove. */
    .marker-row {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }
    .marker-row .row-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .marker-row .row-head .row-title {
      flex: 1;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .marker-row button.remove {
      background: transparent;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      color: var(--primary-text-color, #000);
      border-radius: 4px;
      padding: 4px 10px;
      cursor: pointer;
    }
    .add-marker {
      align-self: flex-start;
      padding: 6px 14px;
      border: 1px solid var(--primary-color, #03a9f4);
      background: transparent;
      color: var(--primary-color, #03a9f4);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .breaking-note {
      font-size: 0.8rem;
      color: var(--warning-color, #f4a700);
      margin-top: -4px;
    }
    ha-selector {
      display: block;
      width: 100%;
    }
  `}fire(e,t){if(!this._config)return;const i={...this._config};void 0===t||""===t||null===t?delete i[e]:i[e]=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}numField(e){return t=>{const i=t.target.value;if(""===i)return void this.fire(e,void 0);const o=Number(i);this.fire(e,Number.isFinite(o)?o:void 0)}}hexToRgb(e){const t=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null}applyAlpha(e,t){if(!t)return e;if(/^#[0-9a-f]{8}$/i.test(t)){return e+t.slice(7,9)}if(/^#[0-9a-f]{4}$/i.test(t)){const i=t.slice(4,5);return e+i+i}const i=/^\s*rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)\s*$/i.exec(t);if(i){const t=i[1],o=this.hexToRgb(e);if(o)return`rgba(${o.r}, ${o.g}, ${o.b}, ${t})`}const o=/^\s*rgba\s*\(\s*\d+\s+\d+\s+\d+\s*\/\s*([0-9.]+)\s*\)\s*$/i.exec(t);if(o){const t=o[1],i=this.hexToRgb(e);if(i)return`rgba(${i.r} ${i.g} ${i.b} / ${t})`}return e}colorField(e,t){return i=>{const o=i.target.value,r=this._config?.[e]??t,s=this.applyAlpha(o,r);this.fire(e,s)}}localeField(){return e=>{const t=e.target.value.trim();if(t){try{new Intl.DateTimeFormat(t)}catch{return}this.fire("locale",t)}else this.fire("locale",void 0)}}patchMarkerColor(e,t,i){return o=>{const r=o.target.value;this.patchMarker(e,{[t]:this.applyAlpha(r,i)})}}toggle(e){return t=>{this.fire(e,t.target.checked)}}static{this.CENTER_MODES=["sun","home","longitude","entity"]}static{this.MAIN_TIME_SOURCES=["home","device","entity"]}updateMarkers(e){0===e.length?this.fire("markers",void 0):this.fire("markers",e)}addMarker(){const e=[...this._config?.markers??[]];e.push({entity:""}),this.updateMarkers(e)}removeMarker(e){const t=[...this._config?.markers??[]];t.splice(e,1),this.updateMarkers(t)}renderEntitySelector(e){return V`
      <ha-selector
        .hass=${this.hass}
        .selector=${{entity:{filter:[{domain:"zone"},{domain:"person"},{domain:"device_tracker"}]}}}
        .value=${e.value}
        .label=${e.label}
        @value-changed=${t=>e.onChange(t.detail?.value??"")}
      ></ha-selector>
    `}patchMarker(e,t){const i=[...this._config?.markers??[]];if(!i[e])return;const o={...i[e],...t};void 0!==t.label&&""===(t.label??"")&&delete o.label,void 0!==t.color&&""===(t.color??"")&&delete o.color,i[e]=o,this.updateMarkers(i)}render(){if(!this._config)return V``;if(!this._helpers)return V``;const e=this._config,t=e.center??"sun";return V`
      <div class="section">
        <div class="section-title">Map centering</div>
        <div class="native-select">
          <label for="geo-center-mode">Center on</label>
          <select
            id="geo-center-mode"
            .value=${t}
            @change=${e=>{const t=e.target.value;et.CENTER_MODES.includes(t)&&this.fire("center",t)}}
          >
            <option value="sun" ?selected=${"sun"===t}>
              Sun (subsolar point — drifts with daylight)
            </option>
            <option value="home" ?selected=${"home"===t}>
              Home (Home Assistant location)
            </option>
            <option value="longitude" ?selected=${"longitude"===t}>
              Specific longitude
            </option>
            <option value="entity" ?selected=${"entity"===t}>
              Follow an entity
            </option>
          </select>
        </div>

        ${"longitude"===t?V`
              <ha-textfield
                label="Longitude (-180 to 180)"
                type="number"
                min="-180"
                max="180"
                step="0.1"
                .value=${null==e.centerLongitude?"":String(e.centerLongitude)}
                @change=${this.numField("centerLongitude")}
              ></ha-textfield>
            `:""}
        ${"entity"===t?V`
              ${this.renderEntitySelector({label:"Entity to follow",value:e.centerEntity??"",onChange:e=>this.fire("centerEntity",e)})}
              <div class="help">
                Filtered to zone / person / device_tracker entities.
                Entities without numeric <code>longitude</code> /
                <code>latitude</code> attributes fall back to
                Greenwich (0°) at runtime — deliberately distinct
                from sun centering so a broken entity is visible.
              </div>
            `:""}

        <ha-formfield label="Show home marker on map">
          <ha-switch
            ?checked=${e.showHomeMarker??!1}
            @change=${this.toggle("showHomeMarker")}
          ></ha-switch>
        </ha-formfield>
        ${e.showHomeMarker?V`
              <ha-formfield label="Show home name and current time under the marker">
                <ha-switch
                  ?checked=${e.showHomeMarkerLabel??!1}
                  @change=${this.toggle("showHomeMarkerLabel")}
                ></ha-switch>
              </ha-formfield>
            `:""}
      </div>

      <div class="section">
        <div class="section-title">Main clock</div>
        <div class="native-select">
          <label for="geo-main-time-source">Time source</label>
          <select
            id="geo-main-time-source"
            .value=${e.mainTimeSource??"home"}
            @change=${e=>{const t=e.target.value;et.MAIN_TIME_SOURCES.includes(t)&&this.fire("mainTimeSource",t)}}
          >
            <option
              value="home"
              ?selected=${"home"===(e.mainTimeSource??"home")}
            >
              Home (Home Assistant time zone) — default
            </option>
            <option value="device" ?selected=${"device"===e.mainTimeSource}>
              Device (this browser's time zone)
            </option>
            <option value="entity" ?selected=${"entity"===e.mainTimeSource}>
              Follow an entity
            </option>
          </select>
        </div>
        <div class="breaking-note">
          Default changed in v0.2.0 — pre-0.2.0 cards behaved like “Device”.
          Switch back if the wall-clock readout should keep matching the
          viewing device rather than your HA location.
        </div>
        ${"entity"===e.mainTimeSource?this.renderEntitySelector({label:"Time-source entity",value:e.mainTimeEntity??"",onChange:e=>this.fire("mainTimeEntity",e)}):""}
      </div>

      <div class="section">
        <div class="section-title">Display</div>
        <ha-formfield label="Show UTC time">
          <ha-switch
            ?checked=${e.showUTC??!0}
            @change=${this.toggle("showUTC")}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield label="Show hour-of-day band">
          <ha-switch
            ?checked=${e.showTimezoneBand??!0}
            @change=${this.toggle("showTimezoneBand")}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield label="Show time-zone hover layer (IANA zones)">
          <ha-switch
            ?checked=${e.showTimezoneBoundaries??!0}
            @change=${this.toggle("showTimezoneBoundaries")}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield label="Show 15° offset bands">
          <ha-switch
            ?checked=${e.showTimezoneRegions??e.showTimezoneBoundaries??!0}
            @change=${this.toggle("showTimezoneRegions")}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield label="Show hover popup (live time at the pointed-to zone)">
          <ha-switch
            ?checked=${e.showTimezonePopup??!0}
            @change=${this.toggle("showTimezonePopup")}
          ></ha-switch>
        </ha-formfield>
        <ha-textfield
          label="Locale (BCP-47, e.g. fr-FR)"
          .value=${e.locale??""}
          @change=${this.localeField()}
        ></ha-textfield>
        <div class="help">
          Governs clock, marker times, and popup zone names. Empty =
          follow the viewer's browser language. Invalid tags are ignored.
        </div>
      </div>

      <div class="section">
        <div class="section-title">Update rate</div>
        <ha-textfield
          label="Clock tick (seconds, 1–600)"
          type="number"
          min="1"
          max="600"
          step="1"
          .value=${String(e.updateInterval??1)}
          @change=${this.numField("updateInterval")}
        ></ha-textfield>
        <div class="help">
          The map itself auto-throttles separately — it only re-renders
          when the subsolar point has shifted enough to be visible at 4K.
        </div>
      </div>

      <ha-expansion-panel
        outlined
        header="Location markers"
        secondary="Pin extra entities on the map with their current local time"
      >
        <div class="section panel-body">
          <div class="native-select">
            <label for="geo-marker-label-mode">Label visibility</label>
            <select
              id="geo-marker-label-mode"
              .value=${e.markerLabelMode??"always"}
              @change=${e=>{const t=e.target.value;this.fire("markerLabelMode","hover"===t?"hover":"always")}}
            >
              <option
                value="always"
                ?selected=${"always"===(e.markerLabelMode??"always")}
              >
                Always visible — name + time under each marker
              </option>
              <option value="hover" ?selected=${"hover"===e.markerLabelMode}>
                Hover / tap only — popup like the time-zone overlay
              </option>
            </select>
          </div>
          <ha-formfield label="Show weekday after the time (e.g. 12:22 PM Friday)">
            <ha-switch
              ?checked=${e.markerShowDay??!0}
              @change=${this.toggle("markerShowDay")}
            ></ha-switch>
          </ha-formfield>
          <div class="color-row">
            <label for="marker-color">Default marker color</label>
            <input
              id="marker-color"
              type="color"
              .value=${this.colorAsHex(e.markerColor,"#3da9fc")}
              @change=${this.colorField("markerColor")}
            />
          </div>
          <!-- Day/night marker colors: setting either turns on
               day/night mode for ALL markers (each dot recolors as
               the terminator crosses it). Leave both blank for the
               single default-color behavior above. -->
          <div class="color-row">
            <label for="marker-day-color">Day color (optional)</label>
            <input
              id="marker-day-color"
              type="color"
              .value=${this.colorAsHex(e.markerDayColor,"#ff9933")}
              @change=${this.colorField("markerDayColor")}
            />
          </div>
          <div class="color-row">
            <label for="marker-night-color">Night color (optional)</label>
            <input
              id="marker-night-color"
              type="color"
              .value=${this.colorAsHex(e.markerNightColor,"#3da9fc")}
              @change=${this.colorField("markerNightColor")}
            />
          </div>

          ${(e.markers??[]).map((t,i)=>V`
              <div class="marker-row">
                <div class="row-head">
                  <span class="row-title">Marker ${i+1}</span>
                  <button
                    class="remove"
                    type="button"
                    @click=${()=>this.removeMarker(i)}
                  >
                    Remove
                  </button>
                </div>
                ${this.renderEntitySelector({label:"Entity",value:t.entity??"",onChange:e=>this.patchMarker(i,{entity:e})})}
                <ha-textfield
                  label="Label (optional — defaults to entity friendly_name)"
                  .value=${t.label??""}
                  @change=${e=>this.patchMarker(i,{label:e.target.value})}
                ></ha-textfield>
                <div class="color-row">
                  <label for="marker-color-${i}">Marker color (optional)</label>
                  <input
                    id="marker-color-${i}"
                    type="color"
                    .value=${this.colorAsHex(t.color,this.colorAsHex(e.markerColor,"#3da9fc"))}
                    @change=${this.patchMarkerColor(i,"color",t.color)}
                  />
                </div>
                <div class="color-row">
                  <label for="marker-day-${i}">Day color (optional)</label>
                  <input
                    id="marker-day-${i}"
                    type="color"
                    .value=${this.colorAsHex(t.dayColor,this.colorAsHex(e.markerDayColor,"#ff9933"))}
                    @change=${this.patchMarkerColor(i,"dayColor",t.dayColor)}
                  />
                </div>
                <div class="color-row">
                  <label for="marker-night-${i}">Night color (optional)</label>
                  <input
                    id="marker-night-${i}"
                    type="color"
                    .value=${this.colorAsHex(t.nightColor,this.colorAsHex(e.markerNightColor,"#3da9fc"))}
                    @change=${this.patchMarkerColor(i,"nightColor",t.nightColor)}
                  />
                </div>
              </div>
            `)}
          <button
            class="add-marker"
            type="button"
            @click=${()=>this.addMarker()}
          >
            + Add marker
          </button>
        </div>
      </ha-expansion-panel>

      <ha-expansion-panel
        outlined
        header="Advanced visual settings"
        secondary="Day brightness, night contrast, twilight glow, line color"
      >
        <div class="section panel-body">
          <ha-textfield
            label="Day brightness (0–5)"
            type="number"
            min="0"
            max="5"
            step="0.05"
            .value=${String(e.dayBrightness??1.15)}
            @change=${this.numField("dayBrightness")}
          ></ha-textfield>
          <ha-textfield
            label="Night contrast (0–5)"
            type="number"
            min="0"
            max="5"
            step="0.05"
            .value=${String(e.nightContrast??1)}
            @change=${this.numField("nightContrast")}
          ></ha-textfield>
          <ha-textfield
            label="Twilight band (1–18 sun-elevation degrees)"
            type="number"
            min="1"
            max="18"
            step="1"
            .value=${String(e.twilightDegrees??8)}
            @change=${this.numField("twilightDegrees")}
          ></ha-textfield>
          <div class="color-row">
            <label for="twilight-color">Twilight color</label>
            <input
              id="twilight-color"
              type="color"
              .value=${this.colorAsHex(e.twilightColor,"#463701")}
              @change=${this.colorField("twilightColor")}
            />
          </div>
          <ha-textfield
            label="Twilight opacity (0–1)"
            type="number"
            min="0"
            max="1"
            step="0.02"
            .value=${String(e.twilightOpacity??.26)}
            @change=${this.numField("twilightOpacity")}
          ></ha-textfield>
          <div class="color-row">
            <label for="tz-line-color">Time-zone line color</label>
            <input
              id="tz-line-color"
              type="color"
              .value=${this.tzLineColorAsHex(e.timezoneLineColor)}
              @change=${this.colorField("timezoneLineColor","rgba(255, 255, 255, 0.18)")}
            />
          </div>
          <div class="help">
            For finer alpha control of the line color, set <code>timezoneLineColor</code>
            directly in YAML using an <code>rgba(…)</code> value.
          </div>
        </div>
      </ha-expansion-panel>
    `}tzLineColorAsHex(e){return this.colorAsHex(e,"#ffffff")}colorAsHex(e,t){return e&&/^#[0-9a-f]{6,8}$/i.test(e)?e.slice(0,7):t}};e([me({attribute:!1})],tt.prototype,"hass",void 0),e([fe()],tt.prototype,"_config",void 0),e([fe()],tt.prototype,"_helpers",void 0),tt=et=e([de("geo-clock-card-editor")],tt);var it=Object.freeze({__proto__:null,get GeoClockCardEditor(){return tt}});export{Xe as GeoClockCard};
//# sourceMappingURL=geo-clock-card.js.map
