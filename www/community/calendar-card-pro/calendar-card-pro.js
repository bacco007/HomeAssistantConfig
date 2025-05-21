/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),a=new WeakMap;class i{constructor(e,t,a){if(this._$cssResult$=!0,a!==n)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet;const n=this._strings;if(t&&void 0===e){const t=void 0!==n&&1===n.length;t&&(e=a.get(n)),void 0===e&&((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),t&&a.set(n,e))}return e}toString(){return this.cssText}}const r=(e,...t)=>{const a=1===e.length?e[0]:t.reduce(((t,n,a)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[a+1]),e[0]);return new i(a,e,n)},o=e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return new i("string"==typeof(a=t)?a:String(a),void 0,n);var a},s=t?e=>e:e=>e instanceof CSSStyleSheet?o(e):e
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:_,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,m=globalThis;let p;const g=m.trustedTypes,f=g?g.emptyScript:"",y=m.reactiveElementPolyfillSupportDevMode;{const e=m.litIssuedWarnings??=new Set;p=(t,n)=>{n+=` See https://lit.dev/msg/${t} for more information.`,e.has(n)||(console.warn(n),e.add(n))},p("dev-mode","Lit is in dev mode. Not recommended for production!"),m.ShadyDOM?.inUse&&void 0===y&&p("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")}const v=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},b=(e,t)=>!l(e,t),M={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;class T extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=M){if(t.state&&(t.attribute=!1),this.__prepare(),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol.for(`${String(e)} (@property() cache)`),a=this.getPropertyDescriptor(e,n,t);void 0!==a&&d(this.prototype,e,a)}}static getPropertyDescriptor(e,t,n){const{get:a,set:i}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};if(null==a){if("value"in(c(this.prototype,e)??{}))throw new Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);p("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get(){return a?.call(this)},set(t){const r=a?.call(this);i.call(this,t),this.requestUpdate(e,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??M}static __prepare(){if(this.hasOwnProperty(v("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e._initializers&&(this._initializers=[...e._initializers]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[..._(e),...h(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this.__attributeToPropertyMap=new Map;for(const[e,t]of this.elementProperties){const n=this.__attributeNameForProperty(e,t);void 0!==n&&this.__attributeToPropertyMap.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles),this.hasOwnProperty("createProperty")&&p("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators"),this.hasOwnProperty("getPropertyDescriptor")&&p("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static __attributeNameForProperty(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e=>this.enableUpdating=e)),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e=>e(this)))}addController(e){(this.__controllers??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this.__instanceProperties=e)}createRenderRoot(){const n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((n,a)=>{if(t)n.adoptedStyleSheets=a.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const t of a){const a=document.createElement("style"),i=e.litNonce;void 0!==i&&a.setAttribute("nonce",i),a.textContent=t.cssText,n.appendChild(a)}})(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,n){this._$attributeToProperty(e,n)}__propertyToAttribute(e,t){const n=this.constructor.elementProperties.get(e),a=this.constructor.__attributeNameForProperty(e,n);if(void 0!==a&&!0===n.reflect){const i=(void 0!==n.converter?.toAttribute?n.converter:w).toAttribute(t,n.type);this.constructor.enabledWarnings.includes("migration")&&void 0===i&&p("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`),this.__reflectingProperty=e,null==i?this.removeAttribute(a):this.setAttribute(a,i),this.__reflectingProperty=null}}_$attributeToProperty(e,t){const n=this.constructor,a=n.__attributeToPropertyMap.get(e);if(void 0!==a&&this.__reflectingProperty!==a){const e=n.getPropertyOptions(a),i="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this.__reflectingProperty=a,this[a]=i.fromAttribute(t,e.type),this.__reflectingProperty=null}}requestUpdate(e,t,n){if(void 0!==e){e instanceof Event&&p("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()"),n??=this.constructor.getPropertyOptions(e);if(!(n.hasChanged??b)(this[e],t))return;this._$changeProperty(e,t,n)}!1===this.isUpdatePending&&(this.__updatePromise=this.__enqueueUpdate())}_$changeProperty(e,t,n){this._$changedProperties.has(e)||this._$changedProperties.set(e,t),!0===n.reflect&&this.__reflectingProperty!==e&&(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){const e=this.performUpdate();return this.constructor.enabledWarnings.includes("async-perform-update")&&"function"==typeof e?.then&&p("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`),e}performUpdate(){if(!this.isUpdatePending)return;var e;if(e={kind:"update"},m.emitLitDebugLogEvents&&m.dispatchEvent(new CustomEvent("lit-debug",{detail:e})),!this.hasUpdated){this.renderRoot??=this.createRenderRoot();{const e=[...this.constructor.elementProperties.keys()].filter((e=>this.hasOwnProperty(e)&&e in u(this)));if(e.length)throw new Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${e.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(const[e,t]of this.__instanceProperties)this[e]=t;this.__instanceProperties=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e)!0!==n.wrapped||this._$changedProperties.has(t)||void 0===this[t]||this._$changeProperty(t,this[t],n)}let t=!1;const n=this._$changedProperties;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this.__controllers?.forEach((e=>e.hostUpdate?.())),this.update(n)):this.__markUpdated()}catch(e){throw t=!1,this.__markUpdated(),e}t&&this._$didUpdate(n)}willUpdate(e){}_$didUpdate(e){this.__controllers?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e),this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update")&&p("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((e=>this.__propertyToAttribute(e,this[e]))),this.__markUpdated()}updated(e){}firstUpdated(e){}}T.elementStyles=[],T.shadowRootOptions={mode:"open"},T[v("elementProperties")]=new Map,T[v("finalized")]=new Map,y?.({ReactiveElement:T});{T.enabledWarnings=["change-in-update","async-perform-update"];const e=function(e){e.hasOwnProperty(v("enabledWarnings"))||(e.enabledWarnings=e.enabledWarnings.slice())};T.enableWarning=function(t){e(this),this.enabledWarnings.includes(t)||this.enabledWarnings.push(t)},T.disableWarning=function(t){e(this);const n=this.enabledWarnings.indexOf(t);n>=0&&this.enabledWarnings.splice(n,1)}}(m.reactiveElementVersions??=[]).push("2.0.4"),m.reactiveElementVersions.length>1&&p("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const k=globalThis,$=e=>{k.emitLitDebugLogEvents&&k.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))};let D,x=0;k.litIssuedWarnings??=new Set,D=(e,t)=>{t+=e?` See https://lit.dev/msg/${e} for more information.`:"",k.litIssuedWarnings.has(t)||(console.warn(t),k.litIssuedWarnings.add(t))},D("dev-mode","Lit is in dev mode. Not recommended for production!");const S=k.ShadyDOM?.inUse&&!0===k.ShadyDOM?.noPatch?k.ShadyDOM.wrap:e=>e,Y=k.trustedTypes,L=Y?Y.createPolicy("lit-html",{createHTML:e=>e}):void 0,C=e=>e,j=(e,t,n)=>C,H=e=>{if(ie!==j)throw new Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");ie=e},z=()=>{ie=j},E=(e,t,n)=>ie(e,t,n),O="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,F="?"+A,P=`<${F}>`,V=document,N=()=>V.createComment(""),I=e=>null===e||"object"!=typeof e&&"function"!=typeof e,W=Array.isArray,U="[ \t\n\f\r]",J=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,B=/>/g,q=new RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),K=/'/g,Z=/"/g,G=/^(?:script|style|textarea|title)$/i,Q=(X=1,(e,...t)=>(e.some((e=>void 0===e))&&console.warn("Some template strings are undefined.\nThis is probably caused by illegal octal escape sequences."),t.some((e=>e?._$litStatic$))&&D("","Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.\nPlease use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions"),{_$litType$:X,strings:e,values:t}));var X;const ee=Symbol.for("lit-noChange"),te=Symbol.for("lit-nothing"),ne=new WeakMap,ae=V.createTreeWalker(V,129);let ie=j;function re(e,t){if(!W(e)||!e.hasOwnProperty("raw")){let e="invalid template strings array";throw e="\n          Internal Error: expected template strings to be an array\n          with a 'raw' field. Faking a template strings array by\n          calling html or svg like an ordinary function is effectively\n          the same as calling unsafeHtml and can lead to major security\n          issues, e.g. opening your code up to XSS attacks.\n          If you're using the html or svg tagged template functions normally\n          and still seeing this error, please file a bug at\n          https://github.com/lit/lit/issues/new?template=bug_report.md\n          and include information about your build tooling, if any.\n        ".trim().replace(/\n */g,"\n"),new Error(e)}return void 0!==L?L.createHTML(t):t}class oe{constructor({strings:e,_$litType$:t},n){let a;this.parts=[];let i=0,r=0;const o=e.length-1,s=this.parts,[l,d]=((e,t)=>{const n=e.length-1,a=[];let i,r=2===t?"<svg>":3===t?"<math>":"",o=J;for(let t=0;t<n;t++){const n=e[t];let s,l,d=-1,c=0;for(;c<n.length&&(o.lastIndex=c,l=o.exec(n),null!==l);)if(c=o.lastIndex,o===J){if("!--"===l[1])o=R;else if(void 0!==l[1])o=B;else if(void 0!==l[2])G.test(l[2])&&(i=new RegExp(`</${l[2]}`,"g")),o=q;else if(void 0!==l[3])throw new Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else o===q?">"===l[0]?(o=i??J,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?q:'"'===l[3]?Z:K):o===Z||o===K?o=q:o===R||o===B?o=J:(o=q,i=void 0);console.assert(-1===d||o===q||o===K||o===Z,"unexpected parse state B");const _=o===q&&e[t+1].startsWith("/>")?" ":"";r+=o===J?n+P:d>=0?(a.push(s),n.slice(0,d)+O+n.slice(d)+A+_):n+A+(-2===d?t:_)}return[re(e,r+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),a]})(e,t);if(this.el=oe.createElement(l,n),ae.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(a=ae.nextNode())&&s.length<o;){if(1===a.nodeType){{const e=a.localName;if(/^(?:textarea|template)$/i.test(e)&&a.innerHTML.includes(A)){const t=`Expressions are not supported inside \`${e}\` elements. See https://lit.dev/msg/expression-in-${e} for more information.`;if("template"===e)throw new Error(t);D("",t)}}if(a.hasAttributes())for(const e of a.getAttributeNames())if(e.endsWith(O)){const t=d[r++],n=a.getAttribute(e).split(A),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:i,name:o[2],strings:n,ctor:"."===o[1]?_e:"?"===o[1]?he:"@"===o[1]?ue:ce}),a.removeAttribute(e)}else e.startsWith(A)&&(s.push({type:6,index:i}),a.removeAttribute(e));if(G.test(a.tagName)){const e=a.textContent.split(A),t=e.length-1;if(t>0){a.textContent=Y?Y.emptyScript:"";for(let n=0;n<t;n++)a.append(e[n],N()),ae.nextNode(),s.push({type:2,index:++i});a.append(e[t],N())}}}else if(8===a.nodeType){if(a.data===F)s.push({type:2,index:i});else{let e=-1;for(;-1!==(e=a.data.indexOf(A,e+1));)s.push({type:7,index:i}),e+=A.length-1}}i++}if(d.length!==r)throw new Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");$&&$({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){const n=V.createElement("template");return n.innerHTML=e,n}}function se(e,t,n=e,a){if(t===ee)return t;let i=void 0!==a?n.__directives?.[a]:n.__directive;const r=I(t)?void 0:t._$litDirective$;return i?.constructor!==r&&(i?._$notifyDirectiveConnectionChanged?.(!1),void 0===r?i=void 0:(i=new r(e),i._$initialize(e,n,a)),void 0!==a?(n.__directives??=[])[a]=i:n.__directive=i),void 0!==i&&(t=se(e,i._$resolve(e,t.values),i,a)),t}class le{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){const{el:{content:t},parts:n}=this._$template,a=(e?.creationScope??V).importNode(t,!0);ae.currentNode=a;let i=ae.nextNode(),r=0,o=0,s=n[0];for(;void 0!==s;){if(r===s.index){let t;2===s.type?t=new de(i,i.nextSibling,this,e):1===s.type?t=new s.ctor(i,s.name,s.strings,this,e):6===s.type&&(t=new me(i,this,e)),this._$parts.push(t),s=n[++o]}r!==s?.index&&(i=ae.nextNode(),r++)}return ae.currentNode=V,a}_update(e){let t=0;for(const n of this._$parts)void 0!==n&&($&&$({kind:"set part",part:n,value:e[t],valueIndex:t,values:e,templateInstance:this}),void 0!==n.strings?(n._$setValue(e,n,t),t+=n.strings.length-2):n._$setValue(e[t])),t++}}let de=class e{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,n,a){this.type=2,this._$committedValue=te,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=n,this.options=a,this.__isConnected=a?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=S(this._$startNode).parentNode;const t=this._$parent;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(null===this.parentNode)throw new Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=se(this,e,t),I(e))e===te||null==e||""===e?(this._$committedValue!==te&&($&&$({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear()),this._$committedValue=te):e!==this._$committedValue&&e!==ee&&this._commitText(e);else if(void 0!==e._$litType$)this._commitTemplateResult(e);else if(void 0!==e.nodeType){if(this.options?.host===e)return this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),void console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");this._commitNode(e)}else(e=>W(e)||"function"==typeof e?.[Symbol.iterator])(e)?this._commitIterable(e):this._commitText(e)}_insert(e){return S(S(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),ie!==j){const e=this._$startNode.parentNode?.nodeName;if("STYLE"===e||"SCRIPT"===e){let t="Forbidden";throw t="STYLE"===e?"Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.":"Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.",new Error(t)}}$&&$({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==te&&I(this._$committedValue)){const t=S(this._$startNode).nextSibling;void 0===this._textSanitizer&&(this._textSanitizer=E(t,"data","property")),e=this._textSanitizer(e),$&&$({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{const t=V.createTextNode("");this._commitNode(t),void 0===this._textSanitizer&&(this._textSanitizer=E(t,"data","property")),e=this._textSanitizer(e),$&&$({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){const{values:t,_$litType$:n}=e,a="number"==typeof n?this._$getTemplate(e):(void 0===n.el&&(n.el=oe.createElement(re(n.h,n.h[0]),this.options)),n);if(this._$committedValue?._$template===a)$&&$({kind:"template updating",template:a,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{const e=new le(a,this),n=e._clone(this.options);$&&$({kind:"template instantiated",template:a,instance:e,parts:e._$parts,options:this.options,fragment:n,values:t}),e._update(t),$&&$({kind:"template instantiated and updated",template:a,instance:e,parts:e._$parts,options:this.options,fragment:n,values:t}),this._commitNode(n),this._$committedValue=e}}_$getTemplate(e){let t=ne.get(e.strings);return void 0===t&&ne.set(e.strings,t=new oe(e)),t}_commitIterable(t){W(this._$committedValue)||(this._$committedValue=[],this._$clear());const n=this._$committedValue;let a,i=0;for(const r of t)i===n.length?n.push(a=new e(this._insert(N()),this._insert(N()),this,this.options)):a=n[i],a._$setValue(r),i++;i<n.length&&(this._$clear(a&&S(a._$endNode).nextSibling,i),n.length=i)}_$clear(e=S(this._$startNode).nextSibling,t){for(this._$notifyConnectionChanged?.(!1,!0,t);e&&e!==this._$endNode;){const t=S(e).nextSibling;S(e).remove(),e=t}}setConnected(e){if(void 0!==this._$parent)throw new Error("part.setConnected() may only be called on a RootPart returned from render().");this.__isConnected=e,this._$notifyConnectionChanged?.(e)}};class ce{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,n,a,i){this.type=1,this._$committedValue=te,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=a,this.options=i,n.length>2||""!==n[0]||""!==n[1]?(this._$committedValue=new Array(n.length-1).fill(new String),this.strings=n):this._$committedValue=te,this._sanitizer=void 0}_$setValue(e,t=this,n,a){const i=this.strings;let r=!1;if(void 0===i)e=se(this,e,t,0),r=!I(e)||e!==this._$committedValue&&e!==ee,r&&(this._$committedValue=e);else{const a=e;let o,s;for(e=i[0],o=0;o<i.length-1;o++)s=se(this,a[n+o],t,o),s===ee&&(s=this._$committedValue[o]),r||=!I(s)||s!==this._$committedValue[o],s===te?e=te:e!==te&&(e+=(s??"")+i[o+1]),this._$committedValue[o]=s}r&&!a&&this._commitValue(e)}_commitValue(e){e===te?S(this.element).removeAttribute(this.name):(void 0===this._sanitizer&&(this._sanitizer=ie(this.element,this.name,"attribute")),e=this._sanitizer(e??""),$&&$({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),S(this.element).setAttribute(this.name,e??""))}}class _e extends ce{constructor(){super(...arguments),this.type=3}_commitValue(e){void 0===this._sanitizer&&(this._sanitizer=ie(this.element,this.name,"property")),e=this._sanitizer(e),$&&$({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===te?void 0:e}}class he extends ce{constructor(){super(...arguments),this.type=4}_commitValue(e){$&&$({kind:"commit boolean attribute",element:this.element,name:this.name,value:!(!e||e===te),options:this.options}),S(this.element).toggleAttribute(this.name,!!e&&e!==te)}}class ue extends ce{constructor(e,t,n,a,i){if(super(e,t,n,a,i),this.type=5,void 0!==this.strings)throw new Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if((e=se(this,e,t,0)??te)===ee)return;const n=this._$committedValue,a=e===te&&n!==te||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==te&&(n===te||a);$&&$({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:a,addListener:i,oldListener:n}),a&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$committedValue=e}handleEvent(e){"function"==typeof this._$committedValue?this._$committedValue.call(this.options?.host??this.element,e):this._$committedValue.handleEvent(e)}}class me{constructor(e,t,n){this.element=e,this.type=6,this._$disconnectableChildren=void 0,this._$parent=t,this.options=n}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){$&&$({kind:"commit to element binding",element:this.element,value:e,options:this.options}),se(this,e)}}const pe={_ChildPart:de},ge=k.litHtmlPolyfillSupportDevMode;ge?.(oe,de),(k.litHtmlVersions??=[]).push("3.2.1"),k.litHtmlVersions.length>1&&D("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.");const fe=(e,t,n)=>{if(null==t)throw new TypeError(`The container to render into may not be ${t}`);const a=x++,i=n?.renderBefore??t;let r=i._$litPart$;if($&&$({kind:"begin render",id:a,value:e,container:t,options:n,part:r}),void 0===r){const e=n?.renderBefore??null;i._$litPart$=r=new de(t.insertBefore(N(),e),e,void 0,n??{})}return r._$setValue(e),$&&$({kind:"end render",id:a,value:e,container:t,options:n,part:r}),r};fe.setSanitizer=H,fe.createSanitizer=E,fe._testOnlyClearSanitizerFactoryDoNotCallOrElse=z;let ye;{const e=globalThis.litIssuedWarnings??=new Set;ye=(t,n)=>{n+=` See https://lit.dev/msg/${t} for more information.`,e.has(n)||(console.warn(n),e.add(n))}}class ve extends T{constructor(){super(...arguments),this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this.__childPart=fe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return ee}}var we;ve._$litElement$=!0,ve[(we="finalized",we)]=!0,globalThis.litElementHydrateSupport?.({LitElement:ve});const be=globalThis.litElementPolyfillSupportDevMode;be?.({LitElement:ve}),(globalThis.litElementVersions??=[]).push("4.1.1"),globalThis.litElementVersions.length>1&&ye("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let Me;{const e=globalThis.litIssuedWarnings??=new Set;Me=(t,n)=>{n+=` See https://lit.dev/msg/${t} for more information.`,e.has(n)||(console.warn(n),e.add(n))}}const Te={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:b},ke=(e=Te,t,n)=>{const{kind:a,metadata:i}=n;null==i&&Me("missing-class-metadata",`The class ${t} is missing decorator metadata. This could mean that you're using a compiler that supports decorators but doesn't support decorator metadata, such as TypeScript 5.1. Please update your compiler.`);let r=globalThis.litPropertyMetadata.get(i);if(void 0===r&&globalThis.litPropertyMetadata.set(i,r=new Map),r.set(n.name,e),"accessor"===a){const{name:a}=n;return{set(n){const i=t.get.call(this);t.set.call(this,n),this.requestUpdate(a,i,e)},init(t){return void 0!==t&&this._$changeProperty(a,void 0,e),t}}}if("setter"===a){const{name:a}=n;return function(n){const i=this[a];t.call(this,n),this.requestUpdate(a,i,e)}}throw new Error(`Unsupported decorator location: ${a}`)};function $e(e){return(t,n)=>"object"==typeof n?ke(e,t,n):((e,t,n)=>{const a=t.hasOwnProperty(n);return t.constructor.createProperty(n,a?{...e,wrapped:!0}:e),a?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */globalThis.litIssuedWarnings??=new Set;const De="3.0.5",xe=30,Se=5,Ye="cache_data_",Le=0,Ce="📅 Calendar Card Pro",je=500,He=200,ze=300,Ee=3e5,Oe={WEEK:1,MONTH:1.5},Ae=.2,Fe={TOUCH_SIZE:100,POINTER_SIZE:50},Pe=["Germany","Deutschland","United States","USA","United States of America","United Kingdom","Great Britain","France","Italy","Italia","Spain","España","Netherlands","Nederland","Austria","Österreich","Switzerland","Schweiz"];var Ve=Object.defineProperty,Ne=Object.defineProperties,Ie=Object.getOwnPropertyDescriptors,We=Object.getOwnPropertySymbols,Ue=Object.prototype.hasOwnProperty,Je=Object.prototype.propertyIsEnumerable,Re=(e,t,n)=>t in e?Ve(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Be=(e,t)=>{for(var n in t||(t={}))Ue.call(t,n)&&Re(e,n,t[n]);if(We)for(var n of We(t))Je.call(t,n)&&Re(e,n,t[n]);return e},qe=(e,t)=>Ne(e,Ie(t));let Ke=!1,Ze=Le;const Ge={title:["background: #424242","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 20px 0 0 20px","font-size: 12px","font-weight: bold","padding: 4px 8px 4px 12px","margin: 5px 0"].join(";"),version:["background: #4fc3f7","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 0 20px 20px 0","font-size: 12px","font-weight: bold","padding: 4px 12px 4px 8px","margin: 5px 0"].join(";"),prefix:["color: #4fc3f7","font-weight: bold"].join(";"),error:["color: #f44336","font-weight: bold"].join(";"),warn:["color: #ff9800","font-weight: bold"].join(";")};function Qe(e){!function(e){if(Ke)return;console.groupCollapsed(`%c${Ce}%cv${e} `,Ge.title,Ge.version),console.log("%c Description: %c A calendar card that supports multiple calendars with individual styling. ","font-weight: bold","font-weight: normal"),console.log("%c GitHub: %c https://github.com/alexpfau/calendar-card-pro ","font-weight: bold","font-weight: normal"),console.groupEnd(),Ke=!0}(e)}function Xe(e,t,...n){const a=function(e){if(null==e)return;if("string"==typeof e)return e;if("object"==typeof e)try{return Be({},e)}catch(t){try{return{value:JSON.stringify(e)}}catch(t){return{value:String(e)}}}return String(e)}(t);if(e instanceof Error){const t=e.message||"Unknown error",i="string"==typeof a?` during ${a}`:"",[r,o]=it(`Error${i}: ${t}`,Ge.error);console.error(r,o),e.stack&&console.error(e.stack),a&&"object"==typeof a&&console.error("Context:",qe(Be({},a),{timestamp:(new Date).toISOString()})),n.length>0&&console.error("Additional data:",...n)}else if("string"==typeof e){const t="string"==typeof a?` during ${a}`:"",[i,r]=it(`${e}${t}`,Ge.error);a&&"object"==typeof a?console.error(i,r,Be({context:qe(Be({},a),{timestamp:(new Date).toISOString()})},n.length>0?{additionalData:n}:{})):n.length>0?console.error(i,r,...n):console.error(i,r)}else{const t="string"==typeof a?` during ${a}`:"",[i,r]=it(`Unknown error${t}:`,Ge.error);console.error(i,r,e),a&&"object"==typeof a&&console.error("Context:",qe(Be({},a),{timestamp:(new Date).toISOString()})),n.length>0&&console.error("Additional data:",...n)}}function et(e,...t){at(1,e,Ge.warn,console.warn,...t)}function tt(e,...t){at(2,e,Ge.prefix,console.log,...t)}function nt(e,...t){at(3,e,Ge.prefix,console.log,...t)}function at(e,t,n,a,...i){if(Ze<e)return;const[r,o]=it(t,n);i.length>0?a(r,o,...i):a(r,o)}function it(e,t){return[`%c[${Ce}] ${e}`,t]}const rt={entities:[],start_date:void 0,days_to_show:3,compact_days_to_show:void 0,compact_events_to_show:void 0,compact_events_complete_days:!1,show_empty_days:!1,filter_duplicates:!1,split_multiday_events:!1,language:void 0,title:void 0,title_font_size:void 0,title_color:void 0,background_color:"var(--ha-card-background)",accent_color:"#03a9f4",vertical_line_width:"2px",day_spacing:"10px",event_spacing:"4px",additional_card_spacing:"0px",height:"auto",max_height:"none",first_day_of_week:"system",show_week_numbers:null,show_current_week_number:!0,week_number_font_size:"12px",week_number_color:"var(--primary-text-color)",week_number_background_color:"#03a9f450",day_separator_width:"0px",day_separator_color:"var(--secondary-text-color)",week_separator_width:"0px",week_separator_color:"#03a9f450",month_separator_width:"0px",month_separator_color:"var(--primary-text-color)",today_indicator:!1,today_indicator_position:"15% 50%",today_indicator_color:"#03a9f4",today_indicator_size:"6px",date_vertical_alignment:"middle",weekday_font_size:"14px",weekday_color:"var(--primary-text-color)",day_font_size:"26px",day_color:"var(--primary-text-color)",show_month:!0,month_font_size:"12px",month_color:"var(--primary-text-color)",weekend_weekday_color:void 0,weekend_day_color:void 0,weekend_month_color:void 0,today_weekday_color:void 0,today_day_color:void 0,today_month_color:void 0,event_background_opacity:0,show_past_events:!1,show_countdown:!1,show_progress_bar:!1,progress_bar_color:"var(--secondary-text-color)",progress_bar_height:"calc(var(--calendar-card-font-size-time) * 0.75)",progress_bar_width:"60px",event_font_size:"14px",event_color:"var(--primary-text-color)",empty_day_color:"var(--primary-text-color)",show_time:!0,show_single_allday_time:!0,time_24h:"system",show_end_time:!0,time_font_size:"12px",time_color:"var(--secondary-text-color)",time_icon_size:"14px",show_location:!0,remove_location_country:!1,location_font_size:"12px",location_color:"var(--secondary-text-color)",location_icon_size:"14px",weather:{entity:void 0,position:"date",date:{show_conditions:!0,show_high_temp:!0,show_low_temp:!1,icon_size:"14px",font_size:"12px",color:"var(--primary-text-color)"},event:{show_conditions:!0,show_temp:!0,icon_size:"14px",font_size:"12px",color:"var(--primary-text-color)"}},tap_action:{action:"none"},hold_action:{action:"none"},refresh_interval:xe,refresh_on_navigate:!0};function ot(e){const t=function(e){if(!e||"object"!=typeof e)return null;if("states"in e&&"object"==typeof e.states){const t=Object.keys(e.states).find((e=>e.startsWith("calendar.")));if(t)return t}return Object.keys(e).find((e=>e.startsWith("calendar.")))||null}(e);return{type:"custom:calendar-card-pro",entities:t?[t]:[],days_to_show:3,show_location:!0,_description:t?void 0:"A calendar card that displays events from multiple calendars with individual styling. Add a calendar integration to Home Assistant to use this card."}}var st={daysOfWeek:["Ne","Po","Út","St","Čt","Pá","So"],fullDaysOfWeek:["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"],months:["Led","Úno","Bře","Dub","Kvě","Čvn","Čvc","Srp","Zář","Říj","Lis","Pro"],allDay:"celý den",multiDay:"do",at:"v",endsToday:"končí dnes",endsTomorrow:"končí zítra",noEvents:"Žádné nadcházející události",loading:"Načítání událostí z kalendáře...",error:"Chyba: Entita kalendáře nebyla nalezena nebo je nesprávně nakonfigurována"},lt={daysOfWeek:["Dg","Dl","Dm","Dc","Dj","Dv","Ds"],fullDaysOfWeek:["Diumenge","Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte"],months:["Gen","Febr","Març","Abr","Maig","Juny","Jul","Ag","Set","Oct","Nov","Des"],allDay:"tot el dia",multiDay:"fins a",at:"a les",endsToday:"acaba avui",endsTomorrow:"acaba damà",noEvents:"Cap event proper",loading:"Carregant events...",error:"Error: No s'ha trobat l'entitat del calendari o aquesta està mal configurada"},dt={daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dagen",multiDay:"indtil",at:"kl.",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",noEvents:"Ingen kommende begivenheder",loading:"Indlæser kalenderbegivenheder...",error:"Fejl: Kalenderenheden blev ikke fundet eller er ikke konfigureret korrekt"},ct={daysOfWeek:["So","Mo","Di","Mi","Do","Fr","Sa"],fullDaysOfWeek:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],months:["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],allDay:"ganztägig",multiDay:"bis",at:"um",endsToday:"endet heute",endsTomorrow:"endet morgen",noEvents:"Keine anstehenden Termine",loading:"Kalendereinträge werden geladen...",error:"Fehler: Kalender-Entity nicht gefunden oder falsch konfiguriert"},_t={daysOfWeek:["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"],fullDaysOfWeek:["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],months:["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"],allDay:"Ολοήμερο",multiDay:"έως",at:"στις",endsToday:"λήγει σήμερα",endsTomorrow:"λήγει αύριο",noEvents:"Δεν υπάρχουν προγραμματισμένα γεγονότα",loading:"Φόρτωση ημερολογίου...",error:"Σφάλμα: Η οντότητα ημερολογίου δεν βρέθηκε ή δεν έχει ρυθμιστεί σωστά"},ht={daysOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fullDaysOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],allDay:"all day",multiDay:"until",at:"at",endsToday:"ends today",endsTomorrow:"ends tomorrow",noEvents:"No upcoming events",loading:"Loading calendar events...",error:"Error: Calendar entity not found or improperly configured",editor:{calendar_entities:"Calendar Entities",calendar:"Calendar",entity_identification:"Entity Identification",entity:"Entity",add_calendar:"Add calendar",remove:"Remove",convert_to_advanced:"Convert to advanced",simple:"Simple",display_settings:"Display Settings",label:"Label",label_type:"Label Type",none:"None",text_emoji:"Text/Emoji",icon:"Icon",text_value:"Text Value",text_label_note:"Enter text or emoji like '📅 My Calendar'",image:"Image",image_label_note:"Path to image like /local/calendar.jpg",label_note:"Custom label for this calendar.",colors:"Colors",event_color:"Event color",entity_color_note:"Custom color for event titles from this calendar.",accent_color:"Accent color",entity_accent_color_note:"Custom accent color for the vertical line of events from this calendar. This color will also be used as the event background color when 'event_background_opacity' is >0.",event_filtering:"Event Filtering",blocklist:"Blocklist",blocklist_note:"Pipe-separated list of terms to exclude events. Events with titles containing any of these terms will be hidden. Example: 'Private|Meeting|Conference'",allowlist:"Allowlist",allowlist_note:"Pipe-separated list of terms to include events. If not empty, only events with titles containing any of these terms will be shown. Example: 'Birthday|Anniversary|Important'",entity_overrides:"Entity Overrides",entity_overrides_note:"These settings will override the global core settings for this specific calendar.",compact_events_to_show:"Compact events to show",entity_compact_events_note:"Override the number of events to show in compact mode for this calendar.",show_time:"Show time",entity_show_time_note:"Show or hide event times for this calendar only.",show_location:"Show location",entity_show_location_note:"Show or hide event locations for this calendar only.",split_multiday_events:"Split multi-day events",entity_split_multiday_note:"Split multi-day events into individual day segments for this calendar.",core_settings:"Core Settings",time_range:"Time Range",time_range_note:"This time range defines the regular display mode, which becomes the expanded view if compact mode is configured.",days_to_show:"Days to show",days_to_show_note:"Number of days to fetch from API and display in the calendar",start_date:"Start date",start_date_mode:"Start date mode",start_date_mode_default:"Default (today)",start_date_mode_fixed:"Fixed date",start_date_mode_offset:"Relative offset",start_date_fixed:"Fixed start date",start_date_offset:"Relative offset from today",start_date_offset_note:"Enter a positive or negative number to offset from today (e.g., +1 for tomorrow, -5 for five days ago).",compact_mode:"Compact Mode",compact_mode_note:"Compact mode shows fewer days and/or events initially. The card can be expanded to full view using a tap or hold action if configured with action: 'expand'.",compact_days_to_show:"Compact days to show",compact_events_complete_days:"Complete days in compact mode",compact_events_complete_days_note:"When enabled, if at least one event from a day is shown, all events from that day will be displayed.",event_visibility:"Event Visibility",show_past_events:"Show past events",show_empty_days:"Show empty days",filter_duplicates:"Filter duplicate events",language_time_formats:"Language & Time Formats",language:"Language",language_mode:"Language Mode",language_code:"Language Code",language_code_note:"Enter a 2-letter language code (e.g., 'en', 'de', 'fr')",time_24h:"Time format",system:"System default",custom:"Custom","12h":"12-hour","24h":"24-hour",appearance_layout:"Appearance & Layout",title_styling:"Title Styling",title:"Title",title_font_size:"Title font size",title_color:"Title color",card_styling:"Card Styling",background_color:"Background color",height_mode:"Height mode",auto:"Auto height",fixed:"Fixed height",maximum:"Maximum height",height_value:"Height value",fixed_height_note:"Card always maintains exactly this height regardless of content",max_height_note:"Card grows with content up to this maximum height",event_styling:"Event Styling",event_background_opacity:"Event background opacity",vertical_line_width:"Vertical line width",spacing_alignment:"Spacing & Alignment",day_spacing:"Day spacing",event_spacing:"Event spacing",additional_card_spacing:"Additional card spacing",date_display:"Date Display",vertical_alignment:"Vertical Alignment",date_vertical_alignment:"Date vertical alignment",date_formatting:"Date Formatting",top:"Top",middle:"Middle",bottom:"Bottom",weekday_font:"Weekday font",weekday_font_size:"Weekday font size",weekday_color:"Weekday color",day_font:"Day font",day_font_size:"Day font size",day_color:"Day color",month_font:"Month font",show_month:"Show month",month_font_size:"Month font size",month_color:"Month color",weekend_highlighting:"Weekend Highlighting",weekend_weekday_color:"Weekend weekday color",weekend_day_color:"Weekend day color",weekend_month_color:"Weekend month color",today_highlighting:"Today Highlighting",today_weekday_color:"Today weekday color",today_day_color:"Today day color",today_month_color:"Today month color",today_indicator:"Today indicator",dot:"Dot",pulse:"Pulse",glow:"Glow",emoji:"Emoji",emoji_value:"Emoji",emoji_indicator_note:"Enter a single emoji character like 🗓️",image_path:"Image path",image_indicator_note:"Path to image like /local/image.jpg",today_indicator_position:"Today indicator position",today_indicator_color:"Today indicator color",today_indicator_size:"Today indicator size",week_numbers_separators:"Week Numbers & Separators",week_numbers:"Week numbers",first_day_of_week:"First day of week",sunday:"Sunday",monday:"Monday",show_week_numbers:"Show week numbers",week_number_note_iso:"ISO (Europe/International): First week contains the first Thursday of the year. Creates consistent week numbering across years (ISO 8601 standard).",week_number_note_simple:"Simple (North America): Weeks count sequentially from January 1st regardless of weekday. First week may be partial. More intuitive but less standardized.",show_current_week_number:"Show current week number",week_number_font_size:"Week number font size",week_number_color:"Week number color",week_number_background_color:"Week number background color",day_separator:"Day separator",show_day_separator:"Show day separator",day_separator_width:"Day separator width",day_separator_color:"Day separator color",week_separator:"Week separator",show_week_separator:"Show week separator",week_separator_width:"Week separator width",week_separator_color:"Week separator color",month_separator:"Month separator",show_month_separator:"Show month separator",month_separator_width:"Month separator width",month_separator_color:"Month separator color",event_display:"Event Display",event_title:"Event Title",event_font_size:"Event font size",empty_day_color:"Empty day color",time:"Time",show_single_allday_time:"Show time for all-day single events",show_end_time:"Show end time",time_font_size:"Time font size",time_color:"Time color",time_icon_size:"Time icon size",location:"Location",remove_location_country:"Remove location country",location_font_size:"Location font size",location_color:"Location color",location_icon_size:"Location icon size",custom_country_pattern:"Country patterns to remove",custom_country_pattern_note:"Enter country names as a regular expression pattern (e.g., 'USA|United States|Canada'). Events with locations ending with these patterns will have the country removed.",progress_indicators:"Progress Indicators",show_countdown:"Show countdown",show_progress_bar:"Show progress bar",progress_bar_color:"Progress bar color",progress_bar_height:"Progress bar height",progress_bar_width:"Progress bar width",multiday_event_handling:"Multi-day Event Handling",weather_integration:"Weather Integration",weather_entity_position:"Weather Entity & Position",weather_entity:"Weather entity",weather_position:"Weather position",date:"Date",event:"Event",both:"Both",date_column_weather:"Date Column Weather",show_conditions:"Show conditions",show_high_temp:"Show high temperature",show_low_temp:"Show low temperature",icon_size:"Icon size",font_size:"Font size",color:"Color",event_row_weather:"Event Row Weather",show_temp:"Show temperature",interactions:"Interactions",tap_action:"Tap Action",hold_action:"Hold Action",more_info:"More Info",navigate:"Navigate",url:"URL",call_service:"Call Service",expand:"Toggle Compact/Expanded View",navigation_path:"Navigation path",url_path:"URL",service:"Service",service_data:"Service data (JSON)",refresh_settings:"Refresh Settings",refresh_interval:"Refresh interval (minutes)",refresh_on_navigate:"Refresh when navigating back",deprecated_config_detected:"Deprecated config options detected.",deprecated_config_explanation:"Some options in your configuration are no longer supported.",deprecated_config_update_hint:"Please update to ensure compatibility.",update_config:"Update config…"}},ut={daysOfWeek:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],fullDaysOfWeek:["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],months:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],allDay:"todo el día",multiDay:"hasta",at:"a las",endsToday:"termina hoy",endsTomorrow:"termina mañana",noEvents:"No hay eventos próximos",loading:"Cargando eventos del calendario...",error:"Error: La entidad del calendario no se encontró o está mal configurada"},mt={daysOfWeek:["Su","Ma","Ti","Ke","To","Pe","La"],fullDaysOfWeek:["Sunnuntai","Maanantai","Tiistai","Keskiviikko","Torstai","Perjantai","Lauantai"],months:["Tammi","Helmi","Maalis","Huhti","Touko","Kesä","Heinä","Elo","Syys","Loka","Marras","Joulu"],allDay:"koko päivä",multiDay:"asti",at:"klo",endsToday:"päättyy tänään",endsTomorrow:"päättyy huomenna",noEvents:"Ei tulevia tapahtumia",loading:"Ladataan kalenteritapahtumia...",error:"Virhe: Kalenteriyksikköä ei löydy tai se on väärin määritetty"},pt={daysOfWeek:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],fullDaysOfWeek:["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],months:["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"],allDay:"toute la journée",multiDay:"jusqu'au",at:"à",endsToday:"finit aujourd'hui",endsTomorrow:"finit demain",noEvents:"Aucun événement à venir",loading:"Chargement des événements...",error:"Erreur: Entité de calendrier introuvable ou mal configurée"},gt={daysOfWeek:["א'","ב'","ג'","ד'","ה'","ו'","ש'"],fullDaysOfWeek:["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"],months:["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"],allDay:"כל-היום",multiDay:"עד",endsToday:"מסתיים היום",endsTomorrow:"מסתיים מחר",at:"בשעה",noEvents:"אין אירועים קרובים",loading:"טוען אירועי לוח שנה...",error:"שגיאה: ישות לוח השנה לא נמצאה או לא מוגדרת כראוי"},ft={daysOfWeek:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"],fullDaysOfWeek:["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"],months:["Sij","Velj","Ožu","Tra","Svi","Lip","Srp","Kol","Ruj","Lis","Stu","Pro"],allDay:"cijeli dan",multiDay:"do",at:"u",endsToday:"završava danas",endsTomorrow:"završava sutra",noEvents:"Nema nadolazećih događaja",loading:"Učitavanje događaja...",error:"Greška: Kalendar entitet nije pronađen ili je neispravno postavljen"},yt={daysOfWeek:["Vas","Hét","Kedd","Sze","Csüt","Pén","Szo"],fullDaysOfWeek:["Vasárnap","Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat"],months:["Jan","Feb","Már","Ápr","Máj","Jún","Júl","Aug","Szep","Okt","Nov","Dec"],allDay:"egész napos",multiDay:"eddig:",endsToday:"ma este ér véget",endsTomorrow:"holnap ér véget",at:"itt:",noEvents:"Mára nincs több esemény",loading:"Naptárbejegyzések betöltése...",error:"Hiba: Naptár entitás nem található vagy nem megfelelően konfigutált"};const vt={cs:st,ca:lt,da:dt,de:ct,el:_t,en:ht,es:ut,fi:mt,fr:pt,he:gt,hr:ft,hu:yt,is:{daysOfWeek:["Sun","Mán","Þri","Mið","Fim","Fös","Lau"],fullDaysOfWeek:["Sunnudagur","Mánudagur","Þriðjudagur","Miðvikudagur","Fimmtudagur","Föstudagur","Laugardagur"],months:["Jan","Feb","Mar","Apr","Maí","Jún","Júl","Ágú","Sep","Okt","Nóv","Des"],allDay:"Allur dagurinn",multiDay:"þar til",at:"kl",endsToday:"lýkur í dag",endsTomorrow:"lýkur á morgun",noEvents:"Engir viðburðir á næstunni",loading:"Hleður inn dagatal...",error:"Villa: Dagatalseining finnst ekki eða er vanstillt"},it:{daysOfWeek:["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],fullDaysOfWeek:["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"],months:["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"],allDay:"tutto-il-giorno",multiDay:"fino a",at:"a",endsToday:"termina oggi",endsTomorrow:"termina domani",noEvents:"Nessun evento programmato",loading:"Sto caricando il calendario degli eventi...",error:"Errore: Entità Calendario non trovata o non configurata correttamente"},nb:{daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],months:["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"],allDay:"hele dagen",multiDay:"inntil",at:"kl. ",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",noEvents:"Ingen kommende hendelser",loading:"Laster kalenderhendelser...",error:"Feil: Kalenderenheten ble ikke funnet eller er ikke konfigurert riktig"},nl:{daysOfWeek:["Zo","Ma","Di","Wo","Do","Vr","Za"],fullDaysOfWeek:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],months:["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dag",multiDay:"tot",at:"om",endsToday:"eindigt vandaag",endsTomorrow:"eindigt morgen",noEvents:"Geen afspraken gepland",loading:"Kalender afspraken laden...",error:"Fout: Kalender niet gevonden of verkeerd geconfigureerd"},nn:{daysOfWeek:["Søn","Mån","Tys","Ons","Tor","Fre","Lau"],fullDaysOfWeek:["Søndag","Måndag","Tysdag","Onsdag","Torsdag","Fredag","Laurdag"],months:["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"],allDay:"heile dagen",multiDay:"inntil",at:"kl. ",endsToday:"sluttar i dag",endsTomorrow:"sluttar i morgon",noEvents:"Ingen kommande hendingar",loading:"Lastar kalenderhendingar...",error:"Feil: Kalendereininga vart ikkje funnen eller er ikkje konfigurert riktig"},pl:{daysOfWeek:["Nd","Pn","Wt","Śr","Cz","Pt","Sb"],fullDaysOfWeek:["niedzieli","poniedziałku","wtorku","środy","czwartku","piątku","soboty"],months:["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"],allDay:"cały dzień",multiDay:"do",at:"o",endsToday:"kończy się dziś",endsTomorrow:"kończy się jutro",noEvents:"Brak nadchodzących wydarzeń",loading:"Ładowanie wydarzeń z kalendarza...",error:"Błąd: encja kalendarza nie została znaleziona lub jest niepoprawnie skonfigurowana"},pt:{daysOfWeek:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],fullDaysOfWeek:["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"],months:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],allDay:"o dia todo",multiDay:"até",at:"às",endsToday:"termina hoje",endsTomorrow:"termina amanhã",noEvents:"Nenhum evento próximo",loading:"Carregando eventos do calendário...",error:"Erro: A entidade do calendário não foi encontrada ou está configurada incorretamente"},ro:{daysOfWeek:["Du","Lu","Ma","Mi","Jo","Vi","Sa"],fullDaysOfWeek:["Duminica","Luni","Marti","Miercuri","Joi","Vineri","Sambata"],months:["Ian","Feb","Mart","Apr","Mai","Iun","Iul","Aug","Sept","Oct","Nov","Dec"],allDay:"toata ziua",multiDay:"pana la",at:"la",endsToday:"se incheie astazi",endsTomorrow:"se incheie maine",noEvents:"Nu sunt evenimente viitoare",loading:"Incarcare evenimente de calendar...",error:"Eroare: Entitatea de calendar nu a fost gasita sau este configurata incorect"},ru:{daysOfWeek:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["воскресенья","понедельника","вторника","среды","четверга","пятницы","субботы"],months:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],allDay:"весь день",multiDay:"до",at:"в",endsToday:"заканчивается сегодня",endsTomorrow:"заканчивается завтра",noEvents:"Нет предстоящих событий",loading:"Загрузка событий календаря...",error:"Ошибка: Объект календарь, не найден или неправильно настроен"},sl:{daysOfWeek:["ned","pon","tor","sre","čet","pet","sob"],fullDaysOfWeek:["nedelja","ponedeljek","torek","sreda","četrtek","petek","sobota"],months:["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],allDay:"cel dan",multiDay:"do",at:"ob",endsToday:"konča se danes",endsTomorrow:"konča se jutri",noEvents:"Ni planiranih dogodkov",loading:"Nalagam dogodke...",error:"Napaka: Entiteta ni bila najdena ali pa je nepravilno konfigurirana."},sk:{daysOfWeek:["Ne","Po","Ut","St","Št","Pi","So"],fullDaysOfWeek:["Nedeľa","Pondelok","Utorok","Streda","Štvrtok","Piatok","Sobota"],months:["Jan","Feb","Mar","Apr","Máj","Jún","Júl","Aug","Sep","Okt","Nov","Dec"],allDay:"celý den",multiDay:"do",at:"v",endsToday:"končí dnes",endsTomorrow:"končí zajtra",noEvents:"Žiadna udalosť",loading:"Načítanie udalostí z kalendára...",error:"Chyba: Entita kalendára nebola nájdená alebo je nesprávne nakonfigurovaná"},sv:{daysOfWeek:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],fullDaysOfWeek:["Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"heldag",multiDay:"till",at:"vid",endsToday:"slutar idag",endsTomorrow:"slutar imorgon",noEvents:"Inga kommande händelser",loading:"Laddar kalenderhändelser...",error:"Fel: Kalenderentiteten hittades inte eller är felaktigt konfigurerad."},uk:{daysOfWeek:["Нд","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["неділі","понеділка","вівторка","середи","четверга","п'ятниці","суботи"],months:["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"],allDay:"весь день",multiDay:"до",at:"об",endsToday:"закінчується сьогодні",endsTomorrow:"закінчується завтра",noEvents:"Немає майбутніх подій",loading:"Завантаження подій календаря...",error:"Помилка: Cутність календаря не знайдено або налаштовано неправильно"},vi:{daysOfWeek:["CN","T.2","T.3","T.4","T.5","T.6","T.7"],fullDaysOfWeek:["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"],months:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],allDay:"cả ngày",multiDay:"đến",at:"lúc",endsToday:"kết thúc hôm nay",endsTomorrow:"kết thúc ngày mai",noEvents:"Không có sự kiện sắp tới",loading:"Đang tải sự kiện...",error:"Lỗi: Không tìm thấy lịch hoặc cấu hình không đúng"},th:{daysOfWeek:["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],fullDaysOfWeek:["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"],months:["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],allDay:"ตลอดวัน",multiDay:"ถึง",at:"เวลา",endsToday:"สิ้นสุดวันนี้",endsTomorrow:"สิ้นสุดพรุ่งนี้",noEvents:"ไม่มีเหตุการณ์ที่กำลังจะเกิดขึ้น",loading:"กำลังโหลดเหตุการณ์ปฏิทิน...",error:"ข้อผิดพลาด: ไม่พบเอนทิตีปฏิทินหรือมีการตั้งค่าที่ไม่ถูกต้อง"},"zh-cn":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"在",endsToday:"今天结束",endsTomorrow:"明天结束",noEvents:"没有即将到来的活动",loading:"正在加载日历事件...",error:"错误：找不到日历实体或配置不正确"},"zh-tw":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"在",endsToday:"今天結束",endsTomorrow:"明天結束",noEvents:"沒有即將到來的活動",loading:"正在加載日曆事件...",error:"錯誤：找不到日曆實體或配置不正確"}},wt="en",bt=new Map;function Mt(e,t){const n=`${e||""}:${(null==t?void 0:t.language)||""}`;if(bt.has(n))return bt.get(n);let a;if(e&&""!==e.trim()){const t=e.toLowerCase();if(vt[t])return a=t,bt.set(n,a),a}if(null==t?void 0:t.language){const e=t.language.toLowerCase();if(vt[e])return a=e,bt.set(n,a),a;const i=e.split(/[-_]/)[0];if(i!==e&&vt[i])return a=i,bt.set(n,a),a}return a=wt,bt.set(n,a),a}function Tt(e){const t=(null==e?void 0:e.toLowerCase())||wt;return vt[t]||vt[wt]}function kt(e){const t=(null==e?void 0:e.toLowerCase())||"";return"de"===t||"hr"===t?"day-dot-month":"en"===t||"hu"===t?"month-day":"day-month"}function $t(){return Math.random().toString(36).substring(2,15)}function Dt(e,t,n,a){const i=e.map((e=>"string"==typeof e?e:e.entity)).sort().join("_");let r="";if(a)try{r=a.includes("T")?a.split("T")[0]:a}catch(e){r=a}return function(e){let t=0;for(let n=0;n<e.length;n++){t=(t<<5)-t+e.charCodeAt(n),t|=0}return Math.abs(t).toString(36)}(`calendar_${i}_${t}_${n?1:0}${r?`_${r}`:""}`)}function xt(e,t=!0){if(!e)return t;if("24"===e.time_format)return!0;if("12"===e.time_format)return!1;if("language"===e.time_format&&e.language)return n(e.language);if("system"===e.time_format)try{const e=new Intl.DateTimeFormat(navigator.language,{hour:"numeric"});return!e.format(new Date(2e3,0,1,13,0,0)).match(/AM|PM|am|pm/)}catch(a){return e.language?n(e.language):t}return t;function n(e){const t=e.split("-")[0].toLowerCase();return["de","fr","es","it","pt","nl","ru","pl","sv","no","fi","da","cs","sk","sl","hr","hu","ro","bg","el","tr","zh","ja","ko"].includes(t)}}function St(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Yt(e,t){if(!e||"object"!=typeof e||Array.isArray(e))return e;const n=Array.isArray(e)?[]:{};for(const[a,i]of Object.entries(e)){if(void 0===i)continue;if("show_week_numbers"===a&&(null===i||""===i))continue;if("entities"===a&&Array.isArray(i)){n[a]=i;continue}if("weather"===a&&"object"==typeof i&&null!==i){n[a]=structuredClone?structuredClone(i):JSON.parse(JSON.stringify(i));continue}if(!(t&&a in t&&t[a]===i))if(null===i||"object"!=typeof i||Array.isArray(i)||!t||"object"!=typeof t[a]||Array.isArray(t[a]))n[a]=i;else{const e=Yt(i,t[a]);Object.keys(e).length>0&&(n[a]=e)}}return n}function Lt(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Ct,jt={exports:{}};function Ht(){return Ct||(Ct=1,jt.exports=function(){var e=1e3,t=6e4,n=36e5,a="millisecond",i="second",r="minute",o="hour",s="day",l="week",d="month",c="quarter",_="year",h="date",u="Invalid Date",m=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,p=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,g={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],n=e%100;return"["+e+(t[(n-20)%10]||t[n]||t[0])+"]"}},f=function(e,t,n){var a=String(e);return!a||a.length>=t?e:""+Array(t+1-a.length).join(n)+e},y={s:f,z:function(e){var t=-e.utcOffset(),n=Math.abs(t),a=Math.floor(n/60),i=n%60;return(t<=0?"+":"-")+f(a,2,"0")+":"+f(i,2,"0")},m:function e(t,n){if(t.date()<n.date())return-e(n,t);var a=12*(n.year()-t.year())+(n.month()-t.month()),i=t.clone().add(a,d),r=n-i<0,o=t.clone().add(a+(r?-1:1),d);return+(-(a+(n-i)/(r?i-o:o-i))||0)},a:function(e){return e<0?Math.ceil(e)||0:Math.floor(e)},p:function(e){return{M:d,y:_,w:l,d:s,D:h,h:o,m:r,s:i,ms:a,Q:c}[e]||String(e||"").toLowerCase().replace(/s$/,"")},u:function(e){return void 0===e}},v="en",w={};w[v]=g;var b="$isDayjsObject",M=function(e){return e instanceof D||!(!e||!e[b])},T=function e(t,n,a){var i;if(!t)return v;if("string"==typeof t){var r=t.toLowerCase();w[r]&&(i=r),n&&(w[r]=n,i=r);var o=t.split("-");if(!i&&o.length>1)return e(o[0])}else{var s=t.name;w[s]=t,i=s}return!a&&i&&(v=i),i||!a&&v},k=function(e,t){if(M(e))return e.clone();var n="object"==typeof t?t:{};return n.date=e,n.args=arguments,new D(n)},$=y;$.l=T,$.i=M,$.w=function(e,t){return k(e,{locale:t.$L,utc:t.$u,x:t.$x,$offset:t.$offset})};var D=function(){function g(e){this.$L=T(e.locale,null,!0),this.parse(e),this.$x=this.$x||e.x||{},this[b]=!0}var f=g.prototype;return f.parse=function(e){this.$d=function(e){var t=e.date,n=e.utc;if(null===t)return new Date(NaN);if($.u(t))return new Date;if(t instanceof Date)return new Date(t);if("string"==typeof t&&!/Z$/i.test(t)){var a=t.match(m);if(a){var i=a[2]-1||0,r=(a[7]||"0").substring(0,3);return n?new Date(Date.UTC(a[1],i,a[3]||1,a[4]||0,a[5]||0,a[6]||0,r)):new Date(a[1],i,a[3]||1,a[4]||0,a[5]||0,a[6]||0,r)}}return new Date(t)}(e),this.init()},f.init=function(){var e=this.$d;this.$y=e.getFullYear(),this.$M=e.getMonth(),this.$D=e.getDate(),this.$W=e.getDay(),this.$H=e.getHours(),this.$m=e.getMinutes(),this.$s=e.getSeconds(),this.$ms=e.getMilliseconds()},f.$utils=function(){return $},f.isValid=function(){return!(this.$d.toString()===u)},f.isSame=function(e,t){var n=k(e);return this.startOf(t)<=n&&n<=this.endOf(t)},f.isAfter=function(e,t){return k(e)<this.startOf(t)},f.isBefore=function(e,t){return this.endOf(t)<k(e)},f.$g=function(e,t,n){return $.u(e)?this[t]:this.set(n,e)},f.unix=function(){return Math.floor(this.valueOf()/1e3)},f.valueOf=function(){return this.$d.getTime()},f.startOf=function(e,t){var n=this,a=!!$.u(t)||t,c=$.p(e),u=function(e,t){var i=$.w(n.$u?Date.UTC(n.$y,t,e):new Date(n.$y,t,e),n);return a?i:i.endOf(s)},m=function(e,t){return $.w(n.toDate()[e].apply(n.toDate("s"),(a?[0,0,0,0]:[23,59,59,999]).slice(t)),n)},p=this.$W,g=this.$M,f=this.$D,y="set"+(this.$u?"UTC":"");switch(c){case _:return a?u(1,0):u(31,11);case d:return a?u(1,g):u(0,g+1);case l:var v=this.$locale().weekStart||0,w=(p<v?p+7:p)-v;return u(a?f-w:f+(6-w),g);case s:case h:return m(y+"Hours",0);case o:return m(y+"Minutes",1);case r:return m(y+"Seconds",2);case i:return m(y+"Milliseconds",3);default:return this.clone()}},f.endOf=function(e){return this.startOf(e,!1)},f.$set=function(e,t){var n,l=$.p(e),c="set"+(this.$u?"UTC":""),u=(n={},n[s]=c+"Date",n[h]=c+"Date",n[d]=c+"Month",n[_]=c+"FullYear",n[o]=c+"Hours",n[r]=c+"Minutes",n[i]=c+"Seconds",n[a]=c+"Milliseconds",n)[l],m=l===s?this.$D+(t-this.$W):t;if(l===d||l===_){var p=this.clone().set(h,1);p.$d[u](m),p.init(),this.$d=p.set(h,Math.min(this.$D,p.daysInMonth())).$d}else u&&this.$d[u](m);return this.init(),this},f.set=function(e,t){return this.clone().$set(e,t)},f.get=function(e){return this[$.p(e)]()},f.add=function(a,c){var h,u=this;a=Number(a);var m=$.p(c),p=function(e){var t=k(u);return $.w(t.date(t.date()+Math.round(e*a)),u)};if(m===d)return this.set(d,this.$M+a);if(m===_)return this.set(_,this.$y+a);if(m===s)return p(1);if(m===l)return p(7);var g=(h={},h[r]=t,h[o]=n,h[i]=e,h)[m]||1,f=this.$d.getTime()+a*g;return $.w(f,this)},f.subtract=function(e,t){return this.add(-1*e,t)},f.format=function(e){var t=this,n=this.$locale();if(!this.isValid())return n.invalidDate||u;var a=e||"YYYY-MM-DDTHH:mm:ssZ",i=$.z(this),r=this.$H,o=this.$m,s=this.$M,l=n.weekdays,d=n.months,c=n.meridiem,_=function(e,n,i,r){return e&&(e[n]||e(t,a))||i[n].slice(0,r)},h=function(e){return $.s(r%12||12,e,"0")},m=c||function(e,t,n){var a=e<12?"AM":"PM";return n?a.toLowerCase():a};return a.replace(p,(function(e,a){return a||function(e){switch(e){case"YY":return String(t.$y).slice(-2);case"YYYY":return $.s(t.$y,4,"0");case"M":return s+1;case"MM":return $.s(s+1,2,"0");case"MMM":return _(n.monthsShort,s,d,3);case"MMMM":return _(d,s);case"D":return t.$D;case"DD":return $.s(t.$D,2,"0");case"d":return String(t.$W);case"dd":return _(n.weekdaysMin,t.$W,l,2);case"ddd":return _(n.weekdaysShort,t.$W,l,3);case"dddd":return l[t.$W];case"H":return String(r);case"HH":return $.s(r,2,"0");case"h":return h(1);case"hh":return h(2);case"a":return m(r,o,!0);case"A":return m(r,o,!1);case"m":return String(o);case"mm":return $.s(o,2,"0");case"s":return String(t.$s);case"ss":return $.s(t.$s,2,"0");case"SSS":return $.s(t.$ms,3,"0");case"Z":return i}return null}(e)||i.replace(":","")}))},f.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},f.diff=function(a,h,u){var m,p=this,g=$.p(h),f=k(a),y=(f.utcOffset()-this.utcOffset())*t,v=this-f,w=function(){return $.m(p,f)};switch(g){case _:m=w()/12;break;case d:m=w();break;case c:m=w()/3;break;case l:m=(v-y)/6048e5;break;case s:m=(v-y)/864e5;break;case o:m=v/n;break;case r:m=v/t;break;case i:m=v/e;break;default:m=v}return u?m:$.a(m)},f.daysInMonth=function(){return this.endOf(d).$D},f.$locale=function(){return w[this.$L]},f.locale=function(e,t){if(!e)return this.$L;var n=this.clone(),a=T(e,t,!0);return a&&(n.$L=a),n},f.clone=function(){return $.w(this.$d,this)},f.toDate=function(){return new Date(this.valueOf())},f.toJSON=function(){return this.isValid()?this.toISOString():null},f.toISOString=function(){return this.$d.toISOString()},f.toString=function(){return this.$d.toUTCString()},g}(),x=D.prototype;return k.prototype=x,[["$ms",a],["$s",i],["$m",r],["$H",o],["$W",s],["$M",d],["$y",_],["$D",h]].forEach((function(e){x[e[1]]=function(t){return this.$g(t,e[0],e[1])}})),k.extend=function(e,t){return e.$i||(e(t,D,k),e.$i=!0),k},k.locale=T,k.isDayjs=M,k.unix=function(e){return k(1e3*e)},k.en=w[v],k.Ls=w,k.p={},k}()),jt.exports}var zt,Et=Lt(Ht()),Ot={exports:{}};var At,Ft=(zt||(zt=1,Ot.exports=function(e,t,n){e=e||{};var a=t.prototype,i={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function r(e,t,n,i){return a.fromToBase(e,t,n,i)}n.en.relativeTime=i,a.fromToBase=function(t,a,r,o,s){for(var l,d,c,_=r.$locale().relativeTime||i,h=e.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],u=h.length,m=0;m<u;m+=1){var p=h[m];p.d&&(l=o?n(t).diff(r,p.d,!0):r.diff(t,p.d,!0));var g=(e.rounding||Math.round)(Math.abs(l));if(c=l>0,g<=p.r||!p.r){g<=1&&m>0&&(p=h[m-1]);var f=_[p.l];s&&(g=s(""+g)),d="string"==typeof f?f.replace("%d",g):f(g,a,p.l,c);break}}if(a)return d;var y=c?_.future:_.past;return"function"==typeof y?y(d):y.replace("%s",d)},a.to=function(e,t){return r(e,t,this,!0)},a.from=function(e,t){return r(e,t,this)};var o=function(e){return e.$u?n.utc():n()};a.toNow=function(e){return this.to(o(this),e)},a.fromNow=function(e){return this.from(o(this),e)}}),Ot.exports),Pt=Lt(Ft),Vt={exports:{}};At||(At=1,Vt.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"ca",weekdays:"Diumenge_Dilluns_Dimarts_Dimecres_Dijous_Divendres_Dissabte".split("_"),weekdaysShort:"Dg._Dl._Dt._Dc._Dj._Dv._Ds.".split("_"),weekdaysMin:"Dg_Dl_Dt_Dc_Dj_Dv_Ds".split("_"),months:"Gener_Febrer_Març_Abril_Maig_Juny_Juliol_Agost_Setembre_Octubre_Novembre_Desembre".split("_"),monthsShort:"Gen._Febr._Març_Abr._Maig_Juny_Jul._Ag._Set._Oct._Nov._Des.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM [de] YYYY",LLL:"D MMMM [de] YYYY [a les] H:mm",LLLL:"dddd D MMMM [de] YYYY [a les] H:mm",ll:"D MMM YYYY",lll:"D MMM YYYY, H:mm",llll:"ddd D MMM YYYY, H:mm"},relativeTime:{future:"d'aquí %s",past:"fa %s",s:"uns segons",m:"un minut",mm:"%d minuts",h:"una hora",hh:"%d hores",d:"un dia",dd:"%d dies",M:"un mes",MM:"%d mesos",y:"un any",yy:"%d anys"},ordinal:function(e){return e+(1===e||3===e?"r":2===e?"n":4===e?"t":"è")}};return n.default.locale(a,null,!0),a}(Ht()));var Nt,It={exports:{}};Nt||(Nt=1,It.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function a(e){return e>1&&e<5&&1!=~~(e/10)}function i(e,t,n,i){var r=e+" ";switch(n){case"s":return t||i?"pár sekund":"pár sekundami";case"m":return t?"minuta":i?"minutu":"minutou";case"mm":return t||i?r+(a(e)?"minuty":"minut"):r+"minutami";case"h":return t?"hodina":i?"hodinu":"hodinou";case"hh":return t||i?r+(a(e)?"hodiny":"hodin"):r+"hodinami";case"d":return t||i?"den":"dnem";case"dd":return t||i?r+(a(e)?"dny":"dní"):r+"dny";case"M":return t||i?"měsíc":"měsícem";case"MM":return t||i?r+(a(e)?"měsíce":"měsíců"):r+"měsíci";case"y":return t||i?"rok":"rokem";case"yy":return t||i?r+(a(e)?"roky":"let"):r+"lety"}}var r={name:"cs",weekdays:"neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota".split("_"),weekdaysShort:"ne_po_út_st_čt_pá_so".split("_"),weekdaysMin:"ne_po_út_st_čt_pá_so".split("_"),months:"leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec".split("_"),monthsShort:"led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"za %s",past:"před %s",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i}};return n.default.locale(r,null,!0),r}(Ht()));var Wt,Ut={exports:{}};Wt||(Wt=1,Ut.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"da",weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"søn._man._tirs._ons._tors._fre._lør.".split("_"),weekdaysMin:"sø._ma._ti._on._to._fr._lø.".split("_"),months:"januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december".split("_"),monthsShort:"jan._feb._mar._apr._maj_juni_juli_aug._sept._okt._nov._dec.".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd [d.] D. MMMM YYYY [kl.] HH:mm"},relativeTime:{future:"om %s",past:"%s siden",s:"få sekunder",m:"et minut",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dage",M:"en måned",MM:"%d måneder",y:"et år",yy:"%d år"}};return n.default.locale(a,null,!0),a}(Ht()));var Jt,Rt={exports:{}};Jt||(Jt=1,Rt.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={s:"ein paar Sekunden",m:["eine Minute","einer Minute"],mm:"%d Minuten",h:["eine Stunde","einer Stunde"],hh:"%d Stunden",d:["ein Tag","einem Tag"],dd:["%d Tage","%d Tagen"],M:["ein Monat","einem Monat"],MM:["%d Monate","%d Monaten"],y:["ein Jahr","einem Jahr"],yy:["%d Jahre","%d Jahren"]};function i(e,t,n){var i=a[n];return Array.isArray(i)&&(i=i[t?0:1]),i.replace("%d",e)}var r={name:"de",weekdays:"Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),weekdaysShort:"So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),weekdaysMin:"So_Mo_Di_Mi_Do_Fr_Sa".split("_"),months:"Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),monthsShort:"Jan._Feb._März_Apr._Mai_Juni_Juli_Aug._Sept._Okt._Nov._Dez.".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,formats:{LTS:"HH:mm:ss",LT:"HH:mm",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd, D. MMMM YYYY HH:mm"},relativeTime:{future:"in %s",past:"vor %s",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i}};return n.default.locale(r,null,!0),r}(Ht()));var Bt,qt={exports:{}};Bt||(Bt=1,qt.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"el",weekdays:"Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο".split("_"),weekdaysShort:"Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ".split("_"),weekdaysMin:"Κυ_Δε_Τρ_Τε_Πε_Πα_Σα".split("_"),months:"Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος".split("_"),monthsShort:"Ιαν_Φεβ_Μαρ_Απρ_Μαι_Ιουν_Ιουλ_Αυγ_Σεπτ_Οκτ_Νοε_Δεκ".split("_"),ordinal:function(e){return e},weekStart:1,relativeTime:{future:"σε %s",past:"πριν %s",s:"μερικά δευτερόλεπτα",m:"ένα λεπτό",mm:"%d λεπτά",h:"μία ώρα",hh:"%d ώρες",d:"μία μέρα",dd:"%d μέρες",M:"ένα μήνα",MM:"%d μήνες",y:"ένα χρόνο",yy:"%d χρόνια"},formats:{LT:"h:mm A",LTS:"h:mm:ss A",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY h:mm A",LLLL:"dddd, D MMMM YYYY h:mm A"}};return n.default.locale(a,null,!0),a}(Ht()));var Kt,Zt={exports:{}};Kt||(Kt=1,Zt.exports={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],n=e%100;return"["+e+(t[(n-20)%10]||t[n]||t[0])+"]"}});var Gt,Qt={exports:{}};Gt||(Gt=1,Qt.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"es",monthsShort:"ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),weekdays:"domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),weekdaysShort:"dom._lun._mar._mié._jue._vie._sáb.".split("_"),weekdaysMin:"do_lu_ma_mi_ju_vi_sá".split("_"),months:"enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY H:mm",LLLL:"dddd, D [de] MMMM [de] YYYY H:mm"},relativeTime:{future:"en %s",past:"hace %s",s:"unos segundos",m:"un minuto",mm:"%d minutos",h:"una hora",hh:"%d horas",d:"un día",dd:"%d días",M:"un mes",MM:"%d meses",y:"un año",yy:"%d años"},ordinal:function(e){return e+"º"}};return n.default.locale(a,null,!0),a}(Ht()));var Xt,en={exports:{}};Xt||(Xt=1,en.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function a(e,t,n,a){var i={s:"muutama sekunti",m:"minuutti",mm:"%d minuuttia",h:"tunti",hh:"%d tuntia",d:"päivä",dd:"%d päivää",M:"kuukausi",MM:"%d kuukautta",y:"vuosi",yy:"%d vuotta",numbers:"nolla_yksi_kaksi_kolme_neljä_viisi_kuusi_seitsemän_kahdeksan_yhdeksän".split("_")},r={s:"muutaman sekunnin",m:"minuutin",mm:"%d minuutin",h:"tunnin",hh:"%d tunnin",d:"päivän",dd:"%d päivän",M:"kuukauden",MM:"%d kuukauden",y:"vuoden",yy:"%d vuoden",numbers:"nollan_yhden_kahden_kolmen_neljän_viiden_kuuden_seitsemän_kahdeksan_yhdeksän".split("_")},o=a&&!t?r:i,s=o[n];return e<10?s.replace("%d",o.numbers[e]):s.replace("%d",e)}var i={name:"fi",weekdays:"sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),weekdaysShort:"su_ma_ti_ke_to_pe_la".split("_"),weekdaysMin:"su_ma_ti_ke_to_pe_la".split("_"),months:"tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),monthsShort:"tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,relativeTime:{future:"%s päästä",past:"%s sitten",s:a,m:a,mm:a,h:a,hh:a,d:a,dd:a,M:a,MM:a,y:a,yy:a},formats:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD.MM.YYYY",LL:"D. MMMM[ta] YYYY",LLL:"D. MMMM[ta] YYYY, [klo] HH.mm",LLLL:"dddd, D. MMMM[ta] YYYY, [klo] HH.mm",l:"D.M.YYYY",ll:"D. MMM YYYY",lll:"D. MMM YYYY, [klo] HH.mm",llll:"ddd, D. MMM YYYY, [klo] HH.mm"}};return n.default.locale(i,null,!0),i}(Ht()));var tn,nn={exports:{}};tn||(tn=1,nn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"fr",weekdays:"dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),weekdaysShort:"dim._lun._mar._mer._jeu._ven._sam.".split("_"),weekdaysMin:"di_lu_ma_me_je_ve_sa".split("_"),months:"janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),monthsShort:"janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"dans %s",past:"il y a %s",s:"quelques secondes",m:"une minute",mm:"%d minutes",h:"une heure",hh:"%d heures",d:"un jour",dd:"%d jours",M:"un mois",MM:"%d mois",y:"un an",yy:"%d ans"},ordinal:function(e){return e+(1===e?"er":"")}};return n.default.locale(a,null,!0),a}(Ht()));var an,rn={exports:{}};an||(an=1,rn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={s:"מספר שניות",ss:"%d שניות",m:"דקה",mm:"%d דקות",h:"שעה",hh:"%d שעות",hh2:"שעתיים",d:"יום",dd:"%d ימים",dd2:"יומיים",M:"חודש",MM:"%d חודשים",MM2:"חודשיים",y:"שנה",yy:"%d שנים",yy2:"שנתיים"};function i(e,t,n){return(a[n+(2===e?"2":"")]||a[n]).replace("%d",e)}var r={name:"he",weekdays:"ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת".split("_"),weekdaysShort:"א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳".split("_"),weekdaysMin:"א׳_ב׳_ג׳_ד׳_ה׳_ו_ש׳".split("_"),months:"ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר".split("_"),monthsShort:"ינו_פבר_מרץ_אפר_מאי_יונ_יול_אוג_ספט_אוק_נוב_דצמ".split("_"),relativeTime:{future:"בעוד %s",past:"לפני %s",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i},ordinal:function(e){return e},format:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [ב]MMMM YYYY",LLL:"D [ב]MMMM YYYY HH:mm",LLLL:"dddd, D [ב]MMMM YYYY HH:mm",l:"D/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [ב]MMMM YYYY",LLL:"D [ב]MMMM YYYY HH:mm",LLLL:"dddd, D [ב]MMMM YYYY HH:mm",l:"D/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"}};return n.default.locale(r,null,!0),r}(Ht()));var on,sn={exports:{}};on||(on=1,sn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a="siječnja_veljače_ožujka_travnja_svibnja_lipnja_srpnja_kolovoza_rujna_listopada_studenoga_prosinca".split("_"),i="siječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),r=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/,o=function(e,t){return r.test(t)?a[e.month()]:i[e.month()]};o.s=i,o.f=a;var s={name:"hr",weekdays:"nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),weekdaysShort:"ned._pon._uto._sri._čet._pet._sub.".split("_"),weekdaysMin:"ne_po_ut_sr_če_pe_su".split("_"),months:o,monthsShort:"sij._velj._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},relativeTime:{future:"za %s",past:"prije %s",s:"sekunda",m:"minuta",mm:"%d minuta",h:"sat",hh:"%d sati",d:"dan",dd:"%d dana",M:"mjesec",MM:"%d mjeseci",y:"godina",yy:"%d godine"},ordinal:function(e){return e+"."}};return n.default.locale(s,null,!0),s}(Ht()));var ln,dn={exports:{}};ln||(ln=1,dn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"hu",weekdays:"vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat".split("_"),weekdaysShort:"vas_hét_kedd_sze_csüt_pén_szo".split("_"),weekdaysMin:"v_h_k_sze_cs_p_szo".split("_"),months:"január_február_március_április_május_június_július_augusztus_szeptember_október_november_december".split("_"),monthsShort:"jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"%s múlva",past:"%s",s:function(e,t,n,a){return"néhány másodperc"+(a||t?"":"e")},m:function(e,t,n,a){return"egy perc"+(a||t?"":"e")},mm:function(e,t,n,a){return e+" perc"+(a||t?"":"e")},h:function(e,t,n,a){return"egy "+(a||t?"óra":"órája")},hh:function(e,t,n,a){return e+" "+(a||t?"óra":"órája")},d:function(e,t,n,a){return"egy "+(a||t?"nap":"napja")},dd:function(e,t,n,a){return e+" "+(a||t?"nap":"napja")},M:function(e,t,n,a){return"egy "+(a||t?"hónap":"hónapja")},MM:function(e,t,n,a){return e+" "+(a||t?"hónap":"hónapja")},y:function(e,t,n,a){return"egy "+(a||t?"év":"éve")},yy:function(e,t,n,a){return e+" "+(a||t?"év":"éve")}},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"YYYY.MM.DD.",LL:"YYYY. MMMM D.",LLL:"YYYY. MMMM D. H:mm",LLLL:"YYYY. MMMM D., dddd H:mm"}};return n.default.locale(a,null,!0),a}(Ht()));var cn,_n={exports:{}};cn||(cn=1,_n.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={s:["nokkrar sekúndur","nokkrar sekúndur","nokkrum sekúndum"],m:["mínúta","mínútu","mínútu"],mm:["mínútur","mínútur","mínútum"],h:["klukkustund","klukkustund","klukkustund"],hh:["klukkustundir","klukkustundir","klukkustundum"],d:["dagur","dag","degi"],dd:["dagar","daga","dögum"],M:["mánuður","mánuð","mánuði"],MM:["mánuðir","mánuði","mánuðum"],y:["ár","ár","ári"],yy:["ár","ár","árum"]};function i(e,t,n,i){var r=function(e,t,n,i){var r=i?0:n?1:2,o=2===e.length&&t%10==1?e[0]:e,s=a[o][r];return 1===e.length?s:"%d "+s}(n,e,i,t);return r.replace("%d",e)}var r={name:"is",weekdays:"sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur".split("_"),months:"janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember".split("_"),weekStart:1,weekdaysShort:"sun_mán_þri_mið_fim_fös_lau".split("_"),monthsShort:"jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des".split("_"),weekdaysMin:"Su_Má_Þr_Mi_Fi_Fö_La".split("_"),ordinal:function(e){return e},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H:mm",LLLL:"dddd, D. MMMM YYYY [kl.] H:mm"},relativeTime:{future:"eftir %s",past:"fyrir %s síðan",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i}};return n.default.locale(r,null,!0),r}(Ht()));var hn,un={exports:{}};hn||(hn=1,un.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"it",weekdays:"domenica_lunedì_martedì_mercoledì_giovedì_venerdì_sabato".split("_"),weekdaysShort:"dom_lun_mar_mer_gio_ven_sab".split("_"),weekdaysMin:"do_lu_ma_me_gi_ve_sa".split("_"),months:"gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre".split("_"),weekStart:1,monthsShort:"gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic".split("_"),formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"tra %s",past:"%s fa",s:"qualche secondo",m:"un minuto",mm:"%d minuti",h:"un' ora",hh:"%d ore",d:"un giorno",dd:"%d giorni",M:"un mese",MM:"%d mesi",y:"un anno",yy:"%d anni"},ordinal:function(e){return e+"º"}};return n.default.locale(a,null,!0),a}(Ht()));var mn,pn={exports:{}};mn||(mn=1,pn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"nb",weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"sø._ma._ti._on._to._fr._lø.".split("_"),weekdaysMin:"sø_ma_ti_on_to_fr_lø".split("_"),months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] HH:mm",LLLL:"dddd D. MMMM YYYY [kl.] HH:mm"},relativeTime:{future:"om %s",past:"%s siden",s:"noen sekunder",m:"ett minutt",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dager",M:"en måned",MM:"%d måneder",y:"ett år",yy:"%d år"}};return n.default.locale(a,null,!0),a}(Ht()));var gn,fn={exports:{}};gn||(gn=1,fn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"nl",weekdays:"zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),weekdaysShort:"zo._ma._di._wo._do._vr._za.".split("_"),weekdaysMin:"zo_ma_di_wo_do_vr_za".split("_"),months:"januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_"),ordinal:function(e){return"["+e+(1===e||8===e||e>=20?"ste":"de")+"]"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD-MM-YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"over %s",past:"%s geleden",s:"een paar seconden",m:"een minuut",mm:"%d minuten",h:"een uur",hh:"%d uur",d:"een dag",dd:"%d dagen",M:"een maand",MM:"%d maanden",y:"een jaar",yy:"%d jaar"}};return n.default.locale(a,null,!0),a}(Ht()));var yn,vn={exports:{}};yn||(yn=1,vn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"nn",weekdays:"sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),weekdaysShort:"sun_mån_tys_ons_tor_fre_lau".split("_"),weekdaysMin:"su_må_ty_on_to_fr_la".split("_"),months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"om %s",past:"for %s sidan",s:"nokre sekund",m:"eitt minutt",mm:"%d minutt",h:"ein time",hh:"%d timar",d:"ein dag",dd:"%d dagar",M:"ein månad",MM:"%d månadar",y:"eitt år",yy:"%d år"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H:mm",LLLL:"dddd D. MMMM YYYY [kl.] HH:mm"}};return n.default.locale(a,null,!0),a}(Ht()));var wn,bn={exports:{}};wn||(wn=1,bn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function a(e){return e%10<5&&e%10>1&&~~(e/10)%10!=1}function i(e,t,n){var i=e+" ";switch(n){case"m":return t?"minuta":"minutę";case"mm":return i+(a(e)?"minuty":"minut");case"h":return t?"godzina":"godzinę";case"hh":return i+(a(e)?"godziny":"godzin");case"MM":return i+(a(e)?"miesiące":"miesięcy");case"yy":return i+(a(e)?"lata":"lat")}}var r="stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia".split("_"),o="styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień".split("_"),s=/D MMMM/,l=function(e,t){return s.test(t)?r[e.month()]:o[e.month()]};l.s=o,l.f=r;var d={name:"pl",weekdays:"niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota".split("_"),weekdaysShort:"ndz_pon_wt_śr_czw_pt_sob".split("_"),weekdaysMin:"Nd_Pn_Wt_Śr_Cz_Pt_So".split("_"),months:l,monthsShort:"sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,relativeTime:{future:"za %s",past:"%s temu",s:"kilka sekund",m:i,mm:i,h:i,hh:i,d:"1 dzień",dd:"%d dni",M:"miesiąc",MM:i,y:"rok",yy:i},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"}};return n.default.locale(d,null,!0),d}(Ht()));var Mn,Tn={exports:{}};Mn||(Mn=1,Tn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"pt",weekdays:"domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split("_"),weekdaysShort:"dom_seg_ter_qua_qui_sex_sab".split("_"),weekdaysMin:"Do_2ª_3ª_4ª_5ª_6ª_Sa".split("_"),months:"janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),monthsShort:"jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),ordinal:function(e){return e+"º"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY [às] HH:mm",LLLL:"dddd, D [de] MMMM [de] YYYY [às] HH:mm"},relativeTime:{future:"em %s",past:"há %s",s:"alguns segundos",m:"um minuto",mm:"%d minutos",h:"uma hora",hh:"%d horas",d:"um dia",dd:"%d dias",M:"um mês",MM:"%d meses",y:"um ano",yy:"%d anos"}};return n.default.locale(a,null,!0),a}(Ht()));var kn,$n={exports:{}};kn||(kn=1,$n.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"ro",weekdays:"Duminică_Luni_Marți_Miercuri_Joi_Vineri_Sâmbătă".split("_"),weekdaysShort:"Dum_Lun_Mar_Mie_Joi_Vin_Sâm".split("_"),weekdaysMin:"Du_Lu_Ma_Mi_Jo_Vi_Sâ".split("_"),months:"Ianuarie_Februarie_Martie_Aprilie_Mai_Iunie_Iulie_August_Septembrie_Octombrie_Noiembrie_Decembrie".split("_"),monthsShort:"Ian._Febr._Mart._Apr._Mai_Iun._Iul._Aug._Sept._Oct._Nov._Dec.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},relativeTime:{future:"peste %s",past:"acum %s",s:"câteva secunde",m:"un minut",mm:"%d minute",h:"o oră",hh:"%d ore",d:"o zi",dd:"%d zile",M:"o lună",MM:"%d luni",y:"un an",yy:"%d ani"},ordinal:function(e){return e}};return n.default.locale(a,null,!0),a}(Ht()));var Dn,xn={exports:{}};Dn||(Dn=1,xn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a="января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_"),i="январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),r="янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.".split("_"),o="янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.".split("_"),s=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;function l(e,t,n){var a,i;return"m"===n?t?"минута":"минуту":e+" "+(a=+e,i={mm:t?"минута_минуты_минут":"минуту_минуты_минут",hh:"час_часа_часов",dd:"день_дня_дней",MM:"месяц_месяца_месяцев",yy:"год_года_лет"}[n].split("_"),a%10==1&&a%100!=11?i[0]:a%10>=2&&a%10<=4&&(a%100<10||a%100>=20)?i[1]:i[2])}var d=function(e,t){return s.test(t)?a[e.month()]:i[e.month()]};d.s=i,d.f=a;var c=function(e,t){return s.test(t)?r[e.month()]:o[e.month()]};c.s=o,c.f=r;var _={name:"ru",weekdays:"воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split("_"),weekdaysShort:"вск_пнд_втр_срд_чтв_птн_сбт".split("_"),weekdaysMin:"вс_пн_вт_ср_чт_пт_сб".split("_"),months:d,monthsShort:c,weekStart:1,yearStart:4,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY г.",LLL:"D MMMM YYYY г., H:mm",LLLL:"dddd, D MMMM YYYY г., H:mm"},relativeTime:{future:"через %s",past:"%s назад",s:"несколько секунд",m:l,mm:l,h:"час",hh:l,d:"день",dd:l,M:"месяц",MM:l,y:"год",yy:l},ordinal:function(e){return e},meridiem:function(e){return e<4?"ночи":e<12?"утра":e<17?"дня":"вечера"}};return n.default.locale(_,null,!0),_}(Ht()));var Sn,Yn={exports:{}};Sn||(Sn=1,Yn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function a(e){return e>1&&e<5&&1!=~~(e/10)}function i(e,t,n,i){var r=e+" ";switch(n){case"s":return t||i?"pár sekúnd":"pár sekundami";case"m":return t?"minúta":i?"minútu":"minútou";case"mm":return t||i?r+(a(e)?"minúty":"minút"):r+"minútami";case"h":return t?"hodina":i?"hodinu":"hodinou";case"hh":return t||i?r+(a(e)?"hodiny":"hodín"):r+"hodinami";case"d":return t||i?"deň":"dňom";case"dd":return t||i?r+(a(e)?"dni":"dní"):r+"dňami";case"M":return t||i?"mesiac":"mesiacom";case"MM":return t||i?r+(a(e)?"mesiace":"mesiacov"):r+"mesiacmi";case"y":return t||i?"rok":"rokom";case"yy":return t||i?r+(a(e)?"roky":"rokov"):r+"rokmi"}}var r={name:"sk",weekdays:"nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota".split("_"),weekdaysShort:"ne_po_ut_st_št_pi_so".split("_"),weekdaysMin:"ne_po_ut_st_št_pi_so".split("_"),months:"január_február_marec_apríl_máj_jún_júl_august_september_október_november_december".split("_"),monthsShort:"jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"za %s",past:"pred %s",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i}};return n.default.locale(r,null,!0),r}(Ht()));var Ln,Cn={exports:{}};Ln||(Ln=1,Cn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e);function a(e){return e%100==2}function i(e){return e%100==3||e%100==4}function r(e,t,n,r){var o=e+" ";switch(n){case"s":return t||r?"nekaj sekund":"nekaj sekundami";case"m":return t?"ena minuta":"eno minuto";case"mm":return a(e)?o+(t||r?"minuti":"minutama"):i(e)?o+(t||r?"minute":"minutami"):o+(t||r?"minut":"minutami");case"h":return t?"ena ura":"eno uro";case"hh":return a(e)?o+(t||r?"uri":"urama"):i(e)?o+(t||r?"ure":"urami"):o+(t||r?"ur":"urami");case"d":return t||r?"en dan":"enim dnem";case"dd":return a(e)?o+(t||r?"dneva":"dnevoma"):o+(t||r?"dni":"dnevi");case"M":return t||r?"en mesec":"enim mesecem";case"MM":return a(e)?o+(t||r?"meseca":"mesecema"):i(e)?o+(t||r?"mesece":"meseci"):o+(t||r?"mesecev":"meseci");case"y":return t||r?"eno leto":"enim letom";case"yy":return a(e)?o+(t||r?"leti":"letoma"):i(e)?o+(t||r?"leta":"leti"):o+(t||r?"let":"leti")}}var o={name:"sl",weekdays:"nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota".split("_"),months:"januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),weekStart:1,weekdaysShort:"ned._pon._tor._sre._čet._pet._sob.".split("_"),monthsShort:"jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),weekdaysMin:"ne_po_to_sr_če_pe_so".split("_"),ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"čez %s",past:"pred %s",s:r,m:r,mm:r,h:r,hh:r,d:r,dd:r,M:r,MM:r,y:r,yy:r}};return n.default.locale(o,null,!0),o}(Ht()));var jn,Hn={exports:{}};jn||(jn=1,Hn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"sv",weekdays:"söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),weekdaysShort:"sön_mån_tis_ons_tor_fre_lör".split("_"),weekdaysMin:"sö_må_ti_on_to_fr_lö".split("_"),months:"januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),weekStart:1,yearStart:4,ordinal:function(e){var t=e%10;return"["+e+(1===t||2===t?"a":"e")+"]"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"D MMMM YYYY",LLL:"D MMMM YYYY [kl.] HH:mm",LLLL:"dddd D MMMM YYYY [kl.] HH:mm",lll:"D MMM YYYY HH:mm",llll:"ddd D MMM YYYY HH:mm"},relativeTime:{future:"om %s",past:"för %s sedan",s:"några sekunder",m:"en minut",mm:"%d minuter",h:"en timme",hh:"%d timmar",d:"en dag",dd:"%d dagar",M:"en månad",MM:"%d månader",y:"ett år",yy:"%d år"}};return n.default.locale(a,null,!0),a}(Ht()));var zn,En={exports:{}};zn||(zn=1,En.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"th",weekdays:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),weekdaysShort:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"),weekdaysMin:"อา._จ._อ._พ._พฤ._ศ._ส.".split("_"),months:"มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),monthsShort:"ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.".split("_"),formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY เวลา H:mm",LLLL:"วันddddที่ D MMMM YYYY เวลา H:mm"},relativeTime:{future:"อีก %s",past:"%sที่แล้ว",s:"ไม่กี่วินาที",m:"1 นาที",mm:"%d นาที",h:"1 ชั่วโมง",hh:"%d ชั่วโมง",d:"1 วัน",dd:"%d วัน",M:"1 เดือน",MM:"%d เดือน",y:"1 ปี",yy:"%d ปี"},ordinal:function(e){return e+"."}};return n.default.locale(a,null,!0),a}(Ht()));var On,An={exports:{}};On||(On=1,An.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a="січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня".split("_"),i="січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень".split("_"),r=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;function o(e,t,n){var a,i;return"m"===n?t?"хвилина":"хвилину":"h"===n?t?"година":"годину":e+" "+(a=+e,i={ss:t?"секунда_секунди_секунд":"секунду_секунди_секунд",mm:t?"хвилина_хвилини_хвилин":"хвилину_хвилини_хвилин",hh:t?"година_години_годин":"годину_години_годин",dd:"день_дні_днів",MM:"місяць_місяці_місяців",yy:"рік_роки_років"}[n].split("_"),a%10==1&&a%100!=11?i[0]:a%10>=2&&a%10<=4&&(a%100<10||a%100>=20)?i[1]:i[2])}var s=function(e,t){return r.test(t)?a[e.month()]:i[e.month()]};s.s=i,s.f=a;var l={name:"uk",weekdays:"неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота".split("_"),weekdaysShort:"ндл_пнд_втр_срд_чтв_птн_сбт".split("_"),weekdaysMin:"нд_пн_вт_ср_чт_пт_сб".split("_"),months:s,monthsShort:"січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд".split("_"),weekStart:1,relativeTime:{future:"за %s",past:"%s тому",s:"декілька секунд",m:o,mm:o,h:o,hh:o,d:"день",dd:o,M:"місяць",MM:o,y:"рік",yy:o},ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY р.",LLL:"D MMMM YYYY р., HH:mm",LLLL:"dddd, D MMMM YYYY р., HH:mm"}};return n.default.locale(l,null,!0),l}(Ht()));var Fn,Pn={exports:{}};Fn||(Fn=1,Pn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"vi",weekdays:"chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy".split("_"),months:"tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split("_"),weekStart:1,weekdaysShort:"CN_T2_T3_T4_T5_T6_T7".split("_"),monthsShort:"Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),weekdaysMin:"CN_T2_T3_T4_T5_T6_T7".split("_"),ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM [năm] YYYY",LLL:"D MMMM [năm] YYYY HH:mm",LLLL:"dddd, D MMMM [năm] YYYY HH:mm",l:"DD/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"},relativeTime:{future:"%s tới",past:"%s trước",s:"vài giây",m:"một phút",mm:"%d phút",h:"một giờ",hh:"%d giờ",d:"một ngày",dd:"%d ngày",M:"một tháng",MM:"%d tháng",y:"một năm",yy:"%d năm"}};return n.default.locale(a,null,!0),a}(Ht()));var Vn,Nn={exports:{}};Vn||(Vn=1,Nn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"zh-cn",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"周日_周一_周二_周三_周四_周五_周六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(e,t){return"W"===t?e+"周":e+"日"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日Ah点mm分",LLLL:"YYYY年M月D日ddddAh点mm分",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s内",past:"%s前",s:"几秒",m:"1 分钟",mm:"%d 分钟",h:"1 小时",hh:"%d 小时",d:"1 天",dd:"%d 天",M:"1 个月",MM:"%d 个月",y:"1 年",yy:"%d 年"},meridiem:function(e,t){var n=100*e+t;return n<600?"凌晨":n<900?"早上":n<1100?"上午":n<1300?"中午":n<1800?"下午":"晚上"}};return n.default.locale(a,null,!0),a}(Ht()));var In,Wn={exports:{}};function Un(e,t,n,a){const i=!e.start.dateTime;let r,o;i?(r=qn(e.start.date||""),o=qn(e.end.date||"")):(r=new Date(e.start.dateTime||""),o=new Date(e.end.dateTime||""));const s=Tt(n);if(i){const e=new Date(o);return e.setDate(e.getDate()-1),r.toDateString()!==e.toDateString()?Bn(function(e,t,n){const a=new Date,i=new Date(a.getFullYear(),a.getMonth(),a.getDate()),r=new Date(i);if(r.setDate(r.getDate()+1),e.toDateString()===i.toDateString())return`${n.allDay}, ${n.endsToday}`;if(e.toDateString()===r.toDateString())return`${n.allDay}, ${n.endsTomorrow}`;const o=e.getDate(),s=n.months[e.getMonth()];switch(kt(t)){case"day-dot-month":return`${n.allDay}, ${n.multiDay} ${o}. ${s}`;case"month-day":return`${n.allDay}, ${n.multiDay} ${s} ${o}`;default:return`${n.allDay}, ${n.multiDay} ${o} ${s}`}}(e,n,s)):Bn(s.allDay)}const l=!("system"!==t.time_24h||!(null==a?void 0:a.locale)),d=!0===t.time_24h;return r.toDateString()!==o.toDateString()?Bn(function(e,t,n,a,i,r=!0,o){const s=new Date,l=new Date(s.getFullYear(),s.getMonth(),s.getDate()),d=new Date(l);d.setDate(d.getDate()+1);const c=e=>{if(i&&(null==o?void 0:o.locale)){return Zn(e,xt(o.locale,r))}return Zn(e,r)};let _;if(t.toDateString()===l.toDateString())_=`${a.endsToday} ${a.at} ${c(t)}`;else if(t.toDateString()===d.toDateString())_=`${a.endsTomorrow} ${a.at} ${c(t)}`;else{const e=t.getDate(),i=a.months[t.getMonth()],r=a.fullDaysOfWeek[t.getDay()],o=c(t);switch(kt(n)){case"day-dot-month":_=`${r}, ${e}. ${i} ${a.at} ${o}`;break;case"month-day":_=`${r}, ${i} ${e} ${a.at} ${o}`;break;default:_=`${r}, ${e} ${i} ${a.at} ${o}`}}if(l.getTime()<=e.getTime()){return`${c(e)} ${a.multiDay} ${_}`}return t.toDateString()===l.toDateString()||t.toDateString()===d.toDateString()?_:`${a.multiDay} ${_}`}(r,o,n,s,l,d,a)):Bn(function(e,t,n,a,i=!0,r){if(a&&(null==r?void 0:r.locale)){const a=xt(r.locale,i);return n?`${Zn(e,a)} - ${Zn(t,a)}`:Zn(e,a)}return n?`${Zn(e,i)} - ${Zn(t,i)}`:Zn(e,i)}(r,o,t.show_end_time,l,d,a))}function Jn(e,t="en"){if(e._isEmptyDay||!e.start)return null;const n=new Date,a=e.start.dateTime?new Date(e.start.dateTime):e.start.date?qn(e.start.date):null;return!a||a<=n?null:function(e,t){const n=function(e){const t=e.toLowerCase();if("zh-cn"===t||"zh-tw"===t)return t;const n=t.split("-")[0];return["cs","da","de","el","en","es","fi","fr","he","hr","hu","is","it","nb","nl","nn","pl","pt","ru","sk","sl","sv","th","uk","vi","zh-cn","zh-tw"].includes(n)?n:"en"}(t);return Et(e).locale(n).fromNow()}(a,t)}function Rn(e,t=!0){if(!e)return"";if(!1===t)return e;const n=e.trim();if("string"==typeof t&&"true"!==t){const e=new RegExp(`(${t})\\s*$`,"i");return n.replace(e,"").replace(/,?\s*$/,"")}for(const e of Pe)if(n.endsWith(e))return n.slice(0,n.length-e.length).replace(/,?\s*$/,"");return n}function Bn(e){return e&&0!==e.length?e.charAt(0).toUpperCase()+e.slice(1):e}function qn(e){const[t,n,a]=e.split("-").map(Number);return new Date(t,n-1,a)}function Kn(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Zn(e,t=!0){let n=e.getHours();const a=e.getMinutes();if(!t){const e=n>=12?"PM":"AM";return n=n%12||12,`${n}:${a.toString().padStart(2,"0")} ${e}`}return`${n}:${a.toString().padStart(2,"0")}`}function Gn(e){const t=new Date(e);t.setDate(t.getDate()+4-(t.getDay()||7));const n=new Date(t.getFullYear(),0,1);return Math.ceil(((t.getTime()-n.getTime())/864e5+1)/7)}function Qn(e,t,n){const a=t||"iso";return"iso"===a?Gn(e):"simple"===a?function(e,t=0){const n=new Date(e),a=new Date(n.getFullYear(),0,1),i=Math.floor((n.getTime()-a.getTime())/864e5),r=(a.getDay()-t+7)%7;return Math.ceil((i+r+1)/7)}(e,n):null}In||(In=1,Wn.exports=function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"zh-tw",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"週日_週一_週二_週三_週四_週五_週六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(e,t){return"W"===t?e+"週":e+"日"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日 HH:mm",LLLL:"YYYY年M月D日dddd HH:mm",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s內",past:"%s前",s:"幾秒",m:"1 分鐘",mm:"%d 分鐘",h:"1 小時",hh:"%d 小時",d:"1 天",dd:"%d 天",M:"1 個月",MM:"%d 個月",y:"1 年",yy:"%d 年"},meridiem:function(e,t){var n=100*e+t;return n<600?"凌晨":n<900?"早上":n<1100?"上午":n<1300?"中午":n<1800?"下午":"晚上"}};return n.default.locale(a,null,!0),a}(Ht())),Et.extend(Pt);var Xn=Object.defineProperty,ea=Object.defineProperties,ta=Object.getOwnPropertyDescriptors,na=Object.getOwnPropertySymbols,aa=Object.prototype.hasOwnProperty,ia=Object.prototype.propertyIsEnumerable,ra=(e,t,n)=>t in e?Xn(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,oa=(e,t)=>{for(var n in t||(t={}))aa.call(t,n)&&ra(e,n,t[n]);if(na)for(var n of na(t))ia.call(t,n)&&ra(e,n,t[n]);return e},sa=(e,t)=>ea(e,ta(t));async function la(e,t,n,a=!1){const i=function(e,t,n,a,i,r=!1){const o=t.map((e=>"string"==typeof e?e:e.entity)).sort().join("_");let s="";if(i)try{s=i.includes("T")?i.split("T")[0]:i}catch(e){s=i}const l=s?`_${s}`:"",d=r?"_filtered":"",c=[];t.forEach((e=>{"string"!=typeof e&&(e.blocklist&&c.push(`b:${e.entity}:${e.blocklist}`),e.allowlist&&c.push(`a:${e.entity}:${e.allowlist}`))}));const _=c.length>0?`_filters:${encodeURIComponent(c.join("|"))}`:"";return`${Ye}${e}_${o}_${n}_${a?1:0}${l}${d}${_}${De}`}(n,t.entities,t.days_to_show,t.show_past_events,t.start_date,t.filter_duplicates),r=function(){if(window.performance&&window.performance.navigation)return 1===window.performance.navigation.type;if(window.performance&&window.performance.getEntriesByType){const e=window.performance.getEntriesByType("navigation");if(e.length>0&&"type"in e[0])return"reload"===e[0].type}return!1}();if(!a){const e=function(e,t,n=!1){const a=wa(e,t,n);if(a)return[...a.events];return null}(i,t,r);if(e)return tt(`Using ${e.length} events from cache`),[...e]}tt("Fetching events from API");const o=t.entities.map((e=>"string"==typeof e?{entity:e,color:"var(--primary-text-color)"}:e)),s=va(t.days_to_show,t.start_date),l=await async function(e,t,n){const a=[],i=new Set;for(const r of t)if(!i.has(r.entity))try{const t=`calendars/${r.entity}?start=${n.start.toISOString()}&end=${n.end.toISOString()}`;tt(`Fetching calendar events with path: ${t}`);const o=await e.callApi("GET",t);if(!o||!Array.isArray(o)){et(`Invalid response for ${r.entity}`);continue}const s=o.map((e=>sa(oa({},e),{_entityId:r.entity})));a.push(...s),i.add(r.entity)}catch(t){Xe(`Failed to fetch events for ${r.entity}:`,t);try{tt("Available hass API methods:",Object.keys(e).filter((t=>"function"==typeof e[t])))}catch(e){}}return a}(e,o,s);let d=function(e,t){const n=[],a=t.filter_duplicates?new Set:void 0;t.entities.forEach((i=>{const r="string"==typeof i?i:i.entity,o=e.filter((e=>e._entityId===r));if(0===o.length)return;let s=function(e,t){if("string"==typeof t)return[...e];let n=[...e];if(t.allowlist)try{const e=new RegExp(t.allowlist,"i");n=n.filter((t=>t.summary&&e.test(t.summary)))}catch(e){et(`Invalid allowlist pattern: ${t.allowlist}`,e)}else if(t.blocklist)try{const e=new RegExp(t.blocklist,"i");n=n.filter((t=>!(t.summary&&e.test(t.summary))))}catch(e){et(`Invalid blocklist pattern: ${t.blocklist}`,e)}return n}(o,i);s=s.filter((e=>{if(!a)return!0;const t=function(e){const t=e.summary||"",n=e.location||"";let a="";if(e.start.dateTime){a=`${new Date(e.start.dateTime).getTime()}|${e.end.dateTime?new Date(e.end.dateTime).getTime():0}`}else a=`${e.start.date||""}|${e.end.date||""}`;return`${t}|${a}|${n}`}(e);return!a.has(t)&&(a.add(t),!0)})),s.forEach((e=>{e._matchedConfig="object"==typeof i?i:void 0,e._entityLabel=ga(r,t,e)})),n.push(...s)}));const i=function(e,t){const n=[];for(const a of e){if(!ha(a,t)){n.push(a);continue}if(!_a(a)){n.push(a);continue}const e=ma(a);n.push(...e)}return n}(n,t);return nt(`Processed ${i.length} events after filtering and splitting`),i}(l,t);const c=ba(t),_=new Date(c);return _.setDate(_.getDate()+t.days_to_show),d=d.filter((e=>{if(!e.start)return!1;let t;if(e.start.dateTime)t=new Date(e.start.dateTime);else{if(!e.start.date)return!1;t=qn(e.start.date)}return t<_})),function(e,t){try{tt(`Caching ${t.length} events`);const n={events:t,timestamp:Date.now()};return localStorage.setItem(e,JSON.stringify(n)),null!==wa(e)}catch(e){return Xe("Failed to cache calendar events:",e),!1}}(i,d),d}function da(e,t,n,a){const i=ba(t),r=new Date(i),o=new Date(r);o.setHours(23,59,59,999);const s=new Date,l=e.filter((e=>{if(!(null==e?void 0:e.start)||!(null==e?void 0:e.end))return!1;const n=!e.start.dateTime;let a,i;if(n){if(a=e.start.date?qn(e.start.date):null,i=e.end.date?qn(e.end.date):null,i){const e=new Date(i);e.setDate(e.getDate()-1),i=e}}else a=e.start.dateTime?new Date(e.start.dateTime):null,i=e.end.dateTime?new Date(e.end.dateTime):null;if(!a||!i)return!1;return!!(a>=r&&a<=o||a>o||i>=r)&&!(!t.show_past_events&&!n&&i<s)})),d={};l.length>0&&l.forEach((e=>{var n;let i,o,s;if(!e.start.dateTime){if(i=e.start.date?qn(e.start.date):null,o=e.end.date?qn(e.end.date):null,o){const e=new Date(o);e.setDate(e.getDate()-1),o=e}}else i=e.start.dateTime?new Date(e.start.dateTime):null,o=e.end.dateTime?new Date(e.end.dateTime):null;if(!i||!o)return;s=i>=r?i:o.toDateString()===r.toDateString()||i<r&&o>r?r:i;const l=Kn(s),c=Tt(a);d[l]||(d[l]={weekday:c.daysOfWeek[s.getDay()],day:s.getDate(),month:c.months[s.getMonth()],timestamp:s.getTime(),events:[]}),d[l].events.push({summary:e.summary||"",time:Un(e,t,a),location:(null!=(n=fa(e._entityId,"show_location",t,e))?n:t.show_location)?Rn(e.location||"",t.remove_location_country):"",start:e.start,end:e.end,_entityId:e._entityId,_entityLabel:ga(e._entityId,t,e),_matchedConfig:e._matchedConfig,_isEmptyDay:e._isEmptyDay})}));const c=function(e,t="en"){if("sunday"===e)return 0;if("monday"===e)return 1;try{return/^en-(US|CA)|es-US/.test(t)?0:1}catch(e){return 1}}(t.first_day_of_week,a);Object.values(d).forEach((e=>{const n=new Date(e.timestamp);e.weekNumber=Ma(n,t,c),e.monthNumber=n.getMonth(),e.isFirstDayOfMonth=1===n.getDate(),e.isFirstDayOfWeek=n.getDay()===c})),Object.values(d).forEach((e=>{e.events.sort(((e,n)=>{const a=!e.start.dateTime,i=!n.start.dateTime;if(a&&!i)return-1;if(!a&&i)return 1;let r,o;if(r=a&&e.start.date?qn(e.start.date).getTime():e.start.dateTime?new Date(e.start.dateTime).getTime():0,o=i&&n.start.date?qn(n.start.date).getTime():n.start.dateTime?new Date(n.start.dateTime).getTime():0,a&&i&&r===o){const a=ca(e._entityId,t),i=ca(n._entityId,t);return a!==i?a-i:(e.summary||"").localeCompare(n.summary||"",void 0,{sensitivity:"base"})}return r-o}))}));const _=n?t.days_to_show:Math.min(t.compact_days_to_show||t.days_to_show,t.days_to_show);let h=Object.values(d).sort(((e,t)=>e.timestamp-t.timestamp)).slice(0,_||3);if(!n){const e=new Map;for(const n of h){const a=[];for(const i of n.events){if(i._isEmptyDay){a.push(i);continue}const n=i._entityId,r=i._matchedConfig;let o=-1;r?o=t.entities.findIndex((e=>"object"==typeof e&&e===r)):n&&(o=t.entities.findIndex((e=>"string"==typeof e&&e===n)));const s=-1!==o?`${n}__${o}`:n||"",l=null==r?void 0:r.compact_events_to_show;if(void 0===l){a.push(i);continue}const d=e.get(s)||0;d<l&&(a.push(i),e.set(s,d+1))}n.events=a}t.show_empty_days||(h=h.filter((e=>e.events.length>0&&!(1===e.events.length&&e.events[0]._isEmptyDay))))}if(!n){const e=t.compact_events_to_show;if(void 0!==e){let n=[],a=0;if(t.compact_events_complete_days){const t=new Set;for(const n of h)if((1!==n.events.length||!n.events[0]._isEmptyDay)&&a<e&&n.events.length>0){const i=Math.min(n.events.length,e-a);i>0&&(t.add(Kn(new Date(n.timestamp))),a+=i)}n=h.filter((e=>{const n=Kn(new Date(e.timestamp));return t.has(n)}))}else{n=[];for(const t of h){if(a>=e&&(1!==t.events.length||!t.events[0]._isEmptyDay))break;if(1===t.events.length&&t.events[0]._isEmptyDay){n.push(t);continue}const i=e-a;if(i>0&&t.events.length>0){const e=sa(oa({},t),{events:t.events.slice(0,i)});n.push(e),a+=e.events.length}}}h=n}}if(t.show_empty_days||0===h.length){const e=Tt(a),r=new Date(i);let o;if(n)o=new Date(i),o.setDate(o.getDate()+_-1);else if(0===h.length)t.show_empty_days?(o=new Date(i),o.setDate(o.getDate()+_-1)):o=new Date(i);else if(t.compact_days_to_show&&!t.compact_events_to_show)o=new Date(i),o.setDate(o.getDate()+_-1);else if(t.compact_events_to_show)if(h.length>0){const e=Math.max(...h.map((e=>e.timestamp)));o=new Date(e)}else o=new Date(i);else o=new Date(i),o.setDate(o.getDate()+_-1);const s=new Set(h.map((e=>Kn(new Date(e.timestamp))))),l=[...h],d=Math.floor((o.getTime()-r.getTime())/864e5);for(let n=0;n<=d;n++){const a=new Date(r);a.setDate(r.getDate()+n);const i=Kn(a);if(!s.has(i)){const n=Ma(a,t,c),r={weekday:e.daysOfWeek[a.getDay()],day:a.getDate(),month:e.months[a.getMonth()],timestamp:a.getTime(),events:[{summary:e.noEvents,start:{date:i},end:{date:i},_entityId:"_empty_day_",_isEmptyDay:!0,location:""}],weekNumber:n,monthNumber:a.getMonth(),isFirstDayOfMonth:1===a.getDate(),isFirstDayOfWeek:a.getDay()===c};l.push(r)}}l.sort(((e,t)=>e.timestamp-t.timestamp)),h=l}return h.slice(0,_)}function ca(e,t){if(!e)return Number.MAX_SAFE_INTEGER;const n=t.entities.findIndex((t=>"string"==typeof t?t===e:t.entity===e));return-1!==n?n:Number.MAX_SAFE_INTEGER}function _a(e){if(!e.start||!e.end)return!1;if(e.start.date&&e.end.date){const t=new Date(e.start.date),n=new Date(e.end.date);return n.setDate(n.getDate()-1),t.toDateString()!==n.toDateString()}if(e.start.dateTime&&e.end.dateTime){const t=new Date(e.start.dateTime),n=new Date(e.end.dateTime);return t.toDateString()!==n.toDateString()}return!1}function ha(e,t){return e._entityId&&e._matchedConfig&&void 0!==e._matchedConfig.split_multiday_events?e._matchedConfig.split_multiday_events:t.split_multiday_events}function ua(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function ma(e){const t=[];if(e.start.date&&e.end.date){const n=qn(e.start.date),a=qn(e.end.date);a.setDate(a.getDate()-1);for(let i=new Date(n);i<=a;i.setDate(i.getDate()+1)){const n=ua(i),a=new Date(i);a.setDate(a.getDate()+1);const r=ua(a),o=sa(oa({},e),{start:{date:n},end:{date:r}});t.push(o)}}else if(e.start.dateTime&&e.end.dateTime){const n=new Date(e.start.dateTime),a=new Date(e.end.dateTime),i=new Date(n);if(i.setHours(23,59,59,999),i<a){const r=sa(oa({},e),{start:{dateTime:n.toISOString()},end:{dateTime:i.toISOString()}});t.push(r);const o=new Date(n);o.setDate(o.getDate()+1),o.setHours(0,0,0,0);const s=new Date(a);s.setHours(0,0,0,0);for(let n=new Date(o);n<s;n.setDate(n.getDate()+1)){const a=ua(n),i=new Date(n);i.setDate(i.getDate()+1);const r=ua(i),o=sa(oa({},e),{start:{date:a},end:{date:r}});t.push(o)}const l=sa(oa({},e),{start:{dateTime:s.toISOString()},end:{dateTime:a.toISOString()}});t.push(l)}else t.push(oa({},e))}return t}function pa(e,t,n,a){if(!e)return"var(--calendar-card-line-color-vertical)";let i;i=a&&a._matchedConfig?a._matchedConfig:t.entities.find((t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e));const r="string"==typeof i?t.accent_color:(null==i?void 0:i.accent_color)||t.accent_color;return void 0===n||0===n||isNaN(n)?r:function(e,t){if(e.startsWith("var("))return`rgba(var(--calendar-color-rgb, 3, 169, 244), ${t/100})`;if("transparent"===e)return e;const n=document.createElement("div");n.style.display="none",n.style.color=e,document.body.appendChild(n);const a=getComputedStyle(n).color;if(document.body.removeChild(n),!a)return e;const i=a.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);if(i){const[,e,n,a]=i;return`rgba(${e}, ${n}, ${a}, ${t/100})`}const r=a.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)$/);if(r){const[,e,n,a]=r;return`rgba(${e}, ${n}, ${a}, ${t/100})`}return e}(r,n)}function ga(e,t,n){if(!e)return;if(n&&n._matchedConfig)return n._matchedConfig.label;const a=t.entities.find((t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e));return a&&"string"!=typeof a?a.label:void 0}function fa(e,t,n,a){if(!e)return;if(a&&a._matchedConfig)return a._matchedConfig[t];const i=n.entities.find((t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e));return i&&"string"!=typeof i?i[t]:void 0}function ya(e){if(!e||e._isEmptyDay)return!1;const t=new Date;if(!e.start.dateTime)return!1;const n=e.start.dateTime?new Date(e.start.dateTime):null,a=e.end.dateTime?new Date(e.end.dateTime):null;return!(!n||!a)&&(t>=n&&t<a)}function va(e,t){let n;if(t&&""!==t.trim())try{const e=function(e){const t=e.match(/^([+-])(\d+)$/);if(t){const e="+"===t[1]?1:-1,n=parseInt(t[2],10);if(!isNaN(n)){const t=new Date;return t.setHours(0,0,0,0),t.setDate(t.getDate()+e*n),t}return null}const n=e.match(/^today([+-])(\d+)$/i);if(!n)return null;const a="+"===n[1]?1:-1,i=parseInt(n[2],10);if(isNaN(i))return null;const r=new Date;return r.setHours(0,0,0,0),r.setDate(r.getDate()+a*i),r}(t.trim());if(e)n=e;else if(t.includes("T"))n=new Date(t),isNaN(n.getTime())&&(et(`Invalid ISO date: ${t}, falling back to today`),n=new Date,n=new Date(n.getFullYear(),n.getMonth(),n.getDate()));else{const[e,a,i]=t.split("-").map(Number);e&&a&&i&&a>=1&&a<=12&&i>=1&&i<=31?(n=new Date(e,a-1,i),isNaN(n.getTime())&&(et(`Invalid date: ${t}, falling back to today`),n=new Date,n=new Date(n.getFullYear(),n.getMonth(),n.getDate()))):(et(`Malformed date: ${t}, falling back to today`),n=new Date,n=new Date(n.getFullYear(),n.getMonth(),n.getDate()))}}catch(e){et(`Error parsing date: ${t}, falling back to today`,e),n=new Date,n=new Date(n.getFullYear(),n.getMonth(),n.getDate())}else n=new Date,n=new Date(n.getFullYear(),n.getMonth(),n.getDate());n.setHours(0,0,0,0);const a=new Date(n),i=parseInt(e.toString())||3;return a.setDate(n.getDate()+i),a.setHours(23,59,59,999),{start:n,end:a}}function wa(e,t,n=!1){try{const a=localStorage.getItem(e);if(!a)return null;const i=JSON.parse(a),r=Date.now();let o;o=n&&(null==t?void 0:t.refresh_on_navigate)?1e3*Se:function(e){return 60*((null==e?void 0:e.refresh_interval)||xe)*1e3}(t);return r-i.timestamp<o?i:(localStorage.removeItem(e),tt(`Cache expired and removed for ${e}`),null)}catch(t){et("Cache error:",t);try{localStorage.removeItem(e)}catch(e){}return null}}function ba(e){if(e.start_date&&""!==e.start_date.trim()){return va(e.days_to_show,e.start_date).start}const t=new Date;return new Date(t.getFullYear(),t.getMonth(),t.getDate())}function Ma(e,t,n){let a=Qn(e,t.show_week_numbers,n);if("iso"===t.show_week_numbers&&0===n&&0===e.getDay()){const t=new Date(e);t.setDate(t.getDate()+1),a=Gn(t)}return a}function Ta(e){if(!e||!e.length)return;const t=e[0];return"string"==typeof t?t:t.entity}function ka(e,t,n,a,i){if(!e||!t)return;const r={element:n};switch(e.action){case"more-info":!function(e,t){if(!e)return;const n=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:e}});t.element.dispatchEvent(n),nt(`Fired more-info event for ${e}`)}(a,r);break;case"navigate":e.navigation_path&&function(e,t){const n=new CustomEvent("location-changed",{bubbles:!0,composed:!0,detail:{replace:!1}});window.history&&window.history.pushState(null,"",e);t.element.dispatchEvent(n),nt(`Navigated to ${e}`)}(e.navigation_path,r);break;case"url":e.url_path&&(o=e.url_path,window.open(o,"_blank"),nt(`Opened URL ${o}`));break;case"toggle":case"expand":i&&i();break;case"call-service":{if(!e.service)return;const[n,a]=e.service.split(".",2);if(!n||!a)return;t.callService(n,a,e.service_data||{});break}case"fire-dom-event":!function(e){const t=new Event("calendar-card-action",{bubbles:!0,composed:!0});e.dispatchEvent(t),nt("Fired DOM event calendar-card-action")}(n)}var o}const $a=r`
  /* ===== CORE CONTAINER STYLES ===== */

  :host {
    display: block;
  }

  ha-card {
    /* Layout */
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;

    /* Box model */
    box-sizing: border-box;
    padding: calc(var(--calendar-card-spacing-additional) + 16px) 16px
      calc(var(--calendar-card-spacing-additional) + 16px) 8px;

    /* Visual */
    background: var(--calendar-card-background-color, var(--card-background-color));
    cursor: pointer;
  }

  /* Focus states */
  ha-card:focus {
    outline: none;
  }

  ha-card:focus-visible {
    outline: 2px solid var(--calendar-card-line-color-vertical);
  }

  /* Structure containers for stable DOM */
  .header-container,
  .content-container {
    width: 100%;
  }

  /* Content container with unified scrolling behavior */
  .content-container {
    max-height: var(--calendar-card-max-height, none);
    height: var(--calendar-card-height, auto);
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 1px;
    hyphens: auto;

    /* Hide scrollbars across browsers */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }

  /* Show scrollbars on hover */
  .content-container:hover {
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: var(--secondary-text-color) transparent; /* Firefox */
    -ms-overflow-style: auto; /* IE/Edge */
  }

  .card-header-placeholder {
    height: 0;
  }

  /* ===== HEADER STYLES ===== */

  .card-header {
    /* Layout */
    float: left;

    /* Spacing */
    margin: 0 0 16px 8px;
    padding: 0;

    /* Typography */
    color: var(--calendar-card-color-title, var(--primary-text-color));
    font-size: var(--calendar-card-font-size-title, var(--paper-font-headline_-_font-size));
    font-weight: var(--paper-font-headline_-_font-weight);
    letter-spacing: var(--paper-font-headline_-_letter-spacing);
    line-height: var(--paper-font-headline_-_line-height);

    /* Additional Typography */
    -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
    text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
    opacity: var(--dark-primary-opacity);
  }

  /* ===== WEEK NUMBER & SEPARATOR STYLES ===== */

  /* Table structure for week number pills and their separator lines
   * Creates consistent alignment with calendar data below */
  /* Margins are applied dynamically in renderWeekRow */
  .week-row-table {
    height: calc(var(--calendar-card-week-number-font-size) * 1.5);
    width: 100%;
    table-layout: fixed;
    padding-left: 8px;
    border-spacing: 0;
    border: none !important;
  }

  /* Make both cells take full height of the row */
  .week-number-cell,
  .separator-cell {
    height: 100%;
  }

  /* Left cell containing the week number pill
   * Sized to match date column width for proper alignment */
  .week-number-cell {
    width: var(--calendar-card-date-column-width);
    position: relative;
    text-align: center;
    vertical-align: middle;
    padding-right: 12px; /* Match date column padding */
  }

  /* Week number pill - positioned absolutely and centered within its cell */
  .week-number {
    width: calc(var(--calendar-card-week-number-font-size) * 2.5);
    height: calc(var(--calendar-card-week-number-font-size) * 1.5);
    display: inline-flex; /* Centering */
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

  /* Safari-specific adjustment for iOS vertical alignment issues */
  @supports (-webkit-touch-callout: none) {
    .week-number {
      /* Adjust padding to improve vertical alignment on iOS Safari */
      padding-top: calc(var(--calendar-card-week-number-font-size) * 0.1);
    }
  }

  /* Right cell containing the horizontal separator line
   * Takes up remaining width of the table */
  .separator-cell {
    vertical-align: middle;
  }

  /* The actual separator line */
  .separator-line {
    width: 100%;
    height: var(--separator-border-width, 0);
    background-color: var(--separator-border-color, transparent);
    /* Only show when width > 0px */
    display: var(--separator-display, none);
  }

  /* Day separator - Horizontal line between individual days
   * Used when days aren't at week or month boundaries */
  .separator {
    width: 100%;
    margin-left: 8px;
  }

  /* Week separator (full-width) - Used when show_week_numbers is null
   * Creates a horizontal line at week boundaries without week number pill
   * Margins are applied dynamically in createSeparatorStyle in render.ts */
  .week-separator {
    width: 100%;
    margin-left: 8px;
    border-top-style: solid; /* Ensure line is visible */
  }

  /* Month separator - Used at month boundaries
   * Creates a horizontal line between months, has priority over week separators
   * Margins are applied dynamically in createSeparatorStyle in render.ts */
  .month-separator {
    width: 100%;
    margin-left: 8px;
    border-top-style: solid; /* Ensure line is visible */
  }

  /* ===== DAY TABLE STYLES ===== */

  table {
    /* Layout */
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: separate;

    /* Borders & Spacing */
    margin-bottom: var(--calendar-card-day-spacing);
  }

  .day-table {
    /* Override the default table border-bottom for day tables */
    border: none !important;
  }

  table:last-of-type {
    margin-bottom: 0;
    border-bottom: 0;
  }

  /* ===== DATE COLUMN STYLES ===== */

  .date-column {
    /* Layout */
    width: var(--calendar-card-date-column-width);
    min-width: var(--calendar-card-date-column-width);
    max-width: var(--calendar-card-date-column-width);
    vertical-align: var(--calendar-card-date-column-vertical-alignment);
    text-align: center;
    position: relative;

    /* Borders & Spacing */
    padding-left: 8px;
    padding-right: 12px;
  }

  .date-content {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2; /* Ensure date content is above indicator */
  }

  /* Today indicator styling */
  .today-indicator-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  /* Date components */
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

  /* Today indicator styling */
  .today-indicator-container {
    position: absolute;
    color: var(--calendar-card-today-indicator-color);
    pointer-events: none;
    z-index: 1;
  }

  /* Set proper sizing for icon-based indicators */
  ha-icon.today-indicator {
    --mdc-icon-size: var(--calendar-card-today-indicator-size);
  }

  /* Special styling for image type */
  img.today-indicator.image {
    width: var(--calendar-card-today-indicator-size);
    height: auto;
    max-height: var(--calendar-card-today-indicator-size);
    object-fit: contain;
  }

  /* Special styling for emoji type */
  span.today-indicator.emoji {
    font-size: var(--calendar-card-today-indicator-size);
    line-height: 1;
  }

  /* Animation for pulse indicator */
  ha-icon.today-indicator.pulse {
    animation: pulse-animation 2s infinite ease-in-out;
  }

  /* Special styling for glow effect */
  ha-icon.today-indicator.glow {
    filter: drop-shadow(
      0 0 calc(var(--calendar-card-today-indicator-size) * 0.5)
        var(--calendar-card-today-indicator-color)
    );
  }

  /* Pulse animation keyframes */
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

  /* Date column weather */
  .date-column .weather {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .weather ha-icon {
    margin-right: 1px;
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

  /* ===== EVENT STYLES ===== */

  /* Base event */
  .event {
    padding: var(--calendar-card-event-spacing) 0 var(--calendar-card-event-spacing) 12px;
    border-radius: 0;
  }

  /* Event positioning variations */
  .event-first.event-last {
    border-radius: 0 var(--calendar-card-event-border-radius)
      var(--calendar-card-event-border-radius) 0;
  }

  .event-first {
    border-radius: 0 var(--calendar-card-event-border-radius) 0 0;
  }

  .event-middle {
    /* No additional styles needed */
  }

  .event-last {
    border-radius: 0 0 var(--calendar-card-event-border-radius) 0;
  }

  /* Past event styling */
  .past-event .event-content {
    opacity: 0.6;
  }

  /* Event content */
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
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-title {
    font-size: var(--calendar-card-font-size-event);
    font-weight: 500;
    line-height: 1.2;
    color: var(--calendar-card-color-event);
    margin-right: 12px;
    padding-bottom: 2px;
  }

  /* Text label styling */
  .calendar-label {
    display: inline;
    margin-right: 4px;
  }

  /* MDI icon label styling */
  .label-icon {
    --mdc-icon-size: var(--calendar-card-font-size-event);
    vertical-align: middle;
    margin-right: 4px;
  }

  /* Image label styling */
  .label-image {
    height: var(--calendar-card-font-size-event);
    width: auto;
    vertical-align: middle;
    margin-right: 4px;
  }

  /* Event weather */
  .event-weather {
    display: flex;
    font-weight: 500;
    margin-left: 8px;
    margin-right: 12px;
  }

  .event-weather ha-icon {
    margin-right: 2px;
  }

  /* ===== TIME & LOCATION STYLES ===== */

  .time-location {
    display: flex;
    flex-direction: column;
    margin-top: 0;
  }

  .time,
  .location {
    display: flex;
    align-items: center;
    line-height: 1.2;
    margin-top: 2px;
    margin-right: 12px;
  }

  .time span,
  .location span {
    display: inline-block;
    vertical-align: middle;
  }

  .time {
    font-size: var(--calendar-card-font-size-time);
    color: var(--calendar-card-color-time);
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .time-actual {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .time-countdown {
    text-align: right;
    color: var(--calendar-card-color-time);
    font-size: var(--calendar-card-font-size-time);
    margin-left: 8px;
    margin-right: 12px;
    white-space: nowrap;
  }

  .location {
    font-size: var(--calendar-card-font-size-location);
    color: var(--calendar-card-color-location);
  }

  /* ===== PROGRESS BAR STYLES ===== */

  .progress-bar {
    width: var(--calendar-card-progress-bar-width);
    height: var(--calendar-card-progress-bar-height);
    background-color: color-mix(in srgb, var(--calendar-card-progress-bar-color) 20%, transparent);
    border-radius: 999px;
    overflow: hidden;
    margin-left: 8px;
    margin-right: 12px;
  }

  .progress-bar-filled {
    height: 100%;
    background-color: var(--calendar-card-progress-bar-color);
    border-radius: 999px 0 0 999px;
  }

  /* ===== ICON STYLES ===== */

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

  /* ===== STATUS MESSAGES ===== */

  .loading,
  .error {
    text-align: center;
    padding: 16px;
  }

  .error {
    color: var(--error-color);
  }
`;function Da(e){e.style.opacity="0",e.style.transition=`opacity ${ze}ms ease-out`,setTimeout((()=>{e.parentNode&&(e.parentNode.removeChild(e),nt("Removed hold indicator"))}),ze)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xa=1,Sa=2,Ya=e=>(...t)=>({_$litDirective$:e,values:t});class La{constructor(e){}get _$isConnected(){return this._$parent._$isConnected}_$initialize(e,t,n){this.__part=e,this._$parent=t,this.__attributeIndex=n}_$resolve(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ca=Ya(class extends La{constructor(e){if(super(e),e.type!==xa||"class"!==e.name||e.strings?.length>2)throw new Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter((t=>e[t])).join(" ")+" "}update(e,[t]){if(void 0===this._previousClasses){this._previousClasses=new Set,void 0!==e.strings&&(this._staticClasses=new Set(e.strings.join(" ").split(/\s/).filter((e=>""!==e))));for(const e in t)t[e]&&!this._staticClasses?.has(e)&&this._previousClasses.add(e);return this.render(t)}const n=e.element.classList;for(const e of this._previousClasses)e in t||(n.remove(e),this._previousClasses.delete(e));for(const e in t){const a=!!t[e];a===this._previousClasses.has(e)||this._staticClasses?.has(e)||(a?(n.add(e),this._previousClasses.add(e)):(n.remove(e),this._previousClasses.delete(e)))}return ee}}),ja="important",Ha=" !"+ja;
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const za=Ya(class extends La{constructor(e){if(super(e),e.type!==xa||"style"!==e.name||e.strings?.length>2)throw new Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce(((t,n)=>{const a=e[n];return null==a?t:t+`${n=n.includes("-")?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${a};`}),"")}update(e,[t]){const{style:n}=e.element;if(void 0===this._previousStyleProperties)return this._previousStyleProperties=new Set(Object.keys(t)),this.render(t);for(const e of this._previousStyleProperties)null==t[e]&&(this._previousStyleProperties.delete(e),e.includes("-")?n.removeProperty(e):n[e]=null);for(const e in t){const a=t[e];if(null!=a){this._previousStyleProperties.add(e);const t="string"==typeof a&&a.endsWith(Ha);e.includes("-")||t?n.setProperty(e,t?a.slice(0,-11):a,t?ja:""):n[e]=a}}return ee}}),{_ChildPart:Ea}=pe,Oa=window.ShadyDOM?.inUse&&!0===window.ShadyDOM?.noPatch?window.ShadyDOM.wrap:e=>e,Aa=()=>document.createComment(""),Fa=(e,t,n)=>{const a=Oa(e._$startNode).parentNode,i=void 0===t?e._$endNode:t._$startNode;if(void 0===n){const t=Oa(a).insertBefore(Aa(),i),r=Oa(a).insertBefore(Aa(),i);n=new Ea(t,r,e,e.options)}else{const t=Oa(n._$endNode).nextSibling,r=n._$parent,o=r!==e;if(o){let t;n._$reparentDisconnectables?.(e),n._$parent=e,void 0!==n._$notifyConnectionChanged&&(t=e._$isConnected)!==r._$isConnected&&n._$notifyConnectionChanged(t)}if(t!==i||o){let e=n._$startNode;for(;e!==t;){const t=Oa(e).nextSibling;Oa(a).insertBefore(e,i),e=t}}}return n},Pa=(e,t,n=e)=>(e._$setValue(t,n),e),Va={},Na=e=>{e._$notifyConnectionChanged?.(!1,!0);let t=e._$startNode;const n=Oa(e._$endNode).nextSibling;for(;t!==n;){const e=Oa(t).nextSibling;Oa(t).remove(),t=e}},Ia=(e,t,n)=>{const a=new Map;for(let i=t;i<=n;i++)a.set(e[i],i);return a};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Wa=Ya(class extends La{constructor(e){if(super(e),e.type!==Sa)throw new Error("repeat() can only be used in text expressions")}_getValuesAndKeys(e,t,n){let a;void 0===n?n=t:void 0!==t&&(a=t);const i=[],r=[];let o=0;for(const t of e)i[o]=a?a(t,o):o,r[o]=n(t,o),o++;return{values:r,keys:i}}render(e,t,n){return this._getValuesAndKeys(e,t,n).values}update(e,[t,n,a]){const i=e._$committedValue;const{values:r,keys:o}=this._getValuesAndKeys(t,n,a);if(!Array.isArray(i))return this._itemKeys=o,r;const s=this._itemKeys??=[],l=[];let d,c,_=0,h=i.length-1,u=0,m=r.length-1;for(;_<=h&&u<=m;)if(null===i[_])_++;else if(null===i[h])h--;else if(s[_]===o[u])l[u]=Pa(i[_],r[u]),_++,u++;else if(s[h]===o[m])l[m]=Pa(i[h],r[m]),h--,m--;else if(s[_]===o[m])l[m]=Pa(i[_],r[m]),Fa(e,l[m+1],i[_]),_++,m--;else if(s[h]===o[u])l[u]=Pa(i[h],r[u]),Fa(e,i[_],i[h]),h--,u++;else if(void 0===d&&(d=Ia(o,u,m),c=Ia(s,_,h)),d.has(s[_]))if(d.has(s[h])){const t=c.get(o[u]),n=void 0!==t?i[t]:null;if(null===n){const t=Fa(e,i[_]);Pa(t,r[u]),l[u]=t}else l[u]=Pa(n,r[u]),Fa(e,i[_],n),i[t]=null;u++}else Na(i[h]),h--;else Na(i[_]),_++;for(;u<=m;){const t=Fa(e,l[m+1]);Pa(t,r[u]),l[u++]=t}for(;_<=h;){const e=i[_++];null!==e&&Na(e)}return this._itemKeys=o,((e,t=Va)=>{e._$committedValue=t})(e,l),ee}});function Ua(e,t){const n={};return e&&Array.isArray(e)?(e.forEach((e=>{if(!e.datetime)return;let a,i,r;"hourly"===t?(r=new Date(e.datetime),i=r.getHours(),a=`${Kn(r)}_${i}`):(r=new Date(e.datetime),a=Kn(r));const o=function(e,t){const n=void 0!==t&&(t>=18||t<6);if(n&&Ra[e])return Ra[e];return Ja[e]||"mdi:weather-cloudy-alert"}(e.condition,i);n[a]={icon:o,condition:e.condition,temperature:Math.round(e.temperature),templow:void 0!==e.templow?Math.round(e.templow):void 0,datetime:e.datetime,hour:i,precipitation:e.precipitation,precipitation_probability:e.precipitation_probability}})),n):n}const Ja={"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant",exceptional:"mdi:weather-cloudy-alert"},Ra={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy","lightning-rainy":"mdi:weather-lightning"};function Ba(e,t){const n=Tt(t);return"loading"===e?Q`
      <div class="calendar-card">
        <div class="loading">${n.loading}</div>
      </div>
    `:Q`
    <div class="calendar-card">
      <div class="error">${n.error}</div>
    </div>
  `}function qa(e,t,n,a="day"){const i=parseFloat(n.day_spacing);if("day"===a)return{borderTopWidth:e,borderTopColor:t,borderTopStyle:"solid",marginTop:"0px",marginBottom:`${i}px`};let r=Oe.WEEK;"month"===a&&(r=Oe.MONTH);const o=i*r;return{borderTopWidth:e,borderTopColor:t,borderTopStyle:"solid",marginTop:`${o}px`,marginBottom:`${o}px`}}function Ka(e,t,n,a,i=!1,r="day"){if("0px"===e||i)return te;const o=qa(e,t,a,r);return Q`<div class="${n}" style=${za(o)}></div>`}function Za(e){return Ka(e.month_separator_width,e.month_separator_color,"month-separator",e,!1,"month")}function Ga(e,t=!1){return Ka(e.week_separator_width,e.week_separator_color,"week-separator",e,t,"week")}function Qa(e,t){if(!e.today_indicator||!t)return te;const n=e.today_indicator,a=function(e){if(void 0===e||!1===e)return"none";if(!0===e)return"dot";if("string"==typeof e)return"pulse"===e||"glow"===e?e:e.startsWith("mdi:")?"mdi":e.startsWith("/")||e.includes(".png")||e.includes(".jpg")||e.includes(".svg")||e.includes(".webp")||e.includes(".gif")?"image":/[\p{Emoji}]/u.test(e)?"emoji":"dot";return"none"}(n);if("none"===a)return te;const i=function(e){const t={position:"absolute",transform:"translate(-50%, -50%)"},n=e.trim().split(/\s+/);return n.length>=1&&(t.left=n[0]),n.length>=2?t.top=n[1]:t.top="50%",t}(e.today_indicator_position);return Q`
    <div class="today-indicator-container">
      ${function(e,t,n){let a="";switch(e){case"dot":case"pulse":case"glow":a="mdi:circle";break;case"mdi":a="string"==typeof t?t:"mdi:circle";break;case"image":return"string"==typeof t?Q`
          <img 
            src="${t}" 
            class="today-indicator image"
            style=${za(n)}
            alt="Today">
          </img>`:te;case"emoji":return"string"==typeof t?Q` <span class="today-indicator emoji" style=${za(n)}>
          ${t}
        </span>`:te;default:return te}if(a)return Q` <ha-icon
      icon="${a}"
      class="today-indicator ${e}"
      style=${za(n)}
    >
    </ha-icon>`;return te}(a,n,i)}
    </div>
  `}function Xa(e,t,n,a,i){var r,o,s,l;const d=0===e.getDay()||6===e.getDay();let c=t.weekday_color,_=t.day_color,h=t.month_color;d&&(c=t.weekend_weekday_color||c,_=t.weekend_day_color||_,h=t.weekend_month_color||h),a&&(c=t.today_weekday_color||c,_=t.today_day_color||_,h=t.today_month_color||h);const u=Tt(n),m=u.daysOfWeek[e.getDay()],p=e.getDate(),g=u.months[e.getMonth()],f=("date"===(null==(r=t.weather)?void 0:r.position)||"both"===(null==(o=t.weather)?void 0:o.position))&&(null==(s=t.weather)?void 0:s.entity);let y=te;if(f&&(null==i?void 0:i.daily)){const n=function(e,t){if(!t)return;return t[Kn(e)]}(e,i.daily);if(n){const e=(null==(l=t.weather)?void 0:l.date)||{},a=!1!==e.show_conditions,i=!1!==e.show_high_temp,r=!0===e.show_low_temp&&n.templow,o=e.icon_size||"14px",s=e.font_size||"12px",d=e.color||"var(--primary-text-color)";y=Q`
        <div class="weather" style="font-size: ${s}; color: ${d};">
          ${a?Q`
                <ha-icon
                  .icon=${n.icon}
                  style="--mdc-icon-size: ${o};"
                ></ha-icon>
              `:te}
          ${i?Q` <span class="weather-temp-high">${n.temperature}°</span> `:te}
          ${r?Q` <span class="weather-temp-low">/${n.templow}°</span> `:te}
        </div>
      `}}return Q`
    <div
      class="weekday"
      style=${za({"font-size":t.weekday_font_size,color:c})}
    >
      ${m}
    </div>
    <div
      class="day"
      style=${za({"font-size":t.day_font_size,color:_})}
    >
      ${p}
    </div>
    ${t.show_month?Q`
          <div
            class="month"
            style=${za({"font-size":t.month_font_size,color:h})}
          >
            ${g}
          </div>
        `:te}
    ${y}
  `}function ei(e,t,n,a,i,r,o){const s=new Date,l=new Date(s.getFullYear(),s.getMonth(),s.getDate()),d=new Date(e.timestamp).toDateString()===l.toDateString();let c=te;const _=(null==i?void 0:i.isNewMonth)||!1,h=(null==i?void 0:i.isNewWeek)||!1,u=_&&"0px"!==t.month_separator_width,m=h&&(null!==t.show_week_numbers||"0px"!==t.week_separator_width),p=t.day_separator_width,g=t.day_separator_color;if(a&&"0px"!==p&&!u&&!m){const e=qa(p,g,t,"day");c=Q`<div class="separator" style=${za(e)}></div>`}return Q`
    ${c}
    <table class="day-table ${d?"today":"future-day"}">
      ${Wa(e.events,((e,t)=>`${e._entityId}-${e.summary}-${t}`),((a,i)=>function(e,t,n,a,i,r,o,s){var l,d;const c=Boolean(e._isEmptyDay),_=new Date(t.timestamp),h=function(e){const t=e.getDay();return 0===t||6===t}(_),u=new Date,m=new Date(u.getFullYear(),u.getMonth(),u.getDate()),p=new Date(m);p.setDate(p.getDate()+1);let g=!1;if(!c){if(!e.start.dateTime){let t=e.end.date?qn(e.end.date):null;if(t){const e=new Date(t);e.setDate(e.getDate()-1),t=e}g=null!==t&&m>t}else{const t=e.end.dateTime?new Date(e.end.dateTime):null;g=null!==t&&u>t}}const f=pa(e._entityId,a,void 0,e),y=a.event_background_opacity>0?a.event_background_opacity:0,v=y>0?pa(e._entityId,a,y,e):"",w=null!=(l=fa(e._entityId,"show_time",a,e))?l:a.show_time,b=null!=(d=fa(e._entityId,"show_location",a,e))?d:a.show_location,M=!e.start.dateTime,T=M&&e.time&&(e.time.includes(Tt(i).multiDay)||e.time.includes(Tt(i).endsTomorrow)||e.time.includes(Tt(i).endsToday)),k=w&&!(M&&!T&&!a.show_single_allday_time)&&!c;let $=null;!a.show_countdown||c||g||($=Jn(e,i));const D=ya(e),x=D&&a.show_progress_bar?function(e){if(!ya(e))return null;const t=new Date,n=new Date(e.start.dateTime),a=new Date(e.end.dateTime).getTime()-n.getTime(),i=t.getTime()-n.getTime();return Math.min(100,Math.max(0,Math.floor(i/a*100)))}(e):null,S=Un(e,a,i,s),Y=e.location&&b?Rn(e.location,a.remove_location_country):"",L=0===n,C=n===t.events.length-1,j={event:!0,"event-first":L,"event-middle":!L&&!C,"event-last":C,"past-event":g};return Q`
    <tr>
      ${0===n?Q`
            <td
              class="date-column ${h?"weekend":""}"
              rowspan="${t.events.length}"
              style="position: relative;"
            >
              ${Xa(_,a,i,r,o)}
              ${Qa(a,r)}
            </td>
          `:""}
      <td
        class=${Ca(j)}
        style="border-left: var(--calendar-card-line-width-vertical) solid ${f}; background-color: ${v};"
      >
        <div class="event-content">
          ${function(e,t,n){var a;const i=!!e._isEmptyDay,r=i?"var(--calendar-card-empty-day-color)":(null==(a=e._matchedConfig)?void 0:a.color)||t.event_color;return Q`
    <div class="summary-row">
      <div class="summary">
        ${ga(e._entityId,t,e)?(o=ga(e._entityId,t,e),o?o.startsWith("mdi:")?Q`<ha-icon icon="${o}" class="label-icon"> </ha-icon>`:o.startsWith("/local/")||/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(o)?Q`<img src="${o}" class="label-image"> </img>`:Q`<span class="calendar-label">${o}</span>`:te):""}
        <span
          class="event-title ${i?"empty-day-title":""}"
          style="color: ${r}"
        >
          ${i?`✓ ${e.summary}`:e.summary}
        </span>
      </div>
      ${function(e,t,n){var a,i,r;const o=(null==(a=t.weather)?void 0:a.entity)&&("event"===t.weather.position||"both"===t.weather.position);if(!o||!(null==n?void 0:n.hourly))return Q``;if(null==(i=e.end)?void 0:i.dateTime){const t=new Date;if(new Date(e.end.dateTime)<t)return Q``}const s=function(e,t,n){if(e.start.date&&!e.start.dateTime&&n)return n[Kn(qn(e.start.date))];if(!e.start.dateTime||!t)return;const a=new Date(e.start.dateTime),i=Kn(a),r=a.getHours(),o=t[`${i}_${r}`];if(o)return o;let s=-1,l=24;return Object.keys(t).forEach((e=>{if(e.startsWith(i)){const t=e.split("_")[1],n=parseInt(t);if(!isNaN(n)){const e=Math.abs(n-r);e<l&&(l=e,s=n)}}})),s>=0?t[`${i}_${s}`]:void 0}(e,n.hourly,n.daily);if(!s)return Q``;const l=(null==(r=t.weather)?void 0:r.event)||{},d=!1!==l.show_conditions,c=!1!==l.show_temp,_=l.icon_size||"14px",h=l.font_size||"12px",u=l.color||"var(--secondary-text-color)";return Q`
    <div class="event-weather">
      ${d?Q`<ha-icon .icon=${s.icon} style="--mdc-icon-size: ${_};"></ha-icon>`:te}
      ${c?Q`<span style="font-size: ${h}; color: ${u};">
            ${s.temperature}°
          </span>`:te}
    </div>
  `}(e,t,n)}
    </div>
  `;var o}(e,a,o)}
          <div class="time-location">
            ${k?Q`
                  <div class="time">
                    <div class="time-actual">
                      <ha-icon icon="mdi:clock-outline"></ha-icon>
                      <span>${S}</span>
                    </div>
                    ${$?Q`<div class="time-countdown">${$}</div>`:null!==x&&a.show_progress_bar?Q`
                            <div class="progress-bar">
                              <div
                                class="progress-bar-filled"
                                style="width: ${x}%"
                              ></div>
                            </div>
                          `:te}
                  </div>
                `:$?Q`
                    <div class="time">
                      <div class="time-actual"></div>
                      <div class="time-countdown">${$}</div>
                    </div>
                  `:null!==x&&a.show_progress_bar?Q`
                      <div class="time">
                        <div class="time-actual"></div>
                        <div class="progress-bar">
                          <div
                            class="progress-bar-filled"
                            style="width: ${x}%"
                          ></div>
                        </div>
                      </div>
                    `:te}
            ${Y?Q`
                  <div class="location">
                    <ha-icon icon="mdi:map-marker"></ha-icon>
                    <span>${Y}</span>
                  </div>
                `:""}
          </div>
        </div>
      </td>
    </tr>
  `}(a,e,i,t,n,d,r,o)))}
    </table>
  `}function ti(e,t,n,a,i){return Q`
    ${e.map(((r,o)=>{var s;const l=o>0?e[o-1]:void 0,d=null!=(s=r.weekNumber)?s:null;let c=!1;if(l){c=r.weekNumber!==l.weekNumber}else c=!0;const _=l&&r.monthNumber!==l.monthNumber,h=0===o,u={isNewWeek:c,isNewMonth:Boolean(_)};let m=te;return!_||"0px"===t.month_separator_width||c&&null!==t.show_week_numbers?c&&(m=h&&null!==t.show_week_numbers&&!t.show_current_week_number?_?Za(t):Ga(t,h):null!==t.show_week_numbers?function(e,t,n,a=!1){if(null===e)return te;const i=parseFloat(n.day_spacing),r=i*(t?Oe.MONTH:Oe.WEEK)/2,o={marginTop:(a?0:r-i)+"px",marginBottom:`${r}px`},s={};return a?s["--separator-display"]="none":t&&"0px"!==n.month_separator_width?(s["--separator-border-width"]=n.month_separator_width,s["--separator-border-color"]=n.month_separator_color,s["--separator-display"]="block"):"0px"!==n.week_separator_width?(s["--separator-border-width"]=n.week_separator_width,s["--separator-border-color"]=n.week_separator_color,s["--separator-display"]="block"):s["--separator-display"]="none",Q`
    <table class="week-row-table" style=${za(o)}>
      <tr>
        <td class="week-number-cell">
          <div class="week-number">${e}</div>
        </td>
        <td class="separator-cell" style=${za(s)}>
          <div class="separator-line"></div>
        </td>
      </tr>
    </table>
  `}(d,Boolean(_),t,h):Ga(t,h)):m=Za(t),Q`
        ${m}
        ${ei(r,t,n,l,u,a,i)}
      `}))}
  `}var ni=r`
  ha-textfield,
  ha-select,
  ha-formfield,
  ha-entity-picker,
  ha-icon-picker {
    display: block;
    margin: 8px 0;
  }

  .card-config {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
  }

  .helper-text {
    color: var(--secondary-text-color);
    font-size: 10px;
    line-height: 1.1;
    margin-top: -4px;
    margin-bottom: 8px;
  }

  h3 {
    margin: 24px 0 6px 0;
    font-size: 14px;
  }

  h3:first-of-type {
    margin-top: 8px;
  }

  h4 {
    margin: 24px 0 6px 0;
  }

  h5 {
    margin: 2px 0 0 0;
  }

  .panel-content {
    padding: 8px 0 12px 0;
  }

  .action-config {
    display: flex;
    flex-direction: column;
  }

  ha-expansion-panel {
    margin: 8px 0;
  }

  ha-button {
    margin: 8px 0;
  }

  .indicator-field {
    display: flex;
    flex-direction: column;
    margin: 8px 0;
  }

  ha-formfield {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }

  .date-input {
    position: relative;
    margin-bottom: 16px;
    width: 100%;
  }

  .date-input .mdc-text-field {
    width: 100%;
    height: 56px;
    border-radius: 4px 4px 0 0;
    padding: 0;
    background-color: var(
      --mdc-text-field-fill-color,
      var(--input-fill-color, rgba(var(--rgb-primary-text-color), 0.06))
    );
    border-bottom: 1px solid var(--mdc-text-field-idle-line-color, var(--secondary-text-color));
    transition:
      background-color 15ms linear,
      border-bottom-color 15ms linear;
    box-sizing: border-box;
    position: relative;
    overflow: hidden; /* Important for containing the ripple */
  }

  .date-input .mdc-text-field__ripple {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0; /* Hidden by default */
    background-color: var(--mdc-ripple-color, var(--primary-text-color));
    transition:
      opacity 15ms linear,
      background-color 15ms linear;
    z-index: 1;
  }

  .date-input .mdc-floating-label {
    position: absolute;
    top: 8px;
    left: 4px;
    -webkit-font-smoothing: antialiased;
    font-family: var(
      --mdc-typography-subtitle1-font-family,
      var(--mdc-typography-font-family, Roboto, sans-serif)
    );
    font-size: var(--mdc-typography-subtitle1-font-size, 1rem);
    font-weight: var(--mdc-typography-subtitle1-font-weight, 400);
    letter-spacing: var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);
    text-transform: var(--mdc-typography-subtitle1-text-transform, inherit);
    transform: scale(0.75);
    color: var(--mdc-select-label-ink-color, rgba(0, 0, 0, 0.6));
    pointer-events: none;
    transition: color 15ms linear;
    z-index: 2;
  }

  .date-input .value-container {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 8px 16px 8px;
    position: relative;
    z-index: 2;
  }

  .date-input .value-text {
    -webkit-font-smoothing: antialiased;
    font-family: var(
      --mdc-typography-subtitle1-font-family,
      var(--mdc-typography-font-family, Roboto, sans-serif)
    );
    font-size: var(--mdc-typography-subtitle1-font-size, 1rem);
    line-height: var(--mdc-typography-subtitle1-line-height, 1.75rem);
    font-weight: var(--mdc-typography-subtitle1-font-weight, 400);
    letter-spacing: var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);
    text-transform: var(--mdc-typography-subtitle1-text-transform, inherit);
    color: var(--primary-text-color);
  }

  .date-input input[type='date'] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 3;
  }

  /* Handle focus and hover states with JavaScript toggling classes */
  .date-input .mdc-text-field.focused {
    border-bottom: 2px solid var(--primary-color);
  }

  .date-input .mdc-text-field.focused .mdc-floating-label {
    color: var(--primary-color);
  }
`,ai=Object.defineProperty,ii=Object.getOwnPropertySymbols,ri=Object.prototype.hasOwnProperty,oi=Object.prototype.propertyIsEnumerable,si=(e,t,n)=>t in e?ai(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,li=(e,t)=>{for(var n in t||(t={}))ri.call(t,n)&&si(e,n,t[n]);if(ii)for(var n of ii(t))oi.call(t,n)&&si(e,n,t[n]);return e},di=(e,t,n,a)=>{for(var i,r=void 0,o=e.length-1;o>=0;o--)(i=e[o])&&(r=i(t,n,r)||r);return r&&ai(t,n,r),r};const ci={max_events_to_show:"compact_events_to_show",vertical_line_color:"accent_color",horizontal_line_width:"day_separator_width",horizontal_line_color:"day_separator_color"},_i={max_events_to_show:"compact_events_to_show"};class hi extends ve{static get styles(){return ni}connectedCallback(){super.connectedCallback(),this._loadCustomElements()}async _loadCustomElements(){if(!customElements.get("ha-entity-picker"))try{const e=customElements.get("hui-entities-card");e&&"function"==typeof e.getConfigElement?await e.getConfigElement():console.warn("Could not load ha-entity-picker: getConfigElement not available")}catch(e){console.warn("Could not load ha-entity-picker",e)}}setConfig(e){this._config=li(li({},rt),e)}getConfigValue(e,t){var n;if(!this._config)return t;if(!e.includes(".")){let a=null!=(n=this._config[e])?n:t;if("time_24h"===e){if(!0===a)return"true";if(!1===a)return"false"}return a}const a=e.split(".");let i=this._config;for(const e of a){if(null==i)return t;if(/^\d+$/.test(e)){const n=parseInt(e,10);if(Array.isArray(i)&&n>=0&&n<i.length){i=i[n];continue}return t}if("object"!=typeof i||null===i||!(e in i))return t;i=i[e]}return null!=i?i:t}setConfigValue(e,t){if(!this._config)return;"time_24h"===e&&("true"===t?t=!0:"false"===t&&(t=!1));const n=JSON.parse(JSON.stringify(this._config));if(!e.includes("."))return void 0===t?delete n[e]:n[e]=t,void this._fireConfigChanged(n);const a=e.split("."),i=a.pop();let r=n;for(const e of a)if(/^\d+$/.test(e)){const t=parseInt(e,10);for(Array.isArray(r)||(r=[]);r.length<=t;)r.push({});r[t]&&"object"==typeof r[t]||(r[t]={}),r=r[t]}else Object.prototype.hasOwnProperty.call(r,e)&&"object"==typeof r[e]||(r[e]={}),r=r[e];void 0===t?delete r[i]:r[i]=t,this._fireConfigChanged(n)}_fireConfigChanged(e){const t=Yt(e,rt);this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t}}))}_findDeprecatedParams(e){return Object.keys(ci).filter((t=>t in e))}_findDeprecatedEntityParams(e){const t=[];return e.forEach(((e,n)=>{"object"==typeof e&&null!==e&&Object.keys(_i).forEach((a=>{a in e&&t.push({index:n,param:a})}))})),t}_upgradeConfig(){const e=li({},this._config);let t=!1;for(const[n,a]of Object.entries(ci))n in e&&(e[a]=e[n],delete e[n],t=!0);Array.isArray(e.entities)&&(e.entities=e.entities.map((e=>{if("object"==typeof e&&null!==e){const n=li({},e);for(const[e,a]of Object.entries(_i))e in n&&(n[a]=n[e],delete n[e],t=!0);return n}return e}))),t&&this._fireConfigChanged(e)}_getTranslation(e){var t,n,a;const i=(null==(t=this._config)?void 0:t.language)||(null==(a=null==(n=this.hass)?void 0:n.locale)?void 0:a.language)||"en",r=e.includes(".")?e:`editor.${e}`;return function(e,t,n){const a=Tt(e);if("string"==typeof t&&t.includes(".")){const[e,i]=t.split(".");if("editor"===e&&a.editor&&i in a.editor){const e=a.editor[i];if("string"==typeof e||Array.isArray(e))return e}return void 0!==n?n:i}if(t in a){const e=a[t];if("string"==typeof e||Array.isArray(e))return e}return void 0!==n?n:t}(r.startsWith("editor.")&&!function(e){const t=Tt(e);return Boolean((null==t?void 0:t.editor)&&Object.keys(t.editor).length>0)}(i)?"en":i,r,e)}_valueChanged(e){if(!e.target)return;e.stopPropagation();const t=e.target,n=t.getAttribute("name");let a=t.value;if(n)if("language_mode"!==n){if("height_mode"===n){const e=t.value,n=this.getConfigValue("height"),a=this.getConfigValue("max_height");return this.setConfigValue("height",void 0),this.setConfigValue("max_height",void 0),void("fixed"===e?this.setConfigValue("height",n&&"auto"!==n?n:"300px"):"maximum"===e&&this.setConfigValue("max_height",a&&"none"!==a?a:"300px"))}if("start_date_mode"!==n)return"start_date_fixed"===n||"start_date_offset"===n?(this.setConfigValue("start_date",t.value),void this.requestUpdate()):void("remove_location_country_selector"!==n&&("show_week_numbers"===n&&"null"===a&&(a=null),"HA-SWITCH"===t.tagName&&(a=t.checked),"number"===t.getAttribute("type")&&""!==a&&(a=parseFloat(a)),this.setConfigValue(n,a)));this._handleStartDateModeChange(t.value)}else{const e=t.value;"system"===e?this.setConfigValue("language",void 0):"custom"===e&&(this.getConfigValue("language")||this.setConfigValue("language","en"))}}_serviceDataChanged(e){if(!e.target)return;const t=e.target,n=t.getAttribute("name");if(!n)return;let a=t.value;try{a=a?JSON.parse(a):{},this.setConfigValue(n,a)}catch(e){}}_getStartDateMode(){const e=this.getConfigValue("start_date",""),t=null!=e?String(e):"";return t&&""!==t?/^\d{4}-\d{2}-\d{2}$/.test(t)?"fixed":/^[+-]?\d+$/.test(t)?"offset":"fixed":"default"}_getStartDateValue(e){const t=this.getConfigValue("start_date",""),n=null!=t?String(t):"";return"fixed"===e&&/^\d{4}-\d{2}-\d{2}$/.test(n)||"offset"===e&&/^[+-]?\d+$/.test(n)?n:""}_handleStartDateModeChange(e){if("default"===e)this.setConfigValue("start_date",void 0);else if("fixed"===e){const e=new Date,t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");this.setConfigValue("start_date",`${t}-${n}-${a}`)}else"offset"===e&&this.setConfigValue("start_date","+0")}render(){var e,t;if(!this.hass||!this._config)return Q``;const n=this._findDeprecatedParams(this._config),a=this._findDeprecatedEntityParams(null!=(t=null==(e=this._config)?void 0:e.entities)?t:[]),i=n.length>0||a.length>0?Q`
          <div style="border-radius: 8px; overflow: hidden;">
            <ha-alert alert-type="warning">
              <div style="height: 6px"></div>
              <b>${this._getTranslation("editor.deprecated_config_detected")}</b><br />
              ${this._getTranslation("editor.deprecated_config_explanation")}<br />
              <span style="color: var(--warning-color); font-size: 0.95em;">
                ${this._getTranslation("editor.deprecated_config_update_hint")}
              </span>
              <div style="text-align:center;">
                <ha-button @click="${()=>this._upgradeConfig()}">
                  <ha-icon icon="mdi:autorenew"></ha-icon>
                  ${this._getTranslation("editor.update_config")}
                </ha-button>
              </div>
            </ha-alert>
          </div>
        `:null;return Q`
      ${i}
      <div class="card-config">
        <!-- CALENDAR ENTITIES -->
        ${this.addExpansionPanel(this._getTranslation("calendar_entities"),"M21,17V8H7V17H21M21,3A2,2 0 0,1 23,5V17A2,2 0 0,1 21,19H7C5.89,19 5,18.1 5,17V5A2,2 0 0,1 7,3H8V1H10V3H18V1H20V3H21M3,21H17V23H3C1.89,23 1,22.1 1,21V9H3V21M19,15H15V11H19V15Z",Q` ${this._renderCalendarEntities()} `,!0)}

        <!-- CORE SETTINGS -->
        ${this.addExpansionPanel(this._getTranslation("core_settings"),"M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z",Q`
            <!-- Display Range -->
            <h3>${this._getTranslation("time_range")}</h3>
            <div class="helper-text">${this._getTranslation("time_range_note")}</div>
            ${this.addTextField("days_to_show",this._getTranslation("days_to_show"),"number")}
            <div class="helper-text">${this._getTranslation("days_to_show_note")}</div>
            ${this.addSelectField("start_date_mode",this._getTranslation("start_date_mode"),[{value:"default",label:this._getTranslation("start_date_mode_default")},{value:"fixed",label:this._getTranslation("start_date_mode_fixed")},{value:"offset",label:this._getTranslation("start_date_mode_offset")}],!1,String(this._getStartDateMode()),(e=>{this._handleStartDateModeChange(e),this.requestUpdate()}))}
            ${(()=>{const e=this._getStartDateMode();return"fixed"===e?this.addDateField("start_date_fixed",this._getTranslation("start_date_fixed"),this._getStartDateValue("fixed")):"offset"===e?Q`
                  ${this.addTextField("start_date_offset",this._getTranslation("start_date_offset"),"text",this._getStartDateValue("offset"))}
                  <div class="helper-text">${this._getTranslation("start_date_offset_note")}</div>
                `:Q``})()}

            <!-- Compact Mode -->
            <h3>${this._getTranslation("compact_mode")}</h3>
            <div class="helper-text">${this._getTranslation("compact_mode_note")}</div>
            ${this.addTextField("compact_days_to_show",this._getTranslation("compact_days_to_show"),"number")}
            ${this.addTextField("compact_events_to_show",this._getTranslation("compact_events_to_show"),"number")}
            ${this.addBooleanField("compact_events_complete_days",this._getTranslation("compact_events_complete_days"))}
            <div class="helper-text">
              ${this._getTranslation("compact_events_complete_days_note")}
            </div>

            <!-- Event Visibility -->
            <h3>${this._getTranslation("event_visibility")}</h3>
            ${this.addBooleanField("show_past_events",this._getTranslation("show_past_events"))}
            ${this.addBooleanField("show_empty_days",this._getTranslation("show_empty_days"))}
            ${this.addBooleanField("filter_duplicates",this._getTranslation("filter_duplicates"))}

            <!-- Language & Time Formats -->
            <h3>${this._getTranslation("language_time_formats")}</h3>
            ${this.addSelectField("language_mode",this._getTranslation("language_mode"),[{value:"system",label:this._getTranslation("system")},{value:"custom",label:this._getTranslation("custom")}],!1,void 0!==this.getConfigValue("language")?"custom":"system")}
            ${(()=>void 0!==this.getConfigValue("language")?Q`
                    ${this.addTextField("language",this._getTranslation("language_code"))}
                    <div class="helper-text">${this._getTranslation("language_code_note")}</div>
                  `:Q``)()}
            ${this.addSelectField("time_24h",this._getTranslation("time_24h"),[{value:"system",label:this._getTranslation("system")},{value:"true",label:this._getTranslation("24h")},{value:"false",label:this._getTranslation("12h")}])}
          `)}

        <!-- APPEARANCE & LAYOUT -->
        ${this.addExpansionPanel(this._getTranslation("appearance_layout"),"M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z",Q`
            <!-- Title Styling -->
            <h3>${this._getTranslation("title_styling")}</h3>
            ${this.addTextField("title",this._getTranslation("title"))}
            ${this.addTextField("title_font_size",this._getTranslation("title_font_size"))}
            ${this.addTextField("title_color",this._getTranslation("title_color"))}

            <!-- Card Styling -->
            <h3>${this._getTranslation("card_styling")}</h3>
            ${this.addTextField("background_color",this._getTranslation("background_color"))}
            ${this.addSelectField("height_mode",this._getTranslation("height_mode"),[{value:"auto",label:this._getTranslation("auto")},{value:"fixed",label:this._getTranslation("fixed")},{value:"maximum",label:this._getTranslation("maximum")}],!1,(()=>void 0!==this.getConfigValue("height")&&"auto"!==this.getConfigValue("height")?"fixed":void 0!==this.getConfigValue("max_height")&&"none"!==this.getConfigValue("max_height")?"maximum":"auto")())}
            ${(()=>void 0!==this.getConfigValue("height")&&"auto"!==this.getConfigValue("height")?Q`
                  ${this.addTextField("height",this._getTranslation("height_value"))}
                  <div class="helper-text">${this._getTranslation("fixed_height_note")}</div>
                `:void 0!==this.getConfigValue("max_height")&&"none"!==this.getConfigValue("max_height")?Q`
                  ${this.addTextField("max_height",this._getTranslation("height_value"))}
                  <div class="helper-text">${this._getTranslation("max_height_note")}</div>
                `:Q``)()}

            <!-- Event Styling -->
            <h3>${this._getTranslation("event_styling")}</h3>
            ${this.addTextField("accent_color",this._getTranslation("accent_color"))}
            ${this.addTextField("event_background_opacity",this._getTranslation("event_background_opacity"),"number")}
            ${this.addTextField("vertical_line_width",this._getTranslation("vertical_line_width"))}

            <!-- Spacing & Alignment -->
            <h3>${this._getTranslation("spacing_alignment")}</h3>
            ${this.addTextField("day_spacing",this._getTranslation("day_spacing"))}
            ${this.addTextField("event_spacing",this._getTranslation("event_spacing"))}
            ${this.addTextField("additional_card_spacing",this._getTranslation("additional_card_spacing"))}
          `)}

        <!-- DATE DISPLAY -->
        ${this.addExpansionPanel(this._getTranslation("date_display"),"M7,10H12V15H7M19,19H5V8H19M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z",Q`
            <!-- Date Column Formatting -->
            <h3>${this._getTranslation("vertical_alignment")}</h3>
            ${this.addSelectField("date_vertical_alignment",this._getTranslation("date_vertical_alignment"),[{value:"top",label:this._getTranslation("top")},{value:"middle",label:this._getTranslation("middle")},{value:"bottom",label:this._getTranslation("bottom")}])}

            <!-- Date Column Formatting -->
            <h3>${this._getTranslation("date_formatting")}</h3>

            <!-- Weekday Formatting -->
            <h5>${this._getTranslation("weekday_font")}</h5>
            ${this.addTextField("weekday_font_size",this._getTranslation("weekday_font_size"))}
            ${this.addTextField("weekday_color",this._getTranslation("weekday_color"))}

            <!-- Day Formatting -->
            <h5>${this._getTranslation("day_font")}</h5>
            ${this.addTextField("day_font_size",this._getTranslation("day_font_size"))}
            ${this.addTextField("day_color",this._getTranslation("day_color"))}

            <!-- Month Formatting -->
            <h5>${this._getTranslation("month_font")}</h5>
            ${this.addBooleanField("show_month",this._getTranslation("show_month"))}
            ${this.addTextField("month_font_size",this._getTranslation("month_font_size"))}
            ${this.addTextField("month_color",this._getTranslation("month_color"))}

            <!-- Weekend Highlighting -->
            <h5>${this._getTranslation("weekend_highlighting")}</h5>
            ${this.addTextField("weekend_weekday_color",this._getTranslation("weekend_weekday_color"))}
            ${this.addTextField("weekend_day_color",this._getTranslation("weekend_day_color"))}
            ${this.addTextField("weekend_month_color",this._getTranslation("weekend_month_color"))}

            <!-- Today Highlighting -->
            <h5>${this._getTranslation("today_highlighting")}</h5>
            ${this.addTextField("today_weekday_color",this._getTranslation("today_weekday_color"))}
            ${this.addTextField("today_day_color",this._getTranslation("today_day_color"))}
            ${this.addTextField("today_month_color",this._getTranslation("today_month_color"))}

            <!-- Today Indicator -->
            <h3>${this._getTranslation("today_indicator")}</h3>
            ${this.addTodayIndicatorField("today_indicator",this._getTranslation("today_indicator"))}
            ${(()=>{const e=this.getConfigValue("today_indicator");return e&&"none"!==e?Q`
                  ${this.addTextField("today_indicator_position",this._getTranslation("today_indicator_position"))}
                  ${this.addTextField("today_indicator_color",this._getTranslation("today_indicator_color"))}
                  ${this.addTextField("today_indicator_size",this._getTranslation("today_indicator_size"))}
                `:Q``})()}

            <!-- Week Numbers & Separators -->
            <h3>${this._getTranslation("week_numbers_separators")}</h3>

            <!-- Week Numbers -->
            <h5>${this._getTranslation("week_numbers")}</h5>
            ${this.addSelectField("first_day_of_week",this._getTranslation("first_day_of_week"),[{value:"system",label:this._getTranslation("system")},{value:"sunday",label:this._getTranslation("sunday")},{value:"monday",label:this._getTranslation("monday")}])}
            ${this.addSelectField("show_week_numbers",this._getTranslation("show_week_numbers"),[{value:"null",label:this._getTranslation("none")},{value:"iso",label:"ISO"},{value:"simple",label:this._getTranslation("simple")}])}
            ${(()=>{const e=this.getConfigValue("show_week_numbers");return"iso"===e?Q`<div class="helper-text">
                  ${this._getTranslation("week_number_note_iso")}
                </div>`:"simple"===e?Q`<div class="helper-text">
                  ${this._getTranslation("week_number_note_simple")}
                </div>`:Q``})()}
            ${(()=>{const e=this.getConfigValue("show_week_numbers");return e&&"null"!==e?Q`
                  ${this.addBooleanField("show_current_week_number",this._getTranslation("show_current_week_number"))}
                  ${this.addTextField("week_number_font_size",this._getTranslation("week_number_font_size"))}
                  ${this.addTextField("week_number_color",this._getTranslation("week_number_color"))}
                  ${this.addTextField("week_number_background_color",this._getTranslation("week_number_background_color"))}
                `:Q``})()}

            <!-- Day Separator -->
            <h5>${this._getTranslation("day_separator")}</h5>
            ${this.addBooleanField("day_separator_toggle",this._getTranslation("show_day_separator"),"0px"!==this.getConfigValue("day_separator_width")&&"0"!==this.getConfigValue("day_separator_width"),(e=>{e.target.checked?this.setConfigValue("day_separator_width","1px"):this.setConfigValue("day_separator_width","0px")}),!0)}
            ${(()=>"0px"!==this.getConfigValue("day_separator_width")&&"0"!==this.getConfigValue("day_separator_width")?Q`
                ${this.addTextField("day_separator_width",this._getTranslation("day_separator_width"))}
                ${this.addTextField("day_separator_color",this._getTranslation("day_separator_color"))}
              `:Q``)()}

            <!-- Week Separator -->
            <h5>${this._getTranslation("week_separator")}</h5>
            ${this.addBooleanField("week_separator_toggle",this._getTranslation("show_week_separator"),"0px"!==this.getConfigValue("week_separator_width")&&"0"!==this.getConfigValue("week_separator_width"),(e=>{e.target.checked?this.setConfigValue("week_separator_width","1px"):this.setConfigValue("week_separator_width","0px")}),!0)}
            ${(()=>"0px"!==this.getConfigValue("week_separator_width")&&"0"!==this.getConfigValue("week_separator_width")?Q`
                ${this.addTextField("week_separator_width",this._getTranslation("week_separator_width"))}
                ${this.addTextField("week_separator_color",this._getTranslation("week_separator_color"))}
              `:Q``)()}

            <!-- Month Separator -->
            <h5>${this._getTranslation("month_separator")}</h5>
            ${this.addBooleanField("month_separator_toggle",this._getTranslation("show_month_separator"),"0px"!==this.getConfigValue("month_separator_width")&&"0"!==this.getConfigValue("month_separator_width"),(e=>{e.target.checked?this.setConfigValue("month_separator_width","1px"):this.setConfigValue("month_separator_width","0px")}),!0)}
            ${(()=>"0px"!==this.getConfigValue("month_separator_width")&&"0"!==this.getConfigValue("month_separator_width")?Q`
                ${this.addTextField("month_separator_width",this._getTranslation("month_separator_width"))}
                ${this.addTextField("month_separator_color",this._getTranslation("month_separator_color"))}
              `:Q``)()}
          `)}

        <!-- EVENT DISPLAY -->
        ${this.addExpansionPanel(this._getTranslation("event_display"),"M20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20M5,13V15H16V13H5M5,9V11H19V9H5Z",Q`
            <!-- Event Content -->
            <h3>${this._getTranslation("event_title")}</h3>
            ${this.addTextField("event_font_size",this._getTranslation("event_font_size"))}
            ${this.addTextField("event_color",this._getTranslation("event_color"))}
            ${this.addTextField("empty_day_color",this._getTranslation("empty_day_color"))}

            <!-- Time Display -->
            <h3>${this._getTranslation("time")}</h3>
            ${this.addBooleanField("show_time",this._getTranslation("show_time"))}
            ${(()=>!0!==this.getConfigValue("show_time")?Q``:Q`
                ${this.addBooleanField("show_single_allday_time",this._getTranslation("show_single_allday_time"))}
                ${this.addBooleanField("show_end_time",this._getTranslation("show_end_time"))}
                ${this.addTextField("time_font_size",this._getTranslation("time_font_size"))}
                ${this.addTextField("time_color",this._getTranslation("time_color"))}
                ${this.addTextField("time_icon_size",this._getTranslation("time_icon_size"))}
              `)()}

            <!-- Location Display -->
            <h3>${this._getTranslation("location")}</h3>
            ${this.addBooleanField("show_location",this._getTranslation("show_location"))}
            ${(()=>!0!==this.getConfigValue("show_location")?Q``:Q`
                ${this.addTextField("location_font_size",this._getTranslation("location_font_size"))}
                ${this.addTextField("location_color",this._getTranslation("location_color"))}
                ${this.addTextField("location_icon_size",this._getTranslation("location_icon_size"))}
                ${this.addSelectField("remove_location_country_selector",this._getTranslation("remove_location_country"),[{value:"false",label:this._getTranslation("none")},{value:"true",label:this._getTranslation("simple")},{value:"custom",label:this._getTranslation("custom")}],!1,(()=>{if(!this._config||!this._config.hasOwnProperty("remove_location_country"))return"false";const e=this._config.remove_location_country;return!0===e||"true"===e?"true":!1===e||"false"===e?"false":"string"==typeof e?"custom":"false"})(),(e=>{"true"===e?this.setConfigValue("remove_location_country",!0):"false"===e?this.setConfigValue("remove_location_country",!1):"custom"===e&&this._config&&"custom"!==this._config.remove_location_country&&"string"!=typeof this._config.remove_location_country&&this.setConfigValue("remove_location_country","USA|United States|Canada")}))}
                ${(()=>{if(!this._config||!this._config.hasOwnProperty("remove_location_country")||!0===this._config.remove_location_country||!1===this._config.remove_location_country||"true"===this._config.remove_location_country||"false"===this._config.remove_location_country)return Q``;const e=this._config.remove_location_country;return"string"==typeof e&&"true"!==e&&"false"!==e?Q`
                      <ha-textfield
                        label="${this._getTranslation("custom_country_pattern")}"
                        .value="${e}"
                        @change="${e=>this.setConfigValue("remove_location_country",e.target.value)}"
                      ></ha-textfield>
                      <div class="helper-text">
                        ${this._getTranslation("custom_country_pattern_note")}
                      </div>
                    `:Q``})()}
              `)()}

            <!-- Progress Indicators -->
            <h3>${this._getTranslation("progress_indicators")}</h3>
            ${this.addBooleanField("show_countdown",this._getTranslation("show_countdown"))}
            ${this.addBooleanField("show_progress_bar",this._getTranslation("show_progress_bar"))}
            ${(()=>!0!==this.getConfigValue("show_progress_bar")?Q``:Q`
                ${this.addTextField("progress_bar_color",this._getTranslation("progress_bar_color"))}
                ${this.addTextField("progress_bar_height",this._getTranslation("progress_bar_height"))}
                ${this.addTextField("progress_bar_width",this._getTranslation("progress_bar_width"))}
              `)()}

            <!-- Multi-day Event Handling -->
            <h3>${this._getTranslation("multiday_event_handling")}</h3>
            ${this.addBooleanField("split_multiday_events",this._getTranslation("split_multiday_events"))}
          `)}

        <!-- WEATHER INTEGRATION -->
        ${this.addExpansionPanel(this._getTranslation("weather_integration"),"M12.74,5.47C15.1,6.5 16.35,9.03 15.92,11.46C17.19,12.56 18,14.19 18,16V16.17C18.31,16.06 18.65,16 19,16A3,3 0 0,1 22,19A3,3 0 0,1 19,22H6A4,4 0 0,1 2,18A4,4 0 0,1 6,14H6.27C5,12.45 4.6,10.24 5.5,8.26C6.72,5.5 9.97,4.24 12.74,5.47M11.93,7.3C10.16,6.5 8.09,7.31 7.31,9.07C6.85,10.09 6.93,11.22 7.41,12.13C8.5,10.83 10.16,10 12,10C12.7,10 13.38,10.12 14,10.34C13.94,9.06 13.18,7.86 11.93,7.3M13.55,3.64C13,3.4 12.45,3.23 11.88,3.12L14.37,1.82L15.27,4.71C14.76,4.29 14.19,3.93 13.55,3.64M6.09,4.44C5.6,4.79 5.17,5.19 4.8,5.63L4.91,2.82L7.87,3.5C7.25,3.71 6.65,4.03 6.09,4.44M18,9.71C17.91,9.12 17.78,8.55 17.59,8L19.97,9.5L17.92,11.73C18.03,11.08 18.05,10.4 18,9.71M3.04,11.3C3.11,11.9 3.24,12.47 3.43,13L1.06,11.5L3.1,9.28C3,9.93 2.97,10.61 3.04,11.3M19,18H16V16A4,4 0 0,0 12,12A4,4 0 0,0 8,16H6A2,2 0 0,0 4,18A2,2 0 0,0 6,20H19A1,1 0 0,0 20,19A1,1 0 0,0 19,18Z",Q`
            <!-- Weather Entity & Position -->
            <h3>${this._getTranslation("weather_entity_position")}</h3>
            ${this.addEntityPickerField("weather.entity",this._getTranslation("weather_entity"),["weather"])}

            <!-- Only show the rest of the weather config when an entity is selected -->
            ${(()=>this.getConfigValue("weather.entity")?Q`
                ${this.addSelectField("weather.position",this._getTranslation("weather_position"),[{value:"none",label:this._getTranslation("none")},{value:"date",label:this._getTranslation("date")},{value:"event",label:this._getTranslation("event")},{value:"both",label:this._getTranslation("both")}])}

                <!-- Conditionally render weather settings based on selected position -->
                ${(()=>{const e=this.getConfigValue("weather.position","none");return Q`
                    ${"date"===e||"both"===e?Q`
                          <!-- Date Column Weather -->
                          <h3>${this._getTranslation("date_column_weather")}</h3>
                          ${this.addBooleanField("weather.date.show_conditions",this._getTranslation("show_conditions"))}
                          ${this.addBooleanField("weather.date.show_high_temp",this._getTranslation("show_high_temp"))}
                          ${this.addBooleanField("weather.date.show_low_temp",this._getTranslation("show_low_temp"))}
                          ${this.addTextField("weather.date.icon_size",this._getTranslation("icon_size"))}
                          ${this.addTextField("weather.date.font_size",this._getTranslation("font_size"))}
                          ${this.addTextField("weather.date.color",this._getTranslation("color"))}
                        `:Q``}
                    ${"event"===e||"both"===e?Q`
                          <!-- Event Row Weather -->
                          <h3>${this._getTranslation("event_row_weather")}</h3>
                          ${this.addBooleanField("weather.event.show_conditions",this._getTranslation("show_conditions"))}
                          ${this.addBooleanField("weather.event.show_temp",this._getTranslation("show_temp"))}
                          ${this.addTextField("weather.event.icon_size",this._getTranslation("icon_size"))}
                          ${this.addTextField("weather.event.font_size",this._getTranslation("font_size"))}
                          ${this.addTextField("weather.event.color",this._getTranslation("color"))}
                        `:Q``}
                  `})()}
              `:Q``)()}
          `)}

        <!-- INTERACTIONS -->
        ${this.addExpansionPanel(this._getTranslation("interactions"),"M10,9A1,1 0 0,1 11,8A1,1 0 0,1 12,9V13.47L13.21,13.6L18.15,15.79C18.68,16.03 19,16.56 19,17.14V21.5C18.97,22.32 18.32,22.97 17.5,23H11C10.62,23 10.26,22.85 10,22.57L5.1,18.37L5.84,17.6C6.03,17.39 6.3,17.28 6.58,17.28H6.8L10,19V9M9,12.44V9A2,2 0 0,1 11,7A2,2 0 0,1 13,9V12.44C14.19,11.75 15,10.47 15,9A4,4 0 0,0 11,5A4,4 0 0,0 7,9C7,10.47 7.81,11.75 9,12.44Z",Q`
            <!-- Tap Action -->
            <h3>${this._getTranslation("tap_action")}</h3>
            ${this._renderActionConfig("tap_action")}

            <!-- Hold Action -->
            <h3>${this._getTranslation("hold_action")}</h3>
            ${this._renderActionConfig("hold_action")}

            <!-- Refresh Settings -->
            <h3>${this._getTranslation("refresh_settings")}</h3>
            ${this.addTextField("refresh_interval",this._getTranslation("refresh_interval"),"number")}
            ${this.addBooleanField("refresh_on_navigate",this._getTranslation("refresh_on_navigate"))}
          `)}
      </div>
    `}addTextField(e,t,n,a){let i=this.getConfigValue(e,a);return void 0===i&&(i=""),Q`
      <ha-textfield
        name="${e}"
        label="${null!=t?t:this._getTranslation(e)}"
        type="${null!=n?n:"text"}"
        .value="${i}"
        @keyup="${this._valueChanged}"
        @change="${this._valueChanged}"
      ></ha-textfield>
    `}addEntityPickerField(e,t,n,a){return Q`
      <ha-entity-picker
        .hass="${this.hass}"
        name="${e}"
        label="${null!=t?t:this._getTranslation(e)}"
        .value="${this.getConfigValue(e,a)}"
        .includeDomains="${n}"
        @value-changed="${t=>{t.stopPropagation(),this.setConfigValue(e,t.detail.value)}}"
      ></ha-entity-picker>
    `}addBooleanField(e,t,n,a,i=!1){return Q`
      <ha-formfield label="${null!=t?t:this._getTranslation(e)}">
        <ha-switch
          name="${e}"
          .checked="${this.getConfigValue(e,n)}"
          @change="${e=>{i||this._valueChanged(e),a&&a(e)}}"
        ></ha-switch>
      </ha-formfield>
    `}addSelectField(e,t,n,a,i,r){return Q`
      <ha-select
        name="${e}"
        label="${null!=t?t:this._getTranslation(e)}"
        .value="${this.getConfigValue(e,i)}"
        .clearable="${null!=a&&a}"
        @change="${e=>{if(this._valueChanged(e),r&&e.target){const t=e.target.value;r(t)}}}"
        @closed="${e=>e.stopPropagation()}"
      >
        ${null==n?void 0:n.map((e=>Q`
            <mwc-list-item value="${e.value}">${e.label}</mwc-list-item>
          `))}
      </ha-select>
    `}addDateField(e,t,n){var a;let i=this.getConfigValue(e,n);void 0===i&&(i="");const r=!i||"string"!=typeof i&&"number"!=typeof i?"":function(e,t,n="YYYY-MM-DD"){if(!e||isNaN(e.getTime()))return"";if(!t||"YYYY-MM-DD"===t.date_format)return St(e);try{if(!t.date_format||"system"===t.date_format){const n=t.language||navigator.language;return new Intl.DateTimeFormat(n,{year:"numeric",month:"2-digit",day:"2-digit"}).format(e)}if("language"===t.date_format&&t.language)return new Intl.DateTimeFormat(t.language,{year:"numeric",month:"2-digit",day:"2-digit"}).format(e);if("DD/MM/YYYY"===t.date_format){const t=String(e.getDate()).padStart(2,"0");return`${t}/${String(e.getMonth()+1).padStart(2,"0")}/${e.getFullYear()}`}if("MM/DD/YYYY"===t.date_format){const t=String(e.getDate()).padStart(2,"0");return`${String(e.getMonth()+1).padStart(2,"0")}/${t}/${e.getFullYear()}`}}catch(e){console.warn("Error formatting date:",e)}return"YYYY-MM-DD"===n?St(e):(new Intl.DateTimeFormat).format(e)}(new Date(i),null==(a=this.hass)?void 0:a.locale);return Q`
      <div class="date-input">
        <div class="mdc-text-field mdc-text-field--filled">
          <!-- Ripple overlay element for hover effect -->
          <div class="mdc-text-field__ripple"></div>

          <span class="mdc-floating-label mdc-floating-label--float-above">
            ${null!=t?t:this._getTranslation(e)}
          </span>

          <div class="value-container">
            <span class="value-text">${r}</span>
          </div>
        </div>

        <input
          type="date"
          name="${e}"
          .value="${i}"
          @focus="${e=>{const t=e.target.closest(".date-input"),n=null==t?void 0:t.querySelector(".mdc-text-field"),a=null==t?void 0:t.querySelector(".mdc-floating-label"),i=null==t?void 0:t.querySelector(".mdc-text-field__ripple");n&&(n.classList.add("focused"),n.style.borderBottom="2px solid var(--primary-color)",a&&(a.style.color="var(--primary-color)")),i&&(i.style.opacity="0.08")}}"
          @blur="${e=>{const t=e.target.closest(".date-input"),n=null==t?void 0:t.querySelector(".mdc-text-field"),a=null==t?void 0:t.querySelector(".mdc-floating-label"),i=null==t?void 0:t.querySelector(".mdc-text-field__ripple");n&&(n.classList.remove("focused"),n.style.borderBottom="1px solid var(--mdc-text-field-idle-line-color, var(--secondary-text-color))",a&&(a.style.color="var(--mdc-select-label-ink-color, rgba(0,0,0,.6))")),i&&(i.style.opacity="0")}}"
          @mouseover="${e=>{const t=e.target.closest(".date-input"),n=null==t?void 0:t.querySelector(".mdc-text-field"),a=null==t?void 0:t.querySelector(".mdc-text-field__ripple");n&&!n.classList.contains("focused")&&(n.style.borderBottomColor="var(--primary-text-color)",a&&(a.style.opacity="0.04"))}}"
          @mouseout="${e=>{const t=e.target.closest(".date-input"),n=null==t?void 0:t.querySelector(".mdc-text-field"),a=null==t?void 0:t.querySelector(".mdc-text-field__ripple");n&&!n.classList.contains("focused")&&(n.style.borderBottomColor="var(--mdc-text-field-idle-line-color, var(--secondary-text-color))",a&&(a.style.opacity="0"))}}"
          @change="${e=>{this._valueChanged(e);const t=e.target,n=t.closest(".date-input"),a=null==n?void 0:n.querySelector(".value-container span");a&&t.value&&(a.textContent=new Date(t.value).toLocaleDateString())}}"
        />
      </div>
    `}addExpansionPanel(e,t,n,a){return Q`
      <ha-expansion-panel .header="${e}" .expanded="${null!=a&&a}" outlined>
        <ha-svg-icon slot="leading-icon" .path=${t}></ha-svg-icon>
        <div class="panel-content">${n}</div>
      </ha-expansion-panel>
    `}addButton(e,t,n){return Q`
      <ha-button @click="${n}">
        <ha-icon icon="${t}"></ha-icon>
        ${e}
      </ha-button>
    `}addIconPickerField(e,t){return Q`
      <ha-icon-picker
        .hass="${this.hass}"
        name="${e}"
        label="${null!=t?t:this._getTranslation(e)}"
        .value="${this.getConfigValue(e)}"
        @value-changed="${t=>{this.setConfigValue(e,t.detail.value)}}"
      ></ha-icon-picker>
    `}addTodayIndicatorField(e,t){const n=[{value:"none",label:this._getTranslation("none")},{value:"dot",label:this._getTranslation("dot")},{value:"pulse",label:this._getTranslation("pulse")},{value:"glow",label:this._getTranslation("glow")},{value:"icon",label:this._getTranslation("icon")},{value:"emoji",label:this._getTranslation("emoji")},{value:"image",label:this._getTranslation("image")}];return this._renderTypeSelector(e,null!=t?t:this._getTranslation(e),n,"indicator")}_renderCalendarEntity(e,t){const n="string"==typeof e,a=n?e:e.entity,i=n||!e.label?`${this._getTranslation("calendar")}: ${a}`:`${this._getTranslation("calendar")}: ${e.label} (${a})`;return Q`
      ${this.addExpansionPanel(i,"M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",Q`
          <!-- Entity Identification Section -->
          <div class="editor-section">
            <h4>${this._getTranslation("entity_identification")}</h4>
            ${this.addEntityPickerField(`entities.${t}${n?"":".entity"}`,this._getTranslation("entity"),["calendar"])}
          </div>

          ${n?Q``:Q`
                <!-- Display Settings Section -->
                <div class="editor-section">
                  <h4>${this._getTranslation("display_settings")}</h4>

                  <div class="subsection">
                    <h5>${this._getTranslation("label")}</h5>
                    ${(()=>{const e=`entities.${t}.label`,n=[{value:"none",label:this._getTranslation("none")},{value:"text",label:this._getTranslation("text_emoji")},{value:"icon",label:this._getTranslation("icon")},{value:"image",label:this._getTranslation("image")}];return this._renderTypeSelector(e,this._getTranslation("label_type"),n,"label")})()}
                    <div class="helper-text">${this._getTranslation("label_note")}</div>
                  </div>

                  <div class="subsection">
                    <h5>${this._getTranslation("colors")}</h5>
                    ${this.addTextField(`entities.${t}.color`,this._getTranslation("event_color"))}
                    <div class="helper-text">${this._getTranslation("entity_color_note")}</div>

                    ${this.addTextField(`entities.${t}.accent_color`,this._getTranslation("accent_color"))}
                    <div class="helper-text">
                      ${this._getTranslation("entity_accent_color_note")}
                    </div>
                  </div>
                </div>

                <!-- Event Filtering Section -->
                <div class="editor-section">
                  <h4>${this._getTranslation("event_filtering")}</h4>

                  ${this.addTextField(`entities.${t}.blocklist`,this._getTranslation("blocklist"))}
                  <div class="helper-text">${this._getTranslation("blocklist_note")}</div>

                  ${this.addTextField(`entities.${t}.allowlist`,this._getTranslation("allowlist"))}
                  <div class="helper-text">${this._getTranslation("allowlist_note")}</div>
                </div>

                <!-- Entity Overrides Section -->
                <div class="editor-section">
                  <h4>${this._getTranslation("entity_overrides")}</h4>
                  <div class="helper-text section-note">
                    ${this._getTranslation("entity_overrides_note")}
                  </div>

                  ${this.addTextField(`entities.${t}.compact_events_to_show`,this._getTranslation("compact_events_to_show"),"number")}
                  <div class="helper-text">
                    ${this._getTranslation("entity_compact_events_note")}
                  </div>

                  ${this.addBooleanField(`entities.${t}.show_time`,this._getTranslation("show_time"))}
                  <div class="helper-text">${this._getTranslation("entity_show_time_note")}</div>

                  ${this.addBooleanField(`entities.${t}.show_location`,this._getTranslation("show_location"))}
                  <div class="helper-text">
                    ${this._getTranslation("entity_show_location_note")}
                  </div>

                  ${this.addBooleanField(`entities.${t}.split_multiday_events`,this._getTranslation("split_multiday_events"))}
                  <div class="helper-text">
                    ${this._getTranslation("entity_split_multiday_note")}
                  </div>
                </div>
              `}

          <!-- Entity Action Buttons -->
          <div class="editor-section button-section">
            ${this.addButton(this._getTranslation("remove"),"mdi:trash-can",(()=>this._removeCalendarEntity(t)))}
            ${n?Q`
                  ${this.addButton(this._getTranslation("convert_to_advanced"),"mdi:code-json",(()=>this._convertEntityToObject(t)))}
                `:Q``}
          </div>
        `)}
    `}_renderCalendarEntities(){var e;const t=(null==(e=this._config)?void 0:e.entities)||[];return Q`
      ${t.map(((e,t)=>this._renderCalendarEntity(e,t)))}
      ${this.addButton(this._getTranslation("add_calendar"),"mdi:plus",(()=>this._addCalendarEntity()))}
    `}_addCalendarEntity(){var e;const t=[...(null==(e=this._config)?void 0:e.entities)||[]];t.push({entity:"calendar.calendar"}),this.setConfigValue("entities",t)}_removeCalendarEntity(e){var t;const n=[...(null==(t=this._config)?void 0:t.entities)||[]];n.splice(e,1),this.setConfigValue("entities",n)}_convertEntityToObject(e){var t;const n=[...(null==(t=this._config)?void 0:t.entities)||[]],a=n[e];n[e]={entity:a},this.setConfigValue("entities",n)}_renderActionConfig(e){const t=this.getConfigValue(e,{action:"none"}),n=t.action||"none";return Q`
      <div class="action-config">
        <ha-select
          name="${e}.action"
          .value="${n}"
          @change="${this._valueChanged}"
          @closed="${e=>e.stopPropagation()}"
        >
          <mwc-list-item value="none">${this._getTranslation("none")}</mwc-list-item>
          <mwc-list-item value="expand">${this._getTranslation("expand")}</mwc-list-item>
          <mwc-list-item value="more-info">${this._getTranslation("more_info")}</mwc-list-item>
          <mwc-list-item value="navigate">${this._getTranslation("navigate")}</mwc-list-item>
          <mwc-list-item value="url">${this._getTranslation("url")}</mwc-list-item>
          <mwc-list-item value="call-service"
            >${this._getTranslation("call_service")}</mwc-list-item
          >
        </ha-select>

        ${"navigate"===n?Q`
              <ha-textfield
                name="${e}.navigation_path"
                .value="${t.navigation_path||""}"
                label="${this._getTranslation("navigation_path")}"
                @change="${this._valueChanged}"
              ></ha-textfield>
            `:Q``}
        ${"url"===n?Q`
              <ha-textfield
                name="${e}.url_path"
                .value="${t.url_path||""}"
                label="${this._getTranslation("url_path")}"
                @change="${this._valueChanged}"
              ></ha-textfield>
            `:Q``}
        ${"call-service"===n?Q`
              <ha-textfield
                name="${e}.service"
                .value="${t.service||""}"
                label="${this._getTranslation("service")}"
                @change="${this._valueChanged}"
              ></ha-textfield>
              <ha-textfield
                name="${e}.service_data"
                .value="${t.service_data?JSON.stringify(t.service_data):"{}"}"
                label="${this._getTranslation("service_data")}"
                @change="${this._serviceDataChanged}"
              ></ha-textfield>
            `:Q``}
      </div>
    `}getValueType(e,t="label"){return e&&!1!==e?!0===e?"indicator"===t?"dot":"none":"string"==typeof e?e.startsWith("mdi:")?"icon":e.startsWith("/")||/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(e)?"image":"indicator"===t?["dot","pulse","glow"].includes(e)?e:"emoji":"text":"none":"none"}_handleValueTypeChange(e,t,n,a="label"){e.stopPropagation();const i=e.target.value;let r;"none"===i?r="indicator"!==a&&void 0:"icon"===i?r="string"==typeof n&&n.startsWith("mdi:")?n:"indicator"===a?"mdi:star":"mdi:calendar":"image"===i?r="string"==typeof n&&(n.startsWith("/")||/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(n))?n:"indicator"===a?"/local/image.jpg":"/local/calendar.jpg":"indicator"===a?["dot","pulse","glow"].includes(i)?r=i:"emoji"===i&&(r="string"!=typeof n||n.startsWith("mdi:")||/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(n)||/^\/local\//i.test(n)||["dot","pulse","glow"].includes(n)?"🗓️":n):"text"===i&&(r="string"==typeof n&&"text"===this.getValueType(n,"label")?n:"📅"),this.setConfigValue(t,r)}_renderTypeSelector(e,t,n,a="label"){const i=this.getConfigValue(e),r=this.getValueType(i,a);return Q`
      <div class="type-selector-field">
        <ha-select
          name="${e}_type"
          label="${t}"
          .value="${r}"
          @change="${t=>this._handleValueTypeChange(t,e,i,a)}"
          @closed="${e=>e.stopPropagation()}"
        >
          ${n.map((e=>Q` <mwc-list-item value="${e.value}">${e.label}</mwc-list-item> `))}
        </ha-select>

        ${this._renderTypeField(r,e,i,a)}
      </div>
    `}_renderTypeField(e,t,n,a){if("icon"===e)return Q`
        <div class="icon-picker-wrapper">
          <ha-icon-picker
            .hass="${this.hass}"
            .value="${n}"
            @value-changed="${e=>{const n=e.detail.value;if(n){const e=n.startsWith("mdi:")?n:`mdi:${n}`;this.setConfigValue(t,e)}else this.setConfigValue(t,"indicator"===a?"dot":"")}}"
          ></ha-icon-picker>
        </div>
      `;if("emoji"===e||"text"===e){const a="emoji"===e?this._getTranslation("emoji_value"):this._getTranslation("text_value"),i="emoji"===e?this._getTranslation("emoji_indicator_note"):this._getTranslation("text_label_note");return Q`
        <ha-textfield
          name="${t}"
          label="${a}"
          .value="${n}"
          @change="${this._valueChanged}"
        ></ha-textfield>
        <div class="helper-text">${i}</div>
      `}return"image"===e?Q`
        <ha-textfield
          name="${t}"
          label="${this._getTranslation("image_path")}"
          .value="${n}"
          @change="${this._valueChanged}"
        ></ha-textfield>
        <div class="helper-text">${this._getTranslation("image_indicator_note")}</div>
      `:Q``}}di([$e({attribute:!1})],hi.prototype,"hass"),di([$e({attribute:!1})],hi.prototype,"_config");var ui=Object.defineProperty,mi=Object.defineProperties,pi=Object.getOwnPropertyDescriptor,gi=Object.getOwnPropertyDescriptors,fi=Object.getOwnPropertySymbols,yi=Object.prototype.hasOwnProperty,vi=Object.prototype.propertyIsEnumerable,wi=(e,t,n)=>t in e?ui(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,bi=(e,t)=>{for(var n in t||(t={}))yi.call(t,n)&&wi(e,n,t[n]);if(fi)for(var n of fi(t))vi.call(t,n)&&wi(e,n,t[n]);return e},Mi=(e,t,n,a)=>{for(var i,r=a>1?void 0:a?pi(t,n):t,o=e.length-1;o>=0;o--)(i=e[o])&&(r=(a?i(t,n,r):i(r))||r);return a&&r&&ui(t,n,r),r};let Ti=class extends ve{constructor(){super(),this.config=bi({},rt),this.events=[],this.isLoading=!0,this.isExpanded=!1,this.weatherForecasts={daily:{},hourly:{}},this._instanceId=$t(),this._language="",this._lastUpdateTime=Date.now(),this._weatherUnsubscribers=[],this._activePointerId=null,this._holdTriggered=!1,this._holdTimer=null,this._holdIndicator=null,this._handleVisibilityChange=()=>{if("visible"===document.visibilityState){Date.now()-this._lastUpdateTime>Ee&&(nt("Visibility changed to visible, updating events"),this.updateEvents())}},this._instanceId=$t(),Qe(De)}static getConfigElement(){return document.createElement("calendar-card-pro-editor")}get safeHass(){return this.hass||null}get effectiveLanguage(){return!this._language&&this.hass&&(this._language=Mt(this.config.language,this.hass.locale)),this._language||"en"}get groupedEvents(){return da(this.events,this.config,this.isExpanded,this.effectiveLanguage)}static get styles(){return $a}connectedCallback(){super.connectedCallback(),nt("Component connected"),this.startRefreshTimer(),this.updateEvents(),this._setupWeatherSubscriptions(),document.addEventListener("visibilitychange",this._handleVisibilityChange)}disconnectedCallback(){super.disconnectedCallback(),this._cleanupWeatherSubscriptions(),this._refreshTimerId&&clearTimeout(this._refreshTimerId),this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._holdIndicator&&(Da(this._holdIndicator),this._holdIndicator=null),document.removeEventListener("visibilitychange",this._handleVisibilityChange),nt("Component disconnected")}updated(e){var t,n,a,i,r,o,s;(e.has("hass")&&(null==(t=this.hass)?void 0:t.locale)||e.has("config")&&(null==(n=e.get("config"))?void 0:n.language)!==this.config.language)&&(this._language=Mt(this.config.language,null==(a=this.hass)?void 0:a.locale)),e.has("config")&&(null==(r=null==(i=this.config)?void 0:i.weather)?void 0:r.entity)!==(null==(s=null==(o=e.get("config"))?void 0:o.weather)?void 0:s.entity)&&this._setupWeatherSubscriptions()}getCustomStyles(){return function(e){var t,n,a,i,r,o,s,l,d,c,_,h;const u={"--calendar-card-background-color":e.background_color,"--calendar-card-font-size-weekday":e.weekday_font_size,"--calendar-card-font-size-day":e.day_font_size,"--calendar-card-font-size-month":e.month_font_size,"--calendar-card-font-size-event":e.event_font_size,"--calendar-card-font-size-time":e.time_font_size,"--calendar-card-font-size-location":e.location_font_size,"--calendar-card-color-weekday":e.weekday_color,"--calendar-card-color-day":e.day_color,"--calendar-card-color-month":e.month_color,"--calendar-card-color-event":e.event_color,"--calendar-card-color-time":e.time_color,"--calendar-card-color-location":e.location_color,"--calendar-card-line-color-vertical":e.accent_color,"--calendar-card-line-width-vertical":e.vertical_line_width,"--calendar-card-day-spacing":e.day_spacing,"--calendar-card-event-spacing":e.event_spacing,"--calendar-card-spacing-additional":e.additional_card_spacing,"--calendar-card-height":e.height||"auto","--calendar-card-max-height":e.max_height,"--calendar-card-progress-bar-color":e.progress_bar_color,"--calendar-card-progress-bar-height":e.progress_bar_height,"--calendar-card-progress-bar-width":e.progress_bar_width,"--calendar-card-icon-size-time":e.time_icon_size||"14px","--calendar-card-icon-size-location":e.location_icon_size||"14px","--calendar-card-date-column-width":1.75*parseFloat(e.day_font_size)+"px","--calendar-card-date-column-vertical-alignment":e.date_vertical_alignment,"--calendar-card-event-border-radius":"calc(var(--ha-card-border-radius, 10px) / 2)","--ha-ripple-hover-opacity":"0.04","--ha-ripple-hover-color":e.accent_color,"--ha-ripple-pressed-opacity":"0.12","--ha-ripple-pressed-color":e.accent_color,"--calendar-card-today-indicator-color":e.today_indicator_color,"--calendar-card-today-indicator-size":e.today_indicator_size,"--calendar-card-week-number-font-size":e.week_number_font_size,"--calendar-card-week-number-color":e.week_number_color,"--calendar-card-week-number-bg-color":e.week_number_background_color,"--calendar-card-empty-day-color":e.empty_day_color===rt.empty_day_color?"color-mix(in srgb, var(--primary-text-color) 60%, transparent)":e.empty_day_color,"--calendar-card-weather-date-icon-size":(null==(n=null==(t=e.weather)?void 0:t.date)?void 0:n.icon_size)||"14px","--calendar-card-weather-date-font-size":(null==(i=null==(a=e.weather)?void 0:a.date)?void 0:i.font_size)||"12px","--calendar-card-weather-date-color":(null==(o=null==(r=e.weather)?void 0:r.date)?void 0:o.color)||"var(--primary-text-color)","--calendar-card-weather-event-icon-size":(null==(l=null==(s=e.weather)?void 0:s.event)?void 0:l.icon_size)||"14px","--calendar-card-weather-event-font-size":(null==(c=null==(d=e.weather)?void 0:d.event)?void 0:c.font_size)||"12px","--calendar-card-weather-event-color":(null==(h=null==(_=e.weather)?void 0:_.event)?void 0:h.color)||"var(--primary-text-color)"};return e.title_font_size&&(u["--calendar-card-font-size-title"]=e.title_font_size),e.title_color&&(u["--calendar-card-color-title"]=e.title_color),u}(this.config)}startRefreshTimer(){this._refreshTimerId&&clearTimeout(this._refreshTimerId);const e=this.config.refresh_interval||xe,t=60*e*1e3;this._refreshTimerId=window.setTimeout((()=>{this.updateEvents(),this.startRefreshTimer()}),t),nt(`Scheduled next refresh in ${e} minutes`)}_setupWeatherSubscriptions(){var e,t;if(this._cleanupWeatherSubscriptions(),!(null==(t=null==(e=this.config)?void 0:e.weather)?void 0:t.entity)||!this.hass)return;(function(e){if(!e||!e.entity)return[];return"date"===(e.position||"date")?["daily"]:["daily","hourly"]})(this.config.weather).forEach((e=>{const t=function(e,t,n,a){var i;if(!(null==e?void 0:e.connection)||!(null==(i=null==t?void 0:t.weather)?void 0:i.entity))return;const r=t.weather.entity;try{return e.connection.subscribeMessage((e=>{if(e&&Array.isArray(e.forecast)){const t=Ua(e.forecast,n);a(t)}}),{type:"weather/subscribe_forecast",forecast_type:n,entity_id:r})}catch(e){return void Xe("Failed to subscribe to weather forecast",{entity:r,forecast_type:n,error:e})}}(this.hass,this.config,e,(t=>{var n;this.weatherForecasts=(n=bi({},this.weatherForecasts),mi(n,gi({[e]:t}))),this.requestUpdate()}));t&&this._weatherUnsubscribers.push(t)}))}_cleanupWeatherSubscriptions(){this._weatherUnsubscribers.forEach((e=>{"function"==typeof e&&e()})),this._weatherUnsubscribers=[]}_handlePointerDown(e){var t;this._activePointerId=e.pointerId,this._holdTriggered=!1,"none"!==(null==(t=this.config.hold_action)?void 0:t.action)&&(this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=window.setTimeout((()=>{this._activePointerId===e.pointerId&&(this._holdTriggered=!0,this._holdIndicator=function(e,t){const n=document.createElement("div");n.style.position="absolute",n.style.pointerEvents="none",n.style.borderRadius="50%",n.style.backgroundColor=t.accent_color,n.style.opacity=`${Ae}`,n.style.transform="translate(-50%, -50%) scale(0)",n.style.transition=`transform ${He}ms ease-out`,n.style.left=e.pageX+"px",n.style.top=e.pageY+"px";const a="touch"===e.pointerType?Fe.TOUCH_SIZE:Fe.POINTER_SIZE;return n.style.width=`${a}px`,n.style.height=`${a}px`,document.body.appendChild(n),setTimeout((()=>{n.style.transform="translate(-50%, -50%) scale(1)"}),10),nt("Created hold indicator"),n}(e,this.config))}),je))}_handlePointerUp(e){if(e.pointerId===this._activePointerId){if(this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._holdTriggered&&this.config.hold_action){nt("Executing hold action");const e=Ta(this.config.entities);ka(this.config.hold_action,this.safeHass,this,e,(()=>this.toggleExpanded()))}else if(!this._holdTriggered&&this.config.tap_action){nt("Executing tap action");const e=Ta(this.config.entities);ka(this.config.tap_action,this.safeHass,this,e,(()=>this.toggleExpanded()))}this._activePointerId=null,this._holdTriggered=!1,this._holdIndicator&&(Da(this._holdIndicator),this._holdIndicator=null)}}_handlePointerCancel(){this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._activePointerId=null,this._holdTriggered=!1,this._holdIndicator&&(Da(this._holdIndicator),this._holdIndicator=null)}_handleKeyDown(e){if("Enter"===e.key||" "===e.key){e.preventDefault();const t=Ta(this.config.entities);ka(this.config.tap_action,this.safeHass,this,t,(()=>this.toggleExpanded()))}}setConfig(e){var t,n,a,i,r,o;const s=this.config;let l=bi(bi({},rt),e);var d;this.config=l,this.config.entities=(d=this.config.entities,Array.isArray(d)?d.map((e=>"string"==typeof e?{entity:e,color:"var(--primary-text-color)",accent_color:"var(--calendar-card-line-color-vertical)"}:"object"==typeof e&&e.entity?{entity:e.entity,label:e.label,color:e.color||"var(--primary-text-color)",accent_color:e.accent_color||"var(--calendar-card-line-color-vertical)",show_time:e.show_time,show_location:e.show_location,compact_events_to_show:e.compact_events_to_show,blocklist:e.blocklist,allowlist:e.allowlist,split_multiday_events:e.split_multiday_events}:null)).filter(Boolean):[]),this._instanceId=Dt(this.config.entities,this.config.days_to_show,this.config.show_past_events,this.config.start_date);((null==(n=null==(t=this.config)?void 0:t.weather)?void 0:n.entity)!==(null==(a=e.weather)?void 0:a.entity)||(null==(r=null==(i=this.config)?void 0:i.weather)?void 0:r.position)!==(null==(o=e.weather)?void 0:o.position))&&this._setupWeatherSubscriptions();(function(e,t){if(!e||0===Object.keys(e).length)return!0;const n=(e.entities||[]).map((e=>"string"==typeof e?e:e.entity)).sort().join(","),a=(t.entities||[]).map((e=>"string"==typeof e?e:e.entity)).sort().join(","),i=(null==e?void 0:e.refresh_interval)!==(null==t?void 0:t.refresh_interval),r=n!==a||e.days_to_show!==t.days_to_show||e.start_date!==t.start_date||e.show_past_events!==t.show_past_events||e.filter_duplicates!==t.filter_duplicates;return(r||i)&&nt("Configuration change requires data refresh"),r||i})(s,this.config)&&(nt("Configuration changed, refreshing data"),this.updateEvents(!0)),this.startRefreshTimer()}async updateEvents(e=!1){if(nt(`Updating events (force=${e})`),this.safeHass&&this.config.entities.length){try{this.isLoading=!0,await this.updateComplete;const t=await la(this.safeHass,this.config,this._instanceId,e);this.isLoading=!1,await this.updateComplete,this.events=[...t],this._lastUpdateTime=Date.now(),tt("Event update completed successfully")}catch(e){Xe("Failed to update events:",e),this.isLoading=!1}this._setupWeatherSubscriptions()}else this.isLoading=!1}toggleExpanded(){(this.config.compact_events_to_show||this.config.compact_days_to_show)&&(this.isExpanded=!this.isExpanded)}handleAction(e){const t=Ta(this.config.entities);ka(e,this.safeHass,this,t,(()=>this.toggleExpanded()))}render(){const e=this.getCustomStyles(),t={keyDown:e=>this._handleKeyDown(e),pointerDown:e=>this._handlePointerDown(e),pointerUp:e=>this._handlePointerUp(e),pointerCancel:()=>this._handlePointerCancel(),pointerLeave:()=>this._handlePointerCancel()};let n;if(this.isLoading)n=Ba("loading",this.effectiveLanguage);else if(this.safeHass&&this.config.entities.length)if(0===this.events.length){n=ti(da([],this.config,this.isExpanded,this.effectiveLanguage),this.config,this.effectiveLanguage,this.weatherForecasts,this.safeHass)}else n=ti(this.groupedEvents,this.config,this.effectiveLanguage,this.weatherForecasts,this.safeHass);else n=Ba("error",this.effectiveLanguage);return function(e,t,n,a,i=!1){return Q`
    <ha-card
      class="calendar-card-pro ${i?"max-height-set":""}"
      style=${za(e)}
      tabindex="0"
      @keydown=${a.keyDown}
      @pointerdown=${a.pointerDown}
      @pointerup=${a.pointerUp}
      @pointercancel=${a.pointerCancel}
      @pointerleave=${a.pointerLeave}
    >
      <ha-ripple></ha-ripple>

      <!-- Title is always rendered with the same structure, even if empty -->
      <div class="header-container">
        ${t?Q`<h1 class="card-header">${t}</h1>`:Q`<div class="card-header-placeholder"></div>`}
      </div>

      <!-- Content container is always present -->
      <div class="content-container">${n}</div>
    </ha-card>
  `}(e,this.config.title,n,t)}};var ki;Ti.getStubConfig=ot,Mi([$e({attribute:!1})],Ti.prototype,"hass",2),Mi([$e({attribute:!1})],Ti.prototype,"config",2),Mi([$e({attribute:!1})],Ti.prototype,"events",2),Mi([$e({attribute:!1})],Ti.prototype,"isLoading",2),Mi([$e({attribute:!1})],Ti.prototype,"isExpanded",2),Mi([$e({attribute:!1})],Ti.prototype,"weatherForecasts",2),Ti=Mi([(ki="calendar-card-pro",(e,t)=>{void 0!==t?t.addInitializer((()=>{customElements.define(ki,e)})):customElements.define(ki,e)})],Ti),customElements.define("calendar-card-pro-editor",hi);const $i=customElements.get("calendar-card-pro");$i&&($i.getStubConfig=ot),window.customCards=window.customCards||[],window.customCards.push({type:"calendar-card-pro",name:"Calendar Card Pro",preview:!0,description:"A calendar card that supports multiple calendars with individual styling.",documentationURL:"https://github.com/alexpfau/calendar-card-pro"});
//# sourceMappingURL=calendar-card-pro.js.map
