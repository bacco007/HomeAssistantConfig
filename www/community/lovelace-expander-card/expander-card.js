var jn = Object.defineProperty;
var Cr = (e) => {
  throw TypeError(e);
};
var Yn = (e, t, r) => t in e ? jn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var F = (e, t, r) => Yn(e, typeof t != "symbol" ? t + "" : t, r), Wt = (e, t, r) => t.has(e) || Cr("Cannot " + r);
var m = (e, t, r) => (Wt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), D = (e, t, r) => t.has(e) ? Cr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Y = (e, t, r, n) => (Wt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), Le = (e, t, r) => (Wt(e, t, "access private method"), r);
var Hr;
typeof window < "u" && ((Hr = window.__svelte ?? (window.__svelte = {})).v ?? (Hr.v = /* @__PURE__ */ new Set())).add("5");
const Vn = 1, Bn = 2, Wn = 16, Xn = 4, Gn = 1, Kn = 2, jr = "[", cr = "[!", dr = "]", Ze = {}, P = Symbol(), zn = "http://www.w3.org/1999/xhtml", Jn = "http://www.w3.org/2000/svg", Yr = !1;
var vr = Array.isArray, Zn = Array.prototype.indexOf, hr = Array.from, Nt = Object.keys, at = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, Qn = Object.getOwnPropertyDescriptors, ei = Object.prototype, ti = Array.prototype, Vr = Object.getPrototypeOf, Tr = Object.isExtensible;
function ri(e) {
  return typeof e == "function";
}
const ut = () => {
};
function Br(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ni() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const K = 2, _r = 4, Wr = 8, We = 16, we = 32, Re = 64, Xr = 128, ee = 256, Ot = 512, U = 1024, te = 2048, Me = 4096, ae = 8192, Xe = 16384, Dt = 32768, bt = 65536, Sr = 1 << 17, ii = 1 << 18, ft = 1 << 19, ai = 1 << 20, zt = 1 << 21, pr = 1 << 22, He = 1 << 23, kt = Symbol("$state"), si = Symbol("legacy props"), oi = Symbol(""), gr = new class extends Error {
  constructor() {
    super(...arguments);
    F(this, "name", "StaleReactionError");
    F(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), li = 1, Gr = 3, vt = 8;
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
function qt(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let x = !1;
function W(e) {
  x = e;
}
let A;
function X(e) {
  if (e === null)
    throw qt(), Ze;
  return A = e;
}
function st() {
  return X(
    /** @type {TemplateNode} */
    /* @__PURE__ */ Pe(A)
  );
}
function Ee(e) {
  if (x) {
    if (/* @__PURE__ */ Pe(A) !== null)
      throw qt(), Ze;
    A = e;
  }
}
function Jt() {
  for (var e = 0, t = A; ; ) {
    if (t.nodeType === vt) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === dr) {
        if (e === 0) return t;
        e -= 1;
      } else (r === jr || r === cr) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Pe(t)
    );
    t.remove(), t = n;
  }
}
function Kr(e) {
  if (!e || e.nodeType !== vt)
    throw qt(), Ze;
  return (
    /** @type {Comment} */
    e.data
  );
}
function zr(e) {
  return e === this.v;
}
function $i(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Jr(e) {
  return !$i(e, this.v);
}
let yi = !1, re = null;
function Rt(e) {
  re = e;
}
function mr(e, t = !1, r) {
  re = {
    p: re,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function wr(e) {
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
  var t = E;
  if (t === null)
    return k.f |= He, e;
  if ((t.f & Dt) === 0) {
    if ((t.f & Xr) === 0)
      throw !t.parent && e instanceof Error && Qr(e), e;
    t.b.error(e);
  } else
    $r(e, t);
}
function $r(e, t) {
  for (; t !== null; ) {
    if ((t.f & Xr) !== 0)
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
  t && (at(e, "message", {
    value: t.message
  }), at(e, "stack", {
    value: t.stack
  }));
}
let ht = [], Zt = [];
function en() {
  var e = ht;
  ht = [], Br(e);
}
function xi() {
  var e = Zt;
  Zt = [], Br(e);
}
function tn(e) {
  ht.length === 0 && queueMicrotask(en), ht.push(e);
}
function ki() {
  ht.length > 0 && en(), Zt.length > 0 && xi();
}
function Ci() {
  for (var e = (
    /** @type {Effect} */
    E.b
  ); e !== null && !e.has_pending_snippet(); )
    e = e.parent;
  return e === null && fi(), e;
}
// @__NO_SIDE_EFFECTS__
function Ut(e) {
  var t = K | te, r = k !== null && (k.f & K) !== 0 ? (
    /** @type {Derived} */
    k
  ) : null;
  return E === null || r !== null && (r.f & ee) !== 0 ? t |= ee : E.f |= ft, {
    ctx: re,
    deps: null,
    effects: null,
    equals: zr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      P
    ),
    wv: 0,
    parent: r ?? E,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Ti(e, t) {
  let r = (
    /** @type {Effect | null} */
    E
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
    P
  ), s = null, o = !k;
  return Di(() => {
    try {
      var l = e();
      s && Promise.resolve(l).catch(() => {
      });
    } catch (v) {
      l = Promise.reject(v);
    }
    var f = () => l;
    i = (s == null ? void 0 : s.then(f, f)) ?? Promise.resolve(l), s = i;
    var u = (
      /** @type {Batch} */
      R
    ), h = n.pending;
    o && (n.update_pending_count(1), h || u.increment());
    const c = (v, d = void 0) => {
      s = null, h || u.activate(), d ? d !== gr && (a.f |= He, tr(a, d)) : ((a.f & He) !== 0 && (a.f ^= He), tr(a, v)), o && (n.update_pending_count(-1), h || u.decrement()), an();
    };
    if (i.then(c, (v) => c(null, v || "unknown")), u)
      return () => {
        queueMicrotask(() => u.neuter());
      };
  }), new Promise((l) => {
    function f(u) {
      function h() {
        u === i ? l(a) : f(i);
      }
      u.then(h, h);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Ar(e) {
  const t = /* @__PURE__ */ Ut(e);
  return En(t), t;
}
// @__NO_SIDE_EFFECTS__
function Si(e) {
  const t = /* @__PURE__ */ Ut(e);
  return t.equals = Jr, t;
}
function rn(e) {
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
function Ai(e) {
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
function yr(e) {
  var t, r = E;
  ce(Ai(e));
  try {
    rn(e), t = Tn(e);
  } finally {
    ce(r);
  }
  return t;
}
function nn(e) {
  var t = yr(e);
  if (e.equals(t) || (e.v = t, e.wv = kn()), !Ge) {
    var r = (Ae || (e.f & ee) !== 0) && e.deps !== null ? Me : U;
    G(e, r);
  }
}
function Ni(e, t, r) {
  const n = Ut;
  if (t.length === 0) {
    r(e.map(n));
    return;
  }
  var i = R, a = (
    /** @type {Effect} */
    E
  ), s = Oi(), o = Ci();
  Promise.all(t.map((l) => /* @__PURE__ */ Ti(l))).then((l) => {
    i == null || i.activate(), s();
    try {
      r([...e.map(n), ...l]);
    } catch (f) {
      (a.f & Xe) === 0 && $r(f, a);
    }
    i == null || i.deactivate(), an();
  }).catch((l) => {
    o.error(l);
  });
}
function Oi() {
  var e = E, t = k, r = re, n = R;
  return function() {
    ce(e), ne(t), Rt(r), n == null || n.activate();
  };
}
function an() {
  ce(null), ne(null), Rt(null);
}
const Xt = /* @__PURE__ */ new Set();
let R = null, Nr = /* @__PURE__ */ new Set(), Mt = [];
function sn() {
  const e = (
    /** @type {() => void} */
    Mt.shift()
  );
  Mt.length > 0 && queueMicrotask(sn), e();
}
let Ve = [], Ht = null, Qt = !1, Ct = !1;
var gt, rt, Te, mt, wt, qe, nt, Ue, Se, it, $t, yt, se, on, Tt, er;
const Ft = class Ft {
  constructor() {
    D(this, se);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    F(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    D(this, gt, /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    D(this, rt, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    D(this, Te, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    D(this, mt, null);
    /**
     * True if an async effect inside this batch resolved and
     * its parent branch was already deleted
     */
    D(this, wt, !1);
    /**
     * Async effects (created inside `async_derived`) encountered during processing.
     * These run after the rest of the batch has updated, since they should
     * always have the latest values
     * @type {Effect[]}
     */
    D(this, qe, []);
    /**
     * The same as `#async_effects`, but for effects inside a newly-created
     * `<svelte:boundary>` — these do not prevent the batch from committing
     * @type {Effect[]}
     */
    D(this, nt, []);
    /**
     * Template effects and `$effect.pre` effects, which run when
     * a batch is committed
     * @type {Effect[]}
     */
    D(this, Ue, []);
    /**
     * The same as `#render_effects`, but for `$effect` (which runs after)
     * @type {Effect[]}
     */
    D(this, Se, []);
    /**
     * Block effects, which may need to re-run on subsequent flushes
     * in order to update internal sources (e.g. each block items)
     * @type {Effect[]}
     */
    D(this, it, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Effect[]}
     */
    D(this, $t, []);
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Effect[]}
     */
    D(this, yt, []);
    /**
     * A set of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`
     * @type {Set<Effect>}
     */
    F(this, "skipped_effects", /* @__PURE__ */ new Set());
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var i;
    Ve = [];
    for (const a of t)
      Le(this, se, on).call(this, a);
    if (m(this, qe).length === 0 && m(this, Te) === 0) {
      Le(this, se, er).call(this);
      var r = m(this, Ue), n = m(this, Se);
      Y(this, Ue, []), Y(this, Se, []), Y(this, it, []), R = null, Or(r), Or(n), R === null ? R = this : Xt.delete(this), (i = m(this, mt)) == null || i.resolve();
    } else
      Le(this, se, Tt).call(this, m(this, Ue)), Le(this, se, Tt).call(this, m(this, Se)), Le(this, se, Tt).call(this, m(this, it));
    for (const a of m(this, qe))
      tt(a);
    for (const a of m(this, nt))
      tt(a);
    Y(this, qe, []), Y(this, nt, []);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    m(this, gt).has(t) || m(this, gt).set(t, r), this.current.set(t, t.v);
  }
  activate() {
    R = this;
  }
  deactivate() {
    R = null;
    for (const t of Nr)
      if (Nr.delete(t), t(), R !== null)
        break;
  }
  neuter() {
    Y(this, wt, !0);
  }
  flush() {
    Ve.length > 0 ? ln() : Le(this, se, er).call(this), R === this && (m(this, Te) === 0 && Xt.delete(this), this.deactivate());
  }
  increment() {
    Y(this, Te, m(this, Te) + 1);
  }
  decrement() {
    if (Y(this, Te, m(this, Te) - 1), m(this, Te) === 0) {
      for (const t of m(this, $t))
        G(t, te), lt(t);
      for (const t of m(this, yt))
        G(t, Me), lt(t);
      Y(this, Ue, []), Y(this, Se, []), this.flush();
    } else
      this.deactivate();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    m(this, rt).add(t);
  }
  settled() {
    return (m(this, mt) ?? Y(this, mt, ni())).promise;
  }
  static ensure() {
    if (R === null) {
      const t = R = new Ft();
      Xt.add(R), Ct || Ft.enqueue(() => {
        R === t && t.flush();
      });
    }
    return R;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Mt.length === 0 && queueMicrotask(sn), Mt.unshift(t);
  }
};
gt = new WeakMap(), rt = new WeakMap(), Te = new WeakMap(), mt = new WeakMap(), wt = new WeakMap(), qe = new WeakMap(), nt = new WeakMap(), Ue = new WeakMap(), Se = new WeakMap(), it = new WeakMap(), $t = new WeakMap(), yt = new WeakMap(), se = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 */
on = function(t) {
  var u;
  t.f ^= U;
  for (var r = t.first; r !== null; ) {
    var n = r.f, i = (n & (we | Re)) !== 0, a = i && (n & U) !== 0, s = a || (n & ae) !== 0 || this.skipped_effects.has(r);
    if (!s && r.fn !== null) {
      if (i)
        r.f ^= U;
      else if ((n & _r) !== 0)
        m(this, Se).push(r);
      else if ((n & U) === 0)
        if ((n & pr) !== 0) {
          var o = (u = r.b) != null && u.pending ? m(this, nt) : m(this, qe);
          o.push(r);
        } else Bt(r) && ((r.f & We) !== 0 && m(this, it).push(r), tt(r));
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
Tt = function(t) {
  for (const r of t)
    ((r.f & te) !== 0 ? m(this, $t) : m(this, yt)).push(r), G(r, U);
  t.length = 0;
}, /**
 * Append and remove branches to/from the DOM
 */
er = function() {
  if (!m(this, wt))
    for (const t of m(this, rt))
      t();
  m(this, rt).clear();
};
let ot = Ft;
function he(e) {
  var t = Ct;
  Ct = !0;
  try {
    for (var r; ; ) {
      if (ki(), Ve.length === 0 && (R == null || R.flush(), Ve.length === 0))
        return Ht = null, /** @type {T} */
        r;
      ln();
    }
  } finally {
    Ct = t;
  }
}
function ln() {
  var e = et;
  Qt = !0;
  try {
    var t = 0;
    for (Mr(!0); Ve.length > 0; ) {
      var r = ot.ensure();
      if (t++ > 1e3) {
        var n, i;
        Ri();
      }
      r.process(Ve), Ne.clear();
    }
  } finally {
    Qt = !1, Mr(e), Ht = null;
  }
}
function Ri() {
  try {
    _i();
  } catch (e) {
    $r(e, Ht);
  }
}
let ve = null;
function Or(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (Xe | ae)) === 0 && Bt(n) && (ve = [], tt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null && n.ac === null ? $n(n) : n.fn = null), (ve == null ? void 0 : ve.length) > 0)) {
        Ne.clear();
        for (const i of ve)
          tt(i);
        ve = [];
      }
    }
    ve = null;
  }
}
function lt(e) {
  for (var t = Ht = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Qt && t === E && (r & We) !== 0)
      return;
    if ((r & (Re | we)) !== 0) {
      if ((r & U) === 0) return;
      t.f ^= U;
    }
  }
  Ve.push(t);
}
const Ne = /* @__PURE__ */ new Map();
function _t(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: zr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  const r = _t(e);
  return En(r), r;
}
// @__NO_SIDE_EFFECTS__
function fn(e, t = !1, r = !0) {
  const n = _t(e);
  return t || (n.equals = Jr), n;
}
function I(e, t, r = !1) {
  k !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!ue || (k.f & Sr) !== 0) && Zr() && (k.f & (K | We | pr | Sr)) !== 0 && !(H != null && H.includes(e)) && wi();
  let n = r ? ct(t) : t;
  return tr(e, n);
}
function tr(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Ge ? Ne.set(e, t) : Ne.set(e, r), e.v = t;
    var n = ot.ensure();
    n.capture(e, r), (e.f & K) !== 0 && ((e.f & te) !== 0 && yr(
      /** @type {Derived} */
      e
    ), G(e, (e.f & ee) === 0 ? U : Me)), e.wv = kn(), un(e, te), E !== null && (E.f & U) !== 0 && (E.f & (we | Re)) === 0 && (Z === null ? Hi([e]) : Z.push(e));
  }
  return t;
}
function Gt(e) {
  I(e, e.v + 1);
}
function un(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f, o = (s & te) === 0;
      o && G(a, t), (s & K) !== 0 ? un(
        /** @type {Derived} */
        a,
        Me
      ) : o && ((s & We) !== 0 && ve !== null && ve.push(
        /** @type {Effect} */
        a
      ), lt(
        /** @type {Effect} */
        a
      ));
    }
}
function ct(e) {
  if (typeof e != "object" || e === null || kt in e)
    return e;
  const t = Vr(e);
  if (t !== ei && t !== ti)
    return e;
  var r = /* @__PURE__ */ new Map(), n = vr(e), i = /* @__PURE__ */ B(0), a = je, s = (o) => {
    if (je === a)
      return o();
    var l = k, f = je;
    ne(null), Ir(a);
    var u = o();
    return ne(l), Ir(f), u;
  };
  return n && r.set("length", /* @__PURE__ */ B(
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
          var h = /* @__PURE__ */ B(f.value);
          return r.set(l, h), h;
        }) : I(u, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const u = s(() => /* @__PURE__ */ B(P));
            r.set(l, u), Gt(i);
          }
        } else
          I(f, P), Gt(i);
        return !0;
      },
      get(o, l, f) {
        var v;
        if (l === kt)
          return e;
        var u = r.get(l), h = l in o;
        if (u === void 0 && (!h || (v = Qe(o, l)) != null && v.writable) && (u = s(() => {
          var d = ct(h ? o[l] : P), p = /* @__PURE__ */ B(d);
          return p;
        }), r.set(l, u)), u !== void 0) {
          var c = y(u);
          return c === P ? void 0 : c;
        }
        return Reflect.get(o, l, f);
      },
      getOwnPropertyDescriptor(o, l) {
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f && "value" in f) {
          var u = r.get(l);
          u && (f.value = y(u));
        } else if (f === void 0) {
          var h = r.get(l), c = h == null ? void 0 : h.v;
          if (h !== void 0 && c !== P)
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
        if (l === kt)
          return !0;
        var f = r.get(l), u = f !== void 0 && f.v !== P || Reflect.has(o, l);
        if (f !== void 0 || E !== null && (!u || (c = Qe(o, l)) != null && c.writable)) {
          f === void 0 && (f = s(() => {
            var v = u ? ct(o[l]) : P, d = /* @__PURE__ */ B(v);
            return d;
          }), r.set(l, f));
          var h = y(f);
          if (h === P)
            return !1;
        }
        return u;
      },
      set(o, l, f, u) {
        var g;
        var h = r.get(l), c = l in o;
        if (n && l === "length")
          for (var v = f; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = r.get(v + "");
            d !== void 0 ? I(d, P) : v in o && (d = s(() => /* @__PURE__ */ B(P)), r.set(v + "", d));
          }
        if (h === void 0)
          (!c || (g = Qe(o, l)) != null && g.writable) && (h = s(() => /* @__PURE__ */ B(void 0)), I(h, ct(f)), r.set(l, h));
        else {
          c = h.v !== P;
          var p = s(() => ct(f));
          I(h, p);
        }
        var _ = Reflect.getOwnPropertyDescriptor(o, l);
        if (_ != null && _.set && _.set.call(u, f), !c) {
          if (n && typeof l == "string") {
            var w = (
              /** @type {Source<number>} */
              r.get("length")
            ), $ = Number(l);
            Number.isInteger($) && $ >= w.v && I(w, $ + 1);
          }
          Gt(i);
        }
        return !0;
      },
      ownKeys(o) {
        y(i);
        var l = Reflect.ownKeys(o).filter((h) => {
          var c = r.get(h);
          return c === void 0 || c.v !== P;
        });
        for (var [f, u] of r)
          u.v !== P && !(f in o) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        mi();
      }
    }
  );
}
var Rr, cn, dn, vn;
function rr() {
  if (Rr === void 0) {
    Rr = window, cn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    dn = Qe(t, "firstChild").get, vn = Qe(t, "nextSibling").get, Tr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Tr(r) && (r.__t = void 0);
  }
}
function me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Oe(e) {
  return dn.call(e);
}
// @__NO_SIDE_EFFECTS__
function Pe(e) {
  return vn.call(e);
}
function De(e, t) {
  if (!x)
    return /* @__PURE__ */ Oe(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(A)
  );
  if (r === null)
    r = A.appendChild(me());
  else if (t && r.nodeType !== Gr) {
    var n = me();
    return r == null || r.before(n), X(n), n;
  }
  return X(r), r;
}
function Mi(e, t) {
  if (!x) {
    var r = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ Oe(
        /** @type {Node} */
        e
      )
    );
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Pe(r) : r;
  }
  return A;
}
function St(e, t = 1, r = !1) {
  let n = x ? A : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ Pe(n);
  if (!x)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== Gr) {
    var a = me();
    return n === null ? i == null || i.after(a) : n.before(a), X(a), a;
  }
  return X(n), /** @type {TemplateNode} */
  n;
}
function hn(e) {
  e.textContent = "";
}
function _n() {
  return !1;
}
function jt(e) {
  var t = k, r = E;
  ne(null), ce(null);
  try {
    return e();
  } finally {
    ne(t), ce(r);
  }
}
function Pi(e) {
  E === null && k === null && hi(), k !== null && (k.f & ee) !== 0 && E === null && vi(), Ge && di();
}
function Ii(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function $e(e, t, r, n = !0) {
  var i = E;
  i !== null && (i.f & ae) !== 0 && (e |= ae);
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
      tt(a), a.f |= Dt;
    } catch (l) {
      throw oe(a), l;
    }
  else t !== null && lt(a);
  if (n) {
    var s = a;
    if (r && s.deps === null && s.teardown === null && s.nodes_start === null && s.first === s.last && // either `null`, or a singular child
    (s.f & ft) === 0 && (s = s.first), s !== null && (s.parent = i, i !== null && Ii(s, i), k !== null && (k.f & K) !== 0 && (e & Re) === 0)) {
      var o = (
        /** @type {Derived} */
        k
      );
      (o.effects ?? (o.effects = [])).push(s);
    }
  }
  return a;
}
function nr(e) {
  Pi();
  var t = (
    /** @type {Effect} */
    E.f
  ), r = !k && (t & we) !== 0 && (t & Dt) === 0;
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
  return $e(_r | ai, e, !1);
}
function Li(e) {
  ot.ensure();
  const t = $e(Re | ft, e, !0);
  return () => {
    oe(t);
  };
}
function Fi(e) {
  ot.ensure();
  const t = $e(Re | ft, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Yt(t, () => {
      oe(t), n(void 0);
    }) : (oe(t), n(void 0));
  });
}
function br(e) {
  return $e(_r, e, !1);
}
function Di(e) {
  return $e(pr | ft, e, !0);
}
function gn(e, t = 0) {
  return $e(Wr | t, e, !0);
}
function xe(e, t = [], r = []) {
  Ni(t, r, (n) => {
    $e(Wr, () => e(...n.map(y)), !0);
  });
}
function Er(e, t = 0) {
  var r = $e(We | t, e, !0);
  return r;
}
function Be(e, t = !0) {
  return $e(we | ft, e, !0, t);
}
function mn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Ge, n = k;
    Pr(!0), ne(null);
    try {
      t.call(null);
    } finally {
      Pr(r), ne(n);
    }
  }
}
function wn(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const i = r.ac;
    i !== null && jt(() => {
      i.abort(gr);
    });
    var n = r.next;
    (r.f & Re) !== 0 ? r.parent = null : oe(r, t), r = n;
  }
}
function qi(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & we) === 0 && oe(t), t = r;
  }
}
function oe(e, t = !0) {
  var r = !1;
  (t || (e.f & ii) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Ui(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), wn(e, t && !r), Pt(e, 0), G(e, Xe);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  mn(e);
  var i = e.parent;
  i !== null && i.first !== null && $n(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Ui(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Pe(e)
    );
    e.remove(), e = r;
  }
}
function $n(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Yt(e, t) {
  var r = [];
  xr(e, r, !0), yn(r, () => {
    oe(e), t && t();
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
function xr(e, t, r) {
  if ((e.f & ae) === 0) {
    if (e.f ^= ae, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & bt) !== 0 || (n.f & we) !== 0;
      xr(n, t, a ? r : !1), n = i;
    }
  }
}
function Vt(e) {
  bn(e, !0);
}
function bn(e, t) {
  if ((e.f & ae) !== 0) {
    e.f ^= ae, (e.f & U) === 0 && (G(e, te), lt(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & bt) !== 0 || (r.f & we) !== 0;
      bn(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let et = !1;
function Mr(e) {
  et = e;
}
let Ge = !1;
function Pr(e) {
  Ge = e;
}
let k = null, ue = !1;
function ne(e) {
  k = e;
}
let E = null;
function ce(e) {
  E = e;
}
let H = null;
function En(e) {
  k !== null && (H === null ? H = [e] : H.push(e));
}
let q = null, V = 0, Z = null;
function Hi(e) {
  Z = e;
}
let xn = 1, pt = 0, je = pt;
function Ir(e) {
  je = e;
}
let Ae = !1;
function kn() {
  return ++xn;
}
function Bt(e) {
  var h;
  var t = e.f;
  if ((t & te) !== 0)
    return !0;
  if ((t & Me) !== 0) {
    var r = e.deps, n = (t & ee) !== 0;
    if (r !== null) {
      var i, a, s = (t & Ot) !== 0, o = n && E !== null && !Ae, l = r.length;
      if ((s || o) && (E === null || (E.f & Xe) === 0)) {
        var f = (
          /** @type {Derived} */
          e
        ), u = f.parent;
        for (i = 0; i < l; i++)
          a = r[i], (s || !((h = a == null ? void 0 : a.reactions) != null && h.includes(f))) && (a.reactions ?? (a.reactions = [])).push(f);
        s && (f.f ^= Ot), o && u !== null && (u.f & ee) === 0 && (f.f ^= ee);
      }
      for (i = 0; i < l; i++)
        if (a = r[i], Bt(
          /** @type {Derived} */
          a
        ) && nn(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || E !== null && !Ae) && G(e, U);
  }
  return !1;
}
function Cn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(H != null && H.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & K) !== 0 ? Cn(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? G(a, te) : (a.f & U) !== 0 && G(a, Me), lt(
        /** @type {Effect} */
        a
      ));
    }
}
function Tn(e) {
  var p;
  var t = q, r = V, n = Z, i = k, a = Ae, s = H, o = re, l = ue, f = je, u = e.f;
  q = /** @type {null | Value[]} */
  null, V = 0, Z = null, Ae = (u & ee) !== 0 && (ue || !et || k === null), k = (u & (we | Re)) === 0 ? e : null, H = null, Rt(e.ctx), ue = !1, je = ++pt, e.ac !== null && (jt(() => {
    e.ac.abort(gr);
  }), e.ac = null);
  try {
    e.f |= zt;
    var h = (
      /** @type {Function} */
      e.fn
    ), c = h(), v = e.deps;
    if (q !== null) {
      var d;
      if (Pt(e, V), v !== null && V > 0)
        for (v.length = V + q.length, d = 0; d < q.length; d++)
          v[V + d] = q[d];
      else
        e.deps = v = q;
      if (!Ae || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (u & K) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (d = V; d < v.length; d++)
          ((p = v[d]).reactions ?? (p.reactions = [])).push(e);
    } else v !== null && V < v.length && (Pt(e, V), v.length = V);
    if (Zr() && Z !== null && !ue && v !== null && (e.f & (K | Me | te)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      Z.length; d++)
        Cn(
          Z[d],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (pt++, Z !== null && (n === null ? n = Z : n.push(.../** @type {Source[]} */
    Z))), (e.f & He) !== 0 && (e.f ^= He), c;
  } catch (_) {
    return Ei(_);
  } finally {
    e.f ^= zt, q = t, V = r, Z = n, k = i, Ae = a, H = s, Rt(o), ue = l, je = f;
  }
}
function ji(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Zn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & K) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (q === null || !q.includes(t)) && (G(t, Me), (t.f & (ee | Ot)) === 0 && (t.f ^= Ot), rn(
    /** @type {Derived} **/
    t
  ), Pt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Pt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      ji(e, r[n]);
}
function tt(e) {
  var t = e.f;
  if ((t & Xe) === 0) {
    G(e, U);
    var r = E, n = et;
    E = e, et = !0;
    try {
      (t & We) !== 0 ? qi(e) : wn(e), mn(e);
      var i = Tn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = xn;
      var a;
      Yr && yi && (e.f & te) !== 0 && e.deps;
    } finally {
      et = n, E = r;
    }
  }
}
function y(e) {
  var t = e.f, r = (t & K) !== 0;
  if (k !== null && !ue) {
    var n = E !== null && (E.f & Xe) !== 0;
    if (!n && !(H != null && H.includes(e))) {
      var i = k.deps;
      if ((k.f & zt) !== 0)
        e.rv < pt && (e.rv = pt, q === null && i !== null && i[V] === e ? V++ : q === null ? q = [e] : (!Ae || !q.includes(e)) && q.push(e));
      else {
        (k.deps ?? (k.deps = [])).push(e);
        var a = e.reactions;
        a === null ? e.reactions = [k] : a.includes(k) || a.push(k);
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
  if (Ge) {
    if (Ne.has(e))
      return Ne.get(e);
    if (r) {
      s = /** @type {Derived} */
      e;
      var l = s.v;
      return ((s.f & U) === 0 && s.reactions !== null || Sn(s)) && (l = yr(s)), Ne.set(s, l), l;
    }
  } else r && (s = /** @type {Derived} */
  e, Bt(s) && nn(s));
  if ((e.f & He) !== 0)
    throw e.v;
  return e.v;
}
function Sn(e) {
  if (e.v === P) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Ne.has(t) || (t.f & K) !== 0 && Sn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function kr(e) {
  var t = ue;
  try {
    return ue = !0, e();
  } finally {
    ue = t;
  }
}
const Yi = -7169;
function G(e, t) {
  e.f = e.f & Yi | t;
}
const An = /* @__PURE__ */ new Set(), ir = /* @__PURE__ */ new Set();
function Vi(e) {
  for (var t = 0; t < e.length; t++)
    An.add(e[t]);
  for (var r of ir)
    r(e);
}
let Lr = null;
function Et(e) {
  var $;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = (($ = e.composedPath) == null ? void 0 : $.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Lr = e;
  var s = 0, o = Lr === e && e.__root;
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
    at(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var u = k, h = E;
    ne(null), ce(null);
    try {
      for (var c, v = []; a !== null; ) {
        var d = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var p = a["__" + n];
          if (p != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a))
            if (vr(p)) {
              var [_, ...w] = p;
              _.apply(a, [e, ...w]);
            } else
              p.call(a, e);
        } catch (g) {
          c ? v.push(g) : c = g;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        a = d;
      }
      if (c) {
        for (let g of v)
          queueMicrotask(() => {
            throw g;
          });
        throw c;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ne(u), ce(h);
    }
  }
}
function Bi(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ye(e, t) {
  var r = (
    /** @type {Effect} */
    E
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Ke(e, t) {
  var r = (t & Gn) !== 0, n = (t & Kn) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (x)
      return Ye(A, null), A;
    i === void 0 && (i = Bi(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ Oe(i)));
    var s = (
      /** @type {TemplateNode} */
      n || cn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Oe(s)
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
function Wi() {
  if (x)
    return Ye(A, null), A;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = me();
  return e.append(t, r), Ye(t, r), e;
}
function _e(e, t) {
  if (x) {
    E.nodes_end = A, st();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Xi = ["touchstart", "touchmove"];
function Gi(e) {
  return Xi.includes(e);
}
const Ki = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function zi(e) {
  return Ki.includes(
    /** @type {typeof RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let It = !0;
function Fr(e) {
  It = e;
}
function Ji(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Nn(e, t) {
  return On(e, t);
}
function Zi(e, t) {
  rr(), t.intro = t.intro ?? !1;
  const r = t.target, n = x, i = A;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Oe(r)
    ); a && (a.nodeType !== vt || /** @type {Comment} */
    a.data !== jr); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ Pe(a);
    if (!a)
      throw Ze;
    W(!0), X(
      /** @type {Comment} */
      a
    ), st();
    const s = On(e, { ...t, anchor: a });
    if (A === null || A.nodeType !== vt || /** @type {Comment} */
    A.data !== dr)
      throw qt(), Ze;
    return W(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s instanceof Error && s.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw s;
    return s !== Ze && console.warn("Failed to hydrate: ", s), t.recover === !1 && pi(), rr(), hn(r), W(!1), Nn(e, t);
  } finally {
    W(n), X(i);
  }
}
const Je = /* @__PURE__ */ new Map();
function On(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  rr();
  var o = /* @__PURE__ */ new Set(), l = (h) => {
    for (var c = 0; c < h.length; c++) {
      var v = h[c];
      if (!o.has(v)) {
        o.add(v);
        var d = Gi(v);
        t.addEventListener(v, Et, { passive: d });
        var p = Je.get(v);
        p === void 0 ? (document.addEventListener(v, Et, { passive: d }), Je.set(v, 1)) : Je.set(v, p + 1);
      }
    }
  };
  l(hr(An)), ir.add(l);
  var f = void 0, u = Fi(() => {
    var h = r ?? t.appendChild(me());
    return Be(() => {
      if (a) {
        mr({});
        var c = (
          /** @type {ComponentContext} */
          re
        );
        c.c = a;
      }
      i && (n.$$events = i), x && Ye(
        /** @type {TemplateNode} */
        h,
        null
      ), It = s, f = e(h, n) || {}, It = !0, x && (E.nodes_end = A), a && wr();
    }), () => {
      var d;
      for (var c of o) {
        t.removeEventListener(c, Et);
        var v = (
          /** @type {number} */
          Je.get(c)
        );
        --v === 0 ? (document.removeEventListener(c, Et), Je.delete(c)) : Je.set(c, v);
      }
      ir.delete(l), h !== r && ((d = h.parentNode) == null || d.removeChild(h));
    };
  });
  return ar.set(f, u), f;
}
let ar = /* @__PURE__ */ new WeakMap();
function Qi(e, t) {
  const r = ar.get(e);
  return r ? (ar.delete(e), r(t)) : Promise.resolve();
}
function Rn(e) {
  re === null && ui(), nr(() => {
    const t = kr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function dt(e, t, r = !1) {
  x && st();
  var n = e, i = null, a = null, s = P, o = r ? bt : 0, l = !1;
  const f = (v, d = !0) => {
    l = !0, c(d, v);
  };
  var u = null;
  function h() {
    u !== null && (u.lastChild.remove(), n.before(u), u = null);
    var v = s ? i : a, d = s ? a : i;
    v && Vt(v), d && Yt(d, () => {
      s ? a = null : i = null;
    });
  }
  const c = (v, d) => {
    if (s === (s = v)) return;
    let p = !1;
    if (x) {
      const C = Kr(n) === cr;
      !!s === C && (n = Jt(), X(n), W(!1), p = !0);
    }
    var _ = _n(), w = n;
    if (_ && (u = document.createDocumentFragment(), u.append(w = me())), s ? i ?? (i = d && Be(() => d(w))) : a ?? (a = d && Be(() => d(w))), _) {
      var $ = (
        /** @type {Batch} */
        R
      ), g = s ? i : a, N = s ? a : i;
      g && $.skipped_effects.delete(g), N && $.skipped_effects.add(N), $.add_callback(h);
    } else
      h();
    p && W(!0);
  };
  Er(() => {
    l = !1, t(f), l || c(null, null);
  }, o), x && (n = A);
}
function ea(e, t, r) {
  for (var n = e.items, i = [], a = t.length, s = 0; s < a; s++)
    xr(t[s].e, i, !0);
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
    ), n.clear(), fe(e, t[0].prev, t[a - 1].next);
  }
  yn(i, () => {
    for (var f = 0; f < a; f++) {
      var u = t[f];
      o || (n.delete(u.k), fe(e, u.prev, u.next)), oe(u.e, !o);
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
    s = x ? X(
      /** @type {Comment | Text} */
      /* @__PURE__ */ Oe(l)
    ) : l.appendChild(me());
  }
  x && st();
  var f = null, u = !1, h = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ Si(() => {
    var _ = r();
    return vr(_) ? _ : _ == null ? [] : hr(_);
  }), v, d;
  function p() {
    ra(
      d,
      v,
      o,
      h,
      s,
      i,
      t,
      n,
      r
    ), a !== null && (v.length === 0 ? f ? Vt(f) : f = Be(() => a(s)) : f !== null && Yt(f, () => {
      f = null;
    }));
  }
  Er(() => {
    d ?? (d = /** @type {Effect} */
    E), v = /** @type {V[]} */
    y(c);
    var _ = v.length;
    if (u && _ === 0)
      return;
    u = _ === 0;
    let w = !1;
    if (x) {
      var $ = Kr(s) === cr;
      $ !== (_ === 0) && (s = Jt(), X(s), W(!1), w = !0);
    }
    if (x) {
      for (var g = null, N, C = 0; C < _; C++) {
        if (A.nodeType === vt && /** @type {Comment} */
        A.data === dr) {
          s = /** @type {Comment} */
          A, w = !0, W(!1);
          break;
        }
        var T = v[C], L = n(T, C);
        N = sr(
          A,
          o,
          g,
          null,
          T,
          L,
          C,
          i,
          t,
          r
        ), o.items.set(L, N), g = N;
      }
      _ > 0 && X(Jt());
    }
    if (x)
      _ === 0 && a && (f = Be(() => a(s)));
    else if (_n()) {
      var z = /* @__PURE__ */ new Set(), M = (
        /** @type {Batch} */
        R
      );
      for (C = 0; C < _; C += 1) {
        T = v[C], L = n(T, C);
        var ze = o.items.get(L) ?? h.get(L);
        ze || (N = sr(
          null,
          o,
          null,
          null,
          T,
          L,
          C,
          i,
          t,
          r,
          !0
        ), h.set(L, N)), z.add(L);
      }
      for (const [ye, be] of o.items)
        z.has(ye) || M.skipped_effects.add(be.e);
      M.add_callback(p);
    } else
      p();
    w && W(!0), y(c);
  }), x && (s = A);
}
function ra(e, t, r, n, i, a, s, o, l) {
  var f = t.length, u = r.items, h = r.first, c = h, v, d = null, p = [], _ = [], w, $, g, N;
  for (N = 0; N < f; N += 1) {
    if (w = t[N], $ = o(w, N), g = u.get($), g === void 0) {
      var C = n.get($);
      if (C !== void 0) {
        n.delete($), u.set($, C);
        var T = d ? d.next : c;
        fe(r, d, C), fe(r, C, T), Kt(C, T, i), d = C;
      } else {
        var L = c ? (
          /** @type {TemplateNode} */
          c.e.nodes_start
        ) : i;
        d = sr(
          L,
          r,
          d,
          d === null ? r.first : d.next,
          w,
          $,
          N,
          a,
          s,
          l
        );
      }
      u.set($, d), p = [], _ = [], c = d.next;
      continue;
    }
    if ((g.e.f & ae) !== 0 && Vt(g.e), g !== c) {
      if (v !== void 0 && v.has(g)) {
        if (p.length < _.length) {
          var z = _[0], M;
          d = z.prev;
          var ze = p[0], ye = p[p.length - 1];
          for (M = 0; M < p.length; M += 1)
            Kt(p[M], z, i);
          for (M = 0; M < _.length; M += 1)
            v.delete(_[M]);
          fe(r, ze.prev, ye.next), fe(r, d, ze), fe(r, ye, z), c = z, d = ye, N -= 1, p = [], _ = [];
        } else
          v.delete(g), Kt(g, c, i), fe(r, g.prev, g.next), fe(r, g, d === null ? r.first : d.next), fe(r, d, g), d = g;
        continue;
      }
      for (p = [], _ = []; c !== null && c.k !== $; )
        (c.e.f & ae) === 0 && (v ?? (v = /* @__PURE__ */ new Set())).add(c), _.push(c), c = c.next;
      if (c === null)
        continue;
      g = c;
    }
    p.push(g), d = g, c = g.next;
  }
  if (c !== null || v !== void 0) {
    for (var be = v === void 0 ? [] : hr(v); c !== null; )
      (c.e.f & ae) === 0 && be.push(c), c = c.next;
    var b = be.length;
    if (b > 0) {
      var S = f === 0 ? i : null;
      ea(r, be, S);
    }
  }
  e.first = r.first && r.first.e, e.last = d && d.e;
  for (var O of n.values())
    oe(O.e);
  n.clear();
}
function sr(e, t, r, n, i, a, s, o, l, f, u) {
  var h = (l & Vn) !== 0, c = (l & Wn) === 0, v = h ? c ? /* @__PURE__ */ fn(i, !1, !1) : _t(i) : i, d = (l & Bn) === 0 ? s : _t(s), p = {
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
      var _ = document.createDocumentFragment();
      _.append(e = me());
    }
    return p.e = Be(() => o(
      /** @type {Node} */
      e,
      v,
      d,
      f
    ), x), p.e.prev = r && r.e, p.e.next = n && n.e, r === null ? u || (t.first = p) : (r.next = p, r.e.next = p.e), n !== null && (n.prev = p, n.e.prev = p.e), p;
  } finally {
  }
}
function Kt(e, t, r) {
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
      /* @__PURE__ */ Pe(a)
    );
    i.before(a), a = s;
  }
}
function fe(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function na(e, t, r, n, i, a) {
  let s = x;
  x && st();
  var o, l, f = null;
  x && A.nodeType === li && (f = /** @type {Element} */
  A, st());
  var u = (
    /** @type {TemplateNode} */
    x ? A : e
  ), h;
  Er(() => {
    const c = t() || null;
    var v = c === "svg" ? Jn : null;
    c !== o && (h && (c === null ? Yt(h, () => {
      h = null, l = null;
    }) : c === l ? Vt(h) : (oe(h), Fr(!1))), c && c !== l && (h = Be(() => {
      if (f = x ? (
        /** @type {Element} */
        f
      ) : v ? document.createElementNS(v, c) : document.createElement(c), Ye(f, f), n) {
        x && zi(c) && f.append(document.createComment(""));
        var d = (
          /** @type {TemplateNode} */
          x ? /* @__PURE__ */ Oe(f) : f.appendChild(me())
        );
        x && (d === null ? W(!1) : X(d)), n(f, d);
      }
      E.nodes_end = f, u.before(f);
    })), o = c, o && (l = o), Fr(!0));
  }, bt), s && (W(!0), X(u));
}
function Mn(e, t) {
  br(() => {
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
  if (x || s !== r || s === void 0) {
    var o = ia(r, n);
    (!x || o !== e.getAttribute("class")) && (o == null ? e.removeAttribute("class") : e.className = o), e.__className = r;
  }
  return a;
}
function ke(e, t, r, n) {
  var i = e.__style;
  if (x || i !== t) {
    var a = aa(t);
    (!x || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const sa = Symbol("is custom element"), oa = Symbol("is html");
function Pn(e, t, r, n) {
  var i = la(e);
  x && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[oi] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && In(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Dr(e, t, r) {
  var n = k, i = E;
  let a = x;
  x && W(!1), ne(null), ce(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (or.has(e.getAttribute("is") || e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.getAttribute("is") || e.tagName.toLowerCase()) ? In(e).includes(t) : r && typeof r == "object") ? e[t] = r : Pn(e, t, r == null ? r : String(r));
  } finally {
    ne(n), ce(i), a && W(!0);
  }
}
function la(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [sa]: e.nodeName.includes("-"),
      [oa]: e.namespaceURI === zn
    })
  );
}
var or = /* @__PURE__ */ new Map();
function In(e) {
  var t = e.getAttribute("is") || e.nodeName, r = or.get(t);
  if (r) return r;
  or.set(t, r = []);
  for (var n, i = e, a = Element.prototype; a !== i; ) {
    n = Qn(i);
    for (var s in n)
      n[s].set && r.push(s);
    i = Vr(i);
  }
  return r;
}
const fa = () => performance.now(), ge = {
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
function Ln() {
  const e = ge.now();
  ge.tasks.forEach((t) => {
    t.c(e) || (ge.tasks.delete(t), t.f());
  }), ge.tasks.size !== 0 && ge.tick(Ln);
}
function ua(e) {
  let t;
  return ge.tasks.size === 0 && ge.tick(Ln), {
    promise: new Promise((r) => {
      ge.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      ge.tasks.delete(t);
    }
  };
}
function xt(e, t) {
  jt(() => {
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
function qr(e) {
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
function Fn(e, t, r, n) {
  var i = (e & Xn) !== 0, a = "both", s, o = t.inert, l = t.style.overflow, f, u;
  function h() {
    return jt(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var c = {
    is_global: i,
    in() {
      t.inert = o, xt(t, "introstart"), f = lr(t, h(), u, 1, () => {
        xt(t, "introend"), f == null || f.abort(), f = s = void 0, t.style.overflow = l;
      });
    },
    out(_) {
      t.inert = !0, xt(t, "outrostart"), u = lr(t, h(), f, 0, () => {
        xt(t, "outroend"), _ == null || _();
      });
    },
    stop: () => {
      f == null || f.abort(), u == null || u.abort();
    }
  }, v = (
    /** @type {Effect} */
    E
  );
  if ((v.transitions ?? (v.transitions = [])).push(c), It) {
    var d = i;
    if (!d) {
      for (var p = (
        /** @type {Effect | null} */
        v.parent
      ); p && (p.f & bt) !== 0; )
        for (; (p = p.parent) && (p.f & We) === 0; )
          ;
      d = !p || (p.f & Dt) !== 0;
    }
    d && br(() => {
      kr(() => c.in());
    });
  }
}
function lr(e, t, r, n, i) {
  var a = n === 1;
  if (ri(t)) {
    var s, o = !1;
    return tn(() => {
      if (!o) {
        var _ = t({ direction: a ? "in" : "out" });
        s = lr(e, _, r, n, i);
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
      abort: ut,
      deactivate: ut,
      reset: ut,
      t: () => n
    };
  const { delay: l = 0, css: f, tick: u, easing: h = da } = t;
  var c = [];
  if (a && r === void 0 && (u && u(0, 1), f)) {
    var v = qr(f(0, 1));
    c.push(v, v);
  }
  var d = () => 1 - n, p = e.animate(c, { duration: l, fill: "forwards" });
  return p.onfinish = () => {
    p.cancel();
    var _ = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var w = n - _, $ = (
      /** @type {number} */
      t.duration * Math.abs(w)
    ), g = [];
    if ($ > 0) {
      var N = !1;
      if (f)
        for (var C = Math.ceil($ / 16.666666666666668), T = 0; T <= C; T += 1) {
          var L = _ + w * h(T / C), z = qr(f(L, 1 - L));
          g.push(z), N || (N = z.overflow === "hidden");
        }
      N && (e.style.overflow = "hidden"), d = () => {
        var M = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          p.currentTime
        );
        return _ + w * h(M / $);
      }, u && ua(() => {
        if (p.playState !== "running") return !1;
        var M = d();
        return u(M, 1 - M), !0;
      });
    }
    p = e.animate(g, { duration: $, fill: "forwards" }), p.onfinish = () => {
      d = () => n, u == null || u(n, 1 - n), i();
    };
  }, {
    abort: () => {
      p && (p.cancel(), p.effect = null, p.onfinish = ut);
    },
    deactivate: () => {
      i = ut;
    },
    reset: () => {
      n === 0 && (u == null || u(1, 0));
    },
    t: () => d()
  };
}
function Ur(e, t) {
  return e === t || (e == null ? void 0 : e[kt]) === t;
}
function va(e = {}, t, r, n) {
  return br(() => {
    var i, a;
    return gn(() => {
      i = a, a = [], kr(() => {
        e !== r(...a) && (t(e, ...a), i && Ur(r(...i), e) && t(null, ...i));
      });
    }), () => {
      tn(() => {
        a && Ur(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function Ce(e, t, r, n) {
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
  var f = !1, u = /* @__PURE__ */ Ut(() => (f = !1, l())), h = (
    /** @type {Effect} */
    E
  );
  return (
    /** @type {() => V} */
    (function(c, v) {
      if (arguments.length > 0) {
        const d = v ? y(u) : c;
        return I(u, d), f = !0, i !== void 0 && (i = d), c;
      }
      return Ge && f || (h.f & Xe) !== 0 ? u.v : y(u);
    })
  );
}
function ha(e) {
  return new _a(e);
}
var pe, Q;
class _a {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    D(this, pe);
    /** @type {Record<string, any>} */
    D(this, Q);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, o) => {
      var l = /* @__PURE__ */ fn(o, !1, !1);
      return r.set(s, l), l;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, o) {
          return y(r.get(o) ?? n(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === si ? !0 : (y(r.get(o) ?? n(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, l) {
          return I(r.get(o) ?? n(o, l), l), Reflect.set(s, o, l);
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
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && he(), Y(this, pe, i.$$events);
    for (const s of Object.keys(m(this, Q)))
      s === "$set" || s === "$destroy" || s === "$on" || at(this, s, {
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
    m(this, pe)[t] = m(this, pe)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return m(this, pe)[t].push(n), () => {
      m(this, pe)[t] = m(this, pe)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    m(this, Q).$destroy();
  }
}
pe = new WeakMap(), Q = new WeakMap();
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
          i !== "default" && (s.name = i), _e(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = pa(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = At(a, i.value, this.$$p_d, "toProp"));
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
      }), this.$$me = Li(() => {
        gn(() => {
          var i;
          this.$$r = !0;
          for (const a of Nt(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = At(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = At(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
    return Nt(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function At(e, t, r, n) {
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
      return Nt(t).map(
        (o) => (t[o].attribute || o).toLowerCase()
      );
    }
  };
  return Nt(t).forEach((o) => {
    at(s.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var h;
        l = At(o, l, t), this.$$d[o] = l;
        var f = this.$$c;
        if (f) {
          var u = (h = Qe(f, o)) == null ? void 0 : h.get;
          u ? f[o] = l : f.$set({ [o]: l });
        }
      }
    });
  }), n.forEach((o) => {
    at(s.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let Lt = /* @__PURE__ */ B(void 0);
const ga = async () => (I(Lt, await window.loadCardHelpers().then((e) => e), !0), y(Lt)), ma = () => y(Lt) ? y(Lt) : ga();
function wa(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Un(e, { delay: t = 0, duration: r = 400, easing: n = wa, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, o = i === "y" ? "height" : "width", l = parseFloat(a[o]), f = i === "y" ? ["top", "bottom"] : ["left", "right"], u = f.map(
    (w) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${w[0].toUpperCase()}${w.slice(1)}`
    )
  ), h = parseFloat(a[`padding${u[0]}`]), c = parseFloat(a[`padding${u[1]}`]), v = parseFloat(a[`margin${u[0]}`]), d = parseFloat(a[`margin${u[1]}`]), p = parseFloat(
    a[`border${u[0]}Width`]
  ), _ = parseFloat(
    a[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (w) => `overflow: hidden;opacity: ${Math.min(w * 20, 1) * s};${o}: ${w * l}px;padding-${f[0]}: ${w * h}px;padding-${f[1]}: ${w * c}px;margin-${f[0]}: ${w * v}px;margin-${f[1]}: ${w * d}px;border-${f[0]}-width: ${w * p}px;border-${f[1]}-width: ${w * _}px;min-${o}: 0`
  };
}
function Hn(e) {
  const t = e - 1;
  return t * t * t + 1;
}
var $a = /* @__PURE__ */ Ke('<span class="loading svelte-1v98vwq">Loading...</span>'), ya = /* @__PURE__ */ Ke('<div class="outer-container"><!> <!></div>');
const ba = {
  hash: "svelte-1v98vwq",
  code: ".loading.svelte-1v98vwq {padding:1em;display:block;}"
};
function fr(e, t) {
  mr(t, !0), Mn(e, ba);
  const r = Ce(t, "type", 7, "div"), n = Ce(t, "config"), i = Ce(t, "hass"), a = Ce(t, "marginTop", 7, "0px"), s = Ce(t, "open"), o = Ce(t, "clearCardCss", 7, !1);
  let l = /* @__PURE__ */ B(void 0), f = /* @__PURE__ */ B(!0);
  nr(() => {
    y(l) && (y(l).hass = i());
  }), nr(() => {
    var $, g;
    const w = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    (g = ($ = y(l)) == null ? void 0 : $.setConfig) == null || g.call($, w);
  }), Rn(async () => {
    const _ = await ma(), $ = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, g = _.createCardElement($);
    g.hass = i(), y(l) && (o() && new MutationObserver(() => {
      u(g);
    }).observe(g, { childList: !0, subtree: !0 }), y(l).replaceWith(g), I(l, g, !0), I(f, !1));
  });
  function u(_, w = 5) {
    let $ = 0;
    const g = () => {
      const N = [];
      function C(T) {
        if (T instanceof Element && T.tagName.toLowerCase() === "ha-card") {
          N.push(T);
          return;
        }
        T.shadowRoot && C(T.shadowRoot), (T instanceof ShadowRoot || T instanceof Element ? Array.from(T.children) : []).forEach(C);
      }
      C(_), N.length > 0 ? N.forEach((T) => {
        T.style.setProperty("border", "none", "important"), T.style.setProperty("background", "transparent", "important"), T.style.setProperty("box-shadow", "none", "important");
      }) : ($++, $ < w && requestAnimationFrame(g));
    };
    g();
  }
  var h = {
    get type() {
      return r();
    },
    set type(_ = "div") {
      r(_), he();
    },
    get config() {
      return n();
    },
    set config(_) {
      n(_), he();
    },
    get hass() {
      return i();
    },
    set hass(_) {
      i(_), he();
    },
    get marginTop() {
      return a();
    },
    set marginTop(_ = "0px") {
      a(_), he();
    },
    get open() {
      return s();
    },
    set open(_) {
      s(_), he();
    },
    get clearCardCss() {
      return o();
    },
    set clearCardCss(_ = !1) {
      o(_), he();
    }
  }, c = ya(), v = De(c);
  na(v, r, !1, (_, w) => {
    va(_, ($) => I(l, $, !0), () => y(l)), Fn(3, _, () => Un, () => ({ duration: 500, easing: Hn }));
  });
  var d = St(v, 2);
  {
    var p = (_) => {
      var w = $a();
      _e(_, w);
    };
    dt(d, (_) => {
      y(f) && _(p);
    });
  }
  return Ee(c), xe(() => ke(c, `margin-top: ${(s() ? a() : "0px") ?? ""};`)), _e(e, c), wr(h);
}
customElements.define("expander-sub-card", qn(
  fr,
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
const ur = {
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
var Ea = /* @__PURE__ */ Ke('<button aria-label="Toggle button"><ha-icon></ha-icon></button>', 2), xa = /* @__PURE__ */ Ke('<div id="id1"><div id="id2" class="title-card-container svelte-oxkseo"><!></div> <!></div>'), ka = /* @__PURE__ */ Ke("<button><div> </div> <ha-icon></ha-icon></button>", 2), Ca = /* @__PURE__ */ Ke('<div class="children-container svelte-oxkseo"></div>'), Ta = /* @__PURE__ */ Ke("<ha-card><!> <!></ha-card>", 2);
const Sa = {
  hash: "svelte-oxkseo",
  code: ".expander-card.svelte-oxkseo {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-oxkseo {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);transition:all 0.3s ease-in-out;}.clear.svelte-oxkseo {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-oxkseo {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-oxkseo {display:block;}.title-card-container.svelte-oxkseo {width:100%;padding:var(--title-padding);}.header.svelte-oxkseo {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-oxkseo {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-oxkseo {width:100%;text-align:left;}.ico.svelte-oxkseo {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-oxkseo {transform:rotate(var(--icon-rotate-degree,180deg));}.ripple.svelte-oxkseo {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-oxkseo:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-oxkseo:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function Aa(e, t) {
  var ye, be;
  mr(t, !0), Mn(e, Sa);
  const r = Ce(t, "hass"), n = Ce(t, "config", 7, ur);
  let i = /* @__PURE__ */ B(!1), a = /* @__PURE__ */ B(!1);
  const s = n()["storage-id"] ?? n()["storgage-id"], o = "expander-open-" + s, l = n()["show-button-users"] === void 0 || ((be = n()["show-button-users"]) == null ? void 0 : be.includes((ye = r()) == null ? void 0 : ye.user.name));
  function f() {
    u(!y(a));
  }
  function u(b) {
    if (I(a, b, !0), s !== void 0)
      try {
        localStorage.setItem(o, y(a) ? "true" : "false");
      } catch (S) {
        console.error(S);
      }
  }
  Rn(() => {
    var de, le;
    const b = n()["min-width-expanded"], S = n()["max-width-expanded"], O = document.body.offsetWidth;
    if (b && S ? n().expanded = O >= b && O <= S : b ? n().expanded = O >= b : S && (n().expanded = O <= S), (le = n()["start-expanded-users"]) != null && le.includes((de = r()) == null ? void 0 : de.user.name))
      u(!0);
    else if (s !== void 0)
      try {
        const j = localStorage.getItem(o);
        j === null ? n().expanded !== void 0 && u(n().expanded) : I(a, j ? j === "true" : y(a), !0);
      } catch (j) {
        console.error(j);
      }
    else
      n().expanded !== void 0 && u(n().expanded);
  });
  const h = (b) => {
    if (y(i))
      return b.preventDefault(), b.stopImmediatePropagation(), I(i, !1), !1;
    f();
  }, c = (b) => {
    const S = b.currentTarget;
    S != null && S.classList.contains("title-card-container") && h(b);
  };
  let v, d = !1, p = 0, _ = 0;
  const w = (b) => {
    v = b.target, p = b.touches[0].clientX, _ = b.touches[0].clientY, d = !1;
  }, $ = (b) => {
    const S = b.touches[0].clientX, O = b.touches[0].clientY;
    (Math.abs(S - p) > 10 || Math.abs(O - _) > 10) && (d = !0);
  }, g = (b) => {
    !d && v === b.target && n()["title-card-clickable"] && f(), v = void 0, I(i, !0);
  };
  var N = {
    get hass() {
      return r();
    },
    set hass(b) {
      r(b), he();
    },
    get config() {
      return n();
    },
    set config(b = ur) {
      n(b), he();
    }
  }, C = Ta(), T = De(C);
  {
    var L = (b) => {
      var S = xa(), O = De(S);
      O.__touchstart = w, O.__touchmove = $, O.__touchend = g, O.__click = function(...J) {
        var ie;
        (ie = n()["title-card-clickable"] ? c : null) == null || ie.apply(this, J);
      };
      var de = De(O);
      {
        let J = /* @__PURE__ */ Ar(() => n()["clear-children"] || !1);
        fr(de, {
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
            return y(J);
          }
        });
      }
      Ee(O);
      var le = St(O, 2);
      {
        var j = (J) => {
          var ie = Ea();
          ie.__click = h;
          var Ie = De(ie);
          xe(() => Dr(Ie, "icon", n().icon)), Ee(ie), xe(() => {
            ke(ie, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Fe(ie, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${y(a) ? " open" : " close"}`, "svelte-oxkseo"), ke(Ie, `--arrow-color:${n()["arrow-color"] ?? ""}`), Fe(Ie, 1, `ico${y(a) ? " flipped open" : "close"}`, "svelte-oxkseo");
          }), _e(J, ie);
        };
        dt(le, (J) => {
          l && J(j);
        });
      }
      Ee(S), xe(() => {
        Fe(S, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-oxkseo"), ke(O, `--title-padding:${n()["title-card-padding"] ?? ""}`), Pn(O, "role", n()["title-card-clickable"] ? "button" : void 0);
      }), _e(b, S);
    }, z = (b) => {
      var S = Wi(), O = Mi(S);
      {
        var de = (le) => {
          var j = ka();
          j.__click = h;
          var J = De(j), ie = De(J, !0);
          Ee(J);
          var Ie = St(J, 2);
          xe(() => Dr(Ie, "icon", n().icon)), Ee(j), xe(() => {
            Fe(j, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${y(a) ? " open" : " close"}`, "svelte-oxkseo"), ke(j, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Fe(J, 1, `primary title${y(a) ? " open" : " close"}`, "svelte-oxkseo"), Ji(ie, n().title), ke(Ie, `--arrow-color:${n()["arrow-color"] ?? ""}`), Fe(Ie, 1, `ico${y(a) ? " flipped open" : " close"}`, "svelte-oxkseo");
          }), _e(le, j);
        };
        dt(O, (le) => {
          l && le(de);
        });
      }
      _e(b, S);
    };
    dt(T, (b) => {
      n()["title-card"] ? b(L) : b(z, !1);
    });
  }
  var M = St(T, 2);
  {
    var ze = (b) => {
      var S = Ca();
      ta(S, 20, () => n().cards, (O) => O, (O, de) => {
        {
          let le = /* @__PURE__ */ Ar(() => n()["clear-children"] || !1);
          fr(O, {
            get hass() {
              return r();
            },
            get config() {
              return de;
            },
            get type() {
              return de.type;
            },
            get marginTop() {
              return n()["child-margin-top"];
            },
            get open() {
              return y(a);
            },
            get clearCardCss() {
              return y(le);
            }
          });
        }
      }), Ee(S), xe(() => ke(S, `--expander-card-display:${n()["expander-card-display"] ?? ""};
             --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${(y(a) ? n()["child-padding"] : "0px") ?? ""};`)), Fn(3, S, () => Un, () => ({ duration: 500, easing: Hn })), _e(b, S);
    };
    dt(M, (b) => {
      n().cards && b(ze);
    });
  }
  return Ee(C), xe(() => {
    Fe(C, 1, `expander-card${n().clear ? " clear" : ""}${y(a) ? " open" : " close"}`, "svelte-oxkseo"), ke(C, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${y(a) ?? ""};
     --icon-rotate-degree:${n()["icon-rotate-degree"] ?? ""};
     --card-background:${(y(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}
    `);
  }), _e(e, C), wr(N);
}
Vi(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", qn(Aa, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    F(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...ur, ...r };
  }
}));
const Na = "2.6.5";
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
