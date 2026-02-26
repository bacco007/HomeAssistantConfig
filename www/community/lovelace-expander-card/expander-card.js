var jo = Object.defineProperty;
var cs = (t) => {
  throw TypeError(t);
};
var Fo = (t, e, n) => e in t ? jo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var q = (t, e, n) => Fo(t, typeof e != "symbol" ? e + "" : e, n), Wr = (t, e, n) => e.has(t) || cs("Cannot " + n);
var p = (t, e, n) => (Wr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), C = (t, e, n) => e.has(t) ? cs("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), T = (t, e, n, r) => (Wr(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n), U = (t, e, n) => (Wr(t, e, "access private method"), n);
const qo = "5";
var Xs;
typeof window < "u" && ((Xs = window.__svelte ?? (window.__svelte = {})).v ?? (Xs.v = /* @__PURE__ */ new Set())).add(qo);
const Go = {
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
}, Uo = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var hr = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(hr || {});
const zo = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Bo = { name: "style", label: "CSS structured object", selector: { object: {} } }, Vo = { icon: {} }, Wo = { text: {} }, Yo = { boolean: {} }, Jo = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Ko = (t, e) => ({
  name: t,
  label: e,
  selector: Vo
}), J = (t, e) => ({
  name: t,
  label: e,
  selector: Wo
}), sn = (t, e) => ({
  name: t,
  label: e,
  selector: Yo
}), us = (t, e, n) => ({
  name: t,
  label: e,
  selector: Jo(n)
}), Xo = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...J("title", "Title")
      },
      {
        ...Ko("icon", "Icon")
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
], Qo = (t, e) => new Promise((n) => {
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
}), Hn = window;
let pr = Hn.cardHelpers;
const Zo = new Promise((t) => {
  pr && t(), Hn.loadCardHelpers && Hn.loadCardHelpers().then((e) => {
    pr = e, Hn.cardHelpers = pr, t();
  });
});
async function el() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((r) => !r.system_generated).map((r) => r.name) : void 0;
}
const tl = async () => {
  const t = await Zo.then(() => pr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await el();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (i) => {
        var a, o, l, c;
        ((l = (o = (a = i.detail) == null ? void 0 : a.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((u) => u.name === "expander_card_title_card_marker")) && (i.stopPropagation(), (c = i.detail) != null && c.dialogImport && i.detail.dialogImport().then(async () => {
          var f, m, w, _, A, d, v, g;
          const u = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (m = (f = i.detail) == null ? void 0 : f.dialogParams) == null ? void 0 : m.submit,
            cancel: (_ = (w = i.detail) == null ? void 0 : w.dialogParams) == null ? void 0 : _.cancel,
            submitText: (d = (A = i.detail) == null ? void 0 : A.dialogParams) == null ? void 0 : d.submitText,
            cancelText: (g = (v = i.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : g.cancelText,
            lovelace: this.lovelace
          };
          await Qo(
            this,
            u
          );
        }));
      }, this._computeLabelCallback = (i) => i.label ?? i.name ?? "", this._valueChanged = (i) => {
        const s = i.detail.value, a = Object.entries(Go);
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
      const s = JSON.stringify(Xo), a = this._users.map((f) => f.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = s.replace(/\[\[users\]\]/g, a);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Uo.filter((f) => {
          var m;
          return !((m = this._config.templates) != null && m.some((w) => w.template === f));
        }).join('","')
      );
      const c = (this._config.style && typeof this._config.style == "object" ? hr.Object : hr.CSS) === hr.CSS ? JSON.stringify(zo) : JSON.stringify(Bo);
      return o = o.replace(/"\[\[style\]\]"/g, c), JSON.parse(o);
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
}, nl = async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => Hn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await tl();
    customElements.define("expander-card-editor", t);
  }
}, rl = 1, il = 2, sl = 16, al = 1, ol = 2, Ni = "[", kr = "[!", ds = "[?", Ci = "]", Jt = {}, K = Symbol(), ta = "http://www.w3.org/1999/xhtml", ll = "http://www.w3.org/2000/svg", cl = "http://www.w3.org/1998/Math/MathML", ci = !1;
var na = Array.isArray, ul = Array.prototype.indexOf, yn = Array.prototype.includes, Pr = Array.from, Ar = Object.keys, Or = Object.defineProperty, un = Object.getOwnPropertyDescriptor, dl = Object.getOwnPropertyDescriptors, fl = Object.prototype, hl = Array.prototype, ra = Object.getPrototypeOf, fs = Object.isExtensible;
const pl = () => {
};
function vl(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function ia() {
  var t, e, n = new Promise((r, i) => {
    t = r, e = i;
  });
  return { promise: n, resolve: t, reject: e };
}
const Q = 2, tr = 4, Dr = 8, sa = 1 << 24, st = 16, je = 32, Nt = 64, ui = 128, we = 512, W = 1024, Z = 2048, He = 4096, fe = 8192, rt = 16384, Ot = 32768, bn = 65536, hs = 1 << 17, aa = 1 << 18, Zt = 1 << 19, _l = 1 << 20, gt = 1 << 25, Bn = 65536, di = 1 << 21, Ri = 1 << 22, bt = 1 << 23, vr = Symbol("$state"), gl = Symbol("legacy props"), ml = Symbol(""), Pt = new class extends Error {
  constructor() {
    super(...arguments);
    q(this, "name", "StaleReactionError");
    q(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Qs;
const yl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!((Qs = globalThis.document) != null && Qs.contentType) && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
), Mr = 3, xn = 8;
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
function nr(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Il() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function Pe(t) {
  L = t;
}
let I;
function ne(t) {
  if (t === null)
    throw nr(), Jt;
  return I = t;
}
function wn() {
  return ne(/* @__PURE__ */ Fe(I));
}
function Ye(t) {
  if (L) {
    if (/* @__PURE__ */ Fe(I) !== null)
      throw nr(), Jt;
    I = t;
  }
}
function Ll(t = 1) {
  if (L) {
    for (var e = t, n = I; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(n);
    I = n;
  }
}
function Sr(t = !0) {
  for (var e = 0, n = I; ; ) {
    if (n.nodeType === xn) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Ci) {
        if (e === 0) return n;
        e -= 1;
      } else (r === Ni || r === kr || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (e += 1);
    }
    var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(n)
    );
    t && n.remove(), n = i;
  }
}
function oa(t) {
  if (!t || t.nodeType !== xn)
    throw nr(), Jt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function la(t) {
  return t === this.v;
}
function kl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function ca(t) {
  return !kl(t, this.v);
}
let Pl = !1, he = null;
function En(t) {
  he = t;
}
function Ii(t, e = !1, n) {
  he = {
    p: he,
    i: !1,
    c: null,
    e: null,
    s: t,
    x: null,
    l: null
  };
}
function Li(t) {
  var e = (
    /** @type {ComponentContext} */
    he
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var r of n)
      ka(r);
  }
  return t !== void 0 && (e.x = t), e.i = !0, he = e.p, t ?? /** @type {T} */
  {};
}
function ua() {
  return !0;
}
let Dt = [];
function da() {
  var t = Dt;
  Dt = [], vl(t);
}
function Bt(t) {
  if (Dt.length === 0 && !jn) {
    var e = Dt;
    queueMicrotask(() => {
      e === Dt && da();
    });
  }
  Dt.push(t);
}
function Dl() {
  for (; Dt.length > 0; )
    da();
}
function fa(t) {
  var e = k;
  if (e === null)
    return R.f |= bt, t;
  if ((e.f & Ot) === 0 && (e.f & tr) === 0)
    throw t;
  mt(t, e);
}
function mt(t, e) {
  for (; e !== null; ) {
    if ((e.f & ui) !== 0) {
      if ((e.f & Ot) === 0)
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
function B(t, e) {
  t.f = t.f & Ml | e;
}
function ki(t) {
  (t.f & we) !== 0 || t.deps === null ? B(t, W) : B(t, He);
}
function ha(t) {
  if (t !== null)
    for (const e of t)
      (e.f & Q) === 0 || (e.f & Bn) === 0 || (e.f ^= Bn, ha(
        /** @type {Derived} */
        e.deps
      ));
}
function pa(t, e, n) {
  (t.f & Z) !== 0 ? e.add(t) : (t.f & He) !== 0 && n.add(t), ha(t.deps), B(t, W);
}
const cr = /* @__PURE__ */ new Set();
let P = null, X = null, se = [], Hr = null, fi = !1, jn = !1;
var fn, hn, Ft, pn, Kn, Xn, qt, Xe, vn, ve, hi, pi, vi, va;
const Qi = class Qi {
  constructor() {
    C(this, ve);
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
    C(this, fn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    C(this, hn, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    C(this, Ft, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    C(this, pn, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    C(this, Kn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    C(this, Xn, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    C(this, qt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    C(this, Xe, /* @__PURE__ */ new Map());
    q(this, "is_fork", !1);
    C(this, vn, !1);
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    p(this, Xe).has(e) || p(this, Xe).set(e, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(e) {
    var n = p(this, Xe).get(e);
    if (n) {
      p(this, Xe).delete(e);
      for (var r of n.d)
        B(r, Z), De(r);
      for (r of n.m)
        B(r, He), De(r);
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
      U(this, ve, pi).call(this, s, n, r);
    if (U(this, ve, hi).call(this)) {
      U(this, ve, vi).call(this, r), U(this, ve, vi).call(this, n);
      for (const [s, a] of p(this, Xe))
        ya(s, a);
    } else {
      for (const s of p(this, fn)) s();
      p(this, fn).clear(), p(this, Ft) === 0 && U(this, ve, va).call(this), P = null, ps(r), ps(n), (i = p(this, Kn)) == null || i.resolve();
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
    P = this, this.apply();
  }
  deactivate() {
    P === this && (P = null, X = null);
  }
  flush() {
    if (this.activate(), se.length > 0) {
      if (_a(), P !== null && P !== this)
        return;
    } else p(this, Ft) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const e of p(this, hn)) e(this);
    p(this, hn).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(e) {
    T(this, Ft, p(this, Ft) + 1), e && T(this, pn, p(this, pn) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(e) {
    T(this, Ft, p(this, Ft) - 1), e && T(this, pn, p(this, pn) - 1), !p(this, vn) && (T(this, vn, !0), Bt(() => {
      T(this, vn, !1), U(this, ve, hi).call(this) ? se.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const e of p(this, Xn))
      p(this, qt).delete(e), B(e, Z), De(e);
    for (const e of p(this, qt))
      B(e, He), De(e);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(e) {
    p(this, fn).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    p(this, hn).add(e);
  }
  settled() {
    return (p(this, Kn) ?? T(this, Kn, ia())).promise;
  }
  static ensure() {
    if (P === null) {
      const e = P = new Qi();
      cr.add(P), jn || Bt(() => {
        P === e && e.flush();
      });
    }
    return P;
  }
  apply() {
  }
};
fn = new WeakMap(), hn = new WeakMap(), Ft = new WeakMap(), pn = new WeakMap(), Kn = new WeakMap(), Xn = new WeakMap(), qt = new WeakMap(), Xe = new WeakMap(), vn = new WeakMap(), ve = new WeakSet(), hi = function() {
  return this.is_fork || p(this, pn) > 0;
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
pi = function(e, n, r) {
  e.f ^= W;
  for (var i = e.first; i !== null; ) {
    var s = i.f, a = (s & (je | Nt)) !== 0, o = a && (s & W) !== 0, l = o || (s & fe) !== 0 || p(this, Xe).has(i);
    if (!l && i.fn !== null) {
      a ? i.f ^= W : (s & tr) !== 0 ? n.push(i) : rr(i) && ((s & st) !== 0 && p(this, qt).add(i), An(i));
      var c = i.first;
      if (c !== null) {
        i = c;
        continue;
      }
    }
    for (; i !== null; ) {
      var u = i.next;
      if (u !== null) {
        i = u;
        break;
      }
      i = i.parent;
    }
  }
}, /**
 * @param {Effect[]} effects
 */
vi = function(e) {
  for (var n = 0; n < e.length; n += 1)
    pa(e[n], p(this, Xn), p(this, qt));
}, va = function() {
  var i;
  if (cr.size > 1) {
    this.previous.clear();
    var e = X, n = !0;
    for (const s of cr) {
      if (s === this) {
        n = !1;
        continue;
      }
      const a = [];
      for (const [l, c] of this.current) {
        if (s.current.has(l))
          if (n && c !== s.current.get(l))
            s.current.set(l, c);
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
        const l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
        for (const u of a)
          ga(u, o, l, c);
        if (se.length > 0) {
          P = s, s.apply();
          for (const u of se)
            U(i = s, ve, pi).call(i, u, [], []);
          s.deactivate();
        }
        se = r;
      }
    }
    P = null, X = e;
  }
  cr.delete(this);
};
let it = Qi;
function ye(t) {
  var e = jn;
  jn = !0;
  try {
    for (var n; ; ) {
      if (Dl(), se.length === 0 && (P == null || P.flush(), se.length === 0))
        return Hr = null, /** @type {T} */
        n;
      _a();
    }
  } finally {
    jn = e;
  }
}
function _a() {
  fi = !0;
  var t = null;
  try {
    for (var e = 0; se.length > 0; ) {
      var n = it.ensure();
      if (e++ > 1e3) {
        var r, i;
        Hl();
      }
      n.process(se), wt.clear();
    }
  } finally {
    se = [], fi = !1, Hr = null;
  }
}
function Hl() {
  try {
    Sl();
  } catch (t) {
    mt(t, Hr);
  }
}
let Te = null;
function ps(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var r = t[n++];
      if ((r.f & (rt | fe)) === 0 && rr(r) && (Te = /* @__PURE__ */ new Set(), An(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ha(r), (Te == null ? void 0 : Te.size) > 0)) {
        wt.clear();
        for (const i of Te) {
          if ((i.f & (rt | fe)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Te.has(a) && (Te.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (rt | fe)) === 0 && An(l);
          }
        }
        Te.clear();
      }
    }
    Te = null;
  }
}
function ga(t, e, n, r) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const i of t.reactions) {
      const s = i.f;
      (s & Q) !== 0 ? ga(
        /** @type {Derived} */
        i,
        e,
        n,
        r
      ) : (s & (Ri | st)) !== 0 && (s & Z) === 0 && ma(i, e, r) && (B(i, Z), De(
        /** @type {Effect} */
        i
      ));
    }
}
function ma(t, e, n) {
  const r = n.get(t);
  if (r !== void 0) return r;
  if (t.deps !== null)
    for (const i of t.deps) {
      if (yn.call(e, i))
        return !0;
      if ((i.f & Q) !== 0 && ma(
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
function De(t) {
  var e = Hr = t, n = e.b;
  if (n != null && n.is_pending && (t.f & (tr | Dr | sa)) !== 0 && (t.f & Ot) === 0) {
    n.defer_effect(t);
    return;
  }
  for (; e.parent !== null; ) {
    e = e.parent;
    var r = e.f;
    if (fi && e === k && (r & st) !== 0 && (r & aa) === 0 && (r & Ot) !== 0)
      return;
    if ((r & (Nt | je)) !== 0) {
      if ((r & W) === 0)
        return;
      e.f ^= W;
    }
  }
  se.push(e);
}
function ya(t, e) {
  if (!((t.f & je) !== 0 && (t.f & W) !== 0)) {
    (t.f & Z) !== 0 ? e.d.push(t) : (t.f & He) !== 0 && e.m.push(t), B(t, W);
    for (var n = t.first; n !== null; )
      ya(n, e), n = n.next;
  }
}
function jl(t) {
  let e = 0, n = Kt(0), r;
  return () => {
    Mi() && (h(n), Hi(() => (e === 0 && (r = Ie(() => t(() => Fn(n)))), e += 1, () => {
      Bt(() => {
        e -= 1, e === 0 && (r == null || r(), r = void 0, Fn(n));
      });
    })));
  };
}
var Fl = bn | Zt;
function ql(t, e, n, r) {
  new Gl(t, e, n, r);
}
var ce, Qn, Ge, Gt, ie, Ue, ue, Ce, Qe, Ut, _t, _n, gn, mn, Ze, Ir, G, ba, wa, Ea, _i, _r, gr, gi;
class Gl {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(e, n, r, i) {
    C(this, G);
    /** @type {Boundary | null} */
    q(this, "parent");
    q(this, "is_pending", !1);
    /**
     * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
     * Inherited from parent boundary, or defaults to identity.
     * @type {(error: unknown) => unknown}
     */
    q(this, "transform_error");
    /** @type {TemplateNode} */
    C(this, ce);
    /** @type {TemplateNode | null} */
    C(this, Qn, L ? I : null);
    /** @type {BoundaryProps} */
    C(this, Ge);
    /** @type {((anchor: Node) => void)} */
    C(this, Gt);
    /** @type {Effect} */
    C(this, ie);
    /** @type {Effect | null} */
    C(this, Ue, null);
    /** @type {Effect | null} */
    C(this, ue, null);
    /** @type {Effect | null} */
    C(this, Ce, null);
    /** @type {DocumentFragment | null} */
    C(this, Qe, null);
    C(this, Ut, 0);
    C(this, _t, 0);
    C(this, _n, !1);
    /** @type {Set<Effect>} */
    C(this, gn, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    C(this, mn, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    C(this, Ze, null);
    C(this, Ir, jl(() => (T(this, Ze, Kt(p(this, Ut))), () => {
      T(this, Ze, null);
    })));
    var s;
    T(this, ce, e), T(this, Ge, n), T(this, Gt, (a) => {
      var o = (
        /** @type {Effect} */
        k
      );
      o.b = this, o.f |= ui, r(a);
    }), this.parent = /** @type {Effect} */
    k.b, this.transform_error = i ?? ((s = this.parent) == null ? void 0 : s.transform_error) ?? ((a) => a), T(this, ie, ji(() => {
      if (L) {
        const a = (
          /** @type {Comment} */
          p(this, Qn)
        );
        wn();
        const o = a.data === kr;
        if (a.data.startsWith(ds)) {
          const c = JSON.parse(a.data.slice(ds.length));
          U(this, G, wa).call(this, c);
        } else o ? U(this, G, Ea).call(this) : U(this, G, ba).call(this);
      } else
        U(this, G, _i).call(this);
    }, Fl)), L && T(this, ce, I);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    pa(e, p(this, gn), p(this, mn));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!p(this, Ge).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(e) {
    U(this, G, gi).call(this, e), T(this, Ut, p(this, Ut) + e), !(!p(this, Ze) || p(this, _n)) && (T(this, _n, !0), Bt(() => {
      T(this, _n, !1), p(this, Ze) && $n(p(this, Ze), p(this, Ut));
    }));
  }
  get_effect_pending() {
    return p(this, Ir).call(this), h(
      /** @type {Source<number>} */
      p(this, Ze)
    );
  }
  /** @param {unknown} error */
  error(e) {
    var n = p(this, Ge).onerror;
    let r = p(this, Ge).failed;
    if (!n && !r)
      throw e;
    p(this, Ue) && (re(p(this, Ue)), T(this, Ue, null)), p(this, ue) && (re(p(this, ue)), T(this, ue, null)), p(this, Ce) && (re(p(this, Ce)), T(this, Ce, null)), L && (ne(
      /** @type {TemplateNode} */
      p(this, Qn)
    ), Ll(), ne(Sr()));
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        Il();
        return;
      }
      i = !0, s && Rl(), p(this, Ce) !== null && Vt(p(this, Ce), () => {
        T(this, Ce, null);
      }), U(this, G, gr).call(this, () => {
        it.ensure(), U(this, G, _i).call(this);
      });
    }, o = (l) => {
      try {
        s = !0, n == null || n(l, a), s = !1;
      } catch (c) {
        mt(c, p(this, ie) && p(this, ie).parent);
      }
      r && T(this, Ce, U(this, G, gr).call(this, () => {
        it.ensure();
        try {
          return be(() => {
            var c = (
              /** @type {Effect} */
              k
            );
            c.b = this, c.f |= ui, r(
              p(this, ce),
              () => l,
              () => a
            );
          });
        } catch (c) {
          return mt(
            c,
            /** @type {Effect} */
            p(this, ie).parent
          ), null;
        }
      }));
    };
    Bt(() => {
      var l;
      try {
        l = this.transform_error(e);
      } catch (c) {
        mt(c, p(this, ie) && p(this, ie).parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        o,
        /** @param {unknown} e */
        (c) => mt(c, p(this, ie) && p(this, ie).parent)
      ) : o(l);
    });
  }
}
ce = new WeakMap(), Qn = new WeakMap(), Ge = new WeakMap(), Gt = new WeakMap(), ie = new WeakMap(), Ue = new WeakMap(), ue = new WeakMap(), Ce = new WeakMap(), Qe = new WeakMap(), Ut = new WeakMap(), _t = new WeakMap(), _n = new WeakMap(), gn = new WeakMap(), mn = new WeakMap(), Ze = new WeakMap(), Ir = new WeakMap(), G = new WeakSet(), ba = function() {
  try {
    T(this, Ue, be(() => p(this, Gt).call(this, p(this, ce))));
  } catch (e) {
    this.error(e);
  }
}, /**
 * @param {unknown} error The deserialized error from the server's hydration comment
 */
wa = function(e) {
  const n = p(this, Ge).failed;
  n && T(this, Ce, be(() => {
    n(
      p(this, ce),
      () => e,
      () => () => {
      }
    );
  }));
}, Ea = function() {
  const e = p(this, Ge).pending;
  e && (this.is_pending = !0, T(this, ue, be(() => e(p(this, ce)))), Bt(() => {
    var n = T(this, Qe, document.createDocumentFragment()), r = Ee();
    n.append(r), T(this, Ue, U(this, G, gr).call(this, () => (it.ensure(), be(() => p(this, Gt).call(this, r))))), p(this, _t) === 0 && (p(this, ce).before(n), T(this, Qe, null), Vt(
      /** @type {Effect} */
      p(this, ue),
      () => {
        T(this, ue, null);
      }
    ), U(this, G, _r).call(this));
  }));
}, _i = function() {
  try {
    if (this.is_pending = this.has_pending_snippet(), T(this, _t, 0), T(this, Ut, 0), T(this, Ue, be(() => {
      p(this, Gt).call(this, p(this, ce));
    })), p(this, _t) > 0) {
      var e = T(this, Qe, document.createDocumentFragment());
      qa(p(this, Ue), e);
      const n = (
        /** @type {(anchor: Node) => void} */
        p(this, Ge).pending
      );
      T(this, ue, be(() => n(p(this, ce))));
    } else
      U(this, G, _r).call(this);
  } catch (n) {
    this.error(n);
  }
}, _r = function() {
  this.is_pending = !1;
  for (const e of p(this, gn))
    B(e, Z), De(e);
  for (const e of p(this, mn))
    B(e, He), De(e);
  p(this, gn).clear(), p(this, mn).clear();
}, /**
 * @template T
 * @param {() => T} fn
 */
gr = function(e) {
  var n = k, r = R, i = he;
  Ae(p(this, ie)), oe(p(this, ie)), En(p(this, ie).ctx);
  try {
    return e();
  } catch (s) {
    return fa(s), null;
  } finally {
    Ae(n), oe(r), En(i);
  }
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
gi = function(e) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && U(n = this.parent, G, gi).call(n, e);
    return;
  }
  T(this, _t, p(this, _t) + e), p(this, _t) === 0 && (U(this, G, _r).call(this), p(this, ue) && Vt(p(this, ue), () => {
    T(this, ue, null);
  }), p(this, Qe) && (p(this, ce).before(p(this, Qe)), T(this, Qe, null)));
};
function Ul(t, e, n, r) {
  const i = jr;
  var s = t.filter((f) => !f.settled);
  if (n.length === 0 && s.length === 0) {
    r(e.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    k
  ), o = zl(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((f) => f.promise)) : null;
  function c(f) {
    o();
    try {
      r(f);
    } catch (m) {
      (a.f & rt) === 0 && mt(m, a);
    }
    mi();
  }
  if (n.length === 0) {
    l.then(() => c(e.map(i)));
    return;
  }
  function u() {
    o(), Promise.all(n.map((f) => /* @__PURE__ */ Vl(f))).then((f) => c([...e.map(i), ...f])).catch((f) => mt(f, a));
  }
  l ? l.then(u) : u();
}
function zl() {
  var t = k, e = R, n = he, r = P;
  return function(s = !0) {
    Ae(t), oe(e), En(n), s && (r == null || r.activate());
  };
}
function mi(t = !0) {
  Ae(null), oe(null), En(null), t && (P == null || P.deactivate());
}
function Bl() {
  var t = (
    /** @type {Boundary} */
    /** @type {Effect} */
    k.b
  ), e = (
    /** @type {Batch} */
    P
  ), n = t.is_rendered();
  return t.update_pending_count(1), e.increment(n), () => {
    t.update_pending_count(-1), e.decrement(n);
  };
}
// @__NO_SIDE_EFFECTS__
function jr(t) {
  var e = Q | Z, n = R !== null && (R.f & Q) !== 0 ? (
    /** @type {Derived} */
    R
  ) : null;
  return k !== null && (k.f |= Zt), {
    ctx: he,
    deps: null,
    effects: null,
    equals: la,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      K
    ),
    wv: 0,
    parent: n ?? k,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Vl(t, e, n) {
  /** @type {Effect | null} */
  k === null && wl();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Kt(
    /** @type {V} */
    K
  ), a = !R, o = /* @__PURE__ */ new Map();
  return rc(() => {
    var m;
    var l = ia();
    i = l.promise;
    try {
      Promise.resolve(t()).then(l.resolve, l.reject).finally(mi);
    } catch (w) {
      l.reject(w), mi();
    }
    var c = (
      /** @type {Batch} */
      P
    );
    if (a) {
      var u = Bl();
      (m = o.get(c)) == null || m.reject(Pt), o.delete(c), o.set(c, l);
    }
    const f = (w, _ = void 0) => {
      if (c.activate(), _)
        _ !== Pt && (s.f |= bt, $n(s, _));
      else {
        (s.f & bt) !== 0 && (s.f ^= bt), $n(s, w);
        for (const [A, d] of o) {
          if (o.delete(A), A === c) break;
          d.reject(Pt);
        }
      }
      u && u();
    };
    l.promise.then(f, (w) => f(null, w || "unknown"));
  }), ec(() => {
    for (const l of o.values())
      l.reject(Pt);
  }), new Promise((l) => {
    function c(u) {
      function f() {
        u === i ? l(s) : c(i);
      }
      u.then(f, f);
    }
    c(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Ln(t) {
  const e = /* @__PURE__ */ jr(t);
  return Ga(e), e;
}
// @__NO_SIDE_EFFECTS__
function Wl(t) {
  const e = /* @__PURE__ */ jr(t);
  return e.equals = ca, e;
}
function Yl(t) {
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
function Jl(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Q) === 0)
      return (e.f & rt) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function Pi(t) {
  var e, n = k;
  Ae(Jl(t));
  try {
    t.f &= ~Bn, Yl(t), e = Va(t);
  } finally {
    Ae(n);
  }
  return e;
}
function $a(t) {
  var e = Pi(t);
  if (!t.equals(e) && (t.wv = za(), (!(P != null && P.is_fork) || t.deps === null) && (t.v = e, t.deps === null))) {
    B(t, W);
    return;
  }
  St || (X !== null ? (Mi() || P != null && P.is_fork) && X.set(t, e) : ki(t));
}
function Kl(t) {
  var e, n;
  if (t.effects !== null)
    for (const r of t.effects)
      (r.teardown || r.ac) && ((e = r.teardown) == null || e.call(r), (n = r.ac) == null || n.abort(Pt), r.teardown = pl, r.ac = null, Vn(r, 0), Fi(r));
}
function Aa(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && An(e);
}
let yi = /* @__PURE__ */ new Set();
const wt = /* @__PURE__ */ new Map();
let Oa = !1;
function Kt(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: la,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function M(t, e) {
  const n = Kt(t);
  return Ga(n), n;
}
// @__NO_SIDE_EFFECTS__
function Sa(t, e = !1, n = !0) {
  const r = Kt(t);
  return e || (r.equals = ca), r;
}
function O(t, e, n = !1) {
  R !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Me || (R.f & hs) !== 0) && ua() && (R.f & (Q | st | Ri | hs)) !== 0 && ($e === null || !yn.call($e, t)) && Cl();
  let r = n ? tt(e) : e;
  return $n(t, r);
}
function $n(t, e) {
  if (!t.equals(e)) {
    var n = t.v;
    St ? wt.set(t, e) : wt.set(t, n), t.v = e;
    var r = it.ensure();
    if (r.capture(t, n), (t.f & Q) !== 0) {
      const i = (
        /** @type {Derived} */
        t
      );
      (t.f & Z) !== 0 && Pi(i), ki(i);
    }
    t.wv = za(), xa(t, Z), k !== null && (k.f & W) !== 0 && (k.f & (je | Nt)) === 0 && (_e === null ? sc([t]) : _e.push(t)), !r.is_fork && yi.size > 0 && !Oa && Xl();
  }
  return e;
}
function Xl() {
  Oa = !1;
  for (const t of yi)
    (t.f & W) !== 0 && B(t, He), rr(t) && An(t);
  yi.clear();
}
function Fn(t) {
  O(t, t.v + 1);
}
function xa(t, e) {
  var n = t.reactions;
  if (n !== null)
    for (var r = n.length, i = 0; i < r; i++) {
      var s = n[i], a = s.f, o = (a & Z) === 0;
      if (o && B(s, e), (a & Q) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        X == null || X.delete(l), (a & Bn) === 0 && (a & we && (s.f |= Bn), xa(l, He));
      } else o && ((a & st) !== 0 && Te !== null && Te.add(
        /** @type {Effect} */
        s
      ), De(
        /** @type {Effect} */
        s
      ));
    }
}
function tt(t) {
  if (typeof t != "object" || t === null || vr in t)
    return t;
  const e = ra(t);
  if (e !== fl && e !== hl)
    return t;
  var n = /* @__PURE__ */ new Map(), r = na(t), i = /* @__PURE__ */ M(0), s = Wt, a = (o) => {
    if (Wt === s)
      return o();
    var l = R, c = Wt;
    oe(null), ms(s);
    var u = o();
    return oe(l), ms(c), u;
  };
  return r && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Tl();
        var u = n.get(l);
        return u === void 0 ? a(() => {
          var f = /* @__PURE__ */ M(c.value);
          return n.set(l, f), f;
        }) : O(u, c.value, !0), !0;
      },
      deleteProperty(o, l) {
        var c = n.get(l);
        if (c === void 0) {
          if (l in o) {
            const u = a(() => /* @__PURE__ */ M(K));
            n.set(l, u), Fn(i);
          }
        } else
          O(c, K), Fn(i);
        return !0;
      },
      get(o, l, c) {
        var w;
        if (l === vr)
          return t;
        var u = n.get(l), f = l in o;
        if (u === void 0 && (!f || (w = un(o, l)) != null && w.writable) && (u = a(() => {
          var _ = tt(f ? o[l] : K), A = /* @__PURE__ */ M(_);
          return A;
        }), n.set(l, u)), u !== void 0) {
          var m = h(u);
          return m === K ? void 0 : m;
        }
        return Reflect.get(o, l, c);
      },
      getOwnPropertyDescriptor(o, l) {
        var c = Reflect.getOwnPropertyDescriptor(o, l);
        if (c && "value" in c) {
          var u = n.get(l);
          u && (c.value = h(u));
        } else if (c === void 0) {
          var f = n.get(l), m = f == null ? void 0 : f.v;
          if (f !== void 0 && m !== K)
            return {
              enumerable: !0,
              configurable: !0,
              value: m,
              writable: !0
            };
        }
        return c;
      },
      has(o, l) {
        var m;
        if (l === vr)
          return !0;
        var c = n.get(l), u = c !== void 0 && c.v !== K || Reflect.has(o, l);
        if (c !== void 0 || k !== null && (!u || (m = un(o, l)) != null && m.writable)) {
          c === void 0 && (c = a(() => {
            var w = u ? tt(o[l]) : K, _ = /* @__PURE__ */ M(w);
            return _;
          }), n.set(l, c));
          var f = h(c);
          if (f === K)
            return !1;
        }
        return u;
      },
      set(o, l, c, u) {
        var b;
        var f = n.get(l), m = l in o;
        if (r && l === "length")
          for (var w = c; w < /** @type {Source<number>} */
          f.v; w += 1) {
            var _ = n.get(w + "");
            _ !== void 0 ? O(_, K) : w in o && (_ = a(() => /* @__PURE__ */ M(K)), n.set(w + "", _));
          }
        if (f === void 0)
          (!m || (b = un(o, l)) != null && b.writable) && (f = a(() => /* @__PURE__ */ M(void 0)), O(f, tt(c)), n.set(l, f));
        else {
          m = f.v !== K;
          var A = a(() => tt(c));
          O(f, A);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d != null && d.set && d.set.call(u, c), !m) {
          if (r && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), g = Number(l);
            Number.isInteger(g) && g >= v.v && O(v, g + 1);
          }
          Fn(i);
        }
        return !0;
      },
      ownKeys(o) {
        h(i);
        var l = Reflect.ownKeys(o).filter((f) => {
          var m = n.get(f);
          return m === void 0 || m.v !== K;
        });
        for (var [c, u] of n)
          u.v !== K && !(c in o) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        Nl();
      }
    }
  );
}
var vs, Ta, Na, Ca;
function bi() {
  if (vs === void 0) {
    vs = window, Ta = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    Na = un(e, "firstChild").get, Ca = un(e, "nextSibling").get, fs(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), fs(n) && (n.__t = void 0);
  }
}
function Ee(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Be(t) {
  return (
    /** @type {TemplateNode | null} */
    Na.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function Fe(t) {
  return (
    /** @type {TemplateNode | null} */
    Ca.call(t)
  );
}
function ut(t, e) {
  if (!L)
    return /* @__PURE__ */ Be(t);
  var n = /* @__PURE__ */ Be(I);
  if (n === null)
    n = I.appendChild(Ee());
  else if (e && n.nodeType !== Mr) {
    var r = Ee();
    return n == null || n.before(r), ne(r), r;
  }
  return e && Di(
    /** @type {Text} */
    n
  ), ne(n), n;
}
function _s(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Be(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Fe(n) : n;
  }
  if (e) {
    if ((I == null ? void 0 : I.nodeType) !== Mr) {
      var r = Ee();
      return I == null || I.before(r), ne(r), r;
    }
    Di(
      /** @type {Text} */
      I
    );
  }
  return I;
}
function It(t, e = 1, n = !1) {
  let r = L ? I : t;
  for (var i; e--; )
    i = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Fe(r);
  if (!L)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== Mr) {
      var s = Ee();
      return r === null ? i == null || i.after(s) : r.before(s), ne(s), s;
    }
    Di(
      /** @type {Text} */
      r
    );
  }
  return ne(r), r;
}
function Ra(t) {
  t.textContent = "";
}
function Ia() {
  return !1;
}
function Fr(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(e ?? ta, t, void 0)
  );
}
function Di(t) {
  if (
    /** @type {string} */
    t.nodeValue.length < 65536
  )
    return;
  let e = t.nextSibling;
  for (; e !== null && e.nodeType === Mr; )
    e.remove(), t.nodeValue += /** @type {string} */
    e.nodeValue, e = t.nextSibling;
}
function La(t) {
  var e = R, n = k;
  oe(null), Ae(null);
  try {
    return t();
  } finally {
    oe(e), Ae(n);
  }
}
function Ql(t) {
  k === null && (R === null && Ol(), Al()), St && $l();
}
function Zl(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Ve(t, e, n) {
  var r = k;
  r !== null && (r.f & fe) !== 0 && (t |= fe);
  var i = {
    ctx: he,
    deps: null,
    nodes: null,
    f: t | Z | we,
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
      An(i);
    } catch (o) {
      throw re(i), o;
    }
  else e !== null && De(i);
  var s = i;
  if (n && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Zt) === 0 && (s = s.first, (t & st) !== 0 && (t & bn) !== 0 && s !== null && (s.f |= bn)), s !== null && (s.parent = r, r !== null && Zl(s, r), R !== null && (R.f & Q) !== 0 && (t & Nt) === 0)) {
    var a = (
      /** @type {Derived} */
      R
    );
    (a.effects ?? (a.effects = [])).push(s);
  }
  return i;
}
function Mi() {
  return R !== null && !Me;
}
function ec(t) {
  const e = Ve(Dr, null, !1);
  return B(e, W), e.teardown = t, e;
}
function dn(t) {
  Ql();
  var e = (
    /** @type {Effect} */
    k.f
  ), n = !R && (e & je) !== 0 && (e & Ot) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      he
    );
    (r.e ?? (r.e = [])).push(t);
  } else
    return ka(t);
}
function ka(t) {
  return Ve(tr | _l, t, !1);
}
function tc(t) {
  it.ensure();
  const e = Ve(Nt | Zt, t, !0);
  return () => {
    re(e);
  };
}
function nc(t) {
  it.ensure();
  const e = Ve(Nt | Zt, t, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? Vt(e, () => {
      re(e), r(void 0);
    }) : (re(e), r(void 0));
  });
}
function Pa(t) {
  return Ve(tr, t, !1);
}
function rc(t) {
  return Ve(Ri | Zt, t, !0);
}
function Hi(t, e = 0) {
  return Ve(Dr | e, t, !0);
}
function Je(t, e = [], n = [], r = []) {
  Ul(r, e, n, (i) => {
    Ve(Dr, () => t(...i.map(h)), !0);
  });
}
function ji(t, e = 0) {
  var n = Ve(st | e, t, !0);
  return n;
}
function be(t) {
  return Ve(je | Zt, t, !0);
}
function Da(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = St, r = R;
    gs(!0), oe(null);
    try {
      e.call(null);
    } finally {
      gs(n), oe(r);
    }
  }
}
function Fi(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && La(() => {
      i.abort(Pt);
    });
    var r = n.next;
    (n.f & Nt) !== 0 ? n.parent = null : re(n, e), n = r;
  }
}
function ic(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & je) === 0 && re(e), e = n;
  }
}
function re(t, e = !0) {
  var n = !1;
  (e || (t.f & aa) !== 0) && t.nodes !== null && t.nodes.end !== null && (Ma(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), Fi(t, e && !n), Vn(t, 0), B(t, rt);
  var r = t.nodes && t.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Da(t);
  var i = t.parent;
  i !== null && i.first !== null && Ha(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = null;
}
function Ma(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ Fe(t);
    t.remove(), t = n;
  }
}
function Ha(t) {
  var e = t.parent, n = t.prev, r = t.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), e !== null && (e.first === t && (e.first = r), e.last === t && (e.last = n));
}
function Vt(t, e, n = !0) {
  var r = [];
  ja(t, r, !0);
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
function ja(t, e, n) {
  if ((t.f & fe) === 0) {
    t.f ^= fe;
    var r = t.nodes && t.nodes.t;
    if (r !== null)
      for (const o of r)
        (o.is_global || n) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var s = i.next, a = (i.f & bn) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & je) !== 0 && (t.f & st) !== 0;
      ja(i, e, a ? n : !1), i = s;
    }
  }
}
function qi(t) {
  Fa(t, !0);
}
function Fa(t, e) {
  if ((t.f & fe) !== 0) {
    t.f ^= fe, (t.f & W) === 0 && (B(t, Z), De(t));
    for (var n = t.first; n !== null; ) {
      var r = n.next, i = (n.f & bn) !== 0 || (n.f & je) !== 0;
      Fa(n, i ? e : !1), n = r;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || e) && a.in();
  }
}
function qa(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, r = t.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Fe(n);
      e.append(n), n = i;
    }
}
let mr = !1, St = !1;
function gs(t) {
  St = t;
}
let R = null, Me = !1;
function oe(t) {
  R = t;
}
let k = null;
function Ae(t) {
  k = t;
}
let $e = null;
function Ga(t) {
  R !== null && ($e === null ? $e = [t] : $e.push(t));
}
let ae = null, le = 0, _e = null;
function sc(t) {
  _e = t;
}
let Ua = 1, Mt = 0, Wt = Mt;
function ms(t) {
  Wt = t;
}
function za() {
  return ++Ua;
}
function rr(t) {
  var e = t.f;
  if ((e & Z) !== 0)
    return !0;
  if (e & Q && (t.f &= -65537), (e & He) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (rr(
        /** @type {Derived} */
        s
      ) && $a(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & we) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    X === null && B(t, W);
  }
  return !1;
}
function Ba(t, e, n = !0) {
  var r = t.reactions;
  if (r !== null && !($e !== null && yn.call($e, t)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & Q) !== 0 ? Ba(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (n ? B(s, Z) : (s.f & W) !== 0 && B(s, He), De(
        /** @type {Effect} */
        s
      ));
    }
}
function Va(t) {
  var A;
  var e = ae, n = le, r = _e, i = R, s = $e, a = he, o = Me, l = Wt, c = t.f;
  ae = /** @type {null | Value[]} */
  null, le = 0, _e = null, R = (c & (je | Nt)) === 0 ? t : null, $e = null, En(t.ctx), Me = !1, Wt = ++Mt, t.ac !== null && (La(() => {
    t.ac.abort(Pt);
  }), t.ac = null);
  try {
    t.f |= di;
    var u = (
      /** @type {Function} */
      t.fn
    ), f = u();
    t.f |= Ot;
    var m = t.deps, w = P == null ? void 0 : P.is_fork;
    if (ae !== null) {
      var _;
      if (w || Vn(t, le), m !== null && le > 0)
        for (m.length = le + ae.length, _ = 0; _ < ae.length; _++)
          m[le + _] = ae[_];
      else
        t.deps = m = ae;
      if (Mi() && (t.f & we) !== 0)
        for (_ = le; _ < m.length; _++)
          ((A = m[_]).reactions ?? (A.reactions = [])).push(t);
    } else !w && m !== null && le < m.length && (Vn(t, le), m.length = le);
    if (ua() && _e !== null && !Me && m !== null && (t.f & (Q | He | Z)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      _e.length; _++)
        Ba(
          _e[_],
          /** @type {Effect} */
          t
        );
    if (i !== null && i !== t) {
      if (Mt++, i.deps !== null)
        for (let d = 0; d < n; d += 1)
          i.deps[d].rv = Mt;
      if (e !== null)
        for (const d of e)
          d.rv = Mt;
      _e !== null && (r === null ? r = _e : r.push(.../** @type {Source[]} */
      _e));
    }
    return (t.f & bt) !== 0 && (t.f ^= bt), f;
  } catch (d) {
    return fa(d);
  } finally {
    t.f ^= di, ae = e, le = n, _e = r, R = i, $e = s, En(a), Me = o, Wt = l;
  }
}
function ac(t, e) {
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
    (s.f & we) !== 0 && (s.f ^= we, s.f &= -65537), ki(s), Kl(s), Vn(s, 0);
  }
}
function Vn(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var r = e; r < n.length; r++)
      ac(t, n[r]);
}
function An(t) {
  var e = t.f;
  if ((e & rt) === 0) {
    B(t, W);
    var n = k, r = mr;
    k = t, mr = !0;
    try {
      (e & (st | sa)) !== 0 ? ic(t) : Fi(t), Da(t);
      var i = Va(t);
      t.teardown = typeof i == "function" ? i : null, t.wv = Ua;
      var s;
      ci && Pl && (t.f & Z) !== 0 && t.deps;
    } finally {
      mr = r, k = n;
    }
  }
}
function h(t) {
  var e = t.f, n = (e & Q) !== 0;
  if (R !== null && !Me) {
    var r = k !== null && (k.f & rt) !== 0;
    if (!r && ($e === null || !yn.call($e, t))) {
      var i = R.deps;
      if ((R.f & di) !== 0)
        t.rv < Mt && (t.rv = Mt, ae === null && i !== null && i[le] === t ? le++ : ae === null ? ae = [t] : ae.push(t));
      else {
        (R.deps ?? (R.deps = [])).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [R] : yn.call(s, R) || s.push(R);
      }
    }
  }
  if (St && wt.has(t))
    return wt.get(t);
  if (n) {
    var a = (
      /** @type {Derived} */
      t
    );
    if (St) {
      var o = a.v;
      return ((a.f & W) === 0 && a.reactions !== null || Ya(a)) && (o = Pi(a)), wt.set(a, o), o;
    }
    var l = (a.f & we) === 0 && !Me && R !== null && (mr || (R.f & we) !== 0), c = (a.f & Ot) === 0;
    rr(a) && (l && (a.f |= we), $a(a)), l && !c && (Aa(a), Wa(a));
  }
  if (X != null && X.has(t))
    return X.get(t);
  if ((t.f & bt) !== 0)
    throw t.v;
  return t.v;
}
function Wa(t) {
  if (t.f |= we, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & Q) !== 0 && (e.f & we) === 0 && (Aa(
        /** @type {Derived} */
        e
      ), Wa(
        /** @type {Derived} */
        e
      ));
}
function Ya(t) {
  if (t.v === K) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (wt.has(e) || (e.f & Q) !== 0 && Ya(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Ie(t) {
  var e = Me;
  try {
    return Me = !0, t();
  } finally {
    Me = e;
  }
}
const Ht = Symbol("events"), Ja = /* @__PURE__ */ new Set(), wi = /* @__PURE__ */ new Set();
function Yr(t, e, n) {
  (e[Ht] ?? (e[Ht] = {}))[t] = n;
}
function oc(t) {
  for (var e = 0; e < t.length; e++)
    Ja.add(t[e]);
  for (var n of wi)
    n(t);
}
let ys = null;
function bs(t) {
  var d, v;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), r = t.type, i = ((d = t.composedPath) == null ? void 0 : d.call(t)) || [], s = (
    /** @type {null | Element} */
    i[0] || t.target
  );
  ys = t;
  var a = 0, o = ys === t && t[Ht];
  if (o) {
    var l = i.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t[Ht] = e;
      return;
    }
    var c = i.indexOf(e);
    if (c === -1)
      return;
    l <= c && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || t.target, s !== e) {
    Or(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var u = R, f = k;
    oe(null), Ae(null);
    try {
      for (var m, w = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var A = (v = s[Ht]) == null ? void 0 : v[r];
          A != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s) && A.call(s, t);
        } catch (g) {
          m ? w.push(g) : m = g;
        }
        if (t.cancelBubble || _ === e || _ === null)
          break;
        s = _;
      }
      if (m) {
        for (let g of w)
          queueMicrotask(() => {
            throw g;
          });
        throw m;
      }
    } finally {
      t[Ht] = e, delete t.currentTarget, oe(u), Ae(f);
    }
  }
}
var Zs;
const Jr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  ((Zs = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Zs.trustedTypes) && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function lc(t) {
  return (
    /** @type {string} */
    (Jr == null ? void 0 : Jr.createHTML(t)) ?? t
  );
}
function cc(t) {
  var e = Fr("template");
  return e.innerHTML = lc(t.replaceAll("<!>", "<!---->")), e.content;
}
function Et(t, e) {
  var n = (
    /** @type {Effect} */
    k
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function at(t, e) {
  var n = (e & al) !== 0, r = (e & ol) !== 0, i, s = !t.startsWith("<!>");
  return () => {
    if (L)
      return Et(I, null), I;
    i === void 0 && (i = cc(s ? t : "<!>" + t), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(i)));
    var a = (
      /** @type {TemplateNode} */
      r || Ta ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Be(a)
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
function ws() {
  if (L)
    return Et(I, null), I;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = Ee();
  return t.append(e, n), Et(e, n), t;
}
function ge(t, e) {
  if (L) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      k
    );
    ((n.f & Ot) === 0 || n.nodes.end === null) && (n.nodes.end = I), wn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const uc = ["touchstart", "touchmove"];
function dc(t) {
  return uc.includes(t);
}
function fc(t, e) {
  var n = e == null ? "" : typeof e == "object" ? `${e}` : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = `${n}`);
}
function Ka(t, e) {
  return Xa(t, e);
}
function hc(t, e) {
  bi(), e.intro = e.intro ?? !1;
  const n = e.target, r = L, i = I;
  try {
    for (var s = /* @__PURE__ */ Be(n); s && (s.nodeType !== xn || /** @type {Comment} */
    s.data !== Ni); )
      s = /* @__PURE__ */ Fe(s);
    if (!s)
      throw Jt;
    Pe(!0), ne(
      /** @type {Comment} */
      s
    );
    const a = Xa(t, { ...e, anchor: s });
    return Pe(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== Jt && console.warn("Failed to hydrate: ", a), e.recover === !1 && xl(), bi(), Ra(n), Pe(!1), Ka(t, e);
  } finally {
    Pe(r), ne(i);
  }
}
const ur = /* @__PURE__ */ new Map();
function Xa(t, { target: e, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: o }) {
  bi();
  var l = void 0, c = nc(() => {
    var u = n ?? e.appendChild(Ee());
    ql(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (w) => {
        Ii({});
        var _ = (
          /** @type {ComponentContext} */
          he
        );
        if (s && (_.c = s), i && (r.$$events = i), L && Et(
          /** @type {TemplateNode} */
          w,
          null
        ), l = t(w, r) || {}, L && (k.nodes.end = I, I === null || I.nodeType !== xn || /** @type {Comment} */
        I.data !== Ci))
          throw nr(), Jt;
        Li();
      },
      o
    );
    var f = /* @__PURE__ */ new Set(), m = (w) => {
      for (var _ = 0; _ < w.length; _++) {
        var A = w[_];
        if (!f.has(A)) {
          f.add(A);
          var d = dc(A);
          for (const b of [e, document]) {
            var v = ur.get(b);
            v === void 0 && (v = /* @__PURE__ */ new Map(), ur.set(b, v));
            var g = v.get(A);
            g === void 0 ? (b.addEventListener(A, bs, { passive: d }), v.set(A, 1)) : v.set(A, g + 1);
          }
        }
      }
    };
    return m(Pr(Ja)), wi.add(m), () => {
      var d;
      for (var w of f)
        for (const v of [e, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            ur.get(v)
          ), A = (
            /** @type {number} */
            _.get(w)
          );
          --A == 0 ? (v.removeEventListener(w, bs), _.delete(w), _.size === 0 && ur.delete(v)) : _.set(w, A);
        }
      wi.delete(m), u !== n && ((d = u.parentNode) == null || d.removeChild(u));
    };
  });
  return Ei.set(l, c), l;
}
let Ei = /* @__PURE__ */ new WeakMap();
function pc(t, e) {
  const n = Ei.get(t);
  return n ? (Ei.delete(t), n(e)) : Promise.resolve();
}
var Re, ze, de, zt, Zn, er, Lr;
class vc {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    q(this, "anchor");
    /** @type {Map<Batch, Key>} */
    C(this, Re, /* @__PURE__ */ new Map());
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
    C(this, ze, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    C(this, de, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    C(this, zt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    C(this, Zn, !0);
    C(this, er, () => {
      var e = (
        /** @type {Batch} */
        P
      );
      if (p(this, Re).has(e)) {
        var n = (
          /** @type {Key} */
          p(this, Re).get(e)
        ), r = p(this, ze).get(n);
        if (r)
          qi(r), p(this, zt).delete(n);
        else {
          var i = p(this, de).get(n);
          i && (p(this, ze).set(n, i.effect), p(this, de).delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
        }
        for (const [s, a] of p(this, Re)) {
          if (p(this, Re).delete(s), s === e)
            break;
          const o = p(this, de).get(a);
          o && (re(o.effect), p(this, de).delete(a));
        }
        for (const [s, a] of p(this, ze)) {
          if (s === n || p(this, zt).has(s)) continue;
          const o = () => {
            if (Array.from(p(this, Re).values()).includes(s)) {
              var c = document.createDocumentFragment();
              qa(a, c), c.append(Ee()), p(this, de).set(s, { effect: a, fragment: c });
            } else
              re(a);
            p(this, zt).delete(s), p(this, ze).delete(s);
          };
          p(this, Zn) || !r ? (p(this, zt).add(s), Vt(a, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    C(this, Lr, (e) => {
      p(this, Re).delete(e);
      const n = Array.from(p(this, Re).values());
      for (const [r, i] of p(this, de))
        n.includes(r) || (re(i.effect), p(this, de).delete(r));
    });
    this.anchor = e, T(this, Zn, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, n) {
    var r = (
      /** @type {Batch} */
      P
    ), i = Ia();
    if (n && !p(this, ze).has(e) && !p(this, de).has(e))
      if (i) {
        var s = document.createDocumentFragment(), a = Ee();
        s.append(a), p(this, de).set(e, {
          effect: be(() => n(a)),
          fragment: s
        });
      } else
        p(this, ze).set(
          e,
          be(() => n(this.anchor))
        );
    if (p(this, Re).set(r, e), i) {
      for (const [o, l] of p(this, ze))
        o === e ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [o, l] of p(this, de))
        o === e ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(p(this, er)), r.ondiscard(p(this, Lr));
    } else
      L && (this.anchor = I), p(this, er).call(this);
  }
}
Re = new WeakMap(), ze = new WeakMap(), de = new WeakMap(), zt = new WeakMap(), Zn = new WeakMap(), er = new WeakMap(), Lr = new WeakMap();
function Qa(t) {
  he === null && bl(), dn(() => {
    const e = Ie(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function dt(t, e, n = !1) {
  L && wn();
  var r = new vc(t), i = n ? bn : 0;
  function s(a, o) {
    if (L) {
      const u = oa(t);
      var l;
      if (u === Ni ? l = 0 : u === kr ? l = !1 : l = parseInt(u.substring(1)), a !== l) {
        var c = Sr();
        ne(c), r.anchor = c, Pe(!1), r.ensure(a, o), Pe(!0);
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
function _c(t, e, n) {
  for (var r = [], i = e.length, s, a = e.length, o = 0; o < i; o++) {
    let f = e[o];
    Vt(
      f,
      () => {
        if (s) {
          if (s.pending.delete(f), s.done.add(f), s.pending.size === 0) {
            var m = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            $i(Pr(s.done)), m.delete(s), m.size === 0 && (t.outrogroups = null);
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
      var c = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        c.parentNode
      );
      Ra(u), u.append(c), t.items.clear();
    }
    $i(e, !l);
  } else
    s = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function $i(t, e = !0) {
  for (var n = 0; n < t.length; n++)
    re(t[n], e);
}
var Es;
function gc(t, e, n, r, i, s = null) {
  var a = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    a = L ? ne(/* @__PURE__ */ Be(l)) : l.appendChild(Ee());
  }
  L && wn();
  var c = null, u = /* @__PURE__ */ Wl(() => {
    var d = n();
    return na(d) ? d : d == null ? [] : Pr(d);
  }), f, m = !0;
  function w() {
    A.fallback = c, mc(A, f, a, e, r), c !== null && (f.length === 0 ? (c.f & gt) === 0 ? qi(c) : (c.f ^= gt, Mn(c, null, a)) : Vt(c, () => {
      c = null;
    }));
  }
  var _ = ji(() => {
    f = /** @type {V[]} */
    h(u);
    var d = f.length;
    let v = !1;
    if (L) {
      var g = oa(a) === kr;
      g !== (d === 0) && (a = Sr(), ne(a), Pe(!1), v = !0);
    }
    for (var b = /* @__PURE__ */ new Set(), S = (
      /** @type {Batch} */
      P
    ), x = Ia(), N = 0; N < d; N += 1) {
      L && I.nodeType === xn && /** @type {Comment} */
      I.data === Ci && (a = /** @type {Comment} */
      I, v = !0, Pe(!1));
      var D = f[N], F = r(D, N), H = m ? null : o.get(F);
      H ? (H.v && $n(H.v, D), H.i && $n(H.i, N), x && S.unskip_effect(H.e)) : (H = yc(
        o,
        m ? a : Es ?? (Es = Ee()),
        D,
        F,
        N,
        i,
        e,
        n
      ), m || (H.e.f |= gt), o.set(F, H)), b.add(F);
    }
    if (d === 0 && s && !c && (m ? c = be(() => s(a)) : (c = be(() => s(Es ?? (Es = Ee()))), c.f |= gt)), d > b.size && El(), L && d > 0 && ne(Sr()), !m)
      if (x) {
        for (const [or, Tn] of o)
          b.has(or) || S.skip_effect(Tn.e);
        S.oncommit(w), S.ondiscard(() => {
        });
      } else
        w();
    v && Pe(!0), h(u);
  }), A = { effect: _, items: o, outrogroups: null, fallback: c };
  m = !1, L && (a = I);
}
function kn(t) {
  for (; t !== null && (t.f & je) === 0; )
    t = t.next;
  return t;
}
function mc(t, e, n, r, i) {
  var F;
  var s = e.length, a = t.items, o = kn(t.effect.first), l, c = null, u = [], f = [], m, w, _, A;
  for (A = 0; A < s; A += 1) {
    if (m = e[A], w = i(m, A), _ = /** @type {EachItem} */
    a.get(w).e, t.outrogroups !== null)
      for (const H of t.outrogroups)
        H.pending.delete(_), H.done.delete(_);
    if ((_.f & gt) !== 0)
      if (_.f ^= gt, _ === o)
        Mn(_, null, n);
      else {
        var d = c ? c.next : o;
        _ === t.effect.last && (t.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), lt(t, c, _), lt(t, _, d), Mn(_, d, n), c = _, u = [], f = [], o = kn(c.next);
        continue;
      }
    if ((_.f & fe) !== 0 && qi(_), _ !== o) {
      if (l !== void 0 && l.has(_)) {
        if (u.length < f.length) {
          var v = f[0], g;
          c = v.prev;
          var b = u[0], S = u[u.length - 1];
          for (g = 0; g < u.length; g += 1)
            Mn(u[g], v, n);
          for (g = 0; g < f.length; g += 1)
            l.delete(f[g]);
          lt(t, b.prev, S.next), lt(t, c, b), lt(t, S, v), o = v, c = S, A -= 1, u = [], f = [];
        } else
          l.delete(_), Mn(_, o, n), lt(t, _.prev, _.next), lt(t, _, c === null ? t.effect.first : c.next), lt(t, c, _), c = _;
        continue;
      }
      for (u = [], f = []; o !== null && o !== _; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), f.push(o), o = kn(o.next);
      if (o === null)
        continue;
    }
    (_.f & gt) === 0 && u.push(_), c = _, o = kn(_.next);
  }
  if (t.outrogroups !== null) {
    for (const H of t.outrogroups)
      H.pending.size === 0 && ($i(Pr(H.done)), (F = t.outrogroups) == null || F.delete(H));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var x = [];
    if (l !== void 0)
      for (_ of l)
        (_.f & fe) === 0 && x.push(_);
    for (; o !== null; )
      (o.f & fe) === 0 && o !== t.fallback && x.push(o), o = kn(o.next);
    var N = x.length;
    if (N > 0) {
      var D = s === 0 ? n : null;
      _c(t, x, D);
    }
  }
}
function yc(t, e, n, r, i, s, a, o) {
  var l = (a & rl) !== 0 ? (a & sl) === 0 ? /* @__PURE__ */ Sa(n, !1, !1) : Kt(n) : null, c = (a & il) !== 0 ? Kt(i) : null;
  return {
    v: l,
    i: c,
    e: be(() => (s(e, l ?? n, c ?? i, o), () => {
      t.delete(r);
    }))
  };
}
function Mn(t, e, n) {
  if (t.nodes)
    for (var r = t.nodes.start, i = t.nodes.end, s = e && (e.f & gt) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; r !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Fe(r)
      );
      if (s.before(r), r === i)
        return;
      r = a;
    }
}
function lt(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function bc(t, e, n = !1, r = !1, i = !1) {
  var s = t, a = "";
  Je(() => {
    var o = (
      /** @type {Effect} */
      k
    );
    if (a === (a = e() ?? "")) {
      L && wn();
      return;
    }
    if (o.nodes !== null && (Ma(
      o.nodes.start,
      /** @type {TemplateNode} */
      o.nodes.end
    ), o.nodes = null), a !== "") {
      if (L) {
        I.data;
        for (var l = wn(), c = l; l !== null && (l.nodeType !== xn || /** @type {Comment} */
        l.data !== ""); )
          c = l, l = /* @__PURE__ */ Fe(l);
        if (l === null)
          throw nr(), Jt;
        Et(I, c), s = ne(l);
        return;
      }
      var u = n ? ll : r ? cl : void 0, f = (
        /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
        Fr(n ? "svg" : r ? "math" : "template", u)
      );
      f.innerHTML = /** @type {any} */
      a;
      var m = n || r ? f : (
        /** @type {HTMLTemplateElement} */
        f.content
      );
      if (Et(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Be(m),
        /** @type {TemplateNode} */
        m.lastChild
      ), n || r)
        for (; /* @__PURE__ */ Be(m); )
          s.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Be(m)
          );
      else
        s.before(m);
    }
  });
}
function Za(t, e) {
  Pa(() => {
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
      const i = Fr("style");
      i.id = e.hash, i.textContent = e.code, r.appendChild(i);
    }
  });
}
function wc(t, e, n) {
  var r = t == null ? "" : "" + t;
  return e && (r = r ? r + " " + e : e), r === "" ? null : r;
}
function Ec(t, e) {
  return t == null ? null : String(t);
}
function xe(t, e, n, r, i, s) {
  var a = t.__className;
  if (L || a !== n || a === void 0) {
    var o = wc(n, r);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return s;
}
function ft(t, e, n, r) {
  var i = t.__style;
  if (L || i !== e) {
    var s = Ec(e);
    (!L || s !== t.getAttribute("style")) && (s == null ? t.removeAttribute("style") : t.style.cssText = s), t.__style = e;
  }
  return r;
}
const $c = Symbol("is custom element"), Ac = Symbol("is html"), Oc = yl ? "link" : "LINK";
function eo(t, e, n, r) {
  var i = Sc(t);
  L && (i[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === Oc) || i[e] !== (i[e] = n) && (e === "loading" && (t[ml] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && to(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function $s(t, e, n) {
  var r = R, i = k;
  let s = L;
  L && Pe(!1), oe(null), Ae(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (Ai.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? to(t).includes(e) : n && typeof n == "object") ? t[e] = n : eo(t, e, n == null ? n : String(n));
  } finally {
    oe(r), Ae(i), s && Pe(!0);
  }
}
function Sc(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [$c]: t.nodeName.includes("-"),
      [Ac]: t.namespaceURI === ta
    })
  );
}
var Ai = /* @__PURE__ */ new Map();
function to(t) {
  var e = t.getAttribute("is") || t.nodeName, n = Ai.get(e);
  if (n) return n;
  Ai.set(e, n = []);
  for (var r, i = t, s = Element.prototype; s !== i; ) {
    r = dl(i);
    for (var a in r)
      r[a].set && n.push(a);
    i = ra(i);
  }
  return n;
}
function As(t, e) {
  return t === e || (t == null ? void 0 : t[vr]) === e;
}
function ht(t = {}, e, n, r) {
  return Pa(() => {
    var i, s;
    return Hi(() => {
      i = s, s = [], Ie(() => {
        t !== n(...s) && (e(t, ...s), i && As(n(...i), t) && e(null, ...i));
      });
    }), () => {
      Bt(() => {
        s && As(n(...s), t) && e(null, ...s);
      });
    };
  }), t;
}
function Ne(t, e, n, r) {
  var i = (
    /** @type {V} */
    r
  ), s = !0, a = () => (s && (s = !1, i = /** @type {V} */
  r), i), o;
  o = /** @type {V} */
  t[e], o === void 0 && r !== void 0 && (o = a());
  var l;
  l = () => {
    var m = (
      /** @type {V} */
      t[e]
    );
    return m === void 0 ? a() : (s = !0, m);
  };
  var c = !1, u = /* @__PURE__ */ jr(() => (c = !1, l())), f = (
    /** @type {Effect} */
    k
  );
  return (
    /** @type {() => V} */
    function(m, w) {
      if (arguments.length > 0) {
        const _ = w ? h(u) : m;
        return O(u, _), c = !0, i !== void 0 && (i = _), m;
      }
      return St && c || (f.f & rt) !== 0 ? u.v : h(u);
    }
  );
}
function xc(t) {
  return new Tc(t);
}
var et, me;
class Tc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    C(this, et);
    /** @type {Record<string, any>} */
    C(this, me);
    var s;
    var n = /* @__PURE__ */ new Map(), r = (a, o) => {
      var l = /* @__PURE__ */ Sa(o, !1, !1);
      return n.set(a, l), l;
    };
    const i = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(a, o) {
          return h(n.get(o) ?? r(o, Reflect.get(a, o)));
        },
        has(a, o) {
          return o === gl ? !0 : (h(n.get(o) ?? r(o, Reflect.get(a, o))), Reflect.has(a, o));
        },
        set(a, o, l) {
          return O(n.get(o) ?? r(o, l), l), Reflect.set(a, o, l);
        }
      }
    );
    T(this, me, (e.hydrate ? hc : Ka)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: i,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
      transformError: e.transformError
    })), (!((s = e == null ? void 0 : e.props) != null && s.$$host) || e.sync === !1) && ye(), T(this, et, i.$$events);
    for (const a of Object.keys(p(this, me)))
      a === "$set" || a === "$destroy" || a === "$on" || Or(this, a, {
        get() {
          return p(this, me)[a];
        },
        /** @param {any} value */
        set(o) {
          p(this, me)[a] = o;
        },
        enumerable: !0
      });
    p(this, me).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(i, a);
    }, p(this, me).$destroy = () => {
      pc(p(this, me));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    p(this, me).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    p(this, et)[e] = p(this, et)[e] || [];
    const r = (...i) => n.call(this, ...i);
    return p(this, et)[e].push(r), () => {
      p(this, et)[e] = p(this, et)[e].filter(
        /** @param {any} fn */
        (i) => i !== r
      );
    };
  }
  $destroy() {
    p(this, me).$destroy();
  }
}
et = new WeakMap(), me = new WeakMap();
let no;
typeof HTMLElement == "function" && (no = class extends HTMLElement {
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
          const a = Fr("slot");
          i !== "default" && (a.name = i), ge(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = Nc(this);
      for (const i of this.$$s)
        i in r && (i === "default" && !this.$$d.children ? (this.$$d.children = e(i), n.default = !0) : n[i] = e(i));
      for (const i of this.attributes) {
        const s = this.$$g_p(i.name);
        s in this.$$d || (this.$$d[s] = yr(s, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = xc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = tc(() => {
        Hi(() => {
          var i;
          this.$$r = !0;
          for (const s of Ar(this.$$c)) {
            if (!((i = this.$$p_d[s]) != null && i.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const a = yr(
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
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = yr(e, r, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({ [e]: this.$$d[e] }));
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
    return Ar(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
    ) || e;
  }
});
function yr(t, e, n, r) {
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
function Nc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function ro(t, e, n, r, i, s) {
  let a = class extends no {
    constructor() {
      super(t, n, i), this.$$p_d = e;
    }
    static get observedAttributes() {
      return Ar(e).map(
        (o) => (e[o].attribute || o).toLowerCase()
      );
    }
  };
  return Ar(e).forEach((o) => {
    Or(a.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var f;
        l = yr(o, l, e), this.$$d[o] = l;
        var c = this.$$c;
        if (c) {
          var u = (f = un(c, o)) == null ? void 0 : f.get;
          u ? c[o] = l : c.$set({ [o]: l });
        }
      }
    });
  }), r.forEach((o) => {
    Or(a.prototype, o, {
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
const Cc = (t, e) => {
  const n = new Promise((r, i) => {
    setTimeout(() => {
      i(new Gi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, io = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return Cc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => io(t));
};
var Rc = /* @__PURE__ */ at('<span class="loading svelte-lv9s7p">Loading...</span>'), Ic = /* @__PURE__ */ at("<div><!></div>");
const Lc = {
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
function Oi(t, e) {
  Ii(e, !0), Za(t, Lc);
  const n = Ne(e, "config"), r = Ne(e, "hass"), i = Ne(e, "preview"), s = Ne(e, "marginTop", 7, "0px"), a = Ne(e, "open"), o = Ne(e, "animation", 7, !0), l = Ne(e, "animationState"), c = Ne(e, "clearCardCss", 7, !1);
  let u = null, f = /* @__PURE__ */ M(null), m = /* @__PURE__ */ M(!0), w = /* @__PURE__ */ M(0);
  const _ = Ie(() => JSON.parse(JSON.stringify(n())));
  dn(() => {
    h(f) && (h(f).hass = r());
  }), dn(() => {
    h(f) && i() !== void 0 && (h(f).preview = i());
  }), dn(() => {
    var b;
    h(f) && (_.disabled = !a(), (b = h(f)._element) == null || b.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: a() }, bubbles: !0, composed: !1 })));
  }), Qa(async () => {
    const b = document.createElement("hui-card");
    b.hass = r(), b.preview = i(), _.disabled = !a(), b.config = _, b.load(), u == null || u.appendChild(b), O(f, b, !0), O(m, !1), h(f).addEventListener(
      "ll-upgrade",
      (S) => {
        var x;
        S.stopPropagation(), (x = h(f)) != null && x._element && r() && (h(f)._element.hass = r());
      },
      { capture: !0 }
    ), c() && (b.style.setProperty("--ha-card-background", "transparent"), b.style.setProperty("--ha-card-box-shadow", "none"), b.style.setProperty("--ha-card-border-color", "transparent"), b.style.setProperty("--ha-card-border-width", "0px"), b.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (O(w, await io(b) * 56), u && O(w, h(w) + (window.getComputedStyle(u).marginTop ? parseFloat(window.getComputedStyle(u).marginTop) : 0)), new ResizeObserver((x) => {
      for (const N of x)
        if (N.contentBoxSize) {
          const D = Array.isArray(N.contentBoxSize) ? N.contentBoxSize[0] : N.contentBoxSize;
          D.blockSize && (O(w, D.blockSize, !0), h(f) && O(w, h(w) + (window.getComputedStyle(h(f)).marginTop ? parseFloat(window.getComputedStyle(h(f)).marginTop) : 0)));
        } else N.contentRect && (O(w, N.contentRect.height, !0), h(f) && O(w, h(w) + (window.getComputedStyle(h(f)).marginTop ? parseFloat(window.getComputedStyle(h(f)).marginTop) : 0)));
    }).observe(b));
  });
  var A = {
    get config() {
      return n();
    },
    set config(b) {
      n(b), ye();
    },
    get hass() {
      return r();
    },
    set hass(b) {
      r(b), ye();
    },
    get preview() {
      return i();
    },
    set preview(b) {
      i(b), ye();
    },
    get marginTop() {
      return s();
    },
    set marginTop(b = "0px") {
      s(b), ye();
    },
    get open() {
      return a();
    },
    set open(b) {
      a(b), ye();
    },
    get animation() {
      return o();
    },
    set animation(b = !0) {
      o(b), ye();
    },
    get animationState() {
      return l();
    },
    set animationState(b) {
      l(b), ye();
    },
    get clearCardCss() {
      return c();
    },
    set clearCardCss(b = !1) {
      c(b), ye();
    }
  }, d = Ic(), v = ut(d);
  {
    var g = (b) => {
      var S = Rc();
      ge(b, S);
    };
    dt(v, (b) => {
      h(m) && b(g);
    });
  }
  return Ye(d), ht(d, (b) => u = b, () => u), Je(() => {
    xe(d, 1, `outer-container${a() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), ft(d, `--child-card-margin-top: ${(a() ? s() : "0px") ?? ""};${h(w) ? ` --expander-animation-height: -${h(w)}px;` : ""}`);
  }), ge(t, d), Li(A);
}
customElements.define("expander-sub-card", ro(
  Oi,
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
const kc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var ir = function(t, e, n) {
  var r;
  n === void 0 && (n = {});
  var i = n.retries, s = i === void 0 ? 10 : i, a = n.delay, o = a === void 0 ? 10 : a, l = n.shouldReject, c = l === void 0 || l, u = (r = n.rejectMessage) !== null && r !== void 0 ? r : "Could not get the result after {{ retries }} retries";
  return new Promise(function(f, m) {
    var w = 0, _ = function() {
      var A = t();
      e(A) ? f(A) : ++w < s ? setTimeout(_, o) : c ? m(new Error(u.replace(/\{\{\s*retries\s*\}\}/g, "".concat(s)))) : f(A);
    };
    _();
  });
}, xr = function() {
  return xr = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, xr.apply(this, arguments);
};
function Kr(t, e, n) {
  if (arguments.length === 2) for (var r, i = 0, s = e.length; i < s; i++) !r && i in e || (r || (r = Array.prototype.slice.call(e, 0, i)), r[i] = e[i]);
  return t.concat(r || Array.prototype.slice.call(e));
}
var Tr, cn, Le, pt, Xr = "[home-assistant-javascript-templates]", Pc = /^([a-z_]+)\.(\w+)$/;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Tr || (Tr = {})), function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
}(cn || (cn = {})), function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
}(Le || (Le = {})), function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
}(pt || (pt = {}));
var Os = function(t) {
  return t.reduce(function(e, n) {
    var r = n[0], i = n[1];
    return e[r.replace(Pc, "$2")] = i, e;
  }, {});
}, ct = function(t) {
  return t.includes(".");
}, br = "ref", Lt = "value", Ss = "toJSON", xs = function(t) {
  return "".concat(br, ".").concat(t);
};
function Dc(t, e, n) {
  var r = function() {
    return Object.entries(t.hass.areas);
  }, i = function() {
    return Object.entries(t.hass.devices);
  }, s = function() {
    return Object.entries(t.hass.entities);
  }, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), l = function(d, v) {
    n && console.warn("".concat(d, " ").concat(v, " used in a JavaScript template doesn't exist"));
  }, c = function(d) {
    return l("Entity", d);
  }, u = function(d) {
    return l("Domain", d);
  }, f = function(d) {
    var v = new SyntaxError(d);
    if (e) throw v;
    n && console.warn(v);
  }, m = function(d) {
    t.hass.states[d] ? a.add(d) : c(d);
  }, w = function(d) {
    a.add(d);
  }, _ = function(d, v) {
    var g = v.with_unit, b = g !== void 0 && g, S = v.rounded, x = S !== void 0 && S;
    if (d) {
      var N = d.state, D = d.attributes.unit_of_measurement, F = Number(x), H = x === !1 || isNaN(Number(N)) ? N : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: F, maximumFractionDigits: F }).format(Number(N));
      return b && D ? "".concat(H, " ").concat(D) : H;
    }
  }, A = function(d) {
    return new Proxy(d, { get: function(v, g) {
      return g === "state_with_unit" ? _(v, { rounded: !0, with_unit: !0 }) : v[g];
    } });
  };
  return { get hass() {
    return t.hass;
  }, states: new Proxy(function(d, v) {
    if (v === void 0 && (v = {}), ct(d)) return m(d), _(t.hass.states[d], v);
    throw SyntaxError("".concat(Xr, ": states method cannot be used with a domain, use it as an object instead."));
  }, { get: function(d, v) {
    if (ct(v)) return m(v), A(t.hass.states[v]);
    var g = Object.entries(t.hass.states).filter(function(b) {
      return b[0].startsWith(v);
    });
    return g.length || u(v), new Proxy(Os(g), { get: function(b, S) {
      return m("".concat(v, ".").concat(S)), A(b[S]);
    } });
  } }), state_translated: function(d) {
    if (m(d), t.hass.states[d]) return t.hass.formatEntityState(t.hass.states[d]);
  }, is_state: function(d, v) {
    var g;
    return m(d), Array.isArray(v) ? v.some(function(b) {
      var S;
      return ((S = t.hass.states[d]) === null || S === void 0 ? void 0 : S.state) === b;
    }) : ((g = t.hass.states[d]) === null || g === void 0 ? void 0 : g.state) === v;
  }, state_attr: function(d, v) {
    var g, b;
    return m(d), (b = (g = t.hass.states[d]) === null || g === void 0 ? void 0 : g.attributes) === null || b === void 0 ? void 0 : b[v];
  }, is_state_attr: function(d, v, g) {
    return this.state_attr(d, v) === g;
  }, has_value: function(d) {
    return this.states(d) ? !(this.is_state(d, Tr.UNKNOWN) || this.is_state(d, Tr.UNAVAILABLE)) : (c(d), !1);
  }, entities: new Proxy(function(d) {
    if (d === void 0) return t.hass.entities;
    if (ct(d)) return m(d), t.hass.entities[d];
    var v = s().filter(function(g) {
      return g[0].startsWith(d);
    });
    return v.length || u(d), new Proxy(Os(v), { get: function(g, b) {
      return m("".concat(d, ".").concat(b)), g[b];
    } });
  }, { get: function(d, v) {
    return d(v);
  } }), entity_prop: function(d, v) {
    var g;
    return m(d), (g = t.hass.entities[d]) === null || g === void 0 ? void 0 : g[v];
  }, is_entity_prop: function(d, v, g) {
    return this.entity_prop(d, v) === g;
  }, devices: new Proxy(function(d) {
    if (d === void 0) return t.hass.devices;
    if (ct(d)) throw SyntaxError("".concat(Xr, ": devices method cannot be used with an entity id, you should use a device id instead."));
    return t.hass.devices[d];
  }, { get: function(d, v) {
    if (ct(v)) throw SyntaxError("".concat(Xr, ": devices cannot be accesed using an entity id, you should use a device id instead."));
    return t.hass.devices[v];
  } }), device_attr: function(d, v) {
    var g, b, S;
    if (ct(d)) {
      m(d);
      var x = (g = t.hass.entities[d]) === null || g === void 0 ? void 0 : g.device_id;
      return (b = t.hass.devices[x]) === null || b === void 0 ? void 0 : b[v];
    }
    return (S = t.hass.devices[d]) === null || S === void 0 ? void 0 : S[v];
  }, is_device_attr: function(d, v, g) {
    return this.device_attr(d, v) === g;
  }, device_id: function(d) {
    var v;
    if (ct(d)) return m(d), (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    var g = i().find(function(b) {
      return b[1].name === d;
    });
    return g == null ? void 0 : g[0];
  }, device_name: function(d) {
    var v, g, b;
    if (ct(d)) {
      m(d);
      var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
      return (g = t.hass.devices[S]) === null || g === void 0 ? void 0 : g.name;
    }
    return (b = t.hass.devices[d]) === null || b === void 0 ? void 0 : b.name;
  }, areas: function() {
    return r().map(function(d) {
      return d[1].area_id;
    });
  }, area_id: function(d) {
    var v, g;
    if (d in t.hass.devices) return this.device_attr(d, cn.AREA_ID);
    var b = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    if (b) return this.device_attr(b, cn.AREA_ID);
    var S = r().find(function(x) {
      return x[1].name === d;
    });
    return (g = S == null ? void 0 : S[1]) === null || g === void 0 ? void 0 : g.area_id;
  }, area_name: function(d) {
    var v, g, b;
    d in t.hass.devices && (b = this.device_attr(d, cn.AREA_ID));
    var S = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    S && (b = this.device_attr(S, cn.AREA_ID));
    var x = r().find(function(N) {
      var D = N[1];
      return D.area_id === d || D.area_id === b;
    });
    return (g = x == null ? void 0 : x[1]) === null || g === void 0 ? void 0 : g.name;
  }, area_entities: function(d) {
    var v = r().find(function(g) {
      var b = g[1];
      return b.area_id === d || b.name === d;
    });
    return v ? s().filter(function(g) {
      return g[1].area_id === v[1].area_id;
    }).map(function(g) {
      return g[0];
    }) : [];
  }, area_devices: function(d) {
    var v = r().find(function(g) {
      var b = g[1];
      return b.area_id === d || b.name === d;
    });
    return v ? i().filter(function(g) {
      return g[1].area_id === v[1].area_id;
    }).map(function(g) {
      return g[1].id;
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
  }, ref: function(d, v, g) {
    var b;
    g === void 0 && (g = void 0);
    var S = xs(v);
    if (o.has(v)) return o.get(v);
    var x = new Proxy(((b = {})[Lt] = g, b[Ss] = function() {
      return this[Lt];
    }, b), { get: function(N, D, F) {
      if (D === Lt || D === Ss) return w(S), Reflect.get(N, D, F);
      f("".concat(D, " is not a valid ").concat(br, " property. A ").concat(br, ' only exposes a "').concat(Lt, '" property'));
    }, set: function(N, D, F) {
      if (D === Lt) {
        var H = N[Lt];
        return N[Lt] = F, d({ event_type: pt.STATE_CHANGE_EVENT, data: { entity_id: S, old_state: { state: JSON.stringify(H) }, new_state: { state: JSON.stringify(F) } } }), !0;
      }
      return f('property "'.concat(D, '" cannot be set in a ').concat(br)), !1;
    } });
    return o.set(v, x), x;
  }, unref: function(d, v) {
    var g = xs(v);
    o.has(v) ? (o.delete(v), d(g)) : f("".concat(v, " is not a ref or it has been unrefed already"));
  }, refs: function(d, v, g) {
    g === void 0 && (g = {});
    var b = this.ref, S = this.unref, x = new Proxy(g, { get: function(N, D) {
      return b(d, D).value;
    }, set: function(N, D, F) {
      return b(d, D).value = F, !0;
    } });
    return Object.entries(g).forEach(function(N) {
      var D = N[0], F = N[1];
      o.has(D) && S(v, D), b(d, D, F);
    }), x;
  }, cleanRefs: function(d) {
    var v = this;
    Array.from(o.keys()).forEach(function(g) {
      v.unref(d, g);
    });
  }, clientSideProxy: new Proxy({}, { get: function(d, v) {
    switch (Object.values(Le).includes(v) && w(v), v) {
      case Le.PANEL_URL:
        return location.pathname;
      case Le.LANG:
        return t.hass.language;
    }
    n && console.warn("clientSideProxy should only be used to access these variables: ".concat(Object.values(Le).join(", ")));
  } }) };
}
var Mc = function() {
  function t(e, n) {
    var r = n.throwErrors, i = r !== void 0 && r, s = n.throwWarnings, a = s === void 0 || s, o = n.variables, l = o === void 0 ? {} : o, c = n.refs, u = c === void 0 ? {} : c, f = n.refsVariableName, m = f === void 0 ? "refs" : f, w = n.autoReturn, _ = w === void 0 || w;
    this._throwErrors = i, this._throwWarnings = a, this._variables = l, this._refsVariableName = m, this._autoReturn = _, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp("(^|[ \\?(+:\\{\\[><,])(".concat(Object.values(Le).join("|"), ")($|[ \\?)+:\\}\\]><.,])"), "gm"), this._scopped = Dc(e, i, a), this.refs = u, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
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
    window.addEventListener(pt.LOCATION_CHANGED, function() {
      e._panelUrlWatchCallback();
    }), window.addEventListener(pt.POPSTATE, function() {
      e._panelUrlWatchCallback();
    });
  }, t.prototype._panelUrlWatchCallback = function() {
    this._subscriptions.has(Le.PANEL_URL) && this._executeRenderingFunctions(Le.PANEL_URL);
  }, t.prototype._watchForEntitiesChange = function() {
    var e = this;
    window.hassConnection.then(function(n) {
      n.conn.subscribeMessage(function(r) {
        return e._entityWatchCallback(r);
      }, { type: pt.SUBSCRIBE_EVENTS, event_type: pt.STATE_CHANGE_EVENT });
    });
  }, t.prototype._watchForLanguageChange = function() {
    var e = this;
    window.addEventListener(pt.TRANSLATIONS_UPDATED, function() {
      e._subscriptions.has(Le.LANG) && e._executeRenderingFunctions(Le.LANG);
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
      var r = n.variables, i = r === void 0 ? {} : r, s = n.refs, a = s === void 0 ? {} : s, o = new Map(Object.entries(xr(xr({}, this._variables), i))), l = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), c = l.includes("return") || !this._autoReturn ? l : "return ".concat(l);
      return new (Function.bind.apply(Function, Kr(Kr([void 0, "hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName], Array.from(o.keys()), !1), ["".concat('"use strict";', " ").concat(c)], !1)))().apply(void 0, Kr([this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), a)], Array.from(o.values()), !1));
    } catch (u) {
      if (this._throwErrors) throw u;
      return void (this._throwWarnings && console.warn(u));
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
}(), Hc = function() {
  function t(e, n) {
    n === void 0 && (n = {}), this._renderer = ir(function() {
      return e.hass;
    }, function(r) {
      return !!(r && r.areas && r.devices && r.entities && r.states && r.user);
    }, { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(function() {
      return new Mc(e, n);
    });
  }
  return t.prototype.getRenderer = function() {
    return this._renderer;
  }, t;
}();
function jc(t = {}, e = {}) {
  return new Hc(
    document.querySelector("home-assistant"),
    {
      autoReturn: !1,
      variables: t,
      refs: e,
      refsVariableName: "variables"
    }
  ).getRenderer();
}
function wr(t) {
  return !t || typeof t != "string" ? !1 : String(t).trim().startsWith("[[[") && String(t).trim().endsWith("]]]");
}
function Ts(t, e, n, r = {}) {
  if (!wr(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((i) => i.trackTemplate(n, e, { variables: r }));
}
function Ns(t, e, n) {
  t.then((r) => {
    r.refs[e] = n;
  });
}
function Fc(t, e) {
  t.then((n) => {
    const r = e.detail;
    Object.keys(r).forEach((i) => {
      const s = r[i].property, a = r[i].value, o = `${i}_${s}`;
      n.refs[o] = a;
    });
  });
}
function qc(t, e) {
  const n = Fc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Nr = function() {
  return Nr = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, Nr.apply(this, arguments);
};
function en(t, e, n, r) {
  return new (n || (n = Promise))(function(i, s) {
    function a(c) {
      try {
        l(r.next(c));
      } catch (u) {
        s(u);
      }
    }
    function o(c) {
      try {
        l(r.throw(c));
      } catch (u) {
        s(u);
      }
    }
    function l(c) {
      var u;
      c.done ? i(c.value) : (u = c.value, u instanceof n ? u : new n(function(f) {
        f(u);
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
    return function(c) {
      return function(u) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; a && (a = 0, u[0] && (s = 0)), s; ) try {
          if (n = 1, r && (i = 2 & u[0] ? r.return : u[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, u[1])).done) return i;
          switch (r = 0, i && (u = [2 & u[0], i.value]), u[0]) {
            case 0:
            case 1:
              i = u;
              break;
            case 4:
              return s.label++, { value: u[1], done: !1 };
            case 5:
              s.label++, r = u[1], u = [0];
              continue;
            case 7:
              u = s.ops.pop(), s.trys.pop();
              continue;
            default:
              if (i = s.trys, !((i = i.length > 0 && i[i.length - 1]) || u[0] !== 6 && u[0] !== 2)) {
                s = 0;
                continue;
              }
              if (u[0] === 3 && (!i || u[1] > i[0] && u[1] < i[3])) {
                s.label = u[1];
                break;
              }
              if (u[0] === 6 && s.label < i[1]) {
                s.label = i[1], i = u;
                break;
              }
              if (i && s.label < i[2]) {
                s.label = i[2], s.ops.push(u);
                break;
              }
              i[2] && s.ops.pop(), s.trys.pop();
              continue;
          }
          u = e.call(t, s);
        } catch (f) {
          u = [6, f], r = 0;
        } finally {
          n = i = 0;
        }
        if (5 & u[0]) throw u[1];
        return { value: u[0] ? u[1] : void 0, done: !0 };
      }([l, c]);
    };
  }
}
var Xt = "$", so = ":host", Ui = "invalid selector", xt = 10, Tt = 10, zi = function(t) {
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
      return i.split(Xt).map(function(s) {
        return s.trim();
      });
    }(n);
    return e(r);
  });
}
function ao(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(Xt, ").").concat(n);
}
function an(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function oo() {
  return "You can not select a shadowRoot (".concat(Xt, ") of the document.");
}
function lo() {
  return "You can not select a shadowRoot (".concat(Xt, ") of a shadowRoot.");
}
function Vi(t, e) {
  for (var n, r, i = null, s = t.length, a = 0; a < s; a++) {
    if (a === 0) if (t[a].length) i = e.querySelector(t[a]);
    else {
      if (e instanceof Document) throw new SyntaxError(oo());
      if (e instanceof ShadowRoot) throw new SyntaxError(lo());
      i = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++a])) || null;
    }
    else i = ((r = i.shadowRoot) === null || r === void 0 ? void 0 : r.querySelector("".concat(so, " ").concat(t[a]))) || null;
    if (i === null) return null;
  }
  return i;
}
function Gc(t, e) {
  var n, r = function(a, o, l) {
    for (var c, u = 0, f = o.length; u < f; u++) !c && u in o || (c || (c = Array.prototype.slice.call(o, 0, u)), c[u] = o[u]);
    return a.concat(c || Array.prototype.slice.call(o));
  }([], t), i = r.pop();
  if (!r.length) return e.querySelectorAll(i);
  var s = Vi(r, e);
  return ((n = s == null ? void 0 : s.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(so, " ").concat(i))) || null;
}
function Uc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(oo());
    if (e instanceof ShadowRoot) throw new SyntaxError(lo());
    return e.shadowRoot;
  }
  var n = Vi(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function zc(t, e, n, r) {
  for (var i = Bi(t, function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(ao(n, r));
    return l;
  }), s = i.length, a = 0; a < s; a++) {
    var o = Vi(i[a], e);
    if (o) return o;
  }
  return null;
}
function Bc(t, e, n) {
  for (var r = Bi(t, function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(ao(n));
    return o;
  }), i = r.length, s = 0; s < i; s++) {
    var a = Gc(r[s], e);
    if (a != null && a.length) return a;
  }
  return document.querySelectorAll(Ui);
}
function Vc(t, e, n, r) {
  for (var i = Bi(t, function(l) {
    if (l.pop().length) throw new SyntaxError(function(c, u) {
      return "".concat(c, " must be used with a selector ending in a shadowRoot (").concat(Xt, "). If you don't want to select a shadowRoot, use ").concat(u, " instead.");
    }(n, r));
    return l;
  }), s = i.length, a = 0; a < s; a++) {
    var o = Uc(i[a], e);
    if (o) return o;
  }
  return null;
}
function Cs(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, ir(function() {
        return zc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function Rs(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, ir(function() {
        return Bc(t, e, "asyncQuerySelectorAll");
      }, function(s) {
        return !!s.length;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function Is(t, e, n, r) {
  return en(this, void 0, void 0, function() {
    return tn(this, function(i) {
      return [2, ir(function() {
        return Vc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }, function(s) {
        return !!s;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
var Si = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var r = Si(t.shadowRoot, e);
    if (r.length) return r;
  }
  for (var i = 0, s = Array.from(t.querySelectorAll("*")); i < s.length; i++) {
    var a = s[i], o = Si(a, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(Ui);
}, Ls = function(t, e, n, r) {
  return ir(function() {
    return Si(t, e);
  }, function(i) {
    return !!i.length;
  }, { retries: n, delay: r, shouldReject: !1 });
};
function ks() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return zi(t) ? (n = t[0], r = t[1], i = t[2], [4, Cs(r, n, (i == null ? void 0 : i.retries) || xt, (i == null ? void 0 : i.delay) || Tt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [4, Cs(s, document, (a == null ? void 0 : a.retries) || xt, (a == null ? void 0 : a.delay) || Tt)];
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
          return zi(t) ? (n = t[0], r = t[1], i = t[2], [4, Rs(r, n, (i == null ? void 0 : i.retries) || xt, (i == null ? void 0 : i.delay) || Tt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Rs(s, document, (a == null ? void 0 : a.retries) || xt, (a == null ? void 0 : a.delay) || Tt)];
      }
    });
  });
}
function Ds() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return en(this, void 0, void 0, function() {
    var n, r, i, s, a;
    return tn(this, function(o) {
      switch (o.label) {
        case 0:
          return zi(t) ? (n = t[0], r = t[1], i = t[2], [4, Is(r, n, (i == null ? void 0 : i.retries) || xt, (i == null ? void 0 : i.delay) || Tt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return s = t[0], a = t[1], [2, Is(s, document, (a == null ? void 0 : a.retries) || xt, (a == null ? void 0 : a.delay) || Tt)];
      }
    });
  });
}
var Wc = function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Nr({ retries: xt, delay: Tt }, n || {})) : (this._element = document, this._asyncParams = Nr({ retries: xt, delay: Tt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return an(this._element).then(function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(an(this._element).then(function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Ds(n[0], Xt, e._asyncParams) : Ds(n, Xt, e._asyncParams);
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
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? Ps(r[0], e, n._asyncParams) : Ps(r, e, n._asyncParams);
    }), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(an(this._element).then(function(r) {
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? Promise.race(Array.from(r).map(function(i) {
        return Ls(i, e, n._asyncParams.retries, n._asyncParams.delay);
      })) : Ls(r, e, n._asyncParams.retries, n._asyncParams.delay);
    }), this._asyncParams);
  }, t;
}(), xi = function(t, e) {
  return xi = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, xi(t, e);
}, nt = function() {
  return nt = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, nt.apply(this, arguments);
};
var ke, yt, V, Ke, Ms, Qr, Zr, dr, Hs, ei, fr, ti, ni, ri, Pn, j, $t = "$", Yc = { retries: 100, delay: 50, eventThreshold: 450 };
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(ke || (ke = {})), function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
}(yt || (yt = {})), function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
}(V || (V = {})), function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
}(Ke || (Ke = {})), function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
}(j || (j = {}));
var Jc = ((Ms = {})[ke.HOME_ASSISTANT] = { selector: j.HOME_ASSISTANT, children: { shadowRoot: { selector: $t, children: (Qr = {}, Qr[ke.HOME_ASSISTANT_MAIN] = { selector: j.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: $t, children: (Zr = {}, Zr[ke.HA_DRAWER] = { selector: j.HA_DRAWER, children: (dr = {}, dr[ke.HA_SIDEBAR] = { selector: j.HA_SIDEBAR, children: { shadowRoot: { selector: $t } } }, dr[ke.PARTIAL_PANEL_RESOLVER] = { selector: j.PARTIAL_PANEL_RESOLVER }, dr) }, Zr) } } }, Qr) } } }, Ms), Kc = ((Hs = {})[yt.HA_PANEL_LOVELACE] = { selector: j.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: $t, children: (ei = {}, ei[yt.HUI_ROOT] = { selector: j.HUI_ROOT, children: { shadowRoot: { selector: $t, children: (fr = {}, fr[yt.HEADER] = { selector: j.HEADER }, fr[yt.HUI_VIEW] = { selector: j.HUI_VIEW }, fr) } } }, ei) } } }, Hs), Xc = { shadowRoot: { selector: $t, children: (ti = {}, ti[V.HA_MORE_INFO_DIALOG] = { selector: j.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: $t, children: (ni = {}, ni[V.HA_DIALOG] = { selector: j.HA_DIALOG, children: (ri = {}, ri[V.HA_DIALOG_CONTENT] = { selector: j.HA_DIALOG_CONTENT, children: (Pn = {}, Pn[V.HA_MORE_INFO_DIALOG_INFO] = { selector: j.HA_MORE_INFO_DIALOG_INFO }, Pn[V.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = { selector: j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, Pn[V.HA_DIALOG_MORE_INFO_SETTINGS] = { selector: j.HA_DIALOG_MORE_INFO_SETTINGS }, Pn) }, ri) }, ni) } } }, ti) } }, qn = function(t, e, n, r) {
  return n === void 0 && (n = null), r === void 0 && (r = !1), Object.entries(e || {}).reduce(function(i, s) {
    var a = s[0], o = s[1];
    if (o.selector === $t && n) return o.children ? nt(nt({}, i), qn(t, o.children, n, !0)) : i;
    var l = n ? n.then(function(c) {
      return c ? ks(c, (u = o.selector, r ? "$ " + u : u), t) : null;
      var u;
    }) : ks(o.selector, t);
    return i[a] = { element: l, children: qn(t, o.children, l), selector: new Wc(l, t) }, i;
  }, {});
}, co = function(t, e) {
  for (var n = 0, r = Object.entries(e); n < r.length; n++) {
    var i = r[n];
    if (i[0] === t) return i[1];
    var s = co(t, i[1].children);
    if (s) return s;
  }
}, ii = function(t, e) {
  return Object.keys(t).reduce(function(n, r) {
    var i = co(r, e);
    i.children;
    var s = function(a, o) {
      var l = {};
      for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && o.indexOf(c) < 0 && (l[c] = a[c]);
      if (a != null && typeof Object.getOwnPropertySymbols == "function") {
        var u = 0;
        for (c = Object.getOwnPropertySymbols(a); u < c.length; u++) o.indexOf(c[u]) < 0 && Object.prototype.propertyIsEnumerable.call(a, c[u]) && (l[c[u]] = a[c[u]]);
      }
      return l;
    }(i, ["children"]);
    return n[r] = nt({}, s), n;
  }, {});
}, Qc = function() {
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
}(), Zc = function(t) {
  function e(n) {
    n === void 0 && (n = {});
    var r = t.call(this) || this;
    return r._config = nt(nt({}, Yc), n), r._timestaps = {}, r;
  }
  return function(n, r) {
    if (typeof r != "function" && r !== null) throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    function i() {
      this.constructor = n;
    }
    xi(n, r), n.prototype = r === null ? Object.create(r) : (i.prototype = r.prototype, new i());
  }(e, t), e.prototype._dispatchEvent = function(n, r) {
    var i = Date.now();
    i - this._timestaps[n] < this._config.eventThreshold || (this._timestaps[n] = i, this.dispatchEvent(new CustomEvent(n, { detail: r })));
  }, e.prototype._updateDialogElements = function(n) {
    var r, i = this;
    n === void 0 && (n = V.HA_MORE_INFO_DIALOG_INFO), this._dialogTree = qn(this._config, Xc, this._haRootElements.HOME_ASSISTANT.element);
    var s = ii(V, this._dialogTree);
    s.HA_DIALOG_CONTENT.element.then(function(o) {
      i._dialogsContentObserver.disconnect(), i._dialogsContentObserver.observe(o, { childList: !0 });
    }), this._haDialogElements = function(o, l) {
      return [V.HA_MORE_INFO_DIALOG, V.HA_DIALOG, V.HA_DIALOG_CONTENT, l].reduce(function(c, u) {
        return c[u] = o[u], c;
      }, {});
    }(s, n);
    var a = ((r = {})[V.HA_MORE_INFO_DIALOG_INFO] = Ke.ON_MORE_INFO_DIALOG_OPEN, r[V.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = Ke.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, r[V.HA_DIALOG_MORE_INFO_SETTINGS] = Ke.ON_SETTINGS_DIALOG_OPEN, r);
    this._dispatchEvent(a[n], this._haDialogElements);
  }, e.prototype._updateRootElements = function() {
    var n = this;
    this._homeAssistantRootTree = qn(this._config, Jc), this._haRootElements = ii(ke, this._homeAssistantRootTree), this._haRootElements[ke.HOME_ASSISTANT].selector.$.element.then(function(r) {
      n._dialogsObserver.disconnect(), n._dialogsObserver.observe(r, { childList: !0 });
    }), this._haRootElements[ke.PARTIAL_PANEL_RESOLVER].element.then(function(r) {
      n._panelResolverObserver.disconnect(), r && n._panelResolverObserver.observe(r, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(Ke.ON_LISTEN, this._haRootElements), this._dispatchEvent(Ke.ON_PANEL_LOAD, this._haRootElements);
  }, e.prototype._updateLovelaceElements = function() {
    var n = this;
    this._homeAssistantResolverTree = qn(this._config, Kc, this._haRootElements[ke.HA_DRAWER].element), this._haResolverElements = ii(yt, this._homeAssistantResolverTree), this._haResolverElements[yt.HA_PANEL_LOVELACE].element.then(function(r) {
      n._lovelaceObserver.disconnect(), r && (n._lovelaceObserver.observe(r.shadowRoot, { childList: !0 }), n._dispatchEvent(Ke.ON_LOVELACE_PANEL_LOAD, nt(nt({}, n._haRootElements), n._haResolverElements)));
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
        var a, o = ((a = {})[j.HA_MORE_INFO_DIALOG_INFO] = V.HA_MORE_INFO_DIALOG_INFO, a[j.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = V.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, a[j.HA_DIALOG_MORE_INFO_SETTINGS] = V.HA_DIALOG_MORE_INFO_SETTINGS, a);
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
}(Qc);
const uo = new Zc();
let Er = {};
uo.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
  t.HUI_ROOT.element.then((e) => {
    const n = e == null ? void 0 : e.lovelace;
    n != null && n.config && (Er = n.config["expander-card"] || {});
  }).catch(() => {
    Er = {};
  }).finally(() => {
    document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
      detail: { rawConfig: Er },
      bubbles: !0,
      composed: !0
    }));
  });
});
uo.listen();
const eu = () => Er, js = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
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
`) : null, Ti = {
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
var tu = /* @__PURE__ */ at("<ha-ripple></ha-ripple>", 2), nu = /* @__PURE__ */ at('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), ru = /* @__PURE__ */ at("<ha-ripple></ha-ripple>", 2), iu = /* @__PURE__ */ at('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), su = /* @__PURE__ */ at("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), au = /* @__PURE__ */ at("<div><div></div></div>"), ou = /* @__PURE__ */ at("<ha-card><!> <!> <!></ha-card>", 2);
const lu = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function cu(t, e) {
  Ii(e, !0), Za(t, lu);
  const n = Ne(e, "hass"), r = Ne(e, "preview"), i = Ne(e, "config", 7, Ti);
  let s = /* @__PURE__ */ M(!1), a = /* @__PURE__ */ M(null), o = /* @__PURE__ */ M(tt(!!Ie(() => r()))), l = /* @__PURE__ */ M(tt(!!Ie(() => r()))), c = /* @__PURE__ */ M(!0), u = /* @__PURE__ */ M("idle"), f = /* @__PURE__ */ M(null), m = /* @__PURE__ */ M(0), w = /* @__PURE__ */ M(0), _ = /* @__PURE__ */ M(null), A = /* @__PURE__ */ M(null), d = /* @__PURE__ */ M(null), v = /* @__PURE__ */ M(null);
  const g = {}, b = {}, S = {}, x = /* @__PURE__ */ M(tt({}));
  let N = /* @__PURE__ */ M(tt(eu()));
  const D = /* @__PURE__ */ Ln(() => {
    const y = h(x).style, E = i().style;
    let $ = null;
    return y !== void 0 ? $ = typeof y == "string" ? y : typeof y == "object" && y !== null ? js(y) : String(y) : E && ($ = js(E)), $ ? `<style>${$}</style>` : null;
  }), F = /* @__PURE__ */ Ln(() => h(x).icon !== void 0 ? String(h(x).icon) : i().icon), H = /* @__PURE__ */ Ln(() => h(x).title !== void 0 ? String(h(x).title) : i().title), or = /* @__PURE__ */ Ln(() => h(x)["arrow-color"] !== void 0 ? String(h(x)["arrow-color"]) : i()["arrow-color"]), Tn = Ie(() => i()["storage-id"]), Zi = "expander-open-" + Tn;
  O(c, Ie(() => r() || (zr(i()["show-button-users"]) ?? !0)), !0), dn(() => {
    if (h(x).expanded === void 0 || Ie(() => r() && h(N)["preview-expanded"] !== !1))
      return;
    const y = !!h(x).expanded;
    queueMicrotask(() => {
      y !== h(o) && Ct(y);
    });
  }), dn(() => {
    if (!(r() === h(l) || r() === void 0)) {
      if (O(l, r(), !0), h(l) && h(N)["preview-expanded"] !== !1) {
        Nn(!0), O(c, !0);
        return;
      }
      if (O(c, zr(i()["show-button-users"]) ?? !0, !0), lr("expanded")) {
        const y = Ie(() => h(x).expanded);
        y !== void 0 && Ct(!!y);
        return;
      }
      es();
    }
  });
  function lr(y) {
    const E = i().templates && Array.isArray(i().templates) ? i().templates.find(($) => $.template === y) : void 0;
    if (E && wr(E.value_template))
      return E;
  }
  function Ur(y) {
    if (!i()["expander-card-id"])
      return;
    const E = {};
    E[i()["expander-card-id"]] = { property: "open", value: y }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function zr(y) {
    var E, $, Y, Oe;
    if (y !== void 0)
      return (($ = (E = n()) == null ? void 0 : E.user) == null ? void 0 : $.name) !== void 0 && y.includes((Oe = (Y = n()) == null ? void 0 : Y.user) == null ? void 0 : Oe.name);
  }
  function es() {
    if (!lr("expanded")) {
      if (zr(i()["start-expanded-users"])) {
        ot(!0);
        return;
      }
      if (Tn === void 0) {
        ts();
        return;
      }
      try {
        const y = localStorage.getItem(Zi);
        if (y === null) {
          ts();
          return;
        }
        const E = y ? y === "true" : h(o);
        ot(E);
      } catch (y) {
        console.error(y), ot(!1);
      }
    }
  }
  function ts() {
    if (i().expanded !== void 0) {
      ot(i().expanded);
      return;
    }
    ot(!1);
  }
  function Ct(y) {
    h(f) && (clearTimeout(h(f)), O(f, null));
    const E = y !== void 0 ? y : !h(o);
    if (!i().animation) {
      ot(E);
      return;
    }
    if (Ur(E), O(u, E ? "opening" : "closing", !0), E) {
      Nn(!0), O(
        f,
        setTimeout(
          () => {
            O(u, "idle"), O(f, null);
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
          Nn(!1), O(u, "idle"), O(f, null);
        },
        350
      ),
      !0
    );
  }
  function ot(y) {
    Nn(y), Ur(y);
  }
  function Nn(y) {
    if (O(o, y, !0), !r() && Tn !== void 0)
      try {
        localStorage.setItem(Zi, h(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    h(o) && h(m) === 0 && O(m, 0.35);
  }
  function ns(y) {
    var $;
    const E = ($ = y.detail) == null ? void 0 : $.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(h(N)) && O(N, E, !0);
  }
  function rs(y) {
    var $, Y;
    const E = (Y = ($ = y.detail) == null ? void 0 : $["expander-card"]) == null ? void 0 : Y.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === i()["expander-card-id"]) {
      if (E.action === "open" && !h(o)) {
        Ct(!0);
        return;
      }
      if (E.action === "close" && h(o)) {
        Ct(!1);
        return;
      }
      E.action === "toggle" && Ct();
    }
  }
  function mo() {
    document.body.removeEventListener("ll-custom", rs), document.body.removeEventListener("expander-card-raw-config-updated", ns), Object.entries(S).forEach(([y, E]) => {
      E.then(($) => {
        $(), delete S[y];
      }).catch(() => {
      });
    }), Object.entries(b).forEach(([y, E]) => {
      E.then(($) => {
        $(), delete b[y];
      }).catch(() => {
      });
    }), Object.entries(g).forEach(([y, E]) => {
      E(), delete g[y];
    });
  }
  const is = (y) => {
    i().haptic && i().haptic !== "none" && kc(y, i().haptic);
  };
  let Cn, Rn = !1, ss = 0, as = 0;
  const yo = (y) => {
    h(v) && (h(v).disabled = !0), Cn = y.target, ss = y.touches[0].clientX, as = y.touches[0].clientY, Rn = !1;
  }, bo = (y) => {
    const E = y.touches[0].clientX, $ = y.touches[0].clientY;
    Rn = Math.abs(E - ss) > 10 || Math.abs($ - as) > 10;
  }, wo = () => {
    h(v) && (h(v).disabled = !1), Cn = void 0, Rn = !1;
  }, Eo = () => {
    h(v) && (h(v).disabled = !1);
  }, $o = (y) => {
    !Rn && Cn === y.target && i()["title-card-clickable"] && (is(Cn), Ct(), O(s, !0), O(
      a,
      window.setTimeout(
        () => {
          O(s, !1), O(a, null);
        },
        100
      ),
      !0
    ), h(v) && (h(v).startPressAnimation(), h(v).endPressAnimation())), Cn = void 0, Rn = !1;
  }, Ao = (y) => {
    for (const E of Object.values(i().variables ?? {}))
      wr(E.value_template) ? b[E.variable] = Ts(
        y,
        ($) => {
          Ns(y, E.variable, $);
        },
        E.value_template,
        { config: i() }
      ) : Ns(y, E.variable, E.value_template);
  }, Oo = (y) => {
    g["expander-card"] = qc(y, "expander-card");
  }, So = () => {
    if (!i().templates) return;
    const y = Object.values(i().variables || {}).reduce(
      ($, Y) => ($[Y.variable] = void 0, $),
      {}
    ), E = jc({ config: i(), expanderCard: {} }, y);
    Ao(E), Oo(E), Object.values(i().templates || {}).forEach(($) => {
      wr($.value_template) ? S[$.template] = Ts(
        E,
        (Y) => {
          h(x)[$.template] = Y;
        },
        $.value_template,
        { config: i() }
      ) : h(x)[$.template] = $.value_template;
    });
  };
  function xo() {
    if (lr("expanded"))
      return;
    const y = i()["min-width-expanded"], E = i()["max-width-expanded"], $ = document.body.offsetWidth;
    if (y && E) {
      i().expanded = $ >= y && $ <= E;
      return;
    }
    if (y) {
      i().expanded = $ >= y;
      return;
    }
    E && (i().expanded = $ <= E);
  }
  function To() {
    if (r() && h(N)["preview-expanded"] !== !1) {
      Nn(!0);
      return;
    }
    if (lr("expanded")) {
      const y = Ie(() => h(x).expanded);
      ot(y !== void 0 ? !!y : !1);
    } else
      es();
  }
  function No() {
    if (i()["title-card-clickable"] && !i()["title-card-button-overlay"] && h(A))
      return h(A);
    if (h(d))
      return h(d);
  }
  Qa(() => {
    So(), Ur(!1), xo(), To(), document.body.addEventListener("ll-custom", rs), document.body.addEventListener("expander-card-raw-config-updated", ns);
    const y = No();
    return y && (y.addEventListener("touchstart", yo, { passive: !0, capture: !0 }), y.addEventListener("touchmove", bo, { passive: !0, capture: !0 }), y.addEventListener("touchcancel", wo, { passive: !0, capture: !0 }), y.addEventListener("touchend", Eo, { passive: !0, capture: !0 }), y.addEventListener("touchend", $o, { passive: !1, capture: !1 })), i()["title-card-clickable"] && i()["title-card-button-overlay"] && h(A) && new ResizeObserver(() => {
      if (h(d) && h(A) && h(_)) {
        const $ = h(A).getBoundingClientRect();
        O(w, $.height - parseFloat(getComputedStyle(h(d)).marginTop) - parseFloat(getComputedStyle(h(d)).marginBottom) + parseFloat(getComputedStyle(h(_)).paddingTop) + parseFloat(getComputedStyle(h(_)).paddingBottom));
      }
    }).observe(h(A)), mo;
  });
  const Br = (y) => {
    if (!h(s)) {
      is(y.currentTarget), Ct();
      return;
    }
    return y.preventDefault(), y.stopImmediatePropagation(), O(s, !1), h(a) && (clearTimeout(h(a)), O(a, null)), !1;
  };
  var Co = {
    get hass() {
      return n();
    },
    set hass(y) {
      n(y), ye();
    },
    get preview() {
      return r();
    },
    set preview(y) {
      r(y), ye();
    },
    get config() {
      return i();
    },
    set config(y = Ti) {
      i(y), ye();
    }
  }, nn = ou(), os = ut(nn);
  {
    var Ro = (y) => {
      var E = iu(), $ = ut(E), Y = ut($);
      Oi(Y, {
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
      var Oe = It($, 2);
      {
        var Se = (ee) => {
          var te = nu(), qe = ut(te);
          Je(() => $s(qe, "icon", h(F)));
          var Do = It(qe, 2);
          {
            var Mo = (Rt) => {
              var In = tu();
              ht(In, (Ho) => O(v, Ho), () => h(v)), ge(Rt, In);
            };
            dt(Do, (Rt) => {
              (!i()["title-card-clickable"] || i()["title-card-button-overlay"]) && Rt(Mo);
            });
          }
          Ye(te), ht(te, (Rt) => O(d, Rt), () => h(d)), Je(() => {
            ft(te, `--overlay-margin:${i()["overlay-margin"] ?? ""}; --button-background:${i()["button-background"] ?? ""}; --header-color:${i()["header-color"] ?? ""};`), xe(te, 1, `header ${i()["title-card-button-overlay"] ? " header-overlay" : ""}${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), ft(qe, `--arrow-color:${h(or) ?? ""}`), xe(qe, 1, `ico${h(o) && h(u) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq");
          }), Yr("click", te, function(...Rt) {
            var In;
            (In = !i()["title-card-clickable"] || i()["title-card-button-overlay"] ? Br : null) == null || In.apply(this, Rt);
          }), ge(ee, te);
        };
        dt(Oe, (ee) => {
          h(c) && ee(Se);
        });
      }
      var rn = It(Oe, 2);
      {
        var Vr = (ee) => {
          var te = ru();
          ht(te, (qe) => O(v, qe), () => h(v)), ge(ee, te);
        };
        dt(rn, (ee) => {
          i()["title-card-clickable"] && !i()["title-card-button-overlay"] && ee(Vr);
        });
      }
      Ye(E), ht(E, (ee) => O(A, ee), () => h(A)), Je(() => {
        xe(E, 1, `title-card-header${i()["title-card-button-overlay"] ? "-overlay" : ""}${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}${i()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), eo(E, "role", i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? "button" : void 0), xe($, 1, `title-card-container${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), ft($, `--title-padding:${(i()["title-card-padding"] ? i()["title-card-padding"] : "0px") ?? ""};`);
      }), Yr("click", E, function(...ee) {
        var te;
        (te = i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? Br : null) == null || te.apply(this, ee);
      }), ge(y, E);
    }, Io = (y) => {
      var E = ws(), $ = _s(E);
      {
        var Y = (Oe) => {
          var Se = su(), rn = ut(Se), Vr = ut(rn, !0);
          Ye(rn);
          var ee = It(rn, 2);
          Je(() => $s(ee, "icon", h(F)));
          var te = It(ee, 2);
          ht(te, (qe) => O(v, qe), () => h(v)), Ye(Se), ht(Se, (qe) => O(d, qe), () => h(d)), Je(() => {
            xe(Se, 1, `header${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), ft(Se, `--header-width:100%; --button-background:${i()["button-background"] ?? ""};--header-color:${i()["header-color"] ?? ""};`), xe(rn, 1, `primary title${h(o) ? " open" : " close"}`, "svelte-1jqiztq"), fc(Vr, h(H)), ft(ee, `--arrow-color:${h(or) ?? ""}`), xe(ee, 1, `ico${h(o) && h(u) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq");
          }), Yr("click", Se, Br), ge(Oe, Se);
        };
        dt($, (Oe) => {
          h(c) && Oe(Y);
        });
      }
      ge(y, E);
    };
    dt(os, (y) => {
      i()["title-card"] ? y(Ro) : y(Io, !1);
    });
  }
  var ls = It(os, 2);
  {
    var Lo = (y) => {
      var E = au(), $ = ut(E);
      gc($, 20, () => i().cards, (Y) => Y, (Y, Oe) => {
        {
          let Se = /* @__PURE__ */ Ln(() => h(o) && r());
          Oi(Y, {
            get hass() {
              return n();
            },
            get preview() {
              return h(Se);
            },
            get config() {
              return Oe;
            },
            get marginTop() {
              return i()["child-margin-top"];
            },
            get open() {
              return h(o);
            },
            get animation() {
              return i().animation;
            },
            get animationState() {
              return h(u);
            },
            get clearCardCss() {
              return i()["clear-children"];
            }
          });
        }
      }), Ye($), Ye(E), Je(() => {
        xe(E, 1, `children-wrapper ${i().animation ? "animation " + h(u) : ""}${h(o) ? " open" : " close"}`, "svelte-1jqiztq"), ft($, `--expander-card-display:${i()["expander-card-display"] ?? ""};
                --gap:${(h(o) && h(u) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""};
                --child-padding:${(h(o) && h(u) !== "closing" ? i()["child-padding"] : "0px") ?? ""};`), xe($, 1, `children-container${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq");
      }), ge(y, E);
    };
    dt(ls, (y) => {
      i().cards && y(Lo);
    });
  }
  var ko = It(ls, 2);
  {
    var Po = (y) => {
      var E = ws(), $ = _s(E);
      bc($, () => h(D)), ge(y, E);
    };
    dt(ko, (y) => {
      h(D) && y(Po);
    });
  }
  return Ye(nn), ht(nn, (y) => O(_, y), () => h(_)), Je(() => {
    xe(nn, 1, `expander-card${i().clear ? " clear" : ""}${h(o) ? " open" : " close"} ${h(u)}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), ft(nn, `--expander-card-display:${i()["expander-card-display"] ?? ""};
     --gap:${(h(o) && h(u) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""}; --padding:${i().padding ?? ""};
     --expander-state:${h(o) ?? ""};
     --icon-rotate-degree:${i()["icon-rotate-degree"] ?? ""};
     --card-background:${(h(o) && h(u) !== "closing" && i()["expander-card-background-expanded"] ? i()["expander-card-background-expanded"] : i()["expander-card-background"]) ?? ""};
     --background-animation-duration:${h(m) ?? ""}s;
     --expander-card-overlay-height:${h(w) ? `${h(w)}px` : "auto"};
    `);
  }), ge(t, nn), Li(Co);
}
oc(["click"]);
customElements.define("expander-card", ro(cu, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    q(this, "config");
  }
  static async getConfigElement() {
    return await nl(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...Ti, ...n };
  }
}));
const uu = "6.0.3";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $r = globalThis, Wi = $r.ShadowRoot && ($r.ShadyCSS === void 0 || $r.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Yi = Symbol(), Fs = /* @__PURE__ */ new WeakMap();
let fo = class {
  constructor(e, n, r) {
    if (this._$cssResult$ = !0, r !== Yi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Wi && e === void 0) {
      const r = n !== void 0 && n.length === 1;
      r && (e = Fs.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && Fs.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const du = (t) => new fo(typeof t == "string" ? t : t + "", void 0, Yi), Ji = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((r, i, s) => r + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[s + 1], t[0]);
  return new fo(n, t, Yi);
}, fu = (t, e) => {
  if (Wi) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const r = document.createElement("style"), i = $r.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = n.cssText, t.appendChild(r);
  }
}, qs = Wi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const r of e.cssRules) n += r.cssText;
  return du(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: hu, defineProperty: pu, getOwnPropertyDescriptor: vu, getOwnPropertyNames: _u, getOwnPropertySymbols: gu, getPrototypeOf: mu } = Object, At = globalThis, Gs = At.trustedTypes, yu = Gs ? Gs.emptyScript : "", si = At.reactiveElementPolyfillSupport, Gn = (t, e) => t, Cr = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? yu : null;
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
} }, Ki = (t, e) => !hu(t, e), Us = { attribute: !0, type: String, converter: Cr, reflect: !1, useDefault: !1, hasChanged: Ki };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), At.litPropertyMetadata ?? (At.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let ln = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Us) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, n);
      i !== void 0 && pu(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, r) {
    const { get: i, set: s } = vu(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Us;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Gn("elementProperties"))) return;
    const e = mu(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Gn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Gn("properties"))) {
      const n = this.properties, r = [..._u(n), ...gu(n)];
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
      for (const i of r) n.unshift(qs(i));
    } else e !== void 0 && n.push(qs(e));
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
    return fu(e, this.constructor.elementStyles), e;
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
      const a = (((s = r.converter) == null ? void 0 : s.toAttribute) !== void 0 ? r.converter : Cr).toAttribute(n, r.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var s, a;
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((s = o.converter) == null ? void 0 : s.fromAttribute) !== void 0 ? o.converter : Cr;
      this._$Em = i;
      const c = l.fromAttribute(n, o.type);
      this[i] = c ?? ((a = this._$Ej) == null ? void 0 : a.get(i)) ?? c, this._$Em = null;
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
ln.elementStyles = [], ln.shadowRootOptions = { mode: "open" }, ln[Gn("elementProperties")] = /* @__PURE__ */ new Map(), ln[Gn("finalized")] = /* @__PURE__ */ new Map(), si == null || si({ ReactiveElement: ln }), (At.reactiveElementVersions ?? (At.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Un = globalThis, zs = (t) => t, Rr = Un.trustedTypes, Bs = Rr ? Rr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, ho = "$lit$", vt = `lit$${Math.random().toFixed(9).slice(2)}$`, po = "?" + vt, bu = `<${po}>`, Qt = document, Wn = () => Qt.createComment(""), Yn = (t) => t === null || typeof t != "object" && typeof t != "function", Xi = Array.isArray, wu = (t) => Xi(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", ai = `[ 	
\f\r]`, Dn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Vs = /-->/g, Ws = />/g, kt = RegExp(`>|${ai}(?:([^\\s"'>=/]+)(${ai}*=${ai}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ys = /'/g, Js = /"/g, vo = /^(?:script|style|textarea|title)$/i, Eu = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), on = Eu(1), On = Symbol.for("lit-noChange"), z = Symbol.for("lit-nothing"), Ks = /* @__PURE__ */ new WeakMap(), jt = Qt.createTreeWalker(Qt, 129);
function _o(t, e) {
  if (!Xi(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Bs !== void 0 ? Bs.createHTML(e) : e;
}
const $u = (t, e) => {
  const n = t.length - 1, r = [];
  let i, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = Dn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let c, u, f = -1, m = 0;
    for (; m < l.length && (a.lastIndex = m, u = a.exec(l), u !== null); ) m = a.lastIndex, a === Dn ? u[1] === "!--" ? a = Vs : u[1] !== void 0 ? a = Ws : u[2] !== void 0 ? (vo.test(u[2]) && (i = RegExp("</" + u[2], "g")), a = kt) : u[3] !== void 0 && (a = kt) : a === kt ? u[0] === ">" ? (a = i ?? Dn, f = -1) : u[1] === void 0 ? f = -2 : (f = a.lastIndex - u[2].length, c = u[1], a = u[3] === void 0 ? kt : u[3] === '"' ? Js : Ys) : a === Js || a === Ys ? a = kt : a === Vs || a === Ws ? a = Dn : (a = kt, i = void 0);
    const w = a === kt && t[o + 1].startsWith("/>") ? " " : "";
    s += a === Dn ? l + bu : f >= 0 ? (r.push(c), l.slice(0, f) + ho + l.slice(f) + vt + w) : l + vt + (f === -2 ? o : w);
  }
  return [_o(t, s + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class Jn {
  constructor({ strings: e, _$litType$: n }, r) {
    let i;
    this.parts = [];
    let s = 0, a = 0;
    const o = e.length - 1, l = this.parts, [c, u] = $u(e, n);
    if (this.el = Jn.createElement(c, r), jt.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (i = jt.nextNode()) !== null && l.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const f of i.getAttributeNames()) if (f.endsWith(ho)) {
          const m = u[a++], w = i.getAttribute(f).split(vt), _ = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: s, name: _[2], strings: w, ctor: _[1] === "." ? Ou : _[1] === "?" ? Su : _[1] === "@" ? xu : qr }), i.removeAttribute(f);
        } else f.startsWith(vt) && (l.push({ type: 6, index: s }), i.removeAttribute(f));
        if (vo.test(i.tagName)) {
          const f = i.textContent.split(vt), m = f.length - 1;
          if (m > 0) {
            i.textContent = Rr ? Rr.emptyScript : "";
            for (let w = 0; w < m; w++) i.append(f[w], Wn()), jt.nextNode(), l.push({ type: 2, index: ++s });
            i.append(f[m], Wn());
          }
        }
      } else if (i.nodeType === 8) if (i.data === po) l.push({ type: 2, index: s });
      else {
        let f = -1;
        for (; (f = i.data.indexOf(vt, f + 1)) !== -1; ) l.push({ type: 7, index: s }), f += vt.length - 1;
      }
      s++;
    }
  }
  static createElement(e, n) {
    const r = Qt.createElement("template");
    return r.innerHTML = e, r;
  }
}
function Sn(t, e, n = t, r) {
  var a, o;
  if (e === On) return e;
  let i = r !== void 0 ? (a = n._$Co) == null ? void 0 : a[r] : n._$Cl;
  const s = Yn(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== s && ((o = i == null ? void 0 : i._$AO) == null || o.call(i, !1), s === void 0 ? i = void 0 : (i = new s(t), i._$AT(t, n, r)), r !== void 0 ? (n._$Co ?? (n._$Co = []))[r] = i : n._$Cl = i), i !== void 0 && (e = Sn(t, i._$AS(t, e.values), i, r)), e;
}
class Au {
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
    const { el: { content: n }, parts: r } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? Qt).importNode(n, !0);
    jt.currentNode = i;
    let s = jt.nextNode(), a = 0, o = 0, l = r[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let c;
        l.type === 2 ? c = new sr(s, s.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(s, l.name, l.strings, this, e) : l.type === 6 && (c = new Tu(s, this, e)), this._$AV.push(c), l = r[++o];
      }
      a !== (l == null ? void 0 : l.index) && (s = jt.nextNode(), a++);
    }
    return jt.currentNode = Qt, i;
  }
  p(e) {
    let n = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, n), n += r.strings.length - 2) : r._$AI(e[n])), n++;
  }
}
class sr {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, r, i) {
    this.type = 2, this._$AH = z, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = r, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
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
    e = Sn(this, e, n), Yn(e) ? e === z || e == null || e === "" ? (this._$AH !== z && this._$AR(), this._$AH = z) : e !== this._$AH && e !== On && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : wu(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== z && Yn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Qt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var s;
    const { values: n, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = Jn.createElement(_o(r.h, r.h[0]), this.options)), r);
    if (((s = this._$AH) == null ? void 0 : s._$AD) === i) this._$AH.p(n);
    else {
      const a = new Au(i, this), o = a.u(this.options);
      a.p(n), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let n = Ks.get(e.strings);
    return n === void 0 && Ks.set(e.strings, n = new Jn(e)), n;
  }
  k(e) {
    Xi(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let r, i = 0;
    for (const s of e) i === n.length ? n.push(r = new sr(this.O(Wn()), this.O(Wn()), this, this.options)) : r = n[i], r._$AI(s), i++;
    i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, n); e !== this._$AB; ) {
      const i = zs(e).nextSibling;
      zs(e).remove(), e = i;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class qr {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, r, i, s) {
    this.type = 1, this._$AH = z, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = s, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = z;
  }
  _$AI(e, n = this, r, i) {
    const s = this.strings;
    let a = !1;
    if (s === void 0) e = Sn(this, e, n, 0), a = !Yn(e) || e !== this._$AH && e !== On, a && (this._$AH = e);
    else {
      const o = e;
      let l, c;
      for (e = s[0], l = 0; l < s.length - 1; l++) c = Sn(this, o[r + l], n, l), c === On && (c = this._$AH[l]), a || (a = !Yn(c) || c !== this._$AH[l]), c === z ? e = z : e !== z && (e += (c ?? "") + s[l + 1]), this._$AH[l] = c;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === z ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ou extends qr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === z ? void 0 : e;
  }
}
class Su extends qr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== z);
  }
}
class xu extends qr {
  constructor(e, n, r, i, s) {
    super(e, n, r, i, s), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = Sn(this, e, n, 0) ?? z) === On) return;
    const r = this._$AH, i = e === z && r !== z || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, s = e !== z && (r === z || i);
    i && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Tu {
  constructor(e, n, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Sn(this, e);
  }
}
const oi = Un.litHtmlPolyfillSupport;
oi == null || oi(Jn, sr), (Un.litHtmlVersions ?? (Un.litHtmlVersions = [])).push("3.3.2");
const Nu = (t, e, n) => {
  const r = (n == null ? void 0 : n.renderBefore) ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const s = (n == null ? void 0 : n.renderBefore) ?? null;
    r._$litPart$ = i = new sr(e.insertBefore(Wn(), s), s, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Yt = globalThis;
class zn extends ln {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Nu(n, this.renderRoot, this.renderOptions);
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
    return On;
  }
}
var ea;
zn._$litElement$ = !0, zn.finalized = !0, (ea = Yt.litElementHydrateSupport) == null || ea.call(Yt, { LitElement: zn });
const li = Yt.litElementPolyfillSupport;
li == null || li({ LitElement: zn });
(Yt.litElementVersions ?? (Yt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Cu = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ru = { attribute: !0, type: String, converter: Cr, reflect: !1, hasChanged: Ki }, Iu = (t = Ru, e, n) => {
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
function Gr(t) {
  return (e, n) => typeof n == "object" ? Iu(t, e, n) : ((r, i, s) => {
    const a = i.hasOwnProperty(s);
    return i.constructor.createProperty(s, r), a ? Object.getOwnPropertyDescriptor(i, s) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ar(t) {
  return Gr({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lu = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ku(t, e) {
  return (n, r, i) => {
    const s = (a) => {
      var o;
      return ((o = a.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return Lu(n, r, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Pu = (t) => t ?? z, Du = Ji`
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
`, Mu = Ji`
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
var Hu = Object.defineProperty, ju = Object.getOwnPropertyDescriptor, We = (t, e, n, r) => {
  for (var i = r > 1 ? void 0 : r ? ju(e, n) : e, s = t.length - 1, a; s >= 0; s--)
    (a = t[s]) && (i = (r ? a(e, n, i) : a(i)) || i);
  return r && i && Hu(e, n, i), i;
};
const go = "custom:", Fu = (t) => t.startsWith(go), qu = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Gu = (t) => t.replace(go, "");
let pe = class extends zn {
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
      return z;
    const t = !this._config.type || this._error || void 0;
    let e = this._params.title ?? "";
    if (this._config.type) {
      let r;
      Fu(this._config.type) ? (r = (n = qu(
        Gu(this._config.type)
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
                    disabled=${Pu(t)}
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
      return z;
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
pe.styles = [
  Du,
  Mu,
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
  Gr({ attribute: !1 })
], pe.prototype, "hass", 2);
We([
  Gr({ type: Boolean, reflect: !0 })
], pe.prototype, "large", 2);
We([
  Gr({ attribute: !1 })
], pe.prototype, "lovelace", 2);
We([
  ar()
], pe.prototype, "_params", 2);
We([
  ar()
], pe.prototype, "_config", 2);
We([
  ar()
], pe.prototype, "_cardGUIMode", 2);
We([
  ar()
], pe.prototype, "_cardGUIModeAvailable", 2);
We([
  ar()
], pe.prototype, "_error", 2);
We([
  ku("hui-card-element-editor")
], pe.prototype, "_cardEditorEl", 2);
pe = We([
  Cu("expander-card-title-card-edit-form")
], pe);
console.info(
  `%c  Expander-Card 
%c Version ${uu}`,
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
customElements.get("expander-card-title-card-edit-form") || customElements.define("expander-card-title-card-edit-form", pe);
export {
  cu as default
};
//# sourceMappingURL=expander-card.js.map
