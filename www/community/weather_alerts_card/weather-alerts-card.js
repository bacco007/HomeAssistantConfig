var as,ls,cs,ds,hs,us;function Y(t,e,i,r){var s=arguments.length,o=s<3?e:r===null?r=Object.getOwnPropertyDescriptor(e,i):r,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(o=(s<3?n(o):s>3?n(e,i,o):n(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o}typeof SuppressedError=="function"&&SuppressedError;/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _t=globalThis,qt=_t.ShadowRoot&&(_t.ShadyCSS===void 0||_t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Yt=Symbol(),Vi=new WeakMap;let Ki=class{constructor(e,i,r){if(this._$cssResult$=!0,r!==Yt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o;const i=this.t;if(qt&&e===void 0){const r=i!==void 0&&i.length===1;r&&(e=Vi.get(i)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Vi.set(i,e))}return e}toString(){return this.cssText}};const xs=t=>new Ki(typeof t=="string"?t:t+"",void 0,Yt),Xi=(t,...e)=>{const i=t.length===1?t[0]:e.reduce((r,s,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new Ki(i,t,Yt)},As=(t,e)=>{if(qt)t.adoptedStyleSheets=e.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(const i of e){const r=document.createElement("style"),s=_t.litNonce;s!==void 0&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}},Qi=qt?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(const r of e.cssRules)i+=r.cssText;return xs(i)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:$s,defineProperty:Es,getOwnPropertyDescriptor:Cs,getOwnPropertyNames:Ss,getOwnPropertySymbols:Ds,getPrototypeOf:Ts}=Object,de=globalThis,Ji=de.trustedTypes,ks=Ji?Ji.emptyScript:"",Zt=de.reactiveElementPolyfillSupport,Ze=(t,e)=>t,vt={toAttribute(t,e){switch(e){case Boolean:t=t?ks:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},Vt=(t,e)=>!$s(t,e),er={attribute:!0,type:String,converter:vt,reflect:!1,useDefault:!1,hasChanged:Vt};(as=Symbol.metadata)!=null||(Symbol.metadata=Symbol("metadata")),(ls=de.litPropertyMetadata)!=null||(de.litPropertyMetadata=new WeakMap);let Fe=class extends HTMLElement{static addInitializer(e){var i;this._$Ei(),((i=this.l)!=null?i:this.l=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=er){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){const r=Symbol(),s=this.getPropertyDescriptor(e,r,i);s!==void 0&&Es(this.prototype,e,s)}}static getPropertyDescriptor(e,i,r){var n;const{get:s,set:o}=(n=Cs(this.prototype,e))!=null?n:{get(){return this[i]},set(l){this[i]=l}};return{get:s,set(l){const d=s==null?void 0:s.call(this);o==null||o.call(this,l),this.requestUpdate(e,d,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){var i;return(i=this.elementProperties.get(e))!=null?i:er}static _$Ei(){if(this.hasOwnProperty(Ze("elementProperties")))return;const e=Ts(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Ze("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ze("properties"))){const i=this.properties,r=[...Ss(i),...Ds(i)];for(const s of r)this.createProperty(s,i[s])}const e=this[Symbol.metadata];if(e!==null){const i=litPropertyMetadata.get(e);if(i!==void 0)for(const[r,s]of i)this.elementProperties.set(r,s)}this._$Eh=new Map;for(const[i,r]of this.elementProperties){const s=this._$Eu(i,r);s!==void 0&&this._$Eh.set(s,i)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const i=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const s of r)i.unshift(Qi(s))}else e!==void 0&&i.push(Qi(e));return i}static _$Eu(e,i){const r=i.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(i=>i(this))}addController(e){var i,r;((i=this._$EO)!=null?i:this._$EO=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&((r=e.hostConnected)==null||r.call(e))}removeController(e){var i;(i=this._$EO)==null||i.delete(e)}_$E_(){const e=new Map,i=this.constructor.elementProperties;for(const r of i.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){var i;const e=(i=this.shadowRoot)!=null?i:this.attachShadow(this.constructor.shadowRootOptions);return As(e,this.constructor.elementStyles),e}connectedCallback(){var e,i;(e=this.renderRoot)!=null||(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(i=this._$EO)==null||i.forEach(r=>{var s;return(s=r.hostConnected)==null?void 0:s.call(r)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(i=>{var r;return(r=i.hostDisconnected)==null?void 0:r.call(i)})}attributeChangedCallback(e,i,r){this._$AK(e,r)}_$ET(e,i){var o;const r=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,r);if(s!==void 0&&r.reflect===!0){const n=(((o=r.converter)==null?void 0:o.toAttribute)!==void 0?r.converter:vt).toAttribute(i,r.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,i){var o,n,l;const r=this.constructor,s=r._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const d=r.getPropertyOptions(s),h=typeof d.converter=="function"?{fromAttribute:d.converter}:((o=d.converter)==null?void 0:o.fromAttribute)!==void 0?d.converter:vt;this._$Em=s;const g=h.fromAttribute(i,d.type);this[s]=(l=g!=null?g:(n=this._$Ej)==null?void 0:n.get(s))!=null?l:g,this._$Em=null}}requestUpdate(e,i,r,s=!1,o){var n,l;if(e!==void 0){const d=this.constructor;if(s===!1&&(o=this[e]),r!=null||(r=d.getPropertyOptions(e)),!(((n=r.hasChanged)!=null?n:Vt)(o,i)||r.useDefault&&r.reflect&&o===((l=this._$Ej)==null?void 0:l.get(e))&&!this.hasAttribute(d._$Eu(e,r))))return;this.C(e,i,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,i,{useDefault:r,reflect:s,wrapped:o},n){var l,d,h;r&&!((l=this._$Ej)!=null?l:this._$Ej=new Map).has(e)&&(this._$Ej.set(e,(d=n!=null?n:i)!=null?d:this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(i=void 0),this._$AL.set(e,i)),s===!0&&this._$Em!==e&&((h=this._$Eq)!=null?h:this._$Eq=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(i){Promise.reject(i)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var r,s;if(!this.isUpdatePending)return;if(!this.hasUpdated){if((r=this.renderRoot)!=null||(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,l]of this._$Ep)this[n]=l;this._$Ep=void 0}const o=this.constructor.elementProperties;if(o.size>0)for(const[n,l]of o){const{wrapped:d}=l,h=this[n];d!==!0||this._$AL.has(n)||h===void 0||this.C(n,void 0,l,h)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),(s=this._$EO)==null||s.forEach(o=>{var n;return(n=o.hostUpdate)==null?void 0:n.call(o)}),this.update(i)):this._$EM()}catch(o){throw e=!1,this._$EM(),o}e&&this._$AE(i)}willUpdate(e){}_$AE(e){var i;(i=this._$EO)==null||i.forEach(r=>{var s;return(s=r.hostUpdated)==null?void 0:s.call(r)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(i=>this._$ET(i,this[i]))),this._$EM()}updated(e){}firstUpdated(e){}};Fe.elementStyles=[],Fe.shadowRootOptions={mode:"open"},Fe[Ze("elementProperties")]=new Map,Fe[Ze("finalized")]=new Map,Zt==null||Zt({ReactiveElement:Fe}),((cs=de.reactiveElementVersions)!=null?cs:de.reactiveElementVersions=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ve=globalThis,tr=t=>t,bt=Ve.trustedTypes,ir=bt?bt.createPolicy("lit-html",{createHTML:t=>t}):void 0,rr="$lit$",he=`lit$${Math.random().toFixed(9).slice(2)}$`,sr="?"+he,Ls=`<${sr}>`,ye=document,Ke=()=>ye.createComment(""),Xe=t=>t===null||typeof t!="object"&&typeof t!="function",Kt=Array.isArray,Ms=t=>Kt(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",Xt=`[ 	
\f\r]`,Qe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,or=/-->/g,nr=/>/g,xe=RegExp(`>|${Xt}(?:([^\\s"'>=/]+)(${Xt}*=${Xt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ar=/'/g,lr=/"/g,cr=/^(?:script|style|textarea|title)$/i,dr=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),b=dr(1),wt=dr(2),Ae=Symbol.for("lit-noChange"),v=Symbol.for("lit-nothing"),hr=new WeakMap,$e=ye.createTreeWalker(ye,129);function ur(t,e){if(!Kt(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return ir!==void 0?ir.createHTML(e):e}const zs=(t,e)=>{const i=t.length-1,r=[];let s,o=e===2?"<svg>":e===3?"<math>":"",n=Qe;for(let l=0;l<i;l++){const d=t[l];let h,g,p=-1,f=0;for(;f<d.length&&(n.lastIndex=f,g=n.exec(d),g!==null);)f=n.lastIndex,n===Qe?g[1]==="!--"?n=or:g[1]!==void 0?n=nr:g[2]!==void 0?(cr.test(g[2])&&(s=RegExp("</"+g[2],"g")),n=xe):g[3]!==void 0&&(n=xe):n===xe?g[0]===">"?(n=s!=null?s:Qe,p=-1):g[1]===void 0?p=-2:(p=n.lastIndex-g[2].length,h=g[1],n=g[3]===void 0?xe:g[3]==='"'?lr:ar):n===lr||n===ar?n=xe:n===or||n===nr?n=Qe:(n=xe,s=void 0);const _=n===xe&&t[l+1].startsWith("/>")?" ":"";o+=n===Qe?d+Ls:p>=0?(r.push(h),d.slice(0,p)+rr+d.slice(p)+he+_):d+he+(p===-2?l:_)}return[ur(t,o+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};let Qt=class ps{constructor({strings:e,_$litType$:i},r){let s;this.parts=[];let o=0,n=0;const l=e.length-1,d=this.parts,[h,g]=zs(e,i);if(this.el=ps.createElement(h,r),$e.currentNode=this.el.content,i===2||i===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(s=$e.nextNode())!==null&&d.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const p of s.getAttributeNames())if(p.endsWith(rr)){const f=g[n++],_=s.getAttribute(p).split(he),x=/([.?@])?(.*)/.exec(f);d.push({type:1,index:o,name:x[2],strings:_,ctor:x[1]==="."?Fs:x[1]==="?"?Is:x[1]==="@"?Ps:yt}),s.removeAttribute(p)}else p.startsWith(he)&&(d.push({type:6,index:o}),s.removeAttribute(p));if(cr.test(s.tagName)){const p=s.textContent.split(he),f=p.length-1;if(f>0){s.textContent=bt?bt.emptyScript:"";for(let _=0;_<f;_++)s.append(p[_],Ke()),$e.nextNode(),d.push({type:2,index:++o});s.append(p[f],Ke())}}}else if(s.nodeType===8)if(s.data===sr)d.push({type:2,index:o});else{let p=-1;for(;(p=s.data.indexOf(he,p+1))!==-1;)d.push({type:7,index:o}),p+=he.length-1}o++}}static createElement(e,i){const r=ye.createElement("template");return r.innerHTML=e,r}};function Ie(t,e,i=t,r){var n,l,d;if(e===Ae)return e;let s=r!==void 0?(n=i._$Co)==null?void 0:n[r]:i._$Cl;const o=Xe(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==o&&((l=s==null?void 0:s._$AO)==null||l.call(s,!1),o===void 0?s=void 0:(s=new o(t),s._$AT(t,i,r)),r!==void 0?((d=i._$Co)!=null?d:i._$Co=[])[r]=s:i._$Cl=s),s!==void 0&&(e=Ie(t,s._$AS(t,e.values),s,r)),e}let Rs=class{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var h;const{el:{content:i},parts:r}=this._$AD,s=((h=e==null?void 0:e.creationScope)!=null?h:ye).importNode(i,!0);$e.currentNode=s;let o=$e.nextNode(),n=0,l=0,d=r[0];for(;d!==void 0;){if(n===d.index){let g;d.type===2?g=new Jt(o,o.nextSibling,this,e):d.type===1?g=new d.ctor(o,d.name,d.strings,this,e):d.type===6&&(g=new Ns(o,this,e)),this._$AV.push(g),d=r[++l]}n!==(d==null?void 0:d.index)&&(o=$e.nextNode(),n++)}return $e.currentNode=ye,s}p(e){let i=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,i),i+=r.strings.length-2):r._$AI(e[i])),i++}},Jt=class gs{get _$AU(){var e,i;return(i=(e=this._$AM)==null?void 0:e._$AU)!=null?i:this._$Cv}constructor(e,i,r,s){var o;this.type=2,this._$AH=v,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=r,this.options=s,this._$Cv=(o=s==null?void 0:s.isConnected)!=null?o:!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=Ie(this,e,i),Xe(e)?e===v||e==null||e===""?(this._$AH!==v&&this._$AR(),this._$AH=v):e!==this._$AH&&e!==Ae&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ms(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==v&&Xe(this._$AH)?this._$AA.nextSibling.data=e:this.T(ye.createTextNode(e)),this._$AH=e}$(e){var o;const{values:i,_$litType$:r}=e,s=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=Qt.createElement(ur(r.h,r.h[0]),this.options)),r);if(((o=this._$AH)==null?void 0:o._$AD)===s)this._$AH.p(i);else{const n=new Rs(s,this),l=n.u(this.options);n.p(i),this.T(l),this._$AH=n}}_$AC(e){let i=hr.get(e.strings);return i===void 0&&hr.set(e.strings,i=new Qt(e)),i}k(e){Kt(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let r,s=0;for(const o of e)s===i.length?i.push(r=new gs(this.O(Ke()),this.O(Ke()),this,this.options)):r=i[s],r._$AI(o),s++;s<i.length&&(this._$AR(r&&r._$AB.nextSibling,s),i.length=s)}_$AR(e=this._$AA.nextSibling,i){var r;for((r=this._$AP)==null?void 0:r.call(this,!1,!0,i);e!==this._$AB;){const s=tr(e).nextSibling;tr(e).remove(),e=s}}setConnected(e){var i;this._$AM===void 0&&(this._$Cv=e,(i=this._$AP)==null||i.call(this,e))}},yt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,r,s,o){this.type=1,this._$AH=v,this._$AN=void 0,this.element=e,this.name=i,this._$AM=s,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=v}_$AI(e,i=this,r,s){const o=this.strings;let n=!1;if(o===void 0)e=Ie(this,e,i,0),n=!Xe(e)||e!==this._$AH&&e!==Ae,n&&(this._$AH=e);else{const l=e;let d,h;for(e=o[0],d=0;d<o.length-1;d++)h=Ie(this,l[r+d],i,d),h===Ae&&(h=this._$AH[d]),n||(n=!Xe(h)||h!==this._$AH[d]),h===v?e=v:e!==v&&(e+=(h!=null?h:"")+o[d+1]),this._$AH[d]=h}n&&!s&&this.j(e)}j(e){e===v?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e!=null?e:"")}},Fs=class extends yt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===v?void 0:e}},Is=class extends yt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==v)}},Ps=class extends yt{constructor(e,i,r,s,o){super(e,i,r,s,o),this.type=5}_$AI(e,i=this){var n;if((e=(n=Ie(this,e,i,0))!=null?n:v)===Ae)return;const r=this._$AH,s=e===v&&r!==v||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==v&&(r===v||s);s&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var i,r;typeof this._$AH=="function"?this._$AH.call((r=(i=this.options)==null?void 0:i.host)!=null?r:this.element,e):this._$AH.handleEvent(e)}},Ns=class{constructor(e,i,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){Ie(this,e)}};const ei=Ve.litHtmlPolyfillSupport;ei==null||ei(Qt,Jt),((ds=Ve.litHtmlVersions)!=null?ds:Ve.litHtmlVersions=[]).push("3.3.2");const Os=(t,e,i)=>{var o,n;const r=(o=i==null?void 0:i.renderBefore)!=null?o:e;let s=r._$litPart$;if(s===void 0){const l=(n=i==null?void 0:i.renderBefore)!=null?n:null;r._$litPart$=s=new Jt(e.insertBefore(Ke(),l),l,void 0,i!=null?i:{})}return s._$AI(t),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ee=globalThis;let Pe=class extends Fe{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var i,r;const e=super.createRenderRoot();return(r=(i=this.renderOptions).renderBefore)!=null||(i.renderBefore=e.firstChild),e}update(e){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Os(i,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return Ae}};Pe._$litElement$=!0,Pe.finalized=!0,(hs=Ee.litElementHydrateSupport)==null||hs.call(Ee,{LitElement:Pe});const ti=Ee.litElementPolyfillSupport;ti==null||ti({LitElement:Pe}),((us=Ee.litElementVersions)!=null?us:Ee.litElementVersions=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const pr=t=>(e,i)=>{i!==void 0?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Us={attribute:!0,type:String,converter:vt,reflect:!1,hasChanged:Vt},Bs=(t=Us,e,i)=>{const{kind:r,metadata:s}=i;let o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),r==="accessor"){const{name:n}=i;return{set(l){const d=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,d,t,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,t,l),l}}}if(r==="setter"){const{name:n}=i;return function(l){const d=this[n];e.call(this,l),this.requestUpdate(n,d,t,!0,l)}}throw Error("Unsupported decorator location: "+r)};function ii(t){return(e,i)=>typeof i=="object"?Bs(t,e,i):((r,s,o)=>{const n=s.hasOwnProperty(o);return s.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(s,o):void 0})(t,e,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ue(t){return ii({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ws={CHILD:2},Hs=t=>(...e)=>({_$litDirective$:t,values:e});let js=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,r){this._$Ct=e,this._$AM=i,this._$Ci=r}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ri extends js{constructor(e){if(super(e),this.it=v,e.type!==Ws.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===v||e==null)return this._t=void 0,this.it=e;if(e===Ae)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const i=[e];return i.raw=i,this._t={_$litType$:this.constructor.resultType,strings:i,values:[]}}}ri.directiveName="unsafeHTML",ri.resultType=1;const Gs=Hs(ri);/*! @license DOMPurify 3.4.2 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.2/LICENSE */const{entries:gr,setPrototypeOf:mr,isFrozen:qs,getPrototypeOf:Ys,getOwnPropertyDescriptor:Zs}=Object;let{freeze:U,seal:Z,create:Ne}=Object,{apply:si,construct:oi}=typeof Reflect!="undefined"&&Reflect;U||(U=function(e){return e}),Z||(Z=function(e){return e}),si||(si=function(e,i){for(var r=arguments.length,s=new Array(r>2?r-2:0),o=2;o<r;o++)s[o-2]=arguments[o];return e.apply(i,s)}),oi||(oi=function(e){for(var i=arguments.length,r=new Array(i>1?i-1:0),s=1;s<i;s++)r[s-1]=arguments[s];return new e(...r)});const Je=L(Array.prototype.forEach),Vs=L(Array.prototype.lastIndexOf),fr=L(Array.prototype.pop),et=L(Array.prototype.push),Ks=L(Array.prototype.splice),B=Array.isArray,tt=L(String.prototype.toLowerCase),ni=L(String.prototype.toString),_r=L(String.prototype.match),Oe=L(String.prototype.replace),vr=L(String.prototype.indexOf),Xs=L(String.prototype.trim),Qs=L(Number.prototype.toString),Js=L(Boolean.prototype.toString),br=typeof BigInt=="undefined"?null:L(BigInt.prototype.toString),wr=typeof Symbol=="undefined"?null:L(Symbol.prototype.toString),C=L(Object.prototype.hasOwnProperty),it=L(Object.prototype.toString),P=L(RegExp.prototype.test),xt=eo(TypeError);function L(t){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var i=arguments.length,r=new Array(i>1?i-1:0),s=1;s<i;s++)r[s-1]=arguments[s];return si(t,e,r)}}function eo(t){return function(){for(var e=arguments.length,i=new Array(e),r=0;r<e;r++)i[r]=arguments[r];return oi(t,i)}}function y(t,e){let i=arguments.length>2&&arguments[2]!==void 0?arguments[2]:tt;if(mr&&mr(t,null),!B(e))return t;let r=e.length;for(;r--;){let s=e[r];if(typeof s=="string"){const o=i(s);o!==s&&(qs(e)||(e[r]=o),s=o)}t[s]=!0}return t}function to(t){for(let e=0;e<t.length;e++)C(t,e)||(t[e]=null);return t}function j(t){const e=Ne(null);for(const[i,r]of gr(t))C(t,i)&&(B(r)?e[i]=to(r):r&&typeof r=="object"&&r.constructor===Object?e[i]=j(r):e[i]=r);return e}function io(t){switch(typeof t){case"string":return t;case"number":return Qs(t);case"boolean":return Js(t);case"bigint":return br?br(t):"0";case"symbol":return wr?wr(t):"Symbol()";case"undefined":return it(t);case"function":case"object":{if(t===null)return it(t);const e=t,i=Ue(e,"toString");if(typeof i=="function"){const r=i(e);return typeof r=="string"?r:it(r)}return it(t)}default:return it(t)}}function Ue(t,e){for(;t!==null;){const r=Zs(t,e);if(r){if(r.get)return L(r.get);if(typeof r.value=="function")return L(r.value)}t=Ys(t)}function i(){return null}return i}function ro(t){try{return P(t,""),!0}catch{return!1}}const yr=U(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),ai=U(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),li=U(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),so=U(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),ci=U(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),oo=U(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),xr=U(["#text"]),Ar=U(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),di=U(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),$r=U(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),At=U(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),no=Z(/\{\{[\w\W]*|[\w\W]*\}\}/gm),ao=Z(/<%[\w\W]*|[\w\W]*%>/gm),lo=Z(/\$\{[\w\W]*/gm),co=Z(/^data-[\-\w.\u00B7-\uFFFF]+$/),ho=Z(/^aria-[\-\w]+$/),Er=Z(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),uo=Z(/^(?:\w+script|data):/i),po=Z(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Cr=Z(/^html$/i),go=Z(/^[a-z][.\w]*(-[.\w]+)+$/i);var Sr=Object.freeze({__proto__:null,ARIA_ATTR:ho,ATTR_WHITESPACE:po,CUSTOM_ELEMENT:go,DATA_ATTR:co,DOCTYPE_NAME:Cr,ERB_EXPR:ao,IS_ALLOWED_URI:Er,IS_SCRIPT_OR_DATA:uo,MUSTACHE_EXPR:no,TMPLIT_EXPR:lo});const rt={element:1,text:3,progressingInstruction:7,comment:8,document:9},mo=function(){return typeof window=="undefined"?null:window},fo=function(e,i){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let r=null;const s="data-tt-policy-suffix";i&&i.hasAttribute(s)&&(r=i.getAttribute(s));const o="dompurify"+(r?"#"+r:"");try{return e.createPolicy(o,{createHTML(n){return n},createScriptURL(n){return n}})}catch{return console.warn("TrustedTypes policy "+o+" could not be created."),null}},Dr=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function Tr(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:mo();const e=w=>Tr(w);if(e.version="3.4.2",e.removed=[],!t||!t.document||t.document.nodeType!==rt.document||!t.Element)return e.isSupported=!1,e;let{document:i}=t;const r=i,s=r.currentScript,{DocumentFragment:o,HTMLTemplateElement:n,Node:l,Element:d,NodeFilter:h,NamedNodeMap:g=t.NamedNodeMap||t.MozNamedAttrMap,HTMLFormElement:p,DOMParser:f,trustedTypes:_}=t,x=d.prototype,A=Ue(x,"cloneNode"),K=Ue(x,"remove"),G=Ue(x,"nextSibling"),te=Ue(x,"childNodes"),X=Ue(x,"parentNode");if(typeof n=="function"){const w=i.createElement("template");w.content&&w.content.ownerDocument&&(i=w.content.ownerDocument)}let E,Q="";const{implementation:ae,createNodeIterator:Dt,createDocumentFragment:Tt,getElementsByTagName:dt}=i,{importNode:ht}=r;let z=Dr();e.isSupported=typeof gr=="function"&&typeof X=="function"&&ae&&ae.createHTMLDocument!==void 0;const{MUSTACHE_EXPR:fe,ERB_EXPR:_e,TMPLIT_EXPR:Te,DATA_ATTR:kt,ARIA_ATTR:W,IS_SCRIPT_OR_DATA:le,ATTR_WHITESPACE:ke,CUSTOM_ELEMENT:Lt}=Sr;let{IS_ALLOWED_URI:Ei}=Sr,R=null;const Ci=y({},[...yr,...ai,...li,...ci,...xr]);let I=null;const Si=y({},[...Ar,...di,...$r,...At]);let T=Object.seal(Ne(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),je=null,ut=null;const ce=Object.seal(Ne(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Di=!0,Mt=!0,Ti=!1,ki=!0,ve=!1,Ge=!0,be=!1,zt=!1,Rt=!1,Le=!1,pt=!1,gt=!1,Li=!0,Mi=!1;const zi="user-content-";let Ft=!0,qe=!1,Me={},ie=null;const It=y({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Ri=null;const Fi=y({},["audio","video","img","source","image","track"]);let Pt=null;const Ii=y({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),mt="http://www.w3.org/1998/Math/MathML",ft="http://www.w3.org/2000/svg",re="http://www.w3.org/1999/xhtml";let ze=re,Nt=!1,Ot=null;const ms=y({},[mt,ft,re],ni);let Ut=y({},["mi","mo","mn","ms","mtext"]),Bt=y({},["annotation-xml"]);const fs=y({},["title","style","font","a","script"]);let Ye=null;const _s=["application/xhtml+xml","text/html"],vs="text/html";let M=null,Re=null;const bs=i.createElement("form"),Pi=function(a){return a instanceof RegExp||a instanceof Function},Wt=function(){let a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Re&&Re===a)return;(!a||typeof a!="object")&&(a={}),a=j(a),Ye=_s.indexOf(a.PARSER_MEDIA_TYPE)===-1?vs:a.PARSER_MEDIA_TYPE,M=Ye==="application/xhtml+xml"?ni:tt,R=C(a,"ALLOWED_TAGS")&&B(a.ALLOWED_TAGS)?y({},a.ALLOWED_TAGS,M):Ci,I=C(a,"ALLOWED_ATTR")&&B(a.ALLOWED_ATTR)?y({},a.ALLOWED_ATTR,M):Si,Ot=C(a,"ALLOWED_NAMESPACES")&&B(a.ALLOWED_NAMESPACES)?y({},a.ALLOWED_NAMESPACES,ni):ms,Pt=C(a,"ADD_URI_SAFE_ATTR")&&B(a.ADD_URI_SAFE_ATTR)?y(j(Ii),a.ADD_URI_SAFE_ATTR,M):Ii,Ri=C(a,"ADD_DATA_URI_TAGS")&&B(a.ADD_DATA_URI_TAGS)?y(j(Fi),a.ADD_DATA_URI_TAGS,M):Fi,ie=C(a,"FORBID_CONTENTS")&&B(a.FORBID_CONTENTS)?y({},a.FORBID_CONTENTS,M):It,je=C(a,"FORBID_TAGS")&&B(a.FORBID_TAGS)?y({},a.FORBID_TAGS,M):j({}),ut=C(a,"FORBID_ATTR")&&B(a.FORBID_ATTR)?y({},a.FORBID_ATTR,M):j({}),Me=C(a,"USE_PROFILES")?a.USE_PROFILES&&typeof a.USE_PROFILES=="object"?j(a.USE_PROFILES):a.USE_PROFILES:!1,Di=a.ALLOW_ARIA_ATTR!==!1,Mt=a.ALLOW_DATA_ATTR!==!1,Ti=a.ALLOW_UNKNOWN_PROTOCOLS||!1,ki=a.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ve=a.SAFE_FOR_TEMPLATES||!1,Ge=a.SAFE_FOR_XML!==!1,be=a.WHOLE_DOCUMENT||!1,Le=a.RETURN_DOM||!1,pt=a.RETURN_DOM_FRAGMENT||!1,gt=a.RETURN_TRUSTED_TYPE||!1,Rt=a.FORCE_BODY||!1,Li=a.SANITIZE_DOM!==!1,Mi=a.SANITIZE_NAMED_PROPS||!1,Ft=a.KEEP_CONTENT!==!1,qe=a.IN_PLACE||!1,Ei=ro(a.ALLOWED_URI_REGEXP)?a.ALLOWED_URI_REGEXP:Er,ze=typeof a.NAMESPACE=="string"?a.NAMESPACE:re,Ut=C(a,"MATHML_TEXT_INTEGRATION_POINTS")&&a.MATHML_TEXT_INTEGRATION_POINTS&&typeof a.MATHML_TEXT_INTEGRATION_POINTS=="object"?j(a.MATHML_TEXT_INTEGRATION_POINTS):y({},["mi","mo","mn","ms","mtext"]),Bt=C(a,"HTML_INTEGRATION_POINTS")&&a.HTML_INTEGRATION_POINTS&&typeof a.HTML_INTEGRATION_POINTS=="object"?j(a.HTML_INTEGRATION_POINTS):y({},["annotation-xml"]);const u=C(a,"CUSTOM_ELEMENT_HANDLING")&&a.CUSTOM_ELEMENT_HANDLING&&typeof a.CUSTOM_ELEMENT_HANDLING=="object"?j(a.CUSTOM_ELEMENT_HANDLING):Ne(null);if(T=Ne(null),C(u,"tagNameCheck")&&Pi(u.tagNameCheck)&&(T.tagNameCheck=u.tagNameCheck),C(u,"attributeNameCheck")&&Pi(u.attributeNameCheck)&&(T.attributeNameCheck=u.attributeNameCheck),C(u,"allowCustomizedBuiltInElements")&&typeof u.allowCustomizedBuiltInElements=="boolean"&&(T.allowCustomizedBuiltInElements=u.allowCustomizedBuiltInElements),ve&&(Mt=!1),pt&&(Le=!0),Me&&(R=y({},xr),I=Ne(null),Me.html===!0&&(y(R,yr),y(I,Ar)),Me.svg===!0&&(y(R,ai),y(I,di),y(I,At)),Me.svgFilters===!0&&(y(R,li),y(I,di),y(I,At)),Me.mathMl===!0&&(y(R,ci),y(I,$r),y(I,At))),ce.tagCheck=null,ce.attributeCheck=null,C(a,"ADD_TAGS")&&(typeof a.ADD_TAGS=="function"?ce.tagCheck=a.ADD_TAGS:B(a.ADD_TAGS)&&(R===Ci&&(R=j(R)),y(R,a.ADD_TAGS,M))),C(a,"ADD_ATTR")&&(typeof a.ADD_ATTR=="function"?ce.attributeCheck=a.ADD_ATTR:B(a.ADD_ATTR)&&(I===Si&&(I=j(I)),y(I,a.ADD_ATTR,M))),C(a,"ADD_URI_SAFE_ATTR")&&B(a.ADD_URI_SAFE_ATTR)&&y(Pt,a.ADD_URI_SAFE_ATTR,M),C(a,"FORBID_CONTENTS")&&B(a.FORBID_CONTENTS)&&(ie===It&&(ie=j(ie)),y(ie,a.FORBID_CONTENTS,M)),C(a,"ADD_FORBID_CONTENTS")&&B(a.ADD_FORBID_CONTENTS)&&(ie===It&&(ie=j(ie)),y(ie,a.ADD_FORBID_CONTENTS,M)),Ft&&(R["#text"]=!0),be&&y(R,["html","head","body"]),R.table&&(y(R,["tbody"]),delete je.tbody),a.TRUSTED_TYPES_POLICY){if(typeof a.TRUSTED_TYPES_POLICY.createHTML!="function")throw xt('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof a.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw xt('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');E=a.TRUSTED_TYPES_POLICY,Q=E.createHTML("")}else E===void 0&&(E=fo(_,s)),E!==null&&typeof Q=="string"&&(Q=E.createHTML(""));U&&U(a),Re=a},Ni=y({},[...ai,...li,...so]),Oi=y({},[...ci,...oo]),ws=function(a){let u=X(a);(!u||!u.tagName)&&(u={namespaceURI:ze,tagName:"template"});const m=tt(a.tagName),$=tt(u.tagName);return Ot[a.namespaceURI]?a.namespaceURI===ft?u.namespaceURI===re?m==="svg":u.namespaceURI===mt?m==="svg"&&($==="annotation-xml"||Ut[$]):!!Ni[m]:a.namespaceURI===mt?u.namespaceURI===re?m==="math":u.namespaceURI===ft?m==="math"&&Bt[$]:!!Oi[m]:a.namespaceURI===re?u.namespaceURI===ft&&!Bt[$]||u.namespaceURI===mt&&!Ut[$]?!1:!Oi[m]&&(fs[m]||!Ni[m]):!!(Ye==="application/xhtml+xml"&&Ot[a.namespaceURI]):!1},J=function(a){et(e.removed,{element:a});try{X(a).removeChild(a)}catch{K(a)}},we=function(a,u){try{et(e.removed,{attribute:u.getAttributeNode(a),from:u})}catch{et(e.removed,{attribute:null,from:u})}if(u.removeAttribute(a),a==="is")if(Le||pt)try{J(u)}catch{}else try{u.setAttribute(a,"")}catch{}},Ui=function(a){let u=null,m=null;if(Rt)a="<remove></remove>"+a;else{const k=_r(a,/^[\r\n\t ]+/);m=k&&k[0]}Ye==="application/xhtml+xml"&&ze===re&&(a='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+a+"</body></html>");const $=E?E.createHTML(a):a;if(ze===re)try{u=new f().parseFromString($,Ye)}catch{}if(!u||!u.documentElement){u=ae.createDocument(ze,"template",null);try{u.documentElement.innerHTML=Nt?Q:$}catch{}}const N=u.body||u.documentElement;return a&&m&&N.insertBefore(i.createTextNode(m),N.childNodes[0]||null),ze===re?dt.call(u,be?"html":"body")[0]:be?u.documentElement:N},Bi=function(a){return Dt.call(a.ownerDocument||a,a,h.SHOW_ELEMENT|h.SHOW_COMMENT|h.SHOW_TEXT|h.SHOW_PROCESSING_INSTRUCTION|h.SHOW_CDATA_SECTION,null)},Ht=function(a){return a instanceof p&&(typeof a.nodeName!="string"||typeof a.textContent!="string"||typeof a.removeChild!="function"||!(a.attributes instanceof g)||typeof a.removeAttribute!="function"||typeof a.setAttribute!="function"||typeof a.namespaceURI!="string"||typeof a.insertBefore!="function"||typeof a.hasChildNodes!="function")},jt=function(a){return typeof l=="function"&&a instanceof l};function oe(w,a,u){Je(w,m=>{m.call(e,a,u,Re)})}const Wi=function(a){let u=null;if(oe(z.beforeSanitizeElements,a,null),Ht(a))return J(a),!0;const m=M(a.nodeName);if(oe(z.uponSanitizeElement,a,{tagName:m,allowedTags:R}),Ge&&a.hasChildNodes()&&!jt(a.firstElementChild)&&P(/<[/\w!]/g,a.innerHTML)&&P(/<[/\w!]/g,a.textContent)||Ge&&a.namespaceURI===re&&m==="style"&&jt(a.firstElementChild)||a.nodeType===rt.progressingInstruction||Ge&&a.nodeType===rt.comment&&P(/<[/\w]/g,a.data))return J(a),!0;if(je[m]||!(ce.tagCheck instanceof Function&&ce.tagCheck(m))&&!R[m]){if(!je[m]&&ji(m)&&(T.tagNameCheck instanceof RegExp&&P(T.tagNameCheck,m)||T.tagNameCheck instanceof Function&&T.tagNameCheck(m)))return!1;if(Ft&&!ie[m]){const $=X(a)||a.parentNode,N=te(a)||a.childNodes;if(N&&$){const k=N.length;for(let H=k-1;H>=0;--H){const q=A(N[H],!0);$.insertBefore(q,G(a))}}}return J(a),!0}return a instanceof d&&!ws(a)||(m==="noscript"||m==="noembed"||m==="noframes")&&P(/<\/no(script|embed|frames)/i,a.innerHTML)?(J(a),!0):(ve&&a.nodeType===rt.text&&(u=a.textContent,Je([fe,_e,Te],$=>{u=Oe(u,$," ")}),a.textContent!==u&&(et(e.removed,{element:a.cloneNode()}),a.textContent=u)),oe(z.afterSanitizeElements,a,null),!1)},Hi=function(a,u,m){if(ut[u]||Li&&(u==="id"||u==="name")&&(m in i||m in bs))return!1;const $=I[u]||ce.attributeCheck instanceof Function&&ce.attributeCheck(u,a);if(!(Mt&&!ut[u]&&P(kt,u))){if(!(Di&&P(W,u))){if(!$||ut[u]){if(!(ji(a)&&(T.tagNameCheck instanceof RegExp&&P(T.tagNameCheck,a)||T.tagNameCheck instanceof Function&&T.tagNameCheck(a))&&(T.attributeNameCheck instanceof RegExp&&P(T.attributeNameCheck,u)||T.attributeNameCheck instanceof Function&&T.attributeNameCheck(u,a))||u==="is"&&T.allowCustomizedBuiltInElements&&(T.tagNameCheck instanceof RegExp&&P(T.tagNameCheck,m)||T.tagNameCheck instanceof Function&&T.tagNameCheck(m))))return!1}else if(!Pt[u]){if(!P(Ei,Oe(m,ke,""))){if(!((u==="src"||u==="xlink:href"||u==="href")&&a!=="script"&&vr(m,"data:")===0&&Ri[a])){if(!(Ti&&!P(le,Oe(m,ke,"")))){if(m)return!1}}}}}}return!0},ys=y({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),ji=function(a){return!ys[tt(a)]&&P(Lt,a)},Gi=function(a){oe(z.beforeSanitizeAttributes,a,null);const{attributes:u}=a;if(!u||Ht(a))return;const m={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:I,forceKeepAttr:void 0};let $=u.length;for(;$--;){const N=u[$],{name:k,namespaceURI:H,value:q}=N,ee=M(k),Gt=q;let F=k==="value"?Gt:Xs(Gt);if(m.attrName=ee,m.attrValue=F,m.keepAttr=!0,m.forceKeepAttr=void 0,oe(z.uponSanitizeAttribute,a,m),F=m.attrValue,Mi&&(ee==="id"||ee==="name")&&vr(F,zi)!==0&&(we(k,a),F=zi+F),Ge&&P(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,F)){we(k,a);continue}if(ee==="attributename"&&_r(F,"href")){we(k,a);continue}if(m.forceKeepAttr)continue;if(!m.keepAttr){we(k,a);continue}if(!ki&&P(/\/>/i,F)){we(k,a);continue}ve&&Je([fe,_e,Te],Zi=>{F=Oe(F,Zi," ")});const Yi=M(a.nodeName);if(!Hi(Yi,ee,F)){we(k,a);continue}if(E&&typeof _=="object"&&typeof _.getAttributeType=="function"&&!H)switch(_.getAttributeType(Yi,ee)){case"TrustedHTML":{F=E.createHTML(F);break}case"TrustedScriptURL":{F=E.createScriptURL(F);break}}if(F!==Gt)try{H?a.setAttributeNS(H,k,F):a.setAttribute(k,F),Ht(a)?J(a):fr(e.removed)}catch{we(k,a)}}oe(z.afterSanitizeAttributes,a,null)},qi=function(a){let u=null;const m=Bi(a);for(oe(z.beforeSanitizeShadowDOM,a,null);u=m.nextNode();)oe(z.uponSanitizeShadowNode,u,null),Wi(u),Gi(u),u.content instanceof o&&qi(u.content);oe(z.afterSanitizeShadowDOM,a,null)};return e.sanitize=function(w){let a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},u=null,m=null,$=null,N=null;if(Nt=!w,Nt&&(w="<!-->"),typeof w!="string"&&!jt(w)&&(w=io(w),typeof w!="string"))throw xt("dirty is not a string, aborting");if(!e.isSupported)return w;if(zt||Wt(a),e.removed=[],typeof w=="string"&&(qe=!1),qe){const q=w.nodeName;if(typeof q=="string"){const ee=M(q);if(!R[ee]||je[ee])throw xt("root node is forbidden and cannot be sanitized in-place")}}else if(w instanceof l)u=Ui("<!---->"),m=u.ownerDocument.importNode(w,!0),m.nodeType===rt.element&&m.nodeName==="BODY"||m.nodeName==="HTML"?u=m:u.appendChild(m);else{if(!Le&&!ve&&!be&&w.indexOf("<")===-1)return E&&gt?E.createHTML(w):w;if(u=Ui(w),!u)return Le?null:gt?Q:""}u&&Rt&&J(u.firstChild);const k=Bi(qe?w:u);for(;$=k.nextNode();)Wi($),Gi($),$.content instanceof o&&qi($.content);if(qe)return w;if(Le){if(ve){u.normalize();let q=u.innerHTML;Je([fe,_e,Te],ee=>{q=Oe(q,ee," ")}),u.innerHTML=q}if(pt)for(N=Tt.call(u.ownerDocument);u.firstChild;)N.appendChild(u.firstChild);else N=u;return(I.shadowroot||I.shadowrootmode)&&(N=ht.call(r,N,!0)),N}let H=be?u.outerHTML:u.innerHTML;return be&&R["!doctype"]&&u.ownerDocument&&u.ownerDocument.doctype&&u.ownerDocument.doctype.name&&P(Cr,u.ownerDocument.doctype.name)&&(H="<!DOCTYPE "+u.ownerDocument.doctype.name+`>
`+H),ve&&Je([fe,_e,Te],q=>{H=Oe(H,q," ")}),E&&gt?E.createHTML(H):H},e.setConfig=function(){let w=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};Wt(w),zt=!0},e.clearConfig=function(){Re=null,zt=!1},e.isValidAttribute=function(w,a,u){Re||Wt({});const m=M(w),$=M(a);return Hi(m,$,u)},e.addHook=function(w,a){typeof a=="function"&&et(z[w],a)},e.removeHook=function(w,a){if(a!==void 0){const u=Vs(z[w],a);return u===-1?void 0:Ks(z[w],u,1)[0]}return fr(z[w])},e.removeHooks=function(w){z[w]=[]},e.removeAllHooks=function(){z=Dr()},e}var kr=Tr();const _o={"card.no_alerts":"No active alerts.","card.sources_unavailable_named":"{name} unavailable","card.sources_unavailable_count":"{count} sources unavailable","card.sources_unavailable_one":"A source is unavailable","card.preview":"Sample Data","card.read_details":"Read Details","card.open_source":"Open {provider} Source","card.zones_count":"{count} zones","card.zone_count_singular":"{count} zone","card.dismiss":"Dismiss","card.dismissed_toast":"Dismissed: {event}","card.dismissed_toast_undo":"Undo","detail.issued":"Issued","detail.onset":"Onset","detail.expires":"Expires","detail.area":"Area","detail.source":"Source","detail.description":"Description","detail.instructions":"Instructions","progress.start":"Start","progress.now":"Now","progress.end":"End","progress.ongoing":"Ongoing","progress.expires_in_label":"Expires in","progress.starts_in_label":"Starts in","progress.tbd":"TBD","progress.na":"N/A","progress.expired_label":"Expired","progress.compact_active":"for {time}","progress.compact_prep":"in {time}","progress.compact_ongoing":"ongoing","progress.compact_expired":"expired {time} ago","time.just_now":"just now","time.in_less_than_1m":"in <1m","time.minutes_ago":"{m}m ago","time.in_minutes":"in {m}m","time.hours_ago":"{dur} ago","time.in_hours":"in {dur}","time.days_ago":"{d}d ago","time.in_days":"in {d}d","badge.severity_extreme":"Extreme","badge.severity_severe":"Severe","badge.severity_moderate":"Moderate","badge.severity_minor":"Minor","badge.severity_unknown":"Unknown","badge.certainty_observed":"Observed","badge.certainty_likely":"Likely","badge.certainty_possible":"Possible","badge.certainty_unlikely":"Unlikely","badge.certainty_unknown":"Unknown","editor.entities":"Entities","editor.title":"Title (optional)","editor.provider":"Alert provider","editor.provider_auto":"Auto-detect","editor.provider_nws":"NWS (United States)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europe)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Germany)","editor.provider_meteoswiss":"MeteoSwiss (Switzerland)","editor.provider_eccc":"ECCC (Canada)","editor.provider_nsw_rfs":"NSW RFS (Australia)","editor.provider_cap":"CAP Alerts (multi-region)","editor.device":"CAP Alerts device (optional)","editor.device_helper":"Pulls in every active alert sensor under this device automatically.","editor.zones":"Zones (optional)","editor.zones_helper":"Comma-separated BoM area_id codes, e.g. NSW_FL049","editor.event_codes":"Event codes (optional)","editor.event_codes_helper":"Comma-separated event codes, e.g. TOW, SVW (NWS) or 31, 95 (DWD)","editor.exclude_event_codes":"Exclude event codes (optional)","editor.exclude_event_codes_helper":"Comma-separated event codes to exclude, e.g. SCY (NWS) or 22 (DWD)","editor.sort_order":"Sort order","editor.sort_default":"Default","editor.sort_onset":"Onset time","editor.sort_severity":"Severity","editor.color_theme":"Color theme","editor.color_severity":"Severity-based","editor.color_nws":"NWS Official","editor.color_meteoalarm":"MeteoAlarm Awareness","editor.color_eccc":"ECCC Public Alerts","editor.timezone":"Timezone","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (local device)","editor.min_severity":"Minimum severity","editor.severity_all":"All severities","editor.severity_minor":"Minor or higher","editor.severity_moderate":"Moderate or higher","editor.severity_severe":"Severe or higher","editor.severity_extreme":"Extreme only","editor.animations":"Enable animations","editor.enhance_contrast":"Enhance contrast","editor.enhance_contrast_off":"Off","editor.enhance_contrast_subtle":"Subtle (default)","editor.enhance_contrast_strict":"Strict (WCAG AA)","editor.deduplicate":"Deduplicate alerts","editor.deduplicate_headlines":"Deduplicate headlines","editor.show_details":"Show detail panel","editor.expand_details":"Always expand details","editor.show_metadata":"Show metadata","editor.show_description":"Show description","editor.show_instructions":"Show instructions","editor.show_geometry":"Show area map","editor.geometry_style":"Area map style","editor.geometry_style_shape":"Outline only","editor.geometry_style_map":"Map tiles (online)","editor.show_provider":"Show provider label","editor.show_source_link":"Show source link","editor.reformat_text":"Reflow alert text (strip hard line breaks)","editor.compact":"Compact layout","editor.font_size":"Font size","editor.font_size_small":"Small","editor.font_size_default":"Default","editor.font_size_large":"Large","editor.font_size_x_large":"Extra large","editor.hide_expired":"Hide expired alerts","editor.hide_no_alerts":"Hide card when there are no active alerts","editor.unavailable_behavior":"When a source is unavailable","editor.unavailable_message":"Show which source","editor.unavailable_compact":"Show a compact indicator","editor.unavailable_hide":"Hide indicator (not recommended)","editor.unavailable_hide_warning":"Hiding the indicator can present an all-clear while a source is blind \u2014 an unavailable sensor is not proof of safety.","editor.allow_dismiss":"Allow dismissing alerts","editor.show_dismiss_undo":"Show undo notification on dismiss","editor.dismissed_count":"Dismissed: {count} alerts.","editor.dismissed_count_singular":"Dismissed: {count} alert.","editor.restore_all":"Restore all","editor.show_preview":"Show sample data","editor.preview_hint":"Preview card layout with sample alerts","editor.preview_nudge":"No active alerts \u2014 enable to preview the card layout.","editor.entity_warning":"Selected entity does not appear to contain weather alert data.","editor.no_entities_hint":"No supported weather alert entities found. A provider integration (e.g. NWS Alerts) must be installed first.","editor.no_entities_hint_link":"Supported providers","editor.feeds":"Auto-collect from installed feeds","editor.feeds_helper":"Detected integration feeds. Check one to include every live incident it reports \u2014 no per-incident entities to list. Requires the integration to be set up in Home Assistant.","editor.source_hint":"Auto-collecting {count} live incident(s) from the feed \u2014 no entities to list manually.","editor.feeds_missing_warning":"No live data for {feeds}. This feed is enabled but nothing is providing it \u2014 is the integration set up in Home Assistant?","editor.no_device_alerts_hint":"No active alert sensors found under this device yet. The card will populate automatically when CAP Alerts publishes alerts.","editor.section_entity":"Entities & Provider","editor.section_filtering":"Filtering","editor.section_appearance":"Appearance","editor.section_detail_panel":"Detail Panel","editor.section_behavior":"Behavior","editor.section_dismissal":"Dismissal","editor.dismiss_trigger":"Dismiss trigger","editor.dismiss_trigger_button":"Button only","editor.dismiss_trigger_swipe":"Swipe only","editor.dismiss_trigger_both":"Button and swipe","editor.dismiss_button_style":"Button style","editor.dismiss_button_style_icon":"Icon only","editor.dismiss_button_style_labeled":"Icon and label"},vo={"card.no_alerts":"Aucune alerte active.","card.sources_unavailable_named":"{name} indisponible","card.sources_unavailable_count":"{count} sources indisponibles","card.sources_unavailable_one":"Une source est indisponible","card.preview":"Donnees d'exemple","card.read_details":"Lire les details","card.open_source":"Ouvrir la source {provider}","card.zones_count":"{count} zones","card.zone_count_singular":"{count} zone","card.dismiss":"Ignorer","card.dismissed_toast":"Ignor\xE9e : {event}","card.dismissed_toast_undo":"Annuler","detail.issued":"Emis","detail.onset":"Debut","detail.expires":"Expire","detail.area":"Zone","detail.source":"Source","detail.description":"Description","detail.instructions":"Instructions","progress.start":"Debut","progress.now":"Maint.","progress.end":"Fin","progress.ongoing":"En cours","progress.expires_in_label":"Expire dans","progress.starts_in_label":"Commence dans","progress.tbd":"Ind.","progress.na":"N/D","progress.expired_label":"Expir\xE9","progress.compact_active":"pour {time}","progress.compact_prep":"dans {time}","progress.compact_ongoing":"en cours","progress.compact_expired":"expir\xE9 il y a {time}","time.just_now":"a l'instant","time.in_less_than_1m":"dans <1m","time.minutes_ago":"il y a {m}m","time.in_minutes":"dans {m}m","time.hours_ago":"il y a {dur}","time.in_hours":"dans {dur}","time.days_ago":"il y a {d}j","time.in_days":"dans {d}j","badge.severity_extreme":"Extr\xEAme","badge.severity_severe":"Grave","badge.severity_moderate":"Mod\xE9r\xE9e","badge.severity_minor":"Mineure","badge.severity_unknown":"Inconnue","badge.certainty_observed":"Observ\xE9e","badge.certainty_likely":"Probable","badge.certainty_possible":"Possible","badge.certainty_unlikely":"Improbable","badge.certainty_unknown":"Inconnue","editor.entities":"Entites","editor.title":"Titre (optionnel)","editor.provider":"Fournisseur d'alertes","editor.provider_auto":"Detection auto","editor.provider_nws":"NWS (Etats-Unis)","editor.provider_bom":"BoM (Australie)","editor.provider_meteoalarm":"MeteoAlarm (Europe)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Allemagne)","editor.provider_meteoswiss":"MeteoSwiss (Suisse)","editor.provider_eccc":"ECCC (Canada)","editor.provider_nsw_rfs":"NSW RFS (Australie)","editor.provider_cap":"Alertes CAP (multi-region)","editor.device":"Appareil CAP Alerts (optionnel)","editor.device_helper":"Recupere automatiquement chaque capteur d'alerte actif sous cet appareil.","editor.zones":"Zones (optionnel)","editor.zones_helper":"Codes area_id BoM separes par des virgules, ex. NSW_FL049","editor.event_codes":"Codes d'evenement (optionnel)","editor.event_codes_helper":"Codes d'evenement separes par des virgules, ex. TOW, SVW (NWS) ou 31, 95 (DWD)","editor.exclude_event_codes":"Exclure codes d'evenement (optionnel)","editor.exclude_event_codes_helper":"Codes d'evenement a exclure, ex. SCY (NWS) ou 22 (DWD)","editor.sort_order":"Ordre de tri","editor.sort_default":"Par defaut","editor.sort_onset":"Heure de debut","editor.sort_severity":"Gravite","editor.color_theme":"Theme de couleur","editor.color_severity":"Base sur la gravite","editor.color_nws":"NWS officiel","editor.color_meteoalarm":"MeteoAlarm Vigilance","editor.color_eccc":"Alertes publiques ECCC","editor.timezone":"Fuseau horaire","editor.tz_server":"Serveur (Home Assistant)","editor.tz_browser":"Navigateur (appareil local)","editor.min_severity":"Gravite minimale","editor.severity_all":"Toutes les gravites","editor.severity_minor":"Mineure ou plus","editor.severity_moderate":"Moderee ou plus","editor.severity_severe":"Grave ou plus","editor.severity_extreme":"Extreme uniquement","editor.animations":"Activer les animations","editor.enhance_contrast":"Am\xE9liorer le contraste","editor.enhance_contrast_off":"D\xE9sactiv\xE9","editor.enhance_contrast_subtle":"Subtil (par d\xE9faut)","editor.enhance_contrast_strict":"Strict (WCAG AA)","editor.deduplicate":"Dedupliquer les alertes","editor.deduplicate_headlines":"D\xE9dupliquer les titres","editor.show_details":"Afficher le panneau de details","editor.expand_details":"Toujours afficher les details","editor.show_metadata":"Afficher les metadonnees","editor.show_description":"Afficher la description","editor.show_instructions":"Afficher les instructions","editor.show_geometry":"Afficher la carte de zone","editor.geometry_style":"Style de la carte de zone","editor.geometry_style_shape":"Contour uniquement","editor.geometry_style_map":"Tuiles cartographiques (en ligne)","editor.show_provider":"Afficher le fournisseur","editor.show_source_link":"Afficher le lien source","editor.reformat_text":"Reformater le texte (supprimer les retours a la ligne)","editor.compact":"Disposition compacte","editor.font_size":"Taille de police","editor.font_size_small":"Petit","editor.font_size_default":"Par d\xE9faut","editor.font_size_large":"Grand","editor.font_size_x_large":"Tr\xE8s grand","editor.hide_expired":"Masquer les alertes expir\xE9es","editor.hide_no_alerts":"Masquer la carte sans alertes","editor.unavailable_behavior":"Quand une source est indisponible","editor.unavailable_message":"Afficher la source concern\xE9e","editor.unavailable_compact":"Afficher un indicateur compact","editor.unavailable_hide":"Masquer l'indicateur (d\xE9conseill\xE9)","editor.unavailable_hide_warning":"Masquer l'indicateur peut pr\xE9senter une absence d'alerte alors qu'une source est aveugle \u2014 un capteur indisponible n'est pas une preuve de s\xE9curit\xE9.","editor.allow_dismiss":"Permettre d'ignorer les alertes","editor.show_dismiss_undo":"Afficher une notification d'annulation","editor.dismissed_count":"Ignor\xE9es : {count} alertes.","editor.dismissed_count_singular":"Ignor\xE9e : {count} alerte.","editor.restore_all":"Tout restaurer","editor.show_preview":"Afficher les donnees exemples","editor.preview_hint":"Apercu de la disposition avec des alertes fictives","editor.preview_nudge":"Aucune alerte active \u2014 activez pour previsualiser la disposition.","editor.entity_warning":"L'entite selectionnee ne semble pas contenir de donnees d'alerte meteo.","editor.no_entities_hint":"Aucune entite d'alerte meteo compatible trouvee. Une integration (ex. NWS Alerts) doit etre installee.","editor.no_entities_hint_link":"Fournisseurs supportes","editor.feeds":"Collecte automatique des flux installes","editor.feeds_helper":"Flux d'integration detectes. Cochez-en un pour inclure chaque incident en direct qu'il signale \u2014 aucune entite par incident a lister. Necessite que l'integration soit configuree dans Home Assistant.","editor.source_hint":"Collecte automatique de {count} incident(s) en direct du flux \u2014 aucune entite a lister manuellement.","editor.feeds_missing_warning":"Aucune donnee en direct pour {feeds}. Ce flux est active mais rien ne l'alimente \u2014 l'integration est-elle configuree dans Home Assistant ?","editor.no_device_alerts_hint":"Aucun capteur d'alerte actif trouve sous cet appareil pour le moment. La carte se remplira automatiquement lorsque CAP Alerts publiera des alertes.","editor.section_entity":"Entite et fournisseur","editor.section_filtering":"Filtrage","editor.section_appearance":"Apparence","editor.section_detail_panel":"Panneau de details","editor.section_behavior":"Comportement","editor.section_dismissal":"Masquage","editor.dismiss_trigger":"Declencheur","editor.dismiss_trigger_button":"Bouton uniquement","editor.dismiss_trigger_swipe":"Glissement uniquement","editor.dismiss_trigger_both":"Bouton et glissement","editor.dismiss_button_style":"Style du bouton","editor.dismiss_button_style_icon":"Icone uniquement","editor.dismiss_button_style_labeled":"Icone et texte"},bo={"card.no_alerts":"Sin alertas activas.","card.sources_unavailable_named":"{name} no disponible","card.sources_unavailable_count":"{count} fuentes no disponibles","card.sources_unavailable_one":"Una fuente no est\xE1 disponible","card.preview":"Datos de ejemplo","card.read_details":"Leer detalles","card.open_source":"Abrir fuente {provider}","card.zones_count":"{count} zonas","card.zone_count_singular":"{count} zona","card.dismiss":"Descartar","card.dismissed_toast":"Descartada: {event}","card.dismissed_toast_undo":"Deshacer","detail.issued":"Emitido","detail.onset":"Inicio","detail.expires":"Expira","detail.area":"Area","detail.source":"Fuente","detail.description":"Descripcion","detail.instructions":"Instrucciones","progress.start":"Inicio","progress.now":"Ahora","progress.end":"Fin","progress.ongoing":"En curso","progress.expires_in_label":"Expira en","progress.starts_in_label":"Comienza en","progress.tbd":"Pend.","progress.na":"N/D","progress.expired_label":"Expirada","progress.compact_active":"por {time}","progress.compact_prep":"en {time}","progress.compact_ongoing":"en curso","progress.compact_expired":"expir\xF3 hace {time}","time.just_now":"ahora mismo","time.in_less_than_1m":"en <1m","time.minutes_ago":"hace {m}m","time.in_minutes":"en {m}m","time.hours_ago":"hace {dur}","time.in_hours":"en {dur}","time.days_ago":"hace {d}d","time.in_days":"en {d}d","badge.severity_extreme":"Extrema","badge.severity_severe":"Grave","badge.severity_moderate":"Moderada","badge.severity_minor":"Menor","badge.severity_unknown":"Desconocida","badge.certainty_observed":"Observada","badge.certainty_likely":"Probable","badge.certainty_possible":"Posible","badge.certainty_unlikely":"Improbable","badge.certainty_unknown":"Desconocida","editor.entities":"Entidades","editor.title":"Titulo (opcional)","editor.provider":"Proveedor de alertas","editor.provider_auto":"Deteccion auto","editor.provider_nws":"NWS (Estados Unidos)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Alemania)","editor.provider_meteoswiss":"MeteoSwiss (Suiza)","editor.provider_eccc":"ECCC (Canad\xE1)","editor.provider_nsw_rfs":"NSW RFS (Australia)","editor.provider_cap":"Alertas CAP (multi-region)","editor.device":"Dispositivo CAP Alerts (opcional)","editor.device_helper":"Incorpora automaticamente cada sensor de alerta activo bajo este dispositivo.","editor.zones":"Zonas (opcional)","editor.zones_helper":"Codigos area_id de BoM separados por comas, ej. NSW_FL049","editor.event_codes":"Codigos de evento (opcional)","editor.event_codes_helper":"Codigos de evento separados por comas, ej. TOW, SVW (NWS) o 31, 95 (DWD)","editor.exclude_event_codes":"Excluir codigos de evento (opcional)","editor.exclude_event_codes_helper":"Codigos de evento a excluir, ej. SCY (NWS) o 22 (DWD)","editor.sort_order":"Orden","editor.sort_default":"Predeterminado","editor.sort_onset":"Hora de inicio","editor.sort_severity":"Gravedad","editor.color_theme":"Tema de color","editor.color_severity":"Basado en gravedad","editor.color_nws":"NWS oficial","editor.color_meteoalarm":"MeteoAlarm Conciencia","editor.color_eccc":"Alertas p\xFAblicas ECCC","editor.timezone":"Zona horaria","editor.tz_server":"Servidor (Home Assistant)","editor.tz_browser":"Navegador (dispositivo local)","editor.min_severity":"Gravedad minima","editor.severity_all":"Todas las gravedades","editor.severity_minor":"Menor o superior","editor.severity_moderate":"Moderada o superior","editor.severity_severe":"Grave o superior","editor.severity_extreme":"Solo extrema","editor.animations":"Activar animaciones","editor.enhance_contrast":"Mejorar contraste","editor.enhance_contrast_off":"Desactivado","editor.enhance_contrast_subtle":"Sutil (por defecto)","editor.enhance_contrast_strict":"Estricto (WCAG AA)","editor.deduplicate":"Deduplicar alertas","editor.deduplicate_headlines":"Deduplicar titulares","editor.show_details":"Mostrar panel de detalles","editor.expand_details":"Siempre expandir detalles","editor.show_metadata":"Mostrar metadatos","editor.show_description":"Mostrar descripcion","editor.show_instructions":"Mostrar instrucciones","editor.show_geometry":"Mostrar mapa de \xE1rea","editor.geometry_style":"Estilo del mapa de \xE1rea","editor.geometry_style_shape":"Solo contorno","editor.geometry_style_map":"Mosaicos de mapa (en l\xEDnea)","editor.show_provider":"Mostrar proveedor","editor.show_source_link":"Mostrar enlace de fuente","editor.reformat_text":"Reformatear texto (eliminar saltos de linea)","editor.compact":"Disposicion compacta","editor.font_size":"Tama\xF1o de fuente","editor.font_size_small":"Peque\xF1o","editor.font_size_default":"Predeterminado","editor.font_size_large":"Grande","editor.font_size_x_large":"Extra grande","editor.hide_expired":"Ocultar alertas expiradas","editor.hide_no_alerts":"Ocultar tarjeta sin alertas","editor.unavailable_behavior":"Cuando una fuente no est\xE1 disponible","editor.unavailable_message":"Mostrar qu\xE9 fuente","editor.unavailable_compact":"Mostrar un indicador compacto","editor.unavailable_hide":"Ocultar indicador (no recomendado)","editor.unavailable_hide_warning":"Ocultar el indicador puede presentar una calma total mientras una fuente est\xE1 ciega: un sensor no disponible no es prueba de seguridad.","editor.allow_dismiss":"Permitir descartar alertas","editor.show_dismiss_undo":"Mostrar notificaci\xF3n para deshacer","editor.dismissed_count":"Descartadas: {count} alertas.","editor.dismissed_count_singular":"Descartada: {count} alerta.","editor.restore_all":"Restaurar todo","editor.show_preview":"Mostrar datos de ejemplo","editor.preview_hint":"Vista previa con alertas de ejemplo","editor.preview_nudge":"Sin alertas activas \u2014 active para previsualizar el diseno.","editor.entity_warning":"La entidad seleccionada no parece contener datos de alerta meteorologica.","editor.no_entities_hint":"No se encontraron entidades de alerta meteorologica compatibles. Se debe instalar una integracion (ej. NWS Alerts).","editor.no_entities_hint_link":"Proveedores compatibles","editor.feeds":"Recopilar feeds instalados automaticamente","editor.feeds_helper":"Feeds de integracion detectados. Marca uno para incluir cada incidente en vivo que reporta \u2014 sin entidades por incidente que listar. Requiere que la integracion este configurada en Home Assistant.","editor.source_hint":"Recopilando automaticamente {count} incidente(s) en vivo del feed \u2014 sin entidades que listar manualmente.","editor.feeds_missing_warning":"Sin datos en vivo para {feeds}. Este feed esta habilitado pero nada lo proporciona \u2014 \xBFesta la integracion configurada en Home Assistant?","editor.no_device_alerts_hint":"Aun no se encontraron sensores de alerta activos bajo este dispositivo. La tarjeta se rellenara automaticamente cuando CAP Alerts publique alertas.","editor.section_entity":"Entidad y proveedor","editor.section_filtering":"Filtrado","editor.section_appearance":"Apariencia","editor.section_detail_panel":"Panel de detalles","editor.section_behavior":"Comportamiento","editor.section_dismissal":"Descarte","editor.dismiss_trigger":"Disparador","editor.dismiss_trigger_button":"Solo boton","editor.dismiss_trigger_swipe":"Solo deslizamiento","editor.dismiss_trigger_both":"Boton y deslizamiento","editor.dismiss_button_style":"Estilo del boton","editor.dismiss_button_style_icon":"Solo icono","editor.dismiss_button_style_labeled":"Icono y texto"},wo={"card.no_alerts":"Nessuna allerta attiva.","card.sources_unavailable_named":"{name} non disponibile","card.sources_unavailable_count":"{count} fonti non disponibili","card.sources_unavailable_one":"Una fonte non \xE8 disponibile","card.preview":"Dati di esempio","card.read_details":"Leggi dettagli","card.open_source":"Apri fonte {provider}","card.zones_count":"{count} zone","card.zone_count_singular":"{count} zona","card.dismiss":"Ignora","card.dismissed_toast":"Ignorata: {event}","card.dismissed_toast_undo":"Annulla","detail.issued":"Emessa","detail.onset":"Inizio","detail.expires":"Scadenza","detail.area":"Area","detail.source":"Fonte","detail.description":"Descrizione","detail.instructions":"Istruzioni","progress.start":"Inizio","progress.now":"Ora","progress.end":"Fine","progress.ongoing":"In corso","progress.expires_in_label":"Scade tra","progress.starts_in_label":"Inizia tra","progress.tbd":"N.D.","progress.na":"N/D","progress.expired_label":"Scaduta","progress.compact_active":"per {time}","progress.compact_prep":"tra {time}","progress.compact_ongoing":"in corso","progress.compact_expired":"scaduta {time} fa","time.just_now":"proprio ora","time.in_less_than_1m":"in <1m","time.minutes_ago":"{m}m fa","time.in_minutes":"in {m}m","time.hours_ago":"{dur} fa","time.in_hours":"in {dur}","time.days_ago":"{d}g fa","time.in_days":"in {d}g","badge.severity_extreme":"Estrema","badge.severity_severe":"Grave","badge.severity_moderate":"Moderata","badge.severity_minor":"Lieve","badge.severity_unknown":"Sconosciuta","badge.certainty_observed":"Osservata","badge.certainty_likely":"Probabile","badge.certainty_possible":"Possibile","badge.certainty_unlikely":"Improbabile","badge.certainty_unknown":"Sconosciuta","editor.entities":"Entit\xE0","editor.title":"Titolo (opzionale)","editor.provider":"Fornitore allerte","editor.provider_auto":"Rilevamento automatico","editor.provider_nws":"NWS (Stati Uniti)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Germania)","editor.provider_meteoswiss":"MeteoSwiss (Svizzera)","editor.provider_eccc":"ECCC (Canada)","editor.provider_nsw_rfs":"NSW RFS (Australia)","editor.provider_cap":"Allerte CAP (multi-regione)","editor.device":"Dispositivo CAP Alerts (opzionale)","editor.device_helper":"Aggiunge automaticamente ogni sensore di allerta attivo sotto questo dispositivo.","editor.zones":"Zone (opzionale)","editor.zones_helper":"Codici area_id BoM separati da virgola, es. NSW_FL049","editor.event_codes":"Codici evento (opzionale)","editor.event_codes_helper":"Codici evento separati da virgola, es. TOW, SVW (NWS) o 31, 95 (DWD)","editor.exclude_event_codes":"Escludi codici evento (opzionale)","editor.exclude_event_codes_helper":"Codici evento da escludere, es. SCY (NWS) o 22 (DWD)","editor.sort_order":"Ordinamento","editor.sort_default":"Predefinito","editor.sort_onset":"Ora di inizio","editor.sort_severity":"Gravit\xE0","editor.color_theme":"Tema colori","editor.color_severity":"Basato sulla gravit\xE0","editor.color_nws":"NWS ufficiale","editor.color_meteoalarm":"MeteoAlarm Livelli","editor.color_eccc":"Allerte pubbliche ECCC","editor.timezone":"Fuso orario","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (dispositivo locale)","editor.min_severity":"Gravit\xE0 minima","editor.severity_all":"Tutte le gravit\xE0","editor.severity_minor":"Lieve o superiore","editor.severity_moderate":"Moderata o superiore","editor.severity_severe":"Grave o superiore","editor.severity_extreme":"Solo estrema","editor.animations":"Abilita animazioni","editor.enhance_contrast":"Migliora contrasto","editor.enhance_contrast_off":"Disattivato","editor.enhance_contrast_subtle":"Sottile (predefinito)","editor.enhance_contrast_strict":"Rigoroso (WCAG AA)","editor.deduplicate":"Deduplica allerte","editor.deduplicate_headlines":"Deduplica titoli","editor.show_details":"Mostra pannello dettagli","editor.expand_details":"Espandi sempre i dettagli","editor.show_metadata":"Mostra metadati","editor.show_description":"Mostra descrizione","editor.show_instructions":"Mostra istruzioni","editor.show_geometry":"Mostra mappa area","editor.geometry_style":"Stile mappa area","editor.geometry_style_shape":"Solo contorno","editor.geometry_style_map":"Tile mappa (online)","editor.show_provider":"Mostra fornitore","editor.show_source_link":"Mostra link alla fonte","editor.reformat_text":"Riformatta testo (rimuovi interruzioni di riga)","editor.compact":"Layout compatto","editor.font_size":"Dimensione testo","editor.font_size_small":"Piccolo","editor.font_size_default":"Predefinito","editor.font_size_large":"Grande","editor.font_size_x_large":"Molto grande","editor.hide_expired":"Nascondi allerte scadute","editor.hide_no_alerts":"Nascondi scheda senza allerte","editor.unavailable_behavior":"Quando una fonte non \xE8 disponibile","editor.unavailable_message":"Mostra quale fonte","editor.unavailable_compact":"Mostra un indicatore compatto","editor.unavailable_hide":"Nascondi indicatore (sconsigliato)","editor.unavailable_hide_warning":"Nascondere l'indicatore pu\xF2 presentare un cessato allarme mentre una fonte \xE8 cieca: un sensore non disponibile non \xE8 prova di sicurezza.","editor.allow_dismiss":"Consenti di ignorare le allerte","editor.show_dismiss_undo":"Mostra notifica di annullamento","editor.dismissed_count":"Ignorate: {count} allerte.","editor.dismissed_count_singular":"Ignorata: {count} allerta.","editor.restore_all":"Ripristina tutto","editor.show_preview":"Mostra dati di esempio","editor.preview_hint":"Anteprima del layout con allerte di esempio","editor.preview_nudge":"Nessuna allerta attiva \u2014 attiva per visualizzare il layout.","editor.entity_warning":"L'entit\xE0 selezionata non sembra contenere dati di allerta meteo.","editor.no_entities_hint":"Nessuna entita di allerta meteo compatibile trovata. Un'integrazione (es. NWS Alerts) deve essere installata.","editor.no_entities_hint_link":"Provider supportati","editor.feeds":"Raccolta automatica dai feed installati","editor.feeds_helper":"Feed di integrazione rilevati. Selezionane uno per includere ogni incidente in tempo reale che segnala \u2014 nessuna entita per incidente da elencare. Richiede che l'integrazione sia configurata in Home Assistant.","editor.source_hint":"Raccolta automatica di {count} incident(i) in tempo reale dal feed \u2014 nessuna entita da elencare manualmente.","editor.feeds_missing_warning":"Nessun dato in tempo reale per {feeds}. Questo feed e abilitato ma nulla lo fornisce \u2014 l'integrazione e configurata in Home Assistant?","editor.no_device_alerts_hint":"Nessun sensore di allerta attivo trovato sotto questo dispositivo per ora. La scheda si popolera automaticamente quando CAP Alerts pubblichera delle allerte.","editor.section_entity":"Entit\xE0 e fornitore","editor.section_filtering":"Filtraggio","editor.section_appearance":"Aspetto","editor.section_detail_panel":"Pannello dettagli","editor.section_behavior":"Comportamento","editor.section_dismissal":"Dismissione","editor.dismiss_trigger":"Attivatore","editor.dismiss_trigger_button":"Solo pulsante","editor.dismiss_trigger_swipe":"Solo scorrimento","editor.dismiss_trigger_both":"Pulsante e scorrimento","editor.dismiss_button_style":"Stile pulsante","editor.dismiss_button_style_icon":"Solo icona","editor.dismiss_button_style_labeled":"Icona e testo"},yo={"card.no_alerts":"Keine aktiven Warnungen.","card.sources_unavailable_named":"{name} nicht verf\xFCgbar","card.sources_unavailable_count":"{count} Quellen nicht verf\xFCgbar","card.sources_unavailable_one":"Eine Quelle ist nicht verf\xFCgbar","card.preview":"Beispieldaten","card.read_details":"Details lesen","card.open_source":"{provider}-Quelle \xF6ffnen","card.zones_count":"{count} Zonen","card.zone_count_singular":"{count} Zone","card.dismiss":"Ausblenden","card.dismissed_toast":"Ausgeblendet: {event}","card.dismissed_toast_undo":"R\xFCckg\xE4ngig","detail.issued":"Ausgegeben","detail.onset":"Beginn","detail.expires":"Ablauf","detail.area":"Gebiet","detail.source":"Quelle","detail.description":"Beschreibung","detail.instructions":"Hinweise","progress.start":"Start","progress.now":"Jetzt","progress.end":"Ende","progress.ongoing":"Laufend","progress.expires_in_label":"Endet in","progress.starts_in_label":"Beginnt in","progress.tbd":"Offen","progress.na":"K. A.","progress.expired_label":"Abgelaufen","progress.compact_active":"f\xFCr {time}","progress.compact_prep":"in {time}","progress.compact_ongoing":"laufend","progress.compact_expired":"abgelaufen vor {time}","time.just_now":"gerade eben","time.in_less_than_1m":"in <1 Min","time.minutes_ago":"vor {m} Min","time.in_minutes":"in {m} Min","time.hours_ago":"vor {dur}","time.in_hours":"in {dur}","time.days_ago":"vor {d} T","time.in_days":"in {d} T","badge.severity_extreme":"Extrem","badge.severity_severe":"Schwer","badge.severity_moderate":"M\xE4\xDFig","badge.severity_minor":"Gering","badge.severity_unknown":"Unbekannt","badge.certainty_observed":"Beobachtet","badge.certainty_likely":"Wahrscheinlich","badge.certainty_possible":"M\xF6glich","badge.certainty_unlikely":"Unwahrscheinlich","badge.certainty_unknown":"Unbekannt","editor.entities":"Entit\xE4ten","editor.title":"Titel (optional)","editor.provider":"Warnanbieter","editor.provider_auto":"Automatisch erkennen","editor.provider_nws":"NWS (USA)","editor.provider_bom":"BoM (Australien)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Deutschland)","editor.provider_meteoswiss":"MeteoSwiss (Schweiz)","editor.provider_eccc":"ECCC (Kanada)","editor.provider_nsw_rfs":"NSW RFS (Australien)","editor.provider_cap":"CAP-Warnungen (multi-regional)","editor.device":"CAP-Alerts-Ger\xE4t (optional)","editor.device_helper":"Bezieht automatisch jeden aktiven Warnsensor unter diesem Ger\xE4t ein.","editor.zones":"Zonen (optional)","editor.zones_helper":"Kommagetrennte BoM area_id-Codes, z. B. NSW_FL049","editor.event_codes":"Ereigniscodes (optional)","editor.event_codes_helper":"Kommagetrennte Ereigniscodes, z. B. TOW, SVW (NWS) oder 31, 95 (DWD)","editor.exclude_event_codes":"Ereigniscodes ausschlie\xDFen (optional)","editor.exclude_event_codes_helper":"Ereigniscodes zum Ausschlie\xDFen, z. B. SCY (NWS) oder 22 (DWD)","editor.sort_order":"Sortierung","editor.sort_default":"Standard","editor.sort_onset":"Beginnzeit","editor.sort_severity":"Schweregrad","editor.color_theme":"Farbschema","editor.color_severity":"Nach Schweregrad","editor.color_nws":"NWS offiziell","editor.color_meteoalarm":"MeteoAlarm Warnstufen","editor.color_eccc":"ECCC \xF6ffentliche Warnungen","editor.timezone":"Zeitzone","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (lokales Ger\xE4t)","editor.min_severity":"Mindestschweregrad","editor.severity_all":"Alle Schweregrade","editor.severity_minor":"Gering oder h\xF6her","editor.severity_moderate":"M\xE4\xDFig oder h\xF6her","editor.severity_severe":"Schwer oder h\xF6her","editor.severity_extreme":"Nur extrem","editor.animations":"Animationen aktivieren","editor.enhance_contrast":"Kontrast erh\xF6hen","editor.enhance_contrast_off":"Aus","editor.enhance_contrast_subtle":"Dezent (Standard)","editor.enhance_contrast_strict":"Streng (WCAG AA)","editor.deduplicate":"Warnungen deduplizieren","editor.deduplicate_headlines":"\xDCberschriften deduplizieren","editor.show_details":"Detailbereich anzeigen","editor.expand_details":"Details immer anzeigen","editor.show_metadata":"Metadaten anzeigen","editor.show_description":"Beschreibung anzeigen","editor.show_instructions":"Hinweise anzeigen","editor.show_geometry":"Gebietskarte anzeigen","editor.geometry_style":"Gebietskartenstil","editor.geometry_style_shape":"Nur Umriss","editor.geometry_style_map":"Kartenkacheln (online)","editor.show_provider":"Anbieter anzeigen","editor.show_source_link":"Quelllink anzeigen","editor.reformat_text":"Text umformatieren (harte Zeilenumbr\xFCche entfernen)","editor.compact":"Kompaktes Layout","editor.font_size":"Schriftgr\xF6\xDFe","editor.font_size_small":"Klein","editor.font_size_default":"Standard","editor.font_size_large":"Gro\xDF","editor.font_size_x_large":"Sehr gro\xDF","editor.hide_expired":"Abgelaufene Warnungen ausblenden","editor.hide_no_alerts":"Karte ohne aktive Warnungen ausblenden","editor.unavailable_behavior":"Wenn eine Quelle nicht verf\xFCgbar ist","editor.unavailable_message":"Betroffene Quelle anzeigen","editor.unavailable_compact":"Kompakten Hinweis anzeigen","editor.unavailable_hide":"Anzeige ausblenden (nicht empfohlen)","editor.unavailable_hide_warning":"Das Ausblenden der Anzeige kann Entwarnung signalisieren, w\xE4hrend eine Quelle blind ist \u2014 ein nicht verf\xFCgbarer Sensor ist kein Beweis f\xFCr Sicherheit.","editor.allow_dismiss":"Warnungen ausblendbar machen","editor.show_dismiss_undo":"R\xFCckg\xE4ngig-Benachrichtigung anzeigen","editor.dismissed_count":"Ausgeblendet: {count} Warnungen.","editor.dismissed_count_singular":"Ausgeblendet: {count} Warnung.","editor.restore_all":"Alle wiederherstellen","editor.show_preview":"Beispieldaten anzeigen","editor.preview_hint":"Kartenlayout mit Beispielwarnungen anzeigen","editor.preview_nudge":"Keine aktiven Warnungen \u2014 aktivieren, um das Kartenlayout zu sehen.","editor.entity_warning":"Die ausgew\xE4hlte Entit\xE4t scheint keine Wetterwarnungsdaten zu enthalten.","editor.no_entities_hint":"Keine kompatiblen Wetterwarnungs-Entitaten gefunden. Eine Integration (z.B. NWS Alerts) muss installiert sein.","editor.no_entities_hint_link":"Unterstutzte Anbieter","editor.feeds":"Automatisch aus installierten Feeds erfassen","editor.feeds_helper":"Erkannte Integrations-Feeds. Wahlen Sie einen aus, um jedes gemeldete Live-Ereignis einzuschliessen \u2014 keine Entitaten pro Ereignis aufzulisten. Erfordert, dass die Integration in Home Assistant eingerichtet ist.","editor.source_hint":"Automatische Erfassung von {count} Live-Ereignis(sen) aus dem Feed \u2014 keine Entitaten manuell aufzulisten.","editor.feeds_missing_warning":"Keine Live-Daten fur {feeds}. Dieser Feed ist aktiviert, aber nichts liefert Daten \u2014 ist die Integration in Home Assistant eingerichtet?","editor.no_device_alerts_hint":"Noch keine aktiven Warnsensoren unter diesem Gerat gefunden. Die Karte fullt sich automatisch, sobald CAP Alerts Warnungen veroffentlicht.","editor.section_entity":"Entit\xE4t und Anbieter","editor.section_filtering":"Filterung","editor.section_appearance":"Darstellung","editor.section_detail_panel":"Detailbereich","editor.section_behavior":"Verhalten","editor.section_dismissal":"Ausblenden","editor.dismiss_trigger":"Ausl\xF6ser","editor.dismiss_trigger_button":"Nur Schaltfl\xE4che","editor.dismiss_trigger_swipe":"Nur wischen","editor.dismiss_trigger_both":"Schaltfl\xE4che und wischen","editor.dismiss_button_style":"Schaltfl\xE4chenstil","editor.dismiss_button_style_icon":"Nur Symbol","editor.dismiss_button_style_labeled":"Symbol und Text"},hi={en:_o,fr:vo,es:bo,it:wo,de:yo};function c(t,e,i){var r,s;const o=e.split("-")[0].toLowerCase();let n=(s=(r=(hi[o]||hi.en)[t])!=null?r:hi.en[t])!=null?s:t;if(i)for(const[l,d]of Object.entries(i))n=n.split(`{${l}}`).join(String(d));return n}const xo={"tsunami warning":{hex:"#FD6347",rgb:"253, 99, 71",crLight:2.978,crDark:5.714},"tornado warning":{hex:"#FF0000",rgb:"255, 0, 0",crLight:3.998,crDark:4.255},"extreme wind warning":{hex:"#FF8C00",rgb:"255, 140, 0",crLight:2.332,crDark:7.295},"severe thunderstorm warning":{hex:"#FFA500",rgb:"255, 165, 0",crLight:1.975,crDark:8.616},"flash flood warning":{hex:"#8B0000",rgb:"139, 0, 0",crLight:10.011,crDark:1.7},"flash flood statement":{hex:"#8B0000",rgb:"139, 0, 0",crLight:10.011,crDark:1.7},"severe weather statement":{hex:"#00FFFF",rgb:"0, 255, 255",crLight:1.254,crDark:13.57},"shelter in place warning":{hex:"#FA8072",rgb:"250, 128, 114",crLight:2.501,crDark:6.802},"evacuation immediate":{hex:"#7FFF00",rgb:"127, 255, 0",crLight:1.296,crDark:13.131},"civil danger warning":{hex:"#FFB6C1",rgb:"255, 182, 193",crLight:1.652,crDark:10.301},"nuclear power plant warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"radiological hazard warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"hazardous materials warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"fire warning":{hex:"#A0522D",rgb:"160, 82, 45",crLight:5.616,crDark:3.03},"civil emergency message":{hex:"#FFB6C1",rgb:"255, 182, 193",crLight:1.652,crDark:10.301},"law enforcement warning":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"storm surge warning":{hex:"#B524F7",rgb:"181, 36, 247",crLight:4.605,crDark:3.695},"hurricane force wind warning":{hex:"#CD5C5C",rgb:"205, 92, 92",crLight:3.976,crDark:4.279},"hurricane warning":{hex:"#DC143C",rgb:"220, 20, 60",crLight:4.99,crDark:3.41},"typhoon warning":{hex:"#DC143C",rgb:"220, 20, 60",crLight:4.99,crDark:3.41},"special marine warning":{hex:"#FFA500",rgb:"255, 165, 0",crLight:1.975,crDark:8.616},"blizzard warning":{hex:"#FF4500",rgb:"255, 69, 0",crLight:3.441,crDark:4.945},"snow squall warning":{hex:"#C71585",rgb:"199, 21, 133",crLight:5.42,crDark:3.139},"ice storm warning":{hex:"#8B008B",rgb:"139, 0, 139",crLight:8.5,crDark:2.002},"heavy freezing spray warning":{hex:"#00BFFF",rgb:"0, 191, 255",crLight:2.122,crDark:8.018},"winter storm warning":{hex:"#FF69B4",rgb:"255, 105, 180",crLight:2.648,crDark:6.426},"lake effect snow warning":{hex:"#008B8B",rgb:"0, 139, 139",crLight:4.145,crDark:4.104},"dust storm warning":{hex:"#FFE4C4",rgb:"255, 228, 196",crLight:1.225,crDark:13.893},"blowing dust warning":{hex:"#FFE4C4",rgb:"255, 228, 196",crLight:1.225,crDark:13.893},"high wind warning":{hex:"#DAA520",rgb:"218, 165, 32",crLight:2.238,crDark:7.603},"tropical storm warning":{hex:"#B22222",rgb:"178, 34, 34",crLight:6.677,crDark:2.548},"storm warning":{hex:"#9400D3",rgb:"148, 0, 211",crLight:6.563,crDark:2.593},"tsunami advisory":{hex:"#D2691E",rgb:"210, 105, 30",crLight:3.633,crDark:4.683},"tsunami watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"avalanche warning":{hex:"#1E90FF",rgb:"30, 144, 255",crLight:3.236,crDark:5.257},"earthquake warning":{hex:"#8B4513",rgb:"139, 69, 19",crLight:7.098,crDark:2.397},"volcano warning":{hex:"#2F4F4F",rgb:"47, 79, 79",crLight:8.928,crDark:1.906},"ashfall warning":{hex:"#A9A9A9",rgb:"169, 169, 169",crLight:2.35,crDark:7.239},"flood warning":{hex:"#00FF00",rgb:"0, 255, 0",crLight:1.372,crDark:12.4},"coastal flood warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"lakeshore flood warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"ashfall advisory":{hex:"#696969",rgb:"105, 105, 105",crLight:5.49,crDark:3.099},"high surf warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"extreme heat warning":{hex:"#C71585",rgb:"199, 21, 133",crLight:5.42,crDark:3.139},"tornado watch":{hex:"#FFFF00",rgb:"255, 255, 0",crLight:1.074,crDark:15.845},"severe thunderstorm watch":{hex:"#DB7093",rgb:"219, 112, 147",crLight:3.111,crDark:5.47},"flash flood watch":{hex:"#2E8B57",rgb:"46, 139, 87",crLight:4.245,crDark:4.008},"gale warning":{hex:"#DDA0DD",rgb:"221, 160, 221",crLight:2.07,crDark:8.221},"flood statement":{hex:"#00FF00",rgb:"0, 255, 0",crLight:1.372,crDark:12.4},"extreme cold warning":{hex:"#0000FF",rgb:"0, 0, 255",crLight:8.592,crDark:1.98},"freeze warning":{hex:"#483D8B",rgb:"72, 61, 139",crLight:9.068,crDark:1.876},"red flag warning":{hex:"#FF1493",rgb:"255, 20, 147",crLight:3.637,crDark:4.678},"storm surge watch":{hex:"#DB7FF7",rgb:"219, 127, 247",crLight:2.503,crDark:6.798},"hurricane watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"hurricane force wind watch":{hex:"#9932CC",rgb:"153, 50, 204",crLight:5.702,crDark:2.984},"typhoon watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"tropical storm watch":{hex:"#F08080",rgb:"240, 128, 128",crLight:2.591,crDark:6.566},"storm watch":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"tropical cyclone local statement":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"winter weather advisory":{hex:"#7B68EE",rgb:"123, 104, 238",crLight:4.153,crDark:4.097},"avalanche advisory":{hex:"#CD853F",rgb:"205, 133, 63",crLight:2.99,crDark:5.69},"cold weather advisory":{hex:"#AFEEEE",rgb:"175, 238, 238",crLight:1.289,crDark:13.196},"heat advisory":{hex:"#FF7F50",rgb:"255, 127, 80",crLight:2.499,crDark:6.809},"flood advisory":{hex:"#00FF7F",rgb:"0, 255, 127",crLight:1.345,crDark:12.648},"coastal flood advisory":{hex:"#7CFC00",rgb:"124, 252, 0",crLight:1.331,crDark:12.786},"lakeshore flood advisory":{hex:"#7CFC00",rgb:"124, 252, 0",crLight:1.331,crDark:12.786},"high surf advisory":{hex:"#BA55D3",rgb:"186, 85, 211",crLight:3.942,crDark:4.317},"dense fog advisory":{hex:"#708090",rgb:"112, 128, 144",crLight:4.055,crDark:4.196},"dense smoke advisory":{hex:"#F0E68C",rgb:"240, 230, 140",crLight:1.28,crDark:13.29},"small craft advisory":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"brisk wind advisory":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"hazardous seas warning":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"dust advisory":{hex:"#BDB76B",rgb:"189, 183, 107",crLight:2.069,crDark:8.223},"blowing dust advisory":{hex:"#BDB76B",rgb:"189, 183, 107",crLight:2.069,crDark:8.223},"lake wind advisory":{hex:"#D2B48C",rgb:"210, 180, 140",crLight:1.972,crDark:8.627},"wind advisory":{hex:"#D2B48C",rgb:"210, 180, 140",crLight:1.972,crDark:8.627},"frost advisory":{hex:"#6495ED",rgb:"100, 149, 237",crLight:2.973,crDark:5.723},"freezing fog advisory":{hex:"#008080",rgb:"0, 128, 128",crLight:4.773,crDark:3.564},"freezing spray advisory":{hex:"#00BFFF",rgb:"0, 191, 255",crLight:2.122,crDark:8.018},"low water advisory":{hex:"#A52A2A",rgb:"165, 42, 42",crLight:7.084,crDark:2.402},"local area emergency":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"winter storm watch":{hex:"#4682B4",rgb:"70, 130, 180",crLight:4.108,crDark:4.142},"rip current statement":{hex:"#40E0D0",rgb:"64, 224, 208",crLight:1.642,crDark:10.364},"beach hazards statement":{hex:"#40E0D0",rgb:"64, 224, 208",crLight:1.642,crDark:10.364},"gale watch":{hex:"#FFC0CB",rgb:"255, 192, 203",crLight:1.538,crDark:11.063},"avalanche watch":{hex:"#F4A460",rgb:"244, 164, 96",crLight:2.034,crDark:8.366},"hazardous seas watch":{hex:"#483D8B",rgb:"72, 61, 139",crLight:9.068,crDark:1.876},"heavy freezing spray watch":{hex:"#BC8F8F",rgb:"188, 143, 143",crLight:2.814,crDark:6.047},"flood watch":{hex:"#2E8B57",rgb:"46, 139, 87",crLight:4.245,crDark:4.008},"coastal flood watch":{hex:"#66CDAA",rgb:"102, 205, 170",crLight:1.931,crDark:8.814},"lakeshore flood watch":{hex:"#66CDAA",rgb:"102, 205, 170",crLight:1.931,crDark:8.814},"high wind watch":{hex:"#B8860B",rgb:"184, 134, 11",crLight:3.254,crDark:5.228},"extreme heat watch":{hex:"#800000",rgb:"128, 0, 0",crLight:10.95,crDark:1.554},"extreme cold watch":{hex:"#5F9EA0",rgb:"95, 158, 160",crLight:3.05,crDark:5.578},"freeze watch":{hex:"#00FFFF",rgb:"0, 255, 255",crLight:1.254,crDark:13.57},"fire weather watch":{hex:"#FFDEAD",rgb:"255, 222, 173",crLight:1.288,crDark:13.21},"extreme fire danger":{hex:"#E9967A",rgb:"233, 150, 122",crLight:2.306,crDark:7.38},"911 telephone outage":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"coastal flood statement":{hex:"#6B8E23",rgb:"107, 142, 35",crLight:3.805,crDark:4.471},"lakeshore flood statement":{hex:"#6B8E23",rgb:"107, 142, 35",crLight:3.805,crDark:4.471},"special weather statement":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"marine weather statement":{hex:"#FFDAB9",rgb:"255, 218, 185",crLight:1.314,crDark:12.948},"air quality alert":{hex:"#808080",rgb:"128, 128, 128",crLight:3.949,crDark:4.308},"air stagnation advisory":{hex:"#808080",rgb:"128, 128, 128",crLight:3.949,crDark:4.308},"hazardous weather outlook":{hex:"#EEE8AA",rgb:"238, 232, 170",crLight:1.253,crDark:13.578},"hydrologic outlook":{hex:"#90EE90",rgb:"144, 238, 144",crLight:1.417,crDark:12.006},"short term forecast":{hex:"#98FB98",rgb:"152, 251, 152",crLight:1.266,crDark:13.439},"administrative message":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},test:{hex:"#F0FFFF",rgb:"240, 255, 255",crLight:1.027,crDark:16.572},"child abduction emergency":{hex:"#FFFFFF",rgb:"255, 255, 255",crLight:1,crDark:17.015},"blue alert":{hex:"#FFFFFF",rgb:"255, 255, 255",crLight:1,crDark:17.015}},Ao=["a","b","br","em","i","li","ol","p","strong","ul"];kr.addHook("afterSanitizeAttributes",t=>{t.tagName==="A"&&(t.setAttribute("target","_blank"),t.setAttribute("rel","noopener noreferrer"))});function $o(t){return t?kr.sanitize(t,{ALLOWED_TAGS:Ao,ALLOWED_ATTR:["href"]}):""}const Eo=[[["tornado"],"mdi:weather-tornado"],[["tsunami"],"mdi:tsunami"],[["hurricane","tropical","typhoon","cyclone"],"mdi:weather-hurricane"],[["thunderstorm","gewitter"],"mdi:weather-lightning"],[["hail","hagel"],"mdi:weather-hail"],[["flood","hydrologic","storm surge","hochwasser"],"mdi:home-flood"],[["rain","shower","precipitation","starkregen","dauerregen"],"mdi:weather-pouring"],[["snow","blizzard","winter","schnee","schneesturm"],"mdi:weather-snowy-heavy"],[["sleet"],"mdi:weather-snowy-rainy"],[["ice","freeze","frost","slippery","gl\xE4tte","glatteis"],"mdi:snowflake"],[["thaw"],"mdi:snowflake-melt"],[["cold","chill","low temperature","k\xE4lte"],"mdi:thermometer-low"],[["landslide","avalanche","lawine"],"mdi:landslide"],[["earthquake"],"mdi:pulse"],[["volcano","ashfall","vog"],"mdi:volcano"],[["dust","sand"],"mdi:weather-dust"],[["smoke"],"mdi:smoke"],[["air quality","air stagnation"],"mdi:air-filter"],[["fire","red flag","waldbrand"],"mdi:fire"],[["heat","high temperature","hitze"],"mdi:weather-sunny-alert"],[["drought","trockenheit"],"mdi:water-off"],[["fog","nebel"],"mdi:weather-fog"],[["sheep","grazier"],"mdi:weather-windy-variant"],[["gale","squall"],"mdi:weather-windy"],[["wind","sturm","orkan","b\xF6en"],"mdi:weather-windy"],[["small craft"],"mdi:sail-boat"],[["rip current"],"mdi:wave"],[["surf","marine","coastal","seas"],"mdi:waves"]];function Lr(t){const e=t.toLowerCase().replace(/[-/]/g," ");for(const[i,r]of Eo)if(i.some(s=>e.includes(s)))return r;return"mdi:alert-circle-outline"}const Co=[[["likely"],"mdi:check-decagram"],[["observed"],"mdi:eye-check"],[["possible","unlikely"],"mdi:help-circle-outline"]];function So(t){const e=t.toLowerCase();for(const[i,r]of Co)if(i.some(s=>e.includes(s)))return r;return"mdi:bullseye-arrow"}const Do=[[["tornado"],"#FF0000"],[["hurricane","typhoon","tropical storm"],"#DC143C"],[["flood"],"#228B22"],[["blizzard","ice storm"],"#FF4500"],[["snow","winter"],"#1E90FF"],[["freeze","frost","ice"],"#6495ED"],[["wind"],"#D2B48C"],[["heat"],"#FF7F50"],[["fire","red flag"],"#FF4500"],[["fog"],"#708090"],[["tsunami"],"#FD6347"]],st="#ffffff",ot="#1c1c1e",To={subtle:{text:2,progress:1.3},strict:{text:3,progress:2}},$t="subtle";function ko(t){return t!=null?t:$t}function Mr(t){const e=t.replace("#",""),i=parseInt(e.slice(0,2),16)/255,r=parseInt(e.slice(2,4),16)/255,s=parseInt(e.slice(4,6),16)/255,o=n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4;return .2126*o(i)+.7152*o(r)+.0722*o(s)}function ne(t,e){const i=Mr(t),r=Mr(e),s=Math.max(i,r),o=Math.min(i,r);return(s+.05)/(o+.05)}const Lo={boostLight:!1,boostDark:!1,progressBoostLight:!1,progressBoostDark:!1};function Mo(t,e,i){if(i==="off")return Lo;const{text:r,progress:s}=To[i];return{boostLight:t<r,boostDark:e<r,progressBoostLight:t<s,progressBoostDark:e<s}}function Et(t){const e=t.replace("#","");return`${parseInt(e.slice(0,2),16)}, ${parseInt(e.slice(2,4),16)}, ${parseInt(e.slice(4,6),16)}`}const zo=1.9;function zr(t,e,i){return ne(t,e)>=zo?e:i}function Ro(t){return{light:zr(t,st,"#1a1a1a"),dark:zr(t,ot,"#f5f5f5")}}function nt(t,e,i,r,s){const o=Ro(t);return{color:t,rgb:e,textColorLight:o.light,textColorDark:o.dark,...Mo(i,r,s)}}function Rr(t,e=$t){const i=t.toLowerCase(),r=xo[i];if(r)return nt(r.hex,r.rgb,r.crLight,r.crDark,e);for(const[o,n]of Do)if(o.some(l=>i.includes(l)))return nt(n,Et(n),ne(n,st),ne(n,ot),e);const s="#808080";return nt(s,Et(s),ne(s,st),ne(s,ot),e)}const Fo={extreme:"#D8001E",severe:"#FF9900",moderate:"#FFC800",minor:"#88C840"};function Fr(t,e=$t){var i;const r=(i=Fo[t])!=null?i:"#808080";return nt(r,Et(r),ne(r,st),ne(r,ot),e)}const Io={red:"#D10000",orange:"#FF9500",yellow:"#FFFF00",grey:"#656565"},Po={extreme:"#D10000",severe:"#FF9500",moderate:"#FFFF00",minor:"#656565",unknown:"#656565"};function Ir(t,e=$t){var i,r,s;const o=(i=t.colorHint)==null?void 0:i.toLowerCase(),n=(s=(r=o&&Io[o])!=null?r:Po[t.severity])!=null?s:"#808080";return nt(n,Et(n),ne(n,st),ne(n,ot),e)}function S(t){if(!t||t==="None"||t.trim()==="")return 0;const e=new Date(t.trim());return isNaN(e.getTime())?0:e.getTime()/1e3}function No(t){const e=Date.now()/1e3,i=t.sentTs,r=i>0?i:e;let s=t.onsetTs;s===0&&(s=r);const o=s+3600;let n=t.endsTs;n===0&&(n=o);const l=t.endsTs>0,d=e>=s,h=l&&e>=n;let g,p,f,_;h?(g=s,p=n,f=n,_="Expired"):d?(g=s,p=n,f=e,_="Active"):(g=e,p=n,f=s,_="Preparation");const x=p-g,A=x>0?x:1,K=(f-g)/A*100,G=Math.max(0,Math.min(100,Math.round(K*10)/10)),te=Math.round((n-e)/3600*10)/10,X=Math.round((s-e)/3600*10)/10,E=Math.round((s-e)/60);return{isActive:d,isExpired:h,phaseText:_,progressPct:G,remainingHours:te,onsetHours:X,onsetMinutes:E,onsetTs:s,endsTs:n,sentTs:i,nowTs:e,hasEndTime:l}}function Oo(t){if(!t)return{locale:void 0};const e=t.language;return t.time_format==="12"?{locale:e,hour12:!0}:t.time_format==="24"?{locale:e,hour12:!1}:{locale:e}}function Uo(t,e,i){const r=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:i});return r.format(t)===r.format(e)}function Pr(t,e){var i,r;return e!=null&&e.timeZone&&(r=(i=new Intl.DateTimeFormat(e.language,{timeZoneName:"short",timeZone:e.timeZone}).formatToParts(t).find(s=>s.type==="timeZoneName"))==null?void 0:i.value)!=null?r:""}function Nr(t,e){var i,r,s,o,n,l;const d=e==null?void 0:e.language,h=e==null?void 0:e.date_format,g=e==null?void 0:e.timeZone;if(!h||h==="language")return t.toLocaleDateString(d,{timeZone:g});const p=new Intl.DateTimeFormat(d,{day:"numeric",month:"numeric",year:"numeric",timeZone:g}).formatToParts(t),f=(r=(i=p.find(A=>A.type==="day"))==null?void 0:i.value)!=null?r:"",_=(o=(s=p.find(A=>A.type==="month"))==null?void 0:s.value)!=null?o:"",x=(l=(n=p.find(A=>A.type==="year"))==null?void 0:n.value)!=null?l:"";switch(h){case"DMY":return`${f}/${_}/${x}`;case"MDY":return`${_}/${f}/${x}`;case"YMD":return`${x}/${_}/${f}`;default:return t.toLocaleDateString(d,{timeZone:g})}}function Or(t,e,i){const r=Oo(e),s={hour:i,minute:"2-digit",timeZone:e==null?void 0:e.timeZone};return r.hour12!==void 0&&(s.hour12=r.hour12),t.toLocaleTimeString(r.locale,s)}function Ur(t,e,i="en"){if(t<=0)return c("progress.na",i);const r=new Date(t*1e3),s=new Date,o=Pr(r,e),n=Or(r,e,"2-digit"),l=o?`${n} ${o}`:n;return Uo(r,s,e==null?void 0:e.timeZone)?l:`${l} (${Nr(r,e)})`}function ui(t,e,i="en"){if(t<=100)return c("progress.na",i);const r=new Date(t*1e3),s=Pr(r,e),o=Or(r,e,"numeric"),n=s?`${o} ${s}`:o;return`${Nr(r,e)}, ${n}`}function Br(t,e=Date.now()/1e3,i="en"){const r=t-e,s=Math.abs(r),o=r<0;if(s<60)return c(o?"time.just_now":"time.in_less_than_1m",i);if(s<3600){const l=Math.floor(s/60);return o?c("time.minutes_ago",i,{m:l}):c("time.in_minutes",i,{m:l})}if(s<86400){const l=Math.floor(s/3600),d=Math.floor(s%3600/60),h=d>0?`${l}h ${d}m`:`${l}h`;return o?c("time.hours_ago",i,{dur:h}):c("time.in_hours",i,{dur:h})}const n=Math.floor(s/86400);return o?c("time.days_ago",i,{d:n}):c("time.in_days",i,{d:n})}function Be(t,e=Date.now()/1e3){const i=Math.abs(t-e);if(i<60)return"<1m";if(i<3600)return`${Math.floor(i/60)}m`;if(i<86400){const o=Math.floor(i/3600),n=Math.floor(i%3600/60);return n>0?`${o}h ${n}m`:`${o}h`}const r=Math.floor(i/86400),s=Math.floor(i%86400/3600);return s>0?`${r}d ${s}h`:`${r}d`}function Bo(t,e=!0){const i=(t.headline||"").trim();if(!i)return"";if(!e)return i;const r=i.toLowerCase().replace(/[.\s]+$/,""),s=t.event.toLowerCase();return r.startsWith(s)||s.startsWith(r)?"":i}function Wr(t){if(!t)return"";const e=/^\s*[·•\-]\s/,i=/^\.[A-Z]/;return t.split(/\n{2,}/).map(r=>{const s=r.split(`
`),o=[];for(const n of s)o.length===0?o.push(n.trimStart()):e.test(n)||i.test(n.trimStart())||o[o.length-1].trimEnd().endsWith(":")?o.push(n):o[o.length-1]+=" "+n.trimStart();return o.map(n=>n.replace(/ {2,}/g," ")).map(n=>n.trimEnd()).filter(Boolean).join(`
`)}).filter(Boolean).join(`

`)}function pe(t){const e=(t||"").toLowerCase().replace(/\s/g,"");return["extreme","severe","moderate","minor"].includes(e)?e:"unknown"}const at={extreme:0,severe:1,moderate:2,minor:3,unknown:4};function Wo(t,e){return e==="onset"?[...t].sort((i,r)=>(i.onsetTs||1/0)-(r.onsetTs||1/0)):e==="severity"?[...t].sort((i,r)=>{var s,o;const n=((s=at[i.severity])!=null?s:4)-((o=at[r.severity])!=null?o:4);return n!==0?n:(i.onsetTs||1/0)-(r.onsetTs||1/0)}):t}function Ho(t,e){return t.zones.some(i=>e.has(i.toUpperCase()))}function jo(t,e){var i,r;const s=new Map,o=[];for(const l of t){const d=`${l.event}\0${l.severity}\0${l.onsetTs}\0${l.endsTs}\0${l.provider}`,h=s.get(d);h?h.push(l):(s.set(d,[l]),o.push(d))}let n=o.map(l=>{const d=s.get(l);if(d.length===1)return d[0];const h={...d[0]},g=new Set,p=new Set;for(const f of d){for(const _ of f.zones)g.add(_.toUpperCase());f.areaDesc&&p.add(f.areaDesc)}return h.zones=[...g],h.areaDesc=[...p].join("; "),h.mergedCount=d.length,h.id=`merged:${l}`,h});if(e&&e.length>1){const l=new Map;for(let h=0;h<e.length;h++)l.has(e[h])||l.set(e[h],h);const d=new Map;for(const h of n){if(h.endsTs===0)continue;const g=`${h.event}\0${h.endsTs}`,p=d.get(g);(!p||((i=l.get(h.provider))!=null?i:1/0)<((r=l.get(p))!=null?r:1/0))&&d.set(g,h.provider)}n=n.filter(h=>{if(h.endsTs===0)return!0;const g=`${h.event}\0${h.endsTs}`;return h.provider===d.get(g)})}return n}function Go(t){const e=t.split("/");return e[e.length-1].toUpperCase()}function qo(t){var e;const i=[];if(Array.isArray(t.AffectedZones))for(const r of t.AffectedZones)typeof r!="string"||!r||i.push(Go(r));if(Array.isArray((e=t.Geocode)==null?void 0:e.UGC))for(const r of t.Geocode.UGC){if(typeof r!="string"||!r)continue;const s=r.toUpperCase();i.includes(s)||i.push(s)}return i}class Yo{constructor(){this.provider="nws"}canHandle(e){const i=e.Alerts;if(!Array.isArray(i))return!1;if(i.length===0)return!0;const r=i[0];return typeof r=="object"&&r!==null&&"Event"in r&&"Severity"in r}parseAlerts(e){const i=e.Alerts;return Array.isArray(i)?i.filter(r=>typeof r=="object"&&r!==null).map(r=>this._normalize(r)):[]}_normalize(e){const i=pe(e.Severity);return{id:e.ID,event:e.Event||"Unknown",severity:i,severityLabel:e.Severity&&pe(e.Severity)!=="unknown"?e.Severity:i.charAt(0).toUpperCase()+i.slice(1),certainty:e.Certainty||"",urgency:e.Urgency||"",sentTs:S(e.Sent),onsetTs:S(e.Onset),endsTs:S(e.Ends)||S(e.Expires),description:e.Description||"",instruction:e.Instruction||"",url:e.URL||"",headline:e.Headline||"",areaDesc:e.AreaDesc||e.AreasAffected||"",zones:qo(e),eventCode:e.NWSCode||"",provider:"nws",phase:"",severityInferred:!e.Severity||pe(e.Severity)==="unknown",certaintyInferred:!1}}}function Zo(t,e,i){const r=t.toLowerCase();if(r.includes("extreme")||r.includes("tropical cyclone"))return{severity:"extreme",label:(r.includes("extreme"),"Extreme")};if(r.includes("severe"))return{severity:"severe",label:"Severe"};if(r.includes("major"))return{severity:"severe",label:"Major"};if(r.includes("moderate"))return{severity:"moderate",label:"Moderate"};if(r.includes("minor")||r.includes("initial"))return{severity:"minor",label:"Minor"};const s=e.toLowerCase();if(s.includes("tropical_cyclone"))return{severity:"extreme",label:"Extreme"};if(s.includes("severe")||s.includes("fire_weather"))return{severity:"severe",label:"Severe"};const o=i.charAt(0).toUpperCase()+i.slice(1);return i==="major"?{severity:"moderate",label:o}:{severity:"minor",label:o}}function Vo(t){return t.title||t.short_title||t.type.replace(/_/g," ")}function Ko(t){if(t.area_id&&t.id.startsWith(t.area_id+"_")){const e=t.id.slice(t.area_id.length+1);return`https://www.bom.gov.au/warning/${t.type.replace(/_/g,"-")}/${e}`}return"https://www.bom.gov.au/weather-and-climate/warnings-and-alerts"}const Xo={new:"New",update:"Updated",renewal:"Renewed",upgrade:"Upgraded",downgrade:"Downgraded",final:"Final"};function Qo(t){return Xo[t.toLowerCase()]||""}class Jo{constructor(){this.provider="bom"}canHandle(e){const i=e.warnings;if(!Array.isArray(i))return!1;if(i.length===0)return typeof e.attribution=="string"&&e.attribution.toLowerCase().includes("bureau of meteorology");const r=i[0];return typeof r=="object"&&r!==null&&"warning_group_type"in r&&"issue_time"in r}parseAlerts(e){const i=e.warnings;return Array.isArray(i)?i.filter(r=>typeof r=="object"&&r!==null).filter(r=>r.phase!=="cancelled").map(r=>this._normalize(r)):[]}_normalize(e){const i=S(e.issue_time),r=S(e.expiry_time),s=Vo(e),{severity:o,label:n}=Zo(s,e.type,e.warning_group_type);return{id:e.id,event:s,severity:o,severityLabel:n,certainty:"",urgency:"",sentTs:i,onsetTs:i,endsTs:r,description:"",instruction:"",url:Ko(e),headline:e.short_title||s,areaDesc:e.state||"",zones:e.area_id?[e.area_id.toUpperCase()]:[],eventCode:"",provider:"bom",phase:Qo(e.phase),severityInferred:!0,certaintyInferred:!1}}}const en="https://www.dwd.de/DE/wetter/warnungen_gemeinden/warnWetter_node.html",tn={"#880e4f":{severity:"extreme",label:"Extreme"},"#ff0000":{severity:"severe",label:"Severe"},"#ff9900":{severity:"moderate",label:"Moderate"},"#ffff00":{severity:"minor",label:"Minor"}};function rn(t,e){if(typeof t=="number")switch(t){case 4:return{severity:"extreme",label:"Extreme"};case 3:return{severity:"severe",label:"Severe"};case 2:return{severity:"moderate",label:"Moderate"};case 1:return{severity:"minor",label:"Minor"};case 0:return{severity:"unknown",label:"Unknown"}}if(typeof e=="string"){const i=tn[e.toLowerCase()];if(i)return i}return{severity:"unknown",label:"Unknown"}}function sn(t){return typeof t=="object"&&t!==null&&typeof t.level=="number"&&typeof t.color=="string"}class on{constructor(){this.provider="dwd"}canHandle(e){return typeof e.warning_count!="number"||typeof e.region_name!="string"?!1:e.warning_count>0?sn(e.warning_1):!0}parseAlerts(e){const i=typeof e.warning_count=="number"?e.warning_count:0;if(i<=0)return[];const r=typeof e.region_name=="string"?e.region_name:"",s=[];for(let o=1;o<=i;o++){const n=e[`warning_${o}`];if(!n||typeof n!="object")continue;const l=n,d=typeof l.level=="number"?l.level:void 0;if(d===0)continue;const{severity:h,label:g}=rn(d,l.color),p=S(l.start_time),f=S(l.end_time),_=typeof l.event_code=="number"?String(l.event_code):"",x=typeof l.event=="string"?l.event:"";s.push({id:`dwd_${_||x}_${p}`,event:x,severity:h,severityLabel:g,certainty:"",urgency:"",sentTs:0,onsetTs:p,endsTs:f,description:typeof l.description=="string"?l.description:"",instruction:typeof l.instruction=="string"?l.instruction:"",url:en,headline:typeof l.headline=="string"?l.headline:"",areaDesc:r,zones:[],eventCode:_,provider:"dwd",phase:"",severityInferred:!1,certaintyInferred:!1})}return s}}const nn="https://www.meteoswiss.admin.ch/services-and-publications/applications/hazards.html#tab=severe-weather-map&weather-tab=all";function an(t){switch(t){case 5:return{severity:"extreme",label:"Extreme"};case 4:return{severity:"extreme",label:"Extreme"};case 3:return{severity:"severe",label:"Severe"};case 2:return{severity:"moderate",label:"Moderate"};case 1:return{severity:"minor",label:"Minor"};case 0:return{severity:"unknown",label:"Unknown"};default:return{severity:"unknown",label:"Unknown"}}}class ln{constructor(){this.provider="meteoswiss"}canHandle(e){return Array.isArray(e.warning_types)&&Array.isArray(e.warning_levels_numeric)&&Array.isArray(e.warning_valid_from)}parseAlerts(e){var i,r,s;const o=A=>Array.isArray(e[A])?e[A]:[],n=o("warning_types"),l=o("warning_levels"),d=o("warning_levels_numeric"),h=o("warning_valid_from"),g=o("warning_valid_to"),p=o("warning_texts"),f=o("warning_links"),_=A=>n.length>0&&f.length>0&&f.length%n.length===0?String(f[A*(f.length/n.length)]):f.length>0?String(f[0]):nn,x=[];for(let A=0;A<n.length;A++){const K=Number(d[A]);if(K===0)continue;const G=String((i=n[A])!=null?i:""),{severity:te,label:X}=an(K),E=String((r=l[A])!=null?r:"")||X,Q=h[A]!=null?S(String(h[A])):0,ae=g[A]!=null?S(String(g[A])):0;x.push({id:`meteoswiss_${G}_${Q}`,event:G,severity:te,severityLabel:E,certainty:"",urgency:"",sentTs:0,onsetTs:Q,endsTs:ae,description:String((s=p[A])!=null?s:""),instruction:"",url:_(A),headline:"",areaDesc:"",zones:[],eventCode:G,provider:"meteoswiss",phase:"",severityInferred:!1,certaintyInferred:!1,iconHint:G})}return x}}function Hr(t){if(!t||typeof t!="string")return;const e=parseInt(t.split(";")[0].trim(),10);if(e>=4)return"extreme";if(e===3)return"severe";if(e===2)return"moderate";if(e===1)return"minor"}function cn(t){if(!t||typeof t!="string")return"";const e=t.split(";");return e.length>=3?e[2].trim():""}function dn(t){if(!t||typeof t!="string")return"";const e=t.split(";");return e.length>1?e.slice(1).join(";").trim():""}class hn{constructor(){this.provider="meteoalarm"}canHandle(e){return typeof e.attribution=="string"&&e.attribution.toLowerCase().includes("meteoalarm")?!0:typeof e.awareness_level=="string"&&typeof e.awareness_type=="string"}parseAlerts(e){const i=O(e.event),r=O(e.headline);if(!i&&!r)return[];const s=O(e.awareness_level),o=Hr(s)||pe(O(e.severity)),n=cn(s)||O(e.severity)||o.charAt(0).toUpperCase()+o.slice(1),l=S(O(e.onset)||O(e.effective)),d=S(O(e.expires)),h=S(O(e.effective)),g=dn(O(e.awareness_type)),p=i||g||r,f=!Hr(s)&&!O(e.severity);return[{id:`meteoalarm_${p}_${l}`,event:p,severity:o,severityLabel:n,certainty:O(e.certainty),urgency:O(e.urgency),sentTs:h,onsetTs:l||h,endsTs:d,description:O(e.description),instruction:O(e.instruction),url:"",headline:r||p,areaDesc:O(e.senderName),zones:[],eventCode:"",provider:"meteoalarm",iconHint:g,phase:"",severityInferred:f,certaintyInferred:!1}]}}function O(t){return typeof t=="string"?t:""}class un{constructor(){this.provider="pirateweather"}canHandle(e){return typeof e.attribution=="string"&&e.attribution.toLowerCase().includes("pirate weather")}parseAlerts(e){const i=[],r=typeof e.title=="string"&&e.title!=="",s=typeof e.title_0=="string"&&e.title_0!=="";if(r&&!s){const o=this._parseOne(e,"");o&&i.push(o)}for(let o=0;;o++){const n=`_${o}`;if(typeof e[`title${n}`]!="string"||e[`title${n}`]==="")break;const l=this._parseOne(e,n);l&&i.push(l)}return i}_parseOne(e,i){const r=Ce(e[`title${i}`]);if(!r)return null;const s=Ce(e[`severity${i}`]),o=pe(s),n=s?s.charAt(0).toUpperCase()+s.slice(1).toLowerCase():o.charAt(0).toUpperCase()+o.slice(1),l=S(Ce(e[`time${i}`])),d=S(Ce(e[`expires${i}`])),h=e[`regions${i}`],g=Array.isArray(h)?h.join(", "):Ce(h),p=Ce(e[`uri${i}`]),f=Ce(e[`description${i}`]);return{id:`pirateweather_${r}_${l}`,event:r,severity:o,severityLabel:n,certainty:"",urgency:"",sentTs:l,onsetTs:l,endsTs:d,description:f,instruction:"",url:p,headline:r,areaDesc:g,zones:[],eventCode:"",provider:"pirateweather",phase:"",severityInferred:!s||pe(s)==="unknown",certaintyInferred:!1}}}function Ce(t){return typeof t=="string"?t:""}class pn{constructor(){this.provider="cap"}canHandle(e){return typeof e.incident_platform_version=="string"&&typeof e.id=="string"}parseAlerts(e){const i=D(e.id);if(!i)return[];const r=D(e.event),s=D(e.severity),o=D(e.severity_normalized),n=pe(o||s),l=s||o,d=l?l.charAt(0).toUpperCase()+l.slice(1).toLowerCase():n.charAt(0).toUpperCase()+n.slice(1),h=S(D(e.sent)||D(e.effective)),g=S(D(e.onset))||h,p=S(D(e.ends))||S(D(e.expires)),f=D(e.icon),_=f.startsWith("mdi:")?f:void 0,x=D(e.geometry_ref)||void 0,A=_n(e.bbox);return[{id:i,event:r||"Unknown",severity:n,severityLabel:d,certainty:D(e.certainty),urgency:D(e.urgency),sentTs:h,onsetTs:g,endsTs:p,description:D(e.description),instruction:D(e.instruction),url:jr(D(e.url))||jr(D(e.web)),headline:D(e.headline),areaDesc:D(e.area_desc),zones:fn(e),eventCode:D(e.event_code_nws)||D(e.event_code_same),provider:"cap",phase:mn(D(e.phase)),severityInferred:!s&&!o,certaintyInferred:!1,..._!==void 0&&{providerIcon:_},...x!==void 0&&{geometryRef:x},...A!==void 0&&{bbox:A}}]}}const gn={new:"New",update:"Update",cancel:"Cancel",expired:"Expired"};function mn(t){return gn[t.toLowerCase()]||""}function fn(t){const e=[],i=new Set,r=o=>{if(typeof o!="string")return;const n=o.toUpperCase();i.has(n)||(i.add(n),e.push(n))};for(const o of["affected_zones","geocode_ugc","geocode_same"]){const n=t[o];if(Array.isArray(n))for(const l of n)r(l)}const s=t.geocodes;if(s&&typeof s=="object"&&!Array.isArray(s)){for(const o of Object.values(s))if(Array.isArray(o))for(const n of o)r(n)}return e}function D(t){return typeof t=="string"?t:""}function _n(t){if(!(!Array.isArray(t)||t.length!==4)&&t.every(e=>typeof e=="number"&&Number.isFinite(e)))return[t[0],t[1],t[2],t[3]]}function jr(t){return t.startsWith("http://")||t.startsWith("https://")?t:""}const vn="https://weather.gc.ca/index_e.html",bn="https://meteo.gc.ca/index_f.html",wn="environment canada",Gr="environnement canada",yn={red:"extreme",orange:"severe",yellow:"moderate",grey:"minor",green:"unknown",rouge:"extreme",jaune:"moderate",gris:"minor",vert:"unknown"},xn={warning:"severe",watch:"moderate",advisory:"minor",statement:"minor",ending:"unknown"},An={high:"severe",medium:"moderate",moderate:"moderate",low:"minor",\u00E9lev\u00E9:"severe",\u00E9lev\u00E9e:"severe",mod\u00E9r\u00E9:"moderate",mod\u00E9r\u00E9e:"moderate",faible:"minor"},$n={high:"Likely",moderate:"Possible",medium:"Possible",low:"Unlikely",\u00E9lev\u00E9e:"Likely",\u00E9lev\u00E9:"Likely",mod\u00E9r\u00E9e:"Possible",mod\u00E9r\u00E9:"Possible",faible:"Unlikely"},En={new:"New",issued:"New",continued:"Continued",updated:"Updated",extended:"Updated",expired:"Final",ended:"Final",\u00E9mis:"New",maintenu:"Continued","mis \xE0 jour":"Updated",prolong\u00E9:"Updated",termin\u00E9:"Final",annul\u00E9:"Final"};function Cn(t){var e;return t&&(e=yn[t.toLowerCase()])!=null?e:"unknown"}function Sn(t){var e;return t&&(e=xn[t.toLowerCase()])!=null?e:"unknown"}function Dn(t){var e;return t&&(e=An[t.toLowerCase()])!=null?e:"unknown"}function Tn(...t){var e;let i="unknown",r=at[i];for(const s of t){const o=(e=at[s])!=null?e:at.unknown;o<r&&(i=s,r=o)}return i}function qr(t){return t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}function kn(t){var e;if(!t)return"";const i=t.toLowerCase();return(e=En[i])!=null?e:qr(t)}function Ln(t){var e;return t&&(e=$n[t.toLowerCase()])!=null?e:""}function Mn(t){return typeof t=="string"&&t.toLowerCase().includes(Gr)}function zn(t){return Mn(t)?bn:vn}class Rn{constructor(){this.provider="eccc"}canHandle(e){const i=e.attribution;if(typeof i!="string")return!1;const r=i.toLowerCase();return r.includes(wn)||r.includes(Gr)}parseAlerts(e){const i=e.alerts;if(!Array.isArray(i))return[];const r=zn(e.attribution);return i.filter(s=>typeof s=="object"&&s!==null).filter(s=>{const o=Se(s.status).toLowerCase();return o!=="cancelled"&&o!=="annul\xE9"}).map(s=>this._normalize(s,r))}_normalize(e,i){const r=S(e.issued),s=S(e.expiry),o=Tn(Cn(e.color),Sn(e.type),Dn(e.impact)),n=Se(e.title),l=Se(e.alert_code),d=Se(e.area),h=e.color?e.color.toLowerCase():void 0,g=Se(e.impact),p=g?qr(g):void 0,f=p!=null?p:o.charAt(0).toUpperCase()+o.slice(1),_=Ln(e.confidence);return{id:`eccc_${l||n||"unknown"}_${d}_${r}`,event:n,severity:o,severityLabel:f,certainty:_,urgency:"",sentTs:r,onsetTs:r,endsTs:s,description:Se(e.text),instruction:"",url:Se(e.url)||i,headline:n,areaDesc:d,zones:[],eventCode:l,provider:"eccc",phase:kn(e.status),severityInferred:!e.color&&!e.type&&!e.impact,certaintyInferred:!e.confidence,colorHint:h,severityBadgeLabel:p}}}function Se(t){return typeof t=="string"?t:""}const Fn="https://www.fire.nsw.gov.au/firesnearme/";function In(t){const e=t.toLowerCase();return e.includes("emergency warning")?{severity:"extreme",label:"Emergency Warning",inferred:!1}:e.includes("watch and act")?{severity:"severe",label:"Watch and Act",inferred:!1}:e.includes("advice")?{severity:"moderate",label:"Advice",inferred:!1}:e.includes("planned burn")?{severity:"minor",label:"Planned Burn",inferred:!1}:{severity:"unknown",label:Yr(t)||"Unknown",inferred:!0}}function Yr(t){return t.replace(/\w\S*/g,e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase())}function Pn(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Nn(t){if(t==null||t==="")return"";if(typeof t=="number")return`${t} ha`;const e=t.trim();return/^\d+(\.\d+)?$/.test(e)?`${e} ha`:e}function On(t){const e=[],i=(r,s)=>{s&&e.push(`${r}: ${s}`)};return i("Status",se(t.status)),i("Type",se(t.type)),i("Location",se(t.location)),i("Council area",se(t.council_area)),i("Size",Nn(t.size)),i("Responsible agency",se(t.responsible_agency)),e.join(`

`)}class Un{constructor(){this.provider="nsw_rfs",this.feedSources=["nsw_rural_fire_service_feed"]}canHandle(e){return typeof e.category=="string"&&typeof e.status=="string"&&typeof e.responsible_agency=="string"}parseAlerts(e){return this.canHandle(e)?[this._normalize(e)]:[]}_normalize(e){const i=S(e.publication_date),{severity:r,label:s,inferred:o}=In(se(e.category)),n=se(e.location),l=se(e.type),d=l?Yr(l):n||"Fire Incident";return{id:se(e.external_id)||`nsw_rfs_${Pn(n)}_${i}`,event:d,severity:r,severityLabel:s,certainty:"",urgency:"",sentTs:i,onsetTs:i,endsTs:0,description:On(e),instruction:"",url:Fn,headline:n||d,areaDesc:se(e.council_area)||n||"NSW",zones:[],eventCode:"",provider:"nsw_rfs",phase:"",severityInferred:o,certaintyInferred:!1,providerIcon:"mdi:fire"}}}function se(t){return typeof t=="string"?t:""}const We=[new pn,new Yo,new Jo,new Un,new on,new ln,new hn,new Rn,new un],pi=[/^sensor\..*alerts?$/i,/^sensor\..*warnings?$/i,/^binary_sensor\.meteoalarm/i,/^sensor\.dwd_weather_warnings/i,/^sensor\.weather_warnings_at_/i,/^sensor\..*cap_alert_/i];function Ct(t){return We.some(e=>e.canHandle(t))}function Zr(){var t;const e=[];for(const i of We)for(const r of(t=i.feedSources)!=null?t:[])e.push({source:r,provider:i.provider});return e}function gi(t,e){var i;if(t){const r=We.find(s=>s.provider===t);if(r)return r}for(const r of We)if(r.canHandle(e))return r;return(i=We.find(r=>r.provider==="nws"))!=null?i:We[0]}function mi(t,e,i){const r=i!=null?i:t.entities?Object.values(t.entities):null;if(!r)return[];const s=[];for(const o of r){if(!o||o.device_id!==e)continue;const n=o.entity_id;if(!n)continue;const l=t.states[n];!l||!Ct(l.attributes)||s.push(n)}return s}function Bn(t,e,i){const r=i!=null?i:t.entities?Object.values(t.entities):null;if(!r)return[];const s=[];for(const o of r)(o==null?void 0:o.device_id)===e&&o.entity_id&&s.push(o.entity_id);return s}function Wn(t,e,i){if(i)return i.some(s=>(s==null?void 0:s.device_id)===e);const r=t.entities;if(!r)return!1;for(const s of Object.values(r))if((s==null?void 0:s.device_id)===e)return!0;return!1}async function fi(t,e){const i=async()=>{const l=await t.sendMessagePromise({type:"config/entity_registry/list"});e(l!=null?l:[])};let r=null,s=!1;const o=()=>{if(r!==null){s=!0;return}i().catch(()=>{}),r=setTimeout(()=>{r=null,s&&(s=!1,o())},250)},n=await t.subscribeEvents(()=>o(),"entity_registry_updated");return await i(),()=>{r!==null&&(clearTimeout(r),r=null),s=!1,n()}}const Hn="weather-alerts-card:dismissals:v1:",_i="weather-alerts-card:dismissals-changed";function vi(){return Math.floor(Date.now()/1e3)}function Vr(t){return`${t.severity}|${t.sentTs}|${t.endsTs}|${t.phase||""}`}function jn(t,e){const i=[t,...e].filter(Boolean).sort().join(`
`);let r=2166136261;for(let s=0;s<i.length;s++)r^=i.charCodeAt(s),r=Math.imul(r,16777619);return(r>>>0).toString(16).padStart(8,"0")}function St(t){return Hn+t}function Kr(t){if(!t)return[];const e=[];if(t.entity&&e.push(t.entity),t.entities)for(const i of t.entities)i&&e.push(i);if(t.device&&e.push(`device:${t.device}`),t.sources)for(const i of t.sources)i&&e.push(`source:${i}`);return e}function Xr(t){const e=Kr(t);if(e.length===0)return"";const[i,...r]=e;return jn(i,r)}function bi(){try{return typeof localStorage!="undefined"?localStorage:null}catch{return null}}function wi(t){if(typeof window!="undefined")try{window.dispatchEvent(new CustomEvent(_i,{detail:{scope:t}}))}catch{}}function Qr(t,e){if(typeof window=="undefined")return()=>{};const i=o=>{const n=o.detail;!n||n.scope!==t||e()},r=St(t),s=o=>{o.key!==null&&o.key!==r||e()};return window.addEventListener(_i,i),window.addEventListener("storage",s),()=>{window.removeEventListener(_i,i),window.removeEventListener("storage",s)}}function yi(t,e=vi()){const i=new Map,r=bi();if(!r)return i;let s;try{s=r.getItem(St(t))}catch{return i}if(!s)return i;let o;try{o=JSON.parse(s)}catch{return i}if(!o||typeof o!="object")return i;const n=o;for(const[l,d]of Object.entries(n)){if(!d||typeof d!="object")continue;const h=d;typeof h.sig!="string"||typeof h.dismissedAt!="number"||typeof h.lastSeenAt!="number"||e-h.lastSeenAt>2592e3||i.set(l,{sig:h.sig,dismissedAt:h.dismissedAt,lastSeenAt:h.lastSeenAt})}return i}function xi(t,e){const i=bi();if(!i){wi(t);return}const r=St(t);try{if(e.size===0)i.removeItem(r);else{const s={};for(const[o,n]of e)s[o]=n;i.setItem(r,JSON.stringify(s))}}catch{}wi(t)}function Gn(t,e,i=vi()){const r=new Map(t);return r.set(e.id,{sig:Vr(e),dismissedAt:i,lastSeenAt:i}),r}function qn(t,e){if(!t.has(e))return t;const i=new Map(t);return i.delete(e),i}function Yn(t){const e=bi();if(e)try{e.removeItem(St(t))}catch{}wi(t)}function Zn(t,e,i=vi()){if(e.size===0)return{visible:t,updatedMap:e};let r=null;const s=[];for(const o of t){const n=e.get(o.id);if(!n){s.push(o);continue}const l=Vr(o);if(n.sig!==l){r||(r=new Map(e)),r.delete(o.id),s.push(o);continue}i-n.lastSeenAt>3600&&(r||(r=new Map(e)),r.set(o.id,{...n,lastSeenAt:i}))}return{visible:s,updatedMap:r!=null?r:e}}async function Vn(t,e){var i,r;try{const s=await t.sendMessagePromise({type:"cap_alerts/geometry",geometry_ref:e}),o=(r=(i=s==null?void 0:s.features)==null?void 0:i[0])==null?void 0:r.geometry;return!o||typeof o.type!="string"?null:o}catch{return null}}const De=1e-4;function Kn(t,e){const[i,r,s,o]=t,n=(r+o)/2,l=Math.cos(n*Math.PI/180)||De,d=Math.max((s-i)*l,De),h=Math.max(o-r,De),g=`0 0 ${ge(d)} ${ge(h)}`,p=(_,x)=>[(_-i)*l,o-x],f=Jr(e).map(_=>es(_,p)).filter(_=>_!==null);return{viewBox:g,polygonPaths:f}}function Jr(t){if(!t)return[];if(t.type==="Polygon"){const e=t.coordinates;return Array.isArray(e)&&e.length>0?[e[0]]:[]}if(t.type==="MultiPolygon"){const e=t.coordinates;return Array.isArray(e)?e.map(i=>Array.isArray(i)&&i.length>0?i[0]:null).filter(i=>Array.isArray(i)&&i.length>0):[]}return[]}function es(t,e){if(!Array.isArray(t)||t.length===0)return null;let i="";for(let r=0;r<t.length;r++){const s=t[r];if(!Array.isArray(s)||s.length<2)continue;const[o,n]=e(s[0],s[1]);i+=`${r===0?"M":"L"}${ge(o)},${ge(n)}`}return i?`${i}Z`:null}function ge(t){return Number(t.toFixed(5)).toString()}const ts="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",Xn="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",is="\xA9 OpenStreetMap, CARTO",me=256,rs=512,ss=1,Qn=16,Jn=16,os=85.05112878,ns=.15;function Ai(t){return Math.max(-os,Math.min(os,t))}function lt(t,e,i){const r=me*Math.pow(2,i),s=(t+180)/360*r,o=Ai(e)*Math.PI/180,n=(1-Math.log(Math.tan(o)+1/Math.cos(o))/Math.PI)/2*r;return[s,n]}function ea(t,e,i,r){for(let s=Qn;s>=ss;s--){const[o,n]=lt(t,r,s),[l,d]=lt(i,e,s);if(l-o<=rs&&d-n<=rs)return s}return ss}function ta(t,e,i,r){return t.split("{z}").join(String(e)).split("{x}").join(String(i)).split("{y}").join(String(r)).split("{s}").join("a")}function ia(t,e,i){const r=(i==null?void 0:i.tileUrl)||ts,s=(i==null?void 0:i.attribution)||is,[o,n,l,d]=t,h=Math.max((l-o)*ns,De),g=Math.max((d-n)*ns,De),p=o-h,f=l+h,_=Ai(n-g),x=Ai(d+g),A=ea(p,_,f,x),K=Math.pow(2,A),[G,te]=lt(p,x,A),[X,E]=lt(f,_,A),Q=Math.max(X-G,De),ae=Math.max(E-te,De),Dt=`0 0 ${ge(Q)} ${ge(ae)}`,Tt=`${ge(Q)} / ${ge(ae)}`,dt=[],ht=Math.floor(G/me),z=Math.floor((X-1e-6)/me),fe=Math.floor(te/me),_e=Math.floor((E-1e-6)/me);if((z-ht+1)*(_e-fe+1)<=Jn){for(let W=fe;W<=_e;W++)if(!(W<0||W>=K))for(let le=ht;le<=z;le++){const ke=(le%K+K)%K;dt.push({href:ta(r,A,ke,W),x:Number((le*me-G).toFixed(3)),y:Number((W*me-te).toFixed(3)),size:me})}}const Te=(W,le)=>{const[ke,Lt]=lt(W,le,A);return[ke-G,Lt-te]},kt=Jr(e).map(W=>es(W,Te)).filter(W=>W!==null);return{viewBox:Dt,aspect:Tt,tiles:dt,polygonPaths:kt,attribution:s}}const ra=Xi`
  @keyframes pulse-border {
    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--wac-fg) 70%, transparent); }
    70% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--wac-fg) 0%, transparent); }
    100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--wac-fg) 0%, transparent); }
  }

  @keyframes ongoing-pulse {
    0% { background: color-mix(in srgb, var(--wac-progress-fg) 80%, transparent); }
    50% { background: color-mix(in srgb, var(--wac-progress-fg) 50%, transparent); }
    100% { background: color-mix(in srgb, var(--wac-progress-fg) 80%, transparent); }
  }

  @keyframes stripe-march-sm {
    to { background-position: -12px 0; }
  }

  @keyframes stripe-march-lg {
    to { background-position: -24px 0; }
  }

  @keyframes fill-shimmer {
    0% { background-position: -75% 0; }
    60% { background-position: 175% 0; }
    100% { background-position: 175% 0; }
  }

  :host {
    display: block;
  }

  /* Positioning context for the degraded corner dot (see .degraded-dot). */
  ha-card {
    position: relative;
  }

  .error {
    padding: 16px;
    color: var(--error-color, red);
  }

  /* Availability channel: how the card signals that some (or all) configured
     sources are dark, independent of the alert list. Two anchored forms — a
     full-width strip above real alert content ('message'), or a corner dot
     floating over it ('compact', at zero layout cost). With no alerts to anchor
     to, neither renders; the empty state carries the caveat instead (see
     .no-alerts-caveat), so a bare all-clear never sits next to a stale source. */
  .degraded-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    /* Warning wash carries the tone; text stays on a legible token so it passes
       contrast on a white card (raw --warning-color as text does not). Derived
       from --warning-color via color-mix (the codebase's tint idiom) so a
       custom theme's warning color is always respected — the icon, dot, and this
       wash share one source. Unsupported engines just drop the tint. */
    background: color-mix(in srgb, var(--warning-color) 14%, transparent);
    color: var(--primary-text-color);
    font-size: 0.85em;
    border-bottom: 1px solid var(--divider-color);
  }

  .degraded-badge ha-icon {
    color: var(--warning-color);
    --mdc-icon-size: 18px;
    flex-shrink: 0;
  }

  /* Corner warning badge for 'compact' — an annotation on the alert(s) beneath
     it, so it is positioned against the ha-card box and ringed in the card
     background to stay legible over any underlying content, in either theme.
     An inverted alert glyph (white on the amber disc) conveys "unavailable"
     where a bare dot would not. */
  .degraded-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--warning-color);
    box-shadow: 0 0 0 2px var(--card-background-color, #fff);
    z-index: 2;
  }

  .degraded-dot ha-icon {
    /* Punch the glyph to the card background, matching how the pill badges sit
       their content on a colored chip rather than plain white. */
    color: var(--card-background-color, #fff);
    --mdc-icon-size: 12px;
  }

  /* --- COLOR MAPPING --- */
  .severity-extreme,
  .severity-severe { --color: var(--error-color); --color-rgb: 244, 67, 54; --color-on: #ffffff; }
  .severity-moderate { --color: var(--warning-color); --color-rgb: 255, 152, 0; --color-on: #1a1a1a; }
  .severity-minor { --color: var(--info-color); --color-rgb: 33, 150, 243; --color-on: #ffffff; }
  .severity-unknown { --color: var(--secondary-text-color); --color-rgb: 128, 128, 128; --color-on: var(--primary-text-color); }

  /* --- CARD CONTAINER --- */
  .alert-card {
    /* Two foreground tokens, both default to the raw theme color:
         --wac-fg          — icon + label text (boost-{light,dark}, ~2:1 tier)
         --wac-progress-fg — progress-bar fill (progress-boost-{light,dark},
                             ~1.3:1 tier — only kicks in for near-invisible
                             tints like yellow Tornado Watch)
       Boost rules below override these only when the event's color fails
       the corresponding threshold on the active side (precomputed per
       NWS/MeteoAlarm entry). HA's --primary-text-color flips with theme
       mode; --text-primary-color is the "text on accent" color — do not
       confuse them. */
    --wac-fg: var(--color);
    --wac-progress-fg: var(--color);
    position: relative;
    margin-bottom: 16px;
    padding: 0;
    border-radius: 12px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    box-shadow: var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.1));
    overflow: hidden;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.15s ease-out;
  }

  /* Contrast boost: only when theme mode matches the failing side.
     Scoped to event-color themes (nws, meteoalarm). Severity theme
     never receives these classes — its colors are HA theme tokens. */
  [data-theme-mode="light"] .alert-card.boost-light,
  [data-theme-mode="dark"] .alert-card.boost-dark {
    --wac-fg: color-mix(in oklch, var(--color) 65%, var(--primary-text-color));
  }
  [data-theme-mode="light"] .alert-card.progress-boost-light,
  [data-theme-mode="dark"] .alert-card.progress-boost-dark {
    --wac-progress-fg: color-mix(in oklch, var(--color) 65%, var(--primary-text-color));
  }

  /* Badge text follows the card background color (knockout effect) so
     saturated pills read as windows into the page rather than dark markings
     on color. Event-color themes emit both --color-on-light and
     --color-on-dark inline; this rule picks the right one per theme mode. */
  [data-theme-mode="light"] .alert-card { --color-on: var(--color-on-light, #ffffff); }
  [data-theme-mode="dark"]  .alert-card { --color-on: var(--color-on-dark,  #1a1a1a); }

  .alert-card:last-child {
    margin-bottom: 0;
  }

  .alert-card::before {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: var(--color);
  }

  .alert-card.severity-extreme,
  .alert-card.severity-severe {
    animation: pulse-border 2s infinite;
    border-color: var(--color);
  }

  /* --- HEADER --- */
  .alert-header-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 16px;
  }

  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--color-rgb), 0.1);
    color: var(--wac-fg);
    width: calc(44px * var(--wac-scale, 1));
    height: calc(44px * var(--wac-scale, 1));
    border-radius: 50%;
    flex-shrink: 0;
    box-sizing: border-box;
    border: 2px solid transparent;
    transition: border 0.2s, background 0.2s, color 0.2s;
  }

  /* Temporal state: active — icon "lights up" with solid ring */
  .active .icon-box {
    border-color: var(--color);
    background: rgba(var(--color-rgb), 0.12);
  }

  /* Temporal state: expired — dimmed */
  .expired .icon-box {
    border-color: var(--divider-color);
    opacity: 0.5;
  }
  .expired {
    opacity: 0.6;
  }

  /* Temporal state: preparation — dashed ring */
  .preparation .icon-box {
    border: 2px dashed var(--color);
  }
  .icon-box ha-icon { --mdc-icon-size: calc(26px * var(--wac-scale, 1)); }

  .info-box { flex-grow: 1; }

  .title-row { margin-bottom: 4px; }
  .alert-title {
    font-size: calc(1.15rem * var(--wac-scale, 1));
    font-weight: 600;
    line-height: 1.2;
    color: var(--primary-text-color);
  }

  .alert-headline {
    font-size: calc(0.8rem * var(--wac-scale, 1));
    line-height: 1.3;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }

  .area-desc {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    font-size: calc(0.8rem * var(--wac-scale, 1));
    line-height: 1.4;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
    max-width: 100%;
    opacity: 0.85;
  }
  .area-desc ha-icon {
    flex-shrink: 0;
    margin-top: 1px;
    --mdc-icon-size: calc(13px * var(--wac-scale, 1));
    width: calc(13px * var(--wac-scale, 1));
    height: calc(13px * var(--wac-scale, 1));
    opacity: 0.7;
  }
  .area-desc-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Compact expanded headline + area-desc get consistent inner padding */
  .compact .alert-expanded .alert-headline {
    padding: 4px 12px 0;
    margin-bottom: 2px;
  }
  .compact .alert-expanded .area-desc {
    padding: 4px 12px 0;
    margin-bottom: 4px;
  }

  .badges-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    line-height: 1;
    font-size: calc(0.75rem * var(--wac-scale, 1));
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .severity-badge {
    background: var(--color);
    color: var(--color-on);
    font-weight: 700;
  }
  .certainty-badge {
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
  }
  .phase-badge {
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
  }
  .event-code-badge {
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
    font-family: monospace;
    text-transform: none;
    letter-spacing: 1px;
  }
  .badge-inferred {
    font-style: italic;
  }
  .badge-inferred::before {
    content: '~';
    opacity: 0.6;
    margin-right: 1px;
  }

  .zones-badge {
    background: transparent;
    color: var(--secondary-text-color);
    border: none;
    padding: 2px 0;
    font-weight: 400;
  }
  .zones-badge::before { content: '('; opacity: 0.5; }
  .zones-badge::after { content: ')'; opacity: 0.5; }

  /* --- PROGRESS --- */
  .progress-section {
    padding: 0 16px 16px 16px;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    font-size: calc(0.85rem * var(--wac-scale, 1));
    color: var(--primary-text-color);
    margin-bottom: 6px;
  }

  .label-left, .label-center, .label-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .label-sub {
    font-size: calc(0.7rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    text-transform: uppercase;
  }
  .label-center {
    text-align: center;
    font-weight: bold;
    color: var(--wac-fg);
    white-space: nowrap;
  }
  .label-right { text-align: right; }

  .progress-track {
    height: 8px;
    background: var(--secondary-background-color);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    position: absolute;
    top: 0;
    transition: width 0.3s ease;
  }

  .active .progress-fill {
    background-color: var(--wac-progress-fg);
    background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: fill-shimmer 5s ease-in-out infinite;
  }

  .expired .progress-fill {
    background-color: var(--divider-color);
  }

  .preparation .progress-fill {
    background-color: transparent;
    background-image: linear-gradient(
      -45deg,
      var(--wac-progress-fg) 25%,
      transparent 25%,
      transparent 50%,
      var(--wac-progress-fg) 50%,
      var(--wac-progress-fg) 75%,
      transparent 75%
    );
    background-size: 24px 24px;
    opacity: 0.6;
    animation: stripe-march-lg 6s linear infinite;
  }

  /* --- DETAILS (custom toggle, not native <details>) --- */
  .alert-details-section {
    border-top: 1px solid var(--divider-color);
    background: rgba(var(--rgb-primary-text-color), 0.02);
  }

  .details-summary {
    padding: 10px 16px;
    font-size: calc(0.9rem * var(--wac-scale, 1));
    font-weight: 500;
    color: var(--secondary-text-color);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
    user-select: none;
  }
  .details-summary:hover {
    background: rgba(var(--color-rgb), 0.05);
    color: var(--primary-text-color);
  }

  .chevron {
    transition: transform 0.2s;
  }
  .chevron.expanded {
    transform: rotate(180deg);
  }

  .details-content {
    padding: 16px;
    font-size: calc(0.9rem * var(--wac-scale, 1));
  }

  /* Details Grid */
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--divider-color);
  }

  .meta-item { display: flex; flex-direction: column; }
  .meta-label {
    font-size: calc(0.7rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    text-transform: uppercase;
  }
  .meta-value {
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .meta-relative {
    font-size: calc(0.75rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    font-style: italic;
  }

  /* --- GEOMETRY MINI-MAP (cap_alerts, opt-in) --- */
  .alert-geometry {
    display: block;
    width: 100%;
    max-width: 260px;
    height: 120px;
    margin: 0 auto 16px;
    /* No basemap — the shape reads against the panel background. */
  }
  .alert-geometry .geometry-frame {
    fill: rgba(var(--color-rgb), 0.04);
    stroke: var(--divider-color);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }
  .alert-geometry .geometry-shape {
    fill: rgba(var(--color-rgb), 0.18);
    stroke: var(--wac-fg, var(--color));
    stroke-width: 1.5px;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  /* Map style: raster tiles behind the polygon. The wrapper carries an inline
     aspect-ratio (matching the tile viewBox) so tiles fill with no letterbox. */
  .alert-geometry-map {
    position: relative;
    display: block;
    width: 100%;
    max-width: 320px;
    max-height: 220px;
    margin: 0 auto 16px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
  }
  .alert-geometry.map {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    max-width: none;
  }
  .alert-geometry.map image {
    image-rendering: auto;
  }
  /* Over tiles the bbox frame is just a hairline; the polygon does the work. */
  .alert-geometry.map .geometry-frame {
    fill: none;
    stroke: rgba(var(--rgb-primary-text-color, 128, 128, 128), 0.25);
  }
  .alert-geometry.map .geometry-shape {
    fill: rgba(var(--color-rgb), 0.22);
    stroke-width: 2px;
  }
  /* White casing under the colored stroke keeps the outline legible over busy
     tiles (light or dark). */
  .alert-geometry.map .geometry-shape-casing {
    fill: none;
    stroke: rgba(255, 255, 255, 0.85);
    stroke-width: 4px;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  .geometry-attrib {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 9px;
    line-height: 1.2;
    padding: 1px 4px;
    color: #333;
    background: rgba(255, 255, 255, 0.7);
    border-top-left-radius: 4px;
    pointer-events: none;
  }

  .text-block { margin-bottom: 16px; }
  .text-label {
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--primary-text-color);
  }
  .text-body {
    white-space: pre-wrap;
    color: var(--secondary-text-color);
    line-height: 1.5;
    background: var(--primary-background-color);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
  }

  .provider-hint {
    font-size: calc(0.7rem * var(--wac-scale, 1));
    color: var(--secondary-text-color);
    letter-spacing: 0.5px;
    opacity: 0.5;
    margin-right: 6px;
    flex-shrink: 0;
  }
  .provider-hint::after {
    content: '·';
    margin-left: 6px;
    opacity: 0.6;
  }
  .footer-link { text-align: right; margin-top: 10px; }
  .footer-link a {
    color: var(--wac-fg);
    text-decoration: none;
    font-weight: 500;
    font-size: calc(0.85rem * var(--wac-scale, 1));
  }

  /* --- DISMISS BUTTON --- */
  .dismiss-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    width: calc(24px * var(--wac-scale, 1));
    height: calc(24px * var(--wac-scale, 1));
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    opacity: 0.6;
    transition: opacity 0.2s, background 0.2s;
    --mdc-icon-size: calc(18px * var(--wac-scale, 1));
  }
  .dismiss-button:hover,
  .dismiss-button:focus-visible {
    opacity: 1;
    background: rgba(var(--rgb-primary-text-color, 128, 128, 128), 0.08);
    outline: none;
  }
  /* Full layout: corner-tuck the dismiss button as window-decoration so it
     doesn't reserve space in the flex flow (which would squeeze title,
     headline, area, and badges). Labeled variant overrides position below
     to sit flush against the card's rounded corner. */
  .alert-header-row:not(.compact-row) > .dismiss-button {
    position: absolute;
    top: 6px;
    right: 6px;
    margin-left: 0;
  }
  .compact-row > .dismiss-button {
    margin-left: 4px;
  }

  /* Labeled dismiss button (full layout only) — window-decoration placement:
     absolute at top-right of the card, outside the header flex flow, so title,
     headline, area, and badges flow full row width. The button is visually
     subtle and overlays the rare long title that reaches its column. */
  .dismiss-button.labeled {
    border-left: 1px solid var(--divider-color);
    border-bottom: 1px solid var(--divider-color);
    border-radius: 12px;
    padding: 2px 8px 2px 4px;
    color: var(--secondary-text-color);
    opacity: 1;
    gap: 4px;
    font-size: calc(0.78rem * var(--wac-scale, 1));
    width: auto;
    height: auto;
    --mdc-icon-size: calc(16px * var(--wac-scale, 1));
  }
  .dismiss-button.labeled:hover,
  .dismiss-button.labeled:focus-visible {
    background: rgba(var(--rgb-primary-text-color, 128, 128, 128), 0.08);
    opacity: 1;
  }
  .alert-header-row:not(.compact-row) > .dismiss-button.labeled {
    position: absolute;
    top: 0px;
    right: 0px;
    margin-left: 0;
  }
  /* Compact row: revert labeled button to icon-only */
  .compact-row > .dismiss-button.labeled {
    border: none;
    border-radius: 50%;
    padding: 0;
    color: var(--secondary-text-color);
    gap: 0;
    font-size: inherit;
    width: calc(24px * var(--wac-scale, 1));
    height: calc(24px * var(--wac-scale, 1));
    --mdc-icon-size: calc(18px * var(--wac-scale, 1));
  }
  .compact-row > .dismiss-button.labeled span {
    display: none;
  }

  /* --- SWIPE GESTURE ---
     swipe-enabled: applied whenever pointer drag-to-dismiss is wired up. Sets
     touch-action so vertical scroll stays native while horizontal is reserved
     for the JS gesture; shows the grab cursor on hover. */
  .alert-card.swipe-enabled {
    touch-action: pan-y;
    cursor: grab;
  }
  .alert-card.swiping {
    transition: none !important;
    user-select: none;
    cursor: grabbing;
  }
  .alert-card.swipe-exit {
    transform: translateX(-110%) !important;
    opacity: 0 !important;
    transition: transform 0.2s ease-in, opacity 0.2s ease-in !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .alert-card.swipe-exit {
      transition: none !important;
    }
  }

  /* --- COMPACT LAYOUT --- */
  .compact .alert-card {
    margin-bottom: 4px;
    border-radius: 8px;
  }

  .compact .alert-card::before {
    display: block;
    top: auto;
    bottom: 0;
    left: var(--progress, 0%);
    right: 0;
    width: auto;
    height: 4px;
    border-radius: 0;
    z-index: 1;
  }

  .compact .alert-header-row.compact-row {
    padding: 8px 12px;
    gap: 10px;
    cursor: pointer;
    user-select: none;
  }
  .compact .alert-header-row.compact-row:hover {
    background: rgba(var(--color-rgb), 0.05);
  }

  .compact .icon-box {
    width: calc(32px * var(--wac-scale, 1));
    height: calc(32px * var(--wac-scale, 1));
  }
  .compact .icon-box ha-icon {
    --mdc-icon-size: calc(18px * var(--wac-scale, 1));
  }

  .compact .alert-title {
    font-size: calc(0.95rem * var(--wac-scale, 1));
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .compact-time {
    font-size: calc(0.8rem * var(--wac-scale, 1));
    color: var(--wac-fg);
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .compact-chevron {
    color: var(--secondary-text-color);
    transition: transform 0.2s;
    flex-shrink: 0;
    --mdc-icon-size: calc(20px * var(--wac-scale, 1));
  }
  .compact-chevron.expanded {
    transform: rotate(180deg);
  }

  .compact .alert-expanded {
    padding-top: 4px;
    border-top: 1px solid var(--divider-color);
  }

  /* Compact progress track (bottom border) */
  .compact .alert-card::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--secondary-background-color);
  }
  .compact .active.alert-card::before {
    background-color: var(--wac-progress-fg);
    background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: fill-shimmer 5s ease-in-out infinite;
  }
  .compact .expired.alert-card::before {
    background-color: var(--divider-color);
  }
  .compact .preparation.alert-card::before {
    background-image: linear-gradient(
      -45deg,
      color-mix(in srgb, var(--wac-progress-fg) 60%, transparent) 25%,
      transparent 25%,
      transparent 50%,
      color-mix(in srgb, var(--wac-progress-fg) 60%, transparent) 50%,
      color-mix(in srgb, var(--wac-progress-fg) 60%, transparent) 75%,
      transparent 75%
    );
    background-size: 12px 12px;
    background-color: transparent;
    animation: stripe-march-sm 3s linear infinite;
  }
  .compact .active.ongoing.alert-card::before {
    left: 0;
    background: color-mix(in srgb, var(--wac-progress-fg) 80%, transparent);
    animation: ongoing-pulse 5s infinite;
  }

  /* --- NO ANIMATIONS --- */
  .no-animations .alert-card {
    animation: none !important;
  }
  .no-animations .progress-fill,
  .no-animations .alert-card::before,
  .no-animations .alert-card::after {
    animation: none !important;
    transition: none !important;
  }
  .no-animations .active .progress-fill,
  .no-animations.compact .active.alert-card::before {
    background-position: -33% 0 !important;
  }

  /* --- PREVIEW LABEL --- */
  .preview-label {
    text-align: center;
    font-size: calc(0.75rem * var(--wac-scale, 1));
    font-style: italic;
    color: var(--secondary-text-color);
    padding: 8px 16px 0;
    opacity: 0.7;
  }

  /* --- EMPTY STATE --- */
  .no-alerts {
    padding: 20px;
    text-align: center;
    font-style: italic;
    /* Explicit muted token rather than opacity: keeps the all-clear legible in
       both themes (opacity of inherited text can wash out on dark) and, unlike
       opacity, does not dim the availability caveat nested below. */
    color: var(--secondary-text-color);
  }
  .no-alerts ha-icon {
    margin-bottom: 10px;
  }

  /* Availability caveat under the all-clear, shown when there are no alerts but
     a source is dark: "No active alerts" is qualified, never asserted alone. */
  .no-alerts-caveat {
    /* Block flow (not inline-flex) so the caveat always drops onto its own
       centered line under the all-clear, regardless of length — a short
       "2 sources unavailable" must not ride up beside "No active alerts." the
       way a long single-source name wraps away from it. */
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    font-style: normal;
    font-size: 0.9em;
    color: var(--primary-text-color);
  }
  .no-alerts-caveat ha-icon {
    color: var(--warning-color);
    --mdc-icon-size: 16px;
    margin-bottom: 0;
  }
`;let He=class extends Pe{constructor(){super(...arguments),this._showPreview=!1,this._subscribedDismissalsScope="",this._registryEntries=null,this._onRestoreAll=()=>{const t=this._currentScopeHash();t&&(Yn(t),this.requestUpdate())}}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._unsubscribeDismissals)==null||t.call(this),this._unsubscribeDismissals=void 0,this._subscribedDismissalsScope="",this._teardownRegistrySubscription()}updated(t){var e;super.updated(t);const i=this._currentScopeHash();i!==this._subscribedDismissalsScope&&((e=this._unsubscribeDismissals)==null||e.call(this),this._unsubscribeDismissals=void 0,this._subscribedDismissalsScope=i,i&&(this._unsubscribeDismissals=Qr(i,()=>this.requestUpdate()))),this.isConnected&&this._maybeSubscribeRegistry()}_maybeSubscribeRegistry(){var t,e,i;if(!((t=this._config)!=null&&t.device)){this._teardownRegistrySubscription();return}const r=(e=this.hass)==null?void 0:e.connection;!r||r===this._subscribedRegistryConn||((i=this._unsubscribeRegistry)==null||i.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=r,fi(r,s=>{this._registryEntries=s,this.requestUpdate()}).then(s=>{if(this._subscribedRegistryConn!==r){s();return}this._unsubscribeRegistry=s}).catch(()=>{this._subscribedRegistryConn===r&&(this._subscribedRegistryConn=void 0)}))}_teardownRegistrySubscription(){var t;(t=this._unsubscribeRegistry)==null||t.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=void 0}get _lang(){var t,e;return((e=(t=this.hass)==null?void 0:t.locale)==null?void 0:e.language)||"en"}setConfig(t){this._config=t,this._showPreview=!!t._preview}_fireConfigChanged(t){this._config=t;const e=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(e)}_getMatchingEntityIds(){var t,e;const i=this._getSelectedEntities().join(",");if(this._cachedHass===this.hass&&this._cachedConfigKey===i&&this._cachedEntityIds)return this._cachedEntityIds;this._cachedHass=this.hass,this._cachedConfigKey=i;const r=[];for(const[s,o]of Object.entries(this.hass.states))!s.startsWith("sensor.")&&!s.startsWith("binary_sensor.")&&!s.startsWith("geo_location.")||(pi.some(n=>n.test(s))||Ct(o.attributes))&&r.push(s);if((t=this._config)!=null&&t.entity&&!r.includes(this._config.entity)&&r.push(this._config.entity),(e=this._config)!=null&&e.entities)for(const s of this._config.entities)s&&!r.includes(s)&&r.push(s);return this._cachedEntityIds=r,r}_getSelectedEntities(){var t,e;const i=[];if((t=this._config)!=null&&t.entity&&i.push(this._config.entity),(e=this._config)!=null&&e.entities)for(const r of this._config.entities)r&&!i.includes(r)&&i.push(r);return i}_hasNoRealAlerts(){var t;if(!this.hass||!((t=this._config)!=null&&t.entity))return!1;const e=this._getSelectedEntities();let i=0;for(const r of e){const s=this.hass.states[r];if(s&&(s.state==="unknown"||s.state==="unavailable"||(i++,s.state!=="0"&&s.state!=="off")))return!1}return i>0}_isEntityMismatch(){var t,e;if(!((t=this._config)!=null&&t.entity))return!1;const i=(e=this.hass)==null?void 0:e.states[this._config.entity];return!i||pi.some(r=>r.test(this._config.entity))?!1:!Ct(i.attributes)}_renderEntityWarning(t){return this._isEntityMismatch()?b`<ha-alert alert-type="warning">${c("editor.entity_warning",t)}</ha-alert>`:v}_renderNoEntitiesHint(t){var e;return(e=this._config)!=null&&e.device&&this.hass?mi(this.hass,this._config.device,this._registryEntries).length>0?v:b`<ha-alert alert-type="info">${c("editor.no_device_alerts_hint",t)}</ha-alert>`:this._getMatchingEntityIds().some(i=>{var r;return(r=this.hass)==null?void 0:r.states[i]})?v:b`<ha-alert alert-type="info">${c("editor.no_entities_hint",t)} <a href="https://github.com/seevee/weather_alerts_card#supported-providers" target="_blank" rel="noopener">${c("editor.no_entities_hint_link",t)}</a></ha-alert>`}_renderSourceHint(t){var e,i;const r=(e=this._config)==null?void 0:e.sources;if(!r||r.length===0||!this.hass)return v;const s=new Set(r),o=new Set;let n=0;for(const d of Object.values(this.hass.states)){const h=(i=d.attributes)==null?void 0:i.source;typeof h=="string"&&s.has(h)&&(o.add(h),n++)}const l=r.filter(d=>!o.has(d));if(l.length>0){const d=Zr(),h=l.map(g=>{const p=d.find(f=>f.source===g);return p?c(`editor.provider_${p.provider}`,t):g});return b`<ha-alert alert-type="warning"
        >${c("editor.feeds_missing_warning",t,{feeds:h.join(", ")})}</ha-alert
      >`}return b`<ha-alert alert-type="info">${c("editor.source_hint",t,{count:n})}</ha-alert>`}_entityChanged(t){const e=t.detail.value,i=Array.isArray(e)?e:e?[e]:[],r={...this._config};if(r.entity=i[0]||"",i.length>1?r.entities=i.slice(1):delete r.entities,r.hideNoAlerts){const s=this._syncMultiEntityVisibility(r);s?r.visibility=s:delete r.visibility}this._fireConfigChanged(r)}_deviceChanged(t){const e=t.detail.value,i=typeof e=="string"?e:"";if(i===(this._config.device||""))return;const r={...this._config};i?r.device=i:delete r.device,this._fireConfigChanged(r)}_titleChanged(t){const e=t.target.value;if(e===(this._config.title||""))return;const i={...this._config};e?i.title=e:delete i.title,this._fireConfigChanged(i)}_providerChanged(t){const e=t.detail.value;if(e===(this._config.provider||"auto"))return;const i={...this._config};e==="auto"?delete i.provider:i.provider=e,this._fireConfigChanged(i)}_feedsChanged(t){const e=t.detail.value,i=Array.isArray(e)?e:e?[e]:[],r={...this._config};i.length>0?r.sources=i:delete r.sources,this._fireConfigChanged(r)}_enhanceContrastChanged(t){const e=t.detail.value;if(e===(this._config.enhanceContrast||"subtle"))return;const i={...this._config};e==="subtle"?delete i.enhanceContrast:i.enhanceContrast=e,this._fireConfigChanged(i)}_animationsChanged(t){const e=t.target.checked;if(e===(this._config.animations!==!1))return;const i={...this._config};e?delete i.animations:i.animations=!1,this._fireConfigChanged(i)}_deduplicateHeadlinesChanged(t){const e=t.target.checked,i=this._config.deduplicateHeadlines!==!1;if(e===i)return;const r={...this._config};e?delete r.deduplicateHeadlines:r.deduplicateHeadlines=!1,this._fireConfigChanged(r)}_deduplicateChanged(t){const e=t.target.checked;if(e===(this._config.deduplicate!==!1))return;const i={...this._config};e?delete i.deduplicate:i.deduplicate=!1,this._fireConfigChanged(i)}_showDetailsChanged(t){const e=t.target.checked;if(e===(this._config.showDetails!==!1))return;const i={...this._config};e?delete i.showDetails:i.showDetails=!1,this._fireConfigChanged(i)}_expandDetailsChanged(t){const e=t.target.checked;if(e===(this._config.expandDetails===!0))return;const i={...this._config};e?i.expandDetails=!0:delete i.expandDetails,this._fireConfigChanged(i)}_showMetadataChanged(t){const e=t.target.checked;if(e===(this._config.showMetadata!==!1))return;const i={...this._config};e?delete i.showMetadata:i.showMetadata=!1,this._fireConfigChanged(i)}_showDescriptionChanged(t){const e=t.target.checked;if(e===(this._config.showDescription!==!1))return;const i={...this._config};e?delete i.showDescription:i.showDescription=!1,this._fireConfigChanged(i)}_showInstructionsChanged(t){const e=t.target.checked;if(e===(this._config.showInstructions!==!1))return;const i={...this._config};e?delete i.showInstructions:i.showInstructions=!1,this._fireConfigChanged(i)}_showGeometryChanged(t){const e=t.target.checked;if(e===(this._config.showGeometry===!0))return;const i={...this._config};e?i.showGeometry=!0:delete i.showGeometry,this._fireConfigChanged(i)}_geometryStyleChanged(t){const e=t.detail.value;if(e===(this._config.geometryStyle||"shape"))return;const i={...this._config};e==="shape"?delete i.geometryStyle:i.geometryStyle=e,this._fireConfigChanged(i)}_showProviderChanged(t){const e=t.target.checked;if(e===(this._config.showProvider===!0))return;const i={...this._config};e?i.showProvider=!0:delete i.showProvider,this._fireConfigChanged(i)}_showSourceLinkChanged(t){const e=t.target.checked;if(e===(this._config.showSourceLink!==!1))return;const i={...this._config};e?delete i.showSourceLink:i.showSourceLink=!1,this._fireConfigChanged(i)}_hideExpiredChanged(t){const e=t.target.checked;if(e===(this._config.hideExpired!==!1))return;const i={...this._config};e?delete i.hideExpired:i.hideExpired=!1,this._fireConfigChanged(i)}_allowDismissChanged(t){const e=t.target.checked;if(e===(this._config.allowDismiss===!0))return;const i={...this._config};e?i.allowDismiss=!0:delete i.allowDismiss,this._fireConfigChanged(i)}_showDismissUndoChanged(t){const e=t.target.checked;if(e===(this._config.showDismissUndo!==!1))return;const i={...this._config};e?delete i.showDismissUndo:i.showDismissUndo=!1,this._fireConfigChanged(i)}_dismissTriggerChanged(t){const e=t.detail.value;if(e===(this._config.dismissTrigger||"button"))return;const i={...this._config};e==="button"?delete i.dismissTrigger:i.dismissTrigger=e,this._fireConfigChanged(i)}_dismissButtonStyleChanged(t){const e=t.detail.value;if(e===(this._config.dismissButtonStyle||"icon"))return;const i={...this._config};e==="icon"?delete i.dismissButtonStyle:i.dismissButtonStyle=e,this._fireConfigChanged(i)}_currentScopeHash(){return Xr(this._config)}_getDismissedCount(){const t=this._currentScopeHash();return t?yi(t).size:0}_hideNoAlertsChanged(t){const e=t.target.checked;if(e===(this._config.hideNoAlerts===!0))return;const i={...this._config};e?i.hideNoAlerts=!0:delete i.hideNoAlerts;const r=this._syncMultiEntityVisibility(i);r?i.visibility=r:delete i.visibility,this._fireConfigChanged(i)}_buildEntityCondition(t){return t.startsWith("binary_sensor.")?{condition:"state",entity:t,state:"on"}:{condition:"state",entity:t,state_not:"0"}}_isManagedCondition(t,e){if(t.condition==="state"&&typeof t.entity=="string"&&e.has(t.entity)&&("state_not"in t||"state"in t))return!0;if(t.condition==="or"&&Array.isArray(t.conditions)){const i=t.conditions;return i.length>0&&i.every(r=>r.condition==="state"&&typeof r.entity=="string"&&("state_not"in r&&r.state_not==="0"||"state"in r&&r.state==="on"))}return!1}_syncMultiEntityVisibility(t){const e=new Set;t.entity&&e.add(t.entity),t.entities&&t.entities.forEach(r=>e.add(r));const i=(t.visibility||[]).filter(r=>!this._isManagedCondition(r,e));if(t.hideNoAlerts&&e.size>0){const r=[...e].map(s=>this._buildEntityCondition(s));r.length===1?i.push(r[0]):i.push({condition:"or",conditions:r})}return i.length>0?i:void 0}_reformatTextChanged(t){const e=t.target.checked;if(e===(this._config.reformatText!==!1))return;const i={...this._config};e?delete i.reformatText:i.reformatText=!1,this._fireConfigChanged(i)}_layoutChanged(t){const e=t.target.checked;if(e===(this._config.layout==="compact"))return;const i={...this._config};e?i.layout="compact":delete i.layout,this._fireConfigChanged(i)}_zonesChanged(t){const e=t.target.value,i={...this._config};e.trim()?i.zones=e.split(",").map(r=>r.trim()).filter(Boolean):delete i.zones,this._fireConfigChanged(i)}_eventCodesChanged(t){const e=t.target.value,i={...this._config};e.trim()?i.eventCodes=e.split(",").map(r=>r.trim().toUpperCase()).filter(Boolean):delete i.eventCodes,this._fireConfigChanged(i)}_excludeEventCodesChanged(t){const e=t.target.value,i={...this._config};e.trim()?i.excludeEventCodes=e.split(",").map(r=>r.trim().toUpperCase()).filter(Boolean):delete i.excludeEventCodes,this._fireConfigChanged(i)}_sortOrderChanged(t){const e=t.detail.value;if(e===(this._config.sortOrder||"default"))return;const i={...this._config};e==="default"?delete i.sortOrder:i.sortOrder=e,this._fireConfigChanged(i)}_unavailableBehaviorChanged(t){const e=t.detail.value;if(e===(this._config.unavailableBehavior||"message"))return;const i={...this._config};e==="message"?delete i.unavailableBehavior:i.unavailableBehavior=e,this._fireConfigChanged(i)}_colorThemeChanged(t){const e=t.detail.value;if(e===(this._config.colorTheme||"severity"))return;const i={...this._config};e==="severity"?delete i.colorTheme:i.colorTheme=e,this._fireConfigChanged(i)}_fontSizeChanged(t){const e=t.detail.value;if(e===(this._config.fontSize||"default"))return;const i={...this._config};e==="default"?delete i.fontSize:i.fontSize=e,this._fireConfigChanged(i)}_timezoneChanged(t){const e=t.detail.value;if(e===(this._config.timezone||"server"))return;const i={...this._config};e==="server"?delete i.timezone:i.timezone=e,this._fireConfigChanged(i)}_minSeverityChanged(t){const e=t.detail.value;if(e===(this._config.minSeverity||"all"))return;const i={...this._config};e!=="all"?i.minSeverity=e:delete i.minSeverity,this._fireConfigChanged(i)}_previewChanged(t){const e=t.target;this._showPreview=e.checked;const i={...this._config};this._showPreview?i._preview=!0:delete i._preview,this._fireConfigChanged(i)}render(){var t,e,i,r,s;if(!this.hass||!this._config)return b``;const o=this._lang,n=this._config.zones?this._config.zones.join(", "):"",l=this._config.eventCodes?this._config.eventCodes.join(", "):"",d=this._config.excludeEventCodes?this._config.excludeEventCodes.join(", "):"",h=new Set;for(const f of Object.values(this.hass.states)){const _=(t=f.attributes)==null?void 0:t.source;typeof _=="string"&&h.add(_)}const g=new Set((e=this._config.sources)!=null?e:[]),p=Zr().filter(f=>h.has(f.source)||g.has(f.source)).map(f=>({value:f.source,label:c(`editor.provider_${f.provider}`,o)}));return b`
      <div class="editor">
        <!-- Entity & Provider -->
        <div class="section-label">${c("editor.section_entity",o)}</div>

        <ha-selector
          .hass=${this.hass}
          .selector=${{entity:{multiple:!0,include_entities:this._getMatchingEntityIds()}}}
          .value=${this._getSelectedEntities()}
          .label=${c("editor.entities",o)}
          .required=${!((i=this._config)!=null&&i.device)&&!((s=(r=this._config)==null?void 0:r.sources)!=null&&s.length)}
          @value-changed=${this._entityChanged}
        ></ha-selector>
        ${this._renderEntityWarning(o)}
        ${this._renderNoEntitiesHint(o)}

        <ha-selector
          .hass=${this.hass}
          .selector=${{device:{integration:"cap_alerts"}}}
          .value=${this._config.device||""}
          .label=${c("editor.device",o)}
          .helper=${c("editor.device_helper",o)}
          .helperPersistent=${!0}
          @value-changed=${this._deviceChanged}
        ></ha-selector>

        ${p.length>0?b`
              <ha-selector
                .hass=${this.hass}
                .selector=${{select:{multiple:!0,mode:"list",options:p}}}
                .value=${this._config.sources||[]}
                .label=${c("editor.feeds",o)}
                .helper=${c("editor.feeds_helper",o)}
                .helperPersistent=${!0}
                @value-changed=${this._feedsChanged}
              ></ha-selector>
              ${this._renderSourceHint(o)}
            `:v}

        <div class="preview-tools">
          <ha-formfield .label=${c("editor.show_preview",o)}>
            <ha-switch
              .checked=${this._showPreview}
              @change=${this._previewChanged}
            ></ha-switch>
          </ha-formfield>
          ${this._hasNoRealAlerts()&&!this._showPreview?b`<div class="preview-nudge">${c("editor.preview_nudge",o)}</div>`:b`<div class="preview-hint">${c("editor.preview_hint",o)}</div>`}
        </div>

        <ha-formfield .label=${c("editor.show_provider",o)}>
          <ha-switch
            .checked=${this._config.showProvider===!0}
            @change=${this._showProviderChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-textfield
          .label=${c("editor.title",o)}
          .value=${this._config.title||""}
          @change=${this._titleChanged}
        ></ha-textfield>

        <ha-select
          .label=${c("editor.provider",o)}
          .value=${this._config.provider||"auto"}
          @selected=${this._providerChanged}
        >
          <ha-dropdown-item value="auto">${c("editor.provider_auto",o)}</ha-dropdown-item>
          <ha-dropdown-item value="nws">${c("editor.provider_nws",o)}</ha-dropdown-item>
          <ha-dropdown-item value="bom">${c("editor.provider_bom",o)}</ha-dropdown-item>
          <ha-dropdown-item value="meteoalarm">${c("editor.provider_meteoalarm",o)}</ha-dropdown-item>
          <ha-dropdown-item value="dwd">${c("editor.provider_dwd",o)}</ha-dropdown-item>
          <ha-dropdown-item value="meteoswiss">${c("editor.provider_meteoswiss",o)}</ha-dropdown-item>
          <ha-dropdown-item value="eccc">${c("editor.provider_eccc",o)}</ha-dropdown-item>
          <ha-dropdown-item value="nsw_rfs">${c("editor.provider_nsw_rfs",o)}</ha-dropdown-item>
          <ha-dropdown-item value="pirateweather">${c("editor.provider_pirateweather",o)}</ha-dropdown-item>
          <ha-dropdown-item value="cap">${c("editor.provider_cap",o)}</ha-dropdown-item>
        </ha-select>

        <!-- Filtering -->
        <div class="section-label">${c("editor.section_filtering",o)}</div>

        <ha-textfield
          .label=${c("editor.zones",o)}
          .value=${n}
          .helper=${c("editor.zones_helper",o)}
          .helperPersistent=${!0}
          @change=${this._zonesChanged}
        ></ha-textfield>

        <ha-textfield
          .label=${c("editor.event_codes",o)}
          .value=${l}
          .helper=${c("editor.event_codes_helper",o)}
          .helperPersistent=${!0}
          @change=${this._eventCodesChanged}
        ></ha-textfield>

        <ha-textfield
          .label=${c("editor.exclude_event_codes",o)}
          .value=${d}
          .helper=${c("editor.exclude_event_codes_helper",o)}
          .helperPersistent=${!0}
          @change=${this._excludeEventCodesChanged}
        ></ha-textfield>

        <ha-select
          .label=${c("editor.min_severity",o)}
          .value=${this._config.minSeverity||"all"}
          @selected=${this._minSeverityChanged}
        >
          <ha-dropdown-item value="all">${c("editor.severity_all",o)}</ha-dropdown-item>
          <ha-dropdown-item value="minor">${c("editor.severity_minor",o)}</ha-dropdown-item>
          <ha-dropdown-item value="moderate">${c("editor.severity_moderate",o)}</ha-dropdown-item>
          <ha-dropdown-item value="severe">${c("editor.severity_severe",o)}</ha-dropdown-item>
          <ha-dropdown-item value="extreme">${c("editor.severity_extreme",o)}</ha-dropdown-item>
        </ha-select>

        <!-- Appearance -->
        <div class="section-label">${c("editor.section_appearance",o)}</div>

        <ha-formfield .label=${c("editor.compact",o)}>
          <ha-switch
            .checked=${this._config.layout==="compact"}
            @change=${this._layoutChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-select
          .label=${c("editor.color_theme",o)}
          .value=${this._config.colorTheme||"severity"}
          @selected=${this._colorThemeChanged}
        >
          <ha-dropdown-item value="severity">${c("editor.color_severity",o)}</ha-dropdown-item>
          <ha-dropdown-item value="nws">${c("editor.color_nws",o)}</ha-dropdown-item>
          <ha-dropdown-item value="meteoalarm">${c("editor.color_meteoalarm",o)}</ha-dropdown-item>
          <ha-dropdown-item value="eccc">${c("editor.color_eccc",o)}</ha-dropdown-item>
        </ha-select>

        <ha-select
          .label=${c("editor.enhance_contrast",o)}
          .value=${this._config.enhanceContrast||"subtle"}
          @selected=${this._enhanceContrastChanged}
        >
          <ha-dropdown-item value="off">${c("editor.enhance_contrast_off",o)}</ha-dropdown-item>
          <ha-dropdown-item value="subtle">${c("editor.enhance_contrast_subtle",o)}</ha-dropdown-item>
          <ha-dropdown-item value="strict">${c("editor.enhance_contrast_strict",o)}</ha-dropdown-item>
        </ha-select>

        <ha-select
          .label=${c("editor.font_size",o)}
          .value=${this._config.fontSize||"default"}
          @selected=${this._fontSizeChanged}
        >
          <ha-dropdown-item value="small">${c("editor.font_size_small",o)}</ha-dropdown-item>
          <ha-dropdown-item value="default">${c("editor.font_size_default",o)}</ha-dropdown-item>
          <ha-dropdown-item value="large">${c("editor.font_size_large",o)}</ha-dropdown-item>
          <ha-dropdown-item value="x-large">${c("editor.font_size_x_large",o)}</ha-dropdown-item>
        </ha-select>

        <ha-formfield .label=${c("editor.animations",o)}>
          <ha-switch
            .checked=${this._config.animations!==!1}
            @change=${this._animationsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.reformat_text",o)}>
          <ha-switch
            .checked=${this._config.reformatText!==!1}
            @change=${this._reformatTextChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Detail Panel -->
        <div class="section-label">${c("editor.section_detail_panel",o)}</div>

        <ha-formfield .label=${c("editor.show_details",o)}>
          <ha-switch
            .checked=${this._config.showDetails!==!1}
            @change=${this._showDetailsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.expand_details",o)}>
          <ha-switch
            .checked=${this._config.expandDetails===!0}
            .disabled=${this._config.showDetails===!1}
            @change=${this._expandDetailsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_metadata",o)}>
          <ha-switch
            .checked=${this._config.showMetadata!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showMetadataChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_description",o)}>
          <ha-switch
            .checked=${this._config.showDescription!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showDescriptionChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_instructions",o)}>
          <ha-switch
            .checked=${this._config.showInstructions!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showInstructionsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_geometry",o)}>
          <ha-switch
            .checked=${this._config.showGeometry===!0}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showGeometryChanged}
          ></ha-switch>
        </ha-formfield>

        ${this._config.showGeometry===!0?b`
          <ha-select
            .label=${c("editor.geometry_style",o)}
            .value=${this._config.geometryStyle||"shape"}
            .disabled=${this._config.showDetails===!1}
            @selected=${this._geometryStyleChanged}
          >
            <ha-dropdown-item value="shape">${c("editor.geometry_style_shape",o)}</ha-dropdown-item>
            <ha-dropdown-item value="map">${c("editor.geometry_style_map",o)}</ha-dropdown-item>
          </ha-select>
        `:v}

        <ha-formfield .label=${c("editor.show_source_link",o)}>
          <ha-switch
            .checked=${this._config.showSourceLink!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showSourceLinkChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Behavior -->
        <div class="section-label">${c("editor.section_behavior",o)}</div>

        <ha-select
          .label=${c("editor.sort_order",o)}
          .value=${this._config.sortOrder||"default"}
          @selected=${this._sortOrderChanged}
        >
          <ha-dropdown-item value="default">${c("editor.sort_default",o)}</ha-dropdown-item>
          <ha-dropdown-item value="onset">${c("editor.sort_onset",o)}</ha-dropdown-item>
          <ha-dropdown-item value="severity">${c("editor.sort_severity",o)}</ha-dropdown-item>
        </ha-select>

        <ha-select
          .label=${c("editor.timezone",o)}
          .value=${this._config.timezone||"server"}
          @selected=${this._timezoneChanged}
        >
          <ha-dropdown-item value="server">${c("editor.tz_server",o)}</ha-dropdown-item>
          <ha-dropdown-item value="browser">${c("editor.tz_browser",o)}</ha-dropdown-item>
        </ha-select>

        <ha-formfield .label=${c("editor.deduplicate",o)}>
          <ha-switch
            .checked=${this._config.deduplicate!==!1}
            @change=${this._deduplicateChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.deduplicate_headlines",o)}>
          <ha-switch
            .checked=${this._config.deduplicateHeadlines!==!1}
            @change=${this._deduplicateHeadlinesChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.hide_expired",o)}>
          <ha-switch
            .checked=${this._config.hideExpired!==!1}
            @change=${this._hideExpiredChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.hide_no_alerts",o)}>
          <ha-switch
            .checked=${this._config.hideNoAlerts===!0}
            @change=${this._hideNoAlertsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-select
          .label=${c("editor.unavailable_behavior",o)}
          .value=${this._config.unavailableBehavior||"message"}
          @selected=${this._unavailableBehaviorChanged}
        >
          <ha-dropdown-item value="message">${c("editor.unavailable_message",o)}</ha-dropdown-item>
          <ha-dropdown-item value="compact">${c("editor.unavailable_compact",o)}</ha-dropdown-item>
          <ha-dropdown-item value="hide">${c("editor.unavailable_hide",o)}</ha-dropdown-item>
        </ha-select>
        ${this._config.unavailableBehavior==="hide"?b`<ha-alert alert-type="warning">${c("editor.unavailable_hide_warning",o)}</ha-alert>`:""}

        <!-- Dismissal -->
        <div class="section-label">${c("editor.section_dismissal",o)}</div>

        <ha-formfield .label=${c("editor.allow_dismiss",o)}>
          <ha-switch
            .checked=${this._config.allowDismiss===!0}
            @change=${this._allowDismissChanged}
          ></ha-switch>
        </ha-formfield>

        ${this._config.allowDismiss===!0?b`
          <ha-select
            .label=${c("editor.dismiss_trigger",o)}
            .value=${this._config.dismissTrigger||"button"}
            @selected=${this._dismissTriggerChanged}
          >
            <ha-dropdown-item value="button">${c("editor.dismiss_trigger_button",o)}</ha-dropdown-item>
            <ha-dropdown-item value="swipe">${c("editor.dismiss_trigger_swipe",o)}</ha-dropdown-item>
            <ha-dropdown-item value="both">${c("editor.dismiss_trigger_both",o)}</ha-dropdown-item>
          </ha-select>

          ${this._config.dismissTrigger!=="swipe"?b`
            <ha-select
              .label=${c("editor.dismiss_button_style",o)}
              .value=${this._config.dismissButtonStyle||"icon"}
              @selected=${this._dismissButtonStyleChanged}
            >
              <ha-dropdown-item value="icon">${c("editor.dismiss_button_style_icon",o)}</ha-dropdown-item>
              <ha-dropdown-item value="labeled">${c("editor.dismiss_button_style_labeled",o)}</ha-dropdown-item>
            </ha-select>
          `:v}
        `:v}

        <ha-formfield .label=${c("editor.show_dismiss_undo",o)}>
          <ha-switch
            .checked=${this._config.showDismissUndo!==!1}
            .disabled=${this._config.allowDismiss!==!0}
            @change=${this._showDismissUndoChanged}
          ></ha-switch>
        </ha-formfield>

        ${this._renderDismissedStatus(o)}

      </div>
    `}_renderDismissedStatus(t){if(this._config.allowDismiss!==!0)return v;const e=this._getDismissedCount();return e===0?v:b`
      <div class="dismissed-status">
        ${c(e===1?"editor.dismissed_count_singular":"editor.dismissed_count",t,{count:e})}
        <a class="restore-link" @click=${this._onRestoreAll} tabindex="0" role="button">
          ${c("editor.restore_all",t)}
        </a>
      </div>
    `}};He.styles=Xi`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .section-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 4px;
      margin-top: 8px;
    }
    .preview-hint,
    .preview-nudge {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      padding-left: 48px;
      margin-top: 4px;
    }
    .preview-hint {
      opacity: 0.7;
    }
    .dismissed-status {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
      padding-left: 48px;
    }
    .restore-link {
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: underline;
      margin-left: 4px;
    }
    .restore-link:hover {
      text-decoration: none;
    }
  `,Y([ii({attribute:!1})],He.prototype,"hass",void 0),Y([ue()],He.prototype,"_config",void 0),Y([ue()],He.prototype,"_showPreview",void 0),He=Y([pr("weather-alerts-card-editor")],He);var ct;const sa="3.2.0";console.info(`%c  WEATHER-ALERTS-CARD  %c  Version ${sa}  `,"color: white; background: #555; font-weight: bold;","color: white; background: #007acc; font-weight: bold;");const oa={nws:"NWS",bom:"BoM",meteoalarm:"MeteoAlarm",dwd:"DWD",meteoswiss:"MeteoSwiss",eccc:"Environment Canada",pirateweather:"Pirate Weather",cap:"CAP",nsw_rfs:"NSW RFS"},na={nws:"NWS",bom:"BoM",meteoalarm:"MA",dwd:"DWD",meteoswiss:"MS",eccc:"EC",pirateweather:"PW",cap:"CAP",nsw_rfs:"RFS"};function aa(){const t=Date.now()/1e3,e=3600;return[{id:"preview-1",event:"Gentle Wind Watch",severity:"minor",severityLabel:"Minor",certainty:"Possible",urgency:"Future",sentTs:t-1*e,onsetTs:t+1*e,endsTs:t+6*e,description:"A gentle breeze may arrive later. This is sample data showing an upcoming alert.",instruction:"",url:"",headline:"Gentle Wind Watch for Sampletown County",areaDesc:"Sampletown County",zones:["SAMPLE02"],eventCode:"WIA",provider:"nws",phase:"",severityInferred:!0,certaintyInferred:!1},{id:"preview-2",event:"Sunshine Heat Advisory",severity:"moderate",severityLabel:"Moderate",certainty:"Likely",urgency:"Expected",sentTs:t-2*e,onsetTs:t-1*e,endsTs:t+2*e,description:"This is a sample alert demonstrating the card layout. No action required.",instruction:"Enjoy the weather! This is placeholder data for the card preview.",url:"",headline:"Sunshine Heat Advisory for Pleasantville",areaDesc:"Pleasantville, USA",zones:["SAMPLE01"],eventCode:"HTA",provider:"nws",phase:"Update",severityInferred:!1,certaintyInferred:!1},{id:"preview-3",event:"Frost Advisory",severity:"minor",severityLabel:"Minor",certainty:"Likely",urgency:"Expected",sentTs:t-8*e,onsetTs:t-6*e,endsTs:t-2*e,description:"A light frost occurred overnight. This is sample data showing an expired alert.",instruction:"",url:"",headline:"Frost Advisory expired for Pleasantville",areaDesc:"Pleasantville, USA",zones:["SAMPLE01"],eventCode:"FRA",provider:"nws",phase:"",severityInferred:!1,certaintyInferred:!0}]}let V=ct=class extends Pe{constructor(){super(...arguments),this._expandedAlerts=new Map,this._forcePreview=!1,this._dismissals=new Map,this._dismissalsScope="",this._swipeState=null,this._swipeStartX=0,this._swipeStartY=0,this._swipeCurrentDx=0,this._swipeRAF=null,this._swipePointerId=null,this._swipeExitTimeout=null,this._swipeJustDragged=!1,this._swipeExiting=null,this._registryEntries=null,this._geometryCache=new Map,this._geometryInFlight=new Set,this._motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)"),this._onMotionChange=()=>this.requestUpdate(),this._pendingDismissals=null,this._dismissalReconcileScheduled=!1}connectedCallback(){super.connectedCallback(),this._motionQuery.addEventListener("change",this._onMotionChange),this._config&&(this._dismissalsScope="",this._reloadDismissalsIfScopeChanged()),this._maybeSubscribeRegistry()}disconnectedCallback(){var t,e,i;super.disconnectedCallback(),this._motionQuery.removeEventListener("change",this._onMotionChange),(t=this._unsubscribeDismissals)==null||t.call(this),this._unsubscribeDismissals=void 0,this._teardownRegistrySubscription(),this._geometryInFlight.clear(),this._swipeRAF!==null&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null),this._swipeExitTimeout!==null&&(clearTimeout(this._swipeExitTimeout),this._swipeExitTimeout=null),this._swipeState=null,this._swipeExiting=null,((e=this._config)!=null&&e.entity||(i=this._config)!=null&&i.device)&&ct._editorExpandedState.set(this._entityStateKey(),this._expandedAlerts)}updated(t){super.updated(t),(t.has("hass")||t.has("_config"))&&this.isConnected&&(this._maybeSubscribeRegistry(),this._maybeFetchGeometry())}_maybeSubscribeRegistry(){var t,e,i;if(!((t=this._config)!=null&&t.device)){this._teardownRegistrySubscription();return}const r=(e=this.hass)==null?void 0:e.connection;!r||r===this._subscribedRegistryConn||((i=this._unsubscribeRegistry)==null||i.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=r,fi(r,s=>{this._registryEntries=s,this.requestUpdate()}).then(s=>{if(this._subscribedRegistryConn!==r){s();return}this._unsubscribeRegistry=s}).catch(()=>{this._subscribedRegistryConn===r&&(this._subscribedRegistryConn=void 0)}))}_teardownRegistrySubscription(){var t;(t=this._unsubscribeRegistry)==null||t.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=void 0}_maybeFetchGeometry(){var t,e;if(((t=this._config)==null?void 0:t.showGeometry)!==!0)return;const i=(e=this.hass)==null?void 0:e.connection;if(!i)return;i!==this._geometryConn&&(this._geometryCache=new Map,this._geometryInFlight.clear(),this._geometryConn=i);const r=new Set;for(const s of this._getAlerts(!1))s.geometryRef&&r.add(s.geometryRef);for(const s of[...this._geometryCache.keys()])r.has(s)||this._geometryCache.delete(s);for(const s of[...this._geometryInFlight])r.has(s)||this._geometryInFlight.delete(s);for(const s of r)this._geometryCache.has(s)||this._geometryInFlight.has(s)||(this._geometryInFlight.add(s),Vn(i,s).then(o=>{i===this._geometryConn&&(this._geometryInFlight.delete(s),this._geometryCache.set(s,o),this.requestUpdate())}).catch(()=>{i===this._geometryConn&&this._geometryInFlight.delete(s)}))}setConfig(t){var e,i;if(!(t.entity||(e=t.entities)!=null&&e.length)&&!t.device&&!((i=t.sources)!=null&&i.length))throw new Error("You need to define an entity, device, or feed");const{_preview:r,...s}=t;!s.entity&&s.entities&&s.entities.length>0&&(s.entity=s.entities[0]),this._config=s,this._forcePreview=!!r;const o=this._entityStateKey(),n=ct._editorExpandedState.get(o);n&&(this._expandedAlerts=n),this._reloadDismissalsIfScopeChanged()}get _scopeHash(){return Xr(this._config)}_configuredScopeTokens(){return Kr(this._config)}_reloadDismissalsIfScopeChanged(){const t=this._scopeHash;t!==this._dismissalsScope&&(this._dismissalsScope=t,this._dismissals=t?yi(t):new Map,this._resubscribeDismissals())}_resubscribeDismissals(){var t;(t=this._unsubscribeDismissals)==null||t.call(this),this._unsubscribeDismissals=void 0,!(!this.isConnected||!this._dismissalsScope)&&(this._unsubscribeDismissals=Qr(this._dismissalsScope,()=>{this._dismissals=yi(this._dismissalsScope)}))}getCardSize(){const t=this._getAlerts(!1),e=this._isCompact?1:3;return Math.max(1,t.length*e)}static getConfigElement(){return document.createElement("weather-alerts-card-editor")}static getStubConfig(t){if(t){const e=Object.keys(t.states).filter(i=>pi.some(r=>r.test(i))).find(i=>{const r=t.states[i];return r.state!=="0"&&r.state!=="off"&&r.state!=="unknown"&&r.state!=="unavailable"});if(e)return{entity:e}}return{entity:"sensor.nws_alerts_alerts"}}_getAllEntities(){if(!this._config)return[];const t=this._config.entity,e=this._config.entities||[],i=new Set,r=[];for(const s of[t,...e])s&&!i.has(s)&&(i.add(s),r.push(s));if(this._config.device&&this.hass)for(const s of mi(this.hass,this._config.device,this._registryEntries))i.has(s)||(i.add(s),r.push(s));if(this._config.sources&&this._config.sources.length>0&&this.hass)for(const s of this._resolveSourceEntities(this._config.sources))i.has(s)||(i.add(s),r.push(s));return r}_resolveSourceEntities(t){var e;if(!this.hass)return[];const i=new Set(t),r=[];for(const[s,o]of Object.entries(this.hass.states)){const n=(e=o.attributes)==null?void 0:e.source;typeof n=="string"&&i.has(n)&&Ct(o.attributes)&&r.push(s)}return r.sort()}_entityStateKey(){return[...this._configuredScopeTokens()].sort().join(",")}_deviceHasAnyEntity(t){return this.hass?Wn(this.hass,t,this._registryEntries):!1}_getAlerts(t=!0){if(!this.hass||!this._config)return[];const e=[],i=[],r=new Set;for(const o of this._getAllEntities()){const n=this.hass.states[o];if(!n)continue;const l=gi(this._config.provider,n.attributes);r.has(l.provider)||(r.add(l.provider),i.push(l.provider)),e.push(...l.parseAlerts(n.attributes))}let s=this._filterAndSort(e,{providerPriority:i});if(this._config.allowDismiss&&!this._forcePreview&&this._dismissals.size>0){const{visible:o,updatedMap:n}=Zn(s,this._dismissals);t&&n!==this._dismissals&&this._scheduleDismissalReconcile(n),s=o}return s}_scheduleDismissalReconcile(t){this._pendingDismissals=t,!this._dismissalReconcileScheduled&&(this._dismissalReconcileScheduled=!0,queueMicrotask(()=>{this._dismissalReconcileScheduled=!1;const e=this._pendingDismissals;this._pendingDismissals=null,!(!e||!this._dismissalsScope)&&(this._dismissals=e,xi(this._dismissalsScope,e))}))}_onDismiss(t){var e;if(!this._dismissalsScope)return;const i=Gn(this._dismissals,t);this._dismissals=i,xi(this._dismissalsScope,i),((e=this._config)==null?void 0:e.showDismissUndo)!==!1&&this._fireUndoToast(t)}_onUndo(t){if(!this._dismissalsScope)return;const e=qn(this._dismissals,t);e!==this._dismissals&&(this._dismissals=e,xi(this._dismissalsScope,e))}_fireUndoToast(t){const e=this._lang;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:c("card.dismissed_toast",e,{event:t.event}),duration:4e3,action:{text:c("card.dismissed_toast_undo",e),action:()=>this._onUndo(t.id)}},bubbles:!0,composed:!0}))}_canDismiss(){var t;return!!((t=this._config)!=null&&t.allowDismiss)&&!this._forcePreview}_swipeEnabled(){var t,e;return this._canDismiss()&&(((t=this._config)==null?void 0:t.dismissTrigger)==="swipe"||((e=this._config)==null?void 0:e.dismissTrigger)==="both")}_onSwipePointerDown(t,e){if(!this._swipeEnabled()||this._swipeState||e.button!==0)return;this._swipePointerId=e.pointerId,this._swipeStartX=e.clientX,this._swipeStartY=e.clientY,this._swipeCurrentDx=0;const i=e.currentTarget.getBoundingClientRect();this._swipeState={id:t.id,offset:0,locked:!1,cardWidth:i.width}}_onSwipePointerMove(t,e){if(!this._swipeState||this._swipeState.id!==t.id||e.pointerId!==this._swipePointerId)return;const i=e.clientX-this._swipeStartX,r=e.clientY-this._swipeStartY;if(!this._swipeState.locked){if(Math.abs(r)-Math.abs(i)>12){this._swipeState=null;return}if(i>=0){this._swipeState=null;return}e.currentTarget.setPointerCapture(e.pointerId),this._swipeState={...this._swipeState,locked:!0}}this._swipeCurrentDx=Math.min(0,i),this._swipeRAF===null&&(this._swipeRAF=requestAnimationFrame(()=>{this._swipeRAF=null,!(!this._swipeState||this._swipeState.id!==t.id)&&(this._swipeState={...this._swipeState,offset:this._swipeCurrentDx},this.requestUpdate())}))}_onSwipePointerUp(t,e){if(!this._swipeState||this._swipeState.id!==t.id||e.pointerId!==this._swipePointerId)return;const i=e.currentTarget;i.hasPointerCapture(e.pointerId)&&i.releasePointerCapture(e.pointerId),this._swipeRAF!==null&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null);const{offset:r,cardWidth:s,locked:o}=this._swipeState;if(this._swipeState=null,this._swipePointerId=null,o&&(this._swipeJustDragged=!0,setTimeout(()=>{this._swipeJustDragged=!1},0)),o&&r<=-(s*.4)){this._swipeExiting=t.id;const n=this._motionQuery.matches?0:200;this._swipeExitTimeout=window.setTimeout(()=>{this._swipeExitTimeout=null,this._swipeExiting=null,this._onDismiss(t)},n)}else this.requestUpdate()}_onSwipePointerCancel(t,e){if(!this._swipeState||this._swipeState.id!==t.id||e.pointerId!==this._swipePointerId)return;const i=e.currentTarget;i.hasPointerCapture(e.pointerId)&&i.releasePointerCapture(e.pointerId),this._swipeRAF!==null&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null),this._swipeState=null,this._swipePointerId=null,this.requestUpdate()}_swipeCardStyle(t,e){var i;if(this._swipeExiting===t.id)return e;if(((i=this._swipeState)==null?void 0:i.id)===t.id){const{offset:r,cardWidth:s}=this._swipeState,o=Math.max(0,1+r/s).toFixed(2);return`${e} transform: translateX(${r}px); opacity: ${o};`}return e}_swipeCardClass(t){var e;const i=[];return this._swipeEnabled()&&i.push("swipe-enabled"),this._swipeExiting===t.id?i.push("swipe-exit"):((e=this._swipeState)==null?void 0:e.id)===t.id&&this._swipeState.locked&&i.push("swiping"),i.join(" ")}_isLabeledDismissActive(){var t,e;return this._canDismiss()&&((t=this._config)==null?void 0:t.dismissTrigger)!=="swipe"&&((e=this._config)==null?void 0:e.dismissButtonStyle)==="labeled"&&!this._isCompact}_renderDismissButton(t){var e;return this._canDismiss()?((e=this._config)==null?void 0:e.dismissTrigger)==="swipe"?v:this._isLabeledDismissActive()?b`
        <button
          type="button"
          class="dismiss-button labeled"
          aria-label=${c("card.dismiss",this._lang)}
          title=${c("card.dismiss",this._lang)}
          @click=${i=>{i.stopPropagation(),this._onDismiss(t)}}
        >
          <ha-icon icon="mdi:close"></ha-icon>
          <span>${c("card.dismiss",this._lang)}</span>
        </button>
      `:b`
      <button
        type="button"
        class="dismiss-button"
        aria-label=${c("card.dismiss",this._lang)}
        title=${c("card.dismiss",this._lang)}
        @click=${i=>{i.stopPropagation(),this._onDismiss(t)}}
      >
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    `:v}_filterAndSort(t,e){var i;if(!this._config)return t;let r=t;if(this._config.deduplicate!==!1&&(r=jo(r,e==null?void 0:e.providerPriority)),!(e!=null&&e.skipZones)&&this._config.zones&&this._config.zones.length>0){const s=new Set(this._config.zones.map(o=>o.toUpperCase()));r=r.filter(o=>Ho(o,s))}if(this._config.eventCodes&&this._config.eventCodes.length>0){const s=new Set(this._config.eventCodes.map(o=>o.toUpperCase()));r=r.filter(o=>o.eventCode&&s.has(o.eventCode.toUpperCase()))}if(this._config.excludeEventCodes&&this._config.excludeEventCodes.length>0){const s=new Set(this._config.excludeEventCodes.map(o=>o.toUpperCase()));r=r.filter(o=>!o.eventCode||!s.has(o.eventCode.toUpperCase()))}if(this._config.minSeverity){const s={extreme:0,severe:1,moderate:2,minor:3,unknown:4},o=(i=s[this._config.minSeverity])!=null?i:4;r=r.filter(n=>{var l;return n.severity==="unknown"||((l=s[n.severity])!=null?l:4)<=o})}if(this._config.hideExpired!==!1){const s=Date.now()/1e3;r=r.filter(o=>o.endsTs===0||o.endsTs>s)}return Wo(r,this._config.sortOrder||"default")}get _locale(){var t,e;if(!this.hass)return{language:navigator.language||"en",time_format:"language",date_format:"language",timeZone:void 0};const i=((t=this._config)==null?void 0:t.timezone)==="browser"?Intl.DateTimeFormat().resolvedOptions().timeZone:(e=this.hass.config)==null?void 0:e.time_zone;return{...this.hass.locale,timeZone:i}}get _lang(){var t,e;return((e=(t=this.hass)==null?void 0:t.locale)==null?void 0:e.language)||"en"}get _animationsEnabled(){var t,e;return((t=this._config)==null?void 0:t.animations)===!0?!0:((e=this._config)==null?void 0:e.animations)===!1?!1:!this._motionQuery.matches}get _isCompact(){var t;return((t=this._config)==null?void 0:t.layout)==="compact"}get _colorTheme(){var t;return((t=this._config)==null?void 0:t.colorTheme)||"severity"}get _fontScale(){var t;switch((t=this._config)==null?void 0:t.fontSize){case"small":return .85;case"large":return 1.2;case"x-large":return 1.4;default:return}}get _scaleStyle(){const t=this._fontScale;return t!==void 0?`--wac-scale: ${t}`:""}_scaledPx(t){const e=this._fontScale;return e!==void 0?Math.round(t*e):t}get _contrastMode(){var t;return ko((t=this._config)==null?void 0:t.enhanceContrast)}_alertColorStyle(t){if(this._colorTheme==="nws"){const{color:e,rgb:i,textColorLight:r,textColorDark:s}=Rr(t.event,this._contrastMode);return`--color: ${e}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${s};`}if(this._colorTheme==="meteoalarm"){const{color:e,rgb:i,textColorLight:r,textColorDark:s}=Fr(t.severity,this._contrastMode);return`--color: ${e}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${s};`}if(this._colorTheme==="eccc"){const{color:e,rgb:i,textColorLight:r,textColorDark:s}=Ir(t,this._contrastMode);return`--color: ${e}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${s};`}return""}_alertBoostClasses(t){const e=this._contrastMode;if(e==="off")return"";let i=null;if(this._colorTheme==="nws"?i=Rr(t.event,e):this._colorTheme==="meteoalarm"?i=Fr(t.severity,e):this._colorTheme==="eccc"&&(i=Ir(t,e)),!i)return"";const r=[];return i.boostLight&&r.push("boost-light"),i.boostDark&&r.push("boost-dark"),i.progressBoostLight&&r.push("progress-boost-light"),i.progressBoostDark&&r.push("progress-boost-dark"),r.join(" ")}get _themeMode(){var t,e;const i=(e=(t=this.hass)==null?void 0:t.themes)==null?void 0:e.darkMode;return typeof i=="boolean"?i?"dark":"light":window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}_normalizeText(t){return(t||"").replace(/\n{2,}/g,`

`).trim()}_toggleDetails(t){var e,i;if(this._swipeJustDragged){this._swipeJustDragged=!1;return}const r=new Map(this._expandedAlerts);r.set(t,!r.get(t)),this._expandedAlerts=r,((e=this._config)!=null&&e.entity||(i=this._config)!=null&&i.device)&&ct._editorExpandedState.set(this._entityStateKey(),r)}_sourceLinkLabel(t){const e=oa[t.provider]||"Alert";return c("card.open_source",this._lang,{provider:e})}_isBroken(t){var e;return(t.state==="unavailable"||t.state==="unknown")&&gi((e=this._config)==null?void 0:e.provider,t.attributes).parseAlerts(t.attributes).length===0}_friendlyName(t){var e,i,r;return((r=(i=(e=this.hass)==null?void 0:e.states[t])==null?void 0:i.attributes)==null?void 0:r.friendly_name)||t}_deviceName(t){var e,i;const r=(i=(e=this.hass)==null?void 0:e.devices)==null?void 0:i[t];return(r==null?void 0:r.name_by_user)||(r==null?void 0:r.name)||null}_brokenSources(){var t,e,i;if(!this.hass)return[];const r=[],s=new Set;for(const o of[(t=this._config)==null?void 0:t.entity,...((e=this._config)==null?void 0:e.entities)||[]]){if(!o||s.has(o))continue;s.add(o);const n=this.hass.states[o];n&&this._isBroken(n)&&r.push({name:this._friendlyName(o)})}if((i=this._config)!=null&&i.device){let o=!1,n=!1;for(const l of Bn(this.hass,this._config.device,this._registryEntries)){const d=this.hass.states[l];d&&(gi(this._config.provider,d.attributes).parseAlerts(d.attributes).length>0?o=!0:(d.state==="unavailable"||d.state==="unknown")&&(n=!0))}!o&&n&&r.push({name:this._deviceName(this._config.device)})}return r}_degradedLabel(t){return t.length===1?t[0].name?c("card.sources_unavailable_named",this._lang,{name:t[0].name}):c("card.sources_unavailable_one",this._lang):c("card.sources_unavailable_count",this._lang,{count:t.length})}_renderDegradedStrip(t){const e=this._degradedLabel(t);return b`
      <div class="degraded-badge">
        <ha-icon icon="mdi:alert-outline"></ha-icon>
        <span>${e}</span>
      </div>
    `}_renderDegradedDot(t){const e=this._degradedLabel(t);return b`
      <span class="degraded-dot" role="img" title=${e} aria-label=${e}>
        <ha-icon icon="mdi:alert-outline"></ha-icon>
      </span>
    `}render(){if(!this._config)return b``;if(!this.hass)return this._renderPreview();const t=this._getAllEntities().map(p=>this.hass.states[p]).filter(Boolean),e=!!this._config.device&&this._deviceHasAnyEntity(this._config.device);if(t.length===0&&!e||this._forcePreview)return this._renderPreview();const i=this._brokenSources(),r=this._config.unavailableBehavior||"message",s=i.length>0&&r!=="hide",o=this._getAlerts(),n=o.length>0;if(!n&&this._config.hideNoAlerts&&!s)return this.style.display="none",b``;this.style.display="";const l=this._animationsEnabled?"":"no-animations",d=this._isCompact?"compact":"",h=s&&n&&r==="message",g=s&&n&&r==="compact";return b`
      <ha-card .header=${this._config.title||""} class="${l} ${d}" data-theme-mode=${this._themeMode} style=${this._scaleStyle}>
        ${g?this._renderDegradedDot(i):v}
        ${h?this._renderDegradedStrip(i):v}
        ${n?o.map(p=>this._renderAlert(p)):this._renderNoAlerts(s?i:[])}
      </ha-card>
    `}_renderPreview(){const t=this._filterAndSort(aa(),{skipZones:!0}),e=this._animationsEnabled?"":"no-animations",i=this._isCompact?"compact":"";return b`
      <ha-card .header=${this._config.title||""} class="${e} ${i}" data-theme-mode=${this._themeMode} style=${this._scaleStyle}>
        <div class="preview-label">${c("card.preview",this._lang)}</div>
        ${t.map(r=>this._renderAlert(r))}
      </ha-card>
    `}_renderNoAlerts(t=[]){return b`
      <div class="no-alerts">
        <ha-icon icon="mdi:weather-sunny"></ha-icon><br>
        ${c("card.no_alerts",this._lang)}
        ${t.length>0?b`<div class="no-alerts-caveat">
            <ha-icon icon="mdi:alert-outline"></ha-icon>${this._degradedLabel(t)}
          </div>`:v}
      </div>
    `}_renderAlert(t){const e=`severity-${t.severity}`,i=No(t),r=i.phaseText.toLowerCase(),s=this._expandedAlerts.get(t.id)||!1;return this._isCompact?this._renderCompactAlert(t,e,r,i,s):this._renderFullAlert(t,e,r,i,s)}_renderCompactAlert(t,e,i,r,s){var o;const n=this._lang,l=r.isActive&&!r.hasEndTime,d=r.isExpired?c("progress.compact_expired",n,{time:Be(r.endsTs,r.nowTs)}):l?c("progress.compact_ongoing",n):r.isActive?c("progress.compact_active",n,{time:Be(r.endsTs,r.nowTs)}):c("progress.compact_prep",n,{time:Be(r.onsetTs,r.nowTs)}),h=l?"ongoing":"",g=this._alertBoostClasses(t),p=l?"":`--progress: ${r.progressPct}%;`,f=this._swipeCardClass(t),_=this._swipeCardStyle(t,`${this._alertColorStyle(t)} ${p}`);return b`
      <div
        class="alert-card ${e} ${i} ${h} ${g} ${f}"
        style=${_}
        @pointerdown=${x=>this._onSwipePointerDown(t,x)}
        @pointermove=${x=>this._onSwipePointerMove(t,x)}
        @pointerup=${x=>this._onSwipePointerUp(t,x)}
        @pointercancel=${x=>this._onSwipePointerCancel(t,x)}
      >
        <div
          class="alert-header-row compact-row"
          @click=${()=>this._toggleDetails(t.id)}
        >
          <div class="icon-box">
            <ha-icon icon=${(o=t.providerIcon)!=null?o:Lr(t.iconHint||t.event)}></ha-icon>
          </div>
          ${this._renderProviderHint(t)}
          <span class="alert-title">${t.event}</span>
          <span class="compact-time">${d}</span>
          <ha-icon
            icon="mdi:chevron-down"
            class="compact-chevron ${s?"expanded":""}"
          ></ha-icon>
          ${this._renderDismissButton(t)}
        </div>
        ${s?this._renderExpandedContent(t,r):v}
      </div>
    `}_renderExpandedContent(t,e){var i,r;return b`
      <div class="alert-expanded">
        ${this._renderHeadline(t)}
        ${t.areaDesc?b`
          <div class="area-desc" title=${t.areaDesc}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span class="area-desc-text">${t.areaDesc}</span>
          </div>
        `:v}
        <div class="badges-row" style="padding: 0 12px 8px;">
          ${this._renderBadgesRow(t,e)}
        </div>

        ${this._renderProgressSection(t,e)}

        ${((i=this._config)==null?void 0:i.showDetails)!==!1?(r=this._config)!=null&&r.expandDetails?b`
        ${this._renderDetailsContent(t,e)}
        `:b`
        <div class="alert-details-section">
          <div
            class="details-summary"
            @click=${()=>this._toggleDetails(t.id+"_details")}
          >
            <span>${c("card.read_details",this._lang)}</span>
            <ha-icon
              icon="mdi:chevron-down"
              class="chevron ${this._expandedAlerts.get(t.id+"_details")?"expanded":""}"
            ></ha-icon>
          </div>
          ${this._expandedAlerts.get(t.id+"_details")?this._renderDetailsContent(t,e):v}
        </div>
        `:v}
      </div>
    `}_renderFullAlert(t,e,i,r,s){var o,n,l;const d=this._alertBoostClasses(t),h=this._swipeCardClass(t),g=this._swipeCardStyle(t,this._alertColorStyle(t));return b`
      <div
        class="alert-card ${e} ${i} ${d} ${h}"
        style=${g}
        @pointerdown=${p=>this._onSwipePointerDown(t,p)}
        @pointermove=${p=>this._onSwipePointerMove(t,p)}
        @pointerup=${p=>this._onSwipePointerUp(t,p)}
        @pointercancel=${p=>this._onSwipePointerCancel(t,p)}
      >
        <div class="alert-header-row">
          <div class="icon-box">
            <ha-icon icon=${(o=t.providerIcon)!=null?o:Lr(t.iconHint||t.event)}></ha-icon>
          </div>
          <div class="info-box">
            <div class="title-row">
              ${this._renderProviderHint(t)}
              <span class="alert-title">${t.event}</span>
            </div>
            ${this._renderHeadline(t)}
            ${t.areaDesc?b`
              <div class="area-desc" title=${t.areaDesc}>
                <ha-icon icon="mdi:map-marker"></ha-icon>
                <span class="area-desc-text">${t.areaDesc}</span>
              </div>
            `:v}
            <div class="badges-row">
              ${this._renderBadgesRow(t,r)}
            </div>
          </div>
          ${this._renderDismissButton(t)}
        </div>

        ${this._renderProgressSection(t,r)}

        ${((n=this._config)==null?void 0:n.showDetails)!==!1?(l=this._config)!=null&&l.expandDetails?b`
        ${this._renderDetailsContent(t,r)}
        `:b`
        <div class="alert-details-section">
          <div
            class="details-summary"
            @click=${()=>this._toggleDetails(t.id)}
          >
            <span>${c("card.read_details",this._lang)}</span>
            <ha-icon
              icon="mdi:chevron-down"
              class="chevron ${s?"expanded":""}"
            ></ha-icon>
          </div>
          ${s?this._renderDetailsContent(t,r):v}
        </div>
        `:v}
      </div>
    `}_renderProviderHint(t){var e;if(((e=this._config)==null?void 0:e.showProvider)!==!0)return v;const i=na[t.provider]||t.provider.toUpperCase();return b`<span class="provider-hint">${i}</span>`}_renderHeadline(t){var e;const i=((e=this._config)==null?void 0:e.deduplicateHeadlines)!==!1,r=Bo(t,i);return r?b`
      <div class="alert-headline" title=${t.headline}>
        ${r}
      </div>
    `:v}_renderBadgesRow(t,e){var i;const r=(i=t.severityBadgeLabel)!=null?i:c("badge.severity_"+t.severity,this._lang),s=t.certainty?c("badge.certainty_"+t.certainty.toLowerCase(),this._lang):"";return b`
      <span class="badge severity-badge${t.severityInferred?" badge-inferred":""}">${r}</span>
      ${t.certainty?b`
        <span class="badge certainty-badge${t.certaintyInferred?" badge-inferred":""}">
          <ha-icon
            icon=${So(t.certainty)}
            style="--mdc-icon-size: ${this._scaledPx(14)}px; width: ${this._scaledPx(14)}px; height: ${this._scaledPx(14)}px;"
          ></ha-icon>
          ${s}
        </span>
      `:v}
      ${t.phase?b`
        <span class="badge phase-badge">${t.phase}</span>
      `:v}
      ${t.eventCode&&t.eventCode.trim().toLowerCase()!==t.event.trim().toLowerCase()?b`
        <span class="badge event-code-badge">${t.eventCode}</span>
      `:v}
      ${t.mergedCount&&t.mergedCount>1?b`<span class="badge zones-badge">${c("card.zones_count",this._lang,{count:t.mergedCount})}</span>`:v}
    `}_renderTextBlock(t,e){return e?b`
      <div class="text-block">
        <div class="text-label">${t}</div>
        <div class="text-body">${Gs($o(e))}</div>
      </div>
    `:v}_renderDetailsContent(t,e){var i,r,s,o,n,l;const d=((i=this._config)==null?void 0:i.reformatText)!==!1;let h=this._normalizeText(t.description),g=this._normalizeText(t.instruction);d&&(h=Wr(h),g=Wr(g));const p=this._lang;return b`
      <div class="details-content">
        ${((r=this._config)==null?void 0:r.showMetadata)!==!1?b`
        <div class="meta-grid">
          ${e.sentTs>100?b`
          <div class="meta-item">
            <span class="meta-label">${c("detail.issued",p)}</span>
            <span class="meta-value">${ui(e.sentTs,this._locale,p)}</span>
          </div>
          `:v}
          <div class="meta-item">
            <span class="meta-label">${c("detail.onset",p)}</span>
            <span class="meta-value">${ui(e.onsetTs,this._locale,p)}</span>
            <span class="meta-relative">${Br(e.onsetTs,e.nowTs,p)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">${e.isExpired?c("progress.expired_label",p):c("detail.expires",p)}</span>
            ${e.hasEndTime?b`<span class="meta-value">${ui(e.endsTs,this._locale,p)}</span>
            <span class="meta-relative">${Br(e.endsTs,e.nowTs,p)}</span>`:b`<span class="meta-value">${e.isActive?c("progress.ongoing",p):c("progress.tbd",p)}</span>`}
          </div>
          ${t.areaDesc?b`
            <div class="meta-item" style="grid-column: 1 / -1;">
              <span class="meta-label">${c("detail.area",p)}</span>
              <span class="meta-value">${t.areaDesc}</span>
            </div>
          `:v}
        </div>
        `:v}

        ${((s=this._config)==null?void 0:s.showGeometry)===!0?this._renderGeometry(t):v}

        ${((o=this._config)==null?void 0:o.showDescription)!==!1?this._renderTextBlock(c("detail.description",p),h):v}
        ${((n=this._config)==null?void 0:n.showInstructions)!==!1?this._renderTextBlock(c("detail.instructions",p),g):v}

        ${t.url&&((l=this._config)==null?void 0:l.showSourceLink)!==!1?b`
          <div class="footer-link">
            <a href=${t.url} target="_blank" rel="noopener noreferrer">
              ${this._sourceLinkLabel(t)}
              <ha-icon icon="mdi:open-in-new" style="width:${this._scaledPx(14)}px;"></ha-icon>
            </a>
          </div>
        `:v}
      </div>
    `}_renderGeometry(t){var e,i;if(((e=this._config)==null?void 0:e.showGeometry)!==!0||!t.bbox)return v;const r=t.geometryRef?this._geometryCache.get(t.geometryRef):void 0;if(((i=this._config)==null?void 0:i.geometryStyle)==="map")return this._renderGeometryMap(t,r!=null?r:void 0);const{viewBox:s,polygonPaths:o}=Kn(t.bbox,r!=null?r:void 0);return b`
      <svg
        class="alert-geometry"
        viewBox=${s}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label=${t.areaDesc||c("detail.area",this._lang)}
      >
        <rect class="geometry-frame" x="0" y="0" width="100%" height="100%"></rect>
        ${o.map(n=>wt`<path class="geometry-shape" d=${n}></path>`)}
      </svg>
    `}_renderGeometryMap(t,e){var i,r,s;const o=(i=this._config)==null?void 0:i.geometryTileUrl,n=o||(this._themeMode==="dark"?Xn:ts),l=(s=(r=this._config)==null?void 0:r.geometryTileAttribution)!=null?s:o?"\xA9 OpenStreetMap":is,{viewBox:d,aspect:h,tiles:g,polygonPaths:p}=ia(t.bbox,e,{tileUrl:n,attribution:l}),f=t.areaDesc||c("detail.area",this._lang);return b`
      <div class="alert-geometry-map" style="aspect-ratio: ${h};">
        <svg
          class="alert-geometry map"
          viewBox=${d}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label=${f}
        >
          ${g.map(_=>wt`<image
            href=${_.href}
            x=${_.x}
            y=${_.y}
            width=${_.size}
            height=${_.size}
          ></image>`)}
          <rect class="geometry-frame" x="0" y="0" width="100%" height="100%"></rect>
          ${p.map(_=>wt`<path class="geometry-shape-casing" d=${_}></path>`)}
          ${p.map(_=>wt`<path class="geometry-shape" d=${_}></path>`)}
        </svg>
        <span class="geometry-attrib">${l}</span>
      </div>
    `}_renderProgressSection(t,e){const{isActive:i,progressPct:r,hasEndTime:s,onsetTs:o,endsTs:n,nowTs:l}=e,d=this._lang,h=!this._animationsEnabled,g=e.isExpired?"left: 0; right: 0;":i&&!s?h?"width: 100%; left: 0; opacity: 0.8;":"width: 100%; left: 0; animation: ongoing-pulse 5s infinite; opacity: 0.8;":`left: ${r}%; right: 0;`;return b`
      <div class="progress-section">
        <div class="progress-labels">
          <div class="label-left">
            <span class="label-sub">${c(i?"progress.start":"progress.now",d)}</span>
            <span>${Ur(i?o:l,this._locale,d)}</span>
          </div>
          <div class="label-center">
            ${s?e.isExpired?b`<span class="label-sub">${c("progress.expired_label",d)}</span><span>${Be(n,l)}</span>`:i?b`<span class="label-sub">${c("progress.expires_in_label",d)}</span><span>${Be(n,l)}</span>`:b`<span class="label-sub">${c("progress.starts_in_label",d)}</span><span>${Be(o,l)}</span>`:b`<span class="label-sub">${c("progress.ongoing",d)}</span>`}
          </div>
          <div class="label-right">
            <span class="label-sub">${c("progress.end",d)}</span>
            <span>${s?Ur(n,this._locale,d):c("progress.tbd",d)}</span>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style=${g}></div>
        </div>
      </div>
    `}};V.styles=ra,V._editorExpandedState=new Map,Y([ii({attribute:!1})],V.prototype,"hass",void 0),Y([ue()],V.prototype,"_config",void 0),Y([ue()],V.prototype,"_expandedAlerts",void 0),Y([ue()],V.prototype,"_forcePreview",void 0),Y([ue()],V.prototype,"_dismissals",void 0),Y([ue()],V.prototype,"_swipeExiting",void 0),Y([ue()],V.prototype,"_geometryCache",void 0),V=ct=Y([pr("weather-alerts-card")],V);const $i=window;$i.customCards=$i.customCards||[],$i.customCards.push({type:"weather-alerts-card",name:"Weather Alerts Card",preview:!0,description:"A card for displaying weather alerts with severity indicators, progress bars, and expandable details. Supports NWS (US), BoM (Australia), and MeteoAlarm (Europe)."});export{V as WeatherAlertsCard,mi as resolveDeviceAlertEntities,fi as subscribeEntityRegistry};
