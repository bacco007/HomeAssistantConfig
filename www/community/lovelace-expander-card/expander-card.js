var Br = Object.defineProperty;
var Ht = (e) => {
  throw TypeError(e);
};
var jr = (e, t, r) => t in e ? Br(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var V = (e, t, r) => jr(e, typeof t != "symbol" ? t + "" : t, r), Yt = (e, t, r) => t.has(e) || Ht("Cannot " + r);
var O = (e, t, r) => (Yt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ft = (e, t, r) => t.has(e) ? Ht("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ut = (e, t, r, n) => (Yt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
const Wr = "5";
var Qt;
typeof window < "u" && ((Qt = window.__svelte ?? (window.__svelte = {})).v ?? (Qt.v = /* @__PURE__ */ new Set())).add(Wr);
const Gr = 1, Xr = 2, Kr = 16, zr = 4, Jr = 1, Zr = 2, kt = "[", Et = "[!", xt = "]", Ee = {}, R = Symbol(), Qr = "http://www.w3.org/1999/xhtml", en = "http://www.w3.org/2000/svg", Ut = !1;
var Tt = Array.isArray, tn = Array.prototype.indexOf, Ct = Array.from, Ge = Object.keys, Xe = Object.defineProperty, xe = Object.getOwnPropertyDescriptor, rn = Object.getOwnPropertyDescriptors, nn = Object.prototype, an = Array.prototype, er = Object.getPrototypeOf, Vt = Object.isExtensible;
function sn(e) {
  return typeof e == "function";
}
const Oe = () => {
};
function tr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const X = 2, rr = 4, tt = 8, rt = 16, ne = 32, $e = 64, At = 128, P = 256, Ke = 512, W = 1024, re = 2048, we = 4096, te = 8192, Nt = 16384, St = 32768, Ye = 65536, ln = 1 << 19, nr = 1 << 20, dt = 1 << 21, Be = Symbol("$state"), on = Symbol("legacy props"), fn = Symbol("");
function ir(e) {
  return e === this.v;
}
function un(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ar(e) {
  return !un(e, this.v);
}
function cn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function dn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function vn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function hn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function _n() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function pn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function gn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function $n() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let wn = !1;
function yn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let H = null;
function Bt(e) {
  H = e;
}
function Ot(e, t = !1, r) {
  var n = H = {
    p: H,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: e,
    x: null,
    l: null
  };
  Tn(() => {
    n.d = !0;
  });
}
function Rt(e) {
  const t = H;
  if (t !== null) {
    e !== void 0 && (t.x = e);
    const s = t.e;
    if (s !== null) {
      var r = b, n = m;
      t.e = null;
      try {
        for (var a = 0; a < s.length; a++) {
          var i = s[a];
          G(i.effect), q(i.reaction), it(i.fn);
        }
      } finally {
        G(r), q(n);
      }
    }
    H = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
function sr() {
  return !0;
}
function Re(e) {
  if (typeof e != "object" || e === null || Be in e)
    return e;
  const t = er(e);
  if (t !== nn && t !== an)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Tt(e), a = /* @__PURE__ */ D(0), i = m, s = (o) => {
    var u = m;
    q(i);
    var f = o();
    return q(u), f;
  };
  return n && r.set("length", /* @__PURE__ */ D(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && pn();
        var c = r.get(u);
        return c === void 0 ? c = s(() => {
          var d = /* @__PURE__ */ D(f.value);
          return r.set(u, d), d;
        }) : A(c, f.value, !0), !0;
      },
      deleteProperty(o, u) {
        var f = r.get(u);
        if (f === void 0) {
          if (u in o) {
            const l = s(() => /* @__PURE__ */ D(R));
            r.set(u, l), ct(a);
          }
        } else {
          if (n && typeof u == "string") {
            var c = (
              /** @type {Source<number>} */
              r.get("length")
            ), d = Number(u);
            Number.isInteger(d) && d < c.v && A(c, d);
          }
          A(f, R), ct(a);
        }
        return !0;
      },
      get(o, u, f) {
        var v;
        if (u === Be)
          return e;
        var c = r.get(u), d = u in o;
        if (c === void 0 && (!d || (v = xe(o, u)) != null && v.writable) && (c = s(() => {
          var h = Re(d ? o[u] : R), _ = /* @__PURE__ */ D(h);
          return _;
        }), r.set(u, c)), c !== void 0) {
          var l = $(c);
          return l === R ? void 0 : l;
        }
        return Reflect.get(o, u, f);
      },
      getOwnPropertyDescriptor(o, u) {
        var f = Reflect.getOwnPropertyDescriptor(o, u);
        if (f && "value" in f) {
          var c = r.get(u);
          c && (f.value = $(c));
        } else if (f === void 0) {
          var d = r.get(u), l = d == null ? void 0 : d.v;
          if (d !== void 0 && l !== R)
            return {
              enumerable: !0,
              configurable: !0,
              value: l,
              writable: !0
            };
        }
        return f;
      },
      has(o, u) {
        var l;
        if (u === Be)
          return !0;
        var f = r.get(u), c = f !== void 0 && f.v !== R || Reflect.has(o, u);
        if (f !== void 0 || b !== null && (!c || (l = xe(o, u)) != null && l.writable)) {
          f === void 0 && (f = s(() => {
            var v = c ? Re(o[u]) : R, h = /* @__PURE__ */ D(v);
            return h;
          }), r.set(u, f));
          var d = $(f);
          if (d === R)
            return !1;
        }
        return c;
      },
      set(o, u, f, c) {
        var C;
        var d = r.get(u), l = u in o;
        if (n && u === "length")
          for (var v = f; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var h = r.get(v + "");
            h !== void 0 ? A(h, R) : v in o && (h = s(() => /* @__PURE__ */ D(R)), r.set(v + "", h));
          }
        if (d === void 0)
          (!l || (C = xe(o, u)) != null && C.writable) && (d = s(() => /* @__PURE__ */ D(void 0)), A(d, Re(f)), r.set(u, d));
        else {
          l = d.v !== R;
          var _ = s(() => Re(f));
          A(d, _);
        }
        var w = Reflect.getOwnPropertyDescriptor(o, u);
        if (w != null && w.set && w.set.call(c, f), !l) {
          if (n && typeof u == "string") {
            var p = (
              /** @type {Source<number>} */
              r.get("length")
            ), E = Number(u);
            Number.isInteger(E) && E >= p.v && A(p, E + 1);
          }
          ct(a);
        }
        return !0;
      },
      ownKeys(o) {
        $(a);
        var u = Reflect.ownKeys(o).filter((d) => {
          var l = r.get(d);
          return l === void 0 || l.v !== R;
        });
        for (var [f, c] of r)
          c.v !== R && !(f in o) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        gn();
      }
    }
  );
}
function ct(e, t = 1) {
  A(e, e.v + t);
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  var t = X | re, r = m !== null && (m.f & X) !== 0 ? (
    /** @type {Derived} */
    m
  ) : null;
  return b === null || r !== null && (r.f & P) !== 0 ? t |= P : b.f |= nr, {
    ctx: H,
    deps: null,
    effects: null,
    equals: ir,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: r ?? b
  };
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
  const t = /* @__PURE__ */ qt(e);
  return t.equals = ar, t;
}
function lr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      z(
        /** @type {Effect} */
        t[r]
      );
  }
}
function bn(e) {
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
function or(e) {
  var t, r = b;
  G(bn(e));
  try {
    lr(e), t = Ar(e);
  } finally {
    G(r);
  }
  return t;
}
function fr(e) {
  var t = or(e);
  if (e.equals(t) || (e.v = t, e.wv = Tr()), !Ne) {
    var r = (ue || (e.f & P) !== 0) && e.deps !== null ? we : W;
    J(e, r);
  }
}
const Me = /* @__PURE__ */ new Map();
function ze(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ir,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function D(e, t) {
  const r = ze(e);
  return In(r), r;
}
// @__NO_SIDE_EFFECTS__
function It(e, t = !1, r = !0) {
  const n = ze(e);
  return t || (n.equals = ar), n;
}
function A(e, t, r = !1) {
  m !== null && !K && sr() && (m.f & (X | rt)) !== 0 && !(N != null && N[1].includes(e) && N[0] === m) && $n();
  let n = r ? Re(t) : t;
  return kn(e, n);
}
function kn(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Ne ? Me.set(e, t) : Me.set(e, r), e.v = t, (e.f & X) !== 0 && ((e.f & re) !== 0 && or(
      /** @type {Derived} */
      e
    ), J(e, (e.f & P) === 0 ? W : we)), e.wv = Tr(), ur(e, re), b !== null && (b.f & W) !== 0 && (b.f & (ne | $e)) === 0 && (B === null ? Mn([e]) : B.push(e));
  }
  return t;
}
function ur(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, a = 0; a < n; a++) {
      var i = r[a], s = i.f;
      (s & re) === 0 && (J(i, t), (s & (W | P)) !== 0 && ((s & X) !== 0 ? ur(
        /** @type {Derived} */
        i,
        we
      ) : Ft(
        /** @type {Effect} */
        i
      )));
    }
}
function nt(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let y = !1;
function F(e) {
  y = e;
}
let T;
function Y(e) {
  if (e === null)
    throw nt(), Ee;
  return T = e;
}
function Te() {
  return Y(
    /** @type {TemplateNode} */
    /* @__PURE__ */ ye(T)
  );
}
function le(e) {
  if (y) {
    if (/* @__PURE__ */ ye(T) !== null)
      throw nt(), Ee;
    T = e;
  }
}
function vt() {
  for (var e = 0, t = T; ; ) {
    if (t.nodeType === 8) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === xt) {
        if (e === 0) return t;
        e -= 1;
      } else (r === kt || r === Et) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ye(t)
    );
    t.remove(), t = n;
  }
}
function cr(e) {
  if (!e || e.nodeType !== 8)
    throw nt(), Ee;
  return (
    /** @type {Comment} */
    e.data
  );
}
var jt, dr, vr, hr;
function ht() {
  if (jt === void 0) {
    jt = window, dr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    vr = xe(t, "firstChild").get, hr = xe(t, "nextSibling").get, Vt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Vt(r) && (r.__t = void 0);
  }
}
function Ce(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ge(e) {
  return vr.call(e);
}
// @__NO_SIDE_EFFECTS__
function ye(e) {
  return hr.call(e);
}
function de(e, t) {
  if (!y)
    return /* @__PURE__ */ ge(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ ge(T)
  );
  if (r === null)
    r = T.appendChild(Ce());
  else if (t && r.nodeType !== 3) {
    var n = Ce();
    return r == null || r.before(n), Y(n), n;
  }
  return Y(r), r;
}
function je(e, t = 1, r = !1) {
  let n = y ? T : e;
  for (var a; t--; )
    a = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ ye(n);
  if (!y)
    return n;
  var i = n == null ? void 0 : n.nodeType;
  if (r && i !== 3) {
    var s = Ce();
    return n === null ? a == null || a.after(s) : n.before(s), Y(s), s;
  }
  return Y(n), /** @type {TemplateNode} */
  n;
}
function _r(e) {
  e.textContent = "";
}
function En(e) {
  b === null && m === null && vn(), m !== null && (m.f & P) !== 0 && b === null && dn(), Ne && cn();
}
function xn(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function me(e, t, r, n = !0) {
  var a = b, i = {
    ctx: H,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | re,
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
      Dt(i), i.f |= St;
    } catch (u) {
      throw z(i), u;
    }
  else t !== null && Ft(i);
  var s = r && i.deps === null && i.first === null && i.nodes_start === null && i.teardown === null && (i.f & (nr | At)) === 0;
  if (!s && n && (a !== null && xn(i, a), m !== null && (m.f & X) !== 0)) {
    var o = (
      /** @type {Derived} */
      m
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return i;
}
function Tn(e) {
  const t = me(tt, null, !1);
  return J(t, W), t.teardown = e, t;
}
function pr(e) {
  En();
  var t = b !== null && (b.f & ne) !== 0 && H !== null && !H.m;
  if (t) {
    var r = (
      /** @type {ComponentContext} */
      H
    );
    (r.e ?? (r.e = [])).push({
      fn: e,
      effect: b,
      reaction: m
    });
  } else {
    var n = it(e);
    return n;
  }
}
function Cn(e) {
  const t = me($e, e, !0);
  return () => {
    z(t);
  };
}
function An(e) {
  const t = me($e, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Le(t, () => {
      z(t), n(void 0);
    }) : (z(t), n(void 0));
  });
}
function it(e) {
  return me(rr, e, !1);
}
function gr(e) {
  return me(tt, e, !0);
}
function ve(e, t = [], r = qt) {
  const n = t.map(r);
  return at(() => e(...n.map($)));
}
function at(e, t = 0) {
  return me(tt | rt | t, e, !0);
}
function Ae(e, t = !0) {
  return me(tt | ne, e, !0, t);
}
function $r(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Ne, n = m;
    Wt(!0), q(null);
    try {
      t.call(null);
    } finally {
      Wt(r), q(n);
    }
  }
}
function wr(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    var n = r.next;
    (r.f & $e) !== 0 ? r.parent = null : z(r, t), r = n;
  }
}
function Nn(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ne) === 0 && z(t), t = r;
  }
}
function z(e, t = !0) {
  var r = !1;
  (t || (e.f & ln) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Sn(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), wr(e, t && !r), Ze(e, 0), J(e, Nt);
  var n = e.transitions;
  if (n !== null)
    for (const i of n)
      i.stop();
  $r(e);
  var a = e.parent;
  a !== null && a.first !== null && yr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = null;
}
function Sn(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ye(e)
    );
    e.remove(), e = r;
  }
}
function yr(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Le(e, t) {
  var r = [];
  Mt(e, r, !0), mr(r, () => {
    z(e), t && t();
  });
}
function mr(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var a of e)
      a.out(n);
  } else
    t();
}
function Mt(e, t, r) {
  if ((e.f & te) === 0) {
    if (e.f ^= te, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var a = n.next, i = (n.f & Ye) !== 0 || (n.f & ne) !== 0;
      Mt(n, t, i ? r : !1), n = a;
    }
  }
}
function De(e) {
  br(e, !0);
}
function br(e, t) {
  if ((e.f & te) !== 0) {
    e.f ^= te;
    for (var r = e.first; r !== null; ) {
      var n = r.next, a = (r.f & Ye) !== 0 || (r.f & ne) !== 0;
      br(r, a ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const i of e.transitions)
        (i.is_global || t) && i.in();
  }
}
let Fe = [], _t = [];
function kr() {
  var e = Fe;
  Fe = [], tr(e);
}
function On() {
  var e = _t;
  _t = [], tr(e);
}
function Lt(e) {
  Fe.length === 0 && queueMicrotask(kr), Fe.push(e);
}
function Rn() {
  Fe.length > 0 && kr(), _t.length > 0 && On();
}
function qn(e) {
  var t = (
    /** @type {Effect} */
    b
  );
  if ((t.f & St) === 0) {
    if ((t.f & At) === 0)
      throw e;
    t.fn(e);
  } else
    Er(e, t);
}
function Er(e, t) {
  for (; t !== null; ) {
    if ((t.f & At) !== 0)
      try {
        t.fn(e);
        return;
      } catch {
      }
    t = t.parent;
  }
  throw e;
}
let Pe = !1, He = null, pe = !1, Ne = !1;
function Wt(e) {
  Ne = e;
}
let qe = [];
let m = null, K = !1;
function q(e) {
  m = e;
}
let b = null;
function G(e) {
  b = e;
}
let N = null;
function In(e) {
  m !== null && m.f & dt && (N === null ? N = [m, [e]] : N[1].push(e));
}
let S = null, L = 0, B = null;
function Mn(e) {
  B = e;
}
let xr = 1, Je = 0, ue = !1;
function Tr() {
  return ++xr;
}
function st(e) {
  var d;
  var t = e.f;
  if ((t & re) !== 0)
    return !0;
  if ((t & we) !== 0) {
    var r = e.deps, n = (t & P) !== 0;
    if (r !== null) {
      var a, i, s = (t & Ke) !== 0, o = n && b !== null && !ue, u = r.length;
      if (s || o) {
        var f = (
          /** @type {Derived} */
          e
        ), c = f.parent;
        for (a = 0; a < u; a++)
          i = r[a], (s || !((d = i == null ? void 0 : i.reactions) != null && d.includes(f))) && (i.reactions ?? (i.reactions = [])).push(f);
        s && (f.f ^= Ke), o && c !== null && (c.f & P) === 0 && (f.f ^= P);
      }
      for (a = 0; a < u; a++)
        if (i = r[a], st(
          /** @type {Derived} */
          i
        ) && fr(
          /** @type {Derived} */
          i
        ), i.wv > e.wv)
          return !0;
    }
    (!n || b !== null && !ue) && J(e, W);
  }
  return !1;
}
function Cr(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null)
    for (var a = 0; a < n.length; a++) {
      var i = n[a];
      N != null && N[1].includes(e) && N[0] === m || ((i.f & X) !== 0 ? Cr(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? J(i, re) : (i.f & W) !== 0 && J(i, we), Ft(
        /** @type {Effect} */
        i
      )));
    }
}
function Ar(e) {
  var v;
  var t = S, r = L, n = B, a = m, i = ue, s = N, o = H, u = K, f = e.f;
  S = /** @type {null | Value[]} */
  null, L = 0, B = null, ue = (f & P) !== 0 && (K || !pe || m === null), m = (f & (ne | $e)) === 0 ? e : null, N = null, Bt(e.ctx), K = !1, Je++, e.f |= dt;
  try {
    var c = (
      /** @type {Function} */
      (0, e.fn)()
    ), d = e.deps;
    if (S !== null) {
      var l;
      if (Ze(e, L), d !== null && L > 0)
        for (d.length = L + S.length, l = 0; l < S.length; l++)
          d[L + l] = S[l];
      else
        e.deps = d = S;
      if (!ue)
        for (l = L; l < d.length; l++)
          ((v = d[l]).reactions ?? (v.reactions = [])).push(e);
    } else d !== null && L < d.length && (Ze(e, L), d.length = L);
    if (sr() && B !== null && !K && d !== null && (e.f & (X | we | re)) === 0)
      for (l = 0; l < /** @type {Source[]} */
      B.length; l++)
        Cr(
          B[l],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Je++, B !== null && (n === null ? n = B : n.push(.../** @type {Source[]} */
    B))), c;
  } catch (h) {
    qn(h);
  } finally {
    S = t, L = r, B = n, m = a, ue = i, N = s, Bt(o), K = u, e.f ^= dt;
  }
}
function Ln(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = tn.call(r, e);
    if (n !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[n] = r[a], r.pop());
    }
  }
  r === null && (t.f & X) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !S.includes(t)) && (J(t, we), (t.f & (P | Ke)) === 0 && (t.f ^= Ke), lr(
    /** @type {Derived} **/
    t
  ), Ze(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Ze(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Ln(e, r[n]);
}
function Dt(e) {
  var t = e.f;
  if ((t & Nt) === 0) {
    J(e, W);
    var r = b, n = pe;
    b = e, pe = !0;
    try {
      (t & rt) !== 0 ? Nn(e) : wr(e), $r(e);
      var a = Ar(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = xr;
      var i;
      Ut && wn && (e.f & re) !== 0 && e.deps;
    } finally {
      pe = n, b = r;
    }
  }
}
function Dn() {
  try {
    hn();
  } catch (e) {
    if (He !== null)
      Er(e, He);
    else
      throw e;
  }
}
function Nr() {
  var e = pe;
  try {
    var t = 0;
    for (pe = !0; qe.length > 0; ) {
      t++ > 1e3 && Dn();
      var r = qe, n = r.length;
      qe = [];
      for (var a = 0; a < n; a++) {
        var i = Pn(r[a]);
        Fn(i);
      }
      Me.clear();
    }
  } finally {
    Pe = !1, pe = e, He = null;
  }
}
function Fn(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var n = e[r];
      (n.f & (Nt | te)) === 0 && st(n) && (Dt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? yr(n) : n.fn = null));
    }
}
function Ft(e) {
  Pe || (Pe = !0, queueMicrotask(Nr));
  for (var t = He = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if ((r & ($e | ne)) !== 0) {
      if ((r & W) === 0) return;
      t.f ^= W;
    }
  }
  qe.push(t);
}
function Pn(e) {
  for (var t = [], r = e; r !== null; ) {
    var n = r.f, a = (n & (ne | $e)) !== 0, i = a && (n & W) !== 0;
    if (!i && (n & te) === 0) {
      (n & rr) !== 0 ? t.push(r) : a ? r.f ^= W : st(r) && Dt(r);
      var s = r.first;
      if (s !== null) {
        r = s;
        continue;
      }
    }
    var o = r.parent;
    for (r = r.next; r === null && o !== null; )
      r = o.next, o = o.parent;
  }
  return t;
}
function he(e) {
  for (var t; ; ) {
    if (Rn(), qe.length === 0)
      return Pe = !1, He = null, /** @type {T} */
      t;
    Pe = !0, Nr();
  }
}
function $(e) {
  var t = e.f, r = (t & X) !== 0;
  if (m !== null && !K) {
    if (!(N != null && N[1].includes(e)) || N[0] !== m) {
      var n = m.deps;
      e.rv < Je && (e.rv = Je, S === null && n !== null && n[L] === e ? L++ : S === null ? S = [e] : (!ue || !S.includes(e)) && S.push(e));
    }
  } else if (r && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var a = (
      /** @type {Derived} */
      e
    ), i = a.parent;
    i !== null && (i.f & P) === 0 && (a.f ^= P);
  }
  return r && (a = /** @type {Derived} */
  e, st(a) && fr(a)), Ne && Me.has(e) ? Me.get(e) : e.v;
}
function lt(e) {
  var t = K;
  try {
    return K = !0, e();
  } finally {
    K = t;
  }
}
const Hn = -7169;
function J(e, t) {
  e.f = e.f & Hn | t;
}
function Yn(e) {
  var t = m, r = b;
  q(null), G(null);
  try {
    return e();
  } finally {
    q(t), G(r);
  }
}
const Sr = /* @__PURE__ */ new Set(), pt = /* @__PURE__ */ new Set();
function Un(e) {
  for (var t = 0; t < e.length; t++)
    Sr.add(e[t]);
  for (var r of pt)
    r(e);
}
function Ue(e) {
  var E;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, a = ((E = e.composedPath) == null ? void 0 : E.call(e)) || [], i = (
    /** @type {null | Element} */
    a[0] || e.target
  ), s = 0, o = e.__root;
  if (o) {
    var u = a.indexOf(o);
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
    var c = m, d = b;
    q(null), G(null);
    try {
      for (var l, v = []; i !== null; ) {
        var h = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var _ = i["__" + n];
          if (_ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i))
            if (Tt(_)) {
              var [w, ...p] = _;
              w.apply(i, [e, ...p]);
            } else
              _.call(i, e);
        } catch (C) {
          l ? v.push(C) : l = C;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        i = h;
      }
      if (l) {
        for (let C of v)
          queueMicrotask(() => {
            throw C;
          });
        throw l;
      }
    } finally {
      e.__root = t, delete e.currentTarget, q(c), G(d);
    }
  }
}
function Vn(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ie(e, t) {
  var r = (
    /** @type {Effect} */
    b
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Se(e, t) {
  var r = (t & Jr) !== 0, n = (t & Zr) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    if (y)
      return Ie(T, null), T;
    a === void 0 && (a = Vn(i ? e : "<!>" + e), r || (a = /** @type {Node} */
    /* @__PURE__ */ ge(a)));
    var s = (
      /** @type {TemplateNode} */
      n || dr ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ge(s)
      ), u = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ie(o, u);
    } else
      Ie(s, s);
    return s;
  };
}
function _e(e, t) {
  if (y) {
    b.nodes_end = T, Te();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Bn = ["touchstart", "touchmove"];
function jn(e) {
  return Bn.includes(e);
}
const Wn = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Gn(e) {
  return Wn.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let Qe = !0;
function Gt(e) {
  Qe = e;
}
function Xn(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Or(e, t) {
  return Rr(e, t);
}
function Kn(e, t) {
  ht(), t.intro = t.intro ?? !1;
  const r = t.target, n = y, a = T;
  try {
    for (var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ge(r)
    ); i && (i.nodeType !== 8 || /** @type {Comment} */
    i.data !== kt); )
      i = /** @type {TemplateNode} */
      /* @__PURE__ */ ye(i);
    if (!i)
      throw Ee;
    F(!0), Y(
      /** @type {Comment} */
      i
    ), Te();
    const s = Rr(e, { ...t, anchor: i });
    if (T === null || T.nodeType !== 8 || /** @type {Comment} */
    T.data !== xt)
      throw nt(), Ee;
    return F(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Ee)
      return t.recover === !1 && _n(), ht(), _r(r), F(!1), Or(e, t);
    throw s;
  } finally {
    F(n), Y(a);
  }
}
const be = /* @__PURE__ */ new Map();
function Rr(e, { target: t, anchor: r, props: n = {}, events: a, context: i, intro: s = !0 }) {
  ht();
  var o = /* @__PURE__ */ new Set(), u = (d) => {
    for (var l = 0; l < d.length; l++) {
      var v = d[l];
      if (!o.has(v)) {
        o.add(v);
        var h = jn(v);
        t.addEventListener(v, Ue, { passive: h });
        var _ = be.get(v);
        _ === void 0 ? (document.addEventListener(v, Ue, { passive: h }), be.set(v, 1)) : be.set(v, _ + 1);
      }
    }
  };
  u(Ct(Sr)), pt.add(u);
  var f = void 0, c = An(() => {
    var d = r ?? t.appendChild(Ce());
    return Ae(() => {
      if (i) {
        Ot({});
        var l = (
          /** @type {ComponentContext} */
          H
        );
        l.c = i;
      }
      a && (n.$$events = a), y && Ie(
        /** @type {TemplateNode} */
        d,
        null
      ), Qe = s, f = e(d, n) || {}, Qe = !0, y && (b.nodes_end = T), i && Rt();
    }), () => {
      var h;
      for (var l of o) {
        t.removeEventListener(l, Ue);
        var v = (
          /** @type {number} */
          be.get(l)
        );
        --v === 0 ? (document.removeEventListener(l, Ue), be.delete(l)) : be.set(l, v);
      }
      pt.delete(u), d !== r && ((h = d.parentNode) == null || h.removeChild(d));
    };
  });
  return gt.set(f, c), f;
}
let gt = /* @__PURE__ */ new WeakMap();
function zn(e, t) {
  const r = gt.get(e);
  return r ? (gt.delete(e), r(t)) : Promise.resolve();
}
function qr(e) {
  H === null && yn(), pr(() => {
    const t = lt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function $t(e, t, [r, n] = [0, 0]) {
  y && r === 0 && Te();
  var a = e, i = null, s = null, o = R, u = r > 0 ? Ye : 0, f = !1;
  const c = (l, v = !0) => {
    f = !0, d(v, l);
  }, d = (l, v) => {
    if (o === (o = l)) return;
    let h = !1;
    if (y && n !== -1) {
      if (r === 0) {
        const w = cr(a);
        w === kt ? n = 0 : w === Et ? n = 1 / 0 : (n = parseInt(w.substring(1)), n !== n && (n = o ? 1 / 0 : -1));
      }
      const _ = n > r;
      !!o === _ && (a = vt(), Y(a), F(!1), h = !0, n = -1);
    }
    o ? (i ? De(i) : v && (i = Ae(() => v(a))), s && Le(s, () => {
      s = null;
    })) : (s ? De(s) : v && (s = Ae(() => v(a, [r + 1, n]))), i && Le(i, () => {
      i = null;
    })), h && F(!0);
  };
  at(() => {
    f = !1, t(c), f || d(null, null);
  }, u), y && (a = T);
}
function Jn(e, t, r, n) {
  for (var a = [], i = t.length, s = 0; s < i; s++)
    Mt(t[s].e, a, !0);
  var o = i > 0 && a.length === 0 && r !== null;
  if (o) {
    var u = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    _r(u), u.append(
      /** @type {Element} */
      r
    ), n.clear(), fe(e, t[0].prev, t[i - 1].next);
  }
  mr(a, () => {
    for (var f = 0; f < i; f++) {
      var c = t[f];
      o || (n.delete(c.k), fe(e, c.prev, c.next)), z(c.e, !o);
    }
  });
}
function Zn(e, t, r, n, a, i = null) {
  var s = e, o = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var u = (
      /** @type {Element} */
      e
    );
    s = y ? Y(
      /** @type {Comment | Text} */
      /* @__PURE__ */ ge(u)
    ) : u.appendChild(Ce());
  }
  y && Te();
  var f = null, c = !1, d = /* @__PURE__ */ mn(() => {
    var l = r();
    return Tt(l) ? l : l == null ? [] : Ct(l);
  });
  at(() => {
    var l = $(d), v = l.length;
    if (c && v === 0)
      return;
    c = v === 0;
    let h = !1;
    if (y) {
      var _ = cr(s) === Et;
      _ !== (v === 0) && (s = vt(), Y(s), F(!1), h = !0);
    }
    if (y) {
      for (var w = null, p, E = 0; E < v; E++) {
        if (T.nodeType === 8 && /** @type {Comment} */
        T.data === xt) {
          s = /** @type {Comment} */
          T, h = !0, F(!1);
          break;
        }
        var C = l[E], I = n(C, E);
        p = Ir(
          T,
          o,
          w,
          null,
          C,
          I,
          E,
          a,
          t,
          r
        ), o.items.set(I, p), w = p;
      }
      v > 0 && Y(vt());
    }
    y || Qn(l, o, s, a, t, n, r), i !== null && (v === 0 ? f ? De(f) : f = Ae(() => i(s)) : f !== null && Le(f, () => {
      f = null;
    })), h && F(!0), $(d);
  }), y && (s = T);
}
function Qn(e, t, r, n, a, i, s) {
  var o = e.length, u = t.items, f = t.first, c = f, d, l = null, v = [], h = [], _, w, p, E;
  for (E = 0; E < o; E += 1) {
    if (_ = e[E], w = i(_, E), p = u.get(w), p === void 0) {
      var C = c ? (
        /** @type {TemplateNode} */
        c.e.nodes_start
      ) : r;
      l = Ir(
        C,
        t,
        l,
        l === null ? t.first : l.next,
        _,
        w,
        E,
        n,
        a,
        s
      ), u.set(w, l), v = [], h = [], c = l.next;
      continue;
    }
    if ((p.e.f & te) !== 0 && De(p.e), p !== c) {
      if (d !== void 0 && d.has(p)) {
        if (v.length < h.length) {
          var I = h[0], M;
          l = I.prev;
          var ie = v[0], ae = v[v.length - 1];
          for (M = 0; M < v.length; M += 1)
            Xt(v[M], I, r);
          for (M = 0; M < h.length; M += 1)
            d.delete(h[M]);
          fe(t, ie.prev, ae.next), fe(t, l, ie), fe(t, ae, I), c = I, l = ae, E -= 1, v = [], h = [];
        } else
          d.delete(p), Xt(p, c, r), fe(t, p.prev, p.next), fe(t, p, l === null ? t.first : l.next), fe(t, l, p), l = p;
        continue;
      }
      for (v = [], h = []; c !== null && c.k !== w; )
        (c.e.f & te) === 0 && (d ?? (d = /* @__PURE__ */ new Set())).add(c), h.push(c), c = c.next;
      if (c === null)
        continue;
      p = c;
    }
    v.push(p), l = p, c = p.next;
  }
  if (c !== null || d !== void 0) {
    for (var se = d === void 0 ? [] : Ct(d); c !== null; )
      (c.e.f & te) === 0 && se.push(c), c = c.next;
    var g = se.length;
    if (g > 0) {
      var k = o === 0 ? r : null;
      Jn(t, se, k, u);
    }
  }
  b.first = t.first && t.first.e, b.last = l && l.e;
}
function Ir(e, t, r, n, a, i, s, o, u, f) {
  var c = (u & Gr) !== 0, d = (u & Kr) === 0, l = c ? d ? /* @__PURE__ */ It(a, !1, !1) : ze(a) : a, v = (u & Xr) === 0 ? s : ze(s), h = {
    i: v,
    v: l,
    k: i,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: n
  };
  try {
    return h.e = Ae(() => o(e, l, v, f), y), h.e.prev = r && r.e, h.e.next = n && n.e, r === null ? t.first = h : (r.next = h, r.e.next = h.e), n !== null && (n.prev = h, n.e.prev = h.e), h;
  } finally {
  }
}
function Xt(e, t, r) {
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
function ei(e, t, r, n, a, i) {
  let s = y;
  y && Te();
  var o, u, f = null;
  y && T.nodeType === 1 && (f = /** @type {Element} */
  T, Te());
  var c = (
    /** @type {TemplateNode} */
    y ? T : e
  ), d;
  at(() => {
    const l = t() || null;
    var v = l === "svg" ? en : null;
    l !== o && (d && (l === null ? Le(d, () => {
      d = null, u = null;
    }) : l === u ? De(d) : (z(d), Gt(!1))), l && l !== u && (d = Ae(() => {
      if (f = y ? (
        /** @type {Element} */
        f
      ) : v ? document.createElementNS(v, l) : document.createElement(l), Ie(f, f), n) {
        y && Gn(l) && f.append(document.createComment(""));
        var h = (
          /** @type {TemplateNode} */
          y ? /* @__PURE__ */ ge(f) : f.appendChild(Ce())
        );
        y && (h === null ? F(!1) : Y(h)), n(f, h);
      }
      b.nodes_end = f, c.before(f);
    })), o = l, o && (u = o), Gt(!0));
  }, Ye), s && (F(!0), Y(c));
}
function Mr(e, t) {
  Lt(() => {
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
function ti(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function ri(e, t) {
  return e == null ? null : String(e);
}
function ce(e, t, r, n, a, i) {
  var s = e.__className;
  if (y || s !== r || s === void 0) {
    var o = ti(r, n);
    (!y || o !== e.getAttribute("class")) && (o == null ? e.removeAttribute("class") : e.className = o), e.__className = r;
  }
  return i;
}
function oe(e, t, r, n) {
  var a = e.__style;
  if (y || a !== t) {
    var i = ri(t);
    (!y || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return n;
}
const ni = Symbol("is custom element"), ii = Symbol("is html");
function Lr(e, t, r, n) {
  var a = ai(e);
  y && (a[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || a[t] !== (a[t] = r) && (t === "loading" && (e[fn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Dr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Kt(e, t, r) {
  var n = m, a = b;
  let i = y;
  y && F(!1), q(null), G(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (wt.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? Dr(e).includes(t) : r && typeof r == "object") ? e[t] = r : Lr(e, t, r == null ? r : String(r));
  } finally {
    q(n), G(a), i && F(!0);
  }
}
function ai(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ni]: e.nodeName.includes("-"),
      [ii]: e.namespaceURI === Qr
    })
  );
}
var wt = /* @__PURE__ */ new Map();
function Dr(e) {
  var t = wt.get(e.nodeName);
  if (t) return t;
  wt.set(e.nodeName, t = []);
  for (var r, n = e, a = Element.prototype; a !== n; ) {
    r = rn(n);
    for (var i in r)
      r[i].set && t.push(i);
    n = er(n);
  }
  return t;
}
const si = () => performance.now(), ee = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => si(),
  tasks: /* @__PURE__ */ new Set()
};
function Fr() {
  const e = ee.now();
  ee.tasks.forEach((t) => {
    t.c(e) || (ee.tasks.delete(t), t.f());
  }), ee.tasks.size !== 0 && ee.tick(Fr);
}
function li(e) {
  let t;
  return ee.tasks.size === 0 && ee.tick(Fr), {
    promise: new Promise((r) => {
      ee.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      ee.tasks.delete(t);
    }
  };
}
function Ve(e, t) {
  Yn(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function oi(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function zt(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [a, i] = n.split(":");
    if (!a || i === void 0) break;
    const s = oi(a.trim());
    t[s] = i.trim();
  }
  return t;
}
const fi = (e) => e;
function Pr(e, t, r, n) {
  var a = (e & zr) !== 0, i = "both", s, o = t.inert, u = t.style.overflow, f, c;
  function d() {
    var w = m, p = b;
    q(null), G(null);
    try {
      return s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
      {}, {
        direction: i
      }));
    } finally {
      q(w), G(p);
    }
  }
  var l = {
    is_global: a,
    in() {
      t.inert = o, Ve(t, "introstart"), f = yt(t, d(), c, 1, () => {
        Ve(t, "introend"), f == null || f.abort(), f = s = void 0, t.style.overflow = u;
      });
    },
    out(w) {
      t.inert = !0, Ve(t, "outrostart"), c = yt(t, d(), f, 0, () => {
        Ve(t, "outroend"), w == null || w();
      });
    },
    stop: () => {
      f == null || f.abort(), c == null || c.abort();
    }
  }, v = (
    /** @type {Effect} */
    b
  );
  if ((v.transitions ?? (v.transitions = [])).push(l), Qe) {
    var h = a;
    if (!h) {
      for (var _ = (
        /** @type {Effect | null} */
        v.parent
      ); _ && (_.f & Ye) !== 0; )
        for (; (_ = _.parent) && (_.f & rt) === 0; )
          ;
      h = !_ || (_.f & St) !== 0;
    }
    h && it(() => {
      lt(() => l.in());
    });
  }
}
function yt(e, t, r, n, a) {
  var i = n === 1;
  if (sn(t)) {
    var s, o = !1;
    return Lt(() => {
      if (!o) {
        var w = t({ direction: i ? "in" : "out" });
        s = yt(e, w, r, n, a);
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
    return a(), {
      abort: Oe,
      deactivate: Oe,
      reset: Oe,
      t: () => n
    };
  const { delay: u = 0, css: f, tick: c, easing: d = fi } = t;
  var l = [];
  if (i && r === void 0 && (c && c(0, 1), f)) {
    var v = zt(f(0, 1));
    l.push(v, v);
  }
  var h = () => 1 - n, _ = e.animate(l, { duration: u, fill: "forwards" });
  return _.onfinish = () => {
    _.cancel();
    var w = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var p = n - w, E = (
      /** @type {number} */
      t.duration * Math.abs(p)
    ), C = [];
    if (E > 0) {
      var I = !1;
      if (f)
        for (var M = Math.ceil(E / 16.666666666666668), ie = 0; ie <= M; ie += 1) {
          var ae = w + p * d(ie / M), se = zt(f(ae, 1 - ae));
          C.push(se), I || (I = se.overflow === "hidden");
        }
      I && (e.style.overflow = "hidden"), h = () => {
        var g = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return w + p * d(g / E);
      }, c && li(() => {
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
      _ && (_.cancel(), _.effect = null, _.onfinish = Oe);
    },
    deactivate: () => {
      a = Oe;
    },
    reset: () => {
      n === 0 && (c == null || c(1, 0));
    },
    t: () => h()
  };
}
function Jt(e, t) {
  return e === t || (e == null ? void 0 : e[Be]) === t;
}
function ui(e = {}, t, r, n) {
  return it(() => {
    var a, i;
    return gr(() => {
      a = i, i = [], lt(() => {
        e !== r(...i) && (t(e, ...i), a && Jt(r(...a), e) && t(null, ...a));
      });
    }), () => {
      Lt(() => {
        i && Jt(r(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
function Zt(e) {
  var t;
  return ((t = e.ctx) == null ? void 0 : t.d) ?? !1;
}
function ke(e, t, r, n) {
  var a;
  a = /** @type {V} */
  e[t];
  var i = (
    /** @type {V} */
    n
  ), s = !0, o = !1, u = () => (o = !0, s && (s = !1, i = /** @type {V} */
  n), i);
  a === void 0 && n !== void 0 && (a = u());
  var f;
  f = () => {
    var v = (
      /** @type {V} */
      e[t]
    );
    return v === void 0 ? u() : (s = !0, o = !1, v);
  };
  var c = !1, d = /* @__PURE__ */ It(a), l = /* @__PURE__ */ qt(() => {
    var v = f(), h = $(d);
    return c ? (c = !1, h) : d.v = v;
  });
  return function(v, h) {
    if (arguments.length > 0) {
      const _ = h ? $(l) : v;
      if (!l.equals(_)) {
        if (c = !0, A(d, _), o && i !== void 0 && (i = _), Zt(l))
          return v;
        lt(() => $(l));
      }
      return v;
    }
    return Zt(l) ? l.v : $(l);
  };
}
function ci(e) {
  return new di(e);
}
var Q, j;
class di {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    ft(this, Q);
    /** @type {Record<string, any>} */
    ft(this, j);
    var i;
    var r = /* @__PURE__ */ new Map(), n = (s, o) => {
      var u = /* @__PURE__ */ It(o, !1, !1);
      return r.set(s, u), u;
    };
    const a = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, o) {
          return $(r.get(o) ?? n(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === on ? !0 : ($(r.get(o) ?? n(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, u) {
          return A(r.get(o) ?? n(o, u), u), Reflect.set(s, o, u);
        }
      }
    );
    ut(this, j, (t.hydrate ? Kn : Or)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: a,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && he(), ut(this, Q, a.$$events);
    for (const s of Object.keys(O(this, j)))
      s === "$set" || s === "$destroy" || s === "$on" || Xe(this, s, {
        get() {
          return O(this, j)[s];
        },
        /** @param {any} value */
        set(o) {
          O(this, j)[s] = o;
        },
        enumerable: !0
      });
    O(this, j).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(a, s);
    }, O(this, j).$destroy = () => {
      zn(O(this, j));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    O(this, j).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    O(this, Q)[t] = O(this, Q)[t] || [];
    const n = (...a) => r.call(this, ...a);
    return O(this, Q)[t].push(n), () => {
      O(this, Q)[t] = O(this, Q)[t].filter(
        /** @param {any} fn */
        (a) => a !== n
      );
    };
  }
  $destroy() {
    O(this, j).$destroy();
  }
}
Q = new WeakMap(), j = new WeakMap();
let Hr;
typeof HTMLElement == "function" && (Hr = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    V(this, "$$ctor");
    /** Slots */
    V(this, "$$s");
    /** @type {any} The Svelte component instance */
    V(this, "$$c");
    /** Whether or not the custom element is connected */
    V(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    V(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    V(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    V(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    V(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    V(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    V(this, "$$me");
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
      const r = {}, n = vi(this);
      for (const a of this.$$s)
        a in n && (a === "default" && !this.$$d.children ? (this.$$d.children = t(a), r.default = !0) : r[a] = t(a));
      for (const a of this.attributes) {
        const i = this.$$g_p(a.name);
        i in this.$$d || (this.$$d[i] = We(i, a.value, this.$$p_d, "toProp"));
      }
      for (const a in this.$$p_d)
        !(a in this.$$d) && this[a] !== void 0 && (this.$$d[a] = this[a], delete this[a]);
      this.$$c = ci({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Cn(() => {
        gr(() => {
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
function vi(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Yr(e, t, r, n, a, i) {
  let s = class extends Hr {
    constructor() {
      super(e, r, a), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Ge(t).map(
        (o) => (t[o].attribute || o).toLowerCase()
      );
    }
  };
  return Ge(t).forEach((o) => {
    Xe(s.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(u) {
        var d;
        u = We(o, u, t), this.$$d[o] = u;
        var f = this.$$c;
        if (f) {
          var c = (d = xe(f, o)) == null ? void 0 : d.get;
          c ? f[o] = u : f.$set({ [o]: u });
        }
      }
    });
  }), n.forEach((o) => {
    Xe(s.prototype, o, {
      get() {
        var u;
        return (u = this.$$c) == null ? void 0 : u[o];
      }
    });
  }), i && (s = i(s)), e.element = /** @type {any} */
  s, s;
}
let et = /* @__PURE__ */ D(void 0);
const hi = async () => (A(et, await window.loadCardHelpers().then((e) => e), !0), $(et)), _i = () => $(et) ? $(et) : hi();
function pi(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Ur(e, { delay: t = 0, duration: r = 400, easing: n = pi, axis: a = "y" } = {}) {
  const i = getComputedStyle(e), s = +i.opacity, o = a === "y" ? "height" : "width", u = parseFloat(i[o]), f = a === "y" ? ["top", "bottom"] : ["left", "right"], c = f.map(
    (p) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${p[0].toUpperCase()}${p.slice(1)}`
    )
  ), d = parseFloat(i[`padding${c[0]}`]), l = parseFloat(i[`padding${c[1]}`]), v = parseFloat(i[`margin${c[0]}`]), h = parseFloat(i[`margin${c[1]}`]), _ = parseFloat(
    i[`border${c[0]}Width`]
  ), w = parseFloat(
    i[`border${c[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (p) => `overflow: hidden;opacity: ${Math.min(p * 20, 1) * s};${o}: ${p * u}px;padding-${f[0]}: ${p * d}px;padding-${f[1]}: ${p * l}px;margin-${f[0]}: ${p * v}px;margin-${f[1]}: ${p * h}px;border-${f[0]}-width: ${p * _}px;border-${f[1]}-width: ${p * w}px;min-${o}: 0`
  };
}
var gi = /* @__PURE__ */ Se('<span class="loading svelte-1sdlsm">Loading...</span>'), $i = /* @__PURE__ */ Se('<div class="outer-container"><!> <!></div>');
const wi = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function mt(e, t) {
  Ot(t, !0), Mr(e, wi);
  const r = ke(t, "type", 7, "div"), n = ke(t, "config"), a = ke(t, "hass"), i = ke(t, "marginTop", 7, "0px");
  let s = /* @__PURE__ */ D(void 0), o = /* @__PURE__ */ D(!0);
  pr(() => {
    $(s) && ($(s).hass = a());
  }), qr(async () => {
    const v = (await _i()).createCardElement(n());
    v.hass = a(), $(s) && ($(s).replaceWith(v), A(s, v, !0), A(o, !1));
  });
  var u = $i(), f = de(u);
  ei(f, r, !1, (l, v) => {
    ui(l, (h) => A(s, h, !0), () => $(s)), Pr(3, l, () => Ur);
  });
  var c = je(f, 2);
  {
    var d = (l) => {
      var v = gi();
      _e(l, v);
    };
    $t(c, (l) => {
      $(o) && l(d);
    });
  }
  return le(u), ve(() => oe(u, `margin-top: ${i() ?? ""};`)), _e(e, u), Rt({
    get type() {
      return r();
    },
    set type(l = "div") {
      r(l), he();
    },
    get config() {
      return n();
    },
    set config(l) {
      n(l), he();
    },
    get hass() {
      return a();
    },
    set hass(l) {
      a(l), he();
    },
    get marginTop() {
      return i();
    },
    set marginTop(l = "0px") {
      i(l), he();
    }
  });
}
customElements.define("expander-sub-card", Yr(
  mt,
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
function yi(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const bt = {
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
var mi = /* @__PURE__ */ Se('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), bi = /* @__PURE__ */ Se("<button><div> </div> <ha-icon></ha-icon></button>", 2), ki = /* @__PURE__ */ Se('<div class="children-container svelte-icqkke"></div>'), Ei = /* @__PURE__ */ Se("<ha-card><!> <!></ha-card>", 2);
const xi = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function Ti(e, t) {
  Ot(t, !0), Mr(e, xi);
  const r = ke(t, "hass"), n = ke(t, "config", 7, bt);
  let a = /* @__PURE__ */ D(!1), i = /* @__PURE__ */ D(!1);
  const s = n()["storgage-id"], o = "expander-open-" + s;
  function u() {
    f(!$(i));
  }
  function f(g) {
    if (A(i, g, !0), s !== void 0)
      try {
        localStorage.setItem(o, $(i) ? "true" : "false");
      } catch (k) {
        console.error(k);
      }
  }
  qr(() => {
    const g = n()["min-width-expanded"], k = n()["max-width-expanded"], x = document.body.offsetWidth;
    if (g && k ? n().expanded = x >= g && x <= k : g ? n().expanded = x >= g : k && (n().expanded = x <= k), s !== void 0)
      try {
        const U = localStorage.getItem(o);
        U === null ? n().expanded !== void 0 && f(n().expanded) : A(i, U ? U === "true" : $(i), !0);
      } catch (U) {
        console.error(U);
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
  let l, v = !1, h = 0, _ = 0;
  const w = (g) => {
    l = g.target, h = g.touches[0].clientX, _ = g.touches[0].clientY, v = !1;
  }, p = (g) => {
    const k = g.touches[0].clientX, x = g.touches[0].clientY;
    (Math.abs(k - h) > 10 || Math.abs(x - _) > 10) && (v = !0);
  }, E = (g) => {
    !v && l === g.target && n()["title-card-clickable"] && u(), l = void 0, A(a, !0);
  };
  var C = Ei(), I = de(C);
  {
    var M = (g) => {
      var k = mi(), x = de(k);
      x.__touchstart = w, x.__touchmove = p, x.__touchend = E, x.__click = function(...Vr) {
        var Pt;
        (Pt = n()["title-card-clickable"] ? d : null) == null || Pt.apply(this, Vr);
      };
      var U = de(x);
      mt(U, {
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
      var Z = je(x, 2);
      Z.__click = c;
      var ot = de(Z);
      ve(() => Kt(ot, "icon", n().icon)), le(Z), le(k), ve(() => {
        ce(k, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-icqkke"), oe(x, `--title-padding:${n()["title-card-padding"] ?? ""}`), Lr(x, "role", n()["title-card-clickable"] ? "button" : void 0), oe(Z, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), ce(Z, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${$(i) ? " open" : " close"}`, "svelte-icqkke"), oe(ot, `--arrow-color:${n()["arrow-color"] ?? ""}`), ce(ot, 1, `ico${$(i) ? " flipped open" : "close"}`, "svelte-icqkke");
      }), _e(g, k);
    }, ie = (g) => {
      var k = bi();
      k.__click = c;
      var x = de(k), U = de(x, !0);
      le(x);
      var Z = je(x, 2);
      ve(() => Kt(Z, "icon", n().icon)), le(k), ve(() => {
        ce(k, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${$(i) ? " open" : " close"}`, "svelte-icqkke"), oe(k, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), ce(x, 1, `primary title${$(i) ? " open" : " close"}`, "svelte-icqkke"), Xn(U, n().title), oe(Z, `--arrow-color:${n()["arrow-color"] ?? ""}`), ce(Z, 1, `ico${$(i) ? " flipped open" : " close"}`, "svelte-icqkke");
      }), _e(g, k);
    };
    $t(I, (g) => {
      n()["title-card"] ? g(M) : g(ie, !1);
    });
  }
  var ae = je(I, 2);
  {
    var se = (g) => {
      var k = ki();
      Zn(k, 20, () => n().cards, (x) => x, (x, U) => {
        mt(x, {
          get hass() {
            return r();
          },
          get config() {
            return U;
          },
          get type() {
            return U.type;
          },
          get marginTop() {
            return n()["child-margin-top"];
          }
        });
      }), le(k), ve(() => oe(k, `--expander-card-display:${($(i) ? n()["expander-card-display"] : "none") ?? ""};
             --gap:${($(i) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), Pr(3, k, () => Ur, () => ({ duration: 500, easing: yi })), _e(g, k);
    };
    $t(ae, (g) => {
      n().cards && g(se);
    });
  }
  return le(C), ve(() => {
    ce(C, 1, `expander-card${n().clear ? " clear" : ""}${$(i) ? " open" : " close"}`, "svelte-icqkke"), oe(C, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${($(i) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${$(i) ?? ""};
     --card-background:${($(i) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
  }), _e(e, C), Rt({
    get hass() {
      return r();
    },
    set hass(g) {
      r(g), he();
    },
    get config() {
      return n();
    },
    set config(g = bt) {
      n(g), he();
    }
  });
}
Un([
  "touchstart",
  "touchmove",
  "touchend",
  "click"
]);
customElements.define("expander-card", Yr(Ti, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    V(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...bt, ...r };
  }
}));
const Ci = "2.4.3";
console.info(
  `%c  Expander-Card 
%c Version ${Ci}`,
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
  Ti as default
};
//# sourceMappingURL=expander-card.js.map
