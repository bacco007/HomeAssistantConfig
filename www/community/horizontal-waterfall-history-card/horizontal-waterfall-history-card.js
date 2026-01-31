/* Waterfall History Card v4.2.0 */
function t(t,e,i,s){var n,o=arguments.length,a=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,s);else for(var r=t.length-1;r>=0;r--)(n=t[r])&&(a=(o<3?n(a):o>3?n(e,i,a):n(e,i))||a);return o>3&&a&&Object.defineProperty(e,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),n=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},r=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:h,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,f=globalThis,g=f.trustedTypes,_=g?g.emptyScript:"",y=f.reactiveElementPolyfillSupport,m=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);n?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),n=e.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=s;const o=n.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){const s=this.constructor,n=this[t];if(i??=s.getPropertyOptions(t),!((i.hasChanged??$)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==n||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[m("elementProperties")]=new Map,x[m("finalized")]=new Map,y?.({ReactiveElement:x}),(f.reactiveElementVersions??=[]).push("2.1.1");const w=globalThis,E=w.trustedTypes,A=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,k="?"+S,O=`<${k}>`,T=document,P=()=>T.createComment(""),H=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,N="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,z=/>/g,D=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),V=/'/g,L=/"/g,I=/^(?:script|style|textarea|title)$/i,F=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),B=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),W=new WeakMap,q=T.createTreeWalker(T,129);function G(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const K=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?"<svg>":3===e?"<math>":"",a=M;for(let e=0;e<i;e++){const i=t[e];let r,l,h=-1,c=0;for(;c<i.length&&(a.lastIndex=c,l=a.exec(i),null!==l);)c=a.lastIndex,a===M?"!--"===l[1]?a=R:void 0!==l[1]?a=z:void 0!==l[2]?(I.test(l[2])&&(n=RegExp("</"+l[2],"g")),a=D):void 0!==l[3]&&(a=D):a===D?">"===l[0]?(a=n??M,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,r=l[1],a=void 0===l[3]?D:'"'===l[3]?L:V):a===L||a===V?a=D:a===R||a===z?a=M:(a=D,n=void 0);const d=a===D&&t[e+1].startsWith("/>")?" ":"";o+=a===M?i+O:h>=0?(s.push(r),i.slice(0,h)+C+i.slice(h)+S+d):i+S+(-2===h?e:d)}return[G(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class J{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const a=t.length-1,r=this.parts,[l,h]=K(t,e);if(this.el=J.createElement(l,i),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=q.nextNode())&&r.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=h[o++],i=s.getAttribute(t).split(S),a=/([.?@])?(.*)/.exec(e);r.push({type:1,index:n,name:a[2],strings:i,ctor:"."===a[1]?tt:"?"===a[1]?et:"@"===a[1]?it:X}),s.removeAttribute(t)}else t.startsWith(S)&&(r.push({type:6,index:n}),s.removeAttribute(t));if(I.test(s.tagName)){const t=s.textContent.split(S),e=t.length-1;if(e>0){s.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],P()),q.nextNode(),r.push({type:2,index:++n});s.append(t[e],P())}}}else if(8===s.nodeType)if(s.data===k)r.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(S,t+1));)r.push({type:7,index:n}),t+=S.length-1}n++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,s){if(e===B)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const o=H(e)?void 0:e._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=Z(t,n._$AS(t,e.values),n,s)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??T).importNode(e,!0);q.currentNode=s;let n=q.nextNode(),o=0,a=0,r=i[0];for(;void 0!==r;){if(o===r.index){let e;2===r.type?e=new Q(n,n.nextSibling,this,t):1===r.type?e=new r.ctor(n,r.name,r.strings,this,t):6===r.type&&(e=new st(n,this,t)),this._$AV.push(e),r=i[++a]}o!==r?.index&&(n=q.nextNode(),o++)}return q.currentNode=T,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),H(t)?t===j||null==t||""===t?(this._$AH!==j&&this._$AR(),this._$AH=j):t!==this._$AH&&t!==B&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==j&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Y(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new J(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new Q(this.O(P()),this.O(P()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=j,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=Z(this,t,e,0),o=!H(t)||t!==this._$AH&&t!==B,o&&(this._$AH=t);else{const s=t;let a,r;for(t=n[0],a=0;a<n.length-1;a++)r=Z(this,s[i+a],e,a),r===B&&(r=this._$AH[a]),o||=!H(r)||r!==this._$AH[a],r===j?t=j:t!==j&&(t+=(r??"")+n[a+1]),this._$AH[a]=r}o&&!s&&this.j(t)}j(t){t===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===j?void 0:t}}class et extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==j)}}class it extends X{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??j)===B)return;const i=this._$AH,s=t===j&&i!==j||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==j&&(i===j||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const nt=w.litHtmlPolyfillSupport;nt?.(J,Q),(w.litHtmlVersions??=[]).push("3.3.1");const ot=globalThis;class at extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new Q(e.insertBefore(P(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return B}}at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const rt=ot.litElementPolyfillSupport;rt?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.1");const lt={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:$},ht=(t=lt,e,i)=>{const{kind:s,metadata:n}=i;let o=globalThis.litPropertyMetadata.get(n);if(void 0===o&&globalThis.litPropertyMetadata.set(n,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,n,t)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const n=this[s];e.call(this,i),this.requestUpdate(s,n,t)}}throw Error("Unsupported decorator location: "+s)};function ct(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function dt(t){return ct({...t,state:!0,attribute:!1})}const ut=-999,pt=-998,ft=[{value:60,color:"#4FC3F7"},{value:70,color:"#81C784"},{value:80,color:"#FFB74D"},{value:100,color:"#FF8A65"}],gt=[{value:0,color:"#636363"},{value:1,color:"#EEEEEE"}],_t={sensor:"mdi:gauge",binary_sensor:"mdi:eye",switch:"mdi:toggle-switch",light:"mdi:lightbulb",climate:"mdi:thermostat",lock:"mdi:lock",cover:"mdi:window-shutter",media_player:"mdi:play-circle",person:"mdi:account",device_tracker:"mdi:map-marker"},yt={en:{history:"History",error_loading_data:"Error loading historical data",min_label:"Min",max_label:"Max",hours_ago:"h ago",minutes_ago:"m ago",now:"Now"},fr:{history:"Historique",error_loading_data:"Erreur lors du chargement des données historiques",min_label:"Min",max_label:"Max",hours_ago:"h",minutes_ago:"min",now:"Actuel"}},mt="History",vt=24,$t=48,bt=0,xt=60,wt=!1,Et=1,At=!1,Ct=!1,St=!1,kt="On",Ot="Off",Tt="Unknown",Pt="INOP",Ht="#EEEEEE",Ut="#636363",Nt="#FF9800",Mt="#9E9E9E";class Rt extends at{constructor(){super(),this.processedHistories={},this._lastHistoryFetch={},this._historyRefreshInterval=9e5,this._cardModApplied=!1,this.language="en",this.translations=yt,this.config={},this.processedHistories={}}static async getConfigElement(){return await Promise.resolve().then(function(){return It}),document.createElement("waterfall-history-card-editor")}static getStubConfig(){return{title:"History",hours:24,entities:[]}}setConfig(t){if(!t.entities||!Array.isArray(t.entities)||0===t.entities.length)throw new Error("Please define a list of entities.");const e={title:t.title||"History",hours:t.hours||vt,intervals:t.intervals||$t,start_offset:t.start_offset??bt,height:t.height||xt,min_value:t.min_value||null,max_value:t.max_value||null,thresholds:t.thresholds||null,gradient:t.gradient||St,show_current:!1!==t.show_current,show_labels:!1!==t.show_labels,show_min_max:t.show_min_max||wt,show_icons:!1!==t.show_icons,unit:t.unit||null,icon:t.icon||null,compact:t.compact||At,inline_layout:t.inline_layout||Ct,default_value:t.default_value??null,digits:"number"==typeof t.digits?t.digits:Et,card_mod:t.card_mod||{},binary_colors:t.binary_colors||null,color_on:t.color_on||null,color_off:t.color_off||null,state_on:t.state_on||kt,state_off:t.state_off||Ot,color_unknown:t.color_unknown||Nt,color_unavailable:t.color_unavailable||Mt,state_unknown:t.state_unknown||Tt,state_unavailable:t.state_unavailable||Pt};this.config={type:"custom:waterfall-history-card",...e,entities:t.entities.map(t=>"string"==typeof t?{entity:t}:t)},this.config.compact?this.classList.add("compact"):this.classList.remove("compact"),this.style.setProperty("--header-font-size",this.config.compact?"12px":"16px"),this.style.setProperty("--entity-name-font-size",this.config.compact?"12px":"14px"),this.style.setProperty("--current-value-font-size",this.config.compact?"12px":"18px"),this.style.setProperty("--waterfall-height",`${this.config.height}px`),this.style.setProperty("--labels-margin-top",this.config.compact?"0px":"4px")}shouldUpdate(t){if(!this.config||!this.hass)return!1;if(t.has("config"))return!0;if(t.has("hass")){const e=t.get("hass");return!e||this._entitiesChanged(e,this.hass)}return t.has("processedHistories"),!0}_entitiesChanged(t,e){return!t||!e||this.config.entities.some(i=>{const s="string"==typeof i?i:i.entity;return t.states[s]!==e.states[s]})}updated(t){if(t.has("hass")){const e=t.get("hass");this.hass?.language&&(this.language=this.hass.language.split("-")[0]),e?this._entitiesChanged(e,this.hass)&&this.requestUpdate():this.updateCard(),this._checkHistoryRefresh()}!this._cardModApplied&&this.config?.card_mod&&customElements.whenDefined("card-mod").then(()=>{const t=customElements.get("card-mod");t?.applyToElement&&(t.applyToElement(this,"card",this.config.card_mod),this._cardModApplied=!0)}).catch(()=>{})}_checkHistoryRefresh(){if(!this.hass||!this.config)return;const t=Date.now();this.config.entities.filter(e=>{const i="string"==typeof e?e:e.entity,s="string"!=typeof e?e.hours??this.config.hours:this.config.hours,n="string"!=typeof e?e.intervals??this.config.intervals:this.config.intervals,o="string"!=typeof e?e.start_offset??this.config.start_offset??0:this.config.start_offset??0,a=`${i}_${o}`,r=s/n*60*60*1e3/2,l=o&&o>0?4*r:r;return!this._lastHistoryFetch[a]||t-this._lastHistoryFetch[a]>l}).length>0&&this.updateCard()}async updateCard(){if(!this.hass||!this.config)return;const t=Date.now(),e=this.config.entities.filter(e=>{const i="string"==typeof e?e:e.entity,s="string"!=typeof e?e.hours??this.config.hours:this.config.hours,n="string"!=typeof e?e.intervals??this.config.intervals:this.config.intervals,o="string"!=typeof e?e.start_offset??this.config.start_offset??0:this.config.start_offset??0,a=`${i}_${o}`,r=s/n*60*60*1e3/2,l=o&&o>0?4*r:r;return!this._lastHistoryFetch[a]||t-this._lastHistoryFetch[a]>l});if(0===e.length)return;const i=e.map(async e=>{const i="string"==typeof e?{entity:e}:e,s=i.entity,n=i.hours??this.config.hours,o=i.start_offset??this.config.start_offset??0,a=`${s}_${o}`,r=new Date(Date.now()-60*o*60*1e3),l=new Date(r.getTime()-60*n*60*1e3);try{const e=await this.hass.callApi("GET",`history/period/${l.toISOString()}?filter_entity_id=${s}&end_time=${r.toISOString()}&significant_changes_only=1&minimal_response&no_attributes`);return this._lastHistoryFetch[a]=t,{entityId:s,history:e[0],entityConfig:i,startOffset:o,cacheKey:a}}catch(t){return console.error(`Error fetching history for ${s}:`,t),{entityId:s,history:null,entityConfig:i,startOffset:o,cacheKey:a}}}),s=await Promise.all(i),n={...this.processedHistories};s.forEach(({entityId:t,history:e,entityConfig:i,startOffset:s,cacheKey:o})=>{if(e){const t=i.intervals??this.config.intervals,a=60*(i.hours??this.config.hours)*60*1e3/t;n[o]={data:this.processHistoryData(e,t,a,i,s),minValue:0,maxValue:100}}}),this.processedHistories=n}processHistoryData(t,e,i,s,n=0){const o=s.default_value??this.config.default_value,a=new Array(e).fill(o),r=s.hours??this.config.hours,l=Date.now()-60*n*60*1e3-60*r*60*1e3;t&&t.forEach(t=>{const s=new Date(t.last_changed||t.last_updated).getTime()-l;if(s>=0){const n=Math.floor(s/i);n>=0&&n<e&&(a[n]=this.parseState(t.state))}});for(let t=1;t<a.length;t++)null===a[t]&&null!==a[t-1]&&(a[t]=a[t-1]);for(let t=a.length-2;t>=0;t--)null===a[t]&&null!==a[t+1]&&a[t+1]!==ut&&a[t+1]!==pt&&(a[t]=a[t+1]);return a.map((t,e)=>({time:new Date(l+e*i),value:t}))}getMinMax(t){let e=1/0,i=-1/0;return t.forEach(t=>{null!==t&&t!==ut&&t!==pt&&(t>i&&(i=t),t<e&&(e=t))}),e===1/0||i===-1/0?[0,0]:[e,i]}parseState(t){if("number"==typeof t)return t;if("string"==typeof t){const e=t.toLowerCase();if("unknown"===e)return ut;if("unavailable"===e)return pt;if("off"===e)return 0;if("on"===e)return 1;const i=parseFloat(t);if(!Number.isNaN(i))return i}return null}displayState(t,e){if(t===ut)return e.state_unknown??this.config.state_unknown??Tt;if(t===pt)return e.state_unavailable??this.config.state_unavailable??Pt;if(this.isBinaryValue(t)){const i=e.state_on??this.config.state_on??kt,s=e.state_off??this.config.state_off??Ot;return 1===t||!0===t?i:s}if("number"==typeof t){const i=e.digits??this.config.digits??Et;return t.toFixed(i)+this.getUnit(e)}return(t??"N/A")+this.getUnit(e)}isBinaryValue(t){return 0===t||1===t}getBinaryColors(t){return t.binary_colors?[{value:0,color:t.binary_colors.off||t.binary_colors[0]||Ut},{value:1,color:t.binary_colors.on||t.binary_colors[1]||Ht}]:t.color_on||t.color_off?[{value:0,color:t.color_off||Ut},{value:1,color:t.color_on||Ht}]:this.config.binary_colors?[{value:0,color:this.config.binary_colors.off||this.config.binary_colors[0]||Ut},{value:1,color:this.config.binary_colors.on||this.config.binary_colors[1]||Ht}]:this.config.color_on||this.config.color_off?[{value:0,color:this.config.color_off||Ut},{value:1,color:this.config.color_on||Ht}]:gt}getColorForValue(t,e){if(null===t||isNaN(t))return"#666666";if(t===ut)return e.color_unknown??this.config.color_unknown??Nt;if(t===pt)return e.color_unavailable??this.config.color_unavailable??Mt;let i=e.thresholds??this.config.thresholds;!i&&this.isBinaryValue(t)?i=this.getBinaryColors(e):i||(i=ft);if(!(e.gradient??this.config.gradient??St)){let e=i[0].color;for(const s of i)t>=s.value&&(e=s.color);return e}for(let e=0;e<i.length-1;e++){const s=i[e],n=i[e+1];if(t>=s.value&&t<=n.value){const e=n.value-s.value===0?0:(t-s.value)/(n.value-s.value);return this.interpolateColor(s.color,n.color,e)}}return t<i[0].value?i[0].color:i[i.length-1].color}getUnit(t){const e=this.hass.states[t.entity];return t.unit??this.config.unit??e?.attributes?.unit_of_measurement??""}interpolateColor(t,e,i){const s=this.hexToRgb(t),n=this.hexToRgb(e);return`rgb(${Math.round(s.r+(n.r-s.r)*i)}, ${Math.round(s.g+(n.g-s.g)*i)}, ${Math.round(s.b+(n.b-s.b)*i)})`}hexToRgb(t){const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:{r:0,g:0,b:0}}getTimeLabel(t,e,i,s=0){const n=i*(e-t)/e+s;if(i<=24){const t=new Date(Date.now()-60*n*60*1e3),s=new Date(t.getTime()+i/e*60*60*1e3),o=this.hass?.locale?.language||this.hass?.language||void 0,a=new Intl.DateTimeFormat(o,{hour:"numeric",minute:"2-digit"});return`${a.format(t)} - ${a.format(s)}`}return n<1?`${Math.round(60*n)}${this.t("minutes_ago")}`:`${n.toFixed(1)}${this.t("hours_ago")}`}_handleEntityClick(t,e){e.stopPropagation();const i=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t}});this.dispatchEvent(i)}t(t){return this.translations[this.language]?.[t]||this.translations.en[t]||t}render(){return this.config&&this.hass?F`
      <div class="card-header">
        <span>${this.config.title}</span>
      </div>
      ${this.config.entities.map(t=>this._renderEntity(t))}
    `:F``}_renderEntity(t){const e="string"==typeof t?{entity:t}:t,i=e.entity,s=this.hass.states[i];if(!s)return F`<div class="error">Entity not found: ${i}</div>`;const n=e.name||s.attributes.friendly_name||i;let o=s.attributes?.icon;if(!o){const t=i.split(".")[0];o=_t[t]||"mdi:bookmark"}const a=void 0!==e.show_icons?e.show_icons:this.config.show_icons,r=e.start_offset??this.config.start_offset??0,l=`${i}_${r}`,h=this.processedHistories[l]?.data||[],c=r>0?h.map(t=>t.value):[...h.map(t=>t.value),this.parseState(s.state)],[d,u]=this.getMinMax(c),p=e.show_labels??this.config.show_labels,f=e.show_min_max??this.config.show_min_max,g=e.show_current??this.config.show_current,_=e.hours??this.config.hours,y=e.intervals??this.config.intervals,m=this.parseState(s.state),v=e.inline_layout??this.config.inline_layout,$=r,b=`${_+r}${this.t("hours_ago")}`,x=r>0?`${$}${this.t("hours_ago")}`:this.t("now"),w=F`
      ${c.map((t,i)=>{const s=i===c.length-1,n=this.getColorForValue(t,e),o=`${this.getTimeLabel(i,y,_,r)} : ${null!==t?this.displayState(t,e):this.t("error_loading_data")}`;return F`
          <div
            class="bar-segment ${s?"last-bar":""}"
            style="background-color: ${n};"
            title=${o}>
          </div>
        `})}
    `;return v?F`
        <div class="entity-inline-container" @click=${t=>this._handleEntityClick(i,t)}>
          <div class="entity-inline-name">
            ${a?F`<ha-icon class="entity-icon" .icon=${o}></ha-icon>`:""}
            <span class="entity-name">${n}</span>
          </div>
          <div class="entity-inline-graph">
            <div class="waterfall-container">
              ${w}
            </div>
            ${p?F`
              <div class="labels">
                <span>${b}</span>
                <span>${x}</span>
              </div>
            `:""}
          </div>
          ${g?F`<div class="entity-inline-value">${this.displayState(m,e)}</div>`:""}
        </div>
        ${f?F`
          <div class="min-max-label">
            ${this.t("min_label")}: ${this.displayState(d,e)} / ${this.t("max_label")}: ${this.displayState(u,e)}
          </div>
        `:""}
      `:F`
      <div class="entity-container" @click=${t=>this._handleEntityClick(i,t)}>
        <div class="entity-header">
          ${a?F`<ha-icon class="entity-icon" .icon=${o}></ha-icon>`:""}
          <span class="entity-name">${n}</span>
          ${g?F`<span class="current-value">${this.displayState(m,e)}</span>`:""}
        </div>
        <div class="waterfall-container">
          ${w}
        </div>
        ${p?F`
          <div class="labels">
            <span>${b}</span>
            <span>${x}</span>
          </div>
        `:""}
        ${f?F`
          <div class="min-max-label">
            ${this.t("min_label")}: ${this.displayState(d,e)} / ${this.t("max_label")}: ${this.displayState(u,e)}
          </div>
        `:""}
      </div>
    `}getCardSize(){return 2*this.config?.entities?.length||2}}var zt,Dt;Rt.styles=a`
    :host {
      padding: 16px;
      background: var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: var(--ha-card-box-shadow, none);
      box-sizing: border-box;
      border-radius: var(--ha-card-border-radius, 12px);
      border-width: var(--ha-card-border-width, 1px);
      border-style: solid;
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      color: var(--primary-text-color);
      display: block;
      position: relative;
    }

    .card-header {
      font-size: var(--header-font-size, 16px);
      font-weight: 500;
      padding-bottom: 8px;
      color: var(--primary-text-color, black);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .entity-container {
      margin-bottom: 16px;
      cursor: pointer;
    }

    .entity-container:last-child {
      margin-bottom: 0;
    }

    .entity-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .entity-icon {
      width: 20px;
      height: 20px;
    }

    .entity-name {
      font-size: var(--entity-name-font-size, 14px);
      font-weight: 500;
    }

    .current-value {
      margin-left: auto;
      font-size: var(--current-value-font-size, 18px);
      font-weight: bold;
    }

    .waterfall-container {
      position: relative;
      height: var(--waterfall-height, 60px);
      border-radius: 2px;
      overflow: hidden;
      display: flex;
    }

    .bar-segment {
      flex: 1;
      height: 100%;
      transition: all 0.3s ease;
      border-right: 1px solid rgba(255,255,255,0.2);
    }

    .bar-segment:last-child {
      border-right: none;
    }

    .labels {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--secondary-text-color, gray);
      margin-top: var(--labels-margin-top, 4px);
    }

    .min-max-label {
      display: block;
      width: 100%;
      font-size: 11px;
      color: var(--secondary-text-color, gray);
      text-align: center;
    }

    .error {
      color: var(--error-color, red);
    }

    /* Compact mode overrides */
    :host(.compact) .card-header {
      font-size: 12px;
    }

    :host(.compact) .entity-name {
      font-size: 12px;
    }

    :host(.compact) .current-value {
      font-size: 12px;
    }

    :host(.compact) .labels {
      margin-top: 0px;
    }

    /* Inline layout styles */
    .entity-inline-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .entity-inline-container .entity-inline-name {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
      flex-shrink: 0;
    }

    .entity-inline-container .entity-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      display: block;
    }

    .entity-inline-container .entity-name {
      font-size: var(--entity-name-font-size, 14px);
      font-weight: 500;
      white-space: nowrap;
      line-height: var(--waterfall-height, 60px);
    }

    .entity-inline-container .entity-inline-graph {
      flex: 1;
      min-width: 0;
    }

    .entity-inline-container .waterfall-container {
      margin-bottom: 0;
    }

    .entity-inline-container .labels {
      display: none;
    }

    .entity-inline-container .entity-inline-value {
      min-width: 60px;
      flex-shrink: 0;
      text-align: right;
      font-size: var(--current-value-font-size, 18px);
      font-weight: bold;
      white-space: nowrap;
      line-height: var(--waterfall-height, 60px);
    }

    /* Compact mode for inline layout */
    :host(.compact) .entity-inline-container {
      margin-bottom: 8px;
    }

    :host(.compact) .entity-inline-container .entity-icon {
      width: 16px;
      height: 16px;
    }

    :host(.compact) .entity-inline-container .entity-name {
      font-size: 12px;
    }

    :host(.compact) .entity-inline-container .entity-inline-value {
      font-size: 12px;
    }
  `,t([ct({attribute:!1})],Rt.prototype,"hass",void 0),t([dt()],Rt.prototype,"config",void 0),t([dt()],Rt.prototype,"processedHistories",void 0),customElements.get("waterfall-history-card")||customElements.define("waterfall-history-card",Rt),window.customCards=window.customCards||[],window.customCards.push({type:"waterfall-history-card",name:"Waterfall History Card",description:"A horizontal waterfall display for historical sensor data with visual editor"}),console.info("%c WATERFALL-HISTORY-CARD %c v4.2.1 ","color: orange; font-weight: bold; background: black","color: white; font-weight; bold; background: dimgray"),function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(zt||(zt={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(Dt||(Dt={}));var Vt=function(t,e,i,s){s=s||{},i=null==i?{}:i;var n=new Event(e,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return n.detail=i,t.dispatchEvent(n),n};class Lt extends at{setConfig(t){this._config=t}_configValueChanged(t,e){if(!this._config||!this.hass)return;const i={...this._config,[t]:e};Vt(this,"config-changed",{config:i})}_addEntity(){const t={...this._config};t.entities||(t.entities=[]),t.entities=[...t.entities,{entity:""}],Vt(this,"config-changed",{config:t})}_removeEntity(t){const e={...this._config};e.entities=[...e.entities],e.entities.splice(t,1),Vt(this,"config-changed",{config:e})}_entityChanged(t,e,i){const s={...this._config};s.entities=[...s.entities];const n=s.entities[t],o="string"==typeof n?{entity:n}:{...n};o[e]=i,s.entities[t]=o,Vt(this,"config-changed",{config:s})}_addThreshold(){const t={...this._config};t.thresholds||(t.thresholds=[]),t.thresholds=[...t.thresholds,{value:0,color:"#cccccc"}],Vt(this,"config-changed",{config:t})}_removeThreshold(t){const e={...this._config};e.thresholds&&(e.thresholds=[...e.thresholds],e.thresholds.splice(t,1),Vt(this,"config-changed",{config:e}))}_thresholdChanged(t,e,i){const s={...this._config};s.thresholds&&(s.thresholds=[...s.thresholds],s.thresholds[t]={...s.thresholds[t],[e]:"value"===e?Number(i):i},Vt(this,"config-changed",{config:s}))}_addEntityThreshold(t){const e={...this._config};e.entities=[...e.entities];const i=e.entities[t],s="string"==typeof i?{entity:i}:{...i};s.thresholds||(s.thresholds=[]),s.thresholds=[...s.thresholds,{value:0,color:"#cccccc"}],e.entities[t]=s,Vt(this,"config-changed",{config:e})}_removeEntityThreshold(t,e){const i={...this._config};i.entities=[...i.entities];const s=i.entities[t],n="string"==typeof s?{entity:s}:{...s};n.thresholds&&(n.thresholds=[...n.thresholds],n.thresholds.splice(e,1),i.entities[t]=n,Vt(this,"config-changed",{config:i}))}_entityThresholdChanged(t,e,i,s){const n={...this._config};n.entities=[...n.entities];const o=n.entities[t],a="string"==typeof o?{entity:o}:{...o};a.thresholds&&(a.thresholds=[...a.thresholds],a.thresholds[e]={...a.thresholds[e],[i]:"value"===i?Number(s):s},n.entities[t]=a,Vt(this,"config-changed",{config:n}))}render(){return this._config&&this.hass?F`
      <div class="card-config">
        ${this._renderBasicSettings()}
        ${this._renderDisplayOptions()}
        ${this._renderBinaryStateConfig()}
        ${this._renderGlobalThresholds()}
        ${this._renderEntities()}
      </div>
    `:F``}_renderBasicSettings(){return F`
      <div class="section">
        <h3>Basic Settings</h3>

        <ha-textfield
          label="Card Title"
          .value=${this._config.title||mt}
          @input=${t=>this._configValueChanged("title",t.target.value)}
        ></ha-textfield>

        <ha-textfield
          label="Time Window (hours)"
          type="number"
          min="1"
          max="168"
          .value=${this._config.hours||vt}
          @input=${t=>this._configValueChanged("hours",Number(t.target.value))}
          helper-text="How many hours of history to display (1-168)"
        ></ha-textfield>

        <ha-textfield
          label="Intervals"
          type="number"
          min="24"
          max="96"
          .value=${this._config.intervals||$t}
          @input=${t=>this._configValueChanged("intervals",Number(t.target.value))}
          helper-text="Number of segments in the waterfall (24-96)"
        ></ha-textfield>

        <ha-textfield
          label="Bar Height (pixels)"
          type="number"
          min="30"
          max="200"
          .value=${this._config.height||xt}
          @input=${t=>this._configValueChanged("height",Number(t.target.value))}
          helper-text="Height of each waterfall bar in pixels"
        ></ha-textfield>

        <ha-textfield
          label="Decimal Places"
          type="number"
          min="0"
          max="5"
          .value=${this._config.digits??Et}
          @input=${t=>this._configValueChanged("digits",Number(t.target.value))}
          helper-text="Number of decimal places for numeric values (0-5)"
        ></ha-textfield>
      </div>
    `}_renderDisplayOptions(){return F`
      <div class="section">
        <h3>Display Options</h3>

        <div class="toggle-row">
          <label>Show Icons</label>
          <ha-switch
            .checked=${!1!==this._config.show_icons}
            @change=${t=>this._configValueChanged("show_icons",t.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Show Labels</label>
          <ha-switch
            .checked=${!1!==this._config.show_labels}
            @change=${t=>this._configValueChanged("show_labels",t.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Show Current Value</label>
          <ha-switch
            .checked=${!1!==this._config.show_current}
            @change=${t=>this._configValueChanged("show_current",t.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Show Min/Max</label>
          <ha-switch
            .checked=${this._config.show_min_max||!1}
            @change=${t=>this._configValueChanged("show_min_max",t.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Compact Mode</label>
          <ha-switch
            .checked=${this._config.compact||!1}
            @change=${t=>this._configValueChanged("compact",t.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Inline Layout</label>
          <ha-switch
            .checked=${this._config.inline_layout||!1}
            @change=${t=>this._configValueChanged("inline_layout",t.target.checked)}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <label>Gradient Mode</label>
          <ha-switch
            .checked=${this._config.gradient||!1}
            @change=${t=>this._configValueChanged("gradient",t.target.checked)}
          ></ha-switch>
        </div>
      </div>
    `}_renderBinaryStateConfig(){return F`
      <ha-expansion-panel header="Binary State Configuration (Advanced)" .expanded=${!1}>
        <div class="section">
          <p class="helper-text">
            Configure colors and labels for binary sensors (on/off states).
          </p>

          <ha-textfield
            label="On State Color"
            .value=${this._config.color_on||Ht}
            @input=${t=>this._configValueChanged("color_on",t.target.value)}
            helper-text="Color when state is ON (e.g., #EEEEEE or white)"
          ></ha-textfield>

          <ha-textfield
            label="Off State Color"
            .value=${this._config.color_off||Ut}
            @input=${t=>this._configValueChanged("color_off",t.target.value)}
            helper-text="Color when state is OFF (e.g., #636363 or gray)"
          ></ha-textfield>

          <ha-textfield
            label="On State Label"
            .value=${this._config.state_on||kt}
            @input=${t=>this._configValueChanged("state_on",t.target.value)}
            helper-text="Text to display for ON state (default: On)"
          ></ha-textfield>

          <ha-textfield
            label="Off State Label"
            .value=${this._config.state_off||Ot}
            @input=${t=>this._configValueChanged("state_off",t.target.value)}
            helper-text="Text to display for OFF state (default: Off)"
          ></ha-textfield>

          <h4>Unknown & Unavailable States</h4>

          <ha-textfield
            label="Unknown State Color"
            .value=${this._config.color_unknown||Nt}
            @input=${t=>this._configValueChanged("color_unknown",t.target.value)}
            helper-text="Color for unknown states (default: #FF9800 orange)"
          ></ha-textfield>

          <ha-textfield
            label="Unknown State Label"
            .value=${this._config.state_unknown||Tt}
            @input=${t=>this._configValueChanged("state_unknown",t.target.value)}
            helper-text="Text to display for unknown state (default: Unknown)"
          ></ha-textfield>

          <ha-textfield
            label="Unavailable State Color"
            .value=${this._config.color_unavailable||Mt}
            @input=${t=>this._configValueChanged("color_unavailable",t.target.value)}
            helper-text="Color for unavailable states (default: #9E9E9E gray)"
          ></ha-textfield>

          <ha-textfield
            label="Unavailable State Label"
            .value=${this._config.state_unavailable||Pt}
            @input=${t=>this._configValueChanged("state_unavailable",t.target.value)}
            helper-text="Text to display for unavailable state (default: INOP)"
          ></ha-textfield>
        </div>
      </ha-expansion-panel>
    `}_renderGlobalThresholds(){const t=this._config.thresholds||[];return F`
      <ha-expansion-panel header="Global Thresholds (Advanced)" .expanded=${!1}>
        <div class="section">
          <p class="helper-text">
            Define color thresholds for numeric sensors. Colors apply when value is greater than or equal to the threshold value.
            These thresholds apply to all entities unless overridden per-entity.
          </p>

          ${0===t.length?F`
            <p class="info-text">No thresholds defined. Using default temperature-based thresholds.</p>
          `:""}

          ${t.map((t,e)=>F`
            <div class="threshold-item">
              <ha-textfield
                label="Threshold Value"
                type="number"
                .value=${t.value}
                @input=${t=>this._thresholdChanged(e,"value",t.target.value)}
              ></ha-textfield>

              <ha-textfield
                label="Color"
                .value=${t.color}
                @input=${t=>this._thresholdChanged(e,"color",t.target.value)}
                helper-text="e.g., #FF0000 or red"
              ></ha-textfield>

              <mwc-button @click=${()=>this._removeThreshold(e)}>
                Remove
              </mwc-button>
            </div>
          `)}

          <mwc-button raised @click=${this._addThreshold}>
            Add Threshold
          </mwc-button>
        </div>
      </ha-expansion-panel>
    `}_renderEntities(){const t=this._config.entities||[];return F`
      <div class="section">
        <h3>Entities</h3>
        <p class="helper-text">
          Add entities to display in the card. Each entity can override global settings.
        </p>

        ${0===t.length?F`
          <p class="info-text">No entities configured. Add at least one entity.</p>
        `:""}

        ${t.map((t,e)=>this._renderEntityConfig(t,e))}

        <mwc-button raised @click=${this._addEntity}>
          Add Entity
        </mwc-button>
      </div>
    `}_renderEntityConfig(t,e){const i="string"==typeof t?{entity:t}:t,s=i.entity;return F`
      <ha-expansion-panel
        header="${i.name||s||`Entity ${e+1}`}"
        .expanded=${!1}>
        <div class="entity-config">
          <div class="entity-header-row">
            <mwc-button @click=${()=>this._removeEntity(e)}>
              Remove Entity
            </mwc-button>
          </div>

          <ha-selector
            .hass=${this.hass}
            .selector=${{entity:{}}}
            .value=${s}
            @value-changed=${t=>this._entityChanged(e,"entity",t.detail.value)}
            .label=${"Entity"}
          ></ha-selector>

          <ha-textfield
            label="Custom Name (optional)"
            .value=${i.name||""}
            @input=${t=>this._entityChanged(e,"name",t.target.value)}
            helper-text="Leave blank to use entity's friendly name"
          ></ha-textfield>

          ${this._renderEntityAdvancedOptions(i,e)}
        </div>
      </ha-expansion-panel>
    `}_renderEntityAdvancedOptions(t,e){return F`
      <ha-expansion-panel header="Advanced Overrides (Optional)" .expanded=${!1}>
        <div class="entity-overrides">
          <p class="helper-text">
            Override global settings for this entity only. Leave blank to use global values.
          </p>

          <h4>Time Window Overrides</h4>

          <ha-textfield
            label="Hours (override)"
            type="number"
            min="1"
            max="168"
            .value=${t.hours||""}
            @input=${t=>this._entityChanged(e,"hours",t.target.value?Number(t.target.value):void 0)}
            helper-text="Leave blank to use global value"
          ></ha-textfield>

          <ha-textfield
            label="Intervals (override)"
            type="number"
            min="24"
            max="96"
            .value=${t.intervals||""}
            @input=${t=>this._entityChanged(e,"intervals",t.target.value?Number(t.target.value):void 0)}
            helper-text="Leave blank to use global value"
          ></ha-textfield>

          <h4>Display Overrides</h4>

          <div class="toggle-row">
            <label>Show Icons (override)</label>
            <ha-switch
              .checked=${t.show_icons??!0}
              @change=${t=>this._entityChanged(e,"show_icons",t.target.checked)}
            ></ha-switch>
          </div>

          <div class="toggle-row">
            <label>Show Labels (override)</label>
            <ha-switch
              .checked=${t.show_labels??!0}
              @change=${t=>this._entityChanged(e,"show_labels",t.target.checked)}
            ></ha-switch>
          </div>

          <div class="toggle-row">
            <label>Show Current (override)</label>
            <ha-switch
              .checked=${t.show_current??!0}
              @change=${t=>this._entityChanged(e,"show_current",t.target.checked)}
            ></ha-switch>
          </div>

          <div class="toggle-row">
            <label>Inline Layout (override)</label>
            <ha-switch
              .checked=${t.inline_layout??!1}
              @change=${t=>this._entityChanged(e,"inline_layout",t.target.checked)}
            ></ha-switch>
          </div>

          <h4>Styling Overrides</h4>

          <ha-textfield
            label="Custom Icon"
            .value=${t.icon||""}
            @input=${t=>this._entityChanged(e,"icon",t.target.value)}
            helper-text="e.g., mdi:thermometer"
          ></ha-textfield>

          <ha-textfield
            label="Custom Unit"
            .value=${t.unit||""}
            @input=${t=>this._entityChanged(e,"unit",t.target.value)}
            helper-text="Override unit of measurement (e.g., °F)"
          ></ha-textfield>

          <ha-textfield
            label="Decimal Places (override)"
            type="number"
            min="0"
            max="5"
            .value=${t.digits??""}
            @input=${t=>this._entityChanged(e,"digits",t.target.value?Number(t.target.value):void 0)}
            helper-text="Leave blank to use global value"
          ></ha-textfield>

          <h4>Binary State Overrides</h4>

          <ha-textfield
            label="On State Color (override)"
            .value=${t.color_on||""}
            @input=${t=>this._entityChanged(e,"color_on",t.target.value)}
            helper-text="Leave blank to use global value"
          ></ha-textfield>

          <ha-textfield
            label="Off State Color (override)"
            .value=${t.color_off||""}
            @input=${t=>this._entityChanged(e,"color_off",t.target.value)}
            helper-text="Leave blank to use global value"
          ></ha-textfield>

          ${this._renderEntityThresholds(t,e)}
        </div>
      </ha-expansion-panel>
    `}_renderEntityThresholds(t,e){const i=t.thresholds||[];return F`
      <div class="entity-thresholds">
        <h4>Per-Entity Thresholds</h4>
        <p class="helper-text">
          Define custom thresholds for this entity only. Overrides global thresholds.
        </p>

        ${0===i.length?F`
          <p class="info-text">No entity-specific thresholds. Using global thresholds.</p>
        `:""}

        ${i.map((t,i)=>F`
          <div class="threshold-item">
            <ha-textfield
              label="Threshold Value"
              type="number"
              .value=${t.value}
              @input=${t=>this._entityThresholdChanged(e,i,"value",t.target.value)}
            ></ha-textfield>

            <ha-textfield
              label="Color"
              .value=${t.color}
              @input=${t=>this._entityThresholdChanged(e,i,"color",t.target.value)}
              helper-text="e.g., #FF0000 or red"
            ></ha-textfield>

            <mwc-button @click=${()=>this._removeEntityThreshold(e,i)}>
              Remove
            </mwc-button>
          </div>
        `)}

        <mwc-button @click=${()=>this._addEntityThreshold(e)}>
          Add Entity Threshold
        </mwc-button>
      </div>
    `}static get styles(){return a`
      :host {
        display: block;
        padding: 16px;
      }

      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .section {
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      h4 {
        margin: 16px 0 8px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      ha-textfield,
      ha-selector {
        display: block;
        margin-bottom: 12px;
        width: 100%;
      }

      ha-expansion-panel {
        display: block;
        margin-bottom: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
      }

      .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .toggle-row:last-child {
        border-bottom: none;
      }

      .toggle-row label {
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .threshold-item {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 8px;
        margin-bottom: 8px;
        align-items: start;
      }

      .entity-config {
        padding: 12px;
      }

      .entity-header-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }

      .entity-overrides {
        padding: 12px;
      }

      .helper-text {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 0 0 12px 0;
      }

      .info-text {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin: 8px 0;
      }

      mwc-button {
        margin-top: 8px;
      }

      mwc-button[raised] {
        --mdc-theme-primary: var(--primary-color);
      }
    `}}t([ct({attribute:!1})],Lt.prototype,"hass",void 0),t([dt()],Lt.prototype,"_config",void 0),customElements.get("waterfall-history-card-editor")||customElements.define("waterfall-history-card-editor",Lt);var It=Object.freeze({__proto__:null,WaterfallHistoryCardEditor:Lt});export{Rt as WaterfallHistoryCard};
//# sourceMappingURL=horizontal-waterfall-history-card.js.map
