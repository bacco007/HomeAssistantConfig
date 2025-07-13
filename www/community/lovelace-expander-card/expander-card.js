var Qr = Object.defineProperty;
var Bt = (e) => {
  throw TypeError(e);
};
var en = (e, t, r) => t in e ? Qr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var R = (e, t, r) => en(e, typeof t != "symbol" ? t + "" : t, r), jt = (e, t, r) => t.has(e) || Bt("Cannot " + r);
var q = (e, t, r) => (jt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ct = (e, t, r) => t.has(e) ? Bt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), dt = (e, t, r, n) => (jt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
const tn = "5";
var ir;
typeof window < "u" && ((ir = window.__svelte ?? (window.__svelte = {})).v ?? (ir.v = /* @__PURE__ */ new Set())).add(tn);
const rn = 1, nn = 2, an = 16, sn = 4, ln = 1, on = 2, Tt = "[", Ct = "[!", Nt = "]", Ce = {}, S = Symbol(), fn = "http://www.w3.org/1999/xhtml", un = "http://www.w3.org/2000/svg", Wt = !1;
var St = Array.isArray, cn = Array.prototype.indexOf, At = Array.from, ze = Object.keys, Je = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, dn = Object.getOwnPropertyDescriptors, vn = Object.prototype, hn = Array.prototype, ar = Object.getPrototypeOf, Xt = Object.isExtensible;
function _n(e) {
  return typeof e == "function";
}
const qe = () => {
};
function sr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const Y = 2, Ot = 4, Rt = 8, it = 16, re = 32, be = 64, qt = 128, P = 256, Ze = 512, j = 1024, ee = 2048, Ee = 4096, Q = 8192, at = 16384, It = 32768, Be = 65536, Gt = 1 << 17, pn = 1 << 18, lr = 1 << 19, ht = 1 << 20, or = 1 << 21, Xe = Symbol("$state"), gn = Symbol("legacy props"), $n = Symbol(""), fr = new class extends Error {
  constructor() {
    super(...arguments);
    R(this, "name", "StaleReactionError");
    R(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), wn = 1, ur = 3, Le = 8;
function cr(e) {
  return e === this.v;
}
function mn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function dr(e) {
  return !mn(e, this.v);
}
function yn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function bn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function En(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function kn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function xn() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Tn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Cn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Nn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let Sn = !1;
function An(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let W = null;
function Kt(e) {
  W = e;
}
function Mt(e, t = !1, r) {
  W = {
    p: W,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function Ft(e) {
  var t = (
    /** @type {ComponentContext} */
    W
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      Er(n);
  }
  return e !== void 0 && (t.x = e), W = t.p, e ?? /** @type {T} */
  {};
}
function vr() {
  return !0;
}
function Ie(e) {
  if (typeof e != "object" || e === null || Xe in e)
    return e;
  const t = ar(e);
  if (t !== vn && t !== hn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = St(e), i = /* @__PURE__ */ L(0), a = me, s = (l) => {
    if (me === a)
      return l();
    var u = k, o = me;
    K(null), Zt(a);
    var f = l();
    return K(u), Zt(o), f;
  };
  return n && r.set("length", /* @__PURE__ */ L(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, u, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && Tn();
        var f = r.get(u);
        return f === void 0 ? f = s(() => {
          var v = /* @__PURE__ */ L(o.value);
          return r.set(u, v), v;
        }) : N(f, o.value, !0), !0;
      },
      deleteProperty(l, u) {
        var o = r.get(u);
        if (o === void 0) {
          if (u in l) {
            const c = s(() => /* @__PURE__ */ L(S));
            r.set(u, c), vt(i);
          }
        } else {
          if (n && typeof u == "string") {
            var f = (
              /** @type {Source<number>} */
              r.get("length")
            ), v = Number(u);
            Number.isInteger(v) && v < f.v && N(f, v);
          }
          N(o, S), vt(i);
        }
        return !0;
      },
      get(l, u, o) {
        var d;
        if (u === Xe)
          return e;
        var f = r.get(u), v = u in l;
        if (f === void 0 && (!v || (d = Ne(l, u)) != null && d.writable) && (f = s(() => {
          var h = Ie(v ? l[u] : S), _ = /* @__PURE__ */ L(h);
          return _;
        }), r.set(u, f)), f !== void 0) {
          var c = w(f);
          return c === S ? void 0 : c;
        }
        return Reflect.get(l, u, o);
      },
      getOwnPropertyDescriptor(l, u) {
        var o = Reflect.getOwnPropertyDescriptor(l, u);
        if (o && "value" in o) {
          var f = r.get(u);
          f && (o.value = w(f));
        } else if (o === void 0) {
          var v = r.get(u), c = v == null ? void 0 : v.v;
          if (v !== void 0 && c !== S)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return o;
      },
      has(l, u) {
        var c;
        if (u === Xe)
          return !0;
        var o = r.get(u), f = o !== void 0 && o.v !== S || Reflect.has(l, u);
        if (o !== void 0 || b !== null && (!f || (c = Ne(l, u)) != null && c.writable)) {
          o === void 0 && (o = s(() => {
            var d = f ? Ie(l[u]) : S, h = /* @__PURE__ */ L(d);
            return h;
          }), r.set(u, o));
          var v = w(o);
          if (v === S)
            return !1;
        }
        return f;
      },
      set(l, u, o, f) {
        var C;
        var v = r.get(u), c = u in l;
        if (n && u === "length")
          for (var d = o; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var h = r.get(d + "");
            h !== void 0 ? N(h, S) : d in l && (h = s(() => /* @__PURE__ */ L(S)), r.set(d + "", h));
          }
        if (v === void 0)
          (!c || (C = Ne(l, u)) != null && C.writable) && (v = s(() => /* @__PURE__ */ L(void 0)), N(v, Ie(o)), r.set(u, v));
        else {
          c = v.v !== S;
          var _ = s(() => Ie(o));
          N(v, _);
        }
        var $ = Reflect.getOwnPropertyDescriptor(l, u);
        if ($ != null && $.set && $.set.call(f, o), !c) {
          if (n && typeof u == "string") {
            var p = (
              /** @type {Source<number>} */
              r.get("length")
            ), E = Number(u);
            Number.isInteger(E) && E >= p.v && N(p, E + 1);
          }
          vt(i);
        }
        return !0;
      },
      ownKeys(l) {
        w(i);
        var u = Reflect.ownKeys(l).filter((v) => {
          var c = r.get(v);
          return c === void 0 || c.v !== S;
        });
        for (var [o, f] of r)
          f.v !== S && !(o in l) && u.push(o);
        return u;
      },
      setPrototypeOf() {
        Cn();
      }
    }
  );
}
// @__NO_SIDE_EFFECTS__
function Lt(e) {
  var t = Y | ee, r = k !== null && (k.f & Y) !== 0 ? (
    /** @type {Derived} */
    k
  ) : null;
  return b === null || r !== null && (r.f & P) !== 0 ? t |= P : b.f |= lr, {
    ctx: W,
    deps: null,
    effects: null,
    equals: cr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      S
    ),
    wv: 0,
    parent: r ?? b,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function On(e) {
  const t = /* @__PURE__ */ Lt(e);
  return t.equals = dr, t;
}
function hr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      G(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Rn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Y) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function Dt(e) {
  var t, r = b;
  de(Rn(e));
  try {
    hr(e), t = Mr(e);
  } finally {
    de(r);
  }
  return t;
}
function _r(e) {
  var t = Dt(e);
  if (e.equals(t) || (e.v = t, e.wv = qr()), !ce) {
    var r = (ue || (e.f & P) !== 0) && e.deps !== null ? Ee : j;
    te(e, r);
  }
}
const $e = /* @__PURE__ */ new Map();
function Qe(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: cr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  const r = Qe(e);
  return Vn(r), r;
}
// @__NO_SIDE_EFFECTS__
function pr(e, t = !1, r = !0) {
  const n = Qe(e);
  return t || (n.equals = dr), n;
}
function N(e, t, r = !1) {
  k !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!X || (k.f & Gt) !== 0) && vr() && (k.f & (Y | it | Gt)) !== 0 && !(O != null && O.includes(e)) && Nn();
  let n = r ? Ie(t) : t;
  return qn(e, n);
}
function qn(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? $e.set(e, t) : $e.set(e, r), e.v = t, (e.f & Y) !== 0 && ((e.f & ee) !== 0 && Dt(
      /** @type {Derived} */
      e
    ), te(e, (e.f & P) === 0 ? j : Ee)), e.wv = qr(), gr(e, ee), b !== null && (b.f & j) !== 0 && (b.f & (re | be)) === 0 && (V === null ? Bn([e]) : V.push(e));
  }
  return t;
}
function vt(e) {
  N(e, e.v + 1);
}
function gr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f;
      (s & ee) === 0 && (te(a, t), (s & (j | P)) !== 0 && ((s & Y) !== 0 ? gr(
        /** @type {Derived} */
        a,
        Ee
      ) : ft(
        /** @type {Effect} */
        a
      )));
    }
}
function st(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let m = !1;
function D(e) {
  m = e;
}
let T;
function U(e) {
  if (e === null)
    throw st(), Ce;
  return T = e;
}
function Se() {
  return U(
    /** @type {TemplateNode} */
    /* @__PURE__ */ ke(T)
  );
}
function se(e) {
  if (m) {
    if (/* @__PURE__ */ ke(T) !== null)
      throw st(), Ce;
    T = e;
  }
}
function _t() {
  for (var e = 0, t = T; ; ) {
    if (t.nodeType === Le) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === Nt) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Tt || r === Ct) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ke(t)
    );
    t.remove(), t = n;
  }
}
function $r(e) {
  if (!e || e.nodeType !== Le)
    throw st(), Ce;
  return (
    /** @type {Comment} */
    e.data
  );
}
var zt, wr, mr, yr;
function pt() {
  if (zt === void 0) {
    zt = window, wr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    mr = Ne(t, "firstChild").get, yr = Ne(t, "nextSibling").get, Xt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Xt(r) && (r.__t = void 0);
  }
}
function Ae(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ye(e) {
  return mr.call(e);
}
// @__NO_SIDE_EFFECTS__
function ke(e) {
  return yr.call(e);
}
function he(e, t) {
  if (!m)
    return /* @__PURE__ */ ye(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ ye(T)
  );
  if (r === null)
    r = T.appendChild(Ae());
  else if (t && r.nodeType !== ur) {
    var n = Ae();
    return r == null || r.before(n), U(n), n;
  }
  return U(r), r;
}
function Ge(e, t = 1, r = !1) {
  let n = m ? T : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ ke(n);
  if (!m)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== ur) {
    var a = Ae();
    return n === null ? i == null || i.after(a) : n.before(a), U(a), a;
  }
  return U(n), /** @type {TemplateNode} */
  n;
}
function br(e) {
  e.textContent = "";
}
function In(e) {
  b === null && k === null && En(), k !== null && (k.f & P) !== 0 && b === null && bn(), ce && yn();
}
function Mn(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function xe(e, t, r, n = !0) {
  var i = b, a = {
    ctx: W,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | ee,
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
      Yt(a), a.f |= It;
    } catch (u) {
      throw G(a), u;
    }
  else t !== null && ft(a);
  var s = r && a.deps === null && a.first === null && a.nodes_start === null && a.teardown === null && (a.f & (lr | qt)) === 0;
  if (!s && n && (i !== null && Mn(a, i), k !== null && (k.f & Y) !== 0)) {
    var l = (
      /** @type {Derived} */
      k
    );
    (l.effects ?? (l.effects = [])).push(a);
  }
  return a;
}
function gt(e) {
  if (In(), !k && b && (b.f & re) !== 0) {
    var t = (
      /** @type {ComponentContext} */
      W
    );
    (t.e ?? (t.e = [])).push(e);
  } else
    return Er(e);
}
function Er(e) {
  return xe(Ot | or, e, !1);
}
function Fn(e) {
  const t = xe(be, e, !0);
  return () => {
    G(t);
  };
}
function Ln(e) {
  const t = xe(be, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? De(t, () => {
      G(t), n(void 0);
    }) : (G(t), n(void 0));
  });
}
function kr(e) {
  return xe(Ot, e, !1);
}
function xr(e) {
  return xe(Rt, e, !0);
}
function _e(e, t = [], r = Lt) {
  const n = t.map(r);
  return lt(() => e(...n.map(w)));
}
function lt(e, t = 0) {
  var r = xe(Rt | it | t, e, !0);
  return r;
}
function Oe(e, t = !0) {
  return xe(Rt | re, e, !0, t);
}
function Tr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = ce, n = k;
    Jt(!0), K(null);
    try {
      t.call(null);
    } finally {
      Jt(r), K(n);
    }
  }
}
function Cr(e, t = !1) {
  var i;
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    (i = r.ac) == null || i.abort(fr);
    var n = r.next;
    (r.f & be) !== 0 ? r.parent = null : G(r, t), r = n;
  }
}
function Dn(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & re) === 0 && G(t), t = r;
  }
}
function G(e, t = !0) {
  var r = !1;
  (t || (e.f & pn) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Pn(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), Cr(e, t && !r), tt(e, 0), te(e, at);
  var n = e.transitions;
  if (n !== null)
    for (const a of n)
      a.stop();
  Tr(e);
  var i = e.parent;
  i !== null && i.first !== null && Nr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Pn(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ke(e)
    );
    e.remove(), e = r;
  }
}
function Nr(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function De(e, t) {
  var r = [];
  Pt(e, r, !0), Sr(r, () => {
    G(e), t && t();
  });
}
function Sr(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function Pt(e, t, r) {
  if ((e.f & Q) === 0) {
    if (e.f ^= Q, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & Be) !== 0 || (n.f & re) !== 0;
      Pt(n, t, a ? r : !1), n = i;
    }
  }
}
function Pe(e) {
  Ar(e, !0);
}
function Ar(e, t) {
  if ((e.f & Q) !== 0) {
    e.f ^= Q;
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & Be) !== 0 || (r.f & re) !== 0;
      Ar(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let Ue = [], $t = [];
function Or() {
  var e = Ue;
  Ue = [], sr(e);
}
function Un() {
  var e = $t;
  $t = [], sr(e);
}
function Ut(e) {
  Ue.length === 0 && queueMicrotask(Or), Ue.push(e);
}
function Yn() {
  Ue.length > 0 && Or(), $t.length > 0 && Un();
}
function Hn(e) {
  var t = (
    /** @type {Effect} */
    b
  );
  if ((t.f & It) === 0) {
    if ((t.f & qt) === 0)
      throw e;
    t.fn(e);
  } else
    Rr(e, t);
}
function Rr(e, t) {
  for (; t !== null; ) {
    if ((t.f & qt) !== 0)
      try {
        t.b.error(e);
        return;
      } catch {
      }
    t = t.parent;
  }
  throw e;
}
let Ye = !1, He = null, we = !1, ce = !1;
function Jt(e) {
  ce = e;
}
let Me = [];
let k = null, X = !1;
function K(e) {
  k = e;
}
let b = null;
function de(e) {
  b = e;
}
let O = null;
function Vn(e) {
  k !== null && k.f & ht && (O === null ? O = [e] : O.push(e));
}
let A = null, F = 0, V = null;
function Bn(e) {
  V = e;
}
let et = 1, Ve = 0, me = Ve;
function Zt(e) {
  me = e;
}
let ue = !1;
function qr() {
  return ++et;
}
function ot(e) {
  var v;
  var t = e.f;
  if ((t & ee) !== 0)
    return !0;
  if ((t & Ee) !== 0) {
    var r = e.deps, n = (t & P) !== 0;
    if (r !== null) {
      var i, a, s = (t & Ze) !== 0, l = n && b !== null && !ue, u = r.length;
      if (s || l) {
        var o = (
          /** @type {Derived} */
          e
        ), f = o.parent;
        for (i = 0; i < u; i++)
          a = r[i], (s || !((v = a == null ? void 0 : a.reactions) != null && v.includes(o))) && (a.reactions ?? (a.reactions = [])).push(o);
        s && (o.f ^= Ze), l && f !== null && (f.f & P) === 0 && (o.f ^= P);
      }
      for (i = 0; i < u; i++)
        if (a = r[i], ot(
          /** @type {Derived} */
          a
        ) && _r(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!n || b !== null && !ue) && te(e, j);
  }
  return !1;
}
function Ir(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(O != null && O.includes(e)))
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      (a.f & Y) !== 0 ? Ir(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (r ? te(a, ee) : (a.f & j) !== 0 && te(a, Ee), ft(
        /** @type {Effect} */
        a
      ));
    }
}
function Mr(e) {
  var h;
  var t = A, r = F, n = V, i = k, a = ue, s = O, l = W, u = X, o = me, f = e.f;
  A = /** @type {null | Value[]} */
  null, F = 0, V = null, ue = (f & P) !== 0 && (X || !we || k === null), k = (f & (re | be)) === 0 ? e : null, O = null, Kt(e.ctx), X = !1, me = ++Ve, e.f |= ht, e.ac !== null && (e.ac.abort(fr), e.ac = null);
  try {
    var v = (
      /** @type {Function} */
      (0, e.fn)()
    ), c = e.deps;
    if (A !== null) {
      var d;
      if (tt(e, F), c !== null && F > 0)
        for (c.length = F + A.length, d = 0; d < A.length; d++)
          c[F + d] = A[d];
      else
        e.deps = c = A;
      if (!ue || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (f & Y) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (d = F; d < c.length; d++)
          ((h = c[d]).reactions ?? (h.reactions = [])).push(e);
    } else c !== null && F < c.length && (tt(e, F), c.length = F);
    if (vr() && V !== null && !X && c !== null && (e.f & (Y | Ee | ee)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      V.length; d++)
        Ir(
          V[d],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (Ve++, V !== null && (n === null ? n = V : n.push(.../** @type {Source[]} */
    V))), v;
  } catch (_) {
    Hn(_);
  } finally {
    A = t, F = r, V = n, k = i, ue = a, O = s, Kt(l), X = u, me = o, e.f ^= ht;
  }
}
function jn(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = cn.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & Y) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !A.includes(t)) && (te(t, Ee), (t.f & (P | Ze)) === 0 && (t.f ^= Ze), hr(
    /** @type {Derived} **/
    t
  ), tt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function tt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      jn(e, r[n]);
}
function Yt(e) {
  var t = e.f;
  if ((t & at) === 0) {
    te(e, j);
    var r = b, n = we;
    b = e, we = !0;
    try {
      (t & it) !== 0 ? Dn(e) : Cr(e), Tr(e);
      var i = Mr(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = et;
      var a;
      Wt && Sn && (e.f & ee) !== 0 && e.deps;
    } finally {
      we = n, b = r;
    }
  }
}
function Wn() {
  try {
    kn();
  } catch (e) {
    if (He !== null)
      Rr(e, He);
    else
      throw e;
  }
}
function Fr() {
  var e = we;
  try {
    var t = 0;
    for (we = !0; Me.length > 0; ) {
      t++ > 1e3 && Wn();
      var r = Me, n = r.length;
      Me = [];
      for (var i = 0; i < n; i++) {
        var a = Gn(r[i]);
        Xn(a);
      }
      $e.clear();
    }
  } finally {
    Ye = !1, we = e, He = null;
  }
}
function Xn(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; r++) {
      var n = e[r];
      if ((n.f & (at | Q)) === 0 && ot(n)) {
        var i = et;
        if (Yt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? Nr(n) : n.fn = null), et > i && (n.f & or) !== 0)
          break;
      }
    }
    for (; r < t; r += 1)
      ft(e[r]);
  }
}
function ft(e) {
  Ye || (Ye = !0, queueMicrotask(Fr));
  for (var t = He = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if ((r & (be | re)) !== 0) {
      if ((r & j) === 0) return;
      t.f ^= j;
    }
  }
  Me.push(t);
}
function Gn(e) {
  for (var t = [], r = e; r !== null; ) {
    var n = r.f, i = (n & (re | be)) !== 0, a = i && (n & j) !== 0;
    if (!a && (n & Q) === 0) {
      (n & Ot) !== 0 ? t.push(r) : i ? r.f ^= j : ot(r) && Yt(r);
      var s = r.first;
      if (s !== null) {
        r = s;
        continue;
      }
    }
    var l = r.parent;
    for (r = r.next; r === null && l !== null; )
      r = l.next, l = l.parent;
  }
  return t;
}
function fe(e) {
  for (var t; ; ) {
    if (Yn(), Me.length === 0)
      return Ye = !1, He = null, /** @type {T} */
      t;
    Ye = !0, Fr();
  }
}
function w(e) {
  var t = e.f, r = (t & Y) !== 0;
  if (k !== null && !X) {
    if (!(O != null && O.includes(e))) {
      var n = k.deps;
      e.rv < Ve && (e.rv = Ve, A === null && n !== null && n[F] === e ? F++ : A === null ? A = [e] : (!ue || !A.includes(e)) && A.push(e));
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var i = (
      /** @type {Derived} */
      e
    ), a = i.parent;
    a !== null && (a.f & P) === 0 && (i.f ^= P);
  }
  if (r && !ce && (i = /** @type {Derived} */
  e, ot(i) && _r(i)), ce) {
    if ($e.has(e))
      return $e.get(e);
    if (r) {
      i = /** @type {Derived} */
      e;
      var s = i.v;
      return ((i.f & j) !== 0 || Lr(i)) && (s = Dt(i)), $e.set(i, s), s;
    }
  }
  return e.v;
}
function Lr(e) {
  if (e.v === S) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if ($e.has(t) || (t.f & Y) !== 0 && Lr(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ht(e) {
  var t = X;
  try {
    return X = !0, e();
  } finally {
    X = t;
  }
}
const Kn = -7169;
function te(e, t) {
  e.f = e.f & Kn | t;
}
function Dr(e) {
  var t = k, r = b;
  K(null), de(null);
  try {
    return e();
  } finally {
    K(t), de(r);
  }
}
const Pr = /* @__PURE__ */ new Set(), wt = /* @__PURE__ */ new Set();
function zn(e) {
  for (var t = 0; t < e.length; t++)
    Pr.add(e[t]);
  for (var r of wt)
    r(e);
}
function je(e) {
  var E;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((E = e.composedPath) == null ? void 0 : E.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  ), s = 0, l = e.__root;
  if (l) {
    var u = i.indexOf(l);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    u <= o && (s = u);
  }
  if (a = /** @type {Element} */
  i[s] || e.target, a !== t) {
    Je(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var f = k, v = b;
    K(null), de(null);
    try {
      for (var c, d = []; a !== null; ) {
        var h = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var _ = a["__" + n];
          if (_ != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a))
            if (St(_)) {
              var [$, ...p] = _;
              $.apply(a, [e, ...p]);
            } else
              _.call(a, e);
        } catch (C) {
          c ? d.push(C) : c = C;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        a = h;
      }
      if (c) {
        for (let C of d)
          queueMicrotask(() => {
            throw C;
          });
        throw c;
      }
    } finally {
      e.__root = t, delete e.currentTarget, K(f), de(v);
    }
  }
}
function Jn(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Fe(e, t) {
  var r = (
    /** @type {Effect} */
    b
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Re(e, t) {
  var r = (t & ln) !== 0, n = (t & on) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (m)
      return Fe(T, null), T;
    i === void 0 && (i = Jn(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ ye(i)));
    var s = (
      /** @type {TemplateNode} */
      n || wr ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ye(s)
      ), u = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Fe(l, u);
    } else
      Fe(s, s);
    return s;
  };
}
function ge(e, t) {
  if (m) {
    b.nodes_end = T, Se();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Zn = ["touchstart", "touchmove"];
function Qn(e) {
  return Zn.includes(e);
}
const ei = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function ti(e) {
  return ei.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let rt = !0;
function Qt(e) {
  rt = e;
}
function ri(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Ur(e, t) {
  return Yr(e, t);
}
function ni(e, t) {
  pt(), t.intro = t.intro ?? !1;
  const r = t.target, n = m, i = T;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ye(r)
    ); a && (a.nodeType !== Le || /** @type {Comment} */
    a.data !== Tt); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ ke(a);
    if (!a)
      throw Ce;
    D(!0), U(
      /** @type {Comment} */
      a
    ), Se();
    const s = Yr(e, { ...t, anchor: a });
    if (T === null || T.nodeType !== Le || /** @type {Comment} */
    T.data !== Nt)
      throw st(), Ce;
    return D(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Ce)
      return t.recover === !1 && xn(), pt(), br(r), D(!1), Ur(e, t);
    throw s;
  } finally {
    D(n), U(i);
  }
}
const Te = /* @__PURE__ */ new Map();
function Yr(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  pt();
  var l = /* @__PURE__ */ new Set(), u = (v) => {
    for (var c = 0; c < v.length; c++) {
      var d = v[c];
      if (!l.has(d)) {
        l.add(d);
        var h = Qn(d);
        t.addEventListener(d, je, { passive: h });
        var _ = Te.get(d);
        _ === void 0 ? (document.addEventListener(d, je, { passive: h }), Te.set(d, 1)) : Te.set(d, _ + 1);
      }
    }
  };
  u(At(Pr)), wt.add(u);
  var o = void 0, f = Ln(() => {
    var v = r ?? t.appendChild(Ae());
    return Oe(() => {
      if (a) {
        Mt({});
        var c = (
          /** @type {ComponentContext} */
          W
        );
        c.c = a;
      }
      i && (n.$$events = i), m && Fe(
        /** @type {TemplateNode} */
        v,
        null
      ), rt = s, o = e(v, n) || {}, rt = !0, m && (b.nodes_end = T), a && Ft();
    }), () => {
      var h;
      for (var c of l) {
        t.removeEventListener(c, je);
        var d = (
          /** @type {number} */
          Te.get(c)
        );
        --d === 0 ? (document.removeEventListener(c, je), Te.delete(c)) : Te.set(c, d);
      }
      wt.delete(u), v !== r && ((h = v.parentNode) == null || h.removeChild(v));
    };
  });
  return mt.set(o, f), o;
}
let mt = /* @__PURE__ */ new WeakMap();
function ii(e, t) {
  const r = mt.get(e);
  return r ? (mt.delete(e), r(t)) : Promise.resolve();
}
function Hr(e) {
  W === null && An(), gt(() => {
    const t = Ht(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function yt(e, t, [r, n] = [0, 0]) {
  m && r === 0 && Se();
  var i = e, a = null, s = null, l = S, u = r > 0 ? Be : 0, o = !1;
  const f = (c, d = !0) => {
    o = !0, v(d, c);
  }, v = (c, d) => {
    if (l === (l = c)) return;
    let h = !1;
    if (m && n !== -1) {
      if (r === 0) {
        const $ = $r(i);
        $ === Tt ? n = 0 : $ === Ct ? n = 1 / 0 : (n = parseInt($.substring(1)), n !== n && (n = l ? 1 / 0 : -1));
      }
      const _ = n > r;
      !!l === _ && (i = _t(), U(i), D(!1), h = !0, n = -1);
    }
    l ? (a ? Pe(a) : d && (a = Oe(() => d(i))), s && De(s, () => {
      s = null;
    })) : (s ? Pe(s) : d && (s = Oe(() => d(i, [r + 1, n]))), a && De(a, () => {
      a = null;
    })), h && D(!0);
  };
  lt(() => {
    o = !1, t(f), o || v(null, null);
  }, u), m && (i = T);
}
function ai(e, t, r, n) {
  for (var i = [], a = t.length, s = 0; s < a; s++)
    Pt(t[s].e, i, !0);
  var l = a > 0 && i.length === 0 && r !== null;
  if (l) {
    var u = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    br(u), u.append(
      /** @type {Element} */
      r
    ), n.clear(), oe(e, t[0].prev, t[a - 1].next);
  }
  Sr(i, () => {
    for (var o = 0; o < a; o++) {
      var f = t[o];
      l || (n.delete(f.k), oe(e, f.prev, f.next)), G(f.e, !l);
    }
  });
}
function si(e, t, r, n, i, a = null) {
  var s = e, l = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var u = (
      /** @type {Element} */
      e
    );
    s = m ? U(
      /** @type {Comment | Text} */
      /* @__PURE__ */ ye(u)
    ) : u.appendChild(Ae());
  }
  m && Se();
  var o = null, f = !1, v = /* @__PURE__ */ On(() => {
    var c = r();
    return St(c) ? c : c == null ? [] : At(c);
  });
  lt(() => {
    var c = w(v), d = c.length;
    if (f && d === 0)
      return;
    f = d === 0;
    let h = !1;
    if (m) {
      var _ = $r(s) === Ct;
      _ !== (d === 0) && (s = _t(), U(s), D(!1), h = !0);
    }
    if (m) {
      for (var $ = null, p, E = 0; E < d; E++) {
        if (T.nodeType === Le && /** @type {Comment} */
        T.data === Nt) {
          s = /** @type {Comment} */
          T, h = !0, D(!1);
          break;
        }
        var C = c[E], I = n(C, E);
        p = Vr(
          T,
          l,
          $,
          null,
          C,
          I,
          E,
          i,
          t,
          r
        ), l.items.set(I, p), $ = p;
      }
      d > 0 && U(_t());
    }
    m || li(c, l, s, i, t, n, r), a !== null && (d === 0 ? o ? Pe(o) : o = Oe(() => a(s)) : o !== null && De(o, () => {
      o = null;
    })), h && D(!0), w(v);
  }), m && (s = T);
}
function li(e, t, r, n, i, a, s) {
  var l = e.length, u = t.items, o = t.first, f = o, v, c = null, d = [], h = [], _, $, p, E;
  for (E = 0; E < l; E += 1) {
    if (_ = e[E], $ = a(_, E), p = u.get($), p === void 0) {
      var C = f ? (
        /** @type {TemplateNode} */
        f.e.nodes_start
      ) : r;
      c = Vr(
        C,
        t,
        c,
        c === null ? t.first : c.next,
        _,
        $,
        E,
        n,
        i,
        s
      ), u.set($, c), d = [], h = [], f = c.next;
      continue;
    }
    if ((p.e.f & Q) !== 0 && Pe(p.e), p !== f) {
      if (v !== void 0 && v.has(p)) {
        if (d.length < h.length) {
          var I = h[0], M;
          c = I.prev;
          var ne = d[0], ie = d[d.length - 1];
          for (M = 0; M < d.length; M += 1)
            er(d[M], I, r);
          for (M = 0; M < h.length; M += 1)
            v.delete(h[M]);
          oe(t, ne.prev, ie.next), oe(t, c, ne), oe(t, ie, I), f = I, c = ie, E -= 1, d = [], h = [];
        } else
          v.delete(p), er(p, f, r), oe(t, p.prev, p.next), oe(t, p, c === null ? t.first : c.next), oe(t, c, p), c = p;
        continue;
      }
      for (d = [], h = []; f !== null && f.k !== $; )
        (f.e.f & Q) === 0 && (v ?? (v = /* @__PURE__ */ new Set())).add(f), h.push(f), f = f.next;
      if (f === null)
        continue;
      p = f;
    }
    d.push(p), c = p, f = p.next;
  }
  if (f !== null || v !== void 0) {
    for (var ae = v === void 0 ? [] : At(v); f !== null; )
      (f.e.f & Q) === 0 && ae.push(f), f = f.next;
    var g = ae.length;
    if (g > 0) {
      var y = l === 0 ? r : null;
      ai(t, ae, y, u);
    }
  }
  b.first = t.first && t.first.e, b.last = c && c.e;
}
function Vr(e, t, r, n, i, a, s, l, u, o) {
  var f = (u & rn) !== 0, v = (u & an) === 0, c = f ? v ? /* @__PURE__ */ pr(i, !1, !1) : Qe(i) : i, d = (u & nn) === 0 ? s : Qe(s), h = {
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
    return h.e = Oe(() => l(e, c, d, o), m), h.e.prev = r && r.e, h.e.next = n && n.e, r === null ? t.first = h : (r.next = h, r.e.next = h.e), n !== null && (n.prev = h, n.e.prev = h.e), h;
  } finally {
  }
}
function er(e, t, r) {
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
      /* @__PURE__ */ ke(a)
    );
    i.before(a), a = s;
  }
}
function oe(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function oi(e, t, r, n, i, a) {
  let s = m;
  m && Se();
  var l, u, o = null;
  m && T.nodeType === wn && (o = /** @type {Element} */
  T, Se());
  var f = (
    /** @type {TemplateNode} */
    m ? T : e
  ), v;
  lt(() => {
    const c = t() || null;
    var d = c === "svg" ? un : null;
    c !== l && (v && (c === null ? De(v, () => {
      v = null, u = null;
    }) : c === u ? Pe(v) : (G(v), Qt(!1))), c && c !== u && (v = Oe(() => {
      if (o = m ? (
        /** @type {Element} */
        o
      ) : d ? document.createElementNS(d, c) : document.createElement(c), Fe(o, o), n) {
        m && ti(c) && o.append(document.createComment(""));
        var h = (
          /** @type {TemplateNode} */
          m ? /* @__PURE__ */ ye(o) : o.appendChild(Ae())
        );
        m && (h === null ? D(!1) : U(h)), n(o, h);
      }
      b.nodes_end = o, f.before(o);
    })), l = c, l && (u = l), Qt(!0));
  }, Be), s && (D(!0), U(f));
}
function Br(e, t) {
  Ut(() => {
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
function fi(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function ui(e, t) {
  return e == null ? null : String(e);
}
function ve(e, t, r, n, i, a) {
  var s = e.__className;
  if (m || s !== r || s === void 0) {
    var l = fi(r, n);
    (!m || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : e.className = l), e.__className = r;
  }
  return a;
}
function le(e, t, r, n) {
  var i = e.__style;
  if (m || i !== t) {
    var a = ui(t);
    (!m || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
  }
  return n;
}
const ci = Symbol("is custom element"), di = Symbol("is html");
function jr(e, t, r, n) {
  var i = vi(e);
  m && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[$n] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Wr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function tr(e, t, r) {
  var n = k, i = b;
  let a = m;
  m && D(!1), K(null), de(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (bt.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? Wr(e).includes(t) : r && typeof r == "object") ? e[t] = r : jr(e, t, r == null ? r : String(r));
  } finally {
    K(n), de(i), a && D(!0);
  }
}
function vi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ci]: e.nodeName.includes("-"),
      [di]: e.namespaceURI === fn
    })
  );
}
var bt = /* @__PURE__ */ new Map();
function Wr(e) {
  var t = bt.get(e.nodeName);
  if (t) return t;
  bt.set(e.nodeName, t = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = dn(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = ar(n);
  }
  return t;
}
const hi = () => performance.now(), Z = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => hi(),
  tasks: /* @__PURE__ */ new Set()
};
function Xr() {
  const e = Z.now();
  Z.tasks.forEach((t) => {
    t.c(e) || (Z.tasks.delete(t), t.f());
  }), Z.tasks.size !== 0 && Z.tick(Xr);
}
function _i(e) {
  let t;
  return Z.tasks.size === 0 && Z.tick(Xr), {
    promise: new Promise((r) => {
      Z.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      Z.tasks.delete(t);
    }
  };
}
function We(e, t) {
  Dr(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function pi(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function rr(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = pi(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const gi = (e) => e;
function Gr(e, t, r, n) {
  var i = (e & sn) !== 0, a = "both", s, l = t.inert, u = t.style.overflow, o, f;
  function v() {
    return Dr(() => s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: a
    })));
  }
  var c = {
    is_global: i,
    in() {
      t.inert = l, We(t, "introstart"), o = Et(t, v(), f, 1, () => {
        We(t, "introend"), o == null || o.abort(), o = s = void 0, t.style.overflow = u;
      });
    },
    out($) {
      t.inert = !0, We(t, "outrostart"), f = Et(t, v(), o, 0, () => {
        We(t, "outroend"), $ == null || $();
      });
    },
    stop: () => {
      o == null || o.abort(), f == null || f.abort();
    }
  }, d = (
    /** @type {Effect} */
    b
  );
  if ((d.transitions ?? (d.transitions = [])).push(c), rt) {
    var h = i;
    if (!h) {
      for (var _ = (
        /** @type {Effect | null} */
        d.parent
      ); _ && (_.f & Be) !== 0; )
        for (; (_ = _.parent) && (_.f & it) === 0; )
          ;
      h = !_ || (_.f & It) !== 0;
    }
    h && kr(() => {
      Ht(() => c.in());
    });
  }
}
function Et(e, t, r, n, i) {
  var a = n === 1;
  if (_n(t)) {
    var s, l = !1;
    return Ut(() => {
      if (!l) {
        var $ = t({ direction: a ? "in" : "out" });
        s = Et(e, $, r, n, i);
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
      abort: qe,
      deactivate: qe,
      reset: qe,
      t: () => n
    };
  const { delay: u = 0, css: o, tick: f, easing: v = gi } = t;
  var c = [];
  if (a && r === void 0 && (f && f(0, 1), o)) {
    var d = rr(o(0, 1));
    c.push(d, d);
  }
  var h = () => 1 - n, _ = e.animate(c, { duration: u, fill: "forwards" });
  return _.onfinish = () => {
    _.cancel();
    var $ = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var p = n - $, E = (
      /** @type {number} */
      t.duration * Math.abs(p)
    ), C = [];
    if (E > 0) {
      var I = !1;
      if (o)
        for (var M = Math.ceil(E / 16.666666666666668), ne = 0; ne <= M; ne += 1) {
          var ie = $ + p * v(ne / M), ae = rr(o(ie, 1 - ie));
          C.push(ae), I || (I = ae.overflow === "hidden");
        }
      I && (e.style.overflow = "hidden"), h = () => {
        var g = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return $ + p * v(g / E);
      }, f && _i(() => {
        if (_.playState !== "running") return !1;
        var g = h();
        return f(g, 1 - g), !0;
      });
    }
    _ = e.animate(C, { duration: E, fill: "forwards" }), _.onfinish = () => {
      h = () => n, f == null || f(n, 1 - n), i();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = qe);
    },
    deactivate: () => {
      i = qe;
    },
    reset: () => {
      n === 0 && (f == null || f(1, 0));
    },
    t: () => h()
  };
}
function nr(e, t) {
  return e === t || (e == null ? void 0 : e[Xe]) === t;
}
function $i(e = {}, t, r, n) {
  return kr(() => {
    var i, a;
    return xr(() => {
      i = a, a = [], Ht(() => {
        e !== r(...a) && (t(e, ...a), i && nr(r(...i), e) && t(null, ...i));
      });
    }), () => {
      Ut(() => {
        a && nr(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function pe(e, t, r, n) {
  var i = (
    /** @type {V} */
    n
  ), a = !0, s = () => (a && (a = !1, i = /** @type {V} */
  n), i), l;
  l = /** @type {V} */
  e[t], l === void 0 && n !== void 0 && (l = s());
  var u;
  u = () => {
    var c = (
      /** @type {V} */
      e[t]
    );
    return c === void 0 ? s() : (a = !0, c);
  };
  var o = !1, f = /* @__PURE__ */ Lt(() => (o = !1, u())), v = (
    /** @type {Effect} */
    b
  );
  return function(c, d) {
    if (arguments.length > 0) {
      const h = d ? w(f) : c;
      return N(f, h), o = !0, i !== void 0 && (i = h), c;
    }
    return ce && o || (v.f & at) !== 0 ? f.v : w(f);
  };
}
function wi(e) {
  return new mi(e);
}
var J, B;
class mi {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    ct(this, J);
    /** @type {Record<string, any>} */
    ct(this, B);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, l) => {
      var u = /* @__PURE__ */ pr(l, !1, !1);
      return r.set(s, u), u;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, l) {
          return w(r.get(l) ?? n(l, Reflect.get(s, l)));
        },
        has(s, l) {
          return l === gn ? !0 : (w(r.get(l) ?? n(l, Reflect.get(s, l))), Reflect.has(s, l));
        },
        set(s, l, u) {
          return N(r.get(l) ?? n(l, u), u), Reflect.set(s, l, u);
        }
      }
    );
    dt(this, B, (t.hydrate ? ni : Ur)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && fe(), dt(this, J, i.$$events);
    for (const s of Object.keys(q(this, B)))
      s === "$set" || s === "$destroy" || s === "$on" || Je(this, s, {
        get() {
          return q(this, B)[s];
        },
        /** @param {any} value */
        set(l) {
          q(this, B)[s] = l;
        },
        enumerable: !0
      });
    q(this, B).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, q(this, B).$destroy = () => {
      ii(q(this, B));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    q(this, B).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    q(this, J)[t] = q(this, J)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return q(this, J)[t].push(n), () => {
      q(this, J)[t] = q(this, J)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    q(this, B).$destroy();
  }
}
J = new WeakMap(), B = new WeakMap();
let Kr;
typeof HTMLElement == "function" && (Kr = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    R(this, "$$ctor");
    /** Slots */
    R(this, "$$s");
    /** @type {any} The Svelte component instance */
    R(this, "$$c");
    /** Whether or not the custom element is connected */
    R(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    R(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    R(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    R(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    R(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    R(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    R(this, "$$me");
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
          i !== "default" && (s.name = i), ge(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = yi(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = Ke(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = wi({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Fn(() => {
        xr(() => {
          var i;
          this.$$r = !0;
          for (const a of ze(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = Ke(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ke(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function Ke(e, t, r, n) {
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
function yi(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function zr(e, t, r, n, i, a) {
  let s = class extends Kr {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return ze(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return ze(t).forEach((l) => {
    Je(s.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(u) {
        var v;
        u = Ke(l, u, t), this.$$d[l] = u;
        var o = this.$$c;
        if (o) {
          var f = (v = Ne(o, l)) == null ? void 0 : v.get;
          f ? o[l] = u : o.$set({ [l]: u });
        }
      }
    });
  }), n.forEach((l) => {
    Je(s.prototype, l, {
      get() {
        var u;
        return (u = this.$$c) == null ? void 0 : u[l];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let nt = /* @__PURE__ */ L(void 0);
const bi = async () => (N(nt, await window.loadCardHelpers().then((e) => e), !0), w(nt)), Ei = () => w(nt) ? w(nt) : bi();
function ki(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Jr(e, { delay: t = 0, duration: r = 400, easing: n = ki, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, l = i === "y" ? "height" : "width", u = parseFloat(a[l]), o = i === "y" ? ["top", "bottom"] : ["left", "right"], f = o.map(
    (p) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${p[0].toUpperCase()}${p.slice(1)}`
    )
  ), v = parseFloat(a[`padding${f[0]}`]), c = parseFloat(a[`padding${f[1]}`]), d = parseFloat(a[`margin${f[0]}`]), h = parseFloat(a[`margin${f[1]}`]), _ = parseFloat(
    a[`border${f[0]}Width`]
  ), $ = parseFloat(
    a[`border${f[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (p) => `overflow: hidden;opacity: ${Math.min(p * 20, 1) * s};${l}: ${p * u}px;padding-${o[0]}: ${p * v}px;padding-${o[1]}: ${p * c}px;margin-${o[0]}: ${p * d}px;margin-${o[1]}: ${p * h}px;border-${o[0]}-width: ${p * _}px;border-${o[1]}-width: ${p * $}px;min-${l}: 0`
  };
}
var xi = /* @__PURE__ */ Re('<span class="loading svelte-1sdlsm">Loading...</span>'), Ti = /* @__PURE__ */ Re('<div class="outer-container"><!> <!></div>');
const Ci = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function kt(e, t) {
  Mt(t, !0), Br(e, Ci);
  const r = pe(t, "type", 7, "div"), n = pe(t, "config"), i = pe(t, "hass"), a = pe(t, "marginTop", 7, "0px"), s = pe(t, "open");
  let l = /* @__PURE__ */ L(void 0), u = /* @__PURE__ */ L(!0);
  gt(() => {
    w(l) && (w(l).hass = i());
  }), gt(() => {
    var _, $;
    const h = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() };
    ($ = (_ = w(l)) == null ? void 0 : _.setConfig) == null || $.call(_, h);
  }), Hr(async () => {
    const d = await Ei(), _ = { type: "conditional", conditions: [
      {
        condition: "screen",
        media_query: s() ? "(max-width: 99999px)" : "(max-width: 0px)"
      }
    ], card: n() }, $ = d.createCardElement(_);
    $.hass = i(), w(l) && (w(l).replaceWith($), N(l, $, !0), N(u, !1));
  });
  var o = Ti(), f = he(o);
  oi(f, r, !1, (d, h) => {
    $i(d, (_) => N(l, _, !0), () => w(l)), Gr(3, d, () => Jr);
  });
  var v = Ge(f, 2);
  {
    var c = (d) => {
      var h = xi();
      ge(d, h);
    };
    yt(v, (d) => {
      w(u) && d(c);
    });
  }
  return se(o), _e(() => le(o, `margin-top: ${a() ?? ""};`)), ge(e, o), Ft({
    get type() {
      return r();
    },
    set type(d = "div") {
      r(d), fe();
    },
    get config() {
      return n();
    },
    set config(d) {
      n(d), fe();
    },
    get hass() {
      return i();
    },
    set hass(d) {
      i(d), fe();
    },
    get marginTop() {
      return a();
    },
    set marginTop(d = "0px") {
      a(d), fe();
    },
    get open() {
      return s();
    },
    set open(d) {
      s(d), fe();
    }
  });
}
customElements.define("expander-sub-card", zr(kt, { type: {}, config: {}, hass: {}, marginTop: {}, open: {} }, [], [], !0));
function Ni(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const xt = {
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
  icon: "mdi:chevron-down"
};
var Si = /* @__PURE__ */ Re('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), Ai = /* @__PURE__ */ Re("<button><div> </div> <ha-icon></ha-icon></button>", 2), Oi = /* @__PURE__ */ Re('<div class="children-container svelte-icqkke"></div>'), Ri = /* @__PURE__ */ Re("<ha-card><!> <!></ha-card>", 2);
const qi = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function Ii(e, t) {
  Mt(t, !0), Br(e, qi);
  const r = pe(t, "hass"), n = pe(t, "config", 7, xt);
  let i = /* @__PURE__ */ L(!1), a = /* @__PURE__ */ L(!1);
  const s = n()["storgage-id"], l = "expander-open-" + s;
  function u() {
    o(!w(a));
  }
  function o(g) {
    if (N(a, g, !0), s !== void 0)
      try {
        localStorage.setItem(l, w(a) ? "true" : "false");
      } catch (y) {
        console.error(y);
      }
  }
  Hr(() => {
    const g = n()["min-width-expanded"], y = n()["max-width-expanded"], x = document.body.offsetWidth;
    if (g && y ? n().expanded = x >= g && x <= y : g ? n().expanded = x >= g : y && (n().expanded = x <= y), s !== void 0)
      try {
        const H = localStorage.getItem(l);
        H === null ? n().expanded !== void 0 && o(n().expanded) : N(a, H ? H === "true" : w(a), !0);
      } catch (H) {
        console.error(H);
      }
    else
      n().expanded !== void 0 && o(n().expanded);
  });
  const f = (g) => {
    if (w(i))
      return g.preventDefault(), g.stopImmediatePropagation(), N(i, !1), !1;
    u();
  }, v = (g) => {
    const y = g.currentTarget;
    y != null && y.classList.contains("title-card-container") && f(g);
  };
  let c, d = !1, h = 0, _ = 0;
  const $ = (g) => {
    c = g.target, h = g.touches[0].clientX, _ = g.touches[0].clientY, d = !1;
  }, p = (g) => {
    const y = g.touches[0].clientX, x = g.touches[0].clientY;
    (Math.abs(y - h) > 10 || Math.abs(x - _) > 10) && (d = !0);
  }, E = (g) => {
    !d && c === g.target && n()["title-card-clickable"] && u(), c = void 0, N(i, !0);
  };
  var C = Ri(), I = he(C);
  {
    var M = (g) => {
      var y = Si(), x = he(y);
      x.__touchstart = $, x.__touchmove = p, x.__touchend = E, x.__click = function(...Zr) {
        var Vt;
        (Vt = n()["title-card-clickable"] ? v : null) == null || Vt.apply(this, Zr);
      };
      var H = he(x);
      kt(H, {
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
      }), se(x);
      var z = Ge(x, 2);
      z.__click = f;
      var ut = he(z);
      _e(() => tr(ut, "icon", n().icon)), se(z), se(y), _e(() => {
        ve(y, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-icqkke"), le(x, `--title-padding:${n()["title-card-padding"] ?? ""}`), jr(x, "role", n()["title-card-clickable"] ? "button" : void 0), le(z, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), ve(z, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${w(a) ? " open" : " close"}`, "svelte-icqkke"), le(ut, `--arrow-color:${n()["arrow-color"] ?? ""}`), ve(ut, 1, `ico${w(a) ? " flipped open" : "close"}`, "svelte-icqkke");
      }), ge(g, y);
    }, ne = (g) => {
      var y = Ai();
      y.__click = f;
      var x = he(y), H = he(x, !0);
      se(x);
      var z = Ge(x, 2);
      _e(() => tr(z, "icon", n().icon)), se(y), _e(() => {
        ve(y, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${w(a) ? " open" : " close"}`, "svelte-icqkke"), le(y, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), ve(x, 1, `primary title${w(a) ? " open" : " close"}`, "svelte-icqkke"), ri(H, n().title), le(z, `--arrow-color:${n()["arrow-color"] ?? ""}`), ve(z, 1, `ico${w(a) ? " flipped open" : " close"}`, "svelte-icqkke");
      }), ge(g, y);
    };
    yt(I, (g) => {
      n()["title-card"] ? g(M) : g(ne, !1);
    });
  }
  var ie = Ge(I, 2);
  {
    var ae = (g) => {
      var y = Oi();
      si(y, 20, () => n().cards, (x) => x, (x, H) => {
        kt(x, {
          get hass() {
            return r();
          },
          get config() {
            return H;
          },
          get type() {
            return H.type;
          },
          get marginTop() {
            return n()["child-margin-top"];
          },
          get open() {
            return w(a);
          }
        });
      }), se(y), _e(() => le(y, `--expander-card-display:${n()["expander-card-display"] ?? ""}
             --gap:${(w(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), Gr(3, y, () => Jr, () => ({ duration: 500, easing: Ni })), ge(g, y);
    };
    yt(ie, (g) => {
      n().cards && g(ae);
    });
  }
  return se(C), _e(() => {
    ve(C, 1, `expander-card${n().clear ? " clear" : ""}${w(a) ? " open" : " close"}`, "svelte-icqkke"), le(C, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(w(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${w(a) ?? ""};
     --card-background:${(w(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
  }), ge(e, C), Ft({
    get hass() {
      return r();
    },
    set hass(g) {
      r(g), fe();
    },
    get config() {
      return n();
    },
    set config(g = xt) {
      n(g), fe();
    }
  });
}
zn(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", zr(Ii, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    R(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...xt, ...r };
  }
}));
const Mi = "2.5.0";
console.info(
  `%c  Expander-Card 
%c Version ${Mi}`,
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
  Ii as default
};
//# sourceMappingURL=expander-card.js.map
