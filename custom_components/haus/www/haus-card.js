/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),i=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=i.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(s,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new r(i,t,s)},o=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:a,defineProperty:c,getOwnPropertyDescriptor:l,getOwnPropertyNames:d,getOwnPropertySymbols:h,getPrototypeOf:p}=Object,u=globalThis,g=u.trustedTypes,m=g?g.emptyScript:"",v=u.reactiveElementPolyfillSupport,f=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},$=(t,e)=>!a(t,e),_={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=_){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&c(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);r?.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??_}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...d(t),...h(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,i)=>{if(e)s.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of i){const i=document.createElement("style"),r=t.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=e.cssText,s.appendChild(i)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:y).toAttribute(e,s.type);this._$Em=t,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=i;const n=r.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(void 0!==t){const n=this.constructor;if(!1===i&&(r=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??$)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[f("elementProperties")]=new Map,x[f("finalized")]=new Map,v?.({ReactiveElement:x}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b=globalThis,w=t=>t,A=b.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+k,H=`<${C}>`,U=document,z=()=>U.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,M=Array.isArray,N="[ \t\n\f\r]",T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,R=/>/g,I=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,D=/"/g,W=/^(?:script|style|textarea|title)$/i,B=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),L=B(1),q=B(2),F=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),V=new WeakMap,K=U.createTreeWalker(U,129);function J(t,e){if(!M(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const Z=(t,e)=>{const s=t.length-1,i=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=T;for(let e=0;e<s;e++){const s=t[e];let a,c,l=-1,d=0;for(;d<s.length&&(o.lastIndex=d,c=o.exec(s),null!==c);)d=o.lastIndex,o===T?"!--"===c[1]?o=O:void 0!==c[1]?o=R:void 0!==c[2]?(W.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=I):void 0!==c[3]&&(o=I):o===I?">"===c[0]?(o=r??T,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?I:'"'===c[3]?D:j):o===D||o===j?o=I:o===O||o===R?o=T:(o=I,r=void 0);const h=o===I&&t[e+1].startsWith("/>")?" ":"";n+=o===T?s+H:l>=0?(i.push(a),s.slice(0,l)+E+s.slice(l)+k+h):s+k+(-2===l?e:h)}return[J(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class Q{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[c,l]=Z(t,e);if(this.el=Q.createElement(c,s),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=K.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(E)){const e=l[n++],s=i.getAttribute(t).split(k),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:s,ctor:"."===o[1]?st:"?"===o[1]?it:"@"===o[1]?rt:et}),i.removeAttribute(t)}else t.startsWith(k)&&(a.push({type:6,index:r}),i.removeAttribute(t));if(W.test(i.tagName)){const t=i.textContent.split(k),e=t.length-1;if(e>0){i.textContent=A?A.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],z()),K.nextNode(),a.push({type:2,index:++r});i.append(t[e],z())}}}else if(8===i.nodeType)if(i.data===C)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=i.data.indexOf(k,t+1));)a.push({type:7,index:r}),t+=k.length-1}r++}}static createElement(t,e){const s=U.createElement("template");return s.innerHTML=t,s}}function X(t,e,s=t,i){if(e===F)return e;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const n=P(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(e=X(t,r._$AS(t,e.values),r,i)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??U).importNode(e,!0);K.currentNode=i;let r=K.nextNode(),n=0,o=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new tt(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new nt(r,this,t)),this._$AV.push(e),a=s[++o]}n!==a?.index&&(r=K.nextNode(),n++)}return K.currentNode=U,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),P(t)?t===G||null==t||""===t?(this._$AH!==G&&this._$AR(),this._$AH=G):t!==this._$AH&&t!==F&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>M(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==G&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(U.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Q.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Y(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new Q(t)),e}k(t){M(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new tt(this.O(z()),this.O(z()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=G,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=G}_$AI(t,e=this,s,i){const r=this.strings;let n=!1;if(void 0===r)t=X(this,t,e,0),n=!P(t)||t!==this._$AH&&t!==F,n&&(this._$AH=t);else{const i=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=X(this,i[s+o],e,o),a===F&&(a=this._$AH[o]),n||=!P(a)||a!==this._$AH[o],a===G?t=G:t!==G&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!i&&this.j(t)}j(t){t===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===G?void 0:t}}class it extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==G)}}class rt extends et{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??G)===F)return;const s=this._$AH,i=t===G&&s!==G||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==G&&(s===G||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const ot=b.litHtmlPolyfillSupport;ot?.(Q,tt),(b.litHtmlVersions??=[]).push("3.3.3");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ct extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let r=i._$litPart$;if(void 0===r){const t=s?.renderBefore??null;i._$litPart$=r=new tt(e.insertBefore(z(),t),t,void 0,s??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}}ct._$litElement$=!0,ct.finalized=!0,at.litElementHydrateSupport?.({LitElement:ct});const lt=at.litElementPolyfillSupport;lt?.({LitElement:ct}),(at.litElementVersions??=[]).push("4.2.2");const dt={hygiene:"#2f6fd0",usage:"#0e9384",diversity:"#b5750a",users:"#c2456e"},ht=["hygiene","usage","diversity","users"],pt={hygiene:"Hygiene",usage:"Usage",diversity:"Diversity",users:"Users"},ut="sensor.haus_score",gt=176,mt="haus-card",vt="haus-breakdown-card",ft="haus-spread-card",yt="haus-household-card",$t="haus-badge",_t="haus-tile",xt=26,bt={type:`custom:${mt}`,entity:ut},wt={tier:"",haghs_available:!1,pillars:{hygiene:null,usage:0,diversity:0,users:0},effective_weights:{},contributions:{}};class At extends ct{constructor(){super(...arguments),this._entityId=ut,this.defaultTitle=""}setConfig(t){const e=t?.entity;if(void 0!==e){if("string"!=typeof e)throw new Error(`${this.cardName}: "entity" must be an entity id, for example `+ut);if(!e.startsWith("sensor."))throw new Error(`${this.cardName}: "${e}" is not a sensor. Point "entity" at the HAUS score sensor, for example ${ut}`)}this._title="string"==typeof t?.title?t.title:void 0,this._entityId=e??ut,this._watched=void 0,this.requestUpdate()}getConfigEntity(){return this._entityId}set hass(t){const e=this.watchedEntityIds().map(e=>t.states[e]);this._hass=t,void 0!==this._watched&&e.length===this._watched.length&&e.every((t,e)=>t===this._watched?.[e])||(this._watched=e,this._entityState=e[0],this.requestUpdate())}watchedEntityIds(){return[this._entityId]}get hass(){return this._hass}renderHeader(){const t=this._title??this.defaultTitle;return""===t?G:L`<h2 class="card-header">${t}</h2>`}get entityState(){return this._entityState}get scoreAttributes(){const t=this._entityState?.attributes;return void 0===t?wt:t}}function St(t,e){return t.endsWith("_score")?`${t.slice(0,-6)}_${e}`:`sensor.haus_${e}`}const Et=n`
  .card-header {
    margin: 0;
    padding: 16px 16px 0;
    font-family: var(--ha-card-header-font-family, inherit);
    font-size: var(--ha-card-header-font-size, 20px);
    font-weight: 400;
    line-height: 1.2;
    color: var(--ha-card-header-color, var(--primary-text-color));
  }
  .card-header + .pad {
    padding-top: 12px;
  }
`,kt=`${mt}-editor`;class Ct extends ct{constructor(){super(...arguments),this._config={type:`custom:${mt}`}}setConfig(t){this._config=t,this.requestUpdate()}render(){return L`
      <div class="form">
        <label>
          <span>Score entity</span>
          <input
            name="entity"
            type="text"
            .value=${this._config.entity??ut}
            @change=${this._valueChanged}
          />
        </label>
        <label>
          <span>Name</span>
          <input
            name="name"
            type="text"
            .value=${this._config.name??""}
            @change=${this._valueChanged}
          />
        </label>
      </div>
    `}_valueChanged(t){const e=t.target,s=e.value.trim(),i={...this._config};""===s?delete i[e.name]:i[e.name]=s,this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}}Ct.styles=n`
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    input {
      font: inherit;
      font-size: 14px;
      padding: 8px;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
    }
  `,customElements.get(kt)||customElements.define(kt,Ct);const Ht=(t,e)=>{const s=t.curveKnees?.[e];return void 0===s?"a saturating curve":`a saturating curve with its knee at ${s}`},Ut=t=>void 0===t.communityReportingInstalls?"the installs that report statistics":`the ${t.communityReportingInstalls.toLocaleString("en-US")} installs that report statistics`;function zt(t,e){return function(t){const e=(t=>void 0===t.windowDays?"the recent window":`the last ${t.windowDays} days`)(t),s=void 0===t.targetGroups?"a target number of groups":`${t.targetGroups} groups`;return{hygiene:"Read from HAGHS and weighted at 30%. HAUS never recomputes it: no zombie-entity counting, no database size, no backup checks. When HAGHS is absent this pillar is dropped and the other three are renormalised over the full scale, rather than scored zero.",usage:"A weighted mean of the six signals below. What counts is firing, not existing, so the fire rate carries the most weight.",diversity:`Half how evenly the estate is spread over the groups it covers, half how many of ${s} it covers at all.`,users:"A weighted mean of the four signals below. A home only its builder can operate is a hobby, so the account count carries the most weight.",fire_rate:`The share of your automations that ran in ${e}, read from each automation's last_triggered. Weighted heaviest of the usage signals: 62 automations that never trigger is not usage.`,automation_count:`How many automations exist, on ${Ht(t,"automation_count")}: the first few count for a great deal and hoarding stops paying. A curve rather than a ratio so a small house is not punished forever.`,scripts_scenes:`Half whether one-touch routines exist at all, half whether they get run - scripts by last_triggered, scenes by their state - in ${e}. The presence half is ${Ht(t,"scripts_scenes")}.`,helpers:`input_* entities, counters, timers and schedules, counted from the entity registry rather than from state so a helper that is currently unavailable still counts as configured. Scored on ${Ht(t,"helpers")}.`,notifications:`notify service calls HAUS tallied itself over ${e}, on ${Ht(t,"notifications")}. There is no history for this without the recorder, so HAUS counts the events as they happen. Until the tally has enough days behind it the metric sits at a neutral value rather than at zero.`,advanced:"The share of recognised advanced features present: template entities, zones beyond zone.home, and a configured voice assistant.",accounts:`Active accounts that are not system-generated, on ${Ht(t,"accounts")} - a second person who can operate the house is the point of this pillar.`,mobile_apps:"Mobile app registrations as a share of the accounts, capped at 100. Someone with three phones is not three people.",activity_7d:"How many distinct people caused a state change in the last seven days, as a share of the accounts. A change with no user behind it is an automation firing, not a person, and does not count.",activity_30d:"The same over thirty days. Both windows sit at a neutral value until the tally has been running long enough to cover them: a fresh install has not earned a zero, it simply has no history yet.",groups_covered:`Config entries are reduced to their domains and mapped onto 27 curated groups - forty Hue bulbs are one integration, not forty. Coverage is measured against ${s}, so covering more than that is already full marks on this half.`,community:`A comparison with the community average, not a percentile: Home Assistant publishes means and no distribution at all, so there is no way to say what share of installs you are ahead of. Drawn from ${Ut(t)}${void 0===t.communityAsOf?"":`, taken on ${t.communityAsOf}`}, and bundled with the release rather than fetched. Home Assistant counts every account that is not system-generated where HAUS counts only active ones, so its user figure can read slightly high.`,evenness:"The normalised Shannon entropy of the groups present, H / ln(k). One dominant group scores zero however large the estate is; an even spread scores one."}}(e)[t]}const Pt={fire_rate:t=>void 0===t.automations_defined?void 0:`${t.automations_fired} of ${t.automations_defined} fired`,automation_count:t=>void 0===t.automations_defined?void 0:`${t.automations_defined} defined`,scripts_scenes:t=>void 0===t.scripts_and_scenes_defined?void 0:`${t.scripts_and_scenes_used} of ${t.scripts_and_scenes_defined} used`,helpers:t=>void 0===t.helper_count?void 0:`${t.helper_count} helpers`,notifications:t=>void 0===t.notification_count?void 0:`${t.notification_count} sent`,accounts:t=>void 0===t.active_accounts?void 0:`${t.active_accounts} accounts`,mobile_apps:t=>void 0===t.mobile_app_devices?void 0:`${t.mobile_app_devices} registered`,activity_7d:t=>void 0===t.users_active_7d?void 0:`${t.users_active_7d} people`,activity_30d:t=>void 0===t.users_active_30d?void 0:`${t.users_active_30d} people`},Mt={fire_rate:"Fire rate",automation_count:"Automations",scripts_scenes:"Scripts and scenes",helpers:"Helpers",notifications:"Notifications",advanced:"Advanced features",accounts:"Accounts",mobile_apps:"Mobile apps",activity_7d:"Active this week",activity_30d:"Active this month"};class Nt extends At{constructor(){super(...arguments),this.defaultTitle="Score breakdown",this._open=new Set,this.cardName=vt}watchedEntityIds(){const t=this.getConfigEntity();return[t,...ht.filter(t=>"hygiene"!==t).map(e=>St(t,e))]}getCardSize(){return 6}static getStubConfig(){return{type:`custom:${vt}`}}static getConfigElement(){return document.createElement("haus-card-editor")}_explanationContext(){const t=this._pillarEntity("usage")??{},e=this._pillarEntity("diversity")??{},s=this._pillarEntity("users")??{},i=this.scoreAttributes.community,r={...t.curve_knees??{},...s.curve_knees??{}};return{..."number"==typeof t.window_days?{windowDays:t.window_days}:{},..."number"==typeof e.target_groups?{targetGroups:e.target_groups}:{},...0===Object.keys(r).length?{}:{curveKnees:r},...void 0===i?{}:{communityAsOf:i.as_of,communityReportingInstalls:i.reporting_installs}}}_toggle(t){this._open.has(t)?this._open.delete(t):this._open.add(t),this.requestUpdate()}_help(t,e){return void 0===zt(t,this._explanationContext())?G:L`<button
      class="help"
      type="button"
      aria-label="How ${e} is calculated"
      aria-expanded="${this._open.has(t)?"true":"false"}"
      @click=${()=>this._toggle(t)}
    >
      ?
    </button>`}_explanation(t){return this._open.has(t)?L`<p class="explanation">
      ${zt(t,this._explanationContext())}
    </p>`:G}_pillarEntity(t){const e=this.hass,s=e?.states[St(this.getConfigEntity(),t)];return s?.attributes}render(){if(void 0===this.entityState)return L`
        <ha-card>
          <div class="pad missing">
            Entity <code>${this.getConfigEntity()}</code> was not found. Is the
            HAUS integration set up?
          </div>
        </ha-card>
      `;const t=this.scoreAttributes,e=Number(this.entityState.state);return L`
      <ha-card>
        ${this.renderHeader()}
        <div class="pad">
          <div class="arithmetic">
            ${function(t,e,s){const i=[];for(const t of ht){const r=e[t],n=s[t];if(null==r||void 0===n)continue;const o=n.toFixed(2).replace(/^0/,"");i.push(`${o}·${Math.round(r)}`)}return`${t} = ⌊${i.join(" + ")}⌋`}(Number.isFinite(e)?e:0,t.pillars,t.effective_weights??{})}
          </div>
          <p class="explainer">
            Every pillar is a weighted mean of the signals below, and each
            signal is itself scored 0-100 rather than counted - four accounts
            score 86, they are not 86 accounts. Weights are the ones actually
            in force: with HAGHS absent, hygiene is dropped and the rest are
            renormalised over the full scale.
          </p>
          ${ht.map(t=>this._pillarSection(t))}
          ${this._communitySection()}
        </div>
      </ha-card>
    `}_communitySection(){const t=this.scoreAttributes.community;if(void 0===t)return G;const e=(t,e)=>{const s=this._pillarEntity(t)?.[e];return"number"==typeof s?s:void 0},s=[["Automations",e("usage","automations_defined"),t.automations],["Accounts",e("users","active_accounts"),t.users]].filter(([,t])=>void 0!==t);return 0===s.length?G:L`
      <section class="community">
        <header>
          <span class="name">
            Compared with the community
            ${this._help("community","the community comparison")}
          </span>
        </header>
        ${this._explanation("community")}
        ${s.map(([t,e,s])=>L`
            <div class="compare">
              <span>${t}</span>
              <span class="num"><i>typical ${s}</i> ${e}</span>
            </div>
          `)}
        <div class="note-row muted">
          <span>
            Averages over
            ${t.reporting_installs.toLocaleString("en-US")} installs
            reporting statistics, ${t.as_of}
          </span>
        </div>
      </section>
    `}_pillarSection(t){const e=this.scoreAttributes,s=e.pillars[t],i=(e.effective_weights??{})[t],r=null==s;return L`
      <section class="pillar ${r?"ghost":""}">
        <header>
          <span class="swatch" style="background:${dt[t]}"></span>
          <span class="name">
            ${pt[t]} ${this._help(t,pt[t])}
          </span>
          <span class="value">
            ${r?"unavailable":Math.round(s)}
          </span>
          <span class="weight">
            ${void 0===i?"—":`${Math.round(100*i)}%`}
          </span>
        </header>
        ${this._explanation(t)}
        ${r?G:this._signals(t)}
      </section>
    `}_signals(t){if("diversity"===t)return this._diversitySignals();if("hygiene"===t)return L`<div class="note-row">
        <span>Consumed from HAGHS, never recomputed</span>
      </div>`;const e=this._pillarEntity(t),s=e?.metrics??{},i=Object.entries(s);if(0===i.length)return L`<div class="note-row muted">
        <span>Signals unavailable - is sensor.haus_${t} enabled?</span>
      </div>`;const r=e??{};return L`
      ${i.map(([t,e])=>{const s=Mt[t]??t,i=Pt[t]?.(r);return L`
          <div class="signal">
            <span>${s} ${this._help(t,s)}</span>
            <span class="num">
              ${void 0===i?G:L`<i>${i}</i>`}
              ${Math.round(e)}
            </span>
          </div>
          ${this._explanation(t)}
        `})}
    `}_diversitySignals(){const t=this._pillarEntity("diversity");if(void 0===t)return L`<div class="note-row muted">
        <span>Signals unavailable - is sensor.haus_diversity enabled?</span>
      </div>`;const e=t.groups_covered??[],s=t.groups_missing??[],i=t.evenness;return L`
      <div class="signal">
        <span>Groups covered ${this._help("groups_covered","groups covered")}</span>
        <span class="num">
          ${e.length} of ${e.length+s.length}
        </span>
      </div>
      ${this._explanation("groups_covered")}
      <div class="signal">
        <span>Evenness ${this._help("evenness","evenness")}</span>
        <span class="num">${i??"—"}</span>
      </div>
      ${this._explanation("evenness")}
      ${s.length>0?L`<div class="note-row missing-groups">
            <span>Nothing in</span>
            <span class="num">${s.join(", ")}</span>
          </div>`:G}
    `}}Nt.styles=[Et,n`
    :host {
      display: block;
    }
    .pad {
      padding: 16px;
    }
    .missing {
      color: var(--secondary-text-color);
    }
    .arithmetic {
      font-family: var(--code-font-family, ui-monospace, monospace);
      font-size: 15px;
      color: var(--primary-text-color);
    }
    .explainer {
      margin: 8px 0 16px;
      font-size: 12px;
      line-height: 1.5;
      color: var(--secondary-text-color);
    }
    .pillar {
      border-top: 1px solid var(--divider-color);
      padding: 10px 0 4px;
    }
    .pillar header {
      display: grid;
      grid-template-columns: 10px 1fr auto auto;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .community {
      border-top: 1px solid var(--divider-color);
      padding: 10px 0 4px;
    }
    .community header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .swatch {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
    .weight,
    .ghost .value {
      color: var(--secondary-text-color);
    }
    .ghost .value {
      font-style: italic;
    }
    .ghost .swatch {
      opacity: 0.35;
    }
    .signal,
    .compare,
    .note-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 3px 0 3px 18px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .signal .num,
    .compare .num {
      font-variant-numeric: tabular-nums;
      color: var(--primary-text-color);
    }
    .missing-groups .num {
      text-align: right;
      color: var(--secondary-text-color);
    }
    .muted {
      font-style: italic;
    }
    .help {
      appearance: none;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--secondary-text-color);
      font: inherit;
      font-size: 10px;
      line-height: 1;
      width: 16px;
      height: 16px;
      padding: 0;
      border-radius: 8px;
      cursor: pointer;
      vertical-align: middle;
    }
    .help:hover,
    .help:focus-visible {
      color: var(--primary-text-color);
      border-color: var(--primary-text-color);
    }
    .signal .num i,
    .compare .num i {
      font-style: normal;
      color: var(--secondary-text-color);
      margin-right: 8px;
    }
    .explanation {
      margin: 2px 0 8px;
      padding: 8px 10px;
      border-left: 2px solid var(--divider-color);
      font-size: 12px;
      line-height: 1.5;
      color: var(--secondary-text-color);
    }
  `],customElements.get(vt)||customElements.define(vt,Nt);function Tt(t,e){const s=(e.size-e.strokeWidth)/2,i=2*Math.PI*s;let r=0;const n=[];for(const s of t){const t=s.points/100*i,o=Math.max(0,t-e.gap);n.push({key:s.key,length:o,dashArray:`${o} ${i}`,dashOffset:-r}),r+=t}const o=t.reduce((t,e)=>t+e.points,0);return{radius:s,circumference:i,segments:n,earned:o,unearned:Math.max(0,100-o)}}const Ot=13;function Rt(t){return ht.filter(e=>void 0!==t[e]).map(e=>({key:e,points:t[e]}))}class It extends At{constructor(){super(...arguments),this.cardName=$t}getCardSize(){return 1}static getStubConfig(){return{type:`custom:${$t}`}}static getConfigElement(){return document.createElement("haus-card-editor")}render(){const t=this.entityState;if(void 0===t)return L`<div class="badge missing">
        <span class="label">HAUS</span>
        <span class="score">?</span>
      </div>`;const e=Tt(Rt(this.scoreAttributes.contributions??{}),{size:xt,strokeWidth:3,gap:1});return L`
      <div class="badge">
        <svg
          class="ring"
          viewBox="0 0 ${xt} ${xt}"
          width="${xt}"
          height="${xt}"
          role="img"
          aria-label="HAUS score ${t.state} out of 100"
        >
          <g transform="rotate(-90 ${Ot} ${Ot})">
            <circle
              class="track"
              cx="${Ot}"
              cy="${Ot}"
              r="${e.radius}"
              fill="none"
              stroke-width="${3}"
            />
            ${e.segments.map(t=>q`
                <circle
                  class="segment"
                  cx="${Ot}"
                  cy="${Ot}"
                  r="${e.radius}"
                  fill="none"
                  stroke="${dt[t.key]}"
                  stroke-width="${3}"
                  stroke-dasharray="${t.dashArray}"
                  stroke-dashoffset="${t.dashOffset}"
                />
              `)}
          </g>
        </svg>
        <span class="label">HAUS</span>
        <span class="score">${t.state}</span>
      </div>
    `}}It.styles=n`
    :host {
      display: inline-block;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px 4px 6px;
      border-radius: 16px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      font-size: 13px;
      color: var(--primary-text-color);
    }
    .track {
      stroke: var(--divider-color);
      opacity: 0.5;
    }
    .label {
      letter-spacing: 0.04em;
      color: var(--secondary-text-color);
    }
    .score {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  `;class jt extends At{constructor(){super(...arguments),this.cardName=_t}getCardSize(){return 1}static getStubConfig(){return{type:`custom:${_t}`}}static getConfigElement(){return document.createElement("haus-card-editor")}render(){const t=this.entityState;if(void 0===t)return L`
        <ha-card>
          <div class="tile missing">
            Entity <code>${this.getConfigEntity()}</code> was not found.
          </div>
        </ha-card>
      `;const e=this.scoreAttributes,s=Rt(e.contributions??{});return L`
      <ha-card>
        <div class="tile">
          <div class="row">
            <span class="score">${t.state}</span>
            <span class="tier">${e.tier}</span>
          </div>
          <div
            class="strip"
            role="img"
            aria-label="Points contributed by each pillar"
          >
            ${s.map(t=>L`
                <span
                  class="strip-segment"
                  title="${t.key}"
                  style="width:${t.points}%;background:${dt[t.key]}"
                ></span>
              `)}
          </div>
        </div>
      </ha-card>
    `}}jt.styles=[Et,n`
    :host {
      display: block;
    }
    .tile {
      padding: 12px 14px;
    }
    .missing {
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }
    .score {
      font-size: 28px;
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }
    .tier {
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    /* The unearned points stay visible as track: the gap is the point. */
    .strip {
      display: flex;
      height: ${5}px;
      border-radius: ${2.5}px;
      overflow: hidden;
      background: var(--divider-color);
    }
    .strip-segment {
      display: block;
      height: 100%;
    }
  `],customElements.get($t)||customElements.define($t,It),customElements.get(_t)||customElements.define(_t,jt);const Dt=[{key:"accounts",label:"Accounts",countAttribute:"active_accounts"},{key:"mobile_apps",label:"Mobile apps",countAttribute:"mobile_app_devices"},{key:"activity_7d",label:"Active this week",countAttribute:"users_active_7d"},{key:"activity_30d",label:"Active this month",countAttribute:"users_active_30d"}];class Wt extends At{constructor(){super(...arguments),this.defaultTitle="Household",this.cardName=yt,this._detail={kind:"idle"},this._asked=!1}watchedEntityIds(){const t=this.getConfigEntity();return[t,St(t,"users")]}getCardSize(){return 4}static getStubConfig(){return{type:`custom:${yt}`}}static getConfigElement(){return document.createElement("haus-card-editor")}set hass(t){super.hass=t,this._askForDetail()}get hass(){return super.hass}async _askForDetail(){const t=this.hass;if(!this._asked&&void 0!==t?.callWS){this._asked=!0;try{const e=await t.callWS({type:"haus/user_activity"});this._detail={kind:"users",users:e.users??[]}}catch(t){const e=t?.code;this._detail="not_allowed"===e?{kind:"off"}:"unauthorized"===e?{kind:"forbidden"}:{kind:"error",message:String(t?.message??t)}}this.requestUpdate()}}render(){const t=this.hass,e=St(this.getConfigEntity(),"users"),s=t?.states[e]?.attributes;if(void 0===s)return L`
        <ha-card>
          <div class="pad missing">
            Entity <code>${e}</code> was not found. Is the HAUS
            integration set up?
          </div>
        </ha-card>
      `;const i=s.metrics??{},r=Number(s.activity_history_days??0);return L`
      <ha-card>
        ${this.renderHeader()}
        <div class="pad">
          <div class="metrics">
            ${Dt.map(t=>{const e=i[t.key]??0,r=s[t.countAttribute];return L`
                <div class="metric">
                  <div class="num">${r??"—"}</div>
                  <div class="label">${t.label}</div>
                  <div class="bar">
                    <span
                      style="width:${Math.max(0,Math.min(100,e))}%;
                             background:${dt.users}"
                    ></span>
                  </div>
                </div>
              `})}
          </div>
          ${r<30?L`<p class="note">
                Activity has only been counted for ${r} days, since HAUS
                started watching. The bars sit at a neutral value until each
                window has filled.
              </p>`:G}
          ${this._detailSection()}
        </div>
      </ha-card>
    `}_detailSection(){switch(this._detail.kind){case"users":return 0===this._detail.users.length?L`<p class="note">
              No account has done anything HAUS could attribute yet.
            </p>`:L`
              <div class="heading">Per account</div>
              ${this._detail.users.map(t=>L`
                  <div class="user-row">
                    <span class="who">${t.name??t.user_id}</span>
                    <span class="last">${t.last_active??"never"}</span>
                    <span class="count">${t.actions_7d}</span>
                    <span class="count">${t.actions_30d}</span>
                  </div>
                `)}
              <div class="user-row legend">
                <span class="who"></span>
                <span class="last">last active</span>
                <span class="count">7d</span>
                <span class="count">30d</span>
              </div>
            `;case"off":return L`<p class="note">
          Per-account detail is turned off by default. Turn it on in the HAUS
          options if you want it; the counts never leave this instance either
          way.
        </p>`;case"forbidden":return L`<p class="note">
          Per-account detail is only shown to an administrator.
        </p>`;case"error":return L`<p class="note">
          Could not read per-account detail: ${this._detail.message}
        </p>`;default:return G}}}Wt.styles=[Et,n`
    :host {
      display: block;
    }
    .pad {
      padding: 16px;
    }
    .missing,
    .note {
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.5;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 14px;
      margin-bottom: 14px;
    }
    .metric .num {
      font-size: 22px;
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }
    .metric .label {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }
    .bar {
      display: block;
      height: 4px;
      border-radius: 2px;
      background: var(--divider-color);
      overflow: hidden;
    }
    .bar span {
      display: block;
      height: 100%;
    }
    .heading {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color);
      border-top: 1px solid var(--divider-color);
      padding-top: 10px;
      margin-bottom: 4px;
    }
    .user-row {
      display: grid;
      grid-template-columns: 1fr auto 40px 40px;
      gap: 10px;
      font-size: 13px;
      padding: 3px 0;
      color: var(--primary-text-color);
    }
    .user-row .last,
    .user-row .count {
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .legend {
      font-size: 11px;
      color: var(--secondary-text-color);
      border-top: 1px solid var(--divider-color);
      margin-top: 4px;
      padding-top: 4px;
    }
  `],customElements.get(yt)||customElements.define(yt,Wt);class Bt extends At{constructor(){super(...arguments),this.defaultTitle="Integration spread",this.cardName=ft}watchedEntityIds(){const t=this.getConfigEntity();return[t,St(t,"diversity")]}getCardSize(){return 4}static getStubConfig(){return{type:`custom:${ft}`}}static getConfigElement(){return document.createElement("haus-card-editor")}render(){const t=this.hass,e=St(this.getConfigEntity(),"diversity"),s=t?.states[e]?.attributes;if(void 0===s)return L`
        <ha-card>
          <div class="pad missing">
            Entity <code>${e}</code> was not found. Is the HAUS
            integration set up?
          </div>
        </ha-card>
      `;const i=s.groups_covered??[],r=s.groups_missing??[],n=s.evenness,o=s.group_counts??{},a=s.target_groups;return L`
      <ha-card>
        ${this.renderHeader()}
        <div class="pad">
          <div class="figures">
            <div class="figure">
              <div class="num">
                ${i.length} of ${i.length+r.length}
              </div>
              <div class="label">groups covered</div>
              ${void 0===a?G:L`<div class="caption">
                    ${i.length>=Number(a)?`${a}-group target reached`:`towards a ${a}-group target`}
                  </div>`}
            </div>
            <div class="figure">
              <div class="num">${n??"—"}</div>
              <div class="label">evenness</div>
            </div>
          </div>
          ${this._stack(o)}
          <div class="section">
            <div class="heading">Nothing in</div>
            ${0===r.length?L`<p class="note">Every recognised group has something in it.</p>`:L`<div class="chips">
                  ${r.map(t=>L`<span class="chip">${t}</span>`)}
                </div>`}
          </div>
        </div>
      </ha-card>
    `}_stack(t){const e=Object.entries(t).sort((t,e)=>e[1]-t[1]),s=e.reduce((t,[,e])=>t+e,0);if(0===s)return L`<p class="note">
        No integrations are classified yet, so there is no spread to show.
      </p>`;const i=e.slice(0,10).map(([t,e])=>({label:t,count:e,remainder:!1})),r=e.slice(10);r.length>0&&i.push({label:`+${r.length} more`,count:r.reduce((t,[,e])=>t+e,0),remainder:!0});const n=.6/Math.max(1,i.length);return L`
      <div class="stack" role="img" aria-label="Config entries per group">
        ${i.map((t,e)=>L`
            <span
              class="stack-segment"
              title="${t.label}: ${t.count}"
              style="width:${t.count/s*100}%;
                     background:${dt.diversity};
                     opacity:${1-e*n};
                     box-shadow: inset -1px 0 0 var(--card-background-color)"
            ></span>
          `)}
      </div>
      <div class="legend">
        ${i.map(t=>t.remainder?L`<span class="legend-item remainder">${t.label}</span>`:L`<span class="legend-item"
                >${t.label} <b>${t.count}</b></span
              >`)}
      </div>
    `}}Bt.styles=[Et,n`
    :host {
      display: block;
    }
    .pad {
      padding: 16px;
    }
    .missing,
    .note {
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .figures {
      display: flex;
      gap: 28px;
      margin-bottom: 14px;
    }
    .figure .num {
      font-size: 24px;
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }
    .figure .label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .figure .caption {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }
    .stack {
      display: flex;
      width: 100%;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      background: var(--divider-color);
    }
    .stack-segment {
      display: block;
      height: 100%;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      margin-top: 8px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .legend-item b {
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }
    .section {
      margin-top: 16px;
    }
    .heading {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px dashed var(--divider-color);
      color: var(--secondary-text-color);
    }
  `],customElements.get(ft)||customElements.define(ft,Bt);const Lt=[{type:mt,name:"HAUS",description:"How much of Home Assistant this instance actually uses.",preview:!0},{type:vt,name:"HAUS breakdown",description:"The arithmetic behind the score, and every signal under it.",preview:!0},{type:ft,name:"HAUS integration spread",description:"How broad the estate is, and which groups have nothing in them.",preview:!0},{type:yt,name:"HAUS household",description:"Who can operate this house, and whether they do.",preview:!0},{type:$t,name:"HAUS badge",description:"The score as a compact badge.",preview:!0},{type:_t,name:"HAUS tile",description:"Score, tier and a contribution strip.",preview:!0}],qt=window,Ft=qt.customCards??=[];for(const t of Lt)Ft.some(e=>e.type===t.type)||Ft.push(t);const Gt=88;class Vt extends At{constructor(){super(...arguments),this.cardName=mt}getCardSize(){return 5}static getStubConfig(){return bt}static getConfigElement(){return document.createElement(`${mt}-editor`)}render(){const t=this.entityState;if(void 0===t)return L`
        <ha-card>
          <div class="pad missing">
            Entity <code>${this.getConfigEntity()}</code> was not found. Is the HAUS
            integration set up?
          </div>
        </ha-card>
      `;const e=this.scoreAttributes,s=e.effective_weights??{},i=e.contributions??{},r=e.pillars??{hygiene:null,usage:0,diversity:0,users:0},n=!1===e.haghs_available,o=Tt(ht.filter(t=>void 0!==i[t]).map(t=>({key:t,points:i[t]})),{size:gt,strokeWidth:13,gap:2});return L`
      <ha-card>
        ${this.renderHeader()}
        <div class="hero">
          <div class="ring-wrap">
            <svg
              class="ring"
              viewBox="0 0 ${gt} ${gt}"
              width="${gt}"
              height="${gt}"
              role="img"
              aria-label="HAUS score ${t.state} out of 100"
            >
              <g transform="rotate(-90 ${Gt} ${Gt})">
                <circle
                  class="track"
                  cx="${Gt}"
                  cy="${Gt}"
                  r="${o.radius}"
                  fill="none"
                  stroke-width="${13}"
                />
                ${o.segments.map(t=>q`
                    <circle
                      class="segment"
                      cx="${Gt}"
                      cy="${Gt}"
                      r="${o.radius}"
                      fill="none"
                      stroke="${dt[t.key]}"
                      stroke-width="${13}"
                      stroke-dasharray="${t.dashArray}"
                      stroke-dashoffset="${t.dashOffset}"
                      stroke-linecap="butt"
                    />
                  `)}
              </g>
            </svg>
            <div class="centre">
              <div class="score">${t.state}</div>
              <div class="scale">/ 100</div>
              <div class="tier">${e.tier??""}</div>
            </div>
          </div>
          <div class="pillars">
            ${ht.map(t=>this._pillarRow(t,r[t],s[t]))}
          </div>
        </div>
        <div class="footer">
          ${this._sparkline(e.score_history??[],n)}
          <div class="next-action">${function(t,e){let s,i=0;for(const r of ht){const n=t[r],o=e[r];if(null==n||void 0===o)continue;const a=(100-n)*o;a>i&&(i=a,s=r)}return void 0===s||i<1?"Nothing obvious left to improve.":`Best next gain: ${pt[s]}, worth ${i.toFixed(0)} points.`}(r,s)}</div>
          ${n?L`<div class="cta">
                HAGHS is not installed, so hygiene is dropped and the other three
                pillars are renormalised over the full scale.
              </div>`:G}
        </div>
      </ha-card>
    `}_pillarRow(t,e,s){const i=null==e,r=dt[t];return L`
      <div class="pillar-row ${i?"ghost":""}">
        <span class="swatch" style="background:${r}"></span>
        <span class="name">${pt[t]}</span>
        <span class="score">${i?"unavailable":Math.round(e)}</span>
        <span class="weight">
          ${void 0===s?"—":`${Math.round(100*s)}%`}
        </span>
        <span class="bar">
          ${i?G:L`<span
                class="bar-fill"
                style="width:${Math.max(0,Math.min(100,e))}%;background:${r}"
              ></span>`}
        </span>
      </div>
    `}_sparkline(t,e){if(t.length<2)return e?G:L`<div class="sparkline empty">
            Building history: one point a week.
          </div>`;const s=t.map(t=>t.score),i=Math.min(...s),r=Math.max(...s)-i||1,n=168/(s.length-1),o=s.map((t,e)=>{const s=28-(t-i)/r*28;return`${(e*n).toFixed(1)},${s.toFixed(1)}`}).join(" ");return L`
      <svg
        class="sparkline"
        viewBox="0 0 ${168} ${28}"
        preserveAspectRatio="none"
        role="img"
        aria-label="Score over the last ${t.length} weeks"
      >
        <polyline points="${o}" fill="none" stroke-width="2" />
      </svg>
    `}}Vt.styles=[Et,n`
    :host {
      display: block;
    }
    .pad {
      padding: 16px;
    }
    .missing {
      color: var(--secondary-text-color);
    }
    .hero {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 16px;
      flex-wrap: wrap;
      /*
       * Only bites once the hero has wrapped. Above the wrap point .pillars
       * grows into all the free space, so there is none left to distribute;
       * below it the ring is alone on its row and would otherwise sit hard
       * left against a column-wide void.
       */
      justify-content: center;
    }
    .ring-wrap {
      position: relative;
      width: ${gt}px;
      height: ${gt}px;
      flex: 0 0 auto;
    }
    .track {
      stroke: var(--divider-color);
      opacity: 0.4;
    }
    .centre {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1.1;
    }
    .centre .score {
      font-size: 44px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .centre .scale {
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .centre .tier {
      margin-top: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .pillars {
      flex: 1 1 220px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 220px;
    }
    .pillar-row {
      display: grid;
      grid-template-columns: 10px 1fr auto auto;
      grid-template-areas: "swatch name score weight" "bar bar bar bar";
      gap: 4px 8px;
      align-items: center;
      font-size: 13px;
      color: var(--primary-text-color);
    }
    .swatch {
      grid-area: swatch;
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
    .name {
      grid-area: name;
    }
    .pillar-row .score {
      grid-area: score;
      font-variant-numeric: tabular-nums;
    }
    .weight {
      grid-area: weight;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }
    .bar {
      grid-area: bar;
      display: block;
      height: 4px;
      border-radius: 2px;
      background: var(--divider-color);
      overflow: hidden;
    }
    .bar-fill {
      display: block;
      height: 100%;
    }
    .ghost .swatch,
    .ghost .bar-fill {
      opacity: 0.35;
    }
    .ghost .score {
      color: var(--secondary-text-color);
      font-style: italic;
    }
    .ghost .bar {
      background: transparent;
      border-top: 2px dashed var(--divider-color);
      height: 0;
    }
    .footer {
      border-top: 1px solid var(--divider-color);
      padding: 12px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sparkline {
      width: 100%;
      height: ${28}px;
    }
    .sparkline polyline {
      stroke: var(--secondary-text-color);
    }
    .sparkline.empty {
      height: auto;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .next-action,
    .cta {
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .cta {
      color: var(--primary-text-color);
      opacity: 0.85;
    }
  `],customElements.get(mt)||customElements.define(mt,Vt);export{Vt as HausCard};
