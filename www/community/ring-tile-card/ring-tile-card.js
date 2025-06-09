(()=>{let t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;class r{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,i=this.t;if(e&&void 0===t){let e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}}let n=t=>new r("string"==typeof t?t:t+"",void 0,i),a=(t,...e)=>new r(1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]),t,i),o=(i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let e of s){let s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}},l=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return n(e)})(t):t,{is:h,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:_,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,g=globalThis,m=g.trustedTypes,f=m?m.emptyScript:"",$=g.reactiveElementPolyfillSupport,y=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>!h(t,e),A={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;class x extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=A){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:r}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){let n=s?.call(this);r?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??A}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;let t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){let t=this.properties;for(let e of[..._(t),...u(t)])this.createProperty(e,t[e])}let t=this[Symbol.metadata];if(null!==t){let e=litPropertyMetadata.get(t);if(void 0!==e)for(let[t,i]of e)this.elementProperties.set(t,i)}for(let[t,e]of(this._$Eh=new Map,this.elementProperties)){let i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t))for(let i of new Set(t.flat(1/0).reverse()))e.unshift(l(i));else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){let i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map;for(let e of this.constructor.elementProperties.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return o(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){let r=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){let t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=s,this[s]=r.fromAttribute(e,t.type)??this._$Ej?.get(s)??null,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){let s=this.constructor,r=this[t];if(!(((i??=s.getPropertyOptions(t)).hasChanged??v)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[e,i]of t){let{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1,e=this._$AL;try{(t=this.shouldUpdate(e))?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,$?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.0");let E=globalThis,N=E.trustedTypes,S=N?N.createPolicy("lit-html",{createHTML:t=>t}):void 0,O="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+w,k=`<${C}>`,T=document,I=()=>T.createComment(""),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,L=t=>U(t)||"function"==typeof t?.[Symbol.iterator],R="[ 	\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,z=/>/g,V=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,G=/"/g,H=/^(?:script|style|textarea|title)$/i,W=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),B=W(1),K=W(2),F=(W(3),Symbol.for("lit-noChange")),X=Symbol.for("lit-nothing"),q=new WeakMap,Z=T.createTreeWalker(T,129);function J(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}let Y=(t,e)=>{let i=t.length-1,s=[],r,n=2===e?"<svg>":3===e?"<math>":"",a=P;for(let e=0;e<i;e++){let i=t[e],o,l,h=-1,c=0;for(;c<i.length&&(a.lastIndex=c,null!==(l=a.exec(i)));)c=a.lastIndex,a===P?"!--"===l[1]?a=D:void 0!==l[1]?a=z:void 0!==l[2]?(H.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=V):void 0!==l[3]&&(a=V):a===V?">"===l[0]?(a=r??P,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?V:'"'===l[3]?G:j):a===G||a===j?a=V:a===D||a===z?a=P:(a=V,r=void 0);let d=a===V&&t[e+1].startsWith("/>")?" ":"";n+=a===P?i+k:h>=0?(s.push(o),i.slice(0,h)+O+i.slice(h)+w+d):i+w+(-2===h?e:d)}return[J(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0,a=t.length-1,o=this.parts,[l,h]=Y(t,e);if(this.el=Q.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){let t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Z.nextNode())&&o.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(let t of s.getAttributeNames())if(t.endsWith(O)){let e=h[n++],i=s.getAttribute(t).split(w),a=/([.?@])?(.*)/.exec(e);o.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?tr:"?"===a[1]?tn:"@"===a[1]?ta:ts}),s.removeAttribute(t)}else t.startsWith(w)&&(o.push({type:6,index:r}),s.removeAttribute(t));if(H.test(s.tagName)){let t=s.textContent.split(w),e=t.length-1;if(e>0){s.textContent=N?N.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],I()),Z.nextNode(),o.push({type:2,index:++r});s.append(t[e],I())}}}else if(8===s.nodeType)if(s.data===C)o.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(w,t+1));)o.push({type:7,index:r}),t+=w.length-1}r++}}static createElement(t,e){let i=T.createElement("template");return i.innerHTML=t,i}}function tt(t,e,i=t,s){if(e===F)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl,n=M(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t))._$AT(t,i,s),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=tt(t,r._$AS(t,e.values),r,s)),e}class te{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??T).importNode(e,!0);Z.currentNode=s;let r=Z.nextNode(),n=0,a=0,o=i[0];for(;void 0!==o;){if(n===o.index){let e;2===o.type?e=new ti(r,r.nextSibling,this,t):1===o.type?e=new o.ctor(r,o.name,o.strings,this,t):6===o.type&&(e=new to(r,this,t)),this._$AV.push(e),o=i[++a]}n!==o?.index&&(r=Z.nextNode(),n++)}return Z.currentNode=T,s}p(t){let e=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class ti{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=X,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){M(t=tt(this,t,e))?t===X||null==t||""===t?(this._$AH!==X&&this._$AR(),this._$AH=X):t!==this._$AH&&t!==F&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):L(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==X&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Q.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let t=new te(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new Q(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let r of t)s===e.length?e.push(i=new ti(this.O(I()),this.O(I()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){let e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class ts{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=X,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=X}_$AI(t,e=this,i,s){let r=this.strings,n=!1;if(void 0===r)(n=!M(t=tt(this,t,e,0))||t!==this._$AH&&t!==F)&&(this._$AH=t);else{let s,a,o=t;for(t=r[0],s=0;s<r.length-1;s++)(a=tt(this,o[i+s],e,s))===F&&(a=this._$AH[s]),n||=!M(a)||a!==this._$AH[s],a===X?t=X:t!==X&&(t+=(a??"")+r[s+1]),this._$AH[s]=a}n&&!s&&this.j(t)}j(t){t===X?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tr extends ts{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===X?void 0:t}}class tn extends ts{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==X)}}class ta extends ts{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??X)===F)return;let i=this._$AH,s=t===X&&i!==X||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==X&&(i===X||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class to{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}}let tl=E.litHtmlPolyfillSupport;tl?.(Q,ti),(E.litHtmlVersions??=[]).push("3.3.0");let th=(t,e,i)=>{let s=i?.renderBefore??e,r=s._$litPart$;if(void 0===r){let t=i?.renderBefore??null;s._$litPart$=r=new ti(e.insertBefore(I(),t),t,void 0,i??{})}return r._$AI(t),r},tc=globalThis;class td extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=th(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}}td._$litElement$=!0,td.finalized=!0,tc.litElementHydrateSupport?.({LitElement:td});let t_=tc.litElementPolyfillSupport;t_?.({LitElement:td}),(tc.litElementVersions??=[]).push("4.2.0");let tu={ATTRIBUTE:1,CHILD:2},tp=t=>(...e)=>({_$litDirective$:t,values:e});class tg{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}let tm=tp(class extends tg{constructor(t){if(super(t),t.type!==tu.ATTRIBUTE||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){for(let i in this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t))),e)e[i]&&!this.nt?.has(i)&&this.st.add(i);return this.render(e)}let i=t.element.classList;for(let t of this.st)t in e||(i.remove(t),this.st.delete(t));for(let t in e){let s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return F}}),tf=t=>t??X,t$={ha_red:"rgb(244,67,54)",ha_orange:"rgb(255,152,1)",ha_yellow:"rgb(255,193,7)",ha_green:"rgb(81,140,67)",ha_blue:"rgb(68,115,158)",ha_purple:"rgb(146,107,199)",ha_grey:"color-mix(in srgb, var(--primary-text-color, #212121) 50%, transparent)",ha_gray:"color-mix(in srgb, var(--primary-text-color, #212121) 50%, transparent)"},ty={OPEN:"open",CLOSED:"closed",COMPASS:"compass",COMPASS_N:"compass_n",COMPASS_NESW:"compass_nesw",NONE:"none"},tb={DOT:"dot",ARC:"arc",POINTER:"pointer",NONE:"none"},tv={NONE:"none",TICKS:"ticks",TICKS_LABELS:"ticks_with_labels"},tA={ICON:"icon",MARKER:"marker",MARKER_UNIT:"marker_with_unit",MARKER_DIR:"marker_dir",UNIT:"unit",NONE:"none"},tx={ICON:"icon",VALUE:"value",VALUE_UNIT:"value_with_unit",RING_VALUE:"ring_value",RING_VALUE_UNIT:"ring_value_with_unit",NONE:"none"},tE={NAME:"name",UNIT:"unit",RING_UNIT:"ring_unit",ICON:"icon",MIN_MAX:"min_max",VALUE:"value",VALUE_UNIT:"value_with_unit",RING_VALUE:"ring_value",RING_VALUE_UNIT:"ring_value_with_unit",NONE:"none"},tN={TOP:"top",BOTTOM:"bottom",MIDDLE:"middle",BELOW_DIAL:"below_dial",MIN:"min",MAX:"max"},tS=[{US:"color",AU:"colour"},{US:"marker_color",AU:"marker_colour"},{US:"marker2_color",AU:"marker2_colour"},{US:"colorize_icon",AU:"colourise_icon"}],tO={ring_only:!1,ring_type:ty.CLOSED,indicator:tb.ARC,scale:tv.NONE,top_element:tA.NONE,middle_element:tx.ICON,bottom_element:tE.NONE,colour:{"70%":t$.ha_blue,"80%":t$.ha_yellow,"90%":t$.ha_red},min:0,max:100,min_sig_figs:2,max_decimals:1,marker_colour:"var(--secondary-text-color, grey)",marker2_colour:"var(--disabled-text-color, lightgrey)",large_secondary:!1,hide_state:!1,transparent_tile:!1,colourise_icon:!1,tap_action:{action:"more-info",tapped:"info"},icon_tap_action:{action:"more-info",tapped:"icon"}},tw={ring_type:ty.OPEN,top_element:tA.UNIT,middle_element:tx.VALUE,bottom_element:tE.ICON,min_sig_figs:2},tC={ring_type:ty.OPEN,top_element:tA.ICON,middle_element:tx.VALUE_UNIT,bottom_element:tE.MIN_MAX,min_sig_figs:3},tk={top_element:tA.MARKER_DIR,middle_element:tx.VALUE_UNIT,bottom_element:tE.NONE,marker_colour:t$.ha_blue,marker2_colour:"var(--disabled-text-color, grey)",indicator:tb.NONE,ring_size:2},tT={temperature:{null:{null:{icon:"mdi:thermometer",ring_type:ty.OPEN,indicator:tb.DOT,bottom_element:tE.MIN_MAX},"°C":{min:17,max:27,colour:{19.5:t$.ha_blue,21:t$.ha_green,22.5:t$.ha_green,24:t$.ha_yellow,25:t$.ha_orange,27:t$.ha_red}},"°F":{min:62,max:80,colour:{67:t$.ha_blue,70:t$.ha_green,73:t$.ha_green,75:t$.ha_yellow,77:t$.ha_orange,80:t$.ha_red}}}},pressure:{null:{null:{icon:"mdi:weather-partly-cloudy",ring_type:ty.OPEN,indicator:tb.POINTER,scale:tv.TICKS,middle_element:tx.NONE,bottom_element:tE.ICON},mbar:{min:980,max:1040,colour:{983:t$.ha_blue,1013:t$.ha_green,1043:t$.ha_yellow}},inHg:{min:28.9,max:30.4,colour:{29:t$.ha_blue,29.9:t$.ha_green,30.4:t$.ha_yellow}}},medium:{null:{scale:tv.TICKS_LABELS,top_element:tA.NONE,middle_element:tx.NONE,bottom_element:tE.ICON}},large:{null:{scale:tv.TICKS_LABELS,middle_element:tx.VALUE,bottom_element:tE.UNIT}}},humidity:{null:{null:{icon:"mdi:water-percent",ring_type:ty.OPEN,indicator:tb.DOT,max_decimals:0,colour:{0:t$.ha_red,50:t$.ha_green,100:t$.ha_blue}}},medium:{null:{top_element:tA.NONE,middle_element:tx.VALUE_UNIT,bottom_element:tE.ICON}},large:{null:{top_element:tA.ICON,middle_element:tx.VALUE_UNIT,bottom_element:tE.NONE}}},data_size:{null:{null:{ring_type:ty.OPEN,bottom_element:tE.MIN_MAX}},medium:{null:{top_element:tA.NONE,middle_element:tx.ICON}}},wind_speed:{null:{null:{icon:"mdi:weather-windy",ring_type:ty.OPEN},kn:{min:0,max:40,colour:{10:t$.ha_blue,15:t$.ha_green,20:t$.ha_yellow,25:t$.ha_orange,30:t$.ha_red}},"km/h":{min:0,max:75,colour:{20:t$.ha_blue,30:t$.ha_green,40:t$.ha_yellow,50:t$.ha_orange,60:t$.ha_red}},mph:{min:0,max:45,colour:{12:t$.ha_blue,17:t$.ha_green,23:t$.ha_yellow,29:t$.ha_orange,35:t$.ha_red}}}},precipitation:{null:{null:{icon:"mdi:weather-rainy",ring_type:ty.OPEN,colour:t$.ha_blue,bottom_element:tE.MIN_MAX},mm:{max:10},in:{max:.4}},medium:{null:{top_element:tA.NONE,middle_element:tx.ICON}}},battery:{null:{"%":{colour:{20:t$.ha_red,30:t$.ha_orange,40:t$.ha_yellow,70:t$.ha_green},max_decimals:0}},medium:{"%":{scale:tv.TICKS,ring_type:ty.CLOSED,top_element:tA.ICON,middle_element:tx.RING_VALUE_UNIT,bottom_element:tE.NONE}},large:{"%":{scale:tv.TICKS,ring_type:ty.CLOSED,top_element:tA.ICON,middle_element:tx.RING_VALUE_UNIT,bottom_element:tE.NONE}}},power:{null:{null:{ring_type:ty.OPEN,indicator:tb.DOT},kW:{max:3},W:{max:3e3,bottom_element:tE.NONE}},large:{null:{scale:tv.TICKS_LABELS}}},energy:{null:{null:{ring_type:ty.OPEN},kWh:{max:10},Wh:{max:1e4,bottom_element:tE.NONE}},large:{null:{scale:tv.TICKS_LABELS}}},signal_strength:{null:{null:{ring_type:ty.OPEN,middle_element:tx.RING_VALUE,bottom_element:tE.RING_UNIT,min:-90,max:-40,colour:{"-90":t$.ha_purple,"-80":t$.ha_red,"-70":t$.ha_orange,"-67":t$.ha_yellow,"-60":t$.ha_green},max_decimals:0}},medium:{null:{bottom_element:tE.ICON}},large:{null:{middle_element:tx.RING_VALUE_UNIT,bottom_element:tE.MIN_MAX}}},moisture:{null:{null:{colour:{25:t$.ha_yellow,45:t$.ha_blue,55:t$.ha_blue,75:t$.ha_purple},max_decimals:0}},medium:{null:{ring_type:ty.CLOSED,top_element:tA.ICON,middle_element:tx.VALUE_UNIT}},large:{null:{ring_type:ty.CLOSED,bottom_element:tE.NONE}}}};function tI(t){return!isNaN(parseFloat(t))&&!isNaN(t-0)}function tM(t,e,i){return t>i?i:t<e?e:t}function tU(t){return t*Math.PI*2/360}function tL(t,e,i){let s=-Math.sin(tU(t));return[s*e+i/2,Math.cos(tU(t))*e+i/2]}function tR(t){return["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round((t%360+360)%360/22.5)%16]}class tP extends td{_noState;_configProcessed=!1;static get properties(){return{_hass:{attribute:!1},_cfg:{state:!0},_ringStateObj:{state:!0},_displayStateObj:{state:!0},_markerValue:{state:!0},_marker2Value:{state:!0},_min:{state:!0},_max:{state:!0}}}processConfig(){let t={...tO};this._cfg.ring_size&&2===this._cfg.ring_size&&(t={...t,...tw}),this._cfg.ring_size&&this._cfg.ring_size>2&&(t={...t,...tC});let e=this._ringStateObj.attributes.device_class,i=this._ringStateObj.attributes.unit_of_measurement;if(this._cfg.ring_type&&this._cfg.ring_type.startsWith(ty.COMPASS))t={...t,...tk};else{let s=tT[e];if(s){let e=this._cfg.ring_size?1===this._cfg.ring_size?"small":2===this._cfg.ring_size?"medium":"large":"small",r=s.null||{},n=r.null||{},a=r[i]||{},o=s[e]||{},l=o.null||{},h=o[i]||{};t={...t,...n,...a,...l,...h}}}tS.forEach(t=>{t.US in this._cfg&&(this._cfg[t.AU]=this._cfg[t.US])}),this._cfg={...t,...this._cfg},this._cfg.ring_size=tM(this._cfg.ring_size||1,1,6),this._name=this._cfg.name||this._displayStateObj.attributes.friendly_name,this._cfg.bottom_name=this._cfg.bottom_name||this._name,this._cfg.ring_only=this._cfg.ring_only||this._cfg.ring_size>=3,tI(this._cfg.marker)?this._markerValue=parseFloat(this._cfg.marker):this._markerEntity=this._cfg.marker,tI(this._cfg.marker2)?this._marker2Value=parseFloat(this._cfg.marker2):this._marker2Entity=this._cfg.marker2,tI(this._cfg.min)?this._min=parseFloat(this._cfg.min):this._cfg.min&&(this._minEntity=this._cfg.min),tI(this._cfg.max)?this._max=parseFloat(this._cfg.max):this._cfg.max&&(this._maxEntity=this._cfg.max),this._configProcessed=!0}setConfig(t){if(!t)throw Error("Invalid configuration");if(!t.entity)throw Error("You must define an entity");this._cfg={...t},this._hass&&(this.hass=this._hass)}set hass(t){this._hass=t,this._ringStateObj=t.states[this._cfg.ring_entity||this._cfg.entity];let e=this._ringStateObj?this._ringStateObj.state:"unavailable";if(this._noState=["unavailable","unknown"].includes(e),this._displayStateObj=t.states[this._cfg.entity],this._ringStateObj&&!this._configProcessed&&this.processConfig(),this._markerEntity){let e=t.states[this._markerEntity];e&&(this._markerValue=e.state)}if(this._marker2Entity){let e=t.states[this._marker2Entity];e&&(this._marker2Value=e.state)}if(this._minEntity){let e=t.states[this._minEntity];e&&(this._min=parseFloat(e.state))}if(this._maxEntity){let e=t.states[this._maxEntity];e&&(this._max=parseFloat(e.state))}this._min===this._max&&(this._max+=1e-11)}render(){let t=this._ringStateObj?this._ringStateObj.state:"unavailable",e=this._cfg.hide_state?X:B`
          <state-display
            .stateObj=${this._displayStateObj}
            .hass=${this._hass}
            .name=${this._name}
          >
          </state-display>
        `,i=[36,96,154,212,270,330][this._cfg.ring_size-1],s={vertical:!1,centred:this._cfg.ring_only||this._cfg.ring_size>=3,large:this._cfg.ring_size>1,small:1===this._cfg.ring_size},r={"transparent-tile":this.transparent_tile},n=this._cfg.icon;return B`
      <ha-card class="active type-tile ${tm(r)}">
        <div
          class="background"
          @click=${t=>this._handleAction(t,this._cfg.tap_action)}
          role=${tf(this._hasCardAction?"button":void 0)}
          tabindex=${tf(this._hasCardAction?"0":void 0)}
          aria-labelledby="info"
        >
          <ha-ripple .disabled=${!this._hasCardAction}></ha-ripple>
        </div>
        <div class="container">
          <div class="content ${tm(s)} ">
            <rt-ring
              role=${tf(this._hasIconAction?"button":void 0)}
              tabindex=${tf(this._hasIconAction?"0":void 0)}
              data-domain="sensor"
              data-state=${t}
              ring_size=${this._cfg.ring_size}
              @click=${t=>this._handleAction(t,this._cfg.icon_tap_action)}
            >
              <rt-ring-svg
                style="width:${i}px;height:${i}px;"
                slot="icon"
                ring_type=${this._cfg.ring_type}
                ring_size=${this._cfg.ring_size}
                indicator=${this._cfg.indicator}
                scale=${this._cfg.scale}
                .colour=${this._cfg.colour}
                .state=${this._ringStateObj}
                .display_state=${this._displayStateObj}
                .marker_value=${this._markerValue}
                .marker_colour=${this._cfg.marker_colour}
                .marker2_value=${this._marker2Value}
                .marker2_colour=${this._cfg.marker2_colour}
                .icon=${n}
                .colourise_icon=${this._cfg.colourise_icon}
                .top_element=${this._cfg.top_element}
                .middle_element=${this._cfg.middle_element}
                .bottom_element=${this._cfg.bottom_element}
                .bottom_name=${this._cfg.bottom_name}
                .name=${this._name}
                .min=${this._min}
                .max=${this._max}
                .min_sig_figs=${this._cfg.min_sig_figs}
                .max_decimals=${this._cfg.max_decimals}
                .hass=${this._hass}
              ></rt-ring-svg>
              ${this._noState?B` <ha-tile-badge
                    style="--tile-badge-background-color: var(--orange-color)"
                  >
                    <ha-svg-icon .path=${"M10 3H14V14H10V3M10 21V17H14V21H10Z"} />
                  </ha-tile-badge>`:X}
            </rt-ring>
            ${this._cfg.ring_only||this._cfg.ring_size>=3?X:B` <rt-info
                  id="info"
                  .primary=${this._name}
                  .secondary=${e}
                  .large_ring=${this._cfg.ring_size>1}
                  large_secondary=${this._cfg.large_secondary}
                ></rt-info>`}
          </div>
        </div>
      </ha-card>
    `}static getStubConfig(t,e,i){let s=e.filter(t=>t.startsWith("sensor.")),r=s.filter(e=>"temperature"===t.states[e].attributes.device_class);return{entity:r.length>0?r[Math.floor(Math.random()*r.length)]:s[Math.floor(Math.random()*s.length)]}}getCardSize(){return 1}getGridOptions(){let t=6;this._cfg.ring_only&&(t=this._cfg.transparent_tile?1.6:2*this._cfg.ring_size);let e=this._cfg.ring_size;return{columns:t,rows:e,min_columns:t,min_rows:e}}static styles=a`
    :host {
      --tile-color: var(--state-inactive-color);
      -webkit-tap-highlight-color: transparent;
    }
    ha-card:has(.background:focus-visible) {
      --shadow-default: var(--ha-card-box-shadow, 0 0 0 0 transparent);
      --shadow-focus: 0 0 0 1px var(--tile-color);
      border-color: var(--tile-color);
      box-shadow: var(--shadow-default), var(--shadow-focus);
    }
    ha-card {
      --ha-ripple-color: var(--tile-color);
      --ha-ripple-hover-opacity: 0.04;
      --ha-ripple-pressed-opacity: 0.12;
      height: 100%;
      transition: box-shadow 180ms ease-in-out, border-color 180ms ease-in-out;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ha-card.transparent-tile {
      border-width: 0;
      background: none;
    }
    ha-card.active {
      --tile-color: var(--state-icon-color);
    }
    [role="button"] {
      cursor: pointer;
      pointer-events: auto;
    }
    [role="button"]:focus {
      outline: none;
    }
    .background {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      border-radius: var(--ha-card-border-radius, 12px);
      margin: calc(-1 * var(--ha-card-border-width, 1px));
      overflow: hidden;
    }
    .container {
      margin: calc(-1 * var(--ha-card-border-width, 1px));
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .container.horizontal {
      flex-direction: row;
    }

    .content {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px;
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      pointer-events: none;
      overflow: hidden;
    }
    .content.centred {
      /* margin: auto;
      padding: 0; */
      justify-content: center;
    }
    .content.large {
      gap: 20px;
    }
    .content.small {
      gap: 10px;
    }

    .vertical {
      flex-direction: column;
      text-align: center;
      justify-content: center;
    }
    .vertical ha-tile-info {
      width: 100%;
      flex: none;
    }
    rt-ring {
      --tile-icon-color: var(--tile-color);
      position: relative;
      padding: 6px;
      margin: -6px;
    }
    ha-tile-badge {
      position: absolute;
      top: 3px;
      right: 3px;
      inset-inline-end: 3px;
      inset-inline-start: initial;
    }
    /* ha-tile-info { */
    rt-info {
      position: relative;
      min-width: 0;
      transition: background-color 180ms ease-in-out;
      box-sizing: border-box;
    }
    hui-card-features {
      --feature-color: var(--tile-color);
      padding: 0 12px 12px 12px;
    }
    .container.horizontal hui-card-features {
      width: calc(50% - var(--column-gap, 0px) / 2 - 12px);
      flex: none;
      --feature-height: 36px;
      padding: 0 12px;
      padding-inline-start: 0;
    }

    ha-tile-icon[data-domain="alarm_control_panel"][data-state="pending"],
    ha-tile-icon[data-domain="alarm_control_panel"][data-state="arming"],
    ha-tile-icon[data-domain="alarm_control_panel"][data-state="triggered"],
    ha-tile-icon[data-domain="lock"][data-state="jammed"] {
      animation: pulse 1s infinite;
    }

    ha-tile-badge.not-found {
      --tile-badge-background-color: var(--red-color);
    }

    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  `;_handleAction(t,e){if(!e||!e.action)return;let i="icon"===e.tapped&&this._cfg.ring_entity?this._cfg.ring_entity:this._cfg.entity;switch(e.action){case"more-info":i&&this.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:i}}));break;case"navigate":e.navigation_path&&(window.history.pushState(null,"",e.navigation_path),this.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0})));break;case"call-service":if(e.service){let[t,i]=e.service.split(".",2);this._hass.callService(t,i,e.service_data||{})}break;case"url":e.url&&window.open(e.url,"_blank");break;default:console.warn(`Unhandled action type: ${e.action}`)}}_hasCardAction(){return this._cfg.tap_action&&"none"!==this._cfg.tap_action.action}_hasIconAction(){return this._cfg.icon_tap_action&&"none"!==this._cfg.icon_tap_action.action}}function tD(t,e,i,s=!1){if(!document.getElementById(t)){var r=document.createElement("link");r.id=t,r.rel=i,r.href=e,s&&(r.crossOrigin="anonymous"),document.head.appendChild(r)}}class tz extends td{static get properties(){return{primary:{},secondary:{},large_ring:{},large_secondary:{}}}render(){return this.large_ring?B`
        <div class="info large">
          <span class="primary small">${this.primary}</span>
          ${this.secondary?B`<span class="secondary ${this.large_secondary?"large":"small"}">${this.secondary}</span>`:X}
        </div>
      `:B`
        <div class="info small">
          <span class="primary small nowrap">${this.primary}</span>
          ${this.secondary?B`<span class="secondary small nowrap">${this.secondary}</span>`:X}
        </div>
      `}static styles=a`
    .info {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .info.small {
      height: 36px;
      justify-content: center;
    }
    .info.large {
      height: 100px;
    }
    span {
      text-overflow: ellipsis;
      overflow: hidden;
      width: 100%;
    }
    .nowrap {
      white-space: nowrap;
    }
    .primary.small {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.1px;
      color: var(--primary-text-color);
    }
    .secondary.small {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.4px;
      color: var(--primary-text-color);
    }
    .primary.large {
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0px; //0.8px;
      color: var(--primary-text-color);
    }
    .secondary.large {
      font-family: Geist, var(--ha-font-family-body);
      font-optical-sizing: auto;
      font-style: normal;
      font-weight: 600;
      font-size: 34px;
      line-height: 28px;
      // letter-spacing: 0.2px;
      color: var(--primary-text-color);
      height: 60px;
      align-items: center;
      display: flex;
    }
  `}class tV extends td{static get properties(){return{interactive:{},imageStyle:{},imageUrl:{},ring_size:{}}}render(){if(this.imageUrl){let t=this.imageStyle||DEFAULT_TILE_ICON_BORDER_STYLE;return B`
        <div class="container ${classMap({[t]:this.imageUrl})}">
          <img alt="" src=${this.imageUrl} />
        </div>
        <slot></slot>
      `}return B`
      <div
        class="container size_${this.ring_size} ${this.interactive?"background":""}"
      >
        <slot name="icon"></slot>
      </div>
      <slot></slot>
    `}static styles=a`
    :host {
      --tile-icon-color: var(--disabled-color);
      --tile-icon-opacity: 0.2;
      --tile-icon-hover-opacity: 0.35;
      --mdc-icon-size: 24px;
      position: relative;
      user-select: none;
      transition: transform 180ms ease-in-out;
    }
    :host([interactive]:active) {
      transform: scale(1.2);
    }
    :host([interactive]:hover) {
      --tile-icon-opacity: var(--tile-icon-hover-opacity);
    }
    .container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      // width: 36px;
      // height: 36px;
      border-radius: 18px;
      overflow: visible;
      transition: box-shadow 180ms ease-in-out;
    }
    :host([interactive]:focus-visible) .container {
      box-shadow: 0 0 0 2px var(--tile-icon-color);
    }
    .container.rounded-square {
      border-radius: 8px;
    }
    .container.square {
      border-radius: 0;
    }
    .container.background::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: var(--tile-icon-color);
      transition: background-color 180ms ease-in-out, opacity 180ms ease-in-out;
      opacity: var(--tile-icon-opacity);
    }
    .container ::slotted([slot="icon"]) {
      display: flex;
      color: var(--tile-icon-color);
      transition: color 180ms ease-in-out;
      pointer-events: none;
    }
    .container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `}function tj(t,e,i,s){let r=i-s,n=+(Math.abs(e-t)>180),a=tL(t,i,100).join(" "),o=tL(e,i,100).join(" "),l=tL(e,r,100).join(" "),h=tL(t,r,100).join(" "),c=[];return c.push(`M ${a}`),c.push(`A ${i} ${i} 0 ${n} 1 ${o}`),c.push(`A ${s/2} ${s/2} 0 0 1 ${l}`),c.push(`A ${r} ${r} 0 ${n} 0 ${h}`),c.push(`A ${s/2} ${s/2} 0 0 1 ${a}`),c.join(" ")}function tG(t,e){let i=Math.floor(Math.log10(t)),s=t/Math.pow(10,i);return(e?s<1.5?1:s<3?2:s<7?5:10:s<=1?1:s<=2?2:s<=5?5:10)*Math.pow(10,i)}let{I:tH}={M:O,P:w,A:C,C:1,L:Y,R:te,D:L,V:tt,I:ti,H:ts,N:tn,U:ta,B:tr,F:to},tW=t=>void 0===t.strings,tB=(t,e)=>{let i=t._$AN;if(void 0===i)return!1;for(let t of i)t._$AO?.(e,!1),tB(t,e);return!0},tK=t=>{let e,i;do{if(void 0===(e=t._$AM))break;(i=e._$AN).delete(t),t=e}while(0===i?.size)},tF=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),tZ(e)}};function tX(t){void 0!==this._$AN?(tK(this),this._$AM=t,tF(this)):this._$AM=t}function tq(t,e=!1,i=0){let s=this._$AH,r=this._$AN;if(void 0!==r&&0!==r.size)if(e)if(Array.isArray(s))for(let t=i;t<s.length;t++)tB(s[t],!1),tK(s[t]);else null!=s&&(tB(s,!1),tK(s));else tB(this,t)}let tZ=t=>{t.type==tu.CHILD&&(t._$AP??=tq,t._$AQ??=tX)};class tJ extends tg{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),tF(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(tB(this,t),tK(this))}setValue(t){if(tW(this._$Ct))this._$Ct._$AI(t,this);else{let e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}let tY=new WeakMap,tQ=tp(class extends tJ{render(t){return X}update(t,[e]){let i=e!==this.G;return i&&void 0!==this.G&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=e,this.ht=t.options?.host,this.rt(this.ct=t.element)),X}rt(t){if(this.isConnected||(t=void 0),"function"==typeof this.G){let e=this.ht??globalThis,i=tY.get(e);void 0===i&&(i=new WeakMap,tY.set(e,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?tY.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});class t0{#t=[];#e;#i;#s;#r;#n=!1;constructor(t,e={}){if(t.constructor==Object){for(let[i,s]of(this.#s=e.gradStart||0,this.#r=e.gradEnd||100,this.#e=e.minValue||0,this.#i=e.maxValue||100,Object.entries(t))){let t=i.endsWith("%")?this.#e+parseFloat(i)/100*(this.#i-this.#e):parseFloat(i),e=t$[s]||s;this.#t.push({value:this.#a(t),colour:e})}this.#t.sort((t,e)=>t.value-e.value),this.#t[0]>0&&this.#t.unshift({value:0,colour:this.#t[0].colour}),100>this.#t.at(-1)&&this.#t.push({value:100,colour:this.#t.at(-1).colour})}else this.#n=!0,this.#t=t$[t]||t}#a(t){return this.#s+(parseFloat(t)-this.#e)/(this.#i-this.#e)*(this.#r-this.#s)}getConicGradientCss(t=1){if(this.#n)return`background: color-mix(in srgb, ${this.#t} var(--rt-ring-background-opacity, ${100*t}%), transparent);`;let e=this.#t.map(e=>`color-mix(in srgb, ${e.colour} var(--rt-ring-background-opacity, ${100*t}%), transparent) ${e.value}%`);return`background-image: conic-gradient(
        from 180deg,
        ${e.join(", ")}
      );
    `}getSolidColourAtGradPct(t){let e=this.#e+(t-this.#s)/(this.#r-this.#s)*(this.#i-this.#e);return this.getSolidColour(e)}getSolidColour(t){if(tI(t)||(t=0),this.#n)return this.#t;if(this.#a(t)<this.#t[0].value)return this.#t[0].colour;if(this.#a(t)>this.#t.at(-1).value)return this.#t.at(-1).colour;let e=this.#a(t),i=this.#t.find(t=>t.value===e);if(i)return i.colour;let s=this.#t.findLast(t=>t.value<e),r=this.#t.find(t=>t.value>e);if(s.colour===r.colour)return s.colour;let n=100*(e-s.value)/(r.value-s.value);return`color-mix(in srgb,
        ${s.colour} ${100-n}%,
        ${r.colour} ${n}%
      )
    `}}class t1 extends td{constructor(...t){super(...t),t1.prototype.renderText=function(t,e,i){function s(e="",i=1,r=6){return 1-.16*tM(t.length-.7*!!t.includes(".")-.5*!!t.includes("°")+e.length*i-2,0,r-2)}function r(i,s,r,n,a){return K`
        <text class=${a}
          x=${50+r} y="${50+n+i/3.5}" 
          text-anchor="middle" alignment-baseline="alphabetic" 
          font-size=${i}
          >${t}<tspan
            alignment-baseline="alphabetic"
            font-size=${s}
          >${e||X}</tspan>
        </text>
      `}function n(t,e,i,s,r,a="middle"){return K`
        <text class=${r}
          x=${50+i} y="${50+s+e/3.5}" 
          text-anchor=${a} alignment-baseline="alphabetic" 
          font-size=${e}
        >${t}</text>
      `}if(tI(t)&&![tN.MIN,tN.MAX].includes(i)){let e=Math.max(Math.floor(this.min_sig_figs-Math.log10(Math.abs(t))),0);e>(this.max_decimals??99)&&(e=this.max_decimals),0===parseFloat(t=parseFloat(t).toFixed(e))&&(t="0")}e&&(1===this.ring_size?e.startsWith("°")?(t=`${t}\xb0`,e=""):e=e.slice(0,1):"%"!==e&&(e=` ${e}`));let a=[1,.8,.75,.72,.71,.7][this.ring_size-1],o=[20,15,11,10,9,7.5][this.ring_size-1];switch(i){case tN.TOP:return r(12,12,0,this.scale===tv.TICKS_LABELS?-22:-25,"top marker");case tN.MIDDLE:if(1===this.ring_size||["%",""].includes(e)){let t=42*s(e,.8)*a;return r(t,.8*t,0,0,`middle ${1===this.ring_size?"tight":""}`)}{let i=38*s()*a,r=22-2*(2===this.ring_size);return K`
            ${n(t,i,0,0,"middle")}
            ${n(e,15*a,0,r,"middle unit")}
          `}case tN.BELOW_DIAL:{let t=20*s(e,.8,4)*a;return r(t,.8*t,0,18,"lower-middle")}case tN.BOTTOM:{let t=41,e="bottom";return this.ring_type===ty.CLOSED&&(t-=15,e+=" closed"),r(o,o,0,t,e)}case tN.MIN:{let e=-32+[0,6,6,4,3.8,3.2][this.ring_size-1],i=41-10*(this.ring_type===ty.CLOSED);return n(t,o,e,i,"bottom","start")}case tN.MAX:{let e=32-[0,6,6,4,3.8,3.2][this.ring_size-1],i=41-10*(this.ring_type===ty.CLOSED);return n(t,o,e,i,"bottom","end")}}},t1.prototype.renderScale=function(t=1){let e=this._ringWidth,i=1===this.ring_size?3:5,s=[80,80,110,110,110,110][this.ring_size-1],r=this.min,n=this.max,a=n-r,o=tG(a,!1),l=tG(o/(i-1),!0),[h,c]=function(t){let e=Math.pow(10,Math.floor(Math.log10(t)));return 5==t/e?[t/5,t/10]:[t/2,t/10]}(l),d=Math.round(a/c)<s,_=[];for(let t=Math.ceil(r/l)*l;t<=n;t+=l)_.push(t);let u=[];for(let t=Math.ceil(r/h)*h;t<=n;t+=h)_.includes(t)||u.push(t);let p=[];if(d)for(let t=Math.ceil(r/c)*c;t<=n;t+=c)_.includes(t)||u.includes(t)||p.push(t);let g=t=>this._startDegrees+(this._endDegrees-this._startDegrees)*(t-r)/a,m=[1,1,1,.9,.8,.7][this.ring_size-1],f=(t,i)=>{let s=(g(t)+180*(this.ring_type===ty.CLOSED))%360,r=tL(s,this._outerRadius,100),n=tL(s,this._outerRadius-i*e,100);return`M ${r[0]} ${r[1]} L ${n[0]} ${n[1]}`},$=t=>{if(this.bottom_element===tE.MIN_MAX&&(t===this.min||t===this.max))return X;let i=this._outerRadius*[.45,.65,.7,.73,.75,.77][this.ring_size-1];this._hasMarker&&this.indicator===tb.DOT&&(i*=.96),Math.log10(this.max)>3&&(i*=.93);let s=tL((g(t)+180*(this.ring_type===ty.CLOSED))%360,i,100),r=1===this.ring_size?2.5*e:1.15*e;return K`
          <text
            x=${s[0]} y=${s[1]}
            text-anchor="middle"
            alignment-baseline="central"
            font-size=${r}
          >${t}</text>
        `},y=K`
      <path
        class="grand"
        d=${_.map(t=>f(t,1.35)).join(" ")}
        stroke-width=${1.8*m}
        stroke-opacity=${t}
      />`,b=X;this.scale===tv.TICKS_LABELS&&(b=_.map($));let v=K`
      <path
        class="major"
        d=${u.map(t=>f(t,1.2)).join(" ")}
        stroke-width=${1.2*m}
        stroke-opacity=${.7*t}
      />`,A=X;this.scale===tv.TICKS_LABELS&&this.ring_size>3&&l/h!=5&&(A=u.map($));let x=K`
      <path
        class="minor"
        d=${p.map(t=>f(t,1)).join(" ")}
        stroke-width=${.6*m}
        stroke-opacity=${.3*t}
      />`;return K`
        <g class="scale">
          <g class="ticks">
            ${y}
            ${v}
            ${x}
          </g>
          <g class="labels">
            ${A}        
            ${b} 
          </g> 
        </g>
      `},function(t){t.prototype.renderGradRing=function(t,e,i){let s=this._ringWidth,r=tj(t,e,this._outerRadius,s),n=this._grad.getConicGradientCss(i),a=i.toString().replace(".","");return K`
      <clipPath id="ring-clip-${a}">
        <path
          d=${r}
        />
      </clipPath>
      <foreignObject
        x="0" y="0"
        class="ring-grad"
        width=${100} height=${100}
        clip-path="url(#ring-clip-${a})"
        transform="rotate(${180*(this.ring_type===ty.CLOSED)} ${50} ${50})"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style="width: ${100}px; height: ${100}px; ${n};";
        />
      </foreignObject>
    `},t.prototype.renderSolidRing=function(t,e,i){let s=this._ringWidth,r=tj(t,e,this._outerRadius,s);return K`<path 
        class="ring-solid"
        d=${r}
        fill=${this._grad.getSolidColour(i)}
        stroke-width="0"
        fill-opacity="1"
        transform="rotate(${180*(this.ring_type===ty.CLOSED)} ${50} ${50})"
      />`}}(t1),t1.prototype.renderPointer=function(t){let e="color-mix(in srgb, orange 80%, var(--primary-text-color))",i=tL(this.ring_type===ty.CLOSED?t:(t+180)%360,7.5,100),s=tL(this.ring_type!==ty.CLOSED?t:(t+180)%360,this._outerRadius-this._ringWidth/2,100);return K`
        <g class="indicator">
          <line class="pointer"
            x1=${i[0]} y1=${i[1]}
            x2=${s[0]}   y2=${s[1]}
            stroke=${e}
            stroke-width=${[5,3,2.5,2.5,2.3,2][this.ring_size-1]}
            stroke-linecap="round"
          />
          <circle class="pointer"
            cx=${50} cy=${50}
            r=${[7,5,3.5,3.5,3.3,2.9][this.ring_size-1]}
            fill=${e}
          />
          <circle class="pointer-centre"
            cx=${50} cy=${50}
            r=${[3,2.5,1.8,1.8,1.6,1.4][this.ring_size-1]}
            fill="#444444"
        </g>
      `},t1.prototype.renderMarker=function(t,e){let i,s,r,n=this._ringWidth,a="marker";if(this.ring_type.startsWith(ty.COMPASS))i=parseFloat(t),s=2.3*n,r=0,i=(i+180)%360,a="marker compass";else{let e=tM(t,this.min,this.max);i=this._startDegrees+(this._endDegrees-this._startDegrees)*(e-this.min)/(this.max-this.min),s=(this.indicator===tb.DOT?1.2:1.5)*n,r=this.indicator===tb.DOT?0:this.ring_size<=2?n/5:n/8,this.ring_type===ty.CLOSED&&(i=(i+180)%360)}if(this.indicator!==tb.POINTER){let t=[];this.indicator===tb.DOT?t.push(`M 50 ${100-n+r}`):t.push(`M 50 ${100-n/3}`),t.push(`l ${s/2} -${s*Math.sin(tU(60))}`),this.ring_type.startsWith(ty.COMPASS)?(t.push(`l -${s/2} ${s/6}`),t.push(`l -${s/2} -${s/6}`)):t.push(`h -${s}`),t.push("Z");let o=t.join(" "),l=180*!!this.ring_type.startsWith(ty.COMPASS);return K`
        <g class=${a} transform="rotate(${i} ${50} ${50})">
          <path
            d=${o}
            fill=${e}
            stroke="var(--card-background-color, white)"
            stroke-linejoin="bevel"
            stroke-width=${r}
            transform="rotate(${l} ${50} ${100-s/2})"
          />
        </g>`}{let t=[50,50],s=tL(i,50-.75*n,100),r=[2,1.6,1.4,1.3,1.2,1.1][this.ring_size-1];return K`
          <g class=${a}>
            <line
              x1=${t[0]} y1=${t[1]}
              x2=${s[0]} y2=${s[1]}
              stroke=${e}
              stroke-linecap="round"
              stroke-width=${r}
            />
          </g>
        `}},t1.prototype.renderIcon=function(t,e,i){let s,r,n;switch(t){case tN.TOP:s=[0,.6,1,1.2,1.8,2.2][this.ring_size-1],r=[0,-43,-42,-45,-40,-40][this.ring_size-1],this.indicator===tb.POINTER&&(r*=.75),this.scale===tv.TICKS_LABELS&&(s*=.95),n="icon top";break;case tN.MIDDLE:s=1===this.ring_size?this.ring_type===ty.NONE?1:(this.ring_type===ty.CLOSED?.9:.85)*(this._hasMarker&&this.indicator===tb.DOT?.9:1):[2.1,3.1,4,5,6][this.ring_size-2],r=this.bottom_element===tE.MIN_MAX?-2:0,n="icon middle";break;case tN.BOTTOM:s=[.5,.9,1.5,2,3,3.5][this.ring_size-1],r=[25,40,38,40,35,35][this.ring_size-1],this.ring_type===ty.CLOSED&&(r=[5,25,26,27,23,24][this.ring_size-1]),n="icon bottom"}let a=24*s,o=r*s,l=i?`--rt-icon-state-color: ${this._grad.getSolidColour(i)};`:"";return B`
      <div
        style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, calc(-50% + ${o}px));
            ${l}
          "
      >
        <ha-state-icon
          .icon=${this.icon}
          .stateObj=${e}
          .hass=${this.hass}
          class=${n}
          ${tQ(t=>{if(t){let e=()=>{let e=t.shadowRoot?.querySelector("ha-icon"),i=e?.shadowRoot?.querySelector("ha-svg-icon");return!!i&&(i.style.width=`${a}px`,i.style.height=`${a}px`,!0)},i=0,s=setInterval(()=>{(e()||i>=40)&&clearInterval(s),i++},50)}})}
        ></ha-state-icon>
      </div>
    `},t1.prototype.renderDot=function(t,e){let i=this._ringWidth,s=tL(t,this._outerRadius-i/2,100),r=i*[.55,.4,.35,.35,.35,.35][this.ring_size-1],n=i/2+.7*r,a=tj(t-10,t+10,this._outerRadius+.05*i,1.1*i);return K`
            <g class="indicator">
              <clipPath id="ring-clip">
                <path d=${a}
                />
              </clipPath>
              <circle 
                class="dot-outline"
                cx=${s[0]} cy=${s[1]} 
                r=${n+r/2}
                clip-path="url(#ring-clip)"
                fill="var(--card-background-color, white)"
                transform="rotate(${180*(this.ring_type===ty.CLOSED)} ${50} ${50})"
              />
              <circle 
                class="dot"
                cx=${s[0]} cy=${s[1]} 
                r=${n-r/2}
                fill=${this._grad.getSolidColour(e)}
                transform="rotate(${180*(this.ring_type===ty.CLOSED)} ${50} ${50})"
              />
            </g>`},t1.prototype.renderCompass=function(){let t=.7*this._ringWidth,e=[],i=[],s=[],r=[];for(let n=0;n<360;n+=5.625){let a=(n+180)%360;if(n%90==0)if(this.ring_type===ty.COMPASS_NESW||this.ring_type===ty.COMPASS_N&&0===a){let e=tL(n,this._outerRadius-1.2*t/2,100);i.push(K`<text
                  class="compass cardinal"
                  x=${e[0]}
                  y=${e[1]}
                  text-anchor="middle"
                  alignment-baseline="central"
                  font-size=${2*t}
                  fill="var(--primary-text-color, #212121)"
                >${tR(a)}</text>`)}else e.push(`M ${tL(n,this._outerRadius,100)}`),e.push(`L ${tL(n,this._outerRadius-1.7*t,100)}`);else n%22.5==0?(s.push(`M ${tL(n,this._outerRadius,100)}`),s.push(`L ${tL(n,this._outerRadius-1.2*t,100)}`)):(r.push(`M ${tL(n,this._outerRadius,100)}`),r.push(`L ${tL(n,this._outerRadius-t,100)}`))}let n=i?K`${i}`:nothing,a=e?K`
            <path
              class="compass cardinals"
              d=${e.join(" ")}
              stroke-width=2
              fill="none"
              stroke="var(--primary-text-color, #212121)"
              stroke-linecap="round"
            />`:nothing;return K`
        ${n}
        ${a}
        <path
          class="compass major"
          d=${s.join(" ")}
          stroke-width=1.4
          fill="none"
          stroke="var(--primary-text-color, #212121)"
          stroke-linecap="round"
          stroke-opacity=0.7
        />
        <path
          class="compass minor"
          d=${r.join(" ")}
          stroke-width=0.8
          fill="none"
          stroke="var(--primary-text-color, #212121)"
          stroke-linecap="round"
          stroke-opacity=0.3
        />`}}static get properties(){return{ring_type:{},indicator:{},scale:{},ring_size:{},colour:{attribute:!1},state:{attribute:!1},display_state:{attribute:!1},marker_value:{attribute:!1},marker_colour:{attribute:!1},marker2_value:{attribute:!1},marker2_colour:{attribute:!1},min:{attribute:!1},max:{attribute:!1},icon:{attribute:!1},colourise_icon:{attribute:!1},name:{attribute:!1},bottom_element:{attribute:!1},middle_element:{attribute:!1},top_element:{attribute:!1},bottom_name:{attribute:!1},min_sig_figs:{attribute:!1},max_decimals:{attribute:!1},hass:{attribute:!1}}}configureRing(){this._outerRadius=50,this._hasMarker=tI(this.marker_value),this.bottom_element===tE.NAME&&(this.bottom_name=this.bottom_name||this.name),this._startDegrees=60,this._endDegrees=300,this.ring_type.startsWith(ty.COMPASS)||this.ring_type===ty.CLOSED?(this._startDegrees=0,this._endDegrees=359.999):([tE.ICON,tE.NONE,tE.UNIT].includes(this.bottom_element)||this.bottom_element===tE.NAME&&this.bottom_name.length<=[3,6,8,10,12,14][this.ring_size-1]||this.bottom_element===tE.MIN_MAX&&this.ring_size>1||this.bottom_element.includes(tE.VALUE)&&this.ring_size>1)&&(this._startDegrees=45,this._endDegrees=315),this._ringUnit=this.state?this.state.attributes.unit_of_measurement:X,this._displayUnit=this.display_state?this.display_state.attributes.unit_of_measurement:X;let t={minValue:this.min,maxValue:this.max,gradStart:100*this.startDegrees/360,gradEnd:100*this.endDegrees/360};this._grad=new t0(this.colour,t),this.marker_colour=t$[this.marker_colour]||this.marker_colour,this.marker2_colour=t$[this.marker2_colour]||this.marker2_colour,this._ringWidth=[10,8,7,6,5.5,5][this.ring_size-1]*(this.scale===tv.NONE?1:.85)}getTopElementSvg(){switch(this.top_element){case tA.MARKER:return this.renderText(this.marker_value,"",tN.TOP);case tA.MARKER_UNIT:return this.renderText(this.marker_value,this._displayUnit,tN.TOP);case tA.UNIT:return this.renderText(this._displayUnit,"",tN.TOP);case tA.MARKER_DIR:return this.renderText(tR(this.marker_value),"",tN.TOP);default:return X}}getMiddleElementSvg(){switch(this.middle_element){case tx.VALUE:case tx.VALUE_UNIT:case tx.RING_VALUE:case tx.RING_VALUE_UNIT:if(this._noState)return X;let t=[tx.RING_VALUE,tx.RING_VALUE_UNIT].includes(this.middle_element)?this.state.state:this.display_state.state,e="";this.middle_element===tx.VALUE_UNIT&&(e=this._displayUnit),this.middle_element===tx.RING_VALUE_UNIT&&(e=this._ringUnit);let i=this.indicator===tb.POINTER?tN.BELOW_DIAL:tN.MIDDLE;return this.renderText(t,e,i);default:return X}}getBottomElementSvg(){if(this.ring_type.startsWith(ty.COMPASS))return X;switch(this.bottom_element){case tE.NAME:return this.renderText(this.bottom_name,"",tN.BOTTOM);case tE.UNIT:return this.renderText(this._displayUnit,"",tN.BOTTOM);case tE.RING_UNIT:return this.renderText(this._ringUnit,"",tN.BOTTOM);case tE.MIN_MAX:if(this.ring_type===ty.CLOSED)return X;let t=Math.round(this.min,0),e=this.max-this.min<.01?"–":Math.round(this.max,0);return K`
          ${this.renderText(t,"",tN.MIN)}
          ${this.renderText(e,"",tN.MAX)}
        `;case tE.VALUE:case tE.VALUE_UNIT:case tE.RING_VALUE:case tE.RING_VALUE_UNIT:if(this._noState)return X;let i=[tE.RING_VALUE,tE.RING_VALUE_UNIT].includes(this.bottom_element)?this.state.state:this.display_state.state,s="";return this.bottom_element===tE.VALUE_UNIT&&(s=this._displayUnit),this.bottom_element===tE.RING_VALUE_UNIT&&(s=this._ringUnit),this.renderText(i,s,tN.BOTTOM);default:return X}}render(){let t,e;this.configureRing(),this._noState=["unknown","unavailable"].includes(this.state.state);let i=tM(this.state.state,this.min,this.max),s=this._startDegrees+(this._endDegrees-this._startDegrees)*(i-this.min)/(this.max-this.min);this._noState&&(i=this.min,s=this._startDegrees,this._grad=new t0("grey"));let r=.15;this.indicator===tb.DOT?r=.7:this.indicator===tb.POINTER?r=.07:this.scale===tb.NONE&&(r=.15),t=this.ring_type===ty.NONE?X:this.ring_type.startsWith(ty.COMPASS)?this.renderCompass():this.renderGradRing(this._startDegrees,this._endDegrees,r);let n=X,a=X;if(this.ring_type!==ty.NONE&&!this._noState)switch(this.indicator){case tb.ARC:n=this.renderSolidRing(this._startDegrees,s,this.state.state);break;case tb.DOT:n=this.renderDot(s,this.state.state);break;case tb.POINTER:a=this.renderPointer(s);case tb.NONE:}let o=X;if(this.scale!==tv.NONE){let t=this.indicator===tb.POINTER?.7:.2;o=this.renderScale(t)}let l=tI(this.marker_value)&&!this._noState?this.renderMarker(this.marker_value,this.marker_colour):X,h=tI(this.marker2_value)&&!this._noState?this.renderMarker(this.marker2_value,this.marker2_colour):X;this.colourise_icon&&(e=this.state.state);let c=this.middle_element===tx.ICON?this.renderIcon(tN.MIDDLE,this.display_state,e):this.top_element===tA.ICON?this.renderIcon(tN.TOP,this.display_state,e):this.bottom_element===tE.ICON?this.renderIcon(tN.BOTTOM,this.display_state,e):X,d=this.getTopElementSvg(),_=this.getMiddleElementSvg(),u=this.getBottomElementSvg();return B`
      ${c}
      <svg
        viewBox="0 0 ${100} ${100}"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        role="img"
        aria-hidden="true"
      >
        <g class="elements">
          ${d} ${_} ${u}
        </g>
        <g class="ring">${t} ${o}</g>
        <g class="indicators">
          ${n} ${h} ${l} ${a}
        </g>
      </svg>
    `}static styles=a`
    :host {
      display: var(--ha-icon-display, inline-flex);
      align-items: center;
      justify-content: center;
      position: relative;
      vertical-align: middle;
      fill: var(--icon-primary-color, currentcolor);
    }
    svg {
      width: 100%;
      height: 100%;
      pointer-events: none;
      display: block;
      position: absolute;
      inset: 0;
      overflow: visible;
    }
    path.primary-path {
      opacity: var(--icon-primary-opactity, 1);
    }
    path.secondary-path {
      fill: var(--icon-secondary-color, currentcolor);
      opacity: var(--icon-secondary-opactity, 0.5);
    }
    text {
      font-family: Geist, var(--ha-font-family-body);
      font-optical-sizing: auto;
      font-style: normal;
      color: var(--primary-text-color);
      font-weight: 600;
    }
    text.middle {
      letter-spacing: -0.3px;
    }
    text.middle.tight {
      letter-spacing: -1.1px;
    }
    text.lower-middle {
      letter-spacing: -0.2px;
    }
    text.middle.unit {
      letter-spacing: 0px;
      opacity: var(--rt-background-text-opacity, 0.6);
      font-weight: 500;
    }
    text.bottom.closed {
      letter-spacing: -0.2px;
      opacity: var(--rt-background-text-opacity, 0.6);
      font-weight: 500;
    }
    text.top.marker {
      opacity: var(--rt-background-text-opacity, 0.6);
      font-weight: 500;
    }
    ha-state-icon.icon.top {
      color: var(
        --rt-icon-color,
        var(
          --rt-icon-state-color,
          color-mix(
            in srgb,
            var(--primary-text-color, #212121) var(--rt-top-icon-opacity, 50%),
            transparent
          )
        )
      );
    }
    ha-state-icon.icon {
      color: var(
        --rt-icon-color,
        var(--rt-icon-state-color, var(--tile-icon-color))
      );
    }
    text.compass.cardinal {
      font-weight: 800;
    }
    g.scale text {
      font-weight: 300;
      letter-spacing: 0px;
      opacity: var(--rt-scale-text-opacity, 0.5);
      fill: var(--primary-text-color, #212121);
    }
    .scale .ticks {
      stroke: var(--primary-text-color, #212121);
    }
    .pointer {
      stroke: var(--rt-pointer-colour, orange);
      fill: var(--rt-pointer-colour, orange);
    }
    // this doesn't work in Safari
    // .marker.compass {
    //   filter: drop-shadow(0px 0px 1.5px #00000020);
    // }
  `}var t2={};t2=JSON.parse('{"name":"ring-tile-card","version":"1.0.0","description":"A Home Assistant card to visualise your sensor data, based on tile card","author":"neponn","license":"MIT","repository":{"type":"git","url":"https://github.com/neponn/ring-tile-card.git"},"source":"src/ring-tile-card.js","type":"module","devDependencies":{"parcel":"^2.15.2"},"dependencies":{"lit":"^3.1.0"}}'),console.info(`%c ring-tile-card %c v${t2.version} `,"color: yellow; font-weight: bold; background: darkblue","color: white; font-weight: bold; background: dimgray"),tD("gf1","https://fonts.googleapis.com","preconnect"),tD("gf2","https://fonts.gstatic.com","preconnect"),tD("gf3","https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap","stylesheet",!0),customElements.define("ring-tile",tP),customElements.define("rt-info",tz),customElements.define("rt-ring",tV),customElements.define("rt-ring-svg",t1),window.customCards=window.customCards||[],window.customCards.push({type:"ring-tile",name:"Ring Tile Card",preview:!0,description:"Add a ring to your sensor tile cards to visualise sensor state."})})();
//# sourceMappingURL=ring-tile-card.js.map
