var Sn = Object.defineProperty;
var gr = (e) => {
  throw TypeError(e);
};
var Nn = (e, t, r) => t in e ? Sn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var D = (e, t, r) => Nn(e, typeof t != "symbol" ? t + "" : t, r), Mt = (e, t, r) => t.has(e) || gr("Cannot " + r);
var m = (e, t, r) => (Mt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), L = (e, t, r) => t.has(e) ? gr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Y = (e, t, r, n) => (Mt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), et = (e, t, r) => (Mt(e, t, "access private method"), r);
const An = "5";
var Ar;
typeof window < "u" && ((Ar = window.__svelte ?? (window.__svelte = {})).v ?? (Ar.v = /* @__PURE__ */ new Set())).add(An);
const On = 1, Rn = 2, Mn = 16, qn = 4, In = 1, Pn = 2, Or = "[", Zt = "[!", Qt = "]", Ye = {}, M = Symbol(), Dn = "http://www.w3.org/1999/xhtml", Ln = "http://www.w3.org/2000/svg", mr = !1;
var er = Array.isArray, Fn = Array.prototype.indexOf, tr = Array.from, $t = Object.keys, Ge = Object.defineProperty, He = Object.getOwnPropertyDescriptor, jn = Object.getOwnPropertyDescriptors, Un = Object.prototype, Yn = Array.prototype, Rr = Object.getPrototypeOf, wr = Object.isExtensible;
function Hn(e) {
  return typeof e == "function";
}
const tt = () => {
};
function Mr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Vn() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const K = 2, rr = 4, qr = 8, Je = 16, de = 32, Ie = 64, Ir = 128, X = 256, yt = 512, q = 1024, G = 2048, Pe = 4096, ne = 8192, De = 16384, Ct = 32768, vt = 65536, $r = 1 << 17, Wn = 1 << 18, nr = 1 << 19, Pr = 1 << 20, Pt = 1 << 21, ir = 1 << 22, Ae = 1 << 23, gt = Symbol("$state"), Bn = Symbol("legacy props"), Xn = Symbol(""), ar = new class extends Error {
  constructor() {
    super(...arguments);
    D(this, "name", "StaleReactionError");
    D(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), Gn = 1, Dr = 3, at = 8;
function zn() {
  throw new Error("https://svelte.dev/e/await_outside_boundary");
}
function Kn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Jn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Zn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Qn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ei(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ti() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ri() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function ni() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ii() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ai() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function St(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let k = !1;
function B(e) {
  k = e;
}
let N;
function z(e) {
  if (e === null)
    throw St(), Ye;
  return N = e;
}
function ze() {
  return z(
    /** @type {TemplateNode} */
    /* @__PURE__ */ Le(N)
  );
}
function he(e) {
  if (k) {
    if (/* @__PURE__ */ Le(N) !== null)
      throw St(), Ye;
    N = e;
  }
}
function Dt() {
  for (var e = 0, t = N; ; ) {
    if (t.nodeType === at) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === Qt) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Or || r === Zt) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Le(t)
    );
    t.remove(), t = n;
  }
}
function Lr(e) {
  if (!e || e.nodeType !== at)
    throw St(), Ye;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Fr(e) {
  return e === this.v;
}
function si(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function jr(e) {
  return !si(e, this.v);
}
let li = !1, ee = null;
function bt(e) {
  ee = e;
}
function sr(e, t = !1, r) {
  ee = {
    p: ee,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function lr(e) {
  var t = (
    /** @type {ComponentContext} */
    ee
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      rn(n);
  }
  return e !== void 0 && (t.x = e), ee = t.p, e ?? /** @type {T} */
  {};
}
function Ur() {
  return !0;
}
const oi = /* @__PURE__ */ new WeakMap();
function fi(e) {
  var t = $;
  if (t === null)
    return b.f |= Ae, e;
  if ((t.f & Ct) === 0) {
    if ((t.f & Ir) === 0)
      throw !t.parent && e instanceof Error && Yr(e), e;
    t.b.error(e);
  } else
    or(e, t);
}
function or(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ir) !== 0)
      try {
        t.b.error(e);
        return;
      } catch {
      }
    t = t.parent;
  }
  throw e instanceof Error && Yr(e), e;
}
function Yr(e) {
  const t = oi.get(e);
  t && (Ge(e, "message", {
    value: t.message
  }), Ge(e, "stack", {
    value: t.stack
  }));
}
let st = [], Lt = [];
function Hr() {
  var e = st;
  st = [], Mr(e);
}
function ui() {
  var e = Lt;
  Lt = [], Mr(e);
}
function fr(e) {
  st.length === 0 && queueMicrotask(Hr), st.push(e);
}
function ci() {
  st.length > 0 && Hr(), Lt.length > 0 && ui();
}
function di() {
  for (var e = (
    /** @type {Effect} */
    $.b
  ); e !== null && !e.has_pending_snippet(); )
    e = e.parent;
  return e === null && zn(), e;
}
// @__NO_SIDE_EFFECTS__
function ur(e) {
  var t = K | G, r = b !== null && (b.f & K) !== 0 ? (
    /** @type {Derived} */
    b
  ) : null;
  return $ === null || r !== null && (r.f & X) !== 0 ? t |= X : $.f |= nr, {
    ctx: ee,
    deps: null,
    effects: null,
    equals: Fr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      M
    ),
    wv: 0,
    parent: r ?? $,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function vi(e, t) {
  let r = (
    /** @type {Effect | null} */
    $
  );
  r === null && Jn();
  var n = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = ot(
    /** @type {V} */
    M
  ), s = null, l = !b;
  return Ei(() => {
    try {
      var f = e();
    } catch (d) {
      f = Promise.reject(d);
    }
    var o = () => f;
    i = (s == null ? void 0 : s.then(o, o)) ?? Promise.resolve(f), s = i;
    var c = (
      /** @type {Batch} */
      H
    ), h = n.pending;
    l && (n.update_pending_count(1), h || c.increment());
    const u = (d, v = void 0) => {
      s = null, h || c.activate(), v ? v !== ar && (a.f |= Ae, Ut(a, v)) : ((a.f & Ae) !== 0 && (a.f ^= Ae), Ut(a, d)), l && (n.update_pending_count(-1), h || c.decrement()), Br();
    };
    if (i.then(u, (d) => u(null, d || "unknown")), c)
      return () => {
        queueMicrotask(() => c.neuter());
      };
  }), new Promise((f) => {
    function o(c) {
      function h() {
        c === i ? f(a) : o(i);
      }
      c.then(h, h);
    }
    o(i);
  });
}
// @__NO_SIDE_EFFECTS__
function hi(e) {
  const t = /* @__PURE__ */ ur(e);
  return t.equals = jr, t;
}
function Vr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      ie(
        /** @type {Effect} */
        t[r]
      );
  }
}
function _i(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & K) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function cr(e) {
  var t, r = $;
  le(_i(e));
  try {
    Vr(e), t = vn(e);
  } finally {
    le(r);
  }
  return t;
}
function Wr(e) {
  var t = cr(e);
  if (e.equals(t) || (e.v = t, e.wv = cn()), !Fe)
    if (we !== null)
      we.set(e, e.v);
    else {
      var r = ($e || (e.f & X) !== 0) && e.deps !== null ? Pe : q;
      I(e, r);
    }
}
function pi(e, t, r) {
  const n = ur;
  if (t.length === 0) {
    r(e.map(n));
    return;
  }
  var i = H, a = (
    /** @type {Effect} */
    $
  ), s = gi(), l = di();
  Promise.all(t.map((f) => /* @__PURE__ */ vi(f))).then((f) => {
    i == null || i.activate(), s();
    try {
      r([...e.map(n), ...f]);
    } catch (o) {
      (a.f & De) === 0 && or(o, a);
    }
    i == null || i.deactivate(), Br();
  }).catch((f) => {
    l.error(f);
  });
}
function gi() {
  var e = $, t = b, r = ee;
  return function() {
    le(e), te(t), bt(r);
  };
}
function Br() {
  le(null), te(null), bt(null);
}
const ht = /* @__PURE__ */ new Set();
let H = null, we = null;
let Ue = [], lt = null, Ft = !1;
var ut, We, Be, ge, ct, dt, Se, Xe, me, oe, Ne, ce, Xr, Gr, jt;
const _r = class _r {
  constructor() {
    L(this, ce);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    L(this, ut, /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    L(this, We, /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    L(this, Be, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    L(this, ge, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    L(this, ct, null);
    /**
     * True if an async effect inside this batch resolved and
     * its parent branch was already deleted
     */
    L(this, dt, !1);
    /**
     * Async effects (created inside `async_derived`) encountered during processing.
     * These run after the rest of the batch has updated, since they should
     * always have the latest values
     * @type {Effect[]}
     */
    L(this, Se, []);
    /**
     * The same as `#async_effects`, but for effects inside a newly-created
     * `<svelte:boundary>` — these do not prevent the batch from committing
     * @type {Effect[]}
     */
    L(this, Xe, []);
    /**
     * Template effects and `$effect.pre` effects, which run when
     * a batch is committed
     * @type {Effect[]}
     */
    L(this, me, []);
    /**
     * The same as `#render_effects`, but for `$effect` (which runs after)
     * @type {Effect[]}
     */
    L(this, oe, []);
    /**
     * Block effects, which may need to re-run on subsequent flushes
     * in order to update internal sources (e.g. each block items)
     * @type {Effect[]}
     */
    L(this, Ne, []);
    /**
     * A set of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`
     * @type {Set<Effect>}
     */
    D(this, "skipped_effects", /* @__PURE__ */ new Set());
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    m(this, We).has(t) || m(this, We).set(t, r), m(this, ut).set(t, t.v);
  }
  activate() {
    H = this;
  }
  deactivate() {
    H = null;
  }
  neuter() {
    Y(this, dt, !0);
  }
  flush() {
    Ue.length > 0 ? this.flush_effects() : et(this, ce, jt).call(this), H === this && (m(this, ge) === 0 && ht.delete(this), H = null);
  }
  flush_effects() {
    var t = Ve;
    Ft = !0;
    try {
      var r = 0;
      for (Er(!0); Ue.length > 0; )
        r++ > 1e3 && mi(), et(this, ce, Xr).call(this, Ue), Oe.clear();
    } finally {
      Ft = !1, Er(t), lt = null;
    }
  }
  increment() {
    Y(this, ge, m(this, ge) + 1);
  }
  decrement() {
    if (Y(this, ge, m(this, ge) - 1), m(this, ge) === 0) {
      for (const t of m(this, me))
        I(t, G), ye(t);
      for (const t of m(this, oe))
        I(t, G), ye(t);
      for (const t of m(this, Ne))
        I(t, G), ye(t);
      Y(this, me, []), Y(this, oe, []), this.flush();
    }
  }
  /** @param {() => void} fn */
  add_callback(t) {
    m(this, Be).add(t);
  }
  settled() {
    return (m(this, ct) ?? Y(this, ct, Vn())).promise;
  }
  static ensure() {
    if (H === null) {
      const t = H = new _r();
      ht.add(H), queueMicrotask(() => {
        H === t && t.flush();
      });
    }
    return H;
  }
};
ut = new WeakMap(), We = new WeakMap(), Be = new WeakMap(), ge = new WeakMap(), ct = new WeakMap(), dt = new WeakMap(), Se = new WeakMap(), Xe = new WeakMap(), me = new WeakMap(), oe = new WeakMap(), Ne = new WeakMap(), ce = new WeakSet(), /**
 *
 * @param {Effect[]} root_effects
 */
Xr = function(t) {
  var a;
  Ue = [];
  var r = null;
  if (ht.size > 1) {
    r = /* @__PURE__ */ new Map(), we = /* @__PURE__ */ new Map();
    for (const [s, l] of m(this, ut))
      r.set(s, { v: s.v, wv: s.wv }), s.v = l;
    for (const s of ht)
      if (s !== this)
        for (const [l, f] of m(s, We))
          r.has(l) || (r.set(l, { v: l.v, wv: l.wv }), l.v = f);
  }
  for (const s of t)
    et(this, ce, Gr).call(this, s);
  if (m(this, Se).length === 0 && m(this, ge) === 0) {
    var n = m(this, me), i = m(this, oe);
    Y(this, me, []), Y(this, oe, []), Y(this, Ne, []), et(this, ce, jt).call(this), yr(n), yr(i), (a = m(this, ct)) == null || a.resolve();
  } else {
    for (const s of m(this, me)) I(s, q);
    for (const s of m(this, oe)) I(s, q);
    for (const s of m(this, Ne)) I(s, q);
  }
  if (r) {
    for (const [s, { v: l, wv: f }] of r)
      s.wv <= f && (s.v = l);
    we = null;
  }
  for (const s of m(this, Se))
    nt(s);
  for (const s of m(this, Xe))
    nt(s);
  Y(this, Se, []), Y(this, Xe, []);
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 */
Gr = function(t) {
  var c;
  t.f ^= q;
  for (var r = t.first; r !== null; ) {
    var n = r.f, i = (n & (de | Ie)) !== 0, a = i && (n & q) !== 0, s = a || (n & ne) !== 0 || this.skipped_effects.has(r);
    if (!s && r.fn !== null) {
      if (i)
        r.f ^= q;
      else if ((n & rr) !== 0)
        m(this, oe).push(r);
      else if (Ot(r))
        if ((n & ir) !== 0) {
          var l = (c = r.b) != null && c.pending ? m(this, Xe) : m(this, Se);
          l.push(r);
        } else
          (r.f & Je) !== 0 && m(this, Ne).push(r), nt(r);
      var f = r.first;
      if (f !== null) {
        r = f;
        continue;
      }
    }
    var o = r.parent;
    for (r = r.next; r === null && o !== null; )
      r = o.next, o = o.parent;
  }
}, /**
 * Append and remove branches to/from the DOM
 */
jt = function() {
  if (!m(this, dt))
    for (const t of m(this, Be))
      t();
  m(this, Be).clear();
};
let Ke = _r;
function pe(e) {
  var t;
  const r = Ke.ensure();
  for (; ; ) {
    if (ci(), Ue.length === 0)
      return r === H && r.flush(), lt = null, /** @type {T} */
      t;
    r.flush_effects();
  }
}
function mi() {
  try {
    ti();
  } catch (e) {
    if (lt !== null)
      or(e, lt);
    else
      throw e;
  }
}
function yr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; r++) {
      var n = e[r];
      if ((n.f & (De | ne)) === 0 && Ot(n)) {
        var i = Et;
        if (nt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? on(n) : n.fn = null), Et > i && (n.f & Pr) !== 0)
          break;
      }
    }
    for (; r < t; r += 1)
      ye(e[r]);
  }
}
function ye(e) {
  for (var t = lt = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Ft && t === $ && (r & Je) !== 0)
      return;
    if ((r & (Ie | de)) !== 0) {
      if ((r & q) === 0) return;
      t.f ^= q;
    }
  }
  Ue.push(t);
}
const Oe = /* @__PURE__ */ new Map();
function ot(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Fr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function W(e, t) {
  const r = ot(e);
  return Ti(r), r;
}
// @__NO_SIDE_EFFECTS__
function zr(e, t = !1, r = !0) {
  const n = ot(e);
  return t || (n.equals = jr), n;
}
function R(e, t, r = !1) {
  b !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!se || (b.f & $r) !== 0) && Ur() && (b.f & (K | Je | ir | $r)) !== 0 && !(j != null && j.includes(e)) && ai();
  let n = r ? rt(t) : t;
  return Ut(e, n);
}
function Ut(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Fe ? Oe.set(e, t) : Oe.set(e, r), e.v = t, Ke.ensure().capture(e, r), (e.f & K) !== 0 && ((e.f & G) !== 0 && cr(
      /** @type {Derived} */
      e
    ), I(e, (e.f & X) === 0 ? q : Pe)), e.wv = cn(), Kr(e, G), $ !== null && ($.f & q) !== 0 && ($.f & (de | Ie)) === 0 && (Z === null ? Ci([e]) : Z.push(e));
  }
  return t;
}
function qt(e) {
  R(e, e.v + 1);
}
function Kr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f;
      (s & G) === 0 && (I(a, t), (s & (q | X)) !== 0 && ((s & K) !== 0 ? Kr(
        /** @type {Derived} */
        a,
        Pe
      ) : ye(
        /** @type {Effect} */
        a
      )));
    }
}
function rt(e) {
  if (typeof e != "object" || e === null || gt in e)
    return e;
  const t = Rr(e);
  if (t !== Un && t !== Yn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = er(e), i = /* @__PURE__ */ W(0), a = Re, s = (l) => {
    if (Re === a)
      return l();
    var f = b, o = Re;
    te(null), xr(a);
    var c = l();
    return te(f), xr(o), c;
  };
  return n && r.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && ni();
        var c = r.get(f);
        return c === void 0 ? c = s(() => {
          var h = /* @__PURE__ */ W(o.value);
          return r.set(f, h), h;
        }) : R(c, o.value, !0), !0;
      },
      deleteProperty(l, f) {
        var o = r.get(f);
        if (o === void 0) {
          if (f in l) {
            const u = s(() => /* @__PURE__ */ W(M));
            r.set(f, u), qt(i);
          }
        } else {
          if (n && typeof f == "string") {
            var c = (
              /** @type {Source<number>} */
              r.get("length")
            ), h = Number(f);
            Number.isInteger(h) && h < c.v && R(c, h);
          }
          R(o, M), qt(i);
        }
        return !0;
      },
      get(l, f, o) {
        var d;
        if (f === gt)
          return e;
        var c = r.get(f), h = f in l;
        if (c === void 0 && (!h || (d = He(l, f)) != null && d.writable) && (c = s(() => {
          var v = rt(h ? l[f] : M), _ = /* @__PURE__ */ W(v);
          return _;
        }), r.set(f, c)), c !== void 0) {
          var u = y(c);
          return u === M ? void 0 : u;
        }
        return Reflect.get(l, f, o);
      },
      getOwnPropertyDescriptor(l, f) {
        var o = Reflect.getOwnPropertyDescriptor(l, f);
        if (o && "value" in o) {
          var c = r.get(f);
          c && (o.value = y(c));
        } else if (o === void 0) {
          var h = r.get(f), u = h == null ? void 0 : h.v;
          if (h !== void 0 && u !== M)
            return {
              enumerable: !0,
              configurable: !0,
              value: u,
              writable: !0
            };
        }
        return o;
      },
      has(l, f) {
        var u;
        if (f === gt)
          return !0;
        var o = r.get(f), c = o !== void 0 && o.v !== M || Reflect.has(l, f);
        if (o !== void 0 || $ !== null && (!c || (u = He(l, f)) != null && u.writable)) {
          o === void 0 && (o = s(() => {
            var d = c ? rt(l[f]) : M, v = /* @__PURE__ */ W(d);
            return v;
          }), r.set(f, o));
          var h = y(o);
          if (h === M)
            return !1;
        }
        return c;
      },
      set(l, f, o, c) {
        var w;
        var h = r.get(f), u = f in l;
        if (n && f === "length")
          for (var d = o; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var v = r.get(d + "");
            v !== void 0 ? R(v, M) : d in l && (v = s(() => /* @__PURE__ */ W(M)), r.set(d + "", v));
          }
        if (h === void 0)
          (!u || (w = He(l, f)) != null && w.writable) && (h = s(() => /* @__PURE__ */ W(void 0)), R(h, rt(o)), r.set(f, h));
        else {
          u = h.v !== M;
          var _ = s(() => rt(o));
          R(h, _);
        }
        var p = Reflect.getOwnPropertyDescriptor(l, f);
        if (p != null && p.set && p.set.call(c, o), !u) {
          if (n && typeof f == "string") {
            var x = (
              /** @type {Source<number>} */
              r.get("length")
            ), C = Number(f);
            Number.isInteger(C) && C >= x.v && R(x, C + 1);
          }
          qt(i);
        }
        return !0;
      },
      ownKeys(l) {
        y(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var u = r.get(h);
          return u === void 0 || u.v !== M;
        });
        for (var [o, c] of r)
          c.v !== M && !(o in l) && f.push(o);
        return f;
      },
      setPrototypeOf() {
        ii();
      }
    }
  );
}
var br, Jr, Zr, Qr;
function Yt() {
  if (br === void 0) {
    br = window, Jr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Zr = He(t, "firstChild").get, Qr = He(t, "nextSibling").get, wr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), wr(r) && (r.__t = void 0);
  }
}
function be(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Me(e) {
  return Zr.call(e);
}
// @__NO_SIDE_EFFECTS__
function Le(e) {
  return Qr.call(e);
}
function ke(e, t) {
  if (!k)
    return /* @__PURE__ */ Me(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ Me(N)
  );
  if (r === null)
    r = N.appendChild(be());
  else if (t && r.nodeType !== Dr) {
    var n = be();
    return r == null || r.before(n), z(n), n;
  }
  return z(r), r;
}
function mt(e, t = 1, r = !1) {
  let n = k ? N : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ Le(n);
  if (!k)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== Dr) {
    var a = be();
    return n === null ? i == null || i.after(a) : n.before(a), z(a), a;
  }
  return z(n), /** @type {TemplateNode} */
  n;
}
function en(e) {
  e.textContent = "";
}
function tn() {
  return !1;
}
function wi(e) {
  $ === null && b === null && ei(), b !== null && (b.f & X) !== 0 && $ === null && Qn(), Fe && Zn();
}
function $i(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function ve(e, t, r, n = !0) {
  var i = $;
  i !== null && (i.f & ne) !== 0 && (e |= ne);
  var a = {
    ctx: ee,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | G,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: i,
    b: i && i.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null
  };
  if (r)
    try {
      nt(a), a.f |= Ct;
    } catch (f) {
      throw ie(a), f;
    }
  else t !== null && ye(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & nr) === 0;
  if (!s && n && (i !== null && $i(a, i), b !== null && (b.f & K) !== 0)) {
    var l = (
      /** @type {Derived} */
      b
    );
    (l.effects ?? (l.effects = [])).push(a);
  }
  return a;
}
function Ht(e) {
  wi();
  var t = (
    /** @type {Effect} */
    $.f
  ), r = !b && (t & de) !== 0 && (t & Ct) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      ee
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return rn(e);
}
function rn(e) {
  return ve(rr | Pr, e, !1);
}
function yi(e) {
  Ke.ensure();
  const t = ve(Ie, e, !0);
  return () => {
    ie(t);
  };
}
function bi(e) {
  Ke.ensure();
  const t = ve(Ie, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Nt(t, () => {
      ie(t), n(void 0);
    }) : (ie(t), n(void 0));
  });
}
function nn(e) {
  return ve(rr, e, !1);
}
function Ei(e) {
  return ve(ir | nr, e, !0);
}
function an(e, t = 0) {
  return ve(qr | t, e, !0);
}
function xe(e, t = [], r = []) {
  pi(t, r, (n) => {
    ve(qr, () => e(...n.map(y)), !0);
  });
}
function dr(e, t = 0) {
  var r = ve(Je | t, e, !0);
  return r;
}
function qe(e, t = !0) {
  return ve(de, e, !0, t);
}
function sn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Fe, n = b;
    kr(!0), te(null);
    try {
      t.call(null);
    } finally {
      kr(r), te(n);
    }
  }
}
function ln(e, t = !1) {
  var i;
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    (i = r.ac) == null || i.abort(ar);
    var n = r.next;
    (r.f & Ie) !== 0 ? r.parent = null : ie(r, t), r = n;
  }
}
function ki(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & de) === 0 && ie(t), t = r;
  }
}
function ie(e, t = !0) {
  var r = !1;
  (t || (e.f & Wn) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (xi(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), ln(e, t && !r), kt(e, 0), I(e, De);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  sn(e);
  var i = e.parent;
  i !== null && i.first !== null && on(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function xi(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Le(e)
    );
    e.remove(), e = r;
  }
}
function on(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Nt(e, t) {
  var r = [];
  vr(e, r, !0), fn(r, () => {
    ie(e), t && t();
  });
}
function fn(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function vr(e, t, r) {
  if ((e.f & ne) === 0) {
    if (e.f ^= ne, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & vt) !== 0 || (n.f & de) !== 0;
      vr(n, t, a ? r : !1), n = i;
    }
  }
}
function At(e) {
  un(e, !0);
}
function un(e, t) {
  if ((e.f & ne) !== 0) {
    e.f ^= ne, (e.f & q) === 0 && (I(e, G), ye(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & vt) !== 0 || (r.f & de) !== 0;
      un(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let Ve = !1;
function Er(e) {
  Ve = e;
}
let Fe = !1;
function kr(e) {
  Fe = e;
}
let b = null, se = !1;
function te(e) {
  b = e;
}
let $ = null;
function le(e) {
  $ = e;
}
let j = null;
function Ti(e) {
  b !== null && (j === null ? j = [e] : j.push(e));
}
let F = null, V = 0, Z = null;
function Ci(e) {
  Z = e;
}
let Et = 1, ft = 0, Re = ft;
function xr(e) {
  Re = e;
}
let $e = !1;
function cn() {
  return ++Et;
}
function Ot(e) {
  var h;
  var t = e.f;
  if ((t & G) !== 0)
    return !0;
  if ((t & Pe) !== 0) {
    var r = e.deps, n = (t & X) !== 0;
    if (r !== null) {
      var i, a, s = (t & yt) !== 0, l = n && $ !== null && !$e, f = r.length;
      if ((s || l) && ($ === null || ($.f & De) === 0)) {
        var o = (
          /** @type {Derived} */
          e
        ), c = o.parent;
        for (i = 0; i < f; i++)
          a = r[i], (s || !((h = a == null ? void 0 : a.reactions) != null && h.includes(o))) && (a.reactions ?? (a.reactions = [])).push(o);
        s && (o.f ^= yt), l && c !== null && (c.f & X) === 0 && (o.f ^= X);
      }
      for (i = 0; i < f; i++)
        if (a = r[i], Ot(
          /** @type {Derived} */
          a
        ) && Wr(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || $ !== null && !$e) && I(e, q);
  }
  return !1;
}
function dn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(j != null && j.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & K) !== 0 ? dn(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? I(a, G) : (a.f & q) !== 0 && I(a, Pe), ye(
        /** @type {Effect} */
        a
      ));
    }
}
function vn(e) {
  var v;
  var t = F, r = V, n = Z, i = b, a = $e, s = j, l = ee, f = se, o = Re, c = e.f;
  F = /** @type {null | Value[]} */
  null, V = 0, Z = null, $e = (c & X) !== 0 && (se || !Ve || b === null), b = (c & (de | Ie)) === 0 ? e : null, j = null, bt(e.ctx), se = !1, Re = ++ft, e.ac !== null && (e.ac.abort(ar), e.ac = null);
  try {
    e.f |= Pt;
    var h = (
      /** @type {Function} */
      (0, e.fn)()
    ), u = e.deps;
    if (F !== null) {
      var d;
      if (kt(e, V), u !== null && V > 0)
        for (u.length = V + F.length, d = 0; d < F.length; d++)
          u[V + d] = F[d];
      else
        e.deps = u = F;
      if (!$e || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (c & K) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (d = V; d < u.length; d++)
          ((v = u[d]).reactions ?? (v.reactions = [])).push(e);
    } else u !== null && V < u.length && (kt(e, V), u.length = V);
    if (Ur() && Z !== null && !se && u !== null && (e.f & (K | Pe | G)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      Z.length; d++)
        dn(
          Z[d],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (ft++, Z !== null && (n === null ? n = Z : n.push(.../** @type {Source[]} */
    Z))), (e.f & Ae) !== 0 && (e.f ^= Ae), h;
  } catch (_) {
    return fi(_);
  } finally {
    e.f ^= Pt, F = t, V = r, Z = n, b = i, $e = a, j = s, bt(l), se = f, Re = o;
  }
}
function Si(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Fn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & K) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (F === null || !F.includes(t)) && (I(t, Pe), (t.f & (X | yt)) === 0 && (t.f ^= yt), Vr(
    /** @type {Derived} **/
    t
  ), kt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function kt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Si(e, r[n]);
}
function nt(e) {
  var t = e.f;
  if ((t & De) === 0) {
    I(e, q);
    var r = $, n = Ve;
    $ = e, Ve = !0;
    try {
      (t & Je) !== 0 ? ki(e) : ln(e), sn(e);
      var i = vn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Et;
      var a;
      mr && li && (e.f & G) !== 0 && e.deps;
    } finally {
      Ve = n, $ = r;
    }
  }
}
function y(e) {
  var t = e.f, r = (t & K) !== 0;
  if (b !== null && !se) {
    var n = $ !== null && ($.f & De) !== 0;
    if (!n && !(j != null && j.includes(e))) {
      var i = b.deps;
      if ((b.f & Pt) !== 0)
        e.rv < ft && (e.rv = ft, F === null && i !== null && i[V] === e ? V++ : F === null ? F = [e] : (!$e || !F.includes(e)) && F.push(e));
      else {
        (b.deps ?? (b.deps = [])).push(e);
        var a = e.reactions;
        a === null ? e.reactions = [b] : a.includes(b) || a.push(b);
      }
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var s = (
      /** @type {Derived} */
      e
    ), l = s.parent;
    l !== null && (l.f & X) === 0 && (s.f ^= X);
  }
  if (Fe) {
    if (Oe.has(e))
      return Oe.get(e);
    if (r) {
      s = /** @type {Derived} */
      e;
      var f = s.v;
      return ((s.f & q) !== 0 || hn(s)) && (f = cr(s)), Oe.set(s, f), f;
    }
  } else if (r) {
    if (s = /** @type {Derived} */
    e, we != null && we.has(s))
      return we.get(s);
    Ot(s) && Wr(s);
  }
  if ((e.f & Ae) !== 0)
    throw e.v;
  return e.v;
}
function hn(e) {
  if (e.v === M) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Oe.has(t) || (t.f & K) !== 0 && hn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function hr(e) {
  var t = se;
  try {
    return se = !0, e();
  } finally {
    se = t;
  }
}
const Ni = -7169;
function I(e, t) {
  e.f = e.f & Ni | t;
}
function _n(e) {
  var t = b, r = $;
  te(null), le(null);
  try {
    return e();
  } finally {
    te(t), le(r);
  }
}
const pn = /* @__PURE__ */ new Set(), Vt = /* @__PURE__ */ new Set();
function Ai(e) {
  for (var t = 0; t < e.length; t++)
    pn.add(e[t]);
  for (var r of Vt)
    r(e);
}
function _t(e) {
  var C;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((C = e.composedPath) == null ? void 0 : C.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  ), s = 0, l = e.__root;
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    f <= o && (s = f);
  }
  if (a = /** @type {Element} */
  i[s] || e.target, a !== t) {
    Ge(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var c = b, h = $;
    te(null), le(null);
    try {
      for (var u, d = []; a !== null; ) {
        var v = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var _ = a["__" + n];
          if (_ != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a))
            if (er(_)) {
              var [p, ...x] = _;
              p.apply(a, [e, ...x]);
            } else
              _.call(a, e);
        } catch (w) {
          u ? d.push(w) : u = w;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        a = v;
      }
      if (u) {
        for (let w of d)
          queueMicrotask(() => {
            throw w;
          });
        throw u;
      }
    } finally {
      e.__root = t, delete e.currentTarget, te(c), le(h);
    }
  }
}
function Oi(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function it(e, t) {
  var r = (
    /** @type {Effect} */
    $
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Ze(e, t) {
  var r = (t & In) !== 0, n = (t & Pn) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (k)
      return it(N, null), N;
    i === void 0 && (i = Oi(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ Me(i)));
    var s = (
      /** @type {TemplateNode} */
      n || Jr ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Me(s)
      ), f = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      it(l, f);
    } else
      it(s, s);
    return s;
  };
}
function Ce(e, t) {
  if (k) {
    $.nodes_end = N, ze();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Ri = ["touchstart", "touchmove"];
function Mi(e) {
  return Ri.includes(e);
}
const qi = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Ii(e) {
  return qi.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let xt = !0;
function Tr(e) {
  xt = e;
}
function Pi(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function gn(e, t) {
  return mn(e, t);
}
function Di(e, t) {
  Yt(), t.intro = t.intro ?? !1;
  const r = t.target, n = k, i = N;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Me(r)
    ); a && (a.nodeType !== at || /** @type {Comment} */
    a.data !== Or); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ Le(a);
    if (!a)
      throw Ye;
    B(!0), z(
      /** @type {Comment} */
      a
    ), ze();
    const s = mn(e, { ...t, anchor: a });
    if (N === null || N.nodeType !== at || /** @type {Comment} */
    N.data !== Qt)
      throw St(), Ye;
    return B(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Ye)
      return t.recover === !1 && ri(), Yt(), en(r), B(!1), gn(e, t);
    throw s;
  } finally {
    B(n), z(i);
  }
}
const je = /* @__PURE__ */ new Map();
function mn(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  Yt();
  var l = /* @__PURE__ */ new Set(), f = (h) => {
    for (var u = 0; u < h.length; u++) {
      var d = h[u];
      if (!l.has(d)) {
        l.add(d);
        var v = Mi(d);
        t.addEventListener(d, _t, { passive: v });
        var _ = je.get(d);
        _ === void 0 ? (document.addEventListener(d, _t, { passive: v }), je.set(d, 1)) : je.set(d, _ + 1);
      }
    }
  };
  f(tr(pn)), Vt.add(f);
  var o = void 0, c = bi(() => {
    var h = r ?? t.appendChild(be());
    return qe(() => {
      if (a) {
        sr({});
        var u = (
          /** @type {ComponentContext} */
          ee
        );
        u.c = a;
      }
      i && (n.$$events = i), k && it(
        /** @type {TemplateNode} */
        h,
        null
      ), xt = s, o = e(h, n) || {}, xt = !0, k && ($.nodes_end = N), a && lr();
    }), () => {
      var v;
      for (var u of l) {
        t.removeEventListener(u, _t);
        var d = (
          /** @type {number} */
          je.get(u)
        );
        --d === 0 ? (document.removeEventListener(u, _t), je.delete(u)) : je.set(u, d);
      }
      Vt.delete(f), h !== r && ((v = h.parentNode) == null || v.removeChild(h));
    };
  });
  return Wt.set(o, c), o;
}
let Wt = /* @__PURE__ */ new WeakMap();
function Li(e, t) {
  const r = Wt.get(e);
  return r ? (Wt.delete(e), r(t)) : Promise.resolve();
}
function wn(e) {
  ee === null && Kn(), Ht(() => {
    const t = hr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Bt(e, t, r = !1) {
  k && ze();
  var n = e, i = null, a = null, s = M, l = r ? vt : 0, f = !1;
  const o = (d, v = !0) => {
    f = !0, u(v, d);
  };
  var c = null;
  function h() {
    c !== null && (c.lastChild.remove(), n.before(c), c = null);
    var d = s ? i : a, v = s ? a : i;
    d && At(d), v && Nt(v, () => {
      s ? a = null : i = null;
    });
  }
  const u = (d, v) => {
    if (s === (s = d)) return;
    let _ = !1;
    if (k) {
      const S = Lr(n) === Zt;
      !!s === S && (n = Dt(), z(n), B(!1), _ = !0);
    }
    var p = tn(), x = n;
    if (p && (c = document.createDocumentFragment(), c.append(x = be())), s ? i ?? (i = v && qe(() => v(x))) : a ?? (a = v && qe(() => v(x))), p) {
      var C = (
        /** @type {Batch} */
        H
      ), w = s ? i : a, A = s ? a : i;
      w && C.skipped_effects.delete(w), A && C.skipped_effects.add(A), C.add_callback(h);
    } else
      h();
    _ && B(!0);
  };
  dr(() => {
    f = !1, t(o), f || u(null, null);
  }, l), k && (n = N);
}
function Fi(e, t, r) {
  for (var n = e.items, i = [], a = t.length, s = 0; s < a; s++)
    vr(t[s].e, i, !0);
  var l = a > 0 && i.length === 0 && r !== null;
  if (l) {
    var f = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    en(f), f.append(
      /** @type {Element} */
      r
    ), n.clear(), ae(e, t[0].prev, t[a - 1].next);
  }
  fn(i, () => {
    for (var o = 0; o < a; o++) {
      var c = t[o];
      l || (n.delete(c.k), ae(e, c.prev, c.next)), ie(c.e, !l);
    }
  });
}
function ji(e, t, r, n, i, a = null) {
  var s = e, l = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var f = (
      /** @type {Element} */
      e
    );
    s = k ? z(
      /** @type {Comment | Text} */
      /* @__PURE__ */ Me(f)
    ) : f.appendChild(be());
  }
  k && ze();
  var o = null, c = !1, h = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ hi(() => {
    var p = r();
    return er(p) ? p : p == null ? [] : tr(p);
  }), d, v;
  function _() {
    Ui(
      v,
      d,
      l,
      h,
      s,
      i,
      t,
      n,
      r
    ), a !== null && (d.length === 0 ? o ? At(o) : o = qe(() => a(s)) : o !== null && Nt(o, () => {
      o = null;
    }));
  }
  dr(() => {
    v ?? (v = /** @type {Effect} */
    $), d = y(u);
    var p = d.length;
    if (c && p === 0)
      return;
    c = p === 0;
    let x = !1;
    if (k) {
      var C = Lr(s) === Zt;
      C !== (p === 0) && (s = Dt(), z(s), B(!1), x = !0);
    }
    if (k) {
      for (var w = null, A, S = 0; S < p; S++) {
        if (N.nodeType === at && /** @type {Comment} */
        N.data === Qt) {
          s = /** @type {Comment} */
          N, x = !0, B(!1);
          break;
        }
        var U = d[S], P = n(U, S);
        A = Xt(
          N,
          l,
          w,
          null,
          U,
          P,
          S,
          i,
          t,
          r
        ), l.items.set(P, A), w = A;
      }
      p > 0 && z(Dt());
    }
    if (k)
      p === 0 && a && (o = qe(() => a(s)));
    else if (tn()) {
      var J = /* @__PURE__ */ new Set(), g = (
        /** @type {Batch} */
        H
      );
      for (S = 0; S < p; S += 1) {
        U = d[S], P = n(U, S);
        var E = l.items.get(P) ?? h.get(P);
        E || (A = Xt(
          null,
          l,
          null,
          null,
          U,
          P,
          S,
          i,
          t,
          r,
          !0
        ), h.set(P, A)), J.add(P);
      }
      for (const [T, O] of l.items)
        J.has(T) || g.skipped_effects.add(O.e);
      g.add_callback(_);
    } else
      _();
    x && B(!0), y(u);
  }), k && (s = N);
}
function Ui(e, t, r, n, i, a, s, l, f) {
  var o = t.length, c = r.items, h = r.first, u = h, d, v = null, _ = [], p = [], x, C, w, A;
  for (A = 0; A < o; A += 1) {
    if (x = t[A], C = l(x, A), w = c.get(C), w === void 0) {
      var S = n.get(C);
      if (S !== void 0) {
        n.delete(C), c.set(C, S);
        var U = v ? v.next : u;
        ae(r, v, S), ae(r, S, U), It(S, U, i), v = S;
      } else {
        var P = u ? (
          /** @type {TemplateNode} */
          u.e.nodes_start
        ) : i;
        v = Xt(
          P,
          r,
          v,
          v === null ? r.first : v.next,
          x,
          C,
          A,
          a,
          s,
          f
        );
      }
      c.set(C, v), _ = [], p = [], u = v.next;
      continue;
    }
    if ((w.e.f & ne) !== 0 && At(w.e), w !== u) {
      if (d !== void 0 && d.has(w)) {
        if (_.length < p.length) {
          var J = p[0], g;
          v = J.prev;
          var E = _[0], T = _[_.length - 1];
          for (g = 0; g < _.length; g += 1)
            It(_[g], J, i);
          for (g = 0; g < p.length; g += 1)
            d.delete(p[g]);
          ae(r, E.prev, T.next), ae(r, v, E), ae(r, T, J), u = J, v = T, A -= 1, _ = [], p = [];
        } else
          d.delete(w), It(w, u, i), ae(r, w.prev, w.next), ae(r, w, v === null ? r.first : v.next), ae(r, v, w), v = w;
        continue;
      }
      for (_ = [], p = []; u !== null && u.k !== C; )
        (u.e.f & ne) === 0 && (d ?? (d = /* @__PURE__ */ new Set())).add(u), p.push(u), u = u.next;
      if (u === null)
        continue;
      w = u;
    }
    _.push(w), v = w, u = w.next;
  }
  if (u !== null || d !== void 0) {
    for (var O = d === void 0 ? [] : tr(d); u !== null; )
      (u.e.f & ne) === 0 && O.push(u), u = u.next;
    var re = O.length;
    if (re > 0) {
      var Qe = o === 0 ? i : null;
      Fi(r, O, Qe);
    }
  }
  e.first = r.first && r.first.e, e.last = v && v.e;
  for (var Rt of n.values())
    ie(Rt.e);
  n.clear();
}
function Xt(e, t, r, n, i, a, s, l, f, o, c) {
  var h = (f & On) !== 0, u = (f & Mn) === 0, d = h ? u ? /* @__PURE__ */ zr(i, !1, !1) : ot(i) : i, v = (f & Rn) === 0 ? s : ot(s), _ = {
    i: v,
    v: d,
    k: a,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: n
  };
  try {
    if (e === null) {
      var p = document.createDocumentFragment();
      p.append(e = be());
    }
    return _.e = qe(() => l(
      /** @type {Node} */
      e,
      d,
      v,
      o
    ), k), _.e.prev = r && r.e, _.e.next = n && n.e, r === null ? c || (t.first = _) : (r.next = _, r.e.next = _.e), n !== null && (n.prev = _, n.e.prev = _.e), _;
  } finally {
  }
}
function It(e, t, r) {
  for (var n = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : r, i = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : r, a = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); a !== null && a !== n; ) {
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Le(a)
    );
    i.before(a), a = s;
  }
}
function ae(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function Yi(e, t, r, n, i, a) {
  let s = k;
  k && ze();
  var l, f, o = null;
  k && N.nodeType === Gn && (o = /** @type {Element} */
  N, ze());
  var c = (
    /** @type {TemplateNode} */
    k ? N : e
  ), h;
  dr(() => {
    const u = t() || null;
    var d = u === "svg" ? Ln : null;
    u !== l && (h && (u === null ? Nt(h, () => {
      h = null, f = null;
    }) : u === f ? At(h) : (ie(h), Tr(!1))), u && u !== f && (h = qe(() => {
      if (o = k ? (
        /** @type {Element} */
        o
      ) : d ? document.createElementNS(d, u) : document.createElement(u), it(o, o), n) {
        k && Ii(u) && o.append(document.createComment(""));
        var v = (
          /** @type {TemplateNode} */
          k ? /* @__PURE__ */ Me(o) : o.appendChild(be())
        );
        k && (v === null ? B(!1) : z(v)), n(o, v);
      }
      $.nodes_end = o, c.before(o);
    })), l = u, l && (f = l), Tr(!0));
  }, vt), s && (B(!0), z(c));
}
function $n(e, t) {
  fr(() => {
    var r = e.getRootNode(), n = (
      /** @type {ShadowRoot} */
      r.host ? (
        /** @type {ShadowRoot} */
        r
      ) : (
        /** @type {Document} */
        r.head ?? /** @type {Document} */
        r.ownerDocument.head
      )
    );
    if (!n.querySelector("#" + t.hash)) {
      const i = document.createElement("style");
      i.id = t.hash, i.textContent = t.code, n.appendChild(i);
    }
  });
}
function Hi(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function Vi(e, t) {
  return e == null ? null : String(e);
}
function Ee(e, t, r, n, i, a) {
  var s = e.__className;
  if (k || s !== r || s === void 0) {
    var l = Hi(r, n);
    (!k || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : e.className = l), e.__className = r;
  }
  return a;
}
function _e(e, t, r, n) {
  var i = e.__style;
  if (k || i !== t) {
    var a = Vi(t);
    (!k || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const Wi = Symbol("is custom element"), Bi = Symbol("is html");
function yn(e, t, r, n) {
  var i = Xi(e);
  k && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[Xn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && bn(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Cr(e, t, r) {
  var n = b, i = $;
  let a = k;
  k && B(!1), te(null), le(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (Gt.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? bn(e).includes(t) : r && typeof r == "object") ? e[t] = r : yn(e, t, r == null ? r : String(r));
  } finally {
    te(n), le(i), a && B(!0);
  }
}
function Xi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [Wi]: e.nodeName.includes("-"),
      [Bi]: e.namespaceURI === Dn
    })
  );
}
var Gt = /* @__PURE__ */ new Map();
function bn(e) {
  var t = Gt.get(e.nodeName);
  if (t) return t;
  Gt.set(e.nodeName, t = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = jn(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = Rr(n);
  }
  return t;
}
const Gi = () => performance.now(), ue = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => Gi(),
  tasks: /* @__PURE__ */ new Set()
};
function En() {
  const e = ue.now();
  ue.tasks.forEach((t) => {
    t.c(e) || (ue.tasks.delete(t), t.f());
  }), ue.tasks.size !== 0 && ue.tick(En);
}
function zi(e) {
  let t;
  return ue.tasks.size === 0 && ue.tick(En), {
    promise: new Promise((r) => {
      ue.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      ue.tasks.delete(t);
    }
  };
}
function pt(e, t) {
  _n(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function Ki(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Sr(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = Ki(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const Ji = (e) => e;
function kn(e, t, r, n) {
  var i = (e & qn) !== 0, a = "both", s, l = t.inert, f = t.style.overflow, o, c;
  function h() {
    return _n(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var u = {
    is_global: i,
    in() {
      t.inert = l, pt(t, "introstart"), o = zt(t, h(), c, 1, () => {
        pt(t, "introend"), o == null || o.abort(), o = s = void 0, t.style.overflow = f;
      });
    },
    out(p) {
      t.inert = !0, pt(t, "outrostart"), c = zt(t, h(), o, 0, () => {
        pt(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      o == null || o.abort(), c == null || c.abort();
    }
  }, d = (
    /** @type {Effect} */
    $
  );
  if ((d.transitions ?? (d.transitions = [])).push(u), xt) {
    var v = i;
    if (!v) {
      for (var _ = (
        /** @type {Effect | null} */
        d.parent
      ); _ && (_.f & vt) !== 0; )
        for (; (_ = _.parent) && (_.f & Je) === 0; )
          ;
      v = !_ || (_.f & Ct) !== 0;
    }
    v && nn(() => {
      hr(() => u.in());
    });
  }
}
function zt(e, t, r, n, i) {
  var a = n === 1;
  if (Hn(t)) {
    var s, l = !1;
    return fr(() => {
      if (!l) {
        var p = t({ direction: a ? "in" : "out" });
        s = zt(e, p, r, n, i);
      }
    }), {
      abort: () => {
        l = !0, s == null || s.abort();
      },
      deactivate: () => s.deactivate(),
      reset: () => s.reset(),
      t: () => s.t()
    };
  }
  if (r == null || r.deactivate(), !(t != null && t.duration))
    return i(), {
      abort: tt,
      deactivate: tt,
      reset: tt,
      t: () => n
    };
  const { delay: f = 0, css: o, tick: c, easing: h = Ji } = t;
  var u = [];
  if (a && r === void 0 && (c && c(0, 1), o)) {
    var d = Sr(o(0, 1));
    u.push(d, d);
  }
  var v = () => 1 - n, _ = e.animate(u, { duration: f, fill: "forwards" });
  return _.onfinish = () => {
    _.cancel();
    var p = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var x = n - p, C = (
      /** @type {number} */
      t.duration * Math.abs(x)
    ), w = [];
    if (C > 0) {
      var A = !1;
      if (o)
        for (var S = Math.ceil(C / 16.666666666666668), U = 0; U <= S; U += 1) {
          var P = p + x * h(U / S), J = Sr(o(P, 1 - P));
          w.push(J), A || (A = J.overflow === "hidden");
        }
      A && (e.style.overflow = "hidden"), v = () => {
        var g = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return p + x * h(g / C);
      }, c && zi(() => {
        if (_.playState !== "running") return !1;
        var g = v();
        return c(g, 1 - g), !0;
      });
    }
    _ = e.animate(w, { duration: C, fill: "forwards" }), _.onfinish = () => {
      v = () => n, c == null || c(n, 1 - n), i();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = tt);
    },
    deactivate: () => {
      i = tt;
    },
    reset: () => {
      n === 0 && (c == null || c(1, 0));
    },
    t: () => v()
  };
}
function Nr(e, t) {
  return e === t || (e == null ? void 0 : e[gt]) === t;
}
function Zi(e = {}, t, r, n) {
  return nn(() => {
    var i, a;
    return an(() => {
      i = a, a = [], hr(() => {
        e !== r(...a) && (t(e, ...a), i && Nr(r(...i), e) && t(null, ...i));
      });
    }), () => {
      fr(() => {
        a && Nr(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function Te(e, t, r, n) {
  var i = (
    /** @type {V} */
    n
  ), a = !0, s = () => (a && (a = !1, i = /** @type {V} */
  n), i), l;
  l = /** @type {V} */
  e[t], l === void 0 && n !== void 0 && (l = s());
  var f;
  f = () => {
    var u = (
      /** @type {V} */
      e[t]
    );
    return u === void 0 ? s() : (a = !0, u);
  };
  var o = !1, c = /* @__PURE__ */ ur(() => (o = !1, f())), h = (
    /** @type {Effect} */
    $
  );
  return function(u, d) {
    if (arguments.length > 0) {
      const v = d ? y(c) : u;
      return R(c, v), o = !0, i !== void 0 && (i = v), u;
    }
    return Fe && o || (h.f & De) !== 0 ? c.v : y(c);
  };
}
function Qi(e) {
  return new ea(e);
}
var fe, Q;
class ea {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    L(this, fe);
    /** @type {Record<string, any>} */
    L(this, Q);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, l) => {
      var f = /* @__PURE__ */ zr(l, !1, !1);
      return r.set(s, f), f;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, l) {
          return y(r.get(l) ?? n(l, Reflect.get(s, l)));
        },
        has(s, l) {
          return l === Bn ? !0 : (y(r.get(l) ?? n(l, Reflect.get(s, l))), Reflect.has(s, l));
        },
        set(s, l, f) {
          return R(r.get(l) ?? n(l, f), f), Reflect.set(s, l, f);
        }
      }
    );
    Y(this, Q, (t.hydrate ? Di : gn)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && pe(), Y(this, fe, i.$$events);
    for (const s of Object.keys(m(this, Q)))
      s === "$set" || s === "$destroy" || s === "$on" || Ge(this, s, {
        get() {
          return m(this, Q)[s];
        },
        /** @param {any} value */
        set(l) {
          m(this, Q)[s] = l;
        },
        enumerable: !0
      });
    m(this, Q).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, m(this, Q).$destroy = () => {
      Li(m(this, Q));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    m(this, Q).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    m(this, fe)[t] = m(this, fe)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return m(this, fe)[t].push(n), () => {
      m(this, fe)[t] = m(this, fe)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    m(this, Q).$destroy();
  }
}
fe = new WeakMap(), Q = new WeakMap();
let xn;
typeof HTMLElement == "function" && (xn = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    D(this, "$$ctor");
    /** Slots */
    D(this, "$$s");
    /** @type {any} The Svelte component instance */
    D(this, "$$c");
    /** Whether or not the custom element is connected */
    D(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    D(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    D(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    D(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    D(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    D(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    D(this, "$$me");
    this.$$ctor = t, this.$$s = r, n && this.attachShadow({ mode: "open" });
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(t, r, n) {
    if (this.$$l[t] = this.$$l[t] || [], this.$$l[t].push(r), this.$$c) {
      const i = this.$$c.$on(t, r);
      this.$$l_u.set(r, i);
    }
    super.addEventListener(t, r, n);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(t, r, n) {
    if (super.removeEventListener(t, r, n), this.$$c) {
      const i = this.$$l_u.get(r);
      i && (i(), this.$$l_u.delete(r));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(i) {
        return (a) => {
          const s = document.createElement("slot");
          i !== "default" && (s.name = i), Ce(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = ta(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = wt(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = Qi({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = yi(() => {
        an(() => {
          var i;
          this.$$r = !0;
          for (const a of $t(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = wt(
              a,
              this.$$d[a],
              this.$$p_d,
              "toAttribute"
            );
            s == null ? this.removeAttribute(this.$$p_d[a].attribute || a) : this.setAttribute(this.$$p_d[a].attribute || a, s);
          }
          this.$$r = !1;
        });
      });
      for (const i in this.$$l)
        for (const a of this.$$l[i]) {
          const s = this.$$c.$on(i, a);
          this.$$l_u.set(a, s);
        }
      this.$$l = {};
    }
  }
  // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
  // and setting attributes through setAttribute etc, this is helpful
  /**
   * @param {string} attr
   * @param {string} _oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(t, r, n) {
    var i;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = wt(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
    });
  }
  /**
   * @param {string} attribute_name
   */
  $$g_p(t) {
    return $t(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function wt(e, t, r, n) {
  var a;
  const i = (a = r[e]) == null ? void 0 : a.type;
  if (t = i === "Boolean" && typeof t != "boolean" ? t != null : t, !n || !r[e])
    return t;
  if (n === "toAttribute")
    switch (i) {
      case "Object":
      case "Array":
        return t == null ? null : JSON.stringify(t);
      case "Boolean":
        return t ? "" : null;
      case "Number":
        return t ?? null;
      default:
        return t;
    }
  else
    switch (i) {
      case "Object":
      case "Array":
        return t && JSON.parse(t);
      case "Boolean":
        return t;
      // conversion already handled above
      case "Number":
        return t != null ? +t : t;
      default:
        return t;
    }
}
function ta(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Tn(e, t, r, n, i, a) {
  let s = class extends xn {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return $t(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return $t(t).forEach((l) => {
    Ge(s.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(f) {
        var h;
        f = wt(l, f, t), this.$$d[l] = f;
        var o = this.$$c;
        if (o) {
          var c = (h = He(o, l)) == null ? void 0 : h.get;
          c ? o[l] = f : o.$set({ [l]: f });
        }
      }
    });
  }), n.forEach((l) => {
    Ge(s.prototype, l, {
      get() {
        var f;
        return (f = this.$$c) == null ? void 0 : f[l];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let Tt = /* @__PURE__ */ W(void 0);
const ra = async () => (R(Tt, await window.loadCardHelpers().then((e) => e), !0), y(Tt)), na = () => y(Tt) ? y(Tt) : ra();
function ia(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Cn(e, { delay: t = 0, duration: r = 400, easing: n = ia, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, l = i === "y" ? "height" : "width", f = parseFloat(a[l]), o = i === "y" ? ["top", "bottom"] : ["left", "right"], c = o.map(
    (x) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${x[0].toUpperCase()}${x.slice(1)}`
    )
  ), h = parseFloat(a[`padding${c[0]}`]), u = parseFloat(a[`padding${c[1]}`]), d = parseFloat(a[`margin${c[0]}`]), v = parseFloat(a[`margin${c[1]}`]), _ = parseFloat(
    a[`border${c[0]}Width`]
  ), p = parseFloat(
    a[`border${c[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (x) => `overflow: hidden;opacity: ${Math.min(x * 20, 1) * s};${l}: ${x * f}px;padding-${o[0]}: ${x * h}px;padding-${o[1]}: ${x * u}px;margin-${o[0]}: ${x * d}px;margin-${o[1]}: ${x * v}px;border-${o[0]}-width: ${x * _}px;border-${o[1]}-width: ${x * p}px;min-${l}: 0`
  };
}
var aa = /* @__PURE__ */ Ze('<span class="loading svelte-1sdlsm">Loading...</span>'), sa = /* @__PURE__ */ Ze('<div class="outer-container"><!> <!></div>');
const la = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function Kt(e, t) {
  sr(t, !0), $n(e, la);
  const r = Te(t, "type", 7, "div"), n = Te(t, "config"), i = Te(t, "hass"), a = Te(t, "marginTop", 7, "0px"), s = Te(t, "open");
  let l = /* @__PURE__ */ W(void 0), f = /* @__PURE__ */ W(!0);
  Ht(() => {
    y(l) && (y(l).hass = i());
  }), Ht(() => {
    var _, p;
    const v = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    (p = (_ = y(l)) == null ? void 0 : _.setConfig) == null || p.call(_, v);
  }), wn(async () => {
    const d = await na(), _ = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, p = d.createCardElement(_);
    p.hass = i(), y(l) && (y(l).replaceWith(p), R(l, p, !0), R(f, !1));
  });
  var o = sa(), c = ke(o);
  Yi(c, r, !1, (d, v) => {
    Zi(d, (_) => R(l, _, !0), () => y(l)), kn(3, d, () => Cn);
  });
  var h = mt(c, 2);
  {
    var u = (d) => {
      var v = aa();
      Ce(d, v);
    };
    Bt(h, (d) => {
      y(f) && d(u);
    });
  }
  return he(o), xe(() => _e(o, `margin-top: ${a() ?? ""};`)), Ce(e, o), lr({
    get type() {
      return r();
    },
    set type(d = "div") {
      r(d), pe();
    },
    get config() {
      return n();
    },
    set config(d) {
      n(d), pe();
    },
    get hass() {
      return i();
    },
    set hass(d) {
      i(d), pe();
    },
    get marginTop() {
      return a();
    },
    set marginTop(d = "0px") {
      a(d), pe();
    },
    get open() {
      return s();
    },
    set open(d) {
      s(d), pe();
    }
  });
}
customElements.define("expander-sub-card", Tn(Kt, { type: {}, config: {}, hass: {}, marginTop: {}, open: {} }, [], [], !0));
function oa(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const Jt = {
  gap: "0.0em",
  "expanded-gap": "0.6em",
  padding: "1em",
  clear: !1,
  title: " ",
  "overlay-margin": "0.0em",
  "child-padding": "0.0em",
  "child-margin-top": "0.0em",
  "button-background": "transparent",
  "expander-card-background": "var(--ha-card-background,var(--card-background-color,#fff))",
  "header-color": "var(--primary-text-color,#fff)",
  "arrow-color": "var(--arrow-color,var(--primary-text-color,#fff))",
  "expander-card-display": "block",
  "title-card-clickable": !1,
  "min-width-expanded": 0,
  "max-width-expanded": 0,
  icon: "mdi:chevron-down"
};
var fa = /* @__PURE__ */ Ze('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), ua = /* @__PURE__ */ Ze("<button><div> </div> <ha-icon></ha-icon></button>", 2), ca = /* @__PURE__ */ Ze('<div class="children-container svelte-icqkke"></div>'), da = /* @__PURE__ */ Ze("<ha-card><!> <!></ha-card>", 2);
const va = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function ha(e, t) {
  sr(t, !0), $n(e, va);
  const r = Te(t, "hass"), n = Te(t, "config", 7, Jt);
  let i = /* @__PURE__ */ W(!1), a = /* @__PURE__ */ W(!1);
  const s = n()["storgage-id"], l = "expander-open-" + s;
  function f() {
    o(!y(a));
  }
  function o(g) {
    if (R(a, g, !0), s !== void 0)
      try {
        localStorage.setItem(l, y(a) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
  }
  wn(() => {
    const g = n()["min-width-expanded"], E = n()["max-width-expanded"], T = document.body.offsetWidth;
    if (g && E ? n().expanded = T >= g && T <= E : g ? n().expanded = T >= g : E && (n().expanded = T <= E), s !== void 0)
      try {
        const O = localStorage.getItem(l);
        O === null ? n().expanded !== void 0 && o(n().expanded) : R(a, O ? O === "true" : y(a), !0);
      } catch (O) {
        console.error(O);
      }
    else
      n().expanded !== void 0 && o(n().expanded);
  });
  const c = (g) => {
    if (y(i))
      return g.preventDefault(), g.stopImmediatePropagation(), R(i, !1), !1;
    f();
  }, h = (g) => {
    const E = g.currentTarget;
    E != null && E.classList.contains("title-card-container") && c(g);
  };
  let u, d = !1, v = 0, _ = 0;
  const p = (g) => {
    u = g.target, v = g.touches[0].clientX, _ = g.touches[0].clientY, d = !1;
  }, x = (g) => {
    const E = g.touches[0].clientX, T = g.touches[0].clientY;
    (Math.abs(E - v) > 10 || Math.abs(T - _) > 10) && (d = !0);
  }, C = (g) => {
    !d && u === g.target && n()["title-card-clickable"] && f(), u = void 0, R(i, !0);
  };
  var w = da(), A = ke(w);
  {
    var S = (g) => {
      var E = fa(), T = ke(E);
      T.__touchstart = p, T.__touchmove = x, T.__touchend = C, T.__click = function(...Rt) {
        var pr;
        (pr = n()["title-card-clickable"] ? h : null) == null || pr.apply(this, Rt);
      };
      var O = ke(T);
      Kt(O, {
        get hass() {
          return r();
        },
        get config() {
          return n()["title-card"];
        },
        get type() {
          return n()["title-card"].type;
        },
        open: !0
      }), he(T);
      var re = mt(T, 2);
      re.__click = c;
      var Qe = ke(re);
      xe(() => Cr(Qe, "icon", n().icon)), he(re), he(E), xe(() => {
        Ee(E, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-icqkke"), _e(T, `--title-padding:${n()["title-card-padding"] ?? ""}`), yn(T, "role", n()["title-card-clickable"] ? "button" : void 0), _e(re, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Ee(re, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${y(a) ? " open" : " close"}`, "svelte-icqkke"), _e(Qe, `--arrow-color:${n()["arrow-color"] ?? ""}`), Ee(Qe, 1, `ico${y(a) ? " flipped open" : "close"}`, "svelte-icqkke");
      }), Ce(g, E);
    }, U = (g) => {
      var E = ua();
      E.__click = c;
      var T = ke(E), O = ke(T, !0);
      he(T);
      var re = mt(T, 2);
      xe(() => Cr(re, "icon", n().icon)), he(E), xe(() => {
        Ee(E, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${y(a) ? " open" : " close"}`, "svelte-icqkke"), _e(E, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Ee(T, 1, `primary title${y(a) ? " open" : " close"}`, "svelte-icqkke"), Pi(O, n().title), _e(re, `--arrow-color:${n()["arrow-color"] ?? ""}`), Ee(re, 1, `ico${y(a) ? " flipped open" : " close"}`, "svelte-icqkke");
      }), Ce(g, E);
    };
    Bt(A, (g) => {
      n()["title-card"] ? g(S) : g(U, !1);
    });
  }
  var P = mt(A, 2);
  {
    var J = (g) => {
      var E = ca();
      ji(E, 20, () => n().cards, (T) => T, (T, O) => {
        Kt(T, {
          get hass() {
            return r();
          },
          get config() {
            return O;
          },
          get type() {
            return O.type;
          },
          get marginTop() {
            return n()["child-margin-top"];
          },
          get open() {
            return y(a);
          }
        });
      }), he(E), xe(() => _e(E, `--expander-card-display:${n()["expander-card-display"] ?? ""}
             --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), kn(3, E, () => Cn, () => ({ duration: 500, easing: oa })), Ce(g, E);
    };
    Bt(P, (g) => {
      n().cards && g(J);
    });
  }
  return he(w), xe(() => {
    Ee(w, 1, `expander-card${n().clear ? " clear" : ""}${y(a) ? " open" : " close"}`, "svelte-icqkke"), _e(w, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${y(a) ?? ""};
     --card-background:${(y(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
  }), Ce(e, w), lr({
    get hass() {
      return r();
    },
    set hass(g) {
      r(g), pe();
    },
    get config() {
      return n();
    },
    set config(g = Jt) {
      n(g), pe();
    }
  });
}
Ai(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", Tn(ha, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    D(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...Jt, ...r };
  }
}));
const _a = "2.5.1";
console.info(
  `%c  Expander-Card 
%c Version ${_a}`,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "expander-card",
  name: "Expander Card",
  preview: !0,
  description: "Expander card"
});
export {
  ha as default
};
//# sourceMappingURL=expander-card.js.map
