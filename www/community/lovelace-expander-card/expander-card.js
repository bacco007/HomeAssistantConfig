var Fn = Object.defineProperty;
var br = (e) => {
  throw TypeError(e);
};
var qn = (e, t, r) => t in e ? Fn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var I = (e, t, r) => qn(e, typeof t != "symbol" ? t + "" : t, r), jt = (e, t, r) => t.has(e) || br("Cannot " + r);
var y = (e, t, r) => (jt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), j = (e, t, r) => t.has(e) ? br("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Y = (e, t, r, n) => (jt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), wt = (e, t, r) => (jt(e, t, "access private method"), r);
const Hn = "5";
var Lr;
typeof window < "u" && ((Lr = window.__svelte ?? (window.__svelte = {})).v ?? (Lr.v = /* @__PURE__ */ new Set())).add(Hn);
const Un = 1, jn = 2, Yn = 16, Vn = 4, Bn = 1, Wn = 2, Dr = "[", sr = "[!", or = "]", Ge = {}, M = Symbol(), zn = "http://www.w3.org/1999/xhtml", Xn = "http://www.w3.org/2000/svg", Fr = !1;
var lr = Array.isArray, Gn = Array.prototype.indexOf, fr = Array.from, Ct = Object.keys, rt = Object.defineProperty, Ke = Object.getOwnPropertyDescriptor, Kn = Object.getOwnPropertyDescriptors, Jn = Object.prototype, Zn = Array.prototype, qr = Object.getPrototypeOf, Er = Object.isExtensible;
function Qn(e) {
  return typeof e == "function";
}
const st = () => {
};
function Hr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ei() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const G = 2, ur = 4, Ur = 8, at = 16, ge = 32, Ye = 64, jr = 128, ee = 256, Tt = 512, L = 1024, se = 2048, Ve = 4096, ae = 8192, Be = 16384, Pt = 32768, gt = 65536, xr = 1 << 17, ti = 1 << 18, cr = 1 << 19, Yr = 1 << 20, Bt = 1 << 21, It = 1 << 22, Le = 1 << 23, bt = Symbol("$state"), ri = Symbol("legacy props"), ni = Symbol(""), dr = new class extends Error {
  constructor() {
    super(...arguments);
    I(this, "name", "StaleReactionError");
    I(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), ii = 1, Vr = 3, ct = 8;
function ai() {
  throw new Error("https://svelte.dev/e/await_outside_boundary");
}
function si(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function oi() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function li(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function fi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ui(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ci() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function di() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function vi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function hi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function _i() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Lt(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let k = !1;
function W(e) {
  k = e;
}
let A;
function z(e) {
  if (e === null)
    throw Lt(), Ge;
  return A = e;
}
function nt() {
  return z(
    /** @type {TemplateNode} */
    /* @__PURE__ */ Ae(A)
  );
}
function $e(e) {
  if (k) {
    if (/* @__PURE__ */ Ae(A) !== null)
      throw Lt(), Ge;
    A = e;
  }
}
function Wt() {
  for (var e = 0, t = A; ; ) {
    if (t.nodeType === ct) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === or) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Dr || r === sr) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ae(t)
    );
    t.remove(), t = n;
  }
}
function Br(e) {
  if (!e || e.nodeType !== ct)
    throw Lt(), Ge;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Wr(e) {
  return e === this.v;
}
function pi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function zr(e) {
  return !pi(e, this.v);
}
let gi = !1, te = null;
function St(e) {
  te = e;
}
function vr(e, t = !1, r) {
  te = {
    p: te,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function hr(e) {
  var t = (
    /** @type {ComponentContext} */
    te
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      un(n);
  }
  return e !== void 0 && (t.x = e), te = t.p, e ?? /** @type {T} */
  {};
}
function Xr() {
  return !0;
}
const mi = /* @__PURE__ */ new WeakMap();
function wi(e) {
  var t = x;
  if (t === null)
    return C.f |= Le, e;
  if ((t.f & Pt) === 0) {
    if ((t.f & jr) === 0)
      throw !t.parent && e instanceof Error && Gr(e), e;
    t.b.error(e);
  } else
    _r(e, t);
}
function _r(e, t) {
  for (; t !== null; ) {
    if ((t.f & jr) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    t = t.parent;
  }
  throw e instanceof Error && Gr(e), e;
}
function Gr(e) {
  const t = mi.get(e);
  t && (rt(e, "message", {
    value: t.message
  }), rt(e, "stack", {
    value: t.stack
  }));
}
let dt = [], zt = [];
function Kr() {
  var e = dt;
  dt = [], Hr(e);
}
function $i() {
  var e = zt;
  zt = [], Hr(e);
}
function pr(e) {
  dt.length === 0 && queueMicrotask(Kr), dt.push(e);
}
function yi() {
  dt.length > 0 && Kr(), zt.length > 0 && $i();
}
function bi() {
  for (var e = (
    /** @type {Effect} */
    x.b
  ); e !== null && !e.has_pending_snippet(); )
    e = e.parent;
  return e === null && ai(), e;
}
// @__NO_SIDE_EFFECTS__
function Dt(e) {
  var t = G | se, r = C !== null && (C.f & G) !== 0 ? (
    /** @type {Derived} */
    C
  ) : null;
  return x === null || r !== null && (r.f & ee) !== 0 ? t |= ee : x.f |= cr, {
    ctx: te,
    deps: null,
    effects: null,
    equals: Wr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      M
    ),
    wv: 0,
    parent: r ?? x,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Ei(e, t) {
  let r = (
    /** @type {Effect | null} */
    x
  );
  r === null && oi();
  var n = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = vt(
    /** @type {V} */
    M
  ), s = null, o = !C;
  return Pi(() => {
    try {
      var l = e();
    } catch (d) {
      l = Promise.reject(d);
    }
    var f = () => l;
    i = (s == null ? void 0 : s.then(f, f)) ?? Promise.resolve(l), s = i;
    var u = (
      /** @type {Batch} */
      O
    ), _ = n.pending;
    o && (n.update_pending_count(1), _ || u.increment());
    const c = (d, h = void 0) => {
      s = null, _ || u.activate(), h ? h !== dr && (a.f |= Le, Kt(a, h)) : ((a.f & Le) !== 0 && (a.f ^= Le), Kt(a, d)), o && (n.update_pending_count(-1), _ || u.decrement()), Qr();
    };
    if (i.then(c, (d) => c(null, d || "unknown")), u)
      return () => {
        queueMicrotask(() => u.neuter());
      };
  }), new Promise((l) => {
    function f(u) {
      function _() {
        u === i ? l(a) : f(i);
      }
      u.then(_, _);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function kr(e) {
  const t = /* @__PURE__ */ Dt(e);
  return mn(t), t;
}
// @__NO_SIDE_EFFECTS__
function xi(e) {
  const t = /* @__PURE__ */ Dt(e);
  return t.equals = zr, t;
}
function Jr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      oe(
        /** @type {Effect} */
        t[r]
      );
  }
}
function ki(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & G) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function gr(e) {
  var t, r = x;
  ce(ki(e));
  try {
    Jr(e), t = bn(e);
  } finally {
    ce(r);
  }
  return t;
}
function Zr(e) {
  var t = gr(e);
  if (e.equals(t) || (e.v = t, e.wv = $n()), !We)
    if (Ce !== null)
      Ce.set(e, e.v);
    else {
      var r = (Te || (e.f & ee) !== 0) && e.deps !== null ? Ve : L;
      X(e, r);
    }
}
function Ci(e, t, r) {
  const n = Dt;
  if (t.length === 0) {
    r(e.map(n));
    return;
  }
  var i = O, a = (
    /** @type {Effect} */
    x
  ), s = Ti(), o = bi();
  Promise.all(t.map((l) => /* @__PURE__ */ Ei(l))).then((l) => {
    i == null || i.activate(), s();
    try {
      r([...e.map(n), ...l]);
    } catch (f) {
      (a.f & Be) === 0 && _r(f, a);
    }
    i == null || i.deactivate(), Qr();
  }).catch((l) => {
    o.error(l);
  });
}
function Ti() {
  var e = x, t = C, r = te;
  return function() {
    ce(e), re(t), St(r);
  };
}
function Qr() {
  ce(null), re(null), St(null);
}
const ot = /* @__PURE__ */ new Set();
let O = null, Ce = null, Cr = /* @__PURE__ */ new Set(), At = [];
function en() {
  const e = (
    /** @type {() => void} */
    At.shift()
  );
  At.length > 0 && queueMicrotask(en), e();
}
let He = [], Ft = null, Xt = !1, Et = !1;
var Ze, Qe, xe, _t, pt, Pe, et, Ie, ke, tt, je, tn, Gt;
const Mt = class Mt {
  constructor() {
    j(this, je);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    I(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    j(this, Ze, /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    j(this, Qe, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    j(this, xe, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    j(this, _t, null);
    /**
     * True if an async effect inside this batch resolved and
     * its parent branch was already deleted
     */
    j(this, pt, !1);
    /**
     * Async effects (created inside `async_derived`) encountered during processing.
     * These run after the rest of the batch has updated, since they should
     * always have the latest values
     * @type {Effect[]}
     */
    j(this, Pe, []);
    /**
     * The same as `#async_effects`, but for effects inside a newly-created
     * `<svelte:boundary>` — these do not prevent the batch from committing
     * @type {Effect[]}
     */
    j(this, et, []);
    /**
     * Template effects and `$effect.pre` effects, which run when
     * a batch is committed
     * @type {Effect[]}
     */
    j(this, Ie, []);
    /**
     * The same as `#render_effects`, but for `$effect` (which runs after)
     * @type {Effect[]}
     */
    j(this, ke, []);
    /**
     * Block effects, which may need to re-run on subsequent flushes
     * in order to update internal sources (e.g. each block items)
     * @type {Effect[]}
     */
    j(this, tt, []);
    /**
     * A set of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`
     * @type {Set<Effect>}
     */
    I(this, "skipped_effects", /* @__PURE__ */ new Set());
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var a;
    He = [];
    var r = null;
    if (ot.size > 1) {
      r = /* @__PURE__ */ new Map(), Ce = /* @__PURE__ */ new Map();
      for (const [s, o] of this.current)
        r.set(s, { v: s.v, wv: s.wv }), s.v = o;
      for (const s of ot)
        if (s !== this)
          for (const [o, l] of y(s, Ze))
            r.has(o) || (r.set(o, { v: o.v, wv: o.wv }), o.v = l);
    }
    for (const s of t)
      wt(this, je, tn).call(this, s);
    if (y(this, Pe).length === 0 && y(this, xe) === 0) {
      wt(this, je, Gt).call(this);
      var n = y(this, Ie), i = y(this, ke);
      Y(this, Ie, []), Y(this, ke, []), Y(this, tt, []), O = null, Tr(n), Tr(i), O === null ? O = this : ot.delete(this), (a = y(this, _t)) == null || a.resolve();
    } else {
      for (const s of y(this, Ie)) X(s, L);
      for (const s of y(this, ke)) X(s, L);
      for (const s of y(this, tt)) X(s, L);
    }
    if (r) {
      for (const [s, { v: o, wv: l }] of r)
        s.wv <= l && (s.v = o);
      Ce = null;
    }
    for (const s of y(this, Pe))
      ut(s);
    for (const s of y(this, et))
      ut(s);
    Y(this, Pe, []), Y(this, et, []);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    y(this, Ze).has(t) || y(this, Ze).set(t, r), this.current.set(t, t.v);
  }
  activate() {
    O = this;
  }
  deactivate() {
    O = null;
    for (const t of Cr)
      if (Cr.delete(t), t(), O !== null)
        break;
  }
  neuter() {
    Y(this, pt, !0);
  }
  flush() {
    He.length > 0 ? rn() : wt(this, je, Gt).call(this), O === this && (y(this, xe) === 0 && ot.delete(this), this.deactivate());
  }
  increment() {
    Y(this, xe, y(this, xe) + 1);
  }
  decrement() {
    if (Y(this, xe, y(this, xe) - 1), y(this, xe) === 0) {
      for (const t of this.current.keys())
        mr(t, se, !1);
      Y(this, Ie, []), Y(this, ke, []), this.flush();
    } else
      this.deactivate();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    y(this, Qe).add(t);
  }
  settled() {
    return (y(this, _t) ?? Y(this, _t, ei())).promise;
  }
  static ensure() {
    if (O === null) {
      const t = O = new Mt();
      ot.add(O), Et || Mt.enqueue(() => {
        O === t && t.flush();
      });
    }
    return O;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    At.length === 0 && queueMicrotask(en), At.unshift(t);
  }
};
Ze = new WeakMap(), Qe = new WeakMap(), xe = new WeakMap(), _t = new WeakMap(), pt = new WeakMap(), Pe = new WeakMap(), et = new WeakMap(), Ie = new WeakMap(), ke = new WeakMap(), tt = new WeakMap(), je = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 */
tn = function(t) {
  var u;
  t.f ^= L;
  for (var r = t.first; r !== null; ) {
    var n = r.f, i = (n & (ge | Ye)) !== 0, a = i && (n & L) !== 0, s = a || (n & ae) !== 0 || this.skipped_effects.has(r);
    if (!s && r.fn !== null) {
      if (i)
        r.f ^= L;
      else if ((n & ur) !== 0)
        y(this, ke).push(r);
      else if (Ut(r))
        if ((n & It) !== 0) {
          var o = (u = r.b) != null && u.pending ? y(this, et) : y(this, Pe);
          o.push(r);
        } else
          (r.f & at) !== 0 && y(this, tt).push(r), ut(r);
      var l = r.first;
      if (l !== null) {
        r = l;
        continue;
      }
    }
    var f = r.parent;
    for (r = r.next; r === null && f !== null; )
      r = f.next, f = f.parent;
  }
}, /**
 * Append and remove branches to/from the DOM
 */
Gt = function() {
  if (!y(this, pt))
    for (const t of y(this, Qe))
      t();
  y(this, Qe).clear();
};
let it = Mt;
function de(e) {
  var t = Et;
  Et = !0;
  try {
    for (var r; ; ) {
      if (yi(), He.length === 0 && (O == null || O.flush(), He.length === 0))
        return Ft = null, /** @type {T} */
        r;
      rn();
    }
  } finally {
    Et = t;
  }
}
function rn() {
  var e = Je;
  Xt = !0;
  try {
    var t = 0;
    for (Ar(!0); He.length > 0; ) {
      var r = it.ensure();
      if (t++ > 1e3) {
        var n, i;
        Si();
      }
      r.process(He), De.clear();
    }
  } finally {
    Xt = !1, Ar(e), Ft = null;
  }
}
function Si() {
  try {
    ci();
  } catch (e) {
    _r(e, Ft);
  }
}
function Tr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (Be | ae)) === 0 && Ut(n)) {
        var i = O ? O.current.size : 0;
        if (ut(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null && n.ac === null ? _n(n) : n.fn = null), O !== null && O.current.size > i && (n.f & Yr) !== 0)
          break;
      }
    }
    for (; r < t; )
      mt(e[r++]);
  }
}
function mt(e) {
  for (var t = Ft = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Xt && t === x && (r & at) !== 0)
      return;
    if ((r & (Ye | ge)) !== 0) {
      if ((r & L) === 0) return;
      t.f ^= L;
    }
  }
  He.push(t);
}
const De = /* @__PURE__ */ new Map();
function vt(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Wr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  const r = vt(e);
  return mn(r), r;
}
// @__NO_SIDE_EFFECTS__
function nn(e, t = !1, r = !0) {
  const n = vt(e);
  return t || (n.equals = zr), n;
}
function P(e, t, r = !1) {
  C !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!ue || (C.f & xr) !== 0) && Xr() && (C.f & (G | at | It | xr)) !== 0 && !(H != null && H.includes(e)) && _i();
  let n = r ? lt(t) : t;
  return Kt(e, n);
}
function Kt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    We ? De.set(e, t) : De.set(e, r), e.v = t;
    var n = it.ensure();
    n.capture(e, r), (e.f & G) !== 0 && ((e.f & se) !== 0 && gr(
      /** @type {Derived} */
      e
    ), X(e, (e.f & ee) === 0 ? L : Ve)), e.wv = $n(), mr(e, se), x !== null && (x.f & L) !== 0 && (x.f & (ge | Ye)) === 0 && (Z === null ? Di([e]) : Z.push(e));
  }
  return t;
}
function Yt(e) {
  P(e, e.v + 1);
}
function mr(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null)
    for (var i = n.length, a = 0; a < i; a++) {
      var s = n[a], o = s.f, l = (o & se) === 0 && (r || (o & It) === 0);
      l && X(s, t), (o & G) !== 0 ? mr(
        /** @type {Derived} */
        s,
        Ve
      ) : l && mt(
        /** @type {Effect} */
        s
      );
    }
}
function lt(e) {
  if (typeof e != "object" || e === null || bt in e)
    return e;
  const t = qr(e);
  if (t !== Jn && t !== Zn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = lr(e), i = /* @__PURE__ */ B(0), a = Fe, s = (o) => {
    if (Fe === a)
      return o();
    var l = C, f = Fe;
    re(null), Or(a);
    var u = o();
    return re(l), Or(f), u;
  };
  return n && r.set("length", /* @__PURE__ */ B(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && vi();
        var u = r.get(l);
        return u === void 0 ? u = s(() => {
          var _ = /* @__PURE__ */ B(f.value);
          return r.set(l, _), _;
        }) : P(u, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const u = s(() => /* @__PURE__ */ B(M));
            r.set(l, u), Yt(i);
          }
        } else
          P(f, M), Yt(i);
        return !0;
      },
      get(o, l, f) {
        var d;
        if (l === bt)
          return e;
        var u = r.get(l), _ = l in o;
        if (u === void 0 && (!_ || (d = Ke(o, l)) != null && d.writable) && (u = s(() => {
          var h = lt(_ ? o[l] : M), v = /* @__PURE__ */ B(h);
          return v;
        }), r.set(l, u)), u !== void 0) {
          var c = E(u);
          return c === M ? void 0 : c;
        }
        return Reflect.get(o, l, f);
      },
      getOwnPropertyDescriptor(o, l) {
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f && "value" in f) {
          var u = r.get(l);
          u && (f.value = E(u));
        } else if (f === void 0) {
          var _ = r.get(l), c = _ == null ? void 0 : _.v;
          if (_ !== void 0 && c !== M)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return f;
      },
      has(o, l) {
        var c;
        if (l === bt)
          return !0;
        var f = r.get(l), u = f !== void 0 && f.v !== M || Reflect.has(o, l);
        if (f !== void 0 || x !== null && (!u || (c = Ke(o, l)) != null && c.writable)) {
          f === void 0 && (f = s(() => {
            var d = u ? lt(o[l]) : M, h = /* @__PURE__ */ B(d);
            return h;
          }), r.set(l, f));
          var _ = E(f);
          if (_ === M)
            return !1;
        }
        return u;
      },
      set(o, l, f, u) {
        var w;
        var _ = r.get(l), c = l in o;
        if (n && l === "length")
          for (var d = f; d < /** @type {Source<number>} */
          _.v; d += 1) {
            var h = r.get(d + "");
            h !== void 0 ? P(h, M) : d in o && (h = s(() => /* @__PURE__ */ B(M)), r.set(d + "", h));
          }
        if (_ === void 0)
          (!c || (w = Ke(o, l)) != null && w.writable) && (_ = s(() => /* @__PURE__ */ B(void 0)), P(_, lt(f)), r.set(l, _));
        else {
          c = _.v !== M;
          var v = s(() => lt(f));
          P(_, v);
        }
        var p = Reflect.getOwnPropertyDescriptor(o, l);
        if (p != null && p.set && p.set.call(u, f), !c) {
          if (n && typeof l == "string") {
            var g = (
              /** @type {Source<number>} */
              r.get("length")
            ), $ = Number(l);
            Number.isInteger($) && $ >= g.v && P(g, $ + 1);
          }
          Yt(i);
        }
        return !0;
      },
      ownKeys(o) {
        E(i);
        var l = Reflect.ownKeys(o).filter((_) => {
          var c = r.get(_);
          return c === void 0 || c.v !== M;
        });
        for (var [f, u] of r)
          u.v !== M && !(f in o) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        hi();
      }
    }
  );
}
var Sr, an, sn, on;
function Jt() {
  if (Sr === void 0) {
    Sr = window, an = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    sn = Ke(t, "firstChild").get, on = Ke(t, "nextSibling").get, Er(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Er(r) && (r.__t = void 0);
  }
}
function pe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Se(e) {
  return sn.call(e);
}
// @__NO_SIDE_EFFECTS__
function Ae(e) {
  return on.call(e);
}
function Me(e, t) {
  if (!k)
    return /* @__PURE__ */ Se(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ Se(A)
  );
  if (r === null)
    r = A.appendChild(pe());
  else if (t && r.nodeType !== Vr) {
    var n = pe();
    return r == null || r.before(n), z(n), n;
  }
  return z(r), r;
}
function Ai(e, t) {
  if (!k) {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Se(
        /** @type {Node} */
        e
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Ae(r) : r;
  }
  return A;
}
function xt(e, t = 1, r = !1) {
  let n = k ? A : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ Ae(n);
  if (!k)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== Vr) {
    var a = pe();
    return n === null ? i == null || i.after(a) : n.before(a), z(a), a;
  }
  return z(n), /** @type {TemplateNode} */
  n;
}
function ln(e) {
  e.textContent = "";
}
function fn() {
  return !1;
}
function Ni(e) {
  x === null && C === null && ui(), C !== null && (C.f & ee) !== 0 && x === null && fi(), We && li();
}
function Oi(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function me(e, t, r, n = !0) {
  var i = x;
  i !== null && (i.f & ae) !== 0 && (e |= ae);
  var a = {
    ctx: te,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | se,
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
      ut(a), a.f |= Pt;
    } catch (l) {
      throw oe(a), l;
    }
  else t !== null && mt(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & cr) === 0;
  if (!s && n && (i !== null && Oi(a, i), C !== null && (C.f & G) !== 0)) {
    var o = (
      /** @type {Derived} */
      C
    );
    (o.effects ?? (o.effects = [])).push(a);
  }
  return a;
}
function Zt(e) {
  Ni();
  var t = (
    /** @type {Effect} */
    x.f
  ), r = !C && (t & ge) !== 0 && (t & Pt) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      te
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return un(e);
}
function un(e) {
  return me(ur | Yr, e, !1);
}
function Ri(e) {
  it.ensure();
  const t = me(Ye, e, !0);
  return () => {
    oe(t);
  };
}
function Mi(e) {
  it.ensure();
  const t = me(Ye, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? qt(t, () => {
      oe(t), n(void 0);
    }) : (oe(t), n(void 0));
  });
}
function cn(e) {
  return me(ur, e, !1);
}
function Pi(e) {
  return me(It | cr, e, !0);
}
function dn(e, t = 0) {
  return me(Ur | t, e, !0);
}
function ye(e, t = [], r = []) {
  Ci(t, r, (n) => {
    me(Ur, () => e(...n.map(E)), !0);
  });
}
function wr(e, t = 0) {
  var r = me(at | t, e, !0);
  return r;
}
function Ue(e, t = !0) {
  return me(ge, e, !0, t);
}
function vn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = We, n = C;
    Nr(!0), re(null);
    try {
      t.call(null);
    } finally {
      Nr(r), re(n);
    }
  }
}
function hn(e, t = !1) {
  var i;
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    (i = r.ac) == null || i.abort(dr);
    var n = r.next;
    (r.f & Ye) !== 0 ? r.parent = null : oe(r, t), r = n;
  }
}
function Ii(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ge) === 0 && oe(t), t = r;
  }
}
function oe(e, t = !0) {
  var r = !1;
  (t || (e.f & ti) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Li(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), hn(e, t && !r), Nt(e, 0), X(e, Be);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  vn(e);
  var i = e.parent;
  i !== null && i.first !== null && _n(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Li(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ae(e)
    );
    e.remove(), e = r;
  }
}
function _n(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function qt(e, t) {
  var r = [];
  $r(e, r, !0), pn(r, () => {
    oe(e), t && t();
  });
}
function pn(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function $r(e, t, r) {
  if ((e.f & ae) === 0) {
    if (e.f ^= ae, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & gt) !== 0 || (n.f & ge) !== 0;
      $r(n, t, a ? r : !1), n = i;
    }
  }
}
function Ht(e) {
  gn(e, !0);
}
function gn(e, t) {
  if ((e.f & ae) !== 0) {
    e.f ^= ae, (e.f & L) === 0 && (X(e, se), mt(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & gt) !== 0 || (r.f & ge) !== 0;
      gn(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let Je = !1;
function Ar(e) {
  Je = e;
}
let We = !1;
function Nr(e) {
  We = e;
}
let C = null, ue = !1;
function re(e) {
  C = e;
}
let x = null;
function ce(e) {
  x = e;
}
let H = null;
function mn(e) {
  C !== null && (H === null ? H = [e] : H.push(e));
}
let q = null, V = 0, Z = null;
function Di(e) {
  Z = e;
}
let wn = 1, ht = 0, Fe = ht;
function Or(e) {
  Fe = e;
}
let Te = !1;
function $n() {
  return ++wn;
}
function Ut(e) {
  var _;
  var t = e.f;
  if ((t & se) !== 0)
    return !0;
  if ((t & Ve) !== 0) {
    var r = e.deps, n = (t & ee) !== 0;
    if (r !== null) {
      var i, a, s = (t & Tt) !== 0, o = n && x !== null && !Te, l = r.length;
      if ((s || o) && (x === null || (x.f & Be) === 0)) {
        var f = (
          /** @type {Derived} */
          e
        ), u = f.parent;
        for (i = 0; i < l; i++)
          a = r[i], (s || !((_ = a == null ? void 0 : a.reactions) != null && _.includes(f))) && (a.reactions ?? (a.reactions = [])).push(f);
        s && (f.f ^= Tt), o && u !== null && (u.f & ee) === 0 && (f.f ^= ee);
      }
      for (i = 0; i < l; i++)
        if (a = r[i], Ut(
          /** @type {Derived} */
          a
        ) && Zr(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || x !== null && !Te) && X(e, L);
  }
  return !1;
}
function yn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(H != null && H.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & G) !== 0 ? yn(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? X(a, se) : (a.f & L) !== 0 && X(a, Ve), mt(
        /** @type {Effect} */
        a
      ));
    }
}
function bn(e) {
  var h;
  var t = q, r = V, n = Z, i = C, a = Te, s = H, o = te, l = ue, f = Fe, u = e.f;
  q = /** @type {null | Value[]} */
  null, V = 0, Z = null, Te = (u & ee) !== 0 && (ue || !Je || C === null), C = (u & (ge | Ye)) === 0 ? e : null, H = null, St(e.ctx), ue = !1, Fe = ++ht, e.ac !== null && (e.ac.abort(dr), e.ac = null);
  try {
    e.f |= Bt;
    var _ = (
      /** @type {Function} */
      (0, e.fn)()
    ), c = e.deps;
    if (q !== null) {
      var d;
      if (Nt(e, V), c !== null && V > 0)
        for (c.length = V + q.length, d = 0; d < q.length; d++)
          c[V + d] = q[d];
      else
        e.deps = c = q;
      if (!Te || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (u & G) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (d = V; d < c.length; d++)
          ((h = c[d]).reactions ?? (h.reactions = [])).push(e);
    } else c !== null && V < c.length && (Nt(e, V), c.length = V);
    if (Xr() && Z !== null && !ue && c !== null && (e.f & (G | Ve | se)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      Z.length; d++)
        yn(
          Z[d],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (ht++, Z !== null && (n === null ? n = Z : n.push(.../** @type {Source[]} */
    Z))), (e.f & Le) !== 0 && (e.f ^= Le), _;
  } catch (v) {
    return wi(v);
  } finally {
    e.f ^= Bt, q = t, V = r, Z = n, C = i, Te = a, H = s, St(o), ue = l, Fe = f;
  }
}
function Fi(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Gn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & G) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (q === null || !q.includes(t)) && (X(t, Ve), (t.f & (ee | Tt)) === 0 && (t.f ^= Tt), Jr(
    /** @type {Derived} **/
    t
  ), Nt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Nt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Fi(e, r[n]);
}
function ut(e) {
  var t = e.f;
  if ((t & Be) === 0) {
    X(e, L);
    var r = x, n = Je;
    x = e, Je = !0;
    try {
      (t & at) !== 0 ? Ii(e) : hn(e), vn(e);
      var i = bn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = wn;
      var a;
      Fr && gi && (e.f & se) !== 0 && e.deps;
    } finally {
      Je = n, x = r;
    }
  }
}
function E(e) {
  var t = e.f, r = (t & G) !== 0;
  if (C !== null && !ue) {
    var n = x !== null && (x.f & Be) !== 0;
    if (!n && !(H != null && H.includes(e))) {
      var i = C.deps;
      if ((C.f & Bt) !== 0)
        e.rv < ht && (e.rv = ht, q === null && i !== null && i[V] === e ? V++ : q === null ? q = [e] : (!Te || !q.includes(e)) && q.push(e));
      else {
        (C.deps ?? (C.deps = [])).push(e);
        var a = e.reactions;
        a === null ? e.reactions = [C] : a.includes(C) || a.push(C);
      }
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var s = (
      /** @type {Derived} */
      e
    ), o = s.parent;
    o !== null && (o.f & ee) === 0 && (s.f ^= ee);
  }
  if (We) {
    if (De.has(e))
      return De.get(e);
    if (r) {
      s = /** @type {Derived} */
      e;
      var l = s.v;
      return ((s.f & L) === 0 && s.reactions !== null || En(s)) && (l = gr(s)), De.set(s, l), l;
    }
  } else if (r) {
    if (s = /** @type {Derived} */
    e, Ce != null && Ce.has(s))
      return Ce.get(s);
    Ut(s) && Zr(s);
  }
  if ((e.f & Le) !== 0)
    throw e.v;
  return e.v;
}
function En(e) {
  if (e.v === M) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (De.has(t) || (t.f & G) !== 0 && En(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function yr(e) {
  var t = ue;
  try {
    return ue = !0, e();
  } finally {
    ue = t;
  }
}
const qi = -7169;
function X(e, t) {
  e.f = e.f & qi | t;
}
function xn(e) {
  var t = C, r = x;
  re(null), ce(null);
  try {
    return e();
  } finally {
    re(t), ce(r);
  }
}
const kn = /* @__PURE__ */ new Set(), Qt = /* @__PURE__ */ new Set();
function Hi(e) {
  for (var t = 0; t < e.length; t++)
    kn.add(e[t]);
  for (var r of Qt)
    r(e);
}
function $t(e) {
  var $;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = (($ = e.composedPath) == null ? void 0 : $.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  ), s = 0, o = e.__root;
  if (o) {
    var l = i.indexOf(o);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    l <= f && (s = l);
  }
  if (a = /** @type {Element} */
  i[s] || e.target, a !== t) {
    rt(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var u = C, _ = x;
    re(null), ce(null);
    try {
      for (var c, d = []; a !== null; ) {
        var h = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var v = a["__" + n];
          if (v != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a))
            if (lr(v)) {
              var [p, ...g] = v;
              p.apply(a, [e, ...g]);
            } else
              v.call(a, e);
        } catch (w) {
          c ? d.push(w) : c = w;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        a = h;
      }
      if (c) {
        for (let w of d)
          queueMicrotask(() => {
            throw w;
          });
        throw c;
      }
    } finally {
      e.__root = t, delete e.currentTarget, re(u), ce(_);
    }
  }
}
function Ui(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function qe(e, t) {
  var r = (
    /** @type {Effect} */
    x
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function ze(e, t) {
  var r = (t & Bn) !== 0, n = (t & Wn) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (k)
      return qe(A, null), A;
    i === void 0 && (i = Ui(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ Se(i)));
    var s = (
      /** @type {TemplateNode} */
      n || an ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Se(s)
      ), l = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      qe(o, l);
    } else
      qe(s, s);
    return s;
  };
}
function ji() {
  if (k)
    return qe(A, null), A;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = pe();
  return e.append(t, r), qe(t, r), e;
}
function ve(e, t) {
  if (k) {
    x.nodes_end = A, nt();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Yi = ["touchstart", "touchmove"];
function Vi(e) {
  return Yi.includes(e);
}
const Bi = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Wi(e) {
  return Bi.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let Ot = !0;
function Rr(e) {
  Ot = e;
}
function zi(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Cn(e, t) {
  return Tn(e, t);
}
function Xi(e, t) {
  Jt(), t.intro = t.intro ?? !1;
  const r = t.target, n = k, i = A;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Se(r)
    ); a && (a.nodeType !== ct || /** @type {Comment} */
    a.data !== Dr); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ Ae(a);
    if (!a)
      throw Ge;
    W(!0), z(
      /** @type {Comment} */
      a
    ), nt();
    const s = Tn(e, { ...t, anchor: a });
    if (A === null || A.nodeType !== ct || /** @type {Comment} */
    A.data !== or)
      throw Lt(), Ge;
    return W(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Ge)
      return t.recover === !1 && di(), Jt(), ln(r), W(!1), Cn(e, t);
    throw s;
  } finally {
    W(n), z(i);
  }
}
const Xe = /* @__PURE__ */ new Map();
function Tn(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  Jt();
  var o = /* @__PURE__ */ new Set(), l = (_) => {
    for (var c = 0; c < _.length; c++) {
      var d = _[c];
      if (!o.has(d)) {
        o.add(d);
        var h = Vi(d);
        t.addEventListener(d, $t, { passive: h });
        var v = Xe.get(d);
        v === void 0 ? (document.addEventListener(d, $t, { passive: h }), Xe.set(d, 1)) : Xe.set(d, v + 1);
      }
    }
  };
  l(fr(kn)), Qt.add(l);
  var f = void 0, u = Mi(() => {
    var _ = r ?? t.appendChild(pe());
    return Ue(() => {
      if (a) {
        vr({});
        var c = (
          /** @type {ComponentContext} */
          te
        );
        c.c = a;
      }
      i && (n.$$events = i), k && qe(
        /** @type {TemplateNode} */
        _,
        null
      ), Ot = s, f = e(_, n) || {}, Ot = !0, k && (x.nodes_end = A), a && hr();
    }), () => {
      var h;
      for (var c of o) {
        t.removeEventListener(c, $t);
        var d = (
          /** @type {number} */
          Xe.get(c)
        );
        --d === 0 ? (document.removeEventListener(c, $t), Xe.delete(c)) : Xe.set(c, d);
      }
      Qt.delete(l), _ !== r && ((h = _.parentNode) == null || h.removeChild(_));
    };
  });
  return er.set(f, u), f;
}
let er = /* @__PURE__ */ new WeakMap();
function Gi(e, t) {
  const r = er.get(e);
  return r ? (er.delete(e), r(t)) : Promise.resolve();
}
function Sn(e) {
  te === null && si(), Zt(() => {
    const t = yr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function ft(e, t, r = !1) {
  k && nt();
  var n = e, i = null, a = null, s = M, o = r ? gt : 0, l = !1;
  const f = (d, h = !0) => {
    l = !0, c(h, d);
  };
  var u = null;
  function _() {
    u !== null && (u.lastChild.remove(), n.before(u), u = null);
    var d = s ? i : a, h = s ? a : i;
    d && Ht(d), h && qt(h, () => {
      s ? a = null : i = null;
    });
  }
  const c = (d, h) => {
    if (s === (s = d)) return;
    let v = !1;
    if (k) {
      const b = Br(n) === sr;
      !!s === b && (n = Wt(), z(n), W(!1), v = !0);
    }
    var p = fn(), g = n;
    if (p && (u = document.createDocumentFragment(), u.append(g = pe())), s ? i ?? (i = h && Ue(() => h(g))) : a ?? (a = h && Ue(() => h(g))), p) {
      var $ = (
        /** @type {Batch} */
        O
      ), w = s ? i : a, T = s ? a : i;
      w && $.skipped_effects.delete(w), T && $.skipped_effects.add(T), $.add_callback(_);
    } else
      _();
    v && W(!0);
  };
  wr(() => {
    l = !1, t(f), l || c(null, null);
  }, o), k && (n = A);
}
function Ki(e, t, r) {
  for (var n = e.items, i = [], a = t.length, s = 0; s < a; s++)
    $r(t[s].e, i, !0);
  var o = a > 0 && i.length === 0 && r !== null;
  if (o) {
    var l = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    ln(l), l.append(
      /** @type {Element} */
      r
    ), n.clear(), fe(e, t[0].prev, t[a - 1].next);
  }
  pn(i, () => {
    for (var f = 0; f < a; f++) {
      var u = t[f];
      o || (n.delete(u.k), fe(e, u.prev, u.next)), oe(u.e, !o);
    }
  });
}
function Ji(e, t, r, n, i, a = null) {
  var s = e, o = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var l = (
      /** @type {Element} */
      e
    );
    s = k ? z(
      /** @type {Comment | Text} */
      /* @__PURE__ */ Se(l)
    ) : l.appendChild(pe());
  }
  k && nt();
  var f = null, u = !1, _ = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ xi(() => {
    var p = r();
    return lr(p) ? p : p == null ? [] : fr(p);
  }), d, h;
  function v() {
    Zi(
      h,
      d,
      o,
      _,
      s,
      i,
      t,
      n,
      r
    ), a !== null && (d.length === 0 ? f ? Ht(f) : f = Ue(() => a(s)) : f !== null && qt(f, () => {
      f = null;
    }));
  }
  wr(() => {
    h ?? (h = /** @type {Effect} */
    x), d = E(c);
    var p = d.length;
    if (u && p === 0)
      return;
    u = p === 0;
    let g = !1;
    if (k) {
      var $ = Br(s) === sr;
      $ !== (p === 0) && (s = Wt(), z(s), W(!1), g = !0);
    }
    if (k) {
      for (var w = null, T, b = 0; b < p; b++) {
        if (A.nodeType === ct && /** @type {Comment} */
        A.data === or) {
          s = /** @type {Comment} */
          A, g = !0, W(!1);
          break;
        }
        var D = d[b], F = n(D, b);
        T = tr(
          A,
          o,
          w,
          null,
          D,
          F,
          b,
          i,
          t,
          r
        ), o.items.set(F, T), w = T;
      }
      p > 0 && z(Wt());
    }
    if (k)
      p === 0 && a && (f = Ue(() => a(s)));
    else if (fn()) {
      var K = /* @__PURE__ */ new Set(), R = (
        /** @type {Batch} */
        O
      );
      for (b = 0; b < p; b += 1) {
        D = d[b], F = n(D, b);
        var Ne = o.items.get(F) ?? _.get(F);
        Ne || (T = tr(
          null,
          o,
          null,
          null,
          D,
          F,
          b,
          i,
          t,
          r,
          !0
        ), _.set(F, T)), K.add(F);
      }
      for (const [we, m] of o.items)
        K.has(we) || R.skipped_effects.add(m.e);
      R.add_callback(v);
    } else
      v();
    g && W(!0), E(c);
  }), k && (s = A);
}
function Zi(e, t, r, n, i, a, s, o, l) {
  var f = t.length, u = r.items, _ = r.first, c = _, d, h = null, v = [], p = [], g, $, w, T;
  for (T = 0; T < f; T += 1) {
    if (g = t[T], $ = o(g, T), w = u.get($), w === void 0) {
      var b = n.get($);
      if (b !== void 0) {
        n.delete($), u.set($, b);
        var D = h ? h.next : c;
        fe(r, h, b), fe(r, b, D), Vt(b, D, i), h = b;
      } else {
        var F = c ? (
          /** @type {TemplateNode} */
          c.e.nodes_start
        ) : i;
        h = tr(
          F,
          r,
          h,
          h === null ? r.first : h.next,
          g,
          $,
          T,
          a,
          s,
          l
        );
      }
      u.set($, h), v = [], p = [], c = h.next;
      continue;
    }
    if ((w.e.f & ae) !== 0 && Ht(w.e), w !== c) {
      if (d !== void 0 && d.has(w)) {
        if (v.length < p.length) {
          var K = p[0], R;
          h = K.prev;
          var Ne = v[0], we = v[v.length - 1];
          for (R = 0; R < v.length; R += 1)
            Vt(v[R], K, i);
          for (R = 0; R < p.length; R += 1)
            d.delete(p[R]);
          fe(r, Ne.prev, we.next), fe(r, h, Ne), fe(r, we, K), c = K, h = we, T -= 1, v = [], p = [];
        } else
          d.delete(w), Vt(w, c, i), fe(r, w.prev, w.next), fe(r, w, h === null ? r.first : h.next), fe(r, h, w), h = w;
        continue;
      }
      for (v = [], p = []; c !== null && c.k !== $; )
        (c.e.f & ae) === 0 && (d ?? (d = /* @__PURE__ */ new Set())).add(c), p.push(c), c = c.next;
      if (c === null)
        continue;
      w = c;
    }
    v.push(w), h = w, c = w.next;
  }
  if (c !== null || d !== void 0) {
    for (var m = d === void 0 ? [] : fr(d); c !== null; )
      (c.e.f & ae) === 0 && m.push(c), c = c.next;
    var S = m.length;
    if (S > 0) {
      var N = f === 0 ? i : null;
      Ki(r, m, N);
    }
  }
  e.first = r.first && r.first.e, e.last = h && h.e;
  for (var ne of n.values())
    oe(ne.e);
  n.clear();
}
function tr(e, t, r, n, i, a, s, o, l, f, u) {
  var _ = (l & Un) !== 0, c = (l & Yn) === 0, d = _ ? c ? /* @__PURE__ */ nn(i, !1, !1) : vt(i) : i, h = (l & jn) === 0 ? s : vt(s), v = {
    i: h,
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
      p.append(e = pe());
    }
    return v.e = Ue(() => o(
      /** @type {Node} */
      e,
      d,
      h,
      f
    ), k), v.e.prev = r && r.e, v.e.next = n && n.e, r === null ? u || (t.first = v) : (r.next = v, r.e.next = v.e), n !== null && (n.prev = v, n.e.prev = v.e), v;
  } finally {
  }
}
function Vt(e, t, r) {
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
      /* @__PURE__ */ Ae(a)
    );
    i.before(a), a = s;
  }
}
function fe(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function Qi(e, t, r, n, i, a) {
  let s = k;
  k && nt();
  var o, l, f = null;
  k && A.nodeType === ii && (f = /** @type {Element} */
  A, nt());
  var u = (
    /** @type {TemplateNode} */
    k ? A : e
  ), _;
  wr(() => {
    const c = t() || null;
    var d = c === "svg" ? Xn : null;
    c !== o && (_ && (c === null ? qt(_, () => {
      _ = null, l = null;
    }) : c === l ? Ht(_) : (oe(_), Rr(!1))), c && c !== l && (_ = Ue(() => {
      if (f = k ? (
        /** @type {Element} */
        f
      ) : d ? document.createElementNS(d, c) : document.createElement(c), qe(f, f), n) {
        k && Wi(c) && f.append(document.createComment(""));
        var h = (
          /** @type {TemplateNode} */
          k ? /* @__PURE__ */ Se(f) : f.appendChild(pe())
        );
        k && (h === null ? W(!1) : z(h)), n(f, h);
      }
      x.nodes_end = f, u.before(f);
    })), o = c, o && (l = o), Rr(!0));
  }, gt), s && (W(!0), z(u));
}
function An(e, t) {
  pr(() => {
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
function ea(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function ta(e, t) {
  return e == null ? null : String(e);
}
function Re(e, t, r, n, i, a) {
  var s = e.__className;
  if (k || s !== r || s === void 0) {
    var o = ea(r, n);
    (!k || o !== e.getAttribute("class")) && (o == null ? e.removeAttribute("class") : e.className = o), e.__className = r;
  }
  return a;
}
function be(e, t, r, n) {
  var i = e.__style;
  if (k || i !== t) {
    var a = ta(t);
    (!k || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const ra = Symbol("is custom element"), na = Symbol("is html");
function Nn(e, t, r, n) {
  var i = ia(e);
  k && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[ni] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && On(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Mr(e, t, r) {
  var n = C, i = x;
  let a = k;
  k && W(!1), re(null), ce(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (rr.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? On(e).includes(t) : r && typeof r == "object") ? e[t] = r : Nn(e, t, r == null ? r : String(r));
  } finally {
    re(n), ce(i), a && W(!0);
  }
}
function ia(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ra]: e.nodeName.includes("-"),
      [na]: e.namespaceURI === zn
    })
  );
}
var rr = /* @__PURE__ */ new Map();
function On(e) {
  var t = rr.get(e.nodeName);
  if (t) return t;
  rr.set(e.nodeName, t = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = Kn(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = qr(n);
  }
  return t;
}
const aa = () => performance.now(), _e = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => aa(),
  tasks: /* @__PURE__ */ new Set()
};
function Rn() {
  const e = _e.now();
  _e.tasks.forEach((t) => {
    t.c(e) || (_e.tasks.delete(t), t.f());
  }), _e.tasks.size !== 0 && _e.tick(Rn);
}
function sa(e) {
  let t;
  return _e.tasks.size === 0 && _e.tick(Rn), {
    promise: new Promise((r) => {
      _e.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      _e.tasks.delete(t);
    }
  };
}
function yt(e, t) {
  xn(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function oa(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Pr(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = oa(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const la = (e) => e;
function Mn(e, t, r, n) {
  var i = (e & Vn) !== 0, a = "both", s, o = t.inert, l = t.style.overflow, f, u;
  function _() {
    return xn(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var c = {
    is_global: i,
    in() {
      t.inert = o, yt(t, "introstart"), f = nr(t, _(), u, 1, () => {
        yt(t, "introend"), f == null || f.abort(), f = s = void 0, t.style.overflow = l;
      });
    },
    out(p) {
      t.inert = !0, yt(t, "outrostart"), u = nr(t, _(), f, 0, () => {
        yt(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      f == null || f.abort(), u == null || u.abort();
    }
  }, d = (
    /** @type {Effect} */
    x
  );
  if ((d.transitions ?? (d.transitions = [])).push(c), Ot) {
    var h = i;
    if (!h) {
      for (var v = (
        /** @type {Effect | null} */
        d.parent
      ); v && (v.f & gt) !== 0; )
        for (; (v = v.parent) && (v.f & at) === 0; )
          ;
      h = !v || (v.f & Pt) !== 0;
    }
    h && cn(() => {
      yr(() => c.in());
    });
  }
}
function nr(e, t, r, n, i) {
  var a = n === 1;
  if (Qn(t)) {
    var s, o = !1;
    return pr(() => {
      if (!o) {
        var p = t({ direction: a ? "in" : "out" });
        s = nr(e, p, r, n, i);
      }
    }), {
      abort: () => {
        o = !0, s == null || s.abort();
      },
      deactivate: () => s.deactivate(),
      reset: () => s.reset(),
      t: () => s.t()
    };
  }
  if (r == null || r.deactivate(), !(t != null && t.duration))
    return i(), {
      abort: st,
      deactivate: st,
      reset: st,
      t: () => n
    };
  const { delay: l = 0, css: f, tick: u, easing: _ = la } = t;
  var c = [];
  if (a && r === void 0 && (u && u(0, 1), f)) {
    var d = Pr(f(0, 1));
    c.push(d, d);
  }
  var h = () => 1 - n, v = e.animate(c, { duration: l, fill: "forwards" });
  return v.onfinish = () => {
    v.cancel();
    var p = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var g = n - p, $ = (
      /** @type {number} */
      t.duration * Math.abs(g)
    ), w = [];
    if ($ > 0) {
      var T = !1;
      if (f)
        for (var b = Math.ceil($ / 16.666666666666668), D = 0; D <= b; D += 1) {
          var F = p + g * _(D / b), K = Pr(f(F, 1 - F));
          w.push(K), T || (T = K.overflow === "hidden");
        }
      T && (e.style.overflow = "hidden"), h = () => {
        var R = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          v.currentTime
        );
        return p + g * _(R / $);
      }, u && sa(() => {
        if (v.playState !== "running") return !1;
        var R = h();
        return u(R, 1 - R), !0;
      });
    }
    v = e.animate(w, { duration: $, fill: "forwards" }), v.onfinish = () => {
      h = () => n, u == null || u(n, 1 - n), i();
    };
  }, {
    abort: () => {
      v && (v.cancel(), v.effect = null, v.onfinish = st);
    },
    deactivate: () => {
      i = st;
    },
    reset: () => {
      n === 0 && (u == null || u(1, 0));
    },
    t: () => h()
  };
}
function Ir(e, t) {
  return e === t || (e == null ? void 0 : e[bt]) === t;
}
function fa(e = {}, t, r, n) {
  return cn(() => {
    var i, a;
    return dn(() => {
      i = a, a = [], yr(() => {
        e !== r(...a) && (t(e, ...a), i && Ir(r(...i), e) && t(null, ...i));
      });
    }), () => {
      pr(() => {
        a && Ir(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function Ee(e, t, r, n) {
  var i = (
    /** @type {V} */
    n
  ), a = !0, s = () => (a && (a = !1, i = /** @type {V} */
  n), i), o;
  o = /** @type {V} */
  e[t], o === void 0 && n !== void 0 && (o = s());
  var l;
  l = () => {
    var c = (
      /** @type {V} */
      e[t]
    );
    return c === void 0 ? s() : (a = !0, c);
  };
  var f = !1, u = /* @__PURE__ */ Dt(() => (f = !1, l())), _ = (
    /** @type {Effect} */
    x
  );
  return function(c, d) {
    if (arguments.length > 0) {
      const h = d ? E(u) : c;
      return P(u, h), f = !0, i !== void 0 && (i = h), c;
    }
    return We && f || (_.f & Be) !== 0 ? u.v : E(u);
  };
}
function ua(e) {
  return new ca(e);
}
var he, Q;
class ca {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    j(this, he);
    /** @type {Record<string, any>} */
    j(this, Q);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, o) => {
      var l = /* @__PURE__ */ nn(o, !1, !1);
      return r.set(s, l), l;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, o) {
          return E(r.get(o) ?? n(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === ri ? !0 : (E(r.get(o) ?? n(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, l) {
          return P(r.get(o) ?? n(o, l), l), Reflect.set(s, o, l);
        }
      }
    );
    Y(this, Q, (t.hydrate ? Xi : Cn)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && de(), Y(this, he, i.$$events);
    for (const s of Object.keys(y(this, Q)))
      s === "$set" || s === "$destroy" || s === "$on" || rt(this, s, {
        get() {
          return y(this, Q)[s];
        },
        /** @param {any} value */
        set(o) {
          y(this, Q)[s] = o;
        },
        enumerable: !0
      });
    y(this, Q).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, y(this, Q).$destroy = () => {
      Gi(y(this, Q));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    y(this, Q).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    y(this, he)[t] = y(this, he)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return y(this, he)[t].push(n), () => {
      y(this, he)[t] = y(this, he)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    y(this, Q).$destroy();
  }
}
he = new WeakMap(), Q = new WeakMap();
let Pn;
typeof HTMLElement == "function" && (Pn = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    I(this, "$$ctor");
    /** Slots */
    I(this, "$$s");
    /** @type {any} The Svelte component instance */
    I(this, "$$c");
    /** Whether or not the custom element is connected */
    I(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    I(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    I(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    I(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    I(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    I(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    I(this, "$$me");
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
          i !== "default" && (s.name = i), ve(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = da(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = kt(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = ua({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Ri(() => {
        dn(() => {
          var i;
          this.$$r = !0;
          for (const a of Ct(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = kt(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = kt(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
    return Ct(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function kt(e, t, r, n) {
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
function da(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function In(e, t, r, n, i, a) {
  let s = class extends Pn {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Ct(t).map(
        (o) => (t[o].attribute || o).toLowerCase()
      );
    }
  };
  return Ct(t).forEach((o) => {
    rt(s.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var _;
        l = kt(o, l, t), this.$$d[o] = l;
        var f = this.$$c;
        if (f) {
          var u = (_ = Ke(f, o)) == null ? void 0 : _.get;
          u ? f[o] = l : f.$set({ [o]: l });
        }
      }
    });
  }), n.forEach((o) => {
    rt(s.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let Rt = /* @__PURE__ */ B(void 0);
const va = async () => (P(Rt, await window.loadCardHelpers().then((e) => e), !0), E(Rt)), ha = () => E(Rt) ? E(Rt) : va();
function _a(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Ln(e, { delay: t = 0, duration: r = 400, easing: n = _a, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, o = i === "y" ? "height" : "width", l = parseFloat(a[o]), f = i === "y" ? ["top", "bottom"] : ["left", "right"], u = f.map(
    (g) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${g[0].toUpperCase()}${g.slice(1)}`
    )
  ), _ = parseFloat(a[`padding${u[0]}`]), c = parseFloat(a[`padding${u[1]}`]), d = parseFloat(a[`margin${u[0]}`]), h = parseFloat(a[`margin${u[1]}`]), v = parseFloat(
    a[`border${u[0]}Width`]
  ), p = parseFloat(
    a[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (g) => `overflow: hidden;opacity: ${Math.min(g * 20, 1) * s};${o}: ${g * l}px;padding-${f[0]}: ${g * _}px;padding-${f[1]}: ${g * c}px;margin-${f[0]}: ${g * d}px;margin-${f[1]}: ${g * h}px;border-${f[0]}-width: ${g * v}px;border-${f[1]}-width: ${g * p}px;min-${o}: 0`
  };
}
function Dn(e) {
  const t = e - 1;
  return t * t * t + 1;
}
var pa = /* @__PURE__ */ ze('<span class="loading svelte-1v98vwq">Loading...</span>'), ga = /* @__PURE__ */ ze('<div class="outer-container"><!> <!></div>');
const ma = {
  hash: "svelte-1v98vwq",
  code: ".loading.svelte-1v98vwq {padding:1em;display:block;}"
};
function ir(e, t) {
  vr(t, !0), An(e, ma);
  const r = Ee(t, "type", 7, "div"), n = Ee(t, "config"), i = Ee(t, "hass"), a = Ee(t, "marginTop", 7, "0px"), s = Ee(t, "open"), o = Ee(t, "clearCardCss", 7, !1);
  let l = /* @__PURE__ */ B(void 0), f = /* @__PURE__ */ B(!0);
  Zt(() => {
    E(l) && (E(l).hass = i());
  }), Zt(() => {
    var g, $;
    const p = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    ($ = (g = E(l)) == null ? void 0 : g.setConfig) == null || $.call(g, p);
  }), Sn(async () => {
    const v = await ha(), g = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, $ = v.createCardElement(g);
    $.hass = i(), E(l) && (o() && new MutationObserver(() => {
      u($);
    }).observe($, { childList: !0, subtree: !0 }), E(l).replaceWith($), P(l, $, !0), P(f, !1));
  });
  function u(v, p = 5) {
    let g = 0;
    const $ = () => {
      const w = [];
      function T(b) {
        if (b instanceof Element && b.tagName.toLowerCase() === "ha-card") {
          w.push(b);
          return;
        }
        b.shadowRoot && T(b.shadowRoot), (b instanceof ShadowRoot || b instanceof Element ? Array.from(b.children) : []).forEach(T);
      }
      T(v), w.length > 0 ? w.forEach((b) => {
        b.style.setProperty("border", "none", "important"), b.style.setProperty("background", "transparent", "important"), b.style.setProperty("box-shadow", "none", "important");
      }) : (g++, g < p && requestAnimationFrame($));
    };
    $();
  }
  var _ = ga(), c = Me(_);
  Qi(c, r, !1, (v, p) => {
    fa(v, (g) => P(l, g, !0), () => E(l)), Mn(3, v, () => Ln, () => ({ duration: 500, easing: Dn }));
  });
  var d = xt(c, 2);
  {
    var h = (v) => {
      var p = pa();
      ve(v, p);
    };
    ft(d, (v) => {
      E(f) && v(h);
    });
  }
  return $e(_), ye(() => be(_, `margin-top: ${(s() ? a() : "0px") ?? ""};`)), ve(e, _), hr({
    get type() {
      return r();
    },
    set type(v = "div") {
      r(v), de();
    },
    get config() {
      return n();
    },
    set config(v) {
      n(v), de();
    },
    get hass() {
      return i();
    },
    set hass(v) {
      i(v), de();
    },
    get marginTop() {
      return a();
    },
    set marginTop(v = "0px") {
      a(v), de();
    },
    get open() {
      return s();
    },
    set open(v) {
      s(v), de();
    },
    get clearCardCss() {
      return o();
    },
    set clearCardCss(v = !1) {
      o(v), de();
    }
  });
}
customElements.define("expander-sub-card", In(
  ir,
  {
    type: {},
    config: {},
    hass: {},
    marginTop: {},
    open: {},
    clearCardCss: {}
  },
  [],
  [],
  !0
));
const ar = {
  gap: "0.0em",
  "expanded-gap": "0.6em",
  padding: "1em",
  clear: !1,
  "clear-children": !1,
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
  icon: "mdi:chevron-down",
  "icon-rotate-degree": "180deg"
};
var wa = /* @__PURE__ */ ze('<button aria-label="Toggle button"><ha-icon></ha-icon></button>', 2), $a = /* @__PURE__ */ ze('<div id="id1"><div id="id2" class="title-card-container svelte-oxkseo"><!></div> <!></div>'), ya = /* @__PURE__ */ ze("<button><div> </div> <ha-icon></ha-icon></button>", 2), ba = /* @__PURE__ */ ze('<div class="children-container svelte-oxkseo"></div>'), Ea = /* @__PURE__ */ ze("<ha-card><!> <!></ha-card>", 2);
const xa = {
  hash: "svelte-oxkseo",
  code: ".expander-card.svelte-oxkseo {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-oxkseo {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);transition:all 0.3s ease-in-out;}.clear.svelte-oxkseo {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-oxkseo {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-oxkseo {display:block;}.title-card-container.svelte-oxkseo {width:100%;padding:var(--title-padding);}.header.svelte-oxkseo {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-oxkseo {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-oxkseo {width:100%;text-align:left;}.ico.svelte-oxkseo {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-oxkseo {transform:rotate(var(--icon-rotate-degree,180deg));}.ripple.svelte-oxkseo {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-oxkseo:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-oxkseo:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function ka(e, t) {
  var Ne, we;
  vr(t, !0), An(e, xa);
  const r = Ee(t, "hass"), n = Ee(t, "config", 7, ar);
  let i = /* @__PURE__ */ B(!1), a = /* @__PURE__ */ B(!1);
  const s = n()["storgage-id"], o = "expander-open-" + s, l = n()["show-button-users"] === void 0 || ((we = n()["show-button-users"]) == null ? void 0 : we.includes((Ne = r()) == null ? void 0 : Ne.user.name));
  function f() {
    u(!E(a));
  }
  function u(m) {
    if (P(a, m, !0), s !== void 0)
      try {
        localStorage.setItem(o, E(a) ? "true" : "false");
      } catch (S) {
        console.error(S);
      }
  }
  Sn(() => {
    var ne, le;
    const m = n()["min-width-expanded"], S = n()["max-width-expanded"], N = document.body.offsetWidth;
    if (m && S ? n().expanded = N >= m && N <= S : m ? n().expanded = N >= m : S && (n().expanded = N <= S), (le = n()["start-expanded-users"]) != null && le.includes((ne = r()) == null ? void 0 : ne.user.name))
      u(!0);
    else if (s !== void 0)
      try {
        const U = localStorage.getItem(o);
        U === null ? n().expanded !== void 0 && u(n().expanded) : P(a, U ? U === "true" : E(a), !0);
      } catch (U) {
        console.error(U);
      }
    else
      n().expanded !== void 0 && u(n().expanded);
  });
  const _ = (m) => {
    if (E(i))
      return m.preventDefault(), m.stopImmediatePropagation(), P(i, !1), !1;
    f();
  }, c = (m) => {
    const S = m.currentTarget;
    S != null && S.classList.contains("title-card-container") && _(m);
  };
  let d, h = !1, v = 0, p = 0;
  const g = (m) => {
    d = m.target, v = m.touches[0].clientX, p = m.touches[0].clientY, h = !1;
  }, $ = (m) => {
    const S = m.touches[0].clientX, N = m.touches[0].clientY;
    (Math.abs(S - v) > 10 || Math.abs(N - p) > 10) && (h = !0);
  }, w = (m) => {
    !h && d === m.target && n()["title-card-clickable"] && f(), d = void 0, P(i, !0);
  };
  var T = Ea(), b = Me(T);
  {
    var D = (m) => {
      var S = $a(), N = Me(S);
      N.__touchstart = g, N.__touchmove = $, N.__touchend = w, N.__click = function(...J) {
        var ie;
        (ie = n()["title-card-clickable"] ? c : null) == null || ie.apply(this, J);
      };
      var ne = Me(N);
      {
        let J = /* @__PURE__ */ kr(() => n()["clear-children"] || !1);
        ir(ne, {
          get hass() {
            return r();
          },
          get config() {
            return n()["title-card"];
          },
          get type() {
            return n()["title-card"].type;
          },
          open: !0,
          get clearCardCss() {
            return E(J);
          }
        });
      }
      $e(N);
      var le = xt(N, 2);
      {
        var U = (J) => {
          var ie = wa();
          ie.__click = _;
          var Oe = Me(ie);
          ye(() => Mr(Oe, "icon", n().icon)), $e(ie), ye(() => {
            be(ie, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Re(ie, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), be(Oe, `--arrow-color:${n()["arrow-color"] ?? ""}`), Re(Oe, 1, `ico${E(a) ? " flipped open" : "close"}`, "svelte-oxkseo");
          }), ve(J, ie);
        };
        ft(le, (J) => {
          l && J(U);
        });
      }
      $e(S), ye(() => {
        Re(S, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-oxkseo"), be(N, `--title-padding:${n()["title-card-padding"] ?? ""}`), Nn(N, "role", n()["title-card-clickable"] ? "button" : void 0);
      }), ve(m, S);
    }, F = (m) => {
      var S = ji(), N = Ai(S);
      {
        var ne = (le) => {
          var U = ya();
          U.__click = _;
          var J = Me(U), ie = Me(J, !0);
          $e(J);
          var Oe = xt(J, 2);
          ye(() => Mr(Oe, "icon", n().icon)), $e(U), ye(() => {
            Re(U, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), be(U, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Re(J, 1, `primary title${E(a) ? " open" : " close"}`, "svelte-oxkseo"), zi(ie, n().title), be(Oe, `--arrow-color:${n()["arrow-color"] ?? ""}`), Re(Oe, 1, `ico${E(a) ? " flipped open" : " close"}`, "svelte-oxkseo");
          }), ve(le, U);
        };
        ft(N, (le) => {
          l && le(ne);
        });
      }
      ve(m, S);
    };
    ft(b, (m) => {
      n()["title-card"] ? m(D) : m(F, !1);
    });
  }
  var K = xt(b, 2);
  {
    var R = (m) => {
      var S = ba();
      Ji(S, 20, () => n().cards, (N) => N, (N, ne) => {
        {
          let le = /* @__PURE__ */ kr(() => n()["clear-children"] || !1);
          ir(N, {
            get hass() {
              return r();
            },
            get config() {
              return ne;
            },
            get type() {
              return ne.type;
            },
            get marginTop() {
              return n()["child-margin-top"];
            },
            get open() {
              return E(a);
            },
            get clearCardCss() {
              return E(le);
            }
          });
        }
      }), $e(S), ye(() => be(S, `--expander-card-display:${n()["expander-card-display"] ?? ""};
             --gap:${(E(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${(E(a) ? n()["child-padding"] : "0px") ?? ""};`)), Mn(3, S, () => Ln, () => ({ duration: 500, easing: Dn })), ve(m, S);
    };
    ft(K, (m) => {
      n().cards && m(R);
    });
  }
  return $e(T), ye(() => {
    Re(T, 1, `expander-card${n().clear ? " clear" : ""}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), be(T, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(E(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${E(a) ?? ""};
     --icon-rotate-degree:${n()["icon-rotate-degree"] ?? ""};
     --card-background:${(E(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}
    `);
  }), ve(e, T), hr({
    get hass() {
      return r();
    },
    set hass(m) {
      r(m), de();
    },
    get config() {
      return n();
    },
    set config(m = ar) {
      n(m), de();
    }
  });
}
Hi(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", In(ka, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    I(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...ar, ...r };
  }
}));
const Ca = "2.6.1";
console.info(
  `%c  Expander-Card 
%c Version ${Ca}`,
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
  ka as default
};
//# sourceMappingURL=expander-card.js.map
