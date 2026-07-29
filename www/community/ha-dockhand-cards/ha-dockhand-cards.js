const e="dockhand",t={online:"online",cpuUsage:"cpu_usage",memoryUsage:"memory_usage",containers:"containers",stacks:"stacks",imageCount:"image_count",volumeCount:"volume_count",networkCount:"network_count",activityEvents:"activity_events",activityLogging:"activity_logging",metricsCollection:"metrics_collection",vulnerabilityScanning:"vulnerability_scanning",updateChecks:"update_checks",autoUpdate:"auto_update",vulnerabilities:"vulnerabilities",connectionType:"connection_type",diskUsage:"disk_usage",envBulkUpdate:"env_bulk_update",checkUpdates:"check_updates"},n={state:"state",health:"health",cpuPercent:"container_cpu_percent",memoryUsage:"container_memory_usage",memoryPercent:"container_memory_percent",memoryLimit:"container_memory_limit",networkRx:"container_network_rx",networkTx:"container_network_tx",blockRead:"container_block_read",blockWrite:"container_block_write"},i={status:"status",containersInStack:"containers_in_stack",updatesAvailable:"stack_updates_available",gitSyncStatus:"git_stack_sync_status",gitLastSync:"git_stack_last_sync",gitSyncError:"git_stack_sync_error"},s={compact:["online","containers"],standard:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents"],detailed:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents"],full:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents","diskUsage"],custom:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents","diskUsage"]},o=["updateChecks","autoUpdate","vulnerabilityScanning","activityLogging","metricsCollection","connectionType"],a={online:"Online status",cpuUsage:"CPU usage",memoryUsage:"Memory usage",containers:"Container counts",stacks:"Stack counts",imageCount:"Image count",volumeCount:"Volume count",networkCount:"Network count",activityEvents:"Activity events",diskUsage:"Disk usage"},r={cpuPercent:"CPU usage",memoryPercent:"Memory usage %",memoryUsage:"Memory usage",memoryLimit:"Memory limit",networkRx:"Network RX",networkTx:"Network TX",blockRead:"Block read",blockWrite:"Block write"},c={status:"Stack status",containersInStack:"Container count",updatesAvailable:"Pending-updates badge",gitSyncStatus:"Git sync status",gitLastSync:"Git last sync time",gitSyncError:"Git sync error banner"},d=/^env_\d+$/;function l(e){const t=Object.values(e.devices??{}),n=[];for(const e of t)h(e)&&n.push({deviceId:e.id,name:e.name_by_user||e.name||e.id});return n.sort((e,t)=>e.name.localeCompare(t.name))}function h(t){return(t.identifiers??[]).some(([t,n])=>t===e&&d.test(n))}function _(t){for(const[n,i]of t.identifiers??[]){if(n!==e)continue;if(d.exec(i))return Number(i.slice(4))}return null}function u(t,n){const i=`container_${n}_`;return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&n.startsWith(i)))}function m(t){return(t.identifiers??[]).some(([t,n])=>t===e&&/^container_\d+_/.test(n))}function p(t,n){const i=`stack_${n}_`;return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&n.startsWith(i)))}function v(t){for(const[n,i]of t.identifiers??[]){if(n!==e)continue;const t=/^container_(\d+)_/.exec(i);if(t)return Number(t[1])}return null}function g(t){for(const[n,i]of t.identifiers??[]){if(n!==e)continue;const t=/^stack_(\d+)_/.exec(i);if(t)return Number(t[1])}return null}function b(e,t){for(const n of Object.values(e.devices??{}))if(h(n)&&_(n)===t)return n.id;return null}function f(e,t,n,i){var s,o=arguments.length,a=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var r=e.length-1;r>=0;r--)(s=e[r])&&(a=(o<3?s(a):o>3?s(t,n,a):s(t,n))||a);return o>3&&a&&Object.defineProperty(t,n,a),a}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const k=globalThis,y=k.ShadowRoot&&(void 0===k.ShadyCSS||k.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,w=Symbol(),$=new WeakMap;let x=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==w)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(y&&void 0===e){const n=void 0!==t&&1===t.length;n&&(e=$.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&$.set(t,e))}return e}toString(){return this.cssText}};const C=(e,...t)=>{const n=1===e.length?e[0]:t.reduce((t,n,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new x(n,e,w)},S=y?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new x("string"==typeof e?e:e+"",void 0,w))(t)})(e):e,{is:z,defineProperty:E,getOwnPropertyDescriptor:A,getOwnPropertyNames:I,getOwnPropertySymbols:U,getPrototypeOf:D}=Object,j=globalThis,P=j.trustedTypes,O=P?P.emptyScript:"",T=j.reactiveElementPolyfillSupport,N=(e,t)=>e,L={toAttribute(e,t){switch(t){case Boolean:e=e?O:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},M=(e,t)=>!z(e,t),R={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:M};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),j.litPropertyMetadata??=new WeakMap;let H=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=R){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);void 0!==i&&E(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:s}=A(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const o=i?.call(this);s?.call(this,t),this.requestUpdate(e,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??R}static _$Ei(){if(this.hasOwnProperty(N("elementProperties")))return;const e=D(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(N("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(N("properties"))){const e=this.properties,t=[...I(e),...U(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const n=this._$Eu(e,t);void 0!==n&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(S(e))}else void 0!==e&&t.push(S(e));return t}static _$Eu(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(y)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const n of t){const t=document.createElement("style"),i=k.litNonce;void 0!==i&&t.setAttribute("nonce",i),t.textContent=n.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(void 0!==i&&!0===n.reflect){const s=(void 0!==n.converter?.toAttribute?n.converter:L).toAttribute(t,n.type);this._$Em=e,null==s?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=n.getPropertyOptions(i),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:L;this._$Em=i;const o=s.fromAttribute(t,e.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,n,i=!1,s){if(void 0!==e){const o=this.constructor;if(!1===i&&(s=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??M)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:s},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==s||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e){const{wrapped:e}=n,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,n,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[N("elementProperties")]=new Map,H[N("finalized")]=new Map,T?.({ReactiveElement:H}),(j.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K=globalThis,V=e=>e,B=K.trustedTypes,q=B?B.createPolicy("lit-html",{createHTML:e=>e}):void 0,G="$lit$",F=`lit$${Math.random().toFixed(9).slice(2)}$`,W="?"+F,X=`<${W}>`,Z=document,Y=()=>Z.createComment(""),J=e=>null===e||"object"!=typeof e&&"function"!=typeof e,Q=Array.isArray,ee="[ \t\n\f\r]",te=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ne=/-->/g,ie=/>/g,se=RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),oe=/'/g,ae=/"/g,re=/^(?:script|style|textarea|title)$/i,ce=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),de=Symbol.for("lit-noChange"),le=Symbol.for("lit-nothing"),he=new WeakMap,_e=Z.createTreeWalker(Z,129);function ue(e,t){if(!Q(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==q?q.createHTML(t):t}const me=(e,t)=>{const n=e.length-1,i=[];let s,o=2===t?"<svg>":3===t?"<math>":"",a=te;for(let t=0;t<n;t++){const n=e[t];let r,c,d=-1,l=0;for(;l<n.length&&(a.lastIndex=l,c=a.exec(n),null!==c);)l=a.lastIndex,a===te?"!--"===c[1]?a=ne:void 0!==c[1]?a=ie:void 0!==c[2]?(re.test(c[2])&&(s=RegExp("</"+c[2],"g")),a=se):void 0!==c[3]&&(a=se):a===se?">"===c[0]?(a=s??te,d=-1):void 0===c[1]?d=-2:(d=a.lastIndex-c[2].length,r=c[1],a=void 0===c[3]?se:'"'===c[3]?ae:oe):a===ae||a===oe?a=se:a===ne||a===ie?a=te:(a=se,s=void 0);const h=a===se&&e[t+1].startsWith("/>")?" ":"";o+=a===te?n+X:d>=0?(i.push(r),n.slice(0,d)+G+n.slice(d)+F+h):n+F+(-2===d?t:h)}return[ue(e,o+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class pe{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let s=0,o=0;const a=e.length-1,r=this.parts,[c,d]=me(e,t);if(this.el=pe.createElement(c,n),_e.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=_e.nextNode())&&r.length<a;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(G)){const t=d[o++],n=i.getAttribute(e).split(F),a=/([.?@])?(.*)/.exec(t);r.push({type:1,index:s,name:a[2],strings:n,ctor:"."===a[1]?ke:"?"===a[1]?ye:"@"===a[1]?we:fe}),i.removeAttribute(e)}else e.startsWith(F)&&(r.push({type:6,index:s}),i.removeAttribute(e));if(re.test(i.tagName)){const e=i.textContent.split(F),t=e.length-1;if(t>0){i.textContent=B?B.emptyScript:"";for(let n=0;n<t;n++)i.append(e[n],Y()),_e.nextNode(),r.push({type:2,index:++s});i.append(e[t],Y())}}}else if(8===i.nodeType)if(i.data===W)r.push({type:2,index:s});else{let e=-1;for(;-1!==(e=i.data.indexOf(F,e+1));)r.push({type:7,index:s}),e+=F.length-1}s++}}static createElement(e,t){const n=Z.createElement("template");return n.innerHTML=e,n}}function ve(e,t,n=e,i){if(t===de)return t;let s=void 0!==i?n._$Co?.[i]:n._$Cl;const o=J(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),void 0===o?s=void 0:(s=new o(e),s._$AT(e,n,i)),void 0!==i?(n._$Co??=[])[i]=s:n._$Cl=s),void 0!==s&&(t=ve(e,s._$AS(e,t.values),s,i)),t}class ge{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??Z).importNode(t,!0);_e.currentNode=i;let s=_e.nextNode(),o=0,a=0,r=n[0];for(;void 0!==r;){if(o===r.index){let t;2===r.type?t=new be(s,s.nextSibling,this,e):1===r.type?t=new r.ctor(s,r.name,r.strings,this,e):6===r.type&&(t=new $e(s,this,e)),this._$AV.push(t),r=n[++a]}o!==r?.index&&(s=_e.nextNode(),o++)}return _e.currentNode=Z,i}p(e){let t=0;for(const n of this._$AV)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class be{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=le,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ve(this,e,t),J(e)?e===le||null==e||""===e?(this._$AH!==le&&this._$AR(),this._$AH=le):e!==this._$AH&&e!==de&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>Q(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==le&&J(this._$AH)?this._$AA.nextSibling.data=e:this.T(Z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i="number"==typeof n?this._$AC(e):(void 0===n.el&&(n.el=pe.createElement(ue(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new ge(i,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=he.get(e.strings);return void 0===t&&he.set(e.strings,t=new pe(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const s of e)i===t.length?t.push(n=new be(this.O(Y()),this.O(Y()),this,this.options)):n=t[i],n._$AI(s),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=V(e).nextSibling;V(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class fe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,s){this.type=1,this._$AH=le,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=le}_$AI(e,t=this,n,i){const s=this.strings;let o=!1;if(void 0===s)e=ve(this,e,t,0),o=!J(e)||e!==this._$AH&&e!==de,o&&(this._$AH=e);else{const i=e;let a,r;for(e=s[0],a=0;a<s.length-1;a++)r=ve(this,i[n+a],t,a),r===de&&(r=this._$AH[a]),o||=!J(r)||r!==this._$AH[a],r===le?e=le:e!==le&&(e+=(r??"")+s[a+1]),this._$AH[a]=r}o&&!i&&this.j(e)}j(e){e===le?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ke extends fe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===le?void 0:e}}class ye extends fe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==le)}}class we extends fe{constructor(e,t,n,i,s){super(e,t,n,i,s),this.type=5}_$AI(e,t=this){if((e=ve(this,e,t,0)??le)===de)return;const n=this._$AH,i=e===le&&n!==le||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==le&&(n===le||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class $e{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){ve(this,e)}}const xe=K.litHtmlPolyfillSupport;xe?.(pe,be),(K.litHtmlVersions??=[]).push("3.3.3");const Ce=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let Se=class extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,n)=>{const i=n?.renderBefore??t;let s=i._$litPart$;if(void 0===s){const e=n?.renderBefore??null;i._$litPart$=s=new be(t.insertBefore(Y(),e),e,void 0,n??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return de}};Se._$litElement$=!0,Se.finalized=!0,Ce.litElementHydrateSupport?.({LitElement:Se});const ze=Ce.litElementPolyfillSupport;ze?.({LitElement:Se}),(Ce.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ee={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:M},Ae=(e=Ee,t,n)=>{const{kind:i,metadata:s}=n;let o=globalThis.litPropertyMetadata.get(s);if(void 0===o&&globalThis.litPropertyMetadata.set(s,o=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),o.set(n.name,e),"accessor"===i){const{name:i}=n;return{set(n){const s=t.get.call(this);t.set.call(this,n),this.requestUpdate(i,s,e,!0,n)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=n;return function(n){const s=this[i];t.call(this,n),this.requestUpdate(i,s,e,!0,n)}}throw Error("Unsupported decorator location: "+i)};function Ie(e){return(t,n)=>"object"==typeof n?Ae(e,t,n):((e,t,n)=>{const i=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),i?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ue(e){return Ie({...e,state:!0,attribute:!1})}var De,je;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(De||(De={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(je||(je={}));var Pe=function(e,t,n,i){i=i||{},n=null==n?{}:n;var s=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return s.detail=n,e.dispatchEvent(s),s};function Oe(t,n,i,s){const o=new Map(function(t,n){return Object.values(t.entities??{}).filter(t=>t.device_id===n&&t.platform===e)}(t,n).map(e=>[e.translation_key,e])),a={},r=[];for(const e of s){const n=i[e],s=o.get(n);if(!s){r.push({key:e,entityId:null,reason:"not_found"});continue}if(s.disabled_by){r.push({key:e,entityId:s.entity_id,reason:"disabled"});continue}const c=t.states[s.entity_id];c?a[e]={key:e,entityId:s.entity_id,state:c}:r.push({key:e,entityId:s.entity_id,reason:"not_found"})}return{found:a,unavailable:r}}function Te(e,n,i){return Oe(e,n,t,i)}function Ne(e,t,i){return Oe(e,t,n,i)}function Le(e,t,n){return Oe(e,t,i,n)}function Me(t,n,i){const s=Object.values(t.entities??{}).find(t=>t.device_id===n&&t.platform===e&&t.entity_id.startsWith(`${i}.`)&&!t.disabled_by);if(!s)return null;const o=t.states[s.entity_id];return o?{entityId:s.entity_id,state:o}:null}function Re(e){if(null==e||Number.isNaN(e))return"—";if(0===e)return"0 B";const t=["B","KB","MB","GB","TB"],n=Math.min(Math.floor(Math.log(Math.abs(e))/Math.log(1024)),t.length-1);return`${(e/Math.pow(1024,n)).toFixed(0===n?0:1)} ${t[n]}`}function He(e){return e>=90?"error":e>=70?"warn":"ok"}function Ke(e){if(!e)return null;try{return new URL(e).origin}catch{return null}}const Ve="mdi:link-off",Be={environment:"Environment",stack:"Stack",container:"Container",title_override:"Title override (optional)",show_settings_link:"Show link to open in Dockhand",display_mode:"Display mode",mode_compact:"Compact",mode_standard:"Standard",mode_detailed:"Detailed",mode_full:"Full",mode_custom:"Custom",no_environments_found:"No Dockhand environment devices found. Make sure the ha-dockhand integration is set up and has at least one environment configured.",no_stacks_found:"No stacks found for this environment yet.",no_containers_found:"No containers found for this environment yet.",columns:"Columns",columns_auto:"Auto (fits available width, mobile-friendly)",section_container_counts:"Container counts (+ health banner)",section_metrics:"CPU / memory bars",section_resources:"Images / stacks / volumes / networks",section_events_summary:"Events (today / total)",section_recent_events:"Recent events list",section_top_containers:"Top containers by CPU",section_disk_usage:"Disk usage breakdown",section_history_chart:"CPU / memory history chart",label_environments:"Environments",label_vulnerabilities:"Vulnerabilities",label_stacks:"Stacks",label_containers:"Containers",label_updates:"Updates",environment_card_mode:"Environment card mode",vulnerabilities_hint:'Needs the "Vulnerabilities" sensor enabled per environment.',updates_hint:"Creates one Updates card per environment, not one shared card.",hide_updates_global:"Hide Updates card when no updates",hide_updates_global_hint:"Hides only that environment’s card, not all of them.",section_order_heading:"Section order",section_order_hint:"Turned-off sections stay in the list (dimmed) so you can arrange them ahead of time.",environment_order_heading:"Environment order",environment_order_hint:"The eye icon hides an environment entirely; the pencil overrides its card settings just for that environment.",show_this_environment:"Show this environment",hide_this_environment:"Hide this environment",override_env_settings:"Override this environment’s card settings",back:"Back",overrides_from_default_badge:"Overrides from default",detail_view_hint:"Blank fields, or switches left off, keep using the shared default from above.",detail_section_environment:"Environment card",detail_section_vulnerabilities:"Vulnerability card",detail_section_stacks:"Stacks card",detail_section_containers:"Containers card",detail_section_updates:"Updates card",hide_when_no_updates_override:"Hide when no updates",updates_scope_label:"Scope",updates_scope_all:"All environments",updates_scope_environment:"One environment",hide_when_no_updates_helper:"The card is fully removed when hidden, not just emptied.",custom_sections_label:"Custom sections",visible_badges_label:"Details to show",badge_container_count:"Container count",badge_updates:"Updates available",badge_type:"Stack type",badge_health:"Health",badge_cpu:"CPU usage",badge_memory:"Memory usage",mode_hint_detailed:"Needs a recent ha-dockhand release for top containers and recent events.",mode_hint_full:"Needs the Disk usage sensor enabled, and Home Assistant’s recorder to have history, for the disk and history sections.",mode_hint_custom:"Pick exactly which sections to show.",settings_link_open:"Open in Dockhand",settings_link_view_containers:"View containers in Dockhand",settings_link_view_stacks:"View stacks in Dockhand",settings_link_view_vulnerabilities:"View vulnerabilities in Dockhand",settings_link_unavailable:"Can’t open Dockhand — the configured URL doesn’t look valid. Check the URL in the ha-dockhand integration’s settings."},qe={en:Be,de:{environment:"Umgebung",stack:"Stack",container:"Container",title_override:"Titel überschreiben (optional)",show_settings_link:"Link zum Öffnen in Dockhand anzeigen",display_mode:"Anzeigemodus",mode_compact:"Kompakt",mode_standard:"Standard",mode_detailed:"Detailliert",mode_full:"Vollständig",mode_custom:"Benutzerdefiniert",no_environments_found:"Keine Dockhand-Umgebungsgeräte gefunden. Stellen Sie sicher, dass die ha-dockhand-Integration eingerichtet ist und mindestens eine Umgebung konfiguriert wurde.",no_stacks_found:"Für diese Umgebung wurden noch keine Stacks gefunden.",no_containers_found:"Für diese Umgebung wurden noch keine Container gefunden.",columns:"Spalten",columns_auto:"Automatisch (passt sich der verfügbaren Breite an, mobilfreundlich)",section_container_counts:"Container-Anzahl (+ Statusbanner)",section_metrics:"CPU-/Speicherbalken",section_resources:"Images / Stacks / Volumes / Netzwerke",section_events_summary:"Ereignisse (heute / gesamt)",section_recent_events:"Liste der letzten Ereignisse",section_top_containers:"Top-Container nach CPU",section_disk_usage:"Festplattennutzung im Detail",section_history_chart:"CPU-/Speicherverlaufsdiagramm",label_environments:"Umgebungen",label_vulnerabilities:"Schwachstellen",label_stacks:"Stacks",label_containers:"Container",label_updates:"Updates",environment_card_mode:"Umgebungskarten-Modus",vulnerabilities_hint:"Erfordert den aktivierten „Schwachstellen“-Sensor pro Umgebung.",updates_hint:"Erstellt eine Updates-Karte pro Umgebung, nicht eine gemeinsame Karte.",hide_updates_global:"Updates-Karte ausblenden, wenn keine Updates vorliegen",hide_updates_global_hint:"Blendet nur die Karte dieser Umgebung aus, nicht alle.",section_order_heading:"Reihenfolge der Abschnitte",section_order_hint:"Deaktivierte Abschnitte bleiben (abgeblendet) in der Liste, damit Sie sie schon vorab anordnen können.",environment_order_heading:"Reihenfolge der Umgebungen",environment_order_hint:"Das Augensymbol blendet eine Umgebung vollständig aus; der Stift überschreibt ihre Karteneinstellungen nur für diese Umgebung.",show_this_environment:"Diese Umgebung anzeigen",hide_this_environment:"Diese Umgebung ausblenden",override_env_settings:"Karteneinstellungen dieser Umgebung überschreiben",back:"Zurück",overrides_from_default_badge:"Überschreibt Standardwerte",detail_view_hint:"Leere Felder oder ausgeschaltete Schalter verwenden weiterhin den gemeinsamen Standardwert von oben.",detail_section_environment:"Umgebungskarte",detail_section_vulnerabilities:"Schwachstellenkarte",detail_section_stacks:"Stacks-Karte",detail_section_containers:"Container-Karte",detail_section_updates:"Updates-Karte",hide_when_no_updates_override:"Ausblenden, wenn keine Updates vorliegen",updates_scope_label:"Bereich",updates_scope_all:"Alle Umgebungen",updates_scope_environment:"Eine Umgebung",hide_when_no_updates_helper:"Die Karte wird beim Ausblenden vollständig entfernt, nicht nur geleert.",custom_sections_label:"Benutzerdefinierte Abschnitte",visible_badges_label:"Anzuzeigende Details",badge_container_count:"Containeranzahl",badge_updates:"Updates verfügbar",badge_type:"Stack-Typ",badge_health:"Zustand",badge_cpu:"CPU-Auslastung",badge_memory:"Speichernutzung",mode_hint_detailed:"Benötigt eine aktuelle ha-dockhand-Version für Top-Container und aktuelle Ereignisse.",mode_hint_full:"Benötigt den aktivierten Speicherplatznutzungs-Sensor sowie den Home Assistant Recorder mit Verlaufsdaten für die Speicherplatz- und Verlaufsabschnitte.",mode_hint_custom:"Wählen Sie genau aus, welche Abschnitte angezeigt werden sollen.",settings_link_open:"In Dockhand öffnen",settings_link_view_containers:"Container in Dockhand anzeigen",settings_link_view_stacks:"Stacks in Dockhand anzeigen",settings_link_view_vulnerabilities:"Sicherheitslücken in Dockhand anzeigen",settings_link_unavailable:"Dockhand kann nicht geöffnet werden — die konfigurierte URL scheint ungültig zu sein. Überprüfen Sie die URL in den Einstellungen der ha-dockhand-Integration."},es:{environment:"Entorno",stack:"Stack",container:"Contenedor",title_override:"Título personalizado (opcional)",show_settings_link:"Mostrar enlace para abrir en Dockhand",display_mode:"Modo de visualización",mode_compact:"Compacto",mode_standard:"Estándar",mode_detailed:"Detallado",mode_full:"Completo",mode_custom:"Personalizado",no_environments_found:"No se encontraron dispositivos de entorno de Dockhand. Asegúrese de que la integración ha-dockhand esté configurada y tenga al menos un entorno configurado.",no_stacks_found:"Aún no se encontraron stacks para este entorno.",no_containers_found:"Aún no se encontraron contenedores para este entorno.",columns:"Columnas",columns_auto:"Automático (se ajusta al ancho disponible, apto para móviles)",section_container_counts:"Recuento de contenedores (+ banner de estado)",section_metrics:"Barras de CPU/memoria",section_resources:"Imágenes / stacks / volúmenes / redes",section_events_summary:"Eventos (hoy / total)",section_recent_events:"Lista de eventos recientes",section_top_containers:"Contenedores principales por CPU",section_disk_usage:"Desglose del uso de disco",section_history_chart:"Gráfico de historial de CPU/memoria",label_environments:"Entornos",label_vulnerabilities:"Vulnerabilidades",label_stacks:"Stacks",label_containers:"Contenedores",label_updates:"Actualizaciones",environment_card_mode:"Modo de la tarjeta de entorno",vulnerabilities_hint:"Necesita el sensor de “Vulnerabilidades” habilitado por entorno.",updates_hint:"Crea una tarjeta de actualizaciones por entorno, no una tarjeta compartida.",hide_updates_global:"Ocultar la tarjeta de actualizaciones cuando no haya actualizaciones",hide_updates_global_hint:"Solo oculta la tarjeta de ese entorno, no todas.",section_order_heading:"Orden de las secciones",section_order_hint:"Las secciones desactivadas permanecen en la lista (atenuadas) para que puedas organizarlas de antemano.",environment_order_heading:"Orden de los entornos",environment_order_hint:"El icono del ojo oculta un entorno por completo; el lápiz anula la configuración de sus tarjetas solo para ese entorno.",show_this_environment:"Mostrar este entorno",hide_this_environment:"Ocultar este entorno",override_env_settings:"Anular la configuración de las tarjetas de este entorno",back:"Atrás",overrides_from_default_badge:"Anulaciones del valor predeterminado",detail_view_hint:"Los campos en blanco, o los interruptores apagados, siguen usando el valor predeterminado compartido de arriba.",detail_section_environment:"Tarjeta de entorno",detail_section_vulnerabilities:"Tarjeta de vulnerabilidades",detail_section_stacks:"Tarjeta de stacks",detail_section_containers:"Tarjeta de contenedores",detail_section_updates:"Tarjeta de actualizaciones",hide_when_no_updates_override:"Ocultar cuando no haya actualizaciones",updates_scope_label:"Ámbito",updates_scope_all:"Todos los entornos",updates_scope_environment:"Un entorno",hide_when_no_updates_helper:"La tarjeta se elimina por completo al ocultarla, no solo se vacía.",custom_sections_label:"Secciones personalizadas",visible_badges_label:"Detalles a mostrar",badge_container_count:"Número de contenedores",badge_updates:"Actualizaciones disponibles",badge_type:"Tipo de stack",badge_health:"Salud",badge_cpu:"Uso de CPU",badge_memory:"Uso de memoria",mode_hint_detailed:"Requiere una versión reciente de ha-dockhand para los contenedores principales y eventos recientes.",mode_hint_full:"Requiere el sensor de uso de disco habilitado, y que el recorder de Home Assistant tenga historial, para las secciones de disco e historial.",mode_hint_custom:"Elige exactamente qué secciones mostrar.",settings_link_open:"Abrir en Dockhand",settings_link_view_containers:"Ver contenedores en Dockhand",settings_link_view_stacks:"Ver stacks en Dockhand",settings_link_view_vulnerabilities:"Ver vulnerabilidades en Dockhand",settings_link_unavailable:"No se puede abrir Dockhand: la URL configurada no parece válida. Compruebe la URL en la configuración de la integración ha-dockhand."},fr:{environment:"Environnement",stack:"Stack",container:"Conteneur",title_override:"Titre personnalisé (facultatif)",show_settings_link:"Afficher le lien pour ouvrir dans Dockhand",display_mode:"Mode d'affichage",mode_compact:"Compact",mode_standard:"Standard",mode_detailed:"Détaillé",mode_full:"Complet",mode_custom:"Personnalisé",no_environments_found:"Aucun appareil d'environnement Dockhand trouvé. Assurez-vous que l'intégration ha-dockhand est configurée et qu'au moins un environnement est défini.",no_stacks_found:"Aucun stack trouvé pour cet environnement pour le moment.",no_containers_found:"Aucun conteneur trouvé pour cet environnement pour le moment.",columns:"Colonnes",columns_auto:"Automatique (s'adapte à la largeur disponible, adapté au mobile)",section_container_counts:"Nombre de conteneurs (+ bannière d’état)",section_metrics:"Barres CPU/mémoire",section_resources:"Images / piles / volumes / réseaux",section_events_summary:"Événements (aujourd’hui / total)",section_recent_events:"Liste des événements récents",section_top_containers:"Conteneurs les plus consommateurs de CPU",section_disk_usage:"Répartition de l’utilisation du disque",section_history_chart:"Graphique d’historique CPU/mémoire",label_environments:"Environnements",label_vulnerabilities:"Vulnérabilités",label_stacks:"Piles",label_containers:"Conteneurs",label_updates:"Mises à jour",environment_card_mode:"Mode de la carte d’environnement",vulnerabilities_hint:"Nécessite le capteur « Vulnérabilités » activé par environnement.",updates_hint:"Crée une carte de mises à jour par environnement, pas une carte partagée.",hide_updates_global:"Masquer la carte des mises à jour en l’absence de mise à jour",hide_updates_global_hint:"Masque uniquement la carte de cet environnement, pas toutes.",section_order_heading:"Ordre des sections",section_order_hint:"Les sections désactivées restent dans la liste (atténuées) afin de pouvoir les organiser à l’avance.",environment_order_heading:"Ordre des environnements",environment_order_hint:"L’icône œil masque entièrement un environnement ; le crayon modifie les paramètres de ses cartes uniquement pour cet environnement.",show_this_environment:"Afficher cet environnement",hide_this_environment:"Masquer cet environnement",override_env_settings:"Modifier les paramètres des cartes de cet environnement",back:"Retour",overrides_from_default_badge:"Modifications par rapport aux valeurs par défaut",detail_view_hint:"Les champs vides, ou les interrupteurs éteints, continuent d’utiliser la valeur par défaut partagée ci-dessus.",detail_section_environment:"Carte d’environnement",detail_section_vulnerabilities:"Carte de vulnérabilités",detail_section_stacks:"Carte des piles",detail_section_containers:"Carte des conteneurs",detail_section_updates:"Carte des mises à jour",hide_when_no_updates_override:"Masquer en l’absence de mise à jour",updates_scope_label:"Portée",updates_scope_all:"Tous les environnements",updates_scope_environment:"Un environnement",hide_when_no_updates_helper:"La carte est entièrement supprimée lorsqu’elle est masquée, pas seulement vidée.",custom_sections_label:"Sections personnalisées",visible_badges_label:"Détails à afficher",badge_container_count:"Nombre de conteneurs",badge_updates:"Mises à jour disponibles",badge_type:"Type de pile",badge_health:"État de santé",badge_cpu:"Utilisation du CPU",badge_memory:"Utilisation de la mémoire",mode_hint_detailed:"Nécessite une version récente de ha-dockhand pour les conteneurs principaux et les événements récents.",mode_hint_full:"Nécessite le capteur d’utilisation du disque activé, et l’historique de l’enregistreur de Home Assistant, pour les sections disque et historique.",mode_hint_custom:"Choisissez exactement les sections à afficher.",settings_link_open:"Ouvrir dans Dockhand",settings_link_view_containers:"Voir les conteneurs dans Dockhand",settings_link_view_stacks:"Voir les piles dans Dockhand",settings_link_view_vulnerabilities:"Voir les vulnérabilités dans Dockhand",settings_link_unavailable:"Impossible d’ouvrir Dockhand — l’URL configurée ne semble pas valide. Vérifiez l’URL dans les paramètres de l’intégration ha-dockhand."},it:{environment:"Ambiente",stack:"Stack",container:"Container",title_override:"Titolo personalizzato (opzionale)",show_settings_link:"Mostra link per aprire in Dockhand",display_mode:"Modalità di visualizzazione",mode_compact:"Compatta",mode_standard:"Standard",mode_detailed:"Dettagliata",mode_full:"Completa",mode_custom:"Personalizzato",no_environments_found:"Nessun dispositivo ambiente Dockhand trovato. Assicurati che l'integrazione ha-dockhand sia configurata e che ci sia almeno un ambiente impostato.",no_stacks_found:"Nessuno stack trovato ancora per questo ambiente.",no_containers_found:"Nessun container trovato ancora per questo ambiente.",columns:"Colonne",columns_auto:"Automatico (si adatta alla larghezza disponibile, ottimizzato per mobile)",section_container_counts:"Conteggio contenitori (+ banner di stato)",section_metrics:"Barre CPU/memoria",section_resources:"Immagini / stack / volumi / reti",section_events_summary:"Eventi (oggi / totale)",section_recent_events:"Elenco eventi recenti",section_top_containers:"Contenitori principali per CPU",section_disk_usage:"Dettaglio utilizzo disco",section_history_chart:"Grafico cronologico CPU/memoria",label_environments:"Ambienti",label_vulnerabilities:"Vulnerabilità",label_stacks:"Stack",label_containers:"Contenitori",label_updates:"Aggiornamenti",environment_card_mode:"Modalità della scheda ambiente",vulnerabilities_hint:'Richiede il sensore "Vulnerabilità" abilitato per ambiente.',updates_hint:"Crea una scheda aggiornamenti per ambiente, non una scheda condivisa.",hide_updates_global:"Nascondi la scheda aggiornamenti quando non ci sono aggiornamenti",hide_updates_global_hint:"Nasconde solo la scheda di quell’ambiente, non tutte.",section_order_heading:"Ordine delle sezioni",section_order_hint:"Le sezioni disattivate restano nell’elenco (attenuate) così da poterle organizzare in anticipo.",environment_order_heading:"Ordine degli ambienti",environment_order_hint:"L’icona dell’occhio nasconde completamente un ambiente; la matita sovrascrive le impostazioni delle sue schede solo per quell’ambiente.",show_this_environment:"Mostra questo ambiente",hide_this_environment:"Nascondi questo ambiente",override_env_settings:"Sovrascrivi le impostazioni delle schede di questo ambiente",back:"Indietro",overrides_from_default_badge:"Sovrascritture dai valori predefiniti",detail_view_hint:"I campi vuoti, o gli interruttori spenti, continuano a usare il valore predefinito condiviso sopra.",detail_section_environment:"Scheda ambiente",detail_section_vulnerabilities:"Scheda vulnerabilità",detail_section_stacks:"Scheda stack",detail_section_containers:"Scheda contenitori",detail_section_updates:"Scheda aggiornamenti",hide_when_no_updates_override:"Nascondi quando non ci sono aggiornamenti",updates_scope_label:"Ambito",updates_scope_all:"Tutti gli ambienti",updates_scope_environment:"Un ambiente",hide_when_no_updates_helper:"La scheda viene completamente rimossa quando nascosta, non solo svuotata.",custom_sections_label:"Sezioni personalizzate",visible_badges_label:"Dettagli da mostrare",badge_container_count:"Numero di container",badge_updates:"Aggiornamenti disponibili",badge_type:"Tipo di stack",badge_health:"Stato di salute",badge_cpu:"Utilizzo CPU",badge_memory:"Utilizzo memoria",mode_hint_detailed:"Richiede una versione recente di ha-dockhand per i container principali e gli eventi recenti.",mode_hint_full:"Richiede il sensore di utilizzo del disco abilitato e la cronologia del recorder di Home Assistant per le sezioni disco e cronologia.",mode_hint_custom:"Scegli esattamente quali sezioni mostrare.",settings_link_open:"Apri in Dockhand",settings_link_view_containers:"Visualizza container in Dockhand",settings_link_view_stacks:"Visualizza stack in Dockhand",settings_link_view_vulnerabilities:"Visualizza vulnerabilità in Dockhand",settings_link_unavailable:"Impossibile aprire Dockhand: l’URL configurato non sembra valido. Controlla l’URL nelle impostazioni dell’integrazione ha-dockhand."},nb:{environment:"Miljø",stack:"Stack",container:"Container",title_override:"Tittel-overstyring (valgfritt)",show_settings_link:"Vis lenke for å åpne i Dockhand",display_mode:"Visningsmodus",mode_compact:"Kompakt",mode_standard:"Standard",mode_detailed:"Detaljert",mode_full:"Full",mode_custom:"Egendefinert",no_environments_found:"Fant ingen Dockhand-miljøenheter. Kontroller at ha-dockhand-integrasjonen er satt opp og har minst ett miljø konfigurert.",no_stacks_found:"Fant ingen stacker for dette miljøet ennå.",no_containers_found:"Fant ingen containere for dette miljøet ennå.",columns:"Kolonner",columns_auto:"Automatisk (tilpasser seg tilgjengelig bredde, mobilvennlig)",section_container_counts:"Containerantall (+ statusbanner)",section_metrics:"CPU-/minnelinjer",section_resources:"Images / stabler / volumer / nettverk",section_events_summary:"Hendelser (i dag / totalt)",section_recent_events:"Liste over nylige hendelser",section_top_containers:"Topp containere etter CPU",section_disk_usage:"Oversikt over diskbruk",section_history_chart:"CPU-/minnehistorikkdiagram",label_environments:"Miljøer",label_vulnerabilities:"Sårbarheter",label_stacks:"Stabler",label_containers:"Containere",label_updates:"Oppdateringer",environment_card_mode:"Miljøkort-modus",vulnerabilities_hint:'Krever at "Sårbarheter"-sensoren er aktivert per miljø.',updates_hint:"Oppretter ett oppdateringskort per miljø, ikke ett delt kort.",hide_updates_global:"Skjul oppdateringskort når det ikke er oppdateringer",hide_updates_global_hint:"Skjuler bare kortet for det miljøet, ikke alle.",section_order_heading:"Rekkefølge for seksjoner",section_order_hint:"Avslåtte seksjoner blir stående i listen (nedtonet) slik at du kan ordne dem på forhånd.",environment_order_heading:"Rekkefølge for miljøer",environment_order_hint:"Øyeikonet skjuler et miljø helt; blyanten overstyrer innstillingene for kortene bare for det miljøet.",show_this_environment:"Vis dette miljøet",hide_this_environment:"Skjul dette miljøet",override_env_settings:"Overstyr kortinnstillingene for dette miljøet",back:"Tilbake",overrides_from_default_badge:"Overstyringer fra standard",detail_view_hint:"Tomme felt, eller brytere slått av, fortsetter å bruke den delte standardverdien ovenfor.",detail_section_environment:"Miljøkort",detail_section_vulnerabilities:"Sårbarhetskort",detail_section_stacks:"Stabelkort",detail_section_containers:"Containerkort",detail_section_updates:"Oppdateringskort",hide_when_no_updates_override:"Skjul når det ikke er oppdateringer",updates_scope_label:"Omfang",updates_scope_all:"Alle miljøer",updates_scope_environment:"Ett miljø",hide_when_no_updates_helper:"Kortet fjernes helt når det skjules, ikke bare tømmes.",custom_sections_label:"Egendefinerte seksjoner",visible_badges_label:"Detaljer som skal vises",badge_container_count:"Antall containere",badge_updates:"Oppdateringer tilgjengelig",badge_type:"Stack-type",badge_health:"Helsestatus",badge_cpu:"CPU-bruk",badge_memory:"Minnebruk",mode_hint_detailed:"Krever en nyere ha-dockhand-utgivelse for topp-containere og nylige hendelser.",mode_hint_full:"Krever at Diskbruk-sensoren er aktivert, og at Home Assistants recorder har historikk, for disk- og historikkseksjonene.",mode_hint_custom:"Velg nøyaktig hvilke seksjoner som skal vises.",settings_link_open:"Åpne i Dockhand",settings_link_view_containers:"Vis containere i Dockhand",settings_link_view_stacks:"Vis stacker i Dockhand",settings_link_view_vulnerabilities:"Vis sårbarheter i Dockhand",settings_link_unavailable:"Kan ikke åpne Dockhand — den konfigurerte URL-en ser ikke gyldig ut. Sjekk URL-en i innstillingene for ha-dockhand-integrasjonen."},nl:{environment:"Omgeving",stack:"Stack",container:"Container",title_override:"Titel overschrijven (optioneel)",show_settings_link:"Link tonen om te openen in Dockhand",display_mode:"Weergavemodus",mode_compact:"Compact",mode_standard:"Standaard",mode_detailed:"Gedetailleerd",mode_full:"Volledig",mode_custom:"Aangepast",no_environments_found:"Geen Dockhand-omgevingsapparaten gevonden. Zorg dat de ha-dockhand-integratie is ingesteld en minstens één omgeving is geconfigureerd.",no_stacks_found:"Nog geen stacks gevonden voor deze omgeving.",no_containers_found:"Nog geen containers gevonden voor deze omgeving.",columns:"Kolommen",columns_auto:"Automatisch (past zich aan beschikbare breedte aan, mobielvriendelijk)",section_container_counts:"Containeraantal (+ statusbanner)",section_metrics:"CPU-/geheugenbalken",section_resources:"Images / stacks / volumes / netwerken",section_events_summary:"Gebeurtenissen (vandaag / totaal)",section_recent_events:"Lijst met recente gebeurtenissen",section_top_containers:"Topcontainers op CPU",section_disk_usage:"Overzicht schijfgebruik",section_history_chart:"CPU-/geheugengeschiedenisgrafiek",label_environments:"Omgevingen",label_vulnerabilities:"Kwetsbaarheden",label_stacks:"Stacks",label_containers:"Containers",label_updates:"Updates",environment_card_mode:"Omgevingskaart-modus",vulnerabilities_hint:"Vereist de “Kwetsbaarheden”-sensor ingeschakeld per omgeving.",updates_hint:"Maakt één updates-kaart per omgeving, geen gedeelde kaart.",hide_updates_global:"Updates-kaart verbergen wanneer er geen updates zijn",hide_updates_global_hint:"Verbergt alleen de kaart van die omgeving, niet allemaal.",section_order_heading:"Volgorde van secties",section_order_hint:"Uitgeschakelde secties blijven (gedimd) in de lijst staan, zodat u ze alvast kunt ordenen.",environment_order_heading:"Volgorde van omgevingen",environment_order_hint:"Het oogicoon verbergt een omgeving volledig; het potloodicoon overschrijft de kaartinstellingen alleen voor die omgeving.",show_this_environment:"Deze omgeving tonen",hide_this_environment:"Deze omgeving verbergen",override_env_settings:"Kaartinstellingen van deze omgeving overschrijven",back:"Terug",overrides_from_default_badge:"Overschrijvingen van standaardwaarden",detail_view_hint:"Lege velden, of schakelaars die uit staan, blijven de gedeelde standaardwaarde hierboven gebruiken.",detail_section_environment:"Omgevingskaart",detail_section_vulnerabilities:"Kwetsbaarhedenkaart",detail_section_stacks:"Stacks-kaart",detail_section_containers:"Containers-kaart",detail_section_updates:"Updates-kaart",hide_when_no_updates_override:"Verbergen wanneer er geen updates zijn",updates_scope_label:"Bereik",updates_scope_all:"Alle omgevingen",updates_scope_environment:"Eén omgeving",hide_when_no_updates_helper:"De kaart wordt volledig verwijderd wanneer deze wordt verborgen, niet alleen geleegd.",custom_sections_label:"Aangepaste secties",visible_badges_label:"Te tonen details",badge_container_count:"Aantal containers",badge_updates:"Updates beschikbaar",badge_type:"Stack-type",badge_health:"Gezondheid",badge_cpu:"CPU-gebruik",badge_memory:"Geheugengebruik",mode_hint_detailed:"Vereist een recente ha-dockhand-release voor topcontainers en recente gebeurtenissen.",mode_hint_full:"Vereist de ingeschakelde schijfgebruik-sensor en geschiedenis van Home Assistants recorder voor de schijf- en geschiedenissecties.",mode_hint_custom:"Kies precies welke secties worden getoond.",settings_link_open:"Openen in Dockhand",settings_link_view_containers:"Containers bekijken in Dockhand",settings_link_view_stacks:"Stacks bekijken in Dockhand",settings_link_view_vulnerabilities:"Kwetsbaarheden bekijken in Dockhand",settings_link_unavailable:"Kan Dockhand niet openen — de geconfigureerde URL lijkt ongeldig. Controleer de URL in de instellingen van de ha-dockhand-integratie."},pl:{environment:"Środowisko",stack:"Stos",container:"Kontener",title_override:"Nadpisanie tytułu (opcjonalnie)",show_settings_link:"Pokaż link do otwarcia w Dockhand",display_mode:"Tryb wyświetlania",mode_compact:"Kompaktowy",mode_standard:"Standardowy",mode_detailed:"Szczegółowy",mode_full:"Pełny",mode_custom:"Niestandardowy",no_environments_found:"Nie znaleziono urządzeń środowiska Dockhand. Upewnij się, że integracja ha-dockhand jest skonfigurowana i ma co najmniej jedno środowisko.",no_stacks_found:"Nie znaleziono jeszcze żadnych stosów dla tego środowiska.",no_containers_found:"Nie znaleziono jeszcze żadnych kontenerów dla tego środowiska.",columns:"Kolumny",columns_auto:"Automatyczny (dopasowuje się do dostępnej szerokości, przyjazny dla urządzeń mobilnych)",section_container_counts:"Liczba kontenerów (+ baner stanu)",section_metrics:"Paski CPU/pamięci",section_resources:"Obrazy / stosy / woluminy / sieci",section_events_summary:"Zdarzenia (dziś / łącznie)",section_recent_events:"Lista ostatnich zdarzeń",section_top_containers:"Najbardziej obciążające kontenery (CPU)",section_disk_usage:"Podział wykorzystania dysku",section_history_chart:"Wykres historii CPU/pamięci",label_environments:"Środowiska",label_vulnerabilities:"Podatności",label_stacks:"Stosy",label_containers:"Kontenery",label_updates:"Aktualizacje",environment_card_mode:"Tryb karty środowiska",vulnerabilities_hint:'Wymaga włączonego czujnika "Podatności" dla danego środowiska.',updates_hint:"Tworzy jedną kartę aktualizacji na środowisko, a nie jedną wspólną kartę.",hide_updates_global:"Ukryj kartę aktualizacji, gdy nie ma aktualizacji",hide_updates_global_hint:"Ukrywa tylko kartę tego środowiska, nie wszystkie.",section_order_heading:"Kolejność sekcji",section_order_hint:"Wyłączone sekcje pozostają na liście (przyciemnione), dzięki czemu można je ułożyć wcześniej.",environment_order_heading:"Kolejność środowisk",environment_order_hint:"Ikona oka całkowicie ukrywa środowisko; ikona ołówka nadpisuje ustawienia jego kart tylko dla tego środowiska.",show_this_environment:"Pokaż to środowisko",hide_this_environment:"Ukryj to środowisko",override_env_settings:"Nadpisz ustawienia kart tego środowiska",back:"Wstecz",overrides_from_default_badge:"Nadpisania wartości domyślnych",detail_view_hint:"Puste pola lub wyłączone przełączniki nadal używają wspólnej wartości domyślnej powyżej.",detail_section_environment:"Karta środowiska",detail_section_vulnerabilities:"Karta podatności",detail_section_stacks:"Karta stosów",detail_section_containers:"Karta kontenerów",detail_section_updates:"Karta aktualizacji",hide_when_no_updates_override:"Ukryj, gdy nie ma aktualizacji",updates_scope_label:"Zakres",updates_scope_all:"Wszystkie środowiska",updates_scope_environment:"Jedno środowisko",hide_when_no_updates_helper:"Karta jest całkowicie usuwana po ukryciu, a nie tylko opróżniana.",custom_sections_label:"Sekcje niestandardowe",visible_badges_label:"Szczegóły do wyświetlenia",badge_container_count:"Liczba kontenerów",badge_updates:"Dostępne aktualizacje",badge_type:"Typ stosu",badge_health:"Stan zdrowia",badge_cpu:"Użycie CPU",badge_memory:"Użycie pamięci",mode_hint_detailed:"Wymaga najnowszej wersji ha-dockhand dla najważniejszych kontenerów i ostatnich zdarzeń.",mode_hint_full:"Wymaga włączonego czujnika użycia dysku oraz historii rejestratora Home Assistant dla sekcji dysku i historii.",mode_hint_custom:"Wybierz dokładnie, które sekcje mają być wyświetlane.",settings_link_open:"Otwórz w Dockhand",settings_link_view_containers:"Wyświetl kontenery w Dockhand",settings_link_view_stacks:"Wyświetl stosy w Dockhand",settings_link_view_vulnerabilities:"Wyświetl podatności w Dockhand",settings_link_unavailable:"Nie można otworzyć Dockhand — skonfigurowany adres URL wydaje się nieprawidłowy. Sprawdź adres URL w ustawieniach integracji ha-dockhand."},pt:{environment:"Ambiente",stack:"Stack",container:"Contêiner",title_override:"Substituir título (opcional)",show_settings_link:"Mostrar link para abrir no Dockhand",display_mode:"Modo de exibição",mode_compact:"Compacto",mode_standard:"Padrão",mode_detailed:"Detalhado",mode_full:"Completo",mode_custom:"Personalizado",no_environments_found:"Nenhum dispositivo de ambiente Dockhand encontrado. Verifique se a integração ha-dockhand está configurada e tem pelo menos um ambiente definido.",no_stacks_found:"Nenhuma stack encontrada para este ambiente ainda.",no_containers_found:"Nenhum contêiner encontrado para este ambiente ainda.",columns:"Colunas",columns_auto:"Automático (ajusta-se à largura disponível, compatível com dispositivos móveis)",section_container_counts:"Contagem de contêineres (+ banner de status)",section_metrics:"Barras de CPU/memória",section_resources:"Imagens / stacks / volumes / redes",section_events_summary:"Eventos (hoje / total)",section_recent_events:"Lista de eventos recentes",section_top_containers:"Principais contêineres por CPU",section_disk_usage:"Detalhamento do uso de disco",section_history_chart:"Gráfico de histórico de CPU/memória",label_environments:"Ambientes",label_vulnerabilities:"Vulnerabilidades",label_stacks:"Stacks",label_containers:"Contêineres",label_updates:"Atualizações",environment_card_mode:"Modo do cartão de ambiente",vulnerabilities_hint:'Requer o sensor "Vulnerabilidades" ativado por ambiente.',updates_hint:"Cria um cartão de atualizações por ambiente, não um cartão compartilhado.",hide_updates_global:"Ocultar cartão de atualizações quando não houver atualizações",hide_updates_global_hint:"Oculta apenas o cartão desse ambiente, não todos.",section_order_heading:"Ordem das seções",section_order_hint:"As seções desativadas permanecem na lista (esmaecidas) para que você possa organizá-las com antecedência.",environment_order_heading:"Ordem dos ambientes",environment_order_hint:"O ícone de olho oculta um ambiente completamente; o lápis substitui as configurações de seus cartões apenas para esse ambiente.",show_this_environment:"Mostrar este ambiente",hide_this_environment:"Ocultar este ambiente",override_env_settings:"Substituir as configurações dos cartões deste ambiente",back:"Voltar",overrides_from_default_badge:"Substituições do padrão",detail_view_hint:"Campos em branco, ou interruptores desligados, continuam usando o valor padrão compartilhado acima.",detail_section_environment:"Cartão de ambiente",detail_section_vulnerabilities:"Cartão de vulnerabilidades",detail_section_stacks:"Cartão de stacks",detail_section_containers:"Cartão de contêineres",detail_section_updates:"Cartão de atualizações",hide_when_no_updates_override:"Ocultar quando não houver atualizações",updates_scope_label:"Escopo",updates_scope_all:"Todos os ambientes",updates_scope_environment:"Um ambiente",hide_when_no_updates_helper:"O cartão é totalmente removido quando oculto, não apenas esvaziado.",custom_sections_label:"Seções personalizadas",visible_badges_label:"Detalhes a exibir",badge_container_count:"Número de contêineres",badge_updates:"Atualizações disponíveis",badge_type:"Tipo de stack",badge_health:"Saúde",badge_cpu:"Uso de CPU",badge_memory:"Uso de memória",mode_hint_detailed:"Requer uma versão recente do ha-dockhand para principais contêineres e eventos recentes.",mode_hint_full:"Requer o sensor de uso de disco ativado e histórico do recorder do Home Assistant para as seções de disco e histórico.",mode_hint_custom:"Escolha exatamente quais seções mostrar.",settings_link_open:"Abrir no Dockhand",settings_link_view_containers:"Ver contêineres no Dockhand",settings_link_view_stacks:"Ver stacks no Dockhand",settings_link_view_vulnerabilities:"Ver vulnerabilidades no Dockhand",settings_link_unavailable:"Não é possível abrir o Dockhand — o URL configurado não parece válido. Verifique o URL nas configurações da integração ha-dockhand."},sv:{environment:"Miljö",stack:"Stack",container:"Container",title_override:"Titeländring (valfritt)",show_settings_link:"Visa länk för att öppna i Dockhand",display_mode:"Visningsläge",mode_compact:"Kompakt",mode_standard:"Standard",mode_detailed:"Detaljerad",mode_full:"Fullständig",mode_custom:"Anpassad",no_environments_found:"Inga Dockhand-miljöenheter hittades. Kontrollera att ha-dockhand-integrationen är konfigurerad och har minst en miljö inställd.",no_stacks_found:"Inga stackar hittades för denna miljö ännu.",no_containers_found:"Inga containrar hittades för denna miljö ännu.",columns:"Kolumner",columns_auto:"Automatisk (anpassar sig efter tillgänglig bredd, mobilvänlig)",section_container_counts:"Containerantal (+ statusbanner)",section_metrics:"CPU-/minnesstaplar",section_resources:"Images / stackar / volymer / nätverk",section_events_summary:"Händelser (idag / totalt)",section_recent_events:"Lista över senaste händelser",section_top_containers:"Toppcontainrar efter CPU",section_disk_usage:"Diskanvändning i detalj",section_history_chart:"CPU-/minneshistorikdiagram",label_environments:"Miljöer",label_vulnerabilities:"Sårbarheter",label_stacks:"Stackar",label_containers:"Containrar",label_updates:"Uppdateringar",environment_card_mode:"Miljökortsläge",vulnerabilities_hint:'Kräver att sensorn "Sårbarheter" är aktiverad per miljö.',updates_hint:"Skapar ett uppdateringskort per miljö, inte ett delat kort.",hide_updates_global:"Dölj uppdateringskort när det inte finns några uppdateringar",hide_updates_global_hint:"Döljer bara kortet för den miljön, inte alla.",section_order_heading:"Sektionsordning",section_order_hint:"Avstängda sektioner ligger kvar i listan (nedtonade) så att du kan ordna dem i förväg.",environment_order_heading:"Miljöordning",environment_order_hint:"Ögonikonen döljer en miljö helt; pennan åsidosätter dess kortinställningar bara för den miljön.",show_this_environment:"Visa denna miljö",hide_this_environment:"Dölj denna miljö",override_env_settings:"Åsidosätt kortinställningar för denna miljö",back:"Tillbaka",overrides_from_default_badge:"Åsidosättningar från standard",detail_view_hint:"Tomma fält, eller brytare avstängda, fortsätter att använda det delade standardvärdet ovan.",detail_section_environment:"Miljökort",detail_section_vulnerabilities:"Sårbarhetskort",detail_section_stacks:"Stackkort",detail_section_containers:"Containerkort",detail_section_updates:"Uppdateringskort",hide_when_no_updates_override:"Dölj när det inte finns några uppdateringar",updates_scope_label:"Omfattning",updates_scope_all:"Alla miljöer",updates_scope_environment:"En miljö",hide_when_no_updates_helper:"Kortet tas bort helt när det döljs, inte bara töms.",custom_sections_label:"Anpassade sektioner",visible_badges_label:"Detaljer att visa",badge_container_count:"Antal containrar",badge_updates:"Uppdateringar tillgängliga",badge_type:"Stacktyp",badge_health:"Hälsostatus",badge_cpu:"CPU-användning",badge_memory:"Minnesanvändning",mode_hint_detailed:"Kräver en nyare ha-dockhand-version för toppcontainrar och senaste händelser.",mode_hint_full:"Kräver att sensorn för diskanvändning är aktiverad, och att Home Assistants recorder har historik, för disk- och historiksektionerna.",mode_hint_custom:"Välj exakt vilka sektioner som ska visas.",settings_link_open:"Öppna i Dockhand",settings_link_view_containers:"Visa containrar i Dockhand",settings_link_view_stacks:"Visa stackar i Dockhand",settings_link_view_vulnerabilities:"Visa sårbarheter i Dockhand",settings_link_unavailable:"Det går inte att öppna Dockhand — den konfigurerade URL:en verkar inte giltig. Kontrollera URL:en i inställningarna för ha-dockhand-integrationen."},"zh-Hans":{environment:"环境",stack:"堆栈",container:"容器",title_override:"标题覆盖（可选）",show_settings_link:"显示在 Dockhand 中打开的链接",display_mode:"显示模式",mode_compact:"紧凑",mode_standard:"标准",mode_detailed:"详细",mode_full:"完整",mode_custom:"自定义",no_environments_found:"未找到 Dockhand 环境设备。请确保已设置 ha-dockhand 集成并至少配置了一个环境。",no_stacks_found:"此环境尚未找到任何堆栈。",no_containers_found:"此环境尚未找到任何容器。",columns:"列数",columns_auto:"自动（适应可用宽度，适合移动端）",section_container_counts:"容器数量（+ 健康状态横幅）",section_metrics:"CPU / 内存条形图",section_resources:"镜像 / 堆栈 / 卷 / 网络",section_events_summary:"事件（今日 / 总计）",section_recent_events:"最近事件列表",section_top_containers:"CPU 占用最高的容器",section_disk_usage:"磁盘使用情况明细",section_history_chart:"CPU / 内存历史图表",label_environments:"环境",label_vulnerabilities:"漏洞",label_stacks:"堆栈",label_containers:"容器",label_updates:"更新",environment_card_mode:"环境卡片模式",vulnerabilities_hint:'需要为每个环境启用"漏洞"传感器。',updates_hint:"为每个环境创建一张更新卡片，而非共用一张。",hide_updates_global:"没有更新时隐藏更新卡片",hide_updates_global_hint:"仅隐藏该环境的卡片，不影响其他环境。",section_order_heading:"分区顺序",section_order_hint:"已关闭的分区会保留在列表中（变暗显示），方便提前排列。",environment_order_heading:"环境顺序",environment_order_hint:"眼睛图标可完全隐藏某个环境；铅笔图标可仅针对该环境覆盖其卡片设置。",show_this_environment:"显示此环境",hide_this_environment:"隐藏此环境",override_env_settings:"覆盖此环境的卡片设置",back:"返回",overrides_from_default_badge:"覆盖默认值",detail_view_hint:"留空的字段或关闭的开关将继续使用上方的共享默认值。",detail_section_environment:"环境卡片",detail_section_vulnerabilities:"漏洞卡片",detail_section_stacks:"堆栈卡片",detail_section_containers:"容器卡片",detail_section_updates:"更新卡片",hide_when_no_updates_override:"没有更新时隐藏",updates_scope_label:"范围",updates_scope_all:"所有环境",updates_scope_environment:"单个环境",hide_when_no_updates_helper:"隐藏时会完全移除该卡片，而不仅仅是清空。",custom_sections_label:"自定义分区",visible_badges_label:"要显示的详情",badge_container_count:"容器数量",badge_updates:"有可用更新",badge_type:"堆栈类型",badge_health:"健康状态",badge_cpu:"CPU 使用率",badge_memory:"内存使用率",mode_hint_detailed:"需要较新的 ha-dockhand 版本才能使用顶部容器和最近事件功能。",mode_hint_full:"需要启用磁盘使用情况传感器，并且 Home Assistant 的记录器需有历史数据，才能显示磁盘和历史部分。",mode_hint_custom:"精确选择要显示哪些部分。",settings_link_open:"在 Dockhand 中打开",settings_link_view_containers:"在 Dockhand 中查看容器",settings_link_view_stacks:"在 Dockhand 中查看堆栈",settings_link_view_vulnerabilities:"在 Dockhand 中查看漏洞",settings_link_unavailable:"无法打开 Dockhand — 配置的 URL 看起来无效。请检查 ha-dockhand 集成设置中的 URL。"}};function Ge(e,t){const n=e?.locale?.language??e?.language??"en";return qe[n]?.[t]??Be[t]}const Fe=["#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#84cc16","#6366f1","#d946ef"],We=["rgba(239, 68, 68, 0.15)","rgba(249, 115, 22, 0.15)","rgba(234, 179, 8, 0.15)","rgba(34, 197, 94, 0.15)","rgba(20, 184, 166, 0.15)","rgba(59, 130, 246, 0.15)","rgba(139, 92, 246, 0.15)","rgba(236, 72, 153, 0.15)","rgba(6, 182, 212, 0.15)","rgba(132, 204, 22, 0.15)","rgba(99, 102, 241, 0.15)","rgba(217, 70, 239, 0.15)"];function Xe(e){const t=function(e){let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t&=t;return Math.abs(t)}(e)%Fe.length;return{color:Fe[t],bgColor:We[t]}}const Ze=["container_counts","metrics","resources","events_summary","recent_events","top_containers","history_chart","disk_usage"],Ye=["container_counts","metrics","resources","events_summary"],Je=C`
  :host {
    /*
     * Customization hooks — see docs/STYLING.md. These are the only
     * values a theme is expected to override; layout/spacing/typography
     * are left as plain CSS and are card_mod's job, not a theme's.
     */
    --dockhand-accent-color: var(--primary-color);
    --dockhand-status-ok-color: #22c55e;
    --dockhand-status-warn-color: #f59e0b;
    --dockhand-status-error-color: #ef4444;
    --dockhand-status-info-color: #38bdf8;
    --dockhand-severity-critical-color: #ef4444;
    --dockhand-severity-high-color: #f97316;
    --dockhand-severity-medium-color: #ca8a04;
    --dockhand-severity-low-color: #3b82f6;
  }

  ha-card {
    padding: 16px;
    overflow: hidden;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .icon-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: rgb(from var(--dockhand-accent-color) r g b / 0.1);
    flex-shrink: 0;
  }
  .icon-badge.offline {
    background: var(--disabled-color, #bdbdbd);
    opacity: 0.4;
  }
  .icon-badge ha-icon {
    --mdc-icon-size: 16px;
    color: var(--dockhand-accent-color);
  }
  .conn-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
    display: inline-flex;
  }
  .name-block {
    min-width: 0;
    overflow: hidden;
  }
  .name-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .name {
    font-weight: 500;
    font-size: 0.95em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .name-row ha-icon,
  .name-row ha-state-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
  }
  .subtitle {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
  .status-icons {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .settings-link {
    cursor: pointer;
    color: var(--secondary-text-color);
    display: flex;
  }
  .settings-link ha-icon {
    --mdc-icon-size: 16px;
  }
  .settings-link:hover {
    color: var(--primary-text-color);
  }
  /* Additive modifier, not a replacement for .settings-link — anyone's
   * existing card_mod targeting .settings-link (a documented, stable
   * class name — see docs/STYLING.md) still works the same way for the
   * normal case. Used when show_settings_link is on but the URL couldn't
   * be resolved, so it reads as "something's misconfigured" rather than
   * silently looking identical to the toggle being off — hiding both
   * cases the same way was the actual source of real confusion (a user
   * enabling the toggle and then seeing nothing, indistinguishable from
   * the feature being off, with no indication anything needed fixing). */
  .settings-link.unavailable {
    cursor: default;
    opacity: 0.5;
  }
  .settings-link.unavailable:hover {
    color: var(--secondary-text-color);
  }
  .body {
    margin-top: 10px;
  }
  .clickable {
    cursor: pointer;
    outline: none;
  }
  .clickable:hover {
    opacity: 0.8;
  }
  .clickable:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 4px;
  }
  .status-icon {
    display: inline-flex;
    --mdc-icon-size: 16px;
  }
  .label-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }
  .label-pill {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7em;
    font-weight: 500;
    background: var(--divider-color);
    color: var(--secondary-text-color);
  }
  .empty-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.85em;
    color: var(--secondary-text-color);
    text-align: center;
    padding: 8px 0;
  }
  .section {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color);
  }
  .section:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8em;
    font-weight: 500;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
  }
  .section-title ha-icon {
    --mdc-icon-size: 13px;
  }
  .section-title-value {
    margin-left: auto;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .bar-track {
    height: 6px;
    border-radius: 3px;
    background: var(--divider-color);
    overflow: hidden;
    margin-bottom: 8px;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }
  .bar-fill.ok {
    background: var(--dockhand-status-ok-color);
  }
  .bar-fill.warn {
    background: var(--dockhand-status-warn-color);
  }
  .bar-fill.error {
    background: var(--dockhand-status-error-color);
  }
  .offline-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    color: var(--secondary-text-color);
    text-align: center;
  }
  .offline-state ha-icon {
    --mdc-icon-size: 28px;
    opacity: 0.5;
    margin-bottom: 6px;
  }
  .unavailable-hint {
    margin-top: 10px;
    padding: 8px;
    border-radius: 6px;
    background: rgba(255, 152, 0, 0.1);
    font-size: 0.75em;
    color: var(--secondary-text-color);
  }
  .unavailable-hint ul {
    margin: 4px 0 0;
    padding-left: 18px;
  }
  .error-state {
    padding: 16px;
    color: var(--error-color, #f44336);
    font-size: 0.9em;
  }
  /* Core messages — used only when the card would otherwise have nothing
   * else to show (a genuinely missing/disabled required entity), never
   * for supplementary "would show more" guidance (that lives in the
   * editor). Always paired with a warning/error icon so it doesn't read
   * as plain unstyled text. */
  .core-message {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .core-message ha-icon {
    --mdc-icon-size: 18px;
    flex-shrink: 0;
  }

  /* Shared "compact row list" pattern — used identically by the Stacks and
   * Containers cards (one row per stack/container). Card-specific extras
   * (Stacks' .item-type-pill, Containers' .item-status-icon.info and
   * .item-badge.unhealthy) stay in each card's own styles.ts, since only
   * one of the two cards needs them. */
  .row-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .item-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 4px;
    border-radius: 6px;
    font-size: 0.85em;
  }
  .item-row:not(:last-child) {
    border-bottom: 1px solid var(--divider-color);
  }
  .item-status-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
  }
  .item-status-icon.ok {
    color: var(--dockhand-status-ok-color);
  }
  .item-status-icon.warn {
    color: var(--dockhand-status-warn-color);
  }
  .item-status-icon.error {
    color: var(--dockhand-status-error-color);
  }
  .item-status-icon.neutral {
    color: var(--secondary-text-color);
  }
  .item-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-badge {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.85em;
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }
  .item-badge ha-icon {
    --mdc-icon-size: 13px;
  }
  .item-badge.updates {
    color: var(--dockhand-status-warn-color);
  }

  /* Shared "metric row" pattern (CPU/memory-style bar rows with a label
   * and value line) — used identically by the Environment and Container
   * cards. */
  .metric-row {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color);
  }
  .metric-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8em;
    margin-bottom: 3px;
  }
  .metric-label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
  }
  .metric-label ha-icon,
  .metric-label ha-state-icon {
    --mdc-icon-size: 13px;
  }
  .metric-value .used {
    color: var(--secondary-text-color);
    font-weight: normal;
  }
`,Qe=C`
  ${Je}

  .container-stats {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    font-size: 0.85em;
  }
  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .stat ha-icon {
    --mdc-icon-size: 14px;
  }
  .stat .total-label {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }
  .health-banner {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 0.8em;
    font-weight: 500;
    margin-top: 8px;
  }
  .health-banner ha-icon {
    --mdc-icon-size: 14px;
  }
  .health-banner.ok {
    background: rgb(from var(--dockhand-status-ok-color) r g b / 0.12);
    color: var(--dockhand-status-ok-color);
  }
  .health-banner.warn {
    background: rgb(from var(--dockhand-status-warn-color) r g b / 0.12);
    color: var(--dockhand-status-warn-color);
  }
  .health-banner.error {
    background: rgb(from var(--dockhand-status-error-color) r g b / 0.12);
    color: var(--dockhand-status-error-color);
  }
  .resource-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 16px;
    font-size: 0.8em;
    margin-top: 8px;
  }
  .resource-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .resource-item .label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
  }
  .resource-item .label ha-icon,
  .resource-item .label ha-state-icon {
    --mdc-icon-size: 13px;
  }
  .breakdown .running {
    color: var(--dockhand-status-ok-color);
  }
  .breakdown .partial {
    color: var(--dockhand-status-warn-color);
  }
  .breakdown .stopped {
    color: var(--dockhand-status-error-color);
  }
  .events-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8em;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color);
    color: var(--secondary-text-color);
  }
  .events-row .label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .events-row .label ha-icon,
  .events-row .label ha-state-icon {
    --mdc-icon-size: 13px;
  }
  .events-row .value {
    color: var(--primary-text-color);
    font-weight: 500;
  }
  .top-container-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 10px;
    font-size: 0.8em;
    padding: 3px 0;
  }
  .top-container-row .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .top-container-row .metric {
    display: flex;
    align-items: center;
    gap: 3px;
    color: var(--secondary-text-color);
  }
  .top-container-row .metric ha-icon {
    --mdc-icon-size: 12px;
  }
  .event-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78em;
    padding: 3px 0;
    color: var(--secondary-text-color);
  }
  .event-row ha-icon {
    --mdc-icon-size: 13px;
    flex-shrink: 0;
  }
  .event-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--primary-text-color);
  }
  .chart-block {
    margin-bottom: 10px;
  }
  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75em;
    margin-bottom: 4px;
  }
  .chart-header > span:first-child {
    color: var(--secondary-text-color);
  }
  .chart-value {
    font-weight: 500;
  }
  .sparkline {
    width: 100%;
    height: 30px;
    display: block;
    cursor: crosshair;
  }
  .sparkline-wrap {
    position: relative;
  }
  .chart-tooltip {
    position: absolute;
    top: -4px;
    background: var(--card-background-color, #1c1c1c);
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 0.72em;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    z-index: 1;
  }
  .chart-tooltip.left {
    transform: translate(0, -100%);
  }
  .chart-tooltip.right {
    transform: translate(-100%, -100%);
  }
  .chart-tooltip-time {
    color: var(--secondary-text-color);
    margin-bottom: 2px;
  }
  .chart-tooltip-value {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }
  .chart-tooltip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .disk-chart-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .disk-donut {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    flex-shrink: 0;
    /* Punches the donut hole — a plain conic-gradient background alone
     * would be a solid pie, not a donut, so mask out the center. 35%
     * hole / 65% ring — halfway between Dockhand's own 50/50 ratio
     * (read as too thin at our smaller 64px) and a first attempt at
     * 20/80 (read as too thick). */
    mask: radial-gradient(circle at center, transparent 0 35%, black 36% 100%);
    -webkit-mask: radial-gradient(circle at center, transparent 0 35%, black 36% 100%);
  }
  .disk-legend {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.78em;
    flex: 1;
    min-width: 0;
  }
  .disk-legend-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .disk-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .disk-label {
    color: var(--secondary-text-color);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .disk-value {
    flex-shrink: 0;
    font-weight: 500;
  }
  /* Matches Dockhand's own 2x4 tile split (EnvironmentTile.svelte): left
   * column carries everything through top-containers, right column is
   * history + disk usage, divided by a vertical rule at genuinely wide
   * card widths. Below that width — a standard (12-wide) card, or any
   * card on a narrow/mobile viewport — everything just flows down as one
   * column instead, which is what a container query gives for free: it
   * responds to the card's own rendered width, not the dashboard section
   * or the viewport, so this is correct even if the card ends up nested
   * somewhere narrower than its own configured width (e.g. inside the
   * Overview card's per-environment columns). */
  .full-container {
    container-type: inline-size;
  }
  @container (min-width: 700px) {
    .full-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      align-items: start;
    }
    .full-left,
    .full-right {
      min-width: 0;
    }
    .full-right {
      border-left: 1px solid var(--divider-color);
      padding-left: 16px;
      margin-left: 16px;
    }
    .full-right .section:first-child {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
  }
`,et={socket:{icon:"mdi:power-plug",color:"#22d3ee",title:"Unix socket connection"},direct:{icon:"mdi:docker",color:"#3b82f6",title:"Direct Docker connection"},"hawser-standard":{icon:"mdi:transit-connection-variant",color:"#a855f7",title:"Hawser agent (standard mode)"},"hawser-edge":{icon:"mdi:undo-variant",color:"#22c55e",title:"Hawser agent (edge mode)"}},tt={create:"mdi:plus",start:"mdi:play",stop:"mdi:stop",die:"mdi:skull",kill:"mdi:flash",restart:"mdi:restart",pause:"mdi:pause",unpause:"mdi:play-circle",destroy:"mdi:delete",rename:"mdi:pencil",update:"mdi:pencil",oom:"mdi:alert",health_status:"mdi:heart-pulse"},nt={create:"#34d399",start:"#34d399",unpause:"#34d399",stop:"#fb7185",die:"#fb7185",kill:"#fb7185",destroy:"#fb7185",oom:"#fb7185",restart:"#fbbf24",pause:"#fbbf24",update:"#fbbf24",rename:"#fbbf24",health_status:"#38bdf8"};function it(e){return e.startsWith("health_status")?"health_status":e}class st extends Se{constructor(){super(...arguments),this._cpuHistory=[],this._memHistory=[],this._hoverPoint=null,this._historyFetchedFor=null,this._historyEntityIds=[void 0,void 0],this._historyRefreshTimer=null}set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-environment-card",device_id:t[0]?.deviceId??"",mode:"standard"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Nt}),document.createElement("dockhand-environment-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={mode:"standard",show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){switch(this._config?.mode){case"compact":return 2;case"detailed":return 7;case"full":return 10;default:return 4}}getGridOptions(){switch(this._config?.mode){case"compact":return{columns:12,rows:"auto",min_columns:6,min_rows:2};case"detailed":return{columns:12,rows:"auto",min_columns:6,min_rows:5};case"full":return{columns:12,rows:"auto",min_columns:8,min_rows:6};default:return{columns:12,rows:"auto",min_columns:6,min_rows:3}}}updated(){if(!this._hass||!this._config)return;if(!("full"===this._config.mode||"custom"===this._config.mode&&(this._config.custom_sections??Ye).includes("history_chart")))return;const e=Te(this._hass,this._config.device_id,["cpuUsage","memoryUsage"]),t=e.found.cpuUsage?.entityId,n=e.found.memoryUsage?.entityId;if(!t&&!n)return;this._historyEntityIds=[t,n];const i=`${t??""}|${n??""}`;this._historyFetchedFor!==i&&(this._historyFetchedFor=i,this._fetchHistory(t,n),this._historyRefreshTimer||(this._historyRefreshTimer=window.setInterval(()=>{const[e,t]=this._historyEntityIds;(e||t)&&this._fetchHistory(e,t)},6e4)))}disconnectedCallback(){super.disconnectedCallback(),this._historyRefreshTimer&&(window.clearInterval(this._historyRefreshTimer),this._historyRefreshTimer=null)}async _fetchHistory(e,t){if(!this._hass)return;const n=[e,t].filter(e=>Boolean(e));if(0!==n.length)try{const t=new Date(Date.now()-9e5).toISOString(),i=await this._hass.callApi("GET",`history/period/${t}?filter_entity_id=${n.join(",")}&minimal_response&no_attributes`),s=e=>(e??[]).map(e=>({value:Number(e.state),timestampMs:e.last_changed?new Date(e.last_changed).getTime():NaN})).filter(e=>Number.isFinite(e.value)&&Number.isFinite(e.timestampMs));2===n.length?(this._cpuHistory=s(i[0]),this._memHistory=s(i[1])):e?(this._cpuHistory=s(i[0]),this._memHistory=[]):(this._memHistory=s(i[0]),this._cpuHistory=[])}catch{}}_sparkline(e,t,n){if(t.length<2)return le;const i=280,s=36,o=i/(t.length-1),a=t.map((e,t)=>[t*o,s-Math.min(e.value,100)/100*s]),r=a.map(([e,t])=>`${e.toFixed(1)},${t.toFixed(1)}`).join(" "),c=`0,36 ${r} 280,36`,d=this._hoverPoint?.chart===e?this._hoverPoint.xFraction*i:null;return ce`
      <div class="sparkline-wrap">
        <svg viewBox="0 0 ${i} ${s}" class="sparkline" preserveAspectRatio="none" @mousemove=${n=>{const i=n.currentTarget.getBoundingClientRect(),s=Math.min(1,Math.max(0,(n.clientX-i.left)/i.width)),o=Math.round(s*(t.length-1));this._hoverPoint={chart:e,xFraction:o/(t.length-1),point:t[o]}}} @mouseleave=${()=>{this._hoverPoint?.chart===e&&(this._hoverPoint=null)}}>
          <polygon points=${c} fill=${n} opacity="0.3" />
          <polyline points=${r} fill="none" stroke=${n} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
          ${null!==d?ce`<line x1=${d} y1="0" x2=${d} y2=${s} stroke=${n} stroke-width="1" stroke-dasharray="2,2" opacity="0.6" />`:le}
        </svg>
        ${this._hoverPoint?.chart===e?this._renderTooltip(this._hoverPoint.point,this._hoverPoint.xFraction,n):le}
      </div>
    `}_renderTooltip(e,t,n){const i=new Date(e.timestampMs).toLocaleString(void 0,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});return ce`
      <div class="chart-tooltip ${t>.5?"right":"left"}" style="left:${(100*t).toFixed(2)}%">
        <div class="chart-tooltip-time">${i}</div>
        <div class="chart-tooltip-value"><span class="chart-tooltip-dot" style="background:${n}"></span>${e.value.toFixed(1)}%</div>
      </div>
    `}_renderHistoryCharts(e){const t=this._cpuHistory.length>=2,n=this._memHistory.length>=2;if(!t&&!n)return le;const i=e.cpuUsage?Number(e.cpuUsage.state.state):void 0,s=e.memoryUsage?Number(e.memoryUsage.state.state):void 0,o=e.memoryUsage?.state.attributes.memory_used_bytes;return ce`
      <div class="section">
        <div class="section-title"><ha-icon icon="mdi:chip"></ha-icon> CPU &amp; Memory history</div>
        ${t&&void 0!==i?ce`
              <div class="chart-block">
                <div class="chart-header">
                  <span>CPU</span>
                  <span class="chart-value">${i.toFixed(1)}%</span>
                </div>
                ${this._sparkline("cpu",this._cpuHistory,"#10b981")}
              </div>
            `:le}
        ${n&&void 0!==s?ce`
              <div class="chart-block">
                <div class="chart-header">
                  <span>Memory</span>
                  <span class="chart-value"
                    >${s.toFixed(1)}%${"number"==typeof o?` (${Re(o)})`:""}</span
                  >
                </div>
                ${this._sparkline("mem",this._memHistory,"#3b82f6")}
              </div>
            `:le}
      </div>
    `}_renderDiskUsage(e){if(!e.diskUsage)return le;const t=e.diskUsage.state.attributes,n=[{label:"Images",bytes:Number(t.images_size_bytes)||0,color:"#0ea5e9"},{label:"Containers",bytes:Number(t.containers_size_bytes)||0,color:"#10b981"},{label:"Volumes",bytes:Number(t.volumes_size_bytes)||0,color:"#f59e0b"},{label:"Build cache",bytes:Number(t.build_cache_size_bytes)||0,color:"#8b5cf6"}].filter(e=>e.bytes>0);if(0===n.length)return le;const i=n.reduce((e,t)=>e+t.bytes,0),s=e.diskUsage.entityId;let o=0;const a=n.map(e=>{const t=o;return o+=e.bytes/i*360,`${e.color} ${t}deg ${o}deg`}).join(", ");return ce`
      <div
        class="section clickable"
        tabindex="0"
        role="button"
        @click=${()=>this._moreInfo(s)}
        @keydown=${this._onKeydown(s)}
      >
        <div class="section-title">
          <ha-icon icon="mdi:harddisk"></ha-icon>
          <span>Disk usage</span>
          <span class="section-title-value">${Re(i)}</span>
        </div>
        <div class="disk-chart-row">
          <div class="disk-donut" style="background: conic-gradient(${a})"></div>
          <div class="disk-legend">
            ${n.map(e=>ce`
                <div class="disk-legend-row">
                  <span class="disk-dot" style="background:${e.color}"></span>
                  <span class="disk-label">${e.label}</span>
                  <span class="disk-value">${Re(e.bytes)}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `}_renderFullLayout(e,t){return ce`
      <div class="full-container">
        <div class="full-layout">
          <div class="full-left">${this._renderStandardBody(t)}${this._renderDetailedExtras(e,t)}</div>
          <div class="full-right">${this._renderHistoryCharts(t)}${this._renderDiskUsage(t)}</div>
        </div>
      </div>
    `}_moreInfo(e){e&&Pe(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=this._config.mode??"standard",n=[...new Set([...s[t]??s.standard,...o])],i=Te(this._hass,this._config.device_id,n).found,a=this._config.title||e.name_by_user||e.name||"Environment",r="on"===i.online?.state.state,c=!i.online,d=Array.isArray(i.online?.state.attributes.labels)?i.online.state.attributes.labels:[];return ce`
      <ha-card>
        ${this._renderHeader(a,e,r,i)}
        ${d.length>0?ce`<div class="label-row">
              ${d.map(e=>{const{color:t,bgColor:n}=Xe(e);return ce`<span class="label-pill" style="color: ${t}; background: ${n};">${e}</span>`})}
            </div>`:le}
        <div class="body">
          ${c?ce`<div class="error-state core-message">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <span>
                  No Dockhand entities found for this environment yet. If you just added the
                  integration, wait for the first refresh; otherwise check that this device still
                  belongs to ha-dockhand.
                </span>
              </div>`:r?"compact"===t?this._renderCompactBody(i):"full"===t?this._renderFullLayout(e,i):"custom"===t?this._renderCustomBody(e,i):ce`${this._renderStandardBody(i)}${"detailed"===t?this._renderDetailedExtras(e,i):le}`:this._renderOffline()}
        </div>
      </ha-card>
    `}_renderHeader(e,t,n,i){const s=Ke(t.configuration_url),o=i.connectionType,a=!o&&t.hw_version?et[t.hw_version]:void 0,r=i.online?.entityId;return ce`
      <div class="header">
        <div class="header-left">
          <!-- Dockhand's own tile shows the user's per-environment custom
           * icon here (EnvironmentIcon component — Lucide icon name or a
           * custom upload, user-configurable per environment in Dockhand).
           * There's no clean mapping from arbitrary Lucide icon names to
           * MDI (different icon sets, no shared naming convention), and
           * ha-dockhand doesn't currently expose the icon choice as
           * attribute data anyway — documented as a real, deliberately
           * deferred gap in docs/BACKLOG.md, not an oversight. This is a
           * fixed generic icon, not an attempt at the per-environment one —
           * mdi:web specifically because that's Dockhand's own actual
           * default (icon: data.icon || 'globe' when an environment is
           * created without picking one, which resolves to Lucide's Globe
           * icon — verified in Dockhand's source, not assumed), so a user
           * who never customized their environment's icon sees the same
           * shape here as they would in Dockhand itself. -->
          <div class="icon-badge ${n?"":"offline"}">
            <ha-icon icon="mdi:web"></ha-icon>
          </div>
          ${o?ce`<span
                class="conn-icon clickable"
                style="color:${et[o.state.state]?.color??"inherit"}"
                tabindex="0"
                role="button"
                title=${o.state.attributes.friendly_name??""}
                @click=${()=>this._moreInfo(o.entityId)}
                @keydown=${this._onKeydown(o.entityId)}
              >
                <ha-state-icon .hass=${this._hass} .stateObj=${o.state}></ha-state-icon>
              </span>`:a?ce`<ha-icon class="conn-icon" icon=${a.icon} style="color:${a.color}" title=${a.title}></ha-icon>`:le}
          <div class="name-block">
            <div
              class="name-row ${r?"clickable":""}"
              tabindex=${r?0:-1}
              role=${r?"button":le}
              @click=${()=>this._moreInfo(r)}
              @keydown=${this._onKeydown(r)}
            >
              <span class="name">${e}</span>
              ${i.online?ce`<ha-state-icon .hass=${this._hass} .stateObj=${i.online.state}></ha-state-icon>`:ce`<ha-icon icon="mdi:help-circle-outline"></ha-icon>`}
            </div>
            ${i.online?.state.attributes.connection_host?ce`<span class="subtitle"
                  >${i.online.state.attributes.connection_host}${i.online.state.attributes.connection_port?`:${i.online.state.attributes.connection_port}`:""}</span
                >`:le}
          </div>
        </div>
        <div class="status-icons">
          ${"on"===i.autoUpdate?.state.state?this._statusIcon(i.autoUpdate,"--dockhand-status-ok-color"):"on"===i.updateChecks?.state.state?this._statusIcon(i.updateChecks,"--dockhand-status-ok-color"):le}
          ${this._statusIcon(i.vulnerabilityScanning,"--dockhand-status-ok-color")}
          ${this._statusIcon(i.activityLogging,"--dockhand-status-warn-color")}
          ${this._statusIcon(i.metricsCollection,"--dockhand-status-info-color")}
          ${this._config?.show_settings_link?s?ce`<span class="settings-link" title=${Ge(this._hass,"settings_link_open")} @click=${()=>this._openDockhand(t.configuration_url)}>
                  <ha-icon icon="mdi:cog"></ha-icon>
                </span>`:ce`<span class="settings-link unavailable" title=${Ge(this._hass,"settings_link_unavailable")}>
                  <ha-icon icon=${Ve}></ha-icon>
                </span>`:le}
        </div>
      </div>
    `}_statusIcon(e,t){return e&&"on"===e.state.state?ce`<span
      class="status-icon clickable"
      style="color:var(${t})"
      tabindex="0"
      role="button"
      title=${e.state.attributes.friendly_name??""}
      @click=${()=>this._moreInfo(e.entityId)}
      @keydown=${this._onKeydown(e.entityId)}
    >
      <ha-state-icon .hass=${this._hass} .stateObj=${e.state}></ha-state-icon>
    </span>`:le}_renderOffline(){return ce`
      <div class="offline-state">
        <ha-icon icon="mdi:wifi-off"></ha-icon>
        <span>Environment offline</span>
      </div>
    `}_renderCompactBody(e){return this._renderContainerSection(e)}_renderStandardBody(e){return ce`${this._renderContainerSection(e)}${this._renderMetricsSection(e)}${this._renderResourceGrid(e)}${this._renderEventsRow(e)}`}_renderContainerSection(e){if(!e.containers)return le;const t=e.containers.state.attributes,n=e.containers.state.state??"—",i=Number(t.unhealthy??0),s=Number(t.restarting??0),o=e.containers.entityId,a=i>0?"warn":s>0?"error":"ok",r=i>0?"mdi:alert":s>0?"mdi:refresh":"mdi:check-circle",c=i>0?`${i} unhealthy`:s>0?`${s} restarting`:"All containers healthy";return ce`
      <div
        class="container-stats clickable"
        tabindex="0"
        role="button"
        @click=${()=>this._moreInfo(o)}
        @keydown=${this._onKeydown(o)}
      >
        <span class="stat"><ha-icon icon="mdi:play" style="color:var(--dockhand-status-ok-color)"></ha-icon>${t.running??0}</span>
        <span class="stat"><ha-icon icon="mdi:stop" style="color:var(--secondary-text-color)"></ha-icon>${t.stopped??0}</span>
        <span class="stat"><ha-icon icon="mdi:pause" style="color:var(--dockhand-status-warn-color)"></ha-icon>${t.paused??0}</span>
        <span class="stat">
          <ha-icon icon="mdi:refresh" style="color:${s>0?"var(--dockhand-status-error-color)":"var(--dockhand-status-ok-color)"}"></ha-icon>${s}
        </span>
        <span class="stat">
          <ha-icon icon="mdi:alert" style="color:${i>0?"var(--dockhand-status-error-color)":"var(--dockhand-status-ok-color)"}"></ha-icon>${i}
        </span>
        <span class="stat">
          <ha-icon
            icon="mdi:arrow-up-circle"
            style="color:${(t.pending_updates??0)>0?"var(--dockhand-status-warn-color)":"var(--secondary-text-color)"}"
          ></ha-icon>${t.pending_updates??0}
        </span>
        <span class="stat"><span class="total-label">Total</span>${n}</span>
      </div>

      <div
        class="health-banner ${a} clickable"
        tabindex="0"
        role="button"
        @click=${()=>this._moreInfo(o)}
        @keydown=${this._onKeydown(o)}
      >
        <ha-icon icon=${r}></ha-icon>
        <span>${c}</span>
      </div>
    `}_renderMetricsSection(e){if(!e.cpuUsage&&!e.memoryUsage)return le;const t=e.cpuUsage?Number(e.cpuUsage.state.state):void 0,n=e.memoryUsage?Number(e.memoryUsage.state.state):void 0;if(void 0===t&&void 0===n)return le;const i=e.memoryUsage?.state.attributes.memory_used_bytes,s=e.cpuUsage?.entityId,o=e.memoryUsage?.entityId;return ce`
      <div class="metric-row">
        ${void 0!==t?ce`
              <div
                class="metric-line clickable"
                tabindex="0"
                role="button"
                @click=${()=>this._moreInfo(s)}
                @keydown=${this._onKeydown(s)}
              >
                <span class="metric-label"><ha-state-icon .hass=${this._hass} .stateObj=${e.cpuUsage.state}></ha-state-icon> CPU</span>
                <span class="metric-value">${t.toFixed(1)}%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill ${He(t)}" style="width:${Math.min(t,100)}%"></div>
              </div>
            `:le}
        ${void 0!==n?ce`
              <div
                class="metric-line clickable"
                tabindex="0"
                role="button"
                @click=${()=>this._moreInfo(o)}
                @keydown=${this._onKeydown(o)}
              >
                <span class="metric-label"><ha-state-icon .hass=${this._hass} .stateObj=${e.memoryUsage.state}></ha-state-icon> Memory</span>
                <span class="metric-value">
                  ${n.toFixed(1)}% <span class="used">(${Re(i)})</span>
                </span>
              </div>
              <div class="bar-track">
                <div class="bar-fill ${He(n)}" style="width:${Math.min(n,100)}%"></div>
              </div>
            `:le}
      </div>
    `}_renderResourceGrid(e){const t=[{label:"Images",entry:e.imageCount},{label:"Stacks",entry:e.stacks},{label:"Volumes",entry:e.volumeCount},{label:"Networks",entry:e.networkCount}].filter(e=>e.entry);return 0===t.length?le:ce`
      <div class="resource-grid">
        ${t.map(e=>{const t=e.entry,n="Stacks"===e.label,i=n?t.state.attributes:void 0;return ce`
            <div
              class="resource-item clickable"
              tabindex="0"
              role="button"
              @click=${()=>this._moreInfo(t.entityId)}
              @keydown=${this._onKeydown(t.entityId)}
            >
              <span class="label">
                <ha-state-icon .hass=${this._hass} .stateObj=${t.state}></ha-state-icon>
                ${e.label}
              </span>
              <span class="breakdown">
                ${t.state.state}
                ${n&&Number(t.state.state)>0?ce`
                      <span class="running">${i?.running??0}</span>/<span class="partial">${i?.partial??0}</span>/<span
                        class="stopped"
                        >${i?.stopped??0}</span
                      >
                    `:le}
              </span>
            </div>
          `})}
      </div>
    `}_renderEventsRow(e){if(!e.activityEvents)return le;const t=Number(e.activityEvents.state.state);if(!Number.isFinite(t)||t<=0)return le;const n=e.activityEvents.state.attributes.today??0,i=e.activityEvents.entityId;return ce`
      <div
        class="events-row clickable"
        tabindex="0"
        role="button"
        @click=${()=>this._moreInfo(i)}
        @keydown=${this._onKeydown(i)}
      >
        <span class="label">
          <ha-state-icon .hass=${this._hass} .stateObj=${e.activityEvents.state}></ha-state-icon>
          Events
        </span>
        <span class="value">${n} today <span style="font-weight:normal">/ ${t} total</span></span>
      </div>
    `}_renderDetailedExtras(e,t){const n=this._hass?_(this._hass.devices[e.id]):null,i=this._resolveTopContainers(t,n),s=this._config?Te(this._hass,this._config.device_id,["activityEvents"]).found.activityEvents:void 0,o=Array.isArray(s?.state.attributes.recent_events)?s.state.attributes.recent_events:[];return ce`${this._renderRecentEvents(o,s?.entityId)}${this._renderTopContainers(i)}`}_renderCustomBody(e,t){const n=new Set(this._config?.custom_sections??Ye);if(0===n.size)return ce`<div class="core-message">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>No sections selected — edit this card to choose what to show.</span>
      </div>`;const i=this._hass?_(this._hass.devices[e.id]):null,s=n.has("recent_events"),o=n.has("top_containers");let a,r=[];if(s){const e=this._config?Te(this._hass,this._config.device_id,["activityEvents"]).found.activityEvents:void 0;r=Array.isArray(e?.state.attributes.recent_events)?e.state.attributes.recent_events:[],a=e?.entityId}const c=o?this._resolveTopContainers(t,i):[],d={container_counts:()=>this._renderContainerSection(t),metrics:()=>this._renderMetricsSection(t),resources:()=>this._renderResourceGrid(t),events_summary:()=>this._renderEventsRow(t),recent_events:()=>this._renderRecentEvents(r,a),top_containers:()=>this._renderTopContainers(c),disk_usage:()=>this._renderDiskUsage(t),history_chart:()=>this._renderHistoryCharts(t)};return ce`${Ze.filter(e=>n.has(e)).map(e=>d[e]())}`}_resolveTopContainers(e,t){const n=e.cpuUsage?.state.attributes.top_containers;return Array.isArray(n)&&n.length>0?n.map(e=>({deviceId:"",name:e.name??"—",cpuPercent:"number"==typeof e.cpu_percent?e.cpu_percent:null,cpuEntityId:null,memoryPercent:"number"==typeof e.memory_percent?e.memory_percent:null,memoryEntityId:null})):null!==t&&this._hass?function(e,t,n=5){const i=u(e,t),s=[];for(const t of i){const{found:n}=Ne(e,t.id,["cpuPercent","memoryPercent"]);if(!n.cpuPercent&&!n.memoryPercent)continue;const i=n.cpuPercent?Number(n.cpuPercent.state.state):null,o=n.memoryPercent?Number(n.memoryPercent.state.state):null;s.push({deviceId:t.id,name:t.name_by_user||t.name||t.id,cpuPercent:Number.isFinite(i)?i:null,cpuEntityId:n.cpuPercent?.entityId??null,memoryPercent:Number.isFinite(o)?o:null,memoryEntityId:n.memoryPercent?.entityId??null})}return s.sort((e,t)=>(t.cpuPercent??-1)-(e.cpuPercent??-1)),s.slice(0,n)}(this._hass,t,5):[]}_renderTopContainers(e){return 0===e.length?le:ce`
      <div class="section">
        <div class="section-title"><ha-icon icon="mdi:package-variant"></ha-icon> Top containers by CPU</div>
        <div>
          ${e.map(e=>ce`
              <div class="top-container-row">
                <span class="name">${e.name}</span>
                <span
                  class="metric ${e.cpuEntityId?"clickable":""}"
                  tabindex=${e.cpuEntityId?0:-1}
                  role=${e.cpuEntityId?"button":le}
                  @click=${()=>this._moreInfo(e.cpuEntityId)}
                  @keydown=${this._onKeydown(e.cpuEntityId)}
                >
                  <ha-icon icon="mdi:chip"></ha-icon>${null!==e.cpuPercent?`${e.cpuPercent.toFixed(0)}%`:"—"}
                </span>
                <span
                  class="metric ${e.memoryEntityId?"clickable":""}"
                  tabindex=${e.memoryEntityId?0:-1}
                  role=${e.memoryEntityId?"button":le}
                  @click=${()=>this._moreInfo(e.memoryEntityId)}
                  @keydown=${this._onKeydown(e.memoryEntityId)}
                >
                  <ha-icon icon="mdi:memory"></ha-icon>${null!==e.memoryPercent?`${e.memoryPercent.toFixed(0)}%`:"—"}
                </span>
              </div>
            `)}
        </div>
      </div>
    `}_renderRecentEvents(e,t){return 0===e.length?le:ce`
      <div class="section">
        <div
          class="section-title ${t?"clickable":""}"
          tabindex=${t?0:-1}
          role=${t?"button":le}
          @click=${()=>this._moreInfo(t)}
          @keydown=${this._onKeydown(t)}
        >
          <ha-icon icon="mdi:pulse"></ha-icon> Recent events
        </div>
        <div>
          ${e.slice(0,8).map(e=>ce`
              <div class="event-row">
                <ha-icon
                  icon=${e.action&&tt[it(e.action)]||"mdi:pulse"}
                  style="color:${e.action&&nt[it(e.action)]||"#94a3b8"}"
                  title=${e.action??""}
                ></ha-icon>
                <span class="event-text"><strong>${e.container_name??"unknown"}</strong></span>
                ${e.timestamp?ce`<ha-relative-time .hass=${this._hass} .datetime=${new Date(e.timestamp)}></ha-relative-time>`:le}
              </div>
            `)}
        </div>
      </div>
    `}_openDockhand(e){window.open(e,"_blank","noopener,noreferrer")}}st.styles=Qe,f([Ue()],st.prototype,"_config",void 0),f([Ue()],st.prototype,"_hass",void 0),f([Ue()],st.prototype,"_cpuHistory",void 0),f([Ue()],st.prototype,"_memHistory",void 0),f([Ue()],st.prototype,"_hoverPoint",void 0);const ot=C`
  ${Je}

  .total-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .total-count {
    font-size: 1.8em;
    font-weight: 600;
  }
  .total-label {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }
  .severity-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  .severity-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 4px;
    border-radius: 8px;
    font-size: 0.75em;
  }
  .severity-pill .count {
    font-size: 1.1em;
    font-weight: 600;
  }
  .severity-pill.critical {
    background: rgb(from var(--dockhand-severity-critical-color) r g b / 0.1);
    color: var(--dockhand-severity-critical-color);
  }
  .severity-pill.high {
    background: rgb(from var(--dockhand-severity-high-color) r g b / 0.1);
    color: var(--dockhand-severity-high-color);
  }
  .severity-pill.medium {
    background: rgb(from var(--dockhand-severity-medium-color) r g b / 0.1);
    color: var(--dockhand-severity-medium-color);
  }
  .severity-pill.low {
    background: rgb(from var(--dockhand-severity-low-color) r g b / 0.1);
    color: var(--dockhand-severity-low-color);
  }
  .coverage-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8em;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color);
    color: var(--secondary-text-color);
  }
  .coverage-row .value {
    color: var(--primary-text-color);
    font-weight: 500;
  }
  .all-clear {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: 6px;
    font-size: 0.85em;
    font-weight: 500;
    background: rgb(from var(--dockhand-status-ok-color) r g b / 0.12);
    color: var(--dockhand-status-ok-color);
  }
`,at=[{key:"critical",label:"Critical"},{key:"high",label:"High"},{key:"medium",label:"Medium"},{key:"low",label:"Low"}];class rt extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-vulnerability-card",device_id:t[0]?.deviceId??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return Mt}),document.createElement("dockhand-vulnerability-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&Pe(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=Te(this._hass,this._config.device_id,["online","vulnerabilities"]),n=t.found,i=this._config.title||e.name_by_user||e.name||"Environment",s="on"===n.online?.state.state,o=Ke(e.configuration_url);return ce`
      <ha-card>
        ${this._renderHeader(i,o,s,n)}
        <div class="body">${this._renderBody(n,t)}</div>
      </ha-card>
    `}_renderHeader(e,t,n,i){const s=i.online?.entityId;return ce`
      <div class="header">
        <div class="header-left">
          <div class="icon-badge ${n?"":"offline"}">
            <ha-icon icon="mdi:shield-bug"></ha-icon>
          </div>
          <div class="name-block">
            <div
              class="name-row ${s?"clickable":""}"
              tabindex=${s?0:-1}
              role=${s?"button":le}
              @click=${()=>this._moreInfo(s)}
              @keydown=${this._onKeydown(s)}
            >
              <span class="name">${e}</span>
            </div>
          </div>
        </div>
        <div class="status-icons">
          ${this._config?.show_settings_link?t?ce`<span
                  class="settings-link"
                  title=${Ge(this._hass,"settings_link_view_vulnerabilities")}
                  @click=${()=>window.open(`${t}/images?tab=vulnerabilities`,"_blank","noopener,noreferrer")}
                >
                  <ha-icon icon="mdi:open-in-new"></ha-icon>
                </span>`:ce`<span class="settings-link unavailable" title=${Ge(this._hass,"settings_link_unavailable")}>
                  <ha-icon icon=${Ve}></ha-icon>
                </span>`:le}
        </div>
      </div>
    `}_renderBody(e,t){if(!e.vulnerabilities){const e=t.unavailable.find(e=>"vulnerabilities"===e.key);return ce`
        <div class="unavailable-hint core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>
            This card needs the "Vulnerabilities" sensor enabled for this environment (it's off by
            default — enable it in Home Assistant's entity settings, and make sure vulnerability
            scanning is turned on for this environment in Dockhand itself).
            ${"not_found"===e?.reason?ce`<br />Requires a recent ha-dockhand release.`:le}
          </span>
        </div>
      `}const n=e.vulnerabilities.state.attributes,i=Number(e.vulnerabilities.state.state)||0,s=e.vulnerabilities.entityId,o=n.images_scanned,a=n.total_images;return ce`
      <div class="clickable" tabindex="0" role="button" @click=${()=>this._moreInfo(s)} @keydown=${this._onKeydown(s)}>
        ${0===i?ce`<div class="all-clear"><ha-icon icon="mdi:shield-check"></ha-icon> No vulnerabilities found</div>`:ce`
              <div class="total-row">
                <span class="total-count">${i}</span>
                <span class="total-label">total findings</span>
              </div>
              <div class="severity-grid">
                ${at.map(e=>ce`
                    <div class="severity-pill ${e.key}">
                      <span class="count">${n[e.key]??0}</span>
                      <span>${e.label}</span>
                    </div>
                  `)}
              </div>
            `}
        ${void 0!==o&&void 0!==a?ce`
              <div class="coverage-row">
                <span>Images scanned</span>
                <span class="value">${o} / ${a}</span>
              </div>
            `:le}
      </div>
    `}}rt.styles=ot,f([Ue()],rt.prototype,"_config",void 0),f([Ue()],rt.prototype,"_hass",void 0);const ct=C`
  ${Je}

  .type-pill {
    padding: 1px 7px;
    border-radius: 8px;
    font-size: 0.68em;
    font-weight: 500;
    background: var(--divider-color);
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }
  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .status-word {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 1.1em;
    font-weight: 600;
    text-transform: capitalize;
  }
  .status-word ha-icon {
    --mdc-icon-size: 20px;
  }
  .status-word.running {
    color: var(--dockhand-status-ok-color);
  }
  .status-word.partial {
    color: var(--dockhand-status-warn-color);
  }
  .status-word.stopped {
    color: var(--dockhand-status-error-color);
  }
  .status-word.created {
    color: var(--secondary-text-color);
  }
  .container-count {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }
  .updates-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 0.78em;
    font-weight: 500;
    margin-top: 8px;
    background: rgb(from var(--dockhand-status-warn-color) r g b / 0.12);
    color: var(--dockhand-status-warn-color);
  }
  .updates-badge ha-icon {
    --mdc-icon-size: 14px;
  }
  .git-section {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color);
  }
  .git-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8em;
    margin-bottom: 4px;
  }
  .git-row .label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
  }
  .git-row .label ha-icon {
    --mdc-icon-size: 13px;
  }
  .sync-status {
    font-weight: 500;
    text-transform: capitalize;
  }
  .sync-status.synced {
    color: var(--dockhand-status-ok-color);
  }
  .sync-status.syncing {
    color: var(--dockhand-status-info-color);
  }
  .sync-status.pending {
    color: var(--secondary-text-color);
  }
  .sync-status.error {
    color: var(--dockhand-status-error-color);
  }
  .sync-error-banner {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 0.75em;
    margin-top: 6px;
    background: rgb(from var(--dockhand-status-error-color) r g b / 0.1);
    color: var(--dockhand-status-error-color);
  }
  .sync-error-banner ha-icon {
    --mdc-icon-size: 14px;
    flex-shrink: 0;
    margin-top: 1px;
  }
`,dt={running:"mdi:play-circle",partial:"mdi:alert-circle",stopped:"mdi:stop-circle",created:"mdi:circle-outline"},lt={synced:"mdi:check-circle",syncing:"mdi:sync",pending:"mdi:clock-outline",error:"mdi:alert-circle"};class ht extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(t){const n=function(t){return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&/^stack_\d+_/.test(n)))}(t);return{type:"custom:dockhand-stack-card",device_id:n[0]?.id??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return Ht}),document.createElement("dockhand-stack-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand stack.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&Pe(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Stack device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=Ke(e.configuration_url),n=Le(this._hass,this._config.device_id,["status","containersInStack","updatesAvailable","gitSyncStatus","gitLastSync","gitSyncError"]).found,i=this._config.title||e.name_by_user||e.name||"Stack",s=Boolean(n.gitSyncStatus);return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:layers"></ha-icon>
            </div>
            <div class="name-block">
              <span class="name">${i}</span>
            </div>
          </div>
          <span class="type-pill">${e.model??"Stack"}</span>
          ${this._config?.show_settings_link?t?ce`<span class="settings-link" title=${Ge(this._hass,"settings_link_open")} @click=${()=>window.open(e.configuration_url,"_blank","noopener,noreferrer")}>
                  <ha-icon icon="mdi:open-in-new"></ha-icon>
                </span>`:ce`<span class="settings-link unavailable" title=${Ge(this._hass,"settings_link_unavailable")}>
                  <ha-icon icon=${Ve}></ha-icon>
                </span>`:le}
        </div>
        <div class="body">${this._renderBody(n,s,e)}</div>
      </ha-card>
    `}_renderBody(e,t,n){if(!e.status)return ce`<div class="unavailable-hint core-message">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>This stack's status sensor isn't available yet.</span>
      </div>`;const i=e.status.state.state,s=e.status.state.attributes.container_count??e.containersInStack?.state.state,o=e.status.state.attributes.container_names,a="on"===e.updatesAvailable?.state.state,r=e.updatesAvailable?.state.attributes.update_count,c=o&&o.length>0?this._containerNameToEntityId(n):new Map;return ce`
      <div
        class="status-row clickable"
        tabindex="0"
        role="button"
        @click=${()=>this._moreInfo(e.status.entityId)}
        @keydown=${this._onKeydown(e.status.entityId)}
      >
        <span class="status-word ${i}"><ha-icon icon=${dt[i]??"mdi:help-circle"}></ha-icon> ${i}</span>
        ${void 0!==s?ce`<span class="container-count">${s} containers</span>`:le}
      </div>

      ${a?ce`
            <div
              class="updates-badge clickable"
              tabindex="0"
              role="button"
              @click=${()=>this._moreInfo(e.updatesAvailable?.entityId)}
              @keydown=${this._onKeydown(e.updatesAvailable?.entityId)}
            >
              <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
              ${r??"Updates"} update${1===r?"":"s"} available
            </div>
          `:le}
      ${o&&o.length>0?ce`
            <div class="section">
              <div class="section-title"><ha-icon icon="mdi:docker"></ha-icon> Containers</div>
              <div class="label-row">
                ${o.map(e=>{const t=c.get(e);return t?ce`<span
                        class="label-pill clickable"
                        tabindex="0"
                        role="button"
                        @click=${()=>this._moreInfo(t)}
                        @keydown=${this._onKeydown(t)}
                        >${e}</span
                      >`:ce`<span class="label-pill">${e}</span>`})}
              </div>
            </div>
          `:le}
      ${t?this._renderGitSection(e):le}
    `}_containerNameToEntityId(e){const t=new Map;if(!this._hass)return t;const n=g(e);if(null===n)return t;for(const e of u(this._hass,n)){const{found:n}=Ne(this._hass,e.id,["state"]),i=n.state?.state.attributes.name;i&&n.state&&t.set(i,n.state.entityId)}return t}_renderGitSection(e){const t=e.gitSyncStatus.state.state,n="on"===e.gitSyncError?.state.state,i=e.gitSyncStatus?.state.attributes.sync_error,s=e.gitSyncStatus?.state.attributes.last_commit;return ce`
      <div class="section git-section">
        <div class="section-title"><ha-icon icon="mdi:source-branch"></ha-icon> Git sync</div>
        <div
          class="git-row clickable"
          tabindex="0"
          role="button"
          @click=${()=>this._moreInfo(e.gitSyncStatus?.entityId)}
          @keydown=${this._onKeydown(e.gitSyncStatus?.entityId)}
        >
          <span class="label"><ha-icon icon=${lt[t]??"mdi:source-branch"}></ha-icon> Status</span>
          <span class="sync-status ${t}">${t}</span>
        </div>
        ${e.gitLastSync?ce`
              <div
                class="git-row clickable"
                tabindex="0"
                role="button"
                @click=${()=>this._moreInfo(e.gitLastSync?.entityId)}
                @keydown=${this._onKeydown(e.gitLastSync?.entityId)}
              >
                <span class="label"><ha-icon icon="mdi:clock-outline"></ha-icon> Last sync</span>
                <ha-relative-time .hass=${this._hass} .datetime=${new Date(e.gitLastSync.state.state)}></ha-relative-time>
              </div>
            `:le}
        ${s?ce`<div class="git-row"><span class="label"><ha-icon icon="mdi:source-commit"></ha-icon> Commit</span><span>${String(s).slice(0,7)}</span></div>`:le}
        ${n?ce`
              <div
                class="sync-error-banner clickable"
                tabindex="0"
                role="button"
                @click=${()=>this._moreInfo(e.gitSyncError?.entityId)}
                @keydown=${this._onKeydown(e.gitSyncError?.entityId)}
              >
                <ha-icon icon="mdi:alert"></ha-icon>
                <span>${i||"The last sync/deploy attempt failed."}</span>
              </div>
            `:le}
      </div>
    `}}ht.styles=ct,f([Ue()],ht.prototype,"_config",void 0),f([Ue()],ht.prototype,"_hass",void 0);const _t=C`
  ${Je}

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .image-tag {
    display: block;
    font-size: 0.75em;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .update-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78em;
    font-weight: 500;
    padding: 5px 8px;
    border-radius: 6px;
    background: rgb(from var(--dockhand-status-warn-color) r g b / 0.12);
    color: var(--dockhand-status-warn-color);
    white-space: nowrap;
  }
  .update-chip ha-icon {
    --mdc-icon-size: 14px;
  }

  .state-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .state-word {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 1.1em;
    font-weight: 600;
    text-transform: capitalize;
  }
  .state-word ha-icon {
    --mdc-icon-size: 20px;
  }
  .state-word.running {
    color: var(--dockhand-status-ok-color);
  }
  .state-word.paused {
    color: var(--dockhand-status-warn-color);
  }
  .state-word.restarting {
    color: var(--dockhand-status-error-color);
  }
  .state-word.exited,
  .state-word.dead {
    color: var(--secondary-text-color);
  }
  .health-chip {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.75em;
    padding: 2px 7px;
    border-radius: 8px;
  }
  .health-chip ha-icon {
    --mdc-icon-size: 12px;
  }
  .health-chip.healthy {
    background: rgb(from var(--dockhand-status-ok-color) r g b / 0.12);
    color: var(--dockhand-status-ok-color);
  }
  .health-chip.unhealthy {
    background: rgb(from var(--dockhand-status-error-color) r g b / 0.12);
    color: var(--dockhand-status-error-color);
  }
  .health-chip.starting {
    background: rgb(from var(--dockhand-status-warn-color) r g b / 0.12);
    color: var(--dockhand-status-warn-color);
  }
  .io-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 16px;
    font-size: 0.8em;
    margin-top: 8px;
  }
  .io-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .io-item .label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
  }
  .io-item .label ha-icon {
    --mdc-icon-size: 13px;
  }
`,ut={running:"mdi:play-circle",paused:"mdi:pause-circle",restarting:"mdi:refresh-circle",exited:"mdi:stop-circle",dead:"mdi:close-circle",created:"mdi:circle-outline"},mt={healthy:"mdi:heart",unhealthy:"mdi:heart-broken",starting:"mdi:heart-outline"};class pt extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(t){const n=function(t){return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&/^container_\d+_/.test(n)))}(t);return{type:"custom:dockhand-container-card",device_id:n[0]?.id??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return Vt}),document.createElement("dockhand-container-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand container.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&Pe(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Container device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=Ke(e.configuration_url),n=Ne(this._hass,this._config.device_id,["state","health","cpuPercent","memoryUsage","memoryPercent","memoryLimit","networkRx","networkTx","blockRead","blockWrite"]).found,i=this._config.title||e.name_by_user||e.name||"Container",s=n.state?.state.attributes.image,o=Me(this._hass,this._config.device_id,"update"),a="on"===o?.state.state;return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:docker"></ha-icon>
            </div>
            <div class="name-block">
              <span class="name">${i}</span>
              ${s?ce`<span class="image-tag">${s}</span>`:le}
            </div>
          </div>
          <div class="header-right">
            ${a?ce`
                  <span
                    class="update-chip clickable"
                    tabindex="0"
                    role="button"
                    title=${o?.state.attributes.latest_version?`Update available: ${o.state.attributes.installed_version??"?"} → ${o.state.attributes.latest_version}`:"Update available"}
                    @click=${()=>this._moreInfo(o?.entityId)}
                    @keydown=${this._onKeydown(o?.entityId)}
                  >
                    <ha-icon icon="mdi:package-up"></ha-icon> Update available
                  </span>
                `:le}
            ${this._config?.show_settings_link?t?ce`<span class="settings-link" title=${Ge(this._hass,"settings_link_open")} @click=${()=>window.open(e.configuration_url,"_blank","noopener,noreferrer")}>
                    <ha-icon icon="mdi:open-in-new"></ha-icon>
                  </span>`:ce`<span class="settings-link unavailable" title=${Ge(this._hass,"settings_link_unavailable")}>
                    <ha-icon icon=${Ve}></ha-icon>
                  </span>`:le}
          </div>
        </div>
        <div class="body">${this._renderBody(n)}</div>
      </ha-card>
    `}_renderBody(e){if(!e.state)return ce`<div class="unavailable-hint core-message">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>This container's state sensor isn't available yet.</span>
      </div>`;const t=e.state.state.state,n=e.health?.state.state;return ce`
      <div
        class="state-row clickable"
        tabindex="0"
        role="button"
        @click=${()=>this._moreInfo(e.state.entityId)}
        @keydown=${this._onKeydown(e.state.entityId)}
      >
        <span class="state-word ${t}"><ha-icon icon=${ut[t]??"mdi:help-circle"}></ha-icon> ${t}</span>
        ${n?ce`
              <span
                class="health-chip ${n} clickable"
                tabindex="0"
                role="button"
                @click=${t=>{t.stopPropagation(),this._moreInfo(e.health?.entityId)}}
                @keydown=${this._onKeydown(e.health?.entityId)}
              >
                <ha-icon icon=${mt[n]??"mdi:heart-outline"}></ha-icon> ${n}
              </span>
            `:le}
      </div>
      ${this._renderMetrics(e)}${this._renderIo(e)}
    `}_renderMetrics(e){if(!e.cpuPercent&&!e.memoryPercent)return le;const t=e.cpuPercent?Number(e.cpuPercent.state.state):void 0,n=e.memoryPercent?Number(e.memoryPercent.state.state):void 0,i=e.memoryUsage?Number(e.memoryUsage.state.state):void 0,s=e.memoryLimit?Number(e.memoryLimit.state.state):void 0;return ce`
      <div class="metric-row">
        ${void 0!==t?ce`
              <div
                class="metric-line clickable"
                tabindex="0"
                role="button"
                @click=${()=>this._moreInfo(e.cpuPercent?.entityId)}
                @keydown=${this._onKeydown(e.cpuPercent?.entityId)}
              >
                <span class="metric-label"><ha-state-icon .hass=${this._hass} .stateObj=${e.cpuPercent.state}></ha-state-icon> CPU</span>
                <span class="metric-value">${t.toFixed(1)}%</span>
              </div>
              <div class="bar-track"><div class="bar-fill ${He(t)}" style="width:${Math.min(t,100)}%"></div></div>
            `:le}
        ${void 0!==n?ce`
              <div
                class="metric-line clickable"
                tabindex="0"
                role="button"
                @click=${()=>this._moreInfo(e.memoryPercent?.entityId)}
                @keydown=${this._onKeydown(e.memoryPercent?.entityId)}
              >
                <span class="metric-label"><ha-state-icon .hass=${this._hass} .stateObj=${e.memoryPercent.state}></ha-state-icon> Memory</span>
                <span class="metric-value">
                  ${n.toFixed(1)}%
                  ${void 0!==i?ce`<span class="used">(${Re(i)}${s?` / ${Re(s)}`:""})</span>`:le}
                </span>
              </div>
              <div class="bar-track"><div class="bar-fill ${He(n)}" style="width:${Math.min(n,100)}%"></div></div>
            `:le}
      </div>
    `}_renderIo(e){const t=[{icon:"mdi:download-network",label:"Network RX",entry:e.networkRx},{icon:"mdi:upload-network",label:"Network TX",entry:e.networkTx},{icon:"mdi:database-arrow-down",label:"Block read",entry:e.blockRead},{icon:"mdi:database-arrow-up",label:"Block write",entry:e.blockWrite}].filter(e=>e.entry);return 0===t.length?le:ce`
      <div class="io-grid">
        ${t.map(e=>ce`
            <div
              class="io-item clickable"
              tabindex="0"
              role="button"
              @click=${()=>this._moreInfo(e.entry?.entityId)}
              @keydown=${this._onKeydown(e.entry?.entityId)}
            >
              <span class="label"><ha-icon icon=${e.icon}></ha-icon> ${e.label}</span>
              <span>${Re(Number(e.entry.state.state))}</span>
            </div>
          `)}
      </div>
    `}}pt.styles=_t,f([Ue()],pt.prototype,"_config",void 0),f([Ue()],pt.prototype,"_hass",void 0);const vt=["container_count","updates","type"],gt=C`
  ${Je}

  .name-and-type {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }
  /* Overrides the shared .item-name's own flex: 1 (which other cards rely
   * on to push everything after the name to the row's far right edge) —
   * here, .name-and-type itself takes over that growing role, so the
   * type pill sits immediately after the name instead. */
  .name-and-type .item-name {
    flex: 0 1 auto;
  }
  .item-type-pill {
    padding: 1px 6px;
    border-radius: 8px;
    font-size: 0.7em;
    font-weight: 500;
    background: var(--divider-color);
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }
`,bt={running:{icon:"mdi:play-circle",cls:"ok"},partial:{icon:"mdi:alert-circle",cls:"warn"},stopped:{icon:"mdi:stop-circle",cls:"error"},created:{icon:"mdi:circle-outline",cls:"neutral"}};class ft extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-stacks-card",device_id:t[0]?.deviceId??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return qt}),document.createElement("dockhand-stacks-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){if(!this._hass||!this._config)return 3;const e=_(this._hass.devices[this._config.device_id]),t=null!==e?p(this._hass,e).length:0;return Math.max(2,Math.ceil(t/2)+1)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&Pe(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=_(e),n=null!==t?p(this._hass,t):[],i=this._config.title||e.name_by_user||e.name||"Environment",s=Ke(e.configuration_url),o=n.map(e=>{const{found:t}=Le(this._hass,e.id,["status","containersInStack","updatesAvailable"]);if(!t.status)return null;const n=t.status.state.attributes;return{name:n.name||e.name_by_user||e.name||e.id,type:n.type||e.model||"Stack",found:t}}).filter(e=>null!==e).sort((e,t)=>e.name.localeCompare(t.name));return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:layers"></ha-icon>
            </div>
            <div class="name-block"><span class="name">${i} — Stacks</span></div>
          </div>
          ${this._config?.show_settings_link?s?ce`<span class="settings-link" title=${Ge(this._hass,"settings_link_view_stacks")} @click=${()=>window.open(`${s}/stacks`,"_blank","noopener,noreferrer")}>
                  <ha-icon icon="mdi:open-in-new"></ha-icon>
                </span>`:ce`<span class="settings-link unavailable" title=${Ge(this._hass,"settings_link_unavailable")}>
                  <ha-icon icon=${Ve}></ha-icon>
                </span>`:le}
        </div>
        <div class="body">
          ${0===o.length?ce`<div class="empty-note">No stacks found for this environment yet.</div>`:ce`<div class="row-list">${o.map(e=>this._renderRow(e))}</div>`}
        </div>
      </ha-card>
    `}_renderRow(e){const t=e.found,n=t.status.state.state,i=bt[n]??{icon:"mdi:help-circle",cls:"neutral"},s=t.containersInStack?.state.state??t.status.state.attributes.container_count,o=t.containersInStack?.entityId,a="on"===t.updatesAvailable?.state.state,r=t.updatesAvailable?.state.attributes.update_count,c=t.updatesAvailable?.entityId,d=t.status.entityId,l=new Set(this._config?.visible_badges??vt);return ce`
      <div class="item-row clickable" tabindex="0" role="button" @click=${()=>this._moreInfo(d)} @keydown=${this._onKeydown(d)}>
        <ha-icon class="item-status-icon ${i.cls}" icon=${i.icon}></ha-icon>
        <span class="name-and-type">
          <span class="item-name">${e.name}</span>
          ${l.has("type")?ce`<span class="item-type-pill">${e.type}</span>`:le}
        </span>
        ${void 0!==s&&l.has("container_count")?ce`<span
              class="item-badge ${o?"clickable":""}"
              tabindex=${o?0:-1}
              role=${o?"button":le}
              @click=${e=>{o&&(e.stopPropagation(),this._moreInfo(o))}}
              @keydown=${this._onKeydown(o)}
              ><ha-icon icon="mdi:docker"></ha-icon>${s}</span
            >`:le}
        ${a&&l.has("updates")?ce`<span
              class="item-badge updates clickable"
              tabindex="0"
              role="button"
              @click=${e=>{e.stopPropagation(),this._moreInfo(c)}}
              @keydown=${this._onKeydown(c)}
              ><ha-icon icon="mdi:arrow-up-circle"></ha-icon>${r??""}</span
            >`:le}
      </div>
    `}}ft.styles=gt,f([Ue()],ft.prototype,"_config",void 0),f([Ue()],ft.prototype,"_hass",void 0);const kt=["health","updates","cpu","memory"],yt=C`
  ${Je}

  .item-status-icon.info {
    color: var(--dockhand-status-info-color);
  }
  .item-badge.unhealthy {
    color: var(--dockhand-status-error-color);
  }
  .item-badge.healthy {
    color: var(--dockhand-status-ok-color);
  }
`,wt={running:{icon:"mdi:play-circle",cls:"ok"},paused:{icon:"mdi:pause-circle",cls:"warn"},restarting:{icon:"mdi:refresh-circle",cls:"error"},exited:{icon:"mdi:stop-circle",cls:"error"},created:{icon:"mdi:plus-circle-outline",cls:"info"},dead:{icon:"mdi:close-circle",cls:"neutral"}};class $t extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-containers-card",device_id:t[0]?.deviceId??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return Ft}),document.createElement("dockhand-containers-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){if(!this._hass||!this._config)return 3;const e=_(this._hass.devices[this._config.device_id]),t=null!==e?u(this._hass,e).length:0;return Math.max(2,Math.ceil(t/2)+1)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&Pe(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=_(e),n=null!==t?u(this._hass,t):[],i=this._config.title||e.name_by_user||e.name||"Environment",s=Ke(e.configuration_url),o=n.map(e=>{const{found:t}=Ne(this._hass,e.id,["state","health","cpuPercent","memoryPercent"]);if(!t.state)return null;const n=Me(this._hass,e.id,"update");return{name:t.state.state.attributes.name||e.name_by_user||e.name||e.id,found:t,updateEntityId:"on"===n?.state.state?n.entityId:null}}).filter(e=>null!==e).sort((e,t)=>e.name.localeCompare(t.name));return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:docker"></ha-icon>
            </div>
            <div class="name-block"><span class="name">${i} — Containers</span></div>
          </div>
          ${this._config?.show_settings_link?s?ce`<span class="settings-link" title=${Ge(this._hass,"settings_link_view_containers")} @click=${()=>window.open(`${s}/containers`,"_blank","noopener,noreferrer")}>
                  <ha-icon icon="mdi:open-in-new"></ha-icon>
                </span>`:ce`<span class="settings-link unavailable" title=${Ge(this._hass,"settings_link_unavailable")}>
                  <ha-icon icon=${Ve}></ha-icon>
                </span>`:le}
        </div>
        <div class="body">
          ${0===o.length?ce`<div class="empty-note">No containers found for this environment yet.</div>`:ce`<div class="row-list">${o.map(e=>this._renderRow(e))}</div>`}
        </div>
      </ha-card>
    `}_renderRow(e){const t=e.found,n=t.state.state.state,i=wt[n]??{icon:"mdi:help-circle",cls:"neutral"},s=t.health?.state.state,o=t.health?.entityId,a=t.cpuPercent?Number(t.cpuPercent.state.state):void 0,r=t.cpuPercent?.entityId,c=t.memoryPercent?Number(t.memoryPercent.state.state):void 0,d=t.memoryPercent?.entityId,l=t.state.entityId,h=new Set(this._config?.visible_badges??kt);return ce`
      <div class="item-row clickable" tabindex="0" role="button" @click=${()=>this._moreInfo(l)} @keydown=${this._onKeydown(l)}>
        <ha-icon class="item-status-icon ${i.cls}" icon=${i.icon}></ha-icon>
        <span class="item-name">${e.name}</span>
        ${"healthy"!==s&&"unhealthy"!==s&&"starting"!==s||!h.has("health")?le:ce`<span
              class="item-badge ${"healthy"===s?"healthy":"unhealthy"===s?"unhealthy":""} clickable"
              tabindex="0"
              role="button"
              title=${s}
              @click=${e=>{e.stopPropagation(),this._moreInfo(o)}}
              @keydown=${this._onKeydown(o)}
            >
              <ha-icon
                icon=${"healthy"===s?"mdi:heart":"unhealthy"===s?"mdi:heart-broken":"mdi:heart-outline"}
              ></ha-icon>
            </span>`}
        ${e.updateEntityId&&h.has("updates")?ce`<span
              class="item-badge updates clickable"
              tabindex="0"
              role="button"
              title="Update available"
              @click=${t=>{t.stopPropagation(),this._moreInfo(e.updateEntityId)}}
              @keydown=${this._onKeydown(e.updateEntityId)}
            >
              <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
            </span>`:le}
        ${void 0!==a&&h.has("cpu")?ce`<span
              class="item-badge clickable"
              tabindex="0"
              role="button"
              @click=${e=>{e.stopPropagation(),this._moreInfo(r)}}
              @keydown=${this._onKeydown(r)}
              ><ha-icon icon="mdi:chip"></ha-icon>${a.toFixed(0)}%</span
            >`:le}
        ${void 0!==c&&h.has("memory")?ce`<span
              class="item-badge clickable"
              tabindex="0"
              role="button"
              @click=${e=>{e.stopPropagation(),this._moreInfo(d)}}
              @keydown=${this._onKeydown(d)}
              ><ha-icon icon="mdi:memory"></ha-icon>${c.toFixed(0)}%</span
            >`:le}
      </div>
    `}}function xt(e,t){return Te(e,t,["containers"]).found.containers?.entityId}$t.styles=yt,f([Ue()],$t.prototype,"_config",void 0),f([Ue()],$t.prototype,"_hass",void 0);const Ct=C`
  ${Je}

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .bulk-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 0.78em;
    font-weight: 500;
    background: rgb(from var(--dockhand-accent-color) r g b / 0.12);
    color: var(--dockhand-accent-color);
    cursor: pointer;
    border: none;
  }
  .bulk-button.secondary {
    background: var(--divider-color);
    color: var(--secondary-text-color);
  }
  .bulk-button:hover {
    opacity: 0.85;
  }
  .bulk-button ha-icon {
    --mdc-icon-size: 14px;
  }
  .bulk-button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .spinning {
    animation: dockhand-spin 1s linear infinite;
  }
  @keyframes dockhand-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .env-group {
    margin-top: 8px;
  }
  .env-group-title {
    font-size: 0.75em;
    font-weight: 500;
    color: var(--secondary-text-color);
    margin: 8px 0 4px;
  }
  .update-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 4px;
    border-radius: 6px;
    font-size: 0.85em;
  }
  .update-row:not(:last-child) {
    border-bottom: 1px solid var(--divider-color);
  }
  .update-row ha-icon {
    --mdc-icon-size: 15px;
    color: var(--dockhand-status-warn-color);
    flex-shrink: 0;
  }
  .update-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .update-versions {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    flex-shrink: 0;
  }
`;class St extends Se{constructor(){super(...arguments),this._triggering=!1,this._checking=!1}set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(){return{type:"custom:dockhand-updates-card",scope:"all"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Xt}),document.createElement("dockhand-updates-card-editor")}setConfig(e){if("environment"===e.scope&&!e.device_id)throw new Error('Please select a Dockhand environment, or switch scope to "All environments".');this._config={...e,scope:e.scope??"all"}}set config(e){this.setConfig(e)}getCardSize(){return 4}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&Pe(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}_buildGroups(){if(!this._hass||!this._config)return{groups:[],checkUpdatesEntityIds:[],envDeviceIds:[]};let e;if("environment"===this._config.scope&&this._config.device_id){const t=this._hass.devices[this._config.device_id];if(!t)return{groups:[],checkUpdatesEntityIds:[],envDeviceIds:[]};e=[{deviceId:this._config.device_id,name:t.name_by_user||t.name||"Environment"}]}else e=l(this._hass);const t=[],n=[];for(const i of e){const e=_(this._hass.devices[i.deviceId]);if(null===e)continue;const{found:s}=Te(this._hass,i.deviceId,["envBulkUpdate","checkUpdates"]);s.checkUpdates&&n.push(s.checkUpdates.entityId);const o=u(this._hass,e),a=[];for(const e of o){const t=Me(this._hass,e.id,"update");t&&"on"===t.state.state&&a.push({entityId:t.entityId,name:t.state.attributes.name||e.name_by_user||e.name||e.id,installedVersion:t.state.attributes.installed_version,latestVersion:t.state.attributes.latest_version})}a.sort((e,t)=>e.name.localeCompare(t.name)),(a.length>0||s.envBulkUpdate)&&t.push({envDeviceId:i.deviceId,envName:i.name,bulkButtonEntityId:s.envBulkUpdate?.entityId,checkUpdatesEntityId:s.checkUpdates?.entityId,updates:a})}return{groups:t,checkUpdatesEntityIds:n,envDeviceIds:e.map(e=>e.deviceId)}}render(){if(!this._config||!this._hass)return ce``;if("environment"===this._config.scope&&!this._hass.devices[this._config.device_id??""])return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const{groups:e,checkUpdatesEntityIds:t,envDeviceIds:n}=this._buildGroups(),i=(s=this._hass,n.reduce((e,t)=>{const n=xt(s,t),i=n?s.states[n]?.attributes.pending_updates_total:void 0;return e+("number"==typeof i?i:0)},0));var s;const o=e.map(e=>e.bulkButtonEntityId).filter(e=>Boolean(e)),a=this._config.title??"Updates",r="all"===this._config.scope;return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
            </div>
            <div class="name-block"><span class="name">${a}${i>0?` (${i})`:""}</span></div>
          </div>
          <div class="header-actions">
            ${t.length>0?ce`
                  <button
                    class="bulk-button secondary"
                    ?disabled=${this._checking}
                    @click=${()=>this._triggerCheckUpdates(t)}
                  >
                    <ha-icon icon="mdi:refresh" class=${this._checking?"spinning":""}></ha-icon>
                    ${this._checking?"Checking…":"Check for updates"}
                  </button>
                `:le}
            ${o.length>0?ce`
                  <button class="bulk-button" ?disabled=${this._triggering} @click=${()=>this._triggerBulkUpdate(o)}>
                    <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
                    ${this._triggering?"Updating…":"Update all"}
                  </button>
                `:le}
          </div>
        </div>
        <div class="body">
          ${e.every(e=>0===e.updates.length)?ce`<div class="empty-note">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                <span>Everything up to date.</span>
              </div>`:e.map(e=>ce`
                  <div class="env-group">
                    ${r?ce`<div class="env-group-title">${e.envName}</div>`:le}
                    ${e.updates.map(e=>this._renderUpdateRow(e))}
                  </div>
                `)}
        </div>
      </ha-card>
    `}_renderUpdateRow(e){return ce`
      <div class="update-row clickable" tabindex="0" role="button" @click=${()=>this._moreInfo(e.entityId)} @keydown=${this._onKeydown(e.entityId)}>
        <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
        <span class="update-name">${e.name}</span>
        ${e.installedVersion&&e.latestVersion?ce`<span class="update-versions">${e.installedVersion} → ${e.latestVersion}</span>`:le}
      </div>
    `}async _triggerBulkUpdate(e){if(this._hass&&!this._triggering){this._triggering=!0;try{await this._hass.callService("button","press",{},{entity_id:e})}finally{this._triggering=!1}}}async _triggerCheckUpdates(e){if(this._hass&&!this._checking&&0!==e.length){this._checking=!0;try{await this._hass.callService("button","press",{},{entity_id:e})}finally{this._checking=!1}}}}St.styles=Ct,f([Ue()],St.prototype,"_config",void 0),f([Ue()],St.prototype,"_hass",void 0),f([Ue()],St.prototype,"_triggering",void 0),f([Ue()],St.prototype,"_checking",void 0);const zt=["environments","vulnerabilities","updates","stacks","containers"];function Et(e){return e?.environments_overrides??e?.environment_overrides}function At(e){return e?.environments_order??e?.environment_order}const It=C`
  .overview {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  /* flex-wrap keeps items in source order, so on a narrow viewport each
   * environment's column becomes a full-width row and stacks below the
   * previous one — "finish one environment before the next" on mobile,
   * matching the desktop column order, with no separate mobile layout
   * needed. */
  .env-column {
    flex: 1 1 320px;
    min-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .env-column-title {
    font-size: 0.85em;
    font-weight: 500;
    color: var(--secondary-text-color);
    padding: 0 4px;
  }
  .empty-note {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 0.9em;
    color: var(--secondary-text-color);
    text-align: center;
    padding: 24px 0;
    width: 100%;
  }
  .empty-note ha-icon {
    --mdc-icon-size: 24px;
    opacity: 0.6;
  }
`;function Ut(e,t,n){const i=t??n;return void 0!==i?{[e]:i}:{}}class Dt extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(){return{type:"custom:dockhand-overview-card",show_environments:!0,show_vulnerabilities:!1,show_stacks:!1,show_containers:!1,show_updates:!1,environment_mode:"standard"}}static async getConfigElement(){return await Promise.resolve().then(function(){return vn}),document.createElement("dockhand-overview-card-editor")}setConfig(e){this._config={show_environments:!0,show_vulnerabilities:!1,show_stacks:!1,show_containers:!1,show_updates:!1,environment_mode:"standard",...e}}set config(e){this.setConfig(e)}getCardSize(){if(!this._hass||!this._config)return 10;const e=l(this._hass).filter(e=>!this._config?.exclude_device_ids?.includes(e.deviceId)).length;let t=0;return this._config.show_environments&&(t+="full"===this._config.environment_mode?10:"detailed"===this._config.environment_mode?7:4),this._config.show_vulnerabilities&&(t+=3),this._config.show_stacks&&(t+=3),this._config.show_containers&&(t+=3),this._config.show_updates&&(t+=3),e>0?Math.max(4,t):4}getGridOptions(){return{columns:"full",rows:"auto",min_columns:6,min_rows:4}}render(){if(!this._config||!this._hass)return ce``;const e=l(this._hass).filter(e=>!this._config?.exclude_device_ids?.includes(e.deviceId)).sort((e,t)=>this._orderIndex(e.deviceId)-this._orderIndex(t.deviceId));return 0===e.length?ce`<div class="empty-note">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>No Dockhand environments found.</span>
      </div>`:this._config.show_environments||this._config.show_vulnerabilities||this._config.show_stacks||this._config.show_containers||this._config.show_updates?ce`
      <div class="overview">
        ${e.map(e=>this._renderColumn(e.deviceId,e.name))}
      </div>
    `:ce`<div class="empty-note">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>Every section is turned off — edit this card to enable at least one.</span>
      </div>`}_orderIndex(e){const t=At(this._config);if(!t)return 0;const n=t.indexOf(e);return-1===n?t.length:n}_orderedSections(){const e=this._config?.section_order;if(!e)return zt;const t=new Set(e),n=zt.filter(e=>!t.has(e));return[...e,...n]}_renderColumn(e,t){const n=Et(this._config)?.[e],i={type:"custom:dockhand-environment-card",device_id:e,mode:n?.environment?.mode??this._config?.environment_mode??"standard",...void 0!==n?.environment?.custom_sections?{custom_sections:n.environment.custom_sections}:void 0!==this._config?.environment_custom_sections?{custom_sections:this._config.environment_custom_sections}:{},...void 0!==n?.environment?.title?{title:n.environment.title}:{},...Ut("show_settings_link",n?.environment?.show_settings_link,this._config?.environment_show_settings_link)},s={type:"custom:dockhand-vulnerability-card",device_id:e,...void 0!==n?.vulnerabilities?.title?{title:n.vulnerabilities.title}:{},...Ut("show_settings_link",n?.vulnerabilities?.show_settings_link,this._config?.vulnerabilities_show_settings_link)},o={type:"custom:dockhand-stacks-card",device_id:e,...void 0!==n?.stacks?.title?{title:n.stacks.title}:{},...Ut("visible_badges",n?.stacks?.visible_badges,this._config?.stacks_visible_badges),...Ut("show_settings_link",n?.stacks?.show_settings_link,this._config?.stacks_show_settings_link)},a={type:"custom:dockhand-containers-card",device_id:e,...void 0!==n?.containers?.title?{title:n.containers.title}:{},...Ut("visible_badges",n?.containers?.visible_badges,this._config?.containers_visible_badges),...Ut("show_settings_link",n?.containers?.show_settings_link,this._config?.containers_show_settings_link)},r={type:"custom:dockhand-updates-card",scope:"environment",device_id:e,...void 0!==n?.updates?.title?{title:n.updates.title}:{}},c=n?.updates?.hide_when_no_updates,d={environments:()=>this._config?.show_environments?ce`<dockhand-environment-card .hass=${this._hass} .config=${i}></dockhand-environment-card>`:le,vulnerabilities:()=>this._config?.show_vulnerabilities?ce`<dockhand-vulnerability-card .hass=${this._hass} .config=${s}></dockhand-vulnerability-card>`:le,stacks:()=>this._config?.show_stacks?ce`<dockhand-stacks-card .hass=${this._hass} .config=${o}></dockhand-stacks-card>`:le,containers:()=>this._config?.show_containers?ce`<dockhand-containers-card .hass=${this._hass} .config=${a}></dockhand-containers-card>`:le,updates:()=>{if(!this._config?.show_updates)return le;return(c??this._config?.updates_hide_when_no_updates??!1)&&this._hass&&!function(e,t){const n=xt(e,t);if(!n)return!0;const i=e.states[n]?.attributes.pending_updates_total;return"number"!=typeof i||i>0}(this._hass,e)?le:ce`<dockhand-updates-card .hass=${this._hass} .config=${r}></dockhand-updates-card>`}};return ce`
      <div class="env-column">
        <div class="env-column-title">${t}</div>
        ${this._orderedSections().map(e=>d[e]())}
      </div>
    `}}Dt.styles=It,f([Ue()],Dt.prototype,"_config",void 0),f([Ue()],Dt.prototype,"_hass",void 0),customElements.define("dockhand-environment-card",st),customElements.define("dockhand-vulnerability-card",rt),customElements.define("dockhand-stack-card",ht),customElements.define("dockhand-container-card",pt),customElements.define("dockhand-stacks-card",ft),customElements.define("dockhand-containers-card",$t),customElements.define("dockhand-updates-card",St),customElements.define("dockhand-overview-card",Dt),window.customCards=window.customCards||[],window.customCards.push({type:"dockhand-environment-card",name:"Dockhand Environment Card",description:"Shows a Dockhand-managed Docker environment, modeled on Dockhand’s own dashboard tile.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(n,i){const s=n.entities?.[i];if(!s||s.platform!==e||!s.device_id)return;const o=n.devices?.[s.device_id];if(!o||!h(o))return;const a={config:{type:"custom:dockhand-environment-card",device_id:o.id,mode:"standard"},label:"Environment overview"};return s.translation_key===t.vulnerabilities?[{config:{type:"custom:dockhand-vulnerability-card",device_id:o.id},label:"Vulnerability summary"},a]:s.translation_key===t.stacks?[{config:{type:"custom:dockhand-stacks-card",device_id:o.id},label:"All stacks"},a]:s.translation_key===t.containers?[{config:{type:"custom:dockhand-containers-card",device_id:o.id},label:"All containers"},a]:a}}),window.customCards.push({type:"dockhand-vulnerability-card",name:"Dockhand Vulnerability Card",description:"Shows an environment's vulnerability scan summary by severity.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),window.customCards.push({type:"dockhand-stack-card",name:"Dockhand Stack Card",description:"Status, updates, and git sync details for one Dockhand Compose stack.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(t,n){const i=t.entities?.[n];if(!i||i.platform!==e||!i.device_id)return;const s=t.devices?.[i.device_id];if(!s||!function(t){return(t.identifiers??[]).some(([t,n])=>t===e&&/^stack_\d+_/.test(n))}(s))return;const o=[{config:{type:"custom:dockhand-stack-card",device_id:s.id},label:"This stack"}],a=g(s),r=null!==a?b(t,a):null;return r&&o.push({config:{type:"custom:dockhand-stacks-card",device_id:r},label:"All stacks in this environment"}),o}}),window.customCards.push({type:"dockhand-container-card",name:"Dockhand Container Card",description:"State, health, CPU/memory, and I/O for one Docker container.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(t,n){const i=t.entities?.[n];if(!i||i.platform!==e||!i.device_id)return;const s=t.devices?.[i.device_id];if(!s||!m(s))return;const o=[{config:{type:"custom:dockhand-container-card",device_id:s.id},label:"This container"}],a=v(s),r=null!==a?b(t,a):null;return r&&o.push({config:{type:"custom:dockhand-containers-card",device_id:r},label:"All containers in this environment"}),o}}),window.customCards.push({type:"dockhand-stacks-card",name:"Dockhand Stacks Card",description:"Every Compose stack in one environment, one compact row each.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),window.customCards.push({type:"dockhand-containers-card",name:"Dockhand Containers Card",description:"Every container in one environment, one compact row each.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),window.customCards.push({type:"dockhand-updates-card",name:"Dockhand Updates Card",description:"Every pending container update, for one environment or all of them, with a bulk-update action.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(t,n){const i=t.entities?.[n];if(!i||i.platform!==e||!n.startsWith("update.")||!i.device_id)return;const s=t.devices?.[i.device_id];if(!s||!m(s))return;const o=v(s),a=null!==o?b(t,o):null;return{config:{type:"custom:dockhand-updates-card",scope:a?"environment":"all",device_id:a??void 0},label:"Pending updates"}}}),window.customCards.push({type:"dockhand-overview-card",name:"Dockhand Overview",description:"One big dashboard: every environment, with stacks/containers/vulnerabilities alongside it — intended to fill a whole dashboard view.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),console.info("%c HA-DOCKHAND-CARDS %c v1.1.0 ","color: white; background: #0ea5e9; font-weight: 700;","color: #0ea5e9; background: white; font-weight: 700;");const jt=C`
  .row {
    margin-bottom: 12px;
  }
  .sub-row {
    margin-left: 20px;
    padding-left: 12px;
    border-left: 2px solid var(--divider-color);
  }
  /* Only affects ha-select/ha-input elements this component renders
   * directly in its own template (e.g. the environment-filter pickers in
   * Container/Stack card editors) — shadow DOM encapsulation means this
   * can't reach a select/input HA's own <ha-form> renders internally in
   * its own shadow root, which is expected, not a gap to fix. */
  ha-select,
  ha-input {
    display: block;
    width: 100%;
  }
  .hint {
    font-size: var(--ha-font-size-s, 0.85em);
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
`,Pt={compact:"mode_compact",standard:"mode_standard",detailed:"mode_detailed",full:"mode_full",custom:"mode_custom"},Ot={container_counts:"section_container_counts",metrics:"section_metrics",resources:"section_resources",events_summary:"section_events_summary",recent_events:"section_recent_events",top_containers:"section_top_containers",disk_usage:"section_disk_usage",history_chart:"section_history_chart"};class Tt extends Se{constructor(){super(...arguments),this.hideDevicePicker=!1,this.hideTitle=!1,this._computeLabel=e=>{switch(e.name){case"device_id":return Ge(this._hass,"environment");case"mode":return Ge(this._hass,"display_mode");case"title":return Ge(this._hass,"title_override");case"custom_sections":return Ge(this._hass,"custom_sections_label");case"show_settings_link":return Ge(this._hass,"show_settings_link");default:return e.name}},this._computeHelper=e=>{if("mode"!==e.name)return"";switch(this._config?.mode??"standard"){case"detailed":return Ge(this._hass,"mode_hint_detailed");case"full":return Ge(this._hass,"mode_hint_full");case"custom":return Ge(this._hass,"mode_hint_custom");default:return""}}}set hass(e){this._hass=e}setConfig(e){this._config=e}_schema(e,t){const n={};for(const e of Ze)n[e]=Ge(this._hass,Ot[e]);return[...this.hideDevicePicker?[]:[{name:"device_id",required:!0,selector:{select:{mode:"dropdown",options:e.map(e=>({value:e.deviceId,label:e.name}))}}}],{name:"mode",required:!0,default:"standard",selector:{select:{mode:"dropdown",options:Object.keys(Pt).map(e=>({value:e,label:Ge(this._hass,Pt[e])}))}}},..."custom"===t?[{name:"custom_sections",type:"multi_select",options:n}]:[],...this.hideTitle?[]:[{name:"title",selector:{text:{}}}],{name:"show_settings_link",default:!0,selector:{boolean:{}}}]}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass),t=this._config.mode??"standard";return this.hideDevicePicker||0!==e.length?ce`
      <ha-form
        .hass=${this._hass}
        .data=${{...this._config,custom_sections:this._config.custom_sections??Ye}}
        .schema=${this._schema(e,t)}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        .warning=${this._warning(t)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:ce`<div class="row">${Ge(this._hass,"no_environments_found")}</div>`}_valueChanged(e){const t={...e.detail.value};"custom"!==t.mode&&delete t.custom_sections,this._config=t,Pe(this,"config-changed",{config:this._config})}_warning(e){if(!this._hass||!this._config?.device_id)return{};const t=s[e]??s.standard,{unavailable:n}=Te(this._hass,this._config.device_id,t);if(0===n.length)return{};const i=n.map(e=>`${a[e.key]??e.key}${"not_found"===e.reason?" (requires a newer ha-dockhand release)":""}`).join(", ");return{mode:`This card would show more with these entities enabled: ${i}.`}}}Tt.styles=jt,f([Ue()],Tt.prototype,"_config",void 0),f([Ue()],Tt.prototype,"_hass",void 0),f([Ie({type:Boolean})],Tt.prototype,"hideDevicePicker",void 0),f([Ie({type:Boolean})],Tt.prototype,"hideTitle",void 0),customElements.define("dockhand-environment-card-editor",Tt);var Nt=Object.freeze({__proto__:null,DockhandEnvironmentCardEditor:Tt});class Lt extends Se{constructor(){super(...arguments),this.hideDevicePicker=!1,this.hideTitle=!1,this._computeLabel=e=>{switch(e.name){case"device_id":return Ge(this._hass,"environment");case"title":return Ge(this._hass,"title_override");case"show_settings_link":return Ge(this._hass,"show_settings_link");default:return e.name}}}set hass(e){this._hass=e}setConfig(e){this._config=e}_schema(e){return[...this.hideDevicePicker?[]:[{name:"device_id",required:!0,selector:{select:{mode:"dropdown",options:e.map(e=>({value:e.deviceId,label:e.name}))}}}],...this.hideTitle?[]:[{name:"title",selector:{text:{}}}],{name:"show_settings_link",default:!0,selector:{boolean:{}}}]}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return this.hideDevicePicker||0!==e.length?ce`
      <ha-form
        .hass=${this._hass}
        .data=${this._config}
        .schema=${this._schema(e)}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:ce`<div class="row">${Ge(this._hass,"no_environments_found")}</div>`}_valueChanged(e){Pe(this,"config-changed",{config:e.detail.value})}}Lt.styles=jt,f([Ue()],Lt.prototype,"_config",void 0),f([Ue()],Lt.prototype,"_hass",void 0),f([Ie({type:Boolean})],Lt.prototype,"hideDevicePicker",void 0),f([Ie({type:Boolean})],Lt.prototype,"hideTitle",void 0),customElements.define("dockhand-vulnerability-card-editor",Lt);var Mt=Object.freeze({__proto__:null,DockhandVulnerabilityCardEditor:Lt});class Rt extends Se{constructor(){super(...arguments),this._computeLabel=e=>{switch(e.name){case"environment_device_id":return Ge(this._hass,"environment");case"device_id":return Ge(this._hass,"stack");case"title":return Ge(this._hass,"title_override");case"show_settings_link":return Ge(this._hass,"show_settings_link");default:return e.name}}}set hass(e){this._hass=e}setConfig(e){this._config=e}_resolvedEnvDeviceId(){const e=this._config?.environment_device_id;if(e&&this._hass?.devices[e])return e;if(!this._config?.device_id||!this._hass)return;const t=this._hass.devices?.[this._config.device_id];if(!t)return;const n=g(t);return null!==n?Object.values(this._hass.devices).find(e=>_(e)===n)?.id:void 0}_schema(e,t){return[{name:"environment_device_id",required:!0,selector:{select:{mode:"dropdown",options:e.map(e=>({value:e.deviceId,label:e.name}))}}},{name:"device_id",required:!0,disabled:0===t.length,selector:{select:{mode:"dropdown",options:t}}},{name:"title",selector:{text:{}}},{name:"show_settings_link",default:!0,selector:{boolean:{}}}]}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);if(0===e.length)return ce`<div class="row">${Ge(this._hass,"no_environments_found")}</div>`;const t=this._resolvedEnvDeviceId(),n=t?_(this._hass.devices[t]):null,i=null!==n?p(this._hass,n):[],s=function(e,t){const n=t.map(t=>{const{found:n}=Le(e,t.id,["status"]),i=n.status?.state.attributes.name;return{value:t.id,label:i||t.name_by_user||t.name||t.id}});return n.sort((e,t)=>e.label.localeCompare(t.label))}(this._hass,i),o=null!==n&&0===s.length;return ce`
      <ha-form
        .hass=${this._hass}
        .data=${{...this._config,environment_device_id:t}}
        .schema=${this._schema(e,s)}
        .computeLabel=${this._computeLabel}
        .computeHelper=${e=>"device_id"===e.name&&o?Ge(this._hass,"no_stacks_found"):""}
        .warning=${this._warning()}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_warning(){if(!this._hass||!this._config?.device_id)return{};const e=["status","containersInStack","updatesAvailable"],{unavailable:t}=Le(this._hass,this._config.device_id,["status","containersInStack","updatesAvailable","gitSyncStatus","gitLastSync","gitSyncError"]),n=t.filter(t=>e.includes(t.key)||"disabled"===t.reason);if(0===n.length)return{};const i=n.map(e=>`${c[e.key]??e.key}${"not_found"===e.reason?" (requires a newer ha-dockhand release)":""}`).join(", ");return{device_id:`This card would show more with these entities enabled: ${i}.`}}_valueChanged(e){Pe(this,"config-changed",{config:e.detail.value})}}Rt.styles=jt,f([Ue()],Rt.prototype,"_config",void 0),f([Ue()],Rt.prototype,"_hass",void 0),customElements.define("dockhand-stack-card-editor",Rt);var Ht=Object.freeze({__proto__:null,DockhandStackCardEditor:Rt});class Kt extends Se{constructor(){super(...arguments),this._computeLabel=e=>{switch(e.name){case"environment_device_id":return Ge(this._hass,"environment");case"device_id":return Ge(this._hass,"container");case"title":return Ge(this._hass,"title_override");case"show_settings_link":return Ge(this._hass,"show_settings_link");default:return e.name}}}set hass(e){this._hass=e}setConfig(e){this._config=e}_resolvedEnvDeviceId(){const e=this._config?.environment_device_id;if(e&&this._hass?.devices[e])return e;if(!this._config?.device_id||!this._hass)return;const t=this._hass.devices?.[this._config.device_id];if(!t)return;const n=v(t);return null!==n?Object.values(this._hass.devices).find(e=>_(e)===n)?.id:void 0}_schema(e,t){return[{name:"environment_device_id",required:!0,selector:{select:{mode:"dropdown",options:e.map(e=>({value:e.deviceId,label:e.name}))}}},{name:"device_id",required:!0,disabled:0===t.length,selector:{select:{mode:"dropdown",options:t}}},{name:"title",selector:{text:{}}},{name:"show_settings_link",default:!0,selector:{boolean:{}}}]}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);if(0===e.length)return ce`<div class="row">${Ge(this._hass,"no_environments_found")}</div>`;const t=this._resolvedEnvDeviceId(),n=t?_(this._hass.devices[t]):null,i=null!==n?u(this._hass,n):[],s=function(e,t){const n=t.map(t=>{const{found:n}=Ne(e,t.id,["state"]),i=n.state?.state.attributes.name;return{value:t.id,label:i||t.name_by_user||t.name||t.id}});return n.sort((e,t)=>e.label.localeCompare(t.label))}(this._hass,i),o=null!==n&&0===i.length;return ce`
      <ha-form
        .hass=${this._hass}
        .data=${{...this._config,environment_device_id:t}}
        .schema=${this._schema(e,s)}
        .computeLabel=${this._computeLabel}
        .computeHelper=${e=>"device_id"===e.name&&o?Ge(this._hass,"no_containers_found"):""}
        .warning=${this._warning()}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_warning(){if(!this._hass||!this._config?.device_id)return{};const{unavailable:e}=Ne(this._hass,this._config.device_id,["cpuPercent","memoryUsage","memoryPercent","memoryLimit","networkRx","networkTx","blockRead","blockWrite"]),t=e.filter(e=>"disabled"===e.reason);if(0===t.length)return{};const n=t.map(e=>r[e.key]??e.key).join(", ");return{device_id:`This card would show more with these entities enabled: ${n}.`}}_valueChanged(e){Pe(this,"config-changed",{config:e.detail.value})}}Kt.styles=jt,f([Ue()],Kt.prototype,"_config",void 0),f([Ue()],Kt.prototype,"_hass",void 0),customElements.define("dockhand-container-card-editor",Kt);var Vt=Object.freeze({__proto__:null,DockhandContainerCardEditor:Kt});class Bt extends Se{constructor(){super(...arguments),this.hideDevicePicker=!1,this.hideTitle=!1,this._computeLabel=e=>{switch(e.name){case"device_id":return Ge(this._hass,"environment");case"title":return Ge(this._hass,"title_override");case"show_settings_link":return Ge(this._hass,"show_settings_link");case"visible_badges":return Ge(this._hass,"visible_badges_label");default:return e.name}}}set hass(e){this._hass=e}setConfig(e){this._config=e}_schema(e){return[...this.hideDevicePicker?[]:[{name:"device_id",required:!0,selector:{select:{mode:"dropdown",options:e.map(e=>({value:e.deviceId,label:e.name}))}}}],...this.hideTitle?[]:[{name:"title",selector:{text:{}}}],{name:"show_settings_link",default:!0,selector:{boolean:{}}},{name:"visible_badges",type:"multi_select",options:{container_count:Ge(this._hass,"badge_container_count"),updates:Ge(this._hass,"badge_updates"),type:Ge(this._hass,"badge_type")}}]}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return this.hideDevicePicker||0!==e.length?ce`
      <ha-form
        .hass=${this._hass}
        .data=${{...this._config,visible_badges:this._config.visible_badges??vt}}
        .schema=${this._schema(e)}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:ce`<div class="row">${Ge(this._hass,"no_environments_found")}</div>`}_valueChanged(e){Pe(this,"config-changed",{config:e.detail.value})}}Bt.styles=jt,f([Ue()],Bt.prototype,"_config",void 0),f([Ue()],Bt.prototype,"_hass",void 0),f([Ie({type:Boolean})],Bt.prototype,"hideDevicePicker",void 0),f([Ie({type:Boolean})],Bt.prototype,"hideTitle",void 0),customElements.define("dockhand-stacks-card-editor",Bt);var qt=Object.freeze({__proto__:null,DockhandStacksCardEditor:Bt});class Gt extends Se{constructor(){super(...arguments),this.hideDevicePicker=!1,this.hideTitle=!1,this._computeLabel=e=>{switch(e.name){case"device_id":return Ge(this._hass,"environment");case"title":return Ge(this._hass,"title_override");case"show_settings_link":return Ge(this._hass,"show_settings_link");case"visible_badges":return Ge(this._hass,"visible_badges_label");default:return e.name}}}set hass(e){this._hass=e}setConfig(e){this._config=e}_schema(e){return[...this.hideDevicePicker?[]:[{name:"device_id",required:!0,selector:{select:{mode:"dropdown",options:e.map(e=>({value:e.deviceId,label:e.name}))}}}],...this.hideTitle?[]:[{name:"title",selector:{text:{}}}],{name:"show_settings_link",default:!0,selector:{boolean:{}}},{name:"visible_badges",type:"multi_select",options:{health:Ge(this._hass,"badge_health"),updates:Ge(this._hass,"badge_updates"),cpu:Ge(this._hass,"badge_cpu"),memory:Ge(this._hass,"badge_memory")}}]}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return this.hideDevicePicker||0!==e.length?ce`
      <ha-form
        .hass=${this._hass}
        .data=${{...this._config,visible_badges:this._config.visible_badges??kt}}
        .schema=${this._schema(e)}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:ce`<div class="row">${Ge(this._hass,"no_environments_found")}</div>`}_valueChanged(e){Pe(this,"config-changed",{config:e.detail.value})}}Gt.styles=jt,f([Ue()],Gt.prototype,"_config",void 0),f([Ue()],Gt.prototype,"_hass",void 0),f([Ie({type:Boolean})],Gt.prototype,"hideDevicePicker",void 0),f([Ie({type:Boolean})],Gt.prototype,"hideTitle",void 0),customElements.define("dockhand-containers-card-editor",Gt);var Ft=Object.freeze({__proto__:null,DockhandContainersCardEditor:Gt});class Wt extends Se{constructor(){super(...arguments),this._computeLabel=e=>{switch(e.name){case"scope":return Ge(this._hass,"updates_scope_label");case"device_id":return Ge(this._hass,"environment");case"title":return Ge(this._hass,"title_override");case"hide_when_no_updates":return Ge(this._hass,"hide_when_no_updates_override");default:return e.name}}}set hass(e){this._hass=e}setConfig(e){this._config={...e,scope:e.scope??"all"}}_schema(e,t){return[{name:"scope",required:!0,selector:{select:{mode:"dropdown",options:[{value:"all",label:Ge(this._hass,"updates_scope_all")},{value:"environment",label:Ge(this._hass,"updates_scope_environment")}]}}},..."environment"===t?[{name:"device_id",selector:{select:{mode:"dropdown",options:e.map(e=>({value:e.deviceId,label:e.name}))}}}]:[],{name:"title",selector:{text:{}}},{name:"hide_when_no_updates",default:!1,selector:{boolean:{}}}]}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return ce`
      <ha-form
        .hass=${this._hass}
        .data=${this._config}
        .schema=${this._schema(e,this._config.scope??"all")}
        .computeLabel=${this._computeLabel}
        .computeHelper=${t=>this._computeHelper(t,e)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `}_computeHelper(e,t){return"device_id"===e.name&&0===t.length?Ge(this._hass,"no_environments_found"):"hide_when_no_updates"===e.name?Ge(this._hass,"hide_when_no_updates_helper"):""}_valueChanged(e){const t={...e.detail.value};if(t.hide_when_no_updates&&this._hass){const e="environment"===t.scope?t.device_id?[t.device_id]:[]:l(this._hass).map(e=>e.deviceId),n=function(e,t){const n=t.map(t=>xt(e,t)).filter(e=>Boolean(e)).map(e=>({condition:"numeric_state",entity:e,attribute:"pending_updates_total",above:0}));if(0!==n.length)return 1===n.length?n:[{condition:"or",conditions:n}]}(this._hass,e);n?t.visibility=n:delete t.visibility}else delete t.visibility;this._config=t,Pe(this,"config-changed",{config:this._config})}}f([Ue()],Wt.prototype,"_config",void 0),f([Ue()],Wt.prototype,"_hass",void 0),customElements.define("dockhand-updates-card-editor",Wt);var Xt=Object.freeze({__proto__:null,DockhandUpdatesCardEditor:Wt});
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zt={},Yt=2,Jt=e=>(...t)=>({_$litDirective$:e,values:t});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let Qt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const en=(e,t)=>{const n=e._$AN;if(void 0===n)return!1;for(const e of n)e._$AO?.(t,!1),en(e,t);return!0},tn=e=>{let t,n;do{if(void 0===(t=e._$AM))break;n=t._$AN,n.delete(e),e=t}while(0===n?.size)},nn=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(void 0===n)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),an(t)}};function sn(e){void 0!==this._$AN?(tn(this),this._$AM=e,nn(this)):this._$AM=e}function on(e,t=!1,n=0){const i=this._$AH,s=this._$AN;if(void 0!==s&&0!==s.size)if(t)if(Array.isArray(i))for(let e=n;e<i.length;e++)en(i[e],!1),tn(i[e]);else null!=i&&(en(i,!1),tn(i));else en(this,e)}const an=e=>{e.type==Yt&&(e._$AP??=on,e._$AQ??=sn)};class rn extends Qt{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),nn(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(en(this,e),tn(this))}setValue(e){if((e=>void 0===e.strings)(this._$Ct))this._$Ct._$AI(e,this);else{const t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}const cn=new WeakMap,dn=Jt(class extends rn{render(e){return le}update(e,[t]){const n=t!==this.G;return n&&this.rt(void 0),(n||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),le}rt(e){if(void 0!==this.G)if(this.isConnected||(e=void 0),"function"==typeof this.G){const t=this.ht??globalThis;let n=cn.get(t);void 0===n&&(n=new WeakMap,cn.set(t,n)),void 0!==n.get(this.G)&&this.G.call(this.ht,void 0),n.set(this.G,e),void 0!==e&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return"function"==typeof this.G?cn.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),ln=Jt(class extends Qt{constructor(){super(...arguments),this.key=le}render(e,t){return this.key=e,t}update(e,[t,n]){return t!==this.key&&(((e,t=Zt)=>{e._$AH=t})(e),this.key=t),n}}),hn={environments:"label_environments",vulnerabilities:"label_vulnerabilities",stacks:"label_stacks",containers:"label_containers",updates:"label_updates"},_n={environments:"detail_section_environment",vulnerabilities:"detail_section_vulnerabilities",stacks:"detail_section_stacks",containers:"detail_section_containers",updates:"detail_section_updates"},un={environments:"mdi:server",vulnerabilities:"mdi:shield-alert",stacks:"mdi:layers",containers:"mdi:docker",updates:"mdi:arrow-up-circle"},mn={environments:"show_environments",vulnerabilities:"show_vulnerabilities",stacks:"show_stacks",containers:"show_containers",updates:"show_updates"};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class pn extends Se{constructor(){super(...arguments),this._closeSectionSettings=e=>{e.stopPropagation(),this._editingSection=void 0},this._closeDetail=e=>{e.stopPropagation(),this._editingDeviceId=void 0}}set hass(e){this._hass=e}setConfig(e){this._config=function(e){if(void 0===e.environment_overrides&&void 0===e.environment_order)return e;const t={...e};return void 0!==t.environment_overrides&&(t.environments_overrides??=t.environment_overrides,delete t.environment_overrides),void 0!==t.environment_order&&(t.environments_order??=t.environment_order,delete t.environment_order),t}({show_environments:!0,show_vulnerabilities:!1,show_stacks:!1,show_containers:!1,show_updates:!1,environment_mode:"standard",...e})}_orderedDevices(){if(!this._hass)return[];const e=l(this._hass),t=At(this._config);return t?[...e].sort((e,n)=>{const i=t.indexOf(e.deviceId),s=t.indexOf(n.deviceId);return(-1===i?t.length:i)-(-1===s?t.length:s)}):e}_isSectionShown(e){switch(e){case"environments":return this._config?.show_environments??!0;case"vulnerabilities":return this._config?.show_vulnerabilities??!1;case"stacks":return this._config?.show_stacks??!1;case"containers":return this._config?.show_containers??!1;case"updates":return this._config?.show_updates??!1}}_orderedSections(){const e=this._config?.section_order;if(!e)return zt;const t=new Set(e),n=zt.filter(e=>!t.has(e));return[...e,...n]}render(){if(!this._hass||!this._config)return ce``;const e=this._orderedDevices();if(this._editingDeviceId){const t=e.find(e=>e.deviceId===this._editingDeviceId);if(t)return this._renderEnvironmentDetail(t.deviceId,t.name);this._editingDeviceId=void 0}return this._editingSection?this._renderSectionSettingsDetail(this._editingSection):this._renderList(e)}_renderList(e){if(!this._config)return ce``;const t=this._orderedSections();return ce`
      <ha-expansion-panel outlined expanded>
        <ha-icon slot="leading-icon" icon="mdi:format-list-bulleted"></ha-icon>
        <h3 slot="header">${Ge(this._hass,"section_order_heading")}</h3>
        <div class="content">
          <div class="hint">${Ge(this._hass,"section_order_hint")}</div>
          <ha-sortable handle-selector=".env-order-handle" @item-moved=${this._sectionMoved}>
            <div>${t.map(e=>this._renderSectionOrderRow(e))}</div>
          </ha-sortable>
        </div>
      </ha-expansion-panel>

      ${e.length>0?ce`
            <ha-expansion-panel outlined expanded>
              <ha-icon slot="leading-icon" icon="mdi:view-column"></ha-icon>
              <h3 slot="header">${Ge(this._hass,"environment_order_heading")}</h3>
              <div class="content">
                <div class="hint">${Ge(this._hass,"environment_order_hint")}</div>
                <ha-sortable handle-selector=".env-order-handle" @item-moved=${this._envMoved}>
                  <div>${e.map(e=>this._renderEnvOrderRow(e.deviceId,e.name))}</div>
                </ha-sortable>
              </div>
            </ha-expansion-panel>
          `:ce``}
    `}_renderSectionOrderRow(e){const t=this._isSectionShown(e),n="vulnerabilities"===e?Ge(this._hass,"vulnerabilities_hint"):"updates"===e?Ge(this._hass,"updates_hint"):void 0;return ce`
      <div class="env-order-row section-order-row ${t?"":"disabled"}" title=${n??""}>
        <ha-icon class="env-order-handle" icon="mdi:drag-horizontal-variant"></ha-icon>
        <span class="env-order-name">${Ge(this._hass,hn[e])}</span>
        <div class="row-actions">
          <ha-icon-button class="row-action-btn" label=${Ge(this._hass,"override_env_settings")} @click=${this._openSectionSettings(e)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            class="row-action-btn"
            label=${Ge(this._hass,t?"hide_this_environment":"show_this_environment")}
            @click=${this._sectionVisibilityToggled(e)}
          >
            <ha-icon icon=${t?"mdi:eye":"mdi:eye-off"}></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `}_renderSectionSettingsDetail(e){return ce`${ln(e,ce`
        <div class="detail-header">
          <ha-icon-button class="row-action-btn" label=${Ge(this._hass,"back")} @click=${this._closeSectionSettings}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </ha-icon-button>
          <div class="detail-title">
            <span class="detail-name">${Ge(this._hass,hn[e])}</span>
          </div>
        </div>

        ${"updates"===e?ce`
              <ha-form
                .hass=${this._hass}
                .data=${this._config}
                .schema=${[{name:"updates_hide_when_no_updates",default:!1,selector:{boolean:{}}}]}
                .computeLabel=${()=>Ge(this._hass,"hide_updates_global")}
                .computeHelper=${()=>Ge(this._hass,"hide_updates_global_hint")}
                @value-changed=${this._sectionSettingsChanged}
              ></ha-form>
            `:this._renderGlobalSectionEditor(e)}
      `)}`}_renderGlobalSectionEditor(e){switch(e){case"environments":return ce`<dockhand-environment-card-editor
          ${dn(this._mountGlobalEditor("environments"))}
          @config-changed=${this._globalSectionChanged("environments")}
        ></dockhand-environment-card-editor>`;case"vulnerabilities":return ce`<dockhand-vulnerability-card-editor
          ${dn(this._mountGlobalEditor("vulnerabilities"))}
          @config-changed=${this._globalSectionChanged("vulnerabilities")}
        ></dockhand-vulnerability-card-editor>`;case"stacks":return ce`<dockhand-stacks-card-editor
          ${dn(this._mountGlobalEditor("stacks"))}
          @config-changed=${this._globalSectionChanged("stacks")}
        ></dockhand-stacks-card-editor>`;case"containers":return ce`<dockhand-containers-card-editor
          ${dn(this._mountGlobalEditor("containers"))}
          @config-changed=${this._globalSectionChanged("containers")}
        ></dockhand-containers-card-editor>`}}_sectionSettingsChanged(e){this._config={...e.detail.value},Pe(this,"config-changed",{config:this._config})}_sectionVisibilityToggled(e){const t=mn[e];return n=>{n.stopPropagation(),this._updateConfig({[t]:!this._isSectionShown(e)})}}_openSectionSettings(e){return t=>{t.stopPropagation(),this._editingSection=e}}_renderEnvOrderRow(e,t){const n=this._config?.exclude_device_ids?.includes(e)??!1;return ce`
      <div class="env-order-row ${n?"hidden":""}">
        <ha-icon class="env-order-handle" icon="mdi:drag-horizontal-variant"></ha-icon>
        <span class="env-order-name">${t}</span>
        <div class="row-actions">
          <ha-icon-button class="row-action-btn" label=${Ge(this._hass,"override_env_settings")} @click=${this._openDetail(e)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            class="row-action-btn"
            label=${Ge(this._hass,n?"show_this_environment":"hide_this_environment")}
            @click=${this._envVisibilityToggled(e)}
          >
            <ha-icon icon=${n?"mdi:eye-off":"mdi:eye"}></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `}_renderEnvironmentDetail(e,t){return ce`${ln(e,ce`
        <div class="detail-header">
          <ha-icon-button class="row-action-btn" label=${Ge(this._hass,"back")} @click=${this._closeDetail}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </ha-icon-button>
          <div class="detail-title">
            <span class="detail-name">${t}</span>
            <span class="detail-badge">${Ge(this._hass,"overrides_from_default_badge")}</span>
          </div>
        </div>
        <div class="hint">${Ge(this._hass,"detail_view_hint")}</div>

        ${this._orderedSections().map(t=>this._renderDetailSection(t,e))}
      `)}`}_renderDetailSection(e,t){return ce`
      <ha-expansion-panel outlined expanded>
        <ha-icon slot="leading-icon" icon=${un[e]}></ha-icon>
        <h3 slot="header">${Ge(this._hass,_n[e])}</h3>
        <div class="content">${this._renderDetailSectionContent(e,t)}</div>
      </ha-expansion-panel>
    `}_renderDetailSectionContent(e,t){const n=Et(this._config);switch(e){case"environments":return ce`
          <dockhand-environment-card-editor
            ${dn(this._mountEditor(t,"custom:dockhand-environment-card",n?.[t]?.environment))}
            @config-changed=${this._overrideSectionChanged(t,"environment")}
          ></dockhand-environment-card-editor>
        `;case"vulnerabilities":return ce`
          <dockhand-vulnerability-card-editor
            ${dn(this._mountEditor(t,"custom:dockhand-vulnerability-card",n?.[t]?.vulnerabilities))}
            @config-changed=${this._overrideSectionChanged(t,"vulnerabilities")}
          ></dockhand-vulnerability-card-editor>
        `;case"stacks":return ce`
          <dockhand-stacks-card-editor
            ${dn(this._mountEditor(t,"custom:dockhand-stacks-card",n?.[t]?.stacks))}
            @config-changed=${this._overrideSectionChanged(t,"stacks")}
          ></dockhand-stacks-card-editor>
        `;case"containers":return ce`
          <dockhand-containers-card-editor
            ${dn(this._mountEditor(t,"custom:dockhand-containers-card",n?.[t]?.containers))}
            @config-changed=${this._overrideSectionChanged(t,"containers")}
          ></dockhand-containers-card-editor>
        `;case"updates":{const e=n?.[t]?.updates??{};return ce`
          <div class="row">
            <ha-input label=${Ge(this._hass,"title_override")} .value=${e.title??""} @input=${this._updatesOverrideTitleChanged(t)}></ha-input>
          </div>
          <div class="row">
            <ha-formfield label=${Ge(this._hass,"hide_when_no_updates_override")}>
              <ha-switch .checked=${e.hide_when_no_updates??!1} @change=${this._updatesOverrideHideChanged(t)}></ha-switch>
            </ha-formfield>
          </div>
        `}}}_mountEditor(e,t,n){return i=>{if(!i||!this._hass)return;const s=i;s.hass=this._hass,s.hideDevicePicker=!0,s.setConfig({type:t,device_id:e,...n??{}})}}_globalEditorConfig(e){const t=this._config??{},n=pn.GLOBAL_SECTION_PREFIX[e],i={type:pn.GLOBAL_SECTION_TYPE[e],device_id:""};for(const[e,s]of Object.entries(t))e.startsWith(`${n}_`)&&(i[e.slice(n.length+1)]=s);return"environments"===e&&(i.mode??="standard",i.custom_sections??=Ye),"stacks"===e&&(i.visible_badges??=vt),"containers"===e&&(i.visible_badges??=kt),i}_mountGlobalEditor(e){return t=>{if(!t||!this._hass)return;const n=t;n.hass=this._hass,n.hideDevicePicker=!0,n.hideTitle=!0,n.setConfig(this._globalEditorConfig(e))}}_globalSectionChanged(e){return t=>{t.stopPropagation();const n=pn.GLOBAL_SECTION_PREFIX[e],i={...this._config};for(const[e,s]of Object.entries(t.detail.config)){if("type"===e||"device_id"===e)continue;const t=`${n}_${e}`;void 0===s?delete i[t]:i[t]=s}this._config=i,Pe(this,"config-changed",{config:this._config})}}_updateSectionOverride(e,t,n){const i={...Et(this._config)??{}},s={...i[e]??{}},o=!n||Object.values(n).every(e=>void 0===e||""===e||Array.isArray(e)&&0===e.length);o?delete s[t]:s[t]=n,0===Object.keys(s).length?delete i[e]:i[e]=s,this._updateConfig({environments_overrides:Object.keys(i).length>0?i:void 0})}_overrideSectionChanged(e,t){return n=>{n.stopPropagation();const i=Object.fromEntries(Object.entries(n.detail.config).filter(([e])=>"type"!==e&&"device_id"!==e));this._updateSectionOverride(e,t,i)}}_updatesOverrideTitleChanged(e){return t=>{const n={...Et(this._config)?.[e]?.updates??{},title:t.target.value};this._updateSectionOverride(e,"updates",n)}}_updatesOverrideHideChanged(e){return t=>{const n={...Et(this._config)?.[e]?.updates??{},hide_when_no_updates:t.target.checked};this._updateSectionOverride(e,"updates",n)}}_envVisibilityToggled(e){return t=>{t.stopPropagation();const n=this._config?.exclude_device_ids??[],i=n.includes(e)?n.filter(t=>t!==e):[...n,e];this._updateConfig({exclude_device_ids:i.length>0?i:void 0})}}_openDetail(e){return t=>{t.stopPropagation(),this._editingDeviceId=e}}_envMoved(e){e.stopPropagation();const t=this._orderedDevices().map(e=>e.deviceId),[n]=t.splice(e.detail.oldIndex,1);t.splice(e.detail.newIndex,0,n),this._updateConfig({environments_order:t})}_sectionMoved(e){e.stopPropagation();const t=this._orderedSections(),[n]=t.splice(e.detail.oldIndex,1);t.splice(e.detail.newIndex,0,n),this._updateConfig({section_order:t})}_updateConfig(e){this._config&&(this._config={...this._config,...e},Pe(this,"config-changed",{config:this._config}))}}pn.styles=C`
    ${jt}
    /* font-size/font-weight here match HA's own tokens (confirmed against
     * HA frontend source: --ha-font-size-s is exactly what HA's own
     * hui-heading-badges-editor uses for its secondary/description text,
     * --ha-font-weight-medium is what ha-expansion-panel's own header
     * uses) rather than a hand-picked em ratio — the previous 0.9em h3
     * size didn't match HA's equivalent section headers (which don't
     * shrink at all, just go medium-weight), and hand-picked em values
     * don't track a user's HA accessibility text-size setting the way
     * these tokens do (that setting only propagates through the actual
     * --ha-font-size-* variables, not through a fixed-root em ratio).
     * Fallback values keep this safe if a token is ever missing. */
    h3 {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: var(--ha-font-weight-medium, 500);
      margin: 16px 0 8px;
      color: var(--primary-text-color);
    }
    h3 ha-icon {
      --mdc-icon-size: 16px;
    }
    ha-expansion-panel {
      margin: 16px 0;
    }
    ha-expansion-panel .content {
      padding: 4px 0 12px;
    }
    .env-order-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 4px;
      border-bottom: 1px solid var(--divider-color);
    }
    .env-order-row.hidden {
      opacity: 0.5;
    }
    .env-order-handle {
      cursor: grab;
      color: var(--secondary-text-color);
    }
    .env-order-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .section-order-row.disabled {
      opacity: 0.5;
    }
    /* Deliberately NOT sized down to match the live cards' compact
     * .settings-link pattern — this is config UI, not a card. HA's own
     * editors/dialogs use ha-icon-button at its native default size, and
     * this editor should read the same way, not inherit the cards'
     * density. Only color is customized (muted, matching the secondary
     * weight this action has relative to the row's primary content). */
    .row-action-btn {
      color: var(--secondary-text-color);
    }
    /* No gap between the two action buttons themselves — matches HA's
     * own edit/remove icon-button pair in hui-heading-badges-editor,
     * which has no gap between them either (each button's own internal
     * padding provides the breathing room). The gap that separates this
     * whole group from the name text comes from .env-order-row's own
     * gap, since this div is just one more flex child of that row. */
    .row-actions {
      display: flex;
      align-items: center;
    }
    .detail-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .detail-title {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }
    .detail-name {
      font-size: var(--ha-font-size-m, 1em);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .detail-badge {
      flex-shrink: 0;
      font-size: var(--ha-font-size-xs, 0.7em);
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgb(from var(--dockhand-accent-color, var(--primary-color)) r g b / 0.15);
      color: var(--dockhand-accent-color, var(--primary-color));
    }
  `,pn.GLOBAL_SECTION_PREFIX={environments:"environment",vulnerabilities:"vulnerabilities",stacks:"stacks",containers:"containers"},pn.GLOBAL_SECTION_TYPE={environments:"custom:dockhand-environment-card",vulnerabilities:"custom:dockhand-vulnerability-card",stacks:"custom:dockhand-stacks-card",containers:"custom:dockhand-containers-card"},f([Ue()],pn.prototype,"_config",void 0),f([Ue()],pn.prototype,"_hass",void 0),f([Ue()],pn.prototype,"_editingDeviceId",void 0),f([Ue()],pn.prototype,"_editingSection",void 0),customElements.define("dockhand-overview-card-editor",pn);var vn=Object.freeze({__proto__:null,DockhandOverviewCardEditor:pn});
