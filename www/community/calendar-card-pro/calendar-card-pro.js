const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;let a=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const n=this.t;if(t&&void 0===e){const t=void 0!==n&&1===n.length;t&&(e=r.get(n)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}};const i=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:o,defineProperty:s,getOwnPropertyDescriptor:l,getOwnPropertyNames:d,getOwnPropertySymbols:c,getPrototypeOf:u}=Object,_=globalThis,m=_.trustedTypes,h=m?m.emptyScript:"",p=_.reactiveElementPolyfillSupport,f=(e,t)=>e,g={toAttribute(e,t){switch(t){case Boolean:e=e?h:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},y=(e,t)=>!o(e,t),v={attribute:!0,type:String,converter:g,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),r=this.getPropertyDescriptor(e,n,t);void 0!==r&&s(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){const{get:r,set:a}=l(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const i=r?.call(this);a?.call(this,t),this.requestUpdate(e,i,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...d(e),...c(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const n=this._$Eu(e,t);void 0!==n&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(i(e))}else void 0!==e&&t.push(i(e));return t}static _$Eu(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((n,r)=>{if(t)n.adoptedStyleSheets=r.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const t of r){const r=document.createElement("style"),a=e.litNonce;void 0!==a&&r.setAttribute("nonce",a),r.textContent=t.cssText,n.appendChild(r)}})(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(void 0!==r&&!0===n.reflect){const a=(void 0!==n.converter?.toAttribute?n.converter:g).toAttribute(t,n.type);this._$Em=e,null==a?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(e,t){const n=this.constructor,r=n._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=n.getPropertyOptions(r),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:g;this._$Em=r;const i=a.fromAttribute(t,e.type);this[r]=i??this._$Ej?.get(r)??i,this._$Em=null}}requestUpdate(e,t,n,r=!1,a){if(void 0!==e){const i=this.constructor;if(!1===r&&(a=this[e]),n??=i.getPropertyOptions(e),!((n.hasChanged??y)(a,t)||n.useDefault&&n.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(i._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:a},i){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,i??t??this[e]),!0!==a||void 0!==i)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e){const{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,n,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[f("elementProperties")]=new Map,w[f("finalized")]=new Map,p?.({ReactiveElement:w}),(_.reactiveElementVersions??=[]).push("2.1.2");const b=globalThis,M=b.trustedTypes,k=M?M.createPolicy("lit-html",{createHTML:e=>e}):void 0,D="$lit$",Y=`lit$${Math.random().toFixed(9).slice(2)}$`,$="?"+Y,x=`<${$}>`,S=document,L=()=>S.createComment(""),T=e=>null===e||"object"!=typeof e&&"function"!=typeof e,j=Array.isArray,H="[ \t\n\f\r]",z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,E=/-->/g,O=/>/g,A=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),C=/'/g,P=/"/g,I=/^(?:script|style|textarea|title)$/i,N=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),W=Symbol.for("lit-noChange"),F=Symbol.for("lit-nothing"),U=new WeakMap,R=S.createTreeWalker(S,129);function J(e,t){if(!j(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(t):t}class V{constructor({strings:e,_$litType$:t},n){let r;this.parts=[];let a=0,i=0;const o=e.length-1,s=this.parts,[l,d]=((e,t)=>{const n=e.length-1,r=[];let a,i=2===t?"<svg>":3===t?"<math>":"",o=z;for(let t=0;t<n;t++){const n=e[t];let s,l,d=-1,c=0;for(;c<n.length&&(o.lastIndex=c,l=o.exec(n),null!==l);)c=o.lastIndex,o===z?"!--"===l[1]?o=E:void 0!==l[1]?o=O:void 0!==l[2]?(I.test(l[2])&&(a=RegExp("</"+l[2],"g")),o=A):void 0!==l[3]&&(o=A):o===A?">"===l[0]?(o=a??z,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?A:'"'===l[3]?P:C):o===P||o===C?o=A:o===E||o===O?o=z:(o=A,a=void 0);const u=o===A&&e[t+1].startsWith("/>")?" ":"";i+=o===z?n+x:d>=0?(r.push(s),n.slice(0,d)+D+n.slice(d)+Y+u):n+Y+(-2===d?t:u)}return[J(e,i+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]})(e,t);if(this.el=V.createElement(l,n),R.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=R.nextNode())&&s.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(D)){const t=d[i++],n=r.getAttribute(e).split(Y),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:a,name:o[2],strings:n,ctor:"."===o[1]?Z:"?"===o[1]?Q:"@"===o[1]?X:G}),r.removeAttribute(e)}else e.startsWith(Y)&&(s.push({type:6,index:a}),r.removeAttribute(e));if(I.test(r.tagName)){const e=r.textContent.split(Y),t=e.length-1;if(t>0){r.textContent=M?M.emptyScript:"";for(let n=0;n<t;n++)r.append(e[n],L()),R.nextNode(),s.push({type:2,index:++a});r.append(e[t],L())}}}else if(8===r.nodeType)if(r.data===$)s.push({type:2,index:a});else{let e=-1;for(;-1!==(e=r.data.indexOf(Y,e+1));)s.push({type:7,index:a}),e+=Y.length-1}a++}}static createElement(e,t){const n=S.createElement("template");return n.innerHTML=e,n}}function B(e,t,n=e,r){if(t===W)return t;let a=void 0!==r?n._$Co?.[r]:n._$Cl;const i=T(t)?void 0:t._$litDirective$;return a?.constructor!==i&&(a?._$AO?.(!1),void 0===i?a=void 0:(a=new i(e),a._$AT(e,n,r)),void 0!==r?(n._$Co??=[])[r]=a:n._$Cl=a),void 0!==a&&(t=B(e,a._$AS(e,t.values),a,r)),t}class K{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);R.currentNode=r;let a=R.nextNode(),i=0,o=0,s=n[0];for(;void 0!==s;){if(i===s.index){let t;2===s.type?t=new q(a,a.nextSibling,this,e):1===s.type?t=new s.ctor(a,s.name,s.strings,this,e):6===s.type&&(t=new ee(a,this,e)),this._$AV.push(t),s=n[++o]}i!==s?.index&&(a=R.nextNode(),i++)}return R.currentNode=S,r}p(e){let t=0;for(const n of this._$AV)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=B(this,e,t),T(e)?e===F||null==e||""===e?(this._$AH!==F&&this._$AR(),this._$AH=F):e!==this._$AH&&e!==W&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>j(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==F&&T(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,r="number"==typeof n?this._$AC(e):(void 0===n.el&&(n.el=V.createElement(J(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new K(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=U.get(e.strings);return void 0===t&&U.set(e.strings,t=new V(e)),t}k(e){j(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,r=0;for(const a of e)r===t.length?t.push(n=new q(this.O(L()),this.O(L()),this,this.options)):n=t[r],n._$AI(a),r++;r<t.length&&(this._$AR(n&&n._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class G{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,a){this.type=1,this._$AH=F,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=a,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=F}_$AI(e,t=this,n,r){const a=this.strings;let i=!1;if(void 0===a)e=B(this,e,t,0),i=!T(e)||e!==this._$AH&&e!==W,i&&(this._$AH=e);else{const r=e;let o,s;for(e=a[0],o=0;o<a.length-1;o++)s=B(this,r[n+o],t,o),s===W&&(s=this._$AH[o]),i||=!T(s)||s!==this._$AH[o],s===F?e=F:e!==F&&(e+=(s??"")+a[o+1]),this._$AH[o]=s}i&&!r&&this.j(e)}j(e){e===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Z extends G{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===F?void 0:e}}class Q extends G{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==F)}}class X extends G{constructor(e,t,n,r,a){super(e,t,n,r,a),this.type=5}_$AI(e,t=this){if((e=B(this,e,t,0)??F)===W)return;const n=this._$AH,r=e===F&&n!==F||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,a=e!==F&&(n===F||r);r&&this.element.removeEventListener(this.name,this,n),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ee{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){B(this,e)}}const te={I:q},ne=b.litHtmlPolyfillSupport;ne?.(V,q),(b.litHtmlVersions??=[]).push("3.3.2");const re=globalThis;let ae=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,n)=>{const r=n?.renderBefore??t;let a=r._$litPart$;if(void 0===a){const e=n?.renderBefore??null;r._$litPart$=a=new q(t.insertBefore(L(),e),e,void 0,n??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}};ae._$litElement$=!0,ae.finalized=!0,re.litElementHydrateSupport?.({LitElement:ae});const ie=re.litElementPolyfillSupport;ie?.({LitElement:ae}),(re.litElementVersions??=[]).push("4.2.2");const oe={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:y},se=(e=oe,t,n)=>{const{kind:r,metadata:a}=n;let i=globalThis.litPropertyMetadata.get(a);if(void 0===i&&globalThis.litPropertyMetadata.set(a,i=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),i.set(n.name,e),"accessor"===r){const{name:r}=n;return{set(n){const a=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,a,e,!0,n)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=n;return function(n){const a=this[r];t.call(this,n),this.requestUpdate(r,a,e,!0,n)}}throw Error("Unsupported decorator location: "+r)};function le(e){return(t,n)=>"object"==typeof n?se(e,t,n):((e,t,n)=>{const r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}const de="4.1.0",ce=30,ue=5,_e=15,me="cache_data_",he=0,pe="📅 Calendar Card Pro",fe=500,ge=200,ye=300,ve=3e5,we=100,be={WEEK:1,MONTH:1.5},Me=.2,ke={TOUCH_SIZE:100,POINTER_SIZE:50},De=["Germany","Deutschland","United States","USA","United States of America","United Kingdom","Great Britain","France","Italy","Italia","Spain","España","Netherlands","Nederland","Austria","Österreich","Switzerland","Schweiz"];function Ye(e){return"home-assistant"===e}const $e=/^person\.[a-z0-9_]+$/;function xe(e){return"string"==typeof e&&$e.test(e)}const Se=new Map;function Le(e,t){const n=`${e}|${t}`,r=Se.get(n);if(void 0!==r)return r;const a=function(e,t){if(e.startsWith("var("))return`color-mix(in srgb, ${e} ${t}%, transparent)`;if("transparent"===e)return e;const n=document.createElement("div");n.style.display="none",n.style.color=e,document.body.appendChild(n);const r=getComputedStyle(n).color;if(document.body.removeChild(n),!r)return e;const a=r.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);if(a){const[,e,n,r]=a;return`rgba(${e}, ${n}, ${r}, ${t/100})`}const i=r.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)$/);if(i){const[,e,n,r]=i;return`rgba(${e}, ${n}, ${r}, ${t/100})`}return e}(e,t);return Se.set(n,a),a}function Te(e){return/^[a-z][a-z0-9]*:[a-z0-9]/i.test(e)&&!e.startsWith("http")}function je(e){return"none"===e||"icon"===e||"image"===e||"text"===e}function He(e,t){return je(t)?t:function(e){return"string"!=typeof e||""===e?"none":Ye(e)?"icon":xe(e)?"image":Te(e)?"icon":e.startsWith("/")||/^https?:\/\//i.test(e)||/\.(apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(e)?"image":"text"}(e)}function ze(){return Math.random().toString(36).substring(2,15)}function Ee(e,t,n,r){const a=e.map((e=>"string"==typeof e?e:e.entity)).sort().join("_");let i="";if(n)try{i=n.includes("T")?n.split("T")[0]:n}catch(e){i=n}return function(e){let t=0;for(let n=0;n<e.length;n++){t=(t<<5)-t+e.charCodeAt(n),t|=0}return Math.abs(t).toString(36)}(`calendar_${a}_${t}${i?`_${i}`:""}${r?`_fdw${r}`:""}`)}const Oe=new Date(2e3,0,1,13,0,0);function Ae(e){try{return!new Intl.DateTimeFormat(e,{hour:"numeric"}).formatToParts(Oe).some((e=>"dayPeriod"===e.type))}catch(e){return}}function Ce(e,t=!0){var n;if(!e)return t;const r=()=>{var n;return e.language&&null!=(n=Ae(e.language))?n:t};if("24"===e.time_format)return!0;if("12"===e.time_format)return!1;if("language"===e.time_format&&e.language)return r();if("system"===e.time_format){const e="undefined"==typeof navigator?void 0:navigator.language;return null!=(n=e?Ae(e):void 0)?n:r()}return t}function Pe(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}const Ie=["title","time"],Ne=["subtle","outline","tinted","filled"];const We=["accent","text"],Fe="accent";var Ue=Object.defineProperty,Re=Object.defineProperties,Je=Object.getOwnPropertyDescriptors,Ve=Object.getOwnPropertySymbols,Be=Object.prototype.hasOwnProperty,Ke=Object.prototype.propertyIsEnumerable,qe=(e,t,n)=>t in e?Ue(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Ge=(e,t)=>{for(var n in t||(t={}))Be.call(t,n)&&qe(e,n,t[n]);if(Ve)for(var n of Ve(t))Ke.call(t,n)&&qe(e,n,t[n]);return e},Ze=(e,t)=>Re(e,Je(t));let Qe=!1;const Xe=he;function et(){const e=globalThis,t=e.calendarCardProLogLevel;return"number"==typeof t&&Number.isInteger(t)&&t>=0&&t<=3?t:!0===e.calendarCardProDebug?3:Xe}const tt={title:["background: #424242","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 20px 0 0 20px","font-size: 12px","font-weight: bold","padding: 4px 8px 4px 12px","margin: 5px 0"].join(";"),version:["background: #4fc3f7","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 0 20px 20px 0","font-size: 12px","font-weight: bold","padding: 4px 12px 4px 8px","margin: 5px 0"].join(";"),prefix:["color: #4fc3f7","font-weight: bold"].join(";"),error:["color: #f44336","font-weight: bold"].join(";"),warn:["color: #ff9800","font-weight: bold"].join(";")};function nt(e){!function(e){if(Qe)return;console.groupCollapsed(`%c${pe}%cv${e} `,tt.title,tt.version),console.log("%c Description: %c A calendar card that supports multiple calendars with individual styling. ","font-weight: bold","font-weight: normal"),console.log("%c GitHub: %c https://github.com/alexpfau/calendar-card-pro ","font-weight: bold","font-weight: normal"),console.groupEnd(),Qe=!0}(e)}function rt(e,t,...n){if(et()<0)return;const r=function(e){if(null==e)return;if("string"==typeof e)return e;if("object"==typeof e)try{return Ge({},e)}catch(t){try{return{value:JSON.stringify(e)}}catch(t){return{value:String(e)}}}return String(e)}(t);if(e instanceof Error){const t=e.message||"Unknown error",a="string"==typeof r?` during ${r}`:"",[i,o]=dt(`Error${a}: ${t}`,tt.error);console.error(i,o),e.stack&&console.error(e.stack),r&&"object"==typeof r&&console.error("Context:",Ze(Ge({},r),{timestamp:(new Date).toISOString()})),n.length>0&&console.error("Additional data:",...n)}else if("string"==typeof e){const t="string"==typeof r?` during ${r}`:"",[a,i]=dt(`${e}${t}`,tt.error);r&&"object"==typeof r?console.error(a,i,Ge({context:Ze(Ge({},r),{timestamp:(new Date).toISOString()})},n.length>0?{additionalData:n}:{})):n.length>0?console.error(a,i,...n):console.error(a,i)}else{const t="string"==typeof r?` during ${r}`:"",[a,i]=dt(`Unknown error${t}:`,tt.error);console.error(a,i,e),r&&"object"==typeof r&&console.error("Context:",Ze(Ge({},r),{timestamp:(new Date).toISOString()})),n.length>0&&console.error("Additional data:",...n)}}function at(e,...t){lt(1,e,tt.warn,console.warn,...t)}function it(e,...t){const[n,r]=dt(e,tt.warn);t.length>0?console.warn(n,r,...t):console.warn(n,r)}function ot(e,...t){lt(2,e,tt.prefix,console.log,...t)}function st(e,...t){lt(3,e,tt.prefix,console.log,...t)}function lt(e,t,n,r,...a){if(et()<e)return;const[i,o]=dt(t,n);a.length>0?r(i,o,...a):r(i,o)}function dt(e,t){return[`%c[${pe}] ${e}`,t]}var ct=Object.defineProperty,ut=Object.defineProperties,_t=Object.getOwnPropertyDescriptors,mt=Object.getOwnPropertySymbols,ht=Object.prototype.hasOwnProperty,pt=Object.prototype.propertyIsEnumerable,ft=(e,t,n)=>t in e?ct(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,gt=(e,t)=>{for(var n in t||(t={}))ht.call(t,n)&&ft(e,n,t[n]);if(mt)for(var n of mt(t))pt.call(t,n)&&ft(e,n,t[n]);return e},yt=(e,t)=>ut(e,_t(t));const vt={entities:[],view:"list",start_date:void 0,days_to_show:3,compact_days_to_show:void 0,compact_events_to_show:void 0,compact_events_complete_days:!1,show_empty_days:!1,hide_when_empty:!1,empty_day_text:void 0,filter_duplicates:!1,split_multiday_events:!1,event_type:"all",language:void 0,title:void 0,title_font_size:void 0,title_color:void 0,background_color:"var(--ha-card-background)",accent_color:"#03a9f4",vertical_line_width:"2px",day_spacing:"10px",event_spacing:"4px",additional_card_spacing:"0px",height:"auto",max_height:"none",first_day_of_week:"system",show_week_numbers:null,show_current_week_number:!0,week_number_font_size:"12px",week_number_color:"var(--primary-text-color)",week_number_background_color:"#03a9f450",day_separator_width:"0px",day_separator_color:"var(--secondary-text-color)",week_separator_width:"0px",week_separator_color:"#03a9f450",month_separator_width:"0px",month_separator_color:"var(--primary-text-color)",today_indicator:!1,today_indicator_position:"15% 50%",today_indicator_color:"#03a9f4",today_indicator_size:"6px",date_vertical_alignment:"middle",weekday_font_size:"14px",weekday_color:"var(--primary-text-color)",day_font_size:"26px",day_color:"var(--primary-text-color)",show_month:!0,month_font_size:"12px",month_color:"var(--primary-text-color)",weekend_weekday_color:void 0,weekend_day_color:void 0,weekend_month_color:void 0,today_weekday_color:void 0,today_day_color:void 0,today_month_color:void 0,event_background_opacity:0,show_past_events:!1,show_countdown:!1,show_countdown_allday:!0,show_progress_bar:!1,progress_bar_color:"var(--secondary-text-color)",progress_bar_height:"calc(var(--calendar-card-font-size-time) * 0.75)",progress_bar_width:void 0,event_icon_vertical_alignment:"top",event_font_size:"14px",event_color:"var(--primary-text-color)",empty_day_color:"var(--primary-text-color)",show_time:!0,show_single_allday_time:!0,show_multiday_allday_time:!0,allday_badge:"off",allday_badge_style:"subtle",allday_badge_color:"accent",time_24h:"system",time_two_digit_hours:!1,show_end_time:!0,time_font_size:"12px",time_color:"var(--secondary-text-color)",time_icon_size:"14px",time_max_lines:0,show_location:!0,show_location_allday:!0,remove_location_country:!1,location_font_size:"12px",location_color:"var(--secondary-text-color)",location_icon_size:"14px",location_max_lines:0,show_description:!1,show_description_allday:!0,title_max_lines:0,description_max_lines:0,description_font_size:"12px",description_color:"var(--secondary-text-color)",description_icon_size:"14px",weather:{entity:void 0,position:"date",date:{show_conditions:!0,show_high_temp:!0,show_low_temp:!1,show_uv_index:!1,uv_index_threshold:0,icon_size:"14px",font_size:"12px"},event:{show_conditions:!0,show_temp:!0,show_uv_index:!1,uv_index_threshold:0,daily_forecast_fallback:!0,max_lines:0,icon_size:"14px",font_size:"12px"}},tap_action:{action:"none"},hold_action:{action:"none"},refresh_interval:ce,refresh_on_navigate:!0,column:void 0};function wt(e,t=0){const n="string"==typeof e&&""!==e.trim()?Number(e):e;if("number"==typeof n&&Number.isFinite(n)&&!(n<t))return n}const bt={max_events_to_show:"compact_events_to_show",vertical_line_color:"accent_color",horizontal_line_width:"day_separator_width",horizontal_line_color:"day_separator_color",row_spacing:"day_spacing"},Mt={max_events_to_show:"compact_events_to_show"};function kt(e,t){const n=gt({},e);for(const[r,a]of Object.entries(t)){const t=e[r];n[r]=Pe(a)&&Pe(t)?kt(t,a):a}return n}function Dt(e,t){return Yt(vt[e],t,e)}function Yt(e,t,n){const r=function(e,t){return function(e){return"string"==typeof e&&/^-?\d+(?:\.\d+)?px$/.test(e)}(e)||void 0!==t&&$t.has(t)}(e,n);if(null==t)return r?e:t;const a=function(e){if("number"==typeof e)return Number.isFinite(e)?`${e}`:void 0;if("string"!=typeof e)return;const t=e.trim();return/^-?\d+(?:\.\d+)?$/.test(t)?t:void 0}(t);return void 0===a?t:r?`${a}px`:t}const $t=new Set(["title_font_size","progress_bar_width","progress_bar_height","height","max_height"]);function xt(e){return St(e,vt,!0),e}function St(e,t,n=!1){let r=!1;for(const a of Object.keys(e)){const i=e[a],o=t[a];if(Lt(i)&&Lt(o)){const t=gt({},i);St(t,o)&&(e[a]=t,r=!0);continue}const s=Yt(o,i,n?a:void 0);s!==i&&(e[a]=s,r=!0)}return r}function Lt(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function Tt(e){return JSON.stringify((e||[]).map((e=>{const t="string"==typeof e?{entity:e}:e;return Object.keys(t).sort().map((e=>[e,t[e]]))})))}const jt=["event_type"];const Ht={columns:"full",rows:"auto"};function zt(e){return{type:"custom:calendar-card-pro",entities:[...e],days_to_show:3,show_location:!0}}function Et(e){const t=function(e){if(!e||"object"!=typeof e)return null;if("states"in e&&"object"==typeof e.states){const t=Object.keys(e.states).find((e=>e.startsWith("calendar.")));if(t)return t}return Object.keys(e).find((e=>e.startsWith("calendar.")))||null}(e);return yt(gt({},zt(t?[t]:[])),{_description:t?void 0:"A calendar card that displays events from multiple calendars with individual styling. Add a calendar integration to Home Assistant to use this card."})}var Ot=Object.defineProperty,At=Object.getOwnPropertySymbols,Ct=Object.prototype.hasOwnProperty,Pt=Object.prototype.propertyIsEnumerable,It=(e,t,n)=>t in e?Ot(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Nt=(e,t)=>{for(var n in t||(t={}))Ct.call(t,n)&&It(e,n,t[n]);if(At)for(var n of At(t))Pt.call(t,n)&&It(e,n,t[n]);return e};const Wt=["show_empty_days","empty_day_text","split_multiday_events","show_past_events","filter_duplicates","vertical_line_width","event_spacing","day_spacing","additional_card_spacing","height","max_height","today_indicator","today_indicator_size","today_indicator_color","weekday_font_size","day_font_size","show_month","month_font_size","event_background_opacity","event_font_size","show_countdown","show_countdown_allday","show_progress_bar","progress_bar_height","progress_bar_width","event_icon_vertical_alignment","show_time","show_single_allday_time","show_multiday_allday_time","allday_badge","allday_badge_style","allday_badge_color","time_two_digit_hours","show_end_time","time_font_size","time_icon_size","time_max_lines","show_location","show_location_allday","remove_location_country","location_font_size","location_icon_size","location_max_lines","show_description","show_description_allday","title_max_lines","description_max_lines","description_font_size","description_icon_size","show_week_numbers","show_current_week_number","week_number_font_size","week_number_color","week_number_background_color","day_separator_width","day_separator_color","week_separator_width","week_separator_color","month_separator_width","month_separator_color"],Ft=["day_header_gap","day_header_separator_width","day_header_separator_color","min_day_width","min_days_to_show","min_days_fallback"],Ut=new Set([...Wt,...Ft]),Rt=new Set(["entities","start_date","days_to_show","first_day_of_week","weather","refresh_interval","refresh_on_navigate"]),Jt={day_header_gap:"8px",day_header_separator_width:"0px",day_header_separator_color:"var(--divider-color)",min_day_width:140,min_days_fallback:"list"};function Vt(e,t){const n=e.column;return n&&qt(n,t)?function(e,t){const n=Jt[e];if("number"==typeof n){const e="number"==typeof t?t:Number.parseFloat(String(t));return Number.isFinite(e)&&e>0?e:n}return String(Yt(n,t))}(t,n[t]):Jt[t]}function Bt(e){const t=/^([-+]?(?:\d*\.)?\d+)[a-z%]*$/i.exec(e.trim());return null!==t&&0===Number.parseFloat(t[1])}function Kt(e,t){const n=e.trim(),r=/^([-+]?(?:\d*\.)?\d+)([a-z%]*)$/i.exec(n);if(r){const e=r[2]||"px";return`${Number.parseFloat(r[1])*t}${e}`}return`calc(${t} * (${n}))`}function qt(e,t){return Object.prototype.hasOwnProperty.call(e,t)&&void 0!==e[t]}const Gt={show_empty_days:!0,split_multiday_events:!0};function Zt(e){return"column"!==e}function Qt(e){switch(e){case"column":return"column-view";case"list":return""}}function Xt(e,t){if("column"!==t)return e;const n=e.column,r=Nt({},Gt);if(n)for(const e of Wt)qt(n,e)&&(r[e]=Dt(e,n[e]));return Nt(Nt({},e),r)}function en(e){!function(e){for(const t of Ft)Object.prototype.hasOwnProperty.call(e,t)&&at(`Ignoring top-level "${t}": it is a column-view-only option and has no effect outside the "column:" block. Move it to "column: { ${t}: ... }".`)}(e);const t=e.column;if(t&&"object"==typeof t)for(const e of Object.keys(t))Ut.has(e)||(Rt.has(e)?at(`Ignoring "column.${e}": it determines which events are loaded from Home Assistant, so it cannot differ between views — switching views would have to refetch. Set "${e}" at the top level instead.`):Object.prototype.hasOwnProperty.call(vt,e)?at(`Ignoring "column.${e}": "${e}" is a valid top-level option but cannot be overridden per view. Set it at the top level instead.`):at(`Ignoring "column.${e}": not a recognized option.`))}function tn(e){return e.trim().startsWith("-")?vt.day_spacing:e}function nn(e,t){const n=/^(\d+(?:\.\d+)?)px$/.exec(tn(e).trim());return n?Number.parseFloat(n[1]):t}const rn=nn(vt.day_spacing,10);function an(e){const t=e.column,n=t&&qt(t,"day_spacing")?Dt("day_spacing",t.day_spacing):e.day_spacing;return nn(String(n),rn)}function on(e){return Math.max(1,Math.floor(e.days_to_show))}function sn(e,t){const n=an(e),r=Vt(e,"min_day_width")+n;if(r<=0)return 0;const a=Math.floor((t-32+n)/r+1e-9);return Math.max(0,Math.min(on(e),a))}function ln(e,t,n,r){const a=on(t);if("column"!==e)return{view:e,columns:0};if(null===n||n<=0)return{view:"column",columns:a};const i=Math.min(function(e){const t=on(e),n=e.column;if(!n||!qt(n,"min_days_to_show"))return t;const r=n.min_days_to_show,a="number"==typeof r?r:Number.parseFloat(String(r));return Number.isFinite(a)?Math.min(t,Math.max(1,Math.floor(a))):t}(t),a),o=r&&"column"===r.view?r.columns:0,s=function(e){const t=Vt(e,"min_day_width")+an(e);return Math.max(0,Math.min(16,(t-1)/2))}(t),l=sn(t,n);let d=l;return l>o?d=sn(t,n-s):l<o&&(d=sn(t,n+s)),d>=i?{view:"column",columns:Math.min(d,a)}:"cramp"===function(e){return"cramp"===Vt(e,"min_days_fallback")?"cramp":"list"}(t)?{view:"column",columns:i}:{view:"list",columns:0}}function dn(e,t,n,r){const a="hold"===n?t.hold_action:t.tap_action;if(!a)return;if("expand"===a.action)return r&&r(),void st("Executed expand action");const i={entity:function(e){if(!e||!e.length)return;const t=e[0];return"string"==typeof t?t:t.entity}(t.entities),tap_action:t.tap_action,hold_action:t.hold_action},o=new Event("hass-action",{bubbles:!0,composed:!0});o.detail={config:i,action:n},e.dispatchEvent(o),st(`Delegated ${n} action (${a.action}) to HA native handler`)}function cn(e){e.style.opacity="0",e.style.transition=`opacity ${ye}ms ease-out`,setTimeout((()=>{e.parentNode&&(e.parentNode.removeChild(e),st("Removed hold indicator"))}),ye)}const un=1,_n=2,mn=e=>(...t)=>({_$litDirective$:e,values:t});let hn=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const pn=mn(class extends hn{constructor(e){if(super(e),e.type!==un||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter((t=>e[t])).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter((e=>""!==e))));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const n=e.element.classList;for(const e of this.st)e in t||(n.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(n.add(e),this.st.add(e)):(n.remove(e),this.st.delete(e)))}return W}}),{I:fn}=te,gn=()=>document.createComment(""),yn=(e,t,n)=>{const r=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===n){const t=r.insertBefore(gn(),a),i=r.insertBefore(gn(),a);n=new fn(t,i,e,e.options)}else{const t=n._$AB.nextSibling,i=n._$AM,o=i!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,void 0!==n._$AP&&(t=e._$AU)!==i._$AU&&n._$AP(t)}if(t!==a||o){let e=n._$AA;for(;e!==t;){const t=e.nextSibling;r.insertBefore(e,a),e=t}}}return n},vn=(e,t,n=e)=>(e._$AI(t,n),e),wn={},bn=(e,t=wn)=>e._$AH=t,Mn=e=>{e._$AR(),e._$AA.remove()},kn=(e,t,n)=>{const r=new Map;for(let a=t;a<=n;a++)r.set(e[a],a);return r},Dn=mn(class extends hn{constructor(e){if(super(e),e.type!==_n)throw Error("repeat() can only be used in text expressions")}dt(e,t,n){let r;void 0===n?n=t:void 0!==t&&(r=t);const a=[],i=[];let o=0;for(const t of e)a[o]=r?r(t,o):o,i[o]=n(t,o),o++;return{values:i,keys:a}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,r]){const a=(e=>e._$AH)(e),{values:i,keys:o}=this.dt(t,n,r);if(!Array.isArray(a))return this.ut=o,i;const s=this.ut??=[],l=[];let d,c,u=0,_=a.length-1,m=0,h=i.length-1;for(;u<=_&&m<=h;)if(null===a[u])u++;else if(null===a[_])_--;else if(s[u]===o[m])l[m]=vn(a[u],i[m]),u++,m++;else if(s[_]===o[h])l[h]=vn(a[_],i[h]),_--,h--;else if(s[u]===o[h])l[h]=vn(a[u],i[h]),yn(e,l[h+1],a[u]),u++,h--;else if(s[_]===o[m])l[m]=vn(a[_],i[m]),yn(e,a[u],a[_]),_--,m++;else if(void 0===d&&(d=kn(o,m,h),c=kn(s,u,_)),d.has(s[u]))if(d.has(s[_])){const t=c.get(o[m]),n=void 0!==t?a[t]:null;if(null===n){const t=yn(e,a[u]);vn(t,i[m]),l[m]=t}else l[m]=vn(n,i[m]),yn(e,a[u],n),a[t]=null;m++}else Mn(a[_]),_--;else Mn(a[u]),u++;for(;m<=h;){const t=yn(e,l[h+1]);vn(t,i[m]),l[m++]=t}for(;u<=_;){const e=a[u++];null!==e&&Mn(e)}return this.ut=o,bn(e,l),W}}),Yn="important",$n=" !"+Yn,xn=mn(class extends hn{constructor(e){if(super(e),e.type!==un||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce(((t,n)=>{const r=e[n];return null==r?t:t+`${n=n.includes("-")?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`}),"")}update(e,[t]){const{style:n}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?n.removeProperty(e):n[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith($n);e.includes("-")||t?n.setProperty(e,t?r.slice(0,-11):r,t?Yn:""):n[e]=r}}return W}});var Sn={daysOfWeek:["нед.","пон.","вт.","ср.","четв.","пет.","съб."],fullDaysOfWeek:["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"],months:["ян.","фев.","мар","апр.","май","юни","юли","авг.","септ.","окт.","ноем.","дек."],allDay:"цял ден",multiDay:"до",at:"в",endsToday:"приключва днес",endsTomorrow:"приключва утре",noEvents:"Няма планирани събития",loading:"Зареждане на календара със събития...",error:"Грешка: календарът не е намерен или не е конфигуриран правилно"},Ln={daysOfWeek:["Dg","Dl","Dm","Dc","Dj","Dv","Ds"],fullDaysOfWeek:["Diumenge","Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte"],months:["Gen","Febr","Març","Abr","Maig","Juny","Jul","Ag","Set","Oct","Nov","Des"],allDay:"tot el dia",multiDay:"fins a",at:"a les",endsToday:"acaba avui",endsTomorrow:"acaba damà",noEvents:"Cap event proper",loading:"Carregant events...",error:"Error: No s'ha trobat l'entitat del calendari o aquesta està mal configurada"},Tn={daysOfWeek:["Ne","Po","Út","St","Čt","Pá","So"],fullDaysOfWeek:["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"],months:["Led","Úno","Bře","Dub","Kvě","Čvn","Čvc","Srp","Zář","Říj","Lis","Pro"],allDay:"celý den",multiDay:"do",at:"v",endsToday:"končí dnes",endsTomorrow:"končí zítra",noEvents:"Žádné nadcházející události",loading:"Načítání událostí z kalendáře...",error:"Chyba: Entita kalendáře nebyla nalezena nebo je nesprávně nakonfigurována"},jn={daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dagen",multiDay:"indtil",at:"kl.",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",noEvents:"Ingen kommende begivenheder",loading:"Indlæser kalenderbegivenheder...",error:"Fejl: Kalenderenheden blev ikke fundet eller er ikke konfigureret korrekt"},Hn={daysOfWeek:["So","Mo","Di","Mi","Do","Fr","Sa"],fullDaysOfWeek:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],months:["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],allDay:"ganztägig",multiDay:"bis",at:"um",endsToday:"endet heute",endsTomorrow:"endet morgen",noEvents:"Keine anstehenden Termine",loading:"Kalendereinträge werden geladen...",error:"Fehler: Kalender-Entität nicht gefunden oder falsch konfiguriert"},zn={daysOfWeek:["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"],fullDaysOfWeek:["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],months:["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"],allDay:"Ολοήμερο",multiDay:"έως",at:"στις",endsToday:"λήγει σήμερα",endsTomorrow:"λήγει αύριο",noEvents:"Δεν υπάρχουν προγραμματισμένα γεγονότα",loading:"Φόρτωση ημερολογίου...",error:"Σφάλμα: Η οντότητα ημερολογίου δεν βρέθηκε ή δεν έχει ρυθμιστεί σωστά"},En={daysOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fullDaysOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],allDay:"all day",multiDay:"until",at:"at",endsToday:"ends today",endsTomorrow:"ends tomorrow",noEvents:"No upcoming events",loading:"Loading calendar events...",error:"Error: Calendar entity not found or improperly configured"},On={daysOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fullDaysOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],allDay:"all day",multiDay:"until",at:"at",endsToday:"ends today",endsTomorrow:"ends tomorrow",noEvents:"No upcoming events",loading:"Loading calendar events...",error:"Error: Calendar entity not found or improperly configured"},An={daysOfWeek:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],fullDaysOfWeek:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],months:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],allDay:"todo el día",multiDay:"hasta",at:"a las",endsToday:"termina hoy",endsTomorrow:"termina mañana",noEvents:"No hay eventos próximos",loading:"Cargando eventos del calendario...",error:"Error: La entidad del calendario no se encontró o está mal configurada"},Cn={daysOfWeek:["P","E","T","K","N","R","L"],fullDaysOfWeek:["pühapäev","esmaspäev","teisipäev","kolmapäev","neljapäev","reede","laupäev"],months:["Jaan","Veebr","Märts","Apr","Mai","Juuni","Juuli","Aug","Sept","Okt","Nov","Dets"],allDay:"kogu päev",multiDay:"kuni",at:"kell",endsToday:"lõpeb täna",endsTomorrow:"lõpeb homme",noEvents:"Tulevasi sündmusi pole",loading:"Kalendrisündmuste laadimine...",error:"Viga: kalendri entiteeti ei leitud või see on valesti seadistatud"},Pn={daysOfWeek:["Su","Ma","Ti","Ke","To","Pe","La"],fullDaysOfWeek:["Sunnuntai","Maanantai","Tiistai","Keskiviikko","Torstai","Perjantai","Lauantai"],months:["Tammi","Helmi","Maalis","Huhti","Touko","Kesä","Heinä","Elo","Syys","Loka","Marras","Joulu"],allDay:"koko päivä",multiDay:"asti",at:"klo",endsToday:"päättyy tänään",endsTomorrow:"päättyy huomenna",noEvents:"Ei tulevia tapahtumia",loading:"Ladataan kalenteritapahtumia...",error:"Virhe: Kalenteriyksikköä ei löydy tai se on väärin määritetty"},In={daysOfWeek:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],fullDaysOfWeek:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],months:["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"],allDay:"toute la journée",multiDay:"jusqu'au",at:"à",endsToday:"finit aujourd'hui",endsTomorrow:"finit demain",noEvents:"Aucun événement à venir",loading:"Chargement des événements...",error:"Erreur: Entité de calendrier introuvable ou mal configurée"},Nn={daysOfWeek:["א'","ב'","ג'","ד'","ה'","ו'","ש'"],fullDaysOfWeek:["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"],months:["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"],allDay:"כל-היום",multiDay:"עד",endsToday:"מסתיים היום",endsTomorrow:"מסתיים מחר",at:"בשעה",noEvents:"אין אירועים קרובים",loading:"טוען אירועי לוח שנה...",error:"שגיאה: ישות לוח השנה לא נמצאה או לא מוגדרת כראוי"},Wn={daysOfWeek:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"],fullDaysOfWeek:["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"],months:["Sij","Velj","Ožu","Tra","Svi","Lip","Srp","Kol","Ruj","Lis","Stu","Pro"],allDay:"cijeli dan",multiDay:"do",at:"u",endsToday:"završava danas",endsTomorrow:"završava sutra",noEvents:"Nema nadolazećih događaja",loading:"Učitavanje događaja...",error:"Greška: Kalendar entitet nije pronađen ili je neispravno postavljen"},Fn={daysOfWeek:["Vas","Hét","Kedd","Sze","Csüt","Pén","Szo"],fullDaysOfWeek:["Vasárnap","Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat"],months:["Jan","Feb","Már","Ápr","Máj","Jún","Júl","Aug","Szep","Okt","Nov","Dec"],allDay:"egész napos",multiDay:"eddig:",endsToday:"ma este ér véget",endsTomorrow:"holnap ér véget",at:"itt:",noEvents:"Mára nincs több esemény",loading:"Naptárbejegyzések betöltése...",error:"Hiba: Naptár entitás nem található vagy nem megfelelően konfigutált"},Un={daysOfWeek:["Sun","Mán","Þri","Mið","Fim","Fös","Lau"],fullDaysOfWeek:["sunnudagur","mánudagur","þriðjudagur","miðvikudagur","fimmtudagur","föstudagur","laugardagur"],months:["Jan","Feb","Mar","Apr","Maí","Jún","Júl","Ágú","Sep","Okt","Nóv","Des"],allDay:"Allur dagurinn",multiDay:"þar til",at:"kl",endsToday:"lýkur í dag",endsTomorrow:"lýkur á morgun",noEvents:"Engir viðburðir á næstunni",loading:"Hleður inn dagatal...",error:"Villa: Dagatalseining finnst ekki eða er vanstillt"},Rn={daysOfWeek:["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],fullDaysOfWeek:["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],months:["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"],allDay:"tutto il giorno",multiDay:"fino a",at:"alle",endsToday:"termina oggi",endsTomorrow:"termina domani",noEvents:"Nessun evento in arrivo",loading:"Caricamento eventi del calendario...",error:"Errore: entità calendario non trovata o configurata in modo errato"},Jn={daysOfWeek:["Sek","Pir","Ant","Tre","Ket","Pen","Šeš"],fullDaysOfWeek:["Sekmadienis","Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis"],months:["Sau","Vas","Kov","Bal","Geg","Bir","Lie","Rgp","Rgs","Spa","Lap","Grd"],allDay:"visą dieną",multiDay:"iki",at:"į",endsToday:"baigiasi šiandien",endsTomorrow:"baigiasi rytoj",noEvents:"Nėra įvykių",loading:"Įkeliami kalendoriaus įvykiai...",error:"Klaida: Kalendoriaus objektas nerastas arba neteisingai sukonfigūruotas"};const Vn={bg:Sn,cs:Tn,ca:Ln,da:jn,de:Hn,el:zn,en:On,"en-gb":En,es:An,et:Cn,fi:Pn,fr:In,he:Nn,hr:Wn,hu:Fn,is:Un,it:Rn,lt:Jn,lv:{daysOfWeek:["Sv","Pr","Ot","Tr","Ce","Pk","Se"],fullDaysOfWeek:["Svētdiena","Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena","Sestdiena"],months:["Jan","Feb","Mar","Apr","Mai","Jūn","Jūl","Aug","Sep","Okt","Nov","Dec"],allDay:"visu dienu",multiDay:"līdz",at:"plkst.",endsToday:"beidzas šodien",endsTomorrow:"beidzas rīt",noEvents:"Nav gaidāmu notikumu",loading:"Ielādē kalendāra notikumus...",error:"Kļūda: Kalendāra entitīja nav atrasta vai nav pareizi konfigurēta"},nb:{daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],months:["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],allDay:"hele dagen",multiDay:"til",at:"kl. ",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",noEvents:"Ingen kommende hendelser",loading:"Laster kalenderhendelser...",error:"Feil: Kalenderenheten ble ikke funnet eller er ikke konfigurert riktig"},nl:{daysOfWeek:["Zo","Ma","Di","Wo","Do","Vr","Za"],fullDaysOfWeek:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],months:["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dag",multiDay:"tot",at:"om",endsToday:"eindigt vandaag",endsTomorrow:"eindigt morgen",noEvents:"Geen afspraken gepland",loading:"Kalender afspraken laden...",error:"Fout: Kalender niet gevonden of verkeerd geconfigureerd"},nn:{daysOfWeek:["Søn","Mån","Tys","Ons","Tor","Fre","Lau"],fullDaysOfWeek:["søndag","måndag","tysdag","onsdag","torsdag","fredag","laurdag"],months:["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],allDay:"heile dagen",multiDay:"til",at:"kl. ",endsToday:"sluttar i dag",endsTomorrow:"sluttar i morgon",noEvents:"Ingen kommande hendingar",loading:"Lastar kalenderhendingar...",error:"Feil: Kalendereininga vart ikkje funnen eller er ikkje konfigurert riktig"},pl:{daysOfWeek:["Nd","Pn","Wt","Śr","Cz","Pt","Sb"],fullDaysOfWeek:["niedzieli","poniedziałku","wtorku","środy","czwartku","piątku","soboty"],months:["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"],allDay:"cały dzień",multiDay:"do",at:"o",endsToday:"kończy się dziś",endsTomorrow:"kończy się jutro",noEvents:"Brak nadchodzących wydarzeń",loading:"Ładowanie wydarzeń z kalendarza...",error:"Błąd: encja kalendarza nie została znaleziona lub jest niepoprawnie skonfigurowana"},pt:{daysOfWeek:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],fullDaysOfWeek:["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],months:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],allDay:"o dia todo",multiDay:"até",at:"às",endsToday:"termina hoje",endsTomorrow:"termina amanhã",noEvents:"Nenhum evento próximo",loading:"Carregando eventos do calendário...",error:"Erro: A entidade do calendário não foi encontrada ou está configurada incorretamente"},ro:{daysOfWeek:["Du","Lu","Ma","Mi","Jo","Vi","Sâ"],fullDaysOfWeek:["Duminică","Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă"],months:["Ian","Feb","Mart","Apr","Mai","Iun","Iul","Aug","Sept","Oct","Nov","Dec"],allDay:"toată ziua",multiDay:"până la",at:"la",endsToday:"se încheie astăzi",endsTomorrow:"se încheie mâine",noEvents:"Nu sunt evenimente viitoare",loading:"Încărcare evenimente de calendar...",error:"Eroare: Entitatea de calendar nu a fost găsită sau este configurată incorect"},ru:{daysOfWeek:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["воскресенья","понедельника","вторника","среды","четверга","пятницы","субботы"],months:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],allDay:"весь день",multiDay:"до",at:"в",endsToday:"заканчивается сегодня",endsTomorrow:"заканчивается завтра",noEvents:"Нет предстоящих событий",loading:"Загрузка событий календаря...",error:"Ошибка: Объект календарь, не найден или неправильно настроен"},sl:{daysOfWeek:["ned","pon","tor","sre","čet","pet","sob"],fullDaysOfWeek:["nedelja","ponedeljek","torek","sreda","četrtek","petek","sobota"],months:["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],allDay:"cel dan",multiDay:"do",at:"ob",endsToday:"konča se danes",endsTomorrow:"konča se jutri",noEvents:"Ni planiranih dogodkov",loading:"Nalagam dogodke...",error:"Napaka: Entiteta ni bila najdena ali pa je nepravilno konfigurirana."},sk:{daysOfWeek:["Ne","Po","Ut","St","Št","Pi","So"],fullDaysOfWeek:["Nedeľa","Pondelok","Utorok","Streda","Štvrtok","Piatok","Sobota"],months:["Jan","Feb","Mar","Apr","Máj","Jún","Júl","Aug","Sep","Okt","Nov","Dec"],allDay:"celý deň",multiDay:"do",at:"v",endsToday:"končí dnes",endsTomorrow:"končí zajtra",noEvents:"Žiadne udalosti",loading:"Načítavam udalosti z kalendára...",error:"Chyba: Entita kalendára nebola nájdená alebo je nesprávne nakonfigurovaná"},sv:{daysOfWeek:["Sön","Mån","Tis","Ons","Tors","Fre","Lör"],fullDaysOfWeek:["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"heldag",multiDay:"till",at:"vid",endsToday:"slutar idag",endsTomorrow:"slutar imorgon",noEvents:"Inga kommande händelser",loading:"Laddar kalenderhändelser...",error:"Fel: Kalenderentiteten hittades inte eller är felaktigt konfigurerad."},uk:{daysOfWeek:["Нд","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["неділі","понеділка","вівторка","середи","четверга","п'ятниці","суботи"],months:["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"],allDay:"весь день",multiDay:"до",at:"об",endsToday:"закінчується сьогодні",endsTomorrow:"закінчується завтра",noEvents:"Немає майбутніх подій",loading:"Завантаження подій календаря...",error:"Помилка: Cутність календаря не знайдено або налаштовано неправильно"},vi:{daysOfWeek:["CN","T.2","T.3","T.4","T.5","T.6","T.7"],fullDaysOfWeek:["chủ nhật","thứ hai","thứ ba","thứ tư","thứ năm","thứ sáu","thứ bảy"],months:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],allDay:"cả ngày",multiDay:"đến",at:"lúc",endsToday:"kết thúc hôm nay",endsTomorrow:"kết thúc ngày mai",noEvents:"Không có sự kiện sắp tới",loading:"Đang tải sự kiện...",error:"Lỗi: Không tìm thấy lịch hoặc cấu hình không đúng"},th:{daysOfWeek:["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],fullDaysOfWeek:["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"],months:["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],allDay:"ตลอดวัน",multiDay:"ถึง",at:"เวลา",endsToday:"สิ้นสุดวันนี้",endsTomorrow:"สิ้นสุดพรุ่งนี้",noEvents:"ไม่มีเหตุการณ์ที่กำลังจะเกิดขึ้น",loading:"กำลังโหลดเหตุการณ์ปฏิทิน...",error:"ข้อผิดพลาด: ไม่พบเอนทิตีปฏิทินหรือมีการตั้งค่าที่ไม่ถูกต้อง"},tr:{daysOfWeek:["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],fullDaysOfWeek:["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],months:["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],allDay:"tüm gün",multiDay:"değin",at:"da",endsToday:"bugün sona eriyor",endsTomorrow:"yarın sona eriyor",noEvents:"Yaklaşan etkinlik yok",loading:"Takvim etkinlikleri yükleniyor...",error:"Hata: Takvim içeriği bulunamadı veya yanlış yapılandırılmış"},"zh-cn":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"在",endsToday:"今天结束",endsTomorrow:"明天结束",noEvents:"没有即将到来的活动",loading:"正在加载日历事件...",error:"错误：找不到日历实体或配置不正确"},"zh-tw":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"在",endsToday:"今天結束",endsTomorrow:"明天結束",noEvents:"沒有即將到來的活動",loading:"正在加載日曆事件...",error:"錯誤：找不到日曆實體或配置不正確"}},Bn="en",Kn=new Map;function qn(e,t){const n=`${e||""}:${(null==t?void 0:t.language)||""}`;if(Kn.has(n))return Kn.get(n);let r;if(e&&""!==e.trim()){const t=e.toLowerCase();if(Vn[t])return r=t,Kn.set(n,r),r}if(null==t?void 0:t.language){const e=t.language.toLowerCase();if(Vn[e])return r=e,Kn.set(n,r),r;const a=e.split(/[-_]/)[0];if(a!==e&&Vn[a])return r=a,Kn.set(n,r),r}return r=Bn,Kn.set(n,r),r}function Gn(e){const t=(null==e?void 0:e.toLowerCase())||Bn;return Vn[t]||Vn[Bn]}function Zn(e){const t=(null==e?void 0:e.toLowerCase())||"";return"de"===t||"hr"===t?"day-dot-month":"en"===t||"hu"===t?"month-day":"day-month"}function Qn(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Xn,er={exports:{}};function tr(){return Xn||(Xn=1,er.exports=function(){var e=1e3,t=6e4,n=36e5,r="millisecond",a="second",i="minute",o="hour",s="day",l="week",d="month",c="quarter",u="year",_="date",m="Invalid Date",h=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,p=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,f={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],n=e%100;return"["+e+(t[(n-20)%10]||t[n]||t[0])+"]"}},g=function(e,t,n){var r=String(e);return!r||r.length>=t?e:""+Array(t+1-r.length).join(n)+e},y={s:g,z:function(e){var t=-e.utcOffset(),n=Math.abs(t),r=Math.floor(n/60),a=n%60;return(t<=0?"+":"-")+g(r,2,"0")+":"+g(a,2,"0")},m:function e(t,n){if(t.date()<n.date())return-e(n,t);var r=12*(n.year()-t.year())+(n.month()-t.month()),a=t.clone().add(r,d),i=n-a<0,o=t.clone().add(r+(i?-1:1),d);return+(-(r+(n-a)/(i?a-o:o-a))||0)},a:function(e){return e<0?Math.ceil(e)||0:Math.floor(e)},p:function(e){return{M:d,y:u,w:l,d:s,D:_,h:o,m:i,s:a,ms:r,Q:c}[e]||String(e||"").toLowerCase().replace(/s$/,"")},u:function(e){return void 0===e}},v="en",w={};w[v]=f;var b="$isDayjsObject",M=function(e){return e instanceof $||!(!e||!e[b])},k=function e(t,n,r){var a;if(!t)return v;if("string"==typeof t){var i=t.toLowerCase();w[i]&&(a=i),n&&(w[i]=n,a=i);var o=t.split("-");if(!a&&o.length>1)return e(o[0])}else{var s=t.name;w[s]=t,a=s}return!r&&a&&(v=a),a||!r&&v},D=function(e,t){if(M(e))return e.clone();var n="object"==typeof t?t:{};return n.date=e,n.args=arguments,new $(n)},Y=y;Y.l=k,Y.i=M,Y.w=function(e,t){return D(e,{locale:t.$L,utc:t.$u,x:t.$x,$offset:t.$offset})};var $=function(){function f(e){this.$L=k(e.locale,null,!0),this.parse(e),this.$x=this.$x||e.x||{},this[b]=!0}var g=f.prototype;return g.parse=function(e){this.$d=function(e){var t=e.date,n=e.utc;if(null===t)return new Date(NaN);if(Y.u(t))return new Date;if(t instanceof Date)return new Date(t);if("string"==typeof t&&!/Z$/i.test(t)){var r=t.match(h);if(r){var a=r[2]-1||0,i=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],a,r[3]||1,r[4]||0,r[5]||0,r[6]||0,i)):new Date(r[1],a,r[3]||1,r[4]||0,r[5]||0,r[6]||0,i)}}return new Date(t)}(e),this.init()},g.init=function(){var e=this.$d;this.$y=e.getFullYear(),this.$M=e.getMonth(),this.$D=e.getDate(),this.$W=e.getDay(),this.$H=e.getHours(),this.$m=e.getMinutes(),this.$s=e.getSeconds(),this.$ms=e.getMilliseconds()},g.$utils=function(){return Y},g.isValid=function(){return!(this.$d.toString()===m)},g.isSame=function(e,t){var n=D(e);return this.startOf(t)<=n&&n<=this.endOf(t)},g.isAfter=function(e,t){return D(e)<this.startOf(t)},g.isBefore=function(e,t){return this.endOf(t)<D(e)},g.$g=function(e,t,n){return Y.u(e)?this[t]:this.set(n,e)},g.unix=function(){return Math.floor(this.valueOf()/1e3)},g.valueOf=function(){return this.$d.getTime()},g.startOf=function(e,t){var n=this,r=!!Y.u(t)||t,c=Y.p(e),m=function(e,t){var a=Y.w(n.$u?Date.UTC(n.$y,t,e):new Date(n.$y,t,e),n);return r?a:a.endOf(s)},h=function(e,t){return Y.w(n.toDate()[e].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(t)),n)},p=this.$W,f=this.$M,g=this.$D,y="set"+(this.$u?"UTC":"");switch(c){case u:return r?m(1,0):m(31,11);case d:return r?m(1,f):m(0,f+1);case l:var v=this.$locale().weekStart||0,w=(p<v?p+7:p)-v;return m(r?g-w:g+(6-w),f);case s:case _:return h(y+"Hours",0);case o:return h(y+"Minutes",1);case i:return h(y+"Seconds",2);case a:return h(y+"Milliseconds",3);default:return this.clone()}},g.endOf=function(e){return this.startOf(e,!1)},g.$set=function(e,t){var n,l=Y.p(e),c="set"+(this.$u?"UTC":""),m=(n={},n[s]=c+"Date",n[_]=c+"Date",n[d]=c+"Month",n[u]=c+"FullYear",n[o]=c+"Hours",n[i]=c+"Minutes",n[a]=c+"Seconds",n[r]=c+"Milliseconds",n)[l],h=l===s?this.$D+(t-this.$W):t;if(l===d||l===u){var p=this.clone().set(_,1);p.$d[m](h),p.init(),this.$d=p.set(_,Math.min(this.$D,p.daysInMonth())).$d}else m&&this.$d[m](h);return this.init(),this},g.set=function(e,t){return this.clone().$set(e,t)},g.get=function(e){return this[Y.p(e)]()},g.add=function(r,c){var _,m=this;r=Number(r);var h=Y.p(c),p=function(e){var t=D(m);return Y.w(t.date(t.date()+Math.round(e*r)),m)};if(h===d)return this.set(d,this.$M+r);if(h===u)return this.set(u,this.$y+r);if(h===s)return p(1);if(h===l)return p(7);var f=(_={},_[i]=t,_[o]=n,_[a]=e,_)[h]||1,g=this.$d.getTime()+r*f;return Y.w(g,this)},g.subtract=function(e,t){return this.add(-1*e,t)},g.format=function(e){var t=this,n=this.$locale();if(!this.isValid())return n.invalidDate||m;var r=e||"YYYY-MM-DDTHH:mm:ssZ",a=Y.z(this),i=this.$H,o=this.$m,s=this.$M,l=n.weekdays,d=n.months,c=n.meridiem,u=function(e,n,a,i){return e&&(e[n]||e(t,r))||a[n].slice(0,i)},_=function(e){return Y.s(i%12||12,e,"0")},h=c||function(e,t,n){var r=e<12?"AM":"PM";return n?r.toLowerCase():r};return r.replace(p,(function(e,r){return r||function(e){switch(e){case"YY":return String(t.$y).slice(-2);case"YYYY":return Y.s(t.$y,4,"0");case"M":return s+1;case"MM":return Y.s(s+1,2,"0");case"MMM":return u(n.monthsShort,s,d,3);case"MMMM":return u(d,s);case"D":return t.$D;case"DD":return Y.s(t.$D,2,"0");case"d":return String(t.$W);case"dd":return u(n.weekdaysMin,t.$W,l,2);case"ddd":return u(n.weekdaysShort,t.$W,l,3);case"dddd":return l[t.$W];case"H":return String(i);case"HH":return Y.s(i,2,"0");case"h":return _(1);case"hh":return _(2);case"a":return h(i,o,!0);case"A":return h(i,o,!1);case"m":return String(o);case"mm":return Y.s(o,2,"0");case"s":return String(t.$s);case"ss":return Y.s(t.$s,2,"0");case"SSS":return Y.s(t.$ms,3,"0");case"Z":return a}return null}(e)||a.replace(":","")}))},g.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},g.diff=function(r,_,m){var h,p=this,f=Y.p(_),g=D(r),y=(g.utcOffset()-this.utcOffset())*t,v=this-g,w=function(){return Y.m(p,g)};switch(f){case u:h=w()/12;break;case d:h=w();break;case c:h=w()/3;break;case l:h=(v-y)/6048e5;break;case s:h=(v-y)/864e5;break;case o:h=v/n;break;case i:h=v/t;break;case a:h=v/e;break;default:h=v}return m?h:Y.a(h)},g.daysInMonth=function(){return this.endOf(d).$D},g.$locale=function(){return w[this.$L]},g.locale=function(e,t){if(!e)return this.$L;var n=this.clone(),r=k(e,t,!0);return r&&(n.$L=r),n},g.clone=function(){return Y.w(this.$d,this)},g.toDate=function(){return new Date(this.valueOf())},g.toJSON=function(){return this.isValid()?this.toISOString():null},g.toISOString=function(){return this.$d.toISOString()},g.toString=function(){return this.$d.toUTCString()},f}(),x=$.prototype;return D.prototype=x,[["$ms",r],["$s",a],["$m",i],["$H",o],["$W",s],["$M",d],["$y",u],["$D",_]].forEach((function(e){x[e[1]]=function(t){return this.$g(t,e[0],e[1])}})),D.extend=function(e,t){return e.$i||(e(t,$,D),e.$i=!0),D},D.locale=k,D.isDayjs=M,D.unix=function(e){return D(1e3*e)},D.en=w[v],D.Ls=w,D.p={},D}()),er.exports}var nr,rr=Qn(tr()),ar={exports:{}};var ir,or=(nr||(nr=1,ar.exports=function(e,t,n){e=e||{};var r=t.prototype,a={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function i(e,t,n,a){return r.fromToBase(e,t,n,a)}n.en.relativeTime=a,r.fromToBase=function(t,r,i,o,s){for(var l,d,c,u=i.$locale().relativeTime||a,_=e.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],m=_.length,h=0;h<m;h+=1){var p=_[h];p.d&&(l=o?n(t).diff(i,p.d,!0):i.diff(t,p.d,!0));var f=(e.rounding||Math.round)(Math.abs(l));if(c=l>0,f<=p.r||!p.r){f<=1&&h>0&&(p=_[h-1]);var g=u[p.l];s&&(f=s(""+f)),d="string"==typeof g?g.replace("%d",f):g(f,r,p.l,c);break}}if(r)return d;var y=c?u.future:u.past;return"function"==typeof y?y(d):y.replace("%s",d)},r.to=function(e,t){return i(e,t,this,!0)},r.from=function(e,t){return i(e,t,this)};var o=function(e){return e.$u?n.utc():n()};r.toNow=function(e){return this.to(o(this),e)},r.fromNow=function(e){return this.from(o(this),e)}}),ar.exports),sr=Qn(or),lr={exports:{}};ir||(ir=1,lr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"bg",weekdays:"неделя_понеделник_вторник_сряда_четвъртък_петък_събота".split("_"),weekdaysShort:"нед_пон_вто_сря_чет_пет_съб".split("_"),weekdaysMin:"нд_пн_вт_ср_чт_пт_сб".split("_"),months:"януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември".split("_"),monthsShort:"яну_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек".split("_"),weekStart:1,ordinal:function(e){var t=e%100;if(t>10&&t<20)return e+"-ти";var n=e%10;return 1===n?e+"-ви":2===n?e+"-ри":7===n||8===n?e+"-ми":e+"-ти"},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"D.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},relativeTime:{future:"след %s",past:"преди %s",s:"няколко секунди",m:"минута",mm:"%d минути",h:"час",hh:"%d часа",d:"ден",dd:"%d дена",M:"месец",MM:"%d месеца",y:"година",yy:"%d години"}};return n.default.locale(r,null,!0),r}(tr()));var dr,cr={exports:{}};dr||(dr=1,cr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"ca",weekdays:"Diumenge_Dilluns_Dimarts_Dimecres_Dijous_Divendres_Dissabte".split("_"),weekdaysShort:"Dg._Dl._Dt._Dc._Dj._Dv._Ds.".split("_"),weekdaysMin:"Dg_Dl_Dt_Dc_Dj_Dv_Ds".split("_"),months:"Gener_Febrer_Març_Abril_Maig_Juny_Juliol_Agost_Setembre_Octubre_Novembre_Desembre".split("_"),monthsShort:"Gen._Febr._Març_Abr._Maig_Juny_Jul._Ag._Set._Oct._Nov._Des.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM [de] YYYY",LLL:"D MMMM [de] YYYY [a les] H:mm",LLLL:"dddd D MMMM [de] YYYY [a les] H:mm",ll:"D MMM YYYY",lll:"D MMM YYYY, H:mm",llll:"ddd D MMM YYYY, H:mm"},relativeTime:{future:"d'aquí %s",past:"fa %s",s:"uns segons",m:"un minut",mm:"%d minuts",h:"una hora",hh:"%d hores",d:"un dia",dd:"%d dies",M:"un mes",MM:"%d mesos",y:"un any",yy:"%d anys"},ordinal:function(e){return e+(1===e||3===e?"r":2===e?"n":4===e?"t":"è")}};return n.default.locale(r,null,!0),r}(tr()));var ur,_r={exports:{}};ur||(ur=1,_r.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function r(e){return e>1&&e<5&&1!=~~(e/10)}function a(e,t,n,a){var i=e+" ";switch(n){case"s":return t||a?"pár sekund":"pár sekundami";case"m":return t?"minuta":a?"minutu":"minutou";case"mm":return t||a?i+(r(e)?"minuty":"minut"):i+"minutami";case"h":return t?"hodina":a?"hodinu":"hodinou";case"hh":return t||a?i+(r(e)?"hodiny":"hodin"):i+"hodinami";case"d":return t||a?"den":"dnem";case"dd":return t||a?i+(r(e)?"dny":"dní"):i+"dny";case"M":return t||a?"měsíc":"měsícem";case"MM":return t||a?i+(r(e)?"měsíce":"měsíců"):i+"měsíci";case"y":return t||a?"rok":"rokem";case"yy":return t||a?i+(r(e)?"roky":"let"):i+"lety"}}var i={name:"cs",weekdays:"neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota".split("_"),weekdaysShort:"ne_po_út_st_čt_pá_so".split("_"),weekdaysMin:"ne_po_út_st_čt_pá_so".split("_"),months:"leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec".split("_"),monthsShort:"led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"za %s",past:"před %s",s:a,m:a,mm:a,h:a,hh:a,d:a,dd:a,M:a,MM:a,y:a,yy:a}};return n.default.locale(i,null,!0),i}(tr()));var mr,hr={exports:{}};mr||(mr=1,hr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"da",weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"søn._man._tirs._ons._tors._fre._lør.".split("_"),weekdaysMin:"sø._ma._ti._on._to._fr._lø.".split("_"),months:"januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december".split("_"),monthsShort:"jan._feb._mar._apr._maj_juni_juli_aug._sept._okt._nov._dec.".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd [d.] D. MMMM YYYY [kl.] HH:mm"},relativeTime:{future:"om %s",past:"%s siden",s:"få sekunder",m:"et minut",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dage",M:"en måned",MM:"%d måneder",y:"et år",yy:"%d år"}};return n.default.locale(r,null,!0),r}(tr()));var pr,fr={exports:{}};pr||(pr=1,fr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={s:"ein paar Sekunden",m:["eine Minute","einer Minute"],mm:"%d Minuten",h:["eine Stunde","einer Stunde"],hh:"%d Stunden",d:["ein Tag","einem Tag"],dd:["%d Tage","%d Tagen"],M:["ein Monat","einem Monat"],MM:["%d Monate","%d Monaten"],y:["ein Jahr","einem Jahr"],yy:["%d Jahre","%d Jahren"]};function a(e,t,n){var a=r[n];return Array.isArray(a)&&(a=a[t?0:1]),a.replace("%d",e)}var i={name:"de",weekdays:"Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),weekdaysShort:"So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),weekdaysMin:"So_Mo_Di_Mi_Do_Fr_Sa".split("_"),months:"Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),monthsShort:"Jan._Feb._März_Apr._Mai_Juni_Juli_Aug._Sept._Okt._Nov._Dez.".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,formats:{LTS:"HH:mm:ss",LT:"HH:mm",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd, D. MMMM YYYY HH:mm"},relativeTime:{future:"in %s",past:"vor %s",s:a,m:a,mm:a,h:a,hh:a,d:a,dd:a,M:a,MM:a,y:a,yy:a}};return n.default.locale(i,null,!0),i}(tr()));var gr,yr={exports:{}};gr||(gr=1,yr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"el",weekdays:"Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο".split("_"),weekdaysShort:"Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ".split("_"),weekdaysMin:"Κυ_Δε_Τρ_Τε_Πε_Πα_Σα".split("_"),months:"Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος".split("_"),monthsShort:"Ιαν_Φεβ_Μαρ_Απρ_Μαι_Ιουν_Ιουλ_Αυγ_Σεπτ_Οκτ_Νοε_Δεκ".split("_"),ordinal:function(e){return e},weekStart:1,relativeTime:{future:"σε %s",past:"πριν %s",s:"μερικά δευτερόλεπτα",m:"ένα λεπτό",mm:"%d λεπτά",h:"μία ώρα",hh:"%d ώρες",d:"μία μέρα",dd:"%d μέρες",M:"ένα μήνα",MM:"%d μήνες",y:"ένα χρόνο",yy:"%d χρόνια"},formats:{LT:"h:mm A",LTS:"h:mm:ss A",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY h:mm A",LLLL:"dddd, D MMMM YYYY h:mm A"}};return n.default.locale(r,null,!0),r}(tr()));var vr,wr={exports:{}};vr||(vr=1,wr.exports={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],n=e%100;return"["+e+(t[(n-20)%10]||t[n]||t[0])+"]"}});var br,Mr={exports:{}};br||(br=1,Mr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"es",monthsShort:"ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),weekdays:"domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),weekdaysShort:"dom._lun._mar._mié._jue._vie._sáb.".split("_"),weekdaysMin:"do_lu_ma_mi_ju_vi_sá".split("_"),months:"enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY H:mm",LLLL:"dddd, D [de] MMMM [de] YYYY H:mm"},relativeTime:{future:"en %s",past:"hace %s",s:"unos segundos",m:"un minuto",mm:"%d minutos",h:"una hora",hh:"%d horas",d:"un día",dd:"%d días",M:"un mes",MM:"%d meses",y:"un año",yy:"%d años"},ordinal:function(e){return e+"º"}};return n.default.locale(r,null,!0),r}(tr()));var kr,Dr={exports:{}};kr||(kr=1,Dr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function r(e,t,n,r){var a={s:["mõne sekundi","mõni sekund","paar sekundit"],m:["ühe minuti","üks minut"],mm:["%d minuti","%d minutit"],h:["ühe tunni","tund aega","üks tund"],hh:["%d tunni","%d tundi"],d:["ühe päeva","üks päev"],M:["kuu aja","kuu aega","üks kuu"],MM:["%d kuu","%d kuud"],y:["ühe aasta","aasta","üks aasta"],yy:["%d aasta","%d aastat"]};return t?(a[n][2]?a[n][2]:a[n][1]).replace("%d",e):(r?a[n][0]:a[n][1]).replace("%d",e)}var a={name:"et",weekdays:"pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev".split("_"),weekdaysShort:"P_E_T_K_N_R_L".split("_"),weekdaysMin:"P_E_T_K_N_R_L".split("_"),months:"jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember".split("_"),monthsShort:"jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"%s pärast",past:"%s tagasi",s:r,m:r,mm:r,h:r,hh:r,d:r,dd:"%d päeva",M:r,MM:r,y:r,yy:r},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"}};return n.default.locale(a,null,!0),a}(tr()));var Yr,$r={exports:{}};Yr||(Yr=1,$r.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function r(e,t,n,r){var a={s:"muutama sekunti",m:"minuutti",mm:"%d minuuttia",h:"tunti",hh:"%d tuntia",d:"päivä",dd:"%d päivää",M:"kuukausi",MM:"%d kuukautta",y:"vuosi",yy:"%d vuotta",numbers:"nolla_yksi_kaksi_kolme_neljä_viisi_kuusi_seitsemän_kahdeksan_yhdeksän".split("_")},i={s:"muutaman sekunnin",m:"minuutin",mm:"%d minuutin",h:"tunnin",hh:"%d tunnin",d:"päivän",dd:"%d päivän",M:"kuukauden",MM:"%d kuukauden",y:"vuoden",yy:"%d vuoden",numbers:"nollan_yhden_kahden_kolmen_neljän_viiden_kuuden_seitsemän_kahdeksan_yhdeksän".split("_")},o=r&&!t?i:a,s=o[n];return e<10?s.replace("%d",o.numbers[e]):s.replace("%d",e)}var a={name:"fi",weekdays:"sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),weekdaysShort:"su_ma_ti_ke_to_pe_la".split("_"),weekdaysMin:"su_ma_ti_ke_to_pe_la".split("_"),months:"tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),monthsShort:"tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,relativeTime:{future:"%s päästä",past:"%s sitten",s:r,m:r,mm:r,h:r,hh:r,d:r,dd:r,M:r,MM:r,y:r,yy:r},formats:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD.MM.YYYY",LL:"D. MMMM[ta] YYYY",LLL:"D. MMMM[ta] YYYY, [klo] HH.mm",LLLL:"dddd, D. MMMM[ta] YYYY, [klo] HH.mm",l:"D.M.YYYY",ll:"D. MMM YYYY",lll:"D. MMM YYYY, [klo] HH.mm",llll:"ddd, D. MMM YYYY, [klo] HH.mm"}};return n.default.locale(a,null,!0),a}(tr()));var xr,Sr={exports:{}};xr||(xr=1,Sr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"fr",weekdays:"dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),weekdaysShort:"dim._lun._mar._mer._jeu._ven._sam.".split("_"),weekdaysMin:"di_lu_ma_me_je_ve_sa".split("_"),months:"janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),monthsShort:"janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"dans %s",past:"il y a %s",s:"quelques secondes",m:"une minute",mm:"%d minutes",h:"une heure",hh:"%d heures",d:"un jour",dd:"%d jours",M:"un mois",MM:"%d mois",y:"un an",yy:"%d ans"},ordinal:function(e){return e+(1===e?"er":"")}};return n.default.locale(r,null,!0),r}(tr()));var Lr,Tr={exports:{}};Lr||(Lr=1,Tr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={s:"מספר שניות",ss:"%d שניות",m:"דקה",mm:"%d דקות",h:"שעה",hh:"%d שעות",hh2:"שעתיים",d:"יום",dd:"%d ימים",dd2:"יומיים",M:"חודש",MM:"%d חודשים",MM2:"חודשיים",y:"שנה",yy:"%d שנים",yy2:"שנתיים"};function a(e,t,n){return(r[n+(2===e?"2":"")]||r[n]).replace("%d",e)}var i={name:"he",weekdays:"ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת".split("_"),weekdaysShort:"א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳".split("_"),weekdaysMin:"א׳_ב׳_ג׳_ד׳_ה׳_ו_ש׳".split("_"),months:"ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר".split("_"),monthsShort:"ינו_פבר_מרץ_אפר_מאי_יונ_יול_אוג_ספט_אוק_נוב_דצמ".split("_"),relativeTime:{future:"בעוד %s",past:"לפני %s",s:a,m:a,mm:a,h:a,hh:a,d:a,dd:a,M:a,MM:a,y:a,yy:a},ordinal:function(e){return e},format:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [ב]MMMM YYYY",LLL:"D [ב]MMMM YYYY HH:mm",LLLL:"dddd, D [ב]MMMM YYYY HH:mm",l:"D/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [ב]MMMM YYYY",LLL:"D [ב]MMMM YYYY HH:mm",LLLL:"dddd, D [ב]MMMM YYYY HH:mm",l:"D/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"}};return n.default.locale(i,null,!0),i}(tr()));var jr,Hr={exports:{}};jr||(jr=1,Hr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r="siječnja_veljače_ožujka_travnja_svibnja_lipnja_srpnja_kolovoza_rujna_listopada_studenoga_prosinca".split("_"),a="siječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),i=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/,o=function(e,t){return i.test(t)?r[e.month()]:a[e.month()]};o.s=a,o.f=r;var s={name:"hr",weekdays:"nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),weekdaysShort:"ned._pon._uto._sri._čet._pet._sub.".split("_"),weekdaysMin:"ne_po_ut_sr_če_pe_su".split("_"),months:o,monthsShort:"sij._velj._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},relativeTime:{future:"za %s",past:"prije %s",s:"sekunda",m:"minuta",mm:"%d minuta",h:"sat",hh:"%d sati",d:"dan",dd:"%d dana",M:"mjesec",MM:"%d mjeseci",y:"godina",yy:"%d godine"},ordinal:function(e){return e+"."}};return n.default.locale(s,null,!0),s}(tr()));var zr,Er={exports:{}};zr||(zr=1,Er.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"hu",weekdays:"vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat".split("_"),weekdaysShort:"vas_hét_kedd_sze_csüt_pén_szo".split("_"),weekdaysMin:"v_h_k_sze_cs_p_szo".split("_"),months:"január_február_március_április_május_június_július_augusztus_szeptember_október_november_december".split("_"),monthsShort:"jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"%s múlva",past:"%s",s:function(e,t,n,r){return"néhány másodperc"+(r||t?"":"e")},m:function(e,t,n,r){return"egy perc"+(r||t?"":"e")},mm:function(e,t,n,r){return e+" perc"+(r||t?"":"e")},h:function(e,t,n,r){return"egy "+(r||t?"óra":"órája")},hh:function(e,t,n,r){return e+" "+(r||t?"óra":"órája")},d:function(e,t,n,r){return"egy "+(r||t?"nap":"napja")},dd:function(e,t,n,r){return e+" "+(r||t?"nap":"napja")},M:function(e,t,n,r){return"egy "+(r||t?"hónap":"hónapja")},MM:function(e,t,n,r){return e+" "+(r||t?"hónap":"hónapja")},y:function(e,t,n,r){return"egy "+(r||t?"év":"éve")},yy:function(e,t,n,r){return e+" "+(r||t?"év":"éve")}},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"YYYY.MM.DD.",LL:"YYYY. MMMM D.",LLL:"YYYY. MMMM D. H:mm",LLLL:"YYYY. MMMM D., dddd H:mm"}};return n.default.locale(r,null,!0),r}(tr()));var Or,Ar={exports:{}};Or||(Or=1,Ar.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={s:["nokkrar sekúndur","nokkrar sekúndur","nokkrum sekúndum"],m:["mínúta","mínútu","mínútu"],mm:["mínútur","mínútur","mínútum"],h:["klukkustund","klukkustund","klukkustund"],hh:["klukkustundir","klukkustundir","klukkustundum"],d:["dagur","dag","degi"],dd:["dagar","daga","dögum"],M:["mánuður","mánuð","mánuði"],MM:["mánuðir","mánuði","mánuðum"],y:["ár","ár","ári"],yy:["ár","ár","árum"]};function a(e,t,n,a){var i=function(e,t,n,a){var i=a?0:n?1:2,o=2===e.length&&t%10==1?e[0]:e,s=r[o][i];return 1===e.length?s:"%d "+s}(n,e,a,t);return i.replace("%d",e)}var i={name:"is",weekdays:"sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur".split("_"),months:"janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember".split("_"),weekStart:1,weekdaysShort:"sun_mán_þri_mið_fim_fös_lau".split("_"),monthsShort:"jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des".split("_"),weekdaysMin:"Su_Má_Þr_Mi_Fi_Fö_La".split("_"),ordinal:function(e){return e},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H:mm",LLLL:"dddd, D. MMMM YYYY [kl.] H:mm"},relativeTime:{future:"eftir %s",past:"fyrir %s síðan",s:a,m:a,mm:a,h:a,hh:a,d:a,dd:a,M:a,MM:a,y:a,yy:a}};return n.default.locale(i,null,!0),i}(tr()));var Cr,Pr={exports:{}};Cr||(Cr=1,Pr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"it",weekdays:"domenica_lunedì_martedì_mercoledì_giovedì_venerdì_sabato".split("_"),weekdaysShort:"dom_lun_mar_mer_gio_ven_sab".split("_"),weekdaysMin:"do_lu_ma_me_gi_ve_sa".split("_"),months:"gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre".split("_"),weekStart:1,monthsShort:"gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic".split("_"),formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"tra %s",past:"%s fa",s:"qualche secondo",m:"un minuto",mm:"%d minuti",h:"un'ora",hh:"%d ore",d:"un giorno",dd:"%d giorni",M:"un mese",MM:"%d mesi",y:"un anno",yy:"%d anni"},ordinal:function(e){return e+"º"}};return n.default.locale(r,null,!0),r}(tr()));var Ir,Nr={exports:{}};Ir||(Ir=1,Nr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r="sausio_vasario_kovo_balandžio_gegužės_birželio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio".split("_"),a="sausis_vasaris_kovas_balandis_gegužė_birželis_liepa_rugpjūtis_rugsėjis_spalis_lapkritis_gruodis".split("_"),i=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?|MMMM?(\[[^\[\]]*\]|\s)+D[oD]?/,o=function(e,t){return i.test(t)?r[e.month()]:a[e.month()]};o.s=a,o.f=r;var s={name:"lt",weekdays:"sekmadienis_pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis".split("_"),weekdaysShort:"sek_pir_ant_tre_ket_pen_šeš".split("_"),weekdaysMin:"s_p_a_t_k_pn_š".split("_"),months:o,monthsShort:"sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"už %s",past:"prieš %s",s:"kelias sekundes",m:"minutę",mm:"%d minutes",h:"valandą",hh:"%d valandas",d:"dieną",dd:"%d dienas",M:"mėnesį",MM:"%d mėnesius",y:"metus",yy:"%d metus"},format:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"YYYY [m.] MMMM D [d.]",LLL:"YYYY [m.] MMMM D [d.], HH:mm [val.]",LLLL:"YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]",l:"YYYY-MM-DD",ll:"YYYY [m.] MMMM D [d.]",lll:"YYYY [m.] MMMM D [d.], HH:mm [val.]",llll:"YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"YYYY [m.] MMMM D [d.]",LLL:"YYYY [m.] MMMM D [d.], HH:mm [val.]",LLLL:"YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]",l:"YYYY-MM-DD",ll:"YYYY [m.] MMMM D [d.]",lll:"YYYY [m.] MMMM D [d.], HH:mm [val.]",llll:"YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]"}};return n.default.locale(s,null,!0),s}(tr()));var Wr,Fr={exports:{}};Wr||(Wr=1,Fr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"lv",weekdays:"svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena".split("_"),months:"janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris".split("_"),weekStart:1,weekdaysShort:"Sv_P_O_T_C_Pk_S".split("_"),monthsShort:"jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec".split("_"),weekdaysMin:"Sv_P_O_T_C_Pk_S".split("_"),ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY.",LL:"YYYY. [gada] D. MMMM",LLL:"YYYY. [gada] D. MMMM, HH:mm",LLLL:"YYYY. [gada] D. MMMM, dddd, HH:mm"},relativeTime:{future:"pēc %s",past:"pirms %s",s:"dažām sekundēm",m:"minūtes",mm:"%d minūtēm",h:"stundas",hh:"%d stundām",d:"dienas",dd:"%d dienām",M:"mēneša",MM:"%d mēnešiem",y:"gada",yy:"%d gadiem"}};return n.default.locale(r,null,!0),r}(tr()));var Ur,Rr={exports:{}};Ur||(Ur=1,Rr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"nb",weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"sø._ma._ti._on._to._fr._lø.".split("_"),weekdaysMin:"sø_ma_ti_on_to_fr_lø".split("_"),months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] HH:mm",LLLL:"dddd D. MMMM YYYY [kl.] HH:mm"},relativeTime:{future:"om %s",past:"%s siden",s:"noen sekunder",m:"ett minutt",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dager",M:"en måned",MM:"%d måneder",y:"ett år",yy:"%d år"}};return n.default.locale(r,null,!0),r}(tr()));var Jr,Vr={exports:{}};Jr||(Jr=1,Vr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"nl",weekdays:"zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),weekdaysShort:"zo._ma._di._wo._do._vr._za.".split("_"),weekdaysMin:"zo_ma_di_wo_do_vr_za".split("_"),months:"januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_"),ordinal:function(e){return"["+e+(1===e||8===e||e>=20?"ste":"de")+"]"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD-MM-YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"over %s",past:"%s geleden",s:"een paar seconden",m:"een minuut",mm:"%d minuten",h:"een uur",hh:"%d uur",d:"een dag",dd:"%d dagen",M:"een maand",MM:"%d maanden",y:"een jaar",yy:"%d jaar"}};return n.default.locale(r,null,!0),r}(tr()));var Br,Kr={exports:{}};Br||(Br=1,Kr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"nn",weekdays:"sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),weekdaysShort:"sun_mån_tys_ons_tor_fre_lau".split("_"),weekdaysMin:"su_må_ty_on_to_fr_la".split("_"),months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"om %s",past:"for %s sidan",s:"nokre sekund",m:"eitt minutt",mm:"%d minutt",h:"ein time",hh:"%d timar",d:"ein dag",dd:"%d dagar",M:"ein månad",MM:"%d månadar",y:"eitt år",yy:"%d år"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H:mm",LLLL:"dddd D. MMMM YYYY [kl.] HH:mm"}};return n.default.locale(r,null,!0),r}(tr()));var qr,Gr={exports:{}};qr||(qr=1,Gr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function r(e){return e%10<5&&e%10>1&&~~(e/10)%10!=1}function a(e,t,n){var a=e+" ";switch(n){case"m":return t?"minuta":"minutę";case"mm":return a+(r(e)?"minuty":"minut");case"h":return t?"godzina":"godzinę";case"hh":return a+(r(e)?"godziny":"godzin");case"MM":return a+(r(e)?"miesiące":"miesięcy");case"yy":return a+(r(e)?"lata":"lat")}}var i="stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia".split("_"),o="styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień".split("_"),s=/D MMMM/,l=function(e,t){return s.test(t)?i[e.month()]:o[e.month()]};l.s=o,l.f=i;var d={name:"pl",weekdays:"niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota".split("_"),weekdaysShort:"ndz_pon_wt_śr_czw_pt_sob".split("_"),weekdaysMin:"Nd_Pn_Wt_Śr_Cz_Pt_So".split("_"),months:l,monthsShort:"sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,relativeTime:{future:"za %s",past:"%s temu",s:"kilka sekund",m:a,mm:a,h:a,hh:a,d:"1 dzień",dd:"%d dni",M:"miesiąc",MM:a,y:"rok",yy:a},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"}};return n.default.locale(d,null,!0),d}(tr()));var Zr,Qr={exports:{}};Zr||(Zr=1,Qr.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"pt",weekdays:"domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split("_"),weekdaysShort:"dom_seg_ter_qua_qui_sex_sab".split("_"),weekdaysMin:"Do_2ª_3ª_4ª_5ª_6ª_Sa".split("_"),months:"janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),monthsShort:"jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),ordinal:function(e){return e+"º"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY [às] HH:mm",LLLL:"dddd, D [de] MMMM [de] YYYY [às] HH:mm"},relativeTime:{future:"em %s",past:"há %s",s:"alguns segundos",m:"um minuto",mm:"%d minutos",h:"uma hora",hh:"%d horas",d:"um dia",dd:"%d dias",M:"um mês",MM:"%d meses",y:"um ano",yy:"%d anos"}};return n.default.locale(r,null,!0),r}(tr()));var Xr,ea={exports:{}};Xr||(Xr=1,ea.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"ro",weekdays:"Duminică_Luni_Marți_Miercuri_Joi_Vineri_Sâmbătă".split("_"),weekdaysShort:"Dum_Lun_Mar_Mie_Joi_Vin_Sâm".split("_"),weekdaysMin:"Du_Lu_Ma_Mi_Jo_Vi_Sâ".split("_"),months:"Ianuarie_Februarie_Martie_Aprilie_Mai_Iunie_Iulie_August_Septembrie_Octombrie_Noiembrie_Decembrie".split("_"),monthsShort:"Ian._Febr._Mart._Apr._Mai_Iun._Iul._Aug._Sept._Oct._Nov._Dec.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},relativeTime:{future:"peste %s",past:"acum %s",s:"câteva secunde",m:"un minut",mm:"%d minute",h:"o oră",hh:"%d ore",d:"o zi",dd:"%d zile",M:"o lună",MM:"%d luni",y:"un an",yy:"%d ani"},ordinal:function(e){return e}};return n.default.locale(r,null,!0),r}(tr()));var ta,na={exports:{}};ta||(ta=1,na.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r="января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_"),a="январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),i="янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.".split("_"),o="янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.".split("_"),s=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;function l(e,t,n){var r,a;return"m"===n?t?"минута":"минуту":e+" "+(r=+e,a={mm:t?"минута_минуты_минут":"минуту_минуты_минут",hh:"час_часа_часов",dd:"день_дня_дней",MM:"месяц_месяца_месяцев",yy:"год_года_лет"}[n].split("_"),r%10==1&&r%100!=11?a[0]:r%10>=2&&r%10<=4&&(r%100<10||r%100>=20)?a[1]:a[2])}var d=function(e,t){return s.test(t)?r[e.month()]:a[e.month()]};d.s=a,d.f=r;var c=function(e,t){return s.test(t)?i[e.month()]:o[e.month()]};c.s=o,c.f=i;var u={name:"ru",weekdays:"воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split("_"),weekdaysShort:"вск_пнд_втр_срд_чтв_птн_сбт".split("_"),weekdaysMin:"вс_пн_вт_ср_чт_пт_сб".split("_"),months:d,monthsShort:c,weekStart:1,yearStart:4,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY г.",LLL:"D MMMM YYYY г., H:mm",LLLL:"dddd, D MMMM YYYY г., H:mm"},relativeTime:{future:"через %s",past:"%s назад",s:"несколько секунд",m:l,mm:l,h:"час",hh:l,d:"день",dd:l,M:"месяц",MM:l,y:"год",yy:l},ordinal:function(e){return e},meridiem:function(e){return e<4?"ночи":e<12?"утра":e<17?"дня":"вечера"}};return n.default.locale(u,null,!0),u}(tr()));var ra,aa={exports:{}};ra||(ra=1,aa.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function r(e){return e>1&&e<5&&1!=~~(e/10)}function a(e,t,n,a){var i=e+" ";switch(n){case"s":return t||a?"pár sekúnd":"pár sekundami";case"m":return t?"minúta":a?"minútu":"minútou";case"mm":return t||a?i+(r(e)?"minúty":"minút"):i+"minútami";case"h":return t?"hodina":a?"hodinu":"hodinou";case"hh":return t||a?i+(r(e)?"hodiny":"hodín"):i+"hodinami";case"d":return t||a?"deň":"dňom";case"dd":return t||a?i+(r(e)?"dni":"dní"):i+"dňami";case"M":return t||a?"mesiac":"mesiacom";case"MM":return t||a?i+(r(e)?"mesiace":"mesiacov"):i+"mesiacmi";case"y":return t||a?"rok":"rokom";case"yy":return t||a?i+(r(e)?"roky":"rokov"):i+"rokmi"}}var i={name:"sk",weekdays:"nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota".split("_"),weekdaysShort:"ne_po_ut_st_št_pi_so".split("_"),weekdaysMin:"ne_po_ut_st_št_pi_so".split("_"),months:"január_február_marec_apríl_máj_jún_júl_august_september_október_november_december".split("_"),monthsShort:"jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"za %s",past:"pred %s",s:a,m:a,mm:a,h:a,hh:a,d:a,dd:a,M:a,MM:a,y:a,yy:a}};return n.default.locale(i,null,!0),i}(tr()));var ia,oa={exports:{}};ia||(ia=1,oa.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function r(e){return e%100==2}function a(e){return e%100==3||e%100==4}function i(e,t,n,i){var o=e+" ";switch(n){case"s":return t||i?"nekaj sekund":"nekaj sekundami";case"m":return t?"ena minuta":"eno minuto";case"mm":return r(e)?o+(t||i?"minuti":"minutama"):a(e)?o+(t||i?"minute":"minutami"):o+(t||i?"minut":"minutami");case"h":return t?"ena ura":"eno uro";case"hh":return r(e)?o+(t||i?"uri":"urama"):a(e)?o+(t||i?"ure":"urami"):o+(t||i?"ur":"urami");case"d":return t||i?"en dan":"enim dnem";case"dd":return r(e)?o+(t||i?"dneva":"dnevoma"):o+(t||i?"dni":"dnevi");case"M":return t||i?"en mesec":"enim mesecem";case"MM":return r(e)?o+(t||i?"meseca":"mesecema"):a(e)?o+(t||i?"mesece":"meseci"):o+(t||i?"mesecev":"meseci");case"y":return t||i?"eno leto":"enim letom";case"yy":return r(e)?o+(t||i?"leti":"letoma"):a(e)?o+(t||i?"leta":"leti"):o+(t||i?"let":"leti")}}var o={name:"sl",weekdays:"nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota".split("_"),months:"januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),weekStart:1,weekdaysShort:"ned._pon._tor._sre._čet._pet._sob.".split("_"),monthsShort:"jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),weekdaysMin:"ne_po_to_sr_če_pe_so".split("_"),ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"čez %s",past:"pred %s",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i}};return n.default.locale(o,null,!0),o}(tr()));var sa,la={exports:{}};sa||(sa=1,la.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"sv",weekdays:"söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),weekdaysShort:"sön_mån_tis_ons_tor_fre_lör".split("_"),weekdaysMin:"sö_må_ti_on_to_fr_lö".split("_"),months:"januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),weekStart:1,yearStart:4,ordinal:function(e){var t=e%10;return"["+e+(1===t||2===t?"a":"e")+"]"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"D MMMM YYYY",LLL:"D MMMM YYYY [kl.] HH:mm",LLLL:"dddd D MMMM YYYY [kl.] HH:mm",lll:"D MMM YYYY HH:mm",llll:"ddd D MMM YYYY HH:mm"},relativeTime:{future:"om %s",past:"för %s sedan",s:"några sekunder",m:"en minut",mm:"%d minuter",h:"en timme",hh:"%d timmar",d:"en dag",dd:"%d dagar",M:"en månad",MM:"%d månader",y:"ett år",yy:"%d år"}};return n.default.locale(r,null,!0),r}(tr()));var da,ca={exports:{}};da||(da=1,ca.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"th",weekdays:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),weekdaysShort:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"),weekdaysMin:"อา._จ._อ._พ._พฤ._ศ._ส.".split("_"),months:"มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),monthsShort:"ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.".split("_"),formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY เวลา H:mm",LLLL:"วันddddที่ D MMMM YYYY เวลา H:mm"},relativeTime:{future:"อีก %s",past:"%sที่แล้ว",s:"ไม่กี่วินาที",m:"1 นาที",mm:"%d นาที",h:"1 ชั่วโมง",hh:"%d ชั่วโมง",d:"1 วัน",dd:"%d วัน",M:"1 เดือน",MM:"%d เดือน",y:"1 ปี",yy:"%d ปี"},ordinal:function(e){return e+"."}};return n.default.locale(r,null,!0),r}(tr()));var ua,_a={exports:{}};ua||(ua=1,_a.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"tr",weekdays:"Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi".split("_"),weekdaysShort:"Paz_Pts_Sal_Çar_Per_Cum_Cts".split("_"),weekdaysMin:"Pz_Pt_Sa_Ça_Pe_Cu_Ct".split("_"),months:"Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık".split("_"),monthsShort:"Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara".split("_"),weekStart:1,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},relativeTime:{future:"%s sonra",past:"%s önce",s:"birkaç saniye",m:"bir dakika",mm:"%d dakika",h:"bir saat",hh:"%d saat",d:"bir gün",dd:"%d gün",M:"bir ay",MM:"%d ay",y:"bir yıl",yy:"%d yıl"},ordinal:function(e){return e+"."}};return n.default.locale(r,null,!0),r}(tr()));var ma,ha={exports:{}};ma||(ma=1,ha.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r="січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня".split("_"),a="січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень".split("_"),i=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;function o(e,t,n){var r,a;return"m"===n?t?"хвилина":"хвилину":"h"===n?t?"година":"годину":e+" "+(r=+e,a={ss:t?"секунда_секунди_секунд":"секунду_секунди_секунд",mm:t?"хвилина_хвилини_хвилин":"хвилину_хвилини_хвилин",hh:t?"година_години_годин":"годину_години_годин",dd:"день_дні_днів",MM:"місяць_місяці_місяців",yy:"рік_роки_років"}[n].split("_"),r%10==1&&r%100!=11?a[0]:r%10>=2&&r%10<=4&&(r%100<10||r%100>=20)?a[1]:a[2])}var s=function(e,t){return i.test(t)?r[e.month()]:a[e.month()]};s.s=a,s.f=r;var l={name:"uk",weekdays:"неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота".split("_"),weekdaysShort:"ндл_пнд_втр_срд_чтв_птн_сбт".split("_"),weekdaysMin:"нд_пн_вт_ср_чт_пт_сб".split("_"),months:s,monthsShort:"січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд".split("_"),weekStart:1,relativeTime:{future:"за %s",past:"%s тому",s:"декілька секунд",m:o,mm:o,h:o,hh:o,d:"день",dd:o,M:"місяць",MM:o,y:"рік",yy:o},ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY р.",LLL:"D MMMM YYYY р., HH:mm",LLLL:"dddd, D MMMM YYYY р., HH:mm"}};return n.default.locale(l,null,!0),l}(tr()));var pa,fa={exports:{}};pa||(pa=1,fa.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"vi",weekdays:"chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy".split("_"),months:"tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split("_"),weekStart:1,weekdaysShort:"CN_T2_T3_T4_T5_T6_T7".split("_"),monthsShort:"Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),weekdaysMin:"CN_T2_T3_T4_T5_T6_T7".split("_"),ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM [năm] YYYY",LLL:"D MMMM [năm] YYYY HH:mm",LLLL:"dddd, D MMMM [năm] YYYY HH:mm",l:"DD/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"},relativeTime:{future:"%s tới",past:"%s trước",s:"vài giây",m:"một phút",mm:"%d phút",h:"một giờ",hh:"%d giờ",d:"một ngày",dd:"%d ngày",M:"một tháng",MM:"%d tháng",y:"một năm",yy:"%d năm"}};return n.default.locale(r,null,!0),r}(tr()));var ga,ya={exports:{}};ga||(ga=1,ya.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"zh-cn",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"周日_周一_周二_周三_周四_周五_周六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(e,t){return"W"===t?e+"周":e+"日"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日Ah点mm分",LLLL:"YYYY年M月D日ddddAh点mm分",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s内",past:"%s前",s:"几秒",m:"1 分钟",mm:"%d 分钟",h:"1 小时",hh:"%d 小时",d:"1 天",dd:"%d 天",M:"1 个月",MM:"%d 个月",y:"1 年",yy:"%d 年"},meridiem:function(e,t){var n=100*e+t;return n<600?"凌晨":n<900?"早上":n<1100?"上午":n<1300?"中午":n<1800?"下午":"晚上"}};return n.default.locale(r,null,!0),r}(tr()));var va,wa={exports:{}};function ba(e,t,n){const r=function(e){const t=e.toLowerCase();if("zh-cn"===t||"zh-tw"===t)return t;const n=t.split("-")[0];return["bg","ca","cs","da","de","el","en","es","et","fi","fr","he","hr","hu","is","it","lt","lv","nb","nl","nn","pl","pt","ro","ru","sk","sl","sv","th","tr","uk","vi","zh-cn","zh-tw"].includes(n)?n:"en"}(t),a=rr(e).locale(r);return n?a.from(rr(n)):a.fromNow()}va||(va=1,wa.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),r={name:"zh-tw",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"週日_週一_週二_週三_週四_週五_週六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(e,t){return"W"===t?e+"週":e+"日"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日 HH:mm",LLLL:"YYYY年M月D日dddd HH:mm",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s內",past:"%s前",s:"幾秒",m:"1 分鐘",mm:"%d 分鐘",h:"1 小時",hh:"%d 小時",d:"1 天",dd:"%d 天",M:"1 個月",MM:"%d 個月",y:"1 年",yy:"%d 年"},meridiem:function(e,t){var n=100*e+t;return n<600?"凌晨":n<900?"早上":n<1100?"上午":n<1300?"中午":n<1800?"下午":"晚上"}};return n.default.locale(r,null,!0),r}(tr())),rr.extend(sr);const Ma=new Map;function ka(e,t=!0){if(!e)return"";if(!1===t)return e;const n=e.trim();if("string"==typeof t&&"true"!==t){const e=function(e){var t;if(Ma.has(e))return null!=(t=Ma.get(e))?t:null;let n=null;try{n=new RegExp(`(${e})\\s*$`,"i")}catch(t){at(`Ignoring "remove_location_country": ${JSON.stringify(e)} is not a valid regular expression. Locations are shown unchanged.`)}return Ma.set(e,n),n}(t);return null===e?n:n.replace(e,"").replace(/,?\s*$/,"")}for(const e of De)if(n.endsWith(e))return n.slice(0,n.length-e.length).replace(/,?\s*$/,"");return n}const Da=/microsoft\s+teams|teams\.microsoft\.(?:com|us)|teams\.live\.com/i;function Ya(e,t){return t||(function(e){return Boolean(e)&&Da.test(e)}(e)?"mdi:microsoft-teams":"mdi:map-marker-outline")}const $a=/<!--(?:-?>|[\s\S]*?-->)|<[a-zA-Z][^>]*>|<\/[^>]*>|<[!?][^>]*>/g;function xa(e){return e&&0!==e.length?e.charAt(0).toUpperCase()+e.slice(1):e}function Sa(e){const[t,n,r]=e.split("-").map(Number);return new Date(t,n-1,r)}function La(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Ta(e){const t=e.getDay();return 0===t||6===t}function ja(e,t=!0,n=!1){let r=e.getHours();const a=e.getMinutes();if(!t){const e=r>=12?"PM":"AM";return r=r%12||12,`${n?Ha(r):r}:${Ha(a)} ${e}`}return`${n?Ha(r):r}:${Ha(a)}`}function Ha(e){return e.toString().padStart(2,"0")}function za(e){const t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()));t.setUTCDate(t.getUTCDate()+4-(t.getUTCDay()||7));const n=Date.UTC(t.getUTCFullYear(),0,1);return Math.ceil(((t.getTime()-n)/864e5+1)/7)}const Ea=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],Oa={af:0,ar:6,bn:0,en:0,"en-gb":1,fa:6,he:0,hi:0,id:0,is:0,ja:0,ko:0,ml:0,pt:0,"pt-br":0,ta:0,te:0,th:0,ur:0,"zh-hans":1,"zh-hant":0};function Aa(e,t){var n;if("sunday"===e)return 0;if("monday"===e)return 1;const r=Ea.indexOf(null!=(n=null==t?void 0:t.first_weekday)?n:"");return-1!==r?r:(null==t?void 0:t.language)?function(e){var t,n;const r=e.toLowerCase();return null!=(n=null!=(t=Oa[r])?t:Oa[r.split("-")[0]])?n:1}(t.language):1}function Ca(e,t,n){const r=t||"iso";return"iso"===r?za(e):"simple"===r?function(e,t=0){const n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),r=Date.UTC(e.getFullYear(),0,1),a=Math.round((n-r)/864e5),i=(new Date(r).getUTCDay()-t+7)%7;return Math.ceil((a+i+1)/7)}(e,n):null}function Pa(e,t,n,r,a=!0,i=!1,o){if(r&&(null==o?void 0:o.locale)){const r=Ce(o.locale,a);return n?`${ja(e,r,i)} - ${ja(t,r,i)}`:ja(e,r,i)}return n?`${ja(e,a,i)} - ${ja(t,a,i)}`:ja(e,a,i)}function Ia(e,t,n,r,a,i=!0,o=!1,s){const l=new Date,d=new Date(l.getFullYear(),l.getMonth(),l.getDate()),c=new Date(d);c.setDate(c.getDate()+1);const u=e=>{if(a&&(null==s?void 0:s.locale)){return ja(e,Ce(s.locale,i),o)}return ja(e,i,o)};let _;if(t.toDateString()===d.toDateString())_=`${r.endsToday} ${r.at} ${u(t)}`;else if(t.toDateString()===c.toDateString())_=`${r.endsTomorrow} ${r.at} ${u(t)}`;else{const e=t.getDate(),a=r.months[t.getMonth()],i=r.fullDaysOfWeek[t.getDay()],o=u(t);switch(Zn(n)){case"day-dot-month":_=`${i}, ${e}. ${a} ${r.at} ${o}`;break;case"month-day":_=`${i}, ${a} ${e} ${r.at} ${o}`;break;default:_=`${i}, ${e} ${a} ${r.at} ${o}`}}if(d.getTime()<=e.getTime()){return`${u(e)} ${r.multiDay} ${_}`}return t.toDateString()===d.toDateString()||t.toDateString()===c.toDateString()?_:`${r.multiDay} ${_}`}function Na(e,t,n){const r=new Date,a=new Date(r.getFullYear(),r.getMonth(),r.getDate()),i=new Date(a);if(i.setDate(i.getDate()+1),e.toDateString()===a.toDateString())return n.endsToday;if(e.toDateString()===i.toDateString())return n.endsTomorrow;const o=e.getDate(),s=n.months[e.getMonth()],l=n.fullDaysOfWeek[e.getDay()];switch(Zn(t)){case"day-dot-month":return`${n.multiDay} ${l}, ${o}. ${s}`;case"month-day":return`${n.multiDay} ${l}, ${s} ${o}`;default:return`${n.multiDay} ${l}, ${o} ${s}`}}const Wa={"zh-cn":"zh-Hans","zh-tw":"zh-Hant"},Fa="component.weather.entity_component._.state.",Ua=["clear-night","cloudy","exceptional","fog","hail","lightning","lightning-rainy","partlycloudy","pouring","rainy","snowy","snowy-rainy","sunny","windy","windy-variant"];function Ra(e,t){var n;if(!e)return;const r=function(e){const t=e.toLowerCase(),n=Wa[t];if(n)return n;const[r,a]=t.split("-");return a?`${r}-${a.toUpperCase()}`:r}(qn(t,e.locale)),a=null==(n=e.locale)?void 0:n.language;return a&&a.toLowerCase()===r.toLowerCase()?void 0:r}const Ja=new Map,Va=new Map,Ba=new Set;function Ka(e,t){const n=Ja.get(e);if(!n)return;const r=n[t];return r||function(e,t){const n=`${e}:${t}`;if(qa.has(n))return;qa.add(n),st(`Home Assistant has no "${t}" for ${e}; that condition will follow the instance's language instead`)}(e,t),r}const qa=new Set;function Ga(e,t,n){const r=Ra(e,t);if(!e||!r)return;if(Ja.has(r))return;const a=Va.get(r);if(a)return void a.push(n);const i=function(e,t){if("function"==typeof e.callWS)return e.callWS(t);const n=e.connection;return n&&"function"==typeof n.sendMessagePromise?n.sendMessagePromise(t):void 0}(e,{type:"frontend/get_translations",language:r,category:"entity_component",integration:"weather"});if(!i)return void Za(r,"this instance exposes no WebSocket command API");const o=[n];Va.set(r,o),i.then((e=>{const t=function(e){const t=null==e?void 0:e.resources;if(!t)return{};const n={};for(const[e,r]of Object.entries(t))e.startsWith(Fa)&&"string"==typeof r&&r&&(n[e.slice(43)]=r);return n}(e);if(0!==Object.keys(t).length){Ja.set(r,t),function(e,t){const n=Ua.filter((e=>!t[e]));if(0===n.length)return;st(`Home Assistant returned ${Object.keys(t).length} weather conditions for ${e}, without ${n.join(", ")}; those will follow the instance's language instead`)}(r,t),st(`Loaded ${Object.keys(t).length} weather conditions in ${r}`);for(const e of o)e()}else Za(r,"Home Assistant returned no condition strings")})).catch((e=>{Za(r,String(e))})).finally((()=>{Va.delete(r)}))}function Za(e,t){Ba.has(e)||(Ba.add(e),st(`Could not load weather conditions in ${e} (${t}); conditions will follow Home Assistant's language instead`))}function Qa(e){return(null==e?void 0:e.position)||"date"}function Xa(e,t){const n={};return e&&Array.isArray(e)?(e.forEach((e=>{if(!e.datetime)return;let r,a,i;"hourly"===t?(i=new Date(e.datetime),a=i.getHours(),r=`${La(i)}_${a}`):(i=new Date(e.datetime),r=La(i));const o=function(e,t){const n=void 0!==t&&(t>=18||t<6);if(n&&ti[e])return ti[e];return ei[e]||"mdi:weather-cloudy-alert"}(e.condition,a);n[r]={icon:o,condition:e.condition,temperature:Math.round(e.temperature),templow:void 0!==e.templow?Math.round(e.templow):void 0,datetime:e.datetime,hour:a,uv_index:void 0!==e.uv_index?Math.round(e.uv_index):void 0}})),n):n}const ei={"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant",exceptional:"mdi:weather-cloudy-alert"},ti={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy","lightning-rainy":"mdi:weather-lightning"};const ni=new Set;async function ri(e,t,n,r){var a;if(!(null==e?void 0:e.connection)||!(null==(a=null==t?void 0:t.weather)?void 0:a.entity))return;const i=t.weather.entity;try{return await e.connection.subscribeMessage((e=>{if(e&&Array.isArray(e.forecast)){const t=Xa(e.forecast,n);r(t)}}),{type:"weather/subscribe_forecast",forecast_type:n,entity_id:i})}catch(e){return void rt("Failed to subscribe to weather forecast",{entity:i,forecast_type:n,error:e})}}function ai(e,t,n){var r,a,i;const o=Qa(t.weather);if(!(("date"===o||"both"===o)&&(null==(r=t.weather)?void 0:r.entity))||!(null==n?void 0:n.daily))return F;const s=function(e,t){if(!t)return;return t[La(e)]}(e,n.daily);if(!s)return F;const l=(null==(a=t.weather)?void 0:a.date)||{},d=!1!==l.show_conditions,c=!1!==l.show_high_temp,u=!0===l.show_uv_index&&void 0!==s.uv_index&&s.uv_index>=(null!=(i=l.uv_index_threshold)?i:0),_=!0===l.show_low_temp&&!u&&void 0!==s.templow;return N`
    <div class="weather">${d?N`<ha-icon .icon=${s.icon}></ha-icon>`:F}${c?N`<span class="weather-temp-high">${s.temperature}°</span>`:F}${_?N`<span class="weather-temp-low">/${s.templow}°</span>`:F}${u?N`<span class="weather-uv-index">UV${s.uv_index}</span>`:F}</div>
  `}function ii(e){const t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()),r=new Date(e).toDateString(),a=new Date(n);return a.setDate(a.getDate()+1),{isToday:r===n.toDateString(),isTomorrow:r===a.toDateString()}}function oi(e,t,n,r,a=F){const i=Ta(e);let o=t.weekday_color,s=t.day_color,l=t.month_color;i&&(o=t.weekend_weekday_color||o,s=t.weekend_day_color||s,l=t.weekend_month_color||l),r&&(o=t.today_weekday_color||o,s=t.today_day_color||s,l=t.today_month_color||l);const d=Gn(n),c=d.daysOfWeek[e.getDay()],u=e.getDate(),_=d.months[e.getMonth()];return N`
    <div
      class="weekday"
      style=${xn({"font-size":t.weekday_font_size,color:o})}
    >
      ${c}
    </div>
    <div
      class="day"
      style=${xn({"font-size":t.day_font_size,color:s})}
    >
      ${u}
    </div>
    ${t.show_month?N`
          <div
            class="month"
            style=${xn({"font-size":t.month_font_size,color:l})}
          >
            ${_}
          </div>
        `:F}
    ${a}
  `}const si=/[\u2000-\u3300]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]/,li=/[\s\p{L}]/u;function di(e,t,n){if(!e)return F;const r=He(e,n);if("none"===r)return F;if("icon"===r)return N`<ha-icon icon="${e}" class="label-icon" style=${t?`color: ${t};`:F}></ha-icon>`;if("image"===r)return N`<img src="${e}" class="label-image" />`;const a=function(e){return si.test(e)&&!li.test(e)}(e)?" label-emoji":"";return N`<span class="calendar-label${a}">${e}</span>`}function ci(e){var t;const n=Qa(e.weather);return!(!(null==(t=e.weather)?void 0:t.entity)||"event"!==n&&"both"!==n)}function ui(e,t,n,r="title",a){var i,o,s,l;if(!ci(t)||!(null==n?void 0:n.hourly))return N``;if(null==(i=e.end)?void 0:i.dateTime){const t=new Date;if(new Date(e.end.dateTime)<t)return N``}const d=(null==(o=t.weather)?void 0:o.event)||{},c=function(e,t,n,r=!1){if(e.start.date&&!e.start.dateTime&&n)return n[La(Sa(e.start.date))];if(!e.start.dateTime)return;const a=new Date(e.start.dateTime),i=La(a),o=a.getHours();if(t){const e=t[`${i}_${o}`];if(e)return e;let n=-1,r=24;if(Object.keys(t).forEach((e=>{if(e.startsWith(i)){const t=e.split("_")[1],a=parseInt(t);if(!isNaN(a)){const e=Math.abs(a-o);e<r&&(r=e,n=a)}}})),n>=0)return t[`${i}_${n}`]}return r&&n?n[i]:void 0}(e,n.hourly,n.daily,!1!==d.daily_forecast_fallback);if(!c)return N``;const u=!1!==d.show_conditions,_=!1!==d.show_temp,m=!0===d.show_uv_index&&void 0!==c.uv_index&&c.uv_index>=(null!=(s=d.uv_index_threshold)?s:0),h="row"===r,p=h||u,f=h&&u?function(e,t,n,r){var a;if(!e||!t||!n)return;const i=Ra(e,r);if(i){const e=Ka(i,n);if(e)return e}const o=null==(a=e.states)?void 0:a[t];if(!o||"function"!=typeof e.formatEntityState)return;const s=e.formatEntityState(o,n);return s?(s!==n||ni.has(n)||(ni.add(n),st(`Weather condition "${n}" came back untranslated from ${t}; Home Assistant returned the raw token, so the row will show it as-is`)),s):void 0}(a,null==(l=t.weather)?void 0:l.entity,c.condition,t.language):void 0;return N`
    <div class="event-weather">${p?N`<ha-icon .icon=${c.icon}></ha-icon>`:F}<span class="event-weather-text">${_?N`<span>${c.temperature}°</span>`:F}${m?N`<span class="weather-uv-index">UV${c.uv_index}</span>`:F}${f?N`<span class="weather-condition">${f}</span>`:F}</span></div>
  `}function _i(e,t,n,r={}){const{weatherForecasts:a,weatherPlacement:i="title",progressPlacement:o="inline",countdownPlacement:s="trailing",hass:l}=r,{eventTime:d,allDayBadge:c,titlePill:u,eventLocation:_,locationIcon:m,eventDescription:h,shouldShowTime:p,countdownStr:f,progressPercentage:g,entityLabel:y}=n,v=null!==g&&t.show_progress_bar,w=v&&"inline"===o,b=v&&"row"===o?N`
          <div class="progress-bar progress-bar-row">
            <div class="progress-bar-filled" style="width: ${g}%"></div>
          </div>
        `:F,M="title"===i?a:void 0,k="row"===i&&ci(t)?ui(e,t,a,"row",l):F,D="text"===s&&null!==f,Y=D?null:f,$=d?N`<span>${d}</span>`:F,x=c?N`<span
        class=${"allday-badge allday-pill-"+c.mode+(c.inheritsText?" allday-source-text":"")}
        lang=${c.lang}
        style=${`--calendar-card-event-accent: ${c.accent};`+(c.inheritsText?" --badge-source: var(--calendar-card-color-time);":"")}
        >${c.label}</span
      >`:F,S=D?N`<span class="time-text">${$}<span class="time-countdown">${f}</span></span>`:$;return N`
    <div class="event-content">
      ${function(e,t,n,r,a){var i,o,s;const l=!!e._isEmptyDay,d=l&&!e._isCustomEmptyText,c=l?"var(--calendar-card-empty-day-color)":(null==(i=e._matchedConfig)?void 0:i.color)||t.event_color,u=null==(o=e._matchedConfig)?void 0:o.label_icon_color,_=null==(s=e._matchedConfig)?void 0:s.label_type,m=d?`✓ ${e.summary}`:e.summary,h=a?`allday-title-pill allday-pill-${a.mode}`+(a.inheritsText?" allday-source-text":""):"",p=a?`--calendar-card-event-accent: ${a.accent};`+(a.inheritsText?` --badge-source: ${c};`:""):"",f=a?N`<span
        class=${h}
        style=${p}
        >${m}</span
      >`:m;return N`
    <div class="summary-row">
      <div class="summary">
        ${n?di(n,u,_):F}
        <span
          class="event-title ${l?"empty-day-title":""}"
          style="color: ${c}"
        >
          ${f}
        </span>
      </div>
      ${ui(e,t,r)}
    </div>
  `}(e,t,y,M,u)}
      <div class="time-location">
        ${b}
        ${p?N`
              <div class="time">
                <div class="time-actual">
                  <ha-icon icon="mdi:clock-outline"></ha-icon>
                  ${x}${S}
                </div>
                ${Y?N`<div class="time-countdown">${Y}</div>`:w?N`
                        <div class="progress-bar">
                          <div
                            class="progress-bar-filled"
                            style="width: ${g}%"
                          ></div>
                        </div>
                      `:F}
              </div>
            `:f?N`
                <div class="time">
                  <div class="time-actual"></div>
                  <div class="time-countdown">${f}</div>
                </div>
              `:w?N`
                  <div class="time">
                    <div class="time-actual"></div>
                    <div class="progress-bar">
                      <div class="progress-bar-filled" style="width: ${g}%"></div>
                    </div>
                  </div>
                `:F}
        ${k}
        ${_?N`
              <div class="location">
                <ha-icon icon="${m}"></ha-icon>
                <span>${_}</span>
              </div>
            `:""}
        ${h?N`
              <div class="description">
                <ha-icon icon="mdi:information-outline"></ha-icon>
                <span>${h}</span>
              </div>
            `:""}
      </div>
    </div>
  `}function mi(e,t,n="absolute"){if(!e.today_indicator||!t)return F;const r=e.today_indicator,a=void 0===(i=r)||!1===i?"none":!0===i?"dot":"string"==typeof i?"dot"===i||"pulse"===i||"glow"===i?i:""===i.trim()?"dot":Te(i)?"mdi":i.startsWith("/")||/^https?:\/\//i.test(i)||/\.(apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(i)?"image":"emoji":"none";var i;if("none"===a)return F;const o="inline"===n?{}:function(e){const t={position:"absolute",transform:"translate(-50%, -50%)"},n=e.trim().split(/\s+/);return n.length>=1&&(t.left=n[0]),n.length>=2?t.top=n[1]:t.top="50%",t}(e.today_indicator_position);return N`
    <div class="today-indicator-container${"inline"===n?" inline":""}">
      ${function(e,t,n){let r="";switch(e){case"dot":case"pulse":case"glow":r="mdi:circle";break;case"mdi":r="string"==typeof t?t:"mdi:circle";break;case"image":return"string"==typeof t?N` <img
          src="${t}"
          class="today-indicator image"
          style=${xn(n)}
          alt="Today"
        />`:F;case"emoji":return"string"==typeof t?N` <span class="today-indicator emoji" style=${xn(n)}>
          ${t}
        </span>`:F;default:return F}if(r)return N` <ha-icon
      icon="${r}"
      class="today-indicator ${e}"
      style=${xn(n)}
    >
    </ha-icon>`;return F}(a,r,o)}
    </div>
  `}function hi(e){return"home-assistant"===e}const pi=new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","primary-text","secondary-text","disabled"]);let fi,gi,yi=new Map,vi=!1,wi=0,bi=!1;const Mi=new Set;function ki(){for(const e of Mi)e()}function Di(e){const t=function(e,t){if("function"==typeof e.callWS)return e.callWS(t);const n=e.connection;return n&&"function"==typeof n.sendMessagePromise?n.sendMessagePromise(t):void 0}(e,{type:"config/entity_registry/list"});if(t)return t.then((e=>{yi=function(e){var t,n;const r=new Map;for(const i of null!=e?e:[]){const e=null==i?void 0:i.entity_id;if("string"!=typeof e||!e.startsWith("calendar."))continue;const o=null==(n=null==(t=i.options)?void 0:t.calendar)?void 0:n.color;"string"==typeof o&&""!==o&&r.set(e,(a=o,pi.has(a)?`var(--${a}-color)`:a))}var a;return r}(e),vi=!0,st(`Loaded ${yi.size} calendar colors from the entity registry`)})).catch((e=>{st("Could not read calendar colors from the entity registry",e)}));bi||(bi=!0,st("This instance exposes no WebSocket command API, so Home Assistant calendar colors are unavailable; configured colors are used instead"))}function Yi(e,t){if(!e)return;if(Mi.add(t),function(e){const t=e.connection;if(gi||!t||"function"!=typeof t.subscribeEvents)return;gi=()=>{};const n=++wi;t.subscribeEvents((()=>{const t=Di(e);t&&t.then(ki)}),"entity_registry_updated").then((e=>{n===wi?gi=e:e()})).catch((()=>{n===wi&&(gi=void 0)}))}(e),vi||fi)return;const n=Di(e);n&&(fi=n.then((()=>{fi=void 0,ki()})))}function $i(e){Mi.delete(e),0===Mi.size&&(wi++,gi&&(gi(),gi=void 0),vi=!1)}const xi=/(?:^|\s)year[:=](\d{4})(?!\w)/i,Si=new RegExp(xi.source,"gi");function Li(e){return e.replace(Si,"").replace(/[^\S\n]{2,}/g," ").replace(/[^\S\n]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim()}function Ti(e,t){return e.trim().length>0?`${e} (${t})`:`(${t})`}const ji={sunday:0,sun:0,monday:1,mon:1,tuesday:2,tue:2,wednesday:3,wed:3,thursday:4,thu:4,friday:5,fri:5,saturday:6,sat:6},Hi="start_of_week";function zi(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function Ei(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function Oi(e,t){const n=(t-e.getDay()+7)%7;return Ei(e,n)}function Ai(e,t){const n=(e.getDay()-t+7)%7;return Ei(e,-n)}function Ci(e){const t=[];let n="";for(const r of e)"+"===r||"-"===r?(t.push(n),n=r):n+=r;return t.push(n),t}function Pi(e,t,n){const r=String(e).replace(/\s+/g,"").toLowerCase();if(""===r)return{kind:"nomatch"};const a=Ci(r),i=a[0],o=a.slice(1);let s;if("today"===i)s=zi(n);else if(i===Hi)s=function(e,t){return Ai(e,(t%7+7)%7)}(n,t);else if(i in ji)s=Oi(zi(n),ji[i]);else{if(""!==i)return{kind:"nomatch"};s=zi(n)}if(o.length>8)return{kind:"error",message:"too many operators (maximum 8)"};for(const e of o){const t="-"===e[0]?-1:1,n=e.slice(1);if(""===n)return{kind:"error",message:`dangling "${e[0]}" with no value`};if(n in ji){const e=ji[n];s=t>0?Oi(s,e):Ai(s,e);continue}const r=n.match(/^(\d+)w$/);if(r){s=Ei(s,t*parseInt(r[1],10)*7);continue}const a=n.match(/^(\d+)$/);if(!a)return{kind:"error",message:`unrecognized operand "${n}"`};s=Ei(s,t*parseInt(a[1],10))}return{kind:"ok",date:s}}const Ii=new Map;function Ni(e){return void 0===e||""===e?void 0:e}function Wi(e,t,n){var r,a;if(null===t||t.field!==n||""===e)return{text:e,replacedWholeField:!1};if(void 0===t.pattern)return{text:null!=(r=t.replacement)?r:"",replacedWholeField:!0};const i=function(e){var t;if(Ii.has(e))return null!=(t=Ii.get(e))?t:null;let n=null;try{n=new RegExp(e,"gi")}catch(t){at(`Ignoring "replace_pattern": ${JSON.stringify(e)} is not a valid regular expression. Event text is shown unchanged.`)}return Ii.set(e,n),n}(t.pattern);return null===i?{text:e,replacedWholeField:!1}:{text:e.replace(i,null!=(a=t.replacement)?a:""),replacedWholeField:!1}}var Fi=Object.defineProperty,Ui=Object.defineProperties,Ri=Object.getOwnPropertyDescriptors,Ji=Object.getOwnPropertySymbols,Vi=Object.prototype.hasOwnProperty,Bi=Object.prototype.propertyIsEnumerable,Ki=(e,t,n)=>t in e?Fi(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,qi=(e,t)=>{for(var n in t||(t={}))Vi.call(t,n)&&Ki(e,n,t[n]);if(Ji)for(var n of Ji(t))Bi.call(t,n)&&Ki(e,n,t[n]);return e},Gi=(e,t)=>Ui(e,Ri(t));const Zi=new Map;async function Qi(e,t,n,r=!1){const a=Aa(t.first_day_of_week,e.locale),i=function(e,t,n,r,a){const i=t.map((e=>"string"==typeof e?e:e.entity)).sort().join("_");let o="";if(r)try{o=r.includes("T")?r.split("T")[0]:r}catch(e){o=r}const s=o?`_${o}`:"",l=function(e){const t=String(e).replace(/\s+/g,"").toLowerCase();return""!==t&&Ci(t)[0]===Hi}(o)&&void 0!==a?`_fdw${a}`:"";return`${me}${e}_${i}_${n}${s}${l}${de}`}(n,t.entities,t.days_to_show,t.start_date,a),o=function(){if(window.performance&&window.performance.navigation)return 1===window.performance.navigation.type;if(window.performance&&window.performance.getEntriesByType){const e=window.performance.getEntriesByType("navigation");if(e.length>0&&"type"in e[0])return"reload"===e[0].type}return!1}();if(!r){const e=function(e,t,n=!1){const r=ko(e,t,n);if(r)return[...r.events];return null}(i,t,o);if(e)return ot(`Using ${e.length} events from cache`),{events:Xi(e,t,a),failedEntities:[]}}let s=Zi.get(i);s?ot("Joining an in-flight request for the same calendars and window"):(s=async function(e,t,n,r){try{ot("Fetching events from API");const a=t.entities.map((e=>"string"==typeof e?{entity:e,color:"var(--primary-text-color)"}:e)),i=bo(t.days_to_show,t.start_date,r),{events:o,failedEntities:s}=await async function(e,t,n){const r=[],a=[],i=new Set;for(const o of t)if(!i.has(o.entity))try{const t=`calendars/${o.entity}?start=${n.start.toISOString()}&end=${n.end.toISOString()}`;ot(`Fetching calendar events with path: ${t}`);const s=await e.callApi("GET",t);if(!s||!Array.isArray(s)){at(`Invalid response for ${o.entity}`),a.push(o.entity);continue}const l=s.map((e=>Gi(qi({},e),{_entityId:o.entity})));r.push(...l),i.add(o.entity)}catch(t){rt(`Failed to fetch events for ${o.entity}:`,t),a.push(o.entity);try{ot("Available hass API methods:",Object.keys(e).filter((t=>"function"==typeof e[t])))}catch(e){}}return{events:r,failedEntities:a}}(e,a,i);if(o.length>0)Mo(n,o);else if(s.length>0)at(`No events returned and ${s.length} calendar(s) failed to load; not caching empty result`);else{const e=1e3*_e;ot(`No events returned; caching empty result briefly (${_e}s)`),Mo(n,o,e)}return{events:o,failedEntities:s}}finally{Zi.delete(n)}}(e,t,i,a),Zi.set(i,s));const{events:l,failedEntities:d}=await s;return{events:Xi(l,t,a),failedEntities:d}}function Xi(e,t,n){const r=function(e,t){const n=[],r=eo(e),a=e.length-r.length;a>0&&at(`Ignoring ${a} calendar event(s) missing a start or end; the calendar integration returned an incomplete payload`);return t.entities.forEach((e=>{const a="string"==typeof e?e:e.entity,i=r.filter((e=>e._entityId===a));if(0===i.length)return;const o=function(e,t,n){if("string"==typeof t)return mo(e,_o(void 0,n));let r=mo(e,_o(t,n));const a=t.filter_field;if(t.allowlist)try{const e=new RegExp(t.allowlist,"i");r=r.filter((t=>{const n=ho(t,a);return Boolean(n&&e.test(n))}))}catch(e){at(`Invalid allowlist pattern: ${t.allowlist}`,e)}else if(t.blocklist)try{const e=new RegExp(t.blocklist,"i");r=r.filter((t=>{const n=ho(t,a);return!(n&&e.test(n))}))}catch(e){at(`Invalid blocklist pattern: ${t.blocklist}`,e)}return r}(i,e,t),s=o.map((n=>{const r=Gi(qi({},n),{_matchedConfig:"object"==typeof e?e:void 0});return r._entityLabel=go(a,t,r),r}));n.push(...s)})),st(`Processed ${n.length} events after filtering`),n}(e,t),a=Do(t,n),i=new Date(a);return i.setDate(i.getDate()+t.days_to_show),r.filter((e=>{if(!e.start)return!1;let t;if(e.start.dateTime)t=new Date(e.start.dateTime);else{if(!e.start.date)return!1;t=Sa(e.start.date)}return t<i}))}function eo(e){return e.filter((e=>Boolean(e.start)&&Boolean(e.end)))}function to(e,t,n){return e>=n?e:t.toDateString()===n.toDateString()||t>n?n:e}const no=/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/,ro=new Set;function ao(e,t){const n=function(e){if("string"!=typeof e)return null;const t=no.exec(e.trim());if(!t)return null;const n=Number(t[1]);return n>23?null:{hours:n,minutes:Number(t[2]),seconds:t[3]?Number(t[3]):0}}(t);if(!n){if("string"==typeof t&&""!==t.trim()){const e=t.trim();ro.has(e)||(ro.add(e),at(`Invalid allday_expires_at value "${e}" — expected a time such as 10:00`))}const n=new Date(e);return n.setDate(n.getDate()+1),n.setHours(0,0,0,0),n}const r=new Date(e);return r.setHours(n.hours,n.minutes,n.seconds,0),r}function io(e,t,n,r,a="list",i){const o=Xt(t,a),s=function(e,t,n){if(!n||e.length<2)return e;const r=new Set,a=new Set;for(const n of t.entities){const t="string"==typeof n?n:n.entity;for(const n of e){if(n._entityId!==t)continue;const e=po(n);r.has(e)||(r.add(e),a.add(n))}}return e.filter((e=>a.has(e)||!r.has(po(e))))}(eo(e),o,o.filter_duplicates),l=o.show_empty_days,d=!n&&Zt(a),c=function(e,t,n=!1){const r=[];for(const a of e){if(!lo(a,t,n)){r.push(a);continue}if(!so(a)){r.push(a);continue}const e=uo(a);r.push(...e)}return r}(s,o,"column"===a);const u=Do(o,Aa(o.first_day_of_week,i)),_=new Date(u),m=new Date(_);m.setHours(23,59,59,999);const h=new Date(_);h.setDate(h.getDate()+o.days_to_show);const p=new Date,f=c.filter((e=>{if(!(null==e?void 0:e.start)||!(null==e?void 0:e.end))return!1;const t=!e.start.dateTime;let n,r;if(t){if(n=e.start.date?Sa(e.start.date):null,r=e.end.date?Sa(e.end.date):null,r){const e=new Date(r);e.setDate(e.getDate()-1),r=e}}else n=e.start.dateTime?new Date(e.start.dateTime):null,r=e.end.dateTime?new Date(e.end.dateTime):null;if(!n||!r)return!1;if(e._isMultiDaySegment&&n>=h)return!1;if(!(n>=_&&n<=m||n>m||r>=_))return!1;if(!o.show_past_events){if(!t&&r<p)return!1;const n=e._splitFromTimedEvent?void 0:vo(e._entityId,"allday_expires_at",o,e);if(t&&p>=ao(r,n))return!1}const a=function(e){const t=null==e?void 0:e.days_of_week;return"weekdays"===t||"weekends"===t?t:void 0}(e._matchedConfig);return!a||(i=to(n,r,_),s=a,Ta(i)===("weekends"===s));var i,s})),g={};f.length>0&&f.forEach((e=>{var t,n;let a,i;if(!e.start.dateTime){if(a=e.start.date?Sa(e.start.date):null,i=e.end.date?Sa(e.end.date):null,i){const e=new Date(i);e.setDate(e.getDate()-1),i=e}}else a=e.start.dateTime?new Date(e.start.dateTime):null,i=e.end.dateTime?new Date(e.end.dateTime):null;if(!a||!i)return;const s=to(a,i,_),l=La(s),d=Gn(r);g[l]||(g[l]={weekday:d.daysOfWeek[s.getDay()],day:s.getDate(),month:d.months[s.getMonth()],timestamp:s.getTime(),events:[]});const c=null!=(t=vo(e._entityId,"show_description",o,e))?t:o.show_description,u=e.description||"",m=function(e){return e.length>0&&/year/i.test(e)}(u),h=c||m?function(e){if(!e)return"";const t=e.replace($a,""),n=document.createElement("textarea");return n.innerHTML=t,n.value.trim()}(u):"",p=m?function(e){const t=xi.exec(e);return t?Number(t[1]):null}(h):null,f=null===p?null:function(e,t){const n=e-t;return n>=1?n:null}(a.getFullYear(),p),y=e.summary||"",v=function(e,t,n){const r=Ni(t),a=Ni(n);return void 0===r&&void 0===a?null:{field:"location"===e||"description"===e?e:"title",pattern:r,replacement:a}}(vo(e._entityId,"replace_field",o,e),vo(e._entityId,"replace_pattern",o,e),vo(e._entityId,"replace_with",o,e)),w=Wi(y,v,"title"),b=w.replacedWholeField||""!==y.trim()&&""===w.text.trim();g[l].events.push({summary:null===f||b?w.text:Ti(w.text,f),location:(null!=(n=vo(e._entityId,"show_location",o,e))?n:o.show_location)?Wi(ka(e.location||"",o.remove_location_country),v,"location").text:"",description:c?Wi(null===p?h:Li(h),v,"description").text:"",start:e.start,end:e.end,_entityId:e._entityId,_entityLabel:go(e._entityId,o,e),_matchedConfig:e._matchedConfig,_isEmptyDay:e._isEmptyDay,_isCustomEmptyText:e._isCustomEmptyText,_isMultiDaySegment:e._isMultiDaySegment,_splitFromTimedEvent:e._splitFromTimedEvent})}));const y=Aa(o.first_day_of_week,i);Object.values(g).forEach((e=>{const t=new Date(e.timestamp);e.weekNumber=Yo(t,o,y),e.monthNumber=t.getMonth()})),Object.values(g).forEach((e=>{e.events.sort(((e,t)=>{const n=!e.start.dateTime,r=!t.start.dateTime;if(n&&!r)return-1;if(!n&&r)return 1;let a,i;if(a=n&&e.start.date?Sa(e.start.date).getTime():e.start.dateTime?new Date(e.start.dateTime).getTime():0,i=r&&t.start.date?Sa(t.start.date).getTime():t.start.dateTime?new Date(t.start.dateTime).getTime():0,n&&r&&a===i){const n=oo(e._entityId,o),r=oo(t._entityId,o);return n!==r?n-r:(e.summary||"").localeCompare(t.summary||"",void 0,{sensitivity:"base"})}return a-i}))}));const v=d?Math.min(o.compact_days_to_show||o.days_to_show,o.days_to_show):o.days_to_show;let w=Object.values(g).sort(((e,t)=>e.timestamp-t.timestamp)).slice(0,v||3);if(d){const e=new Map;for(const t of w){const n=[];for(const r of t.events){if(r._isEmptyDay){n.push(r);continue}const t=r._entityId,a=r._matchedConfig;let i=-1;a?i=o.entities.findIndex((e=>"object"==typeof e&&e===a)):t&&(i=o.entities.findIndex((e=>"string"==typeof e&&e===t)));const s=-1!==i?`${t}__${i}`:t||"",l=null==a?void 0:a.compact_events_to_show;if("number"!=typeof l||!Number.isFinite(l)){n.push(r);continue}const d=e.get(s)||0;d<l&&(n.push(r),e.set(s,d+1))}t.events=n}}if(n||l||(w=w.filter((e=>e.events.length>0&&!(1===e.events.length&&e.events[0]._isEmptyDay)))),d){const e=o.compact_events_to_show;if("number"==typeof e&&Number.isFinite(e)){let t=[],n=0;if(o.compact_events_complete_days){const r=new Set;for(const t of w)if((1!==t.events.length||!t.events[0]._isEmptyDay)&&n<e&&t.events.length>0){const a=Math.min(t.events.length,e-n);a>0&&(r.add(La(new Date(t.timestamp))),n+=a)}t=w.filter((e=>{const t=La(new Date(e.timestamp));return r.has(t)}))}else{t=[];for(const r of w){if(n>=e&&(1!==r.events.length||!r.events[0]._isEmptyDay))break;if(1===r.events.length&&r.events[0]._isEmptyDay){t.push(r);continue}const a=e-n;if(a>0&&r.events.length>0){const e=Gi(qi({},r),{events:r.events.slice(0,a)});t.push(e),n+=e.events.length}}}w=t}}if(l||0===w.length){const e=Gn(r),t=o.empty_day_text,a=Boolean(t),i=t||e.noEvents,s=new Date(u);let c;if(n)c=new Date(u),c.setDate(c.getDate()+v-1);else if(0===w.length)l?(c=new Date(u),c.setDate(c.getDate()+v-1)):c=new Date(u);else if(d&&o.compact_events_to_show)if(w.length>0){const e=Math.max(...w.map((e=>e.timestamp)));c=new Date(e)}else c=new Date(u);else c=new Date(u),c.setDate(c.getDate()+v-1);const _=new Set(w.map((e=>La(new Date(e.timestamp))))),m=[...w],h=function(e,t){const n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),r=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((r-n)/864e5)}(s,c);for(let t=0;t<=h;t++){const n=new Date(s);n.setDate(s.getDate()+t);const r=La(n);if(!_.has(r)){const t=Yo(n,o,y),s={weekday:e.daysOfWeek[n.getDay()],day:n.getDate(),month:e.months[n.getMonth()],timestamp:n.getTime(),events:[{summary:i,start:{date:r},end:{date:r},_entityId:"_empty_day_",_isEmptyDay:!0,_isCustomEmptyText:a,location:""}],weekNumber:t,monthNumber:n.getMonth()};m.push(s)}}m.sort(((e,t)=>e.timestamp-t.timestamp)),w=m}return w.slice(0,v)}function oo(e,t){if(!e)return Number.MAX_SAFE_INTEGER;const n=t.entities.findIndex((t=>"string"==typeof t?t===e:t.entity===e));return-1!==n?n:Number.MAX_SAFE_INTEGER}function so(e){if(!e.start||!e.end)return!1;if(e.start.date&&e.end.date){const t=new Date(e.start.date),n=new Date(e.end.date);return n.setDate(n.getDate()-1),t.toDateString()!==n.toDateString()}if(e.start.dateTime&&e.end.dateTime){const t=new Date(e.start.dateTime),n=new Date(e.end.dateTime);return t.toDateString()!==n.toDateString()}return!1}function lo(e,t,n=!1){return!n&&e._entityId&&e._matchedConfig&&void 0!==e._matchedConfig.split_multiday_events?e._matchedConfig.split_multiday_events:t.split_multiday_events}function co(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function uo(e){const t=[];if(e.start.date&&e.end.date){const n=Sa(e.start.date),r=Sa(e.end.date);r.setDate(r.getDate()-1);for(let a=new Date(n);a<=r;a.setDate(a.getDate()+1)){const n=co(a),r=new Date(a);r.setDate(r.getDate()+1);const i=co(r),o=Gi(qi({},e),{start:{date:n},end:{date:i},_isMultiDaySegment:!0});t.push(o)}}else if(e.start.dateTime&&e.end.dateTime){const n=new Date(e.start.dateTime),r=new Date(e.end.dateTime),a=new Date(n);a.setHours(23,59,59,999);if(new Date(a.getTime()+1)<r){const i=Gi(qi({},e),{start:{dateTime:n.toISOString()},end:{dateTime:a.toISOString()},_isMultiDaySegment:!0,_splitFromTimedEvent:!0});t.push(i);const o=new Date(n);o.setDate(o.getDate()+1),o.setHours(0,0,0,0);const s=new Date(r);s.setHours(0,0,0,0);for(let n=new Date(o);n<s;n.setDate(n.getDate()+1)){const r=co(n),a=new Date(n);a.setDate(a.getDate()+1);const i=co(a),o=Gi(qi({},e),{start:{date:r},end:{date:i},_isMultiDaySegment:!0,_splitFromTimedEvent:!0});t.push(o)}const l=Gi(qi({},e),{start:{dateTime:s.toISOString()},end:{dateTime:r.toISOString()},_isMultiDaySegment:!0,_splitFromTimedEvent:!0});t.push(l)}else t.push(qi({},e))}return t}function _o(e,t){var n;const r=null!=(n=null==e?void 0:e.event_type)?n:t.event_type;return"timed"===r||"all_day"===r?r:"all"}function mo(e,t){if("all"===t)return[...e];const n="all_day"===t;return e.filter((e=>!e.start.dateTime===n))}function ho(e,t){return"location"===t?e.location:"description"===t?e.description:e.summary}function po(e){const t=e.summary||"",n=e.location||"";let r="";if(e.start.dateTime){r=`${new Date(e.start.dateTime).getTime()}|${e.end.dateTime?new Date(e.end.dateTime).getTime():0}`}else r=`${e.start.date||""}|${e.end.date||""}`;return`${t}|${r}|${n}`}function fo(e,t,n,r,a){if(!e)return"var(--calendar-card-line-color-vertical)";let i;i=r&&r._matchedConfig?r._matchedConfig:t.entities.find((t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e));const o=function(e,t,n,r){const a=null==r?void 0:r.get(e),i="string"==typeof n||null==n?void 0:n.accent_color;if(hi(i)){if(a)return a}else if(i)return i;if(hi(t.accent_color))return null!=a?a:vt.accent_color;return t.accent_color}(e,t,i,a);return void 0===n||0===n||isNaN(n)?o:Le(o,n)}function go(e,t,n){if(!e)return;if(n&&n._matchedConfig)return n._matchedConfig.label;const r=t.entities.find((t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e));return r&&"string"!=typeof r?r.label:void 0}function yo(e,t,n,r){const a=go(e,t,n),i=Ye(a),o=xe(a);if(!i&&!o)return a;const s=vo(e,"label_type",t,n);return je(s)&&s!==(i?"icon":"image")?a:o?function(e,t){var n,r,a;if(!e)return;const i=null==(a=null==(r=null==(n=null==t?void 0:t.states)?void 0:n[e])?void 0:r.attributes)?void 0:a.entity_picture;return"string"==typeof i&&""!==i?i:void 0}(a,r):function(e,t){var n,r,a;if(!e)return;const i=null==(a=null==(r=null==(n=null==t?void 0:t.states)?void 0:n[e])?void 0:r.attributes)?void 0:a.icon;return"string"==typeof i&&""!==i?i:void 0}(e,r)}function vo(e,t,n,r){if(!e)return;if(r&&r._matchedConfig)return r._matchedConfig[t];const a=n.entities.find((t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e));return a&&"string"!=typeof a?a[t]:void 0}function wo(e){if(!e||e._isEmptyDay)return!1;const t=new Date;if(!e.start.dateTime)return!1;const n=e.start.dateTime?new Date(e.start.dateTime):null,r=e.end.dateTime?new Date(e.end.dateTime):null;return!(!n||!r)&&(t>=n&&t<r)}function bo(e,t,n){let r;const a=()=>{const e=new Date;return new Date(e.getFullYear(),e.getMonth(),e.getDate())},i=null==t?"":String(t);if(""!==i.trim())try{const e=i.trim(),t=Pi(e,n,new Date);if("ok"===t.kind)r=t.date,isNaN(r.getTime())?(at(`start_date "${e}" resolved outside the supported date range. Falling back to today.`),r=a()):ot(`Resolved start_date "${e}" to ${La(r)}`);else if("error"===t.kind)at(`Invalid start_date "${e}": ${t.message}. Falling back to today.`),r=a();else if(e.includes("T"))r=new Date(e),isNaN(r.getTime())&&(at(`Invalid ISO date: ${e}, falling back to today`),r=a());else{const[t,n,i]=e.split("-").map(Number);t&&n&&i&&n>=1&&n<=12&&i>=1&&i<=31?(r=new Date(t,n-1,i),r.getFullYear()===t&&r.getMonth()===n-1&&r.getDate()===i||(at(`Impossible date: ${e}, falling back to today`),r=a())):(at(`Malformed date: ${e}, falling back to today`),r=a())}}catch(e){at(`Error parsing date: ${i}, falling back to today`,e),r=a()}else r=a();r.setHours(0,0,0,0);const o=new Date(r),s=parseInt(e.toString())||3;return o.setDate(r.getDate()+s),o.setHours(23,59,59,999),{start:r,end:o}}function Mo(e,t,n){try{ot(`Caching ${t.length} events`);const r={events:t,timestamp:Date.now()};return"number"==typeof n&&n>0&&(r.ttlMs=n),localStorage.setItem(e,JSON.stringify(r)),null!==ko(e)}catch(e){return rt("Failed to cache calendar events:",e),!1}}function ko(e,t,n=!1){try{const r=localStorage.getItem(e);if(!r)return null;const a=JSON.parse(r);if(!function(e){if("object"!=typeof e||null===e||Array.isArray(e))return!1;const t=e;return!("number"!=typeof t.timestamp||!Number.isFinite(t.timestamp))&&!!Array.isArray(t.events)&&t.events.every((e=>"object"==typeof e&&null!==e&&!Array.isArray(e)))}(a))return localStorage.removeItem(e),at(`Malformed cache entry removed for ${e}`),null;const i=a,o=Date.now();let s;s="number"==typeof i.ttlMs&&i.ttlMs>0?i.ttlMs:n&&(null==t?void 0:t.refresh_on_navigate)?1e3*ue:function(e){return 60*((null==e?void 0:e.refresh_interval)||ce)*1e3}(t);return o-i.timestamp<s?i:(localStorage.removeItem(e),ot(`Cache expired and removed for ${e}`),null)}catch(t){at("Cache error:",t);try{localStorage.removeItem(e)}catch(e){}return null}}function Do(e,t){if(e.start_date&&""!==String(e.start_date).trim()){return bo(e.days_to_show,e.start_date,t).start}const n=new Date;return new Date(n.getFullYear(),n.getMonth(),n.getDate())}function Yo(e,t,n){let r=Ca(e,t.show_week_numbers,n);if("iso"===t.show_week_numbers&&0===n&&0===e.getDay()){const t=new Date(e);t.setDate(t.getDate()+1),r=za(t)}return r}function $o(e,t,n,r){var a;const i=Boolean(e._isEmptyDay),o=new Date,s=new Date(o.getFullYear(),o.getMonth(),o.getDate());let l=!1;if(!i){if(!e.start.dateTime){let t=e.end.date?Sa(e.end.date):null;if(t){const e=new Date(t);e.setDate(e.getDate()-1),t=e}l=null!==t&&s>t}else{const t=e.end.dateTime?new Date(e.end.dateTime):null;l=null!==t&&o>t}}const d=yi,c=fo(e._entityId,t,void 0,e,d),u=t.event_background_opacity>0?t.event_background_opacity:0,_=u>0?fo(e._entityId,t,u,e,d):"",m=null!=(a=vo(e._entityId,"show_time",t,e))?a:t.show_time,h=!e.start.dateTime,p=function(e){if(e.start.dateTime)return!1;const t=Sa(e.start.date||""),n=Sa(e.end.date||"");return n.setDate(n.getDate()-1),t.toDateString()!==n.toDateString()}(e),f=m&&!(h&&!p&&!t.show_single_allday_time)&&!(p&&!t.show_multiday_allday_time)&&!i;let g=null;!t.show_countdown||h&&!t.show_countdown_allday||i||l||(g=function(e,t="en"){if(e._isEmptyDay||!e.start)return null;const n=new Date,r=!e.start.dateTime,a=e.start.dateTime?new Date(e.start.dateTime):e.start.date?Sa(e.start.date):null;if(!a||a<=n)return null;const i=r||Boolean(e._isMultiDaySegment),o=new Date(n.getFullYear(),n.getMonth(),n.getDate()),s=new Date(a.getFullYear(),a.getMonth(),a.getDate());return i&&s>o?ba(s,t,o):ba(a,t)}(e,n));const y=wo(e)&&t.show_progress_bar?function(e){if(!wo(e))return null;const t=new Date,n=new Date(e.start.dateTime),r=new Date(e.end.dateTime).getTime()-n.getTime(),a=t.getTime()-n.getTime();return Math.min(100,Math.max(0,Math.floor(a/r*100)))}(e):null,v=function(e,t,n,r){const a=!e.start.dateTime;let i,o;a?(i=Sa(e.start.date||""),o=Sa(e.end.date||"")):(i=new Date(e.start.dateTime||""),o=new Date(e.end.dateTime||""));const s=Gn(n);if(a){const e=new Date(o);return e.setDate(e.getDate()-1),i.toDateString()!==e.toDateString()?{allDayLabel:s.allDay,text:Na(e,n,s)}:{allDayLabel:s.allDay,text:""}}const l=!("system"!==t.time_24h||!(null==r?void 0:r.locale)),d=!0===t.time_24h;return i.toDateString()!==o.toDateString()?{text:Ia(i,o,n,s,l,d,t.time_two_digit_hours,r)}:{text:Pa(i,o,t.show_end_time,l,d,t.time_two_digit_hours,r)}}(e,t,n,r),w=function(e){if("string"==typeof e){const t=e.toLowerCase().trim();return Ie.includes(t)?t:null}return null}(t.allday_badge),b=function(e){if("string"==typeof e){const t=e.toLowerCase().trim();if(Ne.includes(t))return t}return"subtle"}(t.allday_badge_style),M=void 0!==v.allDayLabel,k=function(e){if("string"!=typeof e)return{source:Fe};const t=e.trim();if(""===t)return{source:Fe};const n=t.toLowerCase();return We.includes(n)?{source:n}:{source:"custom",color:t}}(t.allday_badge_color),D="custom"===k.source?k.color:c,Y="text"===k.source,$="time"===w&&M?{label:v.allDayLabel,lang:n,accent:D,mode:b,inheritsText:Y}:void 0,x="title"===w&&M&&!i?{accent:D,mode:b,inheritsText:Y}:void 0,S=$?v.text:function({allDayLabel:e,text:t}){return xa(void 0===e?t:t?`${e}, ${t}`:e)}(v),L=h&&!e._splitFromTimedEvent,T=L&&!t.show_location_allday?"":e.location||"",j=L&&!t.show_description_allday?"":e.description||"";return{isEmptyDay:i,isPastEvent:l,entityAccentColor:c,entityAccentBackgroundColor:_,contentParts:{eventTime:S,allDayBadge:$,titlePill:x,eventLocation:T,locationIcon:Ya(T,vo(e._entityId,"location_icon",t,e)),eventDescription:j,entityLabel:yo(e._entityId,t,e,r),shouldShowTime:f,countdownStr:g,progressPercentage:y}}}var xo=Object.defineProperty,So=Object.getOwnPropertySymbols,Lo=Object.prototype.hasOwnProperty,To=Object.prototype.propertyIsEnumerable,jo=(e,t,n)=>t in e?xo(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;function Ho(e,t){return e.isNewMonth&&!Bt(t.month_separator_width)?{kind:"month",width:t.month_separator_width,color:t.month_separator_color}:e.isNewWeek&&!Bt(t.week_separator_width)?{kind:"week",width:t.week_separator_width,color:t.week_separator_color}:Bt(t.day_separator_width)?null:{kind:"day",width:t.day_separator_width,color:t.day_separator_color}}function zo(e,t,n,r,a,i){const o=new Date(e.timestamp),{isToday:s,isTomorrow:l}=ii(e.timestamp),d=Ta(o),c=ai(o,t,a),u=Vt(t,"day_header_separator_width"),_=Vt(t,"day_header_separator_color"),m=Bt(u)?F:N`<div
        class="column-header-separator"
        style=${xn({borderTopWidth:u,borderTopColor:_,borderTopStyle:"solid"})}
      ></div>`,h=mi(t,s,"inline"),p=h!==F;return N`
    <div
      class=${pn({"day-column":!0,today:s,tomorrow:l,"future-day":!s,weekend:d})}
      style=${xn({gridColumn:String(r+1),gridRow:"2"})}
    >
      <div class="column-day-header">
        <div
          class=${pn({"column-date-content":!0,"with-today-indicator":p})}
        >
          ${h}
          ${oi(o,t,n,s,c)}
        </div>
      </div>
      ${m}
      <div class="column-events">
        ${Dn(e.events,((e,t)=>`${e._entityId}-${e.summary}-${t}`),((r,o)=>function(e,t,n,r,a,i,o){const s=$o(e,r,a,o),l=0===n,d=n===t.events.length-1,c={event:!0,"event-first":l,"event-middle":!l&&!d,"event-last":d,"past-event":s.isPastEvent};return N`
    <div
      class=${pn(c)}
      style="border-inline-start: var(--calendar-card-line-width-vertical) solid ${s.entityAccentColor}; background-color: ${s.entityAccentBackgroundColor};"
    >
      ${_i(e,r,s.contentParts,{weatherForecasts:i,weatherPlacement:"row",progressPlacement:"row",countdownPlacement:"text",hass:o})}
    </div>
  `}(r,e,o,t,n,a,i)))}
      </div>
    </div>
  `}function Eo(e,t,n){return N`
    <div
      class="column-week-number"
      style=${xn(((e,t)=>{for(var n in t||(t={}))Lo.call(t,n)&&jo(e,n,t[n]);if(So)for(var n of So(t))To.call(t,n)&&jo(e,n,t[n]);return e})({gridColumn:String(n+1),gridRow:"1"},t?{}:{visibility:"hidden"}))}
    >
      <div class="week-number">${null!=e?e:""}</div>
    </div>
  `}function Oo(e,t,n,r,a){const i=Vt(t,"day_header_gap"),o=tn(t.day_spacing),s=function(e){return e.map(((t,n)=>{const r=n>0?e[n-1]:void 0;return{isNewWeek:!r||t.weekNumber!==r.weekNumber,isNewMonth:Boolean(r&&t.monthNumber!==r.monthNumber)}}))}(e),l=function(e,t,n){const r=t.map(((e,t)=>e.isNewWeek&&!(0===t&&!n.show_current_week_number)));return null!==n.show_week_numbers&&r.some(Boolean)?e.map(((e,t)=>Eo(e.weekNumber,r[t],t))):e.map((()=>F))}(e,s,t),d=s.map(((e,n)=>({separator:Ho(e,t),index:n}))).filter((({separator:e,index:t})=>null!==e&&t>0)).map((({separator:e,index:t})=>function(e,t,n){return N`
    <div
      class="column-separator column-separator-${e.kind}"
      style=${xn({gridColumn:String(t+1),gridRow:"day"===e.kind?"2":"1 / -1",width:e.width,backgroundColor:e.color,marginInlineStart:`calc(-0.5 * (${n} + ${e.width}))`})}
    ></div>
  `}(e,t,o)));return N`
    <div
      class="column-grid"
      style=${xn({gridTemplateColumns:`repeat(${e.length}, minmax(0, 1fr))`,columnGap:o,"--calendar-card-column-header-gap":i})}
    >
      ${l}
      ${e.map(((e,i)=>zo(e,t,n,i,r,a)))}
      ${d}
    </div>
  `}function Ao(e,t){const n=Gn(t);return"loading"===e?N`
      <div class="calendar-card">
        <div class="loading">${n.loading}</div>
      </div>
    `:N`
    <div class="calendar-card">
      <div class="error">${n.error}</div>
    </div>
  `}function Co(e,t,n,r="day"){if("day"===r)return{borderTopWidth:e,borderTopColor:t,borderTopStyle:"solid",marginTop:"0px",marginBottom:n.day_spacing};let a=be.WEEK;"month"===r&&(a=be.MONTH);const i=Kt(n.day_spacing,a);return{borderTopWidth:e,borderTopColor:t,borderTopStyle:"solid",marginTop:i,marginBottom:i}}function Po(e,t,n,r,a=!1,i="day"){if(Bt(e)||a)return F;const o=Co(e,t,r,i);return N`<div class="${n}" style=${xn(o)}></div>`}function Io(e){return Po(e.month_separator_width,e.month_separator_color,"month-separator",e,!1,"month")}function No(e,t=!1){return Po(e.week_separator_width,e.week_separator_color,"week-separator",e,t,"week")}function Wo(e,t,n,r,a,i,o){const{isToday:s,isTomorrow:l}=ii(e.timestamp),d=Ta(new Date(e.timestamp));let c=F;const u=(null==a?void 0:a.isNewMonth)||!1,_=(null==a?void 0:a.isNewWeek)||!1,m=u&&!Bt(t.month_separator_width),h=_&&(null!==t.show_week_numbers||!Bt(t.week_separator_width)),p=t.day_separator_width,f=t.day_separator_color;if(r&&!Bt(p)&&!m&&!h){const e=Co(p,f,t,"day");c=N`<div class="separator" style=${xn(e)}></div>`}return N`
    ${c}
    <table
      class=${pn({"day-table":!0,today:s,tomorrow:l,"future-day":!s,weekend:d})}
    >
      ${Dn(e.events,((e,t)=>`${e._entityId}-${e.summary}-${t}`),((r,a)=>function(e,t,n,r,a,i,o,s){const l=$o(e,r,a,s),d=new Date(t.timestamp),c=Ta(d),u=0===n,_=n===t.events.length-1,m={event:!0,"event-first":u,"event-middle":!u&&!_,"event-last":_,"past-event":l.isPastEvent};return N`
    <tr>
      ${0===n?N`
            <td
              class="date-column ${c?"weekend":""}"
              rowspan="${t.events.length}"
              style="position: relative;"
            >
              ${function(e,t,n,r,a){return oi(e,t,n,r,ai(e,t,a))}(d,r,a,i,o)}
              ${mi(r,i)}
            </td>
          `:""}
      <td
        class=${pn(m)}
        style="border-inline-start: var(--calendar-card-line-width-vertical) solid ${l.entityAccentColor}; background-color: ${l.entityAccentBackgroundColor};"
      >
        ${_i(e,r,l.contentParts,{weatherForecasts:o})}
      </td>
    </tr>
  `}(r,e,a,t,n,s,i,o)))}
    </table>
  `}function Fo(e,t,n,r,a){return N`
    ${e.map(((i,o)=>{var s;const l=o>0?e[o-1]:void 0,d=null!=(s=i.weekNumber)?s:null;let c=!1;if(l){c=i.weekNumber!==l.weekNumber}else c=!0;const u=l&&i.monthNumber!==l.monthNumber,_=0===o,m={isNewWeek:c,isNewMonth:Boolean(u)};let h=F;return!u||Bt(t.month_separator_width)||c&&null!==t.show_week_numbers?c&&(h=_&&null!==t.show_week_numbers&&!t.show_current_week_number?u?Io(t):No(t,_):null!==t.show_week_numbers?function(e,t,n,r=!1){if(null===e)return F;const a=t?be.MONTH:be.WEEK,i={marginTop:r?"0px":Kt(n.day_spacing,a/2-1),marginBottom:Kt(n.day_spacing,a/2)},o={};return r?o["--separator-display"]="none":t&&!Bt(n.month_separator_width)?(o["--separator-border-width"]=n.month_separator_width,o["--separator-border-color"]=n.month_separator_color,o["--separator-display"]="block"):Bt(n.week_separator_width)?o["--separator-display"]="none":(o["--separator-border-width"]=n.week_separator_width,o["--separator-border-color"]=n.week_separator_color,o["--separator-display"]="block"),N`
    <table class="week-row-table" style=${xn(i)}>
      <tr>
        <td class="week-number-cell">
          <div class="week-number">${e}</div>
        </td>
        <td class="separator-cell" style=${xn(o)}>
          <div class="separator-line"></div>
        </td>
      </tr>
    </table>
  `}(d,Boolean(u),t,_):No(t,_)):h=Io(t),N`
        ${h}
        ${Wo(i,t,n,l,m,r,a)}
      `}))}
  `}const Uo=((e,...t)=>{const r=1===e.length?e[0]:t.reduce(((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[r+1]),e[0]);return new a(r,e,n)})`
  :host {
    display: block;
    height: 100%;
  }
  ha-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    padding: calc(var(--calendar-card-spacing-additional) + 16px) 16px
      calc(var(--calendar-card-spacing-additional) + 16px) 8px;
    background: var(--calendar-card-background-color, var(--card-background-color));
    cursor: pointer;
  }
  ha-card:focus {
    outline: none;
  }
  ha-card:focus-visible {
    outline: 2px solid var(--calendar-card-line-color-vertical);
  }
  .header-container,
  .content-container {
    width: 100%;
  }
  .content-container {
    max-height: var(--calendar-card-max-height, none);
    height: var(--calendar-card-height, auto);
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 1px;
    hyphens: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .content-container:hover {
    scrollbar-width: thin;
    scrollbar-color: var(--secondary-text-color) transparent;
    -ms-overflow-style: auto;
  }
  .card-header-placeholder {
    height: 0;
  }
  .card-header {
    float: left;
    margin: 0 0 16px 8px;
    padding: 0;
    color: var(--calendar-card-color-title, var(--primary-text-color));
    font-size: var(--calendar-card-font-size-title, var(--ha-card-header-font-size, 24px));
    font-weight: var(--ha-font-weight-normal, 400);
    letter-spacing: -0.012em;
    line-height: 1.33;
  }
  .week-row-table {
    height: calc(var(--calendar-card-week-number-font-size) * 1.5);
    width: 100%;
    table-layout: fixed;
    padding-left: 8px;
    border-spacing: 0;
    border: none !important;
  }
  .week-number-cell,
  .separator-cell {
    height: 100%;
  }
  .week-number-cell {
    width: var(--calendar-card-date-column-width);
    position: relative;
    text-align: center;
    vertical-align: middle;
    padding-right: 12px;
  }
  .week-number {
    width: calc(var(--calendar-card-week-number-font-size) * 2.5);
    height: calc(var(--calendar-card-week-number-font-size) * 1.5);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--calendar-card-week-number-font-size);
    font-weight: 500;
    color: var(--calendar-card-week-number-color);
    background-color: var(--calendar-card-week-number-bg-color);
    border-radius: 999px;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  @supports (-webkit-touch-callout: none) {
    .week-number {
      padding-top: calc(var(--calendar-card-week-number-font-size) * 0.1);
    }
  }
  .separator-cell {
    vertical-align: middle;
  }
  .separator-line {
    width: 100%;
    height: var(--separator-border-width, 0);
    background-color: var(--separator-border-color, transparent);
    display: var(--separator-display, none);
  }
  .separator {
    width: 100%;
    margin-left: 8px;
  }
  .week-separator {
    width: 100%;
    margin-left: 8px;
    border-top-style: solid;
  }
  .month-separator {
    width: 100%;
    margin-left: 8px;
    border-top-style: solid;
  }
  table {
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: separate;
    margin-bottom: var(--calendar-card-day-spacing);
  }
  .day-table {
    border: none !important;
  }
  table:last-of-type {
    margin-bottom: 0;
    border-bottom: 0;
  }
  .date-column {
    width: var(--calendar-card-date-column-width);
    min-width: var(--calendar-card-date-column-width);
    max-width: var(--calendar-card-date-column-width);
    vertical-align: var(--calendar-card-date-column-vertical-alignment);
    text-align: center;
    position: relative;
    padding-left: 8px;
    padding-right: 12px;
  }
  .today-indicator-container:not(.inline) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
  .weekday {
    font-size: var(--calendar-card-font-size-weekday);
    line-height: var(--calendar-card-font-size-weekday);
    color: var(--calendar-card-color-weekday);
  }
  .day {
    font-size: var(--calendar-card-font-size-day);
    line-height: var(--calendar-card-font-size-day);
    font-weight: 500;
    color: var(--calendar-card-color-day);
  }
  .month {
    font-size: var(--calendar-card-font-size-month);
    line-height: var(--calendar-card-font-size-month);
    text-transform: uppercase;
    color: var(--calendar-card-color-month);
  }
  .today-indicator-container {
    color: var(--calendar-card-today-indicator-color);
    pointer-events: none;
    z-index: 1;
  }
  .today-indicator-container.inline {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  ha-icon.today-indicator {
    --mdc-icon-size: var(--calendar-card-today-indicator-size);
  }
  img.today-indicator.image {
    width: var(--calendar-card-today-indicator-size);
    height: auto;
    max-height: var(--calendar-card-today-indicator-size);
    object-fit: contain;
  }
  span.today-indicator.emoji {
    font-size: var(--calendar-card-today-indicator-size);
    line-height: 1;
  }
  ha-icon.today-indicator.pulse {
    animation: pulse-animation 2s infinite ease-in-out;
  }
  ha-icon.today-indicator.glow {
    filter: drop-shadow(
      0 0 calc(var(--calendar-card-today-indicator-size) * 0.5)
        var(--calendar-card-today-indicator-color)
    );
  }
  @keyframes pulse-animation {
    0% {
      transform: scale(0.95);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.7;
    }
  }
  .date-column .weather,
  .column-date-content .weather {
    font-size: var(--calendar-card-weather-date-font-size, 12px);
    color: var(--calendar-card-weather-date-color, var(--primary-text-color));
  }
  .date-column .weather {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .weather ha-icon {
    margin-right: 1px;
  }
  .date-column .weather ha-icon,
  .column-date-content .weather ha-icon {
    --mdc-icon-size: var(--calendar-card-weather-date-icon-size, 14px);
  }
  .weather-temp-high,
  .weather-temp-low {
    line-height: 1;
    vertical-align: middle;
  }
  .weather-temp-high {
    font-weight: 500;
  }
  .weather-temp-low {
    opacity: 0.8;
  }
  .weather .weather-uv-index {
    line-height: 1;
    vertical-align: middle;
    font-weight: 500;
    margin-left: 2px;
  }
  .event-weather .weather-uv-index {
    font-weight: 500;
    margin-left: 2px;
  }
  .event {
    padding: var(--calendar-card-event-spacing) 0 var(--calendar-card-event-spacing) 12px;
    border-radius: 0;
  }
  .event-first.event-last {
    border-start-start-radius: 0;
    border-start-end-radius: var(--calendar-card-event-border-radius);
    border-end-end-radius: var(--calendar-card-event-border-radius);
    border-end-start-radius: 0;
  }
  .event-first {
    border-start-end-radius: var(--calendar-card-event-border-radius);
    border-start-start-radius: 0;
  }
  .event-last {
    border-end-end-radius: var(--calendar-card-event-border-radius);
    border-end-start-radius: 0;
  }
  .past-event .event-content {
    opacity: 0.6;
  }
  .event-content {
    display: flex;
    flex-direction: column;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .summary {
    flex: 1;
    margin-right: 12px;
    overflow: hidden;
    overflow-wrap: break-word;
    font-size: var(--calendar-card-font-size-event);
    line-height: 1.2;
    padding-block: 0.2em;
  }
  .event-title {
    font-size: var(--calendar-card-font-size-event);
    font-weight: 500;
    line-height: 1.2;
    color: var(--calendar-card-color-event);
    padding-bottom: 2px;
    text-indent: 0;
    display: var(--calendar-card-title-display);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-title-max-lines);
    overflow: hidden;
  }
  .summary:has(> .label-icon),
  .summary:has(> .label-image) {
    text-indent: calc(-1 * (var(--calendar-card-font-size-event) + 4px));
    padding-inline-start: calc(var(--calendar-card-font-size-event) + 4px);
  }
  .summary:has(> .label-emoji) {
    text-indent: calc(-1 * (var(--calendar-card-font-size-event) * 1.25 + 4px));
    padding-inline-start: calc(var(--calendar-card-font-size-event) * 1.25 + 4px);
  }
  .calendar-label {
    display: inline;
    margin-right: 4px;
  }
  .label-icon {
    --mdc-icon-size: var(--calendar-card-font-size-event);
    vertical-align: middle;
    margin-right: 4px;
  }
  .label-image {
    height: var(--calendar-card-font-size-event);
    width: auto;
    vertical-align: middle;
    margin-right: 4px;
  }
  .event-weather {
    display: flex;
    align-items: center;
    font-weight: 500;
    margin-left: 8px;
    margin-right: 12px;
  }
  .event-weather ha-icon {
    margin-right: 2px;
    --mdc-icon-size: var(--calendar-card-weather-event-icon-size, 14px);
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
  }
  .event-weather .event-weather-text {
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
    font-size: var(--calendar-card-weather-event-font-size, 12px);
  }
  .time-location {
    display: flex;
    flex-direction: column;
    margin-top: 0;
  }
  .time,
  .location,
  .description {
    display: flex;
    align-items: var(--calendar-card-event-icon-vertical-alignment);
    line-height: 1.2;
    margin-top: 2px;
    margin-right: 12px;
  }
  .time span,
  .location span,
  .description span {
    display: inline-block;
    vertical-align: middle;
    overflow-wrap: break-word;
  }
  .time {
    font-size: var(--calendar-card-font-size-time);
    color: var(--calendar-card-color-time);
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    flex-wrap: wrap;
    row-gap: 2px;
    column-gap: 8px;
  }
  .time-actual {
    display: flex;
    align-items: var(--calendar-card-event-icon-vertical-alignment);
  }
  .time .time-actual:has(.allday-badge) {
    align-items: center;
    min-width: 0;
  }
  .time .time-actual .time-text {
    min-width: 0;
    flex: 1 1 auto;
  }
  .time .time-actual .time-text > span {
    display: var(--calendar-card-time-display);
    vertical-align: baseline;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-time-max-lines);
    overflow: hidden;
  }
  .time .time-actual .time-text > .time-countdown {
    display: inline;
    -webkit-line-clamp: none;
    overflow: visible;
    margin-inline-start: 4px;
    margin-inline-end: 0;
    white-space: normal;
  }
  .time .time-actual .time-text > .time-countdown::before {
    content: '\\2060·\\200B';
    margin-inline-end: 4px;
  }
  .time .time-actual .allday-badge + .time-text > .time-countdown {
    margin-inline-start: 0;
  }
  .time-countdown {
    text-align: right;
    color: var(--calendar-card-color-time);
    font-size: var(--calendar-card-font-size-time);
    margin-inline-start: auto;
    margin-inline-end: 12px;
    white-space: nowrap;
  }
  .location {
    font-size: var(--calendar-card-font-size-location);
    color: var(--calendar-card-color-location);
  }
  .description {
    font-size: var(--calendar-card-font-size-description);
    color: var(--calendar-card-color-description);
  }
  .allday-badge,
  .allday-title-pill {
    --badge-ink: color-mix(
      in srgb,
      var(--calendar-card-event-accent) 30%,
      var(--primary-text-color)
    );
    --badge-wash: color-mix(
      in srgb,
      var(--calendar-card-event-accent) 10%,
      var(--calendar-card-background-color, var(--card-background-color))
    );
    --badge-solid: var(--calendar-card-event-accent);
    display: inline-block;
    box-sizing: border-box;
    max-width: 100%;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 999px;
  }
  .allday-pill-tinted {
    color: var(--badge-ink);
    background-color: var(--badge-wash);
    box-shadow: inset 0 0 0 1px var(--badge-solid);
  }
  .allday-badge {
    font-size: 0.85em;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.05;
    padding-block: 0.193em 0.127em;
    padding-inline: 0.5em;
    margin-inline-end: 5px;
  }
  .allday-title-pill {
    font-size: 0.95em;
    line-height: 1.16;
    padding-block: 0.21em;
    padding-inline: 0.55em;
    font-weight: 400;
    vertical-align: middle;
    margin-block: -0.17em;
  }
  @supports (text-box-trim: trim-both) and (text-box-edge: cap alphabetic) {
    .allday-badge {
      text-box-trim: trim-both;
      text-box-edge: cap alphabetic;
      padding-block: 0.3295em;
    }
  }
  .allday-pill-subtle {
    color: var(--badge-ink);
    background-color: var(--badge-wash);
    box-shadow: none;
  }
  .allday-pill-outline {
    color: var(--badge-solid);
    background-color: transparent;
    box-shadow: inset 0 0 0 1px currentColor;
  }
  .allday-pill-filled {
    color: var(--calendar-card-background-color, var(--card-background-color));
    background-color: color-mix(
      in srgb,
      var(--badge-solid) 85%,
      var(--calendar-card-background-color, var(--card-background-color))
    );
    box-shadow: none;
  }
  @supports (color: color-mix(in oklch, red, blue)) {
    .allday-badge,
    .allday-title-pill {
      --badge-ink: color-mix(
        in oklch,
        var(--calendar-card-event-accent) 45%,
        var(--primary-text-color)
      );
      --badge-wash: color-mix(
        in oklch,
        var(--calendar-card-event-accent) 14%,
        var(--calendar-card-background-color, var(--card-background-color))
      );
    }
  }
  @supports (color: oklch(from red l c h)) {
    .allday-badge,
    .allday-title-pill {
      --badge-ink: oklch(
        from color-mix(in oklch, var(--calendar-card-event-accent) 45%, var(--primary-text-color)) l
          calc(c * 2.2) h
      );
      --badge-wash: oklch(
        from
          color-mix(
            in oklch,
            var(--calendar-card-event-accent) 14%,
            var(--calendar-card-background-color, var(--card-background-color))
          )
          l calc(c * 1.8) h
      );
    }
  }
  @supports (color: oklch(from red l c h)) {
    .allday-pill-filled {
      color: oklch(from var(--badge-solid) clamp(0, calc((l - 0.55) * -1000), 1) 0 h);
      background-color: var(--badge-solid);
    }
  }
  .allday-badge.allday-source-text,
  .allday-title-pill.allday-source-text {
    --badge-ink: var(--badge-source);
    --badge-wash: color-mix(in srgb, var(--badge-source) 14%, transparent);
    --badge-solid: var(--badge-source);
  }
  .time-location .event-weather {
    display: flex;
    flex-wrap: nowrap;
    row-gap: 2px;
    align-items: var(--calendar-card-event-icon-vertical-alignment);
    font-size: var(--calendar-card-weather-event-font-size, 12px);
    line-height: 1.2;
    font-weight: normal;
    margin-top: 2px;
    margin-inline-start: 0;
    margin-inline-end: 12px;
    padding-inline-start: calc(var(--calendar-card-weather-event-icon-size, 14px) + 4px);
  }
  .time-location .event-weather ha-icon {
    margin-inline-end: 4px;
    margin-inline-start: calc(-1 * (var(--calendar-card-weather-event-icon-size, 14px) + 4px));
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
  }
  .time-location .event-weather .event-weather-text {
    min-width: 0;
    flex: 1 1 auto;
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
    overflow-wrap: break-word;
  }
  .time-location .event-weather .weather-condition {
    display: var(--calendar-card-weather-event-condition-display);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-weather-event-max-lines);
    overflow: hidden;
    hyphens: manual;
  }
  .time-location .event-weather .event-weather-text > span + span::before {
    content: '\\2060·\\200B';
    margin-inline-start: 4px;
    margin-inline-end: 4px;
  }
  .time-location .event-weather .weather-uv-index {
    margin-inline-start: 0;
    font-weight: normal;
  }
  .description span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-description-max-lines);
    overflow: hidden;
  }
  .time .time-actual > span:not(.time-text):not(.allday-badge) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-time-max-lines);
    overflow: hidden;
  }
  .location span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-location-max-lines);
    overflow: hidden;
  }
  .progress-bar {
    width: var(--calendar-card-progress-bar-width, 60px);
    height: var(--calendar-card-progress-bar-height);
    background-color: color-mix(in srgb, var(--calendar-card-progress-bar-color) 20%, transparent);
    border-radius: 999px;
    overflow: hidden;
    margin-inline-start: auto;
    margin-inline-end: 12px;
  }
  .progress-bar-row {
    width: var(--calendar-card-progress-bar-width, 80%);
    margin-inline-start: 0;
    margin-top: 2px;
  }
  .progress-bar-filled {
    height: 100%;
    background-color: var(--calendar-card-progress-bar-color);
    border-radius: 999px 0 0 999px;
  }
  ha-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    position: relative;
    vertical-align: top;
    top: 0;
    margin-right: 4px;
  }
  .time ha-icon {
    --mdc-icon-size: var(--calendar-card-icon-size-time, 14px);
  }
  .location ha-icon {
    --mdc-icon-size: var(--calendar-card-icon-size-location, 14px);
  }
  .description ha-icon {
    --mdc-icon-size: var(--calendar-card-icon-size-description, 14px);
  }
  .loading,
  .error {
    text-align: center;
    padding: 16px;
  }
  .error {
    color: var(--error-color);
  }
  .loading-indicator {
    position: absolute;
    top: calc(var(--ha-card-border-radius, 12px) * 0.5 + 2px);
    right: calc(var(--ha-card-border-radius, 12px) * 0.5 + 2px);
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    pointer-events: none;
  }
  .loading-indicator .spinner {
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    border: 2px solid color-mix(in srgb, var(--primary-text-color) 25%, transparent);
    border-top-color: var(--primary-text-color);
    border-radius: 50%;
    animation: ccp-spin 0.8s linear infinite;
  }
  @keyframes ccp-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .calendar-card-pro.column-view {
    padding-inline: 16px;
  }
  .calendar-card-pro.column-view .card-header {
    margin-inline-start: 0;
  }
  .column-grid {
    display: grid;
    grid-template-rows: auto auto;
    align-items: start;
    width: 100%;
  }
  .day-column {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .column-day-header {
    position: relative;
    padding-bottom: var(--calendar-card-column-header-gap, 8px);
  }
  .column-date-content {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-areas:
      'weekday weekday .'
      'day month weather';
    align-items: baseline;
    column-gap: 6px;
    row-gap: 2px;
    position: relative;
    z-index: 2;
    min-width: 0;
  }
  .column-date-content .weekday {
    grid-area: weekday;
  }
  .column-date-content .day {
    grid-area: day;
  }
  .column-date-content .month {
    grid-area: month;
  }
  .column-date-content .today-indicator-container.inline {
    grid-area: weekday;
    justify-self: start;
    align-self: center;
    z-index: 3;
  }
  .column-date-content.with-today-indicator .weekday {
    padding-inline-start: calc(var(--calendar-card-today-indicator-size, 6px) + 4px);
  }
  .column-date-content .weather {
    grid-area: weather;
    justify-self: start;
    align-self: baseline;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .column-header-separator {
    margin-bottom: var(--calendar-card-column-header-gap, 8px);
  }
  .column-grid > .column-week-number {
    justify-self: start;
    margin-bottom: 2px;
  }
  .column-events {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .column-events .time-countdown,
  .column-events .progress-bar {
    margin-inline-end: 0;
  }
  .column-events .time {
    justify-content: flex-start;
    box-sizing: border-box;
    column-gap: 4px;
    padding-inline-start: calc(var(--calendar-card-icon-size-time, 14px) + 4px);
  }
  .column-events .time-actual {
    margin-inline-start: calc(-1 * (var(--calendar-card-icon-size-time, 14px) + 4px));
  }
  .column-events .time-countdown {
    margin-inline-start: 0;
    text-align: start;
    white-space: normal;
  }
  .column-events .time-countdown::before {
    content: '·';
    margin-inline-end: 4px;
  }
  .column-separator {
    align-self: stretch;
    justify-self: start;
    pointer-events: none;
  }
`;var Ro=Object.defineProperty,Jo=Object.getOwnPropertySymbols,Vo=Object.prototype.hasOwnProperty,Bo=Object.prototype.propertyIsEnumerable,Ko=(e,t,n)=>t in e?Ro(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;let qo=!0;function Go(e){return"string"==typeof e&&(e.includes("{{")||e.includes("{%"))}async function Zo(e,t,n){const r=null==e?void 0:e.connection;if(!r||!t)return;const a=e=>{if(e&&"error"in e)return"WARNING"===e.level?void st("Template warning",{template:t,error:e.error}):(rt("Template render error",{template:t,error:e.error}),void n.onError(e.error));var r;e&&"result"in e&&n.onResult(null==(r=e.result)?"":"string"==typeof r?r:String(r))},i=e=>r.subscribeMessage(a,((e,t)=>{for(var n in t||(t={}))Vo.call(t,n)&&Ko(e,n,t[n]);if(Jo)for(var n of Jo(t))Bo.call(t,n)&&Ko(e,n,t[n]);return e})({type:"render_template",template:t},e?{report_errors:!0}:{}));try{return await i(qo)}catch(e){if(qo&&function(e){return"invalid_format"===(null==e?void 0:e.code)}(e)){qo=!1,at("Home Assistant rejected the render_template `report_errors` option; falling back to basic template rendering (requires 2023.9+ for error reporting)");try{return await i(!1)}catch(e){return void rt("Failed to subscribe to template",{template:t,error:e})}}const r=null==e?void 0:e.message;return rt("Failed to subscribe to template",{template:t,error:e}),void n.onError(null!=r?r:String(e))}}class Qo{constructor(e){this.callbacks=e,this._hasConnected=!1,this._version=0}update(e,t){const n=Go(t)?t:void 0,r=null==e?void 0:e.connection,a=!this._hasConnected&&Boolean(r);r&&(this._hasConnected=!0),n===this._template&&r===this._connection||(this._template=n,this._connection=r,this._version++,this._clearPending(),this._teardown(),n&&e&&(a?this._subscribe(e,n,this._version):this._debounceId=setTimeout((()=>{this._debounceId=void 0,this._subscribe(e,n,this._version)}),300)))}destroy(){this._version++,this._template=void 0,this._connection=void 0,this._hasConnected=!1,this._clearPending(),this._teardown()}async _subscribe(e,t,n){const r=await Zo(e,t,{onResult:e=>{n===this._version&&this.callbacks.onResult(e)},onError:e=>{n===this._version&&this.callbacks.onError(e)}});r&&(n===this._version?this._unsubscribe=r:r())}_clearPending(){this._debounceId&&(clearTimeout(this._debounceId),this._debounceId=void 0)}_teardown(){if(this._unsubscribe){try{this._unsubscribe()}catch(e){at("Failed to unsubscribe from template",e)}this._unsubscribe=void 0}}}var Xo=Object.defineProperty,es=Object.defineProperties,ts=Object.getOwnPropertyDescriptor,ns=Object.getOwnPropertyDescriptors,rs=Object.getOwnPropertySymbols,as=Object.prototype.hasOwnProperty,is=Object.prototype.propertyIsEnumerable,os=(e,t,n)=>t in e?Xo(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,ss=(e,t)=>{for(var n in t||(t={}))as.call(t,n)&&os(e,n,t[n]);if(rs)for(var n of rs(t))is.call(t,n)&&os(e,n,t[n]);return e},ls=(e,t)=>es(e,ns(t)),ds=(e,t,n,r)=>{for(var a,i=r>1?void 0:r?ts(t,n):t,o=e.length-1;o>=0;o--)(a=e[o])&&(i=(r?a(t,n,i):a(i))||i);return r&&i&&Xo(t,n,i),i};function cs(e,t){const n=e,r=null==n?void 0:n.CalendarCardProEditor;if("function"!=typeof r)throw new Error("Calendar Card Pro: the editor file was found but is not the card’s editor. This usually means another file of the same name is installed alongside it — put the card’s files in a folder of their own, or reinstall through HACS, which does that for you. The card itself is unaffected.");const a=null==n?void 0:n.EDITOR_VERSION;a!==de&&at(`Editor file is v${null!=a?a:"unknown"} but the card is v${de}. Both files come from the same release, so one of them is stale — hard-refresh the browser, and if that does not help, reinstall so the card and editor files are replaced together.`),customElements.get(t)||customElements.define(t,r)}let us=class extends ae{constructor(){super(),this.config=ss({},vt),this.events=[],this.isInitialLoad=!0,this.isLoading=!1,this.isExpanded=!1,this.weatherForecasts={daily:{},hourly:{}},this.preview=!1,this.editMode=!1,this.connectedWhileHidden=!0,this._instanceId=ze(),this._eventsInstanceId="",this._eventRequestGeneration=0,this._language="",this._lastUpdateTime=0,this._weatherUnsubscribers=[],this._weatherSetupVersion=0,this._weatherSetupPending=!1,this._hasFetchError=!1,this._activePointerId=null,this._holdTriggered=!1,this._holdTimer=null,this._holdIndicator=null,this._measuredWidthPx=null,this._effectiveView="list",this._columnCount=0,this._resizeObserver=null,this._widthSettleTimerId=null,this._handleVisibilityChange=()=>{if("visible"===document.visibilityState){Date.now()-this._lastUpdateTime>ve&&(st("Visibility changed to visible, updating events"),this.updateEvents())}},this._onEntityColorsChanged=()=>{this.requestUpdate()},this._instanceId=ze(),nt(de)}static async getConfigElement(){if(!customElements.get("calendar-card-pro-editor"))try{cs(await import(function(e){const t=new URL("./editor.js",e);return t.search=new URL(e).search,t.href}(import.meta.url)),"calendar-card-pro-editor")}catch(e){const t=e instanceof Error?e.message:String(e);throw rt(e,"loading the editor file"),new Error(`Calendar Card Pro: the editor could not be loaded because one of the card’s files is missing. Reinstalling the card in HACS restores it. The card itself is unaffected. (${t})`)}return document.createElement("calendar-card-pro-editor")}getGridOptions(){return{columns:"full",rows:"auto"}}get safeHass(){return this.hass||null}get effectiveLanguage(){return!this._language&&this.hass&&(this._language=qn(this.config.language,this.hass.locale)),this._language||"en"}get groupedEvents(){var e;return io(this.events,this.effectiveConfig,this.isExpanded,this.effectiveLanguage,this.effectiveView,null==(e=this.hass)?void 0:e.locale)}get requestedView(){return this.config.view}get effectiveView(){return this.preview||this.editMode?this.requestedView:this._effectiveView}get effectiveConfig(){const e=this.effectiveView,t=this._effectiveConfigCache;if(t&&t.config===this.config&&t.view===e)return t.resolved;const n=Xt(this.config,e);return this._effectiveConfigCache={config:this.config,view:e,resolved:n},n}get effectiveTitle(){var e;return Go(this.config.title)?null!=(e=this.renderedTitle)?e:"":this.config.title}get isTitlePending(){return Go(this.config.title)&&void 0===this.renderedTitle}get visibleEventCount(){var e,t;const n=this.effectiveLanguage,r=this.effectiveView,a=Aa(this.config.first_day_of_week,null==(e=this.hass)?void 0:e.locale),i=this._visibleCountCache;if(i&&i.events===this.events&&i.config===this.config&&i.view===r&&i.language===n&&i.firstWeekday===a)return i.count;const o=this.events.length?io(this.events,this.effectiveConfig,!0,n,r,null==(t=this.hass)?void 0:t.locale).reduce(((e,t)=>e+t.events.filter((e=>!e._isEmptyDay)).length),0):0;return this._visibleCountCache={events:this.events,config:this.config,view:r,language:n,firstWeekday:a,count:o},o}static get styles(){return Uo}connectedCallback(){super.connectedCallback(),st("Component connected"),this.startRefreshTimer(),this.updateEvents(),this._scheduleWeatherSetup(),this._updateTitleSubscription(),document.addEventListener("visibilitychange",this._handleVisibilityChange),this._syncEntityColors(),this._startWidthObserver()}disconnectedCallback(){var e;super.disconnectedCallback(),this._stopWidthObserver(),this._weatherSetupVersion++,this._weatherSetupPending=!1,this._cleanupWeatherSubscriptions(),null==(e=this._titleSubscription)||e.destroy(),this._titleSubscription=void 0,this._refreshTimerId&&clearTimeout(this._refreshTimerId),this._initialLoadRetryId&&(clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=void 0),this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._holdIndicator&&(cn(this._holdIndicator),this._holdIndicator=null),document.removeEventListener("visibilitychange",this._handleVisibilityChange),$i(this._onEntityColorsChanged),st("Component disconnected")}_startWidthObserver(){this._resizeObserver||"undefined"==typeof ResizeObserver||(this._resizeObserver=new ResizeObserver((e=>{var t,n;const r=null==(n=null==(t=e[0])?void 0:t.contentRect)?void 0:n.width;"number"==typeof r&&r>0&&this._scheduleWidthMeasurement(r)})),this._resizeObserver.observe(this))}_scheduleWidthMeasurement(e){null!==this._widthSettleTimerId&&clearTimeout(this._widthSettleTimerId),this._widthSettleTimerId=window.setTimeout((()=>{this._widthSettleTimerId=null,this._handleWidthMeasured(e)}),we)}_stopWidthObserver(){var e;null==(e=this._resizeObserver)||e.disconnect(),this._resizeObserver=null,null!==this._widthSettleTimerId&&(clearTimeout(this._widthSettleTimerId),this._widthSettleTimerId=null)}_handleWidthMeasured(e){const t=(n=this.requestedView,r=this.config,a=this._measuredWidthPx,i=e,o={view:this._effectiveView,columns:this._columnCount},ln(n,r,i,null===a?null:o));var n,r,a,i,o;this._measuredWidthPx=e,t.view===this._effectiveView&&t.columns===this._columnCount||(st(`Layout changed from ${this._effectiveView}/${this._columnCount} to ${t.view}/${t.columns} at ${Math.round(e)}px`),this._effectiveView=t.view,this._columnCount=t.columns,this.requestUpdate())}updated(e){var t,n,r,a,i,o,s,l,d,c,u;e.has("hass")&&this.hass&&!e.get("hass")&&this.updateEvents(!0),(e.has("hass")&&(null==(t=this.hass)?void 0:t.locale)||e.has("config")&&(null==(n=e.get("config"))?void 0:n.language)!==this.config.language)&&(this._language=qn(this.config.language,null==(r=this.hass)?void 0:r.locale));const _=e.has("hass")&&this.hass&&!e.get("hass"),m=e.get("config"),h=e.has("config")&&(null==(i=null==(a=this.config)?void 0:a.weather)?void 0:i.entity)!==(null==(o=null==m?void 0:m.weather)?void 0:o.entity),p=h||e.has("config")&&(null==(l=null==(s=this.config)?void 0:s.weather)?void 0:l.position)!==(null==(d=null==m?void 0:m.weather)?void 0:d.position);h&&(this.weatherForecasts={daily:{},hourly:{}}),(_||p)&&this._scheduleWeatherSetup(),(null==(u=null==(c=this.config)?void 0:c.weather)?void 0:u.entity)&&Ga(this.hass,this.config.language,(()=>this.requestUpdate())),this._syncEntityColors(),(e.has("hass")||e.has("config"))&&this._updateTitleSubscription(),this._applyVisibility()}_updateTitleSubscription(){if(!Go(this.config.title))return this._titleSubscription&&(this._titleSubscription.destroy(),this._titleSubscription=void 0),void(this.renderedTitle=void 0);this._titleSubscription||(this._titleSubscription=new Qo({onResult:e=>{this.renderedTitle=e},onError:()=>{void 0===this.renderedTitle&&(this.renderedTitle="")}})),this._titleSubscription.update(this.hass,this.config.title)}_applyVisibility(){const e=!(this.isInitialLoad||this.safeHass&&0!==this.config.entities.length),t=!(!0!==this.config.hide_when_empty||this.preview||this.editMode||e||this._hasFetchError||0!==this.visibleEventCount);this.hidden!==t&&(st(`hide_when_empty: ${t?"hiding":"revealing"} card`),this.hidden=t,this.style.display=t?"none":"",this.dispatchEvent(new CustomEvent("card-visibility-changed",{detail:{value:!t},bubbles:!0,composed:!0})))}getCustomStyles(){return function(e){var t,n,r,a,i,o,s,l,d,c,u,_,m,h,p,f,g,y,v,w;const b={"--calendar-card-background-color":e.background_color,"--calendar-card-font-size-weekday":e.weekday_font_size,"--calendar-card-font-size-day":e.day_font_size,"--calendar-card-font-size-month":e.month_font_size,"--calendar-card-font-size-event":e.event_font_size,"--calendar-card-font-size-time":e.time_font_size,"--calendar-card-font-size-location":e.location_font_size,"--calendar-card-font-size-description":e.description_font_size,"--calendar-card-color-weekday":e.weekday_color,"--calendar-card-color-day":e.day_color,"--calendar-card-color-month":e.month_color,"--calendar-card-color-event":e.event_color,"--calendar-card-color-time":e.time_color,"--calendar-card-color-location":e.location_color,"--calendar-card-color-description":e.description_color,"--calendar-card-line-color-vertical":e.accent_color,"--calendar-card-line-width-vertical":e.vertical_line_width,"--calendar-card-day-spacing":e.day_spacing,"--calendar-card-event-spacing":e.event_spacing,"--calendar-card-spacing-additional":e.additional_card_spacing,"--calendar-card-height":e.height||"auto","--calendar-card-max-height":e.max_height,"--calendar-card-progress-bar-color":e.progress_bar_color,"--calendar-card-progress-bar-height":e.progress_bar_height,"--calendar-card-icon-size-time":e.time_icon_size||"14px","--calendar-card-icon-size-location":e.location_icon_size||"14px","--calendar-card-icon-size-description":e.description_icon_size||"14px","--calendar-card-description-max-lines":e.description_max_lines>0?String(e.description_max_lines):"none","--calendar-card-title-max-lines":e.title_max_lines>0?String(e.title_max_lines):"none","--calendar-card-time-max-lines":e.time_max_lines>0?String(e.time_max_lines):"none","--calendar-card-location-max-lines":e.location_max_lines>0?String(e.location_max_lines):"none","--calendar-card-title-display":e.title_max_lines>0?"-webkit-box":"inline","--calendar-card-time-display":e.time_max_lines>0?"-webkit-box":"inline","--calendar-card-date-column-width":Kt(e.day_font_size,1.75),"--calendar-card-date-column-vertical-alignment":e.date_vertical_alignment,"--calendar-card-event-icon-vertical-alignment":"top"===e.event_icon_vertical_alignment?"flex-start":"bottom"===e.event_icon_vertical_alignment?"flex-end":"center","--calendar-card-event-border-radius":"calc(var(--ha-card-border-radius, 10px) / 2)","--ha-ripple-hover-opacity":"0.04","--ha-ripple-hover-color":e.accent_color,"--ha-ripple-pressed-opacity":"0.12","--ha-ripple-pressed-color":e.accent_color,"--calendar-card-today-indicator-color":e.today_indicator_color,"--calendar-card-today-indicator-size":e.today_indicator_size,"--calendar-card-week-number-font-size":e.week_number_font_size,"--calendar-card-week-number-color":e.week_number_color,"--calendar-card-week-number-bg-color":e.week_number_background_color,"--calendar-card-empty-day-color":e.empty_day_color===vt.empty_day_color?"color-mix(in srgb, var(--primary-text-color) 60%, transparent)":e.empty_day_color,"--calendar-card-weather-date-icon-size":(null==(n=null==(t=e.weather)?void 0:t.date)?void 0:n.icon_size)||"14px","--calendar-card-weather-date-font-size":(null==(a=null==(r=e.weather)?void 0:r.date)?void 0:a.font_size)||"12px","--calendar-card-weather-date-color":(null==(o=null==(i=e.weather)?void 0:i.date)?void 0:o.color)||"var(--primary-text-color)","--calendar-card-weather-event-icon-size":(null==(l=null==(s=e.weather)?void 0:s.event)?void 0:l.icon_size)||"14px","--calendar-card-weather-event-font-size":(null==(c=null==(d=e.weather)?void 0:d.event)?void 0:c.font_size)||"12px","--calendar-card-weather-event-max-lines":(null!=(m=null==(_=null==(u=e.weather)?void 0:u.event)?void 0:_.max_lines)?m:0)>0?String(null==(p=null==(h=e.weather)?void 0:h.event)?void 0:p.max_lines):"none","--calendar-card-weather-event-condition-display":(null!=(y=null==(g=null==(f=e.weather)?void 0:f.event)?void 0:g.max_lines)?y:0)>0?"-webkit-box":"inline"};return e.progress_bar_width&&(b["--calendar-card-progress-bar-width"]=e.progress_bar_width),e.title_font_size&&(b["--calendar-card-font-size-title"]=e.title_font_size),e.title_color&&(b["--calendar-card-color-title"]=e.title_color),(null==(w=null==(v=e.weather)?void 0:v.event)?void 0:w.color)&&(b["--calendar-card-weather-event-color"]=e.weather.event.color),b}(this.effectiveConfig)}_syncEntityColors(){var e,t;this.isConnected&&(hi((e=this.config).accent_color)||(null!=(t=e.entities)?t:[]).some((e=>"object"==typeof e&&null!==e&&hi(e.accent_color)))?Yi(this.hass,this._onEntityColorsChanged):$i(this._onEntityColorsChanged))}startRefreshTimer(){this._refreshTimerId&&clearTimeout(this._refreshTimerId);const e=this.config.refresh_interval||ce,t=60*e*1e3;this._refreshTimerId=window.setTimeout((()=>{this.updateEvents(),this.startRefreshTimer()}),t),st(`Scheduled next refresh in ${e} minutes`)}_scheduleWeatherSetup(){this._weatherSetupPending||(this._weatherSetupPending=!0,queueMicrotask((()=>{this._weatherSetupPending=!1,this.isConnected&&this._setupWeatherSubscriptions()})))}async _setupWeatherSubscriptions(){var e,t;const n=++this._weatherSetupVersion;if(this._cleanupWeatherSubscriptions(),!(null==(t=null==(e=this.config)?void 0:e.weather)?void 0:t.entity)||!this.hass)return;const r=function(e){if(!e||!e.entity)return[];const t=Qa(e);return"none"===t?[]:"date"===t?["daily"]:["daily","hourly"]}(this.config.weather);for(const e of r){if(this._weatherSetupVersion!==n)return;const t=await ri(this.hass,this.config,e,(t=>{this.weatherForecasts=ls(ss({},this.weatherForecasts),{[e]:t}),this.requestUpdate()}));if(this._weatherSetupVersion!==n)return void(t&&t());t&&this._weatherUnsubscribers.push(t)}}_cleanupWeatherSubscriptions(){const e=this._weatherUnsubscribers.length;e>0&&st(`Unsubscribing ${e} weather forecast subscription(s)`),this._weatherUnsubscribers.forEach((e=>{try{"function"==typeof e&&e()}catch(e){at("Failed to unsubscribe weather forecast",e)}})),this._weatherUnsubscribers=[]}_handlePointerDown(e){this._activePointerId=e.pointerId,this._holdTriggered=!1,this.config.hold_action&&"none"!==this.config.hold_action.action&&(this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=window.setTimeout((()=>{this._activePointerId===e.pointerId&&(this._holdTriggered=!0,this._holdIndicator=function(e,t){const n=document.createElement("div");n.style.position="absolute",n.style.pointerEvents="none",n.style.borderRadius="50%",n.style.backgroundColor=t.accent_color,n.style.opacity=`${Me}`,n.style.transform="translate(-50%, -50%) scale(0)",n.style.transition=`transform ${ge}ms ease-out`,n.style.left=e.pageX+"px",n.style.top=e.pageY+"px";const r="touch"===e.pointerType?ke.TOUCH_SIZE:ke.POINTER_SIZE;return n.style.width=`${r}px`,n.style.height=`${r}px`,document.body.appendChild(n),setTimeout((()=>{n.style.transform="translate(-50%, -50%) scale(1)"}),10),st("Created hold indicator"),n}(e,this.config))}),fe))}_handlePointerUp(e){e.pointerId===this._activePointerId&&(this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._holdTriggered&&this.config.hold_action?(st("Executing hold action"),dn(this,this.config,"hold",(()=>this.toggleExpanded()))):!this._holdTriggered&&this.config.tap_action&&(st("Executing tap action"),dn(this,this.config,"tap",(()=>this.toggleExpanded()))),this._activePointerId=null,this._holdTriggered=!1,this._holdIndicator&&(cn(this._holdIndicator),this._holdIndicator=null))}_handlePointerCancel(){this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._activePointerId=null,this._holdTriggered=!1,this._holdIndicator&&(cn(this._holdIndicator),this._holdIndicator=null)}_handleKeyDown(e){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),dn(this,this.config,"tap",(()=>this.toggleExpanded())))}setConfig(e){const t=this.config;for(const t of function(e){const t=e,n=[];for(const[e,r]of Object.entries(bt))e in t&&n.push(`"${e}" was removed in v3.0.0 and is being ignored — use "${r}"`);const r=t.entities;return Array.isArray(r)&&r.forEach(((e,t)=>{if("object"!=typeof e||null===e)return;const r=e;for(const[e,a]of Object.entries(Mt))e in r&&n.push(`"${e}" on entities[${t}] was removed in v3.0.0 and is being ignored — use "${a}"`)})),n}(e))it(t);const n=kt(vt,e);var r;this.config=n,this.config.entities=(r=this.config.entities,Array.isArray(r)?r.map((e=>"string"==typeof e?{entity:e,color:void 0,accent_color:void 0,label_icon_color:void 0}:e&&"object"==typeof e&&e.entity?{entity:e.entity,label:e.label,label_type:je(e.label_type)?e.label_type:void 0,color:e.color||void 0,accent_color:e.accent_color||void 0,label_icon_color:e.label_icon_color||void 0,show_time:e.show_time,show_location:e.show_location,location_icon:e.location_icon||void 0,show_description:e.show_description,compact_events_to_show:wt(e.compact_events_to_show,0),blocklist:e.blocklist,allowlist:e.allowlist,filter_field:e.filter_field,replace_field:e.replace_field,replace_pattern:e.replace_pattern,replace_with:e.replace_with,split_multiday_events:e.split_multiday_events,event_type:e.event_type,days_of_week:e.days_of_week,allday_expires_at:e.allday_expires_at}:null)).filter(Boolean):[]),function(e){var t,n,r;e.days_to_show=null!=(t=wt(e.days_to_show,1))?t:vt.days_to_show,e.refresh_interval=null!=(n=wt(e.refresh_interval,1))?n:vt.refresh_interval,e.event_background_opacity=null!=(r=wt(e.event_background_opacity,0))?r:vt.event_background_opacity,e.compact_days_to_show=wt(e.compact_days_to_show,1),e.compact_events_to_show=wt(e.compact_events_to_show,0)}(this.config),xt(this.config),function(e){const t=e.view;"list"!==t&&"column"!==t&&(at(`Ignoring "view: ${JSON.stringify(t)}": not a recognized view. Expected "list" or "column". Falling back to "list".`),e.view="list")}(this.config),en(this.config);const a=ln(this.config.view,this.config,this._measuredWidthPx,null===this._measuredWidthPx?null:{view:this._effectiveView,columns:this._columnCount});this._effectiveView=a.view,this._columnCount=a.columns,this._instanceId=Ee(this.config.entities,this.config.days_to_show,this.config.start_date,this.config.first_day_of_week);const i=function(e,t){if(!e||0===Object.keys(e).length)return!0;const n=(e.entities||[]).map((e=>"string"==typeof e?e:e.entity)).sort().join(","),r=(t.entities||[]).map((e=>"string"==typeof e?e:e.entity)).sort().join(","),a=(null==e?void 0:e.refresh_interval)!==(null==t?void 0:t.refresh_interval),i=n!==r||e.days_to_show!==t.days_to_show||e.start_date!==t.start_date||e.first_day_of_week!==t.first_day_of_week;return(i||a)&&st("Configuration change requires data refresh"),i||a}(t,this.config);var o,s;i?(st("Configuration changed, refreshing data"),this.updateEvents(!0)):(o=t,s=this.config,o&&0!==Object.keys(o).length&&(Tt(o.entities)!==Tt(s.entities)||jt.some((e=>o[e]!==s[e])))&&(st("Per-calendar configuration changed, reprocessing cached data"),this.updateEvents(!1))),this.startRefreshTimer()}async updateEvents(e=!1){st(`Updating events (force=${e})`);const t=++this._eventRequestGeneration,n=()=>t!==this._eventRequestGeneration;if(this.safeHass&&this._initialLoadRetryId&&(clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=void 0),!this.safeHass||!this.config.entities.length)return this.isLoading=!1,void(this.safeHass?this.isInitialLoad=!1:(this._initialLoadRetryId&&clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=window.setTimeout((()=>{this.updateEvents(!0)}),1500)));try{this.isLoading=!0,await this.updateComplete;const{events:t,failedEntities:r}=await Qi(this.safeHass,this.config,this._instanceId,e);if(n())return void st("Discarding a superseded event response");if(this._hasFetchError=r.length>0,this._hasFetchError&&at(`Could not load calendar(s): ${r.join(", ")}`),this.isLoading=!1,this.isInitialLoad=!1,await this.updateComplete,n())return void st("Discarding a superseded event response");const a=this._eventsInstanceId===this._instanceId;this._hasFetchError&&0===t.length&&this.events.length>0&&a?at("Refresh failed and returned nothing — keeping previously loaded events"):(this.events=[...t],this._eventsInstanceId=this._instanceId),this._hasFetchError||(this._lastUpdateTime=Date.now(),ot("Event update completed successfully"))}catch(e){if(n())return void st("Ignoring a failure from a superseded event request");rt("Failed to update events:",e),this._hasFetchError=!0,this.isLoading=!1,this.isInitialLoad=!1}}hasCompactModeLimits(){var e;if(!Zt(this.effectiveView))return!1;const t=e=>"number"==typeof e&&Number.isFinite(e);return!(!t(this.config.compact_events_to_show)&&!t(this.config.compact_days_to_show))||(null!=(e=this.config.entities)?e:[]).some((e=>"object"==typeof e&&null!==e&&t(e.compact_events_to_show)))}toggleExpanded(){this.hasCompactModeLimits()&&(this.isExpanded=!this.isExpanded)}handleAction(e){const t=e===this.config.hold_action?"hold":"tap";dn(this,this.config,t,(()=>this.toggleExpanded()))}render(){const e=this.getCustomStyles(),t={keyDown:e=>this._handleKeyDown(e),pointerDown:e=>this._handlePointerDown(e),pointerUp:e=>this._handlePointerUp(e),pointerCancel:()=>this._handlePointerCancel(),pointerLeave:()=>this._handlePointerCancel()};let n;const r=e=>"column"===this.effectiveView?Oo(this._columnCount>0&&this._columnCount<e.length?e.slice(0,this._columnCount):e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass):Fo(e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass);return n=this.isInitialLoad?Ao("loading",this.effectiveLanguage):this.safeHass&&this.config.entities.length?0===this.events.length&&this._hasFetchError?Ao("error",this.effectiveLanguage):r(this.groupedEvents):Ao("error",this.effectiveLanguage),function(e,t,n,r,a=!1,i=!1,o="list"){const s=["calendar-card-pro",Qt(o)].filter((e=>""!==e)).join(" ");return N`
    <ha-card
      class=${s}
      style=${xn(e)}
      tabindex="0"
      aria-busy=${a?"true":"false"}
      @keydown=${r.keyDown}
      @pointerdown=${r.pointerDown}
      @pointerup=${r.pointerUp}
      @pointercancel=${r.pointerCancel}
      @pointerleave=${r.pointerLeave}
    >
      <ha-ripple></ha-ripple>

      ${a?N`
            <div class="loading-indicator" role="status" aria-live="polite" title="Loading">
              <div class="spinner" aria-hidden="true"></div>
            </div>
          `:F}

      <!-- Title is always rendered with the same structure, even if empty.
           A templated title holds the h1 open from first paint, so the header
           does not gain 16px of margin the moment its value arrives. That is a
           claim about the *pending* window only: once a value is in hand the
           header behaves exactly as it would for a static title of the same
           text, so a template resolving to an empty string collapses back to
           the zero-height placeholder rather than leaving an empty heading
           taking up space forever. -->
      <div class="header-container">
        ${t||i?N`<h1 class="card-header">${t}</h1>`:N`<div class="card-header-placeholder"></div>`}
      </div>

      <!-- Content container is always present -->
      <div class="content-container">${n}</div>
    </ha-card>
  `}(e,this.effectiveTitle,n,t,this.isLoading,this.isTitlePending,this.effectiveView)}};us.getStubConfig=Et,ds([le({attribute:!1})],us.prototype,"hass",2),ds([le({attribute:!1})],us.prototype,"config",2),ds([le({attribute:!1})],us.prototype,"events",2),ds([le({attribute:!1})],us.prototype,"isInitialLoad",2),ds([le({attribute:!1})],us.prototype,"isLoading",2),ds([le({attribute:!1})],us.prototype,"isExpanded",2),ds([le({attribute:!1})],us.prototype,"weatherForecasts",2),ds([le({attribute:!1})],us.prototype,"renderedTitle",2),ds([le({type:Boolean})],us.prototype,"preview",2),ds([le({type:Boolean})],us.prototype,"editMode",2),us=ds([(e=>(t,n)=>{void 0!==n?n.addInitializer((()=>{customElements.define(e,t)})):customElements.define(e,t)})("calendar-card-pro")],us);const _s=customElements.get("calendar-card-pro");_s&&(_s.getStubConfig=Et),window.customCards=window.customCards||[],window.customCards.push({type:"calendar-card-pro",name:"Calendar Card Pro",preview:!0,description:"A calendar card that supports multiple calendars with individual styling.",documentationURL:"https://github.com/alexpfau/calendar-card-pro",getEntitySuggestion:function(e,t){if("string"!=typeof t||"calendar"!==t.split(".")[0])return null;if(!e||"object"!=typeof e)return null;const n=e.states;return n&&"object"==typeof n&&n[t]?[{config:yt(gt({},zt([t])),{grid_options:gt({},Ht)})},{label:"Columns",config:yt(gt({},zt([t])),{view:"column",grid_options:gt({},Ht)})}]:null}});export{cs as adoptEditorComponent};
