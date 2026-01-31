
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
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


var $74ead214cebf2840$exports = {};
$74ead214cebf2840$exports = ":host {\n  --tc-spacing: 1rem;\n  --tc-indicator-spacing: .75rem;\n  --tc-indicator-width: .5rem;\n  -webkit-tap-highlight-color: transparent;\n}\n\nha-card {\n  flex-direction: column;\n  height: 100%;\n  transition: box-shadow .18s ease-in-out, border-color .18s ease-in-out;\n  display: flex;\n}\n\n[role=\"button\"] {\n  cursor: pointer;\n  pointer-events: auto;\n}\n\n.card-content {\n  overflow: auto;\n}\n\n.event {\n  margin-bottom: var(--tc-spacing);\n  align-items: flex-start;\n  display: flex;\n}\n\n.event:last-child {\n  margin-bottom: 0;\n}\n\n.indicator {\n  margin-right: var(--tc-indicator-spacing);\n  width: var(--tc-indicator-width);\n  border-radius: calc(var(--tc-indicator-width) / 2);\n  flex: none;\n  align-self: stretch;\n}\n\n.details {\n  flex: auto;\n}\n\n.title {\n  margin: 0;\n}\n\n.title strong {\n  font-weight: bold;\n}\n\n.title span {\n  color: var(--secondary-text-color);\n}\n\n.schedule {\n  color: var(--secondary-text-color);\n  margin: 0;\n}\n";


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


/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $ca7e425cc484d5ff$export$56cc687933817664 = (0, $107bb7d062dde330$export$99b43ad1ed32e735)(class extends (0, $107bb7d062dde330$export$befdefbdce210f91) {
    constructor(t){
        if (super(t), t.type !== (0, $107bb7d062dde330$export$9ba3b3f20a85bfa).ATTRIBUTE || "class" !== t.name || t.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
    }
    render(t) {
        return " " + Object.keys(t).filter((s)=>t[s]).join(" ") + " ";
    }
    update(s, [i]) {
        if (void 0 === this.st) {
            this.st = new Set, void 0 !== s.strings && (this.nt = new Set(s.strings.join(" ").split(/\s/).filter((t)=>"" !== t)));
            for(const t in i)i[t] && !this.nt?.has(t) && this.st.add(t);
            return this.render(i);
        }
        const r = s.element.classList;
        for (const t of this.st)t in i || (r.remove(t), this.st.delete(t));
        for(const t in i){
            const s = !!i[t];
            s === this.st.has(t) || this.nt?.has(t) || (s ? (r.add(t), this.st.add(t)) : (r.remove(t), this.st.delete(t)));
        }
        return 0, $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
});





/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $eebc81779975f478$export$f68dd208b5df064d = (o)=>o ?? (0, $f58f44579a4747ac$export$45b790e32b2810ee);




/**
 * A `StructFailure` represents a single specific failure in validation.
 */ /**
 * `StructError` objects are thrown (or returned) when validation fails.
 *
 * Validation logic is design to exit early for maximum performance. The error
 * represents the first error encountered during validation. For more detail,
 * the `error.failures` property is a generator function that can be run to
 * continue validation and receive all the failures in the data.
 */ class $31d2104789b21fc3$export$58cc9131e3e8861b extends TypeError {
    constructor(failure, failures){
        let cached;
        const { message: message, explanation: explanation, ...rest } = failure;
        const { path: path } = failure;
        const msg = path.length === 0 ? message : `At path: ${path.join('.')} -- ${message}`;
        super(explanation ?? msg);
        if (explanation != null) this.cause = msg;
        Object.assign(this, rest);
        this.name = this.constructor.name;
        this.failures = ()=>{
            return cached ?? (cached = [
                failure,
                ...failures()
            ]);
        };
    }
}
/**
 * Check if a value is an iterator.
 */ function $31d2104789b21fc3$var$isIterable(x) {
    return $31d2104789b21fc3$var$isObject(x) && typeof x[Symbol.iterator] === 'function';
}
/**
 * Check if a value is a plain object.
 */ function $31d2104789b21fc3$var$isObject(x) {
    return typeof x === 'object' && x != null;
}
/**
 * Check if a value is a non-array object.
 */ function $31d2104789b21fc3$var$isNonArrayObject(x) {
    return $31d2104789b21fc3$var$isObject(x) && !Array.isArray(x);
}
/**
 * Check if a value is a plain object.
 */ function $31d2104789b21fc3$var$isPlainObject(x) {
    if (Object.prototype.toString.call(x) !== '[object Object]') return false;
    const prototype = Object.getPrototypeOf(x);
    return prototype === null || prototype === Object.prototype;
}
/**
 * Return a value as a printable string.
 */ function $31d2104789b21fc3$var$print(value) {
    if (typeof value === 'symbol') return value.toString();
    return typeof value === 'string' ? JSON.stringify(value) : `${value}`;
}
/**
 * Shifts (removes and returns) the first value from the `input` iterator.
 * Like `Array.prototype.shift()` but for an `Iterator`.
 */ function $31d2104789b21fc3$var$shiftIterator(input) {
    const { done: done, value: value } = input.next();
    return done ? undefined : value;
}
/**
 * Convert a single validation result to a failure.
 */ function $31d2104789b21fc3$var$toFailure(result, context, struct, value) {
    if (result === true) return;
    else if (result === false) result = {};
    else if (typeof result === 'string') result = {
        message: result
    };
    const { path: path, branch: branch } = context;
    const { type: type } = struct;
    const { refinement: refinement, message: message = `Expected a value of type \`${type}\`${refinement ? ` with refinement \`${refinement}\`` : ''}, but received: \`${$31d2104789b21fc3$var$print(value)}\`` } = result;
    return {
        value: value,
        type: type,
        refinement: refinement,
        key: path[path.length - 1],
        path: path,
        branch: branch,
        ...result,
        message: message
    };
}
/**
 * Convert a validation result to an iterable of failures.
 */ function* $31d2104789b21fc3$var$toFailures(result, context, struct, value) {
    if (!$31d2104789b21fc3$var$isIterable(result)) result = [
        result
    ];
    for (const r of result){
        const failure = $31d2104789b21fc3$var$toFailure(r, context, struct, value);
        if (failure) yield failure;
    }
}
/**
 * Check a value against a struct, traversing deeply into nested values, and
 * returning an iterator of failures or success.
 */ function* $31d2104789b21fc3$var$run(value, struct, options = {}) {
    const { path: path = [], branch: branch = [
        value
    ], coerce: coerce = false, mask: mask = false } = options;
    const ctx = {
        path: path,
        branch: branch,
        mask: mask
    };
    if (coerce) value = struct.coercer(value, ctx);
    let status = 'valid';
    for (const failure of struct.validator(value, ctx)){
        failure.explanation = options.message;
        status = 'not_valid';
        yield [
            failure,
            undefined
        ];
    }
    for (let [k, v, s] of struct.entries(value, ctx)){
        const ts = $31d2104789b21fc3$var$run(v, s, {
            path: k === undefined ? path : [
                ...path,
                k
            ],
            branch: k === undefined ? branch : [
                ...branch,
                v
            ],
            coerce: coerce,
            mask: mask,
            message: options.message
        });
        for (const t of ts){
            if (t[0]) {
                status = t[0].refinement != null ? 'not_refined' : 'not_valid';
                yield [
                    t[0],
                    undefined
                ];
            } else if (coerce) {
                v = t[1];
                if (k === undefined) value = v;
                else if (value instanceof Map) value.set(k, v);
                else if (value instanceof Set) value.add(v);
                else if ($31d2104789b21fc3$var$isObject(value)) {
                    if (v !== undefined || k in value) value[k] = v;
                }
            }
        }
    }
    if (status !== 'not_valid') for (const failure of struct.refiner(value, ctx)){
        failure.explanation = options.message;
        status = 'not_refined';
        yield [
            failure,
            undefined
        ];
    }
    if (status === 'valid') yield [
        undefined,
        value
    ];
}
/**
 * `Struct` objects encapsulate the validation logic for a specific type of
 * values. Once constructed, you use the `assert`, `is` or `validate` helpers to
 * validate unknown input data against the struct.
 */ class $31d2104789b21fc3$export$eabc71f011df675a {
    constructor(props){
        const { type: type, schema: schema, validator: validator, refiner: refiner, coercer: coercer = (value)=>value, entries: entries = function*() {} } = props;
        this.type = type;
        this.schema = schema;
        this.entries = entries;
        this.coercer = coercer;
        if (validator) this.validator = (value, context)=>{
            const result = validator(value, context);
            return $31d2104789b21fc3$var$toFailures(result, context, this, value);
        };
        else this.validator = ()=>[];
        if (refiner) this.refiner = (value, context)=>{
            const result = refiner(value, context);
            return $31d2104789b21fc3$var$toFailures(result, context, this, value);
        };
        else this.refiner = ()=>[];
    }
    /**
     * Assert that a value passes the struct's validation, throwing if it doesn't.
     */ assert(value, message) {
        return $31d2104789b21fc3$export$a7a9523472993e97(value, this, message);
    }
    /**
     * Create a value with the struct's coercion logic, then validate it.
     */ create(value, message) {
        return $31d2104789b21fc3$export$185802fd694ee1f5(value, this, message);
    }
    /**
     * Check if a value passes the struct's validation.
     */ is(value) {
        return $31d2104789b21fc3$export$226b3eccf92c9ed9(value, this);
    }
    /**
     * Mask a value, coercing and validating it, but returning only the subset of
     * properties defined by the struct's schema. Masking applies recursively to
     * props of `object` structs only.
     */ mask(value, message) {
        return $31d2104789b21fc3$export$d99f0801a68bbcf1(value, this, message);
    }
    /**
     * Validate a value with the struct's validation logic, returning a tuple
     * representing the result.
     *
     * You may optionally pass `true` for the `coerce` argument to coerce
     * the value before attempting to validate it. If you do, the result will
     * contain the coerced result when successful. Also, `mask` will turn on
     * masking of the unknown `object` props recursively if passed.
     */ validate(value, options = {}) {
        return $31d2104789b21fc3$export$a22775fa5e2eebd9(value, this, options);
    }
}
/**
 * Assert that a value passes a struct, throwing if it doesn't.
 */ function $31d2104789b21fc3$export$a7a9523472993e97(value, struct, message) {
    const result = $31d2104789b21fc3$export$a22775fa5e2eebd9(value, struct, {
        message: message
    });
    if (result[0]) throw result[0];
}
/**
 * Create a value with the coercion logic of struct and validate it.
 */ function $31d2104789b21fc3$export$185802fd694ee1f5(value, struct, message) {
    const result = $31d2104789b21fc3$export$a22775fa5e2eebd9(value, struct, {
        coerce: true,
        message: message
    });
    if (result[0]) throw result[0];
    else return result[1];
}
/**
 * Mask a value, returning only the subset of properties defined by a struct.
 */ function $31d2104789b21fc3$export$d99f0801a68bbcf1(value, struct, message) {
    const result = $31d2104789b21fc3$export$a22775fa5e2eebd9(value, struct, {
        coerce: true,
        mask: true,
        message: message
    });
    if (result[0]) throw result[0];
    else return result[1];
}
/**
 * Check if a value passes a struct.
 */ function $31d2104789b21fc3$export$226b3eccf92c9ed9(value, struct) {
    const result = $31d2104789b21fc3$export$a22775fa5e2eebd9(value, struct);
    return !result[0];
}
/**
 * Validate a value against a struct, returning an error if invalid, or the
 * value (with potential coercion) if valid.
 */ function $31d2104789b21fc3$export$a22775fa5e2eebd9(value, struct, options = {}) {
    const tuples = $31d2104789b21fc3$var$run(value, struct, options);
    const tuple = $31d2104789b21fc3$var$shiftIterator(tuples);
    if (tuple[0]) {
        const error = new $31d2104789b21fc3$export$58cc9131e3e8861b(tuple[0], function*() {
            for (const t of tuples)if (t[0]) yield t[0];
        });
        return [
            error,
            undefined
        ];
    } else {
        const v = tuple[1];
        return [
            undefined,
            v
        ];
    }
}
function $31d2104789b21fc3$export$e6e34fd1f2686227(...Structs) {
    const isType = Structs[0].type === 'type';
    const schemas = Structs.map((s)=>s.schema);
    const schema = Object.assign({}, ...schemas);
    return isType ? $31d2104789b21fc3$export$bf9fb029d174d554(schema) : $31d2104789b21fc3$export$be5493f9613cbbe(schema);
}
/**
 * Define a new struct type with a custom validation function.
 */ function $31d2104789b21fc3$export$f36d6a7a5c09a23e(name, validator) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: name,
        schema: null,
        validator: validator
    });
}
/**
 * Create a new struct based on an existing struct, but the value is allowed to
 * be `undefined`. `log` will be called if the value is not `undefined`.
 */ function $31d2104789b21fc3$export$cdd73fc4100a6ef4(struct, log) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        ...struct,
        refiner: (value, ctx)=>value === undefined || struct.refiner(value, ctx),
        validator (value, ctx) {
            if (value === undefined) return true;
            else {
                log(value, ctx);
                return struct.validator(value, ctx);
            }
        }
    });
}
/**
 * Create a struct with dynamic validation logic.
 *
 * The callback will receive the value currently being validated, and must
 * return a struct object to validate it with. This can be useful to model
 * validation logic that changes based on its input.
 */ function $31d2104789b21fc3$export$7077912c31975674(fn) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'dynamic',
        schema: null,
        *entries (value, ctx) {
            const struct = fn(value, ctx);
            yield* struct.entries(value, ctx);
        },
        validator (value, ctx) {
            const struct = fn(value, ctx);
            return struct.validator(value, ctx);
        },
        coercer (value, ctx) {
            const struct = fn(value, ctx);
            return struct.coercer(value, ctx);
        },
        refiner (value, ctx) {
            const struct = fn(value, ctx);
            return struct.refiner(value, ctx);
        }
    });
}
/**
 * Create a struct with lazily evaluated validation logic.
 *
 * The first time validation is run with the struct, the callback will be called
 * and must return a struct object to use. This is useful for cases where you
 * want to have self-referential structs for nested data structures to avoid a
 * circular definition problem.
 */ function $31d2104789b21fc3$export$488013bae63b21da(fn) {
    let struct;
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'lazy',
        schema: null,
        *entries (value, ctx) {
            struct ?? (struct = fn());
            yield* struct.entries(value, ctx);
        },
        validator (value, ctx) {
            struct ?? (struct = fn());
            return struct.validator(value, ctx);
        },
        coercer (value, ctx) {
            struct ?? (struct = fn());
            return struct.coercer(value, ctx);
        },
        refiner (value, ctx) {
            struct ?? (struct = fn());
            return struct.refiner(value, ctx);
        }
    });
}
/**
 * Create a new struct based on an existing object struct, but excluding
 * specific properties.
 *
 * Like TypeScript's `Omit` utility.
 */ function $31d2104789b21fc3$export$30a06c8d3562193f(struct, keys) {
    const { schema: schema } = struct;
    const subschema = {
        ...schema
    };
    for (const key of keys)delete subschema[key];
    switch(struct.type){
        case 'type':
            return $31d2104789b21fc3$export$bf9fb029d174d554(subschema);
        default:
            return $31d2104789b21fc3$export$be5493f9613cbbe(subschema);
    }
}
/**
 * Create a new struct based on an existing object struct, but with all of its
 * properties allowed to be `undefined`.
 *
 * Like TypeScript's `Partial` utility.
 */ function $31d2104789b21fc3$export$e45945969df8035a(struct) {
    const isStruct = struct instanceof $31d2104789b21fc3$export$eabc71f011df675a;
    const schema = isStruct ? {
        ...struct.schema
    } : {
        ...struct
    };
    for(const key in schema)schema[key] = $31d2104789b21fc3$export$516e28dec6a4b6d4(schema[key]);
    if (isStruct && struct.type === 'type') return $31d2104789b21fc3$export$bf9fb029d174d554(schema);
    return $31d2104789b21fc3$export$be5493f9613cbbe(schema);
}
/**
 * Create a new struct based on an existing object struct, but only including
 * specific properties.
 *
 * Like TypeScript's `Pick` utility.
 */ function $31d2104789b21fc3$export$357523c63a2253b9(struct, keys) {
    const { schema: schema } = struct;
    const subschema = {};
    for (const key of keys)subschema[key] = schema[key];
    switch(struct.type){
        case 'type':
            return $31d2104789b21fc3$export$bf9fb029d174d554(subschema);
        default:
            return $31d2104789b21fc3$export$be5493f9613cbbe(subschema);
    }
}
/**
 * Define a new struct type with a custom validation function.
 *
 * @deprecated This function has been renamed to `define`.
 */ function $31d2104789b21fc3$export$8cf3da7c1c9174ea(name, validator) {
    console.warn('superstruct@0.11 - The `struct` helper has been renamed to `define`.');
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e(name, validator);
}
/**
 * Ensure that any value passes validation.
 */ function $31d2104789b21fc3$export$4154a199d7d90455() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('any', ()=>true);
}
function $31d2104789b21fc3$export$2f23118c22fb2630(Element) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'array',
        schema: Element,
        *entries (value) {
            if (Element && Array.isArray(value)) for (const [i, v] of value.entries())yield [
                i,
                v,
                Element
            ];
        },
        coercer (value) {
            return Array.isArray(value) ? value.slice() : value;
        },
        validator (value) {
            return Array.isArray(value) || `Expected an array value, but received: ${$31d2104789b21fc3$var$print(value)}`;
        }
    });
}
/**
 * Ensure that a value is a bigint.
 */ function $31d2104789b21fc3$export$a0f65b52274bcc00() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('bigint', (value)=>{
        return typeof value === 'bigint';
    });
}
/**
 * Ensure that a value is a boolean.
 */ function $31d2104789b21fc3$export$4a21f16c33752377() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('boolean', (value)=>{
        return typeof value === 'boolean';
    });
}
/**
 * Ensure that a value is a valid `Date`.
 *
 * Note: this also ensures that the value is *not* an invalid `Date` object,
 * which can occur when parsing a date fails but still returns a `Date`.
 */ function $31d2104789b21fc3$export$324d90190a8b822a() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('date', (value)=>{
        return value instanceof Date && !isNaN(value.getTime()) || `Expected a valid \`Date\` object, but received: ${$31d2104789b21fc3$var$print(value)}`;
    });
}
function $31d2104789b21fc3$export$9b16c434df8cc259(values) {
    const schema = {};
    const description = values.map((v)=>$31d2104789b21fc3$var$print(v)).join();
    for (const key of values)schema[key] = key;
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'enums',
        schema: schema,
        validator (value) {
            return values.includes(value) || `Expected one of \`${description}\`, but received: ${$31d2104789b21fc3$var$print(value)}`;
        }
    });
}
/**
 * Ensure that a value is a function.
 */ function $31d2104789b21fc3$export$86951950244e2001() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('func', (value)=>{
        return typeof value === 'function' || `Expected a function, but received: ${$31d2104789b21fc3$var$print(value)}`;
    });
}
/**
 * Ensure that a value is an instance of a specific class.
 */ function $31d2104789b21fc3$export$9544d5bb712b01ea(Class) {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('instance', (value)=>{
        return value instanceof Class || `Expected a \`${Class.name}\` instance, but received: ${$31d2104789b21fc3$var$print(value)}`;
    });
}
/**
 * Ensure that a value is an integer.
 */ function $31d2104789b21fc3$export$32744b5b3bba4764() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('integer', (value)=>{
        return typeof value === 'number' && !isNaN(value) && Number.isInteger(value) || `Expected an integer, but received: ${$31d2104789b21fc3$var$print(value)}`;
    });
}
/**
 * Ensure that a value matches all of a set of types.
 */ function $31d2104789b21fc3$export$bc86dfbf7795668c(Structs) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'intersection',
        schema: null,
        *entries (value, ctx) {
            for (const S of Structs)yield* S.entries(value, ctx);
        },
        *validator (value, ctx) {
            for (const S of Structs)yield* S.validator(value, ctx);
        },
        *refiner (value, ctx) {
            for (const S of Structs)yield* S.refiner(value, ctx);
        }
    });
}
function $31d2104789b21fc3$export$c8ec6e1ec9fefcb0(constant) {
    const description = $31d2104789b21fc3$var$print(constant);
    const t = typeof constant;
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'literal',
        schema: t === 'string' || t === 'number' || t === 'boolean' ? constant : null,
        validator (value) {
            return value === constant || `Expected the literal \`${description}\`, but received: ${$31d2104789b21fc3$var$print(value)}`;
        }
    });
}
function $31d2104789b21fc3$export$871de8747c9eaa88(Key, Value) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'map',
        schema: null,
        *entries (value) {
            if (Key && Value && value instanceof Map) for (const [k, v] of value.entries()){
                yield [
                    k,
                    k,
                    Key
                ];
                yield [
                    k,
                    v,
                    Value
                ];
            }
        },
        coercer (value) {
            return value instanceof Map ? new Map(value) : value;
        },
        validator (value) {
            return value instanceof Map || `Expected a \`Map\` object, but received: ${$31d2104789b21fc3$var$print(value)}`;
        }
    });
}
/**
 * Ensure that no value ever passes validation.
 */ function $31d2104789b21fc3$export$b3e22bcfd64c1022() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('never', ()=>false);
}
/**
 * Augment an existing struct to allow `null` values.
 */ function $31d2104789b21fc3$export$133fc36489ac9add(struct) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        ...struct,
        validator: (value, ctx)=>value === null || struct.validator(value, ctx),
        refiner: (value, ctx)=>value === null || struct.refiner(value, ctx)
    });
}
/**
 * Ensure that a value is a number.
 */ function $31d2104789b21fc3$export$98e628dec113755e() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('number', (value)=>{
        return typeof value === 'number' && !isNaN(value) || `Expected a number, but received: ${$31d2104789b21fc3$var$print(value)}`;
    });
}
function $31d2104789b21fc3$export$be5493f9613cbbe(schema) {
    const knowns = schema ? Object.keys(schema) : [];
    const Never = $31d2104789b21fc3$export$b3e22bcfd64c1022();
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'object',
        schema: schema ? schema : null,
        *entries (value) {
            if (schema && $31d2104789b21fc3$var$isObject(value)) {
                const unknowns = new Set(Object.keys(value));
                for (const key of knowns){
                    unknowns.delete(key);
                    yield [
                        key,
                        value[key],
                        schema[key]
                    ];
                }
                for (const key of unknowns)yield [
                    key,
                    value[key],
                    Never
                ];
            }
        },
        validator (value) {
            return $31d2104789b21fc3$var$isNonArrayObject(value) || `Expected an object, but received: ${$31d2104789b21fc3$var$print(value)}`;
        },
        coercer (value, ctx) {
            if (!$31d2104789b21fc3$var$isNonArrayObject(value)) return value;
            const coerced = {
                ...value
            };
            // The `object` struct has special behaviour enabled by the mask flag.
            // When masking, properties that are not in the schema are deleted from
            // the coerced object instead of eventually failing validaiton.
            if (ctx.mask && schema) {
                for(const key in coerced)if (schema[key] === undefined) delete coerced[key];
            }
            return coerced;
        }
    });
}
/**
 * Augment a struct to allow `undefined` values.
 */ function $31d2104789b21fc3$export$516e28dec6a4b6d4(struct) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        ...struct,
        validator: (value, ctx)=>value === undefined || struct.validator(value, ctx),
        refiner: (value, ctx)=>value === undefined || struct.refiner(value, ctx)
    });
}
/**
 * Ensure that a value is an object with keys and values of specific types, but
 * without ensuring any specific shape of properties.
 *
 * Like TypeScript's `Record` utility.
 */ function $31d2104789b21fc3$export$e5185e241753e543(Key, Value) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'record',
        schema: null,
        *entries (value) {
            if ($31d2104789b21fc3$var$isObject(value)) for(const k in value){
                const v = value[k];
                yield [
                    k,
                    k,
                    Key
                ];
                yield [
                    k,
                    v,
                    Value
                ];
            }
        },
        validator (value) {
            return $31d2104789b21fc3$var$isNonArrayObject(value) || `Expected an object, but received: ${$31d2104789b21fc3$var$print(value)}`;
        },
        coercer (value) {
            return $31d2104789b21fc3$var$isNonArrayObject(value) ? {
                ...value
            } : value;
        }
    });
}
/**
 * Ensure that a value is a `RegExp`.
 *
 * Note: this does not test the value against the regular expression! For that
 * you need to use the `pattern()` refinement.
 */ function $31d2104789b21fc3$export$efdc1e5bdb609bb() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('regexp', (value)=>{
        return value instanceof RegExp;
    });
}
function $31d2104789b21fc3$export$adaa4cf7ef1b65be(Element) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'set',
        schema: null,
        *entries (value) {
            if (Element && value instanceof Set) for (const v of value)yield [
                v,
                v,
                Element
            ];
        },
        coercer (value) {
            return value instanceof Set ? new Set(value) : value;
        },
        validator (value) {
            return value instanceof Set || `Expected a \`Set\` object, but received: ${$31d2104789b21fc3$var$print(value)}`;
        }
    });
}
/**
 * Ensure that a value is a string.
 */ function $31d2104789b21fc3$export$22b082955e083ec3() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('string', (value)=>{
        return typeof value === 'string' || `Expected a string, but received: ${$31d2104789b21fc3$var$print(value)}`;
    });
}
/**
 * Ensure that a value is a tuple of a specific length, and that each of its
 * elements is of a specific type.
 */ function $31d2104789b21fc3$export$65e3907585753458(Structs) {
    const Never = $31d2104789b21fc3$export$b3e22bcfd64c1022();
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'tuple',
        schema: null,
        *entries (value) {
            if (Array.isArray(value)) {
                const length = Math.max(Structs.length, value.length);
                for(let i = 0; i < length; i++)yield [
                    i,
                    value[i],
                    Structs[i] || Never
                ];
            }
        },
        validator (value) {
            return Array.isArray(value) || `Expected an array, but received: ${$31d2104789b21fc3$var$print(value)}`;
        },
        coercer (value) {
            return Array.isArray(value) ? value.slice() : value;
        }
    });
}
/**
 * Ensure that a value has a set of known properties of specific types.
 *
 * Note: Unrecognized properties are allowed and untouched. This is similar to
 * how TypeScript's structural typing works.
 */ function $31d2104789b21fc3$export$bf9fb029d174d554(schema) {
    const keys = Object.keys(schema);
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'type',
        schema: schema,
        *entries (value) {
            if ($31d2104789b21fc3$var$isObject(value)) for (const k of keys)yield [
                k,
                value[k],
                schema[k]
            ];
        },
        validator (value) {
            return $31d2104789b21fc3$var$isNonArrayObject(value) || `Expected an object, but received: ${$31d2104789b21fc3$var$print(value)}`;
        },
        coercer (value) {
            return $31d2104789b21fc3$var$isNonArrayObject(value) ? {
                ...value
            } : value;
        }
    });
}
/**
 * Ensure that a value matches one of a set of types.
 */ function $31d2104789b21fc3$export$971dd5b0dfd021b6(Structs) {
    const description = Structs.map((s)=>s.type).join(' | ');
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        type: 'union',
        schema: null,
        coercer (value, ctx) {
            for (const S of Structs){
                const [error, coerced] = S.validate(value, {
                    coerce: true,
                    mask: ctx.mask
                });
                if (!error) return coerced;
            }
            return value;
        },
        validator (value, ctx) {
            const failures = [];
            for (const S of Structs){
                const [...tuples] = $31d2104789b21fc3$var$run(value, S, ctx);
                const [first] = tuples;
                if (!first[0]) return [];
                else {
                    for (const [failure] of tuples)if (failure) failures.push(failure);
                }
            }
            return [
                `Expected the value to satisfy a union of \`${description}\`, but received: ${$31d2104789b21fc3$var$print(value)}`,
                ...failures
            ];
        }
    });
}
/**
 * Ensure that any value passes validation, without widening its type to `any`.
 */ function $31d2104789b21fc3$export$19282c40b967aec6() {
    return $31d2104789b21fc3$export$f36d6a7a5c09a23e('unknown', ()=>true);
}
/**
 * Augment a `Struct` to add an additional coercion step to its input.
 *
 * This allows you to transform input data before validating it, to increase the
 * likelihood that it passes validation—for example for default values, parsing
 * different formats, etc.
 *
 * Note: You must use `create(value, Struct)` on the value to have the coercion
 * take effect! Using simply `assert()` or `is()` will not use coercion.
 */ function $31d2104789b21fc3$export$8c14e57e778d3873(struct, condition, coercer) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        ...struct,
        coercer: (value, ctx)=>{
            return $31d2104789b21fc3$export$226b3eccf92c9ed9(value, condition) ? struct.coercer(coercer(value, ctx), ctx) : struct.coercer(value, ctx);
        }
    });
}
/**
 * Augment a struct to replace `undefined` values with a default.
 *
 * Note: You must use `create(value, Struct)` on the value to have the coercion
 * take effect! Using simply `assert()` or `is()` will not use coercion.
 */ function $31d2104789b21fc3$export$83c510c4356017ae(struct, fallback, options = {}) {
    return $31d2104789b21fc3$export$8c14e57e778d3873(struct, $31d2104789b21fc3$export$19282c40b967aec6(), (x)=>{
        const f = typeof fallback === 'function' ? fallback() : fallback;
        if (x === undefined) return f;
        if (!options.strict && $31d2104789b21fc3$var$isPlainObject(x) && $31d2104789b21fc3$var$isPlainObject(f)) {
            const ret = {
                ...x
            };
            let changed = false;
            for(const key in f)if (ret[key] === undefined) {
                ret[key] = f[key];
                changed = true;
            }
            if (changed) return ret;
        }
        return x;
    });
}
/**
 * Augment a struct to trim string inputs.
 *
 * Note: You must use `create(value, Struct)` on the value to have the coercion
 * take effect! Using simply `assert()` or `is()` will not use coercion.
 */ function $31d2104789b21fc3$export$41f369984ed28930(struct) {
    return $31d2104789b21fc3$export$8c14e57e778d3873(struct, $31d2104789b21fc3$export$22b082955e083ec3(), (x)=>x.trim());
}
/**
 * Ensure that a string, array, map, or set is empty.
 */ function $31d2104789b21fc3$export$6e22c362a0406a2c(struct) {
    return $31d2104789b21fc3$export$edc9d475108b3212(struct, 'empty', (value)=>{
        const size = $31d2104789b21fc3$var$getSize(value);
        return size === 0 || `Expected an empty ${struct.type} but received one with a size of \`${size}\``;
    });
}
function $31d2104789b21fc3$var$getSize(value) {
    if (value instanceof Map || value instanceof Set) return value.size;
    else return value.length;
}
/**
 * Ensure that a number or date is below a threshold.
 */ function $31d2104789b21fc3$export$8960430cfd85939f(struct, threshold, options = {}) {
    const { exclusive: exclusive } = options;
    return $31d2104789b21fc3$export$edc9d475108b3212(struct, 'max', (value)=>{
        return exclusive ? value < threshold : value <= threshold || `Expected a ${struct.type} less than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
    });
}
/**
 * Ensure that a number or date is above a threshold.
 */ function $31d2104789b21fc3$export$96ec731ed4dcb222(struct, threshold, options = {}) {
    const { exclusive: exclusive } = options;
    return $31d2104789b21fc3$export$edc9d475108b3212(struct, 'min', (value)=>{
        return exclusive ? value > threshold : value >= threshold || `Expected a ${struct.type} greater than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
    });
}
/**
 * Ensure that a string, array, map or set is not empty.
 */ function $31d2104789b21fc3$export$6ce6c9218151d511(struct) {
    return $31d2104789b21fc3$export$edc9d475108b3212(struct, 'nonempty', (value)=>{
        const size = $31d2104789b21fc3$var$getSize(value);
        return size > 0 || `Expected a nonempty ${struct.type} but received an empty one`;
    });
}
/**
 * Ensure that a string matches a regular expression.
 */ function $31d2104789b21fc3$export$24f82734ea047e6f(struct, regexp) {
    return $31d2104789b21fc3$export$edc9d475108b3212(struct, 'pattern', (value)=>{
        return regexp.test(value) || `Expected a ${struct.type} matching \`/${regexp.source}/\` but received "${value}"`;
    });
}
/**
 * Ensure that a string, array, number, date, map, or set has a size (or length, or time) between `min` and `max`.
 */ function $31d2104789b21fc3$export$346677f925de839c(struct, min, max = min) {
    const expected = `Expected a ${struct.type}`;
    const of = min === max ? `of \`${min}\`` : `between \`${min}\` and \`${max}\``;
    return $31d2104789b21fc3$export$edc9d475108b3212(struct, 'size', (value)=>{
        if (typeof value === 'number' || value instanceof Date) return min <= value && value <= max || `${expected} ${of} but received \`${value}\``;
        else if (value instanceof Map || value instanceof Set) {
            const { size: size } = value;
            return min <= size && size <= max || `${expected} with a size ${of} but received one with a size of \`${size}\``;
        } else {
            const { length: length } = value;
            return min <= length && length <= max || `${expected} with a length ${of} but received one with a length of \`${length}\``;
        }
    });
}
/**
 * Augment a `Struct` to add an additional refinement to the validation.
 *
 * The refiner function is guaranteed to receive a value of the struct's type,
 * because the struct's existing validation will already have passed. This
 * allows you to layer additional validation on top of existing structs.
 */ function $31d2104789b21fc3$export$edc9d475108b3212(struct, name, refiner) {
    return new $31d2104789b21fc3$export$eabc71f011df675a({
        ...struct,
        *refiner (value, ctx) {
            yield* struct.refiner(value, ctx);
            const result = refiner(value, ctx);
            const failures = $31d2104789b21fc3$var$toFailures(result, ctx, struct, value);
            for (const failure of failures)yield {
                ...failure,
                refinement: name
            };
        }
    });
}


var $10cf09516003d1ae$exports = {};
!function(t, e) {
    $10cf09516003d1ae$exports = e();
}($10cf09516003d1ae$exports, function() {
    "use strict";
    var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = {
        name: "en",
        weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        ordinal: function(t) {
            var e = [
                "th",
                "st",
                "nd",
                "rd"
            ], n = t % 100;
            return "[" + t + (e[(n - 20) % 10] || e[n] || e[0]) + "]";
        }
    }, m = function(t, e, n) {
        var r = String(t);
        return !r || r.length >= e ? t : "" + Array(e + 1 - r.length).join(n) + t;
    }, v = {
        s: m,
        z: function(t) {
            var e = -t.utcOffset(), n = Math.abs(e), r = Math.floor(n / 60), i = n % 60;
            return (e <= 0 ? "+" : "-") + m(r, 2, "0") + ":" + m(i, 2, "0");
        },
        m: function t(e, n) {
            if (e.date() < n.date()) return -t(n, e);
            var r = 12 * (n.year() - e.year()) + (n.month() - e.month()), i = e.clone().add(r, c), s = n - i < 0, u = e.clone().add(r + (s ? -1 : 1), c);
            return +(-(r + (n - i) / (s ? i - u : u - i)) || 0);
        },
        a: function(t) {
            return t < 0 ? Math.ceil(t) || 0 : Math.floor(t);
        },
        p: function(t) {
            return ({
                M: c,
                y: h,
                w: o,
                d: a,
                D: d,
                h: u,
                m: s,
                s: i,
                ms: r,
                Q: f
            })[t] || String(t || "").toLowerCase().replace(/s$/, "");
        },
        u: function(t) {
            return void 0 === t;
        }
    }, g = "en", D = {};
    D[g] = M;
    var p = "$isDayjsObject", S = function(t) {
        return t instanceof _ || !(!t || !t[p]);
    }, w = function t(e, n, r) {
        var i;
        if (!e) return g;
        if ("string" == typeof e) {
            var s = e.toLowerCase();
            D[s] && (i = s), n && (D[s] = n, i = s);
            var u = e.split("-");
            if (!i && u.length > 1) return t(u[0]);
        } else {
            var a = e.name;
            D[a] = e, i = a;
        }
        return !r && i && (g = i), i || !r && g;
    }, O = function(t, e) {
        if (S(t)) return t.clone();
        var n = "object" == typeof e ? e : {};
        return n.date = t, n.args = arguments, new _(n);
    }, b = v;
    b.l = w, b.i = S, b.w = function(t, e) {
        return O(t, {
            locale: e.$L,
            utc: e.$u,
            x: e.$x,
            $offset: e.$offset
        });
    };
    var _ = function() {
        function M(t) {
            this.$L = w(t.locale, null, !0), this.parse(t), this.$x = this.$x || t.x || {}, this[p] = !0;
        }
        var m = M.prototype;
        return m.parse = function(t) {
            this.$d = function(t) {
                var e = t.date, n = t.utc;
                if (null === e) return new Date(NaN);
                if (b.u(e)) return new Date;
                if (e instanceof Date) return new Date(e);
                if ("string" == typeof e && !/Z$/i.test(e)) {
                    var r = e.match($);
                    if (r) {
                        var i = r[2] - 1 || 0, s = (r[7] || "0").substring(0, 3);
                        return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s);
                    }
                }
                return new Date(e);
            }(t), this.init();
        }, m.init = function() {
            var t = this.$d;
            this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
        }, m.$utils = function() {
            return b;
        }, m.isValid = function() {
            return !(this.$d.toString() === l);
        }, m.isSame = function(t, e) {
            var n = O(t);
            return this.startOf(e) <= n && n <= this.endOf(e);
        }, m.isAfter = function(t, e) {
            return O(t) < this.startOf(e);
        }, m.isBefore = function(t, e) {
            return this.endOf(e) < O(t);
        }, m.$g = function(t, e, n) {
            return b.u(t) ? this[e] : this.set(n, t);
        }, m.unix = function() {
            return Math.floor(this.valueOf() / 1e3);
        }, m.valueOf = function() {
            return this.$d.getTime();
        }, m.startOf = function(t, e) {
            var n = this, r = !!b.u(e) || e, f = b.p(t), l = function(t, e) {
                var i = b.w(n.$u ? Date.UTC(n.$y, e, t) : new Date(n.$y, e, t), n);
                return r ? i : i.endOf(a);
            }, $ = function(t, e) {
                return b.w(n.toDate()[t].apply(n.toDate("s"), (r ? [
                    0,
                    0,
                    0,
                    0
                ] : [
                    23,
                    59,
                    59,
                    999
                ]).slice(e)), n);
            }, y = this.$W, M = this.$M, m = this.$D, v = "set" + (this.$u ? "UTC" : "");
            switch(f){
                case h:
                    return r ? l(1, 0) : l(31, 11);
                case c:
                    return r ? l(1, M) : l(0, M + 1);
                case o:
                    var g = this.$locale().weekStart || 0, D = (y < g ? y + 7 : y) - g;
                    return l(r ? m - D : m + (6 - D), M);
                case a:
                case d:
                    return $(v + "Hours", 0);
                case u:
                    return $(v + "Minutes", 1);
                case s:
                    return $(v + "Seconds", 2);
                case i:
                    return $(v + "Milliseconds", 3);
                default:
                    return this.clone();
            }
        }, m.endOf = function(t) {
            return this.startOf(t, !1);
        }, m.$set = function(t, e) {
            var n, o = b.p(t), f = "set" + (this.$u ? "UTC" : ""), l = (n = {}, n[a] = f + "Date", n[d] = f + "Date", n[c] = f + "Month", n[h] = f + "FullYear", n[u] = f + "Hours", n[s] = f + "Minutes", n[i] = f + "Seconds", n[r] = f + "Milliseconds", n)[o], $ = o === a ? this.$D + (e - this.$W) : e;
            if (o === c || o === h) {
                var y = this.clone().set(d, 1);
                y.$d[l]($), y.init(), this.$d = y.set(d, Math.min(this.$D, y.daysInMonth())).$d;
            } else l && this.$d[l]($);
            return this.init(), this;
        }, m.set = function(t, e) {
            return this.clone().$set(t, e);
        }, m.get = function(t) {
            return this[b.p(t)]();
        }, m.add = function(r, f) {
            var d, l = this;
            r = Number(r);
            var $ = b.p(f), y = function(t) {
                var e = O(l);
                return b.w(e.date(e.date() + Math.round(t * r)), l);
            };
            if ($ === c) return this.set(c, this.$M + r);
            if ($ === h) return this.set(h, this.$y + r);
            if ($ === a) return y(1);
            if ($ === o) return y(7);
            var M = (d = {}, d[s] = e, d[u] = n, d[i] = t, d)[$] || 1, m = this.$d.getTime() + r * M;
            return b.w(m, this);
        }, m.subtract = function(t, e) {
            return this.add(-1 * t, e);
        }, m.format = function(t) {
            var e = this, n = this.$locale();
            if (!this.isValid()) return n.invalidDate || l;
            var r = t || "YYYY-MM-DDTHH:mm:ssZ", i = b.z(this), s = this.$H, u = this.$m, a = this.$M, o = n.weekdays, c = n.months, f = n.meridiem, h = function(t, n, i, s) {
                return t && (t[n] || t(e, r)) || i[n].slice(0, s);
            }, d = function(t) {
                return b.s(s % 12 || 12, t, "0");
            }, $ = f || function(t, e, n) {
                var r = t < 12 ? "AM" : "PM";
                return n ? r.toLowerCase() : r;
            };
            return r.replace(y, function(t, r) {
                return r || function(t) {
                    switch(t){
                        case "YY":
                            return String(e.$y).slice(-2);
                        case "YYYY":
                            return b.s(e.$y, 4, "0");
                        case "M":
                            return a + 1;
                        case "MM":
                            return b.s(a + 1, 2, "0");
                        case "MMM":
                            return h(n.monthsShort, a, c, 3);
                        case "MMMM":
                            return h(c, a);
                        case "D":
                            return e.$D;
                        case "DD":
                            return b.s(e.$D, 2, "0");
                        case "d":
                            return String(e.$W);
                        case "dd":
                            return h(n.weekdaysMin, e.$W, o, 2);
                        case "ddd":
                            return h(n.weekdaysShort, e.$W, o, 3);
                        case "dddd":
                            return o[e.$W];
                        case "H":
                            return String(s);
                        case "HH":
                            return b.s(s, 2, "0");
                        case "h":
                            return d(1);
                        case "hh":
                            return d(2);
                        case "a":
                            return $(s, u, !0);
                        case "A":
                            return $(s, u, !1);
                        case "m":
                            return String(u);
                        case "mm":
                            return b.s(u, 2, "0");
                        case "s":
                            return String(e.$s);
                        case "ss":
                            return b.s(e.$s, 2, "0");
                        case "SSS":
                            return b.s(e.$ms, 3, "0");
                        case "Z":
                            return i;
                    }
                    return null;
                }(t) || i.replace(":", "");
            });
        }, m.utcOffset = function() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m.diff = function(r, d, l) {
            var $, y = this, M = b.p(d), m = O(r), v = (m.utcOffset() - this.utcOffset()) * e, g = this - m, D = function() {
                return b.m(y, m);
            };
            switch(M){
                case h:
                    $ = D() / 12;
                    break;
                case c:
                    $ = D();
                    break;
                case f:
                    $ = D() / 3;
                    break;
                case o:
                    $ = (g - v) / 6048e5;
                    break;
                case a:
                    $ = (g - v) / 864e5;
                    break;
                case u:
                    $ = g / n;
                    break;
                case s:
                    $ = g / e;
                    break;
                case i:
                    $ = g / t;
                    break;
                default:
                    $ = g;
            }
            return l ? $ : b.a($);
        }, m.daysInMonth = function() {
            return this.endOf(c).$D;
        }, m.$locale = function() {
            return D[this.$L];
        }, m.locale = function(t, e) {
            if (!t) return this.$L;
            var n = this.clone(), r = w(t, e, !0);
            return r && (n.$L = r), n;
        }, m.clone = function() {
            return b.w(this.$d, this);
        }, m.toDate = function() {
            return new Date(this.valueOf());
        }, m.toJSON = function() {
            return this.isValid() ? this.toISOString() : null;
        }, m.toISOString = function() {
            return this.$d.toISOString();
        }, m.toString = function() {
            return this.$d.toUTCString();
        }, M;
    }(), k = _.prototype;
    return O.prototype = k, [
        [
            "$ms",
            r
        ],
        [
            "$s",
            i
        ],
        [
            "$m",
            s
        ],
        [
            "$H",
            u
        ],
        [
            "$W",
            a
        ],
        [
            "$M",
            c
        ],
        [
            "$y",
            h
        ],
        [
            "$D",
            d
        ]
    ].forEach(function(t) {
        k[t[1]] = function(e) {
            return this.$g(e, t[0], t[1]);
        };
    }), O.extend = function(t, e) {
        return t.$i || (t(e, _, O), t.$i = !0), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function(t) {
        return O(1e3 * t);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
});


const $871b7f5e2c44c545$export$a4ad2735b021c132 = "v1.1.1";
const $871b7f5e2c44c545$export$f5d9196f8cadab9c = "YYYY-MM-DDTHH:mm:ss";
const $871b7f5e2c44c545$export$d6d022218b69f60a = 60000;
const $871b7f5e2c44c545$export$6b2f91b528694fbe = [
    {
        value: "H:mm",
        label: "8:02"
    },
    {
        value: "HH:mm",
        label: "08:02"
    },
    {
        value: "h:mm A",
        label: "8:02 AM"
    },
    {
        value: "hh:mm A",
        label: "08:02 AM"
    },
    {
        value: "h:mm a",
        label: "8:02 am"
    },
    {
        value: "hh:mm a",
        label: "08:02 am"
    }
];
const $871b7f5e2c44c545$export$c2f8e0cc249a8d8f = {
    type: "custom:today-card",
    title: "",
    advance: 0,
    time_format: "HH:mm",
    fallback_color: "primary",
    show_all_day_events: true,
    show_past_events: false,
    tap_action: {
        action: "none"
    },
    entities: []
};



var $60726d1cf330a098$exports = {};
!function(e, o) {
    $60726d1cf330a098$exports = o();
}($60726d1cf330a098$exports, function() {
    "use strict";
    return function(e, o, t) {
        o.prototype.isToday = function() {
            var e = "YYYY-MM-DD", o = t();
            return this.format(e) === o.format(e);
        };
    };
});


var $fdc9628cb4e794f1$exports = {};
$fdc9628cb4e794f1$exports = JSON.parse('{"noEvents":{"title":"Keine Termine geplant","subtitle":"Mach was Sch\xf6nes"},"event":{"schedule":{"from":"Ab","until":"Bis"}},"config":{"stub":{"title":"Heutiger Terminplan"},"label":{"advance":"Vorlauf","clear":"Entfernen","color":"Farbe","content":"Inhalt","entities":"Entit\xe4ten","fallback_color":"Standard-Farbe","interactions":"Interaktionen","show_all_day_events":"Zeige ganzt\xe4gige Termine","show_past_events":"Zeige vergangene Termine","tap_action":"Verhalten beim Antippen","time_format":"Zeit-Darstellung","title":"Titel"}}}');


var $054e4e1ad88f0499$exports = {};
$054e4e1ad88f0499$exports = JSON.parse("{\"noEvents\":{\"title\":\"No events scheduled\",\"subtitle\":\"Do something nice\"},\"event\":{\"schedule\":{\"from\":\"From\",\"until\":\"Until\"}},\"config\":{\"stub\":{\"title\":\"Today's Schedule\"},\"label\":{\"advance\":\"Advance\",\"clear\":\"Clear\",\"color\":\"Color\",\"content\":\"Content\",\"entities\":\"Entities\",\"fallback_color\":\"Fallback Color\",\"interactions\":\"Interactions\",\"show_all_day_events\":\"Show all day events\",\"show_past_events\":\"Show past events\",\"tap_action\":\"Tap behaviour\",\"time_format\":\"Time Display Format\",\"title\":\"Title\"}}}");


var $fd81a0e2805c8367$exports = {};
$fd81a0e2805c8367$exports = JSON.parse('{"noEvents":{"title":"No hay eventos para hoy","subtitle":"Haz algo agradable"},"event":{"schedule":{"from":"Desde","until":"Hasta"}},"config":{"stub":{"title":"Calendario para hoy"},"label":{"advance":"Avanzar","clear":"Limpiar","color":"Color","content":"Contenido","entities":"Entidades","fallback_color":"Color de respaldo","interactions":"Interacciones","show_all_day_events":"Mostrar eventos de todo el d\xeda","show_past_events":"Mostrar eventos pasados","tap_action":"Comportamiento al pulsar","time_format":"Formato de hora","title":"T\xedtulo"}}}');


const $88a015c7fd66e985$var$globals = {
    hass: null
};
function $88a015c7fd66e985$export$7a9dbe976b949275(hass) {
    $88a015c7fd66e985$var$globals.hass = hass;
}
function $88a015c7fd66e985$export$3b37904969316850() {
    return $88a015c7fd66e985$var$globals.hass;
}


const $eed23d1e0fae6bb4$var$TRANSLATIONS = {
    de: $fdc9628cb4e794f1$exports,
    en: $054e4e1ad88f0499$exports,
    "en-GB": $054e4e1ad88f0499$exports,
    es: $fd81a0e2805c8367$exports
};
const $eed23d1e0fae6bb4$var$DEFAULT_LANG = "en";
function $eed23d1e0fae6bb4$var$getTranslatedString(lang, key) {
    try {
        return key.split(".").reduce((reduced, current)=>reduced[current], $eed23d1e0fae6bb4$var$TRANSLATIONS[lang]);
    } catch (error) {
        return undefined;
    }
}
function $eed23d1e0fae6bb4$export$2e2bcd8739ae039(key) {
    const lang = (0, $88a015c7fd66e985$export$3b37904969316850)()?.language ?? $eed23d1e0fae6bb4$var$DEFAULT_LANG;
    let translated;
    if ($eed23d1e0fae6bb4$var$TRANSLATIONS[lang]) translated = $eed23d1e0fae6bb4$var$getTranslatedString(lang, key);
    else translated = $eed23d1e0fae6bb4$var$getTranslatedString($eed23d1e0fae6bb4$var$DEFAULT_LANG, key);
    return translated ?? key;
}


$10cf09516003d1ae$exports.extend($60726d1cf330a098$exports);
class $bd29d17a049c2521$export$2e2bcd8739ae039 {
    constructor(rawEvent, entity, config){
        this.rawEvent = rawEvent;
        this.entity = entity;
        this.config = config;
    }
    get id() {
        return this.rawEvent.id || this.rawEvent.uid;
    }
    get color() {
        return this.entity.color ?? "currentColor";
    }
    get title() {
        return this.rawEvent.summary || "";
    }
    get description() {
        return this.rawEvent.description || "";
    }
    get location() {
        return this.rawEvent.location || "";
    }
    get start() {
        if (this.cachedStart === undefined) {
            if (this.rawEvent.start.date) this.cachedStart = $10cf09516003d1ae$exports(this.rawEvent.start.date).startOf("day");
            else this.cachedStart = $10cf09516003d1ae$exports(this.rawEvent.start.dateTime);
        }
        return this.cachedStart.clone();
    }
    get end() {
        if (this.cachedEnd === undefined) {
            if (this.rawEvent.start.date) this.cachedEnd = $10cf09516003d1ae$exports(this.rawEvent.end.date).subtract(1, "day").endOf("day");
            else this.cachedEnd = $10cf09516003d1ae$exports(this.rawEvent.end.dateTime);
        }
        return this.cachedEnd.clone();
    }
    get daySchedule() {
        return this.isMultiDay ? `(${this.currentDay}/${this.numberOfDays})` : null;
    }
    get timeSchedule() {
        if (this.isMultiDay && this.isFirstDay && !this.start.isSame(this.start.clone().startOf("day"), "minute")) return `${(0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("event.schedule.from")} ${this.start.format(this.config.time_format)}`;
        if (this.isMultiDay && this.isLastDay && !this.end.isSame(this.end.clone().endOf("day"), "minute")) return `${(0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("event.schedule.until")} ${this.end.format(this.config.time_format)}`;
        if (!this.isMultiDay && !this.isAllDay) return this.start.format(this.config.time_format) + " \u2013 " + this.end.format(this.config.time_format);
        return null;
    }
    get isInPast() {
        const now = $10cf09516003d1ae$exports().add(this.config.advance ?? 0, "days");
        return this.end.isBefore(now, "minute");
    }
    get isInFuture() {
        const now = $10cf09516003d1ae$exports().add(this.config.advance ?? 0, "days");
        return this.start.isAfter(now, "minute");
    }
    get isCurrent() {
        const now = $10cf09516003d1ae$exports().add(this.config.advance ?? 0, "days");
        return (this.start.isSame(now, "minute") || this.start.isBefore(now, "minute")) && (this.end.isSame(now, "minute") || this.end.isAfter(now, "minute"));
    }
    get isAllDay() {
        if (this.rawEvent.start.dateTime && this.rawEvent.end.dateTime) return false;
        if (this.rawEvent.start.date && this.rawEvent.end.date) return true;
        return this.isMultiDay && !this.isFirstDay && !this.isLastDay;
    }
    get isMultiDay() {
        return !this.start.isSame(this.end, "day");
    }
    get isFirstDay() {
        let now = $10cf09516003d1ae$exports().add(this.config.advance ?? 0, "days");
        return this.isMultiDay && this.start.isSame(now, "day");
    }
    get isLastDay() {
        let now = $10cf09516003d1ae$exports().add(this.config.advance ?? 0, "days");
        return this.isMultiDay && this.end.isSame(now, "day");
    }
    get numberOfDays() {
        if (this.cachedNumberOfDays === undefined) {
            let startDate = this.start.clone().startOf("day");
            let endDate = this.end.clone().endOf("day").add(1, "second");
            this.cachedNumberOfDays = Math.abs(startDate.diff(endDate, "day"));
        }
        return this.cachedNumberOfDays;
    }
    get currentDay() {
        if (this.cachedCurrentDay === undefined) {
            let startDate = this.start.clone().startOf("day");
            let now = $10cf09516003d1ae$exports().add(this.config.advance ?? 0, "days");
            let endDate = now.endOf("day").add(1, "second");
            this.cachedCurrentDay = Math.abs(startDate.diff(endDate, "day"));
        }
        return this.cachedCurrentDay;
    }
}


async function $4009c8c79cfbf5bf$export$3f41ece7d7128238(config, entities, hass) {
    const start = $10cf09516003d1ae$exports().startOf("day").add(config.advance ?? 0, "day");
    const end = $10cf09516003d1ae$exports().endOf("day").add(config.advance ?? 0, "day");
    const events = await $4009c8c79cfbf5bf$var$fetchEvents(entities, start, end, config, hass);
    return $4009c8c79cfbf5bf$var$sortEvents($4009c8c79cfbf5bf$var$filterEvents(events, config));
}
async function $4009c8c79cfbf5bf$var$fetchEvents(entities, start, end, config, hass) {
    const startTime = start.format((0, $871b7f5e2c44c545$export$f5d9196f8cadab9c));
    const endTime = end.format((0, $871b7f5e2c44c545$export$f5d9196f8cadab9c));
    const collectedEvents = [];
    const promises = [];
    entities.forEach((entity)=>{
        const url = `calendars/${entity.entity}?start=${startTime}&end=${endTime}`;
        promises.push(hass.callApi("GET", url).then((events)=>{
            return $4009c8c79cfbf5bf$var$transformEvents(events, entity, config);
        }).then((events)=>{
            collectedEvents.push(...events);
        }).catch((error)=>{
            console.error(error);
        }));
    });
    await Promise.all(promises);
    return collectedEvents;
}
function $4009c8c79cfbf5bf$var$transformEvents(events, entity, config) {
    return events.map((event)=>new (0, $bd29d17a049c2521$export$2e2bcd8739ae039)(event, entity, config));
}
function $4009c8c79cfbf5bf$var$filterEvents(events, config) {
    return events.filter((event)=>{
        if (event.isAllDay && event.end.isBefore($10cf09516003d1ae$exports().startOf("day").add(config.advance ?? 0, "day"))) return false;
        if (!config.show_all_day_events && event.isAllDay) return false;
        if (!config.show_past_events && event.isInPast) return false;
        return true;
    });
}
function $4009c8c79cfbf5bf$var$getCompareStart(event) {
    if (event.isMultiDay && !event.isFirstDay) return $10cf09516003d1ae$exports().startOf("day").unix();
    else return event.start.unix();
}
function $4009c8c79cfbf5bf$var$getCompareEnd(event) {
    if (event.isMultiDay && !event.isLastDay) return $10cf09516003d1ae$exports().unix();
    else return event.end.unix();
}
function $4009c8c79cfbf5bf$var$compareAllDayEvents(a, b) {
    let result = b.numberOfDays - a.numberOfDays;
    if (result === 0) result = b.currentDay - a.currentDay;
    if (result === 0) result = a.title.localeCompare(b.title);
    return result;
}
function $4009c8c79cfbf5bf$var$compareRegularEvents(a, b) {
    const startA = $4009c8c79cfbf5bf$var$getCompareStart(a);
    const startB = $4009c8c79cfbf5bf$var$getCompareStart(b);
    const endA = $4009c8c79cfbf5bf$var$getCompareEnd(a);
    const endB = $4009c8c79cfbf5bf$var$getCompareEnd(b);
    if (startA === startB) return endA - endB;
    return startA - startB;
}
function $4009c8c79cfbf5bf$var$sortEvents(events) {
    const allDayEvents = events.filter((event)=>event.isAllDay).sort($4009c8c79cfbf5bf$var$compareAllDayEvents);
    const regularEvents = events.filter((event)=>!event.isAllDay).sort($4009c8c79cfbf5bf$var$compareRegularEvents);
    return [
        ...allDayEvents,
        ...regularEvents
    ];
}


const $d522d8e307925026$export$fdb6dc7a780fc553 = [
    "light-blue",
    "amber",
    "light-green",
    "pink",
    "deep-purple",
    "deep-orange"
];
const $d522d8e307925026$export$e2de200118b21db9 = [
    "primary",
    "accent",
    "disabled",
    "red",
    "pink",
    "purple",
    "deep-purple",
    "indigo",
    "blue",
    "light-blue",
    "cyan",
    "teal",
    "green",
    "light-green",
    "lime",
    "yellow",
    "amber",
    "orange",
    "deep-orange",
    "brown",
    "light-grey",
    "grey",
    "dark-grey",
    "blue-grey",
    "black",
    "white"
];
function $d522d8e307925026$export$3cfa157f4300a653(index) {
    return $d522d8e307925026$export$fdb6dc7a780fc553[index % $d522d8e307925026$export$fdb6dc7a780fc553.length];
}
function $d522d8e307925026$export$50b01eff757f812a(color) {
    if (color === "" || color === null || color === undefined) color = "primary";
    if ($d522d8e307925026$export$e2de200118b21db9.includes(color)) return `var(--${color}-color)`;
    return color;
}




function $17c95cee15db08c3$export$b3d76adb44abe740(entity) {
    const hass = (0, $88a015c7fd66e985$export$3b37904969316850)();
    if (!hass) return entity;
    return hass.states[entity]?.attributes?.friendly_name ?? entity;
}
function $17c95cee15db08c3$export$62d0a8bd88cb8232(entities, assignColors = false) {
    return entities.map((entry, i)=>{
        if (typeof entry === "string") return {
            entity: entry,
            color: assignColors ? (0, $d522d8e307925026$export$3cfa157f4300a653)(i) : ""
        };
        return {
            entity: entry.entity,
            color: entry.color ?? (assignColors ? (0, $d522d8e307925026$export$3cfa157f4300a653)(i) : "")
        };
    }).filter((entry)=>{
        return entry.entity.startsWith("calendar.");
    });
}
function $17c95cee15db08c3$export$248d38f6296296c5(a, b) {
    if (a === b) return true;
    const bothAreObjects = a && b && typeof a === "object" && typeof b === "object";
    return Boolean(bothAreObjects && Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v])=>$17c95cee15db08c3$export$248d38f6296296c5(v, b[k])));
}





const $2372466848b565e1$var$baseActionConfigStruct = (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    action: (0, $31d2104789b21fc3$export$9b16c434df8cc259)([
        "call-service",
        "fire-dom-event",
        "navigate",
        "none",
        "perform-action",
        "url"
    ])
});
const $2372466848b565e1$var$urlActionConfigStruct = (0, $31d2104789b21fc3$export$e6e34fd1f2686227)($2372466848b565e1$var$baseActionConfigStruct, (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    action: (0, $31d2104789b21fc3$export$c8ec6e1ec9fefcb0)("url"),
    url_path: (0, $31d2104789b21fc3$export$22b082955e083ec3)()
}));
const $2372466848b565e1$var$serviceActionConfigStruct = (0, $31d2104789b21fc3$export$e6e34fd1f2686227)($2372466848b565e1$var$baseActionConfigStruct, (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    action: (0, $31d2104789b21fc3$export$9b16c434df8cc259)([
        "call-service",
        "perform-action"
    ]),
    service: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$22b082955e083ec3)()),
    perform_action: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$22b082955e083ec3)()),
    service_data: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$be5493f9613cbbe)()),
    data: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$be5493f9613cbbe)()),
    target: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$be5493f9613cbbe)({
        entity_id: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$971dd5b0dfd021b6)([
            (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
            (0, $31d2104789b21fc3$export$2f23118c22fb2630)((0, $31d2104789b21fc3$export$22b082955e083ec3)())
        ])),
        device_id: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$971dd5b0dfd021b6)([
            (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
            (0, $31d2104789b21fc3$export$2f23118c22fb2630)((0, $31d2104789b21fc3$export$22b082955e083ec3)())
        ])),
        area_id: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$971dd5b0dfd021b6)([
            (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
            (0, $31d2104789b21fc3$export$2f23118c22fb2630)((0, $31d2104789b21fc3$export$22b082955e083ec3)())
        ])),
        floor_id: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$971dd5b0dfd021b6)([
            (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
            (0, $31d2104789b21fc3$export$2f23118c22fb2630)((0, $31d2104789b21fc3$export$22b082955e083ec3)())
        ])),
        label_id: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$971dd5b0dfd021b6)([
            (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
            (0, $31d2104789b21fc3$export$2f23118c22fb2630)((0, $31d2104789b21fc3$export$22b082955e083ec3)())
        ]))
    }))
}));
const $2372466848b565e1$var$navigateActionConfigStruct = (0, $31d2104789b21fc3$export$e6e34fd1f2686227)($2372466848b565e1$var$baseActionConfigStruct, (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    action: (0, $31d2104789b21fc3$export$c8ec6e1ec9fefcb0)("navigate"),
    navigation_path: (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
    navigation_replace: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$4a21f16c33752377)())
}));
const $2372466848b565e1$var$customActionConfigStruct = (0, $31d2104789b21fc3$export$e6e34fd1f2686227)($2372466848b565e1$var$baseActionConfigStruct, (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    action: (0, $31d2104789b21fc3$export$c8ec6e1ec9fefcb0)("fire-dom-event")
}));
const $2372466848b565e1$var$noActionConfigStruct = (0, $31d2104789b21fc3$export$e6e34fd1f2686227)($2372466848b565e1$var$baseActionConfigStruct, (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    action: (0, $31d2104789b21fc3$export$c8ec6e1ec9fefcb0)("none")
}));
const $2372466848b565e1$export$a244fac3834ec6ab = (0, $31d2104789b21fc3$export$7077912c31975674)((value)=>{
    if (value && typeof value === "object" && "action" in value) switch(value.action){
        case "call-service":
            return $2372466848b565e1$var$serviceActionConfigStruct;
        case "perform-action":
            return $2372466848b565e1$var$serviceActionConfigStruct;
        case "fire-dom-event":
            return $2372466848b565e1$var$customActionConfigStruct;
        case "navigate":
            return $2372466848b565e1$var$navigateActionConfigStruct;
        case "url":
            return $2372466848b565e1$var$urlActionConfigStruct;
        case "none":
            return $2372466848b565e1$var$noActionConfigStruct;
    }
    return $2372466848b565e1$var$baseActionConfigStruct;
});


const $28f3932bd20cd0e6$export$e9443a6f6c098a05 = (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    type: (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
    view_layout: (0, $31d2104789b21fc3$export$4154a199d7d90455)(),
    layout_options: (0, $31d2104789b21fc3$export$4154a199d7d90455)(),
    grid_options: (0, $31d2104789b21fc3$export$4154a199d7d90455)(),
    visibility: (0, $31d2104789b21fc3$export$4154a199d7d90455)(),
    card_mod: (0, $31d2104789b21fc3$export$4154a199d7d90455)()
});
const $28f3932bd20cd0e6$export$a5173a26899ec203 = (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    entity: (0, $31d2104789b21fc3$export$22b082955e083ec3)(),
    color: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$22b082955e083ec3)())
});
const $28f3932bd20cd0e6$export$22285aa75ed32e9a = (0, $31d2104789b21fc3$export$e6e34fd1f2686227)($28f3932bd20cd0e6$export$e9443a6f6c098a05, (0, $31d2104789b21fc3$export$be5493f9613cbbe)({
    title: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$22b082955e083ec3)()),
    advance: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$98e628dec113755e)()),
    time_format: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$22b082955e083ec3)()),
    fallback_color: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$22b082955e083ec3)()),
    show_all_day_events: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$4a21f16c33752377)()),
    show_past_events: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $31d2104789b21fc3$export$4a21f16c33752377)()),
    tap_action: (0, $31d2104789b21fc3$export$516e28dec6a4b6d4)((0, $2372466848b565e1$export$a244fac3834ec6ab)),
    entities: (0, $31d2104789b21fc3$export$971dd5b0dfd021b6)([
        (0, $31d2104789b21fc3$export$2f23118c22fb2630)((0, $31d2104789b21fc3$export$22b082955e083ec3)()),
        (0, $31d2104789b21fc3$export$2f23118c22fb2630)($28f3932bd20cd0e6$export$a5173a26899ec203)
    ])
}));




const $b435f893db1f7b2c$export$43835e9acf248a15 = (node, type, detail, options)=>{
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};


const $37749d078d609935$export$6c6c3f4b7541eaf1 = async (node, _hass, config, action)=>{
    (0, $b435f893db1f7b2c$export$43835e9acf248a15)(node, "hass-action", {
        config: config,
        action: action
    });
};




const $3e11d8690c422fb1$var$getActionHandler = ()=>{
    const body = document.body;
    if (body.querySelector("action-handler")) return body.querySelector("action-handler");
    const actionHandler = document.createElement("action-handler");
    body.appendChild(actionHandler);
    return actionHandler;
};
const $3e11d8690c422fb1$export$520aee61eb0a2770 = (element, options)=>{
    const actionHandler = $3e11d8690c422fb1$var$getActionHandler();
    if (!actionHandler) return;
    actionHandler.bind(element, options);
};
const $3e11d8690c422fb1$export$8a44987212de21b = (0, $107bb7d062dde330$export$99b43ad1ed32e735)(class extends (0, $107bb7d062dde330$export$befdefbdce210f91) {
    update(part, [options]) {
        $3e11d8690c422fb1$export$520aee61eb0a2770(part.element, options);
        return 0, $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
    render(_options) {}
});


class $c10b83cfd2aef9cc$export$9ced9a1cfb12f6b7 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    static get styles() {
        return (0, $def2de46b9306e8a$export$8d80f9cac07cdb3)((0, (/*@__PURE__*/$parcel$interopDefault($74ead214cebf2840$exports))));
    }
    static getConfigElement() {
        return document.createElement("today-card-editor");
    }
    static getStubConfig(_hass, entities, entitiesFallback) {
        let calendarEntities = entities.filter((entityId)=>{
            entityId.startsWith("calendar.");
        });
        if (calendarEntities.length < 1) calendarEntities = entitiesFallback.filter((entityId)=>{
            entityId.startsWith("calendar.");
        });
        return {
            ...(0, $871b7f5e2c44c545$export$c2f8e0cc249a8d8f),
            title: (0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("config.stub.title"),
            entities: calendarEntities
        };
    }
    getLayoutOptions() {
        return {
            grid_columns: 4,
            grid_min_columns: 2,
            grid_min_rows: 2
        };
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.refreshInterval === undefined) this.refreshInterval = window.setInterval(()=>{
            this.updateEvents();
        }, (0, $871b7f5e2c44c545$export$d6d022218b69f60a));
    }
    disconnectedCallback() {
        window.clearInterval(this.refreshInterval);
        super.disconnectedCallback();
    }
    setConfig(config) {
        (0, $88a015c7fd66e985$export$7a9dbe976b949275)(this.hass);
        (0, $31d2104789b21fc3$export$a7a9523472993e97)(config, (0, $28f3932bd20cd0e6$export$22285aa75ed32e9a));
        let entities = (0, $17c95cee15db08c3$export$62d0a8bd88cb8232)(config.entities, true);
        this.config = {
            ...(0, $871b7f5e2c44c545$export$c2f8e0cc249a8d8f),
            ...config,
            entities: entities
        };
        this.entities = entities;
        this.updateEvents();
    }
    async updateEvents() {
        if (!this.hass || !this.config) return;
        this.events = await (0, $4009c8c79cfbf5bf$export$3f41ece7d7128238)(this.config, this.entities, this.hass);
        this.initialized = true;
    }
    hasAction(config) {
        return config?.action !== undefined && config.action !== "none";
    }
    handleTapAction(event) {
        const config = {
            tap_action: this.config.tap_action
        };
        (0, $37749d078d609935$export$6c6c3f4b7541eaf1)(this, this.hass, config, event.detail.action);
    }
    render() {
        if (!this.hass || !this.config) return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)``;
        (0, $88a015c7fd66e985$export$7a9dbe976b949275)(this.hass);
        if (!this.initialized) this.updateEvents();
        const actionable = this.hasAction(this.config.tap_action);
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
            <ha-card
                header="${this.config?.title || (0, $f58f44579a4747ac$export$45b790e32b2810ee)}"
                class="has-advance-of-${this.config?.advance || 0}"
                role=${(0, $eebc81779975f478$export$f68dd208b5df064d)(actionable ? "button" : undefined)}
                tabindex=${(0, $eebc81779975f478$export$f68dd208b5df064d)(actionable ? "0" : undefined)}
                @action=${this.handleTapAction}
                .actionHandler=${(0, $3e11d8690c422fb1$export$8a44987212de21b)()}
            >
                <div class="card-content">${this.renderEvents()}</div>
                ${actionable ? (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<ha-ripple></ha-ripple>` : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}
            </ha-card>
        `;
    }
    renderEvents() {
        let eventsHtml;
        if (!this.initialized) eventsHtml = (0, $f58f44579a4747ac$export$45b790e32b2810ee);
        else if (this.events.length === 0) eventsHtml = (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
                <div class="events">${this.renderFallback()}</div>
            `;
        else eventsHtml = this.events.map((event)=>{
            return this.renderEvent(event);
        });
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<div class="events">${eventsHtml}</div>`;
    }
    renderFallback() {
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
            <div class="event is-fallback">
                <div
                    class="indicator"
                    style="background-color: ${(0, $d522d8e307925026$export$50b01eff757f812a)(this.config.fallback_color)}"
                ></div>
                <div class="details">
                    <p class="title">
                        <strong>${(0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("noEvents.title")}</strong>
                    </p>
                    <p class="schedule">${(0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("noEvents.subtitle")}</p>
                </div>
            </div>
        `;
    }
    renderEvent(event) {
        const classes = {
            "is-all-day": event.isAllDay,
            "is-multi-day": event.isMultiDay,
            "is-first-day": event.isFirstDay,
            "is-last-day": event.isLastDay,
            "is-in-past": event.isInPast,
            "is-in-future": event.isInFuture,
            "is-current": event.isCurrent
        };
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
            <div class="event ${(0, $ca7e425cc484d5ff$export$56cc687933817664)(classes)}">
                <div
                    class="indicator"
                    style="background-color: ${(0, $d522d8e307925026$export$50b01eff757f812a)(event.color)}"
                ></div>
                <div class="details">
                    <p class="title">
                        <strong>${event.title}</strong>
                        ${event.daySchedule ? (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<span>${event.daySchedule}</span>` : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}
                    </p>
                    ${event.timeSchedule ? (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`<p class="schedule">${event.timeSchedule}</p>` : (0, $f58f44579a4747ac$export$45b790e32b2810ee)}
                </div>
            </div>
        `;
    }
    constructor(...args){
        super(...args), this.config = (0, $871b7f5e2c44c545$export$c2f8e0cc249a8d8f), this.entities = [], this.events = [], this.initialized = false;
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $9cd908ed2625c047$export$d541bacb2bda4494)({
        attribute: false
    })
], $c10b83cfd2aef9cc$export$9ced9a1cfb12f6b7.prototype, "hass", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $c10b83cfd2aef9cc$export$9ced9a1cfb12f6b7.prototype, "config", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $c10b83cfd2aef9cc$export$9ced9a1cfb12f6b7.prototype, "entities", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $c10b83cfd2aef9cc$export$9ced9a1cfb12f6b7.prototype, "events", void 0);
$c10b83cfd2aef9cc$export$9ced9a1cfb12f6b7 = (0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $14742f68afc766d6$export$da64fc29f17f9d0e)("today-card")
], $c10b83cfd2aef9cc$export$9ced9a1cfb12f6b7);



var $3b9ebaa78341b8be$exports = {};
$3b9ebaa78341b8be$exports = "ha-expansion-panel {\n  --expansion-panel-content-padding: 0;\n  --ha-card-border-radius: 6px;\n  border-radius: 6px;\n  margin-top: 24px;\n  display: block;\n}\n\nha-expansion-panel .content {\n  padding: 12px;\n}\n\nha-expansion-panel ha-svg-icon {\n  color: var(--secondary-text-color);\n}\n";






function $b4b17b8df77fb9b5$export$5b9848928059ec76() {
    if (!customElements.get("ha-entity-picker")) customElements.get("hui-entities-card")?.getConfigElement();
    if (!customElements.get("ha-form")) customElements.get("hui-entity-badge")?.getConfigElement();
}







const $6364f6b17ee9ff8f$export$442c9939d1f788e4 = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
const $6364f6b17ee9ff8f$export$1f790f39a878cb0d = "M10,9A1,1 0 0,1 11,8A1,1 0 0,1 12,9V13.47L13.21,13.6L18.15,15.79C18.68,16.03 19,16.56 19,17.14V21.5C18.97,22.32 18.32,22.97 17.5,23H11C10.62,23 10.26,22.85 10,22.57L5.1,18.37L5.84,17.6C6.03,17.39 6.3,17.28 6.58,17.28H6.8L10,19V9M11,5A4,4 0 0,1 15,9C15,10.5 14.2,11.77 13,12.46V11.24C13.61,10.69 14,9.89 14,9A3,3 0 0,0 11,6A3,3 0 0,0 8,9C8,9.89 8.39,10.69 9,11.24V12.46C7.8,11.77 7,10.5 7,9A4,4 0 0,1 11,5Z";
const $6364f6b17ee9ff8f$export$66c173049e50586f = "M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M7 7H9V9H7V7M7 11H9V13H7V11M7 15H9V17H7V15M17 17H11V15H17V17M17 13H11V11H17V13M17 9H11V7H17V9Z";
const $6364f6b17ee9ff8f$export$b868b5e1c2f090d4 = "M4,9H20V11H4V9M4,13H14V15H4V13Z";


const $303f8a79371fd306$var$supportedActions = [
    "navigate",
    "url",
    "perform-action",
    "none"
];
const $303f8a79371fd306$var$FORM_SCHEMA = [
    {
        name: "content",
        type: "expandable",
        flatten: true,
        iconPath: (0, $6364f6b17ee9ff8f$export$b868b5e1c2f090d4),
        schema: [
            {
                name: "",
                type: "grid",
                schema: [
                    {
                        name: "title",
                        selector: {
                            text: {}
                        }
                    },
                    {
                        name: "advance",
                        default: 0,
                        selector: {
                            number: {
                                mode: "box",
                                step: 1
                            }
                        }
                    }
                ]
            },
            {
                name: "",
                type: "grid",
                schema: [
                    {
                        name: "time_format",
                        selector: {
                            select: {
                                mode: "dropdown",
                                options: (0, $871b7f5e2c44c545$export$6b2f91b528694fbe)
                            }
                        }
                    },
                    {
                        name: "fallback_color",
                        selector: {
                            ui_color: {
                                default_color: "primary",
                                include_state: false,
                                include_none: true
                            }
                        }
                    }
                ]
            },
            {
                name: "",
                type: "grid",
                schema: [
                    {
                        name: "show_all_day_events",
                        selector: {
                            boolean: {}
                        }
                    },
                    {
                        name: "show_past_events",
                        selector: {
                            boolean: {}
                        }
                    }
                ]
            }
        ]
    },
    {
        name: "interactions",
        type: "expandable",
        flatten: true,
        iconPath: (0, $6364f6b17ee9ff8f$export$1f790f39a878cb0d),
        schema: [
            {
                name: "tap_action",
                selector: {
                    ui_action: {
                        default_action: "none",
                        actions: $303f8a79371fd306$var$supportedActions
                    }
                }
            }
        ]
    }
];
class $303f8a79371fd306$export$df9b238dabf0b75 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    static get styles() {
        return (0, $def2de46b9306e8a$export$8d80f9cac07cdb3)((0, (/*@__PURE__*/$parcel$interopDefault($3b9ebaa78341b8be$exports))));
    }
    connectedCallback() {
        super.connectedCallback();
        (0, $b4b17b8df77fb9b5$export$5b9848928059ec76)();
    }
    setConfig(config) {
        (0, $88a015c7fd66e985$export$7a9dbe976b949275)(this.hass);
        (0, $31d2104789b21fc3$export$a7a9523472993e97)(config, (0, $28f3932bd20cd0e6$export$22285aa75ed32e9a));
        let entities = (0, $17c95cee15db08c3$export$62d0a8bd88cb8232)(config.entities, false);
        this.config = {
            ...config,
            entities: entities
        };
        this.entities = entities;
    }
    render() {
        if (!this.hass || !this.config) return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)``;
        (0, $88a015c7fd66e985$export$7a9dbe976b949275)(this.hass);
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
            <ha-form
                .hass=${this.hass}
                .data=${this.config}
                .schema=${$303f8a79371fd306$var$FORM_SCHEMA}
                .computeLabel=${this.computeLabel}
                @value-changed=${this.valueChanged}
            ></ha-form>
            <ha-expansion-panel outlined>
                <div slot="header" role="heading" aria-level="3">
                    <ha-svg-icon .path=${0, $6364f6b17ee9ff8f$export$66c173049e50586f}></ha-svg-icon>
                    ${(0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("config.label.entities")}
                </div>
                <div class="content">
                    <today-card-entities-editor
                        .hass=${this.hass}
                        .entities=${this.entities}
                        @entities-changed=${this.entitiesChanged}
                    ></today-card-entities-editor>
                </div>
            </ha-expansion-panel>
        `;
    }
    valueChanged(event) {
        event.stopPropagation();
        if (!this.config || !this.hass) return;
        const newConfig = event.detail.value;
        if ((0, $17c95cee15db08c3$export$248d38f6296296c5)(newConfig, this.config)) return;
        (0, $b435f893db1f7b2c$export$43835e9acf248a15)(this, "config-changed", {
            config: newConfig
        });
    }
    entitiesChanged(event) {
        event.stopPropagation();
        if (!this.config || !this.hass) return;
        let config = {
            ...this.config,
            entities: event.detail.entities
        };
        (0, $b435f893db1f7b2c$export$43835e9acf248a15)(this, "config-changed", {
            config: config
        });
    }
    computeLabel(schema) {
        return (0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)(`config.label.${schema.name}`);
    }
    constructor(...args){
        super(...args), this.entities = [];
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $9cd908ed2625c047$export$d541bacb2bda4494)({
        attribute: false
    })
], $303f8a79371fd306$export$df9b238dabf0b75.prototype, "hass", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $303f8a79371fd306$export$df9b238dabf0b75.prototype, "config", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $303f8a79371fd306$export$df9b238dabf0b75.prototype, "entities", void 0);
$303f8a79371fd306$export$df9b238dabf0b75 = (0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $14742f68afc766d6$export$da64fc29f17f9d0e)("today-card-editor")
], $303f8a79371fd306$export$df9b238dabf0b75);




var $817c0f849eb0e3cb$exports = {};
$817c0f849eb0e3cb$exports = ".entity {\n  align-items: center;\n  margin-bottom: 8px;\n  display: flex;\n}\n\n.details {\n  flex: auto;\n  min-width: 0;\n  margin-right: 16px;\n}\n\n.name {\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-weight: bold;\n  display: block;\n  overflow: hidden;\n}\n\n.id {\n  color: var(--secondary-text-color);\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  display: block;\n  overflow: hidden;\n}\n\n.color-picker {\n  flex: 0;\n  margin-right: 16px;\n}\n\n.remove-icon {\n  --mdc-icon-button-size: 36px;\n  color: var(--secondary-text-color);\n  flex: 0;\n}\n";







/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const { I: $311430566e21b48b$var$t } = (0, $f58f44579a4747ac$export$8613d1ca9052b22e), $311430566e21b48b$export$c3825b437cbdea5c = (o)=>null === o || "object" != typeof o && "function" != typeof o, $311430566e21b48b$export$80c36ae3cab9881d = {
    HTML: 1,
    SVG: 2,
    MATHML: 3
}, $311430566e21b48b$export$6b6d145ec2a44ca9 = (o, t)=>void 0 === t ? void 0 !== o?._$litType$ : o?._$litType$ === t, $311430566e21b48b$export$6a0e8de894d2fcca = (o)=>null != o?._$litType$?.h, $311430566e21b48b$export$2f448fec17d50a3e = (o)=>void 0 !== o?._$litDirective$, $311430566e21b48b$export$f28e31de6a6eaf32 = (o)=>o?._$litDirective$, $311430566e21b48b$export$7f431ad0fff82fd9 = (o)=>void 0 === o.strings, $311430566e21b48b$var$s = ()=>document.createComment(""), $311430566e21b48b$export$291b2338ad9b0b30 = (o, i, n)=>{
    const e = o._$AA.parentNode, l = void 0 === i ? o._$AB : i._$AA;
    if (void 0 === n) {
        const i = e.insertBefore($311430566e21b48b$var$s(), l), c = e.insertBefore($311430566e21b48b$var$s(), l);
        n = new $311430566e21b48b$var$t(i, c, o, o.options);
    } else {
        const t = n._$AB.nextSibling, i = n._$AM, c = i !== o;
        if (c) {
            let t;
            n._$AQ?.(o), n._$AM = o, void 0 !== n._$AP && (t = o._$AU) !== i._$AU && n._$AP(t);
        }
        if (t !== l || c) {
            let o = n._$AA;
            for(; o !== t;){
                const t = o.nextSibling;
                e.insertBefore(o, l), o = t;
            }
        }
    }
    return n;
}, $311430566e21b48b$export$cb8bf9562088e9f4 = (o, t, i = o)=>(o._$AI(t, i), o), $311430566e21b48b$var$u = {}, $311430566e21b48b$export$ea70d9dd5965b1c8 = (o, t = $311430566e21b48b$var$u)=>o._$AH = t, $311430566e21b48b$export$59e9bce518cde500 = (o)=>o._$AH, $311430566e21b48b$export$3133b3144bbba267 = (o)=>{
    o._$AP?.(!1, !0);
    let t = o._$AA;
    const i = o._$AB.nextSibling;
    for(; t !== i;){
        const o = t.nextSibling;
        t.remove(), t = o;
    }
}, $311430566e21b48b$export$7f600b8138c094dc = (o)=>{
    o._$AR();
};


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $6db6ff6394e885e6$var$u = (e, s, t)=>{
    const r = new Map;
    for(let l = s; l <= t; l++)r.set(e[l], l);
    return r;
}, $6db6ff6394e885e6$export$76d90c956114f2c2 = (0, $107bb7d062dde330$export$99b43ad1ed32e735)(class extends (0, $107bb7d062dde330$export$befdefbdce210f91) {
    constructor(e){
        if (super(e), e.type !== (0, $107bb7d062dde330$export$9ba3b3f20a85bfa).CHILD) throw Error("repeat() can only be used in text expressions");
    }
    dt(e, s, t) {
        let r;
        void 0 === t ? t = s : void 0 !== s && (r = s);
        const l = [], o = [];
        let i = 0;
        for (const s of e)l[i] = r ? r(s, i) : i, o[i] = t(s, i), i++;
        return {
            values: o,
            keys: l
        };
    }
    render(e, s, t) {
        return this.dt(e, s, t).values;
    }
    update(s, [t, r, c]) {
        const d = (0, $311430566e21b48b$export$59e9bce518cde500)(s), { values: p, keys: a } = this.dt(t, r, c);
        if (!Array.isArray(d)) return this.ut = a, p;
        const h = this.ut ??= [], v = [];
        let m, y, x = 0, j = d.length - 1, k = 0, w = p.length - 1;
        for(; x <= j && k <= w;)if (null === d[x]) x++;
        else if (null === d[j]) j--;
        else if (h[x] === a[k]) v[k] = (0, $311430566e21b48b$export$cb8bf9562088e9f4)(d[x], p[k]), x++, k++;
        else if (h[j] === a[w]) v[w] = (0, $311430566e21b48b$export$cb8bf9562088e9f4)(d[j], p[w]), j--, w--;
        else if (h[x] === a[w]) v[w] = (0, $311430566e21b48b$export$cb8bf9562088e9f4)(d[x], p[w]), (0, $311430566e21b48b$export$291b2338ad9b0b30)(s, v[w + 1], d[x]), x++, w--;
        else if (h[j] === a[k]) v[k] = (0, $311430566e21b48b$export$cb8bf9562088e9f4)(d[j], p[k]), (0, $311430566e21b48b$export$291b2338ad9b0b30)(s, d[x], d[j]), j--, k++;
        else if (void 0 === m && (m = $6db6ff6394e885e6$var$u(a, k, w), y = $6db6ff6394e885e6$var$u(h, x, j)), m.has(h[x])) {
            if (m.has(h[j])) {
                const e = y.get(a[k]), t = void 0 !== e ? d[e] : null;
                if (null === t) {
                    const e = (0, $311430566e21b48b$export$291b2338ad9b0b30)(s, d[x]);
                    (0, $311430566e21b48b$export$cb8bf9562088e9f4)(e, p[k]), v[k] = e;
                } else v[k] = (0, $311430566e21b48b$export$cb8bf9562088e9f4)(t, p[k]), (0, $311430566e21b48b$export$291b2338ad9b0b30)(s, d[x], t), d[e] = null;
                k++;
            } else (0, $311430566e21b48b$export$3133b3144bbba267)(d[j]), j--;
        } else (0, $311430566e21b48b$export$3133b3144bbba267)(d[x]), x++;
        for(; k <= w;){
            const e = (0, $311430566e21b48b$export$291b2338ad9b0b30)(s, v[w + 1]);
            (0, $311430566e21b48b$export$cb8bf9562088e9f4)(e, p[k]), v[k++] = e;
        }
        for(; x <= j;){
            const e = d[x++];
            null !== e && (0, $311430566e21b48b$export$3133b3144bbba267)(e);
        }
        return this.ut = a, (0, $311430566e21b48b$export$ea70d9dd5965b1c8)(s, v), $f58f44579a4747ac$export$9c068ae9cc5db4e8;
    }
});







class $44dc2f8b1793354f$export$bc988e260393ee61 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    static get styles() {
        return (0, $def2de46b9306e8a$export$8d80f9cac07cdb3)((0, (/*@__PURE__*/$parcel$interopDefault($817c0f849eb0e3cb$exports))));
    }
    render() {
        if (!this.entities || !this.hass) return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)``;
        return (0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
            <div class="entities">
                ${(0, $6db6ff6394e885e6$export$76d90c956114f2c2)(this.entities, (entity)=>entity.entity, (entity, index)=>(0, $f58f44579a4747ac$export$c0bb0b647f701bb5)`
                        <div class="entity">
                            <div class="details">
                                <span class="name">${(0, $17c95cee15db08c3$export$b3d76adb44abe740)(entity.entity)}</span>
                                <span class="id">${entity.entity}</span>
                            </div>
                            <ha-color-picker
                                class="color-picker"
                                .hass=${this.hass}
                                .label=${(0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("config.label.color")}
                                .value=${entity.color ?? ""}
                                .includeNone=${true}
                                .includeState=${false}
                                .index=${index}
                                @value-changed=${this.changeColor}
                            ></ha-color-picker>
                            <ha-icon-button
                                .label=${(0, $eed23d1e0fae6bb4$export$2e2bcd8739ae039)("config.label.clear")}
                                .path=${0, $6364f6b17ee9ff8f$export$442c9939d1f788e4}
                                class="remove-icon"
                                .index=${index}
                                @click=${this.removeRow}
                            ></ha-icon-button>
                        </div>
                        </div>
                    `)}
            </div>
            <ha-entity-picker
                class="add-entity"
                .hass=${this.hass}
                .includeDomains="${[
            "calendar"
        ]}"
                @value-changed=${this.addRow}
            ></ha-entity-picker>
        `;
    }
    changeColor(event) {
        const target = event.currentTarget;
        if (!target) return;
        const index = target.index;
        const value = event.detail.value;
        if (this.entities[index]?.color === value) return;
        const newEntities = this.entities.concat();
        // @ts-ignore
        newEntities[index] = {
            ...newEntities[index],
            color: value
        };
        (0, $b435f893db1f7b2c$export$43835e9acf248a15)(this, "entities-changed", {
            entities: newEntities
        });
    }
    addRow(event) {
        const entityId = event.detail.value;
        if (entityId === "") return;
        const newEntities = this.entities.concat({
            entity: entityId
        });
        // @ts-expect-error
        event.target.value = "";
        (0, $b435f893db1f7b2c$export$43835e9acf248a15)(this, "entities-changed", {
            entities: newEntities
        });
    }
    removeRow(event) {
        // @ts-expect-error
        const index = event.currentTarget.index;
        const newEntities = this.entities.concat();
        newEntities.splice(index, 1);
        (0, $b435f893db1f7b2c$export$43835e9acf248a15)(this, "entities-changed", {
            entities: newEntities
        });
    }
    constructor(...args){
        super(...args), this.entities = [];
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $9cd908ed2625c047$export$d541bacb2bda4494)({
        attribute: false
    })
], $44dc2f8b1793354f$export$bc988e260393ee61.prototype, "hass", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $04c21ea1ce1f6057$export$ca000e230c0caa3e)()
], $44dc2f8b1793354f$export$bc988e260393ee61.prototype, "entities", void 0);
$44dc2f8b1793354f$export$bc988e260393ee61 = (0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $14742f68afc766d6$export$da64fc29f17f9d0e)("today-card-entities-editor")
], $44dc2f8b1793354f$export$bc988e260393ee61);



window.customCards = window.customCards || [];
window.customCards.push({
    type: "today-card",
    name: "Today",
    description: "Show today's schedule"
});
console.info(`%c\u{1F5D3}\u{FE0F} Today Card ${(0, $871b7f5e2c44c545$export$a4ad2735b021c132)}`, "font-weight: 700;");


//# sourceMappingURL=ha-today-card.js.map
