var Un = Object.defineProperty;
var xr = (e) => {
  throw TypeError(e);
};
var jn = (e, t, r) => t in e ? Un(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var I = (e, t, r) => jn(e, typeof t != "symbol" ? t + "" : t, r), Vt = (e, t, r) => t.has(e) || xr("Cannot " + r);
var m = (e, t, r) => (Vt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), L = (e, t, r) => t.has(e) ? xr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Y = (e, t, r, n) => (Vt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), Ie = (e, t, r) => (Vt(e, t, "access private method"), r);
const Yn = "5";
var Fr;
typeof window < "u" && ((Fr = window.__svelte ?? (window.__svelte = {})).v ?? (Fr.v = /* @__PURE__ */ new Set())).add(Yn);
const Vn = 1, Bn = 2, Wn = 16, zn = 4, Xn = 1, Gn = 2, qr = "[", lr = "[!", fr = "]", Je = {}, M = Symbol(), Kn = "http://www.w3.org/1999/xhtml", Jn = "http://www.w3.org/2000/svg", Hr = !1;
var ur = Array.isArray, Zn = Array.prototype.indexOf, cr = Array.from, At = Object.keys, it = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, Qn = Object.getOwnPropertyDescriptors, ei = Object.prototype, ti = Array.prototype, Ur = Object.getPrototypeOf, kr = Object.isExtensible;
function ri(e) {
  return typeof e == "function";
}
const lt = () => {
};
function jr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ni() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const G = 2, dr = 4, Yr = 8, ot = 16, me = 32, Ne = 64, Vr = 128, ee = 256, Nt = 512, H = 1024, te = 2048, Oe = 4096, se = 8192, ze = 16384, Dt = 32768, yt = 65536, Cr = 1 << 17, ii = 1 << 18, vr = 1 << 19, Br = 1 << 20, zt = 1 << 21, hr = 1 << 22, He = 1 << 23, xt = Symbol("$state"), ai = Symbol("legacy props"), si = Symbol(""), _r = new class extends Error {
  constructor() {
    super(...arguments);
    I(this, "name", "StaleReactionError");
    I(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), oi = 1, Wr = 3, vt = 8;
function li() {
  throw new Error("https://svelte.dev/e/await_outside_boundary");
}
function fi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ui() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ci(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function di() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function vi(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function hi() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function _i() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function pi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function gi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function mi() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ft(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let k = !1;
function W(e) {
  k = e;
}
let A;
function z(e) {
  if (e === null)
    throw Ft(), Je;
  return A = e;
}
function at() {
  return z(
    /** @type {TemplateNode} */
    /* @__PURE__ */ Re(A)
  );
}
function ye(e) {
  if (k) {
    if (/* @__PURE__ */ Re(A) !== null)
      throw Ft(), Je;
    A = e;
  }
}
function Xt() {
  for (var e = 0, t = A; ; ) {
    if (t.nodeType === vt) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === fr) {
        if (e === 0) return t;
        e -= 1;
      } else (r === qr || r === lr) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Re(t)
    );
    t.remove(), t = n;
  }
}
function zr(e) {
  if (!e || e.nodeType !== vt)
    throw Ft(), Je;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Xr(e) {
  return e === this.v;
}
function wi(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Gr(e) {
  return !wi(e, this.v);
}
let $i = !1, re = null;
function Ot(e) {
  re = e;
}
function pr(e, t = !1, r) {
  re = {
    p: re,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function gr(e) {
  var t = (
    /** @type {ComponentContext} */
    re
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      hn(n);
  }
  return e !== void 0 && (t.x = e), re = t.p, e ?? /** @type {T} */
  {};
}
function Kr() {
  return !0;
}
const yi = /* @__PURE__ */ new WeakMap();
function bi(e) {
  var t = x;
  if (t === null)
    return C.f |= He, e;
  if ((t.f & Dt) === 0) {
    if ((t.f & Vr) === 0)
      throw !t.parent && e instanceof Error && Jr(e), e;
    t.b.error(e);
  } else
    mr(e, t);
}
function mr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Vr) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    t = t.parent;
  }
  throw e instanceof Error && Jr(e), e;
}
function Jr(e) {
  const t = yi.get(e);
  t && (it(e, "message", {
    value: t.message
  }), it(e, "stack", {
    value: t.stack
  }));
}
let ht = [], Gt = [];
function Zr() {
  var e = ht;
  ht = [], jr(e);
}
function Ei() {
  var e = Gt;
  Gt = [], jr(e);
}
function Qr(e) {
  ht.length === 0 && queueMicrotask(Zr), ht.push(e);
}
function xi() {
  ht.length > 0 && Zr(), Gt.length > 0 && Ei();
}
function ki() {
  for (var e = (
    /** @type {Effect} */
    x.b
  ); e !== null && !e.has_pending_snippet(); )
    e = e.parent;
  return e === null && li(), e;
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  var t = G | te, r = C !== null && (C.f & G) !== 0 ? (
    /** @type {Derived} */
    C
  ) : null;
  return x === null || r !== null && (r.f & ee) !== 0 ? t |= ee : x.f |= vr, {
    ctx: re,
    deps: null,
    effects: null,
    equals: Xr,
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
function Ci(e, t) {
  let r = (
    /** @type {Effect | null} */
    x
  );
  r === null && ui();
  var n = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = _t(
    /** @type {V} */
    M
  ), s = null, o = !C;
  return Di(() => {
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
      s = null, _ || u.activate(), h ? h !== _r && (a.f |= He, Zt(a, h)) : ((a.f & He) !== 0 && (a.f ^= He), Zt(a, d)), o && (n.update_pending_count(-1), _ || u.decrement()), rn();
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
function Tr(e) {
  const t = /* @__PURE__ */ qt(e);
  return yn(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ti(e) {
  const t = /* @__PURE__ */ qt(e);
  return t.equals = Gr, t;
}
function en(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      le(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Si(e) {
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
function wr(e) {
  var t, r = x;
  de(Si(e));
  try {
    en(e), t = kn(e);
  } finally {
    de(r);
  }
  return t;
}
function tn(e) {
  var t = wr(e);
  if (e.equals(t) || (e.v = t, e.wv = En()), !Xe)
    if (Te !== null)
      Te.set(e, e.v);
    else {
      var r = (Se || (e.f & ee) !== 0) && e.deps !== null ? Oe : H;
      X(e, r);
    }
}
function Ai(e, t, r) {
  const n = qt;
  if (t.length === 0) {
    r(e.map(n));
    return;
  }
  var i = O, a = (
    /** @type {Effect} */
    x
  ), s = Ni(), o = ki();
  Promise.all(t.map((l) => /* @__PURE__ */ Ci(l))).then((l) => {
    i == null || i.activate(), s();
    try {
      r([...e.map(n), ...l]);
    } catch (f) {
      (a.f & ze) === 0 && mr(f, a);
    }
    i == null || i.deactivate(), rn();
  }).catch((l) => {
    o.error(l);
  });
}
function Ni() {
  var e = x, t = C, r = re;
  return function() {
    de(e), ne(t), Ot(r);
  };
}
function rn() {
  de(null), ne(null), Ot(null);
}
const ft = /* @__PURE__ */ new Set();
let O = null, Te = null, Sr = /* @__PURE__ */ new Set(), Rt = [];
function nn() {
  const e = (
    /** @type {() => void} */
    Rt.shift()
  );
  Rt.length > 0 && queueMicrotask(nn), e();
}
let Ve = [], Ht = null, Kt = !1, kt = !1;
var et, tt, ke, gt, mt, Fe, rt, qe, Ce, nt, wt, $t, oe, an, Ct, Jt;
const Lt = class Lt {
  constructor() {
    L(this, oe);
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
    L(this, qe, []);
    /**
     * The same as `#render_effects`, but for `$effect` (which runs after)
     * @type {Effect[]}
     */
    L(this, Ce, []);
    /**
     * Block effects, which may need to re-run on subsequent flushes
     * in order to update internal sources (e.g. each block items)
     * @type {Effect[]}
     */
    L(this, nt, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Effect[]}
     */
    L(this, wt, []);
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Effect[]}
     */
    L(this, $t, []);
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
    Ve = [];
    var r = null;
    if (ft.size > 1) {
      r = /* @__PURE__ */ new Map(), Te = /* @__PURE__ */ new Map();
      for (const [s, o] of this.current)
        r.set(s, { v: s.v, wv: s.wv }), s.v = o;
      for (const s of ft)
        if (s !== this)
          for (const [o, l] of m(s, et))
            r.has(o) || (r.set(o, { v: o.v, wv: o.wv }), o.v = l);
    }
    for (const s of t)
      Ie(this, oe, an).call(this, s);
    if (m(this, Fe).length === 0 && m(this, ke) === 0) {
      Ie(this, oe, Jt).call(this);
      var n = m(this, qe), i = m(this, Ce);
      Y(this, qe, []), Y(this, Ce, []), Y(this, nt, []), O = null, Ar(n), Ar(i), O === null ? O = this : ft.delete(this), (a = m(this, gt)) == null || a.resolve();
    } else
      Ie(this, oe, Ct).call(this, m(this, qe)), Ie(this, oe, Ct).call(this, m(this, Ce)), Ie(this, oe, Ct).call(this, m(this, nt));
    if (r) {
      for (const [s, { v: o, wv: l }] of r)
        s.wv <= l && (s.v = o);
      Te = null;
    }
    for (const s of m(this, Fe))
      dt(s);
    for (const s of m(this, rt))
      dt(s);
    Y(this, Fe, []), Y(this, rt, []);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    m(this, et).has(t) || m(this, et).set(t, r), this.current.set(t, t.v);
  }
  activate() {
    O = this;
  }
  deactivate() {
    O = null;
    for (const t of Sr)
      if (Sr.delete(t), t(), O !== null)
        break;
  }
  neuter() {
    Y(this, mt, !0);
  }
  flush() {
    Ve.length > 0 ? sn() : Ie(this, oe, Jt).call(this), O === this && (m(this, ke) === 0 && ft.delete(this), this.deactivate());
  }
  increment() {
    Y(this, ke, m(this, ke) + 1);
  }
  decrement() {
    if (Y(this, ke, m(this, ke) - 1), m(this, ke) === 0) {
      for (const t of m(this, wt))
        X(t, te), Be(t);
      for (const t of m(this, $t))
        X(t, Oe), Be(t);
      Y(this, qe, []), Y(this, Ce, []), this.flush();
    } else
      this.deactivate();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    m(this, tt).add(t);
  }
  settled() {
    return (m(this, gt) ?? Y(this, gt, ni())).promise;
  }
  static ensure() {
    if (O === null) {
      const t = O = new Lt();
      ft.add(O), kt || Lt.enqueue(() => {
        O === t && t.flush();
      });
    }
    return O;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Rt.length === 0 && queueMicrotask(nn), Rt.unshift(t);
  }
};
et = new WeakMap(), tt = new WeakMap(), ke = new WeakMap(), gt = new WeakMap(), mt = new WeakMap(), Fe = new WeakMap(), rt = new WeakMap(), qe = new WeakMap(), Ce = new WeakMap(), nt = new WeakMap(), wt = new WeakMap(), $t = new WeakMap(), oe = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 */
an = function(t) {
  var u;
  t.f ^= H;
  for (var r = t.first; r !== null; ) {
    var n = r.f, i = (n & (me | Ne)) !== 0, a = i && (n & H) !== 0, s = a || (n & se) !== 0 || this.skipped_effects.has(r);
    if (!s && r.fn !== null) {
      if (i)
        r.f ^= H;
      else if ((n & H) === 0)
        if ((n & dr) !== 0)
          m(this, Ce).push(r);
        else if ((n & hr) !== 0) {
          var o = (u = r.b) != null && u.pending ? m(this, rt) : m(this, Fe);
          o.push(r);
        } else Yt(r) && ((r.f & ot) !== 0 && m(this, nt).push(r), dt(r));
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
 * @param {Effect[]} effects
 */
Ct = function(t) {
  for (const r of t)
    ((r.f & te) !== 0 ? m(this, wt) : m(this, $t)).push(r), X(r, H);
  t.length = 0;
}, /**
 * Append and remove branches to/from the DOM
 */
Jt = function() {
  if (!m(this, mt))
    for (const t of m(this, tt))
      t();
  m(this, tt).clear();
};
let st = Lt;
function ve(e) {
  var t = kt;
  kt = !0;
  try {
    for (var r; ; ) {
      if (xi(), Ve.length === 0 && (O == null || O.flush(), Ve.length === 0))
        return Ht = null, /** @type {T} */
        r;
      sn();
    }
  } finally {
    kt = t;
  }
}
function sn() {
  var e = Qe;
  Kt = !0;
  try {
    var t = 0;
    for (Or(!0); Ve.length > 0; ) {
      var r = st.ensure();
      if (t++ > 1e3) {
        var n, i;
        Oi();
      }
      r.process(Ve), Ue.clear();
    }
  } finally {
    Kt = !1, Or(e), Ht = null;
  }
}
function Oi() {
  try {
    hi();
  } catch (e) {
    mr(e, Ht);
  }
}
function Ar(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (ze | se)) === 0 && Yt(n)) {
        var i = O ? O.current.size : 0;
        if (dt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null && n.ac === null ? mn(n) : n.fn = null), O !== null && O.current.size > i && (n.f & Br) !== 0)
          break;
      }
    }
    for (; r < t; )
      Be(e[r++]);
  }
}
function Be(e) {
  for (var t = Ht = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Kt && t === x && (r & ot) !== 0)
      return;
    if ((r & (Ne | me)) !== 0) {
      if ((r & H) === 0) return;
      t.f ^= H;
    }
  }
  Ve.push(t);
}
const Ue = /* @__PURE__ */ new Map();
function _t(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Xr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  const r = _t(e);
  return yn(r), r;
}
// @__NO_SIDE_EFFECTS__
function on(e, t = !1, r = !0) {
  const n = _t(e);
  return t || (n.equals = Gr), n;
}
function P(e, t, r = !1) {
  C !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!ce || (C.f & Cr) !== 0) && Kr() && (C.f & (G | ot | hr | Cr)) !== 0 && !(U != null && U.includes(e)) && mi();
  let n = r ? ut(t) : t;
  return Zt(e, n);
}
function Zt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Xe ? Ue.set(e, t) : Ue.set(e, r), e.v = t;
    var n = st.ensure();
    n.capture(e, r), (e.f & G) !== 0 && ((e.f & te) !== 0 && wr(
      /** @type {Derived} */
      e
    ), X(e, (e.f & ee) === 0 ? H : Oe)), e.wv = En(), ln(e, te), x !== null && (x.f & H) !== 0 && (x.f & (me | Ne)) === 0 && (Z === null ? Hi([e]) : Z.push(e));
  }
  return t;
}
function Bt(e) {
  P(e, e.v + 1);
}
function ln(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f, o = (s & te) === 0;
      o && X(a, t), (s & G) !== 0 ? ln(
        /** @type {Derived} */
        a,
        Oe
      ) : o && Be(
        /** @type {Effect} */
        a
      );
    }
}
function ut(e) {
  if (typeof e != "object" || e === null || xt in e)
    return e;
  const t = Ur(e);
  if (t !== ei && t !== ti)
    return e;
  var r = /* @__PURE__ */ new Map(), n = ur(e), i = /* @__PURE__ */ B(0), a = je, s = (o) => {
    if (je === a)
      return o();
    var l = C, f = je;
    ne(null), Mr(a);
    var u = o();
    return ne(l), Mr(f), u;
  };
  return n && r.set("length", /* @__PURE__ */ B(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && pi();
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
            r.set(l, u), Bt(i);
          }
        } else
          P(f, M), Bt(i);
        return !0;
      },
      get(o, l, f) {
        var d;
        if (l === xt)
          return e;
        var u = r.get(l), _ = l in o;
        if (u === void 0 && (!_ || (d = Ze(o, l)) != null && d.writable) && (u = s(() => {
          var h = ut(_ ? o[l] : M), v = /* @__PURE__ */ B(h);
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
        if (l === xt)
          return !0;
        var f = r.get(l), u = f !== void 0 && f.v !== M || Reflect.has(o, l);
        if (f !== void 0 || x !== null && (!u || (c = Ze(o, l)) != null && c.writable)) {
          f === void 0 && (f = s(() => {
            var d = u ? ut(o[l]) : M, h = /* @__PURE__ */ B(d);
            return h;
          }), r.set(l, f));
          var _ = E(f);
          if (_ === M)
            return !1;
        }
        return u;
      },
      set(o, l, f, u) {
        var $;
        var _ = r.get(l), c = l in o;
        if (n && l === "length")
          for (var d = f; d < /** @type {Source<number>} */
          _.v; d += 1) {
            var h = r.get(d + "");
            h !== void 0 ? P(h, M) : d in o && (h = s(() => /* @__PURE__ */ B(M)), r.set(d + "", h));
          }
        if (_ === void 0)
          (!c || ($ = Ze(o, l)) != null && $.writable) && (_ = s(() => /* @__PURE__ */ B(void 0)), P(_, ut(f)), r.set(l, _));
        else {
          c = _.v !== M;
          var v = s(() => ut(f));
          P(_, v);
        }
        var p = Reflect.getOwnPropertyDescriptor(o, l);
        if (p != null && p.set && p.set.call(u, f), !c) {
          if (n && typeof l == "string") {
            var g = (
              /** @type {Source<number>} */
              r.get("length")
            ), y = Number(l);
            Number.isInteger(y) && y >= g.v && P(g, y + 1);
          }
          Bt(i);
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
        gi();
      }
    }
  );
}
var Nr, fn, un, cn;
function Qt() {
  if (Nr === void 0) {
    Nr = window, fn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    un = Ze(t, "firstChild").get, cn = Ze(t, "nextSibling").get, kr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), kr(r) && (r.__t = void 0);
  }
}
function ge(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ae(e) {
  return un.call(e);
}
// @__NO_SIDE_EFFECTS__
function Re(e) {
  return cn.call(e);
}
function De(e, t) {
  if (!k)
    return /* @__PURE__ */ Ae(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ Ae(A)
  );
  if (r === null)
    r = A.appendChild(ge());
  else if (t && r.nodeType !== Wr) {
    var n = ge();
    return r == null || r.before(n), z(n), n;
  }
  return z(r), r;
}
function Ri(e, t) {
  if (!k) {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Ae(
        /** @type {Node} */
        e
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Re(r) : r;
  }
  return A;
}
function Tt(e, t = 1, r = !1) {
  let n = k ? A : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ Re(n);
  if (!k)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== Wr) {
    var a = ge();
    return n === null ? i == null || i.after(a) : n.before(a), z(a), a;
  }
  return z(n), /** @type {TemplateNode} */
  n;
}
function dn(e) {
  e.textContent = "";
}
function vn() {
  return !1;
}
function Mi(e) {
  x === null && C === null && vi(), C !== null && (C.f & ee) !== 0 && x === null && di(), Xe && ci();
}
function Pi(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function we(e, t, r, n = !0) {
  var i = x;
  i !== null && (i.f & se) !== 0 && (e |= se);
  var a = {
    ctx: re,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | te,
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
      dt(a), a.f |= Dt;
    } catch (l) {
      throw le(a), l;
    }
  else t !== null && Be(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & vr) === 0;
  if (!s && n && (i !== null && Pi(a, i), C !== null && (C.f & G) !== 0 && (e & Ne) === 0)) {
    var o = (
      /** @type {Derived} */
      C
    );
    (o.effects ?? (o.effects = [])).push(a);
  }
  return a;
}
function er(e) {
  Mi();
  var t = (
    /** @type {Effect} */
    x.f
  ), r = !C && (t & me) !== 0 && (t & Dt) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      re
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return hn(e);
}
function hn(e) {
  return we(dr | Br, e, !1);
}
function Ii(e) {
  st.ensure();
  const t = we(Ne, e, !0);
  return () => {
    le(t);
  };
}
function Li(e) {
  st.ensure();
  const t = we(Ne, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Ut(t, () => {
      le(t), n(void 0);
    }) : (le(t), n(void 0));
  });
}
function $r(e) {
  return we(dr, e, !1);
}
function Di(e) {
  return we(hr | vr, e, !0);
}
function _n(e, t = 0) {
  return we(Yr | t, e, !0);
}
function be(e, t = [], r = []) {
  Ai(t, r, (n) => {
    we(Yr, () => e(...n.map(E)), !0);
  });
}
function yr(e, t = 0) {
  var r = we(ot | t, e, !0);
  return r;
}
function We(e, t = !0) {
  return we(me, e, !0, t);
}
function pn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Xe, n = C;
    Rr(!0), ne(null);
    try {
      t.call(null);
    } finally {
      Rr(r), ne(n);
    }
  }
}
function gn(e, t = !1) {
  var i;
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    (i = r.ac) == null || i.abort(_r);
    var n = r.next;
    (r.f & Ne) !== 0 ? r.parent = null : le(r, t), r = n;
  }
}
function Fi(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & me) === 0 && le(t), t = r;
  }
}
function le(e, t = !0) {
  var r = !1;
  (t || (e.f & ii) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (qi(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), gn(e, t && !r), Mt(e, 0), X(e, ze);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  pn(e);
  var i = e.parent;
  i !== null && i.first !== null && mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function qi(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Re(e)
    );
    e.remove(), e = r;
  }
}
function mn(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Ut(e, t) {
  var r = [];
  br(e, r, !0), wn(r, () => {
    le(e), t && t();
  });
}
function wn(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function br(e, t, r) {
  if ((e.f & se) === 0) {
    if (e.f ^= se, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & yt) !== 0 || (n.f & me) !== 0;
      br(n, t, a ? r : !1), n = i;
    }
  }
}
function jt(e) {
  $n(e, !0);
}
function $n(e, t) {
  if ((e.f & se) !== 0) {
    e.f ^= se, (e.f & H) === 0 && (X(e, te), Be(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & yt) !== 0 || (r.f & me) !== 0;
      $n(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let Qe = !1;
function Or(e) {
  Qe = e;
}
let Xe = !1;
function Rr(e) {
  Xe = e;
}
let C = null, ce = !1;
function ne(e) {
  C = e;
}
let x = null;
function de(e) {
  x = e;
}
let U = null;
function yn(e) {
  C !== null && (U === null ? U = [e] : U.push(e));
}
let q = null, V = 0, Z = null;
function Hi(e) {
  Z = e;
}
let bn = 1, pt = 0, je = pt;
function Mr(e) {
  je = e;
}
let Se = !1;
function En() {
  return ++bn;
}
function Yt(e) {
  var _;
  var t = e.f;
  if ((t & te) !== 0)
    return !0;
  if ((t & Oe) !== 0) {
    var r = e.deps, n = (t & ee) !== 0;
    if (r !== null) {
      var i, a, s = (t & Nt) !== 0, o = n && x !== null && !Se, l = r.length;
      if ((s || o) && (x === null || (x.f & ze) === 0)) {
        var f = (
          /** @type {Derived} */
          e
        ), u = f.parent;
        for (i = 0; i < l; i++)
          a = r[i], (s || !((_ = a == null ? void 0 : a.reactions) != null && _.includes(f))) && (a.reactions ?? (a.reactions = [])).push(f);
        s && (f.f ^= Nt), o && u !== null && (u.f & ee) === 0 && (f.f ^= ee);
      }
      for (i = 0; i < l; i++)
        if (a = r[i], Yt(
          /** @type {Derived} */
          a
        ) && tn(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || x !== null && !Se) && X(e, H);
  }
  return !1;
}
function xn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(U != null && U.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & G) !== 0 ? xn(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? X(a, te) : (a.f & H) !== 0 && X(a, Oe), Be(
        /** @type {Effect} */
        a
      ));
    }
}
function kn(e) {
  var h;
  var t = q, r = V, n = Z, i = C, a = Se, s = U, o = re, l = ce, f = je, u = e.f;
  q = /** @type {null | Value[]} */
  null, V = 0, Z = null, Se = (u & ee) !== 0 && (ce || !Qe || C === null), C = (u & (me | Ne)) === 0 ? e : null, U = null, Ot(e.ctx), ce = !1, je = ++pt, e.ac !== null && (e.ac.abort(_r), e.ac = null);
  try {
    e.f |= zt;
    var _ = (
      /** @type {Function} */
      (0, e.fn)()
    ), c = e.deps;
    if (q !== null) {
      var d;
      if (Mt(e, V), c !== null && V > 0)
        for (c.length = V + q.length, d = 0; d < q.length; d++)
          c[V + d] = q[d];
      else
        e.deps = c = q;
      if (!Se || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (u & G) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (d = V; d < c.length; d++)
          ((h = c[d]).reactions ?? (h.reactions = [])).push(e);
    } else c !== null && V < c.length && (Mt(e, V), c.length = V);
    if (Kr() && Z !== null && !ce && c !== null && (e.f & (G | Oe | te)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      Z.length; d++)
        xn(
          Z[d],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (pt++, Z !== null && (n === null ? n = Z : n.push(.../** @type {Source[]} */
    Z))), (e.f & He) !== 0 && (e.f ^= He), _;
  } catch (v) {
    return bi(v);
  } finally {
    e.f ^= zt, q = t, V = r, Z = n, C = i, Se = a, U = s, Ot(o), ce = l, je = f;
  }
}
function Ui(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Zn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & G) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (q === null || !q.includes(t)) && (X(t, Oe), (t.f & (ee | Nt)) === 0 && (t.f ^= Nt), en(
    /** @type {Derived} **/
    t
  ), Mt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Mt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Ui(e, r[n]);
}
function dt(e) {
  var t = e.f;
  if ((t & ze) === 0) {
    X(e, H);
    var r = x, n = Qe;
    x = e, Qe = !0;
    try {
      (t & ot) !== 0 ? Fi(e) : gn(e), pn(e);
      var i = kn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = bn;
      var a;
      Hr && $i && (e.f & te) !== 0 && e.deps;
    } finally {
      Qe = n, x = r;
    }
  }
}
function E(e) {
  var t = e.f, r = (t & G) !== 0;
  if (C !== null && !ce) {
    var n = x !== null && (x.f & ze) !== 0;
    if (!n && !(U != null && U.includes(e))) {
      var i = C.deps;
      if ((C.f & zt) !== 0)
        e.rv < pt && (e.rv = pt, q === null && i !== null && i[V] === e ? V++ : q === null ? q = [e] : (!Se || !q.includes(e)) && q.push(e));
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
  if (Xe) {
    if (Ue.has(e))
      return Ue.get(e);
    if (r) {
      s = /** @type {Derived} */
      e;
      var l = s.v;
      return ((s.f & H) === 0 && s.reactions !== null || Cn(s)) && (l = wr(s)), Ue.set(s, l), l;
    }
  } else if (r) {
    if (s = /** @type {Derived} */
    e, Te != null && Te.has(s))
      return Te.get(s);
    Yt(s) && tn(s);
  }
  if ((e.f & He) !== 0)
    throw e.v;
  return e.v;
}
function Cn(e) {
  if (e.v === M) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Ue.has(t) || (t.f & G) !== 0 && Cn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Er(e) {
  var t = ce;
  try {
    return ce = !0, e();
  } finally {
    ce = t;
  }
}
const ji = -7169;
function X(e, t) {
  e.f = e.f & ji | t;
}
function Tn(e) {
  var t = C, r = x;
  ne(null), de(null);
  try {
    return e();
  } finally {
    ne(t), de(r);
  }
}
const Sn = /* @__PURE__ */ new Set(), tr = /* @__PURE__ */ new Set();
function Yi(e) {
  for (var t = 0; t < e.length; t++)
    Sn.add(e[t]);
  for (var r of tr)
    r(e);
}
function bt(e) {
  var y;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((y = e.composedPath) == null ? void 0 : y.call(e)) || [], a = (
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
    it(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var u = C, _ = x;
    ne(null), de(null);
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
            if (ur(v)) {
              var [p, ...g] = v;
              p.apply(a, [e, ...g]);
            } else
              v.call(a, e);
        } catch ($) {
          c ? d.push($) : c = $;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        a = h;
      }
      if (c) {
        for (let $ of d)
          queueMicrotask(() => {
            throw $;
          });
        throw c;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ne(u), de(_);
    }
  }
}
function Vi(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ye(e, t) {
  var r = (
    /** @type {Effect} */
    x
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Ge(e, t) {
  var r = (t & Xn) !== 0, n = (t & Gn) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (k)
      return Ye(A, null), A;
    i === void 0 && (i = Vi(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ Ae(i)));
    var s = (
      /** @type {TemplateNode} */
      n || fn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ae(s)
      ), l = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ye(o, l);
    } else
      Ye(s, s);
    return s;
  };
}
function Bi() {
  if (k)
    return Ye(A, null), A;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = ge();
  return e.append(t, r), Ye(t, r), e;
}
function he(e, t) {
  if (k) {
    x.nodes_end = A, at();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Wi = ["touchstart", "touchmove"];
function zi(e) {
  return Wi.includes(e);
}
const Xi = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Gi(e) {
  return Xi.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let Pt = !0;
function Pr(e) {
  Pt = e;
}
function Ki(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function An(e, t) {
  return Nn(e, t);
}
function Ji(e, t) {
  Qt(), t.intro = t.intro ?? !1;
  const r = t.target, n = k, i = A;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ae(r)
    ); a && (a.nodeType !== vt || /** @type {Comment} */
    a.data !== qr); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ Re(a);
    if (!a)
      throw Je;
    W(!0), z(
      /** @type {Comment} */
      a
    ), at();
    const s = Nn(e, { ...t, anchor: a });
    if (A === null || A.nodeType !== vt || /** @type {Comment} */
    A.data !== fr)
      throw Ft(), Je;
    return W(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Je)
      return t.recover === !1 && _i(), Qt(), dn(r), W(!1), An(e, t);
    throw s;
  } finally {
    W(n), z(i);
  }
}
const Ke = /* @__PURE__ */ new Map();
function Nn(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  Qt();
  var o = /* @__PURE__ */ new Set(), l = (_) => {
    for (var c = 0; c < _.length; c++) {
      var d = _[c];
      if (!o.has(d)) {
        o.add(d);
        var h = zi(d);
        t.addEventListener(d, bt, { passive: h });
        var v = Ke.get(d);
        v === void 0 ? (document.addEventListener(d, bt, { passive: h }), Ke.set(d, 1)) : Ke.set(d, v + 1);
      }
    }
  };
  l(cr(Sn)), tr.add(l);
  var f = void 0, u = Li(() => {
    var _ = r ?? t.appendChild(ge());
    return We(() => {
      if (a) {
        pr({});
        var c = (
          /** @type {ComponentContext} */
          re
        );
        c.c = a;
      }
      i && (n.$$events = i), k && Ye(
        /** @type {TemplateNode} */
        _,
        null
      ), Pt = s, f = e(_, n) || {}, Pt = !0, k && (x.nodes_end = A), a && gr();
    }), () => {
      var h;
      for (var c of o) {
        t.removeEventListener(c, bt);
        var d = (
          /** @type {number} */
          Ke.get(c)
        );
        --d === 0 ? (document.removeEventListener(c, bt), Ke.delete(c)) : Ke.set(c, d);
      }
      tr.delete(l), _ !== r && ((h = _.parentNode) == null || h.removeChild(_));
    };
  });
  return rr.set(f, u), f;
}
let rr = /* @__PURE__ */ new WeakMap();
function Zi(e, t) {
  const r = rr.get(e);
  return r ? (rr.delete(e), r(t)) : Promise.resolve();
}
function On(e) {
  re === null && fi(), er(() => {
    const t = Er(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function ct(e, t, r = !1) {
  k && at();
  var n = e, i = null, a = null, s = M, o = r ? yt : 0, l = !1;
  const f = (d, h = !0) => {
    l = !0, c(h, d);
  };
  var u = null;
  function _() {
    u !== null && (u.lastChild.remove(), n.before(u), u = null);
    var d = s ? i : a, h = s ? a : i;
    d && jt(d), h && Ut(h, () => {
      s ? a = null : i = null;
    });
  }
  const c = (d, h) => {
    if (s === (s = d)) return;
    let v = !1;
    if (k) {
      const b = zr(n) === lr;
      !!s === b && (n = Xt(), z(n), W(!1), v = !0);
    }
    var p = vn(), g = n;
    if (p && (u = document.createDocumentFragment(), u.append(g = ge())), s ? i ?? (i = h && We(() => h(g))) : a ?? (a = h && We(() => h(g))), p) {
      var y = (
        /** @type {Batch} */
        O
      ), $ = s ? i : a, T = s ? a : i;
      $ && y.skipped_effects.delete($), T && y.skipped_effects.add(T), y.add_callback(_);
    } else
      _();
    v && W(!0);
  };
  yr(() => {
    l = !1, t(f), l || c(null, null);
  }, o), k && (n = A);
}
function Qi(e, t, r) {
  for (var n = e.items, i = [], a = t.length, s = 0; s < a; s++)
    br(t[s].e, i, !0);
  var o = a > 0 && i.length === 0 && r !== null;
  if (o) {
    var l = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    dn(l), l.append(
      /** @type {Element} */
      r
    ), n.clear(), ue(e, t[0].prev, t[a - 1].next);
  }
  wn(i, () => {
    for (var f = 0; f < a; f++) {
      var u = t[f];
      o || (n.delete(u.k), ue(e, u.prev, u.next)), le(u.e, !o);
    }
  });
}
function ea(e, t, r, n, i, a = null) {
  var s = e, o = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var l = (
      /** @type {Element} */
      e
    );
    s = k ? z(
      /** @type {Comment | Text} */
      /* @__PURE__ */ Ae(l)
    ) : l.appendChild(ge());
  }
  k && at();
  var f = null, u = !1, _ = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ Ti(() => {
    var p = r();
    return ur(p) ? p : p == null ? [] : cr(p);
  }), d, h;
  function v() {
    ta(
      h,
      d,
      o,
      _,
      s,
      i,
      t,
      n,
      r
    ), a !== null && (d.length === 0 ? f ? jt(f) : f = We(() => a(s)) : f !== null && Ut(f, () => {
      f = null;
    }));
  }
  yr(() => {
    h ?? (h = /** @type {Effect} */
    x), d = E(c);
    var p = d.length;
    if (u && p === 0)
      return;
    u = p === 0;
    let g = !1;
    if (k) {
      var y = zr(s) === lr;
      y !== (p === 0) && (s = Xt(), z(s), W(!1), g = !0);
    }
    if (k) {
      for (var $ = null, T, b = 0; b < p; b++) {
        if (A.nodeType === vt && /** @type {Comment} */
        A.data === fr) {
          s = /** @type {Comment} */
          A, g = !0, W(!1);
          break;
        }
        var D = d[b], F = n(D, b);
        T = nr(
          A,
          o,
          $,
          null,
          D,
          F,
          b,
          i,
          t,
          r
        ), o.items.set(F, T), $ = T;
      }
      p > 0 && z(Xt());
    }
    if (k)
      p === 0 && a && (f = We(() => a(s)));
    else if (vn()) {
      var K = /* @__PURE__ */ new Set(), R = (
        /** @type {Batch} */
        O
      );
      for (b = 0; b < p; b += 1) {
        D = d[b], F = n(D, b);
        var Me = o.items.get(F) ?? _.get(F);
        Me || (T = nr(
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
      for (const [$e, w] of o.items)
        K.has($e) || R.skipped_effects.add(w.e);
      R.add_callback(v);
    } else
      v();
    g && W(!0), E(c);
  }), k && (s = A);
}
function ta(e, t, r, n, i, a, s, o, l) {
  var f = t.length, u = r.items, _ = r.first, c = _, d, h = null, v = [], p = [], g, y, $, T;
  for (T = 0; T < f; T += 1) {
    if (g = t[T], y = o(g, T), $ = u.get(y), $ === void 0) {
      var b = n.get(y);
      if (b !== void 0) {
        n.delete(y), u.set(y, b);
        var D = h ? h.next : c;
        ue(r, h, b), ue(r, b, D), Wt(b, D, i), h = b;
      } else {
        var F = c ? (
          /** @type {TemplateNode} */
          c.e.nodes_start
        ) : i;
        h = nr(
          F,
          r,
          h,
          h === null ? r.first : h.next,
          g,
          y,
          T,
          a,
          s,
          l
        );
      }
      u.set(y, h), v = [], p = [], c = h.next;
      continue;
    }
    if (($.e.f & se) !== 0 && jt($.e), $ !== c) {
      if (d !== void 0 && d.has($)) {
        if (v.length < p.length) {
          var K = p[0], R;
          h = K.prev;
          var Me = v[0], $e = v[v.length - 1];
          for (R = 0; R < v.length; R += 1)
            Wt(v[R], K, i);
          for (R = 0; R < p.length; R += 1)
            d.delete(p[R]);
          ue(r, Me.prev, $e.next), ue(r, h, Me), ue(r, $e, K), c = K, h = $e, T -= 1, v = [], p = [];
        } else
          d.delete($), Wt($, c, i), ue(r, $.prev, $.next), ue(r, $, h === null ? r.first : h.next), ue(r, h, $), h = $;
        continue;
      }
      for (v = [], p = []; c !== null && c.k !== y; )
        (c.e.f & se) === 0 && (d ?? (d = /* @__PURE__ */ new Set())).add(c), p.push(c), c = c.next;
      if (c === null)
        continue;
      $ = c;
    }
    v.push($), h = $, c = $.next;
  }
  if (c !== null || d !== void 0) {
    for (var w = d === void 0 ? [] : cr(d); c !== null; )
      (c.e.f & se) === 0 && w.push(c), c = c.next;
    var S = w.length;
    if (S > 0) {
      var N = f === 0 ? i : null;
      Qi(r, w, N);
    }
  }
  e.first = r.first && r.first.e, e.last = h && h.e;
  for (var ie of n.values())
    le(ie.e);
  n.clear();
}
function nr(e, t, r, n, i, a, s, o, l, f, u) {
  var _ = (l & Vn) !== 0, c = (l & Wn) === 0, d = _ ? c ? /* @__PURE__ */ on(i, !1, !1) : _t(i) : i, h = (l & Bn) === 0 ? s : _t(s), v = {
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
      p.append(e = ge());
    }
    return v.e = We(() => o(
      /** @type {Node} */
      e,
      d,
      h,
      f
    ), k), v.e.prev = r && r.e, v.e.next = n && n.e, r === null ? u || (t.first = v) : (r.next = v, r.e.next = v.e), n !== null && (n.prev = v, n.e.prev = v.e), v;
  } finally {
  }
}
function Wt(e, t, r) {
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
      /* @__PURE__ */ Re(a)
    );
    i.before(a), a = s;
  }
}
function ue(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function ra(e, t, r, n, i, a) {
  let s = k;
  k && at();
  var o, l, f = null;
  k && A.nodeType === oi && (f = /** @type {Element} */
  A, at());
  var u = (
    /** @type {TemplateNode} */
    k ? A : e
  ), _;
  yr(() => {
    const c = t() || null;
    var d = c === "svg" ? Jn : null;
    c !== o && (_ && (c === null ? Ut(_, () => {
      _ = null, l = null;
    }) : c === l ? jt(_) : (le(_), Pr(!1))), c && c !== l && (_ = We(() => {
      if (f = k ? (
        /** @type {Element} */
        f
      ) : d ? document.createElementNS(d, c) : document.createElement(c), Ye(f, f), n) {
        k && Gi(c) && f.append(document.createComment(""));
        var h = (
          /** @type {TemplateNode} */
          k ? /* @__PURE__ */ Ae(f) : f.appendChild(ge())
        );
        k && (h === null ? W(!1) : z(h)), n(f, h);
      }
      x.nodes_end = f, u.before(f);
    })), o = c, o && (l = o), Pr(!0));
  }, yt), s && (W(!0), z(u));
}
function Rn(e, t) {
  $r(() => {
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
function na(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function ia(e, t) {
  return e == null ? null : String(e);
}
function Le(e, t, r, n, i, a) {
  var s = e.__className;
  if (k || s !== r || s === void 0) {
    var o = na(r, n);
    (!k || o !== e.getAttribute("class")) && (o == null ? e.removeAttribute("class") : e.className = o), e.__className = r;
  }
  return a;
}
function Ee(e, t, r, n) {
  var i = e.__style;
  if (k || i !== t) {
    var a = ia(t);
    (!k || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const aa = Symbol("is custom element"), sa = Symbol("is html");
function Mn(e, t, r, n) {
  var i = oa(e);
  k && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[si] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Pn(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Ir(e, t, r) {
  var n = C, i = x;
  let a = k;
  k && W(!1), ne(null), de(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (ir.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? Pn(e).includes(t) : r && typeof r == "object") ? e[t] = r : Mn(e, t, r == null ? r : String(r));
  } finally {
    ne(n), de(i), a && W(!0);
  }
}
function oa(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [aa]: e.nodeName.includes("-"),
      [sa]: e.namespaceURI === Kn
    })
  );
}
var ir = /* @__PURE__ */ new Map();
function Pn(e) {
  var t = ir.get(e.nodeName);
  if (t) return t;
  ir.set(e.nodeName, t = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = Qn(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = Ur(n);
  }
  return t;
}
const la = () => performance.now(), pe = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => la(),
  tasks: /* @__PURE__ */ new Set()
};
function In() {
  const e = pe.now();
  pe.tasks.forEach((t) => {
    t.c(e) || (pe.tasks.delete(t), t.f());
  }), pe.tasks.size !== 0 && pe.tick(In);
}
function fa(e) {
  let t;
  return pe.tasks.size === 0 && pe.tick(In), {
    promise: new Promise((r) => {
      pe.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      pe.tasks.delete(t);
    }
  };
}
function Et(e, t) {
  Tn(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function ua(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Lr(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = ua(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const ca = (e) => e;
function Ln(e, t, r, n) {
  var i = (e & zn) !== 0, a = "both", s, o = t.inert, l = t.style.overflow, f, u;
  function _() {
    return Tn(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var c = {
    is_global: i,
    in() {
      t.inert = o, Et(t, "introstart"), f = ar(t, _(), u, 1, () => {
        Et(t, "introend"), f == null || f.abort(), f = s = void 0, t.style.overflow = l;
      });
    },
    out(p) {
      t.inert = !0, Et(t, "outrostart"), u = ar(t, _(), f, 0, () => {
        Et(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      f == null || f.abort(), u == null || u.abort();
    }
  }, d = (
    /** @type {Effect} */
    x
  );
  if ((d.transitions ?? (d.transitions = [])).push(c), Pt) {
    var h = i;
    if (!h) {
      for (var v = (
        /** @type {Effect | null} */
        d.parent
      ); v && (v.f & yt) !== 0; )
        for (; (v = v.parent) && (v.f & ot) === 0; )
          ;
      h = !v || (v.f & Dt) !== 0;
    }
    h && $r(() => {
      Er(() => c.in());
    });
  }
}
function ar(e, t, r, n, i) {
  var a = n === 1;
  if (ri(t)) {
    var s, o = !1;
    return Qr(() => {
      if (!o) {
        var p = t({ direction: a ? "in" : "out" });
        s = ar(e, p, r, n, i);
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
  const { delay: l = 0, css: f, tick: u, easing: _ = ca } = t;
  var c = [];
  if (a && r === void 0 && (u && u(0, 1), f)) {
    var d = Lr(f(0, 1));
    c.push(d, d);
  }
  var h = () => 1 - n, v = e.animate(c, { duration: l, fill: "forwards" });
  return v.onfinish = () => {
    v.cancel();
    var p = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var g = n - p, y = (
      /** @type {number} */
      t.duration * Math.abs(g)
    ), $ = [];
    if (y > 0) {
      var T = !1;
      if (f)
        for (var b = Math.ceil(y / 16.666666666666668), D = 0; D <= b; D += 1) {
          var F = p + g * _(D / b), K = Lr(f(F, 1 - F));
          $.push(K), T || (T = K.overflow === "hidden");
        }
      T && (e.style.overflow = "hidden"), h = () => {
        var R = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          v.currentTime
        );
        return p + g * _(R / y);
      }, u && fa(() => {
        if (v.playState !== "running") return !1;
        var R = h();
        return u(R, 1 - R), !0;
      });
    }
    v = e.animate($, { duration: y, fill: "forwards" }), v.onfinish = () => {
      h = () => n, u == null || u(n, 1 - n), i();
    };
  }, {
    abort: () => {
      v && (v.cancel(), v.effect = null, v.onfinish = lt);
    },
    deactivate: () => {
      i = lt;
    },
    reset: () => {
      n === 0 && (u == null || u(1, 0));
    },
    t: () => h()
  };
}
function Dr(e, t) {
  return e === t || (e == null ? void 0 : e[xt]) === t;
}
function da(e = {}, t, r, n) {
  return $r(() => {
    var i, a;
    return _n(() => {
      i = a, a = [], Er(() => {
        e !== r(...a) && (t(e, ...a), i && Dr(r(...i), e) && t(null, ...i));
      });
    }), () => {
      Qr(() => {
        a && Dr(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function xe(e, t, r, n) {
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
  var f = !1, u = /* @__PURE__ */ qt(() => (f = !1, l())), _ = (
    /** @type {Effect} */
    x
  );
  return function(c, d) {
    if (arguments.length > 0) {
      const h = d ? E(u) : c;
      return P(u, h), f = !0, i !== void 0 && (i = h), c;
    }
    return Xe && f || (_.f & ze) !== 0 ? u.v : E(u);
  };
}
function va(e) {
  return new ha(e);
}
var _e, Q;
class ha {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    L(this, _e);
    /** @type {Record<string, any>} */
    L(this, Q);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, o) => {
      var l = /* @__PURE__ */ on(o, !1, !1);
      return r.set(s, l), l;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, o) {
          return E(r.get(o) ?? n(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === ai ? !0 : (E(r.get(o) ?? n(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, l) {
          return P(r.get(o) ?? n(o, l), l), Reflect.set(s, o, l);
        }
      }
    );
    Y(this, Q, (t.hydrate ? Ji : An)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && ve(), Y(this, _e, i.$$events);
    for (const s of Object.keys(m(this, Q)))
      s === "$set" || s === "$destroy" || s === "$on" || it(this, s, {
        get() {
          return m(this, Q)[s];
        },
        /** @param {any} value */
        set(o) {
          m(this, Q)[s] = o;
        },
        enumerable: !0
      });
    m(this, Q).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, m(this, Q).$destroy = () => {
      Zi(m(this, Q));
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
    m(this, _e)[t] = m(this, _e)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return m(this, _e)[t].push(n), () => {
      m(this, _e)[t] = m(this, _e)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    m(this, Q).$destroy();
  }
}
_e = new WeakMap(), Q = new WeakMap();
let Dn;
typeof HTMLElement == "function" && (Dn = class extends HTMLElement {
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
          i !== "default" && (s.name = i), he(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = _a(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = St(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = va({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Ii(() => {
        _n(() => {
          var i;
          this.$$r = !0;
          for (const a of At(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = St(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = St(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
    return At(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function St(e, t, r, n) {
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
function _a(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Fn(e, t, r, n, i, a) {
  let s = class extends Dn {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return At(t).map(
        (o) => (t[o].attribute || o).toLowerCase()
      );
    }
  };
  return At(t).forEach((o) => {
    it(s.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var _;
        l = St(o, l, t), this.$$d[o] = l;
        var f = this.$$c;
        if (f) {
          var u = (_ = Ze(f, o)) == null ? void 0 : _.get;
          u ? f[o] = l : f.$set({ [o]: l });
        }
      }
    });
  }), n.forEach((o) => {
    it(s.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let It = /* @__PURE__ */ B(void 0);
const pa = async () => (P(It, await window.loadCardHelpers().then((e) => e), !0), E(It)), ga = () => E(It) ? E(It) : pa();
function ma(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function qn(e, { delay: t = 0, duration: r = 400, easing: n = ma, axis: i = "y" } = {}) {
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
function Hn(e) {
  const t = e - 1;
  return t * t * t + 1;
}
var wa = /* @__PURE__ */ Ge('<span class="loading svelte-1v98vwq">Loading...</span>'), $a = /* @__PURE__ */ Ge('<div class="outer-container"><!> <!></div>');
const ya = {
  hash: "svelte-1v98vwq",
  code: ".loading.svelte-1v98vwq {padding:1em;display:block;}"
};
function sr(e, t) {
  pr(t, !0), Rn(e, ya);
  const r = xe(t, "type", 7, "div"), n = xe(t, "config"), i = xe(t, "hass"), a = xe(t, "marginTop", 7, "0px"), s = xe(t, "open"), o = xe(t, "clearCardCss", 7, !1);
  let l = /* @__PURE__ */ B(void 0), f = /* @__PURE__ */ B(!0);
  er(() => {
    E(l) && (E(l).hass = i());
  }), er(() => {
    var g, y;
    const p = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    (y = (g = E(l)) == null ? void 0 : g.setConfig) == null || y.call(g, p);
  }), On(async () => {
    const v = await ga(), g = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, y = v.createCardElement(g);
    y.hass = i(), E(l) && (o() && new MutationObserver(() => {
      u(y);
    }).observe(y, { childList: !0, subtree: !0 }), E(l).replaceWith(y), P(l, y, !0), P(f, !1));
  });
  function u(v, p = 5) {
    let g = 0;
    const y = () => {
      const $ = [];
      function T(b) {
        if (b instanceof Element && b.tagName.toLowerCase() === "ha-card") {
          $.push(b);
          return;
        }
        b.shadowRoot && T(b.shadowRoot), (b instanceof ShadowRoot || b instanceof Element ? Array.from(b.children) : []).forEach(T);
      }
      T(v), $.length > 0 ? $.forEach((b) => {
        b.style.setProperty("border", "none", "important"), b.style.setProperty("background", "transparent", "important"), b.style.setProperty("box-shadow", "none", "important");
      }) : (g++, g < p && requestAnimationFrame(y));
    };
    y();
  }
  var _ = $a(), c = De(_);
  ra(c, r, !1, (v, p) => {
    da(v, (g) => P(l, g, !0), () => E(l)), Ln(3, v, () => qn, () => ({ duration: 500, easing: Hn }));
  });
  var d = Tt(c, 2);
  {
    var h = (v) => {
      var p = wa();
      he(v, p);
    };
    ct(d, (v) => {
      E(f) && v(h);
    });
  }
  return ye(_), be(() => Ee(_, `margin-top: ${(s() ? a() : "0px") ?? ""};`)), he(e, _), gr({
    get type() {
      return r();
    },
    set type(v = "div") {
      r(v), ve();
    },
    get config() {
      return n();
    },
    set config(v) {
      n(v), ve();
    },
    get hass() {
      return i();
    },
    set hass(v) {
      i(v), ve();
    },
    get marginTop() {
      return a();
    },
    set marginTop(v = "0px") {
      a(v), ve();
    },
    get open() {
      return s();
    },
    set open(v) {
      s(v), ve();
    },
    get clearCardCss() {
      return o();
    },
    set clearCardCss(v = !1) {
      o(v), ve();
    }
  });
}
customElements.define("expander-sub-card", Fn(
  sr,
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
const or = {
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
var ba = /* @__PURE__ */ Ge('<button aria-label="Toggle button"><ha-icon></ha-icon></button>', 2), Ea = /* @__PURE__ */ Ge('<div id="id1"><div id="id2" class="title-card-container svelte-oxkseo"><!></div> <!></div>'), xa = /* @__PURE__ */ Ge("<button><div> </div> <ha-icon></ha-icon></button>", 2), ka = /* @__PURE__ */ Ge('<div class="children-container svelte-oxkseo"></div>'), Ca = /* @__PURE__ */ Ge("<ha-card><!> <!></ha-card>", 2);
const Ta = {
  hash: "svelte-oxkseo",
  code: ".expander-card.svelte-oxkseo {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-oxkseo {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);transition:all 0.3s ease-in-out;}.clear.svelte-oxkseo {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-oxkseo {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-oxkseo {display:block;}.title-card-container.svelte-oxkseo {width:100%;padding:var(--title-padding);}.header.svelte-oxkseo {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-oxkseo {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-oxkseo {width:100%;text-align:left;}.ico.svelte-oxkseo {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-oxkseo {transform:rotate(var(--icon-rotate-degree,180deg));}.ripple.svelte-oxkseo {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-oxkseo:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-oxkseo:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function Sa(e, t) {
  var Me, $e;
  pr(t, !0), Rn(e, Ta);
  const r = xe(t, "hass"), n = xe(t, "config", 7, or);
  let i = /* @__PURE__ */ B(!1), a = /* @__PURE__ */ B(!1);
  const s = n()["storgage-id"], o = "expander-open-" + s, l = n()["show-button-users"] === void 0 || (($e = n()["show-button-users"]) == null ? void 0 : $e.includes((Me = r()) == null ? void 0 : Me.user.name));
  function f() {
    u(!E(a));
  }
  function u(w) {
    if (P(a, w, !0), s !== void 0)
      try {
        localStorage.setItem(o, E(a) ? "true" : "false");
      } catch (S) {
        console.error(S);
      }
  }
  On(() => {
    var ie, fe;
    const w = n()["min-width-expanded"], S = n()["max-width-expanded"], N = document.body.offsetWidth;
    if (w && S ? n().expanded = N >= w && N <= S : w ? n().expanded = N >= w : S && (n().expanded = N <= S), (fe = n()["start-expanded-users"]) != null && fe.includes((ie = r()) == null ? void 0 : ie.user.name))
      u(!0);
    else if (s !== void 0)
      try {
        const j = localStorage.getItem(o);
        j === null ? n().expanded !== void 0 && u(n().expanded) : P(a, j ? j === "true" : E(a), !0);
      } catch (j) {
        console.error(j);
      }
    else
      n().expanded !== void 0 && u(n().expanded);
  });
  const _ = (w) => {
    if (E(i))
      return w.preventDefault(), w.stopImmediatePropagation(), P(i, !1), !1;
    f();
  }, c = (w) => {
    const S = w.currentTarget;
    S != null && S.classList.contains("title-card-container") && _(w);
  };
  let d, h = !1, v = 0, p = 0;
  const g = (w) => {
    d = w.target, v = w.touches[0].clientX, p = w.touches[0].clientY, h = !1;
  }, y = (w) => {
    const S = w.touches[0].clientX, N = w.touches[0].clientY;
    (Math.abs(S - v) > 10 || Math.abs(N - p) > 10) && (h = !0);
  }, $ = (w) => {
    !h && d === w.target && n()["title-card-clickable"] && f(), d = void 0, P(i, !0);
  };
  var T = Ca(), b = De(T);
  {
    var D = (w) => {
      var S = Ea(), N = De(S);
      N.__touchstart = g, N.__touchmove = y, N.__touchend = $, N.__click = function(...J) {
        var ae;
        (ae = n()["title-card-clickable"] ? c : null) == null || ae.apply(this, J);
      };
      var ie = De(N);
      {
        let J = /* @__PURE__ */ Tr(() => n()["clear-children"] || !1);
        sr(ie, {
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
      ye(N);
      var fe = Tt(N, 2);
      {
        var j = (J) => {
          var ae = ba();
          ae.__click = _;
          var Pe = De(ae);
          be(() => Ir(Pe, "icon", n().icon)), ye(ae), be(() => {
            Ee(ae, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Le(ae, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ee(Pe, `--arrow-color:${n()["arrow-color"] ?? ""}`), Le(Pe, 1, `ico${E(a) ? " flipped open" : "close"}`, "svelte-oxkseo");
          }), he(J, ae);
        };
        ct(fe, (J) => {
          l && J(j);
        });
      }
      ye(S), be(() => {
        Le(S, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-oxkseo"), Ee(N, `--title-padding:${n()["title-card-padding"] ?? ""}`), Mn(N, "role", n()["title-card-clickable"] ? "button" : void 0);
      }), he(w, S);
    }, F = (w) => {
      var S = Bi(), N = Ri(S);
      {
        var ie = (fe) => {
          var j = xa();
          j.__click = _;
          var J = De(j), ae = De(J, !0);
          ye(J);
          var Pe = Tt(J, 2);
          be(() => Ir(Pe, "icon", n().icon)), ye(j), be(() => {
            Le(j, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ee(j, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Le(J, 1, `primary title${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ki(ae, n().title), Ee(Pe, `--arrow-color:${n()["arrow-color"] ?? ""}`), Le(Pe, 1, `ico${E(a) ? " flipped open" : " close"}`, "svelte-oxkseo");
          }), he(fe, j);
        };
        ct(N, (fe) => {
          l && fe(ie);
        });
      }
      he(w, S);
    };
    ct(b, (w) => {
      n()["title-card"] ? w(D) : w(F, !1);
    });
  }
  var K = Tt(b, 2);
  {
    var R = (w) => {
      var S = ka();
      ea(S, 20, () => n().cards, (N) => N, (N, ie) => {
        {
          let fe = /* @__PURE__ */ Tr(() => n()["clear-children"] || !1);
          sr(N, {
            get hass() {
              return r();
            },
            get config() {
              return ie;
            },
            get type() {
              return ie.type;
            },
            get marginTop() {
              return n()["child-margin-top"];
            },
            get open() {
              return E(a);
            },
            get clearCardCss() {
              return E(fe);
            }
          });
        }
      }), ye(S), be(() => Ee(S, `--expander-card-display:${n()["expander-card-display"] ?? ""};
             --gap:${(E(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${(E(a) ? n()["child-padding"] : "0px") ?? ""};`)), Ln(3, S, () => qn, () => ({ duration: 500, easing: Hn })), he(w, S);
    };
    ct(K, (w) => {
      n().cards && w(R);
    });
  }
  return ye(T), be(() => {
    Le(T, 1, `expander-card${n().clear ? " clear" : ""}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ee(T, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(E(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${E(a) ?? ""};
     --icon-rotate-degree:${n()["icon-rotate-degree"] ?? ""};
     --card-background:${(E(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}
    `);
  }), he(e, T), gr({
    get hass() {
      return r();
    },
    set hass(w) {
      r(w), ve();
    },
    get config() {
      return n();
    },
    set config(w = or) {
      n(w), ve();
    }
  });
}
Yi(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", Fn(Sa, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    I(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...or, ...r };
  }
}));
const Aa = "2.6.2";
console.info(
  `%c  Expander-Card 
%c Version ${Aa}`,
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
  Sa as default
};
//# sourceMappingURL=expander-card.js.map
