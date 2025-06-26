var __legacyDecorateClassTS = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1;i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

// node_modules/@lit/reactive-element/development/css-tag.js
var NODE_MODE = false;
var global = NODE_MODE ? globalThis : window;
var supportsAdoptingStyleSheets = global.ShadowRoot && (global.ShadyCSS === undefined || global.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var constructionToken = Symbol();
var cssTagCache = new WeakMap;

class CSSResult {
  constructor(cssText, strings, safeToken) {
    this["_$cssResult$"] = true;
    if (safeToken !== constructionToken) {
      throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    }
    this.cssText = cssText;
    this._strings = strings;
  }
  get styleSheet() {
    let styleSheet = this._styleSheet;
    const strings = this._strings;
    if (supportsAdoptingStyleSheets && styleSheet === undefined) {
      const cacheable = strings !== undefined && strings.length === 1;
      if (cacheable) {
        styleSheet = cssTagCache.get(strings);
      }
      if (styleSheet === undefined) {
        (this._styleSheet = styleSheet = new CSSStyleSheet).replaceSync(this.cssText);
        if (cacheable) {
          cssTagCache.set(strings, styleSheet);
        }
      }
    }
    return styleSheet;
  }
  toString() {
    return this.cssText;
  }
}
var textFromCSSResult = (value) => {
  if (value["_$cssResult$"] === true) {
    return value.cssText;
  } else if (typeof value === "number") {
    return value;
  } else {
    throw new Error(`Value passed to 'css' function must be a 'css' function result: ` + `${value}. Use 'unsafeCSS' to pass non-literal values, but take care ` + `to ensure page security.`);
  }
};
var unsafeCSS = (value) => new CSSResult(typeof value === "string" ? value : String(value), undefined, constructionToken);
var css = (strings, ...values) => {
  const cssText = strings.length === 1 ? strings[0] : values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
  return new CSSResult(cssText, strings, constructionToken);
};
var adoptStyles = (renderRoot, styles) => {
  if (supportsAdoptingStyleSheets) {
    renderRoot.adoptedStyleSheets = styles.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  } else {
    styles.forEach((s) => {
      const style = document.createElement("style");
      const nonce = global["litNonce"];
      if (nonce !== undefined) {
        style.setAttribute("nonce", nonce);
      }
      style.textContent = s.cssText;
      renderRoot.appendChild(style);
    });
  }
};
var cssResultFromStyleSheet = (sheet) => {
  let cssText = "";
  for (const rule of sheet.cssRules) {
    cssText += rule.cssText;
  }
  return unsafeCSS(cssText);
};
var getCompatibleStyle = supportsAdoptingStyleSheets || NODE_MODE && global.CSSStyleSheet === undefined ? (s) => s : (s) => s instanceof CSSStyleSheet ? cssResultFromStyleSheet(s) : s;

// node_modules/@lit/reactive-element/development/reactive-element.js
var _a;
var _b;
var _c;
var _d;
var _e;
var NODE_MODE2 = false;
var global2 = NODE_MODE2 ? globalThis : window;
if (NODE_MODE2) {
  (_a = global2.customElements) !== null && _a !== undefined || (global2.customElements = customElements);
}
var DEV_MODE = true;
var requestUpdateThenable;
var issueWarning;
var trustedTypes = global2.trustedTypes;
var emptyStringForBooleanAttribute = trustedTypes ? trustedTypes.emptyScript : "";
var polyfillSupport = DEV_MODE ? global2.reactiveElementPolyfillSupportDevMode : global2.reactiveElementPolyfillSupport;
if (DEV_MODE) {
  const issuedWarnings = (_b = global2.litIssuedWarnings) !== null && _b !== undefined ? _b : global2.litIssuedWarnings = new Set;
  issueWarning = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!issuedWarnings.has(warning)) {
      console.warn(warning);
      issuedWarnings.add(warning);
    }
  };
  issueWarning("dev-mode", `Lit is in dev mode. Not recommended for production!`);
  if (((_c = global2.ShadyDOM) === null || _c === undefined ? undefined : _c.inUse) && polyfillSupport === undefined) {
    issueWarning("polyfill-support-missing", `Shadow DOM is being polyfilled via \`ShadyDOM\` but ` + `the \`polyfill-support\` module has not been loaded.`);
  }
  requestUpdateThenable = (name) => ({
    then: (onfulfilled, _onrejected) => {
      issueWarning("request-update-promise", `The \`requestUpdate\` method should no longer return a Promise but ` + `does so on \`${name}\`. Use \`updateComplete\` instead.`);
      if (onfulfilled !== undefined) {
        onfulfilled(false);
      }
    }
  });
}
var debugLogEvent = DEV_MODE ? (event) => {
  const shouldEmit = global2.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global2.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
} : undefined;
var JSCompiler_renameProperty = (prop, _obj) => prop;
var defaultConverter = {
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        value = value ? emptyStringForBooleanAttribute : null;
        break;
      case Object:
      case Array:
        value = value == null ? value : JSON.stringify(value);
        break;
    }
    return value;
  },
  fromAttribute(value, type) {
    let fromValue = value;
    switch (type) {
      case Boolean:
        fromValue = value !== null;
        break;
      case Number:
        fromValue = value === null ? null : Number(value);
        break;
      case Object:
      case Array:
        try {
          fromValue = JSON.parse(value);
        } catch (e) {
          fromValue = null;
        }
        break;
    }
    return fromValue;
  }
};
var notEqual = (value, old) => {
  return old !== value && (old === old || value === value);
};
var defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  hasChanged: notEqual
};
var finalized = "finalized";

class ReactiveElement extends HTMLElement {
  constructor() {
    super();
    this.__instanceProperties = new Map;
    this.isUpdatePending = false;
    this.hasUpdated = false;
    this.__reflectingProperty = null;
    this.__initialize();
  }
  static addInitializer(initializer) {
    var _a2;
    this.finalize();
    ((_a2 = this._initializers) !== null && _a2 !== undefined ? _a2 : this._initializers = []).push(initializer);
  }
  static get observedAttributes() {
    this.finalize();
    const attributes = [];
    this.elementProperties.forEach((v, p) => {
      const attr = this.__attributeNameForProperty(p, v);
      if (attr !== undefined) {
        this.__attributeToPropertyMap.set(attr, p);
        attributes.push(attr);
      }
    });
    return attributes;
  }
  static createProperty(name, options = defaultPropertyDeclaration) {
    var _a2;
    if (options.state) {
      options.attribute = false;
    }
    this.finalize();
    this.elementProperties.set(name, options);
    if (!options.noAccessor && !this.prototype.hasOwnProperty(name)) {
      const key = typeof name === "symbol" ? Symbol() : `__${name}`;
      const descriptor = this.getPropertyDescriptor(name, key, options);
      if (descriptor !== undefined) {
        Object.defineProperty(this.prototype, name, descriptor);
        if (DEV_MODE) {
          if (!this.hasOwnProperty("__reactivePropertyKeys")) {
            this.__reactivePropertyKeys = new Set((_a2 = this.__reactivePropertyKeys) !== null && _a2 !== undefined ? _a2 : []);
          }
          this.__reactivePropertyKeys.add(name);
        }
      }
    }
  }
  static getPropertyDescriptor(name, key, options) {
    return {
      get() {
        return this[key];
      },
      set(value) {
        const oldValue = this[name];
        this[key] = value;
        this.requestUpdate(name, oldValue, options);
      },
      configurable: true,
      enumerable: true
    };
  }
  static getPropertyOptions(name) {
    return this.elementProperties.get(name) || defaultPropertyDeclaration;
  }
  static finalize() {
    if (this.hasOwnProperty(finalized)) {
      return false;
    }
    this[finalized] = true;
    const superCtor = Object.getPrototypeOf(this);
    superCtor.finalize();
    if (superCtor._initializers !== undefined) {
      this._initializers = [...superCtor._initializers];
    }
    this.elementProperties = new Map(superCtor.elementProperties);
    this.__attributeToPropertyMap = new Map;
    if (this.hasOwnProperty(JSCompiler_renameProperty("properties", this))) {
      const props = this.properties;
      const propKeys = [
        ...Object.getOwnPropertyNames(props),
        ...Object.getOwnPropertySymbols(props)
      ];
      for (const p of propKeys) {
        this.createProperty(p, props[p]);
      }
    }
    this.elementStyles = this.finalizeStyles(this.styles);
    if (DEV_MODE) {
      const warnRemovedOrRenamed = (name, renamed = false) => {
        if (this.prototype.hasOwnProperty(name)) {
          issueWarning(renamed ? "renamed-api" : "removed-api", `\`${name}\` is implemented on class ${this.name}. It ` + `has been ${renamed ? "renamed" : "removed"} ` + `in this version of LitElement.`);
        }
      };
      warnRemovedOrRenamed("initialize");
      warnRemovedOrRenamed("requestUpdateInternal");
      warnRemovedOrRenamed("_getUpdateComplete", true);
    }
    return true;
  }
  static finalizeStyles(styles) {
    const elementStyles = [];
    if (Array.isArray(styles)) {
      const set = new Set(styles.flat(Infinity).reverse());
      for (const s of set) {
        elementStyles.unshift(getCompatibleStyle(s));
      }
    } else if (styles !== undefined) {
      elementStyles.push(getCompatibleStyle(styles));
    }
    return elementStyles;
  }
  static __attributeNameForProperty(name, options) {
    const attribute = options.attribute;
    return attribute === false ? undefined : typeof attribute === "string" ? attribute : typeof name === "string" ? name.toLowerCase() : undefined;
  }
  __initialize() {
    var _a2;
    this.__updatePromise = new Promise((res) => this.enableUpdating = res);
    this._$changedProperties = new Map;
    this.__saveInstanceProperties();
    this.requestUpdate();
    (_a2 = this.constructor._initializers) === null || _a2 === undefined || _a2.forEach((i) => i(this));
  }
  addController(controller) {
    var _a2, _b2;
    ((_a2 = this.__controllers) !== null && _a2 !== undefined ? _a2 : this.__controllers = []).push(controller);
    if (this.renderRoot !== undefined && this.isConnected) {
      (_b2 = controller.hostConnected) === null || _b2 === undefined || _b2.call(controller);
    }
  }
  removeController(controller) {
    var _a2;
    (_a2 = this.__controllers) === null || _a2 === undefined || _a2.splice(this.__controllers.indexOf(controller) >>> 0, 1);
  }
  __saveInstanceProperties() {
    this.constructor.elementProperties.forEach((_v, p) => {
      if (this.hasOwnProperty(p)) {
        this.__instanceProperties.set(p, this[p]);
        delete this[p];
      }
    });
  }
  createRenderRoot() {
    var _a2;
    const renderRoot = (_a2 = this.shadowRoot) !== null && _a2 !== undefined ? _a2 : this.attachShadow(this.constructor.shadowRootOptions);
    adoptStyles(renderRoot, this.constructor.elementStyles);
    return renderRoot;
  }
  connectedCallback() {
    var _a2;
    if (this.renderRoot === undefined) {
      this.renderRoot = this.createRenderRoot();
    }
    this.enableUpdating(true);
    (_a2 = this.__controllers) === null || _a2 === undefined || _a2.forEach((c) => {
      var _a3;
      return (_a3 = c.hostConnected) === null || _a3 === undefined ? undefined : _a3.call(c);
    });
  }
  enableUpdating(_requestedUpdate) {}
  disconnectedCallback() {
    var _a2;
    (_a2 = this.__controllers) === null || _a2 === undefined || _a2.forEach((c) => {
      var _a3;
      return (_a3 = c.hostDisconnected) === null || _a3 === undefined ? undefined : _a3.call(c);
    });
  }
  attributeChangedCallback(name, _old, value) {
    this._$attributeToProperty(name, value);
  }
  __propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
    var _a2;
    const attr = this.constructor.__attributeNameForProperty(name, options);
    if (attr !== undefined && options.reflect === true) {
      const converter = ((_a2 = options.converter) === null || _a2 === undefined ? undefined : _a2.toAttribute) !== undefined ? options.converter : defaultConverter;
      const attrValue = converter.toAttribute(value, options.type);
      if (DEV_MODE && this.constructor.enabledWarnings.indexOf("migration") >= 0 && attrValue === undefined) {
        issueWarning("undefined-attribute-value", `The attribute value for the ${name} property is ` + `undefined on element ${this.localName}. The attribute will be ` + `removed, but in the previous version of \`ReactiveElement\`, ` + `the attribute would not have changed.`);
      }
      this.__reflectingProperty = name;
      if (attrValue == null) {
        this.removeAttribute(attr);
      } else {
        this.setAttribute(attr, attrValue);
      }
      this.__reflectingProperty = null;
    }
  }
  _$attributeToProperty(name, value) {
    var _a2;
    const ctor = this.constructor;
    const propName = ctor.__attributeToPropertyMap.get(name);
    if (propName !== undefined && this.__reflectingProperty !== propName) {
      const options = ctor.getPropertyOptions(propName);
      const converter = typeof options.converter === "function" ? { fromAttribute: options.converter } : ((_a2 = options.converter) === null || _a2 === undefined ? undefined : _a2.fromAttribute) !== undefined ? options.converter : defaultConverter;
      this.__reflectingProperty = propName;
      this[propName] = converter.fromAttribute(value, options.type);
      this.__reflectingProperty = null;
    }
  }
  requestUpdate(name, oldValue, options) {
    let shouldRequestUpdate = true;
    if (name !== undefined) {
      options = options || this.constructor.getPropertyOptions(name);
      const hasChanged = options.hasChanged || notEqual;
      if (hasChanged(this[name], oldValue)) {
        if (!this._$changedProperties.has(name)) {
          this._$changedProperties.set(name, oldValue);
        }
        if (options.reflect === true && this.__reflectingProperty !== name) {
          if (this.__reflectingProperties === undefined) {
            this.__reflectingProperties = new Map;
          }
          this.__reflectingProperties.set(name, options);
        }
      } else {
        shouldRequestUpdate = false;
      }
    }
    if (!this.isUpdatePending && shouldRequestUpdate) {
      this.__updatePromise = this.__enqueueUpdate();
    }
    return DEV_MODE ? requestUpdateThenable(this.localName) : undefined;
  }
  async __enqueueUpdate() {
    this.isUpdatePending = true;
    try {
      await this.__updatePromise;
    } catch (e) {
      Promise.reject(e);
    }
    const result = this.scheduleUpdate();
    if (result != null) {
      await result;
    }
    return !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var _a2, _b2;
    if (!this.isUpdatePending) {
      return;
    }
    debugLogEvent === null || debugLogEvent === undefined || debugLogEvent({ kind: "update" });
    if (!this.hasUpdated) {
      if (DEV_MODE) {
        const shadowedProperties = [];
        (_a2 = this.constructor.__reactivePropertyKeys) === null || _a2 === undefined || _a2.forEach((p) => {
          var _a3;
          if (this.hasOwnProperty(p) && !((_a3 = this.__instanceProperties) === null || _a3 === undefined ? undefined : _a3.has(p))) {
            shadowedProperties.push(p);
          }
        });
        if (shadowedProperties.length) {
          throw new Error(`The following properties on element ${this.localName} will not ` + `trigger updates as expected because they are set using class ` + `fields: ${shadowedProperties.join(", ")}. ` + `Native class fields and some compiled output will overwrite ` + `accessors used for detecting changes. See ` + `https://lit.dev/msg/class-field-shadowing ` + `for more information.`);
        }
      }
    }
    if (this.__instanceProperties) {
      this.__instanceProperties.forEach((v, p) => this[p] = v);
      this.__instanceProperties = undefined;
    }
    let shouldUpdate = false;
    const changedProperties = this._$changedProperties;
    try {
      shouldUpdate = this.shouldUpdate(changedProperties);
      if (shouldUpdate) {
        this.willUpdate(changedProperties);
        (_b2 = this.__controllers) === null || _b2 === undefined || _b2.forEach((c) => {
          var _a3;
          return (_a3 = c.hostUpdate) === null || _a3 === undefined ? undefined : _a3.call(c);
        });
        this.update(changedProperties);
      } else {
        this.__markUpdated();
      }
    } catch (e) {
      shouldUpdate = false;
      this.__markUpdated();
      throw e;
    }
    if (shouldUpdate) {
      this._$didUpdate(changedProperties);
    }
  }
  willUpdate(_changedProperties) {}
  _$didUpdate(changedProperties) {
    var _a2;
    (_a2 = this.__controllers) === null || _a2 === undefined || _a2.forEach((c) => {
      var _a3;
      return (_a3 = c.hostUpdated) === null || _a3 === undefined ? undefined : _a3.call(c);
    });
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.firstUpdated(changedProperties);
    }
    this.updated(changedProperties);
    if (DEV_MODE && this.isUpdatePending && this.constructor.enabledWarnings.indexOf("change-in-update") >= 0) {
      issueWarning("change-in-update", `Element ${this.localName} scheduled an update ` + `(generally because a property was set) ` + `after an update completed, causing a new update to be scheduled. ` + `This is inefficient and should be avoided unless the next update ` + `can only be scheduled as a side effect of the previous update.`);
    }
  }
  __markUpdated() {
    this._$changedProperties = new Map;
    this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this.__updatePromise;
  }
  shouldUpdate(_changedProperties) {
    return true;
  }
  update(_changedProperties) {
    if (this.__reflectingProperties !== undefined) {
      this.__reflectingProperties.forEach((v, k) => this.__propertyToAttribute(k, this[k], v));
      this.__reflectingProperties = undefined;
    }
    this.__markUpdated();
  }
  updated(_changedProperties) {}
  firstUpdated(_changedProperties) {}
}
_e = finalized;
ReactiveElement[_e] = true;
ReactiveElement.elementProperties = new Map;
ReactiveElement.elementStyles = [];
ReactiveElement.shadowRootOptions = { mode: "open" };
polyfillSupport === null || polyfillSupport === undefined || polyfillSupport({ ReactiveElement });
if (DEV_MODE) {
  ReactiveElement.enabledWarnings = ["change-in-update"];
  const ensureOwnWarnings = function(ctor) {
    if (!ctor.hasOwnProperty(JSCompiler_renameProperty("enabledWarnings", ctor))) {
      ctor.enabledWarnings = ctor.enabledWarnings.slice();
    }
  };
  ReactiveElement.enableWarning = function(warning) {
    ensureOwnWarnings(this);
    if (this.enabledWarnings.indexOf(warning) < 0) {
      this.enabledWarnings.push(warning);
    }
  };
  ReactiveElement.disableWarning = function(warning) {
    ensureOwnWarnings(this);
    const i = this.enabledWarnings.indexOf(warning);
    if (i >= 0) {
      this.enabledWarnings.splice(i, 1);
    }
  };
}
((_d = global2.reactiveElementVersions) !== null && _d !== undefined ? _d : global2.reactiveElementVersions = []).push("1.6.3");
if (DEV_MODE && global2.reactiveElementVersions.length > 1) {
  issueWarning("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions ` + `is not recommended.`);
}

// node_modules/lit/node_modules/lit-html/development/lit-html.js
var _a2;
var _b2;
var _c2;
var _d2;
var DEV_MODE2 = true;
var ENABLE_EXTRA_SECURITY_HOOKS = true;
var ENABLE_SHADYDOM_NOPATCH = true;
var NODE_MODE3 = false;
var global3 = NODE_MODE3 ? globalThis : window;
var debugLogEvent2 = DEV_MODE2 ? (event) => {
  const shouldEmit = global3.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global3.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
} : undefined;
var debugLogRenderId = 0;
var issueWarning2;
if (DEV_MODE2) {
  (_a2 = global3.litIssuedWarnings) !== null && _a2 !== undefined || (global3.litIssuedWarnings = new Set);
  issueWarning2 = (code, warning) => {
    warning += code ? ` See https://lit.dev/msg/${code} for more information.` : "";
    if (!global3.litIssuedWarnings.has(warning)) {
      console.warn(warning);
      global3.litIssuedWarnings.add(warning);
    }
  };
  issueWarning2("dev-mode", `Lit is in dev mode. Not recommended for production!`);
}
var wrap = ENABLE_SHADYDOM_NOPATCH && ((_b2 = global3.ShadyDOM) === null || _b2 === undefined ? undefined : _b2.inUse) && ((_c2 = global3.ShadyDOM) === null || _c2 === undefined ? undefined : _c2.noPatch) === true ? global3.ShadyDOM.wrap : (node) => node;
var trustedTypes2 = global3.trustedTypes;
var policy = trustedTypes2 ? trustedTypes2.createPolicy("lit-html", {
  createHTML: (s) => s
}) : undefined;
var identityFunction = (value) => value;
var noopSanitizer = (_node, _name, _type) => identityFunction;
var setSanitizer = (newSanitizer) => {
  if (!ENABLE_EXTRA_SECURITY_HOOKS) {
    return;
  }
  if (sanitizerFactoryInternal !== noopSanitizer) {
    throw new Error(`Attempted to overwrite existing lit-html security policy.` + ` setSanitizeDOMValueFactory should be called at most once.`);
  }
  sanitizerFactoryInternal = newSanitizer;
};
var _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
  sanitizerFactoryInternal = noopSanitizer;
};
var createSanitizer = (node, name, type) => {
  return sanitizerFactoryInternal(node, name, type);
};
var boundAttributeSuffix = "$lit$";
var marker = `lit$${String(Math.random()).slice(9)}$`;
var markerMatch = "?" + marker;
var nodeMarker = `<${markerMatch}>`;
var d = NODE_MODE3 && global3.document === undefined ? {
  createTreeWalker() {
    return {};
  }
} : document;
var createMarker = () => d.createComment("");
var isPrimitive = (value) => value === null || typeof value != "object" && typeof value != "function";
var isArray = Array.isArray;
var isIterable = (value) => isArray(value) || typeof (value === null || value === undefined ? undefined : value[Symbol.iterator]) === "function";
var SPACE_CHAR = `[ 	
\f\r]`;
var ATTR_VALUE_CHAR = `[^ 	
\f\r"'\`<>=]`;
var NAME_CHAR = `[^\\s"'>=/]`;
var textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var COMMENT_START = 1;
var TAG_NAME = 2;
var DYNAMIC_TAG_NAME = 3;
var commentEndRegex = /-->/g;
var comment2EndRegex = />/g;
var tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, "g");
var ENTIRE_MATCH = 0;
var ATTRIBUTE_NAME = 1;
var SPACES_AND_EQUALS = 2;
var QUOTE_CHAR = 3;
var singleQuoteAttrEndRegex = /'/g;
var doubleQuoteAttrEndRegex = /"/g;
var rawTextElement = /^(?:script|style|textarea|title)$/i;
var HTML_RESULT = 1;
var SVG_RESULT = 2;
var ATTRIBUTE_PART = 1;
var CHILD_PART = 2;
var PROPERTY_PART = 3;
var BOOLEAN_ATTRIBUTE_PART = 4;
var EVENT_PART = 5;
var ELEMENT_PART = 6;
var COMMENT_PART = 7;
var tag = (type) => (strings, ...values) => {
  if (DEV_MODE2 && strings.some((s) => s === undefined)) {
    console.warn(`Some template strings are undefined.
` + "This is probably caused by illegal octal escape sequences.");
  }
  return {
    ["_$litType$"]: type,
    strings,
    values
  };
};
var html = tag(HTML_RESULT);
var svg = tag(SVG_RESULT);
var noChange = Symbol.for("lit-noChange");
var nothing = Symbol.for("lit-nothing");
var templateCache = new WeakMap;
var walker = d.createTreeWalker(d, 129, null, false);
var sanitizerFactoryInternal = noopSanitizer;
function trustFromTemplateString(tsa, stringFromTSA) {
  if (!Array.isArray(tsa) || !tsa.hasOwnProperty("raw")) {
    let message = "invalid template strings array";
    if (DEV_MODE2) {
      message = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g, `
`);
    }
    throw new Error(message);
  }
  return policy !== undefined ? policy.createHTML(stringFromTSA) : stringFromTSA;
}
var getTemplateHtml = (strings, type) => {
  const l = strings.length - 1;
  const attrNames = [];
  let html2 = type === SVG_RESULT ? "<svg>" : "";
  let rawTextEndRegex;
  let regex = textEndRegex;
  for (let i = 0;i < l; i++) {
    const s = strings[i];
    let attrNameEndIndex = -1;
    let attrName;
    let lastIndex = 0;
    let match;
    while (lastIndex < s.length) {
      regex.lastIndex = lastIndex;
      match = regex.exec(s);
      if (match === null) {
        break;
      }
      lastIndex = regex.lastIndex;
      if (regex === textEndRegex) {
        if (match[COMMENT_START] === "!--") {
          regex = commentEndRegex;
        } else if (match[COMMENT_START] !== undefined) {
          regex = comment2EndRegex;
        } else if (match[TAG_NAME] !== undefined) {
          if (rawTextElement.test(match[TAG_NAME])) {
            rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, "g");
          }
          regex = tagEndRegex;
        } else if (match[DYNAMIC_TAG_NAME] !== undefined) {
          if (DEV_MODE2) {
            throw new Error("Bindings in tag names are not supported. Please use static templates instead. " + "See https://lit.dev/docs/templates/expressions/#static-expressions");
          }
          regex = tagEndRegex;
        }
      } else if (regex === tagEndRegex) {
        if (match[ENTIRE_MATCH] === ">") {
          regex = rawTextEndRegex !== null && rawTextEndRegex !== undefined ? rawTextEndRegex : textEndRegex;
          attrNameEndIndex = -1;
        } else if (match[ATTRIBUTE_NAME] === undefined) {
          attrNameEndIndex = -2;
        } else {
          attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
          attrName = match[ATTRIBUTE_NAME];
          regex = match[QUOTE_CHAR] === undefined ? tagEndRegex : match[QUOTE_CHAR] === '"' ? doubleQuoteAttrEndRegex : singleQuoteAttrEndRegex;
        }
      } else if (regex === doubleQuoteAttrEndRegex || regex === singleQuoteAttrEndRegex) {
        regex = tagEndRegex;
      } else if (regex === commentEndRegex || regex === comment2EndRegex) {
        regex = textEndRegex;
      } else {
        regex = tagEndRegex;
        rawTextEndRegex = undefined;
      }
    }
    if (DEV_MODE2) {
      console.assert(attrNameEndIndex === -1 || regex === tagEndRegex || regex === singleQuoteAttrEndRegex || regex === doubleQuoteAttrEndRegex, "unexpected parse state B");
    }
    const end = regex === tagEndRegex && strings[i + 1].startsWith("/>") ? " " : "";
    html2 += regex === textEndRegex ? s + nodeMarker : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s.slice(0, attrNameEndIndex) + boundAttributeSuffix + s.slice(attrNameEndIndex)) + marker + end : s + marker + (attrNameEndIndex === -2 ? (attrNames.push(undefined), i) : end);
  }
  const htmlResult = html2 + (strings[l] || "<?>") + (type === SVG_RESULT ? "</svg>" : "");
  return [trustFromTemplateString(strings, htmlResult), attrNames];
};

class Template {
  constructor({ strings, ["_$litType$"]: type }, options) {
    this.parts = [];
    let node;
    let nodeIndex = 0;
    let attrNameIndex = 0;
    const partCount = strings.length - 1;
    const parts = this.parts;
    const [html2, attrNames] = getTemplateHtml(strings, type);
    this.el = Template.createElement(html2, options);
    walker.currentNode = this.el.content;
    if (type === SVG_RESULT) {
      const content = this.el.content;
      const svgElement = content.firstChild;
      svgElement.remove();
      content.append(...svgElement.childNodes);
    }
    while ((node = walker.nextNode()) !== null && parts.length < partCount) {
      if (node.nodeType === 1) {
        if (DEV_MODE2) {
          const tag2 = node.localName;
          if (/^(?:textarea|template)$/i.test(tag2) && node.innerHTML.includes(marker)) {
            const m = `Expressions are not supported inside \`${tag2}\` ` + `elements. See https://lit.dev/msg/expression-in-${tag2} for more ` + `information.`;
            if (tag2 === "template") {
              throw new Error(m);
            } else
              issueWarning2("", m);
          }
        }
        if (node.hasAttributes()) {
          const attrsToRemove = [];
          for (const name of node.getAttributeNames()) {
            if (name.endsWith(boundAttributeSuffix) || name.startsWith(marker)) {
              const realName = attrNames[attrNameIndex++];
              attrsToRemove.push(name);
              if (realName !== undefined) {
                const value = node.getAttribute(realName.toLowerCase() + boundAttributeSuffix);
                const statics = value.split(marker);
                const m = /([.?@])?(.*)/.exec(realName);
                parts.push({
                  type: ATTRIBUTE_PART,
                  index: nodeIndex,
                  name: m[2],
                  strings: statics,
                  ctor: m[1] === "." ? PropertyPart : m[1] === "?" ? BooleanAttributePart : m[1] === "@" ? EventPart : AttributePart
                });
              } else {
                parts.push({
                  type: ELEMENT_PART,
                  index: nodeIndex
                });
              }
            }
          }
          for (const name of attrsToRemove) {
            node.removeAttribute(name);
          }
        }
        if (rawTextElement.test(node.tagName)) {
          const strings2 = node.textContent.split(marker);
          const lastIndex = strings2.length - 1;
          if (lastIndex > 0) {
            node.textContent = trustedTypes2 ? trustedTypes2.emptyScript : "";
            for (let i = 0;i < lastIndex; i++) {
              node.append(strings2[i], createMarker());
              walker.nextNode();
              parts.push({ type: CHILD_PART, index: ++nodeIndex });
            }
            node.append(strings2[lastIndex], createMarker());
          }
        }
      } else if (node.nodeType === 8) {
        const data = node.data;
        if (data === markerMatch) {
          parts.push({ type: CHILD_PART, index: nodeIndex });
        } else {
          let i = -1;
          while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
            parts.push({ type: COMMENT_PART, index: nodeIndex });
            i += marker.length - 1;
          }
        }
      }
      nodeIndex++;
    }
    debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
      kind: "template prep",
      template: this,
      clonableTemplate: this.el,
      parts: this.parts,
      strings
    });
  }
  static createElement(html2, _options) {
    const el = d.createElement("template");
    el.innerHTML = html2;
    return el;
  }
}
function resolveDirective(part, value, parent = part, attributeIndex) {
  var _a3, _b3, _c3;
  var _d3;
  if (value === noChange) {
    return value;
  }
  let currentDirective = attributeIndex !== undefined ? (_a3 = parent.__directives) === null || _a3 === undefined ? undefined : _a3[attributeIndex] : parent.__directive;
  const nextDirectiveConstructor = isPrimitive(value) ? undefined : value["_$litDirective$"];
  if ((currentDirective === null || currentDirective === undefined ? undefined : currentDirective.constructor) !== nextDirectiveConstructor) {
    (_b3 = currentDirective === null || currentDirective === undefined ? undefined : currentDirective["_$notifyDirectiveConnectionChanged"]) === null || _b3 === undefined || _b3.call(currentDirective, false);
    if (nextDirectiveConstructor === undefined) {
      currentDirective = undefined;
    } else {
      currentDirective = new nextDirectiveConstructor(part);
      currentDirective._$initialize(part, parent, attributeIndex);
    }
    if (attributeIndex !== undefined) {
      ((_c3 = (_d3 = parent).__directives) !== null && _c3 !== undefined ? _c3 : _d3.__directives = [])[attributeIndex] = currentDirective;
    } else {
      parent.__directive = currentDirective;
    }
  }
  if (currentDirective !== undefined) {
    value = resolveDirective(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
  }
  return value;
}

class TemplateInstance {
  constructor(template, parent) {
    this._$parts = [];
    this._$disconnectableChildren = undefined;
    this._$template = template;
    this._$parent = parent;
  }
  get parentNode() {
    return this._$parent.parentNode;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _clone(options) {
    var _a3;
    const { el: { content }, parts } = this._$template;
    const fragment = ((_a3 = options === null || options === undefined ? undefined : options.creationScope) !== null && _a3 !== undefined ? _a3 : d).importNode(content, true);
    walker.currentNode = fragment;
    let node = walker.nextNode();
    let nodeIndex = 0;
    let partIndex = 0;
    let templatePart = parts[0];
    while (templatePart !== undefined) {
      if (nodeIndex === templatePart.index) {
        let part;
        if (templatePart.type === CHILD_PART) {
          part = new ChildPart(node, node.nextSibling, this, options);
        } else if (templatePart.type === ATTRIBUTE_PART) {
          part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
        } else if (templatePart.type === ELEMENT_PART) {
          part = new ElementPart(node, this, options);
        }
        this._$parts.push(part);
        templatePart = parts[++partIndex];
      }
      if (nodeIndex !== (templatePart === null || templatePart === undefined ? undefined : templatePart.index)) {
        node = walker.nextNode();
        nodeIndex++;
      }
    }
    walker.currentNode = d;
    return fragment;
  }
  _update(values) {
    let i = 0;
    for (const part of this._$parts) {
      if (part !== undefined) {
        debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
          kind: "set part",
          part,
          value: values[i],
          valueIndex: i,
          values,
          templateInstance: this
        });
        if (part.strings !== undefined) {
          part._$setValue(values, part, i);
          i += part.strings.length - 2;
        } else {
          part._$setValue(values[i]);
        }
      }
      i++;
    }
  }
}

class ChildPart {
  constructor(startNode, endNode, parent, options) {
    var _a3;
    this.type = CHILD_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = undefined;
    this._$startNode = startNode;
    this._$endNode = endNode;
    this._$parent = parent;
    this.options = options;
    this.__isConnected = (_a3 = options === null || options === undefined ? undefined : options.isConnected) !== null && _a3 !== undefined ? _a3 : true;
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      this._textSanitizer = undefined;
    }
  }
  get _$isConnected() {
    var _a3, _b3;
    return (_b3 = (_a3 = this._$parent) === null || _a3 === undefined ? undefined : _a3._$isConnected) !== null && _b3 !== undefined ? _b3 : this.__isConnected;
  }
  get parentNode() {
    let parentNode = wrap(this._$startNode).parentNode;
    const parent = this._$parent;
    if (parent !== undefined && (parentNode === null || parentNode === undefined ? undefined : parentNode.nodeType) === 11) {
      parentNode = parent.parentNode;
    }
    return parentNode;
  }
  get startNode() {
    return this._$startNode;
  }
  get endNode() {
    return this._$endNode;
  }
  _$setValue(value, directiveParent = this) {
    var _a3;
    if (DEV_MODE2 && this.parentNode === null) {
      throw new Error(`This \`ChildPart\` has no \`parentNode\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \`innerHTML\` or \`textContent\` can do this.`);
    }
    value = resolveDirective(this, value, directiveParent);
    if (isPrimitive(value)) {
      if (value === nothing || value == null || value === "") {
        if (this._$committedValue !== nothing) {
          debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
            kind: "commit nothing to child",
            start: this._$startNode,
            end: this._$endNode,
            parent: this._$parent,
            options: this.options
          });
          this._$clear();
        }
        this._$committedValue = nothing;
      } else if (value !== this._$committedValue && value !== noChange) {
        this._commitText(value);
      }
    } else if (value["_$litType$"] !== undefined) {
      this._commitTemplateResult(value);
    } else if (value.nodeType !== undefined) {
      if (DEV_MODE2 && ((_a3 = this.options) === null || _a3 === undefined ? undefined : _a3.host) === value) {
        this._commitText(`[probable mistake: rendered a template's host in itself ` + `(commonly caused by writing \${this} in a template]`);
        console.warn(`Attempted to render the template host`, value, `inside itself. This is almost always a mistake, and in dev mode `, `we render some warning text. In production however, we'll `, `render it, which will usually result in an error, and sometimes `, `in the element disappearing from the DOM.`);
        return;
      }
      this._commitNode(value);
    } else if (isIterable(value)) {
      this._commitIterable(value);
    } else {
      this._commitText(value);
    }
  }
  _insert(node) {
    return wrap(wrap(this._$startNode).parentNode).insertBefore(node, this._$endNode);
  }
  _commitNode(value) {
    var _a3;
    if (this._$committedValue !== value) {
      this._$clear();
      if (ENABLE_EXTRA_SECURITY_HOOKS && sanitizerFactoryInternal !== noopSanitizer) {
        const parentNodeName = (_a3 = this._$startNode.parentNode) === null || _a3 === undefined ? undefined : _a3.nodeName;
        if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
          let message = "Forbidden";
          if (DEV_MODE2) {
            if (parentNodeName === "STYLE") {
              message = `Lit does not support binding inside style nodes. ` + `This is a security risk, as style injection attacks can ` + `exfiltrate data and spoof UIs. ` + `Consider instead using css\`...\` literals ` + `to compose styles, and make do dynamic styling with ` + `css custom properties, ::parts, <slot>s, ` + `and by mutating the DOM rather than stylesheets.`;
            } else {
              message = `Lit does not support binding inside script nodes. ` + `This is a security risk, as it could allow arbitrary ` + `code execution.`;
            }
          }
          throw new Error(message);
        }
      }
      debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
        kind: "commit node",
        start: this._$startNode,
        parent: this._$parent,
        value,
        options: this.options
      });
      this._$committedValue = this._insert(value);
    }
  }
  _commitText(value) {
    if (this._$committedValue !== nothing && isPrimitive(this._$committedValue)) {
      const node = wrap(this._$startNode).nextSibling;
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer(node, "data", "property");
        }
        value = this._textSanitizer(value);
      }
      debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
        kind: "commit text",
        node,
        value,
        options: this.options
      });
      node.data = value;
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        const textNode = d.createTextNode("");
        this._commitNode(textNode);
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer(textNode, "data", "property");
        }
        value = this._textSanitizer(value);
        debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
          kind: "commit text",
          node: textNode,
          value,
          options: this.options
        });
        textNode.data = value;
      } else {
        this._commitNode(d.createTextNode(value));
        debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
          kind: "commit text",
          node: wrap(this._$startNode).nextSibling,
          value,
          options: this.options
        });
      }
    }
    this._$committedValue = value;
  }
  _commitTemplateResult(result) {
    var _a3;
    const { values, ["_$litType$"]: type } = result;
    const template = typeof type === "number" ? this._$getTemplate(result) : (type.el === undefined && (type.el = Template.createElement(trustFromTemplateString(type.h, type.h[0]), this.options)), type);
    if (((_a3 = this._$committedValue) === null || _a3 === undefined ? undefined : _a3._$template) === template) {
      debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
        kind: "template updating",
        template,
        instance: this._$committedValue,
        parts: this._$committedValue._$parts,
        options: this.options,
        values
      });
      this._$committedValue._update(values);
    } else {
      const instance = new TemplateInstance(template, this);
      const fragment = instance._clone(this.options);
      debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
        kind: "template instantiated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      instance._update(values);
      debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
        kind: "template instantiated and updated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      this._commitNode(fragment);
      this._$committedValue = instance;
    }
  }
  _$getTemplate(result) {
    let template = templateCache.get(result.strings);
    if (template === undefined) {
      templateCache.set(result.strings, template = new Template(result));
    }
    return template;
  }
  _commitIterable(value) {
    if (!isArray(this._$committedValue)) {
      this._$committedValue = [];
      this._$clear();
    }
    const itemParts = this._$committedValue;
    let partIndex = 0;
    let itemPart;
    for (const item of value) {
      if (partIndex === itemParts.length) {
        itemParts.push(itemPart = new ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options));
      } else {
        itemPart = itemParts[partIndex];
      }
      itemPart._$setValue(item);
      partIndex++;
    }
    if (partIndex < itemParts.length) {
      this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
      itemParts.length = partIndex;
    }
  }
  _$clear(start = wrap(this._$startNode).nextSibling, from) {
    var _a3;
    (_a3 = this._$notifyConnectionChanged) === null || _a3 === undefined || _a3.call(this, false, true, from);
    while (start && start !== this._$endNode) {
      const n = wrap(start).nextSibling;
      wrap(start).remove();
      start = n;
    }
  }
  setConnected(isConnected) {
    var _a3;
    if (this._$parent === undefined) {
      this.__isConnected = isConnected;
      (_a3 = this._$notifyConnectionChanged) === null || _a3 === undefined || _a3.call(this, isConnected);
    } else if (DEV_MODE2) {
      throw new Error("part.setConnected() may only be called on a " + "RootPart returned from render().");
    }
  }
}

class AttributePart {
  constructor(element, name, strings, parent, options) {
    this.type = ATTRIBUTE_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = undefined;
    this.element = element;
    this.name = name;
    this._$parent = parent;
    this.options = options;
    if (strings.length > 2 || strings[0] !== "" || strings[1] !== "") {
      this._$committedValue = new Array(strings.length - 1).fill(new String);
      this.strings = strings;
    } else {
      this._$committedValue = nothing;
    }
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      this._sanitizer = undefined;
    }
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(value, directiveParent = this, valueIndex, noCommit) {
    const strings = this.strings;
    let change = false;
    if (strings === undefined) {
      value = resolveDirective(this, value, directiveParent, 0);
      change = !isPrimitive(value) || value !== this._$committedValue && value !== noChange;
      if (change) {
        this._$committedValue = value;
      }
    } else {
      const values = value;
      value = strings[0];
      let i, v;
      for (i = 0;i < strings.length - 1; i++) {
        v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
        if (v === noChange) {
          v = this._$committedValue[i];
        }
        change || (change = !isPrimitive(v) || v !== this._$committedValue[i]);
        if (v === nothing) {
          value = nothing;
        } else if (value !== nothing) {
          value += (v !== null && v !== undefined ? v : "") + strings[i + 1];
        }
        this._$committedValue[i] = v;
      }
    }
    if (change && !noCommit) {
      this._commitValue(value);
    }
  }
  _commitValue(value) {
    if (value === nothing) {
      wrap(this.element).removeAttribute(this.name);
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        if (this._sanitizer === undefined) {
          this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "attribute");
        }
        value = this._sanitizer(value !== null && value !== undefined ? value : "");
      }
      debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
        kind: "commit attribute",
        element: this.element,
        name: this.name,
        value,
        options: this.options
      });
      wrap(this.element).setAttribute(this.name, value !== null && value !== undefined ? value : "");
    }
  }
}

class PropertyPart extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = PROPERTY_PART;
  }
  _commitValue(value) {
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      if (this._sanitizer === undefined) {
        this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "property");
      }
      value = this._sanitizer(value);
    }
    debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
      kind: "commit property",
      element: this.element,
      name: this.name,
      value,
      options: this.options
    });
    this.element[this.name] = value === nothing ? undefined : value;
  }
}
var emptyStringForBooleanAttribute2 = trustedTypes2 ? trustedTypes2.emptyScript : "";

class BooleanAttributePart extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = BOOLEAN_ATTRIBUTE_PART;
  }
  _commitValue(value) {
    debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
      kind: "commit boolean attribute",
      element: this.element,
      name: this.name,
      value: !!(value && value !== nothing),
      options: this.options
    });
    if (value && value !== nothing) {
      wrap(this.element).setAttribute(this.name, emptyStringForBooleanAttribute2);
    } else {
      wrap(this.element).removeAttribute(this.name);
    }
  }
}

class EventPart extends AttributePart {
  constructor(element, name, strings, parent, options) {
    super(element, name, strings, parent, options);
    this.type = EVENT_PART;
    if (DEV_MODE2 && this.strings !== undefined) {
      throw new Error(`A \`<${element.localName}>\` has a \`@${name}=...\` listener with ` + "invalid content. Event listeners in templates must have exactly " + "one expression and no surrounding text.");
    }
  }
  _$setValue(newListener, directiveParent = this) {
    var _a3;
    newListener = (_a3 = resolveDirective(this, newListener, directiveParent, 0)) !== null && _a3 !== undefined ? _a3 : nothing;
    if (newListener === noChange) {
      return;
    }
    const oldListener = this._$committedValue;
    const shouldRemoveListener = newListener === nothing && oldListener !== nothing || newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive;
    const shouldAddListener = newListener !== nothing && (oldListener === nothing || shouldRemoveListener);
    debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
      kind: "commit event listener",
      element: this.element,
      name: this.name,
      value: newListener,
      options: this.options,
      removeListener: shouldRemoveListener,
      addListener: shouldAddListener,
      oldListener
    });
    if (shouldRemoveListener) {
      this.element.removeEventListener(this.name, this, oldListener);
    }
    if (shouldAddListener) {
      this.element.addEventListener(this.name, this, newListener);
    }
    this._$committedValue = newListener;
  }
  handleEvent(event) {
    var _a3, _b3;
    if (typeof this._$committedValue === "function") {
      this._$committedValue.call((_b3 = (_a3 = this.options) === null || _a3 === undefined ? undefined : _a3.host) !== null && _b3 !== undefined ? _b3 : this.element, event);
    } else {
      this._$committedValue.handleEvent(event);
    }
  }
}

class ElementPart {
  constructor(element, parent, options) {
    this.element = element;
    this.type = ELEMENT_PART;
    this._$disconnectableChildren = undefined;
    this._$parent = parent;
    this.options = options;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(value) {
    debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
      kind: "commit to element binding",
      element: this.element,
      value,
      options: this.options
    });
    resolveDirective(this, value);
  }
}
var polyfillSupport2 = DEV_MODE2 ? global3.litHtmlPolyfillSupportDevMode : global3.litHtmlPolyfillSupport;
polyfillSupport2 === null || polyfillSupport2 === undefined || polyfillSupport2(Template, ChildPart);
((_d2 = global3.litHtmlVersions) !== null && _d2 !== undefined ? _d2 : global3.litHtmlVersions = []).push("2.8.0");
if (DEV_MODE2 && global3.litHtmlVersions.length > 1) {
  issueWarning2("multiple-versions", `Multiple versions of Lit loaded. ` + `Loading multiple versions is not recommended.`);
}
var render = (value, container, options) => {
  var _a3, _b3;
  if (DEV_MODE2 && container == null) {
    throw new TypeError(`The container to render into may not be ${container}`);
  }
  const renderId = DEV_MODE2 ? debugLogRenderId++ : 0;
  const partOwnerNode = (_a3 = options === null || options === undefined ? undefined : options.renderBefore) !== null && _a3 !== undefined ? _a3 : container;
  let part = partOwnerNode["_$litPart$"];
  debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
    kind: "begin render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  if (part === undefined) {
    const endNode = (_b3 = options === null || options === undefined ? undefined : options.renderBefore) !== null && _b3 !== undefined ? _b3 : null;
    partOwnerNode["_$litPart$"] = part = new ChildPart(container.insertBefore(createMarker(), endNode), endNode, undefined, options !== null && options !== undefined ? options : {});
  }
  part._$setValue(value);
  debugLogEvent2 === null || debugLogEvent2 === undefined || debugLogEvent2({
    kind: "end render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  return part;
};
if (ENABLE_EXTRA_SECURITY_HOOKS) {
  render.setSanitizer = setSanitizer;
  render.createSanitizer = createSanitizer;
  if (DEV_MODE2) {
    render._testOnlyClearSanitizerFactoryDoNotCallOrElse = _testOnlyClearSanitizerFactoryDoNotCallOrElse;
  }
}

// node_modules/lit-element/node_modules/lit-html/development/lit-html.js
var _a3;
var _b3;
var _c3;
var _d3;
var DEV_MODE3 = true;
var ENABLE_EXTRA_SECURITY_HOOKS2 = true;
var ENABLE_SHADYDOM_NOPATCH2 = true;
var NODE_MODE4 = false;
var global4 = NODE_MODE4 ? globalThis : window;
var debugLogEvent3 = DEV_MODE3 ? (event) => {
  const shouldEmit = global4.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global4.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
} : undefined;
var debugLogRenderId2 = 0;
var issueWarning3;
if (DEV_MODE3) {
  (_a3 = global4.litIssuedWarnings) !== null && _a3 !== undefined || (global4.litIssuedWarnings = new Set);
  issueWarning3 = (code, warning) => {
    warning += code ? ` See https://lit.dev/msg/${code} for more information.` : "";
    if (!global4.litIssuedWarnings.has(warning)) {
      console.warn(warning);
      global4.litIssuedWarnings.add(warning);
    }
  };
  issueWarning3("dev-mode", `Lit is in dev mode. Not recommended for production!`);
}
var wrap2 = ENABLE_SHADYDOM_NOPATCH2 && ((_b3 = global4.ShadyDOM) === null || _b3 === undefined ? undefined : _b3.inUse) && ((_c3 = global4.ShadyDOM) === null || _c3 === undefined ? undefined : _c3.noPatch) === true ? global4.ShadyDOM.wrap : (node) => node;
var trustedTypes3 = global4.trustedTypes;
var policy2 = trustedTypes3 ? trustedTypes3.createPolicy("lit-html", {
  createHTML: (s) => s
}) : undefined;
var identityFunction2 = (value) => value;
var noopSanitizer2 = (_node, _name, _type) => identityFunction2;
var setSanitizer2 = (newSanitizer) => {
  if (!ENABLE_EXTRA_SECURITY_HOOKS2) {
    return;
  }
  if (sanitizerFactoryInternal2 !== noopSanitizer2) {
    throw new Error(`Attempted to overwrite existing lit-html security policy.` + ` setSanitizeDOMValueFactory should be called at most once.`);
  }
  sanitizerFactoryInternal2 = newSanitizer;
};
var _testOnlyClearSanitizerFactoryDoNotCallOrElse2 = () => {
  sanitizerFactoryInternal2 = noopSanitizer2;
};
var createSanitizer2 = (node, name, type) => {
  return sanitizerFactoryInternal2(node, name, type);
};
var boundAttributeSuffix2 = "$lit$";
var marker2 = `lit$${String(Math.random()).slice(9)}$`;
var markerMatch2 = "?" + marker2;
var nodeMarker2 = `<${markerMatch2}>`;
var d2 = NODE_MODE4 && global4.document === undefined ? {
  createTreeWalker() {
    return {};
  }
} : document;
var createMarker2 = () => d2.createComment("");
var isPrimitive2 = (value) => value === null || typeof value != "object" && typeof value != "function";
var isArray2 = Array.isArray;
var isIterable2 = (value) => isArray2(value) || typeof (value === null || value === undefined ? undefined : value[Symbol.iterator]) === "function";
var SPACE_CHAR2 = `[ 	
\f\r]`;
var ATTR_VALUE_CHAR2 = `[^ 	
\f\r"'\`<>=]`;
var NAME_CHAR2 = `[^\\s"'>=/]`;
var textEndRegex2 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var COMMENT_START2 = 1;
var TAG_NAME2 = 2;
var DYNAMIC_TAG_NAME2 = 3;
var commentEndRegex2 = /-->/g;
var comment2EndRegex2 = />/g;
var tagEndRegex2 = new RegExp(`>|${SPACE_CHAR2}(?:(${NAME_CHAR2}+)(${SPACE_CHAR2}*=${SPACE_CHAR2}*(?:${ATTR_VALUE_CHAR2}|("|')|))|$)`, "g");
var ENTIRE_MATCH2 = 0;
var ATTRIBUTE_NAME2 = 1;
var SPACES_AND_EQUALS2 = 2;
var QUOTE_CHAR2 = 3;
var singleQuoteAttrEndRegex2 = /'/g;
var doubleQuoteAttrEndRegex2 = /"/g;
var rawTextElement2 = /^(?:script|style|textarea|title)$/i;
var HTML_RESULT2 = 1;
var SVG_RESULT2 = 2;
var ATTRIBUTE_PART2 = 1;
var CHILD_PART2 = 2;
var PROPERTY_PART2 = 3;
var BOOLEAN_ATTRIBUTE_PART2 = 4;
var EVENT_PART2 = 5;
var ELEMENT_PART2 = 6;
var COMMENT_PART2 = 7;
var tag2 = (type) => (strings, ...values) => {
  if (DEV_MODE3 && strings.some((s) => s === undefined)) {
    console.warn(`Some template strings are undefined.
` + "This is probably caused by illegal octal escape sequences.");
  }
  return {
    ["_$litType$"]: type,
    strings,
    values
  };
};
var html2 = tag2(HTML_RESULT2);
var svg2 = tag2(SVG_RESULT2);
var noChange2 = Symbol.for("lit-noChange");
var nothing2 = Symbol.for("lit-nothing");
var templateCache2 = new WeakMap;
var walker2 = d2.createTreeWalker(d2, 129, null, false);
var sanitizerFactoryInternal2 = noopSanitizer2;
function trustFromTemplateString2(tsa, stringFromTSA) {
  if (!Array.isArray(tsa) || !tsa.hasOwnProperty("raw")) {
    let message = "invalid template strings array";
    if (DEV_MODE3) {
      message = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g, `
`);
    }
    throw new Error(message);
  }
  return policy2 !== undefined ? policy2.createHTML(stringFromTSA) : stringFromTSA;
}
var getTemplateHtml2 = (strings, type) => {
  const l = strings.length - 1;
  const attrNames = [];
  let html3 = type === SVG_RESULT2 ? "<svg>" : "";
  let rawTextEndRegex;
  let regex = textEndRegex2;
  for (let i = 0;i < l; i++) {
    const s = strings[i];
    let attrNameEndIndex = -1;
    let attrName;
    let lastIndex = 0;
    let match;
    while (lastIndex < s.length) {
      regex.lastIndex = lastIndex;
      match = regex.exec(s);
      if (match === null) {
        break;
      }
      lastIndex = regex.lastIndex;
      if (regex === textEndRegex2) {
        if (match[COMMENT_START2] === "!--") {
          regex = commentEndRegex2;
        } else if (match[COMMENT_START2] !== undefined) {
          regex = comment2EndRegex2;
        } else if (match[TAG_NAME2] !== undefined) {
          if (rawTextElement2.test(match[TAG_NAME2])) {
            rawTextEndRegex = new RegExp(`</${match[TAG_NAME2]}`, "g");
          }
          regex = tagEndRegex2;
        } else if (match[DYNAMIC_TAG_NAME2] !== undefined) {
          if (DEV_MODE3) {
            throw new Error("Bindings in tag names are not supported. Please use static templates instead. " + "See https://lit.dev/docs/templates/expressions/#static-expressions");
          }
          regex = tagEndRegex2;
        }
      } else if (regex === tagEndRegex2) {
        if (match[ENTIRE_MATCH2] === ">") {
          regex = rawTextEndRegex !== null && rawTextEndRegex !== undefined ? rawTextEndRegex : textEndRegex2;
          attrNameEndIndex = -1;
        } else if (match[ATTRIBUTE_NAME2] === undefined) {
          attrNameEndIndex = -2;
        } else {
          attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS2].length;
          attrName = match[ATTRIBUTE_NAME2];
          regex = match[QUOTE_CHAR2] === undefined ? tagEndRegex2 : match[QUOTE_CHAR2] === '"' ? doubleQuoteAttrEndRegex2 : singleQuoteAttrEndRegex2;
        }
      } else if (regex === doubleQuoteAttrEndRegex2 || regex === singleQuoteAttrEndRegex2) {
        regex = tagEndRegex2;
      } else if (regex === commentEndRegex2 || regex === comment2EndRegex2) {
        regex = textEndRegex2;
      } else {
        regex = tagEndRegex2;
        rawTextEndRegex = undefined;
      }
    }
    if (DEV_MODE3) {
      console.assert(attrNameEndIndex === -1 || regex === tagEndRegex2 || regex === singleQuoteAttrEndRegex2 || regex === doubleQuoteAttrEndRegex2, "unexpected parse state B");
    }
    const end = regex === tagEndRegex2 && strings[i + 1].startsWith("/>") ? " " : "";
    html3 += regex === textEndRegex2 ? s + nodeMarker2 : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s.slice(0, attrNameEndIndex) + boundAttributeSuffix2 + s.slice(attrNameEndIndex)) + marker2 + end : s + marker2 + (attrNameEndIndex === -2 ? (attrNames.push(undefined), i) : end);
  }
  const htmlResult = html3 + (strings[l] || "<?>") + (type === SVG_RESULT2 ? "</svg>" : "");
  return [trustFromTemplateString2(strings, htmlResult), attrNames];
};

class Template2 {
  constructor({ strings, ["_$litType$"]: type }, options) {
    this.parts = [];
    let node;
    let nodeIndex = 0;
    let attrNameIndex = 0;
    const partCount = strings.length - 1;
    const parts = this.parts;
    const [html3, attrNames] = getTemplateHtml2(strings, type);
    this.el = Template2.createElement(html3, options);
    walker2.currentNode = this.el.content;
    if (type === SVG_RESULT2) {
      const content = this.el.content;
      const svgElement = content.firstChild;
      svgElement.remove();
      content.append(...svgElement.childNodes);
    }
    while ((node = walker2.nextNode()) !== null && parts.length < partCount) {
      if (node.nodeType === 1) {
        if (DEV_MODE3) {
          const tag3 = node.localName;
          if (/^(?:textarea|template)$/i.test(tag3) && node.innerHTML.includes(marker2)) {
            const m = `Expressions are not supported inside \`${tag3}\` ` + `elements. See https://lit.dev/msg/expression-in-${tag3} for more ` + `information.`;
            if (tag3 === "template") {
              throw new Error(m);
            } else
              issueWarning3("", m);
          }
        }
        if (node.hasAttributes()) {
          const attrsToRemove = [];
          for (const name of node.getAttributeNames()) {
            if (name.endsWith(boundAttributeSuffix2) || name.startsWith(marker2)) {
              const realName = attrNames[attrNameIndex++];
              attrsToRemove.push(name);
              if (realName !== undefined) {
                const value = node.getAttribute(realName.toLowerCase() + boundAttributeSuffix2);
                const statics = value.split(marker2);
                const m = /([.?@])?(.*)/.exec(realName);
                parts.push({
                  type: ATTRIBUTE_PART2,
                  index: nodeIndex,
                  name: m[2],
                  strings: statics,
                  ctor: m[1] === "." ? PropertyPart2 : m[1] === "?" ? BooleanAttributePart2 : m[1] === "@" ? EventPart2 : AttributePart2
                });
              } else {
                parts.push({
                  type: ELEMENT_PART2,
                  index: nodeIndex
                });
              }
            }
          }
          for (const name of attrsToRemove) {
            node.removeAttribute(name);
          }
        }
        if (rawTextElement2.test(node.tagName)) {
          const strings2 = node.textContent.split(marker2);
          const lastIndex = strings2.length - 1;
          if (lastIndex > 0) {
            node.textContent = trustedTypes3 ? trustedTypes3.emptyScript : "";
            for (let i = 0;i < lastIndex; i++) {
              node.append(strings2[i], createMarker2());
              walker2.nextNode();
              parts.push({ type: CHILD_PART2, index: ++nodeIndex });
            }
            node.append(strings2[lastIndex], createMarker2());
          }
        }
      } else if (node.nodeType === 8) {
        const data = node.data;
        if (data === markerMatch2) {
          parts.push({ type: CHILD_PART2, index: nodeIndex });
        } else {
          let i = -1;
          while ((i = node.data.indexOf(marker2, i + 1)) !== -1) {
            parts.push({ type: COMMENT_PART2, index: nodeIndex });
            i += marker2.length - 1;
          }
        }
      }
      nodeIndex++;
    }
    debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
      kind: "template prep",
      template: this,
      clonableTemplate: this.el,
      parts: this.parts,
      strings
    });
  }
  static createElement(html3, _options) {
    const el = d2.createElement("template");
    el.innerHTML = html3;
    return el;
  }
}
function resolveDirective2(part, value, parent = part, attributeIndex) {
  var _a4, _b4, _c4;
  var _d4;
  if (value === noChange2) {
    return value;
  }
  let currentDirective = attributeIndex !== undefined ? (_a4 = parent.__directives) === null || _a4 === undefined ? undefined : _a4[attributeIndex] : parent.__directive;
  const nextDirectiveConstructor = isPrimitive2(value) ? undefined : value["_$litDirective$"];
  if ((currentDirective === null || currentDirective === undefined ? undefined : currentDirective.constructor) !== nextDirectiveConstructor) {
    (_b4 = currentDirective === null || currentDirective === undefined ? undefined : currentDirective["_$notifyDirectiveConnectionChanged"]) === null || _b4 === undefined || _b4.call(currentDirective, false);
    if (nextDirectiveConstructor === undefined) {
      currentDirective = undefined;
    } else {
      currentDirective = new nextDirectiveConstructor(part);
      currentDirective._$initialize(part, parent, attributeIndex);
    }
    if (attributeIndex !== undefined) {
      ((_c4 = (_d4 = parent).__directives) !== null && _c4 !== undefined ? _c4 : _d4.__directives = [])[attributeIndex] = currentDirective;
    } else {
      parent.__directive = currentDirective;
    }
  }
  if (currentDirective !== undefined) {
    value = resolveDirective2(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
  }
  return value;
}

class TemplateInstance2 {
  constructor(template, parent) {
    this._$parts = [];
    this._$disconnectableChildren = undefined;
    this._$template = template;
    this._$parent = parent;
  }
  get parentNode() {
    return this._$parent.parentNode;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _clone(options) {
    var _a4;
    const { el: { content }, parts } = this._$template;
    const fragment = ((_a4 = options === null || options === undefined ? undefined : options.creationScope) !== null && _a4 !== undefined ? _a4 : d2).importNode(content, true);
    walker2.currentNode = fragment;
    let node = walker2.nextNode();
    let nodeIndex = 0;
    let partIndex = 0;
    let templatePart = parts[0];
    while (templatePart !== undefined) {
      if (nodeIndex === templatePart.index) {
        let part;
        if (templatePart.type === CHILD_PART2) {
          part = new ChildPart2(node, node.nextSibling, this, options);
        } else if (templatePart.type === ATTRIBUTE_PART2) {
          part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
        } else if (templatePart.type === ELEMENT_PART2) {
          part = new ElementPart2(node, this, options);
        }
        this._$parts.push(part);
        templatePart = parts[++partIndex];
      }
      if (nodeIndex !== (templatePart === null || templatePart === undefined ? undefined : templatePart.index)) {
        node = walker2.nextNode();
        nodeIndex++;
      }
    }
    walker2.currentNode = d2;
    return fragment;
  }
  _update(values) {
    let i = 0;
    for (const part of this._$parts) {
      if (part !== undefined) {
        debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
          kind: "set part",
          part,
          value: values[i],
          valueIndex: i,
          values,
          templateInstance: this
        });
        if (part.strings !== undefined) {
          part._$setValue(values, part, i);
          i += part.strings.length - 2;
        } else {
          part._$setValue(values[i]);
        }
      }
      i++;
    }
  }
}

class ChildPart2 {
  constructor(startNode, endNode, parent, options) {
    var _a4;
    this.type = CHILD_PART2;
    this._$committedValue = nothing2;
    this._$disconnectableChildren = undefined;
    this._$startNode = startNode;
    this._$endNode = endNode;
    this._$parent = parent;
    this.options = options;
    this.__isConnected = (_a4 = options === null || options === undefined ? undefined : options.isConnected) !== null && _a4 !== undefined ? _a4 : true;
    if (ENABLE_EXTRA_SECURITY_HOOKS2) {
      this._textSanitizer = undefined;
    }
  }
  get _$isConnected() {
    var _a4, _b4;
    return (_b4 = (_a4 = this._$parent) === null || _a4 === undefined ? undefined : _a4._$isConnected) !== null && _b4 !== undefined ? _b4 : this.__isConnected;
  }
  get parentNode() {
    let parentNode = wrap2(this._$startNode).parentNode;
    const parent = this._$parent;
    if (parent !== undefined && (parentNode === null || parentNode === undefined ? undefined : parentNode.nodeType) === 11) {
      parentNode = parent.parentNode;
    }
    return parentNode;
  }
  get startNode() {
    return this._$startNode;
  }
  get endNode() {
    return this._$endNode;
  }
  _$setValue(value, directiveParent = this) {
    var _a4;
    if (DEV_MODE3 && this.parentNode === null) {
      throw new Error(`This \`ChildPart\` has no \`parentNode\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \`innerHTML\` or \`textContent\` can do this.`);
    }
    value = resolveDirective2(this, value, directiveParent);
    if (isPrimitive2(value)) {
      if (value === nothing2 || value == null || value === "") {
        if (this._$committedValue !== nothing2) {
          debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
            kind: "commit nothing to child",
            start: this._$startNode,
            end: this._$endNode,
            parent: this._$parent,
            options: this.options
          });
          this._$clear();
        }
        this._$committedValue = nothing2;
      } else if (value !== this._$committedValue && value !== noChange2) {
        this._commitText(value);
      }
    } else if (value["_$litType$"] !== undefined) {
      this._commitTemplateResult(value);
    } else if (value.nodeType !== undefined) {
      if (DEV_MODE3 && ((_a4 = this.options) === null || _a4 === undefined ? undefined : _a4.host) === value) {
        this._commitText(`[probable mistake: rendered a template's host in itself ` + `(commonly caused by writing \${this} in a template]`);
        console.warn(`Attempted to render the template host`, value, `inside itself. This is almost always a mistake, and in dev mode `, `we render some warning text. In production however, we'll `, `render it, which will usually result in an error, and sometimes `, `in the element disappearing from the DOM.`);
        return;
      }
      this._commitNode(value);
    } else if (isIterable2(value)) {
      this._commitIterable(value);
    } else {
      this._commitText(value);
    }
  }
  _insert(node) {
    return wrap2(wrap2(this._$startNode).parentNode).insertBefore(node, this._$endNode);
  }
  _commitNode(value) {
    var _a4;
    if (this._$committedValue !== value) {
      this._$clear();
      if (ENABLE_EXTRA_SECURITY_HOOKS2 && sanitizerFactoryInternal2 !== noopSanitizer2) {
        const parentNodeName = (_a4 = this._$startNode.parentNode) === null || _a4 === undefined ? undefined : _a4.nodeName;
        if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
          let message = "Forbidden";
          if (DEV_MODE3) {
            if (parentNodeName === "STYLE") {
              message = `Lit does not support binding inside style nodes. ` + `This is a security risk, as style injection attacks can ` + `exfiltrate data and spoof UIs. ` + `Consider instead using css\`...\` literals ` + `to compose styles, and make do dynamic styling with ` + `css custom properties, ::parts, <slot>s, ` + `and by mutating the DOM rather than stylesheets.`;
            } else {
              message = `Lit does not support binding inside script nodes. ` + `This is a security risk, as it could allow arbitrary ` + `code execution.`;
            }
          }
          throw new Error(message);
        }
      }
      debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
        kind: "commit node",
        start: this._$startNode,
        parent: this._$parent,
        value,
        options: this.options
      });
      this._$committedValue = this._insert(value);
    }
  }
  _commitText(value) {
    if (this._$committedValue !== nothing2 && isPrimitive2(this._$committedValue)) {
      const node = wrap2(this._$startNode).nextSibling;
      if (ENABLE_EXTRA_SECURITY_HOOKS2) {
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer2(node, "data", "property");
        }
        value = this._textSanitizer(value);
      }
      debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
        kind: "commit text",
        node,
        value,
        options: this.options
      });
      node.data = value;
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS2) {
        const textNode = d2.createTextNode("");
        this._commitNode(textNode);
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer2(textNode, "data", "property");
        }
        value = this._textSanitizer(value);
        debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
          kind: "commit text",
          node: textNode,
          value,
          options: this.options
        });
        textNode.data = value;
      } else {
        this._commitNode(d2.createTextNode(value));
        debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
          kind: "commit text",
          node: wrap2(this._$startNode).nextSibling,
          value,
          options: this.options
        });
      }
    }
    this._$committedValue = value;
  }
  _commitTemplateResult(result) {
    var _a4;
    const { values, ["_$litType$"]: type } = result;
    const template = typeof type === "number" ? this._$getTemplate(result) : (type.el === undefined && (type.el = Template2.createElement(trustFromTemplateString2(type.h, type.h[0]), this.options)), type);
    if (((_a4 = this._$committedValue) === null || _a4 === undefined ? undefined : _a4._$template) === template) {
      debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
        kind: "template updating",
        template,
        instance: this._$committedValue,
        parts: this._$committedValue._$parts,
        options: this.options,
        values
      });
      this._$committedValue._update(values);
    } else {
      const instance = new TemplateInstance2(template, this);
      const fragment = instance._clone(this.options);
      debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
        kind: "template instantiated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      instance._update(values);
      debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
        kind: "template instantiated and updated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      this._commitNode(fragment);
      this._$committedValue = instance;
    }
  }
  _$getTemplate(result) {
    let template = templateCache2.get(result.strings);
    if (template === undefined) {
      templateCache2.set(result.strings, template = new Template2(result));
    }
    return template;
  }
  _commitIterable(value) {
    if (!isArray2(this._$committedValue)) {
      this._$committedValue = [];
      this._$clear();
    }
    const itemParts = this._$committedValue;
    let partIndex = 0;
    let itemPart;
    for (const item of value) {
      if (partIndex === itemParts.length) {
        itemParts.push(itemPart = new ChildPart2(this._insert(createMarker2()), this._insert(createMarker2()), this, this.options));
      } else {
        itemPart = itemParts[partIndex];
      }
      itemPart._$setValue(item);
      partIndex++;
    }
    if (partIndex < itemParts.length) {
      this._$clear(itemPart && wrap2(itemPart._$endNode).nextSibling, partIndex);
      itemParts.length = partIndex;
    }
  }
  _$clear(start = wrap2(this._$startNode).nextSibling, from) {
    var _a4;
    (_a4 = this._$notifyConnectionChanged) === null || _a4 === undefined || _a4.call(this, false, true, from);
    while (start && start !== this._$endNode) {
      const n = wrap2(start).nextSibling;
      wrap2(start).remove();
      start = n;
    }
  }
  setConnected(isConnected) {
    var _a4;
    if (this._$parent === undefined) {
      this.__isConnected = isConnected;
      (_a4 = this._$notifyConnectionChanged) === null || _a4 === undefined || _a4.call(this, isConnected);
    } else if (DEV_MODE3) {
      throw new Error("part.setConnected() may only be called on a " + "RootPart returned from render().");
    }
  }
}

class AttributePart2 {
  constructor(element, name, strings, parent, options) {
    this.type = ATTRIBUTE_PART2;
    this._$committedValue = nothing2;
    this._$disconnectableChildren = undefined;
    this.element = element;
    this.name = name;
    this._$parent = parent;
    this.options = options;
    if (strings.length > 2 || strings[0] !== "" || strings[1] !== "") {
      this._$committedValue = new Array(strings.length - 1).fill(new String);
      this.strings = strings;
    } else {
      this._$committedValue = nothing2;
    }
    if (ENABLE_EXTRA_SECURITY_HOOKS2) {
      this._sanitizer = undefined;
    }
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(value, directiveParent = this, valueIndex, noCommit) {
    const strings = this.strings;
    let change = false;
    if (strings === undefined) {
      value = resolveDirective2(this, value, directiveParent, 0);
      change = !isPrimitive2(value) || value !== this._$committedValue && value !== noChange2;
      if (change) {
        this._$committedValue = value;
      }
    } else {
      const values = value;
      value = strings[0];
      let i, v;
      for (i = 0;i < strings.length - 1; i++) {
        v = resolveDirective2(this, values[valueIndex + i], directiveParent, i);
        if (v === noChange2) {
          v = this._$committedValue[i];
        }
        change || (change = !isPrimitive2(v) || v !== this._$committedValue[i]);
        if (v === nothing2) {
          value = nothing2;
        } else if (value !== nothing2) {
          value += (v !== null && v !== undefined ? v : "") + strings[i + 1];
        }
        this._$committedValue[i] = v;
      }
    }
    if (change && !noCommit) {
      this._commitValue(value);
    }
  }
  _commitValue(value) {
    if (value === nothing2) {
      wrap2(this.element).removeAttribute(this.name);
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS2) {
        if (this._sanitizer === undefined) {
          this._sanitizer = sanitizerFactoryInternal2(this.element, this.name, "attribute");
        }
        value = this._sanitizer(value !== null && value !== undefined ? value : "");
      }
      debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
        kind: "commit attribute",
        element: this.element,
        name: this.name,
        value,
        options: this.options
      });
      wrap2(this.element).setAttribute(this.name, value !== null && value !== undefined ? value : "");
    }
  }
}

class PropertyPart2 extends AttributePart2 {
  constructor() {
    super(...arguments);
    this.type = PROPERTY_PART2;
  }
  _commitValue(value) {
    if (ENABLE_EXTRA_SECURITY_HOOKS2) {
      if (this._sanitizer === undefined) {
        this._sanitizer = sanitizerFactoryInternal2(this.element, this.name, "property");
      }
      value = this._sanitizer(value);
    }
    debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
      kind: "commit property",
      element: this.element,
      name: this.name,
      value,
      options: this.options
    });
    this.element[this.name] = value === nothing2 ? undefined : value;
  }
}
var emptyStringForBooleanAttribute3 = trustedTypes3 ? trustedTypes3.emptyScript : "";

class BooleanAttributePart2 extends AttributePart2 {
  constructor() {
    super(...arguments);
    this.type = BOOLEAN_ATTRIBUTE_PART2;
  }
  _commitValue(value) {
    debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
      kind: "commit boolean attribute",
      element: this.element,
      name: this.name,
      value: !!(value && value !== nothing2),
      options: this.options
    });
    if (value && value !== nothing2) {
      wrap2(this.element).setAttribute(this.name, emptyStringForBooleanAttribute3);
    } else {
      wrap2(this.element).removeAttribute(this.name);
    }
  }
}

class EventPart2 extends AttributePart2 {
  constructor(element, name, strings, parent, options) {
    super(element, name, strings, parent, options);
    this.type = EVENT_PART2;
    if (DEV_MODE3 && this.strings !== undefined) {
      throw new Error(`A \`<${element.localName}>\` has a \`@${name}=...\` listener with ` + "invalid content. Event listeners in templates must have exactly " + "one expression and no surrounding text.");
    }
  }
  _$setValue(newListener, directiveParent = this) {
    var _a4;
    newListener = (_a4 = resolveDirective2(this, newListener, directiveParent, 0)) !== null && _a4 !== undefined ? _a4 : nothing2;
    if (newListener === noChange2) {
      return;
    }
    const oldListener = this._$committedValue;
    const shouldRemoveListener = newListener === nothing2 && oldListener !== nothing2 || newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive;
    const shouldAddListener = newListener !== nothing2 && (oldListener === nothing2 || shouldRemoveListener);
    debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
      kind: "commit event listener",
      element: this.element,
      name: this.name,
      value: newListener,
      options: this.options,
      removeListener: shouldRemoveListener,
      addListener: shouldAddListener,
      oldListener
    });
    if (shouldRemoveListener) {
      this.element.removeEventListener(this.name, this, oldListener);
    }
    if (shouldAddListener) {
      this.element.addEventListener(this.name, this, newListener);
    }
    this._$committedValue = newListener;
  }
  handleEvent(event) {
    var _a4, _b4;
    if (typeof this._$committedValue === "function") {
      this._$committedValue.call((_b4 = (_a4 = this.options) === null || _a4 === undefined ? undefined : _a4.host) !== null && _b4 !== undefined ? _b4 : this.element, event);
    } else {
      this._$committedValue.handleEvent(event);
    }
  }
}

class ElementPart2 {
  constructor(element, parent, options) {
    this.element = element;
    this.type = ELEMENT_PART2;
    this._$disconnectableChildren = undefined;
    this._$parent = parent;
    this.options = options;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(value) {
    debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
      kind: "commit to element binding",
      element: this.element,
      value,
      options: this.options
    });
    resolveDirective2(this, value);
  }
}
var polyfillSupport3 = DEV_MODE3 ? global4.litHtmlPolyfillSupportDevMode : global4.litHtmlPolyfillSupport;
polyfillSupport3 === null || polyfillSupport3 === undefined || polyfillSupport3(Template2, ChildPart2);
((_d3 = global4.litHtmlVersions) !== null && _d3 !== undefined ? _d3 : global4.litHtmlVersions = []).push("2.8.0");
if (DEV_MODE3 && global4.litHtmlVersions.length > 1) {
  issueWarning3("multiple-versions", `Multiple versions of Lit loaded. ` + `Loading multiple versions is not recommended.`);
}
var render2 = (value, container, options) => {
  var _a4, _b4;
  if (DEV_MODE3 && container == null) {
    throw new TypeError(`The container to render into may not be ${container}`);
  }
  const renderId = DEV_MODE3 ? debugLogRenderId2++ : 0;
  const partOwnerNode = (_a4 = options === null || options === undefined ? undefined : options.renderBefore) !== null && _a4 !== undefined ? _a4 : container;
  let part = partOwnerNode["_$litPart$"];
  debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
    kind: "begin render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  if (part === undefined) {
    const endNode = (_b4 = options === null || options === undefined ? undefined : options.renderBefore) !== null && _b4 !== undefined ? _b4 : null;
    partOwnerNode["_$litPart$"] = part = new ChildPart2(container.insertBefore(createMarker2(), endNode), endNode, undefined, options !== null && options !== undefined ? options : {});
  }
  part._$setValue(value);
  debugLogEvent3 === null || debugLogEvent3 === undefined || debugLogEvent3({
    kind: "end render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  return part;
};
if (ENABLE_EXTRA_SECURITY_HOOKS2) {
  render2.setSanitizer = setSanitizer2;
  render2.createSanitizer = createSanitizer2;
  if (DEV_MODE3) {
    render2._testOnlyClearSanitizerFactoryDoNotCallOrElse = _testOnlyClearSanitizerFactoryDoNotCallOrElse2;
  }
}

// node_modules/lit-element/development/lit-element.js
var _a4;
var _b4;
var _c4;
var DEV_MODE4 = true;
var issueWarning4;
if (DEV_MODE4) {
  const issuedWarnings = (_a4 = globalThis.litIssuedWarnings) !== null && _a4 !== undefined ? _a4 : globalThis.litIssuedWarnings = new Set;
  issueWarning4 = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!issuedWarnings.has(warning)) {
      console.warn(warning);
      issuedWarnings.add(warning);
    }
  };
}

class LitElement extends ReactiveElement {
  constructor() {
    super(...arguments);
    this.renderOptions = { host: this };
    this.__childPart = undefined;
  }
  createRenderRoot() {
    var _a5;
    var _b5;
    const renderRoot = super.createRenderRoot();
    (_a5 = (_b5 = this.renderOptions).renderBefore) !== null && _a5 !== undefined || (_b5.renderBefore = renderRoot.firstChild);
    return renderRoot;
  }
  update(changedProperties) {
    const value = this.render();
    if (!this.hasUpdated) {
      this.renderOptions.isConnected = this.isConnected;
    }
    super.update(changedProperties);
    this.__childPart = render2(value, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var _a5;
    super.connectedCallback();
    (_a5 = this.__childPart) === null || _a5 === undefined || _a5.setConnected(true);
  }
  disconnectedCallback() {
    var _a5;
    super.disconnectedCallback();
    (_a5 = this.__childPart) === null || _a5 === undefined || _a5.setConnected(false);
  }
  render() {
    return noChange2;
  }
}
LitElement["finalized"] = true;
LitElement["_$litElement$"] = true;
(_b4 = globalThis.litElementHydrateSupport) === null || _b4 === undefined || _b4.call(globalThis, { LitElement });
var polyfillSupport4 = DEV_MODE4 ? globalThis.litElementPolyfillSupportDevMode : globalThis.litElementPolyfillSupport;
polyfillSupport4 === null || polyfillSupport4 === undefined || polyfillSupport4({ LitElement });
if (DEV_MODE4) {
  LitElement["finalize"] = function() {
    const finalized2 = ReactiveElement.finalize.call(this);
    if (!finalized2) {
      return false;
    }
    const warnRemovedOrRenamed = (obj, name, renamed = false) => {
      if (obj.hasOwnProperty(name)) {
        const ctorName = (typeof obj === "function" ? obj : obj.constructor).name;
        issueWarning4(renamed ? "renamed-api" : "removed-api", `\`${name}\` is implemented on class ${ctorName}. It ` + `has been ${renamed ? "renamed" : "removed"} ` + `in this version of LitElement.`);
      }
    };
    warnRemovedOrRenamed(this, "render");
    warnRemovedOrRenamed(this, "getStyles", true);
    warnRemovedOrRenamed(this.prototype, "adoptStyles");
    return true;
  };
}
((_c4 = globalThis.litElementVersions) !== null && _c4 !== undefined ? _c4 : globalThis.litElementVersions = []).push("3.3.3");
if (DEV_MODE4 && globalThis.litElementVersions.length > 1) {
  issueWarning4("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions ` + `is not recommended.`);
}
// node_modules/@lit/reactive-element/development/decorators/custom-element.js
var legacyCustomElement = (tagName, clazz) => {
  customElements.define(tagName, clazz);
  return clazz;
};
var standardCustomElement = (tagName, descriptor) => {
  const { kind, elements } = descriptor;
  return {
    kind,
    elements,
    finisher(clazz) {
      customElements.define(tagName, clazz);
    }
  };
};
var customElement = (tagName) => (classOrDescriptor) => typeof classOrDescriptor === "function" ? legacyCustomElement(tagName, classOrDescriptor) : standardCustomElement(tagName, classOrDescriptor);
// node_modules/@lit/reactive-element/development/decorators/property.js
var standardProperty = (options, element) => {
  if (element.kind === "method" && element.descriptor && !("value" in element.descriptor)) {
    return {
      ...element,
      finisher(clazz) {
        clazz.createProperty(element.key, options);
      }
    };
  } else {
    return {
      kind: "field",
      key: Symbol(),
      placement: "own",
      descriptor: {},
      originalKey: element.key,
      initializer() {
        if (typeof element.initializer === "function") {
          this[element.key] = element.initializer.call(this);
        }
      },
      finisher(clazz) {
        clazz.createProperty(element.key, options);
      }
    };
  }
};
var legacyProperty = (options, proto, name) => {
  proto.constructor.createProperty(name, options);
};
function property(options) {
  return (protoOrDescriptor, name) => name !== undefined ? legacyProperty(options, protoOrDescriptor, name) : standardProperty(options, protoOrDescriptor);
}
// node_modules/@lit/reactive-element/development/decorators/state.js
function state(options) {
  return property({
    ...options,
    state: true
  });
}
// node_modules/@lit/reactive-element/development/decorators/query-assigned-elements.js
var _a5;
var NODE_MODE5 = false;
var global5 = NODE_MODE5 ? globalThis : window;
var slotAssignedElements = ((_a5 = global5.HTMLSlotElement) === null || _a5 === undefined ? undefined : _a5.prototype.assignedElements) != null ? (slot, opts) => slot.assignedElements(opts) : (slot, opts) => slot.assignedNodes(opts).filter((node) => node.nodeType === Node.ELEMENT_NODE);
// package.json
var version = "0.11.1";

// node_modules/custom-card-helpers/dist/index.m.js
var t;
var r;
(function(e) {
  e.language = "language", e.system = "system", e.comma_decimal = "comma_decimal", e.decimal_comma = "decimal_comma", e.space_comma = "space_comma", e.none = "none";
})(t || (t = {})), function(e) {
  e.language = "language", e.system = "system", e.am_pm = "12", e.twenty_four = "24";
}(r || (r = {}));
var $ = new Set(["fan", "input_boolean", "light", "switch", "group", "automation"]);
var ne = function(e, t2, r2, n) {
  n = n || {}, r2 = r2 == null ? {} : r2;
  var i = new Event(t2, { bubbles: n.bubbles === undefined || n.bubbles, cancelable: Boolean(n.cancelable), composed: n.composed === undefined || n.composed });
  return i.detail = r2, e.dispatchEvent(i), i;
};
var ie = new Set(["call-service", "divider", "section", "weblink", "cast", "select"]);
var de = function(e, t2, r2) {
  r2 === undefined && (r2 = false), r2 ? history.replaceState(null, "", t2) : history.pushState(null, "", t2), ne(window, "location-changed", { replace: r2 });
};

// src/types.ts
var DesktopPosition;
((DesktopPosition2) => {
  DesktopPosition2["top"] = "top";
  DesktopPosition2["left"] = "left";
  DesktopPosition2["bottom"] = "bottom";
  DesktopPosition2["right"] = "right";
})(DesktopPosition ||= {});

// src/utils.ts
var mapStringToEnum = (enumType, value) => {
  if (Object.values(enumType).includes(value)) {
    return value;
  }
  return;
};
var processBadgeTemplate = (hass, template) => {
  if (!template || !hass)
    return false;
  try {
    const func = new Function("states", `return ${template}`);
    return func(hass.states);
  } catch (e) {
    console.error(`NavbarCard: Error evaluating badge template: ${e}`);
    return false;
  }
};
var processTemplate = (hass, template) => {
  if (!template || !hass)
    return template;
  if (typeof template !== "string")
    return template;
  if (!(template.trim().startsWith("[[[") && template.trim().endsWith("]]]"))) {
    return template;
  }
  try {
    const cleanTemplate = template.replace(/\[\[\[|\]\]\]/g, "");
    const func = new Function("states", "user", "hass", cleanTemplate);
    return func(hass.states, hass.user, hass);
  } catch (e) {
    console.error(`NavbarCard: Error evaluating template: ${e}`);
    return template;
  }
};
var fireDOMEvent = (node, type, options, detail) => {
  const event = new Event(type, options ?? {});
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};
var hapticFeedback = (hapticType = "selection") => {
  return fireDOMEvent(window, "haptic", undefined, hapticType);
};

// src/dom-utils.ts
var getNavbarTemplates = () => {
  const lovelacePanel = document?.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-drawer partial-panel-resolver ha-panel-lovelace");
  if (lovelacePanel) {
    return lovelacePanel.lovelace.config["navbar-templates"];
  }
  return null;
};
var forceResetRipple = (target) => {
  const ripple = target?.querySelector("md-ripple");
  if (ripple != null) {
    setTimeout(() => {
      ripple.shadowRoot?.querySelector(".surface")?.classList?.remove("hovered");
      ripple.shadowRoot?.querySelector(".surface")?.classList?.remove("pressed");
    }, 10);
  }
};

// src/styles.ts
var HOST_STYLES = css`
  :host {
    --navbar-background-color: var(--card-background-color);
    --navbar-route-icon-size: 24px;
    --navbar-route-image-size: 32px;
    --navbar-primary-color: var(--primary-color);
    --navbar-box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14);
    --navbar-box-shadow-desktop: var(--material-shadow-elevation-2dp);

    --navbar-z-index: 3;
    --navbar-popup-backdrop-index: 900;
    --navbar-popup-index: 901;
  }
`;
var NAVBAR_STYLES = css`
  .navbar {
    background: var(--navbar-background-color);
    border-radius: 0px;
    box-shadow: var(--navbar-box-shadow);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    gap: 10px;
    width: 100vw;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: unset;
    z-index: var(--navbar-z-index);
  }

  /* Edit mode styles */
  .navbar.edit-mode {
    position: relative !important;
    flex-direction: row !important;
    left: unset !important;
    right: unset !important;
    bottom: unset !important;
    top: unset !important;
    width: auto !important;
    transform: none !important;
  }

  /* Desktop mode styles */
  .navbar.desktop {
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--navbar-box-shadow-desktop);
    width: auto;
    justify-content: space-evenly;

    --navbar-route-icon-size: 28px;
  }
  .navbar.desktop.bottom {
    flex-direction: row;
    top: unset;
    right: unset;
    bottom: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }
  .navbar.desktop.top {
    flex-direction: row;
    bottom: unset;
    right: unset;
    top: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }
  .navbar.desktop.left {
    flex-direction: column;
    left: calc(var(--mdc-drawer-width, 0px) + 16px);
    right: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }
  .navbar.desktop.right {
    flex-direction: column;
    right: 16px;
    left: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }
`;
var ROUTE_STYLES = css`
  .route {
    cursor: pointer;
    max-width: 60px;
    width: 100%;
    position: relative;
    text-decoration: none;
    color: var(--primary-text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    --icon-primary-color: var(--state-inactive-color);
  }

  /* Button styling */
  .button {
    height: 36px;
    width: 100%;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .button.active {
    background: color-mix(
      in srgb,
      var(--navbar-primary-color) 30%,
      transparent
    );
    --icon-primary-color: var(--navbar-primary-color);
  }

  /* Icon and Image styling */
  .icon {
    --mdc-icon-size: var(--navbar-route-icon-size);
  }

  .image {
    width: var(--navbar-route-image-size);
    height: var(--navbar-route-image-size);
    object-fit: contain;
  }

  .image.active {
  }

  /* Label styling */
  .label {
    flex: 1;
    width: 100%;
    /* TODO fix ellipsis*/
    text-align: center;
    font-size: var(--paper-font-caption_-_font-size, 12px);
    font-weight: 500;
  }

  /* Badge styling */
  .badge {
    border-radius: 999px;
    width: 12px;
    height: 12px;
    position: absolute;
    top: 0;
    right: 0;
  }

  /* Desktop mode styles */
  .navbar.desktop .route {
    height: 60px;
    width: 60px;
  }
  .navbar.desktop .button {
    flex: unset;
    height: 100%;
  }
`;
var POPUP_STYLES = css`
  /****************************************/
  /* Backdrop */
  /****************************************/
  .navbar-popup-backdrop {
    position: fixed;
    background: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: var(--navbar-popup-backdrop-index);
    transition: opacity 0.2s ease;
  }

  .navbar-popup-backdrop.visible {
    opacity: 1;
  }

  /****************************************/
  /* Main popup container */
  /****************************************/
  .navbar-popup {
    pointer-events: none;
    position: fixed;
    opacity: 0;
    padding: 6px;
    gap: 10px;
    z-index: var(--navbar-popup-index);

    display: flex;
    justify-content: center;

    transition: all 0.2s ease;
    transform-origin: bottom left;
  }

  .navbar-popup.open-up {
    flex-direction: column-reverse;
    margin-bottom: 32px;
    transform: translate(0, -100%);
  }

  .navbar-popup.open-bottom {
    flex-direction: column;
    margin-top: 32px;
  }

  .navbar-popup.open-right {
    flex-direction: row;
    margin-left: 32px;
  }

  .navbar-popup.open-left {
    flex-direction: row-reverse;
    margin-right: 32px;
  }

  .navbar-popup.label-right {
    align-items: flex-start;
  }

  .navbar-popup.label-left {
    align-items: flex-end;
  }

  .navbar-popup.visible {
    opacity: 1;
  }

  /****************************************/
  /* Popup item styles */
  /****************************************/

  .popup-item {
    pointer-events: auto;
    cursor: pointer;
    color: var(--primary-text-color);
    display: flex;
    flex-direction: column;
    --icon-primary-color: var(--primary-text-color);
    display: flex;
    flex-direction: row-reverse;
    width: fit-content;
    height: fit-content;
    gap: 6px;
    align-items: center;

    opacity: 0;
    transform: translateY(10px);
    transition: filter 0.2s ease;
    transition: all 0.2s ease;
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .popup-item.label-bottom {
    flex-direction: column;
    max-width: 80px;
  }

  .popup-item.label-left {
    flex-direction: row-reverse;
  }

  .popup-item.label-right {
    flex-direction: row;
  }

  .popup-item.label-left .label {
    text-align: end;
  }

  .popup-item.label-right .label {
    text-align: start;
  }

  .popup-item .button {
    width: 50px;
    height: 50px;
    background: var(--navbar-background-color);
    box-shadow: var(--navbar-box-shadow-desktop);
  }
`;
var getDefaultStyles = () => {
  return css`
    ${HOST_STYLES}
    ${NAVBAR_STYLES}
    ${ROUTE_STYLES}
    ${POPUP_STYLES}
  `;
};

// src/navbar-card.ts
window.customCards = window.customCards || [];
window.customCards.push({
  type: "navbar-card",
  name: "Navbar card",
  preview: true,
  description: "Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen."
});
var PROPS_TO_FORCE_UPDATE = [
  "_config",
  "_isDesktop",
  "_inEditDashboardMode",
  "_inEditCardMode",
  "_inPreviewMode",
  "_location",
  "_popup"
];
var DEFAULT_DESKTOP_POSITION = "bottom" /* bottom */;
var DOUBLE_TAP_DELAY = 250;
var HOLD_ACTION_DELAY = 500;

class NavbarCard extends LitElement {
  holdTimeoutId = null;
  holdTriggered = false;
  pointerStartX = 0;
  pointerStartY = 0;
  lastTapTime = 0;
  lastTapTarget = null;
  tapTimeoutId = null;
  connectedCallback() {
    super.connectedCallback();
    forceResetRipple(this);
    this._location = window.location.pathname;
    window.addEventListener("resize", this._checkDesktop);
    this._checkDesktop();
    const homeAssistantRoot = document.querySelector("body > home-assistant");
    this._inEditDashboardMode = this.parentElement?.closest("hui-card-edit-mode") != null;
    this._inEditCardMode = homeAssistantRoot?.shadowRoot?.querySelector("hui-dialog-edit-card")?.shadowRoot?.querySelector("ha-dialog") != null;
    this._inPreviewMode = this.parentElement?.closest(".card > .preview") != null;
    const style = document.createElement("style");
    style.textContent = this.generateCustomStyles().cssText;
    this.shadowRoot?.appendChild(style);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("resize", this._checkDesktop);
    this._popup = null;
  }
  setConfig(config) {
    if (config?.template) {
      const templates = getNavbarTemplates();
      if (!templates) {
        console.warn('[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.' + `

` + `https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates
`);
      } else {
        const templateConfig = templates[config.template];
        if (templateConfig) {
          config = {
            ...templateConfig,
            ...config
          };
        }
      }
    }
    if (!config.routes) {
      throw new Error('"routes" param is required for navbar card');
    }
    config.routes.forEach((route) => {
      if (route.icon == null && route.image == null) {
        throw new Error('Each route must have either an "icon" or "image" property configured');
      }
      if (route.popup == null && route.submenu == null && route.tap_action == null && route.hold_action == null && route.url == null && route.double_tap_action == null) {
        throw new Error('Each route must have either "url", "popup", "tap_action", "hold_action" or "double_tap_action" property configured');
      }
      if (route.tap_action && route.tap_action.action == null) {
        throw new Error('"tap_action" must have an "action" property');
      }
      if (route.hold_action && route.hold_action.action == null) {
        throw new Error('"hold_action" must have an "action" property');
      }
      if (route.double_tap_action && route.double_tap_action.action == null) {
        throw new Error('"double_tap_action" must have an "action" property');
      }
    });
    this._config = config;
  }
  shouldUpdate(changedProperties) {
    for (const propName of changedProperties.keys()) {
      if (PROPS_TO_FORCE_UPDATE.includes(propName)) {
        return true;
      }
      if (propName === "hass") {
        return true;
      }
    }
    return false;
  }
  static getStubConfig() {
    return {
      routes: [
        { url: window.location.pathname, icon: "mdi:home", label: "Home" },
        {
          url: `${window.location.pathname}/devices`,
          icon: "mdi:devices",
          label: "Devices",
          hold_action: {
            action: "navigate",
            navigation_path: "/config/devices/dashboard"
          }
        },
        {
          url: "/config/automation/dashboard",
          icon: "mdi:creation",
          label: "Automations"
        },
        { url: "/config/dashboard", icon: "mdi:cog", label: "Settings" },
        {
          icon: "mdi:dots-horizontal",
          label: "More",
          tap_action: {
            action: "open-popup"
          },
          popup: [
            { icon: "mdi:cog", url: "/config/dashboard" },
            {
              icon: "mdi:hammer",
              url: "/developer-tools/yaml"
            },
            {
              icon: "mdi:power",
              tap_action: {
                action: "call-service",
                service: "homeassistant.restart",
                service_data: {},
                confirmation: {
                  text: "Are you sure you want to restart Home Assistant?"
                }
              }
            }
          ]
        }
      ]
    };
  }
  _getRouteIcon(route, isActive) {
    return route.image ? html2`<img
          class="image ${isActive ? "active" : ""}"
          src="${isActive && route.image_selected ? route.image_selected : route.image}"
          alt="${route.label || ""}" />` : html2`<ha-icon
          class="icon ${isActive ? "active" : ""}"
          icon="${isActive && route.icon_selected ? route.icon_selected : route.icon}"></ha-icon>`;
  }
  _shouldShowLabels = (isSubmenu) => {
    const config = this._isDesktop ? this._config?.desktop?.show_labels : this._config?.mobile?.show_labels;
    if (typeof config === "boolean")
      return config;
    return config === "popup_only" && isSubmenu || config === "routes_only" && !isSubmenu;
  };
  _checkDesktop = () => {
    this._isDesktop = (window.innerWidth ?? 0) >= (this._config?.desktop?.min_width ?? 768);
  };
  _renderRoute = (route) => {
    const isActive = route.selected != null ? processTemplate(this.hass, route.selected) : this._location == route.url;
    let showBadge = false;
    if (route.badge?.show) {
      showBadge = processTemplate(this.hass, route.badge?.show);
    } else if (route.badge?.template) {
      showBadge = processBadgeTemplate(this.hass, route.badge?.template);
    }
    if (processTemplate(this.hass, route.hidden)) {
      return null;
    }
    return html2`
      <div
        class="route ${isActive ? "active" : ""}"
        @pointerdown=${(e) => this._handlePointerDown(e, route)}
        @pointermove=${(e) => this._handlePointerMove(e, route)}
        @pointerup=${(e) => this._handlePointerUp(e, route)}
        @pointercancel=${(e) => this._handlePointerMove(e, route)}>
        ${showBadge ? html2`<div
              class="badge ${isActive ? "active" : ""}"
              style="background-color: ${route.badge?.color || "red"};"></div>` : html2``}

        <div class="button ${isActive ? "active" : ""}">
          ${this._getRouteIcon(route, isActive)}
          <md-ripple></md-ripple>
        </div>
        ${this._shouldShowLabels(false) ? html2`<div class="label ${isActive ? "active" : ""}">
              ${processTemplate(this.hass, route.label) ?? " "}
            </div>` : html2``}
      </div>
    `;
  };
  _closePopup = () => {
    const popup = this.shadowRoot?.querySelector(".navbar-popup");
    const backdrop = this.shadowRoot?.querySelector(".navbar-popup-backdrop");
    if (popup && backdrop) {
      popup.classList.remove("visible");
      backdrop.classList.remove("visible");
      setTimeout(() => {
        this._popup = null;
      }, 200);
    } else {
      this._popup = null;
    }
    window.removeEventListener("keydown", this._onPopupKeyDownListener);
  };
  _getPopupStyles(anchorRect, position) {
    const windowWidth = window.innerWidth;
    switch (position) {
      case "top":
        return {
          style: css`
            top: ${anchorRect.top + anchorRect.height}px;
            left: ${anchorRect.x}px;
          `,
          labelPositionClassName: "label-right",
          popupDirectionClassName: "open-bottom"
        };
      case "left":
        return {
          style: css`
            top: ${anchorRect.top}px;
            left: ${anchorRect.x + anchorRect.width}px;
          `,
          labelPositionClassName: "label-bottom",
          popupDirectionClassName: "open-right"
        };
      case "right":
        return {
          style: css`
            top: ${anchorRect.top}px;
            right: ${windowWidth - anchorRect.x}px;
          `,
          labelPositionClassName: "label-bottom",
          popupDirectionClassName: "open-left"
        };
      case "bottom":
      case "mobile":
      default:
        if (anchorRect.x > windowWidth / 2) {
          return {
            style: css`
              top: ${anchorRect.top}px;
              right: ${windowWidth - anchorRect.x - anchorRect.width}px;
            `,
            labelPositionClassName: "label-left",
            popupDirectionClassName: "open-up"
          };
        } else {
          return {
            style: css`
              top: ${anchorRect.top}px;
              left: ${anchorRect.left}px;
            `,
            labelPositionClassName: "label-right",
            popupDirectionClassName: "open-up"
          };
        }
    }
  }
  _openPopup = (popupItems, target) => {
    if (!popupItems || popupItems.length === 0) {
      console.warn("No popup items provided");
      return;
    }
    const anchorRect = target.getBoundingClientRect();
    const { style, labelPositionClassName, popupDirectionClassName } = this._getPopupStyles(anchorRect, !this._isDesktop ? "mobile" : this._config?.desktop?.position ?? DEFAULT_DESKTOP_POSITION);
    this._popup = html2`
      <div
        class="navbar-popup-backdrop"</div>
      <div
        class="
          navbar-popup
          ${popupDirectionClassName}
          ${labelPositionClassName}
          ${this._isDesktop ? "desktop" : "mobile"}
        "
        style="${style}">
        ${popupItems.map((popupItem, index) => {
      let showBadge = false;
      if (popupItem.badge?.show) {
        showBadge = processTemplate(this.hass, popupItem.badge?.show);
      } else if (popupItem.badge?.template) {
        showBadge = processBadgeTemplate(this.hass, popupItem.badge?.template);
      }
      if (processTemplate(this.hass, popupItem.hidden)) {
        return null;
      }
      return html2`<div
              class="
              popup-item 
              ${popupDirectionClassName}
              ${labelPositionClassName}
            "
              style="--index: ${index}"
              @click=${(e) => this._handlePointerUp(e, popupItem, true)}>
              ${showBadge ? html2`<div
                    class="badge"
                    style="background-color: ${popupItem.badge?.color || "red"};"></div>` : html2``}

              <div class="button">
                ${this._getRouteIcon(popupItem, false)}
                <md-ripple></md-ripple>
              </div>
              ${this._shouldShowLabels(true) ? html2`<div class="label">
                    ${processTemplate(this.hass, popupItem.label) ?? " "}
                  </div>` : html2``}
            </div>`;
    }).filter((x) => x != null)}
      </div>
    `;
    requestAnimationFrame(() => {
      const popup = this.shadowRoot?.querySelector(".navbar-popup");
      const backdrop = this.shadowRoot?.querySelector(".navbar-popup-backdrop");
      if (popup && backdrop) {
        popup.classList.add("visible");
        backdrop.classList.add("visible");
      }
    });
    window.addEventListener("keydown", this._onPopupKeyDownListener);
    setTimeout(() => {
      const backdrop = this.shadowRoot?.querySelector(".navbar-popup-backdrop");
      if (backdrop) {
        backdrop.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._closePopup();
        });
      }
    }, 400);
  };
  _onPopupKeyDownListener = (e) => {
    if (e.key === "Escape" && this._popup) {
      e.preventDefault();
      this._closePopup();
    }
  };
  _handlePointerDown = (e, route) => {
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
    if (route.hold_action) {
      this.holdTriggered = false;
      this.holdTimeoutId = window.setTimeout(() => {
        if (this._shouldTriggerHaptic("hold")) {
          hapticFeedback();
        }
        this.holdTriggered = true;
      }, HOLD_ACTION_DELAY);
    }
  };
  _handlePointerMove = (e, _route) => {
    if (!this.holdTimeoutId) {
      return;
    }
    const moveX = Math.abs(e.clientX - this.pointerStartX);
    const moveY = Math.abs(e.clientY - this.pointerStartY);
    if (moveX > 10 || moveY > 10) {
      if (this.holdTimeoutId !== null) {
        clearTimeout(this.holdTimeoutId);
        this.holdTimeoutId = null;
      }
    }
  };
  _handlePointerUp = (e, route, isPopup = false) => {
    if (this.holdTimeoutId !== null) {
      clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }
    const currentTarget = e.currentTarget;
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastTapTime;
    const isDoubleTap = timeDiff < DOUBLE_TAP_DELAY && e.target === this.lastTapTarget;
    if (isDoubleTap && route.double_tap_action) {
      if (this.tapTimeoutId !== null) {
        clearTimeout(this.tapTimeoutId);
        this.tapTimeoutId = null;
      }
      this._handleDoubleTapAction(currentTarget, route, isPopup);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else if (this.holdTriggered && route.hold_action) {
      this._handleHoldAction(currentTarget, route, isPopup);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else {
      this.lastTapTime = currentTime;
      this.lastTapTarget = e.target;
      this._handleTapAction(currentTarget, route, isPopup);
    }
    this.holdTriggered = false;
  };
  _handleHoldAction = (target, route, isPopupItem = false) => {
    this._executeAction(target, route, route.hold_action, "hold", isPopupItem);
  };
  _handleDoubleTapAction = (target, route, isPopupItem = false) => {
    this._executeAction(target, route, route.double_tap_action, "double_tap", isPopupItem);
  };
  _handleTapAction = (target, route, isPopupItem = false) => {
    if (route.double_tap_action) {
      this.tapTimeoutId = window.setTimeout(() => {
        this._executeAction(target, route, route.tap_action, "tap", isPopupItem);
      }, DOUBLE_TAP_DELAY);
    } else {
      this._executeAction(target, route, route.tap_action, "tap", isPopupItem);
    }
  };
  _executeAction = (target, route, action, actionType, isPopupItem = false) => {
    forceResetRipple(target);
    if (action?.action !== "open-popup" && isPopupItem) {
      this._closePopup();
    }
    if (!isPopupItem && action?.action === "open-popup") {
      const popupItems = route.popup ?? route.submenu;
      if (!popupItems) {
        console.error("No popup items found for route:", route);
      } else {
        if (this._shouldTriggerHaptic(actionType)) {
          hapticFeedback();
        }
        this._openPopup(popupItems, target);
      }
    } else if (action?.action === "toggle-menu") {
      if (this._shouldTriggerHaptic(actionType)) {
        hapticFeedback();
      }
      fireDOMEvent(this, "hass-toggle-menu", { bubbles: true, composed: true });
    } else if (action?.action === "navigate-back") {
      if (this._shouldTriggerHaptic(actionType, true)) {
        hapticFeedback();
      }
      window.history.back();
    } else if (action != null) {
      if (this._shouldTriggerHaptic(actionType)) {
        hapticFeedback();
      }
      fireDOMEvent(this, "hass-action", { bubbles: true, composed: true }, {
        action: actionType,
        config: {
          [`${actionType}_action`]: action
        }
      });
    } else if (actionType === "tap" && route.url) {
      if (this._shouldTriggerHaptic(actionType, true)) {
        hapticFeedback();
      }
      de(this, route.url);
    }
  };
  render() {
    if (!this._config) {
      return html2``;
    }
    const { routes, desktop, mobile } = this._config;
    const { position: desktopPosition, hidden: desktopHidden } = desktop ?? {};
    const { hidden: mobileHidden } = mobile ?? {};
    this._lastRender = new Date().getTime();
    const isEditMode = this._inEditDashboardMode || this._inPreviewMode || this._inEditCardMode;
    const desktopPositionClassname = mapStringToEnum(DesktopPosition, desktopPosition) ?? DEFAULT_DESKTOP_POSITION;
    const deviceModeClassName = this._isDesktop ? "desktop" : "mobile";
    const editModeClassname = isEditMode ? "edit-mode" : "";
    if (!isEditMode && (this._isDesktop && !!processTemplate(this.hass, desktopHidden) || !this._isDesktop && !!processTemplate(this.hass, mobileHidden))) {
      return html2``;
    }
    return html2`
      <ha-card
        class="navbar ${editModeClassname} ${deviceModeClassName} ${desktopPositionClassname}">
        ${routes?.map(this._renderRoute).filter((x) => x != null)}
      </ha-card>
      ${this._popup}
    `;
  }
  generateCustomStyles() {
    const userStyles = this._config?.styles ? unsafeCSS(this._config.styles) : css``;
    return css`
      ${getDefaultStyles()}
      ${userStyles}
    `;
  }
  _shouldTriggerHaptic(actionType, isNavigation = false) {
    const hapticConfig = this._config?.haptic;
    if (typeof hapticConfig === "boolean") {
      return hapticConfig;
    }
    if (!hapticConfig) {
      return !isNavigation;
    }
    if (isNavigation) {
      return hapticConfig.url ?? false;
    }
    switch (actionType) {
      case "tap":
        return hapticConfig.tap_action ?? false;
      case "hold":
        return hapticConfig.hold_action ?? false;
      case "double_tap":
        return hapticConfig.double_tap_action ?? false;
      default:
        return false;
    }
  }
}
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "hass", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_config", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_isDesktop", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_inEditDashboardMode", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_inEditCardMode", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_inPreviewMode", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_lastRender", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_location", undefined);
__legacyDecorateClassTS([
  state()
], NavbarCard.prototype, "_popup", undefined);
NavbarCard = __legacyDecorateClassTS([
  customElement("navbar-card")
], NavbarCard);
console.info(`%c navbar-card %c ${version} `, "background-color: #555;      padding: 6px 4px;      color: #fff;      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);       border-radius: 10px 0 0 10px;", "background-color: #00abd1;       padding: 6px 4px;      color: #fff;      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);       border-radius: 0 10px 10px 0;");
export {
  NavbarCard
};
