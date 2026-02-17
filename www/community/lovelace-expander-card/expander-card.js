var qo = Object.defineProperty;
var cs = (t) => {
  throw TypeError(t);
};
var Go = (t, e, n) => e in t ? qo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var q = (t, e, n) => Go(t, typeof e != "symbol" ? e + "" : e, n), Yr = (t, e, n) => e.has(t) || cs("Cannot " + n);
var h = (t, e, n) => (Yr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), N = (t, e, n) => e.has(t) ? cs("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), x = (t, e, n, r) => (Yr(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n), V = (t, e, n) => (Yr(t, e, "access private method"), n);
const Uo = "5";
var Ks;
typeof window < "u" && ((Ks = window.__svelte ?? (window.__svelte = {})).v ?? (Ks.v = /* @__PURE__ */ new Set())).add(Uo);
const zo = {
  icon: "",
  "arrow-color": "",
  "icon-rotate-degree": "",
  "header-color": "",
  "button-background": "",
  "min-width-expanded": 0,
  "max-width-expanded": 0,
  "storage-id": "",
  "expander-card-id": "",
  "show-button-users": [],
  "start-expanded-users": [],
  "expander-card-background": "",
  "expander-card-background-expanded": "",
  "expander-card-display": "",
  gap: "",
  padding: "",
  "expanded-gap": "",
  "child-padding": "",
  "child-margin-top": "",
  "overlay-margin": "",
  "title-card-padding": "",
  style: ""
}, Bo = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var pr = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(pr || {});
const Vo = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Wo = { name: "style", label: "CSS structured object", selector: { object: {} } }, Yo = { icon: {} }, Jo = { text: {} }, Ko = { boolean: {} }, Xo = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Qo = (t, e) => ({
  name: t,
  label: e,
  selector: Yo
}), J = (t, e) => ({
  name: t,
  label: e,
  selector: Jo
}), sn = (t, e) => ({
  name: t,
  label: e,
  selector: Ko
}), us = (t, e, n) => ({
  name: t,
  label: e,
  selector: Xo(n)
}), Zo = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...J("title", "Title")
      },
      {
        ...Qo("icon", "Icon")
      },
      {
        type: "expandable",
        label: "Expander control",
        icon: "mdi:cog-outline",
        schema: [
          {
            type: "grid",
            schema: [
              {
                ...sn("expanded", "Start expanded")
              },
              {
                ...sn("animation", "Enable animation")
              },
              {
                name: "haptic",
                label: "Haptic feedback",
                selector: {
                  select: {
                    mode: "dropdown",
                    options: [
                      { value: "light", label: "Light" },
                      { value: "medium", label: "Medium" },
                      { value: "heavy", label: "Heavy" },
                      { value: "success", label: "Success" },
                      { value: "warning", label: "Warning" },
                      { value: "failure", label: "Failure" },
                      { value: "selection", label: "Selection" },
                      { value: "none", label: "None" }
                    ]
                  }
                }
              },
              {
                ...us("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...us("max-width-expanded", "Max width expanded", "px")
              },
              {
                ...J("storage-id", "Storage ID")
              },
              {
                ...J("expander-card-id", "Expander card ID")
              }
            ]
          }
        ]
      },
      {
        type: "expandable",
        label: "Expander styling",
        icon: "mdi:palette-swatch",
        schema: [
          {
            type: "grid",
            schema: [
              {
                ...J("arrow-color", "Icon color")
              },
              {
                ...J("icon-rotate-degree", "Icon rotate degree")
              },
              {
                ...J("header-color", "Header color")
              },
              {
                ...J("button-background", "Button background color")
              },
              {
                ...J("expander-card-background", "Background")
              },
              {
                ...J("expander-card-background-expanded", "Background when expanded")
              },
              {
                ...J("expander-card-display", "Expander card display")
              },
              {
                ...sn("clear", "Clear border and background")
              },
              {
                ...J("gap", "Gap")
              },
              {
                ...J("padding", "Padding")
              }
            ]
          }
        ]
      },
      {
        type: "expandable",
        label: "Card styling",
        icon: "mdi:palette-swatch-outline",
        schema: [
          {
            type: "grid",
            schema: [
              {
                ...J("expanded-gap", "Card gap")
              },
              {
                ...J("child-padding", "Card padding")
              },
              {
                ...J("child-margin-top", "Card margin top")
              },
              {
                ...sn("clear-children", "Clear card border and background")
              }
            ]
          }
        ]
      },
      {
        type: "expandable",
        label: "Title card",
        icon: "mdi:subtitles-outline",
        schema: [
          {
            // title-card selector. We will override Add and Edit to show card UI editor
            name: "title-card",
            label: "Title card",
            selector: {
              object: {
                label_field: "type",
                fields: {
                  type: {
                    label: "Card type",
                    required: !0,
                    selector: { text: {} }
                  },
                  // include a marker field so we can identify schema in show-dialog event
                  expander_card_title_card_marker: {
                    required: !1,
                    selector: { text: {} }
                  }
                }
              }
            }
          },
          {
            type: "grid",
            schema: [
              {
                ...sn("title-card-clickable", "Make title card clickable to expand/collapse")
              },
              {
                ...sn("title-card-button-overlay", "Overlay expand button on title card")
              },
              {
                ...J("overlay-margin", "Overlay margin")
              },
              {
                ...J("title-card-padding", "Title card padding")
              }
            ]
          }
        ]
      },
      {
        type: "expandable",
        label: "User settings",
        icon: "mdi:account-multiple-outline",
        schema: [
          {
            type: "grid",
            schema: [
              {
                name: "show-button-users",
                label: "Show button users",
                selector: {
                  select: {
                    multiple: !0,
                    mode: "dropdown",
                    custom: !0,
                    // to allow for unknown users
                    options: ["[[users]]"]
                    // to be populated dynamically
                  }
                }
              },
              {
                name: "start-expanded-users",
                label: "Start expanded users",
                selector: {
                  select: {
                    multiple: !0,
                    mode: "dropdown",
                    custom: !0,
                    // to allow for unknown users
                    options: ["[[users]]"]
                    // to be populated dynamically
                  }
                }
              }
            ]
          }
        ]
      },
      {
        type: "expandable",
        label: "Advanced styling",
        icon: "mdi:brush-outline",
        schema: ["[[style]]"]
        // to be populated dynamically
      },
      {
        type: "expandable",
        label: "Advanced templates",
        icon: "mdi:code-brackets",
        schema: [
          {
            type: "expandable",
            label: "Variables",
            icon: "mdi:variable",
            schema: [
              {
                name: "variables",
                label: "Variables",
                selector: {
                  object: {
                    label_field: "variable",
                    multiple: !0,
                    fields: {
                      variable: {
                        label: "Variable name",
                        required: !0,
                        selector: { text: {} }
                      },
                      value_template: {
                        label: "Value template",
                        required: !0,
                        selector: { text: { multiline: !0 } }
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            type: "expandable",
            label: "Templates",
            icon: "mdi:code-brackets",
            schema: [
              {
                name: "templates",
                label: "Templates",
                selector: {
                  object: {
                    label_field: "template",
                    multiple: !0,
                    fields: {
                      template: {
                        label: "Config item",
                        required: !0,
                        selector: {
                          select: {
                            mode: "dropdown",
                            custom_value: !0,
                            // to allow for current templates not in dropdown
                            sort: !0,
                            options: ["[[templates]]"]
                            // to be populated dynamically
                          }
                        }
                      },
                      value_template: {
                        label: "Value template",
                        required: !0,
                        selector: { template: {} }
                      }
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
], el = (t, e) => new Promise((n) => {
  const r = e.cancel, i = e.submit;
  t.dispatchEvent(
    new CustomEvent(
      "show-dialog",
      {
        detail: {
          dialogTag: "expander-card-title-card-edit-form",
          dialogImport: () => customElements.whenDefined("expander-card-title-card-edit-form"),
          dialogParams: {
            ...e,
            cancel: () => {
              n(null), r && r();
            },
            submit: (s) => {
              n(s), i && i(s);
            }
          }
        },
        bubbles: !0,
        composed: !0
      }
    )
  );
}), jn = window;
let vr = jn.cardHelpers;
const tl = new Promise((t) => {
  vr && t(), jn.loadCardHelpers && jn.loadCardHelpers().then((e) => {
    vr = e, jn.cardHelpers = vr, t();
  });
});
async function nl() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((r) => !r.system_generated).map((r) => r.name) : void 0;
}
const rl = async () => {
  const t = await tl.then(() => vr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await nl();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (i) => {
        var a, o, l, u;
        ((l = (o = (a = i.detail) == null ? void 0 : a.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((c) => c.name === "expander_card_title_card_marker")) && (i.stopPropagation(), (u = i.detail) != null && u.dialogImport && i.detail.dialogImport().then(async () => {
          var f, _, w, g, A, d, v, y;
          const c = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (_ = (f = i.detail) == null ? void 0 : f.dialogParams) == null ? void 0 : _.submit,
            cancel: (g = (w = i.detail) == null ? void 0 : w.dialogParams) == null ? void 0 : g.cancel,
            submitText: (d = (A = i.detail) == null ? void 0 : A.dialogParams) == null ? void 0 : d.submitText,
            cancelText: (y = (v = i.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : y.cancelText,
            lovelace: this.lovelace
          };
          await el(
            this,
            c
          );
        }));
      }, this._computeLabelCallback = (i) => i.label ?? i.name ?? "", this._valueChanged = (i) => {
        const s = i.detail.value, a = Object.entries(zo);
        for (const [o, l] of a) {
          if (typeof l == "object" && Array.isArray(l) && Array.isArray(s[o])) {
            JSON.stringify(s[o]) === JSON.stringify(l) && delete s[o];
            continue;
          }
          s[o] === l && delete s[o];
        }
        this._config = s, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
      }, this._users = n;
    }
    // override setConfig to store config only and not assert stack editor config
    // we also upgrade any old config here if needed
    setConfig(i) {
      this._config = i;
    }
    // define _schema getter to return our own schema
    get _schema() {
      const s = JSON.stringify(Zo), a = this._users.map((f) => f.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = s.replace(/\[\[users\]\]/g, a);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Bo.filter((f) => {
          var _;
          return !((_ = this._config.templates) != null && _.some((w) => w.template === f));
        }).join('","')
      );
      const u = (this._config.style && typeof this._config.style == "object" ? pr.Object : pr.CSS) === pr.CSS ? JSON.stringify(Vo) : JSON.stringify(Wo);
      return o = o.replace(/"\[\[style\]\]"/g, u), JSON.parse(o);
    }
    // _schema setter does nothing as we want to use our own schema
    set _schema(i) {
    }
    connectedCallback() {
      super.connectedCallback(), this.addEventListener("show-dialog", this.showDialogCallback.bind(this), !0);
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this.removeEventListener("show-dialog", this.showDialogCallback.bind(this), !0);
    }
  };
}, il = async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => jn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await rl();
    customElements.define("expander-card-editor", t);
  }
}, sl = 1, al = 2, ol = 16, ll = 1, cl = 2, Ti = "[", Dr = "[!", Ni = "]", Yt = {}, K = Symbol(), na = "http://www.w3.org/1999/xhtml", ui = !1;
var ra = Array.isArray, ul = Array.prototype.indexOf, yn = Array.prototype.includes, Mr = Array.from, Sr = Object.keys, xr = Object.defineProperty, un = Object.getOwnPropertyDescriptor, dl = Object.getOwnPropertyDescriptors, fl = Object.prototype, hl = Array.prototype, ia = Object.getPrototypeOf, ds = Object.isExtensible;
const pl = () => {
};
function vl(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function sa() {
  var t, e, n = new Promise((r, i) => {
    t = r, e = i;
  });
  return { promise: n, resolve: t, reject: e };
}
const Q = 2, Vn = 4, Hr = 8, aa = 1 << 24, at = 16, He = 32, Tt = 64, oa = 128, be = 512, W = 1024, Z = 2048, Me = 4096, de = 8192, it = 16384, Tn = 32768, bn = 65536, fs = 1 << 17, la = 1 << 18, Qt = 1 << 19, _l = 1 << 20, mt = 1 << 25, Wn = 65536, di = 1 << 21, Ci = 1 << 22, bt = 1 << 23, _r = Symbol("$state"), gl = Symbol("legacy props"), ml = Symbol(""), kt = new class extends Error {
  constructor() {
    super(...arguments);
    q(this, "name", "StaleReactionError");
    q(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Xs, Qs;
const yl = ((Qs = (Xs = globalThis.document) == null ? void 0 : Xs.contentType) == null ? void 0 : /* @__PURE__ */ Qs.includes("xml")) ?? !1, jr = 3, Zt = 8;
function bl(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function wl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function El(t, e, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function $l(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Al() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ol(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Sl() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function xl() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Tl() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Nl() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Cl() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Rl() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function rr(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Il() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function Le(t) {
  L = t;
}
let I;
function ne(t) {
  if (t === null)
    throw rr(), Yt;
  return I = t;
}
function wn() {
  return ne(/* @__PURE__ */ je(I));
}
function Ye(t) {
  if (L) {
    if (/* @__PURE__ */ je(I) !== null)
      throw rr(), Yt;
    I = t;
  }
}
function Ll(t = 1) {
  if (L) {
    for (var e = t, n = I; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ je(n);
    I = n;
  }
}
function Tr(t = !0) {
  for (var e = 0, n = I; ; ) {
    if (n.nodeType === Zt) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Ni) {
        if (e === 0) return n;
        e -= 1;
      } else (r === Ti || r === Dr || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (e += 1);
    }
    var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ je(n)
    );
    t && n.remove(), n = i;
  }
}
function ca(t) {
  if (!t || t.nodeType !== Zt)
    throw rr(), Yt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function ua(t) {
  return t === this.v;
}
function kl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function da(t) {
  return !kl(t, this.v);
}
let Pl = !1, fe = null;
function En(t) {
  fe = t;
}
function Ri(t, e = !1, n) {
  fe = {
    p: fe,
    i: !1,
    c: null,
    e: null,
    s: t,
    x: null,
    l: null
  };
}
function Ii(t) {
  var e = (
    /** @type {ComponentContext} */
    fe
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var r of n)
      Pa(r);
  }
  return t !== void 0 && (e.x = t), e.i = !0, fe = e.p, t ?? /** @type {T} */
  {};
}
function fa() {
  return !0;
}
let Pt = [];
function ha() {
  var t = Pt;
  Pt = [], vl(t);
}
function zt(t) {
  if (Pt.length === 0 && !Fn) {
    var e = Pt;
    queueMicrotask(() => {
      e === Pt && ha();
    });
  }
  Pt.push(t);
}
function Dl() {
  for (; Pt.length > 0; )
    ha();
}
function pa(t) {
  var e = P;
  if (e === null)
    return R.f |= bt, t;
  if ((e.f & Tn) === 0 && (e.f & Vn) === 0)
    throw t;
  $n(t, e);
}
function $n(t, e) {
  for (; e !== null; ) {
    if ((e.f & oa) !== 0) {
      if ((e.f & Tn) === 0)
        throw t;
      try {
        e.b.error(t);
        return;
      } catch (n) {
        t = n;
      }
    }
    e = e.parent;
  }
  throw t;
}
const Ml = -7169;
function U(t, e) {
  t.f = t.f & Ml | e;
}
function Li(t) {
  (t.f & be) !== 0 || t.deps === null ? U(t, W) : U(t, Me);
}
function va(t) {
  if (t !== null)
    for (const e of t)
      (e.f & Q) === 0 || (e.f & Wn) === 0 || (e.f ^= Wn, va(
        /** @type {Derived} */
        e.deps
      ));
}
function _a(t, e, n) {
  (t.f & Z) !== 0 ? e.add(t) : (t.f & Me) !== 0 && n.add(t), va(t.deps), U(t, W);
}
const ur = /* @__PURE__ */ new Set();
let D = null, X = null, se = [], Fr = null, fi = !1, Fn = !1;
var fn, hn, Ht, pn, Qn, Zn, jt, Xe, vn, Be, hi, pi, ga;
const Qi = class Qi {
  constructor() {
    N(this, Be);
    q(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    q(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    q(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    N(this, fn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    N(this, hn, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    N(this, Ht, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    N(this, pn, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    N(this, Qn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    N(this, Zn, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    N(this, jt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    N(this, Xe, /* @__PURE__ */ new Map());
    q(this, "is_fork", !1);
    N(this, vn, !1);
  }
  is_deferred() {
    return this.is_fork || h(this, pn) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    h(this, Xe).has(e) || h(this, Xe).set(e, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(e) {
    var n = h(this, Xe).get(e);
    if (n) {
      h(this, Xe).delete(e);
      for (var r of n.d)
        U(r, Z), ke(r);
      for (r of n.m)
        U(r, Me), ke(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(e) {
    var i;
    se = [], this.apply();
    var n = [], r = [];
    for (const s of e)
      V(this, Be, hi).call(this, s, n, r);
    if (this.is_deferred()) {
      V(this, Be, pi).call(this, r), V(this, Be, pi).call(this, n);
      for (const [s, a] of h(this, Xe))
        wa(s, a);
    } else {
      for (const s of h(this, fn)) s();
      h(this, fn).clear(), h(this, Ht) === 0 && V(this, Be, ga).call(this), D = null, hs(r), hs(n), (i = h(this, Qn)) == null || i.resolve();
    }
    X = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(e, n) {
    n !== K && !this.previous.has(e) && this.previous.set(e, n), (e.f & bt) === 0 && (this.current.set(e, e.v), X == null || X.set(e, e.v));
  }
  activate() {
    D = this, this.apply();
  }
  deactivate() {
    D === this && (D = null, X = null);
  }
  flush() {
    if (this.activate(), se.length > 0) {
      if (ma(), D !== null && D !== this)
        return;
    } else h(this, Ht) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const e of h(this, hn)) e(this);
    h(this, hn).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(e) {
    x(this, Ht, h(this, Ht) + 1), e && x(this, pn, h(this, pn) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(e) {
    x(this, Ht, h(this, Ht) - 1), e && x(this, pn, h(this, pn) - 1), !h(this, vn) && (x(this, vn, !0), zt(() => {
      x(this, vn, !1), this.is_deferred() ? se.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const e of h(this, Zn))
      h(this, jt).delete(e), U(e, Z), ke(e);
    for (const e of h(this, jt))
      U(e, Me), ke(e);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(e) {
    h(this, fn).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    h(this, hn).add(e);
  }
  settled() {
    return (h(this, Qn) ?? x(this, Qn, sa())).promise;
  }
  static ensure() {
    if (D === null) {
      const e = D = new Qi();
      ur.add(D), Fn || zt(() => {
        D === e && e.flush();
      });
    }
    return D;
  }
  apply() {
  }
};
fn = new WeakMap(), hn = new WeakMap(), Ht = new WeakMap(), pn = new WeakMap(), Qn = new WeakMap(), Zn = new WeakMap(), jt = new WeakMap(), Xe = new WeakMap(), vn = new WeakMap(), Be = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
hi = function(e, n, r) {
  e.f ^= W;
  for (var i = e.first, s = null; i !== null; ) {
    var a = i.f, o = (a & (He | Tt)) !== 0, l = o && (a & W) !== 0, u = l || (a & de) !== 0 || h(this, Xe).has(i);
    if (!u && i.fn !== null) {
      o ? i.f ^= W : s !== null && (a & (Vn | Hr | aa)) !== 0 ? s.b.defer_effect(i) : (a & Vn) !== 0 ? n.push(i) : ir(i) && ((a & at) !== 0 && h(this, jt).add(i), On(i));
      var c = i.first;
      if (c !== null) {
        i = c;
        continue;
      }
    }
    var f = i.parent;
    for (i = i.next; i === null && f !== null; )
      f === s && (s = null), i = f.next, f = f.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
pi = function(e) {
  for (var n = 0; n < e.length; n += 1)
    _a(e[n], h(this, Zn), h(this, jt));
}, ga = function() {
  var i;
  if (ur.size > 1) {
    this.previous.clear();
    var e = X, n = !0;
    for (const s of ur) {
      if (s === this) {
        n = !1;
        continue;
      }
      const a = [];
      for (const [l, u] of this.current) {
        if (s.current.has(l))
          if (n && u !== s.current.get(l))
            s.current.set(l, u);
          else
            continue;
        a.push(l);
      }
      if (a.length === 0)
        continue;
      const o = [...s.current.keys()].filter((l) => !this.current.has(l));
      if (o.length > 0) {
        var r = se;
        se = [];
        const l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const c of a)
          ya(c, o, l, u);
        if (se.length > 0) {
          D = s, s.apply();
          for (const c of se)
            V(i = s, Be, hi).call(i, c, [], []);
          s.deactivate();
        }
        se = r;
      }
    }
    D = null, X = e;
  }
  this.committed = !0, ur.delete(this);
};
let st = Qi;
function me(t) {
  var e = Fn;
  Fn = !0;
  try {
    for (var n; ; ) {
      if (Dl(), se.length === 0 && (D == null || D.flush(), se.length === 0))
        return Fr = null, /** @type {T} */
        n;
      ma();
    }
  } finally {
    Fn = e;
  }
}
function ma() {
  fi = !0;
  var t = null;
  try {
    for (var e = 0; se.length > 0; ) {
      var n = st.ensure();
      if (e++ > 1e3) {
        var r, i;
        Hl();
      }
      n.process(se), wt.clear();
    }
  } finally {
    se = [], fi = !1, Fr = null;
  }
}
function Hl() {
  try {
    Sl();
  } catch (t) {
    $n(t, Fr);
  }
}
let xe = null;
function hs(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var r = t[n++];
      if ((r.f & (it | de)) === 0 && ir(r) && (xe = /* @__PURE__ */ new Set(), On(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && ja(r), (xe == null ? void 0 : xe.size) > 0)) {
        wt.clear();
        for (const i of xe) {
          if ((i.f & (it | de)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            xe.has(a) && (xe.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (it | de)) === 0 && On(l);
          }
        }
        xe.clear();
      }
    }
    xe = null;
  }
}
function ya(t, e, n, r) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const i of t.reactions) {
      const s = i.f;
      (s & Q) !== 0 ? ya(
        /** @type {Derived} */
        i,
        e,
        n,
        r
      ) : (s & (Ci | at)) !== 0 && (s & Z) === 0 && ba(i, e, r) && (U(i, Z), ke(
        /** @type {Effect} */
        i
      ));
    }
}
function ba(t, e, n) {
  const r = n.get(t);
  if (r !== void 0) return r;
  if (t.deps !== null)
    for (const i of t.deps) {
      if (yn.call(e, i))
        return !0;
      if ((i.f & Q) !== 0 && ba(
        /** @type {Derived} */
        i,
        e,
        n
      ))
        return n.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return n.set(t, !1), !1;
}
function ke(t) {
  for (var e = Fr = t; e.parent !== null; ) {
    e = e.parent;
    var n = e.f;
    if (fi && e === P && (n & at) !== 0 && (n & la) === 0)
      return;
    if ((n & (Tt | He)) !== 0) {
      if ((n & W) === 0) return;
      e.f ^= W;
    }
  }
  se.push(e);
}
function wa(t, e) {
  if (!((t.f & He) !== 0 && (t.f & W) !== 0)) {
    (t.f & Z) !== 0 ? e.d.push(t) : (t.f & Me) !== 0 && e.m.push(t), U(t, W);
    for (var n = t.first; n !== null; )
      wa(n, e), n = n.next;
  }
}
function jl(t) {
  let e = 0, n = Jt(0), r;
  return () => {
    Mi() && (p(n), Hi(() => (e === 0 && (r = Ce(() => t(() => qn(n)))), e += 1, () => {
      zt(() => {
        e -= 1, e === 0 && (r == null || r(), r = void 0, qn(n));
      });
    })));
  };
}
var Fl = bn | Qt | oa;
function ql(t, e, n) {
  new Gl(t, e, n);
}
var ce, er, qe, Ft, Ge, _e, ie, Ue, Qe, gt, qt, Ze, _n, Gt, gn, mn, et, kr, z, Ea, $a, vi, gr, mr, _i;
class Gl {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(e, n, r) {
    N(this, z);
    /** @type {Boundary | null} */
    q(this, "parent");
    q(this, "is_pending", !1);
    /** @type {TemplateNode} */
    N(this, ce);
    /** @type {TemplateNode | null} */
    N(this, er, L ? I : null);
    /** @type {BoundaryProps} */
    N(this, qe);
    /** @type {((anchor: Node) => void)} */
    N(this, Ft);
    /** @type {Effect} */
    N(this, Ge);
    /** @type {Effect | null} */
    N(this, _e, null);
    /** @type {Effect | null} */
    N(this, ie, null);
    /** @type {Effect | null} */
    N(this, Ue, null);
    /** @type {DocumentFragment | null} */
    N(this, Qe, null);
    /** @type {TemplateNode | null} */
    N(this, gt, null);
    N(this, qt, 0);
    N(this, Ze, 0);
    N(this, _n, !1);
    N(this, Gt, !1);
    /** @type {Set<Effect>} */
    N(this, gn, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    N(this, mn, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    N(this, et, null);
    N(this, kr, jl(() => (x(this, et, Jt(h(this, qt))), () => {
      x(this, et, null);
    })));
    x(this, ce, e), x(this, qe, n), x(this, Ft, r), this.parent = /** @type {Effect} */
    P.b, this.is_pending = !!h(this, qe).pending, x(this, Ge, ji(() => {
      if (P.b = this, L) {
        const s = h(this, er);
        wn(), /** @type {Comment} */
        s.nodeType === Zt && /** @type {Comment} */
        s.data === Dr ? V(this, z, $a).call(this) : (V(this, z, Ea).call(this), h(this, Ze) === 0 && (this.is_pending = !1));
      } else {
        var i = V(this, z, vi).call(this);
        try {
          x(this, _e, ye(() => r(i)));
        } catch (s) {
          this.error(s);
        }
        h(this, Ze) > 0 ? V(this, z, mr).call(this) : this.is_pending = !1;
      }
      return () => {
        var s;
        (s = h(this, gt)) == null || s.remove();
      };
    }, Fl)), L && x(this, ce, I);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    _a(e, h(this, gn), h(this, mn));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!h(this, qe).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(e) {
    V(this, z, _i).call(this, e), x(this, qt, h(this, qt) + e), !(!h(this, et) || h(this, _n)) && (x(this, _n, !0), zt(() => {
      x(this, _n, !1), h(this, et) && An(h(this, et), h(this, qt));
    }));
  }
  get_effect_pending() {
    return h(this, kr).call(this), p(
      /** @type {Source<number>} */
      h(this, et)
    );
  }
  /** @param {unknown} error */
  error(e) {
    var n = h(this, qe).onerror;
    let r = h(this, qe).failed;
    if (h(this, Gt) || !n && !r)
      throw e;
    h(this, _e) && (re(h(this, _e)), x(this, _e, null)), h(this, ie) && (re(h(this, ie)), x(this, ie, null)), h(this, Ue) && (re(h(this, Ue)), x(this, Ue, null)), L && (ne(
      /** @type {TemplateNode} */
      h(this, er)
    ), Ll(), ne(Tr()));
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        Il();
        return;
      }
      i = !0, s && Rl(), st.ensure(), x(this, qt, 0), h(this, Ue) !== null && Bt(h(this, Ue), () => {
        x(this, Ue, null);
      }), this.is_pending = this.has_pending_snippet(), x(this, _e, V(this, z, gr).call(this, () => (x(this, Gt, !1), ye(() => h(this, Ft).call(this, h(this, ce)))))), h(this, Ze) > 0 ? V(this, z, mr).call(this) : this.is_pending = !1;
    };
    zt(() => {
      try {
        s = !0, n == null || n(e, a), s = !1;
      } catch (o) {
        $n(o, h(this, Ge) && h(this, Ge).parent);
      }
      r && x(this, Ue, V(this, z, gr).call(this, () => {
        st.ensure(), x(this, Gt, !0);
        try {
          return ye(() => {
            r(
              h(this, ce),
              () => e,
              () => a
            );
          });
        } catch (o) {
          return $n(
            o,
            /** @type {Effect} */
            h(this, Ge).parent
          ), null;
        } finally {
          x(this, Gt, !1);
        }
      }));
    });
  }
}
ce = new WeakMap(), er = new WeakMap(), qe = new WeakMap(), Ft = new WeakMap(), Ge = new WeakMap(), _e = new WeakMap(), ie = new WeakMap(), Ue = new WeakMap(), Qe = new WeakMap(), gt = new WeakMap(), qt = new WeakMap(), Ze = new WeakMap(), _n = new WeakMap(), Gt = new WeakMap(), gn = new WeakMap(), mn = new WeakMap(), et = new WeakMap(), kr = new WeakMap(), z = new WeakSet(), Ea = function() {
  try {
    x(this, _e, ye(() => h(this, Ft).call(this, h(this, ce))));
  } catch (e) {
    this.error(e);
  }
}, $a = function() {
  const e = h(this, qe).pending;
  e && (x(this, ie, ye(() => e(h(this, ce)))), zt(() => {
    var n = V(this, z, vi).call(this);
    x(this, _e, V(this, z, gr).call(this, () => (st.ensure(), ye(() => h(this, Ft).call(this, n))))), h(this, Ze) > 0 ? V(this, z, mr).call(this) : (Bt(
      /** @type {Effect} */
      h(this, ie),
      () => {
        x(this, ie, null);
      }
    ), this.is_pending = !1);
  }));
}, vi = function() {
  var e = h(this, ce);
  return this.is_pending && (x(this, gt, we()), h(this, ce).before(h(this, gt)), e = h(this, gt)), e;
}, /**
 * @param {() => Effect | null} fn
 */
gr = function(e) {
  var n = P, r = R, i = fe;
  $e(h(this, Ge)), oe(h(this, Ge)), En(h(this, Ge).ctx);
  try {
    return e();
  } catch (s) {
    return pa(s), null;
  } finally {
    $e(n), oe(r), En(i);
  }
}, mr = function() {
  const e = (
    /** @type {(anchor: Node) => void} */
    h(this, qe).pending
  );
  h(this, _e) !== null && (x(this, Qe, document.createDocumentFragment()), h(this, Qe).append(
    /** @type {TemplateNode} */
    h(this, gt)
  ), Ga(h(this, _e), h(this, Qe))), h(this, ie) === null && x(this, ie, ye(() => e(h(this, ce))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
_i = function(e) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && V(n = this.parent, z, _i).call(n, e);
    return;
  }
  if (x(this, Ze, h(this, Ze) + e), h(this, Ze) === 0) {
    this.is_pending = !1;
    for (const r of h(this, gn))
      U(r, Z), ke(r);
    for (const r of h(this, mn))
      U(r, Me), ke(r);
    h(this, gn).clear(), h(this, mn).clear(), h(this, ie) && Bt(h(this, ie), () => {
      x(this, ie, null);
    }), h(this, Qe) && (h(this, ce).before(h(this, Qe)), x(this, Qe, null));
  }
};
function Ul(t, e, n, r) {
  const i = qr;
  var s = t.filter((_) => !_.settled);
  if (n.length === 0 && s.length === 0) {
    r(e.map(i));
    return;
  }
  var a = D, o = (
    /** @type {Effect} */
    P
  ), l = zl(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((_) => _.promise)) : null;
  function c(_) {
    l();
    try {
      r(_);
    } catch (w) {
      (o.f & it) === 0 && $n(w, o);
    }
    a == null || a.deactivate(), gi();
  }
  if (n.length === 0) {
    u.then(() => c(e.map(i)));
    return;
  }
  function f() {
    l(), Promise.all(n.map((_) => /* @__PURE__ */ Bl(_))).then((_) => c([...e.map(i), ..._])).catch((_) => $n(_, o));
  }
  u ? u.then(f) : f();
}
function zl() {
  var t = P, e = R, n = fe, r = D;
  return function(s = !0) {
    $e(t), oe(e), En(n), s && (r == null || r.activate());
  };
}
function gi() {
  $e(null), oe(null), En(null);
}
// @__NO_SIDE_EFFECTS__
function qr(t) {
  var e = Q | Z, n = R !== null && (R.f & Q) !== 0 ? (
    /** @type {Derived} */
    R
  ) : null;
  return P !== null && (P.f |= Qt), {
    ctx: fe,
    deps: null,
    effects: null,
    equals: ua,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      K
    ),
    wv: 0,
    parent: n ?? P,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Bl(t, e, n) {
  let r = (
    /** @type {Effect | null} */
    P
  );
  r === null && wl();
  var i = (
    /** @type {Boundary} */
    r.b
  ), s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Jt(
    /** @type {V} */
    K
  ), o = !R, l = /* @__PURE__ */ new Map();
  return nc(() => {
    var w;
    var u = sa();
    s = u.promise;
    try {
      Promise.resolve(t()).then(u.resolve, u.reject).then(() => {
        c === D && c.committed && c.deactivate(), gi();
      });
    } catch (g) {
      u.reject(g), gi();
    }
    var c = (
      /** @type {Batch} */
      D
    );
    if (o) {
      var f = i.is_rendered();
      i.update_pending_count(1), c.increment(f), (w = l.get(c)) == null || w.reject(kt), l.delete(c), l.set(c, u);
    }
    const _ = (g, A = void 0) => {
      if (c.activate(), A)
        A !== kt && (a.f |= bt, An(a, A));
      else {
        (a.f & bt) !== 0 && (a.f ^= bt), An(a, g);
        for (const [d, v] of l) {
          if (l.delete(d), d === c) break;
          v.reject(kt);
        }
      }
      o && (i.update_pending_count(-1), c.decrement(f));
    };
    u.promise.then(_, (g) => _(null, g || "unknown"));
  }), Zl(() => {
    for (const u of l.values())
      u.reject(kt);
  }), new Promise((u) => {
    function c(f) {
      function _() {
        f === s ? u(a) : c(s);
      }
      f.then(_, _);
    }
    c(s);
  });
}
// @__NO_SIDE_EFFECTS__
function kn(t) {
  const e = /* @__PURE__ */ qr(t);
  return Ua(e), e;
}
// @__NO_SIDE_EFFECTS__
function Vl(t) {
  const e = /* @__PURE__ */ qr(t);
  return e.equals = da, e;
}
function Wl(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var n = 0; n < e.length; n += 1)
      re(
        /** @type {Effect} */
        e[n]
      );
  }
}
function Yl(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Q) === 0)
      return (e.f & it) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function ki(t) {
  var e, n = P;
  $e(Yl(t));
  try {
    t.f &= ~Wn, Wl(t), e = Wa(t);
  } finally {
    $e(n);
  }
  return e;
}
function Aa(t) {
  var e = ki(t);
  if (!t.equals(e) && (t.wv = Ba(), (!(D != null && D.is_fork) || t.deps === null) && (t.v = e, t.deps === null))) {
    U(t, W);
    return;
  }
  Ot || (X !== null ? (Mi() || D != null && D.is_fork) && X.set(t, e) : Li(t));
}
function Jl(t) {
  var e, n;
  if (t.effects !== null)
    for (const r of t.effects)
      (r.teardown || r.ac) && ((e = r.teardown) == null || e.call(r), (n = r.ac) == null || n.abort(kt), r.teardown = pl, r.ac = null, Yn(r, 0), Fi(r));
}
function Oa(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && On(e);
}
let mi = /* @__PURE__ */ new Set();
const wt = /* @__PURE__ */ new Map();
let Sa = !1;
function Jt(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: ua,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function M(t, e) {
  const n = Jt(t);
  return Ua(n), n;
}
// @__NO_SIDE_EFFECTS__
function xa(t, e = !1, n = !0) {
  const r = Jt(t);
  return e || (r.equals = da), r;
}
function O(t, e, n = !1) {
  R !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!De || (R.f & fs) !== 0) && fa() && (R.f & (Q | at | Ci | fs)) !== 0 && (Ee === null || !yn.call(Ee, t)) && Cl();
  let r = n ? nt(e) : e;
  return An(t, r);
}
function An(t, e) {
  if (!t.equals(e)) {
    var n = t.v;
    Ot ? wt.set(t, e) : wt.set(t, n), t.v = e;
    var r = st.ensure();
    if (r.capture(t, n), (t.f & Q) !== 0) {
      const i = (
        /** @type {Derived} */
        t
      );
      (t.f & Z) !== 0 && ki(i), Li(i);
    }
    t.wv = Ba(), Ta(t, Z), P !== null && (P.f & W) !== 0 && (P.f & (He | Tt)) === 0 && (pe === null ? ic([t]) : pe.push(t)), !r.is_fork && mi.size > 0 && !Sa && Kl();
  }
  return e;
}
function Kl() {
  Sa = !1;
  for (const t of mi)
    (t.f & W) !== 0 && U(t, Me), ir(t) && On(t);
  mi.clear();
}
function qn(t) {
  O(t, t.v + 1);
}
function Ta(t, e) {
  var n = t.reactions;
  if (n !== null)
    for (var r = n.length, i = 0; i < r; i++) {
      var s = n[i], a = s.f, o = (a & Z) === 0;
      if (o && U(s, e), (a & Q) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        X == null || X.delete(l), (a & Wn) === 0 && (a & be && (s.f |= Wn), Ta(l, Me));
      } else o && ((a & at) !== 0 && xe !== null && xe.add(
        /** @type {Effect} */
        s
      ), ke(
        /** @type {Effect} */
        s
      ));
    }
}
function nt(t) {
  if (typeof t != "object" || t === null || _r in t)
    return t;
  const e = ia(t);
  if (e !== fl && e !== hl)
    return t;
  var n = /* @__PURE__ */ new Map(), r = ra(t), i = /* @__PURE__ */ M(0), s = Vt, a = (o) => {
    if (Vt === s)
      return o();
    var l = R, u = Vt;
    oe(null), gs(s);
    var c = o();
    return oe(l), gs(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Tl();
        var c = n.get(l);
        return c === void 0 ? a(() => {
          var f = /* @__PURE__ */ M(u.value);
          return n.set(l, f), f;
        }) : O(c, u.value, !0), !0;
      },
      deleteProperty(o, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in o) {
            const c = a(() => /* @__PURE__ */ M(K));
            n.set(l, c), qn(i);
          }
        } else
          O(u, K), qn(i);
        return !0;
      },
      get(o, l, u) {
        var w;
        if (l === _r)
          return t;
        var c = n.get(l), f = l in o;
        if (c === void 0 && (!f || (w = un(o, l)) != null && w.writable) && (c = a(() => {
          var g = nt(f ? o[l] : K), A = /* @__PURE__ */ M(g);
          return A;
        }), n.set(l, c)), c !== void 0) {
          var _ = p(c);
          return _ === K ? void 0 : _;
        }
        return Reflect.get(o, l, u);
      },
      getOwnPropertyDescriptor(o, l) {
        var u = Reflect.getOwnPropertyDescriptor(o, l);
        if (u && "value" in u) {
          var c = n.get(l);
          c && (u.value = p(c));
        } else if (u === void 0) {
          var f = n.get(l), _ = f == null ? void 0 : f.v;
          if (f !== void 0 && _ !== K)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return u;
      },
      has(o, l) {
        var _;
        if (l === _r)
          return !0;
        var u = n.get(l), c = u !== void 0 && u.v !== K || Reflect.has(o, l);
        if (u !== void 0 || P !== null && (!c || (_ = un(o, l)) != null && _.writable)) {
          u === void 0 && (u = a(() => {
            var w = c ? nt(o[l]) : K, g = /* @__PURE__ */ M(w);
            return g;
          }), n.set(l, u));
          var f = p(u);
          if (f === K)
            return !1;
        }
        return c;
      },
      set(o, l, u, c) {
        var b;
        var f = n.get(l), _ = l in o;
        if (r && l === "length")
          for (var w = u; w < /** @type {Source<number>} */
          f.v; w += 1) {
            var g = n.get(w + "");
            g !== void 0 ? O(g, K) : w in o && (g = a(() => /* @__PURE__ */ M(K)), n.set(w + "", g));
          }
        if (f === void 0)
          (!_ || (b = un(o, l)) != null && b.writable) && (f = a(() => /* @__PURE__ */ M(void 0)), O(f, nt(u)), n.set(l, f));
        else {
          _ = f.v !== K;
          var A = a(() => nt(u));
          O(f, A);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d != null && d.set && d.set.call(c, u), !_) {
          if (r && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(l);
            Number.isInteger(y) && y >= v.v && O(v, y + 1);
          }
          qn(i);
        }
        return !0;
      },
      ownKeys(o) {
        p(i);
        var l = Reflect.ownKeys(o).filter((f) => {
          var _ = n.get(f);
          return _ === void 0 || _.v !== K;
        });
        for (var [u, c] of n)
          c.v !== K && !(u in o) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        Nl();
      }
    }
  );
}
var ps, Na, Ca, Ra;
function yi() {
  if (ps === void 0) {
    ps = window, Na = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    Ca = un(e, "firstChild").get, Ra = un(e, "nextSibling").get, ds(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), ds(n) && (n.__t = void 0);
  }
}
function we(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Pe(t) {
  return (
    /** @type {TemplateNode | null} */
    Ca.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function je(t) {
  return (
    /** @type {TemplateNode | null} */
    Ra.call(t)
  );
}
function dt(t, e) {
  if (!L)
    return /* @__PURE__ */ Pe(t);
  var n = /* @__PURE__ */ Pe(I);
  if (n === null)
    n = I.appendChild(we());
  else if (e && n.nodeType !== jr) {
    var r = we();
    return n == null || n.before(r), ne(r), r;
  }
  return e && Di(
    /** @type {Text} */
    n
  ), ne(n), n;
}
function vs(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Pe(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ je(n) : n;
  }
  if (e) {
    if ((I == null ? void 0 : I.nodeType) !== jr) {
      var r = we();
      return I == null || I.before(r), ne(r), r;
    }
    Di(
      /** @type {Text} */
      I
    );
  }
  return I;
}
function Rt(t, e = 1, n = !1) {
  let r = L ? I : t;
  for (var i; e--; )
    i = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ je(r);
  if (!L)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== jr) {
      var s = we();
      return r === null ? i == null || i.after(s) : r.before(s), ne(s), s;
    }
    Di(
      /** @type {Text} */
      r
    );
  }
  return ne(r), r;
}
function Ia(t) {
  t.textContent = "";
}
function La() {
  return !1;
}
function Pi(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(na, t, void 0)
  );
}
function Di(t) {
  if (
    /** @type {string} */
    t.nodeValue.length < 65536
  )
    return;
  let e = t.nextSibling;
  for (; e !== null && e.nodeType === jr; )
    e.remove(), t.nodeValue += /** @type {string} */
    e.nodeValue, e = t.nextSibling;
}
function ka(t) {
  var e = R, n = P;
  oe(null), $e(null);
  try {
    return t();
  } finally {
    oe(e), $e(n);
  }
}
function Xl(t) {
  P === null && (R === null && Ol(), Al()), Ot && $l();
}
function Ql(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Ve(t, e, n) {
  var r = P;
  r !== null && (r.f & de) !== 0 && (t |= de);
  var i = {
    ctx: fe,
    deps: null,
    nodes: null,
    f: t | Z | be,
    first: null,
    fn: e,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (n)
    try {
      On(i);
    } catch (o) {
      throw re(i), o;
    }
  else e !== null && ke(i);
  var s = i;
  if (n && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Qt) === 0 && (s = s.first, (t & at) !== 0 && (t & bn) !== 0 && s !== null && (s.f |= bn)), s !== null && (s.parent = r, r !== null && Ql(s, r), R !== null && (R.f & Q) !== 0 && (t & Tt) === 0)) {
    var a = (
      /** @type {Derived} */
      R
    );
    (a.effects ?? (a.effects = [])).push(s);
  }
  return i;
}
function Mi() {
  return R !== null && !De;
}
function Zl(t) {
  const e = Ve(Hr, null, !1);
  return U(e, W), e.teardown = t, e;
}
function dn(t) {
  Xl();
  var e = (
    /** @type {Effect} */
    P.f
  ), n = !R && (e & He) !== 0 && (e & Tn) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      fe
    );
    (r.e ?? (r.e = [])).push(t);
  } else
    return Pa(t);
}
function Pa(t) {
  return Ve(Vn | _l, t, !1);
}
function ec(t) {
  st.ensure();
  const e = Ve(Tt | Qt, t, !0);
  return () => {
    re(e);
  };
}
function tc(t) {
  st.ensure();
  const e = Ve(Tt | Qt, t, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? Bt(e, () => {
      re(e), r(void 0);
    }) : (re(e), r(void 0));
  });
}
function Da(t) {
  return Ve(Vn, t, !1);
}
function nc(t) {
  return Ve(Ci | Qt, t, !0);
}
function Hi(t, e = 0) {
  return Ve(Hr | e, t, !0);
}
function Je(t, e = [], n = [], r = []) {
  Ul(r, e, n, (i) => {
    Ve(Hr, () => t(...i.map(p)), !0);
  });
}
function ji(t, e = 0) {
  var n = Ve(at | e, t, !0);
  return n;
}
function ye(t) {
  return Ve(He | Qt, t, !0);
}
function Ma(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = Ot, r = R;
    _s(!0), oe(null);
    try {
      e.call(null);
    } finally {
      _s(n), oe(r);
    }
  }
}
function Fi(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && ka(() => {
      i.abort(kt);
    });
    var r = n.next;
    (n.f & Tt) !== 0 ? n.parent = null : re(n, e), n = r;
  }
}
function rc(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & He) === 0 && re(e), e = n;
  }
}
function re(t, e = !0) {
  var n = !1;
  (e || (t.f & la) !== 0) && t.nodes !== null && t.nodes.end !== null && (Ha(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), Fi(t, e && !n), Yn(t, 0), U(t, it);
  var r = t.nodes && t.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ma(t);
  var i = t.parent;
  i !== null && i.first !== null && ja(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = null;
}
function Ha(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ je(t);
    t.remove(), t = n;
  }
}
function ja(t) {
  var e = t.parent, n = t.prev, r = t.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), e !== null && (e.first === t && (e.first = r), e.last === t && (e.last = n));
}
function Bt(t, e, n = !0) {
  var r = [];
  Fa(t, r, !0);
  var i = () => {
    n && re(t), e && e();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var o of r)
      o.out(a);
  } else
    i();
}
function Fa(t, e, n) {
  if ((t.f & de) === 0) {
    t.f ^= de;
    var r = t.nodes && t.nodes.t;
    if (r !== null)
      for (const o of r)
        (o.is_global || n) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var s = i.next, a = (i.f & bn) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & He) !== 0 && (t.f & at) !== 0;
      Fa(i, e, a ? n : !1), i = s;
    }
  }
}
function qi(t) {
  qa(t, !0);
}
function qa(t, e) {
  if ((t.f & de) !== 0) {
    t.f ^= de, (t.f & W) === 0 && (U(t, Z), ke(t));
    for (var n = t.first; n !== null; ) {
      var r = n.next, i = (n.f & bn) !== 0 || (n.f & He) !== 0;
      qa(n, i ? e : !1), n = r;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function Ga(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, r = t.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ je(n);
      e.append(n), n = i;
    }
}
let yr = !1, Ot = !1;
function _s(t) {
  Ot = t;
}
let R = null, De = !1;
function oe(t) {
  R = t;
}
let P = null;
function $e(t) {
  P = t;
}
let Ee = null;
function Ua(t) {
  R !== null && (Ee === null ? Ee = [t] : Ee.push(t));
}
let ae = null, le = 0, pe = null;
function ic(t) {
  pe = t;
}
let za = 1, Dt = 0, Vt = Dt;
function gs(t) {
  Vt = t;
}
function Ba() {
  return ++za;
}
function ir(t) {
  var e = t.f;
  if ((e & Z) !== 0)
    return !0;
  if (e & Q && (t.f &= -65537), (e & Me) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ir(
        /** @type {Derived} */
        s
      ) && Aa(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & be) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    X === null && U(t, W);
  }
  return !1;
}
function Va(t, e, n = !0) {
  var r = t.reactions;
  if (r !== null && !(Ee !== null && yn.call(Ee, t)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & Q) !== 0 ? Va(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (n ? U(s, Z) : (s.f & W) !== 0 && U(s, Me), ke(
        /** @type {Effect} */
        s
      ));
    }
}
function Wa(t) {
  var A;
  var e = ae, n = le, r = pe, i = R, s = Ee, a = fe, o = De, l = Vt, u = t.f;
  ae = /** @type {null | Value[]} */
  null, le = 0, pe = null, R = (u & (He | Tt)) === 0 ? t : null, Ee = null, En(t.ctx), De = !1, Vt = ++Dt, t.ac !== null && (ka(() => {
    t.ac.abort(kt);
  }), t.ac = null);
  try {
    t.f |= di;
    var c = (
      /** @type {Function} */
      t.fn
    ), f = c();
    t.f |= Tn;
    var _ = t.deps, w = D == null ? void 0 : D.is_fork;
    if (ae !== null) {
      var g;
      if (w || Yn(t, le), _ !== null && le > 0)
        for (_.length = le + ae.length, g = 0; g < ae.length; g++)
          _[le + g] = ae[g];
      else
        t.deps = _ = ae;
      if (Mi() && (t.f & be) !== 0)
        for (g = le; g < _.length; g++)
          ((A = _[g]).reactions ?? (A.reactions = [])).push(t);
    } else !w && _ !== null && le < _.length && (Yn(t, le), _.length = le);
    if (fa() && pe !== null && !De && _ !== null && (t.f & (Q | Me | Z)) === 0)
      for (g = 0; g < /** @type {Source[]} */
      pe.length; g++)
        Va(
          pe[g],
          /** @type {Effect} */
          t
        );
    if (i !== null && i !== t) {
      if (Dt++, i.deps !== null)
        for (let d = 0; d < n; d += 1)
          i.deps[d].rv = Dt;
      if (e !== null)
        for (const d of e)
          d.rv = Dt;
      pe !== null && (r === null ? r = pe : r.push(.../** @type {Source[]} */
      pe));
    }
    return (t.f & bt) !== 0 && (t.f ^= bt), f;
  } catch (d) {
    return pa(d);
  } finally {
    t.f ^= di, ae = e, le = n, pe = r, R = i, Ee = s, En(a), De = o, Vt = l;
  }
}
function sc(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var r = ul.call(n, t);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = e.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (e.f & Q) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ae === null || !yn.call(ae, e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & be) !== 0 && (s.f ^= be, s.f &= -65537), Li(s), Jl(s), Yn(s, 0);
  }
}
function Yn(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var r = e; r < n.length; r++)
      sc(t, n[r]);
}
function On(t) {
  var e = t.f;
  if ((e & it) === 0) {
    U(t, W);
    var n = P, r = yr;
    P = t, yr = !0;
    try {
      (e & (at | aa)) !== 0 ? rc(t) : Fi(t), Ma(t);
      var i = Wa(t);
      t.teardown = typeof i == "function" ? i : null, t.wv = za;
      var s;
      ui && Pl && (t.f & Z) !== 0 && t.deps;
    } finally {
      yr = r, P = n;
    }
  }
}
function p(t) {
  var e = t.f, n = (e & Q) !== 0;
  if (R !== null && !De) {
    var r = P !== null && (P.f & it) !== 0;
    if (!r && (Ee === null || !yn.call(Ee, t))) {
      var i = R.deps;
      if ((R.f & di) !== 0)
        t.rv < Dt && (t.rv = Dt, ae === null && i !== null && i[le] === t ? le++ : ae === null ? ae = [t] : ae.push(t));
      else {
        (R.deps ?? (R.deps = [])).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [R] : yn.call(s, R) || s.push(R);
      }
    }
  }
  if (Ot && wt.has(t))
    return wt.get(t);
  if (n) {
    var a = (
      /** @type {Derived} */
      t
    );
    if (Ot) {
      var o = a.v;
      return ((a.f & W) === 0 && a.reactions !== null || Ja(a)) && (o = ki(a)), wt.set(a, o), o;
    }
    var l = (a.f & be) === 0 && !De && R !== null && (yr || (R.f & be) !== 0), u = (a.f & Tn) === 0;
    ir(a) && (l && (a.f |= be), Aa(a)), l && !u && (Oa(a), Ya(a));
  }
  if (X != null && X.has(t))
    return X.get(t);
  if ((t.f & bt) !== 0)
    throw t.v;
  return t.v;
}
function Ya(t) {
  if (t.f |= be, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & Q) !== 0 && (e.f & be) === 0 && (Oa(
        /** @type {Derived} */
        e
      ), Ya(
        /** @type {Derived} */
        e
      ));
}
function Ja(t) {
  if (t.v === K) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (wt.has(e) || (e.f & Q) !== 0 && Ja(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Ce(t) {
  var e = De;
  try {
    return De = !0, t();
  } finally {
    De = e;
  }
}
const ac = ["touchstart", "touchmove"];
function oc(t) {
  return ac.includes(t);
}
const br = Symbol("events"), Ka = /* @__PURE__ */ new Set(), bi = /* @__PURE__ */ new Set();
function Jr(t, e, n) {
  (e[br] ?? (e[br] = {}))[t] = n;
}
function lc(t) {
  for (var e = 0; e < t.length; e++)
    Ka.add(t[e]);
  for (var n of bi)
    n(t);
}
let ms = null;
function ys(t) {
  var d, v;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), r = t.type, i = ((d = t.composedPath) == null ? void 0 : d.call(t)) || [], s = (
    /** @type {null | Element} */
    i[0] || t.target
  );
  ms = t;
  var a = 0, o = ms === t && t.__root;
  if (o) {
    var l = i.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t.__root = e;
      return;
    }
    var u = i.indexOf(e);
    if (u === -1)
      return;
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || t.target, s !== e) {
    xr(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var c = R, f = P;
    oe(null), $e(null);
    try {
      for (var _, w = []; s !== null; ) {
        var g = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var A = (v = s[br]) == null ? void 0 : v[r];
          A != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s) && A.call(s, t);
        } catch (y) {
          _ ? w.push(y) : _ = y;
        }
        if (t.cancelBubble || g === e || g === null)
          break;
        s = g;
      }
      if (_) {
        for (let y of w)
          queueMicrotask(() => {
            throw y;
          });
        throw _;
      }
    } finally {
      t.__root = e, delete t.currentTarget, oe(c), $e(f);
    }
  }
}
var Zs, ea;
const Kr = (ea = (Zs = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Zs.trustedTypes) == null ? void 0 : /* @__PURE__ */ ea.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (t) => t
  }
);
function cc(t) {
  return (
    /** @type {string} */
    (Kr == null ? void 0 : Kr.createHTML(t)) ?? t
  );
}
function Xa(t, e = !1) {
  var n = Pi("template");
  return t = t.replaceAll("<!>", "<!---->"), n.innerHTML = e ? cc(t) : t, n.content;
}
function Et(t, e) {
  var n = (
    /** @type {Effect} */
    P
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ot(t, e) {
  var n = (e & ll) !== 0, r = (e & cl) !== 0, i, s = !t.startsWith("<!>");
  return () => {
    if (L)
      return Et(I, null), I;
    i === void 0 && (i = Xa(s ? t : "<!>" + t, !0), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Pe(i)));
    var a = (
      /** @type {TemplateNode} */
      r || Na ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Pe(a)
      ), l = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      Et(o, l);
    } else
      Et(a, a);
    return a;
  };
}
function bs() {
  if (L)
    return Et(I, null), I;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = we();
  return t.append(e, n), Et(e, n), t;
}
function ve(t, e) {
  if (L) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      P
    );
    ((n.f & Tn) === 0 || n.nodes.end === null) && (n.nodes.end = I), wn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function uc(t, e) {
  var n = e == null ? "" : typeof e == "object" ? e + "" : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = n + "");
}
function Qa(t, e) {
  return Za(t, e);
}
function dc(t, e) {
  yi(), e.intro = e.intro ?? !1;
  const n = e.target, r = L, i = I;
  try {
    for (var s = /* @__PURE__ */ Pe(n); s && (s.nodeType !== Zt || /** @type {Comment} */
    s.data !== Ti); )
      s = /* @__PURE__ */ je(s);
    if (!s)
      throw Yt;
    Le(!0), ne(
      /** @type {Comment} */
      s
    );
    const a = Za(t, { ...e, anchor: s });
    return Le(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Yt && console.warn("Failed to hydrate: ", a), e.recover === !1 && xl(), yi(), Ia(n), Le(!1), Qa(t, e);
  } finally {
    Le(r), ne(i);
  }
}
const dr = /* @__PURE__ */ new Map();
function Za(t, { target: e, anchor: n, props: r = {}, events: i, context: s, intro: a = !0 }) {
  yi();
  var o = /* @__PURE__ */ new Set(), l = (f) => {
    for (var _ = 0; _ < f.length; _++) {
      var w = f[_];
      if (!o.has(w)) {
        o.add(w);
        var g = oc(w);
        for (const v of [e, document]) {
          var A = dr.get(v);
          A === void 0 && (A = /* @__PURE__ */ new Map(), dr.set(v, A));
          var d = A.get(w);
          d === void 0 ? (v.addEventListener(w, ys, { passive: g }), A.set(w, 1)) : A.set(w, d + 1);
        }
      }
    }
  };
  l(Mr(Ka)), bi.add(l);
  var u = void 0, c = tc(() => {
    var f = n ?? e.appendChild(we());
    return ql(
      /** @type {TemplateNode} */
      f,
      {
        pending: () => {
        }
      },
      (_) => {
        Ri({});
        var w = (
          /** @type {ComponentContext} */
          fe
        );
        if (s && (w.c = s), i && (r.$$events = i), L && Et(
          /** @type {TemplateNode} */
          _,
          null
        ), u = t(_, r) || {}, L && (P.nodes.end = I, I === null || I.nodeType !== Zt || /** @type {Comment} */
        I.data !== Ni))
          throw rr(), Yt;
        Ii();
      }
    ), () => {
      var A;
      for (var _ of o)
        for (const d of [e, document]) {
          var w = (
            /** @type {Map<string, number>} */
            dr.get(d)
          ), g = (
            /** @type {number} */
            w.get(_)
          );
          --g == 0 ? (d.removeEventListener(_, ys), w.delete(_), w.size === 0 && dr.delete(d)) : w.set(_, g);
        }
      bi.delete(l), f !== n && ((A = f.parentNode) == null || A.removeChild(f));
    };
  });
  return wi.set(u, c), u;
}
let wi = /* @__PURE__ */ new WeakMap();
function fc(t, e) {
  const n = wi.get(t);
  return n ? (wi.delete(t), n(e)) : Promise.resolve();
}
var Ne, ze, ue, Ut, tr, nr, Pr;
class hc {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    q(this, "anchor");
    /** @type {Map<Batch, Key>} */
    N(this, Ne, /* @__PURE__ */ new Map());
    /**
     * Map of keys to effects that are currently rendered in the DOM.
     * These effects are visible and actively part of the document tree.
     * Example:
     * ```
     * {#if condition}
     * 	foo
     * {:else}
     * 	bar
     * {/if}
     * ```
     * Can result in the entries `true->Effect` and `false->Effect`
     * @type {Map<Key, Effect>}
     */
    N(this, ze, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    N(this, ue, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    N(this, Ut, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    N(this, tr, !0);
    N(this, nr, () => {
      var e = (
        /** @type {Batch} */
        D
      );
      if (h(this, Ne).has(e)) {
        var n = (
          /** @type {Key} */
          h(this, Ne).get(e)
        ), r = h(this, ze).get(n);
        if (r)
          qi(r), h(this, Ut).delete(n);
        else {
          var i = h(this, ue).get(n);
          i && (h(this, ze).set(n, i.effect), h(this, ue).delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
        }
        for (const [s, a] of h(this, Ne)) {
          if (h(this, Ne).delete(s), s === e)
            break;
          const o = h(this, ue).get(a);
          o && (re(o.effect), h(this, ue).delete(a));
        }
        for (const [s, a] of h(this, ze)) {
          if (s === n || h(this, Ut).has(s)) continue;
          const o = () => {
            if (Array.from(h(this, Ne).values()).includes(s)) {
              var u = document.createDocumentFragment();
              Ga(a, u), u.append(we()), h(this, ue).set(s, { effect: a, fragment: u });
            } else
              re(a);
            h(this, Ut).delete(s), h(this, ze).delete(s);
          };
          h(this, tr) || !r ? (h(this, Ut).add(s), Bt(a, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    N(this, Pr, (e) => {
      h(this, Ne).delete(e);
      const n = Array.from(h(this, Ne).values());
      for (const [r, i] of h(this, ue))
        n.includes(r) || (re(i.effect), h(this, ue).delete(r));
    });
    this.anchor = e, x(this, tr, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, n) {
    var r = (
      /** @type {Batch} */
      D
    ), i = La();
    if (n && !h(this, ze).has(e) && !h(this, ue).has(e))
      if (i) {
        var s = document.createDocumentFragment(), a = we();
        s.append(a), h(this, ue).set(e, {
          effect: ye(() => n(a)),
          fragment: s
        });
      } else
        h(this, ze).set(
          e,
          ye(() => n(this.anchor))
        );
    if (h(this, Ne).set(r, e), i) {
      for (const [o, l] of h(this, ze))
        o === e ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [o, l] of h(this, ue))
        o === e ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(h(this, nr)), r.ondiscard(h(this, Pr));
    } else
      L && (this.anchor = I), h(this, nr).call(this);
  }
}
Ne = new WeakMap(), ze = new WeakMap(), ue = new WeakMap(), Ut = new WeakMap(), tr = new WeakMap(), nr = new WeakMap(), Pr = new WeakMap();
function eo(t) {
  fe === null && bl(), dn(() => {
    const e = Ce(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ft(t, e, n = !1) {
  L && wn();
  var r = new hc(t), i = n ? bn : 0;
  function s(a, o) {
    if (L) {
      const c = ca(t);
      var l;
      if (c === Ti ? l = 0 : c === Dr ? l = !1 : l = parseInt(c.substring(1)), a !== l) {
        var u = Tr();
        ne(u), r.anchor = u, Le(!1), r.ensure(a, o), Le(!0);
        return;
      }
    }
    r.ensure(a, o);
  }
  ji(() => {
    var a = !1;
    e((o, l = 0) => {
      a = !0, s(l, o);
    }), a || s(!1, null);
  }, i);
}
function pc(t, e, n) {
  for (var r = [], i = e.length, s, a = e.length, o = 0; o < i; o++) {
    let f = e[o];
    Bt(
      f,
      () => {
        if (s) {
          if (s.pending.delete(f), s.done.add(f), s.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            Ei(Mr(s.done)), _.delete(s), _.size === 0 && (t.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var l = r.length === 0 && n !== null;
    if (l) {
      var u = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        u.parentNode
      );
      Ia(c), c.append(u), t.items.clear();
    }
    Ei(e, !l);
  } else
    s = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function Ei(t, e = !0) {
  for (var n = 0; n < t.length; n++)
    re(t[n], e);
}
var ws;
function vc(t, e, n, r, i, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = L ? ne(/* @__PURE__ */ Pe(l)) : l.appendChild(we());
  }
  L && wn();
  var u = null, c = /* @__PURE__ */ Vl(() => {
    var d = n();
    return ra(d) ? d : d == null ? [] : Mr(d);
  }), f, _ = !0;
  function w() {
    A.fallback = u, _c(A, f, a, e, r), u !== null && (f.length === 0 ? (u.f & mt) === 0 ? qi(u) : (u.f ^= mt, Hn(u, null, a)) : Bt(u, () => {
      u = null;
    }));
  }
  var g = ji(() => {
    f = /** @type {V[]} */
    p(c);
    var d = f.length;
    let v = !1;
    if (L) {
      var y = ca(a) === Dr;
      y !== (d === 0) && (a = Tr(), ne(a), Le(!1), v = !0);
    }
    for (var b = /* @__PURE__ */ new Set(), S = (
      /** @type {Batch} */
      D
    ), T = La(), C = 0; C < d; C += 1) {
      L && I.nodeType === Zt && /** @type {Comment} */
      I.data === Ni && (a = /** @type {Comment} */
      I, v = !0, Le(!1));
      var k = f[C], F = r(k, C), H = _ ? null : o.get(F);
      H ? (H.v && An(H.v, k), H.i && An(H.i, C), T && S.unskip_effect(H.e)) : (H = gc(
        o,
        _ ? a : ws ?? (ws = we()),
        k,
        F,
        C,
        i,
        e,
        n
      ), _ || (H.e.f |= mt), o.set(F, H)), b.add(F);
    }
    if (d === 0 && s && !u && (_ ? u = ye(() => s(a)) : (u = ye(() => s(ws ?? (ws = we()))), u.f |= mt)), d > b.size && El(), L && d > 0 && ne(Tr()), !_)
      if (T) {
        for (const [lr, Nn] of o)
          b.has(lr) || S.skip_effect(Nn.e);
        S.oncommit(w), S.ondiscard(() => {
        });
      } else
        w();
    v && Le(!0), p(c);
  }), A = { effect: g, items: o, outrogroups: null, fallback: u };
  _ = !1, L && (a = I);
}
function Pn(t) {
  for (; t !== null && (t.f & He) === 0; )
    t = t.next;
  return t;
}
function _c(t, e, n, r, i) {
  var F;
  var s = e.length, a = t.items, o = Pn(t.effect.first), l, u = null, c = [], f = [], _, w, g, A;
  for (A = 0; A < s; A += 1) {
    if (_ = e[A], w = i(_, A), g = /** @type {EachItem} */
    a.get(w).e, t.outrogroups !== null)
      for (const H of t.outrogroups)
        H.pending.delete(g), H.done.delete(g);
    if ((g.f & mt) !== 0)
      if (g.f ^= mt, g === o)
        Hn(g, null, n);
      else {
        var d = u ? u.next : o;
        g === t.effect.last && (t.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), ct(t, u, g), ct(t, g, d), Hn(g, d, n), u = g, c = [], f = [], o = Pn(u.next);
        continue;
      }
    if ((g.f & de) !== 0 && qi(g), g !== o) {
      if (l !== void 0 && l.has(g)) {
        if (c.length < f.length) {
          var v = f[0], y;
          u = v.prev;
          var b = c[0], S = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Hn(c[y], v, n);
          for (y = 0; y < f.length; y += 1)
            l.delete(f[y]);
          ct(t, b.prev, S.next), ct(t, u, b), ct(t, S, v), o = v, u = S, A -= 1, c = [], f = [];
        } else
          l.delete(g), Hn(g, o, n), ct(t, g.prev, g.next), ct(t, g, u === null ? t.effect.first : u.next), ct(t, u, g), u = g;
        continue;
      }
      for (c = [], f = []; o !== null && o !== g; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), f.push(o), o = Pn(o.next);
      if (o === null)
        continue;
    }
    (g.f & mt) === 0 && c.push(g), u = g, o = Pn(g.next);
  }
  if (t.outrogroups !== null) {
    for (const H of t.outrogroups)
      H.pending.size === 0 && (Ei(Mr(H.done)), (F = t.outrogroups) == null || F.delete(H));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var T = [];
    if (l !== void 0)
      for (g of l)
        (g.f & de) === 0 && T.push(g);
    for (; o !== null; )
      (o.f & de) === 0 && o !== t.fallback && T.push(o), o = Pn(o.next);
    var C = T.length;
    if (C > 0) {
      var k = s === 0 ? n : null;
      pc(t, T, k);
    }
  }
}
function gc(t, e, n, r, i, s, a, o) {
  var l = (a & sl) !== 0 ? (a & ol) === 0 ? /* @__PURE__ */ xa(n, !1, !1) : Jt(n) : null, u = (a & al) !== 0 ? Jt(i) : null;
  return {
    v: l,
    i: u,
    e: ye(() => (s(e, l ?? n, u ?? i, o), () => {
      t.delete(r);
    }))
  };
}
function Hn(t, e, n) {
  if (t.nodes)
    for (var r = t.nodes.start, i = t.nodes.end, s = e && (e.f & mt) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; r !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ je(r)
      );
      if (s.before(r), r === i)
        return;
      r = a;
    }
}
function ct(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function mc(t, e, n = !1, r = !1, i = !1) {
  var s = t, a = "";
  Je(() => {
    var o = (
      /** @type {Effect} */
      P
    );
    if (a === (a = e() ?? "")) {
      L && wn();
      return;
    }
    if (o.nodes !== null && (Ha(
      o.nodes.start,
      /** @type {TemplateNode} */
      o.nodes.end
    ), o.nodes = null), a !== "") {
      if (L) {
        I.data;
        for (var l = wn(), u = l; l !== null && (l.nodeType !== Zt || /** @type {Comment} */
        l.data !== ""); )
          u = l, l = /* @__PURE__ */ je(l);
        if (l === null)
          throw rr(), Yt;
        Et(I, u), s = ne(l);
        return;
      }
      var c = a + "";
      n ? c = `<svg>${c}</svg>` : r && (c = `<math>${c}</math>`);
      var f = Xa(c);
      if ((n || r) && (f = /** @type {Element} */
      /* @__PURE__ */ Pe(f)), Et(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Pe(f),
        /** @type {TemplateNode} */
        f.lastChild
      ), n || r)
        for (; /* @__PURE__ */ Pe(f); )
          s.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Pe(f)
          );
      else
        s.before(f);
    }
  });
}
function to(t, e) {
  Da(() => {
    var n = t.getRootNode(), r = (
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
    if (!r.querySelector("#" + e.hash)) {
      const i = Pi("style");
      i.id = e.hash, i.textContent = e.code, r.appendChild(i);
    }
  });
}
function yc(t, e, n) {
  var r = t == null ? "" : "" + t;
  return e && (r = r ? r + " " + e : e), r === "" ? null : r;
}
function bc(t, e) {
  return t == null ? null : String(t);
}
function Se(t, e, n, r, i, s) {
  var a = t.__className;
  if (L || a !== n || a === void 0) {
    var o = yc(n, r);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return s;
}
function ht(t, e, n, r) {
  var i = t.__style;
  if (L || i !== e) {
    var s = bc(e);
    (!L || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t.__style = e;
  }
  return r;
}
const wc = Symbol("is custom element"), Ec = Symbol("is html"), $c = yl ? "link" : "LINK";
function no(t, e, n, r) {
  var i = Ac(t);
  L && (i[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === $c) || i[e] !== (i[e] = n) && (e === "loading" && (t[ml] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && ro(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function Es(t, e, n) {
  var r = R, i = P;
  let s = L;
  L && Le(!1), oe(null), $e(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    ($i.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? ro(t).includes(e) : n && typeof n == "object") ? t[e] = n : no(t, e, n == null ? n : String(n));
  } finally {
    oe(r), $e(i), s && Le(!0);
  }
}
function Ac(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [wc]: t.nodeName.includes("-"),
      [Ec]: t.namespaceURI === na
    })
  );
}
var $i = /* @__PURE__ */ new Map();
function ro(t) {
  var e = t.getAttribute("is") || t.nodeName, n = $i.get(e);
  if (n) return n;
  $i.set(e, n = []);
  for (var r, i = t, s = Element.prototype; s !== i; ) {
    r = dl(i);
    for (var a in r)
      r[a].set && n.push(a);
    i = ia(i);
  }
  return n;
}
function $s(t, e) {
  return t === e || (t == null ? void 0 : t[_r]) === e;
}
function pt(t = {}, e, n, r) {
  return Da(() => {
    var i, s;
    return Hi(() => {
      i = s, s = [], Ce(() => {
        t !== n(...s) && (e(t, ...s), i && $s(n(...i), t) && e(null, ...i));
      });
    }), () => {
      zt(() => {
        s && $s(n(...s), t) && e(null, ...s);
      });
    };
  }), t;
}
function Te(t, e, n, r) {
  var i = (
    /** @type {V} */
    r
  ), s = !0, a = () => (s && (s = !1, i = /** @type {V} */
  r), i), o;
  o = /** @type {V} */
  t[e], o === void 0 && r !== void 0 && (o = a());
  var l;
  l = () => {
    var _ = (
      /** @type {V} */
      t[e]
    );
    return _ === void 0 ? a() : (s = !0, _);
  };
  var u = !1, c = /* @__PURE__ */ qr(() => (u = !1, l())), f = (
    /** @type {Effect} */
    P
  );
  return (
    /** @type {() => V} */
    function(_, w) {
      if (arguments.length > 0) {
        const g = w ? p(c) : _;
        return O(c, g), u = !0, i !== void 0 && (i = g), _;
      }
      return Ot && u || (f.f & it) !== 0 ? c.v : p(c);
    }
  );
}
function Oc(t) {
  return new Sc(t);
}
var tt, ge;
class Sc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    N(this, tt);
    /** @type {Record<string, any>} */
    N(this, ge);
    var s;
    var n = /* @__PURE__ */ new Map(), r = (a, o) => {
      var l = /* @__PURE__ */ xa(o, !1, !1);
      return n.set(a, l), l;
    };
    const i = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return p(n.get(o) ?? r(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === gl ? !0 : (p(n.get(o) ?? r(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return O(n.get(o) ?? r(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    x(this, ge, (e.hydrate ? dc : Qa)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: i,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover
    })), (!((s = e == null ? void 0 : e.props) != null && s.$$host) || e.sync === !1) && me(), x(this, tt, i.$$events);
    for (const a of Object.keys(h(this, ge)))
      a === "$set" || a === "$destroy" || a === "$on" || xr(this, a, {
        get() {
          return h(this, ge)[a];
        },
        /** @param {any} value */
        set(o) {
          h(this, ge)[a] = o;
        },
        enumerable: !0
      });
    h(this, ge).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(i, a);
    }, h(this, ge).$destroy = () => {
      fc(h(this, ge));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    h(this, ge).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    h(this, tt)[e] = h(this, tt)[e] || [];
    const r = (...i) => n.call(this, ...i);
    return h(this, tt)[e].push(r), () => {
      h(this, tt)[e] = h(this, tt)[e].filter(
        /** @param {any} fn */
        (i) => i !== r
      );
    };
  }
  $destroy() {
    h(this, ge).$destroy();
  }
}
tt = new WeakMap(), ge = new WeakMap();
let io;
typeof HTMLElement == "function" && (io = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(e, n, r) {
    super();
    /** The Svelte component constructor */
    q(this, "$$ctor");
    /** Slots */
    q(this, "$$s");
    /** @type {any} The Svelte component instance */
    q(this, "$$c");
    /** Whether or not the custom element is connected */
    q(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    q(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    q(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    q(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    q(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    q(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    q(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    q(this, "$$shadowRoot", null);
    this.$$ctor = e, this.$$s = n, r && (this.$$shadowRoot = this.attachShadow(r));
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(e, n, r) {
    if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(n), this.$$c) {
      const i = this.$$c.$on(e, n);
      this.$$l_u.set(n, i);
    }
    super.addEventListener(e, n, r);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(e, n, r) {
    if (super.removeEventListener(e, n, r), this.$$c) {
      const i = this.$$l_u.get(n);
      i && (i(), this.$$l_u.delete(n));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let e = function(i) {
        return (s) => {
          const a = Pi("slot");
          i !== "default" && (a.name = i), ve(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = xc(this);
      for (const i of this.$$s)
        i in r && (i === "default" && !this.$$d.children ? (this.$$d.children = e(i), n.default = !0) : n[i] = e(i));
      for (const i of this.attributes) {
        const s = this.$$g_p(i.name);
        s in this.$$d || (this.$$d[s] = wr(s, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = Oc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = ec(() => {
        Hi(() => {
          var i;
          this.$$r = !0;
          for (const s of Sr(this.$$c)) {
            if (!((i = this.$$p_d[s]) != null && i.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const a = wr(
              s,
              this.$$d[s],
              this.$$p_d,
              "toAttribute"
            );
            a == null ? this.removeAttribute(this.$$p_d[s].attribute || s) : this.setAttribute(this.$$p_d[s].attribute || s, a);
          }
          this.$$r = !1;
        });
      });
      for (const i in this.$$l)
        for (const s of this.$$l[i]) {
          const a = this.$$c.$on(i, s);
          this.$$l_u.set(s, a);
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
  attributeChangedCallback(e, n, r) {
    var i;
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = wr(e, r, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [e]: this.$$d[e] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
    });
  }
  /**
   * @param {string} attribute_name
   */
  $$g_p(e) {
    return Sr(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
    ) || e;
  }
});
function wr(t, e, n, r) {
  var s;
  const i = (s = n[t]) == null ? void 0 : s.type;
  if (e = i === "Boolean" && typeof e != "boolean" ? e != null : e, !r || !n[t])
    return e;
  if (r === "toAttribute")
    switch (i) {
      case "Object":
      case "Array":
        return e == null ? null : JSON.stringify(e);
      case "Boolean":
        return e ? "" : null;
      case "Number":
        return e ?? null;
      default:
        return e;
    }
  else
    switch (i) {
      case "Object":
      case "Array":
        return e && JSON.parse(e);
      case "Boolean":
        return e;
      // conversion already handled above
      case "Number":
        return e != null ? +e : e;
      default:
        return e;
    }
}
function xc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function so(t, e, n, r, i, s) {
  let a = class extends io {
    constructor() {
      super(t, n, i), this.$$p_d = e;
    }
    static get observedAttributes() {
      return Sr(e).map(
        (o) => (e[o].attribute || o).toLowerCase()
      );
    }
  };
  return Sr(e).forEach((o) => {
    xr(a.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var f;
        l = wr(o, l, e), this.$$d[o] = l;
        var u = this.$$c;
        if (u) {
          var c = (f = un(u, o)) == null ? void 0 : f.get;
          c ? u[o] = l : u.$set({ [o]: l });
        }
      }
    });
  }), r.forEach((o) => {
    xr(a.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), s && (a = s(a)), t.element = /** @type {any} */
  a, a;
}
class Gi extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, Gi), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const Tc = (t, e) => {
  const n = new Promise((r, i) => {
    setTimeout(() => {
      i(new Gi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, ao = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return Tc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => ao(t));
};
var Nc = /* @__PURE__ */ ot('<span class="loading svelte-lv9s7p">Loading...</span>'), Cc = /* @__PURE__ */ ot("<div><!></div>");
const Rc = {
  hash: "svelte-lv9s7p",
  code: `.loading.svelte-lv9s7p {padding:1em;display:block;}.animation.svelte-lv9s7p {hui-card {display:flex;flex-direction:column;}}.outer-container.animation.svelte-lv9s7p {transition:margin-bottom 0.35s ease;}.outer-container.animation.open.svelte-lv9s7p,
  .outer-container.animation.opening.svelte-lv9s7p {margin-bottom:inherit;}.outer-container.animation.close.svelte-lv9s7p,
  .outer-container.animation.closing.svelte-lv9s7p {margin-bottom:var(--expander-animation-height, -100%);}.outer-container.animation.opening.svelte-lv9s7p {
    animation: svelte-lv9s7p-fadeInOpacity 0.5s forwards ease;
    -webkit-animation: svelte-lv9s7p-fadeInOpacity 0.5s forwards ease;}.outer-container.animation.closing.svelte-lv9s7p {
      animation: svelte-lv9s7p-fadeOutOpacity 0.5s forwards ease;
      -webkit-animation: svelte-lv9s7p-fadeOutOpacity 0.5s forwards ease;}.outer-container.svelte-lv9s7p > hui-card {margin-top:var(--child-card-margin-top, 0px);}
  @keyframes svelte-lv9s7p-fadeInOpacity {
      0% {
          opacity: 0;
      }
      100% {
          opacity: 1;
      }
  }
  @-webkit-keyframes svelte-lv9s7p-fadeInOpacity {
      0% {
          opacity: 0;
      }
      100% {
          opacity: 1;
      }
  }
    @keyframes svelte-lv9s7p-fadeOutOpacity {
      0% {
          opacity: 1;
      }
      100% {
          opacity: 0;
      }
  }
  @-webkit-keyframes svelte-lv9s7p-fadeOutOpacity {
      0% {
          opacity: 1;
      }
      100% {
          opacity: 0;
      }
  }`
};
function Ai(t, e) {
  Ri(e, !0), to(t, Rc);
  const n = Te(e, "config"), r = Te(e, "hass"), i = Te(e, "preview"), s = Te(e, "marginTop", 7, "0px"), a = Te(e, "open"), o = Te(e, "animation", 7, !0), l = Te(e, "animationState"), u = Te(e, "clearCardCss", 7, !1);
  let c = null, f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(!0), w = /* @__PURE__ */ M(0);
  const g = Ce(() => JSON.parse(JSON.stringify(n())));
  dn(() => {
    p(f) && (p(f).hass = r());
  }), dn(() => {
    p(f) && i() !== void 0 && (p(f).preview = i());
  }), dn(() => {
    var b;
    p(f) && (g.disabled = !a(), (b = p(f)._element) == null || b.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), eo(async () => {
    const b = document.createElement("hui-card");
    b.hass = r(), b.preview = i(), g.disabled = !a(), b.config = g, b.load(), c == null || c.appendChild(b), O(f, b, !0), O(_, !1), p(f).addEventListener(
      "ll-upgrade",
      (S) => {
        var T;
        S.stopPropagation(), (T = p(f)) != null && T._element && r() && (p(f)._element.hass = r());
      },
      { capture: !0 }
    ), u() && (b.style.setProperty("--ha-card-background", "transparent"), b.style.setProperty("--ha-card-box-shadow", "none"), b.style.setProperty("--ha-card-border-color", "transparent"), b.style.setProperty("--ha-card-border-width", "0px"), b.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (O(w, await ao(b) * 56), c && O(w, p(w) + (window.getComputedStyle(c).marginTop ? parseFloat(window.getComputedStyle(c).marginTop) : 0)), new ResizeObserver((T) => {
      for (const C of T)
        if (C.contentBoxSize) {
          const k = Array.isArray(C.contentBoxSize) ? C.contentBoxSize[0] : C.contentBoxSize;
          k.blockSize && (O(w, k.blockSize, !0), p(f) && O(w, p(w) + (window.getComputedStyle(p(f)).marginTop ? parseFloat(window.getComputedStyle(p(f)).marginTop) : 0)));
        } else C.contentRect && (O(w, C.contentRect.height, !0), p(f) && O(w, p(w) + (window.getComputedStyle(p(f)).marginTop ? parseFloat(window.getComputedStyle(p(f)).marginTop) : 0)));
    }).observe(b));
  });
  var A = {
    get config() {
      return n();
    },
    set config(b) {
      n(b), me();
    },
    get hass() {
      return r();
    },
    set hass(b) {
      r(b), me();
    },
    get preview() {
      return i();
    },
    set preview(b) {
      i(b), me();
    },
    get marginTop() {
      return s();
    },
    set marginTop(b = "0px") {
      s(b), me();
    },
    get open() {
      return a();
    },
    set open(b) {
      a(b), me();
    },
    get animation() {
      return o();
    },
    set animation(b = !0) {
      o(b), me();
    },
    get animationState() {
      return l();
    },
    set animationState(b) {
      l(b), me();
    },
    get clearCardCss() {
      return u();
    },
    set clearCardCss(b = !1) {
      u(b), me();
    }
  }, d = Cc(), v = dt(d);
  {
    var y = (b) => {
      var S = Nc();
      ve(b, S);
    };
    ft(v, (b) => {
      p(_) && b(y);
    });
  }
  return Ye(d), pt(d, (b) => c = b, () => c), Je(() => {
    Se(d, 1, `outer-container${a() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), ht(d, `--child-card-margin-top: ${(a() ? s() : "0px") ?? ""};${p(w) ? ` --expander-animation-height: -${p(w)}px;` : ""}`);
  }), ve(t, d), Ii(A);
}
customElements.define("expander-sub-card", so(
  Ai,
  {
    config: {},
    hass: {},
    preview: {},
    marginTop: {},
    open: {},
    animation: {},
    animationState: {},
    clearCardCss: {}
  },
  [],
  [],
  { mode: "open" }
));
const Ic = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var sr = function(t, e, n) {
  var r;
  n === void 0 && (n = {});
  var i = n.retries, s = i === void 0 ? 10 : i, a = n.delay, o = a === void 0 ? 10 : a, l = n.shouldReject, u = l === void 0 || l, c = (r = n.rejectMessage) !== null && r !== void 0 ? r : "Could not get the result after {{ retries }} retries";
  return new Promise(function(f, _) {
    var w = 0, g = function() {
      var A = t();
      e(A) ? f(A) : ++w < s ? setTimeout(g, o) : u ? _(new Error(c.replace(/\{\{\s*retries\s*\}\}/g, "".concat(s)))) : f(A);
    };
    g();
  });
}, Nr = function() {
  return Nr = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, Nr.apply(this, arguments);
};
function Xr(t, e, n) {
  if (arguments.length === 2) for (var r, i = 0, s = e.length; i < s; i++) !r && i in e || (r || (r = Array.prototype.slice.call(e, 0, i)), r[i] = e[i]);
  return t.concat(r || Array.prototype.slice.call(e));
}
var Cr, cn, Re, vt, Qr = "[home-assistant-javascript-templates]", Lc = /^([a-z_]+)\.(\w+)$/;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Cr || (Cr = {})), function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
}(cn || (cn = {})), function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
}(Re || (Re = {})), function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
}(vt || (vt = {}));
var As = function(t) {
  return t.reduce(function(e, n) {
    var r = n[0], i = n[1];
    return e[r.replace(Lc, "$2")] = i, e;
  }, {});
}, ut = function(t) {
  return t.includes(".");
}, Er = "ref", It = "value", Os = "toJSON", Ss = function(t) {
  return "".concat(Er, ".").concat(t);
};
function kc(t, e, n) {
  var r = function() {
    return Object.entries(t.hass.areas);
  }, i = function() {
    return Object.entries(t.hass.devices);
  }, s = function() {
    return Object.entries(t.hass.entities);
  }, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), l = function(d, v) {
    n && console.warn("".concat(d, " ").concat(v, " used in a JavaScript template doesn't exist"));
  }, u = function(d) {
    return l("Entity", d);
  }, c = function(d) {
    return l("Domain", d);
  }, f = function(d) {
    var v = new SyntaxError(d);
    if (e) throw v;
    n && console.warn(v);
  }, _ = function(d) {
    t.hass.states[d] ? a.add(d) : u(d);
  }, w = function(d) {
    a.add(d);
  }, g = function(d, v) {
    var y = v.with_unit, b = y !== void 0 && y, S = v.rounded, T = S !== void 0 && S;
    if (d) {
      var C = d.state, k = d.attributes.unit_of_measurement, F = Number(T), H = T === !1 || isNaN(Number(C)) ? C : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: F, maximumFractionDigits: F }).format(Number(C));
      return b && k ? "".concat(H, " ").concat(k) : H;
    }
  }, A = function(d) {
    return new Proxy(d, { get: function(v, y) {
      return y === "state_with_unit" ? g(v, { rounded: !0, with_unit: !0 }) : v[y];
    } });
  };
  return { get hass() {
    return t.hass;
  }, states: new Proxy(function(d, v) {
    if (v === void 0 && (v = {}), ut(d)) return _(d), g(t.hass.states[d], v);
    throw SyntaxError("".concat(Qr, ": states method cannot be used with a domain, use it as an object instead."));
  }, { get: function(d, v) {
    if (ut(v)) return _(v), A(t.hass.states[v]);
    var y = Object.entries(t.hass.states).filter(function(b) {
      return b[0].startsWith(v);
    });
    return y.length || c(v), new Proxy(As(y), { get: function(b, S) {
      return _("".concat(v, ".").concat(S)), A(b[S]);
    } });
  } }), state_translated: function(d) {
    if (_(d), t.hass.states[d]) return t.hass.formatEntityState(t.hass.states[d]);
  }, is_state: function(d, v) {
    var y;
    return _(d), Array.isArray(v) ? v.some(function(b) {
      var S;
      return ((S = t.hass.states[d]) === null || S === void 0 ? void 0 : S.state) === b;
    }) : ((y = t.hass.states[d]) === null || y === void 0 ? void 0 : y.state) === v;
  }, state_attr: function(d, v) {
    var y, b;
    return _(d), (b = (y = t.hass.states[d]) === null || y === void 0 ? void 0 : y.attributes) === null || b === void 0 ? void 0 : b[v];
  }, is_state_attr: function(d, v, y) {
    return this.state_attr(d, v) === y;
  }, has_value: function(d) {
    return this.states(d) ? !(this.is_state(d, Cr.UNKNOWN) || this.is_state(d, Cr.UNAVAILABLE)) : (u(d), !1);
  }, entities: new Proxy(function(d) {
    if (d === void 0) return t.hass.entities;
    if (ut(d)) return _(d), t.hass.entities[d];
    var v = s().filter(function(y) {
      return y[0].startsWith(d);
    });
    return v.length || c(d), new Proxy(As(v), { get: function(y, b) {
      return _("".concat(d, ".").concat(b)), y[b];
    } });
  }, { get: function(d, v) {
    return d(v);
  } }), entity_prop: function(d, v) {
    var y;
    return _(d), (y = t.hass.entities[d]) === null || y === void 0 ? void 0 : y[v];
  }, is_entity_prop: function(d, v, y) {
    return this.entity_prop(d, v) === y;
  }, devices: new Proxy(function(d) {
    if (d === void 0) return t.hass.devices;
    if (ut(d)) throw SyntaxError("".concat(Qr, ": devices method cannot be used with an entity id, you should use a device id instead."));
    return t.hass.devices[d];
  }, { get: function(d, v) {
    if (ut(v)) throw SyntaxError("".concat(Qr, ": devices cannot be accesed using an entity id, you should use a device id instead."));
    return t.hass.devices[v];
  } }), device_attr: function(d, v) {
    var y, b, S;
    if (ut(d)) {
      _(d);
      var T = (y = t.hass.entities[d]) === null || y === void 0 ? void 0 : y.device_id;
      return (b = t.hass.devices[T]) === null || b === void 0 ? void 0 : b[v];
    }
    return (S = t.hass.devices[d]) === null || S === void 0 ? void 0 : S[v];
  }, is_device_attr: function(d, v, y) {
    return this.device_attr(d, v) === y;
  }, device_id: function(d) {
    var v;
    if (ut(d)) return _(d), (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    var y = i().find(function(b) {
      return b[1].name === d;
    });
    return y == null ? void 0 : y[0];
  }, device_name: function(d) {
    var v, y, b;
    if (ut(d)) {
      _(d);
      var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
      return (y = t.hass.devices[S]) === null || y === void 0 ? void 0 : y.name;
    }
    return (b = t.hass.devices[d]) === null || b === void 0 ? void 0 : b.name;
  }, areas: function() {
    return r().map(function(d) {
      return d[1].area_id;
    });
  }, area_id: function(d) {
    var v, y;
    if (d in t.hass.devices) return this.device_attr(d, cn.AREA_ID);
    var b = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    if (b) return this.device_attr(b, cn.AREA_ID);
    var S = r().find(function(T) {
      return T[1].name === d;
    });
    return (y = S == null ? void 0 : S[1]) === null || y === void 0 ? void 0 : y.area_id;
  }, area_name: function(d) {
    var v, y, b;
    d in t.hass.devices && (b = this.device_attr(d, cn.AREA_ID));
    var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    S && (b = this.device_attr(S, cn.AREA_ID));
    var T = r().find(function(C) {
      var k = C[1];
      return k.area_id === d || k.area_id === b;
    });
    return (y = T == null ? void 0 : T[1]) === null || y === void 0 ? void 0 : y.name;
  }, area_entities: function(d) {
    var v = r().find(function(y) {
      var b = y[1];
      return b.area_id === d || b.name === d;
    });
    return v ? s().filter(function(y) {
      return y[1].area_id === v[1].area_id;
    }).map(function(y) {
      return y[0];
    }) : [];
  }, area_devices: function(d) {
    var v = r().find(function(y) {
      var b = y[1];
      return b.area_id === d || b.name === d;
    });
    return v ? i().filter(function(y) {
      return y[1].area_id === v[1].area_id;
    }).map(function(y) {
      return y[1].id;
    }) : [];
  }, get user_name() {
    return t.hass.user.name;
  }, get user_is_admin() {
    return t.hass.user.is_admin;
  }, get user_is_owner() {
    return t.hass.user.is_owner;
  }, get user_agent() {
    return window.navigator.userAgent;
  }, get tracked() {
    return a;
  }, cleanTracked: function() {
    a.clear();
  }, ref: function(d, v, y) {
    var b;
    y === void 0 && (y = void 0);
    var S = Ss(v);
    if (o.has(v)) return o.get(v);
    var T = new Proxy(((b = {})[It] = y, b[Os] = function() {
      return this[It];
    }, b), { get: function(C, k, F) {
      if (k === It || k === Os) return w(S), Reflect.get(C, k, F);
      f("".concat(k, " is not a valid ").concat(Er, " property. A ").concat(Er, ' only exposes a "').concat(It, '" property'));
    }, set: function(C, k, F) {
      if (k === It) {
        var H = C[It];
        return C[It] = F, d({ event_type: vt.STATE_CHANGE_EVENT, data: { entity_id: S, old_state: { state: JSON.stringify(H) }, new_state: { state: JSON.stringify(F) } } }), !0;
      }
      return f('property "'.concat(k, '" cannot be set in a ').concat(Er)), !1;
    } });
    return o.set(v, T), T;
  }, unref: function(d, v) {
    var y = Ss(v);
    o.has(v) ? (o.delete(v), d(y)) : f("".concat(v, " is not a ref or it has been unrefed already"));
  }, refs: function(d, v, y) {
    y === void 0 && (y = {});
    var b = this.ref, S = this.unref, T = new Proxy(y, { get: function(C, k) {
      return b(d, k).value;
    }, set: function(C, k, F) {
      return b(d, k).value = F, !0;
    } });
    return Object.entries(y).forEach(function(C) {
      var k = C[0], F = C[1];
      o.has(k) && S(v, k), b(d, k, F);
    }), T;
  }, cleanRefs: function(d) {
    var v = this;
    Array.from(o.keys()).forEach(function(y) {
      v.unref(d, y);
    });
  }, clientSideProxy: new Proxy({}, { get: function(d, v) {
    switch (Object.values(Re).includes(v) && w(v), v) {
      case Re.PANEL_URL:
        return location.pathname;
      case Re.LANG:
        return t.hass.language;
    }
    n && console.warn("clientSideProxy should only be used to access these variables: ".concat(Object.values(Re).join(", ")));
  } }) };
}
var Pc = function() {
  function t(e, n) {
    var r = n.throwErrors, i = r !== void 0 && r, s = n.throwWarnings, a = s === void 0 || s, o = n.variables, l = o === void 0 ? {} : o, u = n.refs, c = u === void 0 ? {} : u, f = n.refsVariableName, _ = f === void 0 ? "refs" : f, w = n.autoReturn, g = w === void 0 || w;
    this._throwErrors = i, this._throwWarnings = a, this._variables = l, this._refsVariableName = _, this._autoReturn = g, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp("(^|[ \\?(+:\\{\\[><,])(".concat(Object.values(Re).join("|"), ")($|[ \\?)+:\\}\\]><.,])"), "gm"), this._scopped = kc(e, i, a), this.refs = c, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
  }
  return t.prototype._executeRenderingFunctions = function(e) {
    var n = this;
    this._subscriptions.get(e).forEach(function(r, i) {
      r.forEach(function(s, a) {
        n.trackTemplate(i, a, s);
      });
    });
  }, t.prototype._watchForPanelUrlChange = function() {
    var e = this;
    window.addEventListener(vt.LOCATION_CHANGED, function() {
      e._panelUrlWatchCallback();
    }), window.addEventListener(vt.POPSTATE, function() {
      e._panelUrlWatchCallback();
    });
  }, t.prototype._panelUrlWatchCallback = function() {
    this._subscriptions.has(Re.PANEL_URL) && this._executeRenderingFunctions(Re.PANEL_URL);
  }, t.prototype._watchForEntitiesChange = function() {
    var e = this;
    window.hassConnection.then(function(n) {
      n.conn.subscribeMessage(function(r) {
        return e._entityWatchCallback(r);
      }, { type: vt.SUBSCRIBE_EVENTS, event_type: vt.STATE_CHANGE_EVENT });
    });
  }, t.prototype._watchForLanguageChange = function() {
    var e = this;
    window.addEventListener(vt.TRANSLATIONS_UPDATED, function() {
      e._subscriptions.has(Re.LANG) && e._executeRenderingFunctions(Re.LANG);
    });
  }, t.prototype._entityWatchCallback = function(e) {
    if (this._subscriptions.size) {
      var n = e.data.entity_id;
      this._subscriptions.has(n) && this._executeRenderingFunctions(n);
    }
  }, t.prototype._storeTracked = function(e, n, r) {
    var i = this;
    this._scopped.tracked.forEach(function(s) {
      var a = [n, r];
      if (i._subscriptions.has(s)) {
        var o = i._subscriptions.get(s);
        if (o.has(e)) {
          var l = o.get(e);
          l.has(n) || l.set.apply(l, a);
        } else o.set(e, new Map([a]));
      } else i._subscriptions.set(s, /* @__PURE__ */ new Map([[e, new Map([a])]]));
    });
  }, t.prototype._untrackTemplate = function(e, n) {
    var r = this;
    this._subscriptions.forEach(function(i, s) {
      if (i.has(e)) {
        var a = i.get(e);
        a.delete(n), a.size === 0 && (i.delete(e), i.size === 0 && r._subscriptions.delete(s));
      }
    });
  }, t.prototype.renderTemplate = function(e, n) {
    n === void 0 && (n = {});
    try {
      var r = n.variables, i = r === void 0 ? {} : r, s = n.refs, a = s === void 0 ? {} : s, o = new Map(Object.entries(Nr(Nr({}, this._variables), i))), l = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), u = l.includes("return") || !this._autoReturn ? l : "return ".concat(l);
      return new (Function.bind.apply(Function, Xr(Xr([void 0, "hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName], Array.from(o.keys()), !1), ["".concat('"use strict";', " ").concat(u)], !1)))().apply(void 0, Xr([this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), a)], Array.from(o.values()), !1));
    } catch (c) {
      if (this._throwErrors) throw c;
      return void (this._throwWarnings && console.warn(c));
    }
  }, t.prototype.trackTemplate = function(e, n, r) {
    var i = this;
    r === void 0 && (r = {}), this._scopped.cleanTracked();
    var s = this.renderTemplate(e, r);
    return this._storeTracked(e, n, r), n(s), function() {
      return i._untrackTemplate(e, n);
    };
  }, t.prototype.cleanTracked = function(e) {
    e ? this._subscriptions.has(e) && this._subscriptions.delete(e) : this._subscriptions.clear();
  }, Object.defineProperty(t.prototype, "variables", { get: function() {
    return this._variables;
  }, set: function(e) {
    this._variables = e;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "refs", { get: function() {
    return this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this));
  }, set: function(e) {
    this._scopped.cleanRefs(this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), e);
  }, enumerable: !1, configurable: !0 }), t;
}(), Dc = function() {
  function t(e, n) {
    n === void 0 && (n = {}), this._renderer = sr(function() {
      return e.hass;
    }, function(r) {
      return !!(r && r.areas && r.devices && r.entities && r.states && r.user);
    }, { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(function() {
      return new Pc(e, n);
    });
  }
  return t.prototype.getRenderer = function() {
    return this._renderer;
  }, t;
}();
function Mc(t = {}, e = {}) {
  return new Dc(
    document.querySelector("home-assistant"),
    {
      autoReturn: !1,
      variables: t,
      refs: e,
      refsVariableName: "variables"
    }
  ).getRenderer();
}
function $r(t) {
  return !t || typeof t != "string" ? !1 : String(t).trim().startsWith("[[[") && String(t).trim().endsWith("]]]");
}
function xs(t, e, n, r = {}) {
  if (!$r(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((i) => i.trackTemplate(n, e, { variables: r }));
}
function Ts(t, e, n) {
  t.then((r) => {
    r.refs[e] = n;
  });
}
function Hc(t, e) {
  t.then((n) => {
    const r = e.detail;
    Object.keys(r).forEach((i) => {
      const s = r[i].property, a = r[i].value, o = `${i}_${s}`;
      n.refs[o] = a;
    });
  });
}
function jc(t, e) {
  const n = Hc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Rr = function() {
  return Rr = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, Rr.apply(this, arguments);
};
function en(t, e, n, r) {
  return new (n || (n = Promise))(function(i, s) {
    function a(u) {
      try {
        l(r.next(u));
      } catch (c) {
        s(c);
      }
    }
    function o(u) {
      try {
        l(r.throw(u));
      } catch (c) {
        s(c);
      }
    }
    function l(u) {
      var c;
      u.done ? i(u.value) : (c = u.value, c instanceof n ? c : new n(function(f) {
        f(c);
      })).then(a, o);
    }
    l((r = r.apply(t, [])).next());
  });
}
function tn(t, e) {
  var n, r, i, s = { label: 0, sent: function() {
    if (1 & i[0]) throw i[1];
    return i[1];
  }, trys: [], ops: [] }, a = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return a.next = o(0), a.throw = o(1), a.return = o(2), typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function o(l) {
    return function(u) {
      return function(c) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; a && (a = 0, c[0] && (s = 0)), s; ) try {
          if (n = 1, r && (i = 2 & c[0] ? r.return : c[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, c[1])).done) return i;
          switch (r = 0, i && (c = [2 & c[0], i.value]), c[0]) {
            case 0:
            case 1:
              i = c;
              break;
            case 4:
              return s.label++, { value: c[1], done: !1 };
            case 5:
              s.label++, r = c[1], c = [0];
              continue;
            case 7:
              c = s.ops.pop(), s.trys.pop();
              continue;
            default:
              if (i = s.trys, !((i = i.length > 0 && i[i.length - 1]) || c[0] !== 6 && c[0] !== 2)) {
                s = 0;
                continue;
              }
              if (c[0] === 3 && (!i || c[1] > i[0] && c[1] < i[3])) {
                s.label = c[1];
                break;
              }
              if (c[0] === 6 && s.label < i[1]) {
                s.label = i[1], i = c;
                break;
              }
              if (i && s.label < i[2]) {
                s.label = i[2], s.ops.push(c);
                break;
              }
              i[2] && s.ops.pop(), s.trys.pop();
              continue;
          }
          c = e.call(t, s);
        } catch (f) {
          c = [6, f], r = 0;
        } finally {
          n = i = 0;
        }
        if (5 & c[0]) throw c[1];
        return { value: c[0] ? c[1] : void 0, done: !0 };
      }([l, u]);
    };
  }
}
var Kt = "$", oo = ":host", Ui = "invalid selector", St = 10, xt = 10, zi = function(t) {
  var e, n = t[0], r = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof r == "string";
};
function Bi(t, e) {
  return function(n) {
    return n.split(",").map(function(r) {
      return r.trim();
    });
  }(t).map(function(n) {
    var r = function(i) {
      return i.split(Kt).map(function(s) {
        return s.trim();
      });
    }(n);
    return e(r);
  });
}
function lo(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(Kt, ").").concat(n);
}
function an(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function co() {
  return "You can not select a shadowRoot (".concat(Kt, ") of the document.");
}
function uo() {
  return "You can not select a shadowRoot (".concat(Kt, ") of a shadowRoot.");
}
function Vi(t, e) {
  for (var n, r, i = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) i = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(co());
      if (e instanceof ShadowRoot) throw new SyntaxError(uo());
      i = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else i = ((r = i.shadowRoot) === null || r === void 0 ? void 0 : r.querySelector("".concat(oo, " ").concat(t[a]))) || null;
    if (i === null) return null;
  }
  return i;
}
function Fc(t, e) {
  var n, r = function(a, o, l) {
    for (var u, c = 0, f = o.length; c < f; c++) !u && c in o || (u || (u = Array.prototype.slice.call(o, 0, c)), u[c] = o[c]);
    return a.concat(u || Array.prototype.slice.call(o));
  }([], t), i = r.pop();
  if (!r.length) return e.querySelectorAll(i);
  var s = Vi(r, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(oo, " ").concat(i))) || null;
}
function qc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(co());
    if (e instanceof ShadowRoot) throw new SyntaxError(uo());
    return e.shadowRoot;
  }
  var n = Vi(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function Gc(t, e, n, r) {
  for (var i = Bi(t, function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(lo(n, r));
    return l;
  }), s = i.length, a = 0; a < s; a++) {
    var o = Vi(i[a], e);
    if (o) return o;
  }
  return null;
}
function Uc(t, e, n) {
  for (var r = Bi(t, function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(lo(n));
    return o;
  }), i = r.length, s = 0; s < i; s++) {
    var a = Fc(r[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(Ui);
}
function zc(t, e, n, r) {
  for (var i = Bi(t, function(l) {
    if (l.pop().length) throw new SyntaxError(function(u, c) {
      return "".concat(u, " must be used with a selector ending in a shadowRoot (").concat(Kt, "). If you don't want to select a shadowRoot, use ").concat(c, " instead.");
    }(n, r));
    return l;
  }), s = i.length, a = 0; a < s; a++) {
    var o = qc(i[a], e);
    if (o) return o;
  }
  return null;
}
function Ns(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, sr(function() {
        return Gc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function Cs(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, sr(function() {
        return Uc(t, e, "asyncQuerySelectorAll");
      }, function(s) {
        return !!s.length;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function Rs(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, sr(function() {
        return zc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
var Oi = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var r = Oi(t.shadowRoot, e);
    if (r.length) return r;
  }
  for (var i = 0, s = Array.from(t.querySelectorAll("*")); i < s.length; i++) {
    var a = s[i], o = Oi(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(Ui);
}, Is = function(t, e, n, r) {
  return sr(function() {
    return Oi(t, e);
  }, function(i) {
    return !!i.length;
  }, { retries: n, delay: r, shouldReject: !1 });
};
function Ls() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return zi(t) ? (n = t[0], r = t[1], i = t[2], [4, Ns(r, n, (i == null ? void 0 : i.retries) || St, (i == null ? void 0 : i.delay) || xt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, Ns(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
function ks() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return zi(t) ? (n = t[0], r = t[1], i = t[2], [4, Cs(r, n, (i == null ? void 0 : i.retries) || St, (i == null ? void 0 : i.delay) || xt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Cs(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
function Ps() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return zi(t) ? (n = t[0], r = t[1], i = t[2], [4, Rs(r, n, (i == null ? void 0 : i.retries) || St, (i == null ? void 0 : i.delay) || xt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Rs(s, document, (a == null ? void 0 : a.retries) || St, (a == null ? void 0 : a.delay) || xt)];
      }
    });
  });
}
var Bc = function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Rr({ retries: St, delay: xt }, n || {})) : (this._element = document, this._asyncParams = Rr({ retries: St, delay: xt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return an(this._element).then(function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(an(this._element).then(function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Ps(n[0], Kt, e._asyncParams) : Ps(n, Kt, e._asyncParams);
    }), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return an(this._element).then(function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(Ui);
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return en(this, void 0, void 0, function() {
      return tn(this, function(n) {
        return [2, an(this._element).then(function(r) {
          return r instanceof NodeList && r[e] || null;
        })];
      });
    });
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(an(this._element).then(function(r) {
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? ks(r[0], e, n._asyncParams) : ks(r, e, n._asyncParams);
    }), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(an(this._element).then(function(r) {
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? Promise.race(Array.from(r).map(function(i) {
        return Is(i, e, n._asyncParams.retries, n._asyncParams.delay);
      })) : Is(r, e, n._asyncParams.retries, n._asyncParams.delay);
    }), this._asyncParams);
  }, t;
}(), Si = function(t, e) {
  return Si = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Si(t, e);
}, rt = function() {
  return rt = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, rt.apply(this, arguments);
};
var Ie, yt, B, Ke, Ds, Zr, ei, fr, Ms, ti, hr, ni, ri, ii, Dn, j, $t = "$", Vc = { retries: 100, delay: 50, eventThreshold: 450 };
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(Ie || (Ie = {})), function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
}(yt || (yt = {})), function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
}(B || (B = {})), function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
}(Ke || (Ke = {})), function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
}(j || (j = {}));
var Wc = ((Ds = {})[Ie.HOME_ASSISTANT] = { selector: j.HOME_ASSISTANT, children: { shadowRoot: { selector: $t, children: (Zr = {}, Zr[Ie.HOME_ASSISTANT_MAIN] = { selector: j.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: $t, children: (ei = {}, ei[Ie.HA_DRAWER] = { selector: j.HA_DRAWER, children: (fr = {}, fr[Ie.HA_SIDEBAR] = { selector: j.HA_SIDEBAR, children: { shadowRoot: { selector: $t } } }, fr[Ie.PARTIAL_PANEL_RESOLVER] = { selector: j.PARTIAL_PANEL_RESOLVER }, fr) }, ei) } } }, Zr) } } }, Ds), Yc = ((Ms = {})[yt.HA_PANEL_LOVELACE] = { selector: j.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: $t, children: (ti = {}, ti[yt.HUI_ROOT] = { selector: j.HUI_ROOT, children: { shadowRoot: { selector: $t, children: (hr = {}, hr[yt.HEADER] = { selector: j.HEADER }, hr[yt.HUI_VIEW] = { selector: j.HUI_VIEW }, hr) } } }, ti) } } }, Ms), Jc = { shadowRoot: { selector: $t, children: (ni = {}, ni[B.HA_MORE_INFO_DIALOG] = { selector: j.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: $t, children: (ri = {}, ri[B.HA_DIALOG] = { selector: j.HA_DIALOG, children: (ii = {}, ii[B.HA_DIALOG_CONTENT] = { selector: j.HA_DIALOG_CONTENT, children: (Dn = {}, Dn[B.HA_MORE_INFO_DIALOG_INFO] = { selector: j.HA_MORE_INFO_DIALOG_INFO }, Dn[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = { selector: j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, Dn[B.HA_DIALOG_MORE_INFO_SETTINGS] = { selector: j.HA_DIALOG_MORE_INFO_SETTINGS }, Dn) }, ii) }, ri) } } }, ni) } }, Gn = function(t, e, n, r) {
  return n === void 0 && (n = null), r === void 0 && (r = !1), Object.entries(e || {}).reduce(function(i, s) {
    var a = s[0], o = s[1];
    if (o.selector === $t && n) return o.children ? rt(rt({}, i), Gn(t, o.children, n, !0)) : i;
    var l = n ? n.then(function(u) {
      return u ? Ls(u, (c = o.selector, r ? "$ " + c : c), t) : null;
      var c;
    }) : Ls(o.selector, t);
    return i[a] = { element: l, children: Gn(t, o.children, l), selector: new Bc(l, t) }, i;
  }, {});
}, fo = function(t, e) {
  for (var n = 0, r = Object.entries(e); n < r.length; n++) {
    var i = r[n];
    if (i[0] === t) return i[1];
    var s = fo(t, i[1].children);
    if (s) return s;
  }
}, si = function(t, e) {
  return Object.keys(t).reduce(function(n, r) {
    var i = fo(r, e);
    i.children;
    var s = function(a, o) {
      var l = {};
      for (var u in a) Object.prototype.hasOwnProperty.call(a, u) && o.indexOf(u) < 0 && (l[u] = a[u]);
      if (a != null && typeof Object.getOwnPropertySymbols == "function") {
        var c = 0;
        for (u = Object.getOwnPropertySymbols(a); c < u.length; c++) o.indexOf(u[c]) < 0 && Object.prototype.propertyIsEnumerable.call(a, u[c]) && (l[u[c]] = a[u[c]]);
      }
      return l;
    }(i, ["children"]);
    return n[r] = rt({}, s), n;
  }, {});
}, Kc = function() {
  function t() {
    this.delegate = document.createDocumentFragment();
  }
  return t.prototype.addEventListener = function() {
    for (var e, n = [], r = 0; r < arguments.length; r++) n[r] = arguments[r];
    (e = this.delegate).addEventListener.apply(e, n);
  }, t.prototype.dispatchEvent = function() {
    for (var e, n = [], r = 0; r < arguments.length; r++) n[r] = arguments[r];
    return (e = this.delegate).dispatchEvent.apply(e, n);
  }, t.prototype.removeEventListener = function() {
    for (var e, n = [], r = 0; r < arguments.length; r++) n[r] = arguments[r];
    return (e = this.delegate).removeEventListener.apply(e, n);
  }, t;
}(), Xc = function(t) {
  function e(n) {
    n === void 0 && (n = {});
    var r = t.call(this) || this;
    return r._config = rt(rt({}, Vc), n), r._timestaps = {}, r;
  }
  return function(n, r) {
    if (typeof r != "function" && r !== null) throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    function i() {
      this.constructor = n;
    }
    Si(n, r), n.prototype = r === null ? Object.create(r) : (i.prototype = r.prototype, new i());
  }(e, t), e.prototype._dispatchEvent = function(n, r) {
    var i = Date.now();
    i - this._timestaps[n] < this._config.eventThreshold || (this._timestaps[n] = i, this.dispatchEvent(new CustomEvent(n, { detail: r })));
  }, e.prototype._updateDialogElements = function(n) {
    var r, i = this;
    n === void 0 && (n = B.HA_MORE_INFO_DIALOG_INFO), this._dialogTree = Gn(this._config, Jc, this._haRootElements.HOME_ASSISTANT.element);
    var s = si(B, this._dialogTree);
    s.HA_DIALOG_CONTENT.element.then(function(o) {
      i._dialogsContentObserver.disconnect(), i._dialogsContentObserver.observe(o, { childList: !0 });
    }), this._haDialogElements = function(o, l) {
      return [B.HA_MORE_INFO_DIALOG, B.HA_DIALOG, B.HA_DIALOG_CONTENT, l].reduce(function(u, c) {
        return u[c] = o[c], u;
      }, {});
    }(s, n);
    var a = ((r = {})[B.HA_MORE_INFO_DIALOG_INFO] = Ke.ON_MORE_INFO_DIALOG_OPEN, r[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = Ke.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, r[B.HA_DIALOG_MORE_INFO_SETTINGS] = Ke.ON_SETTINGS_DIALOG_OPEN, r);
    this._dispatchEvent(a[n], this._haDialogElements);
  }, e.prototype._updateRootElements = function() {
    var n = this;
    this._homeAssistantRootTree = Gn(this._config, Wc), this._haRootElements = si(Ie, this._homeAssistantRootTree), this._haRootElements[Ie.HOME_ASSISTANT].selector.$.element.then(function(r) {
      n._dialogsObserver.disconnect(), n._dialogsObserver.observe(r, { childList: !0 });
    }), this._haRootElements[Ie.PARTIAL_PANEL_RESOLVER].element.then(function(r) {
      n._panelResolverObserver.disconnect(), r && n._panelResolverObserver.observe(r, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(Ke.ON_LISTEN, this._haRootElements), this._dispatchEvent(Ke.ON_PANEL_LOAD, this._haRootElements);
  }, e.prototype._updateLovelaceElements = function() {
    var n = this;
    this._homeAssistantResolverTree = Gn(this._config, Yc, this._haRootElements[Ie.HA_DRAWER].element), this._haResolverElements = si(yt, this._homeAssistantResolverTree), this._haResolverElements[yt.HA_PANEL_LOVELACE].element.then(function(r) {
      n._lovelaceObserver.disconnect(), r && (n._lovelaceObserver.observe(r.shadowRoot, { childList: !0 }), n._dispatchEvent(Ke.ON_LOVELACE_PANEL_LOAD, rt(rt({}, n._haRootElements), n._haResolverElements)));
    });
  }, e.prototype._watchDialogs = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(s) {
        s.localName === j.HA_MORE_INFO_DIALOG && r._updateDialogElements();
      });
    });
  }, e.prototype._watchDialogsContent = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(s) {
        var a, o = ((a = {})[j.HA_MORE_INFO_DIALOG_INFO] = B.HA_MORE_INFO_DIALOG_INFO, a[j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, a[j.HA_DIALOG_MORE_INFO_SETTINGS] = B.HA_DIALOG_MORE_INFO_SETTINGS, a);
        if (s.localName && s.localName in o) {
          var l = s.localName;
          r._updateDialogElements(o[l]);
        }
      });
    });
  }, e.prototype._watchDashboards = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(s) {
        r._dispatchEvent(Ke.ON_PANEL_LOAD, r._haRootElements), s.localName === j.HA_PANEL_LOVELACE && r._updateLovelaceElements();
      });
    });
  }, e.prototype._watchLovelace = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(s) {
        s.localName === j.HUI_ROOT && r._updateLovelaceElements();
      });
    });
  }, e.prototype.listen = function() {
    this._watchDialogsBinded = this._watchDialogs.bind(this), this._watchDialogsContentBinded = this._watchDialogsContent.bind(this), this._watchDashboardsBinded = this._watchDashboards.bind(this), this._watchLovelaceBinded = this._watchLovelace.bind(this), this._dialogsObserver = new MutationObserver(this._watchDialogsBinded), this._dialogsContentObserver = new MutationObserver(this._watchDialogsContentBinded), this._panelResolverObserver = new MutationObserver(this._watchDashboardsBinded), this._lovelaceObserver = new MutationObserver(this._watchLovelaceBinded), this._updateRootElements(), this._updateLovelaceElements();
  }, e.prototype.addEventListener = function(n, r, i) {
    t.prototype.addEventListener.call(this, n, r, i);
  }, e;
}(Kc);
const ho = new Xc();
let Ar = {};
ho.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
  t.HUI_ROOT.element.then((e) => {
    const n = e == null ? void 0 : e.lovelace;
    n != null && n.config && (Ar = n.config["expander-card"] || {});
  }).catch(() => {
    Ar = {};
  }).finally(() => {
    document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
      detail: { rawConfig: Ar },
      bubbles: !0,
      composed: !0
    }));
  });
});
ho.listen();
const Qc = () => Ar, Hs = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
  if (!Array.isArray(n))
    return null;
  const r = n.map((i) => {
    if (typeof i == "string")
      return `  ${i};`;
    const [s, a] = Object.entries(i)[0];
    return `  ${s}: ${a};`;
  }).join(`
`);
  return `${e} {
${r}
}`;
}).filter((e) => e !== null).join(`
`) : null, xi = {
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
  "icon-rotate-degree": "180deg",
  animation: !0,
  haptic: "light"
};
var Zc = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), eu = /* @__PURE__ */ ot('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), tu = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), nu = /* @__PURE__ */ ot('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), ru = /* @__PURE__ */ ot("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), iu = /* @__PURE__ */ ot("<div><div></div></div>"), su = /* @__PURE__ */ ot("<ha-card><!> <!> <!></ha-card>", 2);
const au = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function ou(t, e) {
  Ri(e, !0), to(t, au);
  const n = Te(e, "hass"), r = Te(e, "preview"), i = Te(e, "config", 7, xi);
  let s = /* @__PURE__ */ M(!1), a = /* @__PURE__ */ M(null), o = /* @__PURE__ */ M(nt(!!Ce(() => r()))), l = /* @__PURE__ */ M(nt(!!Ce(() => r()))), u = /* @__PURE__ */ M(!0), c = /* @__PURE__ */ M("idle"), f = /* @__PURE__ */ M(null), _ = /* @__PURE__ */ M(0), w = /* @__PURE__ */ M(0), g = /* @__PURE__ */ M(null), A = /* @__PURE__ */ M(null), d = /* @__PURE__ */ M(null), v = /* @__PURE__ */ M(null);
  const y = {}, b = {}, S = {}, T = /* @__PURE__ */ M(nt({}));
  let C = /* @__PURE__ */ M(nt(Qc()));
  const k = /* @__PURE__ */ kn(() => {
    const m = p(T).style, E = i().style;
    let $ = null;
    return m !== void 0 ? $ = typeof m == "string" ? m : typeof m == "object" && m !== null ? Hs(m) : String(m) : E && ($ = Hs(E)), $ ? `<style>${$}</style>` : null;
  }), F = /* @__PURE__ */ kn(() => p(T).icon !== void 0 ? String(p(T).icon) : i().icon), H = /* @__PURE__ */ kn(() => p(T).title !== void 0 ? String(p(T).title) : i().title), lr = /* @__PURE__ */ kn(() => p(T)["arrow-color"] !== void 0 ? String(p(T)["arrow-color"]) : i()["arrow-color"]), Nn = Ce(() => i()["storage-id"]), Zi = "expander-open-" + Nn;
  O(u, Ce(() => r() || (Br(i()["show-button-users"]) ?? !0)), !0), dn(() => {
    if (p(T).expanded === void 0 || Ce(() => r() && p(C)["preview-expanded"] !== !1))
      return;
    const m = !!p(T).expanded;
    queueMicrotask(() => {
      m !== p(o) && Nt(m);
    });
  }), dn(() => {
    if (!(r() === p(l) || r() === void 0)) {
      if (O(l, r(), !0), p(l) && p(C)["preview-expanded"] !== !1) {
        Cn(!0), O(u, !0);
        return;
      }
      if (O(u, Br(i()["show-button-users"]) ?? !0, !0), cr("expanded")) {
        const m = Ce(() => p(T).expanded);
        m !== void 0 && Nt(!!m);
        return;
      }
      es();
    }
  });
  function cr(m) {
    const E = i().templates && Array.isArray(i().templates) ? i().templates.find(($) => $.template === m) : void 0;
    if (E && $r(E.value_template))
      return E;
  }
  function zr(m) {
    if (!i()["expander-card-id"])
      return;
    const E = {};
    E[i()["expander-card-id"]] = { property: "open", value: m }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function Br(m) {
    var E, $, Y, Ae;
    if (m !== void 0)
      return (($ = (E = n()) == null ? void 0 : E.user) == null ? void 0 : $.name) !== void 0 && m.includes((Ae = (Y = n()) == null ? void 0 : Y.user) == null ? void 0 : Ae.name);
  }
  function es() {
    if (!cr("expanded")) {
      if (Br(i()["start-expanded-users"])) {
        lt(!0);
        return;
      }
      if (Nn === void 0) {
        ts();
        return;
      }
      try {
        const m = localStorage.getItem(Zi);
        if (m === null) {
          ts();
          return;
        }
        const E = m ? m === "true" : p(o);
        lt(E);
      } catch (m) {
        console.error(m), lt(!1);
      }
    }
  }
  function ts() {
    if (i().expanded !== void 0) {
      lt(i().expanded);
      return;
    }
    lt(!1);
  }
  function Nt(m) {
    p(f) && (clearTimeout(p(f)), O(f, null));
    const E = m !== void 0 ? m : !p(o);
    if (!i().animation) {
      lt(E);
      return;
    }
    if (zr(E), O(c, E ? "opening" : "closing", !0), E) {
      Cn(!0), O(
        f,
        setTimeout(
          () => {
            O(c, "idle"), O(f, null);
          },
          350
        ),
        !0
      );
      return;
    }
    O(
      f,
      setTimeout(
        () => {
          Cn(!1), O(c, "idle"), O(f, null);
        },
        350
      ),
      !0
    );
  }
  function lt(m) {
    Cn(m), zr(m);
  }
  function Cn(m) {
    if (O(o, m, !0), !r() && Nn !== void 0)
      try {
        localStorage.setItem(Zi, p(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    p(o) && p(_) === 0 && O(_, 0.35);
  }
  function ns(m) {
    var $;
    const E = ($ = m.detail) == null ? void 0 : $.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(p(C)) && O(C, E, !0);
  }
  function rs(m) {
    var $, Y;
    const E = (Y = ($ = m.detail) == null ? void 0 : $["expander-card"]) == null ? void 0 : Y.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === i()["expander-card-id"]) {
      if (E.action === "open" && !p(o)) {
        Nt(!0);
        return;
      }
      if (E.action === "close" && p(o)) {
        Nt(!1);
        return;
      }
      E.action === "toggle" && Nt();
    }
  }
  function bo() {
    document.body.removeEventListener("ll-custom", rs), document.body.removeEventListener("expander-card-raw-config-updated", ns), Object.entries(S).forEach(([m, E]) => {
      E.then(($) => {
        $(), delete S[m];
      }).catch(() => {
      });
    }), Object.entries(b).forEach(([m, E]) => {
      E.then(($) => {
        $(), delete b[m];
      }).catch(() => {
      });
    }), Object.entries(y).forEach(([m, E]) => {
      E(), delete y[m];
    });
  }
  const is = (m) => {
    i().haptic && i().haptic !== "none" && Ic(m, i().haptic);
  };
  let Rn, In = !1, ss = 0, as = 0;
  const wo = (m) => {
    p(v) && (p(v).disabled = !0), Rn = m.target, ss = m.touches[0].clientX, as = m.touches[0].clientY, In = !1;
  }, Eo = (m) => {
    const E = m.touches[0].clientX, $ = m.touches[0].clientY;
    In = Math.abs(E - ss) > 10 || Math.abs($ - as) > 10;
  }, $o = () => {
    p(v) && (p(v).disabled = !1), Rn = void 0, In = !1;
  }, Ao = () => {
    p(v) && (p(v).disabled = !1);
  }, Oo = (m) => {
    !In && Rn === m.target && i()["title-card-clickable"] && (is(Rn), Nt(), O(s, !0), O(
      a,
      window.setTimeout(
        () => {
          O(s, !1), O(a, null);
        },
        100
      ),
      !0
    ), p(v) && (p(v).startPressAnimation(), p(v).endPressAnimation())), Rn = void 0, In = !1;
  }, So = (m) => {
    for (const E of Object.values(i().variables ?? {}))
      $r(E.value_template) ? b[E.variable] = xs(
        m,
        ($) => {
          Ts(m, E.variable, $);
        },
        E.value_template,
        { config: i() }
      ) : Ts(m, E.variable, E.value_template);
  }, xo = (m) => {
    y["expander-card"] = jc(m, "expander-card");
  }, To = () => {
    if (!i().templates) return;
    const m = Object.values(i().variables || {}).reduce(
      ($, Y) => ($[Y.variable] = void 0, $),
      {}
    ), E = Mc({ config: i(), expanderCard: {} }, m);
    So(E), xo(E), Object.values(i().templates || {}).forEach(($) => {
      $r($.value_template) ? S[$.template] = xs(
        E,
        (Y) => {
          p(T)[$.template] = Y;
        },
        $.value_template,
        { config: i() }
      ) : p(T)[$.template] = $.value_template;
    });
  };
  function No() {
    if (cr("expanded"))
      return;
    const m = i()["min-width-expanded"], E = i()["max-width-expanded"], $ = document.body.offsetWidth;
    if (m && E) {
      i().expanded = $ >= m && $ <= E;
      return;
    }
    if (m) {
      i().expanded = $ >= m;
      return;
    }
    E && (i().expanded = $ <= E);
  }
  function Co() {
    if (r() && p(C)["preview-expanded"] !== !1) {
      Cn(!0);
      return;
    }
    if (cr("expanded")) {
      const m = Ce(() => p(T).expanded);
      lt(m !== void 0 ? !!m : !1);
    } else
      es();
  }
  function Ro() {
    if (i()["title-card-clickable"] && !i()["title-card-button-overlay"] && p(A))
      return p(A);
    if (p(d))
      return p(d);
  }
  eo(() => {
    To(), zr(!1), No(), Co(), document.body.addEventListener("ll-custom", rs), document.body.addEventListener("expander-card-raw-config-updated", ns);
    const m = Ro();
    return m && (m.addEventListener("touchstart", wo, { passive: !0, capture: !0 }), m.addEventListener("touchmove", Eo, { passive: !0, capture: !0 }), m.addEventListener("touchcancel", $o, { passive: !0, capture: !0 }), m.addEventListener("touchend", Ao, { passive: !0, capture: !0 }), m.addEventListener("touchend", Oo, { passive: !1, capture: !1 })), i()["title-card-clickable"] && i()["title-card-button-overlay"] && p(A) && new ResizeObserver(() => {
      if (p(d) && p(A) && p(g)) {
        const $ = p(A).getBoundingClientRect();
        O(w, $.height - parseFloat(getComputedStyle(p(d)).marginTop) - parseFloat(getComputedStyle(p(d)).marginBottom) + parseFloat(getComputedStyle(p(g)).paddingTop) + parseFloat(getComputedStyle(p(g)).paddingBottom));
      }
    }).observe(p(A)), bo;
  });
  const Vr = (m) => {
    if (!p(s)) {
      is(m.currentTarget), Nt();
      return;
    }
    return m.preventDefault(), m.stopImmediatePropagation(), O(s, !1), p(a) && (clearTimeout(p(a)), O(a, null)), !1;
  };
  var Io = {
    get hass() {
      return n();
    },
    set hass(m) {
      n(m), me();
    },
    get preview() {
      return r();
    },
    set preview(m) {
      r(m), me();
    },
    get config() {
      return i();
    },
    set config(m = xi) {
      i(m), me();
    }
  }, nn = su(), os = dt(nn);
  {
    var Lo = (m) => {
      var E = nu(), $ = dt(E), Y = dt($);
      Ai(Y, {
        get hass() {
          return n();
        },
        get preview() {
          return r();
        },
        get config() {
          return i()["title-card"];
        },
        animation: !1,
        open: !0,
        animationState: "idle",
        get clearCardCss() {
          return i()["clear-children"];
        }
      }), Ye($);
      var Ae = Rt($, 2);
      {
        var Oe = (ee) => {
          var te = eu(), Fe = dt(te);
          Je(() => Es(Fe, "icon", p(F)));
          var Ho = Rt(Fe, 2);
          {
            var jo = (Ct) => {
              var Ln = Zc();
              pt(Ln, (Fo) => O(v, Fo), () => p(v)), ve(Ct, Ln);
            };
            ft(Ho, (Ct) => {
              (!i()["title-card-clickable"] || i()["title-card-button-overlay"]) && Ct(jo);
            });
          }
          Ye(te), pt(te, (Ct) => O(d, Ct), () => p(d)), Je(() => {
            ht(te, `--overlay-margin:${i()["overlay-margin"] ?? ""}; --button-background:${i()["button-background"] ?? ""}; --header-color:${i()["header-color"] ?? ""};`), Se(te, 1, `header ${i()["title-card-button-overlay"] ? " header-overlay" : ""}${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(Fe, `--arrow-color:${p(lr) ?? ""}`), Se(Fe, 1, `ico${p(o) && p(c) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
          }), Jr("click", te, function(...Ct) {
            var Ln;
            (Ln = !i()["title-card-clickable"] || i()["title-card-button-overlay"] ? Vr : null) == null || Ln.apply(this, Ct);
          }), ve(ee, te);
        };
        ft(Ae, (ee) => {
          p(u) && ee(Oe);
        });
      }
      var rn = Rt(Ae, 2);
      {
        var Wr = (ee) => {
          var te = tu();
          pt(te, (Fe) => O(v, Fe), () => p(v)), ve(ee, te);
        };
        ft(rn, (ee) => {
          i()["title-card-clickable"] && !i()["title-card-button-overlay"] && ee(Wr);
        });
      }
      Ye(E), pt(E, (ee) => O(A, ee), () => p(A)), Je(() => {
        Se(E, 1, `title-card-header${i()["title-card-button-overlay"] ? "-overlay" : ""}${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}${i()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), no(E, "role", i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? "button" : void 0), Se($, 1, `title-card-container${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht($, `--title-padding:${(i()["title-card-padding"] ? i()["title-card-padding"] : "0px") ?? ""};`);
      }), Jr("click", E, function(...ee) {
        var te;
        (te = i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? Vr : null) == null || te.apply(this, ee);
      }), ve(m, E);
    }, ko = (m) => {
      var E = bs(), $ = vs(E);
      {
        var Y = (Ae) => {
          var Oe = ru(), rn = dt(Oe), Wr = dt(rn, !0);
          Ye(rn);
          var ee = Rt(rn, 2);
          Je(() => Es(ee, "icon", p(F)));
          var te = Rt(ee, 2);
          pt(te, (Fe) => O(v, Fe), () => p(v)), Ye(Oe), pt(Oe, (Fe) => O(d, Fe), () => p(d)), Je(() => {
            Se(Oe, 1, `header${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(Oe, `--header-width:100%; --button-background:${i()["button-background"] ?? ""};--header-color:${i()["header-color"] ?? ""};`), Se(rn, 1, `primary title${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), uc(Wr, p(H)), ht(ee, `--arrow-color:${p(lr) ?? ""}`), Se(ee, 1, `ico${p(o) && p(c) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
          }), Jr("click", Oe, Vr), ve(Ae, Oe);
        };
        ft($, (Ae) => {
          p(u) && Ae(Y);
        });
      }
      ve(m, E);
    };
    ft(os, (m) => {
      i()["title-card"] ? m(Lo) : m(ko, !1);
    });
  }
  var ls = Rt(os, 2);
  {
    var Po = (m) => {
      var E = iu(), $ = dt(E);
      vc($, 20, () => i().cards, (Y) => Y, (Y, Ae) => {
        {
          let Oe = /* @__PURE__ */ kn(() => p(o) && r());
          Ai(Y, {
            get hass() {
              return n();
            },
            get preview() {
              return p(Oe);
            },
            get config() {
              return Ae;
            },
            get marginTop() {
              return i()["child-margin-top"];
            },
            get open() {
              return p(o);
            },
            get animation() {
              return i().animation;
            },
            get animationState() {
              return p(c);
            },
            get clearCardCss() {
              return i()["clear-children"];
            }
          });
        }
      }), Ye($), Ye(E), Je(() => {
        Se(E, 1, `children-wrapper ${i().animation ? "animation " + p(c) : ""}${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), ht($, `--expander-card-display:${i()["expander-card-display"] ?? ""};
                --gap:${(p(o) && p(c) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""};
                --child-padding:${(p(o) && p(c) !== "closing" ? i()["child-padding"] : "0px") ?? ""};`), Se($, 1, `children-container${p(o) ? " open" : " close"}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq");
      }), ve(m, E);
    };
    ft(ls, (m) => {
      i().cards && m(Po);
    });
  }
  var Do = Rt(ls, 2);
  {
    var Mo = (m) => {
      var E = bs(), $ = vs(E);
      mc($, () => p(k)), ve(m, E);
    };
    ft(Do, (m) => {
      p(k) && m(Mo);
    });
  }
  return Ye(nn), pt(nn, (m) => O(g, m), () => p(g)), Je(() => {
    Se(nn, 1, `expander-card${i().clear ? " clear" : ""}${p(o) ? " open" : " close"} ${p(c)}${i().animation ? " animation " + p(c) : ""}`, "svelte-1jqiztq"), ht(nn, `--expander-card-display:${i()["expander-card-display"] ?? ""};
     --gap:${(p(o) && p(c) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""}; --padding:${i().padding ?? ""};
     --expander-state:${p(o) ?? ""};
     --icon-rotate-degree:${i()["icon-rotate-degree"] ?? ""};
     --card-background:${(p(o) && p(c) !== "closing" && i()["expander-card-background-expanded"] ? i()["expander-card-background-expanded"] : i()["expander-card-background"]) ?? ""};
     --background-animation-duration:${p(_) ?? ""}s;
     --expander-card-overlay-height:${p(w) ? `${p(w)}px` : "auto"};
    `);
  }), ve(t, nn), Ii(Io);
}
lc(["click"]);
customElements.define("expander-card", so(ou, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    q(this, "config");
  }
  static async getConfigElement() {
    return await il(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...xi, ...n };
  }
}));
const lu = "6.0.2";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Or = globalThis, Wi = Or.ShadowRoot && (Or.ShadyCSS === void 0 || Or.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Yi = Symbol(), js = /* @__PURE__ */ new WeakMap();
let po = class {
  constructor(e, n, r) {
    if (this._$cssResult$ = !0, r !== Yi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Wi && e === void 0) {
      const r = n !== void 0 && n.length === 1;
      r && (e = js.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && js.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const cu = (t) => new po(typeof t == "string" ? t : t + "", void 0, Yi), Ji = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((r, i, s) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[s + 1], t[0]);
  return new po(n, t, Yi);
}, uu = (t, e) => {
  if (Wi) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const r = document.createElement("style"), i = Or.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = n.cssText, t.appendChild(r);
  }
}, Fs = Wi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const r of e.cssRules) n += r.cssText;
  return cu(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: du, defineProperty: fu, getOwnPropertyDescriptor: hu, getOwnPropertyNames: pu, getOwnPropertySymbols: vu, getPrototypeOf: _u } = Object, At = globalThis, qs = At.trustedTypes, gu = qs ? qs.emptyScript : "", ai = At.reactiveElementPolyfillSupport, Un = (t, e) => t, Ir = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? gu : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let n = t;
  switch (e) {
    case Boolean:
      n = t !== null;
      break;
    case Number:
      n = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(t);
      } catch {
        n = null;
      }
  }
  return n;
} }, Ki = (t, e) => !du(t, e), Gs = { attribute: !0, type: String, converter: Ir, reflect: !1, useDefault: !1, hasChanged: Ki };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), At.litPropertyMetadata ?? (At.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let ln = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Gs) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, n);
      i !== void 0 && fu(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, r) {
    const { get: i, set: s } = hu(this.prototype, e) ?? { get() {
      return this[n];
    }, set(a) {
      this[n] = a;
    } };
    return { get: i, set(a) {
      const o = i == null ? void 0 : i.call(this);
      s == null || s.call(this, a), this.requestUpdate(e, o, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Gs;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Un("elementProperties"))) return;
    const e = _u(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Un("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Un("properties"))) {
      const n = this.properties, r = [...pu(n), ...vu(n)];
      for (const i of r) this.createProperty(i, n[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const n = litPropertyMetadata.get(e);
      if (n !== void 0) for (const [r, i] of n) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, r] of this.elementProperties) {
      const i = this._$Eu(n, r);
      i !== void 0 && this._$Eh.set(i, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const n = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const i of r) n.unshift(Fs(i));
    } else e !== void 0 && n.push(Fs(e));
    return n;
  }
  static _$Eu(e, n) {
    const r = n.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((n) => this.enableUpdating = n), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((n) => n(this));
  }
  addController(e) {
    var n;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((n = e.hostConnected) == null || n.call(e));
  }
  removeController(e) {
    var n;
    (n = this._$EO) == null || n.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const r of n.keys()) this.hasOwnProperty(r) && (e.set(r, this[r]), delete this[r]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return uu(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((n) => {
      var r;
      return (r = n.hostConnected) == null ? void 0 : r.call(n);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((n) => {
      var r;
      return (r = n.hostDisconnected) == null ? void 0 : r.call(n);
    });
  }
  attributeChangedCallback(e, n, r) {
    this._$AK(e, r);
  }
  _$ET(e, n) {
    var s;
    const r = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, r);
    if (i !== void 0 && r.reflect === !0) {
      const a = (((s = r.converter) == null ? void 0 : s.toAttribute) !== void 0 ? r.converter : Ir).toAttribute(n, r.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var s, a;
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? o.converter : Ir;
      this._$Em = i;
      const u = l.fromAttribute(n, o.type);
      this[i] = u ?? ((a = this._$Ej) == null ? void 0 : a.get(i)) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, n, r, i = !1, s) {
    var a;
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (s = this[e]), r ?? (r = o.getPropertyOptions(e)), !((r.hasChanged ?? Ki)(s, n) || r.useDefault && r.reflect && s === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, r)))) return;
      this.C(e, n, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: r, reflect: i, wrapped: s }, a) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? n ?? this[e]), s !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (n = void 0), this._$AL.set(e, n)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var r;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [s, a] of this._$Ep) this[s] = a;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, a] of i) {
        const { wrapped: o } = a, l = this[s];
        o !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, a, l);
      }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), (r = this._$EO) == null || r.forEach((i) => {
        var s;
        return (s = i.hostUpdate) == null ? void 0 : s.call(i);
      }), this.update(n)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(n);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var n;
    (n = this._$EO) == null || n.forEach((r) => {
      var i;
      return (i = r.hostUpdated) == null ? void 0 : i.call(r);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((n) => this._$ET(n, this[n]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
ln.elementStyles = [], ln.shadowRootOptions = { mode: "open" }, ln[Un("elementProperties")] = /* @__PURE__ */ new Map(), ln[Un("finalized")] = /* @__PURE__ */ new Map(), ai == null || ai({ ReactiveElement: ln }), (At.reactiveElementVersions ?? (At.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zn = globalThis, Us = (t) => t, Lr = zn.trustedTypes, zs = Lr ? Lr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, vo = "$lit$", _t = `lit$${Math.random().toFixed(9).slice(2)}$`, _o = "?" + _t, mu = `<${_o}>`, Xt = document, Jn = () => Xt.createComment(""), Kn = (t) => t === null || typeof t != "object" && typeof t != "function", Xi = Array.isArray, yu = (t) => Xi(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", oi = `[ 	
\f\r]`, Mn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Bs = /-->/g, Vs = />/g, Lt = RegExp(`>|${oi}(?:([^\\s"'>=/]+)(${oi}*=${oi}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ws = /'/g, Ys = /"/g, go = /^(?:script|style|textarea|title)$/i, bu = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), on = bu(1), Sn = Symbol.for("lit-noChange"), G = Symbol.for("lit-nothing"), Js = /* @__PURE__ */ new WeakMap(), Mt = Xt.createTreeWalker(Xt, 129);
function mo(t, e) {
  if (!Xi(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return zs !== void 0 ? zs.createHTML(e) : e;
}
const wu = (t, e) => {
  const n = t.length - 1, r = [];
  let i, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = Mn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let u, c, f = -1, _ = 0;
    for (; _ < l.length && (a.lastIndex = _, c = a.exec(l), c !== null); ) _ = a.lastIndex, a === Mn ? c[1] === "!--" ? a = Bs : c[1] !== void 0 ? a = Vs : c[2] !== void 0 ? (go.test(c[2]) && (i = RegExp("</" + c[2], "g")), a = Lt) : c[3] !== void 0 && (a = Lt) : a === Lt ? c[0] === ">" ? (a = i ?? Mn, f = -1) : c[1] === void 0 ? f = -2 : (f = a.lastIndex - c[2].length, u = c[1], a = c[3] === void 0 ? Lt : c[3] === '"' ? Ys : Ws) : a === Ys || a === Ws ? a = Lt : a === Bs || a === Vs ? a = Mn : (a = Lt, i = void 0);
    const w = a === Lt && t[o + 1].startsWith("/>") ? " " : "";
    s += a === Mn ? l + mu : f >= 0 ? (r.push(u), l.slice(0, f) + vo + l.slice(f) + _t + w) : l + _t + (f === -2 ? o : w);
  }
  return [mo(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class Xn {
  constructor({ strings: e, _$litType$: n }, r) {
    let i;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [u, c] = wu(e, n);
    if (this.el = Xn.createElement(u, r), Mt.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (i = Mt.nextNode()) !== null && l.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const f of i.getAttributeNames()) if (f.endsWith(vo)) {
          const _ = c[a++], w = i.getAttribute(f).split(_t), g = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: s, name: g[2], strings: w, ctor: g[1] === "." ? $u : g[1] === "?" ? Au : g[1] === "@" ? Ou : Gr }), i.removeAttribute(f);
        } else f.startsWith(_t) && (l.push({ type: 6, index: s }), i.removeAttribute(f));
        if (go.test(i.tagName)) {
          const f = i.textContent.split(_t), _ = f.length - 1;
          if (_ > 0) {
            i.textContent = Lr ? Lr.emptyScript : "";
            for (let w = 0; w < _; w++) i.append(f[w], Jn()), Mt.nextNode(), l.push({ type: 2, index: ++s });
            i.append(f[_], Jn());
          }
        }
      } else if (i.nodeType === 8) if (i.data === _o) l.push({ type: 2, index: s });
      else {
        let f = -1;
        for (; (f = i.data.indexOf(_t, f + 1)) !== -1; ) l.push({ type: 7, index: s }), f += _t.length - 1;
      }
      s++;
    }
  }
  static createElement(e, n) {
    const r = Xt.createElement("template");
    return r.innerHTML = e, r;
  }
}
function xn(t, e, n = t, r) {
  var a, o;
  if (e === Sn) return e;
  let i = r !== void 0 ? (a = n._$Co) == null ? void 0 : a[r] : n._$Cl;
  const s = Kn(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== s && ((o = i == null ? void 0 : i._$AO) == null || o.call(i, !1), s === void 0 ? i = void 0 : (i = new s(t), i._$AT(t, n, r)), r !== void 0 ? (n._$Co ?? (n._$Co = []))[r] = i : n._$Cl = i), i !== void 0 && (e = xn(t, i._$AS(t, e.values), i, r)), e;
}
class Eu {
  constructor(e, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: n }, parts: r } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? Xt).importNode(n, !0);
    Mt.currentNode = i;
    let s = Mt.nextNode(), a = 0, o = 0, l = r[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let u;
        l.type === 2 ? u = new ar(s, s.nextSibling, this, e) : l.type === 1 ? u = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (u = new Su(s, this, e)), this._$AV.push(u), l = r[++o];
      }
      a !== (l == null ? void 0 : l.index) && (s = Mt.nextNode(), a++);
    }
    return Mt.currentNode = Xt, i;
  }
  p(e) {
    let n = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, n), n += r.strings.length - 2) : r._$AI(e[n])), n++;
  }
}
class ar {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, r, i) {
    this.type = 2, this._$AH = G, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = r, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = n.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, n = this) {
    e = xn(this, e, n), Kn(e) ? e === G || e == null || e === "" ? (this._$AH !== G && this._$AR(), this._$AH = G) : e !== this._$AH && e !== Sn && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : yu(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== G && Kn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Xt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = Xn.createElement(mo(r.h, r.h[0]), this.options)), r);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === i) this._$AH.p(n);
    else {
      const a = new Eu(i, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = Js.get(e.strings);
    return n === void 0 && Js.set(e.strings, n = new Xn(e)), n;
  }
  k(e) {
    Xi(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let r, i = 0;
    for (const s of e) i === n.length ? n.push(r = new ar(this.O(Jn()), this.O(Jn()), this, this.options)) : r = n[i], r._$AI(s), i++;
    i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, n); e !== this._$AB; ) {
      const i = Us(e).nextSibling;
      Us(e).remove(), e = i;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class Gr {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, r, i, s) {
    this.type = 1, this._$AH = G, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = s, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = G;
  }
  _$AI(e, n = this, r, i) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = xn(this, e, n, 0), a = !Kn(e) || e !== this._$AH && e !== Sn, a && (this._$AH = e);
    else {
      const o = e;
      let l, u;
      for (e = s[0], l = 0; l < s.length - 1; l++) u = xn(this, o[r + l], n, l), u === Sn && (u = this._$AH[l]), a || (a = !Kn(u) || u !== this._$AH[l]), u === G ? e = G : e !== G && (e += (u ?? "") + s[l + 1]), this._$AH[l] = u;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === G ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class $u extends Gr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === G ? void 0 : e;
  }
}
class Au extends Gr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== G);
  }
}
class Ou extends Gr {
  constructor(e, n, r, i, s) {
    super(e, n, r, i, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = xn(this, e, n, 0) ?? G) === Sn) return;
    const r = this._$AH, i = e === G && r !== G || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, s = e !== G && (r === G || i);
    i && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Su {
  constructor(e, n, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    xn(this, e);
  }
}
const li = zn.litHtmlPolyfillSupport;
li == null || li(Xn, ar), (zn.litHtmlVersions ?? (zn.litHtmlVersions = [])).push("3.3.2");
const xu = (t, e, n) => {
  const r = (n == null ? void 0 : n.renderBefore) ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    r._$litPart$ = i = new ar(e.insertBefore(Jn(), s), s, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt = globalThis;
class Bn extends ln {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var n;
    const e = super.createRenderRoot();
    return (n = this.renderOptions).renderBefore ?? (n.renderBefore = e.firstChild), e;
  }
  update(e) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = xu(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return Sn;
  }
}
var ta;
Bn._$litElement$ = !0, Bn.finalized = !0, (ta = Wt.litElementHydrateSupport) == null || ta.call(Wt, { LitElement: Bn });
const ci = Wt.litElementPolyfillSupport;
ci == null || ci({ LitElement: Bn });
(Wt.litElementVersions ?? (Wt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Tu = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Nu = { attribute: !0, type: String, converter: Ir, reflect: !1, hasChanged: Ki }, Cu = (t = Nu, e, n) => {
  const { kind: r, metadata: i } = n;
  let s = globalThis.litPropertyMetadata.get(i);
  if (s === void 0 && globalThis.litPropertyMetadata.set(i, s = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), s.set(n.name, t), r === "accessor") {
    const { name: a } = n;
    return { set(o) {
      const l = e.get.call(this);
      e.set.call(this, o), this.requestUpdate(a, l, t, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(a, void 0, t, o), o;
    } };
  }
  if (r === "setter") {
    const { name: a } = n;
    return function(o) {
      const l = this[a];
      e.call(this, o), this.requestUpdate(a, l, t, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function Ur(t) {
  return (e, n) => typeof n == "object" ? Cu(t, e, n) : ((r, i, s) => {
    const a = i.hasOwnProperty(s);
    return i.constructor.createProperty(s, r), a ? Object.getOwnPropertyDescriptor(i, s) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function or(t) {
  return Ur({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ru = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Iu(t, e) {
  return (n, r, i) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return Ru(n, r, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lu = (t) => t ?? G, ku = Ji`
  /* mwc-dialog (ha-dialog) styles */
  ha-dialog {
    --mdc-dialog-min-width: 400px;
    --mdc-dialog-max-width: 600px;
    --mdc-dialog-max-width: min(600px, 95vw);
    --justify-action-buttons: space-between;
    --dialog-container-padding: var(--safe-area-inset-top, 0)
      var(--safe-area-inset-right, 0) var(--safe-area-inset-bottom, 0)
      var(--safe-area-inset-left, 0);
    --dialog-surface-padding: 0px;
  }

  ha-dialog .form {
    color: var(--primary-text-color);
  }

  a {
    color: var(--primary-color);
  }

  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --mdc-dialog-min-width: 100vw;
      --mdc-dialog-max-width: 100vw;
      --mdc-dialog-min-height: 100vh;
      --mdc-dialog-min-height: 100svh;
      --mdc-dialog-max-height: 100vh;
      --mdc-dialog-max-height: 100svh;
      --dialog-container-padding: 0px;
      --dialog-surface-padding: var(--safe-area-inset-top, 0)
        var(--safe-area-inset-right, 0) var(--safe-area-inset-bottom, 0)
        var(--safe-area-inset-left, 0);
      --vertical-align-dialog: flex-end;
      --ha-dialog-border-radius: var(--ha-border-radius-square);
    }
  }
  .error {
    color: var(--error-color);
  }
`, Pu = Ji`
  ha-dialog {
    /* Pin dialog to top so it doesn't jump when content changes size */
    --vertical-align-dialog: flex-start;
    --dialog-surface-margin-top: var(--ha-space-10);
    --mdc-dialog-max-height: calc(
      100vh - var(--dialog-surface-margin-top) - var(--ha-space-2) - var(
          --safe-area-inset-y,
          0px
        )
    );
    --mdc-dialog-max-height: calc(
      100svh - var(--dialog-surface-margin-top) - var(--ha-space-2) - var(
          --safe-area-inset-y,
          0px
        )
    );
  }

  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      /* When in fullscreen, dialog should be attached to top */
      --dialog-surface-margin-top: 0px;
      --mdc-dialog-min-height: 100vh;
      --mdc-dialog-min-height: 100svh;
      --mdc-dialog-max-height: 100vh;
      --mdc-dialog-max-height: 100svh;
    }
  }
`;
var Du = Object.defineProperty, Mu = Object.getOwnPropertyDescriptor, We = (t, e, n, r) => {
  for (var i = r > 1 ? void 0 : r ? Mu(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (i = (r ? a(e, n, i) : a(i)) || i);
  return r && i && Du(e, n, i), i;
};
const yo = "custom:", Hu = (t) => t.startsWith(yo), ju = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Fu = (t) => t.replace(yo, "");
let he = class extends Bn {
  constructor() {
    super(...arguments), this.large = !1, this._config = {}, this._cardGUIMode = !0, this._cardGUIModeAvailable = !0, this._error = !1;
  }
  // NOSONAR Lit @query decorator updates
  async showDialog(t) {
    this._params = t, this._config = t.config ?? {}, this.lovelace = t.lovelace, this.large = !1;
  }
  closeDialog() {
    return this._params = void 0, this._config = {}, this.dispatchEvent(new CustomEvent("dialog-closed", { detail: { dialog: this.localName } })), !0;
  }
  _submit() {
    var t, e;
    (e = (t = this._params) == null ? void 0 : t.submit) == null || e.call(t, this._config), this.closeDialog();
  }
  _cancel() {
    var t, e;
    (e = (t = this._params) == null ? void 0 : t.cancel) == null || e.call(t), this.closeDialog();
  }
  _enlarge() {
    this.large = !this.large;
  }
  _ignoreKeydown(t) {
    t.stopPropagation();
  }
  render() {
    var n;
    if (!this._params || !this.hass)
      return G;
    const t = !this._config.type || this._error || void 0;
    let e = this._params.title ?? "";
    if (this._config.type) {
      let r;
      Hu(this._config.type) ? (r = (n = ju(
        Fu(this._config.type)
      )) == null ? void 0 : n.name, r != null && r.toLowerCase().endsWith(" card") && (r = r.substring(0, r.length - 5))) : r = this.hass.localize(
        `ui.panel.lovelace.editor.card.${this._config.type}.name`
      ), e = `${e} - ${this.hass.localize(
        "ui.panel.lovelace.editor.edit_card.typed_header",
        { type: r }
      )}`;
    }
    return on`
        <ha-dialog
            open
            scrimClickAction
            escapeKeyAction
            @keydown=${this._ignoreKeydown.bind(this)}
            @closed=${this._cancel.bind(this)}
            .heading=${e}
        >
            <ha-dialog-header slot="heading">
                <ha-icon-button
                    slot="navigationIcon"
                    dialogAction="cancel"
                    .label=${this.hass.localize("ui.common.close")}
                >
                    <ha-icon .icon=${"mdi:close"}></ha-icon>
                </ha-icon-button>
                <span slot="title" @click=${this._enlarge.bind(this)}>${e}</span>
            </ha-dialog-header>
            ${this._renderCardEditor()}
            <div slot="primaryAction" @click=${this._submit.bind(this)}>
                <ha-button
                    appearance="plain"
                    size="small"
                    @click=${this._cancel.bind(this)}
                    dialogInitialFocus
                >
                    ${this._params.cancelText || this.hass.localize("ui.common.cancel")}
                </ha-button>
                <ha-button
                    size="small"
                    @click=${this._submit.bind(this)} 
                    disabled=${Lu(t)}
                >
                    ${this._params.submitText || this.hass.localize("ui.common.save")}
                </ha-button>
            </div>
        </ha-dialog>
        `;
  }
  _toggleCardMode() {
    var t;
    (t = this._cardEditorEl) == null || t.toggleMode();
  }
  _deleteCard() {
    this._config = {};
  }
  _cardConfigChanged(t) {
    t.stopPropagation(), this._config = { ...t.detail.config }, this._error = t.detail.error, this._cardGUIModeAvailable = t.detail.guiModeAvailable;
  }
  _cardGUIModeChanged(t) {
    t.stopPropagation(), this._cardGUIMode = t.detail.guiMode, this._cardGUIModeAvailable = t.detail.guiModeAvailable;
  }
  _renderCardEditorActions() {
    if (!this._config.type)
      return G;
    const t = this.hass.localize(
      !this._cardEditorEl || this._cardGUIMode ? "ui.panel.lovelace.editor.edit_card.show_code_editor" : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
    );
    return on`
            <div slot="secondaryAction">
                <ha-button
                appearance="plain"
                size="small"
                @click=${this._toggleCardMode.bind(this)}
                .disabled=${!this._cardGUIModeAvailable}
                >
                    ${t}
                </ha-button>
                <ha-button
                appearance="plain"
                size="small"
                @click=${this._deleteCard.bind(this)}
                >
                    Change card
                </ha-button>
            </div>
        `;
  }
  _renderCardEditor() {
    const t = this._error ? "blur" : "", e = this._error ? on` <ha-spinner aria-label="Can't update card"></ha-spinner> ` : "";
    return on`
        ${this._config.type ? on`
            <div class="content">
                <div class="element-editor">
                    <hui-card-element-editor
                        .hass=${this.hass}
                        .lovelace=${this.lovelace}
                        .value=${this._config}
                        @config-changed=${this._cardConfigChanged.bind(this)}
                        @GUImode-changed=${this._cardGUIModeChanged.bind(this)}
                    ></hui-card-element-editor>
                </div>
                <div class="element-preview">
                    <hui-card
                        .hass=${this.hass}
                        .config=${this._config}
                        preview
                        class=${t}
                    ></hui-card>
                    ${e}
                </div>
            </div>
            ${this._renderCardEditorActions()}
            ` : on`
            <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._cardConfigChanged.bind(this)}
            ></hui-card-picker>
            `}
        `;
  }
};
he.styles = [
  ku,
  Pu,
  Ji`
            :host {
                --code-mirror-max-height: calc(100vh - 176px);
            }
            ha-dialog {
                --mdc-dialog-max-width: 100px;
                --dialog-z-index: 6;
                --mdc-dialog-max-width: 90vw;
                --dialog-content-padding: 24px 12px;
            }
            .content {
                width: calc(90vw - 48px);
                max-width: 1000px;
            }
            @media all and (max-width: 450px), all and (max-height: 500px) {
                /* overrule the ha-style-dialog max-height on small screens */
                ha-dialog {
                    height: 100%;
                    --mdc-dialog-max-height: 100%;
                    --dialog-surface-top: 0px;
                    --mdc-dialog-max-width: 100vw;
                }
                .content {
                    width: 100%;
                    max-width: 100%;
                }
            }
            @media all and (min-width: 451px) and (min-height: 501px) {
                :host([large]) .content {
                    max-width: none;
                }
            }
            .content {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            .content hui-card {
                display: block;
                padding: 4px;
                margin: 0 auto;
                max-width: 390px;
            }
            .content .element-editor {
                margin: 0 10px;
            }
            .content .element-preview {
                margin: 0 10px;
            }

            @media (min-width: 1000px) {
                .content {
                    flex-direction: row;
                }
                .content > * {
                    flex-basis: 0;
                    flex-grow: 1;
                    flex-shrink: 1;
                    min-width: 0;
                }
                .content hui-card {
                    padding: 8px 10px;
                    margin: auto 0px;
                    max-width: 500px;
                }
                .content .element-preview {
                    margin: unset;
                }
            }
            .hidden {
                display: none;
            }
            .element-editor {
                margin-bottom: 8px;
            }
            .blur {
                filter: blur(2px) grayscale(100%);
            }
            .element-preview {
                position: relative;
                height: max-content;
                background: var(--primary-background-color);
                padding: 4px;
                border-radius: var(--ha-border-radius-sm);
                position: sticky;
                top: 0;
            }
            .element-preview ha-spinner {
                top: calc(50% - 24px);
                left: calc(50% - 24px);
                position: absolute;
                z-index: 10;
            }
            hui-card {
                padding-top: 8px;
                margin-bottom: 4px;
                display: block;
                width: 100%;
                box-sizing: border-box;
            }

            [slot="primaryAction"] {
                gap: var(--ha-space-2);
                display: flex;
            }
            [slot="secondaryAction"] {
                gap: var(--ha-space-2);
                display: flex;
                margin-left: 0px;
            }
            [slot="navigationIcon"] {
                --ha-icon-display: block;
            }
        `
];
We([
  Ur({ attribute: !1 })
], he.prototype, "hass", 2);
We([
  Ur({ type: Boolean, reflect: !0 })
], he.prototype, "large", 2);
We([
  Ur({ attribute: !1 })
], he.prototype, "lovelace", 2);
We([
  or()
], he.prototype, "_params", 2);
We([
  or()
], he.prototype, "_config", 2);
We([
  or()
], he.prototype, "_cardGUIMode", 2);
We([
  or()
], he.prototype, "_cardGUIModeAvailable", 2);
We([
  or()
], he.prototype, "_error", 2);
We([
  Iu("hui-card-element-editor")
], he.prototype, "_cardEditorEl", 2);
he = We([
  Tu("expander-card-title-card-edit-form")
], he);
console.info(
  `%c  Expander-Card 
%c Version ${lu}`,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
window.customCards = window.customCards || [];
window.customCards.push(
  // NOSONAR es2019
  {
    type: "expander-card",
    name: "Expander Card",
    preview: !0,
    description: "Expander card"
  }
);
customElements.get("expander-card-title-card-edit-form") || customElements.define("expander-card-title-card-edit-form", he);
export {
  ou as default
};
//# sourceMappingURL=expander-card.js.map
