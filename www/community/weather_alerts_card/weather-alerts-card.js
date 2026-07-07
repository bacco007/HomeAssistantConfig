function e(e,t,i,r){var o,s=arguments.length,n=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(s<3?o(n):s>3?o(t,i,n):o(t,i))||n);return s>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),o=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new s(i,e,r)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:c,defineProperty:d,getOwnPropertyDescriptor:l,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,m=g.trustedTypes,_=m?m.emptyScript:"",f=g.reactiveElementPolyfillSupport,v=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!c(e,t),w={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:b};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&d(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:o}=l(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const s=r?.call(this);o?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),o=t.litNonce;void 0!==o&&r.setAttribute("nonce",o),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=r;const s=o.fromAttribute(t,e.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(e,t,i,r=!1,o){if(void 0!==e){const s=this.constructor;if(!1===r&&(o=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??b)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:o},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==o||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[v("elementProperties")]=new Map,x[v("finalized")]=new Map,f?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A=globalThis,C=e=>e,$=A.trustedTypes,S=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,k="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+D,T=`<${E}>`,L=document,M=()=>L.createComment(""),z=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,P="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,I=/>/g,O=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,B=/"/g,W=/^(?:script|style|textarea|title)$/i,H=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),j=H(1),G=H(2),q=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),Z=new WeakMap,K=L.createTreeWalker(L,129);function V(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const X=(e,t)=>{const i=e.length-1,r=[];let o,s=2===t?"<svg>":3===t?"<math>":"",n=F;for(let t=0;t<i;t++){const i=e[t];let a,c,d=-1,l=0;for(;l<i.length&&(n.lastIndex=l,c=n.exec(i),null!==c);)l=n.lastIndex,n===F?"!--"===c[1]?n=R:void 0!==c[1]?n=I:void 0!==c[2]?(W.test(c[2])&&(o=RegExp("</"+c[2],"g")),n=O):void 0!==c[3]&&(n=O):n===O?">"===c[0]?(n=o??F,d=-1):void 0===c[1]?d=-2:(d=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?O:'"'===c[3]?B:U):n===B||n===U?n=O:n===R||n===I?n=F:(n=O,o=void 0);const h=n===O&&e[t+1].startsWith("/>")?" ":"";s+=n===F?i+T:d>=0?(r.push(a),i.slice(0,d)+k+i.slice(d)+D+h):i+D+(-2===d?t:h)}return[V(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class J{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let o=0,s=0;const n=e.length-1,a=this.parts,[c,d]=X(e,t);if(this.el=J.createElement(c,i),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=K.nextNode())&&a.length<n;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(k)){const t=d[s++],i=r.getAttribute(e).split(D),n=/([.?@])?(.*)/.exec(t);a.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?re:"?"===n[1]?oe:"@"===n[1]?se:ie}),r.removeAttribute(e)}else e.startsWith(D)&&(a.push({type:6,index:o}),r.removeAttribute(e));if(W.test(r.tagName)){const e=r.textContent.split(D),t=e.length-1;if(t>0){r.textContent=$?$.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],M()),K.nextNode(),a.push({type:2,index:++o});r.append(e[t],M())}}}else if(8===r.nodeType)if(r.data===E)a.push({type:2,index:o});else{let e=-1;for(;-1!==(e=r.data.indexOf(D,e+1));)a.push({type:7,index:o}),e+=D.length-1}o++}}static createElement(e,t){const i=L.createElement("template");return i.innerHTML=e,i}}function Q(e,t,i=e,r){if(t===q)return t;let o=void 0!==r?i._$Co?.[r]:i._$Cl;const s=z(t)?void 0:t._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),void 0===s?o=void 0:(o=new s(e),o._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=o:i._$Cl=o),void 0!==o&&(t=Q(e,o._$AS(e,t.values),o,r)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??L).importNode(t,!0);K.currentNode=r;let o=K.nextNode(),s=0,n=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new te(o,o.nextSibling,this,e):1===a.type?t=new a.ctor(o,a.name,a.strings,this,e):6===a.type&&(t=new ne(o,this,e)),this._$AV.push(t),a=i[++n]}s!==a?.index&&(o=K.nextNode(),s++)}return K.currentNode=L,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),z(e)?e===Y||null==e||""===e?(this._$AH!==Y&&this._$AR(),this._$AH=Y):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Y&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(V(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new ee(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new J(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const o of e)r===t.length?t.push(i=new te(this.O(M()),this.O(M()),this,this.options)):i=t[r],i._$AI(o),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=C(e).nextSibling;C(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,o){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Y}_$AI(e,t=this,i,r){const o=this.strings;let s=!1;if(void 0===o)e=Q(this,e,t,0),s=!z(e)||e!==this._$AH&&e!==q,s&&(this._$AH=e);else{const r=e;let n,a;for(e=o[0],n=0;n<o.length-1;n++)a=Q(this,r[i+n],t,n),a===q&&(a=this._$AH[n]),s||=!z(a)||a!==this._$AH[n],a===Y?e=Y:e!==Y&&(e+=(a??"")+o[n+1]),this._$AH[n]=a}s&&!r&&this.j(e)}j(e){e===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class re extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Y?void 0:e}}class oe extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Y)}}class se extends ie{constructor(e,t,i,r,o){super(e,t,i,r,o),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??Y)===q)return;const i=this._$AH,r=e===Y&&i!==Y||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==Y&&(i===Y||r);r&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const ae=A.litHtmlPolyfillSupport;ae?.(J,te),(A.litHtmlVersions??=[]).push("3.3.2");const ce=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let de=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let o=r._$litPart$;if(void 0===o){const e=i?.renderBefore??null;r._$litPart$=o=new te(t.insertBefore(M(),e),e,void 0,i??{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}};de._$litElement$=!0,de.finalized=!0,ce.litElementHydrateSupport?.({LitElement:de});const le=ce.litElementPolyfillSupport;le?.({LitElement:de}),(ce.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const he=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},pe={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:b},ue=(e=pe,t,i)=>{const{kind:r,metadata:o}=i;let s=globalThis.litPropertyMetadata.get(o);if(void 0===s&&globalThis.litPropertyMetadata.set(o,s=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,o,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const o=this[r];t.call(this,i),this.requestUpdate(r,o,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ge(e){return(t,i)=>"object"==typeof i?ue(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function me(e){return ge({...e,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _e=2;class fe{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ve extends fe{constructor(e){if(super(e),this.it=Y,e.type!==_e)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===Y||null==e)return this._t=void 0,this.it=e;if(e===q)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}ve.directiveName="unsafeHTML",ve.resultType=1;const ye=(e=>(...t)=>({_$litDirective$:e,values:t}))(ve),{entries:be,setPrototypeOf:we,isFrozen:xe,getPrototypeOf:Ae,getOwnPropertyDescriptor:Ce}=Object;
/*! @license DOMPurify 3.4.2 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.2/LICENSE */let{freeze:$e,seal:Se,create:ke}=Object,{apply:De,construct:Ee}="undefined"!=typeof Reflect&&Reflect;$e||($e=function(e){return e}),Se||(Se=function(e){return e}),De||(De=function(e,t){for(var i=arguments.length,r=new Array(i>2?i-2:0),o=2;o<i;o++)r[o-2]=arguments[o];return e.apply(t,r)}),Ee||(Ee=function(e){for(var t=arguments.length,i=new Array(t>1?t-1:0),r=1;r<t;r++)i[r-1]=arguments[r];return new e(...i)});const Te=Xe(Array.prototype.forEach),Le=Xe(Array.prototype.lastIndexOf),Me=Xe(Array.prototype.pop),ze=Xe(Array.prototype.push),Ne=Xe(Array.prototype.splice),Pe=Array.isArray,Fe=Xe(String.prototype.toLowerCase),Re=Xe(String.prototype.toString),Ie=Xe(String.prototype.match),Oe=Xe(String.prototype.replace),Ue=Xe(String.prototype.indexOf),Be=Xe(String.prototype.trim),We=Xe(Number.prototype.toString),He=Xe(Boolean.prototype.toString),je="undefined"==typeof BigInt?null:Xe(BigInt.prototype.toString),Ge="undefined"==typeof Symbol?null:Xe(Symbol.prototype.toString),qe=Xe(Object.prototype.hasOwnProperty),Ye=Xe(Object.prototype.toString),Ze=Xe(RegExp.prototype.test),Ke=(Ve=TypeError,function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];return Ee(Ve,t)});var Ve;function Xe(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var i=arguments.length,r=new Array(i>1?i-1:0),o=1;o<i;o++)r[o-1]=arguments[o];return De(e,t,r)}}function Je(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:Fe;if(we&&we(e,null),!Pe(t))return e;let r=t.length;for(;r--;){let o=t[r];if("string"==typeof o){const e=i(o);e!==o&&(xe(t)||(t[r]=e),o=e)}e[o]=!0}return e}function Qe(e){for(let t=0;t<e.length;t++){qe(e,t)||(e[t]=null)}return e}function et(e){const t=ke(null);for(const[i,r]of be(e)){qe(e,i)&&(Pe(r)?t[i]=Qe(r):r&&"object"==typeof r&&r.constructor===Object?t[i]=et(r):t[i]=r)}return t}function tt(e,t){for(;null!==e;){const i=Ce(e,t);if(i){if(i.get)return Xe(i.get);if("function"==typeof i.value)return Xe(i.value)}e=Ae(e)}return function(){return null}}const it=$e(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),rt=$e(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),ot=$e(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),st=$e(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),nt=$e(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),at=$e(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),ct=$e(["#text"]),dt=$e(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),lt=$e(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),ht=$e(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),pt=$e(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),ut=Se(/\{\{[\w\W]*|[\w\W]*\}\}/gm),gt=Se(/<%[\w\W]*|[\w\W]*%>/gm),mt=Se(/\$\{[\w\W]*/gm),_t=Se(/^data-[\-\w.\u00B7-\uFFFF]+$/),ft=Se(/^aria-[\-\w]+$/),vt=Se(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),yt=Se(/^(?:\w+script|data):/i),bt=Se(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),wt=Se(/^html$/i),xt=Se(/^[a-z][.\w]*(-[.\w]+)+$/i);var At=Object.freeze({__proto__:null,ARIA_ATTR:ft,ATTR_WHITESPACE:bt,CUSTOM_ELEMENT:xt,DATA_ATTR:_t,DOCTYPE_NAME:wt,ERB_EXPR:gt,IS_ALLOWED_URI:vt,IS_SCRIPT_OR_DATA:yt,MUSTACHE_EXPR:ut,TMPLIT_EXPR:mt});const Ct=1,$t=3,St=7,kt=8,Dt=9,Et=function(){return"undefined"==typeof window?null:window};var Tt=function e(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:Et();const i=t=>e(t);if(i.version="3.4.2",i.removed=[],!t||!t.document||t.document.nodeType!==Dt||!t.Element)return i.isSupported=!1,i;let{document:r}=t;const o=r,s=o.currentScript,{DocumentFragment:n,HTMLTemplateElement:a,Node:c,Element:d,NodeFilter:l,NamedNodeMap:h=t.NamedNodeMap||t.MozNamedAttrMap,HTMLFormElement:p,DOMParser:u,trustedTypes:g}=t,m=d.prototype,_=tt(m,"cloneNode"),f=tt(m,"remove"),v=tt(m,"nextSibling"),y=tt(m,"childNodes"),b=tt(m,"parentNode");if("function"==typeof a){const e=r.createElement("template");e.content&&e.content.ownerDocument&&(r=e.content.ownerDocument)}let w,x="";const{implementation:A,createNodeIterator:C,createDocumentFragment:$,getElementsByTagName:S}=r,{importNode:k}=o;let D={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]};i.isSupported="function"==typeof be&&"function"==typeof b&&A&&void 0!==A.createHTMLDocument;const{MUSTACHE_EXPR:E,ERB_EXPR:T,TMPLIT_EXPR:L,DATA_ATTR:M,ARIA_ATTR:z,IS_SCRIPT_OR_DATA:N,ATTR_WHITESPACE:P,CUSTOM_ELEMENT:F}=At;let{IS_ALLOWED_URI:R}=At,I=null;const O=Je({},[...it,...rt,...ot,...nt,...ct]);let U=null;const B=Je({},[...dt,...lt,...ht,...pt]);let W=Object.seal(ke(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),H=null,j=null;const G=Object.seal(ke(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let q=!0,Y=!0,Z=!1,K=!0,V=!1,X=!0,J=!1,Q=!1,ee=!1,te=!1,ie=!1,re=!1,oe=!0,se=!1;const ne="user-content-";let ae=!0,ce=!1,de={},le=null;const he=Je({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let pe=null;const ue=Je({},["audio","video","img","source","image","track"]);let ge=null;const me=Je({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),_e="http://www.w3.org/1998/Math/MathML",fe="http://www.w3.org/2000/svg",ve="http://www.w3.org/1999/xhtml";let ye=ve,we=!1,xe=null;const Ae=Je({},[_e,fe,ve],Re);let Ce=Je({},["mi","mo","mn","ms","mtext"]),Se=Je({},["annotation-xml"]);const De=Je({},["title","style","font","a","script"]);let Ee=null;const Ve=["application/xhtml+xml","text/html"];let Xe=null,Qe=null;const ut=r.createElement("form"),gt=function(e){return e instanceof RegExp||e instanceof Function},mt=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(Qe&&Qe===e)return;e&&"object"==typeof e||(e={}),e=et(e),Ee=-1===Ve.indexOf(e.PARSER_MEDIA_TYPE)?"text/html":e.PARSER_MEDIA_TYPE,Xe="application/xhtml+xml"===Ee?Re:Fe,I=qe(e,"ALLOWED_TAGS")&&Pe(e.ALLOWED_TAGS)?Je({},e.ALLOWED_TAGS,Xe):O,U=qe(e,"ALLOWED_ATTR")&&Pe(e.ALLOWED_ATTR)?Je({},e.ALLOWED_ATTR,Xe):B,xe=qe(e,"ALLOWED_NAMESPACES")&&Pe(e.ALLOWED_NAMESPACES)?Je({},e.ALLOWED_NAMESPACES,Re):Ae,ge=qe(e,"ADD_URI_SAFE_ATTR")&&Pe(e.ADD_URI_SAFE_ATTR)?Je(et(me),e.ADD_URI_SAFE_ATTR,Xe):me,pe=qe(e,"ADD_DATA_URI_TAGS")&&Pe(e.ADD_DATA_URI_TAGS)?Je(et(ue),e.ADD_DATA_URI_TAGS,Xe):ue,le=qe(e,"FORBID_CONTENTS")&&Pe(e.FORBID_CONTENTS)?Je({},e.FORBID_CONTENTS,Xe):he,H=qe(e,"FORBID_TAGS")&&Pe(e.FORBID_TAGS)?Je({},e.FORBID_TAGS,Xe):et({}),j=qe(e,"FORBID_ATTR")&&Pe(e.FORBID_ATTR)?Je({},e.FORBID_ATTR,Xe):et({}),de=!!qe(e,"USE_PROFILES")&&(e.USE_PROFILES&&"object"==typeof e.USE_PROFILES?et(e.USE_PROFILES):e.USE_PROFILES),q=!1!==e.ALLOW_ARIA_ATTR,Y=!1!==e.ALLOW_DATA_ATTR,Z=e.ALLOW_UNKNOWN_PROTOCOLS||!1,K=!1!==e.ALLOW_SELF_CLOSE_IN_ATTR,V=e.SAFE_FOR_TEMPLATES||!1,X=!1!==e.SAFE_FOR_XML,J=e.WHOLE_DOCUMENT||!1,te=e.RETURN_DOM||!1,ie=e.RETURN_DOM_FRAGMENT||!1,re=e.RETURN_TRUSTED_TYPE||!1,ee=e.FORCE_BODY||!1,oe=!1!==e.SANITIZE_DOM,se=e.SANITIZE_NAMED_PROPS||!1,ae=!1!==e.KEEP_CONTENT,ce=e.IN_PLACE||!1,R=function(e){try{return Ze(e,""),!0}catch(e){return!1}}(e.ALLOWED_URI_REGEXP)?e.ALLOWED_URI_REGEXP:vt,ye="string"==typeof e.NAMESPACE?e.NAMESPACE:ve,Ce=qe(e,"MATHML_TEXT_INTEGRATION_POINTS")&&e.MATHML_TEXT_INTEGRATION_POINTS&&"object"==typeof e.MATHML_TEXT_INTEGRATION_POINTS?et(e.MATHML_TEXT_INTEGRATION_POINTS):Je({},["mi","mo","mn","ms","mtext"]),Se=qe(e,"HTML_INTEGRATION_POINTS")&&e.HTML_INTEGRATION_POINTS&&"object"==typeof e.HTML_INTEGRATION_POINTS?et(e.HTML_INTEGRATION_POINTS):Je({},["annotation-xml"]);const t=qe(e,"CUSTOM_ELEMENT_HANDLING")&&e.CUSTOM_ELEMENT_HANDLING&&"object"==typeof e.CUSTOM_ELEMENT_HANDLING?et(e.CUSTOM_ELEMENT_HANDLING):ke(null);if(W=ke(null),qe(t,"tagNameCheck")&&gt(t.tagNameCheck)&&(W.tagNameCheck=t.tagNameCheck),qe(t,"attributeNameCheck")&&gt(t.attributeNameCheck)&&(W.attributeNameCheck=t.attributeNameCheck),qe(t,"allowCustomizedBuiltInElements")&&"boolean"==typeof t.allowCustomizedBuiltInElements&&(W.allowCustomizedBuiltInElements=t.allowCustomizedBuiltInElements),V&&(Y=!1),ie&&(te=!0),de&&(I=Je({},ct),U=ke(null),!0===de.html&&(Je(I,it),Je(U,dt)),!0===de.svg&&(Je(I,rt),Je(U,lt),Je(U,pt)),!0===de.svgFilters&&(Je(I,ot),Je(U,lt),Je(U,pt)),!0===de.mathMl&&(Je(I,nt),Je(U,ht),Je(U,pt))),G.tagCheck=null,G.attributeCheck=null,qe(e,"ADD_TAGS")&&("function"==typeof e.ADD_TAGS?G.tagCheck=e.ADD_TAGS:Pe(e.ADD_TAGS)&&(I===O&&(I=et(I)),Je(I,e.ADD_TAGS,Xe))),qe(e,"ADD_ATTR")&&("function"==typeof e.ADD_ATTR?G.attributeCheck=e.ADD_ATTR:Pe(e.ADD_ATTR)&&(U===B&&(U=et(U)),Je(U,e.ADD_ATTR,Xe))),qe(e,"ADD_URI_SAFE_ATTR")&&Pe(e.ADD_URI_SAFE_ATTR)&&Je(ge,e.ADD_URI_SAFE_ATTR,Xe),qe(e,"FORBID_CONTENTS")&&Pe(e.FORBID_CONTENTS)&&(le===he&&(le=et(le)),Je(le,e.FORBID_CONTENTS,Xe)),qe(e,"ADD_FORBID_CONTENTS")&&Pe(e.ADD_FORBID_CONTENTS)&&(le===he&&(le=et(le)),Je(le,e.ADD_FORBID_CONTENTS,Xe)),ae&&(I["#text"]=!0),J&&Je(I,["html","head","body"]),I.table&&(Je(I,["tbody"]),delete H.tbody),e.TRUSTED_TYPES_POLICY){if("function"!=typeof e.TRUSTED_TYPES_POLICY.createHTML)throw Ke('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof e.TRUSTED_TYPES_POLICY.createScriptURL)throw Ke('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');w=e.TRUSTED_TYPES_POLICY,x=w.createHTML("")}else void 0===w&&(w=function(e,t){if("object"!=typeof e||"function"!=typeof e.createPolicy)return null;let i=null;const r="data-tt-policy-suffix";t&&t.hasAttribute(r)&&(i=t.getAttribute(r));const o="dompurify"+(i?"#"+i:"");try{return e.createPolicy(o,{createHTML:e=>e,createScriptURL:e=>e})}catch(e){return console.warn("TrustedTypes policy "+o+" could not be created."),null}}(g,s)),null!==w&&"string"==typeof x&&(x=w.createHTML(""));$e&&$e(e),Qe=e},_t=Je({},[...rt,...ot,...st]),ft=Je({},[...nt,...at]),yt=function(e){ze(i.removed,{element:e});try{b(e).removeChild(e)}catch(t){f(e)}},bt=function(e,t){try{ze(i.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){ze(i.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e)if(te||ie)try{yt(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},xt=function(e){let t=null,i=null;if(ee)e="<remove></remove>"+e;else{const t=Ie(e,/^[\r\n\t ]+/);i=t&&t[0]}"application/xhtml+xml"===Ee&&ye===ve&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");const o=w?w.createHTML(e):e;if(ye===ve)try{t=(new u).parseFromString(o,Ee)}catch(e){}if(!t||!t.documentElement){t=A.createDocument(ye,"template",null);try{t.documentElement.innerHTML=we?x:o}catch(e){}}const s=t.body||t.documentElement;return e&&i&&s.insertBefore(r.createTextNode(i),s.childNodes[0]||null),ye===ve?S.call(t,J?"html":"body")[0]:J?t.documentElement:s},Tt=function(e){return C.call(e.ownerDocument||e,e,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT|l.SHOW_PROCESSING_INSTRUCTION|l.SHOW_CDATA_SECTION,null)},Lt=function(e){return e instanceof p&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof h)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore||"function"!=typeof e.hasChildNodes)},Mt=function(e){return"function"==typeof c&&e instanceof c};function zt(e,t,r){Te(e,e=>{e.call(i,t,r,Qe)})}const Nt=function(e){let t=null;if(zt(D.beforeSanitizeElements,e,null),Lt(e))return yt(e),!0;const r=Xe(e.nodeName);if(zt(D.uponSanitizeElement,e,{tagName:r,allowedTags:I}),X&&e.hasChildNodes()&&!Mt(e.firstElementChild)&&Ze(/<[/\w!]/g,e.innerHTML)&&Ze(/<[/\w!]/g,e.textContent))return yt(e),!0;if(X&&e.namespaceURI===ve&&"style"===r&&Mt(e.firstElementChild))return yt(e),!0;if(e.nodeType===St)return yt(e),!0;if(X&&e.nodeType===kt&&Ze(/<[/\w]/g,e.data))return yt(e),!0;if(H[r]||!(G.tagCheck instanceof Function&&G.tagCheck(r))&&!I[r]){if(!H[r]&&Rt(r)){if(W.tagNameCheck instanceof RegExp&&Ze(W.tagNameCheck,r))return!1;if(W.tagNameCheck instanceof Function&&W.tagNameCheck(r))return!1}if(ae&&!le[r]){const t=b(e)||e.parentNode,i=y(e)||e.childNodes;if(i&&t){for(let r=i.length-1;r>=0;--r){const o=_(i[r],!0);t.insertBefore(o,v(e))}}}return yt(e),!0}return e instanceof d&&!function(e){let t=b(e);t&&t.tagName||(t={namespaceURI:ye,tagName:"template"});const i=Fe(e.tagName),r=Fe(t.tagName);return!!xe[e.namespaceURI]&&(e.namespaceURI===fe?t.namespaceURI===ve?"svg"===i:t.namespaceURI===_e?"svg"===i&&("annotation-xml"===r||Ce[r]):Boolean(_t[i]):e.namespaceURI===_e?t.namespaceURI===ve?"math"===i:t.namespaceURI===fe?"math"===i&&Se[r]:Boolean(ft[i]):e.namespaceURI===ve?!(t.namespaceURI===fe&&!Se[r])&&!(t.namespaceURI===_e&&!Ce[r])&&!ft[i]&&(De[i]||!_t[i]):!("application/xhtml+xml"!==Ee||!xe[e.namespaceURI]))}(e)?(yt(e),!0):"noscript"!==r&&"noembed"!==r&&"noframes"!==r||!Ze(/<\/no(script|embed|frames)/i,e.innerHTML)?(V&&e.nodeType===$t&&(t=e.textContent,Te([E,T,L],e=>{t=Oe(t,e," ")}),e.textContent!==t&&(ze(i.removed,{element:e.cloneNode()}),e.textContent=t)),zt(D.afterSanitizeElements,e,null),!1):(yt(e),!0)},Pt=function(e,t,i){if(j[t])return!1;if(oe&&("id"===t||"name"===t)&&(i in r||i in ut))return!1;const o=U[t]||G.attributeCheck instanceof Function&&G.attributeCheck(t,e);if(Y&&!j[t]&&Ze(M,t));else if(q&&Ze(z,t));else if(!o||j[t]){if(!(Rt(e)&&(W.tagNameCheck instanceof RegExp&&Ze(W.tagNameCheck,e)||W.tagNameCheck instanceof Function&&W.tagNameCheck(e))&&(W.attributeNameCheck instanceof RegExp&&Ze(W.attributeNameCheck,t)||W.attributeNameCheck instanceof Function&&W.attributeNameCheck(t,e))||"is"===t&&W.allowCustomizedBuiltInElements&&(W.tagNameCheck instanceof RegExp&&Ze(W.tagNameCheck,i)||W.tagNameCheck instanceof Function&&W.tagNameCheck(i))))return!1}else if(ge[t]);else if(Ze(R,Oe(i,P,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==Ue(i,"data:")||!pe[e]){if(Z&&!Ze(N,Oe(i,P,"")));else if(i)return!1}else;return!0},Ft=Je({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Rt=function(e){return!Ft[Fe(e)]&&Ze(F,e)},It=function(e){zt(D.beforeSanitizeAttributes,e,null);const{attributes:t}=e;if(!t||Lt(e))return;const r={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:U,forceKeepAttr:void 0};let o=t.length;for(;o--;){const s=t[o],{name:n,namespaceURI:a,value:c}=s,d=Xe(n),l=c;let h="value"===n?l:Be(l);if(r.attrName=d,r.attrValue=h,r.keepAttr=!0,r.forceKeepAttr=void 0,zt(D.uponSanitizeAttribute,e,r),h=r.attrValue,!se||"id"!==d&&"name"!==d||0===Ue(h,ne)||(bt(n,e),h=ne+h),X&&Ze(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,h)){bt(n,e);continue}if("attributename"===d&&Ie(h,"href")){bt(n,e);continue}if(r.forceKeepAttr)continue;if(!r.keepAttr){bt(n,e);continue}if(!K&&Ze(/\/>/i,h)){bt(n,e);continue}V&&Te([E,T,L],e=>{h=Oe(h,e," ")});const p=Xe(e.nodeName);if(Pt(p,d,h)){if(w&&"object"==typeof g&&"function"==typeof g.getAttributeType)if(a);else switch(g.getAttributeType(p,d)){case"TrustedHTML":h=w.createHTML(h);break;case"TrustedScriptURL":h=w.createScriptURL(h)}if(h!==l)try{a?e.setAttributeNS(a,n,h):e.setAttribute(n,h),Lt(e)?yt(e):Me(i.removed)}catch(t){bt(n,e)}}else bt(n,e)}zt(D.afterSanitizeAttributes,e,null)},Ot=function(e){let t=null;const i=Tt(e);for(zt(D.beforeSanitizeShadowDOM,e,null);t=i.nextNode();)zt(D.uponSanitizeShadowNode,t,null),Nt(t),It(t),t.content instanceof n&&Ot(t.content);zt(D.afterSanitizeShadowDOM,e,null)};return i.sanitize=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=null,s=null,a=null,d=null;if(we=!e,we&&(e="\x3c!--\x3e"),"string"!=typeof e&&!Mt(e)&&"string"!=typeof(e=function(e){switch(typeof e){case"string":return e;case"number":return We(e);case"boolean":return He(e);case"bigint":return je?je(e):"0";case"symbol":return Ge?Ge(e):"Symbol()";case"undefined":default:return Ye(e);case"function":case"object":{if(null===e)return Ye(e);const t=e,i=tt(t,"toString");if("function"==typeof i){const e=i(t);return"string"==typeof e?e:Ye(e)}return Ye(e)}}}(e)))throw Ke("dirty is not a string, aborting");if(!i.isSupported)return e;if(Q||mt(t),i.removed=[],"string"==typeof e&&(ce=!1),ce){const t=e.nodeName;if("string"==typeof t){const e=Xe(t);if(!I[e]||H[e])throw Ke("root node is forbidden and cannot be sanitized in-place")}}else if(e instanceof c)r=xt("\x3c!----\x3e"),s=r.ownerDocument.importNode(e,!0),s.nodeType===Ct&&"BODY"===s.nodeName||"HTML"===s.nodeName?r=s:r.appendChild(s);else{if(!te&&!V&&!J&&-1===e.indexOf("<"))return w&&re?w.createHTML(e):e;if(r=xt(e),!r)return te?null:re?x:""}r&&ee&&yt(r.firstChild);const l=Tt(ce?e:r);for(;a=l.nextNode();)Nt(a),It(a),a.content instanceof n&&Ot(a.content);if(ce)return e;if(te){if(V){r.normalize();let e=r.innerHTML;Te([E,T,L],t=>{e=Oe(e,t," ")}),r.innerHTML=e}if(ie)for(d=$.call(r.ownerDocument);r.firstChild;)d.appendChild(r.firstChild);else d=r;return(U.shadowroot||U.shadowrootmode)&&(d=k.call(o,d,!0)),d}let h=J?r.outerHTML:r.innerHTML;return J&&I["!doctype"]&&r.ownerDocument&&r.ownerDocument.doctype&&r.ownerDocument.doctype.name&&Ze(wt,r.ownerDocument.doctype.name)&&(h="<!DOCTYPE "+r.ownerDocument.doctype.name+">\n"+h),V&&Te([E,T,L],e=>{h=Oe(h,e," ")}),w&&re?w.createHTML(h):h},i.setConfig=function(){mt(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}),Q=!0},i.clearConfig=function(){Qe=null,Q=!1},i.isValidAttribute=function(e,t,i){Qe||mt({});const r=Xe(e),o=Xe(t);return Pt(r,o,i)},i.addHook=function(e,t){"function"==typeof t&&ze(D[e],t)},i.removeHook=function(e,t){if(void 0!==t){const i=Le(D[e],t);return-1===i?void 0:Ne(D[e],i,1)[0]}return Me(D[e])},i.removeHooks=function(e){D[e]=[]},i.removeAllHooks=function(){D={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},i}();const Lt={en:{"card.no_alerts":"No active alerts.","card.sensor_unavailable":"Alert sensor is {state}.","card.preview":"Sample Data","card.read_details":"Read Details","card.open_source":"Open {provider} Source","card.zones_count":"{count} zones","card.zone_count_singular":"{count} zone","card.dismiss":"Dismiss","card.dismissed_toast":"Dismissed: {event}","card.dismissed_toast_undo":"Undo","detail.issued":"Issued","detail.onset":"Onset","detail.expires":"Expires","detail.area":"Area","detail.source":"Source","detail.description":"Description","detail.instructions":"Instructions","progress.start":"Start","progress.now":"Now","progress.end":"End","progress.ongoing":"Ongoing","progress.expires_in_label":"Expires in","progress.starts_in_label":"Starts in","progress.tbd":"TBD","progress.na":"N/A","progress.expired_label":"Expired","progress.compact_active":"for {time}","progress.compact_prep":"in {time}","progress.compact_ongoing":"ongoing","progress.compact_expired":"expired {time} ago","time.just_now":"just now","time.in_less_than_1m":"in <1m","time.minutes_ago":"{m}m ago","time.in_minutes":"in {m}m","time.hours_ago":"{dur} ago","time.in_hours":"in {dur}","time.days_ago":"{d}d ago","time.in_days":"in {d}d","badge.severity_extreme":"Extreme","badge.severity_severe":"Severe","badge.severity_moderate":"Moderate","badge.severity_minor":"Minor","badge.severity_unknown":"Unknown","badge.certainty_observed":"Observed","badge.certainty_likely":"Likely","badge.certainty_possible":"Possible","badge.certainty_unlikely":"Unlikely","badge.certainty_unknown":"Unknown","editor.entities":"Entities","editor.title":"Title (optional)","editor.provider":"Alert provider","editor.provider_auto":"Auto-detect","editor.provider_nws":"NWS (United States)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europe)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Germany)","editor.provider_eccc":"ECCC (Canada)","editor.provider_cap":"CAP Alerts (multi-region)","editor.device":"CAP Alerts device (optional)","editor.device_helper":"Pulls in every active alert sensor under this device automatically.","editor.zones":"Zones (optional)","editor.zones_helper":"Comma-separated BoM area_id codes, e.g. NSW_FL049","editor.event_codes":"Event codes (optional)","editor.event_codes_helper":"Comma-separated event codes, e.g. TOW, SVW (NWS) or 31, 95 (DWD)","editor.exclude_event_codes":"Exclude event codes (optional)","editor.exclude_event_codes_helper":"Comma-separated event codes to exclude, e.g. SCY (NWS) or 22 (DWD)","editor.sort_order":"Sort order","editor.sort_default":"Default","editor.sort_onset":"Onset time","editor.sort_severity":"Severity","editor.color_theme":"Color theme","editor.color_severity":"Severity-based","editor.color_nws":"NWS Official","editor.color_meteoalarm":"MeteoAlarm Awareness","editor.color_eccc":"ECCC Public Alerts","editor.timezone":"Timezone","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (local device)","editor.min_severity":"Minimum severity","editor.severity_all":"All severities","editor.severity_minor":"Minor or higher","editor.severity_moderate":"Moderate or higher","editor.severity_severe":"Severe or higher","editor.severity_extreme":"Extreme only","editor.animations":"Enable animations","editor.enhance_contrast":"Enhance contrast","editor.enhance_contrast_off":"Off","editor.enhance_contrast_subtle":"Subtle (default)","editor.enhance_contrast_strict":"Strict (WCAG AA)","editor.deduplicate":"Deduplicate alerts","editor.deduplicate_headlines":"Deduplicate headlines","editor.show_details":"Show detail panel","editor.expand_details":"Always expand details","editor.show_metadata":"Show metadata","editor.show_description":"Show description","editor.show_instructions":"Show instructions","editor.show_geometry":"Show area map","editor.geometry_style":"Area map style","editor.geometry_style_shape":"Outline only","editor.geometry_style_map":"Map tiles (online)","editor.show_provider":"Show provider label","editor.show_source_link":"Show source link","editor.reformat_text":"Reflow alert text (strip hard line breaks)","editor.compact":"Compact layout","editor.font_size":"Font size","editor.font_size_small":"Small","editor.font_size_default":"Default","editor.font_size_large":"Large","editor.font_size_x_large":"Extra large","editor.hide_expired":"Hide expired alerts","editor.hide_no_alerts":"Hide card when there are no active alerts","editor.allow_dismiss":"Allow dismissing alerts","editor.show_dismiss_undo":"Show undo notification on dismiss","editor.dismissed_count":"Dismissed: {count} alerts.","editor.dismissed_count_singular":"Dismissed: {count} alert.","editor.restore_all":"Restore all","editor.show_preview":"Show sample data","editor.preview_hint":"Preview card layout with sample alerts","editor.preview_nudge":"No active alerts — enable to preview the card layout.","editor.entity_warning":"Selected entity does not appear to contain weather alert data.","editor.no_entities_hint":"No supported weather alert entities found. A provider integration (e.g. NWS Alerts) must be installed first.","editor.no_entities_hint_link":"Supported providers","editor.no_device_alerts_hint":"No active alert sensors found under this device yet. The card will populate automatically when CAP Alerts publishes alerts.","editor.section_entity":"Entities & Provider","editor.section_filtering":"Filtering","editor.section_appearance":"Appearance","editor.section_detail_panel":"Detail Panel","editor.section_behavior":"Behavior","editor.section_dismissal":"Dismissal","editor.dismiss_trigger":"Dismiss trigger","editor.dismiss_trigger_button":"Button only","editor.dismiss_trigger_swipe":"Swipe only","editor.dismiss_trigger_both":"Button and swipe","editor.dismiss_button_style":"Button style","editor.dismiss_button_style_icon":"Icon only","editor.dismiss_button_style_labeled":"Icon and label"},fr:{"card.no_alerts":"Aucune alerte active.","card.sensor_unavailable":"Le capteur d'alerte est {state}.","card.preview":"Donnees d'exemple","card.read_details":"Lire les details","card.open_source":"Ouvrir la source {provider}","card.zones_count":"{count} zones","card.zone_count_singular":"{count} zone","card.dismiss":"Ignorer","card.dismissed_toast":"Ignorée : {event}","card.dismissed_toast_undo":"Annuler","detail.issued":"Emis","detail.onset":"Debut","detail.expires":"Expire","detail.area":"Zone","detail.source":"Source","detail.description":"Description","detail.instructions":"Instructions","progress.start":"Debut","progress.now":"Maint.","progress.end":"Fin","progress.ongoing":"En cours","progress.expires_in_label":"Expire dans","progress.starts_in_label":"Commence dans","progress.tbd":"Ind.","progress.na":"N/D","progress.expired_label":"Expiré","progress.compact_active":"pour {time}","progress.compact_prep":"dans {time}","progress.compact_ongoing":"en cours","progress.compact_expired":"expiré il y a {time}","time.just_now":"a l'instant","time.in_less_than_1m":"dans <1m","time.minutes_ago":"il y a {m}m","time.in_minutes":"dans {m}m","time.hours_ago":"il y a {dur}","time.in_hours":"dans {dur}","time.days_ago":"il y a {d}j","time.in_days":"dans {d}j","badge.severity_extreme":"Extrême","badge.severity_severe":"Grave","badge.severity_moderate":"Modérée","badge.severity_minor":"Mineure","badge.severity_unknown":"Inconnue","badge.certainty_observed":"Observée","badge.certainty_likely":"Probable","badge.certainty_possible":"Possible","badge.certainty_unlikely":"Improbable","badge.certainty_unknown":"Inconnue","editor.entities":"Entites","editor.title":"Titre (optionnel)","editor.provider":"Fournisseur d'alertes","editor.provider_auto":"Detection auto","editor.provider_nws":"NWS (Etats-Unis)","editor.provider_bom":"BoM (Australie)","editor.provider_meteoalarm":"MeteoAlarm (Europe)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Allemagne)","editor.provider_eccc":"ECCC (Canada)","editor.provider_cap":"Alertes CAP (multi-region)","editor.device":"Appareil CAP Alerts (optionnel)","editor.device_helper":"Recupere automatiquement chaque capteur d'alerte actif sous cet appareil.","editor.zones":"Zones (optionnel)","editor.zones_helper":"Codes area_id BoM separes par des virgules, ex. NSW_FL049","editor.event_codes":"Codes d'evenement (optionnel)","editor.event_codes_helper":"Codes d'evenement separes par des virgules, ex. TOW, SVW (NWS) ou 31, 95 (DWD)","editor.exclude_event_codes":"Exclure codes d'evenement (optionnel)","editor.exclude_event_codes_helper":"Codes d'evenement a exclure, ex. SCY (NWS) ou 22 (DWD)","editor.sort_order":"Ordre de tri","editor.sort_default":"Par defaut","editor.sort_onset":"Heure de debut","editor.sort_severity":"Gravite","editor.color_theme":"Theme de couleur","editor.color_severity":"Base sur la gravite","editor.color_nws":"NWS officiel","editor.color_meteoalarm":"MeteoAlarm Vigilance","editor.color_eccc":"Alertes publiques ECCC","editor.timezone":"Fuseau horaire","editor.tz_server":"Serveur (Home Assistant)","editor.tz_browser":"Navigateur (appareil local)","editor.min_severity":"Gravite minimale","editor.severity_all":"Toutes les gravites","editor.severity_minor":"Mineure ou plus","editor.severity_moderate":"Moderee ou plus","editor.severity_severe":"Grave ou plus","editor.severity_extreme":"Extreme uniquement","editor.animations":"Activer les animations","editor.enhance_contrast":"Améliorer le contraste","editor.enhance_contrast_off":"Désactivé","editor.enhance_contrast_subtle":"Subtil (par défaut)","editor.enhance_contrast_strict":"Strict (WCAG AA)","editor.deduplicate":"Dedupliquer les alertes","editor.deduplicate_headlines":"Dédupliquer les titres","editor.show_details":"Afficher le panneau de details","editor.expand_details":"Toujours afficher les details","editor.show_metadata":"Afficher les metadonnees","editor.show_description":"Afficher la description","editor.show_instructions":"Afficher les instructions","editor.show_geometry":"Afficher la carte de zone","editor.geometry_style":"Style de la carte de zone","editor.geometry_style_shape":"Contour uniquement","editor.geometry_style_map":"Tuiles cartographiques (en ligne)","editor.show_provider":"Afficher le fournisseur","editor.show_source_link":"Afficher le lien source","editor.reformat_text":"Reformater le texte (supprimer les retours a la ligne)","editor.compact":"Disposition compacte","editor.font_size":"Taille de police","editor.font_size_small":"Petit","editor.font_size_default":"Par défaut","editor.font_size_large":"Grand","editor.font_size_x_large":"Très grand","editor.hide_expired":"Masquer les alertes expirées","editor.hide_no_alerts":"Masquer la carte sans alertes","editor.allow_dismiss":"Permettre d'ignorer les alertes","editor.show_dismiss_undo":"Afficher une notification d'annulation","editor.dismissed_count":"Ignorées : {count} alertes.","editor.dismissed_count_singular":"Ignorée : {count} alerte.","editor.restore_all":"Tout restaurer","editor.show_preview":"Afficher les donnees exemples","editor.preview_hint":"Apercu de la disposition avec des alertes fictives","editor.preview_nudge":"Aucune alerte active — activez pour previsualiser la disposition.","editor.entity_warning":"L'entite selectionnee ne semble pas contenir de donnees d'alerte meteo.","editor.no_entities_hint":"Aucune entite d'alerte meteo compatible trouvee. Une integration (ex. NWS Alerts) doit etre installee.","editor.no_entities_hint_link":"Fournisseurs supportes","editor.no_device_alerts_hint":"Aucun capteur d'alerte actif trouve sous cet appareil pour le moment. La carte se remplira automatiquement lorsque CAP Alerts publiera des alertes.","editor.section_entity":"Entite et fournisseur","editor.section_filtering":"Filtrage","editor.section_appearance":"Apparence","editor.section_detail_panel":"Panneau de details","editor.section_behavior":"Comportement","editor.section_dismissal":"Masquage","editor.dismiss_trigger":"Declencheur","editor.dismiss_trigger_button":"Bouton uniquement","editor.dismiss_trigger_swipe":"Glissement uniquement","editor.dismiss_trigger_both":"Bouton et glissement","editor.dismiss_button_style":"Style du bouton","editor.dismiss_button_style_icon":"Icone uniquement","editor.dismiss_button_style_labeled":"Icone et texte"},es:{"card.no_alerts":"Sin alertas activas.","card.sensor_unavailable":"El sensor de alertas esta {state}.","card.preview":"Datos de ejemplo","card.read_details":"Leer detalles","card.open_source":"Abrir fuente {provider}","card.zones_count":"{count} zonas","card.zone_count_singular":"{count} zona","card.dismiss":"Descartar","card.dismissed_toast":"Descartada: {event}","card.dismissed_toast_undo":"Deshacer","detail.issued":"Emitido","detail.onset":"Inicio","detail.expires":"Expira","detail.area":"Area","detail.source":"Fuente","detail.description":"Descripcion","detail.instructions":"Instrucciones","progress.start":"Inicio","progress.now":"Ahora","progress.end":"Fin","progress.ongoing":"En curso","progress.expires_in_label":"Expira en","progress.starts_in_label":"Comienza en","progress.tbd":"Pend.","progress.na":"N/D","progress.expired_label":"Expirada","progress.compact_active":"por {time}","progress.compact_prep":"en {time}","progress.compact_ongoing":"en curso","progress.compact_expired":"expiró hace {time}","time.just_now":"ahora mismo","time.in_less_than_1m":"en <1m","time.minutes_ago":"hace {m}m","time.in_minutes":"en {m}m","time.hours_ago":"hace {dur}","time.in_hours":"en {dur}","time.days_ago":"hace {d}d","time.in_days":"en {d}d","badge.severity_extreme":"Extrema","badge.severity_severe":"Grave","badge.severity_moderate":"Moderada","badge.severity_minor":"Menor","badge.severity_unknown":"Desconocida","badge.certainty_observed":"Observada","badge.certainty_likely":"Probable","badge.certainty_possible":"Posible","badge.certainty_unlikely":"Improbable","badge.certainty_unknown":"Desconocida","editor.entities":"Entidades","editor.title":"Titulo (opcional)","editor.provider":"Proveedor de alertas","editor.provider_auto":"Deteccion auto","editor.provider_nws":"NWS (Estados Unidos)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Alemania)","editor.provider_eccc":"ECCC (Canadá)","editor.provider_cap":"Alertas CAP (multi-region)","editor.device":"Dispositivo CAP Alerts (opcional)","editor.device_helper":"Incorpora automaticamente cada sensor de alerta activo bajo este dispositivo.","editor.zones":"Zonas (opcional)","editor.zones_helper":"Codigos area_id de BoM separados por comas, ej. NSW_FL049","editor.event_codes":"Codigos de evento (opcional)","editor.event_codes_helper":"Codigos de evento separados por comas, ej. TOW, SVW (NWS) o 31, 95 (DWD)","editor.exclude_event_codes":"Excluir codigos de evento (opcional)","editor.exclude_event_codes_helper":"Codigos de evento a excluir, ej. SCY (NWS) o 22 (DWD)","editor.sort_order":"Orden","editor.sort_default":"Predeterminado","editor.sort_onset":"Hora de inicio","editor.sort_severity":"Gravedad","editor.color_theme":"Tema de color","editor.color_severity":"Basado en gravedad","editor.color_nws":"NWS oficial","editor.color_meteoalarm":"MeteoAlarm Conciencia","editor.color_eccc":"Alertas públicas ECCC","editor.timezone":"Zona horaria","editor.tz_server":"Servidor (Home Assistant)","editor.tz_browser":"Navegador (dispositivo local)","editor.min_severity":"Gravedad minima","editor.severity_all":"Todas las gravedades","editor.severity_minor":"Menor o superior","editor.severity_moderate":"Moderada o superior","editor.severity_severe":"Grave o superior","editor.severity_extreme":"Solo extrema","editor.animations":"Activar animaciones","editor.enhance_contrast":"Mejorar contraste","editor.enhance_contrast_off":"Desactivado","editor.enhance_contrast_subtle":"Sutil (por defecto)","editor.enhance_contrast_strict":"Estricto (WCAG AA)","editor.deduplicate":"Deduplicar alertas","editor.deduplicate_headlines":"Deduplicar titulares","editor.show_details":"Mostrar panel de detalles","editor.expand_details":"Siempre expandir detalles","editor.show_metadata":"Mostrar metadatos","editor.show_description":"Mostrar descripcion","editor.show_instructions":"Mostrar instrucciones","editor.show_geometry":"Mostrar mapa de área","editor.geometry_style":"Estilo del mapa de área","editor.geometry_style_shape":"Solo contorno","editor.geometry_style_map":"Mosaicos de mapa (en línea)","editor.show_provider":"Mostrar proveedor","editor.show_source_link":"Mostrar enlace de fuente","editor.reformat_text":"Reformatear texto (eliminar saltos de linea)","editor.compact":"Disposicion compacta","editor.font_size":"Tamaño de fuente","editor.font_size_small":"Pequeño","editor.font_size_default":"Predeterminado","editor.font_size_large":"Grande","editor.font_size_x_large":"Extra grande","editor.hide_expired":"Ocultar alertas expiradas","editor.hide_no_alerts":"Ocultar tarjeta sin alertas","editor.allow_dismiss":"Permitir descartar alertas","editor.show_dismiss_undo":"Mostrar notificación para deshacer","editor.dismissed_count":"Descartadas: {count} alertas.","editor.dismissed_count_singular":"Descartada: {count} alerta.","editor.restore_all":"Restaurar todo","editor.show_preview":"Mostrar datos de ejemplo","editor.preview_hint":"Vista previa con alertas de ejemplo","editor.preview_nudge":"Sin alertas activas — active para previsualizar el diseno.","editor.entity_warning":"La entidad seleccionada no parece contener datos de alerta meteorologica.","editor.no_entities_hint":"No se encontraron entidades de alerta meteorologica compatibles. Se debe instalar una integracion (ej. NWS Alerts).","editor.no_entities_hint_link":"Proveedores compatibles","editor.no_device_alerts_hint":"Aun no se encontraron sensores de alerta activos bajo este dispositivo. La tarjeta se rellenara automaticamente cuando CAP Alerts publique alertas.","editor.section_entity":"Entidad y proveedor","editor.section_filtering":"Filtrado","editor.section_appearance":"Apariencia","editor.section_detail_panel":"Panel de detalles","editor.section_behavior":"Comportamiento","editor.section_dismissal":"Descarte","editor.dismiss_trigger":"Disparador","editor.dismiss_trigger_button":"Solo boton","editor.dismiss_trigger_swipe":"Solo deslizamiento","editor.dismiss_trigger_both":"Boton y deslizamiento","editor.dismiss_button_style":"Estilo del boton","editor.dismiss_button_style_icon":"Solo icono","editor.dismiss_button_style_labeled":"Icono y texto"},it:{"card.no_alerts":"Nessuna allerta attiva.","card.sensor_unavailable":"Il sensore di allerta è {state}.","card.preview":"Dati di esempio","card.read_details":"Leggi dettagli","card.open_source":"Apri fonte {provider}","card.zones_count":"{count} zone","card.zone_count_singular":"{count} zona","card.dismiss":"Ignora","card.dismissed_toast":"Ignorata: {event}","card.dismissed_toast_undo":"Annulla","detail.issued":"Emessa","detail.onset":"Inizio","detail.expires":"Scadenza","detail.area":"Area","detail.source":"Fonte","detail.description":"Descrizione","detail.instructions":"Istruzioni","progress.start":"Inizio","progress.now":"Ora","progress.end":"Fine","progress.ongoing":"In corso","progress.expires_in_label":"Scade tra","progress.starts_in_label":"Inizia tra","progress.tbd":"N.D.","progress.na":"N/D","progress.expired_label":"Scaduta","progress.compact_active":"per {time}","progress.compact_prep":"tra {time}","progress.compact_ongoing":"in corso","progress.compact_expired":"scaduta {time} fa","time.just_now":"proprio ora","time.in_less_than_1m":"in <1m","time.minutes_ago":"{m}m fa","time.in_minutes":"in {m}m","time.hours_ago":"{dur} fa","time.in_hours":"in {dur}","time.days_ago":"{d}g fa","time.in_days":"in {d}g","badge.severity_extreme":"Estrema","badge.severity_severe":"Grave","badge.severity_moderate":"Moderata","badge.severity_minor":"Lieve","badge.severity_unknown":"Sconosciuta","badge.certainty_observed":"Osservata","badge.certainty_likely":"Probabile","badge.certainty_possible":"Possibile","badge.certainty_unlikely":"Improbabile","badge.certainty_unknown":"Sconosciuta","editor.entities":"Entità","editor.title":"Titolo (opzionale)","editor.provider":"Fornitore allerte","editor.provider_auto":"Rilevamento automatico","editor.provider_nws":"NWS (Stati Uniti)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Germania)","editor.provider_eccc":"ECCC (Canada)","editor.provider_cap":"Allerte CAP (multi-regione)","editor.device":"Dispositivo CAP Alerts (opzionale)","editor.device_helper":"Aggiunge automaticamente ogni sensore di allerta attivo sotto questo dispositivo.","editor.zones":"Zone (opzionale)","editor.zones_helper":"Codici area_id BoM separati da virgola, es. NSW_FL049","editor.event_codes":"Codici evento (opzionale)","editor.event_codes_helper":"Codici evento separati da virgola, es. TOW, SVW (NWS) o 31, 95 (DWD)","editor.exclude_event_codes":"Escludi codici evento (opzionale)","editor.exclude_event_codes_helper":"Codici evento da escludere, es. SCY (NWS) o 22 (DWD)","editor.sort_order":"Ordinamento","editor.sort_default":"Predefinito","editor.sort_onset":"Ora di inizio","editor.sort_severity":"Gravità","editor.color_theme":"Tema colori","editor.color_severity":"Basato sulla gravità","editor.color_nws":"NWS ufficiale","editor.color_meteoalarm":"MeteoAlarm Livelli","editor.color_eccc":"Allerte pubbliche ECCC","editor.timezone":"Fuso orario","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (dispositivo locale)","editor.min_severity":"Gravità minima","editor.severity_all":"Tutte le gravità","editor.severity_minor":"Lieve o superiore","editor.severity_moderate":"Moderata o superiore","editor.severity_severe":"Grave o superiore","editor.severity_extreme":"Solo estrema","editor.animations":"Abilita animazioni","editor.enhance_contrast":"Migliora contrasto","editor.enhance_contrast_off":"Disattivato","editor.enhance_contrast_subtle":"Sottile (predefinito)","editor.enhance_contrast_strict":"Rigoroso (WCAG AA)","editor.deduplicate":"Deduplica allerte","editor.deduplicate_headlines":"Deduplica titoli","editor.show_details":"Mostra pannello dettagli","editor.expand_details":"Espandi sempre i dettagli","editor.show_metadata":"Mostra metadati","editor.show_description":"Mostra descrizione","editor.show_instructions":"Mostra istruzioni","editor.show_geometry":"Mostra mappa area","editor.geometry_style":"Stile mappa area","editor.geometry_style_shape":"Solo contorno","editor.geometry_style_map":"Tile mappa (online)","editor.show_provider":"Mostra fornitore","editor.show_source_link":"Mostra link alla fonte","editor.reformat_text":"Riformatta testo (rimuovi interruzioni di riga)","editor.compact":"Layout compatto","editor.font_size":"Dimensione testo","editor.font_size_small":"Piccolo","editor.font_size_default":"Predefinito","editor.font_size_large":"Grande","editor.font_size_x_large":"Molto grande","editor.hide_expired":"Nascondi allerte scadute","editor.hide_no_alerts":"Nascondi scheda senza allerte","editor.allow_dismiss":"Consenti di ignorare le allerte","editor.show_dismiss_undo":"Mostra notifica di annullamento","editor.dismissed_count":"Ignorate: {count} allerte.","editor.dismissed_count_singular":"Ignorata: {count} allerta.","editor.restore_all":"Ripristina tutto","editor.show_preview":"Mostra dati di esempio","editor.preview_hint":"Anteprima del layout con allerte di esempio","editor.preview_nudge":"Nessuna allerta attiva — attiva per visualizzare il layout.","editor.entity_warning":"L'entità selezionata non sembra contenere dati di allerta meteo.","editor.no_entities_hint":"Nessuna entita di allerta meteo compatibile trovata. Un'integrazione (es. NWS Alerts) deve essere installata.","editor.no_entities_hint_link":"Provider supportati","editor.no_device_alerts_hint":"Nessun sensore di allerta attivo trovato sotto questo dispositivo per ora. La scheda si popolera automaticamente quando CAP Alerts pubblichera delle allerte.","editor.section_entity":"Entità e fornitore","editor.section_filtering":"Filtraggio","editor.section_appearance":"Aspetto","editor.section_detail_panel":"Pannello dettagli","editor.section_behavior":"Comportamento","editor.section_dismissal":"Dismissione","editor.dismiss_trigger":"Attivatore","editor.dismiss_trigger_button":"Solo pulsante","editor.dismiss_trigger_swipe":"Solo scorrimento","editor.dismiss_trigger_both":"Pulsante e scorrimento","editor.dismiss_button_style":"Stile pulsante","editor.dismiss_button_style_icon":"Solo icona","editor.dismiss_button_style_labeled":"Icona e testo"},de:{"card.no_alerts":"Keine aktiven Warnungen.","card.sensor_unavailable":"Der Warnsensor ist {state}.","card.preview":"Beispieldaten","card.read_details":"Details lesen","card.open_source":"{provider}-Quelle öffnen","card.zones_count":"{count} Zonen","card.zone_count_singular":"{count} Zone","card.dismiss":"Ausblenden","card.dismissed_toast":"Ausgeblendet: {event}","card.dismissed_toast_undo":"Rückgängig","detail.issued":"Ausgegeben","detail.onset":"Beginn","detail.expires":"Ablauf","detail.area":"Gebiet","detail.source":"Quelle","detail.description":"Beschreibung","detail.instructions":"Hinweise","progress.start":"Start","progress.now":"Jetzt","progress.end":"Ende","progress.ongoing":"Laufend","progress.expires_in_label":"Endet in","progress.starts_in_label":"Beginnt in","progress.tbd":"Offen","progress.na":"K. A.","progress.expired_label":"Abgelaufen","progress.compact_active":"für {time}","progress.compact_prep":"in {time}","progress.compact_ongoing":"laufend","progress.compact_expired":"abgelaufen vor {time}","time.just_now":"gerade eben","time.in_less_than_1m":"in <1 Min","time.minutes_ago":"vor {m} Min","time.in_minutes":"in {m} Min","time.hours_ago":"vor {dur}","time.in_hours":"in {dur}","time.days_ago":"vor {d} T","time.in_days":"in {d} T","badge.severity_extreme":"Extrem","badge.severity_severe":"Schwer","badge.severity_moderate":"Mäßig","badge.severity_minor":"Gering","badge.severity_unknown":"Unbekannt","badge.certainty_observed":"Beobachtet","badge.certainty_likely":"Wahrscheinlich","badge.certainty_possible":"Möglich","badge.certainty_unlikely":"Unwahrscheinlich","badge.certainty_unknown":"Unbekannt","editor.entities":"Entitäten","editor.title":"Titel (optional)","editor.provider":"Warnanbieter","editor.provider_auto":"Automatisch erkennen","editor.provider_nws":"NWS (USA)","editor.provider_bom":"BoM (Australien)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Deutschland)","editor.provider_eccc":"ECCC (Kanada)","editor.provider_cap":"CAP-Warnungen (multi-regional)","editor.device":"CAP-Alerts-Gerät (optional)","editor.device_helper":"Bezieht automatisch jeden aktiven Warnsensor unter diesem Gerät ein.","editor.zones":"Zonen (optional)","editor.zones_helper":"Kommagetrennte BoM area_id-Codes, z. B. NSW_FL049","editor.event_codes":"Ereigniscodes (optional)","editor.event_codes_helper":"Kommagetrennte Ereigniscodes, z. B. TOW, SVW (NWS) oder 31, 95 (DWD)","editor.exclude_event_codes":"Ereigniscodes ausschließen (optional)","editor.exclude_event_codes_helper":"Ereigniscodes zum Ausschließen, z. B. SCY (NWS) oder 22 (DWD)","editor.sort_order":"Sortierung","editor.sort_default":"Standard","editor.sort_onset":"Beginnzeit","editor.sort_severity":"Schweregrad","editor.color_theme":"Farbschema","editor.color_severity":"Nach Schweregrad","editor.color_nws":"NWS offiziell","editor.color_meteoalarm":"MeteoAlarm Warnstufen","editor.color_eccc":"ECCC öffentliche Warnungen","editor.timezone":"Zeitzone","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (lokales Gerät)","editor.min_severity":"Mindestschweregrad","editor.severity_all":"Alle Schweregrade","editor.severity_minor":"Gering oder höher","editor.severity_moderate":"Mäßig oder höher","editor.severity_severe":"Schwer oder höher","editor.severity_extreme":"Nur extrem","editor.animations":"Animationen aktivieren","editor.enhance_contrast":"Kontrast erhöhen","editor.enhance_contrast_off":"Aus","editor.enhance_contrast_subtle":"Dezent (Standard)","editor.enhance_contrast_strict":"Streng (WCAG AA)","editor.deduplicate":"Warnungen deduplizieren","editor.deduplicate_headlines":"Überschriften deduplizieren","editor.show_details":"Detailbereich anzeigen","editor.expand_details":"Details immer anzeigen","editor.show_metadata":"Metadaten anzeigen","editor.show_description":"Beschreibung anzeigen","editor.show_instructions":"Hinweise anzeigen","editor.show_geometry":"Gebietskarte anzeigen","editor.geometry_style":"Gebietskartenstil","editor.geometry_style_shape":"Nur Umriss","editor.geometry_style_map":"Kartenkacheln (online)","editor.show_provider":"Anbieter anzeigen","editor.show_source_link":"Quelllink anzeigen","editor.reformat_text":"Text umformatieren (harte Zeilenumbrüche entfernen)","editor.compact":"Kompaktes Layout","editor.font_size":"Schriftgröße","editor.font_size_small":"Klein","editor.font_size_default":"Standard","editor.font_size_large":"Groß","editor.font_size_x_large":"Sehr groß","editor.hide_expired":"Abgelaufene Warnungen ausblenden","editor.hide_no_alerts":"Karte ohne aktive Warnungen ausblenden","editor.allow_dismiss":"Warnungen ausblendbar machen","editor.show_dismiss_undo":"Rückgängig-Benachrichtigung anzeigen","editor.dismissed_count":"Ausgeblendet: {count} Warnungen.","editor.dismissed_count_singular":"Ausgeblendet: {count} Warnung.","editor.restore_all":"Alle wiederherstellen","editor.show_preview":"Beispieldaten anzeigen","editor.preview_hint":"Kartenlayout mit Beispielwarnungen anzeigen","editor.preview_nudge":"Keine aktiven Warnungen — aktivieren, um das Kartenlayout zu sehen.","editor.entity_warning":"Die ausgewählte Entität scheint keine Wetterwarnungsdaten zu enthalten.","editor.no_entities_hint":"Keine kompatiblen Wetterwarnungs-Entitaten gefunden. Eine Integration (z.B. NWS Alerts) muss installiert sein.","editor.no_entities_hint_link":"Unterstutzte Anbieter","editor.no_device_alerts_hint":"Noch keine aktiven Warnsensoren unter diesem Gerat gefunden. Die Karte fullt sich automatisch, sobald CAP Alerts Warnungen veroffentlicht.","editor.section_entity":"Entität und Anbieter","editor.section_filtering":"Filterung","editor.section_appearance":"Darstellung","editor.section_detail_panel":"Detailbereich","editor.section_behavior":"Verhalten","editor.section_dismissal":"Ausblenden","editor.dismiss_trigger":"Auslöser","editor.dismiss_trigger_button":"Nur Schaltfläche","editor.dismiss_trigger_swipe":"Nur wischen","editor.dismiss_trigger_both":"Schaltfläche und wischen","editor.dismiss_button_style":"Schaltflächenstil","editor.dismiss_button_style_icon":"Nur Symbol","editor.dismiss_button_style_labeled":"Symbol und Text"}};function Mt(e,t,i){const r=t.split("-")[0].toLowerCase();let o=(Lt[r]||Lt.en)[e]??Lt.en[e]??e;if(i)for(const[e,t]of Object.entries(i))o=o.split(`{${e}}`).join(String(t));return o}const zt={"tsunami warning":{hex:"#FD6347",rgb:"253, 99, 71",crLight:2.978,crDark:5.714},"tornado warning":{hex:"#FF0000",rgb:"255, 0, 0",crLight:3.998,crDark:4.255},"extreme wind warning":{hex:"#FF8C00",rgb:"255, 140, 0",crLight:2.332,crDark:7.295},"severe thunderstorm warning":{hex:"#FFA500",rgb:"255, 165, 0",crLight:1.975,crDark:8.616},"flash flood warning":{hex:"#8B0000",rgb:"139, 0, 0",crLight:10.011,crDark:1.7},"flash flood statement":{hex:"#8B0000",rgb:"139, 0, 0",crLight:10.011,crDark:1.7},"severe weather statement":{hex:"#00FFFF",rgb:"0, 255, 255",crLight:1.254,crDark:13.57},"shelter in place warning":{hex:"#FA8072",rgb:"250, 128, 114",crLight:2.501,crDark:6.802},"evacuation immediate":{hex:"#7FFF00",rgb:"127, 255, 0",crLight:1.296,crDark:13.131},"civil danger warning":{hex:"#FFB6C1",rgb:"255, 182, 193",crLight:1.652,crDark:10.301},"nuclear power plant warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"radiological hazard warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"hazardous materials warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"fire warning":{hex:"#A0522D",rgb:"160, 82, 45",crLight:5.616,crDark:3.03},"civil emergency message":{hex:"#FFB6C1",rgb:"255, 182, 193",crLight:1.652,crDark:10.301},"law enforcement warning":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"storm surge warning":{hex:"#B524F7",rgb:"181, 36, 247",crLight:4.605,crDark:3.695},"hurricane force wind warning":{hex:"#CD5C5C",rgb:"205, 92, 92",crLight:3.976,crDark:4.279},"hurricane warning":{hex:"#DC143C",rgb:"220, 20, 60",crLight:4.99,crDark:3.41},"typhoon warning":{hex:"#DC143C",rgb:"220, 20, 60",crLight:4.99,crDark:3.41},"special marine warning":{hex:"#FFA500",rgb:"255, 165, 0",crLight:1.975,crDark:8.616},"blizzard warning":{hex:"#FF4500",rgb:"255, 69, 0",crLight:3.441,crDark:4.945},"snow squall warning":{hex:"#C71585",rgb:"199, 21, 133",crLight:5.42,crDark:3.139},"ice storm warning":{hex:"#8B008B",rgb:"139, 0, 139",crLight:8.5,crDark:2.002},"heavy freezing spray warning":{hex:"#00BFFF",rgb:"0, 191, 255",crLight:2.122,crDark:8.018},"winter storm warning":{hex:"#FF69B4",rgb:"255, 105, 180",crLight:2.648,crDark:6.426},"lake effect snow warning":{hex:"#008B8B",rgb:"0, 139, 139",crLight:4.145,crDark:4.104},"dust storm warning":{hex:"#FFE4C4",rgb:"255, 228, 196",crLight:1.225,crDark:13.893},"blowing dust warning":{hex:"#FFE4C4",rgb:"255, 228, 196",crLight:1.225,crDark:13.893},"high wind warning":{hex:"#DAA520",rgb:"218, 165, 32",crLight:2.238,crDark:7.603},"tropical storm warning":{hex:"#B22222",rgb:"178, 34, 34",crLight:6.677,crDark:2.548},"storm warning":{hex:"#9400D3",rgb:"148, 0, 211",crLight:6.563,crDark:2.593},"tsunami advisory":{hex:"#D2691E",rgb:"210, 105, 30",crLight:3.633,crDark:4.683},"tsunami watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"avalanche warning":{hex:"#1E90FF",rgb:"30, 144, 255",crLight:3.236,crDark:5.257},"earthquake warning":{hex:"#8B4513",rgb:"139, 69, 19",crLight:7.098,crDark:2.397},"volcano warning":{hex:"#2F4F4F",rgb:"47, 79, 79",crLight:8.928,crDark:1.906},"ashfall warning":{hex:"#A9A9A9",rgb:"169, 169, 169",crLight:2.35,crDark:7.239},"flood warning":{hex:"#00FF00",rgb:"0, 255, 0",crLight:1.372,crDark:12.4},"coastal flood warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"lakeshore flood warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"ashfall advisory":{hex:"#696969",rgb:"105, 105, 105",crLight:5.49,crDark:3.099},"high surf warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"extreme heat warning":{hex:"#C71585",rgb:"199, 21, 133",crLight:5.42,crDark:3.139},"tornado watch":{hex:"#FFFF00",rgb:"255, 255, 0",crLight:1.074,crDark:15.845},"severe thunderstorm watch":{hex:"#DB7093",rgb:"219, 112, 147",crLight:3.111,crDark:5.47},"flash flood watch":{hex:"#2E8B57",rgb:"46, 139, 87",crLight:4.245,crDark:4.008},"gale warning":{hex:"#DDA0DD",rgb:"221, 160, 221",crLight:2.07,crDark:8.221},"flood statement":{hex:"#00FF00",rgb:"0, 255, 0",crLight:1.372,crDark:12.4},"extreme cold warning":{hex:"#0000FF",rgb:"0, 0, 255",crLight:8.592,crDark:1.98},"freeze warning":{hex:"#483D8B",rgb:"72, 61, 139",crLight:9.068,crDark:1.876},"red flag warning":{hex:"#FF1493",rgb:"255, 20, 147",crLight:3.637,crDark:4.678},"storm surge watch":{hex:"#DB7FF7",rgb:"219, 127, 247",crLight:2.503,crDark:6.798},"hurricane watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"hurricane force wind watch":{hex:"#9932CC",rgb:"153, 50, 204",crLight:5.702,crDark:2.984},"typhoon watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"tropical storm watch":{hex:"#F08080",rgb:"240, 128, 128",crLight:2.591,crDark:6.566},"storm watch":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"tropical cyclone local statement":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"winter weather advisory":{hex:"#7B68EE",rgb:"123, 104, 238",crLight:4.153,crDark:4.097},"avalanche advisory":{hex:"#CD853F",rgb:"205, 133, 63",crLight:2.99,crDark:5.69},"cold weather advisory":{hex:"#AFEEEE",rgb:"175, 238, 238",crLight:1.289,crDark:13.196},"heat advisory":{hex:"#FF7F50",rgb:"255, 127, 80",crLight:2.499,crDark:6.809},"flood advisory":{hex:"#00FF7F",rgb:"0, 255, 127",crLight:1.345,crDark:12.648},"coastal flood advisory":{hex:"#7CFC00",rgb:"124, 252, 0",crLight:1.331,crDark:12.786},"lakeshore flood advisory":{hex:"#7CFC00",rgb:"124, 252, 0",crLight:1.331,crDark:12.786},"high surf advisory":{hex:"#BA55D3",rgb:"186, 85, 211",crLight:3.942,crDark:4.317},"dense fog advisory":{hex:"#708090",rgb:"112, 128, 144",crLight:4.055,crDark:4.196},"dense smoke advisory":{hex:"#F0E68C",rgb:"240, 230, 140",crLight:1.28,crDark:13.29},"small craft advisory":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"brisk wind advisory":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"hazardous seas warning":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"dust advisory":{hex:"#BDB76B",rgb:"189, 183, 107",crLight:2.069,crDark:8.223},"blowing dust advisory":{hex:"#BDB76B",rgb:"189, 183, 107",crLight:2.069,crDark:8.223},"lake wind advisory":{hex:"#D2B48C",rgb:"210, 180, 140",crLight:1.972,crDark:8.627},"wind advisory":{hex:"#D2B48C",rgb:"210, 180, 140",crLight:1.972,crDark:8.627},"frost advisory":{hex:"#6495ED",rgb:"100, 149, 237",crLight:2.973,crDark:5.723},"freezing fog advisory":{hex:"#008080",rgb:"0, 128, 128",crLight:4.773,crDark:3.564},"freezing spray advisory":{hex:"#00BFFF",rgb:"0, 191, 255",crLight:2.122,crDark:8.018},"low water advisory":{hex:"#A52A2A",rgb:"165, 42, 42",crLight:7.084,crDark:2.402},"local area emergency":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"winter storm watch":{hex:"#4682B4",rgb:"70, 130, 180",crLight:4.108,crDark:4.142},"rip current statement":{hex:"#40E0D0",rgb:"64, 224, 208",crLight:1.642,crDark:10.364},"beach hazards statement":{hex:"#40E0D0",rgb:"64, 224, 208",crLight:1.642,crDark:10.364},"gale watch":{hex:"#FFC0CB",rgb:"255, 192, 203",crLight:1.538,crDark:11.063},"avalanche watch":{hex:"#F4A460",rgb:"244, 164, 96",crLight:2.034,crDark:8.366},"hazardous seas watch":{hex:"#483D8B",rgb:"72, 61, 139",crLight:9.068,crDark:1.876},"heavy freezing spray watch":{hex:"#BC8F8F",rgb:"188, 143, 143",crLight:2.814,crDark:6.047},"flood watch":{hex:"#2E8B57",rgb:"46, 139, 87",crLight:4.245,crDark:4.008},"coastal flood watch":{hex:"#66CDAA",rgb:"102, 205, 170",crLight:1.931,crDark:8.814},"lakeshore flood watch":{hex:"#66CDAA",rgb:"102, 205, 170",crLight:1.931,crDark:8.814},"high wind watch":{hex:"#B8860B",rgb:"184, 134, 11",crLight:3.254,crDark:5.228},"extreme heat watch":{hex:"#800000",rgb:"128, 0, 0",crLight:10.95,crDark:1.554},"extreme cold watch":{hex:"#5F9EA0",rgb:"95, 158, 160",crLight:3.05,crDark:5.578},"freeze watch":{hex:"#00FFFF",rgb:"0, 255, 255",crLight:1.254,crDark:13.57},"fire weather watch":{hex:"#FFDEAD",rgb:"255, 222, 173",crLight:1.288,crDark:13.21},"extreme fire danger":{hex:"#E9967A",rgb:"233, 150, 122",crLight:2.306,crDark:7.38},"911 telephone outage":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"coastal flood statement":{hex:"#6B8E23",rgb:"107, 142, 35",crLight:3.805,crDark:4.471},"lakeshore flood statement":{hex:"#6B8E23",rgb:"107, 142, 35",crLight:3.805,crDark:4.471},"special weather statement":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"marine weather statement":{hex:"#FFDAB9",rgb:"255, 218, 185",crLight:1.314,crDark:12.948},"air quality alert":{hex:"#808080",rgb:"128, 128, 128",crLight:3.949,crDark:4.308},"air stagnation advisory":{hex:"#808080",rgb:"128, 128, 128",crLight:3.949,crDark:4.308},"hazardous weather outlook":{hex:"#EEE8AA",rgb:"238, 232, 170",crLight:1.253,crDark:13.578},"hydrologic outlook":{hex:"#90EE90",rgb:"144, 238, 144",crLight:1.417,crDark:12.006},"short term forecast":{hex:"#98FB98",rgb:"152, 251, 152",crLight:1.266,crDark:13.439},"administrative message":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},test:{hex:"#F0FFFF",rgb:"240, 255, 255",crLight:1.027,crDark:16.572},"child abduction emergency":{hex:"#FFFFFF",rgb:"255, 255, 255",crLight:1,crDark:17.015},"blue alert":{hex:"#FFFFFF",rgb:"255, 255, 255",crLight:1,crDark:17.015}},Nt=["a","b","br","em","i","li","ol","p","strong","ul"];Tt.addHook("afterSanitizeAttributes",e=>{"A"===e.tagName&&(e.setAttribute("target","_blank"),e.setAttribute("rel","noopener noreferrer"))});const Pt=[[["tornado"],"mdi:weather-tornado"],[["tsunami"],"mdi:tsunami"],[["hurricane","tropical","typhoon","cyclone"],"mdi:weather-hurricane"],[["thunderstorm","gewitter"],"mdi:weather-lightning"],[["hail","hagel"],"mdi:weather-hail"],[["flood","hydrologic","storm surge","hochwasser"],"mdi:home-flood"],[["rain","shower","precipitation","starkregen","dauerregen"],"mdi:weather-pouring"],[["snow","blizzard","winter","schnee","schneesturm"],"mdi:weather-snowy-heavy"],[["sleet"],"mdi:weather-snowy-rainy"],[["ice","freeze","frost","glätte","glatteis"],"mdi:snowflake"],[["cold","chill","low temperature","kälte"],"mdi:thermometer-low"],[["landslide","avalanche","lawine"],"mdi:landslide"],[["volcano","ashfall","vog"],"mdi:volcano"],[["dust","sand"],"mdi:weather-dust"],[["smoke"],"mdi:smoke"],[["air quality","air stagnation"],"mdi:air-filter"],[["fire","red flag","waldbrand"],"mdi:fire"],[["heat","high temperature","hitze"],"mdi:weather-sunny-alert"],[["drought","trockenheit"],"mdi:water-off"],[["fog","nebel"],"mdi:weather-fog"],[["sheep","grazier"],"mdi:weather-windy-variant"],[["gale","squall"],"mdi:weather-windy"],[["wind","sturm","orkan","böen"],"mdi:weather-windy"],[["small craft"],"mdi:sail-boat"],[["rip current"],"mdi:wave"],[["surf","marine","coastal","seas"],"mdi:waves"]];function Ft(e){const t=e.toLowerCase().replace(/[-/]/g," ");for(const[e,i]of Pt)if(e.some(e=>t.includes(e)))return i;return"mdi:alert-circle-outline"}const Rt=[[["likely"],"mdi:check-decagram"],[["observed"],"mdi:eye-check"],[["possible","unlikely"],"mdi:help-circle-outline"]];const It=[[["tornado"],"#FF0000"],[["hurricane","typhoon","tropical storm"],"#DC143C"],[["flood"],"#228B22"],[["blizzard","ice storm"],"#FF4500"],[["snow","winter"],"#1E90FF"],[["freeze","frost","ice"],"#6495ED"],[["wind"],"#D2B48C"],[["heat"],"#FF7F50"],[["fire","red flag"],"#FF4500"],[["fog"],"#708090"],[["tsunami"],"#FD6347"]],Ot="#ffffff",Ut="#1c1c1e",Bt={subtle:{text:2,progress:1.3},strict:{text:3,progress:2}},Wt="subtle";function Ht(e){const t=e.replace("#",""),i=parseInt(t.slice(0,2),16)/255,r=parseInt(t.slice(2,4),16)/255,o=parseInt(t.slice(4,6),16)/255,s=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4;return.2126*s(i)+.7152*s(r)+.0722*s(o)}function jt(e,t){const i=Ht(e),r=Ht(t);return(Math.max(i,r)+.05)/(Math.min(i,r)+.05)}const Gt={boostLight:!1,boostDark:!1,progressBoostLight:!1,progressBoostDark:!1};function qt(e,t,i){if("off"===i)return Gt;const{text:r,progress:o}=Bt[i];return{boostLight:e<r,boostDark:t<r,progressBoostLight:e<o,progressBoostDark:t<o}}function Yt(e){const t=e.replace("#","");return`${parseInt(t.slice(0,2),16)}, ${parseInt(t.slice(2,4),16)}, ${parseInt(t.slice(4,6),16)}`}function Zt(e,t,i){return jt(e,t)>=1.9?t:i}function Kt(e,t,i,r,o){const s=function(e){return{light:Zt(e,Ot,"#1a1a1a"),dark:Zt(e,Ut,"#f5f5f5")}}(e);return{color:e,rgb:t,textColorLight:s.light,textColorDark:s.dark,...qt(i,r,o)}}function Vt(e,t=Wt){const i=e.toLowerCase(),r=zt[i];if(r)return Kt(r.hex,r.rgb,r.crLight,r.crDark,t);for(const[e,r]of It)if(e.some(e=>i.includes(e)))return Kt(r,Yt(r),jt(r,Ot),jt(r,Ut),t);const o="#808080";return Kt(o,Yt(o),jt(o,Ot),jt(o,Ut),t)}const Xt={extreme:"#D8001E",severe:"#FF9900",moderate:"#FFC800",minor:"#88C840"};function Jt(e,t=Wt){const i=Xt[e]??"#808080";return Kt(i,Yt(i),jt(i,Ot),jt(i,Ut),t)}const Qt={red:"#D10000",orange:"#FF9500",yellow:"#FFFF00",grey:"#656565"},ei={extreme:"#D10000",severe:"#FF9500",moderate:"#FFFF00",minor:"#656565",unknown:"#656565"};function ti(e,t=Wt){const i=e.colorHint?.toLowerCase(),r=(i&&Qt[i])??ei[e.severity]??"#808080";return Kt(r,Yt(r),jt(r,Ot),jt(r,Ut),t)}function ii(e){if(!e||"None"===e||""===e.trim())return 0;const t=new Date(e.trim());return isNaN(t.getTime())?0:t.getTime()/1e3}function ri(e,t){if(!t?.timeZone)return"";const i=new Intl.DateTimeFormat(t.language,{timeZoneName:"short",timeZone:t.timeZone}).formatToParts(e);return i.find(e=>"timeZoneName"===e.type)?.value??""}function oi(e,t){const i=t?.language,r=t?.date_format,o=t?.timeZone;if(!r||"language"===r)return e.toLocaleDateString(i,{timeZone:o});const s=new Intl.DateTimeFormat(i,{day:"numeric",month:"numeric",year:"numeric",timeZone:o}).formatToParts(e),n=s.find(e=>"day"===e.type)?.value??"",a=s.find(e=>"month"===e.type)?.value??"",c=s.find(e=>"year"===e.type)?.value??"";switch(r){case"DMY":return`${n}/${a}/${c}`;case"MDY":return`${a}/${n}/${c}`;case"YMD":return`${c}/${a}/${n}`;default:return e.toLocaleDateString(i,{timeZone:o})}}function si(e,t,i){const r=function(e){if(!e)return{locale:void 0};const t=e.language;return"12"===e.time_format?{locale:t,hour12:!0}:"24"===e.time_format?{locale:t,hour12:!1}:{locale:t}}(t),o={hour:i,minute:"2-digit",timeZone:t?.timeZone};return void 0!==r.hour12&&(o.hour12=r.hour12),e.toLocaleTimeString(r.locale,o)}function ni(e,t,i="en"){if(e<=0)return Mt("progress.na",i);const r=new Date(1e3*e),o=new Date,s=ri(r,t),n=si(r,t,"2-digit"),a=s?`${n} ${s}`:n;return function(e,t,i){const r=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:i});return r.format(e)===r.format(t)}(r,o,t?.timeZone)?a:`${a} (${oi(r,t)})`}function ai(e,t,i="en"){if(e<=100)return Mt("progress.na",i);const r=new Date(1e3*e),o=ri(r,t),s=si(r,t,"numeric"),n=o?`${s} ${o}`:s;return`${oi(r,t)}, ${n}`}function ci(e,t=Date.now()/1e3,i="en"){const r=e-t,o=Math.abs(r),s=r<0;if(o<60)return Mt(s?"time.just_now":"time.in_less_than_1m",i);if(o<3600){const e=Math.floor(o/60);return Mt(s?"time.minutes_ago":"time.in_minutes",i,{m:e})}if(o<86400){const e=Math.floor(o/3600),t=Math.floor(o%3600/60),r=t>0?`${e}h ${t}m`:`${e}h`;return Mt(s?"time.hours_ago":"time.in_hours",i,{dur:r})}const n=Math.floor(o/86400);return Mt(s?"time.days_ago":"time.in_days",i,{d:n})}function di(e,t=Date.now()/1e3){const i=Math.abs(e-t);if(i<60)return"<1m";if(i<3600){return`${Math.floor(i/60)}m`}if(i<86400){const e=Math.floor(i/3600),t=Math.floor(i%3600/60);return t>0?`${e}h ${t}m`:`${e}h`}const r=Math.floor(i/86400),o=Math.floor(i%86400/3600);return o>0?`${r}d ${o}h`:`${r}d`}function li(e){if(!e)return"";const t=/^\s*[·•\-]\s/,i=/^\.[A-Z]/;return e.split(/\n{2,}/).map(e=>{const r=e.split("\n"),o=[];for(const e of r)0===o.length?o.push(e.trimStart()):t.test(e)||i.test(e.trimStart())||o[o.length-1].trimEnd().endsWith(":")?o.push(e):o[o.length-1]+=" "+e.trimStart();return o.map(e=>e.replace(/ {2,}/g," ")).map(e=>e.trimEnd()).filter(Boolean).join("\n")}).filter(Boolean).join("\n\n")}function hi(e){const t=(e||"").toLowerCase().replace(/\s/g,"");return["extreme","severe","moderate","minor"].includes(t)?t:"unknown"}const pi={extreme:0,severe:1,moderate:2,minor:3,unknown:4};function ui(e){const t=e.split("/");return t[t.length-1].toUpperCase()}function gi(e){const t=[];if(Array.isArray(e.AffectedZones))for(const i of e.AffectedZones)"string"==typeof i&&i&&t.push(ui(i));if(Array.isArray(e.Geocode?.UGC))for(const i of e.Geocode.UGC){if("string"!=typeof i||!i)continue;const e=i.toUpperCase();t.includes(e)||t.push(e)}return t}function mi(e){if(e.area_id&&e.id.startsWith(e.area_id+"_")){const t=e.id.slice(e.area_id.length+1);return`https://www.bom.gov.au/warning/${e.type.replace(/_/g,"-")}/${t}`}return"https://www.bom.gov.au/weather-and-climate/warnings-and-alerts"}const _i={new:"New",update:"Updated",renewal:"Renewed",upgrade:"Upgraded",downgrade:"Downgraded",final:"Final"};const fi={"#880e4f":{severity:"extreme",label:"Extreme"},"#ff0000":{severity:"severe",label:"Severe"},"#ff9900":{severity:"moderate",label:"Moderate"},"#ffff00":{severity:"minor",label:"Minor"}};function vi(e,t){if("number"==typeof e)switch(e){case 4:return{severity:"extreme",label:"Extreme"};case 3:return{severity:"severe",label:"Severe"};case 2:return{severity:"moderate",label:"Moderate"};case 1:return{severity:"minor",label:"Minor"};case 0:return{severity:"unknown",label:"Unknown"}}if("string"==typeof t){const e=fi[t.toLowerCase()];if(e)return e}return{severity:"unknown",label:"Unknown"}}function yi(e){if(!e||"string"!=typeof e)return;const t=parseInt(e.split(";")[0].trim(),10);return t>=4?"extreme":3===t?"severe":2===t?"moderate":1===t?"minor":void 0}function bi(e){return"string"==typeof e?e:""}function wi(e){return"string"==typeof e?e:""}const xi={new:"New",update:"Update",cancel:"Cancel",expired:"Expired"};function Ai(e){const t=[],i=new Set;for(const r of["affected_zones","geocode_ugc","geocode_same"]){const o=e[r];if(Array.isArray(o))for(const e of o){if("string"!=typeof e)continue;const r=e.toUpperCase();i.has(r)||(i.add(r),t.push(r))}}return t}function Ci(e){return"string"==typeof e?e:""}function $i(e){return e.startsWith("http://")||e.startsWith("https://")?e:""}const Si="environnement canada",ki={red:"extreme",orange:"severe",yellow:"moderate",grey:"minor",green:"unknown",rouge:"extreme",jaune:"moderate",gris:"minor",vert:"unknown"},Di={warning:"severe",watch:"moderate",advisory:"minor",statement:"minor",ending:"unknown"},Ei={high:"severe",medium:"moderate",moderate:"moderate",low:"minor","élevé":"severe","élevée":"severe","modéré":"moderate","modérée":"moderate",faible:"minor"},Ti={high:"Likely",moderate:"Possible",medium:"Possible",low:"Unlikely","élevée":"Likely","élevé":"Likely","modérée":"Possible","modéré":"Possible",faible:"Unlikely"},Li={new:"New",issued:"New",continued:"Continued",updated:"Updated",extended:"Updated",expired:"Final",ended:"Final","émis":"New",maintenu:"Continued","mis à jour":"Updated","prolongé":"Updated","terminé":"Final","annulé":"Final"};function Mi(e){return e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()}function zi(e){if(!e)return"";const t=e.toLowerCase();return Li[t]??Mi(e)}function Ni(e){return function(e){return"string"==typeof e&&e.toLowerCase().includes(Si)}(e)?"https://meteo.gc.ca/index_f.html":"https://weather.gc.ca/index_e.html"}function Pi(e){return"string"==typeof e?e:""}const Fi=[new class{constructor(){this.provider="cap"}canHandle(e){return"string"==typeof e.incident_platform_version&&"string"==typeof e.id}parseAlerts(e){const t=Ci(e.id);if(!t)return[];const i=Ci(e.event),r=Ci(e.severity),o=Ci(e.severity_normalized),s=hi(o||r),n=r||o,a=n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():s.charAt(0).toUpperCase()+s.slice(1),c=ii(Ci(e.sent)||Ci(e.effective)),d=ii(Ci(e.onset))||c,l=ii(Ci(e.ends))||ii(Ci(e.expires)),h=Ci(e.icon),p=h.startsWith("mdi:")?h:void 0,u=Ci(e.geometry_ref)||void 0,g=function(e){return Array.isArray(e)&&4===e.length&&e.every(e=>"number"==typeof e&&Number.isFinite(e))?[e[0],e[1],e[2],e[3]]:void 0}(e.bbox);return[{id:t,event:i||"Unknown",severity:s,severityLabel:a,certainty:Ci(e.certainty),urgency:Ci(e.urgency),sentTs:c,onsetTs:d,endsTs:l,description:Ci(e.description),instruction:Ci(e.instruction),url:$i(Ci(e.url))||$i(Ci(e.web)),headline:Ci(e.headline),areaDesc:Ci(e.area_desc),zones:Ai(e),eventCode:Ci(e.event_code_nws)||Ci(e.event_code_same),provider:"cap",phase:(m=Ci(e.phase),xi[m.toLowerCase()]||""),severityInferred:!r&&!o,certaintyInferred:!1,...void 0!==p&&{providerIcon:p},...void 0!==u&&{geometryRef:u},...void 0!==g&&{bbox:g}}];var m}},new class{constructor(){this.provider="nws"}canHandle(e){const t=e.Alerts;if(!Array.isArray(t))return!1;if(0===t.length)return!0;const i=t[0];return"object"==typeof i&&null!==i&&"Event"in i&&"Severity"in i}parseAlerts(e){const t=e.Alerts;return Array.isArray(t)?t.filter(e=>"object"==typeof e&&null!==e).map(e=>this._normalize(e)):[]}_normalize(e){const t=hi(e.Severity);return{id:e.ID,event:e.Event||"Unknown",severity:t,severityLabel:e.Severity&&"unknown"!==hi(e.Severity)?e.Severity:t.charAt(0).toUpperCase()+t.slice(1),certainty:e.Certainty||"",urgency:e.Urgency||"",sentTs:ii(e.Sent),onsetTs:ii(e.Onset),endsTs:ii(e.Ends)||ii(e.Expires),description:e.Description||"",instruction:e.Instruction||"",url:e.URL||"",headline:e.Headline||"",areaDesc:e.AreaDesc||e.AreasAffected||"",zones:gi(e),eventCode:e.NWSCode||"",provider:"nws",phase:"",severityInferred:!e.Severity||"unknown"===hi(e.Severity),certaintyInferred:!1}}},new class{constructor(){this.provider="bom"}canHandle(e){const t=e.warnings;if(!Array.isArray(t))return!1;if(0===t.length)return"string"==typeof e.attribution&&e.attribution.toLowerCase().includes("bureau of meteorology");const i=t[0];return"object"==typeof i&&null!==i&&"warning_group_type"in i&&"issue_time"in i}parseAlerts(e){const t=e.warnings;return Array.isArray(t)?t.filter(e=>"object"==typeof e&&null!==e).filter(e=>"cancelled"!==e.phase).map(e=>this._normalize(e)):[]}_normalize(e){const t=ii(e.issue_time),i=ii(e.expiry_time),r=(o=e).title||o.short_title||o.type.replace(/_/g," ");var o;const{severity:s,label:n}=function(e,t,i){const r=e.toLowerCase();if(r.includes("extreme")||r.includes("tropical cyclone"))return{severity:"extreme",label:(r.includes("extreme"),"Extreme")};if(r.includes("severe"))return{severity:"severe",label:"Severe"};if(r.includes("major"))return{severity:"severe",label:"Major"};if(r.includes("moderate"))return{severity:"moderate",label:"Moderate"};if(r.includes("minor")||r.includes("initial"))return{severity:"minor",label:"Minor"};const o=t.toLowerCase();if(o.includes("tropical_cyclone"))return{severity:"extreme",label:"Extreme"};if(o.includes("severe")||o.includes("fire_weather"))return{severity:"severe",label:"Severe"};const s=i.charAt(0).toUpperCase()+i.slice(1);return"major"===i?{severity:"moderate",label:s}:{severity:"minor",label:s}}(r,e.type,e.warning_group_type);return{id:e.id,event:r,severity:s,severityLabel:n,certainty:"",urgency:"",sentTs:t,onsetTs:t,endsTs:i,description:"",instruction:"",url:mi(e),headline:e.short_title||r,areaDesc:e.state||"",zones:e.area_id?[e.area_id.toUpperCase()]:[],eventCode:"",provider:"bom",phase:(a=e.phase,_i[a.toLowerCase()]||""),severityInferred:!0,certaintyInferred:!1};var a}},new class{constructor(){this.provider="dwd"}canHandle(e){if("number"!=typeof e.warning_count)return!1;if("string"!=typeof e.region_name)return!1;return!(e.warning_count>0)||"object"==typeof(t=e.warning_1)&&null!==t&&"number"==typeof t.level&&"string"==typeof t.color;var t}parseAlerts(e){const t="number"==typeof e.warning_count?e.warning_count:0;if(t<=0)return[];const i="string"==typeof e.region_name?e.region_name:"",r=[];for(let o=1;o<=t;o++){const t=e[`warning_${o}`];if(!t||"object"!=typeof t)continue;const s=t,n="number"==typeof s.level?s.level:void 0;if(0===n)continue;const{severity:a,label:c}=vi(n,s.color),d=ii(s.start_time),l=ii(s.end_time),h="number"==typeof s.event_code?String(s.event_code):"",p="string"==typeof s.event?s.event:"";r.push({id:`dwd_${h||p}_${d}`,event:p,severity:a,severityLabel:c,certainty:"",urgency:"",sentTs:0,onsetTs:d,endsTs:l,description:"string"==typeof s.description?s.description:"",instruction:"string"==typeof s.instruction?s.instruction:"",url:"https://www.dwd.de/DE/wetter/warnungen_gemeinden/warnWetter_node.html",headline:"string"==typeof s.headline?s.headline:"",areaDesc:i,zones:[],eventCode:h,provider:"dwd",phase:"",severityInferred:!1,certaintyInferred:!1})}return r}},new class{constructor(){this.provider="meteoalarm"}canHandle(e){return!("string"!=typeof e.attribution||!e.attribution.toLowerCase().includes("meteoalarm"))||"string"==typeof e.awareness_level&&"string"==typeof e.awareness_type}parseAlerts(e){const t=bi(e.event),i=bi(e.headline);if(!t&&!i)return[];const r=bi(e.awareness_level),o=yi(r)||hi(bi(e.severity)),s=function(e){if(!e||"string"!=typeof e)return"";const t=e.split(";");return t.length>=3?t[2].trim():""}(r)||bi(e.severity)||o.charAt(0).toUpperCase()+o.slice(1),n=ii(bi(e.onset)||bi(e.effective)),a=ii(bi(e.expires)),c=ii(bi(e.effective)),d=function(e){if(!e||"string"!=typeof e)return"";const t=e.split(";");return t.length>1?t.slice(1).join(";").trim():""}(bi(e.awareness_type)),l=t||d||i,h=!yi(r)&&!bi(e.severity);return[{id:`meteoalarm_${l}_${n}`,event:l,severity:o,severityLabel:s,certainty:bi(e.certainty),urgency:bi(e.urgency),sentTs:c,onsetTs:n||c,endsTs:a,description:bi(e.description),instruction:bi(e.instruction),url:"",headline:i||l,areaDesc:bi(e.senderName),zones:[],eventCode:"",provider:"meteoalarm",iconHint:d,phase:"",severityInferred:h,certaintyInferred:!1}]}},new class{constructor(){this.provider="eccc"}canHandle(e){const t=e.attribution;if("string"!=typeof t)return!1;const i=t.toLowerCase();return i.includes("environment canada")||i.includes(Si)}parseAlerts(e){const t=e.alerts;if(!Array.isArray(t))return[];const i=Ni(e.attribution);return t.filter(e=>"object"==typeof e&&null!==e).filter(e=>{const t=Pi(e.status).toLowerCase();return"cancelled"!==t&&"annulé"!==t}).map(e=>this._normalize(e,i))}_normalize(e,t){const i=ii(e.issued),r=ii(e.expiry),o=function(...e){let t="unknown",i=pi[t];for(const r of e){const e=pi[r]??pi.unknown;e<i&&(t=r,i=e)}return t}((a=e.color)?ki[a.toLowerCase()]??"unknown":"unknown",(n=e.type)?Di[n.toLowerCase()]??"unknown":"unknown",(s=e.impact)?Ei[s.toLowerCase()]??"unknown":"unknown");var s,n,a;const c=Pi(e.title),d=Pi(e.alert_code),l=Pi(e.area),h=e.color?e.color.toLowerCase():void 0,p=Pi(e.impact),u=p?Mi(p):void 0,g=u??o.charAt(0).toUpperCase()+o.slice(1);var m;return{id:`eccc_${d||c||"unknown"}_${l}_${i}`,event:c,severity:o,severityLabel:g,certainty:(m=e.confidence)?Ti[m.toLowerCase()]??"":"",urgency:"",sentTs:i,onsetTs:i,endsTs:r,description:Pi(e.text),instruction:"",url:Pi(e.url)||t,headline:c,areaDesc:l,zones:[],eventCode:d,provider:"eccc",phase:zi(e.status),severityInferred:!e.color&&!e.type&&!e.impact,certaintyInferred:!e.confidence,colorHint:h,severityBadgeLabel:u}}},new class{constructor(){this.provider="pirateweather"}canHandle(e){return"string"==typeof e.attribution&&e.attribution.toLowerCase().includes("pirate weather")}parseAlerts(e){const t=[],i="string"==typeof e.title&&""!==e.title,r="string"==typeof e.title_0&&""!==e.title_0;if(i&&!r){const i=this._parseOne(e,"");i&&t.push(i)}for(let i=0;;i++){const r=`_${i}`;if("string"!=typeof e[`title${r}`]||""===e[`title${r}`])break;const o=this._parseOne(e,r);o&&t.push(o)}return t}_parseOne(e,t){const i=wi(e[`title${t}`]);if(!i)return null;const r=wi(e[`severity${t}`]),o=hi(r),s=r?r.charAt(0).toUpperCase()+r.slice(1).toLowerCase():o.charAt(0).toUpperCase()+o.slice(1),n=ii(wi(e[`time${t}`])),a=ii(wi(e[`expires${t}`])),c=e[`regions${t}`],d=Array.isArray(c)?c.join(", "):wi(c),l=wi(e[`uri${t}`]);return{id:`pirateweather_${i}_${n}`,event:i,severity:o,severityLabel:s,certainty:"",urgency:"",sentTs:n,onsetTs:n,endsTs:a,description:wi(e[`description${t}`]),instruction:"",url:l,headline:i,areaDesc:d,zones:[],eventCode:"",provider:"pirateweather",phase:"",severityInferred:!r||"unknown"===hi(r),certaintyInferred:!1}}}],Ri=[/^sensor\..*alerts?$/i,/^sensor\..*warnings?$/i,/^binary_sensor\.meteoalarm/i,/^sensor\.dwd_weather_warnings/i,/^sensor\..*cap_alert_/i];function Ii(e){return Fi.some(t=>t.canHandle(e))}function Oi(e,t){if(e){const t=Fi.find(t=>t.provider===e);if(t)return t}for(const e of Fi)if(e.canHandle(t))return e;return Fi.find(e=>"nws"===e.provider)??Fi[0]}function Ui(e,t,i){const r=i??(e.entities?Object.values(e.entities):null);if(!r)return[];const o=[];for(const i of r){if(!i||i.device_id!==t)continue;const r=i.entity_id;if(!r)continue;const s=e.states[r];s&&Ii(s.attributes)&&o.push(r)}return o}async function Bi(e,t){const i=async()=>{const i=await e.sendMessagePromise({type:"config/entity_registry/list"});t(i??[])};let r=null,o=!1;const s=()=>{null===r?(i().catch(()=>{}),r=setTimeout(()=>{r=null,o&&(o=!1,s())},250)):o=!0},n=await e.subscribeEvents(()=>s(),"entity_registry_updated");return await i(),()=>{null!==r&&(clearTimeout(r),r=null),o=!1,n()}}const Wi="weather-alerts-card:dismissals-changed";function Hi(){return Math.floor(Date.now()/1e3)}function ji(e){return`${e.severity}|${e.sentTs}|${e.endsTs}|${e.phase||""}`}function Gi(e){return"weather-alerts-card:dismissals:v1:"+e}function qi(e){if(!e)return[];const t=[];if(e.entity&&t.push(e.entity),e.entities)for(const i of e.entities)i&&t.push(i);return e.device&&t.push(`device:${e.device}`),t}function Yi(e){const t=qi(e);if(0===t.length)return"";const[i,...r]=t;return function(e,t){const i=[e,...t].filter(Boolean).sort().join("\n");let r=2166136261;for(let e=0;e<i.length;e++)r^=i.charCodeAt(e),r=Math.imul(r,16777619);return(r>>>0).toString(16).padStart(8,"0")}(i,r)}function Zi(){try{return"undefined"!=typeof localStorage?localStorage:null}catch{return null}}function Ki(e){if("undefined"!=typeof window)try{window.dispatchEvent(new CustomEvent(Wi,{detail:{scope:e}}))}catch{}}function Vi(e,t){if("undefined"==typeof window)return()=>{};const i=i=>{const r=i.detail;r&&r.scope===e&&t()},r=Gi(e),o=e=>{null!==e.key&&e.key!==r||t()};return window.addEventListener(Wi,i),window.addEventListener("storage",o),()=>{window.removeEventListener(Wi,i),window.removeEventListener("storage",o)}}function Xi(e,t=Hi()){const i=new Map,r=Zi();if(!r)return i;let o,s;try{o=r.getItem(Gi(e))}catch{return i}if(!o)return i;try{s=JSON.parse(o)}catch{return i}if(!s||"object"!=typeof s)return i;const n=s;for(const[e,r]of Object.entries(n)){if(!r||"object"!=typeof r)continue;const o=r;"string"==typeof o.sig&&"number"==typeof o.dismissedAt&&"number"==typeof o.lastSeenAt&&(t-o.lastSeenAt>2592e3||i.set(e,{sig:o.sig,dismissedAt:o.dismissedAt,lastSeenAt:o.lastSeenAt}))}return i}function Ji(e,t){const i=Zi();if(!i)return void Ki(e);const r=Gi(e);try{if(0===t.size)i.removeItem(r);else{const e={};for(const[i,r]of t)e[i]=r;i.setItem(r,JSON.stringify(e))}}catch{}Ki(e)}async function Qi(e,t){try{const i=await e.sendMessagePromise({type:"cap_alerts/geometry",geometry_ref:t}),r=i?.features?.[0]?.geometry;return r&&"string"==typeof r.type?r:null}catch{return null}}const er=1e-4;function tr(e){if(!e)return[];if("Polygon"===e.type){const t=e.coordinates;return Array.isArray(t)&&t.length>0?[t[0]]:[]}if("MultiPolygon"===e.type){const t=e.coordinates;return Array.isArray(t)?t.map(e=>Array.isArray(e)&&e.length>0?e[0]:null).filter(e=>Array.isArray(e)&&e.length>0):[]}return[]}function ir(e,t){if(!Array.isArray(e)||0===e.length)return null;let i="";for(let r=0;r<e.length;r++){const o=e[r];if(!Array.isArray(o)||o.length<2)continue;const[s,n]=t(o[0],o[1]);i+=`${0===r?"M":"L"}${rr(s)},${rr(n)}`}return i?`${i}Z`:null}function rr(e){return Number(e.toFixed(5)).toString()}const or="© OpenStreetMap, CARTO",sr=256,nr=85.05112878;function ar(e){return Math.max(-85.05112878,Math.min(nr,e))}function cr(e,t,i){const r=sr*Math.pow(2,i),o=(e+180)/360*r,s=ar(t)*Math.PI/180;return[o,(1-Math.log(Math.tan(s)+1/Math.cos(s))/Math.PI)/2*r]}function dr(e,t,i,r){return e.split("{z}").join(String(t)).split("{x}").join(String(i)).split("{y}").join(String(r)).split("{s}").join("a")}function lr(e,t,i){const r=i?.tileUrl,o=i?.attribution||or,[s,n,a,c]=e,d=Math.max(.15*(a-s),er),l=Math.max(.15*(c-n),er),h=s-d,p=a+d,u=ar(n-l),g=ar(c+l),m=function(e,t,i,r){for(let o=16;o>=1;o--){const[s,n]=cr(e,r,o),[a,c]=cr(i,t,o);if(a-s<=512&&c-n<=512)return o}return 1}(h,u,p,g),_=Math.pow(2,m),[f,v]=cr(h,g,m),[y,b]=cr(p,u,m),w=Math.max(y-f,er),x=Math.max(b-v,er),A=`0 0 ${rr(w)} ${rr(x)}`,C=`${rr(w)} / ${rr(x)}`,$=[],S=Math.floor(f/sr),k=Math.floor((y-1e-6)/sr),D=Math.floor(v/sr),E=Math.floor((b-1e-6)/sr);if((k-S+1)*(E-D+1)<=16)for(let e=D;e<=E;e++)if(!(e<0||e>=_))for(let t=S;t<=k;t++){const i=(t%_+_)%_;$.push({href:dr(r,m,i,e),x:Number((t*sr-f).toFixed(3)),y:Number((e*sr-v).toFixed(3)),size:sr})}const T=(e,t)=>{const[i,r]=cr(e,t,m);return[i-f,r-v]},L=tr(t).map(e=>ir(e,T)).filter(e=>null!==e);return{viewBox:A,aspect:C,tiles:$,polygonPaths:L,attribution:o}}const hr=n`
  @keyframes pulse-border {
    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--wac-fg) 70%, transparent); }
    70% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--wac-fg) 0%, transparent); }
    100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--wac-fg) 0%, transparent); }
  }

  @keyframes ongoing-pulse {
    0% { background: color-mix(in srgb, var(--wac-progress-fg) 80%, transparent); }
    50% { background: color-mix(in srgb, var(--wac-progress-fg) 50%, transparent); }
    100% { background: color-mix(in srgb, var(--wac-progress-fg) 80%, transparent); }
  }

  @keyframes stripe-march-sm {
    to { background-position: -12px 0; }
  }

  @keyframes stripe-march-lg {
    to { background-position: -24px 0; }
  }

  @keyframes fill-shimmer {
    0% { background-position: -75% 0; }
    60% { background-position: 175% 0; }
    100% { background-position: 175% 0; }
  }

  :host {
    display: block;
  }

  .error {
    padding: 16px;
    color: var(--error-color, red);
  }

  .sensor-unavailable {
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  /* --- COLOR MAPPING --- */
  .severity-extreme,
  .severity-severe { --color: var(--error-color); --color-rgb: 244, 67, 54; --color-on: #ffffff; }
  .severity-moderate { --color: var(--warning-color); --color-rgb: 255, 152, 0; --color-on: #1a1a1a; }
  .severity-minor { --color: var(--info-color); --color-rgb: 33, 150, 243; --color-on: #ffffff; }
  .severity-unknown { --color: var(--secondary-text-color); --color-rgb: 128, 128, 128; --color-on: var(--primary-text-color); }

  /* --- CARD CONTAINER --- */
  .alert-card {
    /* Two foreground tokens, both default to the raw theme color:
         --wac-fg          — icon + label text (boost-{light,dark}, ~2:1 tier)
         --wac-progress-fg — progress-bar fill (progress-boost-{light,dark},
                             ~1.3:1 tier — only kicks in for near-invisible
                             tints like yellow Tornado Watch)
       Boost rules below override these only when the event's color fails
       the corresponding threshold on the active side (precomputed per
       NWS/MeteoAlarm entry). HA's --primary-text-color flips with theme
       mode; --text-primary-color is the "text on accent" color — do not
       confuse them. */
    --wac-fg: var(--color);
    --wac-progress-fg: var(--color);
    position: relative;
    margin-bottom: 16px;
    padding: 0;
    border-radius: 12px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    box-shadow: var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.1));
    overflow: hidden;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.15s ease-out;
  }

  /* Contrast boost: only when theme mode matches the failing side.
     Scoped to event-color themes (nws, meteoalarm). Severity theme
     never receives these classes — its colors are HA theme tokens. */
  [data-theme-mode="light"] .alert-card.boost-light,
  [data-theme-mode="dark"] .alert-card.boost-dark {
    --wac-fg: color-mix(in oklch, var(--color) 65%, var(--primary-text-color));
  }
  [data-theme-mode="light"] .alert-card.progress-boost-light,
  [data-theme-mode="dark"] .alert-card.progress-boost-dark {
    --wac-progress-fg: color-mix(in oklch, var(--color) 65%, var(--primary-text-color));
  }

  /* Badge text follows the card background color (knockout effect) so
     saturated pills read as windows into the page rather than dark markings
     on color. Event-color themes emit both --color-on-light and
     --color-on-dark inline; this rule picks the right one per theme mode. */
  [data-theme-mode="light"] .alert-card { --color-on: var(--color-on-light, #ffffff); }
  [data-theme-mode="dark"]  .alert-card { --color-on: var(--color-on-dark,  #1a1a1a); }

  .alert-card:last-child {
    margin-bottom: 0;
  }

  .alert-card::before {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: var(--color);
  }

  .alert-card.severity-extreme,
  .alert-card.severity-severe {
    animation: pulse-border 2s infinite;
    border-color: var(--color);
  }

  /* --- HEADER --- */
  .alert-header-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 16px;
  }

  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--color-rgb), 0.1);
    color: var(--wac-fg);
    width: calc(44px * var(--wac-scale, 1));
    height: calc(44px * var(--wac-scale, 1));
    border-radius: 50%;
    flex-shrink: 0;
    box-sizing: border-box;
    border: 2px solid transparent;
    transition: border 0.2s, background 0.2s, color 0.2s;
  }

  /* Temporal state: active — icon "lights up" with solid ring */
  .active .icon-box {
    border-color: var(--color);
    background: rgba(var(--color-rgb), 0.12);
  }

  /* Temporal state: expired — dimmed */
  .expired .icon-box {
    border-color: var(--divider-color);
    opacity: 0.5;
  }
  .expired {
    opacity: 0.6;
  }

  /* Temporal state: preparation — dashed ring */
  .preparation .icon-box {
    border: 2px dashed var(--color);
  }
  .icon-box ha-icon { --mdc-icon-size: calc(26px * var(--wac-scale, 1)); }

  .info-box { flex-grow: 1; }

  .title-row { margin-bottom: 4px; }
  .alert-title {
    font-size: calc(1.15rem * var(--wac-scale, 1));
    font-weight: 600;
    line-height: 1.2;
    color: var(--primary-text-color);
  }

  .alert-headline {
    font-size: calc(0.8rem * var(--wac-scale, 1));
    line-height: 1.3;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }

  .area-desc {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    font-size: calc(0.8rem * var(--wac-scale, 1));
    line-height: 1.4;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
    max-width: 100%;
    opacity: 0.85;
  }
  .area-desc ha-icon {
    flex-shrink: 0;
    margin-top: 1px;
    --mdc-icon-size: calc(13px * var(--wac-scale, 1));
    width: calc(13px * var(--wac-scale, 1));
    height: calc(13px * var(--wac-scale, 1));
    opacity: 0.7;
  }
  .area-desc-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Compact expanded headline + area-desc get consistent inner padding */
  .compact .alert-expanded .alert-headline {
    padding: 4px 12px 0;
    margin-bottom: 2px;
  }
  .compact .alert-expanded .area-desc {
    padding: 4px 12px 0;
    margin-bottom: 4px;
  }

  .badges-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    line-height: 1;
    font-size: calc(0.75rem * var(--wac-scale, 1));
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .severity-badge {
    background: var(--color);
    color: var(--color-on);
    font-weight: 700;
  }
  .certainty-badge {
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
  }
  .phase-badge {
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
  }
  .event-code-badge {
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
    font-family: monospace;
    text-transform: none;
    letter-spacing: 1px;
  }
  .badge-inferred {
    font-style: italic;
  }
  .badge-inferred::before {
    content: '~';
    opacity: 0.6;
    margin-right: 1px;
  }

  .zones-badge {
    background: transparent;
    color: var(--secondary-text-color);
    border: none;
    padding: 2px 0;
    font-weight: 400;
  }
  .zones-badge::before { content: '('; opacity: 0.5; }
  .zones-badge::after { content: ')'; opacity: 0.5; }

  /* --- PROGRESS --- */
  .progress-section {
    padding: 0 16px 16px 16px;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    font-size: calc(0.85rem * var(--wac-scale, 1));
    color: var(--primary-text-color);
    margin-bottom: 6px;
  }

  .label-left, .label-center, .label-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .label-sub {
    font-size: calc(0.7rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    text-transform: uppercase;
  }
  .label-center {
    text-align: center;
    font-weight: bold;
    color: var(--wac-fg);
    white-space: nowrap;
  }
  .label-right { text-align: right; }

  .progress-track {
    height: 8px;
    background: var(--secondary-background-color);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    position: absolute;
    top: 0;
    transition: width 0.3s ease;
  }

  .active .progress-fill {
    background-color: var(--wac-progress-fg);
    background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: fill-shimmer 5s ease-in-out infinite;
  }

  .expired .progress-fill {
    background-color: var(--divider-color);
  }

  .preparation .progress-fill {
    background-color: transparent;
    background-image: linear-gradient(
      -45deg,
      var(--wac-progress-fg) 25%,
      transparent 25%,
      transparent 50%,
      var(--wac-progress-fg) 50%,
      var(--wac-progress-fg) 75%,
      transparent 75%
    );
    background-size: 24px 24px;
    opacity: 0.6;
    animation: stripe-march-lg 6s linear infinite;
  }

  /* --- DETAILS (custom toggle, not native <details>) --- */
  .alert-details-section {
    border-top: 1px solid var(--divider-color);
    background: rgba(var(--rgb-primary-text-color), 0.02);
  }

  .details-summary {
    padding: 10px 16px;
    font-size: calc(0.9rem * var(--wac-scale, 1));
    font-weight: 500;
    color: var(--secondary-text-color);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
    user-select: none;
  }
  .details-summary:hover {
    background: rgba(var(--color-rgb), 0.05);
    color: var(--primary-text-color);
  }

  .chevron {
    transition: transform 0.2s;
  }
  .chevron.expanded {
    transform: rotate(180deg);
  }

  .details-content {
    padding: 16px;
    font-size: calc(0.9rem * var(--wac-scale, 1));
  }

  /* Details Grid */
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--divider-color);
  }

  .meta-item { display: flex; flex-direction: column; }
  .meta-label {
    font-size: calc(0.7rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    text-transform: uppercase;
  }
  .meta-value {
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .meta-relative {
    font-size: calc(0.75rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    font-style: italic;
  }

  /* --- GEOMETRY MINI-MAP (cap_alerts, opt-in) --- */
  .alert-geometry {
    display: block;
    width: 100%;
    max-width: 260px;
    height: 120px;
    margin: 0 auto 16px;
    /* No basemap — the shape reads against the panel background. */
  }
  .alert-geometry .geometry-frame {
    fill: rgba(var(--color-rgb), 0.04);
    stroke: var(--divider-color);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }
  .alert-geometry .geometry-shape {
    fill: rgba(var(--color-rgb), 0.18);
    stroke: var(--wac-fg, var(--color));
    stroke-width: 1.5px;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  /* Map style: raster tiles behind the polygon. The wrapper carries an inline
     aspect-ratio (matching the tile viewBox) so tiles fill with no letterbox. */
  .alert-geometry-map {
    position: relative;
    display: block;
    width: 100%;
    max-width: 320px;
    max-height: 220px;
    margin: 0 auto 16px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
  }
  .alert-geometry.map {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    max-width: none;
  }
  .alert-geometry.map image {
    image-rendering: auto;
  }
  /* Over tiles the bbox frame is just a hairline; the polygon does the work. */
  .alert-geometry.map .geometry-frame {
    fill: none;
    stroke: rgba(var(--rgb-primary-text-color, 128, 128, 128), 0.25);
  }
  .alert-geometry.map .geometry-shape {
    fill: rgba(var(--color-rgb), 0.22);
    stroke-width: 2px;
  }
  /* White casing under the colored stroke keeps the outline legible over busy
     tiles (light or dark). */
  .alert-geometry.map .geometry-shape-casing {
    fill: none;
    stroke: rgba(255, 255, 255, 0.85);
    stroke-width: 4px;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  .geometry-attrib {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 9px;
    line-height: 1.2;
    padding: 1px 4px;
    color: #333;
    background: rgba(255, 255, 255, 0.7);
    border-top-left-radius: 4px;
    pointer-events: none;
  }

  .text-block { margin-bottom: 16px; }
  .text-label {
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--primary-text-color);
  }
  .text-body {
    white-space: pre-wrap;
    color: var(--secondary-text-color);
    line-height: 1.5;
    background: var(--primary-background-color);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
  }

  .provider-hint {
    font-size: calc(0.7rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    letter-spacing: 0.5px;
    opacity: 0.5;
    margin-right: 6px;
    flex-shrink: 0;
  }
  .provider-hint::after {
    content: '·';
    margin-left: 6px;
    opacity: 0.6;
  }
  .footer-link { text-align: right; margin-top: 10px; }
  .footer-link a {
    color: var(--wac-fg);
    text-decoration: none;
    font-weight: 500;
    font-size: calc(0.85rem * var(--wac-scale, 1));
  }

  /* --- DISMISS BUTTON --- */
  .dismiss-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    width: calc(24px * var(--wac-scale, 1));
    height: calc(24px * var(--wac-scale, 1));
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    opacity: 0.6;
    transition: opacity 0.2s, background 0.2s;
    --mdc-icon-size: calc(18px * var(--wac-scale, 1));
  }
  .dismiss-button:hover,
  .dismiss-button:focus-visible {
    opacity: 1;
    background: rgba(var(--rgb-primary-text-color, 128, 128, 128), 0.08);
    outline: none;
  }
  /* Full layout: corner-tuck the dismiss button as window-decoration so it
     doesn't reserve space in the flex flow (which would squeeze title,
     headline, area, and badges). Labeled variant overrides position below
     to sit flush against the card's rounded corner. */
  .alert-header-row:not(.compact-row) > .dismiss-button {
    position: absolute;
    top: 6px;
    right: 6px;
    margin-left: 0;
  }
  .compact-row > .dismiss-button {
    margin-left: 4px;
  }

  /* Labeled dismiss button (full layout only) — window-decoration placement:
     absolute at top-right of the card, outside the header flex flow, so title,
     headline, area, and badges flow full row width. The button is visually
     subtle and overlays the rare long title that reaches its column. */
  .dismiss-button.labeled {
    border-left: 1px solid var(--divider-color);
    border-bottom: 1px solid var(--divider-color);
    border-radius: 12px;
    padding: 2px 8px 2px 4px;
    color: var(--secondary-text-color);
    opacity: 1;
    gap: 4px;
    font-size: calc(0.78rem * var(--wac-scale, 1));
    width: auto;
    height: auto;
    --mdc-icon-size: calc(16px * var(--wac-scale, 1));
  }
  .dismiss-button.labeled:hover,
  .dismiss-button.labeled:focus-visible {
    background: rgba(var(--rgb-primary-text-color, 128, 128, 128), 0.08);
    opacity: 1;
  }
  .alert-header-row:not(.compact-row) > .dismiss-button.labeled {
    position: absolute;
    top: 0px;
    right: 0px;
    margin-left: 0;
  }
  /* Compact row: revert labeled button to icon-only */
  .compact-row > .dismiss-button.labeled {
    border: none;
    border-radius: 50%;
    padding: 0;
    color: var(--secondary-text-color);
    gap: 0;
    font-size: inherit;
    width: calc(24px * var(--wac-scale, 1));
    height: calc(24px * var(--wac-scale, 1));
    --mdc-icon-size: calc(18px * var(--wac-scale, 1));
  }
  .compact-row > .dismiss-button.labeled span {
    display: none;
  }

  /* --- SWIPE GESTURE ---
     swipe-enabled: applied whenever pointer drag-to-dismiss is wired up. Sets
     touch-action so vertical scroll stays native while horizontal is reserved
     for the JS gesture; shows the grab cursor on hover. */
  .alert-card.swipe-enabled {
    touch-action: pan-y;
    cursor: grab;
  }
  .alert-card.swiping {
    transition: none !important;
    user-select: none;
    cursor: grabbing;
  }
  .alert-card.swipe-exit {
    transform: translateX(-110%) !important;
    opacity: 0 !important;
    transition: transform 0.2s ease-in, opacity 0.2s ease-in !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .alert-card.swipe-exit {
      transition: none !important;
    }
  }

  /* --- COMPACT LAYOUT --- */
  .compact .alert-card {
    margin-bottom: 4px;
    border-radius: 8px;
  }

  .compact .alert-card::before {
    display: block;
    top: auto;
    bottom: 0;
    left: var(--progress, 0%);
    right: 0;
    width: auto;
    height: 4px;
    border-radius: 0;
    z-index: 1;
  }

  .compact .alert-header-row.compact-row {
    padding: 8px 12px;
    gap: 10px;
    cursor: pointer;
    user-select: none;
  }
  .compact .alert-header-row.compact-row:hover {
    background: rgba(var(--color-rgb), 0.05);
  }

  .compact .icon-box {
    width: calc(32px * var(--wac-scale, 1));
    height: calc(32px * var(--wac-scale, 1));
  }
  .compact .icon-box ha-icon {
    --mdc-icon-size: calc(18px * var(--wac-scale, 1));
  }

  .compact .alert-title {
    font-size: calc(0.95rem * var(--wac-scale, 1));
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .compact-time {
    font-size: calc(0.8rem * var(--wac-scale, 1));
    color: var(--wac-fg);
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .compact-chevron {
    color: var(--secondary-text-color);
    transition: transform 0.2s;
    flex-shrink: 0;
    --mdc-icon-size: calc(20px * var(--wac-scale, 1));
  }
  .compact-chevron.expanded {
    transform: rotate(180deg);
  }

  .compact .alert-expanded {
    padding-top: 4px;
    border-top: 1px solid var(--divider-color);
  }

  /* Compact progress track (bottom border) */
  .compact .alert-card::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--secondary-background-color);
  }
  .compact .active.alert-card::before {
    background-color: var(--wac-progress-fg);
    background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: fill-shimmer 5s ease-in-out infinite;
  }
  .compact .expired.alert-card::before {
    background-color: var(--divider-color);
  }
  .compact .preparation.alert-card::before {
    background-image: linear-gradient(
      -45deg,
      color-mix(in srgb, var(--wac-progress-fg) 60%, transparent) 25%,
      transparent 25%,
      transparent 50%,
      color-mix(in srgb, var(--wac-progress-fg) 60%, transparent) 50%,
      color-mix(in srgb, var(--wac-progress-fg) 60%, transparent) 75%,
      transparent 75%
    );
    background-size: 12px 12px;
    background-color: transparent;
    animation: stripe-march-sm 3s linear infinite;
  }
  .compact .active.ongoing.alert-card::before {
    left: 0;
    background: color-mix(in srgb, var(--wac-progress-fg) 80%, transparent);
    animation: ongoing-pulse 5s infinite;
  }

  /* --- NO ANIMATIONS --- */
  .no-animations .alert-card {
    animation: none !important;
  }
  .no-animations .progress-fill,
  .no-animations .alert-card::before,
  .no-animations .alert-card::after {
    animation: none !important;
    transition: none !important;
  }
  .no-animations .active .progress-fill,
  .no-animations.compact .active.alert-card::before {
    background-position: -33% 0 !important;
  }

  /* --- PREVIEW LABEL --- */
  .preview-label {
    text-align: center;
    font-size: calc(0.75rem * var(--wac-scale, 1));
    font-style: italic;
    color: var(--secondary-text-color);
    padding: 8px 16px 0;
    opacity: 0.7;
  }

  /* --- EMPTY STATE --- */
  .no-alerts {
    padding: 20px;
    opacity: 0.6;
    text-align: center;
    font-style: italic;
  }
  .no-alerts ha-icon {
    margin-bottom: 10px;
  }
`;let pr=class extends de{constructor(){super(...arguments),this._showPreview=!1,this._subscribedDismissalsScope="",this._registryEntries=null,this._onRestoreAll=()=>{const e=this._currentScopeHash();e&&(!function(e){const t=Zi();if(t)try{t.removeItem(Gi(e))}catch{}Ki(e)}(e),this.requestUpdate())}}disconnectedCallback(){super.disconnectedCallback(),this._unsubscribeDismissals?.(),this._unsubscribeDismissals=void 0,this._subscribedDismissalsScope="",this._teardownRegistrySubscription()}updated(e){super.updated(e);const t=this._currentScopeHash();t!==this._subscribedDismissalsScope&&(this._unsubscribeDismissals?.(),this._unsubscribeDismissals=void 0,this._subscribedDismissalsScope=t,t&&(this._unsubscribeDismissals=Vi(t,()=>this.requestUpdate()))),this.isConnected&&this._maybeSubscribeRegistry()}_maybeSubscribeRegistry(){if(!this._config?.device)return void this._teardownRegistrySubscription();const e=this.hass?.connection;e&&e!==this._subscribedRegistryConn&&(this._unsubscribeRegistry?.(),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=e,Bi(e,e=>{this._registryEntries=e,this.requestUpdate()}).then(t=>{this._subscribedRegistryConn===e?this._unsubscribeRegistry=t:t()}).catch(()=>{this._subscribedRegistryConn===e&&(this._subscribedRegistryConn=void 0)}))}_teardownRegistrySubscription(){this._unsubscribeRegistry?.(),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=void 0}get _lang(){return this.hass?.locale?.language||"en"}setConfig(e){this._config=e,this._showPreview=!!e._preview}_fireConfigChanged(e){this._config=e;const t=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}_getMatchingEntityIds(){const e=this._getSelectedEntities().join(",");if(this._cachedHass===this.hass&&this._cachedConfigKey===e&&this._cachedEntityIds)return this._cachedEntityIds;this._cachedHass=this.hass,this._cachedConfigKey=e;const t=[];for(const[e,i]of Object.entries(this.hass.states))(e.startsWith("sensor.")||e.startsWith("binary_sensor."))&&(Ri.some(t=>t.test(e))||Ii(i.attributes))&&t.push(e);if(this._config?.entity&&!t.includes(this._config.entity)&&t.push(this._config.entity),this._config?.entities)for(const e of this._config.entities)e&&!t.includes(e)&&t.push(e);return this._cachedEntityIds=t,t}_getSelectedEntities(){const e=[];if(this._config?.entity&&e.push(this._config.entity),this._config?.entities)for(const t of this._config.entities)t&&!e.includes(t)&&e.push(t);return e}_hasNoRealAlerts(){if(!this.hass||!this._config?.entity)return!1;const e=this._getSelectedEntities();let t=0;for(const i of e){const e=this.hass.states[i];if(e){if("unknown"===e.state||"unavailable"===e.state)return!1;if(t++,"0"!==e.state&&"off"!==e.state)return!1}}return t>0}_isEntityMismatch(){if(!this._config?.entity)return!1;const e=this.hass?.states[this._config.entity];return!!e&&(!Ri.some(e=>e.test(this._config.entity))&&!Ii(e.attributes))}_renderEntityWarning(e){return this._isEntityMismatch()?j`<ha-alert alert-type="warning">${Mt("editor.entity_warning",e)}</ha-alert>`:Y}_renderNoEntitiesHint(e){if(this._config?.device&&this.hass){return Ui(this.hass,this._config.device,this._registryEntries).length>0?Y:j`<ha-alert alert-type="info">${Mt("editor.no_device_alerts_hint",e)}</ha-alert>`}return this._getMatchingEntityIds().some(e=>this.hass?.states[e])?Y:j`<ha-alert alert-type="info">${Mt("editor.no_entities_hint",e)} <a href="https://github.com/seevee/weather_alerts_card#supported-providers" target="_blank" rel="noopener">${Mt("editor.no_entities_hint_link",e)}</a></ha-alert>`}_entityChanged(e){const t=e.detail.value,i=Array.isArray(t)?t:t?[t]:[],r={...this._config};if(r.entity=i[0]||"",i.length>1?r.entities=i.slice(1):delete r.entities,r.hideNoAlerts){const e=this._syncMultiEntityVisibility(r);e?r.visibility=e:delete r.visibility}this._fireConfigChanged(r)}_deviceChanged(e){const t=e.detail.value,i="string"==typeof t?t:"";if(i===(this._config.device||""))return;const r={...this._config};i?r.device=i:delete r.device,this._fireConfigChanged(r)}_titleChanged(e){const t=e.target.value;if(t===(this._config.title||""))return;const i={...this._config};t?i.title=t:delete i.title,this._fireConfigChanged(i)}_providerChanged(e){const t=e.detail.value;if(t===(this._config.provider||"auto"))return;const i={...this._config};"auto"===t?delete i.provider:i.provider=t,this._fireConfigChanged(i)}_enhanceContrastChanged(e){const t=e.detail.value;if(t===(this._config.enhanceContrast||"subtle"))return;const i={...this._config};"subtle"===t?delete i.enhanceContrast:i.enhanceContrast=t,this._fireConfigChanged(i)}_animationsChanged(e){const t=e.target.checked;if(t===(!1!==this._config.animations))return;const i={...this._config};t?delete i.animations:i.animations=!1,this._fireConfigChanged(i)}_deduplicateHeadlinesChanged(e){const t=e.target.checked;if(t===(!1!==this._config.deduplicateHeadlines))return;const i={...this._config};t?delete i.deduplicateHeadlines:i.deduplicateHeadlines=!1,this._fireConfigChanged(i)}_deduplicateChanged(e){const t=e.target.checked;if(t===(!1!==this._config.deduplicate))return;const i={...this._config};t?delete i.deduplicate:i.deduplicate=!1,this._fireConfigChanged(i)}_showDetailsChanged(e){const t=e.target.checked;if(t===(!1!==this._config.showDetails))return;const i={...this._config};t?delete i.showDetails:i.showDetails=!1,this._fireConfigChanged(i)}_expandDetailsChanged(e){const t=e.target.checked;if(t===(!0===this._config.expandDetails))return;const i={...this._config};t?i.expandDetails=!0:delete i.expandDetails,this._fireConfigChanged(i)}_showMetadataChanged(e){const t=e.target.checked;if(t===(!1!==this._config.showMetadata))return;const i={...this._config};t?delete i.showMetadata:i.showMetadata=!1,this._fireConfigChanged(i)}_showDescriptionChanged(e){const t=e.target.checked;if(t===(!1!==this._config.showDescription))return;const i={...this._config};t?delete i.showDescription:i.showDescription=!1,this._fireConfigChanged(i)}_showInstructionsChanged(e){const t=e.target.checked;if(t===(!1!==this._config.showInstructions))return;const i={...this._config};t?delete i.showInstructions:i.showInstructions=!1,this._fireConfigChanged(i)}_showGeometryChanged(e){const t=e.target.checked;if(t===(!0===this._config.showGeometry))return;const i={...this._config};t?i.showGeometry=!0:delete i.showGeometry,this._fireConfigChanged(i)}_geometryStyleChanged(e){const t=e.detail.value;if(t===(this._config.geometryStyle||"shape"))return;const i={...this._config};"shape"===t?delete i.geometryStyle:i.geometryStyle=t,this._fireConfigChanged(i)}_showProviderChanged(e){const t=e.target.checked;if(t===(!0===this._config.showProvider))return;const i={...this._config};t?i.showProvider=!0:delete i.showProvider,this._fireConfigChanged(i)}_showSourceLinkChanged(e){const t=e.target.checked;if(t===(!1!==this._config.showSourceLink))return;const i={...this._config};t?delete i.showSourceLink:i.showSourceLink=!1,this._fireConfigChanged(i)}_hideExpiredChanged(e){const t=e.target.checked;if(t===(!1!==this._config.hideExpired))return;const i={...this._config};t?delete i.hideExpired:i.hideExpired=!1,this._fireConfigChanged(i)}_allowDismissChanged(e){const t=e.target.checked;if(t===(!0===this._config.allowDismiss))return;const i={...this._config};t?i.allowDismiss=!0:delete i.allowDismiss,this._fireConfigChanged(i)}_showDismissUndoChanged(e){const t=e.target.checked;if(t===(!1!==this._config.showDismissUndo))return;const i={...this._config};t?delete i.showDismissUndo:i.showDismissUndo=!1,this._fireConfigChanged(i)}_dismissTriggerChanged(e){const t=e.detail.value;if(t===(this._config.dismissTrigger||"button"))return;const i={...this._config};"button"===t?delete i.dismissTrigger:i.dismissTrigger=t,this._fireConfigChanged(i)}_dismissButtonStyleChanged(e){const t=e.detail.value;if(t===(this._config.dismissButtonStyle||"icon"))return;const i={...this._config};"icon"===t?delete i.dismissButtonStyle:i.dismissButtonStyle=t,this._fireConfigChanged(i)}_currentScopeHash(){return Yi(this._config)}_getDismissedCount(){const e=this._currentScopeHash();return e?Xi(e).size:0}_hideNoAlertsChanged(e){const t=e.target.checked;if(t===(!0===this._config.hideNoAlerts))return;const i={...this._config};t?i.hideNoAlerts=!0:delete i.hideNoAlerts;const r=this._syncMultiEntityVisibility(i);r?i.visibility=r:delete i.visibility,this._fireConfigChanged(i)}_buildEntityCondition(e){return e.startsWith("binary_sensor.")?{condition:"state",entity:e,state:"on"}:{condition:"state",entity:e,state_not:"0"}}_isManagedCondition(e,t){if("state"===e.condition&&"string"==typeof e.entity&&t.has(e.entity)&&("state_not"in e||"state"in e))return!0;if("or"===e.condition&&Array.isArray(e.conditions)){const t=e.conditions;return t.length>0&&t.every(e=>"state"===e.condition&&"string"==typeof e.entity&&("state_not"in e&&"0"===e.state_not||"state"in e&&"on"===e.state))}return!1}_syncMultiEntityVisibility(e){const t=new Set;e.entity&&t.add(e.entity),e.entities&&e.entities.forEach(e=>t.add(e));const i=(e.visibility||[]).filter(e=>!this._isManagedCondition(e,t));if(e.hideNoAlerts&&t.size>0){const e=[...t].map(e=>this._buildEntityCondition(e));1===e.length?i.push(e[0]):i.push({condition:"or",conditions:e})}return i.length>0?i:void 0}_reformatTextChanged(e){const t=e.target.checked;if(t===(!1!==this._config.reformatText))return;const i={...this._config};t?delete i.reformatText:i.reformatText=!1,this._fireConfigChanged(i)}_layoutChanged(e){const t=e.target.checked;if(t===("compact"===this._config.layout))return;const i={...this._config};t?i.layout="compact":delete i.layout,this._fireConfigChanged(i)}_zonesChanged(e){const t=e.target.value,i={...this._config};t.trim()?i.zones=t.split(",").map(e=>e.trim()).filter(Boolean):delete i.zones,this._fireConfigChanged(i)}_eventCodesChanged(e){const t=e.target.value,i={...this._config};t.trim()?i.eventCodes=t.split(",").map(e=>e.trim().toUpperCase()).filter(Boolean):delete i.eventCodes,this._fireConfigChanged(i)}_excludeEventCodesChanged(e){const t=e.target.value,i={...this._config};t.trim()?i.excludeEventCodes=t.split(",").map(e=>e.trim().toUpperCase()).filter(Boolean):delete i.excludeEventCodes,this._fireConfigChanged(i)}_sortOrderChanged(e){const t=e.detail.value;if(t===(this._config.sortOrder||"default"))return;const i={...this._config};"default"===t?delete i.sortOrder:i.sortOrder=t,this._fireConfigChanged(i)}_colorThemeChanged(e){const t=e.detail.value;if(t===(this._config.colorTheme||"severity"))return;const i={...this._config};"severity"===t?delete i.colorTheme:i.colorTheme=t,this._fireConfigChanged(i)}_fontSizeChanged(e){const t=e.detail.value;if(t===(this._config.fontSize||"default"))return;const i={...this._config};"default"===t?delete i.fontSize:i.fontSize=t,this._fireConfigChanged(i)}_timezoneChanged(e){const t=e.detail.value;if(t===(this._config.timezone||"server"))return;const i={...this._config};"server"===t?delete i.timezone:i.timezone=t,this._fireConfigChanged(i)}_minSeverityChanged(e){const t=e.detail.value;if(t===(this._config.minSeverity||"all"))return;const i={...this._config};"all"!==t?i.minSeverity=t:delete i.minSeverity,this._fireConfigChanged(i)}_previewChanged(e){const t=e.target;this._showPreview=t.checked;const i={...this._config};this._showPreview?i._preview=!0:delete i._preview,this._fireConfigChanged(i)}render(){if(!this.hass||!this._config)return j``;const e=this._lang,t=this._config.zones?this._config.zones.join(", "):"",i=this._config.eventCodes?this._config.eventCodes.join(", "):"",r=this._config.excludeEventCodes?this._config.excludeEventCodes.join(", "):"";return j`
      <div class="editor">
        <!-- Entity & Provider -->
        <div class="section-label">${Mt("editor.section_entity",e)}</div>

        <ha-selector
          .hass=${this.hass}
          .selector=${{entity:{multiple:!0,include_entities:this._getMatchingEntityIds()}}}
          .value=${this._getSelectedEntities()}
          .label=${Mt("editor.entities",e)}
          .required=${!this._config?.device}
          @value-changed=${this._entityChanged}
        ></ha-selector>
        ${this._renderEntityWarning(e)}
        ${this._renderNoEntitiesHint(e)}

        <ha-selector
          .hass=${this.hass}
          .selector=${{device:{integration:"cap_alerts"}}}
          .value=${this._config.device||""}
          .label=${Mt("editor.device",e)}
          .helper=${Mt("editor.device_helper",e)}
          .helperPersistent=${!0}
          @value-changed=${this._deviceChanged}
        ></ha-selector>

        <div class="preview-tools">
          <ha-formfield .label=${Mt("editor.show_preview",e)}>
            <ha-switch
              .checked=${this._showPreview}
              @change=${this._previewChanged}
            ></ha-switch>
          </ha-formfield>
          ${this._hasNoRealAlerts()&&!this._showPreview?j`<div class="preview-nudge">${Mt("editor.preview_nudge",e)}</div>`:j`<div class="preview-hint">${Mt("editor.preview_hint",e)}</div>`}
        </div>

        <ha-formfield .label=${Mt("editor.show_provider",e)}>
          <ha-switch
            .checked=${!0===this._config.showProvider}
            @change=${this._showProviderChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-textfield
          .label=${Mt("editor.title",e)}
          .value=${this._config.title||""}
          @change=${this._titleChanged}
        ></ha-textfield>

        <ha-select
          .label=${Mt("editor.provider",e)}
          .value=${this._config.provider||"auto"}
          @selected=${this._providerChanged}
        >
          <ha-dropdown-item value="auto">${Mt("editor.provider_auto",e)}</ha-dropdown-item>
          <ha-dropdown-item value="nws">${Mt("editor.provider_nws",e)}</ha-dropdown-item>
          <ha-dropdown-item value="bom">${Mt("editor.provider_bom",e)}</ha-dropdown-item>
          <ha-dropdown-item value="meteoalarm">${Mt("editor.provider_meteoalarm",e)}</ha-dropdown-item>
          <ha-dropdown-item value="dwd">${Mt("editor.provider_dwd",e)}</ha-dropdown-item>
          <ha-dropdown-item value="eccc">${Mt("editor.provider_eccc",e)}</ha-dropdown-item>
          <ha-dropdown-item value="pirateweather">${Mt("editor.provider_pirateweather",e)}</ha-dropdown-item>
          <ha-dropdown-item value="cap">${Mt("editor.provider_cap",e)}</ha-dropdown-item>
        </ha-select>

        <!-- Filtering -->
        <div class="section-label">${Mt("editor.section_filtering",e)}</div>

        <ha-textfield
          .label=${Mt("editor.zones",e)}
          .value=${t}
          .helper=${Mt("editor.zones_helper",e)}
          .helperPersistent=${!0}
          @change=${this._zonesChanged}
        ></ha-textfield>

        <ha-textfield
          .label=${Mt("editor.event_codes",e)}
          .value=${i}
          .helper=${Mt("editor.event_codes_helper",e)}
          .helperPersistent=${!0}
          @change=${this._eventCodesChanged}
        ></ha-textfield>

        <ha-textfield
          .label=${Mt("editor.exclude_event_codes",e)}
          .value=${r}
          .helper=${Mt("editor.exclude_event_codes_helper",e)}
          .helperPersistent=${!0}
          @change=${this._excludeEventCodesChanged}
        ></ha-textfield>

        <ha-select
          .label=${Mt("editor.min_severity",e)}
          .value=${this._config.minSeverity||"all"}
          @selected=${this._minSeverityChanged}
        >
          <ha-dropdown-item value="all">${Mt("editor.severity_all",e)}</ha-dropdown-item>
          <ha-dropdown-item value="minor">${Mt("editor.severity_minor",e)}</ha-dropdown-item>
          <ha-dropdown-item value="moderate">${Mt("editor.severity_moderate",e)}</ha-dropdown-item>
          <ha-dropdown-item value="severe">${Mt("editor.severity_severe",e)}</ha-dropdown-item>
          <ha-dropdown-item value="extreme">${Mt("editor.severity_extreme",e)}</ha-dropdown-item>
        </ha-select>

        <!-- Appearance -->
        <div class="section-label">${Mt("editor.section_appearance",e)}</div>

        <ha-formfield .label=${Mt("editor.compact",e)}>
          <ha-switch
            .checked=${"compact"===this._config.layout}
            @change=${this._layoutChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-select
          .label=${Mt("editor.color_theme",e)}
          .value=${this._config.colorTheme||"severity"}
          @selected=${this._colorThemeChanged}
        >
          <ha-dropdown-item value="severity">${Mt("editor.color_severity",e)}</ha-dropdown-item>
          <ha-dropdown-item value="nws">${Mt("editor.color_nws",e)}</ha-dropdown-item>
          <ha-dropdown-item value="meteoalarm">${Mt("editor.color_meteoalarm",e)}</ha-dropdown-item>
          <ha-dropdown-item value="eccc">${Mt("editor.color_eccc",e)}</ha-dropdown-item>
        </ha-select>

        <ha-select
          .label=${Mt("editor.enhance_contrast",e)}
          .value=${this._config.enhanceContrast||"subtle"}
          @selected=${this._enhanceContrastChanged}
        >
          <ha-dropdown-item value="off">${Mt("editor.enhance_contrast_off",e)}</ha-dropdown-item>
          <ha-dropdown-item value="subtle">${Mt("editor.enhance_contrast_subtle",e)}</ha-dropdown-item>
          <ha-dropdown-item value="strict">${Mt("editor.enhance_contrast_strict",e)}</ha-dropdown-item>
        </ha-select>

        <ha-select
          .label=${Mt("editor.font_size",e)}
          .value=${this._config.fontSize||"default"}
          @selected=${this._fontSizeChanged}
        >
          <ha-dropdown-item value="small">${Mt("editor.font_size_small",e)}</ha-dropdown-item>
          <ha-dropdown-item value="default">${Mt("editor.font_size_default",e)}</ha-dropdown-item>
          <ha-dropdown-item value="large">${Mt("editor.font_size_large",e)}</ha-dropdown-item>
          <ha-dropdown-item value="x-large">${Mt("editor.font_size_x_large",e)}</ha-dropdown-item>
        </ha-select>

        <ha-formfield .label=${Mt("editor.animations",e)}>
          <ha-switch
            .checked=${!1!==this._config.animations}
            @change=${this._animationsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.reformat_text",e)}>
          <ha-switch
            .checked=${!1!==this._config.reformatText}
            @change=${this._reformatTextChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Detail Panel -->
        <div class="section-label">${Mt("editor.section_detail_panel",e)}</div>

        <ha-formfield .label=${Mt("editor.show_details",e)}>
          <ha-switch
            .checked=${!1!==this._config.showDetails}
            @change=${this._showDetailsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.expand_details",e)}>
          <ha-switch
            .checked=${!0===this._config.expandDetails}
            .disabled=${!1===this._config.showDetails}
            @change=${this._expandDetailsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.show_metadata",e)}>
          <ha-switch
            .checked=${!1!==this._config.showMetadata}
            .disabled=${!1===this._config.showDetails}
            @change=${this._showMetadataChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.show_description",e)}>
          <ha-switch
            .checked=${!1!==this._config.showDescription}
            .disabled=${!1===this._config.showDetails}
            @change=${this._showDescriptionChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.show_instructions",e)}>
          <ha-switch
            .checked=${!1!==this._config.showInstructions}
            .disabled=${!1===this._config.showDetails}
            @change=${this._showInstructionsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.show_geometry",e)}>
          <ha-switch
            .checked=${!0===this._config.showGeometry}
            .disabled=${!1===this._config.showDetails}
            @change=${this._showGeometryChanged}
          ></ha-switch>
        </ha-formfield>

        ${!0===this._config.showGeometry?j`
          <ha-select
            .label=${Mt("editor.geometry_style",e)}
            .value=${this._config.geometryStyle||"shape"}
            .disabled=${!1===this._config.showDetails}
            @selected=${this._geometryStyleChanged}
          >
            <ha-dropdown-item value="shape">${Mt("editor.geometry_style_shape",e)}</ha-dropdown-item>
            <ha-dropdown-item value="map">${Mt("editor.geometry_style_map",e)}</ha-dropdown-item>
          </ha-select>
        `:Y}

        <ha-formfield .label=${Mt("editor.show_source_link",e)}>
          <ha-switch
            .checked=${!1!==this._config.showSourceLink}
            .disabled=${!1===this._config.showDetails}
            @change=${this._showSourceLinkChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Behavior -->
        <div class="section-label">${Mt("editor.section_behavior",e)}</div>

        <ha-select
          .label=${Mt("editor.sort_order",e)}
          .value=${this._config.sortOrder||"default"}
          @selected=${this._sortOrderChanged}
        >
          <ha-dropdown-item value="default">${Mt("editor.sort_default",e)}</ha-dropdown-item>
          <ha-dropdown-item value="onset">${Mt("editor.sort_onset",e)}</ha-dropdown-item>
          <ha-dropdown-item value="severity">${Mt("editor.sort_severity",e)}</ha-dropdown-item>
        </ha-select>

        <ha-select
          .label=${Mt("editor.timezone",e)}
          .value=${this._config.timezone||"server"}
          @selected=${this._timezoneChanged}
        >
          <ha-dropdown-item value="server">${Mt("editor.tz_server",e)}</ha-dropdown-item>
          <ha-dropdown-item value="browser">${Mt("editor.tz_browser",e)}</ha-dropdown-item>
        </ha-select>

        <ha-formfield .label=${Mt("editor.deduplicate",e)}>
          <ha-switch
            .checked=${!1!==this._config.deduplicate}
            @change=${this._deduplicateChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.deduplicate_headlines",e)}>
          <ha-switch
            .checked=${!1!==this._config.deduplicateHeadlines}
            @change=${this._deduplicateHeadlinesChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.hide_expired",e)}>
          <ha-switch
            .checked=${!1!==this._config.hideExpired}
            @change=${this._hideExpiredChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${Mt("editor.hide_no_alerts",e)}>
          <ha-switch
            .checked=${!0===this._config.hideNoAlerts}
            @change=${this._hideNoAlertsChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Dismissal -->
        <div class="section-label">${Mt("editor.section_dismissal",e)}</div>

        <ha-formfield .label=${Mt("editor.allow_dismiss",e)}>
          <ha-switch
            .checked=${!0===this._config.allowDismiss}
            @change=${this._allowDismissChanged}
          ></ha-switch>
        </ha-formfield>

        ${!0===this._config.allowDismiss?j`
          <ha-select
            .label=${Mt("editor.dismiss_trigger",e)}
            .value=${this._config.dismissTrigger||"button"}
            @selected=${this._dismissTriggerChanged}
          >
            <ha-dropdown-item value="button">${Mt("editor.dismiss_trigger_button",e)}</ha-dropdown-item>
            <ha-dropdown-item value="swipe">${Mt("editor.dismiss_trigger_swipe",e)}</ha-dropdown-item>
            <ha-dropdown-item value="both">${Mt("editor.dismiss_trigger_both",e)}</ha-dropdown-item>
          </ha-select>

          ${"swipe"!==this._config.dismissTrigger?j`
            <ha-select
              .label=${Mt("editor.dismiss_button_style",e)}
              .value=${this._config.dismissButtonStyle||"icon"}
              @selected=${this._dismissButtonStyleChanged}
            >
              <ha-dropdown-item value="icon">${Mt("editor.dismiss_button_style_icon",e)}</ha-dropdown-item>
              <ha-dropdown-item value="labeled">${Mt("editor.dismiss_button_style_labeled",e)}</ha-dropdown-item>
            </ha-select>
          `:Y}
        `:Y}

        <ha-formfield .label=${Mt("editor.show_dismiss_undo",e)}>
          <ha-switch
            .checked=${!1!==this._config.showDismissUndo}
            .disabled=${!0!==this._config.allowDismiss}
            @change=${this._showDismissUndoChanged}
          ></ha-switch>
        </ha-formfield>

        ${this._renderDismissedStatus(e)}

      </div>
    `}_renderDismissedStatus(e){if(!0!==this._config.allowDismiss)return Y;const t=this._getDismissedCount();if(0===t)return Y;return j`
      <div class="dismissed-status">
        ${Mt(1===t?"editor.dismissed_count_singular":"editor.dismissed_count",e,{count:t})}
        <a class="restore-link" @click=${this._onRestoreAll} tabindex="0" role="button">
          ${Mt("editor.restore_all",e)}
        </a>
      </div>
    `}};var ur;pr.styles=n`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .section-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 4px;
      margin-top: 8px;
    }
    .preview-hint,
    .preview-nudge {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      padding-left: 48px;
      margin-top: 4px;
    }
    .preview-hint {
      opacity: 0.7;
    }
    .dismissed-status {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
      padding-left: 48px;
    }
    .restore-link {
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: underline;
      margin-left: 4px;
    }
    .restore-link:hover {
      text-decoration: none;
    }
  `,e([ge({attribute:!1})],pr.prototype,"hass",void 0),e([me()],pr.prototype,"_config",void 0),e([me()],pr.prototype,"_showPreview",void 0),pr=e([he("weather-alerts-card-editor")],pr);console.info("%c  WEATHER-ALERTS-CARD  %c  Version 3.1.0  ","color: white; background: #555; font-weight: bold;","color: white; background: #007acc; font-weight: bold;");const gr={nws:"NWS",bom:"BoM",meteoalarm:"MeteoAlarm",dwd:"DWD",eccc:"Environment Canada",pirateweather:"Pirate Weather",cap:"CAP"},mr={nws:"NWS",bom:"BoM",meteoalarm:"MA",dwd:"DWD",eccc:"EC",pirateweather:"PW",cap:"CAP"};let _r=ur=class extends de{constructor(){super(...arguments),this._expandedAlerts=new Map,this._forcePreview=!1,this._dismissals=new Map,this._dismissalsScope="",this._swipeState=null,this._swipeStartX=0,this._swipeStartY=0,this._swipeCurrentDx=0,this._swipeRAF=null,this._swipePointerId=null,this._swipeExitTimeout=null,this._swipeJustDragged=!1,this._swipeExiting=null,this._registryEntries=null,this._geometryCache=new Map,this._geometryInFlight=new Set,this._motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)"),this._onMotionChange=()=>this.requestUpdate(),this._pendingDismissals=null,this._dismissalReconcileScheduled=!1}connectedCallback(){super.connectedCallback(),this._motionQuery.addEventListener("change",this._onMotionChange),this._config&&(this._dismissalsScope="",this._reloadDismissalsIfScopeChanged()),this._maybeSubscribeRegistry()}disconnectedCallback(){super.disconnectedCallback(),this._motionQuery.removeEventListener("change",this._onMotionChange),this._unsubscribeDismissals?.(),this._unsubscribeDismissals=void 0,this._teardownRegistrySubscription(),this._geometryInFlight.clear(),null!==this._swipeRAF&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null),null!==this._swipeExitTimeout&&(clearTimeout(this._swipeExitTimeout),this._swipeExitTimeout=null),this._swipeState=null,this._swipeExiting=null,(this._config?.entity||this._config?.device)&&ur._editorExpandedState.set(this._entityStateKey(),this._expandedAlerts)}updated(e){super.updated(e),(e.has("hass")||e.has("_config"))&&this.isConnected&&(this._maybeSubscribeRegistry(),this._maybeFetchGeometry())}_maybeSubscribeRegistry(){if(!this._config?.device)return void this._teardownRegistrySubscription();const e=this.hass?.connection;e&&e!==this._subscribedRegistryConn&&(this._unsubscribeRegistry?.(),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=e,Bi(e,e=>{this._registryEntries=e,this.requestUpdate()}).then(t=>{this._subscribedRegistryConn===e?this._unsubscribeRegistry=t:t()}).catch(()=>{this._subscribedRegistryConn===e&&(this._subscribedRegistryConn=void 0)}))}_teardownRegistrySubscription(){this._unsubscribeRegistry?.(),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=void 0}_maybeFetchGeometry(){if(!0!==this._config?.showGeometry)return;const e=this.hass?.connection;if(!e)return;e!==this._geometryConn&&(this._geometryCache=new Map,this._geometryInFlight.clear(),this._geometryConn=e);const t=new Set;for(const e of this._getAlerts(!1))e.geometryRef&&t.add(e.geometryRef);for(const e of[...this._geometryCache.keys()])t.has(e)||this._geometryCache.delete(e);for(const e of[...this._geometryInFlight])t.has(e)||this._geometryInFlight.delete(e);for(const i of t)this._geometryCache.has(i)||this._geometryInFlight.has(i)||(this._geometryInFlight.add(i),Qi(e,i).then(t=>{e===this._geometryConn&&(this._geometryInFlight.delete(i),this._geometryCache.set(i,t),this.requestUpdate())}).catch(()=>{e===this._geometryConn&&this._geometryInFlight.delete(i)}))}setConfig(e){if(!(!!e.entity||!!e.entities?.length)&&!e.device)throw new Error("You need to define an entity or device");const{_preview:t,...i}=e;!i.entity&&i.entities&&i.entities.length>0&&(i.entity=i.entities[0]),this._config=i,this._forcePreview=!!t;const r=this._entityStateKey(),o=ur._editorExpandedState.get(r);o&&(this._expandedAlerts=o),this._reloadDismissalsIfScopeChanged()}get _scopeHash(){return Yi(this._config)}_configuredScopeTokens(){return qi(this._config)}_reloadDismissalsIfScopeChanged(){const e=this._scopeHash;e!==this._dismissalsScope&&(this._dismissalsScope=e,this._dismissals=e?Xi(e):new Map,this._resubscribeDismissals())}_resubscribeDismissals(){this._unsubscribeDismissals?.(),this._unsubscribeDismissals=void 0,this.isConnected&&this._dismissalsScope&&(this._unsubscribeDismissals=Vi(this._dismissalsScope,()=>{this._dismissals=Xi(this._dismissalsScope)}))}getCardSize(){const e=this._getAlerts(!1),t=this._isCompact?1:3;return Math.max(1,e.length*t)}static getConfigElement(){return document.createElement("weather-alerts-card-editor")}static getStubConfig(e){if(e){const t=Object.keys(e.states).filter(e=>Ri.some(t=>t.test(e))).find(t=>{const i=e.states[t];return"0"!==i.state&&"off"!==i.state&&"unknown"!==i.state&&"unavailable"!==i.state});if(t)return{entity:t}}return{entity:"sensor.nws_alerts_alerts"}}_getAllEntities(){if(!this._config)return[];const e=this._config.entity,t=this._config.entities||[],i=new Set,r=[];for(const o of[e,...t])o&&!i.has(o)&&(i.add(o),r.push(o));if(this._config.device&&this.hass)for(const e of Ui(this.hass,this._config.device,this._registryEntries))i.has(e)||(i.add(e),r.push(e));return r}_entityStateKey(){return[...this._configuredScopeTokens()].sort().join(",")}_deviceHasAnyEntity(e){return!!this.hass&&function(e,t,i){if(i)return i.some(e=>e?.device_id===t);const r=e.entities;if(!r)return!1;for(const e of Object.values(r))if(e?.device_id===t)return!0;return!1}(this.hass,e,this._registryEntries)}_getAlerts(e=!0){if(!this.hass||!this._config)return[];const t=[],i=[],r=new Set;for(const e of this._getAllEntities()){const o=this.hass.states[e];if(!o)continue;const s=Oi(this._config.provider,o.attributes);r.has(s.provider)||(r.add(s.provider),i.push(s.provider)),t.push(...s.parseAlerts(o.attributes))}let o=this._filterAndSort(t,{providerPriority:i});if(this._config.allowDismiss&&!this._forcePreview&&this._dismissals.size>0){const{visible:t,updatedMap:i}=function(e,t,i=Hi()){if(0===t.size)return{visible:e,updatedMap:t};let r=null;const o=[];for(const s of e){const e=t.get(s.id);if(!e){o.push(s);continue}const n=ji(s);e.sig===n?i-e.lastSeenAt>3600&&(r||(r=new Map(t)),r.set(s.id,{...e,lastSeenAt:i})):(r||(r=new Map(t)),r.delete(s.id),o.push(s))}return{visible:o,updatedMap:r??t}}(o,this._dismissals);e&&i!==this._dismissals&&this._scheduleDismissalReconcile(i),o=t}return o}_scheduleDismissalReconcile(e){this._pendingDismissals=e,this._dismissalReconcileScheduled||(this._dismissalReconcileScheduled=!0,queueMicrotask(()=>{this._dismissalReconcileScheduled=!1;const e=this._pendingDismissals;this._pendingDismissals=null,e&&this._dismissalsScope&&(this._dismissals=e,Ji(this._dismissalsScope,e))}))}_onDismiss(e){if(!this._dismissalsScope)return;const t=function(e,t,i=Hi()){const r=new Map(e);return r.set(t.id,{sig:ji(t),dismissedAt:i,lastSeenAt:i}),r}(this._dismissals,e);this._dismissals=t,Ji(this._dismissalsScope,t),!1!==this._config?.showDismissUndo&&this._fireUndoToast(e)}_onUndo(e){if(!this._dismissalsScope)return;const t=function(e,t){if(!e.has(t))return e;const i=new Map(e);return i.delete(t),i}(this._dismissals,e);t!==this._dismissals&&(this._dismissals=t,Ji(this._dismissalsScope,t))}_fireUndoToast(e){const t=this._lang;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:Mt("card.dismissed_toast",t,{event:e.event}),duration:4e3,action:{text:Mt("card.dismissed_toast_undo",t),action:()=>this._onUndo(e.id)}},bubbles:!0,composed:!0}))}_canDismiss(){return!!this._config?.allowDismiss&&!this._forcePreview}_swipeEnabled(){return this._canDismiss()&&("swipe"===this._config?.dismissTrigger||"both"===this._config?.dismissTrigger)}_onSwipePointerDown(e,t){if(!this._swipeEnabled())return;if(this._swipeState)return;if(0!==t.button)return;this._swipePointerId=t.pointerId,this._swipeStartX=t.clientX,this._swipeStartY=t.clientY,this._swipeCurrentDx=0;const i=t.currentTarget.getBoundingClientRect();this._swipeState={id:e.id,offset:0,locked:!1,cardWidth:i.width}}_onSwipePointerMove(e,t){if(!this._swipeState||this._swipeState.id!==e.id)return;if(t.pointerId!==this._swipePointerId)return;const i=t.clientX-this._swipeStartX,r=t.clientY-this._swipeStartY;if(!this._swipeState.locked){if(Math.abs(r)-Math.abs(i)>12)return void(this._swipeState=null);if(i>=0)return void(this._swipeState=null);t.currentTarget.setPointerCapture(t.pointerId),this._swipeState={...this._swipeState,locked:!0}}this._swipeCurrentDx=Math.min(0,i),null===this._swipeRAF&&(this._swipeRAF=requestAnimationFrame(()=>{this._swipeRAF=null,this._swipeState&&this._swipeState.id===e.id&&(this._swipeState={...this._swipeState,offset:this._swipeCurrentDx},this.requestUpdate())}))}_onSwipePointerUp(e,t){if(!this._swipeState||this._swipeState.id!==e.id)return;if(t.pointerId!==this._swipePointerId)return;const i=t.currentTarget;i.hasPointerCapture(t.pointerId)&&i.releasePointerCapture(t.pointerId),null!==this._swipeRAF&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null);const{offset:r,cardWidth:o,locked:s}=this._swipeState;if(this._swipeState=null,this._swipePointerId=null,s&&(this._swipeJustDragged=!0,setTimeout(()=>{this._swipeJustDragged=!1},0)),s&&r<=-.4*o){this._swipeExiting=e.id;const t=this._motionQuery.matches?0:200;this._swipeExitTimeout=window.setTimeout(()=>{this._swipeExitTimeout=null,this._swipeExiting=null,this._onDismiss(e)},t)}else this.requestUpdate()}_onSwipePointerCancel(e,t){if(!this._swipeState||this._swipeState.id!==e.id)return;if(t.pointerId!==this._swipePointerId)return;const i=t.currentTarget;i.hasPointerCapture(t.pointerId)&&i.releasePointerCapture(t.pointerId),null!==this._swipeRAF&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null),this._swipeState=null,this._swipePointerId=null,this.requestUpdate()}_swipeCardStyle(e,t){if(this._swipeExiting===e.id)return t;if(this._swipeState?.id===e.id){const{offset:e,cardWidth:i}=this._swipeState;return`${t} transform: translateX(${e}px); opacity: ${Math.max(0,1+e/i).toFixed(2)};`}return t}_swipeCardClass(e){const t=[];return this._swipeEnabled()&&t.push("swipe-enabled"),this._swipeExiting===e.id?t.push("swipe-exit"):this._swipeState?.id===e.id&&this._swipeState.locked&&t.push("swiping"),t.join(" ")}_isLabeledDismissActive(){return this._canDismiss()&&"swipe"!==this._config?.dismissTrigger&&"labeled"===this._config?.dismissButtonStyle&&!this._isCompact}_renderDismissButton(e){return this._canDismiss()?"swipe"===this._config?.dismissTrigger?Y:this._isLabeledDismissActive()?j`
        <button
          type="button"
          class="dismiss-button labeled"
          aria-label=${Mt("card.dismiss",this._lang)}
          title=${Mt("card.dismiss",this._lang)}
          @click=${t=>{t.stopPropagation(),this._onDismiss(e)}}
        >
          <ha-icon icon="mdi:close"></ha-icon>
          <span>${Mt("card.dismiss",this._lang)}</span>
        </button>
      `:j`
      <button
        type="button"
        class="dismiss-button"
        aria-label=${Mt("card.dismiss",this._lang)}
        title=${Mt("card.dismiss",this._lang)}
        @click=${t=>{t.stopPropagation(),this._onDismiss(e)}}
      >
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    `:Y}_filterAndSort(e,t){if(!this._config)return e;let i=e;if(!1!==this._config.deduplicate&&(i=function(e,t){const i=new Map,r=[];for(const t of e){const e=`${t.event}\0${t.severity}\0${t.onsetTs}\0${t.endsTs}\0${t.provider}`,o=i.get(e);o?o.push(t):(i.set(e,[t]),r.push(e))}let o=r.map(e=>{const t=i.get(e);if(1===t.length)return t[0];const r={...t[0]},o=new Set,s=new Set;for(const e of t){for(const t of e.zones)o.add(t.toUpperCase());e.areaDesc&&s.add(e.areaDesc)}return r.zones=[...o],r.areaDesc=[...s].join("; "),r.mergedCount=t.length,r.id=`merged:${e}`,r});if(t&&t.length>1){const e=new Map;for(let i=0;i<t.length;i++)e.has(t[i])||e.set(t[i],i);const i=new Map;for(const t of o){if(0===t.endsTs)continue;const r=`${t.event}\0${t.endsTs}`,o=i.get(r);(!o||(e.get(t.provider)??1/0)<(e.get(o)??1/0))&&i.set(r,t.provider)}o=o.filter(e=>{if(0===e.endsTs)return!0;const t=`${e.event}\0${e.endsTs}`;return e.provider===i.get(t)})}return o}(i,t?.providerPriority)),!t?.skipZones&&this._config.zones&&this._config.zones.length>0){const e=new Set(this._config.zones.map(e=>e.toUpperCase()));i=i.filter(t=>{return i=e,t.zones.some(e=>i.has(e.toUpperCase()));var i})}if(this._config.eventCodes&&this._config.eventCodes.length>0){const e=new Set(this._config.eventCodes.map(e=>e.toUpperCase()));i=i.filter(t=>t.eventCode&&e.has(t.eventCode.toUpperCase()))}if(this._config.excludeEventCodes&&this._config.excludeEventCodes.length>0){const e=new Set(this._config.excludeEventCodes.map(e=>e.toUpperCase()));i=i.filter(t=>!t.eventCode||!e.has(t.eventCode.toUpperCase()))}if(this._config.minSeverity){const e={extreme:0,severe:1,moderate:2,minor:3,unknown:4},t=e[this._config.minSeverity]??4;i=i.filter(i=>"unknown"===i.severity||(e[i.severity]??4)<=t)}if(!1!==this._config.hideExpired){const e=Date.now()/1e3;i=i.filter(t=>0===t.endsTs||t.endsTs>e)}return function(e,t){return"onset"===t?[...e].sort((e,t)=>(e.onsetTs||1/0)-(t.onsetTs||1/0)):"severity"===t?[...e].sort((e,t)=>{const i=(pi[e.severity]??4)-(pi[t.severity]??4);return 0!==i?i:(e.onsetTs||1/0)-(t.onsetTs||1/0)}):e}(i,this._config.sortOrder||"default")}get _locale(){if(!this.hass)return{language:navigator.language||"en",time_format:"language",date_format:"language",timeZone:void 0};const e="browser"===this._config?.timezone?Intl.DateTimeFormat().resolvedOptions().timeZone:this.hass.config?.time_zone;return{...this.hass.locale,timeZone:e}}get _lang(){return this.hass?.locale?.language||"en"}get _animationsEnabled(){return!0===this._config?.animations||!1!==this._config?.animations&&!this._motionQuery.matches}get _isCompact(){return"compact"===this._config?.layout}get _colorTheme(){return this._config?.colorTheme||"severity"}get _fontScale(){switch(this._config?.fontSize){case"small":return.85;case"large":return 1.2;case"x-large":return 1.4;default:return}}get _scaleStyle(){const e=this._fontScale;return void 0!==e?`--wac-scale: ${e}`:""}_scaledPx(e){const t=this._fontScale;return void 0!==t?Math.round(e*t):e}get _contrastMode(){return function(e){return e??Wt}(this._config?.enhanceContrast)}_alertColorStyle(e){if("nws"===this._colorTheme){const{color:t,rgb:i,textColorLight:r,textColorDark:o}=Vt(e.event,this._contrastMode);return`--color: ${t}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${o};`}if("meteoalarm"===this._colorTheme){const{color:t,rgb:i,textColorLight:r,textColorDark:o}=Jt(e.severity,this._contrastMode);return`--color: ${t}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${o};`}if("eccc"===this._colorTheme){const{color:t,rgb:i,textColorLight:r,textColorDark:o}=ti(e,this._contrastMode);return`--color: ${t}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${o};`}return""}_alertBoostClasses(e){const t=this._contrastMode;if("off"===t)return"";let i=null;if("nws"===this._colorTheme?i=Vt(e.event,t):"meteoalarm"===this._colorTheme?i=Jt(e.severity,t):"eccc"===this._colorTheme&&(i=ti(e,t)),!i)return"";const r=[];return i.boostLight&&r.push("boost-light"),i.boostDark&&r.push("boost-dark"),i.progressBoostLight&&r.push("progress-boost-light"),i.progressBoostDark&&r.push("progress-boost-dark"),r.join(" ")}get _themeMode(){const e=this.hass?.themes?.darkMode;return"boolean"==typeof e?e?"dark":"light":window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}_normalizeText(e){return(e||"").replace(/\n{2,}/g,"\n\n").trim()}_toggleDetails(e){if(this._swipeJustDragged)return void(this._swipeJustDragged=!1);const t=new Map(this._expandedAlerts);t.set(e,!t.get(e)),this._expandedAlerts=t,(this._config?.entity||this._config?.device)&&ur._editorExpandedState.set(this._entityStateKey(),t)}_sourceLinkLabel(e){const t=gr[e.provider]||"Alert";return Mt("card.open_source",this._lang,{provider:t})}render(){if(!this._config)return j``;if(!this.hass)return this._renderPreview();const e=this._getAllEntities().map(e=>this.hass.states[e]).filter(Boolean),t=!!this._config.device&&this._deviceHasAnyEntity(this._config.device);if(0===e.length&&!t||this._forcePreview)return this._renderPreview();const i=e.length>0&&e.every(e=>"unavailable"===e.state||"unknown"===e.state);if(i){const t=e[0].state;return j`
        <ha-card .header=${this._config.title||""}>
          <div class="sensor-unavailable">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            ${Mt("card.sensor_unavailable",this._lang,{state:t})}
          </div>
        </ha-card>
      `}const r=this._getAlerts();if(0===r.length&&this._config.hideNoAlerts)return this.style.display="none",j``;this.style.display="";const o=this._animationsEnabled?"":"no-animations",s=this._isCompact?"compact":"";return j`
      <ha-card .header=${this._config.title||""} class="${o} ${s}" data-theme-mode=${this._themeMode} style=${this._scaleStyle}>
        ${0===r.length?this._renderNoAlerts():r.map(e=>this._renderAlert(e))}
      </ha-card>
    `}_renderPreview(){const e=this._filterAndSort(function(){const e=Date.now()/1e3;return[{id:"preview-1",event:"Gentle Wind Watch",severity:"minor",severityLabel:"Minor",certainty:"Possible",urgency:"Future",sentTs:e-3600,onsetTs:e+3600,endsTs:e+21600,description:"A gentle breeze may arrive later. This is sample data showing an upcoming alert.",instruction:"",url:"",headline:"Gentle Wind Watch for Sampletown County",areaDesc:"Sampletown County",zones:["SAMPLE02"],eventCode:"WIA",provider:"nws",phase:"",severityInferred:!0,certaintyInferred:!1},{id:"preview-2",event:"Sunshine Heat Advisory",severity:"moderate",severityLabel:"Moderate",certainty:"Likely",urgency:"Expected",sentTs:e-7200,onsetTs:e-3600,endsTs:e+7200,description:"This is a sample alert demonstrating the card layout. No action required.",instruction:"Enjoy the weather! This is placeholder data for the card preview.",url:"",headline:"Sunshine Heat Advisory for Pleasantville",areaDesc:"Pleasantville, USA",zones:["SAMPLE01"],eventCode:"HTA",provider:"nws",phase:"Update",severityInferred:!1,certaintyInferred:!1},{id:"preview-3",event:"Frost Advisory",severity:"minor",severityLabel:"Minor",certainty:"Likely",urgency:"Expected",sentTs:e-28800,onsetTs:e-21600,endsTs:e-7200,description:"A light frost occurred overnight. This is sample data showing an expired alert.",instruction:"",url:"",headline:"Frost Advisory expired for Pleasantville",areaDesc:"Pleasantville, USA",zones:["SAMPLE01"],eventCode:"FRA",provider:"nws",phase:"",severityInferred:!1,certaintyInferred:!0}]}(),{skipZones:!0}),t=this._animationsEnabled?"":"no-animations",i=this._isCompact?"compact":"";return j`
      <ha-card .header=${this._config.title||""} class="${t} ${i}" data-theme-mode=${this._themeMode} style=${this._scaleStyle}>
        <div class="preview-label">${Mt("card.preview",this._lang)}</div>
        ${e.map(e=>this._renderAlert(e))}
      </ha-card>
    `}_renderNoAlerts(){return j`
      <div class="no-alerts">
        <ha-icon icon="mdi:weather-sunny"></ha-icon><br>
        ${Mt("card.no_alerts",this._lang)}
      </div>
    `}_renderAlert(e){const t=`severity-${e.severity}`,i=function(e){const t=Date.now()/1e3,i=e.sentTs,r=i>0?i:t;let o=e.onsetTs;0===o&&(o=r);const s=o+3600;let n=e.endsTs;0===n&&(n=s);const a=e.endsTs>0,c=t>=o,d=a&&t>=n;let l,h,p,u;d?(l=o,h=n,p=n,u="Expired"):c?(l=o,h=n,p=t,u="Active"):(l=t,h=n,p=o,u="Preparation");const g=h-l,m=(p-l)/(g>0?g:1)*100;return{isActive:c,isExpired:d,phaseText:u,progressPct:Math.max(0,Math.min(100,Math.round(10*m)/10)),remainingHours:Math.round((n-t)/3600*10)/10,onsetHours:Math.round((o-t)/3600*10)/10,onsetMinutes:Math.round((o-t)/60),onsetTs:o,endsTs:n,sentTs:i,nowTs:t,hasEndTime:a}}(e),r=i.phaseText.toLowerCase(),o=this._expandedAlerts.get(e.id)||!1;return this._isCompact?this._renderCompactAlert(e,t,r,i,o):this._renderFullAlert(e,t,r,i,o)}_renderCompactAlert(e,t,i,r,o){const s=this._lang,n=r.isActive&&!r.hasEndTime,a=r.isExpired?Mt("progress.compact_expired",s,{time:di(r.endsTs,r.nowTs)}):n?Mt("progress.compact_ongoing",s):r.isActive?Mt("progress.compact_active",s,{time:di(r.endsTs,r.nowTs)}):Mt("progress.compact_prep",s,{time:di(r.onsetTs,r.nowTs)}),c=n?"ongoing":"",d=this._alertBoostClasses(e),l=n?"":`--progress: ${r.progressPct}%;`,h=this._swipeCardClass(e),p=this._swipeCardStyle(e,`${this._alertColorStyle(e)} ${l}`);return j`
      <div
        class="alert-card ${t} ${i} ${c} ${d} ${h}"
        style=${p}
        @pointerdown=${t=>this._onSwipePointerDown(e,t)}
        @pointermove=${t=>this._onSwipePointerMove(e,t)}
        @pointerup=${t=>this._onSwipePointerUp(e,t)}
        @pointercancel=${t=>this._onSwipePointerCancel(e,t)}
      >
        <div
          class="alert-header-row compact-row"
          @click=${()=>this._toggleDetails(e.id)}
        >
          <div class="icon-box">
            <ha-icon icon=${e.providerIcon??Ft(e.iconHint||e.event)}></ha-icon>
          </div>
          ${this._renderProviderHint(e)}
          <span class="alert-title">${e.event}</span>
          <span class="compact-time">${a}</span>
          <ha-icon
            icon="mdi:chevron-down"
            class="compact-chevron ${o?"expanded":""}"
          ></ha-icon>
          ${this._renderDismissButton(e)}
        </div>
        ${o?this._renderExpandedContent(e,r):Y}
      </div>
    `}_renderExpandedContent(e,t){return j`
      <div class="alert-expanded">
        ${this._renderHeadline(e)}
        ${e.areaDesc?j`
          <div class="area-desc" title=${e.areaDesc}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span class="area-desc-text">${e.areaDesc}</span>
          </div>
        `:Y}
        <div class="badges-row" style="padding: 0 12px 8px;">
          ${this._renderBadgesRow(e,t)}
        </div>

        ${this._renderProgressSection(e,t)}

        ${!1!==this._config?.showDetails?this._config?.expandDetails?j`
        ${this._renderDetailsContent(e,t)}
        `:j`
        <div class="alert-details-section">
          <div
            class="details-summary"
            @click=${()=>this._toggleDetails(e.id+"_details")}
          >
            <span>${Mt("card.read_details",this._lang)}</span>
            <ha-icon
              icon="mdi:chevron-down"
              class="chevron ${this._expandedAlerts.get(e.id+"_details")?"expanded":""}"
            ></ha-icon>
          </div>
          ${this._expandedAlerts.get(e.id+"_details")?this._renderDetailsContent(e,t):Y}
        </div>
        `:Y}
      </div>
    `}_renderFullAlert(e,t,i,r,o){const s=this._alertBoostClasses(e),n=this._swipeCardClass(e),a=this._swipeCardStyle(e,this._alertColorStyle(e));return j`
      <div
        class="alert-card ${t} ${i} ${s} ${n}"
        style=${a}
        @pointerdown=${t=>this._onSwipePointerDown(e,t)}
        @pointermove=${t=>this._onSwipePointerMove(e,t)}
        @pointerup=${t=>this._onSwipePointerUp(e,t)}
        @pointercancel=${t=>this._onSwipePointerCancel(e,t)}
      >
        <div class="alert-header-row">
          <div class="icon-box">
            <ha-icon icon=${e.providerIcon??Ft(e.iconHint||e.event)}></ha-icon>
          </div>
          <div class="info-box">
            <div class="title-row">
              ${this._renderProviderHint(e)}
              <span class="alert-title">${e.event}</span>
            </div>
            ${this._renderHeadline(e)}
            ${e.areaDesc?j`
              <div class="area-desc" title=${e.areaDesc}>
                <ha-icon icon="mdi:map-marker"></ha-icon>
                <span class="area-desc-text">${e.areaDesc}</span>
              </div>
            `:Y}
            <div class="badges-row">
              ${this._renderBadgesRow(e,r)}
            </div>
          </div>
          ${this._renderDismissButton(e)}
        </div>

        ${this._renderProgressSection(e,r)}

        ${!1!==this._config?.showDetails?this._config?.expandDetails?j`
        ${this._renderDetailsContent(e,r)}
        `:j`
        <div class="alert-details-section">
          <div
            class="details-summary"
            @click=${()=>this._toggleDetails(e.id)}
          >
            <span>${Mt("card.read_details",this._lang)}</span>
            <ha-icon
              icon="mdi:chevron-down"
              class="chevron ${o?"expanded":""}"
            ></ha-icon>
          </div>
          ${o?this._renderDetailsContent(e,r):Y}
        </div>
        `:Y}
      </div>
    `}_renderProviderHint(e){if(!0!==this._config?.showProvider)return Y;const t=mr[e.provider]||e.provider.toUpperCase();return j`<span class="provider-hint">${t}</span>`}_renderHeadline(e){const t=function(e,t=!0){const i=(e.headline||"").trim();if(!i)return"";if(!t)return i;const r=i.toLowerCase().replace(/[.\s]+$/,""),o=e.event.toLowerCase();return r.startsWith(o)||o.startsWith(r)?"":i}(e,!1!==this._config?.deduplicateHeadlines);return t?j`
      <div class="alert-headline" title=${e.headline}>
        ${t}
      </div>
    `:Y}_renderBadgesRow(e,t){const i=e.severityBadgeLabel??Mt("badge.severity_"+e.severity,this._lang),r=e.certainty?Mt("badge.certainty_"+e.certainty.toLowerCase(),this._lang):"";return j`
      <span class="badge severity-badge${e.severityInferred?" badge-inferred":""}">${i}</span>
      ${e.certainty?j`
        <span class="badge certainty-badge${e.certaintyInferred?" badge-inferred":""}">
          <ha-icon
            icon=${function(e){const t=e.toLowerCase();for(const[e,i]of Rt)if(e.some(e=>t.includes(e)))return i;return"mdi:bullseye-arrow"}(e.certainty)}
            style="--mdc-icon-size: ${this._scaledPx(14)}px; width: ${this._scaledPx(14)}px; height: ${this._scaledPx(14)}px;"
          ></ha-icon>
          ${r}
        </span>
      `:Y}
      ${e.phase?j`
        <span class="badge phase-badge">${e.phase}</span>
      `:Y}
      ${e.eventCode?j`
        <span class="badge event-code-badge">${e.eventCode}</span>
      `:Y}
      ${e.mergedCount&&e.mergedCount>1?j`<span class="badge zones-badge">${Mt("card.zones_count",this._lang,{count:e.mergedCount})}</span>`:Y}
    `}_renderTextBlock(e,t){return t?j`
      <div class="text-block">
        <div class="text-label">${e}</div>
        <div class="text-body">${ye(function(e){return e?Tt.sanitize(e,{ALLOWED_TAGS:Nt,ALLOWED_ATTR:["href"]}):""}(t))}</div>
      </div>
    `:Y}_renderDetailsContent(e,t){const i=!1!==this._config?.reformatText;let r=this._normalizeText(e.description),o=this._normalizeText(e.instruction);i&&(r=li(r),o=li(o));const s=this._lang;return j`
      <div class="details-content">
        ${!1!==this._config?.showMetadata?j`
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">${Mt("detail.issued",s)}</span>
            <span class="meta-value">${ai(t.sentTs,this._locale,s)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">${Mt("detail.onset",s)}</span>
            <span class="meta-value">${ai(t.onsetTs,this._locale,s)}</span>
            <span class="meta-relative">${ci(t.onsetTs,t.nowTs,s)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">${t.isExpired?Mt("progress.expired_label",s):Mt("detail.expires",s)}</span>
            <span class="meta-value">${ai(t.endsTs,this._locale,s)}</span>
            ${t.hasEndTime?j`<span class="meta-relative">${ci(t.endsTs,t.nowTs,s)}</span>`:Y}
          </div>
          ${e.areaDesc?j`
            <div class="meta-item" style="grid-column: 1 / -1;">
              <span class="meta-label">${Mt("detail.area",s)}</span>
              <span class="meta-value">${e.areaDesc}</span>
            </div>
          `:Y}
        </div>
        `:Y}

        ${!0===this._config?.showGeometry?this._renderGeometry(e):Y}

        ${!1!==this._config?.showDescription?this._renderTextBlock(Mt("detail.description",s),r):Y}
        ${!1!==this._config?.showInstructions?this._renderTextBlock(Mt("detail.instructions",s),o):Y}

        ${e.url&&!1!==this._config?.showSourceLink?j`
          <div class="footer-link">
            <a href=${e.url} target="_blank" rel="noopener noreferrer">
              ${this._sourceLinkLabel(e)}
              <ha-icon icon="mdi:open-in-new" style="width:${this._scaledPx(14)}px;"></ha-icon>
            </a>
          </div>
        `:Y}
      </div>
    `}_renderGeometry(e){if(!0!==this._config?.showGeometry||!e.bbox)return Y;const t=e.geometryRef?this._geometryCache.get(e.geometryRef):void 0;if("map"===this._config?.geometryStyle)return this._renderGeometryMap(e,t??void 0);const{viewBox:i,polygonPaths:r}=function(e,t){const[i,r,o,s]=e,n=(r+s)/2,a=Math.cos(n*Math.PI/180)||er,c=Math.max((o-i)*a,er),d=Math.max(s-r,er),l=`0 0 ${rr(c)} ${rr(d)}`,h=(e,t)=>[(e-i)*a,s-t],p=tr(t).map(e=>ir(e,h)).filter(e=>null!==e);return{viewBox:l,polygonPaths:p}}(e.bbox,t??void 0);return j`
      <svg
        class="alert-geometry"
        viewBox=${i}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label=${e.areaDesc||Mt("detail.area",this._lang)}
      >
        <rect class="geometry-frame" x="0" y="0" width="100%" height="100%"></rect>
        ${r.map(e=>G`<path class="geometry-shape" d=${e}></path>`)}
      </svg>
    `}_renderGeometryMap(e,t){const i=this._config?.geometryTileUrl,r=i||("dark"===this._themeMode?"https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png":"https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"),o=this._config?.geometryTileAttribution??(i?"© OpenStreetMap":or),{viewBox:s,aspect:n,tiles:a,polygonPaths:c}=lr(e.bbox,t,{tileUrl:r,attribution:o}),d=e.areaDesc||Mt("detail.area",this._lang);return j`
      <div class="alert-geometry-map" style="aspect-ratio: ${n};">
        <svg
          class="alert-geometry map"
          viewBox=${s}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label=${d}
        >
          ${a.map(e=>G`<image
            href=${e.href}
            x=${e.x}
            y=${e.y}
            width=${e.size}
            height=${e.size}
          ></image>`)}
          <rect class="geometry-frame" x="0" y="0" width="100%" height="100%"></rect>
          ${c.map(e=>G`<path class="geometry-shape-casing" d=${e}></path>`)}
          ${c.map(e=>G`<path class="geometry-shape" d=${e}></path>`)}
        </svg>
        <span class="geometry-attrib">${o}</span>
      </div>
    `}_renderProgressSection(e,t){const{isActive:i,progressPct:r,hasEndTime:o,onsetTs:s,endsTs:n,nowTs:a}=t,c=this._lang,d=!this._animationsEnabled,l=t.isExpired?"left: 0; right: 0;":i&&!o?d?"width: 100%; left: 0; opacity: 0.8;":"width: 100%; left: 0; animation: ongoing-pulse 5s infinite; opacity: 0.8;":`left: ${r}%; right: 0;`;return j`
      <div class="progress-section">
        <div class="progress-labels">
          <div class="label-left">
            <span class="label-sub">${Mt(i?"progress.start":"progress.now",c)}</span>
            <span>${ni(i?s:a,this._locale,c)}</span>
          </div>
          <div class="label-center">
            ${o?t.isExpired?j`<span class="label-sub">${Mt("progress.expired_label",c)}</span><span>${di(n,a)}</span>`:i?j`<span class="label-sub">${Mt("progress.expires_in_label",c)}</span><span>${di(n,a)}</span>`:j`<span class="label-sub">${Mt("progress.starts_in_label",c)}</span><span>${di(s,a)}</span>`:j`<span class="label-sub">${Mt("progress.ongoing",c)}</span>`}
          </div>
          <div class="label-right">
            <span class="label-sub">${Mt("progress.end",c)}</span>
            <span>${o?ni(n,this._locale,c):Mt("progress.tbd",c)}</span>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style=${l}></div>
        </div>
      </div>
    `}};_r.styles=hr,_r._editorExpandedState=new Map,e([ge({attribute:!1})],_r.prototype,"hass",void 0),e([me()],_r.prototype,"_config",void 0),e([me()],_r.prototype,"_expandedAlerts",void 0),e([me()],_r.prototype,"_forcePreview",void 0),e([me()],_r.prototype,"_dismissals",void 0),e([me()],_r.prototype,"_swipeExiting",void 0),e([me()],_r.prototype,"_geometryCache",void 0),_r=ur=e([he("weather-alerts-card")],_r);const fr=window;fr.customCards=fr.customCards||[],fr.customCards.push({type:"weather-alerts-card",name:"Weather Alerts Card",preview:!0,description:"A card for displaying weather alerts with severity indicators, progress bars, and expandable details. Supports NWS (US), BoM (Australia), and MeteoAlarm (Europe)."});export{_r as WeatherAlertsCard,Ui as resolveDeviceAlertEntities,Bi as subscribeEntityRegistry};
