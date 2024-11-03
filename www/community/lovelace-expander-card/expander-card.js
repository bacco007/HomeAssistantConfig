var qr = Object.defineProperty;
var St = (e) => {
  throw TypeError(e);
};
var Or = (e, t, r) => t in e ? qr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var L = (e, t, r) => Or(e, typeof t != "symbol" ? t + "" : t, r), qt = (e, t, r) => t.has(e) || St("Cannot " + r);
var q = (e, t, r) => (qt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), at = (e, t, r) => t.has(e) ? St("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), st = (e, t, r, n) => (qt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
const Rr = "5";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(Rr);
const Mr = 1, Ir = 2, Dr = 16, Lr = 2, Fr = 4, Pr = 1, Hr = 2, Ut = "[", gt = "[!", $t = "]", Te = {}, O = Symbol(), Yr = "http://www.w3.org/2000/svg", Vt = !1;
function yt(e) {
  console.warn("hydration_mismatch");
}
var mt = Array.isArray, wt = Array.from, Be = Object.keys, We = Object.defineProperty, ue = Object.getOwnPropertyDescriptor, Ur = Object.getOwnPropertyDescriptors, Vr = Object.prototype, Br = Array.prototype, lt = Object.getPrototypeOf;
function Wr(e) {
  return typeof e == "function";
}
const ke = () => {
};
function jr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const z = 2, Bt = 4, Ze = 8, Qe = 16, Y = 32, qe = 64, ce = 128, je = 256, D = 512, ne = 1024, Oe = 2048, V = 4096, Re = 8192, Wt = 16384, Me = 32768, Kr = 1 << 18, jt = 1 << 19, He = Symbol("$state"), Xr = Symbol("");
function Kt(e) {
  return e === this.v;
}
function zr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Gr(e) {
  return !zr(e, this.v);
}
function Jr(e) {
  throw new Error("effect_in_teardown");
}
function Zr() {
  throw new Error("effect_in_unowned_derived");
}
function Qr(e) {
  throw new Error("effect_orphan");
}
function en() {
  throw new Error("effect_update_depth_exceeded");
}
function tn() {
  throw new Error("hydration_failed");
}
function rn(e) {
  throw new Error("props_invalid_value");
}
function nn() {
  throw new Error("state_descriptors_fixed");
}
function an() {
  throw new Error("state_prototype_fixed");
}
function sn() {
  throw new Error("state_unsafe_local_read");
}
function ln() {
  throw new Error("state_unsafe_mutation");
}
function M(e) {
  return {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Kt,
    version: 0
  };
}
function Ke(e) {
  return /* @__PURE__ */ on(M(e));
}
// @__NO_SIDE_EFFECTS__
function bt(e, t = !1) {
  var n;
  const r = M(e);
  return t || (r.equals = Gr), C !== null && C.l !== null && ((n = C.l).s ?? (n.s = [])).push(r), r;
}
// @__NO_SIDE_EFFECTS__
function on(e) {
  return E !== null && E.f & z && (B === null ? gn([e]) : B.push(e)), e;
}
function N(e, t) {
  return E !== null && Ct() && E.f & (z | Qe) && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (B === null || !B.includes(e)) && ln(), un(e, t);
}
function un(e, t) {
  return e.equals(t) || (e.v = t, e.version = fr(), Xt(e, ne), Ct() && m !== null && m.f & D && !(m.f & Y) && (A !== null && A.includes(e) ? (G(m, ne), nt(m)) : re === null ? $n([e]) : re.push(e))), t;
}
function Xt(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = Ct(), i = r.length, a = 0; a < i; a++) {
      var s = r[a], u = s.f;
      u & ne || !n && s === m || (G(s, t), u & (D | ce) && (u & z ? Xt(
        /** @type {Derived} */
        s,
        Oe
      ) : nt(
        /** @type {Effect} */
        s
      )));
    }
}
// @__NO_SIDE_EFFECTS__
function fn(e) {
  var t = z | ne;
  m === null ? t |= ce : m.f |= jt;
  const r = {
    children: null,
    ctx: C,
    deps: null,
    equals: Kt,
    f: t,
    fn: e,
    reactions: null,
    v: (
      /** @type {V} */
      null
    ),
    version: 0,
    parent: m
  };
  if (E !== null && E.f & z) {
    var n = (
      /** @type {Derived} */
      E
    );
    (n.children ?? (n.children = [])).push(r);
  }
  return r;
}
function zt(e) {
  var t = e.children;
  if (t !== null) {
    e.children = null;
    for (var r = 0; r < t.length; r += 1) {
      var n = t[r];
      n.f & z ? kt(
        /** @type {Derived} */
        n
      ) : ie(
        /** @type {Effect} */
        n
      );
    }
  }
}
function Gt(e) {
  var t, r = m;
  P(e.parent);
  try {
    zt(e), t = cr(e);
  } finally {
    P(r);
  }
  return t;
}
function Jt(e) {
  var t = Gt(e), r = (_e || e.f & ce) && e.deps !== null ? Oe : D;
  G(e, r), e.equals(t) || (e.v = t, e.version = fr());
}
function kt(e) {
  zt(e), Se(e, 0), G(e, Re), e.v = e.children = e.deps = e.ctx = e.reactions = null;
}
function cn(e) {
  m === null && E === null && Qr(), E !== null && E.f & ce && Zr(), Tt && Jr();
}
function dn(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Ie(e, t, r, n = !0) {
  var i = (e & qe) !== 0, a = m, s = {
    ctx: C,
    deps: null,
    deriveds: null,
    nodes_start: null,
    nodes_end: null,
    f: e | ne,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: i ? null : a,
    prev: null,
    teardown: null,
    transitions: null,
    version: 0
  };
  if (r) {
    var u = pe;
    try {
      Ot(!0), rt(s), s.f |= Wt;
    } catch (l) {
      throw ie(s), l;
    } finally {
      Ot(u);
    }
  } else t !== null && nt(s);
  var f = r && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & jt) === 0;
  if (!f && !i && n && (a !== null && dn(s, a), E !== null && E.f & z)) {
    var o = (
      /** @type {Derived} */
      E
    );
    (o.children ?? (o.children = [])).push(s);
  }
  return s;
}
function Zt(e) {
  cn();
  var t = m !== null && (m.f & Y) !== 0 && C !== null && !C.m;
  if (t) {
    var r = (
      /** @type {ComponentContext} */
      C
    );
    (r.e ?? (r.e = [])).push({
      fn: e,
      effect: m,
      reaction: E
    });
  } else {
    var n = et(e);
    return n;
  }
}
function Qt(e) {
  const t = Ie(qe, e, !0);
  return () => {
    ie(t);
  };
}
function et(e) {
  return Ie(Bt, e, !1);
}
function er(e) {
  return Ie(Ze, e, !0);
}
function Ee(e) {
  return tt(e);
}
function tt(e, t = 0) {
  return Ie(Ze | Qe | t, e, !0);
}
function ye(e, t = !0) {
  return Ie(Ze | Y, e, !0, t);
}
function tr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Tt, n = E;
    Rt(!0), W(null);
    try {
      t.call(null);
    } finally {
      Rt(r), W(n);
    }
  }
}
function rr(e) {
  var t = e.deriveds;
  if (t !== null) {
    e.deriveds = null;
    for (var r = 0; r < t.length; r += 1)
      kt(t[r]);
  }
}
function nr(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    var n = r.next;
    ie(r, t), r = n;
  }
}
function vn(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    t.f & Y || ie(t), t = r;
  }
}
function ie(e, t = !0) {
  var r = !1;
  if ((t || e.f & Kr) && e.nodes_start !== null) {
    for (var n = e.nodes_start, i = e.nodes_end; n !== null; ) {
      var a = n === i ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ de(n)
      );
      n.remove(), n = a;
    }
    r = !0;
  }
  nr(e, t && !r), rr(e), Se(e, 0), G(e, Re);
  var s = e.transitions;
  if (s !== null)
    for (const f of s)
      f.stop();
  tr(e);
  var u = e.parent;
  u !== null && u.first !== null && ir(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.parent = e.fn = e.nodes_start = e.nodes_end = null;
}
function ir(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Xe(e, t) {
  var r = [];
  Et(e, r, !0), ar(r, () => {
    ie(e), t && t();
  });
}
function ar(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function Et(e, t, r) {
  if (!(e.f & V)) {
    if (e.f ^= V, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & Me) !== 0 || (n.f & Y) !== 0;
      Et(n, t, a ? r : !1), n = i;
    }
  }
}
function Ne(e) {
  sr(e, !0);
}
function sr(e, t) {
  if (e.f & V) {
    De(e) && rt(e), e.f ^= V;
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & Me) !== 0 || (r.f & Y) !== 0;
      sr(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let ze = !1, ot = [];
function lr() {
  ze = !1;
  const e = ot.slice();
  ot = [], jr(e);
}
function xt(e) {
  ze || (ze = !0, queueMicrotask(lr)), ot.push(e);
}
function _n() {
  ze && lr();
}
function hn(e) {
  throw new Error("lifecycle_outside_component");
}
const or = 0, pn = 1;
let Ye = or, Ae = !1, pe = !1, Tt = !1;
function Ot(e) {
  pe = e;
}
function Rt(e) {
  Tt = e;
}
let le = [], ge = 0;
let E = null;
function W(e) {
  E = e;
}
let m = null;
function P(e) {
  m = e;
}
let B = null;
function gn(e) {
  B = e;
}
let A = null, R = 0, re = null;
function $n(e) {
  re = e;
}
let ur = 0, _e = !1, C = null;
function fr() {
  return ++ur;
}
function Ct() {
  return C !== null && C.l === null;
}
function De(e) {
  var s, u;
  var t = e.f;
  if (t & ne)
    return !0;
  if (t & Oe) {
    var r = e.deps, n = (t & ce) !== 0;
    if (r !== null) {
      var i;
      if (t & je) {
        for (i = 0; i < r.length; i++)
          ((s = r[i]).reactions ?? (s.reactions = [])).push(e);
        e.f ^= je;
      }
      for (i = 0; i < r.length; i++) {
        var a = r[i];
        if (De(
          /** @type {Derived} */
          a
        ) && Jt(
          /** @type {Derived} */
          a
        ), n && m !== null && !_e && !((u = a == null ? void 0 : a.reactions) != null && u.includes(e)) && (a.reactions ?? (a.reactions = [])).push(e), a.version > e.version)
          return !0;
      }
    }
    n || G(e, D);
  }
  return !1;
}
function yn(e, t, r) {
  throw e;
}
function cr(e) {
  var d;
  var t = A, r = R, n = re, i = E, a = _e, s = B, u = C, f = e.f;
  A = /** @type {null | Value[]} */
  null, R = 0, re = null, E = f & (Y | qe) ? null : e, _e = !pe && (f & ce) !== 0, B = null, C = e.ctx;
  try {
    var o = (
      /** @type {Function} */
      (0, e.fn)()
    ), l = e.deps;
    if (A !== null) {
      var c;
      if (Se(e, R), l !== null && R > 0)
        for (l.length = R + A.length, c = 0; c < A.length; c++)
          l[R + c] = A[c];
      else
        e.deps = l = A;
      if (!_e)
        for (c = R; c < l.length; c++)
          ((d = l[c]).reactions ?? (d.reactions = [])).push(e);
    } else l !== null && R < l.length && (Se(e, R), l.length = R);
    return o;
  } finally {
    A = t, R = r, re = n, E = i, _e = a, B = s, C = u;
  }
}
function mn(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = r.indexOf(e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && t.f & z && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !A.includes(t)) && (G(t, Oe), t.f & (ce | je) || (t.f ^= je), Se(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Se(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      mn(e, r[n]);
}
function rt(e) {
  var t = e.f;
  if (!(t & Re)) {
    G(e, D);
    var r = m;
    m = e;
    try {
      t & Qe ? vn(e) : nr(e), rr(e), tr(e);
      var n = cr(e);
      e.teardown = typeof n == "function" ? n : null, e.version = ur;
    } catch (i) {
      yn(
        /** @type {Error} */
        i
      );
    } finally {
      m = r;
    }
  }
}
function dr() {
  ge > 1e3 && (ge = 0, en()), ge++;
}
function vr(e) {
  var t = e.length;
  if (t !== 0) {
    dr();
    var r = pe;
    pe = !0;
    try {
      for (var n = 0; n < t; n++) {
        var i = e[n];
        i.f & D || (i.f ^= D);
        var a = [];
        _r(i, a), wn(a);
      }
    } finally {
      pe = r;
    }
  }
}
function wn(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var n = e[r];
      !(n.f & (Re | V)) && De(n) && (rt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? ir(n) : n.fn = null));
    }
}
function bn() {
  if (Ae = !1, ge > 1001)
    return;
  const e = le;
  le = [], vr(e), Ae || (ge = 0);
}
function nt(e) {
  Ye === or && (Ae || (Ae = !0, queueMicrotask(bn)));
  for (var t = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (r & (qe | Y)) {
      if (!(r & D)) return;
      t.f ^= D;
    }
  }
  le.push(t);
}
function _r(e, t) {
  var r = e.first, n = [];
  e: for (; r !== null; ) {
    var i = r.f, a = (i & Y) !== 0, s = a && (i & D) !== 0;
    if (!s && !(i & V))
      if (i & Ze) {
        a ? r.f ^= D : De(r) && rt(r);
        var u = r.first;
        if (u !== null) {
          r = u;
          continue;
        }
      } else i & Bt && n.push(r);
    var f = r.next;
    if (f === null) {
      let c = r.parent;
      for (; c !== null; ) {
        if (e === c)
          break e;
        var o = c.next;
        if (o !== null) {
          r = o;
          continue e;
        }
        c = c.parent;
      }
    }
    r = f;
  }
  for (var l = 0; l < n.length; l++)
    u = n[l], t.push(u), _r(u, t);
}
function ee(e) {
  var t = Ye, r = le;
  try {
    dr();
    const i = [];
    Ye = pn, le = i, Ae = !1, vr(r);
    var n = e == null ? void 0 : e();
    return _n(), (le.length > 0 || i.length > 0) && ee(), ge = 0, n;
  } finally {
    Ye = t, le = r;
  }
}
function b(e) {
  var u;
  var t = e.f, r = (t & z) !== 0;
  if (r && t & Re) {
    var n = Gt(
      /** @type {Derived} */
      e
    );
    return kt(
      /** @type {Derived} */
      e
    ), n;
  }
  if (E !== null) {
    B !== null && B.includes(e) && sn();
    var i = E.deps;
    A === null && i !== null && i[R] === e ? R++ : A === null ? A = [e] : A.push(e), re !== null && m !== null && m.f & D && !(m.f & Y) && re.includes(e) && (G(m, ne), nt(m));
  } else if (r && /** @type {Derived} */
  e.deps === null) {
    var a = (
      /** @type {Derived} */
      e
    ), s = a.parent;
    s !== null && !((u = s.deriveds) != null && u.includes(a)) && (s.deriveds ?? (s.deriveds = [])).push(a);
  }
  return r && (a = /** @type {Derived} */
  e, De(a) && Jt(a)), e.v;
}
function it(e) {
  const t = E;
  try {
    return E = null, e();
  } finally {
    E = t;
  }
}
const kn = ~(ne | Oe | D);
function G(e, t) {
  e.f = e.f & kn | t;
}
function Nt(e, t = !1, r) {
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
    r2: M(!1)
  });
}
function At(e) {
  const t = C;
  if (t !== null) {
    e !== void 0 && (t.x = e);
    const s = t.e;
    if (s !== null) {
      var r = m, n = E;
      t.e = null;
      try {
        for (var i = 0; i < s.length; i++) {
          var a = s[i];
          P(a.effect), W(a.reaction), et(a.fn);
        }
      } finally {
        P(r), W(n);
      }
    }
    C = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
function X(e, t = null, r) {
  if (typeof e != "object" || e === null || He in e)
    return e;
  const n = lt(e);
  if (n !== Vr && n !== Br)
    return e;
  var i = /* @__PURE__ */ new Map(), a = mt(e), s = M(0);
  a && i.set("length", M(
    /** @type {any[]} */
    e.length
  ));
  var u;
  return new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, o, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && nn();
        var c = i.get(o);
        return c === void 0 ? (c = M(l.value), i.set(o, c)) : N(c, X(l.value, u)), !0;
      },
      deleteProperty(f, o) {
        var l = i.get(o);
        if (l === void 0)
          o in f && i.set(o, M(O));
        else {
          if (a && typeof o == "string") {
            var c = (
              /** @type {Source<number>} */
              i.get("length")
            ), d = Number(o);
            Number.isInteger(d) && d < c.v && N(c, d);
          }
          N(l, O), Mt(s);
        }
        return !0;
      },
      get(f, o, l) {
        var _;
        if (o === He)
          return e;
        var c = i.get(o), d = o in f;
        if (c === void 0 && (!d || (_ = ue(f, o)) != null && _.writable) && (c = M(X(d ? f[o] : O, u)), i.set(o, c)), c !== void 0) {
          var v = b(c);
          return v === O ? void 0 : v;
        }
        return Reflect.get(f, o, l);
      },
      getOwnPropertyDescriptor(f, o) {
        var l = Reflect.getOwnPropertyDescriptor(f, o);
        if (l && "value" in l) {
          var c = i.get(o);
          c && (l.value = b(c));
        } else if (l === void 0) {
          var d = i.get(o), v = d == null ? void 0 : d.v;
          if (d !== void 0 && v !== O)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return l;
      },
      has(f, o) {
        var v;
        if (o === He)
          return !0;
        var l = i.get(o), c = l !== void 0 && l.v !== O || Reflect.has(f, o);
        if (l !== void 0 || m !== null && (!c || (v = ue(f, o)) != null && v.writable)) {
          l === void 0 && (l = M(c ? X(f[o], u) : O), i.set(o, l));
          var d = b(l);
          if (d === O)
            return !1;
        }
        return c;
      },
      set(f, o, l, c) {
        var p;
        var d = i.get(o), v = o in f;
        if (a && o === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var $ = i.get(_ + "");
            $ !== void 0 ? N($, O) : _ in f && ($ = M(O), i.set(_ + "", $));
          }
        d === void 0 ? (!v || (p = ue(f, o)) != null && p.writable) && (d = M(void 0), N(d, X(l, u)), i.set(o, d)) : (v = d.v !== O, N(d, X(l, u)));
        var w = Reflect.getOwnPropertyDescriptor(f, o);
        if (w != null && w.set && w.set.call(c, l), !v) {
          if (a && typeof o == "string") {
            var g = (
              /** @type {Source<number>} */
              i.get("length")
            ), h = Number(o);
            Number.isInteger(h) && h >= g.v && N(g, h + 1);
          }
          Mt(s);
        }
        return !0;
      },
      ownKeys(f) {
        b(s);
        var o = Reflect.ownKeys(f).filter((d) => {
          var v = i.get(d);
          return v === void 0 || v.v !== O;
        });
        for (var [l, c] of i)
          c.v !== O && !(l in f) && o.push(l);
        return o;
      },
      setPrototypeOf() {
        an();
      }
    }
  );
}
function Mt(e, t = 1) {
  N(e, e.v + t);
}
var It, hr, pr;
function ut() {
  if (It === void 0) {
    It = window;
    var e = Element.prototype, t = Node.prototype;
    hr = ue(t, "firstChild").get, pr = ue(t, "nextSibling").get, e.__click = void 0, e.__className = "", e.__attributes = null, e.__styles = null, e.__e = void 0, Text.prototype.__t = void 0;
  }
}
function me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function fe(e) {
  return hr.call(e);
}
// @__NO_SIDE_EFFECTS__
function de(e) {
  return pr.call(e);
}
function ae(e, t) {
  if (!k)
    return /* @__PURE__ */ fe(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ fe(T)
  );
  if (r === null)
    r = T.appendChild(me());
  else if (t && r.nodeType !== 3) {
    var n = me();
    return r == null || r.before(n), I(n), n;
  }
  return I(r), r;
}
function Ue(e, t = 1, r = !1) {
  let n = k ? T : e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ de(n);
  if (!k)
    return n;
  var i = n.nodeType;
  if (r && i !== 3) {
    var a = me();
    return n == null || n.before(a), I(a), a;
  }
  return I(n), /** @type {TemplateNode} */
  n;
}
function gr(e) {
  e.textContent = "";
}
let k = !1;
function H(e) {
  k = e;
}
let T;
function I(e) {
  if (e === null)
    throw yt(), Te;
  return T = e;
}
function we() {
  return I(
    /** @type {TemplateNode} */
    /* @__PURE__ */ de(T)
  );
}
function Z(e) {
  if (k) {
    if (/* @__PURE__ */ de(T) !== null)
      throw yt(), Te;
    T = e;
  }
}
function ft() {
  for (var e = 0, t = T; ; ) {
    if (t.nodeType === 8) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === $t) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Ut || r === gt) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ de(t)
    );
    t.remove(), t = n;
  }
}
const $r = /* @__PURE__ */ new Set(), ct = /* @__PURE__ */ new Set();
function En(e) {
  for (var t = 0; t < e.length; t++)
    $r.add(e[t]);
  for (var r of ct)
    r(e);
}
function Fe(e) {
  var h;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((h = e.composedPath) == null ? void 0 : h.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  ), s = 0, u = e.__root;
  if (u) {
    var f = i.indexOf(u);
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
    We(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var l = E, c = m;
    W(null), P(null);
    try {
      for (var d, v = []; a !== null; ) {
        var _ = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var $ = a["__" + n];
          if ($ !== void 0 && !/** @type {any} */
          a.disabled)
            if (mt($)) {
              var [w, ...g] = $;
              w.apply(a, [e, ...g]);
            } else
              $.call(a, e);
        } catch (p) {
          d ? v.push(p) : d = p;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        a = _;
      }
      if (d) {
        for (let p of v)
          queueMicrotask(() => {
            throw p;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, W(l), P(c);
    }
  }
}
function xn(e) {
  var t = document.createElement("template");
  return t.innerHTML = e, t.content;
}
function Ce(e, t) {
  var r = (
    /** @type {Effect} */
    m
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function be(e, t) {
  var r = (t & Pr) !== 0, n = (t & Hr) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (k)
      return Ce(T, null), T;
    i === void 0 && (i = xn(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ fe(i)));
    var s = (
      /** @type {TemplateNode} */
      n ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ fe(s)
      ), f = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ce(u, f);
    } else
      Ce(s, s);
    return s;
  };
}
function oe(e, t) {
  if (k) {
    m.nodes_end = T, we();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Tn = ["touchstart", "touchmove"];
function Cn(e) {
  return Tn.includes(e);
}
let Ge = !0;
function Dt(e) {
  Ge = e;
}
function Nn(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r == null ? "" : r + "");
}
function yr(e, t) {
  return mr(e, t);
}
function An(e, t) {
  ut(), t.intro = t.intro ?? !1;
  const r = t.target, n = k, i = T;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ fe(r)
    ); a && (a.nodeType !== 8 || /** @type {Comment} */
    a.data !== Ut); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ de(a);
    if (!a)
      throw Te;
    H(!0), I(
      /** @type {Comment} */
      a
    ), we();
    const s = mr(e, { ...t, anchor: a });
    if (T === null || T.nodeType !== 8 || /** @type {Comment} */
    T.data !== $t)
      throw yt(), Te;
    return H(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Te)
      return t.recover === !1 && tn(), ut(), gr(r), H(!1), yr(e, t);
    throw s;
  } finally {
    H(n), I(i);
  }
}
const ve = /* @__PURE__ */ new Map();
function mr(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  ut();
  var u = /* @__PURE__ */ new Set(), f = (c) => {
    for (var d = 0; d < c.length; d++) {
      var v = c[d];
      if (!u.has(v)) {
        u.add(v);
        var _ = Cn(v);
        t.addEventListener(v, Fe, { passive: _ });
        var $ = ve.get(v);
        $ === void 0 ? (document.addEventListener(v, Fe, { passive: _ }), ve.set(v, 1)) : ve.set(v, $ + 1);
      }
    }
  };
  f(wt($r)), ct.add(f);
  var o = void 0, l = Qt(() => {
    var c = r ?? t.appendChild(me());
    return ye(() => {
      if (a) {
        Nt({});
        var d = (
          /** @type {ComponentContext} */
          C
        );
        d.c = a;
      }
      i && (n.$$events = i), k && Ce(
        /** @type {TemplateNode} */
        c,
        null
      ), Ge = s, o = e(c, n) || {}, Ge = !0, k && (m.nodes_end = T), a && At();
    }), () => {
      var _;
      for (var d of u) {
        t.removeEventListener(d, Fe);
        var v = (
          /** @type {number} */
          ve.get(d)
        );
        --v === 0 ? (document.removeEventListener(d, Fe), ve.delete(d)) : ve.set(d, v);
      }
      ct.delete(f), dt.delete(o), c !== r && ((_ = c.parentNode) == null || _.removeChild(c));
    };
  });
  return dt.set(o, l), o;
}
let dt = /* @__PURE__ */ new WeakMap();
function Sn(e) {
  const t = dt.get(e);
  t && t();
}
function vt(e, t, r, n = null, i = !1) {
  k && we();
  var a = e, s = null, u = null, f = null, o = i ? Me : 0;
  tt(() => {
    if (f === (f = !!t())) return;
    let l = !1;
    if (k) {
      const c = (
        /** @type {Comment} */
        a.data === gt
      );
      f === c && (a = ft(), I(a), H(!1), l = !0);
    }
    f ? (s ? Ne(s) : s = ye(() => r(a)), u && Xe(u, () => {
      u = null;
    })) : (u ? Ne(u) : n && (u = ye(() => n(a))), s && Xe(s, () => {
      s = null;
    })), l && H(!0);
  }, o), k && (a = T);
}
let $e = null;
function Lt(e) {
  $e = e;
}
function qn(e, t, r, n) {
  for (var i = [], a = t.length, s = 0; s < a; s++)
    Et(t[s].e, i, !0);
  var u = a > 0 && i.length === 0 && r !== null;
  if (u) {
    var f = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    gr(f), f.append(
      /** @type {Element} */
      r
    ), n.clear(), Q(e, t[0].prev, t[a - 1].next);
  }
  ar(i, () => {
    for (var o = 0; o < a; o++) {
      var l = t[o];
      u || (n.delete(l.k), Q(e, l.prev, l.next)), ie(l.e, !u);
    }
  });
}
function On(e, t, r, n, i, a = null) {
  var s = e, u = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var f = (
      /** @type {Element} */
      e
    );
    s = k ? I(
      /** @type {Comment | Text} */
      /* @__PURE__ */ fe(f)
    ) : f.appendChild(me());
  }
  k && we();
  var o = null, l = !1;
  tt(() => {
    var c = r(), d = mt(c) ? c : c == null ? [] : wt(c), v = d.length;
    if (l && v === 0)
      return;
    l = v === 0;
    let _ = !1;
    if (k) {
      var $ = (
        /** @type {Comment} */
        s.data === gt
      );
      $ !== (v === 0) && (s = ft(), I(s), H(!1), _ = !0);
    }
    if (k) {
      for (var w = null, g, h = 0; h < v; h++) {
        if (T.nodeType === 8 && /** @type {Comment} */
        T.data === $t) {
          s = /** @type {Comment} */
          T, _ = !0, H(!1);
          break;
        }
        var p = d[h], y = n(p, h);
        g = wr(T, u, w, null, p, y, h, i, t), u.items.set(y, g), w = g;
      }
      v > 0 && I(ft());
    }
    if (!k) {
      var x = (
        /** @type {Effect} */
        E
      );
      Rn(d, u, s, i, t, (x.f & V) !== 0, n);
    }
    a !== null && (v === 0 ? o ? Ne(o) : o = ye(() => a(s)) : o !== null && Xe(o, () => {
      o = null;
    })), _ && H(!0), r();
  }), k && (s = T);
}
function Rn(e, t, r, n, i, a, s) {
  var u = e.length, f = t.items, o = t.first, l = o, c, d = null, v = [], _ = [], $, w, g, h;
  for (h = 0; h < u; h += 1) {
    if ($ = e[h], w = s($, h), g = f.get(w), g === void 0) {
      var p = l ? (
        /** @type {TemplateNode} */
        l.e.nodes_start
      ) : r;
      d = wr(
        p,
        t,
        d,
        d === null ? t.first : d.next,
        $,
        w,
        h,
        n,
        i
      ), f.set(w, d), v = [], _ = [], l = d.next;
      continue;
    }
    if (g.e.f & V && Ne(g.e), g !== l) {
      if (c !== void 0 && c.has(g)) {
        if (v.length < _.length) {
          var y = _[0], x;
          d = y.prev;
          var S = v[0], j = v[v.length - 1];
          for (x = 0; x < v.length; x += 1)
            Ft(v[x], y, r);
          for (x = 0; x < _.length; x += 1)
            c.delete(_[x]);
          Q(t, S.prev, j.next), Q(t, d, S), Q(t, j, y), l = y, d = j, h -= 1, v = [], _ = [];
        } else
          c.delete(g), Ft(g, l, r), Q(t, g.prev, g.next), Q(t, g, d === null ? t.first : d.next), Q(t, d, g), d = g;
        continue;
      }
      for (v = [], _ = []; l !== null && l.k !== w; )
        (a || !(l.e.f & V)) && (c ?? (c = /* @__PURE__ */ new Set())).add(l), _.push(l), l = l.next;
      if (l === null)
        continue;
      g = l;
    }
    v.push(g), d = g, l = g.next;
  }
  if (l !== null || c !== void 0) {
    for (var U = c === void 0 ? [] : wt(c); l !== null; )
      (a || !(l.e.f & V)) && U.push(l), l = l.next;
    var Le = U.length;
    if (Le > 0) {
      var Sr = u === 0 ? r : null;
      qn(t, U, Sr, f);
    }
  }
  m.first = t.first && t.first.e, m.last = d && d.e;
}
function wr(e, t, r, n, i, a, s, u, f) {
  var o = $e;
  try {
    var l = (f & Mr) !== 0, c = (f & Dr) === 0, d = l ? c ? /* @__PURE__ */ bt(i) : M(i) : i, v = f & Ir ? M(s) : s, _ = {
      i: v,
      v: d,
      k: a,
      a: null,
      // @ts-expect-error
      e: null,
      prev: r,
      next: n
    };
    return $e = _, _.e = ye(() => u(e, d, v), k), _.e.prev = r && r.e, _.e.next = n && n.e, r === null ? t.first = _ : (r.next = _, r.e.next = _.e), n !== null && (n.prev = _, n.e.prev = _.e), _;
  } finally {
    $e = o;
  }
}
function Ft(e, t, r) {
  for (var n = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : r, i = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : r, a = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); a !== n; ) {
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ de(a)
    );
    i.before(a), a = s;
  }
}
function Q(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function Mn(e, t, r, n, i, a) {
  let s = k;
  k && we();
  var u, f, o = null;
  k && T.nodeType === 1 && (o = /** @type {Element} */
  T, we());
  var l = (
    /** @type {TemplateNode} */
    k ? T : e
  ), c, d = $e;
  tt(() => {
    const v = t() || null;
    var _ = v === "svg" ? Yr : null;
    if (v !== u) {
      var $ = $e;
      Lt(d), c && (v === null ? Xe(c, () => {
        c = null, f = null;
      }) : v === f ? Ne(c) : (ie(c), Dt(!1))), v && v !== f && (c = ye(() => {
        if (o = k ? (
          /** @type {Element} */
          o
        ) : _ ? document.createElementNS(_, v) : document.createElement(v), Ce(o, o), n) {
          var w = (
            /** @type {TemplateNode} */
            k ? /* @__PURE__ */ fe(o) : o.appendChild(me())
          );
          k && (w === null ? H(!1) : I(w)), n(o, w);
        }
        m.nodes_end = o, l.before(o);
      })), u = v, u && (f = u), Dt(!0), Lt($);
    }
  }, Me), s && (H(!0), I(l));
}
function br(e, t) {
  xt(() => {
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
function se(e, t, r, n) {
  var i = e.__attributes ?? (e.__attributes = {});
  k && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "style" && "__styles" in e && (e.__styles = {}), t === "loading" && (e[Xr] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && kr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function J(e, t, r) {
  var n = E, i = m;
  W(null), P(null);
  try {
    kr(e).includes(t) ? e[t] = r : se(e, t, r);
  } finally {
    W(n), P(i);
  }
}
var Pt = /* @__PURE__ */ new Map();
function kr(e) {
  var t = Pt.get(e.nodeName);
  if (t) return t;
  Pt.set(e.nodeName, t = []);
  for (var r, n = lt(e), i = Element.prototype; i !== n; ) {
    r = Ur(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = lt(n);
  }
  return t;
}
function xe(e, t) {
  var r = e.__className, n = In(t);
  k && e.className === n ? e.__className = n : (r !== n || k && e.className !== n) && (t == null ? e.removeAttribute("class") : e.className = n, e.__className = n);
}
function In(e) {
  return e ?? "";
}
const Dn = () => performance.now(), te = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => Dn(),
  tasks: /* @__PURE__ */ new Set()
};
function Er(e) {
  te.tasks.forEach((t) => {
    t.c(e) || (te.tasks.delete(t), t.f());
  }), te.tasks.size !== 0 && te.tick(Er);
}
function Ln(e) {
  let t;
  return te.tasks.size === 0 && te.tick(Er), {
    promise: new Promise((r) => {
      te.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      te.tasks.delete(t);
    }
  };
}
function Pe(e, t) {
  e.dispatchEvent(new CustomEvent(t));
}
function Fn(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Ht(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = Fn(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const Pn = (e) => e;
function xr(e, t, r, n) {
  var i = (e & Fr) !== 0, a = "both", s, u = t.inert, f, o;
  function l() {
    var $ = E, w = m;
    W(null), P(null);
    try {
      return s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
      {}, {
        direction: a
      }));
    } finally {
      W($), P(w);
    }
  }
  var c = {
    is_global: i,
    in() {
      t.inert = u, Pe(t, "introstart"), f = _t(t, l(), o, 1, () => {
        Pe(t, "introend"), f == null || f.abort(), f = s = void 0;
      });
    },
    out($) {
      t.inert = !0, Pe(t, "outrostart"), o = _t(t, l(), f, 0, () => {
        Pe(t, "outroend"), $ == null || $();
      });
    },
    stop: () => {
      f == null || f.abort(), o == null || o.abort();
    }
  }, d = (
    /** @type {Effect} */
    m
  );
  if ((d.transitions ?? (d.transitions = [])).push(c), Ge) {
    var v = i;
    if (!v) {
      for (var _ = (
        /** @type {Effect | null} */
        d.parent
      ); _ && _.f & Me; )
        for (; (_ = _.parent) && !(_.f & Qe); )
          ;
      v = !_ || (_.f & Wt) !== 0;
    }
    v && et(() => {
      it(() => c.in());
    });
  }
}
function _t(e, t, r, n, i) {
  var a = n === 1;
  if (Wr(t)) {
    var s, u = !1;
    return xt(() => {
      if (!u) {
        var w = t({ direction: a ? "in" : "out" });
        s = _t(e, w, r, n, i);
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
  if (r == null || r.deactivate(), !(t != null && t.duration))
    return i(), {
      abort: ke,
      deactivate: ke,
      reset: ke,
      t: () => n
    };
  const { delay: f = 0, css: o, tick: l, easing: c = Pn } = t;
  var d = [];
  if (a && r === void 0 && (l && l(0, 1), o)) {
    var v = Ht(o(0, 1));
    d.push(v, v);
  }
  var _ = () => 1 - n, $ = e.animate(d, { duration: f });
  return $.onfinish = () => {
    var w = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var g = n - w, h = (
      /** @type {number} */
      t.duration * Math.abs(g)
    ), p = [];
    if (h > 0) {
      if (o)
        for (var y = Math.ceil(h / 16.666666666666668), x = 0; x <= y; x += 1) {
          var S = w + g * c(x / y), j = o(S, 1 - S);
          p.push(Ht(j));
        }
      _ = () => {
        var U = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          $.currentTime
        );
        return w + g * c(U / h);
      }, l && Ln(() => {
        if ($.playState !== "running") return !1;
        var U = _();
        return l(U, 1 - U), !0;
      });
    }
    $ = e.animate(p, { duration: h, fill: "forwards" }), $.onfinish = () => {
      _ = () => n, l == null || l(n, 1 - n), i();
    };
  }, {
    abort: () => {
      $ && ($.cancel(), $.effect = null, $.onfinish = ke);
    },
    deactivate: () => {
      i = ke;
    },
    reset: () => {
      n === 0 && (l == null || l(1, 0));
    },
    t: () => _()
  };
}
function Yt(e, t) {
  return e === t || (e == null ? void 0 : e[He]) === t;
}
function Hn(e = {}, t, r, n) {
  return et(() => {
    var i, a;
    return er(() => {
      i = a, a = [], it(() => {
        e !== r(...a) && (t(e, ...a), i && Yt(r(...i), e) && t(null, ...i));
      });
    }), () => {
      xt(() => {
        a && Yt(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function Tr(e) {
  C === null && hn(), C.l !== null ? Yn(C).m.push(e) : Zt(() => {
    const t = it(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Yn(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ?? (t.u = { a: [], b: [], m: [] });
}
function Un(e) {
  for (var t = m, r = m; t !== null && !(t.f & (Y | qe)); )
    t = t.parent;
  try {
    return P(t), e();
  } finally {
    P(r);
  }
}
function he(e, t, r, n) {
  var h;
  var i = (r & Lr) !== 0, a = !1, s;
  s = /** @type {V} */
  e[t];
  var u = (h = ue(e, t)) == null ? void 0 : h.set, f = (
    /** @type {V} */
    n
  ), o = !0, l = !1, c = () => (l = !0, o && (o = !1, f = /** @type {V} */
  n), f);
  s === void 0 && n !== void 0 && (u && i && rn(), s = c(), u && u(s));
  var d;
  if (d = () => {
    var p = (
      /** @type {V} */
      e[t]
    );
    return p === void 0 ? c() : (o = !0, l = !1, p);
  }, u) {
    var v = e.$$legacy;
    return function(p, y) {
      return arguments.length > 0 ? ((!y || v || a) && u(y ? d() : p), p) : d();
    };
  }
  var _ = !1, $ = !1, w = /* @__PURE__ */ bt(s), g = Un(
    () => /* @__PURE__ */ fn(() => {
      var p = d(), y = b(w);
      return _ ? (_ = !1, $ = !0, y) : ($ = !1, w.v = p);
    })
  );
  return function(p, y) {
    if (arguments.length > 0) {
      const x = y ? b(g) : p;
      return g.equals(x) || (_ = !0, N(w, x), l && f !== void 0 && (f = x), it(() => b(g))), p;
    }
    return b(g);
  };
}
function Vn(e) {
  return new Bn(e);
}
var K, F;
class Bn {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    at(this, K);
    /** @type {Record<string, any>} */
    at(this, F);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, u) => {
      var f = /* @__PURE__ */ bt(u);
      return r.set(s, f), f;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, u) {
          return b(r.get(u) ?? n(u, Reflect.get(s, u)));
        },
        has(s, u) {
          return b(r.get(u) ?? n(u, Reflect.get(s, u))), Reflect.has(s, u);
        },
        set(s, u, f) {
          return N(r.get(u) ?? n(u, f), f), Reflect.set(s, u, f);
        }
      }
    );
    st(this, F, (t.hydrate ? An : yr)(t.component, {
      target: t.target,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && ee(), st(this, K, i.$$events);
    for (const s of Object.keys(q(this, F)))
      s === "$set" || s === "$destroy" || s === "$on" || We(this, s, {
        get() {
          return q(this, F)[s];
        },
        /** @param {any} value */
        set(u) {
          q(this, F)[s] = u;
        },
        enumerable: !0
      });
    q(this, F).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, q(this, F).$destroy = () => {
      Sn(q(this, F));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    q(this, F).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    q(this, K)[t] = q(this, K)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return q(this, K)[t].push(n), () => {
      q(this, K)[t] = q(this, K)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    q(this, F).$destroy();
  }
}
K = new WeakMap(), F = new WeakMap();
let Cr;
typeof HTMLElement == "function" && (Cr = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    L(this, "$$ctor");
    /** Slots */
    L(this, "$$s");
    /** @type {any} The Svelte component instance */
    L(this, "$$c");
    /** Whether or not the custom element is connected */
    L(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    L(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    L(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    L(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    L(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    L(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    L(this, "$$me");
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
          i !== "default" && (s.name = i), oe(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = Wn(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = Ve(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = Vn({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Qt(() => {
        er(() => {
          var i;
          this.$$r = !0;
          for (const a of Be(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = Ve(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ve(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
    return Be(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function Ve(e, t, r, n) {
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
      case "Number":
        return t != null ? +t : t;
      default:
        return t;
    }
}
function Wn(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Nr(e, t, r, n, i, a) {
  let s = class extends Cr {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Be(t).map(
        (u) => (t[u].attribute || u).toLowerCase()
      );
    }
  };
  return Be(t).forEach((u) => {
    We(s.prototype, u, {
      get() {
        return this.$$c && u in this.$$c ? this.$$c[u] : this.$$d[u];
      },
      set(f) {
        var c;
        f = Ve(u, f, t), this.$$d[u] = f;
        var o = this.$$c;
        if (o) {
          var l = (c = ue(o, u)) == null ? void 0 : c.get;
          l ? o[u] = f : o.$set({ [u]: f });
        }
      }
    });
  }), n.forEach((u) => {
    We(s.prototype, u, {
      get() {
        var f;
        return (f = this.$$c) == null ? void 0 : f[u];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let Je = Ke(void 0);
const jn = async () => (N(Je, X(await window.loadCardHelpers().then((e) => e))), b(Je)), Kn = () => b(Je) ? b(Je) : jn();
function Xn(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Ar(e, { delay: t = 0, duration: r = 400, easing: n = Xn, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, u = i === "y" ? "height" : "width", f = parseFloat(a[u]), o = i === "y" ? ["top", "bottom"] : ["left", "right"], l = o.map(
    (g) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${g[0].toUpperCase()}${g.slice(1)}`
    )
  ), c = parseFloat(a[`padding${l[0]}`]), d = parseFloat(a[`padding${l[1]}`]), v = parseFloat(a[`margin${l[0]}`]), _ = parseFloat(a[`margin${l[1]}`]), $ = parseFloat(
    a[`border${l[0]}Width`]
  ), w = parseFloat(
    a[`border${l[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (g) => `overflow: hidden;opacity: ${Math.min(g * 20, 1) * s};${u}: ${g * f}px;padding-${o[0]}: ${g * c}px;padding-${o[1]}: ${g * d}px;margin-${o[0]}: ${g * v}px;margin-${o[1]}: ${g * _}px;border-${o[0]}-width: ${g * $}px;border-${o[1]}-width: ${g * w}px;`
  };
}
var zn = /* @__PURE__ */ be('<span class="loading svelte-1sdlsm">Loading...</span>'), Gn = /* @__PURE__ */ be('<div class="outer-container"><!> <!></div>');
const Jn = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function ht(e, t) {
  Nt(t, !0), br(e, Jn);
  const r = he(t, "type", 7, "div"), n = he(t, "config", 7), i = he(t, "hass", 7), a = he(t, "marginTop", 7, "0px");
  let s = Ke(void 0), u = Ke(!0);
  Zt(() => {
    b(s) && (b(s).hass = i());
  }), Tr(async () => {
    const d = (await Kn()).createCardElement(n());
    d.hass = i(), b(s) && (b(s).replaceWith(d), N(s, X(d)), N(u, !1));
  });
  var f = Gn(), o = ae(f);
  Mn(o, r, !1, (c, d) => {
    Hn(c, (v) => N(s, X(v)), () => b(s)), xe(c, "svelte-1sdlsm"), xr(3, c, () => Ar);
  });
  var l = Ue(o, 2);
  return vt(l, () => b(u), (c) => {
    var d = zn();
    oe(c, d);
  }), Z(f), Ee(() => se(f, "style", `margin-top: ${a() ?? ""};`)), oe(e, f), At({
    get type() {
      return r();
    },
    set type(c = "div") {
      r(c), ee();
    },
    get config() {
      return n();
    },
    set config(c) {
      n(c), ee();
    },
    get hass() {
      return i();
    },
    set hass(c) {
      i(c), ee();
    },
    get marginTop() {
      return a();
    },
    set marginTop(c = "0px") {
      a(c), ee();
    }
  });
}
customElements.define("expander-sub-card", Nr(
  ht,
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
function Zn(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const pt = {
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
var Qn = /* @__PURE__ */ be('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), ei = /* @__PURE__ */ be("<button><div> </div> <ha-icon></ha-icon></button>", 2), ti = /* @__PURE__ */ be('<div class="children-container svelte-icqkke"></div>'), ri = /* @__PURE__ */ be("<ha-card><!> <!></ha-card>", 2);
const ni = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function ii(e, t) {
  Nt(t, !0), br(e, ni);
  const r = he(t, "hass", 7), n = he(t, "config", 7, pt);
  let i = !1, a = Ke(!1);
  Tr(() => {
    const h = n()["min-width-expanded"], p = n()["max-width-expanded"], y = document.body.offsetWidth;
    h && p ? n().expanded = y >= h && y <= p : h ? n().expanded = y >= h : p && (n().expanded = y <= p), n().expanded !== void 0 && setTimeout(() => N(a, X(n().expanded)), 100);
  });
  const s = (h) => {
    if (i)
      return h.preventDefault(), h.stopImmediatePropagation(), i = !1, !1;
    N(a, !b(a));
  }, u = (h) => {
    h.currentTarget.classList.contains("title-card-container") && s(h);
  };
  let f, o = !1, l = 0, c = 0;
  const d = (h) => {
    f = h.target, l = h.touches[0].clientX, c = h.touches[0].clientY, o = !1;
  }, v = (h) => {
    const p = h.touches[0].clientX, y = h.touches[0].clientY;
    (Math.abs(p - l) > 10 || Math.abs(y - c) > 10) && (o = !0);
  }, _ = (h) => {
    !o && f === h.target && n()["title-card-clickable"] && N(a, !b(a)), f = void 0, i = !0, setTimeout(() => i = !1, 300);
  };
  var $ = ri(), w = ae($);
  vt(
    w,
    () => n()["title-card"],
    (h) => {
      var p = Qn(), y = ae(p);
      y.__touchstart = d, y.__touchmove = v, y.__touchend = _, y.__click = function(...U) {
        var Le;
        (Le = n()["title-card-clickable"] ? u : null) == null || Le.apply(this, U);
      };
      var x = ae(y);
      ht(x, {
        get hass() {
          return r();
        },
        get config() {
          return n()["title-card"];
        },
        get type() {
          return n()["title-card"].type;
        }
      }), Z(y);
      var S = Ue(y, 2);
      S.__click = s;
      var j = ae(S);
      J(j, "icon", "mdi:chevron-down"), Z(S), Z(p), Ee(() => {
        xe(p, `${`title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}` ?? ""} svelte-icqkke`), se(y, "style", `--title-padding:${n()["title-card-padding"] ?? ""}`), se(y, "role", n()["title-card-clickable"] ? "button" : void 0), se(S, "style", `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), xe(S, `${`header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${b(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), J(j, "style", `--arrow-color:${n()["arrow-color"] ?? ""}`), J(j, "class", `${`ico${b(a) ? " flipped open" : "close"}` ?? ""} svelte-icqkke`);
      }), oe(h, p);
    },
    (h) => {
      var p = ei();
      p.__click = s;
      var y = ae(p), x = ae(y, !0);
      Z(y);
      var S = Ue(y, 2);
      J(S, "icon", "mdi:chevron-down"), Z(p), Ee(() => {
        xe(p, `${`header${n()["expander-card-background-expanded"] ? "" : " ripple"}${b(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), se(p, "style", `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), xe(y, `${`primary title${b(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), Nn(x, n().title), J(S, "style", `--arrow-color:${n()["arrow-color"] ?? ""}`), J(S, "class", `${`ico${b(a) ? " flipped open" : " close"}` ?? ""} svelte-icqkke`);
      }), oe(h, p);
    }
  );
  var g = Ue(w, 2);
  return vt(g, () => n().cards && b(a), (h) => {
    var p = ti();
    On(p, 20, () => n().cards, (y) => y, (y, x) => {
      ht(y, {
        get hass() {
          return r();
        },
        get config() {
          return x;
        },
        get type() {
          return x.type;
        },
        get marginTop() {
          return n()["child-margin-top"];
        }
      });
    }), Z(p), Ee(() => se(p, "style", `--expander-card-display:${n()["expander-card-display"] ?? ""};
             --gap:${(b(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), xr(3, p, () => Ar, () => ({ duration: 300, easing: Zn })), oe(h, p);
  }), Z($), Ee(() => {
    J($, "class", `${`expander-card${n().clear ? " clear" : ""}${b(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), J($, "style", `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(b(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${b(a) ?? ""};
     --card-background:${(b(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
  }), oe(e, $), At({
    get hass() {
      return r();
    },
    set hass(h) {
      r(h), ee();
    },
    get config() {
      return n();
    },
    set config(h = pt) {
      n(h), ee();
    }
  });
}
En([
  "touchstart",
  "touchmove",
  "touchend",
  "click"
]);
customElements.define("expander-card", Nr(ii, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    L(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...pt, ...r };
  }
}));
const ai = "2.2.6";
console.info(
  `%c  Expander-Card 
%c Version ${ai}`,
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
  ii as default
};
//# sourceMappingURL=expander-card.js.map
