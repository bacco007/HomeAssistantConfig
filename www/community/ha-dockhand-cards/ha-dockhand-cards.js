const e="dockhand",t={online:"online",cpuUsage:"cpu_usage",memoryUsage:"memory_usage",containers:"containers",stacks:"stacks",imageCount:"image_count",volumeCount:"volume_count",networkCount:"network_count",activityEvents:"activity_events",activityLogging:"activity_logging",metricsCollection:"metrics_collection",vulnerabilityScanning:"vulnerability_scanning",updateChecks:"update_checks",autoUpdate:"auto_update",vulnerabilities:"vulnerabilities",connectionType:"connection_type",diskUsage:"disk_usage",envBulkUpdate:"env_bulk_update",checkUpdates:"check_updates"},n={state:"state",health:"health",cpuPercent:"container_cpu_percent",memoryUsage:"container_memory_usage",memoryPercent:"container_memory_percent",memoryLimit:"container_memory_limit",networkRx:"container_network_rx",networkTx:"container_network_tx",blockRead:"container_block_read",blockWrite:"container_block_write"},i={status:"status",containersInStack:"containers_in_stack",updatesAvailable:"stack_updates_available",gitSyncStatus:"git_stack_sync_status",gitLastSync:"git_stack_last_sync",gitSyncError:"git_stack_sync_error"},s={compact:["online","containers"],standard:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents"],detailed:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents"],full:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents","diskUsage"],custom:["online","cpuUsage","memoryUsage","containers","stacks","imageCount","volumeCount","networkCount","activityEvents","diskUsage"]},o=["updateChecks","autoUpdate","vulnerabilityScanning","activityLogging","metricsCollection","connectionType"],a={online:"Online status",cpuUsage:"CPU usage",memoryUsage:"Memory usage",containers:"Container counts",stacks:"Stack counts",imageCount:"Image count",volumeCount:"Volume count",networkCount:"Network count",activityEvents:"Activity events",diskUsage:"Disk usage"},r={cpuPercent:"CPU usage",memoryPercent:"Memory usage %",memoryUsage:"Memory usage",memoryLimit:"Memory limit",networkRx:"Network RX",networkTx:"Network TX",blockRead:"Block read",blockWrite:"Block write"},c={status:"Stack status",containersInStack:"Container count",updatesAvailable:"Pending-updates badge",gitSyncStatus:"Git sync status",gitLastSync:"Git last sync time",gitSyncError:"Git sync error banner"},d=/^env_\d+$/;function l(e){const t=Object.values(e.devices??{}),n=[];for(const e of t)h(e)&&n.push({deviceId:e.id,name:e.name_by_user||e.name||e.id});return n.sort((e,t)=>e.name.localeCompare(t.name))}function h(t){return(t.identifiers??[]).some(([t,n])=>t===e&&d.test(n))}function u(t){for(const[n,i]of t.identifiers??[]){if(n!==e)continue;if(d.exec(i))return Number(i.slice(4))}return null}function m(t,n){const i=`container_${n}_`;return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&n.startsWith(i)))}function p(t){return(t.identifiers??[]).some(([t,n])=>t===e&&/^container_\d+_/.test(n))}function _(t,n){const i=`stack_${n}_`;return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&n.startsWith(i)))}function v(t){for(const[n,i]of t.identifiers??[]){if(n!==e)continue;const t=/^container_(\d+)_/.exec(i);if(t)return Number(t[1])}return null}function g(t){for(const[n,i]of t.identifiers??[]){if(n!==e)continue;const t=/^stack_(\d+)_/.exec(i);if(t)return Number(t[1])}return null}function f(e,t){for(const n of Object.values(e.devices??{}))if(h(n)&&u(n)===t)return n.id;return null}function y(e,t,n,i){var s,o=arguments.length,a=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,n,i);else for(var r=e.length-1;r>=0;r--)(s=e[r])&&(a=(o<3?s(a):o>3?s(t,n,a):s(t,n))||a);return o>3&&a&&Object.defineProperty(t,n,a),a}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b=globalThis,k=b.ShadowRoot&&(void 0===b.ShadyCSS||b.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,w=Symbol(),$=new WeakMap;let x=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==w)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(k&&void 0===e){const n=void 0!==t&&1===t.length;n&&(e=$.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&$.set(t,e))}return e}toString(){return this.cssText}};const C=(e,...t)=>{const n=1===e.length?e[0]:t.reduce((t,n,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new x(n,e,w)},S=k?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new x("string"==typeof e?e:e+"",void 0,w))(t)})(e):e,{is:I,defineProperty:E,getOwnPropertyDescriptor:A,getOwnPropertyNames:U,getOwnPropertySymbols:P,getPrototypeOf:z}=Object,D=globalThis,j=D.trustedTypes,N=j?j.emptyScript:"",O=D.reactiveElementPolyfillSupport,T=(e,t)=>e,M={toAttribute(e,t){switch(t){case Boolean:e=e?N:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},R=(e,t)=>!I(e,t),H={attribute:!0,type:String,converter:M,reflect:!1,useDefault:!1,hasChanged:R};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),D.litPropertyMetadata??=new WeakMap;let L=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=H){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);void 0!==i&&E(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:s}=A(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const o=i?.call(this);s?.call(this,t),this.requestUpdate(e,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??H}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;const e=z(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){const e=this.properties,t=[...U(e),...P(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const n=this._$Eu(e,t);void 0!==n&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(S(e))}else void 0!==e&&t.push(S(e));return t}static _$Eu(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(k)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const n of t){const t=document.createElement("style"),i=b.litNonce;void 0!==i&&t.setAttribute("nonce",i),t.textContent=n.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(void 0!==i&&!0===n.reflect){const s=(void 0!==n.converter?.toAttribute?n.converter:M).toAttribute(t,n.type);this._$Em=e,null==s?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=n.getPropertyOptions(i),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:M;this._$Em=i;const o=s.fromAttribute(t,e.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,n,i=!1,s){if(void 0!==e){const o=this.constructor;if(!1===i&&(s=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??R)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:s},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==s||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e){const{wrapped:e}=n,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,n,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};L.elementStyles=[],L.shadowRootOptions={mode:"open"},L[T("elementProperties")]=new Map,L[T("finalized")]=new Map,O?.({ReactiveElement:L}),(D.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K=globalThis,B=e=>e,F=K.trustedTypes,V=F?F.createPolicy("lit-html",{createHTML:e=>e}):void 0,q="$lit$",G=`lit$${Math.random().toFixed(9).slice(2)}$`,W="?"+G,X=`<${W}>`,Z=document,J=()=>Z.createComment(""),Y=e=>null===e||"object"!=typeof e&&"function"!=typeof e,Q=Array.isArray,ee="[ \t\n\f\r]",te=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ne=/-->/g,ie=/>/g,se=RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),oe=/'/g,ae=/"/g,re=/^(?:script|style|textarea|title)$/i,ce=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),de=Symbol.for("lit-noChange"),le=Symbol.for("lit-nothing"),he=new WeakMap,ue=Z.createTreeWalker(Z,129);function me(e,t){if(!Q(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==V?V.createHTML(t):t}const pe=(e,t)=>{const n=e.length-1,i=[];let s,o=2===t?"<svg>":3===t?"<math>":"",a=te;for(let t=0;t<n;t++){const n=e[t];let r,c,d=-1,l=0;for(;l<n.length&&(a.lastIndex=l,c=a.exec(n),null!==c);)l=a.lastIndex,a===te?"!--"===c[1]?a=ne:void 0!==c[1]?a=ie:void 0!==c[2]?(re.test(c[2])&&(s=RegExp("</"+c[2],"g")),a=se):void 0!==c[3]&&(a=se):a===se?">"===c[0]?(a=s??te,d=-1):void 0===c[1]?d=-2:(d=a.lastIndex-c[2].length,r=c[1],a=void 0===c[3]?se:'"'===c[3]?ae:oe):a===ae||a===oe?a=se:a===ne||a===ie?a=te:(a=se,s=void 0);const h=a===se&&e[t+1].startsWith("/>")?" ":"";o+=a===te?n+X:d>=0?(i.push(r),n.slice(0,d)+q+n.slice(d)+G+h):n+G+(-2===d?t:h)}return[me(e,o+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class _e{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let s=0,o=0;const a=e.length-1,r=this.parts,[c,d]=pe(e,t);if(this.el=_e.createElement(c,n),ue.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=ue.nextNode())&&r.length<a;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(q)){const t=d[o++],n=i.getAttribute(e).split(G),a=/([.?@])?(.*)/.exec(t);r.push({type:1,index:s,name:a[2],strings:n,ctor:"."===a[1]?be:"?"===a[1]?ke:"@"===a[1]?we:ye}),i.removeAttribute(e)}else e.startsWith(G)&&(r.push({type:6,index:s}),i.removeAttribute(e));if(re.test(i.tagName)){const e=i.textContent.split(G),t=e.length-1;if(t>0){i.textContent=F?F.emptyScript:"";for(let n=0;n<t;n++)i.append(e[n],J()),ue.nextNode(),r.push({type:2,index:++s});i.append(e[t],J())}}}else if(8===i.nodeType)if(i.data===W)r.push({type:2,index:s});else{let e=-1;for(;-1!==(e=i.data.indexOf(G,e+1));)r.push({type:7,index:s}),e+=G.length-1}s++}}static createElement(e,t){const n=Z.createElement("template");return n.innerHTML=e,n}}function ve(e,t,n=e,i){if(t===de)return t;let s=void 0!==i?n._$Co?.[i]:n._$Cl;const o=Y(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),void 0===o?s=void 0:(s=new o(e),s._$AT(e,n,i)),void 0!==i?(n._$Co??=[])[i]=s:n._$Cl=s),void 0!==s&&(t=ve(e,s._$AS(e,t.values),s,i)),t}class ge{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??Z).importNode(t,!0);ue.currentNode=i;let s=ue.nextNode(),o=0,a=0,r=n[0];for(;void 0!==r;){if(o===r.index){let t;2===r.type?t=new fe(s,s.nextSibling,this,e):1===r.type?t=new r.ctor(s,r.name,r.strings,this,e):6===r.type&&(t=new $e(s,this,e)),this._$AV.push(t),r=n[++a]}o!==r?.index&&(s=ue.nextNode(),o++)}return ue.currentNode=Z,i}p(e){let t=0;for(const n of this._$AV)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class fe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=le,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ve(this,e,t),Y(e)?e===le||null==e||""===e?(this._$AH!==le&&this._$AR(),this._$AH=le):e!==this._$AH&&e!==de&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>Q(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==le&&Y(this._$AH)?this._$AA.nextSibling.data=e:this.T(Z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i="number"==typeof n?this._$AC(e):(void 0===n.el&&(n.el=_e.createElement(me(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new ge(i,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=he.get(e.strings);return void 0===t&&he.set(e.strings,t=new _e(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const s of e)i===t.length?t.push(n=new fe(this.O(J()),this.O(J()),this,this.options)):n=t[i],n._$AI(s),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=B(e).nextSibling;B(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ye{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,s){this.type=1,this._$AH=le,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=le}_$AI(e,t=this,n,i){const s=this.strings;let o=!1;if(void 0===s)e=ve(this,e,t,0),o=!Y(e)||e!==this._$AH&&e!==de,o&&(this._$AH=e);else{const i=e;let a,r;for(e=s[0],a=0;a<s.length-1;a++)r=ve(this,i[n+a],t,a),r===de&&(r=this._$AH[a]),o||=!Y(r)||r!==this._$AH[a],r===le?e=le:e!==le&&(e+=(r??"")+s[a+1]),this._$AH[a]=r}o&&!i&&this.j(e)}j(e){e===le?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class be extends ye{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===le?void 0:e}}class ke extends ye{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==le)}}class we extends ye{constructor(e,t,n,i,s){super(e,t,n,i,s),this.type=5}_$AI(e,t=this){if((e=ve(this,e,t,0)??le)===de)return;const n=this._$AH,i=e===le&&n!==le||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==le&&(n===le||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class $e{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){ve(this,e)}}const xe=K.litHtmlPolyfillSupport;xe?.(_e,fe),(K.litHtmlVersions??=[]).push("3.3.3");const Ce=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Se extends L{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,n)=>{const i=n?.renderBefore??t;let s=i._$litPart$;if(void 0===s){const e=n?.renderBefore??null;i._$litPart$=s=new fe(t.insertBefore(J(),e),e,void 0,n??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return de}}Se._$litElement$=!0,Se.finalized=!0,Ce.litElementHydrateSupport?.({LitElement:Se});const Ie=Ce.litElementPolyfillSupport;Ie?.({LitElement:Se}),(Ce.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ee={attribute:!0,type:String,converter:M,reflect:!1,hasChanged:R},Ae=(e=Ee,t,n)=>{const{kind:i,metadata:s}=n;let o=globalThis.litPropertyMetadata.get(s);if(void 0===o&&globalThis.litPropertyMetadata.set(s,o=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),o.set(n.name,e),"accessor"===i){const{name:i}=n;return{set(n){const s=t.get.call(this);t.set.call(this,n),this.requestUpdate(i,s,e,!0,n)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=n;return function(n){const s=this[i];t.call(this,n),this.requestUpdate(i,s,e,!0,n)}}throw Error("Unsupported decorator location: "+i)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ue(e){return function(e){return(t,n)=>"object"==typeof n?Ae(e,t,n):((e,t,n)=>{const i=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),i?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}({...e,state:!0,attribute:!1})}var Pe,ze;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(Pe||(Pe={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(ze||(ze={}));var De=function(e,t,n,i){i=i||{},n=null==n?{}:n;var s=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return s.detail=n,e.dispatchEvent(s),s};function je(t,n,i,s){const o=new Map(function(t,n){return Object.values(t.entities??{}).filter(t=>t.device_id===n&&t.platform===e)}(t,n).map(e=>[e.translation_key,e])),a={},r=[];for(const e of s){const n=i[e],s=o.get(n);if(!s){r.push({key:e,entityId:null,reason:"not_found"});continue}if(s.disabled_by){r.push({key:e,entityId:s.entity_id,reason:"disabled"});continue}const c=t.states[s.entity_id];c?a[e]={key:e,entityId:s.entity_id,state:c}:r.push({key:e,entityId:s.entity_id,reason:"not_found"})}return{found:a,unavailable:r}}function Ne(e,n,i){return je(e,n,t,i)}function Oe(e,t,i){return je(e,t,n,i)}function Te(e,t,n){return je(e,t,i,n)}function Me(t,n,i){const s=Object.values(t.entities??{}).find(t=>t.device_id===n&&t.platform===e&&t.entity_id.startsWith(`${i}.`)&&!t.disabled_by);if(!s)return null;const o=t.states[s.entity_id];return o?{entityId:s.entity_id,state:o}:null}function Re(e){if(null==e||Number.isNaN(e))return"—";if(0===e)return"0 B";const t=["B","KB","MB","GB","TB"],n=Math.min(Math.floor(Math.log(Math.abs(e))/Math.log(1024)),t.length-1);return`${(e/Math.pow(1024,n)).toFixed(0===n?0:1)} ${t[n]}`}function He(e){return e>=90?"error":e>=70?"warn":"ok"}function Le(e){if(!e)return null;try{return new URL(e).origin}catch{return null}}const Ke=["container_counts","metrics","resources","events_summary","recent_events","top_containers","history_chart","disk_usage"],Be=["container_counts","metrics","resources","events_summary"],Fe=C`
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
    align-items: flex-start;
    gap: 8px;
  }
  .core-message ha-icon {
    --mdc-icon-size: 18px;
    flex-shrink: 0;
    margin-top: 1px;
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
`,Ve=C`
  ${Fe}

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
`,qe={socket:{icon:"mdi:power-plug",color:"#22d3ee",title:"Unix socket connection"},direct:{icon:"mdi:docker",color:"#3b82f6",title:"Direct Docker connection"},"hawser-standard":{icon:"mdi:transit-connection-variant",color:"#a855f7",title:"Hawser agent (standard mode)"},"hawser-edge":{icon:"mdi:undo-variant",color:"#22c55e",title:"Hawser agent (edge mode)"}},Ge={create:"mdi:plus",start:"mdi:play",stop:"mdi:stop",die:"mdi:skull",kill:"mdi:flash",restart:"mdi:restart",pause:"mdi:pause",unpause:"mdi:play-circle",destroy:"mdi:delete",rename:"mdi:pencil",update:"mdi:pencil",oom:"mdi:alert",health_status:"mdi:heart-pulse"},We={create:"#34d399",start:"#34d399",unpause:"#34d399",stop:"#fb7185",die:"#fb7185",kill:"#fb7185",destroy:"#fb7185",oom:"#fb7185",restart:"#fbbf24",pause:"#fbbf24",update:"#fbbf24",rename:"#fbbf24",health_status:"#38bdf8"};function Xe(e){return e.startsWith("health_status")?"health_status":e}class Ze extends Se{constructor(){super(...arguments),this._cpuHistory=[],this._memHistory=[],this._hoverPoint=null,this._historyFetchedFor=null,this._historyEntityIds=[void 0,void 0],this._historyRefreshTimer=null}set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-environment-card",device_id:t[0]?.deviceId??"",mode:"standard"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Et}),document.createElement("dockhand-environment-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={mode:"standard",show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){switch(this._config?.mode){case"compact":return 2;case"detailed":return 7;case"full":return 10;default:return 4}}getGridOptions(){switch(this._config?.mode){case"compact":return{columns:12,rows:"auto",min_columns:6,min_rows:2};case"detailed":return{columns:12,rows:"auto",min_columns:6,min_rows:5};case"full":return{columns:12,rows:"auto",min_columns:8,min_rows:6};default:return{columns:12,rows:"auto",min_columns:6,min_rows:3}}}updated(){if(!this._hass||!this._config)return;if(!("full"===this._config.mode||"custom"===this._config.mode&&(this._config.custom_sections??Be).includes("history_chart")))return;const e=Ne(this._hass,this._config.device_id,["cpuUsage","memoryUsage"]),t=e.found.cpuUsage?.entityId,n=e.found.memoryUsage?.entityId;if(!t&&!n)return;this._historyEntityIds=[t,n];const i=`${t??""}|${n??""}`;this._historyFetchedFor!==i&&(this._historyFetchedFor=i,this._fetchHistory(t,n),this._historyRefreshTimer||(this._historyRefreshTimer=window.setInterval(()=>{const[e,t]=this._historyEntityIds;(e||t)&&this._fetchHistory(e,t)},6e4)))}disconnectedCallback(){super.disconnectedCallback(),this._historyRefreshTimer&&(window.clearInterval(this._historyRefreshTimer),this._historyRefreshTimer=null)}async _fetchHistory(e,t){if(!this._hass)return;const n=[e,t].filter(e=>Boolean(e));if(0!==n.length)try{const t=new Date(Date.now()-9e5).toISOString(),i=await this._hass.callApi("GET",`history/period/${t}?filter_entity_id=${n.join(",")}&minimal_response&no_attributes`),s=e=>(e??[]).map(e=>({value:Number(e.state),timestampMs:e.last_changed?new Date(e.last_changed).getTime():NaN})).filter(e=>Number.isFinite(e.value)&&Number.isFinite(e.timestampMs));2===n.length?(this._cpuHistory=s(i[0]),this._memHistory=s(i[1])):e?(this._cpuHistory=s(i[0]),this._memHistory=[]):(this._memHistory=s(i[0]),this._cpuHistory=[])}catch{}}_sparkline(e,t,n){if(t.length<2)return le;const i=280,s=36,o=i/(t.length-1),a=t.map((e,t)=>[t*o,s-Math.min(e.value,100)/100*s]),r=a.map(([e,t])=>`${e.toFixed(1)},${t.toFixed(1)}`).join(" "),c=`0,36 ${r} 280,36`,d=this._hoverPoint?.chart===e?this._hoverPoint.xFraction*i:null;return ce`
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
    `}_moreInfo(e){e&&De(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=this._config.mode??"standard",n=[...new Set([...s[t]??s.standard,...o])],i=Ne(this._hass,this._config.device_id,n).found,a=this._config.title||e.name_by_user||e.name||"Environment",r="on"===i.online?.state.state,c=!i.online,d=Array.isArray(i.online?.state.attributes.labels)?i.online.state.attributes.labels:[];return ce`
      <ha-card>
        ${this._renderHeader(a,e,r,i)}
        ${d.length>0?ce`<div class="label-row">${d.map(e=>ce`<span class="label-pill">${e}</span>`)}</div>`:le}
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
    `}_renderHeader(e,t,n,i){const s=i.connectionType,o=!s&&t.hw_version?qe[t.hw_version]:void 0,a=i.online?.entityId;return ce`
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
          ${s?ce`<span
                class="conn-icon clickable"
                style="color:${qe[s.state.state]?.color??"inherit"}"
                tabindex="0"
                role="button"
                title=${s.state.attributes.friendly_name??""}
                @click=${()=>this._moreInfo(s.entityId)}
                @keydown=${this._onKeydown(s.entityId)}
              >
                <ha-state-icon .hass=${this._hass} .stateObj=${s.state}></ha-state-icon>
              </span>`:o?ce`<ha-icon class="conn-icon" icon=${o.icon} style="color:${o.color}" title=${o.title}></ha-icon>`:le}
          <div class="name-block">
            <div
              class="name-row ${a?"clickable":""}"
              tabindex=${a?0:-1}
              role=${a?"button":le}
              @click=${()=>this._moreInfo(a)}
              @keydown=${this._onKeydown(a)}
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
          ${this._config?.show_settings_link&&t.configuration_url?ce`<span class="settings-link" title="Open in Dockhand" @click=${()=>this._openDockhand(t.configuration_url)}>
                <ha-icon icon="mdi:cog"></ha-icon>
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
    `}_renderDetailedExtras(e,t){const n=this._hass?u(this._hass.devices[e.id]):null,i=this._resolveTopContainers(t,n),s=this._config?Ne(this._hass,this._config.device_id,["activityEvents"]).found.activityEvents:void 0,o=Array.isArray(s?.state.attributes.recent_events)?s.state.attributes.recent_events:[];return ce`${this._renderRecentEvents(o,s?.entityId)}${this._renderTopContainers(i)}`}_renderCustomBody(e,t){const n=new Set(this._config?.custom_sections??Be);if(0===n.size)return ce`<div class="core-message">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>No sections selected — edit this card to choose what to show.</span>
      </div>`;const i=this._hass?u(this._hass.devices[e.id]):null,s=n.has("recent_events"),o=n.has("top_containers");let a,r=[];if(s){const e=this._config?Ne(this._hass,this._config.device_id,["activityEvents"]).found.activityEvents:void 0;r=Array.isArray(e?.state.attributes.recent_events)?e.state.attributes.recent_events:[],a=e?.entityId}const c=o?this._resolveTopContainers(t,i):[],d={container_counts:()=>this._renderContainerSection(t),metrics:()=>this._renderMetricsSection(t),resources:()=>this._renderResourceGrid(t),events_summary:()=>this._renderEventsRow(t),recent_events:()=>this._renderRecentEvents(r,a),top_containers:()=>this._renderTopContainers(c),disk_usage:()=>this._renderDiskUsage(t),history_chart:()=>this._renderHistoryCharts(t)};return ce`${Ke.filter(e=>n.has(e)).map(e=>d[e]())}`}_resolveTopContainers(e,t){const n=e.cpuUsage?.state.attributes.top_containers;return Array.isArray(n)&&n.length>0?n.map(e=>({deviceId:"",name:e.name??"—",cpuPercent:"number"==typeof e.cpu_percent?e.cpu_percent:null,cpuEntityId:null,memoryPercent:"number"==typeof e.memory_percent?e.memory_percent:null,memoryEntityId:null})):null!==t&&this._hass?function(e,t,n=5){const i=m(e,t),s=[];for(const t of i){const{found:n}=Oe(e,t.id,["cpuPercent","memoryPercent"]);if(!n.cpuPercent&&!n.memoryPercent)continue;const i=n.cpuPercent?Number(n.cpuPercent.state.state):null,o=n.memoryPercent?Number(n.memoryPercent.state.state):null;s.push({deviceId:t.id,name:t.name_by_user||t.name||t.id,cpuPercent:Number.isFinite(i)?i:null,cpuEntityId:n.cpuPercent?.entityId??null,memoryPercent:Number.isFinite(o)?o:null,memoryEntityId:n.memoryPercent?.entityId??null})}return s.sort((e,t)=>(t.cpuPercent??-1)-(e.cpuPercent??-1)),s.slice(0,n)}(this._hass,t,5):[]}_renderTopContainers(e){return 0===e.length?le:ce`
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
                  icon=${e.action&&Ge[Xe(e.action)]||"mdi:pulse"}
                  style="color:${e.action&&We[Xe(e.action)]||"#94a3b8"}"
                  title=${e.action??""}
                ></ha-icon>
                <span class="event-text"><strong>${e.container_name??"unknown"}</strong></span>
                ${e.timestamp?ce`<ha-relative-time .hass=${this._hass} .datetime=${new Date(e.timestamp)}></ha-relative-time>`:le}
              </div>
            `)}
        </div>
      </div>
    `}_openDockhand(e){window.open(e,"_blank","noopener,noreferrer")}}Ze.styles=Ve,y([Ue()],Ze.prototype,"_config",void 0),y([Ue()],Ze.prototype,"_hass",void 0),y([Ue()],Ze.prototype,"_cpuHistory",void 0),y([Ue()],Ze.prototype,"_memHistory",void 0),y([Ue()],Ze.prototype,"_hoverPoint",void 0);const Je=C`
  ${Fe}

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
`,Ye=[{key:"critical",label:"Critical"},{key:"high",label:"High"},{key:"medium",label:"Medium"},{key:"low",label:"Low"}];class Qe extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-vulnerability-card",device_id:t[0]?.deviceId??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return Ut}),document.createElement("dockhand-vulnerability-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&De(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=Ne(this._hass,this._config.device_id,["online","vulnerabilities"]),n=t.found,i=this._config.title||e.name_by_user||e.name||"Environment",s="on"===n.online?.state.state;return ce`
      <ha-card>
        ${this._renderHeader(i,e,s,n)}
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
          ${this._config?.show_settings_link?(()=>{const e=Le(t.configuration_url);return e?ce`<span
                      class="settings-link"
                      title="View vulnerabilities in Dockhand"
                      @click=${()=>window.open(`${e}/images?tab=vulnerabilities`,"_blank","noopener,noreferrer")}
                    >
                      <ha-icon icon="mdi:open-in-new"></ha-icon>
                    </span>`:le})():le}
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
                ${Ye.map(e=>ce`
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
    `}}Qe.styles=Je,y([Ue()],Qe.prototype,"_config",void 0),y([Ue()],Qe.prototype,"_hass",void 0);const et=C`
  ${Fe}

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
    font-size: 1.3em;
    font-weight: 600;
    text-transform: capitalize;
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
`,tt={running:"mdi:play-circle",partial:"mdi:alert-circle",stopped:"mdi:stop-circle",created:"mdi:circle-outline"},nt={synced:"mdi:check-circle",syncing:"mdi:sync",pending:"mdi:clock-outline",error:"mdi:alert-circle"};class it extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(t){const n=function(t){return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&/^stack_\d+_/.test(n)))}(t);return{type:"custom:dockhand-stack-card",device_id:n[0]?.id??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return zt}),document.createElement("dockhand-stack-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand stack.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&De(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Stack device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=Te(this._hass,this._config.device_id,["status","containersInStack","updatesAvailable","gitSyncStatus","gitLastSync","gitSyncError"]).found,n=this._config.title||e.name_by_user||e.name||"Stack",i=Boolean(t.gitSyncStatus);return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:layers"></ha-icon>
            </div>
            <div class="name-block">
              <span class="name">${n}</span>
            </div>
          </div>
          <span class="type-pill">${e.model??"Stack"}</span>
          ${this._config?.show_settings_link&&e.configuration_url?ce`<span class="settings-link" title="Open in Dockhand" @click=${()=>window.open(e.configuration_url,"_blank","noopener,noreferrer")}>
                <ha-icon icon="mdi:open-in-new"></ha-icon>
              </span>`:le}
        </div>
        <div class="body">${this._renderBody(t,i)}</div>
      </ha-card>
    `}_renderBody(e,t){if(!e.status)return ce`<div class="unavailable-hint core-message">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>This stack's status sensor isn't available yet.</span>
      </div>`;const n=e.status.state.state,i=e.status.state.attributes.container_count??e.containersInStack?.state.state,s="on"===e.updatesAvailable?.state.state,o=e.updatesAvailable?.state.attributes.update_count;return ce`
      <div
        class="status-row clickable"
        tabindex="0"
        role="button"
        @click=${()=>this._moreInfo(e.status.entityId)}
        @keydown=${this._onKeydown(e.status.entityId)}
      >
        <span class="status-word ${n}"><ha-icon icon=${tt[n]??"mdi:help-circle"}></ha-icon> ${n}</span>
        ${void 0!==i?ce`<span class="container-count">${i} containers</span>`:le}
      </div>

      ${s?ce`
            <div
              class="updates-badge clickable"
              tabindex="0"
              role="button"
              @click=${()=>this._moreInfo(e.updatesAvailable?.entityId)}
              @keydown=${this._onKeydown(e.updatesAvailable?.entityId)}
            >
              <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
              ${o??"Updates"} update${1===o?"":"s"} available
            </div>
          `:le}
      ${t?this._renderGitSection(e):le}
    `}_renderGitSection(e){const t=e.gitSyncStatus.state.state,n="on"===e.gitSyncError?.state.state,i=e.gitSyncStatus?.state.attributes.sync_error,s=e.gitSyncStatus?.state.attributes.last_commit;return ce`
      <div class="section git-section">
        <div class="section-title"><ha-icon icon="mdi:source-branch"></ha-icon> Git sync</div>
        <div
          class="git-row clickable"
          tabindex="0"
          role="button"
          @click=${()=>this._moreInfo(e.gitSyncStatus?.entityId)}
          @keydown=${this._onKeydown(e.gitSyncStatus?.entityId)}
        >
          <span class="label"><ha-icon icon=${nt[t]??"mdi:source-branch"}></ha-icon> Status</span>
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
    `}}it.styles=et,y([Ue()],it.prototype,"_config",void 0),y([Ue()],it.prototype,"_hass",void 0);const st=C`
  ${Fe}

  .state-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .state-word {
    font-size: 1.1em;
    font-weight: 600;
    text-transform: capitalize;
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
`,ot={running:"mdi:play-circle",paused:"mdi:pause-circle",restarting:"mdi:refresh-circle",exited:"mdi:stop-circle",dead:"mdi:close-circle",created:"mdi:circle-outline"},at={healthy:"mdi:heart",unhealthy:"mdi:heart-broken",starting:"mdi:heart-outline"};class rt extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(t){const n=function(t){return Object.values(t.devices??{}).filter(t=>(t.identifiers??[]).some(([t,n])=>t===e&&/^container_\d+_/.test(n)))}(t);return{type:"custom:dockhand-container-card",device_id:n[0]?.id??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return jt}),document.createElement("dockhand-container-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand container.");this._config={show_settings_link:!0,...e}}set config(e){this.setConfig(e)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&De(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Container device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=Oe(this._hass,this._config.device_id,["state","health","cpuPercent","memoryUsage","memoryPercent","memoryLimit","networkRx","networkTx","blockRead","blockWrite"]).found,n=this._config.title||e.name_by_user||e.name||"Container";return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:docker"></ha-icon>
            </div>
            <div class="name-block">
              <span class="name">${n}</span>
            </div>
          </div>
          ${this._config?.show_settings_link&&e.configuration_url?ce`<span class="settings-link" title="Open in Dockhand" @click=${()=>window.open(e.configuration_url,"_blank","noopener,noreferrer")}>
                <ha-icon icon="mdi:open-in-new"></ha-icon>
              </span>`:le}
        </div>
        <div class="body">${this._renderBody(t)}</div>
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
        <span class="state-word ${t}"><ha-icon icon=${ot[t]??"mdi:help-circle"}></ha-icon> ${t}</span>
        ${n?ce`
              <span
                class="health-chip ${n} clickable"
                tabindex="0"
                role="button"
                @click=${t=>{t.stopPropagation(),this._moreInfo(e.health?.entityId)}}
                @keydown=${this._onKeydown(e.health?.entityId)}
              >
                <ha-icon icon=${at[n]??"mdi:heart-outline"}></ha-icon> ${n}
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
    `}}rt.styles=st,y([Ue()],rt.prototype,"_config",void 0),y([Ue()],rt.prototype,"_hass",void 0);const ct=C`
  ${Fe}

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
`,dt={running:{icon:"mdi:play-circle",cls:"ok"},partial:{icon:"mdi:alert-circle",cls:"warn"},stopped:{icon:"mdi:stop-circle",cls:"error"},created:{icon:"mdi:circle-outline",cls:"neutral"}};class lt extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-stacks-card",device_id:t[0]?.deviceId??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return Ot}),document.createElement("dockhand-stacks-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={...e}}set config(e){this.setConfig(e)}getCardSize(){if(!this._hass||!this._config)return 3;const e=u(this._hass.devices[this._config.device_id]),t=null!==e?_(this._hass,e).length:0;return Math.max(2,Math.ceil(t/2)+1)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&De(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=u(e),n=null!==t?_(this._hass,t):[],i=this._config.title||e.name_by_user||e.name||"Environment",s=Le(e.configuration_url),o=n.map(e=>{const{found:t}=Te(this._hass,e.id,["status","containersInStack","updatesAvailable"]);if(!t.status)return null;const n=t.status.state.attributes;return{name:n.name||e.name_by_user||e.name||e.id,type:n.type||e.model||"Stack",found:t}}).filter(e=>null!==e).sort((e,t)=>e.name.localeCompare(t.name));return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:layers"></ha-icon>
            </div>
            <div class="name-block"><span class="name">${i} — Stacks</span></div>
          </div>
          ${s?ce`<span class="settings-link" title="View stacks in Dockhand" @click=${()=>window.open(`${s}/stacks`,"_blank","noopener,noreferrer")}>
                <ha-icon icon="mdi:open-in-new"></ha-icon>
              </span>`:le}
        </div>
        <div class="body">
          ${0===o.length?ce`<div class="empty-note">No stacks found for this environment yet.</div>`:ce`<div class="row-list">${o.map(e=>this._renderRow(e))}</div>`}
        </div>
      </ha-card>
    `}_renderRow(e){const t=e.found,n=t.status.state.state,i=dt[n]??{icon:"mdi:help-circle",cls:"neutral"},s=t.containersInStack?.state.state??t.status.state.attributes.container_count,o=t.containersInStack?.entityId,a="on"===t.updatesAvailable?.state.state,r=t.updatesAvailable?.state.attributes.update_count,c=t.updatesAvailable?.entityId,d=t.status.entityId;return ce`
      <div class="item-row clickable" tabindex="0" role="button" @click=${()=>this._moreInfo(d)} @keydown=${this._onKeydown(d)}>
        <ha-icon class="item-status-icon ${i.cls}" icon=${i.icon}></ha-icon>
        <span class="name-and-type">
          <span class="item-name">${e.name}</span>
          <span class="item-type-pill">${e.type}</span>
        </span>
        ${void 0!==s?ce`<span
              class="item-badge ${o?"clickable":""}"
              tabindex=${o?0:-1}
              role=${o?"button":le}
              @click=${e=>{o&&(e.stopPropagation(),this._moreInfo(o))}}
              @keydown=${this._onKeydown(o)}
              ><ha-icon icon="mdi:docker"></ha-icon>${s}</span
            >`:le}
        ${a?ce`<span
              class="item-badge updates clickable"
              tabindex="0"
              role="button"
              @click=${e=>{e.stopPropagation(),this._moreInfo(c)}}
              @keydown=${this._onKeydown(c)}
              ><ha-icon icon="mdi:arrow-up-circle"></ha-icon>${r??""}</span
            >`:le}
      </div>
    `}}lt.styles=ct,y([Ue()],lt.prototype,"_config",void 0),y([Ue()],lt.prototype,"_hass",void 0);const ht=C`
  ${Fe}

  .item-status-icon.info {
    color: var(--dockhand-status-info-color);
  }
  .item-badge.unhealthy {
    color: var(--dockhand-status-error-color);
  }
  .item-badge.healthy {
    color: var(--dockhand-status-ok-color);
  }
`,ut={running:{icon:"mdi:play-circle",cls:"ok"},paused:{icon:"mdi:pause-circle",cls:"warn"},restarting:{icon:"mdi:refresh-circle",cls:"error"},exited:{icon:"mdi:stop-circle",cls:"error"},created:{icon:"mdi:plus-circle-outline",cls:"info"},dead:{icon:"mdi:close-circle",cls:"neutral"}};class mt extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(e){const t=l(e);return{type:"custom:dockhand-containers-card",device_id:t[0]?.deviceId??""}}static async getConfigElement(){return await Promise.resolve().then(function(){return Mt}),document.createElement("dockhand-containers-card-editor")}setConfig(e){if(!e.device_id)throw new Error("Please select a Dockhand environment.");this._config={...e}}set config(e){this.setConfig(e)}getCardSize(){if(!this._hass||!this._config)return 3;const e=u(this._hass.devices[this._config.device_id]),t=null!==e?m(this._hass,e).length:0;return Math.max(2,Math.ceil(t/2)+1)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&De(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}render(){if(!this._config||!this._hass)return ce``;const e=this._hass.devices?.[this._config.device_id];if(!e)return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const t=u(e),n=null!==t?m(this._hass,t):[],i=this._config.title||e.name_by_user||e.name||"Environment",s=Le(e.configuration_url),o=n.map(e=>{const{found:t}=Oe(this._hass,e.id,["state","health","cpuPercent","memoryPercent"]);if(!t.state)return null;const n=Me(this._hass,e.id,"update");return{name:t.state.state.attributes.name||e.name_by_user||e.name||e.id,found:t,updateEntityId:"on"===n?.state.state?n.entityId:null}}).filter(e=>null!==e).sort((e,t)=>e.name.localeCompare(t.name));return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:docker"></ha-icon>
            </div>
            <div class="name-block"><span class="name">${i} — Containers</span></div>
          </div>
          ${s?ce`<span class="settings-link" title="View containers in Dockhand" @click=${()=>window.open(`${s}/containers`,"_blank","noopener,noreferrer")}>
                <ha-icon icon="mdi:open-in-new"></ha-icon>
              </span>`:le}
        </div>
        <div class="body">
          ${0===o.length?ce`<div class="empty-note">No containers found for this environment yet.</div>`:ce`<div class="row-list">${o.map(e=>this._renderRow(e))}</div>`}
        </div>
      </ha-card>
    `}_renderRow(e){const t=e.found,n=t.state.state.state,i=ut[n]??{icon:"mdi:help-circle",cls:"neutral"},s=t.health?.state.state,o=t.health?.entityId,a=t.cpuPercent?Number(t.cpuPercent.state.state):void 0,r=t.cpuPercent?.entityId,c=t.memoryPercent?Number(t.memoryPercent.state.state):void 0,d=t.memoryPercent?.entityId,l=t.state.entityId;return ce`
      <div class="item-row clickable" tabindex="0" role="button" @click=${()=>this._moreInfo(l)} @keydown=${this._onKeydown(l)}>
        <ha-icon class="item-status-icon ${i.cls}" icon=${i.icon}></ha-icon>
        <span class="item-name">${e.name}</span>
        ${"healthy"===s||"unhealthy"===s||"starting"===s?ce`<span
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
            </span>`:le}
        ${e.updateEntityId?ce`<span
              class="item-badge updates clickable"
              tabindex="0"
              role="button"
              title="Update available"
              @click=${t=>{t.stopPropagation(),this._moreInfo(e.updateEntityId)}}
              @keydown=${this._onKeydown(e.updateEntityId)}
            >
              <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
            </span>`:le}
        ${void 0!==a?ce`<span
              class="item-badge clickable"
              tabindex="0"
              role="button"
              @click=${e=>{e.stopPropagation(),this._moreInfo(r)}}
              @keydown=${this._onKeydown(r)}
              ><ha-icon icon="mdi:chip"></ha-icon>${a.toFixed(0)}%</span
            >`:le}
        ${void 0!==c?ce`<span
              class="item-badge clickable"
              tabindex="0"
              role="button"
              @click=${e=>{e.stopPropagation(),this._moreInfo(d)}}
              @keydown=${this._onKeydown(d)}
              ><ha-icon icon="mdi:memory"></ha-icon>${c.toFixed(0)}%</span
            >`:le}
      </div>
    `}}mt.styles=ht,y([Ue()],mt.prototype,"_config",void 0),y([Ue()],mt.prototype,"_hass",void 0);const pt=C`
  ${Fe}

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
`;class _t extends Se{constructor(){super(...arguments),this._triggering=!1,this._checking=!1}set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(){return{type:"custom:dockhand-updates-card",scope:"all"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Ht}),document.createElement("dockhand-updates-card-editor")}setConfig(e){if("environment"===e.scope&&!e.device_id)throw new Error('Please select a Dockhand environment, or switch scope to "All environments".');this._config={...e,scope:e.scope??"all"}}set config(e){this.setConfig(e)}getCardSize(){return 4}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}_moreInfo(e){e&&De(this,"hass-more-info",{entityId:e})}_onKeydown(e){return t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._moreInfo(e))}}_buildGroups(){if(!this._hass||!this._config)return{groups:[],checkUpdatesEntityIds:[]};let e;if("environment"===this._config.scope&&this._config.device_id){const t=this._hass.devices[this._config.device_id];if(!t)return{groups:[],checkUpdatesEntityIds:[]};e=[{deviceId:this._config.device_id,name:t.name_by_user||t.name||"Environment"}]}else e=l(this._hass);const t=[],n=[];for(const i of e){const e=u(this._hass.devices[i.deviceId]);if(null===e)continue;const{found:s}=Ne(this._hass,i.deviceId,["envBulkUpdate","checkUpdates"]);s.checkUpdates&&n.push(s.checkUpdates.entityId);const o=m(this._hass,e),a=[];for(const e of o){const t=Me(this._hass,e.id,"update");t&&"on"===t.state.state&&a.push({entityId:t.entityId,name:t.state.attributes.name||e.name_by_user||e.name||e.id,installedVersion:t.state.attributes.installed_version,latestVersion:t.state.attributes.latest_version})}a.sort((e,t)=>e.name.localeCompare(t.name)),(a.length>0||s.envBulkUpdate)&&t.push({envDeviceId:i.deviceId,envName:i.name,bulkButtonEntityId:s.envBulkUpdate?.entityId,checkUpdatesEntityId:s.checkUpdates?.entityId,updates:a})}return{groups:t,checkUpdatesEntityIds:n}}render(){if(!this._config||!this._hass)return ce``;if("environment"===this._config.scope&&!this._hass.devices[this._config.device_id??""])return ce`<ha-card>
        <div class="error-state core-message">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Environment device not found. It may have been removed — edit this card to pick another.</span>
        </div>
      </ha-card>`;const{groups:e,checkUpdatesEntityIds:t}=this._buildGroups(),n=e.reduce((e,t)=>e+t.updates.length,0),i=e.map(e=>e.bulkButtonEntityId).filter(e=>Boolean(e)),s=this._config.title??"Updates",o="all"===this._config.scope&&e.length>1;return ce`
      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="icon-badge">
              <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
            </div>
            <div class="name-block"><span class="name">${s}${n>0?` (${n})`:""}</span></div>
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
            ${i.length>0?ce`
                  <button class="bulk-button" ?disabled=${this._triggering} @click=${()=>this._triggerBulkUpdate(i)}>
                    <ha-icon icon="mdi:arrow-up-circle"></ha-icon>
                    ${this._triggering?"Updating…":"Update all"}
                  </button>
                `:le}
          </div>
        </div>
        <div class="body">
          ${0===n?ce`<div class="empty-note">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                <span>Everything up to date.</span>
              </div>`:e.map(e=>ce`
                  <div class="env-group">
                    ${o?ce`<div class="env-group-title">${e.envName}</div>`:le}
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
    `}async _triggerBulkUpdate(e){if(this._hass&&!this._triggering){this._triggering=!0;try{await this._hass.callService("button","press",{},{entity_id:e})}finally{this._triggering=!1}}}async _triggerCheckUpdates(e){if(this._hass&&!this._checking&&0!==e.length){this._checking=!0;try{await this._hass.callService("button","press",{},{entity_id:e})}finally{this._checking=!1}}}}function vt(e,t){return Ne(e,t,["containers"]).found.containers?.entityId}_t.styles=pt,y([Ue()],_t.prototype,"_config",void 0),y([Ue()],_t.prototype,"_hass",void 0),y([Ue()],_t.prototype,"_triggering",void 0),y([Ue()],_t.prototype,"_checking",void 0);const gt=["environments","vulnerabilities","updates","stacks","containers"],ft=C`
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
`;class yt extends Se{set hass(e){this._hass=e}get hass(){return this._hass}static getStubConfig(){return{type:"custom:dockhand-overview-card",show_environments:!0,show_vulnerabilities:!1,show_stacks:!1,show_containers:!1,show_updates:!1,environment_mode:"standard"}}static async getConfigElement(){return await Promise.resolve().then(function(){return Vt}),document.createElement("dockhand-overview-card-editor")}setConfig(e){this._config={show_environments:!0,show_vulnerabilities:!1,show_stacks:!1,show_containers:!1,show_updates:!1,environment_mode:"standard",...e}}set config(e){this.setConfig(e)}getCardSize(){if(!this._hass||!this._config)return 10;const e=l(this._hass).filter(e=>!this._config?.exclude_device_ids?.includes(e.deviceId)).length;let t=0;return this._config.show_environments&&(t+="full"===this._config.environment_mode?10:"detailed"===this._config.environment_mode?7:4),this._config.show_vulnerabilities&&(t+=3),this._config.show_stacks&&(t+=3),this._config.show_containers&&(t+=3),this._config.show_updates&&(t+=3),e>0?Math.max(4,t):4}getGridOptions(){return{columns:"full",rows:"auto",min_columns:6,min_rows:4}}render(){if(!this._config||!this._hass)return ce``;const e=l(this._hass).filter(e=>!this._config?.exclude_device_ids?.includes(e.deviceId)).sort((e,t)=>this._orderIndex(e.deviceId)-this._orderIndex(t.deviceId));return 0===e.length?ce`<div class="empty-note">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>No Dockhand environments found.</span>
      </div>`:this._config.show_environments||this._config.show_vulnerabilities||this._config.show_stacks||this._config.show_containers||this._config.show_updates?ce`
      <div class="overview">
        ${e.map(e=>this._renderColumn(e.deviceId,e.name))}
      </div>
    `:ce`<div class="empty-note">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>Every section is turned off — edit this card to enable at least one.</span>
      </div>`}_orderIndex(e){const t=this._config?.environment_order;if(!t)return 0;const n=t.indexOf(e);return-1===n?t.length:n}_orderedSections(){const e=this._config?.section_order;if(!e)return gt;const t=new Set(e),n=gt.filter(e=>!t.has(e));return[...e,...n]}_renderColumn(e,t){const n={type:"custom:dockhand-environment-card",device_id:e,mode:this._config?.environment_mode??"standard",custom_sections:this._config?.environment_custom_sections},i={type:"custom:dockhand-vulnerability-card",device_id:e},s={type:"custom:dockhand-stacks-card",device_id:e},o={type:"custom:dockhand-containers-card",device_id:e},a={type:"custom:dockhand-updates-card",scope:"environment",device_id:e},r={environments:()=>this._config?.show_environments?ce`<dockhand-environment-card .hass=${this._hass} .config=${n}></dockhand-environment-card>`:le,vulnerabilities:()=>this._config?.show_vulnerabilities?ce`<dockhand-vulnerability-card .hass=${this._hass} .config=${i}></dockhand-vulnerability-card>`:le,stacks:()=>this._config?.show_stacks?ce`<dockhand-stacks-card .hass=${this._hass} .config=${s}></dockhand-stacks-card>`:le,containers:()=>this._config?.show_containers?ce`<dockhand-containers-card .hass=${this._hass} .config=${o}></dockhand-containers-card>`:le,updates:()=>this._config?.show_updates?this._config?.updates_hide_when_no_updates&&this._hass&&!function(e,t){const n=vt(e,t);if(!n)return!0;const i=e.states[n]?.attributes.pending_updates;return"number"!=typeof i||i>0}(this._hass,e)?le:ce`<dockhand-updates-card .hass=${this._hass} .config=${a}></dockhand-updates-card>`:le};return ce`
      <div class="env-column">
        <div class="env-column-title">${t}</div>
        ${this._orderedSections().map(e=>r[e]())}
      </div>
    `}}yt.styles=ft,y([Ue()],yt.prototype,"_config",void 0),y([Ue()],yt.prototype,"_hass",void 0),customElements.define("dockhand-environment-card",Ze),customElements.define("dockhand-vulnerability-card",Qe),customElements.define("dockhand-stack-card",it),customElements.define("dockhand-container-card",rt),customElements.define("dockhand-stacks-card",lt),customElements.define("dockhand-containers-card",mt),customElements.define("dockhand-updates-card",_t),customElements.define("dockhand-overview-card",yt),window.customCards=window.customCards||[],window.customCards.push({type:"dockhand-environment-card",name:"Dockhand Environment Card",description:"Shows a Dockhand-managed Docker environment, modeled on Dockhand’s own dashboard tile.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(n,i){const s=n.entities?.[i];if(!s||s.platform!==e||!s.device_id)return;const o=n.devices?.[s.device_id];if(!o||!h(o))return;const a={config:{type:"custom:dockhand-environment-card",device_id:o.id,mode:"standard"},label:"Environment overview"};return s.translation_key===t.vulnerabilities?[{config:{type:"custom:dockhand-vulnerability-card",device_id:o.id},label:"Vulnerability summary"},a]:s.translation_key===t.stacks?[{config:{type:"custom:dockhand-stacks-card",device_id:o.id},label:"All stacks"},a]:s.translation_key===t.containers?[{config:{type:"custom:dockhand-containers-card",device_id:o.id},label:"All containers"},a]:a}}),window.customCards.push({type:"dockhand-vulnerability-card",name:"Dockhand Vulnerability Card",description:"Shows an environment's vulnerability scan summary by severity.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),window.customCards.push({type:"dockhand-stack-card",name:"Dockhand Stack Card",description:"Status, updates, and git sync details for one Dockhand Compose stack.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(t,n){const i=t.entities?.[n];if(!i||i.platform!==e||!i.device_id)return;const s=t.devices?.[i.device_id];if(!s||!function(t){return(t.identifiers??[]).some(([t,n])=>t===e&&/^stack_\d+_/.test(n))}(s))return;const o=[{config:{type:"custom:dockhand-stack-card",device_id:s.id},label:"This stack"}],a=g(s),r=null!==a?f(t,a):null;return r&&o.push({config:{type:"custom:dockhand-stacks-card",device_id:r},label:"All stacks in this environment"}),o}}),window.customCards.push({type:"dockhand-container-card",name:"Dockhand Container Card",description:"State, health, CPU/memory, and I/O for one Docker container.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(t,n){const i=t.entities?.[n];if(!i||i.platform!==e||!i.device_id)return;const s=t.devices?.[i.device_id];if(!s||!p(s))return;const o=[{config:{type:"custom:dockhand-container-card",device_id:s.id},label:"This container"}],a=v(s),r=null!==a?f(t,a):null;return r&&o.push({config:{type:"custom:dockhand-containers-card",device_id:r},label:"All containers in this environment"}),o}}),window.customCards.push({type:"dockhand-stacks-card",name:"Dockhand Stacks Card",description:"Every Compose stack in one environment, one compact row each.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),window.customCards.push({type:"dockhand-containers-card",name:"Dockhand Containers Card",description:"Every container in one environment, one compact row each.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),window.customCards.push({type:"dockhand-updates-card",name:"Dockhand Updates Card",description:"Every pending container update, for one environment or all of them, with a bulk-update action.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards",getEntitySuggestion(t,n){const i=t.entities?.[n];if(!i||i.platform!==e||!n.startsWith("update.")||!i.device_id)return;const s=t.devices?.[i.device_id];if(!s||!p(s))return;const o=v(s),a=null!==o?f(t,o):null;return{config:{type:"custom:dockhand-updates-card",scope:a?"environment":"all",device_id:a??void 0},label:"Pending updates"}}}),window.customCards.push({type:"dockhand-overview-card",name:"Dockhand Overview",description:"One big dashboard: every environment, with stacks/containers/vulnerabilities alongside it — intended to fill a whole dashboard view.",preview:!0,documentationURL:"https://github.com/raetha/ha-dockhand-cards"}),console.info("%c HA-DOCKHAND-CARDS %c v0.1.0 ","color: white; background: #0ea5e9; font-weight: 700;","color: #0ea5e9; background: white; font-weight: 700;");const bt=C`
  .row {
    margin-bottom: 12px;
  }
  .sub-row {
    margin-left: 20px;
    padding-left: 12px;
    border-left: 2px solid var(--divider-color);
  }
  ha-select,
  ha-input {
    display: block;
    width: 100%;
  }
  .hint {
    font-size: 0.78em;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
  .hint-box {
    margin-top: 16px;
    padding: 10px 12px;
    border-radius: 6px;
    background: rgba(255, 152, 0, 0.1);
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }
  .hint-box ul {
    margin: 4px 0 0;
    padding-left: 18px;
  }
`,kt={environment:"Environment",stack:"Stack",container:"Container",title_override:"Title override (optional)",show_settings_link:"Show link to open in Dockhand",display_mode:"Display mode",mode_compact:"Compact",mode_standard:"Standard",mode_detailed:"Detailed",mode_full:"Full",mode_custom:"Custom",no_environments_found:"No Dockhand environment devices found. Make sure the ha-dockhand integration is set up and has at least one environment configured.",no_stacks_found:"No stacks found for this environment yet.",no_containers_found:"No containers found for this environment yet.",columns:"Columns",columns_auto:"Auto (fits available width, mobile-friendly)",defaults_heading:"Defaults (applied to every environment unless overridden below)",environments_heading:"Environments",show_this_environment:"Show this environment",mode_override:"Mode override (blank = use default)",use_default:"Use default"},wt={en:kt,de:{environment:"Umgebung",stack:"Stack",container:"Container",title_override:"Titel überschreiben (optional)",show_settings_link:"Link zum Öffnen in Dockhand anzeigen",display_mode:"Anzeigemodus",mode_compact:"Kompakt",mode_standard:"Standard",mode_detailed:"Detailliert",mode_full:"Vollständig",mode_custom:"Benutzerdefiniert",no_environments_found:"Keine Dockhand-Umgebungsgeräte gefunden. Stellen Sie sicher, dass die ha-dockhand-Integration eingerichtet ist und mindestens eine Umgebung konfiguriert wurde.",no_stacks_found:"Für diese Umgebung wurden noch keine Stacks gefunden.",no_containers_found:"Für diese Umgebung wurden noch keine Container gefunden.",columns:"Spalten",columns_auto:"Automatisch (passt sich der verfügbaren Breite an, mobilfreundlich)",defaults_heading:"Standardwerte (gelten für jede Umgebung, sofern unten nicht überschrieben)",environments_heading:"Umgebungen",show_this_environment:"Diese Umgebung anzeigen",mode_override:"Modus überschreiben (leer = Standard verwenden)",use_default:"Standard verwenden"},es:{environment:"Entorno",stack:"Stack",container:"Contenedor",title_override:"Título personalizado (opcional)",show_settings_link:"Mostrar enlace para abrir en Dockhand",display_mode:"Modo de visualización",mode_compact:"Compacto",mode_standard:"Estándar",mode_detailed:"Detallado",mode_full:"Completo",mode_custom:"Personalizado",no_environments_found:"No se encontraron dispositivos de entorno de Dockhand. Asegúrese de que la integración ha-dockhand esté configurada y tenga al menos un entorno configurado.",no_stacks_found:"Aún no se encontraron stacks para este entorno.",no_containers_found:"Aún no se encontraron contenedores para este entorno.",columns:"Columnas",columns_auto:"Automático (se ajusta al ancho disponible, apto para móviles)",defaults_heading:"Valores predeterminados (se aplican a cada entorno salvo que se anulen abajo)",environments_heading:"Entornos",show_this_environment:"Mostrar este entorno",mode_override:"Anular modo (vacío = usar predeterminado)",use_default:"Usar predeterminado"},fr:{environment:"Environnement",stack:"Stack",container:"Conteneur",title_override:"Titre personnalisé (facultatif)",show_settings_link:"Afficher le lien pour ouvrir dans Dockhand",display_mode:"Mode d'affichage",mode_compact:"Compact",mode_standard:"Standard",mode_detailed:"Détaillé",mode_full:"Complet",mode_custom:"Personnalisé",no_environments_found:"Aucun appareil d'environnement Dockhand trouvé. Assurez-vous que l'intégration ha-dockhand est configurée et qu'au moins un environnement est défini.",no_stacks_found:"Aucun stack trouvé pour cet environnement pour le moment.",no_containers_found:"Aucun conteneur trouvé pour cet environnement pour le moment.",columns:"Colonnes",columns_auto:"Automatique (s'adapte à la largeur disponible, adapté au mobile)",defaults_heading:"Valeurs par défaut (appliquées à chaque environnement sauf modification ci-dessous)",environments_heading:"Environnements",show_this_environment:"Afficher cet environnement",mode_override:"Remplacer le mode (vide = utiliser la valeur par défaut)",use_default:"Utiliser la valeur par défaut"},it:{environment:"Ambiente",stack:"Stack",container:"Container",title_override:"Titolo personalizzato (opzionale)",show_settings_link:"Mostra link per aprire in Dockhand",display_mode:"Modalità di visualizzazione",mode_compact:"Compatta",mode_standard:"Standard",mode_detailed:"Dettagliata",mode_full:"Completa",mode_custom:"Personalizzato",no_environments_found:"Nessun dispositivo ambiente Dockhand trovato. Assicurati che l'integrazione ha-dockhand sia configurata e che ci sia almeno un ambiente impostato.",no_stacks_found:"Nessuno stack trovato ancora per questo ambiente.",no_containers_found:"Nessun container trovato ancora per questo ambiente.",columns:"Colonne",columns_auto:"Automatico (si adatta alla larghezza disponibile, ottimizzato per mobile)",defaults_heading:"Valori predefiniti (applicati a ogni ambiente salvo modifiche sotto)",environments_heading:"Ambienti",show_this_environment:"Mostra questo ambiente",mode_override:"Sovrascrivi modalità (vuoto = usa predefinita)",use_default:"Usa predefinita"},nb:{environment:"Miljø",stack:"Stack",container:"Container",title_override:"Tittel-overstyring (valgfritt)",show_settings_link:"Vis lenke for å åpne i Dockhand",display_mode:"Visningsmodus",mode_compact:"Kompakt",mode_standard:"Standard",mode_detailed:"Detaljert",mode_full:"Full",mode_custom:"Egendefinert",no_environments_found:"Fant ingen Dockhand-miljøenheter. Kontroller at ha-dockhand-integrasjonen er satt opp og har minst ett miljø konfigurert.",no_stacks_found:"Fant ingen stacker for dette miljøet ennå.",no_containers_found:"Fant ingen containere for dette miljøet ennå.",columns:"Kolonner",columns_auto:"Automatisk (tilpasser seg tilgjengelig bredde, mobilvennlig)",defaults_heading:"Standardverdier (brukes for alle miljøer med mindre de overstyres under)",environments_heading:"Miljøer",show_this_environment:"Vis dette miljøet",mode_override:"Overstyr modus (tomt = bruk standard)",use_default:"Bruk standard"},nl:{environment:"Omgeving",stack:"Stack",container:"Container",title_override:"Titel overschrijven (optioneel)",show_settings_link:"Link tonen om te openen in Dockhand",display_mode:"Weergavemodus",mode_compact:"Compact",mode_standard:"Standaard",mode_detailed:"Gedetailleerd",mode_full:"Volledig",mode_custom:"Aangepast",no_environments_found:"Geen Dockhand-omgevingsapparaten gevonden. Zorg dat de ha-dockhand-integratie is ingesteld en minstens één omgeving is geconfigureerd.",no_stacks_found:"Nog geen stacks gevonden voor deze omgeving.",no_containers_found:"Nog geen containers gevonden voor deze omgeving.",columns:"Kolommen",columns_auto:"Automatisch (past zich aan beschikbare breedte aan, mobielvriendelijk)",defaults_heading:"Standaardwaarden (toegepast op elke omgeving tenzij hieronder overschreven)",environments_heading:"Omgevingen",show_this_environment:"Deze omgeving tonen",mode_override:"Modus overschrijven (leeg = standaard gebruiken)",use_default:"Standaard gebruiken"},pl:{environment:"Środowisko",stack:"Stos",container:"Kontener",title_override:"Nadpisanie tytułu (opcjonalnie)",show_settings_link:"Pokaż link do otwarcia w Dockhand",display_mode:"Tryb wyświetlania",mode_compact:"Kompaktowy",mode_standard:"Standardowy",mode_detailed:"Szczegółowy",mode_full:"Pełny",mode_custom:"Niestandardowy",no_environments_found:"Nie znaleziono urządzeń środowiska Dockhand. Upewnij się, że integracja ha-dockhand jest skonfigurowana i ma co najmniej jedno środowisko.",no_stacks_found:"Nie znaleziono jeszcze żadnych stosów dla tego środowiska.",no_containers_found:"Nie znaleziono jeszcze żadnych kontenerów dla tego środowiska.",columns:"Kolumny",columns_auto:"Automatyczny (dopasowuje się do dostępnej szerokości, przyjazny dla urządzeń mobilnych)",defaults_heading:"Wartości domyślne (stosowane do każdego środowiska, chyba że nadpisane poniżej)",environments_heading:"Środowiska",show_this_environment:"Pokaż to środowisko",mode_override:"Nadpisz tryb (puste = użyj domyślnego)",use_default:"Użyj domyślnego"},pt:{environment:"Ambiente",stack:"Stack",container:"Contêiner",title_override:"Substituir título (opcional)",show_settings_link:"Mostrar link para abrir no Dockhand",display_mode:"Modo de exibição",mode_compact:"Compacto",mode_standard:"Padrão",mode_detailed:"Detalhado",mode_full:"Completo",mode_custom:"Personalizado",no_environments_found:"Nenhum dispositivo de ambiente Dockhand encontrado. Verifique se a integração ha-dockhand está configurada e tem pelo menos um ambiente definido.",no_stacks_found:"Nenhuma stack encontrada para este ambiente ainda.",no_containers_found:"Nenhum contêiner encontrado para este ambiente ainda.",columns:"Colunas",columns_auto:"Automático (ajusta-se à largura disponível, compatível com dispositivos móveis)",defaults_heading:"Padrões (aplicados a todos os ambientes, salvo substituição abaixo)",environments_heading:"Ambientes",show_this_environment:"Mostrar este ambiente",mode_override:"Substituir modo (vazio = usar padrão)",use_default:"Usar padrão"},sv:{environment:"Miljö",stack:"Stack",container:"Container",title_override:"Titeländring (valfritt)",show_settings_link:"Visa länk för att öppna i Dockhand",display_mode:"Visningsläge",mode_compact:"Kompakt",mode_standard:"Standard",mode_detailed:"Detaljerad",mode_full:"Fullständig",mode_custom:"Anpassad",no_environments_found:"Inga Dockhand-miljöenheter hittades. Kontrollera att ha-dockhand-integrationen är konfigurerad och har minst en miljö inställd.",no_stacks_found:"Inga stackar hittades för denna miljö ännu.",no_containers_found:"Inga containrar hittades för denna miljö ännu.",columns:"Kolumner",columns_auto:"Automatisk (anpassar sig efter tillgänglig bredd, mobilvänlig)",defaults_heading:"Standardvärden (gäller alla miljöer om inte annat anges nedan)",environments_heading:"Miljöer",show_this_environment:"Visa denna miljö",mode_override:"Åsidosätt läge (tomt = använd standard)",use_default:"Använd standard"},"zh-Hans":{environment:"环境",stack:"堆栈",container:"容器",title_override:"标题覆盖（可选）",show_settings_link:"显示在 Dockhand 中打开的链接",display_mode:"显示模式",mode_compact:"紧凑",mode_standard:"标准",mode_detailed:"详细",mode_full:"完整",mode_custom:"自定义",no_environments_found:"未找到 Dockhand 环境设备。请确保已设置 ha-dockhand 集成并至少配置了一个环境。",no_stacks_found:"此环境尚未找到任何堆栈。",no_containers_found:"此环境尚未找到任何容器。",columns:"列数",columns_auto:"自动（适应可用宽度，适合移动端）",defaults_heading:"默认值（应用于每个环境，除非在下方覆盖）",environments_heading:"环境",show_this_environment:"显示此环境",mode_override:"模式覆盖（留空 = 使用默认值）",use_default:"使用默认值"}};function $t(e,t){const n=e?.locale?.language??e?.language??"en";return wt[n]?.[t]??kt[t]}const xt={compact:"mode_compact",standard:"mode_standard",detailed:"mode_detailed",full:"mode_full",custom:"mode_custom"},Ct={container_counts:"Container counts (+ health banner)",metrics:"CPU / memory bars",resources:"Images / stacks / volumes / networks",events_summary:"Events (today / total)",recent_events:"Recent events list",top_containers:"Top containers by CPU",disk_usage:"Disk usage breakdown",history_chart:"CPU / memory history chart"},St=[{value:"compact",label:"Compact",hint:"Name, online status, and the container counts row with health banner — same as the top of Standard, without CPU/memory/resource counts/events below it."},{value:"standard",label:"Standard",hint:"Adds CPU/memory bars, health banner, image/stack/volume/network counts, and events."},{value:"detailed",label:"Detailed",hint:"Standard, plus top containers by CPU and recent events (both need a recent ha-dockhand release — no per-container entities required). Sections you haven’t got the data for yet are simply left out, not shown broken."},{value:"full",label:"Full",hint:"Detailed, plus a disk usage breakdown (needs the Disk usage sensor enabled — off by default) and 15-minute CPU/memory history charts, matching Dockhand’s own window (needs Home Assistant’s recorder to have history for those sensors)."},{value:"custom",label:"Custom",hint:"Pick exactly which sections to show, independent of the fixed combinations above — e.g. just the summary and CPU/memory/disk sections without either list."}];class It extends Se{set hass(e){this._hass=e}setConfig(e){this._config=e}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass),t=this._config.mode??"standard";return 0===e.length?ce`<div class="row">${$t(this._hass,"no_environments_found")}</div>`:ce`
      <div class="row">
        <ha-select
          label=${$t(this._hass,"environment")}
          .options=${e.map(e=>({value:e.deviceId,label:e.name}))}
          .value=${this._config.device_id}
          @selected=${this._deviceChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-select
          label=${$t(this._hass,"display_mode")}
          .options=${St.map(e=>({value:e.value,label:$t(this._hass,xt[e.value])}))}
          .value=${t}
          .helper=${St.find(e=>e.value===t)?.hint}
          @selected=${this._modeChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-input label=${$t(this._hass,"title_override")} .value=${this._config.title??""} @input=${this._titleChanged}></ha-input>
      </div>

      <div class="row">
        <ha-formfield label=${$t(this._hass,"show_settings_link")}>
          <ha-switch .checked=${this._config.show_settings_link??!0} @change=${this._settingsLinkChanged}></ha-switch>
        </ha-formfield>
      </div>

      ${"custom"===t?this._renderSectionCheckboxes():le}

      ${this._renderAvailabilityHint(t)}
    `}_renderSectionCheckboxes(){const e=new Set(this._config?.custom_sections??Be);return ce`
      <div class="row sub-row">
        <div class="hint">Which sections to show — pick any combination.</div>
      </div>
      ${Ke.map(t=>ce`
          <div class="row sub-row">
            <ha-formfield label=${Ct[t]}>
              <ha-switch .checked=${e.has(t)} @change=${this._sectionToggle(t)}></ha-switch>
            </ha-formfield>
          </div>
        `)}
    `}_renderAvailabilityHint(e){if(!this._hass||!this._config?.device_id)return le;const t=s[e]??s.standard,{unavailable:n}=Ne(this._hass,this._config.device_id,t);return 0===n.length?le:ce`
      <div class="hint-box">
        This card would show more with these entities enabled:
        <ul>
          ${n.map(e=>ce`<li>${a[e.key]??e.key}${"not_found"===e.reason?" (requires a newer ha-dockhand release)":""}</li>`)}
        </ul>
      </div>
    `}_deviceChanged(e){this._updateConfig({device_id:e.detail.value})}_modeChanged(e){const t=e.detail.value;if(!this._config)return;const n={...this._config,mode:t};"custom"!==t&&void 0!==n.custom_sections&&delete n.custom_sections,this._config=n,De(this,"config-changed",{config:this._config})}_sectionToggle(e){return t=>{const n=new Set(this._config?.custom_sections??Be);t.target.checked?n.add(e):n.delete(e),this._updateConfig({custom_sections:Ke.filter(e=>n.has(e))})}}_titleChanged(e){this._updateConfig({title:e.target.value})}_settingsLinkChanged(e){this._updateConfig({show_settings_link:e.target.checked})}_updateConfig(e){this._config&&(this._config={...this._config,...e},De(this,"config-changed",{config:this._config}))}}It.styles=bt,y([Ue()],It.prototype,"_config",void 0),y([Ue()],It.prototype,"_hass",void 0),customElements.define("dockhand-environment-card-editor",It);var Et=Object.freeze({__proto__:null,DockhandEnvironmentCardEditor:It});class At extends Se{set hass(e){this._hass=e}setConfig(e){this._config=e}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return 0===e.length?ce`<div class="row">${$t(this._hass,"no_environments_found")}</div>`:ce`
      <div class="row">
        <ha-select
          label=${$t(this._hass,"environment")}
          .options=${e.map(e=>({value:e.deviceId,label:e.name}))}
          .value=${this._config.device_id}
          @selected=${this._deviceChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-input label=${$t(this._hass,"title_override")} .value=${this._config.title??""} @input=${this._titleChanged}></ha-input>
      </div>

      <div class="row">
        <ha-formfield label=${$t(this._hass,"show_settings_link")}>
          <ha-switch .checked=${this._config.show_settings_link??!0} @change=${this._settingsLinkChanged}></ha-switch>
        </ha-formfield>
      </div>
    `}_deviceChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){this._updateConfig({title:e.target.value})}_settingsLinkChanged(e){this._updateConfig({show_settings_link:e.target.checked})}_updateConfig(e){this._config&&(this._config={...this._config,...e},De(this,"config-changed",{config:this._config}))}}At.styles=bt,y([Ue()],At.prototype,"_config",void 0),y([Ue()],At.prototype,"_hass",void 0),customElements.define("dockhand-vulnerability-card-editor",At);var Ut=Object.freeze({__proto__:null,DockhandVulnerabilityCardEditor:At});class Pt extends Se{set hass(e){this._hass=e}setConfig(e){if(this._config=e,e.device_id&&this._hass&&!this._envDeviceId){const t=this._hass.devices?.[e.device_id];if(t){const e=g(t);if(null!==e){const t=Object.values(this._hass.devices).find(t=>u(t)===e);this._envDeviceId=t?.id}}}}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);if(0===e.length)return ce`<div class="row">${$t(this._hass,"no_environments_found")}</div>`;const t=this._envDeviceId?u(this._hass.devices[this._envDeviceId]):null,n=null!==t?_(this._hass,t):[];return ce`
      <div class="row">
        <ha-select
          label=${$t(this._hass,"environment")}
          .options=${e.map(e=>({value:e.deviceId,label:e.name}))}
          .value=${this._envDeviceId??""}
          @selected=${this._envChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-select
          label=${$t(this._hass,"stack")}
          .options=${n.map(e=>({value:e.id,label:e.name_by_user||e.name||e.id}))}
          .value=${this._config.device_id}
          .disabled=${0===n.length}
          .helper=${null!==t&&0===n.length?$t(this._hass,"no_stacks_found"):void 0}
          @selected=${this._stackChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-input label=${$t(this._hass,"title_override")} .value=${this._config.title??""} @input=${this._titleChanged}></ha-input>
      </div>

      <div class="row">
        <ha-formfield label=${$t(this._hass,"show_settings_link")}>
          <ha-switch .checked=${this._config.show_settings_link??!0} @change=${this._settingsLinkChanged}></ha-switch>
        </ha-formfield>
      </div>

      ${this._renderAvailabilityHint()}
    `}_renderAvailabilityHint(){if(!this._hass||!this._config?.device_id)return le;const e=["status","containersInStack","updatesAvailable"],{unavailable:t}=Te(this._hass,this._config.device_id,["status","containersInStack","updatesAvailable","gitSyncStatus","gitLastSync","gitSyncError"]),n=t.filter(t=>e.includes(t.key)||"disabled"===t.reason);return 0===n.length?le:ce`
      <div class="hint-box">
        This card would show more with these entities enabled:
        <ul>
          ${n.map(e=>ce`<li>${c[e.key]??e.key}${"not_found"===e.reason?" (requires a newer ha-dockhand release)":""}</li>`)}
        </ul>
      </div>
    `}_envChanged(e){this._envDeviceId=e.detail.value,this.requestUpdate()}_stackChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){this._updateConfig({title:e.target.value})}_settingsLinkChanged(e){this._updateConfig({show_settings_link:e.target.checked})}_updateConfig(e){this._config&&(this._config={...this._config,...e},De(this,"config-changed",{config:this._config}))}}Pt.styles=bt,y([Ue()],Pt.prototype,"_config",void 0),y([Ue()],Pt.prototype,"_hass",void 0),y([Ue()],Pt.prototype,"_envDeviceId",void 0),customElements.define("dockhand-stack-card-editor",Pt);var zt=Object.freeze({__proto__:null,DockhandStackCardEditor:Pt});class Dt extends Se{set hass(e){this._hass=e}setConfig(e){if(this._config=e,e.device_id&&this._hass&&!this._envDeviceId){const t=this._hass.devices?.[e.device_id];if(t){const e=v(t);if(null!==e){const t=Object.values(this._hass.devices).find(t=>u(t)===e);this._envDeviceId=t?.id}}}}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);if(0===e.length)return ce`<div class="row">${$t(this._hass,"no_environments_found")}</div>`;const t=this._envDeviceId?u(this._hass.devices[this._envDeviceId]):null,n=null!==t?m(this._hass,t):[];return ce`
      <div class="row">
        <ha-select
          label=${$t(this._hass,"environment")}
          .options=${e.map(e=>({value:e.deviceId,label:e.name}))}
          .value=${this._envDeviceId??""}
          @selected=${this._envChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-select
          label=${$t(this._hass,"container")}
          .options=${n.map(e=>({value:e.id,label:e.name_by_user||e.name||e.id}))}
          .value=${this._config.device_id}
          .disabled=${0===n.length}
          .helper=${null!==t&&0===n.length?$t(this._hass,"no_containers_found"):void 0}
          @selected=${this._containerChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-input label=${$t(this._hass,"title_override")} .value=${this._config.title??""} @input=${this._titleChanged}></ha-input>
      </div>

      <div class="row">
        <ha-formfield label=${$t(this._hass,"show_settings_link")}>
          <ha-switch .checked=${this._config.show_settings_link??!0} @change=${this._settingsLinkChanged}></ha-switch>
        </ha-formfield>
      </div>

      ${this._renderAvailabilityHint()}
    `}_renderAvailabilityHint(){if(!this._hass||!this._config?.device_id)return le;const{unavailable:e}=Oe(this._hass,this._config.device_id,["cpuPercent","memoryUsage","memoryPercent","memoryLimit","networkRx","networkTx","blockRead","blockWrite"]),t=e.filter(e=>"disabled"===e.reason);return 0===t.length?le:ce`
      <div class="hint-box">
        This card would show more with these entities enabled:
        <ul>
          ${t.map(e=>ce`<li>${r[e.key]??e.key}</li>`)}
        </ul>
      </div>
    `}_envChanged(e){this._envDeviceId=e.detail.value,this.requestUpdate()}_containerChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){this._updateConfig({title:e.target.value})}_settingsLinkChanged(e){this._updateConfig({show_settings_link:e.target.checked})}_updateConfig(e){this._config&&(this._config={...this._config,...e},De(this,"config-changed",{config:this._config}))}}Dt.styles=bt,y([Ue()],Dt.prototype,"_config",void 0),y([Ue()],Dt.prototype,"_hass",void 0),y([Ue()],Dt.prototype,"_envDeviceId",void 0),customElements.define("dockhand-container-card-editor",Dt);var jt=Object.freeze({__proto__:null,DockhandContainerCardEditor:Dt});class Nt extends Se{set hass(e){this._hass=e}setConfig(e){this._config=e}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return 0===e.length?ce`<div class="row">${$t(this._hass,"no_environments_found")}</div>`:ce`
      <div class="row">
        <ha-select
          label=${$t(this._hass,"environment")}
          .options=${e.map(e=>({value:e.deviceId,label:e.name}))}
          .value=${this._config.device_id}
          @selected=${this._deviceChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-input label=${$t(this._hass,"title_override")} .value=${this._config.title??""} @input=${this._titleChanged}></ha-input>
      </div>
    `}_deviceChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){this._updateConfig({title:e.target.value})}_updateConfig(e){this._config&&(this._config={...this._config,...e},De(this,"config-changed",{config:this._config}))}}Nt.styles=bt,y([Ue()],Nt.prototype,"_config",void 0),y([Ue()],Nt.prototype,"_hass",void 0),customElements.define("dockhand-stacks-card-editor",Nt);var Ot=Object.freeze({__proto__:null,DockhandStacksCardEditor:Nt});class Tt extends Se{set hass(e){this._hass=e}setConfig(e){this._config=e}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return 0===e.length?ce`<div class="row">${$t(this._hass,"no_environments_found")}</div>`:ce`
      <div class="row">
        <ha-select
          label=${$t(this._hass,"environment")}
          .options=${e.map(e=>({value:e.deviceId,label:e.name}))}
          .value=${this._config.device_id}
          @selected=${this._deviceChanged}
        ></ha-select>
      </div>

      <div class="row">
        <ha-input label=${$t(this._hass,"title_override")} .value=${this._config.title??""} @input=${this._titleChanged}></ha-input>
      </div>
    `}_deviceChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){this._updateConfig({title:e.target.value})}_updateConfig(e){this._config&&(this._config={...this._config,...e},De(this,"config-changed",{config:this._config}))}}Tt.styles=bt,y([Ue()],Tt.prototype,"_config",void 0),y([Ue()],Tt.prototype,"_hass",void 0),customElements.define("dockhand-containers-card-editor",Tt);var Mt=Object.freeze({__proto__:null,DockhandContainersCardEditor:Tt});class Rt extends Se{set hass(e){this._hass=e}setConfig(e){this._config={...e,scope:e.scope??"all"}}render(){if(!this._hass||!this._config)return ce``;const e=l(this._hass);return ce`
      <div class="row">
        <ha-select
          label="Scope"
          .options=${[{value:"all",label:"All environments"},{value:"environment",label:"One environment"}]}
          .value=${this._config.scope}
          @selected=${this._scopeChanged}
        ></ha-select>
      </div>

      ${"environment"===this._config.scope?ce`
            <div class="row">
              <ha-select
                label=${$t(this._hass,"environment")}
                .options=${e.map(e=>({value:e.deviceId,label:e.name}))}
                .value=${this._config.device_id??""}
                @selected=${this._deviceChanged}
              ></ha-select>
              ${0===e.length?ce`<div class="hint">${$t(this._hass,"no_environments_found")}</div>`:le}
            </div>
          `:le}

      <div class="row">
        <ha-input label=${$t(this._hass,"title_override")} .value=${this._config.title??""} @input=${this._titleChanged}></ha-input>
      </div>

      <div class="row">
        <ha-formfield label="Hide when no updates">
          <ha-switch .checked=${this._config.hide_when_no_updates??!1} @change=${this._hideToggled}></ha-switch>
        </ha-formfield>
        <div class="hint">
          Uses Home Assistant's own card visibility condition — the same feature available in every card's own editor — rather
          than anything this card invents itself, so the card is genuinely gone (not just empty) when hidden.
        </div>
      </div>
    `}_scopeChanged(e){this._updateConfig({scope:e.detail.value})}_deviceChanged(e){this._updateConfig({device_id:e.detail.value})}_titleChanged(e){this._updateConfig({title:e.target.value})}_hideToggled(e){this._updateConfig({hide_when_no_updates:e.target.checked})}_updateConfig(e){if(!this._config)return;const t={...this._config,...e};if(t.hide_when_no_updates&&this._hass){const e="environment"===t.scope?t.device_id?[t.device_id]:[]:l(this._hass).map(e=>e.deviceId),n=function(e,t){const n=t.map(t=>vt(e,t)).filter(e=>Boolean(e)).map(e=>({condition:"numeric_state",entity:e,attribute:"pending_updates",above:0}));if(0!==n.length)return 1===n.length?n:[{condition:"or",conditions:n}]}(this._hass,e);n?t.visibility=n:delete t.visibility}else delete t.visibility;this._config=t,De(this,"config-changed",{config:this._config})}}Rt.styles=bt,y([Ue()],Rt.prototype,"_config",void 0),y([Ue()],Rt.prototype,"_hass",void 0),customElements.define("dockhand-updates-card-editor",Rt);var Ht=Object.freeze({__proto__:null,DockhandUpdatesCardEditor:Rt});const Lt=[{value:"compact",label:"Compact"},{value:"standard",label:"Standard"},{value:"detailed",label:"Detailed"},{value:"full",label:"Full"},{value:"custom",label:"Custom"}],Kt={container_counts:"Container counts (+ health banner)",metrics:"CPU / memory bars",resources:"Images / stacks / volumes / networks",events_summary:"Events (today / total)",recent_events:"Recent events list",top_containers:"Top containers by CPU",disk_usage:"Disk usage breakdown",history_chart:"CPU / memory history chart"},Bt={environments:"Environments",vulnerabilities:"Vulnerabilities",stacks:"Stacks",containers:"Containers",updates:"Updates"};class Ft extends Se{set hass(e){this._hass=e}setConfig(e){this._config={show_environments:!0,show_vulnerabilities:!1,show_stacks:!1,show_containers:!1,show_updates:!1,environment_mode:"standard",...e}}_orderedDevices(){if(!this._hass)return[];const e=l(this._hass),t=this._config?.environment_order;return t?[...e].sort((e,n)=>{const i=t.indexOf(e.deviceId),s=t.indexOf(n.deviceId);return(-1===i?t.length:i)-(-1===s?t.length:s)}):e}_isSectionShown(e){switch(e){case"environments":return this._config?.show_environments??!0;case"vulnerabilities":return this._config?.show_vulnerabilities??!1;case"stacks":return this._config?.show_stacks??!1;case"containers":return this._config?.show_containers??!1;case"updates":return this._config?.show_updates??!1}}_orderedSections(){const e=this._config?.section_order;if(!e)return gt;const t=new Set(e),n=gt.filter(e=>!t.has(e));return[...e,...n]}render(){if(!this._hass||!this._config)return ce``;const e=this._orderedDevices(),t=this._orderedSections();return ce`
      <div class="row">
        <ha-formfield label="Environments">
          <ha-switch .checked=${this._config.show_environments??!0} @change=${this._toggle("show_environments")}></ha-switch>
        </ha-formfield>
      </div>
      <div class="row">
        <ha-select
          label="Environment card mode"
          .options=${Lt.map(e=>({value:e.value,label:e.label}))}
          .value=${this._config.environment_mode??"standard"}
          .disabled=${!this._config.show_environments}
          @selected=${this._modeChanged}
        ></ha-select>
      </div>
      ${this._config.show_environments&&"custom"===this._config.environment_mode?this._renderSectionCheckboxes():ce``}
      <div class="row">
        <ha-formfield label="Vulnerabilities">
          <ha-switch .checked=${this._config.show_vulnerabilities??!1} @change=${this._toggle("show_vulnerabilities")}></ha-switch>
        </ha-formfield>
        <div class="hint">Needs the "Vulnerabilities" sensor enabled per environment — off by default.</div>
      </div>
      <div class="row">
        <ha-formfield label="Updates">
          <ha-switch .checked=${this._config.show_updates??!1} @change=${this._toggle("show_updates")}></ha-switch>
        </ha-formfield>
        <div class="hint">One Updates card per environment, scoped to that environment only.</div>
      </div>
      ${this._config.show_updates?ce`
            <div class="row sub-row">
              <ha-formfield label="Hide Updates card when no updates">
                <ha-switch .checked=${this._config.updates_hide_when_no_updates??!1} @change=${this._hideUpdatesToggled}></ha-switch>
              </ha-formfield>
              <div class="hint">
                Hides only that specific environment's card — other environments with pending updates still show theirs. Genuinely
                takes up no space here (unlike the standalone Updates card's own version of this setting — see its editor).
              </div>
            </div>
          `:ce``}
      <div class="row">
        <ha-formfield label="Stacks">
          <ha-switch .checked=${this._config.show_stacks??!1} @change=${this._toggle("show_stacks")}></ha-switch>
        </ha-formfield>
      </div>
      <div class="row">
        <ha-formfield label="Containers">
          <ha-switch .checked=${this._config.show_containers??!1} @change=${this._toggle("show_containers")}></ha-switch>
        </ha-formfield>
      </div>

      <h3>Section order</h3>
      <div class="hint">Drag to reorder — this is the order sections appear within each environment's column. Turned-off sections stay in the list (dimmed) so you can arrange them ahead of time.</div>
      <ha-sortable handle-selector=".env-order-handle" @item-moved=${this._sectionMoved}>
        <div>
          ${t.map(e=>ce`
              <div class="env-order-row section-order-row ${this._isSectionShown(e)?"":"disabled"}">
                <ha-icon class="env-order-handle" icon="mdi:drag"></ha-icon>
                <span>${Bt[e]}</span>
              </div>
            `)}
        </div>
      </ha-sortable>

      ${e.length>1?ce`
            <h3>Environment order</h3>
            <div class="hint">Drag to reorder — this is the order columns appear in, left to right.</div>
            <ha-sortable handle-selector=".env-order-handle" @item-moved=${this._envMoved}>
              <div>
                ${e.map(e=>ce`
                    <div class="env-order-row">
                      <ha-icon class="env-order-handle" icon="mdi:drag"></ha-icon>
                      <span>${e.name}</span>
                    </div>
                  `)}
              </div>
            </ha-sortable>
          `:ce``}
    `}_renderSectionCheckboxes(){const e=new Set(this._config?.environment_custom_sections??Be);return ce`
      <div class="row sub-row">
        <div class="hint">Which sections to show in each environment's card — pick any combination.</div>
      </div>
      ${Ke.map(t=>ce`
          <div class="row sub-row">
            <ha-formfield label=${Kt[t]}>
              <ha-switch .checked=${e.has(t)} @change=${this._sectionToggle(t)}></ha-switch>
            </ha-formfield>
          </div>
        `)}
    `}_sectionToggle(e){return t=>{const n=new Set(this._config?.environment_custom_sections??Be);t.target.checked?n.add(e):n.delete(e),this._updateConfig({environment_custom_sections:Ke.filter(e=>n.has(e))})}}_envMoved(e){e.stopPropagation();const t=this._orderedDevices().map(e=>e.deviceId),[n]=t.splice(e.detail.oldIndex,1);t.splice(e.detail.newIndex,0,n),this._updateConfig({environment_order:t})}_sectionMoved(e){e.stopPropagation();const t=this._orderedSections(),[n]=t.splice(e.detail.oldIndex,1);t.splice(e.detail.newIndex,0,n),this._updateConfig({section_order:t})}_toggle(e){return t=>this._updateConfig({[e]:t.target.checked})}_hideUpdatesToggled(e){this._updateConfig({updates_hide_when_no_updates:e.target.checked})}_modeChanged(e){const t=e.detail.value;if(!this._config)return;const n={...this._config,environment_mode:t};"custom"!==t&&void 0!==n.environment_custom_sections&&delete n.environment_custom_sections,this._config=n,De(this,"config-changed",{config:this._config})}_updateConfig(e){this._config&&(this._config={...this._config,...e},De(this,"config-changed",{config:this._config}))}}Ft.styles=C`
    ${bt}
    h3 {
      font-size: 0.9em;
      font-weight: 500;
      margin: 16px 0 8px;
      color: var(--secondary-text-color);
    }
    .env-order-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 4px;
      border-bottom: 1px solid var(--divider-color);
    }
    .env-order-handle {
      cursor: grab;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    .section-order-row.disabled {
      opacity: 0.5;
    }
  `,y([Ue()],Ft.prototype,"_config",void 0),y([Ue()],Ft.prototype,"_hass",void 0),customElements.define("dockhand-overview-card-editor",Ft);var Vt=Object.freeze({__proto__:null,DockhandOverviewCardEditor:Ft});
