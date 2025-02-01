var Yr = Object.defineProperty;
var Ft = (e) => {
  throw TypeError(e);
};
var Hr = (e, t, r) => t in e ? Yr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Y = (e, t, r) => Hr(e, typeof t != "symbol" ? t + "" : t, r), Pt = (e, t, r) => t.has(e) || Ft("Cannot " + r);
var I = (e, t, r) => (Pt(e, t, "read from private field"), r ? r.call(e) : t.get(e)), dt = (e, t, r) => t.has(e) ? Ft("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), vt = (e, t, r, n) => (Pt(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
const Br = "5";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(Br);
const Ur = 1, Vr = 2, Wr = 16, jr = 8, Kr = 4, Gr = 1, Xr = 2, Xt = "[", xt = "[!", Tt = "]", Oe = {}, D = Symbol(), zr = "http://www.w3.org/2000/svg", zt = !1;
function Ct(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
var Nt = Array.isArray, St = Array.from, ze = Object.keys, Je = Object.defineProperty, he = Object.getOwnPropertyDescriptor, Jr = Object.getOwnPropertyDescriptors, Zr = Object.prototype, Qr = Array.prototype, ht = Object.getPrototypeOf;
function en(e) {
  return typeof e == "function";
}
const Ne = () => {
};
function tn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
const j = 2, Jt = 4, nt = 8, it = 16, K = 32, Pe = 64, _t = 128, pe = 256, Ze = 512, F = 1024, oe = 2048, Ye = 4096, z = 8192, Te = 16384, Zt = 32768, He = 65536, rn = 1 << 19, Qt = 1 << 20, qe = Symbol("$state"), er = Symbol("legacy props"), nn = Symbol("");
function tr(e) {
  return e === this.v;
}
function an(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function sn(e) {
  return !an(e, this.v);
}
function ln(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function on() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function un(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function fn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function cn() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function dn(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function vn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function hn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function _n() {
  throw new Error("https://svelte.dev/e/state_unsafe_local_read");
}
function pn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let rr = !1;
function B(e) {
  return {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: tr,
    version: 0
  };
}
function Ie(e) {
  return /* @__PURE__ */ gn(B(e));
}
// @__NO_SIDE_EFFECTS__
function At(e, t = !1) {
  const r = B(e);
  return t || (r.equals = sn), r;
}
// @__NO_SIDE_EFFECTS__
function gn(e) {
  return E !== null && E.f & j && (J === null ? Cn([e]) : J.push(e)), e;
}
function S(e, t) {
  return E !== null && Sn() && E.f & (j | it) && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (J === null || !J.includes(e)) && pn(), $n(e, t);
}
function $n(e, t) {
  return e.equals(t) || (e.v = t, e.version = br(), nr(e, oe), $ !== null && $.f & F && !($.f & K) && (O !== null && O.includes(e) ? (re($, oe), ut($)) : le === null ? Nn([e]) : le.push(e))), t;
}
function nr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var a = r[i], s = a.f;
      s & oe || (re(a, t), s & (F | pe) && (s & j ? nr(
        /** @type {Derived} */
        a,
        Ye
      ) : ut(
        /** @type {Effect} */
        a
      )));
    }
}
let b = !1;
function W(e) {
  b = e;
}
let N;
function L(e) {
  if (e === null)
    throw Ct(), Oe;
  return N = e;
}
function ke() {
  return L(
    /** @type {TemplateNode} */
    /* @__PURE__ */ ge(N)
  );
}
function ie(e) {
  if (b) {
    if (/* @__PURE__ */ ge(N) !== null)
      throw Ct(), Oe;
    N = e;
  }
}
function pt() {
  for (var e = 0, t = N; ; ) {
    if (t.nodeType === 8) {
      var r = (
        /** @type {Comment} */
        t.data
      );
      if (r === Tt) {
        if (e === 0) return t;
        e -= 1;
      } else (r === Xt || r === xt) && (e += 1);
    }
    var n = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ge(t)
    );
    t.remove(), t = n;
  }
}
function X(e, t = null, r) {
  if (typeof e != "object" || e === null || qe in e)
    return e;
  const n = ht(e);
  if (n !== Zr && n !== Qr)
    return e;
  var i = /* @__PURE__ */ new Map(), a = Nt(e), s = B(0);
  a && i.set("length", B(
    /** @type {any[]} */
    e.length
  ));
  var c;
  return new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, o, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && vn();
        var d = i.get(o);
        return d === void 0 ? (d = B(l.value), i.set(o, d)) : S(d, X(l.value, c)), !0;
      },
      deleteProperty(f, o) {
        var l = i.get(o);
        if (l === void 0)
          o in f && i.set(o, B(D));
        else {
          if (a && typeof o == "string") {
            var d = (
              /** @type {Source<number>} */
              i.get("length")
            ), u = Number(o);
            Number.isInteger(u) && u < d.v && S(d, u);
          }
          S(l, D), Yt(s);
        }
        return !0;
      },
      get(f, o, l) {
        var h;
        if (o === qe)
          return e;
        var d = i.get(o), u = o in f;
        if (d === void 0 && (!u || (h = he(f, o)) != null && h.writable) && (d = B(X(u ? f[o] : D, c)), i.set(o, d)), d !== void 0) {
          var v = y(d);
          return v === D ? void 0 : v;
        }
        return Reflect.get(f, o, l);
      },
      getOwnPropertyDescriptor(f, o) {
        var l = Reflect.getOwnPropertyDescriptor(f, o);
        if (l && "value" in l) {
          var d = i.get(o);
          d && (l.value = y(d));
        } else if (l === void 0) {
          var u = i.get(o), v = u == null ? void 0 : u.v;
          if (u !== void 0 && v !== D)
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
        if (o === qe)
          return !0;
        var l = i.get(o), d = l !== void 0 && l.v !== D || Reflect.has(f, o);
        if (l !== void 0 || $ !== null && (!d || (v = he(f, o)) != null && v.writable)) {
          l === void 0 && (l = B(d ? X(f[o], c) : D), i.set(o, l));
          var u = y(l);
          if (u === D)
            return !1;
        }
        return d;
      },
      set(f, o, l, d) {
        var T;
        var u = i.get(o), v = o in f;
        if (a && o === "length")
          for (var h = l; h < /** @type {Source<number>} */
          u.v; h += 1) {
            var p = i.get(h + "");
            p !== void 0 ? S(p, D) : h in f && (p = B(D), i.set(h + "", p));
          }
        u === void 0 ? (!v || (T = he(f, o)) != null && T.writable) && (u = B(void 0), S(u, X(l, c)), i.set(o, u)) : (v = u.v !== D, S(u, X(l, c)));
        var m = Reflect.getOwnPropertyDescriptor(f, o);
        if (m != null && m.set && m.set.call(d, l), !v) {
          if (a && typeof o == "string") {
            var _ = (
              /** @type {Source<number>} */
              i.get("length")
            ), w = Number(o);
            Number.isInteger(w) && w >= _.v && S(_, w + 1);
          }
          Yt(s);
        }
        return !0;
      },
      ownKeys(f) {
        y(s);
        var o = Reflect.ownKeys(f).filter((u) => {
          var v = i.get(u);
          return v === void 0 || v.v !== D;
        });
        for (var [l, d] of i)
          d.v !== D && !(l in f) && o.push(l);
        return o;
      },
      setPrototypeOf() {
        hn();
      }
    }
  );
}
function Yt(e, t = 1) {
  S(e, e.v + t);
}
var Ht, ir, ar;
function gt() {
  if (Ht === void 0) {
    Ht = window;
    var e = Element.prototype, t = Node.prototype;
    ir = he(t, "firstChild").get, ar = he(t, "nextSibling").get, e.__click = void 0, e.__className = "", e.__attributes = null, e.__styles = null, e.__e = void 0, Text.prototype.__t = void 0;
  }
}
function Ee(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function _e(e) {
  return ir.call(e);
}
// @__NO_SIDE_EFFECTS__
function ge(e) {
  return ar.call(e);
}
function fe(e, t) {
  if (!b)
    return /* @__PURE__ */ _e(e);
  var r = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ _e(N)
  );
  if (r === null)
    r = N.appendChild(Ee());
  else if (t && r.nodeType !== 3) {
    var n = Ee();
    return r == null || r.before(n), L(n), n;
  }
  return L(r), r;
}
function je(e, t = 1, r = !1) {
  let n = b ? N : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ ge(n);
  if (!b)
    return n;
  var a = n == null ? void 0 : n.nodeType;
  if (r && a !== 3) {
    var s = Ee();
    return n === null ? i == null || i.after(s) : n.before(s), L(s), s;
  }
  return L(n), /** @type {TemplateNode} */
  n;
}
function sr(e) {
  e.textContent = "";
}
// @__NO_SIDE_EFFECTS__
function yn(e) {
  var t = j | oe;
  $ === null ? t |= pe : $.f |= Qt;
  var r = E !== null && E.f & j ? (
    /** @type {Derived} */
    E
  ) : null;
  const n = {
    children: null,
    ctx: q,
    deps: null,
    equals: tr,
    f: t,
    fn: e,
    reactions: null,
    v: (
      /** @type {V} */
      null
    ),
    version: 0,
    parent: r ?? $
  };
  return r !== null && (r.children ?? (r.children = [])).push(n), n;
}
function lr(e) {
  var t = e.children;
  if (t !== null) {
    e.children = null;
    for (var r = 0; r < t.length; r += 1) {
      var n = t[r];
      n.f & j ? Ot(
        /** @type {Derived} */
        n
      ) : ue(
        /** @type {Effect} */
        n
      );
    }
  }
}
function mn(e) {
  for (var t = e.parent; t !== null; ) {
    if (!(t.f & j))
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function or(e) {
  var t, r = $;
  U(mn(e));
  try {
    lr(e), t = kr(e);
  } finally {
    U(r);
  }
  return t;
}
function ur(e) {
  var t = or(e), r = (ye || e.f & pe) && e.deps !== null ? Ye : F;
  re(e, r), e.equals(t) || (e.v = t, e.version = br());
}
function Ot(e) {
  lr(e), Fe(e, 0), re(e, Te), e.v = e.children = e.deps = e.ctx = e.reactions = null;
}
function wn(e) {
  $ === null && E === null && un(), E !== null && E.f & pe && on(), It && ln();
}
function bn(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Be(e, t, r, n = !0) {
  var i = (e & Pe) !== 0, a = $, s = {
    ctx: q,
    deps: null,
    deriveds: null,
    nodes_start: null,
    nodes_end: null,
    f: e | oe,
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
    var c = we;
    try {
      Bt(!0), ot(s), s.f |= Zt;
    } catch (l) {
      throw ue(s), l;
    } finally {
      Bt(c);
    }
  } else t !== null && ut(s);
  var f = r && s.deps === null && s.first === null && s.nodes_start === null && s.teardown === null && (s.f & Qt) === 0;
  if (!f && !i && n && (a !== null && bn(s, a), E !== null && E.f & j)) {
    var o = (
      /** @type {Derived} */
      E
    );
    (o.children ?? (o.children = [])).push(s);
  }
  return s;
}
function fr(e) {
  wn();
  var t = $ !== null && ($.f & K) !== 0 && q !== null && !q.m;
  if (t) {
    var r = (
      /** @type {ComponentContext} */
      q
    );
    (r.e ?? (r.e = [])).push({
      fn: e,
      effect: $,
      reaction: E
    });
  } else {
    var n = at(e);
    return n;
  }
}
function cr(e) {
  const t = Be(Pe, e, !0);
  return () => {
    ue(t);
  };
}
function at(e) {
  return Be(Jt, e, !1);
}
function dr(e) {
  return Be(nt, e, !0);
}
function Se(e) {
  return st(e);
}
function st(e, t = 0) {
  return Be(nt | it | t, e, !0);
}
function xe(e, t = !0) {
  return Be(nt | K, e, !0, t);
}
function vr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = It, n = E;
    Ut(!0), Z(null);
    try {
      t.call(null);
    } finally {
      Ut(r), Z(n);
    }
  }
}
function hr(e) {
  var t = e.deriveds;
  if (t !== null) {
    e.deriveds = null;
    for (var r = 0; r < t.length; r += 1)
      Ot(t[r]);
  }
}
function _r(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    var n = r.next;
    ue(r, t), r = n;
  }
}
function kn(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    t.f & K || ue(t), t = r;
  }
}
function ue(e, t = !0) {
  var r = !1;
  if ((t || e.f & rn) && e.nodes_start !== null) {
    for (var n = e.nodes_start, i = e.nodes_end; n !== null; ) {
      var a = n === i ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ge(n)
      );
      n.remove(), n = a;
    }
    r = !0;
  }
  _r(e, t && !r), hr(e), Fe(e, 0), re(e, Te);
  var s = e.transitions;
  if (s !== null)
    for (const f of s)
      f.stop();
  vr(e);
  var c = e.parent;
  c !== null && c.first !== null && pr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = null;
}
function pr(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Qe(e, t) {
  var r = [];
  qt(e, r, !0), gr(r, () => {
    ue(e), t && t();
  });
}
function gr(e, t) {
  var r = e.length;
  if (r > 0) {
    var n = () => --r || t();
    for (var i of e)
      i.out(n);
  } else
    t();
}
function qt(e, t, r) {
  if (!(e.f & z)) {
    if (e.f ^= z, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || r) && t.push(s);
    for (var n = e.first; n !== null; ) {
      var i = n.next, a = (n.f & He) !== 0 || (n.f & K) !== 0;
      qt(n, t, a ? r : !1), n = i;
    }
  }
}
function De(e) {
  $r(e, !0);
}
function $r(e, t) {
  if (e.f & z) {
    Ue(e) && ot(e), e.f ^= z;
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & He) !== 0 || (r.f & K) !== 0;
      $r(r, i ? t : !1), r = n;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
let et = !1, $t = [];
function yr() {
  et = !1;
  const e = $t.slice();
  $t = [], tn(e);
}
function Rt(e) {
  et || (et = !0, queueMicrotask(yr)), $t.push(e);
}
function En() {
  et && yr();
}
function xn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
const mr = 0, Tn = 1;
let Ke = !1, Ge = mr, Me = !1, Le = null, we = !1, It = !1;
function Bt(e) {
  we = e;
}
function Ut(e) {
  It = e;
}
let de = [], be = 0;
let E = null;
function Z(e) {
  E = e;
}
let $ = null;
function U(e) {
  $ = e;
}
let J = null;
function Cn(e) {
  J = e;
}
let O = null, M = 0, le = null;
function Nn(e) {
  le = e;
}
let wr = 0, ye = !1, q = null;
function br() {
  return ++wr;
}
function Sn() {
  return !rr;
}
function Ue(e) {
  var s, c;
  var t = e.f;
  if (t & oe)
    return !0;
  if (t & Ye) {
    var r = e.deps, n = (t & pe) !== 0;
    if (r !== null) {
      var i;
      if (t & Ze) {
        for (i = 0; i < r.length; i++)
          ((s = r[i]).reactions ?? (s.reactions = [])).push(e);
        e.f ^= Ze;
      }
      for (i = 0; i < r.length; i++) {
        var a = r[i];
        if (Ue(
          /** @type {Derived} */
          a
        ) && ur(
          /** @type {Derived} */
          a
        ), n && $ !== null && !ye && !((c = a == null ? void 0 : a.reactions) != null && c.includes(e)) && (a.reactions ?? (a.reactions = [])).push(e), a.version > e.version)
          return !0;
      }
    }
    n || re(e, F);
  }
  return !1;
}
function An(e, t) {
  for (var r = t; r !== null; ) {
    if (r.f & _t)
      try {
        r.fn(e);
        return;
      } catch {
        r.f ^= _t;
      }
    r = r.parent;
  }
  throw Ke = !1, e;
}
function On(e) {
  return (e.f & Te) === 0 && (e.parent === null || (e.parent.f & _t) === 0);
}
function lt(e, t, r, n) {
  if (Ke) {
    if (r === null && (Ke = !1), On(t))
      throw e;
    return;
  }
  r !== null && (Ke = !0);
  {
    An(e, t);
    return;
  }
}
function kr(e) {
  var u;
  var t = O, r = M, n = le, i = E, a = ye, s = J, c = q, f = e.f;
  O = /** @type {null | Value[]} */
  null, M = 0, le = null, E = f & (K | Pe) ? null : e, ye = !we && (f & pe) !== 0, J = null, q = e.ctx;
  try {
    var o = (
      /** @type {Function} */
      (0, e.fn)()
    ), l = e.deps;
    if (O !== null) {
      var d;
      if (Fe(e, M), l !== null && M > 0)
        for (l.length = M + O.length, d = 0; d < O.length; d++)
          l[M + d] = O[d];
      else
        e.deps = l = O;
      if (!ye)
        for (d = M; d < l.length; d++)
          ((u = l[d]).reactions ?? (u.reactions = [])).push(e);
    } else l !== null && M < l.length && (Fe(e, M), l.length = M);
    return o;
  } finally {
    O = t, M = r, le = n, E = i, ye = a, J = s, q = c;
  }
}
function qn(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = r.indexOf(e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && t.f & j && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (O === null || !O.includes(t)) && (re(t, Ye), t.f & (pe | Ze) || (t.f ^= Ze), Fe(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Fe(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      qn(e, r[n]);
}
function ot(e) {
  var t = e.f;
  if (!(t & Te)) {
    re(e, F);
    var r = $, n = q;
    $ = e;
    try {
      t & it ? kn(e) : _r(e), hr(e), vr(e);
      var i = kr(e);
      e.teardown = typeof i == "function" ? i : null, e.version = wr;
    } catch (a) {
      lt(a, e, r, n || e.ctx);
    } finally {
      $ = r;
    }
  }
}
function Er() {
  if (be > 1e3) {
    be = 0;
    try {
      fn();
    } catch (e) {
      if (Le !== null)
        lt(e, Le, null);
      else
        throw e;
    }
  }
  be++;
}
function xr(e) {
  var t = e.length;
  if (t !== 0) {
    Er();
    var r = we;
    we = !0;
    try {
      for (var n = 0; n < t; n++) {
        var i = e[n];
        i.f & F || (i.f ^= F);
        var a = [];
        Tr(i, a), Rn(a);
      }
    } finally {
      we = r;
    }
  }
}
function Rn(e) {
  var t = e.length;
  if (t !== 0)
    for (var r = 0; r < t; r++) {
      var n = e[r];
      if (!(n.f & (Te | z)))
        try {
          Ue(n) && (ot(n), n.deps === null && n.first === null && n.nodes_start === null && (n.teardown === null ? pr(n) : n.fn = null));
        } catch (i) {
          lt(i, n, null, n.ctx);
        }
    }
}
function In() {
  if (Me = !1, be > 1001)
    return;
  const e = de;
  de = [], xr(e), Me || (be = 0, Le = null);
}
function ut(e) {
  Ge === mr && (Me || (Me = !0, queueMicrotask(In))), Le = e;
  for (var t = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (r & (Pe | K)) {
      if (!(r & F)) return;
      t.f ^= F;
    }
  }
  de.push(t);
}
function Tr(e, t) {
  var r = e.first, n = [];
  e: for (; r !== null; ) {
    var i = r.f, a = (i & K) !== 0, s = a && (i & F) !== 0, c = r.next;
    if (!s && !(i & z))
      if (i & nt) {
        if (a)
          r.f ^= F;
        else
          try {
            Ue(r) && ot(r);
          } catch (d) {
            lt(d, r, null, r.ctx);
          }
        var f = r.first;
        if (f !== null) {
          r = f;
          continue;
        }
      } else i & Jt && n.push(r);
    if (c === null) {
      let d = r.parent;
      for (; d !== null; ) {
        if (e === d)
          break e;
        var o = d.next;
        if (o !== null) {
          r = o;
          continue e;
        }
        d = d.parent;
      }
    }
    r = c;
  }
  for (var l = 0; l < n.length; l++)
    f = n[l], t.push(f), Tr(f, t);
}
function se(e) {
  var t = Ge, r = de;
  try {
    Er();
    const i = [];
    Ge = Tn, de = i, Me = !1, xr(r);
    var n = e == null ? void 0 : e();
    return En(), (de.length > 0 || i.length > 0) && se(), be = 0, Le = null, n;
  } finally {
    Ge = t, de = r;
  }
}
function y(e) {
  var l;
  var t = e.f, r = (t & j) !== 0;
  if (r && t & Te) {
    var n = or(
      /** @type {Derived} */
      e
    );
    return Ot(
      /** @type {Derived} */
      e
    ), n;
  }
  if (E !== null) {
    J !== null && J.includes(e) && _n();
    var i = E.deps;
    O === null && i !== null && i[M] === e ? M++ : O === null ? O = [e] : O.push(e), le !== null && $ !== null && $.f & F && !($.f & K) && le.includes(e) && (re($, oe), ut($));
  } else if (r && /** @type {Derived} */
  e.deps === null)
    for (var a = (
      /** @type {Derived} */
      e
    ), s = a.parent, c = a; s !== null; )
      if (s.f & j) {
        var f = (
          /** @type {Derived} */
          s
        );
        c = f, s = f.parent;
      } else {
        var o = (
          /** @type {Effect} */
          s
        );
        (l = o.deriveds) != null && l.includes(c) || (o.deriveds ?? (o.deriveds = [])).push(c);
        break;
      }
  return r && (a = /** @type {Derived} */
  e, Ue(a) && ur(a)), e.v;
}
function ft(e) {
  const t = E;
  try {
    return E = null, e();
  } finally {
    E = t;
  }
}
const Dn = ~(oe | Ye | F);
function re(e, t) {
  e.f = e.f & Dn | t;
}
function Dt(e, t = !1, r) {
  q = {
    p: q,
    c: null,
    e: null,
    m: !1,
    s: e,
    x: null,
    l: null
  };
}
function Mt(e) {
  const t = q;
  if (t !== null) {
    e !== void 0 && (t.x = e);
    const s = t.e;
    if (s !== null) {
      var r = $, n = E;
      t.e = null;
      try {
        for (var i = 0; i < s.length; i++) {
          var a = s[i];
          U(a.effect), Z(a.reaction), at(a.fn);
        }
      } finally {
        U(r), Z(n);
      }
    }
    q = t.p, t.m = !0;
  }
  return e || /** @type {T} */
  {};
}
const Cr = /* @__PURE__ */ new Set(), yt = /* @__PURE__ */ new Set();
function Mn(e) {
  for (var t = 0; t < e.length; t++)
    Cr.add(e[t]);
  for (var r of yt)
    r(e);
}
function Ve(e) {
  var w;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = ((w = e.composedPath) == null ? void 0 : w.call(e)) || [], a = (
    /** @type {null | Element} */
    i[0] || e.target
  ), s = 0, c = e.__root;
  if (c) {
    var f = i.indexOf(c);
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
    Je(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || r;
      }
    });
    var l = E, d = $;
    Z(null), U(null);
    try {
      for (var u, v = []; a !== null; ) {
        var h = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var p = a["__" + n];
          if (p !== void 0 && !/** @type {any} */
          a.disabled)
            if (Nt(p)) {
              var [m, ..._] = p;
              m.apply(a, [e, ..._]);
            } else
              p.call(a, e);
        } catch (T) {
          u ? v.push(T) : u = T;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        a = h;
      }
      if (u) {
        for (let T of v)
          queueMicrotask(() => {
            throw T;
          });
        throw u;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Z(l), U(d);
    }
  }
}
function Ln(e) {
  var t = document.createElement("template");
  return t.innerHTML = e, t.content;
}
function Re(e, t) {
  var r = (
    /** @type {Effect} */
    $
  );
  r.nodes_start === null && (r.nodes_start = e, r.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Ce(e, t) {
  var r = (t & Gr) !== 0, n = (t & Xr) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    if (b)
      return Re(N, null), N;
    i === void 0 && (i = Ln(a ? e : "<!>" + e), r || (i = /** @type {Node} */
    /* @__PURE__ */ _e(i)));
    var s = (
      /** @type {TemplateNode} */
      n ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ _e(s)
      ), f = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Re(c, f);
    } else
      Re(s, s);
    return s;
  };
}
function ve(e, t) {
  if (b) {
    $.nodes_end = N, ke();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Fn = ["touchstart", "touchmove"];
function Pn(e) {
  return Fn.includes(e);
}
let tt = !0;
function Vt(e) {
  tt = e;
}
function Yn(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r == null ? "" : r + "");
}
function Nr(e, t) {
  return Sr(e, t);
}
function Hn(e, t) {
  gt(), t.intro = t.intro ?? !1;
  const r = t.target, n = b, i = N;
  try {
    for (var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ _e(r)
    ); a && (a.nodeType !== 8 || /** @type {Comment} */
    a.data !== Xt); )
      a = /** @type {TemplateNode} */
      /* @__PURE__ */ ge(a);
    if (!a)
      throw Oe;
    W(!0), L(
      /** @type {Comment} */
      a
    ), ke();
    const s = Sr(e, { ...t, anchor: a });
    if (N === null || N.nodeType !== 8 || /** @type {Comment} */
    N.data !== Tt)
      throw Ct(), Oe;
    return W(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s === Oe)
      return t.recover === !1 && cn(), gt(), sr(r), W(!1), Nr(e, t);
    throw s;
  } finally {
    W(n), L(i);
  }
}
const $e = /* @__PURE__ */ new Map();
function Sr(e, { target: t, anchor: r, props: n = {}, events: i, context: a, intro: s = !0 }) {
  gt();
  var c = /* @__PURE__ */ new Set(), f = (d) => {
    for (var u = 0; u < d.length; u++) {
      var v = d[u];
      if (!c.has(v)) {
        c.add(v);
        var h = Pn(v);
        t.addEventListener(v, Ve, { passive: h });
        var p = $e.get(v);
        p === void 0 ? (document.addEventListener(v, Ve, { passive: h }), $e.set(v, 1)) : $e.set(v, p + 1);
      }
    }
  };
  f(St(Cr)), yt.add(f);
  var o = void 0, l = cr(() => {
    var d = r ?? t.appendChild(Ee());
    return xe(() => {
      if (a) {
        Dt({});
        var u = (
          /** @type {ComponentContext} */
          q
        );
        u.c = a;
      }
      i && (n.$$events = i), b && Re(
        /** @type {TemplateNode} */
        d,
        null
      ), tt = s, o = e(d, n) || {}, tt = !0, b && ($.nodes_end = N), a && Mt();
    }), () => {
      var h;
      for (var u of c) {
        t.removeEventListener(u, Ve);
        var v = (
          /** @type {number} */
          $e.get(u)
        );
        --v === 0 ? (document.removeEventListener(u, Ve), $e.delete(u)) : $e.set(u, v);
      }
      yt.delete(f), mt.delete(o), d !== r && ((h = d.parentNode) == null || h.removeChild(d));
    };
  });
  return mt.set(o, l), o;
}
let mt = /* @__PURE__ */ new WeakMap();
function Bn(e) {
  const t = mt.get(e);
  t && t();
}
function wt(e, t, r = !1) {
  b && ke();
  var n = e, i = null, a = null, s = D, c = r ? He : 0, f = !1;
  const o = (d, u = !0) => {
    f = !0, l(u, d);
  }, l = (d, u) => {
    if (s === (s = d)) return;
    let v = !1;
    if (b) {
      const h = (
        /** @type {Comment} */
        n.data === xt
      );
      !!s === h && (n = pt(), L(n), W(!1), v = !0);
    }
    s ? (i ? De(i) : u && (i = xe(() => u(n))), a && Qe(a, () => {
      a = null;
    })) : (a ? De(a) : u && (a = xe(() => u(n))), i && Qe(i, () => {
      i = null;
    })), v && W(!0);
  };
  st(() => {
    f = !1, t(o), f || l(null, null);
  }, c), b && (n = N);
}
function Un(e, t, r, n) {
  for (var i = [], a = t.length, s = 0; s < a; s++)
    qt(t[s].e, i, !0);
  var c = a > 0 && i.length === 0 && r !== null;
  if (c) {
    var f = (
      /** @type {Element} */
      /** @type {Element} */
      r.parentNode
    );
    sr(f), f.append(
      /** @type {Element} */
      r
    ), n.clear(), ae(e, t[0].prev, t[a - 1].next);
  }
  gr(i, () => {
    for (var o = 0; o < a; o++) {
      var l = t[o];
      c || (n.delete(l.k), ae(e, l.prev, l.next)), ue(l.e, !c);
    }
  });
}
function Vn(e, t, r, n, i, a = null) {
  var s = e, c = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var f = (
      /** @type {Element} */
      e
    );
    s = b ? L(
      /** @type {Comment | Text} */
      /* @__PURE__ */ _e(f)
    ) : f.appendChild(Ee());
  }
  b && ke();
  var o = null, l = !1;
  st(() => {
    var d = r(), u = Nt(d) ? d : d == null ? [] : St(d), v = u.length;
    if (l && v === 0)
      return;
    l = v === 0;
    let h = !1;
    if (b) {
      var p = (
        /** @type {Comment} */
        s.data === xt
      );
      p !== (v === 0) && (s = pt(), L(s), W(!1), h = !0);
    }
    if (b) {
      for (var m = null, _, w = 0; w < v; w++) {
        if (N.nodeType === 8 && /** @type {Comment} */
        N.data === Tt) {
          s = /** @type {Comment} */
          N, h = !0, W(!1);
          break;
        }
        var T = u[w], A = n(T, w);
        _ = Ar(N, c, m, null, T, A, w, i, t), c.items.set(A, _), m = _;
      }
      v > 0 && L(pt());
    }
    if (!b) {
      var k = (
        /** @type {Effect} */
        E
      );
      Wn(u, c, s, i, t, (k.f & z) !== 0, n);
    }
    a !== null && (v === 0 ? o ? De(o) : o = xe(() => a(s)) : o !== null && Qe(o, () => {
      o = null;
    })), h && W(!0), r();
  }), b && (s = N);
}
function Wn(e, t, r, n, i, a, s) {
  var c = e.length, f = t.items, o = t.first, l = o, d, u = null, v = [], h = [], p, m, _, w;
  for (w = 0; w < c; w += 1) {
    if (p = e[w], m = s(p, w), _ = f.get(m), _ === void 0) {
      var T = l ? (
        /** @type {TemplateNode} */
        l.e.nodes_start
      ) : r;
      u = Ar(
        T,
        t,
        u,
        u === null ? t.first : u.next,
        p,
        m,
        w,
        n,
        i
      ), f.set(m, u), v = [], h = [], l = u.next;
      continue;
    }
    if (_.e.f & z && De(_.e), _ !== l) {
      if (d !== void 0 && d.has(_)) {
        if (v.length < h.length) {
          var A = h[0], k;
          u = A.prev;
          var R = v[0], V = v[v.length - 1];
          for (k = 0; k < v.length; k += 1)
            Wt(v[k], A, r);
          for (k = 0; k < h.length; k += 1)
            d.delete(h[k]);
          ae(t, R.prev, V.next), ae(t, u, R), ae(t, V, A), l = A, u = V, w -= 1, v = [], h = [];
        } else
          d.delete(_), Wt(_, l, r), ae(t, _.prev, _.next), ae(t, _, u === null ? t.first : u.next), ae(t, u, _), u = _;
        continue;
      }
      for (v = [], h = []; l !== null && l.k !== m; )
        (a || !(l.e.f & z)) && (d ?? (d = /* @__PURE__ */ new Set())).add(l), h.push(l), l = l.next;
      if (l === null)
        continue;
      _ = l;
    }
    v.push(_), u = _, l = _.next;
  }
  if (l !== null || d !== void 0) {
    for (var G = d === void 0 ? [] : St(d); l !== null; )
      (a || !(l.e.f & z)) && G.push(l), l = l.next;
    var g = G.length;
    if (g > 0) {
      var x = c === 0 ? r : null;
      Un(t, G, x, f);
    }
  }
  $.first = t.first && t.first.e, $.last = u && u.e;
}
function Ar(e, t, r, n, i, a, s, c, f) {
  var o = (f & Ur) !== 0, l = (f & Wr) === 0, d = o ? l ? /* @__PURE__ */ At(i) : B(i) : i, u = f & Vr ? B(s) : s, v = {
    i: u,
    v: d,
    k: a,
    a: null,
    // @ts-expect-error
    e: null,
    prev: r,
    next: n
  };
  try {
    return v.e = xe(() => c(e, d, u), b), v.e.prev = r && r.e, v.e.next = n && n.e, r === null ? t.first = v : (r.next = v, r.e.next = v.e), n !== null && (n.prev = v, n.e.prev = v.e), v;
  } finally {
  }
}
function Wt(e, t, r) {
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
      /* @__PURE__ */ ge(a)
    );
    i.before(a), a = s;
  }
}
function ae(e, t, r) {
  t === null ? e.first = r : (t.next = r, t.e.next = r && r.e), r !== null && (r.prev = t, r.e.prev = t && t.e);
}
function jn(e, t, r, n, i, a) {
  let s = b;
  b && ke();
  var c, f, o = null;
  b && N.nodeType === 1 && (o = /** @type {Element} */
  N, ke());
  var l = (
    /** @type {TemplateNode} */
    b ? N : e
  ), d;
  st(() => {
    const u = t() || null;
    var v = u === "svg" ? zr : null;
    u !== c && (d && (u === null ? Qe(d, () => {
      d = null, f = null;
    }) : u === f ? De(d) : (ue(d), Vt(!1))), u && u !== f && (d = xe(() => {
      if (o = b ? (
        /** @type {Element} */
        o
      ) : v ? document.createElementNS(v, u) : document.createElement(u), Re(o, o), n) {
        var h = (
          /** @type {TemplateNode} */
          b ? /* @__PURE__ */ _e(o) : o.appendChild(Ee())
        );
        b && (h === null ? W(!1) : L(h)), n(o, h);
      }
      $.nodes_end = o, l.before(o);
    })), c = u, c && (f = c), Vt(!0));
  }, He), s && (W(!0), L(l));
}
function Or(e, t) {
  Rt(() => {
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
function ce(e, t, r, n) {
  var i = e.__attributes ?? (e.__attributes = {});
  b && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "style" && "__styles" in e && (e.__styles = {}), t === "loading" && (e[nn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && qr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function ne(e, t, r) {
  var n = E, i = $;
  Z(null), U(null);
  try {
    qr(e).includes(t) ? e[t] = r : ce(e, t, r);
  } finally {
    Z(n), U(i);
  }
}
var jt = /* @__PURE__ */ new Map();
function qr(e) {
  var t = jt.get(e.nodeName);
  if (t) return t;
  jt.set(e.nodeName, t = []);
  for (var r, n = ht(e), i = Element.prototype; i !== n; ) {
    r = Jr(n);
    for (var a in r)
      r[a].set && t.push(a);
    n = ht(n);
  }
  return t;
}
function Ae(e, t) {
  var r = e.__className, n = Kn(t);
  b && e.className === n ? e.__className = n : (r !== n || b && e.className !== n) && (t == null ? e.removeAttribute("class") : e.className = n, e.__className = n);
}
function Kn(e) {
  return e ?? "";
}
const Gn = () => performance.now(), te = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => Gn(),
  tasks: /* @__PURE__ */ new Set()
};
function Rr() {
  const e = te.now();
  te.tasks.forEach((t) => {
    t.c(e) || (te.tasks.delete(t), t.f());
  }), te.tasks.size !== 0 && te.tick(Rr);
}
function Xn(e) {
  let t;
  return te.tasks.size === 0 && te.tick(Rr), {
    promise: new Promise((r) => {
      te.tasks.add(t = { c: e, f: r });
    }),
    abort() {
      te.tasks.delete(t);
    }
  };
}
function We(e, t) {
  e.dispatchEvent(new CustomEvent(t));
}
function zn(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function Kt(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [i, a] = n.split(":");
    if (!i || a === void 0) break;
    const s = zn(i.trim());
    t[s] = a.trim();
  }
  return t;
}
const Jn = (e) => e;
function Ir(e, t, r, n) {
  var i = (e & Kr) !== 0, a = "both", s, c = t.inert, f, o;
  function l() {
    var p = E, m = $;
    Z(null), U(null);
    try {
      return s ?? (s = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
      {}, {
        direction: a
      }));
    } finally {
      Z(p), U(m);
    }
  }
  var d = {
    is_global: i,
    in() {
      t.inert = c, We(t, "introstart"), f = bt(t, l(), o, 1, () => {
        We(t, "introend"), f == null || f.abort(), f = s = void 0;
      });
    },
    out(p) {
      t.inert = !0, We(t, "outrostart"), o = bt(t, l(), f, 0, () => {
        We(t, "outroend"), p == null || p();
      });
    },
    stop: () => {
      f == null || f.abort(), o == null || o.abort();
    }
  }, u = (
    /** @type {Effect} */
    $
  );
  if ((u.transitions ?? (u.transitions = [])).push(d), tt) {
    var v = i;
    if (!v) {
      for (var h = (
        /** @type {Effect | null} */
        u.parent
      ); h && h.f & He; )
        for (; (h = h.parent) && !(h.f & it); )
          ;
      v = !h || (h.f & Zt) !== 0;
    }
    v && at(() => {
      ft(() => d.in());
    });
  }
}
function bt(e, t, r, n, i) {
  var a = n === 1;
  if (en(t)) {
    var s, c = !1;
    return Rt(() => {
      if (!c) {
        var m = t({ direction: a ? "in" : "out" });
        s = bt(e, m, r, n, i);
      }
    }), {
      abort: () => {
        c = !0, s == null || s.abort();
      },
      deactivate: () => s.deactivate(),
      reset: () => s.reset(),
      t: () => s.t()
    };
  }
  if (r == null || r.deactivate(), !(t != null && t.duration))
    return i(), {
      abort: Ne,
      deactivate: Ne,
      reset: Ne,
      t: () => n
    };
  const { delay: f = 0, css: o, tick: l, easing: d = Jn } = t;
  var u = [];
  if (a && r === void 0 && (l && l(0, 1), o)) {
    var v = Kt(o(0, 1));
    u.push(v, v);
  }
  var h = () => 1 - n, p = e.animate(u, { duration: f });
  return p.onfinish = () => {
    var m = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var _ = n - m, w = (
      /** @type {number} */
      t.duration * Math.abs(_)
    ), T = [];
    if (w > 0) {
      if (o)
        for (var A = Math.ceil(w / 16.666666666666668), k = 0; k <= A; k += 1) {
          var R = m + _ * d(k / A), V = o(R, 1 - R);
          T.push(Kt(V));
        }
      h = () => {
        var G = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          p.currentTime
        );
        return m + _ * d(G / w);
      }, l && Xn(() => {
        if (p.playState !== "running") return !1;
        var G = h();
        return l(G, 1 - G), !0;
      });
    }
    p = e.animate(T, { duration: w, fill: "forwards" }), p.onfinish = () => {
      h = () => n, l == null || l(n, 1 - n), i();
    };
  }, {
    abort: () => {
      p && (p.cancel(), p.effect = null, p.onfinish = Ne);
    },
    deactivate: () => {
      i = Ne;
    },
    reset: () => {
      n === 0 && (l == null || l(1, 0));
    },
    t: () => h()
  };
}
function Gt(e, t) {
  return e === t || (e == null ? void 0 : e[qe]) === t;
}
function Zn(e = {}, t, r, n) {
  return at(() => {
    var i, a;
    return dr(() => {
      i = a, a = [], ft(() => {
        e !== r(...a) && (t(e, ...a), i && Gt(r(...i), e) && t(null, ...i));
      });
    }), () => {
      Rt(() => {
        a && Gt(r(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
function Dr(e) {
  q === null && xn(), fr(() => {
    const t = ft(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Qn(e) {
  for (var t = $, r = $; t !== null && !(t.f & (K | Pe)); )
    t = t.parent;
  try {
    return U(t), e();
  } finally {
    U(r);
  }
}
function me(e, t, r, n) {
  var A;
  var i = !rr, a = (r & jr) !== 0, s = !1, c;
  c = /** @type {V} */
  e[t];
  var f = qe in e || er in e, o = ((A = he(e, t)) == null ? void 0 : A.set) ?? (f && a && t in e ? (k) => e[t] = k : void 0), l = (
    /** @type {V} */
    n
  ), d = !0, u = !1, v = () => (u = !0, d && (d = !1, l = /** @type {V} */
  n), l);
  c === void 0 && n !== void 0 && (o && i && dn(), c = v(), o && o(c));
  var h;
  if (h = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? v() : (d = !0, u = !1, k);
  }, o) {
    var p = e.$$legacy;
    return function(k, R) {
      return arguments.length > 0 ? ((!R || p || s) && o(R ? h() : k), k) : h();
    };
  }
  var m = !1, _ = !1, w = /* @__PURE__ */ At(c), T = Qn(
    () => /* @__PURE__ */ yn(() => {
      var k = h(), R = y(w);
      return m ? (m = !1, _ = !0, R) : (_ = !1, w.v = k);
    })
  );
  return function(k, R) {
    if (arguments.length > 0) {
      const V = R ? y(T) : k;
      return T.equals(V) || (m = !0, S(w, V), u && l !== void 0 && (l = V), ft(() => y(T))), k;
    }
    return y(T);
  };
}
function ei(e) {
  return new ti(e);
}
var ee, H;
class ti {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    dt(this, ee);
    /** @type {Record<string, any>} */
    dt(this, H);
    var a;
    var r = /* @__PURE__ */ new Map(), n = (s, c) => {
      var f = /* @__PURE__ */ At(c);
      return r.set(s, f), f;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, c) {
          return y(r.get(c) ?? n(c, Reflect.get(s, c)));
        },
        has(s, c) {
          return c === er ? !0 : (y(r.get(c) ?? n(c, Reflect.get(s, c))), Reflect.has(s, c));
        },
        set(s, c, f) {
          return S(r.get(c) ?? n(c, f), f), Reflect.set(s, c, f);
        }
      }
    );
    vt(this, H, (t.hydrate ? Hn : Nr)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((a = t == null ? void 0 : t.props) != null && a.$$host) || t.sync === !1) && se(), vt(this, ee, i.$$events);
    for (const s of Object.keys(I(this, H)))
      s === "$set" || s === "$destroy" || s === "$on" || Je(this, s, {
        get() {
          return I(this, H)[s];
        },
        /** @param {any} value */
        set(c) {
          I(this, H)[s] = c;
        },
        enumerable: !0
      });
    I(this, H).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, I(this, H).$destroy = () => {
      Bn(I(this, H));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    I(this, H).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    I(this, ee)[t] = I(this, ee)[t] || [];
    const n = (...i) => r.call(this, ...i);
    return I(this, ee)[t].push(n), () => {
      I(this, ee)[t] = I(this, ee)[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    I(this, H).$destroy();
  }
}
ee = new WeakMap(), H = new WeakMap();
let Mr;
typeof HTMLElement == "function" && (Mr = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    Y(this, "$$ctor");
    /** Slots */
    Y(this, "$$s");
    /** @type {any} The Svelte component instance */
    Y(this, "$$c");
    /** Whether or not the custom element is connected */
    Y(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    Y(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    Y(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    Y(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    Y(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    Y(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    Y(this, "$$me");
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
          i !== "default" && (s.name = i), ve(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = ri(this);
      for (const i of this.$$s)
        i in n && (i === "default" && !this.$$d.children ? (this.$$d.children = t(i), r.default = !0) : r[i] = t(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = Xe(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = ei({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = cr(() => {
        dr(() => {
          var i;
          this.$$r = !0;
          for (const a of ze(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = Xe(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Xe(t, n, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [t]: this.$$d[t] }));
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
function Xe(e, t, r, n) {
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
function ri(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Lr(e, t, r, n, i, a) {
  let s = class extends Mr {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return ze(t).map(
        (c) => (t[c].attribute || c).toLowerCase()
      );
    }
  };
  return ze(t).forEach((c) => {
    Je(s.prototype, c, {
      get() {
        return this.$$c && c in this.$$c ? this.$$c[c] : this.$$d[c];
      },
      set(f) {
        var d;
        f = Xe(c, f, t), this.$$d[c] = f;
        var o = this.$$c;
        if (o) {
          var l = (d = he(o, c)) == null ? void 0 : d.get;
          l ? o[c] = f : o.$set({ [c]: f });
        }
      }
    });
  }), n.forEach((c) => {
    Je(s.prototype, c, {
      get() {
        var f;
        return (f = this.$$c) == null ? void 0 : f[c];
      }
    });
  }), a && (s = a(s)), e.element = /** @type {any} */
  s, s;
}
let rt = Ie(void 0);
const ni = async () => (S(rt, X(await window.loadCardHelpers().then((e) => e))), y(rt)), ii = () => y(rt) ? y(rt) : ni();
function ai(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Fr(e, { delay: t = 0, duration: r = 400, easing: n = ai, axis: i = "y" } = {}) {
  const a = getComputedStyle(e), s = +a.opacity, c = i === "y" ? "height" : "width", f = parseFloat(a[c]), o = i === "y" ? ["top", "bottom"] : ["left", "right"], l = o.map(
    (_) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${_[0].toUpperCase()}${_.slice(1)}`
    )
  ), d = parseFloat(a[`padding${l[0]}`]), u = parseFloat(a[`padding${l[1]}`]), v = parseFloat(a[`margin${l[0]}`]), h = parseFloat(a[`margin${l[1]}`]), p = parseFloat(
    a[`border${l[0]}Width`]
  ), m = parseFloat(
    a[`border${l[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (_) => `overflow: hidden;opacity: ${Math.min(_ * 20, 1) * s};${c}: ${_ * f}px;padding-${o[0]}: ${_ * d}px;padding-${o[1]}: ${_ * u}px;margin-${o[0]}: ${_ * v}px;margin-${o[1]}: ${_ * h}px;border-${o[0]}-width: ${_ * p}px;border-${o[1]}-width: ${_ * m}px;`
  };
}
var si = /* @__PURE__ */ Ce('<span class="loading svelte-1sdlsm">Loading...</span>'), li = /* @__PURE__ */ Ce('<div class="outer-container"><!> <!></div>');
const oi = {
  hash: "svelte-1sdlsm",
  code: ".loading.svelte-1sdlsm {padding:1em;display:block;}"
};
function kt(e, t) {
  Dt(t, !0), Or(e, oi);
  const r = me(t, "type", 7, "div"), n = me(t, "config", 7), i = me(t, "hass", 7), a = me(t, "marginTop", 7, "0px");
  let s = Ie(void 0), c = Ie(!0);
  fr(() => {
    y(s) && (y(s).hass = i());
  }), Dr(async () => {
    const v = (await ii()).createCardElement(n());
    v.hass = i(), y(s) && (y(s).replaceWith(v), S(s, X(v)), S(c, !1));
  });
  var f = li(), o = fe(f);
  jn(o, r, !1, (u, v) => {
    Zn(u, (h) => S(s, X(h)), () => y(s)), Ae(u, "svelte-1sdlsm"), Ir(3, u, () => Fr);
  });
  var l = je(o, 2);
  {
    var d = (u) => {
      var v = si();
      ve(u, v);
    };
    wt(l, (u) => {
      y(c) && u(d);
    });
  }
  return ie(f), Se(() => ce(f, "style", `margin-top: ${a() ?? ""};`)), ve(e, f), Mt({
    get type() {
      return r();
    },
    set type(u = "div") {
      r(u), se();
    },
    get config() {
      return n();
    },
    set config(u) {
      n(u), se();
    },
    get hass() {
      return i();
    },
    set hass(u) {
      i(u), se();
    },
    get marginTop() {
      return a();
    },
    set marginTop(u = "0px") {
      a(u), se();
    }
  });
}
customElements.define("expander-sub-card", Lr(
  kt,
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
function ui(e) {
  const t = e - 1;
  return t * t * t + 1;
}
const Et = {
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
var fi = /* @__PURE__ */ Ce('<div id="id1"><div id="id2" class="title-card-container svelte-icqkke"><!></div> <button aria-label="Toggle button"><ha-icon></ha-icon></button></div>', 2), ci = /* @__PURE__ */ Ce("<button><div> </div> <ha-icon></ha-icon></button>", 2), di = /* @__PURE__ */ Ce('<div class="children-container svelte-icqkke"></div>'), vi = /* @__PURE__ */ Ce("<ha-card><!> <!></ha-card>", 2);
const hi = {
  hash: "svelte-icqkke",
  code: ".expander-card.svelte-icqkke {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);}.children-container.svelte-icqkke {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-icqkke {background:none !important;background-color:transparent !important;border-style:none !important;}.title-card-header.svelte-icqkke {display:flex;align-items:center;justify-content:space-between;flex-direction:row;}.title-card-header-overlay.svelte-icqkke {display:block;}.title-card-container.svelte-icqkke {width:100%;padding:var(--title-padding);}.header.svelte-icqkke {display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none;width:var(--header-width,auto);color:var(--header-color,#fff);}.header-overlay.svelte-icqkke {position:absolute;top:0;right:0;margin:var(--overlay-margin);}.title.svelte-icqkke {width:100%;text-align:left;}.ico.svelte-icqkke {color:var(--arrow-color,var(--primary-text-color,#fff));transition-property:transform;transition-duration:0.35s;}.flipped.svelte-icqkke {transform:rotate(180deg);}.ripple.svelte-icqkke {background-position:center;transition:background 0.8s;border-radius:1em;}.ripple.svelte-icqkke:hover {background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;}.ripple.svelte-icqkke:active {background-color:#ffffff25;background-size:100%;transition:background 0s;}"
};
function _i(e, t) {
  Dt(t, !0), Or(e, hi);
  const r = me(t, "hass", 7), n = me(t, "config", 7, Et);
  let i = Ie(!1), a = Ie(!1);
  const s = n()["storgage-id"], c = "expander-open-" + s;
  function f() {
    o(!y(a));
  }
  function o(g) {
    if (S(a, X(g)), s !== void 0)
      try {
        localStorage.setItem(c, y(a) ? "true" : "false");
      } catch (x) {
        console.error(x);
      }
  }
  Dr(() => {
    const g = n()["min-width-expanded"], x = n()["max-width-expanded"], C = document.body.offsetWidth;
    if (g && x ? n().expanded = C >= g && C <= x : g ? n().expanded = C >= g : x && (n().expanded = C <= x), s !== void 0)
      try {
        const P = localStorage.getItem(c);
        P === null ? n().expanded !== void 0 && o(n().expanded) : S(a, X(P ? P === "true" : y(a)));
      } catch (P) {
        console.error(P);
      }
    else
      n().expanded !== void 0 && o(n().expanded);
  });
  const l = (g) => {
    if (y(i))
      return g.preventDefault(), g.stopImmediatePropagation(), S(i, !1), !1;
    f();
  }, d = (g) => {
    g.currentTarget.classList.contains("title-card-container") && l(g);
  };
  let u, v = !1, h = 0, p = 0;
  const m = (g) => {
    u = g.target, h = g.touches[0].clientX, p = g.touches[0].clientY, v = !1;
  }, _ = (g) => {
    const x = g.touches[0].clientX, C = g.touches[0].clientY;
    (Math.abs(x - h) > 10 || Math.abs(C - p) > 10) && (v = !0);
  }, w = (g) => {
    !v && u === g.target && n()["title-card-clickable"] && f(), u = void 0, S(i, !0);
  };
  var T = vi(), A = fe(T);
  {
    var k = (g) => {
      var x = fi(), C = fe(x);
      C.__touchstart = m, C.__touchmove = _, C.__touchend = w, C.__click = function(...Pr) {
        var Lt;
        (Lt = n()["title-card-clickable"] ? d : null) == null || Lt.apply(this, Pr);
      };
      var P = fe(C);
      kt(P, {
        get hass() {
          return r();
        },
        get config() {
          return n()["title-card"];
        },
        get type() {
          return n()["title-card"].type;
        }
      }), ie(C);
      var Q = je(C, 2);
      Q.__click = l;
      var ct = fe(Q);
      ne(ct, "icon", "mdi:chevron-down"), ie(Q), ie(x), Se(() => {
        Ae(x, `${`title-card-header${n()["title-card-button-overlay"] ? "-overlay" : ""}` ?? ""} svelte-icqkke`), ce(C, "style", `--title-padding:${n()["title-card-padding"] ?? ""}`), ce(C, "role", n()["title-card-clickable"] ? "button" : void 0), ce(Q, "style", `--overlay-margin:${n()["overlay-margin"] ?? ""}; --button-background:${n()["button-background"] ?? ""}; --header-color:${n()["header-color"] ?? ""};`), Ae(Q, `${`header ripple${n()["title-card-button-overlay"] ? " header-overlay" : ""}${y(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), ne(ct, "style", `--arrow-color:${n()["arrow-color"] ?? ""}`), ne(ct, "class", `${`ico${y(a) ? " flipped open" : "close"}` ?? ""} svelte-icqkke`);
      }), ve(g, x);
    }, R = (g) => {
      var x = ci();
      x.__click = l;
      var C = fe(x), P = fe(C, !0);
      ie(C);
      var Q = je(C, 2);
      ne(Q, "icon", "mdi:chevron-down"), ie(x), Se(() => {
        Ae(x, `${`header${n()["expander-card-background-expanded"] ? "" : " ripple"}${y(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), ce(x, "style", `--header-width:100%; --button-background:${n()["button-background"] ?? ""};--header-color:${n()["header-color"] ?? ""};`), Ae(C, `${`primary title${y(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), Yn(P, n().title), ne(Q, "style", `--arrow-color:${n()["arrow-color"] ?? ""}`), ne(Q, "class", `${`ico${y(a) ? " flipped open" : " close"}` ?? ""} svelte-icqkke`);
      }), ve(g, x);
    };
    wt(A, (g) => {
      n()["title-card"] ? g(k) : g(R, !1);
    });
  }
  var V = je(A, 2);
  {
    var G = (g) => {
      var x = di();
      Vn(x, 20, () => n().cards, (C) => C, (C, P) => {
        kt(C, {
          get hass() {
            return r();
          },
          get config() {
            return P;
          },
          get type() {
            return P.type;
          },
          get marginTop() {
            return n()["child-margin-top"];
          }
        });
      }), ie(x), Se(() => ce(x, "style", `--expander-card-display:${(y(a) ? n()["expander-card-display"] : "none") ?? ""};
             --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --child-padding:${n()["child-padding"] ?? ""}`)), Ir(3, x, () => Fr, () => ({ duration: 500, easing: ui })), ve(g, x);
    };
    wt(V, (g) => {
      n().cards && g(G);
    });
  }
  return ie(T), Se(() => {
    ne(T, "class", `${`expander-card${n().clear ? " clear" : ""}${y(a) ? " open" : " close"}` ?? ""} svelte-icqkke`), ne(T, "style", `--expander-card-display:${n()["expander-card-display"] ?? ""};
     --gap:${(y(a) ? n()["expanded-gap"] : n().gap) ?? ""}; --padding:${n().padding ?? ""};
     --expander-state:${y(a) ?? ""};
     --card-background:${(y(a) && n()["expander-card-background-expanded"] ? n()["expander-card-background-expanded"] : n()["expander-card-background"]) ?? ""}`);
  }), ve(e, T), Mt({
    get hass() {
      return r();
    },
    set hass(g) {
      r(g), se();
    },
    get config() {
      return n();
    },
    set config(g = Et) {
      n(g), se();
    }
  });
}
Mn([
  "touchstart",
  "touchmove",
  "touchend",
  "click"
]);
customElements.define("expander-card", Lr(_i, { hass: {}, config: {} }, [], [], !0, (e) => class extends e {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    Y(this, "config");
  }
  setConfig(r = {}) {
    this.config = { ...Et, ...r };
  }
}));
const pi = "2.3.2";
console.info(
  `%c  Expander-Card 
%c Version ${pi}`,
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
  _i as default
};
//# sourceMappingURL=expander-card.js.map
