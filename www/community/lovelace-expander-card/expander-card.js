var qr = Object.defineProperty;
var Ot = (e) => {
  throw TypeError(e);
};
var Rr = (e, t, r) => t in e ? qr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var P = (e, t, r) => Rr(e, typeof t != "symbol" ? t + "" : t, r), qt = (e, t, r) => t.has(e) || Ot("Cannot " + r);
var R = (e, t, r) => (qt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), st = (e, t, r) => t.has(e) ? Ot("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), lt = (e, t, r, n) => (qt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
const Ir = "5";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(Ir);
const Mr = 1, Dr = 2, Lr = 16, Fr = 4, Pr = 1, Hr = 2, Vt = "[", $t = "[!", yt = "]", Ce = {}, M = Symbol(), Yr = "http://www.w3.org/2000/svg", Ut = !1;
function mt(e) {
  console.warn("hydration_mismatch");
}
var wt = Array.isArray, bt = Array.from, We = Object.keys, je = Object.defineProperty, ce = Object.getOwnPropertyDescriptor, Vr = Object.getOwnPropertyDescriptors, Ur = Object.prototype, Br = Array.prototype, ot = Object.getPrototypeOf;
function Wr(e) {
  return typeof e == "function";
}
const Ee = () => {
};
function jr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const J = 2, Bt = 4, Ze = 8, Qe = 16, W = 32, Re = 64, ve = 128, Ke = 256, F = 512, ae = 1024, Ie = 2048, K = 4096, Me = 8192, Wt = 16384, De = 32768, Kr = 1 << 18, jt = 1 << 19, Ye = Symbol("$state"), Xr = Symbol("");
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
let Xt = !1;
function Y(e) {
  return {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Kt,
    version: 0
  };
}
function Se(e) {
  return /* @__PURE__ */ on(Y(e));
}
// @__NO_SIDE_EFFECTS__
function kt(e, t = !1) {
  const r = Y(e);
  return t || (r.equals = Gr), r;
}
// @__NO_SIDE_EFFECTS__
function on(e) {
  return T !== null && T.f & J && (X === null ? gn([e]) : X.push(e)), e;
}
function A(e, t) {
  return T !== null && yn() && T.f & (J | Qe) && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (X === null || !X.includes(e)) && ln(), un(e, t);
}
function un(e, t) {
  return e.equals(t) || (e.v = t, e.version = cr(), zt(e, ae), g !== null && g.f & F && !(g.f & W) && (O !== null && O.includes(e) ? (Z(g, ae), nt(g)) : ie === null ? $n([e]) : ie.push(e))), t;
}
function zt(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f;
      s & ae || (Z(a, t), s & (F | ve) && (s & J ? zt(
        /** @type {Derived} */
        a,
        Ie
      ) : nt(
        /** @type {Effect} */
        a
      )));
    }
}
// @__NO_SIDE_EFFECTS__
function fn(e) {
  var t = J | ae;
  g === null ? t |= ve : g.f |= jt;
  const r = {
    children: null,
    ctx: I,
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
    parent: g
  };
  if (T !== null && T.f & J) {
    var n = (
      /** @type {Derived} */
      T
    );
    (n.children ?? (n.children = [])).push(r);
  }
  return r;
}
function Gt(e) {
  var t = e.children;
  if (t !== null) {
    e.children = null;
    for (var r = 0; r < t.length; r += 1) {
      var n = t[r];
      n.f & J ? Et(
        /** @type {Derived} */
        n
      ) : se(
        /** @type {Effect} */
        n
      );
    }
  }
}
function Jt(e) {
  var t, r = g;
  V(e.parent);
  try {
    Gt(e), t = dr(e);
  } finally {
    V(r);
  }
  return t;
}
function Zt(e) {
  var t = Jt(e), r = (pe || e.f & ve) && e.deps !== null ? Ie : F;
  Z(e, r), e.equals(t) || (e.v = t, e.version = cr());
}
function Et(e) {
  Gt(e), qe(e, 0), Z(e, Me), e.v = e.children = e.deps = e.ctx = e.reactions = null;
}
function cn(e) {
  g === null && T === null && Qr(), T !== null && T.f & ve && Zr(), Ct && Jr();
}
function dn(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Le(e, t, r, n = !0) {
  var i = (e & Re) !== 0, a = g, s = {
    ctx: I,
    deps: null,
    deriveds: null,
    nodes_start: null,
    nodes_end: null,
    f: e | ae,
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
    var u = $e;
    try {
      Rt(!0), rt(s), s.f |= Wt;
    } catch (l) {
      throw se(s), l;
    } finally {
      Rt(u);
    }
  } else t !== null && nt(s);
  var f = r && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & jt) === 0;
  if (!f && !i && n && (a !== null && dn(s, a), T !== null && T.f & J)) {
    var o = (
      /** @type {Derived} */
      T
    );
    (o.children ?? (o.children = [])).push(s);
  }
  return s;
}
function Qt(e) {
  cn();
  var t = g !== null && (g.f & W) !== 0 && I !== null && !I.m;
  if (t) {
    var r = (
      /** @type {ComponentContext} */
      I
    );
    (r.e ?? (r.e = [])).push({
      fn: e,
      effect: g,
      reaction: T
    });
  } else {
    var n = et(e);
    return n;
  }
}
function er(e) {
  const t = Le(Re, e, !0);
  return () => {
    se(t);
  };
}
function et(e) {
  return Le(Bt, e, !1);
}
function tr(e) {
  return Le(Ze, e, !0);
}
function xe(e) {
  return tt(e);
}
function tt(e, t = 0) {
  return Le(Ze | Qe | t, e, !0);
}
function me(e, t = !0) {
  return Le(Ze | W, e, !0, t);
}
function rr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Ct, n = T;
    It(!0), z(null);
    try {
      t.call(null);
    } finally {
      It(r), z(n);
    }
  }
}
function nr(e) {
  var t = e.deriveds;
  if (t !== null) {
    e.deriveds = null;
    for (var r = 0; r < t.length; r += 1)
      Et(t[r]);
  }
}
function ir(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    var n = r.next;
    se(r, t), r = n;
  }
}
function vn(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    t.f & W || se(t), t = r;
  }
}
function se(e, t = !0) {
  var r = !1;
  if ((t || e.f & Kr) && e.nodes_start !== null) {
    for (var n = e.nodes_start, i = e.nodes_end; n !== null; ) {
      var a = n === i ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ _e(n)
      );
      n.remove(), n = a;
    }
    r = !0;
  }
  ir(e, t && !r), nr(e), qe(e, 0), Z(e, Me);
  var s = e.transitions;
  if (s !== null)
    for (const f of s)
      f.stop();
  rr(e);
  var u = e.parent;
  u !== null && u.first !== null && ar(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.parent = e.fn = e.nodes_start = e.nodes_end = null;
}
function ar(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Xe(e, t) {
  var r = [];
  xt(e, r, !0), sr(r, () => {
    se(e), t && t();
  });
}
function sr(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function xt(e, t, r) {
  if (!(e.f & K)) {
    if (e.f ^= K, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & De) !== 0 || (n.f & W) !== 0;
      xt(n, t, a ? r : !1), n = i;
    }
  }
}
function Ae(e) {
  lr(e, !0);
}
function lr(e, t) {
  if (e.f & K) {
    Fe(e) && rt(e), e.f ^= K;
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & De) !== 0 || (r.f & W) !== 0;
      lr(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let ze = !1, ut = [];
function or() {
  ze = !1;
  const e = ut.slice();
  ut = [], jr(e);
}
function Tt(e) {
  ze || (ze = !0, queueMicrotask(or)), ut.push(e);
}
function _n() {
  ze && or();
}
function hn(e) {
  throw new Error("lifecycle_outside_component");
}
const ur = 0, pn = 1;
let Ve = ur, Oe = !1, $e = !1, Ct = !1;
function Rt(e) {
  $e = e;
}
function It(e) {
  Ct = e;
}
let ue = [], ye = 0;
let T = null;
function z(e) {
  T = e;
}
let g = null;
function V(e) {
  g = e;
}
let X = null;
function gn(e) {
  X = e;
}
let O = null, D = 0, ie = null;
function $n(e) {
  ie = e;
}
let fr = 0, pe = !1, I = null;
function cr() {
  return ++fr;
}
function yn() {
  return !Xt;
}
function Fe(e) {
  var s, u;
  var t = e.f;
  if (t & ae)
    return !0;
  if (t & Ie) {
    var r = e.deps, n = (t & ve) !== 0;
    if (r !== null) {
      var i;
      if (t & Ke) {
        for (i = 0; i < r.length; i++)
          ((s = r[i]).reactions ?? (s.reactions = [])).push(e);
        e.f ^= Ke;
      }
      for (i = 0; i < r.length; i++) {
        var a = r[i];
        if (Fe(
          /** @type {Derived} */
          a
        ) && Zt(
          /** @type {Derived} */
          a
        ), n && g !== null && !pe && !((u = a == null ? void 0 : a.reactions) != null && u.includes(e)) && (a.reactions ?? (a.reactions = [])).push(e), a.version > e.version)
          return !0;
      }
    }
    n || Z(e, F);
  }
  return !1;
}
function mn(e, t, r) {
  throw e;
}
function dr(e) {
  var d;
  var t = O, r = D, n = ie, i = T, a = pe, s = X, u = I, f = e.f;
  O = /** @type {null | Value[]} */
  null, D = 0, ie = null, T = f & (W | Re) ? null : e, pe = !$e && (f & ve) !== 0, X = null, I = e.ctx;
  try {
    var o = (
      /** @type {Function} */
      (0, e.fn)()
    ), l = e.deps;
    if (O !== null) {
      var c;
      if (qe(e, D), l !== null && D > 0)
        for (l.length = D + O.length, c = 0; c < O.length; c++)
          l[D + c] = O[c];
      else
        e.deps = l = O;
      if (!pe)
        for (c = D; c < l.length; c++)
          ((d = l[c]).reactions ?? (d.reactions = [])).push(e);
    } else l !== null && D < l.length && (qe(e, D), l.length = D);
    return o;
  } finally {
    O = t, D = r, ie = n, T = i, pe = a, X = s, I = u;
  }
}
function wn(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = r.indexOf(e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && t.f & J && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (O === null || !O.includes(t)) && (Z(t, Ie), t.f & (ve | Ke) || (t.f ^= Ke), qe(
    /** @type {Derived} **/
    t,
    0
  ));
}
function qe(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      wn(e, r[n]);
}
function rt(e) {
  var t = e.f;
  if (!(t & Me)) {
    Z(e, F);
    var r = g;
    g = e;
    try {
      t & Qe ? vn(e) : ir(e), nr(e), rr(e);
      var n = dr(e);
      e.teardown = typeof n == "function" ? n : null, e.version = fr;
    } catch (i) {
      mn(
        /** @type {Error} */
        i
      );
    } finally {
      g = r;
    }
  }
}
function vr() {
  ye > 1e3 && (ye = 0, en()), ye++;
}
function _r(e) {
  var t = e.length;
  if (t !== 0) {
    vr();
    var r = $e;
    $e = !0;
    try {
      for (var n = 0; n < t; n++) {
        var i = e[n];
        i.f & F || (i.f ^= F);
        var a = [];
        hr(i, a), bn(a);
      }
    } finally {
      $e = r;
    }
  }
}
function bn(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var n = e[r];
      !(n.f & (Me | K)) && Fe(n) && (rt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? ar(n) : n.fn = null));
    }
}
function kn() {
  if (Oe = !1, ye > 1001)
    return;
  const e = ue;
  ue = [], _r(e), Oe || (ye = 0);
}
function nt(e) {
  Ve === ur && (Oe || (Oe = !0, queueMicrotask(kn)));
  for (var t = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (r & (Re | W)) {
      if (!(r & F)) return;
      t.f ^= F;
    }
  }
  ue.push(t);
}
function hr(e, t) {
  var r = e.first, n = [];
  e: for (; r !== null; ) {
    var i = r.f, a = (i & W) !== 0, s = a && (i & F) !== 0;
    if (!s && !(i & K))
      if (i & Ze) {
        a ? r.f ^= F : Fe(r) && rt(r);
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
    u = n[l], t.push(u), hr(u, t);
}
function re(e) {
  var t = Ve, r = ue;
  try {
    vr();
    const i = [];
    Ve = pn, ue = i, Oe = !1, _r(r);
    var n = e == null ? void 0 : e();
    return _n(), (ue.length > 0 || i.length > 0) && re(), ye = 0, n;
  } finally {
    Ve = t, ue = r;
  }
}
function m(e) {
  var u;
  var t = e.f, r = (t & J) !== 0;
  if (r && t & Me) {
    var n = Jt(
      /** @type {Derived} */
      e
    );
    return Et(
      /** @type {Derived} */
      e
    ), n;
  }
  if (T !== null) {
    X !== null && X.includes(e) && sn();
    var i = T.deps;
    O === null && i !== null && i[D] === e ? D++ : O === null ? O = [e] : O.push(e), ie !== null && g !== null && g.f & F && !(g.f & W) && ie.includes(e) && (Z(g, ae), nt(g));
  } else if (r && /** @type {Derived} */
  e.deps === null) {
    var a = (
      /** @type {Derived} */
      e
    ), s = a.parent;
    s !== null && !((u = s.deriveds) != null && u.includes(a)) && (s.deriveds ?? (s.deriveds = [])).push(a);
  }
  return r && (a = /** @type {Derived} */
  e, Fe(a) && Zt(a)), e.v;
}
function it(e) {
  const t = T;
  try {
    return T = null, e();
  } finally {
    T = t;
  }
}
const En = ~(ae | Ie | F);
function Z(e, t) {
  e.f = e.f & En | t;
}
function Nt(e, t = !1, r) {
  I = {
    p: I,
    c: null,
    e: null,
    m: !1,
    s: e,
    x: null,
    l: null
  };
}
function St(e) {
  const t = I;
  if (t !== null) {
    e !== void 0 && (t.x = e);
    const s = t.e;
    if (s !== null) {
      var r = g, n = T;
      t.e = null;
      try {
        for (var i = 0; i < s.length; i++) {
          var a = s[i];
          V(a.effect), z(a.reaction), et(a.fn);
        }
      } finally {
        V(r), z(n);
      }
    }
    I = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
function j(e, t = null, r) {
  if (typeof e != "object" || e === null || Ye in e)
    return e;
  const n = ot(e);
  if (n !== Ur && n !== Br)
    return e;
  var i = /* @__PURE__ */ new Map(), a = wt(e), s = Y(0);
  a && i.set("length", Y(
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
        return c === void 0 ? (c = Y(l.value), i.set(o, c)) : A(c, j(l.value, u)), !0;
      },
      deleteProperty(f, o) {
        var l = i.get(o);
        if (l === void 0)
          o in f && i.set(o, Y(M));
        else {
          if (a && typeof o == "string") {
            var c = (
              /** @type {Source<number>} */
              i.get("length")
            ), d = Number(o);
            Number.isInteger(d) && d < c.v && A(c, d);
          }
          A(l, M), Mt(s);
        }
        return !0;
      },
      get(f, o, l) {
        var _;
        if (o === Ye)
          return e;
        var c = i.get(o), d = o in f;
        if (c === void 0 && (!d || (_ = ce(f, o)) != null && _.writable) && (c = Y(j(d ? f[o] : M, u)), i.set(o, c)), c !== void 0) {
          var v = m(c);
          return v === M ? void 0 : v;
        }
        return Reflect.get(f, o, l);
      },
      getOwnPropertyDescriptor(f, o) {
        var l = Reflect.getOwnPropertyDescriptor(f, o);
        if (l && "value" in l) {
          var c = i.get(o);
          c && (l.value = m(c));
        } else if (l === void 0) {
          var d = i.get(o), v = d == null ? void 0 : d.v;
          if (d !== void 0 && v !== M)
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
        if (o === Ye)
          return !0;
        var l = i.get(o), c = l !== void 0 && l.v !== M || Reflect.has(f, o);
        if (l !== void 0 || g !== null && (!c || (v = ce(f, o)) != null && v.writable)) {
          l === void 0 && (l = Y(c ? j(f[o], u) : M), i.set(o, l));
          var d = m(l);
          if (d === M)
            return !1;
        }
        return c;
      },
      set(f, o, l, c) {
        var w;
        var d = i.get(o), v = o in f;
        if (a && o === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var p = i.get(_ + "");
            p !== void 0 ? A(p, M) : _ in f && (p = Y(M), i.set(_ + "", p));
          }
        d === void 0 ? (!v || (w = ce(f, o)) != null && w.writable) && (d = Y(void 0), A(d, j(l, u)), i.set(o, d)) : (v = d.v !== M, A(d, j(l, u)));
        var k = Reflect.getOwnPropertyDescriptor(f, o);
        if (k != null && k.set && k.set.call(c, l), !v) {
          if (a && typeof o == "string") {
            var h = (
              /** @type {Source<number>} */
              i.get("length")
            ), E = Number(o);
            Number.isInteger(E) && E >= h.v && A(h, E + 1);
          }
          Mt(s);
        }
        return !0;
      },
      ownKeys(f) {
        m(s);
        var o = Reflect.ownKeys(f).filter((d) => {
          var v = i.get(d);
          return v === void 0 || v.v !== M;
        });
        for (var [l, c] of i)
          c.v !== M && !(l in f) && o.push(l);
        return o;
      },
      setPrototypeOf() {
        an();
      }
    }
  );
}
function Mt(e, t = 1) {
  A(e, e.v + t);
}
var Dt, pr, gr;
function ft() {
  if (Dt === void 0) {
    Dt = window;
    var e = Element.prototype, t = Node.prototype;
    pr = ce(t, "firstChild").get, gr = ce(t, "nextSibling").get, e.__click = void 0, e.__className = "", e.__attributes = null, e.__styles = null, e.__e = void 0, Text.prototype.__t = void 0;
  }
}
function we(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function de(e) {
  return pr.call(e);
}
// @__NO_SIDE_EFFECTS__
function _e(e) {
  return gr.call(e);
}
function le(e, t) {
  if (!x)
    return /* @__PURE__ */ de(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ de(C)
  );
  if (r === null)
    r = C.appendChild(we());
  else if (t && r.nodeType !== 3) {
    var n = we();
    return r == null || r.before(n), L(n), n;
  }
  return L(r), r;
}
function Ue(e, t = 1, r = !1) {
  let n = x ? C : e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ _e(n);
  if (!x)
    return n;
  var i = n.nodeType;
  if (r && i !== 3) {
    var a = we();
    return n == null || n.before(a), L(a), a;
  }
  return L(n), /** @type {TemplateNode} */
  n;
}
function $r(e) {
  e.textContent = "";
}
let x = !1;
function B(e) {
  x = e;
}
let C;
function L(e) {
  if (e === null)
    throw mt(), Ce;
  return C = e;
}
function be() {
  return L(
    /** @type {TemplateNode} */
    /* @__PURE__ */ _e(C)
  );
}
function ee(e) {
  if (x) {
    if (/* @__PURE__ */ _e(C) !== null)
      throw mt(), Ce;
    C = e;
  }
}
function ct() {
  for (var e = 0, t = C; ; ) {
    if (t.nodeType === 8) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === yt) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Vt || r === $t) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ _e(t)
    );
    t.remove(), t = n;
  }
}
const yr = /* @__PURE__ */ new Set(), dt = /* @__PURE__ */ new Set();
function xn(e) {
  for (var t = 0; t < e.length; t++)
    yr.add(e[t]);
  for (var r of dt)
    r(e);
}
function Pe(e) {
  var E;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((E = e.composedPath) == null ? void 0 : E.call(e)) || [], a = (
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
    je(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var l = T, c = g;
    z(null), V(null);
    try {
      for (var d, v = []; a !== null; ) {
        var _ = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var p = a["__" + n];
          if (p !== void 0 && !/** @type {any} */
          a.disabled)
            if (wt(p)) {
              var [k, ...h] = p;
              k.apply(a, [e, ...h]);
            } else
              p.call(a, e);
        } catch (w) {
          d ? v.push(w) : d = w;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        a = _;
      }
      if (d) {
        for (let w of v)
          queueMicrotask(() => {
            throw w;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, z(l), V(c);
    }
  }
}
function Tn(e) {
  var t = document.createElement("template");
  return t.innerHTML = e, t.content;
}
function Ne(e, t) {
  var r = (
    /** @type {Effect} */
    g
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function ke(e, t) {
  var r = (t & Pr) !== 0, n = (t & Hr) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (x)
      return Ne(C, null), C;
    i === void 0 && (i = Tn(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ de(i)));
    var s = (
      /** @type {TemplateNode} */
      n ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ de(s)
      ), f = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ne(u, f);
    } else
      Ne(s, s);
    return s;
  };
}
function fe(e, t) {
  if (x) {
    g.nodes_end = C, be();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Cn = ["touchstart", "touchmove"];
function Nn(e) {
  return Cn.includes(e);
}
let Ge = !0;
function Lt(e) {
  Ge = e;
}
function Sn(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r == null ? "" : r + "");
}
function mr(e, t) {
  return wr(e, t);
}
function An(e, t) {
  ft(), t.intro = t.intro ?? !1;
  const r = t.target, n = x, i = C;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ de(r)
    ); a && (a.nodeType !== 8 || /** @type {Comment} */
    a.data !== Vt); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ _e(a);
    if (!a)
      throw Ce;
    B(!0), L(
      /** @type {Comment} */
      a
    ), be();
    const s = wr(e, { ...t, anchor: a });
    if (C === null || C.nodeType !== 8 || /** @type {Comment} */
    C.data !== yt)
      throw mt(), Ce;
    return B(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Ce)
      return t.recover === !1 && tn(), ft(), $r(r), B(!1), mr(e, t);
    throw s;
  } finally {
    B(n), L(i);
  }
}
const he = /* @__PURE__ */ new Map();
function wr(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  ft();
  var u = /* @__PURE__ */ new Set(), f = (c) => {
    for (var d = 0; d < c.length; d++) {
      var v = c[d];
      if (!u.has(v)) {
        u.add(v);
        var _ = Nn(v);
        t.addEventListener(v, Pe, { passive: _ });
        var p = he.get(v);
        p === void 0 ? (document.addEventListener(v, Pe, { passive: _ }), he.set(v, 1)) : he.set(v, p + 1);
      }
    }
  };
  f(bt(yr)), dt.add(f);
  var o = void 0, l = er(() => {
    var c = r ?? t.appendChild(we());
    return me(() => {
      if (a) {
        Nt({});
        var d = (
          /** @type {ComponentContext} */
          I
        );
        d.c = a;
      }
      i && (n.$$events = i), x && Ne(
        /** @type {TemplateNode} */
        c,
        null
      ), Ge = s, o = e(c, n) || {}, Ge = !0, x && (g.nodes_end = C), a && St();
    }), () => {
      var _;
      for (var d of u) {
        t.removeEventListener(d, Pe);
        var v = (
          /** @type {number} */
          he.get(d)
        );
        --v === 0 ? (document.removeEventListener(d, Pe), he.delete(d)) : he.set(d, v);
      }
      dt.delete(f), vt.delete(o), c !== r && ((_ = c.parentNode) == null || _.removeChild(c));
    };
  });
  return vt.set(o, l), o;
}
let vt = /* @__PURE__ */ new WeakMap();
function On(e) {
  const t = vt.get(e);
  t && t();
}
function _t(e, t, r, n = null, i = !1) {
  x && be();
  var a = e, s = null, u = null, f = null, o = i ? De : 0;
  tt(() => {
    if (f === (f = !!t())) return;
    let l = !1;
    if (x) {
      const c = (
        /** @type {Comment} */
        a.data === $t
      );
      f === c && (a = ct(), L(a), B(!1), l = !0);
    }
    f ? (s ? Ae(s) : s = me(() => r(a)), u && Xe(u, () => {
      u = null;
    })) : (u ? Ae(u) : n && (u = me(() => n(a))), s && Xe(s, () => {
      s = null;
    })), l && B(!0);
  }, o), x && (a = C);
}
function qn(e, t, r, n) {
  for (var i = [], a = t.length, s = 0; s < a; s++)
    xt(t[s].e, i, !0);
  var u = a > 0 && i.length === 0 && r !== null;
  if (u) {
    var f = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    $r(f), f.append(
      /** @type {Element} */
      r
    ), n.clear(), te(e, t[0].prev, t[a - 1].next);
  }
  sr(i, () => {
    for (var o = 0; o < a; o++) {
      var l = t[o];
      u || (n.delete(l.k), te(e, l.prev, l.next)), se(l.e, !u);
    }
  });
}
function Rn(e, t, r, n, i, a = null) {
  var s = e, u = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var f = (
      /** @type {Element} */
      e
    );
    s = x ? L(
      /** @type {Comment | Text} */
      /* @__PURE__ */ de(f)
    ) : f.appendChild(we());
  }
  x && be();
  var o = null, l = !1;
  tt(() => {
    var c = r(), d = wt(c) ? c : c == null ? [] : bt(c), v = d.length;
    if (l && v === 0)
      return;
    l = v === 0;
    let _ = !1;
    if (x) {
      var p = (
        /** @type {Comment} */
        s.data === $t
      );
      p !== (v === 0) && (s = ct(), L(s), B(!1), _ = !0);
    }
    if (x) {
      for (var k = null, h, E = 0; E < v; E++) {
        if (C.nodeType === 8 && /** @type {Comment} */
        C.data === yt) {
          s = /** @type {Comment} */
          C, _ = !0, B(!1);
          break;
        }
        var w = d[E], N = n(w, E);
        h = br(C, u, k, null, w, N, E, i, t), u.items.set(N, h), k = h;
      }
      v > 0 && L(ct());
    }
    if (!x) {
      var S = (
        /** @type {Effect} */
        T
      );
      In(d, u, s, i, t, (S.f & K) !== 0, n);
    }
    a !== null && (v === 0 ? o ? Ae(o) : o = me(() => a(s)) : o !== null && Xe(o, () => {
      o = null;
    })), _ && B(!0), r();
  }), x && (s = C);
}
function In(e, t, r, n, i, a, s) {
  var u = e.length, f = t.items, o = t.first, l = o, c, d = null, v = [], _ = [], p, k, h, E;
  for (E = 0; E < u; E += 1) {
    if (p = e[E], k = s(p, E), h = f.get(k), h === void 0) {
      var w = l ? (
        /** @type {TemplateNode} */
        l.e.nodes_start
      ) : r;
      d = br(
        w,
        t,
        d,
        d === null ? t.first : d.next,
        p,
        k,
        E,
        n,
        i
      ), f.set(k, d), v = [], _ = [], l = d.next;
      continue;
    }
    if (h.e.f & K && Ae(h.e), h !== l) {
      if (c !== void 0 && c.has(h)) {
        if (v.length < _.length) {
          var N = _[0], S;
          d = N.prev;
          var $ = v[0], b = v[v.length - 1];
          for (S = 0; S < v.length; S += 1)
            Ft(v[S], N, r);
          for (S = 0; S < _.length; S += 1)
            c.delete(_[S]);
          te(t, $.prev, b.next), te(t, d, $), te(t, b, N), l = N, d = b, E -= 1, v = [], _ = [];
        } else
          c.delete(h), Ft(h, l, r), te(t, h.prev, h.next), te(t, h, d === null ? t.first : d.next), te(t, d, h), d = h;
        continue;
      }
      for (v = [], _ = []; l !== null && l.k !== k; )
        (a || !(l.e.f & K)) && (c ?? (c = /* @__PURE__ */ new Set())).add(l), _.push(l), l = l.next;
      if (l === null)
        continue;
      h = l;
    }
    v.push(h), d = h, l = h.next;
  }
  if (l !== null || c !== void 0) {
    for (var y = c === void 0 ? [] : bt(c); l !== null; )
      (a || !(l.e.f & K)) && y.push(l), l = l.next;
    var q = y.length;
    if (q > 0) {
      var U = u === 0 ? r : null;
      qn(t, y, U, f);
    }
  }
  g.first = t.first && t.first.e, g.last = d && d.e;
}
function br(e, t, r, n, i, a, s, u, f) {
  var o = (f & Mr) !== 0, l = (f & Lr) === 0, c = o ? l ? /* @__PURE__ */ kt(i) : Y(i) : i, d = f & Dr ? Y(s) : s, v = {
    i: d,
    v: c,
    k: a,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: n
  };
  try {
    return v.e = me(() => u(e, c, d), x), v.e.prev = r && r.e, v.e.next = n && n.e, r === null ? t.first = v : (r.next = v, r.e.next = v.e), n !== null && (n.prev = v, n.e.prev = v.e), v;
  } finally {
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
      /* @__PURE__ */ _e(a)
    );
    i.before(a), a = s;
  }
}
function te(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function Mn(e, t, r, n, i, a) {
  let s = x;
  x && be();
  var u, f, o = null;
  x && C.nodeType === 1 && (o = /** @type {Element} */
  C, be());
  var l = (
    /** @type {TemplateNode} */
    x ? C : e
  ), c;
  tt(() => {
    const d = t() || null;
    var v = d === "svg" ? Yr : null;
    d !== u && (c && (d === null ? Xe(c, () => {
      c = null, f = null;
    }) : d === f ? Ae(c) : (se(c), Lt(!1))), d && d !== f && (c = me(() => {
      if (o = x ? (
        /** @type {Element} */
        o
      ) : v ? document.createElementNS(v, d) : document.createElement(d), Ne(o, o), n) {
        var _ = (
          /** @type {TemplateNode} */
          x ? /* @__PURE__ */ de(o) : o.appendChild(we())
        );
        x && (_ === null ? B(!1) : L(_)), n(o, _);
      }
      g.nodes_end = o, l.before(o);
    })), u = d, u && (f = u), Lt(!0));
  }, De), s && (B(!0), L(l));
}
function kr(e, t) {
  Tt(() => {
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
function oe(e, t, r, n) {
  var i = e.__attributes ?? (e.__attributes = {});
  x && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "style" && "__styles" in e && (e.__styles = {}), t === "loading" && (e[Xr] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Er(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Q(e, t, r) {
  var n = T, i = g;
  z(null), V(null);
  try {
    Er(e).includes(t) ? e[t] = r : oe(e, t, r);
  } finally {
    z(n), V(i);
  }
}
var Pt = /* @__PURE__ */ new Map();
function Er(e) {
  var t = Pt.get(e.nodeName);
  if (t) return t;
  Pt.set(e.nodeName, t = []);
  for (var r, n = ot(e), i = Element.prototype; i !== n; ) {
    r = Vr(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = ot(n);
  }
  return t;
}
function Te(e, t) {
  var r = e.__className, n = Dn(t);
  x && e.className === n ? e.__className = n : (r !== n || x && e.className !== n) && (t == null ? e.removeAttribute("class") : e.className = n, e.__className = n);
}
function Dn(e) {
  return e ?? "";
}
const Ln = () => performance.now(), ne = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => Ln(),
  tasks: /* @__PURE__ */ new Set()
};
function xr(e) {
  ne.tasks.forEach((t) => {
    t.c(e) || (ne.tasks.delete(t), t.f());
  }), ne.tasks.size !== 0 && ne.tick(xr);
}
function Fn(e) {
  let t;
  return ne.tasks.size === 0 && ne.tick(xr), {
    promise: new Promise((r) => {
      ne.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      ne.tasks.delete(t);
    }
  };
}
function He(e, t) {
  e.dispatchEvent(new CustomEvent(t));
}
function Pn(e) {
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
    const s = Pn(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const Hn = (e) => e;
function Tr(e, t, r, n) {
  var i = (e & Fr) !== 0, a = "both", s, u = t.inert, f, o;
  function l() {
    var p = T, k = g;
    z(null), V(null);
    try {
      return s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
      {}, {
        direction: a
      }));
    } finally {
      z(p), V(k);
    }
  }
  var c = {
    is_global: i,
    in() {
      t.inert = u, He(t, "introstart"), f = ht(t, l(), o, 1, () => {
        He(t, "introend"), f == null || f.abort(), f = s = void 0;
      });
    },
    out(p) {
      t.inert = !0, He(t, "outrostart"), o = ht(t, l(), f, 0, () => {
        He(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      f == null || f.abort(), o == null || o.abort();
    }
  }, d = (
    /** @type {Effect} */
    g
  );
  if ((d.transitions ?? (d.transitions = [])).push(c), Ge) {
    var v = i;
    if (!v) {
      for (var _ = (
        /** @type {Effect | null} */
        d.parent
      ); _ && _.f & De; )
        for (; (_ = _.parent) && !(_.f & Qe); )
          ;
      v = !_ || (_.f & Wt) !== 0;
    }
    v && et(() => {
      it(() => c.in());
    });
  }
}
function ht(e, t, r, n, i) {
  var a = n === 1;
  if (Wr(t)) {
    var s, u = !1;
    return Tt(() => {
      if (!u) {
        var k = t({ direction: a ? "in" : "out" });
        s = ht(e, k, r, n, i);
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
      abort: Ee,
      deactivate: Ee,
      reset: Ee,
      t: () => n
    };
  const { delay: f = 0, css: o, tick: l, easing: c = Hn } = t;
  var d = [];
  if (a && r === void 0 && (l && l(0, 1), o)) {
    var v = Ht(o(0, 1));
    d.push(v, v);
  }
  var _ = () => 1 - n, p = e.animate(d, { duration: f });
  return p.onfinish = () => {
    var k = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var h = n - k, E = (
      /** @type {number} */
      t.duration * Math.abs(h)
    ), w = [];
    if (E > 0) {
      if (o)
        for (var N = Math.ceil(E / 16.666666666666668), S = 0; S <= N; S += 1) {
          var $ = k + h * c(S / N), b = o($, 1 - $);
          w.push(Ht(b));
        }
      _ = () => {
        var y = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          p.currentTime
        );
        return k + h * c(y / E);
      }, l && Fn(() => {
        if (p.playState !== "running") return !1;
        var y = _();
        return l(y, 1 - y), !0;
      });
    }
    p = e.animate(w, { duration: E, fill: "forwards" }), p.onfinish = () => {
      _ = () => n, l == null || l(n, 1 - n), i();
    };
  }, {
    abort: () => {
      p && (p.cancel(), p.effect = null, p.onfinish = Ee);
    },
    deactivate: () => {
      i = Ee;
    },
    reset: () => {
      n === 0 && (l == null || l(1, 0));
    },
    t: () => _()
  };
}
function Yt(e, t) {
  return e === t || (e == null ? void 0 : e[Ye]) === t;
}
function Yn(e = {}, t, r, n) {
  return et(() => {
    var i, a;
    return tr(() => {
      i = a, a = [], it(() => {
        e !== r(...a) && (t(e, ...a), i && Yt(r(...i), e) && t(null, ...i));
      });
    }), () => {
      Tt(() => {
        a && Yt(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function Cr(e) {
  I === null && hn(), Qt(() => {
    const t = it(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Vn(e) {
  for (var t = g, r = g; t !== null && !(t.f & (W | Re)); )
    t = t.parent;
  try {
    return V(t), e();
  } finally {
    V(r);
  }
}
function ge(e, t, r, n) {
  var E;
  var i = !Xt, a = !1, s;
  s = /** @type {V} */
  e[t];
  var u = (E = ce(e, t)) == null ? void 0 : E.set, f = (
    /** @type {V} */
    n
  ), o = !0, l = !1, c = () => (l = !0, o && (o = !1, f = /** @type {V} */
  n), f);
  s === void 0 && n !== void 0 && (u && i && rn(), s = c(), u && u(s));
  var d;
  if (d = () => {
    var w = (
      /** @type {V} */
      e[t]
    );
    return w === void 0 ? c() : (o = !0, l = !1, w);
  }, u) {
    var v = e.$$legacy;
    return function(w, N) {
      return arguments.length > 0 ? ((!N || v || a) && u(N ? d() : w), w) : d();
    };
  }
  var _ = !1, p = !1, k = /* @__PURE__ */ kt(s), h = Vn(
    () => /* @__PURE__ */ fn(() => {
      var w = d(), N = m(k);
      return _ ? (_ = !1, p = !0, N) : (p = !1, k.v = w);
    })
  );
  return function(w, N) {
    if (arguments.length > 0) {
      const S = N ? m(h) : w;
      return h.equals(S) || (_ = !0, A(k, S), l && f !== void 0 && (f = S), it(() => m(h))), w;
    }
    return m(h);
  };
}
function Un(e) {
  return new Bn(e);
}
var G, H;
class Bn {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    st(this, G);
    /** @type {Record<string, any>} */
    st(this, H);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, u) => {
      var f = /* @__PURE__ */ kt(u);
      return r.set(s, f), f;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, u) {
          return m(r.get(u) ?? n(u, Reflect.get(s, u)));
        },
        has(s, u) {
          return m(r.get(u) ?? n(u, Reflect.get(s, u))), Reflect.has(s, u);
        },
        set(s, u, f) {
          return A(r.get(u) ?? n(u, f), f), Reflect.set(s, u, f);
        }
      }
    );
    lt(this, H, (t.hydrate ? An : mr)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && re(), lt(this, G, i.$$events);
    for (const s of Object.keys(R(this, H)))
      s === "$set" || s === "$destroy" || s === "$on" || je(this, s, {
        get() {
          return R(this, H)[s];
        },
        /** @param {any} value */
        set(u) {
          R(this, H)[s] = u;
        },
        enumerable: !0
      });
    R(this, H).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, R(this, H).$destroy = () => {
      On(R(this, H));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    R(this, H).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    R(this, G)[t] = R(this, G)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return R(this, G)[t].push(n), () => {
      R(this, G)[t] = R(this, G)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    R(this, H).$destroy();
  }
}
G = new WeakMap(), H = new WeakMap();
let Nr;
typeof HTMLElement == "function" && (Nr = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    P(this, "$$ctor");
    /** Slots */
    P(this, "$$s");
    /** @type {any} The Svelte component instance */
    P(this, "$$c");
    /** Whether or not the custom element is connected */
    P(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    P(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    P(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    P(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    P(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    P(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    P(this, "$$me");
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
          i !== "default" && (s.name = i), fe(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = Wn(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = Be(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = Un({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = er(() => {
        tr(() => {
          var i;
          this.$$r = !0;
          for (const a of We(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = Be(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Be(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
    return We(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function Be(e, t, r, n) {
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
function Sr(e, t, r, n, i, a) {
  let s = class extends Nr {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return We(t).map(
        (u) => (t[u].attribute || u).toLowerCase()
      );
    }
  };
  return We(t).forEach((u) => {
    je(s.prototype, u, {
      get() {
        return this.$$c && u in this.$$c ? this.$$c[u] : this.$$d[u];
      },
      set(f) {
        var c;
        f = Be(u, f, t), this.$$d[u] = f;
        var o = this.$$c;
        if (o) {
          var l = (c = ce(o, u)) == null ? void 0 : c.get;
          l ? o[u] = f : o.$set({ [u]: f });
        }
      }
    });
  }), n.forEach((u) => {
    je(s.prototype, u, {
      get() {
        var f;
        return (f = this.$$c) == null ? void 0 : f[u];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let Je = Se(void 0);
const jn = async () => (A(Je, j(await window.loadCardHelpers().then((e) => e))), m(Je)), Kn = () => m(Je) ? m(Je) : jn();
function Xn(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Ar(e, { delay: t = 0, duration: r = 400, easing: n = Xn, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, u = i === "y" ? "height" : "width", f = parseFloat(a[u]), o = i === "y" ? ["top", "bottom"] : ["left", "right"], l = o.map(
    (h) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${h[0].toUpperCase()}${h.slice(1)}`
    )
  ), c = parseFloat(a[`padding${l[0]}`]), d = parseFloat(a[`padding${l[1]}`]), v = parseFloat(a[`margin${l[0]}`]), _ = parseFloat(a[`margin${l[1]}`]), p = parseFloat(
    a[`border${l[0]}Width`]
  ), k = parseFloat(
    a[`border${l[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (h) => `overflow: hidden;opacity: ${Math.min(h * 20, 1) * s};${u}: ${h * f}px;padding-${o[0]}: ${h * c}px;padding-${o[1]}: ${h * d}px;margin-${o[0]}: ${h * v}px;margin-${o[1]}: ${h * _}px;border-${o[0]}-width: ${h * p}px;border-${o[1]}-width: ${h * k}px;`
  };
}
var zn = /* @__PURE__ */ ke('<span class="loading svelte-1sdlsm">Loading...</span>'), Gn = /* @__PURE__ */ ke('<div class="outer-container"><!> <!></div>');
const Jn = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function pt(e, t) {
  Nt(t, !0), kr(e, Jn);
  const r = ge(t, "type", 7, "div"), n = ge(t, "config"), i = ge(t, "hass"), a = ge(t, "marginTop", 7, "0px");
  let s = Se(void 0), u = Se(!0);
  Qt(() => {
    m(s) && (m(s).hass = i());
  }), Cr(async () => {
    const d = (await Kn()).createCardElement(n());
    d.hass = i(), m(s) && (m(s).replaceWith(d), A(s, j(d)), A(u, !1));
  });
  var f = Gn(), o = le(f);
  Mn(o, r, !1, (c, d) => {
    Yn(c, (v) => A(s, j(v)), () => m(s)), Te(c, "svelte-1sdlsm"), Tr(3, c, () => Ar);
  });
  var l = Ue(o, 2);
  return _t(l, () => m(u), (c) => {
    var d = zn();
    fe(c, d);
  }), ee(f), xe(() => oe(f, "style", `margin-top: ${a() ?? ""};`)), fe(e, f), St({
    get type() {
      return r();
    },
    set type(c = "div") {
      r(c), re();
    },
    get config() {
      return n();
    },
    set config(c) {
      n(c), re();
    },
    get hass() {
      return i();
    },
    set hass(c) {
      i(c), re();
    },
    get marginTop() {
      return a();
    },
    set marginTop(c = "0px") {
      a(c), re();
    }
  });
}
customElements.define("expander-sub-card", Sr(
  pt,
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
const gt = {
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
var Qn = /* @__PURE__ */ ke('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), ei = /* @__PURE__ */ ke("<button><div> </div> <ha-icon></ha-icon></button>", 2), ti = /* @__PURE__ */ ke('<div class="children-container svelte-icqkke"></div>'), ri = /* @__PURE__ */ ke("<ha-card><!> <!></ha-card>", 2);
const ni = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function ii(e, t) {
  Nt(t, !0), kr(e, ni);
  const r = ge(t, "hass"), n = ge(t, "config", 7, gt);
  let i = Se(!1), a = Se(!1);
  const s = n()["storgage-id"], u = "expander-open-" + s;
  function f() {
    o(!m(a));
  }
  function o($) {
    if (A(a, j($)), s !== void 0)
      try {
        localStorage.setItem(u, m(a) ? "true" : "false");
      } catch (b) {
        console.error(b);
      }
  }
  Cr(() => {
    const $ = n()["min-width-expanded"], b = n()["max-width-expanded"], y = document.body.offsetWidth;
    if ($ && b ? n().expanded = y >= $ && y <= b : $ ? n().expanded = y >= $ : b && (n().expanded = y <= b), s !== void 0)
      try {
        const q = localStorage.getItem(u);
        q === null ? n().expanded !== void 0 && o(n().expanded) : A(a, j(q ? q === "true" : m(a)));
      } catch (q) {
        console.error(q);
      }
    else
      n().expanded !== void 0 && o(n().expanded);
  });
  const l = ($) => {
    if (m(i))
      return $.preventDefault(), $.stopImmediatePropagation(), A(i, !1), !1;
    f();
  }, c = ($) => {
    $.currentTarget.classList.contains("title-card-container") && l($);
  };
  let d, v = !1, _ = 0, p = 0;
  const k = ($) => {
    d = $.target, _ = $.touches[0].clientX, p = $.touches[0].clientY, v = !1;
  }, h = ($) => {
    const b = $.touches[0].clientX, y = $.touches[0].clientY;
    (Math.abs(b - _) > 10 || Math.abs(y - p) > 10) && (v = !0);
  }, E = ($) => {
    !v && d === $.target && n()["title-card-clickable"] && f(), d = void 0, A(i, !0);
  };
  var w = ri(), N = le(w);
  _t(
    N,
    () => n()["title-card"],
    ($) => {
      var b = Qn(), y = le(b);
      y.__touchstart = k, y.__touchmove = h, y.__touchend = E, y.__click = function(...Or) {
        var At;
        (At = n()["title-card-clickable"] ? c : null) == null || At.apply(this, Or);
      };
      var q = le(y);
      pt(q, {
        get hass() {
          return r();
        },
        get config() {
          return n()["title-card"];
        },
        get type() {
          return n()["title-card"].type;
        }
      }), ee(y);
      var U = Ue(y, 2);
      U.__click = l;
      var at = le(U);
      Q(at, "icon", "mdi:chevron-down"), ee(U), ee(b), xe(() => {
        Te(b, `${`title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}` ?? ""} svelte-icqkke`), oe(y, "style", `--title-padding:${n()["title-card-padding"] ?? ""}`), oe(y, "role", n()["title-card-clickable"] ? "button" : void 0), oe(U, "style", `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Te(U, `${`header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${m(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), Q(at, "style", `--arrow-color:${n()["arrow-color"] ?? ""}`), Q(at, "class", `${`ico${m(a) ? " flipped open" : "close"}` ?? ""} svelte-icqkke`);
      }), fe($, b);
    },
    ($) => {
      var b = ei();
      b.__click = l;
      var y = le(b), q = le(y, !0);
      ee(y);
      var U = Ue(y, 2);
      Q(U, "icon", "mdi:chevron-down"), ee(b), xe(() => {
        Te(b, `${`header${n()["expander-card-background-expanded"] ? "" : " ripple"}${m(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), oe(b, "style", `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Te(y, `${`primary title${m(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), Sn(q, n().title), Q(U, "style", `--arrow-color:${n()["arrow-color"] ?? ""}`), Q(U, "class", `${`ico${m(a) ? " flipped open" : " close"}` ?? ""} svelte-icqkke`);
      }), fe($, b);
    }
  );
  var S = Ue(N, 2);
  return _t(S, () => n().cards, ($) => {
    var b = ti();
    Rn(b, 20, () => n().cards, (y) => y, (y, q) => {
      pt(y, {
        get hass() {
          return r();
        },
        get config() {
          return q;
        },
        get type() {
          return q.type;
        },
        get marginTop() {
          return n()["child-margin-top"];
        }
      });
    }), ee(b), xe(() => oe(b, "style", `--expander-card-display:${(m(a) ? n()["expander-card-display"] : "none") ?? ""};
             --gap:${(m(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), Tr(3, b, () => Ar, () => ({ duration: 500, easing: Zn })), fe($, b);
  }), ee(w), xe(() => {
    Q(w, "class", `${`expander-card${n().clear ? " clear" : ""}${m(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), Q(w, "style", `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(m(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${m(a) ?? ""};
     --card-background:${(m(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
  }), fe(e, w), St({
    get hass() {
      return r();
    },
    set hass($) {
      r($), re();
    },
    get config() {
      return n();
    },
    set config($ = gt) {
      n($), re();
    }
  });
}
xn([
  "touchstart",
  "touchmove",
  "touchend",
  "click"
]);
customElements.define("expander-card", Sr(ii, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    P(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...gt, ...r };
  }
}));
const ai = "2.3.1";
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
