function e(e,t,i,o){var n,r=arguments.length,s=r<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(s=(r<3?n(s):r>3?n(t,i,s):n(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const s=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new r(i,e,o)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,m=g.trustedTypes,f=m?m.emptyScript:"",_=g.reactiveElementPolyfillSupport,y=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&c(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:n}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const r=o?.call(this);n?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,o)=>{if(i)e.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of o){const o=document.createElement("style"),n=t.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,e.appendChild(o)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:v;this._$Em=o;const r=n.fromAttribute(t,e.type);this[o]=r??this._$Ej?.get(o)??r,this._$Em=null}}requestUpdate(e,t,i,o=!1,n){if(void 0!==e){const r=this.constructor;if(!1===o&&(n=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??b)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:n},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==n||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,_?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.2");const C=globalThis,$=e=>e,A=C.trustedTypes,k=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+M,T=`<${S}>`,z=document,P=()=>z.createComment(""),D=e=>null===e||"object"!=typeof e&&"function"!=typeof e,I=Array.isArray,B="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,H=/>/g,R=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,F=/"/g,j=/^(?:script|style|textarea|title)$/i,W=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),Z=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),K=new WeakMap,V=z.createTreeWalker(z,129);function q(e,t){if(!I(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(t):t}const J=(e,t)=>{const i=e.length-1,o=[];let n,r=2===t?"<svg>":3===t?"<math>":"",s=N;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(s.lastIndex=d,l=s.exec(i),null!==l);)d=s.lastIndex,s===N?"!--"===l[1]?s=O:void 0!==l[1]?s=H:void 0!==l[2]?(j.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=R):void 0!==l[3]&&(s=R):s===R?">"===l[0]?(s=n??N,c=-1):void 0===l[1]?c=-2:(c=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?R:'"'===l[3]?F:U):s===F||s===U?s=R:s===O||s===H?s=N:(s=R,n=void 0);const h=s===R&&e[t+1].startsWith("/>")?" ":"";r+=s===N?i+T:c>=0?(o.push(a),i.slice(0,c)+E+i.slice(c)+M+h):i+M+(-2===c?t:h)}return[q(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class Y{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let n=0,r=0;const s=e.length-1,a=this.parts,[l,c]=J(e,t);if(this.el=Y.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=V.nextNode())&&a.length<s;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(E)){const t=c[r++],i=o.getAttribute(e).split(M),s=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:s[2],strings:i,ctor:"."===s[1]?ie:"?"===s[1]?oe:"@"===s[1]?ne:te}),o.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:n}),o.removeAttribute(e));if(j.test(o.tagName)){const e=o.textContent.split(M),t=e.length-1;if(t>0){o.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],P()),V.nextNode(),a.push({type:2,index:++n});o.append(e[t],P())}}}else if(8===o.nodeType)if(o.data===S)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=o.data.indexOf(M,e+1));)a.push({type:7,index:n}),e+=M.length-1}n++}}static createElement(e,t){const i=z.createElement("template");return i.innerHTML=e,i}}function Q(e,t,i=e,o){if(t===Z)return t;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const r=D(t)?void 0:t._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(e),n._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(t=Q(e,n._$AS(e,t.values),n,o)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??z).importNode(t,!0);V.currentNode=o;let n=V.nextNode(),r=0,s=0,a=i[0];for(;void 0!==a;){if(r===a.index){let t;2===a.type?t=new ee(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new re(n,this,e)),this._$AV.push(t),a=i[++s]}r!==a?.index&&(n=V.nextNode(),r++)}return V.currentNode=z,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),D(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==Z&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>I(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Y.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new X(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new Y(e)),t}k(e){I(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const n of e)o===t.length?t.push(i=new ee(this.O(P()),this.O(P()),this,this.options)):i=t[o],i._$AI(n),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,n){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(e,t=this,i,o){const n=this.strings;let r=!1;if(void 0===n)e=Q(this,e,t,0),r=!D(e)||e!==this._$AH&&e!==Z,r&&(this._$AH=e);else{const o=e;let s,a;for(e=n[0],s=0;s<n.length-1;s++)a=Q(this,o[i+s],t,s),a===Z&&(a=this._$AH[s]),r||=!D(a)||a!==this._$AH[s],a===G?e=G:e!==G&&(e+=(a??"")+n[s+1]),this._$AH[s]=a}r&&!o&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}let oe=class extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}};class ne extends te{constructor(e,t,i,o,n){super(e,t,i,o,n),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??G)===Z)return;const i=this._$AH,o=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==G&&(i===G||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const se=C.litHtmlPolyfillSupport;se?.(Y,ee),(C.litHtmlVersions??=[]).push("3.3.2");const ae=globalThis;class le extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let n=o._$litPart$;if(void 0===n){const e=i?.renderBefore??null;o._$litPart$=n=new ee(t.insertBefore(P(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}}le._$litElement$=!0,le.finalized=!0,ae.litElementHydrateSupport?.({LitElement:le});const ce=ae.litElementPolyfillSupport;ce?.({LitElement:le}),(ae.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},he={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:b},pe=(e=he,t,i)=>{const{kind:o,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===o&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===o){const{name:o}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(o,n,e,!0,i)},init(t){return void 0!==t&&this.C(o,void 0,e,t),t}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];t.call(this,i),this.requestUpdate(o,n,e,!0,i)}}throw Error("Unsupported decorator location: "+o)};function ue(e){return(t,i)=>"object"==typeof i?pe(e,t,i):((e,t,i)=>{const o=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),o?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ge(e){return ue({...e,state:!0,attribute:!1})}const me=s`
  :host {
    display: block;
  }

  ha-card {
    height: 100%;
    overflow: hidden;
    /* Theme-aware CSS custom properties for consistent styling */
    --map-shadow-color: rgba(0, 0, 0, 0.15);
    --map-border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  /* Dark theme adjustments */
  ha-card.theme-dark {
    --map-shadow-color: rgba(0, 0, 0, 0.4);
    --map-border-color: var(--divider-color, rgba(255, 255, 255, 0.12));
  }

  /* Light theme explicit styling (for clarity) */
  ha-card.theme-light {
    --map-shadow-color: rgba(0, 0, 0, 0.15);
    --map-border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0;
    font-size: 1.2em;
    font-weight: 500;
  }

  .header-title {
    flex: 1;
  }

  /* Incident count badge */
  .incident-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 16px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  .incident-badge ha-icon {
    --mdc-icon-size: 16px;
  }

  .badge-count {
    font-weight: 700;
  }

  .badge-new {
    font-size: 11px;
    font-weight: 400;
    opacity: 0.9;
    margin-left: 4px;
    padding-left: 6px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
  }

  .map-wrapper {
    position: relative;
    width: 100%;
    height: 400px;
  }

  .map-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
  }

  /* Ensure Leaflet container fills the map-container */
  .map-container .leaflet-container {
    height: 100% !important;
    width: 100% !important;
    border-radius: 0 0 var(--ha-card-border-radius, 12px)
      var(--ha-card-border-radius, 12px);
  }

  /* Loading state */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 16px;
    color: var(--primary-text-color, #333);
  }

  .loading-text {
    font-size: 14px;
    opacity: 0.7;
  }

  /* Error state */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 16px;
    color: var(--error-color, #cc0000);
    padding: 16px;
    text-align: center;
  }

  .error-container ha-icon {
    --mdc-icon-size: 48px;
  }

  .error-text {
    font-size: 14px;
    max-width: 300px;
  }

  .error-hint {
    font-size: 12px;
    color: var(--secondary-text-color, #666);
    margin-top: 4px;
    max-width: 280px;
  }

  /* Australian Warning System legend */
  .legend {
    background: var(--card-background-color, white);
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
    font-size: 12px;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  /* Leaflet controls styling to match HA theme */
  .leaflet-control-zoom a {
    background: var(--card-background-color, white) !important;
    color: var(--primary-text-color, #333) !important;
  }

  .leaflet-control-zoom a:hover {
    background: var(--secondary-background-color, #f5f5f5) !important;
  }

  .leaflet-control-attribution {
    background: var(--card-background-color, rgba(255, 255, 255, 0.8)) !important;
    color: var(--secondary-text-color, #666) !important;
    font-size: 10px;
  }

  .leaflet-control-attribution a {
    color: var(--primary-color, #03a9f4) !important;
  }

  /* Entity marker styles */
  .entity-marker {
    background: transparent;
    border: none;
  }

  .entity-marker > div {
    transition: transform 0.2s ease;
  }

  .entity-marker:hover > div {
    transform: scale(1.1);
  }

  /* Hidden state for markers (zoom-based visibility) */
  .entity-marker.zoom-hidden {
    opacity: 0 !important;
    pointer-events: none !important;
    transition: opacity 0.2s ease;
  }

  .entity-marker:not(.zoom-hidden) {
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .entity-popup {
    font-size: 13px;
    line-height: 1.4;
  }

  .entity-popup-title {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color, #333);
  }

  .entity-popup-id {
    display: block;
    margin-bottom: 8px;
    color: var(--secondary-text-color, #666);
  }

  .entity-popup-details {
    margin: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 8px;
  }

  .entity-popup-details dt {
    font-weight: 500;
    color: var(--secondary-text-color, #666);
  }

  .entity-popup-details dd {
    margin: 0;
    color: var(--primary-text-color, #333);
  }

  .entity-popup strong {
    color: var(--primary-text-color, #333);
  }

  .entity-popup small {
    color: var(--secondary-text-color, #666);
  }

  /* Leaflet popup styling to match HA theme */
  .leaflet-popup-content-wrapper {
    background: var(--card-background-color, white);
    color: var(--primary-text-color, #333);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .leaflet-popup-tip {
    background: var(--card-background-color, white);
  }

  /* Leaflet tooltip styling */
  .leaflet-tooltip {
    background: var(--card-background-color, white);
    color: var(--primary-text-color, #333);
    border: none;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    padding: 4px 8px;
    font-size: 12px;
  }

  .leaflet-tooltip-top:before {
    border-top-color: var(--card-background-color, white);
  }

  /* Zone popup styles */
  .zone-popup {
    font-size: 13px;
    line-height: 1.4;
  }

  .zone-popup strong {
    color: var(--primary-text-color, #333);
  }

  .zone-popup small {
    color: var(--secondary-text-color, #666);
  }

  .zone-popup em {
    color: var(--secondary-text-color, #888);
    font-style: italic;
  }

  /* Fit to entities control button */
  .fit-control {
    margin-top: 10px;
  }

  .fit-control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: var(--card-background-color, white) !important;
    color: var(--primary-text-color, #333) !important;
    text-decoration: none;
    cursor: pointer;
  }

  .fit-control-button:hover {
    background: var(--secondary-background-color, #f5f5f5) !important;
  }

  .fit-control-button ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Incident popup styles */
  .incident-popup {
    font-size: 13px;
    line-height: 1.5;
    min-width: 180px;
    max-width: 300px;
  }

  .incident-popup-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }

  .incident-popup-header strong,
  .incident-popup-title {
    margin: 0;
    color: var(--primary-text-color, #333);
    font-size: 14px;
    font-weight: 600;
    word-wrap: break-word;
  }

  .incident-popup-body {
    color: var(--secondary-text-color, #666);
  }

  .incident-alert-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .incident-popup-row {
    margin: 4px 0;
    font-size: 12px;
  }

  .incident-popup-label {
    color: var(--secondary-text-color, #888);
    margin-right: 4px;
  }

  .incident-popup-advice {
    margin: 8px 0;
    padding: 8px;
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;
    max-height: 100px;
    overflow-y: auto;
  }

  .incident-popup-link {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
  }

  .incident-popup-link a {
    color: var(--primary-color, #03a9f4);
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
  }

  .incident-popup-link a:hover {
    text-decoration: underline;
  }

  /* Responsive popup container */
  .incident-popup-container .leaflet-popup-content {
    margin: 12px;
  }

  .incident-popup-container .leaflet-popup-content-wrapper {
    padding: 0;
  }

  /* Incident animation keyframes */
  @keyframes incident-appear {
    0% {
      opacity: 0;
      filter: drop-shadow(0 0 0 transparent);
    }
    30% {
      opacity: 1;
      filter: drop-shadow(0 0 12px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
    100% {
      opacity: 1;
      filter: drop-shadow(0 0 0 transparent);
    }
  }

  @keyframes incident-pulse {
    0%, 100% {
      filter: drop-shadow(0 0 0 transparent);
    }
    25% {
      filter: drop-shadow(0 0 8px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
    50% {
      filter: drop-shadow(0 0 0 transparent);
    }
    75% {
      filter: drop-shadow(0 0 8px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
  }

  @keyframes incident-glow-extreme {
    0%, 100% {
      filter: drop-shadow(0 0 4px rgba(204, 0, 0, 0.6));
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(204, 0, 0, 0.9));
    }
  }

  /* Incident animation classes */
  .incident-layer-new {
    animation: incident-appear var(--incident-animation-duration, 2s) ease-out forwards;
  }

  .incident-layer-updated {
    animation: incident-pulse var(--incident-animation-duration, 2s) ease-in-out;
  }

  .incident-layer-extreme {
    animation: incident-glow-extreme 2s ease-in-out infinite;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .incident-layer-new,
    .incident-layer-updated,
    .incident-layer-extreme {
      animation: none !important;
    }
  }

  /* Animation disabled via config */
  .animations-disabled .incident-layer-new,
  .animations-disabled .incident-layer-updated,
  .animations-disabled .incident-layer-extreme {
    animation: none !important;
  }

  /* ============================================
   * RESPONSIVE DESIGN
   * ============================================ */

  /* Responsive map height based on container size */
  @media (max-height: 500px) {
    .map-wrapper,
    .loading-container,
    .error-container {
      height: 250px;
    }
  }

  @media (min-height: 501px) and (max-height: 700px) {
    .map-wrapper,
    .loading-container,
    .error-container {
      height: 350px;
    }
  }

  @media (min-height: 701px) {
    .map-wrapper,
    .loading-container,
    .error-container {
      height: 400px;
    }
  }

  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    .card-header {
      padding: 12px 12px 0;
      font-size: 1em;
    }

    .incident-badge {
      padding: 3px 8px;
      font-size: 12px;
    }

    .badge-new {
      display: none; /* Hide "new" indicator on very small screens */
    }

    .incident-popup {
      min-width: 150px;
      max-width: 250px;
    }

    .incident-popup-advice {
      max-height: 80px;
    }
  }

  /* Tablet adjustments */
  @media (min-width: 481px) and (max-width: 768px) {
    .card-header {
      padding: 14px 14px 0;
    }
  }

  /* ============================================
   * ACCESSIBILITY - FOCUS INDICATORS
   * ============================================ */

  /* Global focus visible style for keyboard navigation */
  *:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  /* Leaflet control focus styles */
  .leaflet-control-zoom a:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4) !important;
    outline-offset: -2px;
  }

  .fit-control-button:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4) !important;
    outline-offset: -2px;
  }

  /* Popup close button focus */
  .leaflet-popup-close-button:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4) !important;
    outline-offset: 2px;
  }

  /* Link focus within popups */
  .incident-popup-link a:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  /* ============================================
   * ACCESSIBILITY - TOUCH TARGETS (WCAG 2.1 AA)
   * ============================================ */

  /* Ensure minimum 44x44px touch targets for mobile */
  @media (pointer: coarse) {
    .leaflet-control-zoom a {
      width: 44px !important;
      height: 44px !important;
      line-height: 44px !important;
      font-size: 22px !important;
    }

    .fit-control-button {
      width: 44px !important;
      height: 44px !important;
    }

    .leaflet-popup-close-button {
      width: 44px !important;
      height: 44px !important;
      font-size: 24px !important;
      padding: 0 !important;
      right: 0 !important;
      top: 0 !important;
    }
  }

  /* ============================================
   * ACCESSIBILITY - HIGH CONTRAST MODE
   * ============================================ */

  @media (prefers-contrast: more) {
    ha-card {
      border: 2px solid var(--primary-text-color, #000) !important;
    }

    .card-header {
      border-bottom: 2px solid var(--divider-color, #000);
    }

    .incident-badge {
      border: 2px solid currentColor;
    }

    .leaflet-control-zoom a {
      border: 2px solid var(--primary-text-color, #000) !important;
    }

    .fit-control-button {
      border: 2px solid var(--primary-text-color, #000) !important;
    }

    /* Increase popup contrast */
    .leaflet-popup-content-wrapper {
      border: 2px solid var(--primary-text-color, #000);
    }

    /* Stronger focus indicators */
    *:focus-visible {
      outline-width: 3px;
    }
  }

  /* ============================================
   * ACCESSIBILITY - SCREEN READER UTILITIES
   * ============================================ */

  /* Visually hidden but accessible to screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Live region for announcements */
  .sr-live-region {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Skip link for keyboard navigation */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary-color, #03a9f4);
    color: white;
    padding: 8px 16px;
    z-index: 10000;
    text-decoration: none;
    font-weight: 500;
    border-radius: 0 0 4px 0;
    transition: top 0.2s ease;
  }

  .skip-link:focus {
    top: 0;
  }
`,fe="auto",_e={device_tracker:"mdi:cellphone",person:"mdi:account",geo_location:"mdi:map-marker"},ye={device_tracker:"#4CAF50",person:"#2196F3",geo_location:"#FF9800"},ve={extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#3366cc"},be={australian:{extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#3366cc"},us_nws:{extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#00bfff"},eu_meteo:{extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#33cc33"},high_contrast:{extreme:"#990000",severe:"#cc5500",moderate:"#ccaa00",minor:"#003399"}};function we(e,t){const i=["extreme","severe","moderate","minor"].includes(e)?e:"minor";return t?.alert_colors?.[i]?t.alert_colors[i]:t?.alert_color_preset&&be[t.alert_color_preset]?be[t.alert_color_preset][i]:ve[i]}function xe(e){const t=[];return!1===e.show_warning_levels&&!0===e.hide_markers_for_polygons&&t.push({id:"hide-markers-no-effect",severity:"warning",message:"'hide_markers_for_polygons' has no effect when 'show_warning_levels' is false.",suggestion:"Polygon entities will render as markers only. Remove 'hide_markers_for_polygons' or set 'show_warning_levels: true'."}),t}const Ce=new class{constructor(){this._cache=new Map,this._debugLogging=!1}setDebugLogging(e){this._debugLogging=e}_hashGeometry(e){return e.coordinates?JSON.stringify(e.coordinates):JSON.stringify(e)}getExtent(e,t){if(!t)return 0;const i=this._hashGeometry(t),o=this._cache.get(e);if(o&&o.hash===i)return this._debugLogging&&console.debug(`ABC Emergency Map: Extent cache HIT for ${e}`),o.extent;const n=function(e){try{const t=L.geoJSON(e).getBounds();if(!t.isValid())return 0;const i=t.getNorthEast(),o=t.getSouthWest(),n=L.latLng(i.lat,o.lng).distanceTo(i),r=L.latLng(o.lat,i.lng).distanceTo(o);return Math.max(n,r)}catch{return console.warn("ABC Emergency Map: Failed to calculate polygon extent"),0}}(t);if(this._cache.set(e,{hash:i,extent:n}),this._debugLogging){console.debug(`ABC Emergency Map: Extent cache MISS for ${e} (${o?"geometry changed":"new entry"}), extent: ${Math.round(n)}m`)}return n}remove(e){this._cache.delete(e)}cleanup(e){let t=0;for(const i of this._cache.keys())e.has(i)||(this._cache.delete(i),t++);return t>0&&this._debugLogging&&console.debug(`ABC Emergency Map: Extent cache cleaned up ${t} stale entries`),t}clear(){this._cache.clear()}get size(){return this._cache.size}};let $e=null;function Ae(){if(null!==$e)return $e;const e=[],t="undefined"!=typeof window&&"cast"in window&&void 0!==window.cast?.framework;e.push(t);const i="undefined"!=typeof window&&"__onGCastApiAvailable"in window;e.push(i);const o="undefined"!=typeof navigator?navigator.userAgent:"",n=o.includes("CrKey")||o.includes("Chromecast");e.push(n);const r="undefined"!=typeof customElements&&void 0!==customElements.get("hc-main");e.push(r);const s="undefined"!=typeof window&&("cast.home-assistant.io"===window.location.hostname||window.location.pathname.includes("/cast"));return e.push(s),$e=e.some(e=>e),$e&&console.log("ABC Emergency Map: Cast environment detected",{hasCastFramework:t,hasGCastCallback:i,isChromecastUA:n,hasCastManager:r,isCastUrl:s}),$e}var ke;!function(e){e.RESOURCE_LOAD_FAILED="RESOURCE_LOAD_FAILED",e.CORS_BLOCKED="CORS_BLOCKED",e.LITELEMENT_UNAVAILABLE="LITELEMENT_UNAVAILABLE",e.NETWORK_RESTRICTED="NETWORK_RESTRICTED",e.UNKNOWN="UNKNOWN"}(ke||(ke={}));const Ee="1.9.4",Me="/static/images/leaflet/leaflet.css",Se="/static/images/leaflet/images/",Te=`https://unpkg.com/leaflet@${Ee}/dist/leaflet.css`,Le=`https://unpkg.com/leaflet@${Ee}/dist/leaflet.js`,ze=`https://cdn.jsdelivr.net/npm/leaflet@${Ee}/dist/leaflet.css`,Pe=`https://cdn.jsdelivr.net/npm/leaflet@${Ee}/dist/leaflet.js`,De="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",Ie="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";let Be=null,Ne=!1,Oe=null,He=!1,Re=!1;async function Ue(){return Oe||(Oe=await async function(){const e=Ae(),t=[];try{console.log(`ABC Emergency Map: Trying HA local CSS from ${Me}${e?" (Cast mode)":""}`);const i=await fetch(Me);if(i.ok)return Re=!0,console.log("ABC Emergency Map: Using HA's local Leaflet CSS"),await i.text();t.push(`HA local: HTTP ${i.status}`)}catch(e){t.push(`HA local: ${e}`),console.log("ABC Emergency Map: HA local CSS not available, trying CDN...")}try{console.log(`ABC Emergency Map: Trying primary CDN ${Te}`);const e=await fetch(Te);if(e.ok)return console.log("ABC Emergency Map: Using primary CDN CSS"),await e.text();t.push(`Primary CDN: HTTP ${e.status}`)}catch(e){t.push(`Primary CDN: ${e}`),console.warn("ABC Emergency Map: Primary CDN failed, trying fallback...")}try{console.log(`ABC Emergency Map: Trying fallback CDN ${ze}`);const e=await fetch(ze);if(e.ok)return He=!0,console.log("ABC Emergency Map: Using fallback CDN CSS"),await e.text();t.push(`Fallback CDN: HTTP ${e.status}`)}catch(e){t.push(`Fallback CDN: ${e}`)}throw new Error(`Failed to fetch Leaflet CSS from all sources.${e?" This may be due to Cast environment network restrictions.":""} Errors: ${t.join("; ")}`)}(),Oe)}function Fe(e,t,i=!1){return new Promise((o,n)=>{if(document.querySelector(`link[href="${Me}"]`)||document.querySelector(`link[href="${Te}"]`)||document.querySelector(`link[href="${ze}"]`))return void o();const r=document.createElement("link");r.rel="stylesheet",r.href=e,i||(r.crossOrigin="anonymous"),i||Ae()||!t||(r.integrity=t),r.onload=()=>o(),r.onerror=()=>n(new Error(`Failed to load Leaflet CSS from ${e}`)),document.head.appendChild(r)})}function je(e,t){return new Promise((i,o)=>{if("undefined"!=typeof window&&"L"in window)return void i();const n=document.createElement("script");n.src=e,n.crossOrigin="anonymous",n.async=!0,!Ae()&&t&&(n.integrity=t),n.onload=()=>i(),n.onerror=()=>o(new Error(`Failed to load Leaflet JS from ${e}`)),document.head.appendChild(n)})}function We(){if("undefined"==typeof window)return!1;if(!("L"in window))return!1;const e=window.L;return"string"==typeof e?.version}async function Ze(){if(!customElements.get("ha-map"))return console.log("ABC Emergency Map: ha-map not registered, skipping HA Leaflet trigger"),!1;console.log("ABC Emergency Map: Triggering HA Leaflet load via ha-map element...");const e=document.createElement("div");e.style.cssText="position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";const t=document.createElement("ha-map");t.zoom=1,e.appendChild(t),document.body.appendChild(e);try{await(i=5e3,new Promise((e,t)=>{const o=Date.now(),n=()=>{We()?e():Date.now()-o>i?t(new Error("Timeout waiting for window.L")):setTimeout(n,100)};n()}));const e=window.L.version;return console.log(`ABC Emergency Map: HA Leaflet ${e} loaded successfully via ha-map trigger`),!0}catch{return console.log("ABC Emergency Map: HA Leaflet trigger timed out, falling back to CDN"),!1}finally{e.remove()}var i}let Ge=!1;async function Ke(){if(Be)return Be;if(Ne&&"undefined"!=typeof L)return L;const e=Ae();return e&&console.log("ABC Emergency Map: Loading Leaflet in Cast environment"),Be=(async()=>{try{if(await async function(){const e=[];try{return await Fe(Me,"",!0),Re=!0,void console.log("ABC Emergency Map: Loaded HA's local Leaflet CSS")}catch(t){e.push(`HA local: ${t}`),console.log("ABC Emergency Map: HA local CSS link failed, trying CDN...")}try{return await Fe(Te,De),void console.log("ABC Emergency Map: Loaded primary CDN CSS")}catch(t){e.push(`Primary CDN: ${t}`),console.warn("ABC Emergency Map: Primary CDN CSS failed, trying fallback...")}try{return await Fe(ze,De),He=!0,void console.log("ABC Emergency Map: Loaded fallback CDN CSS")}catch(t){e.push(`Fallback CDN: ${t}`)}throw new Error(`Failed to load Leaflet CSS from all sources: ${e.join("; ")}`)}(),await async function(){if(We()){const e=window.L.version;return void console.log(`ABC Emergency Map: Using existing Leaflet ${e} from window.L`)}if(await Ze())return void(Ge=!0);const e=[];try{return await je(Le,Ie),void console.log("ABC Emergency Map: Loaded Leaflet JS from primary CDN")}catch(t){e.push(`Primary CDN: ${t}`),console.warn("ABC Emergency Map: Primary JS CDN failed, trying fallback...")}try{return await je(Pe,Ie),He=!0,void console.log("ABC Emergency Map: Loaded Leaflet JS from fallback CDN")}catch(t){e.push(`Fallback CDN: ${t}`)}throw new Error(`Failed to load Leaflet JS from all sources: ${e.join("; ")}`)}(),"undefined"==typeof L)throw new Error("Leaflet script loaded but L global is undefined. This may indicate a script parsing error.");"undefined"!=typeof L&&L.Icon?.Default?.prototype&&(L.Icon.Default.imagePath=Se,console.log(`ABC Emergency Map: Set marker image path to ${Se}`)),Ne=!0;const e=[];return Ge&&e.push("HA bundled JS"),Re&&e.push("HA local CSS"),He&&e.push("fallback CDN"),console.log(`ABC Emergency Map: Leaflet ${L.version} ready`+(e.length>0?` (${e.join(", ")})`:" (CDN)")),L}catch(t){if(Be=null,e&&t instanceof Error){const e=new Error(`[Cast Environment] ${t.message}. Cast devices may have restricted network access. Consider using the built-in Home Assistant map card for Cast dashboards.`);throw e.cause=t,e}throw t}})(),Be}const Ve={osm:{name:"OpenStreetMap",requiresApiKey:!1,light:{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19,subdomains:["a","b","c"]}},cartodb:{name:"CartoDB",requiresApiKey:!1,light:{url:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',maxZoom:20,subdomains:["a","b","c","d"]},dark:{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',maxZoom:20,subdomains:["a","b","c","d"]}},mapbox:{name:"Mapbox",requiresApiKey:!0,light:{url:"https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token={accessToken}",attribution:'&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:22},dark:{url:"https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",attribution:'&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:22}}};function qe(e,t){const i=e.tile_provider??"osm";if("custom"===i)return function(e){if(!e.tile_url)return console.warn("ABC Emergency Map: Custom tile provider requires tile_url. Falling back to OSM."),Ve.osm.light;let t=e.tile_url;e.api_key&&t.includes("{accessToken}")&&(t=t.replace("{accessToken}",e.api_key));return{url:t,attribution:e.tile_attribution??"Custom tiles",maxZoom:19}}(e);const o=Ve[i];if(!o)return console.warn(`ABC Emergency Map: Unknown tile provider "${i}", falling back to OSM`),Ve.osm.light;if(o.requiresApiKey&&!e.api_key)return console.warn(`ABC Emergency Map: ${o.name} requires an API key. Falling back to OSM.`),Ve.osm.light;const n=t&&o.dark?o.dark:o.light;return e.api_key&&n.url.includes("{accessToken}")?{...n,url:n.url.replace("{accessToken}",e.api_key)}:n}const Je=["device_tracker","person","geo_location"];function Ye(e){return Je.includes(e)}function Qe(e){return e.split(".")[0]}function Xe(e,t){const i=Qe(e);if(!Ye(i))return null;if(!function(e){const t=e.attributes.latitude,i=e.attributes.longitude;return"number"==typeof t&&"number"==typeof i&&!isNaN(t)&&!isNaN(i)&&t>=-90&&t<=90&&i>=-180&&i<=180}(t))return null;const o=t.attributes;return{entityId:e,domain:i,name:o.friendly_name||e,latitude:o.latitude,longitude:o.longitude,picture:o.entity_picture,state:t.state,gpsAccuracy:o.gps_accuracy,battery:o.battery,lastUpdated:t.last_updated}}function et(e,t){const i=new Set,o=[],n=function(e,t){const i=[],o=new Set,n=[];t.entity&&n.push(t.entity),t.entities&&n.push(...t.entities);for(const t of n){if(o.has(t))continue;o.add(t);const n=e.states[t];if(!n)continue;const r=Xe(t,n);r&&i.push(r)}return i}(e,t);for(const e of n)i.has(e.entityId)||(i.add(e.entityId),o.push(e));if(t.geo_location_sources&&t.geo_location_sources.length>0){const n=function(e,t){const i=[];console.log("ABC Emergency Map: Processing geo_location_sources:",t);for(const o of t){const t=e.states[o];if(!t){console.warn(`ABC Emergency Map: Source entity not found: ${o}`);continue}console.log(`ABC Emergency Map: Source ${o} state:`,t.state,"attrs:",t.attributes);const n=t.attributes;Array.isArray(n.entity_ids)&&(console.log(`ABC Emergency Map: Found entity_ids in ${o}:`,n.entity_ids),i.push(...n.entity_ids)),Array.isArray(n.containing_entity_ids)&&(console.log(`ABC Emergency Map: Found containing_entity_ids in ${o}:`,n.containing_entity_ids),i.push(...n.containing_entity_ids)),n.entity_ids||n.containing_entity_ids||console.warn(`ABC Emergency Map: Source ${o} has no entity_ids or containing_entity_ids attribute`)}return console.log("ABC Emergency Map: Total entity IDs from sources:",i),[...new Set(i)]}(e,t.geo_location_sources),r=Object.keys(e.states).filter(e=>e.startsWith("geo_location."));console.log("ABC Emergency Map: All geo_location entities in hass.states:",r);for(const t of n){if(i.has(t))continue;i.add(t);const n=e.states[t];if(!n){console.warn(`ABC Emergency Map: Entity from source not found in hass.states: ${t}`);continue}const r=Xe(t,n);r?o.push(r):console.warn(`ABC Emergency Map: Entity ${t} has no valid coordinates`)}}return o}function tt(e,t){const i=function(e,t){const i=ye[e.domain];return e.picture?`\n      width: ${t}px;\n      height: ${t}px;\n      border-radius: 50%;\n      border: 3px solid ${i};\n      background-image: url('${e.picture}');\n      background-size: cover;\n      background-position: center;\n      box-shadow: 0 2px 6px rgba(0,0,0,0.3);\n    `:`\n    width: ${t}px;\n    height: ${t}px;\n    border-radius: 50%;\n    background-color: ${i};\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    box-shadow: 0 2px 6px rgba(0,0,0,0.3);\n    color: white;\n    font-size: ${.5*t}px;\n  `}(e,t);if(e.picture)return`<div style="${i}"></div>`;return`\n    <div style="${i}">\n      <ha-icon icon="${_e[e.domain]}" style="--mdc-icon-size: ${.6*t}px;"></ha-icon>\n    </div>\n  `}function it(e){const t=e=>e.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e]||e)),i=t(e.entityId),o=`popup-${i.replace(/\./g,"-")}`,n=[`<dt class="sr-only">State</dt><dd>${t(e.state)}</dd>`];return void 0!==e.battery&&n.push(`<dt>Battery</dt><dd>${e.battery}%</dd>`),void 0!==e.gpsAccuracy&&n.push(`<dt>GPS Accuracy</dt><dd>${e.gpsAccuracy}m</dd>`),`\n    <article class="entity-popup" role="dialog" aria-labelledby="${o}">\n      <h3 id="${o}" class="entity-popup-title">${t(e.name)}</h3>\n      <small class="entity-popup-id">${i}</small>\n      <dl class="entity-popup-details">${n.join("")}</dl>\n    </article>\n  `}class ot{constructor(e){this._markers=new Map,this._markerSize=40,this._map=e}updateMarkers(e){const t=new Set(e.map(e=>e.entityId));for(const[e,i]of this._markers)t.has(e)||(i.remove(),this._markers.delete(e));for(const t of e)this._updateOrCreateMarker(t)}_updateOrCreateMarker(e){const t=[e.latitude,e.longitude],i=this._markers.get(e.entityId);if(i){i.setLatLng(t);const o=this._createIcon(e);i.setIcon(o),i.setPopupContent(it(e))}else{const i=this._createIcon(e),o=L.marker(t,{icon:i}).bindPopup(it(e)).addTo(this._map);o.bindTooltip(e.name,{permanent:!1,direction:"top",offset:[0,-this._markerSize/2]}),this._markers.set(e.entityId,o)}}_createIcon(e){return L.divIcon({className:"entity-marker",html:tt(e,this._markerSize),iconSize:[this._markerSize,this._markerSize],iconAnchor:[this._markerSize/2,this._markerSize/2],popupAnchor:[0,-this._markerSize/2]})}getMarkerPositions(){const e=[];for(const t of this._markers.values()){const i=t.getLatLng();e.push([i.lat,i.lng])}return e}get markerCount(){return this._markers.size}setZoomVisibility(e){for(const t of this._markers.values()){const i=t.getElement();i&&(e?i.classList.remove("zoom-hidden"):i.classList.add("zoom-hidden"))}}clear(){for(const e of this._markers.values())e.remove();this._markers.clear()}destroy(){this.clear()}}function nt(e){return e.startsWith("zone.")}function rt(e,t){const i=t.attributes,o=i.latitude,n=i.longitude;return"number"!=typeof o||"number"!=typeof n||isNaN(o)||isNaN(n)?null:{entityId:e,name:i.friendly_name||e.replace("zone.",""),latitude:o,longitude:n,radius:"number"==typeof i.radius?i.radius:100,passive:!0===i.passive,icon:i.icon}}function st(e){const t=[`<strong>${e.name}</strong>`,`<br><small>${e.entityId}</small>`,`<br>Radius: ${e.radius}m`];return e.passive&&t.push("<br><em>Passive zone</em>"),`<div class="zone-popup">${t.join("")}</div>`}class at{constructor(e,t){this._circles=new Map,this._map=e,this._config=t}updateConfig(e){this._config=e}updateZones(e){if(!1===this._config.show_zones)return void this.clear();const t=new Set(e.map(e=>e.entityId));for(const[e,i]of this._circles)t.has(e)||(i.remove(),this._circles.delete(e));for(const t of e)this._updateOrCreateCircle(t)}_updateOrCreateCircle(e){const t=[e.latitude,e.longitude],i=this._circles.get(e.entityId),o=this._config.zone_color??"#4285f4",n={color:o,fillColor:o,fillOpacity:this._config.zone_opacity??.2,weight:2,opacity:this._config.zone_border_opacity??.5,dashArray:e.passive?"5, 5":void 0};if(i)i.setLatLng(t),i.setRadius(e.radius),i.setStyle(n),i.setPopupContent(st(e));else{const i=L.circle(t,{radius:e.radius,...n}).bindPopup(st(e)).bindTooltip(e.name,{permanent:!1,direction:"center"}).addTo(this._map);this._circles.set(e.entityId,i)}}getZonePositions(){const e=[];for(const t of this._circles.values()){const i=t.getLatLng();e.push([i.lat,i.lng])}return e}get zoneCount(){return this._circles.size}clear(){for(const e of this._circles.values())e.remove();this._circles.clear()}destroy(){this.clear()}}class lt{constructor(e,t){this._hasUserInteracted=!1,this._initialFitDone=!1,this._lastKnownPositions=[],this._map=e,this._config=t,this._setupUserInteractionTracking()}updateConfig(e){this._config=e}addFitControl(){this._fitControl||(this._fitControl=function(e){const t=L.Control.extend({options:{position:"topleft"},onAdd(){const t=L.DomUtil.create("div","leaflet-bar leaflet-control fit-control"),i=L.DomUtil.create("a","fit-control-button",t);return i.href="#",i.title="Fit to all entities",i.setAttribute("role","button"),i.setAttribute("aria-label","Fit map to show all entities"),i.innerHTML='<ha-icon icon="mdi:fit-to-screen" style="--mdc-icon-size: 18px;"></ha-icon>',L.DomEvent.disableClickPropagation(t),L.DomEvent.on(i,"click",t=>{L.DomEvent.preventDefault(t),e()}),t}});return new t}(()=>{this.fitToPositionsAndBounds(this._lastKnownPositions,this._lastKnownPolygonBounds,!0)}),this._fitControl.addTo(this._map))}removeFitControl(){this._fitControl&&(this._fitControl.remove(),this._fitControl=void 0)}fitToPositions(e,t=!1){this.fitToPositionsAndBounds(e,void 0,t)}fitToPositionsAndBounds(e,t,i=!1){this._lastKnownPositions=e,this._lastKnownPolygonBounds=t||void 0;if(!(this._config.auto_fit??true)&&!i&&this._initialFitDone)return;if(this._hasUserInteracted&&!i&&this._initialFitDone)return;const o=e.length>=1,n=t?.isValid();(o||n)&&(this._debounceTimer&&window.clearTimeout(this._debounceTimer),this._debounceTimer=window.setTimeout(()=>{this._performFitWithPolygons(e,t),this._initialFitDone=!0},i?0:300))}_performFitWithPolygons(e,t){const i=function(e){return void 0===e?[50,50]:"number"==typeof e?[e,e]:e}(this._config.fit_padding),o=this._config.fit_max_zoom??17;let n;n=t?.isValid()?L.latLngBounds(t.getSouthWest(),t.getNorthEast()):L.latLngBounds([]);for(const[t,i]of e)n.extend([t,i]);if(!n.isValid())return;if(n.getNorthEast().distanceTo(n.getSouthWest())<1){const e=n.getCenter(),t=Math.min(this._config.default_zoom??10,o);this._map.setView(e,t,{animate:!0})}else{this._map.fitBounds(n,{padding:i,maxZoom:o,animate:!0})}}_setupUserInteractionTracking(){this._map.on("dragstart",()=>{this._hasUserInteracted=!0}),this._map.on("zoomstart",()=>{})}resetUserInteraction(){this._hasUserInteracted=!1}destroy(){this._debounceTimer&&(window.clearTimeout(this._debounceTimer),this._debounceTimer=void 0),this.removeFitControl()}}async function ct(e,t,i){const o=new Date,n=new Date(o.getTime()-60*i*60*1e3);try{const i=await e.callWS({type:"history/history_during_period",start_time:n.toISOString(),end_time:o.toISOString(),entity_ids:[t],minimal_response:!1,significant_changes_only:!1});if(!i||!i[t])return[];const r=[],s=i[t];for(const e of s){const t=e.attributes?.latitude,i=e.attributes?.longitude;"number"!=typeof t||"number"!=typeof i||isNaN(t)||isNaN(i)||r.push({timestamp:new Date(e.last_changed),latitude:t,longitude:i})}return r.sort((e,t)=>e.timestamp.getTime()-t.timestamp.getTime()),r}catch(e){return console.warn(`Failed to fetch history for ${t}:`,e),[]}}function dt(e,t){if(0===e.length)return[];const i=[];let o=[e[0]];for(let n=1;n<e.length;n++){(e[n].timestamp.getTime()-e[n-1].timestamp.getTime())/6e4>t?(o.length>1&&i.push(o),o=[e[n]]):o.push(e[n])}return o.length>1&&i.push(o),i}function ht(e,t,i){const o=i.getTime()-t.getTime();if(0===o)return 1;return.8-.6*((i.getTime()-e.getTime())/o)}function pt(e,t,i,o,n){if(t.length<2)return[];const r=[],s=new Date,a=new Date(s.getTime()-60*n*60*1e3),l=Math.max(1,Math.floor(t.length/10));for(let n=0;n<t.length-1;n+=l){const c=Math.min(n+l+1,t.length),d=t.slice(n,c);if(d.length<2)continue;const h=ht(d[Math.floor(d.length/2)].timestamp,a,s),p=d.map(e=>[e.latitude,e.longitude]),u=L.polyline(p,{color:i,weight:o,opacity:h,lineCap:"round",lineJoin:"round"}).addTo(e);r.push(u)}return r}class ut{constructor(e,t){this._polylines=new Map,this._lastFetch=0,this._cachedHistory=new Map,this._map=e,this._config=t}updateConfig(e){this._config=e}async updateTrails(e,t){if(!(this._config.show_history??false))return void this.clear();const i=(this._config.history_entities??t).filter(e=>Ye(Qe(e))),o=Date.now();if(o-this._lastFetch<5e3)return void(this._fetchTimeout||(this._fetchTimeout=window.setTimeout(()=>{this._fetchTimeout=void 0,this.updateTrails(e,t)},5e3)));this._lastFetch=o,this._fetchTimeout&&(window.clearTimeout(this._fetchTimeout),this._fetchTimeout=void 0);const n=this._config.hours_to_show??24,r=this._config.history_line_weight??3,s=new Set(i);for(const e of this._polylines.keys())s.has(e)||this._removeTrail(e);for(const t of i){const i=Qe(t),o=ye[i]||"#888888",s=await ct(e,t,n);if(s.length<2){this._removeTrail(t);continue}this._cachedHistory.set(t,{entityId:t,color:o,points:s}),this._removeTrail(t);const a=dt(s,30),l=[];for(const e of a){const t=pt(this._map,e,o,r,n);l.push(...t)}this._polylines.set(t,l)}}_removeTrail(e){const t=this._polylines.get(e);if(t){for(const e of t)e.remove();this._polylines.delete(e)}}getTrailPositions(){const e=[];for(const t of this._cachedHistory.values())for(const i of t.points)e.push([i.latitude,i.longitude]);return e}get trailCount(){return this._polylines.size}clear(){for(const e of this._polylines.keys())this._removeTrail(e);this._polylines.clear(),this._cachedHistory.clear()}destroy(){this._fetchTimeout&&(window.clearTimeout(this._fetchTimeout),this._fetchTimeout=void 0),this.clear()}}function gt(e,t){const i=t.attributes,o=i.latitude,n=i.longitude;if("number"!=typeof o||"number"!=typeof n||isNaN(o)||isNaN(n))return null;const r=i.alert_level?.toLowerCase()||"minor",s=["extreme","severe","moderate","minor"].includes(r)?r:"minor";return{id:e,headline:i.friendly_name||e,latitude:o,longitude:n,alert_level:s,alert_text:i.alert_text||"",event_type:i.event_type||"unknown",has_polygon:!!i.geojson||!!i.geometry,geometry_type:i.geometry_type,last_updated:t.last_updated||t.last_changed,external_link:i.external_link||i.link||i.url||void 0}}function mt(e){const t=e.attributes;if(t.geojson){const e=t.geojson;if(ft(e))return e}if(t.geometry){const e=t.geometry;if(ft(e))return e}return null}function ft(e){if(!e||"object"!=typeof e)return!1;const t=e;if("string"!=typeof t.type)return!1;if(!Array.isArray(t.coordinates))return!1;return["Polygon","MultiPolygon","Point"].includes(t.type)}function _t(e,t){return{type:"Feature",geometry:t,properties:{id:e.id,headline:e.headline,alert_level:e.alert_level,event_type:e.event_type,alert_text:e.alert_text}}}function yt(e){const t=e.attributes,i=t.geojson||t.geometry;if(!i)return!1;const o=i.type||t.geometry_type;return"Polygon"===o||"MultiPolygon"===o||"GeometryCollection"===o}const vt={minor:0,moderate:1,severe:2,extreme:3};function bt(e){return vt[e]??0}class wt{constructor(e,t){this._layers=new Map,this._incidents=new Map,this._incidentHashes=new Map,this._knownEntityIds=new Set,this._previousGeometries=new Map,this._activeTransitions=new Map,this._map=e,this._config=t}_hashIncident(e){return`${e.alert_level}|${e.headline}|${e.alert_text}|${e.last_updated}`}_animationsEnabled(){return this._config.animations_enabled??true}_getAnimationDuration(){return(this._config.animation_duration??2e3)/1e3+"s"}_geometryTransitionsEnabled(){return this._config.geometry_transitions??true}_getTransitionDurationMs(){return this._config.transition_duration??500}_hashGeometry(e){return JSON.stringify(e.coordinates)}_hasGeometryChanged(e,t){const i=this._previousGeometries.get(e);return!!i&&this._hashGeometry(i)!==this._hashGeometry(t)}_interpolateCoordinates(e,t,i){const o=Math.max(e.length,t.length),n=this._resampleCoordinates(e,o),r=this._resampleCoordinates(t,o);return n.map((e,t)=>{const o=r[t];return[e[0]+(o[0]-e[0])*i,e[1]+(o[1]-e[1])*i]})}_resampleCoordinates(e,t){if(0===e.length)return[];if(e.length===t)return e;if(1===e.length)return Array(t).fill(e[0]);const i=[],o=e.length-1;for(let n=0;n<t;n++){const r=n/(t-1)*o,s=Math.floor(r),a=r-s;if(s>=o)i.push(e[o]);else{const t=e[s],o=e[s+1];i.push([t[0]+(o[0]-t[0])*a,t[1]+(o[1]-t[1])*a])}}return i}_interpolateGeometry(e,t,i){if(e.type!==t.type)return i<.5?e:t;if("Polygon"===e.type&&"Polygon"===t.type){const o=e.coordinates,n=t.coordinates,r=Math.max(o.length,n.length),s=[];for(let e=0;e<r;e++){s.push(this._interpolateCoordinates(o[e]||o[0]||[],n[e]||n[0]||[],i))}return{type:"Polygon",coordinates:s}}if("MultiPolygon"===e.type&&"MultiPolygon"===t.type){const o=e.coordinates,n=t.coordinates,r=Math.max(o.length,n.length),s=[];for(let e=0;e<r;e++){const t=o[e]||o[0]||[[]],r=n[e]||n[0]||[[]],a=Math.max(t.length,r.length),l=[];for(let e=0;e<a;e++){l.push(this._interpolateCoordinates(t[e]||t[0]||[],r[e]||r[0]||[],i))}s.push(l)}return{type:"MultiPolygon",coordinates:s}}return i<.5?e:t}_animateGeometryTransition(e,t,i,o,n){const r=this._activeTransitions.get(e);r&&cancelAnimationFrame(r);const s=this._getTransitionDurationMs(),a=performance.now(),l=this._layers.get(e);if(!l)return;const c=r=>{const d=Math.min((r-a)/s,1),h=1-Math.pow(1-d,3),p=this._interpolateGeometry(i,o,h),u=_t(t,p);if(l.clearLayers(),l.addData(u),l.setStyle(n),d<1){const t=requestAnimationFrame(c);this._activeTransitions.set(e,t)}else this._activeTransitions.delete(e),this._previousGeometries.set(e,o)},d=requestAnimationFrame(c);this._activeTransitions.set(e,d)}updateConfig(e){this._config=e}updatePolygonsForEntities(e,t){console.log("ABC Emergency Map: updatePolygonsForEntities called with",t.length,"entities");const i=new Set(t);for(const[e,t]of this._layers)i.has(e)||(t.remove(),this._layers.delete(e),this._incidents.delete(e));const o=[];for(const i of t){const t=e.states[i];if(!t){console.log("ABC Emergency Map: Entity not found:",i);continue}if(console.log("ABC Emergency Map: Entity",i,"attributes:",{has_polygon:t.attributes.has_polygon,geometry_type:t.attributes.geometry_type,hasGeojson:!!t.attributes.geojson,hasGeometry:!!t.attributes.geometry}),!yt(t)){console.log("ABC Emergency Map: No polygon data for",i);continue}const n=gt(i,t);if(!n)continue;const r=mt(t);if(!r){console.log("ABC Emergency Map: No geometry extracted for",i);const e=this._layers.get(i);e&&(e.remove(),this._layers.delete(i));continue}const s=!this._knownEntityIds.has(i),a=this._hashIncident(n),l=this._incidentHashes.get(i),c=!s&&l!==a;this._incidents.set(i,n),this._incidentHashes.set(i,a),this._knownEntityIds.add(i),o.push({entityId:i,entity:t,incident:n,geometry:r,isNew:s,isUpdated:c})}o.sort((e,t)=>bt(e.incident.alert_level)-bt(t.incident.alert_level)),console.log("ABC Emergency Map: Rendering order (bottom to top):",o.map(e=>`${e.entityId} (${e.incident.alert_level})`));for(const e of o){const t=this._layers.get(e.entityId);t&&(t.remove(),this._layers.delete(e.entityId))}for(const e of o)console.log("ABC Emergency Map: Rendering polygon for",e.entityId,"severity:",e.incident.alert_level,"type:",e.geometry.type),this._updatePolygonLayer(e.entityId,e.incident,e.geometry,e.isNew,e.isUpdated);console.log("ABC Emergency Map: Polygon rendering complete.",o.length,"entities with polygon data,",this._layers.size,"layers rendered")}_updatePolygonLayer(e,t,i,o=!1,n=!1){const r=this._layers.get(e),s=_t(t,i),a=function(e,t){const i=we(e,t);return{color:i,weight:2,opacity:.8,fillColor:i,fillOpacity:.35}}(t.alert_level,this._config),l=this._hasGeometryChanged(e,i),c=this._previousGeometries.get(e);if(r)l&&c&&this._geometryTransitionsEnabled()&&"Point"!==i.type?(this._animateGeometryTransition(e,t,c,i,a),n&&this._applyAnimation(r,t,"updated")):(r.clearLayers(),r.addData(s),r.setStyle(a),this._previousGeometries.set(e,i),n&&this._applyAnimation(r,t,"updated"));else{console.log("ABC Emergency Map: Creating GeoJSON layer for",e),console.log("ABC Emergency Map: Feature:",JSON.stringify(s,null,2)),console.log("ABC Emergency Map: Style:",a);try{const n=L.geoJSON(s,{style:()=>a,onEachFeature:(e,i)=>{this._bindPopup(i,t)}}).addTo(this._map);console.log("ABC Emergency Map: Layer created, bounds:",n.getBounds()),this._layers.set(e,n),this._previousGeometries.set(e,i),o&&this._applyAnimation(n,t,"new")}catch(e){console.error("ABC Emergency Map: Error creating GeoJSON layer:",e)}}if("extreme"===t.alert_level){const i=this._layers.get(e);i&&this._applyAnimation(i,t,"extreme")}}_bindPopup(e,t){const i=we(t.alert_level,this._config),o=this._getAlertLabel(t.alert_level),n=function(e){if(!e)return"";const t=new Date(e);if(isNaN(t.getTime()))return"";const i=(new Date).getTime()-t.getTime(),o=Math.floor(i/6e4),n=Math.floor(i/36e5),r=Math.floor(i/864e5);return o<1?"Just now":1===o?"1 min ago":o<60?`${o} mins ago`:1===n?"1 hour ago":n<24?`${n} hours ago`:1===r?"1 day ago":`${r} days ago`}(t.last_updated),r=t.event_type&&"unknown"!==t.event_type?`<div class="incident-popup-row"><span class="incident-popup-label">Type:</span> ${this._escapeHtml(t.event_type)}</div>`:"",s=n?`<div class="incident-popup-row"><span class="incident-popup-label">Updated:</span> ${n}</div>`:"",a=t.alert_text?`<div class="incident-popup-advice">${this._escapeHtml(t.alert_text)}</div>`:"",l=t.external_link?`<div class="incident-popup-link"><a href="${this._escapeHtml(t.external_link)}" target="_blank" rel="noopener noreferrer">More Info →</a></div>`:"",c=`incident-popup-${t.id.replace(/[^a-zA-Z0-9]/g,"-")}`,d=`\n      <article class="incident-popup" role="dialog" aria-labelledby="${c}-title">\n        <header class="incident-popup-header" style="border-left: 4px solid ${i}; padding-left: 8px;">\n          <h3 id="${c}-title" class="incident-popup-title">${this._escapeHtml(t.headline)}</h3>\n        </header>\n        <div class="incident-popup-body">\n          <div class="incident-alert-badge" style="background: ${i}; color: ${this._getContrastColor(i)};" role="status" aria-label="Alert level: ${o}">\n            <span aria-hidden="true">${o}</span>\n          </div>\n          ${r}\n          ${s}\n          ${a}\n          ${l}\n        </div>\n      </article>\n    `;e.bindPopup(d,{maxWidth:300,minWidth:200,className:"incident-popup-container"})}_escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}_getContrastColor(e){const t=e.replace("#","");return(.299*parseInt(t.substring(0,2),16)+.587*parseInt(t.substring(2,4),16)+.114*parseInt(t.substring(4,6),16))/255>.5?"#000000":"#ffffff"}_getAlertLabel(e){return{extreme:"Emergency Warning",severe:"Watch and Act",moderate:"Advice",minor:"Information"}[e]||"Information"}_applyAnimation(e,t,i){this._animationsEnabled()&&e.eachLayer(e=>{const o=e.getElement?.();o&&this._applyAnimationToElement(o,t,i)})}_applyAnimationToElement(e,t,i){const o=we(t.alert_level,this._config);switch(e.style.setProperty("--incident-glow-color",`${o}80`),e.style.setProperty("--incident-animation-duration",this._getAnimationDuration()),e.classList.remove("incident-layer-new","incident-layer-updated","incident-layer-extreme"),i){case"new":e.classList.add("incident-layer-new");break;case"updated":e.classList.add("incident-layer-updated");break;case"extreme":e.classList.add("incident-layer-extreme")}}getPolygonBounds(){if(0===this._layers.size)return null;let e=null;for(const t of this._layers.values()){const i=t.getBounds();i.isValid()&&(e?e.extend(i):e=i)}return e}getIncidentPositions(){const e=[];for(const t of this._incidents.values())e.push([t.latitude,t.longitude]);return e}get polygonCount(){return this._layers.size}get incidentCount(){return this._incidents.size}clear(){for(const e of this._activeTransitions.values())cancelAnimationFrame(e);this._activeTransitions.clear();for(const e of this._layers.values())e.remove();this._layers.clear(),this._incidents.clear(),this._incidentHashes.clear(),this._knownEntityIds.clear(),this._previousGeometries.clear()}destroy(){this.clear()}}const xt=[{value:"osm",label:"OpenStreetMap"},{value:"cartodb",label:"CartoDB"},{value:"mapbox",label:"Mapbox (requires API key)"},{value:"custom",label:"Custom URL"}],Ct=[{value:"auto",label:"Auto (from Home Assistant)"},{value:"light",label:"Always Light"},{value:"dark",label:"Always Dark"}],$t=[{value:"australian",label:"Australian Warning System (Default)"},{value:"us_nws",label:"US National Weather Service"},{value:"eu_meteo",label:"European Meteorological"},{value:"high_contrast",label:"High Contrast (Accessibility)"},{value:"custom",label:"Custom Colors"}],At=[{level:"extreme",label:"Emergency Warning"},{level:"severe",label:"Watch and Act"},{level:"moderate",label:"Advice"},{level:"minor",label:"Information"}];let kt=class extends le{static{this.styles=s`
    .editor-container {
      padding: 16px;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 8px;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .form-row-inline {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row-inline > * {
      flex: 1;
    }

    ha-textfield,
    ha-select {
      width: 100%;
    }

    ha-entity-picker {
      width: 100%;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .toggle-label {
      font-size: 14px;
    }

    .toggle-description {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .slider-row {
      margin-bottom: 16px;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .slider-label {
      font-size: 14px;
    }

    .slider-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-color);
    }

    ha-slider {
      width: 100%;
    }

    .source-help {
      padding: 12px;
      background: var(--card-background-color, #f5f5f5);
      border-radius: 4px;
      margin-top: 8px;
    }

    .help-text {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    .help-list {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .help-list li {
      margin-bottom: 4px;
    }

    .help-list code {
      background: var(--code-background-color, rgba(0,0,0,0.1));
      padding: 2px 4px;
      border-radius: 2px;
      font-family: monospace;
      font-size: 11px;
    }

    .color-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .color-label {
      flex: 1;
      font-size: 14px;
    }

    .color-input {
      width: 80px;
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .color-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .color-picker-wrapper {
      position: relative;
    }

    .color-picker {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .color-preview-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 4px;
    }

    .color-preview-swatch {
      flex: 1;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
    }

    .config-warning {
      padding: 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 13px;
    }

    .config-warning.severity-warning {
      background-color: rgba(255, 152, 0, 0.1);
      border-left: 4px solid #ff9800;
    }

    .config-warning.severity-info {
      background-color: rgba(33, 150, 243, 0.1);
      border-left: 4px solid #2196f3;
    }

    .config-warning-message {
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }

    .config-warning-suggestion {
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .input-header {
      margin-bottom: 8px;
    }

    .input-label {
      font-size: 14px;
    }

    .input-with-unit {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-with-unit ha-textfield {
      flex: 1;
    }

    .unit-label {
      font-size: 14px;
      color: var(--secondary-text-color);
      min-width: 50px;
    }
  `}setConfig(e){this._config=e}render(){return this.hass&&this._config?W`
      <div class="editor-container">
        <!-- Basic Settings -->
        <div class="section">
          <div class="section-title">Basic Settings</div>

          <div class="form-row">
            <ha-textfield
              label="Title"
              .value=${this._config.title||""}
              @input=${this._valueChanged}
              .configKey=${"title"}
            ></ha-textfield>
          </div>

          <div class="form-row">
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this._config.entity||""}
              .label=${"Primary Entity (optional)"}
              .includeDomains=${["person","device_tracker","geo_location"]}
              @value-changed=${this._entityChanged}
              allow-custom-entity
            ></ha-entity-picker>
          </div>
        </div>

        <!-- Map Settings -->
        <div class="section">
          <div class="section-title">Map Settings</div>

          ${this._renderSlider("Default Zoom","default_zoom",this._config.default_zoom??10,1,20)}

          <div class="form-row">
            <ha-select
              label="Tile Provider"
              .value=${this._config.tile_provider||"osm"}
              @selected=${this._tileProviderChanged}
              @closed=${e=>e.stopPropagation()}
            >
              ${xt.map(e=>W`
                  <mwc-list-item .value=${e.value}>
                    ${e.label}
                  </mwc-list-item>
                `)}
            </ha-select>
          </div>

          ${"mapbox"===this._config.tile_provider?W`
                <div class="form-row">
                  <ha-textfield
                    label="Mapbox API Key"
                    .value=${this._config.api_key||""}
                    @input=${this._valueChanged}
                    .configKey=${"api_key"}
                    type="password"
                  ></ha-textfield>
                </div>
              `:G}

          ${"custom"===this._config.tile_provider?W`
                <div class="form-row">
                  <ha-textfield
                    label="Custom Tile URL"
                    .value=${this._config.tile_url||""}
                    @input=${this._valueChanged}
                    .configKey=${"tile_url"}
                    placeholder="https://{s}.tile.example.com/{z}/{x}/{y}.png"
                  ></ha-textfield>
                </div>
              `:G}

          <div class="form-row">
            <ha-select
              label="Theme Mode"
              .value=${this._normalizeDarkMode(this._config.dark_mode)}
              @selected=${this._darkModeChanged}
              @closed=${e=>e.stopPropagation()}
            >
              ${Ct.map(e=>W`
                  <mwc-list-item .value=${e.value}>
                    ${e.label}
                  </mwc-list-item>
                `)}
            </ha-select>
          </div>

          ${this._renderToggle("Auto-fit Bounds","Automatically zoom to show all entities","auto_fit",this._config.auto_fit??!0)}
        </div>

        <!-- Display Options -->
        <div class="section">
          <div class="section-title">Display Options</div>

          ${this._renderToggle("Show Zones","Display Home Assistant zones on map","show_zones",this._config.show_zones??!0)}

          ${this._renderToggle("Show Warning Levels","Display ABC Emergency incident polygons","show_warning_levels",this._config.show_warning_levels??!0)}

          ${this._renderToggle("Hide Markers for Polygons","Don't show point markers for incidents with polygon boundaries","hide_markers_for_polygons",this._config.hide_markers_for_polygons??!0)}

          ${this._renderOptionalSlider("Marker Minimum Zoom","Only show markers when zoomed in (0 = always visible)","marker_min_zoom",this._config.marker_min_zoom,0,20)}

          ${this._renderNumberInputWithUnit("Polygon Size Threshold","Show markers for polygons larger than this (0 = disabled)","marker_polygon_threshold",this._config.marker_polygon_threshold,"meters",0,1e5,500)}

          ${this._renderConfigWarnings()}

          ${this._renderToggle("Show History Trails","Display movement history for entities","show_history",this._config.show_history??!1)}

          ${this._config.show_history?this._renderSlider("History Hours","hours_to_show",this._config.hours_to_show??24,1,168):G}

          ${this._renderToggle("Show Badge","Display incident count badge in header","show_badge",this._config.show_badge??!0)}
        </div>

        <!-- Alert Colors -->
        <div class="section">
          <div class="section-title">Alert Colors</div>

          <div class="form-row">
            <ha-select
              label="Color Preset"
              .value=${this._getEffectivePreset()}
              @selected=${this._alertColorPresetChanged}
              @closed=${e=>e.stopPropagation()}
            >
              ${$t.map(e=>W`
                  <mwc-list-item .value=${e.value}>
                    ${e.label}
                  </mwc-list-item>
                `)}
            </ha-select>
          </div>

          ${"custom"===this._getEffectivePreset()?this._renderCustomColors():G}

          <!-- Color Preview -->
          <div class="color-preview-row">
            ${At.map(({level:e,label:t})=>{const i=this._getEffectiveColor(e),o=this._getContrastColor(i);return W`
                <div
                  class="color-preview-swatch"
                  style="background: ${i}; color: ${o};"
                  title="${t}"
                >
                  ${e.charAt(0).toUpperCase()}
                </div>
              `})}
          </div>
        </div>

        <!-- Dynamic Entity Sources -->
        <div class="section">
          <div class="section-title">Dynamic Entity Sources (ABC Emergency)</div>

          <div class="form-row">
            <ha-textfield
              label="Geo-Location Sources (comma-separated)"
              .value=${(this._config.geo_location_sources??[]).join(", ")}
              @input=${this._geoLocationSourcesChanged}
              placeholder="sensor.abc_emergency_treehouse_incidents_total"
              helper="Sensors exposing entity_ids attribute for dynamic geo_location discovery"
            ></ha-textfield>
          </div>

          <div class="source-help">
            <div class="help-text">
              Configure sensors or binary_sensors that expose lists of geo_location entities:
            </div>
            <ul class="help-list">
              <li><code>sensor.*_incidents_total</code> - All incidents</li>
              <li><code>sensor.*_bushfires</code> - Bushfire incidents</li>
              <li><code>sensor.*_watch_and_acts</code> - Watch and Act level</li>
              <li><code>binary_sensor.*_inside_polygon</code> - Containing incidents</li>
            </ul>
          </div>
        </div>

        <!-- Animation Settings -->
        <div class="section">
          <div class="section-title">Animation Settings</div>

          ${this._renderToggle("Enable Animations","Pulse/glow effects for incidents","animations_enabled",this._config.animations_enabled??!0)}

          ${this._renderToggle("Geometry Transitions","Smooth polygon boundary transitions","geometry_transitions",this._config.geometry_transitions??!0)}

          ${this._config.geometry_transitions?this._renderSlider("Transition Duration (ms)","transition_duration",this._config.transition_duration??500,100,2e3):G}
        </div>
      </div>
    `:W``}_renderToggle(e,t,i,o){return W`
      <div class="toggle-row">
        <div>
          <div class="toggle-label">${e}</div>
          <div class="toggle-description">${t}</div>
        </div>
        <ha-switch
          .checked=${o}
          @change=${e=>this._toggleChanged(e,i)}
        ></ha-switch>
      </div>
    `}_renderSlider(e,t,i,o,n){return W`
      <div class="slider-row">
        <div class="slider-header">
          <span class="slider-label">${e}</span>
          <span class="slider-value">${i}</span>
        </div>
        <ha-slider
          .value=${i}
          .min=${o}
          .max=${n}
          .step=${1}
          pin
          @change=${e=>this._sliderChanged(e,t)}
        ></ha-slider>
      </div>
    `}_renderOptionalSlider(e,t,i,o,n,r){const s=o??0,a=0===s?"Always":String(s);return W`
      <div class="slider-row">
        <div class="slider-header">
          <div>
            <span class="slider-label">${e}</span>
            <div class="toggle-description">${t}</div>
          </div>
          <span class="slider-value">${a}</span>
        </div>
        <ha-slider
          .value=${s}
          .min=${n}
          .max=${r}
          .step=${1}
          pin
          @change=${e=>this._optionalSliderChanged(e,i)}
        ></ha-slider>
      </div>
    `}_renderConfigWarnings(){if(!this._config)return G;const e=xe(this._config);return 0===e.length?G:W`
      ${e.map(e=>W`
          <div class="config-warning severity-${e.severity}">
            <div class="config-warning-message">${e.message}</div>
            ${e.suggestion?W`<div class="config-warning-suggestion">
                  ${e.suggestion}
                </div>`:G}
          </div>
        `)}
    `}_optionalSliderChanged(e,t){const i=Number(e.target.value);this._updateConfig({[t]:0===i?void 0:i})}_renderNumberInputWithUnit(e,t,i,o,n,r,s,a=100){return W`
      <div class="form-row">
        <div class="input-header">
          <span class="input-label">${e}</span>
          <div class="toggle-description">${t}</div>
        </div>
        <div class="input-with-unit">
          <ha-textfield
            type="number"
            .value=${String(o??"")}
            .min=${String(r)}
            .max=${String(s)}
            .step=${String(a)}
            @change=${e=>this._numberInputChanged(e,i)}
            placeholder="Disabled"
          ></ha-textfield>
          <span class="unit-label">${n}</span>
        </div>
      </div>
    `}_numberInputChanged(e,t){const i=e.target.value.trim();if(""===i||"0"===i)this._updateConfig({[t]:void 0});else{const e=Number(i);!isNaN(e)&&e>0&&this._updateConfig({[t]:e})}}_valueChanged(e){const t=e.target,i=t.configKey,o=t.value;i&&this._updateConfig({[i]:o||void 0})}_entityChanged(e){this._updateConfig({entity:e.detail.value||void 0})}_tileProviderChanged(e){this._updateConfig({tile_provider:e.target.value})}_normalizeDarkMode(e){return void 0===e?"auto":"boolean"==typeof e?e?"dark":"light":e}_darkModeChanged(e){this._updateConfig({dark_mode:e.target.value})}_toggleChanged(e,t){const i=e.target;this._updateConfig({[t]:i.checked})}_sliderChanged(e,t){const i=e.target;this._updateConfig({[t]:Number(i.value)})}_geoLocationSourcesChanged(e){const t=e.target.value.trim();if(!t)return void this._updateConfig({geo_location_sources:void 0});const i=t.split(",").map(e=>e.trim()).filter(e=>e.length>0);this._updateConfig({geo_location_sources:i.length>0?i:void 0})}_getEffectivePreset(){return this._config?.alert_colors&&Object.keys(this._config.alert_colors).length>0?"custom":this._config?.alert_color_preset||"australian"}_getEffectiveColor(e){if(this._config?.alert_colors?.[e])return this._config.alert_colors[e];const t=this._config?.alert_color_preset||"australian";return be[t]?.[e]||ve[e]}_getContrastColor(e){const t=e.replace("#","");return(.299*parseInt(t.substring(0,2),16)+.587*parseInt(t.substring(2,4),16)+.114*parseInt(t.substring(4,6),16))/255>.5?"#000000":"#ffffff"}_alertColorPresetChanged(e){const t=e.target.value;if("custom"===t){const e={};for(const{level:t}of At)e[t]=this._getEffectiveColor(t);this._updateConfig({alert_color_preset:void 0,alert_colors:e})}else this._updateConfig({alert_color_preset:t,alert_colors:void 0})}_renderCustomColors(){return W`
      <div class="form-row">
        ${At.map(({level:e,label:t})=>{const i=this._config?.alert_colors?.[e]||ve[e];return W`
            <div class="color-row">
              <input
                type="color"
                class="color-picker"
                .value=${i}
                @input=${t=>this._customColorChanged(t,e)}
              />
              <span class="color-label">${t}</span>
              <input
                type="text"
                class="color-input"
                .value=${i}
                @input=${t=>this._customColorTextChanged(t,e)}
                placeholder="#000000"
              />
            </div>
          `})}
      </div>
    `}_customColorChanged(e,t){this._updateAlertColor(t,e.target.value)}_customColorTextChanged(e,t){const i=e.target.value.trim();/^#[0-9A-Fa-f]{6}$/.test(i)&&this._updateAlertColor(t,i)}_updateAlertColor(e,t){this._updateConfig({alert_colors:{...this._config?.alert_colors||{},[e]:t}})}_updateConfig(e){if(!this._config)return;const t={...this._config,...e};this._config=t;const i=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(i)}};e([ue({attribute:!1})],kt.prototype,"hass",void 0),e([ge()],kt.prototype,"_config",void 0),kt=e([de("abc-emergency-map-card-editor")],kt);const Et=[-25.2744,133.7751];let Mt=class extends le{constructor(){super(...arguments),this._loadingState="loading",this._currentDarkMode=!1,this._previousMarkerCount=0,this._previousMarkersVisible=!0}static{this.styles=me}setConfig(e){if(!e)throw new Error("Invalid configuration");xe(e).forEach(e=>{const t="ABC Emergency Map: Config";"warning"===e.severity?(console.warn(`${t} Warning - ${e.message}`),e.suggestion&&console.warn(`${t} Suggestion - ${e.suggestion}`)):(console.info(`${t} Info - ${e.message}`),e.suggestion&&console.info(`${t} Suggestion - ${e.suggestion}`))}),this._config={title:"ABC Emergency Map",default_zoom:10,hours_to_show:24,dark_mode:fe,show_warning_levels:!0,...e}}render(){if(!this._config)return W`<ha-card>Invalid configuration</ha-card>`;return W`
      <ha-card class="${this._currentDarkMode?"theme-dark":"theme-light"}">
        <!-- Skip link for keyboard navigation -->
        <a
          href="#map-content-end"
          class="skip-link"
          @click=${this._handleSkipLink}
        >
          Skip map content
        </a>

        ${this._config.title?W`
            <div class="card-header">
              <span class="header-title" id="map-title">${this._config.title}</span>
            </div>
          `:""}
        <div
          class="map-wrapper"
          role="region"
          aria-label="${this._config.title||"Map"}"
        >
          ${this._renderMapContent()}
        </div>

        <!-- Live region for screen reader announcements -->
        <div
          id="accessibility-live-region"
          class="sr-live-region"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        ></div>

        <!-- End marker for skip link -->
        <div id="map-content-end" tabindex="-1"></div>
      </ha-card>
    `}_handleSkipLink(e){e.preventDefault();const t=this.shadowRoot?.getElementById("map-content-end");t&&t.focus()}_renderMapContent(){const e=Ae();switch(this._loadingState){case"loading":return W`
          <div class="loading-container" role="status" aria-label="Loading map">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div class="loading-text">
              Loading map${e?" (Cast mode)":""}...
            </div>
          </div>
        `;case"error":return W`
          <div class="error-container" role="alert">
            <ha-icon icon="mdi:alert-circle" aria-hidden="true"></ha-icon>
            <div class="error-text">
              ${this._errorMessage||"Failed to load map"}
            </div>
            ${e?W`
                  <div class="error-hint">
                    For Cast devices, consider using the built-in map card.
                  </div>
                `:""}
            <mwc-button @click=${this._retryLoad}>Retry</mwc-button>
          </div>
        `;default:return W`
          <div
            class="map-container"
            id="map"
            role="application"
            aria-label="Interactive emergency map. Use arrow keys to pan, plus and minus to zoom."
            tabindex="0"
            @keydown=${this._handleMapKeydown}
          ></div>
        `}}_handleMapKeydown(e){if(!this._map)return;const t=100;switch(e.key){case"ArrowUp":e.preventDefault(),this._map.panBy([0,-100]);break;case"ArrowDown":e.preventDefault(),this._map.panBy([0,t]);break;case"ArrowLeft":e.preventDefault(),this._map.panBy([-100,0]);break;case"ArrowRight":e.preventDefault(),this._map.panBy([t,0]);break;case"+":case"=":e.preventDefault(),this._map.zoomIn(1);break;case"-":case"_":e.preventDefault(),this._map.zoomOut(1);break;case"Home":if(e.preventDefault(),this._boundsManager){const e=[];this._markerManager&&e.push(...this._markerManager.getMarkerPositions()),this._zoneManager&&e.push(...this._zoneManager.getZonePositions()),this._incidentManager&&e.push(...this._incidentManager.getIncidentPositions()),this._boundsManager.fitToPositions(e,!0)}}}async firstUpdated(e){super.firstUpdated(e),await this._initializeMap()}updated(e){super.updated(e),e.has("hass")&&this._map&&(this._checkThemeChange(),this._updateTileLayer(),this._updateMapData())}_checkThemeChange(){const e=this._isDarkMode();e!==this._currentDarkMode&&(this._currentDarkMode=e,this._currentTileConfig=void 0)}disconnectedCallback(){super.disconnectedCallback(),this._removeThemeListener(),this._cleanup()}connectedCallback(){super.connectedCallback(),this._addThemeListener(),"ready"!==this._loadingState||this._map||this._initializeMap()}_addThemeListener(){this._boundThemeHandler=()=>{this._checkThemeChange(),this._map&&this._updateTileLayer()},window.addEventListener("settheme",this._boundThemeHandler),window.addEventListener("theme-changed",this._boundThemeHandler)}_removeThemeListener(){this._boundThemeHandler&&(window.removeEventListener("settheme",this._boundThemeHandler),window.removeEventListener("theme-changed",this._boundThemeHandler),this._boundThemeHandler=void 0)}async _initializeMap(){const e=Ae();console.log("ABC Emergency Map: Initializing map (v2.1 - Cast compatibility)"+(e?" [Cast Environment]":"")),this._loadingState="loading",this._errorMessage=void 0,this._currentDarkMode=this._isDarkMode();try{await Ke(),this.shadowRoot&&await async function(e){if(console.log("ABC Emergency Map: Injecting Leaflet CSS into shadow root"),e.querySelector("style[data-leaflet-css]"))return void console.log("ABC Emergency Map: Leaflet CSS already injected");const t=await Ue();console.log("ABC Emergency Map: Fetched Leaflet CSS, length:",t.length);const i=document.createElement("style");i.setAttribute("data-leaflet-css","true"),i.textContent=t,e.insertBefore(i,e.firstChild),console.log("ABC Emergency Map: Leaflet CSS injected successfully")}(this.shadowRoot),this._loadingState="ready",await this.updateComplete;const t=this.shadowRoot?.getElementById("map");if(!t)throw new Error("Map container not found in shadow DOM");const i=this._getInitialCenter();this._map=L.map(t,{center:i,zoom:this._config?.default_zoom??4,zoomControl:!0,attributionControl:!0}),this._updateTileLayer(),this._markerManager=new ot(this._map),this._zoneManager=new at(this._map,this._config),this._boundsManager=new lt(this._map,this._config),this._boundsManager.addFitControl(),this._historyManager=new ut(this._map,this._config),this._incidentManager=new wt(this._map,this._config),void 0!==this._config?.marker_min_zoom&&(this._boundZoomHandler=()=>this._updateMarkerZoomVisibility(),this._map.on("zoomend",this._boundZoomHandler),this._updateMarkerZoomVisibility()),this._setupResizeObserver(t),this._handleResize(),this.hass&&this._updateMapData(),e&&console.log("ABC Emergency Map: Successfully initialized in Cast environment")}catch(t){if(console.error("ABC Emergency Map: Failed to initialize map:",t),this._loadingState="error",e){const e=function(e){if(!(e instanceof Error))return ke.UNKNOWN;const t=e.message.toLowerCase();return t.includes("cors")||t.includes("cross-origin")||t.includes("access-control")?ke.CORS_BLOCKED:t.includes("failed to fetch")||t.includes("network")||t.includes("load")?ke.RESOURCE_LOAD_FAILED:t.includes("litelement")||t.includes("lit-element")?ke.LITELEMENT_UNAVAILABLE:ke.UNKNOWN}(t);this._errorMessage=function(e){switch(e){case ke.CORS_BLOCKED:return"Unable to load map resources on Cast device due to CORS restrictions. Try using the built-in map card for Cast, or configure CORS headers.";case ke.RESOURCE_LOAD_FAILED:return"Failed to load map library. Cast devices may have restricted network access.";case ke.LITELEMENT_UNAVAILABLE:return"Unable to initialize card in Cast environment. Home Assistant Cast compatibility issue detected.";case ke.NETWORK_RESTRICTED:return"Network request blocked in Cast environment.";default:return"An error occurred loading the map on Cast device."}}(e),console.error(`ABC Emergency Map: Cast error type: ${e}`,t)}else this._errorMessage=t instanceof Error?t.message:"Unknown error occurred"}}_getInitialCenter(){return void 0!==this.hass?.config?.latitude&&void 0!==this.hass?.config?.longitude?(console.log("ABC Emergency Map: Using HA home location:",this.hass.config.latitude,this.hass.config.longitude),[this.hass.config.latitude,this.hass.config.longitude]):(console.log("ABC Emergency Map: No HA location, using default:",Et),Et)}_isDarkMode(){const e=this._config?.dark_mode??fe;if("boolean"==typeof e)return e;switch(e){case"dark":return!0;case"light":return!1;default:return this._detectHADarkMode()}}_detectHADarkMode(){const e=this.hass?.themes;if(void 0!==e?.darkMode)return e.darkMode;if(window.matchMedia?.("(prefers-color-scheme: dark)").matches)return!0;const t=this.hass?.themes?.theme;return!(!t||!t.toLowerCase().includes("dark"))}_updateTileLayer(){if(!this._map||!this._config)return;const e=this._isDarkMode(),t=qe(this._config,e);this._currentTileConfig&&this._currentTileConfig.url===t.url&&this._currentTileConfig.attribution===t.attribution||(this._tileLayer&&this._tileLayer.remove(),this._tileLayer=L.tileLayer(t.url,{attribution:t.attribution,maxZoom:t.maxZoom,subdomains:t.subdomains}).addTo(this._map),this._currentTileConfig=t)}_setupResizeObserver(e){this._resizeObserver&&this._resizeObserver.disconnect(),this._resizeObserver=new ResizeObserver(()=>{this._resizeDebounce&&window.clearTimeout(this._resizeDebounce),this._resizeDebounce=window.setTimeout(()=>{this._handleResize()},100)}),this._resizeObserver.observe(e)}_handleResize(){this._map&&this._map.invalidateSize({animate:!1})}_cleanup(){this._resizeDebounce&&(window.clearTimeout(this._resizeDebounce),this._resizeDebounce=void 0),this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=void 0),this._tileLayer&&(this._tileLayer.remove(),this._tileLayer=void 0),this._markerManager&&(this._markerManager.destroy(),this._markerManager=void 0),this._zoneManager&&(this._zoneManager.destroy(),this._zoneManager=void 0),this._boundsManager&&(this._boundsManager.destroy(),this._boundsManager=void 0),this._historyManager&&(this._historyManager.destroy(),this._historyManager=void 0),this._incidentManager&&(this._incidentManager.destroy(),this._incidentManager=void 0),this._currentTileConfig=void 0,this._map&&this._boundZoomHandler&&(this._map.off("zoomend",this._boundZoomHandler),this._boundZoomHandler=void 0),this._map&&(this._map.remove(),this._map=void 0)}async _retryLoad(){await this._initializeMap()}_updateMarkerZoomVisibility(){if(!this._map||!this._markerManager||!this._config)return;const e=this._config.marker_min_zoom;if(void 0===e)return;const t=this._map.getZoom()>=e;if(this._markerManager.setZoomVisibility(t),t!==this._previousMarkersVisible){this._previousMarkersVisible=t;this._announceChange(t?"Entity markers now visible":"Entity markers hidden at current zoom level")}}_announceChange(e){this._liveRegion||(this._liveRegion=this.shadowRoot?.getElementById("accessibility-live-region")),this._liveRegion&&e&&(this._liveRegion.textContent="",requestAnimationFrame(()=>{this._liveRegion&&(this._liveRegion.textContent=e)}))}_updateMapData(){if(!this._map||!this.hass||!this._config)return;if(this._zoneManager){this._zoneManager.updateConfig(this._config);const e=function(e){const t=[];for(const i of Object.keys(e.states)){if(!nt(i))continue;const o=rt(i,e.states[i]);o&&t.push(o)}return t}(this.hass);console.log("ABC Emergency Map: Found zones:",e.length,e.map(e=>e.entityId)),this._zoneManager.updateZones(e)}const e=this._markerManager?et(this.hass,this._config):[];console.log("ABC Emergency Map: Found entities:",e.length,e.map(e=>e.entityId));const t=this._config.marker_polygon_threshold,i=this._config.hide_markers_for_polygons??true?e.filter(e=>{const i=this.hass.states[e.entityId];if(!i)return!0;const o=i.attributes.geojson||i.attributes.geometry;if(!o)return!0;const n=o.type||i.attributes.geometry_type;if(function(e){return!!e&&("Polygon"===e||"MultiPolygon"===e||"GeometryCollection"===e)}(n)){if(void 0!==t){const i=Ce.getExtent(e.entityId,o);return i>=t?(console.log("ABC Emergency Map: Large polygon, showing marker:",e.entityId,"extent:",Math.round(i),"m"),!0):(console.log("ABC Emergency Map: Small polygon, hiding marker:",e.entityId,"extent:",Math.round(i),"m, threshold:",t,"m"),!1)}return console.log("ABC Emergency Map: Skipping marker for polygon entity:",e.entityId,"type:",n),!1}return"Point"===n&&console.log("ABC Emergency Map: Rendering Point geometry as marker:",e.entityId),!0}):e;if(void 0!==t){const t=new Set(e.map(e=>e.entityId));Ce.cleanup(t)}if(this._markerManager){this._markerManager.updateMarkers(i),this._updateMarkerZoomVisibility();const e=this._markerManager.markerCount;if(e!==this._previousMarkerCount&&(this._previousMarkerCount=e,e>0)){this._announceChange(`${e} entity ${1===e?"marker":"markers"} displayed`)}}if(this._historyManager){this._historyManager.updateConfig(this._config);const e=i.map(e=>e.entityId);this._historyManager.updateTrails(this.hass,e)}if(this._incidentManager&&!1!==this._config.show_warning_levels){this._incidentManager.updateConfig(this._config);const t=e.map(e=>e.entityId);this._incidentManager.updatePolygonsForEntities(this.hass,t)}if(this._boundsManager){this._boundsManager.updateConfig(this._config);const e=[];this._markerManager&&e.push(...this._markerManager.getMarkerPositions()),this._zoneManager&&e.push(...this._zoneManager.getZonePositions());const t=this._incidentManager?.getPolygonBounds();console.log("ABC Emergency Map: Total positions for bounds:",e.length,e),console.log("ABC Emergency Map: Polygon bounds:",t?.toBBoxString()),this._boundsManager.fitToPositionsAndBounds(e,t)}}getCardSize(){return 5}static getConfigElement(){return document.createElement("abc-emergency-map-card-editor")}static getStubConfig(){return{type:"custom:abc-emergency-map-card",title:"ABC Emergency Map"}}};e([ue({attribute:!1})],Mt.prototype,"hass",void 0),e([ge()],Mt.prototype,"_config",void 0),e([ge()],Mt.prototype,"_loadingState",void 0),e([ge()],Mt.prototype,"_errorMessage",void 0),e([ge()],Mt.prototype,"_currentDarkMode",void 0),Mt=e([de("abc-emergency-map-card")],Mt),window.customCards=window.customCards||[],window.customCards.push({type:"abc-emergency-map-card",name:"ABC Emergency Map Card",description:"Display ABC Emergency incident polygons on a Leaflet map with Australian Warning System colors",preview:!0});export{Mt as ABCEmergencyMapCard};
//# sourceMappingURL=abc-emergency-map-card.js.map
