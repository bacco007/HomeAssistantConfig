var Un = Object.defineProperty;
var Dt = (e) => {
  throw TypeError(e);
};
var Yn = (e, t, n) => t in e ? Un(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var j = (e, t, n) => Yn(e, typeof t != "symbol" ? t + "" : t, n), Mt = (e, t, n) => t.has(e) || Dt("Cannot " + n);
var R = (e, t, n) => (Mt(e, t, "read from private field"), n ? n.call(e) : t.get(e)), ct = (e, t, n) => t.has(e) ? Dt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), dt = (e, t, n, i) => (Mt(e, t, "write to private field"), i ? i.call(e, n) : t.set(e, n), n);
const Vn = "5";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(Vn);
const Wn = 1, Kn = 2, zn = 16, Gn = 1, Xn = 2, Jn = 4, Zn = 8, Qn = 16, er = 4, tr = 1, nr = 2, Qt = "[", xt = "[!", Tt = "]", qe = {}, I = Symbol(), rr = "http://www.w3.org/2000/svg", en = !1;
function At(e) {
  console.warn("hydration_mismatch");
}
var Nt = Array.isArray, Ct = Array.from, ze = Object.keys, Ge = Object.defineProperty, fe = Object.getOwnPropertyDescriptor, tn = Object.getOwnPropertyDescriptors, ir = Object.prototype, sr = Array.prototype, Xe = Object.getPrototypeOf;
function ar(e) {
  return typeof e == "function";
}
const Ne = () => {
};
function lr(e) {
  return e();
}
function ht(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const X = 2, nn = 4, De = 8, it = 16, U = 32, Me = 64, de = 128, Je = 256, P = 512, re = 1024, Fe = 2048, G = 4096, xe = 8192, rn = 16384, He = 32768, or = 65536, fr = 1 << 18, sn = 1 << 19, $e = Symbol("$state"), ur = Symbol("");
function an(e) {
  return e === this.v;
}
function ln(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function St(e) {
  return !ln(e, this.v);
}
function cr(e) {
  throw new Error("effect_in_teardown");
}
function dr() {
  throw new Error("effect_in_unowned_derived");
}
function vr(e) {
  throw new Error("effect_orphan");
}
function hr() {
  throw new Error("effect_update_depth_exceeded");
}
function _r() {
  throw new Error("hydration_failed");
}
function pr(e) {
  throw new Error("props_invalid_value");
}
function gr() {
  throw new Error("state_descriptors_fixed");
}
function $r() {
  throw new Error("state_prototype_fixed");
}
function yr() {
  throw new Error("state_unsafe_local_read");
}
function wr() {
  throw new Error("state_unsafe_mutation");
}
function D(e) {
  return {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: an,
    version: 0
  };
}
function _t(e) {
  return /* @__PURE__ */ on(D(e));
}
// @__NO_SIDE_EFFECTS__
function st(e, t = !1) {
  var i;
  const n = D(e);
  return t || (n.equals = St), N !== null && N.l !== null && ((i = N.l).s ?? (i.s = [])).push(n), n;
}
function Ft(e, t = !1) {
  return /* @__PURE__ */ on(/* @__PURE__ */ st(e, t));
}
// @__NO_SIDE_EFFECTS__
function on(e) {
  return E !== null && E.f & X && (Y === null ? Cr([e]) : Y.push(e)), e;
}
function C(e, t) {
  return E !== null && Pt() && E.f & (X | it) && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (Y === null || !Y.includes(e)) && wr(), fn(e, t);
}
function fn(e, t) {
  return e.equals(t) || (e.v = t, e.version = xn(), un(e, re), Pt() && m !== null && m.f & P && !(m.f & U) && (O !== null && O.includes(e) ? (W(m, re), ut(m)) : ne === null ? Sr([e]) : ne.push(e))), t;
}
function un(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var i = Pt(), s = n.length, r = 0; r < s; r++) {
      var a = n[r], o = a.f;
      o & re || !i && a === m || (W(a, t), o & (P | de) && (o & X ? un(
        /** @type {Derived} */
        a,
        Fe
      ) : ut(
        /** @type {Effect} */
        a
      )));
    }
}
// @__NO_SIDE_EFFECTS__
function Ze(e) {
  var t = X | re;
  m === null ? t |= de : m.f |= sn;
  const n = {
    children: null,
    ctx: N,
    deps: null,
    equals: an,
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
  if (E !== null && E.f & X) {
    var i = (
      /** @type {Derived} */
      E
    );
    (i.children ?? (i.children = [])).push(n);
  }
  return n;
}
// @__NO_SIDE_EFFECTS__
function mr(e) {
  const t = /* @__PURE__ */ Ze(e);
  return t.equals = St, t;
}
function cn(e) {
  var t = e.children;
  if (t !== null) {
    e.children = null;
    for (var n = 0; n < t.length; n += 1) {
      var i = t[n];
      i.f & X ? Ot(
        /** @type {Derived} */
        i
      ) : ie(
        /** @type {Effect} */
        i
      );
    }
  }
}
function dn(e) {
  var t, n = m;
  H(e.parent);
  try {
    cn(e), t = Tn(e);
  } finally {
    H(n);
  }
  return t;
}
function vn(e) {
  var t = dn(e), n = (_e || e.f & de) && e.deps !== null ? Fe : P;
  W(e, n), e.equals(t) || (e.v = t, e.version = xn());
}
function Ot(e) {
  cn(e), Le(e, 0), W(e, xe), e.v = e.children = e.deps = e.ctx = e.reactions = null;
}
function hn(e) {
  m === null && E === null && vr(), E !== null && E.f & de && dr(), Rt && cr();
}
function br(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Te(e, t, n, i = !0) {
  var s = (e & Me) !== 0, r = m, a = {
    ctx: N,
    deps: null,
    deriveds: null,
    nodes_start: null,
    nodes_end: null,
    f: e | re,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: s ? null : r,
    prev: null,
    teardown: null,
    transitions: null,
    version: 0
  };
  if (n) {
    var o = ye;
    try {
      Ht(!0), ft(a), a.f |= rn;
    } catch (u) {
      throw ie(a), u;
    } finally {
      Ht(o);
    }
  } else t !== null && ut(a);
  var c = n && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & sn) === 0;
  if (!c && !s && i && (r !== null && br(a, r), E !== null && E.f & X)) {
    var l = (
      /** @type {Derived} */
      E
    );
    (l.children ?? (l.children = [])).push(a);
  }
  return a;
}
function kr(e) {
  const t = Te(De, null, !1);
  return W(t, P), t.teardown = e, t;
}
function Qe(e) {
  hn();
  var t = m !== null && (m.f & U) !== 0 && N !== null && !N.m;
  if (t) {
    var n = (
      /** @type {ComponentContext} */
      N
    );
    (n.e ?? (n.e = [])).push({
      fn: e,
      effect: m,
      reaction: E
    });
  } else {
    var i = je(e);
    return i;
  }
}
function Er(e) {
  return hn(), at(e);
}
function _n(e) {
  const t = Te(Me, e, !0);
  return () => {
    ie(t);
  };
}
function je(e) {
  return Te(nn, e, !1);
}
function at(e) {
  return Te(De, e, !0);
}
function Ce(e) {
  return lt(e);
}
function lt(e, t = 0) {
  return Te(De | it | t, e, !0);
}
function be(e, t = !0) {
  return Te(De | U, e, !0, t);
}
function pn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Rt, i = E;
    jt(!0), V(null);
    try {
      t.call(null);
    } finally {
      jt(n), V(i);
    }
  }
}
function gn(e) {
  var t = e.deriveds;
  if (t !== null) {
    e.deriveds = null;
    for (var n = 0; n < t.length; n += 1)
      Ot(t[n]);
  }
}
function $n(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    var i = n.next;
    ie(n, t), n = i;
  }
}
function xr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    t.f & U || ie(t), t = n;
  }
}
function ie(e, t = !0) {
  var n = !1;
  if ((t || e.f & fr) && e.nodes_start !== null) {
    for (var i = e.nodes_start, s = e.nodes_end; i !== null; ) {
      var r = i === s ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ve(i)
      );
      i.remove(), i = r;
    }
    n = !0;
  }
  gn(e), $n(e, t && !n), Le(e, 0), W(e, xe);
  var a = e.transitions;
  if (a !== null)
    for (const c of a)
      c.stop();
  pn(e);
  var o = e.parent;
  o !== null && o.first !== null && yn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.parent = e.fn = e.nodes_start = e.nodes_end = null;
}
function yn(e) {
  var t = e.parent, n = e.prev, i = e.next;
  n !== null && (n.next = i), i !== null && (i.prev = n), t !== null && (t.first === e && (t.first = i), t.last === e && (t.last = n));
}
function et(e, t) {
  var n = [];
  qt(e, n, !0), wn(n, () => {
    ie(e), t && t();
  });
}
function wn(e, t) {
  var n = e.length;
  if (n > 0) {
    var i = () => --n || t();
    for (var s of e)
      s.out(i);
  } else
    t();
}
function qt(e, t, n) {
  if (!(e.f & G)) {
    if (e.f ^= G, e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || n) && t.push(a);
    for (var i = e.first; i !== null; ) {
      var s = i.next, r = (i.f & He) !== 0 || (i.f & U) !== 0;
      qt(i, t, r ? n : !1), i = s;
    }
  }
}
function Pe(e) {
  mn(e, !0);
}
function mn(e, t) {
  if (e.f & G) {
    e.f ^= G, Be(e) && ft(e);
    for (var n = e.first; n !== null; ) {
      var i = n.next, s = (n.f & He) !== 0 || (n.f & U) !== 0;
      mn(n, s ? t : !1), n = i;
    }
    if (e.transitions !== null)
      for (const r of e.transitions)
        (r.is_global || t) && r.in();
  }
}
let tt = !1, pt = [];
function bn() {
  tt = !1;
  const e = pt.slice();
  pt = [], ht(e);
}
function ot(e) {
  tt || (tt = !0, queueMicrotask(bn)), pt.push(e);
}
function Tr() {
  tt && bn();
}
function Ar(e) {
  throw new Error("lifecycle_outside_component");
}
const kn = 0, Nr = 1;
let Ve = kn, Ie = !1, ye = !1, Rt = !1;
function Ht(e) {
  ye = e;
}
function jt(e) {
  Rt = e;
}
let le = [], we = 0;
let E = null;
function V(e) {
  E = e;
}
let m = null;
function H(e) {
  m = e;
}
let Y = null;
function Cr(e) {
  Y = e;
}
let O = null, L = 0, ne = null;
function Sr(e) {
  ne = e;
}
let En = 0, _e = !1, N = null;
function xn() {
  return ++En;
}
function Pt() {
  return N !== null && N.l === null;
}
function Be(e) {
  var a, o;
  var t = e.f;
  if (t & re)
    return !0;
  if (t & Fe) {
    var n = e.deps, i = (t & de) !== 0;
    if (n !== null) {
      var s;
      if (t & Je) {
        for (s = 0; s < n.length; s++)
          ((a = n[s]).reactions ?? (a.reactions = [])).push(e);
        e.f ^= Je;
      }
      for (s = 0; s < n.length; s++) {
        var r = n[s];
        if (Be(
          /** @type {Derived} */
          r
        ) && vn(
          /** @type {Derived} */
          r
        ), i && m !== null && !_e && !((o = r == null ? void 0 : r.reactions) != null && o.includes(e)) && (r.reactions ?? (r.reactions = [])).push(e), r.version > e.version)
          return !0;
      }
    }
    i || W(e, P);
  }
  return !1;
}
function Or(e, t, n) {
  throw e;
}
function Tn(e) {
  var d;
  var t = O, n = L, i = ne, s = E, r = _e, a = Y, o = N, c = e.f;
  O = /** @type {null | Value[]} */
  null, L = 0, ne = null, E = c & (U | Me) ? null : e, _e = !ye && (c & de) !== 0, Y = null, N = e.ctx;
  try {
    var l = (
      /** @type {Function} */
      (0, e.fn)()
    ), u = e.deps;
    if (O !== null) {
      var f;
      if (Le(e, L), u !== null && L > 0)
        for (u.length = L + O.length, f = 0; f < O.length; f++)
          u[L + f] = O[f];
      else
        e.deps = u = O;
      if (!_e)
        for (f = L; f < u.length; f++)
          ((d = u[f]).reactions ?? (d.reactions = [])).push(e);
    } else u !== null && L < u.length && (Le(e, L), u.length = L);
    return l;
  } finally {
    O = t, L = n, ne = i, E = s, _e = r, Y = a, N = o;
  }
}
function qr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var i = n.indexOf(e);
    if (i !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[i] = n[s], n.pop());
    }
  }
  n === null && t.f & X && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (O === null || !O.includes(t)) && (W(t, Fe), t.f & (de | Je) || (t.f ^= Je), Le(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Le(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var i = t; i < n.length; i++)
      qr(e, n[i]);
}
function ft(e) {
  var t = e.f;
  if (!(t & xe)) {
    W(e, P);
    var n = m;
    m = e;
    try {
      gn(e), t & it ? xr(e) : $n(e), pn(e);
      var i = Tn(e);
      e.teardown = typeof i == "function" ? i : null, e.version = En;
    } catch (s) {
      Or(
        /** @type {Error} */
        s
      );
    } finally {
      m = n;
    }
  }
}
function An() {
  we > 1e3 && (we = 0, hr()), we++;
}
function Nn(e) {
  var t = e.length;
  if (t !== 0) {
    An();
    var n = ye;
    ye = !0;
    try {
      for (var i = 0; i < t; i++) {
        var s = e[i];
        s.f & P || (s.f ^= P);
        var r = [];
        Cn(s, r), Rr(r);
      }
    } finally {
      ye = n;
    }
  }
}
function Rr(e) {
  var t = e.length;
  if (t !== 0)
    for (var n = 0; n < t; n++) {
      var i = e[n];
      !(i.f & (xe | G)) && Be(i) && (ft(i), i.deps === null && i.first === null && i.nodes_start === null && (i.teardown === null ? yn(i) : i.fn = null));
    }
}
function Pr() {
  if (Ie = !1, we > 1001)
    return;
  const e = le;
  le = [], Nn(e), Ie || (we = 0);
}
function ut(e) {
  Ve === kn && (Ie || (Ie = !0, queueMicrotask(Pr)));
  for (var t = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (n & (Me | U)) {
      if (!(n & P)) return;
      t.f ^= P;
    }
  }
  le.push(t);
}
function Cn(e, t) {
  var n = e.first, i = [];
  e: for (; n !== null; ) {
    var s = n.f, r = (s & U) !== 0, a = r && (s & P) !== 0;
    if (!a && !(s & G))
      if (s & De) {
        r ? n.f ^= P : Be(n) && ft(n);
        var o = n.first;
        if (o !== null) {
          n = o;
          continue;
        }
      } else s & nn && i.push(n);
    var c = n.next;
    if (c === null) {
      let f = n.parent;
      for (; f !== null; ) {
        if (e === f)
          break e;
        var l = f.next;
        if (l !== null) {
          n = l;
          continue e;
        }
        f = f.parent;
      }
    }
    n = c;
  }
  for (var u = 0; u < i.length; u++)
    o = i[u], t.push(o), Cn(o, t);
}
function ee(e) {
  var t = Ve, n = le;
  try {
    An();
    const s = [];
    Ve = Nr, le = s, Ie = !1, Nn(n);
    var i = e == null ? void 0 : e();
    return Tr(), (le.length > 0 || s.length > 0) && ee(), we = 0, i;
  } finally {
    Ve = t, le = n;
  }
}
function w(e) {
  var o;
  var t = e.f, n = (t & X) !== 0;
  if (n && t & xe) {
    var i = dn(
      /** @type {Derived} */
      e
    );
    return Ot(
      /** @type {Derived} */
      e
    ), i;
  }
  if (E !== null) {
    Y !== null && Y.includes(e) && yr();
    var s = E.deps;
    O === null && s !== null && s[L] === e ? L++ : O === null ? O = [e] : O.push(e), ne !== null && m !== null && m.f & P && !(m.f & U) && ne.includes(e) && (W(m, re), ut(m));
  } else if (n && /** @type {Derived} */
  e.deps === null) {
    var r = (
      /** @type {Derived} */
      e
    ), a = r.parent;
    a !== null && !((o = a.deriveds) != null && o.includes(r)) && (a.deriveds ?? (a.deriveds = [])).push(r);
  }
  return n && (r = /** @type {Derived} */
  e, Be(r) && vn(r)), e.v;
}
function ue(e) {
  const t = E;
  try {
    return E = null, e();
  } finally {
    E = t;
  }
}
const Ir = ~(re | Fe | P);
function W(e, t) {
  e.f = e.f & Ir | t;
}
function It(e, t = !1, n) {
  N = {
    p: N,
    c: null,
    e: null,
    m: !1,
    s: e,
    x: null,
    l: null
  }, t || (N.l = {
    s: null,
    u: null,
    r1: [],
    r2: D(!1)
  });
}
function Lt(e) {
  const t = N;
  if (t !== null) {
    e !== void 0 && (t.x = e);
    const a = t.e;
    if (a !== null) {
      var n = m, i = E;
      t.e = null;
      try {
        for (var s = 0; s < a.length; s++) {
          var r = a[s];
          H(r.effect), V(r.reaction), je(r.fn);
        }
      } finally {
        H(n), V(i);
      }
    }
    N = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
function Sn(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if ($e in e)
      gt(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && $e in n && gt(n);
      }
  }
}
function gt(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let i in e)
      try {
        gt(e[i], t);
      } catch {
      }
    const n = Xe(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const i = tn(n);
      for (let s in i) {
        const r = i[s].get;
        if (r)
          try {
            r.call(e);
          } catch {
          }
      }
    }
  }
}
function z(e, t = null, n) {
  if (typeof e != "object" || e === null || $e in e)
    return e;
  const i = Xe(e);
  if (i !== ir && i !== sr)
    return e;
  var s = /* @__PURE__ */ new Map(), r = Nt(e), a = D(0);
  r && s.set("length", D(
    /** @type {any[]} */
    e.length
  ));
  var o;
  return new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && gr();
        var f = s.get(l);
        return f === void 0 ? (f = D(u.value), s.set(l, f)) : C(f, z(u.value, o)), !0;
      },
      deleteProperty(c, l) {
        var u = s.get(l);
        if (u === void 0)
          l in c && s.set(l, D(I));
        else {
          if (r && typeof l == "string") {
            var f = (
              /** @type {Source<number>} */
              s.get("length")
            ), d = Number(l);
            Number.isInteger(d) && d < f.v && C(f, d);
          }
          C(u, I), Bt(a);
        }
        return !0;
      },
      get(c, l, u) {
        var h;
        if (l === $e)
          return e;
        var f = s.get(l), d = l in c;
        if (f === void 0 && (!d || (h = fe(c, l)) != null && h.writable) && (f = D(z(d ? c[l] : I, o)), s.set(l, f)), f !== void 0) {
          var v = w(f);
          return v === I ? void 0 : v;
        }
        return Reflect.get(c, l, u);
      },
      getOwnPropertyDescriptor(c, l) {
        var u = Reflect.getOwnPropertyDescriptor(c, l);
        if (u && "value" in u) {
          var f = s.get(l);
          f && (u.value = w(f));
        } else if (u === void 0) {
          var d = s.get(l), v = d == null ? void 0 : d.v;
          if (d !== void 0 && v !== I)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return u;
      },
      has(c, l) {
        var v;
        if (l === $e)
          return !0;
        var u = s.get(l), f = u !== void 0 && u.v !== I || Reflect.has(c, l);
        if (u !== void 0 || m !== null && (!f || (v = fe(c, l)) != null && v.writable)) {
          u === void 0 && (u = D(f ? z(c[l], o) : I), s.set(l, u));
          var d = w(u);
          if (d === I)
            return !1;
        }
        return f;
      },
      set(c, l, u, f) {
        var $;
        var d = s.get(l), v = l in c;
        if (r && l === "length")
          for (var h = u; h < /** @type {Source<number>} */
          d.v; h += 1) {
            var _ = s.get(h + "");
            _ !== void 0 ? C(_, I) : h in c && (_ = D(I), s.set(h + "", _));
          }
        d === void 0 ? (!v || ($ = fe(c, l)) != null && $.writable) && (d = D(void 0), C(d, z(u, o)), s.set(l, d)) : (v = d.v !== I, C(d, z(u, o)));
        var p = Reflect.getOwnPropertyDescriptor(c, l);
        if (p != null && p.set && p.set.call(f, u), !v) {
          if (r && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              s.get("length")
            ), g = Number(l);
            Number.isInteger(g) && g >= b.v && C(b, g + 1);
          }
          Bt(a);
        }
        return !0;
      },
      ownKeys(c) {
        w(a);
        var l = Reflect.ownKeys(c).filter((d) => {
          var v = s.get(d);
          return v === void 0 || v.v !== I;
        });
        for (var [u, f] of s)
          f.v !== I && !(u in c) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        $r();
      }
    }
  );
}
function Bt(e, t = 1) {
  C(e, e.v + t);
}
var Ut, On, qn;
function $t() {
  if (Ut === void 0) {
    Ut = window;
    var e = Element.prototype, t = Node.prototype;
    On = fe(t, "firstChild").get, qn = fe(t, "nextSibling").get, e.__click = void 0, e.__className = "", e.__attributes = null, e.__styles = null, e.__e = void 0, Text.prototype.__t = void 0;
  }
}
function ke(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ce(e) {
  return On.call(e);
}
// @__NO_SIDE_EFFECTS__
function ve(e) {
  return qn.call(e);
}
function ae(e, t) {
  if (!k)
    return /* @__PURE__ */ ce(e);
  var n = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ ce(A)
  );
  if (n === null)
    n = A.appendChild(ke());
  else if (t && n.nodeType !== 3) {
    var i = ke();
    return n == null || n.before(i), M(i), i;
  }
  return M(n), n;
}
function We(e, t = 1, n = !1) {
  let i = k ? A : e;
  for (; t--; )
    i = /** @type {TemplateNode} */
    /* @__PURE__ */ ve(i);
  if (!k)
    return i;
  var s = i.nodeType;
  if (n && s !== 3) {
    var r = ke();
    return i == null || i.before(r), M(r), r;
  }
  return M(i), /** @type {TemplateNode} */
  i;
}
function Rn(e) {
  e.textContent = "";
}
let k = !1;
function B(e) {
  k = e;
}
let A;
function M(e) {
  if (e === null)
    throw At(), qe;
  return A = e;
}
function Ee() {
  return M(
    /** @type {TemplateNode} */
    /* @__PURE__ */ ve(A)
  );
}
function Z(e) {
  if (k) {
    if (/* @__PURE__ */ ve(A) !== null)
      throw At(), qe;
    A = e;
  }
}
function yt() {
  for (var e = 0, t = A; ; ) {
    if (t.nodeType === 8) {
      var n = (
        /** @type {Comment} */
        t.data
      );
      if (n === Tt) {
        if (e === 0) return t;
        e -= 1;
      } else (n === Qt || n === xt) && (e += 1);
    }
    var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ve(t)
    );
    t.remove(), t = i;
  }
}
const Lr = /* @__PURE__ */ new Set(), Yt = /* @__PURE__ */ new Set();
function Dr(e, t, n, i) {
  function s(r) {
    if (i.capture || Se.call(t, r), !r.cancelBubble) {
      var a = E, o = m;
      V(null), H(null);
      try {
        return n.call(this, r);
      } finally {
        V(a), H(o);
      }
    }
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ot(() => {
    t.addEventListener(e, s, i);
  }) : t.addEventListener(e, s, i), s;
}
function vt(e, t, n, i, s) {
  var r = { capture: i, passive: s }, a = Dr(e, t, n, r);
  (t === document.body || t === window || t === document) && kr(() => {
    t.removeEventListener(e, a, r);
  });
}
function Se(e) {
  var g;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), i = e.type, s = ((g = e.composedPath) == null ? void 0 : g.call(e)) || [], r = (
    /** @type {null | Element} */
    s[0] || e.target
  ), a = 0, o = e.__root;
  if (o) {
    var c = s.indexOf(o);
    if (c !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var l = s.indexOf(t);
    if (l === -1)
      return;
    c <= l && (a = c);
  }
  if (r = /** @type {Element} */
  s[a] || e.target, r !== t) {
    Ge(e, "currentTarget", {
      configurable: !0,
      get() {
        return r || n;
      }
    });
    var u = E, f = m;
    V(null), H(null);
    try {
      for (var d, v = []; r !== null; ) {
        var h = r.assignedSlot || r.parentNode || /** @type {any} */
        r.host || null;
        try {
          var _ = r["__" + i];
          if (_ !== void 0 && !/** @type {any} */
          r.disabled)
            if (Nt(_)) {
              var [p, ...b] = _;
              p.apply(r, [e, ...b]);
            } else
              _.call(r, e);
        } catch ($) {
          d ? v.push($) : d = $;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        r = h;
      }
      if (d) {
        for (let $ of v)
          queueMicrotask(() => {
            throw $;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, V(u), H(f);
    }
  }
}
function Mr(e) {
  var t = document.createElement("template");
  return t.innerHTML = e, t.content;
}
function Re(e, t) {
  var n = (
    /** @type {Effect} */
    m
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Ae(e, t) {
  var n = (t & tr) !== 0, i = (t & nr) !== 0, s, r = !e.startsWith("<!>");
  return () => {
    if (k)
      return Re(A, null), A;
    s === void 0 && (s = Mr(r ? e : "<!>" + e), n || (s = /** @type {Node} */
    /* @__PURE__ */ ce(s)));
    var a = (
      /** @type {TemplateNode} */
      i ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ce(a)
      ), c = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      Re(o, c);
    } else
      Re(a, a);
    return a;
  };
}
function oe(e, t) {
  if (k) {
    m.nodes_end = A, Ee();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Fr = ["touchstart", "touchmove"];
function Hr(e) {
  return Fr.includes(e);
}
let nt = !0;
function Vt(e) {
  nt = e;
}
function jr(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n == null ? "" : n + "");
}
function Pn(e, t) {
  return In(e, t);
}
function Br(e, t) {
  $t(), t.intro = t.intro ?? !1;
  const n = t.target, i = k, s = A;
  try {
    for (var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ce(n)
    ); r && (r.nodeType !== 8 || /** @type {Comment} */
    r.data !== Qt); )
      r = /** @type {TemplateNode} */
      /* @__PURE__ */ ve(r);
    if (!r)
      throw qe;
    B(!0), M(
      /** @type {Comment} */
      r
    ), Ee();
    const a = In(e, { ...t, anchor: r });
    if (A === null || A.nodeType !== 8 || /** @type {Comment} */
    A.data !== Tt)
      throw At(), qe;
    return B(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a === qe)
      return t.recover === !1 && _r(), $t(), Rn(n), B(!1), Pn(e, t);
    throw a;
  } finally {
    B(i), M(s);
  }
}
const he = /* @__PURE__ */ new Map();
function In(e, { target: t, anchor: n, props: i = {}, events: s, context: r, intro: a = !0 }) {
  $t();
  var o = /* @__PURE__ */ new Set(), c = (f) => {
    for (var d = 0; d < f.length; d++) {
      var v = f[d];
      if (!o.has(v)) {
        o.add(v);
        var h = Hr(v);
        t.addEventListener(v, Se, { passive: h });
        var _ = he.get(v);
        _ === void 0 ? (document.addEventListener(v, Se, { passive: h }), he.set(v, 1)) : he.set(v, _ + 1);
      }
    }
  };
  c(Ct(Lr)), Yt.add(c);
  var l = void 0, u = _n(() => {
    var f = n ?? t.appendChild(ke());
    return be(() => {
      if (r) {
        It({});
        var d = (
          /** @type {ComponentContext} */
          N
        );
        d.c = r;
      }
      s && (i.$$events = s), k && Re(
        /** @type {TemplateNode} */
        f,
        null
      ), nt = a, l = e(f, i) || {}, nt = !0, k && (m.nodes_end = A), r && Lt();
    }), () => {
      var h;
      for (var d of o) {
        t.removeEventListener(d, Se);
        var v = (
          /** @type {number} */
          he.get(d)
        );
        --v === 0 ? (document.removeEventListener(d, Se), he.delete(d)) : he.set(d, v);
      }
      Yt.delete(c), wt.delete(l), f !== n && ((h = f.parentNode) == null || h.removeChild(f));
    };
  });
  return wt.set(l, u), l;
}
let wt = /* @__PURE__ */ new WeakMap();
function Ur(e) {
  const t = wt.get(e);
  t && t();
}
function mt(e, t, n, i = null, s = !1) {
  k && Ee();
  var r = e, a = null, o = null, c = null, l = s ? He : 0;
  lt(() => {
    if (c === (c = !!t())) return;
    let u = !1;
    if (k) {
      const f = (
        /** @type {Comment} */
        r.data === xt
      );
      c === f && (r = yt(), M(r), B(!1), u = !0);
    }
    c ? (a ? Pe(a) : a = be(() => n(r)), o && et(o, () => {
      o = null;
    })) : (o ? Pe(o) : i && (o = be(() => i(r))), a && et(a, () => {
      a = null;
    })), u && B(!0);
  }, l), k && (r = A);
}
let me = null;
function Wt(e) {
  me = e;
}
function Yr(e, t, n, i) {
  for (var s = [], r = t.length, a = 0; a < r; a++)
    qt(t[a].e, s, !0);
  var o = r > 0 && s.length === 0 && n !== null;
  if (o) {
    var c = (
      /** @type {Element} */
      /** @type {Element} */
      n.parentNode
    );
    Rn(c), c.append(
      /** @type {Element} */
      n
    ), i.clear(), Q(e, t[0].prev, t[r - 1].next);
  }
  wn(s, () => {
    for (var l = 0; l < r; l++) {
      var u = t[l];
      o || (i.delete(u.k), Q(e, u.prev, u.next)), ie(u.e, !o);
    }
  });
}
function Vr(e, t, n, i, s, r = null) {
  var a = e, o = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var c = (
      /** @type {Element} */
      e
    );
    a = k ? M(
      /** @type {Comment | Text} */
      /* @__PURE__ */ ce(c)
    ) : c.appendChild(ke());
  }
  k && Ee();
  var l = null, u = !1;
  lt(() => {
    var f = n(), d = Nt(f) ? f : f == null ? [] : Ct(f), v = d.length;
    if (u && v === 0)
      return;
    u = v === 0;
    let h = !1;
    if (k) {
      var _ = (
        /** @type {Comment} */
        a.data === xt
      );
      _ !== (v === 0) && (a = yt(), M(a), B(!1), h = !0);
    }
    if (k) {
      for (var p = null, b, g = 0; g < v; g++) {
        if (A.nodeType === 8 && /** @type {Comment} */
        A.data === Tt) {
          a = /** @type {Comment} */
          A, h = !0, B(!1);
          break;
        }
        var $ = d[g], y = i($, g);
        b = Ln(A, o, p, null, $, y, g, s, t), o.items.set(y, b), p = b;
      }
      v > 0 && M(yt());
    }
    k || Wr(d, o, a, s, t, i), r !== null && (v === 0 ? l ? Pe(l) : l = be(() => r(a)) : l !== null && et(l, () => {
      l = null;
    })), h && B(!0), n();
  }), k && (a = A);
}
function Wr(e, t, n, i, s, r) {
  var a = e.length, o = t.items, c = t.first, l = c, u, f = null, d = [], v = [], h, _, p, b;
  for (b = 0; b < a; b += 1) {
    if (h = e[b], _ = r(h, b), p = o.get(_), p === void 0) {
      var g = l ? (
        /** @type {TemplateNode} */
        l.e.nodes_start
      ) : n;
      f = Ln(
        g,
        t,
        f,
        f === null ? t.first : f.next,
        h,
        _,
        b,
        i,
        s
      ), o.set(_, f), d = [], v = [], l = f.next;
      continue;
    }
    if (Kr(p, h, b), p.e.f & G && Pe(p.e), p !== l) {
      if (u !== void 0 && u.has(p)) {
        if (d.length < v.length) {
          var $ = v[0], y;
          f = $.prev;
          var T = d[0], S = d[d.length - 1];
          for (y = 0; y < d.length; y += 1)
            Kt(d[y], $, n);
          for (y = 0; y < v.length; y += 1)
            u.delete(v[y]);
          Q(t, T.prev, S.next), Q(t, f, T), Q(t, S, $), l = $, f = S, b -= 1, d = [], v = [];
        } else
          u.delete(p), Kt(p, l, n), Q(t, p.prev, p.next), Q(t, p, f === null ? t.first : f.next), Q(t, f, p), f = p;
        continue;
      }
      for (d = [], v = []; l !== null && l.k !== _; )
        l.e.f & G || (u ?? (u = /* @__PURE__ */ new Set())).add(l), v.push(l), l = l.next;
      if (l === null)
        continue;
      p = l;
    }
    d.push(p), f = p, l = p.next;
  }
  if (l !== null || u !== void 0) {
    for (var x = u === void 0 ? [] : Ct(u); l !== null; )
      l.e.f & G || x.push(l), l = l.next;
    var q = x.length;
    if (q > 0) {
      var se = a === 0 ? n : null;
      Yr(t, x, se, o);
    }
  }
  m.first = t.first && t.first.e, m.last = f && f.e;
}
function Kr(e, t, n, i) {
  fn(e.v, t), e.i = n;
}
function Ln(e, t, n, i, s, r, a, o, c) {
  var l = me;
  try {
    var u = (c & Wn) !== 0, f = (c & zn) === 0, d = u ? f ? /* @__PURE__ */ st(s) : D(s) : s, v = c & Kn ? D(a) : a, h = {
      i: v,
      v: d,
      k: r,
      a: null,
      // @ts-expect-error
      e: null,
      prev: n,
      next: i
    };
    return me = h, h.e = be(() => o(e, d, v), k), h.e.prev = n && n.e, h.e.next = i && i.e, n === null ? t.first = h : (n.next = h, n.e.next = h.e), i !== null && (i.prev = h, i.e.prev = h.e), h;
  } finally {
    me = l;
  }
}
function Kt(e, t, n) {
  for (var i = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : n, s = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : n, r = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); r !== i; ) {
    var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ve(r)
    );
    s.before(r), r = a;
  }
}
function Q(e, t, n) {
  t === null ? e.first = n : (t.next = n, t.e.next = n && n.e), n !== null && (n.prev = t, n.e.prev = t && t.e);
}
function zr(e, t, n, i, s, r) {
  let a = k;
  k && Ee();
  var o, c, l = null;
  k && A.nodeType === 1 && (l = /** @type {Element} */
  A, Ee());
  var u = (
    /** @type {TemplateNode} */
    k ? A : e
  ), f, d = me;
  lt(() => {
    const v = t() || null;
    var h = v === "svg" ? rr : null;
    if (v !== o) {
      var _ = me;
      Wt(d), f && (v === null ? et(f, () => {
        f = null, c = null;
      }) : v === c ? Pe(f) : (ie(f), Vt(!1))), v && v !== c && (f = be(() => {
        if (l = k ? (
          /** @type {Element} */
          l
        ) : h ? document.createElementNS(h, v) : document.createElement(v), Re(l, l), i) {
          var p = (
            /** @type {TemplateNode} */
            k ? /* @__PURE__ */ ce(l) : l.appendChild(ke())
          );
          k && (p === null ? B(!1) : M(p)), i(l, p);
        }
        m.nodes_end = l, u.before(l);
      })), o = v, o && (c = o), Vt(!0), Wt(_);
    }
  }, He), a && (B(!0), M(u));
}
function Dn(e, t) {
  ot(() => {
    var n = e.getRootNode(), i = (
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
    if (!i.querySelector("#" + t.hash)) {
      const s = document.createElement("style");
      s.id = t.hash, s.textContent = t.code, i.appendChild(s);
    }
  });
}
function Gr(e, t, n) {
  je(() => {
    var i = ue(() => t(e, n == null ? void 0 : n()) || {});
    if (n && (i != null && i.update)) {
      var s = !1, r = (
        /** @type {any} */
        {}
      );
      at(() => {
        var a = n();
        Sn(a), s && ln(r, a) && (r = a, i.update(a));
      }), s = !0;
    }
    if (i != null && i.destroy)
      return () => (
        /** @type {Function} */
        i.destroy()
      );
  });
}
function pe(e, t, n, i) {
  var s = e.__attributes ?? (e.__attributes = {});
  k && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || s[t] !== (s[t] = n) && (t === "style" && "__styles" in e && (e.__styles = {}), t === "loading" && (e[ur] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Mn(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function J(e, t, n) {
  Mn(e).includes(t) ? e[t] = n : pe(e, t, n);
}
var zt = /* @__PURE__ */ new Map();
function Mn(e) {
  var t = zt.get(e.nodeName);
  if (t) return t;
  zt.set(e.nodeName, t = []);
  for (var n, i = Xe(e), s = Element.prototype; s !== i; ) {
    n = tn(i);
    for (var r in n)
      n[r].set && t.push(r);
    i = Xe(i);
  }
  return t;
}
function Oe(e, t) {
  var n = e.__className, i = Xr(t);
  k && e.className === i ? e.__className = i : (n !== i || k && e.className !== i) && (t == null ? e.removeAttribute("class") : e.className = i, e.__className = i);
}
function Xr(e) {
  return e ?? "";
}
const Jr = requestAnimationFrame, Zr = () => performance.now(), te = {
  tick: (
    /** @param {any} _ */
    (e) => Jr(e)
  ),
  now: () => Zr(),
  tasks: /* @__PURE__ */ new Set()
};
function Fn(e) {
  te.tasks.forEach((t) => {
    t.c(e) || (te.tasks.delete(t), t.f());
  }), te.tasks.size !== 0 && te.tick(Fn);
}
function Qr(e) {
  let t;
  return te.tasks.size === 0 && te.tick(Fn), {
    promise: new Promise((n) => {
      te.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      te.tasks.delete(t);
    }
  };
}
function Ue(e, t) {
  e.dispatchEvent(new CustomEvent(t));
}
function ei(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function Gt(e) {
  const t = {}, n = e.split(";");
  for (const i of n) {
    const [s, r] = i.split(":");
    if (!s || r === void 0) break;
    const a = ei(s.trim());
    t[a] = r.trim();
  }
  return t;
}
const ti = (e) => e;
function ni(e, t, n, i) {
  var s = (e & er) !== 0, r = "both", a, o = t.inert, c, l;
  function u() {
    var _ = E, p = m;
    V(null), H(null);
    try {
      return a ?? (a = n()(t, (i == null ? void 0 : i()) ?? /** @type {P} */
      {}, {
        direction: r
      }));
    } finally {
      V(_), H(p);
    }
  }
  var f = {
    is_global: s,
    in() {
      t.inert = o, Ue(t, "introstart"), c = bt(t, u(), l, 1, () => {
        Ue(t, "introend"), c == null || c.abort(), c = a = void 0;
      });
    },
    out(_) {
      t.inert = !0, Ue(t, "outrostart"), l = bt(t, u(), c, 0, () => {
        Ue(t, "outroend"), _ == null || _();
      });
    },
    stop: () => {
      c == null || c.abort(), l == null || l.abort();
    }
  }, d = (
    /** @type {Effect} */
    m
  );
  if ((d.transitions ?? (d.transitions = [])).push(f), nt) {
    var v = s;
    if (!v) {
      for (var h = (
        /** @type {Effect | null} */
        d.parent
      ); h && h.f & He; )
        for (; (h = h.parent) && !(h.f & it); )
          ;
      v = !h || (h.f & rn) !== 0;
    }
    v && je(() => {
      ue(() => f.in());
    });
  }
}
function bt(e, t, n, i, s) {
  var r = i === 1;
  if (ar(t)) {
    var a, o = !1;
    return ot(() => {
      if (!o) {
        var p = t({ direction: r ? "in" : "out" });
        a = bt(e, p, n, i, s);
      }
    }), {
      abort: () => {
        o = !0, a == null || a.abort();
      },
      deactivate: () => a.deactivate(),
      reset: () => a.reset(),
      t: () => a.t()
    };
  }
  if (n == null || n.deactivate(), !(t != null && t.duration))
    return s(), {
      abort: Ne,
      deactivate: Ne,
      reset: Ne,
      t: () => i
    };
  const { delay: c = 0, css: l, tick: u, easing: f = ti } = t;
  var d = [];
  if (r && n === void 0 && (u && u(0, 1), l)) {
    var v = Gt(l(0, 1));
    d.push(v, v);
  }
  var h = () => 1 - i, _ = e.animate(d, { duration: c });
  return _.onfinish = () => {
    var p = (n == null ? void 0 : n.t()) ?? 1 - i;
    n == null || n.abort();
    var b = i - p, g = (
      /** @type {number} */
      t.duration * Math.abs(b)
    ), $ = [];
    if (g > 0) {
      if (l)
        for (var y = Math.ceil(g / 16.666666666666668), T = 0; T <= y; T += 1) {
          var S = p + b * f(T / y), x = l(S, 1 - S);
          $.push(Gt(x));
        }
      h = () => {
        var q = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return p + b * f(q / g);
      }, u && Qr(() => {
        if (_.playState !== "running") return !1;
        var q = h();
        return u(q, 1 - q), !0;
      });
    }
    _ = e.animate($, { duration: g, fill: "forwards" }), _.onfinish = () => {
      h = () => i, u == null || u(i, 1 - i), s();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = Ne);
    },
    deactivate: () => {
      s = Ne;
    },
    reset: () => {
      i === 0 && (u == null || u(1, 0));
    },
    t: () => h()
  };
}
function Xt(e, t) {
  return e === t || (e == null ? void 0 : e[$e]) === t;
}
function kt(e = {}, t, n, i) {
  return je(() => {
    var s, r;
    return at(() => {
      s = r, r = [], ue(() => {
        e !== n(...r) && (t(e, ...r), s && Xt(n(...s), e) && t(null, ...s));
      });
    }), () => {
      ot(() => {
        r && Xt(n(...r), e) && t(null, ...r);
      });
    };
  }), e;
}
function ri(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    N
  ), n = t.l.u;
  if (!n) return;
  let i = () => Sn(t.s);
  if (e) {
    let s = 0, r = (
      /** @type {Record<string, any>} */
      {}
    );
    const a = /* @__PURE__ */ Ze(() => {
      let o = !1;
      const c = t.s;
      for (const l in c)
        c[l] !== r[l] && (r[l] = c[l], o = !0);
      return o && s++, s;
    });
    i = () => w(a);
  }
  n.b.length && Er(() => {
    Jt(t, i), ht(n.b);
  }), Qe(() => {
    const s = ue(() => n.m.map(lr));
    return () => {
      for (const r of s)
        typeof r == "function" && r();
    };
  }), n.a.length && Qe(() => {
    Jt(t, i), ht(n.a);
  });
}
function Jt(e, t) {
  if (e.l.s)
    for (const n of e.l.s) w(n);
  t();
}
function Hn(e) {
  N === null && Ar(), N.l !== null ? ii(N).m.push(e) : Qe(() => {
    const t = ue(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function ii(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ?? (t.u = { a: [], b: [], m: [] });
}
let Ye = !1;
function si(e) {
  var t = Ye;
  try {
    return Ye = !1, [e(), Ye];
  } finally {
    Ye = t;
  }
}
function Zt(e) {
  for (var t = m, n = m; t !== null && !(t.f & (U | Me)); )
    t = t.parent;
  try {
    return H(t), e();
  } finally {
    H(n);
  }
}
function ge(e, t, n, i) {
  var S;
  var s = (n & Gn) !== 0, r = (n & Xn) !== 0, a = (n & Zn) !== 0, o = (n & Qn) !== 0, c = !1, l;
  a ? [l, c] = si(() => (
    /** @type {V} */
    e[t]
  )) : l = /** @type {V} */
  e[t];
  var u = (S = fe(e, t)) == null ? void 0 : S.set, f = (
    /** @type {V} */
    i
  ), d = !0, v = !1, h = () => (v = !0, d && (d = !1, o ? f = ue(
    /** @type {() => V} */
    i
  ) : f = /** @type {V} */
  i), f);
  l === void 0 && i !== void 0 && (u && r && pr(), l = h(), u && u(l));
  var _;
  if (r)
    _ = () => {
      var x = (
        /** @type {V} */
        e[t]
      );
      return x === void 0 ? h() : (d = !0, v = !1, x);
    };
  else {
    var p = Zt(
      () => (s ? Ze : mr)(() => (
        /** @type {V} */
        e[t]
      ))
    );
    p.f |= or, _ = () => {
      var x = w(p);
      return x !== void 0 && (f = /** @type {V} */
      void 0), x === void 0 ? f : x;
    };
  }
  if (!(n & Jn))
    return _;
  if (u) {
    var b = e.$$legacy;
    return function(x, q) {
      return arguments.length > 0 ? ((!r || !q || b || c) && u(q ? _() : x), x) : _();
    };
  }
  var g = !1, $ = !1, y = /* @__PURE__ */ st(l), T = Zt(
    () => /* @__PURE__ */ Ze(() => {
      var x = _(), q = w(y), se = (
        /** @type {Derived} */
        E
      );
      return g || x === void 0 && se.f & xe ? (g = !1, $ = !0, q) : ($ = !1, y.v = x);
    })
  );
  return s || (T.equals = St), function(x, q) {
    if (arguments.length > 0) {
      const se = q ? w(T) : r && a ? z(x) : x;
      return T.equals(se) || (g = !0, C(y, se), v && f !== void 0 && (f = se), ue(() => w(T))), x;
    }
    return w(T);
  };
}
function ai(e) {
  return new li(e);
}
var K, F;
class li {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    ct(this, K);
    /** @type {Record<string, any>} */
    ct(this, F);
    var r;
    var n = /* @__PURE__ */ new Map(), i = (a, o) => {
      var c = /* @__PURE__ */ st(o);
      return n.set(a, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(a, o) {
          return w(n.get(o) ?? i(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return w(n.get(o) ?? i(o, Reflect.get(a, o))), Reflect.has(a, o);
        },
        set(a, o, c) {
          return C(n.get(o) ?? i(o, c), c), Reflect.set(a, o, c);
        }
      }
    );
    dt(this, F, (t.hydrate ? Br : Pn)(t.component, {
      target: t.target,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((r = t == null ? void 0 : t.props) != null && r.$$host) || t.sync === !1) && ee(), dt(this, K, s.$$events);
    for (const a of Object.keys(R(this, F)))
      a === "$set" || a === "$destroy" || a === "$on" || Ge(this, a, {
        get() {
          return R(this, F)[a];
        },
        /** @param {any} value */
        set(o) {
          R(this, F)[a] = o;
        },
        enumerable: !0
      });
    R(this, F).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(s, a);
    }, R(this, F).$destroy = () => {
      Ur(R(this, F));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    R(this, F).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    R(this, K)[t] = R(this, K)[t] || [];
    const i = (...s) => n.call(this, ...s);
    return R(this, K)[t].push(i), () => {
      R(this, K)[t] = R(this, K)[t].filter(
        /** @param {any} fn */
        (s) => s !== i
      );
    };
  }
  $destroy() {
    R(this, F).$destroy();
  }
}
K = new WeakMap(), F = new WeakMap();
let jn;
typeof HTMLElement == "function" && (jn = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, n, i) {
    super();
    /** The Svelte component constructor */
    j(this, "$$ctor");
    /** Slots */
    j(this, "$$s");
    /** @type {any} The Svelte component instance */
    j(this, "$$c");
    /** Whether or not the custom element is connected */
    j(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    j(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    j(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    j(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    j(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    j(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    j(this, "$$me");
    this.$$ctor = t, this.$$s = n, i && this.attachShadow({ mode: "open" });
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(t, n, i) {
    if (this.$$l[t] = this.$$l[t] || [], this.$$l[t].push(n), this.$$c) {
      const s = this.$$c.$on(t, n);
      this.$$l_u.set(n, s);
    }
    super.addEventListener(t, n, i);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(t, n, i) {
    if (super.removeEventListener(t, n, i), this.$$c) {
      const s = this.$$l_u.get(n);
      s && (s(), this.$$l_u.delete(n));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(s) {
        return (r) => {
          const a = document.createElement("slot");
          s !== "default" && (a.name = s), oe(r, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, i = oi(this);
      for (const s of this.$$s)
        s in i && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const r = this.$$g_p(s.name);
        r in this.$$d || (this.$$d[r] = Ke(r, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = ai({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = _n(() => {
        at(() => {
          var s;
          this.$$r = !0;
          for (const r of ze(this.$$c)) {
            if (!((s = this.$$p_d[r]) != null && s.reflect)) continue;
            this.$$d[r] = this.$$c[r];
            const a = Ke(
              r,
              this.$$d[r],
              this.$$p_d,
              "toAttribute"
            );
            a == null ? this.removeAttribute(this.$$p_d[r].attribute || r) : this.setAttribute(this.$$p_d[r].attribute || r, a);
          }
          this.$$r = !1;
        });
      });
      for (const s in this.$$l)
        for (const r of this.$$l[s]) {
          const a = this.$$c.$on(s, r);
          this.$$l_u.set(r, a);
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
  attributeChangedCallback(t, n, i) {
    var s;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ke(t, i, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return ze(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Ke(e, t, n, i) {
  var r;
  const s = (r = n[e]) == null ? void 0 : r.type;
  if (t = s === "Boolean" && typeof t != "boolean" ? t != null : t, !i || !n[e])
    return t;
  if (i === "toAttribute")
    switch (s) {
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
    switch (s) {
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
function oi(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Bn(e, t, n, i, s, r) {
  let a = class extends jn {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return ze(t).map(
        (o) => (t[o].attribute || o).toLowerCase()
      );
    }
  };
  return ze(t).forEach((o) => {
    Ge(a.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(c) {
        var f;
        c = Ke(o, c, t), this.$$d[o] = c;
        var l = this.$$c;
        if (l) {
          var u = (f = fe(l, o)) == null ? void 0 : f.get;
          u ? l[o] = c : l.$set({ [o]: c });
        }
      }
    });
  }), i.forEach((o) => {
    Ge(a.prototype, o, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[o];
      }
    });
  }), r && (a = r(a)), e.element = /** @type {any} */
  a, a;
}
let rt = _t(void 0);
const fi = async () => (C(rt, z(await window.loadCardHelpers().then((e) => e))), w(rt)), ui = () => w(rt) ? w(rt) : fi();
function ci(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function di(e, { delay: t = 0, duration: n = 400, easing: i = ci, axis: s = "y" } = {}) {
  const r = getComputedStyle(e), a = +r.opacity, o = s === "y" ? "height" : "width", c = parseFloat(r[o]), l = s === "y" ? ["top", "bottom"] : ["left", "right"], u = l.map(
    (b) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${b[0].toUpperCase()}${b.slice(1)}`
    )
  ), f = parseFloat(r[`padding${u[0]}`]), d = parseFloat(r[`padding${u[1]}`]), v = parseFloat(r[`margin${u[0]}`]), h = parseFloat(r[`margin${u[1]}`]), _ = parseFloat(
    r[`border${u[0]}Width`]
  ), p = parseFloat(
    r[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: i,
    css: (b) => `overflow: hidden;opacity: ${Math.min(b * 20, 1) * a};${o}: ${b * c}px;padding-${l[0]}: ${b * f}px;padding-${l[1]}: ${b * d}px;margin-${l[0]}: ${b * v}px;margin-${l[1]}: ${b * h}px;border-${l[0]}-width: ${b * _}px;border-${l[1]}-width: ${b * p}px;`
  };
}
var vi = /* @__PURE__ */ Ae('<span class="loading svelte-1sdlsm">Loading...</span>'), hi = /* @__PURE__ */ Ae('<div class="outer-container"><!> <!></div>');
const _i = {
  hash: "svelte-1sdlsm",
  code: `
  .loading.svelte-1sdlsm {
    padding: 1em;
    display: block;
  }
`
};
function Et(e, t) {
  It(t, !0), Dn(e, _i);
  const n = ge(t, "type", 7, "div"), i = ge(t, "config", 7), s = ge(t, "hass", 7), r = ge(t, "marginTop", 7, "0px");
  let a = _t(void 0), o = _t(!0);
  Qe(() => {
    w(a) && (w(a).hass = s());
  }), Hn(async () => {
    const d = (await ui()).createCardElement(i());
    d.hass = s(), w(a) && (w(a).replaceWith(d), C(a, z(d)), C(o, !1));
  });
  var c = hi(), l = ae(c);
  zr(l, n, !1, (f, d) => {
    kt(f, (v) => C(a, z(v)), () => w(a)), Oe(f, "svelte-1sdlsm"), ni(3, f, () => di);
  });
  var u = We(l, 2);
  return mt(u, () => w(o), (f) => {
    var d = vi();
    oe(f, d);
  }), Z(c), Ce(() => pe(c, "style", `margin-top: ${r() ?? ""};`)), oe(e, c), Lt({
    get type() {
      return n();
    },
    set type(f = "div") {
      n(f), ee();
    },
    get config() {
      return i();
    },
    set config(f) {
      i(f), ee();
    },
    get hass() {
      return s();
    },
    set hass(f) {
      s(f), ee();
    },
    get marginTop() {
      return r();
    },
    set marginTop(f = "0px") {
      r(f), ee();
    }
  });
}
customElements.define("expander-sub-card", Bn(
  Et,
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
function pi(e, t) {
  t = Object.assign({
    open: !0,
    duration: 0.2,
    easing: "ease"
  }, t);
  const i = () => {
  };
  let s = i, r = i;
  const a = () => {
    s(), s = i, r = i;
  };
  e.addEventListener("transitionend", a);
  async function o() {
    return new Promise((h, _) => {
      s = h, r = _;
    });
  }
  async function c() {
    return new Promise(requestAnimationFrame);
  }
  function l() {
    return `height ${t.duration}s ${t.easing}`;
  }
  e.style.transition = l(), e.style.height = t.open ? "auto" : "0px", t.open ? e.style.overflow = "visible" : e.style.overflow = "hidden";
  async function u() {
    e.style.height = e.scrollHeight + "px";
    try {
      await o(), e.style.height = "auto", e.style.overflow = "visible";
    } catch {
    }
  }
  async function f() {
    e.style.height === "auto" ? (e.style.transition = "none", await c(), e.style.height = e.scrollHeight + "px", e.style.transition = l(), await c(), e.style.overflow = "hidden", e.style.height = "0px") : (r(), e.style.overflow = "hidden", e.style.height = "0px");
  }
  function d(h) {
    t = Object.assign(t, h), t.open ? u() : f();
  }
  function v() {
    e.removeEventListener("transitionend", a);
  }
  return { update: d, destroy: v };
}
const gi = {
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
var $i = /* @__PURE__ */ Ae('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), yi = /* @__PURE__ */ Ae("<button><div> </div> <ha-icon></ha-icon></button>", 2), wi = /* @__PURE__ */ Ae('<div class="children-container svelte-icqkke"></div>'), mi = /* @__PURE__ */ Ae("<ha-card><!> <!></ha-card>", 2);
const bi = {
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
function ki(e, t) {
  It(t, !1), Dn(e, bi);
  let n = Ft(!1), i = !1, s = ge(t, "hass", 12, void 0), r = ge(t, "config", 12), a = Ft(), o = !1;
  Hn(() => {
    const g = r()["min-width-expanded"], $ = r()["max-width-expanded"], y = document.body.offsetWidth;
    if (g && $ ? r(r().expanded = y >= g && y <= $, !0) : g ? r(r().expanded = y >= g, !0) : $ && r(r().expanded = y <= $, !0), r().expanded !== void 0 && setTimeout(() => C(n, r().expanded), 100), !i) {
      if (r()["title-card-clickable"]) {
        w(a).parentElement && (i = !0, w(a).parentElement.addEventListener("click", (T) => {
          if (o)
            return T.preventDefault(), T.stopImmediatePropagation(), o = !1, !1;
          C(n, !w(n));
        }));
        return;
      }
      w(a).tagName === "BUTTON" && (i = !0, w(a).addEventListener("click", (T) => {
        if (o)
          return T.preventDefault(), T.stopImmediatePropagation(), o = !1, !1;
        C(n, !w(n));
      }));
    }
  });
  let c, l = !1, u = 0, f = 0;
  const d = (g) => {
    c = g.target, u = g.touches[0].clientX, f = g.touches[0].clientY, l = !1;
  }, v = (g) => {
    const $ = g.touches[0].clientX, y = g.touches[0].clientY;
    (Math.abs($ - u) > 10 || Math.abs(y - f) > 10) && (l = !0);
  }, h = (g) => {
    !l && c === g.target && r()["title-card-clickable"] && C(n, !w(n)), c = void 0, o = !0, setTimeout(() => o = !1, 300);
  };
  ri();
  var _ = mi(), p = ae(_);
  mt(
    p,
    () => r()["title-card"],
    (g) => {
      var $ = $i(), y = ae($), T = ae(y);
      Et(T, {
        get hass() {
          return s();
        },
        get config() {
          return r()["title-card"];
        },
        get type() {
          return r()["title-card"].type;
        }
      }), Z(y);
      var S = We(y, 2);
      kt(S, (q) => C(a, q), () => w(a));
      var x = ae(S);
      J(x, "icon", "mdi:chevron-down"), Z(S), Z($), Ce(() => {
        Oe($, `${`title-card-header${r()["title-card-button-overlay"] ? "-overlay" : ""}` ?? ""} svelte-icqkke`), pe(y, "style", `--title-padding:${r()["title-card-padding"] ?? ""}`), pe(S, "style", `--overlay-margin:${r()["overlay-margin"] ?? ""}; --button-background:${r()["button-background"] ?? ""}; --header-color:${r()["header-color"] ?? ""};`), Oe(S, `${`header ripple${r()["title-card-button-overlay"] ? " header-overlay" : ""}${w(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), J(x, "style", `--arrow-color:${r()["arrow-color"] ?? ""}`), J(x, "class", `${`ico${w(n) ? " flipped open" : "close"}` ?? ""} svelte-icqkke`);
      }), vt("touchstart", y, d, void 0, !0), vt("touchmove", y, v, void 0, !0), vt("touchend", y, h), oe(g, $);
    },
    (g) => {
      var $ = yi();
      kt($, (x) => C(a, x), () => w(a));
      var y = ae($), T = ae(y, !0);
      Z(y);
      var S = We(y, 2);
      J(S, "icon", "mdi:chevron-down"), Z($), Ce(() => {
        Oe($, `${`header${r()["expander-card-background-expanded"] ? "" : " ripple"}${w(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), pe($, "style", `--header-width:100%; --button-background:${r()["button-background"] ?? ""};--header-color:${r()["header-color"] ?? ""};`), Oe(y, `${`primary title${w(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), jr(T, r().title), J(S, "style", `--arrow-color:${r()["arrow-color"] ?? ""}`), J(S, "class", `${`ico${w(n) ? " flipped open" : " close"}` ?? ""} svelte-icqkke`);
      }), oe(g, $);
    }
  );
  var b = We(p, 2);
  return mt(b, () => r().cards, (g) => {
    var $ = wi();
    Vr($, 5, () => r().cards, (y) => y, (y, T) => {
      Et(y, {
        get hass() {
          return s();
        },
        get config() {
          return w(T);
        },
        get type() {
          return w(T).type;
        },
        get marginTop() {
          return r()["child-margin-top"];
        }
      });
    }), Z($), Ce(() => pe($, "style", `--expander-card-display:${r()["expander-card-display"] ?? ""};
             --gap:${(w(n) ? r()["expanded-gap"] : r().gap) ?? ""}; --child-padding:${r()["child-padding"] ?? ""}`)), Gr($, (y, T) => pi(y, T), () => ({
      open: w(n),
      duration: 0.3,
      easing: "ease"
    })), oe(g, $);
  }), Z(_), Ce(() => {
    J(_, "class", `${`expander-card${r().clear ? " clear" : ""}${w(n) ? " open" : " close"}` ?? ""} svelte-icqkke`), J(_, "style", `--expander-card-display:${r()["expander-card-display"] ?? ""};
     --gap:${(w(n) ? r()["expanded-gap"] : r().gap) ?? ""}; --padding:${r().padding ?? ""};
     --expander-state:${w(n) ?? ""};
     --card-background:${(w(n) && r()["expander-card-background-expanded"] ? r()["expander-card-background-expanded"] : r()["expander-card-background"]) ?? ""}`);
  }), oe(e, _), Lt({
    get hass() {
      return s();
    },
    set hass(g) {
      s(g), ee();
    },
    get config() {
      return r();
    },
    set config(g) {
      r(g), ee();
    }
  });
}
customElements.define("expander-card", Bn(ki, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  setConfig(t = {}) {
    this.config = { ...gi, ...t };
  }
}));
const Ei = "2.2.3";
console.info(
  `%c  Expander-Card 
%c Version ${Ei}`,
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
  ki as default
};
//# sourceMappingURL=expander-card.js.map
