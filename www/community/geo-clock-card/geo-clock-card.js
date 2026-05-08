function t(t,e,i,s){var o,n=arguments.length,r=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(r=(n<3?o(r):n>3?o(e,i,r):o(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:h,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,m=f.trustedTypes,g=m?m.emptyScript:"",v=f.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},w=(t,e)=>!h(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:w};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);o?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=s;const n=o.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const n=this.constructor;if(!1===s&&(o=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??w)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[y("elementProperties")]=new Map,_[y("finalized")]=new Map,v?.({ReactiveElement:_}),(f.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z=globalThis,A=t=>t,x=z.trustedTypes,T=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,k="?"+S,E=`<${k}>`,P=document,M=()=>P.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,I="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,L=/>/g,H=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,R=/"/g,j=/^(?:script|style|textarea|title)$/i,F=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),V=F(1),Z=F(2),W=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),G=new WeakMap,J=P.createTreeWalker(P,129);function Y(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(e):e}const K=(t,e)=>{const i=t.length-1,s=[];let o,n=2===e?"<svg>":3===e?"<math>":"",r=N;for(let e=0;e<i;e++){const i=t[e];let a,h,l=-1,c=0;for(;c<i.length&&(r.lastIndex=c,h=r.exec(i),null!==h);)c=r.lastIndex,r===N?"!--"===h[1]?r=D:void 0!==h[1]?r=L:void 0!==h[2]?(j.test(h[2])&&(o=RegExp("</"+h[2],"g")),r=H):void 0!==h[3]&&(r=H):r===H?">"===h[0]?(r=o??N,l=-1):void 0===h[1]?l=-2:(l=r.lastIndex-h[2].length,a=h[1],r=void 0===h[3]?H:'"'===h[3]?R:B):r===R||r===B?r=H:r===D||r===L?r=N:(r=H,o=void 0);const d=r===H&&t[e+1].startsWith("/>")?" ":"";n+=r===N?i+E:l>=0?(s.push(a),i.slice(0,l)+C+i.slice(l)+S+d):i+S+(-2===l?e:d)}return[Y(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class X{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,n=0;const r=t.length-1,a=this.parts,[h,l]=K(t,e);if(this.el=X.createElement(h,i),J.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=J.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=l[n++],i=s.getAttribute(t).split(S),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:r[2],strings:i,ctor:"."===r[1]?st:"?"===r[1]?ot:"@"===r[1]?nt:it}),s.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(S),e=t.length-1;if(e>0){s.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],M()),J.nextNode(),a.push({type:2,index:++o});s.append(t[e],M())}}}else if(8===s.nodeType)if(s.data===k)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(S,t+1));)a.push({type:7,index:o}),t+=S.length-1}o++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===W)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const n=U(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=Q(t,o._$AS(t,e.values),o,s)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??P).importNode(e,!0);J.currentNode=s;let o=J.nextNode(),n=0,r=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new et(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new rt(o,this,t)),this._$AV.push(e),a=i[++r]}n!==a?.index&&(o=J.nextNode(),n++)}return J.currentNode=P,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),U(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=X.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new tt(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new X(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new et(this.O(M()),this.O(M()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,s){const o=this.strings;let n=!1;if(void 0===o)t=Q(this,t,e,0),n=!U(t)||t!==this._$AH&&t!==W,n&&(this._$AH=t);else{const s=t;let r,a;for(t=o[0],r=0;r<o.length-1;r++)a=Q(this,s[i+r],e,r),a===W&&(a=this._$AH[r]),n||=!U(a)||a!==this._$AH[r],a===q?t=q:t!==q&&(t+=(a??"")+o[r+1]),this._$AH[r]=a}n&&!s&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class ot extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class nt extends it{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??q)===W)return;const i=this._$AH,s=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=z.litHtmlPolyfillSupport;at?.(X,et),(z.litHtmlVersions??=[]).push("3.3.2");const ht=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class lt extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new et(e.insertBefore(M(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}lt._$litElement$=!0,lt.finalized=!0,ht.litElementHydrateSupport?.({LitElement:lt});const ct=ht.litElementPolyfillSupport;ct?.({LitElement:lt}),(ht.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:w},ut=(t=pt,e,i)=>{const{kind:s,metadata:o}=i;let n=globalThis.litPropertyMetadata.get(o);if(void 0===n&&globalThis.litPropertyMetadata.set(o,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ft(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function mt(t){return ft({...t,state:!0,attribute:!1})}const gt=Math.PI/180,vt=180/Math.PI,yt=Date.UTC(2e3,0,1,12,0,0),$t=t=>((t+180)%360+360)%360-180;function wt(t){const e=(t.getTime()-yt)/864e5,i=280.46+.9856474*e,s=(357.528+.9856003*e)*gt,o=(i+1.915*Math.sin(s)+.02*Math.sin(2*s))*gt,n=(23.439-4e-7*e)*gt,r=Math.asin(Math.sin(n)*Math.sin(o))*vt,a=Math.atan2(Math.cos(n)*Math.sin(o),Math.cos(o))*vt,h=$t(i-a),l=t.getUTCHours()+t.getUTCMinutes()/60+t.getUTCSeconds()/3600+t.getUTCMilliseconds()/36e5;return{lat:r,lon:$t(-15*(l-12)-h)}}const bt=Math.PI/180,_t=180/Math.PI,zt=1e-4;function At(t,e={}){const i=e.stepDeg??1,s=(e.centerLon??180)-180;let o=t.lat;Math.abs(o)<zt&&(o=o>=0?zt:-1e-4);const n=Math.tan(o*bt),r=[];for(let e=0;e<=360;e+=i){const i=(s+e-t.lon)*bt,o=Math.atan(-Math.cos(i)/n)*_t;r.push([e,o])}return r}function xt(t,e,i){const s=[];for(const[o,n]of t){const t=o/360*e,r=(90-n)/180*i;s.push(`${t.toFixed(2)},${r.toFixed(2)}`)}return s.join(" ")}const Tt=44;let Ct=null,St=null;function kt(t,e,i,s=180){if(t.length<3)return"";const o=s-180,n=[];let r=null,a=1/0,h=-1/0;for(const[s,l]of t){let t=((s-o)%360+360)%360;if(null!==r){for(;t-r>180;)t-=360;for(;t-r<-180;)t+=360}r=t;const c=t/360*e,d=(90-l)/180*i;n.push([c,d]),c<a&&(a=c),c>h&&(h=c)}const l=n,c=t=>{let e="";for(let i=0;i<l.length;i++){const[s,o]=l[i];e+=`${0===i?"M":"L"}${(s+t).toFixed(1)},${o.toFixed(1)}`}return e+"Z"};let d=c(0);return h>e&&(d+=c(-e)),a<0&&(d+=c(e)),d}function Et(t){const e=t.split("/");return e.length<2?t:e[e.length-1].replace(/_/g," ")}const Pt=new Map;function Mt(t,e,i){const s=function(t,e){const i=`${t}|${Array.isArray(e)?e.join(","):""}`;let s=Pt.get(i);return s||(s={time:new Intl.DateTimeFormat(e,{timeZone:t,hour:"numeric",minute:"2-digit",second:"2-digit"}),date:new Intl.DateTimeFormat(e,{timeZone:t,weekday:"short",month:"short",day:"numeric"}),zoneName:new Intl.DateTimeFormat("en-US",{timeZone:t,hour:"numeric",timeZoneName:"long"}),offset:new Intl.DateTimeFormat("en-US",{timeZone:t,timeZoneName:"longOffset"})},Pt.set(i,s)),s}(e,i),o=(t,e)=>t.find(t=>t.type===e)?.value??"",n=s.zoneName.formatToParts(t),r=s.offset.formatToParts(t);return{time:s.time.format(t),date:s.date.format(t),name:o(n,"timeZoneName"),offset:o(r,"timeZoneName").replace(/^GMT/,"UTC")}}let Ut=null,Ot=null;function It(t,e){if(e&&/^UTC[+−\-]\d/.test(e))return e;const i=t>=0?"+":"-",s=Math.abs(t);return`UTC${i}${String(Math.trunc(s)).padStart(2,"0")}:${String(Math.round(60*(s-Math.trunc(s)))).padStart(2,"0")}`}function Nt(t){const e=t.trim();return e.length<=80?e:e.slice(0,77)+"…"}var Dt;const Lt=2048,Ht=1024;let Bt=class extends lt{constructor(){super(...arguments),this.displayNow=new Date,this.mapNow=new Date,this.tzPolygons=null,this.tzIanaPolygons=null,this.tzPolygonsCenterLon=null,this.tzData=null,this.tzIanaData=null,this.hoveredIana=null,this.hoveredOffset=null,this.hoverPos=null,this.isCardVisible=!0,this.intersecting=!0,this.onIanaEnter=(t,e)=>{this.clearDismissTimer(),this.hoveredIana=e,this.updateHoverPos(t)},this.onIanaLeave=t=>{"touch"!==t.pointerType?(this.hoveredIana=null,this.hoveredOffset||(this.hoverPos=null)):this.scheduleTouchDismiss(()=>{this.hoveredIana=null,this.hoveredOffset||(this.hoverPos=null)})},this.onOffsetEnter=(t,e)=>{this.clearDismissTimer(),this.hoveredOffset=e,this.updateHoverPos(t)},this.onOffsetLeave=t=>{"touch"!==t.pointerType?(this.hoveredOffset=null,this.hoveredIana||(this.hoverPos=null)):this.scheduleTouchDismiss(()=>{this.hoveredOffset=null,this.hoveredIana||(this.hoverPos=null)})},this.onZoneMove=t=>{this.updateHoverPos(t)}}static{Dt=this}static{this.styles=r`
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
    /* Home marker — small filled dot at hass.config lat/lon. */
    .home-marker-dot {
      fill: var(--geo-home-marker);
      stroke: rgba(0, 0, 0, 0.6);
      stroke-width: 1.2;
      pointer-events: none;
    }
    .home-marker-halo {
      fill: var(--geo-home-marker);
      opacity: 0.25;
      pointer-events: none;
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
  `}setConfig(t){if(!t)throw new Error("geo-clock-card: missing config");const e=t.imageryBase??new URL(".",import.meta.url).href,i=function(t){if(null==t)return;const e=t instanceof Date?t:new Date(t);return Number.isFinite(e.getTime())?e:void 0}(t.now);this.config={twilightDegrees:Rt(t.twilightDegrees??8,1,18),updateInterval:Rt(t.updateInterval??1,1,600),showUTC:t.showUTC??!0,showTimezoneBand:t.showTimezoneBand??!0,showTimezoneBoundaries:t.showTimezoneBoundaries??!0,showTimezonePopup:t.showTimezonePopup??!0,timezoneLineColor:jt(t.timezoneLineColor)??"rgba(255, 255, 255, 0.18)",dayBrightness:Rt(t.dayBrightness??1.15,0,5),nightContrast:Rt(t.nightContrast??1,0,5),twilightColor:jt(t.twilightColor)??"#463701",twilightOpacity:Rt(t.twilightOpacity??.26,0,1),imageryBase:e.endsWith("/")?e:e+"/",center:t.center??"sun",centerLongitude:"number"==typeof t.centerLongitude?Rt(t.centerLongitude,-180,180):void 0,centerEntity:t.centerEntity,showHomeMarker:t.showHomeMarker??!1,frozenNow:i};const s=i??new Date;this.displayNow=s,this.mapNow=s,this.tzPolygons=null,this.tzIanaPolygons=null,this.tzPolygonsCenterLon=null,this.restartTimer(),this.maybeLoadTimezones(),this.maybeLoadIanaTimezones()}connectedCallback(){if(super.connectedCallback(),!this.config?.frozenNow){const t=new Date;this.displayNow=t,this.mapNow=t}this.attachVisibilityObservers(),this.restartTimer(),this.maybeLoadTimezones(),this.maybeLoadIanaTimezones()}disconnectedCallback(){super.disconnectedCallback(),this.stopTimer(),this.clearDismissTimer(),this.detachVisibilityObservers()}attachVisibilityObservers(){"undefined"==typeof IntersectionObserver||this.intersectionObserver||(this.intersectionObserver=new IntersectionObserver(t=>{const e=t[t.length-1];this.intersecting=!e||e.isIntersecting,this.recomputeVisibility()},{threshold:0}),this.intersectionObserver.observe(this)),"undefined"==typeof document||this.onTabVisibility||(this.onTabVisibility=()=>this.recomputeVisibility(),document.addEventListener("visibilitychange",this.onTabVisibility))}detachVisibilityObservers(){this.intersectionObserver?.disconnect(),this.intersectionObserver=void 0,this.onTabVisibility&&"undefined"!=typeof document&&document.removeEventListener("visibilitychange",this.onTabVisibility),this.onTabVisibility=void 0}recomputeVisibility(){const t="undefined"==typeof document||"hidden"!==document.visibilityState,e=this.intersecting&&t;if(e!==this.isCardVisible){if(this.isCardVisible=e,e){const t=new Date;this.displayNow=t,this.mapNow=t}this.restartTimer()}}restartTimer(){if(this.stopTimer(),!this.config||!this.isConnected)return;if(this.config.frozenNow)return;const t=this.isCardVisible?1e3*this.config.updateInterval:18e5;this.timer=setInterval(()=>this.tick(),t)}tick(){const t=new Date;this.displayNow=t,t.getTime()-this.mapNow.getTime()>=10546.875&&(this.mapNow=t)}stopTimer(){void 0!==this.timer&&(clearInterval(this.timer),this.timer=void 0)}maybeLoadTimezones(){if(!this.config?.showTimezoneBoundaries||null!==this.tzData)return;(function(t){return Ut&&Ot===t||(Ot=t,Ut=fetch(t).then(t=>{if(!t.ok)throw new Error(`tz fetch failed: ${t.status}`);return t.json()})),Ut})(this.config.imageryBase+"timezones.json").then(t=>{this.tzData=t,this.requestUpdate()}).catch(t=>{console.warn("geo-clock-card: timezone overlay failed to load:",t)})}maybeLoadIanaTimezones(){if(!this.config?.showTimezoneBoundaries||null!==this.tzIanaData)return;(function(t){return Ct&&St===t||(St=t,Ct=fetch(t).then(t=>{if(!t.ok)throw new Error(`iana tz fetch failed: ${t.status}`);return t.json()})),Ct})(this.config.imageryBase+"timezones-iana.json").then(t=>{this.tzIanaData=t,this.requestUpdate()}).catch(t=>{console.warn("geo-clock-card: IANA timezone overlay failed to load:",t)})}resolveCenterLon(t){if(!this.config)return wt(t).lon;switch(this.config.center){case"home":{const e=this.hass?.config?.longitude;return"number"==typeof e?e:wt(t).lon}case"longitude":return"number"==typeof this.config.centerLongitude?this.config.centerLongitude:wt(t).lon;case"entity":{const e=this.config.centerEntity,i=e?this.hass?.states?.[e]?.attributes?.longitude:void 0;return"number"==typeof i?i:wt(t).lon}default:return wt(t).lon}}resolveHomeLatLon(){const t=this.hass?.config?.latitude,e=this.hass?.config?.longitude;return"number"!=typeof t||"number"!=typeof e?null:{lat:t,lon:e}}render(){if(!this.config)return V``;const t=this.config.frozenNow??this.mapNow,e=this.config.frozenNow??this.displayNow,i=this.resolveCenterLon(t),s=wt(t),o=At(s,{centerLon:i}),n=function(t,e={}){const i=At(t,e);let s=t.lat;Math.abs(s)<zt&&(s=s>=0?zt:-1e-4);const o=s>0?-90:90;return[...i,[360,o],[0,o]]}(s,{centerLon:i}),r=xt(n,Lt,Ht),a=xt(o,Lt,Ht),h=2*this.config.twilightDegrees*Ht/180,l=Math.max(.5,h/8),c=Math.max(4,.55*h),d=Math.max(1,h/5),p=this.config.imageryBase+function(t){const e=t.getUTCDate();let i,s=t.getUTCMonth()+1;return e<8?i="start":e<23?i="mid":(i="start",s=12===s?1:s+1),`blue-marble-${String(s).padStart(2,"0")}-${i}-2048.jpg`}(t),u=this.config.imageryBase+"black-marble-2048.jpg",f=(-i/360*Lt%Lt+Lt)%Lt;if(this.config.showTimezoneBoundaries){const t=this.tzPolygonsCenterLon!==i;this.tzData&&(t||null===this.tzPolygons)&&(this.tzPolygons=function(t,e,i,s=180){const o=[];for(const n of t.features){const t="Polygon"===n.geometry.type?[n.geometry.coordinates]:n.geometry.coordinates;let r="";for(const o of t)0!==o.length&&(r+=kt(o[0],e,i,s));r&&o.push({offset:n.properties.zone,offsetLabel:It(n.properties.zone,n.properties.time_zone),name:n.properties.name??null,places:Nt(n.properties.places??""),d:r})}return o}(this.tzData,Lt,Ht,i)),this.tzIanaData&&(t||null===this.tzIanaPolygons)&&(this.tzIanaPolygons=function(t){const e=t=>{let e=1/0,i=1/0,s=-1/0,o=-1/0;const n=/[ML]([\d.\-]+),([\d.\-]+)/g;let r;for(;r=n.exec(t);){const t=parseFloat(r[1]),n=parseFloat(r[2]);t<e&&(e=t),t>s&&(s=t),n<i&&(i=n),n>o&&(o=n)}return isFinite(e)?(s-e)*(o-i):0};return[...t].sort((t,i)=>e(i.d)-e(t.d))}(function(t,e,i,s=180){const o=[];for(const n of t.features){const t="Polygon"===n.geometry.type?[n.geometry.coordinates]:n.geometry.coordinates;let r="";for(const o of t)0!==o.length&&(r+=kt(o[0],e,i,s));r&&o.push({tzid:n.properties.tzid,cityLabel:Et(n.properties.tzid),d:r})}return o}(this.tzIanaData,Lt,Ht,i))),this.tzPolygonsCenterLon=i}const m=function(t){return t.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit",second:"2-digit",timeZoneName:"short"})}(e),g=function(t){const e=String(t.getUTCHours()).padStart(2,"0"),i=String(t.getUTCMinutes()).padStart(2,"0"),s=String(t.getUTCSeconds()).padStart(2,"0");return`${e}:${i}:${s} UTC`}(e),v=function(t){return t.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric",year:"numeric"})}(e),y=this.config.showTimezoneBand,$=y?-44:0,w=y?1068:Ht,b=`aspect-ratio: 2048 / ${w}; --geo-day-brightness: ${this.config.dayBrightness}; --geo-night-contrast: ${this.config.nightContrast}; --geo-twilight-color: ${this.config.twilightColor}; --geo-twilight-opacity: ${this.config.twilightOpacity}; --geo-tz-line: ${this.config.timezoneLineColor};`;return V`
      <div class="frame" style="${b}">
        <svg
          viewBox="0 ${$} ${Lt} ${w}"
          preserveAspectRatio="xMidYMid slice"
          aria-label="World map with current day/night terminator"
        >
          <defs>
            <filter
              id="feather"
              x="-5%"
              y="-5%"
              width="110%"
              height="110%"
              filterUnits="objectBoundingBox"
            >
              <feGaussianBlur stdDeviation="${l}" />
            </filter>
            <mask
              id="night-mask"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="${Lt}"
              height="${Ht}"
            >
              <rect width="${Lt}" height="${Ht}" fill="black" />
              <polygon points="${r}" fill="white" filter="url(#feather)" />
            </mask>
            <filter
              id="twilight-blur"
              x="-3%"
              y="-3%"
              width="106%"
              height="106%"
              filterUnits="objectBoundingBox"
            >
              <feGaussianBlur stdDeviation="${d}" />
            </filter>
          </defs>

          <image class="day-image" href="${p}"
                 x="${f-Lt}" y="0"
                 width="${Lt}" height="${Ht}"
                 preserveAspectRatio="none"/>
          <image class="day-image" href="${p}"
                 x="${f}" y="0"
                 width="${Lt}" height="${Ht}"
                 preserveAspectRatio="none"/>
          <image class="night-image" href="${u}"
                 x="${f-Lt}" y="0"
                 width="${Lt}" height="${Ht}"
                 preserveAspectRatio="none"
                 mask="url(#night-mask)"/>
          <image class="night-image" href="${u}"
                 x="${f}" y="0"
                 width="${Lt}" height="${Ht}"
                 preserveAspectRatio="none"
                 mask="url(#night-mask)"/>

          <polyline class="twilight-glow"
                    points="${a}"
                    stroke-width="${c}"
                    filter="url(#twilight-blur)"/>

          ${this.tzPolygons&&this.config.showTimezoneBoundaries?this.tzPolygons.map(t=>Z`<path class="tz-region" d="${t.d}"
                                 @pointerenter=${e=>this.onOffsetEnter(e,t)}
                                 @pointermove=${this.onZoneMove}
                                 @pointerleave=${this.onOffsetLeave}/>`):""}
          ${this.tzIanaPolygons&&this.config.showTimezoneBoundaries?this.tzIanaPolygons.map(t=>Z`<path class="tz-iana-region${this.hoveredIana===t?" is-active":""}" d="${t.d}"
                                 @pointerenter=${e=>this.onIanaEnter(e,t)}
                                 @pointermove=${this.onZoneMove}
                                 @pointerleave=${this.onIanaLeave}/>`):""}

          ${this.config.showHomeMarker?this.renderHomeMarker(i):""}

          ${y?function(t,e,i=180){const s=function(t,e,i=180){const s=t.getUTCHours()+t.getUTCMinutes()/60+t.getUTCSeconds()/3600,o=e/24,n=i-180,r=[];for(let t=0;t<=24;t++){const e=n+15*t;let i=e/15;for(;i>12;)i-=24;for(;i<=-12;)i+=24;const a=((s+e/15)%24+24)%24|0;r.push({offset:i,realLon:e,centerX:t*o,hour12:(a+11)%12+1,isNoon:12===a,isMidnight:0===a})}return r}(t,e,i),o=e/24,n=[];for(let t=1;t<24;t++)n.push(t*o);return Z`
    <g class="tz-band">
      <rect class="tz-bg"
            x="0" y="${-44}"
            width="${e}" height="${Tt}"/>

      ${s.map(t=>Z`
        <text class="tz-hour${t.isNoon?" noon":""}${t.isMidnight?" mid":""}"
              x="${t.centerX}" y="${-21}"
              text-anchor="middle" dominant-baseline="central">${t.hour12}</text>`)}

      ${n.map(t=>Z`
        <line class="tz-tick"
              x1="${t}" y1="${0}"
              x2="${t}" y2="${12}"/>`)}
    </g>
  `}(t,Lt,i):""}
        </svg>
        <div class="readout">
          <div class="local-time">${m}</div>
          ${this.config.showUTC?V`<div class="utc-time">${g}</div>`:""}
        </div>
        <div class="date">${v}</div>
        ${this.renderPopup(e)}
      </div>
    `}getCardSize(){return 4}static async getConfigElement(){return await Promise.resolve().then(function(){return Vt}),document.createElement("geo-clock-card-editor")}static getStubConfig(){return{type:"custom:geo-clock-card",center:"sun"}}static{this.TOUCH_DISMISS_MS=2500}clearDismissTimer(){void 0!==this.dismissTimer&&(clearTimeout(this.dismissTimer),this.dismissTimer=void 0)}scheduleTouchDismiss(t){this.clearDismissTimer(),this.dismissTimer=setTimeout(()=>{this.dismissTimer=void 0,t()},Dt.TOUCH_DISMISS_MS)}updateHoverPos(t){const e=t.currentTarget.closest(".frame");if(!e)return;const i=e.getBoundingClientRect();this.hoverPos={x:t.clientX-i.left,y:t.clientY-i.top}}renderHomeMarker(t){const e=this.resolveHomeLatLon();if(!e)return"";const{x:i,y:s}=function(t,e,i,s,o=180){return{x:((e-(o-180))%360+360)%360/360*i,y:(90-t)/180*s}}(e.lat,e.lon,Lt,Ht,t);return Z`
      <circle class="home-marker-halo" cx="${i}" cy="${s}" r="22"/>
      <circle class="home-marker-dot"  cx="${i}" cy="${s}" r="7"/>
    `}renderPopup(t){if(!this.hoverPos)return V``;if(!1===this.config?.showTimezonePopup)return V``;const e=this.shadowRoot?.querySelector(".frame"),i=e?.clientWidth??1280,s=e?.clientHeight??720,o=this.hoverPos.x>.55*i,n=this.hoverPos.y>.5*s,r=o?-260:14,a=n?-14:14,h=n?" translateY(-100%)":"",l=`transform: translate(${this.hoverPos.x+r}px, ${this.hoverPos.y+a}px)${h};`;if(this.hoveredIana){const e=this.hoveredIana,i=Mt(t,e.tzid);return V`
        <div class="tz-popup" style=${l}>
          <div class="tz-popup-time">${i.time}</div>
          <div class="tz-popup-date">${i.date}</div>
          <div class="tz-popup-name">${i.name}</div>
          <div class="tz-popup-city">${e.cityLabel}</div>
          <div class="tz-popup-offset">${i.offset} · ${e.tzid}</div>
        </div>
      `}if(this.hoveredOffset){const e=this.hoveredOffset,i=function(t,e){const i=new Date(t.getTime()+36e5*e),s=new Intl.DateTimeFormat(void 0,{timeZone:"UTC",hour:"numeric",minute:"2-digit",second:"2-digit"}).format(i),o=new Intl.DateTimeFormat(void 0,{timeZone:"UTC",weekday:"short",month:"short",day:"numeric"}).format(i);return{time:s,date:o}}(t,e.offset);return V`
        <div class="tz-popup" style=${l}>
          <div class="tz-popup-time">${i.time}</div>
          <div class="tz-popup-date">${i.date}</div>
          ${e.name?V`<div class="tz-popup-name">${e.name}</div>`:""}
          <div class="tz-popup-offset">${e.offsetLabel}</div>
          ${e.places?V`<div class="tz-popup-places">${e.places}</div>`:""}
        </div>
      `}return V``}};function Rt(t,e,i){return Math.max(e,Math.min(i,t))}function jt(t){if("string"!=typeof t)return;const e=t.trim();return/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(e)||/^(?:rgb|rgba|hsl|hsla)\([\d.,%\s/]+\)$/i.test(e)||/^[a-z]+$/i.test(e)?e:void 0}t([ft({attribute:!1})],Bt.prototype,"hass",void 0),t([mt()],Bt.prototype,"displayNow",void 0),t([mt()],Bt.prototype,"mapNow",void 0),t([mt()],Bt.prototype,"tzPolygons",void 0),t([mt()],Bt.prototype,"tzIanaPolygons",void 0),t([mt()],Bt.prototype,"hoveredIana",void 0),t([mt()],Bt.prototype,"hoveredOffset",void 0),t([mt()],Bt.prototype,"hoverPos",void 0),Bt=Dt=t([dt("geo-clock-card")],Bt),window.customCards=window.customCards||[],window.customCards.push({type:"geo-clock-card",name:"Geo Clock Card",description:"World map with a live day/night terminator (NASA Blue/Black Marble).",preview:!0});let Ft=class extends lt{setConfig(t){this._config=t}static{this.styles=r`
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
    ha-select,
    ha-entity-picker {
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
  `}fire(t,e){if(!this._config)return;const i={...this._config};void 0===e||""===e||null===e?delete i[t]:i[t]=e,JSON.stringify(i)!==JSON.stringify(this._config)&&this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}numField(t){return e=>{const i=e.target.value;this.fire(t,""===i?void 0:Number(i))}}strField(t){return e=>{const i=e.target.value;this.fire(t,i)}}toggle(t){return e=>{this.fire(t,e.target.checked)}}select(t){return e=>{const i=e.target.value;this.fire(t,i)}}render(){if(!this._config)return V``;const t=this._config,e=t.center??"sun";return V`
      <div class="section">
        <div class="section-title">Map centering</div>
        <ha-select
          label="Center on"
          .value=${e}
          @selected=${this.select("center")}
          @closed=${t=>t.stopPropagation()}
        >
          <mwc-list-item value="sun">Sun (subsolar point — drifts with daylight)</mwc-list-item>
          <mwc-list-item value="home">Home (Home Assistant location)</mwc-list-item>
          <mwc-list-item value="longitude">Specific longitude</mwc-list-item>
          <mwc-list-item value="entity">Follow an entity</mwc-list-item>
        </ha-select>

        ${"longitude"===e?V`
              <ha-textfield
                label="Longitude (-180 to 180)"
                type="number"
                min="-180"
                max="180"
                step="0.1"
                .value=${null==t.centerLongitude?"":String(t.centerLongitude)}
                @input=${this.numField("centerLongitude")}
              ></ha-textfield>
            `:""}
        ${"entity"===e?V`
              <ha-entity-picker
                .hass=${this.hass}
                label="Entity to follow"
                .value=${t.centerEntity??""}
                .includeDomains=${["zone","person","device_tracker"]}
                @value-changed=${t=>this.fire("centerEntity",t.detail.value)}
              ></ha-entity-picker>
              <div class="help">
                Entity must expose a <code>longitude</code> attribute (zones,
                persons, and most device trackers do).
              </div>
            `:""}

        <ha-formfield label="Show home marker on map">
          <ha-switch
            ?checked=${t.showHomeMarker??!1}
            @change=${this.toggle("showHomeMarker")}
          ></ha-switch>
        </ha-formfield>
      </div>

      <div class="section">
        <div class="section-title">Display</div>
        <ha-formfield label="Show UTC time">
          <ha-switch
            ?checked=${t.showUTC??!0}
            @change=${this.toggle("showUTC")}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield label="Show hour-of-day band">
          <ha-switch
            ?checked=${t.showTimezoneBand??!0}
            @change=${this.toggle("showTimezoneBand")}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield label="Show time-zone overlay">
          <ha-switch
            ?checked=${t.showTimezoneBoundaries??!0}
            @change=${this.toggle("showTimezoneBoundaries")}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield label="Show hover popup (live time at the pointed-to zone)">
          <ha-switch
            ?checked=${t.showTimezonePopup??!0}
            @change=${this.toggle("showTimezonePopup")}
          ></ha-switch>
        </ha-formfield>
      </div>

      <div class="section">
        <div class="section-title">Update rate</div>
        <ha-textfield
          label="Clock tick (seconds, 1–600)"
          type="number"
          min="1"
          max="600"
          step="1"
          .value=${String(t.updateInterval??1)}
          @input=${this.numField("updateInterval")}
        ></ha-textfield>
        <div class="help">
          The map itself auto-throttles separately — it only re-renders
          when the subsolar point has shifted enough to be visible at 4K.
        </div>
      </div>

      <ha-expansion-panel
        outlined
        header="Advanced visual settings"
        secondary="Day brightness, night contrast, twilight glow, line color"
      >
        <div class="section panel-body">
          <ha-textfield
            label="Day brightness (0.5–2.0)"
            type="number"
            min="0.5"
            max="2"
            step="0.05"
            .value=${String(t.dayBrightness??1.15)}
            @input=${this.numField("dayBrightness")}
          ></ha-textfield>
          <ha-textfield
            label="Night contrast (0.5–3.0)"
            type="number"
            min="0.5"
            max="3"
            step="0.05"
            .value=${String(t.nightContrast??1)}
            @input=${this.numField("nightContrast")}
          ></ha-textfield>
          <ha-textfield
            label="Twilight band (1–18 sun-elevation degrees)"
            type="number"
            min="1"
            max="18"
            step="1"
            .value=${String(t.twilightDegrees??8)}
            @input=${this.numField("twilightDegrees")}
          ></ha-textfield>
          <div class="color-row">
            <label for="twilight-color">Twilight color</label>
            <input
              id="twilight-color"
              type="color"
              .value=${t.twilightColor??"#463701"}
              @input=${this.strField("twilightColor")}
            />
          </div>
          <ha-textfield
            label="Twilight opacity (0–1)"
            type="number"
            min="0"
            max="1"
            step="0.02"
            .value=${String(t.twilightOpacity??.26)}
            @input=${this.numField("twilightOpacity")}
          ></ha-textfield>
          <div class="color-row">
            <label for="tz-line-color">Time-zone line color</label>
            <input
              id="tz-line-color"
              type="color"
              .value=${this.tzLineColorAsHex(t.timezoneLineColor)}
              @input=${this.strField("timezoneLineColor")}
            />
          </div>
          <div class="help">
            For finer alpha control of the line color, set <code>timezoneLineColor</code>
            directly in YAML using an <code>rgba(…)</code> value.
          </div>
        </div>
      </ha-expansion-panel>
    `}tzLineColorAsHex(t){return t&&/^#[0-9a-f]{6,8}$/i.test(t)?t.slice(0,7):"#ffffff"}};t([ft({attribute:!1})],Ft.prototype,"hass",void 0),t([mt()],Ft.prototype,"_config",void 0),Ft=t([dt("geo-clock-card-editor")],Ft);var Vt=Object.freeze({__proto__:null,get GeoClockCardEditor(){return Ft}});export{Bt as GeoClockCard};
//# sourceMappingURL=geo-clock-card.js.map
