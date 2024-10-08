var Dn = Object.defineProperty;
var Pt = (e) => {
  throw TypeError(e);
};
var Mn = (e, t, n) => t in e ? Dn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var H = (e, t, n) => Mn(e, typeof t != "symbol" ? t + "" : t, n), It = (e, t, n) => t.has(e) || Pt("Cannot " + n);
var O = (e, t, n) => (It(e, t, "read from private field"), n ? n.call(e) : t.get(e)), st = (e, t, n) => t.has(e) ? Pt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), lt = (e, t, n, r) => (It(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n);
const Fn = "5";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(Fn);
const Hn = 1, Bn = 2, Un = 16, Yn = 1, jn = 2, Vn = 4, Wn = 8, Kn = 16, zn = 4, Gn = 1, Xn = 2, Gt = "[", bt = "[!", kt = "]", Ae = {}, P = Symbol(), Jn = "http://www.w3.org/2000/svg", Xt = !1;
function Et(e) {
  console.warn("hydration_mismatch");
}
var xt = Array.isArray, Tt = Array.from, je = Object.keys, Ve = Object.defineProperty, ae = Object.getOwnPropertyDescriptor, Jt = Object.getOwnPropertyDescriptors, Zn = Object.prototype, Qn = Array.prototype, We = Object.getPrototypeOf;
function er(e) {
  return typeof e == "function";
}
const Fe = () => {
};
function tr(e) {
  return e();
}
function ut(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const W = 2, Zt = 4, me = 8, At = 16, te = 32, tt = 64, le = 128, Ke = 256, q = 512, Q = 1024, qe = 2048, ee = 4096, Re = 8192, Qt = 16384, Pe = 32768, nr = 65536, rr = 1 << 18, en = 1 << 19, he = Symbol("$state"), ir = Symbol("");
function tn(e) {
  return e === this.v;
}
function nn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Ct(e) {
  return !nn(e, this.v);
}
function ar(e) {
  throw new Error("effect_in_teardown");
}
function sr() {
  throw new Error("effect_in_unowned_derived");
}
function lr(e) {
  throw new Error("effect_orphan");
}
function or() {
  throw new Error("effect_update_depth_exceeded");
}
function ur() {
  throw new Error("hydration_failed");
}
function fr(e) {
  throw new Error("props_invalid_value");
}
function cr() {
  throw new Error("state_descriptors_fixed");
}
function dr() {
  throw new Error("state_prototype_fixed");
}
function vr() {
  throw new Error("state_unsafe_local_read");
}
function hr() {
  throw new Error("state_unsafe_mutation");
}
function L(e) {
  return {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: tn,
    version: 0
  };
}
function ft(e) {
  return /* @__PURE__ */ rn(L(e));
}
// @__NO_SIDE_EFFECTS__
function nt(e) {
  var n;
  const t = L(e);
  return t.equals = Ct, C !== null && C.l !== null && ((n = C.l).s ?? (n.s = [])).push(t), t;
}
function Lt(e) {
  return /* @__PURE__ */ rn(/* @__PURE__ */ nt(e));
}
// @__NO_SIDE_EFFECTS__
function rn(e) {
  return T !== null && T.f & W && (U === null ? kr([e]) : U.push(e)), e;
}
function N(e, t) {
  return T !== null && vt() && T.f & W && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (U === null || !U.includes(e)) && hr(), e.equals(t) || (e.v = t, e.version = gn(), an(e, Q), vt() && k !== null && k.f & q && !(k.f & te) && (S !== null && S.includes(e) ? (Y(k, Q), at(k)) : Z === null ? Er([e]) : Z.push(e))), t;
}
function an(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = vt(), a = n.length, i = 0; i < a; i++) {
      var s = n[i], u = s.f;
      u & Q || !r && s === k || (Y(s, t), u & (q | le) && (u & W ? an(
        /** @type {Derived} */
        s,
        qe
      ) : at(
        /** @type {Effect} */
        s
      )));
    }
}
function sn(e) {
  k === null && T === null && lr(), T !== null && T.f & le && sr(), Ot && ar();
}
function _r(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function we(e, t, n, r = !0) {
  var a = (e & tt) !== 0, i = k, s = {
    ctx: C,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | Q,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: a ? null : i,
    prev: null,
    teardown: null,
    transitions: null,
    version: 0
  };
  if (n) {
    var u = _e;
    try {
      Dt(!0), it(s), s.f |= Qt;
    } catch (f) {
      throw oe(s), f;
    } finally {
      Dt(u);
    }
  } else t !== null && at(s);
  var o = n && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & en) === 0;
  if (!o && !a && r && (i !== null && _r(s, i), T !== null && T.f & W)) {
    var l = (
      /** @type {Derived} */
      T
    );
    (l.children ?? (l.children = [])).push(s);
  }
  return s;
}
function pr(e) {
  const t = we(me, null, !1);
  return Y(t, q), t.teardown = e, t;
}
function ze(e) {
  sn();
  var t = k !== null && (k.f & me) !== 0 && // TODO do we actually need this? removing them changes nothing
  C !== null && !C.m;
  if (t) {
    var n = (
      /** @type {ComponentContext} */
      C
    );
    (n.e ?? (n.e = [])).push({
      fn: e,
      effect: k,
      reaction: T
    });
  } else {
    var r = Ie(e);
    return r;
  }
}
function gr(e) {
  return sn(), Le(e);
}
function ln(e) {
  const t = we(tt, e, !0);
  return () => {
    oe(t);
  };
}
function Ie(e) {
  return we(Zt, e, !1);
}
function Le(e) {
  return we(me, e, !0);
}
function Ee(e) {
  return Le(e);
}
function Nt(e, t = 0) {
  return we(me | At | t, e, !0);
}
function $e(e, t = !0) {
  return we(me | te, e, !0, t);
}
function on(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ot, r = T;
    Mt(!0), Je(null);
    try {
      t.call(null);
    } finally {
      Mt(n), Je(r);
    }
  }
}
function oe(e, t = !0) {
  var n = !1;
  if ((t || e.f & rr) && e.nodes_start !== null) {
    for (var r = e.nodes_start, a = e.nodes_end; r !== null; ) {
      var i = r === a ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ue(r)
      );
      r.remove(), r = i;
    }
    n = !0;
  }
  yn(e, t && !n), Oe(e, 0), Y(e, Re);
  var s = e.transitions;
  if (s !== null)
    for (const o of s)
      o.stop();
  on(e);
  var u = e.parent;
  u !== null && u.first !== null && un(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.parent = e.fn = e.nodes_start = e.nodes_end = null;
}
function un(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ge(e, t) {
  var n = [];
  St(e, n, !0), fn(n, () => {
    oe(e), t && t();
  });
}
function fn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var a of e)
      a.out(r);
  } else
    t();
}
function St(e, t, n) {
  if (!(e.f & ee)) {
    if (e.f ^= ee, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || n) && t.push(s);
    for (var r = e.first; r !== null; ) {
      var a = r.next, i = (r.f & Pe) !== 0 || (r.f & te) !== 0;
      St(r, t, i ? n : !1), r = a;
    }
  }
}
function Ne(e) {
  cn(e, !0);
}
function cn(e, t) {
  if (e.f & ee) {
    e.f ^= ee, De(e) && it(e);
    for (var n = e.first; n !== null; ) {
      var r = n.next, a = (n.f & Pe) !== 0 || (n.f & te) !== 0;
      cn(n, a ? t : !1), n = r;
    }
    if (e.transitions !== null)
      for (const i of e.transitions)
        (i.is_global || t) && i.in();
  }
}
let Xe = !1, ct = [];
function dn() {
  Xe = !1;
  const e = ct.slice();
  ct = [], ut(e);
}
function rt(e) {
  Xe || (Xe = !0, queueMicrotask(dn)), ct.push(e);
}
function $r() {
  Xe && dn();
}
// @__NO_SIDE_EFFECTS__
function dt(e) {
  let t = W | Q;
  k === null ? t |= le : k.f |= en;
  const n = {
    children: null,
    deps: null,
    equals: tn,
    f: t,
    fn: e,
    reactions: null,
    v: (
      /** @type {V} */
      null
    ),
    version: 0,
    parent: k
  };
  if (T !== null && T.f & W) {
    var r = (
      /** @type {Derived} */
      T
    );
    (r.children ?? (r.children = [])).push(n);
  }
  return n;
}
// @__NO_SIDE_EFFECTS__
function yr(e) {
  const t = /* @__PURE__ */ dt(e);
  return t.equals = Ct, t;
}
function vn(e) {
  var t = e.children;
  if (t !== null) {
    e.children = null;
    for (var n = 0; n < t.length; n += 1) {
      var r = t[n];
      r.f & W ? mr(
        /** @type {Derived} */
        r
      ) : oe(
        /** @type {Effect} */
        r
      );
    }
  }
}
function hn(e) {
  var t, n = k;
  Ze(e.parent);
  try {
    vn(e), t = $n(e);
  } finally {
    Ze(n);
  }
  var r = (ce || e.f & le) && e.deps !== null ? qe : q;
  Y(e, r), e.equals(t) || (e.v = t, e.version = gn());
}
function mr(e) {
  vn(e), Oe(e, 0), Y(e, Re), e.children = e.deps = e.reactions = // @ts-expect-error `signal.fn` cannot be `null` while the signal is alive
  e.fn = null;
}
function wr(e) {
  throw new Error("lifecycle_outside_component");
}
const _n = 0, br = 1;
let Be = _n, Se = !1, _e = !1, Ot = !1;
function Dt(e) {
  _e = e;
}
function Mt(e) {
  Ot = e;
}
let re = [], pe = 0;
let T = null;
function Je(e) {
  T = e;
}
let k = null;
function Ze(e) {
  k = e;
}
let U = null;
function kr(e) {
  U = e;
}
let S = null, I = 0, Z = null;
function Er(e) {
  Z = e;
}
let pn = 0, ce = !1, C = null;
function gn() {
  return ++pn;
}
function vt() {
  return C !== null && C.l === null;
}
function De(e) {
  var s, u;
  var t = e.f;
  if (t & Q)
    return !0;
  if (t & qe) {
    var n = e.deps, r = (t & le) !== 0;
    if (n !== null) {
      var a;
      if (t & Ke) {
        for (a = 0; a < n.length; a++)
          ((s = n[a]).reactions ?? (s.reactions = [])).push(e);
        e.f ^= Ke;
      }
      for (a = 0; a < n.length; a++) {
        var i = n[a];
        if (De(
          /** @type {Derived} */
          i
        ) && hn(
          /** @type {Derived} */
          i
        ), r && k !== null && !ce && !((u = i == null ? void 0 : i.reactions) != null && u.includes(e)) && (i.reactions ?? (i.reactions = [])).push(e), i.version > e.version)
          return !0;
      }
    }
    r || Y(e, q);
  }
  return !1;
}
function xr(e, t, n) {
  throw e;
}
function $n(e) {
  var f;
  var t = S, n = I, r = Z, a = T, i = ce, s = U;
  S = /** @type {null | Value[]} */
  null, I = 0, Z = null, T = e.f & (te | tt) ? null : e, ce = !_e && (e.f & le) !== 0, U = null;
  try {
    var u = (
      /** @type {Function} */
      (0, e.fn)()
    ), o = e.deps;
    if (S !== null) {
      var l;
      if (Oe(e, I), o !== null && I > 0)
        for (o.length = I + S.length, l = 0; l < S.length; l++)
          o[I + l] = S[l];
      else
        e.deps = o = S;
      if (!ce)
        for (l = I; l < o.length; l++)
          ((f = o[l]).reactions ?? (f.reactions = [])).push(e);
    } else o !== null && I < o.length && (Oe(e, I), o.length = I);
    return u;
  } finally {
    S = t, I = n, Z = r, T = a, ce = i, U = s;
  }
}
function Tr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = n.indexOf(e);
    if (r !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[r] = n[a], n.pop());
    }
  }
  n === null && t.f & W && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !S.includes(t)) && (Y(t, qe), t.f & (le | Ke) || (t.f ^= Ke), Oe(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Oe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Tr(e, n[r]);
}
function yn(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    var r = n.next;
    oe(n, t), n = r;
  }
}
function it(e) {
  var t = e.f;
  if (!(t & Re)) {
    Y(e, q);
    var n = k, r = C;
    k = e, C = e.ctx;
    try {
      t & At || yn(e), on(e);
      var a = $n(e);
      e.teardown = typeof a == "function" ? a : null, e.version = pn;
    } catch (i) {
      xr(
        /** @type {Error} */
        i
      );
    } finally {
      k = n, C = r;
    }
  }
}
function mn() {
  pe > 1e3 && (pe = 0, or()), pe++;
}
function wn(e) {
  var t = e.length;
  if (t !== 0) {
    mn();
    var n = _e;
    _e = !0;
    try {
      for (var r = 0; r < t; r++) {
        var a = e[r];
        a.f & q || (a.f ^= q);
        var i = [];
        bn(a, i), Ar(i);
      }
    } finally {
      _e = n;
    }
  }
}
function Ar(e) {
  var t = e.length;
  if (t !== 0)
    for (var n = 0; n < t; n++) {
      var r = e[n];
      !(r.f & (Re | ee)) && De(r) && (it(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null ? un(r) : r.fn = null));
    }
}
function Cr() {
  if (Se = !1, pe > 1001)
    return;
  const e = re;
  re = [], wn(e), Se || (pe = 0);
}
function at(e) {
  Be === _n && (Se || (Se = !0, queueMicrotask(Cr)));
  for (var t = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (n & (tt | te)) {
      if (!(n & q)) return;
      t.f ^= q;
    }
  }
  re.push(t);
}
function bn(e, t) {
  var n = e.first, r = [];
  e: for (; n !== null; ) {
    var a = n.f, i = (a & te) !== 0, s = i && (a & q) !== 0;
    if (!s && !(a & ee))
      if (a & me) {
        i ? n.f ^= q : De(n) && it(n);
        var u = n.first;
        if (u !== null) {
          n = u;
          continue;
        }
      } else a & Zt && r.push(n);
    var o = n.next;
    if (o === null) {
      let c = n.parent;
      for (; c !== null; ) {
        if (e === c)
          break e;
        var l = c.next;
        if (l !== null) {
          n = l;
          continue e;
        }
        c = c.parent;
      }
    }
    n = o;
  }
  for (var f = 0; f < r.length; f++)
    u = r[f], t.push(u), bn(u, t);
}
function X(e) {
  var t = Be, n = re;
  try {
    mn();
    const a = [];
    Be = br, re = a, Se = !1, wn(n);
    var r = e == null ? void 0 : e();
    return $r(), (re.length > 0 || a.length > 0) && X(), pe = 0, r;
  } finally {
    Be = t, re = n;
  }
}
function y(e) {
  var t = e.f;
  if (t & Re)
    return e.v;
  if (T !== null) {
    U !== null && U.includes(e) && vr();
    var n = T.deps;
    S === null && n !== null && n[I] === e ? I++ : S === null ? S = [e] : S.push(e), Z !== null && k !== null && k.f & q && !(k.f & te) && Z.includes(e) && (Y(k, Q), at(k));
  }
  if (t & W) {
    var r = (
      /** @type {Derived} */
      e
    );
    De(r) && hn(r);
  }
  return e.v;
}
function be(e) {
  const t = T;
  try {
    return T = null, e();
  } finally {
    T = t;
  }
}
const Nr = ~(Q | qe | q);
function Y(e, t) {
  e.f = e.f & Nr | t;
}
function qt(e, t = !1, n) {
  C = {
    p: C,
    c: null,
    e: null,
    m: !1,
    s: e,
    x: null,
    l: null
  }, t || (C.l = {
    s: null,
    u: null,
    r1: [],
    r2: L(!1)
  });
}
function Rt(e) {
  const t = C;
  if (t !== null) {
    e !== void 0 && (t.x = e);
    const s = t.e;
    if (s !== null) {
      var n = k, r = T;
      t.e = null;
      try {
        for (var a = 0; a < s.length; a++) {
          var i = s[a];
          Ze(i.effect), Je(i.reaction), Ie(i.fn);
        }
      } finally {
        Ze(n), Je(r);
      }
    }
    C = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
function kn(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (he in e)
      ht(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && he in n && ht(n);
      }
  }
}
function ht(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        ht(e[r], t);
      } catch {
      }
    const n = We(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = Jt(n);
      for (let a in r) {
        const i = r[a].get;
        if (i)
          try {
            i.call(e);
          } catch {
          }
      }
    }
  }
}
function V(e, t = null, n) {
  if (typeof e != "object" || e === null || he in e)
    return e;
  const r = We(e);
  if (r !== Zn && r !== Qn)
    return e;
  var a = /* @__PURE__ */ new Map(), i = xt(e), s = L(0);
  i && a.set("length", L(
    /** @type {any[]} */
    e.length
  ));
  var u;
  return new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && cr();
        var c = a.get(l);
        return c === void 0 ? (c = L(f.value), a.set(l, c)) : N(c, V(f.value, u)), !0;
      },
      deleteProperty(o, l) {
        var f = a.get(l);
        return f === void 0 ? l in o && a.set(l, L(P)) : (N(f, P), Ft(s)), !0;
      },
      get(o, l, f) {
        var h;
        if (l === he)
          return e;
        var c = a.get(l), d = l in o;
        if (c === void 0 && (!d || (h = ae(o, l)) != null && h.writable) && (c = L(V(d ? o[l] : P, u)), a.set(l, c)), c !== void 0) {
          var v = y(c);
          return v === P ? void 0 : v;
        }
        return Reflect.get(o, l, f);
      },
      getOwnPropertyDescriptor(o, l) {
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f && "value" in f) {
          var c = a.get(l);
          c && (f.value = y(c));
        } else if (f === void 0) {
          var d = a.get(l), v = d == null ? void 0 : d.v;
          if (d !== void 0 && v !== P)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return f;
      },
      has(o, l) {
        var v;
        if (l === he)
          return !0;
        var f = a.get(l), c = f !== void 0 && f.v !== P || Reflect.has(o, l);
        if (f !== void 0 || k !== null && (!c || (v = ae(o, l)) != null && v.writable)) {
          f === void 0 && (f = L(c ? V(o[l], u) : P), a.set(l, f));
          var d = y(f);
          if (d === P)
            return !1;
        }
        return c;
      },
      set(o, l, f, c) {
        var $;
        var d = a.get(l), v = l in o;
        if (i && l === "length")
          for (var h = f; h < /** @type {Source<number>} */
          d.v; h += 1) {
            var p = a.get(h + "");
            p !== void 0 ? N(p, P) : h in o && (p = L(P), a.set(h + "", p));
          }
        d === void 0 ? (!v || ($ = ae(o, l)) != null && $.writable) && (d = L(void 0), N(d, V(f, u)), a.set(l, d)) : (v = d.v !== P, N(d, V(f, u)));
        var _ = Reflect.getOwnPropertyDescriptor(o, l);
        if (_ != null && _.set && _.set.call(c, f), !v) {
          if (i && typeof l == "string") {
            var g = (
              /** @type {Source<number>} */
              a.get("length")
            ), m = Number(l);
            Number.isInteger(m) && m >= g.v && N(g, m + 1);
          }
          Ft(s);
        }
        return !0;
      },
      ownKeys(o) {
        y(s);
        var l = Reflect.ownKeys(o).filter((d) => {
          var v = a.get(d);
          return v === void 0 || v.v !== P;
        });
        for (var [f, c] of a)
          c.v !== P && !(f in o) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        dr();
      }
    }
  );
}
function Ft(e, t = 1) {
  N(e, e.v + t);
}
var Ht, En, xn;
function _t() {
  if (Ht === void 0) {
    Ht = window;
    var e = Element.prototype, t = Node.prototype;
    En = ae(t, "firstChild").get, xn = ae(t, "nextSibling").get, e.__click = void 0, e.__className = "", e.__attributes = null, e.__e = void 0, Text.prototype.__t = void 0;
  }
}
function Me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function se(e) {
  return En.call(e);
}
// @__NO_SIDE_EFFECTS__
function ue(e) {
  return xn.call(e);
}
function ne(e) {
  if (!E)
    return /* @__PURE__ */ se(e);
  var t = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ se(x)
  );
  return t === null && (t = x.appendChild(Me())), F(t), t;
}
function Ue(e, t = 1, n = !1) {
  let r = E ? x : e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ue(r);
  if (!E)
    return r;
  var a = r.nodeType;
  if (n && a !== 3) {
    var i = Me();
    return r == null || r.before(i), F(i), i;
  }
  return F(r), /** @type {TemplateNode} */
  r;
}
function Tn(e) {
  e.textContent = "";
}
let E = !1;
function B(e) {
  E = e;
}
let x;
function F(e) {
  if (e === null)
    throw Et(), Ae;
  return x = e;
}
function ye() {
  return F(
    /** @type {TemplateNode} */
    /* @__PURE__ */ ue(x)
  );
}
function z(e) {
  if (E) {
    if (/* @__PURE__ */ ue(x) !== null)
      throw Et(), Ae;
    x = e;
  }
}
function pt() {
  for (var e = 0, t = x; ; ) {
    if (t.nodeType === 8) {
      var n = (
        /** @type {Comment} */
        t.data
      );
      if (n === kt) {
        if (e === 0) return t;
        e -= 1;
      } else (n === Gt || n === bt) && (e += 1);
    }
    var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ue(t)
    );
    t.remove(), t = r;
  }
}
const Sr = /* @__PURE__ */ new Set(), Bt = /* @__PURE__ */ new Set();
function Or(e, t, n, r) {
  function a(i) {
    if (r.capture || xe.call(t, i), !i.cancelBubble)
      return n.call(this, i);
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? rt(() => {
    t.addEventListener(e, a, r);
  }) : t.addEventListener(e, a, r), a;
}
function ot(e, t, n, r, a) {
  var i = { capture: r, passive: a }, s = Or(e, t, n, i);
  (t === document.body || t === window || t === document) && pr(() => {
    t.removeEventListener(e, s, i);
  });
}
function xe(e) {
  var _;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, a = ((_ = e.composedPath) == null ? void 0 : _.call(e)) || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  ), s = 0, u = e.__root;
  if (u) {
    var o = a.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var l = a.indexOf(t);
    if (l === -1)
      return;
    o <= l && (s = o);
  }
  if (i = /** @type {Element} */
  a[s] || e.target, i !== t) {
    Ve(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    try {
      for (var f, c = []; i !== null; ) {
        var d = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var v = i["__" + r];
          if (v !== void 0 && !/** @type {any} */
          i.disabled)
            if (xt(v)) {
              var [h, ...p] = v;
              h.apply(i, [e, ...p]);
            } else
              v.call(i, e);
        } catch (g) {
          f ? c.push(g) : f = g;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        i = d;
      }
      if (f) {
        for (let g of c)
          queueMicrotask(() => {
            throw g;
          });
        throw f;
      }
    } finally {
      e.__root = t, delete e.currentTarget;
    }
  }
}
function qr(e) {
  var t = document.createElement("template");
  return t.innerHTML = e, t.content;
}
function Ce(e, t) {
  var n = (
    /** @type {Effect} */
    k
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function ke(e, t) {
  var n = (t & Gn) !== 0, r = (t & Xn) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    if (E)
      return Ce(x, null), x;
    a === void 0 && (a = qr(i ? e : "<!>" + e), n || (a = /** @type {Node} */
    /* @__PURE__ */ se(a)));
    var s = (
      /** @type {TemplateNode} */
      r ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (n) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ se(s)
      ), o = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ce(u, o);
    } else
      Ce(s, s);
    return s;
  };
}
function ie(e, t) {
  if (E) {
    k.nodes_end = x, ye();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Rr = ["touchstart", "touchmove"];
function Pr(e) {
  return Rr.includes(e);
}
let Qe = !0;
function Ut(e) {
  Qe = e;
}
function Ir(e, t) {
  t !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = t, e.nodeValue = t == null ? "" : t + "");
}
function An(e, t) {
  return Cn(e, t);
}
function Lr(e, t) {
  _t(), t.intro = t.intro ?? !1;
  const n = t.target, r = E, a = x;
  try {
    for (var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ se(n)
    ); i && (i.nodeType !== 8 || /** @type {Comment} */
    i.data !== Gt); )
      i = /** @type {TemplateNode} */
      /* @__PURE__ */ ue(i);
    if (!i)
      throw Ae;
    B(!0), F(
      /** @type {Comment} */
      i
    ), ye();
    const s = Cn(e, { ...t, anchor: i });
    if (x === null || x.nodeType !== 8 || /** @type {Comment} */
    x.data !== kt)
      throw Et(), Ae;
    return B(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Ae)
      return t.recover === !1 && ur(), _t(), Tn(n), B(!1), An(e, t);
    throw s;
  } finally {
    B(r), F(a);
  }
}
const fe = /* @__PURE__ */ new Map();
function Cn(e, { target: t, anchor: n, props: r = {}, events: a, context: i, intro: s = !0 }) {
  _t();
  var u = /* @__PURE__ */ new Set(), o = (c) => {
    for (var d = 0; d < c.length; d++) {
      var v = c[d];
      if (!u.has(v)) {
        u.add(v);
        var h = Pr(v);
        t.addEventListener(v, xe, { passive: h });
        var p = fe.get(v);
        p === void 0 ? (document.addEventListener(v, xe, { passive: h }), fe.set(v, 1)) : fe.set(v, p + 1);
      }
    }
  };
  o(Tt(Sr)), Bt.add(o);
  var l = void 0, f = ln(() => {
    var c = n ?? t.appendChild(Me());
    return $e(() => {
      if (i) {
        qt({});
        var d = (
          /** @type {ComponentContext} */
          C
        );
        d.c = i;
      }
      a && (r.$$events = a), E && Ce(
        /** @type {TemplateNode} */
        c,
        null
      ), Qe = s, l = e(c, r) || {}, Qe = !0, E && (k.nodes_end = x), i && Rt();
    }), () => {
      var h;
      for (var d of u) {
        t.removeEventListener(d, xe);
        var v = (
          /** @type {number} */
          fe.get(d)
        );
        --v === 0 ? (document.removeEventListener(d, xe), fe.delete(d)) : fe.set(d, v);
      }
      Bt.delete(o), gt.delete(l), c !== n && ((h = c.parentNode) == null || h.removeChild(c));
    };
  });
  return gt.set(l, f), l;
}
let gt = /* @__PURE__ */ new WeakMap();
function Dr(e) {
  const t = gt.get(e);
  t && t();
}
function $t(e, t, n, r = null, a = !1) {
  E && ye();
  var i = e, s = null, u = null, o = null, l = a ? Pe : 0;
  Nt(() => {
    if (o === (o = !!t())) return;
    let f = !1;
    if (E) {
      const c = (
        /** @type {Comment} */
        i.data === bt
      );
      o === c && (i = pt(), F(i), B(!1), f = !0);
    }
    o ? (s ? Ne(s) : s = $e(() => n(i)), u && Ge(u, () => {
      u = null;
    })) : (u ? Ne(u) : r && (u = $e(() => r(i))), s && Ge(s, () => {
      s = null;
    })), f && B(!0);
  }, l), E && (i = x);
}
let ge = null;
function Yt(e) {
  ge = e;
}
function Mr(e, t, n, r) {
  for (var a = [], i = t.length, s = 0; s < i; s++)
    St(t[s].e, a, !0);
  var u = i > 0 && a.length === 0 && n !== null;
  if (u) {
    var o = (
      /** @type {Element} */
      /** @type {Element} */
      n.parentNode
    );
    Tn(o), o.append(
      /** @type {Element} */
      n
    ), r.clear(), G(e, t[0].prev, t[i - 1].next);
  }
  fn(a, () => {
    for (var l = 0; l < i; l++) {
      var f = t[l];
      u || (r.delete(f.k), G(e, f.prev, f.next)), oe(f.e, !u);
    }
  });
}
function Fr(e, t, n, r, a, i = null) {
  var s = e, u = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var o = (
      /** @type {Element} */
      e
    );
    s = E ? F(
      /** @type {Comment | Text} */
      /* @__PURE__ */ se(o)
    ) : o.appendChild(Me());
  }
  E && ye();
  var l = null;
  Nt(() => {
    var f = n(), c = xt(f) ? f : f == null ? [] : Tt(f), d = c.length;
    let v = !1;
    if (E) {
      var h = (
        /** @type {Comment} */
        s.data === bt
      );
      h !== (d === 0) && (s = pt(), F(s), B(!1), v = !0);
    }
    if (E) {
      for (var p = null, _, g = 0; g < d; g++) {
        if (x.nodeType === 8 && /** @type {Comment} */
        x.data === kt) {
          s = /** @type {Comment} */
          x, v = !0, B(!1);
          break;
        }
        var m = c[g], $ = r(m, g);
        _ = Nn(x, u, p, null, m, $, g, a, t), u.items.set($, _), p = _;
      }
      d > 0 && F(pt());
    }
    E || Hr(c, u, s, a, t, r), i !== null && (d === 0 ? l ? Ne(l) : l = $e(() => i(s)) : l !== null && Ge(l, () => {
      l = null;
    })), v && B(!0);
  }), E && (s = x);
}
function Hr(e, t, n, r, a, i) {
  var s = e.length, u = t.items, o = t.first, l = o, f, c = null, d = [], v = [], h, p, _, g;
  for (g = 0; g < s; g += 1) {
    if (h = e[g], p = i(h, g), _ = u.get(p), _ === void 0) {
      var m = l ? (
        /** @type {TemplateNode} */
        l.e.nodes_start
      ) : n;
      c = Nn(
        m,
        t,
        c,
        c === null ? t.first : c.next,
        h,
        p,
        g,
        r,
        a
      ), u.set(p, c), d = [], v = [], l = c.next;
      continue;
    }
    if (Br(_, h, g), _.e.f & ee && Ne(_.e), _ !== l) {
      if (f !== void 0 && f.has(_)) {
        if (d.length < v.length) {
          var $ = v[0], w;
          c = $.prev;
          var b = d[0], A = d[d.length - 1];
          for (w = 0; w < d.length; w += 1)
            jt(d[w], $, n);
          for (w = 0; w < v.length; w += 1)
            f.delete(v[w]);
          G(t, b.prev, A.next), G(t, c, b), G(t, A, $), l = $, c = A, g -= 1, d = [], v = [];
        } else
          f.delete(_), jt(_, l, n), G(t, _.prev, _.next), G(t, _, c === null ? t.first : c.next), G(t, c, _), c = _;
        continue;
      }
      for (d = [], v = []; l !== null && l.k !== p; )
        l.e.f & ee || (f ?? (f = /* @__PURE__ */ new Set())).add(l), v.push(l), l = l.next;
      if (l === null)
        continue;
      _ = l;
    }
    d.push(_), c = _, l = _.next;
  }
  if (l !== null || f !== void 0) {
    for (var R = f === void 0 ? [] : Tt(f); l !== null; )
      R.push(l), l = l.next;
    var D = R.length;
    if (D > 0) {
      var Ln = s === 0 ? n : null;
      Mr(t, R, Ln, u);
    }
  }
  k.first = t.first && t.first.e, k.last = c && c.e;
}
function Br(e, t, n, r) {
  N(e.v, t), e.i = n;
}
function Nn(e, t, n, r, a, i, s, u, o) {
  var l = ge;
  try {
    var f = (o & Hn) !== 0, c = (o & Un) === 0, d = f ? c ? /* @__PURE__ */ nt(a) : L(a) : a, v = o & Bn ? L(s) : s, h = {
      i: v,
      v: d,
      k: i,
      a: null,
      // @ts-expect-error
      e: null,
      prev: n,
      next: r
    };
    return ge = h, h.e = $e(() => u(e, d, v), E), h.e.prev = n && n.e, h.e.next = r && r.e, n === null ? t.first = h : (n.next = h, n.e.next = h.e), r !== null && (r.prev = h, r.e.prev = h.e), h;
  } finally {
    ge = l;
  }
}
function jt(e, t, n) {
  for (var r = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : n, a = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : n, i = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); i !== r; ) {
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ue(i)
    );
    a.before(i), i = s;
  }
}
function G(e, t, n) {
  t === null ? e.first = n : (t.next = n, t.e.next = n && n.e), n !== null && (n.prev = t, n.e.prev = t && t.e);
}
function Ur(e, t, n, r, a, i) {
  let s = E;
  E && ye();
  var u, o, l = null;
  E && x.nodeType === 1 && (l = /** @type {Element} */
  x, ye());
  var f = (
    /** @type {TemplateNode} */
    E ? x : e
  ), c, d = ge;
  Nt(() => {
    const v = t() || null;
    var h = v === "svg" ? Jn : null;
    if (v !== u) {
      var p = ge;
      Yt(d), c && (v === null ? Ge(c, () => {
        c = null, o = null;
      }) : v === o ? Ne(c) : (oe(c), Ut(!1))), v && v !== o && (c = $e(() => {
        if (l = E ? (
          /** @type {Element} */
          l
        ) : h ? document.createElementNS(h, v) : document.createElement(v), Ce(l, l), r) {
          var _ = (
            /** @type {TemplateNode} */
            E ? /* @__PURE__ */ se(l) : l.appendChild(Me())
          );
          E && (_ === null ? B(!1) : F(_)), r(l, _);
        }
        k.nodes_end = l, f.before(l);
      })), u = v, u && (o = u), Ut(!0), Yt(p);
    }
  }, Pe), s && (B(!0), F(f));
}
function Sn(e, t) {
  rt(() => {
    var n = e.getRootNode(), r = (
      /** @type {ShadowRoot} */
      n.host ? (
        /** @type {ShadowRoot} */
        n
      ) : (
        /** @type {Document} */
        n.head ?? /** @type {Document} */
        n.ownerDocument.head
      )
    );
    if (!r.querySelector("#" + t.hash)) {
      const a = document.createElement("style");
      a.id = t.hash, a.textContent = t.code, r.appendChild(a);
    }
  });
}
function Yr(e, t, n) {
  Ie(() => {
    var r = be(() => t(e, n == null ? void 0 : n()) || {});
    if (n && (r != null && r.update)) {
      var a = !1, i = (
        /** @type {any} */
        {}
      );
      Le(() => {
        var s = n();
        kn(s), a && nn(i, s) && (i = s, r.update(s));
      }), a = !0;
    }
    if (r != null && r.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
function de(e, t, n, r) {
  var a = e.__attributes ?? (e.__attributes = {});
  E && (a[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || a[t] !== (a[t] = n) && (t === "loading" && (e[ir] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && On(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function K(e, t, n) {
  On(e).includes(t) ? e[t] = n : de(e, t, n);
}
var Vt = /* @__PURE__ */ new Map();
function On(e) {
  var t = Vt.get(e.nodeName);
  if (t) return t;
  Vt.set(e.nodeName, t = []);
  for (var n, r = We(e); r.constructor.name !== "Element"; ) {
    n = Jt(r);
    for (var a in n)
      n[a].set && t.push(a);
    r = We(r);
  }
  return t;
}
function Te(e, t) {
  var n = e.__className, r = jr(t);
  E && e.className === r ? e.__className = r : (n !== r || E && e.className !== r) && (t == null ? e.removeAttribute("class") : e.className = r, e.__className = r);
}
function jr(e) {
  return e ?? "";
}
const Vr = requestAnimationFrame, Wr = () => performance.now(), J = {
  tick: (
    /** @param {any} _ */
    (e) => Vr(e)
  ),
  now: () => Wr(),
  tasks: /* @__PURE__ */ new Set()
};
function qn(e) {
  J.tasks.forEach((t) => {
    t.c(e) || (J.tasks.delete(t), t.f());
  }), J.tasks.size !== 0 && J.tick(qn);
}
function Kr(e) {
  let t;
  return J.tasks.size === 0 && J.tick(qn), {
    promise: new Promise((n) => {
      J.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      J.tasks.delete(t);
    }
  };
}
function He(e, t) {
  e.dispatchEvent(new CustomEvent(t));
}
function zr(e) {
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function Wt(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [a, i] = r.split(":");
    if (!a || i === void 0) break;
    const s = zr(a.trim());
    t[s] = i.trim();
  }
  return t;
}
const Gr = (e) => e;
function Xr(e, t, n, r) {
  var a = (e & zn) !== 0, i = "both", s, u = t.inert, o, l;
  function f() {
    return s ?? (s = n()(
      t,
      /** @type {P} */
      {},
      {
        direction: i
      }
    ));
  }
  var c = {
    is_global: a,
    in() {
      t.inert = u, He(t, "introstart"), o = yt(t, f(), l, 1, () => {
        He(t, "introend"), o == null || o.abort(), o = s = void 0;
      });
    },
    out(p) {
      t.inert = !0, He(t, "outrostart"), l = yt(t, f(), o, 0, () => {
        He(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      o == null || o.abort(), l == null || l.abort();
    }
  }, d = (
    /** @type {Effect} */
    k
  );
  if ((d.transitions ?? (d.transitions = [])).push(c), Qe) {
    var v = a;
    if (!v) {
      for (var h = (
        /** @type {Effect | null} */
        d.parent
      ); h && h.f & Pe; )
        for (; (h = h.parent) && !(h.f & At); )
          ;
      v = !h || (h.f & Qt) !== 0;
    }
    v && Ie(() => {
      be(() => c.in());
    });
  }
}
function yt(e, t, n, r, a) {
  var i = r === 1;
  if (er(t)) {
    var s, u = !1;
    return rt(() => {
      if (!u) {
        var _ = t({ direction: i ? "in" : "out" });
        s = yt(e, _, n, r, a);
      }
    }), {
      abort: () => {
        u = !0, s == null || s.abort();
      },
      deactivate: () => s.deactivate(),
      reset: () => s.reset(),
      t: () => s.t()
    };
  }
  if (n == null || n.deactivate(), !(t != null && t.duration))
    return a(), {
      abort: Fe,
      deactivate: Fe,
      reset: Fe,
      t: () => r
    };
  const { delay: o = 0, css: l, tick: f, easing: c = Gr } = t;
  var d = [];
  if (i && n === void 0 && (f && f(0, 1), l)) {
    var v = Wt(l(0, 1));
    d.push(v, v);
  }
  var h = () => 1 - r, p = e.animate(d, { duration: o });
  return p.onfinish = () => {
    var _ = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var g = r - _, m = (
      /** @type {number} */
      t.duration * Math.abs(g)
    ), $ = [];
    if (m > 0) {
      if (l)
        for (var w = Math.ceil(m / 16.666666666666668), b = 0; b <= w; b += 1) {
          var A = _ + g * c(b / w), R = l(A, 1 - A);
          $.push(Wt(R));
        }
      h = () => {
        var D = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          p.currentTime
        );
        return _ + g * c(D / m);
      }, f && Kr(() => {
        if (p.playState !== "running") return !1;
        var D = h();
        return f(D, 1 - D), !0;
      });
    }
    p = e.animate($, { duration: m, fill: "forwards" }), p.onfinish = () => {
      h = () => r, f == null || f(r, 1 - r), a();
    };
  }, {
    abort: () => {
      p && (p.cancel(), p.effect = null);
    },
    deactivate: () => {
      a = Fe;
    },
    reset: () => {
      r === 0 && (f == null || f(1, 0));
    },
    t: () => h()
  };
}
function Kt(e, t) {
  return e === t || (e == null ? void 0 : e[he]) === t;
}
function mt(e = {}, t, n, r) {
  return Ie(() => {
    var a, i;
    return Le(() => {
      a = i, i = [], be(() => {
        e !== n(...i) && (t(e, ...i), a && Kt(n(...a), e) && t(null, ...a));
      });
    }), () => {
      rt(() => {
        i && Kt(n(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
function Jr() {
  const e = (
    /** @type {ComponentContextLegacy} */
    C
  ), t = e.l.u;
  t && (t.b.length && gr(() => {
    zt(e), ut(t.b);
  }), ze(() => {
    const n = be(() => t.m.map(tr));
    return () => {
      for (const r of n)
        typeof r == "function" && r();
    };
  }), t.a.length && ze(() => {
    zt(e), ut(t.a);
  }));
}
function zt(e) {
  if (e.l.s)
    for (const t of e.l.s) y(t);
  kn(e.s);
}
function ve(e, t, n, r) {
  var w;
  var a = (n & Yn) !== 0, i = (n & jn) !== 0, s = (n & Wn) !== 0, u = (n & Kn) !== 0, o = (
    /** @type {V} */
    e[t]
  ), l = (w = ae(e, t)) == null ? void 0 : w.set, f = (
    /** @type {V} */
    r
  ), c = !0, d = !1, v = () => (d = !0, c && (c = !1, u ? f = be(
    /** @type {() => V} */
    r
  ) : f = /** @type {V} */
  r), f);
  o === void 0 && r !== void 0 && (l && i && fr(), o = v(), l && l(o));
  var h;
  if (i)
    h = () => {
      var b = (
        /** @type {V} */
        e[t]
      );
      return b === void 0 ? v() : (c = !0, d = !1, b);
    };
  else {
    var p = (a ? dt : yr)(
      () => (
        /** @type {V} */
        e[t]
      )
    );
    p.f |= nr, h = () => {
      var b = y(p);
      return b !== void 0 && (f = /** @type {V} */
      void 0), b === void 0 ? f : b;
    };
  }
  if (!(n & Vn))
    return h;
  if (l) {
    var _ = e.$$legacy;
    return function(b, A) {
      return arguments.length > 0 ? ((!i || !A || _) && l(A ? h() : b), b) : h();
    };
  }
  var g = !1, m = /* @__PURE__ */ nt(o), $ = /* @__PURE__ */ dt(() => {
    var b = h(), A = y(m);
    return g ? (g = !1, A) : m.v = b;
  });
  return a || ($.equals = Ct), function(b, A) {
    var R = y($);
    if (arguments.length > 0) {
      const D = A ? y($) : i && s ? V(b) : b;
      return $.equals(D) || (g = !0, N(m, D), d && f !== void 0 && (f = D), y($)), b;
    }
    return R;
  };
}
function Zr(e) {
  return new Qr(e);
}
var j, M;
class Qr {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    st(this, j);
    /** @type {Record<string, any>} */
    st(this, M);
    var i;
    var n = /* @__PURE__ */ new Map(), r = (s, u) => {
      var o = /* @__PURE__ */ nt(u);
      return n.set(s, o), o;
    };
    const a = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, u) {
          return y(n.get(u) ?? r(u, Reflect.get(s, u)));
        },
        has(s, u) {
          return y(n.get(u) ?? r(u, Reflect.get(s, u))), Reflect.has(s, u);
        },
        set(s, u, o) {
          return N(n.get(u) ?? r(u, o), o), Reflect.set(s, u, o);
        }
      }
    );
    lt(this, M, (t.hydrate ? Lr : An)(t.component, {
      target: t.target,
      props: a,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && X(), lt(this, j, a.$$events);
    for (const s of Object.keys(O(this, M)))
      s === "$set" || s === "$destroy" || s === "$on" || Ve(this, s, {
        get() {
          return O(this, M)[s];
        },
        /** @param {any} value */
        set(u) {
          O(this, M)[s] = u;
        },
        enumerable: !0
      });
    O(this, M).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(a, s);
    }, O(this, M).$destroy = () => {
      Dr(O(this, M));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    O(this, M).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    O(this, j)[t] = O(this, j)[t] || [];
    const r = (...a) => n.call(this, ...a);
    return O(this, j)[t].push(r), () => {
      O(this, j)[t] = O(this, j)[t].filter(
        /** @param {any} fn */
        (a) => a !== r
      );
    };
  }
  $destroy() {
    O(this, M).$destroy();
  }
}
j = new WeakMap(), M = new WeakMap();
let Rn;
typeof HTMLElement == "function" && (Rn = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, n, r) {
    super();
    /** The Svelte component constructor */
    H(this, "$$ctor");
    /** Slots */
    H(this, "$$s");
    /** @type {any} The Svelte component instance */
    H(this, "$$c");
    /** Whether or not the custom element is connected */
    H(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    H(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    H(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    H(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    H(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    H(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    H(this, "$$me");
    this.$$ctor = t, this.$$s = n, r && this.attachShadow({ mode: "open" });
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(t, n, r) {
    if (this.$$l[t] = this.$$l[t] || [], this.$$l[t].push(n), this.$$c) {
      const a = this.$$c.$on(t, n);
      this.$$l_u.set(n, a);
    }
    super.addEventListener(t, n, r);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(t, n, r) {
    if (super.removeEventListener(t, n, r), this.$$c) {
      const a = this.$$l_u.get(n);
      a && (a(), this.$$l_u.delete(n));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(a) {
        return (i) => {
          const s = document.createElement("slot");
          a !== "default" && (s.name = a), ie(i, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = ei(this);
      for (const a of this.$$s)
        a in r && (a === "default" && !this.$$d.children ? (this.$$d.children = t(a), n.default = !0) : n[a] = t(a));
      for (const a of this.attributes) {
        const i = this.$$g_p(a.name);
        i in this.$$d || (this.$$d[i] = Ye(i, a.value, this.$$p_d, "toProp"));
      }
      for (const a in this.$$p_d)
        !(a in this.$$d) && this[a] !== void 0 && (this.$$d[a] = this[a], delete this[a]);
      this.$$c = Zr({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = ln(() => {
        Le(() => {
          var a;
          this.$$r = !0;
          for (const i of je(this.$$c)) {
            if (!((a = this.$$p_d[i]) != null && a.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const s = Ye(
              i,
              this.$$d[i],
              this.$$p_d,
              "toAttribute"
            );
            s == null ? this.removeAttribute(this.$$p_d[i].attribute || i) : this.setAttribute(this.$$p_d[i].attribute || i, s);
          }
          this.$$r = !1;
        });
      });
      for (const a in this.$$l)
        for (const i of this.$$l[a]) {
          const s = this.$$c.$on(a, i);
          this.$$l_u.set(i, s);
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
  attributeChangedCallback(t, n, r) {
    var a;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ye(t, r, this.$$p_d, "toProp"), (a = this.$$c) == null || a.$set({ [t]: this.$$d[t] }));
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
    return je(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Ye(e, t, n, r) {
  var i;
  const a = (i = n[e]) == null ? void 0 : i.type;
  if (t = a === "Boolean" && typeof t != "boolean" ? t != null : t, !r || !n[e])
    return t;
  if (r === "toAttribute")
    switch (a) {
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
    switch (a) {
      case "Object":
      case "Array":
        return t && JSON.parse(t);
      case "Boolean":
        return t;
      case "Number":
        return t != null ? +t : t;
      default:
        return t;
    }
}
function ei(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Pn(e, t, n, r, a, i) {
  let s = class extends Rn {
    constructor() {
      super(e, n, a), this.$$p_d = t;
    }
    static get observedAttributes() {
      return je(t).map(
        (u) => (t[u].attribute || u).toLowerCase()
      );
    }
  };
  return je(t).forEach((u) => {
    Ve(s.prototype, u, {
      get() {
        return this.$$c && u in this.$$c ? this.$$c[u] : this.$$d[u];
      },
      set(o) {
        var c;
        o = Ye(u, o, t), this.$$d[u] = o;
        var l = this.$$c;
        if (l) {
          var f = (c = ae(l, u)) == null ? void 0 : c.get;
          f ? l[u] = o : l.$set({ [u]: o });
        }
      }
    });
  }), r.forEach((u) => {
    Ve(s.prototype, u, {
      get() {
        var o;
        return (o = this.$$c) == null ? void 0 : o[u];
      }
    });
  }), i && (s = i(s)), e.element = /** @type {any} */
  s, s;
}
let et = ft(void 0);
const ti = async () => (N(et, V(await window.loadCardHelpers().then((e) => e))), y(et)), ni = () => y(et) ? y(et) : ti();
function In(e) {
  C === null && wr(), C.l !== null ? ri(C).m.push(e) : ze(() => {
    const t = be(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function ri(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ?? (t.u = { a: [], b: [], m: [] });
}
function ii(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function ai(e, { delay: t = 0, duration: n = 400, easing: r = ii, axis: a = "y" } = {}) {
  const i = getComputedStyle(e), s = +i.opacity, u = a === "y" ? "height" : "width", o = parseFloat(i[u]), l = a === "y" ? ["top", "bottom"] : ["left", "right"], f = l.map(
    (g) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${g[0].toUpperCase()}${g.slice(1)}`
    )
  ), c = parseFloat(i[`padding${f[0]}`]), d = parseFloat(i[`padding${f[1]}`]), v = parseFloat(i[`margin${f[0]}`]), h = parseFloat(i[`margin${f[1]}`]), p = parseFloat(
    i[`border${f[0]}Width`]
  ), _ = parseFloat(
    i[`border${f[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (g) => `overflow: hidden;opacity: ${Math.min(g * 20, 1) * s};${u}: ${g * o}px;padding-${l[0]}: ${g * c}px;padding-${l[1]}: ${g * d}px;margin-${l[0]}: ${g * v}px;margin-${l[1]}: ${g * h}px;border-${l[0]}-width: ${g * p}px;border-${l[1]}-width: ${g * _}px;`
  };
}
var si = /* @__PURE__ */ ke('<span class="loading svelte-1sdlsm">Loading...</span>'), li = /* @__PURE__ */ ke('<div class="outer-container"><!> <!></div>');
const oi = {
  hash: "svelte-1sdlsm",
  code: `
  .loading.svelte-1sdlsm {
    padding: 1em;
    display: block;
  }
`
};
function wt(e, t) {
  qt(t, !0), Sn(e, oi);
  const n = ve(t, "type", 7, "div"), r = ve(t, "config", 7), a = ve(t, "hass", 7), i = ve(t, "marginTop", 7, "0px");
  let s = ft(void 0), u = ft(!0);
  ze(() => {
    y(s) && (y(s).hass = a());
  }), In(async () => {
    const d = (await ni()).createCardElement(r());
    d.hass = a(), y(s) && (y(s).replaceWith(d), N(s, V(d)), N(u, !1));
  });
  var o = li(), l = ne(o);
  Ur(l, n, !1, (c, d) => {
    mt(c, (v) => N(s, V(v)), () => y(s)), Te(c, "svelte-1sdlsm"), Xr(3, c, () => ai);
  });
  var f = Ue(l, 2);
  return $t(f, () => y(u), (c) => {
    var d = si();
    ie(c, d);
  }), z(o), Ee(() => de(o, "style", `margin-top: ${i() ?? ""};`)), ie(e, o), Rt({
    get type() {
      return n();
    },
    set type(c = "div") {
      n(c), X();
    },
    get config() {
      return r();
    },
    set config(c) {
      r(c), X();
    },
    get hass() {
      return a();
    },
    set hass(c) {
      a(c), X();
    },
    get marginTop() {
      return i();
    },
    set marginTop(c = "0px") {
      i(c), X();
    }
  });
}
customElements.define("expander-sub-card", Pn(
  wt,
  {
    type: {},
    config: {},
    hass: {},
    marginTop: {}
  },
  [],
  [],
  !0
));
function ui(e, t) {
  t = Object.assign({
    open: !0,
    duration: 0.2,
    easing: "ease"
  }, t);
  const r = () => {
  };
  let a = r, i = r;
  const s = () => {
    a(), a = r, i = r;
  };
  e.addEventListener("transitionend", s);
  async function u() {
    return new Promise((h, p) => {
      a = h, i = p;
    });
  }
  async function o() {
    return new Promise(requestAnimationFrame);
  }
  function l() {
    return `height ${t.duration}s ${t.easing}`;
  }
  e.style.transition = l(), e.style.height = t.open ? "auto" : "0px", t.open ? e.style.overflow = "visible" : e.style.overflow = "hidden";
  async function f() {
    e.style.height = e.scrollHeight + "px";
    try {
      await u(), e.style.height = "auto", e.style.overflow = "visible";
    } catch {
    }
  }
  async function c() {
    e.style.height === "auto" ? (e.style.transition = "none", await o(), e.style.height = e.scrollHeight + "px", e.style.transition = l(), await o(), e.style.overflow = "hidden", e.style.height = "0px") : (i(), e.style.overflow = "hidden", e.style.height = "0px");
  }
  function d(h) {
    t = Object.assign(t, h), t.open ? f() : c();
  }
  function v() {
    e.removeEventListener("transitionend", s);
  }
  return { update: d, destroy: v };
}
const fi = {
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
  "max-width-expanded": 0
};
var ci = /* @__PURE__ */ ke('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), di = /* @__PURE__ */ ke("<button><div> </div> <ha-icon></ha-icon></button>", 2), vi = /* @__PURE__ */ ke('<div class="children-container svelte-icqkke"></div>'), hi = /* @__PURE__ */ ke("<ha-card><!> <!></ha-card>", 2);
const _i = {
  hash: "svelte-icqkke",
  code: `
    .expander-card.svelte-icqkke {
        display: var(--expander-card-display,block);
        gap: var(--gap);
        padding: var(--padding);
        background: var(--card-background,#fff);
    }
    .children-container.svelte-icqkke {
        padding: var(--child-padding);
        display: var(--expander-card-display,block);
        gap: var(--gap);
    }
    .clear.svelte-icqkke {
        background: none !important;
        background-color: transparent !important;
        border-style: none !important;
    }
    .title-card-header.svelte-icqkke {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
    }
    .title-card-header-overlay.svelte-icqkke {
        display: block;
    }
    .title-card-container.svelte-icqkke {
        width: 100%;
        padding: var(--title-padding);
    }
    .header.svelte-icqkke {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.8em 0.8em;
        margin: 2px;
        background: var(--button-background);
        border-style: none;
        width: var(--header-width,auto);
        color: var(--header-color,#fff);
    }
    .header-overlay.svelte-icqkke {
        position: absolute;
        top: 0;
        right: 0;
        margin: var(--overlay-margin);
    }
    .title.svelte-icqkke {
        width: 100%;
        text-align: left;
    }
    .ico.svelte-icqkke {
        color: var(--arrow-color,var(--primary-text-color,#fff));
        transition-property: transform;
        transition-duration: 0.35s;
    }

    .flipped.svelte-icqkke {
        transform: rotate(180deg);
    }

    .ripple.svelte-icqkke {
        background-position: center;
        transition: background 0.8s;
        border-radius: 1em;
    }
    .ripple.svelte-icqkke:hover {
        background: #ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;
    }
    .ripple.svelte-icqkke:active {
        background-color: #ffffff25;
        background-size: 100%;
        transition: background 0s;
    }
`
};
function pi(e, t) {
  qt(t, !1), Sn(e, _i);
  let n = Lt(!1), r = !1, a = ve(t, "hass", 12, void 0), i = ve(t, "config", 12), s = Lt(), u = !1;
  In(() => {
    const m = i()["min-width-expanded"], $ = i()["max-width-expanded"], w = document.body.offsetWidth;
    if (m && $ ? i(i().expanded = w >= m && w <= $, !0) : m ? i(i().expanded = w >= m, !0) : $ && i(i().expanded = w <= $, !0), i().expanded !== void 0 && setTimeout(() => N(n, i().expanded), 100), !r) {
      if (i()["title-card-clickable"]) {
        y(s).parentElement && (r = !0, y(s).parentElement.addEventListener("click", (b) => {
          if (u)
            return b.preventDefault(), b.stopImmediatePropagation(), u = !1, !1;
          N(n, !y(n));
        }));
        return;
      }
      y(s).tagName === "BUTTON" && (r = !0, y(s).addEventListener("click", (b) => {
        if (u)
          return b.preventDefault(), b.stopImmediatePropagation(), u = !1, !1;
        N(n, !y(n));
      }));
    }
  });
  let o, l = !1, f = 0, c = 0;
  const d = (m) => {
    o = m.target, f = m.touches[0].clientX, c = m.touches[0].clientY, l = !1;
  }, v = (m) => {
    const $ = m.touches[0].clientX, w = m.touches[0].clientY;
    (Math.abs($ - f) > 10 || Math.abs(w - c) > 10) && (l = !0);
  }, h = (m) => {
    !l && o === m.target && i()["title-card-clickable"] && N(n, !y(n)), o = void 0, u = !0, setTimeout(() => u = !1, 300);
  };
  Jr();
  var p = hi(), _ = ne(p);
  $t(
    _,
    () => i()["title-card"],
    (m) => {
      var $ = ci(), w = ne($), b = ne(w);
      wt(b, {
        get hass() {
          return a();
        },
        get config() {
          return i()["title-card"];
        },
        get type() {
          return i()["title-card"].type;
        }
      }), z(w);
      var A = Ue(w, 2);
      mt(A, (D) => N(s, D), () => y(s));
      var R = ne(A);
      K(R, "icon", "mdi:chevron-down"), z(A), z($), Ee(() => {
        Te($, `${`title-card-header${i()["title-card-button-overlay"] ? "-overlay" : ""}` ?? ""} svelte-icqkke`), de(w, "style", `--title-padding:${i()["title-card-padding"] ?? ""}`), de(A, "style", `--overlay-margin:${i()["overlay-margin"] ?? ""}; --button-background:${i()["button-background"] ?? ""}; --header-color:${i()["header-color"] ?? ""};`), Te(A, `${`header ripple${i()["title-card-button-overlay"] ? " header-overlay" : ""}${y(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), K(R, "style", `--arrow-color:${i()["arrow-color"] ?? ""}`), K(R, "class", `${`ico${y(n) ? " flipped open" : "close"}` ?? ""} svelte-icqkke`);
      }), ot("touchstart", w, d, void 0, !0), ot("touchmove", w, v, void 0, !0), ot("touchend", w, h), ie(m, $);
    },
    (m) => {
      var $ = di();
      mt($, (R) => N(s, R), () => y(s));
      var w = ne($), b = ne(w);
      z(w);
      var A = Ue(w, 2);
      K(A, "icon", "mdi:chevron-down"), z($), Ee(() => {
        Te($, `${`header${i()["expander-card-background-expanded"] ? "" : " ripple"}${y(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), de($, "style", `--header-width:100%; --button-background:${i()["button-background"] ?? ""};--header-color:${i()["header-color"] ?? ""};`), Te(w, `${`primary title${y(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), Ir(b, i().title), K(A, "style", `--arrow-color:${i()["arrow-color"] ?? ""}`), K(A, "class", `${`ico${y(n) ? " flipped open" : " close"}` ?? ""} svelte-icqkke`);
      }), ie(m, $);
    }
  );
  var g = Ue(_, 2);
  return $t(g, () => i().cards, (m) => {
    var $ = vi();
    Fr($, 5, () => i().cards, (w) => w, (w, b) => {
      wt(w, {
        get hass() {
          return a();
        },
        get config() {
          return y(b);
        },
        get type() {
          return y(b).type;
        },
        get marginTop() {
          return i()["child-margin-top"];
        }
      });
    }), z($), Ee(() => de($, "style", `--expander-card-display:${i()["expander-card-display"] ?? ""};
             --gap:${(y(n) ? i()["expanded-gap"] : i().gap) ?? ""}; --child-padding:${i()["child-padding"] ?? ""}`)), Yr($, (w, b) => ui(w, b), () => ({
      open: y(n),
      duration: 0.3,
      easing: "ease"
    })), ie(m, $);
  }), z(p), Ee(() => {
    K(p, "class", `${`expander-card${i().clear ? " clear" : ""}${y(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), K(p, "style", `--expander-card-display:${i()["expander-card-display"] ?? ""};
     --gap:${(y(n) ? i()["expanded-gap"] : i().gap) ?? ""}; --padding:${i().padding ?? ""};
     --expander-state:${y(n) ?? ""};
     --card-background:${(y(n) && i()["expander-card-background-expanded"] ? i()["expander-card-background-expanded"] : i()["expander-card-background"]) ?? ""}`);
  }), ie(e, p), Rt({
    get hass() {
      return a();
    },
    set hass(m) {
      a(m), X();
    },
    get config() {
      return i();
    },
    set config(m) {
      i(m), X();
    }
  });
}
customElements.define("expander-card", Pn(pi, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  setConfig(t = {}) {
    this.config = { ...fi, ...t };
  }
}));
const gi = "2.2.1";
console.info(
  `%c  Expander-Card 
%c Version ${gi}`,
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
  pi as default
};
//# sourceMappingURL=expander-card.js.map
