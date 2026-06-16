function e(e,t,i,o){var r,n=arguments.length,s=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,i,s):r(t,i))||s);return n>3&&s&&Object.defineProperty(t,i,s),s}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),r=new WeakMap;let n=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const s=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new n(i,e,o)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:d,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:g,getPrototypeOf:u}=Object,h=globalThis,v=h.trustedTypes,m=v?v.emptyScript:"",_=h.reactiveElementPolyfillSupport,b=(e,t)=>e,f={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!d(e,t),x={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:y};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),h.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&l(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:r}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const n=o?.call(this);r?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...p(e),...g(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,o)=>{if(i)e.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of o){const o=document.createElement("style"),r=t.litNonce;void 0!==r&&o.setAttribute("nonce",r),o.textContent=i.cssText,e.appendChild(o)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(o):this.setAttribute(o,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=o;const n=r.fromAttribute(t,e.type);this[o]=n??this._$Ej?.get(o)??n,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const o=this.constructor,r=this[e];if(i??=o.getPropertyOptions(e),!((i.hasChanged??y)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==r||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,_?.({ReactiveElement:$}),(h.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w=globalThis,k=w.trustedTypes,C=k?k.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+E,A=`<${z}>`,I=document,P=()=>I.createComment(""),T=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,D="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,B=/-->/g,M=/>/g,L=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),G=/'/g,O=/"/g,W=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),V=Symbol.for("lit-noChange"),U=Symbol.for("lit-nothing"),F=new WeakMap,H=I.createTreeWalker(I,129);function q(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const J=(e,t)=>{const i=e.length-1,o=[];let r,n=2===t?"<svg>":3===t?"<math>":"",s=R;for(let t=0;t<i;t++){const i=e[t];let a,d,l=-1,c=0;for(;c<i.length&&(s.lastIndex=c,d=s.exec(i),null!==d);)c=s.lastIndex,s===R?"!--"===d[1]?s=B:void 0!==d[1]?s=M:void 0!==d[2]?(W.test(d[2])&&(r=RegExp("</"+d[2],"g")),s=L):void 0!==d[3]&&(s=L):s===L?">"===d[0]?(s=r??R,l=-1):void 0===d[1]?l=-2:(l=s.lastIndex-d[2].length,a=d[1],s=void 0===d[3]?L:'"'===d[3]?O:G):s===O||s===G?s=L:s===B||s===M?s=R:(s=L,r=void 0);const p=s===L&&e[t+1].startsWith("/>")?" ":"";n+=s===R?i+A:l>=0?(o.push(a),i.slice(0,l)+S+i.slice(l)+E+p):i+E+(-2===l?t:p)}return[q(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class K{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let r=0,n=0;const s=e.length-1,a=this.parts,[d,l]=J(e,t);if(this.el=K.createElement(d,i),H.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=H.nextNode())&&a.length<s;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(S)){const t=l[n++],i=o.getAttribute(e).split(E),s=/([.?@])?(.*)/.exec(t);a.push({type:1,index:r,name:s[2],strings:i,ctor:"."===s[1]?ee:"?"===s[1]?te:"@"===s[1]?ie:Q}),o.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:r}),o.removeAttribute(e));if(W.test(o.tagName)){const e=o.textContent.split(E),t=e.length-1;if(t>0){o.textContent=k?k.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],P()),H.nextNode(),a.push({type:2,index:++r});o.append(e[t],P())}}}else if(8===o.nodeType)if(o.data===z)a.push({type:2,index:r});else{let e=-1;for(;-1!==(e=o.data.indexOf(E,e+1));)a.push({type:7,index:r}),e+=E.length-1}r++}}static createElement(e,t){const i=I.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,o){if(t===V)return t;let r=void 0!==o?i._$Co?.[o]:i._$Cl;const n=T(t)?void 0:t._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(e),r._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=r:i._$Cl=r),void 0!==r&&(t=Y(e,r._$AS(e,t.values),r,o)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??I).importNode(t,!0);H.currentNode=o;let r=H.nextNode(),n=0,s=0,a=i[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new Z(r,r.nextSibling,this,e):1===a.type?t=new a.ctor(r,a.name,a.strings,this,e):6===a.type&&(t=new oe(r,this,e)),this._$AV.push(t),a=i[++s]}n!==a?.index&&(r=H.nextNode(),n++)}return H.currentNode=I,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Z{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=U,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),T(e)?e===U||null==e||""===e?(this._$AH!==U&&this._$AR(),this._$AH=U):e!==this._$AH&&e!==V&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==U&&T(this._$AH)?this._$AA.nextSibling.data=e:this.T(I.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=K.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new X(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=F.get(e.strings);return void 0===t&&F.set(e.strings,t=new K(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const r of e)o===t.length?t.push(i=new Z(this.O(P()),this.O(P()),this,this.options)):i=t[o],i._$AI(r),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,r){this.type=1,this._$AH=U,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=U}_$AI(e,t=this,i,o){const r=this.strings;let n=!1;if(void 0===r)e=Y(this,e,t,0),n=!T(e)||e!==this._$AH&&e!==V,n&&(this._$AH=e);else{const o=e;let s,a;for(e=r[0],s=0;s<r.length-1;s++)a=Y(this,o[i+s],t,s),a===V&&(a=this._$AH[s]),n||=!T(a)||a!==this._$AH[s],a===U?e=U:e!==U&&(e+=(a??"")+r[s+1]),this._$AH[s]=a}n&&!o&&this.j(e)}j(e){e===U?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===U?void 0:e}}class te extends Q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==U)}}class ie extends Q{constructor(e,t,i,o,r){super(e,t,i,o,r),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??U)===V)return;const i=this._$AH,o=e===U&&i!==U||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==U&&(i===U||o);o&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const re=w.litHtmlPolyfillSupport;re?.(K,Z),(w.litHtmlVersions??=[]).push("3.3.1");const ne=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class se extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let r=o._$litPart$;if(void 0===r){const e=i?.renderBefore??null;o._$litPart$=r=new Z(t.insertBefore(P(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}}se._$litElement$=!0,se.finalized=!0,ne.litElementHydrateSupport?.({LitElement:se});const ae=ne.litElementPolyfillSupport;ae?.({LitElement:se}),(ne.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},le={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:y},ce=(e=le,t,i)=>{const{kind:o,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===o&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===o){const{name:o}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(o,r,e)},init(t){return void 0!==t&&this.C(o,void 0,e,t),t}}}if("setter"===o){const{name:o}=i;return function(i){const r=this[o];t.call(this,i),this.requestUpdate(o,r,e)}}throw Error("Unsupported decorator location: "+o)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pe(e){return(t,i)=>"object"==typeof i?ce(e,t,i):((e,t,i)=>{const o=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),o?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ge(e){return pe({...e,state:!0,attribute:!1})}const ue=319486977,he={id:ue,vendorId:4874,name:"Eve Thermo",description:"Eve thermostat proprietary cluster for schedule and valve data",attributes:[{id:319422464,name:"schedule",type:{type:"blob",parser:"eve.schedule"},access:["R"],description:"Heating schedule binary data. Contains weekly schedule with day entries and time slots.",parser:"eve.schedule"},{id:319422488,name:"valvePosition",type:"uint8",access:["R","S"],description:"Current valve opening position",unit:"%",sensor:{entityType:"sensor",stateClass:"measurement",entityCategory:"diagnostic",icon:"mdi:valve"}},{id:319422480,name:"temperatureOffset",type:"int8",access:["R","W"],description:"Temperature calibration offset. Value in 0.1°C increments.",unit:"°C",sensor:{entityType:"number",deviceClass:"temperature",entityCategory:"config",scale:.1,icon:"mdi:thermometer-plus"}}]},ve=4447,me=291503106,_e={id:me,vendorId:ve,name:"Aqara Lock Settings",description:"Aqara proprietary lock settings cluster. Attribute meanings are partially documented.",attributes:[{id:291438609,name:"setting1",type:"uint8",access:["R"],description:"Unknown setting (possibly lock mode). Observed value: 1"},{id:291438610,name:"setting2",type:"uint8",access:["R"],description:"Unknown setting (possibly sound). Observed value: 2"},{id:291438611,name:"setting3",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 0"},{id:291438612,name:"setting4",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 0"},{id:291438613,name:"setting5",type:"uint8",access:["R"],description:"Unknown setting. Observed value: 1"}]},be={id:323746816,vendorId:ve,name:"Aqara Unknown",description:"Unknown Aqara proprietary cluster found on endpoint 0",attributes:[{id:323682304,name:"unknown",type:"bool",access:["R"],description:"Unknown boolean attribute. Observed value: true"}]},fe=[...[{id:"eve_thermo",fingerprint:{vendorId:4874,requiredClusters:[ue],requiredDeviceTypes:[769]},vendor:"Eve Systems",model:"Eve Thermo",description:"Smart radiator valve with Thread/Matter, HomeKit and weekly heating schedules",extends:[{name:"thermostatSchedule",clusters:[he],uiComponent:"eve-schedule",showInDetails:!0}],productUrl:"https://www.evehome.com/eve-thermo"}],...[{id:"aqara_u200",fingerprint:{vendorId:ve,requiredClusters:[me],requiredDeviceTypes:[10]},vendor:"Aqara",model:"Smart Lock U200",description:"Smart lock with Matter, fingerprint reader, NFC, and smartphone unlock",extends:[{name:"aqaraLockSettings",clusters:[_e,be],showInDetails:!0}],productUrl:"https://www.aqara.com/eu/product/smart-lock-u200"},{id:"aqara_w100",fingerprint:{vendorId:ve,productNamePattern:"W100",requiredDeviceTypes:[770]},vendor:"Aqara",model:"Climate Sensor W100",description:"Temperature and humidity sensor with Matter support. Uses standard clusters only.",productUrl:"https://www.aqara.com/eu/product/temperature-humidity-sensor-w100"}]],ye=[...[he],...[_e,be]];const xe={4874:"Eve",4447:"Aqara"};function $e(e){return e>=65536}function we(e){const t=function(e){return ye.find(t=>t.id===e)}(e);if(t)return t.name;if($e(e)){const t=function(e){return $e(e)?e>>16&65535:null}(e);if(t){const i=function(e){return xe[e]||`Vendor ${e}`}(t);return`${i} Proprietary (0x${e.toString(16)})`}return`Proprietary (0x${e.toString(16)})`}return`Cluster 0x${e.toString(16).padStart(4,"0")}`}function ke(e,t,i){return function(e,t,i){return fe.find(o=>{const r=o.fingerprint;return r.vendorId===e&&(!(r.requiredClusters&&t&&!r.requiredClusters.every(e=>t.includes(e)))&&!(r.requiredDeviceTypes&&i&&!r.requiredDeviceTypes.every(e=>i.includes(e))))})}(e,t,i)}const Ce=3,Se=4,Ee=5,ze=6,Ae=8,Ie=29,Pe=30,Te=31,Ne=40,De=47,Re=768,Be=258,Me=513,Le=516,Ge=1026,Oe=1027,We=1029,je=1030,Ve=59,Ue={[Ce]:"Identify",[Se]:"Groups",[Ee]:"Scenes",[ze]:"On/Off",[Ae]:"Level Control",[Ie]:"Descriptor",[Pe]:"Binding",[Te]:"Access Control",[Ne]:"Basic Information",42:"OTA Update",[De]:"Power Source",48:"General Commissioning",49:"Network Commissioning",50:"Diagnostic Logs",51:"General Diagnostics",52:"Software Diagnostics",53:"Thread Diagnostics",56:"Ethernet Diagnostics",60:"Admin Commissioning",62:"Operational Credentials",63:"Group Key Management",70:"Time Sync",[Re]:"Color Control",[Be]:"Window Covering",[Me]:"Thermostat",[Le]:"Thermostat UI",514:"Fan Control",[Ge]:"Temperature",[Oe]:"Pressure",[We]:"Humidity",[je]:"Occupancy",[Ve]:"Switch"},Fe={15:"Generic Switch",17:"Power Source",18:"OTA Requestor",19:"OTA Provider",20:"Aggregator",22:"Root Node",256:"On/Off Light",257:"Dimmable Light",258:"Color Temperature Light",259:"On/Off Light Switch",260:"Dimmer Switch",261:"Color Dimmer Switch",262:"Light Sensor",263:"Occupancy Sensor",266:"On/Off Plug-in Unit",267:"Dimmable Plug-in Unit",268:"Color Temperature Light",269:"Extended Color Light",769:"Thermostat",770:"Temperature Sensor",771:"Humidity Sensor",772:"Air Quality Sensor",10:"Door Lock",11:"Door Lock Controller",514:"Window Covering",515:"Window Covering Controller",21:"Contact Sensor",38:"Flow Sensor",44:"Smoke/CO Alarm",35:"Casting Video Player",36:"Content App",40:"Basic Video Player",41:"Casting Video Client",43:"Speaker"},He={[ze]:{action:"control the on/off state of",dataType:"on/off commands"},[Ae]:{action:"control the brightness/level of",dataType:"level/dimming commands"},[Re]:{action:"control the color of",dataType:"color commands"},[Ge]:{action:"read temperature data from",dataType:"temperature readings"},[Oe]:{action:"read pressure data from",dataType:"pressure readings"},[We]:{action:"read humidity data from",dataType:"humidity readings"},[je]:{action:"receive occupancy status from",dataType:"occupancy/presence data"},[Me]:{action:"control thermostat settings on",dataType:"thermostat commands"},[Ee]:{action:"trigger scenes on",dataType:"scene commands"},[Se]:{action:"manage group membership on",dataType:"group commands"},[Ve]:{action:"send button events to",dataType:"press/release events"}};function qe(e){return null===e?"Any Cluster":Ue[e]?Ue[e]:we(e)}function Je(e){return Fe[e]||`Type ${e}`}function Ke(e){return null===e?{action:"send all commands to",dataType:"all supported commands"}:He[e]||{action:"communicate with",dataType:`${qe(e)} data`}}const Ye=[{id:"thermostat-contact-window",sourceDeviceTypes:[769],targetDeviceTypes:[21],title:"Turn off heating when window opens",description:"Automatically pause heating/cooling when a window or door is opened to save energy.",why:"This thermostat doesn't have a client cluster for Boolean State (contact sensors). Matter bindings require matching client/server clusters.",icon:"🪟"},{id:"thermostat-occupancy",sourceDeviceTypes:[769],targetDeviceTypes:[263],title:"Adjust temperature based on occupancy",description:"Lower the temperature when room is unoccupied, restore when someone enters.",why:"This thermostat doesn't have a client cluster for Occupancy Sensing. A Home Assistant automation can bridge this gap.",icon:"🚶"},{id:"light-occupancy",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[263],title:"Turn on light when motion detected",description:"Automatically turn on lights when someone enters the room.",why:"This light is a server (receives commands), not a client. The occupancy sensor reports state but can't send on/off commands to it.",icon:"💡"},{id:"light-contact-door",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[21],title:"Turn on light when door opens",description:"Automatically turn on lights when a door is opened (e.g., closet light).",why:"This contact sensor reports open/close state but doesn't have client clusters to control lights directly.",icon:"🚪"},{id:"plug-occupancy",sourceDeviceTypes:[266,267],targetDeviceTypes:[263],title:"Control device based on occupancy",description:"Turn on/off a device when room occupancy changes.",why:"This plug is a server (receives commands). The occupancy sensor can't directly control it via Matter binding.",icon:"🔌"},{id:"button-light-toggle",sourceDeviceTypes:[256,257,258,268,269],targetDeviceTypes:[15],title:"Toggle light with button press",description:"Press the button to toggle light on/off. Long press for dimming, double-tap for scenes.",why:"Generic Switch emits button events (press/release/multi-press) rather than state changes. Home Assistant automations can respond to these events to control lights.",icon:"🔘"},{id:"button-plug-toggle",sourceDeviceTypes:[266,267],targetDeviceTypes:[15],title:"Toggle device with button press",description:"Use a physical button to control a smart plug or outlet.",why:"Generic Switch emits button events that need Home Assistant automation to translate into on/off commands for the plug.",icon:"🔘"},{id:"button-scene",sourceDeviceTypes:[256,257,258,266,267,268,269,769],targetDeviceTypes:[15],title:"Trigger scene with button",description:"Assign different scenes to single press, double press, and long press actions.",why:"Matter scenes via binding require specific cluster support. Home Assistant automations offer more flexibility for multi-press actions.",icon:"🎬"},{id:"button-thermostat-adjust",sourceDeviceTypes:[769],targetDeviceTypes:[15],title:"Adjust thermostat with buttons",description:"Use buttons to raise/lower temperature setpoint or switch heating/cooling modes.",why:"Generic Switch button events need Home Assistant automation to adjust thermostat settings. Perfect for climate sensors with built-in buttons.",icon:"🌡️"}],Xe=319486977,Ze=["sunday","monday","tuesday","wednesday","thursday","friday","saturday","away"],Qe=["monday","tuesday","wednesday","thursday","friday"],et=["saturday","sunday"];function tt(e){const t=e%60;return`${Math.floor(e/60).toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}const it="matter_binding_helper";async function ot(e,t,i){return e.callWS({type:`${it}/list_bindings`,node_id:t,endpoint_id:i})}async function rt(e,t,i,o,r,n,s,a=!0,d=!0){return e.callWS({type:`${it}/create_binding`,source_node_id:t,source_endpoint_id:i,cluster_id:o,verify:a,provision_acl:d,...void 0!==r&&{target_node_id:r},...void 0!==n&&{target_endpoint_id:n},...void 0!==s&&{target_group_id:s}})}async function nt(e,t,i,o,r,n,s=!0){return e.callWS({type:`${it}/delete_binding`,source_node_id:t,source_endpoint_id:i,verify:s,...void 0!==o&&{target_node_id:o},...void 0!==r&&{target_endpoint_id:r},...void 0!==n&&{target_group_id:n}})}async function st(e,t,i){return e.callWS({type:`${it}/verify_bindings`,node_id:t,endpoint_id:i})}async function at(e,t){return e.callWS({type:`${it}/list_acl`,node_id:t})}async function dt(e,t,i,o,r){return e.callWS({type:`${it}/provision_acl`,target_node_id:t,target_endpoint_id:i,source_node_id:o,...null!==r&&{cluster_id:r}})}async function lt(e,t,i){return e.callWS({type:`${it}/repair_group_bindings`,node_id:t,endpoint_id:i})}async function ct(e,t){return e.callWS({type:`${it}/create_automation`,template_id:t.template_id,source_node_id:t.source_node_id,source_endpoint_id:t.source_endpoint_id,target_node_id:t.target_node_id,target_endpoint_id:t.target_endpoint_id,...t.source_device_types&&{source_device_types:t.source_device_types},...t.target_device_types&&{target_device_types:t.target_device_types},...t.trigger_entity_id&&{trigger_entity_id:t.trigger_entity_id},...t.action_entity_id&&{action_entity_id:t.action_entity_id},...t.alias&&{alias:t.alias},preview_only:t.preview_only??!1})}const pt={sunday:"Sun",monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",away:"Away"};let gt=class extends se{constructor(){super(...arguments),this._loading=!1,this._saving=!1,this._error=null,this._success=null,this._notSupported=!1,this._schedule=null,this._selectedDays=new Set(Qe),this._transitions=[],this._hasChanges=!1}connectedCallback(){super.connectedCallback(),this._loadSchedule()}async _loadSchedule(){this._loading=!0,this._error=null,this._notSupported=!1;const e=(this.endpoint.cluster_commands||{})[513];if(void 0!==e&&!(e?.accepted||[]).includes(2))return this._notSupported=!0,void(this._loading=!1);try{const e=await async function(e,t,i,o,r=!0,n=!1){return e.callWS({type:`${it}/get_schedule`,node_id:t,endpoint_id:i,...o,heat:r,cool:n})}(this.hass,this.node.node_id,this.endpoint.endpoint_id);e.schedule&&(this._schedule=e.schedule,this._selectedDays=new Set(e.schedule.day_names),this._transitions=[...e.schedule.transitions],this._hasChanges=!1)}catch(e){console.error("Failed to load schedule - full error:",JSON.stringify(e,null,2)),console.error("Failed to load schedule - raw:",e);const t=e;if("schedule_not_supported"===t?.code)return void(this._notSupported=!0);let i;if(e instanceof Error)i=e.message;else if("object"==typeof e&&null!==e){const t=e;i=t.message||t.error||t.code||JSON.stringify(e)}else i=String(e);this._error=`Failed to load schedule: ${i}`}finally{this._loading=!1}}async _saveSchedule(){if(0!==this._selectedDays.size)if(0!==this._transitions.length){this._saving=!0,this._error=null,this._success=null;try{const e=[...this._transitions].sort((e,t)=>e.transition_time-t.transition_time);(await async function(e,t,i,o,r,n=!0,s=!1){return e.callWS({type:`${it}/set_schedule`,node_id:t,endpoint_id:i,days:o,transitions:r,heat:n,cool:s})}(this.hass,this.node.node_id,this.endpoint.endpoint_id,Array.from(this._selectedDays),e,!0,!1)).success?(this._success="Schedule saved to device",this._hasChanges=!1,setTimeout(()=>this._loadSchedule(),1e3)):this._error="Failed to save schedule"}catch(e){console.error("Failed to save schedule:",e);const t=e instanceof Error?e.message:e?.message||String(e);this._error=`Failed to save schedule: ${t}`}finally{this._saving=!1}}else this._error="Please add at least one time slot";else this._error="Please select at least one day"}async _clearSchedule(){if(confirm("Are you sure you want to clear all schedules from this device?")){this._saving=!0,this._error=null,this._success=null;try{(await async function(e,t,i){return e.callWS({type:`${it}/clear_schedule`,node_id:t,endpoint_id:i})}(this.hass,this.node.node_id,this.endpoint.endpoint_id)).success?(this._success="Schedule cleared",this._schedule=null,this._transitions=[],this._hasChanges=!1):this._error="Failed to clear schedule"}catch(e){console.error("Failed to clear schedule:",e);const t=e instanceof Error?e.message:e?.message||String(e);this._error=`Failed to clear schedule: ${t}`}finally{this._saving=!1}}}_toggleDay(e){const t=new Set(this._selectedDays);t.has(e)?t.delete(e):t.add(e),this._selectedDays=t,this._hasChanges=!0}_selectPreset(e){switch(e){case"weekdays":this._selectedDays=new Set(Qe);break;case"weekend":this._selectedDays=new Set(et);break;case"all":this._selectedDays=new Set(Ze.filter(e=>"away"!==e))}this._hasChanges=!0}_addTransition(){let e=360;if(this._transitions.length>0){const t=Math.max(...this._transitions.map(e=>e.transition_time));e=Math.min(t+60,1380)}this._transitions=[...this._transitions,{transition_time:e,heat_setpoint:20,cool_setpoint:null}],this._hasChanges=!0}_updateTransitionTime(e,t){const i=function(e){const[t,i]=e.split(":").map(Number);return 60*t+i}(t);this._transitions=this._transitions.map((t,o)=>o===e?{...t,transition_time:i}:t),this._hasChanges=!0}_updateTransitionTemp(e,t){const i=parseFloat(t);isNaN(i)||(this._transitions=this._transitions.map((t,o)=>o===e?{...t,heat_setpoint:i}:t),this._hasChanges=!0)}_deleteTransition(e){this._transitions=this._transitions.filter((t,i)=>i!==e),this._hasChanges=!0}_getTimelineSegments(){if(0===this._transitions.length)return[];const e=[...this._transitions].sort((e,t)=>e.transition_time-t.transition_time),t=[],i=e=>`hsl(${240*(1-Math.max(0,Math.min(1,(e-15)/10)))}, 70%, 50%)`;for(let o=0;o<e.length;o++){const r=e[o],n=e[o+1],s=r.heat_setpoint??20;t.push({start:r.transition_time,end:n?n.transition_time:1440,temp:s,color:i(s)})}if(e.length>0&&e[0].transition_time>0){const o=e[e.length-1].heat_setpoint??20;t.unshift({start:0,end:e[0].transition_time,temp:o,color:i(o)})}return t}render(){return this._notSupported?j`
        <div class="not-supported-card">
          <div class="header">
            <ha-icon icon="mdi:calendar-remove"></ha-icon>
            <span class="title">Weekly Schedule Not Supported</span>
          </div>
          <div class="description">
            This thermostat does not support the standard Matter weekly schedule commands.
            The manufacturer may use a proprietary scheduling method or the device may not
            support programmable schedules through Matter.
          </div>
        </div>
      `:j`
      <div class="schedule-editor">
        <div class="header">
          <div class="title">
            <ha-icon icon="mdi:calendar-clock"></ha-icon>
            Weekly Schedule
            ${this._hasChanges?j`<span class="changes-indicator">Unsaved</span>`:U}
          </div>
          <div class="actions">
            <button
              class="btn btn-secondary"
              @click=${this._loadSchedule}
              ?disabled=${this._loading||this._saving}
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
              Reload
            </button>
            <button
              class="btn btn-danger"
              @click=${this._clearSchedule}
              ?disabled=${this._loading||this._saving}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
              Clear
            </button>
            <button
              class="btn btn-primary"
              @click=${this._saveSchedule}
              ?disabled=${this._loading||this._saving||!this._hasChanges}
            >
              <ha-icon icon="mdi:content-save"></ha-icon>
              ${this._saving?"Saving...":"Save"}
            </button>
          </div>
        </div>

        ${this._error?j`
          <div class="message error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            ${this._error}
          </div>
        `:U}

        ${this._success?j`
          <div class="message success">
            <ha-icon icon="mdi:check-circle"></ha-icon>
            ${this._success}
          </div>
        `:U}

        ${this._loading?j`
          <div class="loading">
            <div class="spinner"></div>
            Loading schedule from device...
          </div>
        `:j`
          <!-- Day Selection -->
          <div class="section">
            <div class="section-title">Apply to days</div>
            <div class="day-selector">
              ${Ze.filter(e=>"away"!==e).map(e=>j`
                <div
                  class="day-chip ${this._selectedDays.has(e)?"selected":""}"
                  @click=${()=>this._toggleDay(e)}
                >
                  ${pt[e]}
                </div>
              `)}
            </div>
            <div class="day-presets">
              <button class="preset-btn" @click=${()=>this._selectPreset("weekdays")}>
                Weekdays
              </button>
              <button class="preset-btn" @click=${()=>this._selectPreset("weekend")}>
                Weekend
              </button>
              <button class="preset-btn" @click=${()=>this._selectPreset("all")}>
                Every day
              </button>
            </div>
          </div>

          <!-- Time Slots -->
          <div class="section">
            <div class="section-title">Time slots (max 10)</div>
            <div class="transitions-list">
              ${0===this._transitions.length?j`
                <div class="empty-state">
                  <ha-icon icon="mdi:clock-outline"></ha-icon>
                  <p>No time slots configured.<br>Add a time slot to set temperatures throughout the day.</p>
                </div>
              `:this._transitions.map((e,t)=>({...e,index:t})).sort((e,t)=>e.transition_time-t.transition_time).map(e=>j`
                  <div class="transition-row">
                    <div class="transition-time">
                      <label>Time</label>
                      <input
                        type="time"
                        .value=${tt(e.transition_time)}
                        @change=${t=>this._updateTransitionTime(e.index,t.target.value)}
                      />
                    </div>
                    <div class="transition-temp">
                      <label>Heat setpoint</label>
                      <div class="temp-input-group">
                        <input
                          type="number"
                          min="5"
                          max="35"
                          step="0.5"
                          .value=${e.heat_setpoint?.toString()??"20"}
                          @change=${t=>this._updateTransitionTemp(e.index,t.target.value)}
                        />
                        <span class="temp-unit">°C</span>
                      </div>
                    </div>
                    <button
                      class="transition-delete"
                      @click=${()=>this._deleteTransition(e.index)}
                      title="Remove time slot"
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </div>
                `)}

              ${this._transitions.length<10?j`
                <div class="add-transition" @click=${this._addTransition}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  Add time slot
                </div>
              `:U}
            </div>
          </div>

          <!-- Timeline Visualization -->
          ${this._transitions.length>0?j`
            <div class="section">
              <div class="section-title">Preview</div>
              <div class="timeline">
                <div class="timeline-labels">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                  <span>12 AM</span>
                </div>
                <div class="timeline-bar">
                  ${this._getTimelineSegments().map(e=>{const t=e.start/1440*100,i=(e.end-e.start)/1440*100;return j`
                      <div
                        class="timeline-segment"
                        style="left: ${t}%; width: ${i}%; background: ${e.color};"
                        title="${tt(e.start)} - ${tt(e.end)}: ${e.temp}°C"
                      >
                        ${i>8?`${e.temp}°`:""}
                      </div>
                    `})}
                </div>
              </div>
            </div>
          `:U}
        `}
      </div>
    `}};function ut(e){const t=e.endpoints.filter(e=>0!==e.endpoint_id&&e.server_clusters&&e.server_clusters.length>0);return t.length>0?t[0]:null}gt.styles=s`
    :host {
      display: block;
    }

    .schedule-editor {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 20px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .title {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title ha-icon {
      color: var(--primary-color);
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--divider-color);
    }

    .btn-danger {
      background: var(--error-color);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon {
      padding: 8px;
      min-width: 36px;
      justify-content: center;
    }

    /* Day Selection */
    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .day-selector {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .day-chip {
      padding: 8px 16px;
      border-radius: 20px;
      border: 2px solid var(--divider-color);
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }

    .day-chip:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .day-chip.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }

    .day-presets {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .preset-btn {
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: none;
      cursor: pointer;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .preset-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    /* Transitions */
    .transitions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transition-row {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .transition-time {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transition-time label {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .transition-time input {
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: monospace;
    }

    .transition-temp {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transition-temp label {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .temp-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .temp-input-group input {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      text-align: center;
    }

    .temp-unit {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .transition-delete {
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      border-radius: 50%;
      transition: all 0.2s;
    }

    .transition-delete:hover {
      background: var(--error-color);
      color: white;
    }

    .add-transition {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 14px;
      transition: all 0.2s;
    }

    .add-transition:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    /* Timeline visualization */
    .timeline {
      position: relative;
      height: 60px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      margin-top: 16px;
      overflow: hidden;
    }

    .timeline-labels {
      display: flex;
      justify-content: space-between;
      padding: 4px 8px;
      font-size: 10px;
      color: var(--secondary-text-color);
    }

    .timeline-bar {
      position: absolute;
      top: 20px;
      left: 8px;
      right: 8px;
      height: 24px;
      background: var(--divider-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .timeline-segment {
      position: absolute;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 4px;
    }

    .timeline-markers {
      position: absolute;
      bottom: 4px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
    }

    .timeline-marker {
      font-size: 9px;
      color: var(--secondary-text-color);
    }

    /* Messages */
    .message {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message.error {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error-color);
    }

    .message.success {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success-color);
    }

    .message.info {
      background: rgba(33, 150, 243, 0.1);
      color: var(--info-color);
    }

    /* Not Supported Card */
    .not-supported-card {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .not-supported-card .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .not-supported-card .header ha-icon {
      color: var(--warning-color);
      font-size: 24px;
    }

    .not-supported-card .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .not-supported-card .description {
      color: var(--secondary-text-color);
      font-size: 14px;
      line-height: 1.5;
    }

    /* Loading */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
    }

    .empty-state ha-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    /* Changes indicator */
    .changes-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--warning-color);
      color: white;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
  `,e([pe({attribute:!1})],gt.prototype,"hass",void 0),e([pe({attribute:!1})],gt.prototype,"node",void 0),e([pe({attribute:!1})],gt.prototype,"endpoint",void 0),e([ge()],gt.prototype,"_loading",void 0),e([ge()],gt.prototype,"_saving",void 0),e([ge()],gt.prototype,"_error",void 0),e([ge()],gt.prototype,"_success",void 0),e([ge()],gt.prototype,"_notSupported",void 0),e([ge()],gt.prototype,"_schedule",void 0),e([ge()],gt.prototype,"_selectedDays",void 0),e([ge()],gt.prototype,"_transitions",void 0),e([ge()],gt.prototype,"_hasChanges",void 0),gt=e([de("thermostat-schedule-editor")],gt);const ht=257,vt={[ze]:3,[Ae]:3,[Re]:3,[Me]:3,[Ee]:3,[ht]:3};function mt(e){return vt[e]??3}const _t=[{value:1,label:"View",description:"Read-only access to device state"},{value:3,label:"Operate",description:"Control the device (on/off, level, etc.)"},{value:4,label:"Manage",description:"Configure device settings"}],bt=s`
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-secondary {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--divider-color);
  }

  .btn-danger {
    background: var(--error-color, #f44336);
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-warning {
    background: var(--warning-color, #ff9800);
    color: white;
  }

  .btn-warning:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-icon {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon.delete {
    color: var(--error-color, #f44336);
  }

  .btn-icon.delete:hover:not(:disabled) {
    background: rgba(244, 67, 54, 0.1);
  }

  .btn-icon.verify {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success-color, #4caf50);
    border: 1px solid var(--success-color, #4caf50);
  }

  .btn-icon.verify:hover:not(:disabled) {
    background: var(--success-color, #4caf50);
    color: white;
  }

  .btn-icon.repair {
    background: rgba(255, 152, 0, 0.1);
    color: var(--warning-color, #ff9800);
    border: 1px solid var(--warning-color, #ff9800);
  }

  .btn-icon.repair:hover:not(:disabled) {
    background: var(--warning-color, #ff9800);
    color: white;
  }
`,ft=s`
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: var(--secondary-text-color);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--divider-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-spinner.small {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    background: rgba(244, 67, 54, 0.1);
    color: var(--error-color, #f44336);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .warning {
    background: rgba(255, 152, 0, 0.1);
    color: var(--warning-color, #ff9800);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .success {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success-color, #4caf50);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .empty-state {
    text-align: center;
    padding: 48px;
    color: var(--secondary-text-color);
  }

  .empty-state-small {
    font-size: 13px;
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }
`,yt=s`
  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--secondary-text-color);
  }

  .form-select {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
    font-family: inherit;
  }

  .form-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .form-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`,xt=s`
  .badge {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
  }

  .badge-primary {
    background: var(--primary-color);
    color: white;
  }

  .badge-success {
    background: var(--success-color, #4caf50);
    color: white;
  }

  .badge-warning {
    background: var(--warning-color, #ff9800);
    color: white;
  }

  .badge-error {
    background: var(--error-color, #f44336);
    color: white;
  }

  .badge-secondary {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .count-badge {
    background: var(--primary-color);
    color: white;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: normal;
  }

  .cluster-badge {
    background: var(--primary-color);
    color: white;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 8px;
    font-weight: 500;
    cursor: help;
    white-space: nowrap;
  }

  .cluster-badge:hover {
    filter: brightness(1.15);
  }

  .device-type-badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
`,$t=[bt,ft,yt,xt,s`
  .flex {
    display: flex;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .justify-end {
    justify-content: flex-end;
  }

  .gap-4 {
    gap: 4px;
  }

  .gap-8 {
    gap: 8px;
  }

  .gap-12 {
    gap: 12px;
  }

  .gap-16 {
    gap: 16px;
  }

  .gap-24 {
    gap: 24px;
  }
`,s`
  .link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 13px;
    transition: opacity 0.2s;
  }

  .link:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .link-subtle {
    color: var(--secondary-text-color);
    text-decoration: none;
    font-size: 12px;
    transition: color 0.2s;
  }

  .link-subtle:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }
`],wt=s`
  .card {
    background: var(--card-background-color);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0, 0, 0, 0.1));
  }

  .card-header {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    color: var(--primary-text-color);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 12px;
  }

  .section-header .btn {
    margin-left: auto;
  }

  .section-context {
    font-size: 12px;
    font-weight: normal;
    color: var(--secondary-text-color);
    background: var(--card-background-color);
    padding: 2px 8px;
    border-radius: 4px;
  }
`,kt=s`
  .binding-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .binding-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }

  .binding-card.binding-missing-acl {
    border-left: 3px solid var(--warning-color, #ff9800);
    background: rgba(255, 152, 0, 0.05);
    flex-wrap: wrap;
  }

  .binding-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .binding-arrow {
    color: var(--primary-color);
    font-size: 20px;
  }

  .binding-source,
  .binding-target {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .binding-source-name,
  .binding-target-name {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .binding-source-endpoint,
  .binding-target-endpoint {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .binding-cluster {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .binding-actions {
    display: flex;
    gap: 4px;
  }

  /* ACL warning styles */
  .acl-warning {
    cursor: help;
    font-size: 14px;
    margin-right: 4px;
  }

  .acl-warning-text {
    color: var(--warning-color, #ff9800);
    font-size: 11px;
  }

  .acl-warning-banner {
    background: rgba(255, 152, 0, 0.12);
    color: var(--warning-color, #ff9800);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 8px;
    width: 100%;
  }
`,Ct=s`
  .acl-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .acl-entry {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 6px;
    font-size: 13px;
  }

  .acl-privilege {
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    text-transform: uppercase;
  }

  .acl-privilege.view {
    background: rgba(158, 158, 158, 0.2);
    color: var(--secondary-text-color);
  }

  .acl-privilege.operate {
    background: rgba(76, 175, 80, 0.2);
    color: var(--success-color, #4caf50);
  }

  .acl-privilege.manage {
    background: rgba(33, 150, 243, 0.2);
    color: #2196f3;
  }

  .acl-privilege.administer {
    background: rgba(156, 39, 176, 0.2);
    color: #9c27b0;
  }

  .acl-subjects {
    color: var(--primary-text-color);
  }

  .acl-targets {
    color: var(--secondary-text-color);
    font-size: 12px;
  }

  .acl-auth-mode {
    margin-left: auto;
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.7;
  }
`,St=s`
  .overview-card {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .overview-card .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 0;
  }

  .overview-card .card-content {
    padding: 16px;
  }

  .overview-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .overview-row:hover {
    background: var(--secondary-background-color);
  }

  .overview-row + .overview-row {
    border-top: 1px solid var(--divider-color);
  }

  .binding-sentence {
    font-size: 14px;
    color: var(--primary-text-color);
  }

  .binding-sentence strong {
    color: var(--primary-color);
  }

  .cluster-badges {
    display: inline-flex;
    gap: 6px;
    margin-left: 8px;
    vertical-align: middle;
  }
`,Et=[wt,kt,Ct,St];let zt=class extends se{constructor(){super(...arguments),this.nodes=[],this.selectedNodeId=null,this.loading=!1,this.title="Matter Devices",this.showEndpointCount=!1}render(){return j`
      <div class="card">
        <div class="card-header">${this.title}</div>
        ${this._renderContent()}
      </div>
    `}_renderContent(){return this.loading&&0===this.nodes.length?j`<div class="loading">Loading...</div>`:0===this.nodes.length?j`<div class="empty-state">No Matter devices found.</div>`:j`
      <ul class="node-list">
        ${this.nodes.map(e=>this._renderNodeItem(e))}
      </ul>
    `}_renderNodeItem(e){const t=this.selectedNodeId===e.node_id,i=this._getPrimaryDeviceType(e),o=this._hasBindingCluster(e),r=e.endpoints.filter(e=>e.endpoint_id>0);return j`
      <li>
        <div
          class="node-item ${t?"selected":""}"
          @click=${()=>this._handleNodeClick(e)}
        >
          <span
            class="node-status ${e.available?"":"unavailable"}"
          ></span>
          <div class="node-info">
            <span class="node-name">
              ${e.name}
              <span class="node-id">#${e.node_id}</span>
            </span>
            <div class="node-meta">
              ${i?j`<span class="node-device-type">${i}</span>`:U}
              ${i&&e.area_name?j`<span class="node-meta-sep">·</span>`:U}
              ${e.area_name?j`<span class="node-area">${e.area_name}</span>`:U}
              ${this.showEndpointCount&&r.length>1?j`
                    ${e.area_name||i?j`<span class="node-meta-sep">·</span>`:U}
                    <span class="node-endpoints"
                      >${r.length} endpoints</span
                    >
                  `:U}
              ${o?j`<span class="binding-badge">Binding</span>`:U}
            </div>
          </div>
        </div>
      </li>
    `}_getPrimaryDeviceType(e){const t=e.endpoints.find(e=>1===e.endpoint_id)||e.endpoints.find(e=>e.endpoint_id>0);return t&&t.device_types.length>0?Je(t.device_types[0].id):null}_hasBindingCluster(e){return e.endpoints.some(e=>e.has_binding_cluster)}_handleNodeClick(e){this.dispatchEvent(new CustomEvent("node-selected",{detail:{node:e},bubbles:!0,composed:!0}))}};zt.styles=[bt,ft,wt,s`
      :host {
        display: block;
      }

      .node-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .node-item {
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .node-item:hover {
        background: var(--secondary-background-color);
      }

      .node-item.selected {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .node-item.selected .node-name,
      .node-item.selected .node-device-type,
      .node-item.selected .node-area,
      .node-item.selected .node-endpoints,
      .node-item.selected .node-meta-sep,
      .node-item.selected .node-id {
        color: var(--text-primary-color);
        opacity: 1;
      }

      .node-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success-color, #4caf50);
        flex-shrink: 0;
      }

      .node-status.unavailable {
        background: var(--error-color, #f44336);
      }

      .node-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        gap: 2px;
      }

      .node-name {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .node-id {
        font-size: 11px;
        color: var(--secondary-text-color);
        opacity: 0.7;
        font-weight: normal;
        margin-left: 6px;
      }

      .node-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        flex-wrap: wrap;
      }

      .node-meta-sep {
        color: var(--secondary-text-color);
        opacity: 0.5;
      }

      .node-device-type {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .node-area {
        color: var(--primary-color);
        opacity: 0.9;
      }

      .node-endpoints {
        color: var(--secondary-text-color);
        opacity: 0.7;
      }

      .node-endpoints.has-binding {
        color: var(--success-color, #4caf50);
        opacity: 1;
      }

      .binding-badge {
        font-size: 9px;
        padding: 1px 5px;
        background: var(--success-color, #4caf50);
        color: white;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
      }
    `],e([pe({attribute:!1})],zt.prototype,"nodes",void 0),e([pe({type:Number})],zt.prototype,"selectedNodeId",void 0),e([pe({type:Boolean})],zt.prototype,"loading",void 0),e([pe({type:String})],zt.prototype,"title",void 0),e([pe({type:Boolean})],zt.prototype,"showEndpointCount",void 0),zt=e([de("matter-node-list")],zt);let At=class extends se{constructor(){super(...arguments),this.aclMissing=!1,this.aclReason="",this.showRepairButton=!1,this.showVerifyButton=!1,this.repairInProgress=!1,this.verifyInProgress=!1,this.deleteInProgress=!1,this.disabled=!1,this.variant="default"}render(){if(!this.binding)return U;const{binding:e,sourceNode:t,sourceEndpoint:i,targetNode:o,targetEndpoint:r}=this.binding,n=null!==e.target_group_id,s=qe(e.cluster_id),a=Ke(e.cluster_id),d=["binding-card",this.variant,this.aclMissing?"binding-missing-acl":""].filter(Boolean).join(" ");return"readable"===this.variant?this._renderReadableVariant(d,e,t,i,o,n,a):this._renderDefaultVariant(d,e,o,n,s)}_renderDefaultVariant(e,t,i,o,r){const n=i?.ha_device_id,s=o?`Group ${t.target_group_id}`:i?.name||`Node ${t.target_node_id}`;return j`
      <div class=${e}>
        ${this.aclMissing&&this.aclReason?j`<div class="acl-warning-banner">⚠️ ${this.aclReason}</div>`:U}
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${o?s:j`<span
                      class="${n?"device-link":""}"
                      @click=${n?e=>this._handleDeviceClick(e,n):U}
                      >${i?.name||`Node ${t.target_node_id}`}</span
                    >
                    - Endpoint ${t.target_endpoint_id}`}
            </span>
            <span class="binding-cluster">${r}</span>
          </div>
        </div>
        ${this._renderActions()}
      </div>
    `}_renderReadableVariant(e,t,i,o,r,n,s){const a=i.ha_device_id,d=r?.ha_device_id,l=n?`Group ${t.target_group_id}`:r?.name||`Node ${t.target_node_id}`;return j`
      <div class=${e}>
        ${this.aclMissing&&this.aclReason?j`<div class="acl-warning-banner">⚠️ ${this.aclReason}</div>`:U}
        <div class="binding-description">
          <div class="binding-sentence">
            ${this.aclMissing?j`<span class="acl-warning" title="${this.aclReason}">⚠️</span>`:U}
            <strong
              class="${a?"device-link":""}"
              @click=${a?e=>this._handleDeviceClick(e,a):U}
              >${i.name}</strong
            >
            <span class="binding-action">${s.action}</span>
            <strong
              class="${!n&&d?"device-link":""}"
              @click=${!n&&d?e=>this._handleDeviceClick(e,d):U}
              >${l}</strong
            >
          </div>
          <div class="binding-meta">
            #${i.node_id} EP ${o.endpoint_id} →
            ${n?"Group":`#${t.target_node_id} EP ${t.target_endpoint_id}`}
            ${i.area_name?j` · ${i.area_name}`:U}
            ${this.aclMissing&&this.aclReason?j`<span class="acl-warning-text"> · ${this.aclReason}</span>`:U}
          </div>
        </div>
        ${this._renderActions()}
      </div>
    `}_renderActions(){const e=this.disabled;return j`
      <div class="binding-actions">
        ${this.aclMissing&&this.showRepairButton?j`
              <button
                class="btn-icon repair ${this.repairInProgress?"btn-loading":""}"
                title="Repair ACL permissions"
                ?disabled=${e||this.repairInProgress}
                @click=${this._handleRepairClick}
              >
                ${this.repairInProgress?"⏳":"🔧"}
              </button>
            `:U}
        ${this.showVerifyButton?j`
              <button
                class="btn-icon verify"
                title="Verify binding on device"
                ?disabled=${e||this.verifyInProgress}
                @click=${this._handleVerifyClick}
              >
                ✓
              </button>
            `:U}
        <button
          class="btn-icon delete ${this.deleteInProgress?"btn-loading":""}"
          title="Delete binding"
          ?disabled=${e||this.deleteInProgress}
          @click=${this._handleDeleteClick}
        >
          ✕
        </button>
      </div>
    `}_handleDeleteClick(){this.dispatchEvent(new CustomEvent("delete-binding",{detail:{binding:this.binding},bubbles:!0,composed:!0}))}_handleVerifyClick(){this.dispatchEvent(new CustomEvent("verify-binding",{detail:{binding:this.binding},bubbles:!0,composed:!0}))}_handleRepairClick(){this.dispatchEvent(new CustomEvent("repair-acl",{detail:{binding:this.binding},bubbles:!0,composed:!0}))}_handleDeviceClick(e,t){t&&(e.stopPropagation(),this.dispatchEvent(new CustomEvent("navigate-device",{detail:{deviceId:t},bubbles:!0,composed:!0})))}};At.styles=[bt,ft,kt,s`
      :host {
        display: block;
      }

      .binding-card.compact {
        padding: 12px;
      }

      .binding-card.compact .binding-info {
        gap: 12px;
      }

      .binding-card.readable {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .binding-card.readable .binding-description {
        flex: 1;
      }

      .binding-card.readable .binding-sentence {
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .binding-card.readable .binding-sentence strong {
        color: var(--primary-color);
      }

      .binding-card.readable .binding-action {
        color: var(--secondary-text-color);
      }

      .binding-card.readable .binding-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .binding-card.readable .binding-actions {
        align-self: flex-end;
      }

      .device-link {
        cursor: pointer;
        text-decoration: underline;
        text-decoration-style: dotted;
        text-underline-offset: 2px;
      }

      .device-link:hover {
        color: var(--primary-color);
        text-decoration-style: solid;
      }

      .btn-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      .btn-loading {
        opacity: 0.5;
      }
    `],e([pe({attribute:!1})],At.prototype,"binding",void 0),e([pe({type:Boolean})],At.prototype,"aclMissing",void 0),e([pe({type:String})],At.prototype,"aclReason",void 0),e([pe({type:Boolean})],At.prototype,"showRepairButton",void 0),e([pe({type:Boolean})],At.prototype,"showVerifyButton",void 0),e([pe({type:Boolean})],At.prototype,"repairInProgress",void 0),e([pe({type:Boolean})],At.prototype,"verifyInProgress",void 0),e([pe({type:Boolean})],At.prototype,"deleteInProgress",void 0),e([pe({type:Boolean})],At.prototype,"disabled",void 0),e([pe({type:String})],At.prototype,"variant",void 0),At=e([de("matter-binding-card")],At);let It=class extends se{constructor(){super(...arguments),this.entries=null,this.nodes=[],this.loading=!1}render(){return j`
      <div class="device-section">
        <div class="section-header">
          <span>Access Control (ACL)</span>
          <button
            class="btn btn-small"
            ?disabled=${this.loading}
            @click=${this._handleLoadClick}
          >
            ${this.loading?"Loading...":"Load from Device"}
          </button>
        </div>
        ${this._renderContent()}
      </div>
    `}_renderContent(){return null===this.entries?j`
        <div class="empty-state-small">
          Click "Load from Device" to read ACL entries.
        </div>
      `:0===this.entries.length?j`
        <div class="empty-state-small">No ACL entries found on device.</div>
      `:j`
      <div class="acl-list">
        ${this.entries.map((e,t)=>this._renderEntry(e,t))}
      </div>
    `}_renderEntry(e,t){const i=e.subjects.map(e=>{const t=this.nodes.find(t=>t.node_id===e);return t?`${t.name} (${e})`:`Node ${e}`}),o=e.targets&&e.targets.length>0?e.targets.map(e=>{const t=[];if(null!==e.cluster){const i=Ue[e.cluster]||`0x${e.cluster.toString(16).padStart(4,"0")}`;t.push(i)}return null!==e.endpoint&&t.push(`EP ${e.endpoint}`),null!==e.device_type&&t.push(`DT ${e.device_type}`),t.join(", ")}):["All resources"],r=["acl-entry",5===e.privilege?"acl-admin":"",3===e.privilege?"acl-operate":""].filter(Boolean).join(" ");return j`
      <div class=${r}>
        <div class="acl-entry-header">
          <span class="acl-index">#${t+1}</span>
          <span class="acl-privilege ${e.privilege_name.toLowerCase()}"
            >${e.privilege_name}</span
          >
          <span class="acl-auth-mode">(${e.auth_mode_name})</span>
        </div>
        <div class="acl-entry-details">
          <div class="acl-row">
            <span class="acl-label">Subjects:</span>
            <span class="acl-value">
              ${i.length>0?i.join(", "):"All (any authenticated)"}
            </span>
          </div>
          <div class="acl-row">
            <span class="acl-label">Targets:</span>
            <span class="acl-value">${o.join("; ")}</span>
          </div>
        </div>
      </div>
    `}_handleLoadClick(){this.dispatchEvent(new CustomEvent("load-acl",{detail:{nodeId:this.node.node_id},bubbles:!0,composed:!0}))}};It.styles=[bt,ft,wt,Ct,s`
      :host {
        display: block;
      }

      .device-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
      }

      .btn-small {
        padding: 4px 12px;
        font-size: 12px;
      }

      .acl-entry {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 6px;
        margin-bottom: 8px;
      }

      .acl-entry:last-child {
        margin-bottom: 0;
      }

      .acl-entry.acl-admin {
        border-left: 3px solid #9c27b0;
      }

      .acl-entry.acl-operate {
        border-left: 3px solid var(--success-color, #4caf50);
      }

      .acl-entry-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .acl-index {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .acl-privilege {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .acl-privilege.view {
        background: rgba(158, 158, 158, 0.2);
        color: var(--secondary-text-color);
      }

      .acl-privilege.operate {
        background: rgba(76, 175, 80, 0.2);
        color: var(--success-color, #4caf50);
      }

      .acl-privilege.manage {
        background: rgba(33, 150, 243, 0.2);
        color: #2196f3;
      }

      .acl-privilege.administer {
        background: rgba(156, 39, 176, 0.2);
        color: #9c27b0;
      }

      .acl-auth-mode {
        font-size: 11px;
        color: var(--secondary-text-color);
        opacity: 0.7;
      }

      .acl-entry-details {
        font-size: 13px;
      }

      .acl-row {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
      }

      .acl-row:last-child {
        margin-bottom: 0;
      }

      .acl-label {
        color: var(--secondary-text-color);
        min-width: 60px;
      }

      .acl-value {
        color: var(--primary-text-color);
      }
    `],e([pe({attribute:!1})],It.prototype,"node",void 0),e([pe({attribute:!1})],It.prototype,"entries",void 0),e([pe({attribute:!1})],It.prototype,"nodes",void 0),e([pe({type:Boolean})],It.prototype,"loading",void 0),It=e([de("matter-acl-section")],It);const Pt=s`
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: var(--card-background-color);
    border-radius: 12px;
    padding: 24px;
    min-width: 400px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .dialog-header {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 24px;
    color: var(--primary-text-color);
  }

  .dialog-subheader {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 16px;
  }

  .dialog-content {
    margin-bottom: 24px;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .dialog-warning {
    background: var(--warning-color, #ff9800);
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .dialog-info {
    background: var(--secondary-background-color);
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--primary-text-color);
  }
`,Tt=s`
  .confirm-dialog {
    max-width: 480px;
  }

  .confirm-dialog .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .confirm-icon {
    font-size: 24px;
  }

  .confirm-icon.warning {
    color: var(--warning-color, #ff9800);
  }

  .confirm-icon.danger {
    color: var(--error-color, #f44336);
  }

  .confirm-icon.info {
    color: var(--primary-color);
  }

  .confirm-message {
    font-size: 14px;
    line-height: 1.5;
    color: var(--primary-text-color);
    margin-bottom: 16px;
  }

  .confirm-details {
    background: var(--secondary-background-color);
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .confirm-details dt {
    color: var(--secondary-text-color);
    font-size: 12px;
    margin-bottom: 4px;
  }

  .confirm-details dd {
    margin: 0 0 12px 0;
    color: var(--primary-text-color);
  }

  .confirm-details dd:last-child {
    margin-bottom: 0;
  }
`,Nt=s`
  .wizard-dialog {
    min-width: 500px;
    max-width: 600px;
  }

  .wizard-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    padding: 16px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .wizard-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 100px;
  }

  .wizard-step-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 14px;
    border: 2px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--secondary-text-color);
    transition: all 0.3s;
  }

  .wizard-step.active .wizard-step-indicator {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }

  .wizard-step.completed .wizard-step-indicator {
    border-color: var(--success-color, #4caf50);
    background: var(--success-color, #4caf50);
    color: white;
  }

  .wizard-step.error .wizard-step-indicator {
    border-color: var(--error-color, #f44336);
    background: var(--error-color, #f44336);
    color: white;
  }

  .wizard-step-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    text-align: center;
  }

  .wizard-step.active .wizard-step-label {
    color: var(--primary-color);
    font-weight: 500;
  }

  .wizard-step.completed .wizard-step-label {
    color: var(--success-color, #4caf50);
  }

  .wizard-connector {
    flex: 1;
    height: 2px;
    background: var(--divider-color);
    margin: 0 8px;
    max-width: 60px;
  }

  .wizard-connector.completed {
    background: var(--success-color, #4caf50);
  }

  .wizard-content {
    min-height: 200px;
    padding: 16px 0;
  }

  .wizard-step-content {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`,Dt=s`
  .privilege-selector {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .privilege-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .privilege-option:hover {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.05);
  }

  .privilege-option.selected {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.1);
  }

  .privilege-radio {
    margin-top: 2px;
  }

  .privilege-content {
    flex: 1;
  }

  .privilege-name {
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }

  .privilege-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }

  .privilege-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    margin-left: 8px;
  }

  .privilege-badge.recommended {
    background: var(--success-color, #4caf50);
    color: white;
  }
`,Rt=[Pt,Tt,s`
  .verification-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
    gap: 16px;
  }

  .verification-modal-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .verification-modal-result.verified {
    background: rgba(76, 175, 80, 0.15);
    border: 1px solid var(--success-color, #4caf50);
  }

  .verification-modal-result.warning {
    background: rgba(255, 152, 0, 0.15);
    border: 1px solid var(--warning-color, #ff9800);
  }

  .verification-modal-result.error {
    background: rgba(244, 67, 54, 0.15);
    border: 1px solid var(--error-color, #f44336);
  }

  .verification-status-icon {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .verification-modal-result.verified .verification-status-icon {
    color: var(--success-color, #4caf50);
  }

  .verification-modal-result.warning .verification-status-icon {
    color: var(--warning-color, #ff9800);
  }

  .verification-modal-result.error .verification-status-icon {
    color: var(--error-color, #f44336);
  }

  .verification-status-text {
    font-size: 18px;
    font-weight: 500;
  }

  .verification-details {
    padding: 16px;
  }

  .verification-message {
    font-size: 14px;
    margin: 0 0 16px 0;
    color: var(--primary-text-color);
  }

  .verification-binding-info {
    background: var(--secondary-background-color);
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .verification-help {
    background: rgba(255, 152, 0, 0.1);
    border-left: 3px solid var(--warning-color, #ff9800);
    padding: 12px 16px;
    border-radius: 0 6px 6px 0;
    font-size: 13px;
  }

  .verification-help ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
  }

  .verification-help li {
    margin-bottom: 4px;
  }
`,Nt,Dt,s`
  .operation-progress-dialog {
    min-width: 360px;
    text-align: center;
  }

  .operation-progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 16px;
  }

  .operation-progress-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--divider-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .operation-progress-message {
    font-size: 16px;
    color: var(--primary-text-color);
  }

  .operation-progress-detail {
    font-size: 13px;
    color: var(--secondary-text-color);
  }
`],Bt="custom",Mt=[{id:"lights",label:"Lights",description:"On/off, brightness and color control",clusters:[6,8,Re]},{id:"outlets",label:"Outlets & switches",description:"On/off control only",clusters:[6]},{id:"covers",label:"Window coverings",description:"Blinds, shades and shutters",clusters:[258]}];function Lt(e){return e.clusters??[]}function Gt(e){if(0===e.length)return"Any type";const t=Mt.find(t=>t.clusters.length===e.length&&t.clusters.every(t=>e.includes(t)));return t?t.label:e.map(e=>qe(e)).join(", ")}let Ot=class extends se{constructor(){super(...arguments),this.open=!1,this.sourceNode=null,this.sourceEndpoint=null,this.availableNodes=[],this.selectedTargetNodeId=null,this.selectedTargetEndpointId=null,this.loading=!1,this.availableGroups=[],this._selectedClusterId=null,this._targetType="device",this._selectedGroupId=null}render(){return this.open?j`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${this._handleDialogClick}>
          <form @submit=${this._handleSubmit}>
            ${this._renderHeader()}
            ${this._renderBody()}
            ${this._renderActions()}
          </form>
        </div>
      </div>
    `:U}_renderHeader(){const e=this.sourceNode?.name??"Unknown",t=this.sourceEndpoint?.endpoint_id??0;return j`
      <div class="dialog-header">
        <span>Create Binding</span>
        <span class="source-info">From: ${e} EP${t}</span>
      </div>
    `}_renderBody(){const e=0===(this.sourceEndpoint?.client_clusters??[]).length;return j`
      <div class="dialog-body">
        ${e?this._renderNoClientClustersWarning():U}
        ${this.availableGroups.length>0?this._renderTargetTypeToggle():U}
        ${"group"===this._targetType?this._renderGroupTarget():j`
              ${this._renderTargetNodeSelect()}
              ${this.selectedTargetNodeId?this._renderTargetEndpointSelect():U}
              ${this.selectedTargetNodeId&&this.selectedTargetEndpointId?this._renderClusterSelect():U}
            `}
      </div>
    `}_renderTargetTypeToggle(){return j`
      <div class="form-group">
        <label for="targetType">Target Type</label>
        <select
          id="targetType"
          name="targetType"
          @change=${this._handleTargetTypeChange}
          .value=${this._targetType}
        >
          <option value="device">Device (unicast)</option>
          <option value="group">Group (groupcast)</option>
        </select>
      </div>
    `}_groupClusterChoices(){const e=this.sourceEndpoint?.client_clusters??[],t=this.availableGroups.find(e=>e.group_id===this._selectedGroupId),i=t?Lt(t):[];if(0===i.length)return e;const o=e.filter(e=>i.includes(e));return o.length>0?o:i}_renderGroupTarget(){const e=this._groupClusterChoices(),t=this.availableGroups.find(e=>e.group_id===this._selectedGroupId);if(null===this._selectedClusterId&&e.length>0){const o=t?(i=Lt(t)).length>0?i[0]:null:null;this._selectedClusterId=null!==o&&e.includes(o)?o:e[0]}var i;return j`
      <div class="form-group">
        <label for="targetGroup">Target Group</label>
        <select
          id="targetGroup"
          name="targetGroup"
          required
          @change=${this._handleTargetGroupChange}
          .value=${this._selectedGroupId?.toString()??""}
        >
          <option value="" disabled selected>Select a group...</option>
          ${this.availableGroups.map(e=>j`
              <option value=${e.group_id}>
                ${e.name} (ID ${e.group_id})
              </option>
            `)}
        </select>
      </div>
      ${e.length>0?j`
            <div class="form-group">
              <label for="groupCluster">Cluster</label>
              <select
                id="groupCluster"
                name="groupCluster"
                required
                @change=${this._handleClusterChange}
                .value=${this._selectedClusterId?.toString()??""}
              >
                ${e.map(e=>j`
                    <option
                      value=${e}
                      ?selected=${e===this._selectedClusterId}
                    >
                      ${qe(e)}
                    </option>
                  `)}
              </select>
              <div class="cluster-info">
                The source will multicast this cluster's commands to the group.
              </div>
            </div>
          `:U}
    `}_renderNoClientClustersWarning(){return j`
      <div class="warning-message">
        This endpoint has no client clusters and can't control other devices.
      </div>
    `}_renderTargetNodeSelect(){return j`
      <div class="form-group">
        <label for="targetNode">Target Device</label>
        <select
          id="targetNode"
          name="targetNode"
          required
          @change=${this._handleTargetNodeChange}
          .value=${this.selectedTargetNodeId?.toString()??""}
        >
          <option value="">Select a device...</option>
          ${this.availableNodes.map(e=>j`
              <option value=${e.node_id}>
                ${e.name}${e.area_name?` (${e.area_name})`:""}
              </option>
            `)}
        </select>
      </div>
    `}_renderTargetEndpointSelect(){const e=this._getSelectedTargetNode();if(!e)return U;const t=e.endpoints.filter(e=>e.endpoint_id>0);return j`
      <div class="form-group">
        <label for="targetEndpoint">Target Endpoint</label>
        <select
          id="targetEndpoint"
          name="targetEndpoint"
          required
          @change=${this._handleTargetEndpointChange}
          .value=${this.selectedTargetEndpointId?.toString()??""}
        >
          <option value="">Select an endpoint...</option>
          ${t.map(e=>j`
              <option value=${e.endpoint_id}>
                Endpoint ${e.endpoint_id}${this._getEndpointLabel(e)}
              </option>
            `)}
        </select>
      </div>
    `}_renderClusterSelect(){const e=this._getCompatibleClusters();return 0===e.length?j`
        <div class="warning-message">
          No compatible clusters found between source and target endpoints.
        </div>
      `:(null===this._selectedClusterId&&e.length>0&&(this._selectedClusterId=e[0]),j`
      <div class="form-group">
        <label for="cluster">Cluster</label>
        <select
          id="cluster"
          name="cluster"
          required
          @change=${this._handleClusterChange}
          .value=${this._selectedClusterId?.toString()??""}
        >
          ${e.map(e=>j`
              <option value=${e}>${qe(e)}</option>
            `)}
        </select>
        <div class="cluster-info">
          The binding will allow the source to control this cluster on the target.
        </div>
      </div>
    `)}_renderActions(){const e="group"===this._targetType?null!==this._selectedGroupId&&(this.sourceEndpoint?.client_clusters??[]).length>0&&!this.loading:null!==this.selectedTargetNodeId&&null!==this.selectedTargetEndpointId&&this._getCompatibleClusters().length>0&&!this.loading;return j`
      <div class="dialog-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click=${this._handleCancel}
          ?disabled=${this.loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary ${this.loading?"btn-loading":""}"
          ?disabled=${!e}
        >
          Create Binding
        </button>
      </div>
    `}_getSelectedTargetNode(){return this.selectedTargetNodeId?this.availableNodes.find(e=>e.node_id===this.selectedTargetNodeId)??null:null}_getSelectedTargetEndpoint(){const e=this._getSelectedTargetNode();return e&&this.selectedTargetEndpointId?e.endpoints.find(e=>e.endpoint_id===this.selectedTargetEndpointId)??null:null}_getEndpointLabel(e){return e.device_types&&e.device_types.length>0?` - Device Type ${e.device_types[0].id}`:""}_getCompatibleClusters(){const e=this.sourceEndpoint?.client_clusters??[],t=this._getSelectedTargetEndpoint(),i=t?.server_clusters??[];return e.filter(e=>i.includes(e))}_handleOverlayClick(){this._handleCancel()}_handleDialogClick(e){e.stopPropagation()}_handleTargetNodeChange(e){const t=e.target,i=parseInt(t.value,10);isNaN(i)||(this._selectedClusterId=null,this.dispatchEvent(new CustomEvent("target-node-change",{detail:{nodeId:i},bubbles:!0,composed:!0})))}_handleTargetEndpointChange(e){const t=e.target,i=parseInt(t.value,10);isNaN(i)||(this._selectedClusterId=null,this.dispatchEvent(new CustomEvent("target-endpoint-change",{detail:{endpointId:i},bubbles:!0,composed:!0})))}_handleClusterChange(e){const t=e.target,i=parseInt(t.value,10);isNaN(i)||(this._selectedClusterId=i)}_handleSubmit(e){if(e.preventDefault(),"group"===this._targetType){const e=this._selectedClusterId??this._groupClusterChoices()[0];return void(null!==this._selectedGroupId&&void 0!==e&&this.dispatchEvent(new CustomEvent("create-binding",{detail:{targetGroupId:this._selectedGroupId,clusterId:e},bubbles:!0,composed:!0})))}const t=this._getCompatibleClusters(),i=this._selectedClusterId??t[0];null!==this.selectedTargetNodeId&&null!==this.selectedTargetEndpointId&&void 0!==i&&this.dispatchEvent(new CustomEvent("create-binding",{detail:{targetNodeId:this.selectedTargetNodeId,targetEndpointId:this.selectedTargetEndpointId,clusterId:i},bubbles:!0,composed:!0}))}_handleTargetTypeChange(e){this._targetType=e.target.value,this._selectedClusterId=null}_handleTargetGroupChange(e){const t=parseInt(e.target.value,10);isNaN(t)||(this._selectedGroupId=t,this._selectedClusterId=null)}_handleCancel(){this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}};Ot.styles=[bt,ft,yt,Pt,s`
      :host {
        display: contents;
      }

      .dialog {
        max-width: 500px;
        width: 90vw;
      }

      .dialog-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .source-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-weight: normal;
      }

      .dialog-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-group label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .form-group select {
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .form-group select:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .warning-message {
        padding: 12px;
        background: var(--warning-color, #ff9800);
        color: white;
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.4;
      }

      .cluster-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `],e([pe({type:Boolean})],Ot.prototype,"open",void 0),e([pe({attribute:!1})],Ot.prototype,"sourceNode",void 0),e([pe({attribute:!1})],Ot.prototype,"sourceEndpoint",void 0),e([pe({attribute:!1})],Ot.prototype,"availableNodes",void 0),e([pe({type:Number})],Ot.prototype,"selectedTargetNodeId",void 0),e([pe({type:Number})],Ot.prototype,"selectedTargetEndpointId",void 0),e([pe({type:Boolean})],Ot.prototype,"loading",void 0),e([pe({attribute:!1})],Ot.prototype,"availableGroups",void 0),e([ge()],Ot.prototype,"_selectedClusterId",void 0),e([ge()],Ot.prototype,"_targetType",void 0),e([ge()],Ot.prototype,"_selectedGroupId",void 0),Ot=e([de("matter-create-binding-dialog")],Ot);const Wt=[6,8,768,258,513].filter(e=>e in Ue);let jt=class extends se{constructor(){super(...arguments),this.open=!1,this.loading=!1,this._step=1,this._categoryId="",this._customCluster="",this._name="",this._error="",this._advanced=!1,this._groupId=""}render(){return this.open?j`
      <div class="dialog-overlay" @click=${this._handleCancel}>
        <div class="dialog" @click=${this._stop}>
          <div class="dialog-header">Create Group</div>
          <div class="dialog-body">
            ${1===this._step?this._renderStep1():this._renderStep2()}
            ${this._error?j`<div class="error">${this._error}</div>`:U}
          </div>
          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${1===this._step?this._handleCancel:this._back}
              ?disabled=${this.loading}
            >
              ${1===this._step?"Cancel":"Back"}
            </button>
            ${1===this._step?j`
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click=${this._next}
                  >
                    Next
                  </button>
                `:j`
                  <button
                    type="button"
                    class="btn btn-primary ${this.loading?"btn-loading":""}"
                    @click=${this._handleCreate}
                    ?disabled=${this.loading}
                  >
                    Create
                  </button>
                `}
          </div>
        </div>
      </div>
    `:U}_renderStep1(){return j`
      <div class="field">
        <label>What will this group control?</label>
        <div class="category-list">
          ${Mt.map(e=>j`
              <button
                type="button"
                class="category-card ${this._categoryId===e.id?"selected":""}"
                @click=${()=>this._selectCategory(e)}
              >
                <div class="category-label">${e.label}</div>
                <div class="category-desc">${e.description}</div>
              </button>
            `)}
          <button
            type="button"
            class="category-card ${this._categoryId===Bt?"selected":""}"
            @click=${this._selectCustom}
          >
            <div class="category-label">Custom</div>
            <div class="category-desc">Pick a single cluster manually</div>
          </button>
        </div>
        ${this._categoryId===Bt?j`
              <div class="field" style="margin-top: 12px;">
                <label for="custom-cluster">Cluster</label>
                <select
                  id="custom-cluster"
                  .value=${this._customCluster}
                  @change=${this._onCustomCluster}
                >
                  <option value="">Select a cluster…</option>
                  ${Wt.map(e=>j`
                      <option
                        value=${e}
                        ?selected=${this._customCluster===String(e)}
                      >
                        ${qe(e)} (0x${e.toString(16).padStart(4,"0")})
                      </option>
                    `)}
                </select>
              </div>
            `:U}
      </div>
    `}_renderStep2(){const e=this._selectedClusters(),t=this._categoryId===Bt?qe(e[0]):Mt.find(e=>e.id===this._categoryId)?.label??"";return j`
      <div class="step-summary">Type: ${t}</div>
      <div class="field">
        <label for="group-name">Name</label>
        <input
          id="group-name"
          type="text"
          .value=${this._name}
          @input=${this._onName}
          ?disabled=${this.loading}
          placeholder="e.g. Living Room Lights"
        />
      </div>
      <label class="advanced-toggle">
        <input
          type="checkbox"
          .checked=${this._advanced}
          @change=${this._onAdvancedToggle}
          ?disabled=${this.loading}
        />
        Advanced: set group ID manually
      </label>
      ${this._advanced?j`
            <div class="field">
              <label for="group-id">Group ID</label>
              <input
                id="group-id"
                type="number"
                min="1"
                max="65527"
                .value=${this._groupId}
                @input=${this._onGroupId}
                ?disabled=${this.loading}
                placeholder="e.g. 100"
              />
              <div class="note">
                Leave Advanced off to let Home Assistant pick a free ID
                automatically. Only set this if you need to match a specific
                Matter group ID (1–65527); it must not already be in use.
              </div>
            </div>
          `:U}
    `}_selectedClusters(){if(this._categoryId===Bt){const e=parseInt(this._customCluster,10);return Number.isInteger(e)?[e]:[]}const e=Mt.find(e=>e.id===this._categoryId);return e?[...e.clusters]:[]}_stop(e){e.stopPropagation()}_selectCategory(e){this._categoryId=e.id,this._error=""}_selectCustom(){this._categoryId=Bt,this._error=""}_onCustomCluster(e){this._customCluster=e.target.value,this._error=""}_next(){this._categoryId?this._categoryId!==Bt||0!==this._selectedClusters().length?(this._error="",this._step=2):this._error="Select a cluster for the custom group.":this._error="Pick what this group will control."}_back(){this._error="",this._step=1}_onName(e){this._name=e.target.value,this._error=""}_onAdvancedToggle(e){this._advanced=e.target.checked,this._error=""}_onGroupId(e){this._groupId=e.target.value,this._error=""}_handleCreate(){if(!this._name.trim())return void(this._error="Name is required.");const e=this._selectedClusters(),t={name:this._name.trim(),clusters:e};if(this._advanced&&""!==this._groupId.trim()){const e=parseInt(this._groupId,10);if(!Number.isInteger(e)||e<1||e>65527)return void(this._error="Group ID must be a whole number between 1 and 65527.");t.groupId=e}this.dispatchEvent(new CustomEvent("create-group",{detail:t,bubbles:!0,composed:!0}))}_handleCancel(){this._reset(),this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}_reset(){this._step=1,this._categoryId="",this._customCluster="",this._name="",this._groupId="",this._advanced=!1,this._error=""}};jt.styles=[bt,ft,Pt,s`
      :host {
        display: contents;
      }
      .field {
        margin-bottom: 16px;
      }
      label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }
      input,
      select {
        width: 100%;
        box-sizing: border-box;
        padding: 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }
      .error {
        color: var(--error-color, #f44336);
        font-size: 12px;
        margin-top: 8px;
      }
      .advanced-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 400;
        cursor: pointer;
        margin-bottom: 12px;
      }
      .advanced-toggle input {
        width: auto;
      }
      .note {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 6px;
        line-height: 1.4;
      }
      .category-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .category-card {
        display: block;
        width: 100%;
        text-align: left;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
      }
      .category-card:hover {
        background: var(--secondary-background-color);
      }
      .category-card.selected {
        border-color: var(--primary-color, #03a9f4);
      }
      .category-label {
        font-weight: 500;
        margin-bottom: 2px;
      }
      .category-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .step-summary {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }
    `],e([pe({type:Boolean})],jt.prototype,"open",void 0),e([pe({type:Boolean})],jt.prototype,"loading",void 0),e([ge()],jt.prototype,"_step",void 0),e([ge()],jt.prototype,"_categoryId",void 0),e([ge()],jt.prototype,"_customCluster",void 0),e([ge()],jt.prototype,"_name",void 0),e([ge()],jt.prototype,"_error",void 0),e([ge()],jt.prototype,"_advanced",void 0),e([ge()],jt.prototype,"_groupId",void 0),jt=e([de("matter-create-group-dialog")],jt);let Vt=class extends se{constructor(){super(...arguments),this.open=!1,this.group=null,this.availableNodes=[],this.loading=!1,this._selectedNodeId=null,this._selectedEndpointId=null}render(){if(!this.open||!this.group)return U;const e=this.group;return j`
      <div class="dialog-overlay" @click=${this._handleClose}>
        <div class="dialog" @click=${this._stop}>
          <div class="dialog-header">
            ${e.name}
            <span class="source-info">
              Group ${e.group_id} ·
              ${Gt(Lt(e))}
            </span>
          </div>
          <div class="dialog-body">
            <div class="section-title">Members</div>
            ${0===e.members.length?j`<div class="empty">No members yet. Add one below.</div>`:e.members.map(e=>this._renderMember(e.node_id,e.endpoint_id))}

            <div class="section-title">Add member</div>
            ${this._renderAddRow()}
          </div>
          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._handleClose}
              ?disabled=${this.loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    `}_endpointLabel(e){const t=e.device_types?.[0]?.id,i=void 0!==t?Je(t):null;return i?`EP ${e.endpoint_id} — ${i}`:`EP ${e.endpoint_id}`}_renderMember(e,t){const i=this.availableNodes.find(t=>t.node_id===e),o=i?.name??`Node ${e}`,r=i?.endpoints.find(e=>e.endpoint_id===t),n=r?this._endpointLabel(r):`EP ${t}`;return j`
      <div class="member-row">
        <span class="member-label">${o} — ${n}</span>
        <button
          type="button"
          class="btn btn-secondary"
          @click=${()=>this._removeMember(e,t)}
          ?disabled=${this.loading}
        >
          Remove
        </button>
      </div>
    `}_renderAddRow(){const e=this.availableNodes.find(e=>e.node_id===this._selectedNodeId),t=this.group?Lt(this.group):[],i=(e?.endpoints??[]).filter(e=>0!==e.endpoint_id),o=i.filter(e=>function(e,t){return 0===t.length||t.some(t=>e.server_clusters.includes(t))}(e,t)),r=i.length-o.length;return j`
      <div class="add-row">
        <div class="add-field">
          <label for="add-node">Device</label>
          <select
            id="add-node"
            @change=${this._onNodeChange}
            ?disabled=${this.loading}
          >
            <option value="" ?selected=${null===this._selectedNodeId}>
              Select…
            </option>
            ${this.availableNodes.map(e=>j`
                <option value=${e.node_id} ?selected=${e.node_id===this._selectedNodeId}>
                  ${e.name} (${e.node_id})
                </option>
              `)}
          </select>
        </div>
        <div class="add-field">
          <label for="add-endpoint">Endpoint</label>
          <select
            id="add-endpoint"
            @change=${this._onEndpointChange}
            ?disabled=${this.loading||null===this._selectedNodeId}
          >
            <option value="" ?selected=${null===this._selectedEndpointId}>
              Select…
            </option>
            ${o.map(e=>j`
                <option
                  value=${e.endpoint_id}
                  ?selected=${e.endpoint_id===this._selectedEndpointId}
                >
                  ${this._endpointLabel(e)}
                </option>
              `)}
          </select>
        </div>
        <button
          type="button"
          class="btn btn-primary"
          @click=${this._addMember}
          ?disabled=${this.loading||null===this._selectedNodeId||null===this._selectedEndpointId||this._isAlreadyMember()}
        >
          Add
        </button>
      </div>
      ${null!==this._selectedNodeId&&r>0?j`<div class="empty">
            ${r} endpoint(s) hidden — they don't support this group's
            clusters (${Gt(t)}).
          </div>`:U}
    `}_isAlreadyMember(){return!(!this.group||null===this._selectedNodeId||null===this._selectedEndpointId)&&this.group.members.some(e=>e.node_id===this._selectedNodeId&&e.endpoint_id===this._selectedEndpointId)}_stop(e){e.stopPropagation()}_onNodeChange(e){const t=e.target.value;this._selectedNodeId=""===t?null:parseInt(t,10),this._selectedEndpointId=null}_onEndpointChange(e){const t=e.target.value;this._selectedEndpointId=""===t?null:parseInt(t,10)}_addMember(){null!==this._selectedNodeId&&null!==this._selectedEndpointId&&this.dispatchEvent(new CustomEvent("add-member",{detail:{nodeId:this._selectedNodeId,endpointId:this._selectedEndpointId},bubbles:!0,composed:!0}))}_removeMember(e,t){this.dispatchEvent(new CustomEvent("remove-member",{detail:{nodeId:e,endpointId:t},bubbles:!0,composed:!0}))}_handleClose(){this._selectedNodeId=null,this._selectedEndpointId=null,this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}};Vt.styles=[bt,ft,Pt,s`
      :host {
        display: contents;
      }
      .section-title {
        font-size: 13px;
        font-weight: 600;
        margin: 16px 0 8px;
        color: var(--primary-text-color);
      }
      .member-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .member-label {
        font-size: 13px;
        color: var(--primary-text-color);
      }
      .empty {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 4px 0 8px;
      }
      .add-row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .add-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 120px;
      }
      .add-field label {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      select {
        padding: 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }
    `],e([pe({type:Boolean})],Vt.prototype,"open",void 0),e([pe({attribute:!1})],Vt.prototype,"group",void 0),e([pe({attribute:!1})],Vt.prototype,"availableNodes",void 0),e([pe({type:Boolean})],Vt.prototype,"loading",void 0),e([ge()],Vt.prototype,"_selectedNodeId",void 0),e([ge()],Vt.prototype,"_selectedEndpointId",void 0),Vt=e([de("matter-manage-group-dialog")],Vt);let Ut=class extends se{constructor(){super(...arguments),this.open=!1,this.title="Confirm",this.message="",this.icon="",this.variant="info",this.confirmLabel="Confirm",this.cancelLabel="Cancel",this.loading=!1}render(){if(!this.open)return U;const e=["dialog","confirm-dialog",`variant-${this.variant}`].join(" ");return j`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class=${e} @click=${this._handleDialogClick}>
          <div class="dialog-header">
            ${this.icon?j`<span class="confirm-icon">${this.icon}</span>`:U}
            ${this.title}
          </div>

          <div class="dialog-body">
            <slot>
              ${this.message?j`<div class="default-message">${this.message}</div>`:U}
            </slot>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._handleCancel}
              ?disabled=${this.loading}
            >
              ${this.cancelLabel}
            </button>
            <button
              type="button"
              class="btn btn-primary ${this.loading?"btn-loading":""}"
              @click=${this._handleConfirm}
              ?disabled=${this.loading}
            >
              ${this.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    `}_handleOverlayClick(){this._handleCancel()}_handleDialogClick(e){e.stopPropagation()}_handleConfirm(){this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0,composed:!0}))}_handleCancel(){this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}};Ut.styles=[bt,ft,Pt,Tt,s`
      :host {
        display: contents;
      }

      .dialog.variant-warning .btn-primary {
        background: var(--warning-color, #ff9800);
      }

      .dialog.variant-danger .btn-primary {
        background: var(--error-color, #f44336);
      }

      .dialog.variant-warning .confirm-icon {
        color: var(--warning-color, #ff9800);
      }

      .dialog.variant-danger .confirm-icon {
        color: var(--error-color, #f44336);
      }

      .dialog-body {
        margin-bottom: 24px;
      }

      .default-message {
        font-size: 14px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }
    `],e([pe({type:Boolean})],Ut.prototype,"open",void 0),e([pe({type:String})],Ut.prototype,"title",void 0),e([pe({type:String})],Ut.prototype,"message",void 0),e([pe({type:String})],Ut.prototype,"icon",void 0),e([pe({type:String})],Ut.prototype,"variant",void 0),e([pe({type:String})],Ut.prototype,"confirmLabel",void 0),e([pe({type:String})],Ut.prototype,"cancelLabel",void 0),e([pe({type:Boolean})],Ut.prototype,"loading",void 0),Ut=e([de("matter-confirm-dialog")],Ut);const Ft=s`
  .dialog-overlay.blocking {
    pointer-events: auto;
  }

  .operation-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
  }

  .operation-step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 4px;
    background: var(--secondary-background-color);
  }

  .operation-step.in_progress {
    background: rgba(var(--rgb-primary-color), 0.1);
  }

  .operation-step.success .step-icon {
    color: var(--success-color, #4caf50);
  }

  .operation-step.error .step-icon {
    color: var(--error-color, #f44336);
  }

  .operation-step.skipped {
    opacity: 0.6;
  }

  .step-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  .step-label {
    flex: 1;
  }

  .step-message {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .operation-hint {
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 13px;
    margin-top: 16px;
  }

  .operation-error {
    color: var(--error-color, #f44336);
    background: rgba(244, 67, 54, 0.1);
    padding: 12px;
    border-radius: 4px;
    margin-top: 16px;
  }
`,Ht=[s`
  .eve-schedule {
    margin-top: 12px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 8px;
    border-left: 3px solid var(--primary-color);
  }

  .eve-schedule-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .eve-schedule-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .eve-schedule-name {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  .eve-schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
    margin-bottom: 10px;
  }

  .eve-day-slot {
    background: var(--card-background-color);
    border-radius: 4px;
    padding: 6px 8px;
    text-align: center;
    font-size: 11px;
  }

  .eve-day-name {
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 2px;
  }

  .eve-day-profile {
    color: var(--secondary-text-color);
    font-size: 10px;
  }

  .eve-time-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .eve-time-slot {
    background: var(--card-background-color);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .eve-time {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .eve-profile {
    color: var(--primary-color);
    font-weight: 500;
  }

  .eve-schedule-loading {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }
`,s`
  .automation-card {
    border-left: 3px solid var(--warning-color, #ff9800);
  }

  .automation-intro {
    padding: 12px 16px;
    font-size: 13px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color);
    border-bottom: 1px solid var(--divider-color);
  }

  .overview-binding-row.automation {
    background: rgba(255, 152, 0, 0.05);
  }

  .automation-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .automation-icon {
    font-size: 18px;
  }

  .automation-suggestion {
    font-size: 14px;
    color: var(--primary-color);
    font-weight: 500;
    margin-bottom: 6px;
  }

  .automation-why {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
    margin-bottom: 4px;
  }

  .why-label {
    font-weight: 500;
    color: var(--warning-color, #ff9800);
  }
`,s`
  .filter-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }

  .filter-controls label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
  }

  .filter-info {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .toggle-switch {
    position: relative;
    width: 40px;
    height: 22px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--disabled-color, #ccc);
    transition: 0.3s;
    border-radius: 22px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: var(--primary-color);
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(18px);
  }
`,s`
  .btn-loading {
    position: relative;
    color: transparent !important;
  }

  .btn-loading::after {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    top: 50%;
    left: 50%;
    margin-left: -7px;
    margin-top: -7px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn-icon.btn-loading::after,
  .delete-btn.btn-loading::after {
    border-color: rgba(244, 67, 54, 0.3);
    border-top-color: var(--error-color, #f44336);
  }
`,s`
  .bulk-repair-results {
    max-height: 300px;
    overflow-y: auto;
  }

  .bulk-repair-summary {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }

  .bulk-repair-stat {
    text-align: center;
  }

  .bulk-repair-stat-value {
    font-size: 24px;
    font-weight: 600;
  }

  .bulk-repair-stat-label {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .bulk-repair-stat.success .bulk-repair-stat-value {
    color: var(--success-color, #4caf50);
  }

  .bulk-repair-stat.failed .bulk-repair-stat-value {
    color: var(--error-color, #f44336);
  }

  .bulk-repair-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid var(--divider-color);
  }

  .bulk-repair-item:last-child {
    border-bottom: none;
  }

  .bulk-repair-item-icon {
    font-size: 16px;
  }

  .bulk-repair-item-icon.success {
    color: var(--success-color, #4caf50);
  }

  .bulk-repair-item-icon.failed {
    color: var(--error-color, #f44336);
  }
`,s`
  .verification-result {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 6px;
    margin-bottom: 12px;
    font-size: 13px;
  }

  .verification-result.verified {
    background: rgba(76, 175, 80, 0.15);
    border: 1px solid var(--success-color, #4caf50);
    color: var(--success-color, #4caf50);
  }

  .verification-result.warning {
    background: rgba(255, 152, 0, 0.15);
    border: 1px solid var(--warning-color, #ff9800);
    color: var(--warning-color, #ff9800);
  }

  .verification-result.error {
    background: rgba(244, 67, 54, 0.15);
    border: 1px solid var(--error-color, #f44336);
    color: var(--error-color, #f44336);
  }

  .verification-icon {
    font-size: 16px;
    font-weight: bold;
  }

  .verification-message {
    flex: 1;
  }

  .verification-dismiss {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 0 4px;
    opacity: 0.7;
    color: inherit;
  }

  .verification-dismiss:hover {
    opacity: 1;
  }
`,Ft,s`
  .btn-repair {
    background: rgba(255, 152, 0, 0.15);
    color: var(--warning-color, #ff9800);
    border: 1px solid var(--warning-color, #ff9800);
  }

  .btn-repair:hover:not(:disabled) {
    background: rgba(255, 152, 0, 0.25);
  }

  .repair-icon {
    cursor: pointer;
    color: var(--warning-color, #ff9800);
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .repair-icon:hover {
    background: rgba(255, 152, 0, 0.15);
  }

  .repair-icon.loading {
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`];let qt=class extends se{constructor(){super(...arguments),this.progress=null,this.open=!1}render(){if(!this.open||!this.progress)return U;const{title:e,steps:t,completed:i,error:o,canCancel:r}=this.progress;return j`
      <div class="dialog-overlay blocking">
        <div class="dialog operation-progress-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">${e}</div>
          <div class="dialog-content">
            <div class="operation-steps">
              ${t.map(e=>j`
                <div class="operation-step ${e.status}">
                  <span class="step-icon">
                    ${"in_progress"===e.status?"⏳":"success"===e.status?"✓":"error"===e.status?"✗":"skipped"===e.status?"–":"○"}
                  </span>
                  <span class="step-label">${e.label}</span>
                  ${e.message?j`<span class="step-message">${e.message}</span>`:U}
                </div>
              `)}
            </div>
            ${o?j`<div class="operation-error">${o}</div>`:U}
            ${i?U:j`<div class="operation-hint">Communicating with Matter device...</div>`}
          </div>
          <div class="dialog-actions">
            ${i?j`<button class="btn btn-primary" @click=${this._handleClose}>Done</button>`:r?j`<button class="btn btn-secondary" @click=${this._handleCancel}>Cancel</button>`:U}
          </div>
        </div>
      </div>
    `}_handleClose(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_handleCancel(){this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}};qt.styles=[bt,Rt,Ft,s`
      :host {
        display: block;
      }

      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog-overlay.blocking {
        pointer-events: auto;
      }

      .dialog {
        background: var(--card-background-color, white);
        border-radius: 12px;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .dialog-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
        font-size: 18px;
        font-weight: 500;
      }

      .dialog-content {
        padding: 20px;
      }

      .dialog-actions {
        padding: 12px 20px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .operation-steps {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .operation-step {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 4px;
        background: var(--secondary-background-color);
      }

      .operation-step.in_progress {
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
      }

      .operation-step.success .step-icon {
        color: var(--success-color, #4caf50);
      }

      .operation-step.error .step-icon {
        color: var(--error-color, #f44336);
      }

      .operation-step.skipped {
        opacity: 0.6;
      }

      .step-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
      }

      .step-label {
        flex: 1;
      }

      .step-message {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .operation-hint {
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 13px;
        margin-top: 16px;
      }

      .operation-error {
        color: var(--error-color, #f44336);
        background: rgba(244, 67, 54, 0.1);
        padding: 12px;
        border-radius: 4px;
        margin-top: 16px;
      }
    `],e([pe({attribute:!1})],qt.prototype,"progress",void 0),e([pe({type:Boolean})],qt.prototype,"open",void 0),qt=e([de("matter-operation-progress-dialog")],qt);let Jt=class extends se{constructor(){super(...arguments),this.open=!1,this._alias="",this._loading=!1,this._created=!1}connectedCallback(){super.connectedCallback()}updated(e){(e.has("open")||e.has("recommendation"))&&this.open&&this.recommendation&&this.hass&&this._fetchPreview(),e.has("open")&&!this.open&&this._resetState()}_resetState(){this._preview=void 0,this._triggerEntityId=void 0,this._actionEntityId=void 0,this._alias="",this._loading=!1,this._error=void 0,this._created=!1,this._createdAutomationId=void 0}async _fetchPreview(){if(this.hass&&this.recommendation){this._loading=!0,this._error=void 0;try{const{template:e,sourceNode:t,sourceEndpoint:i,targetNode:o,targetEndpoint:r}=this.recommendation,n=await ct(this.hass,{template_id:e.id,source_node_id:t.node_id,source_endpoint_id:i.endpoint_id,target_node_id:o.node_id,target_endpoint_id:r.endpoint_id,source_device_types:i.device_types.map(e=>e.id),target_device_types:r.device_types.map(e=>e.id),preview_only:!0});if(this._preview=n,n.available_entities?.trigger?.length){const e=n.available_entities.trigger.find(e=>!e.disabled);this._triggerEntityId=e?.entity_id||n.available_entities.trigger[0].entity_id}if(n.available_entities?.action?.length){const e=n.available_entities.action.find(e=>!e.disabled);this._actionEntityId=e?.entity_id||n.available_entities.action[0].entity_id}}catch(e){this._error=e instanceof Error?e.message:"Failed to load preview"}finally{this._loading=!1}}}async _handleCreate(){if(this.hass&&this.recommendation){this._loading=!0,this._error=void 0;try{const{template:e,sourceNode:t,sourceEndpoint:i,targetNode:o,targetEndpoint:r}=this.recommendation,n=await ct(this.hass,{template_id:e.id,source_node_id:t.node_id,source_endpoint_id:i.endpoint_id,target_node_id:o.node_id,target_endpoint_id:r.endpoint_id,source_device_types:i.device_types.map(e=>e.id),target_device_types:r.device_types.map(e=>e.id),trigger_entity_id:this._triggerEntityId,action_entity_id:this._actionEntityId,alias:this._alias||void 0,preview_only:!1});n.success?(this._created=!0,this._createdAutomationId=n.automation_id,this.dispatchEvent(new CustomEvent("created",{detail:{automation_id:n.automation_id},bubbles:!0,composed:!0}))):this._error=n.message||"Failed to create automation"}catch(e){this._error=e instanceof Error?e.message:"Failed to create automation"}finally{this._loading=!1}}}_handleClose(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_handleOverlayClick(){this._loading||this._handleClose()}_handleDialogClick(e){e.stopPropagation()}_formatYaml(e){const t=(e,i)=>{const o="  ".repeat(i);return Array.isArray(e)?e.map(e=>{if("object"==typeof e&&null!==e){const i=Object.entries(e).map(([e,i],r)=>`${o}${0===r?"- ":"  "}${e}: ${t(i,0)}`).join("\n");return i}return`${o}- ${e}`}).join("\n"):"object"==typeof e&&null!==e?"\n"+Object.entries(e).map(([e,r])=>`${o}  ${e}: ${t(r,i+1)}`).join("\n"):"string"==typeof e&&e.includes("{{")?`"${e}"`:String(e)};return Object.entries(e).map(([e,i])=>`${e}: ${t(i,0)}`).join("\n")}render(){return this.open?j`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog automation-dialog" @click=${this._handleDialogClick}>
          ${this._created?this._renderSuccess():this._renderForm()}
        </div>
      </div>
    `:U}_renderSuccess(){return j`
      <div class="success-message">
        <div class="success-icon">✓</div>
        <div class="success-title">Automation Created</div>
        <div class="success-detail">
          The automation has been created but is disabled by default.
          Enable it in Home Assistant when you're ready.
        </div>
        <div class="dialog-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click=${this._handleClose}
          >
            Close
          </button>
          <a
            class="btn btn-primary"
            href="/config/automation/dashboard"
            target="_blank"
          >
            View Automations
          </a>
        </div>
      </div>
    `}_renderForm(){const{recommendation:e}=this;if(!e)return U;const{template:t,sourceNode:i,targetNode:o}=e;return j`
      <div class="dialog-header">
        <span class="header-icon">${t.icon}</span>
        <span>${t.title}</span>
      </div>

      <div class="device-info">
        <div class="device-card">
          <div class="device-card-label">Trigger (sensor)</div>
          <div class="device-card-name">${o.name}</div>
        </div>
        <div class="arrow-icon">→</div>
        <div class="device-card">
          <div class="device-card-label">Action (device)</div>
          <div class="device-card-name">${i.name}</div>
        </div>
      </div>

      ${this._error?j`<div class="error-message">${this._error}</div>`:U}

      ${this._loading&&!this._preview?j`
            <div class="preview-section">
              <div class="loading-spinner"></div>
              Loading preview...
            </div>
          `:U}

      ${this._preview?this._renderPreviewForm():U}

      <div class="info-notice">
        <span class="info-notice-icon">ℹ️</span>
        <span>
          The automation will be created <strong>disabled</strong>.
          You can enable it from the Home Assistant automations page after reviewing.
        </span>
      </div>

      <div class="dialog-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click=${this._handleClose}
          ?disabled=${this._loading}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary ${this._loading?"btn-loading":""}"
          @click=${this._handleCreate}
          ?disabled=${this._loading||!this._preview?.success}
        >
          ${this._loading?j`<span class="loading-spinner"></span>Creating...`:"Create Automation"}
        </button>
      </div>
    `}_renderPreviewForm(){const{_preview:e}=this;if(!e)return U;const t=e.available_entities?.trigger||[],i=e.available_entities?.action||[];return j`
      ${t.length>1?j`
            <div class="section">
              <div class="section-label">Trigger Entity</div>
              <select
                class="entity-select"
                .value=${this._triggerEntityId||""}
                @change=${e=>{this._triggerEntityId=e.target.value}}
              >
                ${t.map(e=>j`
                    <option
                      value=${e.entity_id}
                      ?disabled=${e.disabled}
                    >
                      ${e.name} (${e.entity_id})
                      ${e.disabled?" - Disabled":""}
                    </option>
                  `)}
              </select>
            </div>
          `:U}

      ${i.length>1?j`
            <div class="section">
              <div class="section-label">Action Entity</div>
              <select
                class="entity-select"
                .value=${this._actionEntityId||""}
                @change=${e=>{this._actionEntityId=e.target.value}}
              >
                ${i.map(e=>j`
                    <option
                      value=${e.entity_id}
                      ?disabled=${e.disabled}
                    >
                      ${e.name} (${e.entity_id})
                      ${e.disabled?" - Disabled":""}
                    </option>
                  `)}
              </select>
            </div>
          `:U}

      <div class="section">
        <div class="section-label">Custom Name (optional)</div>
        <input
          type="text"
          class="alias-input"
          placeholder=${e.automation_config?.alias||"Enter a custom name..."}
          .value=${this._alias}
          @input=${e=>{this._alias=e.target.value}}
        />
      </div>

      ${e.automation_config?j`
            <div class="section">
              <div class="section-label">Preview</div>
              <div class="preview-section">
                <div class="preview-yaml">
                  ${this._formatYaml(e.automation_config)}
                </div>
              </div>
            </div>
          `:U}
    `}};Jt.styles=[bt,ft,Pt,s`
      :host {
        display: contents;
      }

      .automation-dialog {
        min-width: 500px;
        max-width: 600px;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-icon {
        font-size: 24px;
      }

      .section {
        margin-bottom: 20px;
      }

      .section-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .entity-select {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .entity-select:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .entity-select option {
        padding: 8px;
      }

      .alias-input {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        box-sizing: border-box;
      }

      .alias-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .alias-input::placeholder {
        color: var(--secondary-text-color);
      }

      .preview-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .preview-yaml {
        font-family: monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--primary-text-color);
        max-height: 200px;
        overflow-y: auto;
      }

      .info-notice {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: rgba(33, 150, 243, 0.1);
        border-left: 3px solid var(--primary-color);
        padding: 12px 16px;
        border-radius: 0 6px 6px 0;
        margin-bottom: 16px;
        font-size: 13px;
      }

      .info-notice-icon {
        flex-shrink: 0;
        font-size: 16px;
      }

      .success-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 16px;
        text-align: center;
      }

      .success-icon {
        font-size: 48px;
        color: var(--success-color, #4caf50);
        margin-bottom: 16px;
      }

      .success-title {
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      .success-detail {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-bottom: 24px;
      }

      .error-message {
        background: rgba(244, 67, 54, 0.1);
        border-left: 3px solid var(--error-color, #f44336);
        padding: 12px 16px;
        border-radius: 0 6px 6px 0;
        margin-bottom: 16px;
        font-size: 13px;
        color: var(--error-color, #f44336);
      }

      .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .device-info {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .device-card {
        flex: 1;
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 12px;
      }

      .device-card-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .device-card-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .arrow-icon {
        display: flex;
        align-items: center;
        color: var(--secondary-text-color);
        font-size: 20px;
      }
    `],e([pe({attribute:!1})],Jt.prototype,"hass",void 0),e([pe({type:Boolean})],Jt.prototype,"open",void 0),e([pe({attribute:!1})],Jt.prototype,"recommendation",void 0),e([ge()],Jt.prototype,"_preview",void 0),e([ge()],Jt.prototype,"_triggerEntityId",void 0),e([ge()],Jt.prototype,"_actionEntityId",void 0),e([ge()],Jt.prototype,"_alias",void 0),e([ge()],Jt.prototype,"_loading",void 0),e([ge()],Jt.prototype,"_error",void 0),e([ge()],Jt.prototype,"_created",void 0),e([ge()],Jt.prototype,"_createdAutomationId",void 0),Jt=e([de("matter-create-automation-dialog")],Jt);const Kt=["binding","acl","verify"];let Yt=class extends se{constructor(){super(...arguments),this.open=!1,this.wizardState=null}render(){return this.open&&this.wizardState?j`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${this._handleDialogClick}>
          <div class="dialog-header">Create Binding</div>

          ${this._renderStepIndicator()}

          <div class="wizard-content">
            ${this._renderStepContent()}
          </div>

          ${this._renderActions()}
        </div>
      </div>
    `:U}_renderStepIndicator(){const e=this.wizardState,t=Kt.indexOf(e.currentStep);return j`
      <div class="wizard-steps">
        ${Kt.map((e,i)=>{const o=this._isStepCompleted(e,i,t);return j`
            ${i>0?j`<div class="wizard-connector ${i<=t?"completed":""}"></div>`:U}
            <div class="wizard-step ${i===t?"active":""} ${o?"completed":""}">
              <div class="wizard-step-circle">
                ${o?"✓":i+1}
              </div>
              <div class="wizard-step-label">
                ${this._getStepLabel(e)}
              </div>
            </div>
          `})}
      </div>
    `}_isStepCompleted(e,t,i){const o=this.wizardState;if(t<i)return!0;if(t===i)switch(e){case"binding":return!0===o.bindingResult?.success;case"acl":return!0===o.aclResult?.success;case"verify":return!0===o.verifyResult?.success}return!1}_getStepLabel(e){switch(e){case"binding":return"Create";case"acl":return"Permissions";case"verify":return"Verify"}}_renderStepContent(){switch(this.wizardState.currentStep){case"binding":return this._renderBindingStep();case"acl":return this._renderACLStep();case"verify":return this._renderVerifyStep()}}_renderBindingStep(){const e=this.wizardState,t=Ke(e.clusterId);return j`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 1: Create Binding</div>
        <div class="wizard-step-description">
          Write the binding to <strong>${e.sourceNode.name}</strong>
        </div>
      </div>

      <div class="binding-devices">
        <div class="binding-device-card source">
          <div class="binding-device-name">${e.sourceNode.name}</div>
          <div class="binding-device-endpoint">Endpoint ${e.sourceEndpoint.endpoint_id}</div>
        </div>
        <div class="binding-arrow-container">
          <span class="binding-cluster-label">${qe(e.clusterId)}</span>
          <span class="binding-arrow-large">→</span>
        </div>
        <div class="binding-device-card target">
          <div class="binding-device-name">${e.targetNode.name}</div>
          <div class="binding-device-endpoint">Endpoint ${e.targetEndpoint.endpoint_id}</div>
        </div>
      </div>

      <div class="binding-explanation">
        <div class="binding-explanation-content">
          <strong>${e.sourceNode.name}</strong> will ${t.action}
          <strong>${e.targetNode.name}</strong> using ${t.dataType}.
        </div>
      </div>

      ${e.bindingInProgress?j`
            <div class="wizard-progress-note">
              Communicating with Matter device... This may take a few seconds.
            </div>
          `:U}

      ${e.bindingResult?j`
            <div class="wizard-result ${e.bindingResult.success?"success":"error"}">
              <span class="wizard-result-icon">${e.bindingResult.success?"✓":"✗"}</span>
              <span class="wizard-result-message">${e.bindingResult.message}</span>
            </div>
          `:U}
    `}_renderACLStep(){const e=this.wizardState,t=mt(e.clusterId);return j`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 2: Set Permissions</div>
        <div class="wizard-step-description">
          Allow <strong>${e.sourceNode.name}</strong> to control
          <strong>${e.targetNode.name}</strong>
        </div>
      </div>

      <div class="privilege-selector">
        ${_t.map(i=>j`
            <div
              class="privilege-option ${e.selectedPrivilege===i.value?"selected":""}"
              @click=${()=>this._handlePrivilegeChange(i.value)}
            >
              <div class="privilege-radio"></div>
              <div class="privilege-content">
                <div class="privilege-label">
                  ${i.label}
                  ${i.value===t?j`<span class="privilege-badge recommended">Recommended</span>`:U}
                </div>
                <div class="privilege-description">${i.description}</div>
              </div>
            </div>
          `)}
      </div>

      ${e.aclInProgress?j`
            <div class="acl-progress-container">
              <div class="acl-progress-message">
                ${e.aclProgress?.message||`Setting permissions on ${e.targetNode.name}... This may take up to 30 seconds.`}
              </div>
              <div class="acl-progress-bar-container">
                ${e.aclProgress&&e.aclProgress.max_attempts>0?j`
                      <div
                        class="acl-progress-bar"
                        style="width: ${Math.round(e.aclProgress.attempt/e.aclProgress.max_attempts*100)}%"
                      ></div>
                    `:j`<div class="acl-progress-bar indeterminate"></div>`}
              </div>
              ${e.aclProgress?j`
                    <div class="acl-progress-stats">
                      <span class="acl-progress-attempt">
                        Attempt ${e.aclProgress.attempt+1} of ${e.aclProgress.max_attempts}
                      </span>
                      ${void 0!==e.aclProgress.remaining_seconds?j`<span>${e.aclProgress.remaining_seconds}s remaining</span>`:U}
                    </div>
                  `:U}
            </div>
          `:U}

      ${e.aclResult?j`
            <div class="wizard-result ${e.aclResult.success?"success":"error"}">
              <span class="wizard-result-icon">${e.aclResult.success?"✓":"✗"}</span>
              <span class="wizard-result-message">${e.aclResult.message}</span>
            </div>
          `:U}
    `}_renderVerifyStep(){const e=this.wizardState;return j`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 3: Verify Binding</div>
        <div class="wizard-step-description">
          Read the binding back from the device to confirm it was saved correctly
        </div>
      </div>

      ${e.verifyInProgress?j`
            <div class="wizard-progress-note">
              Reading bindings from ${e.sourceNode.name}... This may take a few seconds.
            </div>
          `:U}

      ${e.verifyResult?j`
            <div class="wizard-result ${e.verifyResult.verified||e.verifyResult.success?"success":"error"}">
              <span class="wizard-result-icon">
                ${e.verifyResult.verified?"✓":e.verifyResult.success?"⚠":"✗"}
              </span>
              <span class="wizard-result-message">${e.verifyResult.message}</span>
            </div>

            ${e.verifyResult.verified?j`
                  <div class="verify-success-message">
                    Binding created and verified successfully!
                  </div>
                `:U}
          `:j`
            <div class="verify-prompt">
              Click "Verify Binding" to confirm the binding was saved to the device.
            </div>
          `}
    `}_renderActions(){const e=this.wizardState,t=e.bindingInProgress||e.aclInProgress||e.verifyInProgress,i="verify"===e.currentStep&&e.verifyResult?"Done":"Cancel";return j`
      <div class="wizard-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click=${this._handleClose}
          ?disabled=${t}
        >
          ${i}
        </button>

        ${this._renderStepActions(e,t)}
      </div>
    `}_renderStepActions(e,t){switch(e.currentStep){case"binding":return j`
          <button
            type="button"
            class="btn btn-primary ${e.bindingInProgress?"btn-loading":""}"
            @click=${this._handleExecuteBinding}
            ?disabled=${t}
          >
            Create Binding
          </button>
        `;case"acl":return j`
          ${e.bindingResult?.success?j`
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click=${()=>this._handleStepChange("verify")}
                  ?disabled=${t}
                >
                  Skip
                </button>
              `:U}
          <button
            type="button"
            class="btn btn-primary ${e.aclInProgress?"btn-loading":""}"
            @click=${this._handleExecuteACL}
            ?disabled=${t}
          >
            Set Permissions
          </button>
        `;case"verify":return e.verifyResult?U:j`
            <button
              type="button"
              class="btn btn-primary ${e.verifyInProgress?"btn-loading":""}"
              @click=${this._handleExecuteVerify}
              ?disabled=${t}
            >
              Verify Binding
            </button>
          `}}_handleOverlayClick(){this._handleClose()}_handleDialogClick(e){e.stopPropagation()}_handleClose(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_handleExecuteBinding(){this.dispatchEvent(new CustomEvent("execute-binding",{bubbles:!0,composed:!0}))}_handleExecuteACL(){this.dispatchEvent(new CustomEvent("execute-acl",{bubbles:!0,composed:!0}))}_handleExecuteVerify(){this.dispatchEvent(new CustomEvent("execute-verify",{bubbles:!0,composed:!0}))}_handlePrivilegeChange(e){this.dispatchEvent(new CustomEvent("privilege-change",{detail:{privilege:e},bubbles:!0,composed:!0}))}_handleStepChange(e){this.dispatchEvent(new CustomEvent("step-change",{detail:{step:e},bubbles:!0,composed:!0}))}};Yt.styles=[bt,ft,Pt,Nt,Dt,s`
      :host {
        display: contents;
      }

      .dialog {
        max-width: 550px;
        width: 90vw;
      }

      .wizard-content {
        padding: 16px 0;
      }

      .wizard-step-info {
        margin-bottom: 16px;
      }

      .wizard-step-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .wizard-step-description {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .binding-devices {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .binding-device-card {
        padding: 12px 16px;
        background: var(--card-background-color);
        border-radius: 8px;
        text-align: center;
        min-width: 120px;
      }

      .binding-device-card.source {
        border: 2px solid var(--primary-color);
      }

      .binding-device-card.target {
        border: 2px solid var(--success-color, #4caf50);
      }

      .binding-device-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .binding-device-endpoint {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .binding-arrow-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .binding-cluster-label {
        font-size: 11px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .binding-arrow-large {
        font-size: 24px;
        color: var(--primary-color);
      }

      .binding-explanation {
        padding: 12px;
        background: var(--info-color-light, rgba(33, 150, 243, 0.1));
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .binding-explanation-content {
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }

      .wizard-progress-note {
        text-align: center;
        padding: 12px;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .wizard-result {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-radius: 8px;
        margin-top: 16px;
      }

      .wizard-result.success {
        background: var(--success-color-light, rgba(76, 175, 80, 0.1));
        color: var(--success-color, #4caf50);
      }

      .wizard-result.error {
        background: var(--error-color-light, rgba(244, 67, 54, 0.1));
        color: var(--error-color, #f44336);
      }

      .wizard-result-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .wizard-result-message {
        font-size: 13px;
        line-height: 1.4;
      }

      .wizard-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .verify-prompt {
        text-align: center;
        padding: 24px;
        color: var(--secondary-text-color);
      }

      .verify-success-message {
        text-align: center;
        margin-top: 16px;
        color: var(--success-color, #4caf50);
        font-weight: 500;
      }

      /* ACL Progress styles */
      .acl-progress-container {
        margin-top: 16px;
        padding: 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
      }

      .acl-progress-message {
        font-size: 14px;
        color: var(--primary-text-color);
        margin-bottom: 12px;
        text-align: center;
      }

      .acl-progress-bar-container {
        position: relative;
        height: 8px;
        background: var(--divider-color, #e0e0e0);
        border-radius: 4px;
        overflow: hidden;
      }

      .acl-progress-bar {
        height: 100%;
        background: var(--primary-color);
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      .acl-progress-bar.indeterminate {
        width: 30%;
        animation: indeterminate 1.5s infinite ease-in-out;
      }

      @keyframes indeterminate {
        0% {
          transform: translateX(-100%);
        }
        50% {
          transform: translateX(200%);
        }
        100% {
          transform: translateX(-100%);
        }
      }

      .acl-progress-stats {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .acl-progress-attempt {
        font-weight: 500;
      }
    `],e([pe({type:Boolean})],Yt.prototype,"open",void 0),e([pe({attribute:!1})],Yt.prototype,"wizardState",void 0),Yt=e([de("matter-binding-wizard")],Yt);const Xt=[29,30,31,40,42,48,49,50,51,52,53,56,60,62,63,70];let Zt=class extends se{constructor(){super(...arguments),this.endpoints=[],this.selectedEndpointId=null}render(){return j`
      <div class="section-header">Endpoints</div>
      ${this.endpoints.length>0?j`
            <div class="endpoint-list">
              ${this.endpoints.map(e=>this._renderEndpointItem(e))}
            </div>
          `:j`<div class="empty-state">No endpoints found</div>`}
    `}_renderEndpointItem(e){const t=this.selectedEndpointId===e.endpoint_id,i=e.device_types.map(e=>Je(e.id)).filter(t=>0!==e.endpoint_id||!t.includes("Root")),o=this._processClusterData(e.server_clusters||[]),r=this._processClusterData(e.client_clusters||[]),n=o.some(e=>e.isProprietary)||r.some(e=>e.isProprietary),s=["endpoint-item",t?"selected":"",e.has_binding_cluster?"":"no-binding"].filter(Boolean).join(" ");return j`
      <div class=${s} @click=${()=>this._handleEndpointClick(e)}>
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${e.endpoint_id}</span>
          ${e.has_binding_cluster?j`<span class="endpoint-badge binding">Binding</span>`:U}
          ${n?j`<span class="endpoint-badge proprietary">Proprietary</span>`:U}
        </div>
        ${i.length>0?j`<div class="endpoint-device-types">${i.join(", ")}</div>`:U}
        ${this._renderClusters(o,r)}
      </div>
    `}_processClusterData(e){return e.filter(e=>!Xt.includes(e)).map(e=>({id:e,name:qe(e),isProprietary:$e(e)}))}_renderClusters(e,t){return 0===e.length&&0===t.length?U:j`
      <div class="endpoint-clusters">
        ${e.length>0?j`
              <div class="cluster-section">
                <span class="cluster-label">Server:</span>
                <span class="cluster-list">
                  ${e.map(e=>j`
                      <span
                        class="cluster-tag ${e.isProprietary?"proprietary":""}"
                        title="${e.name} (0x${e.id.toString(16).toUpperCase()})"
                      >
                        ${e.name}
                      </span>
                    `)}
                </span>
              </div>
            `:U}
        ${t.length>0?j`
              <div class="cluster-section">
                <span class="cluster-label">Client:</span>
                <span class="cluster-list client">
                  ${t.map(e=>j`
                      <span
                        class="cluster-tag ${e.isProprietary?"proprietary":""}"
                        title="${e.name} (0x${e.id.toString(16).toUpperCase()})"
                      >
                        ${e.name}
                      </span>
                    `)}
                </span>
              </div>
            `:U}
      </div>
    `}_handleEndpointClick(e){this.dispatchEvent(new CustomEvent("endpoint-selected",{detail:{endpoint:e},bubbles:!0,composed:!0}))}};Zt.styles=[bt,ft,xt,s`
      :host {
        display: block;
      }

      .section-header {
        font-size: 14px;
        font-weight: 600;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .endpoint-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .endpoint-item {
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: var(--card-background-color);
      }

      .endpoint-item:hover {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.05);
      }

      .endpoint-item.selected {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
      }

      .endpoint-item.no-binding {
        opacity: 0.7;
      }

      .endpoint-item.no-binding:hover {
        opacity: 1;
      }

      .endpoint-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .endpoint-id {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .endpoint-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .endpoint-badge.binding {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .endpoint-badge.proprietary {
        background: var(--warning-color, #ff9800);
        color: white;
      }

      .endpoint-device-types {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }

      .endpoint-item.selected .endpoint-device-types {
        color: var(--primary-text-color);
      }

      .endpoint-clusters {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cluster-section {
        font-size: 12px;
      }

      .cluster-label {
        color: var(--secondary-text-color);
        font-weight: 500;
        margin-right: 4px;
      }

      .cluster-list {
        display: inline;
      }

      .cluster-tag {
        display: inline-block;
        padding: 2px 6px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        margin: 2px 2px 2px 0;
        font-size: 11px;
        color: var(--primary-text-color);
      }

      .cluster-tag.proprietary {
        background: rgba(255, 152, 0, 0.2);
        color: var(--warning-color, #ff9800);
      }

      .endpoint-item.selected .cluster-tag {
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.2);
      }

      .empty-state {
        padding: 24px 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 14px;
      }
    `],e([pe({attribute:!1})],Zt.prototype,"endpoints",void 0),e([pe({type:Number})],Zt.prototype,"selectedEndpointId",void 0),Zt=e([de("matter-endpoint-selector")],Zt);let Qt=class extends se{constructor(){super(...arguments),this.recommendations=[],this.loading=!1,this.actionInProgress=!1,this.title="Recommended Bindings",this.hideCard=!1,this.emptyMessage="No binding recommendations. All compatible endpoints are already bound."}render(){return this.hideCard?this._renderContent():j`
      <div class="card overview-card">
        <div class="card-header">
          ${this.title}
          <span class="count-badge">${this.recommendations.length}</span>
        </div>
        ${this._renderContent()}
      </div>
    `}_renderContent(){return this.loading?j`<div class="loading">Loading recommendations...</div>`:0===this.recommendations.length?j`
        <div class="empty-state">
          ${this.emptyMessage}
        </div>
      `:j`
      <div class="recommendation-list">
        ${this.recommendations.map(e=>this._renderRecommendationRow(e))}
      </div>
    `}_renderRecommendationRow(e){const{sourceNode:t,sourceEndpoint:i,targetNode:o,targetEndpoint:r,compatibleClusters:n}=e,s=n.map(e=>Ke(e).action.replace(/^(control |read |receive |trigger |manage )/,"")),a=[...new Set(s)],d=a.length>2?`${a.slice(0,2).join(", ")}...`:a.join(", "),l=1===n.length?Ke(n[0]).action:`access ${d} from`;return j`
      <div class="recommendation-row">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong
              class="${t.ha_device_id?"device-link":""}"
              @click=${t.ha_device_id?()=>this._handleNavigateDevice(t.ha_device_id):U}
            >
              ${t.name}
            </strong>
            <span class="binding-action">can ${l}</span>
            <strong
              class="${o.ha_device_id?"device-link":""}"
              @click=${o.ha_device_id?()=>this._handleNavigateDevice(o.ha_device_id):U}
            >
              ${o.name}
            </strong>
            <span class="cluster-badges">
              ${n.map(e=>{const t=qe(e),i=`${t}: ${Ke(e).dataType}`;return j`
                  <span class="cluster-badge" title="${i}">${t}</span>
                `})}
            </span>
          </div>
          <div class="binding-meta">
            #${t.node_id} EP ${i.endpoint_id} →
            #${o.node_id} EP ${r.endpoint_id}
            ${t.area_name?j` · ${t.area_name}`:U}
          </div>
        </div>
        <button
          class="btn btn-small btn-primary"
          ?disabled=${this.actionInProgress}
          @click=${()=>this._handleCreateBinding(e)}
        >
          Create
        </button>
      </div>
    `}_handleCreateBinding(e){this.dispatchEvent(new CustomEvent("create-binding",{detail:{recommendation:e},bubbles:!0,composed:!0}))}_handleNavigateDevice(e){e&&this.dispatchEvent(new CustomEvent("navigate-device",{detail:{deviceId:e},bubbles:!0,composed:!0}))}};Qt.styles=[bt,ft,xt,wt,St,s`
      :host {
        display: block;
      }

      .recommendation-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .recommendation-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color);
      }

      .recommendation-row:hover {
        background: var(--secondary-background-color);
      }

      .binding-description {
        flex: 1;
        min-width: 0;
      }

      .binding-sentence {
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 4px;
      }

      .binding-sentence strong {
        font-weight: 500;
      }

      .binding-action {
        color: var(--secondary-text-color);
        margin: 0 4px;
      }

      .device-link {
        color: var(--primary-color);
        cursor: pointer;
      }

      .device-link:hover {
        text-decoration: underline;
      }

      .cluster-badges {
        display: inline-flex;
        gap: 4px;
        margin-left: 8px;
        flex-wrap: wrap;
      }

      .cluster-badge {
        font-size: 10px;
        padding: 2px 6px;
        background: var(--primary-color);
        color: white;
        border-radius: 4px;
        font-weight: 500;
      }

      .binding-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .empty-state {
        padding: 24px 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .loading {
        padding: 24px 16px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .count-badge {
        background: var(--primary-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin-left: 8px;
      }
    `],e([pe({attribute:!1})],Qt.prototype,"recommendations",void 0),e([pe({type:Boolean})],Qt.prototype,"loading",void 0),e([pe({type:Boolean})],Qt.prototype,"actionInProgress",void 0),e([pe({type:String})],Qt.prototype,"title",void 0),e([pe({type:Boolean})],Qt.prototype,"hideCard",void 0),e([pe({type:String})],Qt.prototype,"emptyMessage",void 0),Qt=e([de("matter-recommendation-list")],Qt);let ei=class extends se{constructor(){super(...arguments),this.groups=[],this.loading=!1}render(){return j`
      <div class="card">
        <div class="card-header">
          <span>Matter Groups</span>
          <span class="header-actions">
            <button
              type="button"
              class="btn btn-secondary"
              title="Re-provision keys and access for existing groupcast bindings"
              @click=${this._handleRepairClick}
            >
              Repair
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._handleCreateClick}
            >
              Create Group
            </button>
          </span>
        </div>
        ${this.loading?j`<div class="loading">Loading...</div>`:this.groups.length>0?this._renderGroupList():j`
                <div class="empty-state">
                  No Matter groups configured. Create one to get started.
                </div>
              `}
      </div>
    `}_renderGroupList(){return j`
      <div class="binding-list">
        ${this.groups.map(e=>this._renderGroup(e))}
      </div>
    `}_renderGroup(e){return j`
      <div class="group-card" @click=${()=>this._handleGroupClick(e)}>
        <div class="group-card-header">
          <div class="group-info">
            <div class="group-name">${e.name}</div>
            <div class="group-meta">
              Group ID: ${e.group_id} | ${e.members.length} member(s)
            </div>
          </div>
          <button
            type="button"
            class="btn btn-secondary btn-delete-group"
            @click=${t=>this._handleDeleteClick(t,e)}
          >
            Delete
          </button>
        </div>
        ${e.members.length>0?j`
              <div class="member-list">
                ${e.members.map(e=>j`
                    <span class="member-chip">
                      Node ${e.node_id} EP ${e.endpoint_id}
                    </span>
                  `)}
              </div>
            `:null}
      </div>
    `}_handleGroupClick(e){this.dispatchEvent(new CustomEvent("group-click",{detail:{group:e},bubbles:!0,composed:!0}))}_handleCreateClick(){this.dispatchEvent(new CustomEvent("create-group-click",{bubbles:!0,composed:!0}))}_handleRepairClick(){this.dispatchEvent(new CustomEvent("repair-groups-click",{bubbles:!0,composed:!0}))}_handleDeleteClick(e,t){e.stopPropagation(),this.dispatchEvent(new CustomEvent("delete-group",{detail:{group:t},bubbles:!0,composed:!0}))}};ei.styles=[ft,bt,wt,s`
      :host {
        display: block;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .group-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
      }

      .group-card-header .group-info {
        flex: 1;
        min-width: 0;
      }

      .btn-delete-group {
        flex-shrink: 0;
      }

      .binding-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .group-card {
        padding: 12px 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: background 0.2s;
      }

      .group-card:hover {
        background: var(--secondary-background-color);
      }

      .group-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .group-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .member-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 8px;
      }

      .member-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: var(--secondary-background-color);
        border-radius: 12px;
        font-size: 11px;
      }
    `],e([pe({attribute:!1})],ei.prototype,"groups",void 0),e([pe({type:Boolean})],ei.prototype,"loading",void 0),ei=e([de("matter-groups-tab")],ei);const ti=[s`
  :host {
    display: block;
    padding: 16px;
    background: var(--primary-background-color);
    min-height: 100vh;
  }
`,s`
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    color: var(--primary-text-color);
  }
`,s`
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--divider-color);
  }

  .tab {
    padding: 12px 24px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--secondary-text-color);
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    font-family: inherit;
  }

  .tab:hover {
    color: var(--primary-text-color);
  }

  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
`,s`
  .content {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 24px;
  }

  .narrow .content {
    grid-template-columns: 1fr;
  }

  .bindings-panel {
    min-height: 400px;
  }

  .device-panel {
    min-height: 400px;
  }
`,s`
  .overview-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`,s`
  .footer {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--divider-color);
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
  }

  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }

  .footer-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.5;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
  }

  .footer-link {
    color: var(--primary-color);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .footer-link:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`],ii=[s`
  .device-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .device-header {
    border-bottom: 1px solid var(--divider-color);
    padding-bottom: 16px;
  }

  .device-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .device-title h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .device-ha-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 16px;
    opacity: 0.7;
  }

  .device-ha-link:hover {
    opacity: 1;
  }

  .device-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .device-type-tag {
    background: var(--primary-color);
    color: white;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 500;
  }

  .device-area-tag {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 12px;
  }

  .device-version {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .device-section {
    background: var(--secondary-background-color);
    border-radius: 8px;
    padding: 16px;
  }

  .device-link {
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 2px;
  }

  .device-link:hover {
    color: var(--primary-color);
    text-decoration-style: solid;
  }
`,s`
  .node-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .node-item {
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .node-item:hover {
    background: var(--secondary-background-color);
  }

  .node-item.selected {
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  .node-item.selected .node-name,
  .node-item.selected .node-device-type,
  .node-item.selected .node-area,
  .node-item.selected .node-vendor,
  .node-item.selected .node-endpoints,
  .node-item.selected .node-meta-sep,
  .node-item.selected .node-version {
    color: var(--text-primary-color);
    opacity: 1;
  }

  .node-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 2px;
  }

  .node-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .node-id {
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.7;
    font-weight: normal;
    margin-left: 6px;
  }

  .node-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .node-meta-sep {
    color: var(--secondary-text-color);
    opacity: 0.5;
  }

  .node-vendor {
    color: var(--secondary-text-color);
    opacity: 0.8;
  }

  .node-device-type {
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  .node-area {
    color: var(--primary-color);
    opacity: 0.9;
  }

  .node-endpoints {
    color: var(--secondary-text-color);
    opacity: 0.7;
  }

  .node-endpoints.has-binding {
    color: var(--success-color, #4caf50);
    opacity: 1;
  }

  .node-details {
    margin-left: 32px;
    margin-top: 8px;
  }

  .node-version {
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.6;
    margin-left: auto;
  }

  .node-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success-color, #4caf50);
  }

  .node-status.unavailable {
    background: var(--error-color, #f44336);
  }

  .no-endpoints {
    font-size: 13px;
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }
`,s`
  .endpoint-list {
    margin-left: 32px;
    margin-top: 8px;
  }

  .endpoint-item {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid var(--divider-color);
    margin-bottom: 8px;
  }

  .endpoint-item:hover {
    background: var(--secondary-background-color);
    border-color: var(--primary-color);
  }

  .endpoint-item.selected {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border-color: var(--primary-color);
  }

  .endpoint-item.no-binding {
    opacity: 0.6;
    cursor: not-allowed;
    border-style: dashed;
  }

  .endpoint-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .endpoint-id {
    font-weight: 500;
  }

  .endpoint-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .endpoint-badge.binding {
    background: var(--success-color, #4caf50);
    color: white;
  }

  .endpoint-badge.proprietary {
    background: var(--warning-color, #ff9800);
    color: white;
  }

  .cluster-proprietary {
    color: var(--warning-color, #ff9800);
    font-weight: 500;
  }

  .endpoint-device-types {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-bottom: 2px;
  }

  .endpoint-item.selected .endpoint-device-types {
    color: var(--text-primary-color);
    opacity: 0.9;
  }

  .endpoint-clusters {
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.8;
  }

  .endpoint-item.selected .endpoint-clusters {
    color: var(--text-primary-color);
    opacity: 0.8;
  }

  .cluster-role {
    font-weight: 500;
    opacity: 0.7;
    margin-right: 4px;
  }

  .cluster-name {
    cursor: help;
  }

  .cluster-cmd-count {
    font-size: 10px;
    opacity: 0.7;
    margin-left: 2px;
  }
`,s`
  .entity-list {
    margin-top: 12px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 6px;
  }

  .entity-list-header {
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }

  .entity-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .entity-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    font-size: 11px;
    font-family: inherit;
    color: var(--primary-text-color);
    cursor: pointer;
    transition: all 0.2s;
  }

  .entity-chip:hover {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  .entity-chip .domain-icon {
    font-size: 12px;
  }

  .entity-chip.disabled {
    opacity: 0.5;
    text-decoration: line-through;
  }
`,s`
  .registry-info {
    background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.05), transparent);
    border-left: 3px solid var(--primary-color);
    padding-left: 12px;
  }

  .registry-badge {
    background: var(--primary-color);
    color: var(--text-primary-color);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
    margin-left: 8px;
  }

  .registry-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .registry-model {
    font-size: 14px;
  }

  .registry-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }

  .registry-features {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  .feature-label {
    font-size: 11px;
    color: var(--secondary-text-color);
  }

  .feature-tag {
    font-size: 10px;
    padding: 2px 6px;
    background: var(--warning-color, #ff9800);
    color: white;
    border-radius: 4px;
    font-weight: 500;
  }

  .registry-link {
    font-size: 12px;
    color: var(--primary-color);
    text-decoration: none;
  }

  .registry-link:hover {
    text-decoration: underline;
  }
`],oi=[s`
  .binding-devices {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 20px 0;
  }

  .binding-device-card {
    flex: 1;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .binding-device-card.source {
    border-color: var(--primary-color);
  }

  .binding-device-card.target {
    border-color: var(--success-color, #4caf50);
  }

  .binding-device-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .binding-device-endpoint {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .binding-device-area {
    font-size: 11px;
    color: var(--secondary-text-color);
    font-style: italic;
    margin-top: 4px;
  }

  .binding-arrow-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .binding-arrow-large {
    font-size: 24px;
    color: var(--primary-color);
  }

  .binding-cluster-label {
    font-size: 11px;
    background: var(--primary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
  }
`,s`
  .binding-explanation {
    background: var(--secondary-background-color);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }

  .binding-explanation-header {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 12px;
  }

  .binding-explanation-content {
    font-size: 16px;
    line-height: 1.6;
  }

  .binding-explanation-content strong {
    color: var(--primary-color);
  }
`,s`
  .cluster-select-group {
    margin-top: 16px;
  }

  .cluster-select-group label {
    display: block;
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }
`,s`
  .overview-binding-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color);
  }

  .overview-binding-row:last-child {
    border-bottom: none;
  }

  .overview-binding-row.recommendation {
    background: var(--secondary-background-color);
  }

  .overview-binding-row.readable {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
  }

  .binding-description {
    flex: 1;
    min-width: 0;
  }

  .binding-sentence {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 4px;
  }

  .binding-sentence strong {
    color: var(--primary-text-color);
  }

  .binding-action {
    color: var(--secondary-text-color);
    margin: 0 4px;
  }

  .binding-meta {
    font-size: 12px;
    color: var(--secondary-text-color);
    opacity: 0.8;
  }

  .overview-binding-row.recommendation .binding-action {
    color: var(--primary-color);
  }

  .binding-source,
  .binding-target {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 180px;
    flex: 1;
  }

  .binding-source > div:first-child,
  .binding-target > div:first-child {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .binding-source .node-name,
  .binding-target .node-name {
    font-weight: 500;
  }

  .endpoint-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .area-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  .binding-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .binding-arrow {
    color: var(--primary-color);
    font-size: 18px;
    flex-shrink: 0;
  }

  .binding-cluster-badge {
    background: var(--primary-color);
    color: white;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .compatible-clusters {
    font-size: 11px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color);
    padding: 4px 8px;
    border-radius: 4px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group-target {
    font-style: italic;
    color: var(--secondary-text-color);
  }
`];let ri=class extends se{constructor(){super(...arguments),this.narrow=!1,this._nodes=[],this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[],this._groups=[],this._loading=!1,this._error=null,this._activeTab="overview",this._showCreateDialog=!1,this._showCreateGroupDialog=!1,this._manageGroup=null,this._pendingDeleteGroup=null,this._allBindings=[],this._recommendations=[],this._overviewLoading=!1,this._surveySubmitting=!1,this._surveyResult=null,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null,this._filterSameAreaOnly=!0,this._actionInProgress=null,this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null,this._pendingManualBinding=null,this._pendingDeleteBinding=null,this._automationRecommendations=[],this._eveSchedules=new Map,this._eveScheduleLoading=new Set,this._verificationInProgress=!1,this._lastVerificationResult=null,this._showVerificationModal=!1,this._verificationModalResult=null,this._aclLoading=!1,this._aclEntries=null,this._targetACLCache=new Map,this._aclLoadingNodes=new Set,this._bindingWizard=null,this._aclRepairInProgress=new Map,this._bulkRepairInProgress=!1,this._bulkRepairResult=null,this._showBulkRepairModal=!1,this._operationProgress=null,this._showAutomationDialog=!1,this._pendingAutomationRecommendation=null}_updateStepStatus(e,t,i){if(!this._operationProgress)return;const o=[...this._operationProgress.steps];o[e]={...o[e],status:t,message:i},this._operationProgress={...this._operationProgress,steps:o,currentStepIndex:e}}_closeOperationProgress(){this._operationProgress=null,this._loadOverviewData()}_extractErrorMessage(e){if("string"==typeof e)return e;if(e&&"object"==typeof e){const t=e;return"string"==typeof t.message?t.message:"string"==typeof t.error?t.error:"string"==typeof t.text?t.text:JSON.stringify(e)}return String(e)}_cancelOperation(){if(!this._operationProgress)return;const e=this._operationProgress.steps.map(e=>"pending"===e.status?{...e,status:"skipped"}:e);this._operationProgress={...this._operationProgress,steps:e,completed:!0,error:"Operation cancelled by user"}}firstUpdated(){this._loadNodes().then(()=>{"overview"===this._activeTab&&this._loadOverviewData()})}async _loadNodes(){this._loading=!0,this._error=null;try{const e=await async function(e){return e.callWS({type:`${it}/list_nodes`})}(this.hass);this._nodes=e.nodes}catch(e){this._error=`Failed to load nodes: ${this._extractErrorMessage(e)}`}finally{this._loading=!1}}async _loadBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._loading=!0;try{const e=await ot(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._bindings=e.bindings;const t=new Set(e.bindings.filter(e=>null!==e.target_node_id).map(e=>e.target_node_id));Promise.all(Array.from(t).map(e=>this._loadACLForNode(e))).catch(e=>console.error("Failed to load some target ACLs:",e))}catch(e){this._error=`Failed to load bindings: ${this._extractErrorMessage(e)}`}finally{this._loading=!1}}}async _loadGroups(){this._loading=!0;try{const e=await async function(e){return e.callWS({type:`${it}/list_groups`})}(this.hass);this._groups=e.groups}catch(e){this._error=`Failed to load groups: ${this._extractErrorMessage(e)}`}finally{this._loading=!1}}_isEveDevice(e){return e.endpoints.some(e=>e.server_clusters.includes(Xe))}async _loadEveSchedule(e){if(this._eveSchedules.has(e.node_id)||this._eveScheduleLoading.has(e.node_id))return;const t=e.endpoints.find(e=>e.server_clusters.includes(Xe)&&e.endpoint_id>0);if(t){this._eveScheduleLoading=new Set([...this._eveScheduleLoading,e.node_id]);try{const i=await async function(e,t,i=1){return e.callWS({type:`${it}/get_eve_schedule`,node_id:t,endpoint_id:i})}(this.hass,e.node_id,t.endpoint_id);i.schedule&&(this._eveSchedules=new Map(this._eveSchedules).set(e.node_id,i.schedule))}catch(t){console.error(`Failed to load Eve schedule for node ${e.node_id}:`,t)}finally{const t=new Set(this._eveScheduleLoading);t.delete(e.node_id),this._eveScheduleLoading=t}}}_renderEveSchedule(e){if(!this._isEveDevice(e))return U;if(this._eveScheduleLoading.has(e.node_id))return j`
        <div class="device-section">
          <div class="section-header">Heating Schedule</div>
          <div class="eve-schedule-loading">Loading Eve schedule...</div>
        </div>
      `;const t=this._eveSchedules.get(e.node_id);if(!t)return U;const i={'"':"Comfort",$:"Eco","%":"Boost","&":"Off","*":"Custom"};return j`
      <div class="device-section">
        <div class="section-header">
          Heating Schedule
          ${t.name?j`<span class="section-context">${t.name}</span>`:U}
        </div>

        ${t.day_assignments.length>0?j`
              <div class="eve-schedule-grid">
                ${t.day_assignments.map(e=>j`
                    <div class="eve-day-slot">
                      <div class="eve-day-name">${e.day.slice(0,3)}</div>
                      <div class="eve-day-profile">${i[e.profile_id]||e.profile_id}</div>
                    </div>
                  `)}
              </div>
            `:U}

        ${t.time_slots.length>0?j`
              <div class="eve-time-slots">
                ${t.time_slots.map(e=>j`
                    <div class="eve-time-slot">
                      <span class="eve-time">${e.time}</span>
                      <span class="eve-profile">${i[e.profile_id]||e.profile_id}</span>
                    </div>
                  `)}
              </div>
            `:U}
      </div>
    `}_renderThermostatSchedule(e){if(this._isEveDevice(e))return U;const t=e.endpoints.find(e=>{return(t=e).server_clusters.includes(Me)&&t.device_types.some(e=>769===e.id);var t});return t?j`
      <thermostat-schedule-editor
        .hass=${this.hass}
        .node=${e}
        .endpoint=${t}
      ></thermostat-schedule-editor>
    `:U}async _loadOverviewData(){this._overviewLoading=!0,this._error=null;try{const e=[];for(const t of this._nodes)for(const i of t.endpoints)if(i.has_binding_cluster)try{const o=await ot(this.hass,t.node_id,i.endpoint_id);for(const r of o.bindings){const o=r.target_node_id&&this._nodes.find(e=>e.node_id===r.target_node_id)||null,n=o&&r.target_endpoint_id&&o.endpoints.find(e=>e.endpoint_id===r.target_endpoint_id)||null;e.push({binding:r,sourceNode:t,sourceEndpoint:i,targetNode:o,targetEndpoint:n})}}catch{}this._allBindings=e;const t=new Set(e.filter(e=>null!==e.binding.target_node_id).map(e=>e.binding.target_node_id));Promise.all(Array.from(t).map(e=>this._loadACLForNode(e))).catch(e=>console.error("Failed to load some target ACLs:",e)),this._recommendations=this._computeRecommendations(),this._automationRecommendations=this._computeAutomationRecommendations()}catch(e){this._error=`Failed to load overview data: ${this._extractErrorMessage(e)}`}finally{this._overviewLoading=!1}}_computeAutomationRecommendations(){const e=[],t=new Set;for(const i of this._nodes)for(const o of i.endpoints){const r=o.device_types.map(e=>e.id);for(const n of this._nodes)if(!i.area_name||!n.area_name||i.area_name===n.area_name)for(const s of n.endpoints){if(i.node_id===n.node_id)continue;const a=s.device_types.map(e=>e.id);for(const d of Ye){const l=d.sourceDeviceTypes.some(e=>r.includes(e)),c=d.targetDeviceTypes.some(e=>a.includes(e));if(l&&c){const r=`${d.id}-${i.node_id}-${n.node_id}`;if(t.has(r))continue;t.add(r),e.push({template:d,sourceNode:i,sourceEndpoint:o,targetNode:n,targetEndpoint:s})}}}}return e}_computeRecommendations(){return function(e,t){const i=[];for(const o of e)for(const r of o.endpoints){const n=r.client_clusters||[];if(0!==n.length&&r.has_binding_cluster)for(const s of e)for(const e of s.endpoints){if(o.node_id===s.node_id&&r.endpoint_id===e.endpoint_id)continue;const a=e.server_clusters||[],d=n.filter(e=>a.includes(e));if(0===d.length)continue;const l=d.filter(i=>!t.some(t=>t.binding.node_id===o.node_id&&t.binding.endpoint_id===r.endpoint_id&&t.binding.target_node_id===s.node_id&&t.binding.target_endpoint_id===e.endpoint_id&&t.binding.cluster_id===i));0!==l.length&&i.push({sourceNode:o,sourceEndpoint:r,targetNode:s,targetEndpoint:e,compatibleClusters:l})}}return i.sort((e,t)=>t.compatibleClusters.length-e.compatibleClusters.length),i}(this._nodes,this._allBindings)}_selectNode(e){this._lastVerificationResult=null,this._aclEntries=null,this._selectedSourceNode?.node_id===e.node_id?(this._selectedSourceNode=null,this._selectedSourceEndpoint=null,this._bindings=[]):(this._selectedSourceNode=e,this._selectedSourceEndpoint=null,this._bindings=[],this._isEveDevice(e)&&this._loadEveSchedule(e))}_selectEndpoint(e,t){e.stopPropagation(),t.has_binding_cluster&&(this._lastVerificationResult=null,this._selectedSourceEndpoint=t,this._loadBindings())}async _deleteBinding(e){if(!confirm("Are you sure you want to delete this binding?"))return;const t=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;this._actionInProgress=t;try{const t=await nt(this.hass,e.node_id,e.endpoint_id,e.target_node_id??void 0,e.target_endpoint_id??void 0,e.target_group_id??void 0);this._lastVerificationResult={success:t.success,verified:t.verified,message:t.message,error_type:t.error_type},await this._loadBindings()}catch(e){this._error=`Failed to delete binding: ${this._extractErrorMessage(e)}`}finally{this._actionInProgress=null}}async _verifyBindings(){if(this._selectedSourceNode&&this._selectedSourceEndpoint){this._verificationInProgress=!0,this._lastVerificationResult=null;try{const e=await st(this.hass,this._selectedSourceNode.node_id,this._selectedSourceEndpoint.endpoint_id);this._lastVerificationResult={success:e.success,verified:e.verified,message:e.message,error_type:e.error_type},await this._loadBindings()}catch(e){this._lastVerificationResult={success:!1,verified:!1,message:`Failed to verify bindings: ${this._extractErrorMessage(e)}`,error_type:"unknown_error"}}finally{this._verificationInProgress=!1}}}async _verifyBindingWithModal(e){const{binding:t}=e;this._verificationInProgress=!0,this._showVerificationModal=!0,this._verificationModalResult=null;try{const i=await st(this.hass,t.node_id,t.endpoint_id);this._verificationModalResult={success:i.success,verified:i.verified,message:i.message,bindingContext:e}}catch(t){this._verificationModalResult={success:!1,verified:!1,message:`Failed to verify: ${this._extractErrorMessage(t)}`,bindingContext:e}}finally{this._verificationInProgress=!1}}_closeVerificationModal(){this._showVerificationModal=!1,this._verificationModalResult=null}_openCreateDialog(){const e=this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id);if(e.length>0){this._selectedTargetNodeId=e[0].node_id;const t=ut(e[0]);this._selectedTargetEndpointId=t?.endpoint_id??null}this._showCreateDialog=!0}_closeCreateDialog(){this._showCreateDialog=!1,this._selectedTargetNodeId=null,this._selectedTargetEndpointId=null}_handleCreateDialogTargetNodeChange(e){this._selectedTargetNodeId=e.detail.nodeId;const t=this._nodes.find(e=>e.node_id===this._selectedTargetNodeId);if(t){const e=ut(t);this._selectedTargetEndpointId=e?.endpoint_id??null}}_handleCreateDialogTargetEndpointChange(e){this._selectedTargetEndpointId=e.detail.endpointId}_handleCreateDialogCreateBinding(e){const{targetNodeId:t,targetEndpointId:i,targetGroupId:o,clusterId:r}=e.detail;if(!this._selectedSourceNode||!this._selectedSourceEndpoint)return;if(void 0!==o)return this._showCreateDialog=!1,void this._createGroupBinding(o,r);const n=this._nodes.find(e=>e.node_id===t),s=n?.endpoints.find(e=>e.endpoint_id===i);n&&s?(this._pendingManualBinding={sourceNode:this._selectedSourceNode,sourceEndpoint:this._selectedSourceEndpoint,targetNode:n,targetEndpoint:s,clusterId:r},this._showCreateDialog=!1):this._error="Invalid target selection"}async _createGroupBinding(e,t){if(!this._selectedSourceNode||!this._selectedSourceEndpoint)return;const i=this._selectedSourceNode,o=this._selectedSourceEndpoint;this._operationProgress={title:"Creating groupcast binding",steps:[{label:"Write binding to source",status:"in_progress"},{label:"Provision group key & access on members",status:"pending"}],currentStepIndex:0,canCancel:!1,completed:!1},this._actionInProgress="create-group-binding";let r=null;try{r=await this.hass.connection.subscribeEvents(t=>{const o=t.data;(function(e,t,i){return e.source_node_id===t&&e.group_id===i})(o,i.node_id,e)&&this._updateStepStatus(1,function(e){switch(e){case"failed":return"error";case"success":return"success";default:return"in_progress"}}(o.status),o.message)},"matter_binding_helper_group_progress");const n=await rt(this.hass,i.node_id,o.endpoint_id,t,void 0,void 0,e);if(this._updateStepStatus(0,"success"),n.success){const e=this._operationProgress?.steps??[];e[1]&&"in_progress"===e[1].status&&this._updateStepStatus(1,"success"),this._operationProgress=this._operationProgress?{...this._operationProgress,completed:!0}:null}else this._operationProgress=this._operationProgress?{...this._operationProgress,completed:!0,error:n.message}:null}catch(e){const t=`Failed to create group binding: ${this._extractErrorMessage(e)}`;this._operationProgress=this._operationProgress?{...this._operationProgress,completed:!0,error:t}:null,this._error=t}finally{r&&r(),this._actionInProgress=null}}_handleGroupClick(e){this._manageGroup=e.detail.group}_closeManageGroupDialog(){this._manageGroup=null}async _handleAddMember(e){if(!this._manageGroup)return;const t=this._manageGroup.group_id,{nodeId:i,endpointId:o}=e.detail;this._actionInProgress="group-member";try{await async function(e,t,i,o){return e.callWS({type:`${it}/add_to_group`,group_id:t,node_id:i,endpoint_id:o})}(this.hass,t,i,o),await this._refreshManagedGroup(t)}catch(e){this._error=`Failed to add member: ${this._extractErrorMessage(e)}`}finally{this._actionInProgress=null}}async _handleRemoveMember(e){if(!this._manageGroup)return;const t=this._manageGroup.group_id,{nodeId:i,endpointId:o}=e.detail;this._actionInProgress="group-member";try{await async function(e,t,i,o){return e.callWS({type:`${it}/remove_from_group`,group_id:t,node_id:i,endpoint_id:o})}(this.hass,t,i,o),await this._refreshManagedGroup(t)}catch(e){this._error=`Failed to remove member: ${this._extractErrorMessage(e)}`}finally{this._actionInProgress=null}}async _refreshManagedGroup(e){await this._loadGroups(),this._manageGroup=this._groups.find(t=>t.group_id===e)??null}_openCreateGroupDialog(){this._showCreateGroupDialog=!0}_closeCreateGroupDialog(){this._showCreateGroupDialog=!1}async _handleCreateGroup(e){const{name:t,clusters:i,groupId:o}=e.detail;this._actionInProgress="create-group";try{await async function(e,t,i,o){return e.callWS({type:`${it}/create_group`,name:t,...void 0!==i?{group_id:i}:{},...o&&o.length>0?{clusters:o}:{}})}(this.hass,t,o,i),this._showCreateGroupDialog=!1,await this._loadGroups()}catch(e){this._error=`Failed to create group: ${this._extractErrorMessage(e)}`}finally{this._actionInProgress=null}}async _handleRepairGroups(){const e=new Map;for(const t of this._allBindings)if(null!==t.binding.target_group_id){const i=`${t.binding.node_id}/${t.binding.endpoint_id}`;e.set(i,{nodeId:t.binding.node_id,endpointId:t.binding.endpoint_id})}if(0!==e.size){this._actionInProgress="repair-groups";try{let t=0,i=0;for(const{nodeId:o,endpointId:r}of e.values()){const e=await lt(this.hass,o,r);t+=e.total,i+=e.succeeded}this._error=i===t?`Repaired ${t} groupcast binding(s).`:`Repaired ${i}/${t} groupcast binding(s); some failed (check device availability).`,await this._loadOverviewData()}catch(e){this._error=`Failed to repair groups: ${this._extractErrorMessage(e)}`}finally{this._actionInProgress=null}}else this._error="No groupcast bindings to repair."}_handleDeleteGroup(e){this._pendingDeleteGroup=e.detail.group}_cancelDeleteGroup(){this._pendingDeleteGroup=null}async _confirmDeleteGroup(){const e=this._pendingDeleteGroup;if(e){this._actionInProgress="delete-group";try{await async function(e,t){return e.callWS({type:`${it}/delete_group`,group_id:t})}(this.hass,e.group_id),this._pendingDeleteGroup=null,await this._loadGroups()}catch(e){this._error=`Failed to delete group: ${this._extractErrorMessage(e)}`}finally{this._actionInProgress=null}}}_confirmManualBinding(){if(!this._pendingManualBinding)return;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:o,clusterId:r}=this._pendingManualBinding;this._pendingManualBinding=null,this._startBindingWizard(e,t,i,o,r)}_closeManualBindingConfirmDialog(){this._pendingManualBinding=null}_getNodeName(e){const t=this._nodes.find(t=>t.node_id===e);return t?.name||`Node ${e}`}_getNodeDeviceId(e){const t=this._nodes.find(t=>t.node_id===e);return t?.ha_device_id}_getClusterName(e){return null===e?"Any Cluster":Ue[e]||`Cluster 0x${e.toString(16)}`}async _submitSurvey(){this._surveySubmitting=!0;try{await this.hass.callService("matter_binding_helper","submit_survey",{}),this._surveyResult={success:!0,message:"Survey submitted successfully! Thank you for contributing to Matter device research."}}catch(e){this._surveyResult={success:!1,message:`Failed to submit survey: ${this._extractErrorMessage(e)}`}}finally{this._surveySubmitting=!1}}_closeSurveyResultDialog(){this._surveyResult=null}_renderSurveyResultDialog(){if(!this._surveyResult)return U;const{success:e,message:t}=this._surveyResult;return j`
      <div class="dialog-overlay" @click=${this._closeSurveyResultDialog}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">${e?"✓":"✗"}</span>
            ${e?"Survey Submitted":"Survey Failed"}
          </div>
          <p style="margin: 16px 0; color: var(--primary-text-color);">${t}</p>
          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._closeSurveyResultDialog}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    `}_renderFooter(){return j`
      <div class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-title">Learn More About Matter</div>
            <div class="footer-description">
              Explore community resources and contribute to the growing ecosystem of Matter-enabled smart home devices.
            </div>
          </div>
          <div class="footer-links">
            <a
              href="https://matter-survey.org/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-link"
              title="Browse 3,970+ cataloged Matter devices with ratings and compatibility information"
            >
              Matter Survey Database →
            </a>
            <a
              href="https://csa-iot.org/all-solutions/matter/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-link"
              title="Official Matter specification and documentation"
            >
              Matter Specification →
            </a>
            <a
              href="https://github.com/cedricziel/ha-matter-binding-helper"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-link"
              title="View source code and contribute to this integration"
            >
              GitHub Repository →
            </a>
          </div>
        </div>
      </div>
    `}render(){return j`
      <div class="${this.narrow?"narrow":""}">
        <div class="header">
          <h1>Matter Binding Helper</h1>
          <div style="display: flex; gap: 8px;">
            <button
              class="btn btn-secondary"
              @click=${this._submitSurvey}
              ?disabled=${this._surveySubmitting}
              title="Submit anonymized device data to Matter Survey"
            >
              ${this._surveySubmitting?"Submitting...":"Submit Survey"}
            </button>
            <button
              class="btn btn-primary"
              @click=${this._loadNodes}
              ?disabled=${this._loading}
            >
              Refresh
            </button>
          </div>
        </div>

        ${this._error?j`<div class="error">${this._error}</div>`:U}

        <div class="tabs">
          <button
            class="tab ${"overview"===this._activeTab?"active":""}"
            @click=${()=>{this._activeTab="overview",this._loadOverviewData()}}
          >
            Overview
          </button>
          <button
            class="tab ${"bindings"===this._activeTab?"active":""}"
            @click=${()=>this._activeTab="bindings"}
          >
            Devices
          </button>
          <button
            class="tab ${"groups"===this._activeTab?"active":""}"
            @click=${()=>{this._activeTab="groups",this._loadGroups()}}
          >
            Groups
          </button>
        </div>

        ${"overview"===this._activeTab?this._renderOverviewTab():"bindings"===this._activeTab?this._renderBindingsTab():j`
                <matter-groups-tab
                  .groups=${this._groups}
                  .loading=${this._loading}
                  @group-click=${this._handleGroupClick}
                  @create-group-click=${this._openCreateGroupDialog}
                  @delete-group=${this._handleDeleteGroup}
                  @repair-groups-click=${this._handleRepairGroups}
                ></matter-groups-tab>
              `}
        <matter-create-group-dialog
          .open=${this._showCreateGroupDialog}
          .loading=${null!==this._actionInProgress}
          @create-group=${this._handleCreateGroup}
          @cancel=${this._closeCreateGroupDialog}
        ></matter-create-group-dialog>
        <matter-manage-group-dialog
          .open=${null!==this._manageGroup}
          .group=${this._manageGroup}
          .availableNodes=${this._nodes}
          .loading=${null!==this._actionInProgress}
          @add-member=${this._handleAddMember}
          @remove-member=${this._handleRemoveMember}
          @close=${this._closeManageGroupDialog}
        ></matter-manage-group-dialog>
        ${this._pendingDeleteGroup?j`
              <matter-confirm-dialog
                .open=${!0}
                title="Delete Group"
                icon="🗑️"
                variant="danger"
                confirmLabel="Delete"
                .loading=${null!==this._actionInProgress}
                .message=${`Delete group "${this._pendingDeleteGroup.name}" (ID ${this._pendingDeleteGroup.group_id})? This removes its group key and membership from the fabric. Bindings targeting this group will stop working.`}
                @confirm=${this._confirmDeleteGroup}
                @cancel=${this._cancelDeleteGroup}
              ></matter-confirm-dialog>
            `:U}
        <matter-create-binding-dialog
          .open=${this._showCreateDialog}
          .sourceNode=${this._selectedSourceNode}
          .sourceEndpoint=${this._selectedSourceEndpoint}
          .availableNodes=${this._nodes.filter(e=>e.node_id!==this._selectedSourceNode?.node_id)}
          .availableGroups=${this._groups}
          .selectedTargetNodeId=${this._selectedTargetNodeId}
          .selectedTargetEndpointId=${this._selectedTargetEndpointId}
          .loading=${null!==this._actionInProgress}
          @target-node-change=${this._handleCreateDialogTargetNodeChange}
          @target-endpoint-change=${this._handleCreateDialogTargetEndpointChange}
          @create-binding=${this._handleCreateDialogCreateBinding}
          @cancel=${this._closeCreateDialog}
        ></matter-create-binding-dialog>
        ${this._renderBindingConfirmDialogComponent()}
        ${this._renderManualBindingConfirmDialogComponent()}
        ${this._renderDeleteConfirmDialogComponent()}
        ${this._showVerificationModal?this._renderVerificationModal():U}
        <matter-binding-wizard
          .open=${null!==this._bindingWizard}
          .wizardState=${this._bindingWizard}
          @execute-binding=${this._handleWizardExecuteBinding}
          @execute-acl=${this._handleWizardExecuteAcl}
          @execute-verify=${this._handleWizardExecuteVerify}
          @privilege-change=${this._handleWizardPrivilegeChange}
          @step-change=${this._handleWizardStepChange}
          @close=${this._handleWizardClose}
        ></matter-binding-wizard>
        ${this._showBulkRepairModal?this._renderBulkRepairModal():U}
        <matter-operation-progress-dialog
          .open=${null!==this._operationProgress}
          .progress=${this._operationProgress}
          @close=${this._closeOperationProgress}
          @cancel=${this._cancelOperation}
        ></matter-operation-progress-dialog>
        <matter-create-automation-dialog
          .hass=${this.hass}
          .open=${this._showAutomationDialog}
          .recommendation=${this._pendingAutomationRecommendation}
          @close=${this._closeAutomationDialog}
          @created=${this._handleAutomationCreated}
        ></matter-create-automation-dialog>
        ${this._renderSurveyResultDialog()}
        ${this._renderFooter()}
      </div>
    `}_renderOverviewTab(){return j`
      <div class="overview-content">
        ${this._overviewLoading?j`<div class="loading">Loading bindings...</div>`:j`
              ${this._renderEstablishedBindings()}
              ${this._renderRecommendedBindings()}
              ${this._renderRecommendedAutomations()}
            `}
      </div>
    `}_renderEstablishedBindings(){const e=this._allBindings.filter(e=>{if(null!==e.binding.target_group_id)return!1;return!this._checkBindingACL(e.binding,e.sourceNode.node_id).hasPermission});return j`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this._allBindings.length}</span>
          ${e.length>0?j`
            <button
              class="btn btn-small btn-repair ${this._bulkRepairInProgress?"btn-loading":""}"
              ?disabled=${this._bulkRepairInProgress}
              @click=${this._repairAllACLs}
              title="Repair ACL permissions for all bindings"
            >
              ${this._bulkRepairInProgress?"Repairing...":`🔧 Repair All (${e.length})`}
            </button>
          `:U}
        </div>
        ${0===this._allBindings.length?j`<div class="empty-state">No bindings configured yet.</div>`:j`
              <div class="binding-list">
                ${this._allBindings.map(e=>this._renderEstablishedBindingRow(e))}
              </div>
            `}
      </div>
    `}_renderEstablishedBindingRow(e){const{binding:t,sourceNode:i,sourceEndpoint:o,targetNode:r}=e,n=r?.name||`Node ${t.target_node_id}`,s=null!==t.target_group_id,a=Ke(t.cluster_id),d=s?{hasPermission:!0}:this._checkBindingACL(t,i.node_id);return j`
      <div class="overview-binding-row readable ${d.hasPermission?"":"binding-missing-acl"}">
        <div class="binding-description">
          <div class="binding-sentence">
            ${d.hasPermission?U:j`<span class="acl-warning" title="${d.reason||"Missing ACL permission"}">⚠️</span>`}
            <strong
              class="${i.ha_device_id?"device-link":""}"
              @click=${i.ha_device_id?()=>this._navigateToDevice(i.ha_device_id):U}
            >${i.name}</strong>
            <span class="binding-action">${a.action}</span>
            <strong
              class="${!s&&r?.ha_device_id?"device-link":""}"
              @click=${!s&&r?.ha_device_id?()=>this._navigateToDevice(r.ha_device_id):U}
            >${s?`Group ${t.target_group_id}`:n}</strong>
          </div>
          <div class="binding-meta">
            #${i.node_id} EP ${o.endpoint_id} → ${s?"Group":`#${t.target_node_id} EP ${t.target_endpoint_id}`}
            ${i.area_name?j` · ${i.area_name}`:U}
            ${d.hasPermission?U:j`<span class="acl-warning-text"> · ${d.reason}</span>`}
          </div>
        </div>
        <div class="binding-actions">
          ${d.hasPermission||s?U:j`
            <span
              class="repair-icon ${this._aclRepairInProgress.get(`${i.node_id}-${o.endpoint_id}-${t.target_node_id}-${t.cluster_id}`)?"loading":""}"
              title="Repair ACL permissions"
              @click=${()=>this._repairBindingACL(e)}
            >
              ${this._aclRepairInProgress.get(`${i.node_id}-${o.endpoint_id}-${t.target_node_id}-${t.cluster_id}`)?"⏳":"🔧"}
            </span>
          `}
          <button
            class="btn-icon verify"
            title="Verify binding on device"
            ?disabled=${this._verificationInProgress||null!==this._actionInProgress}
            @click=${()=>this._verifyBindingWithModal(e)}
          >
            ✓
          </button>
          <button
            class="btn-icon delete"
            title="Delete binding"
            ?disabled=${null!==this._actionInProgress}
            @click=${()=>this._showDeleteConfirmDialog(e)}
          >
            ✕
          </button>
        </div>
      </div>
    `}_renderRecommendedBindings(){const e=this._filterSameAreaOnly?this._recommendations.filter(e=>{const t=e.sourceNode.area_name,i=e.targetNode.area_name;return t&&i&&t===i}):this._recommendations,t=this._recommendations.length-e.length,i=this._filterSameAreaOnly&&this._recommendations.length>0?"No same-area recommendations. Toggle filter to see cross-area bindings.":"No binding recommendations. All compatible endpoints are already bound.";return j`
      <div class="card overview-card">
        <div class="card-header">
          Recommended Bindings
          <span class="count-badge">${e.length}</span>
        </div>
        <div class="filter-controls">
          <label>
            <span class="toggle-switch">
              <input
                type="checkbox"
                ?checked=${this._filterSameAreaOnly}
                @change=${this._toggleAreaFilter}
              />
              <span class="toggle-slider"></span>
            </span>
            Same area only
          </label>
          ${this._filterSameAreaOnly&&t>0?j`<span class="filter-info">(${t} hidden)</span>`:U}
        </div>
        <matter-recommendation-list
          .recommendations=${e}
          .actionInProgress=${null!==this._actionInProgress}
          .hideCard=${!0}
          .emptyMessage=${i}
          @create-binding=${this._handleRecommendationCreateBinding}
          @navigate-device=${this._handleRecommendationNavigateDevice}
        ></matter-recommendation-list>
      </div>
    `}_handleRecommendationCreateBinding(e){this._showBindingConfirmDialog(e.detail.recommendation)}_handleRecommendationNavigateDevice(e){this._navigateToDevice(e.detail.deviceId)}_renderRecommendedAutomations(){return 0===this._automationRecommendations.length?U:j`
      <div class="card overview-card automation-card">
        <div class="card-header">
          <span>💡 Recommended Automations</span>
          <span class="count-badge">${this._automationRecommendations.length}</span>
        </div>
        <div class="automation-intro">
          These device combinations can't use Matter bindings directly, but Home Assistant automations can achieve the same result.
        </div>
        <div class="binding-list">
          ${this._automationRecommendations.map(e=>this._renderAutomationRow(e))}
        </div>
      </div>
    `}_renderAutomationRow(e){const{template:t,sourceNode:i,targetNode:o}=e;return j`
      <div class="overview-binding-row automation readable">
        <div class="binding-description">
          <div class="automation-title">
            <span class="automation-icon">${t.icon}</span>
            <strong
              class="${i.ha_device_id?"device-link":""}"
              @click=${i.ha_device_id?()=>this._navigateToDevice(i.ha_device_id):U}
            >${i.name}</strong> + <strong
              class="${o.ha_device_id?"device-link":""}"
              @click=${o.ha_device_id?()=>this._navigateToDevice(o.ha_device_id):U}
            >${o.name}</strong>
          </div>
          <div class="automation-suggestion">${t.title}</div>
          <div class="automation-why">
            <span class="why-label">Why not a binding?</span> ${t.why}
          </div>
          ${i.area_name?j`<div class="binding-meta">${i.area_name}</div>`:U}
        </div>
        <button
          class="btn btn-small btn-primary"
          @click=${()=>this._openAutomationDialog(e)}
          title="Create this automation in Home Assistant"
        >
          Create Automation
        </button>
      </div>
    `}_openAutomationDialog(e){this._pendingAutomationRecommendation=e,this._showAutomationDialog=!0}_closeAutomationDialog(){this._showAutomationDialog=!1,this._pendingAutomationRecommendation=null}_handleAutomationCreated(){this._closeAutomationDialog()}_toggleAreaFilter(e){const t=e.target;this._filterSameAreaOnly=t.checked}_showDeleteConfirmDialog(e){this._pendingDeleteBinding=e}_closeDeleteConfirmDialog(){this._pendingDeleteBinding=null}async _confirmDeleteBinding(){if(!this._pendingDeleteBinding)return;const e=this._pendingDeleteBinding,{binding:t,sourceNode:i}=e,o=null!==t.target_node_id&&null===t.target_group_id;this._closeDeleteConfirmDialog(),this._operationProgress={title:"Removing Binding",steps:[{label:"Removing binding from device",status:"pending"},...o?[{label:"Cleaning up ACL entry",status:"pending"}]:[]],currentStepIndex:0,canCancel:!1,completed:!1},this._updateStepStatus(0,"in_progress");try{const e=await nt(this.hass,t.node_id,t.endpoint_id,t.target_node_id??void 0,t.target_endpoint_id??void 0,t.target_group_id??void 0);if(!e.success){const t=this._extractErrorMessage(e.message);return this._updateStepStatus(0,"error",t),void(this._operationProgress={...this._operationProgress,completed:!0,error:t})}this._updateStepStatus(0,"success")}catch(e){const t=this._extractErrorMessage(e);return this._updateStepStatus(0,"error",t),void(this._operationProgress={...this._operationProgress,completed:!0,error:t})}if(o&&null!==t.target_node_id&&null!==t.target_endpoint_id){this._updateStepStatus(1,"in_progress");try{const e=await async function(e,t,i,o,r){return e.callWS({type:`${it}/remove_acl`,target_node_id:t,source_node_id:i,...null!=o&&{target_endpoint_id:o},...null!=r&&{cluster_id:r}})}(this.hass,t.target_node_id,i.node_id,t.target_endpoint_id,t.cluster_id);e.success?(this._updateStepStatus(1,"success"),this._targetACLCache=new Map(this._targetACLCache),this._targetACLCache.delete(t.target_node_id)):this._updateStepStatus(1,"error",this._extractErrorMessage(e.message))}catch(e){const t=this._extractErrorMessage(e);this._updateStepStatus(1,"error",t)}}this._operationProgress={...this._operationProgress,completed:!0}}_showBindingConfirmDialog(e){this._pendingBindingRecommendation=e,this._selectedClusterForBinding=e.compatibleClusters[0]}_closeBindingConfirmDialog(){this._pendingBindingRecommendation=null,this._selectedClusterForBinding=null}_handleClusterSelectChange(e){const t=e.target;this._selectedClusterForBinding=parseInt(t.value,10)}_confirmCreateBinding(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:o}=this._pendingBindingRecommendation,r=this._selectedClusterForBinding;this._closeBindingConfirmDialog(),this._startBindingWizard(e,t,i,o,r)}_renderBindingsTab(){return j`
      <div class="content">
        <matter-node-list
          .nodes=${this._nodes}
          .selectedNodeId=${this._selectedSourceNode?.node_id??null}
          .loading=${this._loading}
          @node-selected=${this._handleNodeSelected}
        ></matter-node-list>

        <div class="card device-panel">
          ${this._selectedSourceNode?this._renderDeviceDetails(this._selectedSourceNode):j`
                <div class="empty-state">
                  Select a device to view details and manage bindings.
                </div>
              `}
        </div>
      </div>
    `}_handleNodeSelected(e){this._selectNode(e.detail.node)}_handleBindingCardDelete(e){this._showDeleteConfirmDialog(e.detail.binding)}_handleBindingCardRepairAcl(e){this._repairBindingACL(e.detail.binding)}_handleBindingCardNavigate(e){this._navigateToDevice(e.detail.deviceId)}_handleLoadAcl(e){this._loadACL(e.detail.nodeId)}_handleEndpointSelected(e){e.detail.endpoint.has_binding_cluster&&(this._lastVerificationResult=null,this._selectedSourceEndpoint=e.detail.endpoint,this._loadBindings())}_handleWizardExecuteBinding(){this._executeBindingStep()}_handleWizardExecuteAcl(){this._executeACLStep()}_handleWizardExecuteVerify(){this._executeVerifyStep()}_handleWizardPrivilegeChange(e){this._handlePrivilegeChange(e.detail.privilege)}_handleWizardStepChange(e){this._goToWizardStep(e.detail.step)}_handleWizardClose(){this._closeBindingWizard()}_renderDeviceDetails(e){const t=e.device_info,i=this._getPrimaryDeviceType(e);return e.endpoints.length,j`
      <div class="device-details">
        <div class="device-header">
          <div class="device-title">
            <h2>${e.name}</h2>
            ${e.ha_device_id?j`<a
                  class="device-ha-link"
                  href="/config/devices/device/${e.ha_device_id}"
                  title="View in Home Assistant"
                >↗</a>`:U}
          </div>
          <div class="device-meta">
            ${i?j`<span class="device-type-tag">${i}</span>`:U}
            ${e.area_name?j`<span class="device-area-tag">${e.area_name}</span>`:U}
            ${t?.software_version?j`<span class="device-version">v${t.software_version}</span>`:U}
          </div>
        </div>

        <div class="device-section">
          <matter-endpoint-selector
            .endpoints=${e.endpoints}
            .selectedEndpointId=${this._selectedSourceEndpoint?.endpoint_id??null}
            @endpoint-selected=${this._handleEndpointSelected}
          ></matter-endpoint-selector>
        </div>

        <matter-acl-section
          .node=${e}
          .entries=${this._aclEntries}
          .nodes=${this._nodes}
          .loading=${this._aclLoading}
          @load-acl=${this._handleLoadAcl}
        ></matter-acl-section>

        ${this._renderEntityList(e)}
        ${this._renderDeviceRegistryInfo(e)}
        ${this._renderEveSchedule(e)}
        ${this._renderThermostatSchedule(e)}

        <div class="device-section">
          <div class="section-header">
            Bindings
            ${this._selectedSourceEndpoint?j`
                  <span class="section-context">
                    Endpoint ${this._selectedSourceEndpoint.endpoint_id}
                  </span>
                  <button
                    class="btn btn-small btn-verify ${this._verificationInProgress?"btn-loading":""}"
                    ?disabled=${this._verificationInProgress||null!==this._actionInProgress}
                    @click=${this._verifyBindings}
                    title="Re-read bindings from device to verify"
                  >
                    ${this._verificationInProgress?"":"✓ Verify on Device"}
                  </button>
                  <button
                    class="btn btn-small btn-primary"
                    @click=${this._openCreateDialog}
                  >
                    Add Binding
                  </button>
                `:U}
          </div>
          ${this._lastVerificationResult?j`
                <div class="verification-result ${this._lastVerificationResult.verified?"verified":this._lastVerificationResult.success?"warning":"error"} ${this._lastVerificationResult.error_type?this._getErrorDisplay(this._lastVerificationResult.error_type).cssClass:""}">
                  <span class="verification-icon">
                    ${this._lastVerificationResult.verified?"✓":this._lastVerificationResult.success?"⚠":this._lastVerificationResult.error_type?this._getErrorDisplay(this._lastVerificationResult.error_type).icon:"✗"}
                  </span>
                  <span class="verification-message">${this._extractErrorMessage(this._lastVerificationResult.message)}</span>
                  <button class="verification-dismiss" @click=${()=>this._lastVerificationResult=null}>×</button>
                </div>
              `:U}
          ${this._selectedSourceEndpoint?this._bindings.length>0?j`
                  <div class="binding-list">
                    ${this._bindings.map(e=>{const t=this._getBindingContext(e);if(!t)return U;const i=null!==e.target_group_id,o=i?{hasPermission:!0}:this._checkBindingACL(e,this._selectedSourceNode.node_id),r=`delete-tab-${e.node_id}-${e.endpoint_id}-${e.target_node_id}-${e.target_endpoint_id}`;return j`
                        <matter-binding-card
                          .binding=${t}
                          .aclMissing=${!o.hasPermission}
                          .aclReason=${o.reason||""}
                          .showRepairButton=${!o.hasPermission&&!i}
                          .deleteInProgress=${this._actionInProgress===r}
                          .disabled=${null!==this._actionInProgress}
                          @delete-binding=${this._handleBindingCardDelete}
                          @repair-acl=${this._handleBindingCardRepairAcl}
                          @navigate-device=${this._handleBindingCardNavigate}
                        ></matter-binding-card>
                      `})}
                  </div>
                `:j`
                  <div class="empty-state-small">
                    No bindings configured for this endpoint.
                  </div>
                `:j`
                <div class="empty-state-small">
                  Select an endpoint with binding support to manage bindings.
                </div>
              `}
        </div>
      </div>
    `}_getPrimaryDeviceType(e){const t=e.endpoints.find(e=>1===e.endpoint_id)||e.endpoints.find(e=>e.endpoint_id>0);return t&&t.device_types.length>0?Je(t.device_types[0].id):null}async _loadACL(e){this._aclLoading=!0,this._aclEntries=null;try{const t=await at(this.hass,e);t.success&&(this._aclEntries=t.entries)}catch(e){console.error("Failed to load ACL:",e)}finally{this._aclLoading=!1}}async _loadACLForNode(e){if(!this._targetACLCache.has(e)&&!this._aclLoadingNodes.has(e)){this._aclLoadingNodes=new Set([...this._aclLoadingNodes,e]);try{const t=await at(this.hass,e);t.success&&(this._targetACLCache=new Map([...this._targetACLCache,[e,t.entries]]))}catch(t){console.error(`Failed to load ACL for node ${e}:`,t)}finally{const t=new Set(this._aclLoadingNodes);t.delete(e),this._aclLoadingNodes=t}}}_getBindingContext(e){if(!this._selectedSourceNode||!this._selectedSourceEndpoint)return null;const t=null!==e.target_node_id&&this._nodes.find(t=>t.node_id===e.target_node_id)||null,i=t&&null!==e.target_endpoint_id&&t.endpoints.find(t=>t.endpoint_id===e.target_endpoint_id)||null;return{binding:e,sourceNode:this._selectedSourceNode,sourceEndpoint:this._selectedSourceEndpoint,targetNode:t,targetEndpoint:i}}_checkBindingACL(e,t){const i=e.target_node_id;if(null===i)return{hasPermission:!0,status:"ok"};if(this._aclLoadingNodes.has(i))return{hasPermission:!0,status:"loading"};const o=this._targetACLCache.get(i);if(void 0===o)return{hasPermission:!0,status:"unknown",reason:"ACL not loaded"};if(0===o.length)return{hasPermission:!1,status:"missing",reason:"No ACL entries on target"};const r=e.cluster_id,n=null===r||[6,8,768,513,514].includes(r)?3:1,s=3===n?"Operate":"View";for(const e of o)if(2===e.auth_mode&&!(e.privilege<n)&&(!(e.subjects.length>0)||e.subjects.includes(t))){if(e.targets.length>0){const t=e.targets.some(e=>null===e.cluster||e.cluster===r);if(!t)continue}return{hasPermission:!0,status:"ok"}}return{hasPermission:!1,status:"missing",reason:`Target missing ${s} permission for source node ${t}`}}_getErrorDisplay(e){switch(e){case"permission_denied":return{icon:"🔒",cssClass:"error-permission"};case"device_unavailable":return{icon:"📴",cssClass:"error-unavailable"};case"device_timeout":return{icon:"⏱️",cssClass:"error-timeout"};case"device_rejected":return{icon:"🚫",cssClass:"error-rejected"};case"invalid_request":return{icon:"⚠️",cssClass:"error-invalid"};default:return{icon:"❌",cssClass:"error-unknown"}}}_renderEntityList(e){const t=e.entities||[];if(0===t.length)return U;const i={light:"💡",switch:"🔌",event:"🔘",sensor:"📊",binary_sensor:"⚡",climate:"🌡️",cover:"🪟",fan:"💨",lock:"🔒",button:"⏺️"};return j`
      <div class="device-section">
        <div class="section-header">Home Assistant Entities</div>
        <div class="entity-chips">
          ${t.filter(e=>!e.disabled).map(e=>j`
                <button
                  class="entity-chip"
                  @click=${t=>{t.stopPropagation(),this._openEntityMoreInfo(e.entity_id)}}
                >
                  <span class="domain-icon">${i[e.domain]||"📦"}</span>
                  <span>${e.name||e.entity_id}</span>
                </button>
              `)}
        </div>
      </div>
    `}_openEntityMoreInfo(e){const t=new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}_getMatchingDeviceDefinition(e){const t=e.device_info?.vendor_id;if(!t)return;const i=new Set,o=new Set;for(const t of e.endpoints){for(const e of t.server_clusters||[])i.add(e);for(const e of t.device_types)o.add(e.id)}return ke(t,Array.from(i),Array.from(o))}_renderDeviceRegistryInfo(e){const t=this._getMatchingDeviceDefinition(e);if(!t)return U;const i=t.extends&&t.extends.length>0;return j`
      <div class="device-section registry-info">
        <div class="section-header">
          Device Database
          <span class="registry-badge">Matched</span>
        </div>
        <div class="registry-details">
          <div class="registry-model">
            <strong>${t.vendor}</strong> ${t.model}
          </div>
          ${t.description?j`<div class="registry-description">${t.description}</div>`:U}
          ${i?j`
                <div class="registry-features">
                  <span class="feature-label">Features:</span>
                  ${t.extends.map(e=>j`<span class="feature-tag">${e.name}</span>`)}
                </div>
              `:U}
          ${t.productUrl?j`
                <a
                  class="registry-link"
                  href="${t.productUrl}"
                  target="_blank"
                  rel="noopener"
                >
                  Product Page ↗
                </a>
              `:U}
        </div>
      </div>
    `}_navigateToDevice(e){e&&(history.pushState(null,"",`/config/devices/device/${e}`),window.dispatchEvent(new CustomEvent("location-changed")))}_renderBindingConfirmDialogComponent(){if(!this._pendingBindingRecommendation||!this._selectedClusterForBinding)return U;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:o,compatibleClusters:r}=this._pendingBindingRecommendation,n=this._selectedClusterForBinding,s=Ke(n);return j`
      <matter-confirm-dialog
        .open=${!0}
        title="Create Binding"
        icon="🔗"
        confirmLabel="Create Binding"
        .loading=${null!==this._actionInProgress}
        @confirm=${this._confirmCreateBinding}
        @cancel=${this._closeBindingConfirmDialog}
      >
        <div class="binding-devices">
          <div class="binding-device-card source">
            <div class="binding-device-name">${e.name}</div>
            <div class="binding-device-endpoint">Endpoint ${t.endpoint_id}</div>
            ${e.area_name?j`<div class="binding-device-area">${e.area_name}</div>`:U}
          </div>
          <div class="binding-arrow-container">
            <span class="binding-cluster-label">${qe(n)}</span>
            <span class="binding-arrow-large">→</span>
          </div>
          <div class="binding-device-card target">
            <div class="binding-device-name">${i.name}</div>
            <div class="binding-device-endpoint">Endpoint ${o.endpoint_id}</div>
            ${i.area_name?j`<div class="binding-device-area">${i.area_name}</div>`:U}
          </div>
        </div>

        <div class="binding-explanation">
          <div class="binding-explanation-header">What this binding does:</div>
          <div class="binding-explanation-content">
            <strong>${e.name}</strong> will ${s.action}
            <strong>${i.name}</strong> using ${s.dataType}.
          </div>
        </div>

        ${r.length>1?j`
              <div class="cluster-select-group">
                <label>Select cluster to bind:</label>
                <select
                  class="form-select"
                  @change=${this._handleClusterSelectChange}
                >
                  ${r.map(e=>j`
                      <option value=${e} ?selected=${e===n}>
                        ${qe(e)} - ${Ke(e).dataType}
                      </option>
                    `)}
                </select>
              </div>
            `:U}
      </matter-confirm-dialog>
    `}_renderManualBindingConfirmDialogComponent(){if(!this._pendingManualBinding)return U;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:o,clusterId:r}=this._pendingManualBinding,n=Ke(r);return j`
      <matter-confirm-dialog
        .open=${!0}
        title="Create Binding"
        icon="🔗"
        confirmLabel="Create Binding"
        .loading=${null!==this._actionInProgress}
        @confirm=${this._confirmManualBinding}
        @cancel=${this._closeManualBindingConfirmDialog}
      >
        <div class="binding-devices">
          <div class="binding-device-card source">
            <div class="binding-device-name">${e.name}</div>
            <div class="binding-device-endpoint">Endpoint ${t.endpoint_id}</div>
            ${e.area_name?j`<div class="binding-device-area">${e.area_name}</div>`:U}
          </div>
          <div class="binding-arrow-container">
            <span class="binding-cluster-label">${qe(r)}</span>
            <span class="binding-arrow-large">→</span>
          </div>
          <div class="binding-device-card target">
            <div class="binding-device-name">${i.name}</div>
            <div class="binding-device-endpoint">Endpoint ${o.endpoint_id}</div>
            ${i.area_name?j`<div class="binding-device-area">${i.area_name}</div>`:U}
          </div>
        </div>

        <div class="binding-explanation">
          <div class="binding-explanation-header">What this binding does:</div>
          <div class="binding-explanation-content">
            <strong>${e.name}</strong> will ${n.action}
            <strong>${i.name}</strong> using ${n.dataType}.
          </div>
        </div>
      </matter-confirm-dialog>
    `}_renderDeleteConfirmDialogComponent(){if(!this._pendingDeleteBinding)return U;const{binding:e,sourceNode:t,sourceEndpoint:i,targetNode:o}=this._pendingDeleteBinding,r=Ke(e.cluster_id),n=o?.name||`Node ${e.target_node_id}`,s=null!==e.target_group_id;return j`
      <matter-confirm-dialog
        .open=${!0}
        title="Remove Binding"
        icon="🗑️"
        variant="danger"
        confirmLabel="Remove Binding"
        .loading=${null!==this._actionInProgress}
        @confirm=${this._confirmDeleteBinding}
        @cancel=${this._closeDeleteConfirmDialog}
      >
        <div class="binding-devices">
          <div class="binding-device-card source">
            <div class="binding-device-name">${t.name}</div>
            <div class="binding-device-endpoint">Endpoint ${i.endpoint_id}</div>
            ${t.area_name?j`<div class="binding-device-area">${t.area_name}</div>`:U}
          </div>
          <div class="binding-arrow-container">
            <span class="binding-cluster-label">${qe(e.cluster_id)}</span>
            <span class="binding-arrow-large" style="text-decoration: line-through; color: var(--error-color);">→</span>
          </div>
          <div class="binding-device-card target">
            ${s?j`<div class="binding-device-name">Group ${e.target_group_id}</div>`:j`
                  <div class="binding-device-name">${n}</div>
                  <div class="binding-device-endpoint">Endpoint ${e.target_endpoint_id}</div>
                  ${o?.area_name?j`<div class="binding-device-area">${o.area_name}</div>`:U}
                `}
          </div>
        </div>

        <div class="binding-explanation" style="border-left: 3px solid var(--error-color);">
          <div class="binding-explanation-header">After removing this binding:</div>
          <div class="binding-explanation-content">
            <strong>${t.name}</strong> will stop being able to ${r.action}
            <strong>${s?`Group ${e.target_group_id}`:n}</strong>.
          </div>
        </div>
      </matter-confirm-dialog>
    `}_renderVerificationModal(){const e=this._verificationModalResult,t=e?.bindingContext,i=this._verificationInProgress;return j`
      <div class="dialog-overlay" @click=${this._closeVerificationModal}>
        <div class="dialog confirm-dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">${i?"⏳":e?.verified?"✅":e?.success?"⚠️":"❌"}</span>
            Binding Verification
          </div>

          ${i?j`
                <div class="verification-loading">
                  <div class="loading-spinner"></div>
                  <p>Reading bindings from device...</p>
                </div>
              `:e?j`
                  <div class="verification-modal-result ${e.verified?"verified":e.success?"warning":"error"}">
                    <div class="verification-status-icon">
                      ${e.verified?"✓":e.success?"⚠":"✗"}
                    </div>
                    <div class="verification-status-text">
                      ${e.verified?"Binding Verified":e.success?"Verification Warning":"Verification Failed"}
                    </div>
                  </div>

                  <div class="verification-details">
                    <p class="verification-message">${this._extractErrorMessage(e.message)}</p>

                    ${t?j`
                          <div class="verification-binding-info">
                            <strong>${t.sourceNode.name}</strong>
                            <span class="binding-action">${Ke(t.binding.cluster_id).action}</span>
                            <strong>${t.targetNode?.name||`Node ${t.binding.target_node_id}`}</strong>
                          </div>
                        `:U}

                    ${!e.verified&&e.success?j`
                          <div class="verification-help">
                            <strong>What this means:</strong>
                            <p>The binding data was written, but could not be confirmed on the device. This might happen if:</p>
                            <ul>
                              <li>The device rejected the binding due to ACL restrictions</li>
                              <li>The device doesn't support this binding type</li>
                              <li>The device is temporarily unavailable</li>
                            </ul>
                          </div>
                        `:U}
                  </div>
                `:U}

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._closeVerificationModal}
              ?disabled=${i}
            >
              ${i?"Verifying...":"Close"}
            </button>
          </div>
        </div>
      </div>
    `}_startBindingWizard(e,t,i,o,r){this._bindingWizard={currentStep:"binding",sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:o,clusterId:r,selectedPrivilege:mt(r),bindingInProgress:!1,aclInProgress:!1,verifyInProgress:!1}}_closeBindingWizard(){this._bindingWizard=null,this._loadOverviewData()}_goToWizardStep(e){this._bindingWizard&&(this._bindingWizard={...this._bindingWizard,currentStep:e})}_handlePrivilegeChange(e){this._bindingWizard&&(this._bindingWizard={...this._bindingWizard,selectedPrivilege:e})}async _executeBindingStep(){if(!this._bindingWizard)return;const{sourceNode:e,sourceEndpoint:t,targetNode:i,targetEndpoint:o,clusterId:r}=this._bindingWizard;this._bindingWizard={...this._bindingWizard,bindingInProgress:!0};try{const n=await rt(this.hass,e.node_id,t.endpoint_id,r,i.node_id,o.endpoint_id,void 0,!0,!1);this._bindingWizard={...this._bindingWizard,bindingResult:n,bindingInProgress:!1},n.success&&this._goToWizardStep("acl")}catch(e){this._bindingWizard={...this._bindingWizard,bindingResult:{success:!1,verified:!1,message:`Failed to create binding: ${this._extractErrorMessage(e)}`,bindings_found:0,error_type:"unknown_error"},bindingInProgress:!1}}}async _executeACLStep(){if(!this._bindingWizard)return;const{sourceNode:e,targetNode:t,targetEndpoint:i,clusterId:o}=this._bindingWizard;this._bindingWizard={...this._bindingWizard,aclInProgress:!0,aclProgress:void 0};let r=null;try{r=await this.hass.connection.subscribeEvents(i=>{const o=i.data;o.target_node_id===t.node_id&&o.source_node_id===e.node_id&&(this._bindingWizard={...this._bindingWizard,aclProgress:o})},"matter_binding_helper_acl_progress")}catch(e){console.warn("Failed to subscribe to ACL progress events:",e)}try{const r=await dt(this.hass,t.node_id,i.endpoint_id,e.node_id,o);this._bindingWizard={...this._bindingWizard,aclResult:r,aclInProgress:!1,aclProgress:void 0},r.success&&this._goToWizardStep("verify")}catch(e){this._bindingWizard={...this._bindingWizard,aclResult:{success:!1,message:`Failed to provision ACL: ${this._extractErrorMessage(e)}`,acl_entries_count:0},aclInProgress:!1,aclProgress:void 0}}finally{r&&r()}}async _executeVerifyStep(){if(!this._bindingWizard)return;const{sourceNode:e,sourceEndpoint:t}=this._bindingWizard;this._bindingWizard={...this._bindingWizard,verifyInProgress:!0};try{const i=await st(this.hass,e.node_id,t.endpoint_id);this._bindingWizard={...this._bindingWizard,verifyResult:i,verifyInProgress:!1}}catch(e){this._bindingWizard={...this._bindingWizard,verifyResult:{success:!1,verified:!1,message:`Failed to verify bindings: ${this._extractErrorMessage(e)}`,bindings_found:0,error_type:"unknown_error"},verifyInProgress:!1}}}async _repairBindingACL(e){if(null===e.binding.target_node_id||null===e.binding.target_endpoint_id)return;const t=e.binding.target_node_id,i=e.binding.target_endpoint_id,o=this._nodes.find(e=>e.node_id===t),r=o?.name||`Node ${t}`;this._operationProgress={title:"Repairing ACL Permission",steps:[{label:`Provisioning ACL on ${r}`,status:"pending"}],currentStepIndex:0,canCancel:!1,completed:!1},this._updateStepStatus(0,"in_progress");try{const o=await dt(this.hass,t,i,e.sourceNode.node_id,e.binding.cluster_id);if(!o.success){const e=this._extractErrorMessage(o.message);return this._updateStepStatus(0,"error",e),void(this._operationProgress={...this._operationProgress,completed:!0,error:e})}this._updateStepStatus(0,"success"),this._targetACLCache=new Map(this._targetACLCache),this._targetACLCache.delete(t)}catch(e){const t=this._extractErrorMessage(e);return this._updateStepStatus(0,"error",t),void(this._operationProgress={...this._operationProgress,completed:!0,error:t})}this._operationProgress={...this._operationProgress,completed:!0}}async _repairAllACLs(){const e=this._allBindings.filter(e=>{if(null!==e.binding.target_group_id)return!1;return!this._checkBindingACL(e.binding,e.sourceNode.node_id).hasPermission});if(0===e.length)return;const t=e.map(e=>{const t=this._nodes.find(t=>t.node_id===e.binding.target_node_id);return{label:`Provisioning ACL on ${t?.name||`Node ${e.binding.target_node_id}`}`,status:"pending"}});this._operationProgress={title:`Repairing ${e.length} ACL Permission${1!==e.length?"s":""}`,steps:t,currentStepIndex:0,canCancel:!0,completed:!1};for(let t=0;t<e.length;t++){if("skipped"===this._operationProgress?.steps[t]?.status)continue;const i=e[t],{binding:o,sourceNode:r}=i;if(null!==o.target_node_id&&null!==o.target_endpoint_id){this._updateStepStatus(t,"in_progress");try{const e=await dt(this.hass,o.target_node_id,o.target_endpoint_id,r.node_id,o.cluster_id);e.success?this._updateStepStatus(t,"success"):this._updateStepStatus(t,"error",this._extractErrorMessage(e.message))}catch(e){const i=this._extractErrorMessage(e);this._updateStepStatus(t,"error",i)}}else this._updateStepStatus(t,"skipped","Invalid binding")}this._targetACLCache=new Map,this._operationProgress={...this._operationProgress,completed:!0,canCancel:!1}}_closeBulkRepairModal(){this._showBulkRepairModal=!1,this._bulkRepairResult=null}_renderBulkRepairModal(){if(!this._showBulkRepairModal||!this._bulkRepairResult)return U;const e=this._bulkRepairResult,t=e.total-e.succeeded;return j`
      <div class="dialog-overlay" @click=${this._closeBulkRepairModal}>
        <div class="dialog" style="max-width: 500px;" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">ACL Repair Results</div>

          <div class="bulk-repair-summary">
            <div class="bulk-repair-stat">
              <div class="bulk-repair-stat-value">${e.total}</div>
              <div class="bulk-repair-stat-label">Total</div>
            </div>
            <div class="bulk-repair-stat success">
              <div class="bulk-repair-stat-value">${e.succeeded}</div>
              <div class="bulk-repair-stat-label">Succeeded</div>
            </div>
            ${t>0?j`
              <div class="bulk-repair-stat failed">
                <div class="bulk-repair-stat-value">${t}</div>
                <div class="bulk-repair-stat-label">Failed</div>
              </div>
            `:U}
          </div>

          ${e.results.length>0?j`
            <div class="bulk-repair-results">
              ${e.results.map(e=>{const t=this._nodes.find(t=>t.node_id===e.target_node_id);return j`
                  <div class="bulk-repair-item">
                    <span class="bulk-repair-item-icon ${e.success?"success":"failed"}">
                      ${e.success?"✓":"✗"}
                    </span>
                    <span>
                      ${t?.name||`Node ${e.target_node_id}`}
                      (EP ${e.target_endpoint_id}, Cluster ${qe(e.cluster_id)})
                      ${e.success?U:j`<br><small style="color: var(--error-color);">${this._extractErrorMessage(e.message)}</small>`}
                    </span>
                  </div>
                `})}
            </div>
          `:j`
            <div style="text-align: center; padding: 16px; color: var(--secondary-text-color);">
              No bindings found to repair.
            </div>
          `}

          <div class="dialog-actions">
            <button type="button" class="btn btn-primary" @click=${this._closeBulkRepairModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    `}};ri.styles=[...ti,...ii,...oi,...Ht,...$t,...Et,...Rt],e([pe({attribute:!1})],ri.prototype,"hass",void 0),e([pe({type:Boolean})],ri.prototype,"narrow",void 0),e([ge()],ri.prototype,"_nodes",void 0),e([ge()],ri.prototype,"_selectedSourceNode",void 0),e([ge()],ri.prototype,"_selectedSourceEndpoint",void 0),e([ge()],ri.prototype,"_bindings",void 0),e([ge()],ri.prototype,"_groups",void 0),e([ge()],ri.prototype,"_loading",void 0),e([ge()],ri.prototype,"_error",void 0),e([ge()],ri.prototype,"_activeTab",void 0),e([ge()],ri.prototype,"_showCreateDialog",void 0),e([ge()],ri.prototype,"_showCreateGroupDialog",void 0),e([ge()],ri.prototype,"_manageGroup",void 0),e([ge()],ri.prototype,"_pendingDeleteGroup",void 0),e([ge()],ri.prototype,"_allBindings",void 0),e([ge()],ri.prototype,"_recommendations",void 0),e([ge()],ri.prototype,"_overviewLoading",void 0),e([ge()],ri.prototype,"_surveySubmitting",void 0),e([ge()],ri.prototype,"_surveyResult",void 0),e([ge()],ri.prototype,"_selectedTargetNodeId",void 0),e([ge()],ri.prototype,"_selectedTargetEndpointId",void 0),e([ge()],ri.prototype,"_filterSameAreaOnly",void 0),e([ge()],ri.prototype,"_actionInProgress",void 0),e([ge()],ri.prototype,"_pendingBindingRecommendation",void 0),e([ge()],ri.prototype,"_selectedClusterForBinding",void 0),e([ge()],ri.prototype,"_pendingManualBinding",void 0),e([ge()],ri.prototype,"_pendingDeleteBinding",void 0),e([ge()],ri.prototype,"_automationRecommendations",void 0),e([ge()],ri.prototype,"_eveSchedules",void 0),e([ge()],ri.prototype,"_eveScheduleLoading",void 0),e([ge()],ri.prototype,"_verificationInProgress",void 0),e([ge()],ri.prototype,"_lastVerificationResult",void 0),e([ge()],ri.prototype,"_showVerificationModal",void 0),e([ge()],ri.prototype,"_verificationModalResult",void 0),e([ge()],ri.prototype,"_aclLoading",void 0),e([ge()],ri.prototype,"_aclEntries",void 0),e([ge()],ri.prototype,"_targetACLCache",void 0),e([ge()],ri.prototype,"_aclLoadingNodes",void 0),e([ge()],ri.prototype,"_bindingWizard",void 0),e([ge()],ri.prototype,"_aclRepairInProgress",void 0),e([ge()],ri.prototype,"_bulkRepairInProgress",void 0),e([ge()],ri.prototype,"_bulkRepairResult",void 0),e([ge()],ri.prototype,"_showBulkRepairModal",void 0),e([ge()],ri.prototype,"_operationProgress",void 0),e([ge()],ri.prototype,"_showAutomationDialog",void 0),e([ge()],ri.prototype,"_pendingAutomationRecommendation",void 0),ri=e([de("matter-binding-helper-panel")],ri);export{ri as MatterBindingPanel};
