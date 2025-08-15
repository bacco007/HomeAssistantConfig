var jn = Object.defineProperty;
var kr = (e) => {
  throw TypeError(e);
};
var Yn = (e, t, r) => t in e ? jn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var I = (e, t, r) => Yn(e, typeof t != "symbol" ? t + "" : t, r), Wt = (e, t, r) => t.has(e) || kr("Cannot " + r);
var m = (e, t, r) => (Wt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), F = (e, t, r) => t.has(e) ? kr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Y = (e, t, r, n) => (Wt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), Ie = (e, t, r) => (Wt(e, t, "access private method"), r);
const Vn = "5";
var Hr;
typeof window < "u" && ((Hr = window.__svelte ?? (window.__svelte = {})).v ?? (Hr.v = /* @__PURE__ */ new Set())).add(Vn);
const Wn = 1, Bn = 2, zn = 16, Xn = 4, Gn = 1, Kn = 2, Ur = "[", fr = "[!", ur = "]", Je = {}, M = Symbol(), Jn = "http://www.w3.org/1999/xhtml", Zn = "http://www.w3.org/2000/svg", jr = !1;
var cr = Array.isArray, Qn = Array.prototype.indexOf, dr = Array.from, At = Object.keys, it = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, ei = Object.getOwnPropertyDescriptors, ti = Object.prototype, ri = Array.prototype, Yr = Object.getPrototypeOf, Cr = Object.isExtensible;
function ni(e) {
  return typeof e == "function";
}
const lt = () => {
};
function Vr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ii() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const G = 2, vr = 4, Wr = 8, ot = 16, me = 32, Ne = 64, Br = 128, ee = 256, Nt = 512, H = 1024, te = 2048, Oe = 4096, se = 8192, ze = 16384, Lt = 32768, yt = 65536, Tr = 1 << 17, ai = 1 << 18, hr = 1 << 19, zr = 1 << 20, Xt = 1 << 21, _r = 1 << 22, He = 1 << 23, xt = Symbol("$state"), si = Symbol("legacy props"), oi = Symbol(""), pr = new class extends Error {
  constructor() {
    super(...arguments);
    I(this, "name", "StaleReactionError");
    I(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), li = 1, Xr = 3, vt = 8;
function fi() {
  throw new Error("https://svelte.dev/e/await_outside_boundary");
}
function ui(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ci() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function di(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function vi() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function hi(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function _i() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function pi() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function gi() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function mi() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function wi() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Dt(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let k = !1;
function B(e) {
  k = e;
}
let A;
function z(e) {
  if (e === null)
    throw Dt(), Je;
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
      throw Dt(), Je;
    A = e;
  }
}
function Gt() {
  for (var e = 0, t = A; ; ) {
    if (t.nodeType === vt) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === ur) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Ur || r === fr) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Re(t)
    );
    t.remove(), t = n;
  }
}
function Gr(e) {
  if (!e || e.nodeType !== vt)
    throw Dt(), Je;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Kr(e) {
  return e === this.v;
}
function $i(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Jr(e) {
  return !$i(e, this.v);
}
let yi = !1, re = null;
function Ot(e) {
  re = e;
}
function gr(e, t = !1, r) {
  re = {
    p: re,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function mr(e) {
  var t = (
    /** @type {ComponentContext} */
    re
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      pn(n);
  }
  return e !== void 0 && (t.x = e), re = t.p, e ?? /** @type {T} */
  {};
}
function Zr() {
  return !0;
}
const bi = /* @__PURE__ */ new WeakMap();
function Ei(e) {
  var t = x;
  if (t === null)
    return C.f |= He, e;
  if ((t.f & Lt) === 0) {
    if ((t.f & Br) === 0)
      throw !t.parent && e instanceof Error && Qr(e), e;
    t.b.error(e);
  } else
    wr(e, t);
}
function wr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Br) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    t = t.parent;
  }
  throw e instanceof Error && Qr(e), e;
}
function Qr(e) {
  const t = bi.get(e);
  t && (it(e, "message", {
    value: t.message
  }), it(e, "stack", {
    value: t.stack
  }));
}
let ht = [], Kt = [];
function en() {
  var e = ht;
  ht = [], Vr(e);
}
function xi() {
  var e = Kt;
  Kt = [], Vr(e);
}
function tn(e) {
  ht.length === 0 && queueMicrotask(en), ht.push(e);
}
function ki() {
  ht.length > 0 && en(), Kt.length > 0 && xi();
}
function Ci() {
  for (var e = (
    /** @type {Effect} */
    x.b
  ); e !== null && !e.has_pending_snippet(); )
    e = e.parent;
  return e === null && fi(), e;
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  var t = G | te, r = C !== null && (C.f & G) !== 0 ? (
    /** @type {Derived} */
    C
  ) : null;
  return x === null || r !== null && (r.f & ee) !== 0 ? t |= ee : x.f |= hr, {
    ctx: re,
    deps: null,
    effects: null,
    equals: Kr,
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
function Ti(e, t) {
  let r = (
    /** @type {Effect | null} */
    x
  );
  r === null && ci();
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
    } catch (v) {
      l = Promise.reject(v);
    }
    var f = () => l;
    i = (s == null ? void 0 : s.then(f, f)) ?? Promise.resolve(l), s = i;
    var u = (
      /** @type {Batch} */
      O
    ), _ = n.pending;
    o && (n.update_pending_count(1), _ || u.increment());
    const c = (v, d = void 0) => {
      s = null, _ || u.activate(), d ? d !== pr && (a.f |= He, Qt(a, d)) : ((a.f & He) !== 0 && (a.f ^= He), Qt(a, v)), o && (n.update_pending_count(-1), _ || u.decrement()), an();
    };
    if (i.then(c, (v) => c(null, v || "unknown")), u)
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
function Sr(e) {
  const t = /* @__PURE__ */ qt(e);
  return En(t), t;
}
// @__NO_SIDE_EFFECTS__
function Si(e) {
  const t = /* @__PURE__ */ qt(e);
  return t.equals = Jr, t;
}
function rn(e) {
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
function Ai(e) {
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
function $r(e) {
  var t, r = x;
  de(Ai(e));
  try {
    rn(e), t = Tn(e);
  } finally {
    de(r);
  }
  return t;
}
function nn(e) {
  var t = $r(e);
  if (e.equals(t) || (e.v = t, e.wv = kn()), !Xe)
    if (Te !== null)
      Te.set(e, e.v);
    else {
      var r = (Se || (e.f & ee) !== 0) && e.deps !== null ? Oe : H;
      X(e, r);
    }
}
function Ni(e, t, r) {
  const n = qt;
  if (t.length === 0) {
    r(e.map(n));
    return;
  }
  var i = O, a = (
    /** @type {Effect} */
    x
  ), s = Oi(), o = Ci();
  Promise.all(t.map((l) => /* @__PURE__ */ Ti(l))).then((l) => {
    i == null || i.activate(), s();
    try {
      r([...e.map(n), ...l]);
    } catch (f) {
      (a.f & ze) === 0 && wr(f, a);
    }
    i == null || i.deactivate(), an();
  }).catch((l) => {
    o.error(l);
  });
}
function Oi() {
  var e = x, t = C, r = re;
  return function() {
    de(e), ne(t), Ot(r);
  };
}
function an() {
  de(null), ne(null), Ot(null);
}
const ft = /* @__PURE__ */ new Set();
let O = null, Te = null, Ar = /* @__PURE__ */ new Set(), Rt = [];
function sn() {
  const e = (
    /** @type {() => void} */
    Rt.shift()
  );
  Rt.length > 0 && queueMicrotask(sn), e();
}
let Ve = [], Ht = null, Jt = !1, kt = !1;
var et, tt, ke, gt, mt, De, rt, qe, Ce, nt, wt, $t, oe, on, Ct, Zt;
const Ft = class Ft {
  constructor() {
    F(this, oe);
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
    F(this, ke, 0);
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
    F(this, qe, []);
    /**
     * The same as `#render_effects`, but for `$effect` (which runs after)
     * @type {Effect[]}
     */
    F(this, Ce, []);
    /**
     * Block effects, which may need to re-run on subsequent flushes
     * in order to update internal sources (e.g. each block items)
     * @type {Effect[]}
     */
    F(this, nt, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Effect[]}
     */
    F(this, wt, []);
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Effect[]}
     */
    F(this, $t, []);
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
      Ie(this, oe, on).call(this, s);
    if (m(this, De).length === 0 && m(this, ke) === 0) {
      Ie(this, oe, Zt).call(this);
      var n = m(this, qe), i = m(this, Ce);
      Y(this, qe, []), Y(this, Ce, []), Y(this, nt, []), O = null, Nr(n), Nr(i), O === null ? O = this : ft.delete(this), (a = m(this, gt)) == null || a.resolve();
    } else
      Ie(this, oe, Ct).call(this, m(this, qe)), Ie(this, oe, Ct).call(this, m(this, Ce)), Ie(this, oe, Ct).call(this, m(this, nt));
    if (r) {
      for (const [s, { v: o, wv: l }] of r)
        s.wv <= l && (s.v = o);
      Te = null;
    }
    for (const s of m(this, De))
      dt(s);
    for (const s of m(this, rt))
      dt(s);
    Y(this, De, []), Y(this, rt, []);
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
    for (const t of Ar)
      if (Ar.delete(t), t(), O !== null)
        break;
  }
  neuter() {
    Y(this, mt, !0);
  }
  flush() {
    Ve.length > 0 ? ln() : Ie(this, oe, Zt).call(this), O === this && (m(this, ke) === 0 && ft.delete(this), this.deactivate());
  }
  increment() {
    Y(this, ke, m(this, ke) + 1);
  }
  decrement() {
    if (Y(this, ke, m(this, ke) - 1), m(this, ke) === 0) {
      for (const t of m(this, wt))
        X(t, te), We(t);
      for (const t of m(this, $t))
        X(t, Oe), We(t);
      Y(this, qe, []), Y(this, Ce, []), this.flush();
    } else
      this.deactivate();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    m(this, tt).add(t);
  }
  settled() {
    return (m(this, gt) ?? Y(this, gt, ii())).promise;
  }
  static ensure() {
    if (O === null) {
      const t = O = new Ft();
      ft.add(O), kt || Ft.enqueue(() => {
        O === t && t.flush();
      });
    }
    return O;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Rt.length === 0 && queueMicrotask(sn), Rt.unshift(t);
  }
};
et = new WeakMap(), tt = new WeakMap(), ke = new WeakMap(), gt = new WeakMap(), mt = new WeakMap(), De = new WeakMap(), rt = new WeakMap(), qe = new WeakMap(), Ce = new WeakMap(), nt = new WeakMap(), wt = new WeakMap(), $t = new WeakMap(), oe = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 */
on = function(t) {
  var u;
  t.f ^= H;
  for (var r = t.first; r !== null; ) {
    var n = r.f, i = (n & (me | Ne)) !== 0, a = i && (n & H) !== 0, s = a || (n & se) !== 0 || this.skipped_effects.has(r);
    if (!s && r.fn !== null) {
      if (i)
        r.f ^= H;
      else if ((n & H) === 0)
        if ((n & vr) !== 0)
          m(this, Ce).push(r);
        else if ((n & _r) !== 0) {
          var o = (u = r.b) != null && u.pending ? m(this, rt) : m(this, De);
          o.push(r);
        } else Vt(r) && ((r.f & ot) !== 0 && m(this, nt).push(r), dt(r));
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
Zt = function() {
  if (!m(this, mt))
    for (const t of m(this, tt))
      t();
  m(this, tt).clear();
};
let st = Ft;
function ve(e) {
  var t = kt;
  kt = !0;
  try {
    for (var r; ; ) {
      if (ki(), Ve.length === 0 && (O == null || O.flush(), Ve.length === 0))
        return Ht = null, /** @type {T} */
        r;
      ln();
    }
  } finally {
    kt = t;
  }
}
function ln() {
  var e = Qe;
  Jt = !0;
  try {
    var t = 0;
    for (Rr(!0); Ve.length > 0; ) {
      var r = st.ensure();
      if (t++ > 1e3) {
        var n, i;
        Ri();
      }
      r.process(Ve), Ue.clear();
    }
  } finally {
    Jt = !1, Rr(e), Ht = null;
  }
}
function Ri() {
  try {
    _i();
  } catch (e) {
    wr(e, Ht);
  }
}
function Nr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (ze | se)) === 0 && Vt(n)) {
        var i = O ? O.current.size : 0;
        if (dt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null && n.ac === null ? $n(n) : n.fn = null), O !== null && O.current.size > i && (n.f & zr) !== 0)
          break;
      }
    }
    for (; r < t; )
      We(e[r++]);
  }
}
function We(e) {
  for (var t = Ht = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Jt && t === x && (r & ot) !== 0)
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
    equals: Kr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function W(e, t) {
  const r = _t(e);
  return En(r), r;
}
// @__NO_SIDE_EFFECTS__
function fn(e, t = !1, r = !0) {
  const n = _t(e);
  return t || (n.equals = Jr), n;
}
function P(e, t, r = !1) {
  C !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!ce || (C.f & Tr) !== 0) && Zr() && (C.f & (G | ot | _r | Tr)) !== 0 && !(U != null && U.includes(e)) && wi();
  let n = r ? ut(t) : t;
  return Qt(e, n);
}
function Qt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Xe ? Ue.set(e, t) : Ue.set(e, r), e.v = t;
    var n = st.ensure();
    n.capture(e, r), (e.f & G) !== 0 && ((e.f & te) !== 0 && $r(
      /** @type {Derived} */
      e
    ), X(e, (e.f & ee) === 0 ? H : Oe)), e.wv = kn(), un(e, te), x !== null && (x.f & H) !== 0 && (x.f & (me | Ne)) === 0 && (Z === null ? Ui([e]) : Z.push(e));
  }
  return t;
}
function Bt(e) {
  P(e, e.v + 1);
}
function un(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f, o = (s & te) === 0;
      o && X(a, t), (s & G) !== 0 ? un(
        /** @type {Derived} */
        a,
        Oe
      ) : o && We(
        /** @type {Effect} */
        a
      );
    }
}
function ut(e) {
  if (typeof e != "object" || e === null || xt in e)
    return e;
  const t = Yr(e);
  if (t !== ti && t !== ri)
    return e;
  var r = /* @__PURE__ */ new Map(), n = cr(e), i = /* @__PURE__ */ W(0), a = je, s = (o) => {
    if (je === a)
      return o();
    var l = C, f = je;
    ne(null), Pr(a);
    var u = o();
    return ne(l), Pr(f), u;
  };
  return n && r.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && gi();
        var u = r.get(l);
        return u === void 0 ? u = s(() => {
          var _ = /* @__PURE__ */ W(f.value);
          return r.set(l, _), _;
        }) : P(u, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const u = s(() => /* @__PURE__ */ W(M));
            r.set(l, u), Bt(i);
          }
        } else
          P(f, M), Bt(i);
        return !0;
      },
      get(o, l, f) {
        var v;
        if (l === xt)
          return e;
        var u = r.get(l), _ = l in o;
        if (u === void 0 && (!_ || (v = Ze(o, l)) != null && v.writable) && (u = s(() => {
          var d = ut(_ ? o[l] : M), h = /* @__PURE__ */ W(d);
          return h;
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
            var v = u ? ut(o[l]) : M, d = /* @__PURE__ */ W(v);
            return d;
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
          for (var v = f; v < /** @type {Source<number>} */
          _.v; v += 1) {
            var d = r.get(v + "");
            d !== void 0 ? P(d, M) : v in o && (d = s(() => /* @__PURE__ */ W(M)), r.set(v + "", d));
          }
        if (_ === void 0)
          (!c || ($ = Ze(o, l)) != null && $.writable) && (_ = s(() => /* @__PURE__ */ W(void 0)), P(_, ut(f)), r.set(l, _));
        else {
          c = _.v !== M;
          var h = s(() => ut(f));
          P(_, h);
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
        mi();
      }
    }
  );
}
var Or, cn, dn, vn;
function er() {
  if (Or === void 0) {
    Or = window, cn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    dn = Ze(t, "firstChild").get, vn = Ze(t, "nextSibling").get, Cr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Cr(r) && (r.__t = void 0);
  }
}
function ge(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ae(e) {
  return dn.call(e);
}
// @__NO_SIDE_EFFECTS__
function Re(e) {
  return vn.call(e);
}
function Le(e, t) {
  if (!k)
    return /* @__PURE__ */ Ae(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ Ae(A)
  );
  if (r === null)
    r = A.appendChild(ge());
  else if (t && r.nodeType !== Xr) {
    var n = ge();
    return r == null || r.before(n), z(n), n;
  }
  return z(r), r;
}
function Mi(e, t) {
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
  if (r && (n == null ? void 0 : n.nodeType) !== Xr) {
    var a = ge();
    return n === null ? i == null || i.after(a) : n.before(a), z(a), a;
  }
  return z(n), /** @type {TemplateNode} */
  n;
}
function hn(e) {
  e.textContent = "";
}
function _n() {
  return !1;
}
function Ut(e) {
  var t = C, r = x;
  ne(null), de(null);
  try {
    return e();
  } finally {
    ne(t), de(r);
  }
}
function Pi(e) {
  x === null && C === null && hi(), C !== null && (C.f & ee) !== 0 && x === null && vi(), Xe && di();
}
function Ii(e, t) {
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
      dt(a), a.f |= Lt;
    } catch (l) {
      throw le(a), l;
    }
  else t !== null && We(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & hr) === 0;
  if (!s && n && (i !== null && Ii(a, i), C !== null && (C.f & G) !== 0 && (e & Ne) === 0)) {
    var o = (
      /** @type {Derived} */
      C
    );
    (o.effects ?? (o.effects = [])).push(a);
  }
  return a;
}
function tr(e) {
  Pi();
  var t = (
    /** @type {Effect} */
    x.f
  ), r = !C && (t & me) !== 0 && (t & Lt) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      re
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return pn(e);
}
function pn(e) {
  return we(vr | zr, e, !1);
}
function Fi(e) {
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
    r.outro ? jt(t, () => {
      le(t), n(void 0);
    }) : (le(t), n(void 0));
  });
}
function yr(e) {
  return we(vr, e, !1);
}
function Di(e) {
  return we(_r | hr, e, !0);
}
function gn(e, t = 0) {
  return we(Wr | t, e, !0);
}
function be(e, t = [], r = []) {
  Ni(t, r, (n) => {
    we(Wr, () => e(...n.map(E)), !0);
  });
}
function br(e, t = 0) {
  var r = we(ot | t, e, !0);
  return r;
}
function Be(e, t = !0) {
  return we(me, e, !0, t);
}
function mn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Xe, n = C;
    Mr(!0), ne(null);
    try {
      t.call(null);
    } finally {
      Mr(r), ne(n);
    }
  }
}
function wn(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const i = r.ac;
    i !== null && Ut(() => {
      i.abort(pr);
    });
    var n = r.next;
    (r.f & Ne) !== 0 ? r.parent = null : le(r, t), r = n;
  }
}
function qi(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & me) === 0 && le(t), t = r;
  }
}
function le(e, t = !0) {
  var r = !1;
  (t || (e.f & ai) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Hi(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), wn(e, t && !r), Mt(e, 0), X(e, ze);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  mn(e);
  var i = e.parent;
  i !== null && i.first !== null && $n(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Hi(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Re(e)
    );
    e.remove(), e = r;
  }
}
function $n(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function jt(e, t) {
  var r = [];
  Er(e, r, !0), yn(r, () => {
    le(e), t && t();
  });
}
function yn(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function Er(e, t, r) {
  if ((e.f & se) === 0) {
    if (e.f ^= se, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & yt) !== 0 || (n.f & me) !== 0;
      Er(n, t, a ? r : !1), n = i;
    }
  }
}
function Yt(e) {
  bn(e, !0);
}
function bn(e, t) {
  if ((e.f & se) !== 0) {
    e.f ^= se, (e.f & H) === 0 && (X(e, te), We(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & yt) !== 0 || (r.f & me) !== 0;
      bn(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let Qe = !1;
function Rr(e) {
  Qe = e;
}
let Xe = !1;
function Mr(e) {
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
function En(e) {
  C !== null && (U === null ? U = [e] : U.push(e));
}
let q = null, V = 0, Z = null;
function Ui(e) {
  Z = e;
}
let xn = 1, pt = 0, je = pt;
function Pr(e) {
  je = e;
}
let Se = !1;
function kn() {
  return ++xn;
}
function Vt(e) {
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
        if (a = r[i], Vt(
          /** @type {Derived} */
          a
        ) && nn(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || x !== null && !Se) && X(e, H);
  }
  return !1;
}
function Cn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(U != null && U.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & G) !== 0 ? Cn(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? X(a, te) : (a.f & H) !== 0 && X(a, Oe), We(
        /** @type {Effect} */
        a
      ));
    }
}
function Tn(e) {
  var h;
  var t = q, r = V, n = Z, i = C, a = Se, s = U, o = re, l = ce, f = je, u = e.f;
  q = /** @type {null | Value[]} */
  null, V = 0, Z = null, Se = (u & ee) !== 0 && (ce || !Qe || C === null), C = (u & (me | Ne)) === 0 ? e : null, U = null, Ot(e.ctx), ce = !1, je = ++pt, e.ac !== null && (Ut(() => {
    e.ac.abort(pr);
  }), e.ac = null);
  try {
    e.f |= Xt;
    var _ = (
      /** @type {Function} */
      e.fn
    ), c = _(), v = e.deps;
    if (q !== null) {
      var d;
      if (Mt(e, V), v !== null && V > 0)
        for (v.length = V + q.length, d = 0; d < q.length; d++)
          v[V + d] = q[d];
      else
        e.deps = v = q;
      if (!Se || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (u & G) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (d = V; d < v.length; d++)
          ((h = v[d]).reactions ?? (h.reactions = [])).push(e);
    } else v !== null && V < v.length && (Mt(e, V), v.length = V);
    if (Zr() && Z !== null && !ce && v !== null && (e.f & (G | Oe | te)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      Z.length; d++)
        Cn(
          Z[d],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (pt++, Z !== null && (n === null ? n = Z : n.push(.../** @type {Source[]} */
    Z))), (e.f & He) !== 0 && (e.f ^= He), c;
  } catch (p) {
    return Ei(p);
  } finally {
    e.f ^= Xt, q = t, V = r, Z = n, C = i, Se = a, U = s, Ot(o), ce = l, je = f;
  }
}
function ji(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Qn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & G) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (q === null || !q.includes(t)) && (X(t, Oe), (t.f & (ee | Nt)) === 0 && (t.f ^= Nt), rn(
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
      ji(e, r[n]);
}
function dt(e) {
  var t = e.f;
  if ((t & ze) === 0) {
    X(e, H);
    var r = x, n = Qe;
    x = e, Qe = !0;
    try {
      (t & ot) !== 0 ? qi(e) : wn(e), mn(e);
      var i = Tn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = xn;
      var a;
      jr && yi && (e.f & te) !== 0 && e.deps;
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
      if ((C.f & Xt) !== 0)
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
      return ((s.f & H) === 0 && s.reactions !== null || Sn(s)) && (l = $r(s)), Ue.set(s, l), l;
    }
  } else if (r) {
    if (s = /** @type {Derived} */
    e, Te != null && Te.has(s))
      return Te.get(s);
    Vt(s) && nn(s);
  }
  if ((e.f & He) !== 0)
    throw e.v;
  return e.v;
}
function Sn(e) {
  if (e.v === M) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Ue.has(t) || (t.f & G) !== 0 && Sn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function xr(e) {
  var t = ce;
  try {
    return ce = !0, e();
  } finally {
    ce = t;
  }
}
const Yi = -7169;
function X(e, t) {
  e.f = e.f & Yi | t;
}
const An = /* @__PURE__ */ new Set(), rr = /* @__PURE__ */ new Set();
function Vi(e) {
  for (var t = 0; t < e.length; t++)
    An.add(e[t]);
  for (var r of rr)
    r(e);
}
let Ir = null;
function bt(e) {
  var y;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((y = e.composedPath) == null ? void 0 : y.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Ir = e;
  var s = 0, o = Ir === e && e.__root;
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
      for (var c, v = []; a !== null; ) {
        var d = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var h = a["__" + n];
          if (h != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a))
            if (cr(h)) {
              var [p, ...g] = h;
              p.apply(a, [e, ...g]);
            } else
              h.call(a, e);
        } catch ($) {
          c ? v.push($) : c = $;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        a = d;
      }
      if (c) {
        for (let $ of v)
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
function Wi(e) {
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
  var r = (t & Gn) !== 0, n = (t & Kn) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (k)
      return Ye(A, null), A;
    i === void 0 && (i = Wi(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ Ae(i)));
    var s = (
      /** @type {TemplateNode} */
      n || cn ? document.importNode(i, !0) : i.cloneNode(!0)
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
const zi = ["touchstart", "touchmove"];
function Xi(e) {
  return zi.includes(e);
}
const Gi = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Ki(e) {
  return Gi.includes(
    /** @type {typeof RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let Pt = !0;
function Fr(e) {
  Pt = e;
}
function Ji(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Nn(e, t) {
  return On(e, t);
}
function Zi(e, t) {
  er(), t.intro = t.intro ?? !1;
  const r = t.target, n = k, i = A;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ae(r)
    ); a && (a.nodeType !== vt || /** @type {Comment} */
    a.data !== Ur); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ Re(a);
    if (!a)
      throw Je;
    B(!0), z(
      /** @type {Comment} */
      a
    ), at();
    const s = On(e, { ...t, anchor: a });
    if (A === null || A.nodeType !== vt || /** @type {Comment} */
    A.data !== ur)
      throw Dt(), Je;
    return B(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s instanceof Error && s.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw s;
    return s !== Je && console.warn("Failed to hydrate: ", s), t.recover === !1 && pi(), er(), hn(r), B(!1), Nn(e, t);
  } finally {
    B(n), z(i);
  }
}
const Ke = /* @__PURE__ */ new Map();
function On(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  er();
  var o = /* @__PURE__ */ new Set(), l = (_) => {
    for (var c = 0; c < _.length; c++) {
      var v = _[c];
      if (!o.has(v)) {
        o.add(v);
        var d = Xi(v);
        t.addEventListener(v, bt, { passive: d });
        var h = Ke.get(v);
        h === void 0 ? (document.addEventListener(v, bt, { passive: d }), Ke.set(v, 1)) : Ke.set(v, h + 1);
      }
    }
  };
  l(dr(An)), rr.add(l);
  var f = void 0, u = Li(() => {
    var _ = r ?? t.appendChild(ge());
    return Be(() => {
      if (a) {
        gr({});
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
      ), Pt = s, f = e(_, n) || {}, Pt = !0, k && (x.nodes_end = A), a && mr();
    }), () => {
      var d;
      for (var c of o) {
        t.removeEventListener(c, bt);
        var v = (
          /** @type {number} */
          Ke.get(c)
        );
        --v === 0 ? (document.removeEventListener(c, bt), Ke.delete(c)) : Ke.set(c, v);
      }
      rr.delete(l), _ !== r && ((d = _.parentNode) == null || d.removeChild(_));
    };
  });
  return nr.set(f, u), f;
}
let nr = /* @__PURE__ */ new WeakMap();
function Qi(e, t) {
  const r = nr.get(e);
  return r ? (nr.delete(e), r(t)) : Promise.resolve();
}
function Rn(e) {
  re === null && ui(), tr(() => {
    const t = xr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function ct(e, t, r = !1) {
  k && at();
  var n = e, i = null, a = null, s = M, o = r ? yt : 0, l = !1;
  const f = (v, d = !0) => {
    l = !0, c(d, v);
  };
  var u = null;
  function _() {
    u !== null && (u.lastChild.remove(), n.before(u), u = null);
    var v = s ? i : a, d = s ? a : i;
    v && Yt(v), d && jt(d, () => {
      s ? a = null : i = null;
    });
  }
  const c = (v, d) => {
    if (s === (s = v)) return;
    let h = !1;
    if (k) {
      const b = Gr(n) === fr;
      !!s === b && (n = Gt(), z(n), B(!1), h = !0);
    }
    var p = _n(), g = n;
    if (p && (u = document.createDocumentFragment(), u.append(g = ge())), s ? i ?? (i = d && Be(() => d(g))) : a ?? (a = d && Be(() => d(g))), p) {
      var y = (
        /** @type {Batch} */
        O
      ), $ = s ? i : a, T = s ? a : i;
      $ && y.skipped_effects.delete($), T && y.skipped_effects.add(T), y.add_callback(_);
    } else
      _();
    h && B(!0);
  };
  br(() => {
    l = !1, t(f), l || c(null, null);
  }, o), k && (n = A);
}
function ea(e, t, r) {
  for (var n = e.items, i = [], a = t.length, s = 0; s < a; s++)
    Er(t[s].e, i, !0);
  var o = a > 0 && i.length === 0 && r !== null;
  if (o) {
    var l = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    hn(l), l.append(
      /** @type {Element} */
      r
    ), n.clear(), ue(e, t[0].prev, t[a - 1].next);
  }
  yn(i, () => {
    for (var f = 0; f < a; f++) {
      var u = t[f];
      o || (n.delete(u.k), ue(e, u.prev, u.next)), le(u.e, !o);
    }
  });
}
function ta(e, t, r, n, i, a = null) {
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
  var f = null, u = !1, _ = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ Si(() => {
    var p = r();
    return cr(p) ? p : p == null ? [] : dr(p);
  }), v, d;
  function h() {
    ra(
      d,
      v,
      o,
      _,
      s,
      i,
      t,
      n,
      r
    ), a !== null && (v.length === 0 ? f ? Yt(f) : f = Be(() => a(s)) : f !== null && jt(f, () => {
      f = null;
    }));
  }
  br(() => {
    d ?? (d = /** @type {Effect} */
    x), v = /** @type {V[]} */
    E(c);
    var p = v.length;
    if (u && p === 0)
      return;
    u = p === 0;
    let g = !1;
    if (k) {
      var y = Gr(s) === fr;
      y !== (p === 0) && (s = Gt(), z(s), B(!1), g = !0);
    }
    if (k) {
      for (var $ = null, T, b = 0; b < p; b++) {
        if (A.nodeType === vt && /** @type {Comment} */
        A.data === ur) {
          s = /** @type {Comment} */
          A, g = !0, B(!1);
          break;
        }
        var L = v[b], D = n(L, b);
        T = ir(
          A,
          o,
          $,
          null,
          L,
          D,
          b,
          i,
          t,
          r
        ), o.items.set(D, T), $ = T;
      }
      p > 0 && z(Gt());
    }
    if (k)
      p === 0 && a && (f = Be(() => a(s)));
    else if (_n()) {
      var K = /* @__PURE__ */ new Set(), R = (
        /** @type {Batch} */
        O
      );
      for (b = 0; b < p; b += 1) {
        L = v[b], D = n(L, b);
        var Me = o.items.get(D) ?? _.get(D);
        Me || (T = ir(
          null,
          o,
          null,
          null,
          L,
          D,
          b,
          i,
          t,
          r,
          !0
        ), _.set(D, T)), K.add(D);
      }
      for (const [$e, w] of o.items)
        K.has($e) || R.skipped_effects.add(w.e);
      R.add_callback(h);
    } else
      h();
    g && B(!0), E(c);
  }), k && (s = A);
}
function ra(e, t, r, n, i, a, s, o, l) {
  var f = t.length, u = r.items, _ = r.first, c = _, v, d = null, h = [], p = [], g, y, $, T;
  for (T = 0; T < f; T += 1) {
    if (g = t[T], y = o(g, T), $ = u.get(y), $ === void 0) {
      var b = n.get(y);
      if (b !== void 0) {
        n.delete(y), u.set(y, b);
        var L = d ? d.next : c;
        ue(r, d, b), ue(r, b, L), zt(b, L, i), d = b;
      } else {
        var D = c ? (
          /** @type {TemplateNode} */
          c.e.nodes_start
        ) : i;
        d = ir(
          D,
          r,
          d,
          d === null ? r.first : d.next,
          g,
          y,
          T,
          a,
          s,
          l
        );
      }
      u.set(y, d), h = [], p = [], c = d.next;
      continue;
    }
    if (($.e.f & se) !== 0 && Yt($.e), $ !== c) {
      if (v !== void 0 && v.has($)) {
        if (h.length < p.length) {
          var K = p[0], R;
          d = K.prev;
          var Me = h[0], $e = h[h.length - 1];
          for (R = 0; R < h.length; R += 1)
            zt(h[R], K, i);
          for (R = 0; R < p.length; R += 1)
            v.delete(p[R]);
          ue(r, Me.prev, $e.next), ue(r, d, Me), ue(r, $e, K), c = K, d = $e, T -= 1, h = [], p = [];
        } else
          v.delete($), zt($, c, i), ue(r, $.prev, $.next), ue(r, $, d === null ? r.first : d.next), ue(r, d, $), d = $;
        continue;
      }
      for (h = [], p = []; c !== null && c.k !== y; )
        (c.e.f & se) === 0 && (v ?? (v = /* @__PURE__ */ new Set())).add(c), p.push(c), c = c.next;
      if (c === null)
        continue;
      $ = c;
    }
    h.push($), d = $, c = $.next;
  }
  if (c !== null || v !== void 0) {
    for (var w = v === void 0 ? [] : dr(v); c !== null; )
      (c.e.f & se) === 0 && w.push(c), c = c.next;
    var S = w.length;
    if (S > 0) {
      var N = f === 0 ? i : null;
      ea(r, w, N);
    }
  }
  e.first = r.first && r.first.e, e.last = d && d.e;
  for (var ie of n.values())
    le(ie.e);
  n.clear();
}
function ir(e, t, r, n, i, a, s, o, l, f, u) {
  var _ = (l & Wn) !== 0, c = (l & zn) === 0, v = _ ? c ? /* @__PURE__ */ fn(i, !1, !1) : _t(i) : i, d = (l & Bn) === 0 ? s : _t(s), h = {
    i: d,
    v,
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
    return h.e = Be(() => o(
      /** @type {Node} */
      e,
      v,
      d,
      f
    ), k), h.e.prev = r && r.e, h.e.next = n && n.e, r === null ? u || (t.first = h) : (r.next = h, r.e.next = h.e), n !== null && (n.prev = h, n.e.prev = h.e), h;
  } finally {
  }
}
function zt(e, t, r) {
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
function na(e, t, r, n, i, a) {
  let s = k;
  k && at();
  var o, l, f = null;
  k && A.nodeType === li && (f = /** @type {Element} */
  A, at());
  var u = (
    /** @type {TemplateNode} */
    k ? A : e
  ), _;
  br(() => {
    const c = t() || null;
    var v = c === "svg" ? Zn : null;
    c !== o && (_ && (c === null ? jt(_, () => {
      _ = null, l = null;
    }) : c === l ? Yt(_) : (le(_), Fr(!1))), c && c !== l && (_ = Be(() => {
      if (f = k ? (
        /** @type {Element} */
        f
      ) : v ? document.createElementNS(v, c) : document.createElement(c), Ye(f, f), n) {
        k && Ki(c) && f.append(document.createComment(""));
        var d = (
          /** @type {TemplateNode} */
          k ? /* @__PURE__ */ Ae(f) : f.appendChild(ge())
        );
        k && (d === null ? B(!1) : z(d)), n(f, d);
      }
      x.nodes_end = f, u.before(f);
    })), o = c, o && (l = o), Fr(!0));
  }, yt), s && (B(!0), z(u));
}
function Mn(e, t) {
  yr(() => {
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
function ia(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function aa(e, t) {
  return e == null ? null : String(e);
}
function Fe(e, t, r, n, i, a) {
  var s = e.__className;
  if (k || s !== r || s === void 0) {
    var o = ia(r, n);
    (!k || o !== e.getAttribute("class")) && (o == null ? e.removeAttribute("class") : e.className = o), e.__className = r;
  }
  return a;
}
function Ee(e, t, r, n) {
  var i = e.__style;
  if (k || i !== t) {
    var a = aa(t);
    (!k || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const sa = Symbol("is custom element"), oa = Symbol("is html");
function Pn(e, t, r, n) {
  var i = la(e);
  k && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[oi] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && In(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Lr(e, t, r) {
  var n = C, i = x;
  let a = k;
  k && B(!1), ne(null), de(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (ar.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? In(e).includes(t) : r && typeof r == "object") ? e[t] = r : Pn(e, t, r == null ? r : String(r));
  } finally {
    ne(n), de(i), a && B(!0);
  }
}
function la(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [sa]: e.nodeName.includes("-"),
      [oa]: e.namespaceURI === Jn
    })
  );
}
var ar = /* @__PURE__ */ new Map();
function In(e) {
  var t = ar.get(e.nodeName);
  if (t) return t;
  ar.set(e.nodeName, t = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = ei(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = Yr(n);
  }
  return t;
}
const fa = () => performance.now(), pe = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => fa(),
  tasks: /* @__PURE__ */ new Set()
};
function Fn() {
  const e = pe.now();
  pe.tasks.forEach((t) => {
    t.c(e) || (pe.tasks.delete(t), t.f());
  }), pe.tasks.size !== 0 && pe.tick(Fn);
}
function ua(e) {
  let t;
  return pe.tasks.size === 0 && pe.tick(Fn), {
    promise: new Promise((r) => {
      pe.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      pe.tasks.delete(t);
    }
  };
}
function Et(e, t) {
  Ut(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function ca(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Dr(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = ca(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const da = (e) => e;
function Ln(e, t, r, n) {
  var i = (e & Xn) !== 0, a = "both", s, o = t.inert, l = t.style.overflow, f, u;
  function _() {
    return Ut(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var c = {
    is_global: i,
    in() {
      t.inert = o, Et(t, "introstart"), f = sr(t, _(), u, 1, () => {
        Et(t, "introend"), f == null || f.abort(), f = s = void 0, t.style.overflow = l;
      });
    },
    out(p) {
      t.inert = !0, Et(t, "outrostart"), u = sr(t, _(), f, 0, () => {
        Et(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      f == null || f.abort(), u == null || u.abort();
    }
  }, v = (
    /** @type {Effect} */
    x
  );
  if ((v.transitions ?? (v.transitions = [])).push(c), Pt) {
    var d = i;
    if (!d) {
      for (var h = (
        /** @type {Effect | null} */
        v.parent
      ); h && (h.f & yt) !== 0; )
        for (; (h = h.parent) && (h.f & ot) === 0; )
          ;
      d = !h || (h.f & Lt) !== 0;
    }
    d && yr(() => {
      xr(() => c.in());
    });
  }
}
function sr(e, t, r, n, i) {
  var a = n === 1;
  if (ni(t)) {
    var s, o = !1;
    return tn(() => {
      if (!o) {
        var p = t({ direction: a ? "in" : "out" });
        s = sr(e, p, r, n, i);
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
  const { delay: l = 0, css: f, tick: u, easing: _ = da } = t;
  var c = [];
  if (a && r === void 0 && (u && u(0, 1), f)) {
    var v = Dr(f(0, 1));
    c.push(v, v);
  }
  var d = () => 1 - n, h = e.animate(c, { duration: l, fill: "forwards" });
  return h.onfinish = () => {
    h.cancel();
    var p = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var g = n - p, y = (
      /** @type {number} */
      t.duration * Math.abs(g)
    ), $ = [];
    if (y > 0) {
      var T = !1;
      if (f)
        for (var b = Math.ceil(y / 16.666666666666668), L = 0; L <= b; L += 1) {
          var D = p + g * _(L / b), K = Dr(f(D, 1 - D));
          $.push(K), T || (T = K.overflow === "hidden");
        }
      T && (e.style.overflow = "hidden"), d = () => {
        var R = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          h.currentTime
        );
        return p + g * _(R / y);
      }, u && ua(() => {
        if (h.playState !== "running") return !1;
        var R = d();
        return u(R, 1 - R), !0;
      });
    }
    h = e.animate($, { duration: y, fill: "forwards" }), h.onfinish = () => {
      d = () => n, u == null || u(n, 1 - n), i();
    };
  }, {
    abort: () => {
      h && (h.cancel(), h.effect = null, h.onfinish = lt);
    },
    deactivate: () => {
      i = lt;
    },
    reset: () => {
      n === 0 && (u == null || u(1, 0));
    },
    t: () => d()
  };
}
function qr(e, t) {
  return e === t || (e == null ? void 0 : e[xt]) === t;
}
function va(e = {}, t, r, n) {
  return yr(() => {
    var i, a;
    return gn(() => {
      i = a, a = [], xr(() => {
        e !== r(...a) && (t(e, ...a), i && qr(r(...i), e) && t(null, ...i));
      });
    }), () => {
      tn(() => {
        a && qr(r(...a), e) && t(null, ...a);
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
  return (
    /** @type {() => V} */
    function(c, v) {
      if (arguments.length > 0) {
        const d = v ? E(u) : c;
        return P(u, d), f = !0, i !== void 0 && (i = d), c;
      }
      return Xe && f || (_.f & ze) !== 0 ? u.v : E(u);
    }
  );
}
function ha(e) {
  return new _a(e);
}
var _e, Q;
class _a {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    F(this, _e);
    /** @type {Record<string, any>} */
    F(this, Q);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, o) => {
      var l = /* @__PURE__ */ fn(o, !1, !1);
      return r.set(s, l), l;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, o) {
          return E(r.get(o) ?? n(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === si ? !0 : (E(r.get(o) ?? n(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, l) {
          return P(r.get(o) ?? n(o, l), l), Reflect.set(s, o, l);
        }
      }
    );
    Y(this, Q, (t.hydrate ? Zi : Nn)(t.component, {
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
      Qi(m(this, Q));
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
      const r = {}, n = pa(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = St(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = ha({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Fi(() => {
        gn(() => {
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
function pa(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function qn(e, t, r, n, i, a) {
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
let It = /* @__PURE__ */ W(void 0);
const ga = async () => (P(It, await window.loadCardHelpers().then((e) => e), !0), E(It)), ma = () => E(It) ? E(It) : ga();
function wa(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Hn(e, { delay: t = 0, duration: r = 400, easing: n = wa, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, o = i === "y" ? "height" : "width", l = parseFloat(a[o]), f = i === "y" ? ["top", "bottom"] : ["left", "right"], u = f.map(
    (g) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${g[0].toUpperCase()}${g.slice(1)}`
    )
  ), _ = parseFloat(a[`padding${u[0]}`]), c = parseFloat(a[`padding${u[1]}`]), v = parseFloat(a[`margin${u[0]}`]), d = parseFloat(a[`margin${u[1]}`]), h = parseFloat(
    a[`border${u[0]}Width`]
  ), p = parseFloat(
    a[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (g) => `overflow: hidden;opacity: ${Math.min(g * 20, 1) * s};${o}: ${g * l}px;padding-${f[0]}: ${g * _}px;padding-${f[1]}: ${g * c}px;margin-${f[0]}: ${g * v}px;margin-${f[1]}: ${g * d}px;border-${f[0]}-width: ${g * h}px;border-${f[1]}-width: ${g * p}px;min-${o}: 0`
  };
}
function Un(e) {
  const t = e - 1;
  return t * t * t + 1;
}
var $a = /* @__PURE__ */ Ge('<span class="loading svelte-1v98vwq">Loading...</span>'), ya = /* @__PURE__ */ Ge('<div class="outer-container"><!> <!></div>');
const ba = {
  hash: "svelte-1v98vwq",
  code: ".loading.svelte-1v98vwq {padding:1em;display:block;}"
};
function or(e, t) {
  gr(t, !0), Mn(e, ba);
  const r = xe(t, "type", 7, "div"), n = xe(t, "config"), i = xe(t, "hass"), a = xe(t, "marginTop", 7, "0px"), s = xe(t, "open"), o = xe(t, "clearCardCss", 7, !1);
  let l = /* @__PURE__ */ W(void 0), f = /* @__PURE__ */ W(!0);
  tr(() => {
    E(l) && (E(l).hass = i());
  }), tr(() => {
    var g, y;
    const p = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    (y = (g = E(l)) == null ? void 0 : g.setConfig) == null || y.call(g, p);
  }), Rn(async () => {
    const h = await ma(), g = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, y = h.createCardElement(g);
    y.hass = i(), E(l) && (o() && new MutationObserver(() => {
      u(y);
    }).observe(y, { childList: !0, subtree: !0 }), E(l).replaceWith(y), P(l, y, !0), P(f, !1));
  });
  function u(h, p = 5) {
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
      T(h), $.length > 0 ? $.forEach((b) => {
        b.style.setProperty("border", "none", "important"), b.style.setProperty("background", "transparent", "important"), b.style.setProperty("box-shadow", "none", "important");
      }) : (g++, g < p && requestAnimationFrame(y));
    };
    y();
  }
  var _ = ya(), c = Le(_);
  na(c, r, !1, (h, p) => {
    va(h, (g) => P(l, g, !0), () => E(l)), Ln(3, h, () => Hn, () => ({ duration: 500, easing: Un }));
  });
  var v = Tt(c, 2);
  {
    var d = (h) => {
      var p = $a();
      he(h, p);
    };
    ct(v, (h) => {
      E(f) && h(d);
    });
  }
  return ye(_), be(() => Ee(_, `margin-top: ${(s() ? a() : "0px") ?? ""};`)), he(e, _), mr({
    get type() {
      return r();
    },
    set type(h = "div") {
      r(h), ve();
    },
    get config() {
      return n();
    },
    set config(h) {
      n(h), ve();
    },
    get hass() {
      return i();
    },
    set hass(h) {
      i(h), ve();
    },
    get marginTop() {
      return a();
    },
    set marginTop(h = "0px") {
      a(h), ve();
    },
    get open() {
      return s();
    },
    set open(h) {
      s(h), ve();
    },
    get clearCardCss() {
      return o();
    },
    set clearCardCss(h = !1) {
      o(h), ve();
    }
  });
}
customElements.define("expander-sub-card", qn(
  or,
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
const lr = {
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
var Ea = /* @__PURE__ */ Ge('<button aria-label="Toggle button"><ha-icon></ha-icon></button>', 2), xa = /* @__PURE__ */ Ge('<div id="id1"><div id="id2" class="title-card-container svelte-oxkseo"><!></div> <!></div>'), ka = /* @__PURE__ */ Ge("<button><div> </div> <ha-icon></ha-icon></button>", 2), Ca = /* @__PURE__ */ Ge('<div class="children-container svelte-oxkseo"></div>'), Ta = /* @__PURE__ */ Ge("<ha-card><!> <!></ha-card>", 2);
const Sa = {
  hash: "svelte-oxkseo",
  code: ".expander-card.svelte-oxkseo {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-oxkseo {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);transition:all 0.3s ease-in-out;}.clear.svelte-oxkseo {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-oxkseo {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-oxkseo {display:block;}.title-card-container.svelte-oxkseo {width:100%;padding:var(--title-padding);}.header.svelte-oxkseo {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-oxkseo {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-oxkseo {width:100%;text-align:left;}.ico.svelte-oxkseo {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-oxkseo {transform:rotate(var(--icon-rotate-degree,180deg));}.ripple.svelte-oxkseo {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-oxkseo:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-oxkseo:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function Aa(e, t) {
  var Me, $e;
  gr(t, !0), Mn(e, Sa);
  const r = xe(t, "hass"), n = xe(t, "config", 7, lr);
  let i = /* @__PURE__ */ W(!1), a = /* @__PURE__ */ W(!1);
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
  Rn(() => {
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
  let v, d = !1, h = 0, p = 0;
  const g = (w) => {
    v = w.target, h = w.touches[0].clientX, p = w.touches[0].clientY, d = !1;
  }, y = (w) => {
    const S = w.touches[0].clientX, N = w.touches[0].clientY;
    (Math.abs(S - h) > 10 || Math.abs(N - p) > 10) && (d = !0);
  }, $ = (w) => {
    !d && v === w.target && n()["title-card-clickable"] && f(), v = void 0, P(i, !0);
  };
  var T = Ta(), b = Le(T);
  {
    var L = (w) => {
      var S = xa(), N = Le(S);
      N.__touchstart = g, N.__touchmove = y, N.__touchend = $, N.__click = function(...J) {
        var ae;
        (ae = n()["title-card-clickable"] ? c : null) == null || ae.apply(this, J);
      };
      var ie = Le(N);
      {
        let J = /* @__PURE__ */ Sr(() => n()["clear-children"] || !1);
        or(ie, {
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
          var ae = Ea();
          ae.__click = _;
          var Pe = Le(ae);
          be(() => Lr(Pe, "icon", n().icon)), ye(ae), be(() => {
            Ee(ae, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Fe(ae, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ee(Pe, `--arrow-color:${n()["arrow-color"] ?? ""}`), Fe(Pe, 1, `ico${E(a) ? " flipped open" : "close"}`, "svelte-oxkseo");
          }), he(J, ae);
        };
        ct(fe, (J) => {
          l && J(j);
        });
      }
      ye(S), be(() => {
        Fe(S, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-oxkseo"), Ee(N, `--title-padding:${n()["title-card-padding"] ?? ""}`), Pn(N, "role", n()["title-card-clickable"] ? "button" : void 0);
      }), he(w, S);
    }, D = (w) => {
      var S = Bi(), N = Mi(S);
      {
        var ie = (fe) => {
          var j = ka();
          j.__click = _;
          var J = Le(j), ae = Le(J, !0);
          ye(J);
          var Pe = Tt(J, 2);
          be(() => Lr(Pe, "icon", n().icon)), ye(j), be(() => {
            Fe(j, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ee(j, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Fe(J, 1, `primary title${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ji(ae, n().title), Ee(Pe, `--arrow-color:${n()["arrow-color"] ?? ""}`), Fe(Pe, 1, `ico${E(a) ? " flipped open" : " close"}`, "svelte-oxkseo");
          }), he(fe, j);
        };
        ct(N, (fe) => {
          l && fe(ie);
        });
      }
      he(w, S);
    };
    ct(b, (w) => {
      n()["title-card"] ? w(L) : w(D, !1);
    });
  }
  var K = Tt(b, 2);
  {
    var R = (w) => {
      var S = Ca();
      ta(S, 20, () => n().cards, (N) => N, (N, ie) => {
        {
          let fe = /* @__PURE__ */ Sr(() => n()["clear-children"] || !1);
          or(N, {
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
             --gap:${(E(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${(E(a) ? n()["child-padding"] : "0px") ?? ""};`)), Ln(3, S, () => Hn, () => ({ duration: 500, easing: Un })), he(w, S);
    };
    ct(K, (w) => {
      n().cards && w(R);
    });
  }
  return ye(T), be(() => {
    Fe(T, 1, `expander-card${n().clear ? " clear" : ""}${E(a) ? " open" : " close"}`, "svelte-oxkseo"), Ee(T, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(E(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${E(a) ?? ""};
     --icon-rotate-degree:${n()["icon-rotate-degree"] ?? ""};
     --card-background:${(E(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}
    `);
  }), he(e, T), mr({
    get hass() {
      return r();
    },
    set hass(w) {
      r(w), ve();
    },
    get config() {
      return n();
    },
    set config(w = lr) {
      n(w), ve();
    }
  });
}
Vi(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", qn(Aa, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    I(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...lr, ...r };
  }
}));
const Na = "2.6.4";
console.info(
  `%c  Expander-Card 
%c Version ${Na}`,
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
  Aa as default
};
//# sourceMappingURL=expander-card.js.map
