
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
//
// index.ts by Tobias Wiedenmann https://github.com/Thyraz
//
// Loads the custom element and registers the card in Home Assistant
//
// Home Assistant cumstom dashboard card for the PQINA "Flip" clock
//
// LINK TO ORIGINAL 'PQINA flip' REPOSITORY: https://github.com/pqina/flip
//
// Also thanks to Elmar Hinz for his HA development tutorials:
// https://github.com/home-assistant-tutorials/01.development-environment
//
//
// flip-clock.ts by Tobias Wiedenmann https://github.com/Thyraz
//
// Home Assistant cumstom dashboard card for the PQINA "Flip" clock
//
// LINK TO ORIGINAL 'PQINA flip' REPOSITORY: https://github.com/pqina/flip
//
// Also thanks to Elmar Hinz for his HA development tutorials:
// https://github.com/home-assistant-tutorials/01.development-environment
//
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
 */ const { is: $19fe8e3abedf4df0$var$i, defineProperty: $19fe8e3abedf4df0$var$e, getOwnPropertyDescriptor: $19fe8e3abedf4df0$var$r, getOwnPropertyNames: $19fe8e3abedf4df0$var$h, getOwnPropertySymbols: $19fe8e3abedf4df0$var$o, getPrototypeOf: $19fe8e3abedf4df0$var$n } = Object, $19fe8e3abedf4df0$var$a = globalThis, $19fe8e3abedf4df0$var$c = $19fe8e3abedf4df0$var$a.trustedTypes, $19fe8e3abedf4df0$var$l = $19fe8e3abedf4df0$var$c ? $19fe8e3abedf4df0$var$c.emptyScript : "", $19fe8e3abedf4df0$var$p = $19fe8e3abedf4df0$var$a.reactiveElementPolyfillSupport, $19fe8e3abedf4df0$var$d = (t, s)=>t, $19fe8e3abedf4df0$export$7312b35fbf521afb = {
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
}, $19fe8e3abedf4df0$export$53a6892c50694894 = (t, s)=>!$19fe8e3abedf4df0$var$i(t, s), $19fe8e3abedf4df0$var$y = {
    attribute: !0,
    type: String,
    converter: $19fe8e3abedf4df0$export$7312b35fbf521afb,
    reflect: !1,
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
    static createProperty(t, s = $19fe8e3abedf4df0$var$y) {
        if (s.state && (s.attribute = !1), this._$Ei(), this.elementProperties.set(t, s), !s.noAccessor) {
            const i = Symbol(), r = this.getPropertyDescriptor(t, i, s);
            void 0 !== r && $19fe8e3abedf4df0$var$e(this.prototype, t, r);
        }
    }
    static getPropertyDescriptor(t, s, i) {
        const { get: e, set: h } = $19fe8e3abedf4df0$var$r(this.prototype, t) ?? {
            get () {
                return this[s];
            },
            set (t) {
                this[s] = t;
            }
        };
        return {
            get () {
                return e?.call(this);
            },
            set (s) {
                const r = e?.call(this);
                h.call(this, s), this.requestUpdate(t, r, i);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) ?? $19fe8e3abedf4df0$var$y;
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
                ...$19fe8e3abedf4df0$var$h(t),
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
    _$EC(t, s) {
        const i = this.constructor.elementProperties.get(t), e = this.constructor._$Eu(t, i);
        if (void 0 !== e && !0 === i.reflect) {
            const r = (void 0 !== i.converter?.toAttribute ? i.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb).toAttribute(s, i.type);
            this._$Em = t, null == r ? this.removeAttribute(e) : this.setAttribute(e, r), this._$Em = null;
        }
    }
    _$AK(t, s) {
        const i = this.constructor, e = i._$Eh.get(t);
        if (void 0 !== e && this._$Em !== e) {
            const t = i.getPropertyOptions(e), r = "function" == typeof t.converter ? {
                fromAttribute: t.converter
            } : void 0 !== t.converter?.fromAttribute ? t.converter : $19fe8e3abedf4df0$export$7312b35fbf521afb;
            this._$Em = e, this[e] = r.fromAttribute(s, t.type), this._$Em = null;
        }
    }
    requestUpdate(t, s, i) {
        if (void 0 !== t) {
            if (i ??= this.constructor.getPropertyOptions(t), !(i.hasChanged ?? $19fe8e3abedf4df0$export$53a6892c50694894)(this[t], s)) return;
            this.P(t, s, i);
        }
        !1 === this.isUpdatePending && (this._$ES = this._$ET());
    }
    P(t, s, i) {
        this._$AL.has(t) || this._$AL.set(t, s), !0 === i.reflect && this._$Em !== t && (this._$Ej ??= new Set).add(t);
    }
    async _$ET() {
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
            if (t.size > 0) for (const [s, i] of t)!0 !== i.wrapped || this._$AL.has(s) || void 0 === this[s] || this.P(s, this[s], i);
        }
        let t = !1;
        const s = this._$AL;
        try {
            t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((t)=>t.hostUpdate?.()), this.update(s)) : this._$EU();
        } catch (s) {
            throw t = !1, this._$EU(), s;
        }
        t && this._$AE(s);
    }
    willUpdate(t) {}
    _$AE(t) {
        this._$EO?.forEach((t)=>t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$EU() {
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
        this._$Ej &&= this._$Ej.forEach((t)=>this._$EC(t, this[t])), this._$EU();
    }
    updated(t) {}
    firstUpdated(t) {}
}
$19fe8e3abedf4df0$export$c7c07a37856565d.elementStyles = [], $19fe8e3abedf4df0$export$c7c07a37856565d.shadowRootOptions = {
    mode: "open"
}, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("elementProperties")] = new Map, $19fe8e3abedf4df0$export$c7c07a37856565d[$19fe8e3abedf4df0$var$d("finalized")] = new Map, $19fe8e3abedf4df0$var$p?.({
    ReactiveElement: $19fe8e3abedf4df0$export$c7c07a37856565d
}), ($19fe8e3abedf4df0$var$a.reactiveElementVersions ??= []).push("2.0.4");


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
        for(this._$AP?.(!1, !0, i); t && t !== this._$AB;){
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
$f58f44579a4747ac$var$j?.($f58f44579a4747ac$var$N, $f58f44579a4747ac$var$R), ($f58f44579a4747ac$var$t.litHtmlVersions ??= []).push("3.2.1");
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
 */ class $ab210b2da7b39b9d$export$3f2f9f5909897157 extends (0, $19fe8e3abedf4df0$export$c7c07a37856565d) {
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
        const s = this.render();
        this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = (0, $f58f44579a4747ac$export$b3890eb0ae9dca99)(s, this.renderRoot, this.renderOptions);
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
$ab210b2da7b39b9d$export$3f2f9f5909897157._$litElement$ = !0, $ab210b2da7b39b9d$export$3f2f9f5909897157["finalized"] = !0, globalThis.litElementHydrateSupport?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$var$i = globalThis.litElementPolyfillSupport;
$ab210b2da7b39b9d$var$i?.({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$export$f5c524615a7708d6 = {
    _$AK: (t, e, s)=>{
        t._$AK(e, s);
    },
    _$AL: (t)=>t._$AL
};
(globalThis.litElementVersions ??= []).push("4.1.1");


/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $a00bca1a101a9088$export$6acf61af03e62db = !1;





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
    if (void 0 === s && globalThis.litPropertyMetadata.set(i, s = new Map), s.set(r.name, t), "accessor" === n) {
        const { name: o } = r;
        return {
            set (r) {
                const n = e.get.call(this);
                e.set.call(this, r), this.requestUpdate(o, n, t);
            },
            init (e) {
                return void 0 !== e && this.P(o, void 0, t), e;
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
            return e.constructor.createProperty(o, r ? {
                ...t,
                wrapped: !0
            } : t), r ? Object.getOwnPropertyDescriptor(e, o) : void 0;
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




//
// flip-clock.sytles.ts by Tobias Wiedenmann https://github.com/Thyraz
//
// Combines CSS from PQINA Flip with custom default styles for the dashboard card
// CSS files are loaded with "bundle-text" as strings, so we can use the original and unchanged CSS file from PQINA.
// Imported using LITs "unsafeCSS"
//
// Home Assistant cumstom dashboard card for the PQINA "Flip" clock
//
// LINK TO ORIGINAL 'PQINA flip' REPOSITORY: https://github.com/pqina/flip
//
// Also thanks to Elmar Hinz for his HA development tutorials:
// https://github.com/home-assistant-tutorials/01.development-environment
//

var $2387484dec479845$exports = {};
$2387484dec479845$exports = ".tick {\n  box-sizing: border-box;\n  -webkit-user-select: none;\n  user-select: none;\n  cursor: default;\n  z-index: 1;\n  line-height: 1.4;\n  position: relative;\n}\n\n.tick * {\n  box-sizing: inherit;\n}\n\n.tick [data-view] {\n  max-width: 100%;\n}\n\n.tick span[data-view] {\n  display: inline-block;\n}\n\n.tick .tick-credits {\n  opacity: .4;\n  color: inherit;\n  font-size: 11px;\n  text-decoration: none;\n  position: absolute;\n  bottom: 0;\n  right: 0;\n}\n\n.tick [data-layout~=\"pad\"] {\n  margin: -.25em;\n}\n\n.tick [data-layout~=\"pad\"] > * {\n  margin: .25em;\n}\n\n.tick [data-layout~=\"horizontal\"] {\n  flex-direction: row;\n  justify-content: center;\n  display: flex;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"baseline\"] {\n  align-items: baseline;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"center\"] {\n  justify-content: center;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"right\"] {\n  justify-content: flex-end;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"left\"] {\n  justify-content: flex-start;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"fill\"], .tick [data-layout~=\"horizontal\"][data-layout~=\"stretch\"] {\n  flex-wrap: nowrap;\n  align-content: stretch;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"fill\"] > *, .tick [data-layout~=\"horizontal\"][data-layout~=\"stretch\"] > * {\n  flex: 1 0 0;\n  width: 100%;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"multi-line\"] {\n  flex-wrap: wrap;\n}\n\n.tick [data-layout~=\"horizontal\"][data-layout~=\"fit\"] {\n  white-space: nowrap;\n  flex-wrap: nowrap;\n  place-content: center flex-start;\n  display: inline-flex;\n}\n\n.tick [data-layout~=\"vertical\"] {\n  flex-direction: column;\n  align-items: center;\n  display: flex;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"top\"] {\n  justify-content: flex-start;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"bottom\"] {\n  justify-content: flex-end;\n  min-height: 100%;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"middle\"] {\n  justify-content: center;\n  min-height: 100%;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"left\"] {\n  align-items: flex-start;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"right\"] {\n  align-items: flex-end;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"center\"] {\n  text-align: center;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"fill\"], .tick [data-layout~=\"vertical\"][data-layout~=\"stretch\"] {\n  align-items: stretch;\n  min-height: 100%;\n}\n\n.tick [data-layout~=\"vertical\"][data-layout~=\"fill\"] > *, .tick [data-layout~=\"vertical\"][data-layout~=\"stretch\"] > * {\n  flex: 1 0 0;\n}\n\n.tick [data-layout~=\"vertical\"] > * + * {\n  margin-top: .5em;\n}\n\n.tick [data-layout~=\"overlay\"] {\n  position: relative;\n}\n\n.tick [data-layout~=\"overlay\"] > * {\n  margin: 0;\n}\n\n.tick [data-layout~=\"overlay\"][data-layout~=\"center\"] {\n  text-align: center;\n}\n\n.tick [data-layout~=\"overlay\"][data-layout~=\"left\"] {\n  text-align: left;\n}\n\n.tick [data-layout~=\"overlay\"][data-layout~=\"right\"] {\n  text-align: right;\n}\n\n.tick [data-layout~=\"overlay\"] > [data-overlay=\"fill\"], .tick [data-layout~=\"overlay\"] > [data-overlay=\"stretch\"] {\n  position: absolute;\n  inset: 0;\n}\n\n.tick [data-layout~=\"overlay\"] > [data-overlay=\"center\"] {\n  justify-content: center;\n  align-items: center;\n  display: flex;\n  position: absolute;\n  inset: 0;\n}\n\n.tick-flip {\n  text-align: center;\n  position: relative;\n}\n\n.tick-flip * {\n  border-radius: inherit;\n  white-space: pre;\n  letter-spacing: inherit;\n  text-indent: inherit;\n}\n\n.tick-flip-front {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.tick-flip-back {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n\n.tick-flip-spacer {\n  visibility: hidden;\n  display: block;\n}\n\n.tick-flip-shadow {\n  position: absolute;\n  inset: 1px;\n  color: #0000 !important;\n  background: none !important;\n}\n\n.tick-flip-shadow-top {\n  bottom: calc(50% - 1px);\n}\n\n.tick-flip-shadow-bottom {\n  top: calc(50% + 1px);\n}\n\n.tick-flip-card-shadow {\n  opacity: 0;\n  transform-origin: 0 100%;\n  z-index: 0;\n  background-color: #0000;\n  border-radius: 0;\n  height: .5em;\n  position: absolute;\n  bottom: .125em;\n  left: .15em;\n  right: .15em;\n  box-shadow: 0 .125em .25em #00000080, 0 .125em .5em #000000bf;\n}\n\n.tick-flip-card {\n  z-index: 1;\n  perspective: 4em;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n\n.tick-flip-panel-back, .tick-flip-panel-front {\n  backface-visibility: hidden;\n  width: 100%;\n  height: 51%;\n  transform-style: preserve-3d;\n  position: absolute;\n  left: 0;\n}\n\n.tick-flip-panel-back-text, .tick-flip-panel-front-text {\n  height: 100%;\n  position: absolute;\n  top: 0;\n  left: -1px;\n  right: -1px;\n  overflow: hidden;\n}\n\n.tick-flip-panel-text-wrapper {\n  height: 100%;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n}\n\n.tick-flip-panel-back-text .tick-flip-panel-text-wrapper {\n  height: 200%;\n  top: -100%;\n}\n\n.tick-flip-panel-front {\n  transform-origin: bottom;\n  z-index: 2;\n  top: 0;\n  box-shadow: inset 0 1px #ffffff0d;\n}\n\n.tick-flip-panel-back {\n  transform-origin: top;\n  z-index: 1;\n  top: 50%;\n  box-shadow: inset 0 -1px #0000001a;\n}\n\n.tick-flip-panel-back:after {\n  z-index: 1;\n  content: \"\";\n  background-image: linear-gradient(#0000004d 1px, #00000026 0, #0000 30%);\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n\n.tick-flip-panel-back-shadow {\n  z-index: 2;\n}\n\n.tick-flip-panel-back-highlight {\n  z-index: 3;\n}\n\n.tick-flip-panel-back-highlight, .tick-flip-panel-back-shadow {\n  border-bottom-left-radius: inherit;\n  border-bottom-right-radius: inherit;\n}\n\n.tick-flip-panel-back-highlight, .tick-flip-panel-back-shadow, .tick-flip-panel-front-shadow {\n  opacity: 0;\n  position: absolute;\n  inset: 0;\n}\n\n.tick-flip-panel-front-shadow {\n  background-image: linear-gradient(0deg, #000c, #0000004d);\n}\n\n.tick-flip-panel-back-shadow {\n  background-image: linear-gradient(#000000b3, #00000080);\n}\n\n.tick-flip-panel-back-highlight {\n  background-image: linear-gradient(#ffffff26, #ffffff4d);\n}\n\n.tick [data-style*=\"shadow:inner\"], .tick [data-style*=\"shadow:inner\"] .tick-flip-card-shadow, .tick [data-style*=\"shadow:none\"] .tick-flip-card-shadow, .tick [data-style*=\"shadow:none\"] .tick-flip-panel-back, .tick [data-style*=\"shadow:none\"] .tick-flip-panel-front, .tick [data-style*=\"shadow:none\"] .tick-flip-shadow {\n  box-shadow: none;\n}\n\n.tick [data-style*=\"shadow:none\"] .tick-flip-back:after, .tick [data-style*=\"shadow:none\"] .tick-flip-panel-back-shadow, .tick [data-style*=\"shadow:none\"] .tick-flip-panel-back-text:after, .tick [data-style*=\"shadow:none\"] .tick-flip-panel-front-shadow {\n  background-image: none;\n}\n\n.tick [data-style*=\"rounded:none\"] {\n  border-radius: 0;\n}\n\n.tick [data-style*=\"rounded:panels\"] .tick-flip-front, .tick [data-style*=\"rounded:panels\"] .tick-flip-shadow-bottom {\n  border-bottom-left-radius: inherit;\n  border-bottom-right-radius: inherit;\n}\n\n.tick [data-style*=\"rounded:panels\"] .tick-flip-back, .tick [data-style*=\"rounded:panels\"] .tick-flip-panel-back:after, .tick [data-style*=\"rounded:panels\"] .tick-flip-shadow-top {\n  border-top-left-radius: inherit;\n  border-top-right-radius: inherit;\n}\n\n.tick-flip {\n  letter-spacing: .25em;\n  text-indent: .25em;\n  border-radius: .125em;\n  min-width: 1.125em;\n  margin-left: .0625em;\n  margin-right: .0625em;\n}\n\n.tick-flip-panel {\n  color: #edebeb;\n  background-color: #333232;\n}\n\n.tick-flip-shadow {\n  box-shadow: 0 .125em .3125em #00000040, 0 .02125em .06125em #00000040;\n}\n";


var $05e794b189fd573b$exports = {};
$05e794b189fd573b$exports = "ha-card {\n  --width: 95%;\n  --height: \"\";\n  --font: inherit;\n  --font-size: \"\";\n  --text-color: white;\n  --text-offset-horizontal: 0em;\n  --text-offset-vertical: 0em;\n  --front-flap-color: #333;\n  --front-flap-shadow-opacity: .5;\n  --front-flap-gradient-opacity: .2;\n  --rear-flap-color: #2f2f2f;\n  --rear-flap-vertical-offset: .14em;\n}\n\n.card-content {\n  container-type: inline-size;\n}\n\n.clock {\n  width: min(var(--width), 100%);\n  padding-left: calc((100% - min(var(--width), 100%)) / 2);\n}\n\n.tick {\n  line-height: var(--height);\n}\n\n.tick-flip, .tick-text-inline {\n  font-size: var(--font-size);\n  letter-spacing: .06em;\n}\n\n.tick-flip-panel {\n  color: var(--text-color);\n  background-color: var(--front-flap-color);\n}\n\n.tick-flip {\n  font-family: var(--font);\n  border-radius: .15em;\n  width: 1.25em;\n  margin-left: .025em;\n  margin-right: .025em;\n}\n\n.tick-flip-panel-text-wrapper {\n  margin-top: calc(var(--text-offset-vertical)  + .04em);\n  margin-left: calc(var(--text-offset-horizontal)  - .15em);\n}\n\n.tick-flip-shadow {\n  box-shadow: 0em .075em .02em -.03em rgb(0, 0, 0, var(--front-flap-shadow-opacity)), 0em var(--rear-flap-vertical-offset) 0em -.05em var(--rear-flap-color);\n}\n\n.tick-flip-panel-back:after {\n  background-image: linear-gradient(180deg, #000 .01em, #00000026 .015em, transparent 30%, rgba(255, 255, 255, var(--front-flap-gradient-opacity)) 100%);\n  border-radius: 0 0 .15em .15em;\n}\n";


const $c457fb01bf7d3200$export$9dd6ff9ea0189349 = (0, $def2de46b9306e8a$export$dbf350e5966cf602)`
  ${(0, $def2de46b9306e8a$export$8d80f9cac07cdb3)((0, (/*@__PURE__*/$parcel$interopDefault($2387484dec479845$exports))) + '\n' + (0, (/*@__PURE__*/$parcel$interopDefault($05e794b189fd573b$exports))))}
`;


/* eslint-disable */ /*
 * @pqina/tick v1.8.3 - Counters Made Easy
 * Copyright (c) 2024 PQINA - https://github.com/pqina/tick/
 */ var $cb0f8e7917a333d8$export$2e2bcd8739ae039 = typeof window !== 'undefined' ? function() {
    if (!module) var module = {};
    'use strict';
    // Available extension types
    var ExtensionType = {
        FONT: 'font',
        VIEW: 'view',
        TRANSFORM: 'transform',
        EASING_FUNCTION: 'easing-function',
        TRANSITION: 'transition'
    };
    // Registered extension collection
    var Extensions = {};
    Extensions[ExtensionType.FONT] = {};
    Extensions[ExtensionType.VIEW] = {};
    Extensions[ExtensionType.TRANSFORM] = {};
    Extensions[ExtensionType.EASING_FUNCTION] = {};
    Extensions[ExtensionType.TRANSITION] = {};
    /**
 * Adds multiple extensions in one go
 * @param type
 * @param extensions
 * @returns {null}
 */ var addExtensions = function addExtensions(type, extensions) {
        // type does not exist
        if (!Extensions[type]) return null;
        for(var name in extensions){
            if (!extensions.hasOwnProperty(name)) continue;
            // name already exists 
            if (Extensions[type][name]) return null;
            // register
            Extensions[type][name] = extensions[name];
        }
    };
    /**
 * Adds an extension function by type
 * @param type
 * @param name
 * @param fn
 * @returns {null}
 */ var addExtension = function addExtension(type, name, fn) {
        // type does not exist
        if (!Extensions[type]) throw 'Can\'t add extension with type of "' + type + '", "' + type + '" is not a valid extension type. The following types are valid: ' + keysToList(Extensions);
        // if is invalid name
        if (!/^[-a-z]+$/.test(name)) throw 'Can\'t add extension with name "' + name + '", "' + name + '" is contains invalid characters. Only lowercase alphabetical characters and dashes are allowed.';
        // name in type already exists 
        if (Extensions[type][name]) throw 'Can\'t add extension with name "' + name + '", "' + name + '" is already added.';
        // add
        Extensions[type][name] = fn;
    };
    /**
 * Returns an extension function by name and type
 * @param type
 * @param name
 * @returns {*}
 */ var getExtension = function getExtension(type, name) {
        // type does not exist
        if (!Extensions[type]) throw 'Can\'t get extension with type of "' + type + '", "' + type + '" is not a valid extension type. The following types are available: ' + keysToList(Extensions);
        // name in type does not exist
        if (!Extensions[type][name]) throw 'Can\'t get extension with name "' + name + '", "' + name + '" is not available. The following extensions are available: ' + keysToList(Extensions[type]);
        return Extensions[type][name];
    };
    var MILLISECOND = 1;
    var SECOND = 1000;
    var MINUTE = 60000;
    var HOUR = 3600000;
    var DAY = 86400000;
    var WEEK = 604800000;
    var MONTH = 2628000000;
    var YEAR = 31536000000;
    var TimeUnit = {
        'Week': WEEK,
        'Day': DAY,
        'Hour': HOUR,
        'Minute': MINUTE,
        'Second': SECOND,
        'Millisecond': MILLISECOND,
        'Month': MONTH,
        'Year': YEAR
    };
    var Months = [
        'Januari',
        'Februari',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    for(var key in TimeUnit){
        if (!TimeUnit.hasOwnProperty(key)) continue;
        var val = TimeUnit[key];
        if (val === MILLISECOND) {
            TimeUnit['mi'] = val;
            TimeUnit['ms'] = val;
        } else if (val === MONTH) TimeUnit['M'] = val;
        else TimeUnit[key.charAt(0).toLowerCase()] = val;
        TimeUnit[key.toLowerCase()] = val;
        TimeUnit[key.toLowerCase() + 's'] = val;
    }
    var Days = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 0
    };
    var MonthFactor = {
        'M': 1,
        'y': 12
    };
    var serverDate = function serverDate(cb) {
        var xhr = new XMLHttpRequest();
        var now = Date.now();
        xhr.open('HEAD', window.location + '?noCache=' + now);
        xhr.setRequestHeader('Content-Type', 'text/html');
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.onload = function() {
            var correction = (now - Date.now()) * .5;
            var responseDate = new Date(xhr.getResponseHeader('Date'));
            cb(new Date(responseDate.getTime() + correction));
        };
        xhr.send();
    };
    var isDate = function isDate(date) {
        return date instanceof Date;
    };
    var setTime = function setTime(date, time) {
        date.setHours(time[0] || 0, time[1] || 0, time[2] || 0, time[3] || 0);
        return date;
    };
    var setDay = function setDay(date, day) {
        var current = date.getDay();
        var dist = day - current;
        date.setDate(date.getDate() + dist);
        return date;
    };
    var setDayOfMonth = function setDayOfMonth(date, day) {
        var totalDays = daysInMonth(date.getMonth() + 1, date.getFullYear());
        day = day === 'last' ? totalDays : Math.max(1, Math.min(totalDays, day));
        date.setDate(day);
        return date;
    };
    var setMonth = function setMonth(date, month) {
        date.setMonth(Months.map(function(m) {
            return m.toLowerCase();
        }).indexOf(month));
        return date;
    };
    /*
 Z
 ±hh:mm
 ±hhmm
 ±hh
 */ var toTimezoneOffset = function toTimezoneOffset(ISO8601Timezone) {
        var current = new Date().getTimezoneOffset() * 60000;
        if (ISO8601Timezone === 'Z') return current;
        var parts = ISO8601Timezone.match(/\+|-|[\d]{2}|[\d]{2}/g);
        var multiplier = parts.shift() === '-' ? -1 : 1;
        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);
        // calculate zone offset plus our current zone offset, all in milliseconds
        return multiplier * (hours * 3600000 + minutes * 60000) + current;
    };
    var offsetDate = function offsetDate(offset) {
        return new Date(Date.now() + offset);
    };
    var timezoneDate = function timezoneDate(date, offset) {
        return new Date(date.getTime() + offset);
    };
    // same date (day)
    var sameDate = function sameDate(a, b) {
        return a.toDateString() === b.toDateString();
    };
    // exact same date and time
    var sameTime = function sameTime(a, b) {
        return a.getTime() === b.getTime();
    };
    var daysInMonth = function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    };
    var dateFromISO = function dateFromISO(iso) {
        // use existing timezone
        if (iso.match(/(Z)|([+\-][0-9]{2}:?[0-9]*$)/g)) return new Date(iso);
        // add local timezone
        iso += iso.indexOf('T') !== -1 ? 'Z' : '';
        return dateToLocal(new Date(iso));
    };
    var dateToLocal = function dateToLocal(date) {
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    };
    var timeDuration = function timeDuration(milliseconds, components) {
        return components.map(function(key) {
            var requiredMilliseconds = TimeUnit[key];
            var count = Math.max(0, Math.floor(milliseconds / requiredMilliseconds));
            milliseconds = milliseconds % requiredMilliseconds;
            return count;
        });
    };
    // makes use of time duration for everything expect years and months
    var dateDiff = function dateDiff(a, b, components) {
        // do calculations
        var diff = b - a;
        var swapped = false;
        if (diff < 0) {
            diff = a - b;
            var _ref = [
                b,
                a
            ];
            a = _ref[0];
            b = _ref[1];
            swapped = true;
        }
        // set default components
        if (!components) components = [
            'd',
            'h',
            'm'
        ];
        // correct month uppercase M if set to lower case
        var mIndex = components.indexOf('m');
        if (mIndex >= 0 && (components[mIndex - 1] === 'y' || components[mIndex + 1] === 'd')) components[mIndex].key = 'M';
        var anchor = void 0;
        var monthsRemaining = void 0;
        var months = void 0;
        var presentsYears = components.includes('y');
        var presentsMonths = components.includes('M');
        if (presentsMonths || presentsYears) {
            anchor = new Date(a.valueOf() + diff);
            monthsRemaining = diffInMonths(anchor, a);
            months = presentsMonths ? Math.floor(monthsRemaining) : Math.floor(monthsRemaining / 12) * 12;
            diff = anchor.valueOf() - addMonths(clone$1(a), months).valueOf();
        }
        var output = components.map(function(key) {
            // if is month or year
            if (key === 'y' || key === 'M') {
                var _count = Math.max(0, Math.floor(monthsRemaining / MonthFactor[key]));
                monthsRemaining -= _count * MonthFactor[key];
                return _count;
            }
            var requiredMilliseconds = TimeUnit[key];
            var count = Math.max(0, Math.floor(diff / requiredMilliseconds));
            diff = diff % requiredMilliseconds;
            return count;
        });
        return swapped ? output.map(function(v) {
            return v > 0 ? -v : v;
        }) : output;
    };
    /**
 * Tick.helper.duration(10, 'seconds') -> milliseconds
 * Tick.helper.duration(a, b, format, cascade) -> [0, 10, 20, 4, 0];
 * @param args
 * @returns {*}
 */ var duration = function duration() {
        for(var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
        // if is countdown x amount of milliseconds
        if (typeof args[0] === 'number' && typeof args[1] === 'string') {
            if (!TimeUnit[args[1]]) throw '"' + args[1] + '" is not a valid amount.';
            return args[0] * TimeUnit[args[1]];
        }
        // is date diff
        if (isDate(args[0])) return dateDiff.apply(undefined, args);
        // is duration in milliseconds
        if (typeof args[0] === 'number' && Array.isArray(args[1])) return timeDuration.apply(undefined, args);
        return null;
    };
    /**
 * Returns current date
 */ var now$1 = function now() {
        return new Date();
    };
    /**
 * Clones the given date object
 * @param date
 * @returns {Date}
 */ var clone$1 = function clone(date) {
        return new Date(date.valueOf());
    };
    /**
 * Adds x amount of months to date
 * @param date
 * @param months
 * @returns {*}
 */ var addMonths = function addMonths(date, months) {
        date.setMonth(date.getMonth() + months);
        return date;
    };
    /**
 * Difference in months between date `a` and date `b`
 * @param a
 * @param b
 * @returns {number}
 */ var diffInMonths = function diffInMonths(a, b) {
        var wholeMonthDiff = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
        var anchor = addMonths(clone$1(a), wholeMonthDiff);
        var anchor2 = void 0;
        var adjust = void 0;
        if (b - anchor < 0) {
            anchor2 = addMonths(clone$1(a), wholeMonthDiff - 1);
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = addMonths(clone$1(a), wholeMonthDiff + 1);
            adjust = (b - anchor) / (anchor2 - anchor);
        }
        return -(wholeMonthDiff + adjust);
    };
    /**
 * Destroyer
 * @param state
 */ var destroyer = function(state) {
        return {
            destroy: function destroy() {
                state.destroyed = true;
                if (state.frame) cancelAnimationFrame(state.frame);
                if (state.styleObserver) state.styleObserver.disconnect();
                if (state.didResizeWindow) window.removeEventListener('resize', state.didResizeWindow);
                if (state.root && state.root.parentNode) state.root.parentNode.removeChild(state.root);
            }
        };
    };
    /**
 * Rooter
 * @param state
 * @param root
 * @param name
 */ var rooter = function(state) {
        var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.createElement('span');
        var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        state.root = root;
        state.aligned = null;
        state.destroyed = false;
        if (root && name) {
            state.root.classList.add('tick-' + name);
            state.root.setAttribute('data-view', name);
        }
        if (root && root.dataset.layout) state.align = (root.dataset.layout.match(/left|right|center/) || [])[0] || 'left';
        return {
            appendTo: function appendTo(element) {
                var location = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'last';
                // if no root or already attached -> exit
                if (!state.root || state.root && state.root.parentNode) return;
                if (location === 'last') {
                    // place before last text node if found
                    if (element.childNodes.length && element.childNodes[element.childNodes.length - 1].nodeType === Node.TEXT_NODE) element.insertBefore(state.root, element.childNodes[element.childNodes.length - 1]);
                    else // else just append
                    element.appendChild(state.root);
                    return;
                }
                if (location === 'first') {
                    // no elements and no text
                    if (element.childNodes.length === 0) element.appendChild(state.root);
                    else if (element.children.length === 0 && element.childNodes.length) element.insertBefore(state.root, element.childNodes[element.childNodes.length - 1]);
                    else element.insertBefore(state.root, element.children[0]);
                }
                if (typeof location !== 'string') element.insertBefore(state.root, location);
            }
        };
    };
    /**
 * Grouper
 * @param state
 * @param definition
 */ var grouper = function(state, definition) {
        state.definition = definition;
        return {
            setDefinition: function setDefinition(definition) {
                state.definition = definition;
            }
        };
    };
    /**
 * Drawer
 * @param state
 * @param draw
 * @param present
 * @param drawViews
 */ var drawer = function(state, _draw, drawViews, present) {
        return {
            draw: function draw() {
                // not dirty, might need to draw subviews
                if (!state.dirty) {
                    if (drawViews) {
                        // draw sub views
                        var redrawn = drawViews(state);
                        if (redrawn) // let's fit it! (if necessary)
                        fit(state);
                    }
                    return false;
                }
                // draw everything
                _draw(state, present);
                // let's fit this view (if necessary)
                fit(state);
                // no longer dirty
                state.dirty = false;
                return true;
            }
        };
    };
    var fit = function fit(state) {
        if (!state.fit) {
            // nope
            if (!state.root || !(state.root.getAttribute('data-layout') || '').match(/fit/)) {
                state.fit = false;
                return;
            }
            // create fit info object
            var style = window.getComputedStyle(state.root, null);
            state.fit = true;
            state.fitInfo = {
                currentFontSize: parseInt(style.getPropertyValue('font-size'), 10)
            };
        }
        // get available width from parent node
        state.fitInfo.availableWidth = state.root.parentNode.clientWidth;
        // the space our target element uses
        state.fitInfo.currentWidth = state.root.scrollWidth;
        // let's calculate the new font size
        var newFontSize = Math.min(Math.max(4, state.fitInfo.availableWidth / state.fitInfo.currentWidth * state.fitInfo.currentFontSize), 1024);
        // size has not changed enough?
        var dist = Math.abs(newFontSize - state.fitInfo.currentFontSize);
        // prevents flickering on firefox / safari / ie by not redrawing tiny font size changes
        if (dist <= 1) return;
        state.fitInfo.currentFontSize = newFontSize;
        state.root.style.fontSize = state.fitInfo.currentFontSize + 'px';
        // redraw once more to quickly create better fit
        if (state.fitInfo.currentWidth / state.fitInfo.availableWidth < 0.5) requestAnimationFrame(function() {
            return fit(state);
        });
    };
    var updater = function(state) {
        state.dirty = true;
        state.value = null;
        state.valueUpdateCount = 0;
        state.isInitialValue = function() {
            return state.valueUpdateCount <= 1;
        };
        return {
            reset: function reset() {
                state.dirty = true;
                state.value = null;
                state.valueUpdateCount = 0;
            },
            update: function update(value) {
                // don't update on same value
                if (equal(state.value, value)) return;
                state.value = value;
                state.valueUpdateCount++;
                state.dirty = true;
            }
        };
    };
    /**
 * Resizer
 * @param state
 */ var resizer = function(state) {
        state.didResizeWindow = function() {
            state.dirty = true;
        };
        window.addEventListener('resize', state.didResizeWindow);
    };
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    var asyncGenerator = function() {
        function AwaitValue(value) {
            this.value = value;
        }
        function AsyncGenerator(gen) {
            var front, back;
            function send(key, arg) {
                return new Promise(function(resolve, reject) {
                    var request = {
                        key: key,
                        arg: arg,
                        resolve: resolve,
                        reject: reject,
                        next: null
                    };
                    if (back) back = back.next = request;
                    else {
                        front = back = request;
                        resume(key, arg);
                    }
                });
            }
            function resume(key, arg) {
                try {
                    var result = gen[key](arg);
                    var value = result.value;
                    if (value instanceof AwaitValue) Promise.resolve(value.value).then(function(arg) {
                        resume("next", arg);
                    }, function(arg) {
                        resume("throw", arg);
                    });
                    else settle(result.done ? "return" : "normal", result.value);
                } catch (err) {
                    settle("throw", err);
                }
            }
            function settle(type, value) {
                switch(type){
                    case "return":
                        front.resolve({
                            value: value,
                            done: true
                        });
                        break;
                    case "throw":
                        front.reject(value);
                        break;
                    default:
                        front.resolve({
                            value: value,
                            done: false
                        });
                        break;
                }
                front = front.next;
                if (front) resume(front.key, front.arg);
                else back = null;
            }
            this._invoke = send;
            if (typeof gen.return !== "function") this.return = undefined;
        }
        if (typeof Symbol === "function" && Symbol.asyncIterator) AsyncGenerator.prototype[Symbol.asyncIterator] = function() {
            return this;
        };
        AsyncGenerator.prototype.next = function(arg) {
            return this._invoke("next", arg);
        };
        AsyncGenerator.prototype.throw = function(arg) {
            return this._invoke("throw", arg);
        };
        AsyncGenerator.prototype.return = function(arg) {
            return this._invoke("return", arg);
        };
        return {
            wrap: function(fn) {
                return function() {
                    return new AsyncGenerator(fn.apply(this, arguments));
                };
            },
            await: function(value) {
                return new AwaitValue(value);
            }
        };
    }();
    var classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    };
    var createClass = function() {
        function defineProperties(target, props) {
            for(var i = 0; i < props.length; i++){
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    var _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    var toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
            for(var i = 0, arr2 = Array(arr.length); i < arr.length; i++)arr2[i] = arr[i];
            return arr2;
        } else return Array.from(arr);
    };
    var draw = function draw(state, present) {
        var views = (state.definition || []).concat();
        if (state.align === 'right') views.reverse();
        var value = Array.isArray(state.value) ? state.value.concat() : _typeof(state.value) === 'object' ? clone(state.value) : state.value;
        views.forEach(function(view) {
            if (!view.presenter) {
                state.update = present(view);
                if (!view.presenter) return;
                view.presenter.appendTo(state.root);
            }
        });
        views.filter(function(view) {
            return view.presenter !== undefined;
        }).forEach(function(view) {
            if (Array.isArray(value) && state.valueMapping) // if set to indexes divide values over views, else (must be "none") just pass array
            state.update(view, state.valueMapping === 'indexes' ? state.align === 'right' ? value.pop() : value.shift() : value);
            else if (view.key && value[view.key] !== undefined) // view expects a key so value should be object
            state.update(view, value[view.key]);
            else // just pass on value to all sub views
            state.update(view, value);
        });
        state.views = views;
        // also draw subviews
        drawViews(state);
    };
    var drawViews = function drawViews(state) {
        var redrawn = false;
        state.views.filter(function(view) {
            return view.presenter !== undefined;
        }).forEach(function(view) {
            if (view.presenter.draw()) redrawn = true;
        });
        return redrawn;
    };
    var createRoot = function(root, definition, present) {
        var state = {
            valueMapping: null // "none" or "indexes"
        };
        if (root && root.dataset.valueMapping) {
            var allowed = [
                'none',
                'indexes'
            ];
            var mapping = root.dataset.valueMapping;
            state.valueMapping = allowed.indexOf(mapping) !== -1 ? mapping : null;
        }
        return Object.assign({}, rooter(state, root), resizer(state), updater(state), grouper(state, definition), drawer(state, draw, drawViews, present), destroyer(state));
    };
    var draw$1 = function draw(state, present, ready) {
        // if value is not in form of array force to array
        var value = copyArray(Array.isArray(state.value) ? state.value : (state.value + '').split(''));
        // if we're aligned to the right we will append items differently so view updating is less jumpy
        if (state.align === 'right') value.reverse();
        // clean up presenters if too much presenters
        if (state.definitions.length > value.length) while(state.definitions.length > value.length){
            var def = state.definitions.pop();
            def.presenter.destroy();
        }
        // setup presenters
        value.forEach(function(value, index) {
            var def = state.definitions[index];
            if (!def) {
                def = state.definitions[index] = cloneDefinition(state.definition);
                state.update = present(def);
                def.presenter.appendTo(state.root, state.align === 'right' ? 'first' : 'last');
            }
        });
        // let's update all subs (possibly sets dirty flag)
        value.forEach(function(value, index) {
            return state.update(state.definitions[index], value);
        });
        state.views = value;
        // also draw subviews
        drawViews$1(state);
    };
    var drawViews$1 = function drawViews(state) {
        var redrawn = false;
        state.views.forEach(function(view, index) {
            if (state.definitions[index].presenter.draw()) redrawn = true;
        });
        return redrawn;
    };
    var createRepeater = function(root, definition, present) {
        var state = {
            definitions: []
        };
        return Object.assign({}, rooter(state, root), updater(state), grouper(state, definition), drawer(state, draw$1, drawViews$1, present), destroyer(state));
    };
    var VENDOR_PREFIX = typeof document === 'undefined' ? null : function() {
        var VENDORS = [
            'webkit',
            'Moz',
            'ms',
            'O'
        ];
        var i = 0;
        var l = VENDORS.length;
        var transform = void 0;
        var elementStyle = document.createElement('div').style;
        for(; i < l; i++){
            transform = VENDORS[i] + 'Transform';
            if (transform in elementStyle) return VENDORS[i];
        }
        return null;
    }();
    var text = function text(node, value) {
        var textNode = node.childNodes[0];
        if (!textNode) {
            textNode = document.createTextNode(value);
            node.appendChild(textNode);
        } else if (value !== textNode.nodeValue) textNode.nodeValue = value;
    };
    var create$1 = function create(name, className) {
        var el = document.createElement(name);
        if (className) el.className = className;
        return el;
    };
    var observeAttributes = function observeAttributes(element, attributes, cb) {
        var observer = new MutationObserver(function(mutations) {
            attributes.forEach(function(attr) {
                if (mutations.filter(function(mutation) {
                    return attributes.includes(mutation.attributeName);
                }).length) cb(element.getAttribute(attr));
            });
        });
        observer.observe(element, {
            attributes: true
        });
        return observer;
    };
    var isHTMLElement = function isHTMLElement(value) {
        return value instanceof HTMLElement;
    };
    /**
 * Element Transform Origin
 * @param element
 * @param value
 */ var setTransformOrigin = function setTransformOrigin(element, value) {
        element.style.transformOrigin = value;
    };
    /**
 * Element Transforms
 * @param element
 * @param name
 * @param value
 * @param unit
 */ var setTransform = function setTransform(element, name, value) {
        var unit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
        if (!element.transforms) element.transforms = [];
        var t = element.transforms.find(function(t) {
            return t.name === name;
        });
        if (t) t.value = value;
        else element.transforms.push({
            name: name,
            value: value,
            unit: unit
        });
        setTransformStyle(element, element.transforms);
    };
    var setTransformStyle = function setTransformStyle(element, transforms) {
        element.style.transform = transforms.map(function(t) {
            return t.name + '(' + t.value + t.unit + ')';
        }).join(' ');
    };
    var isVisible = function isVisible(element) {
        var elementRect = element.getBoundingClientRect();
        // is above top of the page
        if (elementRect.bottom < 0) return false;
        // is below bottom of page
        if (elementRect.top > window.scrollY + window.innerHeight) return false;
        return true;
    };
    /**
 * @param value { * }
 */ var toBoolean$1 = function toBoolean(value) {
        return typeof value === 'string' ? value === 'true' : value;
    };
    /**
 * @param string { string }
 */ var capitalizeFirstLetter$1 = function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    /**
 * @param string { string }
 */ var trim$1 = function trim(string) {
        return string.trim();
    };
    var CACHE = {};
    var cache = function(value, fn) {
        var fns = fn.toString();
        if (!CACHE[fns]) CACHE[fns] = {};
        if (!CACHE[fns][value]) CACHE[fns][value] = fn(value);
        return CACHE[fns][value];
    };
    var isInt = new RegExp("^[0-9]+$");
    var isBoolean$1 = new RegExp("^(true|false)$");
    var isFloat = new RegExp("^[0-9.]+$");
    var isColor = new RegExp("color");
    var isShadow = new RegExp("shadow");
    var isGradient = new RegExp("^(follow-gradient|horizontal-gradient|vertical-gradient)");
    var isDuration = new RegExp("^[.0-9]+(?:ms|s){1}$");
    var isTransition = new RegExp("^transition-?(?:in|out)?$");
    var isURL = new RegExp("^url\\(");
    var toDuration = function toDuration(string) {
        return string ? parseFloat(string) * (/ms$/.test(string) ? 1 : 1000) : 0;
    };
    var toTransition = function toTransition(string) {
        return string.match(/[a-z]+(?:\(.*?\))?\s?(?:origin\(.*?\))?\s?(?:[a-z]+\(.*?\))?[ .a-z-0-9]*/g).map(toTransitionPartial);
    };
    var toTransitionPartial = function toTransitionPartial(string) {
        var parts = string.match(/([a-z]+(?:\(.*?\))?)\s?(?:origin\((.*?)\))?\s?([a-z]+(?:\(.*?\))?)?\s?(?:([.0-9ms]+)?\s?(?:(ease-[a-z-]+))?\s?([.0-9ms]+)?)?/);
        // get transition function definition
        var fn = toFunctionOutline(parts[1]);
        // get duration and easing
        var origin = undefined;
        var duration = undefined;
        var ease = undefined;
        var delay = undefined;
        var resolver = undefined;
        // skip function and figure out what other parts are
        parts.slice(2).filter(function(part) {
            return typeof part !== "undefined";
        }).forEach(function(part) {
            // is either duration or delay
            if (isDuration.test(part)) {
                if (typeof duration === "undefined") duration = toDuration(part);
                else delay = toDuration(part);
            } else if (/ /.test(part)) origin = part;
            else if (/^ease-[a-z-]+$/.test(part)) ease = part;
            else if (/^[a-z]+/.test(part)) resolver = toFunctionOutline(part);
        });
        // reset easing and duration when transform is defined, these settings don't work together
        if (resolver) {
            duration = undefined;
            ease = undefined;
        }
        // return transition object
        return {
            name: fn.name,
            parameters: fn.parameters,
            duration: duration,
            ease: ease,
            delay: delay,
            origin: origin,
            resolver: resolver
        };
    };
    /**
 * toGradient
 * @param string { string } - string should be in format <type>(color, color)
 * @returns { {type: *, colors: *} }
 */ var toGradient = function toGradient(string) {
        var type = string.match(/follow-gradient|horizontal-gradient|vertical-gradient/)[0];
        var colors = string.substring(type.length).match(/(?:transparent|rgb\(.*?\)|hsl\(.*?\)|hsla\(.*?\)|rgba\(.*?\)|[a-z]+|#[abcdefABCDEF\d]+)\s?(?:[\d]{1,3}%?)?/g).map(toGradientColor);
        return {
            type: type,
            colors: colors
        };
    };
    var gradientOffsetRegex = /\s([\d]{1,3})%?$/;
    var toGradientColor = function toGradientColor(string) {
        var offset = string.match(gradientOffsetRegex);
        return {
            offset: offset ? parseFloat(offset[1]) / 100 : null,
            value: toColor(string.replace(gradientOffsetRegex, ""))
        };
    };
    /**
 * Returns the pixels amount for the given value
 */ var pipetteCache = [];
    var getPipette = function getPipette(id, root) {
        if (!pipetteCache[id]) return null;
        return pipetteCache[id].find(function(p) {
            return p.node.parentNode === root;
        });
    };
    var setPipette = function setPipette(id, pipette) {
        if (!pipetteCache[id]) pipetteCache[id] = [];
        pipetteCache[id].push(pipette);
    };
    var toPixels = typeof document === "undefined" ? function(value) {
        return 0;
    } : function(value) {
        var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
        var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        if (value == 0) return 0;
        if (id) {
            var _pipette = getPipette(id, root) || {};
            if (!_pipette.node) {
                _pipette.node = document.createElement("span");
                _pipette.node.style.cssText = "position:absolute;padding:0;visibility:hidden;";
                root.appendChild(_pipette.node);
            }
            // update value
            _pipette.node.style.marginTop = value;
            // compute style for first time
            if (!_pipette.style) _pipette.style = window.getComputedStyle(_pipette.node);
            setPipette(id, _pipette);
            return parseInt(_pipette.style.marginTop, 10);
        }
        // old method
        var pipette = document.createElement("span");
        pipette.style.cssText = "position:absolute;padding:0;visibility:hidden;margin-top:" + value;
        root.appendChild(pipette);
        requestAnimationFrame(function() {
            pipette.parentNode.removeChild(pipette);
        });
        return parseInt(window.getComputedStyle(pipette).marginTop, 10);
    };
    /**
 * @param string { string } - any valid CSS color value
 * @returns { string }
 */ var toColor = typeof document === "undefined" ? function(string) {
        return string;
    } : function(string) {
        if (string === "transparent") return "rgba(0,0,0,0)";
        var pipette = document.createElement("span");
        pipette.style.cssText = "position:absolute;visibility:hidden;color:" + string;
        document.body.appendChild(pipette);
        requestAnimationFrame(function() {
            pipette.parentNode.removeChild(pipette);
        });
        return window.getComputedStyle(pipette).getPropertyValue("color");
    };
    var toShadow = function toShadow(style) {
        if (typeof style !== "string") return style;
        return style.match(/([-.\d]+(?:%|ms|s|deg|cm|em|ch|ex|q|in|mm|pc|pt|px|vh|vw|vmin|vmax)?)|[%#A-Za-z0-9,.()]+/g);
    };
    var toURL = function toURL(style) {
        var urls = style.match(/url\((.*?)\)/g).map(function(url) {
            return url.substring(4, url.length - 1);
        });
        return urls.length === 1 ? urls[0] : urls;
    };
    var toStyleProperty = function toStyleProperty(key) {
        return key.trim().split("-").map(function(key, index) {
            return index > 0 ? capitalizeFirstLetter$1(key) : key;
        }).join("");
    };
    var toStyleValue = function toStyleValue(value, property) {
        if (isBoolean$1.test(value)) return toBoolean$1(value);
        if (isInt.test(value)) return parseInt(value, 10);
        if (isFloat.test(value)) return parseFloat(value);
        if (isURL.test(value)) return toURL(value);
        if (isColor.test(property)) {
            if (isGradient.test(value)) return cache(value, toGradient);
            return cache(value, toColor);
        }
        if (isShadow.test(property)) return cache(value, toShadow);
        if (isTransition.test(property)) {
            if (value === "none") return value;
            return cache(value, toTransition);
        }
        return value;
    };
    var toStyle = function toStyle(string) {
        var parts = string.split(":").map(trim$1);
        var property = toStyleProperty(parts[0]);
        var value = toStyleValue(parts[1], parts[0]);
        if (!property || value === null || typeof value === "undefined") return null;
        return {
            property: property,
            value: value
        };
    };
    var toStyles = function toStyles(string) {
        return string.split(";")// remove empty values
        .filter(function(style) {
            return style.trim().length;
        })// turn into objects
        .map(toStyle)// remove invalid styles
        .filter(function(style) {
            return style !== null;
        })// create styles object
        .reduce(function(styles, style) {
            styles[style.property] = style.value;
            return styles;
        }, {});
    };
    // https://gist.github.com/gre/1650294
    // http://easings.net/
    // https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
    // http://gizma.com/easing/
    var easeLinear = function easeLinear(t) {
        return t;
    };
    var easeInSine = function easeInSine(t) {
        return -1 * Math.cos(t * (Math.PI / 2)) + 1;
    };
    var easeOutSine = function easeOutSine(t) {
        return Math.sin(t * (Math.PI / 2));
    };
    var easeInOutSine = function easeInOutSine(t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    };
    var easeInQuad = function easeInQuad(t) {
        return t * t;
    };
    var easeOutQuad = function easeOutQuad(t) {
        return t * (2 - t);
    };
    var easeInOutQuad = function easeInOutQuad(t) {
        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };
    var easeInCubic = function easeInCubic(t) {
        return t * t * t;
    };
    var easeOutCubic = function easeOutCubic(t) {
        var t1 = t - 1;
        return t1 * t1 * t1 + 1;
    };
    var easeInOutCubic = function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    var easeInQuart = function easeInQuart(t) {
        return t * t * t * t;
    };
    var easeOutQuart = function easeOutQuart(t) {
        return 1 - --t * t * t * t;
    };
    var easeInOutQuart = function easeInOutQuart(t) {
        return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    };
    var easeInExpo = function easeInExpo(t) {
        if (t === 0) return 0;
        return Math.pow(2, 10 * (t - 1));
    };
    var easeOutExpo = function easeOutExpo(t) {
        if (t === 1) return 1;
        return -Math.pow(2, -10 * t) + 1;
    };
    var easeInOutExpo = function easeInOutExpo(t) {
        if (t === 0 || t === 1) return t;
        var scaledTime = t * 2;
        var scaledTime1 = scaledTime - 1;
        if (scaledTime < 1) return 0.5 * Math.pow(2, 10 * scaledTime1);
        return 0.5 * (-Math.pow(2, -10 * scaledTime1) + 2);
    };
    var easeInCirc = function easeInCirc(t) {
        var scaledTime = t / 1;
        return -1 * (Math.sqrt(1 - scaledTime * t) - 1);
    };
    var easeOutCirc = function easeOutCirc(t) {
        var t1 = t - 1;
        return Math.sqrt(1 - t1 * t1);
    };
    var easeInOutCirc = function easeInOutCirc(t) {
        var scaledTime = t * 2;
        var scaledTime1 = scaledTime - 2;
        if (scaledTime < 1) return -0.5 * (Math.sqrt(1 - scaledTime * scaledTime) - 1);
        return 0.5 * (Math.sqrt(1 - scaledTime1 * scaledTime1) + 1);
    };
    var easeInBack = function easeInBack(t) {
        var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.70158;
        var scaledTime = t / 1;
        return scaledTime * scaledTime * ((magnitude + 1) * scaledTime - magnitude);
    };
    var easeOutBack = function easeOutBack(t) {
        var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.70158;
        var scaledTime = t / 1 - 1;
        return scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1;
    };
    var easeInOutBack = function easeInOutBack(t) {
        var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.70158;
        var scaledTime = t * 2;
        var scaledTime2 = scaledTime - 2;
        var s = magnitude * 1.525;
        if (scaledTime < 1) return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
        return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2);
    };
    var easeOutElastic = function easeOutElastic(t) {
        var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.7;
        var p = 1 - magnitude;
        var scaledTime = t * 2;
        if (t === 0 || t === 1) return t;
        var s = p / (2 * Math.PI) * Math.asin(1);
        return Math.pow(2, -10 * scaledTime) * Math.sin((scaledTime - s) * (2 * Math.PI) / p) + 1;
    };
    var easeOutBounce = function easeOutBounce(t) {
        var scaledTime = t / 1;
        if (scaledTime < 1 / 2.75) return 7.5625 * scaledTime * scaledTime;
        else if (scaledTime < 2 / 2.75) {
            var scaledTime2 = scaledTime - 1.5 / 2.75;
            return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
        } else if (scaledTime < 2.5 / 2.75) {
            var _scaledTime = scaledTime - 2.25 / 2.75;
            return 7.5625 * _scaledTime * _scaledTime + 0.9375;
        } else {
            var _scaledTime2 = scaledTime - 2.625 / 2.75;
            return 7.5625 * _scaledTime2 * _scaledTime2 + 0.984375;
        }
    };
    var EasingFunctions = {
        'ease-linear': easeLinear,
        'ease-in-sine': easeInSine,
        'ease-out-sine': easeOutSine,
        'ease-in-out-sine': easeInOutSine,
        'ease-in-cubic': easeInCubic,
        'ease-out-cubic': easeOutCubic,
        'ease-in-out-cubic': easeInOutCubic,
        'ease-in-circ': easeInCirc,
        'ease-out-circ': easeOutCirc,
        'ease-in-out-circ': easeInOutCirc,
        'ease-in-quad': easeInQuad,
        'ease-out-quad': easeOutQuad,
        'ease-in-out-quad': easeInOutQuad,
        'ease-in-quart': easeInQuart,
        'ease-out-quart': easeOutQuart,
        'ease-in-out-quart': easeInOutQuart,
        'ease-in-expo': easeInExpo,
        'ease-out-expo': easeOutExpo,
        'ease-in-out-expo': easeInOutExpo,
        'ease-in-back': easeInBack,
        'ease-out-back': easeOutBack,
        'ease-in-out-back': easeInOutBack,
        'ease-out-elastic': easeOutElastic,
        'ease-out-bounce': easeOutBounce
    };
    addExtensions(ExtensionType.EASING_FUNCTION, EasingFunctions);
    /**
 * animate a certain amount of time (between 0 and 1)
 * @param cb - update function
 * @param complete
 * @param duration - duration in milliseconds
 * @param ease - easing function
 * @param delay
 */ var animate = function animate(cb, complete) {
        var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
        var ease = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : easeLinear;
        var delay = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        return interpolate(function(t) {
            cb(ease(t));
        }, complete, duration, delay);
    };
    /**
 * interpolate between 0 and 1 over x amount of frames
 * @param update - update function
 * @param complete
 * @param duration - duration in milliseconds
 * @param delay - milliseconds to wait before starting
 */ var interpolate = function interpolate(update) {
        var complete = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
        var delay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        // no update function supplied -> exit
        if (!update) return null;
        // set start time
        var start = null;
        var t = void 0;
        var frame = null;
        // animation loop
        var tick = function tick(ts) {
            if (start === null) start = ts;
            t = ts - start - delay;
            if (t < duration) {
                update(t >= 0 ? t / duration : 0);
                frame = requestAnimationFrame(tick);
                return null;
            }
            update(1);
            if (complete) complete();
        };
        tick(now());
        // return cancel function
        return function() {
            cancelAnimationFrame(frame);
        };
    };
    /**
 * Translates movements values
 */ var translator = function translator() {
        var fps = 24;
        var interval = 1000 / fps;
        var frame = null;
        var state = {
            velocity: 0,
            origin: 0,
            position: 0,
            destination: 1
        };
        var cancel = function cancel() {
            cancelAnimationFrame(frame);
        };
        var translate = function translate(cb, from, to, update) {
            // cancel previous animations if are running
            cancel();
            // 'to' not supplied, so 'from' is destination
            if (to === null) state.destination = from;
            else {
                // both supplied, also reset velocity
                state.position = from;
                state.destination = to;
                state.velocity = 0;
            }
            // always set origin to current position
            state.origin = state.position;
            var last = null;
            var tick = function tick(ts) {
                // queue next tick
                frame = requestAnimationFrame(tick);
                // limit fps
                if (!last) last = ts;
                var delta = ts - last;
                if (delta <= interval) // skip frame
                return;
                // align next frame
                last = ts - delta % interval;
                update(state, cancel);
                cb(state.position);
            };
            tick(now());
        };
        return {
            getPosition: function getPosition() {
                return state.position;
            },
            cancel: cancel,
            translate: translate
        };
    };
    /**
 * Translator builder
 * @param type
 * @param options
 * @returns {*}
 */ var createTranslator = function createTranslator(type) {
        for(var _len = arguments.length, options = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++)options[_key - 1] = arguments[_key];
        var t = translator();
        var updater = {
            update: null,
            cancel: t.cancel,
            getPosition: t.getPosition
        };
        if (type === 'arrive') updater.update = arrive.apply(undefined, [
            t.translate
        ].concat(options));
        else if (type === 'spring') updater.update = spring.apply(undefined, [
            t.translate
        ].concat(options));
        else if (type === 'step') updater.update = step.apply(undefined, [
            t.translate
        ].concat(options));
        return updater;
    };
    /**
 * Arrive at destination
 * @param update
 * @param maxVelocity
 * @param friction
 */ var arrive = function arrive(update) {
        var maxVelocity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var friction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.01;
        return function(cb) {
            var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            update(cb, from, to, function(state, cancel) {
                // distance to target
                var distance = state.destination - state.position;
                var halfway = state.origin + (state.destination - state.origin) * 0.5;
                // update velocity based on distance
                state.velocity += (-(halfway - state.origin) + distance) * 2 * friction;
                // update position by adding velocity
                state.position += state.velocity < 0 ? Math.max(state.velocity, -maxVelocity) : Math.min(state.velocity, maxVelocity);
                // we've arrived if we're near target and our velocity is near zero
                if (state.origin < state.destination && state.position >= state.destination || state.origin >= state.destination && state.position <= state.destination) {
                    cancel();
                    state.velocity = 0;
                    state.position = state.destination;
                }
            });
        };
    };
    var step = function step(update) {
        var velocity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.01;
        return function(cb) {
            var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            update(cb, from, to, function(state, cancel) {
                // update velocity based on distance
                state.velocity = velocity;
                // update position by adding velocity
                state.position += state.velocity;
                // we've arrived if we're near target and our velocity is near zero
                if (state.origin < state.destination && state.position >= state.destination || state.origin >= state.destination && state.position <= state.destination) {
                    cancel();
                    state.velocity = 0;
                    state.position = state.destination;
                }
            });
        };
    };
    /**
 * Animate movement based no spring physics
 * @param update
 * @param stiffness - the higher the more intense the vibration
 * @param damping - a factor that slows down the calculated velocity by a percentage, needs to be less than 1
 * @param mass - the higher the slower the spring springs in action
 * @returns {function(*=, *=)}
 */ var spring = function spring(update) {
        var stiffness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
        var damping = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.75;
        var mass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
        return function(cb) {
            var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            update(cb, from, to, function(state, cancel) {
                // calculate spring force
                var f = -(state.position - state.destination) * stiffness;
                // update velocity by adding force based on mass
                state.velocity += f / mass;
                // update position by adding velocity
                state.position += state.velocity;
                // slow down based on amount of damping
                state.velocity *= damping;
                // we've arrived if we're near target and our velocity is near zero
                if (thereYet(state.position, state.destination, state.velocity)) {
                    cancel();
                    state.position = state.destination;
                    state.velocity = 0;
                }
            });
        };
    };
    var thereYet = function thereYet(position, destination, velocity) {
        var errorMargin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.001;
        return Math.abs(position - destination) < errorMargin && Math.abs(velocity) < errorMargin;
    };
    /**
 * Returns a function that applies the transitions to the given element
 * @param transitions
 * @returns {function(*)}
 */ var createTransitioner = function createTransitioner(transitions) {
        var transitioners = transitions.map(function(t) {
            return createDurationTransitioner(createTransition(t.name, t.parameters, t.ease), t.origin, t.duration, t.delay);
        });
        return function(element, direction, complete) {
            // don't run animations when no element is supplied
            if (!isHTMLElement(element)) return false;
            var count = transitioners.length;
            transitioners.forEach(function(transitioner) {
                transitioner(element, direction, function() {
                    count--;
                    if (!count && complete) complete(element);
                });
            });
        };
    };
    var createTransition = function createTransition(name, parameters, ease) {
        var easing = ease ? getExtension(ExtensionType.EASING_FUNCTION, ease) : ease;
        var transition = getExtension(ExtensionType.TRANSITION, name);
        return function(element, direction, p) {
            transition.apply(undefined, [
                element,
                p,
                direction,
                easing
            ].concat(toConsumableArray(parameters)));
        };
    };
    var createDurationTransitioner = function createDurationTransitioner(transition) {
        var origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '50% 50% 0';
        var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
        var delay = arguments[3];
        return function(element) {
            var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var complete = arguments[2];
            // set transform origin
            setTransformOrigin(element, origin);
            // run animation
            interpolate(function(p) {
                transition(element, direction, p);
            }, complete, duration, delay);
        };
    };
    var getComposedTransitionActs = function getComposedTransitionActs(transition) {
        return getExtension(ExtensionType.TRANSITION, transition.name).apply(undefined, toConsumableArray(transition.parameters || []));
    };
    /**
 * Styler
 * @param state
 * @param base
 */ var styler = function(state) {
        var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // styles that were last applied to the element
        state.lastAppliedStyles = null;
        // set default style
        updateStyles(state, base, state.root.dataset.style);
        // setup observer, will observe style attribute so can restyle when changed
        state.styleObserver = observeAttributes(state.root, [
            'data-style'
        ], function(string) {
            updateStyles(state, base, string);
        });
        // adds style setter
        return {
            setStyle: function setStyle(css) {
                updateStyles(state, base, css);
            }
        };
    };
    var updateStyles = function updateStyles(state, base, css) {
        // don't update if is same
        if (state.lastAppliedStyles === css) return;
        // remember these styles
        state.lastAppliedStyles = css;
        state.style = css ? mergeObjects(base, toStyles(css)) : base;
        var intro = [];
        var outro = [];
        if (state.style.transitionIn && state.style.transitionIn.length) {
            intro = state.style.transitionIn;
            outro = state.style.transitionOut;
        } else if (state.style.transition && state.style.transition !== 'none') state.style.transition.forEach(function(transition) {
            var acts = getComposedTransitionActs(transition);
            intro = intro.concat(acts.intro);
            outro = outro.concat(acts.outro);
        });
        if (intro && outro) {
            state.transitionIn = createTransitioner(intro);
            state.transitionOut = createTransitioner(outro);
            state.skipToTransitionInEnd = createTransitioner(intro.map(clearTiming));
            state.skipToTransitionOutEnd = createTransitioner(outro.map(clearTiming));
        }
        state.dirty = true;
    };
    var clearTiming = function clearTiming(t) {
        var tn = clone(t);
        tn.duration = 0;
        tn.delay = 0;
        return tn;
    };
    var getBackingStoreRatio = function getBackingStoreRatio(ctx) {
        return ctx[VENDOR_PREFIX + 'BackingStorePixelRatio'] || ctx.backingStorePixelRatio || 1;
    };
    var getDevicePixelRatio = function getDevicePixelRatio() {
        return window.devicePixelRatio || 1;
    };
    var clearCanvas = function clearCanvas(canvas) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    /**
 * View Composers
 */ /**
 * API Utilities
 */ /**
 * Add default text view
 */ var Views = {
        'text': function text$$1() {
            return function(root) {
                var state = {};
                var draw = function draw(state) {
                    state.root.setAttribute('data-value', state.value);
                    text(state.root, state.value);
                };
                return Object.assign({}, rooter(state, root, 'text'), updater(state), drawer(state, draw), destroyer(state));
            };
        }
    };
    addExtensions(ExtensionType.VIEW, Views);
    /**
 * Internal API for use by views
 */ var API$2 = function API() {
        return {
            Extension: {
                Type: ExtensionType,
                getExtension: getExtension
            },
            Utils: {
                toPixels: toPixels,
                toColor: toColor
            },
            Canvas: {
                clear: clearCanvas,
                getDevicePixelRatio: getDevicePixelRatio,
                getBackingStoreRatio: getBackingStoreRatio
            },
            DOM: {
                visible: isVisible,
                create: create$1,
                transform: setTransform
            },
            Animation: {
                animate: animate
            },
            Data: {
                request: request
            },
            Date: {
                performance: now
            },
            View: {
                rooter: rooter,
                drawer: drawer,
                updater: updater,
                styler: styler,
                grouper: grouper,
                resizer: resizer,
                destroyer: destroyer
            }
        };
    };
    /**
 * Base view definitions
 */ var createPresenterRoot = function createPresenterRoot(root, definition, presentDefinition) {
        return createRoot(root, definition, presentDefinition);
    };
    var createPresenterRepeater = function createPresenterRepeater(root, definition, presentDefinition) {
        return createRepeater(root, definition, presentDefinition);
    };
    var createPresenterView = function createPresenterView(name, root, style) {
        var view = getExtension(ExtensionType.VIEW, name);
        return view ? view(API$2())(root, style) : null;
    };
    var arrow = function arrow(str, i) {
        return str[i] === '-' && str[i + 1] === '>';
    };
    var string = function string(c) {
        return c === "'" || c === '"';
    };
    var comma = function comma(c) {
        return c === ',';
    };
    var opener = function opener(c) {
        return c === '(';
    };
    var closer = function closer(c) {
        return c === ')';
    };
    var value = function value(v) {
        return v.trim().length !== 0;
    };
    var add = function add(r, v) {
        return r.push(v.trim());
    };
    var token = function token(r, v) {
        if (value(v)) {
            add(r, v);
            return '';
        }
        return v;
    };
    var chain = function chain(_chain, output) {
        if (_chain.length) output.push(_chain.length > 1 ? _chain.concat() : _chain[0]);
        return [];
    };
    var parse$1 = function parse(i, str, result) {
        var v = '';
        var fns = [];
        var quote = null;
        var hitArrow = false;
        while(i < str.length){
            // character reference
            var c = str[i];
            // enter level
            if (opener(c)) {
                hitArrow = false;
                var fn = [
                    v.trim()
                ];
                i = parse(i + 1, str, fn);
                c = str[i];
                fns.push(fn);
                v = '';
            } else if (closer(c)) {
                if (hitArrow && v.trim().length) {
                    fns.push([
                        v.trim()
                    ]);
                    v = '';
                    hitArrow = false;
                }
                if (value(v)) add(fns, v);
                fns = chain(fns, result);
                return i + 1;
            } else {
                // we're in a string
                // as long as the exit has not been found add to value
                if (quote !== null && c !== quote) // accept any value
                v += c;
                else if (c === quote) {
                    fns.push(v);
                    v = '';
                    quote = null;
                } else if (string(c)) {
                    v = '';
                    quote = c;
                } else {
                    // we're not in a string
                    // we've found an arrow
                    if (arrow(str, i)) {
                        hitArrow = true;
                        // we might have finished a function without parenthesis
                        if (v.trim().length) {
                            fns.push([
                                v.trim()
                            ]);
                            v = '';
                        }
                        // skip two additional characters because arrow is of length 2
                        i += 2;
                    } else if (comma(c)) {
                        if (hitArrow && v.trim().length) {
                            fns.push([
                                v.trim()
                            ]);
                            v = '';
                            hitArrow = false;
                        }
                        fns = chain(fns, result);
                        // add possible previous token
                        v = token(result, v);
                    } else v += c;
                }
                // next character
                i++;
            }
        }
        if (hitArrow && v.trim().length || !hitArrow && v.trim().length && !fns.length) {
            fns.push([
                v.trim()
            ]);
            v = '';
        }
        chain(fns, result);
        // add final token
        token(result, v);
        return i;
    };
    var parseTransformChain = function parseTransformChain(string) {
        var result = [];
        parse$1(0, string, result);
        return result;
    };
    var isRootDefinition = function isRootDefinition(definition) {
        return definition.children && definition.children.length;
    };
    var cloneDefinition = function cloneDefinition(definition) {
        var clone = {};
        for(var key in definition){
            if (!definition.hasOwnProperty(key)) continue;
            if (key === 'root') {
                clone[key] = definition[key].cloneNode();
                continue;
            }
            if (key === 'children') {
                clone[key] = definition[key] === null ? null : definition[key].map(cloneDefinition);
                continue;
            }
            if (key === 'repeat') {
                clone[key] = definition[key] === null ? null : cloneDefinition(definition[key]);
                continue;
            }
            clone[key] = definition[key];
        }
        clone.presenter = null;
        return clone;
    };
    /**
 * Parsing DOM to DefinitionTree
 * @param nodes
 */ var definitionOutline = {
        root: null,
        key: null,
        view: null,
        overlay: null,
        presenter: null,
        transform: null,
        layout: null,
        style: null,
        repeat: null,
        children: null,
        className: null
    };
    var toPresenterDefinitionTree = function toPresenterDefinitionTree(nodes) {
        return Array.from(nodes)// fix to allow nesting of tick counters
        // .filter(node => !node.classList.contains('tick'))
        .map(function(node) {
            var definition = mergeObjects(definitionOutline, {
                root: node
            });
            // get all properties above from attributes
            for(var key in node.dataset){
                if (!node.dataset.hasOwnProperty(key)) continue;
                if (typeof definition[key] === 'undefined') continue;
                definition[key] = node.dataset[key];
            }
            // if is repeater set do not parse children as children but define as repeat
            if (definition.repeat) {
                // can only have one repeated child
                definition.repeat = toPresenterDefinitionTree(node.children).pop();
                // detach repeated elements from DOM
                Array.from(node.children).forEach(function(node) {
                    node.parentNode.removeChild(node);
                });
            } else if (node.children.length) definition.children = toPresenterDefinitionTree(node.children);
            return definition;
        });
    };
    var createDOMTreeForDefinition = function createDOMTreeForDefinition(definition) {
        return definition.map(function(def) {
            def = mergeObjects(definitionOutline, def);
            if (typeof def.root === 'string') def.root = document.createElement(def.root);
            else def.root = document.createElement('span');
            if (def.transform) def.root.dataset.transform = def.transform;
            if (def.className) def.root.className = def.className;
            if (def.overlay) def.root.dataset.overlay = def.overlay;
            if (def.view) {
                def.root.dataset.view = def.view;
                if (def.style) def.root.dataset.style = def.style;
                def.repeat = null;
            } else {
                if (def.layout) def.root.dataset.layout = def.layout;
                if (def.repeat) {
                    def.root.dataset.repeat = true;
                    def.repeat = createDOMTreeForDefinition(def.children).pop();
                } else if (def.children) {
                    def.children = createDOMTreeForDefinition(def.children);
                    def.children.forEach(function(child) {
                        def.root.appendChild(child.root);
                    });
                }
            }
            return def;
        });
    };
    /**
 * Presenting values
 */ var createPresenterByDefinition = function createPresenterByDefinition(definition, presentDefinition) {
        var presenter = void 0;
        if (definition.repeat) presenter = createPresenterRepeater(definition.root, definition.repeat, presentDefinition);
        else if (typeof definition.view === 'string') presenter = createPresenterView(definition.view, definition.root, definition.style);
        else if (isRootDefinition(definition)) presenter = createPresenterRoot(definition.root, definition.children, presentDefinition);
        return presenter;
    };
    var presentTick = function presentTick(instance) {
        var isDrawing = false;
        var update = function update(definition, value) {
            definition.transform(value, function(output) {
                definition.presenter.update(output);
            }, instance);
            if (!isDrawing) {
                isDrawing = true;
                draw();
            }
        };
        var draw = function draw() {
            instance.baseDefinition.presenter.draw();
            requestAnimationFrame(draw);
        };
        var presentDefinition = function presentDefinition(definition) {
            definition.presenter = createPresenterByDefinition(definition, presentDefinition);
            definition.transform = toTransformComposition(definition.transform, instance);
            return update;
        };
        return presentDefinition(instance.baseDefinition);
    };
    /**
 * Transform
 */ var composeAsync = function composeAsync(instance) {
        for(var _len = arguments.length, funcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++)funcs[_key - 1] = arguments[_key];
        return function(initialValue, callback) {
            function compose(i, value) {
                // return end result
                if (funcs.length <= i) {
                    callback(value);
                    return;
                }
                funcs[i](value, partial(compose, [
                    i + 1
                ]), instance);
            }
            compose(0, initialValue);
        };
    };
    var partial = function partial(fn) {
        var initialArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var ctx = arguments[2];
        return function() {
            var args = Array.from(initialArgs);
            Array.prototype.push.apply(args, arguments);
            return fn.apply(ctx, args);
        };
    };
    var toTransformComposition = function toTransformComposition(string, instance) {
        // no composition
        if (!string) return function(value, cb) {
            return cb(value);
        };
        // already function no need to compose
        if (typeof string === 'function') return string;
        // wrap in default transform
        // if is single transform force parenthesis as it must be a fn
        var result = parseTransformChain('transform(' + (/^[a-z]+$/.test(string) ? string + '()' : string) + ')');
        return compose(result, instance);
    };
    var compose = function compose(chain, instance) {
        var composition = chain.map(function(item) {
            // get name
            var name = item.shift();
            // get related function
            var func = getExtension(ExtensionType.TRANSFORM, name) || function(value, cb, instance) {
                cb(value);
            };
            // other items in array are parameters
            var params = item.map(function(parameter) {
                // if is array turn into function
                if (Array.isArray(parameter)) {
                    // normal transform
                    if (typeof parameter[0] === 'string') return compose([
                        parameter
                    ], instance);
                    // chain of transforms
                    return compose(parameter, instance);
                }
                return toParameter(parameter);
            });
            return func.apply(undefined, toConsumableArray(params));
        });
        return composeAsync.apply(undefined, [
            instance
        ].concat(toConsumableArray(composition)));
    };
    var toFunctionOutline = function toFunctionOutline(string) {
        var name = string.match(/[a-z]+/)[0];
        var parameters = toParameters(string.substring(name.length));
        return {
            name: name,
            parameters: parameters
        };
    };
    var toParameters = function toParameters(string) {
        return (string.match(/('.+?')|(".+?")|(\[.+?])|([.:\-\d\sa-zA-Z]+%?)/g) || []).map(trim).filter(function(str) {
            return str.length;
        }).map(toParameter);
    };
    var trimEdges = function trimEdges(string) {
        return string.substring(1, string.length - 1);
    };
    var isProbablyISODate = /^([\d]{4}-[\d]{1,2}-[\d]{1,2})/;
    var isBoolean = /^(true|false)$/;
    var isString = /^[\a-zA-Z]+$/;
    var isZeroString = /^0[\d]+/;
    var isQuotedString = /^('|")/;
    var isNumber = /^-?(?:\d+)?(?:\.|0\.)?[\d]+$/;
    var isArray = /^(\[)/;
    var toParameter = function toParameter(string) {
        if (isBoolean.test(string)) return string === 'true';
        if (isArray.test(string)) return toParameters(trimEdges(string));
        if (isProbablyISODate.test(string)) return dateFromISO(string);
        if (isQuotedString.test(string)) return trimEdges(string);
        if (isString.test(string) || isZeroString.test(string)) return string;
        if (isNumber.test(string)) return parseFloat(string);
        // is CSS unit (parsing will be handled by function that receives this value)
        return string;
    };
    var toCSSValue = function toCSSValue(value) {
        var parts = (value + '').match(/(-?[.\d]+)(%|ms|s|deg|cm|em|ch|ex|q|in|mm|pc|pt|px|vh|vw|vmin|vmax)?/);
        return {
            value: parseFloat(parts[1]),
            units: parts[2]
        };
    };
    /**
 * @param a { object }
 * @param b { object }
 */ var mergeObjects = function mergeObjects(a) {
        var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var key = void 0;
        var obj = {};
        for(key in a){
            if (!a.hasOwnProperty(key)) continue;
            obj[key] = typeof b[key] === 'undefined' ? a[key] : b[key];
        }
        return obj;
    };
    /**
 * @param string { string }
 */ var toFunctionReference = function toFunctionReference(string) {
        var ref = window;
        var levels = string.split('.');
        levels.forEach(function(level, index) {
            if (!ref[levels[index]]) return;
            ref = ref[levels[index]];
        });
        return ref !== window ? ref : null;
    };
    /**
 *
 */ var toValue = function toValue(string) {
        // capture for object string
        if (/^(?:[\w]+\s?:\s?[\w.]+,\s?)+(?:[\w]+\s?:\s?[\w.]+)$/g.test(string)) return string.match(/(?:(\w+)\s?:\s?([\w.]+))/g).reduce(function(obj, current) {
            var parts = current.split(':');
            obj[parts[0]] = toParameter(parts[1]);
            return obj;
        }, {});
        // handle the other options
        return toParameter(string);
    };
    /**
 * @param value { * }
 */ /**
 * @param value { * }
 */ var toInt = function toInt(value) {
        return parseInt(value, 10);
    };
    /**
 * @param string { string }
 */ var trim = function trim(string) {
        return string.trim();
    };
    /**
 * @param string { string }
export const lowercaseFirstLetter = (string) => string.charAt(0).toLowerCase() + string.slice(1);
 */ /**
 * @param string { string }
 */ var capitalizeFirstLetter = function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    /**
 * @param string { string }
 */ var dashesToCamels = function dashesToCamels(string) {
        return string.replace(/-./g, function(sub) {
            return sub.charAt(1).toUpperCase();
        });
    };
    /**
 * @param string
export const camelsToDashes = string => string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
 */ /**
 * @param obj { object }
 */ var clone = function clone(obj) {
        if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null) return JSON.parse(JSON.stringify(obj));
        return obj;
    };
    var copyArray = function copyArray(arr) {
        return arr.slice();
    };
    var random = function random() {
        var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        return min + Math.random() * (max - min);
    };
    var range = function range(n) {
        var arr = [];
        var i = 0;
        for(; i < n; i++)arr.push(i);
        return arr;
    };
    var shuffle = function shuffle(a) {
        for(var i = a.length; i; i--){
            var j = Math.floor(Math.random() * i);
            var _ref = [
                a[j],
                a[i - 1]
            ];
            a[i - 1] = _ref[0];
            a[j] = _ref[1];
        }
    };
    var now = function now() {
        return window.performance.now();
    };
    var request = function request(url, success, error, options) {
        var xhr = new XMLHttpRequest();
        if (options) options(xhr);
        xhr.open('GET', url, true);
        xhr.onload = function() {
            success(xhr.response);
        };
        if (error) xhr.onerror = function() {
            error(xhr, xhr.status);
        };
        xhr.send();
    };
    var equal = function equal(a, b) {
        if (isObject(a)) return equalObjects(a, b);
        if (Array.isArray(a)) return equalArrays(a, b);
        return a === b;
    };
    var isObject = function isObject(obj) {
        return obj === Object(obj);
    };
    var equalObjects = function equalObjects(a, b) {
        for(var i in a){
            if (!b.hasOwnProperty(i) || a[i] !== b[i]) return false;
        }
        return true;
    };
    var equalArrays = function equalArrays(a, b) {
        return a.length == b.length && a.every(function(v, i) {
            return v === b[i];
        });
    };
    var keysToList = function keysToList(obj) {
        return Object.keys(obj).map(function(k) {
            return '"' + k + '"';
        }).join(', ');
    };
    /**
 * Tick
 */ var Tick = function() {
        function Tick() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.createElement('div');
            classCallCheck(this, Tick);
            // set base configuration options
            this._options = mergeObjects(Tick.options(), options);
            // instance properties
            this._element = element;
            this._value = null;
            this._observer = null;
            this._viewDefinition = null;
            this._constants = null;
            this._presets = null;
            this._updater = null;
            this._credits = null;
            // callback methods
            this._didInit = null;
            this._didDestroy = null;
            this._willDestroy = null;
            this._didUpdate = null;
            // initialise Tick
            this._init();
        }
        /**
     * Default options for this control
     */ createClass(Tick, [
            {
                key: 'isRootElement',
                /**
         * Public API
         */ value: function isRootElement(element) {
                    return this._element === element;
                }
            },
            {
                key: 'setConstant',
                value: function setConstant$$1(key, value) {
                    this._constants[key] = value;
                }
            },
            {
                key: 'getConstants',
                value: function getConstants$$1() {
                    return this._constants;
                }
            },
            {
                key: 'getConstant',
                value: function getConstant(key) {
                    return this._constants[key];
                }
            },
            {
                key: 'setPreset',
                value: function setPreset$$1(key, fn) {
                    this._presets[key] = fn;
                }
            },
            {
                key: 'getPreset',
                value: function getPreset(key) {
                    return this._presets[key];
                }
            },
            {
                key: 'destroy',
                value: function destroy$$1() {
                    this._willDestroy(this);
                    // clean up
                    this._observer.disconnect();
                    // destroy presenters
                    this.baseDefinition.presenter.destroy();
                    this._didDestroy(this);
                }
            },
            {
                key: 'redraw',
                value: function redraw() {
                    if (!this.baseDefinition || !this.baseDefinition.presenter) return;
                    this.baseDefinition.presenter.reset();
                    this.baseDefinition.presenter.draw();
                    this._updater(this.baseDefinition, this._value);
                }
            },
            {
                key: '_init',
                value: function _init() {
                    var _this = this;
                    // move options to properties
                    this._viewDefinition = this._options.view;
                    this._willDestroy = this._options.willDestroy;
                    this._didDestroy = this._options.didDestroy;
                    this._didInit = this._options.didInit;
                    this._didUpdate = this._options.didUpdate;
                    this._value = this._options.value;
                    this._presets = this._options.presets;
                    this._constants = this._options.constants;
                    this._credits = this._options.credits;
                    // no more use of options behind this line
                    // ---------------------------------------
                    // always add class tick to element (make sure it's only added once)
                    if (!this._element.classList.contains('tick')) this._element.classList.add('tick');
                    // use mutation observer to detect changes to value attribute
                    this._observer = observeAttributes(this._element, [
                        'data-value'
                    ], function(value) {
                        _this.value = value;
                    });
                    // force default view root, move children of current root to this element
                    if (this._viewDefinition.root !== this._element) {
                        Array.from(this._viewDefinition.root.children).forEach(function(node) {
                            _this._element.appendChild(node);
                        });
                        this._viewDefinition.root = this._element;
                    }
                    // no default view presenter defined, fallback to text
                    if (!this._viewDefinition.view && !this._viewDefinition.children) this._viewDefinition.view = 'text';
                    // setup root presenter
                    this._updater = presentTick(this);
                    // update for first time
                    if (this.value !== null) this._update(this.value);
                    // set to ready state
                    this._element.dataset.state = 'initialised';
                    // done with init
                    this._didInit(this, this.value);
                    // credits
                    if (this._credits) {
                        var credits = document.createElement('a');
                        credits.className = 'tick-credits';
                        credits.href = this._credits.url;
                        credits.tabindex = -1;
                        credits.target = '_blank';
                        credits.rel = 'noopener noreferrer nofollow';
                        credits.textContent = this._credits.label;
                        this._element.appendChild(credits);
                    }
                }
            },
            {
                key: '_update',
                value: function _update(value) {
                    this._updater(this.baseDefinition, value);
                    this._didUpdate(this, value);
                }
            },
            {
                key: 'baseDefinition',
                /**
         * Public Properties
         */ get: function get$$1() {
                    return this._viewDefinition;
                }
            },
            {
                key: 'root',
                get: function get$$1() {
                    return this._element;
                }
            },
            {
                key: 'value',
                get: function get$$1() {
                    return this._value;
                },
                set: function set$$1(value) {
                    this._value = typeof value === 'string' ? toValue(value) : value;
                    this._update(value);
                }
            }
        ], [
            {
                key: 'options',
                value: function options() {
                    return {
                        constants: getConstants(),
                        presets: getPresets(),
                        value: null,
                        view: null,
                        didInit: function didInit(tick) {},
                        didUpdate: function didUpdate(tick, value) {},
                        willDestroy: function willDestroy(tick) {},
                        didDestroy: function didDestroy(tick) {},
                        credits: {
                            label: 'Powered by PQINA',
                            url: 'https://pqina.nl/?ref=credits'
                        }
                    };
                }
            }
        ]);
        return Tick;
    }();
    var transformDurationUnit = function transformDurationUnit(value, single, plural, progress) {
        return {
            label: value === 1 ? single : plural,
            progress: value / progress,
            value: value
        };
    };
    /**
 * Tick DOM interface
 */ var instances = [];
    var setConstant = function setConstant(key, value) {
        constants[key] = value;
    };
    var setPreset = function setPreset(key, value) {
        presets[key] = value;
    };
    var getConstants = function getConstants() {
        return constants;
    };
    var getPresets = function getPresets() {
        return presets;
    };
    var constants = {
        YEAR_PLURAL: 'Years',
        YEAR_SINGULAR: 'Year',
        MONTH_PLURAL: 'Months',
        MONTH_SINGULAR: 'Month',
        WEEK_PLURAL: 'Weeks',
        WEEK_SINGULAR: 'Week',
        DAY_PLURAL: 'Days',
        DAY_SINGULAR: 'Day',
        HOUR_PLURAL: 'Hours',
        HOUR_SINGULAR: 'Hour',
        MINUTE_PLURAL: 'Minutes',
        MINUTE_SINGULAR: 'Minute',
        SECOND_PLURAL: 'Seconds',
        SECOND_SINGULAR: 'Second',
        MILLISECOND_PLURAL: 'Milliseconds',
        MILLISECOND_SINGULAR: 'Millisecond'
    };
    var presets = {
        y: function y(value, constants) {
            return transformDurationUnit(value, constants.YEAR_SINGULAR, constants.YEAR_PLURAL, 10);
        },
        M: function M(value, constants) {
            return transformDurationUnit(value, constants.MONTH_SINGULAR, constants.MONTH_PLURAL, 12);
        },
        w: function w(value, constants) {
            return transformDurationUnit(value, constants.WEEK_SINGULAR, constants.WEEK_PLURAL, 52);
        },
        d: function d(value, constants) {
            return transformDurationUnit(value, constants.DAY_SINGULAR, constants.DAY_PLURAL, 365);
        },
        h: function h(value, constants) {
            return transformDurationUnit(value, constants.HOUR_SINGULAR, constants.HOUR_PLURAL, 24);
        },
        m: function m(value, constants) {
            return transformDurationUnit(value, constants.MINUTE_SINGULAR, constants.MINUTE_PLURAL, 60);
        },
        s: function s(value, constants) {
            return transformDurationUnit(value, constants.SECOND_SINGULAR, constants.SECOND_PLURAL, 60);
        },
        mi: function mi(value, constants) {
            return transformDurationUnit(value, constants.MILLISECOND_SINGULAR, constants.MILLISECOND_PLURAL, 1000);
        }
    };
    var attributes = {
        'value': toValue,
        'didInit': toFunctionReference,
        'didUpdate': toFunctionReference,
        'didDestroy': toFunctionReference,
        'willDestroy': toFunctionReference
    };
    var getOptionsFromAttributes = function getOptionsFromAttributes(element) {
        var transfomers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var defaults$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var dataset = element.dataset;
        var options = {
            meta: {}
        };
        for(var prop in dataset){
            if (!dataset.hasOwnProperty(prop)) continue;
            var valueTransformer = transfomers[prop];
            var value = dataset[prop];
            if (valueTransformer) {
                value = valueTransformer(value);
                value = value === null ? clone(defaults$$1[prop]) : value;
                options[prop] = value;
            }
        }
        if (dataset.credits === 'false') options.credits = false;
        return options;
    };
    var indexOfElement = function indexOfElement(instances, element) {
        var i = 0;
        var l = instances.length;
        for(; i < l; i++){
            if (instances[i].isRootElement(element)) return i;
        }
        return -1;
    };
    var parse = function parse(context) {
        var elements = void 0;
        var element = void 0;
        var i = void 0;
        var instances = [];
        // find all crop elements and bind Crop behavior
        elements = context.querySelectorAll('.tick:not([data-state])');
        i = elements.length;
        while(i--){
            element = elements[i];
            instances.push(create(element));
        }
        return instances;
    };
    var find = function find(element) {
        var result = instances.filter(function(instance) {
            return instance.isRootElement(element);
        });
        return result ? result[0] : null;
    };
    var getDefaultOptions = function getDefaultOptions() {
        return _extends({}, Tick.options(), {
            constants: _extends({}, constants),
            presets: _extends({}, presets)
        });
    };
    var create = function create() {
        var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        // if first argument is options object correct parameter values
        if (element && !isHTMLElement(element)) {
            options = element;
            element = undefined;
        }
        // if already in array, can't create another on this location in the DOM
        if (element && find(element)) return;
        // if view defined
        if (options && options.view) options.view = createDOMTreeForDefinition([
            options.view
        ])[0];
        // if no options supplied, get the options from the element attributes
        if (!options && element) options = getOptionsFromAttributes(element, attributes, getDefaultOptions());
        // if element supplied, view is either default view or defined by child elements
        if (element) {
            // no options defined, set blank options object
            if (!options) options = {};
            // no default view defined
            if (!options.view) options.view = toPresenterDefinitionTree([
                element
            ])[0];
        }
        // instance (pass element to set root)
        var instance = new Tick(options, element);
        // add new instance
        instances.push(instance);
        // return the instance
        return instance;
    };
    var destroy = function destroy(element) {
        var index = indexOfElement(instances, element);
        if (index < 0) return false;
        instances[index].destroy();
        instances.splice(index, 1);
        return true;
    };
    var time = function time(fn) {
        return function() {
            setTimeout(fn, 0);
        };
    };
    var now$2 = function now$$1() {
        return Date.now();
    };
    var setTimer = function setTimer(cb) {
        var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var settings = mergeObjects({
            autostart: true
        }, options);
        var tickExpectedTime = null;
        var tickStartTime = null;
        var sleepStartTime = null;
        var totalSleepTime = 0;
        var sleepIntervalOffset = null;
        var paused = false;
        var timer = null;
        var isPaused = function isPaused() {
            return paused;
        };
        var isStarted = function isStarted() {
            return tickStartTime !== null;
        };
        var isDocumentHidden = function isDocumentHidden() {
            return document.hidden;
        };
        // timer tick
        var tick = function tick() {
            var currentTime = now$2();
            var timeoutErrorOffset = tickExpectedTime - currentTime;
            var timeout = interval + timeoutErrorOffset;
            // calculate new expected time
            tickExpectedTime = currentTime + timeout;
            // calculate total runtime
            var runtime = currentTime - tickStartTime - totalSleepTime + timeoutErrorOffset;
            // let others know total runtime of counter
            cb(runtime);
            // new timeout
            timer = setTimeout(tick, timeout);
        };
        var start = function start() {
            // if paused, run resume instead (makes building a stopwatch easier)
            if (isPaused()) {
                resume();
                return;
            }
            // if already running we don't do anything, can't start twice need to stop first
            if (isStarted()) return;
            // the moment we set the timeout
            tickStartTime = now$2();
            // call callback immidiately with zero value
            setTimeout(function() {
                cb(0);
            }, 0);
            // the moment the timeout should end
            tickExpectedTime = now$2() + interval;
            // listen for changes in visibility
            startListeningForVisibilityChanges();
            // stop here if document is hidden at start time
            if (isDocumentHidden()) {
                didHideDocument();
                return;
            }
            // start ticking
            timer = setTimeout(function() {
                tick();
            }, interval);
        };
        var stop = function stop() {
            // can always stop
            clearTimeout(timer);
            timer = null;
            tickStartTime = null;
            tickExpectedTime = null;
            sleepStartTime = null;
            totalSleepTime = 0;
            sleepIntervalOffset = null;
            paused = false;
            stopListeningForVisibilityChanges();
        };
        var reset = function reset() {
            // can always reset
            stop();
            start();
        };
        /**
     * Pause / Resume
     */ var pause = function pause() {
            // can't pause if not running or if is hidden
            if (!isStarted() || isDocumentHidden()) return;
            paused = true;
            stopListeningForVisibilityChanges();
            sleep();
        };
        var resume = function resume() {
            // can't resume if not paused if not started or if hidden
            if (!isPaused() || !isStarted() || isDocumentHidden()) return;
            paused = false;
            startListeningForVisibilityChanges();
            wake();
        };
        // start sleeping
        var sleep = function sleep() {
            clearTimeout(timer);
            sleepStartTime = now$2();
            sleepIntervalOffset = tickExpectedTime - sleepStartTime;
        };
        // wake from hidden or pause stated
        var wake = function wake() {
            // need to remember the wait duration
            totalSleepTime += now$2() - sleepStartTime;
            sleepStartTime = null;
            // as we are going to call tick immidiately we expect the time to be now
            tickExpectedTime = now$2() + sleepIntervalOffset;
            // start ticking
            timer = setTimeout(function() {
                tick();
            }, sleepIntervalOffset);
        };
        /**
     * Document Visibility Change
     */ var didHideDocument = function didHideDocument() {
            // can only be called if the timer is currently running so no checks
            sleep();
        };
        var didShowDocument = function didShowDocument() {
            // can only be called if the timer was running before (but could have been stopped in the mean time)
            if (!isStarted()) return;
            wake();
        };
        var stopListeningForVisibilityChanges = function stopListeningForVisibilityChanges() {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
        var startListeningForVisibilityChanges = function startListeningForVisibilityChanges() {
            document.addEventListener('visibilitychange', handleVisibilityChange);
        };
        var handleVisibilityChange = function handleVisibilityChange() {
            if (isDocumentHidden()) didHideDocument();
            else didShowDocument();
        };
        /**
     * Go time! (or not)
     */ if (settings.autostart) start();
        /**
     * API
     */ return {
            start: start,
            stop: time(stop),
            reset: time(reset),
            pause: time(pause),
            resume: resume
        };
    };
    var toInterval = function toInterval(string) {
        if (!/^[\d]+/.test(string)) string = "1 " + string;
        var parts = string.split(" ");
        return parseFloat(parts[0]) * TimeUnit[parts[1].toLowerCase()];
    };
    var toTime = function toTime(date, time) {
        return setTime(date, time.split(":").map(toInt));
    };
    var toYearlyMoment = function toYearlyMoment(date, string) {
        /*
  every 1st of november at 12:00
  every 25th of november at 13:00 wait 10 seconds
  every 25th of november from 10 till 15 every 10 minutes
  */ var parts = string.match(/januari|februari|march|april|may|june|july|august|september|october|november|december|[\d]+th|\dst|\dnd|first|last|at\s[\d]+(?::[\d]+)?(?::[\d]+)?/g);
        // no `at time` supplied
        if (parts.length > 1) {
            var rest = "";
            parts.forEach(function(p) {
                rest = string.split(p)[1] || "";
            });
            var wait = rest.trim().match(/wait\s[\d]+\s[a-z]+/);
            if (wait) parts.push(wait[0]);
        }
        // to moment object
        var moment = parts.reduce(function(obj, part) {
            // is month day (1st, 2nd, 12th, first, last)
            if (/([\d]+th|\dst|\dnd|first|last)/.test(part)) obj.day = /^[\d]/.test(part) ? parseInt(part, 10) : part === "first" ? 1 : part;
            // if is time (at 12:00)
            if (/^at/.test(part)) obj.time = toTime(clone$1(date), part.substring(3));
            else if (/wait/.test(part)) obj.idle = toInterval(part.substring(5));
            else if (/^[\a-zA-Z]+$/.test(part)) obj.month = part;
            return obj;
        }, {
            idle: null,
            day: null,
            month: null,
            time: null,
            date: null,
            dist: null,
            wait: false
        });
        if (!moment.time) {
            // set to day
            // move to first day (so when the month changes its not accidentally out of range)
            moment.time = clone$1(date);
            moment.time.setDate(1);
            moment.time = setMonth(moment.time, moment.month);
            moment.time = setDayOfMonth(moment.time, moment.day);
            // if so get first valid date and use that for time
            var hourlyMoment = toHourlyMoment(moment.time, string);
            // waiting
            if (hourlyMoment.wait) return moment;
            // copy either date or from time
            moment.time = clone$1(sameDate(date, moment.time) && hourlyMoment.date ? hourlyMoment.date : hourlyMoment.from);
            // test if has already passed, if so, set to hourly from for next month
            var dist = moment.time - date;
            if (dist < 0) {
                // move to next year
                moment.time = clone$1(hourlyMoment.from);
                moment.time.setFullYear(moment.time.getFullYear() + 1);
                // recalculate distance
                dist = moment.time - date;
            }
            moment.dist = dist;
        } else {
            // correct time to given month
            moment.time.setDate(1);
            moment.time = setMonth(moment.time, moment.month);
            moment.time = setDayOfMonth(moment.time, moment.day);
            var _dist = moment.time - date;
            var distOverflow = 0;
            if (_dist < 0) {
                distOverflow = _dist;
                // move to next year
                moment.time.setFullYear(moment.time.getFullYear() + 1);
                // recalculate distance
                _dist = moment.time - date;
            }
            // get total time from today to next moment
            if (moment.idle !== null && distOverflow + moment.idle > 0) {
                moment.wait = true;
                return moment;
            }
            moment.dist = _dist;
        }
        moment.date = clone$1(moment.time);
        return moment;
    };
    var toMonthlyMoment = function toMonthlyMoment(date, string) {
        /*
  every month on the 1st day
  every month on the first day
  every month on day the 12th
  every last day of the month at 12:00
  every first day of the month
  every 1st day of the month at 10
  every 2nd day of the month at 10
  every 20th day of the month
  every 20th day of the month at 12:00 wait 10 minutes
  every 20th day of the month from 10 till 14 every hour
  */ var parts = string.match(/[\d]+th|\dst|\dnd|first|last|at\s[\d]+(?::[\d]+)?(?::[\d]+)?/g);
        // no `at time` supplied
        if (parts.length > 1) {
            var rest = "";
            parts.forEach(function(p) {
                rest = string.split(p)[1] || "";
            });
            var wait = rest.trim().match(/wait\s[\d]+\s[a-z]+/);
            if (wait) parts.push(wait[0]);
        }
        var moment = parts.reduce(function(obj, part) {
            // is month day (1st, 2nd, 12th, first, last)
            if (/([\d]+th|\dst|\dnd|first|last)/.test(part)) obj.day = /^[\d]/.test(part) ? parseInt(part, 10) : part === "first" ? 1 : part;
            // if is time (at 12:00)
            if (/^at/.test(part)) obj.time = toTime(clone$1(date), part.substring(3));
            else if (/wait/.test(part)) obj.idle = toInterval(part.substring(5));
            return obj;
        }, {
            idle: null,
            day: null,
            time: null,
            date: null,
            dist: null,
            wait: false
        });
        if (!moment.time) {
            // set to day
            moment.time = setDayOfMonth(clone$1(date), moment.day);
            // if so get first valid date and use that for time
            var hourlyMoment = toHourlyMoment(moment.time, string);
            // waiting
            if (hourlyMoment.wait) return moment;
            // copy either date or from time
            moment.time = clone$1(sameDate(date, moment.time) && hourlyMoment.date ? hourlyMoment.date : hourlyMoment.from);
            // test if has already passed, if so, set to hourly from for next month
            var dist = moment.time - date;
            if (dist < 0) {
                // move to next month (set to first day of month)
                moment.time = clone$1(hourlyMoment.from);
                moment.time.setDate(1);
                moment.time.setMonth(moment.time.getMonth() + 1);
                // now set to expected day
                setDayOfMonth(moment.time, moment.day);
                // recalculate distance
                dist = moment.time - date;
            }
            moment.dist = dist;
        } else {
            // correct time to set week day
            moment.time = setDayOfMonth(moment.time, moment.day);
            var _dist2 = moment.time - date;
            var distOverflow = 0;
            if (_dist2 < 0) {
                distOverflow = _dist2;
                // move to next month (set to first day of month)
                moment.time.setDate(1);
                moment.time.setMonth(moment.time.getMonth() + 1);
                // now set to expected day
                setDayOfMonth(moment.time, moment.day);
                // recalculate distance
                _dist2 = moment.time - date;
            }
            // get total time from today to next moment
            if (moment.idle !== null && distOverflow + moment.idle > 0) {
                moment.wait = true;
                return moment;
            }
            moment.dist = _dist2;
        }
        moment.date = clone$1(moment.time);
        return moment;
    };
    var toWeeklyMoment = function toWeeklyMoment(date, string) {
        // - every wednesday at 12:00
        // - every wednesday at 12:00 wait 10 minutes
        // - wednesday every hour
        // - wednesday from 10 till 14 every hour
        // - wednesday 12:00, thursday 14:00
        // - tuesday 10:00 wait 2 hours
        // - tuesday 10:00 wait 2 hours, saturday 10:00 wait 2 hours
        // - every tuesday every 5 minutes
        // - wednesday from 10 till 14 every hour
        // - every tuesday every 5 minutes wait 10 seconds
        // - every tuesday from 10 till 12 every 5 minutes wait 10 seconds
        // - every tuesday every 5 minutes from 10 till 12 wait 10 seconds
        // - every tuesday at 12:00 wait 5 minutes
        // strip week part and then feed rest to toDaily() or Hourly() method
        var parts = string.match(/(?:mon|tues|wednes|thurs|fri|satur|sun)day|at\s[\d]+(?::[\d]+)?(?::[\d]+)?/g);
        // no `at time` supplied
        if (parts.length > 1) {
            var rest = "";
            parts.forEach(function(p) {
                rest = string.split(p)[1] || "";
            });
            var wait = rest.trim().match(/wait\s[\d]+\s[a-z]+/);
            if (wait) parts.push(wait[0]);
        }
        // to moment object
        var moment = parts.reduce(function(obj, part) {
            // is day
            if (/(?:mon|tues|wednes|thurs|fri|satur|sun)day/.test(part)) obj.day = Days[capitalizeFirstLetter(part)];
            // if is time (at 12:00)
            if (/^at/.test(part)) obj.time = toTime(clone$1(date), part.substring(3));
            else if (/wait/.test(part)) obj.idle = toInterval(part.substring(5));
            return obj;
        }, {
            idle: null,
            day: null,
            time: null,
            date: null,
            dist: null,
            wait: false
        });
        // if no time set see if a hourly period was defined
        if (!moment.time) {
            // set to day
            moment.time = setDay(clone$1(date), moment.day);
            // if so get first valid date and use that for time
            var hourlyMoment = toHourlyMoment(moment.time, string);
            // waiting
            if (hourlyMoment.wait) return moment;
            // copy either date or from time
            moment.time = clone$1(sameDate(date, moment.time) && hourlyMoment.date ? hourlyMoment.date : hourlyMoment.from);
            // test if has already passed, if so, set to hourly from for next week
            var dist = moment.time - date;
            if (dist < 0) moment.time.setDate(moment.time.getDate() + 7);
            moment.dist = dist;
        } else {
            // correct time to set week day
            moment.time = setDay(moment.time, moment.day);
            var _dist3 = moment.time - date;
            if (_dist3 < 0) {
                moment.time.setDate(moment.time.getDate() + 7);
                _dist3 = moment.time - date;
            }
            // if is idling
            if (moment.idle !== null && _dist3 >= TimeUnit.Week - moment.idle) {
                moment.wait = true;
                return moment;
            }
            moment.dist = _dist3;
        }
        moment.date = clone$1(moment.time);
        return moment;
    };
    var toDailyMoment = function toDailyMoment(date, string) {
        // - every day at 10
        // - every day at 14:00
        // - every day at 14:30 wait 5 minutes
        // get parts
        var parts = string.match(/([\d]+(?::[\d]+)?(?::[\d]+)?)|(wait\s[\d]+\s[a-z]+)/g);
        // to moment object
        var moment = parts.reduce(function(obj, part) {
            // if is time
            if (/^[\d]/.test(part)) obj.time = toTime(clone$1(date), part);
            else if (/wait/.test(part)) obj.idle = toInterval(part.substring(5));
            return obj;
        }, {
            idle: null,
            time: null,
            date: null,
            wait: false,
            dist: null
        });
        var dist = moment.time - date;
        // if time dist is negative set time to tomorrow
        if (dist < 0) {
            moment.time.setDate(moment.time.getDate() + 1);
            dist = moment.time - date;
        }
        // test if wait period has passed
        if (moment.idle !== null && dist >= TimeUnit.Day - moment.idle) {
            moment.wait = true;
            return moment;
        }
        moment.dist = dist;
        moment.date = clone$1(moment.time);
        return moment;
    };
    var toHourlyMoment = function toHourlyMoment(date, string) {
        // - from 10 till 20 every hour wait 5 minutes
        // - from 10:00:00 till 14:00 every 15 minutes
        // - every hour
        // - every 20 minutes
        // - every 30 seconds
        // get parts
        var parts = string.match(/((?:[\d]+\s)?(?:hours|hour|minutes|minute|seconds|second))|((?:from|till)\s[\d]+(?::[\d]+)?(?::[\d]+)?)|(wait\s[\d]+\s[a-z]+)/g);
        // to moment object
        var moment = parts.reduce(function(obj, part) {
            // if is time
            if (/from/.test(part)) obj.from = toTime(obj.from, part.split(" ")[1]);
            else if (/till/.test(part)) obj.till = toTime(obj.till, part.split(" ")[1]);
            else if (/wait/.test(part)) obj.idle = toInterval(part.substring(5));
            else if (/hours|hour|minutes|minute|seconds|second/.test(part)) obj.interval = toInterval(part);
            return obj;
        }, {
            idle: null,
            interval: null,
            date: null,
            dist: null,
            wait: false,
            from: toTime(clone$1(date), "0"),
            till: toTime(clone$1(date), "23:59:59:999")
        });
        // if valid moment
        if (date < moment.from || date >= moment.till) return moment;
        // calculate if interval fits in duration
        if (moment.interval > moment.till - moment.from) return moment;
        // time passed since start of moment
        var diff = date - moment.from;
        // interval duration minus all intervals that fitted in the passed time since start
        // 200 - (diff % interval)
        // 200 - (1450 % 200)
        // 200 - 50
        // 150 till next moment
        var dist = moment.interval - diff % moment.interval;
        // test if wait period has passed
        if (moment.idle !== null && dist >= moment.interval - moment.idle) {
            moment.wait = true;
            return moment;
        }
        // set as final distance
        moment.dist = dist;
        // turn into date by adding to current time
        moment.date = new Date(date.getTime() + moment.dist);
        return moment;
    };
    var toMoment = function toMoment(date, string) {
        // test yearly schedules
        if (/januari|februari|march|april|may|june|july|august|september|october|november|december/.test(string)) return toYearlyMoment(date, string);
        // test for monthly schedules
        if (/month/.test(string)) return toMonthlyMoment(date, string);
        // test for weekly schedules
        if (/(?:mon|tues|wednes|thurs|fri|satur|sun)day/.test(string)) return toWeeklyMoment(date, string);
        // test for daily schedules
        if (/day at/.test(string) || /^at /.test(string)) return toDailyMoment(date, string);
        // test for hourly schedules
        if (/hours|hour|minutes|minute|seconds|second/.test(string)) return toHourlyMoment(date, string);
        return null;
    };
    var getNextScheduledDate = function getNextScheduledDate(date, schedule) {
        // create moments
        var moments = schedule.split(",").map(trim) // remove whitespace
        .map(function(s) {
            return toMoment(date, s);
        }); // string to moment in time
        // calculate closest moment
        var nearest = null;
        for(var i = 0; i < moments.length; i++){
            var moment = moments[i];
            // currently waiting
            if (nearest === null && moment.wait) return null;
            if (nearest === null) nearest = moment;
            else if (nearest.dist === null && moment.dist !== null) nearest = moment;
            else if (moment.dist !== null && moment.dist < nearest.dist) nearest = moment;
        }
        // return nearest date
        return nearest.date;
    };
    /**
 * Returns the server offset based on the type of value
 * will subtract current time from server time resulting in a correction offset
 * @param server
 * @param cb
 * @returns {*}
 */ var getServerOffset = function getServerOffset(server, cb) {
        if (server === true) {
            serverDate(function(date) {
                cb(date.getTime() - now$1().getTime());
            });
            return;
        }
        if (typeof server === 'string') {
            setTimeout(function() {
                cb(dateFromISO(server).getTime() - now$1().getTime());
            }, 0);
            return;
        }
        setTimeout(function() {
            cb(0);
        }, 0);
    };
    /**
 * Default options for counter
 * @type object
 */ var DEFAULT_COUNTDOWN_OPTIONS = {
        format: [
            'd',
            'h',
            'm',
            's'
        ],
        cascade: true,
        server: null,
        interval: 1000
    };
    /**
 * Creates a counter object
 * @param props
 */ var createCounter = function createCounter(props) {
        return _extends({
            // read only
            complete: false,
            offset: null,
            value: null,
            timer: null,
            // api
            onload: function onload() {},
            onupdate: function onupdate(value) {}
        }, props);
    };
    /**
 * Countdown Value
 * @param total - total milliseconds to count down
 * @param options
 */ var countdownAmount = function countdownAmount(total) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (typeof total !== 'number') throw 'Can\'t start counter, the "milliseconds" parameter is required';
        // set base options
        options = mergeObjects({
            units: 'seconds',
            target: 0,
            amount: 1000,
            interval: 1000
        }, options);
        // set private target
        var target = options.target;
        var current = total;
        // counter api
        var counter = createCounter({
            target: target,
            onended: function onended() {}
        });
        setTimeout(function() {
            // count method
            var count = function count(runtime) {
                current = total - runtime / options.interval * options.amount;
                // test if reached target date
                if (current <= target) {
                    // set final value
                    counter.value = options.target;
                    // set output to zero
                    counter.onupdate(counter.value / TimeUnit[options.units]);
                    // stop timer
                    counter.timer.stop();
                    // we're done!
                    counter.onended();
                    // really done!
                    return;
                }
                // set value
                counter.value = current;
                // calculate duration
                counter.onupdate(counter.value / TimeUnit[options.units]);
            };
            // set our counter, don't start automatically as we want to call onload first
            counter.timer = setTimer(count, options.interval, {
                autostart: false
            });
            // ready!
            counter.complete = true;
            counter.onload();
            // start timer automatically
            counter.timer.start();
        }, 0);
        return counter;
    };
    /**
 * Count down towards date
 * @param due
 * @param options
 * @returns object
 */ var countdownDuration = function countdownDuration(due) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (typeof due === 'undefined') throw 'Can\'t start counter, the "due" parameter is required';
        // set base options
        options = mergeObjects(DEFAULT_COUNTDOWN_OPTIONS, options);
        // set private target
        var target = isDate(due) ? due : dateFromISO(due);
        // counter api
        var counter = createCounter({
            due: clone$1(target),
            onended: function onended() {}
        });
        // get offset
        getServerOffset(options.server, function(offset) {
            counter.offset = offset;
            var count = function count() {
                var now$$1 = offsetDate(offset);
                // test if reached target date
                if (target - now$$1 <= 0) {
                    // set final value
                    counter.value = new Array(options.format.length).fill(0);
                    // set output to zero
                    counter.onupdate(counter.value);
                    // stop timer
                    counter.timer.stop();
                    // we're done!
                    counter.onended();
                    // really done!
                    return;
                }
                // set value
                counter.value = dateDiff(now$$1, target, options.format, options.cascade);
                // calculate duration
                counter.onupdate(counter.value);
            };
            // start our counter
            counter.timer = setTimer(count, options.interval, {
                autostart: false
            });
            // ready!
            counter.complete = true;
            counter.onload();
            // run timer
            counter.timer.start();
        });
        return counter;
    };
    /**
 * Count up from date
 * @param since
 * @param options
 * @returns object
 */ var countUpDuration = function countUpDuration(since) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (typeof since === 'undefined') throw 'Can\'t start counter, the "since" parameter is required';
        // set base options
        options = mergeObjects(DEFAULT_COUNTDOWN_OPTIONS, options);
        // set from date
        var from = isDate(since) ? since : dateFromISO(since);
        // counter api
        var counter = createCounter({
            since: clone$1(from)
        });
        // get offset
        getServerOffset(options.server, function(offset) {
            counter.offset = offset;
            var count = function count() {
                var now$$1 = offsetDate(offset);
                // set value
                counter.value = dateDiff(from, now$$1, options.format, options.cascade);
                // calculate duration
                counter.onupdate(counter.value);
            };
            // start our counter
            counter.timer = setTimer(count, options.interval, {
                autostart: false
            });
            // ready!
            counter.complete = true;
            counter.onload();
            // run timer
            counter.timer.start();
        });
        return counter;
    };
    /**
 * Count using a predefined schedule
 * @param schedule
 * @param options
 * @returns object
 */ var countScheduled = function countScheduled(schedule) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (typeof schedule !== 'string') throw 'Can\'t start scheduler, "schedule" is a required parameter';
        // timezone is in ISO8601 timezone format
        options = mergeObjects(_extends({}, DEFAULT_COUNTDOWN_OPTIONS, {
            timezone: null
        }), options);
        // get timezone offset
        var timezone = options.timezone ? toTimezoneOffset(options.timezone) : null;
        // counter api
        var counter = createCounter({
            waiting: null,
            nextScheduledDate: null,
            previouslyScheduledDate: null,
            onrepeat: function onrepeat(nextDate, lastDate) {},
            onresume: function onresume(nextDate) {},
            onwait: function onwait(sinceDate) {}
        });
        // date scheduled during last check
        var lastDate = undefined;
        var nextDate = null;
        // get offset
        getServerOffset(options.server, function(offset) {
            counter.offset = offset;
            var count = function count() {
                var now$$1 = offsetDate(offset);
                if (timezone !== null) now$$1 = timezoneDate(now$$1, timezone);
                // get next date
                nextDate = getNextScheduledDate(now$$1, schedule);
                // if no next date, we are in waiting state
                counter.waiting = nextDate === null;
                // if target is null call `wait` method
                if (counter.waiting) {
                    // if is waiting initially
                    if (lastDate === undefined) lastDate = null;
                    // set output to zero
                    counter.value = new Array(options.format.length).fill(0);
                    // remember scheduled date if set
                    if (counter.nextScheduledDate) counter.previouslyScheduledDate = clone$1(counter.nextScheduledDate);
                    // update counter dates
                    counter.nextScheduledDate = nextDate === null ? null : clone$1(nextDate);
                    // update counter
                    counter.onwait(counter.previouslyScheduledDate ? clone$1(counter.previouslyScheduledDate) : null);
                    // we'll stop here but we'll leave the counter running
                    return;
                }
                // update counter dates
                counter.nextScheduledDate = clone$1(nextDate);
                // just now we did not have a date (last date is always the date from the previous loop),
                // but now have, so we just woke up
                if (lastDate === null) counter.onresume(clone$1(nextDate));
                // if no last date or it's not the first loop and its not the same as the next date we are looping
                if (lastDate === null || lastDate !== undefined && !sameTime(lastDate, nextDate)) {
                    counter.onrepeat(clone$1(nextDate), lastDate ? clone$1(lastDate) : null);
                    if (lastDate) counter.previouslyScheduledDate = clone$1(lastDate);
                }
                // remember last date
                lastDate = clone$1(nextDate);
                // calculate new duration
                counter.value = dateDiff(now$$1, nextDate, options.format, options.cascade);
                counter.onupdate(counter.value);
            };
            // start our counter
            counter.timer = setTimer(count, options.interval, {
                autostart: false
            });
            // ready!
            counter.complete = true;
            counter.onload();
            // go!
            counter.timer.start();
        });
        return counter;
    };
    var support = function() {
        var w = window;
        if (typeof w === 'undefined') return false;
        // test if can use CSS supports feature detection 
        var canSupport = w.CSS && w.CSS.supports;
        // test if is IE 11
        // does not support CSS.supports but does support transforms without prefix
        var isIE11 = !!w.MSInputMethodContext && !!document.documentMode;
        // test if has transform support
        // we ignore the custom Opera implementation
        var canTransform = canSupport && CSS.supports('transform', 'translateX(0)');
        // can we use mutation observer and request animation frame
        var features = [
            'MutationObserver',
            'requestAnimationFrame'
        ];
        // test if is supported
        return isIE11 || canSupport && canTransform && !!features.filter(function(p) {
            return p in w;
        }).length;
    };
    var transform = function() {
        for(var _len = arguments.length, transforms = Array(_len), _key = 0; _key < _len; _key++)transforms[_key] = arguments[_key];
        return function(value, cb) {
            var output = [];
            var input = value;
            transforms.forEach(function(t, i) {
                t(input, function(out) {
                    output[i] = out;
                    if (i === transforms.length - 1) cb(output.length === 1 ? output[0] : output);
                });
            });
        };
    };
    var pad = function() {
        var padding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'left';
        return function(value, cb) {
            return cb(padding.length > ('' + value).length ? side === 'left' ? ('' + padding + value).slice(-padding.length) : ('' + value + padding).substring(0, padding.length) : value);
        };
    };
    var ascii = function() {
        return function(value, cb) {
            return cb((value + '').charCodeAt(0));
        };
    };
    var add$1 = function(amount) {
        return function(value, cb) {
            return cb(value + amount);
        };
    };
    var abs = function() {
        return function(value, cb) {
            return cb(Math.abs(value));
        };
    };
    var value$1 = function(staticValue) {
        return function(value, cb) {
            return cb(staticValue);
        };
    };
    var modulus = function(amount) {
        return function(value, cb) {
            return cb(value % amount);
        };
    };
    var subtract = function(amount) {
        return function(value, cb) {
            return cb(value - amount);
        };
    };
    var replace = function(needle, replacement) {
        return function(string, cb) {
            return cb((string + '').replace(new RegExp(needle === '.' ? '\\' + needle : needle, 'g'), replacement));
        };
    };
    var round = function() {
        var decimals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        return function(value, cb) {
            return cb(decimals ? value.toFixed(decimals) : Math.round(value));
        };
    };
    var floor = function() {
        return function(value, cb) {
            return cb(Math.floor(value));
        };
    };
    var ceil = function() {
        return function(value, cb) {
            return cb(Math.ceil(value));
        };
    };
    var fraction = function() {
        var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
        return function(value, cb) {
            return cb((parseFloat(value) - min) / (max - min));
        };
    };
    var multiply = function(amount) {
        return function(value, cb) {
            return cb(value * amount);
        };
    };
    var divide = function(amount) {
        return function(value, cb) {
            return cb(value / amount);
        };
    };
    var format = function(template) {
        return function(value, cb) {
            return cb(template.replace(/\$0/gi, value));
        };
    };
    var split = function() {
        var character = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        return function(string, cb) {
            return cb((string + '').split(character));
        };
    };
    var plural = function(single, plural) {
        return function(value, cb) {
            return cb(value === 1 ? single : plural);
        };
    };
    var limit = function() {
        var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        return function(value, cb) {
            return cb(Math.min(Math.max(value, min), max));
        };
    };
    var reverse = function() {
        return function(value, cb) {
            return cb(Array.isArray(value) ? value.reverse() : (value + '').split('').reverse().join(''));
        };
    };
    var arrive$1 = function(maxVelocity, friction) {
        var resetToBegin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var catchUp = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        var initial = null;
        var previous = null;
        var translator = null;
        return function(value, cb) {
            value = parseFloat(value);
            if (initial === null) {
                initial = value;
                cb(value);
                return;
            }
            if (resetToBegin && previous !== null && initial === value) {
                translator.cancel();
                translator = null;
            }
            if (catchUp && previous !== null && value - translator.getPosition() > 1) {
                translator.cancel();
                translator = null;
                previous = null;
                initial = value;
                cb(value);
                return;
            }
            if (!translator) {
                translator = createTranslator('arrive', maxVelocity, friction);
                translator.update(cb, initial, value);
            } else translator.update(cb, value);
            previous = value;
        };
    };
    var spring$1 = function(stiffness, damping, mass) {
        var current = null;
        var translator = null;
        return function(value, cb) {
            value = parseFloat(value);
            if (current === null) {
                current = value;
                cb(value);
                return;
            }
            if (!translator) {
                translator = createTranslator('spring', stiffness, damping, mass);
                translator.update(cb, current, value);
            } else translator.update(cb, value);
        };
    };
    /**
 * @param order { String } - order of flipping > random | ltr | rtl (default)
 * @param min { Number } - min random delay
 * @param max { Number } - max random delay
 */ var delay = function() {
        var order = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'rtl';
        var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
        var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
        var current = null;
        return function(value, cb) {
            // if no current value, set current value and -> exit
            if (!current) {
                current = copyArray(value);
                cb(copyArray(current));
                return;
            }
            current = order === 'rtl' ? current.slice(current.length - value.length, current.length) : current.slice(0, value.length);
            var indexes = range(value.length);
            if (order === 'random') shuffle(indexes);
            if (order === 'rtl') indexes.reverse();
            var update = function update() {
                flip(indexes.shift(), current, value, cb);
                if (indexes.length) setTimeout(update, random(min, max));
            };
            update();
        };
    };
    var flip = function flip(index, current, next, cb) {
        current[index] = next[index];
        cb(copyArray(current));
    };
    var number = function() {
        var decimalsSeparator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.';
        var thousandsSeparator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ',';
        var decimals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
        return function(value, cb) {
            cb((value < 0 ? '-' : '') + parseFloat(Math.abs(value)).toFixed(decimals).replace(/./g, function(c, i, a) {
                if (c === '.') return decimalsSeparator;
                return i && (a.length - i) % 3 === 0 ? thousandsSeparator + c : c;
            }));
        };
    };
    var percentage = function() {
        var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
        var f = fraction(min, max);
        return function(value, cb) {
            f(value, function(value) {
                cb(value * 100);
            });
        };
    };
    var step$1 = function(velocity) {
        var initial = null;
        var previous = null;
        var translator = null;
        return function(value, cb) {
            value = parseFloat(value);
            if (initial === null) {
                initial = value;
                cb(value);
                return;
            }
            if (previous !== null && initial === value) {
                translator.cancel();
                translator = null;
            }
            if (!translator) {
                translator = createTranslator('step', velocity);
                translator.update(cb, initial, value);
            } else translator.update(cb, value);
            previous = value;
        };
    };
    var upper = function() {
        return function(value, cb) {
            return cb((value + '').toUpperCase());
        };
    };
    var lower = function() {
        return function(value, cb) {
            return cb((value + '').toLowerCase());
        };
    };
    /**
 * milliseconds duration
 * @param format
 * @returns {function(*=, *)}
 */ var duration$1 = function() {
        for(var _len = arguments.length, format = Array(_len), _key = 0; _key < _len; _key++)format[_key] = arguments[_key];
        return function(value, cb) {
            return cb(timeDuration(value, format));
        };
    };
    var keys = function() {
        for(var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++)keys[_key] = arguments[_key];
        return function(value, cb) {
            var output = {};
            value.forEach(function(v, i) {
                output[keys[i]] = v;
            });
            cb(output);
        };
    };
    var map = function(transform) {
        return function(value, cb) {
            var output = [];
            var input = value;
            input.forEach(function(v, vi) {
                transform(v, function(out) {
                    output[vi] = out;
                    if (vi === input.length - 1) cb(output.concat());
                });
            });
        };
    };
    var rotate = function() {
        for(var _len = arguments.length, transforms = Array(_len), _key = 0; _key < _len; _key++)transforms[_key] = arguments[_key];
        return function(value, cb) {
            var input = Array.isArray(value) ? value : [
                value
            ];
            var output = [];
            var totalTransforms = transforms.length;
            input.forEach(function(v, i) {
                transforms[i % totalTransforms](v, function(out) {
                    output[i] = out;
                    if (i === input.length - 1) cb(output);
                });
            });
        };
    };
    var input = function() {
        return function(value, cb) {
            return cb(value);
        };
    };
    var substring = function(from, to) {
        return function(value, cb) {
            return cb((value + '').substring(from, to));
        };
    };
    var tween = function(duration) {
        var ease = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ease-linear';
        var delay = arguments[2];
        duration = toDuration(duration);
        var easeFn = getExtension(ExtensionType.EASING_FUNCTION, ease);
        var cancel = null;
        var previous = null;
        return function(value, cb) {
            value = parseFloat(value);
            if (cancel) cancel();
            // force value if
            // - no previous value defined
            // - is same value
            // - distance between from and to is too large
            if (previous === null || value === previous) {
                previous = value;
                cb(value);
                return;
            }
            var to = value;
            var from = previous;
            var dist = to - from;
            cancel = animate(function(p) {
                cb(from + p * dist);
            }, function() {
                cancel = null;
            }, duration, easeFn, delay);
            previous = value;
        };
    };
    var preset = function() {
        for(var _len = arguments.length, presets = Array(_len), _key = 0; _key < _len; _key++)presets[_key] = arguments[_key];
        return function(value, cb, instance) {
            return cb(value.map(function(v, index) {
                return instance.getPreset(presets[index])(v, instance.getConstants(), instance);
            }));
        };
    };
    var char = function(filter) {
        var replacement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var regex = filter ? new RegExp('[^' + filter + ']', 'g') : null;
        return function(value, cb) {
            var char = String.fromCharCode(value);
            if (regex) char = char.replace(regex, replacement);
            cb(char);
        };
    };
    var Transforms = {
        ascii: ascii,
        char: char,
        tween: tween,
        value: value$1,
        input: input,
        rotate: rotate,
        map: map,
        transform: transform,
        upper: upper,
        lower: lower,
        abs: abs,
        add: add$1,
        subtract: subtract,
        modulus: modulus,
        pad: pad,
        number: number,
        replace: replace,
        round: round,
        ceil: ceil,
        floor: floor,
        fraction: fraction,
        percentage: percentage,
        multiply: multiply,
        divide: divide,
        split: split,
        format: format,
        plural: plural,
        limit: limit,
        reverse: reverse,
        arrive: arrive$1,
        spring: spring$1,
        delay: delay,
        step: step$1,
        keys: keys,
        duration: duration$1,
        substring: substring,
        preset: preset
    };
    addExtensions(ExtensionType.TRANSFORM, Transforms);
    var crossfade = function() {
        var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var delayIn = arguments[1];
        var delayOut = arguments[2];
        return {
            intro: [
                {
                    name: 'fade',
                    parameters: [
                        0,
                        1
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayIn)
                }
            ],
            outro: [
                {
                    name: 'fade',
                    parameters: [
                        1,
                        0
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayOut)
                }
            ]
        };
    };
    var swap = function() {
        var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';
        var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
        var delayIn = arguments[3];
        var delayOut = arguments[4];
        return {
            intro: [
                {
                    name: 'move',
                    parameters: [
                        '' + -distance * 100,
                        '0%',
                        axis
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayIn)
                }
            ],
            outro: [
                {
                    name: 'move',
                    parameters: [
                        '0%',
                        '' + distance * 100,
                        axis
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayOut)
                }
            ]
        };
    };
    var revolve = function() {
        var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';
        var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
        var delayIn = arguments[3];
        var delayOut = arguments[4];
        return {
            intro: [
                {
                    name: 'rotate',
                    parameters: [
                        -distance * 90 + 'deg',
                        '0deg',
                        axis
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayIn)
                }
            ],
            outro: [
                {
                    name: 'rotate',
                    parameters: [
                        '0deg',
                        distance * 90 + 'deg',
                        axis
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayOut)
                }
            ]
        };
    };
    var zoom = function() {
        var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var speed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var delayIn = arguments[2];
        var delayOut = arguments[3];
        return {
            intro: [
                {
                    name: 'scale',
                    parameters: [
                        offset,
                        1
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayIn)
                }
            ],
            outro: [
                {
                    name: 'scale',
                    parameters: [
                        1,
                        offset
                    ],
                    duration: 1000 * speed,
                    delay: toDuration(delayOut)
                }
            ]
        };
    };
    var Translation = {
        'x': 'translateX',
        'y': 'translateY',
        'z': 'translateZ'
    };
    var Rotation = {
        'x': 'rotateX',
        'y': 'rotateY',
        'z': 'rotateZ'
    };
    var Scalar = {
        'both': 'scale',
        'x': 'scaleX',
        'y': 'scaleY'
    };
    /**
 * Helper methods
 */ var between = function between(from, to, p) {
        return from + (to - from) * p;
    };
    /**
 * Single Element transitions
 */ var fade = function fade(element, p, direction) {
        var ease = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : easeInOutQuad;
        var from = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var to = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
        if (direction < 0) {
            var _ref = [
                to,
                from
            ];
            from = _ref[0];
            to = _ref[1];
        }
        element.style.opacity = between(from, to, ease(p));
    };
    var move = function move(element, p, direction) {
        var ease = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : easeInOutQuad;
        var from = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '0';
        var to = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '100%';
        var axis = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'y';
        if (direction < 0) {
            var _ref2 = [
                to,
                from
            ];
            from = _ref2[0];
            to = _ref2[1];
        }
        var f = cache(from, toCSSValue);
        var t = cache(to, toCSSValue);
        setTransform(element, Translation[axis], between(f.value, t.value, ease(p)), f.units || t.units);
    };
    var rotate$1 = function rotate(element, p, direction) {
        var ease = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : easeInOutQuad;
        var from = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '0';
        var to = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '90deg';
        var axis = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'x';
        if (direction < 0) {
            var _ref3 = [
                to,
                from
            ];
            from = _ref3[0];
            to = _ref3[1];
        }
        var f = cache(from, toCSSValue);
        var t = cache(to, toCSSValue);
        setTransform(element, Rotation[axis], between(f.value, t.value, ease(p)), f.units || t.units);
    };
    var scale = function scale(element, p, direction) {
        var ease = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : easeInOutQuad;
        var from = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var to = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
        var axis = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'both';
        if (direction < 0) {
            var _ref4 = [
                to,
                from
            ];
            from = _ref4[0];
            to = _ref4[1];
        }
        setTransform(element, Scalar[axis], between(from, to, ease(p)));
    };
    /**
 * Composed
 */ /**
 * Available transitions
 */ var Transitions = {
        fade: fade,
        move: move,
        rotate: rotate$1,
        scale: scale,
        // composed transitions
        crossfade: crossfade,
        swap: swap,
        revolve: revolve,
        zoom: zoom
    };
    addExtensions(ExtensionType.TRANSITION, Transitions);
    /**
 * Helper methods for building the API
 */ /**
 * We wan't to be sure Rollup includes these collections in the output packages so that's why they are referenced here
 */ var API = {
        /**
  * Quick way to detect if Tick is supported
  */ supported: support(),
        // options
        options: {
            setConstant: setConstant,
            setPreset: setPreset
        },
        /**
  * Helper Methods
  */ helper: {
            // Starts an interval and calls callback method on each tick
            interval: setTimer,
            // Returns current time or date object based on ISO
            date: function date(iso) {
                return iso ? dateFromISO(iso) : now$1();
            },
            // Returns duration in milliseconds or duration between two dates
            duration: duration
        },
        /**
  * Data Access
  */ data: {
            // Request data from a url
            request: request,
            // Poll a URL for data with a set interval
            poll: function poll(url, cb) {
                var interval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 60000;
                return setTimer(function() {
                    request(url, cb);
                }, interval);
            }
        },
        /**
  * DOM Operations
  */ DOM: {
            // Create a new ticker
            create: create,
            // Destroy an existing ticker
            destroy: destroy,
            // Parse a piece of the DOM for tickers
            parse: parse,
            // Find a specific ticker by DOM node
            find: find
        },
        count: {
            down: function down() {
                for(var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++)args[_key] = arguments[_key];
                // if is `amount` and `unit type`, 10 seconds
                if (typeof args[0] === 'number' && typeof args[1] === 'string') {
                    var value = args[0];
                    var units = args[1].toLowerCase();
                    args.shift();
                    args[0] = duration(value, units);
                    args[1] = args[1] || {};
                    args[1].units = units;
                    return countdownAmount.apply(undefined, args);
                }
                // is date or iso string
                if (typeof args[0] === 'string' || isDate(args[0])) return countdownDuration.apply(undefined, args);
                return null;
            },
            up: countUpDuration,
            schedule: countScheduled
        },
        /**
  * Public method to extend Tick functionality
  */ plugin: {
            add: function add(type, name, fn) {
                if (typeof type === 'function') {
                    var extension = type;
                    return addExtension(extension.identifier.type, extension.identifier.name, extension);
                }
                return addExtension(type, name, fn);
            }
        }
    };
    // expose shortcut methods
    var _loop = function _loop(type) {
        if (!ExtensionType.hasOwnProperty(type)) return 'continue';
        API.plugin[dashesToCamels('add-' + ExtensionType[type])] = function(name, fn) {
            addExtension(ExtensionType[type], name, fn);
        };
    };
    for(var type in ExtensionType){
        var _ret = _loop(type);
        if (_ret === 'continue') continue;
    }
    module.exports = API;
    return module.exports;
}() : null;


/* eslint-disable */ /*
 * @pqina/flip v1.8.4 - A Beautifully Animated Flip Clock
 * Copyright (c) 2024 PQINA - https://pqina.nl/flip/
 */ var $c693b55dabea771a$export$2e2bcd8739ae039 = typeof window !== 'undefined' ? function() {
    if (!module) var module = {};
    'use strict';
    var asyncGenerator = function() {
        function AwaitValue(value) {
            this.value = value;
        }
        function AsyncGenerator(gen) {
            var front, back;
            function send(key, arg) {
                return new Promise(function(resolve, reject) {
                    var request = {
                        key: key,
                        arg: arg,
                        resolve: resolve,
                        reject: reject,
                        next: null
                    };
                    if (back) back = back.next = request;
                    else {
                        front = back = request;
                        resume(key, arg);
                    }
                });
            }
            function resume(key, arg) {
                try {
                    var result = gen[key](arg);
                    var value = result.value;
                    if (value instanceof AwaitValue) Promise.resolve(value.value).then(function(arg) {
                        resume("next", arg);
                    }, function(arg) {
                        resume("throw", arg);
                    });
                    else settle(result.done ? "return" : "normal", result.value);
                } catch (err) {
                    settle("throw", err);
                }
            }
            function settle(type, value) {
                switch(type){
                    case "return":
                        front.resolve({
                            value: value,
                            done: true
                        });
                        break;
                    case "throw":
                        front.reject(value);
                        break;
                    default:
                        front.resolve({
                            value: value,
                            done: false
                        });
                        break;
                }
                front = front.next;
                if (front) resume(front.key, front.arg);
                else back = null;
            }
            this._invoke = send;
            if (typeof gen.return !== "function") this.return = undefined;
        }
        if (typeof Symbol === "function" && Symbol.asyncIterator) AsyncGenerator.prototype[Symbol.asyncIterator] = function() {
            return this;
        };
        AsyncGenerator.prototype.next = function(arg) {
            return this._invoke("next", arg);
        };
        AsyncGenerator.prototype.throw = function(arg) {
            return this._invoke("throw", arg);
        };
        AsyncGenerator.prototype.return = function(arg) {
            return this._invoke("return", arg);
        };
        return {
            wrap: function(fn) {
                return function() {
                    return new AsyncGenerator(fn.apply(this, arguments));
                };
            },
            await: function(value) {
                return new AwaitValue(value);
            }
        };
    }();
    var classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    };
    var createClass = function() {
        function defineProperties(target, props) {
            for(var i = 0; i < props.length; i++){
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    var index = function(_ref) {
        var DOM = _ref.DOM, animate = _ref.Animation.animate, Extension = _ref.Extension, performance = _ref.Date.performance, _ref$View = _ref.View, rooter = _ref$View.rooter, destroyer = _ref$View.destroyer, drawer = _ref$View.drawer, updater = _ref$View.updater, styler = _ref$View.styler;
        var easeOutCubic = Extension.getExtension(Extension.Type.EASING_FUNCTION, 'ease-out-cubic');
        var easeOutSine = Extension.getExtension(Extension.Type.EASING_FUNCTION, 'ease-out-sine');
        var draw = function draw(state) {
            // create cards if not already created
            if (state.isInitialValue()) {
                // clear current content
                state.root.textContent = '';
                // value spacer
                state.spacer = DOM.create('span', 'tick-flip-spacer');
                state.root.appendChild(state.spacer);
                // shaders
                var shadowTop = DOM.create('span', 'tick-flip-shadow-top tick-flip-shadow tick-flip-front');
                var shadowBottom = DOM.create('span', 'tick-flip-shadow-bottom tick-flip-shadow tick-flip-back');
                state.root.appendChild(shadowTop);
                state.root.appendChild(shadowBottom);
                // create shadow element
                state.shadowCard = DOM.create('span', 'tick-flip-card-shadow');
                state.root.appendChild(state.shadowCard);
            }
            // set spacer value
            state.spacer.textContent = state.value;
            // don't animate when invisible to the user
            if (!state.isInitialValue() && !DOM.visible(state.root)) {
                state.cards.forEach(function(card) {
                    card.back = state.value;
                    card.front = state.value;
                });
                return;
            }
            // get previous card
            var turningCard = state.cards[state.cards.length - 1];
            if (turningCard) {
                turningCard.waiting = false;
                turningCard.offset = performance();
                turningCard.back = state.value;
            }
            // create a quick flipped initial card and then exit
            if (state.isInitialValue()) {
                // create flipped state (bottom)
                var initialBottomCard = new FlipCard();
                initialBottomCard.back = state.value;
                initialBottomCard.offset = null;
                initialBottomCard.progress = 1;
                state.root.insertBefore(initialBottomCard.root, state.root.firstChild);
                state.cards.push(initialBottomCard);
            }
            // create a new card
            var topCard = new FlipCard();
            topCard.offset = null;
            topCard.progress = 0;
            topCard.visual_progress = 0;
            topCard.waiting = true;
            topCard.front = state.value;
            topCard.rotate(0);
            // topCard.rotate(-1); // prevents slight anti-aliasing issues on Safari / Firefox
            state.root.insertBefore(topCard.root, state.root.firstChild);
            state.cards.push(topCard);
            if (!state.animating) {
                state.animating = true;
                var ease = Extension.getExtension(Extension.Type.EASING_FUNCTION, state.style.flipEasing);
                var tick = function tick() {
                    // find cards that require animation
                    var cardsToAnimate = state.cards.filter(function(card) {
                        return !card.done && !card.waiting;
                    });
                    if (cardsToAnimate.length === 0) {
                        state.animating = false;
                        return;
                    }
                    // calculate card progress
                    cardsToAnimate.forEach(function(card) {
                        if (card.offset !== null) card.progress = (performance() - card.offset) / state.style.flipDuration;
                        if (card.progress >= 1) {
                            card.progress = 1;
                            card.done = true;
                        }
                        card.visual_progress = ease(card.progress);
                    });
                    // sort
                    var cardDistance = 0.01;
                    cardsToAnimate.reverse().forEach(function(card, index) {
                        var previousCard = cardsToAnimate[index - 1];
                        if (previousCard && card.visual_progress <= previousCard.visual_progress) card.visual_progress = previousCard.visual_progress + cardDistance;
                    });
                    cardsToAnimate.reverse();
                    // update shadows
                    state.cards.forEach(function(card, index) {
                        // set default shadow and highlight levels based on visual animation progress
                        var shadowFrontProgress = 1 - Math.abs(card.visual_progress - .5) * 2;
                        var highlightBackProgress = 1 - (card.visual_progress - .5) / .5;
                        card.shadowFront = shadowFrontProgress;
                        card.highlightBack = highlightBackProgress;
                        // recalculate levels based on other card positions
                        var cardAbove = state.cards[index + 1];
                        // if there's a card above me, my back is visible, and the above card is falling
                        if (cardAbove && card.visual_progress > .5 && card.visual_progress > 0) card.shadowBack = easeOutCubic(cardAbove.visual_progress);
                    });
                    // update and animate cards
                    cardsToAnimate.forEach(function(card, index) {
                        var p = card.visual_progress;
                        if (p > .5 && !card.done) card.root.style.zIndex = 10 + index;
                        else card.root.style.removeProperty('z-index');
                        card.rotate(p * -180);
                    });
                    // handle card stack shadow
                    var shadowProgress = 0;
                    var dist = 1;
                    cardsToAnimate.forEach(function(card) {
                        var d = Math.abs(card.visual_progress - .5);
                        if (d < dist) {
                            dist = d;
                            shadowProgress = card.visual_progress;
                        }
                    });
                    var s = shadowProgress < .5 ? easeOutSine(shadowProgress / .5) : easeOutSine((1 - shadowProgress) / .5);
                    state.shadowCard.style.opacity = s;
                    DOM.transform(state.shadowCard, 'scaleY', s);
                    // clean up cards that finished animating
                    state.cards.filter(function(card) {
                        return card.done;
                    }) // gather all done cards
                    .slice(0, -1) // don't delete the last one
                    .forEach(function(card) {
                        // let's delete them
                        // remove predecessor from cards array
                        state.cards = state.cards.filter(function(c) {
                            return c !== card;
                        });
                        // remove predecessor from the DOM
                        if (card.root.parentNode) state.root.removeChild(card.root);
                    });
                    requestAnimationFrame(tick);
                };
                tick();
            }
        };
        var FlipCard = function() {
            function FlipCard() {
                classCallCheck(this, FlipCard);
                this._root = DOM.create('span', 'tick-flip-card');
                // card front
                var front = DOM.create('span', 'tick-flip-panel-front tick-flip-front tick-flip-panel');
                var textFront = DOM.create('span', 'tick-flip-panel-front-text');
                var textFrontWrapper = DOM.create('span', 'tick-flip-panel-text-wrapper');
                textFront.appendChild(textFrontWrapper);
                var shadowFront = DOM.create('span', 'tick-flip-panel-front-shadow');
                front.appendChild(textFront);
                front.appendChild(shadowFront);
                var back = DOM.create('span', 'tick-flip-panel-back tick-flip-back tick-flip-panel');
                var textBack = DOM.create('span', 'tick-flip-panel-back-text');
                var textBackWrapper = DOM.create('span', 'tick-flip-panel-text-wrapper');
                textBack.appendChild(textBackWrapper);
                var highlightBack = DOM.create('span', 'tick-flip-panel-back-highlight');
                var shadowBack = DOM.create('span', 'tick-flip-panel-back-shadow');
                back.appendChild(textBack);
                back.appendChild(highlightBack);
                back.appendChild(shadowBack);
                // create card
                this._root.appendChild(front);
                this._root.appendChild(back);
                // references for animation
                this._front = front;
                this._back = back;
                this._shadowFront = shadowFront;
                this._shadowBack = shadowBack;
                this._highlightBack = highlightBack;
                // back
                this._textBack = textBackWrapper;
                this._textFront = textFrontWrapper;
                // front and back values
                this._frontValue = null;
                this._backValue = null;
            }
            createClass(FlipCard, [
                {
                    key: 'rotate',
                    value: function rotate(degrees) {
                        this._front.style.transform = 'rotateX(' + degrees + 'deg)';
                        this._back.style.transform = 'rotateX(' + (-180 + degrees) + 'deg)';
                    }
                },
                {
                    key: 'root',
                    get: function get$$1() {
                        return this._root;
                    }
                },
                {
                    key: 'front',
                    set: function set$$1(value) {
                        this._frontValue = value;
                        this._textFront.textContent = value;
                    },
                    get: function get$$1() {
                        return this._frontValue;
                    }
                },
                {
                    key: 'back',
                    set: function set$$1(value) {
                        this._backValue = value;
                        this._textBack.textContent = value;
                    },
                    get: function get$$1() {
                        return this._backValue;
                    }
                },
                {
                    key: 'highlightBack',
                    set: function set$$1(value) {
                        this._highlightBack.style.opacity = value;
                    }
                },
                {
                    key: 'shadowBack',
                    set: function set$$1(value) {
                        this._shadowBack.style.opacity = value;
                    }
                },
                {
                    key: 'shadowFront',
                    set: function set$$1(value) {
                        this._shadowFront.style.opacity = value;
                    }
                }
            ]);
            return FlipCard;
        }();
        /**
  * Expose
  */ return function(root) {
            var state = {
                cards: [],
                lastCard: null,
                initialCard: null,
                shadowAbove: null,
                shadowBelow: null,
                shadowCard: null,
                currentValue: null,
                lastValue: null,
                front: null,
                back: null
            };
            return Object.assign({}, rooter(state, root, 'flip'), updater(state), styler(state, {
                flipDuration: 800,
                flipEasing: 'ease-out-bounce'
            }), drawer(state, draw), destroyer(state));
        };
    };
    module.exports = index;
    module.exports.identifier = {
        name: 'flip',
        type: 'view'
    };
    return module.exports;
}() : null;


(0, $cb0f8e7917a333d8$export$2e2bcd8739ae039).plugin.add((0, $c693b55dabea771a$export$2e2bcd8739ae039));
var $be77b5faedcab601$export$2e2bcd8739ae039 = (0, $cb0f8e7917a333d8$export$2e2bcd8739ae039);


class $d6fbcaf2ae884da5$export$9ff5a644c2d64964 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    // required by HA
    setConfig(config) {
        this.config = config;
        // call set hass() to immediately adjust to a changed entity
        // while editing the entity in the card editor
        if (this._hass) this.hass = this._hass;
        if (!this._tick) this.setup();
    }
    // required by HA
    set hass(hass) {
        this._hass = hass;
    }
    static{
        // Load styles using LitElement
        this.styles = (0, $c457fb01bf7d3200$export$9dd6ff9ea0189349);
    }
    // Add tap listener
    constructor(){
        super();
        this.addEventListener('click', (e)=>this.handleTapAction(this.config));
    }
    // Create and configure the PQINA flip clock
    setup() {
        // Setup 'flip' subviews
        const units = [
            "hours",
            "minutes"
        ];
        if (this.config.showSeconds == true) units.push("seconds");
        const views = units.map((unit)=>{
            return {
                view: 'flip',
                transform: 'pad(00)',
                key: unit
            };
        });
        // Create the main flip-clock object
        this._tick = (0, $be77b5faedcab601$export$2e2bcd8739ae039).DOM.create({
            credits: false,
            view: {
                children: [
                    {
                        root: 'div',
                        layout: 'horizontal fill',
                        children: views
                    }
                ]
            },
            didInit: (tick)=>{
                // Add timer to update the clock each second
                this._timer = (0, $be77b5faedcab601$export$2e2bcd8739ae039).helper.interval(()=>{
                    tick.value = this.getClockValue();
                });
            }
        });
    }
    // Lit callback where we (re)start the timer when the clock is shown (again)
    connectedCallback() {
        super.connectedCallback();
        this._timer?.reset();
    }
    // Lit callback where we stop the timer when the clock is removed
    disconnectedCallback() {
        super.disconnectedCallback();
        this._timer?.stop();
    }
    // Lit callback for the HTML template
    render() {
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
      <ha-card>
        <div class="card-content">
          <div class="clock"></div>
        </div>
      </ha-card>
    `;
    }
    // Lit callback when the HTML template was loaded / updated
    updated() {
        // HTML template re-created? Add clock to new parent
        const parent = this._tick.root.parentNode;
        if (parent) parent.removeChild(this._tick.root);
        this.shadowRoot.querySelector('.clock').appendChild(this._tick.root);
        this.updateCssVars();
    }
    // Apply the CSS vars according the config options set by the user
    updateCssVars() {
        const card = this.shadowRoot.querySelector('ha-card');
        card.style.setProperty('--ha-card-border-color', this.config.hideBackground ? 'transparent' : '');
        card.style.setProperty('--ha-card-background', this.config.hideBackground ? 'transparent' : '');
        // Set default height based on the showSeconds setting
        card.style.setProperty('--height', this.config.showSeconds ? '30cqw' : '45cqw');
        card.style.setProperty('--font-size', this.config.showSeconds ? '20cqw' : '30cqw');
        const cardContent = this.shadowRoot.querySelector('.card-content');
        if (this.config.styles) Object.entries(this.config.styles).forEach(([key, value])=>{
            const kebapCaseKey = key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
            cardContent.style.setProperty(`--${kebapCaseKey}`, value || "");
        });
    }
    // Called each second by the flip-clock timer to update the shwon values
    getClockValue() {
        const serverTimeZone = this._hass?.config?.time_zone;
        const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userLocals = this._hass?.locale;
        const timeZoneSetting = userLocals?.time_zone;
        const timeZone = timeZoneSetting === 'server' ? serverTimeZone : browserTimeZone;
        const date = new Date(new Date().toLocaleString("en-US", {
            timeZone: timeZone
        }));
        const hours = this.config.twentyFourHourFormat ? date.getHours() : date.getHours() % 12 || 12;
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const value = {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
        return value;
    }
    // Call user configured tap action
    handleTapAction(config) {
        if (config.tap_action) {
            const actionConfig = {
                entity: config.entity,
                tap_action: config.tap_action
            };
            const event = new Event("hass-action", {
                bubbles: true,
                composed: true
            });
            event.detail = {
                config: actionConfig,
                action: "tap"
            };
            this.dispatchEvent(event);
        }
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $d6fbcaf2ae884da5$export$9ff5a644c2d64964.prototype, "config", void 0);


customElements.define("pqina-flip-clock-card", (0, $d6fbcaf2ae884da5$export$9ff5a644c2d64964));
// Register with HA
window.customCards = window.customCards || [];
window.customCards.push({
    type: "pqina-flip-clock-card",
    name: "PQINA flip clock card",
    description: "A flip clock for your dashboard using the PQINA flip component.\n  Github repository: https://github.com/Thyraz\n  Link to original component by PQINA: https://github.com/pqina/flip/"
});


//# sourceMappingURL=pqina-flip-clock-card.js.map
