var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/leaflet/dist/leaflet-src.js
var require_leaflet_src = __commonJS({
  "node_modules/leaflet/dist/leaflet-src.js"(exports, module) {
    /* @preserve
     * Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com
     * (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade
     */
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.leaflet = {}));
    })(exports, (function(exports2) {
      "use strict";
      var version = "1.9.4";
      function extend(dest) {
        var i, j, len, src;
        for (j = 1, len = arguments.length; j < len; j++) {
          src = arguments[j];
          for (i in src) {
            dest[i] = src[i];
          }
        }
        return dest;
      }
      var create$2 = Object.create || /* @__PURE__ */ (function() {
        function F() {
        }
        return function(proto) {
          F.prototype = proto;
          return new F();
        };
      })();
      function bind(fn, obj) {
        var slice = Array.prototype.slice;
        if (fn.bind) {
          return fn.bind.apply(fn, slice.call(arguments, 1));
        }
        var args = slice.call(arguments, 2);
        return function() {
          return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
      }
      var lastId = 0;
      function stamp(obj) {
        if (!("_leaflet_id" in obj)) {
          obj["_leaflet_id"] = ++lastId;
        }
        return obj._leaflet_id;
      }
      function throttle(fn, time, context) {
        var lock, args, wrapperFn, later;
        later = function() {
          lock = false;
          if (args) {
            wrapperFn.apply(context, args);
            args = false;
          }
        };
        wrapperFn = function() {
          if (lock) {
            args = arguments;
          } else {
            fn.apply(context, arguments);
            setTimeout(later, time);
            lock = true;
          }
        };
        return wrapperFn;
      }
      function wrapNum(x, range, includeMax) {
        var max = range[1], min = range[0], d = max - min;
        return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
      }
      function falseFn() {
        return false;
      }
      function formatNum(num, precision) {
        if (precision === false) {
          return num;
        }
        var pow = Math.pow(10, precision === void 0 ? 6 : precision);
        return Math.round(num * pow) / pow;
      }
      function trim(str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
      }
      function splitWords(str) {
        return trim(str).split(/\s+/);
      }
      function setOptions(obj, options) {
        if (!Object.prototype.hasOwnProperty.call(obj, "options")) {
          obj.options = obj.options ? create$2(obj.options) : {};
        }
        for (var i in options) {
          obj.options[i] = options[i];
        }
        return obj.options;
      }
      function getParamString(obj, existingUrl, uppercase) {
        var params = [];
        for (var i in obj) {
          params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + "=" + encodeURIComponent(obj[i]));
        }
        return (!existingUrl || existingUrl.indexOf("?") === -1 ? "?" : "&") + params.join("&");
      }
      var templateRe = /\{ *([\w_ -]+) *\}/g;
      function template(str, data) {
        return str.replace(templateRe, function(str2, key) {
          var value = data[key];
          if (value === void 0) {
            throw new Error("No value provided for variable " + str2);
          } else if (typeof value === "function") {
            value = value(data);
          }
          return value;
        });
      }
      var isArray = Array.isArray || function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      };
      function indexOf(array, el) {
        for (var i = 0; i < array.length; i++) {
          if (array[i] === el) {
            return i;
          }
        }
        return -1;
      }
      var emptyImageUrl = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
      function getPrefixed(name) {
        return window["webkit" + name] || window["moz" + name] || window["ms" + name];
      }
      var lastTime = 0;
      function timeoutDefer(fn) {
        var time = +/* @__PURE__ */ new Date(), timeToCall = Math.max(0, 16 - (time - lastTime));
        lastTime = time + timeToCall;
        return window.setTimeout(fn, timeToCall);
      }
      var requestFn = window.requestAnimationFrame || getPrefixed("RequestAnimationFrame") || timeoutDefer;
      var cancelFn = window.cancelAnimationFrame || getPrefixed("CancelAnimationFrame") || getPrefixed("CancelRequestAnimationFrame") || function(id) {
        window.clearTimeout(id);
      };
      function requestAnimFrame(fn, context, immediate) {
        if (immediate && requestFn === timeoutDefer) {
          fn.call(context);
        } else {
          return requestFn.call(window, bind(fn, context));
        }
      }
      function cancelAnimFrame(id) {
        if (id) {
          cancelFn.call(window, id);
        }
      }
      var Util = {
        __proto__: null,
        extend,
        create: create$2,
        bind,
        get lastId() {
          return lastId;
        },
        stamp,
        throttle,
        wrapNum,
        falseFn,
        formatNum,
        trim,
        splitWords,
        setOptions,
        getParamString,
        template,
        isArray,
        indexOf,
        emptyImageUrl,
        requestFn,
        cancelFn,
        requestAnimFrame,
        cancelAnimFrame
      };
      function Class() {
      }
      Class.extend = function(props) {
        var NewClass = function() {
          setOptions(this);
          if (this.initialize) {
            this.initialize.apply(this, arguments);
          }
          this.callInitHooks();
        };
        var parentProto = NewClass.__super__ = this.prototype;
        var proto = create$2(parentProto);
        proto.constructor = NewClass;
        NewClass.prototype = proto;
        for (var i in this) {
          if (Object.prototype.hasOwnProperty.call(this, i) && i !== "prototype" && i !== "__super__") {
            NewClass[i] = this[i];
          }
        }
        if (props.statics) {
          extend(NewClass, props.statics);
        }
        if (props.includes) {
          checkDeprecatedMixinEvents(props.includes);
          extend.apply(null, [proto].concat(props.includes));
        }
        extend(proto, props);
        delete proto.statics;
        delete proto.includes;
        if (proto.options) {
          proto.options = parentProto.options ? create$2(parentProto.options) : {};
          extend(proto.options, props.options);
        }
        proto._initHooks = [];
        proto.callInitHooks = function() {
          if (this._initHooksCalled) {
            return;
          }
          if (parentProto.callInitHooks) {
            parentProto.callInitHooks.call(this);
          }
          this._initHooksCalled = true;
          for (var i2 = 0, len = proto._initHooks.length; i2 < len; i2++) {
            proto._initHooks[i2].call(this);
          }
        };
        return NewClass;
      };
      Class.include = function(props) {
        var parentOptions = this.prototype.options;
        extend(this.prototype, props);
        if (props.options) {
          this.prototype.options = parentOptions;
          this.mergeOptions(props.options);
        }
        return this;
      };
      Class.mergeOptions = function(options) {
        extend(this.prototype.options, options);
        return this;
      };
      Class.addInitHook = function(fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        var init = typeof fn === "function" ? fn : function() {
          this[fn].apply(this, args);
        };
        this.prototype._initHooks = this.prototype._initHooks || [];
        this.prototype._initHooks.push(init);
        return this;
      };
      function checkDeprecatedMixinEvents(includes) {
        if (typeof L === "undefined" || !L || !L.Mixin) {
          return;
        }
        includes = isArray(includes) ? includes : [includes];
        for (var i = 0; i < includes.length; i++) {
          if (includes[i] === L.Mixin.Events) {
            console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.", new Error().stack);
          }
        }
      }
      var Events = {
        /* @method on(type: String, fn: Function, context?: Object): this
         * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
         *
         * @alternative
         * @method on(eventMap: Object): this
         * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
         */
        on: function(types, fn, context) {
          if (typeof types === "object") {
            for (var type in types) {
              this._on(type, types[type], fn);
            }
          } else {
            types = splitWords(types);
            for (var i = 0, len = types.length; i < len; i++) {
              this._on(types[i], fn, context);
            }
          }
          return this;
        },
        /* @method off(type: String, fn?: Function, context?: Object): this
         * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
         *
         * @alternative
         * @method off(eventMap: Object): this
         * Removes a set of type/listener pairs.
         *
         * @alternative
         * @method off: this
         * Removes all listeners to all events on the object. This includes implicitly attached events.
         */
        off: function(types, fn, context) {
          if (!arguments.length) {
            delete this._events;
          } else if (typeof types === "object") {
            for (var type in types) {
              this._off(type, types[type], fn);
            }
          } else {
            types = splitWords(types);
            var removeAll = arguments.length === 1;
            for (var i = 0, len = types.length; i < len; i++) {
              if (removeAll) {
                this._off(types[i]);
              } else {
                this._off(types[i], fn, context);
              }
            }
          }
          return this;
        },
        // attach listener (without syntactic sugar now)
        _on: function(type, fn, context, _once) {
          if (typeof fn !== "function") {
            console.warn("wrong listener type: " + typeof fn);
            return;
          }
          if (this._listens(type, fn, context) !== false) {
            return;
          }
          if (context === this) {
            context = void 0;
          }
          var newListener = { fn, ctx: context };
          if (_once) {
            newListener.once = true;
          }
          this._events = this._events || {};
          this._events[type] = this._events[type] || [];
          this._events[type].push(newListener);
        },
        _off: function(type, fn, context) {
          var listeners, i, len;
          if (!this._events) {
            return;
          }
          listeners = this._events[type];
          if (!listeners) {
            return;
          }
          if (arguments.length === 1) {
            if (this._firingCount) {
              for (i = 0, len = listeners.length; i < len; i++) {
                listeners[i].fn = falseFn;
              }
            }
            delete this._events[type];
            return;
          }
          if (typeof fn !== "function") {
            console.warn("wrong listener type: " + typeof fn);
            return;
          }
          var index2 = this._listens(type, fn, context);
          if (index2 !== false) {
            var listener = listeners[index2];
            if (this._firingCount) {
              listener.fn = falseFn;
              this._events[type] = listeners = listeners.slice();
            }
            listeners.splice(index2, 1);
          }
        },
        // @method fire(type: String, data?: Object, propagate?: Boolean): this
        // Fires an event of the specified type. You can optionally provide a data
        // object — the first argument of the listener function will contain its
        // properties. The event can optionally be propagated to event parents.
        fire: function(type, data, propagate) {
          if (!this.listens(type, propagate)) {
            return this;
          }
          var event = extend({}, data, {
            type,
            target: this,
            sourceTarget: data && data.sourceTarget || this
          });
          if (this._events) {
            var listeners = this._events[type];
            if (listeners) {
              this._firingCount = this._firingCount + 1 || 1;
              for (var i = 0, len = listeners.length; i < len; i++) {
                var l = listeners[i];
                var fn = l.fn;
                if (l.once) {
                  this.off(type, fn, l.ctx);
                }
                fn.call(l.ctx || this, event);
              }
              this._firingCount--;
            }
          }
          if (propagate) {
            this._propagateEvent(event);
          }
          return this;
        },
        // @method listens(type: String, propagate?: Boolean): Boolean
        // @method listens(type: String, fn: Function, context?: Object, propagate?: Boolean): Boolean
        // Returns `true` if a particular event type has any listeners attached to it.
        // The verification can optionally be propagated, it will return `true` if parents have the listener attached to it.
        listens: function(type, fn, context, propagate) {
          if (typeof type !== "string") {
            console.warn('"string" type argument expected');
          }
          var _fn = fn;
          if (typeof fn !== "function") {
            propagate = !!fn;
            _fn = void 0;
            context = void 0;
          }
          var listeners = this._events && this._events[type];
          if (listeners && listeners.length) {
            if (this._listens(type, _fn, context) !== false) {
              return true;
            }
          }
          if (propagate) {
            for (var id in this._eventParents) {
              if (this._eventParents[id].listens(type, fn, context, propagate)) {
                return true;
              }
            }
          }
          return false;
        },
        // returns the index (number) or false
        _listens: function(type, fn, context) {
          if (!this._events) {
            return false;
          }
          var listeners = this._events[type] || [];
          if (!fn) {
            return !!listeners.length;
          }
          if (context === this) {
            context = void 0;
          }
          for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].fn === fn && listeners[i].ctx === context) {
              return i;
            }
          }
          return false;
        },
        // @method once(…): this
        // Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
        once: function(types, fn, context) {
          if (typeof types === "object") {
            for (var type in types) {
              this._on(type, types[type], fn, true);
            }
          } else {
            types = splitWords(types);
            for (var i = 0, len = types.length; i < len; i++) {
              this._on(types[i], fn, context, true);
            }
          }
          return this;
        },
        // @method addEventParent(obj: Evented): this
        // Adds an event parent - an `Evented` that will receive propagated events
        addEventParent: function(obj) {
          this._eventParents = this._eventParents || {};
          this._eventParents[stamp(obj)] = obj;
          return this;
        },
        // @method removeEventParent(obj: Evented): this
        // Removes an event parent, so it will stop receiving propagated events
        removeEventParent: function(obj) {
          if (this._eventParents) {
            delete this._eventParents[stamp(obj)];
          }
          return this;
        },
        _propagateEvent: function(e) {
          for (var id in this._eventParents) {
            this._eventParents[id].fire(e.type, extend({
              layer: e.target,
              propagatedFrom: e.target
            }, e), true);
          }
        }
      };
      Events.addEventListener = Events.on;
      Events.removeEventListener = Events.clearAllEventListeners = Events.off;
      Events.addOneTimeEventListener = Events.once;
      Events.fireEvent = Events.fire;
      Events.hasEventListeners = Events.listens;
      var Evented = Class.extend(Events);
      function Point(x, y, round) {
        this.x = round ? Math.round(x) : x;
        this.y = round ? Math.round(y) : y;
      }
      var trunc = Math.trunc || function(v) {
        return v > 0 ? Math.floor(v) : Math.ceil(v);
      };
      Point.prototype = {
        // @method clone(): Point
        // Returns a copy of the current point.
        clone: function() {
          return new Point(this.x, this.y);
        },
        // @method add(otherPoint: Point): Point
        // Returns the result of addition of the current and the given points.
        add: function(point) {
          return this.clone()._add(toPoint(point));
        },
        _add: function(point) {
          this.x += point.x;
          this.y += point.y;
          return this;
        },
        // @method subtract(otherPoint: Point): Point
        // Returns the result of subtraction of the given point from the current.
        subtract: function(point) {
          return this.clone()._subtract(toPoint(point));
        },
        _subtract: function(point) {
          this.x -= point.x;
          this.y -= point.y;
          return this;
        },
        // @method divideBy(num: Number): Point
        // Returns the result of division of the current point by the given number.
        divideBy: function(num) {
          return this.clone()._divideBy(num);
        },
        _divideBy: function(num) {
          this.x /= num;
          this.y /= num;
          return this;
        },
        // @method multiplyBy(num: Number): Point
        // Returns the result of multiplication of the current point by the given number.
        multiplyBy: function(num) {
          return this.clone()._multiplyBy(num);
        },
        _multiplyBy: function(num) {
          this.x *= num;
          this.y *= num;
          return this;
        },
        // @method scaleBy(scale: Point): Point
        // Multiply each coordinate of the current point by each coordinate of
        // `scale`. In linear algebra terms, multiply the point by the
        // [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
        // defined by `scale`.
        scaleBy: function(point) {
          return new Point(this.x * point.x, this.y * point.y);
        },
        // @method unscaleBy(scale: Point): Point
        // Inverse of `scaleBy`. Divide each coordinate of the current point by
        // each coordinate of `scale`.
        unscaleBy: function(point) {
          return new Point(this.x / point.x, this.y / point.y);
        },
        // @method round(): Point
        // Returns a copy of the current point with rounded coordinates.
        round: function() {
          return this.clone()._round();
        },
        _round: function() {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          return this;
        },
        // @method floor(): Point
        // Returns a copy of the current point with floored coordinates (rounded down).
        floor: function() {
          return this.clone()._floor();
        },
        _floor: function() {
          this.x = Math.floor(this.x);
          this.y = Math.floor(this.y);
          return this;
        },
        // @method ceil(): Point
        // Returns a copy of the current point with ceiled coordinates (rounded up).
        ceil: function() {
          return this.clone()._ceil();
        },
        _ceil: function() {
          this.x = Math.ceil(this.x);
          this.y = Math.ceil(this.y);
          return this;
        },
        // @method trunc(): Point
        // Returns a copy of the current point with truncated coordinates (rounded towards zero).
        trunc: function() {
          return this.clone()._trunc();
        },
        _trunc: function() {
          this.x = trunc(this.x);
          this.y = trunc(this.y);
          return this;
        },
        // @method distanceTo(otherPoint: Point): Number
        // Returns the cartesian distance between the current and the given points.
        distanceTo: function(point) {
          point = toPoint(point);
          var x = point.x - this.x, y = point.y - this.y;
          return Math.sqrt(x * x + y * y);
        },
        // @method equals(otherPoint: Point): Boolean
        // Returns `true` if the given point has the same coordinates.
        equals: function(point) {
          point = toPoint(point);
          return point.x === this.x && point.y === this.y;
        },
        // @method contains(otherPoint: Point): Boolean
        // Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
        contains: function(point) {
          point = toPoint(point);
          return Math.abs(point.x) <= Math.abs(this.x) && Math.abs(point.y) <= Math.abs(this.y);
        },
        // @method toString(): String
        // Returns a string representation of the point for debugging purposes.
        toString: function() {
          return "Point(" + formatNum(this.x) + ", " + formatNum(this.y) + ")";
        }
      };
      function toPoint(x, y, round) {
        if (x instanceof Point) {
          return x;
        }
        if (isArray(x)) {
          return new Point(x[0], x[1]);
        }
        if (x === void 0 || x === null) {
          return x;
        }
        if (typeof x === "object" && "x" in x && "y" in x) {
          return new Point(x.x, x.y);
        }
        return new Point(x, y, round);
      }
      function Bounds(a, b) {
        if (!a) {
          return;
        }
        var points = b ? [a, b] : a;
        for (var i = 0, len = points.length; i < len; i++) {
          this.extend(points[i]);
        }
      }
      Bounds.prototype = {
        // @method extend(point: Point): this
        // Extends the bounds to contain the given point.
        // @alternative
        // @method extend(otherBounds: Bounds): this
        // Extend the bounds to contain the given bounds
        extend: function(obj) {
          var min2, max2;
          if (!obj) {
            return this;
          }
          if (obj instanceof Point || typeof obj[0] === "number" || "x" in obj) {
            min2 = max2 = toPoint(obj);
          } else {
            obj = toBounds(obj);
            min2 = obj.min;
            max2 = obj.max;
            if (!min2 || !max2) {
              return this;
            }
          }
          if (!this.min && !this.max) {
            this.min = min2.clone();
            this.max = max2.clone();
          } else {
            this.min.x = Math.min(min2.x, this.min.x);
            this.max.x = Math.max(max2.x, this.max.x);
            this.min.y = Math.min(min2.y, this.min.y);
            this.max.y = Math.max(max2.y, this.max.y);
          }
          return this;
        },
        // @method getCenter(round?: Boolean): Point
        // Returns the center point of the bounds.
        getCenter: function(round) {
          return toPoint(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2,
            round
          );
        },
        // @method getBottomLeft(): Point
        // Returns the bottom-left point of the bounds.
        getBottomLeft: function() {
          return toPoint(this.min.x, this.max.y);
        },
        // @method getTopRight(): Point
        // Returns the top-right point of the bounds.
        getTopRight: function() {
          return toPoint(this.max.x, this.min.y);
        },
        // @method getTopLeft(): Point
        // Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
        getTopLeft: function() {
          return this.min;
        },
        // @method getBottomRight(): Point
        // Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
        getBottomRight: function() {
          return this.max;
        },
        // @method getSize(): Point
        // Returns the size of the given bounds
        getSize: function() {
          return this.max.subtract(this.min);
        },
        // @method contains(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle contains the given one.
        // @alternative
        // @method contains(point: Point): Boolean
        // Returns `true` if the rectangle contains the given point.
        contains: function(obj) {
          var min, max;
          if (typeof obj[0] === "number" || obj instanceof Point) {
            obj = toPoint(obj);
          } else {
            obj = toBounds(obj);
          }
          if (obj instanceof Bounds) {
            min = obj.min;
            max = obj.max;
          } else {
            min = max = obj;
          }
          return min.x >= this.min.x && max.x <= this.max.x && min.y >= this.min.y && max.y <= this.max.y;
        },
        // @method intersects(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle intersects the given bounds. Two bounds
        // intersect if they have at least one point in common.
        intersects: function(bounds) {
          bounds = toBounds(bounds);
          var min = this.min, max = this.max, min2 = bounds.min, max2 = bounds.max, xIntersects = max2.x >= min.x && min2.x <= max.x, yIntersects = max2.y >= min.y && min2.y <= max.y;
          return xIntersects && yIntersects;
        },
        // @method overlaps(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle overlaps the given bounds. Two bounds
        // overlap if their intersection is an area.
        overlaps: function(bounds) {
          bounds = toBounds(bounds);
          var min = this.min, max = this.max, min2 = bounds.min, max2 = bounds.max, xOverlaps = max2.x > min.x && min2.x < max.x, yOverlaps = max2.y > min.y && min2.y < max.y;
          return xOverlaps && yOverlaps;
        },
        // @method isValid(): Boolean
        // Returns `true` if the bounds are properly initialized.
        isValid: function() {
          return !!(this.min && this.max);
        },
        // @method pad(bufferRatio: Number): Bounds
        // Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
        // For example, a ratio of 0.5 extends the bounds by 50% in each direction.
        // Negative values will retract the bounds.
        pad: function(bufferRatio) {
          var min = this.min, max = this.max, heightBuffer = Math.abs(min.x - max.x) * bufferRatio, widthBuffer = Math.abs(min.y - max.y) * bufferRatio;
          return toBounds(
            toPoint(min.x - heightBuffer, min.y - widthBuffer),
            toPoint(max.x + heightBuffer, max.y + widthBuffer)
          );
        },
        // @method equals(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle is equivalent to the given bounds.
        equals: function(bounds) {
          if (!bounds) {
            return false;
          }
          bounds = toBounds(bounds);
          return this.min.equals(bounds.getTopLeft()) && this.max.equals(bounds.getBottomRight());
        }
      };
      function toBounds(a, b) {
        if (!a || a instanceof Bounds) {
          return a;
        }
        return new Bounds(a, b);
      }
      function LatLngBounds(corner1, corner2) {
        if (!corner1) {
          return;
        }
        var latlngs = corner2 ? [corner1, corner2] : corner1;
        for (var i = 0, len = latlngs.length; i < len; i++) {
          this.extend(latlngs[i]);
        }
      }
      LatLngBounds.prototype = {
        // @method extend(latlng: LatLng): this
        // Extend the bounds to contain the given point
        // @alternative
        // @method extend(otherBounds: LatLngBounds): this
        // Extend the bounds to contain the given bounds
        extend: function(obj) {
          var sw = this._southWest, ne = this._northEast, sw2, ne2;
          if (obj instanceof LatLng) {
            sw2 = obj;
            ne2 = obj;
          } else if (obj instanceof LatLngBounds) {
            sw2 = obj._southWest;
            ne2 = obj._northEast;
            if (!sw2 || !ne2) {
              return this;
            }
          } else {
            return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
          }
          if (!sw && !ne) {
            this._southWest = new LatLng(sw2.lat, sw2.lng);
            this._northEast = new LatLng(ne2.lat, ne2.lng);
          } else {
            sw.lat = Math.min(sw2.lat, sw.lat);
            sw.lng = Math.min(sw2.lng, sw.lng);
            ne.lat = Math.max(ne2.lat, ne.lat);
            ne.lng = Math.max(ne2.lng, ne.lng);
          }
          return this;
        },
        // @method pad(bufferRatio: Number): LatLngBounds
        // Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
        // For example, a ratio of 0.5 extends the bounds by 50% in each direction.
        // Negative values will retract the bounds.
        pad: function(bufferRatio) {
          var sw = this._southWest, ne = this._northEast, heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio, widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;
          return new LatLngBounds(
            new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
            new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer)
          );
        },
        // @method getCenter(): LatLng
        // Returns the center point of the bounds.
        getCenter: function() {
          return new LatLng(
            (this._southWest.lat + this._northEast.lat) / 2,
            (this._southWest.lng + this._northEast.lng) / 2
          );
        },
        // @method getSouthWest(): LatLng
        // Returns the south-west point of the bounds.
        getSouthWest: function() {
          return this._southWest;
        },
        // @method getNorthEast(): LatLng
        // Returns the north-east point of the bounds.
        getNorthEast: function() {
          return this._northEast;
        },
        // @method getNorthWest(): LatLng
        // Returns the north-west point of the bounds.
        getNorthWest: function() {
          return new LatLng(this.getNorth(), this.getWest());
        },
        // @method getSouthEast(): LatLng
        // Returns the south-east point of the bounds.
        getSouthEast: function() {
          return new LatLng(this.getSouth(), this.getEast());
        },
        // @method getWest(): Number
        // Returns the west longitude of the bounds
        getWest: function() {
          return this._southWest.lng;
        },
        // @method getSouth(): Number
        // Returns the south latitude of the bounds
        getSouth: function() {
          return this._southWest.lat;
        },
        // @method getEast(): Number
        // Returns the east longitude of the bounds
        getEast: function() {
          return this._northEast.lng;
        },
        // @method getNorth(): Number
        // Returns the north latitude of the bounds
        getNorth: function() {
          return this._northEast.lat;
        },
        // @method contains(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle contains the given one.
        // @alternative
        // @method contains (latlng: LatLng): Boolean
        // Returns `true` if the rectangle contains the given point.
        contains: function(obj) {
          if (typeof obj[0] === "number" || obj instanceof LatLng || "lat" in obj) {
            obj = toLatLng(obj);
          } else {
            obj = toLatLngBounds(obj);
          }
          var sw = this._southWest, ne = this._northEast, sw2, ne2;
          if (obj instanceof LatLngBounds) {
            sw2 = obj.getSouthWest();
            ne2 = obj.getNorthEast();
          } else {
            sw2 = ne2 = obj;
          }
          return sw2.lat >= sw.lat && ne2.lat <= ne.lat && sw2.lng >= sw.lng && ne2.lng <= ne.lng;
        },
        // @method intersects(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
        intersects: function(bounds) {
          bounds = toLatLngBounds(bounds);
          var sw = this._southWest, ne = this._northEast, sw2 = bounds.getSouthWest(), ne2 = bounds.getNorthEast(), latIntersects = ne2.lat >= sw.lat && sw2.lat <= ne.lat, lngIntersects = ne2.lng >= sw.lng && sw2.lng <= ne.lng;
          return latIntersects && lngIntersects;
        },
        // @method overlaps(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
        overlaps: function(bounds) {
          bounds = toLatLngBounds(bounds);
          var sw = this._southWest, ne = this._northEast, sw2 = bounds.getSouthWest(), ne2 = bounds.getNorthEast(), latOverlaps = ne2.lat > sw.lat && sw2.lat < ne.lat, lngOverlaps = ne2.lng > sw.lng && sw2.lng < ne.lng;
          return latOverlaps && lngOverlaps;
        },
        // @method toBBoxString(): String
        // Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
        toBBoxString: function() {
          return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(",");
        },
        // @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
        // Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
        equals: function(bounds, maxMargin) {
          if (!bounds) {
            return false;
          }
          bounds = toLatLngBounds(bounds);
          return this._southWest.equals(bounds.getSouthWest(), maxMargin) && this._northEast.equals(bounds.getNorthEast(), maxMargin);
        },
        // @method isValid(): Boolean
        // Returns `true` if the bounds are properly initialized.
        isValid: function() {
          return !!(this._southWest && this._northEast);
        }
      };
      function toLatLngBounds(a, b) {
        if (a instanceof LatLngBounds) {
          return a;
        }
        return new LatLngBounds(a, b);
      }
      function LatLng(lat, lng, alt) {
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error("Invalid LatLng object: (" + lat + ", " + lng + ")");
        }
        this.lat = +lat;
        this.lng = +lng;
        if (alt !== void 0) {
          this.alt = +alt;
        }
      }
      LatLng.prototype = {
        // @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
        // Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
        equals: function(obj, maxMargin) {
          if (!obj) {
            return false;
          }
          obj = toLatLng(obj);
          var margin = Math.max(
            Math.abs(this.lat - obj.lat),
            Math.abs(this.lng - obj.lng)
          );
          return margin <= (maxMargin === void 0 ? 1e-9 : maxMargin);
        },
        // @method toString(): String
        // Returns a string representation of the point (for debugging purposes).
        toString: function(precision) {
          return "LatLng(" + formatNum(this.lat, precision) + ", " + formatNum(this.lng, precision) + ")";
        },
        // @method distanceTo(otherLatLng: LatLng): Number
        // Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
        distanceTo: function(other) {
          return Earth.distance(this, toLatLng(other));
        },
        // @method wrap(): LatLng
        // Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
        wrap: function() {
          return Earth.wrapLatLng(this);
        },
        // @method toBounds(sizeInMeters: Number): LatLngBounds
        // Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
        toBounds: function(sizeInMeters) {
          var latAccuracy = 180 * sizeInMeters / 40075017, lngAccuracy = latAccuracy / Math.cos(Math.PI / 180 * this.lat);
          return toLatLngBounds(
            [this.lat - latAccuracy, this.lng - lngAccuracy],
            [this.lat + latAccuracy, this.lng + lngAccuracy]
          );
        },
        clone: function() {
          return new LatLng(this.lat, this.lng, this.alt);
        }
      };
      function toLatLng(a, b, c) {
        if (a instanceof LatLng) {
          return a;
        }
        if (isArray(a) && typeof a[0] !== "object") {
          if (a.length === 3) {
            return new LatLng(a[0], a[1], a[2]);
          }
          if (a.length === 2) {
            return new LatLng(a[0], a[1]);
          }
          return null;
        }
        if (a === void 0 || a === null) {
          return a;
        }
        if (typeof a === "object" && "lat" in a) {
          return new LatLng(a.lat, "lng" in a ? a.lng : a.lon, a.alt);
        }
        if (b === void 0) {
          return null;
        }
        return new LatLng(a, b, c);
      }
      var CRS = {
        // @method latLngToPoint(latlng: LatLng, zoom: Number): Point
        // Projects geographical coordinates into pixel coordinates for a given zoom.
        latLngToPoint: function(latlng, zoom2) {
          var projectedPoint = this.projection.project(latlng), scale2 = this.scale(zoom2);
          return this.transformation._transform(projectedPoint, scale2);
        },
        // @method pointToLatLng(point: Point, zoom: Number): LatLng
        // The inverse of `latLngToPoint`. Projects pixel coordinates on a given
        // zoom into geographical coordinates.
        pointToLatLng: function(point, zoom2) {
          var scale2 = this.scale(zoom2), untransformedPoint = this.transformation.untransform(point, scale2);
          return this.projection.unproject(untransformedPoint);
        },
        // @method project(latlng: LatLng): Point
        // Projects geographical coordinates into coordinates in units accepted for
        // this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
        project: function(latlng) {
          return this.projection.project(latlng);
        },
        // @method unproject(point: Point): LatLng
        // Given a projected coordinate returns the corresponding LatLng.
        // The inverse of `project`.
        unproject: function(point) {
          return this.projection.unproject(point);
        },
        // @method scale(zoom: Number): Number
        // Returns the scale used when transforming projected coordinates into
        // pixel coordinates for a particular zoom. For example, it returns
        // `256 * 2^zoom` for Mercator-based CRS.
        scale: function(zoom2) {
          return 256 * Math.pow(2, zoom2);
        },
        // @method zoom(scale: Number): Number
        // Inverse of `scale()`, returns the zoom level corresponding to a scale
        // factor of `scale`.
        zoom: function(scale2) {
          return Math.log(scale2 / 256) / Math.LN2;
        },
        // @method getProjectedBounds(zoom: Number): Bounds
        // Returns the projection's bounds scaled and transformed for the provided `zoom`.
        getProjectedBounds: function(zoom2) {
          if (this.infinite) {
            return null;
          }
          var b = this.projection.bounds, s = this.scale(zoom2), min = this.transformation.transform(b.min, s), max = this.transformation.transform(b.max, s);
          return new Bounds(min, max);
        },
        // @method distance(latlng1: LatLng, latlng2: LatLng): Number
        // Returns the distance between two geographical coordinates.
        // @property code: String
        // Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
        //
        // @property wrapLng: Number[]
        // An array of two numbers defining whether the longitude (horizontal) coordinate
        // axis wraps around a given range and how. Defaults to `[-180, 180]` in most
        // geographical CRSs. If `undefined`, the longitude axis does not wrap around.
        //
        // @property wrapLat: Number[]
        // Like `wrapLng`, but for the latitude (vertical) axis.
        // wrapLng: [min, max],
        // wrapLat: [min, max],
        // @property infinite: Boolean
        // If true, the coordinate space will be unbounded (infinite in both axes)
        infinite: false,
        // @method wrapLatLng(latlng: LatLng): LatLng
        // Returns a `LatLng` where lat and lng has been wrapped according to the
        // CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
        wrapLatLng: function(latlng) {
          var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng, lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat, alt = latlng.alt;
          return new LatLng(lat, lng, alt);
        },
        // @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
        // Returns a `LatLngBounds` with the same size as the given one, ensuring
        // that its center is within the CRS's bounds.
        // Only accepts actual `L.LatLngBounds` instances, not arrays.
        wrapLatLngBounds: function(bounds) {
          var center = bounds.getCenter(), newCenter = this.wrapLatLng(center), latShift = center.lat - newCenter.lat, lngShift = center.lng - newCenter.lng;
          if (latShift === 0 && lngShift === 0) {
            return bounds;
          }
          var sw = bounds.getSouthWest(), ne = bounds.getNorthEast(), newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift), newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);
          return new LatLngBounds(newSw, newNe);
        }
      };
      var Earth = extend({}, CRS, {
        wrapLng: [-180, 180],
        // Mean Earth Radius, as recommended for use by
        // the International Union of Geodesy and Geophysics,
        // see https://rosettacode.org/wiki/Haversine_formula
        R: 6371e3,
        // distance between two geographical points using spherical law of cosines approximation
        distance: function(latlng1, latlng2) {
          var rad = Math.PI / 180, lat1 = latlng1.lat * rad, lat2 = latlng2.lat * rad, sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2), sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2), a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon, c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return this.R * c;
        }
      });
      var earthRadius = 6378137;
      var SphericalMercator = {
        R: earthRadius,
        MAX_LATITUDE: 85.0511287798,
        project: function(latlng) {
          var d = Math.PI / 180, max = this.MAX_LATITUDE, lat = Math.max(Math.min(max, latlng.lat), -max), sin = Math.sin(lat * d);
          return new Point(
            this.R * latlng.lng * d,
            this.R * Math.log((1 + sin) / (1 - sin)) / 2
          );
        },
        unproject: function(point) {
          var d = 180 / Math.PI;
          return new LatLng(
            (2 * Math.atan(Math.exp(point.y / this.R)) - Math.PI / 2) * d,
            point.x * d / this.R
          );
        },
        bounds: (function() {
          var d = earthRadius * Math.PI;
          return new Bounds([-d, -d], [d, d]);
        })()
      };
      function Transformation(a, b, c, d) {
        if (isArray(a)) {
          this._a = a[0];
          this._b = a[1];
          this._c = a[2];
          this._d = a[3];
          return;
        }
        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
      }
      Transformation.prototype = {
        // @method transform(point: Point, scale?: Number): Point
        // Returns a transformed point, optionally multiplied by the given scale.
        // Only accepts actual `L.Point` instances, not arrays.
        transform: function(point, scale2) {
          return this._transform(point.clone(), scale2);
        },
        // destructive transform (faster)
        _transform: function(point, scale2) {
          scale2 = scale2 || 1;
          point.x = scale2 * (this._a * point.x + this._b);
          point.y = scale2 * (this._c * point.y + this._d);
          return point;
        },
        // @method untransform(point: Point, scale?: Number): Point
        // Returns the reverse transformation of the given point, optionally divided
        // by the given scale. Only accepts actual `L.Point` instances, not arrays.
        untransform: function(point, scale2) {
          scale2 = scale2 || 1;
          return new Point(
            (point.x / scale2 - this._b) / this._a,
            (point.y / scale2 - this._d) / this._c
          );
        }
      };
      function toTransformation(a, b, c, d) {
        return new Transformation(a, b, c, d);
      }
      var EPSG3857 = extend({}, Earth, {
        code: "EPSG:3857",
        projection: SphericalMercator,
        transformation: (function() {
          var scale2 = 0.5 / (Math.PI * SphericalMercator.R);
          return toTransformation(scale2, 0.5, -scale2, 0.5);
        })()
      });
      var EPSG900913 = extend({}, EPSG3857, {
        code: "EPSG:900913"
      });
      function svgCreate(name) {
        return document.createElementNS("http://www.w3.org/2000/svg", name);
      }
      function pointsToPath(rings, closed) {
        var str = "", i, j, len, len2, points, p;
        for (i = 0, len = rings.length; i < len; i++) {
          points = rings[i];
          for (j = 0, len2 = points.length; j < len2; j++) {
            p = points[j];
            str += (j ? "L" : "M") + p.x + " " + p.y;
          }
          str += closed ? Browser.svg ? "z" : "x" : "";
        }
        return str || "M0 0";
      }
      var style = document.documentElement.style;
      var ie = "ActiveXObject" in window;
      var ielt9 = ie && !document.addEventListener;
      var edge = "msLaunchUri" in navigator && !("documentMode" in document);
      var webkit = userAgentContains("webkit");
      var android = userAgentContains("android");
      var android23 = userAgentContains("android 2") || userAgentContains("android 3");
      var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10);
      var androidStock = android && userAgentContains("Google") && webkitVer < 537 && !("AudioNode" in window);
      var opera = !!window.opera;
      var chrome = !edge && userAgentContains("chrome");
      var gecko = userAgentContains("gecko") && !webkit && !opera && !ie;
      var safari = !chrome && userAgentContains("safari");
      var phantom = userAgentContains("phantom");
      var opera12 = "OTransition" in style;
      var win = navigator.platform.indexOf("Win") === 0;
      var ie3d = ie && "transition" in style;
      var webkit3d = "WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix() && !android23;
      var gecko3d = "MozPerspective" in style;
      var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;
      var mobile = typeof orientation !== "undefined" || userAgentContains("mobile");
      var mobileWebkit = mobile && webkit;
      var mobileWebkit3d = mobile && webkit3d;
      var msPointer = !window.PointerEvent && window.MSPointerEvent;
      var pointer = !!(window.PointerEvent || msPointer);
      var touchNative = "ontouchstart" in window || !!window.TouchEvent;
      var touch = !window.L_NO_TOUCH && (touchNative || pointer);
      var mobileOpera = mobile && opera;
      var mobileGecko = mobile && gecko;
      var retina = (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI) > 1;
      var passiveEvents = (function() {
        var supportsPassiveOption = false;
        try {
          var opts = Object.defineProperty({}, "passive", {
            get: function() {
              supportsPassiveOption = true;
            }
          });
          window.addEventListener("testPassiveEventSupport", falseFn, opts);
          window.removeEventListener("testPassiveEventSupport", falseFn, opts);
        } catch (e) {
        }
        return supportsPassiveOption;
      })();
      var canvas$1 = (function() {
        return !!document.createElement("canvas").getContext;
      })();
      var svg$1 = !!(document.createElementNS && svgCreate("svg").createSVGRect);
      var inlineSvg = !!svg$1 && (function() {
        var div = document.createElement("div");
        div.innerHTML = "<svg/>";
        return (div.firstChild && div.firstChild.namespaceURI) === "http://www.w3.org/2000/svg";
      })();
      var vml = !svg$1 && (function() {
        try {
          var div = document.createElement("div");
          div.innerHTML = '<v:shape adj="1"/>';
          var shape = div.firstChild;
          shape.style.behavior = "url(#default#VML)";
          return shape && typeof shape.adj === "object";
        } catch (e) {
          return false;
        }
      })();
      var mac = navigator.platform.indexOf("Mac") === 0;
      var linux = navigator.platform.indexOf("Linux") === 0;
      function userAgentContains(str) {
        return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
      }
      var Browser = {
        ie,
        ielt9,
        edge,
        webkit,
        android,
        android23,
        androidStock,
        opera,
        chrome,
        gecko,
        safari,
        phantom,
        opera12,
        win,
        ie3d,
        webkit3d,
        gecko3d,
        any3d,
        mobile,
        mobileWebkit,
        mobileWebkit3d,
        msPointer,
        pointer,
        touch,
        touchNative,
        mobileOpera,
        mobileGecko,
        retina,
        passiveEvents,
        canvas: canvas$1,
        svg: svg$1,
        vml,
        inlineSvg,
        mac,
        linux
      };
      var POINTER_DOWN = Browser.msPointer ? "MSPointerDown" : "pointerdown";
      var POINTER_MOVE = Browser.msPointer ? "MSPointerMove" : "pointermove";
      var POINTER_UP = Browser.msPointer ? "MSPointerUp" : "pointerup";
      var POINTER_CANCEL = Browser.msPointer ? "MSPointerCancel" : "pointercancel";
      var pEvent = {
        touchstart: POINTER_DOWN,
        touchmove: POINTER_MOVE,
        touchend: POINTER_UP,
        touchcancel: POINTER_CANCEL
      };
      var handle = {
        touchstart: _onPointerStart,
        touchmove: _handlePointer,
        touchend: _handlePointer,
        touchcancel: _handlePointer
      };
      var _pointers = {};
      var _pointerDocListener = false;
      function addPointerListener(obj, type, handler) {
        if (type === "touchstart") {
          _addPointerDocListener();
        }
        if (!handle[type]) {
          console.warn("wrong event specified:", type);
          return falseFn;
        }
        handler = handle[type].bind(this, handler);
        obj.addEventListener(pEvent[type], handler, false);
        return handler;
      }
      function removePointerListener(obj, type, handler) {
        if (!pEvent[type]) {
          console.warn("wrong event specified:", type);
          return;
        }
        obj.removeEventListener(pEvent[type], handler, false);
      }
      function _globalPointerDown(e) {
        _pointers[e.pointerId] = e;
      }
      function _globalPointerMove(e) {
        if (_pointers[e.pointerId]) {
          _pointers[e.pointerId] = e;
        }
      }
      function _globalPointerUp(e) {
        delete _pointers[e.pointerId];
      }
      function _addPointerDocListener() {
        if (!_pointerDocListener) {
          document.addEventListener(POINTER_DOWN, _globalPointerDown, true);
          document.addEventListener(POINTER_MOVE, _globalPointerMove, true);
          document.addEventListener(POINTER_UP, _globalPointerUp, true);
          document.addEventListener(POINTER_CANCEL, _globalPointerUp, true);
          _pointerDocListener = true;
        }
      }
      function _handlePointer(handler, e) {
        if (e.pointerType === (e.MSPOINTER_TYPE_MOUSE || "mouse")) {
          return;
        }
        e.touches = [];
        for (var i in _pointers) {
          e.touches.push(_pointers[i]);
        }
        e.changedTouches = [e];
        handler(e);
      }
      function _onPointerStart(handler, e) {
        if (e.MSPOINTER_TYPE_TOUCH && e.pointerType === e.MSPOINTER_TYPE_TOUCH) {
          preventDefault(e);
        }
        _handlePointer(handler, e);
      }
      function makeDblclick(event) {
        var newEvent = {}, prop, i;
        for (i in event) {
          prop = event[i];
          newEvent[i] = prop && prop.bind ? prop.bind(event) : prop;
        }
        event = newEvent;
        newEvent.type = "dblclick";
        newEvent.detail = 2;
        newEvent.isTrusted = false;
        newEvent._simulated = true;
        return newEvent;
      }
      var delay = 200;
      function addDoubleTapListener(obj, handler) {
        obj.addEventListener("dblclick", handler);
        var last = 0, detail;
        function simDblclick(e) {
          if (e.detail !== 1) {
            detail = e.detail;
            return;
          }
          if (e.pointerType === "mouse" || e.sourceCapabilities && !e.sourceCapabilities.firesTouchEvents) {
            return;
          }
          var path = getPropagationPath(e);
          if (path.some(function(el) {
            return el instanceof HTMLLabelElement && el.attributes.for;
          }) && !path.some(function(el) {
            return el instanceof HTMLInputElement || el instanceof HTMLSelectElement;
          })) {
            return;
          }
          var now = Date.now();
          if (now - last <= delay) {
            detail++;
            if (detail === 2) {
              handler(makeDblclick(e));
            }
          } else {
            detail = 1;
          }
          last = now;
        }
        obj.addEventListener("click", simDblclick);
        return {
          dblclick: handler,
          simDblclick
        };
      }
      function removeDoubleTapListener(obj, handlers) {
        obj.removeEventListener("dblclick", handlers.dblclick);
        obj.removeEventListener("click", handlers.simDblclick);
      }
      var TRANSFORM = testProp(
        ["transform", "webkitTransform", "OTransform", "MozTransform", "msTransform"]
      );
      var TRANSITION = testProp(
        ["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]
      );
      var TRANSITION_END = TRANSITION === "webkitTransition" || TRANSITION === "OTransition" ? TRANSITION + "End" : "transitionend";
      function get(id) {
        return typeof id === "string" ? document.getElementById(id) : id;
      }
      function getStyle(el, style2) {
        var value = el.style[style2] || el.currentStyle && el.currentStyle[style2];
        if ((!value || value === "auto") && document.defaultView) {
          var css = document.defaultView.getComputedStyle(el, null);
          value = css ? css[style2] : null;
        }
        return value === "auto" ? null : value;
      }
      function create$1(tagName, className, container) {
        var el = document.createElement(tagName);
        el.className = className || "";
        if (container) {
          container.appendChild(el);
        }
        return el;
      }
      function remove(el) {
        var parent = el.parentNode;
        if (parent) {
          parent.removeChild(el);
        }
      }
      function empty(el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      }
      function toFront(el) {
        var parent = el.parentNode;
        if (parent && parent.lastChild !== el) {
          parent.appendChild(el);
        }
      }
      function toBack(el) {
        var parent = el.parentNode;
        if (parent && parent.firstChild !== el) {
          parent.insertBefore(el, parent.firstChild);
        }
      }
      function hasClass(el, name) {
        if (el.classList !== void 0) {
          return el.classList.contains(name);
        }
        var className = getClass(el);
        return className.length > 0 && new RegExp("(^|\\s)" + name + "(\\s|$)").test(className);
      }
      function addClass(el, name) {
        if (el.classList !== void 0) {
          var classes = splitWords(name);
          for (var i = 0, len = classes.length; i < len; i++) {
            el.classList.add(classes[i]);
          }
        } else if (!hasClass(el, name)) {
          var className = getClass(el);
          setClass(el, (className ? className + " " : "") + name);
        }
      }
      function removeClass(el, name) {
        if (el.classList !== void 0) {
          el.classList.remove(name);
        } else {
          setClass(el, trim((" " + getClass(el) + " ").replace(" " + name + " ", " ")));
        }
      }
      function setClass(el, name) {
        if (el.className.baseVal === void 0) {
          el.className = name;
        } else {
          el.className.baseVal = name;
        }
      }
      function getClass(el) {
        if (el.correspondingElement) {
          el = el.correspondingElement;
        }
        return el.className.baseVal === void 0 ? el.className : el.className.baseVal;
      }
      function setOpacity(el, value) {
        if ("opacity" in el.style) {
          el.style.opacity = value;
        } else if ("filter" in el.style) {
          _setOpacityIE(el, value);
        }
      }
      function _setOpacityIE(el, value) {
        var filter = false, filterName = "DXImageTransform.Microsoft.Alpha";
        try {
          filter = el.filters.item(filterName);
        } catch (e) {
          if (value === 1) {
            return;
          }
        }
        value = Math.round(value * 100);
        if (filter) {
          filter.Enabled = value !== 100;
          filter.Opacity = value;
        } else {
          el.style.filter += " progid:" + filterName + "(opacity=" + value + ")";
        }
      }
      function testProp(props) {
        var style2 = document.documentElement.style;
        for (var i = 0; i < props.length; i++) {
          if (props[i] in style2) {
            return props[i];
          }
        }
        return false;
      }
      function setTransform(el, offset, scale2) {
        var pos = offset || new Point(0, 0);
        el.style[TRANSFORM] = (Browser.ie3d ? "translate(" + pos.x + "px," + pos.y + "px)" : "translate3d(" + pos.x + "px," + pos.y + "px,0)") + (scale2 ? " scale(" + scale2 + ")" : "");
      }
      function setPosition(el, point) {
        el._leaflet_pos = point;
        if (Browser.any3d) {
          setTransform(el, point);
        } else {
          el.style.left = point.x + "px";
          el.style.top = point.y + "px";
        }
      }
      function getPosition(el) {
        return el._leaflet_pos || new Point(0, 0);
      }
      var disableTextSelection;
      var enableTextSelection;
      var _userSelect;
      if ("onselectstart" in document) {
        disableTextSelection = function() {
          on(window, "selectstart", preventDefault);
        };
        enableTextSelection = function() {
          off(window, "selectstart", preventDefault);
        };
      } else {
        var userSelectProperty = testProp(
          ["userSelect", "WebkitUserSelect", "OUserSelect", "MozUserSelect", "msUserSelect"]
        );
        disableTextSelection = function() {
          if (userSelectProperty) {
            var style2 = document.documentElement.style;
            _userSelect = style2[userSelectProperty];
            style2[userSelectProperty] = "none";
          }
        };
        enableTextSelection = function() {
          if (userSelectProperty) {
            document.documentElement.style[userSelectProperty] = _userSelect;
            _userSelect = void 0;
          }
        };
      }
      function disableImageDrag() {
        on(window, "dragstart", preventDefault);
      }
      function enableImageDrag() {
        off(window, "dragstart", preventDefault);
      }
      var _outlineElement, _outlineStyle;
      function preventOutline(element) {
        while (element.tabIndex === -1) {
          element = element.parentNode;
        }
        if (!element.style) {
          return;
        }
        restoreOutline();
        _outlineElement = element;
        _outlineStyle = element.style.outlineStyle;
        element.style.outlineStyle = "none";
        on(window, "keydown", restoreOutline);
      }
      function restoreOutline() {
        if (!_outlineElement) {
          return;
        }
        _outlineElement.style.outlineStyle = _outlineStyle;
        _outlineElement = void 0;
        _outlineStyle = void 0;
        off(window, "keydown", restoreOutline);
      }
      function getSizedParentNode(element) {
        do {
          element = element.parentNode;
        } while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
        return element;
      }
      function getScale(element) {
        var rect = element.getBoundingClientRect();
        return {
          x: rect.width / element.offsetWidth || 1,
          y: rect.height / element.offsetHeight || 1,
          boundingClientRect: rect
        };
      }
      var DomUtil = {
        __proto__: null,
        TRANSFORM,
        TRANSITION,
        TRANSITION_END,
        get,
        getStyle,
        create: create$1,
        remove,
        empty,
        toFront,
        toBack,
        hasClass,
        addClass,
        removeClass,
        setClass,
        getClass,
        setOpacity,
        testProp,
        setTransform,
        setPosition,
        getPosition,
        get disableTextSelection() {
          return disableTextSelection;
        },
        get enableTextSelection() {
          return enableTextSelection;
        },
        disableImageDrag,
        enableImageDrag,
        preventOutline,
        restoreOutline,
        getSizedParentNode,
        getScale
      };
      function on(obj, types, fn, context) {
        if (types && typeof types === "object") {
          for (var type in types) {
            addOne(obj, type, types[type], fn);
          }
        } else {
          types = splitWords(types);
          for (var i = 0, len = types.length; i < len; i++) {
            addOne(obj, types[i], fn, context);
          }
        }
        return this;
      }
      var eventsKey = "_leaflet_events";
      function off(obj, types, fn, context) {
        if (arguments.length === 1) {
          batchRemove(obj);
          delete obj[eventsKey];
        } else if (types && typeof types === "object") {
          for (var type in types) {
            removeOne(obj, type, types[type], fn);
          }
        } else {
          types = splitWords(types);
          if (arguments.length === 2) {
            batchRemove(obj, function(type2) {
              return indexOf(types, type2) !== -1;
            });
          } else {
            for (var i = 0, len = types.length; i < len; i++) {
              removeOne(obj, types[i], fn, context);
            }
          }
        }
        return this;
      }
      function batchRemove(obj, filterFn) {
        for (var id in obj[eventsKey]) {
          var type = id.split(/\d/)[0];
          if (!filterFn || filterFn(type)) {
            removeOne(obj, type, null, null, id);
          }
        }
      }
      var mouseSubst = {
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        wheel: !("onwheel" in window) && "mousewheel"
      };
      function addOne(obj, type, fn, context) {
        var id = type + stamp(fn) + (context ? "_" + stamp(context) : "");
        if (obj[eventsKey] && obj[eventsKey][id]) {
          return this;
        }
        var handler = function(e) {
          return fn.call(context || obj, e || window.event);
        };
        var originalHandler = handler;
        if (!Browser.touchNative && Browser.pointer && type.indexOf("touch") === 0) {
          handler = addPointerListener(obj, type, handler);
        } else if (Browser.touch && type === "dblclick") {
          handler = addDoubleTapListener(obj, handler);
        } else if ("addEventListener" in obj) {
          if (type === "touchstart" || type === "touchmove" || type === "wheel" || type === "mousewheel") {
            obj.addEventListener(mouseSubst[type] || type, handler, Browser.passiveEvents ? { passive: false } : false);
          } else if (type === "mouseenter" || type === "mouseleave") {
            handler = function(e) {
              e = e || window.event;
              if (isExternalTarget(obj, e)) {
                originalHandler(e);
              }
            };
            obj.addEventListener(mouseSubst[type], handler, false);
          } else {
            obj.addEventListener(type, originalHandler, false);
          }
        } else {
          obj.attachEvent("on" + type, handler);
        }
        obj[eventsKey] = obj[eventsKey] || {};
        obj[eventsKey][id] = handler;
      }
      function removeOne(obj, type, fn, context, id) {
        id = id || type + stamp(fn) + (context ? "_" + stamp(context) : "");
        var handler = obj[eventsKey] && obj[eventsKey][id];
        if (!handler) {
          return this;
        }
        if (!Browser.touchNative && Browser.pointer && type.indexOf("touch") === 0) {
          removePointerListener(obj, type, handler);
        } else if (Browser.touch && type === "dblclick") {
          removeDoubleTapListener(obj, handler);
        } else if ("removeEventListener" in obj) {
          obj.removeEventListener(mouseSubst[type] || type, handler, false);
        } else {
          obj.detachEvent("on" + type, handler);
        }
        obj[eventsKey][id] = null;
      }
      function stopPropagation(e) {
        if (e.stopPropagation) {
          e.stopPropagation();
        } else if (e.originalEvent) {
          e.originalEvent._stopped = true;
        } else {
          e.cancelBubble = true;
        }
        return this;
      }
      function disableScrollPropagation(el) {
        addOne(el, "wheel", stopPropagation);
        return this;
      }
      function disableClickPropagation(el) {
        on(el, "mousedown touchstart dblclick contextmenu", stopPropagation);
        el["_leaflet_disable_click"] = true;
        return this;
      }
      function preventDefault(e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return this;
      }
      function stop(e) {
        preventDefault(e);
        stopPropagation(e);
        return this;
      }
      function getPropagationPath(ev) {
        if (ev.composedPath) {
          return ev.composedPath();
        }
        var path = [];
        var el = ev.target;
        while (el) {
          path.push(el);
          el = el.parentNode;
        }
        return path;
      }
      function getMousePosition(e, container) {
        if (!container) {
          return new Point(e.clientX, e.clientY);
        }
        var scale2 = getScale(container), offset = scale2.boundingClientRect;
        return new Point(
          // offset.left/top values are in page scale (like clientX/Y),
          // whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
          (e.clientX - offset.left) / scale2.x - container.clientLeft,
          (e.clientY - offset.top) / scale2.y - container.clientTop
        );
      }
      var wheelPxFactor = Browser.linux && Browser.chrome ? window.devicePixelRatio : Browser.mac ? window.devicePixelRatio * 3 : window.devicePixelRatio > 0 ? 2 * window.devicePixelRatio : 1;
      function getWheelDelta(e) {
        return Browser.edge ? e.wheelDeltaY / 2 : (
          // Don't trust window-geometry-based delta
          e.deltaY && e.deltaMode === 0 ? -e.deltaY / wheelPxFactor : (
            // Pixels
            e.deltaY && e.deltaMode === 1 ? -e.deltaY * 20 : (
              // Lines
              e.deltaY && e.deltaMode === 2 ? -e.deltaY * 60 : (
                // Pages
                e.deltaX || e.deltaZ ? 0 : (
                  // Skip horizontal/depth wheel events
                  e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : (
                    // Legacy IE pixels
                    e.detail && Math.abs(e.detail) < 32765 ? -e.detail * 20 : (
                      // Legacy Moz lines
                      e.detail ? e.detail / -32765 * 60 : (
                        // Legacy Moz pages
                        0
                      )
                    )
                  )
                )
              )
            )
          )
        );
      }
      function isExternalTarget(el, e) {
        var related = e.relatedTarget;
        if (!related) {
          return true;
        }
        try {
          while (related && related !== el) {
            related = related.parentNode;
          }
        } catch (err) {
          return false;
        }
        return related !== el;
      }
      var DomEvent = {
        __proto__: null,
        on,
        off,
        stopPropagation,
        disableScrollPropagation,
        disableClickPropagation,
        preventDefault,
        stop,
        getPropagationPath,
        getMousePosition,
        getWheelDelta,
        isExternalTarget,
        addListener: on,
        removeListener: off
      };
      var PosAnimation = Evented.extend({
        // @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
        // Run an animation of a given element to a new position, optionally setting
        // duration in seconds (`0.25` by default) and easing linearity factor (3rd
        // argument of the [cubic bezier curve](https://cubic-bezier.com/#0,0,.5,1),
        // `0.5` by default).
        run: function(el, newPos, duration, easeLinearity) {
          this.stop();
          this._el = el;
          this._inProgress = true;
          this._duration = duration || 0.25;
          this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);
          this._startPos = getPosition(el);
          this._offset = newPos.subtract(this._startPos);
          this._startTime = +/* @__PURE__ */ new Date();
          this.fire("start");
          this._animate();
        },
        // @method stop()
        // Stops the animation (if currently running).
        stop: function() {
          if (!this._inProgress) {
            return;
          }
          this._step(true);
          this._complete();
        },
        _animate: function() {
          this._animId = requestAnimFrame(this._animate, this);
          this._step();
        },
        _step: function(round) {
          var elapsed = +/* @__PURE__ */ new Date() - this._startTime, duration = this._duration * 1e3;
          if (elapsed < duration) {
            this._runFrame(this._easeOut(elapsed / duration), round);
          } else {
            this._runFrame(1);
            this._complete();
          }
        },
        _runFrame: function(progress, round) {
          var pos = this._startPos.add(this._offset.multiplyBy(progress));
          if (round) {
            pos._round();
          }
          setPosition(this._el, pos);
          this.fire("step");
        },
        _complete: function() {
          cancelAnimFrame(this._animId);
          this._inProgress = false;
          this.fire("end");
        },
        _easeOut: function(t) {
          return 1 - Math.pow(1 - t, this._easeOutPower);
        }
      });
      var Map2 = Evented.extend({
        options: {
          // @section Map State Options
          // @option crs: CRS = L.CRS.EPSG3857
          // The [Coordinate Reference System](#crs) to use. Don't change this if you're not
          // sure what it means.
          crs: EPSG3857,
          // @option center: LatLng = undefined
          // Initial geographic center of the map
          center: void 0,
          // @option zoom: Number = undefined
          // Initial map zoom level
          zoom: void 0,
          // @option minZoom: Number = *
          // Minimum zoom level of the map.
          // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
          // the lowest of their `minZoom` options will be used instead.
          minZoom: void 0,
          // @option maxZoom: Number = *
          // Maximum zoom level of the map.
          // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
          // the highest of their `maxZoom` options will be used instead.
          maxZoom: void 0,
          // @option layers: Layer[] = []
          // Array of layers that will be added to the map initially
          layers: [],
          // @option maxBounds: LatLngBounds = null
          // When this option is set, the map restricts the view to the given
          // geographical bounds, bouncing the user back if the user tries to pan
          // outside the view. To set the restriction dynamically, use
          // [`setMaxBounds`](#map-setmaxbounds) method.
          maxBounds: void 0,
          // @option renderer: Renderer = *
          // The default method for drawing vector layers on the map. `L.SVG`
          // or `L.Canvas` by default depending on browser support.
          renderer: void 0,
          // @section Animation Options
          // @option zoomAnimation: Boolean = true
          // Whether the map zoom animation is enabled. By default it's enabled
          // in all browsers that support CSS3 Transitions except Android.
          zoomAnimation: true,
          // @option zoomAnimationThreshold: Number = 4
          // Won't animate zoom if the zoom difference exceeds this value.
          zoomAnimationThreshold: 4,
          // @option fadeAnimation: Boolean = true
          // Whether the tile fade animation is enabled. By default it's enabled
          // in all browsers that support CSS3 Transitions except Android.
          fadeAnimation: true,
          // @option markerZoomAnimation: Boolean = true
          // Whether markers animate their zoom with the zoom animation, if disabled
          // they will disappear for the length of the animation. By default it's
          // enabled in all browsers that support CSS3 Transitions except Android.
          markerZoomAnimation: true,
          // @option transform3DLimit: Number = 2^23
          // Defines the maximum size of a CSS translation transform. The default
          // value should not be changed unless a web browser positions layers in
          // the wrong place after doing a large `panBy`.
          transform3DLimit: 8388608,
          // Precision limit of a 32-bit float
          // @section Interaction Options
          // @option zoomSnap: Number = 1
          // Forces the map's zoom level to always be a multiple of this, particularly
          // right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
          // By default, the zoom level snaps to the nearest integer; lower values
          // (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
          // means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
          zoomSnap: 1,
          // @option zoomDelta: Number = 1
          // Controls how much the map's zoom level will change after a
          // [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
          // or `-` on the keyboard, or using the [zoom controls](#control-zoom).
          // Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
          zoomDelta: 1,
          // @option trackResize: Boolean = true
          // Whether the map automatically handles browser window resize to update itself.
          trackResize: true
        },
        initialize: function(id, options) {
          options = setOptions(this, options);
          this._handlers = [];
          this._layers = {};
          this._zoomBoundLayers = {};
          this._sizeChanged = true;
          this._initContainer(id);
          this._initLayout();
          this._onResize = bind(this._onResize, this);
          this._initEvents();
          if (options.maxBounds) {
            this.setMaxBounds(options.maxBounds);
          }
          if (options.zoom !== void 0) {
            this._zoom = this._limitZoom(options.zoom);
          }
          if (options.center && options.zoom !== void 0) {
            this.setView(toLatLng(options.center), options.zoom, { reset: true });
          }
          this.callInitHooks();
          this._zoomAnimated = TRANSITION && Browser.any3d && !Browser.mobileOpera && this.options.zoomAnimation;
          if (this._zoomAnimated) {
            this._createAnimProxy();
            on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
          }
          this._addLayers(this.options.layers);
        },
        // @section Methods for modifying map state
        // @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
        // Sets the view of the map (geographical center and zoom) with the given
        // animation options.
        setView: function(center, zoom2, options) {
          zoom2 = zoom2 === void 0 ? this._zoom : this._limitZoom(zoom2);
          center = this._limitCenter(toLatLng(center), zoom2, this.options.maxBounds);
          options = options || {};
          this._stop();
          if (this._loaded && !options.reset && options !== true) {
            if (options.animate !== void 0) {
              options.zoom = extend({ animate: options.animate }, options.zoom);
              options.pan = extend({ animate: options.animate, duration: options.duration }, options.pan);
            }
            var moved = this._zoom !== zoom2 ? this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom2, options.zoom) : this._tryAnimatedPan(center, options.pan);
            if (moved) {
              clearTimeout(this._sizeTimer);
              return this;
            }
          }
          this._resetView(center, zoom2, options.pan && options.pan.noMoveStart);
          return this;
        },
        // @method setZoom(zoom: Number, options?: Zoom/pan options): this
        // Sets the zoom of the map.
        setZoom: function(zoom2, options) {
          if (!this._loaded) {
            this._zoom = zoom2;
            return this;
          }
          return this.setView(this.getCenter(), zoom2, { zoom: options });
        },
        // @method zoomIn(delta?: Number, options?: Zoom options): this
        // Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
        zoomIn: function(delta, options) {
          delta = delta || (Browser.any3d ? this.options.zoomDelta : 1);
          return this.setZoom(this._zoom + delta, options);
        },
        // @method zoomOut(delta?: Number, options?: Zoom options): this
        // Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
        zoomOut: function(delta, options) {
          delta = delta || (Browser.any3d ? this.options.zoomDelta : 1);
          return this.setZoom(this._zoom - delta, options);
        },
        // @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
        // Zooms the map while keeping a specified geographical point on the map
        // stationary (e.g. used internally for scroll zoom and double-click zoom).
        // @alternative
        // @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
        // Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
        setZoomAround: function(latlng, zoom2, options) {
          var scale2 = this.getZoomScale(zoom2), viewHalf = this.getSize().divideBy(2), containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng), centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale2), newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));
          return this.setView(newCenter, zoom2, { zoom: options });
        },
        _getBoundsCenterZoom: function(bounds, options) {
          options = options || {};
          bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);
          var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]), paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]), zoom2 = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));
          zoom2 = typeof options.maxZoom === "number" ? Math.min(options.maxZoom, zoom2) : zoom2;
          if (zoom2 === Infinity) {
            return {
              center: bounds.getCenter(),
              zoom: zoom2
            };
          }
          var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2), swPoint = this.project(bounds.getSouthWest(), zoom2), nePoint = this.project(bounds.getNorthEast(), zoom2), center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom2);
          return {
            center,
            zoom: zoom2
          };
        },
        // @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
        // Sets a map view that contains the given geographical bounds with the
        // maximum zoom level possible.
        fitBounds: function(bounds, options) {
          bounds = toLatLngBounds(bounds);
          if (!bounds.isValid()) {
            throw new Error("Bounds are not valid.");
          }
          var target = this._getBoundsCenterZoom(bounds, options);
          return this.setView(target.center, target.zoom, options);
        },
        // @method fitWorld(options?: fitBounds options): this
        // Sets a map view that mostly contains the whole world with the maximum
        // zoom level possible.
        fitWorld: function(options) {
          return this.fitBounds([[-90, -180], [90, 180]], options);
        },
        // @method panTo(latlng: LatLng, options?: Pan options): this
        // Pans the map to a given center.
        panTo: function(center, options) {
          return this.setView(center, this._zoom, { pan: options });
        },
        // @method panBy(offset: Point, options?: Pan options): this
        // Pans the map by a given number of pixels (animated).
        panBy: function(offset, options) {
          offset = toPoint(offset).round();
          options = options || {};
          if (!offset.x && !offset.y) {
            return this.fire("moveend");
          }
          if (options.animate !== true && !this.getSize().contains(offset)) {
            this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
            return this;
          }
          if (!this._panAnim) {
            this._panAnim = new PosAnimation();
            this._panAnim.on({
              "step": this._onPanTransitionStep,
              "end": this._onPanTransitionEnd
            }, this);
          }
          if (!options.noMoveStart) {
            this.fire("movestart");
          }
          if (options.animate !== false) {
            addClass(this._mapPane, "leaflet-pan-anim");
            var newPos = this._getMapPanePos().subtract(offset).round();
            this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
          } else {
            this._rawPanBy(offset);
            this.fire("move").fire("moveend");
          }
          return this;
        },
        // @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
        // Sets the view of the map (geographical center and zoom) performing a smooth
        // pan-zoom animation.
        flyTo: function(targetCenter, targetZoom, options) {
          options = options || {};
          if (options.animate === false || !Browser.any3d) {
            return this.setView(targetCenter, targetZoom, options);
          }
          this._stop();
          var from = this.project(this.getCenter()), to = this.project(targetCenter), size = this.getSize(), startZoom = this._zoom;
          targetCenter = toLatLng(targetCenter);
          targetZoom = targetZoom === void 0 ? startZoom : targetZoom;
          var w0 = Math.max(size.x, size.y), w1 = w0 * this.getZoomScale(startZoom, targetZoom), u1 = to.distanceTo(from) || 1, rho = 1.42, rho2 = rho * rho;
          function r(i) {
            var s1 = i ? -1 : 1, s2 = i ? w1 : w0, t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1, b1 = 2 * s2 * rho2 * u1, b = t1 / b1, sq = Math.sqrt(b * b + 1) - b;
            var log = sq < 1e-9 ? -18 : Math.log(sq);
            return log;
          }
          function sinh(n) {
            return (Math.exp(n) - Math.exp(-n)) / 2;
          }
          function cosh(n) {
            return (Math.exp(n) + Math.exp(-n)) / 2;
          }
          function tanh(n) {
            return sinh(n) / cosh(n);
          }
          var r0 = r(0);
          function w(s) {
            return w0 * (cosh(r0) / cosh(r0 + rho * s));
          }
          function u(s) {
            return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2;
          }
          function easeOut(t) {
            return 1 - Math.pow(1 - t, 1.5);
          }
          var start = Date.now(), S = (r(1) - r0) / rho, duration = options.duration ? 1e3 * options.duration : 1e3 * S * 0.8;
          function frame() {
            var t = (Date.now() - start) / duration, s = easeOut(t) * S;
            if (t <= 1) {
              this._flyToFrame = requestAnimFrame(frame, this);
              this._move(
                this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
                this.getScaleZoom(w0 / w(s), startZoom),
                { flyTo: true }
              );
            } else {
              this._move(targetCenter, targetZoom)._moveEnd(true);
            }
          }
          this._moveStart(true, options.noMoveStart);
          frame.call(this);
          return this;
        },
        // @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
        // Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
        // but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
        flyToBounds: function(bounds, options) {
          var target = this._getBoundsCenterZoom(bounds, options);
          return this.flyTo(target.center, target.zoom, options);
        },
        // @method setMaxBounds(bounds: LatLngBounds): this
        // Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
        setMaxBounds: function(bounds) {
          bounds = toLatLngBounds(bounds);
          if (this.listens("moveend", this._panInsideMaxBounds)) {
            this.off("moveend", this._panInsideMaxBounds);
          }
          if (!bounds.isValid()) {
            this.options.maxBounds = null;
            return this;
          }
          this.options.maxBounds = bounds;
          if (this._loaded) {
            this._panInsideMaxBounds();
          }
          return this.on("moveend", this._panInsideMaxBounds);
        },
        // @method setMinZoom(zoom: Number): this
        // Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
        setMinZoom: function(zoom2) {
          var oldZoom = this.options.minZoom;
          this.options.minZoom = zoom2;
          if (this._loaded && oldZoom !== zoom2) {
            this.fire("zoomlevelschange");
            if (this.getZoom() < this.options.minZoom) {
              return this.setZoom(zoom2);
            }
          }
          return this;
        },
        // @method setMaxZoom(zoom: Number): this
        // Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
        setMaxZoom: function(zoom2) {
          var oldZoom = this.options.maxZoom;
          this.options.maxZoom = zoom2;
          if (this._loaded && oldZoom !== zoom2) {
            this.fire("zoomlevelschange");
            if (this.getZoom() > this.options.maxZoom) {
              return this.setZoom(zoom2);
            }
          }
          return this;
        },
        // @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
        // Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
        panInsideBounds: function(bounds, options) {
          this._enforcingBounds = true;
          var center = this.getCenter(), newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));
          if (!center.equals(newCenter)) {
            this.panTo(newCenter, options);
          }
          this._enforcingBounds = false;
          return this;
        },
        // @method panInside(latlng: LatLng, options?: padding options): this
        // Pans the map the minimum amount to make the `latlng` visible. Use
        // padding options to fit the display to more restricted bounds.
        // If `latlng` is already within the (optionally padded) display bounds,
        // the map will not be panned.
        panInside: function(latlng, options) {
          options = options || {};
          var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]), paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]), pixelCenter = this.project(this.getCenter()), pixelPoint = this.project(latlng), pixelBounds = this.getPixelBounds(), paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]), paddedSize = paddedBounds.getSize();
          if (!paddedBounds.contains(pixelPoint)) {
            this._enforcingBounds = true;
            var centerOffset = pixelPoint.subtract(paddedBounds.getCenter());
            var offset = paddedBounds.extend(pixelPoint).getSize().subtract(paddedSize);
            pixelCenter.x += centerOffset.x < 0 ? -offset.x : offset.x;
            pixelCenter.y += centerOffset.y < 0 ? -offset.y : offset.y;
            this.panTo(this.unproject(pixelCenter), options);
            this._enforcingBounds = false;
          }
          return this;
        },
        // @method invalidateSize(options: Zoom/pan options): this
        // Checks if the map container size changed and updates the map if so —
        // call it after you've changed the map size dynamically, also animating
        // pan by default. If `options.pan` is `false`, panning will not occur.
        // If `options.debounceMoveend` is `true`, it will delay `moveend` event so
        // that it doesn't happen often even if the method is called many
        // times in a row.
        // @alternative
        // @method invalidateSize(animate: Boolean): this
        // Checks if the map container size changed and updates the map if so —
        // call it after you've changed the map size dynamically, also animating
        // pan by default.
        invalidateSize: function(options) {
          if (!this._loaded) {
            return this;
          }
          options = extend({
            animate: false,
            pan: true
          }, options === true ? { animate: true } : options);
          var oldSize = this.getSize();
          this._sizeChanged = true;
          this._lastCenter = null;
          var newSize = this.getSize(), oldCenter = oldSize.divideBy(2).round(), newCenter = newSize.divideBy(2).round(), offset = oldCenter.subtract(newCenter);
          if (!offset.x && !offset.y) {
            return this;
          }
          if (options.animate && options.pan) {
            this.panBy(offset);
          } else {
            if (options.pan) {
              this._rawPanBy(offset);
            }
            this.fire("move");
            if (options.debounceMoveend) {
              clearTimeout(this._sizeTimer);
              this._sizeTimer = setTimeout(bind(this.fire, this, "moveend"), 200);
            } else {
              this.fire("moveend");
            }
          }
          return this.fire("resize", {
            oldSize,
            newSize
          });
        },
        // @section Methods for modifying map state
        // @method stop(): this
        // Stops the currently running `panTo` or `flyTo` animation, if any.
        stop: function() {
          this.setZoom(this._limitZoom(this._zoom));
          if (!this.options.zoomSnap) {
            this.fire("viewreset");
          }
          return this._stop();
        },
        // @section Geolocation methods
        // @method locate(options?: Locate options): this
        // Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
        // event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
        // and optionally sets the map view to the user's location with respect to
        // detection accuracy (or to the world view if geolocation failed).
        // Note that, if your page doesn't use HTTPS, this method will fail in
        // modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
        // See `Locate options` for more details.
        locate: function(options) {
          options = this._locateOptions = extend({
            timeout: 1e4,
            watch: false
            // setView: false
            // maxZoom: <Number>
            // maximumAge: 0
            // enableHighAccuracy: false
          }, options);
          if (!("geolocation" in navigator)) {
            this._handleGeolocationError({
              code: 0,
              message: "Geolocation not supported."
            });
            return this;
          }
          var onResponse = bind(this._handleGeolocationResponse, this), onError = bind(this._handleGeolocationError, this);
          if (options.watch) {
            this._locationWatchId = navigator.geolocation.watchPosition(onResponse, onError, options);
          } else {
            navigator.geolocation.getCurrentPosition(onResponse, onError, options);
          }
          return this;
        },
        // @method stopLocate(): this
        // Stops watching location previously initiated by `map.locate({watch: true})`
        // and aborts resetting the map view if map.locate was called with
        // `{setView: true}`.
        stopLocate: function() {
          if (navigator.geolocation && navigator.geolocation.clearWatch) {
            navigator.geolocation.clearWatch(this._locationWatchId);
          }
          if (this._locateOptions) {
            this._locateOptions.setView = false;
          }
          return this;
        },
        _handleGeolocationError: function(error) {
          if (!this._container._leaflet_id) {
            return;
          }
          var c = error.code, message = error.message || (c === 1 ? "permission denied" : c === 2 ? "position unavailable" : "timeout");
          if (this._locateOptions.setView && !this._loaded) {
            this.fitWorld();
          }
          this.fire("locationerror", {
            code: c,
            message: "Geolocation error: " + message + "."
          });
        },
        _handleGeolocationResponse: function(pos) {
          if (!this._container._leaflet_id) {
            return;
          }
          var lat = pos.coords.latitude, lng = pos.coords.longitude, latlng = new LatLng(lat, lng), bounds = latlng.toBounds(pos.coords.accuracy * 2), options = this._locateOptions;
          if (options.setView) {
            var zoom2 = this.getBoundsZoom(bounds);
            this.setView(latlng, options.maxZoom ? Math.min(zoom2, options.maxZoom) : zoom2);
          }
          var data = {
            latlng,
            bounds,
            timestamp: pos.timestamp
          };
          for (var i in pos.coords) {
            if (typeof pos.coords[i] === "number") {
              data[i] = pos.coords[i];
            }
          }
          this.fire("locationfound", data);
        },
        // TODO Appropriate docs section?
        // @section Other Methods
        // @method addHandler(name: String, HandlerClass: Function): this
        // Adds a new `Handler` to the map, given its name and constructor function.
        addHandler: function(name, HandlerClass) {
          if (!HandlerClass) {
            return this;
          }
          var handler = this[name] = new HandlerClass(this);
          this._handlers.push(handler);
          if (this.options[name]) {
            handler.enable();
          }
          return this;
        },
        // @method remove(): this
        // Destroys the map and clears all related event listeners.
        remove: function() {
          this._initEvents(true);
          if (this.options.maxBounds) {
            this.off("moveend", this._panInsideMaxBounds);
          }
          if (this._containerId !== this._container._leaflet_id) {
            throw new Error("Map container is being reused by another instance");
          }
          try {
            delete this._container._leaflet_id;
            delete this._containerId;
          } catch (e) {
            this._container._leaflet_id = void 0;
            this._containerId = void 0;
          }
          if (this._locationWatchId !== void 0) {
            this.stopLocate();
          }
          this._stop();
          remove(this._mapPane);
          if (this._clearControlPos) {
            this._clearControlPos();
          }
          if (this._resizeRequest) {
            cancelAnimFrame(this._resizeRequest);
            this._resizeRequest = null;
          }
          this._clearHandlers();
          if (this._loaded) {
            this.fire("unload");
          }
          var i;
          for (i in this._layers) {
            this._layers[i].remove();
          }
          for (i in this._panes) {
            remove(this._panes[i]);
          }
          this._layers = [];
          this._panes = [];
          delete this._mapPane;
          delete this._renderer;
          return this;
        },
        // @section Other Methods
        // @method createPane(name: String, container?: HTMLElement): HTMLElement
        // Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
        // then returns it. The pane is created as a child of `container`, or
        // as a child of the main map pane if not set.
        createPane: function(name, container) {
          var className = "leaflet-pane" + (name ? " leaflet-" + name.replace("Pane", "") + "-pane" : ""), pane = create$1("div", className, container || this._mapPane);
          if (name) {
            this._panes[name] = pane;
          }
          return pane;
        },
        // @section Methods for Getting Map State
        // @method getCenter(): LatLng
        // Returns the geographical center of the map view
        getCenter: function() {
          this._checkIfLoaded();
          if (this._lastCenter && !this._moved()) {
            return this._lastCenter.clone();
          }
          return this.layerPointToLatLng(this._getCenterLayerPoint());
        },
        // @method getZoom(): Number
        // Returns the current zoom level of the map view
        getZoom: function() {
          return this._zoom;
        },
        // @method getBounds(): LatLngBounds
        // Returns the geographical bounds visible in the current map view
        getBounds: function() {
          var bounds = this.getPixelBounds(), sw = this.unproject(bounds.getBottomLeft()), ne = this.unproject(bounds.getTopRight());
          return new LatLngBounds(sw, ne);
        },
        // @method getMinZoom(): Number
        // Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
        getMinZoom: function() {
          return this.options.minZoom === void 0 ? this._layersMinZoom || 0 : this.options.minZoom;
        },
        // @method getMaxZoom(): Number
        // Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
        getMaxZoom: function() {
          return this.options.maxZoom === void 0 ? this._layersMaxZoom === void 0 ? Infinity : this._layersMaxZoom : this.options.maxZoom;
        },
        // @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
        // Returns the maximum zoom level on which the given bounds fit to the map
        // view in its entirety. If `inside` (optional) is set to `true`, the method
        // instead returns the minimum zoom level on which the map view fits into
        // the given bounds in its entirety.
        getBoundsZoom: function(bounds, inside, padding) {
          bounds = toLatLngBounds(bounds);
          padding = toPoint(padding || [0, 0]);
          var zoom2 = this.getZoom() || 0, min = this.getMinZoom(), max = this.getMaxZoom(), nw = bounds.getNorthWest(), se = bounds.getSouthEast(), size = this.getSize().subtract(padding), boundsSize = toBounds(this.project(se, zoom2), this.project(nw, zoom2)).getSize(), snap = Browser.any3d ? this.options.zoomSnap : 1, scalex = size.x / boundsSize.x, scaley = size.y / boundsSize.y, scale2 = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);
          zoom2 = this.getScaleZoom(scale2, zoom2);
          if (snap) {
            zoom2 = Math.round(zoom2 / (snap / 100)) * (snap / 100);
            zoom2 = inside ? Math.ceil(zoom2 / snap) * snap : Math.floor(zoom2 / snap) * snap;
          }
          return Math.max(min, Math.min(max, zoom2));
        },
        // @method getSize(): Point
        // Returns the current size of the map container (in pixels).
        getSize: function() {
          if (!this._size || this._sizeChanged) {
            this._size = new Point(
              this._container.clientWidth || 0,
              this._container.clientHeight || 0
            );
            this._sizeChanged = false;
          }
          return this._size.clone();
        },
        // @method getPixelBounds(): Bounds
        // Returns the bounds of the current map view in projected pixel
        // coordinates (sometimes useful in layer and overlay implementations).
        getPixelBounds: function(center, zoom2) {
          var topLeftPoint = this._getTopLeftPoint(center, zoom2);
          return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
        },
        // TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
        // the map pane? "left point of the map layer" can be confusing, specially
        // since there can be negative offsets.
        // @method getPixelOrigin(): Point
        // Returns the projected pixel coordinates of the top left point of
        // the map layer (useful in custom layer and overlay implementations).
        getPixelOrigin: function() {
          this._checkIfLoaded();
          return this._pixelOrigin;
        },
        // @method getPixelWorldBounds(zoom?: Number): Bounds
        // Returns the world's bounds in pixel coordinates for zoom level `zoom`.
        // If `zoom` is omitted, the map's current zoom level is used.
        getPixelWorldBounds: function(zoom2) {
          return this.options.crs.getProjectedBounds(zoom2 === void 0 ? this.getZoom() : zoom2);
        },
        // @section Other Methods
        // @method getPane(pane: String|HTMLElement): HTMLElement
        // Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
        getPane: function(pane) {
          return typeof pane === "string" ? this._panes[pane] : pane;
        },
        // @method getPanes(): Object
        // Returns a plain object containing the names of all [panes](#map-pane) as keys and
        // the panes as values.
        getPanes: function() {
          return this._panes;
        },
        // @method getContainer: HTMLElement
        // Returns the HTML element that contains the map.
        getContainer: function() {
          return this._container;
        },
        // @section Conversion Methods
        // @method getZoomScale(toZoom: Number, fromZoom: Number): Number
        // Returns the scale factor to be applied to a map transition from zoom level
        // `fromZoom` to `toZoom`. Used internally to help with zoom animations.
        getZoomScale: function(toZoom, fromZoom) {
          var crs = this.options.crs;
          fromZoom = fromZoom === void 0 ? this._zoom : fromZoom;
          return crs.scale(toZoom) / crs.scale(fromZoom);
        },
        // @method getScaleZoom(scale: Number, fromZoom: Number): Number
        // Returns the zoom level that the map would end up at, if it is at `fromZoom`
        // level and everything is scaled by a factor of `scale`. Inverse of
        // [`getZoomScale`](#map-getZoomScale).
        getScaleZoom: function(scale2, fromZoom) {
          var crs = this.options.crs;
          fromZoom = fromZoom === void 0 ? this._zoom : fromZoom;
          var zoom2 = crs.zoom(scale2 * crs.scale(fromZoom));
          return isNaN(zoom2) ? Infinity : zoom2;
        },
        // @method project(latlng: LatLng, zoom: Number): Point
        // Projects a geographical coordinate `LatLng` according to the projection
        // of the map's CRS, then scales it according to `zoom` and the CRS's
        // `Transformation`. The result is pixel coordinate relative to
        // the CRS origin.
        project: function(latlng, zoom2) {
          zoom2 = zoom2 === void 0 ? this._zoom : zoom2;
          return this.options.crs.latLngToPoint(toLatLng(latlng), zoom2);
        },
        // @method unproject(point: Point, zoom: Number): LatLng
        // Inverse of [`project`](#map-project).
        unproject: function(point, zoom2) {
          zoom2 = zoom2 === void 0 ? this._zoom : zoom2;
          return this.options.crs.pointToLatLng(toPoint(point), zoom2);
        },
        // @method layerPointToLatLng(point: Point): LatLng
        // Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
        // returns the corresponding geographical coordinate (for the current zoom level).
        layerPointToLatLng: function(point) {
          var projectedPoint = toPoint(point).add(this.getPixelOrigin());
          return this.unproject(projectedPoint);
        },
        // @method latLngToLayerPoint(latlng: LatLng): Point
        // Given a geographical coordinate, returns the corresponding pixel coordinate
        // relative to the [origin pixel](#map-getpixelorigin).
        latLngToLayerPoint: function(latlng) {
          var projectedPoint = this.project(toLatLng(latlng))._round();
          return projectedPoint._subtract(this.getPixelOrigin());
        },
        // @method wrapLatLng(latlng: LatLng): LatLng
        // Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
        // map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
        // CRS's bounds.
        // By default this means longitude is wrapped around the dateline so its
        // value is between -180 and +180 degrees.
        wrapLatLng: function(latlng) {
          return this.options.crs.wrapLatLng(toLatLng(latlng));
        },
        // @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
        // Returns a `LatLngBounds` with the same size as the given one, ensuring that
        // its center is within the CRS's bounds.
        // By default this means the center longitude is wrapped around the dateline so its
        // value is between -180 and +180 degrees, and the majority of the bounds
        // overlaps the CRS's bounds.
        wrapLatLngBounds: function(latlng) {
          return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
        },
        // @method distance(latlng1: LatLng, latlng2: LatLng): Number
        // Returns the distance between two geographical coordinates according to
        // the map's CRS. By default this measures distance in meters.
        distance: function(latlng1, latlng2) {
          return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
        },
        // @method containerPointToLayerPoint(point: Point): Point
        // Given a pixel coordinate relative to the map container, returns the corresponding
        // pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
        containerPointToLayerPoint: function(point) {
          return toPoint(point).subtract(this._getMapPanePos());
        },
        // @method layerPointToContainerPoint(point: Point): Point
        // Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
        // returns the corresponding pixel coordinate relative to the map container.
        layerPointToContainerPoint: function(point) {
          return toPoint(point).add(this._getMapPanePos());
        },
        // @method containerPointToLatLng(point: Point): LatLng
        // Given a pixel coordinate relative to the map container, returns
        // the corresponding geographical coordinate (for the current zoom level).
        containerPointToLatLng: function(point) {
          var layerPoint = this.containerPointToLayerPoint(toPoint(point));
          return this.layerPointToLatLng(layerPoint);
        },
        // @method latLngToContainerPoint(latlng: LatLng): Point
        // Given a geographical coordinate, returns the corresponding pixel coordinate
        // relative to the map container.
        latLngToContainerPoint: function(latlng) {
          return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
        },
        // @method mouseEventToContainerPoint(ev: MouseEvent): Point
        // Given a MouseEvent object, returns the pixel coordinate relative to the
        // map container where the event took place.
        mouseEventToContainerPoint: function(e) {
          return getMousePosition(e, this._container);
        },
        // @method mouseEventToLayerPoint(ev: MouseEvent): Point
        // Given a MouseEvent object, returns the pixel coordinate relative to
        // the [origin pixel](#map-getpixelorigin) where the event took place.
        mouseEventToLayerPoint: function(e) {
          return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
        },
        // @method mouseEventToLatLng(ev: MouseEvent): LatLng
        // Given a MouseEvent object, returns geographical coordinate where the
        // event took place.
        mouseEventToLatLng: function(e) {
          return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
        },
        // map initialization methods
        _initContainer: function(id) {
          var container = this._container = get(id);
          if (!container) {
            throw new Error("Map container not found.");
          } else if (container._leaflet_id) {
            throw new Error("Map container is already initialized.");
          }
          on(container, "scroll", this._onScroll, this);
          this._containerId = stamp(container);
        },
        _initLayout: function() {
          var container = this._container;
          this._fadeAnimated = this.options.fadeAnimation && Browser.any3d;
          addClass(container, "leaflet-container" + (Browser.touch ? " leaflet-touch" : "") + (Browser.retina ? " leaflet-retina" : "") + (Browser.ielt9 ? " leaflet-oldie" : "") + (Browser.safari ? " leaflet-safari" : "") + (this._fadeAnimated ? " leaflet-fade-anim" : ""));
          var position = getStyle(container, "position");
          if (position !== "absolute" && position !== "relative" && position !== "fixed" && position !== "sticky") {
            container.style.position = "relative";
          }
          this._initPanes();
          if (this._initControlPos) {
            this._initControlPos();
          }
        },
        _initPanes: function() {
          var panes = this._panes = {};
          this._paneRenderers = {};
          this._mapPane = this.createPane("mapPane", this._container);
          setPosition(this._mapPane, new Point(0, 0));
          this.createPane("tilePane");
          this.createPane("overlayPane");
          this.createPane("shadowPane");
          this.createPane("markerPane");
          this.createPane("tooltipPane");
          this.createPane("popupPane");
          if (!this.options.markerZoomAnimation) {
            addClass(panes.markerPane, "leaflet-zoom-hide");
            addClass(panes.shadowPane, "leaflet-zoom-hide");
          }
        },
        // private methods that modify map state
        // @section Map state change events
        _resetView: function(center, zoom2, noMoveStart) {
          setPosition(this._mapPane, new Point(0, 0));
          var loading = !this._loaded;
          this._loaded = true;
          zoom2 = this._limitZoom(zoom2);
          this.fire("viewprereset");
          var zoomChanged = this._zoom !== zoom2;
          this._moveStart(zoomChanged, noMoveStart)._move(center, zoom2)._moveEnd(zoomChanged);
          this.fire("viewreset");
          if (loading) {
            this.fire("load");
          }
        },
        _moveStart: function(zoomChanged, noMoveStart) {
          if (zoomChanged) {
            this.fire("zoomstart");
          }
          if (!noMoveStart) {
            this.fire("movestart");
          }
          return this;
        },
        _move: function(center, zoom2, data, supressEvent) {
          if (zoom2 === void 0) {
            zoom2 = this._zoom;
          }
          var zoomChanged = this._zoom !== zoom2;
          this._zoom = zoom2;
          this._lastCenter = center;
          this._pixelOrigin = this._getNewPixelOrigin(center);
          if (!supressEvent) {
            if (zoomChanged || data && data.pinch) {
              this.fire("zoom", data);
            }
            this.fire("move", data);
          } else if (data && data.pinch) {
            this.fire("zoom", data);
          }
          return this;
        },
        _moveEnd: function(zoomChanged) {
          if (zoomChanged) {
            this.fire("zoomend");
          }
          return this.fire("moveend");
        },
        _stop: function() {
          cancelAnimFrame(this._flyToFrame);
          if (this._panAnim) {
            this._panAnim.stop();
          }
          return this;
        },
        _rawPanBy: function(offset) {
          setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
        },
        _getZoomSpan: function() {
          return this.getMaxZoom() - this.getMinZoom();
        },
        _panInsideMaxBounds: function() {
          if (!this._enforcingBounds) {
            this.panInsideBounds(this.options.maxBounds);
          }
        },
        _checkIfLoaded: function() {
          if (!this._loaded) {
            throw new Error("Set map center and zoom first.");
          }
        },
        // DOM event handling
        // @section Interaction events
        _initEvents: function(remove2) {
          this._targets = {};
          this._targets[stamp(this._container)] = this;
          var onOff = remove2 ? off : on;
          onOff(this._container, "click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup", this._handleDOMEvent, this);
          if (this.options.trackResize) {
            onOff(window, "resize", this._onResize, this);
          }
          if (Browser.any3d && this.options.transform3DLimit) {
            (remove2 ? this.off : this.on).call(this, "moveend", this._onMoveEnd);
          }
        },
        _onResize: function() {
          cancelAnimFrame(this._resizeRequest);
          this._resizeRequest = requestAnimFrame(
            function() {
              this.invalidateSize({ debounceMoveend: true });
            },
            this
          );
        },
        _onScroll: function() {
          this._container.scrollTop = 0;
          this._container.scrollLeft = 0;
        },
        _onMoveEnd: function() {
          var pos = this._getMapPanePos();
          if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
            this._resetView(this.getCenter(), this.getZoom());
          }
        },
        _findEventTargets: function(e, type) {
          var targets = [], target, isHover = type === "mouseout" || type === "mouseover", src = e.target || e.srcElement, dragging = false;
          while (src) {
            target = this._targets[stamp(src)];
            if (target && (type === "click" || type === "preclick") && this._draggableMoved(target)) {
              dragging = true;
              break;
            }
            if (target && target.listens(type, true)) {
              if (isHover && !isExternalTarget(src, e)) {
                break;
              }
              targets.push(target);
              if (isHover) {
                break;
              }
            }
            if (src === this._container) {
              break;
            }
            src = src.parentNode;
          }
          if (!targets.length && !dragging && !isHover && this.listens(type, true)) {
            targets = [this];
          }
          return targets;
        },
        _isClickDisabled: function(el) {
          while (el && el !== this._container) {
            if (el["_leaflet_disable_click"]) {
              return true;
            }
            el = el.parentNode;
          }
        },
        _handleDOMEvent: function(e) {
          var el = e.target || e.srcElement;
          if (!this._loaded || el["_leaflet_disable_events"] || e.type === "click" && this._isClickDisabled(el)) {
            return;
          }
          var type = e.type;
          if (type === "mousedown") {
            preventOutline(el);
          }
          this._fireDOMEvent(e, type);
        },
        _mouseEvents: ["click", "dblclick", "mouseover", "mouseout", "contextmenu"],
        _fireDOMEvent: function(e, type, canvasTargets) {
          if (e.type === "click") {
            var synth = extend({}, e);
            synth.type = "preclick";
            this._fireDOMEvent(synth, synth.type, canvasTargets);
          }
          var targets = this._findEventTargets(e, type);
          if (canvasTargets) {
            var filtered = [];
            for (var i = 0; i < canvasTargets.length; i++) {
              if (canvasTargets[i].listens(type, true)) {
                filtered.push(canvasTargets[i]);
              }
            }
            targets = filtered.concat(targets);
          }
          if (!targets.length) {
            return;
          }
          if (type === "contextmenu") {
            preventDefault(e);
          }
          var target = targets[0];
          var data = {
            originalEvent: e
          };
          if (e.type !== "keypress" && e.type !== "keydown" && e.type !== "keyup") {
            var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
            data.containerPoint = isMarker ? this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
            data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
            data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
          }
          for (i = 0; i < targets.length; i++) {
            targets[i].fire(type, data, true);
            if (data.originalEvent._stopped || targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1) {
              return;
            }
          }
        },
        _draggableMoved: function(obj) {
          obj = obj.dragging && obj.dragging.enabled() ? obj : this;
          return obj.dragging && obj.dragging.moved() || this.boxZoom && this.boxZoom.moved();
        },
        _clearHandlers: function() {
          for (var i = 0, len = this._handlers.length; i < len; i++) {
            this._handlers[i].disable();
          }
        },
        // @section Other Methods
        // @method whenReady(fn: Function, context?: Object): this
        // Runs the given function `fn` when the map gets initialized with
        // a view (center and zoom) and at least one layer, or immediately
        // if it's already initialized, optionally passing a function context.
        whenReady: function(callback, context) {
          if (this._loaded) {
            callback.call(context || this, { target: this });
          } else {
            this.on("load", callback, context);
          }
          return this;
        },
        // private methods for getting map state
        _getMapPanePos: function() {
          return getPosition(this._mapPane) || new Point(0, 0);
        },
        _moved: function() {
          var pos = this._getMapPanePos();
          return pos && !pos.equals([0, 0]);
        },
        _getTopLeftPoint: function(center, zoom2) {
          var pixelOrigin = center && zoom2 !== void 0 ? this._getNewPixelOrigin(center, zoom2) : this.getPixelOrigin();
          return pixelOrigin.subtract(this._getMapPanePos());
        },
        _getNewPixelOrigin: function(center, zoom2) {
          var viewHalf = this.getSize()._divideBy(2);
          return this.project(center, zoom2)._subtract(viewHalf)._add(this._getMapPanePos())._round();
        },
        _latLngToNewLayerPoint: function(latlng, zoom2, center) {
          var topLeft = this._getNewPixelOrigin(center, zoom2);
          return this.project(latlng, zoom2)._subtract(topLeft);
        },
        _latLngBoundsToNewLayerBounds: function(latLngBounds, zoom2, center) {
          var topLeft = this._getNewPixelOrigin(center, zoom2);
          return toBounds([
            this.project(latLngBounds.getSouthWest(), zoom2)._subtract(topLeft),
            this.project(latLngBounds.getNorthWest(), zoom2)._subtract(topLeft),
            this.project(latLngBounds.getSouthEast(), zoom2)._subtract(topLeft),
            this.project(latLngBounds.getNorthEast(), zoom2)._subtract(topLeft)
          ]);
        },
        // layer point of the current center
        _getCenterLayerPoint: function() {
          return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
        },
        // offset of the specified place to the current center in pixels
        _getCenterOffset: function(latlng) {
          return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
        },
        // adjust center for view to get inside bounds
        _limitCenter: function(center, zoom2, bounds) {
          if (!bounds) {
            return center;
          }
          var centerPoint = this.project(center, zoom2), viewHalf = this.getSize().divideBy(2), viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)), offset = this._getBoundsOffset(viewBounds, bounds, zoom2);
          if (Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1) {
            return center;
          }
          return this.unproject(centerPoint.add(offset), zoom2);
        },
        // adjust offset for view to get inside bounds
        _limitOffset: function(offset, bounds) {
          if (!bounds) {
            return offset;
          }
          var viewBounds = this.getPixelBounds(), newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));
          return offset.add(this._getBoundsOffset(newBounds, bounds));
        },
        // returns offset needed for pxBounds to get inside maxBounds at a specified zoom
        _getBoundsOffset: function(pxBounds, maxBounds, zoom2) {
          var projectedMaxBounds = toBounds(
            this.project(maxBounds.getNorthEast(), zoom2),
            this.project(maxBounds.getSouthWest(), zoom2)
          ), minOffset = projectedMaxBounds.min.subtract(pxBounds.min), maxOffset = projectedMaxBounds.max.subtract(pxBounds.max), dx = this._rebound(minOffset.x, -maxOffset.x), dy = this._rebound(minOffset.y, -maxOffset.y);
          return new Point(dx, dy);
        },
        _rebound: function(left, right) {
          return left + right > 0 ? Math.round(left - right) / 2 : Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
        },
        _limitZoom: function(zoom2) {
          var min = this.getMinZoom(), max = this.getMaxZoom(), snap = Browser.any3d ? this.options.zoomSnap : 1;
          if (snap) {
            zoom2 = Math.round(zoom2 / snap) * snap;
          }
          return Math.max(min, Math.min(max, zoom2));
        },
        _onPanTransitionStep: function() {
          this.fire("move");
        },
        _onPanTransitionEnd: function() {
          removeClass(this._mapPane, "leaflet-pan-anim");
          this.fire("moveend");
        },
        _tryAnimatedPan: function(center, options) {
          var offset = this._getCenterOffset(center)._trunc();
          if ((options && options.animate) !== true && !this.getSize().contains(offset)) {
            return false;
          }
          this.panBy(offset, options);
          return true;
        },
        _createAnimProxy: function() {
          var proxy = this._proxy = create$1("div", "leaflet-proxy leaflet-zoom-animated");
          this._panes.mapPane.appendChild(proxy);
          this.on("zoomanim", function(e) {
            var prop = TRANSFORM, transform = this._proxy.style[prop];
            setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));
            if (transform === this._proxy.style[prop] && this._animatingZoom) {
              this._onZoomTransitionEnd();
            }
          }, this);
          this.on("load moveend", this._animMoveEnd, this);
          this._on("unload", this._destroyAnimProxy, this);
        },
        _destroyAnimProxy: function() {
          remove(this._proxy);
          this.off("load moveend", this._animMoveEnd, this);
          delete this._proxy;
        },
        _animMoveEnd: function() {
          var c = this.getCenter(), z = this.getZoom();
          setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
        },
        _catchTransitionEnd: function(e) {
          if (this._animatingZoom && e.propertyName.indexOf("transform") >= 0) {
            this._onZoomTransitionEnd();
          }
        },
        _nothingToAnimate: function() {
          return !this._container.getElementsByClassName("leaflet-zoom-animated").length;
        },
        _tryAnimatedZoom: function(center, zoom2, options) {
          if (this._animatingZoom) {
            return true;
          }
          options = options || {};
          if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() || Math.abs(zoom2 - this._zoom) > this.options.zoomAnimationThreshold) {
            return false;
          }
          var scale2 = this.getZoomScale(zoom2), offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale2);
          if (options.animate !== true && !this.getSize().contains(offset)) {
            return false;
          }
          requestAnimFrame(function() {
            this._moveStart(true, options.noMoveStart || false)._animateZoom(center, zoom2, true);
          }, this);
          return true;
        },
        _animateZoom: function(center, zoom2, startAnim, noUpdate) {
          if (!this._mapPane) {
            return;
          }
          if (startAnim) {
            this._animatingZoom = true;
            this._animateToCenter = center;
            this._animateToZoom = zoom2;
            addClass(this._mapPane, "leaflet-zoom-anim");
          }
          this.fire("zoomanim", {
            center,
            zoom: zoom2,
            noUpdate
          });
          if (!this._tempFireZoomEvent) {
            this._tempFireZoomEvent = this._zoom !== this._animateToZoom;
          }
          this._move(this._animateToCenter, this._animateToZoom, void 0, true);
          setTimeout(bind(this._onZoomTransitionEnd, this), 250);
        },
        _onZoomTransitionEnd: function() {
          if (!this._animatingZoom) {
            return;
          }
          if (this._mapPane) {
            removeClass(this._mapPane, "leaflet-zoom-anim");
          }
          this._animatingZoom = false;
          this._move(this._animateToCenter, this._animateToZoom, void 0, true);
          if (this._tempFireZoomEvent) {
            this.fire("zoom");
          }
          delete this._tempFireZoomEvent;
          this.fire("move");
          this._moveEnd(true);
        }
      });
      function createMap(id, options) {
        return new Map2(id, options);
      }
      var Control = Class.extend({
        // @section
        // @aka Control Options
        options: {
          // @option position: String = 'topright'
          // The position of the control (one of the map corners). Possible values are `'topleft'`,
          // `'topright'`, `'bottomleft'` or `'bottomright'`
          position: "topright"
        },
        initialize: function(options) {
          setOptions(this, options);
        },
        /* @section
         * Classes extending L.Control will inherit the following methods:
         *
         * @method getPosition: string
         * Returns the position of the control.
         */
        getPosition: function() {
          return this.options.position;
        },
        // @method setPosition(position: string): this
        // Sets the position of the control.
        setPosition: function(position) {
          var map = this._map;
          if (map) {
            map.removeControl(this);
          }
          this.options.position = position;
          if (map) {
            map.addControl(this);
          }
          return this;
        },
        // @method getContainer: HTMLElement
        // Returns the HTMLElement that contains the control.
        getContainer: function() {
          return this._container;
        },
        // @method addTo(map: Map): this
        // Adds the control to the given map.
        addTo: function(map) {
          this.remove();
          this._map = map;
          var container = this._container = this.onAdd(map), pos = this.getPosition(), corner = map._controlCorners[pos];
          addClass(container, "leaflet-control");
          if (pos.indexOf("bottom") !== -1) {
            corner.insertBefore(container, corner.firstChild);
          } else {
            corner.appendChild(container);
          }
          this._map.on("unload", this.remove, this);
          return this;
        },
        // @method remove: this
        // Removes the control from the map it is currently active on.
        remove: function() {
          if (!this._map) {
            return this;
          }
          remove(this._container);
          if (this.onRemove) {
            this.onRemove(this._map);
          }
          this._map.off("unload", this.remove, this);
          this._map = null;
          return this;
        },
        _refocusOnMap: function(e) {
          if (this._map && e && e.screenX > 0 && e.screenY > 0) {
            this._map.getContainer().focus();
          }
        }
      });
      var control = function(options) {
        return new Control(options);
      };
      Map2.include({
        // @method addControl(control: Control): this
        // Adds the given control to the map
        addControl: function(control2) {
          control2.addTo(this);
          return this;
        },
        // @method removeControl(control: Control): this
        // Removes the given control from the map
        removeControl: function(control2) {
          control2.remove();
          return this;
        },
        _initControlPos: function() {
          var corners = this._controlCorners = {}, l = "leaflet-", container = this._controlContainer = create$1("div", l + "control-container", this._container);
          function createCorner(vSide, hSide) {
            var className = l + vSide + " " + l + hSide;
            corners[vSide + hSide] = create$1("div", className, container);
          }
          createCorner("top", "left");
          createCorner("top", "right");
          createCorner("bottom", "left");
          createCorner("bottom", "right");
        },
        _clearControlPos: function() {
          for (var i in this._controlCorners) {
            remove(this._controlCorners[i]);
          }
          remove(this._controlContainer);
          delete this._controlCorners;
          delete this._controlContainer;
        }
      });
      var Layers = Control.extend({
        // @section
        // @aka Control.Layers options
        options: {
          // @option collapsed: Boolean = true
          // If `true`, the control will be collapsed into an icon and expanded on mouse hover, touch, or keyboard activation.
          collapsed: true,
          position: "topright",
          // @option autoZIndex: Boolean = true
          // If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
          autoZIndex: true,
          // @option hideSingleBase: Boolean = false
          // If `true`, the base layers in the control will be hidden when there is only one.
          hideSingleBase: false,
          // @option sortLayers: Boolean = false
          // Whether to sort the layers. When `false`, layers will keep the order
          // in which they were added to the control.
          sortLayers: false,
          // @option sortFunction: Function = *
          // A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
          // that will be used for sorting the layers, when `sortLayers` is `true`.
          // The function receives both the `L.Layer` instances and their names, as in
          // `sortFunction(layerA, layerB, nameA, nameB)`.
          // By default, it sorts layers alphabetically by their name.
          sortFunction: function(layerA, layerB, nameA, nameB) {
            return nameA < nameB ? -1 : nameB < nameA ? 1 : 0;
          }
        },
        initialize: function(baseLayers, overlays, options) {
          setOptions(this, options);
          this._layerControlInputs = [];
          this._layers = [];
          this._lastZIndex = 0;
          this._handlingClick = false;
          this._preventClick = false;
          for (var i in baseLayers) {
            this._addLayer(baseLayers[i], i);
          }
          for (i in overlays) {
            this._addLayer(overlays[i], i, true);
          }
        },
        onAdd: function(map) {
          this._initLayout();
          this._update();
          this._map = map;
          map.on("zoomend", this._checkDisabledLayers, this);
          for (var i = 0; i < this._layers.length; i++) {
            this._layers[i].layer.on("add remove", this._onLayerChange, this);
          }
          return this._container;
        },
        addTo: function(map) {
          Control.prototype.addTo.call(this, map);
          return this._expandIfNotCollapsed();
        },
        onRemove: function() {
          this._map.off("zoomend", this._checkDisabledLayers, this);
          for (var i = 0; i < this._layers.length; i++) {
            this._layers[i].layer.off("add remove", this._onLayerChange, this);
          }
        },
        // @method addBaseLayer(layer: Layer, name: String): this
        // Adds a base layer (radio button entry) with the given name to the control.
        addBaseLayer: function(layer, name) {
          this._addLayer(layer, name);
          return this._map ? this._update() : this;
        },
        // @method addOverlay(layer: Layer, name: String): this
        // Adds an overlay (checkbox entry) with the given name to the control.
        addOverlay: function(layer, name) {
          this._addLayer(layer, name, true);
          return this._map ? this._update() : this;
        },
        // @method removeLayer(layer: Layer): this
        // Remove the given layer from the control.
        removeLayer: function(layer) {
          layer.off("add remove", this._onLayerChange, this);
          var obj = this._getLayer(stamp(layer));
          if (obj) {
            this._layers.splice(this._layers.indexOf(obj), 1);
          }
          return this._map ? this._update() : this;
        },
        // @method expand(): this
        // Expand the control container if collapsed.
        expand: function() {
          addClass(this._container, "leaflet-control-layers-expanded");
          this._section.style.height = null;
          var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
          if (acceptableHeight < this._section.clientHeight) {
            addClass(this._section, "leaflet-control-layers-scrollbar");
            this._section.style.height = acceptableHeight + "px";
          } else {
            removeClass(this._section, "leaflet-control-layers-scrollbar");
          }
          this._checkDisabledLayers();
          return this;
        },
        // @method collapse(): this
        // Collapse the control container if expanded.
        collapse: function() {
          removeClass(this._container, "leaflet-control-layers-expanded");
          return this;
        },
        _initLayout: function() {
          var className = "leaflet-control-layers", container = this._container = create$1("div", className), collapsed = this.options.collapsed;
          container.setAttribute("aria-haspopup", true);
          disableClickPropagation(container);
          disableScrollPropagation(container);
          var section = this._section = create$1("section", className + "-list");
          if (collapsed) {
            this._map.on("click", this.collapse, this);
            on(container, {
              mouseenter: this._expandSafely,
              mouseleave: this.collapse
            }, this);
          }
          var link = this._layersLink = create$1("a", className + "-toggle", container);
          link.href = "#";
          link.title = "Layers";
          link.setAttribute("role", "button");
          on(link, {
            keydown: function(e) {
              if (e.keyCode === 13) {
                this._expandSafely();
              }
            },
            // Certain screen readers intercept the key event and instead send a click event
            click: function(e) {
              preventDefault(e);
              this._expandSafely();
            }
          }, this);
          if (!collapsed) {
            this.expand();
          }
          this._baseLayersList = create$1("div", className + "-base", section);
          this._separator = create$1("div", className + "-separator", section);
          this._overlaysList = create$1("div", className + "-overlays", section);
          container.appendChild(section);
        },
        _getLayer: function(id) {
          for (var i = 0; i < this._layers.length; i++) {
            if (this._layers[i] && stamp(this._layers[i].layer) === id) {
              return this._layers[i];
            }
          }
        },
        _addLayer: function(layer, name, overlay) {
          if (this._map) {
            layer.on("add remove", this._onLayerChange, this);
          }
          this._layers.push({
            layer,
            name,
            overlay
          });
          if (this.options.sortLayers) {
            this._layers.sort(bind(function(a, b) {
              return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
            }, this));
          }
          if (this.options.autoZIndex && layer.setZIndex) {
            this._lastZIndex++;
            layer.setZIndex(this._lastZIndex);
          }
          this._expandIfNotCollapsed();
        },
        _update: function() {
          if (!this._container) {
            return this;
          }
          empty(this._baseLayersList);
          empty(this._overlaysList);
          this._layerControlInputs = [];
          var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;
          for (i = 0; i < this._layers.length; i++) {
            obj = this._layers[i];
            this._addItem(obj);
            overlaysPresent = overlaysPresent || obj.overlay;
            baseLayersPresent = baseLayersPresent || !obj.overlay;
            baseLayersCount += !obj.overlay ? 1 : 0;
          }
          if (this.options.hideSingleBase) {
            baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
            this._baseLayersList.style.display = baseLayersPresent ? "" : "none";
          }
          this._separator.style.display = overlaysPresent && baseLayersPresent ? "" : "none";
          return this;
        },
        _onLayerChange: function(e) {
          if (!this._handlingClick) {
            this._update();
          }
          var obj = this._getLayer(stamp(e.target));
          var type = obj.overlay ? e.type === "add" ? "overlayadd" : "overlayremove" : e.type === "add" ? "baselayerchange" : null;
          if (type) {
            this._map.fire(type, obj);
          }
        },
        // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see https://stackoverflow.com/a/119079)
        _createRadioElement: function(name, checked) {
          var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"' + (checked ? ' checked="checked"' : "") + "/>";
          var radioFragment = document.createElement("div");
          radioFragment.innerHTML = radioHtml;
          return radioFragment.firstChild;
        },
        _addItem: function(obj) {
          var label = document.createElement("label"), checked = this._map.hasLayer(obj.layer), input;
          if (obj.overlay) {
            input = document.createElement("input");
            input.type = "checkbox";
            input.className = "leaflet-control-layers-selector";
            input.defaultChecked = checked;
          } else {
            input = this._createRadioElement("leaflet-base-layers_" + stamp(this), checked);
          }
          this._layerControlInputs.push(input);
          input.layerId = stamp(obj.layer);
          on(input, "click", this._onInputClick, this);
          var name = document.createElement("span");
          name.innerHTML = " " + obj.name;
          var holder = document.createElement("span");
          label.appendChild(holder);
          holder.appendChild(input);
          holder.appendChild(name);
          var container = obj.overlay ? this._overlaysList : this._baseLayersList;
          container.appendChild(label);
          this._checkDisabledLayers();
          return label;
        },
        _onInputClick: function() {
          if (this._preventClick) {
            return;
          }
          var inputs = this._layerControlInputs, input, layer;
          var addedLayers = [], removedLayers = [];
          this._handlingClick = true;
          for (var i = inputs.length - 1; i >= 0; i--) {
            input = inputs[i];
            layer = this._getLayer(input.layerId).layer;
            if (input.checked) {
              addedLayers.push(layer);
            } else if (!input.checked) {
              removedLayers.push(layer);
            }
          }
          for (i = 0; i < removedLayers.length; i++) {
            if (this._map.hasLayer(removedLayers[i])) {
              this._map.removeLayer(removedLayers[i]);
            }
          }
          for (i = 0; i < addedLayers.length; i++) {
            if (!this._map.hasLayer(addedLayers[i])) {
              this._map.addLayer(addedLayers[i]);
            }
          }
          this._handlingClick = false;
          this._refocusOnMap();
        },
        _checkDisabledLayers: function() {
          var inputs = this._layerControlInputs, input, layer, zoom2 = this._map.getZoom();
          for (var i = inputs.length - 1; i >= 0; i--) {
            input = inputs[i];
            layer = this._getLayer(input.layerId).layer;
            input.disabled = layer.options.minZoom !== void 0 && zoom2 < layer.options.minZoom || layer.options.maxZoom !== void 0 && zoom2 > layer.options.maxZoom;
          }
        },
        _expandIfNotCollapsed: function() {
          if (this._map && !this.options.collapsed) {
            this.expand();
          }
          return this;
        },
        _expandSafely: function() {
          var section = this._section;
          this._preventClick = true;
          on(section, "click", preventDefault);
          this.expand();
          var that = this;
          setTimeout(function() {
            off(section, "click", preventDefault);
            that._preventClick = false;
          });
        }
      });
      var layers = function(baseLayers, overlays, options) {
        return new Layers(baseLayers, overlays, options);
      };
      var Zoom = Control.extend({
        // @section
        // @aka Control.Zoom options
        options: {
          position: "topleft",
          // @option zoomInText: String = '<span aria-hidden="true">+</span>'
          // The text set on the 'zoom in' button.
          zoomInText: '<span aria-hidden="true">+</span>',
          // @option zoomInTitle: String = 'Zoom in'
          // The title set on the 'zoom in' button.
          zoomInTitle: "Zoom in",
          // @option zoomOutText: String = '<span aria-hidden="true">&#x2212;</span>'
          // The text set on the 'zoom out' button.
          zoomOutText: '<span aria-hidden="true">&#x2212;</span>',
          // @option zoomOutTitle: String = 'Zoom out'
          // The title set on the 'zoom out' button.
          zoomOutTitle: "Zoom out"
        },
        onAdd: function(map) {
          var zoomName = "leaflet-control-zoom", container = create$1("div", zoomName + " leaflet-bar"), options = this.options;
          this._zoomInButton = this._createButton(
            options.zoomInText,
            options.zoomInTitle,
            zoomName + "-in",
            container,
            this._zoomIn
          );
          this._zoomOutButton = this._createButton(
            options.zoomOutText,
            options.zoomOutTitle,
            zoomName + "-out",
            container,
            this._zoomOut
          );
          this._updateDisabled();
          map.on("zoomend zoomlevelschange", this._updateDisabled, this);
          return container;
        },
        onRemove: function(map) {
          map.off("zoomend zoomlevelschange", this._updateDisabled, this);
        },
        disable: function() {
          this._disabled = true;
          this._updateDisabled();
          return this;
        },
        enable: function() {
          this._disabled = false;
          this._updateDisabled();
          return this;
        },
        _zoomIn: function(e) {
          if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
            this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
          }
        },
        _zoomOut: function(e) {
          if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
            this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
          }
        },
        _createButton: function(html, title, className, container, fn) {
          var link = create$1("a", className, container);
          link.innerHTML = html;
          link.href = "#";
          link.title = title;
          link.setAttribute("role", "button");
          link.setAttribute("aria-label", title);
          disableClickPropagation(link);
          on(link, "click", stop);
          on(link, "click", fn, this);
          on(link, "click", this._refocusOnMap, this);
          return link;
        },
        _updateDisabled: function() {
          var map = this._map, className = "leaflet-disabled";
          removeClass(this._zoomInButton, className);
          removeClass(this._zoomOutButton, className);
          this._zoomInButton.setAttribute("aria-disabled", "false");
          this._zoomOutButton.setAttribute("aria-disabled", "false");
          if (this._disabled || map._zoom === map.getMinZoom()) {
            addClass(this._zoomOutButton, className);
            this._zoomOutButton.setAttribute("aria-disabled", "true");
          }
          if (this._disabled || map._zoom === map.getMaxZoom()) {
            addClass(this._zoomInButton, className);
            this._zoomInButton.setAttribute("aria-disabled", "true");
          }
        }
      });
      Map2.mergeOptions({
        zoomControl: true
      });
      Map2.addInitHook(function() {
        if (this.options.zoomControl) {
          this.zoomControl = new Zoom();
          this.addControl(this.zoomControl);
        }
      });
      var zoom = function(options) {
        return new Zoom(options);
      };
      var Scale = Control.extend({
        // @section
        // @aka Control.Scale options
        options: {
          position: "bottomleft",
          // @option maxWidth: Number = 100
          // Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
          maxWidth: 100,
          // @option metric: Boolean = True
          // Whether to show the metric scale line (m/km).
          metric: true,
          // @option imperial: Boolean = True
          // Whether to show the imperial scale line (mi/ft).
          imperial: true
          // @option updateWhenIdle: Boolean = false
          // If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
        },
        onAdd: function(map) {
          var className = "leaflet-control-scale", container = create$1("div", className), options = this.options;
          this._addScales(options, className + "-line", container);
          map.on(options.updateWhenIdle ? "moveend" : "move", this._update, this);
          map.whenReady(this._update, this);
          return container;
        },
        onRemove: function(map) {
          map.off(this.options.updateWhenIdle ? "moveend" : "move", this._update, this);
        },
        _addScales: function(options, className, container) {
          if (options.metric) {
            this._mScale = create$1("div", className, container);
          }
          if (options.imperial) {
            this._iScale = create$1("div", className, container);
          }
        },
        _update: function() {
          var map = this._map, y = map.getSize().y / 2;
          var maxMeters = map.distance(
            map.containerPointToLatLng([0, y]),
            map.containerPointToLatLng([this.options.maxWidth, y])
          );
          this._updateScales(maxMeters);
        },
        _updateScales: function(maxMeters) {
          if (this.options.metric && maxMeters) {
            this._updateMetric(maxMeters);
          }
          if (this.options.imperial && maxMeters) {
            this._updateImperial(maxMeters);
          }
        },
        _updateMetric: function(maxMeters) {
          var meters = this._getRoundNum(maxMeters), label = meters < 1e3 ? meters + " m" : meters / 1e3 + " km";
          this._updateScale(this._mScale, label, meters / maxMeters);
        },
        _updateImperial: function(maxMeters) {
          var maxFeet = maxMeters * 3.2808399, maxMiles, miles, feet;
          if (maxFeet > 5280) {
            maxMiles = maxFeet / 5280;
            miles = this._getRoundNum(maxMiles);
            this._updateScale(this._iScale, miles + " mi", miles / maxMiles);
          } else {
            feet = this._getRoundNum(maxFeet);
            this._updateScale(this._iScale, feet + " ft", feet / maxFeet);
          }
        },
        _updateScale: function(scale2, text, ratio) {
          scale2.style.width = Math.round(this.options.maxWidth * ratio) + "px";
          scale2.innerHTML = text;
        },
        _getRoundNum: function(num) {
          var pow10 = Math.pow(10, (Math.floor(num) + "").length - 1), d = num / pow10;
          d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
          return pow10 * d;
        }
      });
      var scale = function(options) {
        return new Scale(options);
      };
      var ukrainianFlag = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>';
      var Attribution = Control.extend({
        // @section
        // @aka Control.Attribution options
        options: {
          position: "bottomright",
          // @option prefix: String|false = 'Leaflet'
          // The HTML text shown before the attributions. Pass `false` to disable.
          prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' + (Browser.inlineSvg ? ukrainianFlag + " " : "") + "Leaflet</a>"
        },
        initialize: function(options) {
          setOptions(this, options);
          this._attributions = {};
        },
        onAdd: function(map) {
          map.attributionControl = this;
          this._container = create$1("div", "leaflet-control-attribution");
          disableClickPropagation(this._container);
          for (var i in map._layers) {
            if (map._layers[i].getAttribution) {
              this.addAttribution(map._layers[i].getAttribution());
            }
          }
          this._update();
          map.on("layeradd", this._addAttribution, this);
          return this._container;
        },
        onRemove: function(map) {
          map.off("layeradd", this._addAttribution, this);
        },
        _addAttribution: function(ev) {
          if (ev.layer.getAttribution) {
            this.addAttribution(ev.layer.getAttribution());
            ev.layer.once("remove", function() {
              this.removeAttribution(ev.layer.getAttribution());
            }, this);
          }
        },
        // @method setPrefix(prefix: String|false): this
        // The HTML text shown before the attributions. Pass `false` to disable.
        setPrefix: function(prefix) {
          this.options.prefix = prefix;
          this._update();
          return this;
        },
        // @method addAttribution(text: String): this
        // Adds an attribution text (e.g. `'&copy; OpenStreetMap contributors'`).
        addAttribution: function(text) {
          if (!text) {
            return this;
          }
          if (!this._attributions[text]) {
            this._attributions[text] = 0;
          }
          this._attributions[text]++;
          this._update();
          return this;
        },
        // @method removeAttribution(text: String): this
        // Removes an attribution text.
        removeAttribution: function(text) {
          if (!text) {
            return this;
          }
          if (this._attributions[text]) {
            this._attributions[text]--;
            this._update();
          }
          return this;
        },
        _update: function() {
          if (!this._map) {
            return;
          }
          var attribs = [];
          for (var i in this._attributions) {
            if (this._attributions[i]) {
              attribs.push(i);
            }
          }
          var prefixAndAttribs = [];
          if (this.options.prefix) {
            prefixAndAttribs.push(this.options.prefix);
          }
          if (attribs.length) {
            prefixAndAttribs.push(attribs.join(", "));
          }
          this._container.innerHTML = prefixAndAttribs.join(' <span aria-hidden="true">|</span> ');
        }
      });
      Map2.mergeOptions({
        attributionControl: true
      });
      Map2.addInitHook(function() {
        if (this.options.attributionControl) {
          new Attribution().addTo(this);
        }
      });
      var attribution = function(options) {
        return new Attribution(options);
      };
      Control.Layers = Layers;
      Control.Zoom = Zoom;
      Control.Scale = Scale;
      Control.Attribution = Attribution;
      control.layers = layers;
      control.zoom = zoom;
      control.scale = scale;
      control.attribution = attribution;
      var Handler = Class.extend({
        initialize: function(map) {
          this._map = map;
        },
        // @method enable(): this
        // Enables the handler
        enable: function() {
          if (this._enabled) {
            return this;
          }
          this._enabled = true;
          this.addHooks();
          return this;
        },
        // @method disable(): this
        // Disables the handler
        disable: function() {
          if (!this._enabled) {
            return this;
          }
          this._enabled = false;
          this.removeHooks();
          return this;
        },
        // @method enabled(): Boolean
        // Returns `true` if the handler is enabled
        enabled: function() {
          return !!this._enabled;
        }
        // @section Extension methods
        // Classes inheriting from `Handler` must implement the two following methods:
        // @method addHooks()
        // Called when the handler is enabled, should add event hooks.
        // @method removeHooks()
        // Called when the handler is disabled, should remove the event hooks added previously.
      });
      Handler.addTo = function(map, name) {
        map.addHandler(name, this);
        return this;
      };
      var Mixin = { Events };
      var START = Browser.touch ? "touchstart mousedown" : "mousedown";
      var Draggable = Evented.extend({
        options: {
          // @section
          // @aka Draggable options
          // @option clickTolerance: Number = 3
          // The max number of pixels a user can shift the mouse pointer during a click
          // for it to be considered a valid click (as opposed to a mouse drag).
          clickTolerance: 3
        },
        // @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
        // Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
        initialize: function(element, dragStartTarget, preventOutline2, options) {
          setOptions(this, options);
          this._element = element;
          this._dragStartTarget = dragStartTarget || element;
          this._preventOutline = preventOutline2;
        },
        // @method enable()
        // Enables the dragging ability
        enable: function() {
          if (this._enabled) {
            return;
          }
          on(this._dragStartTarget, START, this._onDown, this);
          this._enabled = true;
        },
        // @method disable()
        // Disables the dragging ability
        disable: function() {
          if (!this._enabled) {
            return;
          }
          if (Draggable._dragging === this) {
            this.finishDrag(true);
          }
          off(this._dragStartTarget, START, this._onDown, this);
          this._enabled = false;
          this._moved = false;
        },
        _onDown: function(e) {
          if (!this._enabled) {
            return;
          }
          this._moved = false;
          if (hasClass(this._element, "leaflet-zoom-anim")) {
            return;
          }
          if (e.touches && e.touches.length !== 1) {
            if (Draggable._dragging === this) {
              this.finishDrag();
            }
            return;
          }
          if (Draggable._dragging || e.shiftKey || e.which !== 1 && e.button !== 1 && !e.touches) {
            return;
          }
          Draggable._dragging = this;
          if (this._preventOutline) {
            preventOutline(this._element);
          }
          disableImageDrag();
          disableTextSelection();
          if (this._moving) {
            return;
          }
          this.fire("down");
          var first = e.touches ? e.touches[0] : e, sizedParent = getSizedParentNode(this._element);
          this._startPoint = new Point(first.clientX, first.clientY);
          this._startPos = getPosition(this._element);
          this._parentScale = getScale(sizedParent);
          var mouseevent = e.type === "mousedown";
          on(document, mouseevent ? "mousemove" : "touchmove", this._onMove, this);
          on(document, mouseevent ? "mouseup" : "touchend touchcancel", this._onUp, this);
        },
        _onMove: function(e) {
          if (!this._enabled) {
            return;
          }
          if (e.touches && e.touches.length > 1) {
            this._moved = true;
            return;
          }
          var first = e.touches && e.touches.length === 1 ? e.touches[0] : e, offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);
          if (!offset.x && !offset.y) {
            return;
          }
          if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) {
            return;
          }
          offset.x /= this._parentScale.x;
          offset.y /= this._parentScale.y;
          preventDefault(e);
          if (!this._moved) {
            this.fire("dragstart");
            this._moved = true;
            addClass(document.body, "leaflet-dragging");
            this._lastTarget = e.target || e.srcElement;
            if (window.SVGElementInstance && this._lastTarget instanceof window.SVGElementInstance) {
              this._lastTarget = this._lastTarget.correspondingUseElement;
            }
            addClass(this._lastTarget, "leaflet-drag-target");
          }
          this._newPos = this._startPos.add(offset);
          this._moving = true;
          this._lastEvent = e;
          this._updatePosition();
        },
        _updatePosition: function() {
          var e = { originalEvent: this._lastEvent };
          this.fire("predrag", e);
          setPosition(this._element, this._newPos);
          this.fire("drag", e);
        },
        _onUp: function() {
          if (!this._enabled) {
            return;
          }
          this.finishDrag();
        },
        finishDrag: function(noInertia) {
          removeClass(document.body, "leaflet-dragging");
          if (this._lastTarget) {
            removeClass(this._lastTarget, "leaflet-drag-target");
            this._lastTarget = null;
          }
          off(document, "mousemove touchmove", this._onMove, this);
          off(document, "mouseup touchend touchcancel", this._onUp, this);
          enableImageDrag();
          enableTextSelection();
          var fireDragend = this._moved && this._moving;
          this._moving = false;
          Draggable._dragging = false;
          if (fireDragend) {
            this.fire("dragend", {
              noInertia,
              distance: this._newPos.distanceTo(this._startPos)
            });
          }
        }
      });
      function clipPolygon(points, bounds, round) {
        var clippedPoints, edges = [1, 4, 2, 8], i, j, k, a, b, len, edge2, p;
        for (i = 0, len = points.length; i < len; i++) {
          points[i]._code = _getBitCode(points[i], bounds);
        }
        for (k = 0; k < 4; k++) {
          edge2 = edges[k];
          clippedPoints = [];
          for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
            a = points[i];
            b = points[j];
            if (!(a._code & edge2)) {
              if (b._code & edge2) {
                p = _getEdgeIntersection(b, a, edge2, bounds, round);
                p._code = _getBitCode(p, bounds);
                clippedPoints.push(p);
              }
              clippedPoints.push(a);
            } else if (!(b._code & edge2)) {
              p = _getEdgeIntersection(b, a, edge2, bounds, round);
              p._code = _getBitCode(p, bounds);
              clippedPoints.push(p);
            }
          }
          points = clippedPoints;
        }
        return points;
      }
      function polygonCenter(latlngs, crs) {
        var i, j, p1, p2, f, area, x, y, center;
        if (!latlngs || latlngs.length === 0) {
          throw new Error("latlngs not passed");
        }
        if (!isFlat(latlngs)) {
          console.warn("latlngs are not flat! Only the first ring will be used");
          latlngs = latlngs[0];
        }
        var centroidLatLng = toLatLng([0, 0]);
        var bounds = toLatLngBounds(latlngs);
        var areaBounds = bounds.getNorthWest().distanceTo(bounds.getSouthWest()) * bounds.getNorthEast().distanceTo(bounds.getNorthWest());
        if (areaBounds < 1700) {
          centroidLatLng = centroid(latlngs);
        }
        var len = latlngs.length;
        var points = [];
        for (i = 0; i < len; i++) {
          var latlng = toLatLng(latlngs[i]);
          points.push(crs.project(toLatLng([latlng.lat - centroidLatLng.lat, latlng.lng - centroidLatLng.lng])));
        }
        area = x = y = 0;
        for (i = 0, j = len - 1; i < len; j = i++) {
          p1 = points[i];
          p2 = points[j];
          f = p1.y * p2.x - p2.y * p1.x;
          x += (p1.x + p2.x) * f;
          y += (p1.y + p2.y) * f;
          area += f * 3;
        }
        if (area === 0) {
          center = points[0];
        } else {
          center = [x / area, y / area];
        }
        var latlngCenter = crs.unproject(toPoint(center));
        return toLatLng([latlngCenter.lat + centroidLatLng.lat, latlngCenter.lng + centroidLatLng.lng]);
      }
      function centroid(coords) {
        var latSum = 0;
        var lngSum = 0;
        var len = 0;
        for (var i = 0; i < coords.length; i++) {
          var latlng = toLatLng(coords[i]);
          latSum += latlng.lat;
          lngSum += latlng.lng;
          len++;
        }
        return toLatLng([latSum / len, lngSum / len]);
      }
      var PolyUtil = {
        __proto__: null,
        clipPolygon,
        polygonCenter,
        centroid
      };
      function simplify(points, tolerance) {
        if (!tolerance || !points.length) {
          return points.slice();
        }
        var sqTolerance = tolerance * tolerance;
        points = _reducePoints(points, sqTolerance);
        points = _simplifyDP(points, sqTolerance);
        return points;
      }
      function pointToSegmentDistance(p, p1, p2) {
        return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
      }
      function closestPointOnSegment(p, p1, p2) {
        return _sqClosestPointOnSegment(p, p1, p2);
      }
      function _simplifyDP(points, sqTolerance) {
        var len = points.length, ArrayConstructor = typeof Uint8Array !== "undefined" ? Uint8Array : Array, markers = new ArrayConstructor(len);
        markers[0] = markers[len - 1] = 1;
        _simplifyDPStep(points, markers, sqTolerance, 0, len - 1);
        var i, newPoints = [];
        for (i = 0; i < len; i++) {
          if (markers[i]) {
            newPoints.push(points[i]);
          }
        }
        return newPoints;
      }
      function _simplifyDPStep(points, markers, sqTolerance, first, last) {
        var maxSqDist = 0, index2, i, sqDist;
        for (i = first + 1; i <= last - 1; i++) {
          sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);
          if (sqDist > maxSqDist) {
            index2 = i;
            maxSqDist = sqDist;
          }
        }
        if (maxSqDist > sqTolerance) {
          markers[index2] = 1;
          _simplifyDPStep(points, markers, sqTolerance, first, index2);
          _simplifyDPStep(points, markers, sqTolerance, index2, last);
        }
      }
      function _reducePoints(points, sqTolerance) {
        var reducedPoints = [points[0]];
        for (var i = 1, prev = 0, len = points.length; i < len; i++) {
          if (_sqDist(points[i], points[prev]) > sqTolerance) {
            reducedPoints.push(points[i]);
            prev = i;
          }
        }
        if (prev < len - 1) {
          reducedPoints.push(points[len - 1]);
        }
        return reducedPoints;
      }
      var _lastCode;
      function clipSegment(a, b, bounds, useLastCode, round) {
        var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds), codeB = _getBitCode(b, bounds), codeOut, p, newCode;
        _lastCode = codeB;
        while (true) {
          if (!(codeA | codeB)) {
            return [a, b];
          }
          if (codeA & codeB) {
            return false;
          }
          codeOut = codeA || codeB;
          p = _getEdgeIntersection(a, b, codeOut, bounds, round);
          newCode = _getBitCode(p, bounds);
          if (codeOut === codeA) {
            a = p;
            codeA = newCode;
          } else {
            b = p;
            codeB = newCode;
          }
        }
      }
      function _getEdgeIntersection(a, b, code, bounds, round) {
        var dx = b.x - a.x, dy = b.y - a.y, min = bounds.min, max = bounds.max, x, y;
        if (code & 8) {
          x = a.x + dx * (max.y - a.y) / dy;
          y = max.y;
        } else if (code & 4) {
          x = a.x + dx * (min.y - a.y) / dy;
          y = min.y;
        } else if (code & 2) {
          x = max.x;
          y = a.y + dy * (max.x - a.x) / dx;
        } else if (code & 1) {
          x = min.x;
          y = a.y + dy * (min.x - a.x) / dx;
        }
        return new Point(x, y, round);
      }
      function _getBitCode(p, bounds) {
        var code = 0;
        if (p.x < bounds.min.x) {
          code |= 1;
        } else if (p.x > bounds.max.x) {
          code |= 2;
        }
        if (p.y < bounds.min.y) {
          code |= 4;
        } else if (p.y > bounds.max.y) {
          code |= 8;
        }
        return code;
      }
      function _sqDist(p1, p2) {
        var dx = p2.x - p1.x, dy = p2.y - p1.y;
        return dx * dx + dy * dy;
      }
      function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
        var x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y, dot = dx * dx + dy * dy, t;
        if (dot > 0) {
          t = ((p.x - x) * dx + (p.y - y) * dy) / dot;
          if (t > 1) {
            x = p2.x;
            y = p2.y;
          } else if (t > 0) {
            x += dx * t;
            y += dy * t;
          }
        }
        dx = p.x - x;
        dy = p.y - y;
        return sqDist ? dx * dx + dy * dy : new Point(x, y);
      }
      function isFlat(latlngs) {
        return !isArray(latlngs[0]) || typeof latlngs[0][0] !== "object" && typeof latlngs[0][0] !== "undefined";
      }
      function _flat(latlngs) {
        console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead.");
        return isFlat(latlngs);
      }
      function polylineCenter(latlngs, crs) {
        var i, halfDist, segDist, dist, p1, p2, ratio, center;
        if (!latlngs || latlngs.length === 0) {
          throw new Error("latlngs not passed");
        }
        if (!isFlat(latlngs)) {
          console.warn("latlngs are not flat! Only the first ring will be used");
          latlngs = latlngs[0];
        }
        var centroidLatLng = toLatLng([0, 0]);
        var bounds = toLatLngBounds(latlngs);
        var areaBounds = bounds.getNorthWest().distanceTo(bounds.getSouthWest()) * bounds.getNorthEast().distanceTo(bounds.getNorthWest());
        if (areaBounds < 1700) {
          centroidLatLng = centroid(latlngs);
        }
        var len = latlngs.length;
        var points = [];
        for (i = 0; i < len; i++) {
          var latlng = toLatLng(latlngs[i]);
          points.push(crs.project(toLatLng([latlng.lat - centroidLatLng.lat, latlng.lng - centroidLatLng.lng])));
        }
        for (i = 0, halfDist = 0; i < len - 1; i++) {
          halfDist += points[i].distanceTo(points[i + 1]) / 2;
        }
        if (halfDist === 0) {
          center = points[0];
        } else {
          for (i = 0, dist = 0; i < len - 1; i++) {
            p1 = points[i];
            p2 = points[i + 1];
            segDist = p1.distanceTo(p2);
            dist += segDist;
            if (dist > halfDist) {
              ratio = (dist - halfDist) / segDist;
              center = [
                p2.x - ratio * (p2.x - p1.x),
                p2.y - ratio * (p2.y - p1.y)
              ];
              break;
            }
          }
        }
        var latlngCenter = crs.unproject(toPoint(center));
        return toLatLng([latlngCenter.lat + centroidLatLng.lat, latlngCenter.lng + centroidLatLng.lng]);
      }
      var LineUtil = {
        __proto__: null,
        simplify,
        pointToSegmentDistance,
        closestPointOnSegment,
        clipSegment,
        _getEdgeIntersection,
        _getBitCode,
        _sqClosestPointOnSegment,
        isFlat,
        _flat,
        polylineCenter
      };
      var LonLat = {
        project: function(latlng) {
          return new Point(latlng.lng, latlng.lat);
        },
        unproject: function(point) {
          return new LatLng(point.y, point.x);
        },
        bounds: new Bounds([-180, -90], [180, 90])
      };
      var Mercator = {
        R: 6378137,
        R_MINOR: 6356752314245179e-9,
        bounds: new Bounds([-2003750834279e-5, -1549657073972e-5], [2003750834279e-5, 1876465623138e-5]),
        project: function(latlng) {
          var d = Math.PI / 180, r = this.R, y = latlng.lat * d, tmp = this.R_MINOR / r, e = Math.sqrt(1 - tmp * tmp), con = e * Math.sin(y);
          var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
          y = -r * Math.log(Math.max(ts, 1e-10));
          return new Point(latlng.lng * d * r, y);
        },
        unproject: function(point) {
          var d = 180 / Math.PI, r = this.R, tmp = this.R_MINOR / r, e = Math.sqrt(1 - tmp * tmp), ts = Math.exp(-point.y / r), phi = Math.PI / 2 - 2 * Math.atan(ts);
          for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
            con = e * Math.sin(phi);
            con = Math.pow((1 - con) / (1 + con), e / 2);
            dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
            phi += dphi;
          }
          return new LatLng(phi * d, point.x * d / r);
        }
      };
      var index = {
        __proto__: null,
        LonLat,
        Mercator,
        SphericalMercator
      };
      var EPSG3395 = extend({}, Earth, {
        code: "EPSG:3395",
        projection: Mercator,
        transformation: (function() {
          var scale2 = 0.5 / (Math.PI * Mercator.R);
          return toTransformation(scale2, 0.5, -scale2, 0.5);
        })()
      });
      var EPSG4326 = extend({}, Earth, {
        code: "EPSG:4326",
        projection: LonLat,
        transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
      });
      var Simple = extend({}, CRS, {
        projection: LonLat,
        transformation: toTransformation(1, 0, -1, 0),
        scale: function(zoom2) {
          return Math.pow(2, zoom2);
        },
        zoom: function(scale2) {
          return Math.log(scale2) / Math.LN2;
        },
        distance: function(latlng1, latlng2) {
          var dx = latlng2.lng - latlng1.lng, dy = latlng2.lat - latlng1.lat;
          return Math.sqrt(dx * dx + dy * dy);
        },
        infinite: true
      });
      CRS.Earth = Earth;
      CRS.EPSG3395 = EPSG3395;
      CRS.EPSG3857 = EPSG3857;
      CRS.EPSG900913 = EPSG900913;
      CRS.EPSG4326 = EPSG4326;
      CRS.Simple = Simple;
      var Layer = Evented.extend({
        // Classes extending `L.Layer` will inherit the following options:
        options: {
          // @option pane: String = 'overlayPane'
          // By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
          pane: "overlayPane",
          // @option attribution: String = null
          // String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
          attribution: null,
          bubblingMouseEvents: true
        },
        /* @section
         * Classes extending `L.Layer` will inherit the following methods:
         *
         * @method addTo(map: Map|LayerGroup): this
         * Adds the layer to the given map or layer group.
         */
        addTo: function(map) {
          map.addLayer(this);
          return this;
        },
        // @method remove: this
        // Removes the layer from the map it is currently active on.
        remove: function() {
          return this.removeFrom(this._map || this._mapToAdd);
        },
        // @method removeFrom(map: Map): this
        // Removes the layer from the given map
        //
        // @alternative
        // @method removeFrom(group: LayerGroup): this
        // Removes the layer from the given `LayerGroup`
        removeFrom: function(obj) {
          if (obj) {
            obj.removeLayer(this);
          }
          return this;
        },
        // @method getPane(name? : String): HTMLElement
        // Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
        getPane: function(name) {
          return this._map.getPane(name ? this.options[name] || name : this.options.pane);
        },
        addInteractiveTarget: function(targetEl) {
          this._map._targets[stamp(targetEl)] = this;
          return this;
        },
        removeInteractiveTarget: function(targetEl) {
          delete this._map._targets[stamp(targetEl)];
          return this;
        },
        // @method getAttribution: String
        // Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
        getAttribution: function() {
          return this.options.attribution;
        },
        _layerAdd: function(e) {
          var map = e.target;
          if (!map.hasLayer(this)) {
            return;
          }
          this._map = map;
          this._zoomAnimated = map._zoomAnimated;
          if (this.getEvents) {
            var events = this.getEvents();
            map.on(events, this);
            this.once("remove", function() {
              map.off(events, this);
            }, this);
          }
          this.onAdd(map);
          this.fire("add");
          map.fire("layeradd", { layer: this });
        }
      });
      Map2.include({
        // @method addLayer(layer: Layer): this
        // Adds the given layer to the map
        addLayer: function(layer) {
          if (!layer._layerAdd) {
            throw new Error("The provided object is not a Layer.");
          }
          var id = stamp(layer);
          if (this._layers[id]) {
            return this;
          }
          this._layers[id] = layer;
          layer._mapToAdd = this;
          if (layer.beforeAdd) {
            layer.beforeAdd(this);
          }
          this.whenReady(layer._layerAdd, layer);
          return this;
        },
        // @method removeLayer(layer: Layer): this
        // Removes the given layer from the map.
        removeLayer: function(layer) {
          var id = stamp(layer);
          if (!this._layers[id]) {
            return this;
          }
          if (this._loaded) {
            layer.onRemove(this);
          }
          delete this._layers[id];
          if (this._loaded) {
            this.fire("layerremove", { layer });
            layer.fire("remove");
          }
          layer._map = layer._mapToAdd = null;
          return this;
        },
        // @method hasLayer(layer: Layer): Boolean
        // Returns `true` if the given layer is currently added to the map
        hasLayer: function(layer) {
          return stamp(layer) in this._layers;
        },
        /* @method eachLayer(fn: Function, context?: Object): this
         * Iterates over the layers of the map, optionally specifying context of the iterator function.
         * ```
         * map.eachLayer(function(layer){
         *     layer.bindPopup('Hello');
         * });
         * ```
         */
        eachLayer: function(method, context) {
          for (var i in this._layers) {
            method.call(context, this._layers[i]);
          }
          return this;
        },
        _addLayers: function(layers2) {
          layers2 = layers2 ? isArray(layers2) ? layers2 : [layers2] : [];
          for (var i = 0, len = layers2.length; i < len; i++) {
            this.addLayer(layers2[i]);
          }
        },
        _addZoomLimit: function(layer) {
          if (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
            this._zoomBoundLayers[stamp(layer)] = layer;
            this._updateZoomLevels();
          }
        },
        _removeZoomLimit: function(layer) {
          var id = stamp(layer);
          if (this._zoomBoundLayers[id]) {
            delete this._zoomBoundLayers[id];
            this._updateZoomLevels();
          }
        },
        _updateZoomLevels: function() {
          var minZoom = Infinity, maxZoom = -Infinity, oldZoomSpan = this._getZoomSpan();
          for (var i in this._zoomBoundLayers) {
            var options = this._zoomBoundLayers[i].options;
            minZoom = options.minZoom === void 0 ? minZoom : Math.min(minZoom, options.minZoom);
            maxZoom = options.maxZoom === void 0 ? maxZoom : Math.max(maxZoom, options.maxZoom);
          }
          this._layersMaxZoom = maxZoom === -Infinity ? void 0 : maxZoom;
          this._layersMinZoom = minZoom === Infinity ? void 0 : minZoom;
          if (oldZoomSpan !== this._getZoomSpan()) {
            this.fire("zoomlevelschange");
          }
          if (this.options.maxZoom === void 0 && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
            this.setZoom(this._layersMaxZoom);
          }
          if (this.options.minZoom === void 0 && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
            this.setZoom(this._layersMinZoom);
          }
        }
      });
      var LayerGroup = Layer.extend({
        initialize: function(layers2, options) {
          setOptions(this, options);
          this._layers = {};
          var i, len;
          if (layers2) {
            for (i = 0, len = layers2.length; i < len; i++) {
              this.addLayer(layers2[i]);
            }
          }
        },
        // @method addLayer(layer: Layer): this
        // Adds the given layer to the group.
        addLayer: function(layer) {
          var id = this.getLayerId(layer);
          this._layers[id] = layer;
          if (this._map) {
            this._map.addLayer(layer);
          }
          return this;
        },
        // @method removeLayer(layer: Layer): this
        // Removes the given layer from the group.
        // @alternative
        // @method removeLayer(id: Number): this
        // Removes the layer with the given internal ID from the group.
        removeLayer: function(layer) {
          var id = layer in this._layers ? layer : this.getLayerId(layer);
          if (this._map && this._layers[id]) {
            this._map.removeLayer(this._layers[id]);
          }
          delete this._layers[id];
          return this;
        },
        // @method hasLayer(layer: Layer): Boolean
        // Returns `true` if the given layer is currently added to the group.
        // @alternative
        // @method hasLayer(id: Number): Boolean
        // Returns `true` if the given internal ID is currently added to the group.
        hasLayer: function(layer) {
          var layerId = typeof layer === "number" ? layer : this.getLayerId(layer);
          return layerId in this._layers;
        },
        // @method clearLayers(): this
        // Removes all the layers from the group.
        clearLayers: function() {
          return this.eachLayer(this.removeLayer, this);
        },
        // @method invoke(methodName: String, …): this
        // Calls `methodName` on every layer contained in this group, passing any
        // additional parameters. Has no effect if the layers contained do not
        // implement `methodName`.
        invoke: function(methodName) {
          var args = Array.prototype.slice.call(arguments, 1), i, layer;
          for (i in this._layers) {
            layer = this._layers[i];
            if (layer[methodName]) {
              layer[methodName].apply(layer, args);
            }
          }
          return this;
        },
        onAdd: function(map) {
          this.eachLayer(map.addLayer, map);
        },
        onRemove: function(map) {
          this.eachLayer(map.removeLayer, map);
        },
        // @method eachLayer(fn: Function, context?: Object): this
        // Iterates over the layers of the group, optionally specifying context of the iterator function.
        // ```js
        // group.eachLayer(function (layer) {
        // 	layer.bindPopup('Hello');
        // });
        // ```
        eachLayer: function(method, context) {
          for (var i in this._layers) {
            method.call(context, this._layers[i]);
          }
          return this;
        },
        // @method getLayer(id: Number): Layer
        // Returns the layer with the given internal ID.
        getLayer: function(id) {
          return this._layers[id];
        },
        // @method getLayers(): Layer[]
        // Returns an array of all the layers added to the group.
        getLayers: function() {
          var layers2 = [];
          this.eachLayer(layers2.push, layers2);
          return layers2;
        },
        // @method setZIndex(zIndex: Number): this
        // Calls `setZIndex` on every layer contained in this group, passing the z-index.
        setZIndex: function(zIndex) {
          return this.invoke("setZIndex", zIndex);
        },
        // @method getLayerId(layer: Layer): Number
        // Returns the internal ID for a layer
        getLayerId: function(layer) {
          return stamp(layer);
        }
      });
      var layerGroup = function(layers2, options) {
        return new LayerGroup(layers2, options);
      };
      var FeatureGroup = LayerGroup.extend({
        addLayer: function(layer) {
          if (this.hasLayer(layer)) {
            return this;
          }
          layer.addEventParent(this);
          LayerGroup.prototype.addLayer.call(this, layer);
          return this.fire("layeradd", { layer });
        },
        removeLayer: function(layer) {
          if (!this.hasLayer(layer)) {
            return this;
          }
          if (layer in this._layers) {
            layer = this._layers[layer];
          }
          layer.removeEventParent(this);
          LayerGroup.prototype.removeLayer.call(this, layer);
          return this.fire("layerremove", { layer });
        },
        // @method setStyle(style: Path options): this
        // Sets the given path options to each layer of the group that has a `setStyle` method.
        setStyle: function(style2) {
          return this.invoke("setStyle", style2);
        },
        // @method bringToFront(): this
        // Brings the layer group to the top of all other layers
        bringToFront: function() {
          return this.invoke("bringToFront");
        },
        // @method bringToBack(): this
        // Brings the layer group to the back of all other layers
        bringToBack: function() {
          return this.invoke("bringToBack");
        },
        // @method getBounds(): LatLngBounds
        // Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
        getBounds: function() {
          var bounds = new LatLngBounds();
          for (var id in this._layers) {
            var layer = this._layers[id];
            bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
          }
          return bounds;
        }
      });
      var featureGroup = function(layers2, options) {
        return new FeatureGroup(layers2, options);
      };
      var Icon = Class.extend({
        /* @section
         * @aka Icon options
         *
         * @option iconUrl: String = null
         * **(required)** The URL to the icon image (absolute or relative to your script path).
         *
         * @option iconRetinaUrl: String = null
         * The URL to a retina sized version of the icon image (absolute or relative to your
         * script path). Used for Retina screen devices.
         *
         * @option iconSize: Point = null
         * Size of the icon image in pixels.
         *
         * @option iconAnchor: Point = null
         * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
         * will be aligned so that this point is at the marker's geographical location. Centered
         * by default if size is specified, also can be set in CSS with negative margins.
         *
         * @option popupAnchor: Point = [0, 0]
         * The coordinates of the point from which popups will "open", relative to the icon anchor.
         *
         * @option tooltipAnchor: Point = [0, 0]
         * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
         *
         * @option shadowUrl: String = null
         * The URL to the icon shadow image. If not specified, no shadow image will be created.
         *
         * @option shadowRetinaUrl: String = null
         *
         * @option shadowSize: Point = null
         * Size of the shadow image in pixels.
         *
         * @option shadowAnchor: Point = null
         * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
         * as iconAnchor if not specified).
         *
         * @option className: String = ''
         * A custom class name to assign to both icon and shadow images. Empty by default.
         */
        options: {
          popupAnchor: [0, 0],
          tooltipAnchor: [0, 0],
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the tiles.
          // If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: false
        },
        initialize: function(options) {
          setOptions(this, options);
        },
        // @method createIcon(oldIcon?: HTMLElement): HTMLElement
        // Called internally when the icon has to be shown, returns a `<img>` HTML element
        // styled according to the options.
        createIcon: function(oldIcon) {
          return this._createIcon("icon", oldIcon);
        },
        // @method createShadow(oldIcon?: HTMLElement): HTMLElement
        // As `createIcon`, but for the shadow beneath it.
        createShadow: function(oldIcon) {
          return this._createIcon("shadow", oldIcon);
        },
        _createIcon: function(name, oldIcon) {
          var src = this._getIconUrl(name);
          if (!src) {
            if (name === "icon") {
              throw new Error("iconUrl not set in Icon options (see the docs).");
            }
            return null;
          }
          var img = this._createImg(src, oldIcon && oldIcon.tagName === "IMG" ? oldIcon : null);
          this._setIconStyles(img, name);
          if (this.options.crossOrigin || this.options.crossOrigin === "") {
            img.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
          }
          return img;
        },
        _setIconStyles: function(img, name) {
          var options = this.options;
          var sizeOption = options[name + "Size"];
          if (typeof sizeOption === "number") {
            sizeOption = [sizeOption, sizeOption];
          }
          var size = toPoint(sizeOption), anchor = toPoint(name === "shadow" && options.shadowAnchor || options.iconAnchor || size && size.divideBy(2, true));
          img.className = "leaflet-marker-" + name + " " + (options.className || "");
          if (anchor) {
            img.style.marginLeft = -anchor.x + "px";
            img.style.marginTop = -anchor.y + "px";
          }
          if (size) {
            img.style.width = size.x + "px";
            img.style.height = size.y + "px";
          }
        },
        _createImg: function(src, el) {
          el = el || document.createElement("img");
          el.src = src;
          return el;
        },
        _getIconUrl: function(name) {
          return Browser.retina && this.options[name + "RetinaUrl"] || this.options[name + "Url"];
        }
      });
      function icon(options) {
        return new Icon(options);
      }
      var IconDefault = Icon.extend({
        options: {
          iconUrl: "marker-icon.png",
          iconRetinaUrl: "marker-icon-2x.png",
          shadowUrl: "marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        },
        _getIconUrl: function(name) {
          if (typeof IconDefault.imagePath !== "string") {
            IconDefault.imagePath = this._detectIconPath();
          }
          return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
        },
        _stripUrl: function(path) {
          var strip = function(str, re, idx) {
            var match = re.exec(str);
            return match && match[idx];
          };
          path = strip(path, /^url\((['"])?(.+)\1\)$/, 2);
          return path && strip(path, /^(.*)marker-icon\.png$/, 1);
        },
        _detectIconPath: function() {
          var el = create$1("div", "leaflet-default-icon-path", document.body);
          var path = getStyle(el, "background-image") || getStyle(el, "backgroundImage");
          document.body.removeChild(el);
          path = this._stripUrl(path);
          if (path) {
            return path;
          }
          var link = document.querySelector('link[href$="leaflet.css"]');
          if (!link) {
            return "";
          }
          return link.href.substring(0, link.href.length - "leaflet.css".length - 1);
        }
      });
      var MarkerDrag = Handler.extend({
        initialize: function(marker2) {
          this._marker = marker2;
        },
        addHooks: function() {
          var icon2 = this._marker._icon;
          if (!this._draggable) {
            this._draggable = new Draggable(icon2, icon2, true);
          }
          this._draggable.on({
            dragstart: this._onDragStart,
            predrag: this._onPreDrag,
            drag: this._onDrag,
            dragend: this._onDragEnd
          }, this).enable();
          addClass(icon2, "leaflet-marker-draggable");
        },
        removeHooks: function() {
          this._draggable.off({
            dragstart: this._onDragStart,
            predrag: this._onPreDrag,
            drag: this._onDrag,
            dragend: this._onDragEnd
          }, this).disable();
          if (this._marker._icon) {
            removeClass(this._marker._icon, "leaflet-marker-draggable");
          }
        },
        moved: function() {
          return this._draggable && this._draggable._moved;
        },
        _adjustPan: function(e) {
          var marker2 = this._marker, map = marker2._map, speed = this._marker.options.autoPanSpeed, padding = this._marker.options.autoPanPadding, iconPos = getPosition(marker2._icon), bounds = map.getPixelBounds(), origin = map.getPixelOrigin();
          var panBounds = toBounds(
            bounds.min._subtract(origin).add(padding),
            bounds.max._subtract(origin).subtract(padding)
          );
          if (!panBounds.contains(iconPos)) {
            var movement = toPoint(
              (Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) - (Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),
              (Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) - (Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
            ).multiplyBy(speed);
            map.panBy(movement, { animate: false });
            this._draggable._newPos._add(movement);
            this._draggable._startPos._add(movement);
            setPosition(marker2._icon, this._draggable._newPos);
            this._onDrag(e);
            this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
          }
        },
        _onDragStart: function() {
          this._oldLatLng = this._marker.getLatLng();
          this._marker.closePopup && this._marker.closePopup();
          this._marker.fire("movestart").fire("dragstart");
        },
        _onPreDrag: function(e) {
          if (this._marker.options.autoPan) {
            cancelAnimFrame(this._panRequest);
            this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
          }
        },
        _onDrag: function(e) {
          var marker2 = this._marker, shadow = marker2._shadow, iconPos = getPosition(marker2._icon), latlng = marker2._map.layerPointToLatLng(iconPos);
          if (shadow) {
            setPosition(shadow, iconPos);
          }
          marker2._latlng = latlng;
          e.latlng = latlng;
          e.oldLatLng = this._oldLatLng;
          marker2.fire("move", e).fire("drag", e);
        },
        _onDragEnd: function(e) {
          cancelAnimFrame(this._panRequest);
          delete this._oldLatLng;
          this._marker.fire("moveend").fire("dragend", e);
        }
      });
      var Marker = Layer.extend({
        // @section
        // @aka Marker options
        options: {
          // @option icon: Icon = *
          // Icon instance to use for rendering the marker.
          // See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
          // If not specified, a common instance of `L.Icon.Default` is used.
          icon: new IconDefault(),
          // Option inherited from "Interactive layer" abstract class
          interactive: true,
          // @option keyboard: Boolean = true
          // Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
          keyboard: true,
          // @option title: String = ''
          // Text for the browser tooltip that appear on marker hover (no tooltip by default).
          // [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
          title: "",
          // @option alt: String = 'Marker'
          // Text for the `alt` attribute of the icon image.
          // [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
          alt: "Marker",
          // @option zIndexOffset: Number = 0
          // By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
          zIndexOffset: 0,
          // @option opacity: Number = 1.0
          // The opacity of the marker.
          opacity: 1,
          // @option riseOnHover: Boolean = false
          // If `true`, the marker will get on top of others when you hover the mouse over it.
          riseOnHover: false,
          // @option riseOffset: Number = 250
          // The z-index offset used for the `riseOnHover` feature.
          riseOffset: 250,
          // @option pane: String = 'markerPane'
          // `Map pane` where the markers icon will be added.
          pane: "markerPane",
          // @option shadowPane: String = 'shadowPane'
          // `Map pane` where the markers shadow will be added.
          shadowPane: "shadowPane",
          // @option bubblingMouseEvents: Boolean = false
          // When `true`, a mouse event on this marker will trigger the same event on the map
          // (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
          bubblingMouseEvents: false,
          // @option autoPanOnFocus: Boolean = true
          // When `true`, the map will pan whenever the marker is focused (via
          // e.g. pressing `tab` on the keyboard) to ensure the marker is
          // visible within the map's bounds
          autoPanOnFocus: true,
          // @section Draggable marker options
          // @option draggable: Boolean = false
          // Whether the marker is draggable with mouse/touch or not.
          draggable: false,
          // @option autoPan: Boolean = false
          // Whether to pan the map when dragging this marker near its edge or not.
          autoPan: false,
          // @option autoPanPadding: Point = Point(50, 50)
          // Distance (in pixels to the left/right and to the top/bottom) of the
          // map edge to start panning the map.
          autoPanPadding: [50, 50],
          // @option autoPanSpeed: Number = 10
          // Number of pixels the map should pan by.
          autoPanSpeed: 10
        },
        /* @section
         *
         * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
         */
        initialize: function(latlng, options) {
          setOptions(this, options);
          this._latlng = toLatLng(latlng);
        },
        onAdd: function(map) {
          this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;
          if (this._zoomAnimated) {
            map.on("zoomanim", this._animateZoom, this);
          }
          this._initIcon();
          this.update();
        },
        onRemove: function(map) {
          if (this.dragging && this.dragging.enabled()) {
            this.options.draggable = true;
            this.dragging.removeHooks();
          }
          delete this.dragging;
          if (this._zoomAnimated) {
            map.off("zoomanim", this._animateZoom, this);
          }
          this._removeIcon();
          this._removeShadow();
        },
        getEvents: function() {
          return {
            zoom: this.update,
            viewreset: this.update
          };
        },
        // @method getLatLng: LatLng
        // Returns the current geographical position of the marker.
        getLatLng: function() {
          return this._latlng;
        },
        // @method setLatLng(latlng: LatLng): this
        // Changes the marker position to the given point.
        setLatLng: function(latlng) {
          var oldLatLng = this._latlng;
          this._latlng = toLatLng(latlng);
          this.update();
          return this.fire("move", { oldLatLng, latlng: this._latlng });
        },
        // @method setZIndexOffset(offset: Number): this
        // Changes the [zIndex offset](#marker-zindexoffset) of the marker.
        setZIndexOffset: function(offset) {
          this.options.zIndexOffset = offset;
          return this.update();
        },
        // @method getIcon: Icon
        // Returns the current icon used by the marker
        getIcon: function() {
          return this.options.icon;
        },
        // @method setIcon(icon: Icon): this
        // Changes the marker icon.
        setIcon: function(icon2) {
          this.options.icon = icon2;
          if (this._map) {
            this._initIcon();
            this.update();
          }
          if (this._popup) {
            this.bindPopup(this._popup, this._popup.options);
          }
          return this;
        },
        getElement: function() {
          return this._icon;
        },
        update: function() {
          if (this._icon && this._map) {
            var pos = this._map.latLngToLayerPoint(this._latlng).round();
            this._setPos(pos);
          }
          return this;
        },
        _initIcon: function() {
          var options = this.options, classToAdd = "leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide");
          var icon2 = options.icon.createIcon(this._icon), addIcon = false;
          if (icon2 !== this._icon) {
            if (this._icon) {
              this._removeIcon();
            }
            addIcon = true;
            if (options.title) {
              icon2.title = options.title;
            }
            if (icon2.tagName === "IMG") {
              icon2.alt = options.alt || "";
            }
          }
          addClass(icon2, classToAdd);
          if (options.keyboard) {
            icon2.tabIndex = "0";
            icon2.setAttribute("role", "button");
          }
          this._icon = icon2;
          if (options.riseOnHover) {
            this.on({
              mouseover: this._bringToFront,
              mouseout: this._resetZIndex
            });
          }
          if (this.options.autoPanOnFocus) {
            on(icon2, "focus", this._panOnFocus, this);
          }
          var newShadow = options.icon.createShadow(this._shadow), addShadow = false;
          if (newShadow !== this._shadow) {
            this._removeShadow();
            addShadow = true;
          }
          if (newShadow) {
            addClass(newShadow, classToAdd);
            newShadow.alt = "";
          }
          this._shadow = newShadow;
          if (options.opacity < 1) {
            this._updateOpacity();
          }
          if (addIcon) {
            this.getPane().appendChild(this._icon);
          }
          this._initInteraction();
          if (newShadow && addShadow) {
            this.getPane(options.shadowPane).appendChild(this._shadow);
          }
        },
        _removeIcon: function() {
          if (this.options.riseOnHover) {
            this.off({
              mouseover: this._bringToFront,
              mouseout: this._resetZIndex
            });
          }
          if (this.options.autoPanOnFocus) {
            off(this._icon, "focus", this._panOnFocus, this);
          }
          remove(this._icon);
          this.removeInteractiveTarget(this._icon);
          this._icon = null;
        },
        _removeShadow: function() {
          if (this._shadow) {
            remove(this._shadow);
          }
          this._shadow = null;
        },
        _setPos: function(pos) {
          if (this._icon) {
            setPosition(this._icon, pos);
          }
          if (this._shadow) {
            setPosition(this._shadow, pos);
          }
          this._zIndex = pos.y + this.options.zIndexOffset;
          this._resetZIndex();
        },
        _updateZIndex: function(offset) {
          if (this._icon) {
            this._icon.style.zIndex = this._zIndex + offset;
          }
        },
        _animateZoom: function(opt) {
          var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();
          this._setPos(pos);
        },
        _initInteraction: function() {
          if (!this.options.interactive) {
            return;
          }
          addClass(this._icon, "leaflet-interactive");
          this.addInteractiveTarget(this._icon);
          if (MarkerDrag) {
            var draggable = this.options.draggable;
            if (this.dragging) {
              draggable = this.dragging.enabled();
              this.dragging.disable();
            }
            this.dragging = new MarkerDrag(this);
            if (draggable) {
              this.dragging.enable();
            }
          }
        },
        // @method setOpacity(opacity: Number): this
        // Changes the opacity of the marker.
        setOpacity: function(opacity) {
          this.options.opacity = opacity;
          if (this._map) {
            this._updateOpacity();
          }
          return this;
        },
        _updateOpacity: function() {
          var opacity = this.options.opacity;
          if (this._icon) {
            setOpacity(this._icon, opacity);
          }
          if (this._shadow) {
            setOpacity(this._shadow, opacity);
          }
        },
        _bringToFront: function() {
          this._updateZIndex(this.options.riseOffset);
        },
        _resetZIndex: function() {
          this._updateZIndex(0);
        },
        _panOnFocus: function() {
          var map = this._map;
          if (!map) {
            return;
          }
          var iconOpts = this.options.icon.options;
          var size = iconOpts.iconSize ? toPoint(iconOpts.iconSize) : toPoint(0, 0);
          var anchor = iconOpts.iconAnchor ? toPoint(iconOpts.iconAnchor) : toPoint(0, 0);
          map.panInside(this._latlng, {
            paddingTopLeft: anchor,
            paddingBottomRight: size.subtract(anchor)
          });
        },
        _getPopupAnchor: function() {
          return this.options.icon.options.popupAnchor;
        },
        _getTooltipAnchor: function() {
          return this.options.icon.options.tooltipAnchor;
        }
      });
      function marker(latlng, options) {
        return new Marker(latlng, options);
      }
      var Path = Layer.extend({
        // @section
        // @aka Path options
        options: {
          // @option stroke: Boolean = true
          // Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
          stroke: true,
          // @option color: String = '#3388ff'
          // Stroke color
          color: "#3388ff",
          // @option weight: Number = 3
          // Stroke width in pixels
          weight: 3,
          // @option opacity: Number = 1.0
          // Stroke opacity
          opacity: 1,
          // @option lineCap: String= 'round'
          // A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
          lineCap: "round",
          // @option lineJoin: String = 'round'
          // A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
          lineJoin: "round",
          // @option dashArray: String = null
          // A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
          dashArray: null,
          // @option dashOffset: String = null
          // A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
          dashOffset: null,
          // @option fill: Boolean = depends
          // Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
          fill: false,
          // @option fillColor: String = *
          // Fill color. Defaults to the value of the [`color`](#path-color) option
          fillColor: null,
          // @option fillOpacity: Number = 0.2
          // Fill opacity.
          fillOpacity: 0.2,
          // @option fillRule: String = 'evenodd'
          // A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
          fillRule: "evenodd",
          // className: '',
          // Option inherited from "Interactive layer" abstract class
          interactive: true,
          // @option bubblingMouseEvents: Boolean = true
          // When `true`, a mouse event on this path will trigger the same event on the map
          // (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
          bubblingMouseEvents: true
        },
        beforeAdd: function(map) {
          this._renderer = map.getRenderer(this);
        },
        onAdd: function() {
          this._renderer._initPath(this);
          this._reset();
          this._renderer._addPath(this);
        },
        onRemove: function() {
          this._renderer._removePath(this);
        },
        // @method redraw(): this
        // Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
        redraw: function() {
          if (this._map) {
            this._renderer._updatePath(this);
          }
          return this;
        },
        // @method setStyle(style: Path options): this
        // Changes the appearance of a Path based on the options in the `Path options` object.
        setStyle: function(style2) {
          setOptions(this, style2);
          if (this._renderer) {
            this._renderer._updateStyle(this);
            if (this.options.stroke && style2 && Object.prototype.hasOwnProperty.call(style2, "weight")) {
              this._updateBounds();
            }
          }
          return this;
        },
        // @method bringToFront(): this
        // Brings the layer to the top of all path layers.
        bringToFront: function() {
          if (this._renderer) {
            this._renderer._bringToFront(this);
          }
          return this;
        },
        // @method bringToBack(): this
        // Brings the layer to the bottom of all path layers.
        bringToBack: function() {
          if (this._renderer) {
            this._renderer._bringToBack(this);
          }
          return this;
        },
        getElement: function() {
          return this._path;
        },
        _reset: function() {
          this._project();
          this._update();
        },
        _clickTolerance: function() {
          return (this.options.stroke ? this.options.weight / 2 : 0) + (this._renderer.options.tolerance || 0);
        }
      });
      var CircleMarker = Path.extend({
        // @section
        // @aka CircleMarker options
        options: {
          fill: true,
          // @option radius: Number = 10
          // Radius of the circle marker, in pixels
          radius: 10
        },
        initialize: function(latlng, options) {
          setOptions(this, options);
          this._latlng = toLatLng(latlng);
          this._radius = this.options.radius;
        },
        // @method setLatLng(latLng: LatLng): this
        // Sets the position of a circle marker to a new location.
        setLatLng: function(latlng) {
          var oldLatLng = this._latlng;
          this._latlng = toLatLng(latlng);
          this.redraw();
          return this.fire("move", { oldLatLng, latlng: this._latlng });
        },
        // @method getLatLng(): LatLng
        // Returns the current geographical position of the circle marker
        getLatLng: function() {
          return this._latlng;
        },
        // @method setRadius(radius: Number): this
        // Sets the radius of a circle marker. Units are in pixels.
        setRadius: function(radius) {
          this.options.radius = this._radius = radius;
          return this.redraw();
        },
        // @method getRadius(): Number
        // Returns the current radius of the circle
        getRadius: function() {
          return this._radius;
        },
        setStyle: function(options) {
          var radius = options && options.radius || this._radius;
          Path.prototype.setStyle.call(this, options);
          this.setRadius(radius);
          return this;
        },
        _project: function() {
          this._point = this._map.latLngToLayerPoint(this._latlng);
          this._updateBounds();
        },
        _updateBounds: function() {
          var r = this._radius, r2 = this._radiusY || r, w = this._clickTolerance(), p = [r + w, r2 + w];
          this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
        },
        _update: function() {
          if (this._map) {
            this._updatePath();
          }
        },
        _updatePath: function() {
          this._renderer._updateCircle(this);
        },
        _empty: function() {
          return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(p) {
          return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
        }
      });
      function circleMarker(latlng, options) {
        return new CircleMarker(latlng, options);
      }
      var Circle = CircleMarker.extend({
        initialize: function(latlng, options, legacyOptions) {
          if (typeof options === "number") {
            options = extend({}, legacyOptions, { radius: options });
          }
          setOptions(this, options);
          this._latlng = toLatLng(latlng);
          if (isNaN(this.options.radius)) {
            throw new Error("Circle radius cannot be NaN");
          }
          this._mRadius = this.options.radius;
        },
        // @method setRadius(radius: Number): this
        // Sets the radius of a circle. Units are in meters.
        setRadius: function(radius) {
          this._mRadius = radius;
          return this.redraw();
        },
        // @method getRadius(): Number
        // Returns the current radius of a circle. Units are in meters.
        getRadius: function() {
          return this._mRadius;
        },
        // @method getBounds(): LatLngBounds
        // Returns the `LatLngBounds` of the path.
        getBounds: function() {
          var half = [this._radius, this._radiusY || this._radius];
          return new LatLngBounds(
            this._map.layerPointToLatLng(this._point.subtract(half)),
            this._map.layerPointToLatLng(this._point.add(half))
          );
        },
        setStyle: Path.prototype.setStyle,
        _project: function() {
          var lng = this._latlng.lng, lat = this._latlng.lat, map = this._map, crs = map.options.crs;
          if (crs.distance === Earth.distance) {
            var d = Math.PI / 180, latR = this._mRadius / Earth.R / d, top = map.project([lat + latR, lng]), bottom = map.project([lat - latR, lng]), p = top.add(bottom).divideBy(2), lat2 = map.unproject(p).lat, lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) / (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;
            if (isNaN(lngR) || lngR === 0) {
              lngR = latR / Math.cos(Math.PI / 180 * lat);
            }
            this._point = p.subtract(map.getPixelOrigin());
            this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
            this._radiusY = p.y - top.y;
          } else {
            var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));
            this._point = map.latLngToLayerPoint(this._latlng);
            this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
          }
          this._updateBounds();
        }
      });
      function circle(latlng, options, legacyOptions) {
        return new Circle(latlng, options, legacyOptions);
      }
      var Polyline = Path.extend({
        // @section
        // @aka Polyline options
        options: {
          // @option smoothFactor: Number = 1.0
          // How much to simplify the polyline on each zoom level. More means
          // better performance and smoother look, and less means more accurate representation.
          smoothFactor: 1,
          // @option noClip: Boolean = false
          // Disable polyline clipping.
          noClip: false
        },
        initialize: function(latlngs, options) {
          setOptions(this, options);
          this._setLatLngs(latlngs);
        },
        // @method getLatLngs(): LatLng[]
        // Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
        getLatLngs: function() {
          return this._latlngs;
        },
        // @method setLatLngs(latlngs: LatLng[]): this
        // Replaces all the points in the polyline with the given array of geographical points.
        setLatLngs: function(latlngs) {
          this._setLatLngs(latlngs);
          return this.redraw();
        },
        // @method isEmpty(): Boolean
        // Returns `true` if the Polyline has no LatLngs.
        isEmpty: function() {
          return !this._latlngs.length;
        },
        // @method closestLayerPoint(p: Point): Point
        // Returns the point closest to `p` on the Polyline.
        closestLayerPoint: function(p) {
          var minDistance = Infinity, minPoint = null, closest = _sqClosestPointOnSegment, p1, p2;
          for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
            var points = this._parts[j];
            for (var i = 1, len = points.length; i < len; i++) {
              p1 = points[i - 1];
              p2 = points[i];
              var sqDist = closest(p, p1, p2, true);
              if (sqDist < minDistance) {
                minDistance = sqDist;
                minPoint = closest(p, p1, p2);
              }
            }
          }
          if (minPoint) {
            minPoint.distance = Math.sqrt(minDistance);
          }
          return minPoint;
        },
        // @method getCenter(): LatLng
        // Returns the center ([centroid](https://en.wikipedia.org/wiki/Centroid)) of the polyline.
        getCenter: function() {
          if (!this._map) {
            throw new Error("Must add layer to map before using getCenter()");
          }
          return polylineCenter(this._defaultShape(), this._map.options.crs);
        },
        // @method getBounds(): LatLngBounds
        // Returns the `LatLngBounds` of the path.
        getBounds: function() {
          return this._bounds;
        },
        // @method addLatLng(latlng: LatLng, latlngs?: LatLng[]): this
        // Adds a given point to the polyline. By default, adds to the first ring of
        // the polyline in case of a multi-polyline, but can be overridden by passing
        // a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
        addLatLng: function(latlng, latlngs) {
          latlngs = latlngs || this._defaultShape();
          latlng = toLatLng(latlng);
          latlngs.push(latlng);
          this._bounds.extend(latlng);
          return this.redraw();
        },
        _setLatLngs: function(latlngs) {
          this._bounds = new LatLngBounds();
          this._latlngs = this._convertLatLngs(latlngs);
        },
        _defaultShape: function() {
          return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
        },
        // recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
        _convertLatLngs: function(latlngs) {
          var result = [], flat = isFlat(latlngs);
          for (var i = 0, len = latlngs.length; i < len; i++) {
            if (flat) {
              result[i] = toLatLng(latlngs[i]);
              this._bounds.extend(result[i]);
            } else {
              result[i] = this._convertLatLngs(latlngs[i]);
            }
          }
          return result;
        },
        _project: function() {
          var pxBounds = new Bounds();
          this._rings = [];
          this._projectLatlngs(this._latlngs, this._rings, pxBounds);
          if (this._bounds.isValid() && pxBounds.isValid()) {
            this._rawPxBounds = pxBounds;
            this._updateBounds();
          }
        },
        _updateBounds: function() {
          var w = this._clickTolerance(), p = new Point(w, w);
          if (!this._rawPxBounds) {
            return;
          }
          this._pxBounds = new Bounds([
            this._rawPxBounds.min.subtract(p),
            this._rawPxBounds.max.add(p)
          ]);
        },
        // recursively turns latlngs into a set of rings with projected coordinates
        _projectLatlngs: function(latlngs, result, projectedBounds) {
          var flat = latlngs[0] instanceof LatLng, len = latlngs.length, i, ring;
          if (flat) {
            ring = [];
            for (i = 0; i < len; i++) {
              ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
              projectedBounds.extend(ring[i]);
            }
            result.push(ring);
          } else {
            for (i = 0; i < len; i++) {
              this._projectLatlngs(latlngs[i], result, projectedBounds);
            }
          }
        },
        // clip polyline by renderer bounds so that we have less to render for performance
        _clipPoints: function() {
          var bounds = this._renderer._bounds;
          this._parts = [];
          if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
            return;
          }
          if (this.options.noClip) {
            this._parts = this._rings;
            return;
          }
          var parts = this._parts, i, j, k, len, len2, segment, points;
          for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
            points = this._rings[i];
            for (j = 0, len2 = points.length; j < len2 - 1; j++) {
              segment = clipSegment(points[j], points[j + 1], bounds, j, true);
              if (!segment) {
                continue;
              }
              parts[k] = parts[k] || [];
              parts[k].push(segment[0]);
              if (segment[1] !== points[j + 1] || j === len2 - 2) {
                parts[k].push(segment[1]);
                k++;
              }
            }
          }
        },
        // simplify each clipped part of the polyline for performance
        _simplifyPoints: function() {
          var parts = this._parts, tolerance = this.options.smoothFactor;
          for (var i = 0, len = parts.length; i < len; i++) {
            parts[i] = simplify(parts[i], tolerance);
          }
        },
        _update: function() {
          if (!this._map) {
            return;
          }
          this._clipPoints();
          this._simplifyPoints();
          this._updatePath();
        },
        _updatePath: function() {
          this._renderer._updatePoly(this);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(p, closed) {
          var i, j, k, len, len2, part, w = this._clickTolerance();
          if (!this._pxBounds || !this._pxBounds.contains(p)) {
            return false;
          }
          for (i = 0, len = this._parts.length; i < len; i++) {
            part = this._parts[i];
            for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
              if (!closed && j === 0) {
                continue;
              }
              if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
                return true;
              }
            }
          }
          return false;
        }
      });
      function polyline(latlngs, options) {
        return new Polyline(latlngs, options);
      }
      Polyline._flat = _flat;
      var Polygon = Polyline.extend({
        options: {
          fill: true
        },
        isEmpty: function() {
          return !this._latlngs.length || !this._latlngs[0].length;
        },
        // @method getCenter(): LatLng
        // Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the Polygon.
        getCenter: function() {
          if (!this._map) {
            throw new Error("Must add layer to map before using getCenter()");
          }
          return polygonCenter(this._defaultShape(), this._map.options.crs);
        },
        _convertLatLngs: function(latlngs) {
          var result = Polyline.prototype._convertLatLngs.call(this, latlngs), len = result.length;
          if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
            result.pop();
          }
          return result;
        },
        _setLatLngs: function(latlngs) {
          Polyline.prototype._setLatLngs.call(this, latlngs);
          if (isFlat(this._latlngs)) {
            this._latlngs = [this._latlngs];
          }
        },
        _defaultShape: function() {
          return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
        },
        _clipPoints: function() {
          var bounds = this._renderer._bounds, w = this.options.weight, p = new Point(w, w);
          bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));
          this._parts = [];
          if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
            return;
          }
          if (this.options.noClip) {
            this._parts = this._rings;
            return;
          }
          for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
            clipped = clipPolygon(this._rings[i], bounds, true);
            if (clipped.length) {
              this._parts.push(clipped);
            }
          }
        },
        _updatePath: function() {
          this._renderer._updatePoly(this, true);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(p) {
          var inside = false, part, p1, p2, i, j, k, len, len2;
          if (!this._pxBounds || !this._pxBounds.contains(p)) {
            return false;
          }
          for (i = 0, len = this._parts.length; i < len; i++) {
            part = this._parts[i];
            for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
              p1 = part[j];
              p2 = part[k];
              if (p1.y > p.y !== p2.y > p.y && p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x) {
                inside = !inside;
              }
            }
          }
          return inside || Polyline.prototype._containsPoint.call(this, p, true);
        }
      });
      function polygon(latlngs, options) {
        return new Polygon(latlngs, options);
      }
      var GeoJSON = FeatureGroup.extend({
        /* @section
         * @aka GeoJSON options
         *
         * @option pointToLayer: Function = *
         * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
         * called when data is added, passing the GeoJSON point feature and its `LatLng`.
         * The default is to spawn a default `Marker`:
         * ```js
         * function(geoJsonPoint, latlng) {
         * 	return L.marker(latlng);
         * }
         * ```
         *
         * @option style: Function = *
         * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
         * called internally when data is added.
         * The default value is to not override any defaults:
         * ```js
         * function (geoJsonFeature) {
         * 	return {}
         * }
         * ```
         *
         * @option onEachFeature: Function = *
         * A `Function` that will be called once for each created `Feature`, after it has
         * been created and styled. Useful for attaching events and popups to features.
         * The default is to do nothing with the newly created layers:
         * ```js
         * function (feature, layer) {}
         * ```
         *
         * @option filter: Function = *
         * A `Function` that will be used to decide whether to include a feature or not.
         * The default is to include all features:
         * ```js
         * function (geoJsonFeature) {
         * 	return true;
         * }
         * ```
         * Note: dynamically changing the `filter` option will have effect only on newly
         * added data. It will _not_ re-evaluate already included features.
         *
         * @option coordsToLatLng: Function = *
         * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
         * The default is the `coordsToLatLng` static method.
         *
         * @option markersInheritOptions: Boolean = false
         * Whether default Markers for "Point" type Features inherit from group options.
         */
        initialize: function(geojson, options) {
          setOptions(this, options);
          this._layers = {};
          if (geojson) {
            this.addData(geojson);
          }
        },
        // @method addData( <GeoJSON> data ): this
        // Adds a GeoJSON object to the layer.
        addData: function(geojson) {
          var features = isArray(geojson) ? geojson : geojson.features, i, len, feature;
          if (features) {
            for (i = 0, len = features.length; i < len; i++) {
              feature = features[i];
              if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
                this.addData(feature);
              }
            }
            return this;
          }
          var options = this.options;
          if (options.filter && !options.filter(geojson)) {
            return this;
          }
          var layer = geometryToLayer(geojson, options);
          if (!layer) {
            return this;
          }
          layer.feature = asFeature(geojson);
          layer.defaultOptions = layer.options;
          this.resetStyle(layer);
          if (options.onEachFeature) {
            options.onEachFeature(geojson, layer);
          }
          return this.addLayer(layer);
        },
        // @method resetStyle( <Path> layer? ): this
        // Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
        // If `layer` is omitted, the style of all features in the current layer is reset.
        resetStyle: function(layer) {
          if (layer === void 0) {
            return this.eachLayer(this.resetStyle, this);
          }
          layer.options = extend({}, layer.defaultOptions);
          this._setLayerStyle(layer, this.options.style);
          return this;
        },
        // @method setStyle( <Function> style ): this
        // Changes styles of GeoJSON vector layers with the given style function.
        setStyle: function(style2) {
          return this.eachLayer(function(layer) {
            this._setLayerStyle(layer, style2);
          }, this);
        },
        _setLayerStyle: function(layer, style2) {
          if (layer.setStyle) {
            if (typeof style2 === "function") {
              style2 = style2(layer.feature);
            }
            layer.setStyle(style2);
          }
        }
      });
      function geometryToLayer(geojson, options) {
        var geometry = geojson.type === "Feature" ? geojson.geometry : geojson, coords = geometry ? geometry.coordinates : null, layers2 = [], pointToLayer = options && options.pointToLayer, _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng, latlng, latlngs, i, len;
        if (!coords && !geometry) {
          return null;
        }
        switch (geometry.type) {
          case "Point":
            latlng = _coordsToLatLng(coords);
            return _pointToLayer(pointToLayer, geojson, latlng, options);
          case "MultiPoint":
            for (i = 0, len = coords.length; i < len; i++) {
              latlng = _coordsToLatLng(coords[i]);
              layers2.push(_pointToLayer(pointToLayer, geojson, latlng, options));
            }
            return new FeatureGroup(layers2);
          case "LineString":
          case "MultiLineString":
            latlngs = coordsToLatLngs(coords, geometry.type === "LineString" ? 0 : 1, _coordsToLatLng);
            return new Polyline(latlngs, options);
          case "Polygon":
          case "MultiPolygon":
            latlngs = coordsToLatLngs(coords, geometry.type === "Polygon" ? 1 : 2, _coordsToLatLng);
            return new Polygon(latlngs, options);
          case "GeometryCollection":
            for (i = 0, len = geometry.geometries.length; i < len; i++) {
              var geoLayer = geometryToLayer({
                geometry: geometry.geometries[i],
                type: "Feature",
                properties: geojson.properties
              }, options);
              if (geoLayer) {
                layers2.push(geoLayer);
              }
            }
            return new FeatureGroup(layers2);
          case "FeatureCollection":
            for (i = 0, len = geometry.features.length; i < len; i++) {
              var featureLayer = geometryToLayer(geometry.features[i], options);
              if (featureLayer) {
                layers2.push(featureLayer);
              }
            }
            return new FeatureGroup(layers2);
          default:
            throw new Error("Invalid GeoJSON object.");
        }
      }
      function _pointToLayer(pointToLayerFn, geojson, latlng, options) {
        return pointToLayerFn ? pointToLayerFn(geojson, latlng) : new Marker(latlng, options && options.markersInheritOptions && options);
      }
      function coordsToLatLng(coords) {
        return new LatLng(coords[1], coords[0], coords[2]);
      }
      function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
        var latlngs = [];
        for (var i = 0, len = coords.length, latlng; i < len; i++) {
          latlng = levelsDeep ? coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) : (_coordsToLatLng || coordsToLatLng)(coords[i]);
          latlngs.push(latlng);
        }
        return latlngs;
      }
      function latLngToCoords(latlng, precision) {
        latlng = toLatLng(latlng);
        return latlng.alt !== void 0 ? [formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] : [formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
      }
      function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
        var coords = [];
        for (var i = 0, len = latlngs.length; i < len; i++) {
          coords.push(levelsDeep ? latLngsToCoords(latlngs[i], isFlat(latlngs[i]) ? 0 : levelsDeep - 1, closed, precision) : latLngToCoords(latlngs[i], precision));
        }
        if (!levelsDeep && closed && coords.length > 0) {
          coords.push(coords[0].slice());
        }
        return coords;
      }
      function getFeature(layer, newGeometry) {
        return layer.feature ? extend({}, layer.feature, { geometry: newGeometry }) : asFeature(newGeometry);
      }
      function asFeature(geojson) {
        if (geojson.type === "Feature" || geojson.type === "FeatureCollection") {
          return geojson;
        }
        return {
          type: "Feature",
          properties: {},
          geometry: geojson
        };
      }
      var PointToGeoJSON = {
        toGeoJSON: function(precision) {
          return getFeature(this, {
            type: "Point",
            coordinates: latLngToCoords(this.getLatLng(), precision)
          });
        }
      };
      Marker.include(PointToGeoJSON);
      Circle.include(PointToGeoJSON);
      CircleMarker.include(PointToGeoJSON);
      Polyline.include({
        toGeoJSON: function(precision) {
          var multi = !isFlat(this._latlngs);
          var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);
          return getFeature(this, {
            type: (multi ? "Multi" : "") + "LineString",
            coordinates: coords
          });
        }
      });
      Polygon.include({
        toGeoJSON: function(precision) {
          var holes = !isFlat(this._latlngs), multi = holes && !isFlat(this._latlngs[0]);
          var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);
          if (!holes) {
            coords = [coords];
          }
          return getFeature(this, {
            type: (multi ? "Multi" : "") + "Polygon",
            coordinates: coords
          });
        }
      });
      LayerGroup.include({
        toMultiPoint: function(precision) {
          var coords = [];
          this.eachLayer(function(layer) {
            coords.push(layer.toGeoJSON(precision).geometry.coordinates);
          });
          return getFeature(this, {
            type: "MultiPoint",
            coordinates: coords
          });
        },
        // @method toGeoJSON(precision?: Number|false): Object
        // Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
        // Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
        toGeoJSON: function(precision) {
          var type = this.feature && this.feature.geometry && this.feature.geometry.type;
          if (type === "MultiPoint") {
            return this.toMultiPoint(precision);
          }
          var isGeometryCollection = type === "GeometryCollection", jsons = [];
          this.eachLayer(function(layer) {
            if (layer.toGeoJSON) {
              var json = layer.toGeoJSON(precision);
              if (isGeometryCollection) {
                jsons.push(json.geometry);
              } else {
                var feature = asFeature(json);
                if (feature.type === "FeatureCollection") {
                  jsons.push.apply(jsons, feature.features);
                } else {
                  jsons.push(feature);
                }
              }
            }
          });
          if (isGeometryCollection) {
            return getFeature(this, {
              geometries: jsons,
              type: "GeometryCollection"
            });
          }
          return {
            type: "FeatureCollection",
            features: jsons
          };
        }
      });
      function geoJSON(geojson, options) {
        return new GeoJSON(geojson, options);
      }
      var geoJson = geoJSON;
      var ImageOverlay = Layer.extend({
        // @section
        // @aka ImageOverlay options
        options: {
          // @option opacity: Number = 1.0
          // The opacity of the image overlay.
          opacity: 1,
          // @option alt: String = ''
          // Text for the `alt` attribute of the image (useful for accessibility).
          alt: "",
          // @option interactive: Boolean = false
          // If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
          interactive: false,
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the image.
          // If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: false,
          // @option errorOverlayUrl: String = ''
          // URL to the overlay image to show in place of the overlay that failed to load.
          errorOverlayUrl: "",
          // @option zIndex: Number = 1
          // The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
          zIndex: 1,
          // @option className: String = ''
          // A custom class name to assign to the image. Empty by default.
          className: ""
        },
        initialize: function(url, bounds, options) {
          this._url = url;
          this._bounds = toLatLngBounds(bounds);
          setOptions(this, options);
        },
        onAdd: function() {
          if (!this._image) {
            this._initImage();
            if (this.options.opacity < 1) {
              this._updateOpacity();
            }
          }
          if (this.options.interactive) {
            addClass(this._image, "leaflet-interactive");
            this.addInteractiveTarget(this._image);
          }
          this.getPane().appendChild(this._image);
          this._reset();
        },
        onRemove: function() {
          remove(this._image);
          if (this.options.interactive) {
            this.removeInteractiveTarget(this._image);
          }
        },
        // @method setOpacity(opacity: Number): this
        // Sets the opacity of the overlay.
        setOpacity: function(opacity) {
          this.options.opacity = opacity;
          if (this._image) {
            this._updateOpacity();
          }
          return this;
        },
        setStyle: function(styleOpts) {
          if (styleOpts.opacity) {
            this.setOpacity(styleOpts.opacity);
          }
          return this;
        },
        // @method bringToFront(): this
        // Brings the layer to the top of all overlays.
        bringToFront: function() {
          if (this._map) {
            toFront(this._image);
          }
          return this;
        },
        // @method bringToBack(): this
        // Brings the layer to the bottom of all overlays.
        bringToBack: function() {
          if (this._map) {
            toBack(this._image);
          }
          return this;
        },
        // @method setUrl(url: String): this
        // Changes the URL of the image.
        setUrl: function(url) {
          this._url = url;
          if (this._image) {
            this._image.src = url;
          }
          return this;
        },
        // @method setBounds(bounds: LatLngBounds): this
        // Update the bounds that this ImageOverlay covers
        setBounds: function(bounds) {
          this._bounds = toLatLngBounds(bounds);
          if (this._map) {
            this._reset();
          }
          return this;
        },
        getEvents: function() {
          var events = {
            zoom: this._reset,
            viewreset: this._reset
          };
          if (this._zoomAnimated) {
            events.zoomanim = this._animateZoom;
          }
          return events;
        },
        // @method setZIndex(value: Number): this
        // Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
        setZIndex: function(value) {
          this.options.zIndex = value;
          this._updateZIndex();
          return this;
        },
        // @method getBounds(): LatLngBounds
        // Get the bounds that this ImageOverlay covers
        getBounds: function() {
          return this._bounds;
        },
        // @method getElement(): HTMLElement
        // Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
        // used by this overlay.
        getElement: function() {
          return this._image;
        },
        _initImage: function() {
          var wasElementSupplied = this._url.tagName === "IMG";
          var img = this._image = wasElementSupplied ? this._url : create$1("img");
          addClass(img, "leaflet-image-layer");
          if (this._zoomAnimated) {
            addClass(img, "leaflet-zoom-animated");
          }
          if (this.options.className) {
            addClass(img, this.options.className);
          }
          img.onselectstart = falseFn;
          img.onmousemove = falseFn;
          img.onload = bind(this.fire, this, "load");
          img.onerror = bind(this._overlayOnError, this, "error");
          if (this.options.crossOrigin || this.options.crossOrigin === "") {
            img.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
          }
          if (this.options.zIndex) {
            this._updateZIndex();
          }
          if (wasElementSupplied) {
            this._url = img.src;
            return;
          }
          img.src = this._url;
          img.alt = this.options.alt;
        },
        _animateZoom: function(e) {
          var scale2 = this._map.getZoomScale(e.zoom), offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;
          setTransform(this._image, offset, scale2);
        },
        _reset: function() {
          var image = this._image, bounds = new Bounds(
            this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
            this._map.latLngToLayerPoint(this._bounds.getSouthEast())
          ), size = bounds.getSize();
          setPosition(image, bounds.min);
          image.style.width = size.x + "px";
          image.style.height = size.y + "px";
        },
        _updateOpacity: function() {
          setOpacity(this._image, this.options.opacity);
        },
        _updateZIndex: function() {
          if (this._image && this.options.zIndex !== void 0 && this.options.zIndex !== null) {
            this._image.style.zIndex = this.options.zIndex;
          }
        },
        _overlayOnError: function() {
          this.fire("error");
          var errorUrl = this.options.errorOverlayUrl;
          if (errorUrl && this._url !== errorUrl) {
            this._url = errorUrl;
            this._image.src = errorUrl;
          }
        },
        // @method getCenter(): LatLng
        // Returns the center of the ImageOverlay.
        getCenter: function() {
          return this._bounds.getCenter();
        }
      });
      var imageOverlay = function(url, bounds, options) {
        return new ImageOverlay(url, bounds, options);
      };
      var VideoOverlay = ImageOverlay.extend({
        // @section
        // @aka VideoOverlay options
        options: {
          // @option autoplay: Boolean = true
          // Whether the video starts playing automatically when loaded.
          // On some browsers autoplay will only work with `muted: true`
          autoplay: true,
          // @option loop: Boolean = true
          // Whether the video will loop back to the beginning when played.
          loop: true,
          // @option keepAspectRatio: Boolean = true
          // Whether the video will save aspect ratio after the projection.
          // Relevant for supported browsers. See [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
          keepAspectRatio: true,
          // @option muted: Boolean = false
          // Whether the video starts on mute when loaded.
          muted: false,
          // @option playsInline: Boolean = true
          // Mobile browsers will play the video right where it is instead of open it up in fullscreen mode.
          playsInline: true
        },
        _initImage: function() {
          var wasElementSupplied = this._url.tagName === "VIDEO";
          var vid = this._image = wasElementSupplied ? this._url : create$1("video");
          addClass(vid, "leaflet-image-layer");
          if (this._zoomAnimated) {
            addClass(vid, "leaflet-zoom-animated");
          }
          if (this.options.className) {
            addClass(vid, this.options.className);
          }
          vid.onselectstart = falseFn;
          vid.onmousemove = falseFn;
          vid.onloadeddata = bind(this.fire, this, "load");
          if (wasElementSupplied) {
            var sourceElements = vid.getElementsByTagName("source");
            var sources = [];
            for (var j = 0; j < sourceElements.length; j++) {
              sources.push(sourceElements[j].src);
            }
            this._url = sourceElements.length > 0 ? sources : [vid.src];
            return;
          }
          if (!isArray(this._url)) {
            this._url = [this._url];
          }
          if (!this.options.keepAspectRatio && Object.prototype.hasOwnProperty.call(vid.style, "objectFit")) {
            vid.style["objectFit"] = "fill";
          }
          vid.autoplay = !!this.options.autoplay;
          vid.loop = !!this.options.loop;
          vid.muted = !!this.options.muted;
          vid.playsInline = !!this.options.playsInline;
          for (var i = 0; i < this._url.length; i++) {
            var source = create$1("source");
            source.src = this._url[i];
            vid.appendChild(source);
          }
        }
        // @method getElement(): HTMLVideoElement
        // Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
        // used by this overlay.
      });
      function videoOverlay(video, bounds, options) {
        return new VideoOverlay(video, bounds, options);
      }
      var SVGOverlay = ImageOverlay.extend({
        _initImage: function() {
          var el = this._image = this._url;
          addClass(el, "leaflet-image-layer");
          if (this._zoomAnimated) {
            addClass(el, "leaflet-zoom-animated");
          }
          if (this.options.className) {
            addClass(el, this.options.className);
          }
          el.onselectstart = falseFn;
          el.onmousemove = falseFn;
        }
        // @method getElement(): SVGElement
        // Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
        // used by this overlay.
      });
      function svgOverlay(el, bounds, options) {
        return new SVGOverlay(el, bounds, options);
      }
      var DivOverlay = Layer.extend({
        // @section
        // @aka DivOverlay options
        options: {
          // @option interactive: Boolean = false
          // If true, the popup/tooltip will listen to the mouse events.
          interactive: false,
          // @option offset: Point = Point(0, 0)
          // The offset of the overlay position.
          offset: [0, 0],
          // @option className: String = ''
          // A custom CSS class name to assign to the overlay.
          className: "",
          // @option pane: String = undefined
          // `Map pane` where the overlay will be added.
          pane: void 0,
          // @option content: String|HTMLElement|Function = ''
          // Sets the HTML content of the overlay while initializing. If a function is passed the source layer will be
          // passed to the function. The function should return a `String` or `HTMLElement` to be used in the overlay.
          content: ""
        },
        initialize: function(options, source) {
          if (options && (options instanceof LatLng || isArray(options))) {
            this._latlng = toLatLng(options);
            setOptions(this, source);
          } else {
            setOptions(this, options);
            this._source = source;
          }
          if (this.options.content) {
            this._content = this.options.content;
          }
        },
        // @method openOn(map: Map): this
        // Adds the overlay to the map.
        // Alternative to `map.openPopup(popup)`/`.openTooltip(tooltip)`.
        openOn: function(map) {
          map = arguments.length ? map : this._source._map;
          if (!map.hasLayer(this)) {
            map.addLayer(this);
          }
          return this;
        },
        // @method close(): this
        // Closes the overlay.
        // Alternative to `map.closePopup(popup)`/`.closeTooltip(tooltip)`
        // and `layer.closePopup()`/`.closeTooltip()`.
        close: function() {
          if (this._map) {
            this._map.removeLayer(this);
          }
          return this;
        },
        // @method toggle(layer?: Layer): this
        // Opens or closes the overlay bound to layer depending on its current state.
        // Argument may be omitted only for overlay bound to layer.
        // Alternative to `layer.togglePopup()`/`.toggleTooltip()`.
        toggle: function(layer) {
          if (this._map) {
            this.close();
          } else {
            if (arguments.length) {
              this._source = layer;
            } else {
              layer = this._source;
            }
            this._prepareOpen();
            this.openOn(layer._map);
          }
          return this;
        },
        onAdd: function(map) {
          this._zoomAnimated = map._zoomAnimated;
          if (!this._container) {
            this._initLayout();
          }
          if (map._fadeAnimated) {
            setOpacity(this._container, 0);
          }
          clearTimeout(this._removeTimeout);
          this.getPane().appendChild(this._container);
          this.update();
          if (map._fadeAnimated) {
            setOpacity(this._container, 1);
          }
          this.bringToFront();
          if (this.options.interactive) {
            addClass(this._container, "leaflet-interactive");
            this.addInteractiveTarget(this._container);
          }
        },
        onRemove: function(map) {
          if (map._fadeAnimated) {
            setOpacity(this._container, 0);
            this._removeTimeout = setTimeout(bind(remove, void 0, this._container), 200);
          } else {
            remove(this._container);
          }
          if (this.options.interactive) {
            removeClass(this._container, "leaflet-interactive");
            this.removeInteractiveTarget(this._container);
          }
        },
        // @namespace DivOverlay
        // @method getLatLng: LatLng
        // Returns the geographical point of the overlay.
        getLatLng: function() {
          return this._latlng;
        },
        // @method setLatLng(latlng: LatLng): this
        // Sets the geographical point where the overlay will open.
        setLatLng: function(latlng) {
          this._latlng = toLatLng(latlng);
          if (this._map) {
            this._updatePosition();
            this._adjustPan();
          }
          return this;
        },
        // @method getContent: String|HTMLElement
        // Returns the content of the overlay.
        getContent: function() {
          return this._content;
        },
        // @method setContent(htmlContent: String|HTMLElement|Function): this
        // Sets the HTML content of the overlay. If a function is passed the source layer will be passed to the function.
        // The function should return a `String` or `HTMLElement` to be used in the overlay.
        setContent: function(content) {
          this._content = content;
          this.update();
          return this;
        },
        // @method getElement: String|HTMLElement
        // Returns the HTML container of the overlay.
        getElement: function() {
          return this._container;
        },
        // @method update: null
        // Updates the overlay content, layout and position. Useful for updating the overlay after something inside changed, e.g. image loaded.
        update: function() {
          if (!this._map) {
            return;
          }
          this._container.style.visibility = "hidden";
          this._updateContent();
          this._updateLayout();
          this._updatePosition();
          this._container.style.visibility = "";
          this._adjustPan();
        },
        getEvents: function() {
          var events = {
            zoom: this._updatePosition,
            viewreset: this._updatePosition
          };
          if (this._zoomAnimated) {
            events.zoomanim = this._animateZoom;
          }
          return events;
        },
        // @method isOpen: Boolean
        // Returns `true` when the overlay is visible on the map.
        isOpen: function() {
          return !!this._map && this._map.hasLayer(this);
        },
        // @method bringToFront: this
        // Brings this overlay in front of other overlays (in the same map pane).
        bringToFront: function() {
          if (this._map) {
            toFront(this._container);
          }
          return this;
        },
        // @method bringToBack: this
        // Brings this overlay to the back of other overlays (in the same map pane).
        bringToBack: function() {
          if (this._map) {
            toBack(this._container);
          }
          return this;
        },
        // prepare bound overlay to open: update latlng pos / content source (for FeatureGroup)
        _prepareOpen: function(latlng) {
          var source = this._source;
          if (!source._map) {
            return false;
          }
          if (source instanceof FeatureGroup) {
            source = null;
            var layers2 = this._source._layers;
            for (var id in layers2) {
              if (layers2[id]._map) {
                source = layers2[id];
                break;
              }
            }
            if (!source) {
              return false;
            }
            this._source = source;
          }
          if (!latlng) {
            if (source.getCenter) {
              latlng = source.getCenter();
            } else if (source.getLatLng) {
              latlng = source.getLatLng();
            } else if (source.getBounds) {
              latlng = source.getBounds().getCenter();
            } else {
              throw new Error("Unable to get source layer LatLng.");
            }
          }
          this.setLatLng(latlng);
          if (this._map) {
            this.update();
          }
          return true;
        },
        _updateContent: function() {
          if (!this._content) {
            return;
          }
          var node = this._contentNode;
          var content = typeof this._content === "function" ? this._content(this._source || this) : this._content;
          if (typeof content === "string") {
            node.innerHTML = content;
          } else {
            while (node.hasChildNodes()) {
              node.removeChild(node.firstChild);
            }
            node.appendChild(content);
          }
          this.fire("contentupdate");
        },
        _updatePosition: function() {
          if (!this._map) {
            return;
          }
          var pos = this._map.latLngToLayerPoint(this._latlng), offset = toPoint(this.options.offset), anchor = this._getAnchor();
          if (this._zoomAnimated) {
            setPosition(this._container, pos.add(anchor));
          } else {
            offset = offset.add(pos).add(anchor);
          }
          var bottom = this._containerBottom = -offset.y, left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;
          this._container.style.bottom = bottom + "px";
          this._container.style.left = left + "px";
        },
        _getAnchor: function() {
          return [0, 0];
        }
      });
      Map2.include({
        _initOverlay: function(OverlayClass, content, latlng, options) {
          var overlay = content;
          if (!(overlay instanceof OverlayClass)) {
            overlay = new OverlayClass(options).setContent(content);
          }
          if (latlng) {
            overlay.setLatLng(latlng);
          }
          return overlay;
        }
      });
      Layer.include({
        _initOverlay: function(OverlayClass, old, content, options) {
          var overlay = content;
          if (overlay instanceof OverlayClass) {
            setOptions(overlay, options);
            overlay._source = this;
          } else {
            overlay = old && !options ? old : new OverlayClass(options, this);
            overlay.setContent(content);
          }
          return overlay;
        }
      });
      var Popup = DivOverlay.extend({
        // @section
        // @aka Popup options
        options: {
          // @option pane: String = 'popupPane'
          // `Map pane` where the popup will be added.
          pane: "popupPane",
          // @option offset: Point = Point(0, 7)
          // The offset of the popup position.
          offset: [0, 7],
          // @option maxWidth: Number = 300
          // Max width of the popup, in pixels.
          maxWidth: 300,
          // @option minWidth: Number = 50
          // Min width of the popup, in pixels.
          minWidth: 50,
          // @option maxHeight: Number = null
          // If set, creates a scrollable container of the given height
          // inside a popup if its content exceeds it.
          // The scrollable container can be styled using the
          // `leaflet-popup-scrolled` CSS class selector.
          maxHeight: null,
          // @option autoPan: Boolean = true
          // Set it to `false` if you don't want the map to do panning animation
          // to fit the opened popup.
          autoPan: true,
          // @option autoPanPaddingTopLeft: Point = null
          // The margin between the popup and the top left corner of the map
          // view after autopanning was performed.
          autoPanPaddingTopLeft: null,
          // @option autoPanPaddingBottomRight: Point = null
          // The margin between the popup and the bottom right corner of the map
          // view after autopanning was performed.
          autoPanPaddingBottomRight: null,
          // @option autoPanPadding: Point = Point(5, 5)
          // Equivalent of setting both top left and bottom right autopan padding to the same value.
          autoPanPadding: [5, 5],
          // @option keepInView: Boolean = false
          // Set it to `true` if you want to prevent users from panning the popup
          // off of the screen while it is open.
          keepInView: false,
          // @option closeButton: Boolean = true
          // Controls the presence of a close button in the popup.
          closeButton: true,
          // @option autoClose: Boolean = true
          // Set it to `false` if you want to override the default behavior of
          // the popup closing when another popup is opened.
          autoClose: true,
          // @option closeOnEscapeKey: Boolean = true
          // Set it to `false` if you want to override the default behavior of
          // the ESC key for closing of the popup.
          closeOnEscapeKey: true,
          // @option closeOnClick: Boolean = *
          // Set it if you want to override the default behavior of the popup closing when user clicks
          // on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.
          // @option className: String = ''
          // A custom CSS class name to assign to the popup.
          className: ""
        },
        // @namespace Popup
        // @method openOn(map: Map): this
        // Alternative to `map.openPopup(popup)`.
        // Adds the popup to the map and closes the previous one.
        openOn: function(map) {
          map = arguments.length ? map : this._source._map;
          if (!map.hasLayer(this) && map._popup && map._popup.options.autoClose) {
            map.removeLayer(map._popup);
          }
          map._popup = this;
          return DivOverlay.prototype.openOn.call(this, map);
        },
        onAdd: function(map) {
          DivOverlay.prototype.onAdd.call(this, map);
          map.fire("popupopen", { popup: this });
          if (this._source) {
            this._source.fire("popupopen", { popup: this }, true);
            if (!(this._source instanceof Path)) {
              this._source.on("preclick", stopPropagation);
            }
          }
        },
        onRemove: function(map) {
          DivOverlay.prototype.onRemove.call(this, map);
          map.fire("popupclose", { popup: this });
          if (this._source) {
            this._source.fire("popupclose", { popup: this }, true);
            if (!(this._source instanceof Path)) {
              this._source.off("preclick", stopPropagation);
            }
          }
        },
        getEvents: function() {
          var events = DivOverlay.prototype.getEvents.call(this);
          if (this.options.closeOnClick !== void 0 ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
            events.preclick = this.close;
          }
          if (this.options.keepInView) {
            events.moveend = this._adjustPan;
          }
          return events;
        },
        _initLayout: function() {
          var prefix = "leaflet-popup", container = this._container = create$1(
            "div",
            prefix + " " + (this.options.className || "") + " leaflet-zoom-animated"
          );
          var wrapper = this._wrapper = create$1("div", prefix + "-content-wrapper", container);
          this._contentNode = create$1("div", prefix + "-content", wrapper);
          disableClickPropagation(container);
          disableScrollPropagation(this._contentNode);
          on(container, "contextmenu", stopPropagation);
          this._tipContainer = create$1("div", prefix + "-tip-container", container);
          this._tip = create$1("div", prefix + "-tip", this._tipContainer);
          if (this.options.closeButton) {
            var closeButton = this._closeButton = create$1("a", prefix + "-close-button", container);
            closeButton.setAttribute("role", "button");
            closeButton.setAttribute("aria-label", "Close popup");
            closeButton.href = "#close";
            closeButton.innerHTML = '<span aria-hidden="true">&#215;</span>';
            on(closeButton, "click", function(ev) {
              preventDefault(ev);
              this.close();
            }, this);
          }
        },
        _updateLayout: function() {
          var container = this._contentNode, style2 = container.style;
          style2.width = "";
          style2.whiteSpace = "nowrap";
          var width = container.offsetWidth;
          width = Math.min(width, this.options.maxWidth);
          width = Math.max(width, this.options.minWidth);
          style2.width = width + 1 + "px";
          style2.whiteSpace = "";
          style2.height = "";
          var height = container.offsetHeight, maxHeight = this.options.maxHeight, scrolledClass = "leaflet-popup-scrolled";
          if (maxHeight && height > maxHeight) {
            style2.height = maxHeight + "px";
            addClass(container, scrolledClass);
          } else {
            removeClass(container, scrolledClass);
          }
          this._containerWidth = this._container.offsetWidth;
        },
        _animateZoom: function(e) {
          var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center), anchor = this._getAnchor();
          setPosition(this._container, pos.add(anchor));
        },
        _adjustPan: function() {
          if (!this.options.autoPan) {
            return;
          }
          if (this._map._panAnim) {
            this._map._panAnim.stop();
          }
          if (this._autopanning) {
            this._autopanning = false;
            return;
          }
          var map = this._map, marginBottom = parseInt(getStyle(this._container, "marginBottom"), 10) || 0, containerHeight = this._container.offsetHeight + marginBottom, containerWidth = this._containerWidth, layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);
          layerPos._add(getPosition(this._container));
          var containerPos = map.layerPointToContainerPoint(layerPos), padding = toPoint(this.options.autoPanPadding), paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding), paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding), size = map.getSize(), dx = 0, dy = 0;
          if (containerPos.x + containerWidth + paddingBR.x > size.x) {
            dx = containerPos.x + containerWidth - size.x + paddingBR.x;
          }
          if (containerPos.x - dx - paddingTL.x < 0) {
            dx = containerPos.x - paddingTL.x;
          }
          if (containerPos.y + containerHeight + paddingBR.y > size.y) {
            dy = containerPos.y + containerHeight - size.y + paddingBR.y;
          }
          if (containerPos.y - dy - paddingTL.y < 0) {
            dy = containerPos.y - paddingTL.y;
          }
          if (dx || dy) {
            if (this.options.keepInView) {
              this._autopanning = true;
            }
            map.fire("autopanstart").panBy([dx, dy]);
          }
        },
        _getAnchor: function() {
          return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
        }
      });
      var popup = function(options, source) {
        return new Popup(options, source);
      };
      Map2.mergeOptions({
        closePopupOnClick: true
      });
      Map2.include({
        // @method openPopup(popup: Popup): this
        // Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
        // @alternative
        // @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
        // Creates a popup with the specified content and options and opens it in the given point on a map.
        openPopup: function(popup2, latlng, options) {
          this._initOverlay(Popup, popup2, latlng, options).openOn(this);
          return this;
        },
        // @method closePopup(popup?: Popup): this
        // Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
        closePopup: function(popup2) {
          popup2 = arguments.length ? popup2 : this._popup;
          if (popup2) {
            popup2.close();
          }
          return this;
        }
      });
      Layer.include({
        // @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
        // Binds a popup to the layer with the passed `content` and sets up the
        // necessary event listeners. If a `Function` is passed it will receive
        // the layer as the first argument and should return a `String` or `HTMLElement`.
        bindPopup: function(content, options) {
          this._popup = this._initOverlay(Popup, this._popup, content, options);
          if (!this._popupHandlersAdded) {
            this.on({
              click: this._openPopup,
              keypress: this._onKeyPress,
              remove: this.closePopup,
              move: this._movePopup
            });
            this._popupHandlersAdded = true;
          }
          return this;
        },
        // @method unbindPopup(): this
        // Removes the popup previously bound with `bindPopup`.
        unbindPopup: function() {
          if (this._popup) {
            this.off({
              click: this._openPopup,
              keypress: this._onKeyPress,
              remove: this.closePopup,
              move: this._movePopup
            });
            this._popupHandlersAdded = false;
            this._popup = null;
          }
          return this;
        },
        // @method openPopup(latlng?: LatLng): this
        // Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
        openPopup: function(latlng) {
          if (this._popup) {
            if (!(this instanceof FeatureGroup)) {
              this._popup._source = this;
            }
            if (this._popup._prepareOpen(latlng || this._latlng)) {
              this._popup.openOn(this._map);
            }
          }
          return this;
        },
        // @method closePopup(): this
        // Closes the popup bound to this layer if it is open.
        closePopup: function() {
          if (this._popup) {
            this._popup.close();
          }
          return this;
        },
        // @method togglePopup(): this
        // Opens or closes the popup bound to this layer depending on its current state.
        togglePopup: function() {
          if (this._popup) {
            this._popup.toggle(this);
          }
          return this;
        },
        // @method isPopupOpen(): boolean
        // Returns `true` if the popup bound to this layer is currently open.
        isPopupOpen: function() {
          return this._popup ? this._popup.isOpen() : false;
        },
        // @method setPopupContent(content: String|HTMLElement|Popup): this
        // Sets the content of the popup bound to this layer.
        setPopupContent: function(content) {
          if (this._popup) {
            this._popup.setContent(content);
          }
          return this;
        },
        // @method getPopup(): Popup
        // Returns the popup bound to this layer.
        getPopup: function() {
          return this._popup;
        },
        _openPopup: function(e) {
          if (!this._popup || !this._map) {
            return;
          }
          stop(e);
          var target = e.layer || e.target;
          if (this._popup._source === target && !(target instanceof Path)) {
            if (this._map.hasLayer(this._popup)) {
              this.closePopup();
            } else {
              this.openPopup(e.latlng);
            }
            return;
          }
          this._popup._source = target;
          this.openPopup(e.latlng);
        },
        _movePopup: function(e) {
          this._popup.setLatLng(e.latlng);
        },
        _onKeyPress: function(e) {
          if (e.originalEvent.keyCode === 13) {
            this._openPopup(e);
          }
        }
      });
      var Tooltip = DivOverlay.extend({
        // @section
        // @aka Tooltip options
        options: {
          // @option pane: String = 'tooltipPane'
          // `Map pane` where the tooltip will be added.
          pane: "tooltipPane",
          // @option offset: Point = Point(0, 0)
          // Optional offset of the tooltip position.
          offset: [0, 0],
          // @option direction: String = 'auto'
          // Direction where to open the tooltip. Possible values are: `right`, `left`,
          // `top`, `bottom`, `center`, `auto`.
          // `auto` will dynamically switch between `right` and `left` according to the tooltip
          // position on the map.
          direction: "auto",
          // @option permanent: Boolean = false
          // Whether to open the tooltip permanently or only on mouseover.
          permanent: false,
          // @option sticky: Boolean = false
          // If true, the tooltip will follow the mouse instead of being fixed at the feature center.
          sticky: false,
          // @option opacity: Number = 0.9
          // Tooltip container opacity.
          opacity: 0.9
        },
        onAdd: function(map) {
          DivOverlay.prototype.onAdd.call(this, map);
          this.setOpacity(this.options.opacity);
          map.fire("tooltipopen", { tooltip: this });
          if (this._source) {
            this.addEventParent(this._source);
            this._source.fire("tooltipopen", { tooltip: this }, true);
          }
        },
        onRemove: function(map) {
          DivOverlay.prototype.onRemove.call(this, map);
          map.fire("tooltipclose", { tooltip: this });
          if (this._source) {
            this.removeEventParent(this._source);
            this._source.fire("tooltipclose", { tooltip: this }, true);
          }
        },
        getEvents: function() {
          var events = DivOverlay.prototype.getEvents.call(this);
          if (!this.options.permanent) {
            events.preclick = this.close;
          }
          return events;
        },
        _initLayout: function() {
          var prefix = "leaflet-tooltip", className = prefix + " " + (this.options.className || "") + " leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide");
          this._contentNode = this._container = create$1("div", className);
          this._container.setAttribute("role", "tooltip");
          this._container.setAttribute("id", "leaflet-tooltip-" + stamp(this));
        },
        _updateLayout: function() {
        },
        _adjustPan: function() {
        },
        _setPosition: function(pos) {
          var subX, subY, map = this._map, container = this._container, centerPoint = map.latLngToContainerPoint(map.getCenter()), tooltipPoint = map.layerPointToContainerPoint(pos), direction = this.options.direction, tooltipWidth = container.offsetWidth, tooltipHeight = container.offsetHeight, offset = toPoint(this.options.offset), anchor = this._getAnchor();
          if (direction === "top") {
            subX = tooltipWidth / 2;
            subY = tooltipHeight;
          } else if (direction === "bottom") {
            subX = tooltipWidth / 2;
            subY = 0;
          } else if (direction === "center") {
            subX = tooltipWidth / 2;
            subY = tooltipHeight / 2;
          } else if (direction === "right") {
            subX = 0;
            subY = tooltipHeight / 2;
          } else if (direction === "left") {
            subX = tooltipWidth;
            subY = tooltipHeight / 2;
          } else if (tooltipPoint.x < centerPoint.x) {
            direction = "right";
            subX = 0;
            subY = tooltipHeight / 2;
          } else {
            direction = "left";
            subX = tooltipWidth + (offset.x + anchor.x) * 2;
            subY = tooltipHeight / 2;
          }
          pos = pos.subtract(toPoint(subX, subY, true)).add(offset).add(anchor);
          removeClass(container, "leaflet-tooltip-right");
          removeClass(container, "leaflet-tooltip-left");
          removeClass(container, "leaflet-tooltip-top");
          removeClass(container, "leaflet-tooltip-bottom");
          addClass(container, "leaflet-tooltip-" + direction);
          setPosition(container, pos);
        },
        _updatePosition: function() {
          var pos = this._map.latLngToLayerPoint(this._latlng);
          this._setPosition(pos);
        },
        setOpacity: function(opacity) {
          this.options.opacity = opacity;
          if (this._container) {
            setOpacity(this._container, opacity);
          }
        },
        _animateZoom: function(e) {
          var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
          this._setPosition(pos);
        },
        _getAnchor: function() {
          return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
        }
      });
      var tooltip = function(options, source) {
        return new Tooltip(options, source);
      };
      Map2.include({
        // @method openTooltip(tooltip: Tooltip): this
        // Opens the specified tooltip.
        // @alternative
        // @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
        // Creates a tooltip with the specified content and options and open it.
        openTooltip: function(tooltip2, latlng, options) {
          this._initOverlay(Tooltip, tooltip2, latlng, options).openOn(this);
          return this;
        },
        // @method closeTooltip(tooltip: Tooltip): this
        // Closes the tooltip given as parameter.
        closeTooltip: function(tooltip2) {
          tooltip2.close();
          return this;
        }
      });
      Layer.include({
        // @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
        // Binds a tooltip to the layer with the passed `content` and sets up the
        // necessary event listeners. If a `Function` is passed it will receive
        // the layer as the first argument and should return a `String` or `HTMLElement`.
        bindTooltip: function(content, options) {
          if (this._tooltip && this.isTooltipOpen()) {
            this.unbindTooltip();
          }
          this._tooltip = this._initOverlay(Tooltip, this._tooltip, content, options);
          this._initTooltipInteractions();
          if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
            this.openTooltip();
          }
          return this;
        },
        // @method unbindTooltip(): this
        // Removes the tooltip previously bound with `bindTooltip`.
        unbindTooltip: function() {
          if (this._tooltip) {
            this._initTooltipInteractions(true);
            this.closeTooltip();
            this._tooltip = null;
          }
          return this;
        },
        _initTooltipInteractions: function(remove2) {
          if (!remove2 && this._tooltipHandlersAdded) {
            return;
          }
          var onOff = remove2 ? "off" : "on", events = {
            remove: this.closeTooltip,
            move: this._moveTooltip
          };
          if (!this._tooltip.options.permanent) {
            events.mouseover = this._openTooltip;
            events.mouseout = this.closeTooltip;
            events.click = this._openTooltip;
            if (this._map) {
              this._addFocusListeners();
            } else {
              events.add = this._addFocusListeners;
            }
          } else {
            events.add = this._openTooltip;
          }
          if (this._tooltip.options.sticky) {
            events.mousemove = this._moveTooltip;
          }
          this[onOff](events);
          this._tooltipHandlersAdded = !remove2;
        },
        // @method openTooltip(latlng?: LatLng): this
        // Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
        openTooltip: function(latlng) {
          if (this._tooltip) {
            if (!(this instanceof FeatureGroup)) {
              this._tooltip._source = this;
            }
            if (this._tooltip._prepareOpen(latlng)) {
              this._tooltip.openOn(this._map);
              if (this.getElement) {
                this._setAriaDescribedByOnLayer(this);
              } else if (this.eachLayer) {
                this.eachLayer(this._setAriaDescribedByOnLayer, this);
              }
            }
          }
          return this;
        },
        // @method closeTooltip(): this
        // Closes the tooltip bound to this layer if it is open.
        closeTooltip: function() {
          if (this._tooltip) {
            return this._tooltip.close();
          }
        },
        // @method toggleTooltip(): this
        // Opens or closes the tooltip bound to this layer depending on its current state.
        toggleTooltip: function() {
          if (this._tooltip) {
            this._tooltip.toggle(this);
          }
          return this;
        },
        // @method isTooltipOpen(): boolean
        // Returns `true` if the tooltip bound to this layer is currently open.
        isTooltipOpen: function() {
          return this._tooltip.isOpen();
        },
        // @method setTooltipContent(content: String|HTMLElement|Tooltip): this
        // Sets the content of the tooltip bound to this layer.
        setTooltipContent: function(content) {
          if (this._tooltip) {
            this._tooltip.setContent(content);
          }
          return this;
        },
        // @method getTooltip(): Tooltip
        // Returns the tooltip bound to this layer.
        getTooltip: function() {
          return this._tooltip;
        },
        _addFocusListeners: function() {
          if (this.getElement) {
            this._addFocusListenersOnLayer(this);
          } else if (this.eachLayer) {
            this.eachLayer(this._addFocusListenersOnLayer, this);
          }
        },
        _addFocusListenersOnLayer: function(layer) {
          var el = typeof layer.getElement === "function" && layer.getElement();
          if (el) {
            on(el, "focus", function() {
              this._tooltip._source = layer;
              this.openTooltip();
            }, this);
            on(el, "blur", this.closeTooltip, this);
          }
        },
        _setAriaDescribedByOnLayer: function(layer) {
          var el = typeof layer.getElement === "function" && layer.getElement();
          if (el) {
            el.setAttribute("aria-describedby", this._tooltip._container.id);
          }
        },
        _openTooltip: function(e) {
          if (!this._tooltip || !this._map) {
            return;
          }
          if (this._map.dragging && this._map.dragging.moving() && !this._openOnceFlag) {
            this._openOnceFlag = true;
            var that = this;
            this._map.once("moveend", function() {
              that._openOnceFlag = false;
              that._openTooltip(e);
            });
            return;
          }
          this._tooltip._source = e.layer || e.target;
          this.openTooltip(this._tooltip.options.sticky ? e.latlng : void 0);
        },
        _moveTooltip: function(e) {
          var latlng = e.latlng, containerPoint, layerPoint;
          if (this._tooltip.options.sticky && e.originalEvent) {
            containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
            layerPoint = this._map.containerPointToLayerPoint(containerPoint);
            latlng = this._map.layerPointToLatLng(layerPoint);
          }
          this._tooltip.setLatLng(latlng);
        }
      });
      var DivIcon = Icon.extend({
        options: {
          // @section
          // @aka DivIcon options
          iconSize: [12, 12],
          // also can be set through CSS
          // iconAnchor: (Point),
          // popupAnchor: (Point),
          // @option html: String|HTMLElement = ''
          // Custom HTML code to put inside the div element, empty by default. Alternatively,
          // an instance of `HTMLElement`.
          html: false,
          // @option bgPos: Point = [0, 0]
          // Optional relative position of the background, in pixels
          bgPos: null,
          className: "leaflet-div-icon"
        },
        createIcon: function(oldIcon) {
          var div = oldIcon && oldIcon.tagName === "DIV" ? oldIcon : document.createElement("div"), options = this.options;
          if (options.html instanceof Element) {
            empty(div);
            div.appendChild(options.html);
          } else {
            div.innerHTML = options.html !== false ? options.html : "";
          }
          if (options.bgPos) {
            var bgPos = toPoint(options.bgPos);
            div.style.backgroundPosition = -bgPos.x + "px " + -bgPos.y + "px";
          }
          this._setIconStyles(div, "icon");
          return div;
        },
        createShadow: function() {
          return null;
        }
      });
      function divIcon(options) {
        return new DivIcon(options);
      }
      Icon.Default = IconDefault;
      var GridLayer = Layer.extend({
        // @section
        // @aka GridLayer options
        options: {
          // @option tileSize: Number|Point = 256
          // Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
          tileSize: 256,
          // @option opacity: Number = 1.0
          // Opacity of the tiles. Can be used in the `createTile()` function.
          opacity: 1,
          // @option updateWhenIdle: Boolean = (depends)
          // Load new tiles only when panning ends.
          // `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
          // `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
          // [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
          updateWhenIdle: Browser.mobile,
          // @option updateWhenZooming: Boolean = true
          // By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
          updateWhenZooming: true,
          // @option updateInterval: Number = 200
          // Tiles will not update more than once every `updateInterval` milliseconds when panning.
          updateInterval: 200,
          // @option zIndex: Number = 1
          // The explicit zIndex of the tile layer.
          zIndex: 1,
          // @option bounds: LatLngBounds = undefined
          // If set, tiles will only be loaded inside the set `LatLngBounds`.
          bounds: null,
          // @option minZoom: Number = 0
          // The minimum zoom level down to which this layer will be displayed (inclusive).
          minZoom: 0,
          // @option maxZoom: Number = undefined
          // The maximum zoom level up to which this layer will be displayed (inclusive).
          maxZoom: void 0,
          // @option maxNativeZoom: Number = undefined
          // Maximum zoom number the tile source has available. If it is specified,
          // the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
          // from `maxNativeZoom` level and auto-scaled.
          maxNativeZoom: void 0,
          // @option minNativeZoom: Number = undefined
          // Minimum zoom number the tile source has available. If it is specified,
          // the tiles on all zoom levels lower than `minNativeZoom` will be loaded
          // from `minNativeZoom` level and auto-scaled.
          minNativeZoom: void 0,
          // @option noWrap: Boolean = false
          // Whether the layer is wrapped around the antimeridian. If `true`, the
          // GridLayer will only be displayed once at low zoom levels. Has no
          // effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
          // in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
          // tiles outside the CRS limits.
          noWrap: false,
          // @option pane: String = 'tilePane'
          // `Map pane` where the grid layer will be added.
          pane: "tilePane",
          // @option className: String = ''
          // A custom class name to assign to the tile layer. Empty by default.
          className: "",
          // @option keepBuffer: Number = 2
          // When panning the map, keep this many rows and columns of tiles before unloading them.
          keepBuffer: 2
        },
        initialize: function(options) {
          setOptions(this, options);
        },
        onAdd: function() {
          this._initContainer();
          this._levels = {};
          this._tiles = {};
          this._resetView();
        },
        beforeAdd: function(map) {
          map._addZoomLimit(this);
        },
        onRemove: function(map) {
          this._removeAllTiles();
          remove(this._container);
          map._removeZoomLimit(this);
          this._container = null;
          this._tileZoom = void 0;
        },
        // @method bringToFront: this
        // Brings the tile layer to the top of all tile layers.
        bringToFront: function() {
          if (this._map) {
            toFront(this._container);
            this._setAutoZIndex(Math.max);
          }
          return this;
        },
        // @method bringToBack: this
        // Brings the tile layer to the bottom of all tile layers.
        bringToBack: function() {
          if (this._map) {
            toBack(this._container);
            this._setAutoZIndex(Math.min);
          }
          return this;
        },
        // @method getContainer: HTMLElement
        // Returns the HTML element that contains the tiles for this layer.
        getContainer: function() {
          return this._container;
        },
        // @method setOpacity(opacity: Number): this
        // Changes the [opacity](#gridlayer-opacity) of the grid layer.
        setOpacity: function(opacity) {
          this.options.opacity = opacity;
          this._updateOpacity();
          return this;
        },
        // @method setZIndex(zIndex: Number): this
        // Changes the [zIndex](#gridlayer-zindex) of the grid layer.
        setZIndex: function(zIndex) {
          this.options.zIndex = zIndex;
          this._updateZIndex();
          return this;
        },
        // @method isLoading: Boolean
        // Returns `true` if any tile in the grid layer has not finished loading.
        isLoading: function() {
          return this._loading;
        },
        // @method redraw: this
        // Causes the layer to clear all the tiles and request them again.
        redraw: function() {
          if (this._map) {
            this._removeAllTiles();
            var tileZoom = this._clampZoom(this._map.getZoom());
            if (tileZoom !== this._tileZoom) {
              this._tileZoom = tileZoom;
              this._updateLevels();
            }
            this._update();
          }
          return this;
        },
        getEvents: function() {
          var events = {
            viewprereset: this._invalidateAll,
            viewreset: this._resetView,
            zoom: this._resetView,
            moveend: this._onMoveEnd
          };
          if (!this.options.updateWhenIdle) {
            if (!this._onMove) {
              this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
            }
            events.move = this._onMove;
          }
          if (this._zoomAnimated) {
            events.zoomanim = this._animateZoom;
          }
          return events;
        },
        // @section Extension methods
        // Layers extending `GridLayer` shall reimplement the following method.
        // @method createTile(coords: Object, done?: Function): HTMLElement
        // Called only internally, must be overridden by classes extending `GridLayer`.
        // Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
        // is specified, it must be called when the tile has finished loading and drawing.
        createTile: function() {
          return document.createElement("div");
        },
        // @section
        // @method getTileSize: Point
        // Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
        getTileSize: function() {
          var s = this.options.tileSize;
          return s instanceof Point ? s : new Point(s, s);
        },
        _updateZIndex: function() {
          if (this._container && this.options.zIndex !== void 0 && this.options.zIndex !== null) {
            this._container.style.zIndex = this.options.zIndex;
          }
        },
        _setAutoZIndex: function(compare) {
          var layers2 = this.getPane().children, edgeZIndex = -compare(-Infinity, Infinity);
          for (var i = 0, len = layers2.length, zIndex; i < len; i++) {
            zIndex = layers2[i].style.zIndex;
            if (layers2[i] !== this._container && zIndex) {
              edgeZIndex = compare(edgeZIndex, +zIndex);
            }
          }
          if (isFinite(edgeZIndex)) {
            this.options.zIndex = edgeZIndex + compare(-1, 1);
            this._updateZIndex();
          }
        },
        _updateOpacity: function() {
          if (!this._map) {
            return;
          }
          if (Browser.ielt9) {
            return;
          }
          setOpacity(this._container, this.options.opacity);
          var now = +/* @__PURE__ */ new Date(), nextFrame = false, willPrune = false;
          for (var key in this._tiles) {
            var tile = this._tiles[key];
            if (!tile.current || !tile.loaded) {
              continue;
            }
            var fade = Math.min(1, (now - tile.loaded) / 200);
            setOpacity(tile.el, fade);
            if (fade < 1) {
              nextFrame = true;
            } else {
              if (tile.active) {
                willPrune = true;
              } else {
                this._onOpaqueTile(tile);
              }
              tile.active = true;
            }
          }
          if (willPrune && !this._noPrune) {
            this._pruneTiles();
          }
          if (nextFrame) {
            cancelAnimFrame(this._fadeFrame);
            this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
          }
        },
        _onOpaqueTile: falseFn,
        _initContainer: function() {
          if (this._container) {
            return;
          }
          this._container = create$1("div", "leaflet-layer " + (this.options.className || ""));
          this._updateZIndex();
          if (this.options.opacity < 1) {
            this._updateOpacity();
          }
          this.getPane().appendChild(this._container);
        },
        _updateLevels: function() {
          var zoom2 = this._tileZoom, maxZoom = this.options.maxZoom;
          if (zoom2 === void 0) {
            return void 0;
          }
          for (var z in this._levels) {
            z = Number(z);
            if (this._levels[z].el.children.length || z === zoom2) {
              this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom2 - z);
              this._onUpdateLevel(z);
            } else {
              remove(this._levels[z].el);
              this._removeTilesAtZoom(z);
              this._onRemoveLevel(z);
              delete this._levels[z];
            }
          }
          var level = this._levels[zoom2], map = this._map;
          if (!level) {
            level = this._levels[zoom2] = {};
            level.el = create$1("div", "leaflet-tile-container leaflet-zoom-animated", this._container);
            level.el.style.zIndex = maxZoom;
            level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom2).round();
            level.zoom = zoom2;
            this._setZoomTransform(level, map.getCenter(), map.getZoom());
            falseFn(level.el.offsetWidth);
            this._onCreateLevel(level);
          }
          this._level = level;
          return level;
        },
        _onUpdateLevel: falseFn,
        _onRemoveLevel: falseFn,
        _onCreateLevel: falseFn,
        _pruneTiles: function() {
          if (!this._map) {
            return;
          }
          var key, tile;
          var zoom2 = this._map.getZoom();
          if (zoom2 > this.options.maxZoom || zoom2 < this.options.minZoom) {
            this._removeAllTiles();
            return;
          }
          for (key in this._tiles) {
            tile = this._tiles[key];
            tile.retain = tile.current;
          }
          for (key in this._tiles) {
            tile = this._tiles[key];
            if (tile.current && !tile.active) {
              var coords = tile.coords;
              if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
                this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
              }
            }
          }
          for (key in this._tiles) {
            if (!this._tiles[key].retain) {
              this._removeTile(key);
            }
          }
        },
        _removeTilesAtZoom: function(zoom2) {
          for (var key in this._tiles) {
            if (this._tiles[key].coords.z !== zoom2) {
              continue;
            }
            this._removeTile(key);
          }
        },
        _removeAllTiles: function() {
          for (var key in this._tiles) {
            this._removeTile(key);
          }
        },
        _invalidateAll: function() {
          for (var z in this._levels) {
            remove(this._levels[z].el);
            this._onRemoveLevel(Number(z));
            delete this._levels[z];
          }
          this._removeAllTiles();
          this._tileZoom = void 0;
        },
        _retainParent: function(x, y, z, minZoom) {
          var x2 = Math.floor(x / 2), y2 = Math.floor(y / 2), z2 = z - 1, coords2 = new Point(+x2, +y2);
          coords2.z = +z2;
          var key = this._tileCoordsToKey(coords2), tile = this._tiles[key];
          if (tile && tile.active) {
            tile.retain = true;
            return true;
          } else if (tile && tile.loaded) {
            tile.retain = true;
          }
          if (z2 > minZoom) {
            return this._retainParent(x2, y2, z2, minZoom);
          }
          return false;
        },
        _retainChildren: function(x, y, z, maxZoom) {
          for (var i = 2 * x; i < 2 * x + 2; i++) {
            for (var j = 2 * y; j < 2 * y + 2; j++) {
              var coords = new Point(i, j);
              coords.z = z + 1;
              var key = this._tileCoordsToKey(coords), tile = this._tiles[key];
              if (tile && tile.active) {
                tile.retain = true;
                continue;
              } else if (tile && tile.loaded) {
                tile.retain = true;
              }
              if (z + 1 < maxZoom) {
                this._retainChildren(i, j, z + 1, maxZoom);
              }
            }
          }
        },
        _resetView: function(e) {
          var animating = e && (e.pinch || e.flyTo);
          this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
        },
        _animateZoom: function(e) {
          this._setView(e.center, e.zoom, true, e.noUpdate);
        },
        _clampZoom: function(zoom2) {
          var options = this.options;
          if (void 0 !== options.minNativeZoom && zoom2 < options.minNativeZoom) {
            return options.minNativeZoom;
          }
          if (void 0 !== options.maxNativeZoom && options.maxNativeZoom < zoom2) {
            return options.maxNativeZoom;
          }
          return zoom2;
        },
        _setView: function(center, zoom2, noPrune, noUpdate) {
          var tileZoom = Math.round(zoom2);
          if (this.options.maxZoom !== void 0 && tileZoom > this.options.maxZoom || this.options.minZoom !== void 0 && tileZoom < this.options.minZoom) {
            tileZoom = void 0;
          } else {
            tileZoom = this._clampZoom(tileZoom);
          }
          var tileZoomChanged = this.options.updateWhenZooming && tileZoom !== this._tileZoom;
          if (!noUpdate || tileZoomChanged) {
            this._tileZoom = tileZoom;
            if (this._abortLoading) {
              this._abortLoading();
            }
            this._updateLevels();
            this._resetGrid();
            if (tileZoom !== void 0) {
              this._update(center);
            }
            if (!noPrune) {
              this._pruneTiles();
            }
            this._noPrune = !!noPrune;
          }
          this._setZoomTransforms(center, zoom2);
        },
        _setZoomTransforms: function(center, zoom2) {
          for (var i in this._levels) {
            this._setZoomTransform(this._levels[i], center, zoom2);
          }
        },
        _setZoomTransform: function(level, center, zoom2) {
          var scale2 = this._map.getZoomScale(zoom2, level.zoom), translate = level.origin.multiplyBy(scale2).subtract(this._map._getNewPixelOrigin(center, zoom2)).round();
          if (Browser.any3d) {
            setTransform(level.el, translate, scale2);
          } else {
            setPosition(level.el, translate);
          }
        },
        _resetGrid: function() {
          var map = this._map, crs = map.options.crs, tileSize = this._tileSize = this.getTileSize(), tileZoom = this._tileZoom;
          var bounds = this._map.getPixelWorldBounds(this._tileZoom);
          if (bounds) {
            this._globalTileRange = this._pxBoundsToTileRange(bounds);
          }
          this._wrapX = crs.wrapLng && !this.options.noWrap && [
            Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
            Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
          ];
          this._wrapY = crs.wrapLat && !this.options.noWrap && [
            Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
            Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
          ];
        },
        _onMoveEnd: function() {
          if (!this._map || this._map._animatingZoom) {
            return;
          }
          this._update();
        },
        _getTiledPixelBounds: function(center) {
          var map = this._map, mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(), scale2 = map.getZoomScale(mapZoom, this._tileZoom), pixelCenter = map.project(center, this._tileZoom).floor(), halfSize = map.getSize().divideBy(scale2 * 2);
          return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
        },
        // Private method to load tiles in the grid's active zoom level according to map bounds
        _update: function(center) {
          var map = this._map;
          if (!map) {
            return;
          }
          var zoom2 = this._clampZoom(map.getZoom());
          if (center === void 0) {
            center = map.getCenter();
          }
          if (this._tileZoom === void 0) {
            return;
          }
          var pixelBounds = this._getTiledPixelBounds(center), tileRange = this._pxBoundsToTileRange(pixelBounds), tileCenter = tileRange.getCenter(), queue = [], margin = this.options.keepBuffer, noPruneRange = new Bounds(
            tileRange.getBottomLeft().subtract([margin, -margin]),
            tileRange.getTopRight().add([margin, -margin])
          );
          if (!(isFinite(tileRange.min.x) && isFinite(tileRange.min.y) && isFinite(tileRange.max.x) && isFinite(tileRange.max.y))) {
            throw new Error("Attempted to load an infinite number of tiles");
          }
          for (var key in this._tiles) {
            var c = this._tiles[key].coords;
            if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
              this._tiles[key].current = false;
            }
          }
          if (Math.abs(zoom2 - this._tileZoom) > 1) {
            this._setView(center, zoom2);
            return;
          }
          for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
            for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
              var coords = new Point(i, j);
              coords.z = this._tileZoom;
              if (!this._isValidTile(coords)) {
                continue;
              }
              var tile = this._tiles[this._tileCoordsToKey(coords)];
              if (tile) {
                tile.current = true;
              } else {
                queue.push(coords);
              }
            }
          }
          queue.sort(function(a, b) {
            return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
          });
          if (queue.length !== 0) {
            if (!this._loading) {
              this._loading = true;
              this.fire("loading");
            }
            var fragment = document.createDocumentFragment();
            for (i = 0; i < queue.length; i++) {
              this._addTile(queue[i], fragment);
            }
            this._level.el.appendChild(fragment);
          }
        },
        _isValidTile: function(coords) {
          var crs = this._map.options.crs;
          if (!crs.infinite) {
            var bounds = this._globalTileRange;
            if (!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x) || !crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y)) {
              return false;
            }
          }
          if (!this.options.bounds) {
            return true;
          }
          var tileBounds = this._tileCoordsToBounds(coords);
          return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
        },
        _keyToBounds: function(key) {
          return this._tileCoordsToBounds(this._keyToTileCoords(key));
        },
        _tileCoordsToNwSe: function(coords) {
          var map = this._map, tileSize = this.getTileSize(), nwPoint = coords.scaleBy(tileSize), sePoint = nwPoint.add(tileSize), nw = map.unproject(nwPoint, coords.z), se = map.unproject(sePoint, coords.z);
          return [nw, se];
        },
        // converts tile coordinates to its geographical bounds
        _tileCoordsToBounds: function(coords) {
          var bp = this._tileCoordsToNwSe(coords), bounds = new LatLngBounds(bp[0], bp[1]);
          if (!this.options.noWrap) {
            bounds = this._map.wrapLatLngBounds(bounds);
          }
          return bounds;
        },
        // converts tile coordinates to key for the tile cache
        _tileCoordsToKey: function(coords) {
          return coords.x + ":" + coords.y + ":" + coords.z;
        },
        // converts tile cache key to coordinates
        _keyToTileCoords: function(key) {
          var k = key.split(":"), coords = new Point(+k[0], +k[1]);
          coords.z = +k[2];
          return coords;
        },
        _removeTile: function(key) {
          var tile = this._tiles[key];
          if (!tile) {
            return;
          }
          remove(tile.el);
          delete this._tiles[key];
          this.fire("tileunload", {
            tile: tile.el,
            coords: this._keyToTileCoords(key)
          });
        },
        _initTile: function(tile) {
          addClass(tile, "leaflet-tile");
          var tileSize = this.getTileSize();
          tile.style.width = tileSize.x + "px";
          tile.style.height = tileSize.y + "px";
          tile.onselectstart = falseFn;
          tile.onmousemove = falseFn;
          if (Browser.ielt9 && this.options.opacity < 1) {
            setOpacity(tile, this.options.opacity);
          }
        },
        _addTile: function(coords, container) {
          var tilePos = this._getTilePos(coords), key = this._tileCoordsToKey(coords);
          var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));
          this._initTile(tile);
          if (this.createTile.length < 2) {
            requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
          }
          setPosition(tile, tilePos);
          this._tiles[key] = {
            el: tile,
            coords,
            current: true
          };
          container.appendChild(tile);
          this.fire("tileloadstart", {
            tile,
            coords
          });
        },
        _tileReady: function(coords, err, tile) {
          if (err) {
            this.fire("tileerror", {
              error: err,
              tile,
              coords
            });
          }
          var key = this._tileCoordsToKey(coords);
          tile = this._tiles[key];
          if (!tile) {
            return;
          }
          tile.loaded = +/* @__PURE__ */ new Date();
          if (this._map._fadeAnimated) {
            setOpacity(tile.el, 0);
            cancelAnimFrame(this._fadeFrame);
            this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
          } else {
            tile.active = true;
            this._pruneTiles();
          }
          if (!err) {
            addClass(tile.el, "leaflet-tile-loaded");
            this.fire("tileload", {
              tile: tile.el,
              coords
            });
          }
          if (this._noTilesToLoad()) {
            this._loading = false;
            this.fire("load");
            if (Browser.ielt9 || !this._map._fadeAnimated) {
              requestAnimFrame(this._pruneTiles, this);
            } else {
              setTimeout(bind(this._pruneTiles, this), 250);
            }
          }
        },
        _getTilePos: function(coords) {
          return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
        },
        _wrapCoords: function(coords) {
          var newCoords = new Point(
            this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
            this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y
          );
          newCoords.z = coords.z;
          return newCoords;
        },
        _pxBoundsToTileRange: function(bounds) {
          var tileSize = this.getTileSize();
          return new Bounds(
            bounds.min.unscaleBy(tileSize).floor(),
            bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1])
          );
        },
        _noTilesToLoad: function() {
          for (var key in this._tiles) {
            if (!this._tiles[key].loaded) {
              return false;
            }
          }
          return true;
        }
      });
      function gridLayer(options) {
        return new GridLayer(options);
      }
      var TileLayer = GridLayer.extend({
        // @section
        // @aka TileLayer options
        options: {
          // @option minZoom: Number = 0
          // The minimum zoom level down to which this layer will be displayed (inclusive).
          minZoom: 0,
          // @option maxZoom: Number = 18
          // The maximum zoom level up to which this layer will be displayed (inclusive).
          maxZoom: 18,
          // @option subdomains: String|String[] = 'abc'
          // Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
          subdomains: "abc",
          // @option errorTileUrl: String = ''
          // URL to the tile image to show in place of the tile that failed to load.
          errorTileUrl: "",
          // @option zoomOffset: Number = 0
          // The zoom number used in tile URLs will be offset with this value.
          zoomOffset: 0,
          // @option tms: Boolean = false
          // If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
          tms: false,
          // @option zoomReverse: Boolean = false
          // If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
          zoomReverse: false,
          // @option detectRetina: Boolean = false
          // If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
          detectRetina: false,
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the tiles.
          // If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: false,
          // @option referrerPolicy: Boolean|String = false
          // Whether the referrerPolicy attribute will be added to the tiles.
          // If a String is provided, all tiles will have their referrerPolicy attribute set to the String provided.
          // This may be needed if your map's rendering context has a strict default but your tile provider expects a valid referrer
          // (e.g. to validate an API token).
          // Refer to [HTMLImageElement.referrerPolicy](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/referrerPolicy) for valid String values.
          referrerPolicy: false
        },
        initialize: function(url, options) {
          this._url = url;
          options = setOptions(this, options);
          if (options.detectRetina && Browser.retina && options.maxZoom > 0) {
            options.tileSize = Math.floor(options.tileSize / 2);
            if (!options.zoomReverse) {
              options.zoomOffset++;
              options.maxZoom = Math.max(options.minZoom, options.maxZoom - 1);
            } else {
              options.zoomOffset--;
              options.minZoom = Math.min(options.maxZoom, options.minZoom + 1);
            }
            options.minZoom = Math.max(0, options.minZoom);
          } else if (!options.zoomReverse) {
            options.maxZoom = Math.max(options.minZoom, options.maxZoom);
          } else {
            options.minZoom = Math.min(options.maxZoom, options.minZoom);
          }
          if (typeof options.subdomains === "string") {
            options.subdomains = options.subdomains.split("");
          }
          this.on("tileunload", this._onTileRemove);
        },
        // @method setUrl(url: String, noRedraw?: Boolean): this
        // Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
        // If the URL does not change, the layer will not be redrawn unless
        // the noRedraw parameter is set to false.
        setUrl: function(url, noRedraw) {
          if (this._url === url && noRedraw === void 0) {
            noRedraw = true;
          }
          this._url = url;
          if (!noRedraw) {
            this.redraw();
          }
          return this;
        },
        // @method createTile(coords: Object, done?: Function): HTMLElement
        // Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
        // to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
        // callback is called when the tile has been loaded.
        createTile: function(coords, done) {
          var tile = document.createElement("img");
          on(tile, "load", bind(this._tileOnLoad, this, done, tile));
          on(tile, "error", bind(this._tileOnError, this, done, tile));
          if (this.options.crossOrigin || this.options.crossOrigin === "") {
            tile.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
          }
          if (typeof this.options.referrerPolicy === "string") {
            tile.referrerPolicy = this.options.referrerPolicy;
          }
          tile.alt = "";
          tile.src = this.getTileUrl(coords);
          return tile;
        },
        // @section Extension methods
        // @uninheritable
        // Layers extending `TileLayer` might reimplement the following method.
        // @method getTileUrl(coords: Object): String
        // Called only internally, returns the URL for a tile given its coordinates.
        // Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
        getTileUrl: function(coords) {
          var data = {
            r: Browser.retina ? "@2x" : "",
            s: this._getSubdomain(coords),
            x: coords.x,
            y: coords.y,
            z: this._getZoomForUrl()
          };
          if (this._map && !this._map.options.crs.infinite) {
            var invertedY = this._globalTileRange.max.y - coords.y;
            if (this.options.tms) {
              data["y"] = invertedY;
            }
            data["-y"] = invertedY;
          }
          return template(this._url, extend(data, this.options));
        },
        _tileOnLoad: function(done, tile) {
          if (Browser.ielt9) {
            setTimeout(bind(done, this, null, tile), 0);
          } else {
            done(null, tile);
          }
        },
        _tileOnError: function(done, tile, e) {
          var errorUrl = this.options.errorTileUrl;
          if (errorUrl && tile.getAttribute("src") !== errorUrl) {
            tile.src = errorUrl;
          }
          done(e, tile);
        },
        _onTileRemove: function(e) {
          e.tile.onload = null;
        },
        _getZoomForUrl: function() {
          var zoom2 = this._tileZoom, maxZoom = this.options.maxZoom, zoomReverse = this.options.zoomReverse, zoomOffset = this.options.zoomOffset;
          if (zoomReverse) {
            zoom2 = maxZoom - zoom2;
          }
          return zoom2 + zoomOffset;
        },
        _getSubdomain: function(tilePoint) {
          var index2 = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
          return this.options.subdomains[index2];
        },
        // stops loading all tiles in the background layer
        _abortLoading: function() {
          var i, tile;
          for (i in this._tiles) {
            if (this._tiles[i].coords.z !== this._tileZoom) {
              tile = this._tiles[i].el;
              tile.onload = falseFn;
              tile.onerror = falseFn;
              if (!tile.complete) {
                tile.src = emptyImageUrl;
                var coords = this._tiles[i].coords;
                remove(tile);
                delete this._tiles[i];
                this.fire("tileabort", {
                  tile,
                  coords
                });
              }
            }
          }
        },
        _removeTile: function(key) {
          var tile = this._tiles[key];
          if (!tile) {
            return;
          }
          tile.el.setAttribute("src", emptyImageUrl);
          return GridLayer.prototype._removeTile.call(this, key);
        },
        _tileReady: function(coords, err, tile) {
          if (!this._map || tile && tile.getAttribute("src") === emptyImageUrl) {
            return;
          }
          return GridLayer.prototype._tileReady.call(this, coords, err, tile);
        }
      });
      function tileLayer(url, options) {
        return new TileLayer(url, options);
      }
      var TileLayerWMS = TileLayer.extend({
        // @section
        // @aka TileLayer.WMS options
        // If any custom options not documented here are used, they will be sent to the
        // WMS server as extra parameters in each request URL. This can be useful for
        // [non-standard vendor WMS parameters](https://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
        defaultWmsParams: {
          service: "WMS",
          request: "GetMap",
          // @option layers: String = ''
          // **(required)** Comma-separated list of WMS layers to show.
          layers: "",
          // @option styles: String = ''
          // Comma-separated list of WMS styles.
          styles: "",
          // @option format: String = 'image/jpeg'
          // WMS image format (use `'image/png'` for layers with transparency).
          format: "image/jpeg",
          // @option transparent: Boolean = false
          // If `true`, the WMS service will return images with transparency.
          transparent: false,
          // @option version: String = '1.1.1'
          // Version of the WMS service to use
          version: "1.1.1"
        },
        options: {
          // @option crs: CRS = null
          // Coordinate Reference System to use for the WMS requests, defaults to
          // map CRS. Don't change this if you're not sure what it means.
          crs: null,
          // @option uppercase: Boolean = false
          // If `true`, WMS request parameter keys will be uppercase.
          uppercase: false
        },
        initialize: function(url, options) {
          this._url = url;
          var wmsParams = extend({}, this.defaultWmsParams);
          for (var i in options) {
            if (!(i in this.options)) {
              wmsParams[i] = options[i];
            }
          }
          options = setOptions(this, options);
          var realRetina = options.detectRetina && Browser.retina ? 2 : 1;
          var tileSize = this.getTileSize();
          wmsParams.width = tileSize.x * realRetina;
          wmsParams.height = tileSize.y * realRetina;
          this.wmsParams = wmsParams;
        },
        onAdd: function(map) {
          this._crs = this.options.crs || map.options.crs;
          this._wmsVersion = parseFloat(this.wmsParams.version);
          var projectionKey = this._wmsVersion >= 1.3 ? "crs" : "srs";
          this.wmsParams[projectionKey] = this._crs.code;
          TileLayer.prototype.onAdd.call(this, map);
        },
        getTileUrl: function(coords) {
          var tileBounds = this._tileCoordsToNwSe(coords), crs = this._crs, bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])), min = bounds.min, max = bounds.max, bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ? [min.y, min.x, max.y, max.x] : [min.x, min.y, max.x, max.y]).join(","), url = TileLayer.prototype.getTileUrl.call(this, coords);
          return url + getParamString(this.wmsParams, url, this.options.uppercase) + (this.options.uppercase ? "&BBOX=" : "&bbox=") + bbox;
        },
        // @method setParams(params: Object, noRedraw?: Boolean): this
        // Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
        setParams: function(params, noRedraw) {
          extend(this.wmsParams, params);
          if (!noRedraw) {
            this.redraw();
          }
          return this;
        }
      });
      function tileLayerWMS(url, options) {
        return new TileLayerWMS(url, options);
      }
      TileLayer.WMS = TileLayerWMS;
      tileLayer.wms = tileLayerWMS;
      var Renderer = Layer.extend({
        // @section
        // @aka Renderer options
        options: {
          // @option padding: Number = 0.1
          // How much to extend the clip area around the map view (relative to its size)
          // e.g. 0.1 would be 10% of map view in each direction
          padding: 0.1
        },
        initialize: function(options) {
          setOptions(this, options);
          stamp(this);
          this._layers = this._layers || {};
        },
        onAdd: function() {
          if (!this._container) {
            this._initContainer();
            addClass(this._container, "leaflet-zoom-animated");
          }
          this.getPane().appendChild(this._container);
          this._update();
          this.on("update", this._updatePaths, this);
        },
        onRemove: function() {
          this.off("update", this._updatePaths, this);
          this._destroyContainer();
        },
        getEvents: function() {
          var events = {
            viewreset: this._reset,
            zoom: this._onZoom,
            moveend: this._update,
            zoomend: this._onZoomEnd
          };
          if (this._zoomAnimated) {
            events.zoomanim = this._onAnimZoom;
          }
          return events;
        },
        _onAnimZoom: function(ev) {
          this._updateTransform(ev.center, ev.zoom);
        },
        _onZoom: function() {
          this._updateTransform(this._map.getCenter(), this._map.getZoom());
        },
        _updateTransform: function(center, zoom2) {
          var scale2 = this._map.getZoomScale(zoom2, this._zoom), viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding), currentCenterPoint = this._map.project(this._center, zoom2), topLeftOffset = viewHalf.multiplyBy(-scale2).add(currentCenterPoint).subtract(this._map._getNewPixelOrigin(center, zoom2));
          if (Browser.any3d) {
            setTransform(this._container, topLeftOffset, scale2);
          } else {
            setPosition(this._container, topLeftOffset);
          }
        },
        _reset: function() {
          this._update();
          this._updateTransform(this._center, this._zoom);
          for (var id in this._layers) {
            this._layers[id]._reset();
          }
        },
        _onZoomEnd: function() {
          for (var id in this._layers) {
            this._layers[id]._project();
          }
        },
        _updatePaths: function() {
          for (var id in this._layers) {
            this._layers[id]._update();
          }
        },
        _update: function() {
          var p = this.options.padding, size = this._map.getSize(), min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();
          this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());
          this._center = this._map.getCenter();
          this._zoom = this._map.getZoom();
        }
      });
      var Canvas = Renderer.extend({
        // @section
        // @aka Canvas options
        options: {
          // @option tolerance: Number = 0
          // How much to extend the click tolerance around a path/object on the map.
          tolerance: 0
        },
        getEvents: function() {
          var events = Renderer.prototype.getEvents.call(this);
          events.viewprereset = this._onViewPreReset;
          return events;
        },
        _onViewPreReset: function() {
          this._postponeUpdatePaths = true;
        },
        onAdd: function() {
          Renderer.prototype.onAdd.call(this);
          this._draw();
        },
        _initContainer: function() {
          var container = this._container = document.createElement("canvas");
          on(container, "mousemove", this._onMouseMove, this);
          on(container, "click dblclick mousedown mouseup contextmenu", this._onClick, this);
          on(container, "mouseout", this._handleMouseOut, this);
          container["_leaflet_disable_events"] = true;
          this._ctx = container.getContext("2d");
        },
        _destroyContainer: function() {
          cancelAnimFrame(this._redrawRequest);
          delete this._ctx;
          remove(this._container);
          off(this._container);
          delete this._container;
        },
        _updatePaths: function() {
          if (this._postponeUpdatePaths) {
            return;
          }
          var layer;
          this._redrawBounds = null;
          for (var id in this._layers) {
            layer = this._layers[id];
            layer._update();
          }
          this._redraw();
        },
        _update: function() {
          if (this._map._animatingZoom && this._bounds) {
            return;
          }
          Renderer.prototype._update.call(this);
          var b = this._bounds, container = this._container, size = b.getSize(), m = Browser.retina ? 2 : 1;
          setPosition(container, b.min);
          container.width = m * size.x;
          container.height = m * size.y;
          container.style.width = size.x + "px";
          container.style.height = size.y + "px";
          if (Browser.retina) {
            this._ctx.scale(2, 2);
          }
          this._ctx.translate(-b.min.x, -b.min.y);
          this.fire("update");
        },
        _reset: function() {
          Renderer.prototype._reset.call(this);
          if (this._postponeUpdatePaths) {
            this._postponeUpdatePaths = false;
            this._updatePaths();
          }
        },
        _initPath: function(layer) {
          this._updateDashArray(layer);
          this._layers[stamp(layer)] = layer;
          var order = layer._order = {
            layer,
            prev: this._drawLast,
            next: null
          };
          if (this._drawLast) {
            this._drawLast.next = order;
          }
          this._drawLast = order;
          this._drawFirst = this._drawFirst || this._drawLast;
        },
        _addPath: function(layer) {
          this._requestRedraw(layer);
        },
        _removePath: function(layer) {
          var order = layer._order;
          var next = order.next;
          var prev = order.prev;
          if (next) {
            next.prev = prev;
          } else {
            this._drawLast = prev;
          }
          if (prev) {
            prev.next = next;
          } else {
            this._drawFirst = next;
          }
          delete layer._order;
          delete this._layers[stamp(layer)];
          this._requestRedraw(layer);
        },
        _updatePath: function(layer) {
          this._extendRedrawBounds(layer);
          layer._project();
          layer._update();
          this._requestRedraw(layer);
        },
        _updateStyle: function(layer) {
          this._updateDashArray(layer);
          this._requestRedraw(layer);
        },
        _updateDashArray: function(layer) {
          if (typeof layer.options.dashArray === "string") {
            var parts = layer.options.dashArray.split(/[, ]+/), dashArray = [], dashValue, i;
            for (i = 0; i < parts.length; i++) {
              dashValue = Number(parts[i]);
              if (isNaN(dashValue)) {
                return;
              }
              dashArray.push(dashValue);
            }
            layer.options._dashArray = dashArray;
          } else {
            layer.options._dashArray = layer.options.dashArray;
          }
        },
        _requestRedraw: function(layer) {
          if (!this._map) {
            return;
          }
          this._extendRedrawBounds(layer);
          this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
        },
        _extendRedrawBounds: function(layer) {
          if (layer._pxBounds) {
            var padding = (layer.options.weight || 0) + 1;
            this._redrawBounds = this._redrawBounds || new Bounds();
            this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
            this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
          }
        },
        _redraw: function() {
          this._redrawRequest = null;
          if (this._redrawBounds) {
            this._redrawBounds.min._floor();
            this._redrawBounds.max._ceil();
          }
          this._clear();
          this._draw();
          this._redrawBounds = null;
        },
        _clear: function() {
          var bounds = this._redrawBounds;
          if (bounds) {
            var size = bounds.getSize();
            this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
          } else {
            this._ctx.save();
            this._ctx.setTransform(1, 0, 0, 1, 0, 0);
            this._ctx.clearRect(0, 0, this._container.width, this._container.height);
            this._ctx.restore();
          }
        },
        _draw: function() {
          var layer, bounds = this._redrawBounds;
          this._ctx.save();
          if (bounds) {
            var size = bounds.getSize();
            this._ctx.beginPath();
            this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
            this._ctx.clip();
          }
          this._drawing = true;
          for (var order = this._drawFirst; order; order = order.next) {
            layer = order.layer;
            if (!bounds || layer._pxBounds && layer._pxBounds.intersects(bounds)) {
              layer._updatePath();
            }
          }
          this._drawing = false;
          this._ctx.restore();
        },
        _updatePoly: function(layer, closed) {
          if (!this._drawing) {
            return;
          }
          var i, j, len2, p, parts = layer._parts, len = parts.length, ctx = this._ctx;
          if (!len) {
            return;
          }
          ctx.beginPath();
          for (i = 0; i < len; i++) {
            for (j = 0, len2 = parts[i].length; j < len2; j++) {
              p = parts[i][j];
              ctx[j ? "lineTo" : "moveTo"](p.x, p.y);
            }
            if (closed) {
              ctx.closePath();
            }
          }
          this._fillStroke(ctx, layer);
        },
        _updateCircle: function(layer) {
          if (!this._drawing || layer._empty()) {
            return;
          }
          var p = layer._point, ctx = this._ctx, r = Math.max(Math.round(layer._radius), 1), s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;
          if (s !== 1) {
            ctx.save();
            ctx.scale(1, s);
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);
          if (s !== 1) {
            ctx.restore();
          }
          this._fillStroke(ctx, layer);
        },
        _fillStroke: function(ctx, layer) {
          var options = layer.options;
          if (options.fill) {
            ctx.globalAlpha = options.fillOpacity;
            ctx.fillStyle = options.fillColor || options.color;
            ctx.fill(options.fillRule || "evenodd");
          }
          if (options.stroke && options.weight !== 0) {
            if (ctx.setLineDash) {
              ctx.setLineDash(layer.options && layer.options._dashArray || []);
            }
            ctx.globalAlpha = options.opacity;
            ctx.lineWidth = options.weight;
            ctx.strokeStyle = options.color;
            ctx.lineCap = options.lineCap;
            ctx.lineJoin = options.lineJoin;
            ctx.stroke();
          }
        },
        // Canvas obviously doesn't have mouse events for individual drawn objects,
        // so we emulate that by calculating what's under the mouse on mousemove/click manually
        _onClick: function(e) {
          var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;
          for (var order = this._drawFirst; order; order = order.next) {
            layer = order.layer;
            if (layer.options.interactive && layer._containsPoint(point)) {
              if (!(e.type === "click" || e.type === "preclick") || !this._map._draggableMoved(layer)) {
                clickedLayer = layer;
              }
            }
          }
          this._fireEvent(clickedLayer ? [clickedLayer] : false, e);
        },
        _onMouseMove: function(e) {
          if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) {
            return;
          }
          var point = this._map.mouseEventToLayerPoint(e);
          this._handleMouseHover(e, point);
        },
        _handleMouseOut: function(e) {
          var layer = this._hoveredLayer;
          if (layer) {
            removeClass(this._container, "leaflet-interactive");
            this._fireEvent([layer], e, "mouseout");
            this._hoveredLayer = null;
            this._mouseHoverThrottled = false;
          }
        },
        _handleMouseHover: function(e, point) {
          if (this._mouseHoverThrottled) {
            return;
          }
          var layer, candidateHoveredLayer;
          for (var order = this._drawFirst; order; order = order.next) {
            layer = order.layer;
            if (layer.options.interactive && layer._containsPoint(point)) {
              candidateHoveredLayer = layer;
            }
          }
          if (candidateHoveredLayer !== this._hoveredLayer) {
            this._handleMouseOut(e);
            if (candidateHoveredLayer) {
              addClass(this._container, "leaflet-interactive");
              this._fireEvent([candidateHoveredLayer], e, "mouseover");
              this._hoveredLayer = candidateHoveredLayer;
            }
          }
          this._fireEvent(this._hoveredLayer ? [this._hoveredLayer] : false, e);
          this._mouseHoverThrottled = true;
          setTimeout(bind(function() {
            this._mouseHoverThrottled = false;
          }, this), 32);
        },
        _fireEvent: function(layers2, e, type) {
          this._map._fireDOMEvent(e, type || e.type, layers2);
        },
        _bringToFront: function(layer) {
          var order = layer._order;
          if (!order) {
            return;
          }
          var next = order.next;
          var prev = order.prev;
          if (next) {
            next.prev = prev;
          } else {
            return;
          }
          if (prev) {
            prev.next = next;
          } else if (next) {
            this._drawFirst = next;
          }
          order.prev = this._drawLast;
          this._drawLast.next = order;
          order.next = null;
          this._drawLast = order;
          this._requestRedraw(layer);
        },
        _bringToBack: function(layer) {
          var order = layer._order;
          if (!order) {
            return;
          }
          var next = order.next;
          var prev = order.prev;
          if (prev) {
            prev.next = next;
          } else {
            return;
          }
          if (next) {
            next.prev = prev;
          } else if (prev) {
            this._drawLast = prev;
          }
          order.prev = null;
          order.next = this._drawFirst;
          this._drawFirst.prev = order;
          this._drawFirst = order;
          this._requestRedraw(layer);
        }
      });
      function canvas(options) {
        return Browser.canvas ? new Canvas(options) : null;
      }
      var vmlCreate = (function() {
        try {
          document.namespaces.add("lvml", "urn:schemas-microsoft-com:vml");
          return function(name) {
            return document.createElement("<lvml:" + name + ' class="lvml">');
          };
        } catch (e) {
        }
        return function(name) {
          return document.createElement("<" + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
        };
      })();
      var vmlMixin = {
        _initContainer: function() {
          this._container = create$1("div", "leaflet-vml-container");
        },
        _update: function() {
          if (this._map._animatingZoom) {
            return;
          }
          Renderer.prototype._update.call(this);
          this.fire("update");
        },
        _initPath: function(layer) {
          var container = layer._container = vmlCreate("shape");
          addClass(container, "leaflet-vml-shape " + (this.options.className || ""));
          container.coordsize = "1 1";
          layer._path = vmlCreate("path");
          container.appendChild(layer._path);
          this._updateStyle(layer);
          this._layers[stamp(layer)] = layer;
        },
        _addPath: function(layer) {
          var container = layer._container;
          this._container.appendChild(container);
          if (layer.options.interactive) {
            layer.addInteractiveTarget(container);
          }
        },
        _removePath: function(layer) {
          var container = layer._container;
          remove(container);
          layer.removeInteractiveTarget(container);
          delete this._layers[stamp(layer)];
        },
        _updateStyle: function(layer) {
          var stroke = layer._stroke, fill = layer._fill, options = layer.options, container = layer._container;
          container.stroked = !!options.stroke;
          container.filled = !!options.fill;
          if (options.stroke) {
            if (!stroke) {
              stroke = layer._stroke = vmlCreate("stroke");
            }
            container.appendChild(stroke);
            stroke.weight = options.weight + "px";
            stroke.color = options.color;
            stroke.opacity = options.opacity;
            if (options.dashArray) {
              stroke.dashStyle = isArray(options.dashArray) ? options.dashArray.join(" ") : options.dashArray.replace(/( *, *)/g, " ");
            } else {
              stroke.dashStyle = "";
            }
            stroke.endcap = options.lineCap.replace("butt", "flat");
            stroke.joinstyle = options.lineJoin;
          } else if (stroke) {
            container.removeChild(stroke);
            layer._stroke = null;
          }
          if (options.fill) {
            if (!fill) {
              fill = layer._fill = vmlCreate("fill");
            }
            container.appendChild(fill);
            fill.color = options.fillColor || options.color;
            fill.opacity = options.fillOpacity;
          } else if (fill) {
            container.removeChild(fill);
            layer._fill = null;
          }
        },
        _updateCircle: function(layer) {
          var p = layer._point.round(), r = Math.round(layer._radius), r2 = Math.round(layer._radiusY || r);
          this._setPath(layer, layer._empty() ? "M0 0" : "AL " + p.x + "," + p.y + " " + r + "," + r2 + " 0," + 65535 * 360);
        },
        _setPath: function(layer, path) {
          layer._path.v = path;
        },
        _bringToFront: function(layer) {
          toFront(layer._container);
        },
        _bringToBack: function(layer) {
          toBack(layer._container);
        }
      };
      var create = Browser.vml ? vmlCreate : svgCreate;
      var SVG = Renderer.extend({
        _initContainer: function() {
          this._container = create("svg");
          this._container.setAttribute("pointer-events", "none");
          this._rootGroup = create("g");
          this._container.appendChild(this._rootGroup);
        },
        _destroyContainer: function() {
          remove(this._container);
          off(this._container);
          delete this._container;
          delete this._rootGroup;
          delete this._svgSize;
        },
        _update: function() {
          if (this._map._animatingZoom && this._bounds) {
            return;
          }
          Renderer.prototype._update.call(this);
          var b = this._bounds, size = b.getSize(), container = this._container;
          if (!this._svgSize || !this._svgSize.equals(size)) {
            this._svgSize = size;
            container.setAttribute("width", size.x);
            container.setAttribute("height", size.y);
          }
          setPosition(container, b.min);
          container.setAttribute("viewBox", [b.min.x, b.min.y, size.x, size.y].join(" "));
          this.fire("update");
        },
        // methods below are called by vector layers implementations
        _initPath: function(layer) {
          var path = layer._path = create("path");
          if (layer.options.className) {
            addClass(path, layer.options.className);
          }
          if (layer.options.interactive) {
            addClass(path, "leaflet-interactive");
          }
          this._updateStyle(layer);
          this._layers[stamp(layer)] = layer;
        },
        _addPath: function(layer) {
          if (!this._rootGroup) {
            this._initContainer();
          }
          this._rootGroup.appendChild(layer._path);
          layer.addInteractiveTarget(layer._path);
        },
        _removePath: function(layer) {
          remove(layer._path);
          layer.removeInteractiveTarget(layer._path);
          delete this._layers[stamp(layer)];
        },
        _updatePath: function(layer) {
          layer._project();
          layer._update();
        },
        _updateStyle: function(layer) {
          var path = layer._path, options = layer.options;
          if (!path) {
            return;
          }
          if (options.stroke) {
            path.setAttribute("stroke", options.color);
            path.setAttribute("stroke-opacity", options.opacity);
            path.setAttribute("stroke-width", options.weight);
            path.setAttribute("stroke-linecap", options.lineCap);
            path.setAttribute("stroke-linejoin", options.lineJoin);
            if (options.dashArray) {
              path.setAttribute("stroke-dasharray", options.dashArray);
            } else {
              path.removeAttribute("stroke-dasharray");
            }
            if (options.dashOffset) {
              path.setAttribute("stroke-dashoffset", options.dashOffset);
            } else {
              path.removeAttribute("stroke-dashoffset");
            }
          } else {
            path.setAttribute("stroke", "none");
          }
          if (options.fill) {
            path.setAttribute("fill", options.fillColor || options.color);
            path.setAttribute("fill-opacity", options.fillOpacity);
            path.setAttribute("fill-rule", options.fillRule || "evenodd");
          } else {
            path.setAttribute("fill", "none");
          }
        },
        _updatePoly: function(layer, closed) {
          this._setPath(layer, pointsToPath(layer._parts, closed));
        },
        _updateCircle: function(layer) {
          var p = layer._point, r = Math.max(Math.round(layer._radius), 1), r2 = Math.max(Math.round(layer._radiusY), 1) || r, arc = "a" + r + "," + r2 + " 0 1,0 ";
          var d = layer._empty() ? "M0 0" : "M" + (p.x - r) + "," + p.y + arc + r * 2 + ",0 " + arc + -r * 2 + ",0 ";
          this._setPath(layer, d);
        },
        _setPath: function(layer, path) {
          layer._path.setAttribute("d", path);
        },
        // SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
        _bringToFront: function(layer) {
          toFront(layer._path);
        },
        _bringToBack: function(layer) {
          toBack(layer._path);
        }
      });
      if (Browser.vml) {
        SVG.include(vmlMixin);
      }
      function svg(options) {
        return Browser.svg || Browser.vml ? new SVG(options) : null;
      }
      Map2.include({
        // @namespace Map; @method getRenderer(layer: Path): Renderer
        // Returns the instance of `Renderer` that should be used to render the given
        // `Path`. It will ensure that the `renderer` options of the map and paths
        // are respected, and that the renderers do exist on the map.
        getRenderer: function(layer) {
          var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;
          if (!renderer) {
            renderer = this._renderer = this._createRenderer();
          }
          if (!this.hasLayer(renderer)) {
            this.addLayer(renderer);
          }
          return renderer;
        },
        _getPaneRenderer: function(name) {
          if (name === "overlayPane" || name === void 0) {
            return false;
          }
          var renderer = this._paneRenderers[name];
          if (renderer === void 0) {
            renderer = this._createRenderer({ pane: name });
            this._paneRenderers[name] = renderer;
          }
          return renderer;
        },
        _createRenderer: function(options) {
          return this.options.preferCanvas && canvas(options) || svg(options);
        }
      });
      var Rectangle = Polygon.extend({
        initialize: function(latLngBounds, options) {
          Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
        },
        // @method setBounds(latLngBounds: LatLngBounds): this
        // Redraws the rectangle with the passed bounds.
        setBounds: function(latLngBounds) {
          return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
        },
        _boundsToLatLngs: function(latLngBounds) {
          latLngBounds = toLatLngBounds(latLngBounds);
          return [
            latLngBounds.getSouthWest(),
            latLngBounds.getNorthWest(),
            latLngBounds.getNorthEast(),
            latLngBounds.getSouthEast()
          ];
        }
      });
      function rectangle(latLngBounds, options) {
        return new Rectangle(latLngBounds, options);
      }
      SVG.create = create;
      SVG.pointsToPath = pointsToPath;
      GeoJSON.geometryToLayer = geometryToLayer;
      GeoJSON.coordsToLatLng = coordsToLatLng;
      GeoJSON.coordsToLatLngs = coordsToLatLngs;
      GeoJSON.latLngToCoords = latLngToCoords;
      GeoJSON.latLngsToCoords = latLngsToCoords;
      GeoJSON.getFeature = getFeature;
      GeoJSON.asFeature = asFeature;
      Map2.mergeOptions({
        // @option boxZoom: Boolean = true
        // Whether the map can be zoomed to a rectangular area specified by
        // dragging the mouse while pressing the shift key.
        boxZoom: true
      });
      var BoxZoom = Handler.extend({
        initialize: function(map) {
          this._map = map;
          this._container = map._container;
          this._pane = map._panes.overlayPane;
          this._resetStateTimeout = 0;
          map.on("unload", this._destroy, this);
        },
        addHooks: function() {
          on(this._container, "mousedown", this._onMouseDown, this);
        },
        removeHooks: function() {
          off(this._container, "mousedown", this._onMouseDown, this);
        },
        moved: function() {
          return this._moved;
        },
        _destroy: function() {
          remove(this._pane);
          delete this._pane;
        },
        _resetState: function() {
          this._resetStateTimeout = 0;
          this._moved = false;
        },
        _clearDeferredResetState: function() {
          if (this._resetStateTimeout !== 0) {
            clearTimeout(this._resetStateTimeout);
            this._resetStateTimeout = 0;
          }
        },
        _onMouseDown: function(e) {
          if (!e.shiftKey || e.which !== 1 && e.button !== 1) {
            return false;
          }
          this._clearDeferredResetState();
          this._resetState();
          disableTextSelection();
          disableImageDrag();
          this._startPoint = this._map.mouseEventToContainerPoint(e);
          on(document, {
            contextmenu: stop,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onKeyDown
          }, this);
        },
        _onMouseMove: function(e) {
          if (!this._moved) {
            this._moved = true;
            this._box = create$1("div", "leaflet-zoom-box", this._container);
            addClass(this._container, "leaflet-crosshair");
            this._map.fire("boxzoomstart");
          }
          this._point = this._map.mouseEventToContainerPoint(e);
          var bounds = new Bounds(this._point, this._startPoint), size = bounds.getSize();
          setPosition(this._box, bounds.min);
          this._box.style.width = size.x + "px";
          this._box.style.height = size.y + "px";
        },
        _finish: function() {
          if (this._moved) {
            remove(this._box);
            removeClass(this._container, "leaflet-crosshair");
          }
          enableTextSelection();
          enableImageDrag();
          off(document, {
            contextmenu: stop,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onKeyDown
          }, this);
        },
        _onMouseUp: function(e) {
          if (e.which !== 1 && e.button !== 1) {
            return;
          }
          this._finish();
          if (!this._moved) {
            return;
          }
          this._clearDeferredResetState();
          this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);
          var bounds = new LatLngBounds(
            this._map.containerPointToLatLng(this._startPoint),
            this._map.containerPointToLatLng(this._point)
          );
          this._map.fitBounds(bounds).fire("boxzoomend", { boxZoomBounds: bounds });
        },
        _onKeyDown: function(e) {
          if (e.keyCode === 27) {
            this._finish();
            this._clearDeferredResetState();
            this._resetState();
          }
        }
      });
      Map2.addInitHook("addHandler", "boxZoom", BoxZoom);
      Map2.mergeOptions({
        // @option doubleClickZoom: Boolean|String = true
        // Whether the map can be zoomed in by double clicking on it and
        // zoomed out by double clicking while holding shift. If passed
        // `'center'`, double-click zoom will zoom to the center of the
        //  view regardless of where the mouse was.
        doubleClickZoom: true
      });
      var DoubleClickZoom = Handler.extend({
        addHooks: function() {
          this._map.on("dblclick", this._onDoubleClick, this);
        },
        removeHooks: function() {
          this._map.off("dblclick", this._onDoubleClick, this);
        },
        _onDoubleClick: function(e) {
          var map = this._map, oldZoom = map.getZoom(), delta = map.options.zoomDelta, zoom2 = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;
          if (map.options.doubleClickZoom === "center") {
            map.setZoom(zoom2);
          } else {
            map.setZoomAround(e.containerPoint, zoom2);
          }
        }
      });
      Map2.addInitHook("addHandler", "doubleClickZoom", DoubleClickZoom);
      Map2.mergeOptions({
        // @option dragging: Boolean = true
        // Whether the map is draggable with mouse/touch or not.
        dragging: true,
        // @section Panning Inertia Options
        // @option inertia: Boolean = *
        // If enabled, panning of the map will have an inertia effect where
        // the map builds momentum while dragging and continues moving in
        // the same direction for some time. Feels especially nice on touch
        // devices. Enabled by default.
        inertia: true,
        // @option inertiaDeceleration: Number = 3000
        // The rate with which the inertial movement slows down, in pixels/second².
        inertiaDeceleration: 3400,
        // px/s^2
        // @option inertiaMaxSpeed: Number = Infinity
        // Max speed of the inertial movement, in pixels/second.
        inertiaMaxSpeed: Infinity,
        // px/s
        // @option easeLinearity: Number = 0.2
        easeLinearity: 0.2,
        // TODO refactor, move to CRS
        // @option worldCopyJump: Boolean = false
        // With this option enabled, the map tracks when you pan to another "copy"
        // of the world and seamlessly jumps to the original one so that all overlays
        // like markers and vector layers are still visible.
        worldCopyJump: false,
        // @option maxBoundsViscosity: Number = 0.0
        // If `maxBounds` is set, this option will control how solid the bounds
        // are when dragging the map around. The default value of `0.0` allows the
        // user to drag outside the bounds at normal speed, higher values will
        // slow down map dragging outside bounds, and `1.0` makes the bounds fully
        // solid, preventing the user from dragging outside the bounds.
        maxBoundsViscosity: 0
      });
      var Drag = Handler.extend({
        addHooks: function() {
          if (!this._draggable) {
            var map = this._map;
            this._draggable = new Draggable(map._mapPane, map._container);
            this._draggable.on({
              dragstart: this._onDragStart,
              drag: this._onDrag,
              dragend: this._onDragEnd
            }, this);
            this._draggable.on("predrag", this._onPreDragLimit, this);
            if (map.options.worldCopyJump) {
              this._draggable.on("predrag", this._onPreDragWrap, this);
              map.on("zoomend", this._onZoomEnd, this);
              map.whenReady(this._onZoomEnd, this);
            }
          }
          addClass(this._map._container, "leaflet-grab leaflet-touch-drag");
          this._draggable.enable();
          this._positions = [];
          this._times = [];
        },
        removeHooks: function() {
          removeClass(this._map._container, "leaflet-grab");
          removeClass(this._map._container, "leaflet-touch-drag");
          this._draggable.disable();
        },
        moved: function() {
          return this._draggable && this._draggable._moved;
        },
        moving: function() {
          return this._draggable && this._draggable._moving;
        },
        _onDragStart: function() {
          var map = this._map;
          map._stop();
          if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
            var bounds = toLatLngBounds(this._map.options.maxBounds);
            this._offsetLimit = toBounds(
              this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
              this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1).add(this._map.getSize())
            );
            this._viscosity = Math.min(1, Math.max(0, this._map.options.maxBoundsViscosity));
          } else {
            this._offsetLimit = null;
          }
          map.fire("movestart").fire("dragstart");
          if (map.options.inertia) {
            this._positions = [];
            this._times = [];
          }
        },
        _onDrag: function(e) {
          if (this._map.options.inertia) {
            var time = this._lastTime = +/* @__PURE__ */ new Date(), pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;
            this._positions.push(pos);
            this._times.push(time);
            this._prunePositions(time);
          }
          this._map.fire("move", e).fire("drag", e);
        },
        _prunePositions: function(time) {
          while (this._positions.length > 1 && time - this._times[0] > 50) {
            this._positions.shift();
            this._times.shift();
          }
        },
        _onZoomEnd: function() {
          var pxCenter = this._map.getSize().divideBy(2), pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);
          this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
          this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
        },
        _viscousLimit: function(value, threshold) {
          return value - (value - threshold) * this._viscosity;
        },
        _onPreDragLimit: function() {
          if (!this._viscosity || !this._offsetLimit) {
            return;
          }
          var offset = this._draggable._newPos.subtract(this._draggable._startPos);
          var limit = this._offsetLimit;
          if (offset.x < limit.min.x) {
            offset.x = this._viscousLimit(offset.x, limit.min.x);
          }
          if (offset.y < limit.min.y) {
            offset.y = this._viscousLimit(offset.y, limit.min.y);
          }
          if (offset.x > limit.max.x) {
            offset.x = this._viscousLimit(offset.x, limit.max.x);
          }
          if (offset.y > limit.max.y) {
            offset.y = this._viscousLimit(offset.y, limit.max.y);
          }
          this._draggable._newPos = this._draggable._startPos.add(offset);
        },
        _onPreDragWrap: function() {
          var worldWidth = this._worldWidth, halfWidth = Math.round(worldWidth / 2), dx = this._initialWorldOffset, x = this._draggable._newPos.x, newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx, newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx, newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;
          this._draggable._absPos = this._draggable._newPos.clone();
          this._draggable._newPos.x = newX;
        },
        _onDragEnd: function(e) {
          var map = this._map, options = map.options, noInertia = !options.inertia || e.noInertia || this._times.length < 2;
          map.fire("dragend", e);
          if (noInertia) {
            map.fire("moveend");
          } else {
            this._prunePositions(+/* @__PURE__ */ new Date());
            var direction = this._lastPos.subtract(this._positions[0]), duration = (this._lastTime - this._times[0]) / 1e3, ease = options.easeLinearity, speedVector = direction.multiplyBy(ease / duration), speed = speedVector.distanceTo([0, 0]), limitedSpeed = Math.min(options.inertiaMaxSpeed, speed), limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed), decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease), offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();
            if (!offset.x && !offset.y) {
              map.fire("moveend");
            } else {
              offset = map._limitOffset(offset, map.options.maxBounds);
              requestAnimFrame(function() {
                map.panBy(offset, {
                  duration: decelerationDuration,
                  easeLinearity: ease,
                  noMoveStart: true,
                  animate: true
                });
              });
            }
          }
        }
      });
      Map2.addInitHook("addHandler", "dragging", Drag);
      Map2.mergeOptions({
        // @option keyboard: Boolean = true
        // Makes the map focusable and allows users to navigate the map with keyboard
        // arrows and `+`/`-` keys.
        keyboard: true,
        // @option keyboardPanDelta: Number = 80
        // Amount of pixels to pan when pressing an arrow key.
        keyboardPanDelta: 80
      });
      var Keyboard = Handler.extend({
        keyCodes: {
          left: [37],
          right: [39],
          down: [40],
          up: [38],
          zoomIn: [187, 107, 61, 171],
          zoomOut: [189, 109, 54, 173]
        },
        initialize: function(map) {
          this._map = map;
          this._setPanDelta(map.options.keyboardPanDelta);
          this._setZoomDelta(map.options.zoomDelta);
        },
        addHooks: function() {
          var container = this._map._container;
          if (container.tabIndex <= 0) {
            container.tabIndex = "0";
          }
          on(container, {
            focus: this._onFocus,
            blur: this._onBlur,
            mousedown: this._onMouseDown
          }, this);
          this._map.on({
            focus: this._addHooks,
            blur: this._removeHooks
          }, this);
        },
        removeHooks: function() {
          this._removeHooks();
          off(this._map._container, {
            focus: this._onFocus,
            blur: this._onBlur,
            mousedown: this._onMouseDown
          }, this);
          this._map.off({
            focus: this._addHooks,
            blur: this._removeHooks
          }, this);
        },
        _onMouseDown: function() {
          if (this._focused) {
            return;
          }
          var body = document.body, docEl = document.documentElement, top = body.scrollTop || docEl.scrollTop, left = body.scrollLeft || docEl.scrollLeft;
          this._map._container.focus();
          window.scrollTo(left, top);
        },
        _onFocus: function() {
          this._focused = true;
          this._map.fire("focus");
        },
        _onBlur: function() {
          this._focused = false;
          this._map.fire("blur");
        },
        _setPanDelta: function(panDelta) {
          var keys = this._panKeys = {}, codes = this.keyCodes, i, len;
          for (i = 0, len = codes.left.length; i < len; i++) {
            keys[codes.left[i]] = [-1 * panDelta, 0];
          }
          for (i = 0, len = codes.right.length; i < len; i++) {
            keys[codes.right[i]] = [panDelta, 0];
          }
          for (i = 0, len = codes.down.length; i < len; i++) {
            keys[codes.down[i]] = [0, panDelta];
          }
          for (i = 0, len = codes.up.length; i < len; i++) {
            keys[codes.up[i]] = [0, -1 * panDelta];
          }
        },
        _setZoomDelta: function(zoomDelta) {
          var keys = this._zoomKeys = {}, codes = this.keyCodes, i, len;
          for (i = 0, len = codes.zoomIn.length; i < len; i++) {
            keys[codes.zoomIn[i]] = zoomDelta;
          }
          for (i = 0, len = codes.zoomOut.length; i < len; i++) {
            keys[codes.zoomOut[i]] = -zoomDelta;
          }
        },
        _addHooks: function() {
          on(document, "keydown", this._onKeyDown, this);
        },
        _removeHooks: function() {
          off(document, "keydown", this._onKeyDown, this);
        },
        _onKeyDown: function(e) {
          if (e.altKey || e.ctrlKey || e.metaKey) {
            return;
          }
          var key = e.keyCode, map = this._map, offset;
          if (key in this._panKeys) {
            if (!map._panAnim || !map._panAnim._inProgress) {
              offset = this._panKeys[key];
              if (e.shiftKey) {
                offset = toPoint(offset).multiplyBy(3);
              }
              if (map.options.maxBounds) {
                offset = map._limitOffset(toPoint(offset), map.options.maxBounds);
              }
              if (map.options.worldCopyJump) {
                var newLatLng = map.wrapLatLng(map.unproject(map.project(map.getCenter()).add(offset)));
                map.panTo(newLatLng);
              } else {
                map.panBy(offset);
              }
            }
          } else if (key in this._zoomKeys) {
            map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);
          } else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
            map.closePopup();
          } else {
            return;
          }
          stop(e);
        }
      });
      Map2.addInitHook("addHandler", "keyboard", Keyboard);
      Map2.mergeOptions({
        // @section Mouse wheel options
        // @option scrollWheelZoom: Boolean|String = true
        // Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
        // it will zoom to the center of the view regardless of where the mouse was.
        scrollWheelZoom: true,
        // @option wheelDebounceTime: Number = 40
        // Limits the rate at which a wheel can fire (in milliseconds). By default
        // user can't zoom via wheel more often than once per 40 ms.
        wheelDebounceTime: 40,
        // @option wheelPxPerZoomLevel: Number = 60
        // How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
        // mean a change of one full zoom level. Smaller values will make wheel-zooming
        // faster (and vice versa).
        wheelPxPerZoomLevel: 60
      });
      var ScrollWheelZoom = Handler.extend({
        addHooks: function() {
          on(this._map._container, "wheel", this._onWheelScroll, this);
          this._delta = 0;
        },
        removeHooks: function() {
          off(this._map._container, "wheel", this._onWheelScroll, this);
        },
        _onWheelScroll: function(e) {
          var delta = getWheelDelta(e);
          var debounce = this._map.options.wheelDebounceTime;
          this._delta += delta;
          this._lastMousePos = this._map.mouseEventToContainerPoint(e);
          if (!this._startTime) {
            this._startTime = +/* @__PURE__ */ new Date();
          }
          var left = Math.max(debounce - (+/* @__PURE__ */ new Date() - this._startTime), 0);
          clearTimeout(this._timer);
          this._timer = setTimeout(bind(this._performZoom, this), left);
          stop(e);
        },
        _performZoom: function() {
          var map = this._map, zoom2 = map.getZoom(), snap = this._map.options.zoomSnap || 0;
          map._stop();
          var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4), d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2, d4 = snap ? Math.ceil(d3 / snap) * snap : d3, delta = map._limitZoom(zoom2 + (this._delta > 0 ? d4 : -d4)) - zoom2;
          this._delta = 0;
          this._startTime = null;
          if (!delta) {
            return;
          }
          if (map.options.scrollWheelZoom === "center") {
            map.setZoom(zoom2 + delta);
          } else {
            map.setZoomAround(this._lastMousePos, zoom2 + delta);
          }
        }
      });
      Map2.addInitHook("addHandler", "scrollWheelZoom", ScrollWheelZoom);
      var tapHoldDelay = 600;
      Map2.mergeOptions({
        // @section Touch interaction options
        // @option tapHold: Boolean
        // Enables simulation of `contextmenu` event, default is `true` for mobile Safari.
        tapHold: Browser.touchNative && Browser.safari && Browser.mobile,
        // @option tapTolerance: Number = 15
        // The max number of pixels a user can shift his finger during touch
        // for it to be considered a valid tap.
        tapTolerance: 15
      });
      var TapHold = Handler.extend({
        addHooks: function() {
          on(this._map._container, "touchstart", this._onDown, this);
        },
        removeHooks: function() {
          off(this._map._container, "touchstart", this._onDown, this);
        },
        _onDown: function(e) {
          clearTimeout(this._holdTimeout);
          if (e.touches.length !== 1) {
            return;
          }
          var first = e.touches[0];
          this._startPos = this._newPos = new Point(first.clientX, first.clientY);
          this._holdTimeout = setTimeout(bind(function() {
            this._cancel();
            if (!this._isTapValid()) {
              return;
            }
            on(document, "touchend", preventDefault);
            on(document, "touchend touchcancel", this._cancelClickPrevent);
            this._simulateEvent("contextmenu", first);
          }, this), tapHoldDelay);
          on(document, "touchend touchcancel contextmenu", this._cancel, this);
          on(document, "touchmove", this._onMove, this);
        },
        _cancelClickPrevent: function cancelClickPrevent() {
          off(document, "touchend", preventDefault);
          off(document, "touchend touchcancel", cancelClickPrevent);
        },
        _cancel: function() {
          clearTimeout(this._holdTimeout);
          off(document, "touchend touchcancel contextmenu", this._cancel, this);
          off(document, "touchmove", this._onMove, this);
        },
        _onMove: function(e) {
          var first = e.touches[0];
          this._newPos = new Point(first.clientX, first.clientY);
        },
        _isTapValid: function() {
          return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
        },
        _simulateEvent: function(type, e) {
          var simulatedEvent = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            // detail: 1,
            screenX: e.screenX,
            screenY: e.screenY,
            clientX: e.clientX,
            clientY: e.clientY
            // button: 2,
            // buttons: 2
          });
          simulatedEvent._simulated = true;
          e.target.dispatchEvent(simulatedEvent);
        }
      });
      Map2.addInitHook("addHandler", "tapHold", TapHold);
      Map2.mergeOptions({
        // @section Touch interaction options
        // @option touchZoom: Boolean|String = *
        // Whether the map can be zoomed by touch-dragging with two fingers. If
        // passed `'center'`, it will zoom to the center of the view regardless of
        // where the touch events (fingers) were. Enabled for touch-capable web
        // browsers.
        touchZoom: Browser.touch,
        // @option bounceAtZoomLimits: Boolean = true
        // Set it to false if you don't want the map to zoom beyond min/max zoom
        // and then bounce back when pinch-zooming.
        bounceAtZoomLimits: true
      });
      var TouchZoom = Handler.extend({
        addHooks: function() {
          addClass(this._map._container, "leaflet-touch-zoom");
          on(this._map._container, "touchstart", this._onTouchStart, this);
        },
        removeHooks: function() {
          removeClass(this._map._container, "leaflet-touch-zoom");
          off(this._map._container, "touchstart", this._onTouchStart, this);
        },
        _onTouchStart: function(e) {
          var map = this._map;
          if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) {
            return;
          }
          var p1 = map.mouseEventToContainerPoint(e.touches[0]), p2 = map.mouseEventToContainerPoint(e.touches[1]);
          this._centerPoint = map.getSize()._divideBy(2);
          this._startLatLng = map.containerPointToLatLng(this._centerPoint);
          if (map.options.touchZoom !== "center") {
            this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
          }
          this._startDist = p1.distanceTo(p2);
          this._startZoom = map.getZoom();
          this._moved = false;
          this._zooming = true;
          map._stop();
          on(document, "touchmove", this._onTouchMove, this);
          on(document, "touchend touchcancel", this._onTouchEnd, this);
          preventDefault(e);
        },
        _onTouchMove: function(e) {
          if (!e.touches || e.touches.length !== 2 || !this._zooming) {
            return;
          }
          var map = this._map, p1 = map.mouseEventToContainerPoint(e.touches[0]), p2 = map.mouseEventToContainerPoint(e.touches[1]), scale2 = p1.distanceTo(p2) / this._startDist;
          this._zoom = map.getScaleZoom(scale2, this._startZoom);
          if (!map.options.bounceAtZoomLimits && (this._zoom < map.getMinZoom() && scale2 < 1 || this._zoom > map.getMaxZoom() && scale2 > 1)) {
            this._zoom = map._limitZoom(this._zoom);
          }
          if (map.options.touchZoom === "center") {
            this._center = this._startLatLng;
            if (scale2 === 1) {
              return;
            }
          } else {
            var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
            if (scale2 === 1 && delta.x === 0 && delta.y === 0) {
              return;
            }
            this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
          }
          if (!this._moved) {
            map._moveStart(true, false);
            this._moved = true;
          }
          cancelAnimFrame(this._animRequest);
          var moveFn = bind(map._move, map, this._center, this._zoom, { pinch: true, round: false }, void 0);
          this._animRequest = requestAnimFrame(moveFn, this, true);
          preventDefault(e);
        },
        _onTouchEnd: function() {
          if (!this._moved || !this._zooming) {
            this._zooming = false;
            return;
          }
          this._zooming = false;
          cancelAnimFrame(this._animRequest);
          off(document, "touchmove", this._onTouchMove, this);
          off(document, "touchend touchcancel", this._onTouchEnd, this);
          if (this._map.options.zoomAnimation) {
            this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
          } else {
            this._map._resetView(this._center, this._map._limitZoom(this._zoom));
          }
        }
      });
      Map2.addInitHook("addHandler", "touchZoom", TouchZoom);
      Map2.BoxZoom = BoxZoom;
      Map2.DoubleClickZoom = DoubleClickZoom;
      Map2.Drag = Drag;
      Map2.Keyboard = Keyboard;
      Map2.ScrollWheelZoom = ScrollWheelZoom;
      Map2.TapHold = TapHold;
      Map2.TouchZoom = TouchZoom;
      exports2.Bounds = Bounds;
      exports2.Browser = Browser;
      exports2.CRS = CRS;
      exports2.Canvas = Canvas;
      exports2.Circle = Circle;
      exports2.CircleMarker = CircleMarker;
      exports2.Class = Class;
      exports2.Control = Control;
      exports2.DivIcon = DivIcon;
      exports2.DivOverlay = DivOverlay;
      exports2.DomEvent = DomEvent;
      exports2.DomUtil = DomUtil;
      exports2.Draggable = Draggable;
      exports2.Evented = Evented;
      exports2.FeatureGroup = FeatureGroup;
      exports2.GeoJSON = GeoJSON;
      exports2.GridLayer = GridLayer;
      exports2.Handler = Handler;
      exports2.Icon = Icon;
      exports2.ImageOverlay = ImageOverlay;
      exports2.LatLng = LatLng;
      exports2.LatLngBounds = LatLngBounds;
      exports2.Layer = Layer;
      exports2.LayerGroup = LayerGroup;
      exports2.LineUtil = LineUtil;
      exports2.Map = Map2;
      exports2.Marker = Marker;
      exports2.Mixin = Mixin;
      exports2.Path = Path;
      exports2.Point = Point;
      exports2.PolyUtil = PolyUtil;
      exports2.Polygon = Polygon;
      exports2.Polyline = Polyline;
      exports2.Popup = Popup;
      exports2.PosAnimation = PosAnimation;
      exports2.Projection = index;
      exports2.Rectangle = Rectangle;
      exports2.Renderer = Renderer;
      exports2.SVG = SVG;
      exports2.SVGOverlay = SVGOverlay;
      exports2.TileLayer = TileLayer;
      exports2.Tooltip = Tooltip;
      exports2.Transformation = Transformation;
      exports2.Util = Util;
      exports2.VideoOverlay = VideoOverlay;
      exports2.bind = bind;
      exports2.bounds = toBounds;
      exports2.canvas = canvas;
      exports2.circle = circle;
      exports2.circleMarker = circleMarker;
      exports2.control = control;
      exports2.divIcon = divIcon;
      exports2.extend = extend;
      exports2.featureGroup = featureGroup;
      exports2.geoJSON = geoJSON;
      exports2.geoJson = geoJson;
      exports2.gridLayer = gridLayer;
      exports2.icon = icon;
      exports2.imageOverlay = imageOverlay;
      exports2.latLng = toLatLng;
      exports2.latLngBounds = toLatLngBounds;
      exports2.layerGroup = layerGroup;
      exports2.map = createMap;
      exports2.marker = marker;
      exports2.point = toPoint;
      exports2.polygon = polygon;
      exports2.polyline = polyline;
      exports2.popup = popup;
      exports2.rectangle = rectangle;
      exports2.setOptions = setOptions;
      exports2.stamp = stamp;
      exports2.svg = svg;
      exports2.svgOverlay = svgOverlay;
      exports2.tileLayer = tileLayer;
      exports2.tooltip = tooltip;
      exports2.transformation = toTransformation;
      exports2.version = version;
      exports2.videoOverlay = videoOverlay;
      var oldL = window.L;
      exports2.noConflict = function() {
        window.L = oldL;
        return this;
      };
      window.L = exports2;
    }));
  }
});

// src/radarwise-card.js
var CARD_VERSION = "0.8.18";
var FORECAST_REFRESH_MS = 15 * 60 * 1e3;
var ENVIRONMENT_REFRESH_MS = 60 * 60 * 1e3;
var CARD_TYPES = ["radarwise-card", "radar-wise-card", "weatherwise-card", "weather-wise-card"];
var RADARWISE_COUNTRIES = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  au: "Australia",
  global: "Global / other"
};
var RADARWISE_RADAR = {
  auto: "Auto",
  noaa: "US NOAA radar",
  envcanada: "Environment Canada radar",
  bom: "Australia BOM radar",
  rainviewer: "RainViewer global radar",
  none: "No radar"
};
var RADARWISE_RADAR_STYLES = {
  standard: "Standard",
  vivid: "High contrast",
  soft: "Soft"
};
var RADARWISE_BASEMAPS = {
  light: "Light map",
  dark: "Dark map",
  osm: "Street map"
};
var RADARWISE_RADAR_TIMELINES = {
  loop: "Recent loop",
  latest: "Current frame",
  future: "Future if available"
};
var RADARWISE_ENVIRONMENT_SOURCES = {
  sensors: "Home Assistant sensors",
  open_meteo: "Open-Meteo, no API key",
  disabled: "Disabled"
};
var RADARWISE_FORECAST_MODES = {
  auto: "Automatic (twice-daily first)",
  daily: "Daily",
  twice_daily: "Twice daily"
};
var RADARWISE_LAYOUTS = {
  auto: "Auto",
  wide_panel: "Wide panel",
  stacked: "Stacked",
  compact: "Compact",
  radar_bottom: "Radar bottom"
};
var RADARWISE_CONTENT_MODES = {
  full: "Full dashboard",
  essentials: "Essentials",
  forecast: "Forecast only",
  timeline: "Hourly only",
  radar: "Radar only",
  custom: "Custom"
};
var RADARWISE_DENSITIES = {
  comfortable: "Comfortable",
  slim: "Slim",
  large: "Large"
};
var RADARWISE_TIME_FORMATS = {
  auto: "Auto",
  "12": "12-hour",
  "24": "24-hour"
};
var RADARWISE_TIME_ZONE_MODES = {
  browser: "Browser / device",
  home_assistant: "Home Assistant location",
  custom: "Custom IANA time zone"
};
var RADARWISE_FONT_FAMILIES = {
  auto: "Home Assistant",
  system: "System",
  rounded: "Rounded",
  condensed: "Condensed",
  mono: "Monospace"
};
var RADARWISE_FONT_STACKS = {
  auto: 'var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif)',
  system: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif',
  rounded: '"SF Pro Rounded","Arial Rounded MT Bold","Segoe UI",Roboto,Arial,sans-serif',
  condensed: '"Aptos Narrow","Arial Narrow","Roboto Condensed","Segoe UI",Roboto,Arial,sans-serif',
  mono: '"SFMono-Regular","Cascadia Mono",Consolas,"Liberation Mono",monospace'
};
var BOM_WMTS_BASE = "https://api.bom.gov.au/apikey/v1/mapping/timeseries/wmts";
var BOM_GIF_HOST = "https://reg.bom.gov.au";
var BOM_WMTS_LAYER = {
  id: "atm_surf_air_precip_reflectivity_dbz",
  matrixSet: "GoogleMapsCompatible_BoM",
  stepMinutes: 5,
  lagMinutes: 10
};
var BOM_BASEMAPS = {
  default: "https://api.bom.gov.au/apikey/v1/mapping/basemaps/basemap_default/MapServer/tile/{z}/{y}/{x}?blankTile=false",
  dark: "https://api.bom.gov.au/apikey/v1/mapping/basemaps/basemap_dark/MapServer/tile/{z}/{y}/{x}?blankTile=false"
};
var BOM_HALF_EXTENT = 20037508342789244e-9;
var BOM_WORLD_EXTENT = BOM_HALF_EXTENT * 2;
var BOM_MAX_NATIVE_ZOOM = 8;
var BOM_MAX_DISPLAY_ZOOM = 10;
var RAINVIEWER_MAX_NATIVE_ZOOM = 7;
var RAINVIEWER_MAX_DISPLAY_ZOOM = 12;
var BOM_AUSTRALIA_BOUNDS = [[-45.5, 108], [-8, 158]];
var BOM_LEGACY_FRAME_COUNT = 7;
var BOM_TILE_MATRIX_SETS = {
  GoogleMapsCompatible_BoM: [
    { z: 0, tlx: 11584952, tly: 34168990685578e-6, w: 1, h: 1 },
    { z: 1, tlx: 11584952, tly: 14131482342789e-6, w: 1, h: 1 },
    { z: 2, tlx: 11584952, tly: 4112728171395e-6, w: 1, h: 1 },
    { z: 3, tlx: 11584952, tly: 4112728171395e-6, w: 2, h: 2 },
    { z: 4, tlx: 11584952, tly: 1608039628546e-6, w: 3, h: 3 },
    { z: 5, tlx: 11584952, tly: 355695.357122, w: 6, h: 5 },
    { z: 6, tlx: 11584952, tly: -270476.778591, w: 11, h: 9 },
    { z: 7, tlx: 11584952, tly: -583562.846447, w: 22, h: 17 },
    { z: 8, tlx: 11584952, tly: -740105.880375, w: 43, h: 33 }
  ]
};
var TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
var BOM_RADARS = [
  { id: "IDR643", name: "Adelaide (Buckland Park)", lat: -34.617, lon: 138.469 },
  { id: "IDR463", name: "Adelaide (Sellicks Hill)", lat: -35.33, lon: 138.5 },
  { id: "IDR333", name: "Ceduna", lat: -32.13, lon: 133.7 },
  { id: "IDR143", name: "Mount Gambier", lat: -37.75, lon: 140.77 },
  { id: "IDR273", name: "Woomera", lat: -31.16, lon: 136.8 },
  { id: "IDR713", name: "Sydney (Terrey Hills)", lat: -33.701, lon: 151.21 },
  { id: "IDR043", name: "Newcastle", lat: -32.73, lon: 152.027 },
  { id: "IDR033", name: "Wollongong (Appin)", lat: -34.264, lon: 150.874 },
  { id: "IDR403", name: "Canberra (Captains Flat)", lat: -35.66, lon: 149.51 },
  { id: "IDR283", name: "Grafton", lat: -29.62, lon: 152.97 },
  { id: "IDR533", name: "Moree", lat: -29.5, lon: 149.85 },
  { id: "IDR693", name: "Namoi (Blackjack Mountain)", lat: -31.024, lon: 150.1915 },
  { id: "IDR553", name: "Wagga Wagga", lat: -35.17, lon: 147.47 },
  { id: "IDR943", name: "Hillston", lat: -33.55, lon: 145.52 },
  { id: "IDR963", name: "Yeoval", lat: -32.74, lon: 148.7 },
  { id: "IDR933", name: "Brewarrina", lat: -29.96, lon: 146.81 },
  { id: "IDR023", name: "Melbourne", lat: -37.852, lon: 144.752 },
  { id: "IDR973", name: "Mildura", lat: -34.28, lon: 141.59 },
  { id: "IDR683", name: "Bairnsdale", lat: -37.89, lon: 147.56 },
  { id: "IDR953", name: "Rainbow", lat: -35.99, lon: 142.01 },
  { id: "IDR493", name: "Yarrawonga", lat: -36.03, lon: 146.03 },
  { id: "IDR663", name: "Brisbane (Mt Stapylton)", lat: -27.718, lon: 153.24 },
  { id: "IDR503", name: "Brisbane (Marburg)", lat: -27.61, lon: 152.54 },
  { id: "IDR1083", name: "Toowoomba", lat: -27.274, lon: 151.993 },
  { id: "IDR193", name: "Cairns", lat: -16.82, lon: 145.68 },
  { id: "IDR243", name: "Bowen", lat: -19.88, lon: 148.08 },
  { id: "IDR723", name: "Emerald", lat: -23.5494, lon: 148.2392 },
  { id: "IDR233", name: "Gladstone", lat: -23.86, lon: 151.26 },
  { id: "IDR743", name: "Greenvale", lat: -18.99, lon: 144.99 },
  { id: "IDR083", name: "Gympie", lat: -25.957, lon: 152.577 },
  { id: "IDR563", name: "Longreach", lat: -23.43, lon: 144.29 },
  { id: "IDR223", name: "Mackay", lat: -21.12, lon: 149.22 },
  { id: "IDR363", name: "Mornington Island", lat: -16.67, lon: 139.17 },
  { id: "IDR753", name: "Mount Isa", lat: -20.7114, lon: 139.5553 },
  { id: "IDR1073", name: "Richmond", lat: -20.75, lon: 143.14 },
  { id: "IDR983", name: "Taroom", lat: -25.696, lon: 149.898 },
  { id: "IDR673", name: "Warrego", lat: -26.44, lon: 147.35 },
  { id: "IDR783", name: "Weipa", lat: -12.67, lon: 141.92 },
  { id: "IDR413", name: "Willis Island", lat: -16.288, lon: 149.965 },
  { id: "IDR703", name: "Perth (Serpentine)", lat: -32.39, lon: 115.87 },
  { id: "IDR263", name: "Perth Airport", lat: -31.93, lon: 115.98 },
  { id: "IDR313", name: "Albany", lat: -34.94, lon: 117.8 },
  { id: "IDR173", name: "Broome", lat: -17.95, lon: 122.23 },
  { id: "IDR1143", name: "Carnarvon", lat: -24.88, lon: 113.67 },
  { id: "IDR153", name: "Dampier", lat: -20.65, lon: 116.69 },
  { id: "IDR583", name: "South Doodlakine", lat: -31.78, lon: 117.95 },
  { id: "IDR323", name: "Esperance", lat: -33.83, lon: 121.89 },
  { id: "IDR063", name: "Geraldton", lat: -28.8, lon: 114.7 },
  { id: "IDR443", name: "Giles", lat: -25.03, lon: 128.3 },
  { id: "IDR393", name: "Halls Creek", lat: -18.23, lon: 127.66 },
  { id: "IDR483", name: "Kalgoorlie-Boulder", lat: -30.79, lon: 121.45 },
  { id: "IDR1113", name: "Karratha", lat: -20.99, lon: 116.87 },
  { id: "IDR293", name: "Learmonth", lat: -22.1, lon: 114 },
  { id: "IDR383", name: "Newdegate", lat: -33.097, lon: 119.009 },
  { id: "IDR163", name: "Port Hedland", lat: -20.37, lon: 118.63 },
  { id: "IDR793", name: "Watheroo", lat: -30.36, lon: 116.29 },
  { id: "IDR073", name: "Wyndham", lat: -15.45, lon: 128.12 },
  { id: "IDR763", name: "Hobart (Mt Koonya)", lat: -43.1122, lon: 147.8061 },
  { id: "IDR523", name: "West Takone", lat: -41.181, lon: 145.579 },
  { id: "IDR373", name: "Hobart Airport", lat: -42.83, lon: 147.51 },
  { id: "IDR633", name: "Darwin (Berrimah)", lat: -12.46, lon: 130.93 },
  { id: "IDR253", name: "Alice Springs", lat: -23.82, lon: 133.9 },
  { id: "IDR1123", name: "Gove", lat: -12.27, lon: 136.82 },
  { id: "IDR423", name: "Katherine", lat: -14.51, lon: 132.45 },
  { id: "IDR773", name: "Warruwi", lat: -11.6494, lon: 133.382 }
];
var RADARWISE_LANGUAGES = {
  auto: "Auto",
  en: "English",
  fr: "Fran\xE7ais",
  es: "Espa\xF1ol",
  de: "Deutsch",
  pt: "Portugu\xEAs",
  nl: "Nederlands"
};
var RADARWISE_TEXT = {
  en: {
    am: "AM",
    pm: "PM",
    currentWeather: "Current Weather",
    selectWeatherEntity: "Select a weather entity",
    connectWeather: "Connect weather in Home Assistant",
    openEditor: "Open the card editor to finish setup",
    waitingLive: "Waiting for live weather data",
    updated: "Updated",
    forecast: "Forecast",
    daily: "Daily",
    hourly: "Hourly",
    dayPeriod: "Day",
    nightPeriod: "Night",
    humidity: "Humidity",
    dewPoint: "Dew Point",
    airQuality: "Air Quality",
    uvIndex: "UV Index",
    pollen: "Pollen",
    treePollen: "Tree Pollen",
    grassPollen: "Grass Pollen",
    weedPollen: "Weed Pollen",
    moldPollen: "Mold",
    good: "Good",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    veryHigh: "Very High",
    unhealthySensitive: "Unhealthy for Sensitive Groups",
    unhealthy: "Unhealthy",
    veryUnhealthy: "Very Unhealthy",
    hazardous: "Hazardous",
    extreme: "Extreme",
    wind: "Wind",
    sunrise: "Sunrise",
    sunset: "Sunset",
    waitingForecast: "Waiting for Home Assistant forecast data.",
    relativeTemp: "Relative temperature within the visible forecast rows",
    radarLoading: "Radar loading...",
    radarUnavailable: "Radar unavailable",
    radarWaiting: "Radar waiting for dashboard layout",
    rainviewerUnavailable: "RainViewer radar unavailable",
    currentRadar: "current radar",
    radarLoop: "radar loop",
    futureRadar: "future radar",
    previousRadarFrame: "Previous radar frame",
    nextRadarFrame: "Next radar frame",
    pauseRadarLoop: "Pause radar loop",
    playRadarLoop: "Play radar loop",
    weatherAlert: "Weather alert",
    activeWeatherAlert: "active weather alert",
    nwsAlertTap: "NWS alert - tap for details",
    nwsAlertsTap: "NWS alerts - tap for details",
    severity: "Severity",
    unknown: "Unknown",
    forecastIntro: "Forecast",
    currently: "currently",
    withHigh: "with a high near {temp}",
    chancePrecip: "and a {chance}% chance of precipitation",
    tonight: "Tonight will be {condition}",
    withLow: "with a low near {temp}",
    tomorrow: "Tomorrow will be {condition}",
    nearTemp: "near {temp}",
    conditions: {
      sunny: "sunny",
      "clear night": "clear",
      "partly cloudy": "partly cloudy",
      cloudy: "cloudy",
      rainy: "rainy",
      pouring: "heavy rain",
      lightning: "thunderstorms possible",
      "lightning rainy": "thunderstorms possible",
      snowy: "snowy",
      "snowy rainy": "mixed wintry precipitation",
      fog: "foggy",
      windy: "windy",
      "windy variant": "windy with clouds",
      unavailable: "unavailable"
    }
  },
  fr: {
    am: "AM",
    pm: "PM",
    currentWeather: "M\xE9t\xE9o actuelle",
    selectWeatherEntity: "S\xE9lectionnez une entit\xE9 m\xE9t\xE9o",
    connectWeather: "Connectez la m\xE9t\xE9o dans Home Assistant",
    openEditor: "Ouvrez l'\xE9diteur de carte pour terminer",
    waitingLive: "En attente des donn\xE9es m\xE9t\xE9o en direct",
    updated: "Mis \xE0 jour",
    forecast: "Pr\xE9visions",
    daily: "Quotidien",
    hourly: "Heure par heure",
    dayPeriod: "Jour",
    nightPeriod: "Nuit",
    humidity: "Humidit\xE9",
    dewPoint: "Point de ros\xE9e",
    airQuality: "Qualite de l'air",
    uvIndex: "Indice UV",
    pollen: "Pollen",
    treePollen: "Pollen des arbres",
    grassPollen: "Pollen de graminees",
    weedPollen: "Pollen de mauvaises herbes",
    moldPollen: "Moisissures",
    good: "Bon",
    low: "Faible",
    moderate: "Modere",
    high: "Eleve",
    veryHigh: "Tres eleve",
    unhealthySensitive: "Mauvais pour les personnes sensibles",
    unhealthy: "Mauvais",
    veryUnhealthy: "Tres mauvais",
    hazardous: "Dangereux",
    extreme: "Extreme",
    wind: "Vent",
    sunrise: "Lever du soleil",
    sunset: "Coucher du soleil",
    waitingForecast: "En attente des pr\xE9visions Home Assistant.",
    relativeTemp: "Temp\xE9rature relative dans les lignes de pr\xE9vision visibles",
    radarLoading: "Chargement du radar...",
    radarUnavailable: "Radar indisponible",
    radarWaiting: "Le radar attend la mise en page du tableau de bord",
    rainviewerUnavailable: "Radar RainViewer indisponible",
    currentRadar: "radar actuel",
    radarLoop: "boucle radar",
    futureRadar: "radar futur",
    previousRadarFrame: "Image radar pr\xE9c\xE9dente",
    nextRadarFrame: "Image radar suivante",
    pauseRadarLoop: "Mettre la boucle radar en pause",
    playRadarLoop: "Lancer la boucle radar",
    weatherAlert: "Alerte m\xE9t\xE9o",
    activeWeatherAlert: "alerte m\xE9t\xE9o active",
    nwsAlertTap: "alerte NWS - toucher pour les d\xE9tails",
    nwsAlertsTap: "alertes NWS - toucher pour les d\xE9tails",
    severity: "Gravit\xE9",
    unknown: "Inconnue",
    forecastIntro: "Pr\xE9visions",
    currently: "actuellement",
    withHigh: "avec un maximum pr\xE8s de {temp}",
    chancePrecip: "et {chance} % de risque de pr\xE9cipitations",
    tonight: "Ce soir, le temps sera {condition}",
    withLow: "avec un minimum pr\xE8s de {temp}",
    tomorrow: "Demain, le temps sera {condition}",
    nearTemp: "pr\xE8s de {temp}",
    conditions: {
      sunny: "ensoleill\xE9",
      "clear night": "d\xE9gag\xE9",
      "partly cloudy": "partiellement nuageux",
      cloudy: "nuageux",
      rainy: "pluvieux",
      pouring: "forte pluie",
      lightning: "orages possibles",
      "lightning rainy": "orages possibles",
      snowy: "neigeux",
      "snowy rainy": "pr\xE9cipitations hivernales mixtes",
      fog: "brumeux",
      windy: "venteux",
      "windy variant": "venteux avec des nuages",
      unavailable: "indisponible"
    }
  },
  es: {
    am: "a. m.",
    pm: "p. m.",
    currentWeather: "Tiempo actual",
    selectWeatherEntity: "Selecciona una entidad meteorol\xF3gica",
    connectWeather: "Conecta el tiempo en Home Assistant",
    openEditor: "Abre el editor de la tarjeta para terminar",
    waitingLive: "Esperando datos meteorol\xF3gicos en vivo",
    updated: "Actualizado",
    forecast: "Pron\xF3stico",
    daily: "Diario",
    hourly: "Por hora",
    dayPeriod: "D\xEDa",
    nightPeriod: "Noche",
    humidity: "Humedad",
    dewPoint: "Punto de roc\xEDo",
    airQuality: "Calidad del aire",
    uvIndex: "Indice UV",
    pollen: "Polen",
    treePollen: "Polen de arboles",
    grassPollen: "Polen de pastos",
    weedPollen: "Polen de malezas",
    moldPollen: "Moho",
    good: "Buena",
    low: "Bajo",
    moderate: "Moderado",
    high: "Alto",
    veryHigh: "Muy alto",
    unhealthySensitive: "Dano para grupos sensibles",
    unhealthy: "Dano",
    veryUnhealthy: "Muy danino",
    hazardous: "Peligroso",
    extreme: "Extremo",
    wind: "Viento",
    sunrise: "Amanecer",
    sunset: "Atardecer",
    waitingForecast: "Esperando datos de pron\xF3stico de Home Assistant.",
    relativeTemp: "Temperatura relativa en las filas de pron\xF3stico visibles",
    radarLoading: "Cargando radar...",
    radarUnavailable: "Radar no disponible",
    radarWaiting: "El radar espera el dise\xF1o del panel",
    rainviewerUnavailable: "Radar RainViewer no disponible",
    currentRadar: "radar actual",
    radarLoop: "bucle de radar",
    futureRadar: "radar futuro",
    previousRadarFrame: "Fotograma de radar anterior",
    nextRadarFrame: "Siguiente fotograma de radar",
    pauseRadarLoop: "Pausar bucle de radar",
    playRadarLoop: "Reproducir bucle de radar",
    weatherAlert: "Alerta meteorol\xF3gica",
    activeWeatherAlert: "alerta meteorol\xF3gica activa",
    nwsAlertTap: "alerta NWS - toca para ver detalles",
    nwsAlertsTap: "alertas NWS - toca para ver detalles",
    severity: "Severidad",
    unknown: "Desconocida",
    forecastIntro: "Pron\xF3stico",
    currently: "actualmente",
    withHigh: "con una m\xE1xima cerca de {temp}",
    chancePrecip: "y un {chance} % de probabilidad de precipitaci\xF3n",
    tonight: "Esta noche estar\xE1 {condition}",
    withLow: "con una m\xEDnima cerca de {temp}",
    tomorrow: "Ma\xF1ana estar\xE1 {condition}",
    nearTemp: "cerca de {temp}",
    conditions: {
      sunny: "soleado",
      "clear night": "despejado",
      "partly cloudy": "parcialmente nublado",
      cloudy: "nublado",
      rainy: "lluvioso",
      pouring: "lluvia intensa",
      lightning: "posibles tormentas",
      "lightning rainy": "posibles tormentas",
      snowy: "nevado",
      "snowy rainy": "precipitaci\xF3n invernal mixta",
      fog: "con niebla",
      windy: "ventoso",
      "windy variant": "ventoso con nubes",
      unavailable: "no disponible"
    }
  },
  de: {
    am: "AM",
    pm: "PM",
    currentWeather: "Aktuelles Wetter",
    selectWeatherEntity: "Wetter-Entit\xE4t ausw\xE4hlen",
    connectWeather: "Wetter in Home Assistant verbinden",
    openEditor: "Karteneditor \xF6ffnen, um die Einrichtung abzuschlie\xDFen",
    waitingLive: "Warte auf Live-Wetterdaten",
    updated: "Aktualisiert",
    forecast: "Vorhersage",
    daily: "T\xE4glich",
    hourly: "St\xFCndlich",
    dayPeriod: "Tag",
    nightPeriod: "Nacht",
    humidity: "Luftfeuchtigkeit",
    dewPoint: "Taupunkt",
    airQuality: "Luftqualitat",
    uvIndex: "UV-Index",
    pollen: "Pollen",
    treePollen: "Baumpollen",
    grassPollen: "Graspollen",
    weedPollen: "Krautpollen",
    moldPollen: "Schimmel",
    good: "Gut",
    low: "Niedrig",
    moderate: "Moderat",
    high: "Hoch",
    veryHigh: "Sehr hoch",
    unhealthySensitive: "Ungesund fur empfindliche Gruppen",
    unhealthy: "Ungesund",
    veryUnhealthy: "Sehr ungesund",
    hazardous: "Gefahrlich",
    extreme: "Extrem",
    wind: "Wind",
    sunrise: "Sonnenaufgang",
    sunset: "Sonnenuntergang",
    waitingForecast: "Warte auf Vorhersagedaten von Home Assistant.",
    relativeTemp: "Relative Temperatur in den sichtbaren Vorhersagezeilen",
    radarLoading: "Radar wird geladen...",
    radarUnavailable: "Radar nicht verf\xFCgbar",
    radarWaiting: "Radar wartet auf das Dashboard-Layout",
    rainviewerUnavailable: "RainViewer-Radar nicht verf\xFCgbar",
    currentRadar: "aktuelles Radar",
    radarLoop: "Radarschleife",
    futureRadar: "Zukunftsradar",
    previousRadarFrame: "Vorheriges Radarbild",
    nextRadarFrame: "N\xE4chstes Radarbild",
    pauseRadarLoop: "Radarschleife pausieren",
    playRadarLoop: "Radarschleife starten",
    weatherAlert: "Wetterwarnung",
    activeWeatherAlert: "aktive Wetterwarnung",
    nwsAlertTap: "NWS-Warnung - f\xFCr Details antippen",
    nwsAlertsTap: "NWS-Warnungen - f\xFCr Details antippen",
    severity: "Schweregrad",
    unknown: "Unbekannt",
    forecastIntro: "Vorhersage",
    currently: "derzeit",
    withHigh: "mit einem H\xF6chstwert um {temp}",
    chancePrecip: "und {chance} % Niederschlagswahrscheinlichkeit",
    tonight: "Heute Nacht wird es {condition}",
    withLow: "mit einem Tiefstwert um {temp}",
    tomorrow: "Morgen wird es {condition}",
    nearTemp: "um {temp}",
    conditions: {
      sunny: "sonnig",
      "clear night": "klar",
      "partly cloudy": "teilweise bew\xF6lkt",
      cloudy: "bew\xF6lkt",
      rainy: "regnerisch",
      pouring: "starker Regen",
      lightning: "Gewitter m\xF6glich",
      "lightning rainy": "Gewitter m\xF6glich",
      snowy: "verschneit",
      "snowy rainy": "gemischter winterlicher Niederschlag",
      fog: "neblig",
      windy: "windig",
      "windy variant": "windig mit Wolken",
      unavailable: "nicht verf\xFCgbar"
    }
  },
  pt: {
    am: "AM",
    pm: "PM",
    currentWeather: "Tempo atual",
    selectWeatherEntity: "Selecione uma entidade de meteorologia",
    connectWeather: "Ligue a meteorologia no Home Assistant",
    openEditor: "Abra o editor do cart\xE3o para terminar",
    waitingLive: "A aguardar dados meteorol\xF3gicos em direto",
    updated: "Atualizado",
    forecast: "Previs\xE3o",
    daily: "Di\xE1ria",
    hourly: "Por hora",
    dayPeriod: "Dia",
    nightPeriod: "Noite",
    humidity: "Humidade",
    dewPoint: "Ponto de orvalho",
    airQuality: "Qualidade do ar",
    uvIndex: "Indice UV",
    pollen: "Polen",
    treePollen: "Polen de arvores",
    grassPollen: "Polen de graminias",
    weedPollen: "Polen de ervas",
    moldPollen: "Bolor",
    good: "Boa",
    low: "Baixo",
    moderate: "Moderado",
    high: "Alto",
    veryHigh: "Muito alto",
    unhealthySensitive: "Mau para grupos sensiveis",
    unhealthy: "Mau",
    veryUnhealthy: "Muito mau",
    hazardous: "Perigoso",
    extreme: "Extremo",
    wind: "Vento",
    sunrise: "Nascer do sol",
    sunset: "P\xF4r do sol",
    waitingForecast: "A aguardar dados de previs\xE3o do Home Assistant.",
    relativeTemp: "Temperatura relativa nas linhas de previs\xE3o vis\xEDveis",
    radarLoading: "A carregar radar...",
    radarUnavailable: "Radar indispon\xEDvel",
    radarWaiting: "Radar \xE0 espera do layout do painel",
    rainviewerUnavailable: "Radar RainViewer indispon\xEDvel",
    currentRadar: "radar atual",
    radarLoop: "ciclo de radar",
    futureRadar: "radar futuro",
    previousRadarFrame: "Imagem de radar anterior",
    nextRadarFrame: "Pr\xF3xima imagem de radar",
    pauseRadarLoop: "Pausar ciclo de radar",
    playRadarLoop: "Reproduzir ciclo de radar",
    weatherAlert: "Alerta meteorol\xF3gico",
    activeWeatherAlert: "alerta meteorol\xF3gico ativo",
    nwsAlertTap: "alerta NWS - toque para detalhes",
    nwsAlertsTap: "alertas NWS - toque para detalhes",
    severity: "Severidade",
    unknown: "Desconhecida",
    forecastIntro: "Previs\xE3o",
    currently: "atualmente",
    withHigh: "com m\xE1xima perto de {temp}",
    chancePrecip: "e {chance}% de probabilidade de precipita\xE7\xE3o",
    tonight: "Hoje \xE0 noite estar\xE1 {condition}",
    withLow: "com m\xEDnima perto de {temp}",
    tomorrow: "Amanh\xE3 estar\xE1 {condition}",
    nearTemp: "perto de {temp}",
    conditions: {
      sunny: "ensolarado",
      "clear night": "limpo",
      "partly cloudy": "parcialmente nublado",
      cloudy: "nublado",
      rainy: "chuvoso",
      pouring: "chuva forte",
      lightning: "poss\xEDveis trovoadas",
      "lightning rainy": "poss\xEDveis trovoadas",
      snowy: "com neve",
      "snowy rainy": "precipita\xE7\xE3o invernal mista",
      fog: "com nevoeiro",
      windy: "ventoso",
      "windy variant": "ventoso com nuvens",
      unavailable: "indispon\xEDvel"
    }
  },
  nl: {
    am: "AM",
    pm: "PM",
    currentWeather: "Huidig weer",
    selectWeatherEntity: "Selecteer een weerentiteit",
    connectWeather: "Koppel weer in Home Assistant",
    openEditor: "Open de kaarteditor om de instelling te voltooien",
    waitingLive: "Wachten op live weergegevens",
    updated: "Bijgewerkt",
    forecast: "Verwachting",
    daily: "Dagelijks",
    hourly: "Per uur",
    dayPeriod: "Dag",
    nightPeriod: "Nacht",
    humidity: "Luchtvochtigheid",
    dewPoint: "Dauwpunt",
    airQuality: "Luchtkwaliteit",
    uvIndex: "UV-index",
    pollen: "Pollen",
    treePollen: "Boompollen",
    grassPollen: "Graspollen",
    weedPollen: "Onkruidpollen",
    moldPollen: "Schimmel",
    good: "Goed",
    low: "Laag",
    moderate: "Matig",
    high: "Hoog",
    veryHigh: "Zeer hoog",
    unhealthySensitive: "Ongezond voor gevoelige groepen",
    unhealthy: "Ongezond",
    veryUnhealthy: "Zeer ongezond",
    hazardous: "Gevaarlijk",
    extreme: "Extreem",
    wind: "Wind",
    sunrise: "Zonsopkomst",
    sunset: "Zonsondergang",
    waitingForecast: "Wachten op verwachtingsgegevens van Home Assistant.",
    relativeTemp: "Relatieve temperatuur binnen de zichtbare verwachtingsregels",
    radarLoading: "Radar laden...",
    radarUnavailable: "Radar niet beschikbaar",
    radarWaiting: "Radar wacht op dashboardindeling",
    rainviewerUnavailable: "RainViewer-radar niet beschikbaar",
    currentRadar: "huidige radar",
    radarLoop: "radarlus",
    futureRadar: "toekomstige radar",
    previousRadarFrame: "Vorig radarbeeld",
    nextRadarFrame: "Volgend radarbeeld",
    pauseRadarLoop: "Radarlus pauzeren",
    playRadarLoop: "Radarlus afspelen",
    weatherAlert: "Weerwaarschuwing",
    activeWeatherAlert: "actieve weerwaarschuwing",
    nwsAlertTap: "NWS-waarschuwing - tik voor details",
    nwsAlertsTap: "NWS-waarschuwingen - tik voor details",
    severity: "Ernst",
    unknown: "Onbekend",
    forecastIntro: "Verwachting",
    currently: "momenteel",
    withHigh: "met een maximum rond {temp}",
    chancePrecip: "en {chance}% kans op neerslag",
    tonight: "Vanavond wordt het {condition}",
    withLow: "met een minimum rond {temp}",
    tomorrow: "Morgen wordt het {condition}",
    nearTemp: "rond {temp}",
    conditions: {
      sunny: "zonnig",
      "clear night": "helder",
      "partly cloudy": "gedeeltelijk bewolkt",
      cloudy: "bewolkt",
      rainy: "regenachtig",
      pouring: "zware regen",
      lightning: "kans op onweer",
      "lightning rainy": "kans op onweer",
      snowy: "sneeuw",
      "snowy rainy": "winterse neerslag",
      fog: "mistig",
      windy: "winderig",
      "windy variant": "winderig met bewolking",
      unavailable: "niet beschikbaar"
    }
  }
};
function _wwEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
function isRadarWiseHumidityEntity(entityId, state) {
  if (!entityId) return false;
  const friendly = String(state?.attributes?.friendly_name || "").toLowerCase();
  const deviceClass = String(state?.attributes?.device_class || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  return deviceClass === "humidity" || id.includes("humidity") || friendly.includes("humidity");
}
function isRadarWiseTemperatureEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  return deviceClass === "temperature" || unit.includes("\xB0") || unit === "c" || unit === "f" || id.includes("temp") || friendly.includes("temp");
}
function isRadarWiseDewPointEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const looksLikeTemperature = deviceClass === "temperature" || unit.includes("\xB0") || unit === "c" || unit === "f";
  return id.includes("dew_point") || id.includes("dewpoint") || friendly.includes("dew point") || friendly.includes("dewpoint") || looksLikeTemperature && (id.includes("dew") || friendly.includes("dew"));
}
function isRadarWiseWindSpeedEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  const windish = haystack.includes("wind");
  const speedish = haystack.includes("speed") || haystack.includes("velocity") || haystack.includes("windspeed") || haystack.includes("wind_speed") || haystack.includes("wind speed") || deviceClass === "wind_speed" || ["mph", "mi/h", "km/h", "kmh", "kmph", "kph", "m/s", "ft/s", "kn", "kt", "knots", "bft"].includes(unit);
  const directionOnly = haystack.includes("direction") || haystack.includes("bearing") || haystack.includes("azimuth");
  return windish && speedish && !directionOnly || deviceClass === "wind_speed";
}
function isRadarWiseWindDirectionEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  const windish = haystack.includes("wind");
  const directionish = haystack.includes("direction") || haystack.includes("bearing") || haystack.includes("azimuth") || haystack.includes("heading") || haystack.includes("wind_dir") || haystack.includes("winddirection") || deviceClass === "wind_direction";
  const degreeish = unit.includes("deg") || unit.includes("\xB0") || unit === "degree" || unit === "degrees";
  return windish && (directionish || degreeish) || deviceClass === "wind_direction";
}
function isRadarWiseAirQualityEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  return haystack.includes("aqi") || haystack.includes("air_quality") || haystack.includes("air quality") || haystack.includes("pm2.5") || haystack.includes("pm25") || haystack.includes("pm_2_5") || haystack.includes("particulate");
}
function isRadarWiseUvIndexEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  return deviceClass === "uv_index" || haystack.includes("uv_index") || haystack.includes("uv index") || haystack.includes("ultraviolet") || haystack.includes(" uvi");
}
function isRadarWisePollenEntity(entityId, state, kind = "") {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  const pollenish = haystack.includes("pollen") || haystack.includes("allergy") || haystack.includes("allergen");
  if (!kind) return pollenish;
  const source = String(kind).toLowerCase();
  return pollenish && (haystack.includes(source) || haystack.includes(`${source}_pollen`) || haystack.includes(`${source} pollen`));
}
var RadarWiseCard = class extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:radarwise-card",
      entity: "weather.home",
      humidity_entity: "",
      temperature_entity: "",
      dew_point_entity: "",
      wind_speed_entity: "",
      wind_direction_entity: "",
      air_quality_entity: "",
      uv_index_entity: "",
      pollen_entity: "",
      tree_pollen_entity: "",
      grass_pollen_entity: "",
      weed_pollen_entity: "",
      mold_pollen_entity: "",
      environment_source: "sensors",
      title: "Local Weather",
      country: "us",
      radar_provider: "auto",
      theme_mode: "radarwise",
      units: "auto",
      language: "auto",
      time_zone_mode: "browser",
      time_zone: "",
      layout: "auto",
      content_mode: "full",
      density: "comfortable",
      card_height: "",
      card_max_height: "",
      hourly_count: 5,
      forecast_count: 5,
      forecast_mode: "auto",
      show_timeline: true,
      show_forecast: true,
      show_forecast_summary: true,
      show_humidity: true,
      show_dew_point: true,
      show_wind: true,
      show_sunrise: true,
      show_sunset: true,
      show_environment: true,
      show_custom_sensors: true,
      show_radar: true,
      show_map_controls: true,
      radar_controls: true,
      radar_style: "standard",
      radar_basemap: "light",
      radar_timeline: "loop",
      show_warning_overlay: true,
      show_animations: true,
      panel_order: ["clock", "weather", "radar"],
      column_widths: [25, 50, 25],
      timeline_autoscroll: false,
      custom_sensors: [],
      stack_below: 0,
      grid_options: {
        rows: "full",
        columns: 18
      }
    };
  }
  static getConfigElement() {
    return document.createElement("radarwise-card-editor");
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._forecasts = { hourly: [], daily: [], twice_daily: [] };
    this._forecastEntity = null;
    this._lastForecastLoad = 0;
    this._environmentData = null;
    this._environmentLastLoad = 0;
    this._environmentTimer = null;
    this._environmentKey = "";
    this._lastRenderKey = "";
    this._clockTimer = window.setInterval(() => this._updateClock(), 1e3);
    this._forecastRefreshTimer = null;
    this._radarTimer = null;
    this._radarReloadTimer = null;
    this._radarMap = null;
    this._radarLayers = [];
    this._warningLayer = null;
    this._warningPopupMarker = null;
    this._radarIndex = 0;
    this._radarPlaying = true;
    this._radarLabelText = "radar loop";
    this._radarProviderRendered = "";
    this._radarResizeObserver = null;
    this._bomTileErrorCount = 0;
    this._bomFallbackStarted = false;
    this._cardResizeObserver = null;
    this._timelineScrollRaf = null;
    this._timelineScrollRetryTimer = null;
    this._timelineScrollResizeObserver = null;
    this._timelineScrollObserved = null;
    this._timelineScrollDir = 1;
    this._timelineScrollPauseUntil = 0;
    this._timelineScrollLast = null;
  }
  connectedCallback() {
    if (!this._clockTimer) this._clockTimer = window.setInterval(() => this._updateClock(), 1e3);
    this._updateClock();
    this._ensureForecastRefreshTimer();
    this._ensureEnvironmentRefreshTimer();
    this._refreshEnvironmentIfStale();
    this._resumeRadarIfNeeded();
    if (this._config.timeline_autoscroll && this.shadowRoot?.querySelector(".hourly-left")) {
      this._scheduleTimelineScrollStart();
    }
  }
  disconnectedCallback() {
    window.clearInterval(this._clockTimer);
    this._clockTimer = null;
    window.clearInterval(this._forecastRefreshTimer);
    this._forecastRefreshTimer = null;
    window.clearInterval(this._environmentTimer);
    this._environmentTimer = null;
    this._teardownRadar();
    this._stopTimelineScroll();
    this._cardResizeObserver?.disconnect?.();
    this._cardResizeObserver = null;
  }
  setConfig(config) {
    const normalized = this._normalizeConfig(config || {});
    const previous = this._config || {};
    this._config = normalized;
    this.setAttribute("theme-mode", this._config.theme_mode);
    this.toggleAttribute("animations", this._config.show_animations !== false);
    if (previous.entity !== this._config.entity || previous.country !== this._config.country || previous.radar_provider !== this._config.radar_provider || previous.radar_style !== this._config.radar_style || previous.radar_basemap !== this._config.radar_basemap || previous.radar_timeline !== this._config.radar_timeline || previous.show_warning_overlay !== this._config.show_warning_overlay || previous.latitude !== this._config.latitude || previous.longitude !== this._config.longitude || previous.show_radar !== this._config.show_radar) {
      this._teardownRadar();
    }
    if (previous.environment_source !== this._config.environment_source || previous.show_environment !== this._config.show_environment || previous.latitude !== this._config.latitude || previous.longitude !== this._config.longitude) {
      this._resetEnvironmentData();
    }
    this._ensureEnvironmentRefreshTimer();
    this._refreshEnvironmentIfStale();
    this._lastRenderKey = "";
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    const entityId = this._config.entity;
    const now = Date.now();
    if (entityId && this._forecastEntity !== entityId) {
      this._forecasts = { hourly: [], daily: [], twice_daily: [] };
      this._forecastEntity = entityId;
      this._lastForecastLoad = 0;
      this._lastRenderKey = "";
    }
    this._ensureForecastRefreshTimer();
    this._ensureEnvironmentRefreshTimer();
    this._refreshEnvironmentIfStale();
    if (entityId && now - this._lastForecastLoad > 5 * 60 * 1e3) {
      this._lastForecastLoad = now;
      this._loadForecasts(entityId);
    }
    const key = this._renderKey();
    if (key !== this._lastRenderKey) {
      this._lastRenderKey = key;
      this._render();
    }
  }
  _ensureForecastRefreshTimer() {
    if (this._forecastRefreshTimer || !this.isConnected || !this._config.entity) return;
    this._forecastRefreshTimer = window.setInterval(() => this._refreshForecasts(), FORECAST_REFRESH_MS);
  }
  _refreshForecasts() {
    if (!this._hass || !this._config.entity) return;
    this._lastForecastLoad = Date.now();
    this._loadForecasts(this._config.entity);
  }
  _environmentEnabled() {
    return this._config.show_environment !== false && this._config.environment_source === "open_meteo";
  }
  _ensureEnvironmentRefreshTimer() {
    if (!this._environmentEnabled()) {
      window.clearInterval(this._environmentTimer);
      this._environmentTimer = null;
      return;
    }
    if (this._environmentTimer || !this.isConnected) return;
    this._environmentTimer = window.setInterval(() => this._refreshEnvironmentIfStale(true), ENVIRONMENT_REFRESH_MS);
  }
  _resetEnvironmentData() {
    this._environmentData = null;
    this._environmentLastLoad = 0;
    this._environmentKey = "";
    window.clearInterval(this._environmentTimer);
    this._environmentTimer = null;
  }
  _refreshEnvironmentIfStale(force = false) {
    if (!this._environmentEnabled()) return;
    const { lat, lon } = this._latLon();
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    const now = Date.now();
    if (!force && this._environmentKey === key && now - this._environmentLastLoad < ENVIRONMENT_REFRESH_MS) return;
    this._environmentKey = key;
    this._environmentLastLoad = now;
    this._loadOpenMeteoEnvironment(lat, lon, key);
  }
  async _loadOpenMeteoEnvironment(lat, lon, requestKey = "") {
    const [airQualityResult, uvResult] = await Promise.allSettled([
      this._fetchOpenMeteoAirQuality(lat, lon),
      this._fetchOpenMeteoUv(lat, lon)
    ]);
    if (requestKey && this._environmentKey && requestKey !== this._environmentKey) return;
    const next = { source: "open_meteo", loaded: Date.now() };
    const errors = [];
    if (airQualityResult.status === "fulfilled") Object.assign(next, this._normalizeOpenMeteoEnvironment(airQualityResult.value));
    else errors.push(airQualityResult.reason?.message || "Open-Meteo air quality unavailable");
    if (uvResult.status === "fulfilled") next.uv = this._normalizeOpenMeteoUv(uvResult.value);
    else errors.push(uvResult.reason?.message || "Open-Meteo UV unavailable");
    if (errors.length) next.error = errors.join("; ");
    this._environmentData = next;
    this._lastRenderKey = "";
    this._render();
  }
  async _fetchOpenMeteoAirQuality(lat, lon) {
    const variables = [
      "us_aqi",
      "european_aqi",
      "pm2_5",
      "pm10",
      "alder_pollen",
      "birch_pollen",
      "grass_pollen",
      "mugwort_pollen",
      "olive_pollen",
      "ragweed_pollen"
    ].join(",");
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: variables,
      timezone: "auto"
    });
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Open-Meteo air quality returned ${response.status}`);
    return response.json();
  }
  async _fetchOpenMeteoUv(lat, lon) {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "uv_index",
      hourly: "uv_index",
      forecast_hours: "24",
      timezone: "auto"
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Open-Meteo UV returned ${response.status}`);
    return response.json();
  }
  _normalizeOpenMeteoEnvironment(data) {
    const current = data?.current || {};
    const units = data?.current_units || {};
    const numberFor = (key) => this._numberOr(current[key], NaN);
    const aqiValue = Number.isFinite(numberFor("us_aqi")) ? numberFor("us_aqi") : numberFor("european_aqi");
    const aqiUnit = Number.isFinite(numberFor("us_aqi")) ? units.us_aqi || "AQI" : units.european_aqi || "AQI";
    const pollenGroups = [
      { labelKey: "treePollen", keys: ["alder_pollen", "birch_pollen", "olive_pollen"] },
      { labelKey: "grassPollen", keys: ["grass_pollen"] },
      { labelKey: "weedPollen", keys: ["mugwort_pollen", "ragweed_pollen"] }
    ].map((group) => {
      const sources = group.keys.map((key) => ({
        key,
        value: numberFor(key),
        unit: units[key] || "grains/m3"
      })).filter((source) => Number.isFinite(source.value));
      const strongest = sources.sort((a, b) => b.value - a.value)[0] || null;
      return strongest ? {
        labelKey: group.labelKey,
        key: strongest.key,
        value: strongest.value,
        unit: strongest.unit,
        sources
      } : null;
    }).filter(Boolean);
    const strongestPollen = pollenGroups.sort((a, b) => b.value - a.value)[0] || null;
    const pollenResult = strongestPollen && strongestPollen.value > 0 ? strongestPollen : pollenGroups.length ? {
      labelKey: "pollen",
      key: "none",
      value: 0,
      unit: pollenGroups[0].unit || "grains/m3",
      sources: pollenGroups
    } : null;
    return {
      source: "open_meteo",
      loaded: Date.now(),
      aqi: Number.isFinite(aqiValue) ? {
        value: aqiValue,
        unit: aqiUnit || "AQI",
        pm25: numberFor("pm2_5"),
        pm10: numberFor("pm10")
      } : null,
      pollen: pollenResult ? {
        value: pollenResult.value,
        unit: pollenResult.unit,
        labelKey: pollenResult.labelKey,
        key: pollenResult.key,
        sources: pollenResult.sources
      } : null
    };
  }
  _normalizeOpenMeteoUv(data) {
    const current = data?.current || {};
    const hourly = data?.hourly || {};
    const unit = data?.current_units?.uv_index || data?.hourly_units?.uv_index || "";
    const currentUv = this._numberOr(current.uv_index, NaN);
    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const values = Array.isArray(hourly.uv_index) ? hourly.uv_index : [];
    return {
      current: Number.isFinite(currentUv) ? currentUv : NaN,
      unit,
      hourly: times.map((time, index) => ({
        time,
        value: this._numberOr(values[index], NaN)
      })).filter((entry) => entry.time && Number.isFinite(entry.value))
    };
  }
  getCardSize() {
    const mode = this._config.content_mode || "full";
    let size = this._config.show_radar === false ? 5 : 6;
    if (mode === "radar") size = 4;
    if (mode === "forecast" || mode === "timeline") size = 4;
    if (mode === "essentials") size = 3;
    if (this._config.layout === "compact") size = Math.min(size, this._config.show_radar === false ? 4 : 6);
    if (this._config.layout === "stacked") size = this._config.show_radar === false ? Math.max(size, 7) : Math.max(size, 9);
    if (this._config.density === "slim") size = Math.max(3, size - 1);
    if (this._config.density === "large") size += 1;
    return size;
  }
  getGridOptions() {
    const layout = this._config.layout || "auto";
    const mode = this._config.content_mode || "full";
    const density = this._config.density || "comfortable";
    let rows = layout === "stacked" ? 8 : layout === "compact" ? 5 : 6;
    if (mode === "radar") rows = 4;
    if (mode === "forecast" || mode === "timeline") rows = 4;
    if (mode === "essentials") rows = 3;
    if (density === "slim") rows = Math.max(3, rows - 1);
    if (density === "large") rows += 1;
    const columns = layout === "stacked" ? 12 : 18;
    return {
      rows,
      columns,
      min_rows: Math.min(rows, layout === "compact" ? 4 : 5),
      min_columns: 8
    };
  }
  _normalizeConfig(config) {
    const country = String(config.country || "us").toLowerCase();
    const radarProvider = String(config.radar_provider || "auto").toLowerCase();
    const themeMode = String(config.theme_mode || "radarwise").toLowerCase() === "auto" ? "auto" : "radarwise";
    const units = ["auto", "imperial", "metric"].includes(String(config.units || "auto").toLowerCase()) ? String(config.units || "auto").toLowerCase() : "auto";
    const radarStyle = String(config.radar_style || "standard").toLowerCase();
    const radarBasemap = String(config.radar_basemap || "light").toLowerCase();
    const radarTimeline = String(config.radar_timeline || "loop").toLowerCase();
    const layout = String(config.layout || "auto").toLowerCase();
    const language = String(config.language || config.forecast_summary_language || "auto").toLowerCase();
    const environmentSource = String(config.environment_source || "sensors").toLowerCase();
    const forecastMode = String(config.forecast_mode || "auto").toLowerCase();
    const timeFormat = String(config.time_format || "auto").toLowerCase();
    const timeZoneMode = String(config.time_zone_mode || "browser").toLowerCase();
    const fontFamily = String(config.font_family || "auto").toLowerCase();
    return {
      title: "Local Weather",
      humidity_entity: "",
      temperature_entity: "",
      dew_point_entity: "",
      wind_speed_entity: "",
      wind_direction_entity: "",
      air_quality_entity: "",
      uv_index_entity: "",
      pollen_entity: "",
      tree_pollen_entity: "",
      grass_pollen_entity: "",
      weed_pollen_entity: "",
      mold_pollen_entity: "",
      country: RADARWISE_COUNTRIES[country] ? country : "global",
      radar_provider: RADARWISE_RADAR[radarProvider] ? radarProvider : "auto",
      theme_mode: themeMode,
      units,
      radar_zoom: 7,
      debug: { enabled: false, panel: false },
      ...config,
      radar_style: RADARWISE_RADAR_STYLES[radarStyle] ? radarStyle : "standard",
      radar_basemap: RADARWISE_BASEMAPS[radarBasemap] ? radarBasemap : "light",
      radar_timeline: RADARWISE_RADAR_TIMELINES[radarTimeline] ? radarTimeline : "loop",
      layout: RADARWISE_LAYOUTS[layout] ? layout : "auto",
      content_mode: RADARWISE_CONTENT_MODES[String(config.content_mode || "full").toLowerCase()] ? String(config.content_mode || "full").toLowerCase() : "full",
      density: RADARWISE_DENSITIES[String(config.density || "comfortable").toLowerCase()] ? String(config.density || "comfortable").toLowerCase() : "comfortable",
      card_height: this._normalizeCardPixels(config.card_height),
      card_max_height: this._normalizeCardPixels(config.card_max_height),
      language: RADARWISE_LANGUAGES[language] ? language : "auto",
      time_format: RADARWISE_TIME_FORMATS[timeFormat] ? timeFormat : "auto",
      time_zone_mode: RADARWISE_TIME_ZONE_MODES[timeZoneMode] ? timeZoneMode : "browser",
      time_zone: String(config.time_zone || "").trim(),
      font_family: RADARWISE_FONT_FAMILIES[fontFamily] ? fontFamily : "auto",
      environment_source: RADARWISE_ENVIRONMENT_SOURCES[environmentSource] ? environmentSource : "sensors",
      forecast_mode: RADARWISE_FORECAST_MODES[forecastMode] ? forecastMode : "auto",
      latitude: this._numberOr(config.latitude, void 0),
      longitude: this._numberOr(config.longitude, void 0),
      hourly_count: Math.max(1, Math.min(24, Number(config.hourly_count) || 5)),
      forecast_count: Math.max(1, Math.min(7, Number(config.forecast_count) || 5)),
      show_timeline: config.show_timeline !== false,
      show_forecast: config.show_forecast !== false,
      show_forecast_summary: config.show_forecast_summary !== false,
      show_humidity: config.show_humidity !== false,
      show_dew_point: config.show_dew_point !== false,
      show_wind: config.show_wind !== false,
      show_sunrise: config.show_sunrise !== false,
      show_sunset: config.show_sunset !== false,
      show_environment: config.show_environment !== false,
      show_radar: config.show_radar !== false,
      show_map_controls: config.show_map_controls !== false,
      radar_controls: config.radar_controls !== false,
      show_warning_overlay: config.show_warning_overlay !== false,
      show_animations: config.show_animations !== false,
      panel_order: (() => {
        const def = ["clock", "weather", "radar"];
        const o = config.panel_order;
        if (!Array.isArray(o) || o.length !== 3) return def;
        return [...o].sort().join(",") === "clock,radar,weather" ? o : def;
      })(),
      column_widths: (() => {
        const def = [25, 50, 25];
        const w = config.column_widths;
        if (!Array.isArray(w) || w.length !== 3) return def;
        const nums = w.map((v) => Number(v) || 0);
        const sum = nums.reduce((a, b) => a + b, 0);
        if (sum < 60) {
          const total = sum || 4;
          return nums.map((v) => Math.max(20, Math.min(60, Math.round(v / total * 100 / 5) * 5)));
        }
        return nums.map((v) => Math.max(20, Math.min(60, Math.round(v / 5) * 5)));
      })(),
      timeline_autoscroll: config.timeline_autoscroll === true,
      stack_below: Math.max(0, Math.round(Number(config.stack_below) || 0)),
      radar_speed: Math.max(300, Math.min(3e3, Number(config.radar_speed) || 700)),
      custom_sensors: this._normalizeCustomSensors(config.custom_sensors),
      show_custom_sensors: config.show_custom_sensors !== false
    };
  }
  _normalizeCardPixels(value) {
    if (value === void 0 || value === null || value === "") return "";
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return "";
    return Math.max(180, Math.min(1200, Math.round(number)));
  }
  _cardSizeStyle() {
    const height = this._normalizeCardPixels(this._config.card_height);
    let maxHeight = this._normalizeCardPixels(this._config.card_max_height);
    if (height && !maxHeight) maxHeight = height;
    if (height && maxHeight && maxHeight < height) maxHeight = height;
    return [
      height ? `--radarwise-card-height:${height}px` : "",
      maxHeight ? `--radarwise-card-max-height:${maxHeight}px` : ""
    ].filter(Boolean).join(";");
  }
  _normalizeCustomSensors(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 6).map((item) => {
      if (!item || typeof item !== "object") return null;
      const entity = String(item.entity || "").trim();
      if (!entity) return null;
      return {
        entity,
        name: String(item.name || item.label || "").trim(),
        icon: String(item.icon || "").trim(),
        unit: String(item.unit || item.unit_of_measurement || "").trim()
      };
    }).filter(Boolean);
  }
  _renderKey() {
    const stateObj = this._hass?.states?.[this._config.entity];
    const attrs = stateObj?.attributes || {};
    return JSON.stringify({
      entity: this._config.entity,
      humidityEntity: this._config.humidity_entity,
      temperatureEntity: this._config.temperature_entity,
      dewPointEntity: this._config.dew_point_entity,
      windSpeedEntity: this._config.wind_speed_entity,
      windDirectionEntity: this._config.wind_direction_entity,
      airQualityEntity: this._config.air_quality_entity,
      uvIndexEntity: this._config.uv_index_entity,
      pollenEntity: this._config.pollen_entity,
      treePollenEntity: this._config.tree_pollen_entity,
      grassPollenEntity: this._config.grass_pollen_entity,
      weedPollenEntity: this._config.weed_pollen_entity,
      moldPollenEntity: this._config.mold_pollen_entity,
      environmentSource: this._config.environment_source,
      customSensors: (this._config.custom_sensors || []).map((sensor) => {
        const state = this._hass?.states?.[sensor.entity];
        return [
          sensor.entity,
          sensor.name,
          sensor.icon,
          sensor.unit,
          state?.state,
          state?.attributes?.friendly_name,
          state?.attributes?.unit_of_measurement,
          state?.attributes?.icon
        ].join(":");
      }).join("|"),
      environmentData: this._environmentData ? {
        loaded: this._environmentData.loaded,
        error: this._environmentData.error,
        aqi: this._environmentData.aqi?.value,
        uv: this._environmentData.uv?.current,
        pollen: this._environmentData.pollen?.value,
        pollenKind: this._environmentData.pollen?.labelKey
      } : null,
      state: stateObj?.state,
      updated: stateObj?.last_updated,
      temp: attrs.temperature,
      temperatureState: this._config.temperature_entity ? this._hass?.states?.[this._config.temperature_entity]?.state : void 0,
      humidity: attrs.humidity,
      humidityState: this._config.humidity_entity ? this._hass?.states?.[this._config.humidity_entity]?.state : void 0,
      dewPoint: attrs.dew_point ?? attrs.dewpoint ?? attrs.dewPoint,
      dewPointState: this._config.dew_point_entity ? this._hass?.states?.[this._config.dew_point_entity]?.state : void 0,
      windSpeedState: this._config.wind_speed_entity ? this._hass?.states?.[this._config.wind_speed_entity]?.state : void 0,
      windSpeedUnit: this._config.wind_speed_entity ? this._hass?.states?.[this._config.wind_speed_entity]?.attributes?.unit_of_measurement : void 0,
      windDirectionState: this._config.wind_direction_entity ? this._hass?.states?.[this._config.wind_direction_entity]?.state : void 0,
      windDirectionUnit: this._config.wind_direction_entity ? this._hass?.states?.[this._config.wind_direction_entity]?.attributes?.unit_of_measurement : void 0,
      airQualityState: this._config.air_quality_entity ? this._hass?.states?.[this._config.air_quality_entity]?.state : void 0,
      uvIndexState: this._config.uv_index_entity ? this._hass?.states?.[this._config.uv_index_entity]?.state : void 0,
      pollenState: this._config.pollen_entity ? this._hass?.states?.[this._config.pollen_entity]?.state : void 0,
      treePollenState: this._config.tree_pollen_entity ? this._hass?.states?.[this._config.tree_pollen_entity]?.state : void 0,
      grassPollenState: this._config.grass_pollen_entity ? this._hass?.states?.[this._config.grass_pollen_entity]?.state : void 0,
      weedPollenState: this._config.weed_pollen_entity ? this._hass?.states?.[this._config.weed_pollen_entity]?.state : void 0,
      moldPollenState: this._config.mold_pollen_entity ? this._hass?.states?.[this._config.mold_pollen_entity]?.state : void 0,
      wind: attrs.wind_speed,
      bearing: attrs.wind_bearing,
      windDirection: attrs.wind_direction ?? attrs.windDirection,
      forecast: [
        this._forecasts.hourly?.length || 0,
        this._forecasts.daily?.length || 0,
        this._forecasts.twice_daily?.length || 0
      ],
      config: [
        this._config.title,
        this._config.country,
        this._config.radar_provider,
        this._config.radar_style,
        this._config.radar_basemap,
        this._config.radar_timeline,
        this._config.layout,
        this._config.content_mode,
        this._config.density,
        this._config.card_height,
        this._config.card_max_height,
        this._config.theme_mode,
        this._config.units,
        this._language(),
        this._config.time_format,
        this._config.time_zone_mode,
        this._config.time_zone,
        this._resolvedTimeZone(),
        this._config.font_family,
        this._config.show_radar,
        this._config.show_timeline,
        this._config.show_forecast,
        this._config.show_forecast_summary,
        this._config.forecast_mode,
        this._config.show_humidity,
        this._config.show_dew_point,
        this._config.show_wind,
        this._config.show_sunrise,
        this._config.show_sunset,
        this._config.show_environment,
        this._config.show_custom_sensors,
        this._config.radar_controls,
        this._config.show_warning_overlay,
        this._config.hourly_count,
        this._config.forecast_count,
        (this._config.panel_order || []).join(","),
        (this._config.column_widths || []).join(","),
        this._config.timeline_autoscroll
      ]
    });
  }
  async _loadForecasts(entityId) {
    if (!this._hass?.connection?.sendMessagePromise) return;
    const types = ["hourly", "daily", "twice_daily"];
    const entries = await Promise.all(types.map(async (type) => {
      try {
        const response = await this._hass.connection.sendMessagePromise({
          type: "call_service",
          domain: "weather",
          service: "get_forecasts",
          service_data: { type },
          target: { entity_id: entityId },
          return_response: true
        });
        return [type, this._extractForecast(response, entityId)];
      } catch (err) {
        return [type, []];
      }
    }));
    this._forecasts = Object.fromEntries(entries);
    this._lastRenderKey = "";
    this._render();
  }
  _extractForecast(response, entityId) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.forecast)) return response.forecast;
    const serviceResponse = response.service_response || response.response || response;
    const byEntity = serviceResponse?.[entityId] || Object.values(serviceResponse || {})[0];
    return Array.isArray(byEntity?.forecast) ? byEntity.forecast : [];
  }
  _language() {
    const configured = String(this._config.language || this._config.forecast_summary_language || "auto").toLowerCase();
    if (RADARWISE_TEXT[configured]) return configured;
    const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "en";
    const locale = String(this._hass?.locale?.language || this._hass?.language || browserLanguage || "en").toLowerCase();
    const code = locale.split(/[-_]/)[0];
    return RADARWISE_TEXT[code] ? code : "en";
  }
  _texts() {
    return RADARWISE_TEXT[this._language()] || RADARWISE_TEXT.en;
  }
  _localeCode() {
    const configured = String(this._config.language || "auto").toLowerCase();
    if (configured !== "auto" && RADARWISE_TEXT[configured]) return configured;
    const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "en";
    return this._hass?.locale?.language || this._hass?.language || browserLanguage || "en";
  }
  _t(key) {
    return this._texts()[key] ?? RADARWISE_TEXT.en[key] ?? key;
  }
  _template(key, values = {}) {
    return String(this._t(key)).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }
  _contentVisibility(provider = this._resolvedRadarProvider()) {
    const radarAllowed = provider !== "none";
    const base = {
      mode: this._config.content_mode || "full",
      clock: true,
      current: true,
      stats: true,
      timeline: this._config.show_timeline !== false,
      forecast: this._config.show_forecast !== false,
      forecastSummary: this._config.show_forecast_summary !== false,
      environment: this._config.show_environment !== false,
      radar: this._config.show_radar !== false && radarAllowed
    };
    const presets = {
      full: base,
      custom: base,
      essentials: {
        ...base,
        timeline: false,
        forecast: false,
        forecastSummary: false,
        radar: false
      },
      forecast: {
        ...base,
        clock: false,
        current: false,
        stats: false,
        timeline: false,
        forecast: true,
        forecastSummary: false,
        environment: false,
        radar: false
      },
      timeline: {
        ...base,
        clock: false,
        current: false,
        stats: false,
        forecast: false,
        forecastSummary: false,
        environment: false,
        radar: false
      },
      radar: {
        ...base,
        clock: false,
        current: false,
        stats: false,
        timeline: false,
        forecast: false,
        forecastSummary: false,
        environment: false,
        radar: radarAllowed
      }
    };
    const next = { ...presets[base.mode] || base };
    next.left = next.clock || next.timeline || next.forecastSummary || next.environment;
    next.center = next.current || next.forecast || next.stats;
    next.right = next.radar;
    if (!next.left && !next.center && !next.right) {
      next.center = true;
      next.current = true;
    }
    next.panelCount = [next.left, next.center, next.right].filter(Boolean).length;
    return next;
  }
  _mainForecastPeriods(hourly = [], daily = [], twiceDaily = []) {
    if (this._config.forecast_mode === "daily") {
      if (daily.length) return daily;
      const combined = this._dailyPeriodsFromTwiceDaily(twiceDaily);
      return combined.length ? combined : hourly;
    }
    if (this._config.forecast_mode === "twice_daily") {
      return twiceDaily.length ? twiceDaily : daily.length ? daily : hourly;
    }
    return twiceDaily.length ? twiceDaily : daily.length ? daily : hourly;
  }
  _dailyPeriodsFromTwiceDaily(periods = []) {
    const groups = /* @__PURE__ */ new Map();
    const ordered = [...periods].filter((item) => item && !Number.isNaN(new Date(item.datetime).getTime())).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    for (const item of ordered) {
      const key = this._forecastDateKey(item.datetime);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, { day: null, night: null });
      const group = groups.get(key);
      const time = this._timeParts(item.datetime);
      const isDaytime = item.is_daytime === true || (item.is_daytime === void 0 || item.is_daytime === null) && time && time.hour >= 6 && time.hour < 18;
      if (isDaytime) {
        if (!group.day) group.day = item;
      } else if (!group.night) {
        group.night = item;
      }
    }
    return [...groups.values()].map(({ day, night }) => {
      const base = day || night;
      const combined = { ...base };
      const high = day?.temperature ?? day?.high_temperature ?? day?.native_temperature ?? night?.high_temperature ?? night?.native_temperature ?? night?.temperature;
      const low = day ? night?.temperature ?? night?.low_temperature ?? night?.native_temperature ?? day?.templow ?? day?.low_temperature ?? day?.native_templow : night?.low_temperature ?? night?.native_templow;
      const precipitation = [day, night].map((item) => this._precipProbability(item)).filter(Number.isFinite);
      combined.datetime = day?.datetime || night?.datetime;
      if (high !== void 0 && high !== null) combined.temperature = high;
      if (low !== void 0 && low !== null) combined.templow = low;
      else delete combined.templow;
      if (precipitation.length) combined.precipitation_probability = Math.max(...precipitation);
      delete combined.is_daytime;
      return combined;
    });
  }
  _forecastDateKey(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-US", this._timeZoneOptions({
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })).formatToParts(date);
    const valueFor = (type) => parts.find((part) => part.type === type)?.value;
    const year = valueFor("year");
    const month = valueFor("month");
    const day = valueFor("day");
    return year && month && day ? `${year}-${month}-${day}` : "";
  }
  _render() {
    if (!this.shadowRoot) return;
    this._stopTimelineScroll();
    const text = this._texts();
    const stateObj = this._hass?.states?.[this._config.entity];
    const attrs = stateObj?.attributes || {};
    const condition = stateObj?.state || "unavailable";
    const sunStateObj = this._hass?.states?.["sun.sun"];
    const displayCondition = this._displayCondition(condition, sunStateObj);
    const units = this._unitContext(attrs);
    const temp = this._displayTemp(this._currentTemperature(attrs), units);
    const windInfo = this._windInfo(attrs, units);
    const wind = windInfo.display;
    const hourly = this._forecasts.hourly || [];
    const daily = this._forecasts.daily || [];
    const twiceDaily = this._forecasts.twice_daily || [];
    const forecastSources = [hourly, twiceDaily, daily];
    const humidityInfo = this._humidityInfo(attrs, forecastSources);
    const dewPointInfo = this._dewPointInfo(attrs, units, forecastSources);
    const humidity = humidityInfo.display;
    const dewPoint = dewPointInfo.display;
    const timeline = hourly.length ? hourly : twiceDaily.length ? twiceDaily : daily;
    const timelineMode = hourly.length ? "hourly" : twiceDaily.length ? "twice_daily" : daily.length ? "daily" : "hourly";
    const mainPeriods = this._mainForecastPeriods(hourly, daily, twiceDaily);
    const hiLo = this._formatHiLo(daily, hourly, units);
    const sun = sunStateObj?.attributes || {};
    const now = /* @__PURE__ */ new Date();
    const needsEntity = !this._config.entity;
    const unavailable = needsEntity || !stateObj || condition === "unavailable" || condition === "unknown";
    const provider = this._resolvedRadarProvider();
    const layout = this._config.layout || "auto";
    const density = this._config.density || "comfortable";
    const content = this._contentVisibility(provider);
    const forecastSummary = this._forecastSummary({ hourly, daily, twiceDaily, units, condition: displayCondition });
    const environmentTiles = content.environment ? this._renderEnvironmentTiles() : "";
    const currentUvBadge = this._renderCurrentUv(attrs);
    if (!content.right) this._teardownRadar();
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card style="--radarwise-font-family:${_wwEscape(RADARWISE_FONT_STACKS[this._config.font_family] || RADARWISE_FONT_STACKS.auto)}">
        <div class="card-outer">
          <div class="card-grid layout-${_wwEscape(layout)} content-${_wwEscape(content.mode)} density-${_wwEscape(density)} panels-${content.panelCount} ${content.right ? "" : "no-radar"} ${content.timeline ? "" : "no-timeline"} ${content.forecast ? "" : "no-forecast"} ${content.left ? "" : "no-left"} ${content.center ? "" : "no-center"}" style="${(() => {
      const w = this._config.column_widths || [25, 50, 25];
      const cl = this._sectionOrder("clock");
      const wl = this._sectionOrder("weather");
      const rl = this._sectionOrder("radar");
      const cb = cl * 10, wb = wl * 10, rb = rl * 10;
      const sizeStyle = this._cardSizeStyle();
      return `--ww-grid-template:${this._gridTemplate(content)};--ww-col1:${w[0]}fr;--ww-col2:${w[1]}fr;--ww-col3:${w[2]}fr;--ww-left-order:${cl};--ww-center-order:${wl};--ww-right-order:${rl};--ww-ord-clock-title:${cb + 1};--ww-ord-clock-hourly:${cb + 2};--ww-ord-weather:${wb + 1};--ww-ord-radar:${rb + 1};${sizeStyle ? `${sizeStyle};` : ""}`;
    })()}--ww-hourly-count:${Math.max(1, Math.min(24, Number(this._config.hourly_count) || 5))};--ww-forecast-count:${Math.max(1, Math.min(7, Number(this._config.forecast_count) || 5))}">
            ${content.left ? `
              <section class="left">
                ${content.clock || content.environment || content.forecastSummary ? `
                  <div class="clock-panel">
                    ${content.clock || content.environment ? `
                      <div class="clock-context ${environmentTiles ? "" : "no-env"}">
                        ${content.clock ? `
                          <div class="clock-main">
                            <div class="clock-row">
                              <div class="clock-time" id="clock-time">${this._clockTime(now)}</div>
                              <div class="clock-ampm" id="clock-ampm">${this._clockAmPm(now)}</div>
                            </div>
                            <div class="clock-date" id="clock-date">${this._longDate(now)}</div>
                          </div>
                        ` : ""}
                        ${environmentTiles ? `<div class="environment-strip">${environmentTiles}</div>` : ""}
                      </div>
                    ` : ""}
                    ${content.forecastSummary ? `<div class="forecast-summary" title="${_wwEscape(forecastSummary)}"><span class="forecast-summary-text">${_wwEscape(forecastSummary)}</span></div>` : ""}
                  </div>
                ` : ""}
                ${content.timeline ? `
                  <div class="section-title">${this._timelineTitle(timelineMode)}</div>
                  <div class="hourly-left">${this._renderTimeline(timeline, units, timelineMode)}</div>
                ` : ""}
              </section>
            ` : ""}
            ${content.center ? `
              <section class="center">
                ${content.current ? `
                  <div class="current-row">
                    <div class="current-icon">${this._icon(displayCondition, 62)}</div>
                    <div class="cond-block">
                      <div class="current-label">${_wwEscape(text.currentWeather)}</div>
                      <div class="cond-name-row">
                        <div class="cond-name">${needsEntity ? _wwEscape(text.selectWeatherEntity) : unavailable ? _wwEscape(text.connectWeather) : _wwEscape(this._conditionLabel(displayCondition))}</div>
                        ${currentUvBadge}
                      </div>
                      <div class="updated-note">${needsEntity ? _wwEscape(text.openEditor) : unavailable ? _wwEscape(text.waitingLive) : `${_wwEscape(text.updated)} ${this._shortTime(now)}`}</div>
                    </div>
                    <div class="temp-block">
                      <div class="temp-now">${temp}</div>
                      <div class="temp-hilo">${hiLo}</div>
                    </div>
                  </div>
                ` : ""}
                ${content.forecast ? `<div class="daily-strip">${this._renderDaily(mainPeriods, units)}</div>` : ""}
                ${content.stats ? this._renderDetailsGrid(this._weatherDetailTiles({ text, humidity, dewPoint, wind, sun })) : ""}
              </section>
            ` : ""}
            ${content.right ? `
              <section class="right">
                <div id="rmap"></div>
                ${this._config.radar_controls === false ? "" : `
                  <div class="radar-controls" aria-label="Radar playback controls">
                    <button type="button" data-radar-action="prev" title="${_wwEscape(text.previousRadarFrame)}" aria-label="${_wwEscape(text.previousRadarFrame)}">&lt;</button>
                    <button type="button" data-radar-action="play" title="${_wwEscape(text.pauseRadarLoop)}" aria-label="${_wwEscape(text.pauseRadarLoop)}">||</button>
                    <button type="button" data-radar-action="next" title="${_wwEscape(text.nextRadarFrame)}" aria-label="${_wwEscape(text.nextRadarFrame)}">&gt;</button>
                  </div>
                `}
                <div class="radar-lbl" id="radar-lbl">${_wwEscape(text.radarLoading)}</div>
                <div class="radar-alert" id="radar-alert" hidden></div>
              </section>
            ` : ""}
          </div>
          ${this._renderDebug({ stateObj, attrs, hourly, daily, twiceDaily, provider, units, humidityInfo, dewPointInfo, windInfo })}
        </div>
      </ha-card>
    `;
    if (content.right) {
      this._teardownRadar();
      this._radarProviderRendered = provider;
      this._wireRadarControls();
      window.requestAnimationFrame(() => this._scheduleRadarInit(provider));
    }
    this._updateClock();
    if (this._config.timeline_autoscroll && content.timeline) {
      this._scheduleTimelineScrollStart();
    }
    this._setupCardResizeObserver();
  }
  _gridTemplate(content) {
    const order = Array.isArray(this._config.panel_order) ? this._config.panel_order : ["clock", "weather", "radar"];
    const widths = Array.isArray(this._config.column_widths) ? this._config.column_widths : [25, 50, 25];
    const visible = { clock: content.left, weather: content.center, radar: content.right };
    const entries = order.map((key, index) => ({ key, weight: Math.max(1, Number(widths[index]) || 1) })).filter((entry) => visible[entry.key]);
    const active = entries.length ? entries : [{ weight: 1 }];
    const total = active.reduce((sum, entry) => sum + entry.weight, 0) || 1;
    return active.map((entry) => `minmax(0, ${Math.max(1, Math.round(entry.weight / total * 1e3))}fr)`).join(" ");
  }
  _wireRadarControls() {
    this.shadowRoot?.querySelectorAll("[data-radar-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const action = button.dataset.radarAction;
        if (action === "play") this._toggleRadarPlayback();
        if (action === "prev") this._stepRadar(-1);
        if (action === "next") this._stepRadar(1);
      });
    });
  }
  _scheduleRadarInit(provider, attempt = 0) {
    const holder = this.shadowRoot?.getElementById("rmap");
    if (!holder) return;
    const rect = holder.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) {
      if (attempt < 24) window.setTimeout(() => this._scheduleRadarInit(provider, attempt + 1), 250);
      else this._setRadarLabel(this._t("radarWaiting"));
      return;
    }
    this._initRadar(provider);
  }
  _renderDebug(data) {
    const debug = this._config.debug;
    if (!debug || debug.enabled !== true || debug.panel !== true) return "";
    const debugValue = (value) => {
      if (value === void 0) return "missing";
      if (value === null) return "null";
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch (err) {
          return String(value);
        }
      }
      return String(value);
    };
    const firstHourly = data.hourly?.[0] || {};
    const firstTwiceDaily = data.twiceDaily?.[0] || {};
    const firstDaily = data.daily?.[0] || {};
    const rows = [
      ["Version", CARD_VERSION],
      ["Entity", this._config.entity],
      ["Temperature entity", this._config.temperature_entity || "auto"],
      ["Humidity entity", this._config.humidity_entity || "auto"],
      ["Dew point entity", this._config.dew_point_entity || "auto"],
      ["Wind speed entity", this._config.wind_speed_entity || "auto"],
      ["Wind direction entity", this._config.wind_direction_entity || "auto"],
      ["Resolved humidity", `${data.humidityInfo?.display ?? "--"}% via ${data.humidityInfo?.source || "missing"}`],
      ["Resolved humidity raw", debugValue(data.humidityInfo?.raw)],
      ["Resolved dew point", `${data.dewPointInfo?.display ?? "--"} via ${data.dewPointInfo?.source || "missing"}`],
      ["Resolved dew point raw", debugValue(data.dewPointInfo?.raw)],
      ["Resolved wind", `${data.windInfo?.display ?? "--"} via ${data.windInfo?.source || "missing"}`],
      ["Resolved wind raw", debugValue(data.windInfo?.raw)],
      ["Weather humidity attrs", debugValue({
        humidity: data.attrs?.humidity,
        relative_humidity: data.attrs?.relative_humidity,
        relativeHumidity: data.attrs?.relativeHumidity,
        native_humidity: data.attrs?.native_humidity
      })],
      ["Weather dew point attrs", debugValue({
        dew_point: data.attrs?.dew_point,
        dewpoint: data.attrs?.dewpoint,
        dewPoint: data.attrs?.dewPoint,
        native_dew_point: data.attrs?.native_dew_point,
        dew_point_temperature: data.attrs?.dew_point_temperature
      })],
      ["Weather wind attrs", debugValue({
        wind_speed: data.attrs?.wind_speed,
        wind_speed_unit: data.attrs?.wind_speed_unit,
        wind_bearing: data.attrs?.wind_bearing,
        wind_direction: data.attrs?.wind_direction,
        windDirection: data.attrs?.windDirection
      })],
      ["Air quality entity", this._config.air_quality_entity || "none"],
      ["UV index entity", this._config.uv_index_entity || "auto"],
      ["Pollen entity", this._config.pollen_entity || "none"],
      ["Tree pollen entity", this._config.tree_pollen_entity || "none"],
      ["Grass pollen entity", this._config.grass_pollen_entity || "none"],
      ["Weed pollen entity", this._config.weed_pollen_entity || "none"],
      ["Mold pollen entity", this._config.mold_pollen_entity || "none"],
      ["Environment source", this._config.environment_source || "sensors"],
      ["Environment updated", this._environmentData?.loaded ? this._dateTime(this._environmentData.loaded) : "never"],
      ["Environment error", this._environmentData?.error || "none"],
      ["Country", this._config.country],
      ["Radar", data.provider],
      ["Content mode", this._config.content_mode],
      ["Density", this._config.density],
      ["Time format", this._config.time_format],
      ["Time zone", this._timeZoneLabel()],
      ["Font family", this._config.font_family],
      ["Units", data.units.temperatureUnit],
      ["Hourly count", data.hourly.length],
      ["Daily count", data.daily.length],
      ["Twice daily count", data.twiceDaily.length],
      ["First hourly keys", Object.keys(firstHourly).sort().join(", ") || "none"],
      ["First hourly humidity/dew", debugValue({
        humidity: firstHourly.humidity,
        relative_humidity: firstHourly.relative_humidity,
        dew_point: firstHourly.dew_point,
        dewpoint: firstHourly.dewpoint
      })],
      ["First twice daily keys", Object.keys(firstTwiceDaily).sort().join(", ") || "none"],
      ["First daily keys", Object.keys(firstDaily).sort().join(", ") || "none"],
      ["Weather attr keys", Object.keys(data.attrs || {}).sort().join(", ") || "none"],
      ["State", data.stateObj?.state || "missing"]
    ];
    return `
      <details class="debug-panel">
        <summary>Debug</summary>
        ${rows.map(([key, value]) => `<div class="debug-row"><span>${key}</span><code>${_wwEscape(value)}</code></div>`).join("")}
      </details>
    `;
  }
  _updateClock() {
    const now = /* @__PURE__ */ new Date();
    const time = this.shadowRoot?.getElementById("clock-time");
    const ampm = this.shadowRoot?.getElementById("clock-ampm");
    const date = this.shadowRoot?.getElementById("clock-date");
    if (time) time.textContent = this._clockTime(now);
    if (ampm) ampm.textContent = this._clockAmPm(now);
    if (date) date.textContent = this._longDate(now);
  }
  _timelineTitle(mode) {
    if (mode === "twice_daily") return this._t("forecast");
    if (mode === "daily") return this._t("daily");
    return this._t("hourly");
  }
  _renderCurrentUv(attrs) {
    const uv = this._currentUv(attrs);
    if (!Number.isFinite(uv)) return "";
    const severity = this._uvSeverity(uv);
    const value = this._formatUvValue(uv);
    return `
      <div class="current-uv uv-${_wwEscape(severity.level)}" title="${_wwEscape(`${this._t("uvIndex")}: ${value} ${this._t(severity.key)}`)}" aria-label="${_wwEscape(`${this._t("uvIndex")}: ${value} ${this._t(severity.key)}`)}">
        <span>${_wwEscape(this._t("uvIndex"))}</span>
        <strong>${_wwEscape(value)}</strong>
        <em>${_wwEscape(this._t(severity.key))}</em>
      </div>
    `;
  }
  _currentUv(attrs = {}) {
    const entityId = this._config.uv_index_entity;
    const state = entityId ? this._hass?.states?.[entityId] : null;
    if (state && isRadarWiseUvIndexEntity(entityId, state)) {
      const value = this._numberOr(state.state, NaN);
      if (Number.isFinite(value)) return value;
    }
    const attrValue = [
      attrs.uv_index,
      attrs.uv,
      attrs.uvi,
      attrs.ultraviolet_index
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    if (Number.isFinite(attrValue)) return attrValue;
    const openMeteoUv = this._environmentData?.uv?.current;
    return Number.isFinite(openMeteoUv) ? openMeteoUv : NaN;
  }
  _hourlyUv(item, mode = "hourly") {
    const forecastUv = this._forecastUv(item);
    if (Number.isFinite(forecastUv)) return forecastUv;
    if (mode !== "hourly" || this._config.environment_source !== "open_meteo") return NaN;
    return this._openMeteoUvForTime(item?.datetime);
  }
  _forecastUv(item) {
    const value = [
      item?.uv_index,
      item?.uv,
      item?.uvi,
      item?.ultraviolet_index
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    return Number.isFinite(value) ? value : NaN;
  }
  _openMeteoUvForTime(datetime) {
    if (!datetime) return NaN;
    const targetHour = this._hourKey(datetime);
    if (!targetHour) return NaN;
    const match = (this._environmentData?.uv?.hourly || []).find((entry) => this._hourKey(entry.time) === targetHour);
    return Number.isFinite(match?.value) ? match.value : NaN;
  }
  _hourKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}`;
  }
  _formatUvValue(value) {
    const number = this._numberOr(value, NaN);
    if (!Number.isFinite(number)) return "--";
    return String(Math.round(number * 10) / 10).replace(/\.0$/, "");
  }
  _uvSeverity(value) {
    const number = this._numberOr(value, NaN);
    if (!Number.isFinite(number)) return { key: "unknown", level: "neutral", rank: 0 };
    if (number <= 2) return { key: "low", level: "good", rank: 1 };
    if (number <= 5) return { key: "moderate", level: "moderate", rank: 2 };
    if (number <= 7) return { key: "high", level: "unhealthy", rank: 3 };
    if (number <= 10) return { key: "veryHigh", level: "very-high", rank: 4 };
    return { key: "extreme", level: "hazardous", rank: 5 };
  }
  _renderTimeline(periods, units, mode = "hourly") {
    if (!periods.length) return `<div class="loading-note">${_wwEscape(this._t("waitingForecast"))}</div>`;
    const slice = periods.slice(0, Number(this._config.hourly_count) || 5);
    const temps = slice.map((item) => this._tempValue(item.temperature, units)).filter(Number.isFinite);
    const min = temps.length ? Math.min(...temps) : 0;
    const max = temps.length ? Math.max(...temps) : 10;
    const range = Math.max(max - min, 4);
    return slice.map((item) => {
      const temp = this._tempValue(item.temperature, units);
      const pct = Number.isFinite(temp) ? Math.max(12, Math.round((temp - min) / range * 80 + 12)) : 12;
      const precip = this._formatPrecip(item, units);
      const uv = this._hourlyUv(item, mode);
      const uvText = Number.isFinite(uv) ? `UV ${this._formatUvValue(uv)}` : "";
      return `
        <div class="hour-row">
          <div class="hour-time-left">${this._timelineTime(item, mode)}</div>
          <div class="hour-icon-left">${this._icon(item.condition || item.state, 23)}</div>
          <div class="hour-temp-left">${this._displayTemp(item.temperature, units, false)}</div>
          <div class="hour-bar-wrap" title="${_wwEscape(this._t("relativeTemp"))}"><div class="hour-bar-fill" style="width:${pct}%"></div></div>
          <div class="hour-precip">${_wwEscape([precip, uvText].filter(Boolean).join(" \xB7 "))}</div>
        </div>
      `;
    }).join("");
  }
  _timelineTime(item, mode) {
    if (mode === "hourly") return this._hour(item.datetime);
    const day = this._dayName(item.datetime);
    if (mode === "twice_daily" && item.is_daytime !== void 0) return `${day} ${item.is_daytime ? this._t("dayPeriod") : this._t("nightPeriod")}`;
    return day;
  }
  _renderDaily(periods, units) {
    if (!periods.length) return `<div class="loading-note">${_wwEscape(this._t("waitingForecast"))}</div>`;
    return periods.slice(0, Number(this._config.forecast_count) || 5).map((item) => {
      const period = item.is_daytime === void 0 ? "" : item.is_daytime ? this._t("dayPeriod") : this._t("nightPeriod");
      const range = this._forecastRange(item, units);
      return `
        <div class="fc-slot">
          <div>
            <div class="fc-day">${this._dayName(item.datetime)}</div>
            <div class="fc-period">${period}</div>
          </div>
          <div class="fc-icon">${this._icon(item.condition || item.state, 48)}</div>
          <div class="fc-temp">${this._displayTemp(item.temperature, units, false)}</div>
          ${range ? `<div class="fc-range">${_wwEscape(range)}</div>` : ""}
          <div class="fc-precip">${this._formatPrecip(item, units)}</div>
        </div>
      `;
    }).join("");
  }
  _forecastRange(item, units) {
    const high = this._tempValue(item?.temperature ?? item?.high_temperature ?? item?.native_temperature, units);
    const low = this._tempValue(item?.templow ?? item?.low_temperature ?? item?.native_templow, units);
    if (!Number.isFinite(high) || !Number.isFinite(low)) return "";
    return `${Math.round(high)}\xB0 / ${Math.round(low)}\xB0`;
  }
  _forecastSummary({ hourly, daily, twiceDaily, units, condition }) {
    const parts = [];
    const todayHigh = this._summaryHigh(daily, hourly, units);
    const todayChance = this._summaryPrecipChance([...(hourly || []).slice(0, 8), daily?.[0], twiceDaily?.[0]]);
    const nowPhrase = this._localizedCondition(condition);
    let opener = `${this._t("forecastIntro")}: ${this._t("currently")} ${nowPhrase}`;
    if (Number.isFinite(todayHigh)) opener += `, ${this._template("withHigh", { temp: `${Math.round(todayHigh)}\xB0` })}`;
    if (Number.isFinite(todayChance)) opener += ` ${this._template("chancePrecip", { chance: Math.round(todayChance) })}`;
    parts.push(`${opener}.`);
    const tonight = this._firstNightPeriod(twiceDaily, daily);
    if (tonight) {
      const tonightTemp = this._tempValue(tonight.templow ?? tonight.low_temperature ?? tonight.temperature, units);
      const tonightChance = this._precipProbability(tonight);
      const tonightWords = this._localizedCondition(tonight.condition || tonight.state);
      const bits = [this._template("tonight", { condition: tonightWords })];
      if (Number.isFinite(tonightTemp)) bits.push(this._template("withLow", { temp: `${Math.round(tonightTemp)}\xB0` }));
      if (Number.isFinite(tonightChance)) bits.push(this._template("chancePrecip", { chance: Math.round(tonightChance) }));
      parts.push(`${bits.join(", ")}.`);
    }
    const tomorrow = this._tomorrowPeriod(twiceDaily, daily, hourly);
    if (tomorrow) {
      const tomorrowTemp = this._tempValue(tomorrow.temperature ?? tomorrow.high_temperature, units);
      const tomorrowChance = this._precipProbability(tomorrow);
      const tomorrowWords = this._localizedCondition(tomorrow.condition || tomorrow.state);
      const bits = [this._template("tomorrow", { condition: tomorrowWords })];
      if (Number.isFinite(tomorrowTemp)) bits.push(this._template("nearTemp", { temp: `${Math.round(tomorrowTemp)}\xB0` }));
      if (Number.isFinite(tomorrowChance)) bits.push(this._template("chancePrecip", { chance: Math.round(tomorrowChance) }));
      parts.push(`${bits.join(", ")}.`);
    }
    return parts.join(" ");
  }
  _summaryHigh(daily, hourly, units) {
    const dailyHigh = this._tempValue(daily?.[0]?.temperature ?? daily?.[0]?.high_temperature, units);
    if (Number.isFinite(dailyHigh)) return dailyHigh;
    const temps = (hourly || []).slice(0, 12).map((item) => this._tempValue(item.temperature, units)).filter(Number.isFinite);
    return temps.length ? Math.max(...temps) : NaN;
  }
  _summaryPrecipChance(items) {
    const values = (items || []).map((item) => this._precipProbability(item)).filter(Number.isFinite);
    return values.length ? Math.max(...values) : NaN;
  }
  _firstNightPeriod(twiceDaily, daily) {
    const fromTwiceDaily = (twiceDaily || []).find(
      (item) => item.is_daytime === false || /night/i.test(String(item.name || ""))
    );
    if (fromTwiceDaily) return fromTwiceDaily;
    const d = daily?.[0];
    return d && (d.templow != null || d.low_temperature != null) ? d : null;
  }
  _tomorrowPeriod(twiceDaily, daily, hourly) {
    return (twiceDaily || []).find((item, index) => index > 0 && item.is_daytime !== false) || daily?.[1] || hourly?.[12] || null;
  }
  _localizedCondition(condition) {
    const key = this._conditionTextKey(condition);
    return this._texts().conditions?.[key] || RADARWISE_TEXT.en.conditions[key] || key || "weather";
  }
  _conditionLabel(condition) {
    const localized = this._localizedCondition(condition);
    if (this._language() === "en") return this._titleCase(localized);
    return localized ? localized.charAt(0).toLocaleUpperCase(this._localeCode()) + localized.slice(1) : "--";
  }
  _conditionTextKey(condition) {
    const raw = String(condition || "weather").trim().toLowerCase();
    const compact = raw.replace(/[-_\s]+/g, "");
    const aliases = {
      clearnight: "clear night",
      partlycloudy: "partly cloudy",
      partlycloudynight: "partly cloudy",
      mostlycloudy: "partly cloudy",
      mostlycloudynight: "partly cloudy",
      lightningrainy: "lightning rainy",
      snowyrainy: "snowy rainy",
      windyvariant: "windy variant"
    };
    return aliases[compact] || raw.replace(/[-_]+/g, " ") || "weather";
  }
  _stat(kind, label, value) {
    const icons = {
      humidity: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.1 6 11a6 6 0 1 1-12 0c0-4.9 6-11 6-11Z" fill="#65b8df"/><path d="M9.2 16.4c.7 1.3 1.8 2 3.4 2" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      dewpoint: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 3s4.5 4.8 4.5 8.4a4.5 4.5 0 1 1-9 0C3.5 7.8 8 3 8 3Z" fill="#65b8df"/><path d="M16.5 4.5v8.2a3.7 3.7 0 1 1-3 0V4.5a1.5 1.5 0 0 1 3 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 16.4h.01" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/></svg>`,
      wind: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 8h10.4a3 3 0 1 0-2.6-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 13h15.4a3 3 0 1 1-2.6 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunrise: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#fbbf24"/><path d="M12 4v4M5 11l3 1M19 11l-3 1" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunset: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#f59e0b"/><path d="M12 8V4M5 11l3 1M19 11l-3 1" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>`
    };
    return `<div class="stat"><div class="stat-ico" aria-hidden="true">${icons[kind]}</div><div><div class="stat-lbl">${label}</div><div class="stat-val">${_wwEscape(value || "--")}</div></div></div>`;
  }
  _renderDetailsGrid(tiles = []) {
    const rendered = tiles.filter(Boolean).join("");
    return rendered ? `<div class="details-grid">${rendered}</div>` : "";
  }
  _weatherDetailTiles({ text, humidity, dewPoint, wind, sun = {} }) {
    return [
      this._config.show_humidity !== false ? this._stat("humidity", text.humidity, `${humidity}%`) : "",
      this._config.show_dew_point !== false ? this._stat("dewpoint", text.dewPoint, dewPoint) : "",
      this._config.show_wind !== false ? this._stat("wind", text.wind, wind) : "",
      this._config.show_sunrise !== false ? this._stat("sunrise", text.sunrise, this._shortTime(sun.next_rising)) : "",
      this._config.show_sunset !== false ? this._stat("sunset", text.sunset, this._shortTime(sun.next_setting)) : "",
      ...this._customSensorTiles()
    ];
  }
  _customSensorTiles() {
    const sensors = Array.isArray(this._config.custom_sensors) ? this._config.custom_sensors : [];
    if (this._config.show_custom_sensors === false || !sensors.length) return [];
    return sensors.map((sensor) => this._customSensorTile(sensor)).filter(Boolean);
  }
  _renderCustomSensors() {
    const tiles = this._customSensorTiles().join("");
    return tiles ? `<div class="custom-sensors-row">${tiles}</div>` : "";
  }
  _customSensorTile(sensor) {
    const entityId = String(sensor?.entity || "").trim();
    if (!entityId) return "";
    const state = this._hass?.states?.[entityId];
    const attrs = state?.attributes || {};
    const label = sensor.name || attrs.friendly_name || entityId;
    const value = this._customSensorValue(state, sensor.unit);
    const icon = this._customSensorIcon(sensor.icon || attrs.icon);
    return `
      <div class="stat custom-sensor-stat" title="${_wwEscape(entityId)}">
        <div class="stat-ico custom-sensor-ico" aria-hidden="true">${icon}</div>
        <div>
          <div class="stat-lbl">${_wwEscape(label)}</div>
          <div class="stat-val">${_wwEscape(value)}</div>
        </div>
      </div>
    `;
  }
  _customSensorValue(state, overrideUnit = "") {
    if (!state || state.state === "unknown" || state.state === "unavailable") return "--";
    const raw = state.state;
    const unit = String(overrideUnit || state.attributes?.unit_of_measurement || state.attributes?.native_unit_of_measurement || "").trim();
    const number = this._numberOr(raw, NaN);
    if (Number.isFinite(number)) {
      const rounded = Math.abs(number) < 10 ? Math.round(number * 10) / 10 : Math.round(number);
      return `${rounded}${unit ? ` ${unit}` : ""}`.trim();
    }
    return `${this._titleCase(raw)}${unit ? ` ${unit}` : ""}`.trim();
  }
  _customSensorIcon(icon) {
    const clean = String(icon || "").trim();
    if (/^mdi:[a-z0-9-]+$/i.test(clean)) {
      return `<ha-icon icon="${_wwEscape(clean)}"></ha-icon>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M5 17.5h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 14.5c1.6-4.1 3.3-6.1 5-6.1s3.4 2 5 6.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="8.4" r="2.5" fill="#65b8df"/><path d="M12 12.5v3.5" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  _renderEnvironmentTiles() {
    if (this._config.show_environment === false || this._config.environment_source === "disabled") return "";
    const tiles = [this._airQualityTile(), this._pollenTile()].filter(Boolean);
    return tiles.map((tile) => `
      <div class="env-tile env-${_wwEscape(tile.level || "neutral")}">
        <div class="env-ico" aria-hidden="true">${this._environmentIcon(tile.kind)}</div>
        <div class="env-copy">
          <div class="env-lbl">${_wwEscape(tile.label)}</div>
          <div class="env-val">${_wwEscape(tile.value)}</div>
          <div class="env-note">${_wwEscape(tile.note)}</div>
        </div>
      </div>
    `).join("");
  }
  _airQualityTile() {
    if (this._config.environment_source === "open_meteo") {
      return this._openMeteoAirQualityTile() || this._sensorAirQualityTile();
    }
    return this._sensorAirQualityTile();
  }
  _sensorAirQualityTile() {
    const state = this._entityState(this._config.air_quality_entity, isRadarWiseAirQualityEntity);
    if (!state) return null;
    const severity = this._airQualitySeverity(state.state);
    return {
      kind: "aqi",
      label: this._t("airQuality"),
      value: this._formatSensorState(state, "AQI"),
      note: this._t(severity.key),
      level: severity.level
    };
  }
  _pollenTile() {
    if (this._config.environment_source === "open_meteo") {
      return this._openMeteoPollenTile() || this._sensorPollenTile();
    }
    return this._sensorPollenTile();
  }
  _openMeteoAirQualityTile() {
    const aqi = this._environmentData?.aqi;
    if (!aqi || !Number.isFinite(aqi.value)) return null;
    const severity = this._airQualitySeverity(aqi.value);
    return {
      kind: "aqi",
      label: this._t("airQuality"),
      value: this._formatEnvironmentNumber(aqi.value, aqi.unit || "AQI"),
      note: this._t(severity.key),
      level: severity.level
    };
  }
  _openMeteoPollenTile() {
    const pollen = this._environmentData?.pollen;
    if (!pollen || !Number.isFinite(pollen.value)) return null;
    const severity = this._pollenSeverity(pollen.value);
    return {
      kind: "pollen",
      label: this._t(pollen.labelKey || "pollen"),
      value: this._formatEnvironmentNumber(pollen.value, pollen.unit || "grains/m3"),
      note: this._t(severity.key),
      level: severity.level
    };
  }
  _sensorPollenTile() {
    const entries = [
      { configKey: "pollen_entity", labelKey: "pollen", kind: "" },
      { configKey: "tree_pollen_entity", labelKey: "treePollen", kind: "tree" },
      { configKey: "grass_pollen_entity", labelKey: "grassPollen", kind: "grass" },
      { configKey: "weed_pollen_entity", labelKey: "weedPollen", kind: "weed" },
      { configKey: "mold_pollen_entity", labelKey: "moldPollen", kind: "mold" }
    ].map((entry) => {
      const state = this._entityState(this._config[entry.configKey], (entityId, entityState) => isRadarWisePollenEntity(entityId, entityState, entry.kind));
      if (!state) return null;
      const severity = this._pollenSeverity(state.state, state.attributes?.index_value);
      return {
        ...entry,
        state,
        severity,
        value: this._formatSensorState(state),
        rank: severity.rank
      };
    }).filter(Boolean);
    if (!entries.length) return null;
    const generic = entries.find((entry) => entry.configKey === "pollen_entity");
    const strongestSource = entries.filter((entry) => entry.configKey !== "pollen_entity").sort((a, b) => b.rank - a.rank)[0];
    const chosen = generic || strongestSource || entries[0];
    const sourceNote = generic && strongestSource && strongestSource.rank >= 3 ? `${this._t(strongestSource.labelKey)}: ${this._t(strongestSource.severity.key)}` : this._t(chosen.severity.key);
    return {
      kind: "pollen",
      label: generic ? this._t("pollen") : this._t(chosen.labelKey),
      value: chosen.value,
      note: sourceNote,
      level: (strongestSource || chosen).severity.level
    };
  }
  _formatEnvironmentNumber(value, unit = "") {
    const number = this._numberOr(value, NaN);
    if (!Number.isFinite(number)) return "--";
    const rounded = Math.abs(number) < 10 ? Math.round(number * 10) / 10 : Math.round(number);
    const unitText = String(unit || "").trim();
    return `${rounded}${unitText ? ` ${unitText}` : ""}`.trim();
  }
  _entityState(entityId, predicate) {
    if (!entityId) return null;
    const state = this._hass?.states?.[entityId];
    if (!state || state.state === "unknown" || state.state === "unavailable") return null;
    return predicate(entityId, state) ? state : null;
  }
  _formatSensorState(state, fallbackUnit = "") {
    const raw = state?.state;
    const unit = state?.attributes?.unit_of_measurement || state?.attributes?.native_unit_of_measurement || fallbackUnit;
    const number = this._numberOr(raw, NaN);
    if (Number.isFinite(number)) {
      const rounded = Math.abs(number) < 10 ? Math.round(number * 10) / 10 : Math.round(number);
      const unitText = unit ? ` ${unit}` : "";
      return `${rounded}${unitText}`.trim();
    }
    return this._titleCase(raw);
  }
  _airQualitySeverity(value) {
    const raw = String(value || "").toLowerCase();
    const number = this._numberOr(value, NaN);
    if (Number.isFinite(number)) {
      if (number <= 50) return { key: "good", level: "good", rank: 1 };
      if (number <= 100) return { key: "moderate", level: "moderate", rank: 2 };
      if (number <= 150) return { key: "unhealthySensitive", level: "sensitive", rank: 3 };
      if (number <= 200) return { key: "unhealthy", level: "unhealthy", rank: 4 };
      if (number <= 300) return { key: "veryUnhealthy", level: "very-high", rank: 5 };
      return { key: "hazardous", level: "hazardous", rank: 6 };
    }
    if (raw.includes("hazard")) return { key: "hazardous", level: "hazardous", rank: 6 };
    if (raw.includes("very") && raw.includes("unhealthy")) return { key: "veryUnhealthy", level: "very-high", rank: 5 };
    if (raw.includes("unhealthy")) return { key: "unhealthy", level: "unhealthy", rank: 4 };
    if (raw.includes("moderate")) return { key: "moderate", level: "moderate", rank: 2 };
    if (raw.includes("good")) return { key: "good", level: "good", rank: 1 };
    return { key: "unknown", level: "neutral", rank: 0 };
  }
  _pollenSeverity(value, indexValue = NaN) {
    const pollenIndex = this._numberOr(indexValue, NaN);
    if (Number.isFinite(pollenIndex) && pollenIndex >= 0 && pollenIndex <= 5) {
      if (pollenIndex <= 2) return { key: "low", level: "good", rank: 1 };
      if (pollenIndex <= 3) return { key: "moderate", level: "moderate", rank: 2 };
      if (pollenIndex <= 4) return { key: "high", level: "unhealthy", rank: 3 };
      return { key: "veryHigh", level: "very-high", rank: 4 };
    }
    const raw = String(value || "").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    const number = this._numberOr(value, NaN);
    if (Number.isFinite(number)) {
      if (number <= 2.4) return { key: "low", level: "good", rank: 1 };
      if (number <= 4.8) return { key: "moderate", level: "moderate", rank: 2 };
      if (number <= 7.2) return { key: "high", level: "unhealthy", rank: 3 };
      return { key: "veryHigh", level: "very-high", rank: 4 };
    }
    if (raw.includes("very low") || raw === "none") return { key: "low", level: "good", rank: 1 };
    if (raw.includes("very high") || raw.includes("extreme")) return { key: "veryHigh", level: "very-high", rank: 4 };
    if (raw.includes("high")) return { key: "high", level: "unhealthy", rank: 3 };
    if (raw.includes("moderate") || raw.includes("medium")) return { key: "moderate", level: "moderate", rank: 2 };
    if (raw.includes("low")) return { key: "low", level: "good", rank: 1 };
    return { key: "unknown", level: "neutral", rank: 0 };
  }
  _environmentIcon(kind) {
    if (kind === "aqi") {
      return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 14c2.6-3.2 5.4-3.2 8 0s5.4 3.2 8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 9c2.3-2.6 4.7-2.6 7 0s4.7 2.6 7 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".65"/><circle cx="7" cy="18" r="1.6" fill="#65b8df"/><circle cx="13" cy="18" r="1.6" fill="#e8b84b"/><circle cx="19" cy="18" r="1.6" fill="#f97316"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M12 20c0-7 2.5-12 7-15" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M12 14C8.5 14 6 11.5 6 8c3.8 0 6 2.5 6 6Z" fill="#7ecb8f"/><path d="M13 12c3.4-.2 5.5-2.2 5.8-5.6-3.2.2-5.4 2.1-5.8 5.6Z" fill="#9bd779"/><path d="M8 18h8" stroke="#e8b84b" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  async _initRadar(provider) {
    const holder = this.shadowRoot?.getElementById("rmap");
    if (!holder || this._radarMap) return;
    try {
      await this._loadLeaflet();
      if (!window.L || !holder.isConnected) return;
      const { lat, lon } = this._latLon();
      const isBom = provider === "bom";
      const isRainViewer = provider === "rainviewer";
      const configuredZoom = Number(this._config.radar_zoom) || (isBom ? 6 : 7);
      this._radarMap = window.L.map(holder, {
        center: [lat, lon],
        zoom: isBom ? Math.max(3, Math.min(BOM_MAX_DISPLAY_ZOOM, configuredZoom)) : isRainViewer ? Math.max(3, Math.min(RAINVIEWER_MAX_DISPLAY_ZOOM, configuredZoom)) : configuredZoom,
        minZoom: isBom ? 3 : void 0,
        maxZoom: isBom ? BOM_MAX_DISPLAY_ZOOM : isRainViewer ? RAINVIEWER_MAX_DISPLAY_ZOOM : void 0,
        zoomControl: this._config.show_map_controls !== false,
        attributionControl: true
      });
      if (isBom) this._addBomBasemapLayer();
      else this._addBasemapLayer();
      window.L.circleMarker([lat, lon], {
        radius: 5,
        color: "#1a3a50",
        fillColor: "#1a3a50",
        fillOpacity: 1,
        weight: 2
      }).addTo(this._radarMap);
      this._radarMap.invalidateSize();
      [120, 350, 800, 1600].forEach((delay) => window.setTimeout(() => this._radarMap?.invalidateSize(), delay));
      this._watchRadarSize(holder, provider);
      await this._loadRadarLoop(provider);
      await this._loadWarningOverlay();
      this._radarMap.on("moveend zoomend", () => {
        window.clearTimeout(this._radarReloadTimer);
        this._radarReloadTimer = window.setTimeout(async () => {
          await this._loadRadarLoop(provider);
          await this._loadWarningOverlay();
        }, 500);
      });
    } catch (err) {
      this._setRadarLabel(this._t("radarUnavailable"));
      this._teardownRadar();
    }
  }
  _teardownRadar() {
    window.clearInterval(this._radarTimer);
    window.clearTimeout(this._radarReloadTimer);
    this._radarResizeObserver?.disconnect?.();
    this._radarResizeObserver = null;
    this._radarLayers.forEach((item) => item.layer?.remove?.());
    this._warningLayer?.remove?.();
    this._radarLayers = [];
    this._warningLayer = null;
    this._warningPopupMarker = null;
    this._radarIndex = 0;
    this._bomTileErrorCount = 0;
    this._bomFallbackStarted = false;
    if (this._radarMap) {
      this._radarMap.remove();
      this._radarMap = null;
    }
  }
  _watchRadarSize(holder, provider) {
    this._radarResizeObserver?.disconnect?.();
    if (!window.ResizeObserver) return;
    let lastSize = "";
    this._radarResizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width < 50 || rect.height < 50) return;
      const nextSize = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
      if (nextSize === lastSize) return;
      lastSize = nextSize;
      window.clearTimeout(this._radarReloadTimer);
      this._radarReloadTimer = window.setTimeout(async () => {
        if (!this._radarMap) {
          this._scheduleRadarInit(provider);
          return;
        }
        this._radarMap.invalidateSize();
        if (!this._radarLayers.length) await this._loadRadarLoop(provider);
      }, 180);
    });
    this._radarResizeObserver.observe(holder);
  }
  _resumeRadarIfNeeded() {
    const provider = this._resolvedRadarProvider();
    if (provider === "none" || this._config.show_radar === false) return;
    if (this._radarMap) {
      window.setTimeout(() => this._radarMap?.invalidateSize(), 80);
      return;
    }
    window.requestAnimationFrame(() => this._scheduleRadarInit(provider));
  }
  _stopTimelineScroll() {
    if (this._timelineScrollRaf) cancelAnimationFrame(this._timelineScrollRaf);
    window.clearTimeout(this._timelineScrollRetryTimer);
    this._timelineScrollResizeObserver?.disconnect?.();
    this._timelineScrollRaf = null;
    this._timelineScrollRetryTimer = null;
    this._timelineScrollResizeObserver = null;
    this._timelineScrollObserved = null;
    this._timelineScrollLast = null;
  }
  _scheduleTimelineScrollStart(delay = 400, attempt = 0) {
    window.clearTimeout(this._timelineScrollRetryTimer);
    this._timelineScrollRetryTimer = window.setTimeout(() => this._startTimelineScroll(attempt), delay);
  }
  _cancelTimelineScrollFrame() {
    if (this._timelineScrollRaf) cancelAnimationFrame(this._timelineScrollRaf);
    this._timelineScrollRaf = null;
    this._timelineScrollLast = null;
  }
  _watchTimelineScrollContainer(container) {
    if (!window.ResizeObserver || this._timelineScrollObserved === container) return;
    this._timelineScrollResizeObserver?.disconnect?.();
    this._timelineScrollObserved = container;
    let lastGeometry = "";
    this._timelineScrollResizeObserver = new ResizeObserver(() => {
      if (!this._config.timeline_autoscroll || !container.isConnected) return;
      const geometry = `${container.clientHeight}:${container.scrollHeight}`;
      if (geometry === lastGeometry) return;
      lastGeometry = geometry;
      this._scheduleTimelineScrollStart(120);
    });
    this._timelineScrollResizeObserver.observe(container);
  }
  _setupCardResizeObserver() {
    this._cardResizeObserver?.disconnect?.();
    this._cardResizeObserver = null;
    const threshold = this._config.stack_below || 0;
    const grid = this.shadowRoot?.querySelector(".card-grid");
    if (!grid || !threshold || !window.ResizeObserver) return;
    const outer = this.shadowRoot.querySelector(".card-outer");
    if (!outer) return;
    this._cardResizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (!width) return;
      grid.classList.toggle("ww-force-stack", width < threshold);
    });
    this._cardResizeObserver.observe(outer);
  }
  _startTimelineScroll(attempt = 0) {
    window.clearTimeout(this._timelineScrollRetryTimer);
    this._timelineScrollRetryTimer = null;
    this._cancelTimelineScrollFrame();
    const container = this.shadowRoot?.querySelector(".hourly-left");
    if (!container) return;
    this._watchTimelineScrollContainer(container);
    if (container.scrollHeight <= container.clientHeight + 4) {
      if (attempt < 12) this._scheduleTimelineScrollStart(250, attempt + 1);
      return;
    }
    const SPEED = 22;
    const PAUSE = 2200;
    this._timelineScrollDir = 1;
    this._timelineScrollPauseUntil = Date.now() + PAUSE;
    const tick = (timestamp) => {
      this._timelineScrollRaf = requestAnimationFrame(tick);
      const el = this.shadowRoot?.querySelector(".hourly-left");
      if (!el) {
        this._stopTimelineScroll();
        return;
      }
      const now = Date.now();
      if (now < this._timelineScrollPauseUntil) {
        this._timelineScrollLast = timestamp;
        return;
      }
      if (this._timelineScrollLast === null) {
        this._timelineScrollLast = timestamp;
        return;
      }
      const dt = (timestamp - this._timelineScrollLast) / 1e3;
      this._timelineScrollLast = timestamp;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) {
        this._stopTimelineScroll();
        return;
      }
      el.scrollTop += this._timelineScrollDir * SPEED * dt;
      if (this._timelineScrollDir === 1 && el.scrollTop >= maxScroll - 1) {
        el.scrollTop = maxScroll;
        this._timelineScrollDir = -1;
        this._timelineScrollPauseUntil = now + PAUSE;
      } else if (this._timelineScrollDir === -1 && el.scrollTop <= 1) {
        el.scrollTop = 0;
        this._timelineScrollDir = 1;
        this._timelineScrollPauseUntil = now + PAUSE;
      }
    };
    if (!container.__radarWiseTimelineScrollWired) {
      container.addEventListener("mouseenter", () => {
        this._timelineScrollPauseUntil = Date.now() + 864e5;
      }, { passive: true });
      container.addEventListener("mouseleave", () => {
        this._timelineScrollPauseUntil = Date.now() + 800;
      }, { passive: true });
      container.__radarWiseTimelineScrollWired = true;
    }
    this._timelineScrollRaf = requestAnimationFrame(tick);
  }
  async _loadLeaflet() {
    if (window.L) return;
    if (window.__weatherWiseLeafletPromise) {
      try {
        await window.__weatherWiseLeafletPromise;
      } catch (err) {
        window.__weatherWiseLeafletPromise = null;
        throw err;
      }
      return;
    }
    window.__weatherWiseLeafletPromise = Promise.resolve().then(() => __toESM(require_leaflet_src(), 1)).then((module) => {
      window.L = module.default || module;
    });
    try {
      await window.__weatherWiseLeafletPromise;
    } catch (err) {
      window.__weatherWiseLeafletPromise = null;
      throw err;
    }
  }
  _setRadarLabel(text) {
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label) label.textContent = text;
  }
  _resolvedRadarProvider() {
    if (this._config.show_radar === false) return "none";
    if (this._config.radar_provider === "none") return "none";
    if (this._config.radar_provider === "noaa") return "noaa";
    if (this._config.radar_provider === "envcanada") return "envcanada";
    if (this._config.radar_provider === "bom") return "bom";
    if (this._config.radar_provider === "rainviewer") return "rainviewer";
    if (this._config.country === "us") return "noaa";
    if (this._config.country === "ca") return "envcanada";
    if (this._config.country === "au") return "bom";
    return "rainviewer";
  }
  async _loadRadarLoop(provider) {
    if (!this._radarMap || !window.L) return;
    if (provider === "rainviewer") {
      await this._loadRainViewerLoop();
      return;
    }
    if (provider === "envcanada") {
      await this._loadEnvCanadaLoop();
      return;
    }
    if (provider === "bom") {
      await this._loadBomLoop();
      return;
    }
    await this._loadNoaaLoop();
  }
  async _loadRainViewerLoop() {
    const label = this.shadowRoot?.getElementById("radar-lbl");
    try {
      const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      const data = await response.json();
      const frames = this._rainViewerFrames(data);
      const host = data?.host || "https://tilecache.rainviewer.com";
      if (!frames.length) throw new Error("No RainViewer frames");
      this._radarLabelText = this._config.radar_timeline === "future" ? `RainViewer ${this._t("futureRadar")}` : `RainViewer ${this._t("radarLoop")}`;
      this._replaceRadarLayers(frames.slice(-12).map((frame, index, list) => ({
        time: new Date(frame.time * 1e3),
        layer: window.L.tileLayer(`${host}${frame.path}/256/{z}/{x}/{y}/${this._rainViewerColor()}/1_1.png`, {
          opacity: index === list.length - 1 ? this._radarOpacity() : 0,
          zIndex: 20,
          maxNativeZoom: RAINVIEWER_MAX_NATIVE_ZOOM,
          maxZoom: RAINVIEWER_MAX_DISPLAY_ZOOM,
          attribution: "Radar &copy; RainViewer"
        })
      })));
      if (label) label.textContent = `${this._shortTime(this._radarLayers[this._radarLayers.length - 1].time)} ${this._radarLabelText}`;
      this._animateRadar(this._radarLabelText);
    } catch (err) {
      if (label) label.textContent = this._t("rainviewerUnavailable");
    }
  }
  async _loadNoaaLoop() {
    const frames = this._noaaFrames();
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    this._radarLabelText = selectedFrames.length === 1 ? `NOAA ${this._t("currentRadar")}` : `NOAA ${this._t("radarLoop")}`;
    this._replaceRadarLayers(selectedFrames.map((frameTime, index) => ({
      time: frameTime,
      layer: window.L.imageOverlay(this._noaaUrl(frameTime), this._radarMap.getBounds(), {
        opacity: index === selectedFrames.length - 1 ? this._radarOpacity() : 0,
        zIndex: 20,
        interactive: false
      })
    })));
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label) label.textContent = `${this._shortTime(selectedFrames.at(-1))} ${this._radarLabelText}`;
    this._animateRadar(this._radarLabelText);
  }
  async _loadEnvCanadaLoop() {
    const frames = this._envCanadaFrames();
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    this._radarLabelText = selectedFrames.length === 1 ? `Environment Canada ${this._t("currentRadar")}` : `Environment Canada ${this._t("radarLoop")}`;
    this._replaceRadarLayers(selectedFrames.map((frameTime, index) => ({
      time: frameTime,
      layer: window.L.tileLayer.wms("https://geo.weather.gc.ca/geomet", {
        layers: "RADAR_1KM_RRAI",
        styles: this._envCanadaStyle(),
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        time: frameTime.toISOString().replace(/\.\d{3}Z$/, "Z"),
        opacity: index === selectedFrames.length - 1 ? this._radarOpacity() : 0,
        zIndex: 20,
        attribution: "Radar &copy; Environment and Climate Change Canada"
      })
    })));
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label) label.textContent = `${this._shortTime(selectedFrames.at(-1))} ${this._radarLabelText}`;
    this._animateRadar(this._radarLabelText);
  }
  async _loadBomLoop() {
    const label = this.shadowRoot?.getElementById("radar-lbl");
    const frames = this._bomFrames();
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    this._bomTileErrorCount = 0;
    this._bomFallbackStarted = false;
    this._radarLabelText = selectedFrames.length === 1 ? `BOM ${this._t("currentRadar")}` : `BOM ${this._t("radarLoop")}`;
    this._replaceRadarLayers(selectedFrames.map((frameTime, index, list) => ({
      time: frameTime,
      layer: this._createBomTileLayer(this._bomTimestamp(frameTime), {
        opacity: index === list.length - 1 ? this._bomOpacity() : 0,
        zIndex: 25,
        noWrap: true,
        bounds: BOM_AUSTRALIA_BOUNDS,
        maxNativeZoom: BOM_MAX_NATIVE_ZOOM,
        maxZoom: BOM_MAX_DISPLAY_ZOOM,
        attribution: "Radar &copy; Bureau of Meteorology"
      })
    })));
    if (label) label.textContent = `${this._shortTime(selectedFrames.at(-1))} ${this._radarLabelText}`;
    this._animateRadar(this._radarLabelText);
  }
  _bomFrames() {
    const stepMs = BOM_WMTS_LAYER.stepMinutes * 60 * 1e3;
    const lagMs = BOM_WMTS_LAYER.lagMinutes * 60 * 1e3;
    const roundedNow = Math.floor((Date.now() - lagMs) / stepMs) * stepMs;
    return Array.from({ length: 12 }, (_, i) => new Date(roundedNow - (11 - i) * stepMs));
  }
  _bomTimestamp(frameTime) {
    return frameTime.toISOString().replace(/\.\d{3}Z$/, "Z");
  }
  _createBomTileLayer(time, options = {}) {
    const card = this;
    const BomTileLayer = window.L.TileLayer.extend({
      getTileUrl(coords) {
        return card._bomTileUrl(coords, time);
      },
      createTile(coords, done) {
        const tile = document.createElement("img");
        tile.alt = "";
        const offset = card._bomTileOffset(coords.z);
        if (offset) {
          tile.style.marginLeft = `${offset.xShiftPx}px`;
          tile.style.marginTop = `${offset.yShiftPx}px`;
        }
        const url = this.getTileUrl(coords);
        if (!url) {
          tile.src = TRANSPARENT_PIXEL;
          window.setTimeout(() => done(null, tile), 0);
          return tile;
        }
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          done(null, tile);
        };
        tile.onload = finish;
        tile.onerror = () => {
          tile.onerror = null;
          card._bomTileErrorCount += 1;
          if (card._bomTileErrorCount >= 3) card._scheduleBomGifFallback();
          tile.src = TRANSPARENT_PIXEL;
          finish();
        };
        tile.src = url;
        return tile;
      }
    });
    return new BomTileLayer("", options);
  }
  _scheduleBomGifFallback() {
    if (this._bomFallbackStarted || this._resolvedRadarProvider() !== "bom") return;
    this._bomFallbackStarted = true;
    window.setTimeout(() => this._renderBomGifFallback(), 0);
  }
  async _renderBomGifFallback() {
    const holder = this.shadowRoot?.getElementById("rmap");
    const label = this.shadowRoot?.getElementById("radar-lbl");
    const station = this._bomStation();
    if (!holder || !station) {
      if (label) label.textContent = this._t("radarUnavailable");
      return;
    }
    this._teardownRadar();
    this._bomFallbackStarted = true;
    const controls = this.shadowRoot?.querySelector(".radar-controls");
    if (controls) controls.removeAttribute("hidden");
    holder.innerHTML = `
      <div class="bom-fallback-radar" role="img" aria-label="${_wwEscape(station.name)} BOM radar loop">
        <img class="bom-fallback-layer bom-fallback-base" alt="" src="${this._bomLegacyOverlayUrl(station, "background")}">
        <img class="bom-fallback-layer bom-fallback-terrain" alt="" src="${this._bomLegacyOverlayUrl(station, "topography")}">
        <img class="bom-fallback-layer bom-fallback-image bom-fallback-frame" alt="">
        <img class="bom-fallback-layer bom-fallback-overlay" alt="" src="${this._bomLegacyOverlayUrl(station, "range")}">
        <img class="bom-fallback-layer bom-fallback-labels" alt="" src="${this._bomLegacyOverlayUrl(station, "locations")}">
      </div>
    `;
    holder.querySelectorAll(".bom-fallback-layer").forEach((layer) => {
      layer.onerror = () => {
        layer.hidden = true;
      };
    });
    const img = holder.querySelector(".bom-fallback-frame");
    const frames = await this._bomLegacyFrames(station);
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    if (!img || !selectedFrames.length) {
      if (label) label.textContent = `BOM ${this._t("radarUnavailable")}`;
      return;
    }
    const staticFallback = `${BOM_GIF_HOST}/radar/${station.id}.gif?_=${Math.floor(Date.now() / (5 * 60 * 1e3))}`;
    let lastRequestedSrc = "";
    let lastGoodSrc = "";
    img.onload = () => {
      if (img.src === lastRequestedSrc) lastGoodSrc = img.src;
    };
    img.onerror = () => {
      if (lastGoodSrc && img.src !== lastGoodSrc) {
        img.src = lastGoodSrc;
        return;
      }
      if (img.src !== staticFallback) img.src = staticFallback;
      if (label) label.textContent = `${station.name} BOM ${this._t("currentRadar")}`;
    };
    selectedFrames.forEach((frame) => {
      const preload = new Image();
      preload.src = frame.url;
    });
    this._radarLabelText = selectedFrames.length === 1 ? `BOM ${this._t("currentRadar")}` : `BOM ${this._t("radarLoop")}`;
    this._radarLayers = selectedFrames.map((frame) => ({
      time: frame.time,
      layer: {
        remove() {
        },
        addTo() {
        },
        setOpacity: (opacity) => {
          if (opacity <= 0) return;
          lastRequestedSrc = frame.url;
          if (img.src !== frame.url) img.src = frame.url;
        }
      }
    }));
    this._radarIndex = Math.max(0, this._radarLayers.length - 1);
    this._radarPlaying = this._radarLayers.length > 1;
    this._showRadarFrame(this._radarIndex);
    this._animateRadar(this._radarLabelText);
    window.clearTimeout(this._radarReloadTimer);
    this._radarReloadTimer = window.setTimeout(() => this._renderBomGifFallback(), 5 * 60 * 1e3);
  }
  async _bomLegacyFrames(station) {
    const parsed = await this._fetchBomLegacyFrameList(station);
    if (parsed.length) return parsed;
    return this._generatedBomLegacyFrames(station);
  }
  async _fetchBomLegacyFrameList(station) {
    try {
      const response = await fetch(`${BOM_GIF_HOST}/products/${station.id}.loop.shtml`, { cache: "no-store" });
      if (!response.ok) throw new Error(`BOM loop page ${response.status}`);
      const html = await response.text();
      return Array.from(html.matchAll(/theImageNames\[\d+\]\s*=\s*"([^"]+)"/g)).map((match) => this._bomLegacyFrameFromPath(match[1])).filter(Boolean);
    } catch (err) {
      return [];
    }
  }
  _bomLegacyFrameFromPath(path) {
    const match = String(path || "").match(/\/radar\/([^/]+?\.T\.(\d{12})\.png)/);
    if (!match) return null;
    const stamp = match[2];
    const time = new Date(Date.UTC(
      Number(stamp.slice(0, 4)),
      Number(stamp.slice(4, 6)) - 1,
      Number(stamp.slice(6, 8)),
      Number(stamp.slice(8, 10)),
      Number(stamp.slice(10, 12))
    ));
    if (Number.isNaN(time.getTime())) return null;
    return { time, url: `${BOM_GIF_HOST}/radar/${match[1]}` };
  }
  _bomLegacyOverlayUrl(station, layer) {
    return `${BOM_GIF_HOST}/products/radar_transparencies/${station.id}.${layer}.png`;
  }
  _generatedBomLegacyFrames(station) {
    const stepMs = 5 * 60 * 1e3;
    const latest = Math.floor((Date.now() - 60 * 1e3) / stepMs) * stepMs - 60 * 1e3;
    return Array.from({ length: BOM_LEGACY_FRAME_COUNT }, (_, index) => {
      const time = new Date(latest - (BOM_LEGACY_FRAME_COUNT - 1 - index) * stepMs);
      const stamp = this._bomLegacyFrameStamp(time);
      return { time, url: `${BOM_GIF_HOST}/radar/${station.id}.T.${stamp}.png` };
    });
  }
  _bomLegacyFrameStamp(time) {
    const year = time.getUTCFullYear();
    const month = String(time.getUTCMonth() + 1).padStart(2, "0");
    const day = String(time.getUTCDate()).padStart(2, "0");
    const hour = String(time.getUTCHours()).padStart(2, "0");
    const minute = String(time.getUTCMinutes()).padStart(2, "0");
    return `${year}${month}${day}${hour}${minute}`;
  }
  _bomTileUrl(coords, time) {
    const offset = this._bomTileOffset(coords.z);
    if (!offset) return "";
    const col = coords.x - offset.xOffset;
    const row = coords.y - offset.yOffset;
    if (col < 0 || col >= offset.width || row < 0 || row >= offset.height) return "";
    return `${BOM_WMTS_BASE}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${BOM_WMTS_LAYER.id}&STYLE=default&FORMAT=image/png&TILEMATRIXSET=${BOM_WMTS_LAYER.matrixSet}&TILEMATRIX=${coords.z}&TILEROW=${row}&TILECOL=${col}&time=${encodeURIComponent(time)}`;
  }
  _bomTileOffset(z) {
    const info = BOM_TILE_MATRIX_SETS[BOM_WMTS_LAYER.matrixSet]?.[z];
    if (!info) return null;
    const tileSpan = BOM_WORLD_EXTENT / Math.pow(2, z);
    const xOffset = Math.round((info.tlx + BOM_HALF_EXTENT) / tileSpan);
    const yOffset = Math.round((BOM_HALF_EXTENT - info.tly) / tileSpan);
    return {
      xOffset,
      yOffset,
      xShiftPx: ((info.tlx + BOM_HALF_EXTENT) / tileSpan - xOffset) * 256,
      yShiftPx: ((BOM_HALF_EXTENT - info.tly) / tileSpan - yOffset) * 256,
      width: info.w,
      height: info.h
    };
  }
  _replaceRadarLayers(layers) {
    window.clearInterval(this._radarTimer);
    this._radarLayers.forEach((item) => item.layer?.remove?.());
    this._radarLayers = layers;
    this._radarIndex = Math.max(0, layers.length - 1);
    this._radarLayers.forEach((item) => item.layer.addTo(this._radarMap));
    this._showRadarFrame(this._radarIndex);
  }
  _animateRadar(labelText) {
    this._radarLabelText = labelText;
    if (this._radarLayers.length <= 1) {
      this._radarPlaying = false;
      this._updateRadarPlayButton();
      return;
    }
    this._radarTimer = window.setInterval(() => {
      if (!this._radarPlaying) return;
      this._stepRadar(1, false);
    }, this._config.radar_speed || 700);
    this._updateRadarPlayButton();
  }
  _toggleRadarPlayback() {
    this._radarPlaying = !this._radarPlaying;
    this._updateRadarPlayButton();
  }
  _updateRadarPlayButton() {
    const button = this.shadowRoot?.querySelector('[data-radar-action="play"]');
    if (!button) return;
    button.textContent = this._radarPlaying ? "||" : ">";
    button.title = this._radarPlaying ? this._t("pauseRadarLoop") : this._t("playRadarLoop");
    button.setAttribute("aria-label", button.title);
  }
  _stepRadar(delta, pause = true) {
    if (!this._radarLayers.length) return;
    if (pause) {
      this._radarPlaying = false;
      this._updateRadarPlayButton();
    }
    this._radarIndex = (this._radarIndex + delta + this._radarLayers.length) % this._radarLayers.length;
    this._showRadarFrame(this._radarIndex);
  }
  _showRadarFrame(index) {
    if (!this._radarLayers.length) return;
    const opacity = this._resolvedRadarProvider() === "bom" ? this._bomOpacity() : this._radarOpacity();
    this._radarLayers.forEach((item, layerIndex) => item.layer.setOpacity(layerIndex === index ? opacity : 0));
    const active = this._radarLayers[index];
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label && active) label.textContent = `${this._shortTime(active.time)} ${this._radarLabelText}`;
  }
  _noaaFrames() {
    const stepMs = 5 * 60 * 1e3;
    const roundedNow = Math.floor(Date.now() / stepMs) * stepMs;
    return Array.from({ length: 12 }, (_, i) => new Date(roundedNow - (11 - i) * stepMs));
  }
  _envCanadaFrames() {
    const stepMs = 6 * 60 * 1e3;
    const roundedNow = Math.floor(Date.now() / stepMs) * stepMs;
    return Array.from({ length: 12 }, (_, i) => new Date(roundedNow - (11 - i) * stepMs));
  }
  _bomStation() {
    const { lat, lon } = this._latLon();
    return BOM_RADARS.reduce((nearest, station) => {
      const distance = this._distanceKm(lat, lon, station.lat, station.lon);
      return !nearest || distance < nearest.distance ? { ...station, distance } : nearest;
    }, null);
  }
  _bomBounds(station) {
    const rangeKm = 128;
    const latRadius = rangeKm / 111.32;
    const lonRadius = rangeKm / (111.32 * Math.max(0.2, Math.cos(station.lat * Math.PI / 180)));
    return [
      [station.lat - latRadius, station.lon - lonRadius],
      [station.lat + latRadius, station.lon + lonRadius]
    ];
  }
  _distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (value) => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  _rainViewerFrames(data) {
    if (this._config.radar_timeline === "latest") return (data?.radar?.past || []).slice(-1);
    if (this._config.radar_timeline === "future") {
      const future = data?.radar?.nowcast || data?.radar?.forecast || [];
      return future.length ? future : (data?.radar?.past || []).slice(-1);
    }
    return data?.radar?.past || [];
  }
  _noaaUrl(frameTime) {
    const bounds = this._radarMap.getBounds();
    const size = this._radarMap.getSize();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const service = "https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer";
    return `${service}/exportImage?bbox=${encodeURIComponent([sw.lng, sw.lat, ne.lng, ne.lat].join(","))}&bboxSR=4326&imageSR=4326&size=${Math.max(256, Math.round(size.x))},${Math.max(256, Math.round(size.y))}&format=png32&transparent=true&f=image&time=${frameTime.getTime()}&_=${Date.now()}`;
  }
  _radarOpacity() {
    const values = { standard: 0.76, vivid: 0.9, soft: 0.58 };
    return values[this._config.radar_style] ?? values.standard;
  }
  _rainViewerColor() {
    const values = { standard: 2, vivid: 4, soft: 1 };
    return values[this._config.radar_style] ?? values.standard;
  }
  _envCanadaStyle() {
    const values = {
      standard: "Radar-Rain_14colors",
      vivid: "RADARURPPRECIPR14",
      soft: "Radar-Rain_8colors"
    };
    return values[this._config.radar_style] ?? values.standard;
  }
  _bomOpacity() {
    const values = { standard: 0.9, vivid: 1, soft: 0.78 };
    return values[this._config.radar_style] ?? values.standard;
  }
  _addBasemapLayer() {
    const basemap = this._basemap();
    const fallback = this._basemap("light");
    let failed = false;
    const layer = window.L.tileLayer(basemap.url, basemap.options).addTo(this._radarMap);
    layer.on?.("tileerror", () => {
      if (failed || !this._radarMap || basemap.url === fallback.url) return;
      failed = true;
      layer.remove?.();
      window.L.tileLayer(fallback.url, fallback.options).addTo(this._radarMap);
    });
  }
  _addBomBasemapLayer() {
    const dark = this._config.radar_basemap === "dark";
    const url = dark ? BOM_BASEMAPS.dark : BOM_BASEMAPS.default;
    window.L.tileLayer(url, {
      maxNativeZoom: 10,
      maxZoom: BOM_MAX_DISPLAY_ZOOM,
      noWrap: true,
      bounds: BOM_AUSTRALIA_BOUNDS,
      attribution: "&copy; Bureau of Meteorology"
    }).addTo(this._radarMap);
  }
  _basemap(kind = this._config.radar_basemap) {
    const basemaps = {
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      },
      osm: {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      },
      light: {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      }
    };
    return basemaps[kind] || basemaps.light;
  }
  async _loadWarningOverlay() {
    if (!this._radarMap || !window.L || this._config.show_warning_overlay === false || this._config.country !== "us") return;
    this._warningLayer?.remove?.();
    this._warningLayer = null;
    this._warningPopupMarker = null;
    const label = this.shadowRoot?.getElementById("radar-lbl");
    const alert = this.shadowRoot?.getElementById("radar-alert");
    if (alert) {
      alert.hidden = true;
      alert.textContent = "";
      alert.onclick = null;
      alert.onkeydown = null;
    }
    const { lat, lon } = this._latLon();
    try {
      const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
        headers: {
          "User-Agent": `RadarWise/${CARD_VERSION} (github.com/TheWillMiller/radar-wise)`,
          Accept: "application/geo+json"
        }
      });
      if (!response.ok) throw new Error("NWS alerts unavailable");
      const data = await response.json();
      const features = Array.isArray(data?.features) ? data.features : [];
      if (!features.length) return;
      const group = window.L.layerGroup();
      const featuresWithGeometry = features.filter((feature) => feature.geometry);
      if (featuresWithGeometry.length) {
        window.L.geoJSON({ type: "FeatureCollection", features: featuresWithGeometry }, {
          style: (feature) => this._warningStyle(feature?.properties?.severity),
          interactive: true,
          onEachFeature: (feature, layer) => layer.bindPopup?.(this._alertPopup(feature.properties || {}))
        }).addTo(group);
      }
      const headline = features[0]?.properties?.headline || `${features.length} ${this._t("activeWeatherAlert")}${features.length === 1 ? "" : "s"}`;
      const popupHtml = this._alertsPopup(features);
      const marker = window.L.circleMarker([lat, lon], {
        radius: 9,
        color: "#b91c1c",
        fillColor: "#ef4444",
        fillOpacity: 0.85,
        interactive: true,
        bubblingMouseEvents: false,
        weight: 2
      }).bindPopup(popupHtml, { closeButton: true, autoPan: true }).addTo(group);
      window.L.circleMarker([lat, lon], {
        radius: 20,
        color: "#b91c1c",
        opacity: 0,
        fillColor: "#ef4444",
        fillOpacity: 0.01,
        interactive: true,
        bubblingMouseEvents: false,
        weight: 0
      }).bindPopup(popupHtml, { closeButton: true, autoPan: true }).addTo(group);
      this._warningPopupMarker = marker;
      this._warningLayer = group.addTo(this._radarMap);
      if (alert) {
        alert.hidden = false;
        alert.setAttribute("role", "button");
        alert.setAttribute("tabindex", "0");
        alert.textContent = `${features.length} ${this._t(features.length === 1 ? "nwsAlertTap" : "nwsAlertsTap")}`;
        alert.title = headline;
        alert.onclick = (event) => {
          event.stopPropagation();
          this._warningPopupMarker?.openPopup?.();
        };
        alert.onkeydown = (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this._warningPopupMarker?.openPopup?.();
          }
        };
      }
    } catch (err) {
      if (label && this._config.debug?.enabled) label.textContent = `${label.textContent} + ${this._t("radarUnavailable")}`;
    }
  }
  _warningStyle(severity) {
    const colors = {
      Extreme: "#7f1d1d",
      Severe: "#dc2626",
      Moderate: "#f97316",
      Minor: "#facc15"
    };
    const color = colors[severity] || "#dc2626";
    return { color, fillColor: color, fillOpacity: 0.16, opacity: 0.82, weight: 2 };
  }
  _alertsPopup(features) {
    const items = (features || []).map((feature, index) => this._alertPopup(feature?.properties || {}, index + 1, features.length)).join("");
    return items ? `<div class="alert-popup-list">${items}</div>` : this._alertPopup({});
  }
  _alertPopup(props, index = NaN, total = NaN) {
    const event = _wwEscape(props.event || this._t("weatherAlert"));
    const headline = _wwEscape(props.headline || "");
    const severity = _wwEscape(props.severity || this._t("unknown"));
    const alertNumber = Number(index);
    const alertTotal = Number(total);
    const count = Number.isFinite(alertNumber) && Number.isFinite(alertTotal) && alertTotal > 1 ? `<span class="alert-popup-count">${alertNumber}/${alertTotal}</span>` : "";
    return `
      <div class="alert-popup-item">
        <div class="alert-popup-heading"><strong>${event}</strong>${count}</div>
        ${headline ? `<div class="alert-popup-headline">${headline}</div>` : ""}
        <div class="alert-popup-severity">${_wwEscape(this._t("severity"))}: ${severity}</div>
      </div>
    `;
  }
  _unitContext(attrs) {
    const nativeTemp = this._normalizedTempUnit(attrs.temperature_unit || attrs.native_temperature_unit || this._hass?.config?.unit_system?.temperature || "\xB0F");
    const target = this._config.units === "metric" ? "\xB0C" : this._config.units === "imperial" ? "\xB0F" : nativeTemp;
    return {
      sourceTemperatureUnit: nativeTemp,
      temperatureUnit: target,
      windSpeedUnit: attrs.wind_speed_unit || (target === "\xB0C" ? "km/h" : "mph"),
      precipitationUnit: attrs.precipitation_unit || attrs.native_precipitation_unit || (target === "\xB0C" ? "mm" : "in")
    };
  }
  _normalizedTempUnit(unit) {
    const value = String(unit || "").trim().toUpperCase();
    if (value === "C" || value === "\xB0C") return "\xB0C";
    if (value === "F" || value === "\xB0F") return "\xB0F";
    return unit;
  }
  _tempValue(value, units) {
    const sourceUnit = this._normalizedTempUnit(value && typeof value === "object" ? value.unit || units.sourceTemperatureUnit : units.sourceTemperatureUnit);
    const targetUnit = this._normalizedTempUnit(units.temperatureUnit);
    const rawValue = value && typeof value === "object" ? value.value : value;
    const number = this._numberOr(rawValue, NaN);
    if (!Number.isFinite(number)) return NaN;
    if (sourceUnit === targetUnit) return number;
    if (sourceUnit === "\xB0F" && targetUnit === "\xB0C") return (number - 32) * 5 / 9;
    if (sourceUnit === "\xB0C" && targetUnit === "\xB0F") return number * 9 / 5 + 32;
    return number;
  }
  _currentTemperature(attrs) {
    const entityId = this._config.temperature_entity;
    const state = entityId ? this._hass?.states?.[entityId] : null;
    if (state && isRadarWiseTemperatureEntity(entityId, state)) {
      return {
        value: state.state,
        unit: state.attributes?.unit_of_measurement || state.attributes?.native_unit_of_measurement || this._hass?.config?.unit_system?.temperature
      };
    }
    return attrs.temperature;
  }
  _displayTemp(value, units, includeUnit = true) {
    const number = this._tempValue(value, units);
    const rounded = Number.isFinite(number) ? String(Math.round(number)) : "--";
    return `${rounded}\xB0${includeUnit ? units.temperatureUnit.replace("\xB0", "") : ""}`;
  }
  _formatPrecip(item, units) {
    const probability = this._precipProbability(item);
    const amount = this._precipAmount(item);
    const parts = [];
    if (Number.isFinite(probability)) parts.push(`${Math.round(probability)}%`);
    if (Number.isFinite(amount.value)) parts.push(this._formatPrecipAmount(amount.value, amount.unit || units.precipitationUnit));
    return parts.length ? parts.join(" / ") : "";
  }
  _precipProbability(item) {
    const value = [
      item?.precipitation_probability,
      item?.precipitationProbability,
      item?.precip_probability,
      item?.probability_of_precipitation
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    return Number.isFinite(value) ? value : NaN;
  }
  _precipAmount(item) {
    const value = [
      item?.precipitation,
      item?.native_precipitation,
      item?.precipitation_amount,
      item?.rain,
      item?.rainfall
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    return {
      value: Number.isFinite(value) ? value : NaN,
      unit: item?.precipitation_unit || item?.native_precipitation_unit
    };
  }
  _formatPrecipAmount(value, unit) {
    const rounded = Math.abs(value) < 1 ? Math.round(value * 100) / 100 : Math.round(value * 10) / 10;
    return `${rounded}${unit || ""}`;
  }
  _formatHiLo(daily, hourly, units) {
    let hi = this._tempValue(daily?.[0]?.temperature ?? daily?.[0]?.high_temperature, units);
    let lo = this._tempValue(daily?.[0]?.templow ?? daily?.[0]?.low_temperature, units);
    if ((!Number.isFinite(hi) || !Number.isFinite(lo)) && hourly.length) {
      const next24 = hourly.slice(0, 24).map((item) => this._tempValue(item.temperature, units)).filter(Number.isFinite);
      if (next24.length) {
        hi = Math.max(...next24);
        lo = Math.min(...next24);
      }
    }
    return `${Number.isFinite(hi) ? Math.round(hi) : "--"}\xB0 / ${Number.isFinite(lo) ? Math.round(lo) : "--"}\xB0`;
  }
  _formatWind(attrs, units) {
    return this._windInfo(attrs, units).display;
  }
  _windInfo(attrs, units) {
    const configuredSpeedEntityId = this._config.wind_speed_entity;
    const configuredDirectionEntityId = this._config.wind_direction_entity;
    const speedState = configuredSpeedEntityId ? this._hass?.states?.[configuredSpeedEntityId] : null;
    const directionState = configuredDirectionEntityId ? this._hass?.states?.[configuredDirectionEntityId] : null;
    const hasConfiguredSpeed = speedState && isRadarWiseWindSpeedEntity(configuredSpeedEntityId, speedState);
    const hasConfiguredDirection = directionState && isRadarWiseWindDirectionEntity(configuredDirectionEntityId, directionState);
    const weatherDirection = attrs.wind_direction ?? attrs.windDirection ?? attrs.wind_bearing;
    const speedRaw = hasConfiguredSpeed ? speedState.state : attrs.wind_speed;
    const speedValue = this._candidateNumber(speedRaw);
    const speedUnit = hasConfiguredSpeed ? speedState.attributes?.unit_of_measurement || speedState.attributes?.native_unit_of_measurement || units.windSpeedUnit : attrs.wind_speed_unit || units.windSpeedUnit;
    const directionRaw = hasConfiguredDirection ? directionState.state : weatherDirection;
    const direction = this._windDirectionLabel(directionRaw);
    const displaySpeed = Number.isFinite(speedValue) ? this._formatNumber(speedValue) : "--";
    const display = `${direction ? `${direction} ` : ""}${displaySpeed} ${speedUnit || units.windSpeedUnit}`.trim();
    return {
      display,
      source: [
        hasConfiguredSpeed ? `speed.entity.${configuredSpeedEntityId}` : "speed.weather",
        hasConfiguredDirection ? `direction.entity.${configuredDirectionEntityId}` : "direction.weather"
      ].join(" + "),
      raw: {
        speed: speedRaw,
        speed_unit: speedUnit,
        direction: directionRaw
      }
    };
  }
  _windDirectionLabel(value) {
    if (value === void 0 || value === null || value === "") return "";
    const raw = String(value).trim();
    const bearing = Number(raw);
    if (Number.isFinite(bearing)) return this._bearingToCardinal(bearing);
    const normalized = raw.toUpperCase().replace(/[^A-Z]/g, "");
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    if (directions.includes(normalized)) return normalized;
    const words = normalized.replace("NORTH", "N").replace("SOUTH", "S").replace("EAST", "E").replace("WEST", "W");
    return directions.includes(words) ? words : raw;
  }
  _bearingToCardinal(bearing) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const normalized = (Number(bearing) % 360 + 360) % 360;
    return directions[Math.round(normalized / 22.5) % directions.length];
  }
  _candidateNumber(value) {
    if (value && typeof value === "object") {
      return this._numberOr(value.value ?? value.native_value ?? value.state, NaN);
    }
    return this._numberOr(value, NaN);
  }
  _forecastCandidate(forecastSources, keys) {
    for (const periods of forecastSources || []) {
      if (!Array.isArray(periods)) continue;
      for (const item of periods.slice(0, 12)) {
        for (const key of keys) {
          const raw = item?.[key];
          if (raw === void 0 || raw === null || raw === "") continue;
          const value = this._candidateNumber(raw);
          if (Number.isFinite(value)) {
            return { raw, value, source: `forecast.${key}` };
          }
        }
      }
    }
    return { raw: void 0, value: NaN, source: "missing" };
  }
  _humidityInfo(attrs, forecastSources = []) {
    const configuredEntityId = this._config.humidity_entity;
    const configuredState = configuredEntityId ? this._hass?.states?.[configuredEntityId] : null;
    const configured = isRadarWiseHumidityEntity(configuredEntityId, configuredState) ? configuredState : null;
    const candidates = [
      { raw: configured?.state, source: configuredEntityId ? `entity.${configuredEntityId}` : "entity.auto" },
      { raw: attrs.humidity, source: "weather.attributes.humidity" },
      { raw: attrs.relative_humidity, source: "weather.attributes.relative_humidity" },
      { raw: attrs.relativeHumidity, source: "weather.attributes.relativeHumidity" },
      { raw: attrs.native_humidity, source: "weather.attributes.native_humidity" }
    ];
    for (const candidate of candidates) {
      const value = this._candidateNumber(candidate.raw);
      if (Number.isFinite(value)) {
        return { value, display: String(Math.round(value)), source: candidate.source, raw: candidate.raw };
      }
    }
    const forecast = this._forecastCandidate(forecastSources, ["humidity", "relative_humidity", "relativeHumidity", "native_humidity"]);
    if (Number.isFinite(forecast.value)) {
      return { ...forecast, display: String(Math.round(forecast.value)) };
    }
    return { value: NaN, display: "--", source: "missing", raw: void 0 };
  }
  _humidity(attrs, forecastSources = []) {
    return this._humidityInfo(attrs, forecastSources).display;
  }
  _dewPointInfo(attrs, units, forecastSources = []) {
    const configuredEntityId = this._config.dew_point_entity;
    const configuredState = configuredEntityId ? this._hass?.states?.[configuredEntityId] : null;
    if (configuredState && isRadarWiseDewPointEntity(configuredEntityId, configuredState)) {
      const value = {
        value: configuredState.state,
        unit: configuredState.attributes?.unit_of_measurement || configuredState.attributes?.native_unit_of_measurement || this._hass?.config?.unit_system?.temperature
      };
      return {
        value: this._tempValue(value, units),
        display: this._displayTemp(value, units, false),
        source: `entity.${configuredEntityId}`,
        raw: configuredState.state
      };
    }
    const candidates = [
      { raw: attrs.dew_point, source: "weather.attributes.dew_point" },
      { raw: attrs.dewpoint, source: "weather.attributes.dewpoint" },
      { raw: attrs.dewPoint, source: "weather.attributes.dewPoint" },
      { raw: attrs.native_dew_point, source: "weather.attributes.native_dew_point" },
      { raw: attrs.native_dewpoint, source: "weather.attributes.native_dewpoint" },
      { raw: attrs.dew_point_temperature, source: "weather.attributes.dew_point_temperature" },
      { raw: attrs.dewpoint_temperature, source: "weather.attributes.dewpoint_temperature" }
    ];
    for (const candidate of candidates) {
      if (candidate.raw === void 0 || candidate.raw === null || candidate.raw === "") continue;
      return {
        value: this._tempValue(candidate.raw, units),
        display: this._displayTemp(candidate.raw, units, false),
        source: candidate.source,
        raw: candidate.raw
      };
    }
    const forecast = this._forecastCandidate(forecastSources, ["dew_point", "dewpoint", "dewPoint", "native_dew_point", "native_dewpoint", "dew_point_temperature", "dewpoint_temperature"]);
    if (Number.isFinite(forecast.value)) {
      return {
        ...forecast,
        display: this._displayTemp(forecast.raw, units, false)
      };
    }
    return { value: NaN, display: "--", source: "missing", raw: void 0 };
  }
  _dewPoint(attrs, units, forecastSources = []) {
    return this._dewPointInfo(attrs, units, forecastSources).display;
  }
  _latLon() {
    return {
      lat: this._numberOr(this._config.latitude, this._numberOr(this._hass?.config?.latitude, 0)),
      lon: this._numberOr(this._config.longitude, this._numberOr(this._hass?.config?.longitude, 0))
    };
  }
  _sectionOrder(key) {
    const order = this._config.panel_order;
    if (!Array.isArray(order)) return key === "clock" ? 1 : key === "weather" ? 2 : 3;
    const idx = order.indexOf(key);
    return idx === -1 ? 3 : idx + 1;
  }
  _numberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
  _formatNumber(value) {
    const number = this._numberOr(value, NaN);
    return Number.isFinite(number) ? String(Math.round(number)) : "--";
  }
  _clockTime(date) {
    const parts = this._timeParts(date);
    if (!parts) return "--";
    if (this._uses24HourTime()) return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
    return `${parts.hour % 12 || 12}:${String(parts.minute).padStart(2, "0")}`;
  }
  _clockAmPm(date) {
    const parts = this._timeParts(date);
    return this._uses24HourTime() || !parts ? "" : parts.hour >= 12 ? this._t("pm") : this._t("am");
  }
  _shortTime(dateLike) {
    const parts = this._timeParts(dateLike);
    if (!parts) return "--";
    if (this._uses24HourTime()) return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
    return `${parts.hour % 12 || 12}:${String(parts.minute).padStart(2, "0")} ${parts.hour >= 12 ? this._t("pm") : this._t("am")}`;
  }
  _hour(dateLike) {
    const parts = this._timeParts(dateLike);
    if (!parts) return "--";
    if (this._uses24HourTime()) return `${String(parts.hour).padStart(2, "0")}:00`;
    return `${parts.hour % 12 || 12} ${parts.hour >= 12 ? this._t("pm") : this._t("am")}`;
  }
  _resolvedTimeZone() {
    const mode = String(this._config.time_zone_mode || "browser");
    if (mode === "home_assistant") return this._validTimeZone(this._hass?.config?.time_zone);
    if (mode === "custom") return this._validTimeZone(this._config.time_zone);
    return void 0;
  }
  _validTimeZone(value) {
    const timeZone = String(value || "").trim();
    if (!timeZone) return void 0;
    try {
      new Intl.DateTimeFormat("en-US", { timeZone }).format(/* @__PURE__ */ new Date(0));
      return timeZone;
    } catch (err) {
      return void 0;
    }
  }
  _timeZoneOptions(options = {}) {
    const timeZone = this._resolvedTimeZone();
    return timeZone ? { ...options, timeZone } : options;
  }
  _timeParts(dateLike) {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-US", this._timeZoneOptions({
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })).formatToParts(date);
    const valueFor = (type) => Number(parts.find((part) => part.type === type)?.value);
    const hour = valueFor("hour");
    const minute = valueFor("minute");
    return Number.isFinite(hour) && Number.isFinite(minute) ? { hour, minute } : null;
  }
  _timeZoneLabel() {
    const configured = this._resolvedTimeZone();
    if (configured) return configured;
    const browser = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const mode = String(this._config.time_zone_mode || "browser");
    return mode === "browser" ? browser || "browser local" : `${browser || "browser local"} (fallback)`;
  }
  _dateTime(dateLike) {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    return new Intl.DateTimeFormat(this._localeCode(), this._timeZoneOptions({
      dateStyle: "short",
      timeStyle: "short"
    })).format(date);
  }
  _uses24HourTime() {
    const configured = String(this._config.time_format || "auto");
    if (configured === "24") return true;
    if (configured === "12") return false;
    const haFormat = String(this._hass?.locale?.time_format || "").toLowerCase();
    if (haFormat.includes("24")) return true;
    if (haFormat.includes("12")) return false;
    try {
      const options = new Intl.DateTimeFormat(this._localeCode(), { hour: "numeric" }).resolvedOptions();
      if (options.hourCycle) return options.hourCycle === "h23" || options.hourCycle === "h24";
      const parts = new Intl.DateTimeFormat(this._localeCode(), { hour: "numeric" }).formatToParts(new Date(2020, 0, 1, 13));
      return !parts.some((part) => part.type === "dayPeriod");
    } catch (err) {
      return false;
    }
  }
  _dayName(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    return new Intl.DateTimeFormat(this._localeCode(), this._timeZoneOptions({ weekday: "short" })).format(date);
  }
  _longDate(date) {
    return new Intl.DateTimeFormat(this._localeCode(), this._timeZoneOptions({
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    })).format(date);
  }
  _titleCase(text) {
    const raw = String(text || "--");
    const fixed = raw.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    const overrides = {
      partlycloudy: "Partly Cloudy",
      partly_cloudy: "Partly Cloudy",
      mostlycloudy: "Mostly Cloudy",
      mostly_cloudy: "Mostly Cloudy",
      clear_night: "Clear Night"
    };
    return overrides[raw.toLowerCase()] || fixed.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  _displayCondition(condition, sunStateObj) {
    const raw = String(condition || "");
    const normalized = raw.toLowerCase().replace(/[-_]/g, " ");
    const sunState = String(sunStateObj?.state || "").toLowerCase();
    const elevation = this._numberOr(sunStateObj?.attributes?.elevation, NaN);
    const isDaytime = sunState === "above_horizon" || elevation >= 0;
    if (!isDaytime || !normalized.includes("night")) return raw;
    if (normalized.includes("clear") || normalized.includes("sunny")) return "sunny";
    if (normalized.includes("partly") || normalized.includes("cloud")) return "partlycloudy";
    return raw.replace(/[-_ ]?night/gi, "") || raw;
  }
  _icon(condition, size = 36) {
    const c = String(condition || "").toLowerCase().replace(/[-_]/g, " ");
    const isNight = c.includes("night");
    if (c.includes("lightning") || c.includes("thunder")) return `<svg class="ww-icon ww-thunder" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="22" cy="15" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="14" cy="18" rx="9" ry="6" fill="#cbd5e1"/></g><polygon class="ww-bolt" points="22,22 16,34 21,31 17,41 28,27 22,30" fill="#fbbf24"/><g class="ww-rain"><line x1="14" y1="28" x2="12" y2="34" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><line x1="27" y1="28" x2="25" y2="34" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></g></svg>`;
    if (c.includes("rain") || c.includes("shower") || c.includes("drizzle")) return `<svg class="ww-icon ww-rainy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="22" cy="14" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="14" cy="17" rx="9" ry="6" fill="#cbd5e1"/></g><g class="ww-rain"><line x1="14" y1="26" x2="12" y2="33" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round"/><line x1="20" y1="26" x2="18" y2="33" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round"/><line x1="26" y1="26" x2="24" y2="33" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round"/></g></svg>`;
    if (c.includes("snow") || c.includes("sleet") || c.includes("hail")) return `<svg class="ww-icon ww-snowy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="22" cy="14" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="14" cy="17" rx="9" ry="6" fill="#cbd5e1"/></g><g class="ww-snow"><text x="10" y="34" font-size="13" fill="#93c5fd">*</text><text x="23" y="34" font-size="13" fill="#93c5fd">*</text></g></svg>`;
    if ((c.includes("clear") || c.includes("sunny")) && isNight) return `<svg class="ww-icon ww-moon" width="${size}" height="${size}" viewBox="0 0 40 40"><circle class="ww-moon-glow" cx="23" cy="20" r="10" fill="#fbbf24"/><path class="ww-moon-cut" d="M24 8q-10 4-10 14 0 8 7 12Q8 31 8 20 8 8 20 5q-1 2 4 3Z" fill="#1e3a5f"/></svg>`;
    if ((c.includes("partly") || c.includes("mostly cloudy") || c.includes("mostlycloudy")) && isNight) return `<svg class="ww-icon ww-partly-night" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-moon"><circle class="ww-moon-glow" cx="16" cy="17" r="8" fill="#fbbf24"/><path class="ww-moon-cut" d="M17 8q-7 3-7 10 0 5 4 8Q6 24 6 17 6 8 15 6q-1 1 2 2Z" fill="#1e3a5f"/></g><g class="ww-cloud"><ellipse cx="27" cy="24" rx="10" ry="7" fill="#94a3b8"/><ellipse cx="20" cy="27" rx="8" ry="6" fill="#cbd5e1"/></g></svg>`;
    if (c.includes("sunny") || c.includes("clear")) return `<svg class="ww-icon ww-sunny" width="${size}" height="${size}" viewBox="0 0 40 40"><circle class="ww-sun-core" cx="20" cy="20" r="8.5" fill="#fbbf24"/><g class="ww-sun-rays" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"><line x1="20" y1="4" x2="20" y2="8"/><line x1="20" y1="32" x2="20" y2="36"/><line x1="4" y1="20" x2="8" y2="20"/><line x1="32" y1="20" x2="36" y2="20"/></g></svg>`;
    if (c.includes("partly") || c.includes("mostly cloudy") || c.includes("mostlycloudy")) return `<svg class="ww-icon ww-partly" width="${size}" height="${size}" viewBox="0 0 40 40"><circle class="ww-sun-core" cx="14" cy="19" r="7" fill="#fbbf24"/><g class="ww-cloud"><ellipse cx="26" cy="22" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="18" cy="25" rx="9" ry="7" fill="#cbd5e1"/></g></svg>`;
    if (c.includes("fog") || c.includes("mist")) return `<svg class="ww-icon ww-foggy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-fog"><line x1="8" y1="16" x2="32" y2="16" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><line x1="6" y1="22" x2="34" y2="22" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="28" x2="30" y2="28" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/></g></svg>`;
    return `<svg class="ww-icon ww-cloudy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="23" cy="17" rx="12" ry="9" fill="#94a3b8"/><ellipse cx="14" cy="21" rx="9" ry="7" fill="#cbd5e1"/></g></svg>`;
  }
  _styles() {
    return `
      :host{--ww-wave:#2a7a94;--ww-wave-dark:#1a5f72;--ww-gold:#e8b84b;--ww-text:#0a1e28;--ww-muted:#1e4d5e;--ww-panel:rgba(255,255,255,0.35);--ww-line:rgba(42,122,148,0.20);display:block;color:var(--ww-text);font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif)}
      :host([theme-mode="auto"]){--ww-wave:var(--primary-color,#2a7a94);--ww-wave-dark:var(--accent-color,var(--primary-color,#1a5f72));--ww-gold:var(--warning-color,#e8b84b);--ww-text:var(--primary-text-color,#0a1e28);--ww-muted:var(--secondary-text-color,#1e4d5e);--ww-panel:color-mix(in srgb,var(--card-background-color,#fff) 76%,transparent);--ww-line:color-mix(in srgb,var(--primary-color,#2a7a94) 30%,transparent)}
      ha-card{background:transparent!important;box-shadow:none!important;border-radius:22px!important;overflow:hidden;font-family:var(--radarwise-font-family,inherit)}
      *{box-sizing:border-box}
      .card-outer{container-type:inline-size;background:rgba(232,246,250,0.74);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:22px;border:1px solid rgba(255,255,255,0.42);box-shadow:0 4px 28px rgba(0,0,0,0.10);position:relative;overflow:hidden}
      :host([theme-mode="auto"]) .card-outer{background:linear-gradient(135deg,color-mix(in srgb,var(--card-background-color,#fff) 88%,transparent),color-mix(in srgb,var(--primary-color,#2a7a94) 14%,var(--card-background-color,#fff)))}
      .card-outer::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ww-wave) 62%,transparent),transparent)}
      .card-grid{display:grid;grid-template-columns:var(--ww-grid-template,minmax(0,var(--ww-col1,1fr)) minmax(0,var(--ww-col2,2fr)) minmax(0,var(--ww-col3,1fr)));height:var(--radarwise-card-height,clamp(450px,24cqw,540px));min-height:0;max-height:var(--radarwise-card-max-height,580px)}
      .card-grid.no-radar{grid-template-columns:var(--ww-grid-template,minmax(260px,34%) minmax(0,1fr))}
      .left{min-width:0;display:flex;flex-direction:column;padding:18px 22px 10px;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08));border-right:1px solid rgba(255,255,255,0.22);overflow:hidden;order:var(--ww-left-order,1)}
      .center{order:var(--ww-center-order,2)}.right{order:var(--ww-right-order,3)}
      .clock-panel{flex-shrink:0}
      .clock-context{display:grid;grid-template-columns:minmax(0,1fr) minmax(116px,.82fr);align-items:start;gap:10px;margin-bottom:12px}
      .clock-context.no-env{display:block;margin-bottom:0}
      .clock-main{min-width:0}
      .clock-row{display:flex;align-items:baseline;gap:8px;line-height:1}
      .clock-time{font-size:78px;font-weight:550;color:var(--ww-text);letter-spacing:0}
      .clock-ampm{font-size:22px;font-weight:850;color:var(--ww-muted)}
      .clock-date{font-size:19px;color:var(--ww-muted);font-weight:850;margin-top:10px;margin-bottom:0}
      .clock-context.no-env .clock-date{margin-bottom:16px}
      .environment-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;min-width:0}
      .env-tile{display:grid;grid-template-columns:25px minmax(0,1fr);align-items:center;gap:8px;min-width:0;min-height:56px;padding:8px 9px;border-radius:12px;background:rgba(255,255,255,.25);border:1px solid var(--ww-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.22)}
      .env-ico{width:25px;height:25px;color:var(--ww-wave);display:grid;place-items:center}
      .env-ico svg{width:25px;height:25px}
      .env-copy{min-width:0}
      .env-lbl{font-size:10px;line-height:1.05;color:var(--ww-muted);font-weight:900;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .env-val{font-size:16px;line-height:1.05;color:var(--ww-text);font-weight:950;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .env-note{font-size:10px;line-height:1.05;color:var(--ww-muted);font-weight:850;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .env-good{border-color:rgba(34,197,94,.24)}.env-good .env-note{color:#166534}
      .env-moderate{border-color:rgba(234,179,8,.28)}.env-moderate .env-note{color:#854d0e}
      .env-sensitive,.env-unhealthy,.env-very-high,.env-hazardous{border-color:rgba(185,28,28,.30);background:rgba(254,242,242,.32)}
      .env-sensitive .env-note,.env-unhealthy .env-note,.env-very-high .env-note,.env-hazardous .env-note{color:#7f1d1d}
      .forecast-summary{container-type:inline-size;margin:0 0 14px;min-height:30px;max-width:100%;overflow:hidden;border:1px solid var(--ww-line);border-radius:999px;background:rgba(255,255,255,.20);box-shadow:inset 0 1px 0 rgba(255,255,255,.20);mask-image:linear-gradient(90deg,transparent 0,#000 18px,#000 calc(100% - 18px),transparent 100%)}
      .forecast-summary-text{display:inline-block;padding:7px 18px;font-size:13px;line-height:1.15;color:var(--ww-muted);font-weight:900;white-space:nowrap}
      :host([animations]) .forecast-summary-text{animation:ww-summary-drift 34s linear infinite}
      .forecast-summary:hover .forecast-summary-text{animation-play-state:paused}
      .section-title,.current-label{font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:var(--ww-muted);font-weight:850;white-space:nowrap}
      .hourly-left{display:flex;flex:1;min-height:0;flex-direction:column;gap:8px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;padding-bottom:2px}
      .hourly-left::-webkit-scrollbar{display:none}
      .hour-row{display:grid;grid-template-columns:54px 26px 48px minmax(58px,1fr) minmax(42px,max-content);align-items:center;gap:9px;flex:1 1 calc(100% / var(--ww-hourly-count,5));min-height:34px;max-height:54px;padding:5px 10px;border-radius:10px;background:var(--ww-panel);border:1px solid var(--ww-line)}
      .hour-time-left{font-size:15px;color:var(--ww-muted);font-weight:850;text-transform:uppercase}
      .hour-icon-left{width:25px;height:25px;display:flex;align-items:center;justify-content:center}
      .hour-temp-left{font-size:16px;font-weight:900;color:var(--ww-text);text-align:right}
      .hour-bar-wrap{height:8px;border-radius:999px;background:rgba(18,59,83,0.10);position:relative;overflow:hidden}
      .hour-bar-fill{position:absolute;top:0;left:0;height:100%;border-radius:999px;background:linear-gradient(90deg,#58b7c7,var(--ww-wave))}
      .hour-precip{font-size:12px;font-weight:900;color:var(--ww-muted);white-space:nowrap;text-align:right;min-width:0}
      .center{min-width:0;display:flex;flex-direction:column;padding:18px 24px;border-right:1px solid rgba(255,255,255,0.22);overflow:hidden;container-type:inline-size;container-name:ww-center}
      .current-row{display:flex;align-items:center;gap:18px;margin-bottom:12px;min-width:0;min-height:86px;overflow:visible}
      .current-icon{width:72px;height:72px;flex-shrink:0;display:grid;place-items:center}
      .cond-block{flex:1;min-width:0}
      .cond-name-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;min-width:0}
      .cond-name{font-size:36px;font-weight:800;color:var(--ww-text);line-height:1.05;overflow-wrap:anywhere}
      .current-uv{display:inline-grid;grid-template-columns:auto auto;grid-template-areas:"label value" "note note";align-items:center;column-gap:6px;row-gap:1px;padding:5px 9px;border:1px solid var(--ww-line);border-radius:999px;background:rgba(255,255,255,.24);box-shadow:inset 0 1px 0 rgba(255,255,255,.20);line-height:1;white-space:nowrap}
      .current-uv span{grid-area:label;font-size:10px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:var(--ww-muted)}
      .current-uv strong{grid-area:value;font-size:16px;font-weight:950;color:var(--ww-text)}
      .current-uv em{grid-area:note;font-size:10px;font-style:normal;font-weight:850;color:var(--ww-muted);text-align:right}
      .uv-good{border-color:rgba(34,197,94,.24)}.uv-good em{color:#166534}
      .uv-moderate{border-color:rgba(234,179,8,.28)}.uv-moderate em{color:#854d0e}
      .uv-unhealthy,.uv-very-high,.uv-hazardous{border-color:rgba(185,28,28,.30);background:rgba(254,242,242,.32)}
      .uv-unhealthy em,.uv-very-high em,.uv-hazardous em{color:#7f1d1d}
      .updated-note{font-size:14px;color:var(--ww-muted);font-weight:850;margin-top:7px;text-transform:uppercase;letter-spacing:.04em}
      .temp-block{text-align:right;flex-shrink:0;min-width:max-content}
      .temp-now{font-size:66px;font-weight:800;color:var(--ww-text);line-height:1.08;letter-spacing:0}
      .temp-hilo{font-size:20px;color:var(--ww-muted);font-weight:800;margin-top:9px}
      .daily-strip{display:grid;grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(0,1fr));gap:12px;min-height:188px;max-height:232px;margin-bottom:12px;flex:1}
      .fc-slot{display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:10px 8px;background:var(--ww-panel);border-radius:14px;border:1px solid var(--ww-line);min-width:0}
      .fc-day{font-size:22px;font-weight:850;color:var(--ww-text);text-transform:uppercase;line-height:1.05;text-align:center}
      .fc-period{font-size:14px;font-weight:900;color:var(--ww-muted);text-transform:uppercase;letter-spacing:.045em;margin-top:2px;min-height:16px;line-height:1.05;text-align:center}
      .fc-icon{width:64px;height:64px;margin:4px 0 2px;display:flex;align-items:center;justify-content:center}
      .fc-icon svg{width:60px;height:60px}
      .fc-temp{font-size:48px;font-weight:900;color:var(--ww-text);letter-spacing:0;line-height:.95}
      .fc-range{font-size:13px;font-weight:900;color:var(--ww-muted);line-height:1;min-height:14px;text-align:center;white-space:nowrap}
      .fc-precip{font-size:12px;font-weight:900;color:var(--ww-muted);line-height:1;min-height:13px;text-align:center;white-space:nowrap}
      .details-grid,.stats-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:6px;flex-shrink:0}
      .custom-sensors-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:10px;margin-top:10px;flex-shrink:0}
      .stat{background:var(--ww-panel);border:1px solid var(--ww-line);border-radius:12px;padding:10px 13px;display:flex;align-items:center;gap:11px;min-height:66px;min-width:0}
      .stat>div:last-child{min-width:0}
      .stat-ico{width:27px;height:27px;flex:0 0 27px;color:var(--ww-wave)}
      .stat-ico svg{width:27px;height:27px}
      .stat-ico ha-icon{width:27px;height:27px;color:var(--ww-wave)}
      .custom-sensor-stat{min-height:60px}
      .stat-lbl{font-size:12px;color:var(--ww-muted);font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
      .stat-val{font-size:19px;font-weight:900;color:var(--ww-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;overflow-wrap:normal;word-break:normal;line-height:1.08}
      .ww-icon{overflow:visible;transform-box:fill-box}
      :host([animations]) .current-icon .ww-icon{filter:drop-shadow(0 8px 14px rgba(42,122,148,.14))}
      :host([animations]) .ww-sun-rays{transform-origin:20px 20px;animation:ww-sun-spin 28s linear infinite}
      :host([animations]) .ww-sun-core{transform-origin:center;animation:ww-sun-breathe 4.8s ease-in-out infinite}
      :host([animations]) .ww-cloud{animation:ww-cloud-drift 7.5s ease-in-out infinite}
      :host([animations]) .ww-rain{animation:ww-rain-fall .95s ease-in-out infinite}
      :host([animations]) .ww-snow{animation:ww-snow-float 2.8s ease-in-out infinite}
      :host([animations]) .ww-bolt{animation:ww-bolt-flash 4.8s steps(1,end) infinite}
      :host([animations]) .ww-moon,:host([animations]) .ww-moon-glow{animation:ww-moon-float 6.5s ease-in-out infinite}
      :host([animations]) .ww-fog{animation:ww-fog-slide 6s ease-in-out infinite}
      :host([animations]) .hour-row{animation:ww-row-in .42s ease-out both}
      :host([animations]) .hour-row:nth-child(2){animation-delay:.03s}
      :host([animations]) .hour-row:nth-child(3){animation-delay:.06s}
      :host([animations]) .hour-row:nth-child(4){animation-delay:.09s}
      :host([animations]) .hour-row:nth-child(5){animation-delay:.12s}
      :host([animations]) .hour-row:nth-child(6){animation-delay:.15s}
      :host([animations]) .fc-slot{animation:ww-card-rise .48s ease-out both}
      :host([animations]) .fc-slot:nth-child(2){animation-delay:.04s}
      :host([animations]) .fc-slot:nth-child(3){animation-delay:.08s}
      :host([animations]) .fc-slot:nth-child(4){animation-delay:.12s}
      :host([animations]) .fc-slot:nth-child(5){animation-delay:.16s}
      :host([animations]) .hour-bar-fill{transition:width .7s cubic-bezier(.2,.8,.2,1)}
      @keyframes ww-sun-spin{to{transform:rotate(360deg)}}
      @keyframes ww-sun-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      @keyframes ww-cloud-drift{0%,100%{transform:translateX(0)}50%{transform:translateX(1.4px)}}
      @keyframes ww-rain-fall{0%{transform:translateY(-1px);opacity:.72}55%{transform:translateY(1.9px);opacity:1}100%{transform:translateY(3px);opacity:.72}}
      @keyframes ww-snow-float{0%,100%{transform:translateY(-1px)}50%{transform:translateY(2px)}}
      @keyframes ww-bolt-flash{0%,88%,100%{opacity:.92}90%,93%{opacity:.35}91%,95%{opacity:1}}
      @keyframes ww-moon-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
      @keyframes ww-fog-slide{0%,100%{transform:translateX(-1px);opacity:.76}50%{transform:translateX(2px);opacity:1}}
      @keyframes ww-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      @keyframes ww-card-rise{from{opacity:0;transform:translateY(6px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes ww-summary-drift{0%,8%{transform:translateX(0)}92%,100%{transform:translateX(min(0px, calc(100cqw - 100% - 38px)))}}
      .right{min-width:0;position:relative;overflow:hidden;border-radius:0 22px 22px 0}
      #rmap{width:100%;height:100%;min-height:0}
      .bom-fallback-radar{width:100%;height:100%;position:relative;background:#d7dee2;overflow:hidden}
      .bom-fallback-layer{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;image-rendering:auto;pointer-events:none}
      .bom-fallback-base{z-index:0}
      .bom-fallback-terrain{z-index:1}
      .bom-fallback-frame{z-index:2}
      .bom-fallback-overlay{z-index:3}
      .bom-fallback-labels{z-index:4}
      .leaflet-container{height:100%;width:100%;position:relative;overflow:hidden;outline-offset:1px;background:#d7dee2;font-family:inherit;font-size:12px;line-height:1.5;z-index:0}
      .leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}
      .leaflet-container img.leaflet-tile,.leaflet-container img.leaflet-image-layer{max-width:none!important;max-height:none!important}
      .leaflet-tile{filter:inherit;visibility:hidden}
      .leaflet-tile-loaded{visibility:inherit}
      .leaflet-map-pane canvas{z-index:100}
      .leaflet-map-pane svg{z-index:200}
      .leaflet-tile-pane{z-index:200}
      .leaflet-overlay-pane{z-index:400}
      .leaflet-marker-pane{z-index:600}
      .leaflet-tooltip-pane{z-index:650}
      .leaflet-popup-pane{z-index:700}
      .leaflet-control{position:relative;z-index:800;pointer-events:auto;float:left;clear:both}
      .leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}
      .leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}
      .leaflet-control-zoom{margin-left:10px;margin-top:10px}
      .leaflet-control-zoom a{display:block;text-align:center;text-decoration:none}
      .leaflet-control-attribution{position:absolute;right:0;bottom:0;margin:0;padding:2px 6px;max-width:min(72%,420px);max-height:38px;overflow:auto;text-align:right;white-space:normal;scrollbar-width:none;border-radius:8px 0 0 0}
      .leaflet-control-attribution::-webkit-scrollbar{display:none}
      .leaflet-control-attribution a{white-space:nowrap}
      .radar-lbl{position:absolute;bottom:10px;left:12px;font-size:12px;color:rgba(10,30,46,0.76);background:rgba(255,255,255,0.78);border:1px solid rgba(255,255,255,0.55);padding:4px 10px;border-radius:99px;font-weight:800;z-index:1000;pointer-events:none}
      .radar-alert{position:absolute;top:10px;left:54px;right:126px;max-width:max-content;font-size:12px;color:#7f1d1d;background:rgba(254,242,242,.9);border:1px solid rgba(185,28,28,.28);box-shadow:0 2px 10px rgba(127,29,29,.12);padding:5px 10px;border-radius:99px;font-weight:900;z-index:1000;pointer-events:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
      .radar-alert:focus-visible{outline:2px solid #b91c1c;outline-offset:2px}
      .radar-alert[hidden]{display:none}
      .radar-controls{position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:1001}
      .radar-controls[hidden]{display:none}
      .radar-controls button{width:31px;height:31px;border:1px solid rgba(255,255,255,.62);border-radius:999px;background:rgba(255,255,255,.78);color:#0a1e2e;box-shadow:0 2px 10px rgba(10,30,46,.12);font:800 15px/1 var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif);display:grid;place-items:center;cursor:pointer;padding:0}
      .radar-controls button:hover{background:rgba(255,255,255,.94)}
      .leaflet-control-zoom{border:0!important;box-shadow:0 2px 12px rgba(10,30,46,.13)!important}
      .leaflet-control-zoom a{width:34px!important;height:34px!important;line-height:31px!important;color:#0a1e2e!important;background:rgba(255,255,255,.82)!important;border-color:rgba(10,30,46,.10)!important;font-weight:650!important}
      .leaflet-control-attribution{background:rgba(255,255,255,.68)!important;color:rgba(10,30,46,.72)!important;font-size:10px!important;line-height:1.2!important;box-shadow:0 1px 8px rgba(10,30,46,.10)}
      .leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}
      .leaflet-popup-content-wrapper{background:rgba(255,255,255,.96);color:#0a1e2e;border-radius:12px;box-shadow:0 4px 18px rgba(10,30,46,.22);border:1px solid rgba(10,30,46,.12);padding:1px;text-align:left}
      .leaflet-popup-content{font-size:13px;line-height:1.35;margin:12px 14px;min-width:180px;max-width:320px}
      .alert-popup-list{display:flex;flex-direction:column;gap:10px;max-height:260px;overflow:auto;overscroll-behavior:contain;padding-right:2px}
      .alert-popup-item{min-width:0}
      .alert-popup-item+.alert-popup-item{border-top:1px solid rgba(10,30,46,.12);padding-top:10px}
      .alert-popup-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:900}
      .alert-popup-count{font-size:11px;color:#7f1d1d;background:rgba(254,242,242,.86);border:1px solid rgba(185,28,28,.20);border-radius:999px;padding:1px 7px;white-space:nowrap}
      .alert-popup-headline{margin-top:4px}
      .alert-popup-severity{margin-top:4px;color:rgba(10,30,46,.74);font-weight:750}
      .leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}
      .leaflet-popup-tip{width:14px;height:14px;padding:1px;margin:-8px auto 0;background:rgba(255,255,255,.96);transform:rotate(45deg);box-shadow:0 4px 14px rgba(10,30,46,.18)}
      .leaflet-popup-close-button{position:absolute;top:4px;right:8px;border:0;background:transparent;color:#0a1e2e;text-decoration:none;font-size:18px;font-weight:900;line-height:1;cursor:pointer}
      .loading-note{font-size:12px;color:var(--ww-muted);font-weight:800;opacity:.8;padding:10px}
      .daily-strip>.loading-note{grid-column:1 / -1;align-self:center}
      .debug-panel{margin:10px 18px 18px;background:rgba(255,255,255,.78);border:1px solid var(--ww-line);border-radius:14px;padding:0;font-size:12px;color:var(--ww-muted);max-height:min(420px,52vh);overflow:auto;overscroll-behavior:contain;box-shadow:0 10px 24px rgba(10,30,46,.12)}
      .debug-panel summary{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:6px;padding:9px 12px;background:rgba(255,255,255,.92);border-bottom:1px solid var(--ww-line);cursor:pointer;font-weight:900;color:var(--ww-text)}
      .debug-row{display:grid;grid-template-columns:minmax(130px,220px) minmax(0,1fr);gap:12px;padding:7px 12px;border-bottom:1px solid rgba(10,30,46,.07);align-items:start}
      .debug-row span{font-weight:800;color:var(--ww-muted)}
      .debug-row code{color:var(--ww-text);white-space:pre-wrap;word-break:break-word;text-align:left;font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;font-size:11px;line-height:1.35}
      .card-grid.no-forecast .daily-strip{display:none}.card-grid.no-forecast .center{justify-content:center}
      .card-grid.panels-1{grid-template-columns:var(--ww-grid-template,1fr)}
      .card-grid.panels-2{grid-template-columns:var(--ww-grid-template,minmax(0,1fr) minmax(0,1fr))}
      .card-grid.panels-1 .left,.card-grid.panels-1 .center,.card-grid.panels-1 .right{border-right:0;border-radius:22px}
      .card-grid.panels-2 .center:last-child,.card-grid.panels-2 .right:last-child{border-right:0;border-radius:0 22px 22px 0}
      .card-grid.content-radar{height:var(--radarwise-card-height,clamp(310px,20cqw,460px))}
      .card-grid.content-radar .right{border-radius:22px}
      .card-grid.content-radar #rmap{height:100%;min-height:260px}
      .card-grid.content-forecast{height:var(--radarwise-card-height,clamp(260px,18cqw,390px))}
      .card-grid.content-forecast .center{border-right:0;justify-content:stretch}
      .card-grid.content-forecast .daily-strip{min-height:0;max-height:none;margin-bottom:0}
      .card-grid.content-timeline{height:var(--radarwise-card-height,clamp(280px,18cqw,420px))}
      .card-grid.content-timeline .left{border-right:0}
      .card-grid.content-essentials{height:var(--radarwise-card-height,clamp(220px,16cqw,320px))}
      .card-grid.content-essentials .center{border-right:0}
      .card-grid.content-essentials .current-row{margin-bottom:10px}
      @container(max-width:1500px){.card-grid{height:var(--radarwise-card-height,clamp(440px,25cqw,520px))}.left{padding:14px 18px 10px}.center{padding:16px 20px}.clock-time{font-size:70px}.clock-date{font-size:18px;margin-bottom:11px}.forecast-summary{margin-bottom:11px}.forecast-summary-text{font-size:12px}.section-title,.current-label{font-size:15px}.temp-now{font-size:58px}.temp-hilo{font-size:18px}.cond-name{font-size:32px}.updated-note{font-size:13px}.daily-strip{min-height:172px;max-height:212px}.fc-day{font-size:20px}.fc-period{font-size:13px}.fc-icon{width:58px;height:58px}.fc-icon svg{width:54px;height:54px}.fc-temp{font-size:43px}.hour-row{grid-template-columns:50px 24px 42px minmax(52px,1fr) minmax(38px,max-content);gap:7px;min-height:32px}.hour-time-left{font-size:14px}.hour-temp-left{font-size:15px}.hour-precip{font-size:11px}.stat{padding:9px 11px;gap:9px;min-height:62px}.stat-lbl{font-size:11px}.stat-val{font-size:17px}}
      @container ww-center (max-width:680px){.current-row{gap:14px;min-height:74px}.current-icon{width:58px;height:58px}.cond-name{font-size:clamp(24px,8cqw,32px)}.updated-note{font-size:12px;margin-top:5px}.temp-now{font-size:clamp(42px,12cqw,58px)}.temp-hilo{font-size:16px;margin-top:5px}.daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(92px,1fr));gap:8px;min-height:158px;max-height:196px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;flex:none}.daily-strip::-webkit-scrollbar{display:none}.fc-slot{padding:8px 6px}.fc-day{font-size:18px}.fc-period{font-size:11px;min-height:12px}.fc-icon{width:48px;height:48px;margin:2px 0}.fc-icon svg{width:44px;height:44px}.fc-temp{font-size:34px}.fc-range,.fc-precip{font-size:10px;min-height:11px}.details-grid,.stats-row,.custom-sensors-row{grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:8px}.custom-sensors-row{margin-top:8px}.stat{min-height:52px;padding:8px 9px;gap:8px}.stat-ico,.stat-ico svg,.stat-ico ha-icon{width:22px;height:22px}.stat-ico{flex-basis:22px}.stat-lbl{font-size:10px;margin-bottom:2px}.stat-val{font-size:clamp(13px,4.8cqw,16px)}}
      @container ww-center (max-width:480px){.daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(86px,1fr));min-height:148px}.details-grid,.stats-row,.custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}.stat-val{font-size:14px}.current-row{align-items:flex-start;flex-wrap:wrap}.temp-block{text-align:left}}
      @container(max-width:980px){.card-grid:not(.layout-wide_panel){height:var(--radarwise-card-height,clamp(560px,58cqw,680px))}.card-grid:not(.layout-wide_panel) .center{border-right:0}.card-grid:not(.layout-wide_panel) .right{grid-column:1 / -1;height:240px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid:not(.layout-wide_panel) #rmap{height:240px}.card-grid:not(.layout-wide_panel) .daily-strip{min-height:150px;max-height:none}}
      .card-grid.layout-wide_panel{height:var(--radarwise-card-height,clamp(390px,22cqw,500px))}
      .card-grid.layout-stacked,.card-grid.layout-compact{display:flex;flex-direction:column;height:auto;max-height:none}.card-grid.layout-stacked .left,.card-grid.layout-compact .left{display:contents}.card-grid.layout-stacked .clock-panel,.card-grid.layout-compact .clock-panel{order:1;padding:18px 22px 0;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08))}.card-grid.layout-stacked .center,.card-grid.layout-compact .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid.layout-stacked .left>.section-title,.card-grid.layout-compact .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 22px;margin-top:4px}.card-grid.layout-stacked .hourly-left,.card-grid.layout-compact .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 22px 16px}.card-grid.layout-stacked .right,.card-grid.layout-compact .right{order:var(--ww-ord-radar,30);border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid.layout-stacked .right,.card-grid.layout-stacked #rmap{height:300px;min-height:300px}.card-grid.layout-compact .right,.card-grid.layout-compact #rmap{height:220px;min-height:220px}.card-grid.layout-compact .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));min-height:150px}.card-grid.layout-compact .fc-slot:nth-child(n+4){display:none}
      @container(max-width:720px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30)}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.details-grid,.stats-row,.custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}.card-grid.layout-wide_panel{display:grid;grid-template-columns:var(--ww-grid-template,minmax(120px,24%) minmax(230px,1fr) minmax(150px,28%));height:360px;max-height:360px}.card-grid.layout-wide_panel .left{display:flex;padding:12px 10px}.card-grid.layout-wide_panel .center{padding:12px 10px}.card-grid.layout-wide_panel .clock-time{font-size:38px}.card-grid.layout-wide_panel .clock-date{font-size:12px;margin:5px 0 7px}.card-grid.layout-wide_panel .forecast-summary{min-height:26px;margin-bottom:8px}.card-grid.layout-wide_panel .forecast-summary-text{font-size:11px;padding:6px 14px}.card-grid.layout-wide_panel .current-icon{width:44px;height:44px}.card-grid.layout-wide_panel .cond-name{font-size:21px}.card-grid.layout-wide_panel .temp-now{font-size:38px}.card-grid.layout-wide_panel .daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(70px,1fr));gap:6px;overflow:hidden}.card-grid.layout-wide_panel .fc-temp{font-size:28px}.card-grid.layout-wide_panel .details-grid,.card-grid.layout-wide_panel .stats-row,.card-grid.layout-wide_panel .custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.card-grid.layout-wide_panel .custom-sensors-row{margin-top:6px}.card-grid.layout-wide_panel .right,.card-grid.layout-wide_panel #rmap{height:100%;min-height:0}}
      @container(max-width:720px){.card-grid.layout-wide_panel .clock-context{grid-template-columns:1fr;gap:6px;margin-bottom:8px}.card-grid.layout-wide_panel .environment-strip{grid-template-columns:1fr;gap:5px}.card-grid.layout-wide_panel .env-tile{grid-template-columns:20px minmax(0,1fr);min-height:40px;padding:5px 7px}.card-grid.layout-wide_panel .env-ico,.card-grid.layout-wide_panel .env-ico svg{width:20px;height:20px}.card-grid.layout-wide_panel .env-lbl,.card-grid.layout-wide_panel .env-note{font-size:9px}.card-grid.layout-wide_panel .env-val{font-size:13px}.card-grid.layout-wide_panel .env-note{display:none}}
      @container(max-width:720px){.card-grid.layout-wide_panel{height:var(--radarwise-card-height,360px);max-height:var(--radarwise-card-max-height,360px)}.card-grid.layout-wide_panel .leaflet-control-attribution{max-width:min(58%,260px);max-height:30px;font-size:9px!important}}
      @media(max-width:760px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30)}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.details-grid,.stats-row,.custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}}
      @media(prefers-reduced-motion:reduce){:host([animations]) .ww-sun-rays,:host([animations]) .ww-sun-core,:host([animations]) .ww-cloud,:host([animations]) .ww-rain,:host([animations]) .ww-snow,:host([animations]) .ww-bolt,:host([animations]) .ww-moon,:host([animations]) .ww-moon-glow,:host([animations]) .ww-fog,:host([animations]) .hour-row,:host([animations]) .fc-slot,:host([animations]) .forecast-summary-text{animation:none!important}:host([animations]) .hour-bar-fill{transition:none!important}}
      .card-grid.content-radar{height:var(--radarwise-card-height,clamp(310px,20cqw,460px));max-height:var(--radarwise-card-max-height,480px)}
      .card-grid.content-forecast{height:var(--radarwise-card-height,clamp(260px,18cqw,390px));max-height:var(--radarwise-card-max-height,420px)}
      .card-grid.content-timeline{height:var(--radarwise-card-height,clamp(280px,18cqw,420px));max-height:var(--radarwise-card-max-height,440px)}
      .card-grid.content-essentials{height:var(--radarwise-card-height,clamp(220px,16cqw,320px));max-height:var(--radarwise-card-max-height,340px)}
      .card-grid.density-slim{height:var(--radarwise-card-height,clamp(330px,18cqw,430px));max-height:var(--radarwise-card-max-height,450px)}
      .card-grid.density-slim .left{padding:11px 16px 8px}.card-grid.density-slim .center{padding:12px 18px}.card-grid.density-slim .clock-context{gap:8px;margin-bottom:8px}.card-grid.density-slim .clock-time{font-size:58px}.card-grid.density-slim .clock-ampm{font-size:18px}.card-grid.density-slim .clock-date{font-size:16px;margin-top:7px;margin-bottom:8px}.card-grid.density-slim .environment-strip{gap:6px}.card-grid.density-slim .env-tile{min-height:44px;padding:6px 8px}.card-grid.density-slim .env-ico,.card-grid.density-slim .env-ico svg{width:21px;height:21px}.card-grid.density-slim .env-lbl,.card-grid.density-slim .env-note{font-size:9px}.card-grid.density-slim .env-val{font-size:14px}.card-grid.density-slim .forecast-summary{min-height:25px;margin-bottom:8px}.card-grid.density-slim .forecast-summary-text{font-size:11px;padding:6px 14px}.card-grid.density-slim .section-title,.card-grid.density-slim .current-label{font-size:13px}.card-grid.density-slim .hourly-left{gap:6px}.card-grid.density-slim .hour-row{min-height:28px;max-height:38px;padding:4px 9px;grid-template-columns:46px 22px 38px minmax(45px,1fr) minmax(34px,max-content);gap:6px}.card-grid.density-slim .hour-time-left{font-size:13px}.card-grid.density-slim .hour-temp-left{font-size:14px}.card-grid.density-slim .hour-precip{font-size:10px}.card-grid.density-slim .current-row{min-height:64px;margin-bottom:8px;gap:12px}.card-grid.density-slim .current-icon{width:54px;height:54px}.card-grid.density-slim .cond-name{font-size:27px}.card-grid.density-slim .updated-note{font-size:11px;margin-top:4px}.card-grid.density-slim .temp-now{font-size:48px}.card-grid.density-slim .temp-hilo{font-size:15px;margin-top:4px}.card-grid.density-slim .daily-strip{min-height:130px;max-height:170px;gap:8px;margin-bottom:8px}.card-grid.density-slim .fc-slot{padding:7px 6px}.card-grid.density-slim .fc-day{font-size:17px}.card-grid.density-slim .fc-period{font-size:11px;min-height:12px}.card-grid.density-slim .fc-icon{width:46px;height:46px;margin:2px 0}.card-grid.density-slim .fc-icon svg{width:44px;height:44px}.card-grid.density-slim .fc-temp{font-size:34px}.card-grid.density-slim .fc-range,.card-grid.density-slim .fc-precip{font-size:10px;min-height:11px}.card-grid.density-slim .details-grid,.card-grid.density-slim .stats-row,.card-grid.density-slim .custom-sensors-row{gap:7px}.card-grid.density-slim .custom-sensors-row{margin-top:7px}.card-grid.density-slim .stat{min-height:48px;padding:7px 9px;gap:8px}.card-grid.density-slim .stat-ico,.card-grid.density-slim .stat-ico svg,.card-grid.density-slim .stat-ico ha-icon{width:22px;height:22px;flex-basis:22px}.card-grid.density-slim .stat-lbl{font-size:10px;margin-bottom:2px}.card-grid.density-slim .stat-val{font-size:15px}
      .card-grid.density-large{height:var(--radarwise-card-height,clamp(500px,28cqw,620px));max-height:var(--radarwise-card-max-height,660px)}
      .card-grid.density-large .clock-time{font-size:88px}.card-grid.density-large .clock-date{font-size:22px}.card-grid.density-large .cond-name{font-size:42px}.card-grid.density-large .temp-now{font-size:78px}.card-grid.density-large .daily-strip{min-height:220px;max-height:270px}.card-grid.density-large .fc-temp{font-size:58px}.card-grid.density-large .stat{min-height:76px}.card-grid.density-large .stat-val{font-size:22px}
      .card-grid.content-radar.density-slim{height:var(--radarwise-card-height,clamp(230px,16cqw,360px))}
      .card-grid.content-forecast.density-slim{height:var(--radarwise-card-height,clamp(210px,15cqw,320px))}
      .card-grid.content-timeline.density-slim{height:var(--radarwise-card-height,clamp(220px,15cqw,340px))}
      .card-grid.content-essentials.density-slim{height:var(--radarwise-card-height,clamp(190px,13cqw,270px))}

      .card-grid.layout-radar_bottom{display:grid;grid-template-columns:minmax(310px,28%) minmax(0,1fr);grid-template-rows:clamp(420px,28cqw,540px) 340px;height:auto;max-height:none}
      .card-grid.layout-radar_bottom .left{grid-column:1;grid-row:1;overflow:hidden}
      .card-grid.layout-radar_bottom .center{grid-column:2;grid-row:1;border-right:0;overflow:hidden}
      .card-grid.layout-radar_bottom .right{grid-column:1/-1;grid-row:2;height:340px;min-height:340px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px;position:relative;z-index:0}
      .card-grid.layout-radar_bottom #rmap{height:340px;min-height:340px}
      .card-grid.ww-force-stack:not(.layout-wide_panel),.card-grid.ww-force-stack.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid.ww-force-stack:not(.layout-wide_panel) .left{display:contents}.card-grid.ww-force-stack:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid.ww-force-stack:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid.ww-force-stack:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid.ww-force-stack:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid.ww-force-stack:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30);height:300px;min-height:300px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid.ww-force-stack:not(.layout-wide_panel) #rmap{height:300px;min-height:300px}.card-grid.ww-force-stack:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.card-grid.ww-force-stack:not(.layout-wide_panel) .details-grid,.card-grid.ww-force-stack:not(.layout-wide_panel) .stats-row,.card-grid.ww-force-stack:not(.layout-wide_panel) .custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}
      @container(max-width:720px){.card-grid.layout-radar_bottom{grid-template-columns:1fr;grid-template-rows:auto auto 300px}.card-grid.layout-radar_bottom .left{grid-column:1;grid-row:1}.card-grid.layout-radar_bottom .center{grid-column:1;grid-row:2;border-right:0}.card-grid.layout-radar_bottom .right{grid-column:1;grid-row:3;height:300px;min-height:300px}.card-grid.layout-radar_bottom #rmap{height:300px;min-height:300px}}
      .card-grid.content-radar,.card-grid.content-forecast,.card-grid.content-timeline,.card-grid.content-essentials{display:grid;grid-template-columns:1fr;grid-template-rows:1fr}
      .card-grid.content-radar .right,.card-grid.content-forecast .center,.card-grid.content-timeline .left,.card-grid.content-essentials .center{grid-column:1;grid-row:1;border-right:0;border-radius:22px}
      .card-grid.content-timeline .left{display:flex;flex-direction:column;padding:18px 22px 14px;overflow:hidden;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08))}
      .card-grid.content-radar .right,.card-grid.content-radar #rmap{height:100%;min-height:0}
      @container(max-width:600px){.clock-context{grid-template-columns:1fr}.environment-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.clock-time{font-size:58px}.clock-ampm{font-size:17px}.temp-now{font-size:46px}.temp-hilo{font-size:17px;margin-top:5px}.cond-name{font-size:26px}.current-icon{width:54px;height:54px}.current-row{gap:10px;flex-wrap:wrap}.temp-block{min-width:unset}.center{padding:14px 18px}.updated-note{font-size:12px;margin-top:4px}}
      @container(max-width:420px){.clock-time{font-size:48px}.temp-now{font-size:38px}.cond-name{font-size:22px}.current-icon{width:46px;height:46px}}
    `;
  }
};
var RadarWiseCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._entitySignature = "";
  }
  set hass(hass) {
    this._hass = hass;
    const signature = this._editorEntitySignature();
    if (!this._rendered || signature !== this._entitySignature) {
      this._entitySignature = signature;
      this._render();
    }
  }
  setConfig(config) {
    this._config = {
      ...RadarWiseCard.getStubConfig(),
      ...config || {},
      language: config?.language || config?.forecast_summary_language || "auto"
    };
    this._render();
  }
  _weatherEntities() {
    return Object.entries(this._hass?.states || {}).filter(([entityId]) => entityId.startsWith("weather.")).sort(([a], [b]) => a.localeCompare(b));
  }
  _sensorEntities(predicate) {
    return Object.entries(this._hass?.states || {}).filter(([entityId]) => entityId.startsWith("sensor.") || entityId.startsWith("input_number.")).filter(([entityId, state]) => predicate(entityId, state)).sort(([a], [b]) => a.localeCompare(b));
  }
  _humidityEntities() {
    return this._sensorEntities(isRadarWiseHumidityEntity);
  }
  _temperatureEntities() {
    return this._sensorEntities(isRadarWiseTemperatureEntity);
  }
  _dewPointEntities() {
    return this._sensorEntities(isRadarWiseDewPointEntity);
  }
  _windSpeedEntities() {
    return this._sensorEntities(isRadarWiseWindSpeedEntity);
  }
  _windDirectionEntities() {
    return this._sensorEntities(isRadarWiseWindDirectionEntity);
  }
  _airQualityEntities() {
    return this._sensorEntities(isRadarWiseAirQualityEntity);
  }
  _uvIndexEntities() {
    return this._sensorEntities(isRadarWiseUvIndexEntity);
  }
  _pollenEntities(kind = "") {
    return this._sensorEntities((entityId, state) => isRadarWisePollenEntity(entityId, state, kind));
  }
  _customSensorEntities() {
    return Object.entries(this._hass?.states || {}).filter(([entityId]) => entityId.startsWith("sensor.") || entityId.startsWith("input_number.") || entityId.startsWith("number.")).sort(([a], [b]) => a.localeCompare(b));
  }
  _sensorOptions(sensors, selected) {
    return sensors.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${_wwEscape(entityId)}" ${selected === entityId ? "selected" : ""}>${_wwEscape(name)} (${_wwEscape(entityId)})</option>`;
    }).join("");
  }
  _configuredSensorOption(entityId, sensors, predicate) {
    if (!entityId || sensors.some(([candidate]) => candidate === entityId)) return "";
    return predicate(entityId, this._hass?.states?.[entityId]) ? `<option value="${_wwEscape(entityId)}" selected>${_wwEscape(entityId)}</option>` : "";
  }
  _editorEntitySignature() {
    const states = this._hass?.states || {};
    return Object.entries(states).filter(([entityId, state]) => entityId.startsWith("weather.") || entityId.startsWith("sensor.") || entityId.startsWith("input_number.") || entityId.startsWith("number.") || isRadarWiseHumidityEntity(entityId, state) || isRadarWiseTemperatureEntity(entityId, state) || isRadarWiseDewPointEntity(entityId, state) || isRadarWiseWindSpeedEntity(entityId, state) || isRadarWiseWindDirectionEntity(entityId, state) || isRadarWiseAirQualityEntity(entityId, state) || isRadarWiseUvIndexEntity(entityId, state) || isRadarWisePollenEntity(entityId, state)).map(([entityId, state]) => `${entityId}:${state.attributes?.friendly_name || ""}:${state.attributes?.device_class || ""}`).sort().join("|");
  }
  _setValue(key, value) {
    const numberKeys = ["latitude", "longitude", "hourly_count", "forecast_count", "card_height", "card_max_height", "radar_zoom", "radar_speed"];
    const booleanKeys = ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast", "show_forecast_summary", "show_humidity", "show_dew_point", "show_wind", "show_sunrise", "show_sunset", "show_environment", "show_custom_sensors", "timeline_autoscroll"];
    let nextValue = value;
    if (numberKeys.includes(key)) nextValue = value === "" ? void 0 : Number(value);
    if (booleanKeys.includes(key)) nextValue = Boolean(value);
    const switchesToCustom = ["show_radar", "show_timeline", "show_forecast", "show_forecast_summary", "show_humidity", "show_dew_point", "show_wind", "show_sunrise", "show_sunset", "show_environment", "show_custom_sensors"].includes(key);
    const fullPresetDefaults = key === "content_mode" && nextValue === "full" ? { show_radar: true, show_timeline: true, show_forecast: true, show_forecast_summary: true, show_humidity: true, show_dew_point: true, show_wind: true, show_sunrise: true, show_sunset: true, show_environment: true, show_custom_sensors: true } : {};
    this._config = { ...this._config, ...fullPresetDefaults, ...switchesToCustom ? { content_mode: "custom" } : {}, [key]: nextValue };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
    this._render();
  }
  _setCustomSensorValue(index, key, value) {
    const sensors = Array.isArray(this._config.custom_sensors) ? this._config.custom_sensors.map((sensor) => ({ ...sensor || {} })) : [];
    while (sensors.length <= index) sensors.push({});
    sensors[index][key] = value;
    const cleaned = sensors.map((sensor) => ({
      entity: String(sensor.entity || "").trim(),
      name: String(sensor.name || "").trim(),
      icon: String(sensor.icon || "").trim(),
      unit: String(sensor.unit || "").trim()
    })).filter((sensor) => sensor.entity || sensor.name || sensor.icon || sensor.unit);
    this._config = { ...this._config, custom_sensors: cleaned, show_custom_sensors: true };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
    this._render();
  }
  _render() {
    if (!this.shadowRoot) return;
    this._rendered = true;
    const config = this._config || {};
    const entities = this._weatherEntities();
    const humiditySensors = this._humidityEntities();
    const temperatureSensors = this._temperatureEntities();
    const dewPointSensors = this._dewPointEntities();
    const windSpeedSensors = this._windSpeedEntities();
    const windDirectionSensors = this._windDirectionEntities();
    const airQualitySensors = this._airQualityEntities();
    const uvIndexSensors = this._uvIndexEntities();
    const pollenSensors = this._pollenEntities();
    const treePollenSensors = this._pollenEntities("tree");
    const grassPollenSensors = this._pollenEntities("grass");
    const weedPollenSensors = this._pollenEntities("weed");
    const moldPollenSensors = this._pollenEntities("mold");
    const customSensorEntities = this._customSensorEntities();
    const customSensorSlots = Array.isArray(config.custom_sensors) ? config.custom_sensors.slice(0, 3) : [];
    while (customSensorSlots.length < 3) customSensorSlots.push({});
    const hasConfiguredEntity = entities.some(([entityId]) => entityId === config.entity);
    const hasConfiguredHumidityEntity = humiditySensors.some(([entityId]) => entityId === config.humidity_entity);
    const hasConfiguredTemperatureEntity = temperatureSensors.some(([entityId]) => entityId === config.temperature_entity);
    const hasConfiguredDewPointEntity = dewPointSensors.some(([entityId]) => entityId === config.dew_point_entity);
    const hasConfiguredWindSpeedEntity = windSpeedSensors.some(([entityId]) => entityId === config.wind_speed_entity);
    const hasConfiguredWindDirectionEntity = windDirectionSensors.some(([entityId]) => entityId === config.wind_direction_entity);
    const hasConfiguredUvIndexEntity = uvIndexSensors.some(([entityId]) => entityId === config.uv_index_entity);
    const configuredOption = config.entity && !hasConfiguredEntity ? `<option value="${_wwEscape(config.entity)}" selected>${_wwEscape(config.entity)}</option>` : "";
    const configuredHumidityOption = config.humidity_entity && !hasConfiguredHumidityEntity && isRadarWiseHumidityEntity(config.humidity_entity, this._hass?.states?.[config.humidity_entity]) ? `<option value="${_wwEscape(config.humidity_entity)}" selected>${_wwEscape(config.humidity_entity)}</option>` : "";
    const configuredTemperatureOption = config.temperature_entity && !hasConfiguredTemperatureEntity && isRadarWiseTemperatureEntity(config.temperature_entity, this._hass?.states?.[config.temperature_entity]) ? `<option value="${_wwEscape(config.temperature_entity)}" selected>${_wwEscape(config.temperature_entity)}</option>` : "";
    const configuredDewPointOption = config.dew_point_entity && !hasConfiguredDewPointEntity && isRadarWiseDewPointEntity(config.dew_point_entity, this._hass?.states?.[config.dew_point_entity]) ? `<option value="${_wwEscape(config.dew_point_entity)}" selected>${_wwEscape(config.dew_point_entity)}</option>` : "";
    const configuredWindSpeedOption = config.wind_speed_entity && !hasConfiguredWindSpeedEntity && isRadarWiseWindSpeedEntity(config.wind_speed_entity, this._hass?.states?.[config.wind_speed_entity]) ? `<option value="${_wwEscape(config.wind_speed_entity)}" selected>${_wwEscape(config.wind_speed_entity)}</option>` : "";
    const configuredWindDirectionOption = config.wind_direction_entity && !hasConfiguredWindDirectionEntity && isRadarWiseWindDirectionEntity(config.wind_direction_entity, this._hass?.states?.[config.wind_direction_entity]) ? `<option value="${_wwEscape(config.wind_direction_entity)}" selected>${_wwEscape(config.wind_direction_entity)}</option>` : "";
    const configuredAirQualityOption = this._configuredSensorOption(config.air_quality_entity, airQualitySensors, isRadarWiseAirQualityEntity);
    const configuredUvIndexOption = config.uv_index_entity && !hasConfiguredUvIndexEntity && isRadarWiseUvIndexEntity(config.uv_index_entity, this._hass?.states?.[config.uv_index_entity]) ? `<option value="${_wwEscape(config.uv_index_entity)}" selected>${_wwEscape(config.uv_index_entity)}</option>` : "";
    const configuredPollenOption = this._configuredSensorOption(config.pollen_entity, pollenSensors, isRadarWisePollenEntity);
    const configuredTreePollenOption = this._configuredSensorOption(config.tree_pollen_entity, treePollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "tree"));
    const configuredGrassPollenOption = this._configuredSensorOption(config.grass_pollen_entity, grassPollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "grass"));
    const configuredWeedPollenOption = this._configuredSensorOption(config.weed_pollen_entity, weedPollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "weed"));
    const configuredMoldPollenOption = this._configuredSensorOption(config.mold_pollen_entity, moldPollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "mold"));
    const weatherOptions = entities.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${_wwEscape(entityId)}" ${config.entity === entityId ? "selected" : ""}>${_wwEscape(name)} (${_wwEscape(entityId)})</option>`;
    }).join("");
    const temperatureOptions = this._sensorOptions(temperatureSensors, config.temperature_entity);
    const humidityOptions = this._sensorOptions(humiditySensors, config.humidity_entity);
    const dewPointOptions = this._sensorOptions(dewPointSensors, config.dew_point_entity);
    const windSpeedOptions = this._sensorOptions(windSpeedSensors, config.wind_speed_entity);
    const windDirectionOptions = this._sensorOptions(windDirectionSensors, config.wind_direction_entity);
    const airQualityOptions = this._sensorOptions(airQualitySensors, config.air_quality_entity);
    const uvIndexOptions = this._sensorOptions(uvIndexSensors, config.uv_index_entity);
    const pollenOptions = this._sensorOptions(pollenSensors, config.pollen_entity);
    const treePollenOptions = this._sensorOptions(treePollenSensors, config.tree_pollen_entity);
    const grassPollenOptions = this._sensorOptions(grassPollenSensors, config.grass_pollen_entity);
    const weedPollenOptions = this._sensorOptions(weedPollenSensors, config.weed_pollen_entity);
    const moldPollenOptions = this._sensorOptions(moldPollenSensors, config.mold_pollen_entity);
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif);color:var(--primary-text-color,#0a1e28)}
        .editor{display:grid;gap:14px}
        .section{border:1px solid var(--divider-color,rgba(0,0,0,.12));border-radius:12px;padding:12px;background:var(--card-background-color,#fff)}
        .section-title{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--secondary-text-color,#536b75);margin-bottom:10px}
        label{display:grid;gap:5px;font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75)}
        input,select{width:100%;box-sizing:border-box;border:1px solid var(--divider-color,rgba(0,0,0,.18));border-radius:8px;padding:9px 10px;background:var(--card-background-color,#fff);color:var(--primary-text-color,#0a1e28);font:inherit}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .hint{font-size:12px;line-height:1.4;color:var(--secondary-text-color,#536b75);margin-top:8px}
        .check{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--primary-text-color,#0a1e28)}
        .check input{width:auto}
        .custom-sensor-slot{border:1px solid var(--divider-color,rgba(0,0,0,.12));border-radius:10px;padding:10px;margin-top:10px;background:color-mix(in srgb,var(--primary-color,#2a7a94) 4%,var(--card-background-color,#fff))}
        .slot-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--secondary-text-color,#536b75);margin-bottom:8px}
        @media(max-width:600px){.grid{grid-template-columns:1fr}}
        .layout-label{font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75);margin:12px 0 8px}
        .layout-picker{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}
        .layout-tile{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px;border:2px solid var(--divider-color,rgba(0,0,0,.15));border-radius:10px;cursor:pointer;background:var(--card-background-color,#fff);transition:border-color .15s,background .15s;user-select:none}
        .layout-tile:hover{border-color:var(--primary-color,#2a7a94);background:color-mix(in srgb,var(--primary-color,#2a7a94) 6%,var(--card-background-color,#fff))}
        .layout-tile.selected{border-color:var(--primary-color,#2a7a94);background:color-mix(in srgb,var(--primary-color,#2a7a94) 10%,var(--card-background-color,#fff))}
        .layout-tile svg{display:block}
        .layout-tile-name{font-size:12px;font-weight:800;color:var(--primary-text-color,#0a1e28);text-align:center;line-height:1.2}
        .layout-tile-desc{font-size:10px;font-weight:600;color:var(--secondary-text-color,#536b75);text-align:center;line-height:1.2}
        @media(max-width:480px){.layout-picker{grid-template-columns:repeat(2,1fr)}}
        .panel-order-label{font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75);margin:12px 0 6px}
        .panel-order-list{display:flex;flex-direction:column;gap:6px}
        .panel-order-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:10px;background:var(--card-background-color,#fff);cursor:grab;user-select:none;transition:box-shadow .15s,opacity .15s}
        .panel-order-item:active{cursor:grabbing}
        .panel-order-item *{pointer-events:none}
        .panel-order-item.drag-over{box-shadow:0 0 0 2px var(--primary-color,#2a7a94);border-color:var(--primary-color,#2a7a94)}
        .panel-order-item.dragging{opacity:.4}
        .drag-handle{font-size:18px;color:var(--secondary-text-color,#536b75);line-height:1;flex-shrink:0}
        .panel-order-icon{width:32px;height:32px;flex-shrink:0;display:grid;place-items:center}
        .panel-order-name{font-size:13px;font-weight:800;color:var(--primary-text-color,#0a1e28)}
        .panel-order-desc{font-size:11px;color:var(--secondary-text-color,#536b75)}
        .col-widths{display:flex;flex-direction:column;gap:8px;margin-top:12px}
        .col-width-row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75)}
        .col-width-row input[type=range]{width:100%;accent-color:var(--primary-color,#2a7a94)}
        .col-width-val{font-size:13px;font-weight:800;color:var(--primary-text-color,#0a1e28);min-width:28px;text-align:right}
      </style>
      <div class="editor">
        <div class="section">
          <div class="section-title">Weather source</div>
          <label>Weather entity
            <select id="entity">
              <option value="">Choose a weather entity</option>
              ${configuredOption}
              ${weatherOptions}
            </select>
          </label>
          <label>Current temperature entity
            <select id="temperature_entity">
              <option value="">Auto from weather entity</option>
              ${configuredTemperatureOption}
              ${temperatureOptions}
            </select>
          </label>
          <label>Humidity entity
            <select id="humidity_entity">
              <option value="">Auto from weather entity</option>
              ${configuredHumidityOption}
              ${humidityOptions}
            </select>
          </label>
          <label>Dew point entity
            <select id="dew_point_entity">
              <option value="">Auto from weather entity</option>
              ${configuredDewPointOption}
              ${dewPointOptions}
            </select>
          </label>
          <div class="grid" style="margin-top:10px">
            <label>Wind speed entity
              <select id="wind_speed_entity">
                <option value="">Auto from weather entity</option>
                ${configuredWindSpeedOption}
                ${windSpeedOptions}
              </select>
            </label>
            <label>Wind direction entity
              <select id="wind_direction_entity">
                <option value="">Auto from weather entity</option>
                ${configuredWindDirectionOption}
                ${windDirectionOptions}
              </select>
            </label>
          </div>
          <div class="hint">RadarWise reads an existing Home Assistant weather entity and calls Home Assistant's forecast service. Use local temperature, humidity, dew point, wind speed, or wind direction sensors when your weather entity differs from the spot you care about.</div>
        </div>
        <div class="section">
          <div class="section-title">Environment sensors</div>
          <label style="margin-bottom:10px">Environment source
            <select id="environment_source">
              ${Object.entries(RADARWISE_ENVIRONMENT_SOURCES).map(([value, label]) => `<option value="${value}" ${config.environment_source === value ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
          <div class="grid">
            <label>Air quality entity
              <select id="air_quality_entity">
                <option value="">None</option>
                ${configuredAirQualityOption}
                ${airQualityOptions}
              </select>
            </label>
            <label>UV index entity
              <select id="uv_index_entity">
                <option value="">Auto / Open-Meteo</option>
                ${configuredUvIndexOption}
                ${uvIndexOptions}
              </select>
            </label>
            <label>Pollen entity
              <select id="pollen_entity">
                <option value="">None</option>
                ${configuredPollenOption}
                ${pollenOptions}
              </select>
            </label>
            <label>Tree pollen entity
              <select id="tree_pollen_entity">
                <option value="">None</option>
                ${configuredTreePollenOption}
                ${treePollenOptions}
              </select>
            </label>
            <label>Grass pollen entity
              <select id="grass_pollen_entity">
                <option value="">None</option>
                ${configuredGrassPollenOption}
                ${grassPollenOptions}
              </select>
            </label>
            <label>Weed pollen entity
              <select id="weed_pollen_entity">
                <option value="">None</option>
                ${configuredWeedPollenOption}
                ${weedPollenOptions}
              </select>
            </label>
            <label>Mold entity
              <select id="mold_pollen_entity">
                <option value="">None</option>
                ${configuredMoldPollenOption}
                ${moldPollenOptions}
              </select>
            </label>
          </div>
          <label class="check" style="margin-top:10px"><input id="show_environment" type="checkbox" ${config.show_environment === false ? "" : "checked"}> Show AQI / pollen beside the clock</label>
          <div class="hint">Use Home Assistant sensors for fully entity-driven data, or Open-Meteo for no-key AQI, UV index, and pollen using the radar latitude/longitude. Open-Meteo does not provide mold; mold remains sensor-only.</div>
        </div>
        <div class="section">
          <div class="section-title">Weather detail tiles</div>
          <div class="hint" style="margin-top:0">Choose which built-in weather details appear, then add up to three Home Assistant sensors in the visual editor. YAML can define up to six optional sensors.</div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
            <label class="check"><input id="show_humidity" type="checkbox" ${config.show_humidity === false ? "" : "checked"}> Show humidity</label>
            <label class="check"><input id="show_dew_point" type="checkbox" ${config.show_dew_point === false ? "" : "checked"}> Show dew point</label>
            <label class="check"><input id="show_wind" type="checkbox" ${config.show_wind === false ? "" : "checked"}> Show wind</label>
            <label class="check"><input id="show_sunrise" type="checkbox" ${config.show_sunrise === false ? "" : "checked"}> Show sunrise</label>
            <label class="check"><input id="show_sunset" type="checkbox" ${config.show_sunset === false ? "" : "checked"}> Show sunset</label>
          </div>
          <label class="check" style="margin-top:10px"><input id="show_custom_sensors" type="checkbox" ${config.show_custom_sensors === false ? "" : "checked"}> Show custom sensor blocks</label>
          ${customSensorSlots.map((sensor, index) => {
      const selected = sensor?.entity || "";
      const configuredCustomOption = selected && !customSensorEntities.some(([entityId]) => entityId === selected) ? `<option value="${_wwEscape(selected)}" selected>${_wwEscape(selected)}</option>` : "";
      return `
              <div class="custom-sensor-slot">
                <div class="slot-title">Detail block ${index + 1}</div>
                <label>Entity
                  <select data-custom-sensor-index="${index}" data-custom-sensor-field="entity">
                    <option value="">None</option>
                    ${configuredCustomOption}
                    ${this._sensorOptions(customSensorEntities, selected)}
                  </select>
                </label>
                <div class="grid" style="margin-top:10px">
                  <label>Label <input data-custom-sensor-index="${index}" data-custom-sensor-field="name" value="${_wwEscape(sensor?.name || "")}" placeholder="Auto name"></label>
                  <label>Icon <input data-custom-sensor-index="${index}" data-custom-sensor-field="icon" value="${_wwEscape(sensor?.icon || "")}" placeholder="mdi:pool-thermometer"></label>
                  <label>Unit override <input data-custom-sensor-index="${index}" data-custom-sensor-field="unit" value="${_wwEscape(sensor?.unit || "")}" placeholder="Auto unit"></label>
                </div>
              </div>
            `;
    }).join("")}
        </div>
        <div class="section">
          <div class="section-title">Region and radar</div>
          <div class="grid">
            <label>Country / region
              <select id="country">
                ${Object.entries(RADARWISE_COUNTRIES).map(([value, label]) => `<option value="${value}" ${config.country === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar provider
              <select id="radar_provider">
                ${Object.entries(RADARWISE_RADAR).map(([value, label]) => `<option value="${value}" ${config.radar_provider === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar style
              <select id="radar_style">
                ${Object.entries(RADARWISE_RADAR_STYLES).map(([value, label]) => `<option value="${value}" ${config.radar_style === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Map style
              <select id="radar_basemap">
                ${Object.entries(RADARWISE_BASEMAPS).map(([value, label]) => `<option value="${value}" ${config.radar_basemap === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar timeline
              <select id="radar_timeline">
                ${Object.entries(RADARWISE_RADAR_TIMELINES).map(([value, label]) => `<option value="${value}" ${config.radar_timeline === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="hint">Auto uses NOAA radar for the United States, Environment Canada radar for Canada, native BOM radar tiles for Australia, and RainViewer global radar for the UK and other regions. Future radar is used only when the selected provider exposes future frames.</div>
        </div>
        <div class="section">
          <div class="section-title">Display</div>
          <div class="grid">
            <label>Title <input id="title" value="${_wwEscape(config.title || "")}" placeholder="Local Weather"></label>
            <label>Units
              <select id="units">
                <option value="auto" ${config.units !== "imperial" && config.units !== "metric" ? "selected" : ""}>Auto from weather entity</option>
                <option value="imperial" ${config.units === "imperial" ? "selected" : ""}>Imperial</option>
                <option value="metric" ${config.units === "metric" ? "selected" : ""}>Metric</option>
              </select>
            </label>
            <label>Theme
              <select id="theme_mode">
                <option value="radarwise" ${config.theme_mode !== "auto" ? "selected" : ""}>RadarWise</option>
                <option value="auto" ${config.theme_mode === "auto" ? "selected" : ""}>Match Home Assistant theme</option>
              </select>
            </label>
            <label>Language
              <select id="language">
                ${Object.entries(RADARWISE_LANGUAGES).map(([value, label]) => `<option value="${value}" ${(config.language || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Time format
              <select id="time_format">
                ${Object.entries(RADARWISE_TIME_FORMATS).map(([value, label]) => `<option value="${value}" ${(config.time_format || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Time zone source
              <select id="time_zone_mode">
                ${Object.entries(RADARWISE_TIME_ZONE_MODES).map(([value, label]) => `<option value="${value}" ${(config.time_zone_mode || "browser") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Custom time zone <input id="time_zone" value="${_wwEscape(config.time_zone || "")}" placeholder="America/New_York"></label>
            <label>Font
              <select id="font_family">
                ${Object.entries(RADARWISE_FONT_FAMILIES).map(([value, label]) => `<option value="${value}" ${(config.font_family || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Density
              <select id="density">
                ${Object.entries(RADARWISE_DENSITIES).map(([value, label]) => `<option value="${value}" ${(config.density || "comfortable") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Forecast list rows <input id="hourly_count" type="number" min="1" max="24" value="${_wwEscape(config.hourly_count || 5)}"></label>
            <label>Forecast cards <input id="forecast_count" type="number" min="1" max="7" value="${_wwEscape(config.forecast_count || 5)}"></label>
            <label>Forecast card frequency
              <select id="forecast_mode">
                ${Object.entries(RADARWISE_FORECAST_MODES).map(([value, label]) => `<option value="${value}" ${(config.forecast_mode || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="hint">The custom time zone uses an IANA name such as America/New_York and applies only when Custom is selected. Invalid or unavailable zones safely fall back to browser time. Daily and twice-daily choices are preferences; RadarWise falls back automatically when the weather provider does not supply the selected forecast type.</div>
          <div class="layout-label">Content focus</div>
          <div class="layout-picker">
            ${Object.entries({
      full: { name: "Full", desc: "Everything", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><rect x="5" y="6" width="17" height="38" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".16"/><rect x="27" y="6" width="20" height="38" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".11"/><rect x="52" y="6" width="15" height="38" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/></svg>` },
      essentials: { name: "Essentials", desc: "Clock + current", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><circle cx="18" cy="17" r="9" stroke="var(--primary-color,#2a7a94)" stroke-width="2" opacity=".55"/><path d="M18 11v7l5 3" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round" opacity=".55"/><circle cx="44" cy="19" r="8" fill="#fbbf24"/><rect x="35" y="32" width="26" height="4" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".25"/></svg>` },
      forecast: { name: "Forecast", desc: "Daily cards", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><rect x="6" y="8" width="17" height="34" rx="4" fill="var(--primary-color,#2a7a94)" opacity=".12"/><rect x="27" y="8" width="17" height="34" rx="4" fill="var(--primary-color,#2a7a94)" opacity=".12"/><rect x="48" y="8" width="17" height="34" rx="4" fill="var(--primary-color,#2a7a94)" opacity=".12"/><circle cx="15" cy="19" r="4" fill="#fbbf24"/><path d="M33 22c4-4 8-4 12 0" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/><path d="M53 22c4-4 8-4 12 0" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/></svg>` },
      timeline: { name: "Hourly", desc: "Timeline list", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><rect x="8" y="10" width="56" height="6" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".16"/><rect x="8" y="22" width="56" height="6" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".22"/><rect x="8" y="34" width="56" height="6" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".16"/><rect x="20" y="12" width="30" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".55"/><rect x="20" y="24" width="38" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".55"/><rect x="20" y="36" width="24" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".55"/></svg>` },
      radar: { name: "Radar", desc: "Map only", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><path d="M8 35Q18 20 30 29T52 18T66 24" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round" opacity=".5"/><circle cx="38" cy="25" r="12" stroke="var(--primary-color,#2a7a94)" stroke-width="2" opacity=".45"/><path d="M38 25l10-9" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round"/><circle cx="38" cy="25" r="3" fill="var(--primary-color,#2a7a94)"/></svg>` },
      custom: { name: "Custom", desc: "Use switches", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><path d="M16 14h40M16 25h40M16 36h40" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round" opacity=".35"/><circle cx="28" cy="14" r="5" fill="var(--primary-color,#2a7a94)" opacity=".55"/><circle cx="45" cy="25" r="5" fill="var(--primary-color,#2a7a94)" opacity=".55"/><circle cx="23" cy="36" r="5" fill="var(--primary-color,#2a7a94)" opacity=".55"/></svg>` }
    }).map(([value, meta]) => `
              <button type="button" class="layout-tile${(config.content_mode || "full") === value ? " selected" : ""}" data-content-mode="${value}" title="${_wwEscape(meta.desc)}">
                ${meta.icon}
                <span class="layout-tile-name">${_wwEscape(meta.name)}</span>
                <span class="layout-tile-desc">${_wwEscape(meta.desc)}</span>
              </button>
            `).join("")}
          </div>
          <div class="hint" style="margin-top:10px">Use a focus preset for simple cards like radar-only, forecast-only, or hourly-only. Changing an individual visibility switch below moves the card to Custom.</div>
          <div class="layout-label">Card layout</div>
          <div class="layout-picker">
            <button type="button" class="layout-tile${(config.layout || "auto") === "auto" ? " selected" : ""}" data-layout="auto" title="Automatically adapts to screen size">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="18" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="6" y="7" width="10" height="4" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="6" y="13" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".35"/>
                <rect x="6" y="17" width="12" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="6" y="23" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="27" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="31" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="24" y="4" width="26" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <circle cx="33" cy="14" r="6" fill="var(--primary-color,#2a7a94)" opacity=".4"/>
                <rect x="27" y="23" width="22" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="27" y="28" width="22" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="27" y="33" width="22" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="52" y="4" width="16" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M52 26 Q56 20 60 24 Q64 18 68 22" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Auto</span>
              <span class="layout-tile-desc">Adapts to screen</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "wide_panel" ? " selected" : ""}" data-layout="wide_panel" title="Optimised for wide screens \u2014 columns stay side-by-side">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="14" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="6" y="7" width="8" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="6" y="13" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".35"/>
                <rect x="6" y="17" width="9" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="6" y="21" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="25" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="29" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="20" y="4" width="30" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <circle cx="30" cy="13" r="5" fill="var(--primary-color,#2a7a94)" opacity=".4"/>
                <rect x="23" y="22" width="24" height="2.5" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="23" y="27" width="24" height="2.5" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="23" y="32" width="24" height="2.5" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="52" y="4" width="16" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M52 26 Q56 20 60 24 Q64 18 68 22" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Wide panel</span>
              <span class="layout-tile-desc">Always side-by-side</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "stacked" ? " selected" : ""}" data-layout="stacked" title="Sections stack vertically \u2014 good for narrow dashboards">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="64" height="13" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="8" y="7" width="16" height="4" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="28" y="8" width="12" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".3"/>
                <rect x="28" y="12" width="20" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="4" y="19" width="64" height="13" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <rect x="8" y="22" width="56" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="8" y="26" width="48" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="8" y="30" width="52" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="4" y="34" width="64" height="12" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M8 42 Q18 36 28 40 Q38 34 48 38 Q55 34 64 37" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Stacked</span>
              <span class="layout-tile-desc">Sections top to bottom</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "radar_bottom" ? " selected" : ""}" data-layout="radar_bottom" title="Hourly and current weather side-by-side on top, full-width radar below">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="18" height="22" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="6" y="7" width="10" height="4" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="6" y="13" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".3"/>
                <rect x="6" y="17" width="12" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="21" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".15"/>
                <rect x="24" y="4" width="44" height="22" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <circle cx="34" cy="13" r="5" fill="var(--primary-color,#2a7a94)" opacity=".4"/>
                <rect x="27" y="21" width="38" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="4" y="28" width="64" height="18" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M6 40 Q14 33 22 37 Q30 31 38 35 Q46 30 54 34 Q60 31 66 33" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".55"/>
              </svg>
              <span class="layout-tile-name">Radar bottom</span>
              <span class="layout-tile-desc">Wide radar below</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "compact" ? " selected" : ""}" data-layout="compact" title="Shorter stacked layout \u2014 good for sidebar or mobile">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="64" height="10" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="8" y="6" width="14" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="26" y="7" width="20" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="4" y="16" width="64" height="9" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <rect x="8" y="18" width="56" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="8" y="22" width="40" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="4" y="27" width="64" height="9" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".08"/>
                <rect x="8" y="29" width="22" height="5" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".15"/>
                <rect x="32" y="29" width="14" height="5" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="48" y="29" width="14" height="5" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <rect x="4" y="38" width="64" height="8" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M8 44 Q18 40 28 42 Q38 38 48 41 Q55 38 64 40" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Compact</span>
              <span class="layout-tile-desc">Condensed, less tall</span>
            </button>
          </div>
          <div class="hint" style="margin-top:10px">Auto is recommended for most dashboards \u2014 it switches between wide and stacked depending on how much space the card has.</div>
          <div class="panel-order-label">Panel order \u2014 drag to rearrange</div>
          <div class="panel-order-list" id="panel-order-list">
            ${(config.panel_order || ["clock", "weather", "radar"]).map((key) => {
      const meta = {
        clock: { name: "Clock & Timeline", desc: "Time, date, forecast summary, hourly list", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>` },
        weather: { name: "Current Weather", desc: "Condition, temperature, forecast cards, stats", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="4" fill="#fbbf24"/><path d="M5 17a5 5 0 0 1 14 0" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/></svg>` },
        radar: { name: "Radar Map", desc: "Live radar, warnings, playback controls", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 12 L18 6" stroke="#2a7a94" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="#2a7a94"/></svg>` }
      }[key] || { name: key, desc: "", icon: "" };
      return `<div class="panel-order-item" draggable="true" data-panel="${_wwEscape(key)}">
                <span class="drag-handle" aria-hidden="true">\u283F</span>
                <span class="panel-order-icon" style="color:var(--primary-color,#2a7a94)">${meta.icon}</span>
                <div><div class="panel-order-name">${_wwEscape(meta.name)}</div><div class="panel-order-desc">${_wwEscape(meta.desc)}</div></div>
              </div>`;
    }).join("")}
          </div>
          <div class="col-widths">
            ${(config.panel_order || ["clock", "weather", "radar"]).map((key, i) => {
      const names = { clock: "Clock & Timeline", weather: "Current Weather", radar: "Radar Map" };
      const w = (config.column_widths || [25, 50, 25])[i] || 25;
      return `<div class="col-width-row">
                <span class="col-width-name">${_wwEscape(names[key] || key)}</span>
                <div style="display:flex;align-items:center;gap:4px">
                  <button type="button" class="col-width-step" data-idx="${i}" data-dir="-1" style="width:28px;height:28px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:6px;background:var(--card-background-color,#fff);color:var(--primary-text-color);font-size:16px;cursor:pointer;line-height:1;padding:0">\u2212</button>
                  <span id="col_width_val_${i}" style="min-width:42px;text-align:center;font-size:15px;font-weight:700;color:var(--primary-text-color,#0a1e28)">${w}%</span>
                  <button type="button" class="col-width-step" data-idx="${i}" data-dir="1" style="width:28px;height:28px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:6px;background:var(--card-background-color,#fff);color:var(--primary-text-color);font-size:16px;cursor:pointer;line-height:1;padding:0">+</button>
                </div>
              </div>`;
    }).join("")}
            ${(() => {
      const tot = (config.column_widths || [25, 50, 25]).reduce((a, b) => a + b, 0);
      const ok = tot === 100;
      return `<div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between"><span style="font-size:12px;font-weight:${ok ? "normal" : "700"};color:${ok ? "var(--secondary-text-color,#536b75)" : "var(--error-color,#c0392b)"}">Total: ${tot}%${ok ? "" : " \u2014 must equal 100%"}</span><button type="button" id="col_width_reset" style="font-size:12px;padding:4px 10px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:6px;background:var(--card-background-color,#fff);color:var(--secondary-text-color,#536b75);cursor:pointer">Reset widths</button></div>`;
    })()}
          </div>
          <div style="margin-top:14px">
            <div class="col-width-label" style="margin-bottom:2px">Collapse to vertical layout when too narrow</div>
            <div class="hint" style="margin-bottom:6px">If the card looks cramped or squished, set this to the card's approximate pixel width. The card will automatically stack vertically when it's smaller than that size. Leave at Off if the card looks fine.</div>
            <div class="col-width-row">
              <input type="range" id="stack_below" min="0" max="1200" step="50" value="${config.stack_below || 0}" style="flex:1">
              <span class="col-width-val" id="stack_below_val">${config.stack_below ? config.stack_below + "px" : "Off"}</span>
            </div>
          </div>
          <div class="grid" style="margin-top:14px">
            <label>Card height <input id="card_height" type="number" min="0" max="1200" step="10" value="${_wwEscape(config.card_height || "")}" placeholder="Auto"></label>
            <label>Max card height <input id="card_max_height" type="number" min="0" max="1200" step="10" value="${_wwEscape(config.card_max_height || "")}" placeholder="Auto"></label>
          </div>
          <div class="hint">Use pixel heights when dashboard panel mode has extra vertical room. Leave blank for RadarWise's responsive defaults.</div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <label class="check"><input id="show_forecast_summary" type="checkbox" ${config.show_forecast_summary === false ? "" : "checked"}> Show forecast summary ticker</label>
            <label class="check"><input id="show_timeline" type="checkbox" ${config.show_timeline === false ? "" : "checked"}> Show hourly / forecast list</label>
            <label class="check"><input id="show_forecast" type="checkbox" ${config.show_forecast === false ? "" : "checked"}> Show daily forecast cards</label>
            <label class="check"><input id="timeline_autoscroll" type="checkbox" ${config.timeline_autoscroll ? "checked" : ""}> Auto-scroll the forecast list</label>
            <label class="check"><input id="show_animations" type="checkbox" ${config.show_animations === false ? "" : "checked"}> Subtle weather animations</label>
          </div>
          <div class="hint">Animations automatically pause when the browser or device requests reduced motion.</div>
        </div>
        <div class="section">
          <div class="section-title">Radar location</div>
          <div class="grid">
            <label>Latitude <input id="latitude" type="number" step="0.0001" value="${_wwEscape(config.latitude ?? "")}"></label>
            <label>Longitude <input id="longitude" type="number" step="0.0001" value="${_wwEscape(config.longitude ?? "")}"></label>
            <label>Radar zoom <input id="radar_zoom" type="number" min="3" max="12" value="${_wwEscape(config.radar_zoom || 7)}"></label>
            <label>Loop speed <input id="radar_speed" type="number" min="300" max="3000" step="100" value="${_wwEscape(config.radar_speed || 700)}"></label>
          </div>
          <label class="check"><input id="show_radar" type="checkbox" ${config.show_radar === false ? "" : "checked"}> Show radar panel</label>
          <label class="check"><input id="show_map_controls" type="checkbox" ${config.show_map_controls === false ? "" : "checked"}> Show map controls</label>
          <label class="check"><input id="radar_controls" type="checkbox" ${config.radar_controls === false ? "" : "checked"}> Show radar playback controls</label>
          <label class="check"><input id="show_warning_overlay" type="checkbox" ${config.show_warning_overlay === false ? "" : "checked"}> Show US warning overlay</label>
          <div class="hint">Latitude and longitude control only the radar center. They do not change the selected weather entity.</div>
        </div>
      </div>
    `;
    ["entity", "temperature_entity", "humidity_entity", "dew_point_entity", "wind_speed_entity", "wind_direction_entity", "air_quality_entity", "uv_index_entity", "pollen_entity", "tree_pollen_entity", "grass_pollen_entity", "weed_pollen_entity", "mold_pollen_entity", "environment_source", "country", "radar_provider", "radar_style", "radar_basemap", "radar_timeline", "title", "units", "theme_mode", "language", "time_format", "time_zone_mode", "time_zone", "font_family", "density", "latitude", "longitude", "hourly_count", "forecast_count", "forecast_mode", "card_height", "card_max_height", "radar_zoom", "radar_speed"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.value));
    });
    ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast", "show_forecast_summary", "show_humidity", "show_dew_point", "show_wind", "show_sunrise", "show_sunset", "show_environment", "show_custom_sensors", "timeline_autoscroll"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.checked));
    });
    this.shadowRoot.querySelectorAll("[data-custom-sensor-index][data-custom-sensor-field]").forEach((input) => {
      input.addEventListener("change", (event) => {
        this._setCustomSensorValue(Number(input.dataset.customSensorIndex), input.dataset.customSensorField, event.target.value);
      });
    });
    this.shadowRoot.querySelectorAll("[data-layout]").forEach((tile) => {
      tile.addEventListener("click", () => this._setValue("layout", tile.dataset.layout));
    });
    this.shadowRoot.querySelectorAll("[data-content-mode]").forEach((tile) => {
      tile.addEventListener("click", () => this._setValue("content_mode", tile.dataset.contentMode));
    });
    this.shadowRoot.querySelectorAll(".col-width-step").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        const dir = Number(btn.dataset.dir);
        const widths = (this._config.column_widths || [25, 50, 25]).slice();
        widths[i] = Math.max(20, Math.min(60, (widths[i] || 25) + dir * 5));
        this._setValue("column_widths", widths);
      });
    });
    this.shadowRoot.getElementById("col_width_reset")?.addEventListener("click", () => {
      this._setValue("column_widths", [25, 50, 25]);
    });
    const stackSlider = this.shadowRoot.getElementById("stack_below");
    const stackVal = this.shadowRoot.getElementById("stack_below_val");
    if (stackSlider && stackVal) {
      stackSlider.addEventListener("change", () => {
        const v = Number(stackSlider.value);
        stackVal.textContent = v === 0 ? "Off" : `${v}px`;
        this._setValue("stack_below", v);
      });
      stackSlider.addEventListener("input", () => {
        const v = Number(stackSlider.value);
        stackVal.textContent = v === 0 ? "Off" : `${v}px`;
      });
    }
    let dragKey = null;
    const allItems = () => this.shadowRoot.querySelectorAll(".panel-order-item");
    const clearOver = () => allItems().forEach((el) => el.classList.remove("drag-over"));
    this.shadowRoot.querySelectorAll(".panel-order-item").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        dragKey = item.dataset.panel;
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      item.addEventListener("dragend", () => {
        dragKey = null;
        allItems().forEach((el) => el.classList.remove("dragging", "drag-over"));
      });
      item.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (item.dataset.panel === dragKey) return;
        clearOver();
        item.classList.add("drag-over");
      });
      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
      item.addEventListener("drop", (e) => {
        e.preventDefault();
        clearOver();
        if (!dragKey || item.dataset.panel === dragKey) return;
        const current = (this._config.panel_order || ["clock", "weather", "radar"]).slice();
        const fromIdx = current.indexOf(dragKey);
        const toIdx = current.indexOf(item.dataset.panel);
        if (fromIdx === -1 || toIdx === -1) return;
        current.splice(fromIdx, 1);
        current.splice(toIdx, 0, dragKey);
        this._setValue("panel_order", current);
      });
    });
  }
};
var RadarWiseDashedCard = class extends RadarWiseCard {
};
var RadarWiseDashedCardEditor = class extends RadarWiseCardEditor {
};
var RadarWiseLegacyCard = class extends RadarWiseCard {
};
var RadarWiseLegacyDashedCard = class extends RadarWiseCard {
};
var RadarWiseLegacyCardEditor = class extends RadarWiseCardEditor {
};
var RadarWiseLegacyDashedCardEditor = class extends RadarWiseCardEditor {
};
if (!customElements.get(CARD_TYPES[0])) customElements.define(CARD_TYPES[0], RadarWiseCard);
if (!customElements.get(CARD_TYPES[1])) customElements.define(CARD_TYPES[1], RadarWiseDashedCard);
if (!customElements.get(CARD_TYPES[2])) customElements.define(CARD_TYPES[2], RadarWiseLegacyCard);
if (!customElements.get(CARD_TYPES[3])) customElements.define(CARD_TYPES[3], RadarWiseLegacyDashedCard);
if (!customElements.get("radarwise-card-editor")) customElements.define("radarwise-card-editor", RadarWiseCardEditor);
if (!customElements.get("radar-wise-card-editor")) customElements.define("radar-wise-card-editor", RadarWiseDashedCardEditor);
if (!customElements.get("weatherwise-card-editor")) customElements.define("weatherwise-card-editor", RadarWiseLegacyCardEditor);
if (!customElements.get("weather-wise-card-editor")) customElements.define("weather-wise-card-editor", RadarWiseLegacyDashedCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "radarwise-card",
  name: "RadarWise Weather",
  description: "Weather dashboard card with forecasts, theme support, and optional radar.",
  documentationURL: "https://github.com/TheWillMiller/radar-wise",
  preview: true
});
console.info(
  `%c RADARWISE-CARD %c v${CARD_VERSION} `,
  "background:#0d3a5c;color:#7ecbca;font-weight:bold;padding:2px 4px;border-radius:3px 0 0 3px",
  "background:#7ecbca;color:#0d3a5c;font-weight:bold;padding:2px 4px;border-radius:0 3px 3px 0"
);
