var Xr = Object.defineProperty;
var Yt = (e) => {
  throw TypeError(e);
};
var Gr = (e, t, r) => t in e ? Xr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var O = (e, t, r) => Gr(e, typeof t != "symbol" ? t + "" : t, r), Ht = (e, t, r) => t.has(e) || Yt("Cannot " + r);
var R = (e, t, r) => (Ht(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ft = (e, t, r) => t.has(e) ? Yt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ut = (e, t, r, n) => (Ht(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
const Kr = "5";
var Qt;
typeof window < "u" && ((Qt = window.__svelte ?? (window.__svelte = {})).v ?? (Qt.v = /* @__PURE__ */ new Set())).add(Kr);
const zr = 1, Jr = 2, Zr = 16, Qr = 4, en = 1, tn = 2, kt = "[", Et = "[!", xt = "]", Ee = {}, I = Symbol(), rn = "http://www.w3.org/1999/xhtml", nn = "http://www.w3.org/2000/svg", Ut = !1;
var Tt = Array.isArray, an = Array.prototype.indexOf, Ct = Array.from, Ge = Object.keys, Ke = Object.defineProperty, xe = Object.getOwnPropertyDescriptor, sn = Object.getOwnPropertyDescriptors, ln = Object.prototype, on = Array.prototype, er = Object.getPrototypeOf, Vt = Object.isExtensible;
function fn(e) {
  return typeof e == "function";
}
const Oe = () => {
};
function tr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const W = 2, rr = 4, rt = 8, nt = 16, ne = 32, $e = 64, Nt = 128, Y = 256, ze = 512, X = 1024, re = 2048, we = 4096, te = 8192, St = 16384, At = 32768, Ue = 65536, Bt = 1 << 17, un = 1 << 18, nr = 1 << 19, dt = 1 << 20, je = Symbol("$state"), cn = Symbol("legacy props"), dn = Symbol(""), ir = new class extends Error {
  constructor() {
    super(...arguments);
    O(this, "name", "StaleReactionError");
    O(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}(), vn = 1, ar = 3, qe = 8;
function sr(e) {
  return e === this.v;
}
function hn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function lr(e) {
  return !hn(e, this.v);
}
function _n(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function pn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function gn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function $n() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function wn() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function mn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function bn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let kn = !1;
function En(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let H = null;
function jt(e) {
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
  An(() => {
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
          G(i.effect), M(i.reaction), at(i.fn);
        }
      } finally {
        G(r), M(n);
      }
    }
    H = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
function or() {
  return !0;
}
function Re(e) {
  if (typeof e != "object" || e === null || je in e)
    return e;
  const t = er(e);
  if (t !== ln && t !== on)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Tt(e), a = /* @__PURE__ */ F(0), i = m, s = (l) => {
    var u = m;
    M(i);
    var o = l();
    return M(u), o;
  };
  return n && r.set("length", /* @__PURE__ */ F(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, u, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && yn();
        var c = r.get(u);
        return c === void 0 ? c = s(() => {
          var d = /* @__PURE__ */ F(o.value);
          return r.set(u, d), d;
        }) : N(c, o.value, !0), !0;
      },
      deleteProperty(l, u) {
        var o = r.get(u);
        if (o === void 0) {
          if (u in l) {
            const f = s(() => /* @__PURE__ */ F(I));
            r.set(u, f), ct(a);
          }
        } else {
          if (n && typeof u == "string") {
            var c = (
              /** @type {Source<number>} */
              r.get("length")
            ), d = Number(u);
            Number.isInteger(d) && d < c.v && N(c, d);
          }
          N(o, I), ct(a);
        }
        return !0;
      },
      get(l, u, o) {
        var v;
        if (u === je)
          return e;
        var c = r.get(u), d = u in l;
        if (c === void 0 && (!d || (v = xe(l, u)) != null && v.writable) && (c = s(() => {
          var h = Re(d ? l[u] : I), p = /* @__PURE__ */ F(h);
          return p;
        }), r.set(u, c)), c !== void 0) {
          var f = w(c);
          return f === I ? void 0 : f;
        }
        return Reflect.get(l, u, o);
      },
      getOwnPropertyDescriptor(l, u) {
        var o = Reflect.getOwnPropertyDescriptor(l, u);
        if (o && "value" in o) {
          var c = r.get(u);
          c && (o.value = w(c));
        } else if (o === void 0) {
          var d = r.get(u), f = d == null ? void 0 : d.v;
          if (d !== void 0 && f !== I)
            return {
              enumerable: !0,
              configurable: !0,
              value: f,
              writable: !0
            };
        }
        return o;
      },
      has(l, u) {
        var f;
        if (u === je)
          return !0;
        var o = r.get(u), c = o !== void 0 && o.v !== I || Reflect.has(l, u);
        if (o !== void 0 || b !== null && (!c || (f = xe(l, u)) != null && f.writable)) {
          o === void 0 && (o = s(() => {
            var v = c ? Re(l[u]) : I, h = /* @__PURE__ */ F(v);
            return h;
          }), r.set(u, o));
          var d = w(o);
          if (d === I)
            return !1;
        }
        return c;
      },
      set(l, u, o, c) {
        var C;
        var d = r.get(u), f = u in l;
        if (n && u === "length")
          for (var v = o; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var h = r.get(v + "");
            h !== void 0 ? N(h, I) : v in l && (h = s(() => /* @__PURE__ */ F(I)), r.set(v + "", h));
          }
        if (d === void 0)
          (!f || (C = xe(l, u)) != null && C.writable) && (d = s(() => /* @__PURE__ */ F(void 0)), N(d, Re(o)), r.set(u, d));
        else {
          f = d.v !== I;
          var p = s(() => Re(o));
          N(d, p);
        }
        var $ = Reflect.getOwnPropertyDescriptor(l, u);
        if ($ != null && $.set && $.set.call(c, o), !f) {
          if (n && typeof u == "string") {
            var _ = (
              /** @type {Source<number>} */
              r.get("length")
            ), E = Number(u);
            Number.isInteger(E) && E >= _.v && N(_, E + 1);
          }
          ct(a);
        }
        return !0;
      },
      ownKeys(l) {
        w(a);
        var u = Reflect.ownKeys(l).filter((d) => {
          var f = r.get(d);
          return f === void 0 || f.v !== I;
        });
        for (var [o, c] of r)
          c.v !== I && !(o in l) && u.push(o);
        return u;
      },
      setPrototypeOf() {
        mn();
      }
    }
  );
}
function ct(e, t = 1) {
  N(e, e.v + t);
}
// @__NO_SIDE_EFFECTS__
function It(e) {
  var t = W | re, r = m !== null && (m.f & W) !== 0 ? (
    /** @type {Derived} */
    m
  ) : null;
  return b === null || r !== null && (r.f & Y) !== 0 ? t |= Y : b.f |= nr, {
    ctx: H,
    deps: null,
    effects: null,
    equals: sr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: r ?? b,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function xn(e) {
  const t = /* @__PURE__ */ It(e);
  return t.equals = lr, t;
}
function fr(e) {
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
function Tn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & W) === 0)
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function ur(e) {
  var t, r = b;
  G(Tn(e));
  try {
    fr(e), t = Or(e);
  } finally {
    G(r);
  }
  return t;
}
function cr(e) {
  var t = ur(e);
  if (e.equals(t) || (e.v = t, e.wv = Sr()), !Se) {
    var r = (ue || (e.f & Y) !== 0) && e.deps !== null ? we : X;
    J(e, r);
  }
}
const Le = /* @__PURE__ */ new Map();
function Je(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: sr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function F(e, t) {
  const r = Je(e);
  return Fn(r), r;
}
// @__NO_SIDE_EFFECTS__
function dr(e, t = !1, r = !0) {
  const n = Je(e);
  return t || (n.equals = lr), n;
}
function N(e, t, r = !1) {
  m !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!K || (m.f & Bt) !== 0) && or() && (m.f & (W | nt | Bt)) !== 0 && !(S != null && S[1].includes(e) && S[0] === m) && bn();
  let n = r ? Re(t) : t;
  return Cn(e, n);
}
function Cn(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Se ? Le.set(e, t) : Le.set(e, r), e.v = t, (e.f & W) !== 0 && ((e.f & re) !== 0 && ur(
      /** @type {Derived} */
      e
    ), J(e, (e.f & Y) === 0 ? X : we)), e.wv = Sr(), vr(e, re), b !== null && (b.f & X) !== 0 && (b.f & (ne | $e)) === 0 && (B === null ? Pn([e]) : B.push(e));
  }
  return t;
}
function vr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, a = 0; a < n; a++) {
      var i = r[a], s = i.f;
      (s & re) === 0 && (J(i, t), (s & (X | Y)) !== 0 && ((s & W) !== 0 ? vr(
        /** @type {Derived} */
        i,
        we
      ) : Dt(
        /** @type {Effect} */
        i
      )));
    }
}
function it(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let y = !1;
function P(e) {
  y = e;
}
let T;
function U(e) {
  if (e === null)
    throw it(), Ee;
  return T = e;
}
function Te() {
  return U(
    /** @type {TemplateNode} */
    /* @__PURE__ */ ye(T)
  );
}
function le(e) {
  if (y) {
    if (/* @__PURE__ */ ye(T) !== null)
      throw it(), Ee;
    T = e;
  }
}
function vt() {
  for (var e = 0, t = T; ; ) {
    if (t.nodeType === qe) {
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
function hr(e) {
  if (!e || e.nodeType !== qe)
    throw it(), Ee;
  return (
    /** @type {Comment} */
    e.data
  );
}
var Wt, _r, pr, gr;
function ht() {
  if (Wt === void 0) {
    Wt = window, _r = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    pr = xe(t, "firstChild").get, gr = xe(t, "nextSibling").get, Vt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Vt(r) && (r.__t = void 0);
  }
}
function Ce(e = "") {
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
  if (!y)
    return /* @__PURE__ */ ge(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ ge(T)
  );
  if (r === null)
    r = T.appendChild(Ce());
  else if (t && r.nodeType !== ar) {
    var n = Ce();
    return r == null || r.before(n), U(n), n;
  }
  return U(r), r;
}
function We(e, t = 1, r = !1) {
  let n = y ? T : e;
  for (var a; t--; )
    a = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ ye(n);
  if (!y)
    return n;
  if (r && (n == null ? void 0 : n.nodeType) !== ar) {
    var i = Ce();
    return n === null ? a == null || a.after(i) : n.before(i), U(i), i;
  }
  return U(n), /** @type {TemplateNode} */
  n;
}
function $r(e) {
  e.textContent = "";
}
function Nn(e) {
  b === null && m === null && gn(), m !== null && (m.f & Y) !== 0 && b === null && pn(), Se && _n();
}
function Sn(e, t) {
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
    b: a && a.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null
  };
  if (r)
    try {
      Lt(i), i.f |= At;
    } catch (u) {
      throw z(i), u;
    }
  else t !== null && Dt(i);
  var s = r && i.deps === null && i.first === null && i.nodes_start === null && i.teardown === null && (i.f & (nr | Nt)) === 0;
  if (!s && n && (a !== null && Sn(i, a), m !== null && (m.f & W) !== 0)) {
    var l = (
      /** @type {Derived} */
      m
    );
    (l.effects ?? (l.effects = [])).push(i);
  }
  return i;
}
function An(e) {
  const t = me(rt, null, !1);
  return J(t, X), t.teardown = e, t;
}
function wr(e) {
  Nn();
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
    var n = at(e);
    return n;
  }
}
function On(e) {
  const t = me($e, e, !0);
  return () => {
    z(t);
  };
}
function Rn(e) {
  const t = me($e, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? De(t, () => {
      z(t), n(void 0);
    }) : (z(t), n(void 0));
  });
}
function at(e) {
  return me(rr, e, !1);
}
function yr(e) {
  return me(rt, e, !0);
}
function ve(e, t = [], r = It) {
  const n = t.map(r);
  return st(() => e(...n.map(w)));
}
function st(e, t = 0) {
  var r = me(rt | nt | t, e, !0);
  return r;
}
function Ne(e, t = !0) {
  return me(rt | ne, e, !0, t);
}
function mr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Se, n = m;
    Xt(!0), M(null);
    try {
      t.call(null);
    } finally {
      Xt(r), M(n);
    }
  }
}
function br(e, t = !1) {
  var a;
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    (a = r.ac) == null || a.abort(ir);
    var n = r.next;
    (r.f & $e) !== 0 ? r.parent = null : z(r, t), r = n;
  }
}
function In(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ne) === 0 && z(t), t = r;
  }
}
function z(e, t = !0) {
  var r = !1;
  (t || (e.f & un) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (Mn(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), r = !0), br(e, t && !r), Qe(e, 0), J(e, St);
  var n = e.transitions;
  if (n !== null)
    for (const i of n)
      i.stop();
  mr(e);
  var a = e.parent;
  a !== null && a.first !== null && kr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Mn(e, t) {
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
function De(e, t) {
  var r = [];
  Mt(e, r, !0), Er(r, () => {
    z(e), t && t();
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
function Mt(e, t, r) {
  if ((e.f & te) === 0) {
    if (e.f ^= te, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var a = n.next, i = (n.f & Ue) !== 0 || (n.f & ne) !== 0;
      Mt(n, t, i ? r : !1), n = a;
    }
  }
}
function Fe(e) {
  xr(e, !0);
}
function xr(e, t) {
  if ((e.f & te) !== 0) {
    e.f ^= te;
    for (var r = e.first; r !== null; ) {
      var n = r.next, a = (r.f & Ue) !== 0 || (r.f & ne) !== 0;
      xr(r, a ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const i of e.transitions)
        (i.is_global || t) && i.in();
  }
}
let Pe = [], _t = [];
function Tr() {
  var e = Pe;
  Pe = [], tr(e);
}
function qn() {
  var e = _t;
  _t = [], tr(e);
}
function qt(e) {
  Pe.length === 0 && queueMicrotask(Tr), Pe.push(e);
}
function Ln() {
  Pe.length > 0 && Tr(), _t.length > 0 && qn();
}
function Dn(e) {
  var t = (
    /** @type {Effect} */
    b
  );
  if ((t.f & At) === 0) {
    if ((t.f & Nt) === 0)
      throw e;
    t.fn(e);
  } else
    Cr(e, t);
}
function Cr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Nt) !== 0)
      try {
        t.b.error(e);
        return;
      } catch {
      }
    t = t.parent;
  }
  throw e;
}
let Ye = !1, He = null, pe = !1, Se = !1;
function Xt(e) {
  Se = e;
}
let Ie = [];
let m = null, K = !1;
function M(e) {
  m = e;
}
let b = null;
function G(e) {
  b = e;
}
let S = null;
function Fn(e) {
  m !== null && m.f & dt && (S === null ? S = [m, [e]] : S[1].push(e));
}
let A = null, D = 0, B = null;
function Pn(e) {
  B = e;
}
let Nr = 1, Ze = 0, ue = !1;
function Sr() {
  return ++Nr;
}
function lt(e) {
  var d;
  var t = e.f;
  if ((t & re) !== 0)
    return !0;
  if ((t & we) !== 0) {
    var r = e.deps, n = (t & Y) !== 0;
    if (r !== null) {
      var a, i, s = (t & ze) !== 0, l = n && b !== null && !ue, u = r.length;
      if (s || l) {
        var o = (
          /** @type {Derived} */
          e
        ), c = o.parent;
        for (a = 0; a < u; a++)
          i = r[a], (s || !((d = i == null ? void 0 : i.reactions) != null && d.includes(o))) && (i.reactions ?? (i.reactions = [])).push(o);
        s && (o.f ^= ze), l && c !== null && (c.f & Y) === 0 && (o.f ^= Y);
      }
      for (a = 0; a < u; a++)
        if (i = r[a], lt(
          /** @type {Derived} */
          i
        ) && cr(
          /** @type {Derived} */
          i
        ), i.wv > e.wv)
          return !0;
    }
    (!n || b !== null && !ue) && J(e, X);
  }
  return !1;
}
function Ar(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null)
    for (var a = 0; a < n.length; a++) {
      var i = n[a];
      S != null && S[1].includes(e) && S[0] === m || ((i.f & W) !== 0 ? Ar(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? J(i, re) : (i.f & X) !== 0 && J(i, we), Dt(
        /** @type {Effect} */
        i
      )));
    }
}
function Or(e) {
  var v;
  var t = A, r = D, n = B, a = m, i = ue, s = S, l = H, u = K, o = e.f;
  A = /** @type {null | Value[]} */
  null, D = 0, B = null, ue = (o & Y) !== 0 && (K || !pe || m === null), m = (o & (ne | $e)) === 0 ? e : null, S = null, jt(e.ctx), K = !1, Ze++, e.f |= dt, e.ac !== null && (e.ac.abort(ir), e.ac = null);
  try {
    var c = (
      /** @type {Function} */
      (0, e.fn)()
    ), d = e.deps;
    if (A !== null) {
      var f;
      if (Qe(e, D), d !== null && D > 0)
        for (d.length = D + A.length, f = 0; f < A.length; f++)
          d[D + f] = A[f];
      else
        e.deps = d = A;
      if (!ue || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      (o & W) !== 0 && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (f = D; f < d.length; f++)
          ((v = d[f]).reactions ?? (v.reactions = [])).push(e);
    } else d !== null && D < d.length && (Qe(e, D), d.length = D);
    if (or() && B !== null && !K && d !== null && (e.f & (W | we | re)) === 0)
      for (f = 0; f < /** @type {Source[]} */
      B.length; f++)
        Ar(
          B[f],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Ze++, B !== null && (n === null ? n = B : n.push(.../** @type {Source[]} */
    B))), c;
  } catch (h) {
    Dn(h);
  } finally {
    A = t, D = r, B = n, m = a, ue = i, S = s, jt(l), K = u, e.f ^= dt;
  }
}
function Yn(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = an.call(r, e);
    if (n !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[n] = r[a], r.pop());
    }
  }
  r === null && (t.f & W) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !A.includes(t)) && (J(t, we), (t.f & (Y | ze)) === 0 && (t.f ^= ze), fr(
    /** @type {Derived} **/
    t
  ), Qe(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Qe(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Yn(e, r[n]);
}
function Lt(e) {
  var t = e.f;
  if ((t & St) === 0) {
    J(e, X);
    var r = b, n = pe;
    b = e, pe = !0;
    try {
      (t & nt) !== 0 ? In(e) : br(e), mr(e);
      var a = Or(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Nr;
      var i;
      Ut && kn && (e.f & re) !== 0 && e.deps;
    } finally {
      pe = n, b = r;
    }
  }
}
function Hn() {
  try {
    $n();
  } catch (e) {
    if (He !== null)
      Cr(e, He);
    else
      throw e;
  }
}
function Rr() {
  var e = pe;
  try {
    var t = 0;
    for (pe = !0; Ie.length > 0; ) {
      t++ > 1e3 && Hn();
      var r = Ie, n = r.length;
      Ie = [];
      for (var a = 0; a < n; a++) {
        var i = Vn(r[a]);
        Un(i);
      }
      Le.clear();
    }
  } finally {
    Ye = !1, pe = e, He = null;
  }
}
function Un(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var n = e[r];
      (n.f & (St | te)) === 0 && lt(n) && (Lt(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? kr(n) : n.fn = null));
    }
}
function Dt(e) {
  Ye || (Ye = !0, queueMicrotask(Rr));
  for (var t = He = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if ((r & ($e | ne)) !== 0) {
      if ((r & X) === 0) return;
      t.f ^= X;
    }
  }
  Ie.push(t);
}
function Vn(e) {
  for (var t = [], r = e; r !== null; ) {
    var n = r.f, a = (n & (ne | $e)) !== 0, i = a && (n & X) !== 0;
    if (!i && (n & te) === 0) {
      (n & rr) !== 0 ? t.push(r) : a ? r.f ^= X : lt(r) && Lt(r);
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
    if (Ln(), Ie.length === 0)
      return Ye = !1, He = null, /** @type {T} */
      t;
    Ye = !0, Rr();
  }
}
function w(e) {
  var t = e.f, r = (t & W) !== 0;
  if (m !== null && !K) {
    if (!(S != null && S[1].includes(e)) || S[0] !== m) {
      var n = m.deps;
      e.rv < Ze && (e.rv = Ze, A === null && n !== null && n[D] === e ? D++ : A === null ? A = [e] : (!ue || !A.includes(e)) && A.push(e));
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
  e, lt(a) && cr(a)), Se && Le.has(e) ? Le.get(e) : e.v;
}
function Ft(e) {
  var t = K;
  try {
    return K = !0, e();
  } finally {
    K = t;
  }
}
const Bn = -7169;
function J(e, t) {
  e.f = e.f & Bn | t;
}
function jn(e) {
  var t = m, r = b;
  M(null), G(null);
  try {
    return e();
  } finally {
    M(t), G(r);
  }
}
const Ir = /* @__PURE__ */ new Set(), pt = /* @__PURE__ */ new Set();
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    Ir.add(e[t]);
  for (var r of pt)
    r(e);
}
function Ve(e) {
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
    var o = a.indexOf(t);
    if (o === -1)
      return;
    u <= o && (s = u);
  }
  if (i = /** @type {Element} */
  a[s] || e.target, i !== t) {
    Ke(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || r;
      }
    });
    var c = m, d = b;
    M(null), G(null);
    try {
      for (var f, v = []; i !== null; ) {
        var h = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var p = i["__" + n];
          if (p != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i))
            if (Tt(p)) {
              var [$, ..._] = p;
              $.apply(i, [e, ..._]);
            } else
              p.call(i, e);
        } catch (C) {
          f ? v.push(C) : f = C;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        i = h;
      }
      if (f) {
        for (let C of v)
          queueMicrotask(() => {
            throw C;
          });
        throw f;
      }
    } finally {
      e.__root = t, delete e.currentTarget, M(c), G(d);
    }
  }
}
function Xn(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Me(e, t) {
  var r = (
    /** @type {Effect} */
    b
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Ae(e, t) {
  var r = (t & en) !== 0, n = (t & tn) !== 0, a, i = !e.startsWith("<!>");
  return () => {
    if (y)
      return Me(T, null), T;
    a === void 0 && (a = Xn(i ? e : "<!>" + e), r || (a = /** @type {Node} */
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
      Me(l, u);
    } else
      Me(s, s);
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
const Gn = ["touchstart", "touchmove"];
function Kn(e) {
  return Gn.includes(e);
}
const zn = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Jn(e) {
  return zn.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
let et = !0;
function Gt(e) {
  et = e;
}
function Zn(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Mr(e, t) {
  return qr(e, t);
}
function Qn(e, t) {
  ht(), t.intro = t.intro ?? !1;
  const r = t.target, n = y, a = T;
  try {
    for (var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ge(r)
    ); i && (i.nodeType !== qe || /** @type {Comment} */
    i.data !== kt); )
      i = /** @type {TemplateNode} */
      /* @__PURE__ */ ye(i);
    if (!i)
      throw Ee;
    P(!0), U(
      /** @type {Comment} */
      i
    ), Te();
    const s = qr(e, { ...t, anchor: i });
    if (T === null || T.nodeType !== qe || /** @type {Comment} */
    T.data !== xt)
      throw it(), Ee;
    return P(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Ee)
      return t.recover === !1 && wn(), ht(), $r(r), P(!1), Mr(e, t);
    throw s;
  } finally {
    P(n), U(a);
  }
}
const be = /* @__PURE__ */ new Map();
function qr(e, { target: t, anchor: r, props: n = {}, events: a, context: i, intro: s = !0 }) {
  ht();
  var l = /* @__PURE__ */ new Set(), u = (d) => {
    for (var f = 0; f < d.length; f++) {
      var v = d[f];
      if (!l.has(v)) {
        l.add(v);
        var h = Kn(v);
        t.addEventListener(v, Ve, { passive: h });
        var p = be.get(v);
        p === void 0 ? (document.addEventListener(v, Ve, { passive: h }), be.set(v, 1)) : be.set(v, p + 1);
      }
    }
  };
  u(Ct(Ir)), pt.add(u);
  var o = void 0, c = Rn(() => {
    var d = r ?? t.appendChild(Ce());
    return Ne(() => {
      if (i) {
        Ot({});
        var f = (
          /** @type {ComponentContext} */
          H
        );
        f.c = i;
      }
      a && (n.$$events = a), y && Me(
        /** @type {TemplateNode} */
        d,
        null
      ), et = s, o = e(d, n) || {}, et = !0, y && (b.nodes_end = T), i && Rt();
    }), () => {
      var h;
      for (var f of l) {
        t.removeEventListener(f, Ve);
        var v = (
          /** @type {number} */
          be.get(f)
        );
        --v === 0 ? (document.removeEventListener(f, Ve), be.delete(f)) : be.set(f, v);
      }
      pt.delete(u), d !== r && ((h = d.parentNode) == null || h.removeChild(d));
    };
  });
  return gt.set(o, c), o;
}
let gt = /* @__PURE__ */ new WeakMap();
function ei(e, t) {
  const r = gt.get(e);
  return r ? (gt.delete(e), r(t)) : Promise.resolve();
}
function Lr(e) {
  H === null && En(), wr(() => {
    const t = Ft(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function $t(e, t, [r, n] = [0, 0]) {
  y && r === 0 && Te();
  var a = e, i = null, s = null, l = I, u = r > 0 ? Ue : 0, o = !1;
  const c = (f, v = !0) => {
    o = !0, d(v, f);
  }, d = (f, v) => {
    if (l === (l = f)) return;
    let h = !1;
    if (y && n !== -1) {
      if (r === 0) {
        const $ = hr(a);
        $ === kt ? n = 0 : $ === Et ? n = 1 / 0 : (n = parseInt($.substring(1)), n !== n && (n = l ? 1 / 0 : -1));
      }
      const p = n > r;
      !!l === p && (a = vt(), U(a), P(!1), h = !0, n = -1);
    }
    l ? (i ? Fe(i) : v && (i = Ne(() => v(a))), s && De(s, () => {
      s = null;
    })) : (s ? Fe(s) : v && (s = Ne(() => v(a, [r + 1, n]))), i && De(i, () => {
      i = null;
    })), h && P(!0);
  };
  st(() => {
    o = !1, t(c), o || d(null, null);
  }, u), y && (a = T);
}
function ti(e, t, r, n) {
  for (var a = [], i = t.length, s = 0; s < i; s++)
    Mt(t[s].e, a, !0);
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
    for (var o = 0; o < i; o++) {
      var c = t[o];
      l || (n.delete(c.k), fe(e, c.prev, c.next)), z(c.e, !l);
    }
  });
}
function ri(e, t, r, n, a, i = null) {
  var s = e, l = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var u = (
      /** @type {Element} */
      e
    );
    s = y ? U(
      /** @type {Comment | Text} */
      /* @__PURE__ */ ge(u)
    ) : u.appendChild(Ce());
  }
  y && Te();
  var o = null, c = !1, d = /* @__PURE__ */ xn(() => {
    var f = r();
    return Tt(f) ? f : f == null ? [] : Ct(f);
  });
  st(() => {
    var f = w(d), v = f.length;
    if (c && v === 0)
      return;
    c = v === 0;
    let h = !1;
    if (y) {
      var p = hr(s) === Et;
      p !== (v === 0) && (s = vt(), U(s), P(!1), h = !0);
    }
    if (y) {
      for (var $ = null, _, E = 0; E < v; E++) {
        if (T.nodeType === qe && /** @type {Comment} */
        T.data === xt) {
          s = /** @type {Comment} */
          T, h = !0, P(!1);
          break;
        }
        var C = f[E], q = n(C, E);
        _ = Dr(
          T,
          l,
          $,
          null,
          C,
          q,
          E,
          a,
          t,
          r
        ), l.items.set(q, _), $ = _;
      }
      v > 0 && U(vt());
    }
    y || ni(f, l, s, a, t, n, r), i !== null && (v === 0 ? o ? Fe(o) : o = Ne(() => i(s)) : o !== null && De(o, () => {
      o = null;
    })), h && P(!0), w(d);
  }), y && (s = T);
}
function ni(e, t, r, n, a, i, s) {
  var l = e.length, u = t.items, o = t.first, c = o, d, f = null, v = [], h = [], p, $, _, E;
  for (E = 0; E < l; E += 1) {
    if (p = e[E], $ = i(p, E), _ = u.get($), _ === void 0) {
      var C = c ? (
        /** @type {TemplateNode} */
        c.e.nodes_start
      ) : r;
      f = Dr(
        C,
        t,
        f,
        f === null ? t.first : f.next,
        p,
        $,
        E,
        n,
        a,
        s
      ), u.set($, f), v = [], h = [], c = f.next;
      continue;
    }
    if ((_.e.f & te) !== 0 && Fe(_.e), _ !== c) {
      if (d !== void 0 && d.has(_)) {
        if (v.length < h.length) {
          var q = h[0], L;
          f = q.prev;
          var ie = v[0], ae = v[v.length - 1];
          for (L = 0; L < v.length; L += 1)
            Kt(v[L], q, r);
          for (L = 0; L < h.length; L += 1)
            d.delete(h[L]);
          fe(t, ie.prev, ae.next), fe(t, f, ie), fe(t, ae, q), c = q, f = ae, E -= 1, v = [], h = [];
        } else
          d.delete(_), Kt(_, c, r), fe(t, _.prev, _.next), fe(t, _, f === null ? t.first : f.next), fe(t, f, _), f = _;
        continue;
      }
      for (v = [], h = []; c !== null && c.k !== $; )
        (c.e.f & te) === 0 && (d ?? (d = /* @__PURE__ */ new Set())).add(c), h.push(c), c = c.next;
      if (c === null)
        continue;
      _ = c;
    }
    v.push(_), f = _, c = _.next;
  }
  if (c !== null || d !== void 0) {
    for (var se = d === void 0 ? [] : Ct(d); c !== null; )
      (c.e.f & te) === 0 && se.push(c), c = c.next;
    var g = se.length;
    if (g > 0) {
      var k = l === 0 ? r : null;
      ti(t, se, k, u);
    }
  }
  b.first = t.first && t.first.e, b.last = f && f.e;
}
function Dr(e, t, r, n, a, i, s, l, u, o) {
  var c = (u & zr) !== 0, d = (u & Zr) === 0, f = c ? d ? /* @__PURE__ */ dr(a, !1, !1) : Je(a) : a, v = (u & Jr) === 0 ? s : Je(s), h = {
    i: v,
    v: f,
    k: i,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: n
  };
  try {
    return h.e = Ne(() => l(e, f, v, o), y), h.e.prev = r && r.e, h.e.next = n && n.e, r === null ? t.first = h : (r.next = h, r.e.next = h.e), n !== null && (n.prev = h, n.e.prev = h.e), h;
  } finally {
  }
}
function Kt(e, t, r) {
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
function ii(e, t, r, n, a, i) {
  let s = y;
  y && Te();
  var l, u, o = null;
  y && T.nodeType === vn && (o = /** @type {Element} */
  T, Te());
  var c = (
    /** @type {TemplateNode} */
    y ? T : e
  ), d;
  st(() => {
    const f = t() || null;
    var v = f === "svg" ? nn : null;
    f !== l && (d && (f === null ? De(d, () => {
      d = null, u = null;
    }) : f === u ? Fe(d) : (z(d), Gt(!1))), f && f !== u && (d = Ne(() => {
      if (o = y ? (
        /** @type {Element} */
        o
      ) : v ? document.createElementNS(v, f) : document.createElement(f), Me(o, o), n) {
        y && Jn(f) && o.append(document.createComment(""));
        var h = (
          /** @type {TemplateNode} */
          y ? /* @__PURE__ */ ge(o) : o.appendChild(Ce())
        );
        y && (h === null ? P(!1) : U(h)), n(o, h);
      }
      b.nodes_end = o, c.before(o);
    })), l = f, l && (u = l), Gt(!0));
  }, Ue), s && (P(!0), U(c));
}
function Fr(e, t) {
  qt(() => {
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
function ai(e, t, r) {
  var n = e == null ? "" : "" + e;
  return n = n ? n + " " + t : t, n === "" ? null : n;
}
function si(e, t) {
  return e == null ? null : String(e);
}
function ce(e, t, r, n, a, i) {
  var s = e.__className;
  if (y || s !== r || s === void 0) {
    var l = ai(r, n);
    (!y || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : e.className = l), e.__className = r;
  }
  return i;
}
function oe(e, t, r, n) {
  var a = e.__style;
  if (y || a !== t) {
    var i = si(t);
    (!y || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return n;
}
const li = Symbol("is custom element"), oi = Symbol("is html");
function Pr(e, t, r, n) {
  var a = fi(e);
  y && (a[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || a[t] !== (a[t] = r) && (t === "loading" && (e[dn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Yr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function zt(e, t, r) {
  var n = m, a = b;
  let i = y;
  y && P(!1), M(null), G(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    t !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (wt.has(e.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(e.tagName.toLowerCase()) ? Yr(e).includes(t) : r && typeof r == "object") ? e[t] = r : Pr(e, t, r == null ? r : String(r));
  } finally {
    M(n), G(a), i && P(!0);
  }
}
function fi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [li]: e.nodeName.includes("-"),
      [oi]: e.namespaceURI === rn
    })
  );
}
var wt = /* @__PURE__ */ new Map();
function Yr(e) {
  var t = wt.get(e.nodeName);
  if (t) return t;
  wt.set(e.nodeName, t = []);
  for (var r, n = e, a = Element.prototype; a !== n; ) {
    r = sn(n);
    for (var i in r)
      r[i].set && t.push(i);
    n = er(n);
  }
  return t;
}
const ui = () => performance.now(), ee = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => ui(),
  tasks: /* @__PURE__ */ new Set()
};
function Hr() {
  const e = ee.now();
  ee.tasks.forEach((t) => {
    t.c(e) || (ee.tasks.delete(t), t.f());
  }), ee.tasks.size !== 0 && ee.tick(Hr);
}
function ci(e) {
  let t;
  return ee.tasks.size === 0 && ee.tick(Hr), {
    promise: new Promise((r) => {
      ee.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      ee.tasks.delete(t);
    }
  };
}
function Be(e, t) {
  jn(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function di(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Jt(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [a, i] = n.split(":");
    if (!a || i === void 0) break;
    const s = di(a.trim());
    t[s] = i.trim();
  }
  return t;
}
const vi = (e) => e;
function Ur(e, t, r, n) {
  var a = (e & Qr) !== 0, i = "both", s, l = t.inert, u = t.style.overflow, o, c;
  function d() {
    var $ = m, _ = b;
    M(null), G(null);
    try {
      return s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
      {}, {
        direction: i
      }));
    } finally {
      M($), G(_);
    }
  }
  var f = {
    is_global: a,
    in() {
      t.inert = l, Be(t, "introstart"), o = yt(t, d(), c, 1, () => {
        Be(t, "introend"), o == null || o.abort(), o = s = void 0, t.style.overflow = u;
      });
    },
    out($) {
      t.inert = !0, Be(t, "outrostart"), c = yt(t, d(), o, 0, () => {
        Be(t, "outroend"), $ == null || $();
      });
    },
    stop: () => {
      o == null || o.abort(), c == null || c.abort();
    }
  }, v = (
    /** @type {Effect} */
    b
  );
  if ((v.transitions ?? (v.transitions = [])).push(f), et) {
    var h = a;
    if (!h) {
      for (var p = (
        /** @type {Effect | null} */
        v.parent
      ); p && (p.f & Ue) !== 0; )
        for (; (p = p.parent) && (p.f & nt) === 0; )
          ;
      h = !p || (p.f & At) !== 0;
    }
    h && at(() => {
      Ft(() => f.in());
    });
  }
}
function yt(e, t, r, n, a) {
  var i = n === 1;
  if (fn(t)) {
    var s, l = !1;
    return qt(() => {
      if (!l) {
        var $ = t({ direction: i ? "in" : "out" });
        s = yt(e, $, r, n, a);
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
      abort: Oe,
      deactivate: Oe,
      reset: Oe,
      t: () => n
    };
  const { delay: u = 0, css: o, tick: c, easing: d = vi } = t;
  var f = [];
  if (i && r === void 0 && (c && c(0, 1), o)) {
    var v = Jt(o(0, 1));
    f.push(v, v);
  }
  var h = () => 1 - n, p = e.animate(f, { duration: u, fill: "forwards" });
  return p.onfinish = () => {
    p.cancel();
    var $ = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var _ = n - $, E = (
      /** @type {number} */
      t.duration * Math.abs(_)
    ), C = [];
    if (E > 0) {
      var q = !1;
      if (o)
        for (var L = Math.ceil(E / 16.666666666666668), ie = 0; ie <= L; ie += 1) {
          var ae = $ + _ * d(ie / L), se = Jt(o(ae, 1 - ae));
          C.push(se), q || (q = se.overflow === "hidden");
        }
      q && (e.style.overflow = "hidden"), h = () => {
        var g = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          p.currentTime
        );
        return $ + _ * d(g / E);
      }, c && ci(() => {
        if (p.playState !== "running") return !1;
        var g = h();
        return c(g, 1 - g), !0;
      });
    }
    p = e.animate(C, { duration: E, fill: "forwards" }), p.onfinish = () => {
      h = () => n, c == null || c(n, 1 - n), a();
    };
  }, {
    abort: () => {
      p && (p.cancel(), p.effect = null, p.onfinish = Oe);
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
function Zt(e, t) {
  return e === t || (e == null ? void 0 : e[je]) === t;
}
function hi(e = {}, t, r, n) {
  return at(() => {
    var a, i;
    return yr(() => {
      a = i, i = [], Ft(() => {
        e !== r(...i) && (t(e, ...i), a && Zt(r(...a), e) && t(null, ...a));
      });
    }), () => {
      qt(() => {
        i && Zt(r(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
function _i(e) {
  var t;
  return ((t = e.ctx) == null ? void 0 : t.d) ?? !1;
}
function ke(e, t, r, n) {
  var a = (
    /** @type {V} */
    n
  ), i = !0, s = () => (i && (i = !1, a = /** @type {V} */
  n), a), l;
  l = /** @type {V} */
  e[t], l === void 0 && n !== void 0 && (l = s());
  var u;
  u = () => {
    var c = (
      /** @type {V} */
      e[t]
    );
    return c === void 0 ? s() : (i = !0, c);
  };
  var o = /* @__PURE__ */ It(u);
  return function(c, d) {
    if (arguments.length > 0) {
      const f = d ? w(o) : c;
      return N(o, f), a !== void 0 && (a = f), c;
    }
    return _i(o) ? o.v : w(o);
  };
}
function pi(e) {
  return new gi(e);
}
var Q, j;
class gi {
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
    var r = /* @__PURE__ */ new Map(), n = (s, l) => {
      var u = /* @__PURE__ */ dr(l, !1, !1);
      return r.set(s, u), u;
    };
    const a = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, l) {
          return w(r.get(l) ?? n(l, Reflect.get(s, l)));
        },
        has(s, l) {
          return l === cn ? !0 : (w(r.get(l) ?? n(l, Reflect.get(s, l))), Reflect.has(s, l));
        },
        set(s, l, u) {
          return N(r.get(l) ?? n(l, u), u), Reflect.set(s, l, u);
        }
      }
    );
    ut(this, j, (t.hydrate ? Qn : Mr)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: a,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && he(), ut(this, Q, a.$$events);
    for (const s of Object.keys(R(this, j)))
      s === "$set" || s === "$destroy" || s === "$on" || Ke(this, s, {
        get() {
          return R(this, j)[s];
        },
        /** @param {any} value */
        set(l) {
          R(this, j)[s] = l;
        },
        enumerable: !0
      });
    R(this, j).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(a, s);
    }, R(this, j).$destroy = () => {
      ei(R(this, j));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    R(this, j).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    R(this, Q)[t] = R(this, Q)[t] || [];
    const n = (...a) => r.call(this, ...a);
    return R(this, Q)[t].push(n), () => {
      R(this, Q)[t] = R(this, Q)[t].filter(
        /** @param {any} fn */
        (a) => a !== n
      );
    };
  }
  $destroy() {
    R(this, j).$destroy();
  }
}
Q = new WeakMap(), j = new WeakMap();
let Vr;
typeof HTMLElement == "function" && (Vr = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    O(this, "$$ctor");
    /** Slots */
    O(this, "$$s");
    /** @type {any} The Svelte component instance */
    O(this, "$$c");
    /** Whether or not the custom element is connected */
    O(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    O(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    O(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    O(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    O(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    O(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    O(this, "$$me");
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
      const r = {}, n = $i(this);
      for (const a of this.$$s)
        a in n && (a === "default" && !this.$$d.children ? (this.$$d.children = t(a), r.default = !0) : r[a] = t(a));
      for (const a of this.attributes) {
        const i = this.$$g_p(a.name);
        i in this.$$d || (this.$$d[i] = Xe(i, a.value, this.$$p_d, "toProp"));
      }
      for (const a in this.$$p_d)
        !(a in this.$$d) && this[a] !== void 0 && (this.$$d[a] = this[a], delete this[a]);
      this.$$c = pi({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = On(() => {
        yr(() => {
          var a;
          this.$$r = !0;
          for (const i of Ge(this.$$c)) {
            if (!((a = this.$$p_d[i]) != null && a.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const s = Xe(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Xe(t, n, this.$$p_d, "toProp"), (a = this.$$c) == null || a.$set({ [t]: this.$$d[t] }));
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
function Xe(e, t, r, n) {
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
function $i(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Br(e, t, r, n, a, i) {
  let s = class extends Vr {
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
    Ke(s.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(u) {
        var d;
        u = Xe(l, u, t), this.$$d[l] = u;
        var o = this.$$c;
        if (o) {
          var c = (d = xe(o, l)) == null ? void 0 : d.get;
          c ? o[l] = u : o.$set({ [l]: u });
        }
      }
    });
  }), n.forEach((l) => {
    Ke(s.prototype, l, {
      get() {
        var u;
        return (u = this.$$c) == null ? void 0 : u[l];
      }
    });
  }), i && (s = i(s)), e.element = /** @type {any} */
  s, s;
}
let tt = /* @__PURE__ */ F(void 0);
const wi = async () => (N(tt, await window.loadCardHelpers().then((e) => e), !0), w(tt)), yi = () => w(tt) ? w(tt) : wi();
function mi(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function jr(e, { delay: t = 0, duration: r = 400, easing: n = mi, axis: a = "y" } = {}) {
  const i = getComputedStyle(e), s = +i.opacity, l = a === "y" ? "height" : "width", u = parseFloat(i[l]), o = a === "y" ? ["top", "bottom"] : ["left", "right"], c = o.map(
    (_) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${_[0].toUpperCase()}${_.slice(1)}`
    )
  ), d = parseFloat(i[`padding${c[0]}`]), f = parseFloat(i[`padding${c[1]}`]), v = parseFloat(i[`margin${c[0]}`]), h = parseFloat(i[`margin${c[1]}`]), p = parseFloat(
    i[`border${c[0]}Width`]
  ), $ = parseFloat(
    i[`border${c[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (_) => `overflow: hidden;opacity: ${Math.min(_ * 20, 1) * s};${l}: ${_ * u}px;padding-${o[0]}: ${_ * d}px;padding-${o[1]}: ${_ * f}px;margin-${o[0]}: ${_ * v}px;margin-${o[1]}: ${_ * h}px;border-${o[0]}-width: ${_ * p}px;border-${o[1]}-width: ${_ * $}px;min-${l}: 0`
  };
}
var bi = /* @__PURE__ */ Ae('<span class="loading svelte-1sdlsm">Loading...</span>'), ki = /* @__PURE__ */ Ae('<div class="outer-container"><!> <!></div>');
const Ei = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function mt(e, t) {
  Ot(t, !0), Fr(e, Ei);
  const r = ke(t, "type", 7, "div"), n = ke(t, "config"), a = ke(t, "hass"), i = ke(t, "marginTop", 7, "0px");
  let s = /* @__PURE__ */ F(void 0), l = /* @__PURE__ */ F(!0);
  wr(() => {
    w(s) && (w(s).hass = a());
  }), Lr(async () => {
    const v = (await yi()).createCardElement(n());
    v.hass = a(), w(s) && (w(s).replaceWith(v), N(s, v, !0), N(l, !1));
  });
  var u = ki(), o = de(u);
  ii(o, r, !1, (f, v) => {
    hi(f, (h) => N(s, h, !0), () => w(s)), Ur(3, f, () => jr);
  });
  var c = We(o, 2);
  {
    var d = (f) => {
      var v = bi();
      _e(f, v);
    };
    $t(c, (f) => {
      w(l) && f(d);
    });
  }
  return le(u), ve(() => oe(u, `margin-top: ${i() ?? ""};`)), _e(e, u), Rt({
    get type() {
      return r();
    },
    set type(f = "div") {
      r(f), he();
    },
    get config() {
      return n();
    },
    set config(f) {
      n(f), he();
    },
    get hass() {
      return a();
    },
    set hass(f) {
      a(f), he();
    },
    get marginTop() {
      return i();
    },
    set marginTop(f = "0px") {
      i(f), he();
    }
  });
}
customElements.define("expander-sub-card", Br(mt, { type: {}, config: {}, hass: {}, marginTop: {} }, [], [], !0));
function xi(e) {
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
var Ti = /* @__PURE__ */ Ae('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), Ci = /* @__PURE__ */ Ae("<button><div> </div> <ha-icon></ha-icon></button>", 2), Ni = /* @__PURE__ */ Ae('<div class="children-container svelte-icqkke"></div>'), Si = /* @__PURE__ */ Ae("<ha-card><!> <!></ha-card>", 2);
const Ai = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function Oi(e, t) {
  Ot(t, !0), Fr(e, Ai);
  const r = ke(t, "hass"), n = ke(t, "config", 7, bt);
  let a = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(!1);
  const s = n()["storgage-id"], l = "expander-open-" + s;
  function u() {
    o(!w(i));
  }
  function o(g) {
    if (N(i, g, !0), s !== void 0)
      try {
        localStorage.setItem(l, w(i) ? "true" : "false");
      } catch (k) {
        console.error(k);
      }
  }
  Lr(() => {
    const g = n()["min-width-expanded"], k = n()["max-width-expanded"], x = document.body.offsetWidth;
    if (g && k ? n().expanded = x >= g && x <= k : g ? n().expanded = x >= g : k && (n().expanded = x <= k), s !== void 0)
      try {
        const V = localStorage.getItem(l);
        V === null ? n().expanded !== void 0 && o(n().expanded) : N(i, V ? V === "true" : w(i), !0);
      } catch (V) {
        console.error(V);
      }
    else
      n().expanded !== void 0 && o(n().expanded);
  });
  const c = (g) => {
    if (w(a))
      return g.preventDefault(), g.stopImmediatePropagation(), N(a, !1), !1;
    u();
  }, d = (g) => {
    g.currentTarget.classList.contains("title-card-container") && c(g);
  };
  let f, v = !1, h = 0, p = 0;
  const $ = (g) => {
    f = g.target, h = g.touches[0].clientX, p = g.touches[0].clientY, v = !1;
  }, _ = (g) => {
    const k = g.touches[0].clientX, x = g.touches[0].clientY;
    (Math.abs(k - h) > 10 || Math.abs(x - p) > 10) && (v = !0);
  }, E = (g) => {
    !v && f === g.target && n()["title-card-clickable"] && u(), f = void 0, N(a, !0);
  };
  var C = Si(), q = de(C);
  {
    var L = (g) => {
      var k = Ti(), x = de(k);
      x.__touchstart = $, x.__touchmove = _, x.__touchend = E, x.__click = function(...Wr) {
        var Pt;
        (Pt = n()["title-card-clickable"] ? d : null) == null || Pt.apply(this, Wr);
      };
      var V = de(x);
      mt(V, {
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
      var Z = We(x, 2);
      Z.__click = c;
      var ot = de(Z);
      ve(() => zt(ot, "icon", n().icon)), le(Z), le(k), ve(() => {
        ce(k, 1, `title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}`, "svelte-icqkke"), oe(x, `--title-padding:${n()["title-card-padding"] ?? ""}`), Pr(x, "role", n()["title-card-clickable"] ? "button" : void 0), oe(Z, `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), ce(Z, 1, `header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${w(i) ? " open" : " close"}`, "svelte-icqkke"), oe(ot, `--arrow-color:${n()["arrow-color"] ?? ""}`), ce(ot, 1, `ico${w(i) ? " flipped open" : "close"}`, "svelte-icqkke");
      }), _e(g, k);
    }, ie = (g) => {
      var k = Ci();
      k.__click = c;
      var x = de(k), V = de(x, !0);
      le(x);
      var Z = We(x, 2);
      ve(() => zt(Z, "icon", n().icon)), le(k), ve(() => {
        ce(k, 1, `header${n()["expander-card-background-expanded"] ? "" : " ripple"}${w(i) ? " open" : " close"}`, "svelte-icqkke"), oe(k, `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), ce(x, 1, `primary title${w(i) ? " open" : " close"}`, "svelte-icqkke"), Zn(V, n().title), oe(Z, `--arrow-color:${n()["arrow-color"] ?? ""}`), ce(Z, 1, `ico${w(i) ? " flipped open" : " close"}`, "svelte-icqkke");
      }), _e(g, k);
    };
    $t(q, (g) => {
      n()["title-card"] ? g(L) : g(ie, !1);
    });
  }
  var ae = We(q, 2);
  {
    var se = (g) => {
      var k = Ni();
      ri(k, 20, () => n().cards, (x) => x, (x, V) => {
        mt(x, {
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
      }), le(k), ve(() => oe(k, `--expander-card-display:${(w(i) ? n()["expander-card-display"] : "none") ?? ""};
             --gap:${(w(i) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), Ur(3, k, () => jr, () => ({ duration: 500, easing: xi })), _e(g, k);
    };
    $t(ae, (g) => {
      n().cards && g(se);
    });
  }
  return le(C), ve(() => {
    ce(C, 1, `expander-card${n().clear ? " clear" : ""}${w(i) ? " open" : " close"}`, "svelte-icqkke"), oe(C, `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(w(i) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${w(i) ?? ""};
     --card-background:${(w(i) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
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
Wn(["touchstart", "touchmove", "touchend", "click"]);
customElements.define("expander-card", Br(Oi, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    O(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...bt, ...r };
  }
}));
const Ri = "2.4.5";
console.info(
  `%c  Expander-Card 
%c Version ${Ri}`,
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
  Oi as default
};
//# sourceMappingURL=expander-card.js.map
