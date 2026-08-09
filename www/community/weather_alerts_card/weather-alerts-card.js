var mo,fo,vo,bo,yo,wo;function K(t,e,i,r){var o=arguments.length,s=o<3?e:r===null?r=Object.getOwnPropertyDescriptor(e,i):r,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(t,e,i,r);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(s=(o<3?n(s):o>3?n(e,i,s):n(e,i))||s);return o>3&&s&&Object.defineProperty(e,i,s),s}typeof SuppressedError=="function"&&SuppressedError;/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xt=globalThis,Xt=xt.ShadowRoot&&(xt.ShadyCSS===void 0||xt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Qt=Symbol(),tr=new WeakMap;let ir=class{constructor(e,i,r){if(this._$cssResult$=!0,r!==Qt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=i}get styleSheet(){let e=this.o;const i=this.t;if(Xt&&e===void 0){const r=i!==void 0&&i.length===1;r&&(e=tr.get(i)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&tr.set(i,e))}return e}toString(){return this.cssText}};const To=t=>new ir(typeof t=="string"?t:t+"",void 0,Qt),rr=(t,...e)=>{const i=t.length===1?t[0]:e.reduce((r,o,s)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[s+1],t[0]);return new ir(i,t,Qt)},Mo=(t,e)=>{if(Xt)t.adoptedStyleSheets=e.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(const i of e){const r=document.createElement("style"),o=xt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=i.cssText,t.appendChild(r)}},or=Xt?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(const r of e.cssRules)i+=r.cssText;return To(i)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Lo,defineProperty:Bo,getOwnPropertyDescriptor:Io,getOwnPropertyNames:zo,getOwnPropertySymbols:Po,getPrototypeOf:Ro}=Object,_e=globalThis,sr=_e.trustedTypes,No=sr?sr.emptyScript:"",Jt=_e.reactiveElementPolyfillSupport,Qe=(t,e)=>t,Et={toAttribute(t,e){switch(e){case Boolean:t=t?No:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},ei=(t,e)=>!Lo(t,e),nr={attribute:!0,type:String,converter:Et,reflect:!1,useDefault:!1,hasChanged:ei};(mo=Symbol.metadata)!=null||(Symbol.metadata=Symbol("metadata")),(fo=_e.litPropertyMetadata)!=null||(_e.litPropertyMetadata=new WeakMap);let Oe=class extends HTMLElement{static addInitializer(e){var i;this._$Ei(),((i=this.l)!=null?i:this.l=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,i=nr){if(i.state&&(i.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(e,i),!i.noAccessor){const r=Symbol(),o=this.getPropertyDescriptor(e,r,i);o!==void 0&&Bo(this.prototype,e,o)}}static getPropertyDescriptor(e,i,r){var n;const{get:o,set:s}=(n=Io(this.prototype,e))!=null?n:{get(){return this[i]},set(l){this[i]=l}};return{get:o,set(l){const d=o==null?void 0:o.call(this);s==null||s.call(this,l),this.requestUpdate(e,d,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){var i;return(i=this.elementProperties.get(e))!=null?i:nr}static _$Ei(){if(this.hasOwnProperty(Qe("elementProperties")))return;const e=Ro(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Qe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Qe("properties"))){const i=this.properties,r=[...zo(i),...Po(i)];for(const o of r)this.createProperty(o,i[o])}const e=this[Symbol.metadata];if(e!==null){const i=litPropertyMetadata.get(e);if(i!==void 0)for(const[r,o]of i)this.elementProperties.set(r,o)}this._$Eh=new Map;for(const[i,r]of this.elementProperties){const o=this._$Eu(i,r);o!==void 0&&this._$Eh.set(o,i)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const i=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const o of r)i.unshift(or(o))}else e!==void 0&&i.push(or(e));return i}static _$Eu(e,i){const r=i.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(i=>i(this))}addController(e){var i,r;((i=this._$EO)!=null?i:this._$EO=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&((r=e.hostConnected)==null||r.call(e))}removeController(e){var i;(i=this._$EO)==null||i.delete(e)}_$E_(){const e=new Map,i=this.constructor.elementProperties;for(const r of i.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){var i;const e=(i=this.shadowRoot)!=null?i:this.attachShadow(this.constructor.shadowRootOptions);return Mo(e,this.constructor.elementStyles),e}connectedCallback(){var e,i;(e=this.renderRoot)!=null||(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(i=this._$EO)==null||i.forEach(r=>{var o;return(o=r.hostConnected)==null?void 0:o.call(r)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(i=>{var r;return(r=i.hostDisconnected)==null?void 0:r.call(i)})}attributeChangedCallback(e,i,r){this._$AK(e,r)}_$ET(e,i){var s;const r=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,r);if(o!==void 0&&r.reflect===!0){const n=(((s=r.converter)==null?void 0:s.toAttribute)!==void 0?r.converter:Et).toAttribute(i,r.type);this._$Em=e,n==null?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(e,i){var s,n,l;const r=this.constructor,o=r._$Eh.get(e);if(o!==void 0&&this._$Em!==o){const d=r.getPropertyOptions(o),h=typeof d.converter=="function"?{fromAttribute:d.converter}:((s=d.converter)==null?void 0:s.fromAttribute)!==void 0?d.converter:Et;this._$Em=o;const _=h.fromAttribute(i,d.type);this[o]=(l=_!=null?_:(n=this._$Ej)==null?void 0:n.get(o))!=null?l:_,this._$Em=null}}requestUpdate(e,i,r,o=!1,s){var n,l;if(e!==void 0){const d=this.constructor;if(o===!1&&(s=this[e]),r!=null||(r=d.getPropertyOptions(e)),!(((n=r.hasChanged)!=null?n:ei)(s,i)||r.useDefault&&r.reflect&&s===((l=this._$Ej)==null?void 0:l.get(e))&&!this.hasAttribute(d._$Eu(e,r))))return;this.C(e,i,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,i,{useDefault:r,reflect:o,wrapped:s},n){var l,d,h;r&&!((l=this._$Ej)!=null?l:this._$Ej=new Map).has(e)&&(this._$Ej.set(e,(d=n!=null?n:i)!=null?d:this[e]),s!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(i=void 0),this._$AL.set(e,i)),o===!0&&this._$Em!==e&&((h=this._$Eq)!=null?h:this._$Eq=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(i){Promise.reject(i)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var r,o;if(!this.isUpdatePending)return;if(!this.hasUpdated){if((r=this.renderRoot)!=null||(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,l]of this._$Ep)this[n]=l;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[n,l]of s){const{wrapped:d}=l,h=this[n];d!==!0||this._$AL.has(n)||h===void 0||this.C(n,void 0,l,h)}}let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),(o=this._$EO)==null||o.forEach(s=>{var n;return(n=s.hostUpdate)==null?void 0:n.call(s)}),this.update(i)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(i)}willUpdate(e){}_$AE(e){var i;(i=this._$EO)==null||i.forEach(r=>{var o;return(o=r.hostUpdated)==null?void 0:o.call(r)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(i=>this._$ET(i,this[i]))),this._$EM()}updated(e){}firstUpdated(e){}};Oe.elementStyles=[],Oe.shadowRootOptions={mode:"open"},Oe[Qe("elementProperties")]=new Map,Oe[Qe("finalized")]=new Map,Jt==null||Jt({ReactiveElement:Oe}),((vo=_e.reactiveElementVersions)!=null?vo:_e.reactiveElementVersions=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Je=globalThis,ar=t=>t,At=Je.trustedTypes,lr=At?At.createPolicy("lit-html",{createHTML:t=>t}):void 0,dr="$lit$",me=`lit$${Math.random().toFixed(9).slice(2)}$`,cr="?"+me,Oo=`<${cr}>`,Ce=document,et=()=>Ce.createComment(""),tt=t=>t===null||typeof t!="object"&&typeof t!="function",ti=Array.isArray,Uo=t=>ti(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",ii=`[ 	
\f\r]`,it=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ur=/-->/g,hr=/>/g,$e=RegExp(`>|${ii}(?:([^\\s"'>=/]+)(${ii}*=${ii}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),pr=/'/g,gr=/"/g,_r=/^(?:script|style|textarea|title)$/i,mr=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),v=mr(1),Ct=mr(2),Se=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),fr=new WeakMap,De=Ce.createTreeWalker(Ce,129);function vr(t,e){if(!ti(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return lr!==void 0?lr.createHTML(e):e}const Wo=(t,e)=>{const i=t.length-1,r=[];let o,s=e===2?"<svg>":e===3?"<math>":"",n=it;for(let l=0;l<i;l++){const d=t[l];let h,_,g=-1,b=0;for(;b<d.length&&(n.lastIndex=b,_=n.exec(d),_!==null);)b=n.lastIndex,n===it?_[1]==="!--"?n=ur:_[1]!==void 0?n=hr:_[2]!==void 0?(_r.test(_[2])&&(o=RegExp("</"+_[2],"g")),n=$e):_[3]!==void 0&&(n=$e):n===$e?_[0]===">"?(n=o!=null?o:it,g=-1):_[1]===void 0?g=-2:(g=n.lastIndex-_[2].length,h=_[1],n=_[3]===void 0?$e:_[3]==='"'?gr:pr):n===gr||n===pr?n=$e:n===ur||n===hr?n=it:(n=$e,o=void 0);const w=n===$e&&t[l+1].startsWith("/>")?" ":"";s+=n===it?d+Oo:g>=0?(r.push(h),d.slice(0,g)+dr+d.slice(g)+me+w):d+me+(g===-2?l:w)}return[vr(t,s+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};let ri=class xo{constructor({strings:e,_$litType$:i},r){let o;this.parts=[];let s=0,n=0;const l=e.length-1,d=this.parts,[h,_]=Wo(e,i);if(this.el=xo.createElement(h,r),De.currentNode=this.el.content,i===2||i===3){const g=this.el.content.firstChild;g.replaceWith(...g.childNodes)}for(;(o=De.nextNode())!==null&&d.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(const g of o.getAttributeNames())if(g.endsWith(dr)){const b=_[n++],w=o.getAttribute(g).split(me),u=/([.?@])?(.*)/.exec(b);d.push({type:1,index:s,name:u[2],strings:w,ctor:u[1]==="."?jo:u[1]==="?"?Go:u[1]==="@"?qo:$t}),o.removeAttribute(g)}else g.startsWith(me)&&(d.push({type:6,index:s}),o.removeAttribute(g));if(_r.test(o.tagName)){const g=o.textContent.split(me),b=g.length-1;if(b>0){o.textContent=At?At.emptyScript:"";for(let w=0;w<b;w++)o.append(g[w],et()),De.nextNode(),d.push({type:2,index:++s});o.append(g[b],et())}}}else if(o.nodeType===8)if(o.data===cr)d.push({type:2,index:s});else{let g=-1;for(;(g=o.data.indexOf(me,g+1))!==-1;)d.push({type:7,index:s}),g+=me.length-1}s++}}static createElement(e,i){const r=Ce.createElement("template");return r.innerHTML=e,r}};function Ue(t,e,i=t,r){var n,l,d;if(e===Se)return e;let o=r!==void 0?(n=i._$Co)==null?void 0:n[r]:i._$Cl;const s=tt(e)?void 0:e._$litDirective$;return(o==null?void 0:o.constructor)!==s&&((l=o==null?void 0:o._$AO)==null||l.call(o,!1),s===void 0?o=void 0:(o=new s(t),o._$AT(t,i,r)),r!==void 0?((d=i._$Co)!=null?d:i._$Co=[])[r]=o:i._$Cl=o),o!==void 0&&(e=Ue(t,o._$AS(t,e.values),o,r)),e}let Ho=class{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var h;const{el:{content:i},parts:r}=this._$AD,o=((h=e==null?void 0:e.creationScope)!=null?h:Ce).importNode(i,!0);De.currentNode=o;let s=De.nextNode(),n=0,l=0,d=r[0];for(;d!==void 0;){if(n===d.index){let _;d.type===2?_=new oi(s,s.nextSibling,this,e):d.type===1?_=new d.ctor(s,d.name,d.strings,this,e):d.type===6&&(_=new Vo(s,this,e)),this._$AV.push(_),d=r[++l]}n!==(d==null?void 0:d.index)&&(s=De.nextNode(),n++)}return De.currentNode=Ce,o}p(e){let i=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,i),i+=r.strings.length-2):r._$AI(e[i])),i++}},oi=class Eo{get _$AU(){var e,i;return(i=(e=this._$AM)==null?void 0:e._$AU)!=null?i:this._$Cv}constructor(e,i,r,o){var s;this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=r,this.options=o,this._$Cv=(s=o==null?void 0:o.isConnected)!=null?s:!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=Ue(this,e,i),tt(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==Se&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Uo(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&tt(this._$AH)?this._$AA.nextSibling.data=e:this.T(Ce.createTextNode(e)),this._$AH=e}$(e){var s;const{values:i,_$litType$:r}=e,o=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=ri.createElement(vr(r.h,r.h[0]),this.options)),r);if(((s=this._$AH)==null?void 0:s._$AD)===o)this._$AH.p(i);else{const n=new Ho(o,this),l=n.u(this.options);n.p(i),this.T(l),this._$AH=n}}_$AC(e){let i=fr.get(e.strings);return i===void 0&&fr.set(e.strings,i=new ri(e)),i}k(e){ti(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let r,o=0;for(const s of e)o===i.length?i.push(r=new Eo(this.O(et()),this.O(et()),this,this.options)):r=i[o],r._$AI(s),o++;o<i.length&&(this._$AR(r&&r._$AB.nextSibling,o),i.length=o)}_$AR(e=this._$AA.nextSibling,i){var r;for((r=this._$AP)==null?void 0:r.call(this,!1,!0,i);e!==this._$AB;){const o=ar(e).nextSibling;ar(e).remove(),e=o}}setConnected(e){var i;this._$AM===void 0&&(this._$Cv=e,(i=this._$AP)==null||i.call(this,e))}},$t=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,r,o,s){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=i,this._$AM=o,this.options=s,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=m}_$AI(e,i=this,r,o){const s=this.strings;let n=!1;if(s===void 0)e=Ue(this,e,i,0),n=!tt(e)||e!==this._$AH&&e!==Se,n&&(this._$AH=e);else{const l=e;let d,h;for(e=s[0],d=0;d<s.length-1;d++)h=Ue(this,l[r+d],i,d),h===Se&&(h=this._$AH[d]),n||(n=!tt(h)||h!==this._$AH[d]),h===m?e=m:e!==m&&(e+=(h!=null?h:"")+s[d+1]),this._$AH[d]=h}n&&!o&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e!=null?e:"")}},jo=class extends $t{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}},Go=class extends $t{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}},qo=class extends $t{constructor(e,i,r,o,s){super(e,i,r,o,s),this.type=5}_$AI(e,i=this){var n;if((e=(n=Ue(this,e,i,0))!=null?n:m)===Se)return;const r=this._$AH,o=e===m&&r!==m||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,s=e!==m&&(r===m||o);o&&this.element.removeEventListener(this.name,this,r),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var i,r;typeof this._$AH=="function"?this._$AH.call((r=(i=this.options)==null?void 0:i.host)!=null?r:this.element,e):this._$AH.handleEvent(e)}},Vo=class{constructor(e,i,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){Ue(this,e)}};const si=Je.litHtmlPolyfillSupport;si==null||si(ri,oi),((bo=Je.litHtmlVersions)!=null?bo:Je.litHtmlVersions=[]).push("3.3.2");const Yo=(t,e,i)=>{var s,n;const r=(s=i==null?void 0:i.renderBefore)!=null?s:e;let o=r._$litPart$;if(o===void 0){const l=(n=i==null?void 0:i.renderBefore)!=null?n:null;r._$litPart$=o=new oi(e.insertBefore(et(),l),l,void 0,i!=null?i:{})}return o._$AI(t),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Fe=globalThis;let We=class extends Oe{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var i,r;const e=super.createRenderRoot();return(r=(i=this.renderOptions).renderBefore)!=null||(i.renderBefore=e.firstChild),e}update(e){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Yo(i,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return Se}};We._$litElement$=!0,We.finalized=!0,(yo=Fe.litElementHydrateSupport)==null||yo.call(Fe,{LitElement:We});const ni=Fe.litElementPolyfillSupport;ni==null||ni({LitElement:We}),((wo=Fe.litElementVersions)!=null?wo:Fe.litElementVersions=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const br=t=>(e,i)=>{i!==void 0?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ko={attribute:!0,type:String,converter:Et,reflect:!1,hasChanged:ei},Zo=(t=Ko,e,i)=>{const{kind:r,metadata:o}=i;let s=globalThis.litPropertyMetadata.get(o);if(s===void 0&&globalThis.litPropertyMetadata.set(o,s=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),r==="accessor"){const{name:n}=i;return{set(l){const d=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,d,t,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,t,l),l}}}if(r==="setter"){const{name:n}=i;return function(l){const d=this[n];e.call(this,l),this.requestUpdate(n,d,t,!0,l)}}throw Error("Unsupported decorator location: "+r)};function ai(t){return(e,i)=>typeof i=="object"?Zo(t,e,i):((r,o,s)=>{const n=o.hasOwnProperty(s);return o.constructor.createProperty(s,r),n?Object.getOwnPropertyDescriptor(o,s):void 0})(t,e,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ae(t){return ai({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xo={CHILD:2},Qo=t=>(...e)=>({_$litDirective$:t,values:e});let Jo=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,r){this._$Ct=e,this._$AM=i,this._$Ci=r}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class li extends Jo{constructor(e){if(super(e),this.it=m,e.type!==Xo.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===m||e==null)return this._t=void 0,this.it=e;if(e===Se)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const i=[e];return i.raw=i,this._t={_$litType$:this.constructor.resultType,strings:i,values:[]}}}li.directiveName="unsafeHTML",li.resultType=1;const es=Qo(li),St={preparation:"striped",active:"shimmer",ongoing:"pulse"},Dt={preparation:"dashed",active:"solid",ongoing:"solid"};/*! @license DOMPurify 3.4.2 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.2/LICENSE */const{entries:yr,setPrototypeOf:wr,isFrozen:ts,getPrototypeOf:is,getOwnPropertyDescriptor:rs}=Object;let{freeze:H,seal:te,create:He}=Object,{apply:di,construct:ci}=typeof Reflect!="undefined"&&Reflect;H||(H=function(e){return e}),te||(te=function(e){return e}),di||(di=function(e,i){for(var r=arguments.length,o=new Array(r>2?r-2:0),s=2;s<r;s++)o[s-2]=arguments[s];return e.apply(i,o)}),ci||(ci=function(e){for(var i=arguments.length,r=new Array(i>1?i-1:0),o=1;o<i;o++)r[o-1]=arguments[o];return new e(...r)});const rt=L(Array.prototype.forEach),os=L(Array.prototype.lastIndexOf),xr=L(Array.prototype.pop),ot=L(Array.prototype.push),ss=L(Array.prototype.splice),j=Array.isArray,st=L(String.prototype.toLowerCase),ui=L(String.prototype.toString),Er=L(String.prototype.match),je=L(String.prototype.replace),Ar=L(String.prototype.indexOf),ns=L(String.prototype.trim),as=L(Number.prototype.toString),ls=L(Boolean.prototype.toString),Cr=typeof BigInt=="undefined"?null:L(BigInt.prototype.toString),$r=typeof Symbol=="undefined"?null:L(Symbol.prototype.toString),F=L(Object.prototype.hasOwnProperty),nt=L(Object.prototype.toString),N=L(RegExp.prototype.test),Ft=ds(TypeError);function L(t){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var i=arguments.length,r=new Array(i>1?i-1:0),o=1;o<i;o++)r[o-1]=arguments[o];return di(t,e,r)}}function ds(t){return function(){for(var e=arguments.length,i=new Array(e),r=0;r<e;r++)i[r]=arguments[r];return ci(t,i)}}function E(t,e){let i=arguments.length>2&&arguments[2]!==void 0?arguments[2]:st;if(wr&&wr(t,null),!j(e))return t;let r=e.length;for(;r--;){let o=e[r];if(typeof o=="string"){const s=i(o);s!==o&&(ts(e)||(e[r]=s),o=s)}t[o]=!0}return t}function cs(t){for(let e=0;e<t.length;e++)F(t,e)||(t[e]=null);return t}function Z(t){const e=He(null);for(const[i,r]of yr(t))F(t,i)&&(j(r)?e[i]=cs(r):r&&typeof r=="object"&&r.constructor===Object?e[i]=Z(r):e[i]=r);return e}function us(t){switch(typeof t){case"string":return t;case"number":return as(t);case"boolean":return ls(t);case"bigint":return Cr?Cr(t):"0";case"symbol":return $r?$r(t):"Symbol()";case"undefined":return nt(t);case"function":case"object":{if(t===null)return nt(t);const e=t,i=Ge(e,"toString");if(typeof i=="function"){const r=i(e);return typeof r=="string"?r:nt(r)}return nt(t)}default:return nt(t)}}function Ge(t,e){for(;t!==null;){const r=rs(t,e);if(r){if(r.get)return L(r.get);if(typeof r.value=="function")return L(r.value)}t=is(t)}function i(){return null}return i}function hs(t){try{return N(t,""),!0}catch{return!1}}const Sr=H(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),hi=H(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),pi=H(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),ps=H(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),gi=H(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),gs=H(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Dr=H(["#text"]),Fr=H(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),_i=H(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),kr=H(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),kt=H(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),_s=te(/\{\{[\w\W]*|[\w\W]*\}\}/gm),ms=te(/<%[\w\W]*|[\w\W]*%>/gm),fs=te(/\$\{[\w\W]*/gm),vs=te(/^data-[\-\w.\u00B7-\uFFFF]+$/),bs=te(/^aria-[\-\w]+$/),Tr=te(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),ys=te(/^(?:\w+script|data):/i),ws=te(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Mr=te(/^html$/i),xs=te(/^[a-z][.\w]*(-[.\w]+)+$/i);var Lr=Object.freeze({__proto__:null,ARIA_ATTR:bs,ATTR_WHITESPACE:ws,CUSTOM_ELEMENT:xs,DATA_ATTR:vs,DOCTYPE_NAME:Mr,ERB_EXPR:ms,IS_ALLOWED_URI:Tr,IS_SCRIPT_OR_DATA:ys,MUSTACHE_EXPR:_s,TMPLIT_EXPR:fs});const at={element:1,text:3,progressingInstruction:7,comment:8,document:9},Es=function(){return typeof window=="undefined"?null:window},As=function(e,i){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let r=null;const o="data-tt-policy-suffix";i&&i.hasAttribute(o)&&(r=i.getAttribute(o));const s="dompurify"+(r?"#"+r:"");try{return e.createPolicy(s,{createHTML(n){return n},createScriptURL(n){return n}})}catch{return console.warn("TrustedTypes policy "+s+" could not be created."),null}},Br=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function Ir(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Es();const e=x=>Ir(x);if(e.version="3.4.2",e.removed=[],!t||!t.document||t.document.nodeType!==at.document||!t.Element)return e.isSupported=!1,e;let{document:i}=t;const r=i,o=r.currentScript,{DocumentFragment:s,HTMLTemplateElement:n,Node:l,Element:d,NodeFilter:h,NamedNodeMap:_=t.NamedNodeMap||t.MozNamedAttrMap,HTMLFormElement:g,DOMParser:b,trustedTypes:w}=t,u=d.prototype,f=Ge(u,"cloneNode"),W=Ge(u,"remove"),$=Ge(u,"nextSibling"),Q=Ge(u,"childNodes"),G=Ge(u,"parentNode");if(typeof n=="function"){const x=i.createElement("template");x.content&&x.content.ownerDocument&&(i=x.content.ownerDocument)}let D,q="";const{implementation:A,createNodeIterator:J,createDocumentFragment:be,getElementsByTagName:_t}=i,{importNode:mt}=r;let I=Br();e.isSupported=typeof yr=="function"&&typeof G=="function"&&A&&A.createHTMLDocument!==void 0;const{MUSTACHE_EXPR:ye,ERB_EXPR:we,TMPLIT_EXPR:Be,DATA_ATTR:It,ARIA_ATTR:V,IS_SCRIPT_OR_DATA:pe,ATTR_WHITESPACE:Ie,CUSTOM_ELEMENT:zt}=Lr;let{IS_ALLOWED_URI:Ti}=Lr,z=null;const Mi=E({},[...Sr,...hi,...pi,...gi,...Dr]);let R=null;const Li=E({},[...Fr,..._i,...kr,...kt]);let T=Object.seal(He(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Ye=null,ft=null;const ge=Object.seal(He(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Bi=!0,Pt=!0,Ii=!1,zi=!0,xe=!1,Ke=!0,Ee=!1,Rt=!1,Nt=!1,ze=!1,vt=!1,bt=!1,Pi=!0,Ri=!1;const Ni="user-content-";let Ot=!0,Ze=!1,Pe={},se=null;const Ut=E({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Oi=null;const Ui=E({},["audio","video","img","source","image","track"]);let Wt=null;const Wi=E({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),yt="http://www.w3.org/1998/Math/MathML",wt="http://www.w3.org/2000/svg",ne="http://www.w3.org/1999/xhtml";let Re=ne,Ht=!1,jt=null;const Ao=E({},[yt,wt,ne],ui);let Gt=E({},["mi","mo","mn","ms","mtext"]),qt=E({},["annotation-xml"]);const Co=E({},["title","style","font","a","script"]);let Xe=null;const $o=["application/xhtml+xml","text/html"],So="text/html";let B=null,Ne=null;const Do=i.createElement("form"),Hi=function(a){return a instanceof RegExp||a instanceof Function},Vt=function(){let a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(Ne&&Ne===a)return;(!a||typeof a!="object")&&(a={}),a=Z(a),Xe=$o.indexOf(a.PARSER_MEDIA_TYPE)===-1?So:a.PARSER_MEDIA_TYPE,B=Xe==="application/xhtml+xml"?ui:st,z=F(a,"ALLOWED_TAGS")&&j(a.ALLOWED_TAGS)?E({},a.ALLOWED_TAGS,B):Mi,R=F(a,"ALLOWED_ATTR")&&j(a.ALLOWED_ATTR)?E({},a.ALLOWED_ATTR,B):Li,jt=F(a,"ALLOWED_NAMESPACES")&&j(a.ALLOWED_NAMESPACES)?E({},a.ALLOWED_NAMESPACES,ui):Ao,Wt=F(a,"ADD_URI_SAFE_ATTR")&&j(a.ADD_URI_SAFE_ATTR)?E(Z(Wi),a.ADD_URI_SAFE_ATTR,B):Wi,Oi=F(a,"ADD_DATA_URI_TAGS")&&j(a.ADD_DATA_URI_TAGS)?E(Z(Ui),a.ADD_DATA_URI_TAGS,B):Ui,se=F(a,"FORBID_CONTENTS")&&j(a.FORBID_CONTENTS)?E({},a.FORBID_CONTENTS,B):Ut,Ye=F(a,"FORBID_TAGS")&&j(a.FORBID_TAGS)?E({},a.FORBID_TAGS,B):Z({}),ft=F(a,"FORBID_ATTR")&&j(a.FORBID_ATTR)?E({},a.FORBID_ATTR,B):Z({}),Pe=F(a,"USE_PROFILES")?a.USE_PROFILES&&typeof a.USE_PROFILES=="object"?Z(a.USE_PROFILES):a.USE_PROFILES:!1,Bi=a.ALLOW_ARIA_ATTR!==!1,Pt=a.ALLOW_DATA_ATTR!==!1,Ii=a.ALLOW_UNKNOWN_PROTOCOLS||!1,zi=a.ALLOW_SELF_CLOSE_IN_ATTR!==!1,xe=a.SAFE_FOR_TEMPLATES||!1,Ke=a.SAFE_FOR_XML!==!1,Ee=a.WHOLE_DOCUMENT||!1,ze=a.RETURN_DOM||!1,vt=a.RETURN_DOM_FRAGMENT||!1,bt=a.RETURN_TRUSTED_TYPE||!1,Nt=a.FORCE_BODY||!1,Pi=a.SANITIZE_DOM!==!1,Ri=a.SANITIZE_NAMED_PROPS||!1,Ot=a.KEEP_CONTENT!==!1,Ze=a.IN_PLACE||!1,Ti=hs(a.ALLOWED_URI_REGEXP)?a.ALLOWED_URI_REGEXP:Tr,Re=typeof a.NAMESPACE=="string"?a.NAMESPACE:ne,Gt=F(a,"MATHML_TEXT_INTEGRATION_POINTS")&&a.MATHML_TEXT_INTEGRATION_POINTS&&typeof a.MATHML_TEXT_INTEGRATION_POINTS=="object"?Z(a.MATHML_TEXT_INTEGRATION_POINTS):E({},["mi","mo","mn","ms","mtext"]),qt=F(a,"HTML_INTEGRATION_POINTS")&&a.HTML_INTEGRATION_POINTS&&typeof a.HTML_INTEGRATION_POINTS=="object"?Z(a.HTML_INTEGRATION_POINTS):E({},["annotation-xml"]);const p=F(a,"CUSTOM_ELEMENT_HANDLING")&&a.CUSTOM_ELEMENT_HANDLING&&typeof a.CUSTOM_ELEMENT_HANDLING=="object"?Z(a.CUSTOM_ELEMENT_HANDLING):He(null);if(T=He(null),F(p,"tagNameCheck")&&Hi(p.tagNameCheck)&&(T.tagNameCheck=p.tagNameCheck),F(p,"attributeNameCheck")&&Hi(p.attributeNameCheck)&&(T.attributeNameCheck=p.attributeNameCheck),F(p,"allowCustomizedBuiltInElements")&&typeof p.allowCustomizedBuiltInElements=="boolean"&&(T.allowCustomizedBuiltInElements=p.allowCustomizedBuiltInElements),xe&&(Pt=!1),vt&&(ze=!0),Pe&&(z=E({},Dr),R=He(null),Pe.html===!0&&(E(z,Sr),E(R,Fr)),Pe.svg===!0&&(E(z,hi),E(R,_i),E(R,kt)),Pe.svgFilters===!0&&(E(z,pi),E(R,_i),E(R,kt)),Pe.mathMl===!0&&(E(z,gi),E(R,kr),E(R,kt))),ge.tagCheck=null,ge.attributeCheck=null,F(a,"ADD_TAGS")&&(typeof a.ADD_TAGS=="function"?ge.tagCheck=a.ADD_TAGS:j(a.ADD_TAGS)&&(z===Mi&&(z=Z(z)),E(z,a.ADD_TAGS,B))),F(a,"ADD_ATTR")&&(typeof a.ADD_ATTR=="function"?ge.attributeCheck=a.ADD_ATTR:j(a.ADD_ATTR)&&(R===Li&&(R=Z(R)),E(R,a.ADD_ATTR,B))),F(a,"ADD_URI_SAFE_ATTR")&&j(a.ADD_URI_SAFE_ATTR)&&E(Wt,a.ADD_URI_SAFE_ATTR,B),F(a,"FORBID_CONTENTS")&&j(a.FORBID_CONTENTS)&&(se===Ut&&(se=Z(se)),E(se,a.FORBID_CONTENTS,B)),F(a,"ADD_FORBID_CONTENTS")&&j(a.ADD_FORBID_CONTENTS)&&(se===Ut&&(se=Z(se)),E(se,a.ADD_FORBID_CONTENTS,B)),Ot&&(z["#text"]=!0),Ee&&E(z,["html","head","body"]),z.table&&(E(z,["tbody"]),delete Ye.tbody),a.TRUSTED_TYPES_POLICY){if(typeof a.TRUSTED_TYPES_POLICY.createHTML!="function")throw Ft('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof a.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw Ft('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');D=a.TRUSTED_TYPES_POLICY,q=D.createHTML("")}else D===void 0&&(D=As(w,o)),D!==null&&typeof q=="string"&&(q=D.createHTML(""));H&&H(a),Ne=a},ji=E({},[...hi,...pi,...ps]),Gi=E({},[...gi,...gs]),Fo=function(a){let p=G(a);(!p||!p.tagName)&&(p={namespaceURI:Re,tagName:"template"});const y=st(a.tagName),C=st(p.tagName);return jt[a.namespaceURI]?a.namespaceURI===wt?p.namespaceURI===ne?y==="svg":p.namespaceURI===yt?y==="svg"&&(C==="annotation-xml"||Gt[C]):!!ji[y]:a.namespaceURI===yt?p.namespaceURI===ne?y==="math":p.namespaceURI===wt?y==="math"&&qt[C]:!!Gi[y]:a.namespaceURI===ne?p.namespaceURI===wt&&!qt[C]||p.namespaceURI===yt&&!Gt[C]?!1:!Gi[y]&&(Co[y]||!ji[y]):!!(Xe==="application/xhtml+xml"&&jt[a.namespaceURI]):!1},ie=function(a){ot(e.removed,{element:a});try{G(a).removeChild(a)}catch{W(a)}},Ae=function(a,p){try{ot(e.removed,{attribute:p.getAttributeNode(a),from:p})}catch{ot(e.removed,{attribute:null,from:p})}if(p.removeAttribute(a),a==="is")if(ze||vt)try{ie(p)}catch{}else try{p.setAttribute(a,"")}catch{}},qi=function(a){let p=null,y=null;if(Nt)a="<remove></remove>"+a;else{const M=Er(a,/^[\r\n\t ]+/);y=M&&M[0]}Xe==="application/xhtml+xml"&&Re===ne&&(a='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+a+"</body></html>");const C=D?D.createHTML(a):a;if(Re===ne)try{p=new b().parseFromString(C,Xe)}catch{}if(!p||!p.documentElement){p=A.createDocument(Re,"template",null);try{p.documentElement.innerHTML=Ht?q:C}catch{}}const O=p.body||p.documentElement;return a&&y&&O.insertBefore(i.createTextNode(y),O.childNodes[0]||null),Re===ne?_t.call(p,Ee?"html":"body")[0]:Ee?p.documentElement:O},Vi=function(a){return J.call(a.ownerDocument||a,a,h.SHOW_ELEMENT|h.SHOW_COMMENT|h.SHOW_TEXT|h.SHOW_PROCESSING_INSTRUCTION|h.SHOW_CDATA_SECTION,null)},Yt=function(a){return a instanceof g&&(typeof a.nodeName!="string"||typeof a.textContent!="string"||typeof a.removeChild!="function"||!(a.attributes instanceof _)||typeof a.removeAttribute!="function"||typeof a.setAttribute!="function"||typeof a.namespaceURI!="string"||typeof a.insertBefore!="function"||typeof a.hasChildNodes!="function")},Kt=function(a){return typeof l=="function"&&a instanceof l};function ce(x,a,p){rt(x,y=>{y.call(e,a,p,Ne)})}const Yi=function(a){let p=null;if(ce(I.beforeSanitizeElements,a,null),Yt(a))return ie(a),!0;const y=B(a.nodeName);if(ce(I.uponSanitizeElement,a,{tagName:y,allowedTags:z}),Ke&&a.hasChildNodes()&&!Kt(a.firstElementChild)&&N(/<[/\w!]/g,a.innerHTML)&&N(/<[/\w!]/g,a.textContent)||Ke&&a.namespaceURI===ne&&y==="style"&&Kt(a.firstElementChild)||a.nodeType===at.progressingInstruction||Ke&&a.nodeType===at.comment&&N(/<[/\w]/g,a.data))return ie(a),!0;if(Ye[y]||!(ge.tagCheck instanceof Function&&ge.tagCheck(y))&&!z[y]){if(!Ye[y]&&Zi(y)&&(T.tagNameCheck instanceof RegExp&&N(T.tagNameCheck,y)||T.tagNameCheck instanceof Function&&T.tagNameCheck(y)))return!1;if(Ot&&!se[y]){const C=G(a)||a.parentNode,O=Q(a)||a.childNodes;if(O&&C){const M=O.length;for(let Y=M-1;Y>=0;--Y){const ee=f(O[Y],!0);C.insertBefore(ee,$(a))}}}return ie(a),!0}return a instanceof d&&!Fo(a)||(y==="noscript"||y==="noembed"||y==="noframes")&&N(/<\/no(script|embed|frames)/i,a.innerHTML)?(ie(a),!0):(xe&&a.nodeType===at.text&&(p=a.textContent,rt([ye,we,Be],C=>{p=je(p,C," ")}),a.textContent!==p&&(ot(e.removed,{element:a.cloneNode()}),a.textContent=p)),ce(I.afterSanitizeElements,a,null),!1)},Ki=function(a,p,y){if(ft[p]||Pi&&(p==="id"||p==="name")&&(y in i||y in Do))return!1;const C=R[p]||ge.attributeCheck instanceof Function&&ge.attributeCheck(p,a);if(!(Pt&&!ft[p]&&N(It,p))){if(!(Bi&&N(V,p))){if(!C||ft[p]){if(!(Zi(a)&&(T.tagNameCheck instanceof RegExp&&N(T.tagNameCheck,a)||T.tagNameCheck instanceof Function&&T.tagNameCheck(a))&&(T.attributeNameCheck instanceof RegExp&&N(T.attributeNameCheck,p)||T.attributeNameCheck instanceof Function&&T.attributeNameCheck(p,a))||p==="is"&&T.allowCustomizedBuiltInElements&&(T.tagNameCheck instanceof RegExp&&N(T.tagNameCheck,y)||T.tagNameCheck instanceof Function&&T.tagNameCheck(y))))return!1}else if(!Wt[p]){if(!N(Ti,je(y,Ie,""))){if(!((p==="src"||p==="xlink:href"||p==="href")&&a!=="script"&&Ar(y,"data:")===0&&Oi[a])){if(!(Ii&&!N(pe,je(y,Ie,"")))){if(y)return!1}}}}}}return!0},ko=E({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Zi=function(a){return!ko[st(a)]&&N(zt,a)},Xi=function(a){ce(I.beforeSanitizeAttributes,a,null);const{attributes:p}=a;if(!p||Yt(a))return;const y={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:R,forceKeepAttr:void 0};let C=p.length;for(;C--;){const O=p[C],{name:M,namespaceURI:Y,value:ee}=O,re=B(M),Zt=ee;let P=M==="value"?Zt:ns(Zt);if(y.attrName=re,y.attrValue=P,y.keepAttr=!0,y.forceKeepAttr=void 0,ce(I.uponSanitizeAttribute,a,y),P=y.attrValue,Ri&&(re==="id"||re==="name")&&Ar(P,Ni)!==0&&(Ae(M,a),P=Ni+P),Ke&&N(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,P)){Ae(M,a);continue}if(re==="attributename"&&Er(P,"href")){Ae(M,a);continue}if(y.forceKeepAttr)continue;if(!y.keepAttr){Ae(M,a);continue}if(!zi&&N(/\/>/i,P)){Ae(M,a);continue}xe&&rt([ye,we,Be],er=>{P=je(P,er," ")});const Ji=B(a.nodeName);if(!Ki(Ji,re,P)){Ae(M,a);continue}if(D&&typeof w=="object"&&typeof w.getAttributeType=="function"&&!Y)switch(w.getAttributeType(Ji,re)){case"TrustedHTML":{P=D.createHTML(P);break}case"TrustedScriptURL":{P=D.createScriptURL(P);break}}if(P!==Zt)try{Y?a.setAttributeNS(Y,M,P):a.setAttribute(M,P),Yt(a)?ie(a):xr(e.removed)}catch{Ae(M,a)}}ce(I.afterSanitizeAttributes,a,null)},Qi=function(a){let p=null;const y=Vi(a);for(ce(I.beforeSanitizeShadowDOM,a,null);p=y.nextNode();)ce(I.uponSanitizeShadowNode,p,null),Yi(p),Xi(p),p.content instanceof s&&Qi(p.content);ce(I.afterSanitizeShadowDOM,a,null)};return e.sanitize=function(x){let a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},p=null,y=null,C=null,O=null;if(Ht=!x,Ht&&(x="<!-->"),typeof x!="string"&&!Kt(x)&&(x=us(x),typeof x!="string"))throw Ft("dirty is not a string, aborting");if(!e.isSupported)return x;if(Rt||Vt(a),e.removed=[],typeof x=="string"&&(Ze=!1),Ze){const ee=x.nodeName;if(typeof ee=="string"){const re=B(ee);if(!z[re]||Ye[re])throw Ft("root node is forbidden and cannot be sanitized in-place")}}else if(x instanceof l)p=qi("<!---->"),y=p.ownerDocument.importNode(x,!0),y.nodeType===at.element&&y.nodeName==="BODY"||y.nodeName==="HTML"?p=y:p.appendChild(y);else{if(!ze&&!xe&&!Ee&&x.indexOf("<")===-1)return D&&bt?D.createHTML(x):x;if(p=qi(x),!p)return ze?null:bt?q:""}p&&Nt&&ie(p.firstChild);const M=Vi(Ze?x:p);for(;C=M.nextNode();)Yi(C),Xi(C),C.content instanceof s&&Qi(C.content);if(Ze)return x;if(ze){if(xe){p.normalize();let ee=p.innerHTML;rt([ye,we,Be],re=>{ee=je(ee,re," ")}),p.innerHTML=ee}if(vt)for(O=be.call(p.ownerDocument);p.firstChild;)O.appendChild(p.firstChild);else O=p;return(R.shadowroot||R.shadowrootmode)&&(O=mt.call(r,O,!0)),O}let Y=Ee?p.outerHTML:p.innerHTML;return Ee&&z["!doctype"]&&p.ownerDocument&&p.ownerDocument.doctype&&p.ownerDocument.doctype.name&&N(Mr,p.ownerDocument.doctype.name)&&(Y="<!DOCTYPE "+p.ownerDocument.doctype.name+`>
`+Y),xe&&rt([ye,we,Be],ee=>{Y=je(Y,ee," ")}),D&&bt?D.createHTML(Y):Y},e.setConfig=function(){let x=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};Vt(x),Rt=!0},e.clearConfig=function(){Ne=null,Rt=!1},e.isValidAttribute=function(x,a,p){Ne||Vt({});const y=B(x),C=B(a);return Ki(y,C,p)},e.addHook=function(x,a){typeof a=="function"&&ot(I[x],a)},e.removeHook=function(x,a){if(a!==void 0){const p=os(I[x],a);return p===-1?void 0:ss(I[x],p,1)[0]}return xr(I[x])},e.removeHooks=function(x){I[x]=[]},e.removeAllHooks=function(){I=Br()},e}var zr=Ir();const Cs={"card.no_alerts":"No active alerts.","card.sources_unavailable_named":"{name} unavailable","card.sources_unavailable_count":"{count} sources unavailable","card.sources_unavailable_one":"A source is unavailable","card.preview":"Sample Data","card.read_details":"Read Details","card.open_source":"Open {provider} Source","card.zones_count":"{count} zones","card.zone_count_singular":"{count} zone","card.dismiss":"Dismiss","card.dismissed_toast":"Dismissed: {event}","card.dismissed_toast_undo":"Undo","card.close":"Close","detail.issued":"Issued","detail.onset":"Onset","detail.expires":"Expires","detail.area":"Area","detail.source":"Source","detail.description":"Description","detail.instructions":"Instructions","progress.start":"Start","progress.now":"Now","progress.end":"End","progress.ongoing":"Ongoing","progress.expires_in_label":"Expires in","progress.starts_in_label":"Starts in","progress.tbd":"TBD","progress.na":"N/A","progress.expired_label":"Expired","progress.compact_active":"for {time}","progress.compact_prep":"in {time}","progress.compact_ongoing":"ongoing","progress.compact_expired":"expired {time} ago","time.just_now":"just now","time.in_less_than_1m":"in <1m","time.minutes_ago":"{m}m ago","time.in_minutes":"in {m}m","time.hours_ago":"{dur} ago","time.in_hours":"in {dur}","time.days_ago":"{d}d ago","time.in_days":"in {d}d","badge.severity_extreme":"Extreme","badge.severity_severe":"Severe","badge.severity_moderate":"Moderate","badge.severity_minor":"Minor","badge.severity_unknown":"Unknown","badge.certainty_observed":"Observed","badge.certainty_likely":"Likely","badge.certainty_possible":"Possible","badge.certainty_unlikely":"Unlikely","badge.certainty_unknown":"Unknown","editor.entities":"Entities","editor.title":"Title (optional)","editor.provider":"Alert provider","editor.provider_auto":"Auto-detect","editor.provider_nws":"NWS (United States)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europe)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Germany)","editor.provider_nina":"NINA (Germany, civil protection)","editor.provider_meteoswiss":"MeteoSwiss (Switzerland)","editor.provider_eccc":"ECCC (Canada)","editor.provider_nsw_rfs":"NSW RFS (Australia)","editor.provider_cap":"CAP Alerts (multi-region)","editor.device":"CAP Alerts device (optional)","editor.device_helper":"Pulls in every active alert sensor under this device automatically.","editor.zones":"Zones (optional)","editor.zones_helper":"Comma-separated BoM area_id codes, e.g. NSW_FL049","editor.event_codes":"Event codes (optional)","editor.event_codes_helper":"Comma-separated event codes, e.g. TOW, SVW (NWS) or 31, 95 (DWD)","editor.exclude_event_codes":"Exclude event codes (optional)","editor.exclude_event_codes_helper":"Comma-separated event codes to exclude, e.g. SCY (NWS) or 22 (DWD)","editor.sort_order":"Sort order","editor.sort_default":"Default","editor.sort_onset":"Onset time","editor.sort_severity":"Severity","editor.color_theme":"Color theme","editor.color_severity":"Severity-based","editor.color_nws":"NWS Official","editor.color_meteoalarm":"MeteoAlarm Awareness","editor.color_eccc":"ECCC Public Alerts","editor.timezone":"Timezone","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (local device)","editor.min_severity":"Minimum severity","editor.severity_all":"All severities","editor.severity_minor":"Minor or higher","editor.severity_moderate":"Moderate or higher","editor.severity_severe":"Severe or higher","editor.severity_extreme":"Extreme only","editor.animations":"Enable animations","editor.enhance_contrast":"Enhance contrast","editor.enhance_contrast_off":"Off","editor.enhance_contrast_subtle":"Subtle (default)","editor.enhance_contrast_strict":"Strict (WCAG AA)","editor.deduplicate":"Deduplicate alerts","editor.deduplicate_headlines":"Deduplicate headlines","editor.show_details":"Show detail panel","editor.expand_details":"Always expand details","editor.show_metadata":"Show metadata","editor.show_description":"Show description","editor.show_instructions":"Show instructions","editor.show_geometry":"Show area map","editor.geometry_style":"Area map style","editor.geometry_style_shape":"Outline only","editor.geometry_style_map":"Map tiles (online)","editor.show_provider":"Show provider label","editor.show_source_link":"Show source link","editor.reformat_text":"Reflow alert text (strip hard line breaks)","editor.compact":"Compact layout","editor.font_size":"Font size","editor.font_size_small":"Small","editor.font_size_default":"Default","editor.font_size_large":"Large","editor.font_size_x_large":"Extra large","editor.progress_fill":"Progress fill","editor.progress_fill_track":"Track (thin bar)","editor.progress_fill_background":"Background wash","editor.styling_section":"Progress & icon styling","editor.progress_style":"Progress bar decoration","editor.progress_style_wash_note":"Not applied while Progress fill is set to Background wash (the wash is always solid).","editor.progress_style_preparation":"Preparation","editor.progress_style_active":"Active","editor.progress_style_ongoing":"Ongoing","editor.deco_solid":"Solid","editor.deco_striped":"Striped","editor.deco_shimmer":"Shimmer","editor.deco_pulse":"Pulse","editor.icon_border_style":"Icon ring border","editor.icon_border_dashed":"Dashed","editor.icon_border_solid":"Solid","editor.hide_expired":"Hide expired alerts","editor.hide_no_alerts":"Hide card when there are no active alerts","editor.unavailable_behavior":"When a source is unavailable","editor.unavailable_message":"Show which source","editor.unavailable_compact":"Show a compact indicator","editor.unavailable_hide":"Hide indicator (not recommended)","editor.unavailable_hide_warning":"Hiding the indicator can present an all-clear while a source is blind \u2014 an unavailable sensor is not proof of safety.","editor.tap_action":"Tap action","editor.tap_action_helper":"Setting any tap action replaces the inline expand affordance on each alert row.","editor.tap_default":"Inline expand (default)","editor.tap_details":"Detail pop-up","editor.tap_more_info":"More info","editor.tap_navigate":"Navigate","editor.tap_url":"Open URL","editor.tap_toggle":"Toggle","editor.tap_perform_action":"Perform action","editor.tap_call_service":"Call service (legacy)","editor.tap_fire_dom_event":"Fire DOM event","editor.tap_none":"Nothing","editor.tap_navigation_path":"Navigation path","editor.tap_url_path":"URL","editor.tap_yaml_managed":"This action carries a payload the visual editor does not edit. Its existing YAML is preserved \u2014 edit it in the YAML editor.","editor.tap_details_expand_hint":'With "Always expand details" off, the pop-up opens with its description behind the Read Details toggle.',"editor.allow_dismiss":"Allow dismissing alerts","editor.show_dismiss_undo":"Show undo notification on dismiss","editor.dismissed_count":"Dismissed: {count} alerts.","editor.dismissed_count_singular":"Dismissed: {count} alert.","editor.restore_all":"Restore all","editor.show_preview":"Show sample data","editor.preview_hint":"Preview card layout with sample alerts","editor.preview_nudge":"No active alerts \u2014 enable to preview the card layout.","editor.entity_warning":"Selected entity does not appear to contain weather alert data.","editor.no_entities_hint":"No supported weather alert entities found. A provider integration (e.g. NWS Alerts) must be installed first.","editor.no_entities_hint_link":"Supported providers","editor.feeds":"Auto-collect from installed feeds","editor.feeds_helper":"Detected integration feeds. Check one to include every live incident it reports \u2014 no per-incident entities to list. Requires the integration to be set up in Home Assistant.","editor.source_hint":"Auto-collecting {count} live incident(s) from the feed \u2014 no entities to list manually.","editor.feeds_missing_warning":"No live data for {feeds}. This feed is enabled but nothing is providing it \u2014 is the integration set up in Home Assistant?","editor.no_device_alerts_hint":"No active alert sensors found under this device yet. The card will populate automatically when CAP Alerts publishes alerts.","editor.section_entity":"Entities & Provider","editor.section_filtering":"Filtering","editor.section_appearance":"Appearance","editor.section_detail_panel":"Detail Panel","editor.section_behavior":"Behavior","editor.section_dismissal":"Dismissal","editor.dismiss_trigger":"Dismiss trigger","editor.dismiss_trigger_button":"Button only","editor.dismiss_trigger_swipe":"Swipe only","editor.dismiss_trigger_both":"Button and swipe","editor.dismiss_button_style":"Button style","editor.dismiss_button_style_icon":"Icon only","editor.dismiss_button_style_labeled":"Icon and label"},$s={"card.no_alerts":"Aucune alerte active.","card.sources_unavailable_named":"{name} indisponible","card.sources_unavailable_count":"{count} sources indisponibles","card.sources_unavailable_one":"Une source est indisponible","card.preview":"Donnees d'exemple","card.read_details":"Lire les details","card.open_source":"Ouvrir la source {provider}","card.zones_count":"{count} zones","card.zone_count_singular":"{count} zone","card.dismiss":"Ignorer","card.dismissed_toast":"Ignor\xE9e : {event}","card.dismissed_toast_undo":"Annuler","card.close":"Fermer","detail.issued":"Emis","detail.onset":"Debut","detail.expires":"Expire","detail.area":"Zone","detail.source":"Source","detail.description":"Description","detail.instructions":"Instructions","progress.start":"Debut","progress.now":"Maint.","progress.end":"Fin","progress.ongoing":"En cours","progress.expires_in_label":"Expire dans","progress.starts_in_label":"Commence dans","progress.tbd":"Ind.","progress.na":"N/D","progress.expired_label":"Expir\xE9","progress.compact_active":"pour {time}","progress.compact_prep":"dans {time}","progress.compact_ongoing":"en cours","progress.compact_expired":"expir\xE9 il y a {time}","time.just_now":"a l'instant","time.in_less_than_1m":"dans <1m","time.minutes_ago":"il y a {m}m","time.in_minutes":"dans {m}m","time.hours_ago":"il y a {dur}","time.in_hours":"dans {dur}","time.days_ago":"il y a {d}j","time.in_days":"dans {d}j","badge.severity_extreme":"Extr\xEAme","badge.severity_severe":"Grave","badge.severity_moderate":"Mod\xE9r\xE9e","badge.severity_minor":"Mineure","badge.severity_unknown":"Inconnue","badge.certainty_observed":"Observ\xE9e","badge.certainty_likely":"Probable","badge.certainty_possible":"Possible","badge.certainty_unlikely":"Improbable","badge.certainty_unknown":"Inconnue","editor.entities":"Entites","editor.title":"Titre (optionnel)","editor.provider":"Fournisseur d'alertes","editor.provider_auto":"Detection auto","editor.provider_nws":"NWS (Etats-Unis)","editor.provider_bom":"BoM (Australie)","editor.provider_meteoalarm":"MeteoAlarm (Europe)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Allemagne)","editor.provider_nina":"NINA (Allemagne, protection civile)","editor.provider_meteoswiss":"MeteoSwiss (Suisse)","editor.provider_eccc":"ECCC (Canada)","editor.provider_nsw_rfs":"NSW RFS (Australie)","editor.provider_cap":"Alertes CAP (multi-region)","editor.device":"Appareil CAP Alerts (optionnel)","editor.device_helper":"Recupere automatiquement chaque capteur d'alerte actif sous cet appareil.","editor.zones":"Zones (optionnel)","editor.zones_helper":"Codes area_id BoM separes par des virgules, ex. NSW_FL049","editor.event_codes":"Codes d'evenement (optionnel)","editor.event_codes_helper":"Codes d'evenement separes par des virgules, ex. TOW, SVW (NWS) ou 31, 95 (DWD)","editor.exclude_event_codes":"Exclure codes d'evenement (optionnel)","editor.exclude_event_codes_helper":"Codes d'evenement a exclure, ex. SCY (NWS) ou 22 (DWD)","editor.sort_order":"Ordre de tri","editor.sort_default":"Par defaut","editor.sort_onset":"Heure de debut","editor.sort_severity":"Gravite","editor.color_theme":"Theme de couleur","editor.color_severity":"Base sur la gravite","editor.color_nws":"NWS officiel","editor.color_meteoalarm":"MeteoAlarm Vigilance","editor.color_eccc":"Alertes publiques ECCC","editor.timezone":"Fuseau horaire","editor.tz_server":"Serveur (Home Assistant)","editor.tz_browser":"Navigateur (appareil local)","editor.min_severity":"Gravite minimale","editor.severity_all":"Toutes les gravites","editor.severity_minor":"Mineure ou plus","editor.severity_moderate":"Moderee ou plus","editor.severity_severe":"Grave ou plus","editor.severity_extreme":"Extreme uniquement","editor.animations":"Activer les animations","editor.enhance_contrast":"Am\xE9liorer le contraste","editor.enhance_contrast_off":"D\xE9sactiv\xE9","editor.enhance_contrast_subtle":"Subtil (par d\xE9faut)","editor.enhance_contrast_strict":"Strict (WCAG AA)","editor.deduplicate":"Dedupliquer les alertes","editor.deduplicate_headlines":"D\xE9dupliquer les titres","editor.show_details":"Afficher le panneau de details","editor.expand_details":"Toujours afficher les details","editor.show_metadata":"Afficher les metadonnees","editor.show_description":"Afficher la description","editor.show_instructions":"Afficher les instructions","editor.show_geometry":"Afficher la carte de zone","editor.geometry_style":"Style de la carte de zone","editor.geometry_style_shape":"Contour uniquement","editor.geometry_style_map":"Tuiles cartographiques (en ligne)","editor.show_provider":"Afficher le fournisseur","editor.show_source_link":"Afficher le lien source","editor.reformat_text":"Reformater le texte (supprimer les retours a la ligne)","editor.compact":"Disposition compacte","editor.font_size":"Taille de police","editor.font_size_small":"Petit","editor.font_size_default":"Par d\xE9faut","editor.font_size_large":"Grand","editor.font_size_x_large":"Tr\xE8s grand","editor.progress_fill":"Remplissage de progression","editor.progress_fill_track":"Barre fine","editor.progress_fill_background":"Fond color\xE9","editor.styling_section":"Style de progression et d\u2019ic\xF4ne","editor.progress_style":"D\xE9coration de la barre de progression","editor.progress_style_wash_note":"Sans effet lorsque le remplissage de progression est r\xE9gl\xE9 sur Fond color\xE9 (le fond est toujours uni).","editor.progress_style_preparation":"Pr\xE9paration","editor.progress_style_active":"Active","editor.progress_style_ongoing":"En cours","editor.deco_solid":"Plein","editor.deco_striped":"Ray\xE9","editor.deco_shimmer":"Scintillement","editor.deco_pulse":"Pulsation","editor.icon_border_style":"Bordure de l'anneau d'ic\xF4ne","editor.icon_border_dashed":"Pointill\xE9","editor.icon_border_solid":"Plein","editor.hide_expired":"Masquer les alertes expir\xE9es","editor.hide_no_alerts":"Masquer la carte sans alertes","editor.unavailable_behavior":"Quand une source est indisponible","editor.unavailable_message":"Afficher la source concern\xE9e","editor.unavailable_compact":"Afficher un indicateur compact","editor.unavailable_hide":"Masquer l'indicateur (d\xE9conseill\xE9)","editor.unavailable_hide_warning":"Masquer l'indicateur peut pr\xE9senter une absence d'alerte alors qu'une source est aveugle \u2014 un capteur indisponible n'est pas une preuve de s\xE9curit\xE9.","editor.tap_action":"Action au clic","editor.tap_action_helper":"D\xE9finir une action au clic remplace l'affichage d\xE9taill\xE9 en ligne sur chaque ligne d'alerte.","editor.tap_default":"D\xE9velopper en ligne (par d\xE9faut)","editor.tap_details":"Fen\xEAtre de d\xE9tails","editor.tap_more_info":"Plus d'infos","editor.tap_navigate":"Naviguer","editor.tap_url":"Ouvrir une URL","editor.tap_toggle":"Basculer","editor.tap_perform_action":"Ex\xE9cuter une action","editor.tap_call_service":"Appeler un service (ancien)","editor.tap_fire_dom_event":"D\xE9clencher un \xE9v\xE9nement DOM","editor.tap_none":"Rien","editor.tap_navigation_path":"Chemin de navigation","editor.tap_url_path":"URL","editor.tap_yaml_managed":"Cette action transporte des donn\xE9es que l'\xE9diteur visuel ne modifie pas. Son YAML existant est pr\xE9serv\xE9 \u2014 modifiez-le dans l'\xE9diteur YAML.","editor.tap_details_expand_hint":"Si \xAB Toujours d\xE9velopper les d\xE9tails \xBB est d\xE9sactiv\xE9, la fen\xEAtre s'ouvre avec sa description derri\xE8re le bouton Lire les d\xE9tails.","editor.allow_dismiss":"Permettre d'ignorer les alertes","editor.show_dismiss_undo":"Afficher une notification d'annulation","editor.dismissed_count":"Ignor\xE9es : {count} alertes.","editor.dismissed_count_singular":"Ignor\xE9e : {count} alerte.","editor.restore_all":"Tout restaurer","editor.show_preview":"Afficher les donnees exemples","editor.preview_hint":"Apercu de la disposition avec des alertes fictives","editor.preview_nudge":"Aucune alerte active \u2014 activez pour previsualiser la disposition.","editor.entity_warning":"L'entite selectionnee ne semble pas contenir de donnees d'alerte meteo.","editor.no_entities_hint":"Aucune entite d'alerte meteo compatible trouvee. Une integration (ex. NWS Alerts) doit etre installee.","editor.no_entities_hint_link":"Fournisseurs supportes","editor.feeds":"Collecte automatique des flux installes","editor.feeds_helper":"Flux d'integration detectes. Cochez-en un pour inclure chaque incident en direct qu'il signale \u2014 aucune entite par incident a lister. Necessite que l'integration soit configuree dans Home Assistant.","editor.source_hint":"Collecte automatique de {count} incident(s) en direct du flux \u2014 aucune entite a lister manuellement.","editor.feeds_missing_warning":"Aucune donnee en direct pour {feeds}. Ce flux est active mais rien ne l'alimente \u2014 l'integration est-elle configuree dans Home Assistant ?","editor.no_device_alerts_hint":"Aucun capteur d'alerte actif trouve sous cet appareil pour le moment. La carte se remplira automatiquement lorsque CAP Alerts publiera des alertes.","editor.section_entity":"Entite et fournisseur","editor.section_filtering":"Filtrage","editor.section_appearance":"Apparence","editor.section_detail_panel":"Panneau de details","editor.section_behavior":"Comportement","editor.section_dismissal":"Masquage","editor.dismiss_trigger":"Declencheur","editor.dismiss_trigger_button":"Bouton uniquement","editor.dismiss_trigger_swipe":"Glissement uniquement","editor.dismiss_trigger_both":"Bouton et glissement","editor.dismiss_button_style":"Style du bouton","editor.dismiss_button_style_icon":"Icone uniquement","editor.dismiss_button_style_labeled":"Icone et texte"},Ss={"card.no_alerts":"Sin alertas activas.","card.sources_unavailable_named":"{name} no disponible","card.sources_unavailable_count":"{count} fuentes no disponibles","card.sources_unavailable_one":"Una fuente no est\xE1 disponible","card.preview":"Datos de ejemplo","card.read_details":"Leer detalles","card.open_source":"Abrir fuente {provider}","card.zones_count":"{count} zonas","card.zone_count_singular":"{count} zona","card.dismiss":"Descartar","card.dismissed_toast":"Descartada: {event}","card.dismissed_toast_undo":"Deshacer","card.close":"Cerrar","detail.issued":"Emitido","detail.onset":"Inicio","detail.expires":"Expira","detail.area":"Area","detail.source":"Fuente","detail.description":"Descripcion","detail.instructions":"Instrucciones","progress.start":"Inicio","progress.now":"Ahora","progress.end":"Fin","progress.ongoing":"En curso","progress.expires_in_label":"Expira en","progress.starts_in_label":"Comienza en","progress.tbd":"Pend.","progress.na":"N/D","progress.expired_label":"Expirada","progress.compact_active":"por {time}","progress.compact_prep":"en {time}","progress.compact_ongoing":"en curso","progress.compact_expired":"expir\xF3 hace {time}","time.just_now":"ahora mismo","time.in_less_than_1m":"en <1m","time.minutes_ago":"hace {m}m","time.in_minutes":"en {m}m","time.hours_ago":"hace {dur}","time.in_hours":"en {dur}","time.days_ago":"hace {d}d","time.in_days":"en {d}d","badge.severity_extreme":"Extrema","badge.severity_severe":"Grave","badge.severity_moderate":"Moderada","badge.severity_minor":"Menor","badge.severity_unknown":"Desconocida","badge.certainty_observed":"Observada","badge.certainty_likely":"Probable","badge.certainty_possible":"Posible","badge.certainty_unlikely":"Improbable","badge.certainty_unknown":"Desconocida","editor.entities":"Entidades","editor.title":"Titulo (opcional)","editor.provider":"Proveedor de alertas","editor.provider_auto":"Deteccion auto","editor.provider_nws":"NWS (Estados Unidos)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Alemania)","editor.provider_nina":"NINA (Alemania, protecci\xF3n civil)","editor.provider_meteoswiss":"MeteoSwiss (Suiza)","editor.provider_eccc":"ECCC (Canad\xE1)","editor.provider_nsw_rfs":"NSW RFS (Australia)","editor.provider_cap":"Alertas CAP (multi-region)","editor.device":"Dispositivo CAP Alerts (opcional)","editor.device_helper":"Incorpora automaticamente cada sensor de alerta activo bajo este dispositivo.","editor.zones":"Zonas (opcional)","editor.zones_helper":"Codigos area_id de BoM separados por comas, ej. NSW_FL049","editor.event_codes":"Codigos de evento (opcional)","editor.event_codes_helper":"Codigos de evento separados por comas, ej. TOW, SVW (NWS) o 31, 95 (DWD)","editor.exclude_event_codes":"Excluir codigos de evento (opcional)","editor.exclude_event_codes_helper":"Codigos de evento a excluir, ej. SCY (NWS) o 22 (DWD)","editor.sort_order":"Orden","editor.sort_default":"Predeterminado","editor.sort_onset":"Hora de inicio","editor.sort_severity":"Gravedad","editor.color_theme":"Tema de color","editor.color_severity":"Basado en gravedad","editor.color_nws":"NWS oficial","editor.color_meteoalarm":"MeteoAlarm Conciencia","editor.color_eccc":"Alertas p\xFAblicas ECCC","editor.timezone":"Zona horaria","editor.tz_server":"Servidor (Home Assistant)","editor.tz_browser":"Navegador (dispositivo local)","editor.min_severity":"Gravedad minima","editor.severity_all":"Todas las gravedades","editor.severity_minor":"Menor o superior","editor.severity_moderate":"Moderada o superior","editor.severity_severe":"Grave o superior","editor.severity_extreme":"Solo extrema","editor.animations":"Activar animaciones","editor.enhance_contrast":"Mejorar contraste","editor.enhance_contrast_off":"Desactivado","editor.enhance_contrast_subtle":"Sutil (por defecto)","editor.enhance_contrast_strict":"Estricto (WCAG AA)","editor.deduplicate":"Deduplicar alertas","editor.deduplicate_headlines":"Deduplicar titulares","editor.show_details":"Mostrar panel de detalles","editor.expand_details":"Siempre expandir detalles","editor.show_metadata":"Mostrar metadatos","editor.show_description":"Mostrar descripcion","editor.show_instructions":"Mostrar instrucciones","editor.show_geometry":"Mostrar mapa de \xE1rea","editor.geometry_style":"Estilo del mapa de \xE1rea","editor.geometry_style_shape":"Solo contorno","editor.geometry_style_map":"Mosaicos de mapa (en l\xEDnea)","editor.show_provider":"Mostrar proveedor","editor.show_source_link":"Mostrar enlace de fuente","editor.reformat_text":"Reformatear texto (eliminar saltos de linea)","editor.compact":"Disposicion compacta","editor.font_size":"Tama\xF1o de fuente","editor.font_size_small":"Peque\xF1o","editor.font_size_default":"Predeterminado","editor.font_size_large":"Grande","editor.font_size_x_large":"Extra grande","editor.progress_fill":"Relleno de progreso","editor.progress_fill_track":"Barra fina","editor.progress_fill_background":"Fondo tenue","editor.styling_section":"Estilo de progreso e icono","editor.progress_style":"Decoraci\xF3n de la barra de progreso","editor.progress_style_wash_note":"Sin efecto cuando el relleno de progreso est\xE1 en Fondo tenue (el fondo siempre es s\xF3lido).","editor.progress_style_preparation":"Preparaci\xF3n","editor.progress_style_active":"Activa","editor.progress_style_ongoing":"En curso","editor.deco_solid":"S\xF3lido","editor.deco_striped":"Rayado","editor.deco_shimmer":"Destello","editor.deco_pulse":"Pulso","editor.icon_border_style":"Borde del anillo del icono","editor.icon_border_dashed":"Discontinuo","editor.icon_border_solid":"S\xF3lido","editor.hide_expired":"Ocultar alertas expiradas","editor.hide_no_alerts":"Ocultar tarjeta sin alertas","editor.unavailable_behavior":"Cuando una fuente no est\xE1 disponible","editor.unavailable_message":"Mostrar qu\xE9 fuente","editor.unavailable_compact":"Mostrar un indicador compacto","editor.unavailable_hide":"Ocultar indicador (no recomendado)","editor.unavailable_hide_warning":"Ocultar el indicador puede presentar una calma total mientras una fuente est\xE1 ciega: un sensor no disponible no es prueba de seguridad.","editor.tap_action":"Acci\xF3n al tocar","editor.tap_action_helper":"Definir cualquier acci\xF3n al tocar sustituye la expansi\xF3n en l\xEDnea en cada fila de alerta.","editor.tap_default":"Expandir en l\xEDnea (predeterminado)","editor.tap_details":"Ventana de detalles","editor.tap_more_info":"M\xE1s informaci\xF3n","editor.tap_navigate":"Navegar","editor.tap_url":"Abrir URL","editor.tap_toggle":"Alternar","editor.tap_perform_action":"Ejecutar acci\xF3n","editor.tap_call_service":"Llamar servicio (heredado)","editor.tap_fire_dom_event":"Disparar evento DOM","editor.tap_none":"Nada","editor.tap_navigation_path":"Ruta de navegaci\xF3n","editor.tap_url_path":"URL","editor.tap_yaml_managed":"Esta acci\xF3n incluye datos que el editor visual no modifica. Su YAML existente se conserva: ed\xEDtelo en el editor YAML.","editor.tap_details_expand_hint":"Con \xABExpandir siempre los detalles\xBB desactivado, la ventana se abre con su descripci\xF3n detr\xE1s del bot\xF3n Leer detalles.","editor.allow_dismiss":"Permitir descartar alertas","editor.show_dismiss_undo":"Mostrar notificaci\xF3n para deshacer","editor.dismissed_count":"Descartadas: {count} alertas.","editor.dismissed_count_singular":"Descartada: {count} alerta.","editor.restore_all":"Restaurar todo","editor.show_preview":"Mostrar datos de ejemplo","editor.preview_hint":"Vista previa con alertas de ejemplo","editor.preview_nudge":"Sin alertas activas \u2014 active para previsualizar el diseno.","editor.entity_warning":"La entidad seleccionada no parece contener datos de alerta meteorologica.","editor.no_entities_hint":"No se encontraron entidades de alerta meteorologica compatibles. Se debe instalar una integracion (ej. NWS Alerts).","editor.no_entities_hint_link":"Proveedores compatibles","editor.feeds":"Recopilar feeds instalados automaticamente","editor.feeds_helper":"Feeds de integracion detectados. Marca uno para incluir cada incidente en vivo que reporta \u2014 sin entidades por incidente que listar. Requiere que la integracion este configurada en Home Assistant.","editor.source_hint":"Recopilando automaticamente {count} incidente(s) en vivo del feed \u2014 sin entidades que listar manualmente.","editor.feeds_missing_warning":"Sin datos en vivo para {feeds}. Este feed esta habilitado pero nada lo proporciona \u2014 \xBFesta la integracion configurada en Home Assistant?","editor.no_device_alerts_hint":"Aun no se encontraron sensores de alerta activos bajo este dispositivo. La tarjeta se rellenara automaticamente cuando CAP Alerts publique alertas.","editor.section_entity":"Entidad y proveedor","editor.section_filtering":"Filtrado","editor.section_appearance":"Apariencia","editor.section_detail_panel":"Panel de detalles","editor.section_behavior":"Comportamiento","editor.section_dismissal":"Descarte","editor.dismiss_trigger":"Disparador","editor.dismiss_trigger_button":"Solo boton","editor.dismiss_trigger_swipe":"Solo deslizamiento","editor.dismiss_trigger_both":"Boton y deslizamiento","editor.dismiss_button_style":"Estilo del boton","editor.dismiss_button_style_icon":"Solo icono","editor.dismiss_button_style_labeled":"Icono y texto"},Ds={"card.no_alerts":"Nessuna allerta attiva.","card.sources_unavailable_named":"{name} non disponibile","card.sources_unavailable_count":"{count} fonti non disponibili","card.sources_unavailable_one":"Una fonte non \xE8 disponibile","card.preview":"Dati di esempio","card.read_details":"Leggi dettagli","card.open_source":"Apri fonte {provider}","card.zones_count":"{count} zone","card.zone_count_singular":"{count} zona","card.dismiss":"Ignora","card.dismissed_toast":"Ignorata: {event}","card.dismissed_toast_undo":"Annulla","card.close":"Chiudi","detail.issued":"Emessa","detail.onset":"Inizio","detail.expires":"Scadenza","detail.area":"Area","detail.source":"Fonte","detail.description":"Descrizione","detail.instructions":"Istruzioni","progress.start":"Inizio","progress.now":"Ora","progress.end":"Fine","progress.ongoing":"In corso","progress.expires_in_label":"Scade tra","progress.starts_in_label":"Inizia tra","progress.tbd":"N.D.","progress.na":"N/D","progress.expired_label":"Scaduta","progress.compact_active":"per {time}","progress.compact_prep":"tra {time}","progress.compact_ongoing":"in corso","progress.compact_expired":"scaduta {time} fa","time.just_now":"proprio ora","time.in_less_than_1m":"in <1m","time.minutes_ago":"{m}m fa","time.in_minutes":"in {m}m","time.hours_ago":"{dur} fa","time.in_hours":"in {dur}","time.days_ago":"{d}g fa","time.in_days":"in {d}g","badge.severity_extreme":"Estrema","badge.severity_severe":"Grave","badge.severity_moderate":"Moderata","badge.severity_minor":"Lieve","badge.severity_unknown":"Sconosciuta","badge.certainty_observed":"Osservata","badge.certainty_likely":"Probabile","badge.certainty_possible":"Possibile","badge.certainty_unlikely":"Improbabile","badge.certainty_unknown":"Sconosciuta","editor.entities":"Entit\xE0","editor.title":"Titolo (opzionale)","editor.provider":"Fornitore allerte","editor.provider_auto":"Rilevamento automatico","editor.provider_nws":"NWS (Stati Uniti)","editor.provider_bom":"BoM (Australia)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Germania)","editor.provider_nina":"NINA (Germania, protezione civile)","editor.provider_meteoswiss":"MeteoSwiss (Svizzera)","editor.provider_eccc":"ECCC (Canada)","editor.provider_nsw_rfs":"NSW RFS (Australia)","editor.provider_cap":"Allerte CAP (multi-regione)","editor.device":"Dispositivo CAP Alerts (opzionale)","editor.device_helper":"Aggiunge automaticamente ogni sensore di allerta attivo sotto questo dispositivo.","editor.zones":"Zone (opzionale)","editor.zones_helper":"Codici area_id BoM separati da virgola, es. NSW_FL049","editor.event_codes":"Codici evento (opzionale)","editor.event_codes_helper":"Codici evento separati da virgola, es. TOW, SVW (NWS) o 31, 95 (DWD)","editor.exclude_event_codes":"Escludi codici evento (opzionale)","editor.exclude_event_codes_helper":"Codici evento da escludere, es. SCY (NWS) o 22 (DWD)","editor.sort_order":"Ordinamento","editor.sort_default":"Predefinito","editor.sort_onset":"Ora di inizio","editor.sort_severity":"Gravit\xE0","editor.color_theme":"Tema colori","editor.color_severity":"Basato sulla gravit\xE0","editor.color_nws":"NWS ufficiale","editor.color_meteoalarm":"MeteoAlarm Livelli","editor.color_eccc":"Allerte pubbliche ECCC","editor.timezone":"Fuso orario","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (dispositivo locale)","editor.min_severity":"Gravit\xE0 minima","editor.severity_all":"Tutte le gravit\xE0","editor.severity_minor":"Lieve o superiore","editor.severity_moderate":"Moderata o superiore","editor.severity_severe":"Grave o superiore","editor.severity_extreme":"Solo estrema","editor.animations":"Abilita animazioni","editor.enhance_contrast":"Migliora contrasto","editor.enhance_contrast_off":"Disattivato","editor.enhance_contrast_subtle":"Sottile (predefinito)","editor.enhance_contrast_strict":"Rigoroso (WCAG AA)","editor.deduplicate":"Deduplica allerte","editor.deduplicate_headlines":"Deduplica titoli","editor.show_details":"Mostra pannello dettagli","editor.expand_details":"Espandi sempre i dettagli","editor.show_metadata":"Mostra metadati","editor.show_description":"Mostra descrizione","editor.show_instructions":"Mostra istruzioni","editor.show_geometry":"Mostra mappa area","editor.geometry_style":"Stile mappa area","editor.geometry_style_shape":"Solo contorno","editor.geometry_style_map":"Tile mappa (online)","editor.show_provider":"Mostra fornitore","editor.show_source_link":"Mostra link alla fonte","editor.reformat_text":"Riformatta testo (rimuovi interruzioni di riga)","editor.compact":"Layout compatto","editor.font_size":"Dimensione testo","editor.font_size_small":"Piccolo","editor.font_size_default":"Predefinito","editor.font_size_large":"Grande","editor.font_size_x_large":"Molto grande","editor.progress_fill":"Riempimento avanzamento","editor.progress_fill_track":"Barra sottile","editor.progress_fill_background":"Sfondo colorato","editor.styling_section":"Stile avanzamento e icona","editor.progress_style":"Decorazione barra di avanzamento","editor.progress_style_wash_note":"Non applicata quando il riempimento avanzamento \xE8 impostato su Sfondo colorato (lo sfondo \xE8 sempre pieno).","editor.progress_style_preparation":"Preparazione","editor.progress_style_active":"Attiva","editor.progress_style_ongoing":"In corso","editor.deco_solid":"Pieno","editor.deco_striped":"Righe","editor.deco_shimmer":"Bagliore","editor.deco_pulse":"Pulsazione","editor.icon_border_style":"Bordo dell'anello dell'icona","editor.icon_border_dashed":"Tratteggiato","editor.icon_border_solid":"Pieno","editor.hide_expired":"Nascondi allerte scadute","editor.hide_no_alerts":"Nascondi scheda senza allerte","editor.unavailable_behavior":"Quando una fonte non \xE8 disponibile","editor.unavailable_message":"Mostra quale fonte","editor.unavailable_compact":"Mostra un indicatore compatto","editor.unavailable_hide":"Nascondi indicatore (sconsigliato)","editor.unavailable_hide_warning":"Nascondere l'indicatore pu\xF2 presentare un cessato allarme mentre una fonte \xE8 cieca: un sensore non disponibile non \xE8 prova di sicurezza.","editor.tap_action":"Azione al tocco","editor.tap_action_helper":"Impostare una qualsiasi azione al tocco sostituisce l'espansione in linea su ogni riga di allerta.","editor.tap_default":"Espansione in linea (predefinito)","editor.tap_details":"Finestra dei dettagli","editor.tap_more_info":"Maggiori informazioni","editor.tap_navigate":"Naviga","editor.tap_url":"Apri URL","editor.tap_toggle":"Attiva/disattiva","editor.tap_perform_action":"Esegui azione","editor.tap_call_service":"Chiama servizio (obsoleto)","editor.tap_fire_dom_event":"Genera evento DOM","editor.tap_none":"Niente","editor.tap_navigation_path":"Percorso di navigazione","editor.tap_url_path":"URL","editor.tap_yaml_managed":"Questa azione trasporta dati che l'editor visuale non modifica. Il suo YAML esistente viene conservato: modificalo nell'editor YAML.","editor.tap_details_expand_hint":"Con \xABEspandi sempre i dettagli\xBB disattivato, la finestra si apre con la descrizione dietro il pulsante Leggi i dettagli.","editor.allow_dismiss":"Consenti di ignorare le allerte","editor.show_dismiss_undo":"Mostra notifica di annullamento","editor.dismissed_count":"Ignorate: {count} allerte.","editor.dismissed_count_singular":"Ignorata: {count} allerta.","editor.restore_all":"Ripristina tutto","editor.show_preview":"Mostra dati di esempio","editor.preview_hint":"Anteprima del layout con allerte di esempio","editor.preview_nudge":"Nessuna allerta attiva \u2014 attiva per visualizzare il layout.","editor.entity_warning":"L'entit\xE0 selezionata non sembra contenere dati di allerta meteo.","editor.no_entities_hint":"Nessuna entita di allerta meteo compatibile trovata. Un'integrazione (es. NWS Alerts) deve essere installata.","editor.no_entities_hint_link":"Provider supportati","editor.feeds":"Raccolta automatica dai feed installati","editor.feeds_helper":"Feed di integrazione rilevati. Selezionane uno per includere ogni incidente in tempo reale che segnala \u2014 nessuna entita per incidente da elencare. Richiede che l'integrazione sia configurata in Home Assistant.","editor.source_hint":"Raccolta automatica di {count} incident(i) in tempo reale dal feed \u2014 nessuna entita da elencare manualmente.","editor.feeds_missing_warning":"Nessun dato in tempo reale per {feeds}. Questo feed e abilitato ma nulla lo fornisce \u2014 l'integrazione e configurata in Home Assistant?","editor.no_device_alerts_hint":"Nessun sensore di allerta attivo trovato sotto questo dispositivo per ora. La scheda si popolera automaticamente quando CAP Alerts pubblichera delle allerte.","editor.section_entity":"Entit\xE0 e fornitore","editor.section_filtering":"Filtraggio","editor.section_appearance":"Aspetto","editor.section_detail_panel":"Pannello dettagli","editor.section_behavior":"Comportamento","editor.section_dismissal":"Dismissione","editor.dismiss_trigger":"Attivatore","editor.dismiss_trigger_button":"Solo pulsante","editor.dismiss_trigger_swipe":"Solo scorrimento","editor.dismiss_trigger_both":"Pulsante e scorrimento","editor.dismiss_button_style":"Stile pulsante","editor.dismiss_button_style_icon":"Solo icona","editor.dismiss_button_style_labeled":"Icona e testo"},Fs={"card.no_alerts":"Keine aktiven Warnungen.","card.sources_unavailable_named":"{name} nicht verf\xFCgbar","card.sources_unavailable_count":"{count} Quellen nicht verf\xFCgbar","card.sources_unavailable_one":"Eine Quelle ist nicht verf\xFCgbar","card.preview":"Beispieldaten","card.read_details":"Details lesen","card.open_source":"{provider}-Quelle \xF6ffnen","card.zones_count":"{count} Zonen","card.zone_count_singular":"{count} Zone","card.dismiss":"Ausblenden","card.dismissed_toast":"Ausgeblendet: {event}","card.dismissed_toast_undo":"R\xFCckg\xE4ngig","card.close":"Schlie\xDFen","detail.issued":"Ausgegeben","detail.onset":"Beginn","detail.expires":"Ablauf","detail.area":"Gebiet","detail.source":"Quelle","detail.description":"Beschreibung","detail.instructions":"Hinweise","progress.start":"Start","progress.now":"Jetzt","progress.end":"Ende","progress.ongoing":"Laufend","progress.expires_in_label":"Endet in","progress.starts_in_label":"Beginnt in","progress.tbd":"Offen","progress.na":"K. A.","progress.expired_label":"Abgelaufen","progress.compact_active":"f\xFCr {time}","progress.compact_prep":"in {time}","progress.compact_ongoing":"laufend","progress.compact_expired":"abgelaufen vor {time}","time.just_now":"gerade eben","time.in_less_than_1m":"in <1 Min","time.minutes_ago":"vor {m} Min","time.in_minutes":"in {m} Min","time.hours_ago":"vor {dur}","time.in_hours":"in {dur}","time.days_ago":"vor {d} T","time.in_days":"in {d} T","badge.severity_extreme":"Extrem","badge.severity_severe":"Schwer","badge.severity_moderate":"M\xE4\xDFig","badge.severity_minor":"Gering","badge.severity_unknown":"Unbekannt","badge.certainty_observed":"Beobachtet","badge.certainty_likely":"Wahrscheinlich","badge.certainty_possible":"M\xF6glich","badge.certainty_unlikely":"Unwahrscheinlich","badge.certainty_unknown":"Unbekannt","editor.entities":"Entit\xE4ten","editor.title":"Titel (optional)","editor.provider":"Warnanbieter","editor.provider_auto":"Automatisch erkennen","editor.provider_nws":"NWS (USA)","editor.provider_bom":"BoM (Australien)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Deutschland)","editor.provider_nina":"NINA (Deutschland, Bev\xF6lkerungsschutz)","editor.provider_meteoswiss":"MeteoSwiss (Schweiz)","editor.provider_eccc":"ECCC (Kanada)","editor.provider_nsw_rfs":"NSW RFS (Australien)","editor.provider_cap":"CAP-Warnungen (multi-regional)","editor.device":"CAP-Alerts-Ger\xE4t (optional)","editor.device_helper":"Bezieht automatisch jeden aktiven Warnsensor unter diesem Ger\xE4t ein.","editor.zones":"Zonen (optional)","editor.zones_helper":"Kommagetrennte BoM area_id-Codes, z. B. NSW_FL049","editor.event_codes":"Ereigniscodes (optional)","editor.event_codes_helper":"Kommagetrennte Ereigniscodes, z. B. TOW, SVW (NWS) oder 31, 95 (DWD)","editor.exclude_event_codes":"Ereigniscodes ausschlie\xDFen (optional)","editor.exclude_event_codes_helper":"Ereigniscodes zum Ausschlie\xDFen, z. B. SCY (NWS) oder 22 (DWD)","editor.sort_order":"Sortierung","editor.sort_default":"Standard","editor.sort_onset":"Beginnzeit","editor.sort_severity":"Schweregrad","editor.color_theme":"Farbschema","editor.color_severity":"Nach Schweregrad","editor.color_nws":"NWS offiziell","editor.color_meteoalarm":"MeteoAlarm Warnstufen","editor.color_eccc":"ECCC \xF6ffentliche Warnungen","editor.timezone":"Zeitzone","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (lokales Ger\xE4t)","editor.min_severity":"Mindestschweregrad","editor.severity_all":"Alle Schweregrade","editor.severity_minor":"Gering oder h\xF6her","editor.severity_moderate":"M\xE4\xDFig oder h\xF6her","editor.severity_severe":"Schwer oder h\xF6her","editor.severity_extreme":"Nur extrem","editor.animations":"Animationen aktivieren","editor.enhance_contrast":"Kontrast erh\xF6hen","editor.enhance_contrast_off":"Aus","editor.enhance_contrast_subtle":"Dezent (Standard)","editor.enhance_contrast_strict":"Streng (WCAG AA)","editor.deduplicate":"Warnungen deduplizieren","editor.deduplicate_headlines":"\xDCberschriften deduplizieren","editor.show_details":"Detailbereich anzeigen","editor.expand_details":"Details immer anzeigen","editor.show_metadata":"Metadaten anzeigen","editor.show_description":"Beschreibung anzeigen","editor.show_instructions":"Hinweise anzeigen","editor.show_geometry":"Gebietskarte anzeigen","editor.geometry_style":"Gebietskartenstil","editor.geometry_style_shape":"Nur Umriss","editor.geometry_style_map":"Kartenkacheln (online)","editor.show_provider":"Anbieter anzeigen","editor.show_source_link":"Quelllink anzeigen","editor.reformat_text":"Text umformatieren (harte Zeilenumbr\xFCche entfernen)","editor.compact":"Kompaktes Layout","editor.font_size":"Schriftgr\xF6\xDFe","editor.font_size_small":"Klein","editor.font_size_default":"Standard","editor.font_size_large":"Gro\xDF","editor.font_size_x_large":"Sehr gro\xDF","editor.progress_fill":"Fortschrittsf\xFCllung","editor.progress_fill_track":"D\xFCnner Balken","editor.progress_fill_background":"Hintergrund-F\xFCllung","editor.styling_section":"Fortschritts- & Symbolstil","editor.progress_style":"Fortschrittsbalken-Dekoration","editor.progress_style_wash_note":"Ohne Wirkung, wenn die Fortschrittsf\xFCllung auf Hintergrund-F\xFCllung steht (die F\xFCllung ist immer einfarbig).","editor.progress_style_preparation":"Vorbereitung","editor.progress_style_active":"Aktiv","editor.progress_style_ongoing":"Laufend","editor.deco_solid":"Einfarbig","editor.deco_striped":"Gestreift","editor.deco_shimmer":"Schimmer","editor.deco_pulse":"Puls","editor.icon_border_style":"Symbolring-Rahmen","editor.icon_border_dashed":"Gestrichelt","editor.icon_border_solid":"Durchgezogen","editor.hide_expired":"Abgelaufene Warnungen ausblenden","editor.hide_no_alerts":"Karte ohne aktive Warnungen ausblenden","editor.unavailable_behavior":"Wenn eine Quelle nicht verf\xFCgbar ist","editor.unavailable_message":"Betroffene Quelle anzeigen","editor.unavailable_compact":"Kompakten Hinweis anzeigen","editor.unavailable_hide":"Anzeige ausblenden (nicht empfohlen)","editor.unavailable_hide_warning":"Das Ausblenden der Anzeige kann Entwarnung signalisieren, w\xE4hrend eine Quelle blind ist \u2014 ein nicht verf\xFCgbarer Sensor ist kein Beweis f\xFCr Sicherheit.","editor.tap_action":"Aktion beim Tippen","editor.tap_action_helper":"Eine beliebige Tipp-Aktion ersetzt das Aufklappen der Details in jeder Warnungszeile.","editor.tap_default":"Inline aufklappen (Standard)","editor.tap_details":"Detail-Dialog","editor.tap_more_info":"Weitere Informationen","editor.tap_navigate":"Navigieren","editor.tap_url":"URL \xF6ffnen","editor.tap_toggle":"Umschalten","editor.tap_perform_action":"Aktion ausf\xFChren","editor.tap_call_service":"Dienst aufrufen (veraltet)","editor.tap_fire_dom_event":"DOM-Ereignis ausl\xF6sen","editor.tap_none":"Nichts","editor.tap_navigation_path":"Navigationspfad","editor.tap_url_path":"URL","editor.tap_yaml_managed":"Diese Aktion enth\xE4lt Daten, die der visuelle Editor nicht bearbeitet. Das vorhandene YAML bleibt erhalten \u2014 bearbeite es im YAML-Editor.","editor.tap_details_expand_hint":'Wenn \u201EDetails immer aufklappen" deaktiviert ist, \xF6ffnet sich der Dialog mit der Beschreibung hinter der Schaltfl\xE4che \u201EDetails lesen".',"editor.allow_dismiss":"Warnungen ausblendbar machen","editor.show_dismiss_undo":"R\xFCckg\xE4ngig-Benachrichtigung anzeigen","editor.dismissed_count":"Ausgeblendet: {count} Warnungen.","editor.dismissed_count_singular":"Ausgeblendet: {count} Warnung.","editor.restore_all":"Alle wiederherstellen","editor.show_preview":"Beispieldaten anzeigen","editor.preview_hint":"Kartenlayout mit Beispielwarnungen anzeigen","editor.preview_nudge":"Keine aktiven Warnungen \u2014 aktivieren, um das Kartenlayout zu sehen.","editor.entity_warning":"Die ausgew\xE4hlte Entit\xE4t scheint keine Wetterwarnungsdaten zu enthalten.","editor.no_entities_hint":"Keine kompatiblen Wetterwarnungs-Entitaten gefunden. Eine Integration (z.B. NWS Alerts) muss installiert sein.","editor.no_entities_hint_link":"Unterstutzte Anbieter","editor.feeds":"Automatisch aus installierten Feeds erfassen","editor.feeds_helper":"Erkannte Integrations-Feeds. Wahlen Sie einen aus, um jedes gemeldete Live-Ereignis einzuschliessen \u2014 keine Entitaten pro Ereignis aufzulisten. Erfordert, dass die Integration in Home Assistant eingerichtet ist.","editor.source_hint":"Automatische Erfassung von {count} Live-Ereignis(sen) aus dem Feed \u2014 keine Entitaten manuell aufzulisten.","editor.feeds_missing_warning":"Keine Live-Daten fur {feeds}. Dieser Feed ist aktiviert, aber nichts liefert Daten \u2014 ist die Integration in Home Assistant eingerichtet?","editor.no_device_alerts_hint":"Noch keine aktiven Warnsensoren unter diesem Gerat gefunden. Die Karte fullt sich automatisch, sobald CAP Alerts Warnungen veroffentlicht.","editor.section_entity":"Entit\xE4t und Anbieter","editor.section_filtering":"Filterung","editor.section_appearance":"Darstellung","editor.section_detail_panel":"Detailbereich","editor.section_behavior":"Verhalten","editor.section_dismissal":"Ausblenden","editor.dismiss_trigger":"Ausl\xF6ser","editor.dismiss_trigger_button":"Nur Schaltfl\xE4che","editor.dismiss_trigger_swipe":"Nur wischen","editor.dismiss_trigger_both":"Schaltfl\xE4che und wischen","editor.dismiss_button_style":"Schaltfl\xE4chenstil","editor.dismiss_button_style_icon":"Nur Symbol","editor.dismiss_button_style_labeled":"Symbol und Text"},ks={"card.no_alerts":"Geen actieve alerts.","card.sources_unavailable_named":"{name} niet beschikbaar","card.sources_unavailable_count":"{count} bronnen niet beschikbaar","card.sources_unavailable_one":"Een bron is niet beschikbaar","card.preview":"Voorbeeld Data","card.read_details":"Meer Details","card.open_source":"Open bron van {provider}","card.zones_count":"{count} zones","card.zone_count_singular":"{count} zone","card.dismiss":"Negeren","card.dismissed_toast":"Genegeerd: {event}","card.dismissed_toast_undo":"Maak ongedaan","card.close":"Sluiten","detail.issued":"Uitgegeven","detail.onset":"Begin","detail.expires":"Verloopt","detail.area":"Gebied","detail.source":"Bron","detail.description":"Beschrijving","detail.instructions":"Instructies","progress.start":"Gestart","progress.now":"Nu","progress.end":"Einde","progress.ongoing":"Lopend","progress.expires_in_label":"Verloopt over","progress.starts_in_label":"Begint over","progress.tbd":"N.t.b.","progress.na":"N/A","progress.expired_label":"Verlopen","progress.compact_active":"Gedurende {time}","progress.compact_prep":"over {time}","progress.compact_ongoing":"lopend","progress.compact_expired":"{time} geleden verlopen","time.just_now":"zojuist","time.in_less_than_1m":"binnen 1m","time.minutes_ago":"{m}m geleden","time.in_minutes":"over {m}m","time.hours_ago":"{dur} geleden","time.in_hours":"over {dur}","time.days_ago":"{d}d geleden","time.in_days":"over {d}d","badge.severity_extreme":"Extreem","badge.severity_severe":"Ernstig","badge.severity_moderate":"Matig","badge.severity_minor":"Licht","badge.severity_unknown":"Onbekend","badge.certainty_observed":"Waargenomen","badge.certainty_likely":"Waarschijnlijk","badge.certainty_possible":"Mogelijk","badge.certainty_unlikely":"Onwaarschijnlijk","badge.certainty_unknown":"Onbekend","editor.entities":"Entiteiten","editor.title":"Titel (optioneel)","editor.provider":"Alert provider","editor.provider_auto":"Automatisch detecteren","editor.provider_nws":"NWS (Verenigde Staten)","editor.provider_bom":"BoM (Australi\xEB)","editor.provider_meteoalarm":"MeteoAlarm (Europa)","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD (Duitsland)","editor.provider_nina":"NINA (Duitsland, civiele bescherming)","editor.provider_meteoswiss":"MeteoSwiss (Zwitserland)","editor.provider_eccc":"ECCC (Canada)","editor.provider_nsw_rfs":"NSW RFS (Australi\xEB)","editor.provider_cap":"CAP Alerts (meerdere regio's)","editor.device":"CAP Alerts-apparaat (optioneel)","editor.device_helper":"Haalt automatisch elke actieve waarschuwingssensor onder dit apparaat binnen.","editor.zones":"Zones (optioneel)","editor.zones_helper":"Comma-separated BoM area_id codes, e.g. NSW_FL049","editor.event_codes":"Gebeurteniscodes (optioneel)","editor.event_codes_helper":"Comma-separated event codes, e.g. TOW, SVW (NWS) or 31, 95 (DWD)","editor.exclude_event_codes":"Gebeurteniscodes uitsluiten (optioneel)","editor.exclude_event_codes_helper":"Comma-separated event codes to exclude, e.g. SCY (NWS) or 22 (DWD)","editor.sort_order":"Sorteervolgorde","editor.sort_default":"Standaard","editor.sort_onset":"Begintijd","editor.sort_severity":"Ernst","editor.color_theme":"Kleurthema","editor.color_severity":"Op basis van ernst","editor.color_nws":"NWS Officieel","editor.color_meteoalarm":"MeteoAlarm Bewustwording","editor.color_eccc":"ECCC Publieke Waarschuwingen","editor.timezone":"Tijdzone","editor.tz_server":"Server (Home Assistant)","editor.tz_browser":"Browser (lokaal apparaat)","editor.min_severity":"Minimale ernst","editor.severity_all":"Alle gradaties","editor.severity_minor":"Licht of hoger","editor.severity_moderate":"Matig of hoger","editor.severity_severe":"Ernstig of hoger","editor.severity_extreme":"Alleen extreem","editor.animations":"Animaties inschakelen","editor.enhance_contrast":"Contrast verbeteren","editor.enhance_contrast_off":"Uit","editor.enhance_contrast_subtle":"Subtiel (standaard)","editor.enhance_contrast_strict":"Strikt (WCAG AA)","editor.deduplicate":"Waarschuwingen ontdubbelen","editor.deduplicate_headlines":"Kopteksten ontdubbelen","editor.show_details":"Detailpaneel tonen","editor.expand_details":"Details altijd uitklappen","editor.show_metadata":"Metadata tonen","editor.show_description":"Beschrijving tonen","editor.show_instructions":"Instructies tonen","editor.show_geometry":"Gebiedskaart tonen","editor.geometry_style":"Stijl gebiedskaart","editor.geometry_style_shape":"Alleen omlijning","editor.geometry_style_map":"Kaarttegels (online)","editor.show_provider":"Providerlabel tonen","editor.show_source_link":"Bronlink tonen","editor.reformat_text":"Tekst automatisch omloop geven (harde afbrekingen verwijderen)","editor.compact":"Compacte lay-out","editor.font_size":"Lettergrootte","editor.font_size_small":"Klein","editor.font_size_default":"Standaard","editor.font_size_large":"Groot","editor.font_size_x_large":"Extra groot","editor.progress_fill":"Voortgangsinvulling","editor.progress_fill_track":"Spoor (dunne balk)","editor.progress_fill_background":"Achtergrondgloed","editor.styling_section":"Stijl van voortgang & icoon","editor.progress_style":"Decoratie voortgangsbalk","editor.progress_style_wash_note":"Wordt niet toegepast als Voortgangsinvulling is ingesteld op Achtergrondgloed (de gloed is altijd effen).","editor.progress_style_preparation":"Voorbereiding","editor.progress_style_active":"Actief","editor.progress_style_ongoing":"Lopend","editor.deco_solid":"Effen","editor.deco_striped":"Gestreept","editor.deco_shimmer":"Schittering","editor.deco_pulse":"Pulseren","editor.icon_border_style":"Icoon grensrand","editor.icon_border_dashed":"Gestreept","editor.icon_border_solid":"Effen","editor.hide_expired":"Verlopen waarschuwingen verbergen","editor.hide_no_alerts":"Kaart verbergen als er geen actieve waarschuwingen zijn","editor.unavailable_behavior":"Wanneer een bron niet beschikbaar is","editor.unavailable_message":"Toon welke bron","editor.unavailable_compact":"Toon een compacte indicator","editor.unavailable_hide":"Indicator verbergen (niet aanbevolen)","editor.unavailable_hide_warning":"Het verbergen van de indicator kan een vals gevoel van veiligheid geven terwijl een bron blind is \u2014 een onbeschikbare sensor is geen bewijs van veiligheid.","editor.tap_action":"Tik-actie","editor.tap_action_helper":"Het instellen van een tik-actie vervangt de inline uitklapmogelijkheid op elke waarschuwingsregel.","editor.tap_default":"Inline uitklappen (standaard)","editor.tap_details":"Detail pop-up","editor.tap_more_info":"Meer info","editor.tap_navigate":"Navigeren","editor.tap_url":"URL openen","editor.tap_toggle":"Schakelen","editor.tap_perform_action":"Actie uitvoeren","editor.tap_call_service":"Service aanroepen (verouderd)","editor.tap_fire_dom_event":"DOM-event afvuren","editor.tap_none":"Niets","editor.tap_navigation_path":"Navigatiepad","editor.tap_url_path":"URL","editor.tap_yaml_managed":"Deze actie bevat gegevens die de visuele editor niet bewerkt. De bestaande YAML blijft behouden \u2014 bewerk deze in de YAML-editor.","editor.tap_details_expand_hint":'Als "Details altijd uitklappen" is uitgeschakeld, opent de pop-up met de beschrijving achter de knop Meer Details.',"editor.allow_dismiss":"Toestaan van afwijzen waarschuwingen","editor.show_dismiss_undo":"Toon ongedaan maken-notificatie bij afwijzen","editor.dismissed_count":"Afgewezen: {count} waarschuwingen.","editor.dismissed_count_singular":"Afgewezen: {count} waarschuwing.","editor.restore_all":"Alles herstellen","editor.show_preview":"Voorbeelddata tonen","editor.preview_hint":"Voorbeeld van kaartlay-out met testwaarschuwingen","editor.preview_nudge":"Geen actieve waarschuwingen \u2014 inschakelen om de lay-out van de kaart te bekijken.","editor.entity_warning":"Geselecteerde entiteit lijkt geen weerwaarschuwingsgegevens te bevatten.","editor.no_entities_hint":"Geen ondersteunde weerwaarschuwingsentiteiten gevonden. Er moet eerst een provider-integratie (bijv. NWS Alerts) worden ge\xEFnstalleerd.","editor.no_entities_hint_link":"Ondersteunde providers","editor.feeds":"Automatisch verzamelen van ge\xEFnstalleerde feeds","editor.feeds_helper":"Gedetecteerde integratie-feeds. Vink er een aan om elk live incident op te nemen dat deze rapporteert \u2014 geen entiteiten per incident te vermelden. Vereist dat de integratie is ingesteld in Home Assistant.","editor.source_hint":"Automatisch verzamelen van {count} live incident(en) uit de feed \u2014 geen entiteiten om handmatig te vermelden.","editor.feeds_missing_warning":"Geen live gegevens voor {feeds}. Deze feed is ingeschakeld maar niets levert gegevens \u2014 is de integratie ingesteld in Home Assistant?","editor.no_device_alerts_hint":"Nog geen actieve waarschuwingssensoren gevonden onder dit apparaat. De kaart wordt automatisch gevuld wanneer CAP Alerts waarschuwingen publiceert.","editor.section_entity":"Entiteiten & Provider","editor.section_filtering":"Filteren","editor.section_appearance":"Weergave","editor.section_detail_panel":"Detailpaneel","editor.section_behavior":"Gedrag","editor.section_dismissal":"Afwijzen","editor.dismiss_trigger":"Actie voor afwijzen","editor.dismiss_trigger_button":"Alleen knop","editor.dismiss_trigger_swipe":"Alleen swipen","editor.dismiss_trigger_both":"Knop en swipen","editor.dismiss_button_style":"Knopstijl","editor.dismiss_button_style_icon":"Alleen icoon","editor.dismiss_button_style_labeled":"Icoon en label"},Ts={"card.no_alerts":"\u65E0\u6D3B\u8DC3\u8B66\u62A5\u3002","card.sources_unavailable_named":"{name} \u4E0D\u53EF\u7528","card.sources_unavailable_count":"{count} \u4E2A\u6765\u6E90\u4E0D\u53EF\u7528","card.sources_unavailable_one":"\u4E00\u4E2A\u6765\u6E90\u4E0D\u53EF\u7528","card.preview":"\u793A\u4F8B\u6570\u636E","card.read_details":"\u67E5\u770B\u8BE6\u60C5","card.open_source":"\u6253\u5F00 {provider} \u6765\u6E90","card.zones_count":"{count} \u4E2A\u533A\u57DF","card.zone_count_singular":"{count} \u4E2A\u533A\u57DF","card.dismiss":"\u5FFD\u7565","card.dismissed_toast":"\u5DF2\u5FFD\u7565\uFF1A{event}","card.dismissed_toast_undo":"\u64A4\u9500","card.close":"\u5173\u95ED","detail.issued":"\u53D1\u5E03\u65F6\u95F4","detail.onset":"\u5F00\u59CB\u65F6\u95F4","detail.expires":"\u8FC7\u671F\u65F6\u95F4","detail.area":"\u533A\u57DF","detail.source":"\u6765\u6E90","detail.description":"\u63CF\u8FF0","detail.instructions":"\u8BF4\u660E","progress.start":"\u5F00\u59CB","progress.now":"\u73B0\u5728","progress.end":"\u7ED3\u675F","progress.ongoing":"\u8FDB\u884C\u4E2D","progress.expires_in_label":"\u5C06\u4E8E\u4EE5\u4E0B\u65F6\u95F4\u540E\u8FC7\u671F","progress.starts_in_label":"\u5C06\u4E8E\u4EE5\u4E0B\u65F6\u95F4\u540E\u5F00\u59CB","progress.tbd":"\u5F85\u5B9A","progress.na":"\u4E0D\u9002\u7528","progress.expired_label":"\u5DF2\u8FC7\u671F","progress.compact_active":"\u6301\u7EED {time}","progress.compact_prep":"{time} \u540E\u5F00\u59CB","progress.compact_ongoing":"\u8FDB\u884C\u4E2D","progress.compact_expired":"\u5DF2\u4E8E {time} \u524D\u8FC7\u671F","time.just_now":"\u521A\u521A","time.in_less_than_1m":"1\u5206\u949F\u5185","time.minutes_ago":"{m} \u5206\u949F\u524D","time.in_minutes":"{m} \u5206\u949F\u540E","time.hours_ago":"{dur} \u524D","time.in_hours":"{dur} \u540E","time.days_ago":"{d} \u5929\u524D","time.in_days":"{d} \u5929\u540E","badge.severity_extreme":"\u6781\u7AEF","badge.severity_severe":"\u4E25\u91CD","badge.severity_moderate":"\u4E2D\u5EA6","badge.severity_minor":"\u8F7B\u5FAE","badge.severity_unknown":"\u672A\u77E5","badge.certainty_observed":"\u5DF2\u89C2\u6D4B","badge.certainty_likely":"\u5F88\u53EF\u80FD","badge.certainty_possible":"\u53EF\u80FD","badge.certainty_unlikely":"\u4E0D\u592A\u53EF\u80FD","badge.certainty_unknown":"\u672A\u77E5","editor.entities":"\u5B9E\u4F53","editor.title":"\u6807\u9898\uFF08\u53EF\u9009\uFF09","editor.provider":"\u8B66\u62A5\u63D0\u4F9B\u65B9","editor.provider_auto":"\u81EA\u52A8\u68C0\u6D4B","editor.provider_nws":"NWS\uFF08\u7F8E\u56FD\uFF09","editor.provider_bom":"BoM\uFF08\u6FB3\u5927\u5229\u4E9A\uFF09","editor.provider_meteoalarm":"MeteoAlarm\uFF08\u6B27\u6D32\uFF09","editor.provider_pirateweather":"PirateWeather","editor.provider_dwd":"DWD\uFF08\u5FB7\u56FD\uFF09","editor.provider_nina":"NINA\uFF08\u5FB7\u56FD\u6C11\u9632\u9884\u8B66\uFF09","editor.provider_meteoswiss":"MeteoSwiss\uFF08\u745E\u58EB\uFF09","editor.provider_eccc":"ECCC\uFF08\u52A0\u62FF\u5927\uFF09","editor.provider_nsw_rfs":"NSW RFS\uFF08\u6FB3\u5927\u5229\u4E9A\uFF09","editor.provider_cap":"CAP \u8B66\u62A5\uFF08\u591A\u533A\u57DF\uFF09","editor.device":"CAP \u8B66\u62A5\u8BBE\u5907\uFF08\u53EF\u9009\uFF09","editor.device_helper":"\u81EA\u52A8\u62C9\u53D6\u8BE5\u8BBE\u5907\u4E0B\u7684\u6240\u6709\u6D3B\u8DC3\u8B66\u62A5\u4F20\u611F\u5668\u3002","editor.zones":"\u533A\u57DF\uFF08\u53EF\u9009\uFF09","editor.zones_helper":"\u4EE5\u9017\u53F7\u5206\u9694\u7684 BoM area_id \u4EE3\u7801\uFF0C\u4F8B\u5982 NSW_FL049","editor.event_codes":"\u4E8B\u4EF6\u4EE3\u7801\uFF08\u53EF\u9009\uFF09","editor.event_codes_helper":"\u4EE5\u9017\u53F7\u5206\u9694\u7684\u4E8B\u4EF6\u4EE3\u7801\uFF0C\u4F8B\u5982 TOW\u3001SVW\uFF08NWS\uFF09\u6216 31\u300195\uFF08DWD\uFF09","editor.exclude_event_codes":"\u6392\u9664\u4E8B\u4EF6\u4EE3\u7801\uFF08\u53EF\u9009\uFF09","editor.exclude_event_codes_helper":"\u4EE5\u9017\u53F7\u5206\u9694\u7684\u8981\u6392\u9664\u7684\u4E8B\u4EF6\u4EE3\u7801\uFF0C\u4F8B\u5982 SCY\uFF08NWS\uFF09\u6216 22\uFF08DWD\uFF09","editor.sort_order":"\u6392\u5E8F\u65B9\u5F0F","editor.sort_default":"\u9ED8\u8BA4","editor.sort_onset":"\u5F00\u59CB\u65F6\u95F4","editor.sort_severity":"\u4E25\u91CD\u7A0B\u5EA6","editor.color_theme":"\u914D\u8272\u4E3B\u9898","editor.color_severity":"\u57FA\u4E8E\u4E25\u91CD\u7A0B\u5EA6","editor.color_nws":"NWS \u5B98\u65B9","editor.color_meteoalarm":"MeteoAlarm \u8BA4\u77E5\u7B49\u7EA7","editor.color_eccc":"ECCC \u516C\u5171\u8B66\u62A5","editor.timezone":"\u65F6\u533A","editor.tz_server":"\u670D\u52A1\u5668\uFF08Home Assistant\uFF09","editor.tz_browser":"\u6D4F\u89C8\u5668\uFF08\u672C\u5730\u8BBE\u5907\uFF09","editor.min_severity":"\u6700\u4F4E\u4E25\u91CD\u7A0B\u5EA6","editor.severity_all":"\u6240\u6709\u4E25\u91CD\u7A0B\u5EA6","editor.severity_minor":"\u8F7B\u5FAE\u53CA\u4EE5\u4E0A","editor.severity_moderate":"\u4E2D\u5EA6\u53CA\u4EE5\u4E0A","editor.severity_severe":"\u4E25\u91CD\u53CA\u4EE5\u4E0A","editor.severity_extreme":"\u4EC5\u6781\u7AEF","editor.animations":"\u542F\u7528\u52A8\u753B","editor.enhance_contrast":"\u589E\u5F3A\u5BF9\u6BD4\u5EA6","editor.enhance_contrast_off":"\u5173\u95ED","editor.enhance_contrast_subtle":"\u67D4\u548C\uFF08\u9ED8\u8BA4\uFF09","editor.enhance_contrast_strict":"\u4E25\u683C\uFF08WCAG AA\uFF09","editor.deduplicate":"\u53BB\u91CD\u8B66\u62A5","editor.deduplicate_headlines":"\u53BB\u91CD\u6807\u9898","editor.show_details":"\u663E\u793A\u8BE6\u60C5\u9762\u677F","editor.expand_details":"\u59CB\u7EC8\u5C55\u5F00\u8BE6\u60C5","editor.show_metadata":"\u663E\u793A\u5143\u6570\u636E","editor.show_description":"\u663E\u793A\u63CF\u8FF0","editor.show_instructions":"\u663E\u793A\u8BF4\u660E","editor.show_geometry":"\u663E\u793A\u533A\u57DF\u5730\u56FE","editor.geometry_style":"\u533A\u57DF\u5730\u56FE\u6837\u5F0F","editor.geometry_style_shape":"\u4EC5\u8F6E\u5ED3","editor.geometry_style_map":"\u5730\u56FE\u74E6\u7247\uFF08\u5728\u7EBF\uFF09","editor.show_provider":"\u663E\u793A\u63D0\u4F9B\u65B9\u6807\u7B7E","editor.show_source_link":"\u663E\u793A\u6765\u6E90\u94FE\u63A5","editor.reformat_text":"\u91CD\u6392\u8B66\u62A5\u6587\u672C\uFF08\u53BB\u9664\u786C\u6362\u884C\uFF09","editor.compact":"\u7D27\u51D1\u5E03\u5C40","editor.font_size":"\u5B57\u4F53\u5927\u5C0F","editor.font_size_small":"\u5C0F","editor.font_size_default":"\u9ED8\u8BA4","editor.font_size_large":"\u5927","editor.font_size_x_large":"\u7279\u5927","editor.progress_fill":"\u8FDB\u5EA6\u586B\u5145","editor.progress_fill_track":"\u8F68\u9053\uFF08\u7EC6\u6761\uFF09","editor.progress_fill_background":"\u80CC\u666F\u8986\u76D6","editor.styling_section":"\u8FDB\u5EA6\u4E0E\u56FE\u6807\u6837\u5F0F","editor.progress_style":"\u8FDB\u5EA6\u6761\u88C5\u9970","editor.progress_style_wash_note":"\u5F53\u8FDB\u5EA6\u586B\u5145\u8BBE\u7F6E\u4E3A\u80CC\u666F\u8986\u76D6\u65F6\u4E0D\u9002\u7528\uFF08\u8986\u76D6\u59CB\u7EC8\u4E3A\u7EAF\u8272\uFF09\u3002","editor.progress_style_preparation":"\u51C6\u5907\u9636\u6BB5","editor.progress_style_active":"\u6D3B\u8DC3\u9636\u6BB5","editor.progress_style_ongoing":"\u6301\u7EED\u9636\u6BB5","editor.deco_solid":"\u7EAF\u8272","editor.deco_striped":"\u6761\u7EB9","editor.deco_shimmer":"\u95EA\u70C1","editor.deco_pulse":"\u8109\u51B2","editor.icon_border_style":"\u56FE\u6807\u73AF\u5F62\u8FB9\u6846","editor.icon_border_dashed":"\u865A\u7EBF","editor.icon_border_solid":"\u5B9E\u7EBF","editor.hide_expired":"\u9690\u85CF\u5DF2\u8FC7\u671F\u8B66\u62A5","editor.hide_no_alerts":"\u65E0\u6D3B\u8DC3\u8B66\u62A5\u65F6\u9690\u85CF\u5361\u7247","editor.unavailable_behavior":"\u5F53\u6765\u6E90\u4E0D\u53EF\u7528\u65F6","editor.unavailable_message":"\u663E\u793A\u54EA\u4E2A\u6765\u6E90","editor.unavailable_compact":"\u663E\u793A\u7D27\u51D1\u6307\u793A\u5668","editor.unavailable_hide":"\u9690\u85CF\u6307\u793A\u5668\uFF08\u4E0D\u63A8\u8350\uFF09","editor.unavailable_hide_warning":"\u9690\u85CF\u6307\u793A\u5668\u53EF\u80FD\u4F1A\u5728\u6765\u6E90\u5931\u6548\u65F6\u5448\u73B0\u4E00\u5207\u6B63\u5E38\u7684\u5047\u8C61\u2014\u2014\u4E0D\u53EF\u7528\u7684\u4F20\u611F\u5668\u5E76\u4E0D\u80FD\u8BC1\u660E\u5B89\u5168\u3002","editor.tap_action":"\u70B9\u51FB\u64CD\u4F5C","editor.tap_action_helper":"\u8BBE\u7F6E\u4EFB\u610F\u70B9\u51FB\u64CD\u4F5C\u540E\uFF0C\u6BCF\u6761\u9884\u8B66\u884C\u7684\u5185\u5D4C\u5C55\u5F00\u529F\u80FD\u5C06\u88AB\u66FF\u4EE3\u3002","editor.tap_default":"\u5185\u5D4C\u5C55\u5F00\uFF08\u9ED8\u8BA4\uFF09","editor.tap_details":"\u8BE6\u60C5\u5F39\u7A97","editor.tap_more_info":"\u66F4\u591A\u4FE1\u606F","editor.tap_navigate":"\u5BFC\u822A","editor.tap_url":"\u6253\u5F00\u7F51\u5740","editor.tap_toggle":"\u5207\u6362","editor.tap_perform_action":"\u6267\u884C\u64CD\u4F5C","editor.tap_call_service":"\u8C03\u7528\u670D\u52A1\uFF08\u65E7\u7248\uFF09","editor.tap_fire_dom_event":"\u89E6\u53D1 DOM \u4E8B\u4EF6","editor.tap_none":"\u65E0","editor.tap_navigation_path":"\u5BFC\u822A\u8DEF\u5F84","editor.tap_url_path":"\u7F51\u5740","editor.tap_yaml_managed":"\u6B64\u64CD\u4F5C\u5305\u542B\u53EF\u89C6\u5316\u7F16\u8F91\u5668\u65E0\u6CD5\u7F16\u8F91\u7684\u6570\u636E\u3002\u5176\u73B0\u6709 YAML \u4F1A\u88AB\u4FDD\u7559\u2014\u2014\u8BF7\u5728 YAML \u7F16\u8F91\u5668\u4E2D\u4FEE\u6539\u3002","editor.tap_details_expand_hint":"\u5F53\u201C\u59CB\u7EC8\u5C55\u5F00\u8BE6\u60C5\u201D\u5173\u95ED\u65F6\uFF0C\u5F39\u7A97\u6253\u5F00\u540E\u63CF\u8FF0\u5185\u5BB9\u4ECD\u4F4D\u4E8E\u201C\u9605\u8BFB\u8BE6\u60C5\u201D\u6309\u94AE\u4E4B\u540E\u3002","editor.allow_dismiss":"\u5141\u8BB8\u5FFD\u7565\u8B66\u62A5","editor.show_dismiss_undo":"\u5FFD\u7565\u65F6\u663E\u793A\u64A4\u9500\u901A\u77E5","editor.dismissed_count":"\u5DF2\u5FFD\u7565\uFF1A{count} \u6761\u8B66\u62A5\u3002","editor.dismissed_count_singular":"\u5DF2\u5FFD\u7565\uFF1A{count} \u6761\u8B66\u62A5\u3002","editor.restore_all":"\u5168\u90E8\u6062\u590D","editor.show_preview":"\u663E\u793A\u793A\u4F8B\u6570\u636E","editor.preview_hint":"\u4F7F\u7528\u793A\u4F8B\u8B66\u62A5\u9884\u89C8\u5361\u7247\u5E03\u5C40","editor.preview_nudge":"\u65E0\u6D3B\u8DC3\u8B66\u62A5\u2014\u2014\u542F\u7528\u4EE5\u9884\u89C8\u5361\u7247\u5E03\u5C40\u3002","editor.entity_warning":"\u6240\u9009\u5B9E\u4F53\u4F3C\u4E4E\u4E0D\u5305\u542B\u5929\u6C14\u8B66\u62A5\u6570\u636E\u3002","editor.no_entities_hint":"\u672A\u627E\u5230\u652F\u6301\u7684\u5929\u6C14\u8B66\u62A5\u5B9E\u4F53\u3002\u5FC5\u987B\u5148\u5B89\u88C5\u63D0\u4F9B\u65B9\u96C6\u6210\uFF08\u4F8B\u5982 NWS Alerts\uFF09\u3002","editor.no_entities_hint_link":"\u652F\u6301\u7684\u63D0\u4F9B\u65B9","editor.feeds":"\u4ECE\u5DF2\u5B89\u88C5\u7684\u8BA2\u9605\u6E90\u81EA\u52A8\u6536\u96C6","editor.feeds_helper":"\u68C0\u6D4B\u5230\u7684\u96C6\u6210\u8BA2\u9605\u6E90\u3002\u52FE\u9009\u4E00\u9879\u5373\u53EF\u5305\u542B\u5176\u62A5\u544A\u7684\u6240\u6709\u5B9E\u65F6\u4E8B\u4EF6\u2014\u2014\u65E0\u9700\u9010\u4E2A\u5217\u51FA\u5B9E\u4F53\u3002\u9700\u8981\u5148\u5728 Home Assistant \u4E2D\u914D\u7F6E\u8BE5\u96C6\u6210\u3002","editor.source_hint":"\u6B63\u4ECE\u8BA2\u9605\u6E90\u81EA\u52A8\u6536\u96C6 {count} \u4E2A\u5B9E\u65F6\u4E8B\u4EF6\u2014\u2014\u65E0\u9700\u624B\u52A8\u5217\u51FA\u5B9E\u4F53\u3002","editor.feeds_missing_warning":"{feeds} \u65E0\u5B9E\u65F6\u6570\u636E\u3002\u8BE5\u8BA2\u9605\u6E90\u5DF2\u542F\u7528\u4F46\u6CA1\u6709\u4EFB\u4F55\u5185\u5BB9\u63D0\u4F9B\u2014\u2014\u662F\u5426\u5728 Home Assistant \u4E2D\u914D\u7F6E\u4E86\u8BE5\u96C6\u6210\uFF1F","editor.no_device_alerts_hint":"\u8BE5\u8BBE\u5907\u4E0B\u5C1A\u672A\u627E\u5230\u6D3B\u8DC3\u8B66\u62A5\u4F20\u611F\u5668\u3002\u5F53 CAP Alerts \u53D1\u5E03\u8B66\u62A5\u65F6\uFF0C\u5361\u7247\u5C06\u81EA\u52A8\u586B\u5145\u3002","editor.section_entity":"\u5B9E\u4F53\u4E0E\u63D0\u4F9B\u65B9","editor.section_filtering":"\u8FC7\u6EE4","editor.section_appearance":"\u5916\u89C2","editor.section_detail_panel":"\u8BE6\u60C5\u9762\u677F","editor.section_behavior":"\u884C\u4E3A","editor.section_dismissal":"\u5FFD\u7565","editor.dismiss_trigger":"\u5FFD\u7565\u89E6\u53D1\u65B9\u5F0F","editor.dismiss_trigger_button":"\u4EC5\u6309\u94AE","editor.dismiss_trigger_swipe":"\u4EC5\u6ED1\u52A8","editor.dismiss_trigger_both":"\u6309\u94AE\u548C\u6ED1\u52A8","editor.dismiss_button_style":"\u6309\u94AE\u6837\u5F0F","editor.dismiss_button_style_icon":"\u4EC5\u56FE\u6807","editor.dismiss_button_style_labeled":"\u56FE\u6807\u548C\u6807\u7B7E"},le={en:Cs,fr:$s,es:Ss,it:Ds,de:Fs,nl:ks,"zh-Hans":Ts};function Ms(t){const e=t.toLowerCase(),i=e.split("-")[0];if(le[t])return le[t];if(le[e])return le[e];if(le[i])return le[i];const r=Object.keys(le).find(o=>o.toLowerCase().split("-")[0]===i);return r?le[r]:le.en}function c(t,e,i){var r,o;let s=(o=(r=Ms(e)[t])!=null?r:le.en[t])!=null?o:t;if(i)for(const[n,l]of Object.entries(i))s=s.split(`{${n}}`).join(String(l));return s}const Ls={"tsunami warning":{hex:"#FD6347",rgb:"253, 99, 71",crLight:2.978,crDark:5.714},"tornado warning":{hex:"#FF0000",rgb:"255, 0, 0",crLight:3.998,crDark:4.255},"extreme wind warning":{hex:"#FF8C00",rgb:"255, 140, 0",crLight:2.332,crDark:7.295},"severe thunderstorm warning":{hex:"#FFA500",rgb:"255, 165, 0",crLight:1.975,crDark:8.616},"flash flood warning":{hex:"#8B0000",rgb:"139, 0, 0",crLight:10.011,crDark:1.7},"flash flood statement":{hex:"#8B0000",rgb:"139, 0, 0",crLight:10.011,crDark:1.7},"severe weather statement":{hex:"#00FFFF",rgb:"0, 255, 255",crLight:1.254,crDark:13.57},"shelter in place warning":{hex:"#FA8072",rgb:"250, 128, 114",crLight:2.501,crDark:6.802},"evacuation immediate":{hex:"#7FFF00",rgb:"127, 255, 0",crLight:1.296,crDark:13.131},"civil danger warning":{hex:"#FFB6C1",rgb:"255, 182, 193",crLight:1.652,crDark:10.301},"nuclear power plant warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"radiological hazard warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"hazardous materials warning":{hex:"#4B0082",rgb:"75, 0, 130",crLight:12.951,crDark:1.314},"fire warning":{hex:"#A0522D",rgb:"160, 82, 45",crLight:5.616,crDark:3.03},"civil emergency message":{hex:"#FFB6C1",rgb:"255, 182, 193",crLight:1.652,crDark:10.301},"law enforcement warning":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"storm surge warning":{hex:"#B524F7",rgb:"181, 36, 247",crLight:4.605,crDark:3.695},"hurricane force wind warning":{hex:"#CD5C5C",rgb:"205, 92, 92",crLight:3.976,crDark:4.279},"hurricane warning":{hex:"#DC143C",rgb:"220, 20, 60",crLight:4.99,crDark:3.41},"typhoon warning":{hex:"#DC143C",rgb:"220, 20, 60",crLight:4.99,crDark:3.41},"special marine warning":{hex:"#FFA500",rgb:"255, 165, 0",crLight:1.975,crDark:8.616},"blizzard warning":{hex:"#FF4500",rgb:"255, 69, 0",crLight:3.441,crDark:4.945},"snow squall warning":{hex:"#C71585",rgb:"199, 21, 133",crLight:5.42,crDark:3.139},"ice storm warning":{hex:"#8B008B",rgb:"139, 0, 139",crLight:8.5,crDark:2.002},"heavy freezing spray warning":{hex:"#00BFFF",rgb:"0, 191, 255",crLight:2.122,crDark:8.018},"winter storm warning":{hex:"#FF69B4",rgb:"255, 105, 180",crLight:2.648,crDark:6.426},"lake effect snow warning":{hex:"#008B8B",rgb:"0, 139, 139",crLight:4.145,crDark:4.104},"dust storm warning":{hex:"#FFE4C4",rgb:"255, 228, 196",crLight:1.225,crDark:13.893},"blowing dust warning":{hex:"#FFE4C4",rgb:"255, 228, 196",crLight:1.225,crDark:13.893},"high wind warning":{hex:"#DAA520",rgb:"218, 165, 32",crLight:2.238,crDark:7.603},"tropical storm warning":{hex:"#B22222",rgb:"178, 34, 34",crLight:6.677,crDark:2.548},"storm warning":{hex:"#9400D3",rgb:"148, 0, 211",crLight:6.563,crDark:2.593},"tsunami advisory":{hex:"#D2691E",rgb:"210, 105, 30",crLight:3.633,crDark:4.683},"tsunami watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"avalanche warning":{hex:"#1E90FF",rgb:"30, 144, 255",crLight:3.236,crDark:5.257},"earthquake warning":{hex:"#8B4513",rgb:"139, 69, 19",crLight:7.098,crDark:2.397},"volcano warning":{hex:"#2F4F4F",rgb:"47, 79, 79",crLight:8.928,crDark:1.906},"ashfall warning":{hex:"#A9A9A9",rgb:"169, 169, 169",crLight:2.35,crDark:7.239},"flood warning":{hex:"#00FF00",rgb:"0, 255, 0",crLight:1.372,crDark:12.4},"coastal flood warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"lakeshore flood warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"ashfall advisory":{hex:"#696969",rgb:"105, 105, 105",crLight:5.49,crDark:3.099},"high surf warning":{hex:"#228B22",rgb:"34, 139, 34",crLight:4.389,crDark:3.876},"extreme heat warning":{hex:"#C71585",rgb:"199, 21, 133",crLight:5.42,crDark:3.139},"tornado watch":{hex:"#FFFF00",rgb:"255, 255, 0",crLight:1.074,crDark:15.845},"severe thunderstorm watch":{hex:"#DB7093",rgb:"219, 112, 147",crLight:3.111,crDark:5.47},"flash flood watch":{hex:"#2E8B57",rgb:"46, 139, 87",crLight:4.245,crDark:4.008},"gale warning":{hex:"#DDA0DD",rgb:"221, 160, 221",crLight:2.07,crDark:8.221},"flood statement":{hex:"#00FF00",rgb:"0, 255, 0",crLight:1.372,crDark:12.4},"extreme cold warning":{hex:"#0000FF",rgb:"0, 0, 255",crLight:8.592,crDark:1.98},"freeze warning":{hex:"#483D8B",rgb:"72, 61, 139",crLight:9.068,crDark:1.876},"red flag warning":{hex:"#FF1493",rgb:"255, 20, 147",crLight:3.637,crDark:4.678},"storm surge watch":{hex:"#DB7FF7",rgb:"219, 127, 247",crLight:2.503,crDark:6.798},"hurricane watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"hurricane force wind watch":{hex:"#9932CC",rgb:"153, 50, 204",crLight:5.702,crDark:2.984},"typhoon watch":{hex:"#FF00FF",rgb:"255, 0, 255",crLight:3.136,crDark:5.425},"tropical storm watch":{hex:"#F08080",rgb:"240, 128, 128",crLight:2.591,crDark:6.566},"storm watch":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"tropical cyclone local statement":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"winter weather advisory":{hex:"#7B68EE",rgb:"123, 104, 238",crLight:4.153,crDark:4.097},"avalanche advisory":{hex:"#CD853F",rgb:"205, 133, 63",crLight:2.99,crDark:5.69},"cold weather advisory":{hex:"#AFEEEE",rgb:"175, 238, 238",crLight:1.289,crDark:13.196},"heat advisory":{hex:"#FF7F50",rgb:"255, 127, 80",crLight:2.499,crDark:6.809},"flood advisory":{hex:"#00FF7F",rgb:"0, 255, 127",crLight:1.345,crDark:12.648},"coastal flood advisory":{hex:"#7CFC00",rgb:"124, 252, 0",crLight:1.331,crDark:12.786},"lakeshore flood advisory":{hex:"#7CFC00",rgb:"124, 252, 0",crLight:1.331,crDark:12.786},"high surf advisory":{hex:"#BA55D3",rgb:"186, 85, 211",crLight:3.942,crDark:4.317},"dense fog advisory":{hex:"#708090",rgb:"112, 128, 144",crLight:4.055,crDark:4.196},"dense smoke advisory":{hex:"#F0E68C",rgb:"240, 230, 140",crLight:1.28,crDark:13.29},"small craft advisory":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"brisk wind advisory":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"hazardous seas warning":{hex:"#D8BFD8",rgb:"216, 191, 216",crLight:1.699,crDark:10.017},"dust advisory":{hex:"#BDB76B",rgb:"189, 183, 107",crLight:2.069,crDark:8.223},"blowing dust advisory":{hex:"#BDB76B",rgb:"189, 183, 107",crLight:2.069,crDark:8.223},"lake wind advisory":{hex:"#D2B48C",rgb:"210, 180, 140",crLight:1.972,crDark:8.627},"wind advisory":{hex:"#D2B48C",rgb:"210, 180, 140",crLight:1.972,crDark:8.627},"frost advisory":{hex:"#6495ED",rgb:"100, 149, 237",crLight:2.973,crDark:5.723},"freezing fog advisory":{hex:"#008080",rgb:"0, 128, 128",crLight:4.773,crDark:3.564},"freezing spray advisory":{hex:"#00BFFF",rgb:"0, 191, 255",crLight:2.122,crDark:8.018},"low water advisory":{hex:"#A52A2A",rgb:"165, 42, 42",crLight:7.084,crDark:2.402},"local area emergency":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"winter storm watch":{hex:"#4682B4",rgb:"70, 130, 180",crLight:4.108,crDark:4.142},"rip current statement":{hex:"#40E0D0",rgb:"64, 224, 208",crLight:1.642,crDark:10.364},"beach hazards statement":{hex:"#40E0D0",rgb:"64, 224, 208",crLight:1.642,crDark:10.364},"gale watch":{hex:"#FFC0CB",rgb:"255, 192, 203",crLight:1.538,crDark:11.063},"avalanche watch":{hex:"#F4A460",rgb:"244, 164, 96",crLight:2.034,crDark:8.366},"hazardous seas watch":{hex:"#483D8B",rgb:"72, 61, 139",crLight:9.068,crDark:1.876},"heavy freezing spray watch":{hex:"#BC8F8F",rgb:"188, 143, 143",crLight:2.814,crDark:6.047},"flood watch":{hex:"#2E8B57",rgb:"46, 139, 87",crLight:4.245,crDark:4.008},"coastal flood watch":{hex:"#66CDAA",rgb:"102, 205, 170",crLight:1.931,crDark:8.814},"lakeshore flood watch":{hex:"#66CDAA",rgb:"102, 205, 170",crLight:1.931,crDark:8.814},"high wind watch":{hex:"#B8860B",rgb:"184, 134, 11",crLight:3.254,crDark:5.228},"extreme heat watch":{hex:"#800000",rgb:"128, 0, 0",crLight:10.95,crDark:1.554},"extreme cold watch":{hex:"#5F9EA0",rgb:"95, 158, 160",crLight:3.05,crDark:5.578},"freeze watch":{hex:"#00FFFF",rgb:"0, 255, 255",crLight:1.254,crDark:13.57},"fire weather watch":{hex:"#FFDEAD",rgb:"255, 222, 173",crLight:1.288,crDark:13.21},"extreme fire danger":{hex:"#E9967A",rgb:"233, 150, 122",crLight:2.306,crDark:7.38},"911 telephone outage":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},"coastal flood statement":{hex:"#6B8E23",rgb:"107, 142, 35",crLight:3.805,crDark:4.471},"lakeshore flood statement":{hex:"#6B8E23",rgb:"107, 142, 35",crLight:3.805,crDark:4.471},"special weather statement":{hex:"#FFE4B5",rgb:"255, 228, 181",crLight:1.234,crDark:13.787},"marine weather statement":{hex:"#FFDAB9",rgb:"255, 218, 185",crLight:1.314,crDark:12.948},"air quality alert":{hex:"#808080",rgb:"128, 128, 128",crLight:3.949,crDark:4.308},"air stagnation advisory":{hex:"#808080",rgb:"128, 128, 128",crLight:3.949,crDark:4.308},"hazardous weather outlook":{hex:"#EEE8AA",rgb:"238, 232, 170",crLight:1.253,crDark:13.578},"hydrologic outlook":{hex:"#90EE90",rgb:"144, 238, 144",crLight:1.417,crDark:12.006},"short term forecast":{hex:"#98FB98",rgb:"152, 251, 152",crLight:1.266,crDark:13.439},"administrative message":{hex:"#C0C0C0",rgb:"192, 192, 192",crLight:1.819,crDark:9.352},test:{hex:"#F0FFFF",rgb:"240, 255, 255",crLight:1.027,crDark:16.572},"child abduction emergency":{hex:"#FFFFFF",rgb:"255, 255, 255",crLight:1,crDark:17.015},"blue alert":{hex:"#FFFFFF",rgb:"255, 255, 255",crLight:1,crDark:17.015}},Bs=["a","b","br","em","i","li","ol","p","strong","ul"];zr.addHook("afterSanitizeAttributes",t=>{t.tagName==="A"&&(t.setAttribute("target","_blank"),t.setAttribute("rel","noopener noreferrer"))});function Is(t){return t?zr.sanitize(t,{ALLOWED_TAGS:Bs,ALLOWED_ATTR:["href"]}):""}const zs=[[["tornado"],"mdi:weather-tornado"],[["tsunami"],"mdi:tsunami"],[["hurricane","tropical","typhoon","cyclone"],"mdi:weather-hurricane"],[["thunderstorm","gewitter"],"mdi:weather-lightning"],[["hail","hagel"],"mdi:weather-hail"],[["flood","hydrologic","storm surge","hochwasser"],"mdi:home-flood"],[["rain","shower","precipitation","starkregen","dauerregen"],"mdi:weather-pouring"],[["snow","blizzard","winter","schnee","schneesturm"],"mdi:weather-snowy-heavy"],[["sleet"],"mdi:weather-snowy-rainy"],[["ice","freeze","frost","slippery","gl\xE4tte","glatteis"],"mdi:snowflake"],[["thaw"],"mdi:snowflake-melt"],[["cold","chill","low temperature","k\xE4lte"],"mdi:thermometer-low"],[["landslide","avalanche","lawine"],"mdi:landslide"],[["earthquake"],"mdi:pulse"],[["volcano","ashfall","vog"],"mdi:volcano"],[["dust","sand"],"mdi:weather-dust"],[["smoke"],"mdi:smoke"],[["air quality","air stagnation"],"mdi:air-filter"],[["fire","red flag","waldbrand"],"mdi:fire"],[["heat","high temperature","hitze"],"mdi:weather-sunny-alert"],[["drought","trockenheit"],"mdi:water-off"],[["fog","nebel"],"mdi:weather-fog"],[["sheep","grazier"],"mdi:weather-windy-variant"],[["gale","squall"],"mdi:weather-windy"],[["wind","sturm","orkan","b\xF6en"],"mdi:weather-windy"],[["small craft"],"mdi:sail-boat"],[["rip current"],"mdi:wave"],[["surf","marine","coastal","seas"],"mdi:waves"]];function Pr(t){const e=t.toLowerCase().replace(/[-/]/g," ");for(const[i,r]of zs)if(i.some(o=>e.includes(o)))return r;return"mdi:alert-circle-outline"}const Ps=[[["likely"],"mdi:check-decagram"],[["observed"],"mdi:eye-check"],[["possible","unlikely"],"mdi:help-circle-outline"]];function Rs(t){const e=t.toLowerCase();for(const[i,r]of Ps)if(i.some(o=>e.includes(o)))return r;return"mdi:bullseye-arrow"}const Ns=[[["tornado"],"#FF0000"],[["hurricane","typhoon","tropical storm"],"#DC143C"],[["flood"],"#228B22"],[["blizzard","ice storm"],"#FF4500"],[["snow","winter"],"#1E90FF"],[["freeze","frost","ice"],"#6495ED"],[["wind"],"#D2B48C"],[["heat"],"#FF7F50"],[["fire","red flag"],"#FF4500"],[["fog"],"#708090"],[["tsunami"],"#FD6347"]],lt="#ffffff",dt="#1c1c1e",Os={subtle:{text:2,progress:1.3},strict:{text:3,progress:2}},Tt="subtle";function Us(t){return t!=null?t:Tt}function Rr(t){const e=t.replace("#",""),i=parseInt(e.slice(0,2),16)/255,r=parseInt(e.slice(2,4),16)/255,o=parseInt(e.slice(4,6),16)/255,s=n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4;return .2126*s(i)+.7152*s(r)+.0722*s(o)}function ue(t,e){const i=Rr(t),r=Rr(e),o=Math.max(i,r),s=Math.min(i,r);return(o+.05)/(s+.05)}const Ws={boostLight:!1,boostDark:!1,progressBoostLight:!1,progressBoostDark:!1};function Hs(t,e,i){if(i==="off")return Ws;const{text:r,progress:o}=Os[i];return{boostLight:t<r,boostDark:e<r,progressBoostLight:t<o,progressBoostDark:e<o}}function Mt(t){const e=t.replace("#","");return`${parseInt(e.slice(0,2),16)}, ${parseInt(e.slice(2,4),16)}, ${parseInt(e.slice(4,6),16)}`}const js=1.9;function Nr(t,e,i){return ue(t,e)>=js?e:i}function Gs(t){return{light:Nr(t,lt,"#1a1a1a"),dark:Nr(t,dt,"#f5f5f5")}}function ct(t,e,i,r,o){const s=Gs(t);return{color:t,rgb:e,textColorLight:s.light,textColorDark:s.dark,...Hs(i,r,o)}}function Or(t,e=Tt){const i=t.toLowerCase(),r=Ls[i];if(r)return ct(r.hex,r.rgb,r.crLight,r.crDark,e);for(const[s,n]of Ns)if(s.some(l=>i.includes(l)))return ct(n,Mt(n),ue(n,lt),ue(n,dt),e);const o="#808080";return ct(o,Mt(o),ue(o,lt),ue(o,dt),e)}const qs={extreme:"#D8001E",severe:"#FF9900",moderate:"#FFC800",minor:"#88C840"};function Ur(t,e=Tt){var i;const r=(i=qs[t])!=null?i:"#808080";return ct(r,Mt(r),ue(r,lt),ue(r,dt),e)}const Vs={red:"#D10000",orange:"#FF9500",yellow:"#FFFF00",grey:"#656565"},Ys={extreme:"#D10000",severe:"#FF9500",moderate:"#FFFF00",minor:"#656565",unknown:"#656565"};function Wr(t,e=Tt){var i,r,o;const s=(i=t.colorHint)==null?void 0:i.toLowerCase(),n=(o=(r=s&&Vs[s])!=null?r:Ys[t.severity])!=null?o:"#808080";return ct(n,Mt(n),ue(n,lt),ue(n,dt),e)}function S(t){if(!t||t==="None"||t.trim()==="")return 0;const e=new Date(t.trim());return isNaN(e.getTime())?0:e.getTime()/1e3}function Hr(t){const e=Date.now()/1e3,i=t.sentTs,r=i>0?i:e;let o=t.onsetTs;o===0&&(o=r);const s=o+3600;let n=t.endsTs;n===0&&(n=s);const l=t.endsTs>0,d=e>=o,h=l&&e>=n;let _,g,b,w;h?(_=o,g=n,b=n,w="Expired"):d?(_=o,g=n,b=e,w="Active"):(_=e,g=n,b=o,w="Preparation");const u=g-_,f=u>0?u:1,W=(b-_)/f*100,$=Math.max(0,Math.min(100,Math.round(W*10)/10)),Q=Math.round((n-e)/3600*10)/10,G=Math.round((o-e)/3600*10)/10,D=Math.round((o-e)/60);return{isActive:d,isExpired:h,phaseText:w,progressPct:$,remainingHours:Q,onsetHours:G,onsetMinutes:D,onsetTs:o,endsTs:n,sentTs:i,nowTs:e,hasEndTime:l}}function Ks(t){if(!t)return{locale:void 0};const e=t.language;return t.time_format==="12"?{locale:e,hour12:!0}:t.time_format==="24"?{locale:e,hour12:!1}:{locale:e}}function Zs(t,e,i){const r=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:i});return r.format(t)===r.format(e)}function jr(t,e){var i,r;return e!=null&&e.timeZone&&(r=(i=new Intl.DateTimeFormat(e.language,{timeZoneName:"short",timeZone:e.timeZone}).formatToParts(t).find(o=>o.type==="timeZoneName"))==null?void 0:i.value)!=null?r:""}function Gr(t,e){var i,r,o,s,n,l;const d=e==null?void 0:e.language,h=e==null?void 0:e.date_format,_=e==null?void 0:e.timeZone;if(!h||h==="language")return t.toLocaleDateString(d,{timeZone:_});const g=new Intl.DateTimeFormat(d,{day:"numeric",month:"numeric",year:"numeric",timeZone:_}).formatToParts(t),b=(r=(i=g.find(f=>f.type==="day"))==null?void 0:i.value)!=null?r:"",w=(s=(o=g.find(f=>f.type==="month"))==null?void 0:o.value)!=null?s:"",u=(l=(n=g.find(f=>f.type==="year"))==null?void 0:n.value)!=null?l:"";switch(h){case"DMY":return`${b}/${w}/${u}`;case"MDY":return`${w}/${b}/${u}`;case"YMD":return`${u}/${w}/${b}`;default:return t.toLocaleDateString(d,{timeZone:_})}}function qr(t,e,i){const r=Ks(e),o={hour:i,minute:"2-digit",timeZone:e==null?void 0:e.timeZone};return r.hour12!==void 0&&(o.hour12=r.hour12),t.toLocaleTimeString(r.locale,o)}function Vr(t,e,i="en"){if(t<=0)return c("progress.na",i);const r=new Date(t*1e3),o=new Date,s=jr(r,e),n=qr(r,e,"2-digit"),l=s?`${n} ${s}`:n;return Zs(r,o,e==null?void 0:e.timeZone)?l:`${l} (${Gr(r,e)})`}function mi(t,e,i="en"){if(t<=100)return c("progress.na",i);const r=new Date(t*1e3),o=jr(r,e),s=qr(r,e,"numeric"),n=o?`${s} ${o}`:s;return`${Gr(r,e)}, ${n}`}function Yr(t,e=Date.now()/1e3,i="en"){const r=t-e,o=Math.abs(r),s=r<0;if(o<60)return c(s?"time.just_now":"time.in_less_than_1m",i);if(o<3600){const l=Math.floor(o/60);return s?c("time.minutes_ago",i,{m:l}):c("time.in_minutes",i,{m:l})}if(o<86400){const l=Math.floor(o/3600),d=Math.floor(o%3600/60),h=d>0?`${l}h ${d}m`:`${l}h`;return s?c("time.hours_ago",i,{dur:h}):c("time.in_hours",i,{dur:h})}const n=Math.floor(o/86400);return s?c("time.days_ago",i,{d:n}):c("time.in_days",i,{d:n})}function qe(t,e=Date.now()/1e3){const i=Math.abs(t-e);if(i<60)return"<1m";if(i<3600)return`${Math.floor(i/60)}m`;if(i<86400){const s=Math.floor(i/3600),n=Math.floor(i%3600/60);return n>0?`${s}h ${n}m`:`${s}h`}const r=Math.floor(i/86400),o=Math.floor(i%86400/3600);return o>0?`${r}d ${o}h`:`${r}d`}function Xs(t,e=!0){const i=(t.headline||"").trim();if(!i)return"";if(!e)return i;const r=i.toLowerCase().replace(/[.\s]+$/,""),o=t.event.toLowerCase();return r.startsWith(o)||o.startsWith(r)?"":i}function Kr(t){if(!t)return"";const e=/^\s*[·•\-]\s/,i=/^\.[A-Z]/;return t.split(/\n{2,}/).map(r=>{const o=r.split(`
`),s=[];for(const n of o)s.length===0?s.push(n.trimStart()):e.test(n)||i.test(n.trimStart())||s[s.length-1].trimEnd().endsWith(":")?s.push(n):s[s.length-1]+=" "+n.trimStart();return s.map(n=>n.replace(/ {2,}/g," ")).map(n=>n.trimEnd()).filter(Boolean).join(`
`)}).filter(Boolean).join(`

`)}function he(t){const e=(t||"").toLowerCase().replace(/\s/g,"");return["extreme","severe","moderate","minor"].includes(e)?e:"unknown"}const ut={extreme:0,severe:1,moderate:2,minor:3,unknown:4};function Qs(t,e){return e==="onset"?[...t].sort((i,r)=>(i.onsetTs||1/0)-(r.onsetTs||1/0)):e==="severity"?[...t].sort((i,r)=>{var o,s;const n=((o=ut[i.severity])!=null?o:4)-((s=ut[r.severity])!=null?s:4);return n!==0?n:(i.onsetTs||1/0)-(r.onsetTs||1/0)}):t}function Js(t,e){return t.zones.some(i=>e.has(i.toUpperCase()))}function en(t,e){var i,r;const o=new Map,s=[];for(const l of t){const d=`${l.event}\0${l.severity}\0${l.onsetTs}\0${l.endsTs}\0${l.provider}`,h=o.get(d);h?h.push(l):(o.set(d,[l]),s.push(d))}let n=s.map(l=>{const d=o.get(l);if(d.length===1)return d[0];const h={...d[0]},_=new Set,g=new Set;for(const b of d){for(const w of b.zones)_.add(w.toUpperCase());b.areaDesc&&g.add(b.areaDesc)}return h.zones=[..._],h.areaDesc=[...g].join("; "),h.mergedCount=d.length,h.id=`merged:${l}`,h});if(e&&e.length>1){const l=new Map;for(let h=0;h<e.length;h++)l.has(e[h])||l.set(e[h],h);const d=new Map;for(const h of n){if(h.endsTs===0)continue;const _=`${h.event}\0${h.endsTs}`,g=d.get(_);(!g||((i=l.get(h.provider))!=null?i:1/0)<((r=l.get(g))!=null?r:1/0))&&d.set(_,h.provider)}n=n.filter(h=>{if(h.endsTs===0)return!0;const _=`${h.event}\0${h.endsTs}`;return h.provider===d.get(_)})}return n}function tn(t){const e=t.split("/");return e[e.length-1].toUpperCase()}function rn(t){var e;const i=[];if(Array.isArray(t.AffectedZones))for(const r of t.AffectedZones)typeof r!="string"||!r||i.push(tn(r));if(Array.isArray((e=t.Geocode)==null?void 0:e.UGC))for(const r of t.Geocode.UGC){if(typeof r!="string"||!r)continue;const o=r.toUpperCase();i.includes(o)||i.push(o)}return i}class on{constructor(){this.provider="nws"}canHandle(e){const i=e.Alerts;if(!Array.isArray(i))return!1;if(i.length===0)return!0;const r=i[0];return typeof r=="object"&&r!==null&&"Event"in r&&"Severity"in r}parseAlerts(e){const i=e.Alerts;return Array.isArray(i)?i.filter(r=>typeof r=="object"&&r!==null).map(r=>this._normalize(r)):[]}_normalize(e){const i=he(e.Severity);return{id:e.ID,event:e.Event||"Unknown",severity:i,severityLabel:e.Severity&&he(e.Severity)!=="unknown"?e.Severity:i.charAt(0).toUpperCase()+i.slice(1),certainty:e.Certainty||"",urgency:e.Urgency||"",sentTs:S(e.Sent),onsetTs:S(e.Onset),endsTs:S(e.Ends)||S(e.Expires),description:e.Description||"",instruction:e.Instruction||"",url:e.URL||"",headline:e.Headline||"",areaDesc:e.AreaDesc||e.AreasAffected||"",zones:rn(e),eventCode:e.NWSCode||"",provider:"nws",phase:"",severityInferred:!e.Severity||he(e.Severity)==="unknown",certaintyInferred:!1}}}function sn(t,e,i){const r=t.toLowerCase();if(r.includes("extreme")||r.includes("tropical cyclone"))return{severity:"extreme",label:(r.includes("extreme"),"Extreme")};if(r.includes("severe"))return{severity:"severe",label:"Severe"};if(r.includes("major"))return{severity:"severe",label:"Major"};if(r.includes("moderate"))return{severity:"moderate",label:"Moderate"};if(r.includes("minor")||r.includes("initial"))return{severity:"minor",label:"Minor"};const o=e.toLowerCase();if(o.includes("tropical_cyclone"))return{severity:"extreme",label:"Extreme"};if(o.includes("severe")||o.includes("fire_weather"))return{severity:"severe",label:"Severe"};const s=i.charAt(0).toUpperCase()+i.slice(1);return i==="major"?{severity:"moderate",label:s}:{severity:"minor",label:s}}function nn(t){return t.title||t.short_title||t.type.replace(/_/g," ")}function an(t){if(t.area_id&&t.id.startsWith(t.area_id+"_")){const e=t.id.slice(t.area_id.length+1);return`https://www.bom.gov.au/warning/${t.type.replace(/_/g,"-")}/${e}`}return"https://www.bom.gov.au/weather-and-climate/warnings-and-alerts"}const ln={new:"New",update:"Updated",renewal:"Renewed",upgrade:"Upgraded",downgrade:"Downgraded",final:"Final"};function dn(t){return ln[t.toLowerCase()]||""}class cn{constructor(){this.provider="bom"}canHandle(e){const i=e.warnings;if(!Array.isArray(i))return!1;if(i.length===0)return typeof e.attribution=="string"&&e.attribution.toLowerCase().includes("bureau of meteorology");const r=i[0];return typeof r=="object"&&r!==null&&"warning_group_type"in r&&"issue_time"in r}parseAlerts(e){const i=e.warnings;return Array.isArray(i)?i.filter(r=>typeof r=="object"&&r!==null).filter(r=>r.phase!=="cancelled").map(r=>this._normalize(r)):[]}_normalize(e){const i=S(e.issue_time),r=S(e.expiry_time),o=nn(e),{severity:s,label:n}=sn(o,e.type,e.warning_group_type);return{id:e.id,event:o,severity:s,severityLabel:n,certainty:"",urgency:"",sentTs:i,onsetTs:i,endsTs:r,description:"",instruction:"",url:an(e),headline:e.short_title||o,areaDesc:e.state||"",zones:e.area_id?[e.area_id.toUpperCase()]:[],eventCode:"",provider:"bom",phase:dn(e.phase),severityInferred:!0,certaintyInferred:!1}}}const un="https://www.dwd.de/DE/wetter/warnungen_gemeinden/warnWetter_node.html",hn={"#880e4f":{severity:"extreme",label:"Extreme"},"#ff0000":{severity:"severe",label:"Severe"},"#ff9900":{severity:"moderate",label:"Moderate"},"#ffff00":{severity:"minor",label:"Minor"}};function pn(t,e){if(typeof t=="number")switch(t){case 4:return{severity:"extreme",label:"Extreme"};case 3:return{severity:"severe",label:"Severe"};case 2:return{severity:"moderate",label:"Moderate"};case 1:return{severity:"minor",label:"Minor"};case 0:return{severity:"unknown",label:"Unknown"}}if(typeof e=="string"){const i=hn[e.toLowerCase()];if(i)return i}return{severity:"unknown",label:"Unknown"}}function gn(t){return typeof t=="object"&&t!==null&&typeof t.level=="number"&&typeof t.color=="string"}class _n{constructor(){this.provider="dwd"}canHandle(e){return typeof e.warning_count!="number"||typeof e.region_name!="string"?!1:e.warning_count>0?gn(e.warning_1):!0}parseAlerts(e){const i=typeof e.warning_count=="number"?e.warning_count:0;if(i<=0)return[];const r=typeof e.region_name=="string"?e.region_name:"",o=[];for(let s=1;s<=i;s++){const n=e[`warning_${s}`];if(!n||typeof n!="object")continue;const l=n,d=typeof l.level=="number"?l.level:void 0;if(d===0)continue;const{severity:h,label:_}=pn(d,l.color),g=S(l.start_time),b=S(l.end_time),w=typeof l.event_code=="number"?String(l.event_code):"",u=typeof l.event=="string"?l.event:"";o.push({id:`dwd_${w||u}_${g}`,event:u,severity:h,severityLabel:_,certainty:"",urgency:"",sentTs:0,onsetTs:g,endsTs:b,description:typeof l.description=="string"?l.description:"",instruction:typeof l.instruction=="string"?l.instruction:"",url:un,headline:typeof l.headline=="string"?l.headline:"",areaDesc:r,zones:[],eventCode:w,provider:"dwd",phase:"",severityInferred:!1,certaintyInferred:!1})}return o}}const mn="https://www.meteoswiss.admin.ch/services-and-publications/applications/hazards.html#tab=severe-weather-map&weather-tab=all";function fn(t){switch(t){case 5:return{severity:"extreme",label:"Extreme"};case 4:return{severity:"extreme",label:"Extreme"};case 3:return{severity:"severe",label:"Severe"};case 2:return{severity:"moderate",label:"Moderate"};case 1:return{severity:"minor",label:"Minor"};case 0:return{severity:"unknown",label:"Unknown"};default:return{severity:"unknown",label:"Unknown"}}}class vn{constructor(){this.provider="meteoswiss"}canHandle(e){return Array.isArray(e.warning_types)&&Array.isArray(e.warning_levels_numeric)&&Array.isArray(e.warning_valid_from)}parseAlerts(e){var i,r,o;const s=f=>Array.isArray(e[f])?e[f]:[],n=s("warning_types"),l=s("warning_levels"),d=s("warning_levels_numeric"),h=s("warning_valid_from"),_=s("warning_valid_to"),g=s("warning_texts"),b=s("warning_links"),w=f=>n.length>0&&b.length>0&&b.length%n.length===0?String(b[f*(b.length/n.length)]):b.length>0?String(b[0]):mn,u=[];for(let f=0;f<n.length;f++){const W=Number(d[f]);if(W===0)continue;const $=String((i=n[f])!=null?i:""),{severity:Q,label:G}=fn(W),D=String((r=l[f])!=null?r:"")||G,q=h[f]!=null?S(String(h[f])):0,A=_[f]!=null?S(String(_[f])):0;u.push({id:`meteoswiss_${$}_${q}`,event:$,severity:Q,severityLabel:D,certainty:"",urgency:"",sentTs:0,onsetTs:q,endsTs:A,description:String((o=g[f])!=null?o:""),instruction:"",url:w(f),headline:"",areaDesc:"",zones:[],eventCode:$,provider:"meteoswiss",phase:"",severityInferred:!1,certaintyInferred:!1,iconHint:$})}return u}}function Zr(t){if(!t||typeof t!="string")return;const e=parseInt(t.split(";")[0].trim(),10);if(e>=4)return"extreme";if(e===3)return"severe";if(e===2)return"moderate";if(e===1)return"minor"}function bn(t){if(!t||typeof t!="string")return"";const e=t.split(";");return e.length>=3?e[2].trim():""}function yn(t){if(!t||typeof t!="string")return"";const e=t.split(";");return e.length>1?e.slice(1).join(";").trim():""}class wn{constructor(){this.provider="meteoalarm"}canHandle(e){return typeof e.attribution=="string"&&e.attribution.toLowerCase().includes("meteoalarm")?!0:typeof e.awareness_level=="string"&&typeof e.awareness_type=="string"}parseAlerts(e){const i=U(e.event),r=U(e.headline);if(!i&&!r)return[];const o=U(e.awareness_level),s=Zr(o)||he(U(e.severity)),n=bn(o)||U(e.severity)||s.charAt(0).toUpperCase()+s.slice(1),l=S(U(e.onset)||U(e.effective)),d=S(U(e.expires)),h=S(U(e.effective)),_=yn(U(e.awareness_type)),g=i||_||r,b=!Zr(o)&&!U(e.severity);return[{id:`meteoalarm_${g}_${l}`,event:g,severity:s,severityLabel:n,certainty:U(e.certainty),urgency:U(e.urgency),sentTs:h,onsetTs:l||h,endsTs:d,description:U(e.description),instruction:U(e.instruction),url:"",headline:r||g,areaDesc:U(e.senderName),zones:[],eventCode:"",provider:"meteoalarm",iconHint:_,phase:"",severityInferred:b,certaintyInferred:!1}]}}function U(t){return typeof t=="string"?t:""}class xn{constructor(){this.provider="pirateweather"}canHandle(e){return typeof e.attribution=="string"&&e.attribution.toLowerCase().includes("pirate weather")}parseAlerts(e){const i=[],r=typeof e.title=="string"&&e.title!=="",o=typeof e.title_0=="string"&&e.title_0!=="";if(r&&!o){const s=this._parseOne(e,"");s&&i.push(s)}for(let s=0;;s++){const n=`_${s}`;if(typeof e[`title${n}`]!="string"||e[`title${n}`]==="")break;const l=this._parseOne(e,n);l&&i.push(l)}return i}_parseOne(e,i){const r=ke(e[`title${i}`]);if(!r)return null;const o=ke(e[`severity${i}`]),s=he(o),n=o?o.charAt(0).toUpperCase()+o.slice(1).toLowerCase():s.charAt(0).toUpperCase()+s.slice(1),l=S(ke(e[`time${i}`])),d=S(ke(e[`expires${i}`])),h=e[`regions${i}`],_=Array.isArray(h)?h.join(", "):ke(h),g=ke(e[`uri${i}`]),b=ke(e[`description${i}`]);return{id:`pirateweather_${r}_${l}`,event:r,severity:s,severityLabel:n,certainty:"",urgency:"",sentTs:l,onsetTs:l,endsTs:d,description:b,instruction:"",url:g,headline:r,areaDesc:_,zones:[],eventCode:"",provider:"pirateweather",phase:"",severityInferred:!o||he(o)==="unknown",certaintyInferred:!1}}}function ke(t){return typeof t=="string"?t:""}class En{constructor(){this.provider="cap"}canHandle(e){return typeof e.incident_platform_version=="string"&&typeof e.id=="string"}parseAlerts(e){const i=k(e.id);if(!i)return[];const r=k(e.event),o=k(e.severity),s=k(e.severity_normalized),n=he(s||o),l=o||s,d=l?l.charAt(0).toUpperCase()+l.slice(1).toLowerCase():n.charAt(0).toUpperCase()+n.slice(1),h=S(k(e.sent)||k(e.effective)),_=S(k(e.onset))||h,g=S(k(e.ends))||S(k(e.expires)),b=k(e.icon),w=b.startsWith("mdi:")?b:void 0,u=k(e.geometry_ref)||void 0,f=Sn(e.bbox);return[{id:i,event:r||"Unknown",severity:n,severityLabel:d,certainty:k(e.certainty),urgency:k(e.urgency),sentTs:h,onsetTs:_,endsTs:g,description:k(e.description),instruction:k(e.instruction),url:Xr(k(e.url))||Xr(k(e.web)),headline:k(e.headline),areaDesc:k(e.area_desc),zones:$n(e),eventCode:k(e.event_code_nws)||k(e.event_code_same),provider:"cap",phase:Cn(k(e.phase)),severityInferred:!o&&!s,certaintyInferred:!1,...w!==void 0&&{providerIcon:w},...u!==void 0&&{geometryRef:u},...f!==void 0&&{bbox:f}}]}}const An={new:"New",update:"Update",cancel:"Cancel",expired:"Expired"};function Cn(t){return An[t.toLowerCase()]||""}function $n(t){const e=[],i=new Set,r=s=>{if(typeof s!="string")return;const n=s.toUpperCase();i.has(n)||(i.add(n),e.push(n))};for(const s of["affected_zones","geocode_ugc","geocode_same"]){const n=t[s];if(Array.isArray(n))for(const l of n)r(l)}const o=t.geocodes;if(o&&typeof o=="object"&&!Array.isArray(o)){for(const s of Object.values(o))if(Array.isArray(s))for(const n of s)r(n)}return e}function k(t){return typeof t=="string"?t:""}function Sn(t){if(!(!Array.isArray(t)||t.length!==4)&&t.every(e=>typeof e=="number"&&Number.isFinite(e)))return[t[0],t[1],t[2],t[3]]}function Xr(t){return t.startsWith("http://")||t.startsWith("https://")?t:""}const Dn="https://weather.gc.ca/index_e.html",Fn="https://meteo.gc.ca/index_f.html",kn="environment canada",Qr="environnement canada",Tn={red:"extreme",orange:"severe",yellow:"moderate",grey:"minor",green:"unknown",rouge:"extreme",jaune:"moderate",gris:"minor",vert:"unknown"},Mn={warning:"severe",watch:"moderate",advisory:"minor",statement:"minor",ending:"unknown"},Ln={high:"severe",medium:"moderate",moderate:"moderate",low:"minor",\u00E9lev\u00E9:"severe",\u00E9lev\u00E9e:"severe",mod\u00E9r\u00E9:"moderate",mod\u00E9r\u00E9e:"moderate",faible:"minor"},Bn={high:"Likely",moderate:"Possible",medium:"Possible",low:"Unlikely",\u00E9lev\u00E9e:"Likely",\u00E9lev\u00E9:"Likely",mod\u00E9r\u00E9e:"Possible",mod\u00E9r\u00E9:"Possible",faible:"Unlikely"},In={new:"New",issued:"New",continued:"Continued",updated:"Updated",extended:"Updated",expired:"Final",ended:"Final",\u00E9mis:"New",maintenu:"Continued","mis \xE0 jour":"Updated",prolong\u00E9:"Updated",termin\u00E9:"Final",annul\u00E9:"Final"};function zn(t){var e;return t&&(e=Tn[t.toLowerCase()])!=null?e:"unknown"}function Pn(t){var e;return t&&(e=Mn[t.toLowerCase()])!=null?e:"unknown"}function Rn(t){var e;return t&&(e=Ln[t.toLowerCase()])!=null?e:"unknown"}function Nn(...t){var e;let i="unknown",r=ut[i];for(const o of t){const s=(e=ut[o])!=null?e:ut.unknown;s<r&&(i=o,r=s)}return i}function Jr(t){return t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}function On(t){var e;if(!t)return"";const i=t.toLowerCase();return(e=In[i])!=null?e:Jr(t)}function Un(t){var e;return t&&(e=Bn[t.toLowerCase()])!=null?e:""}function Wn(t){return typeof t=="string"&&t.toLowerCase().includes(Qr)}function Hn(t){return Wn(t)?Fn:Dn}class jn{constructor(){this.provider="eccc"}canHandle(e){const i=e.attribution;if(typeof i!="string")return!1;const r=i.toLowerCase();return r.includes(kn)||r.includes(Qr)}parseAlerts(e){const i=e.alerts;if(!Array.isArray(i))return[];const r=Hn(e.attribution);return i.filter(o=>typeof o=="object"&&o!==null).filter(o=>{const s=Te(o.status).toLowerCase();return s!=="cancelled"&&s!=="annul\xE9"}).map(o=>this._normalize(o,r))}_normalize(e,i){const r=S(e.issued),o=S(e.expiry),s=Nn(zn(e.color),Pn(e.type),Rn(e.impact)),n=Te(e.title),l=Te(e.alert_code),d=Te(e.area),h=e.color?e.color.toLowerCase():void 0,_=Te(e.impact),g=_?Jr(_):void 0,b=g!=null?g:s.charAt(0).toUpperCase()+s.slice(1),w=Un(e.confidence);return{id:`eccc_${l||n||"unknown"}_${d}_${r}`,event:n,severity:s,severityLabel:b,certainty:w,urgency:"",sentTs:r,onsetTs:r,endsTs:o,description:Te(e.text),instruction:"",url:Te(e.url)||i,headline:n,areaDesc:d,zones:[],eventCode:l,provider:"eccc",phase:On(e.status),severityInferred:!e.color&&!e.type&&!e.impact,certaintyInferred:!e.confidence,colorHint:h,severityBadgeLabel:g}}}function Te(t){return typeof t=="string"?t:""}const Gn="https://www.fire.nsw.gov.au/firesnearme/";function qn(t){const e=t.toLowerCase();return e.includes("emergency warning")?{severity:"extreme",label:"Emergency Warning",inferred:!1}:e.includes("watch and act")?{severity:"severe",label:"Watch and Act",inferred:!1}:e.includes("advice")?{severity:"moderate",label:"Advice",inferred:!1}:e.includes("planned burn")?{severity:"minor",label:"Planned Burn",inferred:!1}:{severity:"unknown",label:eo(t)||"Unknown",inferred:!0}}function eo(t){return t.replace(/\w\S*/g,e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase())}function Vn(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Yn(t){if(t==null||t==="")return"";if(typeof t=="number")return`${t} ha`;const e=t.trim();return/^\d+(\.\d+)?$/.test(e)?`${e} ha`:e}function Kn(t){const e=[],i=(r,o)=>{o&&e.push(`${r}: ${o}`)};return i("Status",de(t.status)),i("Type",de(t.type)),i("Location",de(t.location)),i("Council area",de(t.council_area)),i("Size",Yn(t.size)),i("Responsible agency",de(t.responsible_agency)),e.join(`

`)}class Zn{constructor(){this.provider="nsw_rfs",this.feedSources=["nsw_rural_fire_service_feed"]}canHandle(e){return typeof e.category=="string"&&typeof e.status=="string"&&typeof e.responsible_agency=="string"}parseAlerts(e){return this.canHandle(e)?[this._normalize(e)]:[]}_normalize(e){const i=S(e.publication_date),{severity:r,label:o,inferred:s}=qn(de(e.category)),n=de(e.location),l=de(e.type),d=l?eo(l):n||"Fire Incident";return{id:de(e.external_id)||`nsw_rfs_${Vn(n)}_${i}`,event:d,severity:r,severityLabel:o,certainty:"",urgency:"",sentTs:i,onsetTs:i,endsTs:0,description:Kn(e),instruction:"",url:Gn,headline:n||d,areaDesc:de(e.council_area)||n||"NSW",zones:[],eventCode:"",provider:"nsw_rfs",phase:"",severityInferred:s,certaintyInferred:!1,providerIcon:"mdi:fire"}}}function de(t){return typeof t=="string"?t:""}const Xn="Herausgeber",to=/^(?:amtliche\s+)?(?:(?:extreme\s+)?(?:unwetter)?warnung|vorabinformation)\s+(?:vor\s+)?/i;function Qn(t){return t.replace(/\w\S*/g,e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase())}function Jn(t){if(!to.test(t))return t;const e=t.replace(to,"").trim();return e?Qn(e):t}function ea(t,e){if(!e)return t;const i=`${Xn}: ${e}`;return t?`${t}

${i}`:i}class ta{constructor(){this.provider="nina"}canHandle(e){return typeof e.recommended_actions=="string"&&typeof e.affected_areas=="string"&&typeof e.id=="string"}parseAlerts(e){if(!this.canHandle(e))return[];const i=oe(e.id);if(!i)return[];const r=oe(e.headline),o=oe(e.severity),s=he(o),n=S(oe(e.sent)),l=S(oe(e.start))||n,d=S(oe(e.expires));return[{id:i,event:Jn(r)||"Warnung",severity:s,severityLabel:o?o.charAt(0).toUpperCase()+o.slice(1).toLowerCase():s.charAt(0).toUpperCase()+s.slice(1),certainty:"",urgency:"",sentTs:n,onsetTs:l,endsTs:d,description:ea(oe(e.description),oe(e.sender)),instruction:oe(e.recommended_actions),url:ia(oe(e.web)),headline:r,areaDesc:oe(e.affected_areas),zones:[],eventCode:"",provider:"nina",phase:"",severityInferred:!1,certaintyInferred:!1}]}}function oe(t){return typeof t=="string"?t:""}function ia(t){return t.startsWith("http://")||t.startsWith("https://")?t:""}const Ve=[new En,new on,new cn,new Zn,new ta,new _n,new vn,new wn,new jn,new xn],fi=[/^sensor\..*alerts?$/i,/^sensor\..*warnings?$/i,/^binary_sensor\.meteoalarm/i,/^sensor\.dwd_weather_warnings/i,/^sensor\.weather_warnings_at_/i,/^sensor\..*cap_alert_/i,/^binary_sensor\..*_warn(?:ing|ung)_\d+$/i];function Lt(t){return Ve.some(e=>e.canHandle(t))}function io(){var t;const e=[];for(const i of Ve)for(const r of(t=i.feedSources)!=null?t:[])e.push({source:r,provider:i.provider});return e}function vi(t,e){var i;if(t){const r=Ve.find(o=>o.provider===t);if(r)return r}for(const r of Ve)if(r.canHandle(e))return r;return(i=Ve.find(r=>r.provider==="nws"))!=null?i:Ve[0]}function bi(t,e,i){const r=i!=null?i:t.entities?Object.values(t.entities):null;if(!r)return[];const o=[];for(const s of r){if(!s||s.device_id!==e)continue;const n=s.entity_id;if(!n)continue;const l=t.states[n];!l||!Lt(l.attributes)||o.push(n)}return o}function ra(t,e,i){const r=i!=null?i:t.entities?Object.values(t.entities):null;if(!r)return[];const o=[];for(const s of r)(s==null?void 0:s.device_id)===e&&s.entity_id&&o.push(s.entity_id);return o}function oa(t,e,i){if(i)return i.some(o=>(o==null?void 0:o.device_id)===e);const r=t.entities;if(!r)return!1;for(const o of Object.values(r))if((o==null?void 0:o.device_id)===e)return!0;return!1}async function yi(t,e){const i=async()=>{const l=await t.sendMessagePromise({type:"config/entity_registry/list"});e(l!=null?l:[])};let r=null,o=!1;const s=()=>{if(r!==null){o=!0;return}i().catch(()=>{}),r=setTimeout(()=>{r=null,o&&(o=!1,s())},250)},n=await t.subscribeEvents(()=>s(),"entity_registry_updated");return await i(),()=>{r!==null&&(clearTimeout(r),r=null),o=!1,n()}}const sa="weather-alerts-card:dismissals:v1:",wi="weather-alerts-card:dismissals-changed";function xi(){return Math.floor(Date.now()/1e3)}function ro(t){return`${t.severity}|${t.sentTs}|${t.endsTs}|${t.phase||""}`}function na(t,e){const i=[t,...e].filter(Boolean).sort().join(`
`);let r=2166136261;for(let o=0;o<i.length;o++)r^=i.charCodeAt(o),r=Math.imul(r,16777619);return(r>>>0).toString(16).padStart(8,"0")}function Bt(t){return sa+t}function oo(t){if(!t)return[];const e=[];if(t.entity&&e.push(t.entity),t.entities)for(const i of t.entities)i&&e.push(i);if(t.device&&e.push(`device:${t.device}`),t.sources)for(const i of t.sources)i&&e.push(`source:${i}`);return e}function so(t){const e=oo(t);if(e.length===0)return"";const[i,...r]=e;return na(i,r)}function Ei(){try{return typeof localStorage!="undefined"?localStorage:null}catch{return null}}function Ai(t){if(typeof window!="undefined")try{window.dispatchEvent(new CustomEvent(wi,{detail:{scope:t}}))}catch{}}function no(t,e){if(typeof window=="undefined")return()=>{};const i=s=>{const n=s.detail;!n||n.scope!==t||e()},r=Bt(t),o=s=>{s.key!==null&&s.key!==r||e()};return window.addEventListener(wi,i),window.addEventListener("storage",o),()=>{window.removeEventListener(wi,i),window.removeEventListener("storage",o)}}function Ci(t,e=xi()){const i=new Map,r=Ei();if(!r)return i;let o;try{o=r.getItem(Bt(t))}catch{return i}if(!o)return i;let s;try{s=JSON.parse(o)}catch{return i}if(!s||typeof s!="object")return i;const n=s;for(const[l,d]of Object.entries(n)){if(!d||typeof d!="object")continue;const h=d;typeof h.sig!="string"||typeof h.dismissedAt!="number"||typeof h.lastSeenAt!="number"||e-h.lastSeenAt>2592e3||i.set(l,{sig:h.sig,dismissedAt:h.dismissedAt,lastSeenAt:h.lastSeenAt})}return i}function $i(t,e){const i=Ei();if(!i){Ai(t);return}const r=Bt(t);try{if(e.size===0)i.removeItem(r);else{const o={};for(const[s,n]of e)o[s]=n;i.setItem(r,JSON.stringify(o))}}catch{}Ai(t)}function aa(t,e,i=xi()){const r=new Map(t);return r.set(e.id,{sig:ro(e),dismissedAt:i,lastSeenAt:i}),r}function la(t,e){if(!t.has(e))return t;const i=new Map(t);return i.delete(e),i}function da(t){const e=Ei();if(e)try{e.removeItem(Bt(t))}catch{}Ai(t)}function ca(t,e,i=xi()){if(e.size===0)return{visible:t,updatedMap:e};let r=null;const o=[];for(const s of t){const n=e.get(s.id);if(!n){o.push(s);continue}const l=ro(s);if(n.sig!==l){r||(r=new Map(e)),r.delete(s.id),o.push(s);continue}i-n.lastSeenAt>3600&&(r||(r=new Map(e)),r.set(s.id,{...n,lastSeenAt:i}))}return{visible:o,updatedMap:r!=null?r:e}}async function ua(t,e){var i,r;try{const o=await t.sendMessagePromise({type:"cap_alerts/geometry",geometry_ref:e}),s=(r=(i=o==null?void 0:o.features)==null?void 0:i[0])==null?void 0:r.geometry;return!s||typeof s.type!="string"?null:s}catch{return null}}const Me=1e-4;function ha(t,e){const[i,r,o,s]=t,n=(r+s)/2,l=Math.cos(n*Math.PI/180)||Me,d=Math.max((o-i)*l,Me),h=Math.max(s-r,Me),_=`0 0 ${fe(d)} ${fe(h)}`,g=(w,u)=>[(w-i)*l,s-u],b=ao(e).map(w=>lo(w,g)).filter(w=>w!==null);return{viewBox:_,polygonPaths:b}}function ao(t){if(!t)return[];if(t.type==="Polygon"){const e=t.coordinates;return Array.isArray(e)&&e.length>0?[e[0]]:[]}if(t.type==="MultiPolygon"){const e=t.coordinates;return Array.isArray(e)?e.map(i=>Array.isArray(i)&&i.length>0?i[0]:null).filter(i=>Array.isArray(i)&&i.length>0):[]}return[]}function lo(t,e){if(!Array.isArray(t)||t.length===0)return null;let i="";for(let r=0;r<t.length;r++){const o=t[r];if(!Array.isArray(o)||o.length<2)continue;const[s,n]=e(o[0],o[1]);i+=`${r===0?"M":"L"}${fe(s)},${fe(n)}`}return i?`${i}Z`:null}function fe(t){return Number(t.toFixed(5)).toString()}const co="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",pa="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",uo="\xA9 OpenStreetMap, CARTO",ve=256,ho=512,po=1,ga=16,_a=16,go=85.05112878,_o=.15;function Si(t){return Math.max(-go,Math.min(go,t))}function ht(t,e,i){const r=ve*Math.pow(2,i),o=(t+180)/360*r,s=Si(e)*Math.PI/180,n=(1-Math.log(Math.tan(s)+1/Math.cos(s))/Math.PI)/2*r;return[o,n]}function ma(t,e,i,r){for(let o=ga;o>=po;o--){const[s,n]=ht(t,r,o),[l,d]=ht(i,e,o);if(l-s<=ho&&d-n<=ho)return o}return po}function fa(t,e,i,r){return t.split("{z}").join(String(e)).split("{x}").join(String(i)).split("{y}").join(String(r)).split("{s}").join("a")}function va(t,e,i){const r=(i==null?void 0:i.tileUrl)||co,o=(i==null?void 0:i.attribution)||uo,[s,n,l,d]=t,h=Math.max((l-s)*_o,Me),_=Math.max((d-n)*_o,Me),g=s-h,b=l+h,w=Si(n-_),u=Si(d+_),f=ma(g,w,b,u),W=Math.pow(2,f),[$,Q]=ht(g,u,f),[G,D]=ht(b,w,f),q=Math.max(G-$,Me),A=Math.max(D-Q,Me),J=`0 0 ${fe(q)} ${fe(A)}`,be=`${fe(q)} / ${fe(A)}`,_t=[],mt=Math.floor($/ve),I=Math.floor((G-1e-6)/ve),ye=Math.floor(Q/ve),we=Math.floor((D-1e-6)/ve);if((I-mt+1)*(we-ye+1)<=_a){for(let V=ye;V<=we;V++)if(!(V<0||V>=W))for(let pe=mt;pe<=I;pe++){const Ie=(pe%W+W)%W;_t.push({href:fa(r,f,Ie,V),x:Number((pe*ve-$).toFixed(3)),y:Number((V*ve-Q).toFixed(3)),size:ve})}}const Be=(V,pe)=>{const[Ie,zt]=ht(V,pe,f);return[Ie-$,zt-Q]},It=ao(e).map(V=>lo(V,Be)).filter(V=>V!==null);return{viewBox:J,aspect:be,tiles:_t,polygonPaths:It,attribution:o}}function Di(t,e,i){t.dispatchEvent(new CustomEvent(e,{detail:i,bubbles:!0,composed:!0}))}function Fi(t){return(t==null?void 0:t.tap_action)!==void 0}function ba(t,e,i,r){var o,s,n,l;switch(i.action){case"more-info":{const d=(o=i.entity)!=null?o:r;if(!d)return;Di(t,"hass-more-info",{entityId:d});break}case"navigate":{const d=i.navigation_path;if(!d)return;const h=i.navigation_replace===!0;h?history.replaceState(null,"",d):history.pushState(null,"",d),Di(window,"location-changed",{replace:h});break}case"url":{if(!i.url_path)return;window.open(i.url_path,"_blank","noopener");break}case"toggle":{const d=(s=i.entity)!=null?s:r;if(!d||!(e!=null&&e.callService))return;e.callService("homeassistant","toggle",{entity_id:d});break}case"call-service":case"perform-action":{const d=(n=i.perform_action)!=null?n:i.service;if(!d||!(e!=null&&e.callService))return;const h=d.indexOf(".");if(h<0)return;const _=d.slice(0,h),g=d.slice(h+1);e.callService(_,g,(l=i.data)!=null?l:i.service_data,i.target);break}case"fire-dom-event":{Di(t,"ll-custom",i);break}}}const ya=rr`
  @keyframes pulse-border {
    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--wac-fg) 70%, transparent); }
    70% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--wac-fg) 0%, transparent); }
    100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--wac-fg) 0%, transparent); }
  }

  /* Indeterminate "ongoing" breathe. Peaks at the full progress color (same
     brightness as an active bar) and eases down to a still-prominent ~70%, so
     ongoing reads as full-strength-and-alive rather than dimmed — opacity is not
     a phase cue here (direction/fill/labels carry the phase). */
  @keyframes ongoing-pulse {
    0% { background: var(--wac-progress-fg); }
    50% { background: color-mix(in srgb, var(--wac-progress-fg) 70%, transparent); }
    100% { background: var(--wac-progress-fg); }
  }

  /* Shared, direction-parametrized stripe march. --wac-flow (±1) is set by the
     phase and flips the direction; --wac-stripe-tile is the loop tile (24px full,
     12px compact) so one keyframe loops seamlessly at either size. A negative
     flow reproduces the former direction-specific marches (preparation flows
     left); a positive flow marches right (e.g. a striped active fill). */
  @keyframes stripe-march {
    to { background-position: calc(var(--wac-flow, 1) * var(--wac-stripe-tile, 24px)) 0; }
  }

  /* Highlight sweep. Authored canonically in the positive (rightward) direction
     and mirrored by --wac-flow: at flow 1 it sweeps -75%→175%, at flow -1 it
     sweeps 175%→-75%. The old fixed -75%→175% is the flow-1 case. */
  @keyframes fill-shimmer {
    0% { background-position: calc(50% - var(--wac-flow, 1) * 125%) 0; }
    60% { background-position: calc(50% + var(--wac-flow, 1) * 125%) 0; }
    100% { background-position: calc(50% + var(--wac-flow, 1) * 125%) 0; }
  }

  :host {
    display: block;
  }

  /* Public surface-theming API (--wac-* custom properties). Set these from
     theme YAML, card_mod, or a dashboard style: block. Each is applied inline
     as var(--token, <default>) at its use site (no :host declaration), so one
     token can drive both full and compact layouts while preserving each site's
     current default when unset. Documented in the README token table.

       --wac-card-background   outer wrapper fill.  default:
                               var(--ha-card-background, var(--card-background-color))
       --wac-alert-background  per-alert fill.       default: transparent
                               (reveals the outer surface — no compounding)
       --wac-alert-border-radius  per-alert corners. default: 12px full / 8px compact
       --wac-alert-border      per-alert border.     default: 1px solid var(--divider-color)
       --wac-alert-shadow      per-alert shadow.     default:
                               var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.1))
       --wac-alert-gap         inter-alert vgap.     default: 16px full / 4px compact */

  /* Positioning context for the degraded corner dot (see .degraded-dot).
     The outer surface is the single painted layer: inner .alert-card boxes
     default to transparent (see --wac-alert-background) and reveal this fill,
     so a translucent theme renders its alpha exactly once. The fallback chain
     mirrors HA's own default so an unset --wac-card-background is identical to
     today's ha-card background. */
  ha-card {
    position: relative;
    background: var(--wac-card-background, var(--ha-card-background, var(--card-background-color)));
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
    /* Ring intentionally tracks the outer ha-card surface (--card-background-color),
       not --wac-alert-background: the dot floats over the ha-card box, and
       --wac-alert-background is transparent by default. */
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
    /* progressFill:background wash tokens (Bubble-Card-style whole-row fill).
       Deliberately low-opacity so alert text stays legible over translucent
       themes (#215); all three overridable via theme YAML / card_mod / --wac-*.
       Only consumed by the .fill-mode-background rules — inert in track mode. */
    --wac-progress-fill-color: var(--wac-progress-fg);
    --wac-progress-fill-opacity: 0.10;
    --wac-progress-fill-expired-opacity: 0.06;
    position: relative;
    margin-bottom: var(--wac-alert-gap, 16px);
    padding: 0;
    border-radius: var(--wac-alert-border-radius, 12px);
    background: var(--wac-alert-background, transparent);
    border: var(--wac-alert-border, 1px solid var(--divider-color));
    box-shadow: var(--wac-alert-shadow, var(--ha-card-box-shadow, 0 2px 5px rgba(0,0,0,0.1)));
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

  /* Dark themes need a touch more wash to read at the same strength. */
  [data-theme-mode="dark"] .alert-card { --wac-progress-fill-opacity: 0.14; }

  .alert-card:last-child {
    margin-bottom: 0;
  }

  /* tap_action: the whole row is a keyboard-operable action target (the inline
     expand affordance is dropped). Only applied to actionable rows (present AND
     not action:none); inert rows carry no cursor/role/focus. */
  .alert-card.tappable {
    cursor: pointer;
  }
  .alert-card.tappable:focus-visible {
    outline: 2px solid var(--wac-focus-ring, var(--primary-color));
    outline-offset: 2px;
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

  /* Per-phase icon-ring border-style override (iconBorderStyle). Emitted as
     icon-border-<style> on the alert-card root, resolved per-alert from the
     phase. Only border-style is overridden; the phase rules above already set
     the ring color (var(--color)). Placed after the phase rules so the equal-
     specificity override wins on source order. Expired never receives a class. */
  .icon-border-dashed .icon-box {
    border-style: dashed;
  }
  .icon-border-solid .icon-box {
    border-style: solid;
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

  /* Phase classes supply a FILLED base (progress color) + flow direction; the
     .deco-* classes below add only the pattern/animation on top. A filled base
     is what makes solid/shimmer/pulse visible in any phase. Every phase renders
     at full opacity — dimness is not a phase cue (phase is read from the stripe
     flow direction, the fill behavior, the icon ring, and the labels). Striped
     is the one decoration that is never a filled bar: it is a "barber pole" of
     solid progress-color stripes on an empty track in every phase (see the
     .deco-striped override below). */
  .active .progress-fill {
    background-color: var(--wac-progress-fg);
  }

  .expired .progress-fill {
    background-color: var(--divider-color);
  }

  .preparation .progress-fill {
    background-color: var(--wac-progress-fg);
    --wac-flow: -1;
  }
  /* Striped is a barber pole in every phase: solid color stripes on an empty
     track, never a filled bar. Clear whatever fill the phase set. Equal
     specificity to the phase rules, placed after them so it wins on source
     order in full mode. */
  .deco-striped .progress-fill {
    background-color: transparent;
  }

  /* --- PROGRESS DECORATIONS (pattern + animation, phase-independent) ---
     Emitted as deco-<pattern> on the alert-card root from progressStyle. Each
     rule pairs a full-mode selector (.deco-x .progress-fill) with its compact
     equivalent (.compact .deco-x.alert-card::before). Direction/tile/duration are
     supplied by the phase via --wac-flow / --wac-stripe-tile / --wac-stripe-dur so
     any pattern adopts the phase it lands in. */
  .deco-solid .progress-fill,
  .compact .deco-solid.alert-card::before {
    background-image: none;
    animation: none;
  }

  .deco-striped .progress-fill,
  .compact .deco-striped.alert-card::before {
    background-image: linear-gradient(
      -45deg,
      var(--wac-progress-fg) 25%,
      transparent 25%,
      transparent 50%,
      var(--wac-progress-fg) 50%,
      var(--wac-progress-fg) 75%,
      transparent 75%
    );
    background-size: var(--wac-stripe-tile, 24px) var(--wac-stripe-tile, 24px);
    animation: stripe-march var(--wac-stripe-dur, 6s) linear infinite;
  }

  .deco-shimmer .progress-fill,
  .compact .deco-shimmer.alert-card::before {
    background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: fill-shimmer 5s ease-in-out infinite;
  }

  .deco-pulse .progress-fill,
  .compact .deco-pulse.alert-card::before {
    animation: ongoing-pulse 5s infinite;
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
    margin-bottom: var(--wac-alert-gap, 4px);
    border-radius: var(--wac-alert-border-radius, 8px);
  }

  /* Re-assert the last-child gap reset for compact: the generic
     .alert-card:last-child rule above has equal specificity but loses on
     source order to .compact .alert-card, which would otherwise leave a
     trailing --wac-alert-gap below the last chip (visible as stray bottom
     margin, and previously hand-patched with margin-bottom:0 !important). */
  .compact .alert-card:last-child {
    margin-bottom: 0;
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
    /* Compact mini-bar uses a smaller stripe tile and faster march than the
       full progress-fill; scoped to the ::before so the compact-expanded
       .progress-fill keeps the 24px / 6s defaults. */
    --wac-stripe-tile: 12px;
    --wac-stripe-dur: 3s;
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
  /* Compact phase rules mirror the full-mode split: base color / position /
     flow only; the pattern + animation comes from the .deco-* classes above. */
  .compact .active.alert-card::before {
    background-color: var(--wac-progress-fg);
  }
  .compact .expired.alert-card::before {
    background-color: var(--divider-color);
  }
  .compact .preparation.alert-card::before {
    background-color: var(--wac-progress-fg);
    --wac-flow: -1;
  }
  /* Compact striped: barber pole on an empty track (mirrors full mode). These
     phase+deco selectors outrank the compact phase rules above, so the fill is
     cleared in either source order. All phases render full-strength progress-
     color stripes — no dim tint. */
  .compact .preparation.deco-striped.alert-card::before,
  .compact .active.deco-striped.alert-card::before,
  .compact .ongoing.deco-striped.alert-card::before {
    background-color: transparent;
  }
  .compact .ongoing.alert-card::before {
    left: 0;
    /* Color longhand only, so a non-default ongoing pattern's background-image
       (from a .deco-* class) survives; the shorthand would reset it. */
    background-color: var(--wac-progress-fg);
  }

  /* --- PROGRESS FILL: whole-row wash (progressFill: background) ---
     Opt-in Bubble-Card-style surface: instead of the thin track, the entire
     alert row fills as a low-opacity wash of the progress color, behind the
     content, growing to the --progress point (the exact geometry the thin
     track uses today). Full mode paints the wash on .alert-card::after (::before
     is the 6px accent bar); compact grows its existing ::before fill to full
     height. Content wrappers are lifted to z-index:1 so text stays legible. */

  /* Full-mode wash */
  .fill-mode-background:not(.compact) .alert-card::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--progress, 0%);
    right: 0;
    z-index: 0;
    background: var(--wac-progress-fill-color);
    opacity: var(--wac-progress-fill-opacity);
    transition: left 0.3s ease;
    pointer-events: none;
  }
  .fill-mode-background:not(.compact) .expired.alert-card::after {
    left: 0;
    opacity: var(--wac-progress-fill-expired-opacity);
  }
  /* Hide the now-redundant thin track wherever it renders (the full-mode section
     and the compact expanded section both draw one) — the textual progress
     labels stay. */
  .fill-mode-background .progress-track {
    display: none;
  }

  /* Compact-mode wash: grow the existing ::before fill from a 4px bottom bar to
     a full-height surface, recolor it to the wash token, drop the grey track
     base (::after), and keep it a quiet solid (no per-phase deco texture). */
  .fill-mode-background.compact .alert-card::before {
    top: 0;
    height: auto;
    z-index: 0;
    opacity: var(--wac-progress-fill-opacity);
    background-image: none;
    animation: none;
  }
  .fill-mode-background.compact .active.alert-card::before,
  .fill-mode-background.compact .preparation.alert-card::before,
  .fill-mode-background.compact .ongoing.alert-card::before {
    background-color: var(--wac-progress-fill-color);
  }
  .fill-mode-background.compact .expired.alert-card::before {
    left: 0;
    background-color: var(--wac-progress-fill-color);
    opacity: var(--wac-progress-fill-expired-opacity);
  }
  .fill-mode-background.compact .alert-card::after {
    display: none;
  }

  /* Lift content above the z-index:0 wash so text/icons never sit under it. */
  .fill-mode-background .alert-header-row,
  .fill-mode-background .alert-expanded,
  .fill-mode-background .progress-section,
  .fill-mode-background .alert-details-section {
    position: relative;
    z-index: 1;
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
  .no-animations .deco-shimmer .progress-fill,
  .no-animations.compact .deco-shimmer.alert-card::before {
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

  /* --- PER-ALERT DETAIL POP-UP (tap_action: { action: details }) --- */
  /* The dialog renders as a sibling of <ha-card>, outside the context that
     normally supplies the per-row tokens (data-theme-mode on the card root,
     --color/--wac-fg on .alert-card). So .detail-dialog-body carries the former
     and its inner row re-uses .alert-card for the latter — the row chrome is
     then stripped below, because inside a dialog the alert *is* the surface.
     Only the severity spine survives, as the one carry-over cue. */
  /* A NATIVE <dialog>, not <ha-dialog>: HA changed that element's API
     incompatibly in 2026.02 and the card spans both sides of the split. See
     the comment on _renderDetailPopup. showModal() supplies the scrim, focus
     trap and Esc, so only the surface is styled here. */
  dialog.detail-dialog {
    width: min(560px, 92vw);
    max-width: min(560px, 92vw);
    max-height: 86vh;
    padding: 0;
    border: none;
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    color: var(--primary-text-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }
  dialog.detail-dialog::backdrop {
    background: rgba(0, 0, 0, 0.55);
  }
  /* Sits in the alert header row where the dismiss button sits on a real row,
     so it inherits that slot's alignment. A touch larger than .dismiss-button:
     this is the modal's only pointer affordance besides the scrim. */
  .detail-dialog-close {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(32px * var(--wac-scale, 1));
    height: calc(32px * var(--wac-scale, 1));
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
  }
  .detail-dialog-close:hover {
    background: var(--secondary-background-color);
  }
  .detail-dialog-close:focus-visible {
    outline: 2px solid var(--wac-focus-ring, var(--primary-color));
    outline-offset: 2px;
  }
  .detail-dialog-close ha-icon {
    --mdc-icon-size: calc(20px * var(--wac-scale, 1));
  }

  /* A long description scrolls inside the dialog, never the dashboard behind
     it (overscroll-behavior stops the scroll chaining at the edge). Matches the
     dialog's own max-height, which has no padding of its own. */
  .detail-dialog-body {
    max-height: 86vh;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .detail-dialog-body .alert-card {
    margin-bottom: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    /* No pulse-border for extreme/severe: a modal already has the user's full
       attention, and a pulsing frame around it only competes with the text. */
    animation: none;
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
`;var pt;let Le=pt=class extends We{constructor(){super(...arguments),this._showPreview=!1,this._showStyling=!1,this._subscribedDismissalsScope="",this._registryEntries=null,this._onRestoreAll=()=>{const t=this._currentScopeHash();t&&(da(t),this.requestUpdate())}}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._unsubscribeDismissals)==null||t.call(this),this._unsubscribeDismissals=void 0,this._subscribedDismissalsScope="",this._teardownRegistrySubscription()}updated(t){var e;super.updated(t);const i=this._currentScopeHash();i!==this._subscribedDismissalsScope&&((e=this._unsubscribeDismissals)==null||e.call(this),this._unsubscribeDismissals=void 0,this._subscribedDismissalsScope=i,i&&(this._unsubscribeDismissals=no(i,()=>this.requestUpdate()))),this.isConnected&&this._maybeSubscribeRegistry()}_maybeSubscribeRegistry(){var t,e,i;if(!((t=this._config)!=null&&t.device)){this._teardownRegistrySubscription();return}const r=(e=this.hass)==null?void 0:e.connection;!r||r===this._subscribedRegistryConn||((i=this._unsubscribeRegistry)==null||i.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=r,yi(r,o=>{this._registryEntries=o,this.requestUpdate()}).then(o=>{if(this._subscribedRegistryConn!==r){o();return}this._unsubscribeRegistry=o}).catch(()=>{this._subscribedRegistryConn===r&&(this._subscribedRegistryConn=void 0)}))}_teardownRegistrySubscription(){var t;(t=this._unsubscribeRegistry)==null||t.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=void 0}get _lang(){var t,e;return((e=(t=this.hass)==null?void 0:t.locale)==null?void 0:e.language)||"en"}get _useWebAwesome(){if(pt._webAwesome!==void 0)return pt._webAwesome;const t=!!customElements.get("ha-dropdown-item"),e=!!customElements.get("ha-list-item");return t||e?(pt._webAwesome=t,t):!0}_selectValue(t){var e,i,r;const o=t.detail;return(r=(i=o==null?void 0:o.value)!=null?i:(e=t.target)==null?void 0:e.value)!=null?r:""}_renderSelectItem(t,e){return this._useWebAwesome?v`<ha-dropdown-item value=${t}>${e}</ha-dropdown-item>`:v`<ha-list-item value=${t}>${e}</ha-list-item>`}setConfig(t){this._config=t,this._showPreview=!!t._preview}_fireConfigChanged(t){this._config=t;const e=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(e)}_getMatchingEntityIds(){var t,e;const i=this._getSelectedEntities().join(",");if(this._cachedHass===this.hass&&this._cachedConfigKey===i&&this._cachedEntityIds)return this._cachedEntityIds;this._cachedHass=this.hass,this._cachedConfigKey=i;const r=[];for(const[o,s]of Object.entries(this.hass.states))!o.startsWith("sensor.")&&!o.startsWith("binary_sensor.")&&!o.startsWith("geo_location.")||(fi.some(n=>n.test(o))||Lt(s.attributes))&&r.push(o);if((t=this._config)!=null&&t.entity&&!r.includes(this._config.entity)&&r.push(this._config.entity),(e=this._config)!=null&&e.entities)for(const o of this._config.entities)o&&!r.includes(o)&&r.push(o);return this._cachedEntityIds=r,r}_getSelectedEntities(){var t,e;const i=[];if((t=this._config)!=null&&t.entity&&i.push(this._config.entity),(e=this._config)!=null&&e.entities)for(const r of this._config.entities)r&&!i.includes(r)&&i.push(r);return i}_hasNoRealAlerts(){var t;if(!this.hass||!((t=this._config)!=null&&t.entity))return!1;const e=this._getSelectedEntities();let i=0;for(const r of e){const o=this.hass.states[r];if(o&&(o.state==="unknown"||o.state==="unavailable"||(i++,o.state!=="0"&&o.state!=="off")))return!1}return i>0}_isEntityMismatch(){var t,e;if(!((t=this._config)!=null&&t.entity))return!1;const i=(e=this.hass)==null?void 0:e.states[this._config.entity];return!i||fi.some(r=>r.test(this._config.entity))?!1:!Lt(i.attributes)}_renderEntityWarning(t){return this._isEntityMismatch()?v`<ha-alert alert-type="warning">${c("editor.entity_warning",t)}</ha-alert>`:m}_renderNoEntitiesHint(t){var e;return(e=this._config)!=null&&e.device&&this.hass?bi(this.hass,this._config.device,this._registryEntries).length>0?m:v`<ha-alert alert-type="info">${c("editor.no_device_alerts_hint",t)}</ha-alert>`:this._getMatchingEntityIds().some(i=>{var r;return(r=this.hass)==null?void 0:r.states[i]})?m:v`<ha-alert alert-type="info">${c("editor.no_entities_hint",t)} <a href="https://github.com/seevee/weather_alerts_card#supported-providers" target="_blank" rel="noopener">${c("editor.no_entities_hint_link",t)}</a></ha-alert>`}_renderSourceHint(t){var e,i;const r=(e=this._config)==null?void 0:e.sources;if(!r||r.length===0||!this.hass)return m;const o=new Set(r),s=new Set;let n=0;for(const d of Object.values(this.hass.states)){const h=(i=d.attributes)==null?void 0:i.source;typeof h=="string"&&o.has(h)&&(s.add(h),n++)}const l=r.filter(d=>!s.has(d));if(l.length>0){const d=io(),h=l.map(_=>{const g=d.find(b=>b.source===_);return g?c(`editor.provider_${g.provider}`,t):_});return v`<ha-alert alert-type="warning"
        >${c("editor.feeds_missing_warning",t,{feeds:h.join(", ")})}</ha-alert
      >`}return v`<ha-alert alert-type="info">${c("editor.source_hint",t,{count:n})}</ha-alert>`}_entityChanged(t){const e=t.detail.value,i=Array.isArray(e)?e:e?[e]:[],r={...this._config};if(r.entity=i[0]||"",i.length>1?r.entities=i.slice(1):delete r.entities,r.hideNoAlerts){const o=this._syncMultiEntityVisibility(r);o?r.visibility=o:delete r.visibility}this._fireConfigChanged(r)}_deviceChanged(t){const e=t.detail.value,i=typeof e=="string"?e:"";if(i===(this._config.device||""))return;const r={...this._config};i?r.device=i:delete r.device,this._fireConfigChanged(r)}_titleChanged(t){const e=t.target.value;if(e===(this._config.title||""))return;const i={...this._config};e?i.title=e:delete i.title,this._fireConfigChanged(i)}_providerChanged(t){const e=this._selectValue(t);if(e===(this._config.provider||"auto"))return;const i={...this._config};e==="auto"?delete i.provider:i.provider=e,this._fireConfigChanged(i)}_feedsChanged(t){const e=t.detail.value,i=Array.isArray(e)?e:e?[e]:[],r={...this._config};i.length>0?r.sources=i:delete r.sources,this._fireConfigChanged(r)}_enhanceContrastChanged(t){const e=this._selectValue(t);if(e===(this._config.enhanceContrast||"subtle"))return;const i={...this._config};e==="subtle"?delete i.enhanceContrast:i.enhanceContrast=e,this._fireConfigChanged(i)}_animationsChanged(t){const e=t.target.checked;if(e===(this._config.animations!==!1))return;const i={...this._config};e?delete i.animations:i.animations=!1,this._fireConfigChanged(i)}_deduplicateHeadlinesChanged(t){const e=t.target.checked,i=this._config.deduplicateHeadlines!==!1;if(e===i)return;const r={...this._config};e?delete r.deduplicateHeadlines:r.deduplicateHeadlines=!1,this._fireConfigChanged(r)}_deduplicateChanged(t){const e=t.target.checked;if(e===(this._config.deduplicate!==!1))return;const i={...this._config};e?delete i.deduplicate:i.deduplicate=!1,this._fireConfigChanged(i)}_showDetailsChanged(t){const e=t.target.checked;if(e===(this._config.showDetails!==!1))return;const i={...this._config};e?delete i.showDetails:i.showDetails=!1,this._fireConfigChanged(i)}_expandDetailsChanged(t){const e=t.target.checked;if(e===(this._config.expandDetails===!0))return;const i={...this._config};e?i.expandDetails=!0:delete i.expandDetails,this._fireConfigChanged(i)}_showMetadataChanged(t){const e=t.target.checked;if(e===(this._config.showMetadata!==!1))return;const i={...this._config};e?delete i.showMetadata:i.showMetadata=!1,this._fireConfigChanged(i)}_showDescriptionChanged(t){const e=t.target.checked;if(e===(this._config.showDescription!==!1))return;const i={...this._config};e?delete i.showDescription:i.showDescription=!1,this._fireConfigChanged(i)}_showInstructionsChanged(t){const e=t.target.checked;if(e===(this._config.showInstructions!==!1))return;const i={...this._config};e?delete i.showInstructions:i.showInstructions=!1,this._fireConfigChanged(i)}_showGeometryChanged(t){const e=t.target.checked;if(e===(this._config.showGeometry===!0))return;const i={...this._config};e?i.showGeometry=!0:delete i.showGeometry,this._fireConfigChanged(i)}_geometryStyleChanged(t){const e=this._selectValue(t);if(e===(this._config.geometryStyle||"shape"))return;const i={...this._config};e==="shape"?delete i.geometryStyle:i.geometryStyle=e,this._fireConfigChanged(i)}_showProviderChanged(t){const e=t.target.checked;if(e===(this._config.showProvider===!0))return;const i={...this._config};e?i.showProvider=!0:delete i.showProvider,this._fireConfigChanged(i)}_showSourceLinkChanged(t){const e=t.target.checked;if(e===(this._config.showSourceLink!==!1))return;const i={...this._config};e?delete i.showSourceLink:i.showSourceLink=!1,this._fireConfigChanged(i)}_hideExpiredChanged(t){const e=t.target.checked;if(e===(this._config.hideExpired!==!1))return;const i={...this._config};e?delete i.hideExpired:i.hideExpired=!1,this._fireConfigChanged(i)}_allowDismissChanged(t){const e=t.target.checked;if(e===(this._config.allowDismiss===!0))return;const i={...this._config};e?i.allowDismiss=!0:delete i.allowDismiss,this._fireConfigChanged(i)}_showDismissUndoChanged(t){const e=t.target.checked;if(e===(this._config.showDismissUndo!==!1))return;const i={...this._config};e?delete i.showDismissUndo:i.showDismissUndo=!1,this._fireConfigChanged(i)}_dismissTriggerChanged(t){const e=this._selectValue(t);if(e===(this._config.dismissTrigger||"button"))return;const i={...this._config};e==="button"?delete i.dismissTrigger:i.dismissTrigger=e,this._fireConfigChanged(i)}_dismissButtonStyleChanged(t){const e=this._selectValue(t);if(e===(this._config.dismissButtonStyle||"icon"))return;const i={...this._config};e==="icon"?delete i.dismissButtonStyle:i.dismissButtonStyle=e,this._fireConfigChanged(i)}_currentScopeHash(){return so(this._config)}_getDismissedCount(){const t=this._currentScopeHash();return t?Ci(t).size:0}_hideNoAlertsChanged(t){const e=t.target.checked;if(e===(this._config.hideNoAlerts===!0))return;const i={...this._config};e?i.hideNoAlerts=!0:delete i.hideNoAlerts;const r=this._syncMultiEntityVisibility(i);r?i.visibility=r:delete i.visibility,this._fireConfigChanged(i)}_buildEntityCondition(t){return t.startsWith("binary_sensor.")?{condition:"state",entity:t,state:"on"}:{condition:"state",entity:t,state_not:"0"}}_isManagedCondition(t,e){if(t.condition==="state"&&typeof t.entity=="string"&&e.has(t.entity)&&("state_not"in t||"state"in t))return!0;if(t.condition==="or"&&Array.isArray(t.conditions)){const i=t.conditions;return i.length>0&&i.every(r=>r.condition==="state"&&typeof r.entity=="string"&&("state_not"in r&&r.state_not==="0"||"state"in r&&r.state==="on"))}return!1}_syncMultiEntityVisibility(t){const e=new Set;t.entity&&e.add(t.entity),t.entities&&t.entities.forEach(r=>e.add(r));const i=(t.visibility||[]).filter(r=>!this._isManagedCondition(r,e));if(t.hideNoAlerts&&e.size>0){const r=[...e].map(o=>this._buildEntityCondition(o));r.length===1?i.push(r[0]):i.push({condition:"or",conditions:r})}return i.length>0?i:void 0}_reformatTextChanged(t){const e=t.target.checked;if(e===(this._config.reformatText!==!1))return;const i={...this._config};e?delete i.reformatText:i.reformatText=!1,this._fireConfigChanged(i)}_layoutChanged(t){const e=t.target.checked;if(e===(this._config.layout==="compact"))return;const i={...this._config};e?i.layout="compact":delete i.layout,this._fireConfigChanged(i)}_zonesChanged(t){const e=t.target.value,i={...this._config};e.trim()?i.zones=e.split(",").map(r=>r.trim()).filter(Boolean):delete i.zones,this._fireConfigChanged(i)}_eventCodesChanged(t){const e=t.target.value,i={...this._config};e.trim()?i.eventCodes=e.split(",").map(r=>r.trim().toUpperCase()).filter(Boolean):delete i.eventCodes,this._fireConfigChanged(i)}_excludeEventCodesChanged(t){const e=t.target.value,i={...this._config};e.trim()?i.excludeEventCodes=e.split(",").map(r=>r.trim().toUpperCase()).filter(Boolean):delete i.excludeEventCodes,this._fireConfigChanged(i)}_sortOrderChanged(t){const e=this._selectValue(t);if(e===(this._config.sortOrder||"default"))return;const i={...this._config};e==="default"?delete i.sortOrder:i.sortOrder=e,this._fireConfigChanged(i)}_unavailableBehaviorChanged(t){const e=this._selectValue(t);if(e===(this._config.unavailableBehavior||"message"))return;const i={...this._config};e==="message"?delete i.unavailableBehavior:i.unavailableBehavior=e,this._fireConfigChanged(i)}_colorThemeChanged(t){const e=this._selectValue(t);if(e===(this._config.colorTheme||"severity"))return;const i={...this._config};e==="severity"?delete i.colorTheme:i.colorTheme=e,this._fireConfigChanged(i)}_tapActionChanged(t){var e,i,r;const o=this._selectValue(t);if(o===((i=(e=this._config.tap_action)==null?void 0:e.action)!=null?i:"default"))return;const s={...this._config};if(o==="default")delete s.tap_action;else{const n={...(r=s.tap_action)!=null?r:{},action:o};o!=="navigate"&&delete n.navigation_path,o!=="url"&&delete n.url_path,s.tap_action=n}this._fireConfigChanged(s)}_tapNavigationPathChanged(t){this._tapSubFieldChanged("navigation_path",t.target.value)}_tapUrlPathChanged(t){this._tapSubFieldChanged("url_path",t.target.value)}_tapSubFieldChanged(t,e){const i=this._config.tap_action;if(!i||e===(i[t]||""))return;const r={...i};e?r[t]=e:delete r[t],this._fireConfigChanged({...this._config,tap_action:r})}_fontSizeChanged(t){const e=this._selectValue(t);if(e===(this._config.fontSize||"default"))return;const i={...this._config};e==="default"?delete i.fontSize:i.fontSize=e,this._fireConfigChanged(i)}_progressFillChanged(t){const e=this._selectValue(t);if(e===(this._config.progressFill||"track"))return;const i={...this._config};e==="track"?delete i.progressFill:i.progressFill=e,this._fireConfigChanged(i)}_progressStyleChanged(t,e){var i,r,o;const s=this._selectValue(e),n=(r=(i=this._config.progressStyle)==null?void 0:i[t])!=null?r:St[t];if(s===n)return;const l={...this._config},d={...(o=l.progressStyle)!=null?o:{}};s===St[t]?delete d[t]:d[t]=s,Object.keys(d).length===0?delete l.progressStyle:l.progressStyle=d,this._fireConfigChanged(l)}_iconBorderStyleChanged(t,e){var i,r,o;const s=this._selectValue(e),n=(r=(i=this._config.iconBorderStyle)==null?void 0:i[t])!=null?r:Dt[t];if(s===n)return;const l={...this._config},d={...(o=l.iconBorderStyle)!=null?o:{}};s===Dt[t]?delete d[t]:d[t]=s,Object.keys(d).length===0?delete l.iconBorderStyle:l.iconBorderStyle=d,this._fireConfigChanged(l)}_timezoneChanged(t){const e=this._selectValue(t);if(e===(this._config.timezone||"server"))return;const i={...this._config};e==="server"?delete i.timezone:i.timezone=e,this._fireConfigChanged(i)}_minSeverityChanged(t){const e=this._selectValue(t);if(e===(this._config.minSeverity||"all"))return;const i={...this._config};e!=="all"?i.minSeverity=e:delete i.minSeverity,this._fireConfigChanged(i)}_previewChanged(t){const e=t.target;this._showPreview=e.checked;const i={...this._config};this._showPreview?i._preview=!0:delete i._preview,this._fireConfigChanged(i)}render(){var t,e,i,r,o,s,n,l,d,h,_,g,b,w;if(!this.hass||!this._config)return v``;const u=this._lang,f=!this._useWebAwesome,W=this._config.zones?this._config.zones.join(", "):"",$=this._config.eventCodes?this._config.eventCodes.join(", "):"",Q=this._config.excludeEventCodes?this._config.excludeEventCodes.join(", "):"",G=new Set;for(const A of Object.values(this.hass.states)){const J=(t=A.attributes)==null?void 0:t.source;typeof J=="string"&&G.add(J)}const D=new Set((e=this._config.sources)!=null?e:[]),q=io().filter(A=>G.has(A.source)||D.has(A.source)).map(A=>({value:A.source,label:c(`editor.provider_${A.provider}`,u)}));return v`
      <div class="editor">
        <!-- Entity & Provider -->
        <div class="section-label">${c("editor.section_entity",u)}</div>

        <ha-selector
          .hass=${this.hass}
          .selector=${{entity:{multiple:!0,include_entities:this._getMatchingEntityIds()}}}
          .value=${this._getSelectedEntities()}
          .label=${c("editor.entities",u)}
          .required=${!((i=this._config)!=null&&i.device)&&!((o=(r=this._config)==null?void 0:r.sources)!=null&&o.length)}
          @value-changed=${this._entityChanged}
        ></ha-selector>
        ${this._renderEntityWarning(u)}
        ${this._renderNoEntitiesHint(u)}

        <ha-selector
          .hass=${this.hass}
          .selector=${{device:{integration:"cap_alerts"}}}
          .value=${this._config.device||""}
          .label=${c("editor.device",u)}
          .helper=${c("editor.device_helper",u)}
          .helperPersistent=${!0}
          @value-changed=${this._deviceChanged}
        ></ha-selector>

        ${q.length>0?v`
              <ha-selector
                .hass=${this.hass}
                .selector=${{select:{multiple:!0,mode:"list",options:q}}}
                .value=${this._config.sources||[]}
                .label=${c("editor.feeds",u)}
                .helper=${c("editor.feeds_helper",u)}
                .helperPersistent=${!0}
                @value-changed=${this._feedsChanged}
              ></ha-selector>
              ${this._renderSourceHint(u)}
            `:m}

        <div class="preview-tools">
          <ha-formfield .label=${c("editor.show_preview",u)}>
            <ha-switch
              .checked=${this._showPreview}
              @change=${this._previewChanged}
            ></ha-switch>
          </ha-formfield>
          ${this._hasNoRealAlerts()&&!this._showPreview?v`<div class="preview-nudge">${c("editor.preview_nudge",u)}</div>`:v`<div class="preview-hint">${c("editor.preview_hint",u)}</div>`}
        </div>

        <ha-formfield .label=${c("editor.show_provider",u)}>
          <ha-switch
            .checked=${this._config.showProvider===!0}
            @change=${this._showProviderChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-textfield
          .label=${c("editor.title",u)}
          .value=${this._config.title||""}
          @change=${this._titleChanged}
        ></ha-textfield>

        <ha-select
          .label=${c("editor.provider",u)}
          .value=${this._config.provider||"auto"}
          @selected=${this._providerChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("auto",c("editor.provider_auto",u))}
          ${this._renderSelectItem("nws",c("editor.provider_nws",u))}
          ${this._renderSelectItem("bom",c("editor.provider_bom",u))}
          ${this._renderSelectItem("meteoalarm",c("editor.provider_meteoalarm",u))}
          ${this._renderSelectItem("dwd",c("editor.provider_dwd",u))}
          ${this._renderSelectItem("nina",c("editor.provider_nina",u))}
          ${this._renderSelectItem("meteoswiss",c("editor.provider_meteoswiss",u))}
          ${this._renderSelectItem("eccc",c("editor.provider_eccc",u))}
          ${this._renderSelectItem("nsw_rfs",c("editor.provider_nsw_rfs",u))}
          ${this._renderSelectItem("pirateweather",c("editor.provider_pirateweather",u))}
          ${this._renderSelectItem("cap",c("editor.provider_cap",u))}
        </ha-select>

        <!-- Filtering -->
        <div class="section-label">${c("editor.section_filtering",u)}</div>

        <ha-textfield
          .label=${c("editor.zones",u)}
          .value=${W}
          .helper=${c("editor.zones_helper",u)}
          .helperPersistent=${!0}
          @change=${this._zonesChanged}
        ></ha-textfield>

        <ha-textfield
          .label=${c("editor.event_codes",u)}
          .value=${$}
          .helper=${c("editor.event_codes_helper",u)}
          .helperPersistent=${!0}
          @change=${this._eventCodesChanged}
        ></ha-textfield>

        <ha-textfield
          .label=${c("editor.exclude_event_codes",u)}
          .value=${Q}
          .helper=${c("editor.exclude_event_codes_helper",u)}
          .helperPersistent=${!0}
          @change=${this._excludeEventCodesChanged}
        ></ha-textfield>

        <ha-select
          .label=${c("editor.min_severity",u)}
          .value=${this._config.minSeverity||"all"}
          @selected=${this._minSeverityChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("all",c("editor.severity_all",u))}
          ${this._renderSelectItem("minor",c("editor.severity_minor",u))}
          ${this._renderSelectItem("moderate",c("editor.severity_moderate",u))}
          ${this._renderSelectItem("severe",c("editor.severity_severe",u))}
          ${this._renderSelectItem("extreme",c("editor.severity_extreme",u))}
        </ha-select>

        <!-- Appearance -->
        <div class="section-label">${c("editor.section_appearance",u)}</div>

        <ha-formfield .label=${c("editor.compact",u)}>
          <ha-switch
            .checked=${this._config.layout==="compact"}
            @change=${this._layoutChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-select
          .label=${c("editor.color_theme",u)}
          .value=${this._config.colorTheme||"severity"}
          @selected=${this._colorThemeChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("severity",c("editor.color_severity",u))}
          ${this._renderSelectItem("nws",c("editor.color_nws",u))}
          ${this._renderSelectItem("meteoalarm",c("editor.color_meteoalarm",u))}
          ${this._renderSelectItem("eccc",c("editor.color_eccc",u))}
        </ha-select>

        <ha-select
          .label=${c("editor.enhance_contrast",u)}
          .value=${this._config.enhanceContrast||"subtle"}
          @selected=${this._enhanceContrastChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("off",c("editor.enhance_contrast_off",u))}
          ${this._renderSelectItem("subtle",c("editor.enhance_contrast_subtle",u))}
          ${this._renderSelectItem("strict",c("editor.enhance_contrast_strict",u))}
        </ha-select>

        <ha-select
          .label=${c("editor.font_size",u)}
          .value=${this._config.fontSize||"default"}
          @selected=${this._fontSizeChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("small",c("editor.font_size_small",u))}
          ${this._renderSelectItem("default",c("editor.font_size_default",u))}
          ${this._renderSelectItem("large",c("editor.font_size_large",u))}
          ${this._renderSelectItem("x-large",c("editor.font_size_x_large",u))}
        </ha-select>

        <ha-formfield .label=${c("editor.animations",u)}>
          <ha-switch
            .checked=${this._config.animations!==!1}
            @change=${this._animationsChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Per-phase progress/icon styling: power-user knobs with good
             defaults, collapsed by default so they cost one row until opened.
             Open state is local UI (not stored in config). -->
        <div
          class="section-label section-toggle ${this._config.progressFill||this._config.progressStyle||this._config.iconBorderStyle?"section-toggle-set":""}"
          @click=${()=>{this._showStyling=!this._showStyling}}
        >
          <span>${c("editor.styling_section",u)}</span>
          <ha-icon
            icon="mdi:chevron-down"
            class="section-chevron ${this._showStyling?"expanded":""}"
          ></ha-icon>
        </div>
        ${this._showStyling?v`
          <ha-select
            .label=${c("editor.progress_fill",u)}
            .value=${this._config.progressFill||"track"}
            @selected=${this._progressFillChanged}
            ?fixedMenuPosition=${f}
            ?naturalMenuWidth=${f}
          >
            ${this._renderSelectItem("track",c("editor.progress_fill_track",u))}
            ${this._renderSelectItem("background",c("editor.progress_fill_background",u))}
          </ha-select>

          <div class="sub-label">${c("editor.progress_style",u)}</div>
          ${this._config.progressFill==="background"?v`<div class="preview-hint">${c("editor.progress_style_wash_note",u)}</div>`:m}
          <div class="phase-row">
            ${["preparation","active","ongoing"].map(A=>{var J;return v`
              <ha-select
                .label=${c("editor.progress_style_"+A,u)}
                .value=${((J=this._config.progressStyle)==null?void 0:J[A])||St[A]}
                @selected=${be=>this._progressStyleChanged(A,be)}
                ?fixedMenuPosition=${f}
                ?naturalMenuWidth=${f}
              >
                ${this._renderSelectItem("solid",c("editor.deco_solid",u))}
                ${this._renderSelectItem("striped",c("editor.deco_striped",u))}
                ${this._renderSelectItem("shimmer",c("editor.deco_shimmer",u))}
                ${this._renderSelectItem("pulse",c("editor.deco_pulse",u))}
              </ha-select>
            `})}
          </div>

          <div class="sub-label">${c("editor.icon_border_style",u)}</div>
          <div class="phase-row">
            ${["preparation","active","ongoing"].map(A=>{var J;return v`
              <ha-select
                .label=${c("editor.progress_style_"+A,u)}
                .value=${((J=this._config.iconBorderStyle)==null?void 0:J[A])||Dt[A]}
                @selected=${be=>this._iconBorderStyleChanged(A,be)}
                ?fixedMenuPosition=${f}
                ?naturalMenuWidth=${f}
              >
                ${this._renderSelectItem("dashed",c("editor.icon_border_dashed",u))}
                ${this._renderSelectItem("solid",c("editor.icon_border_solid",u))}
              </ha-select>
            `})}
          </div>
        `:m}

        <ha-formfield .label=${c("editor.reformat_text",u)}>
          <ha-switch
            .checked=${this._config.reformatText!==!1}
            @change=${this._reformatTextChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Detail Panel -->
        <div class="section-label">${c("editor.section_detail_panel",u)}</div>

        <ha-formfield .label=${c("editor.show_details",u)}>
          <ha-switch
            .checked=${this._config.showDetails!==!1}
            @change=${this._showDetailsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.expand_details",u)}>
          <ha-switch
            .checked=${this._config.expandDetails===!0}
            .disabled=${this._config.showDetails===!1}
            @change=${this._expandDetailsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_metadata",u)}>
          <ha-switch
            .checked=${this._config.showMetadata!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showMetadataChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_description",u)}>
          <ha-switch
            .checked=${this._config.showDescription!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showDescriptionChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_instructions",u)}>
          <ha-switch
            .checked=${this._config.showInstructions!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showInstructionsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.show_geometry",u)}>
          <ha-switch
            .checked=${this._config.showGeometry===!0}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showGeometryChanged}
          ></ha-switch>
        </ha-formfield>

        ${this._config.showGeometry===!0?v`
          <ha-select
            .label=${c("editor.geometry_style",u)}
            .value=${this._config.geometryStyle||"shape"}
            .disabled=${this._config.showDetails===!1}
            @selected=${this._geometryStyleChanged}
            ?fixedMenuPosition=${f}
            ?naturalMenuWidth=${f}
          >
            ${this._renderSelectItem("shape",c("editor.geometry_style_shape",u))}
            ${this._renderSelectItem("map",c("editor.geometry_style_map",u))}
          </ha-select>
        `:m}

        <ha-formfield .label=${c("editor.show_source_link",u)}>
          <ha-switch
            .checked=${this._config.showSourceLink!==!1}
            .disabled=${this._config.showDetails===!1}
            @change=${this._showSourceLinkChanged}
          ></ha-switch>
        </ha-formfield>

        <!-- Behavior -->
        <div class="section-label">${c("editor.section_behavior",u)}</div>

        <ha-select
          .label=${c("editor.tap_action",u)}
          .value=${(n=(s=this._config.tap_action)==null?void 0:s.action)!=null?n:"default"}
          @selected=${this._tapActionChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("default",c("editor.tap_default",u))}
          ${this._renderSelectItem("details",c("editor.tap_details",u))}
          ${this._renderSelectItem("more-info",c("editor.tap_more_info",u))}
          ${this._renderSelectItem("navigate",c("editor.tap_navigate",u))}
          ${this._renderSelectItem("url",c("editor.tap_url",u))}
          ${this._renderSelectItem("toggle",c("editor.tap_toggle",u))}
          ${this._renderSelectItem("perform-action",c("editor.tap_perform_action",u))}
          ${this._renderSelectItem("fire-dom-event",c("editor.tap_fire_dom_event",u))}
          ${((l=this._config.tap_action)==null?void 0:l.action)==="call-service"?this._renderSelectItem("call-service",c("editor.tap_call_service",u)):""}
          ${this._renderSelectItem("none",c("editor.tap_none",u))}
        </ha-select>
        <div class="helper-text">${c("editor.tap_action_helper",u)}</div>
        ${((d=this._config.tap_action)==null?void 0:d.action)==="navigate"?v`<ha-textfield
            .label=${c("editor.tap_navigation_path",u)}
            .value=${this._config.tap_action.navigation_path||""}
            @change=${this._tapNavigationPathChanged}
          ></ha-textfield>`:""}
        ${((h=this._config.tap_action)==null?void 0:h.action)==="url"?v`<ha-textfield
            .label=${c("editor.tap_url_path",u)}
            .value=${this._config.tap_action.url_path||""}
            @change=${this._tapUrlPathChanged}
          ></ha-textfield>`:""}
        ${((_=this._config.tap_action)==null?void 0:_.action)==="perform-action"||((g=this._config.tap_action)==null?void 0:g.action)==="call-service"||((b=this._config.tap_action)==null?void 0:b.action)==="fire-dom-event"?v`<ha-alert alert-type="info">${c("editor.tap_yaml_managed",u)}</ha-alert>`:""}
        ${((w=this._config.tap_action)==null?void 0:w.action)==="details"&&this._config.expandDetails!==!0?v`<ha-alert alert-type="info">${c("editor.tap_details_expand_hint",u)}</ha-alert>`:""}

        <ha-select
          .label=${c("editor.sort_order",u)}
          .value=${this._config.sortOrder||"default"}
          @selected=${this._sortOrderChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("default",c("editor.sort_default",u))}
          ${this._renderSelectItem("onset",c("editor.sort_onset",u))}
          ${this._renderSelectItem("severity",c("editor.sort_severity",u))}
        </ha-select>

        <ha-select
          .label=${c("editor.timezone",u)}
          .value=${this._config.timezone||"server"}
          @selected=${this._timezoneChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("server",c("editor.tz_server",u))}
          ${this._renderSelectItem("browser",c("editor.tz_browser",u))}
        </ha-select>

        <ha-formfield .label=${c("editor.deduplicate",u)}>
          <ha-switch
            .checked=${this._config.deduplicate!==!1}
            @change=${this._deduplicateChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.deduplicate_headlines",u)}>
          <ha-switch
            .checked=${this._config.deduplicateHeadlines!==!1}
            @change=${this._deduplicateHeadlinesChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.hide_expired",u)}>
          <ha-switch
            .checked=${this._config.hideExpired!==!1}
            @change=${this._hideExpiredChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield .label=${c("editor.hide_no_alerts",u)}>
          <ha-switch
            .checked=${this._config.hideNoAlerts===!0}
            @change=${this._hideNoAlertsChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-select
          .label=${c("editor.unavailable_behavior",u)}
          .value=${this._config.unavailableBehavior||"message"}
          @selected=${this._unavailableBehaviorChanged}
          ?fixedMenuPosition=${f}
          ?naturalMenuWidth=${f}
        >
          ${this._renderSelectItem("message",c("editor.unavailable_message",u))}
          ${this._renderSelectItem("compact",c("editor.unavailable_compact",u))}
          ${this._renderSelectItem("hide",c("editor.unavailable_hide",u))}
        </ha-select>
        ${this._config.unavailableBehavior==="hide"?v`<ha-alert alert-type="warning">${c("editor.unavailable_hide_warning",u)}</ha-alert>`:""}

        <!-- Dismissal -->
        <div class="section-label">${c("editor.section_dismissal",u)}</div>

        <ha-formfield .label=${c("editor.allow_dismiss",u)}>
          <ha-switch
            .checked=${this._config.allowDismiss===!0}
            @change=${this._allowDismissChanged}
          ></ha-switch>
        </ha-formfield>

        ${this._config.allowDismiss===!0?v`
          <ha-select
            .label=${c("editor.dismiss_trigger",u)}
            .value=${this._config.dismissTrigger||"button"}
            @selected=${this._dismissTriggerChanged}
            ?fixedMenuPosition=${f}
            ?naturalMenuWidth=${f}
          >
            ${this._renderSelectItem("button",c("editor.dismiss_trigger_button",u))}
            ${this._renderSelectItem("swipe",c("editor.dismiss_trigger_swipe",u))}
            ${this._renderSelectItem("both",c("editor.dismiss_trigger_both",u))}
          </ha-select>

          ${this._config.dismissTrigger!=="swipe"?v`
            <ha-select
              .label=${c("editor.dismiss_button_style",u)}
              .value=${this._config.dismissButtonStyle||"icon"}
              @selected=${this._dismissButtonStyleChanged}
              ?fixedMenuPosition=${f}
              ?naturalMenuWidth=${f}
            >
              ${this._renderSelectItem("icon",c("editor.dismiss_button_style_icon",u))}
              ${this._renderSelectItem("labeled",c("editor.dismiss_button_style_labeled",u))}
            </ha-select>
          `:m}
        `:m}

        <ha-formfield .label=${c("editor.show_dismiss_undo",u)}>
          <ha-switch
            .checked=${this._config.showDismissUndo!==!1}
            .disabled=${this._config.allowDismiss!==!0}
            @change=${this._showDismissUndoChanged}
          ></ha-switch>
        </ha-formfield>

        ${this._renderDismissedStatus(u)}

      </div>
    `}_renderDismissedStatus(t){if(this._config.allowDismiss!==!0)return m;const e=this._getDismissedCount();return e===0?m:v`
      <div class="dismissed-status">
        ${c(e===1?"editor.dismissed_count_singular":"editor.dismissed_count",t,{count:e})}
        <a class="restore-link" @click=${this._onRestoreAll} tabindex="0" role="button">
          ${c("editor.restore_all",t)}
        </a>
      </div>
    `}};Le.styles=rr`
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
    /* Clickable disclosure header for the collapsible styling group. */
    .section-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }
    /* Marks the collapsed group when non-default overrides are set, so a closed
       section never hides that styling has been customized. */
    .section-toggle-set > span::after {
      content: '•';
      margin-left: 6px;
      color: var(--primary-color);
    }
    .section-chevron {
      --mdc-icon-size: 20px;
      transition: transform 0.2s;
      color: var(--secondary-text-color);
    }
    .section-chevron.expanded {
      transform: rotate(180deg);
    }
    /* Sub-heading inside the disclosure (lighter than a section-label). */
    .sub-label {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
    /* Three phase selects on one row; wrap to stacked on a narrow panel. */
    .phase-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .phase-row ha-select {
      flex: 1 1 110px;
      min-width: 110px;
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
    .helper-text {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
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
  `,K([ai({attribute:!1})],Le.prototype,"hass",void 0),K([ae()],Le.prototype,"_config",void 0),K([ae()],Le.prototype,"_showPreview",void 0),K([ae()],Le.prototype,"_showStyling",void 0),Le=pt=K([br("weather-alerts-card-editor")],Le);var gt;const wa="3.3.1";console.info(`%c  WEATHER-ALERTS-CARD  %c  Version ${wa}  `,"color: white; background: #555; font-weight: bold;","color: white; background: #007acc; font-weight: bold;");const xa={nws:"NWS",bom:"BoM",meteoalarm:"MeteoAlarm",dwd:"DWD",meteoswiss:"MeteoSwiss",eccc:"Environment Canada",pirateweather:"Pirate Weather",cap:"CAP",nsw_rfs:"NSW RFS",nina:"NINA"},Ea={nws:"NWS",bom:"BoM",meteoalarm:"MA",dwd:"DWD",meteoswiss:"MS",eccc:"EC",pirateweather:"PW",cap:"CAP",nsw_rfs:"RFS",nina:"NINA"},Aa=new Set(["button","scene","script","input_button"]);function Ca(){const t=Date.now()/1e3,e=3600;return[{id:"preview-1",event:"Gentle Wind Watch",severity:"minor",severityLabel:"Minor",certainty:"Possible",urgency:"Future",sentTs:t-1*e,onsetTs:t+1*e,endsTs:t+6*e,description:"A gentle breeze may arrive later. This is sample data showing an upcoming alert.",instruction:"",url:"",headline:"Gentle Wind Watch for Sampletown County",areaDesc:"Sampletown County",zones:["SAMPLE02"],eventCode:"WIA",provider:"nws",phase:"",severityInferred:!0,certaintyInferred:!1},{id:"preview-2",event:"Sunshine Heat Advisory",severity:"moderate",severityLabel:"Moderate",certainty:"Likely",urgency:"Expected",sentTs:t-2*e,onsetTs:t-1*e,endsTs:t+2*e,description:"This is a sample alert demonstrating the card layout. No action required.",instruction:"Enjoy the weather! This is placeholder data for the card preview.",url:"",headline:"Sunshine Heat Advisory for Pleasantville",areaDesc:"Pleasantville, USA",zones:["SAMPLE01"],eventCode:"HTA",provider:"nws",phase:"Update",severityInferred:!1,certaintyInferred:!1},{id:"preview-3",event:"Frost Advisory",severity:"minor",severityLabel:"Minor",certainty:"Likely",urgency:"Expected",sentTs:t-8*e,onsetTs:t-6*e,endsTs:t-2*e,description:"A light frost occurred overnight. This is sample data showing an expired alert.",instruction:"",url:"",headline:"Frost Advisory expired for Pleasantville",areaDesc:"Pleasantville, USA",zones:["SAMPLE01"],eventCode:"FRA",provider:"nws",phase:"",severityInferred:!1,certaintyInferred:!0}]}let X=gt=class extends We{constructor(){super(...arguments),this._expandedAlerts=new Map,this._forcePreview=!1,this._detailPopupAlertId=null,this._dismissals=new Map,this._dismissalsScope="",this._swipeState=null,this._swipeStartX=0,this._swipeStartY=0,this._swipeCurrentDx=0,this._swipeRAF=null,this._swipePointerId=null,this._swipeExitTimeout=null,this._swipeJustDragged=!1,this._swipeExiting=null,this._registryEntries=null,this._geometryCache=new Map,this._geometryInFlight=new Set,this._motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)"),this._onMotionChange=()=>this.requestUpdate(),this._pendingDismissals=null,this._dismissalReconcileScheduled=!1}connectedCallback(){super.connectedCallback(),this._motionQuery.addEventListener("change",this._onMotionChange),this._config&&(this._dismissalsScope="",this._reloadDismissalsIfScopeChanged()),this._maybeSubscribeRegistry()}disconnectedCallback(){var t,e,i;super.disconnectedCallback(),this._motionQuery.removeEventListener("change",this._onMotionChange),(t=this._unsubscribeDismissals)==null||t.call(this),this._unsubscribeDismissals=void 0,this._teardownRegistrySubscription(),this._geometryInFlight.clear(),this._swipeRAF!==null&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null),this._swipeExitTimeout!==null&&(clearTimeout(this._swipeExitTimeout),this._swipeExitTimeout=null),this._swipeState=null,this._swipeExiting=null,((e=this._config)!=null&&e.entity||(i=this._config)!=null&&i.device)&&gt._editorExpandedState.set(this._entityStateKey(),this._expandedAlerts)}updated(t){super.updated(t),(t.has("hass")||t.has("_config"))&&this.isConnected&&(this._maybeSubscribeRegistry(),this._maybeFetchGeometry());const e=this._detailPopupEl;this._detailPopupAlertId&&!e?this._closeDetailPopup():e&&!e.open&&(typeof e.showModal=="function"?e.showModal():e.setAttribute("open",""))}_maybeSubscribeRegistry(){var t,e,i;if(!((t=this._config)!=null&&t.device)){this._teardownRegistrySubscription();return}const r=(e=this.hass)==null?void 0:e.connection;!r||r===this._subscribedRegistryConn||((i=this._unsubscribeRegistry)==null||i.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=r,yi(r,o=>{this._registryEntries=o,this.requestUpdate()}).then(o=>{if(this._subscribedRegistryConn!==r){o();return}this._unsubscribeRegistry=o}).catch(()=>{this._subscribedRegistryConn===r&&(this._subscribedRegistryConn=void 0)}))}_teardownRegistrySubscription(){var t;(t=this._unsubscribeRegistry)==null||t.call(this),this._unsubscribeRegistry=void 0,this._subscribedRegistryConn=void 0}_maybeFetchGeometry(){var t,e;if(((t=this._config)==null?void 0:t.showGeometry)!==!0)return;const i=(e=this.hass)==null?void 0:e.connection;if(!i)return;i!==this._geometryConn&&(this._geometryCache=new Map,this._geometryInFlight.clear(),this._geometryConn=i);const r=new Set;for(const o of this._getAlerts(!1))o.geometryRef&&r.add(o.geometryRef);for(const o of[...this._geometryCache.keys()])r.has(o)||this._geometryCache.delete(o);for(const o of[...this._geometryInFlight])r.has(o)||this._geometryInFlight.delete(o);for(const o of r)this._geometryCache.has(o)||this._geometryInFlight.has(o)||(this._geometryInFlight.add(o),ua(i,o).then(s=>{i===this._geometryConn&&(this._geometryInFlight.delete(o),this._geometryCache.set(o,s),this.requestUpdate())}).catch(()=>{i===this._geometryConn&&this._geometryInFlight.delete(o)}))}setConfig(t){var e,i;if(!(t.entity||(e=t.entities)!=null&&e.length)&&!t.device&&!((i=t.sources)!=null&&i.length))throw new Error("You need to define an entity, device, or feed");const{_preview:r,...o}=t;!o.entity&&o.entities&&o.entities.length>0&&(o.entity=o.entities[0]),this._config=o,this._forcePreview=!!r;const s=this._entityStateKey(),n=gt._editorExpandedState.get(s);n&&(this._expandedAlerts=n),this._reloadDismissalsIfScopeChanged()}get _scopeHash(){return so(this._config)}_configuredScopeTokens(){return oo(this._config)}_reloadDismissalsIfScopeChanged(){const t=this._scopeHash;t!==this._dismissalsScope&&(this._dismissalsScope=t,this._dismissals=t?Ci(t):new Map,this._resubscribeDismissals())}_resubscribeDismissals(){var t;(t=this._unsubscribeDismissals)==null||t.call(this),this._unsubscribeDismissals=void 0,!(!this.isConnected||!this._dismissalsScope)&&(this._unsubscribeDismissals=no(this._dismissalsScope,()=>{this._dismissals=Ci(this._dismissalsScope)}))}getCardSize(){const t=this._getAlerts(!1),e=this._isCompact?1:3;return Math.max(1,t.length*e)}static getConfigElement(){return document.createElement("weather-alerts-card-editor")}static getStubConfig(t){if(t){const e=Object.keys(t.states).filter(i=>fi.some(r=>r.test(i))).find(i=>{const r=t.states[i];return r.state!=="0"&&r.state!=="off"&&r.state!=="unknown"&&r.state!=="unavailable"});if(e)return{entity:e}}return{entity:"sensor.nws_alerts_alerts"}}_getAllEntities(){if(!this._config)return[];const t=this._config.entity,e=this._config.entities||[],i=new Set,r=[];for(const o of[t,...e])o&&!i.has(o)&&(i.add(o),r.push(o));if(this._config.device&&this.hass)for(const o of bi(this.hass,this._config.device,this._registryEntries))i.has(o)||(i.add(o),r.push(o));if(this._config.sources&&this._config.sources.length>0&&this.hass)for(const o of this._resolveSourceEntities(this._config.sources))i.has(o)||(i.add(o),r.push(o));return r}_resolveSourceEntities(t){var e;if(!this.hass)return[];const i=new Set(t),r=[];for(const[o,s]of Object.entries(this.hass.states)){const n=(e=s.attributes)==null?void 0:e.source;typeof n=="string"&&i.has(n)&&Lt(s.attributes)&&r.push(o)}return r.sort()}_entityStateKey(){return[...this._configuredScopeTokens()].sort().join(",")}_deviceHasAnyEntity(t){return this.hass?oa(this.hass,t,this._registryEntries):!1}_getAlerts(t=!0){if(!this.hass||!this._config)return[];const e=[],i=[],r=new Set;for(const s of this._getAllEntities()){const n=this.hass.states[s];if(!n)continue;const l=vi(this._config.provider,n.attributes);r.has(l.provider)||(r.add(l.provider),i.push(l.provider));const d=l.parseAlerts(n.attributes);for(const h of d)h.sourceEntityId=s;e.push(...d)}let o=this._filterAndSort(e,{providerPriority:i});if(this._config.allowDismiss&&!this._forcePreview&&this._dismissals.size>0){const{visible:s,updatedMap:n}=ca(o,this._dismissals);t&&n!==this._dismissals&&this._scheduleDismissalReconcile(n),o=s}return o}_scheduleDismissalReconcile(t){this._pendingDismissals=t,!this._dismissalReconcileScheduled&&(this._dismissalReconcileScheduled=!0,queueMicrotask(()=>{this._dismissalReconcileScheduled=!1;const e=this._pendingDismissals;this._pendingDismissals=null,!(!e||!this._dismissalsScope)&&(this._dismissals=e,$i(this._dismissalsScope,e))}))}_onDismiss(t){var e;if(!this._dismissalsScope)return;const i=aa(this._dismissals,t);this._dismissals=i,$i(this._dismissalsScope,i),((e=this._config)==null?void 0:e.showDismissUndo)!==!1&&this._fireUndoToast(t)}_onUndo(t){if(!this._dismissalsScope)return;const e=la(this._dismissals,t);e!==this._dismissals&&(this._dismissals=e,$i(this._dismissalsScope,e))}_fireUndoToast(t){const e=this._lang;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:c("card.dismissed_toast",e,{event:t.event}),duration:4e3,action:{text:c("card.dismissed_toast_undo",e),action:()=>this._onUndo(t.id)}},bubbles:!0,composed:!0}))}_canDismiss(){var t;return!!((t=this._config)!=null&&t.allowDismiss)&&!this._forcePreview}_swipeEnabled(){var t,e;return this._canDismiss()&&(((t=this._config)==null?void 0:t.dismissTrigger)==="swipe"||((e=this._config)==null?void 0:e.dismissTrigger)==="both")}_onSwipePointerDown(t,e){if(!this._swipeEnabled()||this._swipeState||e.button!==0)return;this._swipePointerId=e.pointerId,this._swipeStartX=e.clientX,this._swipeStartY=e.clientY,this._swipeCurrentDx=0;const i=e.currentTarget.getBoundingClientRect();this._swipeState={id:t.id,offset:0,locked:!1,cardWidth:i.width}}_onSwipePointerMove(t,e){if(!this._swipeState||this._swipeState.id!==t.id||e.pointerId!==this._swipePointerId)return;const i=e.clientX-this._swipeStartX,r=e.clientY-this._swipeStartY;if(!this._swipeState.locked){if(Math.abs(r)-Math.abs(i)>12){this._swipeState=null;return}if(i>=0){this._swipeState=null;return}e.currentTarget.setPointerCapture(e.pointerId),this._swipeState={...this._swipeState,locked:!0}}this._swipeCurrentDx=Math.min(0,i),this._swipeRAF===null&&(this._swipeRAF=requestAnimationFrame(()=>{this._swipeRAF=null,!(!this._swipeState||this._swipeState.id!==t.id)&&(this._swipeState={...this._swipeState,offset:this._swipeCurrentDx},this.requestUpdate())}))}_onSwipePointerUp(t,e){if(!this._swipeState||this._swipeState.id!==t.id||e.pointerId!==this._swipePointerId)return;const i=e.currentTarget;i.hasPointerCapture(e.pointerId)&&i.releasePointerCapture(e.pointerId),this._swipeRAF!==null&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null);const{offset:r,cardWidth:o,locked:s}=this._swipeState;if(this._swipeState=null,this._swipePointerId=null,s&&(this._swipeJustDragged=!0,setTimeout(()=>{this._swipeJustDragged=!1},0)),s&&r<=-(o*.4)){this._swipeExiting=t.id;const n=this._motionQuery.matches?0:200;this._swipeExitTimeout=window.setTimeout(()=>{this._swipeExitTimeout=null,this._swipeExiting=null,this._onDismiss(t)},n)}else this.requestUpdate()}_onSwipePointerCancel(t,e){if(!this._swipeState||this._swipeState.id!==t.id||e.pointerId!==this._swipePointerId)return;const i=e.currentTarget;i.hasPointerCapture(e.pointerId)&&i.releasePointerCapture(e.pointerId),this._swipeRAF!==null&&(cancelAnimationFrame(this._swipeRAF),this._swipeRAF=null),this._swipeState=null,this._swipePointerId=null,this.requestUpdate()}_swipeCardStyle(t,e){var i;if(this._swipeExiting===t.id)return e;if(((i=this._swipeState)==null?void 0:i.id)===t.id){const{offset:r,cardWidth:o}=this._swipeState,s=Math.max(0,1+r/o).toFixed(2);return`${e} transform: translateX(${r}px); opacity: ${s};`}return e}_swipeCardClass(t){var e;const i=[];return this._swipeEnabled()&&i.push("swipe-enabled"),this._swipeExiting===t.id?i.push("swipe-exit"):((e=this._swipeState)==null?void 0:e.id)===t.id&&this._swipeState.locked&&i.push("swiping"),i.join(" ")}_isLabeledDismissActive(){var t,e;return this._canDismiss()&&((t=this._config)==null?void 0:t.dismissTrigger)!=="swipe"&&((e=this._config)==null?void 0:e.dismissButtonStyle)==="labeled"&&!this._isCompact}_renderDismissButton(t){var e;return this._canDismiss()?((e=this._config)==null?void 0:e.dismissTrigger)==="swipe"?m:this._isLabeledDismissActive()?v`
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
      `:v`
      <button
        type="button"
        class="dismiss-button"
        aria-label=${c("card.dismiss",this._lang)}
        title=${c("card.dismiss",this._lang)}
        @click=${i=>{i.stopPropagation(),this._onDismiss(t)}}
      >
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    `:m}_filterAndSort(t,e){var i;if(!this._config)return t;let r=t;if(this._config.deduplicate!==!1&&(r=en(r,e==null?void 0:e.providerPriority)),!(e!=null&&e.skipZones)&&this._config.zones&&this._config.zones.length>0){const o=new Set(this._config.zones.map(s=>s.toUpperCase()));r=r.filter(s=>Js(s,o))}if(this._config.eventCodes&&this._config.eventCodes.length>0){const o=new Set(this._config.eventCodes.map(s=>s.toUpperCase()));r=r.filter(s=>s.eventCode&&o.has(s.eventCode.toUpperCase()))}if(this._config.excludeEventCodes&&this._config.excludeEventCodes.length>0){const o=new Set(this._config.excludeEventCodes.map(s=>s.toUpperCase()));r=r.filter(s=>!s.eventCode||!o.has(s.eventCode.toUpperCase()))}if(this._config.minSeverity){const o={extreme:0,severe:1,moderate:2,minor:3,unknown:4},s=(i=o[this._config.minSeverity])!=null?i:4;r=r.filter(n=>{var l;return n.severity==="unknown"||((l=o[n.severity])!=null?l:4)<=s})}if(this._config.hideExpired!==!1){const o=Date.now()/1e3;r=r.filter(s=>s.endsTs===0||s.endsTs>o)}return Qs(r,this._config.sortOrder||"default")}get _locale(){var t,e;if(!this.hass)return{language:navigator.language||"en",time_format:"language",date_format:"language",timeZone:void 0};const i=((t=this._config)==null?void 0:t.timezone)==="browser"?Intl.DateTimeFormat().resolvedOptions().timeZone:(e=this.hass.config)==null?void 0:e.time_zone;return{...this.hass.locale,timeZone:i}}get _lang(){var t,e;return((e=(t=this.hass)==null?void 0:t.locale)==null?void 0:e.language)||"en"}get _animationsEnabled(){var t,e;return((t=this._config)==null?void 0:t.animations)===!0?!0:((e=this._config)==null?void 0:e.animations)===!1?!1:!this._motionQuery.matches}get _isCompact(){var t;return((t=this._config)==null?void 0:t.layout)==="compact"}get _colorTheme(){var t;return((t=this._config)==null?void 0:t.colorTheme)||"severity"}get _fontScale(){var t;switch((t=this._config)==null?void 0:t.fontSize){case"small":return .85;case"large":return 1.2;case"x-large":return 1.4;default:return}}get _scaleStyle(){const t=this._fontScale;return t!==void 0?`--wac-scale: ${t}`:""}_scaledPx(t){const e=this._fontScale;return e!==void 0?Math.round(t*e):t}get _contrastMode(){var t;return Us((t=this._config)==null?void 0:t.enhanceContrast)}_alertColorStyle(t){if(this._colorTheme==="nws"){const{color:e,rgb:i,textColorLight:r,textColorDark:o}=Or(t.event,this._contrastMode);return`--color: ${e}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${o};`}if(this._colorTheme==="meteoalarm"){const{color:e,rgb:i,textColorLight:r,textColorDark:o}=Ur(t.severity,this._contrastMode);return`--color: ${e}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${o};`}if(this._colorTheme==="eccc"){const{color:e,rgb:i,textColorLight:r,textColorDark:o}=Wr(t,this._contrastMode);return`--color: ${e}; --color-rgb: ${i}; --color-on-light: ${r}; --color-on-dark: ${o};`}return""}_alertBoostClasses(t){const e=this._contrastMode;if(e==="off")return"";let i=null;if(this._colorTheme==="nws"?i=Or(t.event,e):this._colorTheme==="meteoalarm"?i=Ur(t.severity,e):this._colorTheme==="eccc"&&(i=Wr(t,e)),!i)return"";const r=[];return i.boostLight&&r.push("boost-light"),i.boostDark&&r.push("boost-dark"),i.progressBoostLight&&r.push("progress-boost-light"),i.progressBoostDark&&r.push("progress-boost-dark"),r.join(" ")}_decoPhase(t){return t.isExpired?null:t.isActive?t.hasEndTime?"active":"ongoing":"preparation"}_alertDecoClasses(t){var e,i,r,o,s,n;const l=this._decoPhase(t);if(!l)return"";const d=(r=(i=(e=this._config)==null?void 0:e.progressStyle)==null?void 0:i[l])!=null?r:St[l],h=(n=(s=(o=this._config)==null?void 0:o.iconBorderStyle)==null?void 0:s[l])!=null?n:Dt[l];return`deco-${d} icon-border-${h}`}get _themeMode(){var t,e;const i=(e=(t=this.hass)==null?void 0:t.themes)==null?void 0:e.darkMode;return typeof i=="boolean"?i?"dark":"light":window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}_normalizeText(t){return(t||"").replace(/\n{2,}/g,`

`).trim()}_toggleDetails(t){var e,i;if(this._swipeJustDragged){this._swipeJustDragged=!1;return}const r=new Map(this._expandedAlerts);r.set(t,!r.get(t)),this._expandedAlerts=r,((e=this._config)!=null&&e.entity||(i=this._config)!=null&&i.device)&&gt._editorExpandedState.set(this._entityStateKey(),r)}_onCardAction(t){var e,i,r;if(this._swipeJustDragged){this._swipeJustDragged=!1;return}const o=(e=this._config)==null?void 0:e.tap_action;if(!(!o||o.action==="none")){if(o.action==="details"){this._openDetailPopup(t);return}ba(this,this.hass,o,(r=t.sourceEntityId)!=null?r:(i=this._config)==null?void 0:i.entity)}}_openDetailPopup(t){this._detailPopupAlertId=t.id}_closeDetailPopup(){this._detailPopupAlertId=null}_onCardActionKeydown(t,e){e.key!=="Enter"&&e.key!==" "&&e.key!=="Spacebar"||(e.preventDefault(),this._onCardAction(t))}_sourceLinkLabel(t){const e=xa[t.provider]||"Alert";return c("card.open_source",this._lang,{provider:e})}_isBroken(t){var e;return(t.state==="unavailable"||t.state==="unknown")&&vi((e=this._config)==null?void 0:e.provider,t.attributes).parseAlerts(t.attributes).length===0}_friendlyName(t){var e,i,r;return((r=(i=(e=this.hass)==null?void 0:e.states[t])==null?void 0:i.attributes)==null?void 0:r.friendly_name)||t}_deviceName(t){var e,i;const r=(i=(e=this.hass)==null?void 0:e.devices)==null?void 0:i[t];return(r==null?void 0:r.name_by_user)||(r==null?void 0:r.name)||null}_brokenSources(){var t,e,i;if(!this.hass)return[];const r=[],o=new Set;for(const s of[(t=this._config)==null?void 0:t.entity,...((e=this._config)==null?void 0:e.entities)||[]]){if(!s||o.has(s))continue;o.add(s);const n=this.hass.states[s];n&&this._isBroken(n)&&r.push({name:this._friendlyName(s)})}if((i=this._config)!=null&&i.device){let s=!1,n=!1;for(const l of ra(this.hass,this._config.device,this._registryEntries)){if(Aa.has(l.split(".",1)[0]))continue;const d=this.hass.states[l];d&&(vi(this._config.provider,d.attributes).parseAlerts(d.attributes).length>0?s=!0:(d.state==="unavailable"||d.state==="unknown")&&(n=!0))}!s&&n&&r.push({name:this._deviceName(this._config.device)})}return r}_degradedLabel(t){return t.length===1?t[0].name?c("card.sources_unavailable_named",this._lang,{name:t[0].name}):c("card.sources_unavailable_one",this._lang):c("card.sources_unavailable_count",this._lang,{count:t.length})}_renderDegradedStrip(t){const e=this._degradedLabel(t);return v`
      <div class="degraded-badge">
        <ha-icon icon="mdi:alert-outline"></ha-icon>
        <span>${e}</span>
      </div>
    `}_renderDegradedDot(t){const e=this._degradedLabel(t);return v`
      <span class="degraded-dot" role="img" title=${e} aria-label=${e}>
        <ha-icon icon="mdi:alert-outline"></ha-icon>
      </span>
    `}render(){if(!this._config)return v``;if(!this.hass)return this._renderPreview();const t=this._getAllEntities().map(b=>this.hass.states[b]).filter(Boolean),e=!!this._config.device&&this._deviceHasAnyEntity(this._config.device);if(t.length===0&&!e||this._forcePreview)return this._renderPreview();const i=this._brokenSources(),r=this._config.unavailableBehavior||"message",o=i.length>0&&r!=="hide",s=this._getAlerts(),n=s.length>0;if(!n&&this._config.hideNoAlerts&&!o)return this.style.display="none",v``;this.style.display="";const l=this._animationsEnabled?"":"no-animations",d=this._isCompact?"compact":"",h=this._config.progressFill==="background"?"fill-mode-background":"",_=o&&n&&r==="message",g=o&&n&&r==="compact";return v`
      <ha-card .header=${this._config.title||""} class="${l} ${d} ${h}" data-theme-mode=${this._themeMode} style=${this._scaleStyle}>
        ${g?this._renderDegradedDot(i):m}
        ${_?this._renderDegradedStrip(i):m}
        ${n?s.map(b=>this._renderAlert(b)):this._renderNoAlerts(o?i:[])}
      </ha-card>
      ${this._renderDetailPopup(s)}
    `}_renderDetailPopup(t){if(!this._detailPopupAlertId)return m;const e=t.find(n=>n.id===this._detailPopupAlertId);if(!e)return m;const i=Hr(e),r=i.isActive&&!i.hasEndTime,o=["alert-card",`severity-${e.severity}`,i.phaseText.toLowerCase(),r?"ongoing":"",this._alertDecoClasses(i),this._alertBoostClasses(e)].filter(Boolean).join(" "),s=`${this._alertColorStyle(e)} --progress: ${r?0:i.progressPct}%;`;return v`
      <dialog
        class="detail-dialog"
        aria-label=${e.event}
        @close=${()=>this._closeDetailPopup()}
        @click=${this._onDetailPopupClick}
      >
        <div
          class="detail-dialog-body ${this._animationsEnabled?"":"no-animations"}"
          data-theme-mode=${this._themeMode}
          style=${this._scaleStyle}
        >
          <div class=${o} style=${s}>
            ${this._renderAlertBody(e,i,{expanded:!0,inPopup:!0})}
          </div>
        </div>
      </dialog>
    `}_onDetailPopupClick(t){t.target===t.currentTarget&&this._dismissDetailPopup(t.currentTarget)}_dismissDetailPopup(t){const e=t!=null?t:this._detailPopupEl;e&&typeof e.close=="function"?e.close():this._closeDetailPopup()}_renderDetailPopupClose(){const t=c("card.close",this._lang);return v`
      <button
        type="button"
        class="detail-dialog-close"
        aria-label=${t}
        title=${t}
        @click=${()=>this._dismissDetailPopup()}
      >
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    `}get _detailPopupEl(){var t,e;return(e=(t=this.shadowRoot)==null?void 0:t.querySelector("dialog.detail-dialog"))!=null?e:null}_renderPreview(){var t;const e=this._filterAndSort(Ca(),{skipZones:!0}),i=this._animationsEnabled?"":"no-animations",r=this._isCompact?"compact":"",o=((t=this._config)==null?void 0:t.progressFill)==="background"?"fill-mode-background":"";return v`
      <ha-card .header=${this._config.title||""} class="${i} ${r} ${o}" data-theme-mode=${this._themeMode} style=${this._scaleStyle}>
        <div class="preview-label">${c("card.preview",this._lang)}</div>
        ${e.map(s=>this._renderAlert(s))}
      </ha-card>
    `}_renderNoAlerts(t=[]){return v`
      <div class="no-alerts">
        <ha-icon icon="mdi:weather-sunny"></ha-icon><br>
        ${c("card.no_alerts",this._lang)}
        ${t.length>0?v`<div class="no-alerts-caveat">
            <ha-icon icon="mdi:alert-outline"></ha-icon>${this._degradedLabel(t)}
          </div>`:m}
      </div>
    `}_renderAlert(t){const e=`severity-${t.severity}`,i=Hr(t),r=i.phaseText.toLowerCase(),o=this._expandedAlerts.get(t.id)||!1;return this._isCompact?this._renderCompactAlert(t,e,r,i,o):this._renderFullAlert(t,e,r,i,o)}_renderCompactAlert(t,e,i,r,o){var s;const n=this._lang,l=r.isActive&&!r.hasEndTime,d=r.isExpired?c("progress.compact_expired",n,{time:qe(r.endsTs,r.nowTs)}):l?c("progress.compact_ongoing",n):r.isActive?c("progress.compact_active",n,{time:qe(r.endsTs,r.nowTs)}):c("progress.compact_prep",n,{time:qe(r.onsetTs,r.nowTs)}),h=l?"ongoing":"",_=this._alertBoostClasses(t),g=this._alertDecoClasses(r),b=l?"":`--progress: ${r.progressPct}%;`,w=this._swipeCardClass(t),u=Fi(this._config),f=u&&this._config.tap_action.action!=="none",W=this._swipeCardStyle(t,`${this._alertColorStyle(t)} ${b}`);return v`
      <div
        class="alert-card ${e} ${i} ${h} ${g} ${_} ${w} ${f?"tappable":""}"
        style=${W}
        role=${f?"button":m}
        tabindex=${f?"0":m}
        @pointerdown=${$=>this._onSwipePointerDown(t,$)}
        @pointermove=${$=>this._onSwipePointerMove(t,$)}
        @pointerup=${$=>this._onSwipePointerUp(t,$)}
        @pointercancel=${$=>this._onSwipePointerCancel(t,$)}
        @click=${f?()=>this._onCardAction(t):m}
        @keydown=${f?$=>this._onCardActionKeydown(t,$):m}
      >
        <div
          class="alert-header-row compact-row"
          @click=${u?m:()=>this._toggleDetails(t.id)}
        >
          <div class="icon-box">
            <ha-icon icon=${(s=t.providerIcon)!=null?s:Pr(t.iconHint||t.event)}></ha-icon>
          </div>
          ${this._renderProviderHint(t)}
          <span class="alert-title">${t.event}</span>
          <span class="compact-time">${d}</span>
          ${u?m:v`
          <ha-icon
            icon="mdi:chevron-down"
            class="compact-chevron ${o?"expanded":""}"
          ></ha-icon>
          `}
          ${this._renderDismissButton(t)}
        </div>
        ${o?this._renderExpandedContent(t,r):m}
      </div>
    `}_renderExpandedContent(t,e){var i,r;return v`
      <div class="alert-expanded">
        ${this._renderHeadline(t)}
        ${t.areaDesc?v`
          <div class="area-desc" title=${t.areaDesc}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span class="area-desc-text">${t.areaDesc}</span>
          </div>
        `:m}
        <div class="badges-row" style="padding: 0 12px 8px;">
          ${this._renderBadgesRow(t,e)}
        </div>

        ${this._renderProgressSection(t,e)}

        ${((i=this._config)==null?void 0:i.showDetails)!==!1?(r=this._config)!=null&&r.expandDetails?v`
        ${this._renderDetailsContent(t,e)}
        `:v`
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
          ${this._expandedAlerts.get(t.id+"_details")?this._renderDetailsContent(t,e):m}
        </div>
        `:m}
      </div>
    `}_renderFullAlert(t,e,i,r,o){const s=this._alertBoostClasses(t),n=this._alertDecoClasses(r),l=this._swipeCardClass(t),d=Fi(this._config)&&this._config.tap_action.action!=="none",h=r.isActive&&!r.hasEndTime?"--progress: 0%;":`--progress: ${r.progressPct}%;`,_=this._swipeCardStyle(t,`${this._alertColorStyle(t)} ${h}`);return v`
      <div
        class="alert-card ${e} ${i} ${n} ${s} ${l} ${d?"tappable":""}"
        style=${_}
        role=${d?"button":m}
        tabindex=${d?"0":m}
        @pointerdown=${g=>this._onSwipePointerDown(t,g)}
        @pointermove=${g=>this._onSwipePointerMove(t,g)}
        @pointerup=${g=>this._onSwipePointerUp(t,g)}
        @pointercancel=${g=>this._onSwipePointerCancel(t,g)}
        @click=${d?()=>this._onCardAction(t):m}
        @keydown=${d?g=>this._onCardActionKeydown(t,g):m}
      >
        ${this._renderAlertBody(t,r,{expanded:o,inPopup:!1})}
      </div>
    `}_renderAlertBody(t,e,i){var r,o,s,n;const l=Fi(this._config),d=((r=this._config)==null?void 0:r.showDetails)!==!1;return v`
      <div class="alert-header-row">
        <div class="icon-box">
          <ha-icon icon=${(o=t.providerIcon)!=null?o:Pr(t.iconHint||t.event)}></ha-icon>
        </div>
        <div class="info-box">
          <div class="title-row">
            ${this._renderProviderHint(t)}
            <span class="alert-title">${t.event}</span>
          </div>
          ${this._renderHeadline(t)}
          ${t.areaDesc?v`
            <div class="area-desc" title=${t.areaDesc}>
              <ha-icon icon="mdi:map-marker"></ha-icon>
              <span class="area-desc-text">${t.areaDesc}</span>
            </div>
          `:m}
          <div class="badges-row">
            ${this._renderBadgesRow(t,e)}
          </div>
        </div>
        ${i.inPopup?this._renderDetailPopupClose():this._renderDismissButton(t)}
      </div>

      ${this._renderProgressSection(t,e)}

      ${i.inPopup?d?this._renderDetailsContent(t,e):m:l?d&&(s=this._config)!=null&&s.expandDetails?this._renderDetailsContent(t,e):m:d?(n=this._config)!=null&&n.expandDetails?v`
      ${this._renderDetailsContent(t,e)}
      `:v`
      <div class="alert-details-section">
        <div
          class="details-summary"
          @click=${()=>this._toggleDetails(t.id)}
        >
          <span>${c("card.read_details",this._lang)}</span>
          <ha-icon
            icon="mdi:chevron-down"
            class="chevron ${i.expanded?"expanded":""}"
          ></ha-icon>
        </div>
        ${i.expanded?this._renderDetailsContent(t,e):m}
      </div>
      `:m}
    `}_renderProviderHint(t){var e;if(((e=this._config)==null?void 0:e.showProvider)!==!0)return m;const i=Ea[t.provider]||t.provider.toUpperCase();return v`<span class="provider-hint">${i}</span>`}_renderHeadline(t){var e;const i=((e=this._config)==null?void 0:e.deduplicateHeadlines)!==!1,r=Xs(t,i);return r?v`
      <div class="alert-headline" title=${t.headline}>
        ${r}
      </div>
    `:m}_renderBadgesRow(t,e){var i;const r=(i=t.severityBadgeLabel)!=null?i:c("badge.severity_"+t.severity,this._lang),o=t.certainty?c("badge.certainty_"+t.certainty.toLowerCase(),this._lang):"";return v`
      <span class="badge severity-badge${t.severityInferred?" badge-inferred":""}">${r}</span>
      ${t.certainty?v`
        <span class="badge certainty-badge${t.certaintyInferred?" badge-inferred":""}">
          <ha-icon
            icon=${Rs(t.certainty)}
            style="--mdc-icon-size: ${this._scaledPx(14)}px; width: ${this._scaledPx(14)}px; height: ${this._scaledPx(14)}px;"
          ></ha-icon>
          ${o}
        </span>
      `:m}
      ${t.phase?v`
        <span class="badge phase-badge">${t.phase}</span>
      `:m}
      ${t.eventCode&&t.eventCode.trim().toLowerCase()!==t.event.trim().toLowerCase()?v`
        <span class="badge event-code-badge">${t.eventCode}</span>
      `:m}
      ${t.mergedCount&&t.mergedCount>1?v`<span class="badge zones-badge">${c("card.zones_count",this._lang,{count:t.mergedCount})}</span>`:m}
    `}_renderTextBlock(t,e){return e?v`
      <div class="text-block">
        <div class="text-label">${t}</div>
        <div class="text-body">${es(Is(e))}</div>
      </div>
    `:m}_renderDetailsContent(t,e){var i,r,o,s,n,l;const d=((i=this._config)==null?void 0:i.reformatText)!==!1;let h=this._normalizeText(t.description),_=this._normalizeText(t.instruction);d&&(h=Kr(h),_=Kr(_));const g=this._lang;return v`
      <div class="details-content" @click=${b=>b.stopPropagation()}>
        ${((r=this._config)==null?void 0:r.showMetadata)!==!1?v`
        <div class="meta-grid">
          ${e.sentTs>100?v`
          <div class="meta-item">
            <span class="meta-label">${c("detail.issued",g)}</span>
            <span class="meta-value">${mi(e.sentTs,this._locale,g)}</span>
          </div>
          `:m}
          <div class="meta-item">
            <span class="meta-label">${c("detail.onset",g)}</span>
            <span class="meta-value">${mi(e.onsetTs,this._locale,g)}</span>
            <span class="meta-relative">${Yr(e.onsetTs,e.nowTs,g)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">${e.isExpired?c("progress.expired_label",g):c("detail.expires",g)}</span>
            ${e.hasEndTime?v`<span class="meta-value">${mi(e.endsTs,this._locale,g)}</span>
            <span class="meta-relative">${Yr(e.endsTs,e.nowTs,g)}</span>`:v`<span class="meta-value">${e.isActive?c("progress.ongoing",g):c("progress.tbd",g)}</span>`}
          </div>
          ${t.areaDesc?v`
            <div class="meta-item" style="grid-column: 1 / -1;">
              <span class="meta-label">${c("detail.area",g)}</span>
              <span class="meta-value">${t.areaDesc}</span>
            </div>
          `:m}
        </div>
        `:m}

        ${((o=this._config)==null?void 0:o.showGeometry)===!0?this._renderGeometry(t):m}

        ${((s=this._config)==null?void 0:s.showDescription)!==!1?this._renderTextBlock(c("detail.description",g),h):m}
        ${((n=this._config)==null?void 0:n.showInstructions)!==!1?this._renderTextBlock(c("detail.instructions",g),_):m}

        ${t.url&&((l=this._config)==null?void 0:l.showSourceLink)!==!1?v`
          <div class="footer-link">
            <a href=${t.url} target="_blank" rel="noopener noreferrer">
              ${this._sourceLinkLabel(t)}
              <ha-icon icon="mdi:open-in-new" style="width:${this._scaledPx(14)}px;"></ha-icon>
            </a>
          </div>
        `:m}
      </div>
    `}_renderGeometry(t){var e,i;if(((e=this._config)==null?void 0:e.showGeometry)!==!0||!t.bbox)return m;const r=t.geometryRef?this._geometryCache.get(t.geometryRef):void 0;if(((i=this._config)==null?void 0:i.geometryStyle)==="map")return this._renderGeometryMap(t,r!=null?r:void 0);const{viewBox:o,polygonPaths:s}=ha(t.bbox,r!=null?r:void 0);return v`
      <svg
        class="alert-geometry"
        viewBox=${o}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label=${t.areaDesc||c("detail.area",this._lang)}
      >
        <rect class="geometry-frame" x="0" y="0" width="100%" height="100%"></rect>
        ${s.map(n=>Ct`<path class="geometry-shape" d=${n}></path>`)}
      </svg>
    `}_renderGeometryMap(t,e){var i,r,o;const s=(i=this._config)==null?void 0:i.geometryTileUrl,n=s||(this._themeMode==="dark"?pa:co),l=(o=(r=this._config)==null?void 0:r.geometryTileAttribution)!=null?o:s?"\xA9 OpenStreetMap":uo,{viewBox:d,aspect:h,tiles:_,polygonPaths:g}=va(t.bbox,e,{tileUrl:n,attribution:l}),b=t.areaDesc||c("detail.area",this._lang);return v`
      <div class="alert-geometry-map" style="aspect-ratio: ${h};">
        <svg
          class="alert-geometry map"
          viewBox=${d}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label=${b}
        >
          ${_.map(w=>Ct`<image
            href=${w.href}
            x=${w.x}
            y=${w.y}
            width=${w.size}
            height=${w.size}
          ></image>`)}
          <rect class="geometry-frame" x="0" y="0" width="100%" height="100%"></rect>
          ${g.map(w=>Ct`<path class="geometry-shape-casing" d=${w}></path>`)}
          ${g.map(w=>Ct`<path class="geometry-shape" d=${w}></path>`)}
        </svg>
        <span class="geometry-attrib">${l}</span>
      </div>
    `}_renderProgressSection(t,e){const{isActive:i,progressPct:r,hasEndTime:o,onsetTs:s,endsTs:n,nowTs:l}=e,d=this._lang,h=e.isExpired?"left: 0; right: 0;":i&&!o?"width: 100%; left: 0;":`left: ${r}%; right: 0;`;return v`
      <div class="progress-section">
        <div class="progress-labels">
          <div class="label-left">
            <span class="label-sub">${c(i?"progress.start":"progress.now",d)}</span>
            <span>${Vr(i?s:l,this._locale,d)}</span>
          </div>
          <div class="label-center">
            ${o?e.isExpired?v`<span class="label-sub">${c("progress.expired_label",d)}</span><span>${qe(n,l)}</span>`:i?v`<span class="label-sub">${c("progress.expires_in_label",d)}</span><span>${qe(n,l)}</span>`:v`<span class="label-sub">${c("progress.starts_in_label",d)}</span><span>${qe(s,l)}</span>`:v`<span class="label-sub">${c("progress.ongoing",d)}</span>`}
          </div>
          <div class="label-right">
            <span class="label-sub">${c("progress.end",d)}</span>
            <span>${o?Vr(n,this._locale,d):c("progress.tbd",d)}</span>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style=${h}></div>
        </div>
      </div>
    `}};X.styles=ya,X._editorExpandedState=new Map,K([ai({attribute:!1})],X.prototype,"hass",void 0),K([ae()],X.prototype,"_config",void 0),K([ae()],X.prototype,"_expandedAlerts",void 0),K([ae()],X.prototype,"_forcePreview",void 0),K([ae()],X.prototype,"_detailPopupAlertId",void 0),K([ae()],X.prototype,"_dismissals",void 0),K([ae()],X.prototype,"_swipeExiting",void 0),K([ae()],X.prototype,"_geometryCache",void 0),X=gt=K([br("weather-alerts-card")],X);const ki=window;ki.customCards=ki.customCards||[],ki.customCards.push({type:"weather-alerts-card",name:"Weather Alerts Card",preview:!0,description:"A card for displaying weather alerts with severity indicators, progress bars, and expandable details. Supports NWS (US), BoM (Australia), and MeteoAlarm (Europe)."});export{X as WeatherAlertsCard,bi as resolveDeviceAlertEntities,yi as subscribeEntityRegistry};
