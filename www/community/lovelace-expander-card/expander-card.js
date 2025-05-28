var Wr = Object.defineProperty;
var Yt = (e) => {
  throw TypeError(e);
};
var Gr = (e, t, r) => t in e ? Wr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var B = (e, t, r) => Gr(e, typeof t != "symbol" ? t + "" : t, r), Ut = (e, t, r) => t.has(e) || Yt("Cannot " + r);
var O = (e, t, r) => (Ut(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ht = (e, t, r) => t.has(e) ? Yt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), _t = (e, t, r, n) => (Ut(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
const Xr = "5";
var tr;
typeof window < "u" && ((tr = window.__svelte ?? (window.__svelte = {})).v ?? (tr.v = /* @__PURE__ */ new Set())).add(Xr);
const Kr = 1, zr = 2, Jr = 16, Zr = 4, Qr = 1, en = 2, At = "[", Nt = "[!", St = "]", xe = {}, R = Symbol(), tn = "http://www.w3.org/1999/xhtml", rn = "http://www.w3.org/2000/svg", Vt = !1;
var Ot = Array.isArray, nn = Array.prototype.indexOf, Rt = Array.from, Ge = Object.keys, Xe = Object.defineProperty, Te = Object.getOwnPropertyDescriptor, an = Object.getOwnPropertyDescriptors, sn = Object.prototype, ln = Array.prototype, rr = Object.getPrototypeOf, Bt = Object.isExtensible;
function on(e) {
  return typeof e == "function";
}
const Re = () => {
};
function nr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const X = 2, ir = 4, it = 8, at = 16, ne = 32, $e = 64, Ke = 128, Y = 256, ze = 512, I = 1024, J = 2048, we = 4096, re = 8192, st = 16384, ar = 32768, Pe = 65536, fn = 1 << 19, sr = 1 << 20, gt = 1 << 21, Ve = Symbol("$state"), un = Symbol("legacy props"), cn = Symbol("");
function lr(e) {
  return e === this.v;
}
function dn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function or(e) {
  return !dn(e, this.v);
}
function vn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function hn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function _n(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function pn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function gn() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function $n() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function wn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let mn = !1;
function bn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let q = null;
function jt(e) {
  q = e;
}
function qt(e, t = !1, r) {
  var n = q = {
    p: q,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: e,
    x: null,
    l: null
  };
  An(() => {
    n.d = !0;
  });
}
function It(e) {
  const t = q;
  if (t !== null) {
    e !== void 0 && (t.x = e);
    const s = t.e;
    if (s !== null) {
      var r = m, n = b;
      t.e = null;
      try {
        for (var a = 0; a < s.length; a++) {
          var i = s[a];
          G(i.effect), M(i.reaction), ot(i.fn);
        }
      } finally {
        G(r), M(n);
      }
    }
    q = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
function fr() {
  return !0;
}
function ke(e) {
  if (typeof e != "object" || e === null || Ve in e)
    return e;
  const t = rr(e);
  if (t !== sn && t !== ln)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Ot(e), a = /* @__PURE__ */ P(0), i = b, s = (l) => {
    var u = b;
    M(i);
    var f = l();
    return M(u), f;
  };
  return n && r.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && $n();
        var c = r.get(u);
        return c === void 0 ? (c = s(() => /* @__PURE__ */ P(f.value)), r.set(u, c)) : A(
          c,
          s(() => ke(f.value))
        ), !0;
      },
      deleteProperty(l, u) {
        var f = r.get(u);
        if (f === void 0)
          u in l && (r.set(
            u,
            s(() => /* @__PURE__ */ P(R))
          ), pt(a));
        else {
          if (n && typeof u == "string") {
            var c = (
              /** @type {Source<number>} */
              r.get("length")
            ), d = Number(u);
            Number.isInteger(d) && d < c.v && A(c, d);
          }
          A(f, R), pt(a);
        }
        return !0;
      },
      get(l, u, f) {
        var v;
        if (u === Ve)
          return e;
        var c = r.get(u), d = u in l;
        if (c === void 0 && (!d || (v = Te(l, u)) != null && v.writable) && (c = s(() => /* @__PURE__ */ P(ke(d ? l[u] : R))), r.set(u, c)), c !== void 0) {
          var o = $(c);
          return o === R ? void 0 : o;
        }
        return Reflect.get(l, u, f);
      },
      getOwnPropertyDescriptor(l, u) {
        var f = Reflect.getOwnPropertyDescriptor(l, u);
        if (f && "value" in f) {
          var c = r.get(u);
          c && (f.value = $(c));
        } else if (f === void 0) {
          var d = r.get(u), o = d == null ? void 0 : d.v;
          if (d !== void 0 && o !== R)
            return {
              enumerable: !0,
              configurable: !0,
              value: o,
              writable: !0
            };
        }
        return f;
      },
      has(l, u) {
        var o;
        if (u === Ve)
          return !0;
        var f = r.get(u), c = f !== void 0 && f.v !== R || Reflect.has(l, u);
        if (f !== void 0 || m !== null && (!c || (o = Te(l, u)) != null && o.writable)) {
          f === void 0 && (f = s(() => /* @__PURE__ */ P(c ? ke(l[u]) : R)), r.set(u, f));
          var d = $(f);
          if (d === R)
            return !1;
        }
        return c;
      },
      set(l, u, f, c) {
        var E;
        var d = r.get(u), o = u in l;
        if (n && u === "length")
          for (var v = f; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var h = r.get(v + "");
            h !== void 0 ? A(h, R) : v in l && (h = s(() => /* @__PURE__ */ P(R)), r.set(v + "", h));
          }
        d === void 0 ? (!o || (E = Te(l, u)) != null && E.writable) && (d = s(() => /* @__PURE__ */ P(void 0)), A(
          d,
          s(() => ke(f))
        ), r.set(u, d)) : (o = d.v !== R, A(
          d,
          s(() => ke(f))
        ));
        var _ = Reflect.getOwnPropertyDescriptor(l, u);
        if (_ != null && _.set && _.set.call(c, f), !o) {
          if (n && typeof u == "string") {
            var y = (
              /** @type {Source<number>} */
              r.get("length")
            ), p = Number(u);
            Number.isInteger(p) && p >= y.v && A(y, p + 1);
          }
          pt(a);
        }
        return !0;
      },
      ownKeys(l) {
        $(a);
        var u = Reflect.ownKeys(l).filter((d) => {
          var o = r.get(d);
          return o === void 0 || o.v !== R;
        });
        for (var [f, c] of r)
          c.v !== R && !(f in l) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        wn();
      }
    }
  );
}
function pt(e, t = 1) {
  A(e, e.v + t);
}
// @__NO_SIDE_EFFECTS__
function Mt(e) {
  var t = X | J, r = b !== null && (b.f & X) !== 0 ? (
    /** @type {Derived} */
    b
  ) : null;
  return m === null || r !== null && (r.f & Y) !== 0 ? t |= Y : m.f |= sr, {
    ctx: q,
    deps: null,
    effects: null,
    equals: lr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: r ?? m
  };
}
// @__NO_SIDE_EFFECTS__
function kn(e) {
  const t = /* @__PURE__ */ Mt(e);
  return t.equals = or, t;
}
function ur(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      Z(
        /** @type {Effect} */
        t[r]
      );
  }
}
function En(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & X) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function cr(e) {
  var t, r = m;
  G(En(e));
  try {
    ur(e), t = Sr(e);
  } finally {
    G(r);
  }
  return t;
}
function dr(e) {
  var t = cr(e);
  if (e.equals(t) || (e.v = t, e.wv = Ar()), !Se) {
    var r = (ue || (e.f & Y) !== 0) && e.deps !== null ? we : I;
    K(e, r);
  }
}
const Me = /* @__PURE__ */ new Map();
function Je(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: lr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const r = Je(e);
  return Mn(r), r;
}
// @__NO_SIDE_EFFECTS__
function Lt(e, t = !1) {
  const r = Je(e);
  return t || (r.equals = or), r;
}
function A(e, t, r = !1) {
  b !== null && !z && fr() && (b.f & (X | at)) !== 0 && !(S != null && S.includes(e)) && yn();
  let n = r ? ke(t) : t;
  return xn(e, n);
}
function xn(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Se ? Me.set(e, t) : Me.set(e, r), e.v = t, (e.f & X) !== 0 && ((e.f & J) !== 0 && cr(
      /** @type {Derived} */
      e
    ), K(e, (e.f & Y) === 0 ? I : we)), e.wv = Ar(), vr(e, J), m !== null && (m.f & I) !== 0 && (m.f & (ne | $e)) === 0 && (j === null ? Ln([e]) : j.push(e));
  }
  return t;
}
function vr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, a = 0; a < n; a++) {
      var i = r[a], s = i.f;
      (s & J) === 0 && (K(i, t), (s & (I | Y)) !== 0 && ((s & X) !== 0 ? vr(
        /** @type {Derived} */
        i,
        we
      ) : ct(
        /** @type {Effect} */
        i
      )));
    }
}
function lt(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let w = !1;
function H(e) {
  w = e;
}
let T;
function U(e) {
  if (e === null)
    throw lt(), xe;
  return T = e;
}
function Ce() {
  return U(
    /** @type {TemplateNode} */
    /* @__PURE__ */ ye(T)
  );
}
function le(e) {
  if (w) {
    if (/* @__PURE__ */ ye(T) !== null)
      throw lt(), xe;
    T = e;
  }
}
function $t() {
  for (var e = 0, t = T; ; ) {
    if (t.nodeType === 8) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === St) {
        if (e === 0) return t;
        e -= 1;
      } else (r === At || r === Nt) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ye(t)
    );
    t.remove(), t = n;
  }
}
function hr(e) {
  if (!e || e.nodeType !== 8)
    throw lt(), xe;
  return (
    /** @type {Comment} */
    e.data
  );
}
var Wt, _r, pr, gr;
function wt() {
  if (Wt === void 0) {
    Wt = window, _r = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    pr = Te(t, "firstChild").get, gr = Te(t, "nextSibling").get, Bt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Bt(r) && (r.__t = void 0);
  }
}
function Ae(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ge(e) {
  return pr.call(e);
}
// @__NO_SIDE_EFFECTS__
function ye(e) {
  return gr.call(e);
}
function de(e, t) {
  if (!w)
    return /* @__PURE__ */ ge(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ ge(T)
  );
  if (r === null)
    r = T.appendChild(Ae());
  else if (t && r.nodeType !== 3) {
    var n = Ae();
    return r == null || r.before(n), U(n), n;
  }
  return U(r), r;
}
function Be(e, t = 1, r = !1) {
  let n = w ? T : e;
  for (var a; t--; )
    a = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ ye(n);
  if (!w)
    return n;
  var i = n == null ? void 0 : n.nodeType;
  if (r && i !== 3) {
    var s = Ae();
    return n === null ? a == null || a.after(s) : n.before(s), U(s), s;
  }
  return U(n), /** @type {TemplateNode} */
  n;
}
function $r(e) {
  e.textContent = "";
}
function Tn(e) {
  m === null && b === null && _n(), b !== null && (b.f & Y) !== 0 && m === null && hn(), Se && vn();
}
function Cn(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function me(e, t, r, n = !0) {
  var a = m, i = {
    ctx: q,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | J,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: a,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0
  };
  if (r)
    try {
      Pt(i), i.f |= ar;
    } catch (u) {
      throw Z(i), u;
    }
  else t !== null && ct(i);
  var s = r && i.deps === null && i.first === null && i.nodes_start === null && i.teardown === null && (i.f & (sr | Ke)) === 0;
  if (!s && n && (a !== null && Cn(i, a), b !== null && (b.f & X) !== 0)) {
    var l = (
      /** @type {Derived} */
      b
    );
    (l.effects ?? (l.effects = [])).push(i);
  }
  return i;
}
function An(e) {
  const t = me(it, null, !1);
  return K(t, I), t.teardown = e, t;
}
function wr(e) {
  Tn();
  var t = m !== null && (m.f & ne) !== 0 && q !== null && !q.m;
  if (t) {
    var r = (
      /** @type {ComponentContext} */
      q
    );
    (r.e ?? (r.e = [])).push({
      fn: e,
      effect: m,
      reaction: b
    });
  } else {
    var n = ot(e);
    return n;
  }
}
function Nn(e) {
  const t = me($e, e, !0);
  return () => {
    Z(t);
  };
}
function Sn(e) {
  const t = me($e, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Le(t, () => {
      Z(t), n(void 0);
    }) : (Z(t), n(void 0));
  });
}
function ot(e) {
  return me(ir, e, !1);
}
function yr(e) {
  return me(it, e, !0);
}
function ve(e, t = [], r = Mt) {
  const n = t.map(r);
  return ft(() => e(...n.map($)));
}
function ft(e, t = 0) {
  return me(it | at | t, e, !0);
}
function Ne(e, t = !0) {
  return me(it | ne, e, !0, t);
}
function mr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Se, n = b;
    Gt(!0), M(null);
    try {
      t.call(null);
    } finally {
      Gt(r), M(n);
    }
  }
}
function br(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    var n = r.next;
    (r.f & $e) !== 0 ? r.parent = null : Z(r, t), r = n;
  }
}
function On(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ne) === 0 && Z(t), t = r;
  }
}
function Z(e, t = !0) {
  var r = !1;
  (t || (e.f & fn) !== 0) && e.nodes_start !== null && (Rn(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), br(e, t && !r), tt(e, 0), K(e, st);
  var n = e.transitions;
  if (n !== null)
    for (const i of n)
      i.stop();
  mr(e);
  var a = e.parent;
  a !== null && a.first !== null && kr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = null;
}
function Rn(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ye(e)
    );
    e.remove(), e = r;
  }
}
function kr(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Le(e, t) {
  var r = [];
  Dt(e, r, !0), Er(r, () => {
    Z(e), t && t();
  });
}
function Er(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var a of e)
      a.out(n);
  } else
    t();
}
function Dt(e, t, r) {
  if ((e.f & re) === 0) {
    if (e.f ^= re, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var a = n.next, i = (n.f & Pe) !== 0 || (n.f & ne) !== 0;
      Dt(n, t, i ? r : !1), n = a;
    }
  }
}
function De(e) {
  xr(e, !0);
}
function xr(e, t) {
  if ((e.f & re) !== 0) {
    e.f ^= re, (e.f & I) === 0 && (e.f ^= I), He(e) && (K(e, J), ct(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, a = (r.f & Pe) !== 0 || (r.f & ne) !== 0;
      xr(r, a ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const i of e.transitions)
        (i.is_global || t) && i.in();
  }
}
let Fe = [], yt = [];
function Tr() {
  var e = Fe;
  Fe = [], nr(e);
}
function qn() {
  var e = yt;
  yt = [], nr(e);
}
function Ft(e) {
  Fe.length === 0 && queueMicrotask(Tr), Fe.push(e);
}
function In() {
  Fe.length > 0 && Tr(), yt.length > 0 && qn();
}
let je = !1, Ze = !1, Qe = null, pe = !1, Se = !1;
function Gt(e) {
  Se = e;
}
let qe = [];
let b = null, z = !1;
function M(e) {
  b = e;
}
let m = null;
function G(e) {
  m = e;
}
let S = null;
function Mn(e) {
  b !== null && b.f & gt && (S === null ? S = [e] : S.push(e));
}
let N = null, F = 0, j = null;
function Ln(e) {
  j = e;
}
let Cr = 1, et = 0, ue = !1;
function Ar() {
  return ++Cr;
}
function He(e) {
  var d;
  var t = e.f;
  if ((t & J) !== 0)
    return !0;
  if ((t & we) !== 0) {
    var r = e.deps, n = (t & Y) !== 0;
    if (r !== null) {
      var a, i, s = (t & ze) !== 0, l = n && m !== null && !ue, u = r.length;
      if (s || l) {
        var f = (
          /** @type {Derived} */
          e
        ), c = f.parent;
        for (a = 0; a < u; a++)
          i = r[a], (s || !((d = i == null ? void 0 : i.reactions) != null && d.includes(f))) && (i.reactions ?? (i.reactions = [])).push(f);
        s && (f.f ^= ze), l && c !== null && (c.f & Y) === 0 && (f.f ^= Y);
      }
      for (a = 0; a < u; a++)
        if (i = r[a], He(
          /** @type {Derived} */
          i
        ) && dr(
          /** @type {Derived} */
          i
        ), i.wv > e.wv)
          return !0;
    }
    (!n || m !== null && !ue) && K(e, I);
  }
  return !1;
}
function Dn(e, t) {
  for (var r = t; r !== null; ) {
    if ((r.f & Ke) !== 0)
      try {
        r.fn(e);
        return;
      } catch {
        r.f ^= Ke;
      }
    r = r.parent;
  }
  throw je = !1, e;
}
function Xt(e) {
  return (e.f & st) === 0 && (e.parent === null || (e.parent.f & Ke) === 0);
}
function ut(e, t, r, n) {
  if (je) {
    if (r === null && (je = !1), Xt(t))
      throw e;
    return;
  }
  if (r !== null && (je = !0), Dn(e, t), Xt(t))
    throw e;
}
function Nr(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null)
    for (var a = 0; a < n.length; a++) {
      var i = n[a];
      S != null && S.includes(e) || ((i.f & X) !== 0 ? Nr(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? K(i, J) : (i.f & I) !== 0 && K(i, we), ct(
        /** @type {Effect} */
        i
      )));
    }
}
function Sr(e) {
  var v;
  var t = N, r = F, n = j, a = b, i = ue, s = S, l = q, u = z, f = e.f;
  N = /** @type {null | Value[]} */
  null, F = 0, j = null, ue = (f & Y) !== 0 && (z || !pe || b === null), b = (f & (ne | $e)) === 0 ? e : null, S = null, jt(e.ctx), z = !1, et++, e.f |= gt;
  try {
    var c = (
      /** @type {Function} */
      (0, e.fn)()
    ), d = e.deps;
    if (N !== null) {
      var o;
      if (tt(e, F), d !== null && F > 0)
        for (d.length = F + N.length, o = 0; o < N.length; o++)
          d[F + o] = N[o];
      else
        e.deps = d = N;
      if (!ue)
        for (o = F; o < d.length; o++)
          ((v = d[o]).reactions ?? (v.reactions = [])).push(e);
    } else d !== null && F < d.length && (tt(e, F), d.length = F);
    if (fr() && j !== null && !z && d !== null && (e.f & (X | we | J)) === 0)
      for (o = 0; o < /** @type {Source[]} */
      j.length; o++)
        Nr(
          j[o],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (et++, j !== null && (n === null ? n = j : n.push(.../** @type {Source[]} */
    j))), c;
  } finally {
    N = t, F = r, j = n, b = a, ue = i, S = s, jt(l), z = u, e.f ^= gt;
  }
}
function Fn(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = nn.call(r, e);
    if (n !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[n] = r[a], r.pop());
    }
  }
  r === null && (t.f & X) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (N === null || !N.includes(t)) && (K(t, we), (t.f & (Y | ze)) === 0 && (t.f ^= ze), ur(
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
      Fn(e, r[n]);
}
function Pt(e) {
  var t = e.f;
  if ((t & st) === 0) {
    K(e, I);
    var r = m, n = q, a = pe;
    m = e, pe = !0;
    try {
      (t & at) !== 0 ? On(e) : br(e), mr(e);
      var i = Sr(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Cr;
      var s = e.deps, l;
      Vt && mn && e.f & J;
    } catch (u) {
      ut(u, e, r, n || e.ctx);
    } finally {
      pe = a, m = r;
    }
  }
}
function Pn() {
  try {
    pn();
  } catch (e) {
    if (Qe !== null)
      ut(e, Qe, null);
    else
      throw e;
  }
}
function Or() {
  var e = pe;
  try {
    var t = 0;
    for (pe = !0; qe.length > 0; ) {
      t++ > 1e3 && Pn();
      var r = qe, n = r.length;
      qe = [];
      for (var a = 0; a < n; a++) {
        var i = Yn(r[a]);
        Hn(i);
      }
      Me.clear();
    }
  } finally {
    Ze = !1, pe = e, Qe = null;
  }
}
function Hn(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var n = e[r];
      if ((n.f & (st | re)) === 0)
        try {
          He(n) && (Pt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? kr(n) : n.fn = null));
        } catch (a) {
          ut(a, n, null, n.ctx);
        }
    }
}
function ct(e) {
  Ze || (Ze = !0, queueMicrotask(Or));
  for (var t = Qe = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if ((r & ($e | ne)) !== 0) {
      if ((r & I) === 0) return;
      t.f ^= I;
    }
  }
  qe.push(t);
}
function Yn(e) {
  for (var t = [], r = e; r !== null; ) {
    var n = r.f, a = (n & (ne | $e)) !== 0, i = a && (n & I) !== 0;
    if (!i && (n & re) === 0) {
      if ((n & ir) !== 0)
        t.push(r);
      else if (a)
        r.f ^= I;
      else
        try {
          He(r) && Pt(r);
        } catch (u) {
          ut(u, r, null, r.ctx);
        }
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
function he(e) {
  for (var t; ; ) {
    if (In(), qe.length === 0)
      return (
        /** @type {T} */
        t
      );
    Ze = !0, Or();
  }
}
function $(e) {
  var t = e.f, r = (t & X) !== 0;
  if (b !== null && !z) {
    if (!(S != null && S.includes(e))) {
      var n = b.deps;
      e.rv < et && (e.rv = et, N === null && n !== null && n[F] === e ? F++ : N === null ? N = [e] : (!ue || !N.includes(e)) && N.push(e));
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var a = (
      /** @type {Derived} */
      e
    ), i = a.parent;
    i !== null && (i.f & Y) === 0 && (a.f ^= Y);
  }
  return r && (a = /** @type {Derived} */
  e, He(a) && dr(a)), Se && Me.has(e) ? Me.get(e) : e.v;
}
function dt(e) {
  var t = z;
  try {
    return z = !0, e();
  } finally {
    z = t;
  }
}
const Un = -7169;
function K(e, t) {
  e.f = e.f & Un | t;
}
function Vn(e) {
  var t = b, r = m;
  M(null), G(null);
  try {
    return e();
  } finally {
    M(t), G(r);
  }
}
const Rr = /* @__PURE__ */ new Set(), mt = /* @__PURE__ */ new Set();
function Bn(e) {
  for (var t = 0; t < e.length; t++)
    Rr.add(e[t]);
  for (var r of mt)
    r(e);
}
function Ye(e) {
  var E;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, a = ((E = e.composedPath) == null ? void 0 : E.call(e)) || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  ), s = 0, l = e.__root;
  if (l) {
    var u = a.indexOf(l);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = a.indexOf(t);
    if (f === -1)
      return;
    u <= f && (s = u);
  }
  if (i = /** @type {Element} */
  a[s] || e.target, i !== t) {
    Xe(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || r;
      }
    });
    var c = b, d = m;
    M(null), G(null);
    try {
      for (var o, v = []; i !== null; ) {
        var h = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var _ = i["__" + n];
          if (_ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i))
            if (Ot(_)) {
              var [y, ...p] = _;
              y.apply(i, [e, ...p]);
            } else
              _.call(i, e);
        } catch (C) {
          o ? v.push(C) : o = C;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        i = h;
      }
      if (o) {
        for (let C of v)
          queueMicrotask(() => {
            throw C;
          });
        throw o;
      }
    } finally {
      e.__root = t, delete e.currentTarget, M(c), G(d);
    }
  }
}
function jn(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ie(e, t) {
  var r = (
    /** @type {Effect} */
    m
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Oe(e, t) {
  var r = (t & Qr) !== 0, n = (t & en) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    if (w)
      return Ie(T, null), T;
    a === void 0 && (a = jn(i ? e : "<!>" + e), r || (a = /** @type {Node} */
    /* @__PURE__ */ ge(a)));
    var s = (
      /** @type {TemplateNode} */
      n || _r ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ge(s)
      ), u = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ie(l, u);
    } else
      Ie(s, s);
    return s;
  };
}
function _e(e, t) {
  if (w) {
    m.nodes_end = T, Ce();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Wn = ["touchstart", "touchmove"];
function Gn(e) {
  return Wn.includes(e);
}
const Xn = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Kn(e) {
  return Xn.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let rt = !0;
function Kt(e) {
  rt = e;
}
function zn(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function qr(e, t) {
  return Ir(e, t);
}
function Jn(e, t) {
  wt(), t.intro = t.intro ?? !1;
  const r = t.target, n = w, a = T;
  try {
    for (var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ge(r)
    ); i && (i.nodeType !== 8 || /** @type {Comment} */
    i.data !== At); )
      i = /** @type {TemplateNode} */
      /* @__PURE__ */ ye(i);
    if (!i)
      throw xe;
    H(!0), U(
      /** @type {Comment} */
      i
    ), Ce();
    const s = Ir(e, { ...t, anchor: i });
    if (T === null || T.nodeType !== 8 || /** @type {Comment} */
    T.data !== St)
      throw lt(), xe;
    return H(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === xe)
      return t.recover === !1 && gn(), wt(), $r(r), H(!1), qr(e, t);
    throw s;
  } finally {
    H(n), U(a);
  }
}
const be = /* @__PURE__ */ new Map();
function Ir(e, { target: t, anchor: r, props: n = {}, events: a, context: i, intro: s = !0 }) {
  wt();
  var l = /* @__PURE__ */ new Set(), u = (d) => {
    for (var o = 0; o < d.length; o++) {
      var v = d[o];
      if (!l.has(v)) {
        l.add(v);
        var h = Gn(v);
        t.addEventListener(v, Ye, { passive: h });
        var _ = be.get(v);
        _ === void 0 ? (document.addEventListener(v, Ye, { passive: h }), be.set(v, 1)) : be.set(v, _ + 1);
      }
    }
  };
  u(Rt(Rr)), mt.add(u);
  var f = void 0, c = Sn(() => {
    var d = r ?? t.appendChild(Ae());
    return Ne(() => {
      if (i) {
        qt({});
        var o = (
          /** @type {ComponentContext} */
          q
        );
        o.c = i;
      }
      a && (n.$$events = a), w && Ie(
        /** @type {TemplateNode} */
        d,
        null
      ), rt = s, f = e(d, n) || {}, rt = !0, w && (m.nodes_end = T), i && It();
    }), () => {
      var h;
      for (var o of l) {
        t.removeEventListener(o, Ye);
        var v = (
          /** @type {number} */
          be.get(o)
        );
        --v === 0 ? (document.removeEventListener(o, Ye), be.delete(o)) : be.set(o, v);
      }
      mt.delete(u), d !== r && ((h = d.parentNode) == null || h.removeChild(d));
    };
  });
  return bt.set(f, c), f;
}
let bt = /* @__PURE__ */ new WeakMap();
function Zn(e, t) {
  const r = bt.get(e);
  return r ? (bt.delete(e), r(t)) : Promise.resolve();
}
function Mr(e) {
  q === null && bn(), wr(() => {
    const t = dt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function kt(e, t, [r, n] = [0, 0]) {
  w && r === 0 && Ce();
  var a = e, i = null, s = null, l = R, u = r > 0 ? Pe : 0, f = !1;
  const c = (o, v = !0) => {
    f = !0, d(v, o);
  }, d = (o, v) => {
    if (l === (l = o)) return;
    let h = !1;
    if (w && n !== -1) {
      if (r === 0) {
        const y = hr(a);
        y === At ? n = 0 : y === Nt ? n = 1 / 0 : (n = parseInt(y.substring(1)), n !== n && (n = l ? 1 / 0 : -1));
      }
      const _ = n > r;
      !!l === _ && (a = $t(), U(a), H(!1), h = !0, n = -1);
    }
    l ? (i ? De(i) : v && (i = Ne(() => v(a))), s && Le(s, () => {
      s = null;
    })) : (s ? De(s) : v && (s = Ne(() => v(a, [r + 1, n]))), i && Le(i, () => {
      i = null;
    })), h && H(!0);
  };
  ft(() => {
    f = !1, t(c), f || d(null, null);
  }, u), w && (a = T);
}
function Qn(e, t, r, n) {
  for (var a = [], i = t.length, s = 0; s < i; s++)
    Dt(t[s].e, a, !0);
  var l = i > 0 && a.length === 0 && r !== null;
  if (l) {
    var u = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    $r(u), u.append(
      /** @type {Element} */
      r
    ), n.clear(), fe(e, t[0].prev, t[i - 1].next);
  }
  Er(a, () => {
    for (var f = 0; f < i; f++) {
      var c = t[f];
      l || (n.delete(c.k), fe(e, c.prev, c.next)), Z(c.e, !l);
    }
  });
}
function ei(e, t, r, n, a, i = null) {
  var s = e, l = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var u = (
      /** @type {Element} */
      e
    );
    s = w ? U(
      /** @type {Comment | Text} */
      /* @__PURE__ */ ge(u)
    ) : u.appendChild(Ae());
  }
  w && Ce();
  var f = null, c = !1, d = /* @__PURE__ */ kn(() => {
    var o = r();
    return Ot(o) ? o : o == null ? [] : Rt(o);
  });
  ft(() => {
    var o = $(d), v = o.length;
    if (c && v === 0)
      return;
    c = v === 0;
    let h = !1;
    if (w) {
      var _ = hr(s) === Nt;
      _ !== (v === 0) && (s = $t(), U(s), H(!1), h = !0);
    }
    if (w) {
      for (var y = null, p, E = 0; E < v; E++) {
        if (T.nodeType === 8 && /** @type {Comment} */
        T.data === St) {
          s = /** @type {Comment} */
          T, h = !0, H(!1);
          break;
        }
        var C = o[E], L = n(C, E);
        p = Lr(
          T,
          l,
          y,
          null,
          C,
          L,
          E,
          a,
          t,
          r
        ), l.items.set(L, p), y = p;
      }
      v > 0 && U($t());
    }
    w || ti(o, l, s, a, t, n, r), i !== null && (v === 0 ? f ? De(f) : f = Ne(() => i(s)) : f !== null && Le(f, () => {
      f = null;
    })), h && H(!0), $(d);
  }), w && (s = T);
}
function ti(e, t, r, n, a, i, s) {
  var l = e.length, u = t.items, f = t.first, c = f, d, o = null, v = [], h = [], _, y, p, E;
  for (E = 0; E < l; E += 1) {
    if (_ = e[E], y = i(_, E), p = u.get(y), p === void 0) {
      var C = c ? (
        /** @type {TemplateNode} */
        c.e.nodes_start
      ) : r;
      o = Lr(
        C,
        t,
        o,
        o === null ? t.first : o.next,
        _,
        y,
        E,
        n,
        a,
        s
      ), u.set(y, o), v = [], h = [], c = o.next;
      continue;
    }
    if ((p.e.f & re) !== 0 && De(p.e), p !== c) {
      if (d !== void 0 && d.has(p)) {
        if (v.length < h.length) {
          var L = h[0], D;
          o = L.prev;
          var ie = v[0], ae = v[v.length - 1];
          for (D = 0; D < v.length; D += 1)
            zt(v[D], L, r);
          for (D = 0; D < h.length; D += 1)
            d.delete(h[D]);
          fe(t, ie.prev, ae.next), fe(t, o, ie), fe(t, ae, L), c = L, o = ae, E -= 1, v = [], h = [];
        } else
          d.delete(p), zt(p, c, r), fe(t, p.prev, p.next), fe(t, p, o === null ? t.first : o.next), fe(t, o, p), o = p;
        continue;
      }
      for (v = [], h = []; c !== null && c.k !== y; )
        (c.e.f & re) === 0 && (d ?? (d = /* @__PURE__ */ new Set())).add(c), h.push(c), c = c.next;
      if (c === null)
        continue;
      p = c;
    }
    v.push(p), o = p, c = p.next;
  }
  if (c !== null || d !== void 0) {
    for (var se = d === void 0 ? [] : Rt(d); c !== null; )
      (c.e.f & re) === 0 && se.push(c), c = c.next;
    var g = se.length;
    if (g > 0) {
      var k = l === 0 ? r : null;
      Qn(t, se, k, u);
    }
  }
  m.first = t.first && t.first.e, m.last = o && o.e;
}
function Lr(e, t, r, n, a, i, s, l, u, f) {
  var c = (u & Kr) !== 0, d = (u & Jr) === 0, o = c ? d ? /* @__PURE__ */ Lt(a) : Je(a) : a, v = (u & zr) === 0 ? s : Je(s), h = {
    i: v,
    v: o,
    k: i,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: n
  };
  try {
    return h.e = Ne(() => l(e, o, v, f), w), h.e.prev = r && r.e, h.e.next = n && n.e, r === null ? t.first = h : (r.next = h, r.e.next = h.e), n !== null && (n.prev = h, n.e.prev = h.e), h;
  } finally {
  }
}
function zt(e, t, r) {
  for (var n = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : r, a = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : r, i = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); i !== n; ) {
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ye(i)
    );
    a.before(i), i = s;
  }
}
function fe(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function ri(e, t, r, n, a, i) {
  let s = w;
  w && Ce();
  var l, u, f = null;
  w && T.nodeType === 1 && (f = /** @type {Element} */
  T, Ce());
  var c = (
    /** @type {TemplateNode} */
    w ? T : e
  ), d;
  ft(() => {
    const o = t() || null;
    var v = o === "svg" ? rn : null;
    o !== l && (d && (o === null ? Le(d, () => {
      d = null, u = null;
    }) : o === u ? De(d) : (Z(d), Kt(!1))), o && o !== u && (d = Ne(() => {
      if (f = w ? (
        /** @type {Element} */
        f
      ) : v ? document.createElementNS(v, o) : document.createElement(o), Ie(f, f), n) {
        w && Kn(o) && f.append(document.createComment(""));
        var h = (
          /** @type {TemplateNode} */
          w ? /* @__PURE__ */ ge(f) : f.appendChild(Ae())
        );
        w && (h === null ? H(!1) : U(h)), n(f, h);
      }
      m.nodes_end = f, c.before(f);
    })), l = o, l && (u = l), Kt(!0));
  }, Pe), s && (H(!0), U(c));
}
function Dr(e, t) {
  Ft(() => {
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
      const a = document.createElement("style");
      a.id = t.hash, a.textContent = t.code, n.appendChild(a);
    }
  });
}
function ni(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function ii(e, t) {
  return e == null ? null : String(e);
}
function ce(e, t, r, n, a, i) {
  var s = e.__className;
  if (w || s !== r || s === void 0) {
    var l = ni(r, n);
    (!w || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : e.className = l), e.__className = r;
  }
  return i;
}
function oe(e, t, r, n) {
  var a = e.__style;
  if (w || a !== t) {
    var i = ii(t);
    (!w || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return n;
}
const ai = Symbol("is custom element"), si = Symbol("is html");
function Fr(e, t, r, n) {
  var a = li(e);
  w && (a[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || a[t] !== (a[t] = r) && (t === "loading" && (e[cn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Pr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Jt(e, t, r) {
  var n = b, a = m;
  let i = w;
  w && H(!1), M(null), G(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (Et.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? Pr(e).includes(t) : r && typeof r == "object") ? e[t] = r : Fr(e, t, r == null ? r : String(r));
  } finally {
    M(n), G(a), i && H(!0);
  }
}
function li(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ai]: e.nodeName.includes("-"),
      [si]: e.namespaceURI === tn
    })
  );
}
var Et = /* @__PURE__ */ new Map();
function Pr(e) {
  var t = Et.get(e.nodeName);
  if (t) return t;
  Et.set(e.nodeName, t = []);
  for (var r, n = e, a = Element.prototype; a !== n; ) {
    r = an(n);
    for (var i in r)
      r[i].set && t.push(i);
    n = rr(n);
  }
  return t;
}
const oi = () => performance.now(), te = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => oi(),
  tasks: /* @__PURE__ */ new Set()
};
function Hr() {
  const e = te.now();
  te.tasks.forEach((t) => {
    t.c(e) || (te.tasks.delete(t), t.f());
  }), te.tasks.size !== 0 && te.tick(Hr);
}
function fi(e) {
  let t;
  return te.tasks.size === 0 && te.tick(Hr), {
    promise: new Promise((r) => {
      te.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      te.tasks.delete(t);
    }
  };
}
function Ue(e, t) {
  Vn(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function ui(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Zt(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [a, i] = n.split(":");
    if (!a || i === void 0) break;
    const s = ui(a.trim());
    t[s] = i.trim();
  }
  return t;
}
const ci = (e) => e;
function Yr(e, t, r, n) {
  var a = (e & Zr) !== 0, i = "both", s, l = t.inert, u = t.style.overflow, f, c;
  function d() {
    var y = b, p = m;
    M(null), G(null);
    try {
      return s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
      {}, {
        direction: i
      }));
    } finally {
      M(y), G(p);
    }
  }
  var o = {
    is_global: a,
    in() {
      t.inert = l, Ue(t, "introstart"), f = xt(t, d(), c, 1, () => {
        Ue(t, "introend"), f == null || f.abort(), f = s = void 0, t.style.overflow = u;
      });
    },
    out(y) {
      t.inert = !0, Ue(t, "outrostart"), c = xt(t, d(), f, 0, () => {
        Ue(t, "outroend"), y == null || y();
      });
    },
    stop: () => {
      f == null || f.abort(), c == null || c.abort();
    }
  }, v = (
    /** @type {Effect} */
    m
  );
  if ((v.transitions ?? (v.transitions = [])).push(o), rt) {
    var h = a;
    if (!h) {
      for (var _ = (
        /** @type {Effect | null} */
        v.parent
      ); _ && (_.f & Pe) !== 0; )
        for (; (_ = _.parent) && (_.f & at) === 0; )
          ;
      h = !_ || (_.f & ar) !== 0;
    }
    h && ot(() => {
      dt(() => o.in());
    });
  }
}
function xt(e, t, r, n, a) {
  var i = n === 1;
  if (on(t)) {
    var s, l = !1;
    return Ft(() => {
      if (!l) {
        var y = t({ direction: i ? "in" : "out" });
        s = xt(e, y, r, n, a);
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
    return a(), {
      abort: Re,
      deactivate: Re,
      reset: Re,
      t: () => n
    };
  const { delay: u = 0, css: f, tick: c, easing: d = ci } = t;
  var o = [];
  if (i && r === void 0 && (c && c(0, 1), f)) {
    var v = Zt(f(0, 1));
    o.push(v, v);
  }
  var h = () => 1 - n, _ = e.animate(o, { duration: u });
  return _.onfinish = () => {
    var y = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var p = n - y, E = (
      /** @type {number} */
      t.duration * Math.abs(p)
    ), C = [];
    if (E > 0) {
      var L = !1;
      if (f)
        for (var D = Math.ceil(E / 16.666666666666668), ie = 0; ie <= D; ie += 1) {
          var ae = y + p * d(ie / D), se = Zt(f(ae, 1 - ae));
          C.push(se), L || (L = se.overflow === "hidden");
        }
      L && (e.style.overflow = "hidden"), h = () => {
        var g = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return y + p * d(g / E);
      }, c && fi(() => {
        if (_.playState !== "running") return !1;
        var g = h();
        return c(g, 1 - g), !0;
      });
    }
    _ = e.animate(C, { duration: E, fill: "forwards" }), _.onfinish = () => {
      h = () => n, c == null || c(n, 1 - n), a();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = Re);
    },
    deactivate: () => {
      a = Re;
    },
    reset: () => {
      n === 0 && (c == null || c(1, 0));
    },
    t: () => h()
  };
}
function Qt(e, t) {
  return e === t || (e == null ? void 0 : e[Ve]) === t;
}
function di(e = {}, t, r, n) {
  return ot(() => {
    var a, i;
    return yr(() => {
      a = i, i = [], dt(() => {
        e !== r(...i) && (t(e, ...i), a && Qt(r(...a), e) && t(null, ...a));
      });
    }), () => {
      Ft(() => {
        i && Qt(r(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
function er(e) {
  var t;
  return ((t = e.ctx) == null ? void 0 : t.d) ?? !1;
}
function Ee(e, t, r, n) {
  var a;
  a = /** @type {V} */
  e[t];
  var i = (
    /** @type {V} */
    n
  ), s = !0, l = !1, u = () => (l = !0, s && (s = !1, i = /** @type {V} */
  n), i);
  a === void 0 && n !== void 0 && (a = u());
  var f;
  f = () => {
    var v = (
      /** @type {V} */
      e[t]
    );
    return v === void 0 ? u() : (s = !0, l = !1, v);
  };
  var c = !1, d = /* @__PURE__ */ Lt(a), o = /* @__PURE__ */ Mt(() => {
    var v = f(), h = $(d);
    return c ? (c = !1, h) : d.v = v;
  });
  return function(v, h) {
    if (arguments.length > 0) {
      const _ = h ? $(o) : v;
      if (!o.equals(_)) {
        if (c = !0, A(d, _), l && i !== void 0 && (i = _), er(o))
          return v;
        dt(() => $(o));
      }
      return v;
    }
    return er(o) ? o.v : $(o);
  };
}
function vi(e) {
  return new hi(e);
}
var ee, W;
class hi {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    ht(this, ee);
    /** @type {Record<string, any>} */
    ht(this, W);
    var i;
    var r = /* @__PURE__ */ new Map(), n = (s, l) => {
      var u = /* @__PURE__ */ Lt(l);
      return r.set(s, u), u;
    };
    const a = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, l) {
          return $(r.get(l) ?? n(l, Reflect.get(s, l)));
        },
        has(s, l) {
          return l === un ? !0 : ($(r.get(l) ?? n(l, Reflect.get(s, l))), Reflect.has(s, l));
        },
        set(s, l, u) {
          return A(r.get(l) ?? n(l, u), u), Reflect.set(s, l, u);
        }
      }
    );
    _t(this, W, (t.hydrate ? Jn : qr)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: a,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && he(), _t(this, ee, a.$$events);
    for (const s of Object.keys(O(this, W)))
      s === "$set" || s === "$destroy" || s === "$on" || Xe(this, s, {
        get() {
          return O(this, W)[s];
        },
        /** @param {any} value */
        set(l) {
          O(this, W)[s] = l;
        },
        enumerable: !0
      });
    O(this, W).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(a, s);
    }, O(this, W).$destroy = () => {
      Zn(O(this, W));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    O(this, W).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    O(this, ee)[t] = O(this, ee)[t] || [];
    const n = (...a) => r.call(this, ...a);
    return O(this, ee)[t].push(n), () => {
      O(this, ee)[t] = O(this, ee)[t].filter(
        /** @param {any} fn */
        (a) => a !== n
      );
    };
  }
  $destroy() {
    O(this, W).$destroy();
  }
}
ee = new WeakMap(), W = new WeakMap();
let Ur;
typeof HTMLElement == "function" && (Ur = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    B(this, "$$ctor");
    /** Slots */
    B(this, "$$s");
    /** @type {any} The Svelte component instance */
    B(this, "$$c");
    /** Whether or not the custom element is connected */
    B(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    B(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    B(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    B(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    B(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    B(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    B(this, "$$me");
    this.$$ctor = t, this.$$s = r, n && this.attachShadow({ mode: "open" });
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(t, r, n) {
    if (this.$$l[t] = this.$$l[t] || [], this.$$l[t].push(r), this.$$c) {
      const a = this.$$c.$on(t, r);
      this.$$l_u.set(r, a);
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
      const a = this.$$l_u.get(r);
      a && (a(), this.$$l_u.delete(r));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(a) {
        return (i) => {
          const s = document.createElement("slot");
          a !== "default" && (s.name = a), _e(i, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = _i(this);
      for (const a of this.$$s)
        a in n && (a === "default" && !this.$$d.children ? (this.$$d.children = t(a), r.default = !0) : r[a] = t(a));
      for (const a of this.attributes) {
        const i = this.$$g_p(a.name);
        i in this.$$d || (this.$$d[i] = We(i, a.value, this.$$p_d, "toProp"));
      }
      for (const a in this.$$p_d)
        !(a in this.$$d) && this[a] !== void 0 && (this.$$d[a] = this[a], delete this[a]);
      this.$$c = vi({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Nn(() => {
        yr(() => {
          var a;
          this.$$r = !0;
          for (const i of Ge(this.$$c)) {
            if (!((a = this.$$p_d[i]) != null && a.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const s = We(
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
  attributeChangedCallback(t, r, n) {
    var a;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = We(t, n, this.$$p_d, "toProp"), (a = this.$$c) == null || a.$set({ [t]: this.$$d[t] }));
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
    return Ge(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function We(e, t, r, n) {
  var i;
  const a = (i = r[e]) == null ? void 0 : i.type;
  if (t = a === "Boolean" && typeof t != "boolean" ? t != null : t, !n || !r[e])
    return t;
  if (n === "toAttribute")
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
      // conversion already handled above
      case "Number":
        return t != null ? +t : t;
      default:
        return t;
    }
}
function _i(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Vr(e, t, r, n, a, i) {
  let s = class extends Ur {
    constructor() {
      super(e, r, a), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Ge(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return Ge(t).forEach((l) => {
    Xe(s.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(u) {
        var d;
        u = We(l, u, t), this.$$d[l] = u;
        var f = this.$$c;
        if (f) {
          var c = (d = Te(f, l)) == null ? void 0 : d.get;
          c ? f[l] = u : f.$set({ [l]: u });
        }
      }
    });
  }), n.forEach((l) => {
    Xe(s.prototype, l, {
      get() {
        var u;
        return (u = this.$$c) == null ? void 0 : u[l];
      }
    });
  }), i && (s = i(s)), e.element = /** @type {any} */
  s, s;
}
let nt = /* @__PURE__ */ P(void 0);
const pi = async () => (A(nt, await window.loadCardHelpers().then((e) => e), !0), $(nt)), gi = () => $(nt) ? $(nt) : pi();
function $i(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Br(e, { delay: t = 0, duration: r = 400, easing: n = $i, axis: a = "y" } = {}) {
  const i = getComputedStyle(e), s = +i.opacity, l = a === "y" ? "height" : "width", u = parseFloat(i[l]), f = a === "y" ? ["top", "bottom"] : ["left", "right"], c = f.map(
    (p) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${p[0].toUpperCase()}${p.slice(1)}`
    )
  ), d = parseFloat(i[`padding${c[0]}`]), o = parseFloat(i[`padding${c[1]}`]), v = parseFloat(i[`margin${c[0]}`]), h = parseFloat(i[`margin${c[1]}`]), _ = parseFloat(
    i[`border${c[0]}Width`]
  ), y = parseFloat(
    i[`border${c[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (p) => `overflow: hidden;opacity: ${Math.min(p * 20, 1) * s};${l}: ${p * u}px;padding-${f[0]}: ${p * d}px;padding-${f[1]}: ${p * o}px;margin-${f[0]}: ${p * v}px;margin-${f[1]}: ${p * h}px;border-${f[0]}-width: ${p * _}px;border-${f[1]}-width: ${p * y}px;min-${l}: 0`
  };
}
var wi = /* @__PURE__ */ Oe('<span class="loading svelte-1sdlsm">Loading...</span>'), yi = /* @__PURE__ */ Oe('<div class="outer-container"><!> <!></div>');
const mi = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function Tt(e, t) {
  qt(t, !0), Dr(e, mi);
  const r = Ee(t, "type", 7, "div"), n = Ee(t, "config"), a = Ee(t, "hass"), i = Ee(t, "marginTop", 7, "0px");
  let s = /* @__PURE__ */ P(void 0), l = /* @__PURE__ */ P(!0);
  wr(() => {
    $(s) && ($(s).hass = a());
  }), Mr(async () => {
    const v = (await gi()).createCardElement(n());
    v.hass = a(), $(s) && ($(s).replaceWith(v), A(s, v, !0), A(l, !1));
  });
  var u = yi(), f = de(u);
  ri(f, r, !1, (o, v) => {
    di(o, (h) => A(s, h, !0), () => $(s)), Yr(3, o, () => Br);
  });
  var c = Be(f, 2);
  {
    var d = (o) => {
      var v = wi();
      _e(o, v);
    };
    kt(c, (o) => {
      $(l) && o(d);
    });
  }
  return le(u), ve(() => oe(u, `margin-top: ${i() ?? ""};`)), _e(e, u), It({
    get type() {
      return r();
    },
    set type(o = "div") {
      r(o), he();
    },
    get config() {
      return n();
    },
    set config(o) {
      n(o), he();
    },
    get hass() {
      return a();
    },
    set hass(o) {
      a(o), he();
    },
    get marginTop() {
      return i();
    },
    set marginTop(o = "0px") {
      i(o), he();
    }
  });
}
customElements.define("expander-sub-card", Vr(
  Tt,
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
function bi(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const Ct = {
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
var ki = /* @__PURE__ */ Oe('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), Ei = /* @__PURE__ */ Oe("<button><div> </div> <ha-icon></ha-icon></button>", 2), xi = /* @__PURE__ */ Oe('<div class="children-container svelte-icqkke"></div>'), Ti = /* @__PURE__ */ Oe("<ha-card><!> <!></ha-card>", 2);
const Ci = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function Ai(e, t) {
  qt(t, !0), Dr(e, Ci);
  const r = Ee(t, "hass"), n = Ee(t, "config", 7, Ct);
  let a = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(!1);
  const s = n()["storgage-id"], l = "expander-open-" + s;
  function u() {
    f(!$(i));
  }
  function f(g) {
    if (A(i, g, !0), s !== void 0)
      try {
        localStorage.setItem(l, $(i) ? "true" : "false");
      } catch (k) {
        console.error(k);
      }
  }
  Mr(() => {
    const g = n()["min-width-expanded"], k = n()["max-width-expanded"], x = document.body.offsetWidth;
    if (g && k ? n().expanded = x >= g && x <= k : g ? n().expanded = x >= g : k && (n().expanded = x <= k), s !== void 0)
      try {
        const V = localStorage.getItem(l);
        V === null ? n().expanded !== void 0 && f(n().expanded) : A(i, V ? V === "true" : $(i), !0);
      } catch (V) {
        console.error(V);
      }
    else
      n().expanded !== void 0 && f(n().expanded);
  });
  const c = (g) => {
    if ($(a))
      return g.preventDefault(), g.stopImmediatePropagation(), A(a, !1), !1;
    u();
  }, d = (g) => {
    g.currentTarget.classList.contains("title-card-container") && c(g);
  };
  let o, v = !1, h = 0, _ = 0;
  const y = (g) => {
    o = g.target, h = g.touches[0].clientX, _ = g.touches[0].clientY, v = !1;
  }, p = (g) => {
    const k = g.touches[0].clientX, x = g.touches[0].clientY;
    (Math.abs(k - h) > 10 || Math.abs(x - _) > 10) && (v = !0);
  }, E = (g) => {
    !v && o === g.target && n()["title-card-clickable"] && u(), o = void 0, A(a, !0);
  };
  var C = Ti(), L = de(C);
  {
    var D = (g) => {
      var k = ki(), x = de(k);
      x.__touchstart = y, x.__touchmove = p, x.__touchend = E, x.__click = function(...jr) {
        var Ht;
        (Ht = n()["title-card-clickable"] ? d : null) == null || Ht.apply(this, jr);
      };
      var V = de(x);
      Tt(V, {
        get hass() {
          return r();
        },
        get config() {
          return n()["title-card"];
        },
        get type() {
          return n()["title-card"].type;
        }
      }), le(x);
      var Q = Be(x, 2);
      Q.__click = c;
      var vt = de(Q);
      ve(() => Jt(vt, "icon", n().icon)), le(Q), le(k), ve(() => {
        ce(k, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-icqkke"), oe(x, `--title-padding:${n()["title-card-padding"] ?? ""}`), Fr(x, "role", n()["title-card-clickable"] ? "button" : void 0), oe(Q, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), ce(Q, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${$(i) ? " open" : " close"}`, "svelte-icqkke"), oe(vt, `--arrow-color:${n()["arrow-color"] ?? ""}`), ce(vt, 1, `ico${$(i) ? " flipped open" : "close"}`, "svelte-icqkke");
      }), _e(g, k);
    }, ie = (g) => {
      var k = Ei();
      k.__click = c;
      var x = de(k), V = de(x, !0);
      le(x);
      var Q = Be(x, 2);
      ve(() => Jt(Q, "icon", n().icon)), le(k), ve(() => {
        ce(k, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${$(i) ? " open" : " close"}`, "svelte-icqkke"), oe(k, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), ce(x, 1, `primary title${$(i) ? " open" : " close"}`, "svelte-icqkke"), zn(V, n().title), oe(Q, `--arrow-color:${n()["arrow-color"] ?? ""}`), ce(Q, 1, `ico${$(i) ? " flipped open" : " close"}`, "svelte-icqkke");
      }), _e(g, k);
    };
    kt(L, (g) => {
      n()["title-card"] ? g(D) : g(ie, !1);
    });
  }
  var ae = Be(L, 2);
  {
    var se = (g) => {
      var k = xi();
      ei(k, 20, () => n().cards, (x) => x, (x, V) => {
        Tt(x, {
          get hass() {
            return r();
          },
          get config() {
            return V;
          },
          get type() {
            return V.type;
          },
          get marginTop() {
            return n()["child-margin-top"];
          }
        });
      }), le(k), ve(() => oe(k, `--expander-card-display:${($(i) ? n()["expander-card-display"] : "none") ?? ""};
             --gap:${($(i) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), Yr(3, k, () => Br, () => ({ duration: 500, easing: bi })), _e(g, k);
    };
    kt(ae, (g) => {
      n().cards && g(se);
    });
  }
  return le(C), ve(() => {
    ce(C, 1, `expander-card${n().clear ? " clear" : ""}${$(i) ? " open" : " close"}`, "svelte-icqkke"), oe(C, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${($(i) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${$(i) ?? ""};
     --card-background:${($(i) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
  }), _e(e, C), It({
    get hass() {
      return r();
    },
    set hass(g) {
      r(g), he();
    },
    get config() {
      return n();
    },
    set config(g = Ct) {
      n(g), he();
    }
  });
}
Bn([
  "touchstart",
  "touchmove",
  "touchend",
  "click"
]);
customElements.define("expander-card", Vr(Ai, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    B(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...Ct, ...r };
  }
}));
const Ni = "2.4.0";
console.info(
  `%c  Expander-Card 
%c Version ${Ni}`,
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
  Ai as default
};
//# sourceMappingURL=expander-card.js.map
