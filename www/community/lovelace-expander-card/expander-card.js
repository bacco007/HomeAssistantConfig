var Mn = Object.defineProperty;
var $r = (e) => {
  throw TypeError(e);
};
var In = (e, t, r) => t in e ? Mn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var F = (e, t, r) => In(e, typeof t != "symbol" ? t + "" : t, r), qt = (e, t, r) => t.has(e) || $r("Cannot " + r);
var g = (e, t, r) => (qt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), L = (e, t, r) => t.has(e) ? $r("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), H = (e, t, r, n) => (qt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), ot = (e, t, r) => (qt(e, t, "access private method"), r);
const Pn = "5";
var Ir;
typeof window < "u" && ((Ir = window.__svelte ?? (window.__svelte = {})).v ?? (Ir.v = /* @__PURE__ */ new Set())).add(Pn);
const Dn = 1, Fn = 2, Ln = 16, qn = 4, Un = 1, jn = 2, Pr = "[", nr = "[!", ir = "]", Je = {}, R = Symbol(), Yn = "http://www.w3.org/1999/xhtml", Hn = "http://www.w3.org/2000/svg", Dr = !1;
var ar = Array.isArray, Vn = Array.prototype.indexOf, sr = Array.from, Tt = Object.keys, nt = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, Bn = Object.getOwnPropertyDescriptors, Wn = Object.prototype, Xn = Array.prototype, Fr = Object.getPrototypeOf, br = Object.isExtensible;
function Gn(e) {
  return typeof e == "function";
}
const lt = () => {
};
function Lr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function zn() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const J = 2, or = 4, qr = 8, st = 16, ge = 32, Ve = 64, Ur = 128, G = 256, Ct = 512, M = 1024, z = 2048, Be = 4096, ae = 8192, We = 16384, Mt = 32768, wt = 65536, Er = 1 << 17, Kn = 1 << 18, lr = 1 << 19, jr = 1 << 20, Yt = 1 << 21, fr = 1 << 22, qe = 1 << 23, Et = Symbol("$state"), Jn = Symbol("legacy props"), Zn = Symbol(""), ur = new class extends Error {
  constructor() {
    super(...arguments);
    F(this, "name", "StaleReactionError");
    F(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), Qn = 1, Yr = 3, dt = 8;
function ei() {
  throw new Error("https://svelte.dev/e/await_outside_boundary");
}
function ti(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ri() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ni(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ii() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ai(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function si() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function oi() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function li() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function fi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ui() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function It(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let $ = !1;
function X(e) {
  $ = e;
}
let C;
function K(e) {
  if (e === null)
    throw It(), Je;
  return C = e;
}
function it() {
  return K(
    /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(C)
  );
}
function $e(e) {
  if ($) {
    if (/* @__PURE__ */ Oe(C) !== null)
      throw It(), Je;
    C = e;
  }
}
function Ht() {
  for (var e = 0, t = C; ; ) {
    if (t.nodeType === dt) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === ir) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Pr || r === nr) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Oe(t)
    );
    t.remove(), t = n;
  }
}
function Hr(e) {
  if (!e || e.nodeType !== dt)
    throw It(), Je;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Vr(e) {
  return e === this.v;
}
function ci(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Br(e) {
  return !ci(e, this.v);
}
let di = !1, te = null;
function St(e) {
  te = e;
}
function cr(e, t = !1, r) {
  te = {
    p: te,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function dr(e) {
  var t = (
    /** @type {ComponentContext} */
    te
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      ln(n);
  }
  return e !== void 0 && (t.x = e), te = t.p, e ?? /** @type {T} */
  {};
}
function Wr() {
  return !0;
}
const vi = /* @__PURE__ */ new WeakMap();
function hi(e) {
  var t = w;
  if (t === null)
    return E.f |= qe, e;
  if ((t.f & Mt) === 0) {
    if ((t.f & Ur) === 0)
      throw !t.parent && e instanceof Error && Xr(e), e;
    t.b.error(e);
  } else
    vr(e, t);
}
function vr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ur) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    t = t.parent;
  }
  throw e instanceof Error && Xr(e), e;
}
function Xr(e) {
  const t = vi.get(e);
  t && (nt(e, "message", {
    value: t.message
  }), nt(e, "stack", {
    value: t.stack
  }));
}
let vt = [], Vt = [];
function Gr() {
  var e = vt;
  vt = [], Lr(e);
}
function _i() {
  var e = Vt;
  Vt = [], Lr(e);
}
function hr(e) {
  vt.length === 0 && queueMicrotask(Gr), vt.push(e);
}
function pi() {
  vt.length > 0 && Gr(), Vt.length > 0 && _i();
}
function gi() {
  for (var e = (
    /** @type {Effect} */
    w.b
  ); e !== null && !e.has_pending_snippet(); )
    e = e.parent;
  return e === null && ei(), e;
}
// @__NO_SIDE_EFFECTS__
function _r(e) {
  var t = J | z, r = E !== null && (E.f & J) !== 0 ? (
    /** @type {Derived} */
    E
  ) : null;
  return w === null || r !== null && (r.f & G) !== 0 ? t |= G : w.f |= lr, {
    ctx: te,
    deps: null,
    effects: null,
    equals: Vr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      R
    ),
    wv: 0,
    parent: r ?? w,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function mi(e, t) {
  let r = (
    /** @type {Effect | null} */
    w
  );
  r === null && ri();
  var n = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = ht(
    /** @type {V} */
    R
  ), s = null, o = !E;
  return Ni(() => {
    try {
      var f = e();
    } catch (c) {
      f = Promise.reject(c);
    }
    var l = () => f;
    i = (s == null ? void 0 : s.then(l, l)) ?? Promise.resolve(f), s = i;
    var u = (
      /** @type {Batch} */
      V
    ), h = n.pending;
    o && (n.update_pending_count(1), h || u.increment());
    const d = (c, v = void 0) => {
      s = null, h || u.activate(), v ? v !== ur && (a.f |= qe, Xt(a, v)) : ((a.f & qe) !== 0 && (a.f ^= qe), Xt(a, c)), o && (n.update_pending_count(-1), h || u.decrement()), Jr();
    };
    if (i.then(d, (c) => d(null, c || "unknown")), u)
      return () => {
        queueMicrotask(() => u.neuter());
      };
  }), new Promise((f) => {
    function l(u) {
      function h() {
        u === i ? f(a) : l(i);
      }
      u.then(h, h);
    }
    l(i);
  });
}
// @__NO_SIDE_EFFECTS__
function wi(e) {
  const t = /* @__PURE__ */ _r(e);
  return t.equals = Br, t;
}
function zr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      se(
        /** @type {Effect} */
        t[r]
      );
  }
}
function yi(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & J) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function pr(e) {
  var t, r = w;
  ue(yi(e));
  try {
    zr(e), t = mn(e);
  } finally {
    ue(r);
  }
  return t;
}
function Kr(e) {
  var t = pr(e);
  if (e.equals(t) || (e.v = t, e.wv = pn()), !Xe)
    if (Ce !== null)
      Ce.set(e, e.v);
    else {
      var r = (Se || (e.f & G) !== 0) && e.deps !== null ? Be : M;
      P(e, r);
    }
}
function $i(e, t, r) {
  const n = _r;
  if (t.length === 0) {
    r(e.map(n));
    return;
  }
  var i = V, a = (
    /** @type {Effect} */
    w
  ), s = bi(), o = gi();
  Promise.all(t.map((f) => /* @__PURE__ */ mi(f))).then((f) => {
    i == null || i.activate(), s();
    try {
      r([...e.map(n), ...f]);
    } catch (l) {
      (a.f & We) === 0 && vr(l, a);
    }
    i == null || i.deactivate(), Jr();
  }).catch((f) => {
    o.error(f);
  });
}
function bi() {
  var e = w, t = E, r = te;
  return function() {
    ue(e), re(t), St(r);
  };
}
function Jr() {
  ue(null), re(null), St(null);
}
const yt = /* @__PURE__ */ new Set();
let V = null, Ce = null, xr = /* @__PURE__ */ new Set(), Ke = [], Pt = null, Bt = !1;
var pt, et, tt, ke, gt, mt, Fe, rt, Te, de, Le, pe, Zr, Qr, Wt;
const yr = class yr {
  constructor() {
    L(this, pe);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    L(this, pt, /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    L(this, et, /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    L(this, tt, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    L(this, ke, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    L(this, gt, null);
    /**
     * True if an async effect inside this batch resolved and
     * its parent branch was already deleted
     */
    L(this, mt, !1);
    /**
     * Async effects (created inside `async_derived`) encountered during processing.
     * These run after the rest of the batch has updated, since they should
     * always have the latest values
     * @type {Effect[]}
     */
    L(this, Fe, []);
    /**
     * The same as `#async_effects`, but for effects inside a newly-created
     * `<svelte:boundary>` — these do not prevent the batch from committing
     * @type {Effect[]}
     */
    L(this, rt, []);
    /**
     * Template effects and `$effect.pre` effects, which run when
     * a batch is committed
     * @type {Effect[]}
     */
    L(this, Te, []);
    /**
     * The same as `#render_effects`, but for `$effect` (which runs after)
     * @type {Effect[]}
     */
    L(this, de, []);
    /**
     * Block effects, which may need to re-run on subsequent flushes
     * in order to update internal sources (e.g. each block items)
     * @type {Effect[]}
     */
    L(this, Le, []);
    /**
     * A set of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`
     * @type {Set<Effect>}
     */
    F(this, "skipped_effects", /* @__PURE__ */ new Set());
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    g(this, et).has(t) || g(this, et).set(t, r), g(this, pt).set(t, t.v);
  }
  activate() {
    V = this;
  }
  deactivate() {
    V = null;
    for (const t of xr)
      if (xr.delete(t), t(), V !== null)
        break;
  }
  neuter() {
    H(this, mt, !0);
  }
  flush() {
    Ke.length > 0 ? this.flush_effects() : ot(this, pe, Wt).call(this), V === this && (g(this, ke) === 0 && yt.delete(this), this.deactivate());
  }
  flush_effects() {
    var t = Qe;
    Bt = !0;
    try {
      var r = 0;
      for (Cr(!0); Ke.length > 0; ) {
        if (r++ > 1e3) {
          var n, i;
          Ei();
        }
        ot(this, pe, Zr).call(this, Ke), Ue.clear();
      }
    } finally {
      Bt = !1, Cr(t), Pt = null;
    }
  }
  increment() {
    H(this, ke, g(this, ke) + 1);
  }
  decrement() {
    if (H(this, ke, g(this, ke) - 1), g(this, ke) === 0) {
      for (const t of g(this, Te))
        P(t, z), Ne(t);
      for (const t of g(this, de))
        P(t, z), Ne(t);
      for (const t of g(this, Le))
        P(t, z), Ne(t);
      H(this, Te, []), H(this, de, []), this.flush();
    } else
      this.deactivate();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    g(this, tt).add(t);
  }
  settled() {
    return (g(this, gt) ?? H(this, gt, zn())).promise;
  }
  static ensure(t = !0) {
    if (V === null) {
      const r = V = new yr();
      yt.add(V), t && queueMicrotask(() => {
        V === r && r.flush();
      });
    }
    return V;
  }
};
pt = new WeakMap(), et = new WeakMap(), tt = new WeakMap(), ke = new WeakMap(), gt = new WeakMap(), mt = new WeakMap(), Fe = new WeakMap(), rt = new WeakMap(), Te = new WeakMap(), de = new WeakMap(), Le = new WeakMap(), pe = new WeakSet(), /**
 *
 * @param {Effect[]} root_effects
 */
Zr = function(t) {
  var a;
  Ke = [];
  var r = null;
  if (yt.size > 1) {
    r = /* @__PURE__ */ new Map(), Ce = /* @__PURE__ */ new Map();
    for (const [s, o] of g(this, pt))
      r.set(s, { v: s.v, wv: s.wv }), s.v = o;
    for (const s of yt)
      if (s !== this)
        for (const [o, f] of g(s, et))
          r.has(o) || (r.set(o, { v: o.v, wv: o.wv }), o.v = f);
  }
  for (const s of t)
    ot(this, pe, Qr).call(this, s);
  if (g(this, Fe).length === 0 && g(this, ke) === 0) {
    var n = g(this, Te), i = g(this, de);
    H(this, Te, []), H(this, de, []), H(this, Le, []), ot(this, pe, Wt).call(this), kr(n), kr(i), (a = g(this, gt)) == null || a.resolve();
  } else {
    for (const s of g(this, Te)) P(s, M);
    for (const s of g(this, de)) P(s, M);
    for (const s of g(this, Le)) P(s, M);
  }
  if (r) {
    for (const [s, { v: o, wv: f }] of r)
      s.wv <= f && (s.v = o);
    Ce = null;
  }
  for (const s of g(this, Fe))
    ct(s);
  for (const s of g(this, rt))
    ct(s);
  H(this, Fe, []), H(this, rt, []);
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 */
Qr = function(t) {
  var u;
  t.f ^= M;
  for (var r = t.first; r !== null; ) {
    var n = r.f, i = (n & (ge | Ve)) !== 0, a = i && (n & M) !== 0, s = a || (n & ae) !== 0 || this.skipped_effects.has(r);
    if (!s && r.fn !== null) {
      if (i)
        r.f ^= M;
      else if ((n & or) !== 0)
        g(this, de).push(r);
      else if (Lt(r))
        if ((n & fr) !== 0) {
          var o = (u = r.b) != null && u.pending ? g(this, rt) : g(this, Fe);
          o.push(r);
        } else
          (r.f & st) !== 0 && g(this, Le).push(r), ct(r);
      var f = r.first;
      if (f !== null) {
        r = f;
        continue;
      }
    }
    var l = r.parent;
    for (r = r.next; r === null && l !== null; )
      r = l.next, l = l.parent;
  }
}, /**
 * Append and remove branches to/from the DOM
 */
Wt = function() {
  if (!g(this, mt))
    for (const t of g(this, tt))
      t();
  g(this, tt).clear();
};
let at = yr;
function xe(e) {
  var t;
  const r = at.ensure(!1);
  for (; ; ) {
    if (pi(), Ke.length === 0)
      return r === V && r.flush(), Pt = null, /** @type {T} */
      t;
    r.flush_effects();
  }
}
function Ei() {
  try {
    si();
  } catch (e) {
    vr(e, Pt);
  }
}
function kr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; r++) {
      var n = e[r];
      if ((n.f & (We | ae)) === 0 && Lt(n)) {
        var i = Nt;
        if (ct(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? vn(n) : n.fn = null), Nt > i && (n.f & jr) !== 0)
          break;
      }
    }
    for (; r < t; r += 1)
      Ne(e[r]);
  }
}
function Ne(e) {
  for (var t = Pt = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Bt && t === w && (r & st) !== 0)
      return;
    if ((r & (Ve | ge)) !== 0) {
      if ((r & M) === 0) return;
      t.f ^= M;
    }
  }
  Ke.push(t);
}
const Ue = /* @__PURE__ */ new Map();
function ht(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Vr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function W(e, t) {
  const r = ht(e);
  return Ri(r), r;
}
// @__NO_SIDE_EFFECTS__
function en(e, t = !1, r = !0) {
  const n = ht(e);
  return t || (n.equals = Br), n;
}
function I(e, t, r = !1) {
  E !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!fe || (E.f & Er) !== 0) && Wr() && (E.f & (J | st | fr | Er)) !== 0 && !(U != null && U.includes(e)) && ui();
  let n = r ? ft(t) : t;
  return Xt(e, n);
}
function Xt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Xe ? Ue.set(e, t) : Ue.set(e, r), e.v = t, at.ensure().capture(e, r), (e.f & J) !== 0 && ((e.f & z) !== 0 && pr(
      /** @type {Derived} */
      e
    ), P(e, (e.f & G) === 0 ? M : Be)), e.wv = pn(), tn(e, z), w !== null && (w.f & M) !== 0 && (w.f & (ge | Ve)) === 0 && (Q === null ? Mi([e]) : Q.push(e));
  }
  return t;
}
function Ut(e) {
  I(e, e.v + 1);
}
function tn(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f;
      (s & z) === 0 && (P(a, t), (s & (M | G)) !== 0 && ((s & J) !== 0 ? tn(
        /** @type {Derived} */
        a,
        Be
      ) : Ne(
        /** @type {Effect} */
        a
      )));
    }
}
function ft(e) {
  if (typeof e != "object" || e === null || Et in e)
    return e;
  const t = Fr(e);
  if (t !== Wn && t !== Xn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = ar(e), i = /* @__PURE__ */ W(0), a = je, s = (o) => {
    if (je === a)
      return o();
    var f = E, l = je;
    re(null), Nr(a);
    var u = o();
    return re(f), Nr(l), u;
  };
  return n && r.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && li();
        var u = r.get(f);
        return u === void 0 ? u = s(() => {
          var h = /* @__PURE__ */ W(l.value);
          return r.set(f, h), h;
        }) : I(u, l.value, !0), !0;
      },
      deleteProperty(o, f) {
        var l = r.get(f);
        if (l === void 0) {
          if (f in o) {
            const u = s(() => /* @__PURE__ */ W(R));
            r.set(f, u), Ut(i);
          }
        } else
          I(l, R), Ut(i);
        return !0;
      },
      get(o, f, l) {
        var c;
        if (f === Et)
          return e;
        var u = r.get(f), h = f in o;
        if (u === void 0 && (!h || (c = Ze(o, f)) != null && c.writable) && (u = s(() => {
          var v = ft(h ? o[f] : R), _ = /* @__PURE__ */ W(v);
          return _;
        }), r.set(f, u)), u !== void 0) {
          var d = y(u);
          return d === R ? void 0 : d;
        }
        return Reflect.get(o, f, l);
      },
      getOwnPropertyDescriptor(o, f) {
        var l = Reflect.getOwnPropertyDescriptor(o, f);
        if (l && "value" in l) {
          var u = r.get(f);
          u && (l.value = y(u));
        } else if (l === void 0) {
          var h = r.get(f), d = h == null ? void 0 : h.v;
          if (h !== void 0 && d !== R)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return l;
      },
      has(o, f) {
        var d;
        if (f === Et)
          return !0;
        var l = r.get(f), u = l !== void 0 && l.v !== R || Reflect.has(o, f);
        if (l !== void 0 || w !== null && (!u || (d = Ze(o, f)) != null && d.writable)) {
          l === void 0 && (l = s(() => {
            var c = u ? ft(o[f]) : R, v = /* @__PURE__ */ W(c);
            return v;
          }), r.set(f, l));
          var h = y(l);
          if (h === R)
            return !1;
        }
        return u;
      },
      set(o, f, l, u) {
        var b;
        var h = r.get(f), d = f in o;
        if (n && f === "length")
          for (var c = l; c < /** @type {Source<number>} */
          h.v; c += 1) {
            var v = r.get(c + "");
            v !== void 0 ? I(v, R) : c in o && (v = s(() => /* @__PURE__ */ W(R)), r.set(c + "", v));
          }
        if (h === void 0)
          (!d || (b = Ze(o, f)) != null && b.writable) && (h = s(() => /* @__PURE__ */ W(void 0)), I(h, ft(l)), r.set(f, h));
        else {
          d = h.v !== R;
          var _ = s(() => ft(l));
          I(h, _);
        }
        var p = Reflect.getOwnPropertyDescriptor(o, f);
        if (p != null && p.set && p.set.call(u, l), !d) {
          if (n && typeof f == "string") {
            var x = (
              /** @type {Source<number>} */
              r.get("length")
            ), k = Number(f);
            Number.isInteger(k) && k >= x.v && I(x, k + 1);
          }
          Ut(i);
        }
        return !0;
      },
      ownKeys(o) {
        y(i);
        var f = Reflect.ownKeys(o).filter((h) => {
          var d = r.get(h);
          return d === void 0 || d.v !== R;
        });
        for (var [l, u] of r)
          u.v !== R && !(l in o) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        fi();
      }
    }
  );
}
var Tr, rn, nn, an;
function Gt() {
  if (Tr === void 0) {
    Tr = window, rn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    nn = Ze(t, "firstChild").get, an = Ze(t, "nextSibling").get, br(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), br(r) && (r.__t = void 0);
  }
}
function _e(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ae(e) {
  return nn.call(e);
}
// @__NO_SIDE_EFFECTS__
function Oe(e) {
  return an.call(e);
}
function Pe(e, t) {
  if (!$)
    return /* @__PURE__ */ Ae(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ Ae(C)
  );
  if (r === null)
    r = C.appendChild(_e());
  else if (t && r.nodeType !== Yr) {
    var n = _e();
    return r == null || r.before(n), K(n), n;
  }
  return K(r), r;
}
function xi(e, t) {
  if (!$) {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Ae(
        /** @type {Node} */
        e
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Oe(r) : r;
  }
  return C;
}
function xt(e, t = 1, r = !1) {
  let n = $ ? C : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(n);
  if (!$)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== Yr) {
    var a = _e();
    return n === null ? i == null || i.after(a) : n.before(a), K(a), a;
  }
  return K(n), /** @type {TemplateNode} */
  n;
}
function sn(e) {
  e.textContent = "";
}
function on() {
  return !1;
}
function ki(e) {
  w === null && E === null && ai(), E !== null && (E.f & G) !== 0 && w === null && ii(), Xe && ni();
}
function Ti(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function me(e, t, r, n = !0) {
  var i = w;
  i !== null && (i.f & ae) !== 0 && (e |= ae);
  var a = {
    ctx: te,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | z,
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
      ct(a), a.f |= Mt;
    } catch (f) {
      throw se(a), f;
    }
  else t !== null && Ne(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & lr) === 0;
  if (!s && n && (i !== null && Ti(a, i), E !== null && (E.f & J) !== 0)) {
    var o = (
      /** @type {Derived} */
      E
    );
    (o.effects ?? (o.effects = [])).push(a);
  }
  return a;
}
function zt(e) {
  ki();
  var t = (
    /** @type {Effect} */
    w.f
  ), r = !E && (t & ge) !== 0 && (t & Mt) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      te
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return ln(e);
}
function ln(e) {
  return me(or | jr, e, !1);
}
function Ci(e) {
  at.ensure();
  const t = me(Ve, e, !0);
  return () => {
    se(t);
  };
}
function Si(e) {
  at.ensure();
  const t = me(Ve, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Dt(t, () => {
      se(t), n(void 0);
    }) : (se(t), n(void 0));
  });
}
function fn(e) {
  return me(or, e, !1);
}
function Ni(e) {
  return me(fr | lr, e, !0);
}
function un(e, t = 0) {
  return me(qr | t, e, !0);
}
function be(e, t = [], r = []) {
  $i(t, r, (n) => {
    me(qr, () => e(...n.map(y)), !0);
  });
}
function gr(e, t = 0) {
  var r = me(st | t, e, !0);
  return r;
}
function He(e, t = !0) {
  return me(ge, e, !0, t);
}
function cn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Xe, n = E;
    Sr(!0), re(null);
    try {
      t.call(null);
    } finally {
      Sr(r), re(n);
    }
  }
}
function dn(e, t = !1) {
  var i;
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    (i = r.ac) == null || i.abort(ur);
    var n = r.next;
    (r.f & Ve) !== 0 ? r.parent = null : se(r, t), r = n;
  }
}
function Ai(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ge) === 0 && se(t), t = r;
  }
}
function se(e, t = !0) {
  var r = !1;
  (t || (e.f & Kn) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Oi(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), dn(e, t && !r), At(e, 0), P(e, We);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  cn(e);
  var i = e.parent;
  i !== null && i.first !== null && vn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Oi(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Oe(e)
    );
    e.remove(), e = r;
  }
}
function vn(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Dt(e, t) {
  var r = [];
  mr(e, r, !0), hn(r, () => {
    se(e), t && t();
  });
}
function hn(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function mr(e, t, r) {
  if ((e.f & ae) === 0) {
    if (e.f ^= ae, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & wt) !== 0 || (n.f & ge) !== 0;
      mr(n, t, a ? r : !1), n = i;
    }
  }
}
function Ft(e) {
  _n(e, !0);
}
function _n(e, t) {
  if ((e.f & ae) !== 0) {
    e.f ^= ae, (e.f & M) === 0 && (P(e, z), Ne(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & wt) !== 0 || (r.f & ge) !== 0;
      _n(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let Qe = !1;
function Cr(e) {
  Qe = e;
}
let Xe = !1;
function Sr(e) {
  Xe = e;
}
let E = null, fe = !1;
function re(e) {
  E = e;
}
let w = null;
function ue(e) {
  w = e;
}
let U = null;
function Ri(e) {
  E !== null && (U === null ? U = [e] : U.push(e));
}
let q = null, B = 0, Q = null;
function Mi(e) {
  Q = e;
}
let Nt = 1, _t = 0, je = _t;
function Nr(e) {
  je = e;
}
let Se = !1;
function pn() {
  return ++Nt;
}
function Lt(e) {
  var h;
  var t = e.f;
  if ((t & z) !== 0)
    return !0;
  if ((t & Be) !== 0) {
    var r = e.deps, n = (t & G) !== 0;
    if (r !== null) {
      var i, a, s = (t & Ct) !== 0, o = n && w !== null && !Se, f = r.length;
      if ((s || o) && (w === null || (w.f & We) === 0)) {
        var l = (
          /** @type {Derived} */
          e
        ), u = l.parent;
        for (i = 0; i < f; i++)
          a = r[i], (s || !((h = a == null ? void 0 : a.reactions) != null && h.includes(l))) && (a.reactions ?? (a.reactions = [])).push(l);
        s && (l.f ^= Ct), o && u !== null && (u.f & G) === 0 && (l.f ^= G);
      }
      for (i = 0; i < f; i++)
        if (a = r[i], Lt(
          /** @type {Derived} */
          a
        ) && Kr(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || w !== null && !Se) && P(e, M);
  }
  return !1;
}
function gn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(U != null && U.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & J) !== 0 ? gn(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? P(a, z) : (a.f & M) !== 0 && P(a, Be), Ne(
        /** @type {Effect} */
        a
      ));
    }
}
function mn(e) {
  var v;
  var t = q, r = B, n = Q, i = E, a = Se, s = U, o = te, f = fe, l = je, u = e.f;
  q = /** @type {null | Value[]} */
  null, B = 0, Q = null, Se = (u & G) !== 0 && (fe || !Qe || E === null), E = (u & (ge | Ve)) === 0 ? e : null, U = null, St(e.ctx), fe = !1, je = ++_t, e.ac !== null && (e.ac.abort(ur), e.ac = null);
  try {
    e.f |= Yt;
    var h = (
      /** @type {Function} */
      (0, e.fn)()
    ), d = e.deps;
    if (q !== null) {
      var c;
      if (At(e, B), d !== null && B > 0)
        for (d.length = B + q.length, c = 0; c < q.length; c++)
          d[B + c] = q[c];
      else
        e.deps = d = q;
      if (!Se || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (u & J) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (c = B; c < d.length; c++)
          ((v = d[c]).reactions ?? (v.reactions = [])).push(e);
    } else d !== null && B < d.length && (At(e, B), d.length = B);
    if (Wr() && Q !== null && !fe && d !== null && (e.f & (J | Be | z)) === 0)
      for (c = 0; c < /** @type {Source[]} */
      Q.length; c++)
        gn(
          Q[c],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (_t++, Q !== null && (n === null ? n = Q : n.push(.../** @type {Source[]} */
    Q))), (e.f & qe) !== 0 && (e.f ^= qe), h;
  } catch (_) {
    return hi(_);
  } finally {
    e.f ^= Yt, q = t, B = r, Q = n, E = i, Se = a, U = s, St(o), fe = f, je = l;
  }
}
function Ii(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Vn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & J) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (q === null || !q.includes(t)) && (P(t, Be), (t.f & (G | Ct)) === 0 && (t.f ^= Ct), zr(
    /** @type {Derived} **/
    t
  ), At(
    /** @type {Derived} **/
    t,
    0
  ));
}
function At(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Ii(e, r[n]);
}
function ct(e) {
  var t = e.f;
  if ((t & We) === 0) {
    P(e, M);
    var r = w, n = Qe;
    w = e, Qe = !0;
    try {
      (t & st) !== 0 ? Ai(e) : dn(e), cn(e);
      var i = mn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Nt;
      var a;
      Dr && di && (e.f & z) !== 0 && e.deps;
    } finally {
      Qe = n, w = r;
    }
  }
}
function y(e) {
  var t = e.f, r = (t & J) !== 0;
  if (E !== null && !fe) {
    var n = w !== null && (w.f & We) !== 0;
    if (!n && !(U != null && U.includes(e))) {
      var i = E.deps;
      if ((E.f & Yt) !== 0)
        e.rv < _t && (e.rv = _t, q === null && i !== null && i[B] === e ? B++ : q === null ? q = [e] : (!Se || !q.includes(e)) && q.push(e));
      else {
        (E.deps ?? (E.deps = [])).push(e);
        var a = e.reactions;
        a === null ? e.reactions = [E] : a.includes(E) || a.push(E);
      }
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var s = (
      /** @type {Derived} */
      e
    ), o = s.parent;
    o !== null && (o.f & G) === 0 && (s.f ^= G);
  }
  if (Xe) {
    if (Ue.has(e))
      return Ue.get(e);
    if (r) {
      s = /** @type {Derived} */
      e;
      var f = s.v;
      return ((s.f & M) !== 0 || wn(s)) && (f = pr(s)), Ue.set(s, f), f;
    }
  } else if (r) {
    if (s = /** @type {Derived} */
    e, Ce != null && Ce.has(s))
      return Ce.get(s);
    Lt(s) && Kr(s);
  }
  if ((e.f & qe) !== 0)
    throw e.v;
  return e.v;
}
function wn(e) {
  if (e.v === R) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Ue.has(t) || (t.f & J) !== 0 && wn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function wr(e) {
  var t = fe;
  try {
    return fe = !0, e();
  } finally {
    fe = t;
  }
}
const Pi = -7169;
function P(e, t) {
  e.f = e.f & Pi | t;
}
function yn(e) {
  var t = E, r = w;
  re(null), ue(null);
  try {
    return e();
  } finally {
    re(t), ue(r);
  }
}
const $n = /* @__PURE__ */ new Set(), Kt = /* @__PURE__ */ new Set();
function Di(e) {
  for (var t = 0; t < e.length; t++)
    $n.add(e[t]);
  for (var r of Kt)
    r(e);
}
function $t(e) {
  var k;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((k = e.composedPath) == null ? void 0 : k.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  ), s = 0, o = e.__root;
  if (o) {
    var f = i.indexOf(o);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    f <= l && (s = f);
  }
  if (a = /** @type {Element} */
  i[s] || e.target, a !== t) {
    nt(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var u = E, h = w;
    re(null), ue(null);
    try {
      for (var d, c = []; a !== null; ) {
        var v = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var _ = a["__" + n];
          if (_ != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a))
            if (ar(_)) {
              var [p, ...x] = _;
              p.apply(a, [e, ...x]);
            } else
              _.call(a, e);
        } catch (b) {
          d ? c.push(b) : d = b;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        a = v;
      }
      if (d) {
        for (let b of c)
          queueMicrotask(() => {
            throw b;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, re(u), ue(h);
    }
  }
}
function Fi(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ye(e, t) {
  var r = (
    /** @type {Effect} */
    w
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Ge(e, t) {
  var r = (t & Un) !== 0, n = (t & jn) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if ($)
      return Ye(C, null), C;
    i === void 0 && (i = Fi(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ Ae(i)));
    var s = (
      /** @type {TemplateNode} */
      n || rn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ae(s)
      ), f = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ye(o, f);
    } else
      Ye(s, s);
    return s;
  };
}
function Li() {
  if ($)
    return Ye(C, null), C;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = _e();
  return e.append(t, r), Ye(t, r), e;
}
function ce(e, t) {
  if ($) {
    w.nodes_end = C, it();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const qi = ["touchstart", "touchmove"];
function Ui(e) {
  return qi.includes(e);
}
const ji = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Yi(e) {
  return ji.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let Ot = !0;
function Ar(e) {
  Ot = e;
}
function Hi(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function bn(e, t) {
  return En(e, t);
}
function Vi(e, t) {
  Gt(), t.intro = t.intro ?? !1;
  const r = t.target, n = $, i = C;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ae(r)
    ); a && (a.nodeType !== dt || /** @type {Comment} */
    a.data !== Pr); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ Oe(a);
    if (!a)
      throw Je;
    X(!0), K(
      /** @type {Comment} */
      a
    ), it();
    const s = En(e, { ...t, anchor: a });
    if (C === null || C.nodeType !== dt || /** @type {Comment} */
    C.data !== ir)
      throw It(), Je;
    return X(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Je)
      return t.recover === !1 && oi(), Gt(), sn(r), X(!1), bn(e, t);
    throw s;
  } finally {
    X(n), K(i);
  }
}
const ze = /* @__PURE__ */ new Map();
function En(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  Gt();
  var o = /* @__PURE__ */ new Set(), f = (h) => {
    for (var d = 0; d < h.length; d++) {
      var c = h[d];
      if (!o.has(c)) {
        o.add(c);
        var v = Ui(c);
        t.addEventListener(c, $t, { passive: v });
        var _ = ze.get(c);
        _ === void 0 ? (document.addEventListener(c, $t, { passive: v }), ze.set(c, 1)) : ze.set(c, _ + 1);
      }
    }
  };
  f(sr($n)), Kt.add(f);
  var l = void 0, u = Si(() => {
    var h = r ?? t.appendChild(_e());
    return He(() => {
      if (a) {
        cr({});
        var d = (
          /** @type {ComponentContext} */
          te
        );
        d.c = a;
      }
      i && (n.$$events = i), $ && Ye(
        /** @type {TemplateNode} */
        h,
        null
      ), Ot = s, l = e(h, n) || {}, Ot = !0, $ && (w.nodes_end = C), a && dr();
    }), () => {
      var v;
      for (var d of o) {
        t.removeEventListener(d, $t);
        var c = (
          /** @type {number} */
          ze.get(d)
        );
        --c === 0 ? (document.removeEventListener(d, $t), ze.delete(d)) : ze.set(d, c);
      }
      Kt.delete(f), h !== r && ((v = h.parentNode) == null || v.removeChild(h));
    };
  });
  return Jt.set(l, u), l;
}
let Jt = /* @__PURE__ */ new WeakMap();
function Bi(e, t) {
  const r = Jt.get(e);
  return r ? (Jt.delete(e), r(t)) : Promise.resolve();
}
function xn(e) {
  te === null && ti(), zt(() => {
    const t = wr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function ut(e, t, r = !1) {
  $ && it();
  var n = e, i = null, a = null, s = R, o = r ? wt : 0, f = !1;
  const l = (c, v = !0) => {
    f = !0, d(v, c);
  };
  var u = null;
  function h() {
    u !== null && (u.lastChild.remove(), n.before(u), u = null);
    var c = s ? i : a, v = s ? a : i;
    c && Ft(c), v && Dt(v, () => {
      s ? a = null : i = null;
    });
  }
  const d = (c, v) => {
    if (s === (s = c)) return;
    let _ = !1;
    if ($) {
      const S = Hr(n) === nr;
      !!s === S && (n = Ht(), K(n), X(!1), _ = !0);
    }
    var p = on(), x = n;
    if (p && (u = document.createDocumentFragment(), u.append(x = _e())), s ? i ?? (i = v && He(() => v(x))) : a ?? (a = v && He(() => v(x))), p) {
      var k = (
        /** @type {Batch} */
        V
      ), b = s ? i : a, N = s ? a : i;
      b && k.skipped_effects.delete(b), N && k.skipped_effects.add(N), k.add_callback(h);
    } else
      h();
    _ && X(!0);
  };
  gr(() => {
    f = !1, t(l), f || d(null, null);
  }, o), $ && (n = C);
}
function Wi(e, t, r) {
  for (var n = e.items, i = [], a = t.length, s = 0; s < a; s++)
    mr(t[s].e, i, !0);
  var o = a > 0 && i.length === 0 && r !== null;
  if (o) {
    var f = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    sn(f), f.append(
      /** @type {Element} */
      r
    ), n.clear(), le(e, t[0].prev, t[a - 1].next);
  }
  hn(i, () => {
    for (var l = 0; l < a; l++) {
      var u = t[l];
      o || (n.delete(u.k), le(e, u.prev, u.next)), se(u.e, !o);
    }
  });
}
function Xi(e, t, r, n, i, a = null) {
  var s = e, o = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var f = (
      /** @type {Element} */
      e
    );
    s = $ ? K(
      /** @type {Comment | Text} */
      /* @__PURE__ */ Ae(f)
    ) : f.appendChild(_e());
  }
  $ && it();
  var l = null, u = !1, h = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ wi(() => {
    var p = r();
    return ar(p) ? p : p == null ? [] : sr(p);
  }), c, v;
  function _() {
    Gi(
      v,
      c,
      o,
      h,
      s,
      i,
      t,
      n,
      r
    ), a !== null && (c.length === 0 ? l ? Ft(l) : l = He(() => a(s)) : l !== null && Dt(l, () => {
      l = null;
    }));
  }
  gr(() => {
    v ?? (v = /** @type {Effect} */
    w), c = y(d);
    var p = c.length;
    if (u && p === 0)
      return;
    u = p === 0;
    let x = !1;
    if ($) {
      var k = Hr(s) === nr;
      k !== (p === 0) && (s = Ht(), K(s), X(!1), x = !0);
    }
    if ($) {
      for (var b = null, N, S = 0; S < p; S++) {
        if (C.nodeType === dt && /** @type {Comment} */
        C.data === ir) {
          s = /** @type {Comment} */
          C, x = !0, X(!1);
          break;
        }
        var j = c[S], D = n(j, S);
        N = Zt(
          C,
          o,
          b,
          null,
          j,
          D,
          S,
          i,
          t,
          r
        ), o.items.set(D, N), b = N;
      }
      p > 0 && K(Ht());
    }
    if ($)
      p === 0 && a && (l = He(() => a(s)));
    else if (on()) {
      var Z = /* @__PURE__ */ new Set(), O = (
        /** @type {Batch} */
        V
      );
      for (S = 0; S < p; S += 1) {
        j = c[S], D = n(j, S);
        var Re = o.items.get(D) ?? h.get(D);
        Re || (N = Zt(
          null,
          o,
          null,
          null,
          j,
          D,
          S,
          i,
          t,
          r,
          !0
        ), h.set(D, N)), Z.add(D);
      }
      for (const [we, m] of o.items)
        Z.has(we) || O.skipped_effects.add(m.e);
      O.add_callback(_);
    } else
      _();
    x && X(!0), y(d);
  }), $ && (s = C);
}
function Gi(e, t, r, n, i, a, s, o, f) {
  var l = t.length, u = r.items, h = r.first, d = h, c, v = null, _ = [], p = [], x, k, b, N;
  for (N = 0; N < l; N += 1) {
    if (x = t[N], k = o(x, N), b = u.get(k), b === void 0) {
      var S = n.get(k);
      if (S !== void 0) {
        n.delete(k), u.set(k, S);
        var j = v ? v.next : d;
        le(r, v, S), le(r, S, j), jt(S, j, i), v = S;
      } else {
        var D = d ? (
          /** @type {TemplateNode} */
          d.e.nodes_start
        ) : i;
        v = Zt(
          D,
          r,
          v,
          v === null ? r.first : v.next,
          x,
          k,
          N,
          a,
          s,
          f
        );
      }
      u.set(k, v), _ = [], p = [], d = v.next;
      continue;
    }
    if ((b.e.f & ae) !== 0 && Ft(b.e), b !== d) {
      if (c !== void 0 && c.has(b)) {
        if (_.length < p.length) {
          var Z = p[0], O;
          v = Z.prev;
          var Re = _[0], we = _[_.length - 1];
          for (O = 0; O < _.length; O += 1)
            jt(_[O], Z, i);
          for (O = 0; O < p.length; O += 1)
            c.delete(p[O]);
          le(r, Re.prev, we.next), le(r, v, Re), le(r, we, Z), d = Z, v = we, N -= 1, _ = [], p = [];
        } else
          c.delete(b), jt(b, d, i), le(r, b.prev, b.next), le(r, b, v === null ? r.first : v.next), le(r, v, b), v = b;
        continue;
      }
      for (_ = [], p = []; d !== null && d.k !== k; )
        (d.e.f & ae) === 0 && (c ?? (c = /* @__PURE__ */ new Set())).add(d), p.push(d), d = d.next;
      if (d === null)
        continue;
      b = d;
    }
    _.push(b), v = b, d = b.next;
  }
  if (d !== null || c !== void 0) {
    for (var m = c === void 0 ? [] : sr(c); d !== null; )
      (d.e.f & ae) === 0 && m.push(d), d = d.next;
    var T = m.length;
    if (T > 0) {
      var A = l === 0 ? i : null;
      Wi(r, m, A);
    }
  }
  e.first = r.first && r.first.e, e.last = v && v.e;
  for (var ne of n.values())
    se(ne.e);
  n.clear();
}
function Zt(e, t, r, n, i, a, s, o, f, l, u) {
  var h = (f & Dn) !== 0, d = (f & Ln) === 0, c = h ? d ? /* @__PURE__ */ en(i, !1, !1) : ht(i) : i, v = (f & Fn) === 0 ? s : ht(s), _ = {
    i: v,
    v: c,
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
      p.append(e = _e());
    }
    return _.e = He(() => o(
      /** @type {Node} */
      e,
      c,
      v,
      l
    ), $), _.e.prev = r && r.e, _.e.next = n && n.e, r === null ? u || (t.first = _) : (r.next = _, r.e.next = _.e), n !== null && (n.prev = _, n.e.prev = _.e), _;
  } finally {
  }
}
function jt(e, t, r) {
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
      /* @__PURE__ */ Oe(a)
    );
    i.before(a), a = s;
  }
}
function le(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function zi(e, t, r, n, i, a) {
  let s = $;
  $ && it();
  var o, f, l = null;
  $ && C.nodeType === Qn && (l = /** @type {Element} */
  C, it());
  var u = (
    /** @type {TemplateNode} */
    $ ? C : e
  ), h;
  gr(() => {
    const d = t() || null;
    var c = d === "svg" ? Hn : null;
    d !== o && (h && (d === null ? Dt(h, () => {
      h = null, f = null;
    }) : d === f ? Ft(h) : (se(h), Ar(!1))), d && d !== f && (h = He(() => {
      if (l = $ ? (
        /** @type {Element} */
        l
      ) : c ? document.createElementNS(c, d) : document.createElement(d), Ye(l, l), n) {
        $ && Yi(d) && l.append(document.createComment(""));
        var v = (
          /** @type {TemplateNode} */
          $ ? /* @__PURE__ */ Ae(l) : l.appendChild(_e())
        );
        $ && (v === null ? X(!1) : K(v)), n(l, v);
      }
      w.nodes_end = l, u.before(l);
    })), o = d, o && (f = o), Ar(!0));
  }, wt), s && (X(!0), K(u));
}
function kn(e, t) {
  hr(() => {
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
function Ki(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function Ji(e, t) {
  return e == null ? null : String(e);
}
function Ie(e, t, r, n, i, a) {
  var s = e.__className;
  if ($ || s !== r || s === void 0) {
    var o = Ki(r, n);
    (!$ || o !== e.getAttribute("class")) && (o == null ? e.removeAttribute("class") : e.className = o), e.__className = r;
  }
  return a;
}
function Ee(e, t, r, n) {
  var i = e.__style;
  if ($ || i !== t) {
    var a = Ji(t);
    (!$ || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const Zi = Symbol("is custom element"), Qi = Symbol("is html");
function Tn(e, t, r, n) {
  var i = ea(e);
  $ && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[Zn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Cn(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Or(e, t, r) {
  var n = E, i = w;
  let a = $;
  $ && X(!1), re(null), ue(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (Qt.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? Cn(e).includes(t) : r && typeof r == "object") ? e[t] = r : Tn(e, t, r == null ? r : String(r));
  } finally {
    re(n), ue(i), a && X(!0);
  }
}
function ea(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [Zi]: e.nodeName.includes("-"),
      [Qi]: e.namespaceURI === Yn
    })
  );
}
var Qt = /* @__PURE__ */ new Map();
function Cn(e) {
  var t = Qt.get(e.nodeName);
  if (t) return t;
  Qt.set(e.nodeName, t = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = Bn(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = Fr(n);
  }
  return t;
}
const ta = () => performance.now(), he = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => ta(),
  tasks: /* @__PURE__ */ new Set()
};
function Sn() {
  const e = he.now();
  he.tasks.forEach((t) => {
    t.c(e) || (he.tasks.delete(t), t.f());
  }), he.tasks.size !== 0 && he.tick(Sn);
}
function ra(e) {
  let t;
  return he.tasks.size === 0 && he.tick(Sn), {
    promise: new Promise((r) => {
      he.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      he.tasks.delete(t);
    }
  };
}
function bt(e, t) {
  yn(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function na(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Rr(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = na(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const ia = (e) => e;
function Nn(e, t, r, n) {
  var i = (e & qn) !== 0, a = "both", s, o = t.inert, f = t.style.overflow, l, u;
  function h() {
    return yn(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var d = {
    is_global: i,
    in() {
      t.inert = o, bt(t, "introstart"), l = er(t, h(), u, 1, () => {
        bt(t, "introend"), l == null || l.abort(), l = s = void 0, t.style.overflow = f;
      });
    },
    out(p) {
      t.inert = !0, bt(t, "outrostart"), u = er(t, h(), l, 0, () => {
        bt(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      l == null || l.abort(), u == null || u.abort();
    }
  }, c = (
    /** @type {Effect} */
    w
  );
  if ((c.transitions ?? (c.transitions = [])).push(d), Ot) {
    var v = i;
    if (!v) {
      for (var _ = (
        /** @type {Effect | null} */
        c.parent
      ); _ && (_.f & wt) !== 0; )
        for (; (_ = _.parent) && (_.f & st) === 0; )
          ;
      v = !_ || (_.f & Mt) !== 0;
    }
    v && fn(() => {
      wr(() => d.in());
    });
  }
}
function er(e, t, r, n, i) {
  var a = n === 1;
  if (Gn(t)) {
    var s, o = !1;
    return hr(() => {
      if (!o) {
        var p = t({ direction: a ? "in" : "out" });
        s = er(e, p, r, n, i);
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
      abort: lt,
      deactivate: lt,
      reset: lt,
      t: () => n
    };
  const { delay: f = 0, css: l, tick: u, easing: h = ia } = t;
  var d = [];
  if (a && r === void 0 && (u && u(0, 1), l)) {
    var c = Rr(l(0, 1));
    d.push(c, c);
  }
  var v = () => 1 - n, _ = e.animate(d, { duration: f, fill: "forwards" });
  return _.onfinish = () => {
    _.cancel();
    var p = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var x = n - p, k = (
      /** @type {number} */
      t.duration * Math.abs(x)
    ), b = [];
    if (k > 0) {
      var N = !1;
      if (l)
        for (var S = Math.ceil(k / 16.666666666666668), j = 0; j <= S; j += 1) {
          var D = p + x * h(j / S), Z = Rr(l(D, 1 - D));
          b.push(Z), N || (N = Z.overflow === "hidden");
        }
      N && (e.style.overflow = "hidden"), v = () => {
        var O = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return p + x * h(O / k);
      }, u && ra(() => {
        if (_.playState !== "running") return !1;
        var O = v();
        return u(O, 1 - O), !0;
      });
    }
    _ = e.animate(b, { duration: k, fill: "forwards" }), _.onfinish = () => {
      v = () => n, u == null || u(n, 1 - n), i();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = lt);
    },
    deactivate: () => {
      i = lt;
    },
    reset: () => {
      n === 0 && (u == null || u(1, 0));
    },
    t: () => v()
  };
}
function Mr(e, t) {
  return e === t || (e == null ? void 0 : e[Et]) === t;
}
function aa(e = {}, t, r, n) {
  return fn(() => {
    var i, a;
    return un(() => {
      i = a, a = [], wr(() => {
        e !== r(...a) && (t(e, ...a), i && Mr(r(...i), e) && t(null, ...i));
      });
    }), () => {
      hr(() => {
        a && Mr(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function De(e, t, r, n) {
  var i = (
    /** @type {V} */
    n
  ), a = !0, s = () => (a && (a = !1, i = /** @type {V} */
  n), i), o;
  o = /** @type {V} */
  e[t], o === void 0 && n !== void 0 && (o = s());
  var f;
  f = () => {
    var d = (
      /** @type {V} */
      e[t]
    );
    return d === void 0 ? s() : (a = !0, d);
  };
  var l = !1, u = /* @__PURE__ */ _r(() => (l = !1, f())), h = (
    /** @type {Effect} */
    w
  );
  return function(d, c) {
    if (arguments.length > 0) {
      const v = c ? y(u) : d;
      return I(u, v), l = !0, i !== void 0 && (i = v), d;
    }
    return Xe && l || (h.f & We) !== 0 ? u.v : y(u);
  };
}
function sa(e) {
  return new oa(e);
}
var ve, ee;
class oa {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    L(this, ve);
    /** @type {Record<string, any>} */
    L(this, ee);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, o) => {
      var f = /* @__PURE__ */ en(o, !1, !1);
      return r.set(s, f), f;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, o) {
          return y(r.get(o) ?? n(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === Jn ? !0 : (y(r.get(o) ?? n(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, f) {
          return I(r.get(o) ?? n(o, f), f), Reflect.set(s, o, f);
        }
      }
    );
    H(this, ee, (t.hydrate ? Vi : bn)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && xe(), H(this, ve, i.$$events);
    for (const s of Object.keys(g(this, ee)))
      s === "$set" || s === "$destroy" || s === "$on" || nt(this, s, {
        get() {
          return g(this, ee)[s];
        },
        /** @param {any} value */
        set(o) {
          g(this, ee)[s] = o;
        },
        enumerable: !0
      });
    g(this, ee).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, g(this, ee).$destroy = () => {
      Bi(g(this, ee));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    g(this, ee).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    g(this, ve)[t] = g(this, ve)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return g(this, ve)[t].push(n), () => {
      g(this, ve)[t] = g(this, ve)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    g(this, ee).$destroy();
  }
}
ve = new WeakMap(), ee = new WeakMap();
let An;
typeof HTMLElement == "function" && (An = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    F(this, "$$ctor");
    /** Slots */
    F(this, "$$s");
    /** @type {any} The Svelte component instance */
    F(this, "$$c");
    /** Whether or not the custom element is connected */
    F(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    F(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    F(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    F(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    F(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    F(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    F(this, "$$me");
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
          i !== "default" && (s.name = i), ce(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = la(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = kt(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = sa({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Ci(() => {
        un(() => {
          var i;
          this.$$r = !0;
          for (const a of Tt(this.$$c)) {
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
    return Tt(this.$$p_d).find(
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
function la(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function On(e, t, r, n, i, a) {
  let s = class extends An {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Tt(t).map(
        (o) => (t[o].attribute || o).toLowerCase()
      );
    }
  };
  return Tt(t).forEach((o) => {
    nt(s.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(f) {
        var h;
        f = kt(o, f, t), this.$$d[o] = f;
        var l = this.$$c;
        if (l) {
          var u = (h = Ze(l, o)) == null ? void 0 : h.get;
          u ? l[o] = f : l.$set({ [o]: f });
        }
      }
    });
  }), n.forEach((o) => {
    nt(s.prototype, o, {
      get() {
        var f;
        return (f = this.$$c) == null ? void 0 : f[o];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let Rt = /* @__PURE__ */ W(void 0);
const fa = async () => (I(Rt, await window.loadCardHelpers().then((e) => e), !0), y(Rt)), ua = () => y(Rt) ? y(Rt) : fa();
function ca(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Rn(e, { delay: t = 0, duration: r = 400, easing: n = ca, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, o = i === "y" ? "height" : "width", f = parseFloat(a[o]), l = i === "y" ? ["top", "bottom"] : ["left", "right"], u = l.map(
    (x) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${x[0].toUpperCase()}${x.slice(1)}`
    )
  ), h = parseFloat(a[`padding${u[0]}`]), d = parseFloat(a[`padding${u[1]}`]), c = parseFloat(a[`margin${u[0]}`]), v = parseFloat(a[`margin${u[1]}`]), _ = parseFloat(
    a[`border${u[0]}Width`]
  ), p = parseFloat(
    a[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (x) => `overflow: hidden;opacity: ${Math.min(x * 20, 1) * s};${o}: ${x * f}px;padding-${l[0]}: ${x * h}px;padding-${l[1]}: ${x * d}px;margin-${l[0]}: ${x * c}px;margin-${l[1]}: ${x * v}px;border-${l[0]}-width: ${x * _}px;border-${l[1]}-width: ${x * p}px;min-${o}: 0`
  };
}
var da = /* @__PURE__ */ Ge('<span class="loading svelte-1sdlsm">Loading...</span>'), va = /* @__PURE__ */ Ge('<div class="outer-container"><!> <!></div>');
const ha = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function tr(e, t) {
  cr(t, !0), kn(e, ha);
  const r = De(t, "type", 7, "div"), n = De(t, "config"), i = De(t, "hass"), a = De(t, "marginTop", 7, "0px"), s = De(t, "open");
  let o = /* @__PURE__ */ W(void 0), f = /* @__PURE__ */ W(!0);
  zt(() => {
    y(o) && (y(o).hass = i());
  }), zt(() => {
    var _, p;
    const v = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    (p = (_ = y(o)) == null ? void 0 : _.setConfig) == null || p.call(_, v);
  }), xn(async () => {
    const c = await ua(), _ = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, p = c.createCardElement(_);
    p.hass = i(), y(o) && (y(o).replaceWith(p), I(o, p, !0), I(f, !1));
  });
  var l = va(), u = Pe(l);
  zi(u, r, !1, (c, v) => {
    aa(c, (_) => I(o, _, !0), () => y(o)), Nn(3, c, () => Rn);
  });
  var h = xt(u, 2);
  {
    var d = (c) => {
      var v = da();
      ce(c, v);
    };
    ut(h, (c) => {
      y(f) && c(d);
    });
  }
  return $e(l), be(() => Ee(l, `margin-top: ${(s() ? a() : "0px") ?? ""};`)), ce(e, l), dr({
    get type() {
      return r();
    },
    set type(c = "div") {
      r(c), xe();
    },
    get config() {
      return n();
    },
    set config(c) {
      n(c), xe();
    },
    get hass() {
      return i();
    },
    set hass(c) {
      i(c), xe();
    },
    get marginTop() {
      return a();
    },
    set marginTop(c = "0px") {
      a(c), xe();
    },
    get open() {
      return s();
    },
    set open(c) {
      s(c), xe();
    }
  });
}
customElements.define("expander-sub-card", On(tr, { type: {}, config: {}, hass: {}, marginTop: {}, open: {} }, [], [], !0));
function _a(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const rr = {
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
  icon: "mdi:chevron-down",
  "border-radius": "0px",
  border: "none",
  "icon-rotate-degree": "180deg"
};
var pa = /* @__PURE__ */ Ge('<button aria-label="Toggle button"><ha-icon></ha-icon></button>', 2), ga = /* @__PURE__ */ Ge('<div id="id1"><div id="id2" class="title-card-container svelte-14e5iy"><!></div> <!></div>'), ma = /* @__PURE__ */ Ge("<button><div> </div> <ha-icon></ha-icon></button>", 2), wa = /* @__PURE__ */ Ge('<div class="children-container svelte-14e5iy"></div>'), ya = /* @__PURE__ */ Ge("<ha-card><!> <!></ha-card>", 2);
const $a = {
  hash: "svelte-14e5iy",
  code: ".expander-card.svelte-14e5iy {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);border-radius:var(--border-radius,0px);border:var(--border,none);}.children-container.svelte-14e5iy {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-14e5iy {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-14e5iy {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-14e5iy {display:block;}.title-card-container.svelte-14e5iy {width:100%;padding:var(--title-padding);}.header.svelte-14e5iy {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-14e5iy {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-14e5iy {width:100%;text-align:left;}.ico.svelte-14e5iy {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-14e5iy {transform:rotate(var(--icon-rotate-degree,180deg));}.ripple.svelte-14e5iy {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-14e5iy:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-14e5iy:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function ba(e, t) {
  var Re, we;
  cr(t, !0), kn(e, $a);
  const r = De(t, "hass"), n = De(t, "config", 7, rr);
  let i = /* @__PURE__ */ W(!1), a = /* @__PURE__ */ W(!1);
  const s = n()["storgage-id"], o = "expander-open-" + s, f = n()["show-button-users"] === void 0 || ((we = n()["show-button-users"]) == null ? void 0 : we.includes((Re = r()) == null ? void 0 : Re.user.name));
  function l() {
    u(!y(a));
  }
  function u(m) {
    if (I(a, m, !0), s !== void 0)
      try {
        localStorage.setItem(o, y(a) ? "true" : "false");
      } catch (T) {
        console.error(T);
      }
  }
  xn(() => {
    var ne, ye;
    const m = n()["min-width-expanded"], T = n()["max-width-expanded"], A = document.body.offsetWidth;
    if (m && T ? n().expanded = A >= m && A <= T : m ? n().expanded = A >= m : T && (n().expanded = A <= T), (ye = n()["start-expanded-users"]) != null && ye.includes((ne = r()) == null ? void 0 : ne.user.name))
      u(!0);
    else if (s !== void 0)
      try {
        const Y = localStorage.getItem(o);
        Y === null ? n().expanded !== void 0 && u(n().expanded) : I(a, Y ? Y === "true" : y(a), !0);
      } catch (Y) {
        console.error(Y);
      }
    else
      n().expanded !== void 0 && u(n().expanded);
  });
  const h = (m) => {
    if (y(i))
      return m.preventDefault(), m.stopImmediatePropagation(), I(i, !1), !1;
    l();
  }, d = (m) => {
    const T = m.currentTarget;
    T != null && T.classList.contains("title-card-container") && h(m);
  };
  let c, v = !1, _ = 0, p = 0;
  const x = (m) => {
    c = m.target, _ = m.touches[0].clientX, p = m.touches[0].clientY, v = !1;
  }, k = (m) => {
    const T = m.touches[0].clientX, A = m.touches[0].clientY;
    (Math.abs(T - _) > 10 || Math.abs(A - p) > 10) && (v = !0);
  }, b = (m) => {
    !v && c === m.target && n()["title-card-clickable"] && l(), c = void 0, I(i, !0);
  };
  var N = ya(), S = Pe(N);
  {
    var j = (m) => {
      var T = ga(), A = Pe(T);
      A.__touchstart = x, A.__touchmove = k, A.__touchend = b, A.__click = function(...oe) {
        var ie;
        (ie = n()["title-card-clickable"] ? d : null) == null || ie.apply(this, oe);
      };
      var ne = Pe(A);
      tr(ne, {
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
      }), $e(A);
      var ye = xt(A, 2);
      {
        var Y = (oe) => {
          var ie = pa();
          ie.__click = h;
          var Me = Pe(ie);
          be(() => Or(Me, "icon", n().icon)), $e(ie), be(() => {
            Ee(ie, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Ie(ie, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${y(a) ? " open" : " close"}`, "svelte-14e5iy"), Ee(Me, `--arrow-color:${n()["arrow-color"] ?? ""}`), Ie(Me, 1, `ico${y(a) ? " flipped open" : "close"}`, "svelte-14e5iy");
          }), ce(oe, ie);
        };
        ut(ye, (oe) => {
          f && oe(Y);
        });
      }
      $e(T), be(() => {
        Ie(T, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-14e5iy"), Ee(A, `--title-padding:${n()["title-card-padding"] ?? ""}`), Tn(A, "role", n()["title-card-clickable"] ? "button" : void 0);
      }), ce(m, T);
    }, D = (m) => {
      var T = Li(), A = xi(T);
      {
        var ne = (ye) => {
          var Y = ma();
          Y.__click = h;
          var oe = Pe(Y), ie = Pe(oe, !0);
          $e(oe);
          var Me = xt(oe, 2);
          be(() => Or(Me, "icon", n().icon)), $e(Y), be(() => {
            Ie(Y, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${y(a) ? " open" : " close"}`, "svelte-14e5iy"), Ee(Y, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Ie(oe, 1, `primary title${y(a) ? " open" : " close"}`, "svelte-14e5iy"), Hi(ie, n().title), Ee(Me, `--arrow-color:${n()["arrow-color"] ?? ""}`), Ie(Me, 1, `ico${y(a) ? " flipped open" : " close"}`, "svelte-14e5iy");
          }), ce(ye, Y);
        };
        ut(A, (ye) => {
          f && ye(ne);
        });
      }
      ce(m, T);
    };
    ut(S, (m) => {
      n()["title-card"] ? m(j) : m(D, !1);
    });
  }
  var Z = xt(S, 2);
  {
    var O = (m) => {
      var T = wa();
      Xi(T, 20, () => n().cards, (A) => A, (A, ne) => {
        tr(A, {
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
            return y(a);
          }
        });
      }), $e(T), be(() => Ee(T, `--expander-card-display:${n()["expander-card-display"] ?? ""};
             --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${(y(a) ? n()["child-padding"] : "0px") ?? ""};`)), Nn(3, T, () => Rn, () => ({ duration: 500, easing: _a })), ce(m, T);
    };
    ut(Z, (m) => {
      n().cards && m(O);
    });
  }
  return $e(N), be(() => {
    Ie(N, 1, `expander-card${n().clear ? " clear" : ""}${y(a) ? " open" : " close"}`, "svelte-14e5iy"), Ee(N, `--border-radius:${n()["border-radius"] ?? ""};
           --border:${n().border ?? ""};
           --icon-rotate-degree:${n()["icon-rotate-degree"] ?? ""};
           --expander-card-display:${n()["expander-card-display"] ?? ""};
           --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""};
           --padding:${n().padding ?? ""};
           --expander-state:${y(a) ?? ""};
           --card-background:${(y(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}
    `);
  }), ce(e, N), dr({
    get hass() {
      return r();
    },
    set hass(m) {
      r(m), xe();
    },
    get config() {
      return n();
    },
    set config(m = rr) {
      n(m), xe();
    }
  });
}
Di(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", On(ba, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    F(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...rr, ...r };
  }
}));
const Ea = "2.5.3";
console.info(
  `%c  Expander-Card 
%c Version ${Ea}`,
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
  ba as default
};
//# sourceMappingURL=expander-card.js.map
