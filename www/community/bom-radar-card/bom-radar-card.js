/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function e(e,t,n,i){var r,a=arguments.length,o=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,i);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(o=(a<3?r(o):a>3?r(t,n,o):r(t,n))||o);return a>3&&o&&Object.defineProperty(t,n,o),o
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */}const t="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,n=(e,t,n=null)=>{for(;t!==n;){const n=t.nextSibling;e.removeChild(t),t=n}},i=`{{lit-${String(Math.random()).slice(2)}}}`,r=`\x3c!--${i}--\x3e`,a=new RegExp(`${i}|${r}`);class o{constructor(e,t){this.parts=[],this.element=t;const n=[],r=[],o=document.createTreeWalker(t.content,133,null,!1);let l=0,p=-1,h=0;const{strings:u,values:{length:m}}=e;for(;h<m;){const e=o.nextNode();if(null!==e){if(p++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:n}=t;let i=0;for(let e=0;e<n;e++)s(t[e].name,"$lit$")&&i++;for(;i-- >0;){const t=u[h],n=d.exec(t)[2],i=n.toLowerCase()+"$lit$",r=e.getAttribute(i);e.removeAttribute(i);const o=r.split(a);this.parts.push({type:"attribute",index:p,name:n,strings:o}),h+=o.length-1}}"TEMPLATE"===e.tagName&&(r.push(e),o.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(i)>=0){const i=e.parentNode,r=t.split(a),o=r.length-1;for(let t=0;t<o;t++){let n,a=r[t];if(""===a)n=c();else{const e=d.exec(a);null!==e&&s(e[2],"$lit$")&&(a=a.slice(0,e.index)+e[1]+e[2].slice(0,-"$lit$".length)+e[3]),n=document.createTextNode(a)}i.insertBefore(n,e),this.parts.push({type:"node",index:++p})}""===r[o]?(i.insertBefore(c(),e),n.push(e)):e.data=r[o],h+=o}}else if(8===e.nodeType)if(e.data===i){const t=e.parentNode;null!==e.previousSibling&&p!==l||(p++,t.insertBefore(c(),e)),l=p,this.parts.push({type:"node",index:p}),null===e.nextSibling?e.data="":(n.push(e),p--),h++}else{let t=-1;for(;-1!==(t=e.data.indexOf(i,t+1));)this.parts.push({type:"node",index:-1}),h++}}else o.currentNode=r.pop()}for(const e of n)e.parentNode.removeChild(e)}}const s=(e,t)=>{const n=e.length-t.length;return n>=0&&e.slice(n)===t},l=e=>-1!==e.index,c=()=>document.createComment(""),d=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function p(e,t){const{element:{content:n},parts:i}=e,r=document.createTreeWalker(n,133,null,!1);let a=u(i),o=i[a],s=-1,l=0;const c=[];let d=null;for(;r.nextNode();){s++;const e=r.currentNode;for(e.previousSibling===d&&(d=null),t.has(e)&&(c.push(e),null===d&&(d=e)),null!==d&&l++;void 0!==o&&o.index===s;)o.index=null!==d?-1:o.index-l,a=u(i,a),o=i[a]}c.forEach(e=>e.parentNode.removeChild(e))}const h=e=>{let t=11===e.nodeType?0:1;const n=document.createTreeWalker(e,133,null,!1);for(;n.nextNode();)t++;return t},u=(e,t=-1)=>{for(let n=t+1;n<e.length;n++){const t=e[n];if(l(t))return n}return-1};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const m=new WeakMap,g=e=>"function"==typeof e&&m.has(e),f={},_={};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class y{constructor(e,t,n){this.__parts=[],this.template=e,this.processor=t,this.options=n}update(e){let t=0;for(const n of this.__parts)void 0!==n&&n.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=t?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),n=[],i=this.template.parts,r=document.createTreeWalker(e,133,null,!1);let a,o=0,s=0,c=r.nextNode();for(;o<i.length;)if(a=i[o],l(a)){for(;s<a.index;)s++,"TEMPLATE"===c.nodeName&&(n.push(c),r.currentNode=c.content),null===(c=r.nextNode())&&(r.currentNode=n.pop(),c=r.nextNode());if("node"===a.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(c.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(c,a.name,a.strings,this.options));o++}else this.__parts.push(void 0),o++;return t&&(document.adoptNode(e),customElements.upgrade(e)),e}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const v=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:e=>e}),b=` ${i} `;class w{constructor(e,t,n,i){this.strings=e,this.values=t,this.type=n,this.processor=i}getHTML(){const e=this.strings.length-1;let t="",n=!1;for(let a=0;a<e;a++){const e=this.strings[a],o=e.lastIndexOf("\x3c!--");n=(o>-1||n)&&-1===e.indexOf("--\x3e",o+1);const s=d.exec(e);t+=null===s?e+(n?b:r):e.substr(0,s.index)+s[1]+s[2]+"$lit$"+s[3]+i}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");let t=this.getHTML();return void 0!==v&&(t=v.createHTML(t)),e.innerHTML=t,e}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const x=e=>null===e||!("object"==typeof e||"function"==typeof e),S=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class C{constructor(e,t,n){this.dirty=!0,this.element=e,this.name=t,this.strings=n,this.parts=[];for(let e=0;e<n.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new k(this)}_getValue(){const e=this.strings,t=e.length-1,n=this.parts;if(1===t&&""===e[0]&&""===e[1]){const e=n[0].value;if("symbol"==typeof e)return String(e);if("string"==typeof e||!S(e))return e}let i="";for(let r=0;r<t;r++){i+=e[r];const t=n[r];if(void 0!==t){const e=t.value;if(x(e)||!S(e))i+="string"==typeof e?e:String(e);else for(const t of e)i+="string"==typeof t?t:String(t)}}return i+=e[t],i}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class k{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===f||x(e)&&e===this.value||(this.value=e,g(e)||(this.committer.dirty=!0))}commit(){for(;g(this.value);){const e=this.value;this.value=f,e(this)}this.value!==f&&this.committer.commit()}}class T{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(c()),this.endNode=e.appendChild(c())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=c()),e.__insert(this.endNode=c())}insertAfterPart(e){e.__insert(this.startNode=c()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(null===this.startNode.parentNode)return;for(;g(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=f,e(this)}const e=this.__pendingValue;e!==f&&(x(e)?e!==this.value&&this.__commitText(e):e instanceof w?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):S(e)?this.__commitIterable(e):e===_?(this.value=_,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,n="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=n:this.__commitNode(document.createTextNode(n)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof y&&this.value.template===t)this.value.update(e.values);else{const n=new y(t,e.processor,this.options),i=n._clone();n.update(e.values),this.__commitNode(i),this.value=n}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let n,i=0;for(const r of e)n=t[i],void 0===n&&(n=new T(this.options),t.push(n),0===i?n.appendIntoPart(this):n.insertAfterPart(t[i-1])),n.setValue(r),n.commit(),i++;i<t.length&&(t.length=i,this.clear(n&&n.endNode))}clear(e=this.startNode){n(this.startNode.parentNode,e.nextSibling,this.endNode)}}class P{constructor(e,t,n){if(this.value=void 0,this.__pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=n}setValue(e){this.__pendingValue=e}commit(){for(;g(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=f,e(this)}if(this.__pendingValue===f)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=f}}class N extends C{constructor(e,t,n){super(e,t,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new E(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class E extends k{}let A=!1;(()=>{try{const e={get capture(){return A=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}})();class L{constructor(e,t,n){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=n,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;g(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=f,e(this)}if(this.__pendingValue===f)return;const e=this.__pendingValue,t=this.value,n=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),i=null!=e&&(null==t||n);n&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),i&&(this.__options=O(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=f}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const O=e=>e&&(A?{capture:e.capture,passive:e.passive,once:e.once}:e.capture)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;function $(e){let t=M.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},M.set(e.type,t));let n=t.stringsArray.get(e.strings);if(void 0!==n)return n;const r=e.strings.join(i);return n=t.keyString.get(r),void 0===n&&(n=new o(e,e.getTemplateElement()),t.keyString.set(r,n)),t.stringsArray.set(e.strings,n),n}const M=new Map,R=new WeakMap;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const I=new
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class{handleAttributeExpressions(e,t,n,i){const r=t[0];if("."===r){return new N(e,t.slice(1),n).parts}if("@"===r)return[new L(e,t.slice(1),i.eventContext)];if("?"===r)return[new P(e,t.slice(1),n)];return new C(e,t,n).parts}handleTextExpression(e){return new T(e)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const z=(e,...t)=>new w(e,t,"html",I)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */,U=(e,t)=>`${e}--${t}`;let V=!0;void 0===window.ShadyCSS?V=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),V=!1);const B=e=>t=>{const n=U(t.type,e);let r=M.get(n);void 0===r&&(r={stringsArray:new WeakMap,keyString:new Map},M.set(n,r));let a=r.stringsArray.get(t.strings);if(void 0!==a)return a;const s=t.strings.join(i);if(a=r.keyString.get(s),void 0===a){const n=t.getTemplateElement();V&&window.ShadyCSS.prepareTemplateDom(n,e),a=new o(t,n),r.keyString.set(s,a)}return r.stringsArray.set(t.strings,a),a},D=["html","svg"],j=new Set,W=(e,t,n)=>{j.add(e);const i=n?n.element:document.createElement("template"),r=t.querySelectorAll("style"),{length:a}=r;if(0===a)return void window.ShadyCSS.prepareTemplateStyles(i,e);const o=document.createElement("style");for(let e=0;e<a;e++){const t=r[e];t.parentNode.removeChild(t),o.textContent+=t.textContent}(e=>{D.forEach(t=>{const n=M.get(U(t,e));void 0!==n&&n.keyString.forEach(e=>{const{element:{content:t}}=e,n=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{n.add(e)}),p(e,n)})})})(e);const s=i.content;n?function(e,t,n=null){const{element:{content:i},parts:r}=e;if(null==n)return void i.appendChild(t);const a=document.createTreeWalker(i,133,null,!1);let o=u(r),s=0,l=-1;for(;a.nextNode();){l++;for(a.currentNode===n&&(s=h(t),n.parentNode.insertBefore(t,n));-1!==o&&r[o].index===l;){if(s>0){for(;-1!==o;)r[o].index+=s,o=u(r,o);return}o=u(r,o)}}}(n,o,s.firstChild):s.insertBefore(o,s.firstChild),window.ShadyCSS.prepareTemplateStyles(i,e);const l=s.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==l)t.insertBefore(l.cloneNode(!0),t.firstChild);else if(n){s.insertBefore(o,s.firstChild);const e=new Set;e.add(o),p(n,e)}};window.JSCompiler_renameProperty=(e,t)=>e;const F={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},H=(e,t)=>t!==e&&(t==t||e==e),q={attribute:!0,type:String,converter:F,reflect:!1,hasChanged:H};class Z extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,n)=>{const i=this._attributeNameForProperty(n,t);void 0!==i&&(this._attributeToPropertyMap.set(i,n),e.push(i))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=q){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const n="symbol"==typeof e?Symbol():"__"+e,i=this.getPropertyDescriptor(e,n,t);void 0!==i&&Object.defineProperty(this.prototype,e,i)}static getPropertyDescriptor(e,t,n){return{get(){return this[t]},set(i){const r=this[e];this[t]=i,this.requestUpdateInternal(e,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||q}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty("finalized")||e.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const n of t)this.createProperty(n,e[n])}}static _attributeNameForProperty(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,n=H){return n(e,t)}static _propertyValueFromAttribute(e,t){const n=t.type,i=t.converter||F,r="function"==typeof i?i:i.fromAttribute;return r?r(e,n):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const n=t.type,i=t.converter;return(i&&i.toAttribute||F.toAttribute)(e,n)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,n){t!==n&&this._attributeToProperty(e,n)}_propertyToAttribute(e,t,n=q){const i=this.constructor,r=i._attributeNameForProperty(e,n);if(void 0!==r){const e=i._propertyValueToAttribute(t,n);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(r):this.setAttribute(r,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const n=this.constructor,i=n._attributeToPropertyMap.get(e);if(void 0!==i){const e=n.getPropertyOptions(i);this._updateState=16|this._updateState,this[i]=n._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,n){let i=!0;if(void 0!==e){const r=this.constructor;n=n||r.getPropertyOptions(e),r._valueHasChanged(this[e],t,n.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==n.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,n))):i=!1}!this._hasRequestedUpdate&&i&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(e){}const e=this.performUpdate();return null!=e&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(t){throw e=!1,this._markUpdated(),t}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}Z.finalized=!0;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const J=e=>t=>"function"==typeof t?((e,t)=>(window.customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:n,elements:i}=t;return{kind:n,elements:i,finisher(t){window.customElements.define(e,t)}}})(e,t),Y=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?Object.assign(Object.assign({},t),{finisher(n){n.createProperty(t.key,e)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(n){n.createProperty(t.key,e)}};function G(e){return(t,n)=>void 0!==n?((e,t,n)=>{t.constructor.createProperty(n,e)})(e,t,n):Y(e,t)}
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const K=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol();class X{constructor(e,t){if(t!==Q)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&(K?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const ee=(e,...t)=>{const n=t.reduce((t,n,i)=>t+(e=>{if(e instanceof X)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(n)+e[i+1],e[0]);return new X(n,Q)};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const te={};class ne extends Z{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(e,n)=>e.reduceRight((e,n)=>Array.isArray(n)?t(n,e):(e.add(n),e),n),n=t(e,new Set),i=[];n.forEach(e=>i.unshift(e)),this._styles=i}else this._styles=void 0===e?[]:[e];this._styles=this._styles.map(e=>{if(e instanceof CSSStyleSheet&&!K){const t=Array.prototype.slice.call(e.cssRules).reduce((e,t)=>e+t.cssText,"");return new X(String(t),Q)}return e})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?K?this.renderRoot.adoptedStyleSheets=e.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==te&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){return te}}ne.finalized=!0,ne.render=(e,t,i)=>{if(!i||"object"!=typeof i||!i.scopeName)throw new Error("The `scopeName` option is required.");const r=i.scopeName,a=R.has(t),o=V&&11===t.nodeType&&!!t.host,s=o&&!j.has(r),l=s?document.createDocumentFragment():t;if(((e,t,i)=>{let r=R.get(t);void 0===r&&(n(t,t.firstChild),R.set(t,r=new T(Object.assign({templateFactory:$},i))),r.appendInto(t)),r.setValue(e),r.commit()})(e,l,Object.assign({templateFactory:B(r)},i)),s){const e=R.get(l);R.delete(l);const i=e.value instanceof y?e.value.template:void 0;W(r,l,i),n(t,t.firstChild),t.appendChild(l),R.set(t,e)}!a&&o&&window.ShadyCSS.styleElement(t.host)},ne.shadowRootOptions={mode:"open"};var ie="[^\\s]+";function re(e,t){for(var n=[],i=0,r=e.length;i<r;i++)n.push(e[i].substr(0,t));return n}var ae=function(e){return function(t,n){var i=n[e].map((function(e){return e.toLowerCase()})).indexOf(t.toLowerCase());return i>-1?i:null}};function oe(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];for(var i=0,r=t;i<r.length;i++){var a=r[i];for(var o in a)e[o]=a[o]}return e}var se=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],le=["January","February","March","April","May","June","July","August","September","October","November","December"],ce=re(le,3),de={dayNamesShort:re(se,3),dayNames:se,monthNamesShort:ce,monthNames:le,amPm:["am","pm"],DoFn:function(e){return e+["th","st","nd","rd"][e%10>3?0:(e-e%10!=10?1:0)*e%10]}},pe=(oe({},de),function(e){return+e-1}),he=[null,"[1-9]\\d?"],ue=[null,ie],me=["isPm",ie,function(e,t){var n=e.toLowerCase();return n===t.amPm[0]?0:n===t.amPm[1]?1:null}],ge=["timezoneOffset","[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",function(e){var t=(e+"").match(/([+-]|\d\d)/gi);if(t){var n=60*+t[1]+parseInt(t[2],10);return"+"===t[0]?n:-n}return 0}];ae("monthNamesShort"),ae("monthNames");var fe,_e;!function(){try{(new Date).toLocaleDateString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(e){return"RangeError"===e.name}}(),(_e=fe||(fe={})).language="language",_e.system="system",_e.comma_decimal="comma_decimal",_e.decimal_comma="decimal_comma",_e.space_comma="space_comma",_e.none="none";var ye=function(e,t,n,i){i=i||{},n=null==n?{}:n;var r=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return r.detail=n,e.dispatchEvent(r),r};let ve=class extends ne{setConfig(e){this._config=e}get _name(){return this._config&&this._config.name||""}get _entity(){return this._config&&this._config.entity||""}get _show_warning(){return this._config&&this._config.show_warning||!1}get _show_error(){return this._config&&this._config.show_error||!1}render(){if(!this.hass)return z``;let e;return e=this._config,z`
      <div class="values">
        <paper-dropdown-menu
          label="Map Style (optional)"
          .value=${e.map_style?e.map_style:""}
          editable
          .configAttribute=${"map_style"}
          .configObject=${e}
          @value-changed=${this._valueChangedString}
          ><paper-listbox
            slot="dropdown-content"
            attr-for-selected="item-name"
            selected="${e.map_style?e.map_style:""}"
          >
            <paper-item item-name="Light">Light</paper-item>
            <paper-item item-name="Voyager">Voyager</paper-item>
            <paper-item item-name="Satellite">Satellite</paper-item>
            <paper-item item-name="Dark">Dark</paper-item>
          </paper-listbox></paper-dropdown-menu
        >
        <paper-dropdown-menu
          label="Zoom Level (optional)"
          .value=${e.zoom_level?e.zoom_level:null}
          editable
          .configAttribute=${"zoom_level"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
          ><paper-listbox
            slot="dropdown-content"
            attr-for-selected="item-name"
            selected="${e.zoom_level?e.zoom_level:null}"
          >
            <paper-item item-name="4">4</paper-item>
            <paper-item item-name="5">5</paper-item>
            <paper-item item-name="6">6</paper-item>
            <paper-item item-name="7">7</paper-item>
            <paper-item item-name="8">8</paper-item>
            <paper-item item-name="9">9</paper-item>
            <paper-item item-name="10">10</paper-item>
          </paper-listbox></paper-dropdown-menu
        >
        <paper-input
          label="Map Centre Latitude (optional)"
          .value=${e.center_latitude?e.center_latitude:""}
          editable
          .configAttribute=${"center_latitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
        <paper-input
          label="Map Centre Longitude (optional)"
          .value=${e.center_longitude?e.center_longitude:""}
          editable
          .configAttribute=${"center_longitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
        <paper-input
          label="Marker Latitude (optional)"
          .value=${e.marker_latitude?e.marker_latitude:""}
          editable
          .configAttribute=${"marker_latitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
        <paper-input
          label="Marker Longitude (optional)"
          .value=${e.marker_longitude?e.marker_longitude:""}
          editable
          .configAttribute=${"marker_longitude"}
          .configObject=${e}
          @value-changed=${this._valueChangedNumber}
        ></paper-input>
      </div>
    `}_valueChangedNumber(e){if(!this._config||!this.hass)return;const t=e.target;this["_"+t.configAttribute]!==t.value&&(t.configAttribute&&(""===t.value||null===t.value?delete this._config[t.configAttribute]:this._config=Object.assign(Object.assign({},this._config),{[t.configAttribute]:Number(t.value)})),ye(this,"config-changed",{config:this._config}))}_valueChangedString(e){if(!this._config||!this.hass)return;const t=e.target;this["_"+t.configAttribute]!==t.value&&(t.configAttribute&&(""===t.value?delete this._config[t.configAttribute]:this._config=Object.assign(Object.assign({},this._config),{[t.configAttribute]:t.value})),ye(this,"config-changed",{config:this._config}))}static get styles(){return ee`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
      }
      ha-switch {
        padding-bottom: 8px;
      }
    `}};e([G()],ve.prototype,"hass",void 0),e([G()],ve.prototype,"_config",void 0),ve=e([J("bom-radar-card-editor")],ve);var be={version:"Version",invalid_configuration:"Invalid configuration",show_warning:"Show Warning"},we={common:be},xe={version:"Versjon",invalid_configuration:"Ikke gyldig konfiguration",show_warning:"Vis advarsel"},Se={common:xe},Ce={en:Object.freeze({__proto__:null,common:be,default:we}),nb:Object.freeze({__proto__:null,common:xe,default:Se})};function ke(e,t="",n=""){const i=(localStorage.getItem("selectedLanguage")||"en").replace(/['"]+/g,"").replace("-","_");var r;try{r=e.split(".").reduce((e,t)=>e[t],Ce[i])}catch(t){r=e.split(".").reduce((e,t)=>e[t],Ce.en)}return void 0===r&&(r=e.split(".").reduce((e,t)=>e[t],Ce.en)),""!==t&&""!==n&&(r=r.replace(t,n)),r}console.info(`%c  BOM-RADAR-CARD \n%c  ${ke("common.version")} 1.2.18    `,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray");let Te=class extends ne{static async getConfigElement(){return document.createElement("bom-radar-card-editor")}static getStubConfig(){return{}}setConfig(e){this._config=e}getCardSize(){return 10}shouldUpdate(){return!0}render(){if(this._config.show_warning)return this.showWarning(ke("common.show_warning"));console.info("render offsetWidht: "+this.offsetWidth),console.info("square_map: "+this._config.square_map);const e=`\n      <!DOCTYPE html>\n      <html>\n        <head>\n          <title>BOM Radar Card</title>\n          <meta charset="utf-8" />\n          <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n          <link rel="stylesheet" href="/local/community/bom-radar-card/leaflet.css"/>\n          <link rel="stylesheet" href="/hacsfiles/bom-radar-card/leaflet.toolbar.min.css"/>\n          <script src="/hacsfiles/bom-radar-card/leaflet.js"><\/script>\n          <script src="/hacsfiles/bom-radar-card/leaflet.toolbar.min.js"><\/script>\n          <style>\n            body {\n              margin: 0;\n              padding: 0;\n            }\n            .text-container {\n              font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;\n              margin: 0px 2.5px 0px 10px;\n            }\n            .text-container-small {\n              font: 10px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;\n              margin: 0px 10px 0px 2.5px;\n            }\n            .light-links a {\n              color: blue;\n            }\n            .dark-links a {\n              color: steelblue;\n            }\n            #timestamp {\n              margin: 0px 0px;\n            }\n            #color-bar {\n              margin: 0px 0px;\n            }\n          </style>\n        </head>\n        <body onresize="resizeWindow()">\n          <span>\n            <div id="color-bar" style="height: 8px;">\n              <img id="img-color-bar" src="/hacsfiles/bom-radar-card/radar-colour-bar.png" height="8" style="vertical-align: top" />\n            </div>\n            <div id="mapid" style="height: ${void 0!==this._config.square_map&&this._config.square_map?this.offsetWidth+"px":"492px"};"></div>\n            <div id="div-progress-bar" style="height: 8px; background-color: white;">\n              <div id="progress-bar" style="height:8px;width:0; background-color: #ccf2ff;"></div>\n            </div>\n            <div id="bottom-container" class="light-links" style="height: 18px; background-color: white;">\n              <div id="timestampid" class="text-container" style="width: 100px; height: 18px; float:left; position: absolute;">\n                <p id="timestamp"></p>\n              </div>\n              <div id="attribution" class="text-container-small" style="height: 18px; float:right;">\n                <span class="Map__Attribution-LjffR DKiFh" id="attribution"\n                  ></span\n                >\n              </div>\n            </div>\n            <script>\n              const radarLocations = [\n                [-35.661387, 149.512229],\n                [-33.700764, 151.209470],\n                [-29.620633, 152.963328],\n                [-29.496994, 149.850825],\n                [-31.024219, 150.192037],\n                [-32.729802, 152.025422],\n                [-29.038524, 167.941679],\n                [-35.158170, 147.456307],\n                [-34.262389, 150.875099],\n                [-37.855210, 144.755512],\n                [-34.287096, 141.598250],\n                [-37.887532, 147.575475],\n                [-35.990000, 142.010000],\n                [-36.029663, 146.022772],\n                [-33.552222, 145.528610],\n                [-33.552222, 145.528610],\n                [-19.885737, 148.075693],\n                [-27.717739, 153.240015],\n                [-16.818145, 145.662895],\n                [-23.549558, 148.239166],\n                [-23.855056, 151.262567],\n                [-25.957342, 152.576898],\n                [-23.439783, 144.282270],\n                [-21.117243, 149.217213],\n                [-27.606344, 152.540084],\n                [-16.670000, 139.170000],\n                [-20.711204, 139.555281],\n                [-19.419800, 146.550974],\n                [-26.440193, 147.349130],\n                [-12.666413, 141.924640],\n                [-16.287199, 149.964539],\n                [-34.617016, 138.468782],\n                [-43.112593, 147.805241],\n                [-41.179147, 145.579986],\n                [-23.795064, 133.888935],\n                [-12.455933, 130.926599],\n                [-12.274995, 136.819911],\n                [-14.510918, 132.447010],\n                [-11.648500, 133.379977],\n                [-34.941838, 117.816370],\n                [-17.948234, 122.235334],\n                [-24.887978, 113.669386],\n                [-20.653613, 116.683144],\n                [-31.777795, 117.952768],\n                [-33.830150, 121.891734],\n                [-28.804648, 114.697349],\n                [-25.033225, 128.301756],\n                [-30.784261, 121.454814],\n                [-22.103197, 113.999698],\n                [-33.096956, 119.008796],\n                [-32.391761, 115.866955],\n                [-20.371845, 118.631670],\n                [-30.358887, 116.305769],\n                [-15.451711, 128.120856],\n                [-35.329531, 138.502498],\n                [-32.129823, 133.696361],\n                [-37.747713, 140.774605],\n                [-31.155811, 136.804400],\n                [-18.228916, 127.662836],\n                [-29.971116, 146.813845]];\n              const maxZoom = 10;\n              const minZoom = 4;\n              var zoomLevel = ${void 0!==this._config.zoom_level?this._config.zoom_level:4};\n              var centerLat = ${void 0!==this._config.center_latitude?this._config.center_latitude:-27.85};\n              var centerLon = ${void 0!==this._config.center_longitude?this._config.center_longitude:133.75};\n              var markerLat = (${this._config.marker_latitude}) ? ${this._config.marker_latitude} : centerLat;\n              var markerLon = (${this._config.marker_longitude}) ? ${this._config.marker_longitude} : centerLon;\n              var timeout = ${void 0!==this._config.frame_delay?this._config.frame_delay:500};\n              var frameCount = ${null!=this._config.frame_count?this._config.frame_count:10};\n              resizeWindow();\n              if ((this.frameElement.offsetWidth < 400) && (zoomLevel > minZoom)) {\n                zoomLevel--;\n              }\n              var labelSize = ${void 0!==this._config.extra_labels?128:256};\n              var labelZoom = ${void 0!==this._config.extra_labels?1:0};\n              var locationRadius = '${void 0!==this._config.radar_location_radius?this._config.radar_location_radius:2}';\n              var locationLineColour = '${void 0!==this._config.radar_location_line_colour?this._config.radar_location_line_colour:"#00FF00"}';\n              var locationFillColour = '${void 0!==this._config.radar_location_fill_colour?this._config.radar_location_fill_colour:"#FF0000"}';\n              var map_style = '${void 0!==this._config.map_style?this._config.map_style.toLowerCase():"light"}';\n              switch (map_style) {\n                case "dark":\n                  var basemap_url = 'https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png';\n                  var basemap_style = 'dark_nolabels';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'dark_only_labels';\n                  var svg_icon = 'home-circle-light.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>';\n                  break;\n                case "voyager":\n                  var basemap_url = 'https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png';\n                  var basemap_style = 'rastertiles/voyager_nolabels';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'rastertiles/voyager_only_labels';\n                  var svg_icon = 'home-circle-dark.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>';\n                  break;\n                case 'satellite':\n                  var basemap_url = 'https://server.arcgisonline.com/ArcGIS/rest/services/{style}/MapServer/tile/{z}/{y}/{x}';\n                  var basemap_style = 'World_Imagery';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'proton_labels_std';\n                  var svg_icon = 'home-circle-dark.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="http://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank">ESRI</a>';\n                  break;\n                case "light":\n                default:\n                  var basemap_url = 'https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}.png';\n                  var basemap_style = 'light_nolabels';\n                  var label_url = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png';\n                  var label_style = 'light_only_labels';\n                  var svg_icon = 'home-circle-dark.svg';\n                  var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution" target="_blank">CARTO</a>';\n              }\n\n              var idx = 0;\n              var run = true;\n              var doRadarUpdate = false;\n              var radarMap = L.map('mapid', {\n                zoomControl: ${!0===this._config.show_zoom&&!0!==this._config.static_map?"true":"false"},\n                ${!0===this._config.static_map?"scrollWheelZoom: false,                 doubleClickZoom: false,                 boxZoom: false,                 dragging: false,                 keyboard: false,                 touchZoom: false,":""}\n                attributionControl: false,\n                minZoom: minZoom,\n                maxZoom: maxZoom,\n                maxBounds: [\n                  [0, 101.25],\n                  [-55.77657, 168.75],\n                ],\n                maxBoundsViscosity: 1.0,\n              }).setView([centerLat, centerLon], zoomLevel);\n              var radarImage = [];\n              var radarTime = [];\n              var weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];\n              var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];\n              var d = new Date();\n              d.setTime(Math.trunc(d.valueOf() / 600000) * 600000 - frameCount * 600000);\n\n              document.getElementById("progress-bar").style.width = barSize+"px";\n              document.getElementById("attribution").innerHTML = attribution;\n\n              var t2actions = [];\n\n              if (${!0===this._config.show_recenter&&!0!==this._config.static_map}) {\n                var recenterAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img src="/hacsfiles/bom-radar-card/recenter.png" width="24" height="24">',\n                          tooltip: 'Re-center'\n                      }\n                  },\n\n                  addHooks: function () {\n                    radarMap.setView([centerLat, centerLon], zoomLevel);\n                  }\n                });\n                t2actions.push(recenterAction);\n              }\n\n              if (${!0===this._config.show_playback}) {\n                var playAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img id="playButton" src="/hacsfiles/bom-radar-card/pause.png" width="24" height="24">',\n                          tooltip: 'Pause'\n                      }\n                  },\n\n                  addHooks: function () {\n                    run = !run;\n                    if (run) {\n                      document.getElementById("playButton").src = "/hacsfiles/bom-radar-card/pause.png"\n                    } else {\n                      document.getElementById("playButton").src = "/hacsfiles/bom-radar-card/play.png"\n                    }\n                  }\n                });\n                t2actions.push(playAction);\n\n                var skipbackAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img src="/hacsfiles/bom-radar-card/skip-back.png" width="24" height="24">',\n                          tooltip: 'Previous Frame'\n                      }\n                  },\n\n                  addHooks: function () {\n                    skipBack();\n                  }\n                });\n                t2actions.push(skipbackAction);\n\n                var skipnextAction = L.Toolbar2.Action.extend({\n                  options: {\n                      toolbarIcon: {\n                          html: '<img src="/hacsfiles/bom-radar-card/skip-next.png" width="24" height="24">',\n                          tooltip: 'Next Frame'\n                      }\n                  },\n\n                  addHooks: function () {\n                    skipNext();\n                  }\n                });\n                t2actions.push(skipnextAction);\n              }\n\n              if (t2actions.length > 0) {\n                new L.Toolbar2.Control({\n                  position: 'bottomright',\n                  actions: t2actions\n                }).addTo(radarMap);\n              }\n\n              if (${!0===this._config.show_scale}) {\n                L.control.scale({\n                  position: 'bottomleft',\n                  metric: true,\n                  imperial: false,\n                  maxWidth: 100,\n                }).addTo(radarMap);\n\n                if ((map_style === "dark") || (map_style == "satellite")) {\n                  var scaleDiv = this.document.getElementsByClassName("leaflet-control-scale-line")[0];\n                  scaleDiv.style.color = "#BBB";\n                  scaleDiv.style.borderColor = "#BBB";\n                  scaleDiv.style.background = "#00000080";\n                }\n              }\n\n              if ((map_style === "dark") || (map_style == "satellite")) {\n                this.document.getElementById("div-progress-bar").style.background = "#1C1C1C";\n                this.document.getElementById("progress-bar").style.background = "steelblue";\n                this.document.getElementById("bottom-container").style.background = "#1C1C1C";\n                this.document.getElementById("bottom-container").style.color = "#DDDDDD";\n                this.document.getElementById("bottom-container").className = "dark-links";\n              }\n\n              L.tileLayer(\n                basemap_url,\n                {\n                  style: basemap_style,\n                  subdomains: 'abcd',\n                  detectRetina: true,\n                  tileSize: 256,\n                  zoomOffset: 0,\n                },\n              ).addTo(radarMap);\n\n              for (i = 0; i < frameCount; i++) {\n                radarImage[i] = L.tileLayer(\n                  'https://api.weather.bom.gov.au/v1/rainradar/tiles/{time}/{z}/{x}/{y}.png',\n                  {\n                    time: getRadarTime(d.valueOf() + i * 600000),\n                    detectRetina: true,\n                    tileSize: 256,\n                    zoomOffset: 0,\n                    opacity: 0,\n                  },\n                ).addTo(radarMap);\n                radarTime[i] = getRadarTimeString(d.valueOf() + i * 600000);\n              }\n              radarImage[idx].setOpacity(1);\n              document.getElementById('timestamp').innerHTML = radarTime[idx];\n              d.setTime(d.valueOf() + frameCount * 600000);\n\n              townLayer = L.tileLayer(\n                label_url,\n                {\n                  subdomains: 'abcd',\n                  detectRetina: false,\n                  tileSize: labelSize,\n                  zoomOffset: labelZoom,\n                },\n              ).addTo(radarMap);\n              townLayer.setZIndex(2);\n\n              ${!0===this._config.show_marker?"var myIcon = L.icon({                        iconUrl: '/hacsfiles/bom-radar-card/'+svg_icon,                        iconSize: [16, 16],                      });                      L.marker([markerLat, markerLon], { icon: myIcon, interactive: false }).addTo(radarMap);":""}\n\n              ${!0===this._config.show_range?"L.circle([markerLat, markerLon], { radius: 50000, weight: 1, fill: false, opacity: 0.3, interactive: false }).addTo(radarMap);                      L.circle([markerLat, markerLon], { radius: 100000, weight: 1, fill: false, opacity: 0.3, interactive: false }).addTo(radarMap);                      L.circle([markerLat, markerLon], { radius: 200000, weight: 1, fill: false, opacity: 0.3, interactive: false }).addTo(radarMap);":""}\n\n              ${!0===this._config.show_radar_location?"radarMap.createPane('overlayRadarLocation');                      radarMap.getPane('overlayRadarLocation').style.zIndex = 401;                      radarMap.getPane('overlayRadarLocation').style.pointerEvents = 'none';                      radarLocations.forEach(function (coords) {                        L.circleMarker([coords[0], coords[1]], { radius: locationRadius, weight: locationRadius/2, color: locationLineColour, fillColor: locationFillColour, fillOpacity: 1.0, interactive: false, pane: 'overlayRadarLocation' }).addTo(radarMap);                      });":""}\n\n              ${!0===this._config.show_radar_coverage?"radarMap.createPane('overlayRadarCoverage');                      radarMap.getPane('overlayRadarCoverage').style.opacity = 0.1;                      radarMap.getPane('overlayRadarCoverage').style.zIndex = 400;                      radarMap.getPane('overlayRadarCoverage').style.pointerEvents = 'none';                      radarLocations.forEach(function (coords) {                        L.circle([coords[0], coords[1]], { radius: 250000, weight: 1, stroke: false, fill: true, fillOpacity: 1, interactive: false, pane: 'overlayRadarCoverage' }).addTo(radarMap);                      });":""}\n\n              setTimeout(function() {\n                nextFrame();\n              }, timeout);\n              setUpdateTimeout();\n\n              function setUpdateTimeout() {\n                d.setTime(d.valueOf() + 600000);\n                x = new Date();\n                setTimeout(triggerRadarUpdate, d.valueOf() - x.valueOf());\n              }\n\n              function triggerRadarUpdate() {\n                doRadarUpdate = true;\n              }\n\n              function updateRadar() {\n                newLayer = L.tileLayer('https://api.weather.bom.gov.au/v1/rainradar/tiles/{time}/{z}/{x}/{y}.png', {\n                  time: getRadarTime(d.valueOf() - 600000),\n                  maxZoom: maxZoom,\n                  tileSize: 256,\n                  zoomOffset: 0,\n                  opacity: 0,\n                }).addTo(radarMap);\n                newTime = getRadarTimeString(d.valueOf() - 600000);\n\n                radarImage[0].remove();\n                for (i = 0; i < frameCount - 1; i++) {\n                  radarImage[i] = radarImage[i + 1];\n                  radarTime[i] = radarTime[i + 1];\n                }\n                radarImage[frameCount - 1] = newLayer;\n                radarTime[frameCount - 1] = newTime;\n                idx = 0;\n                doRadarUpdate = false;\n\n                setUpdateTimeout();\n              }\n\n              function getRadarTime(date) {\n                x = new Date(date);\n                return (\n                  x.getUTCFullYear().toString() +\n                  (x.getUTCMonth() + 1).toString().padStart(2, '0') +\n                  x\n                    .getUTCDate()\n                    .toString()\n                    .padStart(2, '0') +\n                  x\n                    .getUTCHours()\n                    .toString()\n                    .padStart(2, '0') +\n                  x\n                    .getUTCMinutes()\n                    .toString()\n                    .padStart(2, '0')\n                );\n              }\n\n              function getRadarTimeString(date) {\n                x = new Date(date);\n                return (\n                  weekday[x.getDay()] +\n                  ' ' +\n                  month[x.getMonth()] +\n                  ' ' +\n                  x\n                    .getDate()\n                    .toString()\n                    .padStart(2, '0') +\n                  ' ' +\n                  x\n                    .getHours()\n                    .toString()\n                    .padStart(2, '0') +\n                  ':' +\n                  x\n                    .getMinutes()\n                    .toString()\n                    .padStart(2, '0')\n                );\n              }\n\n              function nextFrame() {\n                if (run) {\n                  nextImage();\n                }\n                setTimeout(function() {\n                  nextFrame();\n                }, timeout);\n              }\n\n              function skipNext() {\n                if (idx == frameCount-1) {\n                  idx += 1;\n                }\n                nextImage();\n              }\n\n              function skipBack() {\n                if (idx == frameCount) {\n                  radarImage[frameCount - 1].setOpacity(0);\n                  idx -= 1;\n                } else if (idx < frameCount) {\n                  radarImage[idx].setOpacity(0);\n                }\n                idx -= 1;\n                if (doRadarUpdate && idx == 1) {\n                  updateRadar();\n                }\n                if (idx < 0) {\n                  idx = frameCount-1;\n                }\n                document.getElementById("progress-bar").style.width = (idx+1)*barSize+"px";\n                document.getElementById('timestamp').innerHTML = radarTime[idx];\n                radarImage[idx].setOpacity(1);\n              }\n\n              function nextImage() {\n                if (idx == frameCount) {\n                  radarImage[frameCount - 1].setOpacity(0);\n                } else if (idx < frameCount - 1) {\n                  radarImage[idx].setOpacity(0);\n                }\n                idx += 1;\n                if (doRadarUpdate && idx == 1) {\n                  updateRadar();\n                }\n                if (idx == frameCount + 1) {\n                  idx = 0;\n                }\n                if (idx != frameCount + 1) {\n                  document.getElementById("progress-bar").style.width = (idx+1)*barSize+"px";\n                }\n                if (idx < frameCount) {\n                  document.getElementById('timestamp').innerHTML = radarTime[idx];\n                  radarImage[idx].setOpacity(1);\n                }\n              }\n\n              function resizeWindow() {\n                console.info("resize: " + this.frameElement.offsetWidth);\n                this.document.getElementById("color-bar").width = this.frameElement.offsetWidth;\n                this.document.getElementById("img-color-bar").width = this.frameElement.offsetWidth;\n                this.document.getElementById("mapid").width = this.frameElement.offsetWidth;\n                this.document.getElementById("mapid").height = ${void 0!==this._config.square_map&&this._config.square_map?this.offsetWidth:492}\n                this.document.getElementById("div-progress-bar").width = this.frameElement.offsetWidth;\n                this.document.getElementById("bottom-container").width = this.frameElement.offsetWidth;\n                barSize = this.frameElement.offsetWidth/frameCount;\n              }\n            <\/script>\n          </span>\n        </body>\n      </html>\n    `;console.info("Pre-Width: "+this.offsetWidth);const t=void 0!==this._config.square_map&&this._config.square_map?this.offsetWidth+34+"px":"526px";return z`
      <style>
        ${this.styles}
      </style>
      <ha-card class="type-iframe">
        <div id="root" style="padding-top: ${t}">
          <iframe srcdoc=${e} scrolling="no"></iframe>
        </div>
      </ha-card>
    `}showWarning(e){return z`
      <hui-warning>${e}</hui-warning>
    `}showError(e){const t=document.createElement("hui-error-card");return t.setConfig({type:"error",error:e,origConfig:this._config}),z`
      ${t}
    `}get styles(){return ee`
      .text-container {
        font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;
      }
      #timestamp {
        margin: 2px 0px;
      }
      #color-bar {
        margin: 0px 0px;
      }
      ha-card {
        overflow: hidden;
      }
      #root {
        width: 100%;
        position: relative;
      }
      iframe {
        position: absolute;
        border: none;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    `}};e([G()],Te.prototype,"hass",void 0),e([G()],Te.prototype,"_config",void 0),Te=e([J("bom-radar-card")],Te);export{Te as BomRadarCard};
