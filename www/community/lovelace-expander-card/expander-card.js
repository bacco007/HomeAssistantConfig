var In = Object.defineProperty;
var br = (e) => {
  throw TypeError(e);
};
var Pn = (e, t, r) => t in e ? In(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var D = (e, t, r) => Pn(e, typeof t != "symbol" ? t + "" : t, r), jt = (e, t, r) => t.has(e) || br("Cannot " + r);
var g = (e, t, r) => (jt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), F = (e, t, r) => t.has(e) ? br("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), H = (e, t, r, n) => (jt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), lt = (e, t, r) => (jt(e, t, "access private method"), r);
const Dn = "5";
var Ir;
typeof window < "u" && ((Ir = window.__svelte ?? (window.__svelte = {})).v ?? (Ir.v = /* @__PURE__ */ new Set())).add(Dn);
const Fn = 1, Ln = 2, Un = 16, jn = 4, Yn = 1, Hn = 2, Pr = "[", ar = "[!", sr = "]", Je = {}, R = Symbol(), Vn = "http://www.w3.org/1999/xhtml", Bn = "http://www.w3.org/2000/svg", Dr = !1;
var lr = Array.isArray, Wn = Array.prototype.indexOf, or = Array.from, Tt = Object.keys, nt = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, Xn = Object.getOwnPropertyDescriptors, Gn = Object.prototype, zn = Array.prototype, Fr = Object.getPrototypeOf, Er = Object.isExtensible;
function Kn(e) {
  return typeof e == "function";
}
const ot = () => {
};
function Lr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Jn() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const K = 2, fr = 4, Ur = 8, st = 16, ge = 32, Ve = 64, jr = 128, ee = 256, Ct = 512, q = 1024, B = 2048, Be = 4096, ae = 8192, We = 16384, It = 32768, wt = 65536, kr = 1 << 17, Zn = 1 << 18, ur = 1 << 19, Yr = 1 << 20, Vt = 1 << 21, cr = 1 << 22, Le = 1 << 23, Et = Symbol("$state"), Qn = Symbol("legacy props"), ei = Symbol(""), dr = new class extends Error {
  constructor() {
    super(...arguments);
    D(this, "name", "StaleReactionError");
    D(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), ti = 1, Hr = 3, dt = 8;
function ri() {
  throw new Error("https://svelte.dev/e/await_outside_boundary");
}
function ni(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ii() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ai(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function si() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function li(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function oi() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fi() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function ui() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ci() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function di() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Pt(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let y = !1;
function G(e) {
  y = e;
}
let C;
function z(e) {
  if (e === null)
    throw Pt(), Je;
  return C = e;
}
function it() {
  return z(
    /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(C)
  );
}
function ye(e) {
  if (y) {
    if (/* @__PURE__ */ Oe(C) !== null)
      throw Pt(), Je;
    C = e;
  }
}
function Bt() {
  for (var e = 0, t = C; ; ) {
    if (t.nodeType === dt) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === sr) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Pr || r === ar) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Oe(t)
    );
    t.remove(), t = n;
  }
}
function Vr(e) {
  if (!e || e.nodeType !== dt)
    throw Pt(), Je;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Br(e) {
  return e === this.v;
}
function vi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Wr(e) {
  return !vi(e, this.v);
}
let hi = !1, te = null;
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
const _i = /* @__PURE__ */ new WeakMap();
function pi(e) {
  var t = w;
  if (t === null)
    return E.f |= Le, e;
  if ((t.f & It) === 0) {
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
  const t = _i.get(e);
  t && (nt(e, "message", {
    value: t.message
  }), nt(e, "stack", {
    value: t.stack
  }));
}
let vt = [], Wt = [];
function zr() {
  var e = vt;
  vt = [], Lr(e);
}
function gi() {
  var e = Wt;
  Wt = [], Lr(e);
}
function pr(e) {
  vt.length === 0 && queueMicrotask(zr), vt.push(e);
}
function mi() {
  vt.length > 0 && zr(), Wt.length > 0 && gi();
}
function wi() {
  for (var e = (
    /** @type {Effect} */
    w.b
  ); e !== null && !e.has_pending_snippet(); )
    e = e.parent;
  return e === null && ri(), e;
}
// @__NO_SIDE_EFFECTS__
function gr(e) {
  var t = K | B, r = E !== null && (E.f & K) !== 0 ? (
    /** @type {Derived} */
    E
  ) : null;
  return w === null || r !== null && (r.f & ee) !== 0 ? t |= ee : w.f |= ur, {
    ctx: te,
    deps: null,
    effects: null,
    equals: Br,
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
function $i(e, t) {
  let r = (
    /** @type {Effect | null} */
    w
  );
  r === null && ii();
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
  ), s = null, l = !E;
  return Oi(() => {
    try {
      var f = e();
    } catch (c) {
      f = Promise.reject(c);
    }
    var o = () => f;
    i = (s == null ? void 0 : s.then(o, o)) ?? Promise.resolve(f), s = i;
    var u = (
      /** @type {Batch} */
      V
    ), h = n.pending;
    l && (n.update_pending_count(1), h || u.increment());
    const d = (c, v = void 0) => {
      s = null, h || u.activate(), v ? v !== dr && (a.f |= Le, zt(a, v)) : ((a.f & Le) !== 0 && (a.f ^= Le), zt(a, c)), l && (n.update_pending_count(-1), h || u.decrement()), Zr();
    };
    if (i.then(d, (c) => d(null, c || "unknown")), u)
      return () => {
        queueMicrotask(() => u.neuter());
      };
  }), new Promise((f) => {
    function o(u) {
      function h() {
        u === i ? f(a) : o(i);
      }
      u.then(h, h);
    }
    o(i);
  });
}
// @__NO_SIDE_EFFECTS__
function yi(e) {
  const t = /* @__PURE__ */ gr(e);
  return t.equals = Wr, t;
}
function Kr(e) {
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
function bi(e) {
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
function mr(e) {
  var t, r = w;
  ue(bi(e));
  try {
    Kr(e), t = $n(e);
  } finally {
    ue(r);
  }
  return t;
}
function Jr(e) {
  var t = mr(e);
  if (e.equals(t) || (e.v = t, e.wv = mn()), !Xe)
    if (Ce !== null)
      Ce.set(e, e.v);
    else {
      var r = (Se || (e.f & ee) !== 0) && e.deps !== null ? Be : q;
      I(e, r);
    }
}
function Ei(e, t, r) {
  const n = gr;
  if (t.length === 0) {
    r(e.map(n));
    return;
  }
  var i = V, a = (
    /** @type {Effect} */
    w
  ), s = ki(), l = wi();
  Promise.all(t.map((f) => /* @__PURE__ */ $i(f))).then((f) => {
    i == null || i.activate(), s();
    try {
      r([...e.map(n), ...f]);
    } catch (o) {
      (a.f & We) === 0 && _r(o, a);
    }
    i == null || i.deactivate(), Zr();
  }).catch((f) => {
    l.error(f);
  });
}
function ki() {
  var e = w, t = E, r = te;
  return function() {
    ue(e), re(t), St(r);
  };
}
function Zr() {
  ue(null), re(null), St(null);
}
const $t = /* @__PURE__ */ new Set();
let V = null, Ce = null, xr = /* @__PURE__ */ new Set(), Nt = [];
function Qr() {
  const e = (
    /** @type {() => void} */
    Nt.shift()
  );
  Nt.length > 0 && queueMicrotask(Qr), e();
}
let Ke = [], Dt = null, Xt = !1;
var pt, et, tt, xe, gt, mt, De, rt, Te, de, Fe, pe, en, tn, Gt;
const qt = class qt {
  constructor() {
    F(this, pe);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    F(this, pt, /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    F(this, et, /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    F(this, tt, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    F(this, xe, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    F(this, gt, null);
    /**
     * True if an async effect inside this batch resolved and
     * its parent branch was already deleted
     */
    F(this, mt, !1);
    /**
     * Async effects (created inside `async_derived`) encountered during processing.
     * These run after the rest of the batch has updated, since they should
     * always have the latest values
     * @type {Effect[]}
     */
    F(this, De, []);
    /**
     * The same as `#async_effects`, but for effects inside a newly-created
     * `<svelte:boundary>` — these do not prevent the batch from committing
     * @type {Effect[]}
     */
    F(this, rt, []);
    /**
     * Template effects and `$effect.pre` effects, which run when
     * a batch is committed
     * @type {Effect[]}
     */
    F(this, Te, []);
    /**
     * The same as `#render_effects`, but for `$effect` (which runs after)
     * @type {Effect[]}
     */
    F(this, de, []);
    /**
     * Block effects, which may need to re-run on subsequent flushes
     * in order to update internal sources (e.g. each block items)
     * @type {Effect[]}
     */
    F(this, Fe, []);
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
    Ke.length > 0 ? this.flush_effects() : lt(this, pe, Gt).call(this), V === this && (g(this, xe) === 0 && $t.delete(this), this.deactivate());
  }
  flush_effects() {
    var t = Qe;
    Xt = !0;
    try {
      var r = 0;
      for (Sr(!0); Ke.length > 0; ) {
        if (r++ > 1e3) {
          var n, i;
          xi();
        }
        lt(this, pe, en).call(this, Ke), Ue.clear();
      }
    } finally {
      Xt = !1, Sr(t), Dt = null;
    }
  }
  increment() {
    H(this, xe, g(this, xe) + 1);
  }
  decrement() {
    if (H(this, xe, g(this, xe) - 1), g(this, xe) === 0) {
      for (const t of g(this, Te))
        I(t, B), Ne(t);
      for (const t of g(this, de))
        I(t, B), Ne(t);
      for (const t of g(this, Fe))
        I(t, B), Ne(t);
      H(this, Te, []), H(this, de, []), this.flush();
    } else
      this.deactivate();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    g(this, tt).add(t);
  }
  settled() {
    return (g(this, gt) ?? H(this, gt, Jn())).promise;
  }
  static ensure(t = !0) {
    if (V === null) {
      const r = V = new qt();
      $t.add(V), t && qt.enqueue(() => {
        V === r && r.flush();
      });
    }
    return V;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Nt.length === 0 && queueMicrotask(Qr), Nt.unshift(t);
  }
};
pt = new WeakMap(), et = new WeakMap(), tt = new WeakMap(), xe = new WeakMap(), gt = new WeakMap(), mt = new WeakMap(), De = new WeakMap(), rt = new WeakMap(), Te = new WeakMap(), de = new WeakMap(), Fe = new WeakMap(), pe = new WeakSet(), /**
 *
 * @param {Effect[]} root_effects
 */
en = function(t) {
  var a;
  Ke = [];
  var r = null;
  if ($t.size > 1) {
    r = /* @__PURE__ */ new Map(), Ce = /* @__PURE__ */ new Map();
    for (const [s, l] of g(this, pt))
      r.set(s, { v: s.v, wv: s.wv }), s.v = l;
    for (const s of $t)
      if (s !== this)
        for (const [l, f] of g(s, et))
          r.has(l) || (r.set(l, { v: l.v, wv: l.wv }), l.v = f);
  }
  for (const s of t)
    lt(this, pe, tn).call(this, s);
  if (g(this, De).length === 0 && g(this, xe) === 0) {
    var n = g(this, Te), i = g(this, de);
    H(this, Te, []), H(this, de, []), H(this, Fe, []), lt(this, pe, Gt).call(this), Tr(n), Tr(i), (a = g(this, gt)) == null || a.resolve();
  } else {
    for (const s of g(this, Te)) I(s, q);
    for (const s of g(this, de)) I(s, q);
    for (const s of g(this, Fe)) I(s, q);
  }
  if (r) {
    for (const [s, { v: l, wv: f }] of r)
      s.wv <= f && (s.v = l);
    Ce = null;
  }
  for (const s of g(this, De))
    ct(s);
  for (const s of g(this, rt))
    ct(s);
  H(this, De, []), H(this, rt, []);
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 */
tn = function(t) {
  var u;
  t.f ^= q;
  for (var r = t.first; r !== null; ) {
    var n = r.f, i = (n & (ge | Ve)) !== 0, a = i && (n & q) !== 0, s = a || (n & ae) !== 0 || this.skipped_effects.has(r);
    if (!s && r.fn !== null) {
      if (i)
        r.f ^= q;
      else if ((n & fr) !== 0)
        g(this, de).push(r);
      else if (Ut(r))
        if ((n & cr) !== 0) {
          var l = (u = r.b) != null && u.pending ? g(this, rt) : g(this, De);
          l.push(r);
        } else
          (r.f & st) !== 0 && g(this, Fe).push(r), ct(r);
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
Gt = function() {
  if (!g(this, mt))
    for (const t of g(this, tt))
      t();
  g(this, tt).clear();
};
let at = qt;
function ke(e) {
  var t;
  const r = at.ensure(!1);
  for (; ; ) {
    if (mi(), Ke.length === 0)
      return r === V && r.flush(), Dt = null, /** @type {T} */
      t;
    r.flush_effects();
  }
}
function xi() {
  try {
    oi();
  } catch (e) {
    _r(e, Dt);
  }
}
function Tr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; r++) {
      var n = e[r];
      if ((n.f & (We | ae)) === 0 && Ut(n)) {
        var i = At;
        if (ct(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null && n.ac === null ? _n(n) : n.fn = null), At > i && (n.f & Yr) !== 0)
          break;
      }
    }
    for (; r < t; r += 1)
      Ne(e[r]);
  }
}
function Ne(e) {
  for (var t = Dt = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Xt && t === w && (r & st) !== 0)
      return;
    if ((r & (Ve | ge)) !== 0) {
      if ((r & q) === 0) return;
      t.f ^= q;
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
    equals: Br,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function X(e, t) {
  const r = ht(e);
  return qi(r), r;
}
// @__NO_SIDE_EFFECTS__
function rn(e, t = !1, r = !0) {
  const n = ht(e);
  return t || (n.equals = Wr), n;
}
function M(e, t, r = !1) {
  E !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!fe || (E.f & kr) !== 0) && Xr() && (E.f & (K | st | cr | kr)) !== 0 && !(U != null && U.includes(e)) && di();
  let n = r ? ft(t) : t;
  return zt(e, n);
}
function zt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Xe ? Ue.set(e, t) : Ue.set(e, r), e.v = t, at.ensure().capture(e, r), (e.f & K) !== 0 && ((e.f & B) !== 0 && mr(
      /** @type {Derived} */
      e
    ), I(e, (e.f & ee) === 0 ? q : Be)), e.wv = mn(), nn(e, B), w !== null && (w.f & q) !== 0 && (w.f & (ge | Ve)) === 0 && (Z === null ? Ii([e]) : Z.push(e));
  }
  return t;
}
function Yt(e) {
  M(e, e.v + 1);
}
function nn(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f;
      (s & B) === 0 && I(a, t), (s & K) !== 0 ? nn(
        /** @type {Derived} */
        a,
        Be
      ) : (s & B) === 0 && Ne(
        /** @type {Effect} */
        a
      );
    }
}
function ft(e) {
  if (typeof e != "object" || e === null || Et in e)
    return e;
  const t = Fr(e);
  if (t !== Gn && t !== zn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = lr(e), i = /* @__PURE__ */ X(0), a = je, s = (l) => {
    if (je === a)
      return l();
    var f = E, o = je;
    re(null), Ar(a);
    var u = l();
    return re(f), Ar(o), u;
  };
  return n && r.set("length", /* @__PURE__ */ X(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && ui();
        var u = r.get(f);
        return u === void 0 ? u = s(() => {
          var h = /* @__PURE__ */ X(o.value);
          return r.set(f, h), h;
        }) : M(u, o.value, !0), !0;
      },
      deleteProperty(l, f) {
        var o = r.get(f);
        if (o === void 0) {
          if (f in l) {
            const u = s(() => /* @__PURE__ */ X(R));
            r.set(f, u), Yt(i);
          }
        } else
          M(o, R), Yt(i);
        return !0;
      },
      get(l, f, o) {
        var c;
        if (f === Et)
          return e;
        var u = r.get(f), h = f in l;
        if (u === void 0 && (!h || (c = Ze(l, f)) != null && c.writable) && (u = s(() => {
          var v = ft(h ? l[f] : R), _ = /* @__PURE__ */ X(v);
          return _;
        }), r.set(f, u)), u !== void 0) {
          var d = $(u);
          return d === R ? void 0 : d;
        }
        return Reflect.get(l, f, o);
      },
      getOwnPropertyDescriptor(l, f) {
        var o = Reflect.getOwnPropertyDescriptor(l, f);
        if (o && "value" in o) {
          var u = r.get(f);
          u && (o.value = $(u));
        } else if (o === void 0) {
          var h = r.get(f), d = h == null ? void 0 : h.v;
          if (h !== void 0 && d !== R)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return o;
      },
      has(l, f) {
        var d;
        if (f === Et)
          return !0;
        var o = r.get(f), u = o !== void 0 && o.v !== R || Reflect.has(l, f);
        if (o !== void 0 || w !== null && (!u || (d = Ze(l, f)) != null && d.writable)) {
          o === void 0 && (o = s(() => {
            var c = u ? ft(l[f]) : R, v = /* @__PURE__ */ X(c);
            return v;
          }), r.set(f, o));
          var h = $(o);
          if (h === R)
            return !1;
        }
        return u;
      },
      set(l, f, o, u) {
        var b;
        var h = r.get(f), d = f in l;
        if (n && f === "length")
          for (var c = o; c < /** @type {Source<number>} */
          h.v; c += 1) {
            var v = r.get(c + "");
            v !== void 0 ? M(v, R) : c in l && (v = s(() => /* @__PURE__ */ X(R)), r.set(c + "", v));
          }
        if (h === void 0)
          (!d || (b = Ze(l, f)) != null && b.writable) && (h = s(() => /* @__PURE__ */ X(void 0)), M(h, ft(o)), r.set(f, h));
        else {
          d = h.v !== R;
          var _ = s(() => ft(o));
          M(h, _);
        }
        var p = Reflect.getOwnPropertyDescriptor(l, f);
        if (p != null && p.set && p.set.call(u, o), !d) {
          if (n && typeof f == "string") {
            var k = (
              /** @type {Source<number>} */
              r.get("length")
            ), x = Number(f);
            Number.isInteger(x) && x >= k.v && M(k, x + 1);
          }
          Yt(i);
        }
        return !0;
      },
      ownKeys(l) {
        $(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var d = r.get(h);
          return d === void 0 || d.v !== R;
        });
        for (var [o, u] of r)
          u.v !== R && !(o in l) && f.push(o);
        return f;
      },
      setPrototypeOf() {
        ci();
      }
    }
  );
}
var Cr, an, sn, ln;
function Kt() {
  if (Cr === void 0) {
    Cr = window, an = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    sn = Ze(t, "firstChild").get, ln = Ze(t, "nextSibling").get, Er(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Er(r) && (r.__t = void 0);
  }
}
function _e(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ae(e) {
  return sn.call(e);
}
// @__NO_SIDE_EFFECTS__
function Oe(e) {
  return ln.call(e);
}
function Ie(e, t) {
  if (!y)
    return /* @__PURE__ */ Ae(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ Ae(C)
  );
  if (r === null)
    r = C.appendChild(_e());
  else if (t && r.nodeType !== Hr) {
    var n = _e();
    return r == null || r.before(n), z(n), n;
  }
  return z(r), r;
}
function Ti(e, t) {
  if (!y) {
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
function kt(e, t = 1, r = !1) {
  let n = y ? C : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(n);
  if (!y)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== Hr) {
    var a = _e();
    return n === null ? i == null || i.after(a) : n.before(a), z(a), a;
  }
  return z(n), /** @type {TemplateNode} */
  n;
}
function on(e) {
  e.textContent = "";
}
function fn() {
  return !1;
}
function Ci(e) {
  w === null && E === null && li(), E !== null && (E.f & ee) !== 0 && w === null && si(), Xe && ai();
}
function Si(e, t) {
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
    f: e | B,
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
      ct(a), a.f |= It;
    } catch (f) {
      throw se(a), f;
    }
  else t !== null && Ne(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & ur) === 0;
  if (!s && n && (i !== null && Si(a, i), E !== null && (E.f & K) !== 0)) {
    var l = (
      /** @type {Derived} */
      E
    );
    (l.effects ?? (l.effects = [])).push(a);
  }
  return a;
}
function Jt(e) {
  Ci();
  var t = (
    /** @type {Effect} */
    w.f
  ), r = !E && (t & ge) !== 0 && (t & It) === 0;
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
  return me(fr | Yr, e, !1);
}
function Ni(e) {
  at.ensure();
  const t = me(Ve, e, !0);
  return () => {
    se(t);
  };
}
function Ai(e) {
  at.ensure();
  const t = me(Ve, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Ft(t, () => {
      se(t), n(void 0);
    }) : (se(t), n(void 0));
  });
}
function cn(e) {
  return me(fr, e, !1);
}
function Oi(e) {
  return me(cr | ur, e, !0);
}
function dn(e, t = 0) {
  return me(Ur | t, e, !0);
}
function be(e, t = [], r = []) {
  Ei(t, r, (n) => {
    me(Ur, () => e(...n.map($)), !0);
  });
}
function wr(e, t = 0) {
  var r = me(st | t, e, !0);
  return r;
}
function He(e, t = !0) {
  return me(ge, e, !0, t);
}
function vn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Xe, n = E;
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
    (r.f & Ve) !== 0 ? r.parent = null : se(r, t), r = n;
  }
}
function Ri(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ge) === 0 && se(t), t = r;
  }
}
function se(e, t = !0) {
  var r = !1;
  (t || (e.f & Zn) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Mi(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), hn(e, t && !r), Ot(e, 0), I(e, We);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  vn(e);
  var i = e.parent;
  i !== null && i.first !== null && _n(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Mi(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Oe(e)
    );
    e.remove(), e = r;
  }
}
function _n(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Ft(e, t) {
  var r = [];
  $r(e, r, !0), pn(r, () => {
    se(e), t && t();
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
      var i = n.next, a = (n.f & wt) !== 0 || (n.f & ge) !== 0;
      $r(n, t, a ? r : !1), n = i;
    }
  }
}
function Lt(e) {
  gn(e, !0);
}
function gn(e, t) {
  if ((e.f & ae) !== 0) {
    e.f ^= ae, (e.f & q) === 0 && (I(e, B), Ne(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & wt) !== 0 || (r.f & ge) !== 0;
      gn(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let Qe = !1;
function Sr(e) {
  Qe = e;
}
let Xe = !1;
function Nr(e) {
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
function qi(e) {
  E !== null && (U === null ? U = [e] : U.push(e));
}
let L = null, W = 0, Z = null;
function Ii(e) {
  Z = e;
}
let At = 1, _t = 0, je = _t;
function Ar(e) {
  je = e;
}
let Se = !1;
function mn() {
  return ++At;
}
function Ut(e) {
  var h;
  var t = e.f;
  if ((t & B) !== 0)
    return !0;
  if ((t & Be) !== 0) {
    var r = e.deps, n = (t & ee) !== 0;
    if (r !== null) {
      var i, a, s = (t & Ct) !== 0, l = n && w !== null && !Se, f = r.length;
      if ((s || l) && (w === null || (w.f & We) === 0)) {
        var o = (
          /** @type {Derived} */
          e
        ), u = o.parent;
        for (i = 0; i < f; i++)
          a = r[i], (s || !((h = a == null ? void 0 : a.reactions) != null && h.includes(o))) && (a.reactions ?? (a.reactions = [])).push(o);
        s && (o.f ^= Ct), l && u !== null && (u.f & ee) === 0 && (o.f ^= ee);
      }
      for (i = 0; i < f; i++)
        if (a = r[i], Ut(
          /** @type {Derived} */
          a
        ) && Jr(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || w !== null && !Se) && I(e, q);
  }
  return !1;
}
function wn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(U != null && U.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & K) !== 0 ? wn(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? I(a, B) : (a.f & q) !== 0 && I(a, Be), Ne(
        /** @type {Effect} */
        a
      ));
    }
}
function $n(e) {
  var v;
  var t = L, r = W, n = Z, i = E, a = Se, s = U, l = te, f = fe, o = je, u = e.f;
  L = /** @type {null | Value[]} */
  null, W = 0, Z = null, Se = (u & ee) !== 0 && (fe || !Qe || E === null), E = (u & (ge | Ve)) === 0 ? e : null, U = null, St(e.ctx), fe = !1, je = ++_t, e.ac !== null && (e.ac.abort(dr), e.ac = null);
  try {
    e.f |= Vt;
    var h = (
      /** @type {Function} */
      (0, e.fn)()
    ), d = e.deps;
    if (L !== null) {
      var c;
      if (Ot(e, W), d !== null && W > 0)
        for (d.length = W + L.length, c = 0; c < L.length; c++)
          d[W + c] = L[c];
      else
        e.deps = d = L;
      if (!Se || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (u & K) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (c = W; c < d.length; c++)
          ((v = d[c]).reactions ?? (v.reactions = [])).push(e);
    } else d !== null && W < d.length && (Ot(e, W), d.length = W);
    if (Xr() && Z !== null && !fe && d !== null && (e.f & (K | Be | B)) === 0)
      for (c = 0; c < /** @type {Source[]} */
      Z.length; c++)
        wn(
          Z[c],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (_t++, Z !== null && (n === null ? n = Z : n.push(.../** @type {Source[]} */
    Z))), (e.f & Le) !== 0 && (e.f ^= Le), h;
  } catch (_) {
    return pi(_);
  } finally {
    e.f ^= Vt, L = t, W = r, Z = n, E = i, Se = a, U = s, St(l), fe = f, je = o;
  }
}
function Pi(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Wn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & K) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (L === null || !L.includes(t)) && (I(t, Be), (t.f & (ee | Ct)) === 0 && (t.f ^= Ct), Kr(
    /** @type {Derived} **/
    t
  ), Ot(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Ot(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Pi(e, r[n]);
}
function ct(e) {
  var t = e.f;
  if ((t & We) === 0) {
    I(e, q);
    var r = w, n = Qe;
    w = e, Qe = !0;
    try {
      (t & st) !== 0 ? Ri(e) : hn(e), vn(e);
      var i = $n(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = At;
      var a;
      Dr && hi && (e.f & B) !== 0 && e.deps;
    } finally {
      Qe = n, w = r;
    }
  }
}
function $(e) {
  var t = e.f, r = (t & K) !== 0;
  if (E !== null && !fe) {
    var n = w !== null && (w.f & We) !== 0;
    if (!n && !(U != null && U.includes(e))) {
      var i = E.deps;
      if ((E.f & Vt) !== 0)
        e.rv < _t && (e.rv = _t, L === null && i !== null && i[W] === e ? W++ : L === null ? L = [e] : (!Se || !L.includes(e)) && L.push(e));
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
    ), l = s.parent;
    l !== null && (l.f & ee) === 0 && (s.f ^= ee);
  }
  if (Xe) {
    if (Ue.has(e))
      return Ue.get(e);
    if (r) {
      s = /** @type {Derived} */
      e;
      var f = s.v;
      return ((s.f & q) === 0 && s.reactions !== null || yn(s)) && (f = mr(s)), Ue.set(s, f), f;
    }
  } else if (r) {
    if (s = /** @type {Derived} */
    e, Ce != null && Ce.has(s))
      return Ce.get(s);
    Ut(s) && Jr(s);
  }
  if ((e.f & Le) !== 0)
    throw e.v;
  return e.v;
}
function yn(e) {
  if (e.v === R) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Ue.has(t) || (t.f & K) !== 0 && yn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function yr(e) {
  var t = fe;
  try {
    return fe = !0, e();
  } finally {
    fe = t;
  }
}
const Di = -7169;
function I(e, t) {
  e.f = e.f & Di | t;
}
function bn(e) {
  var t = E, r = w;
  re(null), ue(null);
  try {
    return e();
  } finally {
    re(t), ue(r);
  }
}
const En = /* @__PURE__ */ new Set(), Zt = /* @__PURE__ */ new Set();
function Fi(e) {
  for (var t = 0; t < e.length; t++)
    En.add(e[t]);
  for (var r of Zt)
    r(e);
}
function yt(e) {
  var x;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((x = e.composedPath) == null ? void 0 : x.call(e)) || [], a = (
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
            if (lr(_)) {
              var [p, ...k] = _;
              p.apply(a, [e, ...k]);
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
function Li(e) {
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
  var r = (t & Yn) !== 0, n = (t & Hn) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (y)
      return Ye(C, null), C;
    i === void 0 && (i = Li(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ Ae(i)));
    var s = (
      /** @type {TemplateNode} */
      n || an ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ae(s)
      ), f = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ye(l, f);
    } else
      Ye(s, s);
    return s;
  };
}
function Ui() {
  if (y)
    return Ye(C, null), C;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = _e();
  return e.append(t, r), Ye(t, r), e;
}
function ce(e, t) {
  if (y) {
    w.nodes_end = C, it();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const ji = ["touchstart", "touchmove"];
function Yi(e) {
  return ji.includes(e);
}
const Hi = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Vi(e) {
  return Hi.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let Rt = !0;
function Or(e) {
  Rt = e;
}
function Bi(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function kn(e, t) {
  return xn(e, t);
}
function Wi(e, t) {
  Kt(), t.intro = t.intro ?? !1;
  const r = t.target, n = y, i = C;
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
    G(!0), z(
      /** @type {Comment} */
      a
    ), it();
    const s = xn(e, { ...t, anchor: a });
    if (C === null || C.nodeType !== dt || /** @type {Comment} */
    C.data !== sr)
      throw Pt(), Je;
    return G(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Je)
      return t.recover === !1 && fi(), Kt(), on(r), G(!1), kn(e, t);
    throw s;
  } finally {
    G(n), z(i);
  }
}
const ze = /* @__PURE__ */ new Map();
function xn(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  Kt();
  var l = /* @__PURE__ */ new Set(), f = (h) => {
    for (var d = 0; d < h.length; d++) {
      var c = h[d];
      if (!l.has(c)) {
        l.add(c);
        var v = Yi(c);
        t.addEventListener(c, yt, { passive: v });
        var _ = ze.get(c);
        _ === void 0 ? (document.addEventListener(c, yt, { passive: v }), ze.set(c, 1)) : ze.set(c, _ + 1);
      }
    }
  };
  f(or(En)), Zt.add(f);
  var o = void 0, u = Ai(() => {
    var h = r ?? t.appendChild(_e());
    return He(() => {
      if (a) {
        vr({});
        var d = (
          /** @type {ComponentContext} */
          te
        );
        d.c = a;
      }
      i && (n.$$events = i), y && Ye(
        /** @type {TemplateNode} */
        h,
        null
      ), Rt = s, o = e(h, n) || {}, Rt = !0, y && (w.nodes_end = C), a && hr();
    }), () => {
      var v;
      for (var d of l) {
        t.removeEventListener(d, yt);
        var c = (
          /** @type {number} */
          ze.get(d)
        );
        --c === 0 ? (document.removeEventListener(d, yt), ze.delete(d)) : ze.set(d, c);
      }
      Zt.delete(f), h !== r && ((v = h.parentNode) == null || v.removeChild(h));
    };
  });
  return Qt.set(o, u), o;
}
let Qt = /* @__PURE__ */ new WeakMap();
function Xi(e, t) {
  const r = Qt.get(e);
  return r ? (Qt.delete(e), r(t)) : Promise.resolve();
}
function Tn(e) {
  te === null && ni(), Jt(() => {
    const t = yr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function ut(e, t, r = !1) {
  y && it();
  var n = e, i = null, a = null, s = R, l = r ? wt : 0, f = !1;
  const o = (c, v = !0) => {
    f = !0, d(v, c);
  };
  var u = null;
  function h() {
    u !== null && (u.lastChild.remove(), n.before(u), u = null);
    var c = s ? i : a, v = s ? a : i;
    c && Lt(c), v && Ft(v, () => {
      s ? a = null : i = null;
    });
  }
  const d = (c, v) => {
    if (s === (s = c)) return;
    let _ = !1;
    if (y) {
      const S = Vr(n) === ar;
      !!s === S && (n = Bt(), z(n), G(!1), _ = !0);
    }
    var p = fn(), k = n;
    if (p && (u = document.createDocumentFragment(), u.append(k = _e())), s ? i ?? (i = v && He(() => v(k))) : a ?? (a = v && He(() => v(k))), p) {
      var x = (
        /** @type {Batch} */
        V
      ), b = s ? i : a, N = s ? a : i;
      b && x.skipped_effects.delete(b), N && x.skipped_effects.add(N), x.add_callback(h);
    } else
      h();
    _ && G(!0);
  };
  wr(() => {
    f = !1, t(o), f || d(null, null);
  }, l), y && (n = C);
}
function Gi(e, t, r) {
  for (var n = e.items, i = [], a = t.length, s = 0; s < a; s++)
    $r(t[s].e, i, !0);
  var l = a > 0 && i.length === 0 && r !== null;
  if (l) {
    var f = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    on(f), f.append(
      /** @type {Element} */
      r
    ), n.clear(), oe(e, t[0].prev, t[a - 1].next);
  }
  pn(i, () => {
    for (var o = 0; o < a; o++) {
      var u = t[o];
      l || (n.delete(u.k), oe(e, u.prev, u.next)), se(u.e, !l);
    }
  });
}
function zi(e, t, r, n, i, a = null) {
  var s = e, l = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var f = (
      /** @type {Element} */
      e
    );
    s = y ? z(
      /** @type {Comment | Text} */
      /* @__PURE__ */ Ae(f)
    ) : f.appendChild(_e());
  }
  y && it();
  var o = null, u = !1, h = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ yi(() => {
    var p = r();
    return lr(p) ? p : p == null ? [] : or(p);
  }), c, v;
  function _() {
    Ki(
      v,
      c,
      l,
      h,
      s,
      i,
      t,
      n,
      r
    ), a !== null && (c.length === 0 ? o ? Lt(o) : o = He(() => a(s)) : o !== null && Ft(o, () => {
      o = null;
    }));
  }
  wr(() => {
    v ?? (v = /** @type {Effect} */
    w), c = $(d);
    var p = c.length;
    if (u && p === 0)
      return;
    u = p === 0;
    let k = !1;
    if (y) {
      var x = Vr(s) === ar;
      x !== (p === 0) && (s = Bt(), z(s), G(!1), k = !0);
    }
    if (y) {
      for (var b = null, N, S = 0; S < p; S++) {
        if (C.nodeType === dt && /** @type {Comment} */
        C.data === sr) {
          s = /** @type {Comment} */
          C, k = !0, G(!1);
          break;
        }
        var j = c[S], P = n(j, S);
        N = er(
          C,
          l,
          b,
          null,
          j,
          P,
          S,
          i,
          t,
          r
        ), l.items.set(P, N), b = N;
      }
      p > 0 && z(Bt());
    }
    if (y)
      p === 0 && a && (o = He(() => a(s)));
    else if (fn()) {
      var J = /* @__PURE__ */ new Set(), O = (
        /** @type {Batch} */
        V
      );
      for (S = 0; S < p; S += 1) {
        j = c[S], P = n(j, S);
        var Re = l.items.get(P) ?? h.get(P);
        Re || (N = er(
          null,
          l,
          null,
          null,
          j,
          P,
          S,
          i,
          t,
          r,
          !0
        ), h.set(P, N)), J.add(P);
      }
      for (const [we, m] of l.items)
        J.has(we) || O.skipped_effects.add(m.e);
      O.add_callback(_);
    } else
      _();
    k && G(!0), $(d);
  }), y && (s = C);
}
function Ki(e, t, r, n, i, a, s, l, f) {
  var o = t.length, u = r.items, h = r.first, d = h, c, v = null, _ = [], p = [], k, x, b, N;
  for (N = 0; N < o; N += 1) {
    if (k = t[N], x = l(k, N), b = u.get(x), b === void 0) {
      var S = n.get(x);
      if (S !== void 0) {
        n.delete(x), u.set(x, S);
        var j = v ? v.next : d;
        oe(r, v, S), oe(r, S, j), Ht(S, j, i), v = S;
      } else {
        var P = d ? (
          /** @type {TemplateNode} */
          d.e.nodes_start
        ) : i;
        v = er(
          P,
          r,
          v,
          v === null ? r.first : v.next,
          k,
          x,
          N,
          a,
          s,
          f
        );
      }
      u.set(x, v), _ = [], p = [], d = v.next;
      continue;
    }
    if ((b.e.f & ae) !== 0 && Lt(b.e), b !== d) {
      if (c !== void 0 && c.has(b)) {
        if (_.length < p.length) {
          var J = p[0], O;
          v = J.prev;
          var Re = _[0], we = _[_.length - 1];
          for (O = 0; O < _.length; O += 1)
            Ht(_[O], J, i);
          for (O = 0; O < p.length; O += 1)
            c.delete(p[O]);
          oe(r, Re.prev, we.next), oe(r, v, Re), oe(r, we, J), d = J, v = we, N -= 1, _ = [], p = [];
        } else
          c.delete(b), Ht(b, d, i), oe(r, b.prev, b.next), oe(r, b, v === null ? r.first : v.next), oe(r, v, b), v = b;
        continue;
      }
      for (_ = [], p = []; d !== null && d.k !== x; )
        (d.e.f & ae) === 0 && (c ?? (c = /* @__PURE__ */ new Set())).add(d), p.push(d), d = d.next;
      if (d === null)
        continue;
      b = d;
    }
    _.push(b), v = b, d = b.next;
  }
  if (d !== null || c !== void 0) {
    for (var m = c === void 0 ? [] : or(c); d !== null; )
      (d.e.f & ae) === 0 && m.push(d), d = d.next;
    var T = m.length;
    if (T > 0) {
      var A = o === 0 ? i : null;
      Gi(r, m, A);
    }
  }
  e.first = r.first && r.first.e, e.last = v && v.e;
  for (var ne of n.values())
    se(ne.e);
  n.clear();
}
function er(e, t, r, n, i, a, s, l, f, o, u) {
  var h = (f & Fn) !== 0, d = (f & Un) === 0, c = h ? d ? /* @__PURE__ */ rn(i, !1, !1) : ht(i) : i, v = (f & Ln) === 0 ? s : ht(s), _ = {
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
    return _.e = He(() => l(
      /** @type {Node} */
      e,
      c,
      v,
      o
    ), y), _.e.prev = r && r.e, _.e.next = n && n.e, r === null ? u || (t.first = _) : (r.next = _, r.e.next = _.e), n !== null && (n.prev = _, n.e.prev = _.e), _;
  } finally {
  }
}
function Ht(e, t, r) {
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
function oe(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function Ji(e, t, r, n, i, a) {
  let s = y;
  y && it();
  var l, f, o = null;
  y && C.nodeType === ti && (o = /** @type {Element} */
  C, it());
  var u = (
    /** @type {TemplateNode} */
    y ? C : e
  ), h;
  wr(() => {
    const d = t() || null;
    var c = d === "svg" ? Bn : null;
    d !== l && (h && (d === null ? Ft(h, () => {
      h = null, f = null;
    }) : d === f ? Lt(h) : (se(h), Or(!1))), d && d !== f && (h = He(() => {
      if (o = y ? (
        /** @type {Element} */
        o
      ) : c ? document.createElementNS(c, d) : document.createElement(d), Ye(o, o), n) {
        y && Vi(d) && o.append(document.createComment(""));
        var v = (
          /** @type {TemplateNode} */
          y ? /* @__PURE__ */ Ae(o) : o.appendChild(_e())
        );
        y && (v === null ? G(!1) : z(v)), n(o, v);
      }
      w.nodes_end = o, u.before(o);
    })), l = d, l && (f = l), Or(!0));
  }, wt), s && (G(!0), z(u));
}
function Cn(e, t) {
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
function Zi(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function Qi(e, t) {
  return e == null ? null : String(e);
}
function qe(e, t, r, n, i, a) {
  var s = e.__className;
  if (y || s !== r || s === void 0) {
    var l = Zi(r, n);
    (!y || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : e.className = l), e.__className = r;
  }
  return a;
}
function Ee(e, t, r, n) {
  var i = e.__style;
  if (y || i !== t) {
    var a = Qi(t);
    (!y || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const ea = Symbol("is custom element"), ta = Symbol("is html");
function Sn(e, t, r, n) {
  var i = ra(e);
  y && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[ei] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Nn(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Rr(e, t, r) {
  var n = E, i = w;
  let a = y;
  y && G(!1), re(null), ue(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (tr.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? Nn(e).includes(t) : r && typeof r == "object") ? e[t] = r : Sn(e, t, r == null ? r : String(r));
  } finally {
    re(n), ue(i), a && G(!0);
  }
}
function ra(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ea]: e.nodeName.includes("-"),
      [ta]: e.namespaceURI === Vn
    })
  );
}
var tr = /* @__PURE__ */ new Map();
function Nn(e) {
  var t = tr.get(e.nodeName);
  if (t) return t;
  tr.set(e.nodeName, t = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = Xn(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = Fr(n);
  }
  return t;
}
const na = () => performance.now(), he = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => na(),
  tasks: /* @__PURE__ */ new Set()
};
function An() {
  const e = he.now();
  he.tasks.forEach((t) => {
    t.c(e) || (he.tasks.delete(t), t.f());
  }), he.tasks.size !== 0 && he.tick(An);
}
function ia(e) {
  let t;
  return he.tasks.size === 0 && he.tick(An), {
    promise: new Promise((r) => {
      he.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      he.tasks.delete(t);
    }
  };
}
function bt(e, t) {
  bn(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function aa(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Mr(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = aa(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const sa = (e) => e;
function On(e, t, r, n) {
  var i = (e & jn) !== 0, a = "both", s, l = t.inert, f = t.style.overflow, o, u;
  function h() {
    return bn(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var d = {
    is_global: i,
    in() {
      t.inert = l, bt(t, "introstart"), o = rr(t, h(), u, 1, () => {
        bt(t, "introend"), o == null || o.abort(), o = s = void 0, t.style.overflow = f;
      });
    },
    out(p) {
      t.inert = !0, bt(t, "outrostart"), u = rr(t, h(), o, 0, () => {
        bt(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      o == null || o.abort(), u == null || u.abort();
    }
  }, c = (
    /** @type {Effect} */
    w
  );
  if ((c.transitions ?? (c.transitions = [])).push(d), Rt) {
    var v = i;
    if (!v) {
      for (var _ = (
        /** @type {Effect | null} */
        c.parent
      ); _ && (_.f & wt) !== 0; )
        for (; (_ = _.parent) && (_.f & st) === 0; )
          ;
      v = !_ || (_.f & It) !== 0;
    }
    v && cn(() => {
      yr(() => d.in());
    });
  }
}
function rr(e, t, r, n, i) {
  var a = n === 1;
  if (Kn(t)) {
    var s, l = !1;
    return pr(() => {
      if (!l) {
        var p = t({ direction: a ? "in" : "out" });
        s = rr(e, p, r, n, i);
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
      abort: ot,
      deactivate: ot,
      reset: ot,
      t: () => n
    };
  const { delay: f = 0, css: o, tick: u, easing: h = sa } = t;
  var d = [];
  if (a && r === void 0 && (u && u(0, 1), o)) {
    var c = Mr(o(0, 1));
    d.push(c, c);
  }
  var v = () => 1 - n, _ = e.animate(d, { duration: f, fill: "forwards" });
  return _.onfinish = () => {
    _.cancel();
    var p = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var k = n - p, x = (
      /** @type {number} */
      t.duration * Math.abs(k)
    ), b = [];
    if (x > 0) {
      var N = !1;
      if (o)
        for (var S = Math.ceil(x / 16.666666666666668), j = 0; j <= S; j += 1) {
          var P = p + k * h(j / S), J = Mr(o(P, 1 - P));
          b.push(J), N || (N = J.overflow === "hidden");
        }
      N && (e.style.overflow = "hidden"), v = () => {
        var O = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return p + k * h(O / x);
      }, u && ia(() => {
        if (_.playState !== "running") return !1;
        var O = v();
        return u(O, 1 - O), !0;
      });
    }
    _ = e.animate(b, { duration: x, fill: "forwards" }), _.onfinish = () => {
      v = () => n, u == null || u(n, 1 - n), i();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = ot);
    },
    deactivate: () => {
      i = ot;
    },
    reset: () => {
      n === 0 && (u == null || u(1, 0));
    },
    t: () => v()
  };
}
function qr(e, t) {
  return e === t || (e == null ? void 0 : e[Et]) === t;
}
function la(e = {}, t, r, n) {
  return cn(() => {
    var i, a;
    return dn(() => {
      i = a, a = [], yr(() => {
        e !== r(...a) && (t(e, ...a), i && qr(r(...i), e) && t(null, ...i));
      });
    }), () => {
      pr(() => {
        a && qr(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function Pe(e, t, r, n) {
  var i = (
    /** @type {V} */
    n
  ), a = !0, s = () => (a && (a = !1, i = /** @type {V} */
  n), i), l;
  l = /** @type {V} */
  e[t], l === void 0 && n !== void 0 && (l = s());
  var f;
  f = () => {
    var d = (
      /** @type {V} */
      e[t]
    );
    return d === void 0 ? s() : (a = !0, d);
  };
  var o = !1, u = /* @__PURE__ */ gr(() => (o = !1, f())), h = (
    /** @type {Effect} */
    w
  );
  return function(d, c) {
    if (arguments.length > 0) {
      const v = c ? $(u) : d;
      return M(u, v), o = !0, i !== void 0 && (i = v), d;
    }
    return Xe && o || (h.f & We) !== 0 ? u.v : $(u);
  };
}
function oa(e) {
  return new fa(e);
}
var ve, Q;
class fa {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    F(this, ve);
    /** @type {Record<string, any>} */
    F(this, Q);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, l) => {
      var f = /* @__PURE__ */ rn(l, !1, !1);
      return r.set(s, f), f;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, l) {
          return $(r.get(l) ?? n(l, Reflect.get(s, l)));
        },
        has(s, l) {
          return l === Qn ? !0 : ($(r.get(l) ?? n(l, Reflect.get(s, l))), Reflect.has(s, l));
        },
        set(s, l, f) {
          return M(r.get(l) ?? n(l, f), f), Reflect.set(s, l, f);
        }
      }
    );
    H(this, Q, (t.hydrate ? Wi : kn)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && ke(), H(this, ve, i.$$events);
    for (const s of Object.keys(g(this, Q)))
      s === "$set" || s === "$destroy" || s === "$on" || nt(this, s, {
        get() {
          return g(this, Q)[s];
        },
        /** @param {any} value */
        set(l) {
          g(this, Q)[s] = l;
        },
        enumerable: !0
      });
    g(this, Q).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, g(this, Q).$destroy = () => {
      Xi(g(this, Q));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    g(this, Q).$set(t);
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
    g(this, Q).$destroy();
  }
}
ve = new WeakMap(), Q = new WeakMap();
let Rn;
typeof HTMLElement == "function" && (Rn = class extends HTMLElement {
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
          i !== "default" && (s.name = i), ce(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = ua(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = xt(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = oa({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Ni(() => {
        dn(() => {
          var i;
          this.$$r = !0;
          for (const a of Tt(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = xt(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = xt(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
function xt(e, t, r, n) {
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
function ua(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Mn(e, t, r, n, i, a) {
  let s = class extends Rn {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Tt(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return Tt(t).forEach((l) => {
    nt(s.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(f) {
        var h;
        f = xt(l, f, t), this.$$d[l] = f;
        var o = this.$$c;
        if (o) {
          var u = (h = Ze(o, l)) == null ? void 0 : h.get;
          u ? o[l] = f : o.$set({ [l]: f });
        }
      }
    });
  }), n.forEach((l) => {
    nt(s.prototype, l, {
      get() {
        var f;
        return (f = this.$$c) == null ? void 0 : f[l];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let Mt = /* @__PURE__ */ X(void 0);
const ca = async () => (M(Mt, await window.loadCardHelpers().then((e) => e), !0), $(Mt)), da = () => $(Mt) ? $(Mt) : ca();
function va(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function qn(e, { delay: t = 0, duration: r = 400, easing: n = va, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, l = i === "y" ? "height" : "width", f = parseFloat(a[l]), o = i === "y" ? ["top", "bottom"] : ["left", "right"], u = o.map(
    (k) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${k[0].toUpperCase()}${k.slice(1)}`
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
    css: (k) => `overflow: hidden;opacity: ${Math.min(k * 20, 1) * s};${l}: ${k * f}px;padding-${o[0]}: ${k * h}px;padding-${o[1]}: ${k * d}px;margin-${o[0]}: ${k * c}px;margin-${o[1]}: ${k * v}px;border-${o[0]}-width: ${k * _}px;border-${o[1]}-width: ${k * p}px;min-${l}: 0`
  };
}
var ha = /* @__PURE__ */ Ge('<span class="loading svelte-1sdlsm">Loading...</span>'), _a = /* @__PURE__ */ Ge('<div class="outer-container"><!> <!></div>');
const pa = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function nr(e, t) {
  vr(t, !0), Cn(e, pa);
  const r = Pe(t, "type", 7, "div"), n = Pe(t, "config"), i = Pe(t, "hass"), a = Pe(t, "marginTop", 7, "0px"), s = Pe(t, "open");
  let l = /* @__PURE__ */ X(void 0), f = /* @__PURE__ */ X(!0);
  Jt(() => {
    $(l) && ($(l).hass = i());
  }), Jt(() => {
    var _, p;
    const v = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    (p = (_ = $(l)) == null ? void 0 : _.setConfig) == null || p.call(_, v);
  }), Tn(async () => {
    const c = await da(), _ = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, p = c.createCardElement(_);
    p.hass = i(), $(l) && ($(l).replaceWith(p), M(l, p, !0), M(f, !1));
  });
  var o = _a(), u = Ie(o);
  Ji(u, r, !1, (c, v) => {
    la(c, (_) => M(l, _, !0), () => $(l)), On(3, c, () => qn);
  });
  var h = kt(u, 2);
  {
    var d = (c) => {
      var v = ha();
      ce(c, v);
    };
    ut(h, (c) => {
      $(f) && c(d);
    });
  }
  return ye(o), be(() => Ee(o, `margin-top: ${(s() ? a() : "0px") ?? ""};`)), ce(e, o), hr({
    get type() {
      return r();
    },
    set type(c = "div") {
      r(c), ke();
    },
    get config() {
      return n();
    },
    set config(c) {
      n(c), ke();
    },
    get hass() {
      return i();
    },
    set hass(c) {
      i(c), ke();
    },
    get marginTop() {
      return a();
    },
    set marginTop(c = "0px") {
      a(c), ke();
    },
    get open() {
      return s();
    },
    set open(c) {
      s(c), ke();
    }
  });
}
customElements.define("expander-sub-card", Mn(nr, { type: {}, config: {}, hass: {}, marginTop: {}, open: {} }, [], [], !0));
function ga(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const ir = {
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
  "icon-rotate-degree": "180deg"
};
var ma = /* @__PURE__ */ Ge('<button aria-label="Toggle button"><ha-icon></ha-icon></button>', 2), wa = /* @__PURE__ */ Ge('<div id="id1"><div id="id2" class="title-card-container svelte-e0q8kg"><!></div> <!></div>'), $a = /* @__PURE__ */ Ge("<button><div> </div> <ha-icon></ha-icon></button>", 2), ya = /* @__PURE__ */ Ge('<div class="children-container svelte-e0q8kg"></div>'), ba = /* @__PURE__ */ Ge("<ha-card><!> <!></ha-card>", 2);
const Ea = {
  hash: "svelte-e0q8kg",
  code: ".expander-card.svelte-e0q8kg {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-e0q8kg {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-e0q8kg {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-e0q8kg {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-e0q8kg {display:block;}.title-card-container.svelte-e0q8kg {width:100%;padding:var(--title-padding);}.header.svelte-e0q8kg {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-e0q8kg {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-e0q8kg {width:100%;text-align:left;}.ico.svelte-e0q8kg {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-e0q8kg {transform:rotate(var(--icon-rotate-degree,180deg));}.ripple.svelte-e0q8kg {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-e0q8kg:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-e0q8kg:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function ka(e, t) {
  var Re, we;
  vr(t, !0), Cn(e, Ea);
  const r = Pe(t, "hass"), n = Pe(t, "config", 7, ir);
  let i = /* @__PURE__ */ X(!1), a = /* @__PURE__ */ X(!1);
  const s = n()["storgage-id"], l = "expander-open-" + s, f = n()["show-button-users"] === void 0 || ((we = n()["show-button-users"]) == null ? void 0 : we.includes((Re = r()) == null ? void 0 : Re.user.name));
  function o() {
    u(!$(a));
  }
  function u(m) {
    if (M(a, m, !0), s !== void 0)
      try {
        localStorage.setItem(l, $(a) ? "true" : "false");
      } catch (T) {
        console.error(T);
      }
  }
  Tn(() => {
    var ne, $e;
    const m = n()["min-width-expanded"], T = n()["max-width-expanded"], A = document.body.offsetWidth;
    if (m && T ? n().expanded = A >= m && A <= T : m ? n().expanded = A >= m : T && (n().expanded = A <= T), ($e = n()["start-expanded-users"]) != null && $e.includes((ne = r()) == null ? void 0 : ne.user.name))
      u(!0);
    else if (s !== void 0)
      try {
        const Y = localStorage.getItem(l);
        Y === null ? n().expanded !== void 0 && u(n().expanded) : M(a, Y ? Y === "true" : $(a), !0);
      } catch (Y) {
        console.error(Y);
      }
    else
      n().expanded !== void 0 && u(n().expanded);
  });
  const h = (m) => {
    if ($(i))
      return m.preventDefault(), m.stopImmediatePropagation(), M(i, !1), !1;
    o();
  }, d = (m) => {
    const T = m.currentTarget;
    T != null && T.classList.contains("title-card-container") && h(m);
  };
  let c, v = !1, _ = 0, p = 0;
  const k = (m) => {
    c = m.target, _ = m.touches[0].clientX, p = m.touches[0].clientY, v = !1;
  }, x = (m) => {
    const T = m.touches[0].clientX, A = m.touches[0].clientY;
    (Math.abs(T - _) > 10 || Math.abs(A - p) > 10) && (v = !0);
  }, b = (m) => {
    !v && c === m.target && n()["title-card-clickable"] && o(), c = void 0, M(i, !0);
  };
  var N = ba(), S = Ie(N);
  {
    var j = (m) => {
      var T = wa(), A = Ie(T);
      A.__touchstart = k, A.__touchmove = x, A.__touchend = b, A.__click = function(...le) {
        var ie;
        (ie = n()["title-card-clickable"] ? d : null) == null || ie.apply(this, le);
      };
      var ne = Ie(A);
      nr(ne, {
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
      }), ye(A);
      var $e = kt(A, 2);
      {
        var Y = (le) => {
          var ie = ma();
          ie.__click = h;
          var Me = Ie(ie);
          be(() => Rr(Me, "icon", n().icon)), ye(ie), be(() => {
            Ee(ie, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), qe(ie, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${$(a) ? " open" : " close"}`, "svelte-e0q8kg"), Ee(Me, `--arrow-color:${n()["arrow-color"] ?? ""}`), qe(Me, 1, `ico${$(a) ? " flipped open" : "close"}`, "svelte-e0q8kg");
          }), ce(le, ie);
        };
        ut($e, (le) => {
          f && le(Y);
        });
      }
      ye(T), be(() => {
        qe(T, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-e0q8kg"), Ee(A, `--title-padding:${n()["title-card-padding"] ?? ""}`), Sn(A, "role", n()["title-card-clickable"] ? "button" : void 0);
      }), ce(m, T);
    }, P = (m) => {
      var T = Ui(), A = Ti(T);
      {
        var ne = ($e) => {
          var Y = $a();
          Y.__click = h;
          var le = Ie(Y), ie = Ie(le, !0);
          ye(le);
          var Me = kt(le, 2);
          be(() => Rr(Me, "icon", n().icon)), ye(Y), be(() => {
            qe(Y, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${$(a) ? " open" : " close"}`, "svelte-e0q8kg"), Ee(Y, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), qe(le, 1, `primary title${$(a) ? " open" : " close"}`, "svelte-e0q8kg"), Bi(ie, n().title), Ee(Me, `--arrow-color:${n()["arrow-color"] ?? ""}`), qe(Me, 1, `ico${$(a) ? " flipped open" : " close"}`, "svelte-e0q8kg");
          }), ce($e, Y);
        };
        ut(A, ($e) => {
          f && $e(ne);
        });
      }
      ce(m, T);
    };
    ut(S, (m) => {
      n()["title-card"] ? m(j) : m(P, !1);
    });
  }
  var J = kt(S, 2);
  {
    var O = (m) => {
      var T = ya();
      zi(T, 20, () => n().cards, (A) => A, (A, ne) => {
        nr(A, {
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
            return $(a);
          }
        });
      }), ye(T), be(() => Ee(T, `--expander-card-display:${n()["expander-card-display"] ?? ""};
             --gap:${($(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${($(a) ? n()["child-padding"] : "0px") ?? ""};`)), On(3, T, () => qn, () => ({ duration: 500, easing: ga })), ce(m, T);
    };
    ut(J, (m) => {
      n().cards && m(O);
    });
  }
  return ye(N), be(() => {
    qe(N, 1, `expander-card${n().clear ? " clear" : ""}${$(a) ? " open" : " close"}`, "svelte-e0q8kg"), Ee(N, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${($(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${$(a) ?? ""};
     --icon-rotate-degree:${n()["icon-rotate-degree"] ?? ""};
     --card-background:${($(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}
    `);
  }), ce(e, N), hr({
    get hass() {
      return r();
    },
    set hass(m) {
      r(m), ke();
    },
    get config() {
      return n();
    },
    set config(m = ir) {
      n(m), ke();
    }
  });
}
Fi(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", Mn(ka, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    D(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...ir, ...r };
  }
}));
const xa = "2.5.5";
console.info(
  `%c  Expander-Card 
%c Version ${xa}`,
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
