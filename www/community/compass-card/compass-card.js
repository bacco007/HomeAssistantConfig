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
function e(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s
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
 */}const t="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(e,t,i=null)=>{for(;t!==i;){const i=t.nextSibling;e.removeChild(t),t=i}},n=`{{lit-${String(Math.random()).slice(2)}}}`,o=`\x3c!--${n}--\x3e`,r=new RegExp(`${n}|${o}`);class s{constructor(e,t){this.parts=[],this.element=t;const i=[],o=[],s=document.createTreeWalker(t.content,133,null,!1);let c=0,u=-1,p=0;const{strings:h,values:{length:f}}=e;for(;p<f;){const e=s.nextNode();if(null!==e){if(u++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:i}=t;let n=0;for(let e=0;e<i;e++)a(t[e].name,"$lit$")&&n++;for(;n-- >0;){const t=h[p],i=l.exec(t)[2],n=i.toLowerCase()+"$lit$",o=e.getAttribute(n);e.removeAttribute(n);const s=o.split(r);this.parts.push({type:"attribute",index:u,name:i,strings:s}),p+=s.length-1}}"TEMPLATE"===e.tagName&&(o.push(e),s.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(n)>=0){const n=e.parentNode,o=t.split(r),s=o.length-1;for(let t=0;t<s;t++){let i,r=o[t];if(""===r)i=d();else{const e=l.exec(r);null!==e&&a(e[2],"$lit$")&&(r=r.slice(0,e.index)+e[1]+e[2].slice(0,-"$lit$".length)+e[3]),i=document.createTextNode(r)}n.insertBefore(i,e),this.parts.push({type:"node",index:++u})}""===o[s]?(n.insertBefore(d(),e),i.push(e)):e.data=o[s],p+=s}}else if(8===e.nodeType)if(e.data===n){const t=e.parentNode;null!==e.previousSibling&&u!==c||(u++,t.insertBefore(d(),e)),c=u,this.parts.push({type:"node",index:u}),null===e.nextSibling?e.data="":(i.push(e),u--),p++}else{let t=-1;for(;-1!==(t=e.data.indexOf(n,t+1));)this.parts.push({type:"node",index:-1}),p++}}else s.currentNode=o.pop()}for(const e of i)e.parentNode.removeChild(e)}}const a=(e,t)=>{const i=e.length-t.length;return i>=0&&e.slice(i)===t},c=e=>-1!==e.index,d=()=>document.createComment(""),l=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function u(e,t){const{element:{content:i},parts:n}=e,o=document.createTreeWalker(i,133,null,!1);let r=h(n),s=n[r],a=-1,c=0;const d=[];let l=null;for(;o.nextNode();){a++;const e=o.currentNode;for(e.previousSibling===l&&(l=null),t.has(e)&&(d.push(e),null===l&&(l=e)),null!==l&&c++;void 0!==s&&s.index===a;)s.index=null!==l?-1:s.index-c,r=h(n,r),s=n[r]}d.forEach(e=>e.parentNode.removeChild(e))}const p=e=>{let t=11===e.nodeType?0:1;const i=document.createTreeWalker(e,133,null,!1);for(;i.nextNode();)t++;return t},h=(e,t=-1)=>{for(let i=t+1;i<e.length;i++){const t=e[i];if(c(t))return i}return-1};
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
const f=new WeakMap,m=e=>"function"==typeof e&&f.has(e),g={},_={};
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
class S{constructor(e,t,i){this.__parts=[],this.template=e,this.processor=t,this.options=i}update(e){let t=0;for(const i of this.__parts)void 0!==i&&i.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=t?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),i=[],n=this.template.parts,o=document.createTreeWalker(e,133,null,!1);let r,s=0,a=0,d=o.nextNode();for(;s<n.length;)if(r=n[s],c(r)){for(;a<r.index;)a++,"TEMPLATE"===d.nodeName&&(i.push(d),o.currentNode=d.content),null===(d=o.nextNode())&&(o.currentNode=i.pop(),d=o.nextNode());if("node"===r.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(d.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(d,r.name,r.strings,this.options));s++}else this.__parts.push(void 0),s++;return t&&(document.adoptNode(e),customElements.upgrade(e)),e}}
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
 */const v=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:e=>e}),y=` ${n} `;class N{constructor(e,t,i,n){this.strings=e,this.values=t,this.type=i,this.processor=n}getHTML(){const e=this.strings.length-1;let t="",i=!1;for(let r=0;r<e;r++){const e=this.strings[r],s=e.lastIndexOf("\x3c!--");i=(s>-1||i)&&-1===e.indexOf("--\x3e",s+1);const a=l.exec(e);t+=null===a?e+(i?y:o):e.substr(0,a.index)+a[1]+a[2]+"$lit$"+a[3]+n}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");let t=this.getHTML();return void 0!==v&&(t=v.createHTML(t)),e.innerHTML=t,e}}
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
 */const b=e=>null===e||!("object"==typeof e||"function"==typeof e),w=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class E{constructor(e,t,i){this.dirty=!0,this.element=e,this.name=t,this.strings=i,this.parts=[];for(let e=0;e<i.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new W(this)}_getValue(){const e=this.strings,t=e.length-1,i=this.parts;if(1===t&&""===e[0]&&""===e[1]){const e=i[0].value;if("symbol"==typeof e)return String(e);if("string"==typeof e||!w(e))return e}let n="";for(let o=0;o<t;o++){n+=e[o];const t=i[o];if(void 0!==t){const e=t.value;if(b(e)||!w(e))n+="string"==typeof e?e:String(e);else for(const t of e)n+="string"==typeof t?t:String(t)}}return n+=e[t],n}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class W{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===g||b(e)&&e===this.value||(this.value=e,m(e)||(this.committer.dirty=!0))}commit(){for(;m(this.value);){const e=this.value;this.value=g,e(this)}this.value!==g&&this.committer.commit()}}class x{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(d()),this.endNode=e.appendChild(d())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=d()),e.__insert(this.endNode=d())}insertAfterPart(e){e.__insert(this.startNode=d()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(null===this.startNode.parentNode)return;for(;m(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=g,e(this)}const e=this.__pendingValue;e!==g&&(b(e)?e!==this.value&&this.__commitText(e):e instanceof N?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):w(e)?this.__commitIterable(e):e===_?(this.value=_,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,i="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=i:this.__commitNode(document.createTextNode(i)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof S&&this.value.template===t)this.value.update(e.values);else{const i=new S(t,e.processor,this.options),n=i._clone();i.update(e.values),this.__commitNode(n),this.value=i}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let i,n=0;for(const o of e)i=t[n],void 0===i&&(i=new x(this.options),t.push(i),0===n?i.appendIntoPart(this):i.insertAfterPart(t[n-1])),i.setValue(o),i.commit(),n++;n<t.length&&(t.length=n,this.clear(i&&i.endNode))}clear(e=this.startNode){i(this.startNode.parentNode,e.nextSibling,this.endNode)}}class O{constructor(e,t,i){if(this.value=void 0,this.__pendingValue=void 0,2!==i.length||""!==i[0]||""!==i[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=i}setValue(e){this.__pendingValue=e}commit(){for(;m(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=g,e(this)}if(this.__pendingValue===g)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=g}}class P extends E{constructor(e,t,i){super(e,t,i),this.single=2===i.length&&""===i[0]&&""===i[1]}_createPart(){return new k(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class k extends W{}let C=!1;(()=>{try{const e={get capture(){return C=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}})();class V{constructor(e,t,i){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=i,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;m(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=g,e(this)}if(this.__pendingValue===g)return;const e=this.__pendingValue,t=this.value,i=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),n=null!=e&&(null==t||i);i&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),n&&(this.__options=$(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=g}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const $=e=>e&&(C?{capture:e.capture,passive:e.passive,once:e.once}:e.capture)
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
 */;function M(e){let t=z.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},z.set(e.type,t));let i=t.stringsArray.get(e.strings);if(void 0!==i)return i;const o=e.strings.join(n);return i=t.keyString.get(o),void 0===i&&(i=new s(e,e.getTemplateElement()),t.keyString.set(o,i)),t.stringsArray.set(e.strings,i),i}const z=new Map,A=new WeakMap;
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
 */const T=new
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
class{handleAttributeExpressions(e,t,i,n){const o=t[0];if("."===o){return new P(e,t.slice(1),i).parts}if("@"===o)return[new V(e,t.slice(1),n.eventContext)];if("?"===o)return[new O(e,t.slice(1),i)];return new E(e,t,i).parts}handleTextExpression(e){return new x(e)}};
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
 */"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.3.0");const D=(e,...t)=>new N(e,t,"html",T)
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
 */,j=(e,t)=>`${e}--${t}`;let R=!0;void 0===window.ShadyCSS?R=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),R=!1);const U=e=>t=>{const i=j(t.type,e);let o=z.get(i);void 0===o&&(o={stringsArray:new WeakMap,keyString:new Map},z.set(i,o));let r=o.stringsArray.get(t.strings);if(void 0!==r)return r;const a=t.strings.join(n);if(r=o.keyString.get(a),void 0===r){const i=t.getTemplateElement();R&&window.ShadyCSS.prepareTemplateDom(i,e),r=new s(t,i),o.keyString.set(a,r)}return o.stringsArray.set(t.strings,r),r},Z=["html","svg"],Y=new Set,q=(e,t,i)=>{Y.add(e);const n=i?i.element:document.createElement("template"),o=t.querySelectorAll("style"),{length:r}=o;if(0===r)return void window.ShadyCSS.prepareTemplateStyles(n,e);const s=document.createElement("style");for(let e=0;e<r;e++){const t=o[e];t.parentNode.removeChild(t),s.textContent+=t.textContent}(e=>{Z.forEach(t=>{const i=z.get(j(t,e));void 0!==i&&i.keyString.forEach(e=>{const{element:{content:t}}=e,i=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{i.add(e)}),u(e,i)})})})(e);const a=n.content;i?function(e,t,i=null){const{element:{content:n},parts:o}=e;if(null==i)return void n.appendChild(t);const r=document.createTreeWalker(n,133,null,!1);let s=h(o),a=0,c=-1;for(;r.nextNode();){c++;for(r.currentNode===i&&(a=p(t),i.parentNode.insertBefore(t,i));-1!==s&&o[s].index===c;){if(a>0){for(;-1!==s;)o[s].index+=a,s=h(o,s);return}s=h(o,s)}}}(i,s,a.firstChild):a.insertBefore(s,a.firstChild),window.ShadyCSS.prepareTemplateStyles(n,e);const c=a.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==c)t.insertBefore(c.cloneNode(!0),t.firstChild);else if(i){a.insertBefore(s,a.firstChild);const e=new Set;e.add(s),u(i,e)}};window.JSCompiler_renameProperty=(e,t)=>e;const H={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},I=(e,t)=>t!==e&&(t==t||e==e),L={attribute:!0,type:String,converter:H,reflect:!1,hasChanged:I};class F extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,i)=>{const n=this._attributeNameForProperty(i,t);void 0!==n&&(this._attributeToPropertyMap.set(n,i),e.push(n))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=L){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const i="symbol"==typeof e?Symbol():"__"+e,n=this.getPropertyDescriptor(e,i,t);void 0!==n&&Object.defineProperty(this.prototype,e,n)}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(n){const o=this[e];this[t]=n,this.requestUpdateInternal(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||L}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty("finalized")||e.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const i of t)this.createProperty(i,e[i])}}static _attributeNameForProperty(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,i=I){return i(e,t)}static _propertyValueFromAttribute(e,t){const i=t.type,n=t.converter||H,o="function"==typeof n?n:n.fromAttribute;return o?o(e,i):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const i=t.type,n=t.converter;return(n&&n.toAttribute||H.toAttribute)(e,i)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,i){t!==i&&this._attributeToProperty(e,i)}_propertyToAttribute(e,t,i=L){const n=this.constructor,o=n._attributeNameForProperty(e,i);if(void 0!==o){const e=n._propertyValueToAttribute(t,i);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(o):this.setAttribute(o,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const i=this.constructor,n=i._attributeToPropertyMap.get(e);if(void 0!==n){const e=i.getPropertyOptions(n);this._updateState=16|this._updateState,this[n]=i._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,i){let n=!0;if(void 0!==e){const o=this.constructor;i=i||o.getPropertyOptions(e),o._valueHasChanged(this[e],t,i.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==i.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,i))):n=!1}!this._hasRequestedUpdate&&n&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(e){}const e=this.performUpdate();return null!=e&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(t){throw e=!1,this._markUpdated(),t}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}F.finalized=!0;
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
const J=e=>t=>"function"==typeof t?((e,t)=>(window.customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:i,elements:n}=t;return{kind:i,elements:n,finisher(t){window.customElements.define(e,t)}}})(e,t),B=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?Object.assign(Object.assign({},t),{finisher(i){i.createProperty(t.key,e)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}};function K(e){return(t,i)=>void 0!==i?((e,t,i)=>{t.constructor.createProperty(i,e)})(e,t,i):B(e,t)}
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const G=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol();class X{constructor(e,t){if(t!==Q)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&(G?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const ee=(e,...t)=>{const i=t.reduce((t,i,n)=>t+(e=>{if(e instanceof X)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(i)+e[n+1],e[0]);return new X(i,Q)};
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
(window.litElementVersions||(window.litElementVersions=[])).push("2.4.0");const te={};class ie extends F{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(e,i)=>e.reduceRight((e,i)=>Array.isArray(i)?t(i,e):(e.add(i),e),i),i=t(e,new Set),n=[];i.forEach(e=>n.unshift(e)),this._styles=n}else this._styles=void 0===e?[]:[e];this._styles=this._styles.map(e=>{if(e instanceof CSSStyleSheet&&!G){const t=Array.prototype.slice.call(e.cssRules).reduce((e,t)=>e+t.cssText,"");return new X(String(t),Q)}return e})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?G?this.renderRoot.adoptedStyleSheets=e.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==te&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){return te}}ie.finalized=!0,ie.render=(e,t,n)=>{if(!n||"object"!=typeof n||!n.scopeName)throw new Error("The `scopeName` option is required.");const o=n.scopeName,r=A.has(t),s=R&&11===t.nodeType&&!!t.host,a=s&&!Y.has(o),c=a?document.createDocumentFragment():t;if(((e,t,n)=>{let o=A.get(t);void 0===o&&(i(t,t.firstChild),A.set(t,o=new x(Object.assign({templateFactory:M},n))),o.appendInto(t)),o.setValue(e),o.commit()})(e,c,Object.assign({templateFactory:U(o)},n)),a){const e=A.get(c);A.delete(c);const n=e.value instanceof S?e.value.template:void 0;q(o,c,n),i(t,t.firstChild),t.appendChild(c),A.set(t,e)}!r&&s&&window.ShadyCSS.styleElement(t.host)};var ne=/d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,oe="[^\\s]+",re=/\[([^]*?)\]/gm;function se(e,t){for(var i=[],n=0,o=e.length;n<o;n++)i.push(e[n].substr(0,t));return i}var ae=function(e){return function(t,i){var n=i[e].map((function(e){return e.toLowerCase()})).indexOf(t.toLowerCase());return n>-1?n:null}};function ce(e){for(var t=[],i=1;i<arguments.length;i++)t[i-1]=arguments[i];for(var n=0,o=t;n<o.length;n++){var r=o[n];for(var s in r)e[s]=r[s]}return e}var de=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],le=["January","February","March","April","May","June","July","August","September","October","November","December"],ue=se(le,3),pe={dayNamesShort:se(de,3),dayNames:de,monthNamesShort:ue,monthNames:le,amPm:["am","pm"],DoFn:function(e){return e+["th","st","nd","rd"][e%10>3?0:(e-e%10!=10?1:0)*e%10]}},he=ce({},pe),fe=function(e,t){for(void 0===t&&(t=2),e=String(e);e.length<t;)e="0"+e;return e},me={D:function(e){return String(e.getDate())},DD:function(e){return fe(e.getDate())},Do:function(e,t){return t.DoFn(e.getDate())},d:function(e){return String(e.getDay())},dd:function(e){return fe(e.getDay())},ddd:function(e,t){return t.dayNamesShort[e.getDay()]},dddd:function(e,t){return t.dayNames[e.getDay()]},M:function(e){return String(e.getMonth()+1)},MM:function(e){return fe(e.getMonth()+1)},MMM:function(e,t){return t.monthNamesShort[e.getMonth()]},MMMM:function(e,t){return t.monthNames[e.getMonth()]},YY:function(e){return fe(String(e.getFullYear()),4).substr(2)},YYYY:function(e){return fe(e.getFullYear(),4)},h:function(e){return String(e.getHours()%12||12)},hh:function(e){return fe(e.getHours()%12||12)},H:function(e){return String(e.getHours())},HH:function(e){return fe(e.getHours())},m:function(e){return String(e.getMinutes())},mm:function(e){return fe(e.getMinutes())},s:function(e){return String(e.getSeconds())},ss:function(e){return fe(e.getSeconds())},S:function(e){return String(Math.round(e.getMilliseconds()/100))},SS:function(e){return fe(Math.round(e.getMilliseconds()/10),2)},SSS:function(e){return fe(e.getMilliseconds(),3)},a:function(e,t){return e.getHours()<12?t.amPm[0]:t.amPm[1]},A:function(e,t){return e.getHours()<12?t.amPm[0].toUpperCase():t.amPm[1].toUpperCase()},ZZ:function(e){var t=e.getTimezoneOffset();return(t>0?"-":"+")+fe(100*Math.floor(Math.abs(t)/60)+Math.abs(t)%60,4)},Z:function(e){var t=e.getTimezoneOffset();return(t>0?"-":"+")+fe(Math.floor(Math.abs(t)/60),2)+":"+fe(Math.abs(t)%60,2)}},ge=function(e){return+e-1},_e=[null,"[1-9]\\d?"],Se=[null,oe],ve=["isPm",oe,function(e,t){var i=e.toLowerCase();return i===t.amPm[0]?0:i===t.amPm[1]?1:null}],ye=["timezoneOffset","[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",function(e){var t=(e+"").match(/([+-]|\d\d)/gi);if(t){var i=60*+t[1]+parseInt(t[2],10);return"+"===t[0]?i:-i}return 0}],Ne=(ae("monthNamesShort"),ae("monthNames"),{default:"ddd MMM DD YYYY HH:mm:ss",shortDate:"M/D/YY",mediumDate:"MMM D, YYYY",longDate:"MMMM D, YYYY",fullDate:"dddd, MMMM D, YYYY",isoDate:"YYYY-MM-DD",isoDateTime:"YYYY-MM-DDTHH:mm:ssZ",shortTime:"HH:mm",mediumTime:"HH:mm:ss",longTime:"HH:mm:ss.SSS"});var be=function(e,t,i){if(void 0===t&&(t=Ne.default),void 0===i&&(i={}),"number"==typeof e&&(e=new Date(e)),"[object Date]"!==Object.prototype.toString.call(e)||isNaN(e.getTime()))throw new Error("Invalid Date pass to format");var n=[];t=(t=Ne[t]||t).replace(re,(function(e,t){return n.push(t),"@@@"}));var o=ce(ce({},he),i);return(t=t.replace(ne,(function(t){return me[t](e,o)}))).replace(/@@@/g,(function(){return n.shift()}))},we=(function(){try{(new Date).toLocaleDateString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(e){return"RangeError"===e.name}}(),{version:"Verze",description:"Zobrazit kompas s indikátorem ve směru hodnoty entity",invalid_configuration:"Neplatná konfigurace",no_entity:"Entita není nakonfigurována",offset_not_a_number:"Kompenzace směru není číslo",invalid:"Neplatné",on:"Zapnuto",off:"Vypnuto"}),Ee={name:"Název",optional:"Volitelný",entity:"Entita",required:"Požadované",primary:"Směr",secondary:"Sekundární",indicator:"Indikátor",direction:"Směr",offset:"Kompenzace",show:"Ukázat",abbreviations:"Zkratky",toggle:"Přepnout",language:"Jazyk"},We={north:"Sever",east:"Východ",south:"Jih",west:"Západ",N:"S",NNE:"SSV",NE:"SV",ENE:"VSV",E:"V",ESE:"VJV",SE:"JV",SSE:"JJV",S:"J",SSW:"JJZ",SW:"JZ",WSW:"ZJZ",W:"Z",WNW:"ZSZ",NW:"SZ",NNW:"SSZ"},xe={common:we,editor:Ee,directions:We},Oe={version:"Version",description:"Zeigt einen Kompass mit einem Indikator in Richtung des Entitätswertes an",invalid_configuration:"Ungültige Konfiguration",no_entity:"Entität nicht konfiguriert",offset_not_a_number:"Richtungs-Offset ist keine Zahl",invalid:"ungültig",on:"An",off:"Aus"},Pe={name:"Name",optional:"Optional",entity:"Entität",required:"Benötigt",primary:"Richtung",secondary:"Sekundär",indicator:"Indikator",direction:"Richtung",offset:"Offset",show:"Zeige",abbreviations:"Abkürzungen",toggle:"Umschalten",language:"Sprache"},ke={north:"Norden",east:"Osten",south:"Süden",west:"Westen",N:"N",NNE:"NNO",NE:"NO",ENE:"ONO",E:"O",ESE:"OSO",SE:"SO",SSE:"SSO",S:"S",SSW:"SSW",SW:"SW",WSW:"WSW",W:"W",WNW:"WNW",NW:"NW",NNW:"NNW"},Ce={common:Oe,editor:Pe,directions:ke},Ve={version:"Version",description:"Show a compass with an indicator in the direction of the entity's value",invalid_configuration:"Invalid configuration",no_entity:"Entity not configured",offset_not_a_number:"Direction offset is not a number",invalid:"invalid",on:"On",off:"Off"},$e={name:"Name",optional:"Optional",entity:"Entity",required:"Required",primary:"Direction",secondary:"Secondary",indicator:"Indicator",direction:"Direction",offset:"Offset",show:"Show",abbreviations:"Abbreviations",toggle:"Toggle",language:"Language"},Me={north:"North",east:"East",south:"South",west:"West",N:"N",NNE:"NNE",NE:"NE",ENE:"ENE",E:"E",ESE:"ESE",SE:"SE",SSE:"SSE",S:"S",SSW:"SSW",SW:"SW",WSW:"WSW",W:"W",WNW:"WNW",NW:"NW",NNW:"NNW"},ze={common:Ve,editor:$e,directions:Me},Ae={version:"Versión",description:"Mostrar una brújula con un indicador en la dirección del valor de la entidad",invalid_configuration:"Configuración inválida",no_entity:"Entidad no configurada",offset_not_a_number:"El desplazamiento de dirección no es un número",invalid:"inválido",on:"Encendido",off:"Apagado"},Te={name:"Nombre",optional:"Opcional",entity:"Entidad",required:"Requerido",primary:"Primario",secondary:"Secundario",indicator:"Indicador",direction:"Dirección",offset:"Desplazamiento",show:"Mostrar",abbreviations:"Abreviaturas",toggle:"Conmutar",language:"Idioma"},De={north:"Norte",east:"Este",south:"Sur",west:"Oeste",N:"N",NNE:"NNE",NE:"NE",ENE:"ENE",E:"E",ESE:"ESE",SE:"SE",SSE:"SSE",S:"S",SSW:"SSO",SW:"SO",WSW:"OSO",W:"O",WNW:"ONO",NW:"NO",NNW:"NNO"},je={common:Ae,editor:Te,directions:De},Re={version:"version",description:"Montre une boussole avec un indicateur dans la direction de la valeur de l'entité",invalid_configuration:"configuration non valable",no_entity:"entité non configurée",offset_not_a_number:"Le décalage de direction n'est pas un nombre",invalid:"invalide",on:"allumé",off:"éteint"},Ue={name:"Nom",optional:"Facultatif",entity:"entité",required:"obligatoire",primary:"primaire",secondary:"secondaire",indicator:"indicateur",direction:"direction",offset:"décalage",show:"montrer",abbreviations:"abréviations",toggle:"basculer",language:"langue"},Ze={north:"Nord",east:"Est",south:"Sud",west:"Ouest",N:"N",NNE:"NNE",NE:"NE",ENE:"ENE",E:"E",ESE:"ESE",SE:"SE",SSE:"SSE",S:"S",SSW:"SSO",SW:"SO",WSW:"OSO",W:"O",WNW:"ONO",NW:"NO",NNW:"NNO"},Ye={common:Re,editor:Ue,directions:Ze},qe={version:"Versione",description:"Mostra una bussola con un indicatore nella direzione indicata dal valore dell'entità.",invalid_configuration:"Configurazione non valida",no_entity:"Entità non configurata",offset_not_a_number:"L'offset della direzione non è un numero.",invalid:"invalido",on:"Acceso",off:"Spento"},He={name:"Nome",optional:"Opzionale",entity:"Entità",required:"Richiesto",primary:"Direzione",secondary:"Secondario",indicator:"Indicatore",direction:"Direzione",offset:"Compensazione",show:"Mostra",abbreviations:"Abbreviazioni",toggle:"Inverti stato",language:"Lingua"},Ie={north:"Nord",east:"Est",south:"Sud",west:"Ovest",N:"N",NNE:"NNE",NE:"NE",ENE:"ENE",E:"E",ESE:"ESE",SE:"SE",SSE:"SSE",S:"S",SSW:"SSO",SW:"SO",WSW:"OSO",W:"O",WNW:"ONO",NW:"NO",NNW:"NNO"},Le={common:qe,editor:He,directions:Ie},Fe={version:"Versie",description:"Toon een kompas met een pijl wijzend naar de waarde van de entity",invalid_configuration:"Foutieve configuratie",no_entity:"Entity niet geconfigureerd",offset_not_a_number:"Direction offset is geen nummer",invalid:"ongeldig",on:"Aan",off:"Uit"},Je={name:"Naam",optional:"Optioneel",entity:"Entiteit",required:"Noodzakelijk",primary:"Richting",secondary:"Secundaire",indicator:"Wijzer",direction:"Richting",offset:"Afwijking",show:"Toon",abbreviations:"Afkorting",toggle:"Wissel",language:"Taal"},Be={north:"Noorden",east:"Oosten",south:"Zuiden",west:"Westen",N:"N",NNE:"NNO",NE:"NO",ENE:"ONO",E:"O",ESE:"OZO",SE:"ZO",SSE:"ZZO",S:"Z",SSW:"ZZW",SW:"ZW",WSW:"WZW",W:"W",WNW:"WNW",NW:"NW",NNW:"NNW"},Ke={common:Fe,editor:Je,directions:Be},Ge={version:"Versjon",description:"Vis et kompass med en indikator i retning av enhetens verdi",invalid_configuration:"Ugyldig konfigurasjon",no_entity:"Enheten er ikke konfigurert",offset_not_a_number:"Retningsforskyvning er ikke et tall",invalid:"Ugyldig",on:"På",off:"Av"},Qe={name:"Navn",optional:"Valgfri",entity:"Enhet",required:"Obligatorisk",primary:"Primær",secondary:"Sekundær",indicator:"Indikator",direction:"Retning",offset:"Offset",show:"Vis",abbreviations:"Forkortelser",toggle:"Veksle",language:"Språk"},Xe={north:"Nord",east:"Øst",south:"Sør",west:"Vest",N:"N",NNE:"NNØ",NE:"NØ",ENE:"ØNØ",E:"Ø",ESE:"ØSØ",SE:"SØ",SSE:"SSØ",S:"S",SSW:"SSV",SW:"SV",WSW:"VSV",W:"V",WNW:"VNV",NW:"NV",NNW:"NNV"},et={common:Ge,editor:Qe,directions:Xe},tt={version:"Wersja",description:"Pokazuje kompas ze wskaźnikiem w kierunku wartości encji",invalid_configuration:"Nieprawidłowa konfiguracja",no_entity:"Encja nie została skonfigurowana",offset_not_a_number:"Przesunięcie kierunkowe nie jest liczbą",invalid:"Nieprawidłowy",on:"Włączony",off:"Wyłączony"},it={name:"Nazwa",optional:"Opcjonalny",entity:"Encja",required:"Wymagany",primary:"Kierunek",secondary:"Dodatkowa",indicator:"Wskaźnik",direction:"Kierunek",offset:"Przesunięcie",show:"Pokaż",abbreviations:"Skróty",toggle:"Przełącznik",language:"Język"},nt={north:"Północ",east:"Wschód",south:"Południe",west:"Zachód",N:"Pn",NNE:"Pn Pn Wsch",NE:"Pn Wsch",ENE:"Wsch Pn Wsch",E:"Wsch",ESE:"Wsch Pd Wsch",SE:"Pd Wsch",SSE:"Pd Pd Wsch",S:"Pd",SSW:"Pd Pd Zach",SW:"Pd Zach",WSW:"Zach Pd Zach",W:"Zach",WNW:"Zach Pn Zach",NW:"Pn Zach",NNW:"Pn Pn Zach"},ot={common:tt,editor:it,directions:nt},rt={version:"versão",description:"Exibe uma bússola com um indicador na direção do valor da entidade",invalid_configuration:"configuração inválida",no_entity:"entidade não configurada",offset_not_a_number:"o offset direcional não é um número",invalid:"inválido",on:"ligado",off:"desligado"},st={name:"nome",optional:"opcional",entity:"entidade",required:"necessário",primary:"primário",secondary:"secundário",indicator:"indicador",direction:"direção",offset:"offset",show:"mostra",abbreviations:"abreviações",toggle:"alternar",language:"idioma"},at={north:"norte",east:"leste",south:"sul",west:"oeste",N:"N",NNE:"NNE",NE:"NE",ENE:"ENE",E:"L",ESE:"ESE",SE:"SE",SSE:"SSE",S:"S",SSW:"SSO",SW:"SO",WSW:"OSO",W:"O",WNW:"ONO",NW:"NO",NNW:"NNO"},ct={common:rt,editor:st,directions:at},dt={version:"Версия",description:"Показывает компас с индикатором в направлении значения объекта",invalid_configuration:"Неверная конфигурация",no_entity:"Объект не сконфигурирован",offset_not_a_number:"Смещение направления не является числом",invalid:"ошибка",on:"Вкл",off:"Выкл"},lt={name:"Имя",optional:"Не обязательно",entity:"Объект",required:"Обязательно",primary:"Направление",secondary:"Дополнительно",indicator:"Индикатор",direction:"Направление",offset:"Смещение",show:"Показать",abbreviations:"Сокращения",toggle:"Включить",language:"Язык"},ut={north:"Север",east:"Восток",south:"Юг",west:"Запад",N:"С",NNE:"ССВ",NE:"СВ",ENE:"ВСВ",E:"В",ESE:"ВСВ",SE:"ЮВ",SSE:"ЮЮВ",S:"Ю",SSW:"ЮЮЗ",SW:"ЮЗ",WSW:"ЗЮЗ",W:"З",WNW:"ЗСЗ",NW:"СЗ",NNW:"ССЗ"},pt={common:dt,editor:lt,directions:ut};const ht={cz:Object.freeze({__proto__:null,common:we,editor:Ee,directions:We,default:xe}),de:Object.freeze({__proto__:null,common:Oe,editor:Pe,directions:ke,default:Ce}),en:Object.freeze({__proto__:null,common:Ve,editor:$e,directions:Me,default:ze}),es:Object.freeze({__proto__:null,common:Ae,editor:Te,directions:De,default:je}),fr:Object.freeze({__proto__:null,common:Re,editor:Ue,directions:Ze,default:Ye}),it:Object.freeze({__proto__:null,common:qe,editor:He,directions:Ie,default:Le}),nl:Object.freeze({__proto__:null,common:Fe,editor:Je,directions:Be,default:Ke}),no:Object.freeze({__proto__:null,common:Ge,editor:Qe,directions:Xe,default:et}),pl:Object.freeze({__proto__:null,common:tt,editor:it,directions:nt,default:ot}),pt:Object.freeze({__proto__:null,common:rt,editor:st,directions:at,default:ct}),ru:Object.freeze({__proto__:null,common:dt,editor:lt,directions:ut,default:pt})},ft=[...Object.keys(ht),""].sort();function mt(e,t="",i="",n=""){let o;""===n&&(n=(localStorage.getItem("selectedLanguage")||"en").replace(/['"]+/g,"").replace("-","_"));try{o=e.split(".").reduce((e,t)=>e[t],ht[n])}catch(t){o=e.split(".").reduce((e,t)=>e[t],ht.en)}return void 0===o&&(o=e.split(".").reduce((e,t)=>e[t],ht.en)),""!==t&&""!==i&&(o=o.replace(t,i)),o}const gt="mdi:compass",_t={N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5},St=[mt("directions.N"),mt("directions.NNE"),mt("directions.NE"),mt("directions.ENE"),mt("directions.E"),mt("directions.ESE"),mt("directions.SE"),mt("directions.SSE"),mt("directions.S"),mt("directions.SSW"),mt("directions.SW"),mt("directions.WSW"),mt("directions.W"),mt("directions.WNW"),mt("directions.NW"),mt("directions.NNW")],vt=mt("common.invalid"),yt=["arrow_inward","arrow_outward","circle"].sort(),Nt=["sensor","input_number","input_text"];let bt=class extends ie{setConfig(e){this._config=e}get _name(){return this._config&&this._config.name||""}get _entity(){return this._config&&this._config.entity||""}get _secondary_entity(){return this._config&&this._config.secondary_entity||""}get _direction_offset(){return this._config&&this._config.direction_offset||"0"}get _compass_indicator(){var e,t;return this._config&&(null===(t=null===(e=this._config)||void 0===e?void 0:e.compass)||void 0===t?void 0:t.indicator)||yt[1]}get _compass_show_north(){var e,t;return this._config&&(null===(t=null===(e=this._config)||void 0===e?void 0:e.compass)||void 0===t?void 0:t.show_north)||!1}get _compass_language(){var e,t;return this._config&&(null===(t=null===(e=this._config)||void 0===e?void 0:e.compass)||void 0===t?void 0:t.language)||""}render(){if(!this.hass)return D``;const e=Object.keys(this.hass.states).filter(e=>Nt.includes(e.substr(0,e.indexOf(".")))).sort();return D`
      <div class="card-config">
        <paper-input label="${mt("editor.name")} (${mt("editor.optional")})" .value=${this._name} .configValue=${"name"} @value-changed=${this._valueChanged}></paper-input>
        <paper-dropdown-menu class="editor-entity-select" label="${mt("editor.primary")} ${mt("editor.entity")} (${mt("editor.required")})" @value-changed=${this._valueChanged} .configValue=${"entity"}>
          <paper-listbox slot="dropdown-content" .selected=${e.indexOf(this._entity)}>
            ${e.map(e=>D` <paper-item>${e}</paper-item> `)}
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-dropdown-menu class="editor-entity-select" label="${mt("editor.secondary")} ${mt("editor.entity")} (${mt("editor.optional")})" @value-changed=${this._valueChanged} .configValue=${"secondary_entity"}>
          <paper-listbox slot="dropdown-content" .selected=${e.indexOf(this._secondary_entity)}>
            ${e.map(e=>D` <paper-item>${e}</paper-item> `)}
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-dropdown-menu class="editor-entity-select" label="${mt("editor.indicator")} (${mt("editor.optional")})" @value-changed=${this._valueChanged} .configValue=${"compass.indicator"}>
          <paper-listbox slot="dropdown-content" .selected=${yt.indexOf(this._compass_indicator)}>
            ${yt.map(e=>D` <paper-item>${e}</paper-item>`)}
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-dropdown-menu
          class="editor-entity-select"
          label="${mt("editor.direction")} ${mt("editor.abbreviations")} ${mt("editor.language")} (${mt("editor.optional")})"
          @value-changed=${this._valueChanged}
          .configValue=${"compass.language"}
        >
          <paper-listbox slot="dropdown-content" .selected=${ft.indexOf(this._compass_language)}>
            ${ft.map(e=>D` <paper-item>${e}</paper-item>`)}
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-input label="${mt("editor.direction")} ${mt("editor.offset")} (${mt("editor.optional")})" .value=${this._direction_offset} @value-changed=${this._valueChanged} .configValue=${"direction_offset"}></paper-input>
        <div class="floated-label-placeholder">${mt("editor.show")} ${mt("directions.north")}</div>
        <ha-switch
          aria-label=${`${mt("editor.toggle")} ${mt("directions.north")} ${this._compass_show_north?mt("common.off"):mt("common.on")}`}
          .checked=${!1!==this._compass_show_north}
          .configValue=${"compass.show_north"}
          @change=${this._valueChanged}
          >${mt("editor.show")} ${mt("directions.north")}</ha-switch
        >
      </div>
    `}getValue(e,t){const i=e.configValue.indexOf(".");if(i>-1){const n=e.configValue.substr(0,i),o=e.configValue.substr(i+1,e.configValue.length);return o.indexOf(".")>-1&&this.getValue(e,o),Object.assign(Object.assign({},t),{[n]:Object.assign(Object.assign({},t[n]),{[o]:void 0!==e.checked?e.checked:e.value})})}return Object.assign(Object.assign({},t),{[e.configValue]:void 0!==e.checked?e.checked:e.value})}_valueChanged(e){if(!this._config||!this.hass)return;const t=e.target;if(void 0!==t.checked){if(this["_"+t.configValue]===t.checked)return}else if(this["_"+t.configValue]===t.value)return;t.configValue&&(this._config=this.getValue(t,this._config)),function(e,t,i,n){n=n||{},i=null==i?{}:i;var o=new Event(t,{bubbles:void 0===n.bubbles||n.bubbles,cancelable:Boolean(n.cancelable),composed:void 0===n.composed||n.composed});o.detail=i,e.dispatchEvent(o)}(this,"config-changed",{config:this._config})}static get styles(){return ee`
      .editor-entity-select {
        width: 100%;
      }

      ha-switch {
        padding-bottom: 8px;
      }
      .floated-label-placeholder {
        font-family: var(--paper-font-caption_-_font-family);
        -webkit-font-smoothing: var(--paper-font-caption_-_-webkit-font-smoothing);
        white-space: var(--paper-font-caption_-_white-space);
        overflow: var(--paper-font-caption_-_overflow);
        text-overflow: var(--paper-font-caption_-_text-overflow);
        font-size: var(--paper-font-caption_-_font-size);
        font-weight: var(--paper-font-caption_-_font-weight);
        letter-spacing: var(--paper-font-caption_-_letter-spacing);
        line-height: var(--paper-font-caption_-_line-height);
      }
    `}};var wt;e([K({attribute:!1})],bt.prototype,"hass",void 0),e([K({attribute:!1,hasChanged:null==wt?void 0:wt.hasChanged})],bt.prototype,"_config",void 0),bt=e([J("compass-card-editor")],bt);const Et=ee`
  :host ::slotted(.card-content:not(:first-child)),
  slot:not(:first-child)::slotted(.card-content) {
    padding-top: 0px;
    margin-top: -8px;
  }
  :host ::slotted(.card-content) {
    padding: 16px;
  }
  .floated-label-placeholder {
    font-family: var(--paper-font-caption_-_font-family);
    -webkit-font-smoothing: var(--paper-font-caption_-_-webkit-font-smoothing);
    white-space: var(--paper-font-caption_-_white-space);
    overflow: var(--paper-font-caption_-_overflow);
    text-overflow: var(--paper-font-caption_-_text-overflow);
    font-size: var(--paper-font-caption_-_font-size);
    font-weight: var(--paper-font-caption_-_font-weight);
    letter-spacing: var(--paper-font-caption_-_letter-spacing);
    line-height: var(--paper-font-caption_-_line-height);
    color: var(--disabled-text-color);
  }
  ha-card {
    flex-direction: column;
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .header {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px 0px;
  }
  .header > .name {
    color: var(--secondary-text-color);
    line-height: 40px;
    font-weight: 500;
    font-size: 16px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .icon {
    color: var(--state-icon-color);
    margin-top: 8px;
    float: right;
  }
  .compass {
    padding: 16px;
    display: block;
    width: 120px;
    height: 120px;
    position: relative;
    margin: 0 auto 10px;
    font-family: var(--paper-font-caption_-_font-family);
  }
  .compass > .direction {
    height: 100%;
    width: 100%;
    display: block;
    border-radius: 100%;
    border-width: 3px;
    border-color: var(--primary-color);
    border-style: solid;
    color: var(--primary-text-color);
  }
  .compass > .direction > p {
    text-align: center;
    margin: 0;
    padding: 30% 0 0 0;
    top: 30px;
    width: 100%;
    line-height: normal;
    display: block;
    font-size: 28px;
    font-weight: bold;
  }
  .compass > .direction > p > span {
    display: block;
    line-height: normal;
    font-size: 11px;
    font-weight: normal;
  }
  .compass > .indicator {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    /* substract the direction border width to get correct size */
    right: -3px;
    /* add the direction border width to get correct size */
    top: 3px;
  }
  .compass > .indicator:after {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    margin-left: 0;
    z-index: 99;
  }

  .compass > .indicator.arrow_outward:after {
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 30px solid var(--accent-color);
    /* substract left+right border width from full size to center */
    left: calc((100% - 16px) / 2);
  }
  .compass > .indicator.arrow_inward:after {
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 30px solid var(--accent-color);
    /* substract left+right border width from full size to center */
    left: calc((100% - 16px) / 2);
  }
  .compass > .indicator.circle:after {
    border: 8px solid var(--accent-color);
    margin: 8px;
    border-radius: 50%;
    /* substract 2x border + 2x margin from full size to center */
    left: calc((100% - 32px) / 2);
  }
  .compass > .indicator.north:after {
    color: var(--primary-color);
    content: 'N';
    padding-top: 0px;
    margin: -3px;
    /* substract margin from full size to center */
    left: calc((100% - 3px) / 2);
  }
`;var Wt;console.info(`%c  COMPASS-CARD \n%c  ${mt("common.version")} 0.4.0    `,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),window.customCards=window.customCards||[],window.customCards.push({type:"compass-card",name:"Compass Card",preview:!0,description:mt("common.description")});let xt=Wt=class extends ie{static async getConfigElement(){return document.createElement("compass-card-editor")}static getStubConfig(){return{entity:"",secondary_entity:"",direction_offset:0,name:"Compass Card"}}setConfig(e){if(!e)throw new Error(mt("common.invalid_configuration"));e.test_gui&&function(){var e=document.querySelector("home-assistant");if(e=(e=(e=(e=(e=(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root")){var t=e.lovelace;return t.current_view=e.___curView,t}return null}().setEditMode(!0),this._config=Object.assign({},e)}shouldUpdate(e){if(e.has("_config"))return!0;if(this._config.entity){const t=e.get("hass");if(t&&t.states[this._config.entity]!==this.hass.states[this._config.entity])return!0}if(this._config.secondary_entity){const t=e.get("hass");if(t&&t.states[this._config.secondary_entity]!==this.hass.states[this._config.secondary_entity])return!0}return!1}render(){if(!this._config||!this.hass)return D``;let e=0;Number.isNaN(Number(this._config.direction_offset))||(e=Wt.positiveDegrees(+this._config.direction_offset));const t=this.hass.states[this._config.entity],i=this._config.secondary_entity?this.hass.states[this._config.secondary_entity]:void 0,n=t?t.attributes.friendly_name:this._config.entity;return D`
      <ha-card tabindex="0" aria-label=${"Compass: "+n} class="flex" @click=${e=>this.handlePopup(e)}>
        ${this.renderHeader()}
        <div class="content">
          ${this.renderCompass(t,i,e)}
        </div>
      </ha-card>
    `}renderCompass(e,t,i){var n,o,r;let s=0,a=mt("common.invalid");const c=e?e.state:vt;if(Number.isNaN(Number(c))){if(s=Wt.getDegrees(c),a=c,-1===s){const e=c.replace(/\s+/g,"").match(/[+-]?\d+(\.\d)?/);s=(null==e?void 0:e.length)?Wt.positiveDegrees(parseFloat(e[0])):0,a=Wt.getCompassAbbreviation(s,null===(n=this._config.compass)||void 0===n?void 0:n.language)}}else s=Wt.positiveDegrees(parseFloat(c)),a=Wt.getCompassAbbreviation(s,null===(o=this._config.compass)||void 0===o?void 0:o.language);return D`
      <div class="compass">
        <div class="direction" style="${this.getConfigStyle(this._config.compass)}">
          <p>
            ${a}
            ${t?D`
                  <span>
                    ${t.state} ${t.attributes.unit_of_measurement}
                  </span>
                `:""}
          </p>
        </div>
        <div class="indicator ${Wt.computeIndicator(this._config)}" style="transform: rotate(${(s+i)%360}deg)"></div>
        ${(null===(r=this._config.compass)||void 0===r?void 0:r.show_north)?D`<div class="indicator north" style="transform: rotate(${Wt.positiveDegrees(i)}deg)"></div>`:""}
      </div>
    `}handlePopup(e){e.stopPropagation(),this._config.tap_action&&((e,t,i,n)=>{let o;switch(n.action||"more-info"){case"more-info":o=new Event("hass-more-info",{composed:!0}),o.detail={entityId:n.entity||(null==i?void 0:i.entity)},e.dispatchEvent(o);break;case"navigate":if(!n.navigation_path)return;window.history.pushState(null,"",n.navigation_path),o=new Event("location-changed",{composed:!0}),o.detail={replace:!1},window.dispatchEvent(o);break;case"call-service":{if(!n.service)return;const[e,i]=n.service.split(".",2),o=n.service_data?Object.assign({},JSON.parse(n.service_data)):"";t.callService(e,i,o);break}case"url":if(!n.url)return;window.location.href=n.url;break;default:;}})(this,this.hass,this._config,this._config.tap_action)}getConfigStyle(e){return e&&e.style_css?e.style_css:""}renderHeader(){return this.computeName()?D`
        <div class="header">
          <div class="name">
            <span>${this.computeName()}</span>
          </div>
          <div class="icon">
            <ha-icon .icon=${this.computeIcon()}></ha-icon>
          </div>
        </div>
      `:""}getCardSize(){return 4}computeName(){if(this._config.name&&this._config.name.trim().length>0)return this._config.name}computeIcon(){const e=this.hass.states[this._config.entity];return e&&e.attributes.icon?e.attributes.icon:gt}static get styles(){return Et}static computeIndicator(e){return e.compass&&e.compass.indicator&&yt.indexOf(e.compass.indicator)>=0?e.compass.indicator:yt[1]}static getDegrees(e){return _t[e]?_t[e]:-1}static getCompassAbbreviation(e,t){const i=Math.round(Wt.positiveDegrees(e)/22.5);let n="N";return i>15&&(n=St[0]),n=St[i],mt("directions."+n,"","",t)}static positiveDegrees(e){return e<0?e+360*(Math.abs(Math.ceil(e/360))+1):e%360}};e([K({attribute:!1})],xt.prototype,"hass",void 0),e([K({attribute:!1})],xt.prototype,"_config",void 0),xt=Wt=e([J("compass-card")],xt);export{xt as CompassCard};
