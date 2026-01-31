/******************************************************************************
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
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ var $24c52f343453d62d$var$extendStatics = function(d, b) {
    $24c52f343453d62d$var$extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return $24c52f343453d62d$var$extendStatics(d, b);
};
function $24c52f343453d62d$export$a8ba968b8961cb8a(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    $24c52f343453d62d$var$extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var $24c52f343453d62d$export$18ce0697a983be9b = function() {
    $24c52f343453d62d$export$18ce0697a983be9b = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return $24c52f343453d62d$export$18ce0697a983be9b.apply(this, arguments);
};
function $24c52f343453d62d$export$3c9a16f847548506(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
        for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function $24c52f343453d62d$export$29e00dfd3077644b(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function $24c52f343453d62d$export$d5ad3fd78186038f(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function $24c52f343453d62d$export$3a84e1ae4e97e9b0(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function $24c52f343453d62d$export$d831c04e792af3d(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++)value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    return useValue ? value : void 0;
}
function $24c52f343453d62d$export$6a2a36740a146cb8(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
function $24c52f343453d62d$export$d1a06452d3489bc7(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
function $24c52f343453d62d$export$f1db080c865becb9(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function $24c52f343453d62d$export$1050f835b63b671e(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function $24c52f343453d62d$export$67ebef60e6f28a6(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var $24c52f343453d62d$export$45d3717a4c69092e = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function $24c52f343453d62d$export$f33643c0debef087(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) $24c52f343453d62d$export$45d3717a4c69092e(o, m, p);
}
function $24c52f343453d62d$export$19a8beecd37a4c45(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function $24c52f343453d62d$export$8d051b38c9118094(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function $24c52f343453d62d$export$afc72e2116322959() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat($24c52f343453d62d$export$8d051b38c9118094(arguments[i]));
    return ar;
}
function $24c52f343453d62d$export$6388937ca91ccae8() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function $24c52f343453d62d$export$1216008129fb82ed(to, from, pack) {
    if (pack || arguments.length === 2) {
        for(var i = 0, l = from.length, ar; i < l; i++)if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function $24c52f343453d62d$export$10c90e4f7922046c(v) {
    return this instanceof $24c52f343453d62d$export$10c90e4f7922046c ? (this.v = v, this) : new $24c52f343453d62d$export$10c90e4f7922046c(v);
}
function $24c52f343453d62d$export$e427f37a30a4de9b(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function awaitReturn(f) {
        return function(v) {
            return Promise.resolve(v).then(f, reject);
        };
    }
    function verb(n, f) {
        if (g[n]) {
            i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
            if (f) i[n] = f(i[n]);
        }
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof $24c52f343453d62d$export$10c90e4f7922046c ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function $24c52f343453d62d$export$bbd80228419bb833(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: $24c52f343453d62d$export$10c90e4f7922046c(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function $24c52f343453d62d$export$e3b29a3d6162315f(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof $24c52f343453d62d$export$19a8beecd37a4c45 === "function" ? $24c52f343453d62d$export$19a8beecd37a4c45(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function $24c52f343453d62d$export$4fb47efe1390b86f(cooked, raw) {
    if (Object.defineProperty) Object.defineProperty(cooked, "raw", {
        value: raw
    });
    else cooked.raw = raw;
    return cooked;
}
var $24c52f343453d62d$var$__setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
var $24c52f343453d62d$var$ownKeys = function(o) {
    $24c52f343453d62d$var$ownKeys = Object.getOwnPropertyNames || function(o) {
        var ar = [];
        for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
        return ar;
    };
    return $24c52f343453d62d$var$ownKeys(o);
};
function $24c52f343453d62d$export$c21735bcef00d192(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k = $24c52f343453d62d$var$ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") $24c52f343453d62d$export$45d3717a4c69092e(result, mod, k[i]);
    }
    $24c52f343453d62d$var$__setModuleDefault(result, mod);
    return result;
}
function $24c52f343453d62d$export$da59b14a69baef04(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function $24c52f343453d62d$export$d5dcaf168c640c35(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function $24c52f343453d62d$export$d40a35129aaff81f(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function $24c52f343453d62d$export$81fdc39f203e4e04(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function $24c52f343453d62d$export$88ac25d8e944e405(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) env.stack.push({
        async: true
    });
    return value;
}
var $24c52f343453d62d$var$_SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function $24c52f343453d62d$export$8f076105dc360e92(env) {
    function fail(e) {
        env.error = env.hasError ? new $24c52f343453d62d$var$_SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    var r, s = 0;
    function next() {
        while(r = env.stack.pop())try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
                var result = r.dispose.call(r.value);
                if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                });
            } else s |= 1;
        } catch (e) {
            fail(e);
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
    }
    return next();
}
function $24c52f343453d62d$export$889dfb5d17574b0b(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
        return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
    });
    return path;
}
var $24c52f343453d62d$export$2e2bcd8739ae039 = {
    __extends: $24c52f343453d62d$export$a8ba968b8961cb8a,
    __assign: $24c52f343453d62d$export$18ce0697a983be9b,
    __rest: $24c52f343453d62d$export$3c9a16f847548506,
    __decorate: $24c52f343453d62d$export$29e00dfd3077644b,
    __param: $24c52f343453d62d$export$d5ad3fd78186038f,
    __esDecorate: $24c52f343453d62d$export$3a84e1ae4e97e9b0,
    __runInitializers: $24c52f343453d62d$export$d831c04e792af3d,
    __propKey: $24c52f343453d62d$export$6a2a36740a146cb8,
    __setFunctionName: $24c52f343453d62d$export$d1a06452d3489bc7,
    __metadata: $24c52f343453d62d$export$f1db080c865becb9,
    __awaiter: $24c52f343453d62d$export$1050f835b63b671e,
    __generator: $24c52f343453d62d$export$67ebef60e6f28a6,
    __createBinding: $24c52f343453d62d$export$45d3717a4c69092e,
    __exportStar: $24c52f343453d62d$export$f33643c0debef087,
    __values: $24c52f343453d62d$export$19a8beecd37a4c45,
    __read: $24c52f343453d62d$export$8d051b38c9118094,
    __spread: $24c52f343453d62d$export$afc72e2116322959,
    __spreadArrays: $24c52f343453d62d$export$6388937ca91ccae8,
    __spreadArray: $24c52f343453d62d$export$1216008129fb82ed,
    __await: $24c52f343453d62d$export$10c90e4f7922046c,
    __asyncGenerator: $24c52f343453d62d$export$e427f37a30a4de9b,
    __asyncDelegator: $24c52f343453d62d$export$bbd80228419bb833,
    __asyncValues: $24c52f343453d62d$export$e3b29a3d6162315f,
    __makeTemplateObject: $24c52f343453d62d$export$4fb47efe1390b86f,
    __importStar: $24c52f343453d62d$export$c21735bcef00d192,
    __importDefault: $24c52f343453d62d$export$da59b14a69baef04,
    __classPrivateFieldGet: $24c52f343453d62d$export$d5dcaf168c640c35,
    __classPrivateFieldSet: $24c52f343453d62d$export$d40a35129aaff81f,
    __classPrivateFieldIn: $24c52f343453d62d$export$81fdc39f203e4e04,
    __addDisposableResource: $24c52f343453d62d$export$88ac25d8e944e405,
    __disposeResources: $24c52f343453d62d$export$8f076105dc360e92,
    __rewriteRelativeImportExtension: $24c52f343453d62d$export$889dfb5d17574b0b
};


/**
 * Configuration utilities for feature flag management
 */ const $a64cd1666b27644b$export$805ddaeeece0413e = (config, feature)=>!config || config.features?.includes(feature) || false;


/**
 * Checks if a string matches a pattern which can be:
 * - Exact match
 * - Wildcard pattern with * (e.g., "sensor_*")
 * - Regex pattern enclosed in /.../ (e.g., "/sensor\\.(temp|humid)/")
 *
 * @param str - The string to check
 * @param pattern - The pattern to match against
 * @returns True if the string matches the pattern
 */ const $8e9091561798c377$export$78e968efcca6b7ef = (str, pattern)=>{
    if (str === null) return false;
    // Check if it's a regex pattern (enclosed in slashes)
    const regexPattern = /^\/(.+)\/$/;
    const regexMatch = regexPattern.exec(pattern);
    if (regexMatch) try {
        const regex = new RegExp(regexMatch[1]);
        return regex.test(str);
    } catch (e) {
        // If regex is invalid, fall back to treating it as a literal string
        console.warn(`Invalid regex pattern: ${pattern}`, e);
        return str === pattern;
    }
    // Check if it's a wildcard pattern (contains *)
    if (pattern.includes('*')) {
        // Convert wildcard pattern to regex
        const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
        .replace(/\*/g, '.*'); // Convert * to .*
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(str);
    }
    // Default to exact match
    return str === pattern;
};


const $5bd3a7e1f19a6de3$export$30c823bc834d6ab4 = (hass, deviceId)=>hass.devices[deviceId];


const $e6782818bfcf779d$export$fcf7c33d7fd02301 = (hass, entityId)=>hass.entities[entityId];


/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/entity/compute_domain.ts
 */ const $e7dc90bb09bfe22d$export$2044bdc9670769ab = (entityId)=>entityId.substring(0, entityId.indexOf('.'));


/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/const.ts
 */ const $ca52414a81fa2740$export$f4a7f73c0fdd46d5 = [
    'sensor',
    'binary_sensor',
    'calendar',
    'camera',
    'device_tracker',
    'image',
    'weather'
];


const $e24dedcf9e480b2d$export$50fdfeece43146fd = (hass, entityId, fakeState = false)=>{
    if (!entityId) return undefined;
    const state = hass.states[entityId] ?? (fakeState ? {
        entity_id: entityId,
        state: 'off',
        attributes: {}
    } : undefined);
    if (!state) return undefined;
    return {
        state: state.state,
        attributes: state.attributes,
        entity_id: state.entity_id
    };
};


/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/entity/state_active.ts
 */ /**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/entity.ts
 */ /**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/array/literal-includes.ts#L6
 */ /**
 * Creates a type predicate function for determining if an array literal includes a given value
 * @param array - The array to check
 * @returns A type predicate function
 */ const $2dcc326b5e422db7$export$2fff862a498eed4d = (array)=>(searchElement, fromIndex)=>array.includes(searchElement, fromIndex);


const $fa460070836bbf6d$export$f2d101b977a134fd = 'unavailable';
const $fa460070836bbf6d$export$78244dbb77cfa6b6 = 'unknown';
const $fa460070836bbf6d$export$8a4b4288adcd729e = 'on';
const $fa460070836bbf6d$export$173de64b5ad0d5b4 = 'off';
const $fa460070836bbf6d$export$565a86226f245f0b = [
    $fa460070836bbf6d$export$f2d101b977a134fd,
    $fa460070836bbf6d$export$78244dbb77cfa6b6
];
const $fa460070836bbf6d$export$8ccd97e727a09c65 = [
    $fa460070836bbf6d$export$f2d101b977a134fd,
    $fa460070836bbf6d$export$78244dbb77cfa6b6,
    $fa460070836bbf6d$export$173de64b5ad0d5b4
];
const $fa460070836bbf6d$export$dea4173a348a2153 = (0, $2dcc326b5e422db7$export$2fff862a498eed4d)($fa460070836bbf6d$export$565a86226f245f0b);
const $fa460070836bbf6d$export$3473ff6928139ced = (0, $2dcc326b5e422db7$export$2fff862a498eed4d)($fa460070836bbf6d$export$8ccd97e727a09c65);



function $043ab5348dd51237$export$c0e85c3982a3daa6(stateObj, state) {
    const domain = (0, $e7dc90bb09bfe22d$export$2044bdc9670769ab)(stateObj.entity_id);
    const compareState = state ?? stateObj?.state;
    if ([
        'button',
        'event',
        'input_button',
        'scene'
    ].includes(domain)) return compareState !== (0, $fa460070836bbf6d$export$f2d101b977a134fd);
    if ((0, $fa460070836bbf6d$export$dea4173a348a2153)(compareState)) return false;
    // The "off" check is relevant for most domains, but there are exceptions
    // such as "alert" where "off" is still a somewhat active state and
    // therefore gets a custom color and "idle" is instead the state that
    // matches what most other domains consider inactive.
    if (compareState === (0, $fa460070836bbf6d$export$173de64b5ad0d5b4) && domain !== 'alert') return false;
    // Custom cases
    switch(domain){
        case 'alarm_control_panel':
            return compareState !== 'disarmed';
        case 'alert':
            // "on" and "off" are active, as "off" just means alert was acknowledged but is still active
            return compareState !== 'idle';
        case 'cover':
            return compareState !== 'closed';
        case 'device_tracker':
        case 'person':
            return compareState !== 'not_home';
        case 'lawn_mower':
            return [
                'mowing',
                'error'
            ].includes(compareState);
        case 'lock':
            return compareState !== 'locked';
        case 'media_player':
            return compareState !== 'standby';
        case 'vacuum':
            return ![
                'idle',
                'docked',
                'paused'
            ].includes(compareState);
        case 'valve':
            return compareState !== 'closed';
        case 'plant':
            return compareState === 'problem';
        case 'group':
            return [
                'on',
                'home',
                'open',
                'locked',
                'problem'
            ].includes(compareState);
        case 'timer':
            return compareState === 'active';
        case 'camera':
            return compareState === 'streaming';
    }
    return true;
}


const $093edc2594769ee5$export$c6a2d06cc40e579 = (hass, config, deviceId, deviceName)=>{
    const deviceEntities = Object.values(hass.entities).filter((entity)=>entity.device_id === deviceId).map((entity)=>{
        const state = (0, $e24dedcf9e480b2d$export$50fdfeece43146fd)(hass, entity.entity_id);
        if (state === undefined) return;
        // convenience
        const name = state.attributes.friendly_name === deviceName ? deviceName : state.attributes.friendly_name.replace(deviceName, '').trim();
        const active = (0, $043ab5348dd51237$export$c0e85c3982a3daa6)(state);
        return {
            name: name,
            ...state,
            category: entity.entity_category,
            translation_key: entity.translation_key,
            isProblemEntity: state.attributes.device_class === 'problem',
            isActive: active,
            config: {
                tap_action: config.tap_action,
                hold_action: config.hold_action || {
                    action: 'more-info'
                },
                double_tap_action: config.double_tap_action
            }
        };
    }).filter((e)=>e !== undefined);
    return deviceEntities;
};


const $562e4e067cd81a2b$export$30c823bc834d6ab4 = (hass, config)=>{
    const device = {
        sensors: [],
        controls: [],
        diagnostics: [],
        configurations: []
    };
    // Determine device_id from config.device_id or by resolving config.entity_id
    const deviceId = config.device_id ?? (config.entity_id ? (0, $e6782818bfcf779d$export$fcf7c33d7fd02301)(hass, config.entity_id)?.device_id : undefined);
    if (!deviceId) return undefined;
    const hassDevice = (0, $5bd3a7e1f19a6de3$export$30c823bc834d6ab4)(hass, deviceId);
    if (!hassDevice) return undefined;
    device.name = hassDevice.name ?? 'Device';
    device.model = [
        hassDevice.manufacturer,
        hassDevice.model,
        hassDevice.model_id
    ].filter(Boolean).join(' ');
    const entities = (0, $093edc2594769ee5$export$c6a2d06cc40e579)(hass, config, hassDevice.id, hassDevice.name);
    entities.forEach((entity)=>{
        if ($562e4e067cd81a2b$var$shouldSkipEntity(entity, config)) return;
        $562e4e067cd81a2b$var$addEntityToDevice(entity, device, config);
    });
    return device;
};
/**
 * Determines if an entity should be skipped based on configuration
 * @param entity - The entity to check
 * @param config - The configuration object containing exclusion rules
 * @returns True if the entity should be skipped, false otherwise
 */ const $562e4e067cd81a2b$var$shouldSkipEntity = (entity, config)=>{
    if (!config.exclude_entities?.length) return false;
    // Check if any exclusion pattern matches the entity ID
    return config.exclude_entities.some((pattern)=>(0, $8e9091561798c377$export$78e968efcca6b7ef)(entity.entity_id, pattern));
};
/**
 * Adds an entity to the appropriate category in the device object
 * based on entity type and configuration exclusion rules
 * @param entity - The entity to categorize and add
 * @param device - The device object to update
 * @param config - The configuration object containing exclusion rules
 */ const $562e4e067cd81a2b$var$addEntityToDevice = (entity, device, config)=>{
    if (entity.category === 'diagnostic') {
        if (!config.exclude_sections?.includes('diagnostics')) device.diagnostics.push(entity);
    } else if (entity.category === 'config') {
        if (!config.exclude_sections?.includes('configurations')) device.configurations.push(entity);
    } else {
        const domain = (0, $e7dc90bb09bfe22d$export$2044bdc9670769ab)(entity.entity_id);
        const isSensor = (0, $ca52414a81fa2740$export$f4a7f73c0fdd46d5).includes(domain);
        if (isSensor && !config.exclude_sections?.includes('sensors')) device.sensors.push(entity);
        else if (!config.exclude_sections?.includes('controls')) device.controls.push(entity);
    }
};


const $8dc66e7a4cb4d971$export$3b8a32145ce395a1 = (unit)=>unit ? [
        ...unit.controls,
        ...unit.sensors,
        ...unit.diagnostics,
        ...unit.configurations
    ].some((entity)=>entity.isProblemEntity && entity.isActive) : false;


/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $def2de46b9306e8a$var$t = globalThis, $def2de46b9306e8a$export$b4d10f6001c083c2 = $def2de46b9306e8a$var$t.ShadowRoot && (void 0 === $def2de46b9306e8a$var$t.ShadyCSS || $def2de46b9306e8a$var$t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $def2de46b9306e8a$var$s = Symbol(), $def2de46b9306e8a$var$o = new WeakMap;
class $def2de46b9306e8a$export$505d1e8739bad805 {
    constructor(t, e, o){
        if (this._$cssResult$ = !0, o !== $def2de46b9306e8a$var$s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
        this.cssText = t, this.t = e;
    }
    get styleSheet() {
        let t = this.o;
        const s = this.t;
        if ($def2de46b9306e8a$export$b4d10f6001c083c2 && void 0 === t) {
            const e = void 0 !== s && 1 === s.length;
            e && (t = $def2de46b9306e8a$var$o.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), e && $def2de46b9306e8a$var$o.set(s, t));
        }
        return t;
    }
    toString() {
        return this.cssText;
    }
}
const $def2de46b9306e8a$export$8d80f9cac07cdb3 = (t)=>new $def2de46b9306e8a$export$505d1e8739bad805("string" == typeof t ? t : t + "", void 0, $def2de46b9306e8a$var$s), $def2de46b9306e8a$export$dbf350e5966cf602 = (t, ...e)=>{
    const o = 1 === t.length ? t[0] : e.reduce((e, s, o)=>e + ((t)=>{
            if (!0 === t._$cssResult$) return t.cssText;
            if ("number" == typeof t) return t;
            throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s) + t[o + 1], t[0]);
    return new $def2de46b9306e8a$export$505d1e8739bad805(o, t, $def2de46b9306e8a$var$s);
}, $def2de46b9306e8a$export$2ca4a66ec4cecb90 = (s, o)=>{
    if ($def2de46b9306e8a$export$b4d10f6001c083c2) s.adoptedStyleSheets = o.map((t)=>t instanceof CSSStyleSheet ? t : t.styleSheet);
    else for (const e of o){
        const o = document.createElement("style"), n = $def2de46b9306e8a$var$t.litNonce;
        void 0 !== n && o.setAttribute("nonce", n), o.textContent = e.cssText, s.appendChild(o);
    }
}, $def2de46b9306e8a$export$ee69dfd951e24778 = $def2de46b9306e8a$export$b4d10f6001c083c2 ? (t)=>t : (t)=>t instanceof CSSStyleSheet ? ((t)=>{
        let e = "";
        for (const s of t.cssRules)e += s.cssText;
        return $def2de46b9306e8a$export$8d80f9cac07cdb3(e);
    })(t) : t;


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const { is: $19fe8e3abedf4df0$var$i, defineProperty: $19fe8e3abedf4df0$var$e, getOwnPropertyDescriptor: $19fe8e3abedf4df0$var$h, getOwnPropertyNames: $19fe8e3abedf4df0$var$r, getOwnPropertySymbols: $19fe8e3abedf4df0$var$o, getPrototypeOf: $19fe8e3abedf4df0$var$n } = Object, $19fe8e3abedf4df0$var$a = globalThis, $19fe8e3abedf4df0$var$c = $19fe8e3abedf4df0$var$a.trustedTypes, $19fe8e3abedf4df0$var$l = $19fe8e3abedf4df0$var$c ? $19fe8e3abedf4df0$var$c.emptyScript : "", $19fe8e3abedf4df0$var$p = $19fe8e3abedf4df0$var$a.reactiveElementPolyfillSupport, $19fe8e3abedf4df0$var$d = (t, s)=>t, $19fe8e3abedf4df0$export$7312b35fbf521afb = {
    toAttribute (t, s) {
        switch(s){
            case Boolean:
                t = t ? $19fe8e3abedf4df0$var$l : null;
                break;
            case Object:
            case Array:
                t = null == t ? t : JSON.stringify(t);
        }
        return t;
    },
    fromAttribute (t, s) {
        let i = t;
        switch(s){
            case Boolean:
                i = null !== t;
                break;
            case Number:
                i = null === t ? null : Number(t);
                break;
            case Object:
            case Array:
                try {
                    i = JSON.parse(t);
                } catch (t) {
                    i = null;
                }
        }
        return i;
    }
}, $19fe8e3abedf4df0$export$53a6892c50694894 = (t, s)=>!$19fe8e3abedf4df0$var$i(t, s), $19fe8e3abedf4df0$var$b = {
    attribute: !0,
    type: String,
    converter: $19fe8e3abedf4df0$export$7312b35fbf521afb,
    reflect: !1,
    useDefault: !1,
    hasChanged: $19fe8e3abedf4df0$export$53a6892c50694894
};
Symbol.metadata ??= Symbol("metadata"), $19fe8e3abedf4df0$var$a.litPropertyMetadata ??= new WeakMap;
class $19fe8e3abedf4df0$export$c7c07a37856565d extends HTMLElement {
    static addInitializer(t) {
        this._$Ei(), (this.l ??= []).push(t);
    }
    static get observedAttributes() {
        return this.finalize(), this._$Eh && [
            ...this._$Eh.keys()
        ];
    }
    static createProperty(t, s = $19fe8e3abedf4df0$var$b) {
        if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
            const i = Symbol(), h = this.getPropertyDescriptor(t, i, s);
            void 0 !== h && $19fe8e3abedf4df0$var$e(this.prototype, t, h);
        }
    }
    static getPropertyDescriptor(t, s, i) {
        const { get: e, set: r } = $19fe8e3abedf4df0$var$h(this.prototype, t) ?? {
            get () {
                return this[s];
            },
            set (t) {
                this[s] = t;
            }
        };
        return {
            get: e,
            set (s) {
                const h = e?.call(this);
                r?.call(this, s), this.requestUpdate(t, h, i);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) ?? $19fe8e3abedf4df0$var$b;
    }
    static _$Ei() {
        if (this.hasOwnProperty($19fe8e3abedf4df0$var$d("elementProperties"))) return;
        const t = $19fe8e3abedf4df0$var$n(this);
        t.finalize(), void 0 !== t.l && (this.l = [
            ...t.l
        ]), this.elementProperties = new Map(t.elementProperties);
    }
    static finalize() {
        if (this.hasOwnProperty($19fe8e3abedf4df0$var$d("finalized"))) return;
        if (this.finalized = !0, this._$Ei(), this.hasOwnProperty($19fe8e3abedf4df0$var$d("properties"))) {
            const t = this.properties, s = [
                ...$19fe8e3abedf4df0$var$r(t),
                ...$19fe8e3abedf4df0$var$o(t)
            ];
            for (const i of s)this.createProperty(i, t[i]);
        }
        const t = this[Symbol.metadata];
        if (null !== t) {
            const s = litPropertyMetadata.get(t);
            if (void 0 !== s) for (const [t, i] of s)this.elementProperties.set(t, i);
        }
        this._$Eh = new Map;
        for (const [t, s] of this.elementProperties){
            const i = this._$Eu(t, s);
            void 0 !== i && this._$Eh.set(i, t);
        }
        this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s) {
        const i = [];
        if (Array.isArray(s)) {
            const e = new Set(s.flat(1 / 0).reverse());
            for (const s of e)i.unshift((0, $def2de46b9306e8a$export$ee69dfd951e24778)(s));
        } else void 0 !== s && i.push((0, $def2de46b9306e8a$export$ee69dfd951e24778)(s));
        return i;
    }
    static _$Eu(t, s) {
        const i = s.attribute;
        return !1 === i ? void 0 : "string" == typeof i ? i : "string" == typeof t ? t.toLowerCase() : void 0;
    }
    constructor(){
        super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
    }
    _$Ev() {
        this._$ES = new Promise((t)=>this.enableUpdating = t), this._$AL = new Map, this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t)=>t(this));
    }
    addController(t) {
        (this._$EO ??= new Set).add(t), void 0 !== this.renderRoot && this.isConnected && t.hostConnected?.();
    }
    removeController(t) {
        this._$EO?.delete(t);
    }
    _$E_() {
        const t = new Map, s = this.constructor.elementProperties;
        for (const i of s.keys())this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
        t.size > 0 && (this._$Ep = t);
    }
    createRenderRoot() {
        const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
        return (0, $def2de46b9306e8a$export$2ca4a66ec4cecb90)(t, this.constructor.elementStyles), t;
    }
    connectedCallback() {
        this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t)=>t.hostConnected?.());
    }
    enableUpdating(t) {}
    disconnectedCallback() {
        this._$EO?.forEach((t)=>t.hostDisconnected?.());
    }
    attributeChangedCallback(t, s, i) {
        this._$AK(t, i);
    }
    _$ET(t, s) {
        const i = this.constructor.elementProperties.get(t), e = this.constructor._$Eu(t, i);
        if (void 0 !== e && !0 === i.reflect) {
            const h = (void 0 !== i.converter?.toAttribute ? i.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb).toAttribute(s, i.type);
            this._$Em = t, null == h ? this.removeAttribute(e) : this.setAttribute(e, h), this._$Em = null;
        }
    }
    _$AK(t, s) {
        const i = this.constructor, e = i._$Eh.get(t);
        if (void 0 !== e && this._$Em !== e) {
            const t = i.getPropertyOptions(e), h = "function" == typeof t.converter ? {
                fromAttribute: t.converter
            } : void 0 !== t.converter?.fromAttribute ? t.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb;
            this._$Em = e;
            const r = h.fromAttribute(s, t.type);
            this[e] = r ?? this._$Ej?.get(e) ?? r, this._$Em = null;
        }
    }
    requestUpdate(t, s, i) {
        if (void 0 !== t) {
            const e = this.constructor, h = this[t];
            if (i ??= e.getPropertyOptions(t), !((i.hasChanged ?? $19fe8e3abedf4df0$export$53a6892c50694894)(h, s) || i.useDefault && i.reflect && h === this._$Ej?.get(t) && !this.hasAttribute(e._$Eu(t, i)))) return;
            this.C(t, s, i);
        }
        !1 === this.isUpdatePending && (this._$ES = this._$EP());
    }
    C(t, s, { useDefault: i, reflect: e, wrapped: h }, r) {
        i && !(this._$Ej ??= new Map).has(t) && (this._$Ej.set(t, r ?? s ?? this[t]), !0 !== h || void 0 !== r) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), !0 === e && this._$Em !== t && (this._$Eq ??= new Set).add(t));
    }
    async _$EP() {
        this.isUpdatePending = !0;
        try {
            await this._$ES;
        } catch (t) {
            Promise.reject(t);
        }
        const t = this.scheduleUpdate();
        return null != t && await t, !this.isUpdatePending;
    }
    scheduleUpdate() {
        return this.performUpdate();
    }
    performUpdate() {
        if (!this.isUpdatePending) return;
        if (!this.hasUpdated) {
            if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
                for (const [t, s] of this._$Ep)this[t] = s;
                this._$Ep = void 0;
            }
            const t = this.constructor.elementProperties;
            if (t.size > 0) for (const [s, i] of t){
                const { wrapped: t } = i, e = this[s];
                !0 !== t || this._$AL.has(s) || void 0 === e || this.C(s, void 0, i, e);
            }
        }
        let t = !1;
        const s = this._$AL;
        try {
            t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((t)=>t.hostUpdate?.()), this.update(s)) : this._$EM();
        } catch (s) {
            throw t = !1, this._$EM(), s;
        }
        t && this._$AE(s);
    }
    willUpdate(t) {}
    _$AE(t) {
        this._$EO?.forEach((t)=>t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$EM() {
        this._$AL = new Map, this.isUpdatePending = !1;
    }
    get updateComplete() {
        return this.getUpdateComplete();
    }
    getUpdateComplete() {
        return this._$ES;
    }
    shouldUpdate(t) {
        return !0;
    }
    update(t) {
        this._$Eq &&= this._$Eq.forEach((t)=>this._$ET(t, this[t])), this._$EM();
    }
    updated(t) {}
    firstUpdated(t) {}
}
$19fe8e3abedf4df0$export$c7c07a37856565d.elementStyles = [], $19fe8e3abedf4df0$export$c7c07a37856565d.shadowRootOptions = {
    mode: "open"
}, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("elementProperties")] = new Map, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("finalized")] = new Map, $19fe8e3abedf4df0$var$p?.({
    ReactiveElement: $19fe8e3abedf4df0$export$c7c07a37856565d
}), ($19fe8e3abedf4df0$var$a.reactiveElementVersions ??= []).push("2.1.1");


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $f58f44579a4747ac$var$t = globalThis, $f58f44579a4747ac$var$i = $f58f44579a4747ac$var$t.trustedTypes, $f58f44579a4747ac$var$s = $f58f44579a4747ac$var$i ? $f58f44579a4747ac$var$i.createPolicy("lit-html", {
    createHTML: (t)=>t
}) : void 0, $f58f44579a4747ac$var$e = "$lit$", $f58f44579a4747ac$var$h = `lit$${Math.random().toFixed(9).slice(2)}$`, $f58f44579a4747ac$var$o = "?" + $f58f44579a4747ac$var$h, $f58f44579a4747ac$var$n = `<${$f58f44579a4747ac$var$o}>`, $f58f44579a4747ac$var$r = document, $f58f44579a4747ac$var$l = ()=>$f58f44579a4747ac$var$r.createComment(""), $f58f44579a4747ac$var$c = (t)=>null === t || "object" != typeof t && "function" != typeof t, $f58f44579a4747ac$var$a = Array.isArray, $f58f44579a4747ac$var$u = (t)=>$f58f44579a4747ac$var$a(t) || "function" == typeof t?.[Symbol.iterator], $f58f44579a4747ac$var$d = "[ \t\n\f\r]", $f58f44579a4747ac$var$f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, $f58f44579a4747ac$var$v = /-->/g, $f58f44579a4747ac$var$_ = />/g, $f58f44579a4747ac$var$m = RegExp(`>|${$f58f44579a4747ac$var$d}(?:([^\\s"'>=/]+)(${$f58f44579a4747ac$var$d}*=${$f58f44579a4747ac$var$d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), $f58f44579a4747ac$var$p = /'/g, $f58f44579a4747ac$var$g = /"/g, $f58f44579a4747ac$var$$ = /^(?:script|style|textarea|title)$/i, $f58f44579a4747ac$var$y = (t)=>(i, ...s)=>({
            _$litType$: t,
            strings: i,
            values: s
        }), $f58f44579a4747ac$export$c0bb0b647f701bb5 = $f58f44579a4747ac$var$y(1), $f58f44579a4747ac$export$7ed1367e7fa1ad68 = $f58f44579a4747ac$var$y(2), $f58f44579a4747ac$export$47d5b44d225be5b4 = $f58f44579a4747ac$var$y(3), $f58f44579a4747ac$export$9c068ae9cc5db4e8 = Symbol.for("lit-noChange"), $f58f44579a4747ac$export$45b790e32b2810ee = Symbol.for("lit-nothing"), $f58f44579a4747ac$var$A = new WeakMap, $f58f44579a4747ac$var$C = $f58f44579a4747ac$var$r.createTreeWalker($f58f44579a4747ac$var$r, 129);
function $f58f44579a4747ac$var$P(t, i) {
    if (!$f58f44579a4747ac$var$a(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== $f58f44579a4747ac$var$s ? $f58f44579a4747ac$var$s.createHTML(i) : i;
}
const $f58f44579a4747ac$var$V = (t, i)=>{
    const s = t.length - 1, o = [];
    let r, l = 2 === i ? "<svg>" : 3 === i ? "<math>" : "", c = $f58f44579a4747ac$var$f;
    for(let i = 0; i < s; i++){
        const s = t[i];
        let a, u, d = -1, y = 0;
        for(; y < s.length && (c.lastIndex = y, u = c.exec(s), null !== u);)y = c.lastIndex, c === $f58f44579a4747ac$var$f ? "!--" === u[1] ? c = $f58f44579a4747ac$var$v : void 0 !== u[1] ? c = $f58f44579a4747ac$var$_ : void 0 !== u[2] ? ($f58f44579a4747ac$var$$.test(u[2]) && (r = RegExp("</" + u[2], "g")), c = $f58f44579a4747ac$var$m) : void 0 !== u[3] && (c = $f58f44579a4747ac$var$m) : c === $f58f44579a4747ac$var$m ? ">" === u[0] ? (c = r ?? $f58f44579a4747ac$var$f, d = -1) : void 0 === u[1] ? d = -2 : (d = c.lastIndex - u[2].length, a = u[1], c = void 0 === u[3] ? $f58f44579a4747ac$var$m : '"' === u[3] ? $f58f44579a4747ac$var$g : $f58f44579a4747ac$var$p) : c === $f58f44579a4747ac$var$g || c === $f58f44579a4747ac$var$p ? c = $f58f44579a4747ac$var$m : c === $f58f44579a4747ac$var$v || c === $f58f44579a4747ac$var$_ ? c = $f58f44579a4747ac$var$f : (c = $f58f44579a4747ac$var$m, r = void 0);
        const x = c === $f58f44579a4747ac$var$m && t[i + 1].startsWith("/>") ? " " : "";
        l += c === $f58f44579a4747ac$var$f ? s + $f58f44579a4747ac$var$n : d >= 0 ? (o.push(a), s.slice(0, d) + $f58f44579a4747ac$var$e + s.slice(d) + $f58f44579a4747ac$var$h + x) : s + $f58f44579a4747ac$var$h + (-2 === d ? i : x);
    }
    return [
        $f58f44579a4747ac$var$P(t, l + (t[s] || "<?>") + (2 === i ? "</svg>" : 3 === i ? "</math>" : "")),
        o
    ];
};
class $f58f44579a4747ac$var$N {
    constructor({ strings: t, _$litType$: s }, n){
        let r;
        this.parts = [];
        let c = 0, a = 0;
        const u = t.length - 1, d = this.parts, [f, v] = $f58f44579a4747ac$var$V(t, s);
        if (this.el = $f58f44579a4747ac$var$N.createElement(f, n), $f58f44579a4747ac$var$C.currentNode = this.el.content, 2 === s || 3 === s) {
            const t = this.el.content.firstChild;
            t.replaceWith(...t.childNodes);
        }
        for(; null !== (r = $f58f44579a4747ac$var$C.nextNode()) && d.length < u;){
            if (1 === r.nodeType) {
                if (r.hasAttributes()) for (const t of r.getAttributeNames())if (t.endsWith($f58f44579a4747ac$var$e)) {
                    const i = v[a++], s = r.getAttribute(t).split($f58f44579a4747ac$var$h), e = /([.?@])?(.*)/.exec(i);
                    d.push({
                        type: 1,
                        index: c,
                        name: e[2],
                        strings: s,
                        ctor: "." === e[1] ? $f58f44579a4747ac$var$H : "?" === e[1] ? $f58f44579a4747ac$var$I : "@" === e[1] ? $f58f44579a4747ac$var$L : $f58f44579a4747ac$var$k
                    }), r.removeAttribute(t);
                } else t.startsWith($f58f44579a4747ac$var$h) && (d.push({
                    type: 6,
                    index: c
                }), r.removeAttribute(t));
                if ($f58f44579a4747ac$var$$.test(r.tagName)) {
                    const t = r.textContent.split($f58f44579a4747ac$var$h), s = t.length - 1;
                    if (s > 0) {
                        r.textContent = $f58f44579a4747ac$var$i ? $f58f44579a4747ac$var$i.emptyScript : "";
                        for(let i = 0; i < s; i++)r.append(t[i], $f58f44579a4747ac$var$l()), $f58f44579a4747ac$var$C.nextNode(), d.push({
                            type: 2,
                            index: ++c
                        });
                        r.append(t[s], $f58f44579a4747ac$var$l());
                    }
                }
            } else if (8 === r.nodeType) {
                if (r.data === $f58f44579a4747ac$var$o) d.push({
                    type: 2,
                    index: c
                });
                else {
                    let t = -1;
                    for(; -1 !== (t = r.data.indexOf($f58f44579a4747ac$var$h, t + 1));)d.push({
                        type: 7,
                        index: c
                    }), t += $f58f44579a4747ac$var$h.length - 1;
                }
            }
            c++;
        }
    }
    static createElement(t, i) {
        const s = $f58f44579a4747ac$var$r.createElement("template");
        return s.innerHTML = t, s;
    }
}
function $f58f44579a4747ac$var$S(t, i, s = t, e) {
    if (i === $f58f44579a4747ac$export$9c068ae9cc5db4e8) return i;
    let h = void 0 !== e ? s._$Co?.[e] : s._$Cl;
    const o = $f58f44579a4747ac$var$c(i) ? void 0 : i._$litDirective$;
    return h?.constructor !== o && (h?._$AO?.(!1), void 0 === o ? h = void 0 : (h = new o(t), h._$AT(t, s, e)), void 0 !== e ? (s._$Co ??= [])[e] = h : s._$Cl = h), void 0 !== h && (i = $f58f44579a4747ac$var$S(t, h._$AS(t, i.values), h, e)), i;
}
class $f58f44579a4747ac$var$M {
    constructor(t, i){
        this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
    }
    get parentNode() {
        return this._$AM.parentNode;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    u(t) {
        const { el: { content: i }, parts: s } = this._$AD, e = (t?.creationScope ?? $f58f44579a4747ac$var$r).importNode(i, !0);
        $f58f44579a4747ac$var$C.currentNode = e;
        let h = $f58f44579a4747ac$var$C.nextNode(), o = 0, n = 0, l = s[0];
        for(; void 0 !== l;){
            if (o === l.index) {
                let i;
                2 === l.type ? i = new $f58f44579a4747ac$var$R(h, h.nextSibling, this, t) : 1 === l.type ? i = new l.ctor(h, l.name, l.strings, this, t) : 6 === l.type && (i = new $f58f44579a4747ac$var$z(h, this, t)), this._$AV.push(i), l = s[++n];
            }
            o !== l?.index && (h = $f58f44579a4747ac$var$C.nextNode(), o++);
        }
        return $f58f44579a4747ac$var$C.currentNode = $f58f44579a4747ac$var$r, e;
    }
    p(t) {
        let i = 0;
        for (const s of this._$AV)void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
    }
}
class $f58f44579a4747ac$var$R {
    get _$AU() {
        return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t, i, s, e){
        this.type = 2, this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cv = e?.isConnected ?? !0;
    }
    get parentNode() {
        let t = this._$AA.parentNode;
        const i = this._$AM;
        return void 0 !== i && 11 === t?.nodeType && (t = i.parentNode), t;
    }
    get startNode() {
        return this._$AA;
    }
    get endNode() {
        return this._$AB;
    }
    _$AI(t, i = this) {
        t = $f58f44579a4747ac$var$S(this, t, i), $f58f44579a4747ac$var$c(t) ? t === $f58f44579a4747ac$export$45b790e32b2810ee || null == t || "" === t ? (this._$AH !== $f58f44579a4747ac$export$45b790e32b2810ee && this._$AR(), this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee) : t !== this._$AH && t !== $f58f44579a4747ac$export$9c068ae9cc5db4e8 && this._(t) : void 0 !== t._$litType$ ? this.$(t) : void 0 !== t.nodeType ? this.T(t) : $f58f44579a4747ac$var$u(t) ? this.k(t) : this._(t);
    }
    O(t) {
        return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    T(t) {
        this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
    }
    _(t) {
        this._$AH !== $f58f44579a4747ac$export$45b790e32b2810ee && $f58f44579a4747ac$var$c(this._$AH) ? this._$AA.nextSibling.data = t : this.T($f58f44579a4747ac$var$r.createTextNode(t)), this._$AH = t;
    }
    $(t) {
        const { values: i, _$litType$: s } = t, e = "number" == typeof s ? this._$AC(t) : (void 0 === s.el && (s.el = $f58f44579a4747ac$var$N.createElement($f58f44579a4747ac$var$P(s.h, s.h[0]), this.options)), s);
        if (this._$AH?._$AD === e) this._$AH.p(i);
        else {
            const t = new $f58f44579a4747ac$var$M(e, this), s = t.u(this.options);
            t.p(i), this.T(s), this._$AH = t;
        }
    }
    _$AC(t) {
        let i = $f58f44579a4747ac$var$A.get(t.strings);
        return void 0 === i && $f58f44579a4747ac$var$A.set(t.strings, i = new $f58f44579a4747ac$var$N(t)), i;
    }
    k(t) {
        $f58f44579a4747ac$var$a(this._$AH) || (this._$AH = [], this._$AR());
        const i = this._$AH;
        let s, e = 0;
        for (const h of t)e === i.length ? i.push(s = new $f58f44579a4747ac$var$R(this.O($f58f44579a4747ac$var$l()), this.O($f58f44579a4747ac$var$l()), this, this.options)) : s = i[e], s._$AI(h), e++;
        e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
    }
    _$AR(t = this._$AA.nextSibling, i) {
        for(this._$AP?.(!1, !0, i); t !== this._$AB;){
            const i = t.nextSibling;
            t.remove(), t = i;
        }
    }
    setConnected(t) {
        void 0 === this._$AM && (this._$Cv = t, this._$AP?.(t));
    }
}
class $f58f44579a4747ac$var$k {
    get tagName() {
        return this.element.tagName;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    constructor(t, i, s, e, h){
        this.type = 1, this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = h, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String), this.strings = s) : this._$AH = $f58f44579a4747ac$export$45b790e32b2810ee;
    }
    _$AI(t, i = this, s, e) {
        const h = this.strings;
        let o = !1;
        if (void 0 === h) t = $f58f44579a4747ac$var$S(this, t, i, 0), o = !$f58f44579a4747ac$var$c(t) || t !== this._$AH && t !== $f58f44579a4747ac$export$9c068ae9cc5db4e8, o && (this._$AH = t);
        else {
            const e = t;
            let n, r;
            for(t = h[0], n = 0; n < h.length - 1; n++)r = $f58f44579a4747ac$var$S(this, e[s + n], i, n), r === $f58f44579a4747ac$export$9c068ae9cc5db4e8 && (r = this._$AH[n]), o ||= !$f58f44579a4747ac$var$c(r) || r !== this._$AH[n], r === $f58f44579a4747ac$export$45b790e32b2810ee ? t = $f58f44579a4747ac$export$45b790e32b2810ee : t !== $f58f44579a4747ac$export$45b790e32b2810ee && (t += (r ?? "") + h[n + 1]), this._$AH[n] = r;
        }
        o && !e && this.j(t);
    }
    j(t) {
        t === $f58f44579a4747ac$export$45b790e32b2810ee ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
    }
}
class $f58f44579a4747ac$var$H extends $f58f44579a4747ac$var$k {
    constructor(){
        super(...arguments), this.type = 3;
    }
    j(t) {
        this.element[this.name] = t === $f58f44579a4747ac$export$45b790e32b2810ee ? void 0 : t;
    }
}
class $f58f44579a4747ac$var$I extends $f58f44579a4747ac$var$k {
    constructor(){
        super(...arguments), this.type = 4;
    }
    j(t) {
        this.element.toggleAttribute(this.name, !!t && t !== $f58f44579a4747ac$export$45b790e32b2810ee);
    }
}
class $f58f44579a4747ac$var$L extends $f58f44579a4747ac$var$k {
    constructor(t, i, s, e, h){
        super(t, i, s, e, h), this.type = 5;
    }
    _$AI(t, i = this) {
        if ((t = $f58f44579a4747ac$var$S(this, t, i, 0) ?? $f58f44579a4747ac$export$45b790e32b2810ee) === $f58f44579a4747ac$export$9c068ae9cc5db4e8) return;
        const s = this._$AH, e = t === $f58f44579a4747ac$export$45b790e32b2810ee && s !== $f58f44579a4747ac$export$45b790e32b2810ee || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, h = t !== $f58f44579a4747ac$export$45b790e32b2810ee && (s === $f58f44579a4747ac$export$45b790e32b2810ee || e);
        e && this.element.removeEventListener(this.name, this, s), h && this.element.addEventListener(this.name, this, t), this._$AH = t;
    }
    handleEvent(t) {
        "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
    }
}
class $f58f44579a4747ac$var$z {
    constructor(t, i, s){
        this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t) {
        $f58f44579a4747ac$var$S(this, t);
    }
}
const $f58f44579a4747ac$export$8613d1ca9052b22e = {
    M: $f58f44579a4747ac$var$e,
    P: $f58f44579a4747ac$var$h,
    A: $f58f44579a4747ac$var$o,
    C: 1,
    L: $f58f44579a4747ac$var$V,
    R: $f58f44579a4747ac$var$M,
    D: $f58f44579a4747ac$var$u,
    V: $f58f44579a4747ac$var$S,
    I: $f58f44579a4747ac$var$R,
    H: $f58f44579a4747ac$var$k,
    N: $f58f44579a4747ac$var$I,
    U: $f58f44579a4747ac$var$L,
    B: $f58f44579a4747ac$var$H,
    F: $f58f44579a4747ac$var$z
}, $f58f44579a4747ac$var$j = $f58f44579a4747ac$var$t.litHtmlPolyfillSupport;
$f58f44579a4747ac$var$j?.($f58f44579a4747ac$var$N, $f58f44579a4747ac$var$R), ($f58f44579a4747ac$var$t.litHtmlVersions ??= []).push("3.3.1");
const $f58f44579a4747ac$export$b3890eb0ae9dca99 = (t, i, s)=>{
    const e = s?.renderBefore ?? i;
    let h = e._$litPart$;
    if (void 0 === h) {
        const t = s?.renderBefore ?? null;
        e._$litPart$ = h = new $f58f44579a4747ac$var$R(i.insertBefore($f58f44579a4747ac$var$l(), t), t, void 0, s ?? {});
    }
    return h._$AI(t), h;
};




/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $ab210b2da7b39b9d$var$s = globalThis;
class $ab210b2da7b39b9d$export$3f2f9f5909897157 extends (0, $19fe8e3abedf4df0$export$c7c07a37856565d) {
    constructor(){
        super(...arguments), this.renderOptions = {
            host: this
        }, this._$Do = void 0;
    }
    createRenderRoot() {
        const t = super.createRenderRoot();
        return this.renderOptions.renderBefore ??= t.firstChild, t;
    }
    update(t) {
        const r = this.render();
        this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = (0, $f58f44579a4747ac$export$b3890eb0ae9dca99)(r, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
        super.connectedCallback(), this._$Do?.setConnected(!0);
    }
    disconnectedCallback() {
        super.disconnectedCallback(), this._$Do?.setConnected(!1);
    }
    render() {
        return 0, $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
}
$ab210b2da7b39b9d$export$3f2f9f5909897157._$litElement$ = !0, $ab210b2da7b39b9d$export$3f2f9f5909897157["finalized"] = !0, $ab210b2da7b39b9d$var$s.litElementHydrateSupport?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$var$o = $ab210b2da7b39b9d$var$s.litElementPolyfillSupport;
$ab210b2da7b39b9d$var$o?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$export$f5c524615a7708d6 = {
    _$AK: (t, e, r)=>{
        t._$AK(e, r);
    },
    _$AL: (t)=>t._$AL
};
($ab210b2da7b39b9d$var$s.litElementVersions ??= []).push("4.2.1");


/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $a00bca1a101a9088$export$6acf61af03e62db = !1;




const $fc7b5ec53f835fd3$export$9dd6ff9ea0189349 = (0, $def2de46b9306e8a$export$dbf350e5966cf602)`
  :host {
    --icon-color: var(--primary-text-color);
    --section-color: var(--secondary-text-color);
    --row-height: 40px;
  }

  ha-card {
    padding: 16px;
    position: relative;
    z-index: 1;
  }

  .card-header {
    padding: 0px 0px 10px 16px;
    line-height: 35px;
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Remove bottom border when collapsed */
  .card-header.collapsed {
    border-bottom: none;
    margin-bottom: 0;
  }

  .card-header:hover {
    background-color: var(--secondary-background-color);
  }

  .title {
    font-size: 1.5rem;
    font-weight: 500;
    display: flex;
    flex-direction: column;
  }

  /* Entity state in header */
  .entity-state {
    font-size: 1.5rem;
    font-weight: 500;
    margin-right: 16px;
    display: flex;
    align-items: center;
  }

  /* For when header is hidden but entity state is shown */
  .entity-state-only {
    font-size: 1.5rem;
    font-weight: 500;
    text-align: right;
    margin-right: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 8px;
  }

  /* Style for when card is on fire */
  .problem::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--error-color);
    opacity: 0.08;
    z-index: -1;
  }

  /* Section header with expand/collapse functionality */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .section-title {
    font-weight: 500;
    color: var(--section-color);
    padding: 4px 0 4px 0; /* Reduced top padding for all sections */
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }

  .section-chevron {
    cursor: pointer;
    transition: transform 0.3s ease;
    color: var(--secondary-text-color);
    display: flex;
    align-items: center;
  }

  .section-footer {
    text-align: center;
    padding: 4px 0;
  }

  .show-more {
    color: var(--primary-color);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 4px 0;
  }

  .show-more:hover {
    text-decoration: underline;
  }

  .model {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }

  /* Base section spacing */
  .section {
    margin-bottom: 16px;
  }

  /* Apply larger margin only to expanded sections or those with fewer than 5 items */
  .section.expanded:not(:last-child):not(.compact),
  .section.few-items:not(:last-child):not(.compact) {
    margin-bottom: 40px;
  }

  ha-icon {
    color: var(--icon-color);
    width: 22px;
    height: 22px;
  }

  /* Container for a row */
  .row {
    position: relative;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .row:hover {
    background-color: var(--secondary-background-color);
  }

  .row.expanded-row {
    margin-bottom: 8px;
  }

  /* Style for the status colors */
  .row.status-ok {
    border-left: 2px solid var(--success-color);
  }
  .status-ok {
    --primary-text-color: var(--success-color);
  }

  .row.status-warning {
    border-left: 2px solid var(--warning-color);
  }
  .status-warning {
    --primary-text-color: var(--warning-color);
  }

  .row.status-error {
    border-left: 2px solid var(--error-color);
  }
  .status-error {
    --primary-text-color: var(--error-color);
  }

  /* Style for the percentage bar that goes below the hui-generic-entity-row */
  .percent-gauge {
    position: absolute;
    bottom: 1px;
    left: 10px;
    width: 98%;
    height: 4px;
    background-color: var(--divider-color, #333);
    overflow: hidden;
    border-radius: 0 0 4px 4px;
  }

  /* The colored fill part of the gauge */
  .percent-gauge-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition:
      width 0.3s ease,
      background-color 0.3s ease;
  }

  /* Color variations based on percentage */
  .percent-gauge-fill.high {
    background-color: var(--success-color, #4caf50);
  }

  .percent-gauge-fill.medium {
    background-color: var(--warning-color, #ffc107);
  }

  .percent-gauge-fill.low {
    background-color: var(--error-color, #f44336);
  }

  /* Entity attributes section */
  .entity-attributes {
    padding: 4px 16px 8px;
    margin: 0 0 4px 50px;
    font-size: 0.9rem;
    border-left: 1px solid var(--divider-color);
  }

  .entity-attributes-empty {
    padding: 4px 16px 8px;
    margin: 0 0 4px 50px;
    color: var(--secondary-text-color);
    font-style: italic;
    font-size: 0.9rem;
  }

  .attribute-row {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
    border-bottom: 1px dotted var(--divider-color);
  }

  .attribute-row:last-child {
    border-bottom: none;
  }

  .attribute-key {
    font-weight: 500;
    color: var(--secondary-text-color);
    flex: 1;
  }

  .attribute-value {
    color: var(--primary-text-color);
    flex: 2;
    text-align: right;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /* Kitty pics */
  .portrait {
    background: none;
  }

  .portrait img {
    width: 100%;
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .portrait .title {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;


/**
 * @file section.ts
 * @description Section rendering for the device card
 * This file handles the rendering of collapsible sections within the device card,
 * organizing entities by their type (sensors, controls, etc.) and managing
 * expandable/collapsible behavior.
 */ var $9a28a77a5af263d9$exports = {};
$9a28a77a5af263d9$exports = JSON.parse("{\"card\":{\"device_name\":\"Device Name\",\"expand\":\"Expand\",\"collapse\":\"Collapse\",\"loading\":\"Loading...\",\"no_devices_found\":\"No devices found for integration:\",\"device_card_name\":\"Device Card\",\"device_card_description\":\"A card to summarize the status of a Device.\",\"integration_card_name\":\"Integration Card\",\"integration_card_description\":\"A card to display all devices from a specific integration.\"},\"sections\":{\"controls\":\"Controls\",\"configuration\":\"Configuration\",\"sensors\":\"Sensors\",\"diagnostic\":\"Diagnostic\"}}");


var $a8bf67e13c48de4e$exports = {};
$a8bf67e13c48de4e$exports = JSON.parse('{"card":{"device_name":"Nom de l\'appareil","expand":"D\xe9velopper","collapse":"R\xe9duire","loading":"Chargement...","no_devices_found":"Aucun appareil trouv\xe9 pour l\'int\xe9gration :","device_card_name":"Carte d\'Appareil","device_card_description":"Une carte pour r\xe9sumer le statut d\'un Appareil.","integration_card_name":"Carte d\'Int\xe9gration","integration_card_description":"Une carte pour afficher tous les appareils d\'une int\xe9gration sp\xe9cifique."},"sections":{"controls":"Contr\xf4les","configuration":"Configuration","sensors":"Capteurs","diagnostic":"Diagnostic"}}');


var $736e6599d6bbd3bf$exports = {};
$736e6599d6bbd3bf$exports = JSON.parse('{"card":{"device_name":"Nome do Dispositivo","expand":"Expandir","collapse":"Recolher","loading":"Carregando...","no_devices_found":"Nenhum dispositivo encontrado para a integra\xe7\xe3o:","device_card_name":"Cart\xe3o de Dispositivo","device_card_description":"Um cart\xe3o para resumir o status de um Dispositivo.","integration_card_name":"Cart\xe3o de Integra\xe7\xe3o","integration_card_description":"Um cart\xe3o para exibir todos os dispositivos de uma integra\xe7\xe3o espec\xedfica."},"sections":{"controls":"Controles","configuration":"Configura\xe7\xe3o","sensors":"Sensores","diagnostic":"Diagn\xf3stico"}}');


var $9d8ca0c26d9d22c3$exports = {};
$9d8ca0c26d9d22c3$exports = JSON.parse('{"card":{"device_name":"\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430","expand":"\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C","collapse":"\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C","loading":"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...","no_devices_found":"\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432 \u0438\u0437 \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438:","device_card_name":"\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430","device_card_description":"\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0434\u043B\u044F \u043E\u0431\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430.","integration_card_name":"\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438","integration_card_description":"\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0432\u0441\u0435\u0445 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432 \u0438\u0437 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u043D\u043E\u0439 \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438."},"sections":{"controls":"\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435","configuration":"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438","sensors":"\u0421\u0435\u043D\u0441\u043E\u0440\u044B","diagnostic":"\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430"}}');


// Import other languages as needed above this line and in order
// Define supported languages
const $623ffaa3e77fea87$var$languages = {
    en: $9a28a77a5af263d9$exports,
    fr: $a8bf67e13c48de4e$exports,
    pt: $736e6599d6bbd3bf$exports,
    ru: $9d8ca0c26d9d22c3$exports
};
const $623ffaa3e77fea87$export$b3bd0bc58e36cd63 = (hass, key, search = '', replace = '')=>{
    let translated;
    translated = $623ffaa3e77fea87$var$getNestedTranslation($623ffaa3e77fea87$var$languages[hass.language], key) ?? $623ffaa3e77fea87$var$getNestedTranslation($623ffaa3e77fea87$var$languages.en, key) ?? key;
    // Replace placeholders
    if (search !== '' && replace !== '') translated = translated.replace(search, replace);
    return translated;
};
// Helper function to safely navigate nested objects
function $623ffaa3e77fea87$var$getNestedTranslation(obj, path) {
    if (!obj) return undefined;
    const keys = path.split('.');
    let result = obj;
    for (const key of keys){
        if (result === undefined || result === null || typeof result !== 'object') return undefined;
        result = result[key];
    }
    return typeof result === 'string' ? result : undefined;
}



/**
 * @file section.ts
 * @description Section rendering for the device card
 * This file handles the rendering of collapsible sections within the device card,
 * organizing entities by their type (sensors, controls, etc.) and managing
 * expandable/collapsible behavior.
 */ // src/delegates/utils/sort-entities.ts

const $e1ab409cd148a528$export$4742c54ffa379383 = (entities, sortConfig)=>{
    if (!sortConfig || !entities.length) return entities;
    const { type: type, direction: direction = 'asc' } = sortConfig;
    const isReverse = direction === 'desc';
    // Create a copy to avoid mutating the original array
    const result = [
        ...entities
    ];
    // Apply the sorting
    result.sort((a, b)=>{
        let valueA;
        let valueB;
        switch(type){
            case 'domain':
                valueA = (0, $e7dc90bb09bfe22d$export$2044bdc9670769ab)(a.entity_id);
                valueB = (0, $e7dc90bb09bfe22d$export$2044bdc9670769ab)(b.entity_id);
                break;
            case 'entity_id':
                valueA = a.entity_id;
                valueB = b.entity_id;
                break;
            case 'name':
                valueA = a.attributes.friendly_name ?? a.entity_id;
                valueB = b.attributes.friendly_name ?? b.entity_id;
                break;
            case 'state':
                valueA = a.state;
                valueB = b.state;
                break;
            default:
                return 0;
        }
        // Handle null or undefined values
        valueA ??= '';
        valueB ??= '';
        // Standard string comparison
        if (valueA < valueB) return isReverse ? 1 : -1;
        if (valueA > valueB) return isReverse ? -1 : 1;
        return 0;
    });
    return result;
};




/**
 * @file row.ts
 * @description Entity row rendering for the device card
 * This file handles the rendering of individual entity rows within the device card,
 * including their state content, percentage bars, and expandable attribute details.
 */ /**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/dom/fire_event.ts
 */ // Polymer legacy event helpers used courtesy of the Polymer project.
//
// Copyright (c) 2017 The Polymer Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
const $9c83ab07519e6203$export$43835e9acf248a15 = (node, type, detail, options)=>{
    options = options || {};
    // @ts-ignore
    detail = detail ?? {};
    const event = new Event(type, {
        bubbles: options.bubbles ?? true,
        cancelable: Boolean(options.cancelable),
        composed: options.composed ?? true
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};


/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/directives/action-handler-directive.ts
 */ 
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $107bb7d062dde330$export$9ba3b3f20a85bfa = {
    ATTRIBUTE: 1,
    CHILD: 2,
    PROPERTY: 3,
    BOOLEAN_ATTRIBUTE: 4,
    EVENT: 5,
    ELEMENT: 6
}, $107bb7d062dde330$export$99b43ad1ed32e735 = (t)=>(...e)=>({
            _$litDirective$: t,
            values: e
        });
class $107bb7d062dde330$export$befdefbdce210f91 {
    constructor(t){}
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AT(t, e, i) {
        this._$Ct = t, this._$AM = e, this._$Ci = i;
    }
    _$AS(t, e) {
        return this.update(t, e);
    }
    update(t, e) {
        return this.render(...e);
    }
}




const $69fb27e443983086$var$getActionHandler = ()=>{
    const body = document.body;
    if (body.querySelector('action-handler')) return body.querySelector('action-handler');
    const actionhandler = document.createElement('action-handler');
    body.appendChild(actionhandler);
    return actionhandler;
};
const $69fb27e443983086$export$520aee61eb0a2770 = (element, options)=>{
    const actionhandler = $69fb27e443983086$var$getActionHandler();
    if (!actionhandler) return;
    actionhandler.bind(element, options);
};
const $69fb27e443983086$export$8a44987212de21b = (0, $107bb7d062dde330$export$99b43ad1ed32e735)(class extends (0, $107bb7d062dde330$export$befdefbdce210f91) {
    update(part, [options]) {
        $69fb27e443983086$export$520aee61eb0a2770(part.element, options);
        return 0, $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    render(_options) {}
});


/**
 * Toggles the expanded state of an entity row to show/hide attributes
 *
 * @param {HTMLElement} element - The card component instance
 * @param {Expansions} expansions - The expansions object for managing entity states
 * @param {string} entityId - The entity ID to toggle
 * @param {Event} e - The click event that triggered the toggle
 */ const $57febad8376708f1$var$toggleEntityAttributes = (expansions, entityId, e, updateExpansions)=>{
    // Prevent event from bubbling up
    e.stopPropagation();
    updateExpansions({
        ...expansions,
        expandedEntities: {
            ...expansions.expandedEntities,
            [entityId]: !expansions.expandedEntities[entityId]
        }
    });
};
const $57febad8376708f1$export$8a44987212de21b = (entity)=>{
    const isActionEnabled = (actionConfig)=>actionConfig?.action !== 'none' && actionConfig?.action !== undefined;
    return (0, $69fb27e443983086$export$8a44987212de21b)({
        hasDoubleClick: isActionEnabled(entity.config?.double_tap_action),
        hasHold: isActionEnabled(entity.config?.hold_action)
    });
};
const $57febad8376708f1$export$3d3654ce4577c53d = (element, expansions, entity, updateExpansions)=>{
    return {
        /**
     * Handles an action event by creating and dispatching a 'hass-action' custom event.
     * The event contains the entity configuration and the action type (tap, double_tap, hold).
     *
     * @param {ActionHandlerEvent} ev - The action handler event to process
     */ handleEvent: (ev)=>{
            // Extract action from event detail
            const action = ev.detail?.action;
            if (!action) return;
            // If the action is 'tap' and no specific tap action is set, toggle entity attributes
            if (action === 'tap' && !entity.config?.tap_action) {
                $57febad8376708f1$var$toggleEntityAttributes(expansions, entity.entity_id, ev, updateExpansions);
                return;
            }
            // Create configuration object for the action
            const actionConfig = {
                entity: entity.entity_id,
                ...entity.config
            };
            // @ts-ignore
            (0, $9c83ab07519e6203$export$43835e9acf248a15)(element, 'hass-action', {
                config: actionConfig,
                action: action
            });
        }
    };
};




const $5cc8c88379d13dba$export$16bd37df0047a29c = (attributes)=>{
    // Filter out common attributes that are less interesting or already shown
    const filteredAttributes = {
        ...attributes
    };
    // List of attributes to exclude
    const excludeList = [
        'icon',
        'friendly_name',
        'entity_picture',
        'supported_features',
        'assumed_state',
        'attribution',
        'hidden'
    ];
    excludeList.forEach((attr)=>delete filteredAttributes[attr]);
    const attributeEntries = Object.entries(filteredAttributes);
    if (attributeEntries.length === 0) return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<div class="entity-attributes-empty">
      No additional attributes
    </div>`;
    return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <div class="entity-attributes">
      ${attributeEntries.map(([key, value])=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
          <div class="attribute-row">
            <span class="attribute-key">${key}:</span>
            <span class="attribute-value"
              >${typeof value === 'object' ? JSON.stringify(value) : value}</span
            >
          </div>
        `)}
    </div>
  `;
};





/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $19f464fcda7d2482$var$n = "important", $19f464fcda7d2482$var$i = " !" + $19f464fcda7d2482$var$n, $19f464fcda7d2482$export$1e5b4ce2fa884e6a = (0, $107bb7d062dde330$export$99b43ad1ed32e735)(class extends (0, $107bb7d062dde330$export$befdefbdce210f91) {
    constructor(t){
        if (super(t), t.type !== (0, $107bb7d062dde330$export$9ba3b3f20a85bfa).ATTRIBUTE || "style" !== t.name || t.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
    }
    render(t) {
        return Object.keys(t).reduce((e, r)=>{
            const s = t[r];
            return null == s ? e : e + `${r = r.includes("-") ? r : r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
        }, "");
    }
    update(e, [r]) {
        const { style: s } = e.element;
        if (void 0 === this.ft) return this.ft = new Set(Object.keys(r)), this.render(r);
        for (const t of this.ft)null == r[t] && (this.ft.delete(t), t.includes("-") ? s.removeProperty(t) : s[t] = null);
        for(const t in r){
            const e = r[t];
            if (null != e) {
                this.ft.add(t);
                const r = "string" == typeof e && e.endsWith($19f464fcda7d2482$var$i);
                t.includes("-") || r ? s.setProperty(t, r ? e.slice(0, -11) : e, r ? $19f464fcda7d2482$var$n : "") : s[t] = e;
            }
        }
        return 0, $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
});




/**
 * Function to determine the color class based on percentage value
 * @param {number} percentage - The percentage value (0-100)
 * @param {boolean} isInverse - Whether to invert the color logic (green for low, red for high)
 * @return {string} - The color class name
 */ function $a6a6434f1848f426$var$getColorClass(percentage, isInverse = false) {
    let baseClass;
    if (percentage > 60) baseClass = 'high';
    else if (percentage > 30) baseClass = 'medium';
    else baseClass = 'low';
    // If inverse, swap high and low (medium stays the same)
    if (isInverse) {
        if (baseClass === 'high') return 'low';
        else if (baseClass === 'low') return 'high';
    }
    return baseClass;
}
const $a6a6434f1848f426$export$40075bc608c4544e = (entity, inverseEntities = [])=>{
    // Extract the percentage value from the entity state
    const percentage = Number(entity.state);
    // Check if this entity should use inverted colors
    const isInverse = inverseEntities.includes(entity.entity_id);
    // Determine the color class based on percentage value and inverse setting
    const colorClass = $a6a6434f1848f426$var$getColorClass(percentage, isInverse);
    return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
    <div class="percent-gauge">
      <div
        class="percent-gauge-fill ${colorClass}"
        style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)({
        width: `${percentage}%`
    })}
      ></div>
    </div>
  `;
};



const $91384c06f34fa41f$export$535a09426ee2ea59 = async (hass, entity, className)=>{
    // Load the card helpers
    const helpers = await window.loadCardHelpers();
    // Create the row configuration, we will handle actions ourselves
    const config = {
        entity: entity.entity_id,
        // our name removes the device name from the friendly name
        name: entity.name,
        tap_action: {
            action: 'none'
        },
        hold_action: {
            action: 'none'
        },
        double_tap_action: {
            action: 'none'
        }
    };
    // Create the row element
    const element = helpers.createRowElement(config);
    // Set the hass property
    element.hass = hass;
    // Apply the class name if provided
    if (className) element.className = className;
    return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`${element}`;
};


const $68e7242076c3e34e$export$120ff0929b202a6d = async (hass, entity, element, expansions, updateExpansions, config)=>{
    let statusClassName;
    // Determine status class based on problem state
    if (entity.isProblemEntity) // Add color to problem class based on state
    statusClassName = entity.isActive ? 'status-error' : 'status-ok';
    // Determine if we should show a percentage bar
    // Show bar for any entity with % unit (including variations like "% available") and numeric state value
    const showBar = entity.attributes.unit_of_measurement?.includes('%') && !Number.isNaN(Number(entity.state));
    // Check if this entity's details are expanded
    const isEntityExpanded = expansions.expandedEntities[entity.entity_id] || false;
    const stateContentResult = await (0, $91384c06f34fa41f$export$535a09426ee2ea59)(hass, entity, statusClassName);
    // Get inverse_percent entities from config, default to empty array
    const inverseEntities = config?.inverse_percent || [];
    return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)` <div
    class="${[
        'row',
        statusClassName,
        isEntityExpanded ? 'expanded-row' : ''
    ].join(' ')}"
    @action=${(0, $57febad8376708f1$export$3d3654ce4577c53d)(element, expansions, entity, updateExpansions)}
    .actionHandler=${(0, $57febad8376708f1$export$8a44987212de21b)(entity)}
  >
    <div class="row-content">
      ${stateContentResult}
      ${showBar ? (0, $a6a6434f1848f426$export$40075bc608c4544e)(entity, inverseEntities) : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}
    </div>
    ${isEntityExpanded ? (0, $5cc8c88379d13dba$export$16bd37df0047a29c)(entity.attributes) : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}
  </div>`;
};


/**
 * @file show-more.ts
 * @description UI components for expandable section toggling in the device card
 * This file contains components for the chevron icon and "show more" buttons that
 * allow sections to be expanded and collapsed.
 */ 
/**
 * Toggles the expanded state of a section in the device card
 *
 * @param {Expansions} expansions - The expansion state of the card
 * @param {string} sectionTitle - The title of the section to toggle
 * @param {Event} e - The click event that triggered the toggle
 */ const $2ae7b32fc5b69f7f$var$toggleSection = (expansions, sectionTitle, e, updateExpansions)=>{
    const expandedSections = expansions.expandedSections;
    updateExpansions({
        ...expansions,
        expandedSections: {
            ...expandedSections,
            [sectionTitle]: !expandedSections[sectionTitle]
        }
    });
};
const $2ae7b32fc5b69f7f$export$980c1089c0604ea3 = (expansions, title, isExpanded, updateExpansions)=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<div
    class="section-chevron ${isExpanded ? 'expanded' : ''}"
    @click=${(e)=>$2ae7b32fc5b69f7f$var$toggleSection(expansions, title, e, updateExpansions)}
  >
    <ha-icon icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"></ha-icon>
  </div>`;
const $2ae7b32fc5b69f7f$export$ae9a281c4379b144 = (expansion, title, entities, isExpanded, size, updateExpansions)=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<div class="section-footer">
    ${isExpanded ? (0, $f58f44579a4747ac$export$45b790e32b2810ee) : (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
          <div
            class="show-more"
            @click=${(e)=>$2ae7b32fc5b69f7f$var$toggleSection(expansion, title, e, updateExpansions)}
          >
            Show ${entities.length - size} more...
          </div>
        `}
  </div>`;


const $9b8ea5fddc8bd48e$export$4c0287abd2ec956e = async (element, expansions, hass, config, title, entities, updateExpansions)=>{
    // Don't render anything if there are no entities to display
    if (!entities || entities.length === 0) return 0, $f58f44579a4747ac$export$45b790e32b2810ee;
    // Determine how many entities to preview based on config
    const size = config.preview_count ?? 3;
    // Check if this section needs collapsible functionality
    const needsExpansion = entities.length > size;
    // Get the current expanded state from the element
    const isExpanded = expansions.expandedSections[title] || false;
    // Sort and filter entities based on expanded state
    const sortedEntities = (0, $e1ab409cd148a528$export$4742c54ffa379383)(entities, config.sort);
    const displayEntities = needsExpansion && !isExpanded ? sortedEntities.slice(0, size) : sortedEntities;
    // Determine section class based on expanded state, number of items, and compact feature
    const isCompact = (0, $a64cd1666b27644b$export$805ddaeeece0413e)(config, 'compact');
    const sectionClass = `section ${isExpanded ? 'expanded' : ''} ${needsExpansion ? '' : 'few-items'} ${isCompact ? 'compact' : ''}`;
    // Render all rows asynchronously
    const rowPromises = displayEntities.map((entity)=>(0, $68e7242076c3e34e$export$120ff0929b202a6d)(hass, entity, element, expansions, updateExpansions, config));
    const rowResults = await Promise.all(rowPromises);
    return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<div class="${sectionClass}">
    <div class="section-header">
      <div class="section-title">${title}</div>
      ${needsExpansion ? (0, $2ae7b32fc5b69f7f$export$980c1089c0604ea3)(expansions, title, isExpanded, updateExpansions) : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}
    </div>
    ${rowResults}
    ${needsExpansion && !isCompact ? (0, $2ae7b32fc5b69f7f$export$ae9a281c4379b144)(expansions, title, entities, isExpanded, size, updateExpansions) : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}
  </div>`;
};


const $10f7eb590266dd05$export$7dcefa9ef83b8269 = async (element, expansions, hass, config, device, updateExpansions)=>{
    const sectionConfig = [
        {
            name: (0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(hass, 'sections.controls'),
            key: 'controls',
            entities: device.controls
        },
        {
            name: (0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(hass, 'sections.configuration'),
            key: 'configurations',
            entities: device.configurations
        },
        {
            name: (0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(hass, 'sections.sensors'),
            key: 'sensors',
            entities: device.sensors
        },
        {
            name: (0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(hass, 'sections.diagnostic'),
            key: 'diagnostics',
            entities: device.diagnostics
        }
    ];
    let orderedSections = [];
    // if custom order is provided, reorder the sections
    if (config.section_order && config.section_order.length > 0) {
        orderedSections = config.section_order.map((section)=>sectionConfig.find((s)=>s.key === section)).filter((section)=>section !== undefined);
        sectionConfig.forEach((section)=>{
            if (!orderedSections.some((s)=>s?.key === section.key)) orderedSections.push(section);
        });
    } else // default order
    orderedSections = sectionConfig;
    const sectionPromises = orderedSections.map((section)=>(0, $9b8ea5fddc8bd48e$export$4c0287abd2ec956e)(element, expansions, hass, config, section.name, section.entities, updateExpansions));
    const sectionResults = await Promise.all(sectionPromises);
    return sectionResults.filter((result)=>result !== (0, $f58f44579a4747ac$export$45b790e32b2810ee));
};



const $856d8633325a4fe5$export$1188214e9d38144e = (device)=>{
    const entity = device.sensors.find((sensor)=>sensor.attributes.entity_picture !== undefined);
    if (!entity) return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<ha-alert alert-type="error"
      >No entity picture found!</ha-alert
    >`;
    return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<ha-card class="portrait">
    <img src=${entity.attributes.entity_picture} />
    <div class="title">
      <span>${device.name}</span>
    </div>
  </ha-card>`;
};






const $1ed74ce23f0ef067$export$c18c768bbe3223b7 = (hass, entity)=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<state-display .hass=${hass} .stateObj=${entity}></state-display>`;


const $da09c6fad515207c$export$69836945d4c6961f = (hass, config)=>{
    // Check if the hide_entity_state feature is enabled
    if ((0, $a64cd1666b27644b$export$805ddaeeece0413e)(config, 'hide_entity_state')) return 0, $f58f44579a4747ac$export$45b790e32b2810ee;
    if (!config.entity_id) return 0, $f58f44579a4747ac$export$45b790e32b2810ee;
    const state = (0, $e24dedcf9e480b2d$export$50fdfeece43146fd)(hass, config.entity_id);
    if (!state) return 0, $f58f44579a4747ac$export$45b790e32b2810ee;
    return (0, $1ed74ce23f0ef067$export$c18c768bbe3223b7)(hass, state);
};



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $1dfff43fc77cdecb$export$61db76a97f26b7e1 = {
    INITIAL: 0,
    PENDING: 1,
    COMPLETE: 2,
    ERROR: 3
}, $1dfff43fc77cdecb$export$d4c72bab9d6cc13a = Symbol();
class $1dfff43fc77cdecb$export$2dea7024bcdd7731 {
    get taskComplete() {
        return this.t || (1 === this.i ? this.t = new Promise((t, s)=>{
            this.o = t, this.h = s;
        }) : 3 === this.i ? this.t = Promise.reject(this.l) : this.t = Promise.resolve(this.u)), this.t;
    }
    constructor(t, s, i){
        this.p = 0, this.i = 0, (this._ = t).addController(this);
        const h = "object" == typeof s ? s : {
            task: s,
            args: i
        };
        this.v = h.task, this.j = h.args, this.m = h.argsEqual ?? $1dfff43fc77cdecb$export$41b40a0c6412e2a2, this.k = h.onComplete, this.A = h.onError, this.autoRun = h.autoRun ?? !0, "initialValue" in h && (this.u = h.initialValue, this.i = 2, this.O = this.T?.());
    }
    hostUpdate() {
        !0 === this.autoRun && this.S();
    }
    hostUpdated() {
        "afterUpdate" === this.autoRun && this.S();
    }
    T() {
        if (void 0 === this.j) return;
        const t = this.j();
        if (!Array.isArray(t)) throw Error("The args function must return an array");
        return t;
    }
    async S() {
        const t = this.T(), s = this.O;
        this.O = t, t === s || void 0 === t || void 0 !== s && this.m(s, t) || await this.run(t);
    }
    async run(t) {
        let s, h;
        t ??= this.T(), this.O = t, 1 === this.i ? this.q?.abort() : (this.t = void 0, this.o = void 0, this.h = void 0), this.i = 1, "afterUpdate" === this.autoRun ? queueMicrotask(()=>this._.requestUpdate()) : this._.requestUpdate();
        const r = ++this.p;
        this.q = new AbortController;
        let e = !1;
        try {
            s = await this.v(t, {
                signal: this.q.signal
            });
        } catch (t) {
            e = !0, h = t;
        }
        if (this.p === r) {
            if (s === $1dfff43fc77cdecb$export$d4c72bab9d6cc13a) this.i = 0;
            else {
                if (!1 === e) {
                    try {
                        this.k?.(s);
                    } catch  {}
                    this.i = 2, this.o?.(s);
                } else {
                    try {
                        this.A?.(h);
                    } catch  {}
                    this.i = 3, this.h?.(h);
                }
                this.u = s, this.l = h;
            }
            this._.requestUpdate();
        }
    }
    abort(t) {
        1 === this.i && this.q?.abort(t);
    }
    get value() {
        return this.u;
    }
    get error() {
        return this.l;
    }
    get status() {
        return this.i;
    }
    render(t) {
        switch(this.i){
            case 0:
                return t.initial?.();
            case 1:
                return t.pending?.();
            case 2:
                return t.complete?.(this.value);
            case 3:
                return t.error?.(this.error);
            default:
                throw Error("Unexpected status: " + this.i);
        }
    }
}
const $1dfff43fc77cdecb$export$41b40a0c6412e2a2 = (s, i)=>s === i || s.length === i.length && s.every((s, h)=>!(0, $19fe8e3abedf4df0$export$53a6892c50694894)(s, i[h]));






/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $14742f68afc766d6$export$da64fc29f17f9d0e = (t)=>(e, o)=>{
        void 0 !== o ? o.addInitializer(()=>{
            customElements.define(t, e);
        }) : customElements.define(t, e);
    };



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $9cd908ed2625c047$var$o = {
    attribute: !0,
    type: String,
    converter: (0, $19fe8e3abedf4df0$export$7312b35fbf521afb),
    reflect: !1,
    hasChanged: (0, $19fe8e3abedf4df0$export$53a6892c50694894)
}, $9cd908ed2625c047$export$8d623b1670eb40f4 = (t = $9cd908ed2625c047$var$o, e, r)=>{
    const { kind: n, metadata: i } = r;
    let s = globalThis.litPropertyMetadata.get(i);
    if (void 0 === s && globalThis.litPropertyMetadata.set(i, s = new Map), "setter" === n && ((t = Object.create(t)).wrapped = !0), s.set(r.name, t), "accessor" === n) {
        const { name: o } = r;
        return {
            set (r) {
                const n = e.get.call(this);
                e.set.call(this, r), this.requestUpdate(o, n, t);
            },
            init (e) {
                return void 0 !== e && this.C(o, void 0, t, e), e;
            }
        };
    }
    if ("setter" === n) {
        const { name: o } = r;
        return function(r) {
            const n = this[o];
            e.call(this, r), this.requestUpdate(o, n, t);
        };
    }
    throw Error("Unsupported decorator location: " + n);
};
function $9cd908ed2625c047$export$d541bacb2bda4494(t) {
    return (e, o)=>"object" == typeof o ? $9cd908ed2625c047$export$8d623b1670eb40f4(t, e, o) : ((t, e, o)=>{
            const r = e.hasOwnProperty(o);
            return e.constructor.createProperty(o, t), r ? Object.getOwnPropertyDescriptor(e, o) : void 0;
        })(t, e, o);
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $04c21ea1ce1f6057$export$ca000e230c0caa3e(r) {
    return (0, $9cd908ed2625c047$export$d541bacb2bda4494)({
        ...r,
        state: !0,
        attribute: !1
    });
}


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $b4269277b3c48b0c$export$b2b799818fbabcf3(t) {
    return (n, o)=>{
        const c = "function" == typeof n ? n : n[o];
        Object.assign(c, t);
    };
}


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $25e9c5a8f7ecfc69$export$51987bb50e1f6752 = (e, t, c)=>(c.configurable = !0, c.enumerable = !0, Reflect.decorate && "object" != typeof t && Object.defineProperty(e, t, c), c);


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $02a1f3a787c54a30$export$2fa187e846a241c4(e, r) {
    return (n, s, i)=>{
        const o = (t)=>t.renderRoot?.querySelector(e) ?? null;
        if (r) {
            const { get: e, set: r } = "object" == typeof s ? n : i ?? (()=>{
                const t = Symbol();
                return {
                    get () {
                        return this[t];
                    },
                    set (e) {
                        this[t] = e;
                    }
                };
            })();
            return (0, $25e9c5a8f7ecfc69$export$51987bb50e1f6752)(n, s, {
                get () {
                    let t = e.call(this);
                    return void 0 === t && (t = o(this), (null !== t || this.hasUpdated) && r.call(this, t)), t;
                }
            });
        }
        return (0, $25e9c5a8f7ecfc69$export$51987bb50e1f6752)(n, s, {
            get () {
                return o(this);
            }
        });
    };
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ let $ed34c589b230c255$var$e;
function $ed34c589b230c255$export$dcd0d083aa86c355(r) {
    return (n, o)=>(0, $25e9c5a8f7ecfc69$export$51987bb50e1f6752)(n, o, {
            get () {
                return (this.renderRoot ?? ($ed34c589b230c255$var$e ??= document.createDocumentFragment())).querySelectorAll(r);
            }
        });
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $ea50f1870b80cbec$export$163dfc35cc43f240(r) {
    return (n, e)=>(0, $25e9c5a8f7ecfc69$export$51987bb50e1f6752)(n, e, {
            async get () {
                return await this.updateComplete, this.renderRoot?.querySelector(r) ?? null;
            }
        });
}



/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $563fcf7ce7e6c5aa$export$4682af2d9ee91415(o) {
    return (e, n)=>{
        const { slot: r, selector: s } = o ?? {}, c = "slot" + (r ? `[name=${r}]` : ":not([name])");
        return (0, $25e9c5a8f7ecfc69$export$51987bb50e1f6752)(e, n, {
            get () {
                const t = this.renderRoot?.querySelector(c), e = t?.assignedElements(o) ?? [];
                return void 0 === s ? e : e.filter((t)=>t.matches(s));
            }
        });
    };
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $728f1385dd7bf557$export$1bdbe53f9df1b8(n) {
    return (o, r)=>{
        const { slot: e } = n ?? {}, s = "slot" + (e ? `[name=${e}]` : ":not([name])");
        return (0, $25e9c5a8f7ecfc69$export$51987bb50e1f6752)(o, r, {
            get () {
                const t = this.renderRoot?.querySelector(s);
                return t?.assignedNodes(n) ?? [];
            }
        });
    };
}




var $30856da572fd852b$exports = {};
'use strict';
// do not edit .js files directly - edit src/index.jst
$30856da572fd852b$exports = function equal(a, b) {
    if (a === b) return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for(i = length; i-- !== 0;)if (!equal(a[i], b[i])) return false;
            return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for(i = length; i-- !== 0;)if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for(i = length; i-- !== 0;){
            var key = keys[i];
            if (!equal(a[key], b[key])) return false;
        }
        return true;
    }
    // true if both NaN, false otherwise
    return a !== a && b !== b;
};


class $76efc5be730c974a$export$cee8aa229c046b5e extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    /**
   * Returns the component's styles
   */ static get styles() {
        return 0, $fc7b5ec53f835fd3$export$9dd6ff9ea0189349;
    }
    /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */ setConfig(config) {
        if (!$30856da572fd852b$exports(config, this._config)) {
            this._config = config;
            this.collapse = (0, $a64cd1666b27644b$export$805ddaeeece0413e)(config, 'collapse');
        }
    }
    // required for integration card
    set config(config) {
        this.setConfig(config);
    }
    /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */ set hass(hass) {
        this._hass = hass;
        const device = (0, $562e4e067cd81a2b$export$30c823bc834d6ab4)(hass, this._config);
        if (device && !$30856da572fd852b$exports(device, this._device)) this._device = device;
    }
    // card configuration
    static getConfigElement() {
        return document.createElement('device-card-editor');
    }
    static async getStubConfig(hass) {
        const device = Object.values(hass.devices)[0];
        return {
            device_id: device?.id ?? ''
        };
    }
    /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */ render() {
        if (!this._device) return 0, $f58f44579a4747ac$export$45b790e32b2810ee;
        if ((0, $a64cd1666b27644b$export$805ddaeeece0413e)(this._config, 'entity_picture')) return (0, $856d8633325a4fe5$export$1188214e9d38144e)(this._device);
        const problem = (0, $8dc66e7a4cb4d971$export$3b8a32145ce395a1)(this._device);
        const hideTitle = (0, $a64cd1666b27644b$export$805ddaeeece0413e)(this._config, 'hide_title');
        const hideDeviceModel = (0, $a64cd1666b27644b$export$805ddaeeece0413e)(this._config, 'hide_device_model');
        const hideHeader = hideTitle && hideDeviceModel;
        const entity = (0, $da09c6fad515207c$export$69836945d4c6961f)(this._hass, this._config);
        // Prepare header content
        let headerContent = (0, $f58f44579a4747ac$export$45b790e32b2810ee);
        if (!hideHeader) {
            const titleContent = hideTitle ? (0, $f58f44579a4747ac$export$45b790e32b2810ee) : (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<span>${this._config.title ?? this._device.name}</span>`;
            const modelContent = hideDeviceModel ? (0, $f58f44579a4747ac$export$45b790e32b2810ee) : (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<span class="model">${this._device.model}</span>`;
            headerContent = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
        <div
          class="card-header ${this.collapse ? 'collapsed' : ''}"
          @click="${()=>this.collapse = !this.collapse}"
          title="${this.collapse ? (0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(this._hass, 'card.expand') : (0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(this._hass, 'card.collapse')}"
        >
          <div class="title">${titleContent} ${modelContent}</div>
          ${entity}
        </div>
      `;
        } else if (entity) // If header is hidden but we have an entity state to show
        headerContent = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<div class="entity-state-only">${entity}</div>`;
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
      <ha-card class="${problem ? 'problem' : ''}">
        ${headerContent}
        ${this.collapse ? (0, $f58f44579a4747ac$export$45b790e32b2810ee) : this._renderSectionsTask.render({
            initial: ()=>(0, $f58f44579a4747ac$export$45b790e32b2810ee),
            pending: ()=>(0, $f58f44579a4747ac$export$45b790e32b2810ee),
            complete: (sections)=>sections,
            error: (error)=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<div>Error rendering sections: ${error}</div>`
        })}
      </ha-card>
    `;
    }
    constructor(...args){
        super(...args), /**
   * Track the card's expanded state
   */ this._expansions = {
            expandedSections: {},
            expandedEntities: {}
        }, /**
   * Internal collapsed state, separate from the config
   */ this.collapse = false, /**
   * Task that renders sections asynchronously
   */ this._renderSectionsTask = new (0, $1dfff43fc77cdecb$export$2dea7024bcdd7731)(this, {
            task: async ([device, config, hass, expansions])=>{
                if (!device || !config || !hass) return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)``;
                const sections = await (0, $10f7eb590266dd05$export$7dcefa9ef83b8269)(this, expansions, hass, config, device, (e)=>this._expansions = e);
                return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`${sections}`;
            },
            args: ()=>[
                    this._device,
                    this._config,
                    this._hass,
                    this._expansions
                ]
        });
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $76efc5be730c974a$export$cee8aa229c046b5e.prototype, "_config", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $76efc5be730c974a$export$cee8aa229c046b5e.prototype, "_device", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $76efc5be730c974a$export$cee8aa229c046b5e.prototype, "_expansions", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $76efc5be730c974a$export$cee8aa229c046b5e.prototype, "collapse", void 0);




/**
 * Common interactions schema used in both device and integration cards
 * Defines the configuration options for tap, hold, and double tap actions
 * that control card behavior when users interact with it
 */ const $84451a3e48ae541f$var$INTERACTIONS_SCHEMA = {
    name: 'interactions',
    label: 'Interactions',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:gesture-tap',
    schema: [
        {
            name: 'tap_action',
            label: 'Tap Action',
            selector: {
                ui_action: {}
            }
        },
        {
            name: 'hold_action',
            label: 'Hold Action',
            selector: {
                ui_action: {}
            }
        },
        {
            name: 'double_tap_action',
            label: 'Double Tap Action',
            selector: {
                ui_action: {}
            }
        }
    ]
};
/**
 * Generates the schema for the device card's content configuration
 * This includes options for title, preview count, section exclusion,
 *
 */ const $84451a3e48ae541f$var$CONTENT_SCHEMA = {
    name: 'content',
    label: 'Content',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:text-short',
    schema: [
        {
            name: 'title',
            required: false,
            label: 'Card Title',
            selector: {
                text: {}
            }
        },
        {
            name: 'preview_count',
            required: false,
            label: 'Preview Count',
            selector: {
                text: {
                    type: 'number'
                }
            }
        },
        {
            name: 'exclude_sections',
            label: 'Sections to exclude',
            required: false,
            selector: {
                select: {
                    multiple: true,
                    mode: 'list',
                    options: [
                        {
                            label: 'Controls',
                            value: 'controls'
                        },
                        {
                            label: 'Configuration',
                            value: 'configurations'
                        },
                        {
                            label: 'Sensors',
                            value: 'sensors'
                        },
                        {
                            label: 'Diagnostic',
                            value: 'diagnostics'
                        }
                    ]
                }
            }
        },
        {
            name: 'section_order',
            label: 'Section display order (click in order)',
            required: false,
            selector: {
                select: {
                    multiple: true,
                    mode: 'list',
                    options: [
                        {
                            label: 'Controls',
                            value: 'controls'
                        },
                        {
                            label: 'Configuration',
                            value: 'configurations'
                        },
                        {
                            label: 'Sensors',
                            value: 'sensors'
                        },
                        {
                            label: 'Diagnostic',
                            value: 'diagnostics'
                        }
                    ]
                }
            }
        }
    ]
};
/**
 * Generates the schema for the sort options in the device card
 * This includes options for sorting by domain, entity ID, name, or state
 *
 */ const $84451a3e48ae541f$var$SORT_SCHEMA = {
    name: 'sort',
    label: 'Sort Options',
    type: 'expandable',
    flatten: false,
    icon: 'mdi:sort',
    schema: [
        {
            type: 'grid',
            name: '',
            label: '',
            schema: [
                {
                    name: 'type',
                    label: 'Sort Type',
                    required: true,
                    selector: {
                        select: {
                            options: [
                                {
                                    value: 'domain',
                                    label: 'Domain'
                                },
                                {
                                    value: 'entity_id',
                                    label: 'Entity ID'
                                },
                                {
                                    value: 'name',
                                    label: 'Name'
                                },
                                {
                                    value: 'state',
                                    label: 'State'
                                }
                            ],
                            mode: 'dropdown'
                        }
                    }
                },
                {
                    name: 'direction',
                    label: 'Sort Direction',
                    selector: {
                        select: {
                            options: [
                                {
                                    value: 'asc',
                                    label: 'Ascending'
                                },
                                {
                                    value: 'desc',
                                    label: 'Descending'
                                }
                            ],
                            mode: 'dropdown'
                        }
                    }
                }
            ]
        }
    ]
};
/**
 * Generates the schema for the integration card's layout configuration
 * This includes options for the number of columns, device inclusion/exclusion,
 *
 * @param {string} integration - The current integration domain (if already selected)
 * @returns {HaFormSchema} The complete schema for device card content configuration
 */ const $84451a3e48ae541f$var$layoutSchema = (integration)=>{
    return {
        name: 'layout',
        label: 'Integration Layout',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:view-grid-plus',
        schema: [
            {
                type: 'grid',
                name: '',
                label: '',
                schema: [
                    {
                        name: 'columns',
                        required: false,
                        label: 'Number of Columns',
                        selector: {
                            number: {
                                min: 1,
                                max: 6,
                                mode: 'box'
                            }
                        }
                    },
                    {
                        name: 'hide_integration_title',
                        label: 'Hide Title',
                        selector: {
                            boolean: {}
                        }
                    }
                ]
            },
            {
                name: 'include_devices',
                label: 'Devices to include',
                required: false,
                selector: {
                    device: {
                        multiple: true,
                        filter: {
                            integration: integration
                        }
                    }
                }
            },
            {
                name: 'exclude_devices',
                label: 'Devices to exclude',
                required: false,
                selector: {
                    device: {
                        multiple: true,
                        filter: {
                            integration: integration
                        }
                    }
                }
            }
        ]
    };
};
const $84451a3e48ae541f$var$featuresSchema = (integration, entities)=>{
    return {
        name: 'features',
        label: 'Features',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:list-box',
        schema: [
            {
                name: 'features',
                label: 'Enable Features',
                required: false,
                selector: {
                    select: {
                        multiple: true,
                        mode: 'list',
                        options: [
                            {
                                label: 'Use Entity Picture',
                                value: 'entity_picture'
                            },
                            {
                                label: 'Hide Device Model',
                                value: 'hide_device_model'
                            },
                            {
                                label: 'Hide Title',
                                value: 'hide_title'
                            },
                            {
                                label: 'Hide Entity State',
                                value: 'hide_entity_state'
                            },
                            {
                                label: 'Compact Layout',
                                value: 'compact'
                            },
                            {
                                label: 'Start Collapsed',
                                value: 'collapse'
                            }
                        ]
                    }
                }
            },
            {
                name: 'exclude_entities',
                label: 'Entities to exclude',
                required: false,
                selector: {
                    entity: {
                        multiple: true,
                        include_entities: entities,
                        filter: {
                            integration: integration
                        }
                    }
                }
            },
            {
                name: 'inverse_percent',
                label: 'Entities with inverted percent colors (green for low, red for high)',
                required: false,
                selector: {
                    entity: {
                        multiple: true,
                        include_entities: entities,
                        filter: {
                            integration: integration
                        }
                    }
                }
            }
        ]
    };
};
const $84451a3e48ae541f$export$66d64ae4fccd6d67 = async (hass, integration)=>{
    // Get all integrations from the manifest
    const manifests = (await hass.callWS({
        type: 'manifest/list'
    })).filter((m)=>[
            'device',
            'hub',
            'service',
            'integration'
        ].includes(m.integration_type ?? 'unknown'));
    manifests.sort((a, b)=>a.name.localeCompare(b.name));
    return [
        {
            name: 'integration',
            selector: {
                select: {
                    options: manifests.map((integration)=>({
                            value: integration.domain,
                            label: integration.name
                        })),
                    mode: 'dropdown'
                }
            },
            required: true,
            label: 'Integration'
        },
        $84451a3e48ae541f$var$CONTENT_SCHEMA,
        $84451a3e48ae541f$var$layoutSchema(integration),
        $84451a3e48ae541f$var$featuresSchema(integration),
        $84451a3e48ae541f$var$SORT_SCHEMA,
        $84451a3e48ae541f$var$INTERACTIONS_SCHEMA
    ];
};
const $84451a3e48ae541f$export$da5c1d4caabd4738 = (hass, config)=>{
    // Get entities for the device (if device_id is available)
    let entities = [];
    if (config.device_id) entities = (0, $093edc2594769ee5$export$c6a2d06cc40e579)(hass, config, config.device_id).map((e)=>e.entity_id);
    return [
        {
            name: 'device_id',
            selector: {
                device: {}
            },
            required: false,
            label: `Device`
        },
        {
            name: 'entity_id',
            required: false,
            label: 'Entity (alternative to device selection or for display state)',
            selector: {
                entity: {
                    multiple: false
                }
            }
        },
        $84451a3e48ae541f$var$CONTENT_SCHEMA,
        $84451a3e48ae541f$var$featuresSchema(undefined, entities),
        $84451a3e48ae541f$var$SORT_SCHEMA,
        $84451a3e48ae541f$var$INTERACTIONS_SCHEMA
    ];
};





class $4d8f78da09198f60$export$eb3c6eb92a4f4397 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */ render() {
        if (!this.hass || !this._config) return 0, $f58f44579a4747ac$export$45b790e32b2810ee;
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${(0, $84451a3e48ae541f$export$da5c1d4caabd4738)(this.hass, this._config)}
        .computeLabel=${(s)=>s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
    }
    /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */ setConfig(config) {
        this._config = config;
    }
    _valueChanged(ev) {
        const config = ev.detail.value;
        if (!config.features?.length) delete config.features;
        if (!config.exclude_entities?.length) delete config.exclude_entities;
        if (!config.exclude_sections?.length) delete config.exclude_sections;
        if (!config.section_order?.length) delete config.section_order;
        if (!config.inverse_percent?.length) delete config.inverse_percent;
        // @ts-ignore
        (0, $9c83ab07519e6203$export$43835e9acf248a15)(this, 'config-changed', {
            config: config
        });
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $4d8f78da09198f60$export$eb3c6eb92a4f4397.prototype, "_config", void 0);



/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/string/capitalize-first-letter.ts
 */ const $1409036132f3ee41$export$d07f57595c356899 = (str)=>str.charAt(0).toUpperCase() + str.slice(1);


const $68e99829eee639f8$export$26c6f48841fe1a8a = (str)=>str.split('_').map((s)=>(0, $1409036132f3ee41$export$d07f57595c356899)(s)).join(' ');


const $be605d8f132c1e28$export$48cc0f50054c9113 = (device, entryIds)=>device.config_entries?.some((entryId)=>entryIds.includes(entryId)) ?? false;







const $49ae81c1680fcc1f$export$78de33bacfd1396b = (config, deviceId, deviceName)=>{
    if (!config.exclude_devices?.length) return false;
    // Check if any exclusion pattern matches the device ID or name
    return config.exclude_devices.some((pattern)=>(0, $8e9091561798c377$export$78e968efcca6b7ef)(deviceId, pattern) || (0, $8e9091561798c377$export$78e968efcca6b7ef)(deviceName, pattern));
};



const $1f8809714ac7ce41$export$b4dbcc601e3f7204 = (config, deviceId, deviceName)=>{
    // If include_devices is specified, device must match one of the patterns
    if (config.include_devices?.length) return config.include_devices.some((pattern)=>(0, $8e9091561798c377$export$78e968efcca6b7ef)(deviceId, pattern) || (0, $8e9091561798c377$export$78e968efcca6b7ef)(deviceName, pattern));
    // If no include_devices specified, return false
    return false;
};



const $5d5dec7c32377406$export$d424543ab4012665 = (0, $def2de46b9306e8a$export$dbf350e5966cf602)`
  :host {
    --card-padding: 16px;
    --title-font-size: 1.5rem;
    --title-font-weight: 500;
    --title-margin-bottom: 16px;
    --card-gap: 16px;
  }

  .integration-title {
    font-size: var(--title-font-size);
    font-weight: var(--title-font-weight);
    margin: 0 0 var(--title-margin-bottom) 0;
    color: var(--primary-text-color);
    border-bottom: 1px solid var(--divider-color);
    padding-bottom: 8px;
  }

  .devices-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--card-gap);
  }

  .no-devices {
    padding: 32px 16px;
    text-align: center;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  /* For large screens, enable more columns */
  @media (min-width: 1200px) {
    .devices-container {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }
`;



class $3bda94c4eb71d8c0$export$ad4bbebd033175bb extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    /**
   * Returns the component's styles
   */ static get styles() {
        return 0, $5d5dec7c32377406$export$d424543ab4012665;
    }
    // getter for preview mode detection
    get isPreview() {
        return this.parentElement?.classList.contains('preview') || false;
    }
    /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */ setConfig(config) {
        if (!$30856da572fd852b$exports(config, this._config)) this._config = config;
    }
    /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */ set hass(hass) {
        this._hass = hass;
        const data = {
            name: '',
            devices: []
        };
        if (!this._config.integration) return;
        // Get all devices from the specified integration
        data.name = (0, $68e99829eee639f8$export$26c6f48841fe1a8a)(this._config.integration);
        // Get config entries for the integration domain
        hass.callWS({
            type: 'config_entries/get',
            domain: this._config.integration
        }).then((results)=>{
            const configEntries = results.map((e)=>e.entry_id);
            // Simplified device inclusion/exclusion logic
            Object.values(hass.devices).forEach((device)=>{
                // Check if device belongs to the integration first
                if ((0, $be605d8f132c1e28$export$48cc0f50054c9113)(device, configEntries)) {
                    const hasIncludeList = !!this._config.include_devices && this._config.include_devices.length > 0;
                    const isIncluded = hasIncludeList ? (0, $1f8809714ac7ce41$export$b4dbcc601e3f7204)(this._config, device.id, device.name) : true; // If no include list, all devices are considered "included"
                    const isExcluded = (0, $49ae81c1680fcc1f$export$78de33bacfd1396b)(this._config, device.id, device.name);
                    // Add device if:
                    // 1. It passes the inclusion check (either matches a pattern or no patterns specified)
                    // 2. It doesn't match any exclusion pattern
                    if (isIncluded && !isExcluded) data.devices.push(device.id);
                }
            });
            if (!$30856da572fd852b$exports(data, this._integration)) this._integration = data;
        });
    }
    // card configuration
    static getConfigElement() {
        return document.createElement('integration-card-editor');
    }
    /**
   * Returns a stub configuration for the card
   * @param {HomeAssistant} hass - The Home Assistant instance
   */ static async getStubConfig(hass) {
        const device = Object.values(hass.devices).find((device)=>device.identifiers && device.identifiers.length > 0);
        const integration = device?.identifiers?.[0]?.[0] ?? '';
        return {
            integration: integration
        };
    }
    /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */ render() {
        if (!this._integration?.devices?.length) {
            const message = this._integration ? `${(0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(this._hass, 'card.no_devices_found')} ${this._config.integration}` : (0, $623ffaa3e77fea87$export$b3bd0bc58e36cd63)(this._hass, 'card.loading');
            return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<ha-card>
        <div class="card-content">
          <div class="no-devices">${message}</div>
        </div>
      </ha-card>`;
        }
        // For preview, only show one device
        const devicesToShow = this.isPreview ? this._integration?.devices?.slice(0, 1) : this._integration?.devices;
        const title = this._config.title ?? this._integration.name;
        // Get grid styles based on columns configuration
        const gridStyles = this._getGridStyles();
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
      <div>
        ${title && !this._config.hide_integration_title ? (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<h1 class="integration-title">${title}</h1>` : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}

        <div class="devices-container" style=${(0, $19f464fcda7d2482$export$1e5b4ce2fa884e6a)(gridStyles)}>
          ${devicesToShow.map((deviceId)=>{
            return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
              <device-card
                .config=${{
                device_id: deviceId,
                preview_count: this._config.preview_count,
                exclude_entities: this._config.exclude_entities,
                exclude_sections: this._config.exclude_sections,
                section_order: this._config.section_order,
                sort: this._config.sort,
                tap_action: this._config.tap_action,
                hold_action: this._config.hold_action,
                double_tap_action: this._config.double_tap_action,
                features: this._config.features
            }}
                .hass=${this._hass}
              ></device-card>
            `;
        })}
        </div>
      </div>
    `;
    }
    /**
   * Generate the grid styles based on the columns configuration
   * @returns {Record<string, string>} Style properties object
   */ _getGridStyles() {
        // If columns setting is provided, use it to set a fixed number of columns
        if (this._config.columns && Number.isInteger(this._config.columns) && this._config.columns > 0) return {
            'grid-template-columns': `repeat(${this._config.columns}, 1fr)`
        };
        // Otherwise, return an empty object to use the default responsive behavior
        return {};
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $3bda94c4eb71d8c0$export$ad4bbebd033175bb.prototype, "_config", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $3bda94c4eb71d8c0$export$ad4bbebd033175bb.prototype, "_integration", void 0);








class $bb372a36f92bd9c9$export$9e322cdd8735282 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */ render() {
        if (!this.hass || !this._config) return 0, $f58f44579a4747ac$export$45b790e32b2810ee;
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`${this._getIntegrationsTask.render({
            initial: ()=>(0, $f58f44579a4747ac$export$45b790e32b2810ee),
            pending: ()=>(0, $f58f44579a4747ac$export$45b790e32b2810ee),
            complete: (value)=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${value}
          .computeLabel=${(s)=>s.label}
          @value-changed=${this._valueChanged}
        ></ha-form>
      `,
            error: (error)=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`${error}`
        })}`;
    }
    /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */ setConfig(config) {
        this._config = config;
    }
    /**
   * Handle form value changes
   */ _valueChanged(ev) {
        const config = ev.detail.value;
        // Clean up empty arrays and undefined values
        if (!config.features?.length) delete config.features;
        if (!config.exclude_entities?.length) delete config.exclude_entities;
        if (!config.exclude_sections?.length) delete config.exclude_sections;
        if (!config.section_order?.length) delete config.section_order;
        if (!config.exclude_devices?.length) delete config.exclude_devices;
        if (!config.include_devices?.length) delete config.include_devices;
        if (!config.columns || config.columns <= 0) delete config.columns;
        // @ts-ignore
        (0, $9c83ab07519e6203$export$43835e9acf248a15)(this, 'config-changed', {
            config: config
        });
    }
    constructor(...args){
        super(...args), /**
   * Task that fetches the integrations asynchronously
   * Uses the Home Assistant web sockets Promise
   */ this._getIntegrationsTask = new (0, $1dfff43fc77cdecb$export$2dea7024bcdd7731)(this, {
            task: async ([integration])=>await (0, $84451a3e48ae541f$export$66d64ae4fccd6d67)(this.hass, integration),
            args: ()=>[
                    this._config?.integration
                ]
        });
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $bb372a36f92bd9c9$export$9e322cdd8735282.prototype, "_config", void 0);


var $b06602ab53bd58a3$exports = {};
$b06602ab53bd58a3$exports = JSON.parse("{\"name\":\"device-card\",\"version\":\"0.15.0\",\"author\":\"Patrick Masters\",\"license\":\"ISC\",\"description\":\"Custom Home Assistant card to show info about your devices.\",\"source\":\"src/index.ts\",\"module\":\"dist/device-card.js\",\"targets\":{\"module\":{\"includeNodeModules\":true}},\"scripts\":{\"watch\":\"parcel watch\",\"build\":\"parcel build\",\"format\":\"prettier --write .\",\"test\":\"TS_NODE_PROJECT='./tsconfig.test.json' mocha\",\"test:coverage\":\"nyc yarn test\",\"test:watch\":\"TS_NODE_PROJECT='./tsconfig.test.json' mocha --watch\",\"update\":\"npx npm-check-updates -u && yarn install\"},\"devDependencies\":{\"@istanbuljs/nyc-config-typescript\":\"^1.0.2\",\"@open-wc/testing\":\"^4.0.0\",\"@parcel/transformer-inline-string\":\"^2.15.4\",\"@testing-library/dom\":\"^10.4.1\",\"@trivago/prettier-plugin-sort-imports\":\"^5.2.2\",\"@types/chai\":\"^5.2.2\",\"@types/jsdom\":\"^21.1.7\",\"@types/mocha\":\"^10.0.10\",\"@types/sinon\":\"^17.0.4\",\"chai\":\"^5.2.1\",\"jsdom\":\"^26.1.0\",\"mocha\":\"^11.7.1\",\"nyc\":\"^17.1.0\",\"parcel\":\"^2.15.4\",\"prettier\":\"3.6.2\",\"prettier-plugin-organize-imports\":\"^4.2.0\",\"proxyquire\":\"^2.1.3\",\"sinon\":\"^21.0.0\",\"ts-node\":\"^10.9.2\",\"tsconfig-paths\":\"^4.2.0\",\"typescript\":\"^5.9.2\"},\"dependencies\":{\"@lit/task\":\"^1.0.3\",\"fast-deep-equal\":\"^3.1.3\",\"lit\":\"^3.3.1\"}}");


// Register the custom elements with the browser
customElements.define('device-card', (0, $76efc5be730c974a$export$cee8aa229c046b5e));
customElements.define('device-card-editor', (0, $4d8f78da09198f60$export$eb3c6eb92a4f4397));
customElements.define('integration-card', (0, $3bda94c4eb71d8c0$export$ad4bbebd033175bb));
customElements.define('integration-card-editor', (0, $bb372a36f92bd9c9$export$9e322cdd8735282));
// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];
// Register the cards with Home Assistant's custom card registry
window.customCards.push({
    // Unique identifier for the card type
    type: 'device-card',
    // Display name in the UI
    name: 'Device Card',
    // Card description for the UI
    description: 'A card to summarize the status of a Device.',
    // Show a preview of the card in the UI
    preview: true,
    // URL for the card's documentation
    documentationURL: 'https://github.com/homeassistant-extras/device-card'
}, {
    // Unique identifier for the card type
    type: 'integration-card',
    // Display name in the UI
    name: 'Integration Card',
    // Card description for the UI
    description: 'A card to display all devices from a specific integration.',
    // Show a preview of the card in the UI
    preview: true,
    // URL for the card's documentation
    documentationURL: 'https://github.com/homeassistant-extras/device-card'
});
console.info(`%c\u{1F431} Poat's Tools: device-card - ${(0, $b06602ab53bd58a3$exports.version)}`, 'color: #CFC493;');


//# sourceMappingURL=device-card.js.map
