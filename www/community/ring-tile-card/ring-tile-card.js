(()=>{let t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;class r{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,i=this.t;if(e&&void 0===t){let e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}}let n=(t,...e)=>new r(1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]),t,i),a=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:o,defineProperty:l,getOwnPropertyDescriptor:h,getOwnPropertyNames:c,getOwnPropertySymbols:d,getPrototypeOf:_}=Object,u=globalThis,p=u.trustedTypes,m=p?p.emptyScript:"",g=u.reactiveElementPolyfillSupport,f={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!o(t,e),y={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;class b extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=y){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){let n=s?.call(this);r?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??y}static _$Ei(){if(this.hasOwnProperty("elementProperties"))return;let t=_(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty("finalized"))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty("properties")){let t=this.properties;for(let e of[...c(t),...d(t)])this.createProperty(e,t[e])}let t=this[Symbol.metadata];if(null!==t){let e=litPropertyMetadata.get(t);if(void 0!==e)for(let[t,i]of e)this.elementProperties.set(t,i)}for(let[t,e]of(this._$Eh=new Map,this.elementProperties)){let i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t))for(let i of new Set(t.flat(1/0).reverse()))e.unshift(a(i));else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){let i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map;for(let e of this.constructor.elementProperties.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let e of s){let s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){let r=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){let t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:f;this._$Em=s,this[s]=r.fromAttribute(e,t.type)??this._$Ej?.get(s)??null,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){let s=this.constructor,r=this[t];if(!(((i??=s.getPropertyOptions(t)).hasChanged??$)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[e,i]of t){let{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1,e=this._$AL;try{(t=this.shouldUpdate(e))?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}b.elementStyles=[],b.shadowRootOptions={mode:"open"},b.elementProperties=new Map,b.finalized=new Map,g?.({ReactiveElement:b}),(u.reactiveElementVersions??=[]).push("2.1.0");let v=globalThis,E=v.trustedTypes,A=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,x="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,O="?"+N,S=`<${O}>`,w=document,C=()=>w.createComment(""),T=t=>null===t||"object"!=typeof t&&"function"!=typeof t,k=Array.isArray,I=t=>k(t)||"function"==typeof t?.[Symbol.iterator],M="[ 	\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,L=/>/g,P=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,z=/"/g,V=/^(?:script|style|textarea|title)$/i,j=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),G=j(1),H=j(2),W=(j(3),Symbol.for("lit-noChange")),B=Symbol.for("lit-nothing"),F=new WeakMap,K=w.createTreeWalker(w,129);function X(t,e){if(!k(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}let q=(t,e)=>{let i=t.length-1,s=[],r,n=2===e?"<svg>":3===e?"<math>":"",a=U;for(let e=0;e<i;e++){let i=t[e],o,l,h=-1,c=0;for(;c<i.length&&(a.lastIndex=c,null!==(l=a.exec(i)));)c=a.lastIndex,a===U?"!--"===l[1]?a=R:void 0!==l[1]?a=L:void 0!==l[2]?(V.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=P):void 0!==l[3]&&(a=P):a===P?">"===l[0]?(a=r??U,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?P:'"'===l[3]?z:D):a===z||a===D?a=P:a===R||a===L?a=U:(a=P,r=void 0);let d=a===P&&t[e+1].startsWith("/>")?" ":"";n+=a===U?i+S:h>=0?(s.push(o),i.slice(0,h)+x+i.slice(h)+N+d):i+N+(-2===h?e:d)}return[X(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Y{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0,a=t.length-1,o=this.parts,[l,h]=q(t,e);if(this.el=Y.createElement(l,i),K.currentNode=this.el.content,2===e||3===e){let t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=K.nextNode())&&o.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(let t of s.getAttributeNames())if(t.endsWith(x)){let e=h[n++],i=s.getAttribute(t).split(N),a=/([.?@])?(.*)/.exec(e);o.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?te:"?"===a[1]?ti:"@"===a[1]?ts:tt}),s.removeAttribute(t)}else t.startsWith(N)&&(o.push({type:6,index:r}),s.removeAttribute(t));if(V.test(s.tagName)){let t=s.textContent.split(N),e=t.length-1;if(e>0){s.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],C()),K.nextNode(),o.push({type:2,index:++r});s.append(t[e],C())}}}else if(8===s.nodeType)if(s.data===O)o.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(N,t+1));)o.push({type:7,index:r}),t+=N.length-1}r++}}static createElement(t,e){let i=w.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,s){if(e===W)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl,n=T(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t))._$AT(t,i,s),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=Z(t,r._$AS(t,e.values),r,s)),e}class J{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??w).importNode(e,!0);K.currentNode=s;let r=K.nextNode(),n=0,a=0,o=i[0];for(;void 0!==o;){if(n===o.index){let e;2===o.type?e=new Q(r,r.nextSibling,this,t):1===o.type?e=new o.ctor(r,o.name,o.strings,this,t):6===o.type&&(e=new tr(r,this,t)),this._$AV.push(e),o=i[++a]}n!==o?.index&&(r=K.nextNode(),n++)}return K.currentNode=w,s}p(t){let e=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){T(t=Z(this,t,e))?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):I(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==B&&T(this._$AH)?this._$AA.nextSibling.data=t:this.T(w.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let t=new J(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new Y(t)),e}k(t){k(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let r of t)s===e.length?e.push(i=new Q(this.O(C()),this.O(C()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){let e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}_$AI(t,e=this,i,s){let r=this.strings,n=!1;if(void 0===r)(n=!T(t=Z(this,t,e,0))||t!==this._$AH&&t!==W)&&(this._$AH=t);else{let s,a,o=t;for(t=r[0],s=0;s<r.length-1;s++)(a=Z(this,o[i+s],e,s))===W&&(a=this._$AH[s]),n||=!T(a)||a!==this._$AH[s],a===B?t=B:t!==B&&(t+=(a??"")+r[s+1]),this._$AH[s]=a}n&&!s&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class te extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}class ti extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==B)}}class ts extends tt{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??B)===W)return;let i=this._$AH,s=t===B&&i!==B||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==B&&(i===B||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class tr{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}let tn=v.litHtmlPolyfillSupport;tn?.(Y,Q),(v.litHtmlVersions??=[]).push("3.3.0");let ta=globalThis;class to extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{let s=i?.renderBefore??e,r=s._$litPart$;if(void 0===r){let t=i?.renderBefore??null;s._$litPart$=r=new Q(e.insertBefore(C(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}to._$litElement$=!0,to.finalized=!0,ta.litElementHydrateSupport?.({LitElement:to});let tl=ta.litElementPolyfillSupport;tl?.({LitElement:to}),(ta.litElementVersions??=[]).push("4.2.0");let th={ATTRIBUTE:1,CHILD:2},tc=t=>(...e)=>({_$litDirective$:t,values:e});class td{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}let t_=tc(class extends td{constructor(t){if(super(t),t.type!==th.ATTRIBUTE||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){for(let i in this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t))),e)e[i]&&!this.nt?.has(i)&&this.st.add(i);return this.render(e)}let i=t.element.classList;for(let t of this.st)t in e||(i.remove(t),this.st.delete(t));for(let t in e){let s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return W}}),tu={ha_red:"rgb(244,67,54)",ha_orange:"rgb(255,152,1)",ha_yellow:"rgb(255,193,7)",ha_green:"rgb(81,140,67)",ha_blue:"rgb(68,115,158)",ha_purple:"rgb(146,107,199)",ha_grey:"color-mix(in srgb, var(--primary-text-color, #212121) 50%, transparent)",ha_gray:"color-mix(in srgb, var(--primary-text-color, #212121) 50%, transparent)"},tp={OPEN:"open",CLOSED:"closed",COMPASS:"compass",COMPASS_N:"compass_n",COMPASS_NESW:"compass_nesw",NONE:"none"},tm={DOT:"dot",ARC:"arc",POINTER:"pointer",NONE:"none"},tg={NONE:"none",TICKS:"ticks",TICKS_LABELS:"ticks_with_labels"},tf={ICON:"icon",MARKER:"marker",MARKER_UNIT:"marker_with_unit",MARKER_DIR:"marker_dir",UNIT:"unit",NONE:"none"},t$={ICON:"icon",VALUE:"value",VALUE_UNIT:"value_with_unit",RING_VALUE:"ring_value",RING_VALUE_UNIT:"ring_value_with_unit",NONE:"none"},ty={NAME:"name",UNIT:"unit",RING_UNIT:"ring_unit",ICON:"icon",MIN_MAX:"min_max",VALUE:"value",VALUE_UNIT:"value_with_unit",RING_VALUE:"ring_value",RING_VALUE_UNIT:"ring_value_with_unit",NONE:"none"},tb={TOP:"top",BOTTOM:"bottom",MIDDLE:"middle",BELOW_DIAL:"below_dial",MIN:"min",MAX:"max"},tv=[{US:"color",AU:"colour"},{US:"marker_color",AU:"marker_colour"},{US:"marker2_color",AU:"marker2_colour"},{US:"colorize_icon",AU:"colourise_icon"}],tE={ring_only:!1,ring_type:tp.CLOSED,indicator:tm.ARC,scale:tg.NONE,top_element:tf.NONE,middle_element:t$.ICON,bottom_element:ty.NONE,colour:{"70%":tu.ha_blue,"80%":tu.ha_yellow,"90%":tu.ha_red},min:0,max:100,min_sig_figs:2,max_decimals:1,marker_colour:"var(--secondary-text-color, grey)",marker2_colour:"var(--disabled-text-color, lightgrey)",large_secondary:!1,hide_state:!1,transparent_tile:!1,colourise_icon:!1,tap_action:{action:"more-info",tapped:"info"},icon_tap_action:{action:"more-info",tapped:"icon"}},tA={ring_type:tp.OPEN,top_element:tf.UNIT,middle_element:t$.VALUE,bottom_element:ty.ICON,min_sig_figs:2},tx={ring_type:tp.OPEN,top_element:tf.ICON,middle_element:t$.VALUE_UNIT,bottom_element:ty.MIN_MAX,min_sig_figs:3},tN={top_element:tf.MARKER_DIR,middle_element:t$.VALUE_UNIT,bottom_element:ty.NONE,marker_colour:tu.ha_blue,marker2_colour:"var(--disabled-text-color, grey)",indicator:tm.NONE,ring_size:2},tO={temperature:{null:{null:{icon:"mdi:thermometer",ring_type:tp.OPEN,indicator:tm.DOT,bottom_element:ty.MIN_MAX},"°C":{min:17,max:27,colour:{19.5:tu.ha_blue,21:tu.ha_green,22.5:tu.ha_green,24:tu.ha_yellow,25:tu.ha_orange,27:tu.ha_red}},"°F":{min:62,max:80,colour:{67:tu.ha_blue,70:tu.ha_green,73:tu.ha_green,75:tu.ha_yellow,77:tu.ha_orange,80:tu.ha_red}}}},pressure:{null:{null:{icon:"mdi:weather-partly-cloudy",ring_type:tp.OPEN,indicator:tm.POINTER,scale:tg.TICKS,middle_element:t$.NONE,bottom_element:ty.ICON},mbar:{min:980,max:1040,colour:{983:tu.ha_blue,1013:tu.ha_green,1043:tu.ha_yellow}},inHg:{min:28.9,max:30.4,colour:{29:tu.ha_blue,29.9:tu.ha_green,30.4:tu.ha_yellow}}},medium:{null:{scale:tg.TICKS_LABELS,top_element:tf.NONE,middle_element:t$.NONE,bottom_element:ty.ICON}},large:{null:{scale:tg.TICKS_LABELS,middle_element:t$.VALUE,bottom_element:ty.UNIT}}},humidity:{null:{null:{icon:"mdi:water-percent",ring_type:tp.OPEN,indicator:tm.DOT,max_decimals:0,colour:{0:tu.ha_red,50:tu.ha_green,100:tu.ha_blue}}},medium:{null:{top_element:tf.NONE,middle_element:t$.VALUE_UNIT,bottom_element:ty.ICON}},large:{null:{top_element:tf.ICON,middle_element:t$.VALUE_UNIT,bottom_element:ty.NONE}}},data_size:{null:{null:{ring_type:tp.OPEN,bottom_element:ty.MIN_MAX}},medium:{null:{top_element:tf.NONE,middle_element:t$.ICON}}},wind_speed:{null:{null:{icon:"mdi:weather-windy",ring_type:tp.OPEN},kn:{min:0,max:40,colour:{10:tu.ha_blue,15:tu.ha_green,20:tu.ha_yellow,25:tu.ha_orange,30:tu.ha_red}},"km/h":{min:0,max:75,colour:{20:tu.ha_blue,30:tu.ha_green,40:tu.ha_yellow,50:tu.ha_orange,60:tu.ha_red}},mph:{min:0,max:45,colour:{12:tu.ha_blue,17:tu.ha_green,23:tu.ha_yellow,29:tu.ha_orange,35:tu.ha_red}}}},precipitation:{null:{null:{icon:"mdi:weather-rainy",ring_type:tp.OPEN,colour:tu.ha_blue,bottom_element:ty.MIN_MAX},mm:{max:10},in:{max:.4}},medium:{null:{top_element:tf.NONE,middle_element:t$.ICON}}},battery:{null:{"%":{colour:{20:tu.ha_red,30:tu.ha_orange,40:tu.ha_yellow,70:tu.ha_green},max_decimals:0}},medium:{"%":{scale:tg.TICKS,ring_type:tp.CLOSED,top_element:tf.ICON,middle_element:t$.RING_VALUE_UNIT,bottom_element:ty.NONE}},large:{"%":{scale:tg.TICKS,ring_type:tp.CLOSED,top_element:tf.ICON,middle_element:t$.RING_VALUE_UNIT,bottom_element:ty.NONE}}},power:{null:{null:{ring_type:tp.OPEN,indicator:tm.DOT},kW:{max:3},W:{max:3e3,bottom_element:ty.NONE}},large:{null:{scale:tg.TICKS_LABELS}}},energy:{null:{null:{ring_type:tp.OPEN},kWh:{max:10},Wh:{max:1e4,bottom_element:ty.NONE}},large:{null:{scale:tg.TICKS_LABELS}}},signal_strength:{null:{null:{ring_type:tp.OPEN,middle_element:t$.RING_VALUE,bottom_element:ty.RING_UNIT,min:-90,max:-40,colour:{"-90":tu.ha_purple,"-80":tu.ha_red,"-70":tu.ha_orange,"-67":tu.ha_yellow,"-60":tu.ha_green},max_decimals:0}},medium:{null:{bottom_element:ty.ICON}},large:{null:{middle_element:t$.RING_VALUE_UNIT,bottom_element:ty.MIN_MAX}}},moisture:{null:{null:{colour:{25:tu.ha_yellow,45:tu.ha_blue,55:tu.ha_blue,75:tu.ha_purple},max_decimals:0}},medium:{null:{ring_type:tp.CLOSED,top_element:tf.ICON,middle_element:t$.VALUE_UNIT}},large:{null:{ring_type:tp.CLOSED,bottom_element:ty.NONE}}}};function tS(t){return!isNaN(parseFloat(t))&&!isNaN(t-0)}function tw(t){return null!==t&&"object"==typeof t&&!Array.isArray(t)}function tC(t,e,i){return t>i?i:t<e?e:t}function tT(t,e=5){if(Math.floor(t=parseFloat(t.toFixed(e)))===t)return 0;let i=t.toString();return -1===i.indexOf(".")?0:i.split(".")[1].length}function tk(t){return t*Math.PI*2/360}function tI(t,e,i){let s=-Math.sin(tk(t));return[s*e+i/2,Math.cos(tk(t))*e+i/2]}function tM(t){return["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round((t%360+360)%360/22.5)%16]}let tU={VALUE:0,ENTITY:1,ATTRIBUTE:2};class tR{#t;#e;#i;#s;#r;#n;constructor(t,e){if(this.#t=t,this.#e=e,tS(this.#t)?this.#i=tU.VALUE:tw(this.#t)&&this.#t.attribute?this.#i=tU.ATTRIBUTE:this.#i=tU.ENTITY,this.#i===tU.VALUE)return;switch(this.#i){case tU.ENTITY:tw(this.#t)?(this.#s=this.#t.entity,this.#r=this.#t.entity):(this.#s=this.#t,this.#r=this.#t);break;case tU.ATTRIBUTE:this.#s=this.#t.attribute,this.#r=this.#t.entity}let i=this.#e.states[this.#r];this.#n={...i},this.#n.attributes={...i.attributes},this.#i===tU.ATTRIBUTE&&(this.#n.state=i.attributes[this.#s]),this.#t.device_class&&(this.#n.attributes.device_class=this.#t.device_class),this.#t.unit_of_measurement&&(this.#n.attributes.unit_of_measurement=this.#t.unit_of_measurement)}get deviceClass(){return this.#n.attributes.device_class}get unitOfMeasurement(){return this.#n.attributes.unit_of_measurement}get elementType(){return this.#i}get stateObj(){return this.#n}get value(){return this.#i===tU.VALUE?this.#t:this.#n.state}get elementName(){return this.#s}get entityName(){return this.#r}}class tL extends to{_noState;_configProcessed=!1;static get properties(){return{_hass:{attribute:!1},_cfg:{state:!0},_ringStateObj:{state:!0},_displayStateObj:{state:!0},_markerValue:{state:!0},_marker2Value:{state:!0},_minValue:{state:!0},_maxValue:{state:!0}}}processConfig(){let t={...tE};this._cfg.ring_size&&2===this._cfg.ring_size&&(t={...t,...tA}),this._cfg.ring_size&&this._cfg.ring_size>2&&(t={...t,...tx});let e=this._ringElement.deviceClass,i=this._ringElement.unitOfMeasurement;if(this._cfg.ring_type&&this._cfg.ring_type.startsWith(tp.COMPASS))t={...t,...tN};else{let s=tO[e];if(s){let e=this._cfg.ring_size?1===this._cfg.ring_size?"small":2===this._cfg.ring_size?"medium":"large":"small",r=s.null||{},n=r.null||{},a=r[i]||{},o=s[e]||{},l=o.null||{},h=o[i]||{};t={...t,...n,...a,...l,...h}}}tv.forEach(t=>{t.US in this._cfg&&(this._cfg[t.AU]=this._cfg[t.US])}),this._cfg={...t,...this._cfg},this._cfg.ring_size=tC(this._cfg.ring_size||1,1,6),this._name=this._cfg.name||this._displayStateObj.attributes.friendly_name,this._cfg.bottom_name=this._cfg.bottom_name||this._name,this._cfg.ring_only=this._cfg.ring_only||this._cfg.ring_size>=3,this._configProcessed=!0}setConfig(t){if(!t)throw Error("Invalid configuration");if(!t.entity)throw Error("You must define an entity");this._cfg={...t},this._hass&&(this.hass=this._hass)}set hass(t){this._hass=t,this._ringElement=new tR(this._cfg.ring_entity||this._cfg.entity,t),this._ringStateObj=this._ringElement.stateObj;let e=this._ringElement.value;this._noState=["unavailable","unknown"].includes(e),this._displayElement=new tR(this._cfg.entity,t),this._displayStateObj=this._displayElement.stateObj,this._ringStateObj&&!this._configProcessed&&this.processConfig(),null!=this._cfg.marker&&(this._markerElement=new tR(this._cfg.marker,this._hass),this._markerValue=parseFloat(this._markerElement.value)),null!=this._cfg.marker2&&(this._marker2Element=new tR(this._cfg.marker2,this._hass),this._marker2Value=parseFloat(this._marker2Element.value)),null!=this._cfg.min&&(this._minElement=new tR(this._cfg.min,this._hass),this._minValue=parseFloat(this._minElement.value)),null!=this._cfg.max&&(this._maxElement=new tR(this._cfg.max,this._hass),this._maxValue=parseFloat(this._maxElement.value)),this._minValue===this._maxValue&&(this._maxValue+=1e-11)}render(){let t=this._ringStateObj?parseFloat(this._ringElement.value):"unavailable",e=this._cfg.hide_state?B:G`
          <state-display
            .stateObj=${this._displayStateObj}
            .hass=${this._hass}
            .name=${this._name}
          ></state-display>
        `,i=[36,96,154,212,270,330][this._cfg.ring_size-1],s={vertical:!1,centred:this._cfg.ring_only||this._cfg.ring_size>=3,large:this._cfg.ring_size>1,small:1===this._cfg.ring_size},r={"transparent-tile":this.transparent_tile},n=this._cfg.icon;return G`
      <ha-card class="active type-tile ${t_(r)}">
        <div
          class="background"
          @click=${t=>this._handleAction(t,this._cfg.tap_action)}
          role=${(this._hasCardAction?"button":void 0)??B}
          tabindex=${(this._hasCardAction?"0":void 0)??B}
          aria-labelledby="info"
        >
          <ha-ripple .disabled=${!this._hasCardAction}></ha-ripple>
        </div>
        <div class="container">
          <div class="content ${t_(s)} ">
            <rt-ring
              role=${(this._hasIconAction?"button":void 0)??B}
              tabindex=${(this._hasIconAction?"0":void 0)??B}
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
                .state=${this._ringElement}
                .display_state=${this._displayElement}
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
                .min=${this._minValue}
                .max=${this._maxValue}
                .min_sig_figs=${this._cfg.min_sig_figs}
                .max_decimals=${this._cfg.max_decimals}
                .hass=${this._hass}
              ></rt-ring-svg>
              ${this._noState?G` <ha-tile-badge
                    style="--tile-badge-background-color: var(--orange-color)"
                  >
                    <ha-svg-icon .path=${"M10 3H14V14H10V3M10 21V17H14V21H10Z"} />
                  </ha-tile-badge>`:B}
            </rt-ring>
            ${this._cfg.ring_only||this._cfg.ring_size>=3?B:G` <rt-info
                  id="info"
                  .primary=${this._name}
                  .secondary=${e}
                  .large_ring=${this._cfg.ring_size>1}
                  large_secondary=${this._cfg.large_secondary}
                ></rt-info>`}
          </div>
        </div>
      </ha-card>
    `}static getStubConfig(t,e,i){let s=e.filter(t=>t.startsWith("sensor.")),r=s.filter(e=>"temperature"===t.states[e].attributes.device_class);return{entity:r.length>0?r[Math.floor(Math.random()*r.length)]:s[Math.floor(Math.random()*s.length)]}}getCardSize(){return 1}getGridOptions(){let t=6;this._cfg.ring_only&&(t=this._cfg.transparent_tile?1.6:2*this._cfg.ring_size);let e=this._cfg.ring_size;return{columns:t,rows:e,min_columns:t,min_rows:e}}static styles=n`
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
  `;_handleAction(t,e){if(!e||!e.action)return;let i="icon"===e.tapped&&this._cfg.ring_entity?this._ringElement.entityName:this._displayElement.entityName;switch(e.action){case"more-info":i&&this.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:i}}));break;case"navigate":e.navigation_path&&(window.history.pushState(null,"",e.navigation_path),this.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0})));break;case"call-service":if(e.service){let[t,i]=e.service.split(".",2);this._hass.callService(t,i,e.service_data||{})}break;case"url":e.url&&window.open(e.url,"_blank");break;default:console.warn(`Unhandled action type: ${e.action}`)}}_hasCardAction(){return this._cfg.tap_action&&"none"!==this._cfg.tap_action.action}_hasIconAction(){return this._cfg.icon_tap_action&&"none"!==this._cfg.icon_tap_action.action}}function tP(t,e,i,s=!1){if(!document.getElementById(t)){var r=document.createElement("link");r.id=t,r.rel=i,r.href=e,s&&(r.crossOrigin="anonymous"),document.head.appendChild(r)}}class tD extends to{static get properties(){return{primary:{},secondary:{},large_ring:{},large_secondary:{}}}render(){return this.large_ring?G`
        <div class="info large">
          <span class="primary small">${this.primary}</span>
          ${this.secondary?G`<span class="secondary ${this.large_secondary?"large":"small"}">${this.secondary}</span>`:B}
        </div>
      `:G`
        <div class="info small">
          <span class="primary small nowrap">${this.primary}</span>
          ${this.secondary?G`<span class="secondary small nowrap">${this.secondary}</span>`:B}
        </div>
      `}static styles=n`
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
  `}class tz extends to{static get properties(){return{interactive:{},imageStyle:{},imageUrl:{},ring_size:{}}}render(){if(this.imageUrl){let t=this.imageStyle||DEFAULT_TILE_ICON_BORDER_STYLE;return G`
        <div class="container ${classMap({[t]:this.imageUrl})}">
          <img alt="" src=${this.imageUrl} />
        </div>
        <slot></slot>
      `}return G`
      <div
        class="container size_${this.ring_size} ${this.interactive?"background":""}"
      >
        <slot name="icon"></slot>
      </div>
      <slot></slot>
    `}static styles=n`
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
  `}function tV(t,e,i,s){let r=i-s,n=+(Math.abs(e-t)>180),a=tI(t,i,100).join(" "),o=tI(e,i,100).join(" "),l=tI(e,r,100).join(" "),h=tI(t,r,100).join(" "),c=[];return c.push(`M ${a}`),c.push(`A ${i} ${i} 0 ${n} 1 ${o}`),c.push(`A ${s/2} ${s/2} 0 0 1 ${l}`),c.push(`A ${r} ${r} 0 ${n} 0 ${h}`),c.push(`A ${s/2} ${s/2} 0 0 1 ${a}`),c.join(" ")}function tj(t,e){let i=Math.floor(Math.log10(t)),s=t/Math.pow(10,i);return(e?s<1.5?1:s<3?2:s<7?5:10:s<=1?1:s<=2?2:s<=5?5:10)*Math.pow(10,i)}let{I:tG}={M:x,P:N,A:O,C:1,L:q,R:J,D:I,V:Z,I:Q,H:tt,N:ti,U:ts,B:te,F:tr},tH=(t,e)=>{let i=t._$AN;if(void 0===i)return!1;for(let t of i)t._$AO?.(e,!1),tH(t,e);return!0},tW=t=>{let e,i;do{if(void 0===(e=t._$AM))break;(i=e._$AN).delete(t),t=e}while(0===i?.size)},tB=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),tX(e)}};function tF(t){void 0!==this._$AN?(tW(this),this._$AM=t,tB(this)):this._$AM=t}function tK(t,e=!1,i=0){let s=this._$AH,r=this._$AN;if(void 0!==r&&0!==r.size)if(e)if(Array.isArray(s))for(let t=i;t<s.length;t++)tH(s[t],!1),tW(s[t]);else null!=s&&(tH(s,!1),tW(s));else tH(this,t)}let tX=t=>{t.type==th.CHILD&&(t._$AP??=tK,t._$AQ??=tF)};class tq extends td{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),tB(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(tH(this,t),tW(this))}setValue(t){if(void 0===this._$Ct.strings)this._$Ct._$AI(t,this);else{let e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}let tY=new WeakMap,tZ=tc(class extends tq{render(t){return B}update(t,[e]){let i=e!==this.G;return i&&void 0!==this.G&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=e,this.ht=t.options?.host,this.rt(this.ct=t.element)),B}rt(t){if(this.isConnected||(t=void 0),"function"==typeof this.G){let e=this.ht??globalThis,i=tY.get(e);void 0===i&&(i=new WeakMap,tY.set(e,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?tY.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});class tJ{#a=[];#o;#l;#h;#c;#d=!1;constructor(t,e={}){if(t.constructor==Object){for(let[i,s]of(this.#h=e.gradStart||0,this.#c=e.gradEnd||100,this.#o=e.minValue||0,this.#l=e.maxValue||100,Object.entries(t))){let t=i.endsWith("%")?this.#o+parseFloat(i)/100*(this.#l-this.#o):parseFloat(i),e=tu[s]||s;this.#a.push({value:this.#_(t),colour:e})}this.#a.sort((t,e)=>t.value-e.value),this.#a[0]>0&&this.#a.unshift({value:0,colour:this.#a[0].colour}),100>this.#a.at(-1)&&this.#a.push({value:100,colour:this.#a.at(-1).colour})}else this.#d=!0,this.#a=tu[t]||t}#_(t){return this.#h+(parseFloat(t)-this.#o)/(this.#l-this.#o)*(this.#c-this.#h)}getConicGradientCss(t=1){if(this.#d)return`background: color-mix(in srgb, ${this.#a} var(--rt-ring-background-opacity, ${100*t}%), transparent);`;let e=this.#a.map(e=>`color-mix(in srgb, ${e.colour} var(--rt-ring-background-opacity, ${100*t}%), transparent) ${e.value}%`);return`background-image: conic-gradient(
        from 180deg,
        ${e.join(", ")}
      );
    `}getSolidColourAtGradPct(t){let e=this.#o+(t-this.#h)/(this.#c-this.#h)*(this.#l-this.#o);return this.getSolidColour(e)}getSolidColour(t){if(tS(t)||(t=0),this.#d)return this.#a;if(this.#_(t)<this.#a[0].value)return this.#a[0].colour;if(this.#_(t)>this.#a.at(-1).value)return this.#a.at(-1).colour;let e=this.#_(t),i=this.#a.find(t=>t.value===e);if(i)return i.colour;let s=this.#a.findLast(t=>t.value<e),r=this.#a.find(t=>t.value>e);if(s.colour===r.colour)return s.colour;let n=100*(e-s.value)/(r.value-s.value);return`color-mix(in srgb,
        ${s.colour} ${100-n}%,
        ${r.colour} ${n}%
      )
    `}}class tQ extends to{constructor(...t){super(...t),tQ.prototype.renderText=function(t,e,i){function s(e="",i=1,r=6){return 1-.16*tC(t.length-.7*!!t.includes(".")-.5*!!t.includes("°")+e.length*i-2,0,r-2)}function r(i,s,r,n,a){return H`
        <text class=${a}
          x=${50+r} y="${50+n+i/3.5}" 
          text-anchor="middle" alignment-baseline="alphabetic" 
          font-size=${i}
          >${t}<tspan
            alignment-baseline="alphabetic"
            font-size=${s}
          >${e||B}</tspan>
        </text>
      `}function n(t,e,i,s,r,a="middle"){return H`
        <text class=${r}
          x=${50+i} y="${50+s+e/3.5}" 
          text-anchor=${a} alignment-baseline="alphabetic" 
          font-size=${e}
        >${t}</text>
      `}tS(t)&&![tb.MIN,tb.MAX].includes(i)&&(t=this.getRoundedValue(t)),e&&(1===this.ring_size?e.startsWith("°")?(t=`${t}\xb0`,e=""):e=e.slice(0,1):"%"!==e&&(e=` ${e}`));let a=[1,.8,.75,.72,.71,.7][this.ring_size-1],o=[20,15,11,10,9,7.5][this.ring_size-1];switch(i){case tb.TOP:return r(12,12,0,this.scale===tg.TICKS_LABELS?-22:-25,"top marker");case tb.MIDDLE:if(1===this.ring_size||["%",""].includes(e)){let t=42*s(e,.8)*a;return r(t,.8*t,0,0,`middle ${1===this.ring_size?"tight":""}`)}{let i=38*s()*a,r=22-2*(2===this.ring_size);return H`
            ${n(t,i,0,0,"middle")}
            ${n(e,15*a,0,r,"middle unit")}
          `}case tb.BELOW_DIAL:{let t=20*s(e,.8,4)*a;return r(t,.8*t,0,18,"lower-middle")}case tb.BOTTOM:{let t=41,e="bottom";return this.ring_type===tp.CLOSED&&(t-=15,e+=" closed"),r(o,o,0,t,e)}case tb.MIN:{let e=-32+[0,6,6,4,3.8,3.2][this.ring_size-1],i=41-10*(this.ring_type===tp.CLOSED);return n(t,o,e,i,"bottom","start")}case tb.MAX:{let e=32-[0,6,6,4,3.8,3.2][this.ring_size-1],i=41-10*(this.ring_type===tp.CLOSED);return n(t,o,e,i,"bottom","end")}}},tQ.prototype.renderScale=function(t=1){let e=this._ringWidth,i=1===this.ring_size?3:5,s=[80,80,110,110,110,110][this.ring_size-1],r=this.min,n=this.max,a=n-r,o=tj(a,!1),l=tj(o/(i-1),!0),[h,c]=function(t){let e=Math.pow(10,Math.floor(Math.log10(t)));return 5==t/e?[t/5,t/10]:[t/2,t/10]}(l),d=Math.round(a/c)<s,_=[];for(let t=Math.ceil(r/l)*l;t<=n;t+=l)_.push(t);let u=[];for(let t=Math.ceil(r/h)*h;t<=n;t+=h)_.includes(t)||u.push(t);let p=[];if(d)for(let t=Math.ceil(r/c)*c;t<=n;t+=c)_.includes(t)||u.includes(t)||p.push(t);let m=t=>this._startDegrees+(this._endDegrees-this._startDegrees)*(t-r)/a,g=[1,1,1,.9,.8,.7][this.ring_size-1],f=(t,i)=>{let s=(m(t)+180*(this.ring_type===tp.CLOSED))%360,r=tI(s,this._outerRadius,100),n=tI(s,this._outerRadius-i*e,100);return`M ${r[0]} ${r[1]} L ${n[0]} ${n[1]}`},$=t=>{if(this.bottom_element===ty.MIN_MAX&&(t===this.min||t===this.max))return B;let i=this._outerRadius*[.45,.65,.7,.73,.75,.77][this.ring_size-1];this._hasMarker&&this.indicator===tm.DOT&&(i*=.96),Math.log10(this.max)>3&&(i*=.93);let s=tI((m(t)+180*(this.ring_type===tp.CLOSED))%360,i,100),r=1===this.ring_size?2.5*e:1.15*e;return H`
          <text
            x=${s[0]} y=${s[1]}
            text-anchor="middle"
            alignment-baseline="central"
            font-size=${r}
          >${t}</text>
        `},y=H`
      <path
        class="grand"
        d=${_.map(t=>f(t,1.35)).join(" ")}
        stroke-width=${1.8*g}
        stroke-opacity=${t}
      />`,b=H`
      <path
        class="major"
        d=${u.map(t=>f(t,1.2)).join(" ")}
        stroke-width=${1.2*g}
        stroke-opacity=${.7*t}
      />`,v=H`
      <path
        class="minor"
        d=${p.map(t=>f(t,1)).join(" ")}
        stroke-width=${.6*g}
        stroke-opacity=${.3*t}
      />`,E=B;if(this.scale===tg.TICKS_LABELS){let t=[..._];this.ring_size>3&&l/h!=5&&(t=[...t,...u]);let e=t.reduce((t,e)=>Math.max(t,tT(e,this.max_decimals)),0);E=(t=t.map(t=>t.toFixed(e))).map($)}return H`
        <g class="scale">
          <g class="ticks">
            ${y}
            ${b}
            ${v}
          </g>
          <g class="labels">
            ${E} 
          </g> 
        </g>
      `},function(t){t.prototype.renderGradRing=function(t,e,i){let s=this._ringWidth,r=tV(t,e,this._outerRadius,s),n=this._grad.getConicGradientCss(i),a=i.toString().replace(".","");return H`
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
        transform="rotate(${180*(this.ring_type===tp.CLOSED)} ${50} ${50})"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style="width: ${100}px; height: ${100}px; ${n};";
        />
      </foreignObject>
    `},t.prototype.renderSolidRing=function(t,e,i){let s=this._ringWidth,r=tV(t,e,this._outerRadius,s);return H`<path 
        class="ring-solid"
        d=${r}
        fill=${this._grad.getSolidColour(i)}
        stroke-width="0"
        fill-opacity="1"
        transform="rotate(${180*(this.ring_type===tp.CLOSED)} ${50} ${50})"
      />`}}(tQ),tQ.prototype.renderPointer=function(t){let e="color-mix(in srgb, orange 80%, var(--primary-text-color))",i=tI(this.ring_type===tp.CLOSED?t:(t+180)%360,7.5,100),s=tI(this.ring_type!==tp.CLOSED?t:(t+180)%360,this._outerRadius-this._ringWidth/2,100);return H`
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
      `},tQ.prototype.renderMarker=function(t,e){let i,s,r,n=this._ringWidth,a="marker";if(this.ring_type.startsWith(tp.COMPASS))i=parseFloat(t),s=2.3*n,r=0,i=(i+180)%360,a="marker compass";else{let e=tC(t,this.min,this.max);i=this._startDegrees+(this._endDegrees-this._startDegrees)*(e-this.min)/(this.max-this.min),s=(this.indicator===tm.DOT?1.2:1.5)*n,r=this.indicator===tm.DOT?0:this.ring_size<=2?n/5:n/8,this.ring_type===tp.CLOSED&&(i=(i+180)%360)}if(this.indicator!==tm.POINTER){let t=[];this.indicator===tm.DOT?t.push(`M 50 ${100-n+r}`):t.push(`M 50 ${100-n/3}`),t.push(`l ${s/2} -${s*Math.sin(tk(60))}`),this.ring_type.startsWith(tp.COMPASS)?(t.push(`l -${s/2} ${s/6}`),t.push(`l -${s/2} -${s/6}`)):t.push(`h -${s}`),t.push("Z");let o=t.join(" "),l=180*!!this.ring_type.startsWith(tp.COMPASS);return H`
        <g class=${a} transform="rotate(${i} ${50} ${50})">
          <path
            d=${o}
            fill=${e}
            stroke="var(--card-background-color, white)"
            stroke-linejoin="bevel"
            stroke-width=${r}
            transform="rotate(${l} ${50} ${100-s/2})"
          />
        </g>`}{let t=[50,50],s=tI(i,50-.75*n,100),r=[2,1.6,1.4,1.3,1.2,1.1][this.ring_size-1];return H`
          <g class=${a}>
            <line
              x1=${t[0]} y1=${t[1]}
              x2=${s[0]} y2=${s[1]}
              stroke=${e}
              stroke-linecap="round"
              stroke-width=${r}
            />
          </g>
        `}},tQ.prototype.renderIcon=function(t,e,i){let s,r,n;switch(t){case tb.TOP:s=[0,.6,1,1.2,1.8,2.2][this.ring_size-1],r=[0,-43,-42,-45,-40,-40][this.ring_size-1],this.indicator===tm.POINTER&&(r*=.75),this.scale===tg.TICKS_LABELS&&(s*=.95),n="icon top";break;case tb.MIDDLE:s=1===this.ring_size?this.ring_type===tp.NONE?1:(this.ring_type===tp.CLOSED?.9:.85)*(this._hasMarker&&this.indicator===tm.DOT?.9:1):[2.1,3.1,4,5,6][this.ring_size-2],r=this.bottom_element===ty.MIN_MAX?-2:0,n="icon middle";break;case tb.BOTTOM:s=[.5,.9,1.5,2,3,3.5][this.ring_size-1],r=[25,40,38,40,35,35][this.ring_size-1],this.ring_type===tp.CLOSED&&(r=[5,25,26,27,23,24][this.ring_size-1]),n="icon bottom"}let a=24*s,o=r*s,l=i?`--rt-icon-state-color: ${this._grad.getSolidColour(i)};`:"";return G`
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
          ${tZ(t=>{if(t){let e=0,i=setInterval(()=>{((()=>{let e=t.shadowRoot?.querySelector("ha-icon"),i=e?.shadowRoot?.querySelector("ha-svg-icon");return!!i&&(i.style.width=`${a}px`,i.style.height=`${a}px`,!0)})()||e>=40)&&clearInterval(i),e++},50)}})}
        ></ha-state-icon>
      </div>
    `},tQ.prototype.renderDot=function(t,e){let i=this._ringWidth,s=tI(t,this._outerRadius-i/2,100),r=i*[.55,.4,.35,.35,.35,.35][this.ring_size-1],n=i/2+.7*r,a=tV(t-10,t+10,this._outerRadius+.05*i,1.1*i);return H`
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
                transform="rotate(${180*(this.ring_type===tp.CLOSED)} ${50} ${50})"
              />
              <circle 
                class="dot"
                cx=${s[0]} cy=${s[1]} 
                r=${n-r/2}
                fill=${this._grad.getSolidColour(e)}
                transform="rotate(${180*(this.ring_type===tp.CLOSED)} ${50} ${50})"
              />
            </g>`},tQ.prototype.renderCompass=function(){let t=.7*this._ringWidth,e=[],i=[],s=[],r=[];for(let n=0;n<360;n+=5.625){let a=(n+180)%360;if(n%90==0)if(this.ring_type===tp.COMPASS_NESW||this.ring_type===tp.COMPASS_N&&0===a){let e=tI(n,this._outerRadius-1.2*t/2,100);i.push(H`<text
                  class="compass cardinal"
                  x=${e[0]}
                  y=${e[1]}
                  text-anchor="middle"
                  alignment-baseline="central"
                  font-size=${2*t}
                  fill="var(--primary-text-color, #212121)"
                >${tM(a)}</text>`)}else e.push(`M ${tI(n,this._outerRadius,100)}`),e.push(`L ${tI(n,this._outerRadius-1.7*t,100)}`);else n%22.5==0?(s.push(`M ${tI(n,this._outerRadius,100)}`),s.push(`L ${tI(n,this._outerRadius-1.2*t,100)}`)):(r.push(`M ${tI(n,this._outerRadius,100)}`),r.push(`L ${tI(n,this._outerRadius-t,100)}`))}let n=i?H`${i}`:nothing,a=e?H`
            <path
              class="compass cardinals"
              d=${e.join(" ")}
              stroke-width=2
              fill="none"
              stroke="var(--primary-text-color, #212121)"
              stroke-linecap="round"
            />`:nothing;return H`
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
        />`},tQ.prototype.getRoundedValue=function(t,e=!1){let i=Math.max(Math.floor(this.min_sig_figs-Math.log10(Math.abs(t))),0);return i>(this.max_decimals??99)&&(i=this.max_decimals),t=parseFloat(t).toFixed(i),e&&(t=(t=parseFloat(t)).toFixed(tT(t))),0===parseFloat(t)&&(t="0"),t}}static get properties(){return{ring_type:{},indicator:{},scale:{},ring_size:{},colour:{attribute:!1},state:{attribute:!1},display_state:{attribute:!1},marker_value:{attribute:!1},marker_colour:{attribute:!1},marker2_value:{attribute:!1},marker2_colour:{attribute:!1},min:{attribute:!1},max:{attribute:!1},icon:{attribute:!1},colourise_icon:{attribute:!1},name:{attribute:!1},bottom_element:{attribute:!1},middle_element:{attribute:!1},top_element:{attribute:!1},bottom_name:{attribute:!1},min_sig_figs:{attribute:!1},max_decimals:{attribute:!1},hass:{attribute:!1}}}configureRing(){this._outerRadius=50,this._hasMarker=tS(this.marker_value),this.bottom_element===ty.NAME&&(this.bottom_name=this.bottom_name||this.name),this._startDegrees=60,this._endDegrees=300,this.ring_type.startsWith(tp.COMPASS)||this.ring_type===tp.CLOSED?(this._startDegrees=0,this._endDegrees=359.999):([ty.ICON,ty.NONE,ty.UNIT].includes(this.bottom_element)||this.bottom_element===ty.NAME&&this.bottom_name.length<=[3,6,8,10,12,14][this.ring_size-1]||this.bottom_element===ty.MIN_MAX&&this.ring_size>1||this.bottom_element.includes(ty.VALUE)&&this.ring_size>1)&&(this._startDegrees=45,this._endDegrees=315),this._ringUnit=this.state?this.state.unitOfMeasurement:B,this._displayUnit=this.display_state?this.display_state.unitOfMeasurement:B;let t={minValue:this.min,maxValue:this.max,gradStart:100*this.startDegrees/360,gradEnd:100*this.endDegrees/360};this._grad=new tJ(this.colour,t),this.marker_colour=tu[this.marker_colour]||this.marker_colour,this.marker2_colour=tu[this.marker2_colour]||this.marker2_colour,this._ringWidth=[10,8,7,6,5.5,5][this.ring_size-1]*(this.scale===tg.NONE?1:.85)}getTopElementSvg(){switch(this.top_element){case tf.MARKER:return this.renderText(this.marker_value,"",tb.TOP);case tf.MARKER_UNIT:return this.renderText(this.marker_value,this._displayUnit,tb.TOP);case tf.UNIT:return this.renderText(this._displayUnit,"",tb.TOP);case tf.MARKER_DIR:return this.renderText(tM(this.marker_value),"",tb.TOP);default:return B}}getMiddleElementSvg(){switch(this.middle_element){case t$.VALUE:case t$.VALUE_UNIT:case t$.RING_VALUE:case t$.RING_VALUE_UNIT:if(this._noState)return B;let t=[t$.RING_VALUE,t$.RING_VALUE_UNIT].includes(this.middle_element)?this.state.value:this.display_state.value,e="";this.middle_element===t$.VALUE_UNIT&&(e=this._displayUnit),this.middle_element===t$.RING_VALUE_UNIT&&(e=this._ringUnit);let i=this.indicator===tm.POINTER?tb.BELOW_DIAL:tb.MIDDLE;return this.renderText(t,e,i);default:return B}}getBottomElementSvg(){if(this.ring_type.startsWith(tp.COMPASS))return B;switch(this.bottom_element){case ty.NAME:return this.renderText(this.bottom_name,"",tb.BOTTOM);case ty.UNIT:return this.renderText(this._displayUnit,"",tb.BOTTOM);case ty.RING_UNIT:return this.renderText(this._ringUnit,"",tb.BOTTOM);case ty.MIN_MAX:if(this.ring_type===tp.CLOSED)return B;let t=this.getRoundedValue(this.min,!0),e=this.max-this.min<.01?"–":this.getRoundedValue(this.max,!0);return H`
          ${this.renderText(t,"",tb.MIN)}
          ${this.renderText(e,"",tb.MAX)}
        `;case ty.VALUE:case ty.VALUE_UNIT:case ty.RING_VALUE:case ty.RING_VALUE_UNIT:if(this._noState)return B;let i=[ty.RING_VALUE,ty.RING_VALUE_UNIT].includes(this.bottom_element)?this.value:this.display_state.value,s="";return this.bottom_element===ty.VALUE_UNIT&&(s=this._displayUnit),this.bottom_element===ty.RING_VALUE_UNIT&&(s=this._ringUnit),this.renderText(i,s,tb.BOTTOM);default:return B}}render(){let t,e;this.configureRing(),this._noState=["unknown","unavailable"].includes(this.state.value);let i=tC(this.state.value,this.min,this.max),s=this._startDegrees+(this._endDegrees-this._startDegrees)*(i-this.min)/(this.max-this.min);this._noState&&(i=this.min,s=this._startDegrees,this._grad=new tJ("grey"));let r=.15;this.indicator===tm.DOT?r=.7:this.indicator===tm.POINTER?r=.07:this.scale===tm.NONE&&(r=.15),t=this.ring_type===tp.NONE?B:this.ring_type.startsWith(tp.COMPASS)?this.renderCompass():this.renderGradRing(this._startDegrees,this._endDegrees,r);let n=B,a=B;if(this.ring_type!==tp.NONE&&!this._noState)switch(this.indicator){case tm.ARC:n=this.renderSolidRing(this._startDegrees,s,this.state.value);break;case tm.DOT:n=this.renderDot(s,this.state.value);break;case tm.POINTER:a=this.renderPointer(s);case tm.NONE:}let o=B;if(this.scale!==tg.NONE){let t=this.indicator===tm.POINTER?.7:.2;o=this.renderScale(t)}let l=tS(this.marker_value)&&!this._noState?this.renderMarker(this.marker_value,this.marker_colour):B,h=tS(this.marker2_value)&&!this._noState?this.renderMarker(this.marker2_value,this.marker2_colour):B;this.colourise_icon&&(e=this.state.value);let c=this.middle_element===t$.ICON?this.renderIcon(tb.MIDDLE,this.display_state.stateObj,e):this.top_element===tf.ICON?this.renderIcon(tb.TOP,this.display_state.stateObj,e):this.bottom_element===ty.ICON?this.renderIcon(tb.BOTTOM,this.display_state.stateObj,e):B,d=this.getTopElementSvg(),_=this.getMiddleElementSvg(),u=this.getBottomElementSvg();return G`
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
    `}static styles=n`
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
  `}var t0={};t0=JSON.parse('{"name":"ring-tile-card","version":"1.0.2","description":"A Home Assistant card to visualise your sensor data, based on tile card","author":"neponn","license":"MIT","repository":{"type":"git","url":"https://github.com/neponn/ring-tile-card.git"},"source":"src/ring-tile-card.js","scripts":{"clean":"rm -rf .parcel-cache dist","start":"parcel","build":"parcel build --no-source-maps","clean-build":"npm run clean && npm run build"},"type":"module","devDependencies":{"parcel":"^2.15.4"},"dependencies":{"lit":"^3.3.1"},"bugs":{"url":"https://github.com/neponn/ring-tile-card/issues"},"homepage":"https://github.com/neponn/ring-tile-card#readme"}'),console.info(`%c ring-tile-card %c v${t0.version} `,"color: yellow; font-weight: bold; background: darkblue","color: white; font-weight: bold; background: dimgray"),tP("gf1","https://fonts.googleapis.com","preconnect"),tP("gf2","https://fonts.gstatic.com","preconnect"),tP("gf3","https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap","stylesheet",!0),customElements.define("ring-tile",tL),customElements.define("rt-info",tD),customElements.define("rt-ring",tz),customElements.define("rt-ring-svg",tQ),window.customCards=window.customCards||[],window.customCards.push({type:"ring-tile",name:"Ring Tile Card",preview:!0,description:"Add a ring to your sensor tile cards to visualise sensor state."})})();