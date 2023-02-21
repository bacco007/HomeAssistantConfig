/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
function e(e,t,s,r){var n,i=arguments.length,o=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,s):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,s,r);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(o=(i<3?n(o):i>3?n(t,s,o):n(t,s))||o);return i>3&&o&&Object.defineProperty(t,s,o),o
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
 */}const t="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,s=(e,t,s=null)=>{for(;t!==s;){const s=t.nextSibling;e.removeChild(t),t=s}},r=`{{lit-${String(Math.random()).slice(2)}}}`,n=`\x3c!--${r}--\x3e`,i=new RegExp(`${r}|${n}`);class o{constructor(e,t){this.parts=[],this.element=t;const s=[],n=[],o=document.createTreeWalker(t.content,133,null,!1);let l=0,h=-1,u=0;const{strings:p,values:{length:m}}=e;for(;u<m;){const e=o.nextNode();if(null!==e){if(h++,1===e.nodeType){if(e.hasAttributes()){const t=e.attributes,{length:s}=t;let r=0;for(let e=0;e<s;e++)a(t[e].name,"$lit$")&&r++;for(;r-- >0;){const t=p[u],s=d.exec(t)[2],r=s.toLowerCase()+"$lit$",n=e.getAttribute(r);e.removeAttribute(r);const o=n.split(i);this.parts.push({type:"attribute",index:h,name:s,strings:o}),u+=o.length-1}}"TEMPLATE"===e.tagName&&(n.push(e),o.currentNode=e.content)}else if(3===e.nodeType){const t=e.data;if(t.indexOf(r)>=0){const r=e.parentNode,n=t.split(i),o=n.length-1;for(let t=0;t<o;t++){let s,i=n[t];if(""===i)s=c();else{const e=d.exec(i);null!==e&&a(e[2],"$lit$")&&(i=i.slice(0,e.index)+e[1]+e[2].slice(0,-"$lit$".length)+e[3]),s=document.createTextNode(i)}r.insertBefore(s,e),this.parts.push({type:"node",index:++h})}""===n[o]?(r.insertBefore(c(),e),s.push(e)):e.data=n[o],u+=o}}else if(8===e.nodeType)if(e.data===r){const t=e.parentNode;null!==e.previousSibling&&h!==l||(h++,t.insertBefore(c(),e)),l=h,this.parts.push({type:"node",index:h}),null===e.nextSibling?e.data="":(s.push(e),h--),u++}else{let t=-1;for(;-1!==(t=e.data.indexOf(r,t+1));)this.parts.push({type:"node",index:-1}),u++}}else o.currentNode=n.pop()}for(const e of s)e.parentNode.removeChild(e)}}const a=(e,t)=>{const s=e.length-t.length;return s>=0&&e.slice(s)===t},l=e=>-1!==e.index,c=()=>document.createComment(""),d=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function h(e,t){const{element:{content:s},parts:r}=e,n=document.createTreeWalker(s,133,null,!1);let i=p(r),o=r[i],a=-1,l=0;const c=[];let d=null;for(;n.nextNode();){a++;const e=n.currentNode;for(e.previousSibling===d&&(d=null),t.has(e)&&(c.push(e),null===d&&(d=e)),null!==d&&l++;void 0!==o&&o.index===a;)o.index=null!==d?-1:o.index-l,i=p(r,i),o=r[i]}c.forEach(e=>e.parentNode.removeChild(e))}const u=e=>{let t=11===e.nodeType?0:1;const s=document.createTreeWalker(e,133,null,!1);for(;s.nextNode();)t++;return t},p=(e,t=-1)=>{for(let s=t+1;s<e.length;s++){const t=e[s];if(l(t))return s}return-1};
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
const m=new WeakMap,f=e=>"function"==typeof e&&m.has(e),g={},y={};
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
class v{constructor(e,t,s){this.__parts=[],this.template=e,this.processor=t,this.options=s}update(e){let t=0;for(const s of this.__parts)void 0!==s&&s.setValue(e[t]),t++;for(const e of this.__parts)void 0!==e&&e.commit()}_clone(){const e=t?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),s=[],r=this.template.parts,n=document.createTreeWalker(e,133,null,!1);let i,o=0,a=0,c=n.nextNode();for(;o<r.length;)if(i=r[o],l(i)){for(;a<i.index;)a++,"TEMPLATE"===c.nodeName&&(s.push(c),n.currentNode=c.content),null===(c=n.nextNode())&&(n.currentNode=s.pop(),c=n.nextNode());if("node"===i.type){const e=this.processor.handleTextExpression(this.options);e.insertAfterNode(c.previousSibling),this.__parts.push(e)}else this.__parts.push(...this.processor.handleAttributeExpressions(c,i.name,i.strings,this.options));o++}else this.__parts.push(void 0),o++;return t&&(document.adoptNode(e),customElements.upgrade(e)),e}}
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
 */const _=` ${r} `;class w{constructor(e,t,s,r){this.strings=e,this.values=t,this.type=s,this.processor=r}getHTML(){const e=this.strings.length-1;let t="",s=!1;for(let i=0;i<e;i++){const e=this.strings[i],o=e.lastIndexOf("\x3c!--");s=(o>-1||s)&&-1===e.indexOf("--\x3e",o+1);const a=d.exec(e);t+=null===a?e+(s?_:n):e.substr(0,a.index)+a[1]+a[2]+"$lit$"+a[3]+r}return t+=this.strings[e],t}getTemplateElement(){const e=document.createElement("template");return e.innerHTML=this.getHTML(),e}}
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
 */const b=e=>null===e||!("object"==typeof e||"function"==typeof e),S=e=>Array.isArray(e)||!(!e||!e[Symbol.iterator]);class x{constructor(e,t,s){this.dirty=!0,this.element=e,this.name=t,this.strings=s,this.parts=[];for(let e=0;e<s.length-1;e++)this.parts[e]=this._createPart()}_createPart(){return new C(this)}_getValue(){const e=this.strings,t=e.length-1;let s="";for(let r=0;r<t;r++){s+=e[r];const t=this.parts[r];if(void 0!==t){const e=t.value;if(b(e)||!S(e))s+="string"==typeof e?e:String(e);else for(const t of e)s+="string"==typeof t?t:String(t)}}return s+=e[t],s}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class C{constructor(e){this.value=void 0,this.committer=e}setValue(e){e===g||b(e)&&e===this.value||(this.value=e,f(e)||(this.committer.dirty=!0))}commit(){for(;f(this.value);){const e=this.value;this.value=g,e(this)}this.value!==g&&this.committer.commit()}}class P{constructor(e){this.value=void 0,this.__pendingValue=void 0,this.options=e}appendInto(e){this.startNode=e.appendChild(c()),this.endNode=e.appendChild(c())}insertAfterNode(e){this.startNode=e,this.endNode=e.nextSibling}appendIntoPart(e){e.__insert(this.startNode=c()),e.__insert(this.endNode=c())}insertAfterPart(e){e.__insert(this.startNode=c()),this.endNode=e.endNode,e.endNode=this.startNode}setValue(e){this.__pendingValue=e}commit(){if(null===this.startNode.parentNode)return;for(;f(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=g,e(this)}const e=this.__pendingValue;e!==g&&(b(e)?e!==this.value&&this.__commitText(e):e instanceof w?this.__commitTemplateResult(e):e instanceof Node?this.__commitNode(e):S(e)?this.__commitIterable(e):e===y?(this.value=y,this.clear()):this.__commitText(e))}__insert(e){this.endNode.parentNode.insertBefore(e,this.endNode)}__commitNode(e){this.value!==e&&(this.clear(),this.__insert(e),this.value=e)}__commitText(e){const t=this.startNode.nextSibling,s="string"==typeof(e=null==e?"":e)?e:String(e);t===this.endNode.previousSibling&&3===t.nodeType?t.data=s:this.__commitNode(document.createTextNode(s)),this.value=e}__commitTemplateResult(e){const t=this.options.templateFactory(e);if(this.value instanceof v&&this.value.template===t)this.value.update(e.values);else{const s=new v(t,e.processor,this.options),r=s._clone();s.update(e.values),this.__commitNode(r),this.value=s}}__commitIterable(e){Array.isArray(this.value)||(this.value=[],this.clear());const t=this.value;let s,r=0;for(const n of e)s=t[r],void 0===s&&(s=new P(this.options),t.push(s),0===r?s.appendIntoPart(this):s.insertAfterPart(t[r-1])),s.setValue(n),s.commit(),r++;r<t.length&&(t.length=r,this.clear(s&&s.endNode))}clear(e=this.startNode){s(this.startNode.parentNode,e.nextSibling,this.endNode)}}class N{constructor(e,t,s){if(this.value=void 0,this.__pendingValue=void 0,2!==s.length||""!==s[0]||""!==s[1])throw new Error("Boolean attributes can only contain a single expression");this.element=e,this.name=t,this.strings=s}setValue(e){this.__pendingValue=e}commit(){for(;f(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=g,e(this)}if(this.__pendingValue===g)return;const e=!!this.__pendingValue;this.value!==e&&(e?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=e),this.__pendingValue=g}}class k extends x{constructor(e,t,s){super(e,t,s),this.single=2===s.length&&""===s[0]&&""===s[1]}_createPart(){return new E(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class E extends C{}let M=!1;(()=>{try{const e={get capture(){return M=!0,!1}};window.addEventListener("test",e,e),window.removeEventListener("test",e,e)}catch(e){}})();class T{constructor(e,t,s){this.value=void 0,this.__pendingValue=void 0,this.element=e,this.eventName=t,this.eventContext=s,this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(e){this.__pendingValue=e}commit(){for(;f(this.__pendingValue);){const e=this.__pendingValue;this.__pendingValue=g,e(this)}if(this.__pendingValue===g)return;const e=this.__pendingValue,t=this.value,s=null==e||null!=t&&(e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive),r=null!=e&&(null==t||s);s&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),r&&(this.__options=A(e),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=e,this.__pendingValue=g}handleEvent(e){"function"==typeof this.value?this.value.call(this.eventContext||this.element,e):this.value.handleEvent(e)}}const A=e=>e&&(M?{capture:e.capture,passive:e.passive,once:e.once}:e.capture)
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
 */;function D(e){let t=O.get(e.type);void 0===t&&(t={stringsArray:new WeakMap,keyString:new Map},O.set(e.type,t));let s=t.stringsArray.get(e.strings);if(void 0!==s)return s;const n=e.strings.join(r);return s=t.keyString.get(n),void 0===s&&(s=new o(e,e.getTemplateElement()),t.keyString.set(n,s)),t.stringsArray.set(e.strings,s),s}const O=new Map,V=new WeakMap;
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
 */const R=new
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
class{handleAttributeExpressions(e,t,s,r){const n=t[0];if("."===n){return new k(e,t.slice(1),s).parts}if("@"===n)return[new T(e,t.slice(1),r.eventContext)];if("?"===n)return[new N(e,t.slice(1),s)];return new x(e,t,s).parts}handleTextExpression(e){return new P(e)}};
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
 */"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.2.1");const U=(e,...t)=>new w(e,t,"html",R)
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
 */,Y=(e,t)=>`${e}--${t}`;let H=!0;void 0===window.ShadyCSS?H=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),H=!1);const $=e=>t=>{const s=Y(t.type,e);let n=O.get(s);void 0===n&&(n={stringsArray:new WeakMap,keyString:new Map},O.set(s,n));let i=n.stringsArray.get(t.strings);if(void 0!==i)return i;const a=t.strings.join(r);if(i=n.keyString.get(a),void 0===i){const s=t.getTemplateElement();H&&window.ShadyCSS.prepareTemplateDom(s,e),i=new o(t,s),n.keyString.set(a,i)}return n.stringsArray.set(t.strings,i),i},q=["html","svg"],L=new Set,j=(e,t,s)=>{L.add(e);const r=s?s.element:document.createElement("template"),n=t.querySelectorAll("style"),{length:i}=n;if(0===i)return void window.ShadyCSS.prepareTemplateStyles(r,e);const o=document.createElement("style");for(let e=0;e<i;e++){const t=n[e];t.parentNode.removeChild(t),o.textContent+=t.textContent}(e=>{q.forEach(t=>{const s=O.get(Y(t,e));void 0!==s&&s.keyString.forEach(e=>{const{element:{content:t}}=e,s=new Set;Array.from(t.querySelectorAll("style")).forEach(e=>{s.add(e)}),h(e,s)})})})(e);const a=r.content;s?function(e,t,s=null){const{element:{content:r},parts:n}=e;if(null==s)return void r.appendChild(t);const i=document.createTreeWalker(r,133,null,!1);let o=p(n),a=0,l=-1;for(;i.nextNode();){l++;for(i.currentNode===s&&(a=u(t),s.parentNode.insertBefore(t,s));-1!==o&&n[o].index===l;){if(a>0){for(;-1!==o;)n[o].index+=a,o=p(n,o);return}o=p(n,o)}}}(s,o,a.firstChild):a.insertBefore(o,a.firstChild),window.ShadyCSS.prepareTemplateStyles(r,e);const l=a.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==l)t.insertBefore(l.cloneNode(!0),t.firstChild);else if(s){a.insertBefore(o,a.firstChild);const e=new Set;e.add(o),h(s,e)}};window.JSCompiler_renameProperty=(e,t)=>e;const z={toAttribute(e,t){switch(t){case Boolean:return e?"":null;case Object:case Array:return null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){switch(t){case Boolean:return null!==e;case Number:return null===e?null:Number(e);case Object:case Array:return JSON.parse(e)}return e}},I=(e,t)=>t!==e&&(t==t||e==e),F={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:I};class B extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const e=[];return this._classProperties.forEach((t,s)=>{const r=this._attributeNameForProperty(s,t);void 0!==r&&(this._attributeToPropertyMap.set(r,s),e.push(r))}),e}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const e=Object.getPrototypeOf(this)._classProperties;void 0!==e&&e.forEach((e,t)=>this._classProperties.set(t,e))}}static createProperty(e,t=F){if(this._ensureClassProperties(),this._classProperties.set(e,t),t.noAccessor||this.prototype.hasOwnProperty(e))return;const s="symbol"==typeof e?Symbol():"__"+e,r=this.getPropertyDescriptor(e,s,t);void 0!==r&&Object.defineProperty(this.prototype,e,r)}static getPropertyDescriptor(e,t,s){return{get(){return this[t]},set(r){const n=this[e];this[t]=r,this.requestUpdateInternal(e,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this._classProperties&&this._classProperties.get(e)||F}static finalize(){const e=Object.getPrototypeOf(this);if(e.hasOwnProperty("finalized")||e.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const e=this.properties,t=[...Object.getOwnPropertyNames(e),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(e):[]];for(const s of t)this.createProperty(s,e[s])}}static _attributeNameForProperty(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}static _valueHasChanged(e,t,s=I){return s(e,t)}static _propertyValueFromAttribute(e,t){const s=t.type,r=t.converter||z,n="function"==typeof r?r:r.fromAttribute;return n?n(e,s):e}static _propertyValueToAttribute(e,t){if(void 0===t.reflect)return;const s=t.type,r=t.converter;return(r&&r.toAttribute||z.toAttribute)(e,s)}initialize(){this._updateState=0,this._updatePromise=new Promise(e=>this._enableUpdatingResolver=e),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((e,t)=>{if(this.hasOwnProperty(t)){const e=this[t];delete this[t],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(t,e)}})}_applyInstanceProperties(){this._instanceProperties.forEach((e,t)=>this[t]=e),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(e,t,s){t!==s&&this._attributeToProperty(e,s)}_propertyToAttribute(e,t,s=F){const r=this.constructor,n=r._attributeNameForProperty(e,s);if(void 0!==n){const e=r._propertyValueToAttribute(t,s);if(void 0===e)return;this._updateState=8|this._updateState,null==e?this.removeAttribute(n):this.setAttribute(n,e),this._updateState=-9&this._updateState}}_attributeToProperty(e,t){if(8&this._updateState)return;const s=this.constructor,r=s._attributeToPropertyMap.get(e);if(void 0!==r){const e=s.getPropertyOptions(r);this._updateState=16|this._updateState,this[r]=s._propertyValueFromAttribute(t,e),this._updateState=-17&this._updateState}}requestUpdateInternal(e,t,s){let r=!0;if(void 0!==e){const n=this.constructor;s=s||n.getPropertyOptions(e),n._valueHasChanged(this[e],t,s.hasChanged)?(this._changedProperties.has(e)||this._changedProperties.set(e,t),!0!==s.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(e,s))):r=!1}!this._hasRequestedUpdate&&r&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(e,t){return this.requestUpdateInternal(e,t),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(e){}const e=this.performUpdate();return null!=e&&await e,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let e=!1;const t=this._changedProperties;try{e=this.shouldUpdate(t),e?this.update(t):this._markUpdated()}catch(t){throw e=!1,this._markUpdated(),t}e&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(t)),this.updated(t))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(e){return!0}update(e){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((e,t)=>this._propertyToAttribute(t,this[t],e)),this._reflectingProperties=void 0),this._markUpdated()}updated(e){}firstUpdated(e){}}B.finalized=!0;
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
const W=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?Object.assign(Object.assign({},t),{finisher(s){s.createProperty(t.key,e)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(s){s.createProperty(t.key,e)}};function J(e){return(t,s)=>void 0!==s?((e,t,s)=>{t.constructor.createProperty(s,e)})(e,t,s):W(e,t)}const Z=e=>function(e){return J({attribute:!1,hasChanged:null==e?void 0:e.hasChanged})}(e)
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/,G=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol();class Q{constructor(e,t){if(t!==K)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return void 0===this._styleSheet&&(G?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const X=(e,...t)=>{const s=t.reduce((t,s,r)=>t+(e=>{if(e instanceof Q)return e.cssText;if("number"==typeof e)return e;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(s)+e[r+1],e[0]);return new Q(s,K)};
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
(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const ee={};class te extends B{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const e=this.getStyles();if(Array.isArray(e)){const t=(e,s)=>e.reduceRight((e,s)=>Array.isArray(s)?t(s,e):(e.add(s),e),s),s=t(e,new Set),r=[];s.forEach(e=>r.unshift(e)),this._styles=r}else this._styles=void 0===e?[]:[e];this._styles=this._styles.map(e=>{if(e instanceof CSSStyleSheet&&!G){const t=Array.prototype.slice.call(e.cssRules).reduce((e,t)=>e+t.cssText,"");return new Q(String(t),K)}return e})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const e=this.constructor._styles;0!==e.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?G?this.renderRoot.adoptedStyleSheets=e.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e=>e.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(e){const t=this.render();super.update(e),t!==ee&&this.constructor.render(t,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(e=>{const t=document.createElement("style");t.textContent=e.cssText,this.renderRoot.appendChild(t)}))}render(){return ee}}te.finalized=!0,te.render=(e,t,r)=>{if(!r||"object"!=typeof r||!r.scopeName)throw new Error("The `scopeName` option is required.");const n=r.scopeName,i=V.has(t),o=H&&11===t.nodeType&&!!t.host,a=o&&!L.has(n),l=a?document.createDocumentFragment():t;if(((e,t,r)=>{let n=V.get(t);void 0===n&&(s(t,t.firstChild),V.set(t,n=new P(Object.assign({templateFactory:D},r))),n.appendInto(t)),n.setValue(e),n.commit()})(e,l,Object.assign({templateFactory:$(n)},r)),a){const e=V.get(l);V.delete(l);const r=e.value instanceof v?e.value.template:void 0;j(n,l,r),s(t,t.firstChild),t.appendChild(l),V.set(t,e)}!i&&o&&window.ShadyCSS.styleElement(t.host)},te.shadowRootOptions={mode:"open"};var se=/d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,re="[^\\s]+",ne=/\[([^]*?)\]/gm;function ie(e,t){for(var s=[],r=0,n=e.length;r<n;r++)s.push(e[r].substr(0,t));return s}var oe=function(e){return function(t,s){var r=s[e].map((function(e){return e.toLowerCase()})).indexOf(t.toLowerCase());return r>-1?r:null}};function ae(e){for(var t=[],s=1;s<arguments.length;s++)t[s-1]=arguments[s];for(var r=0,n=t;r<n.length;r++){var i=n[r];for(var o in i)e[o]=i[o]}return e}var le=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ce=["January","February","March","April","May","June","July","August","September","October","November","December"],de=ie(ce,3),he={dayNamesShort:ie(le,3),dayNames:le,monthNamesShort:de,monthNames:ce,amPm:["am","pm"],DoFn:function(e){return e+["th","st","nd","rd"][e%10>3?0:(e-e%10!=10?1:0)*e%10]}},ue=ae({},he),pe=function(e,t){for(void 0===t&&(t=2),e=String(e);e.length<t;)e="0"+e;return e},me={D:function(e){return String(e.getDate())},DD:function(e){return pe(e.getDate())},Do:function(e,t){return t.DoFn(e.getDate())},d:function(e){return String(e.getDay())},dd:function(e){return pe(e.getDay())},ddd:function(e,t){return t.dayNamesShort[e.getDay()]},dddd:function(e,t){return t.dayNames[e.getDay()]},M:function(e){return String(e.getMonth()+1)},MM:function(e){return pe(e.getMonth()+1)},MMM:function(e,t){return t.monthNamesShort[e.getMonth()]},MMMM:function(e,t){return t.monthNames[e.getMonth()]},YY:function(e){return pe(String(e.getFullYear()),4).substr(2)},YYYY:function(e){return pe(e.getFullYear(),4)},h:function(e){return String(e.getHours()%12||12)},hh:function(e){return pe(e.getHours()%12||12)},H:function(e){return String(e.getHours())},HH:function(e){return pe(e.getHours())},m:function(e){return String(e.getMinutes())},mm:function(e){return pe(e.getMinutes())},s:function(e){return String(e.getSeconds())},ss:function(e){return pe(e.getSeconds())},S:function(e){return String(Math.round(e.getMilliseconds()/100))},SS:function(e){return pe(Math.round(e.getMilliseconds()/10),2)},SSS:function(e){return pe(e.getMilliseconds(),3)},a:function(e,t){return e.getHours()<12?t.amPm[0]:t.amPm[1]},A:function(e,t){return e.getHours()<12?t.amPm[0].toUpperCase():t.amPm[1].toUpperCase()},ZZ:function(e){var t=e.getTimezoneOffset();return(t>0?"-":"+")+pe(100*Math.floor(Math.abs(t)/60)+Math.abs(t)%60,4)},Z:function(e){var t=e.getTimezoneOffset();return(t>0?"-":"+")+pe(Math.floor(Math.abs(t)/60),2)+":"+pe(Math.abs(t)%60,2)}},fe=function(e){return+e-1},ge=[null,"[1-9]\\d?"],ye=[null,re],ve=["isPm",re,function(e,t){var s=e.toLowerCase();return s===t.amPm[0]?0:s===t.amPm[1]?1:null}],_e=["timezoneOffset","[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",function(e){var t=(e+"").match(/([+-]|\d\d)/gi);if(t){var s=60*+t[1]+parseInt(t[2],10);return"+"===t[0]?s:-s}return 0}],we=(oe("monthNamesShort"),oe("monthNames"),{default:"ddd MMM DD YYYY HH:mm:ss",shortDate:"M/D/YY",mediumDate:"MMM D, YYYY",longDate:"MMMM D, YYYY",fullDate:"dddd, MMMM D, YYYY",isoDate:"YYYY-MM-DD",isoDateTime:"YYYY-MM-DDTHH:mm:ssZ",shortTime:"HH:mm",mediumTime:"HH:mm:ss",longTime:"HH:mm:ss.SSS"});var be=function(e,t,s){if(void 0===t&&(t=we.default),void 0===s&&(s={}),"number"==typeof e&&(e=new Date(e)),"[object Date]"!==Object.prototype.toString.call(e)||isNaN(e.getTime()))throw new Error("Invalid Date pass to format");var r=[];t=(t=we[t]||t).replace(ne,(function(e,t){return r.push(t),"@@@"}));var n=ae(ae({},ue),s);return(t=t.replace(se,(function(t){return me[t](e,n)}))).replace(/@@@/g,(function(){return r.shift()}))};(function(){try{(new Date).toLocaleDateString("i")}catch(e){return"RangeError"===e.name}})(),function(){try{(new Date).toLocaleString("i")}catch(e){return"RangeError"===e.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(e){return"RangeError"===e.name}}();var Se=["closed","locked","off"],xe=function(e,t,s,r){r=r||{},s=null==s?{}:s;var n=new Event(t,{bubbles:void 0===r.bubbles||r.bubbles,cancelable:Boolean(r.cancelable),composed:void 0===r.composed||r.composed});return n.detail=s,e.dispatchEvent(n),n},Ce=function(e){xe(window,"haptic",e)},Pe=function(e,t,s,r){if(r||(r={action:"more-info"}),!r.confirmation||r.confirmation.exemptions&&r.confirmation.exemptions.some((function(e){return e.user===t.user.id}))||(Ce("warning"),confirm(r.confirmation.text||"Are you sure you want to "+r.action+"?")))switch(r.action){case"more-info":(s.entity||s.camera_image)&&xe(e,"hass-more-info",{entityId:s.entity?s.entity:s.camera_image});break;case"navigate":r.navigation_path&&function(e,t,s){void 0===s&&(s=!1),s?history.replaceState(null,"",t):history.pushState(null,"",t),xe(window,"location-changed",{replace:s})}(0,r.navigation_path);break;case"url":r.url_path&&window.open(r.url_path);break;case"toggle":s.entity&&(function(e,t){(function(e,t,s){void 0===s&&(s=!0);var r,n=function(e){return e.substr(0,e.indexOf("."))}(t),i="group"===n?"homeassistant":n;switch(n){case"lock":r=s?"unlock":"lock";break;case"cover":r=s?"open_cover":"close_cover";break;default:r=s?"turn_on":"turn_off"}e.callService(i,r,{entity_id:t})})(e,t,Se.includes(e.states[t].state))}(t,s.entity),Ce("success"));break;case"call-service":if(!r.service)return void Ce("failure");var n=r.service.split(".",2);t.callService(n[0],n[1],r.service_data),Ce("success");break;case"fire-dom-event":xe(e,"ll-custom",r)}};function Ne(){return document.querySelector("hc-main")?document.querySelector("hc-main").hass:document.querySelector("home-assistant")?document.querySelector("home-assistant").hass:void 0}function ke(e,t,s=null){if((e=new Event(e,{bubbles:!0,cancelable:!1,composed:!0})).detail=t||{},s)s.dispatchEvent(e);else{var r=function(){var e=document.querySelector("hc-main");return e=e?(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("hc-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-view")||e.querySelector("hui-panel-view"):(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=document.querySelector("home-assistant"))&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root"))&&e.shadowRoot)&&e.querySelector("ha-app-layout"))&&e.querySelector("#view"))&&e.firstElementChild}();r&&r.dispatchEvent(e)}}let Ee=window.cardHelpers;const Me=new Promise(async(e,t)=>{Ee&&e();const s=async()=>{Ee=await window.loadCardHelpers(),window.cardHelpers=Ee,e()};window.loadCardHelpers?s():window.addEventListener("load",async()=>{!async function(){if(customElements.get("hui-view"))return!0;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");if(e.hass={panels:[{url_path:"tmp",component_name:"lovelace"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),!customElements.get("ha-panel-lovelace"))return!1;const t=document.createElement("ha-panel-lovelace");t.hass=Ne(),void 0===t.hass&&(await new Promise(e=>{window.addEventListener("connection-status",t=>{console.log(t),e()},{once:!0})}),t.hass=Ne()),t.panel={config:{mode:null}},t._fetchConfig()}(),window.loadCardHelpers&&s()})});function Te(e,t){const s={type:"error",error:e,origConfig:t},r=document.createElement("hui-error-card");return customElements.whenDefined("hui-error-card").then(()=>{const e=document.createElement("hui-error-card");e.setConfig(s),r.parentElement&&r.parentElement.replaceChild(e,r)}),Me.then(()=>{ke("ll-rebuild",{},r)}),r}function Ae(e,t){if(!t||"object"!=typeof t||!t.type)return Te(`No ${e} type configured`,t);let s=t.type;if(s=s.startsWith("custom:")?s.substr("custom:".length):`hui-${s}-${e}`,customElements.get(s))return function(e,t){let s=document.createElement(e);try{s.setConfig(JSON.parse(JSON.stringify(t)))}catch(e){s=Te(e,t)}return Me.then(()=>{ke("ll-rebuild",{},s)}),s}(s,t);const r=Te(`Custom element doesn't exist: ${s}.`,t);r.style.display="None";const n=setTimeout(()=>{r.style.display=""},2e3);return customElements.whenDefined(s).then(()=>{clearTimeout(n),ke("ll-rebuild",{},r)}),r}function De(e){return Ee?Ee.createCardElement(e):Ae("card",e)}console.info("%c  HA-Dashboard \n%c  Version 1.1.0    ","color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray");let Oe=class extends te{static getStubConfig(){return{cards:[]}}setConfig(e){var t,s,r,n,i;if(!e)throw new Error("Invalid configuration");if(this._config=e,this._config.usePanel&&(null===(t=this.cards)||void 0===t?void 0:t.length)>1)throw new Error("Only one card is supported");const o=De({type:"vertical-stack",cards:null!==(r=null===(s=e.sidebar)||void 0===s?void 0:s.stickyCards)&&void 0!==r?r:[]});o.hass=this.hass,o.classList.add("sticky-cards"),this._stickySidebarCard=o;const a=De({type:"vertical-stack",cards:null!==(i=null===(n=e.sidebar)||void 0===n?void 0:n.cards)&&void 0!==i?i:[]});a.hass=this.hass,a.classList.add("scroll-panel"),this._sidebarCard=a}shouldUpdate(e){return!!this._config&&(e.has("hass")||e.has("lovelace")||e.has("narrow")||e.has("index")||e.has("cards")||e.has("badges")||e.has("_sidebarCard")||e.has("_stickySidebarCard")||e.has("_config"))}updated(e){var t;if(super.updated(e),this._config.usePanel&&(null===(t=this.cards)||void 0===t?void 0:t.length)>1)throw new Error("Only one card is supported");e.has("hass")&&(this._sidebarCard&&(this._sidebarCard.hass=this.hass),this._stickySidebarCard&&(this._stickySidebarCard.hass=this.hass))}toggleSidebar(){var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector(".sidebar");t&&(t.classList.contains("show")?t.classList.remove("show"):t.classList.add("show"))}render(){var e,t,s,r,n;return U`
            <style>
                @media (max-width: ${(null!==(s=null===(t=null===(e=this._config)||void 0===e?void 0:e.sidebar)||void 0===t?void 0:t.screenMinWidth)&&void 0!==s?s:1024)-1}px) {
                    .sidebar {
                        display: none !important;
                    }

                    .sidebar.show {
                        display: flex !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        z-index: 1000;
                        background: var(--sidebar-overlay-background, var(--sidebar-background, var(--ha-card-background, var(--card-background-color, transparent)))) !important;
                        width: var(--sidebar-overlay-width, var(--sidebar-min-width, 300px)) !important;
                    }
                }
            </style>

            <div class="dashboard">
                <ha-card class="sidebar">
                    ${this._stickySidebarCard}
                    ${this._sidebarCard}
                    <div class="sidebar-buttons">
                        ${null===(n=null===(r=this._config.sidebar)||void 0===r?void 0:r.buttons)||void 0===n?void 0:n.map(e=>U`
                                <div
                                    @click="${()=>function(e,t,s,r){var n;"double_tap"===r&&s.double_tap_action?n=s.double_tap_action:"hold"===r&&s.hold_action?n=s.hold_action:"tap"===r&&s.tap_action&&(n=s.tap_action),Pe(e,t,s,n)}(this,this.hass,{tap_action:e.action},"tap")}"
                                >
                                    <ha-icon .icon=${e.icon}></ha-icon>
                                </div>`)}
                    </div>
                </ha-card>
                ${this._config.usePanel?U`<div class="content-wrapper">
                            ${this.cards[0]}
                        </div>`:U`<hui-masonry-view
                                class="scroll-panel content-wrapper"
                                .hass=${this.hass}
                                .narrow=${this.narrow}
                                .lovelace=${this.lovelace}
                                .cards=${this.cards}
                                .badges=${this.badges}
                                .index=${this.index}>
                        </hui-masonry-view>`}
            </div>
        `}static get styles(){return X`
          .dashboard {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 100vh;
            max-height: calc(100vh - var(--header-height));
            overflow: hidden;
          }

          .sidebar {
            position: relative;
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: var(--sidebar-relative-width, 20%);
            overflow: hidden;
            min-width: var(--sidebar-min-width, 300px);
            max-width: var(--sidebar-max-width, 500px);
            background: var(--ha-card-background, var(--card-background-color, white));
            margin: 7px 0;
            min-height: calc(100% - 2 * 7px);
            display: flex;
            flex-direction: column;
          }

          .sidebar > * {
            --ha-card-background: transparent;
            --ha-card-box-shadow: none;
            flex-grow: 1;
            flex-shrink: 1;
          }

          .sidebar .sticky-cards {
            flex-grow: 0;
            flex-shrink: 0;
          }

          .sidebar .sidebar-buttons {
            flex-grow: 0;
            flex-shrink: 0;
            position: absolute;
            bottom: 0;
            left: 0;
            padding: 0 8px 8px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            width: calc(100% - 16px);
          }

          .sidebar .sidebar-buttons > div:first-child {
            margin-left: 0;
          }

          .sidebar .sidebar-buttons > div {
            --mdc-icon-size: 28px;
            background: var(--primary-color);
            border-radius: 50%;
            padding: 5px;
            cursor: pointer;
            margin-left: 10px;
          }

          .content-wrapper {
            flex-shrink: 1;
            flex-grow: 1;
            flex-basis: calc(100% - var(--sidebar-relative-width, 20%));
            overflow: hidden;
            height: 100%;
          }

          .scroll-panel {
            overflow-x: hidden !important;
            overflow-y: auto !important;
          }

          .scroll-panel::-webkit-scrollbar-track {
            box-shadow: inset 0 0 8px 8px transparent;
            border-left: solid 5px transparent;
          }

          .scroll-panel::-webkit-scrollbar {
            width: calc(3px + 5px);
          }

          .scroll-panel::-webkit-scrollbar-thumb {
            box-shadow: inset 0 0 8px 8px var(--scrollbar-thumb-color, var(--primary-color, rgb(3, 169, 244)));
            border-left: solid 5px transparent;
          }
        `}};var Ve;e([J({attribute:!1})],Oe.prototype,"hass",void 0),e([J({attribute:!1})],Oe.prototype,"lovelace",void 0),e([J({type:Boolean})],Oe.prototype,"narrow",void 0),e([J({type:Number})],Oe.prototype,"index",void 0),e([J({attribute:!1})],Oe.prototype,"cards",void 0),e([J({attribute:!1})],Oe.prototype,"badges",void 0),e([Z()],Oe.prototype,"_sidebarCard",void 0),e([Z()],Oe.prototype,"_stickySidebarCard",void 0),e([Z()],Oe.prototype,"_config",void 0),Oe=e([(Ve="ha-dashboard",e=>"function"==typeof e?((e,t)=>(window.customElements.define(e,t),t))(Ve,e):((e,t)=>{const{kind:s,elements:r}=t;return{kind:s,elements:r,finisher(t){window.customElements.define(e,t)}}})(Ve,e))],Oe);export{Oe as HADashboard};
