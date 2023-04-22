'use strict';

function _iterableToArrayLimit(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s,
      _e,
      _x,
      _r,
      _arr = [],
      _n = !0,
      _d = !1;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i) return;
        _n = !1;
      } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
    } catch (err) {
      _d = !0, _e = err;
    } finally {
      try {
        if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}
function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get.bind();
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }
      return desc.value;
    };
  }
  return _get.apply(this, arguments);
}
function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
function _decorate(decorators, factory, superClass, mixins) {
  var api = _getDecoratorsApi();
  if (mixins) {
    for (var i = 0; i < mixins.length; i++) {
      api = mixins[i](api);
    }
  }
  var r = factory(function initialize(O) {
    api.initializeInstanceElements(O, decorated.elements);
  }, superClass);
  var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
  api.initializeClassElements(r.F, decorated.elements);
  return api.runClassFinishers(r.F, decorated.finishers);
}
function _getDecoratorsApi() {
  _getDecoratorsApi = function () {
    return api;
  };
  var api = {
    elementsDefinitionOrder: [["method"], ["field"]],
    initializeInstanceElements: function (O, elements) {
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          if (element.kind === kind && element.placement === "own") {
            this.defineClassElement(O, element);
          }
        }, this);
      }, this);
    },
    initializeClassElements: function (F, elements) {
      var proto = F.prototype;
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          var placement = element.placement;
          if (element.kind === kind && (placement === "static" || placement === "prototype")) {
            var receiver = placement === "static" ? F : proto;
            this.defineClassElement(receiver, element);
          }
        }, this);
      }, this);
    },
    defineClassElement: function (receiver, element) {
      var descriptor = element.descriptor;
      if (element.kind === "field") {
        var initializer = element.initializer;
        descriptor = {
          enumerable: descriptor.enumerable,
          writable: descriptor.writable,
          configurable: descriptor.configurable,
          value: initializer === void 0 ? void 0 : initializer.call(receiver)
        };
      }
      Object.defineProperty(receiver, element.key, descriptor);
    },
    decorateClass: function (elements, decorators) {
      var newElements = [];
      var finishers = [];
      var placements = {
        static: [],
        prototype: [],
        own: []
      };
      elements.forEach(function (element) {
        this.addElementPlacement(element, placements);
      }, this);
      elements.forEach(function (element) {
        if (!_hasDecorators(element)) return newElements.push(element);
        var elementFinishersExtras = this.decorateElement(element, placements);
        newElements.push(elementFinishersExtras.element);
        newElements.push.apply(newElements, elementFinishersExtras.extras);
        finishers.push.apply(finishers, elementFinishersExtras.finishers);
      }, this);
      if (!decorators) {
        return {
          elements: newElements,
          finishers: finishers
        };
      }
      var result = this.decorateConstructor(newElements, decorators);
      finishers.push.apply(finishers, result.finishers);
      result.finishers = finishers;
      return result;
    },
    addElementPlacement: function (element, placements, silent) {
      var keys = placements[element.placement];
      if (!silent && keys.indexOf(element.key) !== -1) {
        throw new TypeError("Duplicated element (" + element.key + ")");
      }
      keys.push(element.key);
    },
    decorateElement: function (element, placements) {
      var extras = [];
      var finishers = [];
      for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
        var keys = placements[element.placement];
        keys.splice(keys.indexOf(element.key), 1);
        var elementObject = this.fromElementDescriptor(element);
        var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
        element = elementFinisherExtras.element;
        this.addElementPlacement(element, placements);
        if (elementFinisherExtras.finisher) {
          finishers.push(elementFinisherExtras.finisher);
        }
        var newExtras = elementFinisherExtras.extras;
        if (newExtras) {
          for (var j = 0; j < newExtras.length; j++) {
            this.addElementPlacement(newExtras[j], placements);
          }
          extras.push.apply(extras, newExtras);
        }
      }
      return {
        element: element,
        finishers: finishers,
        extras: extras
      };
    },
    decorateConstructor: function (elements, decorators) {
      var finishers = [];
      for (var i = decorators.length - 1; i >= 0; i--) {
        var obj = this.fromClassDescriptor(elements);
        var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);
        if (elementsAndFinisher.finisher !== undefined) {
          finishers.push(elementsAndFinisher.finisher);
        }
        if (elementsAndFinisher.elements !== undefined) {
          elements = elementsAndFinisher.elements;
          for (var j = 0; j < elements.length - 1; j++) {
            for (var k = j + 1; k < elements.length; k++) {
              if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
                throw new TypeError("Duplicated element (" + elements[j].key + ")");
              }
            }
          }
        }
      }
      return {
        elements: elements,
        finishers: finishers
      };
    },
    fromElementDescriptor: function (element) {
      var obj = {
        kind: element.kind,
        key: element.key,
        placement: element.placement,
        descriptor: element.descriptor
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      if (element.kind === "field") obj.initializer = element.initializer;
      return obj;
    },
    toElementDescriptors: function (elementObjects) {
      if (elementObjects === undefined) return;
      return _toArray(elementObjects).map(function (elementObject) {
        var element = this.toElementDescriptor(elementObject);
        this.disallowProperty(elementObject, "finisher", "An element descriptor");
        this.disallowProperty(elementObject, "extras", "An element descriptor");
        return element;
      }, this);
    },
    toElementDescriptor: function (elementObject) {
      var kind = String(elementObject.kind);
      if (kind !== "method" && kind !== "field") {
        throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
      }
      var key = _toPropertyKey(elementObject.key);
      var placement = String(elementObject.placement);
      if (placement !== "static" && placement !== "prototype" && placement !== "own") {
        throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
      }
      var descriptor = elementObject.descriptor;
      this.disallowProperty(elementObject, "elements", "An element descriptor");
      var element = {
        kind: kind,
        key: key,
        placement: placement,
        descriptor: Object.assign({}, descriptor)
      };
      if (kind !== "field") {
        this.disallowProperty(elementObject, "initializer", "A method descriptor");
      } else {
        this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
        element.initializer = elementObject.initializer;
      }
      return element;
    },
    toElementFinisherExtras: function (elementObject) {
      var element = this.toElementDescriptor(elementObject);
      var finisher = _optionalCallableProperty(elementObject, "finisher");
      var extras = this.toElementDescriptors(elementObject.extras);
      return {
        element: element,
        finisher: finisher,
        extras: extras
      };
    },
    fromClassDescriptor: function (elements) {
      var obj = {
        kind: "class",
        elements: elements.map(this.fromElementDescriptor, this)
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      return obj;
    },
    toClassDescriptor: function (obj) {
      var kind = String(obj.kind);
      if (kind !== "class") {
        throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
      }
      this.disallowProperty(obj, "key", "A class descriptor");
      this.disallowProperty(obj, "placement", "A class descriptor");
      this.disallowProperty(obj, "descriptor", "A class descriptor");
      this.disallowProperty(obj, "initializer", "A class descriptor");
      this.disallowProperty(obj, "extras", "A class descriptor");
      var finisher = _optionalCallableProperty(obj, "finisher");
      var elements = this.toElementDescriptors(obj.elements);
      return {
        elements: elements,
        finisher: finisher
      };
    },
    runClassFinishers: function (constructor, finishers) {
      for (var i = 0; i < finishers.length; i++) {
        var newConstructor = (0, finishers[i])(constructor);
        if (newConstructor !== undefined) {
          if (typeof newConstructor !== "function") {
            throw new TypeError("Finishers must return a constructor.");
          }
          constructor = newConstructor;
        }
      }
      return constructor;
    },
    disallowProperty: function (obj, name, objectType) {
      if (obj[name] !== undefined) {
        throw new TypeError(objectType + " can't have a ." + name + " property.");
      }
    }
  };
  return api;
}
function _createElementDescriptor(def) {
  var key = _toPropertyKey(def.key);
  var descriptor;
  if (def.kind === "method") {
    descriptor = {
      value: def.value,
      writable: true,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "get") {
    descriptor = {
      get: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "set") {
    descriptor = {
      set: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "field") {
    descriptor = {
      configurable: true,
      writable: true,
      enumerable: true
    };
  }
  var element = {
    kind: def.kind === "field" ? "field" : "method",
    key: key,
    placement: def.static ? "static" : def.kind === "field" ? "own" : "prototype",
    descriptor: descriptor
  };
  if (def.decorators) element.decorators = def.decorators;
  if (def.kind === "field") element.initializer = def.value;
  return element;
}
function _coalesceGetterSetter(element, other) {
  if (element.descriptor.get !== undefined) {
    other.descriptor.get = element.descriptor.get;
  } else {
    other.descriptor.set = element.descriptor.set;
  }
}
function _coalesceClassElements(elements) {
  var newElements = [];
  var isSameElement = function (other) {
    return other.kind === "method" && other.key === element.key && other.placement === element.placement;
  };
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var other;
    if (element.kind === "method" && (other = newElements.find(isSameElement))) {
      if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
        if (_hasDecorators(element) || _hasDecorators(other)) {
          throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
        }
        other.descriptor = element.descriptor;
      } else {
        if (_hasDecorators(element)) {
          if (_hasDecorators(other)) {
            throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
          }
          other.decorators = element.decorators;
        }
        _coalesceGetterSetter(element, other);
      }
    } else {
      newElements.push(element);
    }
  }
  return newElements;
}
function _hasDecorators(element) {
  return element.decorators && element.decorators.length;
}
function _isDataDescriptor(desc) {
  return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
}
function _optionalCallableProperty(obj, name) {
  var value = obj[name];
  if (value !== undefined && typeof value !== "function") {
    throw new TypeError("Expected '" + name + "' to be a function");
  }
  return value;
}

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=window,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),n$3=new WeakMap;let o$3 = class o{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new o$3("string"==typeof t?t:t+"",void 0,s$3),i$1=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$3(n,t,s$3)},S$1=(s,n)=>{e$2?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$1.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$1=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var s$2;const e$1=window,r$1=e$1.trustedTypes,h$1=r$1?r$1.emptyScript:"",o$2=e$1.reactiveElementPolyfillSupport,n$2={toAttribute(t,i){switch(i){case Boolean:t=t?h$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:n$2,reflect:!1,hasChanged:a$1};let d$1 = class d extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$1(i));}else void 0!==i&&s.push(c$1(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$2){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$2).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$2;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}};d$1.finalized=!0,d$1.elementProperties=new Map,d$1.elementStyles=[],d$1.shadowRootOptions={mode:"open"},null==o$2||o$2({ReactiveElement:d$1}),(null!==(s$2=e$1.reactiveElementVersions)&&void 0!==s$2?s$2:e$1.reactiveElementVersions=[]).push("1.6.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t;const i=window,s$1=i.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$1=`lit$${(Math.random()+"").slice(9)}$`,n$1="?"+o$1,l$1=`<${n$1}>`,h=document,r=(t="")=>h.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,c=t=>u(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,a=/-->/g,f=/>/g,_=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),m=/'/g,p=/"/g,$=/^(?:script|style|textarea|title)$/i,g=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),y=g(1),x=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),T=new WeakMap,A=h.createTreeWalker(h,129,null,!1),E=(t,i)=>{const s=t.length-1,n=[];let h,r=2===i?"<svg>":"",d=v;for(let i=0;i<s;i++){const s=t[i];let e,u,c=-1,g=0;for(;g<s.length&&(d.lastIndex=g,u=d.exec(s),null!==u);)g=d.lastIndex,d===v?"!--"===u[1]?d=a:void 0!==u[1]?d=f:void 0!==u[2]?($.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=_):void 0!==u[3]&&(d=_):d===_?">"===u[0]?(d=null!=h?h:v,c=-1):void 0===u[1]?c=-2:(c=d.lastIndex-u[2].length,e=u[1],d=void 0===u[3]?_:'"'===u[3]?p:m):d===p||d===m?d=_:d===a||d===f?d=v:(d=_,h=void 0);const y=d===_&&t[i+1].startsWith("/>")?" ":"";r+=d===v?s+l$1:c>=0?(n.push(e),s.slice(0,c)+"$lit$"+s.slice(c)+o$1+y):s+o$1+(-2===c?(n.push(void 0),i):y);}const u=r+(t[s]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==e?e.createHTML(u):u,n]};class C{constructor({strings:t,_$litType$:i},e){let l;this.parts=[];let h=0,d=0;const u=t.length-1,c=this.parts,[v,a]=E(t,i);if(this.el=C.createElement(v,e),A.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(o$1)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(o$1),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:h,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?k:"@"===i[1]?H:S});}else c.push({type:6,index:h});}for(const i of t)l.removeAttribute(i);}if($.test(l.tagName)){const t=l.textContent.split(o$1),i=t.length-1;if(i>0){l.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)l.append(t[s],r()),A.nextNode(),c.push({type:2,index:++h});l.append(t[i],r());}}}else if(8===l.nodeType)if(l.data===n$1)c.push({type:2,index:h});else {let t=-1;for(;-1!==(t=l.data.indexOf(o$1,t+1));)c.push({type:7,index:h}),t+=o$1.length-1;}h++;}}static createElement(t,i){const s=h.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===x)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=P(t,r._$AS(t,i.values),r,e)),i}class V{constructor(t,i){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:h).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),l=0,r=0,d=e[0];for(;void 0!==d;){if(l===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new I(n,this,t)),this.u.push(i),d=e[++r];}l!==(null==d?void 0:d.index)&&(n=A.nextNode(),l++);}return o}p(t){let i=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cm=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),d(t)?t===b||null==t||""===t?(this._$AH!==b&&this._$AR(),this._$AH=b):t!==this._$AH&&t!==x&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):c(t)?this.k(t):this.g(t);}O(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}g(t){this._$AH!==b&&d(this._$AH)?this._$AA.nextSibling.data=t:this.T(h.createTextNode(t)),this._$AH=t;}$(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=C.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.p(s);else {const t=new V(o,this),i=t.v(this.options);t.p(s),this.T(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new C(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.O(r()),this.O(r()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cm=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=b,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==x,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===x&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===b?t=b:t!==b&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===b?void 0:t;}}const R=s$1?s$1.emptyScript:"";class k extends S{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==b?this.element.setAttribute(this.name,R):this.element.removeAttribute(this.name);}}class H extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:b)===x)return;const e=this._$AH,o=t===b&&e!==b||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==b&&(e===b||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class I{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=i.litHtmlPolyfillSupport;null==z||z(C,N),(null!==(t=i.litHtmlVersions)&&void 0!==t?t:i.litHtmlVersions=[]).push("2.6.1");const Z=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(r(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var l,o;class s extends d$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Z(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return x}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n=globalThis.litElementPolyfillSupport;null==n||n({LitElement:s});(null!==(o=globalThis.litElementVersions)&&void 0!==o?o:globalThis.litElementVersions=[]).push("3.2.2");

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
/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = typeof window !== 'undefined' &&
    window.customElements != null &&
    window.customElements.polyfillWrapFlushCallback !==
        undefined;
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */
const removeNodes = (container, start, end = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};

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
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */
const boundAttributeSuffix = '$lit$';
/**
 * An updatable Template that tracks the location of dynamic parts.
 */
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        const nodesToRemove = [];
        const stack = [];
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        // Keeps track of the last index associated with a part. We try to delete
        // unnecessary nodes, but we never want to associate two different parts
        // to the same index. They must have a constant node between.
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings, values: { length } } = result;
        while (partIndex < length) {
            const node = walker.nextNode();
            if (node === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                if (node.hasAttributes()) {
                    const attributes = node.attributes;
                    const { length } = attributes;
                    // Per
                    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                    // attributes are not guaranteed to be returned in document order.
                    // In particular, Edge/IE can return them out of order, so we cannot
                    // assume a correspondence between part index and attribute index.
                    let count = 0;
                    for (let i = 0; i < length; i++) {
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while (count-- > 0) {
                        // Get the template literal section leading up to the first
                        // expression in this attribute
                        const stringForPart = strings[partIndex];
                        // Find the attribute name
                        const name = lastAttributeNameRegex.exec(stringForPart)[2];
                        // Find the corresponding attribute
                        // All bound attributes have had a suffix added in
                        // TemplateResult#getHTML to opt out of special attribute
                        // handling. To look up the attribute value we also need to add
                        // the suffix.
                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        const attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        const statics = attributeValue.split(markerRegex);
                        this.parts.push({ type: 'attribute', index, name, strings: statics });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            }
            else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                const data = node.data;
                if (data.indexOf(marker) >= 0) {
                    const parent = node.parentNode;
                    const strings = data.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (let i = 0; i < lastIndex; i++) {
                        let insert;
                        let s = strings[i];
                        if (s === '') {
                            insert = createMarker();
                        }
                        else {
                            const match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] +
                                    match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({ type: 'node', index: ++index });
                    }
                    // If there's no text, we must insert a comment to mark our place.
                    // Else, we can trust it will stick around after cloning.
                    if (strings[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    }
                    else {
                        node.data = strings[lastIndex];
                    }
                    // We have a part for each match found
                    partIndex += lastIndex;
                }
            }
            else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                if (node.data === marker) {
                    const parent = node.parentNode;
                    // Add a new marker node to be the startNode of the Part if any of
                    // the following are true:
                    //  * We don't have a previousSibling
                    //  * The previousSibling is already the start of a previous part
                    if (node.previousSibling === null || index === lastPartIndex) {
                        index++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push({ type: 'node', index });
                    // If we don't have a nextSibling, keep this node so we have an end.
                    // Else, we can remove it to save future costs.
                    if (node.nextSibling === null) {
                        node.data = '';
                    }
                    else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                }
                else {
                    let i = -1;
                    while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                        // Comment node has a binding marker inside, make an inactive part
                        // The binding won't work, but subsequent bindings will
                        // TODO (justinfagnani): consider whether it's even worth it to
                        // make bindings in comments work
                        this.parts.push({ type: 'node', index: -1 });
                        partIndex++;
                    }
                }
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const endsWith = (str, suffix) => {
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
};
const isTemplatePartActive = (part) => part.index !== -1;
// Allows `document.createComment('')` to be renamed for a
// small manual size-savings.
const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const lastAttributeNameRegex = 
// eslint-disable-next-line no-control-regex
/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

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
const walkerNodeFilter = 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;
/**
 * Removes the list of nodes from a Template safely. In addition to removing
 * nodes from the Template, the Template part indices are updated to match
 * the mutated Template DOM.
 *
 * As the template is walked the removal state is tracked and
 * part indices are adjusted as needed.
 *
 * div
 *   div#1 (remove) <-- start removing (removing node is div#1)
 *     div
 *       div#2 (remove)  <-- continue removing (removing node is still div#1)
 *         div
 * div <-- stop removing since previous sibling is the removing node (div#1,
 * removed 4 nodes)
 */
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content }, parts } = template;
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while (walker.nextNode()) {
        nodeIndex++;
        const node = walker.currentNode;
        // End removal if stepped past the removing node
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        // A node to remove was found in the template
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            // Track node we're removing
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        // When removing, increment count by which to adjust subsequent part indices
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while (part !== undefined && part.index === nodeIndex) {
            // If part is in a removed node deactivate it by setting index to -1 or
            // adjust the index as needed.
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            // go to the next active part.
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
}
const countNodes = (node) => {
    let count = (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? 0 : 1;
    const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
    while (walker.nextNode()) {
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
    for (let i = startIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        if (isTemplatePartActive(part)) {
            return i;
        }
    }
    return -1;
};
/**
 * Inserts the given node into the Template, optionally before the given
 * refNode. In addition to inserting the node into the Template, the Template
 * part indices are updated to match the mutated Template DOM.
 */
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content }, parts } = template;
    // If there's no refNode, then put node at end of template.
    // No part indices need to be shifted in this case.
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while (walker.nextNode()) {
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
            // If we've inserted the node, simply adjust all subsequent parts
            if (insertCount > 0) {
                while (partIndex !== -1) {
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}

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
const directives = new WeakMap();
const isDirective = (o) => {
    return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
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
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */
const nothing = {};

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
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
class TemplateInstance {
    constructor(template, processor, options) {
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        //     method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //    through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //    cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari does not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        const fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        const stack = [];
        const parts = this.template.parts;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        let partIndex = 0;
        let nodeIndex = 0;
        let part;
        let node = walker.nextNode();
        // Loop through all the nodes and parts of a template
        while (partIndex < parts.length) {
            part = parts[partIndex];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.
            while (nodeIndex < part.index) {
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            // We've arrived at our part's node.
            if (part.type === 'node') {
                const part = this.processor.handleTextExpression(this.options);
                part.insertAfterNode(node.previousSibling);
                this.__parts.push(part);
            }
            else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}

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
/**
 * Our TrustedTypePolicy for HTML which is declared using the html template
 * tag function.
 *
 * That HTML is a developer-authored constant, and is parsed with innerHTML
 * before any untrusted expressions have been mixed in. Therefor it is
 * considered safe by construction.
 */
const policy = window.trustedTypes &&
    trustedTypes.createPolicy('lit-html', { createHTML: (s) => s });
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment position.
            //   * For node-position bindings we insert a comment with the marker
            //     sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            //     first binding, so that we support unquoted attribute bindings.
            //     Subsequent bindings can use a comment marker because multi-binding
            //     attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            //     close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.
            const commentOpen = s.lastIndexOf('<!--');
            // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.
            isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                s.indexOf('-->', commentOpen + 1) === -1;
            // Check to see if we have an attribute-like sequence preceding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.
            const attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                // We're only in this branch if we don't have a attribute-like
                // preceding sequence. For comments, this guards against unusual
                // attribute values like <div foo="<!--${'bar'}">. Cases like
                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                // below.
                html += s + (isCommentBinding ? commentMarker : nodeMarker);
            }
            else {
                // For attributes we use just a marker sentinel, and also append a
                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                // that IE and Edge do for style and certain SVG attributes.
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                    attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                    marker;
            }
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        let value = this.getHTML();
        if (policy !== undefined) {
            // this is secure because `this.strings` is a TemplateStringsArray.
            // TODO: validate this when
            // https://github.com/tc39/proposal-array-is-template-object is
            // implemented.
            value = policy.createHTML(value);
        }
        template.innerHTML = value;
        return template;
    }
}

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
const isPrimitive = (value) => {
    return (value === null ||
        !(typeof value === 'object' || typeof value === 'function'));
};
const isIterable = (value) => {
    return Array.isArray(value) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !!(value && value[Symbol.iterator]);
};
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */
class NodePart {
    constructor(options) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    }
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    }
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        if (this.startNode.parentNode === null) {
            return;
        }
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        const value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this.__commitNode(value);
        }
        else if (isIterable(value)) {
            this.__commitIterable(value);
        }
        else if (value === nothing) {
            this.value = nothing;
            this.clear();
        }
        else {
            // Fallback, will render the string representation
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.
        const valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling &&
            node.nodeType === 3 /* Node.TEXT_NODE */) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.data = valueAsString;
        }
        else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance &&
            this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            // Try to reuse an existing part
            itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported = false;
// Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module
(() => {
    try {
        const options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener('test', options, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.removeEventListener('test', options, options);
    }
    catch (_e) {
        // event options not supported
    }
})();

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
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    // If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content
    const key = result.strings.join(marker);
    // Check if we already have a Template for this key
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        // If we have not seen this key before, create a new Template
        template = new Template(result, result.getTemplateElement());
        // Cache the Template for this key
        templateCache.keyString.set(key, template);
    }
    // Cache all future queries for this TemplateStringsArray
    templateCache.stringsArray.set(result.strings, template);
    return template;
}
const templateCaches = new Map();

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
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
const render$1 = (result, container, options) => {
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};

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
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.4.1');
}

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
// Get a key to lookup in `templateCaches`.
const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
}
else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected. ` +
        `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` +
        `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */
const shadyTemplateFactory = (scopeName) => (result) => {
    const cacheKey = getTemplateCacheKey(result.type, scopeName);
    let templateCache = templateCaches.get(cacheKey);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(cacheKey, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    const key = result.strings.join(marker);
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        const element = result.getTemplateElement();
        if (compatibleShadyCSSVersion) {
            window.ShadyCSS.prepareTemplateDom(element, scopeName);
        }
        template = new Template(result, element);
        templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */
const removeStylesFromLitTemplates = (scopeName) => {
    TEMPLATE_TYPES.forEach((type) => {
        const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.keyString.forEach((template) => {
                const { element: { content } } = template;
                // IE 11 doesn't support the iterable param Set constructor
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach((s) => {
                    styles.add(s);
                });
                removeNodesFromTemplate(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered
 * output.
 */
const prepareTemplateStyles = (scopeName, renderedDOM, template) => {
    shadyRenderSet.add(scopeName);
    // If `renderedDOM` is stamped from a Template, then we need to edit that
    // Template's underlying template element. Otherwise, we create one here
    // to give to ShadyCSS, which still requires one while scoping.
    const templateElement = !!template ? template.element : document.createElement('template');
    // Move styles out of rendered DOM and store.
    const styles = renderedDOM.querySelectorAll('style');
    const { length } = styles;
    // If there are no styles, skip unnecessary work
    if (length === 0) {
        // Ensure prepareTemplateStyles is called to support adding
        // styles via `prepareAdoptedCssText` since that requires that
        // `prepareTemplateStyles` is called.
        //
        // ShadyCSS will only update styles containing @apply in the template
        // given to `prepareTemplateStyles`. If no lit Template was given,
        // ShadyCSS will not be able to update uses of @apply in any relevant
        // template. However, this is not a problem because we only create the
        // template for the purpose of supporting `prepareAdoptedCssText`,
        // which doesn't support @apply at all.
        window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
        return;
    }
    const condensedStyle = document.createElement('style');
    // Collect styles into a single style. This helps us make sure ShadyCSS
    // manipulations will not prevent us from being able to fix up template
    // part indices.
    // NOTE: collecting styles is inefficient for browsers but ShadyCSS
    // currently does this anyway. When it does not, this should be changed.
    for (let i = 0; i < length; i++) {
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    // Remove styles from nested templates in this scope.
    removeStylesFromLitTemplates(scopeName);
    // And then put the condensed style into the "root" template passed in as
    // `template`.
    const content = templateElement.content;
    if (!!template) {
        insertNodeIntoTemplate(template, condensedStyle, content.firstChild);
    }
    else {
        content.insertBefore(condensedStyle, content.firstChild);
    }
    // Note, it's important that ShadyCSS gets the template that `lit-html`
    // will actually render so that it can update the style inside when
    // needed (e.g. @apply native Shadow DOM case).
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    const style = content.querySelector('style');
    if (window.ShadyCSS.nativeShadow && style !== null) {
        // When in native Shadow DOM, ensure the style created by ShadyCSS is
        // included in initially rendered output (`renderedDOM`).
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    }
    else if (!!template) {
        // When no style is left in the template, parts will be broken as a
        // result. To fix this, we put back the style node ShadyCSS removed
        // and then tell lit to remove that node from the template.
        // There can be no style in the template in 2 cases (1) when Shady DOM
        // is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
        // is in use ShadyCSS removes the style if it contains no content.
        // NOTE, ShadyCSS creates its own style so we can safely add/remove
        // `condensedStyle` here.
        content.insertBefore(condensedStyle, content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template, removes);
    }
};
/**
 * Extension to the standard `render` method which supports rendering
 * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
 * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
 * or when the webcomponentsjs
 * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
 *
 * Adds a `scopeName` option which is used to scope element DOM and stylesheets
 * when native ShadowDOM is unavailable. The `scopeName` will be added to
 * the class attribute of all rendered DOM. In addition, any style elements will
 * be automatically re-written with this `scopeName` selector and moved out
 * of the rendered DOM and into the document `<head>`.
 *
 * It is common to use this render method in conjunction with a custom element
 * which renders a shadowRoot. When this is done, typically the element's
 * `localName` should be used as the `scopeName`.
 *
 * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
 * custom properties (needed only on older browsers like IE11) and a shim for
 * a deprecated feature called `@apply` that supports applying a set of css
 * custom properties to a given location.
 *
 * Usage considerations:
 *
 * * Part values in `<style>` elements are only applied the first time a given
 * `scopeName` renders. Subsequent changes to parts in style elements will have
 * no effect. Because of this, parts in style elements should only be used for
 * values that will never change, for example parts that set scope-wide theme
 * values or parts which render shared style elements.
 *
 * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
 * custom element's `constructor` is not supported. Instead rendering should
 * either done asynchronously, for example at microtask timing (for example
 * `Promise.resolve()`), or be deferred until the first time the element's
 * `connectedCallback` runs.
 *
 * Usage considerations when using shimmed custom properties or `@apply`:
 *
 * * Whenever any dynamic changes are made which affect
 * css custom properties, `ShadyCSS.styleElement(element)` must be called
 * to update the element. There are two cases when this is needed:
 * (1) the element is connected to a new parent, (2) a class is added to the
 * element that causes it to match different custom properties.
 * To address the first case when rendering a custom element, `styleElement`
 * should be called in the element's `connectedCallback`.
 *
 * * Shimmed custom properties may only be defined either for an entire
 * shadowRoot (for example, in a `:host` rule) or via a rule that directly
 * matches an element with a shadowRoot. In other words, instead of flowing from
 * parent to child as do native css custom properties, shimmed custom properties
 * flow only from shadowRoots to nested shadowRoots.
 *
 * * When using `@apply` mixing css shorthand property names with
 * non-shorthand names (for example `border` and `border-width`) is not
 * supported.
 */
const render = (result, container, options) => {
    if (!options || typeof options !== 'object' || !options.scopeName) {
        throw new Error('The `scopeName` option is required.');
    }
    const scopeName = options.scopeName;
    const hasRendered = parts.has(container);
    const needsScoping = compatibleShadyCSSVersion &&
        container.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ &&
        !!container.host;
    // Handle first render to a scope specially...
    const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
    // On first scope render, render into a fragment; this cannot be a single
    // fragment that is reused since nested renders can occur synchronously.
    const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
    render$1(result, renderContainer, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
    // When performing first scope render,
    // (1) We've rendered into a fragment so that there's a chance to
    // `prepareTemplateStyles` before sub-elements hit the DOM
    // (which might cause them to render based on a common pattern of
    // rendering in a custom element's `connectedCallback`);
    // (2) Scope the template with ShadyCSS one time only for this scope.
    // (3) Render the fragment into the container and make sure the
    // container knows its `part` is the one we just rendered. This ensures
    // DOM will be re-used on subsequent renders.
    if (firstScopeRender) {
        const part = parts.get(renderContainer);
        parts.delete(renderContainer);
        // ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
        // that should apply to `renderContainer` even if the rendered value is
        // not a TemplateInstance. However, it will only insert scoped styles
        // into the document if `prepareTemplateStyles` has already been called
        // for the given scope name.
        const template = part.value instanceof TemplateInstance ?
            part.value.template :
            undefined;
        prepareTemplateStyles(scopeName, renderContainer, template);
        removeNodes(container, container.firstChild);
        container.appendChild(renderContainer);
        parts.set(container, part);
    }
    // After elements have hit the DOM, update styling if this is the
    // initial render to this container.
    // This is needed whenever dynamic changes are made so it would be
    // safest to do every render; however, this would regress performance
    // so we leave it up to the user to call `ShadyCSS.styleElement`
    // for dynamic changes.
    if (!hasRendered && needsScoping) {
        window.ShadyCSS.styleElement(container.host);
    }
};

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
var _a;
/**
 * Use this module if you want to create your own base class extending
 * [[UpdatingElement]].
 * @packageDocumentation
 */
/*
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */
window.JSCompiler_renameProperty =
    (prop, _obj) => prop;
const defaultConverter = {
    toAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                // if the value is `null` or `undefined` pass this through
                // to allow removing/no change behavior.
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    fromAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                // Type assert to adhere to Bazel's "must type assert JSON parse" rule.
                return JSON.parse(value);
        }
        return value;
    }
};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = (value, old) => {
    // This ensures (old==NaN, value==NaN) always returns false
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    hasChanged: notEqual
};
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
/**
 * The Closure JS Compiler doesn't currently have good support for static
 * property semantics where "this" is dynamic (e.g.
 * https://github.com/google/closure-compiler/issues/3177 and others) so we use
 * this hack to bypass any rewriting by the compiler.
 */
const finalized = 'finalized';
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 * @noInheritDoc
 */
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this.initialize();
    }
    /**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     */
    static get observedAttributes() {
        // note: piggy backing on this to ensure we're finalized.
        this.finalize();
        const attributes = [];
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this._classProperties.forEach((v, p) => {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        });
        return attributes;
    }
    /**
     * Ensures the private `_classProperties` property metadata is created.
     * In addition to `finalize` this is also called in `createProperty` to
     * ensure the `@property` decorator can add property metadata.
     */
    /** @nocollapse */
    static _ensureClassProperties() {
        // ensure private storage for property declarations.
        if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
            this._classProperties = new Map();
            // NOTE: Workaround IE11 not supporting Map constructor argument.
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
    }
    /**
     * Creates a property accessor on the element prototype if one does not exist
     * and stores a PropertyDeclaration for the property with the given options.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     *
     * This method may be overridden to customize properties; however,
     * when doing so, it's important to call `super.createProperty` to ensure
     * the property is setup correctly. This method calls
     * `getPropertyDescriptor` internally to get a descriptor to install.
     * To customize what properties do when they are get or set, override
     * `getPropertyDescriptor`. To customize the options for a property,
     * implement `createProperty` like this:
     *
     * static createProperty(name, options) {
     *   options = Object.assign(options, {myOption: true});
     *   super.createProperty(name, options);
     * }
     *
     * @nocollapse
     */
    static createProperty(name, options = defaultPropertyDeclaration) {
        // Note, since this can be called by the `@property` decorator which
        // is called before `finalize`, we ensure storage exists for property
        // metadata.
        this._ensureClassProperties();
        this._classProperties.set(name, options);
        // Do not generate an accessor if the prototype already has one, since
        // it would be lost otherwise and that would never be the user's intention;
        // Instead, we expect users to call `requestUpdate` themselves from
        // user-defined accessors. Note that if the super has an accessor we will
        // still overwrite it
        if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        const descriptor = this.getPropertyDescriptor(name, key, options);
        if (descriptor !== undefined) {
            Object.defineProperty(this.prototype, name, descriptor);
        }
    }
    /**
     * Returns a property descriptor to be defined on the given named property.
     * If no descriptor is returned, the property will not become an accessor.
     * For example,
     *
     *   class MyElement extends LitElement {
     *     static getPropertyDescriptor(name, key, options) {
     *       const defaultDescriptor =
     *           super.getPropertyDescriptor(name, key, options);
     *       const setter = defaultDescriptor.set;
     *       return {
     *         get: defaultDescriptor.get,
     *         set(value) {
     *           setter.call(this, value);
     *           // custom action.
     *         },
     *         configurable: true,
     *         enumerable: true
     *       }
     *     }
     *   }
     *
     * @nocollapse
     */
    static getPropertyDescriptor(name, key, options) {
        return {
            // tslint:disable-next-line:no-any no symbol in index
            get() {
                return this[key];
            },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this
                    .requestUpdateInternal(name, oldValue, options);
            },
            configurable: true,
            enumerable: true
        };
    }
    /**
     * Returns the property options associated with the given property.
     * These options are defined with a PropertyDeclaration via the `properties`
     * object or the `@property` decorator and are registered in
     * `createProperty(...)`.
     *
     * Note, this method should be considered "final" and not overridden. To
     * customize the options for a given property, override `createProperty`.
     *
     * @nocollapse
     * @final
     */
    static getPropertyOptions(name) {
        return this._classProperties && this._classProperties.get(name) ||
            defaultPropertyDeclaration;
    }
    /**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     * @nocollapse
     */
    static finalize() {
        // finalize any superclasses
        const superCtor = Object.getPrototypeOf(this);
        if (!superCtor.hasOwnProperty(finalized)) {
            superCtor.finalize();
        }
        this[finalized] = true;
        this._ensureClassProperties();
        // initialize Map populated in observedAttributes
        this._attributeToPropertyMap = new Map();
        // make any properties
        // Note, only process "own" properties since this element will inherit
        // any properties defined on the superClass, and finalization ensures
        // the entire prototype chain is finalized.
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            // support symbols in properties (IE11 does not support this)
            const propKeys = [
                ...Object.getOwnPropertyNames(props),
                ...(typeof Object.getOwnPropertySymbols === 'function') ?
                    Object.getOwnPropertySymbols(props) :
                    []
            ];
            // This for/of is ok because propKeys is an array
            for (const p of propKeys) {
                // note, use of `any` is due to TypeSript lack of support for symbol in
                // index types
                // tslint:disable-next-line:no-any no symbol in index
                this.createProperty(p, props[p]);
            }
        }
    }
    /**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */
    static _attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false ?
            undefined :
            (typeof attribute === 'string' ?
                attribute :
                (typeof name === 'string' ? name.toLowerCase() : undefined));
    }
    /**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     * @nocollapse
     */
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    /**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's
     * `converter` or `converter.fromAttribute` property option.
     * @nocollapse
     */
    static _propertyValueFromAttribute(value, options) {
        const type = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = (typeof converter === 'function' ? converter : converter.fromAttribute);
        return fromAttribute ? fromAttribute(value, type) : value;
    }
    /**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     * @nocollapse
     */
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute ||
            defaultConverter.toAttribute;
        return toAttribute(value, type);
    }
    /**
     * Performs element initialization. By default captures any pre-set values for
     * registered properties.
     */
    initialize() {
        this._updateState = 0;
        this._updatePromise =
            new Promise((res) => this._enableUpdatingResolver = res);
        this._changedProperties = new Map();
        this._saveInstanceProperties();
        // ensures first update will be caught by an early access of
        // `updateComplete`
        this.requestUpdateInternal();
    }
    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */
    _saveInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this.constructor
            ._classProperties.forEach((_v, p) => {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        });
    }
    /**
     * Applies previously saved instance properties.
     */
    _applyInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        // tslint:disable-next-line:no-any
        this._instanceProperties.forEach((v, p) => this[p] = v);
        this._instanceProperties = undefined;
    }
    connectedCallback() {
        // Ensure first connection completes an update. Updates cannot complete
        // before connection.
        this.enableUpdating();
    }
    enableUpdating() {
        if (this._enableUpdatingResolver !== undefined) {
            this._enableUpdatingResolver();
            this._enableUpdatingResolver = undefined;
        }
    }
    /**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */
    disconnectedCallback() {
    }
    /**
     * Synchronizes property values when attributes change.
     */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
            const attrValue = ctor._propertyValueToAttribute(value, options);
            // an undefined value does not change the attribute.
            if (attrValue === undefined) {
                return;
            }
            // Track if the property is being reflected to avoid
            // setting the property again via `attributeChangedCallback`. Note:
            // 1. this takes advantage of the fact that the callback is synchronous.
            // 2. will behave incorrectly if multiple attributes are in the reaction
            // stack at time of calling. However, since we process attributes
            // in `update` this should not be possible (or an extreme corner case
            // that we'd like to discover).
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
            if (attrValue == null) {
                this.removeAttribute(attr);
            }
            else {
                this.setAttribute(attr, attrValue);
            }
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
        }
    }
    _attributeToProperty(name, value) {
        // Use tracking info to avoid deserializing attribute value if it was
        // just set from a property setter.
        if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
            return;
        }
        const ctor = this.constructor;
        // Note, hint this as an `AttributeMap` so closure clearly understands
        // the type; it has issues with tracking types through statics
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
            const options = ctor.getPropertyOptions(propName);
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] =
                // tslint:disable-next-line:no-any
                ctor._propertyValueFromAttribute(value, options);
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
        }
    }
    /**
     * This protected version of `requestUpdate` does not access or return the
     * `updateComplete` promise. This promise can be overridden and is therefore
     * not free to access.
     */
    requestUpdateInternal(name, oldValue, options) {
        let shouldRequestUpdate = true;
        // If we have a property key, perform property update steps.
        if (name !== undefined) {
            const ctor = this.constructor;
            options = options || ctor.getPropertyOptions(name);
            if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                if (!this._changedProperties.has(name)) {
                    this._changedProperties.set(name, oldValue);
                }
                // Add to reflecting properties set.
                // Note, it's important that every change has a chance to add the
                // property to `_reflectingProperties`. This ensures setting
                // attribute + property reflects correctly.
                if (options.reflect === true &&
                    !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                    if (this._reflectingProperties === undefined) {
                        this._reflectingProperties = new Map();
                    }
                    this._reflectingProperties.set(name, options);
                }
            }
            else {
                // Abort the request if the property should not be considered changed.
                shouldRequestUpdate = false;
            }
        }
        if (!this._hasRequestedUpdate && shouldRequestUpdate) {
            this._updatePromise = this._enqueueUpdate();
        }
    }
    /**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */
    requestUpdate(name, oldValue) {
        this.requestUpdateInternal(name, oldValue);
        return this.updateComplete;
    }
    /**
     * Sets up the element to asynchronously update.
     */
    async _enqueueUpdate() {
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        try {
            // Ensure any previous update has resolved before updating.
            // This `await` also ensures that property changes are batched.
            await this._updatePromise;
        }
        catch (e) {
            // Ignore any previous errors. We only care that the previous cycle is
            // done. Any error should have been handled in the previous update.
        }
        const result = this.performUpdate();
        // If `performUpdate` returns a Promise, we await it. This is done to
        // enable coordinating updates with a scheduler. Note, the result is
        // checked to avoid delaying an additional microtask unless we need to.
        if (result != null) {
            await result;
        }
        return !this._hasRequestedUpdate;
    }
    get _hasRequestedUpdate() {
        return (this._updateState & STATE_UPDATE_REQUESTED);
    }
    get hasUpdated() {
        return (this._updateState & STATE_HAS_UPDATED);
    }
    /**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * You can override this method to change the timing of updates. If this
     * method is overridden, `super.performUpdate()` must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```
     * protected async performUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.performUpdate();
     * }
     * ```
     */
    performUpdate() {
        // Abort any update if one is not pending when this is called.
        // This can happen if `performUpdate` is called early to "flush"
        // the update.
        if (!this._hasRequestedUpdate) {
            return;
        }
        // Mixin instance properties once, if they exist.
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        let shouldUpdate = false;
        const changedProperties = this._changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.update(changedProperties);
            }
            else {
                this._markUpdated();
            }
        }
        catch (e) {
            // Prevent `firstUpdated` and `updated` from running when there's an
            // update exception.
            shouldUpdate = false;
            // Ensure element can accept additional updates after an exception.
            this._markUpdated();
            throw e;
        }
        if (shouldUpdate) {
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update.
     *
     * To await additional asynchronous work, override the `_getUpdateComplete`
     * method. For example, it is sometimes useful to await a rendered element
     * before fulfilling this Promise. To do this, first await
     * `super._getUpdateComplete()`, then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */
    get updateComplete() {
        return this._getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     *   class MyElement extends LitElement {
     *     async _getUpdateComplete() {
     *       await super._getUpdateComplete();
     *       await this._myChild.updateComplete;
     *     }
     *   }
     * @deprecated Override `getUpdateComplete()` instead for forward
     *     compatibility with `lit-element` 3.0 / `@lit/reactive-element`.
     */
    _getUpdateComplete() {
        return this.getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     *   class MyElement extends LitElement {
     *     async getUpdateComplete() {
     *       await super.getUpdateComplete();
     *       await this._myChild.updateComplete;
     *     }
     *   }
     */
    getUpdateComplete() {
        return this._updatePromise;
    }
    /**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    shouldUpdate(_changedProperties) {
        return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined &&
            this._reflectingProperties.size > 0) {
            // Use forEach so this works even if for/of loops are compiled to for
            // loops expecting arrays
            this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
            this._reflectingProperties = undefined;
        }
        this._markUpdated();
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    updated(_changedProperties) {
    }
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    firstUpdated(_changedProperties) {
    }
}
_a = finalized;
/**
 * Marks class as having finished creating properties.
 */
UpdatingElement[_a] = true;

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
const legacyCustomElement = (tagName, clazz) => {
    window.customElements.define(tagName, clazz);
    // Cast as any because TS doesn't recognize the return type as being a
    // subtype of the decorated class when clazz is typed as
    // `Constructor<HTMLElement>` for some reason.
    // `Constructor<HTMLElement>` is helpful to make sure the decorator is
    // applied to elements however.
    // tslint:disable-next-line:no-any
    return clazz;
};
const standardCustomElement = (tagName, descriptor) => {
    const { kind, elements } = descriptor;
    return {
        kind,
        elements,
        // This callback is called once the class is otherwise fully defined
        finisher(clazz) {
            window.customElements.define(tagName, clazz);
        }
    };
};
/**
 * Class decorator factory that defines the decorated class as a custom element.
 *
 * ```
 * @customElement('my-element')
 * class MyElement {
 *   render() {
 *     return html``;
 *   }
 * }
 * ```
 * @category Decorator
 * @param tagName The name of the custom element to define.
 */
const customElement = (tagName) => (classOrDescriptor) => (typeof classOrDescriptor === 'function') ?
    legacyCustomElement(tagName, classOrDescriptor) :
    standardCustomElement(tagName, classOrDescriptor);
const standardProperty = (options, element) => {
    // When decorating an accessor, pass it through and add property metadata.
    // Note, the `hasOwnProperty` check in `createProperty` ensures we don't
    // stomp over the user's accessor.
    if (element.kind === 'method' && element.descriptor &&
        !('value' in element.descriptor)) {
        return Object.assign(Object.assign({}, element), { finisher(clazz) {
                clazz.createProperty(element.key, options);
            } });
    }
    else {
        // createProperty() takes care of defining the property, but we still
        // must return some kind of descriptor, so return a descriptor for an
        // unused prototype field. The finisher calls createProperty().
        return {
            kind: 'field',
            key: Symbol(),
            placement: 'own',
            descriptor: {},
            // When @babel/plugin-proposal-decorators implements initializers,
            // do this instead of the initializer below. See:
            // https://github.com/babel/babel/issues/9260 extras: [
            //   {
            //     kind: 'initializer',
            //     placement: 'own',
            //     initializer: descriptor.initializer,
            //   }
            // ],
            initializer() {
                if (typeof element.initializer === 'function') {
                    this[element.key] = element.initializer.call(this);
                }
            },
            finisher(clazz) {
                clazz.createProperty(element.key, options);
            }
        };
    }
};
const legacyProperty = (options, proto, name) => {
    proto.constructor
        .createProperty(name, options);
};
/**
 * A property decorator which creates a LitElement property which reflects a
 * corresponding attribute value. A [[`PropertyDeclaration`]] may optionally be
 * supplied to configure property features.
 *
 * This decorator should only be used for public fields. Private or protected
 * fields should use the [[`internalProperty`]] decorator.
 *
 * @example
 * ```ts
 * class MyElement {
 *   @property({ type: Boolean })
 *   clicked = false;
 * }
 * ```
 * @category Decorator
 * @ExportDecoratedItems
 */
function property(options) {
    // tslint:disable-next-line:no-any decorator
    return (protoOrDescriptor, name) => (name !== undefined) ?
        legacyProperty(options, protoOrDescriptor, name) :
        standardProperty(options, protoOrDescriptor);
}
/**
 * Declares a private or protected property that still triggers updates to the
 * element when it changes.
 *
 * Properties declared this way must not be used from HTML or HTML templating
 * systems, they're solely for properties internal to the element. These
 * properties may be renamed by optimization tools like the Closure Compiler.
 * @category Decorator
 * @deprecated `internalProperty` has been renamed to `state` in lit-element
 *     3.0. Please update to `state` now to be compatible with 3.0.
 */
function internalProperty(options) {
    return property({ attribute: false, hasChanged: options === null || options === void 0 ? void 0 : options.hasChanged });
}
/**
 * Declares a private or protected property that still triggers updates to the
 * element when it changes.
 *
 * Properties declared this way must not be used from HTML or HTML templating
 * systems, they're solely for properties internal to the element. These
 * properties may be renamed by optimization tools like the Closure Compiler.
 * @category Decorator
 */
const state = (options) => internalProperty(options);

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
/**
 * Whether the current browser supports `adoptedStyleSheets`.
 */
const supportsAdoptingStyleSheets = (window.ShadowRoot) &&
    (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow) &&
    ('adoptedStyleSheets' in Document.prototype) &&
    ('replace' in CSSStyleSheet.prototype);
const constructionToken = Symbol();
class CSSResult {
    constructor(cssText, safeToken) {
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
    }
    // Note, this is a getter so that it's lazy. In practice, this means
    // stylesheets are not created until the first element instance is made.
    get styleSheet() {
        if (this._styleSheet === undefined) {
            // Note, if `supportsAdoptingStyleSheets` is true then we assume
            // CSSStyleSheet is constructable.
            if (supportsAdoptingStyleSheets) {
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.cssText);
            }
            else {
                this._styleSheet = null;
            }
        }
        return this._styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
/**
 * Wrap a value for interpolation in a [[`css`]] tagged template literal.
 *
 * This is unsafe because untrusted CSS text can be used to phone home
 * or exfiltrate data to an attacker controlled site. Take care to only use
 * this with trusted input.
 */
const unsafeCSS = (value) => {
    return new CSSResult(String(value), constructionToken);
};

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
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window['litElementVersions'] || (window['litElementVersions'] = []))
    .push('2.5.1');
/**
 * Sentinal value used to avoid calling lit-html's render function when
 * subclasses do not implement `render`
 */
const renderNotImplemented = {};
/**
 * Base element class that manages element properties and attributes, and
 * renders a lit-html template.
 *
 * To define a component, subclass `LitElement` and implement a
 * `render` method to provide the component's template. Define properties
 * using the [[`properties`]] property or the [[`property`]] decorator.
 */
class LitElement extends UpdatingElement {
    /**
     * Return the array of styles to apply to the element.
     * Override this method to integrate into a style management system.
     *
     * @nocollapse
     */
    static getStyles() {
        return this.styles;
    }
    /** @nocollapse */
    static _getUniqueStyles() {
        // Only gather styles once per class
        if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
            return;
        }
        // Take care not to call `this.getStyles()` multiple times since this
        // generates new CSSResults each time.
        // TODO(sorvell): Since we do not cache CSSResults by input, any
        // shared styles will generate new stylesheet objects, which is wasteful.
        // This should be addressed when a browser ships constructable
        // stylesheets.
        const userStyles = this.getStyles();
        if (Array.isArray(userStyles)) {
            // De-duplicate styles preserving the _last_ instance in the set.
            // This is a performance optimization to avoid duplicated styles that can
            // occur especially when composing via subclassing.
            // The last item is kept to try to preserve the cascade order with the
            // assumption that it's most important that last added styles override
            // previous styles.
            const addStyles = (styles, set) => styles.reduceRight((set, s) => 
            // Note: On IE set.add() does not return the set
            Array.isArray(s) ? addStyles(s, set) : (set.add(s), set), set);
            // Array.from does not work on Set in IE, otherwise return
            // Array.from(addStyles(userStyles, new Set<CSSResult>())).reverse()
            const set = addStyles(userStyles, new Set());
            const styles = [];
            set.forEach((v) => styles.unshift(v));
            this._styles = styles;
        }
        else {
            this._styles = userStyles === undefined ? [] : [userStyles];
        }
        // Ensure that there are no invalid CSSStyleSheet instances here. They are
        // invalid in two conditions.
        // (1) the sheet is non-constructible (`sheet` of a HTMLStyleElement), but
        //     this is impossible to check except via .replaceSync or use
        // (2) the ShadyCSS polyfill is enabled (:. supportsAdoptingStyleSheets is
        //     false)
        this._styles = this._styles.map((s) => {
            if (s instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
                // Flatten the cssText from the passed constructible stylesheet (or
                // undetectable non-constructible stylesheet). The user might have
                // expected to update their stylesheets over time, but the alternative
                // is a crash.
                const cssText = Array.prototype.slice.call(s.cssRules)
                    .reduce((css, rule) => css + rule.cssText, '');
                return unsafeCSS(cssText);
            }
            return s;
        });
    }
    /**
     * Performs element initialization. By default this calls
     * [[`createRenderRoot`]] to create the element [[`renderRoot`]] node and
     * captures any pre-set values for registered properties.
     */
    initialize() {
        super.initialize();
        this.constructor._getUniqueStyles();
        this.renderRoot = this.createRenderRoot();
        // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
        // element's getRootNode(). While this could be done, we're choosing not to
        // support this now since it would require different logic around de-duping.
        if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
            this.adoptStyles();
        }
    }
    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */
    createRenderRoot() {
        return this.attachShadow(this.constructor.shadowRootOptions);
    }
    /**
     * Applies styling to the element shadowRoot using the [[`styles`]]
     * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
     * available and will fallback otherwise. When Shadow DOM is polyfilled,
     * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
     * is available but `adoptedStyleSheets` is not, styles are appended to the
     * end of the `shadowRoot` to [mimic spec
     * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
     */
    adoptStyles() {
        const styles = this.constructor._styles;
        if (styles.length === 0) {
            return;
        }
        // There are three separate cases here based on Shadow DOM support.
        // (1) shadowRoot polyfilled: use ShadyCSS
        // (2) shadowRoot.adoptedStyleSheets available: use it
        // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
        // rendering
        if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s) => s.cssText), this.localName);
        }
        else if (supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets =
                styles.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
        }
        else {
            // This must be done after rendering so the actual style insertion is done
            // in `update`.
            this._needsShimAdoptedStyleSheets = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // Note, first update/render handles styleElement so we only call this if
        // connected after first update.
        if (this.hasUpdated && window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }
    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * @param _changedProperties Map of changed properties with old values
     */
    update(changedProperties) {
        // Setting properties in `render` should not trigger an update. Since
        // updates are allowed after super.update, it's important to call `render`
        // before that.
        const templateResult = this.render();
        super.update(changedProperties);
        // If render is not implemented by the component, don't call lit-html render
        if (templateResult !== renderNotImplemented) {
            this.constructor
                .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
        }
        // When native Shadow DOM is used but adoptedStyles are not supported,
        // insert styling after rendering to ensure adoptedStyles have highest
        // priority.
        if (this._needsShimAdoptedStyleSheets) {
            this._needsShimAdoptedStyleSheets = false;
            this.constructor._styles.forEach((s) => {
                const style = document.createElement('style');
                style.textContent = s.cssText;
                this.renderRoot.appendChild(style);
            });
        }
    }
    /**
     * Invoked on each update to perform rendering tasks. This method may return
     * any value renderable by lit-html's `NodePart` - typically a
     * `TemplateResult`. Setting properties inside this method will *not* trigger
     * the element to update.
     */
    render() {
        return renderNotImplemented;
    }
}
/**
 * Ensure this class is marked as `finalized` as an optimization ensuring
 * it will not needlessly try to `finalize`.
 *
 * Note this property name is a string to prevent breaking Closure JS Compiler
 * optimizations. See updating-element.ts for more information.
 */
LitElement['finalized'] = true;
/**
 * Reference to the underlying library method used to render the element's
 * DOM. By default, points to the `render` method from lit-html's shady-render
 * module.
 *
 * **Most users will never need to touch this property.**
 *
 * This  property should not be confused with the `render` instance method,
 * which should be overridden to define a template for the element.
 *
 * Advanced users creating a new base class based on LitElement can override
 * this property to point to a custom render method with a signature that
 * matches [shady-render's `render`
 * method](https://lit-html.polymer-project.org/api/modules/shady_render.html#render).
 *
 * @nocollapse
 */
LitElement.render = render;
/** @nocollapse */
LitElement.shadowRootOptions = { mode: 'open' };

var _templateObject$7;
var cardStyles = i$1(_templateObject$7 || (_templateObject$7 = _taggedTemplateLiteral(["\n  .horizon-card {\n    --horizon-card-primary: var(--primary-text-color, #000000);\n    --horizon-card-secondary: var(--secondary-text-color, #828282);\n    --horizon-card-accent: #d7d7d7;\n\n    --horizon-card-lines: var(--horizon-card-accent);\n    --horizon-card-field-name-color: var(--horizon-card-secondary);\n    --horizon-card-field-value-color: var(--horizon-card-primary);\n\n    --horizon-card-stop-invisible: rgb(0,0,0,0);\n    --horizon-card-stop-sun-color: #f9d05e;\n    --horizon-card-stop-dawn-color: #393b78;\n    --horizon-card-stop-day-color: #8ebeeb;\n    --horizon-card-stop-dusk-color: #393b78;\n\n    padding: 0.5rem;\n    font-family: var(--primary-font-family);\n  }\n\n  .horizon-card.horizon-card-dark {\n    --horizon-card-primary: #ffffff;\n    --horizon-card-secondary: #828282;\n    --horizon-card-accent: #464646;\n  }\n\n  .horizon-card-field-row {\n    display: flex;\n    justify-content: space-around;\n    margin-top: 1rem;\n  }\n\n  .horizon-card-text-container {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n  }\n\n  .horizon-card-field-name {\n    color: var(--horizon-card-field-name-color);\n  }\n\n  .horizon-card-field-value {\n    color: var(--horizon-card-field-value-color);\n    font-size: 1.3em;\n    line-height: 1.1em;\n  }\n\n  .horizon-card-header {\n    display: flex;\n    justify-content: space-around;\n    margin-top: 1rem;\n    margin-bottom: -1rem;\n  }\n\n  .horizon-card-header .horizon-card-text-container {\n    font-size: 1.3rem;\n  }\n\n  .horizon-card-footer {\n    margin-bottom: 1rem;\n  }\n\n  .horizon-card-title {\n    margin: 1rem 1rem 2rem 1rem;\n    font-size: 1.5rem;\n    color: var(--horizon-card-primary);\n  }\n\n  .horizon-card-graph {\n    shape-rendering=\"geometricPrecision\";\n    margin: 1rem 0 1rem 0;\n  }\n\n  .horizon-card-graph .sunInitialStop {\n    stop-color: var(--horizon-card-stop-sun-color);\n  }\n\n  .horizon-card-graph .sunMiddleStop {\n    stop-color: var(--horizon-card-stop-sun-color);\n  }\n\n  .horizon-card-graph .sunEndStop {\n    stop-color: var(--horizon-card-stop-invisible);\n  }\n\n  .horizon-card-graph .dawnInitialStop {\n    stop-color: var(--horizon-card-stop-dawn-color);\n  }\n\n  .horizon-card-graph .dawnMiddleStop {\n    stop-color: var(--horizon-card-stop-dawn-color);\n  }\n\n  .horizon-card-graph .dawnEndStop {\n    stop-color: var(--horizon-card-stop-invisible);\n  }\n\n  .horizon-card-graph .dayInitialStop {\n    stop-color: var(--horizon-card-stop-day-color);\n  }\n\n  .horizon-card-graph .dayMiddleStop {\n    stop-color: var(--horizon-card-stop-day-color);\n  }\n\n  .horizon-card-graph .dayEndStop {\n    stop-color: var(--horizon-card-stop-invisible);\n  }\n\n  .horizon-card-graph .duskInitialStop {\n    stop-color: var(--horizon-card-stop-dusk-color);\n  }\n\n  .horizon-card-graph .duskMiddleStop {\n    stop-color: var(--horizon-card-stop-dusk-color);\n  }\n\n  .horizon-card-graph .duskEndStop {\n    stop-color: var(--horizon-card-stop-invisible);\n  }\n\n  .card-config ul {\n    list-style: none;\n    padding: 0 0 0 1.5rem;\n  }\n\n  .card-config li {\n    padding: 0.5rem 0;\n  }\n"])));

var azimuth$t = "Азимут";
var dawn$t = "Зора";
var dusk$t = "Здрач";
var elevation$t = "Височина";
var noon$t = "Пладне";
var sunrise$t = "Изгрев";
var sunset$t = "Залез";
var errors$t = {
	SunIntegrationNotFound: "Интеграцията Sun не е намерена"
};
var bg = {
	azimuth: azimuth$t,
	dawn: dawn$t,
	dusk: dusk$t,
	elevation: elevation$t,
	noon: noon$t,
	sunrise: sunrise$t,
	sunset: sunset$t,
	errors: errors$t
};

var azimuth$s = "Azimut";
var dawn$s = "Alba";
var dusk$s = "Capvespre";
var elevation$s = "Elevació";
var noon$s = "Migdia solar";
var sunrise$s = "Sortida del sol";
var sunset$s = "Posta del sol";
var errors$s = {
	SunIntegrationNotFound: "No s'ha trobat la integració Sun"
};
var ca = {
	azimuth: azimuth$s,
	dawn: dawn$s,
	dusk: dusk$s,
	elevation: elevation$s,
	noon: noon$s,
	sunrise: sunrise$s,
	sunset: sunset$s,
	errors: errors$s
};

var azimuth$r = "Azimut";
var dawn$r = "Svítání";
var dusk$r = "Soumrak";
var elevation$r = "Výška";
var noon$r = "Sluneční poledne";
var sunrise$r = "Východ slunce";
var sunset$r = "Západ slunce";
var errors$r = {
	SunIntegrationNotFound: "Integrace Sun nenalezena"
};
var cs = {
	azimuth: azimuth$r,
	dawn: dawn$r,
	dusk: dusk$r,
	elevation: elevation$r,
	noon: noon$r,
	sunrise: sunrise$r,
	sunset: sunset$r,
	errors: errors$r
};

var azimuth$q = "Azimut";
var dawn$q = "Daggry";
var dusk$q = "Skumring";
var elevation$q = "Højde";
var noon$q = "Middag";
var sunrise$q = "Solopgang";
var sunset$q = "Solnedgang";
var errors$q = {
	SunIntegrationNotFound: "kunne ikke finde integrationen for Sol"
};
var da = {
	azimuth: azimuth$q,
	dawn: dawn$q,
	dusk: dusk$q,
	elevation: elevation$q,
	noon: noon$q,
	sunrise: sunrise$q,
	sunset: sunset$q,
	errors: errors$q
};

var azimuth$p = "Azimut";
var dawn$p = "Morgendämmerung";
var dusk$p = "Abenddämmerung";
var elevation$p = "Zenitwinkel";
var noon$p = "Zenit";
var sunrise$p = "Sonnenaufgang";
var sunset$p = "Sonnenuntergang";
var errors$p = {
	SunIntegrationNotFound: "Sun integration not found"
};
var de = {
	azimuth: azimuth$p,
	dawn: dawn$p,
	dusk: dusk$p,
	elevation: elevation$p,
	noon: noon$p,
	sunrise: sunrise$p,
	sunset: sunset$p,
	errors: errors$p
};

var azimuth$o = "Azimuth";
var dawn$o = "Dawn";
var dusk$o = "Dusk";
var elevation$o = "Elevation";
var noon$o = "Solar noon";
var sunrise$o = "Sunrise";
var sunset$o = "Sunset";
var errors$o = {
	SunIntegrationNotFound: "Sun integration not found"
};
var en = {
	azimuth: azimuth$o,
	dawn: dawn$o,
	dusk: dusk$o,
	elevation: elevation$o,
	noon: noon$o,
	sunrise: sunrise$o,
	sunset: sunset$o,
	errors: errors$o
};

var azimuth$n = "Azimut";
var dawn$n = "Amanecer";
var dusk$n = "Anochecer";
var elevation$n = "Elevación";
var noon$n = "Mediodía solar";
var sunrise$n = "Salida del sol";
var sunset$n = "Atardecer";
var errors$n = {
	SunIntegrationNotFound: "No se encontró la integración de Sun"
};
var es = {
	azimuth: azimuth$n,
	dawn: dawn$n,
	dusk: dusk$n,
	elevation: elevation$n,
	noon: noon$n,
	sunrise: sunrise$n,
	sunset: sunset$n,
	errors: errors$n
};

var azimuth$m = "Asimuut";
var dawn$m = "Koidik";
var dusk$m = "Hämarik";
var elevation$m = "Kõrgus";
var noon$m = "Keskpäev";
var sunrise$m = "Päikesetõus";
var sunset$m = "Päikeseloojang";
var errors$m = {
	SunIntegrationNotFound: "Sun integration not found"
};
var et = {
	azimuth: azimuth$m,
	dawn: dawn$m,
	dusk: dusk$m,
	elevation: elevation$m,
	noon: noon$m,
	sunrise: sunrise$m,
	sunset: sunset$m,
	errors: errors$m
};

var azimuth$l = "Atsimuutti";
var dawn$l = "Sarastus";
var dusk$l = "Hämärä";
var elevation$l = "Korkeus";
var noon$l = "Keskipäivä";
var sunrise$l = "Auringonnousu";
var sunset$l = "Auringonlasku";
var errors$l = {
	SunIntegrationNotFound: "Sun integration not found"
};
var fi = {
	azimuth: azimuth$l,
	dawn: dawn$l,
	dusk: dusk$l,
	elevation: elevation$l,
	noon: noon$l,
	sunrise: sunrise$l,
	sunset: sunset$l,
	errors: errors$l
};

var azimuth$k = "Azimut";
var dawn$k = "Aube";
var dusk$k = "Crépuscule";
var elevation$k = "Élévation";
var noon$k = "Midi solaire";
var sunrise$k = "Lever du soleil";
var sunset$k = "Coucher du soleil";
var errors$k = {
	SunIntegrationNotFound: "Sun integration not found"
};
var fr = {
	azimuth: azimuth$k,
	dawn: dawn$k,
	dusk: dusk$k,
	elevation: elevation$k,
	noon: noon$k,
	sunrise: sunrise$k,
	sunset: sunset$k,
	errors: errors$k
};

var azimuth$j = "אזימוט";
var dawn$j = "עלות השחר";
var dusk$j = "בין הערבים";
var elevation$j = "גובה";
var noon$j = "אמצע היום";
var sunrise$j = "זריחה";
var sunset$j = "שקיעה";
var errors$j = {
	SunIntegrationNotFound: "אינטגרצית שמש לא נמצאה"
};
var he = {
	azimuth: azimuth$j,
	dawn: dawn$j,
	dusk: dusk$j,
	elevation: elevation$j,
	noon: noon$j,
	sunrise: sunrise$j,
	sunset: sunset$j,
	errors: errors$j
};

var azimuth$i = "Azimut";
var dawn$i = "Hajnal";
var dusk$i = "Szürkület";
var elevation$i = "Magasság";
var noon$i = "Dél";
var sunrise$i = "Napkelte";
var sunset$i = "Napnyugta";
var errors$i = {
	SunIntegrationNotFound: "Sun integration not found"
};
var hu = {
	azimuth: azimuth$i,
	dawn: dawn$i,
	dusk: dusk$i,
	elevation: elevation$i,
	noon: noon$i,
	sunrise: sunrise$i,
	sunset: sunset$i,
	errors: errors$i
};

var azimuth$h = "Áttarhorn";
var dawn$h = "Dögun";
var dusk$h = "Rökkur";
var elevation$h = "Hækkun";
var noon$h = "Sólarhádegi";
var sunrise$h = "Sólarupprás";
var sunset$h = "Sólsetur";
var errors$h = {
	SunIntegrationNotFound: "Sólar eining fannst ekki"
};
var is = {
	azimuth: azimuth$h,
	dawn: dawn$h,
	dusk: dusk$h,
	elevation: elevation$h,
	noon: noon$h,
	sunrise: sunrise$h,
	sunset: sunset$h,
	errors: errors$h
};

var azimuth$g = "Azimuth";
var dawn$g = "Aurora";
var dusk$g = "Crepuscolo";
var elevation$g = "Elevazione";
var noon$g = "Mezzogiorno solare";
var sunrise$g = "Alba";
var sunset$g = "Tramonto";
var errors$g = {
	SunIntegrationNotFound: "Sun integration not found"
};
var it = {
	azimuth: azimuth$g,
	dawn: dawn$g,
	dusk: dusk$g,
	elevation: elevation$g,
	noon: noon$g,
	sunrise: sunrise$g,
	sunset: sunset$g,
	errors: errors$g
};

var azimuth$f = "方位角";
var dawn$f = "明け方";
var dusk$f = "夕";
var elevation$f = "仰俯角";
var noon$f = "太陽の正午";
var sunrise$f = "日出";
var sunset$f = "日沒";
var errors$f = {
	SunIntegrationNotFound: "インテグレーション Sun は検索できません"
};
var ja = {
	azimuth: azimuth$f,
	dawn: dawn$f,
	dusk: dusk$f,
	elevation: elevation$f,
	noon: noon$f,
	sunrise: sunrise$f,
	sunset: sunset$f,
	errors: errors$f
};

var azimuth$e = "Azimutas";
var dawn$e = "Aušra";
var dusk$e = "Prieblanda";
var elevation$e = "Pakilimas";
var noon$e = "Vidurdienis";
var sunrise$e = "Saulėtekis";
var sunset$e = "Saulėlydis";
var errors$e = {
	SunIntegrationNotFound: "Sun integration not found"
};
var lt = {
	azimuth: azimuth$e,
	dawn: dawn$e,
	dusk: dusk$e,
	elevation: elevation$e,
	noon: noon$e,
	sunrise: sunrise$e,
	sunset: sunset$e,
	errors: errors$e
};

var azimuth$d = "Azimut";
var dawn$d = "Daggry";
var dusk$d = "Skumring";
var elevation$d = "Elevasjon";
var noon$d = "Middag";
var sunrise$d = "Soloppgang";
var sunset$d = "Solnedgang";
var errors$d = {
	SunIntegrationNotFound: "Fant ikke Sol-integrasjonen"
};
var nb = {
	azimuth: azimuth$d,
	dawn: dawn$d,
	dusk: dusk$d,
	elevation: elevation$d,
	noon: noon$d,
	sunrise: sunrise$d,
	sunset: sunset$d,
	errors: errors$d
};

var azimuth$c = "Azimut";
var dawn$c = "Dageraad";
var dusk$c = "Schemer";
var elevation$c = "Hoogte";
var noon$c = "Middaguur";
var sunrise$c = "Zonsopkomst";
var sunset$c = "Zonsondergang";
var errors$c = {
	SunIntegrationNotFound: "Sun integration not found"
};
var nl = {
	azimuth: azimuth$c,
	dawn: dawn$c,
	dusk: dusk$c,
	elevation: elevation$c,
	noon: noon$c,
	sunrise: sunrise$c,
	sunset: sunset$c,
	errors: errors$c
};

var azimuth$b = "Asimut";
var dawn$b = "Daggry";
var dusk$b = "Skumring";
var elevation$b = "Høgde";
var noon$b = "Middag";
var sunrise$b = "Soloppgang";
var sunset$b = "Solnedgang";
var errors$b = {
	SunIntegrationNotFound: "Kunne ikkje finne sol-integrasjonen"
};
var nn = {
	azimuth: azimuth$b,
	dawn: dawn$b,
	dusk: dusk$b,
	elevation: elevation$b,
	noon: noon$b,
	sunrise: sunrise$b,
	sunset: sunset$b,
	errors: errors$b
};

var azimuth$a = "Azymut";
var dawn$a = "Świt";
var dusk$a = "Zmierzch";
var elevation$a = "Wysokość";
var noon$a = "Górowanie";
var sunrise$a = "Wschód";
var sunset$a = "Zachód";
var errors$a = {
	SunIntegrationNotFound: "Nie odnaleziono integracji sun"
};
var pl = {
	azimuth: azimuth$a,
	dawn: dawn$a,
	dusk: dusk$a,
	elevation: elevation$a,
	noon: noon$a,
	sunrise: sunrise$a,
	sunset: sunset$a,
	errors: errors$a
};

var azimuth$9 = "Azimute";
var dawn$9 = "Amanhecer";
var dusk$9 = "Anoitecer";
var elevation$9 = "Elevação";
var noon$9 = "Meio dia solar";
var sunrise$9 = "Nascer do sol";
var sunset$9 = "Pôr do sol";
var errors$9 = {
	SunIntegrationNotFound: "Integração Sun não encontrada"
};
var ptBR = {
	azimuth: azimuth$9,
	dawn: dawn$9,
	dusk: dusk$9,
	elevation: elevation$9,
	noon: noon$9,
	sunrise: sunrise$9,
	sunset: sunset$9,
	errors: errors$9
};

var azimuth$8 = "Azimut";
var dawn$8 = "Zori";
var dusk$8 = "Amurg";
var elevation$8 = "Elevație";
var noon$8 = "Zenit";
var sunrise$8 = "Răsărit";
var sunset$8 = "Apus";
var errors$8 = {
	SunIntegrationNotFound: "Integrare solară indisponibilă"
};
var ro = {
	azimuth: azimuth$8,
	dawn: dawn$8,
	dusk: dusk$8,
	elevation: elevation$8,
	noon: noon$8,
	sunrise: sunrise$8,
	sunset: sunset$8,
	errors: errors$8
};

var azimuth$7 = "Азимут";
var dawn$7 = "Рассвет";
var dusk$7 = "Сумерки";
var elevation$7 = "Высота";
var noon$7 = "Зенит";
var sunrise$7 = "Восход";
var sunset$7 = "Закат";
var errors$7 = {
	SunIntegrationNotFound: "Sun integration not found"
};
var ru = {
	azimuth: azimuth$7,
	dawn: dawn$7,
	dusk: dusk$7,
	elevation: elevation$7,
	noon: noon$7,
	sunrise: sunrise$7,
	sunset: sunset$7,
	errors: errors$7
};

var azimuth$6 = "Azimut";
var dawn$6 = "Úsvit";
var dusk$6 = "Súmrak";
var elevation$6 = "Výška";
var noon$6 = "Slnečné poludnie";
var sunrise$6 = "Východ slnka";
var sunset$6 = "Západ slnka";
var errors$6 = {
	SunIntegrationNotFound: "Integrácia slnka sa nenašla"
};
var sk = {
	azimuth: azimuth$6,
	dawn: dawn$6,
	dusk: dusk$6,
	elevation: elevation$6,
	noon: noon$6,
	sunrise: sunrise$6,
	sunset: sunset$6,
	errors: errors$6
};

var azimuth$5 = "Azimut";
var dawn$5 = "Zora";
var dusk$5 = "Mrak";
var elevation$5 = "Višina";
var noon$5 = "Sončno poldne";
var sunrise$5 = "Sončni vzhod";
var sunset$5 = "Sončni zahod";
var errors$5 = {
	SunIntegrationNotFound: "Sun integration not found"
};
var sl = {
	azimuth: azimuth$5,
	dawn: dawn$5,
	dusk: dusk$5,
	elevation: elevation$5,
	noon: noon$5,
	sunrise: sunrise$5,
	sunset: sunset$5,
	errors: errors$5
};

var azimuth$4 = "Azimut";
var dawn$4 = "Gryning";
var dusk$4 = "Skymning";
var elevation$4 = "Elevation";
var noon$4 = "Middag";
var sunrise$4 = "Soluppgång";
var sunset$4 = "Solnedgång";
var errors$4 = {
	SunIntegrationNotFound: "Sun integration not found"
};
var sv = {
	azimuth: azimuth$4,
	dawn: dawn$4,
	dusk: dusk$4,
	elevation: elevation$4,
	noon: noon$4,
	sunrise: sunrise$4,
	sunset: sunset$4,
	errors: errors$4
};

var azimuth$3 = "Güney Açısı";
var dawn$3 = "Şafak";
var dusk$3 = "Alacakaranlık";
var elevation$3 = "Yükseklik";
var noon$3 = "Öğle";
var sunrise$3 = "Gündoğumu";
var sunset$3 = "Günbatımı";
var errors$3 = {
	SunIntegrationNotFound: "Güneş entegrasyonu bulunamadı"
};
var tr = {
	azimuth: azimuth$3,
	dawn: dawn$3,
	dusk: dusk$3,
	elevation: elevation$3,
	noon: noon$3,
	sunrise: sunrise$3,
	sunset: sunset$3,
	errors: errors$3
};

var azimuth$2 = "Азимут";
var dawn$2 = "Світанок";
var dusk$2 = "Сутінки";
var elevation$2 = "Висота";
var noon$2 = "Заніт";
var sunrise$2 = "Схід";
var sunset$2 = "Захід";
var errors$2 = {
	SunIntegrationNotFound: "Інтеграцію Sun не знайдено"
};
var uk = {
	azimuth: azimuth$2,
	dawn: dawn$2,
	dusk: dusk$2,
	elevation: elevation$2,
	noon: noon$2,
	sunrise: sunrise$2,
	sunset: sunset$2,
	errors: errors$2
};

var azimuth$1 = "方位角";
var dawn$1 = "拂晓";
var dusk$1 = "傍晚";
var elevation$1 = "仰角";
var noon$1 = "日中";
var sunrise$1 = "日出";
var sunset$1 = "日落";
var errors$1 = {
	SunIntegrationNotFound: "未搜索到集成 Sun"
};
var zh_Hans = {
	azimuth: azimuth$1,
	dawn: dawn$1,
	dusk: dusk$1,
	elevation: elevation$1,
	noon: noon$1,
	sunrise: sunrise$1,
	sunset: sunset$1,
	errors: errors$1
};

var azimuth = "方位";
var dawn = "黎明";
var dusk = "黃昏";
var elevation = "仰角";
var noon = "日正當中";
var sunrise = "日昇";
var sunset = "日落";
var errors = {
	SunIntegrationNotFound: "沒有找到整合 Sun"
};
var zh_Hant = {
	azimuth: azimuth,
	dawn: dawn,
	dusk: dusk,
	elevation: elevation,
	noon: noon,
	sunrise: sunrise,
	sunset: sunset,
	errors: errors
};

var Constants = /*#__PURE__*/_createClass(function Constants() {
  _classCallCheck(this, Constants);
});
_defineProperty(Constants, "DEFAULT_CONFIG", {
  type: 'horizon-card',
  darkMode: true,
  language: 'en',
  use12hourClock: false,
  component: 'sun.sun',
  fields: {
    sunrise: true,
    sunset: true,
    dawn: true,
    noon: true,
    dusk: true,
    azimuth: false,
    elevation: false
  }
});
_defineProperty(Constants, "EVENT_X_POSITIONS", {
  dayStart: 5,
  sunrise: 101,
  sunset: 449,
  dayEnd: 545
});
_defineProperty(Constants, "HORIZON_Y", 108);
_defineProperty(Constants, "SUN_RADIUS", 17);
_defineProperty(Constants, "SUN_SECTIONS", {
  dawn: 105,
  day: 499 - 106,
  dusk: 605 - 500
});
_defineProperty(Constants, "DEFAULT_SUN_INFO", {
  dawnProgressPercent: 0,
  dayProgressPercent: 0,
  duskProgressPercent: 0,
  sunAboveHorizon: false,
  sunPercentOverHorizon: 0,
  sunPosition: {
    x: 0,
    y: 0
  },
  sunrise: 0,
  sunset: 0
});
_defineProperty(Constants, "DEFAULT_TIMES", {
  dawn: new Date(),
  dusk: new Date(),
  noon: new Date(),
  sunrise: new Date(),
  sunset: new Date()
});
_defineProperty(Constants, "LOCALIZATION_LANGUAGES", {
  bg: bg,
  ca: ca,
  cs: cs,
  da: da,
  de: de,
  en: en,
  es: es,
  et: et,
  fi: fi,
  fr: fr,
  he: he,
  hu: hu,
  is: is,
  it: it,
  ja: ja,
  lt: lt,
  nb: nb,
  nl: nl,
  nn: nn,
  pl: pl,
  'pt-BR': ptBR,
  ro: ro,
  ru: ru,
  sk: sk,
  sl: sl,
  sv: sv,
  tr: tr,
  uk: uk,
  'zh-Hans': zh_Hans,
  'zh-Hant': zh_Hant
});
_defineProperty(Constants, "FALLBACK_LOCALIZATION", en);
// Magic number - used by Home Assistant and the library (astral) it uses to calculate the sun events
_defineProperty(Constants, "BELOW_HORIZON_ELEVATION", 0.83);

var EHorizonCardErrors;
(function (EHorizonCardErrors) {
  EHorizonCardErrors["SunIntegrationNotFound"] = "SunIntegrationNotFound";
})(EHorizonCardErrors || (EHorizonCardErrors = {}));
var EHorizonCardI18NKeys;
(function (EHorizonCardI18NKeys) {
  EHorizonCardI18NKeys["Azimuth"] = "azimuth";
  EHorizonCardI18NKeys["Dawn"] = "dawn";
  EHorizonCardI18NKeys["Dusk"] = "dusk";
  EHorizonCardI18NKeys["Elevation"] = "elevation";
  EHorizonCardI18NKeys["Noon"] = "noon";
  EHorizonCardI18NKeys["Sunrise"] = "sunrise";
  EHorizonCardI18NKeys["Sunset"] = "sunset";
})(EHorizonCardI18NKeys || (EHorizonCardI18NKeys = {}));

var _templateObject$6, _templateObject2$2;
var HelperFunctions = /*#__PURE__*/function () {
  function HelperFunctions() {
    _classCallCheck(this, HelperFunctions);
  }
  _createClass(HelperFunctions, null, [{
    key: "nothing",
    value: function nothing() {
      return y(_templateObject$6 || (_templateObject$6 = _taggedTemplateLiteral([""])));
    }
  }, {
    key: "renderFieldElement",
    value: function renderFieldElement(i18n, translationKey, value) {
      var display;
      if (value === undefined) {
        display = '-';
      } else if (value instanceof Date) {
        display = i18n.formatDateAsTime(value);
      } else {
        display = value.toString();
        if (translationKey === 'azimuth' || translationKey === 'elevation') {
          display += '°';
        }
      }
      return y(_templateObject2$2 || (_templateObject2$2 = _taggedTemplateLiteral(["\n      <div class=\"horizon-card-text-container\">\n        <span class=\"horizon-card-field-name\">", "</span>\n        <span class=\"horizon-card-field-value\">", "</span>\n      </div>\n    "])), i18n.tr(translationKey), display);
    }
  }, {
    key: "isValidLanguage",
    value: function isValidLanguage(language) {
      return Object.keys(Constants.LOCALIZATION_LANGUAGES).includes(language);
    }
  }, {
    key: "startOfDay",
    value: function startOfDay(now) {
      var today = new Date(now);
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);
      return today;
    }
  }, {
    key: "endOfDay",
    value: function endOfDay(now) {
      var today = new Date(now);
      today.setHours(23);
      today.setMinutes(59);
      today.setSeconds(59);
      today.setMilliseconds(999);
      return today;
    }
  }, {
    key: "findSectionPosition",
    value: function findSectionPosition(msSinceSectionStart, msSectionEnd, section) {
      return Math.min(msSinceSectionStart, msSectionEnd) * section / msSectionEnd;
    }
  }, {
    key: "findSunProgress",
    value: function findSunProgress(sunPosition, startPosition, endPosition) {
      return HelperFunctions.clamp(0, 100, 100 * (sunPosition - startPosition) / (endPosition - startPosition));
    }
  }, {
    key: "clamp",
    value: function clamp(min, max, value) {
      if (min === max) {
        return min;
      }
      if (min > max) {
        throw new RangeError('Min value can not be bigger than the max value');
      }
      return Math.min(Math.max(value, min), max);
    }
  }]);
  return HelperFunctions;
}();

var I18N = /*#__PURE__*/function () {
  function I18N(language, use12HourClock) {
    _classCallCheck(this, I18N);
    _defineProperty(this, "localization", void 0);
    _defineProperty(this, "dateFormatter", void 0);
    this.localization = Constants.LOCALIZATION_LANGUAGES[language];

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
    var dateTimeFormatOptions = {
      timeStyle: 'short'
    };

    // if user hasn't defined this specifically in config
    // let the formatter figure it out based on language
    if (use12HourClock !== undefined) {
      dateTimeFormatOptions.hour12 = use12HourClock;
    }
    this.dateFormatter = new Intl.DateTimeFormat(language, dateTimeFormatOptions);
  }
  _createClass(I18N, [{
    key: "formatDateAsTime",
    value: function formatDateAsTime(date) {
      return this.dateFormatter.formatToParts(date).map(function (_ref) {
        var type = _ref.type,
          value = _ref.value;
        switch (type) {
          // intentional fallthrough
          case 'hour':
          case 'minute':
          case 'dayPeriod':
          case 'literal':
            return value;

          /* istanbul ignore next */
          default:
            return '';
        }
      }).join('');
    }

    /**
     * TR -> TRanslation
     * @param translationKey The key to lookup a translation for
     * @returns The string specified in the translation files
     */
  }, {
    key: "tr",
    value: function tr(translationKey) {
      return this.getLocalizationElement(this.localization, translationKey).toString();
    }

    // Janky recursive logic to handle nested values in i18n json sources
  }, {
    key: "getLocalizationElement",
    value: function getLocalizationElement(localization, translationKey) {
      if (translationKey.includes('.')) {
        var parts = translationKey.split('.', 2);
        // TODO: maybe add typecheck
        var _localization = this.getLocalizationElement(this.localization, parts[0]);
        return this.getLocalizationElement(_localization, parts[1]);
      } else {
        var _ref2, _ref3;
        // if the translation isn't completed in the target language, fall back to english
        // give ugly string for developers who misstype
        return (_ref2 = (_ref3 = localization ? localization[translationKey] : undefined) !== null && _ref3 !== void 0 ? _ref3 : Constants.FALLBACK_LOCALIZATION[translationKey]) !== null && _ref2 !== void 0 ? _ref2 : "Translation key '".concat(translationKey, "' doesn't have a valid translation");
      }
    }
  }]);
  return I18N;
}();

var _templateObject$5;
var HorizonErrorContent = /*#__PURE__*/function () {
  function HorizonErrorContent(config, error) {
    _classCallCheck(this, HorizonErrorContent);
    _defineProperty(this, "i18n", void 0);
    _defineProperty(this, "error", void 0);
    this.i18n = config.i18n;
    this.error = error;
  }
  _createClass(HorizonErrorContent, [{
    key: "render",
    value: function render() {
      var errorMessage = this.i18n.tr("errors.".concat(this.error));
      // eslint-disable-next-line no-console
      console.error(errorMessage);
      return y(_templateObject$5 || (_templateObject$5 = _taggedTemplateLiteral(["\n      <div class=\"horizon-card-error\">\n        ", "\n      </div>\n    "])), errorMessage);
    }
  }]);
  return HorizonErrorContent;
}();

var _templateObject$4;
var HorizonCardFooter = /*#__PURE__*/function () {
  function HorizonCardFooter(config, data) {
    _classCallCheck(this, HorizonCardFooter);
    _defineProperty(this, "data", void 0);
    _defineProperty(this, "i18n", void 0);
    _defineProperty(this, "times", void 0);
    _defineProperty(this, "fields", void 0);
    this.data = data;
    this.i18n = config.i18n;
    this.times = data === null || data === void 0 ? void 0 : data.times;
    this.fields = config.fields;
  }
  _createClass(HorizonCardFooter, [{
    key: "render",
    value: function render() {
      var _this$fields, _this$times, _this$fields2, _this$times2, _this$fields3, _this$times3, _this$fields4, _this$data, _this$fields5, _this$data2;
      return y(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral(["\n      <div class=\"horizon-card-footer\">\n        <div class=\"horizon-card-field-row\">\n          ", "\n          ", "\n          ", "\n        </div>\n\n        <div class=\"horizon-card-field-row\">\n          ", "\n          ", "\n        </div>\n      </div>\n    "])), (_this$fields = this.fields) !== null && _this$fields !== void 0 && _this$fields.dawn ? HelperFunctions.renderFieldElement(this.i18n, EHorizonCardI18NKeys.Dawn, (_this$times = this.times) === null || _this$times === void 0 ? void 0 : _this$times.dawn) : HelperFunctions.nothing(), (_this$fields2 = this.fields) !== null && _this$fields2 !== void 0 && _this$fields2.noon ? HelperFunctions.renderFieldElement(this.i18n, EHorizonCardI18NKeys.Noon, (_this$times2 = this.times) === null || _this$times2 === void 0 ? void 0 : _this$times2.noon) : HelperFunctions.nothing(), (_this$fields3 = this.fields) !== null && _this$fields3 !== void 0 && _this$fields3.dusk ? HelperFunctions.renderFieldElement(this.i18n, EHorizonCardI18NKeys.Dusk, (_this$times3 = this.times) === null || _this$times3 === void 0 ? void 0 : _this$times3.dusk) : HelperFunctions.nothing(), (_this$fields4 = this.fields) !== null && _this$fields4 !== void 0 && _this$fields4.azimuth ? HelperFunctions.renderFieldElement(this.i18n, EHorizonCardI18NKeys.Azimuth, (_this$data = this.data) === null || _this$data === void 0 ? void 0 : _this$data.azimuth) : HelperFunctions.nothing(), (_this$fields5 = this.fields) !== null && _this$fields5 !== void 0 && _this$fields5.elevation ? HelperFunctions.renderFieldElement(this.i18n, EHorizonCardI18NKeys.Elevation, (_this$data2 = this.data) === null || _this$data2 === void 0 ? void 0 : _this$data2.elevation) : HelperFunctions.nothing());
    }
  }]);
  return HorizonCardFooter;
}();

var _templateObject$3;
var HorizonCardGraph = /*#__PURE__*/function () {
  function HorizonCardGraph(data) {
    var _data$sunInfo;
    _classCallCheck(this, HorizonCardGraph);
    _defineProperty(this, "sunInfo", void 0);
    this.sunInfo = (_data$sunInfo = data === null || data === void 0 ? void 0 : data.sunInfo) !== null && _data$sunInfo !== void 0 ? _data$sunInfo : Constants.DEFAULT_SUN_INFO;
  }
  _createClass(HorizonCardGraph, [{
    key: "render",
    value: function render() {
      var sunID = 'sun-gradient';
      var dawnID = 'dawn-gradient';
      var dayID = 'day-gradient';
      var duskID = 'dusk-gradient';
      var viewBox = '0 0 550 150';
      // TODO: Check sun opacity

      return y(_templateObject$3 || (_templateObject$3 = _taggedTemplateLiteral(["\n      <div class=\"horizon-card-graph\">\n        <svg viewBox=\"", "\" xmlns=\"http://www.w3.org/2000/svg\">\n\n          <!-- Define gradients for use when drawing afterwards -->\n          <defs>\n            <linearGradient id=\"", "\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n              <stop offset=\"0%\" class=\"sunInitialStop\" />\n              <stop offset=\"", "%\" class=\"sunMiddleStop\" />\n              <stop offset=\"", "%\" class=\"sunEndStop\" />\n            </linearGradient>\n\n            <linearGradient id=\"", "\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n              <stop offset=\"0%\" class=\"dawnInitialStop\" />\n              <stop offset=\"", "%\" class=\"dawnMiddleStop\" />\n              <stop offset=\"", "%\" class=\"dawnEndStop\" />\n            </linearGradient>\n\n            <linearGradient id=\"", "\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n              <stop offset=\"0%\" class=\"dayInitialStop\" />\n              <stop offset=\"", "%\" class=\"dayMiddleStop\" />\n              <stop offset=\"", "%\" class=\"dayEndStop\" />\n            </linearGradient>\n\n            <linearGradient id=\"", "\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n              <stop offset=\"0%\" class=\"duskInitialStop\" />\n              <stop offset=\"", "%\" class=\"duskMiddleStop\" />\n              <stop offset=\"", "%\" class=\"duskEndStop\" />\n            </linearGradient>\n          </defs>\n\n          <!-- Draw path of the sun across the 'sky' -->\n          <path\n            class=\"horizon-card-sun-line\"\n            d=\"M5,146 C29,153 73,128 101,108 C276,-29 342,23 449,108 C473,123 509,150 545,146\"\n            fill=\"none\"\n            stroke=\"var(--horizon-card-lines)\"\n          />\n\n          <!-- Draw between the path of the sun and the horizon line for dawn -->\n          <!-- IE: First dark blue part -->\n          <path\n            d=\"M5,146 C29,153 73,128 101,108 L 5 108\"\n            fill=\"url(#", ")\"\n            stroke=\"url(#", ")\"\n            opacity=\"", "\"\n          />\n\n          <!-- Draw between the path of the sun and the horizon line for day -->\n          <!-- IE: Main light blue part in the middle -->\n          <path\n            d=\"M101,108 C276,-29 342,23 449,108 L 104,108\"\n            fill=\"url(#", ")\"\n            stroke=\"url(#", ")\"\n            opacity=\"", "\"\n          />\n\n          <!-- Draw between the path of the sun and the horizon line for dusk -->\n          <!-- IE: Last dark blue part -->\n          <path\n            d=\"M449,108 C473,123 509,150 545,146 L 545 108\"\n            fill=\"url(#", ")\"\n            stroke=\"url(#", ")\"\n            opacity=\"", "\"\n          />\n\n          <!-- Draw the horizon, dawn and dusk lines (the gray horizontal/vertical lines) -->\n          <line x1=\"5\" y1=\"108\" x2=\"545\" y2=\"108\" stroke=\"var(--horizon-card-lines)\" />\n          <line x1=\"101\" y1=\"25\" x2=\"101\" y2=\"100\" stroke=\"var(--horizon-card-lines)\" />\n          <line x1=\"449\" y1=\"25\" x2=\"449\" y2=\"100\" stroke=\"var(--horizon-card-lines)\" />\n\n          <!-- Draw a circle representing the sun -->\n          <circle\n            cx=\"", "\"\n            cy=\"", "\"\n            r=\"17\"\n            opacity=\"", "\"\n            stroke=\"none\" fill=\"url(#", ")\"\n          />\n        </svg>\n      </div>\n    "])), viewBox, sunID, this.sunInfo.sunPercentOverHorizon, this.sunInfo.sunPercentOverHorizon, dawnID, this.sunInfo.dawnProgressPercent, this.sunInfo.dawnProgressPercent, dayID, this.sunInfo.dayProgressPercent, this.sunInfo.dayProgressPercent, duskID, this.sunInfo.duskProgressPercent, this.sunInfo.duskProgressPercent, dawnID, dawnID, this.sunInfo.dawnProgressPercent, dayID, dayID, this.sunInfo.dayProgressPercent, duskID, duskID, this.sunInfo.duskProgressPercent, this.sunInfo.sunPosition.x, this.sunInfo.sunPosition.y, this.sunInfo.sunPercentOverHorizon, sunID);
    }
  }]);
  return HorizonCardGraph;
}();

var _templateObject$2, _templateObject2$1, _templateObject3$1;
var HorizonCardHeader = /*#__PURE__*/function () {
  function HorizonCardHeader(config, data) {
    _classCallCheck(this, HorizonCardHeader);
    _defineProperty(this, "title", void 0);
    _defineProperty(this, "times", void 0);
    _defineProperty(this, "fields", void 0);
    _defineProperty(this, "i18n", void 0);
    this.title = config.title;
    this.fields = config.fields;
    this.times = data === null || data === void 0 ? void 0 : data.times;
    this.i18n = config.i18n;
  }
  _createClass(HorizonCardHeader, [{
    key: "render",
    value: function render() {
      return y(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral(["\n      ", "\n      ", "\n    "])), this.showTitle() ? this.renderTitle() : HelperFunctions.nothing(), this.renderHeader());
    }
  }, {
    key: "renderTitle",
    value: function renderTitle() {
      return y(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral(["<div class=\"horizon-card-title\">", "</div>"])), this.title);
    }
  }, {
    key: "renderHeader",
    value: function renderHeader() {
      var _this$fields, _this$times, _this$fields2, _this$times2;
      return y(_templateObject3$1 || (_templateObject3$1 = _taggedTemplateLiteral(["\n      <div class=\"horizon-card-header\">\n        ", "\n        ", "\n      </div>\n    "])), (_this$fields = this.fields) !== null && _this$fields !== void 0 && _this$fields.sunrise ? HelperFunctions.renderFieldElement(this.i18n, EHorizonCardI18NKeys.Sunrise, (_this$times = this.times) === null || _this$times === void 0 ? void 0 : _this$times.sunrise) : HelperFunctions.nothing(), (_this$fields2 = this.fields) !== null && _this$fields2 !== void 0 && _this$fields2.sunset ? HelperFunctions.renderFieldElement(this.i18n, EHorizonCardI18NKeys.Sunset, (_this$times2 = this.times) === null || _this$times2 === void 0 ? void 0 : _this$times2.sunset) : HelperFunctions.nothing());
    }
  }, {
    key: "showTitle",
    value: function showTitle() {
      return this.title !== undefined;
    }
  }]);
  return HorizonCardHeader;
}();

var _templateObject$1;
var HorizonCardContent = /*#__PURE__*/function () {
  function HorizonCardContent(config, data) {
    _classCallCheck(this, HorizonCardContent);
    _defineProperty(this, "config", void 0);
    _defineProperty(this, "data", void 0);
    this.config = config;
    this.data = data;
  }
  _createClass(HorizonCardContent, [{
    key: "render",
    value: function render() {
      return y(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral(["\n      <ha-card>\n        <div class=\"horizon-card ", "\">\n          ", "\n          ", "\n          ", "\n        </div>\n      </ha-card>\n    "])), this.config.darkMode ? 'horizon-card-dark' : '', this.showHeader() ? this.renderHeader() : HelperFunctions.nothing(), this.renderGraph(), this.showFooter() ? this.renderFooter() : HelperFunctions.nothing());
    }
  }, {
    key: "renderHeader",
    value: function renderHeader() {
      return new HorizonCardHeader(this.config, this.data).render();
    }
  }, {
    key: "renderGraph",
    value: function renderGraph() {
      return new HorizonCardGraph(this.data).render();
    }
  }, {
    key: "renderFooter",
    value: function renderFooter() {
      return new HorizonCardFooter(this.config, this.data).render();
    }
  }, {
    key: "showHeader",
    value: function showHeader() {
      // logic based on config
      return true;
    }
  }, {
    key: "showFooter",
    value: function showFooter() {
      // logic based on config
      return true;
    }
  }]);
  return HorizonCardContent;
}();

var HorizonCard = _decorate([customElement('horizon-card')], function (_initialize, _LitElement) {
  var HorizonCard = /*#__PURE__*/function (_LitElement2) {
    _inherits(HorizonCard, _LitElement2);
    var _super = _createSuper(HorizonCard);
    function HorizonCard() {
      var _this;
      _classCallCheck(this, HorizonCard);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(HorizonCard);
  }(_LitElement);
  return {
    F: HorizonCard,
    d: [{
      kind: "field",
      "static": true,
      key: "cardType",
      value: function value() {
        return 'horizon-card';
      }
    }, {
      kind: "field",
      "static": true,
      key: "cardName",
      value: function value() {
        return 'Horizon Card';
      }
    }, {
      kind: "field",
      "static": true,
      key: "cardDescription",
      value: function value() {
        return 'Custom card that display a graph to track the sun position and related events';
      }
    }, {
      kind: "field",
      decorators: [state()],
      key: "config",
      value: function value() {
        return {
          type: HorizonCard.cardType
        };
      }
    }, {
      kind: "field",
      decorators: [state()],
      key: "data",
      value: void 0
    }, {
      kind: "field",
      key: "hasRendered",
      value: function value() {
        return false;
      }
    }, {
      kind: "field",
      key: "lastHass",
      value: void 0
    }, {
      kind: "field",
      key: "fixedNow",
      value: void 0
    }, {
      kind: "get",
      "static": true,
      key: "styles",
      value: function styles() {
        return cardStyles;
      }
    }, {
      kind: "set",
      key: "hass",
      value: function hass(_hass) {
        this.lastHass = _hass;
        if (!this.hasRendered) {
          this.populateConfigFromHass();
          return;
        }
        this.processLastHass();
      }

      /**
       * called by HASS to properly distribute card in lovelace view. It should return height
       * of the card as a number where 1 is equivalent of 50 pixels.
       * @see https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#api
       */
    }, {
      kind: "method",
      key: "getCardSize",
      value: function getCardSize() {
        var _this$config$fields, _this$config$fields2, _this$config$fields3, _this$config$fields4, _this$config$fields5, _this$config$fields6, _this$config$fields7;
        var height = 4; // Smallest possible card (only graph) is roughly 200px

        // Each element of card (title, header, content, footer) adds roughly 50px to the height
        if (this.config.title && this.config.title.length > 0) {
          height += 1;
        }
        if ((_this$config$fields = this.config.fields) !== null && _this$config$fields !== void 0 && _this$config$fields.sunrise || (_this$config$fields2 = this.config.fields) !== null && _this$config$fields2 !== void 0 && _this$config$fields2.sunset) {
          height += 1;
        }
        if ((_this$config$fields3 = this.config.fields) !== null && _this$config$fields3 !== void 0 && _this$config$fields3.dawn || (_this$config$fields4 = this.config.fields) !== null && _this$config$fields4 !== void 0 && _this$config$fields4.noon || (_this$config$fields5 = this.config.fields) !== null && _this$config$fields5 !== void 0 && _this$config$fields5.dusk) {
          height += 1;
        }
        if ((_this$config$fields6 = this.config.fields) !== null && _this$config$fields6 !== void 0 && _this$config$fields6.azimuth || (_this$config$fields7 = this.config.fields) !== null && _this$config$fields7 !== void 0 && _this$config$fields7.elevation) {
          height += 1;
        }
        return height;
      }

      // Visual editor disabled because it's broken, see https://developers.home-assistant.io/blog/2022/02/18/paper-elements/
      // static getConfigElement (): HTMLElement {
      //   return document.createElement(HorizonCardEditor.cardType)
      // }

      // called by HASS whenever config changes
    }, {
      kind: "method",
      key: "setConfig",
      value: function setConfig(config) {
        var _config$component, _config$fields$sunris, _config$fields, _config$fields$sunset, _config$fields2, _config$fields$dawn, _config$fields3, _config$fields$noon, _config$fields4, _config$fields$dusk, _config$fields5, _config$fields$azimut, _config$fields6, _config$fields$elevat, _config$fields7;
        var newConfig = _objectSpread2({}, this.config);
        newConfig.title = config.title;
        newConfig.darkMode = config.darkMode;
        newConfig.language = config.language;
        newConfig.use12hourClock = config.use12hourClock;
        newConfig.component = (_config$component = config.component) !== null && _config$component !== void 0 ? _config$component : Constants.DEFAULT_CONFIG.component;
        if (newConfig.language && !HelperFunctions.isValidLanguage(newConfig.language)) {
          throw Error("".concat(config.language, " is not a supported language. Supported languages: ").concat(Object.keys(Constants.LOCALIZATION_LANGUAGES)));
        }
        var defaultFields = Constants.DEFAULT_CONFIG.fields;
        newConfig.fields = {
          sunrise: (_config$fields$sunris = (_config$fields = config.fields) === null || _config$fields === void 0 ? void 0 : _config$fields.sunrise) !== null && _config$fields$sunris !== void 0 ? _config$fields$sunris : defaultFields.sunrise,
          sunset: (_config$fields$sunset = (_config$fields2 = config.fields) === null || _config$fields2 === void 0 ? void 0 : _config$fields2.sunset) !== null && _config$fields$sunset !== void 0 ? _config$fields$sunset : defaultFields.sunset,
          dawn: (_config$fields$dawn = (_config$fields3 = config.fields) === null || _config$fields3 === void 0 ? void 0 : _config$fields3.dawn) !== null && _config$fields$dawn !== void 0 ? _config$fields$dawn : defaultFields.dawn,
          noon: (_config$fields$noon = (_config$fields4 = config.fields) === null || _config$fields4 === void 0 ? void 0 : _config$fields4.noon) !== null && _config$fields$noon !== void 0 ? _config$fields$noon : defaultFields.noon,
          dusk: (_config$fields$dusk = (_config$fields5 = config.fields) === null || _config$fields5 === void 0 ? void 0 : _config$fields5.dusk) !== null && _config$fields$dusk !== void 0 ? _config$fields$dusk : defaultFields.dusk,
          azimuth: (_config$fields$azimut = (_config$fields6 = config.fields) === null || _config$fields6 === void 0 ? void 0 : _config$fields6.azimuth) !== null && _config$fields$azimut !== void 0 ? _config$fields$azimut : defaultFields.azimuth,
          elevation: (_config$fields$elevat = (_config$fields7 = config.fields) === null || _config$fields7 === void 0 ? void 0 : _config$fields7.elevation) !== null && _config$fields$elevat !== void 0 ? _config$fields$elevat : defaultFields.elevation
        };
        this.config = newConfig;
        if (this.lastHass) {
          this.populateConfigFromHass();
        }
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this$data;
        if ((_this$data = this.data) !== null && _this$data !== void 0 && _this$data.error) {
          return new HorizonErrorContent(this.config, this.data.error).render();
        }

        // TODO: Move
        // init i18n component (assume set config has run at least once)
        this.config.i18n = new I18N(this.config.language, this.config.use12hourClock);

        // render components
        return new HorizonCardContent(this.config, this.data).render();
      }
    }, {
      kind: "method",
      key: "updated",
      value: function updated(changedProperties) {
        _get(_getPrototypeOf(HorizonCard.prototype), "updated", this).call(this, changedProperties);
        if (!this.hasRendered) {
          this.hasRendered = true;
          this.processLastHass();
        }
      }

      /**
       * Sets a fixed now value to use instead of the actual time.
       * Used for development only. Called from js code in the dev directory.
       * @param fixedNow a Date
       * @protected
       */
    }, {
      kind: "method",
      key: "setFixedNow",
      value: function setFixedNow(fixedNow) {
        this.fixedNow = fixedNow;
      }
    }, {
      kind: "method",
      key: "populateConfigFromHass",
      value: function populateConfigFromHass() {
        var _this$config$darkMode, _this$lastHass$themes, _ref, _this$config$language, _locale;
        // respect setting in hass
        // NOTE: custom-card-helpers types are not up to date with home assistant
        // NOTE: Old releases from Home Assistant doesn't provide the locale property
        this.config.darkMode = (_this$config$darkMode = this.config.darkMode) !== null && _this$config$darkMode !== void 0 ? _this$config$darkMode : (_this$lastHass$themes = this.lastHass.themes) === null || _this$lastHass$themes === void 0 ? void 0 : _this$lastHass$themes.darkMode;
        this.config.language = (_ref = (_this$config$language = this.config.language) !== null && _this$config$language !== void 0 ? _this$config$language : (_locale = this.lastHass.locale) === null || _locale === void 0 ? void 0 : _locale.language) !== null && _ref !== void 0 ? _ref : this.lastHass.language;
      }
    }, {
      kind: "method",
      key: "processLastHass",
      value: function processLastHass() {
        if (!this.lastHass) {
          return;
        }
        this.populateConfigFromHass();
        var sunComponent = this.config.component;
        if (this.lastHass.states[sunComponent]) {
          var sunAttrs = this.lastHass.states[sunComponent].attributes;
          var now = this.now();
          var times = this.readTimes(sunAttrs, now);
          var sunInfo = this.calculateSunInfo(sunAttrs.elevation, now, times);
          this.data = {
            azimuth: sunAttrs.azimuth,
            elevation: sunAttrs.elevation,
            sunInfo: sunInfo,
            times: times
          };
        } else {
          this.data = {
            azimuth: 0,
            elevation: 0,
            sunInfo: Constants.DEFAULT_SUN_INFO,
            times: Constants.DEFAULT_TIMES,
            error: EHorizonCardErrors.SunIntegrationNotFound
          };
        }
      }

      /* For the math to work in #calculateSunInfo(sunrise, sunset, noon, elevation, now), we need the
       * date part of the given 'date-time' to be equal. This will not be the
       * case whenever we pass one of the 'times', ie: when we pass dawn, hass
       * will update that variable with tomorrows dawn.
       *
       * This function safe-guards that through standardizing the 'date'-part on
       * the last 'time' to now. This means that all dates will have the date of the
       * current moment, thus ensuring equal date across all times of day.
       */
    }, {
      kind: "method",
      key: "readTimes",
      value: function readTimes(sunAttributes, now) {
        var noon = new Date(sunAttributes.next_noon);
        return {
          dawn: this.normalizeSunEventTime(sunAttributes.next_dawn, now, noon),
          dusk: this.normalizeSunEventTime(sunAttributes.next_dusk, now, noon),
          noon: this.combineDateTime(now, noon),
          sunrise: this.normalizeSunEventTime(sunAttributes.next_rising, now, noon),
          sunset: this.normalizeSunEventTime(sunAttributes.next_setting, now, noon)
        };
      }

      /**
       * Normalizes a sun event time and returns it as a Date whose date part is set to the provided now Date,
       * or undefined if the event does not occur within 24h of the provided noon moment.
       * Dawn, dusk, sunset and sunrise events may not occur for certain times of the year at high latitudes.
       * @param eventTime event time as string
       * @param now the current time
       * @param noon the time of next noon
       * @private
       */
    }, {
      kind: "method",
      key: "normalizeSunEventTime",
      value: function normalizeSunEventTime(eventTime, now, noon) {
        var event = new Date(eventTime);
        if (Math.abs(event.getTime() - noon.getTime()) > 24 * 60 * 60 * 1000) {
          // No such event within 24h, happens at higher latitudes for certain times of the year.
          // This can happen for dusk, dawn, sunset, sunrise but not noon since solar noon is defined as the highest
          // elevation of the sun, even if it's below the horizon.
          return undefined;
        }
        return this.combineDateTime(now, event);
      }

      /**
       * Takes the date from dateSource and the time from timeSource and returns a Date combining both
       * @param dateSource a Date
       * @param timeSource a Date
       * @private
       */
    }, {
      kind: "method",
      key: "combineDateTime",
      value: function combineDateTime(dateSource, timeSource) {
        // Note: these need to be the non-UTC versions of the methods!
        return new Date(dateSource.getFullYear(), dateSource.getMonth(), dateSource.getDate(), timeSource.getHours(), timeSource.getMinutes(), timeSource.getSeconds(), timeSource.getMilliseconds());
      }

      /**
       * Returns the current moment in time, used to normalize the event times and calculate the position of the sun.
       * @private
       */
    }, {
      kind: "method",
      key: "now",
      value: function now() {
        if (this.fixedNow == null) {
          // normal operation
          return new Date();
        } else {
          // for development: pretend the current moment is the fixed value
          return this.fixedNow;
        }
      }

      /**
       * Calculates a usable sunrise value even if the true sunrise doesn't occur (sun is above/below the horizon)
       * on a given day.
       * @param dayStartMs day start time as ms since epoch
       * @param elevation sun elevation
       * @param noon normalized noon time
       * @param sunrise normalized sunrise time
       * @param sunset normalized sunset time
       * @private
       */
    }, {
      kind: "method",
      key: "calculateUsableSunrise",
      value: function calculateUsableSunrise(dayStartMs, elevation, noon, sunrise, sunset) {
        if (sunrise === undefined) {
          // No sunrise
          if (elevation < Constants.BELOW_HORIZON_ELEVATION) {
            // Sun is below horizon, fake sunrise 1 ms before noon
            return noon.getTime() - 1;
          } else {
            // Sun is above horizon, fake sunrise at 00:00:00
            return dayStartMs;
          }
        } else if (sunset !== undefined && sunrise > sunset) {
          // Quirk - happens when the sun rises shortly after it sets on the same day before midnight,
          // fake sunrise at 00:00:00
          return dayStartMs;
        }
        return sunrise.getTime();
      }

      /**
       * Calculates a usable sunset value even if the true sunset doesn't occur (sun is above/below the horizon)
       * on a given day.
       * @param dayEndMs day end time as ms since epoch
       * @param elevation sun elevation
       * @param noon normalized noon time
       * @param sunset normalized sunset time
       * @private
       */
    }, {
      kind: "method",
      key: "calculateUsableSunset",
      value: function calculateUsableSunset(dayEndMs, elevation, noon, sunset) {
        if (sunset === undefined) {
          if (elevation < Constants.BELOW_HORIZON_ELEVATION) {
            // Sun is below horizon, fake sunset 1 ms after noon
            return noon.getTime() + 1;
          } else {
            // Sun is above horizon, fake sunset at 23:59:59
            return dayEndMs;
          }
        }
        return sunset.getTime();
      }
    }, {
      kind: "method",
      key: "calculateSunInfo",
      value: function calculateSunInfo(elevation, now, times) {
        var _this$shadowRoot;
        var sunLine = (_this$shadowRoot = this.shadowRoot) === null || _this$shadowRoot === void 0 ? void 0 : _this$shadowRoot.querySelector('path');

        // find the instances of time for today
        var nowMs = now.getTime();
        var dayStartMs = HelperFunctions.startOfDay(now).getTime();
        var dayEndMs = HelperFunctions.endOfDay(now).getTime();

        // Here it gets fuzzy for higher latitudes - the sun may not rise or set within 24h
        var sunriseMs = this.calculateUsableSunrise(dayStartMs, elevation, times.noon, times.sunrise, times.sunset);
        var sunsetMs = this.calculateUsableSunset(dayEndMs, elevation, times.noon, times.sunset);

        // calculate relevant moments in time
        var msSinceStartOfDay = Math.max(nowMs - dayStartMs, 0);
        var msSinceSunrise = Math.max(nowMs - sunriseMs, 0);
        var msSinceSunset = Math.max(nowMs - sunsetMs, 0);
        var msOfDaylight = sunsetMs - sunriseMs;
        // We need at least 1ms to avoid division by zero
        var msUntilSunrise = Math.max(sunriseMs - dayStartMs, 1);
        var msUntilEndOfDay = Math.max(dayEndMs - sunsetMs, 1);

        // find section positions
        var dawnSectionPosition = HelperFunctions.findSectionPosition(msSinceStartOfDay, msUntilSunrise, Constants.SUN_SECTIONS.dawn);
        var daySectionPosition = HelperFunctions.findSectionPosition(msSinceSunrise, msOfDaylight, Constants.SUN_SECTIONS.day);
        var duskSectionPosition = HelperFunctions.findSectionPosition(msSinceSunset, msUntilEndOfDay, Constants.SUN_SECTIONS.dusk);

        // find the sun position
        var position = dawnSectionPosition + daySectionPosition + duskSectionPosition;
        var sunPosition = sunLine.getPointAtLength(position);

        // calculate section progress, in percentage
        var dawnProgressPercent = HelperFunctions.findSunProgress(sunPosition.x, Constants.EVENT_X_POSITIONS.dayStart, Constants.EVENT_X_POSITIONS.sunrise);
        var dayProgressPercent = HelperFunctions.findSunProgress(sunPosition.x, Constants.EVENT_X_POSITIONS.sunrise, Constants.EVENT_X_POSITIONS.sunset);
        var duskProgressPercent = HelperFunctions.findSunProgress(sunPosition.x, Constants.EVENT_X_POSITIONS.sunset, Constants.EVENT_X_POSITIONS.dayEnd);

        // calculate sun position in regards to the horizon
        var sunCenterY = sunPosition.y - Constants.SUN_RADIUS;
        var sunCenterYAboveHorizon = Constants.HORIZON_Y - sunCenterY;
        var sunAboveHorizon = sunCenterYAboveHorizon > 0;
        var sunPercentOverHorizon = 100 * sunCenterYAboveHorizon / (2 * Constants.SUN_RADIUS);
        sunPercentOverHorizon = HelperFunctions.clamp(0, 100, sunPercentOverHorizon);
        return {
          sunrise: sunriseMs,
          sunset: sunsetMs,
          dawnProgressPercent: dawnProgressPercent,
          dayProgressPercent: dayProgressPercent,
          duskProgressPercent: duskProgressPercent,
          sunAboveHorizon: sunAboveHorizon,
          sunPercentOverHorizon: sunPercentOverHorizon,
          sunPosition: {
            x: sunPosition.x,
            y: sunPosition.y
          }
        };
      }
    }]
  };
}, s);
window.customCards = window.customCards || [];
window.customCards.push({
  type: HorizonCard.cardType,
  name: HorizonCard.cardName,
  preview: true,
  description: HorizonCard.cardDescription
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any

// eslint-disable-next-line @typescript-eslint/no-explicit-any

var EventUtils = /*#__PURE__*/function () {
  function EventUtils() {
    _classCallCheck(this, EventUtils);
    _defineProperty(this, "eventMap", new Map());
  }
  _createClass(EventUtils, [{
    key: "on",
    value: function on(eventName, listener) {
      var eventListeners = this.eventMap.get(eventName) || [];
      eventListeners.push(listener);
      this.eventMap.set(eventName, eventListeners);
    }
  }, {
    key: "emit",
    value: function emit(eventName, data) {
      var eventListeners = this.eventMap.get(eventName) || [];
      eventListeners.forEach(function (eventListener) {
        eventListener(data);
      });
    }
  }]);
  return EventUtils;
}();

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8;
var HorizonCardEditorContent = /*#__PURE__*/function (_EventUtils) {
  _inherits(HorizonCardEditorContent, _EventUtils);
  var _super = _createSuper(HorizonCardEditorContent);
  function HorizonCardEditorContent(config) {
    var _this;
    _classCallCheck(this, HorizonCardEditorContent);
    _this = _super.call(this);
    _defineProperty(_assertThisInitialized(_this), "config", void 0);
    _this.config = config;
    return _this;
  }
  _createClass(HorizonCardEditorContent, [{
    key: "render",
    value: function render() {
      return y(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      <div class=\"card-config\">\n        <div>\n          ", "\n        </div>\n        <div>\n          ", "\n        </div>\n        <div>\n          ", "\n        </div>\n        <div>\n          ", "\n        </div>\n        <div>\n          ", "\n        </div>\n      </div>\n    "])), this.renderTitleEditor(), this.renderLanguageEditor(), this.renderDarkModeEditor(), this.render12HourClockEditor(), this.renderFieldsEditor());
    }
  }, {
    key: "onConfigChanged",
    value: function onConfigChanged(event) {
      this.emit('configChanged', event);
    }
  }, {
    key: "renderTitleEditor",
    value: function renderTitleEditor() {
      var _this$config$title,
        _this$config,
        _this2 = this;
      return y(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      <paper-input\n        label=\"Title (Optional)\"\n        .configValue=", "\n        .value=", "\n        @value-changed=", "\n      >\n      </paper-input>\n    "])), 'title', (_this$config$title = (_this$config = this.config) === null || _this$config === void 0 ? void 0 : _this$config.title) !== null && _this$config$title !== void 0 ? _this$config$title : '', function (event) {
        return _this2.onConfigChanged(event);
      });
    }
  }, {
    key: "renderLanguageEditor",
    value: function renderLanguageEditor() {
      var _this$config$language,
        _this$config2,
        _this3 = this;
      // TODO: Add language full name
      var selectedLanguage = Object.keys(Constants.LOCALIZATION_LANGUAGES).indexOf((_this$config$language = (_this$config2 = this.config) === null || _this$config2 === void 0 ? void 0 : _this$config2.language) !== null && _this$config$language !== void 0 ? _this$config$language : '') + 1;
      return y(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      <paper-dropdown-menu\n        label=\"Language\"\n        .configValue=", "\n        @value-changed=", "\n      >\n        <paper-listbox slot=\"dropdown-content\" selected=\"", "\">\n          <paper-item label=\"default\">Default</paper-item>\n          ", "\n        </paper-listbox>\n      </paper-dropdown-menu>\n    "])), 'language', function (event) {
        return _this3.onConfigChanged(event);
      }, selectedLanguage, Object.keys(Constants.LOCALIZATION_LANGUAGES).map(function (language) {
        return y(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n            <paper-item label=\"", "\">", "</paper-item>\n          "])), language, language);
      }));
    }
  }, {
    key: "renderDarkModeEditor",
    value: function renderDarkModeEditor() {
      var _this$config$darkMode,
        _this$config3,
        _this4 = this;
      var selectedDarkMode = (_this$config$darkMode = (_this$config3 = this.config) === null || _this$config3 === void 0 ? void 0 : _this$config3.darkMode) !== null && _this$config$darkMode !== void 0 ? _this$config$darkMode : 'default';
      return y(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      <label id=\"theme\">Theme:</label>\n      <paper-radio-group\n        aria-labelledby=\"theme\"\n        .configValue=", "\n        .selected=", "\n        @paper-radio-group-changed=", "\n      >\n        <paper-radio-button name=\"default\">Default</paper-radio-button>\n        <paper-radio-button name=\"true\">Dark</paper-radio-button>\n        <paper-radio-button name=\"false\">Light</paper-radio-button>\n      </paper-radio-group>\n    "])), 'darkMode', selectedDarkMode.toString(), function (event) {
        return _this4.onConfigChanged(event);
      });
    }
  }, {
    key: "render12HourClockEditor",
    value: function render12HourClockEditor() {
      var _this$config$use12hou,
        _this$config4,
        _this5 = this;
      var selectedClockMode = (_this$config$use12hou = (_this$config4 = this.config) === null || _this$config4 === void 0 ? void 0 : _this$config4.use12hourClock) !== null && _this$config$use12hou !== void 0 ? _this$config$use12hou : 'default';
      return y(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n      <label id=\"clock\">Clock mode:</label>\n      <paper-radio-group\n        aria-labelledby=\"clock\"\n        .configValue=", "\n        .selected=", "\n        @paper-radio-group-changed=", "\n      >\n        <paper-radio-button name=\"default\">Default</paper-radio-button>\n        <paper-radio-button name=\"true\">12 hours</paper-radio-button>\n        <paper-radio-button name=\"false\">24 hours</paper-radio-button>\n      </paper-radio-group>\n    "])), 'use12hourClock', selectedClockMode.toString(), function (event) {
        return _this5.onConfigChanged(event);
      });
    }
  }, {
    key: "renderFieldsEditor",
    value: function renderFieldsEditor() {
      var _this6 = this;
      return y(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n      <label>Card fields:</label>\n      <ul>\n        ", "\n      </ul>\n    "])), Object.entries(EHorizonCardI18NKeys).map(function (_ref) {
        var _this6$config$fields$, _this6$config$fields;
        var _ref2 = _slicedToArray(_ref, 2),
          name = _ref2[0],
          configValue = _ref2[1];
        return y(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n            <li><ha-switch .configValue=", " .checked=", " @change=", "></ha-switch> ", "</li>\n          "])), configValue, (_this6$config$fields$ = (_this6$config$fields = _this6.config.fields) === null || _this6$config$fields === void 0 ? void 0 : _this6$config$fields[configValue]) !== null && _this6$config$fields$ !== void 0 ? _this6$config$fields$ : Constants.DEFAULT_CONFIG.fields[configValue], function (event) {
          return _this6.onConfigChanged(event);
        }, name);
      }));
    }
  }]);
  return HorizonCardEditorContent;
}(EventUtils);

_decorate([customElement('horizon-card-editor')], function (_initialize, _LitElement) {
  var HorizonCardEditor = /*#__PURE__*/function (_LitElement2) {
    _inherits(HorizonCardEditor, _LitElement2);
    var _super = _createSuper(HorizonCardEditor);
    function HorizonCardEditor() {
      var _this;
      _classCallCheck(this, HorizonCardEditor);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(HorizonCardEditor);
  }(_LitElement);
  return {
    F: HorizonCardEditor,
    d: [{
      kind: "field",
      "static": true,
      key: "cardType",
      value: function value() {
        return 'horizon-card-editor';
      }
    }, {
      kind: "field",
      "static": true,
      key: "CONFIG_CHANGED_EVENT",
      value: function value() {
        return 'config-changed';
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "hass",
      value: void 0
    }, {
      kind: "field",
      decorators: [property()],
      key: "config",
      value: void 0
    }, {
      kind: "get",
      "static": true,
      key: "styles",
      value: function styles() {
        return cardStyles;
      }
    }, {
      kind: "method",
      key: "setConfig",
      value: function setConfig(config) {
        this.config = config;
      }
    }, {
      kind: "method",
      key: "configChanged",
      value: function configChanged(event) {
        var _event$target, _ref, _event$detail$value, _event$detail, _event$target2, _event$target3;
        var property = (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.configValue;
        var value = (_ref = (_event$detail$value = (_event$detail = event.detail) === null || _event$detail === void 0 ? void 0 : _event$detail.value) !== null && _event$detail$value !== void 0 ? _event$detail$value : (_event$target2 = event.target) === null || _event$target2 === void 0 ? void 0 : _event$target2.selected) !== null && _ref !== void 0 ? _ref : (_event$target3 = event.target) === null || _event$target3 === void 0 ? void 0 : _event$target3.checked;
        var newConfig = _objectSpread2(_objectSpread2({}, this.config), {}, _defineProperty({}, property, value));

        // Handles default or empty values by deleting the config property
        if (value === 'default' || value === undefined || value === '') {
          delete newConfig[property];
        }

        // Handles boolean values
        if (value === 'true' || value === 'false') {
          newConfig[property] = value === 'true';
        }

        // Handles fields config
        if (Object.values(EHorizonCardI18NKeys).includes(property)) {
          delete newConfig[property];
          newConfig.fields = _objectSpread2(_objectSpread2({}, newConfig.fields), {}, _defineProperty({}, property, value));
        }
        var customEvent = new CustomEvent(HorizonCardEditor.CONFIG_CHANGED_EVENT, {
          bubbles: true,
          composed: true,
          detail: {
            config: newConfig
          }
        });
        this.dispatchEvent(customEvent);
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this2 = this;
        var content = new HorizonCardEditorContent(this.config);
        content.on('configChanged', function (event) {
          return _this2.configChanged(event);
        });
        return content.render();
      }
    }]
  };
}, s);
