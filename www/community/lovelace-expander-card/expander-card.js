var Ho = Object.defineProperty;
var da = (t) => {
  throw TypeError(t);
};
var jo = (t, e, n) => e in t ? Ho(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var j = (t, e, n) => jo(t, typeof e != "symbol" ? e + "" : e, n), Yr = (t, e, n) => e.has(t) || da("Cannot " + n);
var h = (t, e, n) => (Yr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), R = (t, e, n) => e.has(t) ? da("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), T = (t, e, n, i) => (Yr(t, e, "write to private field"), i ? i.call(t, n) : e.set(t, n), n), q = (t, e, n) => (Yr(t, e, "access private method"), n);
const Fo = "5";
var Za;
typeof window < "u" && ((Za = window.__svelte ?? (window.__svelte = {})).v ?? (Za.v = /* @__PURE__ */ new Set())).add(Fo);
const qo = {
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
}, Go = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var _r = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(_r || {});
const Uo = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, zo = { name: "style", label: "CSS structured object", selector: { object: {} } }, Bo = { icon: {} }, Vo = { text: {} }, Wo = { boolean: {} }, Yo = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), Jo = (t, e) => ({
  name: t,
  label: e,
  selector: Bo
}), Y = (t, e) => ({
  name: t,
  label: e,
  selector: Vo
}), un = (t, e) => ({
  name: t,
  label: e,
  selector: Wo
}), fa = (t, e, n) => ({
  name: t,
  label: e,
  selector: Yo(n)
}), Ko = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...Y("title", "Title")
      },
      {
        ...Jo("icon", "Icon")
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
                ...un("expanded", "Start expanded")
              },
              {
                ...un("animation", "Enable animation")
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
                ...fa("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...fa("max-width-expanded", "Max width expanded", "px")
              },
              {
                ...Y("storage-id", "Storage ID")
              },
              {
                ...Y("expander-card-id", "Expander card ID")
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
                ...Y("arrow-color", "Icon color")
              },
              {
                ...Y("icon-rotate-degree", "Icon rotate degree")
              },
              {
                ...Y("header-color", "Header color")
              },
              {
                ...Y("button-background", "Button background color")
              },
              {
                ...Y("expander-card-background", "Background")
              },
              {
                ...Y("expander-card-background-expanded", "Background when expanded")
              },
              {
                ...Y("expander-card-display", "Expander card display")
              },
              {
                ...un("clear", "Clear border and background")
              },
              {
                ...Y("gap", "Gap")
              },
              {
                ...Y("padding", "Padding")
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
                ...Y("expanded-gap", "Card gap")
              },
              {
                ...Y("child-padding", "Card padding")
              },
              {
                ...Y("child-margin-top", "Card margin top")
              },
              {
                ...un("clear-children", "Clear card border and background")
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
                ...un("title-card-clickable", "Make title card clickable to expand/collapse")
              },
              {
                ...un("title-card-button-overlay", "Overlay expand button on title card")
              },
              {
                ...Y("overlay-margin", "Overlay margin")
              },
              {
                ...Y("title-card-padding", "Title card padding")
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
], Xo = (t, e) => new Promise((n) => {
  const i = e.cancel, r = e.submit;
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
              n(null), i && i();
            },
            submit: (a) => {
              n(a), r && r(a);
            }
          }
        },
        bubbles: !0,
        composed: !0
      }
    )
  );
}), Vn = window;
let gr = Vn.cardHelpers;
const Qo = new Promise((t) => {
  gr && t(), Vn.loadCardHelpers && Vn.loadCardHelpers().then((e) => {
    gr = e, Vn.cardHelpers = gr, t();
  });
});
async function Zo() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((i) => !i.system_generated).map((i) => i.name) : void 0;
}
const el = async () => {
  const t = await Qo.then(() => gr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await Zo();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (r) => {
        var s, o, l, c;
        ((l = (o = (s = r.detail) == null ? void 0 : s.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((u) => u.name === "expander_card_title_card_marker")) && (r.stopPropagation(), (c = r.detail) != null && c.dialogImport && r.detail.dialogImport().then(async () => {
          var d, b, w, g, A, f, v, _;
          const u = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (b = (d = r.detail) == null ? void 0 : d.dialogParams) == null ? void 0 : b.submit,
            cancel: (g = (w = r.detail) == null ? void 0 : w.dialogParams) == null ? void 0 : g.cancel,
            submitText: (f = (A = r.detail) == null ? void 0 : A.dialogParams) == null ? void 0 : f.submitText,
            cancelText: (_ = (v = r.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : _.cancelText,
            lovelace: this.lovelace
          };
          await Xo(
            this,
            u
          );
        }));
      }, this._computeLabelCallback = (r) => r.label ?? r.name ?? "", this._valueChanged = (r) => {
        const a = r.detail.value, s = Object.entries(qo);
        for (const [o, l] of s) {
          if (typeof l == "object" && Array.isArray(l) && Array.isArray(a[o])) {
            JSON.stringify(a[o]) === JSON.stringify(l) && delete a[o];
            continue;
          }
          a[o] === l && delete a[o];
        }
        this._config = a, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
      }, this._users = n;
    }
    // override setConfig to store config only and not assert stack editor config
    // we also upgrade any old config here if needed
    setConfig(r) {
      this._config = r;
    }
    // define _schema getter to return our own schema
    get _schema() {
      const a = JSON.stringify(Ko), s = this._users.map((d) => d.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = a.replace(/\[\[users\]\]/g, s);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Go.filter((d) => {
          var b;
          return !((b = this._config.templates) != null && b.some((w) => w.template === d));
        }).join('","')
      );
      const c = (this._config.style && typeof this._config.style == "object" ? _r.Object : _r.CSS) === _r.CSS ? JSON.stringify(Uo) : JSON.stringify(zo);
      return o = o.replace(/"\[\[style\]\]"/g, c), JSON.parse(o);
    }
    // _schema setter does nothing as we want to use our own schema
    set _schema(r) {
    }
    connectedCallback() {
      super.connectedCallback(), this.addEventListener("show-dialog", this.showDialogCallback.bind(this), !0);
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this.removeEventListener("show-dialog", this.showDialogCallback.bind(this), !0);
    }
  };
}, tl = async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => Vn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await el();
    customElements.define("expander-card-editor", t);
  }
}, nl = 1, rl = 2, il = 16, al = 1, sl = 2, rs = "[", Ci = "[!", ha = "[?", Ri = "]", Xt = {}, J = Symbol(), is = "http://www.w3.org/1999/xhtml", ol = "http://www.w3.org/2000/svg", ll = "http://www.w3.org/1998/Math/MathML", ui = !1;
var as = Array.isArray, cl = Array.prototype.indexOf, On = Array.prototype.includes, Mr = Array.from, xr = Object.keys, Tr = Object.defineProperty, vn = Object.getOwnPropertyDescriptor, ul = Object.getOwnPropertyDescriptors, dl = Object.prototype, fl = Array.prototype, ss = Object.getPrototypeOf, pa = Object.isExtensible;
const hl = () => {
};
function pl(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function os() {
  var t, e, n = new Promise((i, r) => {
    t = i, e = r;
  });
  return { promise: n, resolve: t, reject: e };
}
const Z = 2, Pn = 4, Sn = 8, Ii = 1 << 24, Ct = 16, je = 32, Rt = 64, di = 128, Ee = 512, X = 1024, Q = 2048, He = 4096, ne = 8192, We = 16384, nn = 32768, xn = 65536, va = 1 << 17, vl = 1 << 18, rn = 1 << 19, _l = 1 << 20, rt = 1 << 25, Qt = 65536, fi = 1 << 21, Li = 1 << 22, Et = 1 << 23, mr = Symbol("$state"), gl = Symbol("legacy props"), ml = Symbol(""), Ht = new class extends Error {
  constructor() {
    super(...arguments);
    j(this, "name", "StaleReactionError");
    j(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var es;
const yl = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!((es = globalThis.document) != null && es.contentType) && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
), Hr = 3, Dn = 8;
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
function sr(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Il() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let L = !1;
function De(t) {
  L = t;
}
let N;
function re(t) {
  if (t === null)
    throw sr(), Xt;
  return N = t;
}
function Tn() {
  return re(/* @__PURE__ */ Fe(N));
}
function Xe(t) {
  if (L) {
    if (/* @__PURE__ */ Fe(N) !== null)
      throw sr(), Xt;
    N = t;
  }
}
function Ll(t = 1) {
  if (L) {
    for (var e = t, n = N; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(n);
    N = n;
  }
}
function Nr(t = !0) {
  for (var e = 0, n = N; ; ) {
    if (n.nodeType === Dn) {
      var i = (
        /** @type {Comment} */
        n.data
      );
      if (i === Ri) {
        if (e === 0) return n;
        e -= 1;
      } else (i === rs || i === Ci || // "[1", "[2", etc. for if blocks
      i[0] === "[" && !isNaN(Number(i.slice(1)))) && (e += 1);
    }
    var r = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(n)
    );
    t && n.remove(), n = r;
  }
}
function ls(t) {
  if (!t || t.nodeType !== Dn)
    throw sr(), Xt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function cs(t) {
  return t === this.v;
}
function kl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function us(t) {
  return !kl(t, this.v);
}
let Pl = !1, ve = null;
function Nn(t) {
  ve = t;
}
function ki(t, e = !1, n) {
  ve = {
    p: ve,
    i: !1,
    c: null,
    e: null,
    s: t,
    x: null,
    l: null
  };
}
function Pi(t) {
  var e = (
    /** @type {ComponentContext} */
    ve
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var i of n)
      ks(i);
  }
  return t !== void 0 && (e.x = t), e.i = !0, ve = e.p, t ?? /** @type {T} */
  {};
}
function ds() {
  return !0;
}
let jt = [];
function fs() {
  var t = jt;
  jt = [], pl(t);
}
function Wt(t) {
  if (jt.length === 0 && !Wn) {
    var e = jt;
    queueMicrotask(() => {
      e === jt && fs();
    });
  }
  jt.push(t);
}
function Dl() {
  for (; jt.length > 0; )
    fs();
}
function hs(t) {
  var e = k;
  if (e === null)
    return I.f |= Et, t;
  if ((e.f & nn) === 0 && (e.f & Pn) === 0)
    throw t;
  bt(t, e);
}
function bt(t, e) {
  for (; e !== null; ) {
    if ((e.f & di) !== 0) {
      if ((e.f & nn) === 0)
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
function z(t, e) {
  t.f = t.f & Ml | e;
}
function Di(t) {
  (t.f & Ee) !== 0 || t.deps === null ? z(t, X) : z(t, He);
}
function ps(t) {
  if (t !== null)
    for (const e of t)
      (e.f & Z) === 0 || (e.f & Qt) === 0 || (e.f ^= Qt, ps(
        /** @type {Derived} */
        e.deps
      ));
}
function vs(t, e, n) {
  (t.f & Q) !== 0 ? e.add(t) : (t.f & He) !== 0 && n.add(t), ps(t.deps), z(t, X);
}
const fr = /* @__PURE__ */ new Set();
let P = null, K = null, se = [], jr = null, Wn = !1, Cn = null, Hl = 1;
var gt, gn, Ut, mn, yn, bn, mt, Ge, wn, ce, hi, pi, vi, _i;
const ta = class ta {
  constructor() {
    R(this, ce);
    // for debugging. TODO remove once async is stable
    j(this, "id", Hl++);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    j(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    j(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<(batch: Batch) => void>}
     */
    R(this, gt, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    R(this, gn, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    R(this, Ut, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    R(this, mn, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    R(this, yn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    R(this, bn, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    R(this, mt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    R(this, Ge, /* @__PURE__ */ new Map());
    j(this, "is_fork", !1);
    R(this, wn, !1);
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    h(this, Ge).has(e) || h(this, Ge).set(e, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(e) {
    var n = h(this, Ge).get(e);
    if (n) {
      h(this, Ge).delete(e);
      for (var i of n.d)
        z(i, Q), Ve(i);
      for (i of n.m)
        z(i, He), Ve(i);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(e) {
    var r;
    se = [], this.apply();
    var n = Cn = [], i = [];
    for (const a of e)
      q(this, ce, pi).call(this, a, n, i);
    if (Cn = null, q(this, ce, hi).call(this)) {
      q(this, ce, vi).call(this, i), q(this, ce, vi).call(this, n);
      for (const [a, s] of h(this, Ge))
        ys(a, s);
    } else {
      P = null;
      for (const a of h(this, gt)) a(this);
      h(this, gt).clear(), h(this, Ut) === 0 && q(this, ce, _i).call(this), _a(i), _a(n), h(this, bn).clear(), h(this, mt).clear(), (r = h(this, yn)) == null || r.resolve();
    }
    K = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(e, n) {
    n !== J && !this.previous.has(e) && this.previous.set(e, n), (e.f & Et) === 0 && (this.current.set(e, e.v), K == null || K.set(e, e.v));
  }
  activate() {
    P = this, this.apply();
  }
  deactivate() {
    P === this && (P = null, K = null);
  }
  flush() {
    var e;
    if (se.length > 0)
      P = this, _s();
    else if (h(this, Ut) === 0 && !this.is_fork) {
      for (const n of h(this, gt)) n(this);
      h(this, gt).clear(), q(this, ce, _i).call(this), (e = h(this, yn)) == null || e.resolve();
    }
    this.deactivate();
  }
  discard() {
    for (const e of h(this, gn)) e(this);
    h(this, gn).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(e) {
    T(this, Ut, h(this, Ut) + 1), e && T(this, mn, h(this, mn) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(e) {
    T(this, Ut, h(this, Ut) - 1), e && T(this, mn, h(this, mn) - 1), !h(this, wn) && (T(this, wn, !0), Wt(() => {
      T(this, wn, !1), q(this, ce, hi).call(this) ? se.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const e of h(this, bn))
      h(this, mt).delete(e), z(e, Q), Ve(e);
    for (const e of h(this, mt))
      z(e, He), Ve(e);
    this.flush();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(e) {
    h(this, gt).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    h(this, gn).add(e);
  }
  settled() {
    return (h(this, yn) ?? T(this, yn, os())).promise;
  }
  static ensure() {
    if (P === null) {
      const e = P = new ta();
      fr.add(P), Wn || Wt(() => {
        P === e && e.flush();
      });
    }
    return P;
  }
  apply() {
  }
};
gt = new WeakMap(), gn = new WeakMap(), Ut = new WeakMap(), mn = new WeakMap(), yn = new WeakMap(), bn = new WeakMap(), mt = new WeakMap(), Ge = new WeakMap(), wn = new WeakMap(), ce = new WeakSet(), hi = function() {
  return this.is_fork || h(this, mn) > 0;
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
pi = function(e, n, i) {
  e.f ^= X;
  for (var r = e.first; r !== null; ) {
    var a = r.f, s = (a & (je | Rt)) !== 0, o = s && (a & X) !== 0, l = (a & ne) !== 0, c = o || h(this, Ge).has(r);
    if (!c && r.fn !== null) {
      s ? l || (r.f ^= X) : (a & Pn) !== 0 ? n.push(r) : (a & (Sn | Ii)) !== 0 && l ? i.push(r) : or(r) && (In(r), (a & Ct) !== 0 && (h(this, mt).add(r), l && z(r, Q)));
      var u = r.first;
      if (u !== null) {
        r = u;
        continue;
      }
    }
    for (; r !== null; ) {
      var d = r.next;
      if (d !== null) {
        r = d;
        break;
      }
      r = r.parent;
    }
  }
}, /**
 * @param {Effect[]} effects
 */
vi = function(e) {
  for (var n = 0; n < e.length; n += 1)
    vs(e[n], h(this, bn), h(this, mt));
}, _i = function() {
  var a;
  if (fr.size > 1) {
    this.previous.clear();
    var e = P, n = K, i = !0;
    for (const s of fr) {
      if (s === this) {
        i = !1;
        continue;
      }
      const o = [];
      for (const [c, u] of this.current) {
        if (s.current.has(c))
          if (i && u !== s.current.get(c))
            s.current.set(c, u);
          else
            continue;
        o.push(c);
      }
      if (o.length === 0)
        continue;
      const l = [...s.current.keys()].filter((c) => !this.current.has(c));
      if (l.length > 0) {
        var r = se;
        se = [];
        const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const d of o)
          gs(d, l, c, u);
        if (se.length > 0) {
          P = s, s.apply();
          for (const d of se)
            q(a = s, ce, pi).call(a, d, [], []);
          s.deactivate();
        }
        se = r;
      }
    }
    P = e, K = n;
  }
  h(this, Ge).clear(), fr.delete(this);
};
let st = ta;
function be(t) {
  var e = Wn;
  Wn = !0;
  try {
    for (var n; ; ) {
      if (Dl(), se.length === 0 && (P == null || P.flush(), se.length === 0))
        return jr = null, /** @type {T} */
        n;
      _s();
    }
  } finally {
    Wn = e;
  }
}
function _s() {
  var t = null;
  try {
    for (var e = 0; se.length > 0; ) {
      var n = st.ensure();
      if (e++ > 1e3) {
        var i, r;
        jl();
      }
      n.process(se), $t.clear();
    }
  } finally {
    se = [], jr = null, Cn = null;
  }
}
function jl() {
  try {
    Sl();
  } catch (t) {
    bt(t, jr);
  }
}
let Ne = null;
function _a(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var i = t[n++];
      if ((i.f & (We | ne)) === 0 && or(i) && (Ne = /* @__PURE__ */ new Set(), In(i), i.deps === null && i.first === null && i.nodes === null && i.teardown === null && i.ac === null && Hs(i), (Ne == null ? void 0 : Ne.size) > 0)) {
        $t.clear();
        for (const r of Ne) {
          if ((r.f & (We | ne)) !== 0) continue;
          const a = [r];
          let s = r.parent;
          for (; s !== null; )
            Ne.has(s) && (Ne.delete(s), a.push(s)), s = s.parent;
          for (let o = a.length - 1; o >= 0; o--) {
            const l = a[o];
            (l.f & (We | ne)) === 0 && In(l);
          }
        }
        Ne.clear();
      }
    }
    Ne = null;
  }
}
function gs(t, e, n, i) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const r of t.reactions) {
      const a = r.f;
      (a & Z) !== 0 ? gs(
        /** @type {Derived} */
        r,
        e,
        n,
        i
      ) : (a & (Li | Ct)) !== 0 && (a & Q) === 0 && ms(r, e, i) && (z(r, Q), Ve(
        /** @type {Effect} */
        r
      ));
    }
}
function ms(t, e, n) {
  const i = n.get(t);
  if (i !== void 0) return i;
  if (t.deps !== null)
    for (const r of t.deps) {
      if (On.call(e, r))
        return !0;
      if ((r.f & Z) !== 0 && ms(
        /** @type {Derived} */
        r,
        e,
        n
      ))
        return n.set(
          /** @type {Derived} */
          r,
          !0
        ), !0;
    }
  return n.set(t, !1), !1;
}
function Ve(t) {
  var e = jr = t, n = e.b;
  if (n != null && n.is_pending && (t.f & (Pn | Sn | Ii)) !== 0 && (t.f & nn) === 0) {
    n.defer_effect(t);
    return;
  }
  for (; e.parent !== null; ) {
    e = e.parent;
    var i = e.f;
    if (Cn !== null && e === k && (t.f & Sn) === 0)
      return;
    if ((i & (Rt | je)) !== 0) {
      if ((i & X) === 0)
        return;
      e.f ^= X;
    }
  }
  se.push(e);
}
function ys(t, e) {
  if (!((t.f & je) !== 0 && (t.f & X) !== 0)) {
    (t.f & Q) !== 0 ? e.d.push(t) : (t.f & He) !== 0 && e.m.push(t), z(t, X);
    for (var n = t.first; n !== null; )
      ys(n, e), n = n.next;
  }
}
function Fl(t) {
  let e = 0, n = Zt(0), i;
  return () => {
    ji() && (p(n), Fi(() => (e === 0 && (i = Le(() => t(() => Yn(n)))), e += 1, () => {
      Wt(() => {
        e -= 1, e === 0 && (i == null || i(), i = void 0, Yn(n));
      });
    })));
  };
}
var ql = xn | rn;
function Gl(t, e, n, i) {
  new Ul(t, e, n, i);
}
var fe, rr, Ue, zt, ae, ze, he, Re, et, Bt, yt, En, $n, An, tt, Pr, G, bs, ws, Es, gi, yr, br, mi;
class Ul {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(e, n, i, r) {
    R(this, G);
    /** @type {Boundary | null} */
    j(this, "parent");
    j(this, "is_pending", !1);
    /**
     * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
     * Inherited from parent boundary, or defaults to identity.
     * @type {(error: unknown) => unknown}
     */
    j(this, "transform_error");
    /** @type {TemplateNode} */
    R(this, fe);
    /** @type {TemplateNode | null} */
    R(this, rr, L ? N : null);
    /** @type {BoundaryProps} */
    R(this, Ue);
    /** @type {((anchor: Node) => void)} */
    R(this, zt);
    /** @type {Effect} */
    R(this, ae);
    /** @type {Effect | null} */
    R(this, ze, null);
    /** @type {Effect | null} */
    R(this, he, null);
    /** @type {Effect | null} */
    R(this, Re, null);
    /** @type {DocumentFragment | null} */
    R(this, et, null);
    R(this, Bt, 0);
    R(this, yt, 0);
    R(this, En, !1);
    /** @type {Set<Effect>} */
    R(this, $n, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    R(this, An, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    R(this, tt, null);
    R(this, Pr, Fl(() => (T(this, tt, Zt(h(this, Bt))), () => {
      T(this, tt, null);
    })));
    var a;
    T(this, fe, e), T(this, Ue, n), T(this, zt, (s) => {
      var o = (
        /** @type {Effect} */
        k
      );
      o.b = this, o.f |= di, i(s);
    }), this.parent = /** @type {Effect} */
    k.b, this.transform_error = r ?? ((a = this.parent) == null ? void 0 : a.transform_error) ?? ((s) => s), T(this, ae, qi(() => {
      if (L) {
        const s = (
          /** @type {Comment} */
          h(this, rr)
        );
        Tn();
        const o = s.data === Ci;
        if (s.data.startsWith(ha)) {
          const c = JSON.parse(s.data.slice(ha.length));
          q(this, G, ws).call(this, c);
        } else o ? q(this, G, Es).call(this) : q(this, G, bs).call(this);
      } else
        q(this, G, gi).call(this);
    }, ql)), L && T(this, fe, N);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    vs(e, h(this, $n), h(this, An));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!h(this, Ue).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(e) {
    q(this, G, mi).call(this, e), T(this, Bt, h(this, Bt) + e), !(!h(this, tt) || h(this, En)) && (T(this, En, !0), Wt(() => {
      T(this, En, !1), h(this, tt) && Rn(h(this, tt), h(this, Bt));
    }));
  }
  get_effect_pending() {
    return h(this, Pr).call(this), p(
      /** @type {Source<number>} */
      h(this, tt)
    );
  }
  /** @param {unknown} error */
  error(e) {
    var n = h(this, Ue).onerror;
    let i = h(this, Ue).failed;
    if (!n && !i)
      throw e;
    h(this, ze) && (ie(h(this, ze)), T(this, ze, null)), h(this, he) && (ie(h(this, he)), T(this, he, null)), h(this, Re) && (ie(h(this, Re)), T(this, Re, null)), L && (re(
      /** @type {TemplateNode} */
      h(this, rr)
    ), Ll(), re(Nr()));
    var r = !1, a = !1;
    const s = () => {
      if (r) {
        Il();
        return;
      }
      r = !0, a && Rl(), h(this, Re) !== null && Yt(h(this, Re), () => {
        T(this, Re, null);
      }), q(this, G, br).call(this, () => {
        st.ensure(), q(this, G, gi).call(this);
      });
    }, o = (l) => {
      try {
        a = !0, n == null || n(l, s), a = !1;
      } catch (c) {
        bt(c, h(this, ae) && h(this, ae).parent);
      }
      i && T(this, Re, q(this, G, br).call(this, () => {
        st.ensure();
        try {
          return we(() => {
            var c = (
              /** @type {Effect} */
              k
            );
            c.b = this, c.f |= di, i(
              h(this, fe),
              () => l,
              () => s
            );
          });
        } catch (c) {
          return bt(
            c,
            /** @type {Effect} */
            h(this, ae).parent
          ), null;
        }
      }));
    };
    Wt(() => {
      var l;
      try {
        l = this.transform_error(e);
      } catch (c) {
        bt(c, h(this, ae) && h(this, ae).parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        o,
        /** @param {unknown} e */
        (c) => bt(c, h(this, ae) && h(this, ae).parent)
      ) : o(l);
    });
  }
}
fe = new WeakMap(), rr = new WeakMap(), Ue = new WeakMap(), zt = new WeakMap(), ae = new WeakMap(), ze = new WeakMap(), he = new WeakMap(), Re = new WeakMap(), et = new WeakMap(), Bt = new WeakMap(), yt = new WeakMap(), En = new WeakMap(), $n = new WeakMap(), An = new WeakMap(), tt = new WeakMap(), Pr = new WeakMap(), G = new WeakSet(), bs = function() {
  try {
    T(this, ze, we(() => h(this, zt).call(this, h(this, fe))));
  } catch (e) {
    this.error(e);
  }
}, /**
 * @param {unknown} error The deserialized error from the server's hydration comment
 */
ws = function(e) {
  const n = h(this, Ue).failed;
  n && T(this, Re, we(() => {
    n(
      h(this, fe),
      () => e,
      () => () => {
      }
    );
  }));
}, Es = function() {
  const e = h(this, Ue).pending;
  e && (this.is_pending = !0, T(this, he, we(() => e(h(this, fe)))), Wt(() => {
    var n = T(this, et, document.createDocumentFragment()), i = $e();
    n.append(i), T(this, ze, q(this, G, br).call(this, () => (st.ensure(), we(() => h(this, zt).call(this, i))))), h(this, yt) === 0 && (h(this, fe).before(n), T(this, et, null), Yt(
      /** @type {Effect} */
      h(this, he),
      () => {
        T(this, he, null);
      }
    ), q(this, G, yr).call(this));
  }));
}, gi = function() {
  try {
    if (this.is_pending = this.has_pending_snippet(), T(this, yt, 0), T(this, Bt, 0), T(this, ze, we(() => {
      h(this, zt).call(this, h(this, fe));
    })), h(this, yt) > 0) {
      var e = T(this, et, document.createDocumentFragment());
      zi(h(this, ze), e);
      const n = (
        /** @type {(anchor: Node) => void} */
        h(this, Ue).pending
      );
      T(this, he, we(() => n(h(this, fe))));
    } else
      q(this, G, yr).call(this);
  } catch (n) {
    this.error(n);
  }
}, yr = function() {
  this.is_pending = !1;
  for (const e of h(this, $n))
    z(e, Q), Ve(e);
  for (const e of h(this, An))
    z(e, He), Ve(e);
  h(this, $n).clear(), h(this, An).clear();
}, /**
 * @template T
 * @param {() => T} fn
 */
br = function(e) {
  var n = k, i = I, r = ve;
  Oe(h(this, ae)), le(h(this, ae)), Nn(h(this, ae).ctx);
  try {
    return e();
  } catch (a) {
    return hs(a), null;
  } finally {
    Oe(n), le(i), Nn(r);
  }
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
mi = function(e) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && q(n = this.parent, G, mi).call(n, e);
    return;
  }
  T(this, yt, h(this, yt) + e), h(this, yt) === 0 && (q(this, G, yr).call(this), h(this, he) && Yt(h(this, he), () => {
    T(this, he, null);
  }), h(this, et) && (h(this, fe).before(h(this, et)), T(this, et, null)));
};
function zl(t, e, n, i) {
  const r = Fr;
  var a = t.filter((d) => !d.settled);
  if (n.length === 0 && a.length === 0) {
    i(e.map(r));
    return;
  }
  var s = (
    /** @type {Effect} */
    k
  ), o = Bl(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((d) => d.promise)) : null;
  function c(d) {
    o();
    try {
      i(d);
    } catch (b) {
      (s.f & We) === 0 && bt(b, s);
    }
    yi();
  }
  if (n.length === 0) {
    l.then(() => c(e.map(r)));
    return;
  }
  function u() {
    o(), Promise.all(n.map((d) => /* @__PURE__ */ Wl(d))).then((d) => c([...e.map(r), ...d])).catch((d) => bt(d, s));
  }
  l ? l.then(u) : u();
}
function Bl() {
  var t = k, e = I, n = ve, i = P;
  return function(a = !0) {
    Oe(t), le(e), Nn(n), a && (i == null || i.activate());
  };
}
function yi(t = !0) {
  Oe(null), le(null), Nn(null), t && (P == null || P.deactivate());
}
function Vl() {
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
function Fr(t) {
  var e = Z | Q, n = I !== null && (I.f & Z) !== 0 ? (
    /** @type {Derived} */
    I
  ) : null;
  return k !== null && (k.f |= rn), {
    ctx: ve,
    deps: null,
    effects: null,
    equals: cs,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      J
    ),
    wv: 0,
    parent: n ?? k,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Wl(t, e, n) {
  /** @type {Effect | null} */
  k === null && wl();
  var r = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Zt(
    /** @type {V} */
    J
  ), s = !I, o = /* @__PURE__ */ new Map();
  return ic(() => {
    var b;
    var l = os();
    r = l.promise;
    try {
      Promise.resolve(t()).then(l.resolve, l.reject).finally(yi);
    } catch (w) {
      l.reject(w), yi();
    }
    var c = (
      /** @type {Batch} */
      P
    );
    if (s) {
      var u = Vl();
      (b = o.get(c)) == null || b.reject(Ht), o.delete(c), o.set(c, l);
    }
    const d = (w, g = void 0) => {
      if (c.activate(), g)
        g !== Ht && (a.f |= Et, Rn(a, g));
      else {
        (a.f & Et) !== 0 && (a.f ^= Et), Rn(a, w);
        for (const [A, f] of o) {
          if (o.delete(A), A === c) break;
          f.reject(Ht);
        }
      }
      u && u();
    };
    l.promise.then(d, (w) => d(null, w || "unknown"));
  }), tc(() => {
    for (const l of o.values())
      l.reject(Ht);
  }), new Promise((l) => {
    function c(u) {
      function d() {
        u === r ? l(a) : c(r);
      }
      u.then(d, d);
    }
    c(r);
  });
}
// @__NO_SIDE_EFFECTS__
function qn(t) {
  const e = /* @__PURE__ */ Fr(t);
  return qs(e), e;
}
// @__NO_SIDE_EFFECTS__
function Yl(t) {
  const e = /* @__PURE__ */ Fr(t);
  return e.equals = us, e;
}
function Jl(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var n = 0; n < e.length; n += 1)
      ie(
        /** @type {Effect} */
        e[n]
      );
  }
}
function Kl(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & Z) === 0)
      return (e.f & We) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function Mi(t) {
  var e, n = k;
  Oe(Kl(t));
  try {
    t.f &= ~Qt, Jl(t), e = Bs(t);
  } finally {
    Oe(n);
  }
  return e;
}
function $s(t) {
  var e = Mi(t);
  if (!t.equals(e) && (t.wv = Us(), (!(P != null && P.is_fork) || t.deps === null) && (t.v = e, t.deps === null))) {
    z(t, X);
    return;
  }
  xt || (K !== null ? (ji() || P != null && P.is_fork) && K.set(t, e) : Di(t));
}
function Xl(t) {
  var e, n;
  if (t.effects !== null)
    for (const i of t.effects)
      (i.teardown || i.ac) && ((e = i.teardown) == null || e.call(i), (n = i.ac) == null || n.abort(Ht), i.teardown = hl, i.ac = null, Zn(i, 0), Gi(i));
}
function As(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && In(e);
}
let bi = /* @__PURE__ */ new Set();
const $t = /* @__PURE__ */ new Map();
let Os = !1;
function Zt(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: cs,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function M(t, e) {
  const n = Zt(t);
  return qs(n), n;
}
// @__NO_SIDE_EFFECTS__
function Ss(t, e = !1, n = !0) {
  const i = Zt(t);
  return e || (i.equals = us), i;
}
function O(t, e, n = !1) {
  I !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Me || (I.f & va) !== 0) && ds() && (I.f & (Z | Ct | Li | va)) !== 0 && (Ae === null || !On.call(Ae, t)) && Cl();
  let i = n ? it(e) : e;
  return Rn(t, i);
}
function Rn(t, e) {
  if (!t.equals(e)) {
    var n = t.v;
    xt ? $t.set(t, e) : $t.set(t, n), t.v = e;
    var i = st.ensure();
    if (i.capture(t, n), (t.f & Z) !== 0) {
      const r = (
        /** @type {Derived} */
        t
      );
      (t.f & Q) !== 0 && Mi(r), Di(r);
    }
    t.wv = Us(), xs(t, Q), k !== null && (k.f & X) !== 0 && (k.f & (je | Rt)) === 0 && (ge === null ? sc([t]) : ge.push(t)), !i.is_fork && bi.size > 0 && !Os && Ql();
  }
  return e;
}
function Ql() {
  Os = !1;
  for (const t of bi)
    (t.f & X) !== 0 && z(t, He), or(t) && In(t);
  bi.clear();
}
function Yn(t) {
  O(t, t.v + 1);
}
function xs(t, e) {
  var n = t.reactions;
  if (n !== null)
    for (var i = n.length, r = 0; r < i; r++) {
      var a = n[r], s = a.f, o = (s & Q) === 0;
      if (o && z(a, e), (s & Z) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        K == null || K.delete(l), (s & Qt) === 0 && (s & Ee && (a.f |= Qt), xs(l, He));
      } else o && ((s & Ct) !== 0 && Ne !== null && Ne.add(
        /** @type {Effect} */
        a
      ), Ve(
        /** @type {Effect} */
        a
      ));
    }
}
function it(t) {
  if (typeof t != "object" || t === null || mr in t)
    return t;
  const e = ss(t);
  if (e !== dl && e !== fl)
    return t;
  var n = /* @__PURE__ */ new Map(), i = as(t), r = /* @__PURE__ */ M(0), a = Jt, s = (o) => {
    if (Jt === a)
      return o();
    var l = I, c = Jt;
    le(null), ba(a);
    var u = o();
    return le(l), ba(c), u;
  };
  return i && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Tl();
        var u = n.get(l);
        return u === void 0 ? s(() => {
          var d = /* @__PURE__ */ M(c.value);
          return n.set(l, d), d;
        }) : O(u, c.value, !0), !0;
      },
      deleteProperty(o, l) {
        var c = n.get(l);
        if (c === void 0) {
          if (l in o) {
            const u = s(() => /* @__PURE__ */ M(J));
            n.set(l, u), Yn(r);
          }
        } else
          O(c, J), Yn(r);
        return !0;
      },
      get(o, l, c) {
        var w;
        if (l === mr)
          return t;
        var u = n.get(l), d = l in o;
        if (u === void 0 && (!d || (w = vn(o, l)) != null && w.writable) && (u = s(() => {
          var g = it(d ? o[l] : J), A = /* @__PURE__ */ M(g);
          return A;
        }), n.set(l, u)), u !== void 0) {
          var b = p(u);
          return b === J ? void 0 : b;
        }
        return Reflect.get(o, l, c);
      },
      getOwnPropertyDescriptor(o, l) {
        var c = Reflect.getOwnPropertyDescriptor(o, l);
        if (c && "value" in c) {
          var u = n.get(l);
          u && (c.value = p(u));
        } else if (c === void 0) {
          var d = n.get(l), b = d == null ? void 0 : d.v;
          if (d !== void 0 && b !== J)
            return {
              enumerable: !0,
              configurable: !0,
              value: b,
              writable: !0
            };
        }
        return c;
      },
      has(o, l) {
        var b;
        if (l === mr)
          return !0;
        var c = n.get(l), u = c !== void 0 && c.v !== J || Reflect.has(o, l);
        if (c !== void 0 || k !== null && (!u || (b = vn(o, l)) != null && b.writable)) {
          c === void 0 && (c = s(() => {
            var w = u ? it(o[l]) : J, g = /* @__PURE__ */ M(w);
            return g;
          }), n.set(l, c));
          var d = p(c);
          if (d === J)
            return !1;
        }
        return u;
      },
      set(o, l, c, u) {
        var y;
        var d = n.get(l), b = l in o;
        if (i && l === "length")
          for (var w = c; w < /** @type {Source<number>} */
          d.v; w += 1) {
            var g = n.get(w + "");
            g !== void 0 ? O(g, J) : w in o && (g = s(() => /* @__PURE__ */ M(J)), n.set(w + "", g));
          }
        if (d === void 0)
          (!b || (y = vn(o, l)) != null && y.writable) && (d = s(() => /* @__PURE__ */ M(void 0)), O(d, it(c)), n.set(l, d));
        else {
          b = d.v !== J;
          var A = s(() => it(c));
          O(d, A);
        }
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f != null && f.set && f.set.call(u, c), !b) {
          if (i && typeof l == "string") {
            var v = (
              /** @type {Source<number>} */
              n.get("length")
            ), _ = Number(l);
            Number.isInteger(_) && _ >= v.v && O(v, _ + 1);
          }
          Yn(r);
        }
        return !0;
      },
      ownKeys(o) {
        p(r);
        var l = Reflect.ownKeys(o).filter((d) => {
          var b = n.get(d);
          return b === void 0 || b.v !== J;
        });
        for (var [c, u] of n)
          u.v !== J && !(c in o) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        Nl();
      }
    }
  );
}
var ga, Ts, Ns, Cs;
function wi() {
  if (ga === void 0) {
    ga = window, Ts = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    Ns = vn(e, "firstChild").get, Cs = vn(e, "nextSibling").get, pa(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), pa(n) && (n.__t = void 0);
  }
}
function $e(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Ye(t) {
  return (
    /** @type {TemplateNode | null} */
    Ns.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function Fe(t) {
  return (
    /** @type {TemplateNode | null} */
    Cs.call(t)
  );
}
function dt(t, e) {
  if (!L)
    return /* @__PURE__ */ Ye(t);
  var n = /* @__PURE__ */ Ye(N);
  if (n === null)
    n = N.appendChild($e());
  else if (e && n.nodeType !== Hr) {
    var i = $e();
    return n == null || n.before(i), re(i), i;
  }
  return e && Hi(
    /** @type {Text} */
    n
  ), re(n), n;
}
function ma(t, e = !1) {
  if (!L) {
    var n = /* @__PURE__ */ Ye(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Fe(n) : n;
  }
  if (e) {
    if ((N == null ? void 0 : N.nodeType) !== Hr) {
      var i = $e();
      return N == null || N.before(i), re(i), i;
    }
    Hi(
      /** @type {Text} */
      N
    );
  }
  return N;
}
function Pt(t, e = 1, n = !1) {
  let i = L ? N : t;
  for (var r; e--; )
    r = i, i = /** @type {TemplateNode} */
    /* @__PURE__ */ Fe(i);
  if (!L)
    return i;
  if (n) {
    if ((i == null ? void 0 : i.nodeType) !== Hr) {
      var a = $e();
      return i === null ? r == null || r.after(a) : i.before(a), re(a), a;
    }
    Hi(
      /** @type {Text} */
      i
    );
  }
  return re(i), i;
}
function Rs(t) {
  t.textContent = "";
}
function Is() {
  return !1;
}
function qr(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(e ?? is, t, void 0)
  );
}
function Hi(t) {
  if (
    /** @type {string} */
    t.nodeValue.length < 65536
  )
    return;
  let e = t.nextSibling;
  for (; e !== null && e.nodeType === Hr; )
    e.remove(), t.nodeValue += /** @type {string} */
    e.nodeValue, e = t.nextSibling;
}
function Ls(t) {
  var e = I, n = k;
  le(null), Oe(null);
  try {
    return t();
  } finally {
    le(e), Oe(n);
  }
}
function Zl(t) {
  k === null && (I === null && Ol(), Al()), xt && $l();
}
function ec(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Je(t, e) {
  var n = k;
  n !== null && (n.f & ne) !== 0 && (t |= ne);
  var i = {
    ctx: ve,
    deps: null,
    nodes: null,
    f: t | Q | Ee,
    first: null,
    fn: e,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }, r = i;
  if ((t & Pn) !== 0)
    Cn !== null ? Cn.push(i) : Ve(i);
  else if (e !== null) {
    try {
      In(i);
    } catch (s) {
      throw ie(i), s;
    }
    r.deps === null && r.teardown === null && r.nodes === null && r.first === r.last && // either `null`, or a singular child
    (r.f & rn) === 0 && (r = r.first, (t & Ct) !== 0 && (t & xn) !== 0 && r !== null && (r.f |= xn));
  }
  if (r !== null && (r.parent = n, n !== null && ec(r, n), I !== null && (I.f & Z) !== 0 && (t & Rt) === 0)) {
    var a = (
      /** @type {Derived} */
      I
    );
    (a.effects ?? (a.effects = [])).push(r);
  }
  return i;
}
function ji() {
  return I !== null && !Me;
}
function tc(t) {
  const e = Je(Sn, null);
  return z(e, X), e.teardown = t, e;
}
function _n(t) {
  Zl();
  var e = (
    /** @type {Effect} */
    k.f
  ), n = !I && (e & je) !== 0 && (e & nn) === 0;
  if (n) {
    var i = (
      /** @type {ComponentContext} */
      ve
    );
    (i.e ?? (i.e = [])).push(t);
  } else
    return ks(t);
}
function ks(t) {
  return Je(Pn | _l, t);
}
function nc(t) {
  st.ensure();
  const e = Je(Rt | rn, t);
  return () => {
    ie(e);
  };
}
function rc(t) {
  st.ensure();
  const e = Je(Rt | rn, t);
  return (n = {}) => new Promise((i) => {
    n.outro ? Yt(e, () => {
      ie(e), i(void 0);
    }) : (ie(e), i(void 0));
  });
}
function Ps(t) {
  return Je(Pn, t);
}
function ic(t) {
  return Je(Li | rn, t);
}
function Fi(t, e = 0) {
  return Je(Sn | e, t);
}
function Qe(t, e = [], n = [], i = []) {
  zl(i, e, n, (r) => {
    Je(Sn, () => t(...r.map(p)));
  });
}
function qi(t, e = 0) {
  var n = Je(Ct | e, t);
  return n;
}
function we(t) {
  return Je(je | rn, t);
}
function Ds(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = xt, i = I;
    ya(!0), le(null);
    try {
      e.call(null);
    } finally {
      ya(n), le(i);
    }
  }
}
function Gi(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const r = n.ac;
    r !== null && Ls(() => {
      r.abort(Ht);
    });
    var i = n.next;
    (n.f & Rt) !== 0 ? n.parent = null : ie(n, e), n = i;
  }
}
function ac(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & je) === 0 && ie(e), e = n;
  }
}
function ie(t, e = !0) {
  var n = !1;
  (e || (t.f & vl) !== 0) && t.nodes !== null && t.nodes.end !== null && (Ms(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), Gi(t, e && !n), Zn(t, 0), z(t, We);
  var i = t.nodes && t.nodes.t;
  if (i !== null)
    for (const a of i)
      a.stop();
  Ds(t);
  var r = t.parent;
  r !== null && r.first !== null && Hs(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = null;
}
function Ms(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ Fe(t);
    t.remove(), t = n;
  }
}
function Hs(t) {
  var e = t.parent, n = t.prev, i = t.next;
  n !== null && (n.next = i), i !== null && (i.prev = n), e !== null && (e.first === t && (e.first = i), e.last === t && (e.last = n));
}
function Yt(t, e, n = !0) {
  var i = [];
  js(t, i, !0);
  var r = () => {
    n && ie(t), e && e();
  }, a = i.length;
  if (a > 0) {
    var s = () => --a || r();
    for (var o of i)
      o.out(s);
  } else
    r();
}
function js(t, e, n) {
  if ((t.f & ne) === 0) {
    t.f ^= ne;
    var i = t.nodes && t.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || n) && e.push(o);
    for (var r = t.first; r !== null; ) {
      var a = r.next, s = (r.f & xn) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (r.f & je) !== 0 && (t.f & Ct) !== 0;
      js(r, e, s ? n : !1), r = a;
    }
  }
}
function Ui(t) {
  Fs(t, !0);
}
function Fs(t, e) {
  if ((t.f & ne) !== 0) {
    t.f ^= ne;
    for (var n = t.first; n !== null; ) {
      var i = n.next, r = (n.f & xn) !== 0 || (n.f & je) !== 0;
      Fs(n, r ? e : !1), n = i;
    }
    var a = t.nodes && t.nodes.t;
    if (a !== null)
      for (const s of a)
        (s.is_global || e) && s.in();
  }
}
function zi(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, i = t.nodes.end; n !== null; ) {
      var r = n === i ? null : /* @__PURE__ */ Fe(n);
      e.append(n), n = r;
    }
}
let wr = !1, xt = !1;
function ya(t) {
  xt = t;
}
let I = null, Me = !1;
function le(t) {
  I = t;
}
let k = null;
function Oe(t) {
  k = t;
}
let Ae = null;
function qs(t) {
  I !== null && (Ae === null ? Ae = [t] : Ae.push(t));
}
let oe = null, de = 0, ge = null;
function sc(t) {
  ge = t;
}
let Gs = 1, Ft = 0, Jt = Ft;
function ba(t) {
  Jt = t;
}
function Us() {
  return ++Gs;
}
function or(t) {
  var e = t.f;
  if ((e & Q) !== 0)
    return !0;
  if (e & Z && (t.f &= ~Qt), (e & He) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), i = n.length, r = 0; r < i; r++) {
      var a = n[r];
      if (or(
        /** @type {Derived} */
        a
      ) && $s(
        /** @type {Derived} */
        a
      ), a.wv > t.wv)
        return !0;
    }
    (e & Ee) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    K === null && z(t, X);
  }
  return !1;
}
function zs(t, e, n = !0) {
  var i = t.reactions;
  if (i !== null && !(Ae !== null && On.call(Ae, t)))
    for (var r = 0; r < i.length; r++) {
      var a = i[r];
      (a.f & Z) !== 0 ? zs(
        /** @type {Derived} */
        a,
        e,
        !1
      ) : e === a && (n ? z(a, Q) : (a.f & X) !== 0 && z(a, He), Ve(
        /** @type {Effect} */
        a
      ));
    }
}
function Bs(t) {
  var A;
  var e = oe, n = de, i = ge, r = I, a = Ae, s = ve, o = Me, l = Jt, c = t.f;
  oe = /** @type {null | Value[]} */
  null, de = 0, ge = null, I = (c & (je | Rt)) === 0 ? t : null, Ae = null, Nn(t.ctx), Me = !1, Jt = ++Ft, t.ac !== null && (Ls(() => {
    t.ac.abort(Ht);
  }), t.ac = null);
  try {
    t.f |= fi;
    var u = (
      /** @type {Function} */
      t.fn
    ), d = u();
    t.f |= nn;
    var b = t.deps, w = P == null ? void 0 : P.is_fork;
    if (oe !== null) {
      var g;
      if (w || Zn(t, de), b !== null && de > 0)
        for (b.length = de + oe.length, g = 0; g < oe.length; g++)
          b[de + g] = oe[g];
      else
        t.deps = b = oe;
      if (ji() && (t.f & Ee) !== 0)
        for (g = de; g < b.length; g++)
          ((A = b[g]).reactions ?? (A.reactions = [])).push(t);
    } else !w && b !== null && de < b.length && (Zn(t, de), b.length = de);
    if (ds() && ge !== null && !Me && b !== null && (t.f & (Z | He | Q)) === 0)
      for (g = 0; g < /** @type {Source[]} */
      ge.length; g++)
        zs(
          ge[g],
          /** @type {Effect} */
          t
        );
    if (r !== null && r !== t) {
      if (Ft++, r.deps !== null)
        for (let f = 0; f < n; f += 1)
          r.deps[f].rv = Ft;
      if (e !== null)
        for (const f of e)
          f.rv = Ft;
      ge !== null && (i === null ? i = ge : i.push(.../** @type {Source[]} */
      ge));
    }
    return (t.f & Et) !== 0 && (t.f ^= Et), d;
  } catch (f) {
    return hs(f);
  } finally {
    t.f ^= fi, oe = e, de = n, ge = i, I = r, Ae = a, Nn(s), Me = o, Jt = l;
  }
}
function oc(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var i = cl.call(n, t);
    if (i !== -1) {
      var r = n.length - 1;
      r === 0 ? n = e.reactions = null : (n[i] = n[r], n.pop());
    }
  }
  if (n === null && (e.f & Z) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (oe === null || !On.call(oe, e))) {
    var a = (
      /** @type {Derived} */
      e
    );
    (a.f & Ee) !== 0 && (a.f ^= Ee, a.f &= ~Qt), Di(a), Xl(a), Zn(a, 0);
  }
}
function Zn(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var i = e; i < n.length; i++)
      oc(t, n[i]);
}
function In(t) {
  var e = t.f;
  if ((e & We) === 0) {
    z(t, X);
    var n = k, i = wr;
    k = t, wr = !0;
    try {
      (e & (Ct | Ii)) !== 0 ? ac(t) : Gi(t), Ds(t);
      var r = Bs(t);
      t.teardown = typeof r == "function" ? r : null, t.wv = Gs;
      var a;
      ui && Pl && (t.f & Q) !== 0 && t.deps;
    } finally {
      wr = i, k = n;
    }
  }
}
function p(t) {
  var e = t.f, n = (e & Z) !== 0;
  if (I !== null && !Me) {
    var i = k !== null && (k.f & We) !== 0;
    if (!i && (Ae === null || !On.call(Ae, t))) {
      var r = I.deps;
      if ((I.f & fi) !== 0)
        t.rv < Ft && (t.rv = Ft, oe === null && r !== null && r[de] === t ? de++ : oe === null ? oe = [t] : oe.push(t));
      else {
        (I.deps ?? (I.deps = [])).push(t);
        var a = t.reactions;
        a === null ? t.reactions = [I] : On.call(a, I) || a.push(I);
      }
    }
  }
  if (xt && $t.has(t))
    return $t.get(t);
  if (n) {
    var s = (
      /** @type {Derived} */
      t
    );
    if (xt) {
      var o = s.v;
      return ((s.f & X) === 0 && s.reactions !== null || Ws(s)) && (o = Mi(s)), $t.set(s, o), o;
    }
    var l = (s.f & Ee) === 0 && !Me && I !== null && (wr || (I.f & Ee) !== 0), c = (s.f & nn) === 0;
    or(s) && (l && (s.f |= Ee), $s(s)), l && !c && (As(s), Vs(s));
  }
  if (K != null && K.has(t))
    return K.get(t);
  if ((t.f & Et) !== 0)
    throw t.v;
  return t.v;
}
function Vs(t) {
  if (t.f |= Ee, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & Z) !== 0 && (e.f & Ee) === 0 && (As(
        /** @type {Derived} */
        e
      ), Vs(
        /** @type {Derived} */
        e
      ));
}
function Ws(t) {
  if (t.v === J) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if ($t.has(e) || (e.f & Z) !== 0 && Ws(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Le(t) {
  var e = Me;
  try {
    return Me = !0, t();
  } finally {
    Me = e;
  }
}
const qt = Symbol("events"), Ys = /* @__PURE__ */ new Set(), Ei = /* @__PURE__ */ new Set();
function Jr(t, e, n) {
  (e[qt] ?? (e[qt] = {}))[t] = n;
}
function lc(t) {
  for (var e = 0; e < t.length; e++)
    Ys.add(t[e]);
  for (var n of Ei)
    n(t);
}
let wa = null;
function Ea(t) {
  var f, v;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), i = t.type, r = ((f = t.composedPath) == null ? void 0 : f.call(t)) || [], a = (
    /** @type {null | Element} */
    r[0] || t.target
  );
  wa = t;
  var s = 0, o = wa === t && t[qt];
  if (o) {
    var l = r.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t[qt] = e;
      return;
    }
    var c = r.indexOf(e);
    if (c === -1)
      return;
    l <= c && (s = l);
  }
  if (a = /** @type {Element} */
  r[s] || t.target, a !== e) {
    Tr(t, "currentTarget", {
      configurable: !0,
      get() {
        return a || n;
      }
    });
    var u = I, d = k;
    le(null), Oe(null);
    try {
      for (var b, w = []; a !== null; ) {
        var g = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var A = (v = a[qt]) == null ? void 0 : v[i];
          A != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === a) && A.call(a, t);
        } catch (_) {
          b ? w.push(_) : b = _;
        }
        if (t.cancelBubble || g === e || g === null)
          break;
        a = g;
      }
      if (b) {
        for (let _ of w)
          queueMicrotask(() => {
            throw _;
          });
        throw b;
      }
    } finally {
      t[qt] = e, delete t.currentTarget, le(u), Oe(d);
    }
  }
}
var ts;
const Kr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  ((ts = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : ts.trustedTypes) && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function cc(t) {
  return (
    /** @type {string} */
    (Kr == null ? void 0 : Kr.createHTML(t)) ?? t
  );
}
function uc(t) {
  var e = qr("template");
  return e.innerHTML = cc(t.replaceAll("<!>", "<!---->")), e.content;
}
function At(t, e) {
  var n = (
    /** @type {Effect} */
    k
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ot(t, e) {
  var n = (e & al) !== 0, i = (e & sl) !== 0, r, a = !t.startsWith("<!>");
  return () => {
    if (L)
      return At(N, null), N;
    r === void 0 && (r = uc(a ? t : "<!>" + t), n || (r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ye(r)));
    var s = (
      /** @type {TemplateNode} */
      i || Ts ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(s)
      ), l = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      At(o, l);
    } else
      At(s, s);
    return s;
  };
}
function $a() {
  if (L)
    return At(N, null), N;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = $e();
  return t.append(e, n), At(e, n), t;
}
function me(t, e) {
  if (L) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      k
    );
    ((n.f & nn) === 0 || n.nodes.end === null) && (n.nodes.end = N), Tn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const dc = ["touchstart", "touchmove"];
function fc(t) {
  return dc.includes(t);
}
function hc(t, e) {
  var n = e == null ? "" : typeof e == "object" ? `${e}` : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = `${n}`);
}
function Js(t, e) {
  return Ks(t, e);
}
function pc(t, e) {
  wi(), e.intro = e.intro ?? !1;
  const n = e.target, i = L, r = N;
  try {
    for (var a = /* @__PURE__ */ Ye(n); a && (a.nodeType !== Dn || /** @type {Comment} */
    a.data !== rs); )
      a = /* @__PURE__ */ Fe(a);
    if (!a)
      throw Xt;
    De(!0), re(
      /** @type {Comment} */
      a
    );
    const s = Ks(t, { ...e, anchor: a });
    return De(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s instanceof Error && s.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw s;
    return s !== Xt && console.warn("Failed to hydrate: ", s), e.recover === !1 && xl(), wi(), Rs(n), De(!1), Js(t, e);
  } finally {
    De(i), re(r);
  }
}
const hr = /* @__PURE__ */ new Map();
function Ks(t, { target: e, anchor: n, props: i = {}, events: r, context: a, intro: s = !0, transformError: o }) {
  wi();
  var l = void 0, c = rc(() => {
    var u = n ?? e.appendChild($e());
    Gl(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (w) => {
        ki({});
        var g = (
          /** @type {ComponentContext} */
          ve
        );
        if (a && (g.c = a), r && (i.$$events = r), L && At(
          /** @type {TemplateNode} */
          w,
          null
        ), l = t(w, i) || {}, L && (k.nodes.end = N, N === null || N.nodeType !== Dn || /** @type {Comment} */
        N.data !== Ri))
          throw sr(), Xt;
        Pi();
      },
      o
    );
    var d = /* @__PURE__ */ new Set(), b = (w) => {
      for (var g = 0; g < w.length; g++) {
        var A = w[g];
        if (!d.has(A)) {
          d.add(A);
          var f = fc(A);
          for (const y of [e, document]) {
            var v = hr.get(y);
            v === void 0 && (v = /* @__PURE__ */ new Map(), hr.set(y, v));
            var _ = v.get(A);
            _ === void 0 ? (y.addEventListener(A, Ea, { passive: f }), v.set(A, 1)) : v.set(A, _ + 1);
          }
        }
      }
    };
    return b(Mr(Ys)), Ei.add(b), () => {
      var f;
      for (var w of d)
        for (const v of [e, document]) {
          var g = (
            /** @type {Map<string, number>} */
            hr.get(v)
          ), A = (
            /** @type {number} */
            g.get(w)
          );
          --A == 0 ? (v.removeEventListener(w, Ea), g.delete(w), g.size === 0 && hr.delete(v)) : g.set(w, A);
        }
      Ei.delete(b), u !== n && ((f = u.parentNode) == null || f.removeChild(u));
    };
  });
  return $i.set(l, c), l;
}
let $i = /* @__PURE__ */ new WeakMap();
function vc(t, e) {
  const n = $i.get(t);
  return n ? ($i.delete(t), n(e)) : Promise.resolve();
}
var Ie, Be, pe, Vt, ir, ar, Dr;
class _c {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    j(this, "anchor");
    /** @type {Map<Batch, Key>} */
    R(this, Ie, /* @__PURE__ */ new Map());
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
    R(this, Be, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    R(this, pe, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    R(this, Vt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    R(this, ir, !0);
    /**
     * @param {Batch} batch
     */
    R(this, ar, (e) => {
      if (h(this, Ie).has(e)) {
        var n = (
          /** @type {Key} */
          h(this, Ie).get(e)
        ), i = h(this, Be).get(n);
        if (i)
          Ui(i), h(this, Vt).delete(n);
        else {
          var r = h(this, pe).get(n);
          r && (r.effect.f & ne) === 0 && (h(this, Be).set(n, r.effect), h(this, pe).delete(n), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), i = r.effect);
        }
        for (const [a, s] of h(this, Ie)) {
          if (h(this, Ie).delete(a), a === e)
            break;
          const o = h(this, pe).get(s);
          o && (ie(o.effect), h(this, pe).delete(s));
        }
        for (const [a, s] of h(this, Be)) {
          if (a === n || h(this, Vt).has(a) || (s.f & ne) !== 0) continue;
          const o = () => {
            if (Array.from(h(this, Ie).values()).includes(a)) {
              var c = document.createDocumentFragment();
              zi(s, c), c.append($e()), h(this, pe).set(a, { effect: s, fragment: c });
            } else
              ie(s);
            h(this, Vt).delete(a), h(this, Be).delete(a);
          };
          h(this, ir) || !i ? (h(this, Vt).add(a), Yt(s, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    R(this, Dr, (e) => {
      h(this, Ie).delete(e);
      const n = Array.from(h(this, Ie).values());
      for (const [i, r] of h(this, pe))
        n.includes(i) || (ie(r.effect), h(this, pe).delete(i));
    });
    this.anchor = e, T(this, ir, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, n) {
    var i = (
      /** @type {Batch} */
      P
    ), r = Is();
    if (n && !h(this, Be).has(e) && !h(this, pe).has(e))
      if (r) {
        var a = document.createDocumentFragment(), s = $e();
        a.append(s), h(this, pe).set(e, {
          effect: we(() => n(s)),
          fragment: a
        });
      } else
        h(this, Be).set(
          e,
          we(() => n(this.anchor))
        );
    if (h(this, Ie).set(i, e), r) {
      for (const [o, l] of h(this, Be))
        o === e ? i.unskip_effect(l) : i.skip_effect(l);
      for (const [o, l] of h(this, pe))
        o === e ? i.unskip_effect(l.effect) : i.skip_effect(l.effect);
      i.oncommit(h(this, ar)), i.ondiscard(h(this, Dr));
    } else
      L && (this.anchor = N), h(this, ar).call(this, i);
  }
}
Ie = new WeakMap(), Be = new WeakMap(), pe = new WeakMap(), Vt = new WeakMap(), ir = new WeakMap(), ar = new WeakMap(), Dr = new WeakMap();
function Xs(t) {
  ve === null && bl(), _n(() => {
    const e = Le(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ft(t, e, n = !1) {
  var i;
  L && (i = N, Tn());
  var r = new _c(t), a = n ? xn : 0;
  function s(o, l) {
    if (L) {
      var c = ls(
        /** @type {TemplateNode} */
        i
      );
      if (o !== parseInt(c.substring(1))) {
        var u = Nr();
        re(u), r.anchor = u, De(!1), r.ensure(o, l), De(!0);
        return;
      }
    }
    r.ensure(o, l);
  }
  qi(() => {
    var o = !1;
    e((l, c = 0) => {
      o = !0, s(c, l);
    }), o || s(-1, null);
  }, a);
}
function gc(t, e, n) {
  for (var i = [], r = e.length, a, s = e.length, o = 0; o < r; o++) {
    let d = e[o];
    Yt(
      d,
      () => {
        if (a) {
          if (a.pending.delete(d), a.done.add(d), a.pending.size === 0) {
            var b = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            Ai(t, Mr(a.done)), b.delete(a), b.size === 0 && (t.outrogroups = null);
          }
        } else
          s -= 1;
      },
      !1
    );
  }
  if (s === 0) {
    var l = i.length === 0 && n !== null;
    if (l) {
      var c = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        c.parentNode
      );
      Rs(u), u.append(c), t.items.clear();
    }
    Ai(t, e, !l);
  } else
    a = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(a);
}
function Ai(t, e, n = !0) {
  var i;
  if (t.pending.size > 0) {
    i = /* @__PURE__ */ new Set();
    for (const s of t.pending.values())
      for (const o of s)
        i.add(
          /** @type {EachItem} */
          t.items.get(o).e
        );
  }
  for (var r = 0; r < e.length; r++) {
    var a = e[r];
    if (i != null && i.has(a)) {
      a.f |= rt;
      const s = document.createDocumentFragment();
      zi(a, s);
    } else
      ie(e[r], n);
  }
}
var Aa;
function mc(t, e, n, i, r, a = null) {
  var s = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    s = L ? re(/* @__PURE__ */ Ye(l)) : l.appendChild($e());
  }
  L && Tn();
  var c = null, u = /* @__PURE__ */ Yl(() => {
    var _ = n();
    return as(_) ? _ : _ == null ? [] : Mr(_);
  }), d, b = /* @__PURE__ */ new Map(), w = !0;
  function g(_) {
    (v.effect.f & We) === 0 && (v.pending.delete(_), v.fallback = c, yc(v, d, s, e, i), c !== null && (d.length === 0 ? (c.f & rt) === 0 ? Ui(c) : (c.f ^= rt, Bn(c, null, s)) : Yt(c, () => {
      c = null;
    })));
  }
  function A(_) {
    v.pending.delete(_);
  }
  var f = qi(() => {
    d = /** @type {V[]} */
    p(u);
    var _ = d.length;
    let y = !1;
    if (L) {
      var x = ls(s) === Ci;
      x !== (_ === 0) && (s = Nr(), re(s), De(!1), y = !0);
    }
    for (var S = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      P
    ), D = Is(), H = 0; H < _; H += 1) {
      L && N.nodeType === Dn && /** @type {Comment} */
      N.data === Ri && (s = /** @type {Comment} */
      N, y = !0, De(!1));
      var V = d[H], It = i(V, H), ue = w ? null : o.get(It);
      ue ? (ue.v && Rn(ue.v, V), ue.i && Rn(ue.i, H), D && C.unskip_effect(ue.e)) : (ue = bc(
        o,
        w ? s : Aa ?? (Aa = $e()),
        V,
        It,
        H,
        r,
        e,
        n
      ), w || (ue.e.f |= rt), o.set(It, ue)), S.add(It);
    }
    if (_ === 0 && a && !c && (w ? c = we(() => a(s)) : (c = we(() => a(Aa ?? (Aa = $e()))), c.f |= rt)), _ > S.size && El(), L && _ > 0 && re(Nr()), !w)
      if (b.set(C, S), D) {
        for (const [dr, on] of o)
          S.has(dr) || C.skip_effect(on.e);
        C.oncommit(g), C.ondiscard(A);
      } else
        g(C);
    y && De(!0), p(u);
  }), v = { effect: f, items: o, pending: b, outrogroups: null, fallback: c };
  w = !1, L && (s = N);
}
function Gn(t) {
  for (; t !== null && (t.f & je) === 0; )
    t = t.next;
  return t;
}
function yc(t, e, n, i, r) {
  var H;
  var a = e.length, s = t.items, o = Gn(t.effect.first), l, c = null, u = [], d = [], b, w, g, A;
  for (A = 0; A < a; A += 1) {
    if (b = e[A], w = r(b, A), g = /** @type {EachItem} */
    s.get(w).e, t.outrogroups !== null)
      for (const V of t.outrogroups)
        V.pending.delete(g), V.done.delete(g);
    if ((g.f & rt) !== 0)
      if (g.f ^= rt, g === o)
        Bn(g, null, n);
      else {
        var f = c ? c.next : o;
        g === t.effect.last && (t.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), ct(t, c, g), ct(t, g, f), Bn(g, f, n), c = g, u = [], d = [], o = Gn(c.next);
        continue;
      }
    if ((g.f & ne) !== 0 && Ui(g), g !== o) {
      if (l !== void 0 && l.has(g)) {
        if (u.length < d.length) {
          var v = d[0], _;
          c = v.prev;
          var y = u[0], x = u[u.length - 1];
          for (_ = 0; _ < u.length; _ += 1)
            Bn(u[_], v, n);
          for (_ = 0; _ < d.length; _ += 1)
            l.delete(d[_]);
          ct(t, y.prev, x.next), ct(t, c, y), ct(t, x, v), o = v, c = x, A -= 1, u = [], d = [];
        } else
          l.delete(g), Bn(g, o, n), ct(t, g.prev, g.next), ct(t, g, c === null ? t.effect.first : c.next), ct(t, c, g), c = g;
        continue;
      }
      for (u = [], d = []; o !== null && o !== g; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), d.push(o), o = Gn(o.next);
      if (o === null)
        continue;
    }
    (g.f & rt) === 0 && u.push(g), c = g, o = Gn(g.next);
  }
  if (t.outrogroups !== null) {
    for (const V of t.outrogroups)
      V.pending.size === 0 && (Ai(t, Mr(V.done)), (H = t.outrogroups) == null || H.delete(V));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var S = [];
    if (l !== void 0)
      for (g of l)
        (g.f & ne) === 0 && S.push(g);
    for (; o !== null; )
      (o.f & ne) === 0 && o !== t.fallback && S.push(o), o = Gn(o.next);
    var C = S.length;
    if (C > 0) {
      var D = a === 0 ? n : null;
      gc(t, S, D);
    }
  }
}
function bc(t, e, n, i, r, a, s, o) {
  var l = (s & nl) !== 0 ? (s & il) === 0 ? /* @__PURE__ */ Ss(n, !1, !1) : Zt(n) : null, c = (s & rl) !== 0 ? Zt(r) : null;
  return {
    v: l,
    i: c,
    e: we(() => (a(e, l ?? n, c ?? r, o), () => {
      t.delete(i);
    }))
  };
}
function Bn(t, e, n) {
  if (t.nodes)
    for (var i = t.nodes.start, r = t.nodes.end, a = e && (e.f & rt) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; i !== null; ) {
      var s = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Fe(i)
      );
      if (a.before(i), i === r)
        return;
      i = s;
    }
}
function ct(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function wc(t, e, n = !1, i = !1, r = !1) {
  var a = t, s = "";
  Qe(() => {
    var o = (
      /** @type {Effect} */
      k
    );
    if (s === (s = e() ?? "")) {
      L && Tn();
      return;
    }
    if (o.nodes !== null && (Ms(
      o.nodes.start,
      /** @type {TemplateNode} */
      o.nodes.end
    ), o.nodes = null), s !== "") {
      if (L) {
        N.data;
        for (var l = Tn(), c = l; l !== null && (l.nodeType !== Dn || /** @type {Comment} */
        l.data !== ""); )
          c = l, l = /* @__PURE__ */ Fe(l);
        if (l === null)
          throw sr(), Xt;
        At(N, c), a = re(l);
        return;
      }
      var u = n ? ol : i ? ll : void 0, d = (
        /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
        qr(n ? "svg" : i ? "math" : "template", u)
      );
      d.innerHTML = /** @type {any} */
      s;
      var b = n || i ? d : (
        /** @type {HTMLTemplateElement} */
        d.content
      );
      if (At(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(b),
        /** @type {TemplateNode} */
        b.lastChild
      ), n || i)
        for (; /* @__PURE__ */ Ye(b); )
          a.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ye(b)
          );
      else
        a.before(b);
    }
  });
}
function Qs(t, e) {
  Ps(() => {
    var n = t.getRootNode(), i = (
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
    if (!i.querySelector("#" + e.hash)) {
      const r = qr("style");
      r.id = e.hash, r.textContent = e.code, i.appendChild(r);
    }
  });
}
function Ec(t, e, n) {
  var i = t == null ? "" : "" + t;
  return e && (i = i ? i + " " + e : e), i === "" ? null : i;
}
function $c(t, e) {
  return t == null ? null : String(t);
}
function Te(t, e, n, i, r, a) {
  var s = t.__className;
  if (L || s !== n || s === void 0) {
    var o = Ec(n, i);
    (!L || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return a;
}
function ht(t, e, n, i) {
  var r = t.__style;
  if (L || r !== e) {
    var a = $c(e);
    (!L || a !== t.getAttribute("style")) && (a == null ? t.removeAttribute("style") : t.style.cssText = a), t.__style = e;
  }
  return i;
}
const Ac = Symbol("is custom element"), Oc = Symbol("is html"), Sc = yl ? "link" : "LINK";
function Zs(t, e, n, i) {
  var r = xc(t);
  L && (r[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === Sc) || r[e] !== (r[e] = n) && (e === "loading" && (t[ml] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && eo(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function Oa(t, e, n) {
  var i = I, r = k;
  let a = L;
  L && De(!1), le(null), Oe(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (Oi.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? eo(t).includes(e) : n && typeof n == "object") ? t[e] = n : Zs(t, e, n == null ? n : String(n));
  } finally {
    le(i), Oe(r), a && De(!0);
  }
}
function xc(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [Ac]: t.nodeName.includes("-"),
      [Oc]: t.namespaceURI === is
    })
  );
}
var Oi = /* @__PURE__ */ new Map();
function eo(t) {
  var e = t.getAttribute("is") || t.nodeName, n = Oi.get(e);
  if (n) return n;
  Oi.set(e, n = []);
  for (var i, r = t, a = Element.prototype; a !== r; ) {
    i = ul(r);
    for (var s in i)
      i[s].set && n.push(s);
    r = ss(r);
  }
  return n;
}
function Sa(t, e) {
  return t === e || (t == null ? void 0 : t[mr]) === e;
}
function pt(t = {}, e, n, i) {
  return Ps(() => {
    var r, a;
    return Fi(() => {
      r = a, a = [], Le(() => {
        t !== n(...a) && (e(t, ...a), r && Sa(n(...r), t) && e(null, ...r));
      });
    }), () => {
      Wt(() => {
        a && Sa(n(...a), t) && e(null, ...a);
      });
    };
  }), t;
}
function Ce(t, e, n, i) {
  var r = (
    /** @type {V} */
    i
  ), a = !0, s = () => (a && (a = !1, r = /** @type {V} */
  i), r), o;
  o = /** @type {V} */
  t[e], o === void 0 && i !== void 0 && (o = s());
  var l;
  l = () => {
    var b = (
      /** @type {V} */
      t[e]
    );
    return b === void 0 ? s() : (a = !0, b);
  };
  var c = !1, u = /* @__PURE__ */ Fr(() => (c = !1, l())), d = (
    /** @type {Effect} */
    k
  );
  return (
    /** @type {() => V} */
    function(b, w) {
      if (arguments.length > 0) {
        const g = w ? p(u) : b;
        return O(u, g), c = !0, r !== void 0 && (r = g), b;
      }
      return xt && c || (d.f & We) !== 0 ? u.v : p(u);
    }
  );
}
function Tc(t) {
  return new Nc(t);
}
var nt, ye;
class Nc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    R(this, nt);
    /** @type {Record<string, any>} */
    R(this, ye);
    var a;
    var n = /* @__PURE__ */ new Map(), i = (s, o) => {
      var l = /* @__PURE__ */ Ss(o, !1, !1);
      return n.set(s, l), l;
    };
    const r = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(s, o) {
          return p(n.get(o) ?? i(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === gl ? !0 : (p(n.get(o) ?? i(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, l) {
          return O(n.get(o) ?? i(o, l), l), Reflect.set(s, o, l);
        }
      }
    );
    T(this, ye, (e.hydrate ? pc : Js)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: r,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
      transformError: e.transformError
    })), (!((a = e == null ? void 0 : e.props) != null && a.$$host) || e.sync === !1) && be(), T(this, nt, r.$$events);
    for (const s of Object.keys(h(this, ye)))
      s === "$set" || s === "$destroy" || s === "$on" || Tr(this, s, {
        get() {
          return h(this, ye)[s];
        },
        /** @param {any} value */
        set(o) {
          h(this, ye)[s] = o;
        },
        enumerable: !0
      });
    h(this, ye).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(r, s);
    }, h(this, ye).$destroy = () => {
      vc(h(this, ye));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    h(this, ye).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    h(this, nt)[e] = h(this, nt)[e] || [];
    const i = (...r) => n.call(this, ...r);
    return h(this, nt)[e].push(i), () => {
      h(this, nt)[e] = h(this, nt)[e].filter(
        /** @param {any} fn */
        (r) => r !== i
      );
    };
  }
  $destroy() {
    h(this, ye).$destroy();
  }
}
nt = new WeakMap(), ye = new WeakMap();
let to;
typeof HTMLElement == "function" && (to = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(e, n, i) {
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
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    j(this, "$$shadowRoot", null);
    this.$$ctor = e, this.$$s = n, i && (this.$$shadowRoot = this.attachShadow(i));
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(e, n, i) {
    if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(n), this.$$c) {
      const r = this.$$c.$on(e, n);
      this.$$l_u.set(n, r);
    }
    super.addEventListener(e, n, i);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(e, n, i) {
    if (super.removeEventListener(e, n, i), this.$$c) {
      const r = this.$$l_u.get(n);
      r && (r(), this.$$l_u.delete(n));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let e = function(r) {
        return (a) => {
          const s = qr("slot");
          r !== "default" && (s.name = r), me(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, i = Cc(this);
      for (const r of this.$$s)
        r in i && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), n.default = !0) : n[r] = e(r));
      for (const r of this.attributes) {
        const a = this.$$g_p(r.name);
        a in this.$$d || (this.$$d[a] = Er(a, r.value, this.$$p_d, "toProp"));
      }
      for (const r in this.$$p_d)
        !(r in this.$$d) && this[r] !== void 0 && (this.$$d[r] = this[r], delete this[r]);
      this.$$c = Tc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = nc(() => {
        Fi(() => {
          var r;
          this.$$r = !0;
          for (const a of xr(this.$$c)) {
            if (!((r = this.$$p_d[a]) != null && r.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = Er(
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
      for (const r in this.$$l)
        for (const a of this.$$l[r]) {
          const s = this.$$c.$on(r, a);
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
  attributeChangedCallback(e, n, i) {
    var r;
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Er(e, i, this.$$p_d, "toProp"), (r = this.$$c) == null || r.$set({ [e]: this.$$d[e] }));
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
    return xr(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
    ) || e;
  }
});
function Er(t, e, n, i) {
  var a;
  const r = (a = n[t]) == null ? void 0 : a.type;
  if (e = r === "Boolean" && typeof e != "boolean" ? e != null : e, !i || !n[t])
    return e;
  if (i === "toAttribute")
    switch (r) {
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
    switch (r) {
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
function Cc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function no(t, e, n, i, r, a) {
  let s = class extends to {
    constructor() {
      super(t, n, r), this.$$p_d = e;
    }
    static get observedAttributes() {
      return xr(e).map(
        (o) => (e[o].attribute || o).toLowerCase()
      );
    }
  };
  return xr(e).forEach((o) => {
    Tr(s.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var d;
        l = Er(o, l, e), this.$$d[o] = l;
        var c = this.$$c;
        if (c) {
          var u = (d = vn(c, o)) == null ? void 0 : d.get;
          u ? c[o] = l : c.$set({ [o]: l });
        }
      }
    });
  }), i.forEach((o) => {
    Tr(s.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), a && (s = a(s)), t.element = /** @type {any} */
  s, s;
}
class Bi extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, Bi), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const Rc = (t, e) => {
  const n = new Promise((i, r) => {
    setTimeout(() => {
      r(new Bi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, ro = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return Rc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => ro(t));
};
var Ic = /* @__PURE__ */ ot('<span class="loading svelte-lv9s7p">Loading...</span>'), Lc = /* @__PURE__ */ ot("<div><!></div>");
const kc = {
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
function Si(t, e) {
  ki(e, !0), Qs(t, kc);
  const n = Ce(e, "config"), i = Ce(e, "hass"), r = Ce(e, "preview"), a = Ce(e, "marginTop", 7, "0px"), s = Ce(e, "open"), o = Ce(e, "animation", 7, !0), l = Ce(e, "animationState"), c = Ce(e, "clearCardCss", 7, !1);
  let u = null, d = /* @__PURE__ */ M(null), b = /* @__PURE__ */ M(!0), w = /* @__PURE__ */ M(0);
  const g = Le(() => JSON.parse(JSON.stringify(n())));
  _n(() => {
    p(d) && (p(d).hass = i());
  }), _n(() => {
    p(d) && r() !== void 0 && (p(d).preview = r());
  }), _n(() => {
    var y;
    p(d) && (g.disabled = !s(), (y = p(d)._element) == null || y.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: s() }, bubbles: !0, composed: !1 })));
  }), Xs(async () => {
    const y = document.createElement("hui-card");
    y.hass = i(), y.preview = r(), g.disabled = !s(), y.config = g, y.load(), u == null || u.appendChild(y), O(d, y, !0), O(b, !1), p(d).addEventListener(
      "ll-upgrade",
      (x) => {
        var S;
        x.stopPropagation(), (S = p(d)) != null && S._element && i() && (p(d)._element.hass = i());
      },
      { capture: !0 }
    ), c() && (y.style.setProperty("--ha-card-background", "transparent"), y.style.setProperty("--ha-card-box-shadow", "none"), y.style.setProperty("--ha-card-border-color", "transparent"), y.style.setProperty("--ha-card-border-width", "0px"), y.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (O(w, await ro(y) * 56), u && O(w, p(w) + (window.getComputedStyle(u).marginTop ? parseFloat(window.getComputedStyle(u).marginTop) : 0)), new ResizeObserver((S) => {
      for (const C of S)
        if (C.contentBoxSize) {
          const D = Array.isArray(C.contentBoxSize) ? C.contentBoxSize[0] : C.contentBoxSize;
          D.blockSize && (O(w, D.blockSize, !0), p(d) && O(w, p(w) + (window.getComputedStyle(p(d)).marginTop ? parseFloat(window.getComputedStyle(p(d)).marginTop) : 0)));
        } else C.contentRect && (O(w, C.contentRect.height, !0), p(d) && O(w, p(w) + (window.getComputedStyle(p(d)).marginTop ? parseFloat(window.getComputedStyle(p(d)).marginTop) : 0)));
    }).observe(y));
  });
  var A = {
    get config() {
      return n();
    },
    set config(y) {
      n(y), be();
    },
    get hass() {
      return i();
    },
    set hass(y) {
      i(y), be();
    },
    get preview() {
      return r();
    },
    set preview(y) {
      r(y), be();
    },
    get marginTop() {
      return a();
    },
    set marginTop(y = "0px") {
      a(y), be();
    },
    get open() {
      return s();
    },
    set open(y) {
      s(y), be();
    },
    get animation() {
      return o();
    },
    set animation(y = !0) {
      o(y), be();
    },
    get animationState() {
      return l();
    },
    set animationState(y) {
      l(y), be();
    },
    get clearCardCss() {
      return c();
    },
    set clearCardCss(y = !1) {
      c(y), be();
    }
  }, f = Lc(), v = dt(f);
  {
    var _ = (y) => {
      var x = Ic();
      me(y, x);
    };
    ft(v, (y) => {
      p(b) && y(_);
    });
  }
  return Xe(f), pt(f, (y) => u = y, () => u), Qe(() => {
    Te(f, 1, `outer-container${s() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), ht(f, `--child-card-margin-top: ${(s() ? a() : "0px") ?? ""};${p(w) ? ` --expander-animation-height: -${p(w)}px;` : ""}`);
  }), me(t, f), Pi(A);
}
customElements.define("expander-sub-card", no(
  Si,
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
const Pc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var lr = function(t, e, n) {
  var i;
  n === void 0 && (n = {});
  var r = n.retries, a = r === void 0 ? 10 : r, s = n.delay, o = s === void 0 ? 10 : s, l = n.shouldReject, c = l === void 0 || l, u = (i = n.rejectMessage) !== null && i !== void 0 ? i : "Could not get the result after {{ retries }} retries";
  return new Promise(function(d, b) {
    var w = 0, g = function() {
      var A = t();
      e(A) ? d(A) : ++w < a ? setTimeout(g, o) : c ? b(new Error(u.replace(/\{\{\s*retries\s*\}\}/g, "".concat(a)))) : d(A);
    };
    g();
  });
}, Cr = function() {
  return Cr = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Cr.apply(this, arguments);
};
function Xr(t, e, n) {
  if (arguments.length === 2) for (var i, r = 0, a = e.length; r < a; r++) !i && r in e || (i || (i = Array.prototype.slice.call(e, 0, r)), i[r] = e[r]);
  return t.concat(i || Array.prototype.slice.call(e));
}
var Rr, pn, ke, vt, Qr = "[home-assistant-javascript-templates]", Dc = /^([a-z_]+)\.(\w+)$/;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Rr || (Rr = {})), function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
}(pn || (pn = {})), function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
}(ke || (ke = {})), function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
}(vt || (vt = {}));
var xa = function(t) {
  return t.reduce(function(e, n) {
    var i = n[0], r = n[1];
    return e[i.replace(Dc, "$2")] = r, e;
  }, {});
}, ut = function(t) {
  return t.includes(".");
}, $r = "ref", Dt = "value", Ta = "toJSON", Na = function(t) {
  return "".concat($r, ".").concat(t);
};
function Mc(t, e, n) {
  var i = function() {
    return Object.entries(t.hass.areas);
  }, r = function() {
    return Object.entries(t.hass.devices);
  }, a = function() {
    return Object.entries(t.hass.entities);
  }, s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), l = function(f, v) {
    n && console.warn("".concat(f, " ").concat(v, " used in a JavaScript template doesn't exist"));
  }, c = function(f) {
    return l("Entity", f);
  }, u = function(f) {
    return l("Domain", f);
  }, d = function(f) {
    var v = new SyntaxError(f);
    if (e) throw v;
    n && console.warn(v);
  }, b = function(f) {
    t.hass.states[f] ? s.add(f) : c(f);
  }, w = function(f) {
    s.add(f);
  }, g = function(f, v) {
    var _ = v.with_unit, y = _ !== void 0 && _, x = v.rounded, S = x !== void 0 && x;
    if (f) {
      var C = f.state, D = f.attributes.unit_of_measurement, H = Number(S), V = S === !1 || isNaN(Number(C)) ? C : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: H, maximumFractionDigits: H }).format(Number(C));
      return y && D ? "".concat(V, " ").concat(D) : V;
    }
  }, A = function(f) {
    return new Proxy(f, { get: function(v, _) {
      return _ === "state_with_unit" ? g(v, { rounded: !0, with_unit: !0 }) : v[_];
    } });
  };
  return { get hass() {
    return t.hass;
  }, states: new Proxy(function(f, v) {
    if (v === void 0 && (v = {}), ut(f)) return b(f), g(t.hass.states[f], v);
    throw SyntaxError("".concat(Qr, ": states method cannot be used with a domain, use it as an object instead."));
  }, { get: function(f, v) {
    if (ut(v)) return b(v), A(t.hass.states[v]);
    var _ = Object.entries(t.hass.states).filter(function(y) {
      return y[0].startsWith(v);
    });
    return _.length || u(v), new Proxy(xa(_), { get: function(y, x) {
      return b("".concat(v, ".").concat(x)), A(y[x]);
    } });
  } }), state_translated: function(f) {
    if (b(f), t.hass.states[f]) return t.hass.formatEntityState(t.hass.states[f]);
  }, is_state: function(f, v) {
    var _;
    return b(f), Array.isArray(v) ? v.some(function(y) {
      var x;
      return ((x = t.hass.states[f]) === null || x === void 0 ? void 0 : x.state) === y;
    }) : ((_ = t.hass.states[f]) === null || _ === void 0 ? void 0 : _.state) === v;
  }, state_attr: function(f, v) {
    var _, y;
    return b(f), (y = (_ = t.hass.states[f]) === null || _ === void 0 ? void 0 : _.attributes) === null || y === void 0 ? void 0 : y[v];
  }, is_state_attr: function(f, v, _) {
    return this.state_attr(f, v) === _;
  }, has_value: function(f) {
    return this.states(f) ? !(this.is_state(f, Rr.UNKNOWN) || this.is_state(f, Rr.UNAVAILABLE)) : (c(f), !1);
  }, entities: new Proxy(function(f) {
    if (f === void 0) return t.hass.entities;
    if (ut(f)) return b(f), t.hass.entities[f];
    var v = a().filter(function(_) {
      return _[0].startsWith(f);
    });
    return v.length || u(f), new Proxy(xa(v), { get: function(_, y) {
      return b("".concat(f, ".").concat(y)), _[y];
    } });
  }, { get: function(f, v) {
    return f(v);
  } }), entity_prop: function(f, v) {
    var _;
    return b(f), (_ = t.hass.entities[f]) === null || _ === void 0 ? void 0 : _[v];
  }, is_entity_prop: function(f, v, _) {
    return this.entity_prop(f, v) === _;
  }, devices: new Proxy(function(f) {
    if (f === void 0) return t.hass.devices;
    if (ut(f)) throw SyntaxError("".concat(Qr, ": devices method cannot be used with an entity id, you should use a device id instead."));
    return t.hass.devices[f];
  }, { get: function(f, v) {
    if (ut(v)) throw SyntaxError("".concat(Qr, ": devices cannot be accesed using an entity id, you should use a device id instead."));
    return t.hass.devices[v];
  } }), device_attr: function(f, v) {
    var _, y, x;
    if (ut(f)) {
      b(f);
      var S = (_ = t.hass.entities[f]) === null || _ === void 0 ? void 0 : _.device_id;
      return (y = t.hass.devices[S]) === null || y === void 0 ? void 0 : y[v];
    }
    return (x = t.hass.devices[f]) === null || x === void 0 ? void 0 : x[v];
  }, is_device_attr: function(f, v, _) {
    return this.device_attr(f, v) === _;
  }, device_id: function(f) {
    var v;
    if (ut(f)) return b(f), (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
    var _ = r().find(function(y) {
      return y[1].name === f;
    });
    return _ == null ? void 0 : _[0];
  }, device_name: function(f) {
    var v, _, y;
    if (ut(f)) {
      b(f);
      var x = (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
      return (_ = t.hass.devices[x]) === null || _ === void 0 ? void 0 : _.name;
    }
    return (y = t.hass.devices[f]) === null || y === void 0 ? void 0 : y.name;
  }, areas: function() {
    return i().map(function(f) {
      return f[1].area_id;
    });
  }, area_id: function(f) {
    var v, _;
    if (f in t.hass.devices) return this.device_attr(f, pn.AREA_ID);
    var y = (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
    if (y) return this.device_attr(y, pn.AREA_ID);
    var x = i().find(function(S) {
      return S[1].name === f;
    });
    return (_ = x == null ? void 0 : x[1]) === null || _ === void 0 ? void 0 : _.area_id;
  }, area_name: function(f) {
    var v, _, y;
    f in t.hass.devices && (y = this.device_attr(f, pn.AREA_ID));
    var x = (v = t.hass.entities[f]) === null || v === void 0 ? void 0 : v.device_id;
    x && (y = this.device_attr(x, pn.AREA_ID));
    var S = i().find(function(C) {
      var D = C[1];
      return D.area_id === f || D.area_id === y;
    });
    return (_ = S == null ? void 0 : S[1]) === null || _ === void 0 ? void 0 : _.name;
  }, area_entities: function(f) {
    var v = i().find(function(_) {
      var y = _[1];
      return y.area_id === f || y.name === f;
    });
    return v ? a().filter(function(_) {
      return _[1].area_id === v[1].area_id;
    }).map(function(_) {
      return _[0];
    }) : [];
  }, area_devices: function(f) {
    var v = i().find(function(_) {
      var y = _[1];
      return y.area_id === f || y.name === f;
    });
    return v ? r().filter(function(_) {
      return _[1].area_id === v[1].area_id;
    }).map(function(_) {
      return _[1].id;
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
    return s;
  }, cleanTracked: function() {
    s.clear();
  }, ref: function(f, v, _) {
    var y;
    _ === void 0 && (_ = void 0);
    var x = Na(v);
    if (o.has(v)) return o.get(v);
    var S = new Proxy(((y = {})[Dt] = _, y[Ta] = function() {
      return this[Dt];
    }, y), { get: function(C, D, H) {
      if (D === Dt || D === Ta) return w(x), Reflect.get(C, D, H);
      d("".concat(D, " is not a valid ").concat($r, " property. A ").concat($r, ' only exposes a "').concat(Dt, '" property'));
    }, set: function(C, D, H) {
      if (D === Dt) {
        var V = C[Dt];
        return C[Dt] = H, f({ event_type: vt.STATE_CHANGE_EVENT, data: { entity_id: x, old_state: { state: JSON.stringify(V) }, new_state: { state: JSON.stringify(H) } } }), !0;
      }
      return d('property "'.concat(D, '" cannot be set in a ').concat($r)), !1;
    } });
    return o.set(v, S), S;
  }, unref: function(f, v) {
    var _ = Na(v);
    o.has(v) ? (o.delete(v), f(_)) : d("".concat(v, " is not a ref or it has been unrefed already"));
  }, refs: function(f, v, _) {
    _ === void 0 && (_ = {});
    var y = this.ref, x = this.unref, S = new Proxy(_, { get: function(C, D) {
      return y(f, D).value;
    }, set: function(C, D, H) {
      return y(f, D).value = H, !0;
    } });
    return Object.entries(_).forEach(function(C) {
      var D = C[0], H = C[1];
      o.has(D) && x(v, D), y(f, D, H);
    }), S;
  }, cleanRefs: function(f) {
    var v = this;
    Array.from(o.keys()).forEach(function(_) {
      v.unref(f, _);
    });
  }, clientSideProxy: new Proxy({}, { get: function(f, v) {
    switch (Object.values(ke).includes(v) && w(v), v) {
      case ke.PANEL_URL:
        return location.pathname;
      case ke.LANG:
        return t.hass.language;
    }
    n && console.warn("clientSideProxy should only be used to access these variables: ".concat(Object.values(ke).join(", ")));
  } }) };
}
var Hc = function() {
  function t(e, n) {
    var i = n.throwErrors, r = i !== void 0 && i, a = n.throwWarnings, s = a === void 0 || a, o = n.variables, l = o === void 0 ? {} : o, c = n.refs, u = c === void 0 ? {} : c, d = n.refsVariableName, b = d === void 0 ? "refs" : d, w = n.autoReturn, g = w === void 0 || w;
    this._throwErrors = r, this._throwWarnings = s, this._variables = l, this._refsVariableName = b, this._autoReturn = g, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp("(^|[ \\?(+:\\{\\[><,])(".concat(Object.values(ke).join("|"), ")($|[ \\?)+:\\}\\]><.,])"), "gm"), this._scopped = Mc(e, r, s), this.refs = u, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
  }
  return t.prototype._executeRenderingFunctions = function(e) {
    var n = this;
    this._subscriptions.get(e).forEach(function(i, r) {
      i.forEach(function(a, s) {
        n.trackTemplate(r, s, a);
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
    this._subscriptions.has(ke.PANEL_URL) && this._executeRenderingFunctions(ke.PANEL_URL);
  }, t.prototype._watchForEntitiesChange = function() {
    var e = this;
    window.hassConnection.then(function(n) {
      n.conn.subscribeMessage(function(i) {
        return e._entityWatchCallback(i);
      }, { type: vt.SUBSCRIBE_EVENTS, event_type: vt.STATE_CHANGE_EVENT });
    });
  }, t.prototype._watchForLanguageChange = function() {
    var e = this;
    window.addEventListener(vt.TRANSLATIONS_UPDATED, function() {
      e._subscriptions.has(ke.LANG) && e._executeRenderingFunctions(ke.LANG);
    });
  }, t.prototype._entityWatchCallback = function(e) {
    if (this._subscriptions.size) {
      var n = e.data.entity_id;
      this._subscriptions.has(n) && this._executeRenderingFunctions(n);
    }
  }, t.prototype._storeTracked = function(e, n, i) {
    var r = this;
    this._scopped.tracked.forEach(function(a) {
      var s = [n, i];
      if (r._subscriptions.has(a)) {
        var o = r._subscriptions.get(a);
        if (o.has(e)) {
          var l = o.get(e);
          l.has(n) || l.set.apply(l, s);
        } else o.set(e, new Map([s]));
      } else r._subscriptions.set(a, /* @__PURE__ */ new Map([[e, new Map([s])]]));
    });
  }, t.prototype._untrackTemplate = function(e, n) {
    var i = this;
    this._subscriptions.forEach(function(r, a) {
      if (r.has(e)) {
        var s = r.get(e);
        s.delete(n), s.size === 0 && (r.delete(e), r.size === 0 && i._subscriptions.delete(a));
      }
    });
  }, t.prototype.renderTemplate = function(e, n) {
    n === void 0 && (n = {});
    try {
      var i = n.variables, r = i === void 0 ? {} : i, a = n.refs, s = a === void 0 ? {} : a, o = new Map(Object.entries(Cr(Cr({}, this._variables), r))), l = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), c = l.includes("return") || !this._autoReturn ? l : "return ".concat(l);
      return new (Function.bind.apply(Function, Xr(Xr([void 0, "hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName], Array.from(o.keys()), !1), ["".concat('"use strict";', " ").concat(c)], !1)))().apply(void 0, Xr([this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), s)], Array.from(o.values()), !1));
    } catch (u) {
      if (this._throwErrors) throw u;
      return void (this._throwWarnings && console.warn(u));
    }
  }, t.prototype.trackTemplate = function(e, n, i) {
    var r = this;
    i === void 0 && (i = {}), this._scopped.cleanTracked();
    var a = this.renderTemplate(e, i);
    return this._storeTracked(e, n, i), n(a), function() {
      return r._untrackTemplate(e, n);
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
}(), jc = function() {
  function t(e, n) {
    n === void 0 && (n = {}), this._renderer = lr(function() {
      return e.hass;
    }, function(i) {
      return !!(i && i.areas && i.devices && i.entities && i.states && i.user);
    }, { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(function() {
      return new Hc(e, n);
    });
  }
  return t.prototype.getRenderer = function() {
    return this._renderer;
  }, t;
}();
function Fc(t = {}, e = {}) {
  return new jc(
    document.querySelector("home-assistant"),
    {
      autoReturn: !1,
      variables: t,
      refs: e,
      refsVariableName: "variables"
    }
  ).getRenderer();
}
function Ar(t) {
  return !t || typeof t != "string" ? !1 : String(t).trim().startsWith("[[[") && String(t).trim().endsWith("]]]");
}
function Ca(t, e, n, i = {}) {
  if (!Ar(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((r) => r.trackTemplate(n, e, { variables: i }));
}
function Ra(t, e, n) {
  t.then((i) => {
    i.refs[e] = n;
  });
}
function qc(t, e) {
  t.then((n) => {
    const i = e.detail;
    Object.keys(i).forEach((r) => {
      const a = i[r].property, s = i[r].value, o = `${r}_${a}`;
      n.refs[o] = s;
    });
  });
}
function Gc(t, e) {
  const n = qc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Ir = function() {
  return Ir = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, Ir.apply(this, arguments);
};
function an(t, e, n, i) {
  return new (n || (n = Promise))(function(r, a) {
    function s(c) {
      try {
        l(i.next(c));
      } catch (u) {
        a(u);
      }
    }
    function o(c) {
      try {
        l(i.throw(c));
      } catch (u) {
        a(u);
      }
    }
    function l(c) {
      var u;
      c.done ? r(c.value) : (u = c.value, u instanceof n ? u : new n(function(d) {
        d(u);
      })).then(s, o);
    }
    l((i = i.apply(t, [])).next());
  });
}
function sn(t, e) {
  var n, i, r, a = { label: 0, sent: function() {
    if (1 & r[0]) throw r[1];
    return r[1];
  }, trys: [], ops: [] }, s = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return s.next = o(0), s.throw = o(1), s.return = o(2), typeof Symbol == "function" && (s[Symbol.iterator] = function() {
    return this;
  }), s;
  function o(l) {
    return function(c) {
      return function(u) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; s && (s = 0, u[0] && (a = 0)), a; ) try {
          if (n = 1, i && (r = 2 & u[0] ? i.return : u[0] ? i.throw || ((r = i.return) && r.call(i), 0) : i.next) && !(r = r.call(i, u[1])).done) return r;
          switch (i = 0, r && (u = [2 & u[0], r.value]), u[0]) {
            case 0:
            case 1:
              r = u;
              break;
            case 4:
              return a.label++, { value: u[1], done: !1 };
            case 5:
              a.label++, i = u[1], u = [0];
              continue;
            case 7:
              u = a.ops.pop(), a.trys.pop();
              continue;
            default:
              if (r = a.trys, !((r = r.length > 0 && r[r.length - 1]) || u[0] !== 6 && u[0] !== 2)) {
                a = 0;
                continue;
              }
              if (u[0] === 3 && (!r || u[1] > r[0] && u[1] < r[3])) {
                a.label = u[1];
                break;
              }
              if (u[0] === 6 && a.label < r[1]) {
                a.label = r[1], r = u;
                break;
              }
              if (r && a.label < r[2]) {
                a.label = r[2], a.ops.push(u);
                break;
              }
              r[2] && a.ops.pop(), a.trys.pop();
              continue;
          }
          u = e.call(t, a);
        } catch (d) {
          u = [6, d], i = 0;
        } finally {
          n = r = 0;
        }
        if (5 & u[0]) throw u[1];
        return { value: u[0] ? u[1] : void 0, done: !0 };
      }([l, c]);
    };
  }
}
var en = "$", io = ":host", Vi = "invalid selector", Tt = 10, Nt = 10, Wi = function(t) {
  var e, n = t[0], i = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof i == "string";
};
function Yi(t, e) {
  return function(n) {
    return n.split(",").map(function(i) {
      return i.trim();
    });
  }(t).map(function(n) {
    var i = function(r) {
      return r.split(en).map(function(a) {
        return a.trim();
      });
    }(n);
    return e(i);
  });
}
function ao(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(en, ").").concat(n);
}
function dn(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function so() {
  return "You can not select a shadowRoot (".concat(en, ") of the document.");
}
function oo() {
  return "You can not select a shadowRoot (".concat(en, ") of a shadowRoot.");
}
function Ji(t, e) {
  for (var n, i, r = null, a = t.length, s = 0; s < a; s++) {
    if (s === 0) if (t[s].length) r = e.querySelector(t[s]);
    else {
      if (e instanceof Document) throw new SyntaxError(so());
      if (e instanceof ShadowRoot) throw new SyntaxError(oo());
      r = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++s])) || null;
    }
    else r = ((i = r.shadowRoot) === null || i === void 0 ? void 0 : i.querySelector("".concat(io, " ").concat(t[s]))) || null;
    if (r === null) return null;
  }
  return r;
}
function Uc(t, e) {
  var n, i = function(s, o, l) {
    for (var c, u = 0, d = o.length; u < d; u++) !c && u in o || (c || (c = Array.prototype.slice.call(o, 0, u)), c[u] = o[u]);
    return s.concat(c || Array.prototype.slice.call(o));
  }([], t), r = i.pop();
  if (!i.length) return e.querySelectorAll(r);
  var a = Ji(i, e);
  return ((n = a == null ? void 0 : a.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(io, " ").concat(r))) || null;
}
function zc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(so());
    if (e instanceof ShadowRoot) throw new SyntaxError(oo());
    return e.shadowRoot;
  }
  var n = Ji(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function Bc(t, e, n, i) {
  for (var r = Yi(t, function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(ao(n, i));
    return l;
  }), a = r.length, s = 0; s < a; s++) {
    var o = Ji(r[s], e);
    if (o) return o;
  }
  return null;
}
function Vc(t, e, n) {
  for (var i = Yi(t, function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(ao(n));
    return o;
  }), r = i.length, a = 0; a < r; a++) {
    var s = Uc(i[a], e);
    if (s != null && s.length) return s;
  }
  return document.querySelectorAll(Vi);
}
function Wc(t, e, n, i) {
  for (var r = Yi(t, function(l) {
    if (l.pop().length) throw new SyntaxError(function(c, u) {
      return "".concat(c, " must be used with a selector ending in a shadowRoot (").concat(en, "). If you don't want to select a shadowRoot, use ").concat(u, " instead.");
    }(n, i));
    return l;
  }), a = r.length, s = 0; s < a; s++) {
    var o = zc(r[s], e);
    if (o) return o;
  }
  return null;
}
function Ia(t, e, n, i) {
  return an(this, void 0, void 0, function() {
    return sn(this, function(r) {
      return [2, lr(function() {
        return Bc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }, function(a) {
        return !!a;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
function La(t, e, n, i) {
  return an(this, void 0, void 0, function() {
    return sn(this, function(r) {
      return [2, lr(function() {
        return Vc(t, e, "asyncQuerySelectorAll");
      }, function(a) {
        return !!a.length;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
function ka(t, e, n, i) {
  return an(this, void 0, void 0, function() {
    return sn(this, function(r) {
      return [2, lr(function() {
        return Wc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }, function(a) {
        return !!a;
      }, { retries: n, delay: i, shouldReject: !1 })];
    });
  });
}
var xi = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var i = xi(t.shadowRoot, e);
    if (i.length) return i;
  }
  for (var r = 0, a = Array.from(t.querySelectorAll("*")); r < a.length; r++) {
    var s = a[r], o = xi(s, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(Vi);
}, Pa = function(t, e, n, i) {
  return lr(function() {
    return xi(t, e);
  }, function(r) {
    return !!r.length;
  }, { retries: n, delay: i, shouldReject: !1 });
};
function Da() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return an(this, void 0, void 0, function() {
    var n, i, r, a, s;
    return sn(this, function(o) {
      switch (o.label) {
        case 0:
          return Wi(t) ? (n = t[0], i = t[1], r = t[2], [4, Ia(i, n, (r == null ? void 0 : r.retries) || Tt, (r == null ? void 0 : r.delay) || Nt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return a = t[0], s = t[1], [4, Ia(a, document, (s == null ? void 0 : s.retries) || Tt, (s == null ? void 0 : s.delay) || Nt)];
      }
    });
  });
}
function Ma() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return an(this, void 0, void 0, function() {
    var n, i, r, a, s;
    return sn(this, function(o) {
      switch (o.label) {
        case 0:
          return Wi(t) ? (n = t[0], i = t[1], r = t[2], [4, La(i, n, (r == null ? void 0 : r.retries) || Tt, (r == null ? void 0 : r.delay) || Nt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return a = t[0], s = t[1], [2, La(a, document, (s == null ? void 0 : s.retries) || Tt, (s == null ? void 0 : s.delay) || Nt)];
      }
    });
  });
}
function Ha() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return an(this, void 0, void 0, function() {
    var n, i, r, a, s;
    return sn(this, function(o) {
      switch (o.label) {
        case 0:
          return Wi(t) ? (n = t[0], i = t[1], r = t[2], [4, ka(i, n, (r == null ? void 0 : r.retries) || Tt, (r == null ? void 0 : r.delay) || Nt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return a = t[0], s = t[1], [2, ka(a, document, (s == null ? void 0 : s.retries) || Tt, (s == null ? void 0 : s.delay) || Nt)];
      }
    });
  });
}
var Yc = function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Ir({ retries: Tt, delay: Nt }, n || {})) : (this._element = document, this._asyncParams = Ir({ retries: Tt, delay: Nt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return dn(this._element).then(function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(dn(this._element).then(function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Ha(n[0], en, e._asyncParams) : Ha(n, en, e._asyncParams);
    }), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return dn(this._element).then(function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(Vi);
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return an(this, void 0, void 0, function() {
      return sn(this, function(n) {
        return [2, dn(this._element).then(function(i) {
          return i instanceof NodeList && i[e] || null;
        })];
      });
    });
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(dn(this._element).then(function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Ma(i[0], e, n._asyncParams) : Ma(i, e, n._asyncParams);
    }), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(dn(this._element).then(function(i) {
      return i === null || i instanceof NodeList && i.length === 0 ? null : i instanceof NodeList ? Promise.race(Array.from(i).map(function(r) {
        return Pa(r, e, n._asyncParams.retries, n._asyncParams.delay);
      })) : Pa(i, e, n._asyncParams.retries, n._asyncParams.delay);
    }), this._asyncParams);
  }, t;
}(), Ti = function(t, e) {
  return Ti = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, i) {
    n.__proto__ = i;
  } || function(n, i) {
    for (var r in i) Object.prototype.hasOwnProperty.call(i, r) && (n[r] = i[r]);
  }, Ti(t, e);
}, at = function() {
  return at = Object.assign || function(t) {
    for (var e, n = 1, i = arguments.length; n < i; n++) for (var r in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
    return t;
  }, at.apply(this, arguments);
};
var Pe, wt, B, Ze, ja, Zr, ei, pr, Fa, ti, vr, ni, ri, ii, Un, F, Ot = "$", Jc = { retries: 100, delay: 50, eventThreshold: 450 };
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(Pe || (Pe = {})), function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
}(wt || (wt = {})), function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
}(B || (B = {})), function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
}(Ze || (Ze = {})), function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-adaptive-dialog, ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
}(F || (F = {}));
var Kc = ((ja = {})[Pe.HOME_ASSISTANT] = { selector: F.HOME_ASSISTANT, children: { shadowRoot: { selector: Ot, children: (Zr = {}, Zr[Pe.HOME_ASSISTANT_MAIN] = { selector: F.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: Ot, children: (ei = {}, ei[Pe.HA_DRAWER] = { selector: F.HA_DRAWER, children: (pr = {}, pr[Pe.HA_SIDEBAR] = { selector: F.HA_SIDEBAR, children: { shadowRoot: { selector: Ot } } }, pr[Pe.PARTIAL_PANEL_RESOLVER] = { selector: F.PARTIAL_PANEL_RESOLVER }, pr) }, ei) } } }, Zr) } } }, ja), Xc = ((Fa = {})[wt.HA_PANEL_LOVELACE] = { selector: F.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: Ot, children: (ti = {}, ti[wt.HUI_ROOT] = { selector: F.HUI_ROOT, children: { shadowRoot: { selector: Ot, children: (vr = {}, vr[wt.HEADER] = { selector: F.HEADER }, vr[wt.HUI_VIEW] = { selector: F.HUI_VIEW }, vr) } } }, ti) } } }, Fa), Qc = { shadowRoot: { selector: Ot, children: (ni = {}, ni[B.HA_MORE_INFO_DIALOG] = { selector: F.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: Ot, children: (ri = {}, ri[B.HA_DIALOG] = { selector: F.HA_DIALOG, children: (ii = {}, ii[B.HA_DIALOG_CONTENT] = { selector: F.HA_DIALOG_CONTENT, children: (Un = {}, Un[B.HA_MORE_INFO_DIALOG_INFO] = { selector: F.HA_MORE_INFO_DIALOG_INFO }, Un[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = { selector: F.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, Un[B.HA_DIALOG_MORE_INFO_SETTINGS] = { selector: F.HA_DIALOG_MORE_INFO_SETTINGS }, Un) }, ii) }, ri) } } }, ni) } }, Jn = function(t, e, n, i) {
  return n === void 0 && (n = null), i === void 0 && (i = !1), Object.entries(e || {}).reduce(function(r, a) {
    var s = a[0], o = a[1];
    if (o.selector === Ot && n) return o.children ? at(at({}, r), Jn(t, o.children, n, !0)) : r;
    var l = n ? n.then(function(c) {
      return c ? Da(c, (u = o.selector, i ? "$ " + u : u), t) : null;
      var u;
    }) : Da(o.selector, t);
    return r[s] = { element: l, children: Jn(t, o.children, l), selector: new Yc(l, t) }, r;
  }, {});
}, lo = function(t, e) {
  for (var n = 0, i = Object.entries(e); n < i.length; n++) {
    var r = i[n];
    if (r[0] === t) return r[1];
    var a = lo(t, r[1].children);
    if (a) return a;
  }
}, ai = function(t, e) {
  return Object.keys(t).reduce(function(n, i) {
    var r = lo(i, e);
    r.children;
    var a = function(s, o) {
      var l = {};
      for (var c in s) Object.prototype.hasOwnProperty.call(s, c) && o.indexOf(c) < 0 && (l[c] = s[c]);
      if (s != null && typeof Object.getOwnPropertySymbols == "function") {
        var u = 0;
        for (c = Object.getOwnPropertySymbols(s); u < c.length; u++) o.indexOf(c[u]) < 0 && Object.prototype.propertyIsEnumerable.call(s, c[u]) && (l[c[u]] = s[c[u]]);
      }
      return l;
    }(r, ["children"]);
    return n[i] = at({}, a), n;
  }, {});
}, Zc = function() {
  function t() {
    this.delegate = document.createDocumentFragment();
  }
  return t.prototype.addEventListener = function() {
    for (var e, n = [], i = 0; i < arguments.length; i++) n[i] = arguments[i];
    (e = this.delegate).addEventListener.apply(e, n);
  }, t.prototype.dispatchEvent = function() {
    for (var e, n = [], i = 0; i < arguments.length; i++) n[i] = arguments[i];
    return (e = this.delegate).dispatchEvent.apply(e, n);
  }, t.prototype.removeEventListener = function() {
    for (var e, n = [], i = 0; i < arguments.length; i++) n[i] = arguments[i];
    return (e = this.delegate).removeEventListener.apply(e, n);
  }, t;
}(), eu = function(t) {
  function e(n) {
    n === void 0 && (n = {});
    var i = t.call(this) || this;
    return i._config = at(at({}, Jc), n), i._timestaps = {}, i;
  }
  return function(n, i) {
    if (typeof i != "function" && i !== null) throw new TypeError("Class extends value " + String(i) + " is not a constructor or null");
    function r() {
      this.constructor = n;
    }
    Ti(n, i), n.prototype = i === null ? Object.create(i) : (r.prototype = i.prototype, new r());
  }(e, t), e.prototype._dispatchEvent = function(n, i) {
    var r = Date.now();
    r - this._timestaps[n] < this._config.eventThreshold || (this._timestaps[n] = r, this.dispatchEvent(new CustomEvent(n, { detail: i })));
  }, e.prototype._updateDialogElements = function(n) {
    var i, r = this;
    n === void 0 && (n = B.HA_MORE_INFO_DIALOG_INFO), this._dialogTree = Jn(this._config, Qc, this._haRootElements.HOME_ASSISTANT.element);
    var a = ai(B, this._dialogTree);
    a.HA_DIALOG_CONTENT.element.then(function(o) {
      r._dialogsContentObserver.disconnect(), r._dialogsContentObserver.observe(o, { childList: !0 });
    }), this._haDialogElements = function(o, l) {
      return [B.HA_MORE_INFO_DIALOG, B.HA_DIALOG, B.HA_DIALOG_CONTENT, l].reduce(function(c, u) {
        return c[u] = o[u], c;
      }, {});
    }(a, n);
    var s = ((i = {})[B.HA_MORE_INFO_DIALOG_INFO] = Ze.ON_MORE_INFO_DIALOG_OPEN, i[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = Ze.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, i[B.HA_DIALOG_MORE_INFO_SETTINGS] = Ze.ON_SETTINGS_DIALOG_OPEN, i);
    this._dispatchEvent(s[n], this._haDialogElements);
  }, e.prototype._updateRootElements = function() {
    var n = this;
    this._homeAssistantRootTree = Jn(this._config, Kc), this._haRootElements = ai(Pe, this._homeAssistantRootTree), this._haRootElements[Pe.HOME_ASSISTANT].selector.$.element.then(function(i) {
      n._dialogsObserver.disconnect(), n._dialogsObserver.observe(i, { childList: !0 });
    }), this._haRootElements[Pe.PARTIAL_PANEL_RESOLVER].element.then(function(i) {
      n._panelResolverObserver.disconnect(), i && n._panelResolverObserver.observe(i, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(Ze.ON_LISTEN, this._haRootElements), this._dispatchEvent(Ze.ON_PANEL_LOAD, this._haRootElements);
  }, e.prototype._updateLovelaceElements = function() {
    var n = this;
    this._homeAssistantResolverTree = Jn(this._config, Xc, this._haRootElements[Pe.HA_DRAWER].element), this._haResolverElements = ai(wt, this._homeAssistantResolverTree), this._haResolverElements[wt.HA_PANEL_LOVELACE].element.then(function(i) {
      n._lovelaceObserver.disconnect(), i && (n._lovelaceObserver.observe(i.shadowRoot, { childList: !0 }), n._dispatchEvent(Ze.ON_LOVELACE_PANEL_LOAD, at(at({}, n._haRootElements), n._haResolverElements)));
    });
  }, e.prototype._watchDialogs = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(a) {
        a.localName === F.HA_MORE_INFO_DIALOG && i._updateDialogElements();
      });
    });
  }, e.prototype._watchDialogsContent = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(a) {
        var s, o = ((s = {})[F.HA_MORE_INFO_DIALOG_INFO] = B.HA_MORE_INFO_DIALOG_INFO, s[F.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, s[F.HA_DIALOG_MORE_INFO_SETTINGS] = B.HA_DIALOG_MORE_INFO_SETTINGS, s);
        if (a.localName && a.localName in o) {
          var l = a.localName;
          i._updateDialogElements(o[l]);
        }
      });
    });
  }, e.prototype._watchDashboards = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(a) {
        i._dispatchEvent(Ze.ON_PANEL_LOAD, i._haRootElements), a.localName === F.HA_PANEL_LOVELACE && i._updateLovelaceElements();
      });
    });
  }, e.prototype._watchLovelace = function(n) {
    var i = this;
    n.forEach(function(r) {
      r.addedNodes.forEach(function(a) {
        a.localName === F.HUI_ROOT && i._updateLovelaceElements();
      });
    });
  }, e.prototype.listen = function() {
    this._watchDialogsBinded = this._watchDialogs.bind(this), this._watchDialogsContentBinded = this._watchDialogsContent.bind(this), this._watchDashboardsBinded = this._watchDashboards.bind(this), this._watchLovelaceBinded = this._watchLovelace.bind(this), this._dialogsObserver = new MutationObserver(this._watchDialogsBinded), this._dialogsContentObserver = new MutationObserver(this._watchDialogsContentBinded), this._panelResolverObserver = new MutationObserver(this._watchDashboardsBinded), this._lovelaceObserver = new MutationObserver(this._watchLovelaceBinded), this._updateRootElements(), this._updateLovelaceElements();
  }, e.prototype.addEventListener = function(n, i, r) {
    t.prototype.addEventListener.call(this, n, i, r);
  }, e;
}(Zc);
const co = new eu();
let Or = {};
co.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
  t.HUI_ROOT.element.then((e) => {
    const n = e == null ? void 0 : e.lovelace;
    n != null && n.config && (Or = n.config["expander-card"] || {});
  }).catch(() => {
    Or = {};
  }).finally(() => {
    document.body.dispatchEvent(new CustomEvent("expander-card-raw-config-updated", {
      detail: { rawConfig: Or },
      bubbles: !0,
      composed: !0
    }));
  });
});
co.listen();
const tu = () => Or, qa = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
  if (!Array.isArray(n))
    return null;
  const i = n.map((r) => {
    if (typeof r == "string")
      return `  ${r};`;
    const [a, s] = Object.entries(r)[0];
    return `  ${a}: ${s};`;
  }).join(`
`);
  return `${e} {
${i}
}`;
}).filter((e) => e !== null).join(`
`) : null, Ni = {
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
var nu = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), ru = /* @__PURE__ */ ot('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), iu = /* @__PURE__ */ ot("<ha-ripple></ha-ripple>", 2), au = /* @__PURE__ */ ot('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), su = /* @__PURE__ */ ot("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), ou = /* @__PURE__ */ ot("<div><div></div></div>"), lu = /* @__PURE__ */ ot("<ha-card><!> <!> <!></ha-card>", 2);
const cu = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function uu(t, e) {
  ki(e, !0), Qs(t, cu);
  const n = Ce(e, "hass"), i = Ce(e, "preview"), r = Ce(e, "config", 7, Ni);
  let a = /* @__PURE__ */ M(!1), s = /* @__PURE__ */ M(null), o = /* @__PURE__ */ M(it(!!Le(() => i()))), l = /* @__PURE__ */ M(it(!!Le(() => i()))), c = /* @__PURE__ */ M(!0), u = /* @__PURE__ */ M("idle"), d = /* @__PURE__ */ M(null), b = /* @__PURE__ */ M(0), w = /* @__PURE__ */ M(0), g = /* @__PURE__ */ M(null), A = /* @__PURE__ */ M(null), f = /* @__PURE__ */ M(null), v = /* @__PURE__ */ M(null);
  const _ = {}, y = {}, x = {}, S = /* @__PURE__ */ M(it({}));
  let C = /* @__PURE__ */ M(it(tu()));
  const D = /* @__PURE__ */ qn(() => {
    const m = p(S).style, E = r().style;
    let $ = null;
    return m !== void 0 ? $ = typeof m == "string" ? m : typeof m == "object" && m !== null ? qa(m) : String(m) : E && ($ = qa(E)), $ ? `<style>${$}</style>` : null;
  }), H = /* @__PURE__ */ qn(() => p(S).icon !== void 0 ? String(p(S).icon) : r().icon), V = /* @__PURE__ */ qn(() => p(S).title !== void 0 ? String(p(S).title) : r().title), It = /* @__PURE__ */ qn(() => p(S)["arrow-color"] !== void 0 ? String(p(S)["arrow-color"]) : r()["arrow-color"]), ue = Le(() => r()["storage-id"]), dr = "expander-open-" + ue;
  O(c, Le(() => i() || (Br(r()["show-button-users"]) ?? !0)), !0), _n(() => {
    if (p(S).expanded === void 0 || Le(() => i() && p(C)["preview-expanded"] !== !1))
      return;
    const m = !!p(S).expanded;
    queueMicrotask(() => {
      m !== p(o) && Lt(m);
    });
  }), _n(() => {
    if (!(i() === p(l) || i() === void 0)) {
      if (O(l, i(), !0), p(l) && p(C)["preview-expanded"] !== !1) {
        Mn(!0), O(c, !0);
        return;
      }
      if (O(c, Br(r()["show-button-users"]) ?? !0, !0), on("expanded")) {
        const m = Le(() => p(S).expanded);
        m !== void 0 && Lt(!!m);
        return;
      }
      na();
    }
  });
  function on(m) {
    const E = r().templates && Array.isArray(r().templates) ? r().templates.find(($) => $.template === m) : void 0;
    if (E && Ar(E.value_template))
      return E;
  }
  function zr(m) {
    if (!r()["expander-card-id"])
      return;
    const E = {};
    E[r()["expander-card-id"]] = { property: "open", value: m }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function Br(m) {
    var E, $, W, Se;
    if (m !== void 0)
      return (($ = (E = n()) == null ? void 0 : E.user) == null ? void 0 : $.name) !== void 0 && m.includes((Se = (W = n()) == null ? void 0 : W.user) == null ? void 0 : Se.name);
  }
  function na() {
    if (!on("expanded")) {
      if (Br(r()["start-expanded-users"])) {
        lt(!0);
        return;
      }
      if (ue === void 0) {
        ra();
        return;
      }
      try {
        const m = localStorage.getItem(dr);
        if (m === null) {
          ra();
          return;
        }
        const E = m ? m === "true" : p(o);
        lt(E);
      } catch (m) {
        console.error(m), lt(!1);
      }
    }
  }
  function ra() {
    if (r().expanded !== void 0) {
      lt(r().expanded);
      return;
    }
    lt(!1);
  }
  function Lt(m) {
    p(d) && (clearTimeout(p(d)), O(d, null));
    const E = m !== void 0 ? m : !p(o);
    if (!r().animation) {
      lt(E);
      return;
    }
    if (zr(E), O(u, E ? "opening" : "closing", !0), E) {
      Mn(!0), O(
        d,
        setTimeout(
          () => {
            O(u, "idle"), O(d, null);
          },
          350
        ),
        !0
      );
      return;
    }
    O(
      d,
      setTimeout(
        () => {
          Mn(!1), O(u, "idle"), O(d, null);
        },
        350
      ),
      !0
    );
  }
  function lt(m) {
    Mn(m), zr(m);
  }
  function Mn(m) {
    if (O(o, m, !0), !i() && ue !== void 0)
      try {
        localStorage.setItem(dr, p(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    p(o) && p(b) === 0 && O(b, 0.35);
  }
  function ia(m) {
    var $;
    const E = ($ = m.detail) == null ? void 0 : $.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(p(C)) && O(C, E, !0);
  }
  function aa(m) {
    var $, W;
    const E = (W = ($ = m.detail) == null ? void 0 : $["expander-card"]) == null ? void 0 : W.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === r()["expander-card-id"]) {
      if (E.action === "open" && !p(o)) {
        Lt(!0);
        return;
      }
      if (E.action === "close" && p(o)) {
        Lt(!1);
        return;
      }
      E.action === "toggle" && Lt();
    }
  }
  function go() {
    document.body.removeEventListener("ll-custom", aa), document.body.removeEventListener("expander-card-raw-config-updated", ia), Object.entries(x).forEach(([m, E]) => {
      E.then(($) => {
        $(), delete x[m];
      }).catch(() => {
      });
    }), Object.entries(y).forEach(([m, E]) => {
      E.then(($) => {
        $(), delete y[m];
      }).catch(() => {
      });
    }), Object.entries(_).forEach(([m, E]) => {
      E(), delete _[m];
    });
  }
  const sa = (m) => {
    r().haptic && r().haptic !== "none" && Pc(m, r().haptic);
  };
  let Hn, jn = !1, oa = 0, la = 0;
  const mo = (m) => {
    p(v) && (p(v).disabled = !0), Hn = m.target, oa = m.touches[0].clientX, la = m.touches[0].clientY, jn = !1;
  }, yo = (m) => {
    const E = m.touches[0].clientX, $ = m.touches[0].clientY;
    jn = Math.abs(E - oa) > 10 || Math.abs($ - la) > 10;
  }, bo = () => {
    p(v) && (p(v).disabled = !1), Hn = void 0, jn = !1;
  }, wo = () => {
    p(v) && (p(v).disabled = !1);
  }, Eo = (m) => {
    !jn && Hn === m.target && r()["title-card-clickable"] && (sa(Hn), Lt(), O(a, !0), O(
      s,
      window.setTimeout(
        () => {
          O(a, !1), O(s, null);
        },
        100
      ),
      !0
    ), p(v) && (p(v).startPressAnimation(), p(v).endPressAnimation())), Hn = void 0, jn = !1;
  }, $o = (m) => {
    for (const E of Object.values(r().variables ?? {}))
      Ar(E.value_template) ? y[E.variable] = Ca(
        m,
        ($) => {
          Ra(m, E.variable, $);
        },
        E.value_template,
        { config: r() }
      ) : Ra(m, E.variable, E.value_template);
  }, Ao = (m) => {
    _["expander-card"] = Gc(m, "expander-card");
  }, Oo = () => {
    if (!r().templates) return;
    const m = Object.values(r().variables || {}).reduce(
      ($, W) => ($[W.variable] = void 0, $),
      {}
    ), E = Fc({ config: r(), expanderCard: {} }, m);
    $o(E), Ao(E), Object.values(r().templates || {}).forEach(($) => {
      Ar($.value_template) ? x[$.template] = Ca(
        E,
        (W) => {
          p(S)[$.template] = W;
        },
        $.value_template,
        { config: r() }
      ) : p(S)[$.template] = $.value_template;
    });
  };
  function So() {
    if (on("expanded"))
      return;
    const m = r()["min-width-expanded"], E = r()["max-width-expanded"], $ = document.body.offsetWidth;
    if (m && E) {
      r().expanded = $ >= m && $ <= E;
      return;
    }
    if (m) {
      r().expanded = $ >= m;
      return;
    }
    E && (r().expanded = $ <= E);
  }
  function xo() {
    if (i() && p(C)["preview-expanded"] !== !1) {
      Mn(!0);
      return;
    }
    if (on("expanded")) {
      const m = Le(() => p(S).expanded);
      lt(m !== void 0 ? !!m : !1);
    } else
      na();
  }
  function To() {
    if (r()["title-card-clickable"] && !r()["title-card-button-overlay"] && p(A))
      return p(A);
    if (p(f))
      return p(f);
  }
  Xs(() => {
    Oo(), zr(!1), So(), xo(), document.body.addEventListener("ll-custom", aa), document.body.addEventListener("expander-card-raw-config-updated", ia);
    const m = To();
    return m && (m.addEventListener("touchstart", mo, { passive: !0, capture: !0 }), m.addEventListener("touchmove", yo, { passive: !0, capture: !0 }), m.addEventListener("touchcancel", bo, { passive: !0, capture: !0 }), m.addEventListener("touchend", wo, { passive: !0, capture: !0 }), m.addEventListener("touchend", Eo, { passive: !1, capture: !1 })), r()["title-card-clickable"] && r()["title-card-button-overlay"] && p(A) && new ResizeObserver(() => {
      if (p(f) && p(A) && p(g)) {
        const $ = p(A).getBoundingClientRect();
        O(w, $.height - parseFloat(getComputedStyle(p(f)).marginTop) - parseFloat(getComputedStyle(p(f)).marginBottom) + parseFloat(getComputedStyle(p(g)).paddingTop) + parseFloat(getComputedStyle(p(g)).paddingBottom));
      }
    }).observe(p(A)), go;
  });
  const Vr = (m) => {
    if (!p(a)) {
      sa(m.currentTarget), Lt();
      return;
    }
    return m.preventDefault(), m.stopImmediatePropagation(), O(a, !1), p(s) && (clearTimeout(p(s)), O(s, null)), !1;
  };
  var No = {
    get hass() {
      return n();
    },
    set hass(m) {
      n(m), be();
    },
    get preview() {
      return i();
    },
    set preview(m) {
      i(m), be();
    },
    get config() {
      return r();
    },
    set config(m = Ni) {
      r(m), be();
    }
  }, ln = lu(), ca = dt(ln);
  {
    var Co = (m) => {
      var E = au(), $ = dt(E), W = dt($);
      Si(W, {
        get hass() {
          return n();
        },
        get preview() {
          return i();
        },
        get config() {
          return r()["title-card"];
        },
        animation: !1,
        open: !0,
        animationState: "idle",
        get clearCardCss() {
          return r()["clear-children"];
        }
      }), Xe($);
      var Se = Pt($, 2);
      {
        var xe = (ee) => {
          var te = ru(), qe = dt(te);
          Qe(() => Oa(qe, "icon", p(H)));
          var Po = Pt(qe, 2);
          {
            var Do = (kt) => {
              var Fn = nu();
              pt(Fn, (Mo) => O(v, Mo), () => p(v)), me(kt, Fn);
            };
            ft(Po, (kt) => {
              (!r()["title-card-clickable"] || r()["title-card-button-overlay"]) && kt(Do);
            });
          }
          Xe(te), pt(te, (kt) => O(f, kt), () => p(f)), Qe(() => {
            ht(te, `--overlay-margin:${r()["overlay-margin"] ?? ""}; --button-background:${r()["button-background"] ?? ""}; --header-color:${r()["header-color"] ?? ""};`), Te(te, 1, `header ${r()["title-card-button-overlay"] ? " header-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(u) : ""}`, "svelte-1jqiztq"), ht(qe, `--arrow-color:${p(It) ?? ""}`), Te(qe, 1, `ico${p(o) && p(u) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(u) : ""}`, "svelte-1jqiztq");
          }), Jr("click", te, function(...kt) {
            var Fn;
            (Fn = !r()["title-card-clickable"] || r()["title-card-button-overlay"] ? Vr : null) == null || Fn.apply(this, kt);
          }), me(ee, te);
        };
        ft(Se, (ee) => {
          p(c) && ee(xe);
        });
      }
      var cn = Pt(Se, 2);
      {
        var Wr = (ee) => {
          var te = iu();
          pt(te, (qe) => O(v, qe), () => p(v)), me(ee, te);
        };
        ft(cn, (ee) => {
          r()["title-card-clickable"] && !r()["title-card-button-overlay"] && ee(Wr);
        });
      }
      Xe(E), pt(E, (ee) => O(A, ee), () => p(A)), Qe(() => {
        Te(E, 1, `title-card-header${r()["title-card-button-overlay"] ? "-overlay" : ""}${p(o) ? " open" : " close"}${r().animation ? " animation " + p(u) : ""}${r()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), Zs(E, "role", r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? "button" : void 0), Te($, 1, `title-card-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(u) : ""}`, "svelte-1jqiztq"), ht($, `--title-padding:${(r()["title-card-padding"] ? r()["title-card-padding"] : "0px") ?? ""};`);
      }), Jr("click", E, function(...ee) {
        var te;
        (te = r()["title-card-clickable"] && !r()["title-card-button-overlay"] ? Vr : null) == null || te.apply(this, ee);
      }), me(m, E);
    }, Ro = (m) => {
      var E = $a(), $ = ma(E);
      {
        var W = (Se) => {
          var xe = su(), cn = dt(xe), Wr = dt(cn, !0);
          Xe(cn);
          var ee = Pt(cn, 2);
          Qe(() => Oa(ee, "icon", p(H)));
          var te = Pt(ee, 2);
          pt(te, (qe) => O(v, qe), () => p(v)), Xe(xe), pt(xe, (qe) => O(f, qe), () => p(f)), Qe(() => {
            Te(xe, 1, `header${p(o) ? " open" : " close"}${r().animation ? " animation " + p(u) : ""}`, "svelte-1jqiztq"), ht(xe, `--header-width:100%; --button-background:${r()["button-background"] ?? ""};--header-color:${r()["header-color"] ?? ""};`), Te(cn, 1, `primary title${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), hc(Wr, p(V)), ht(ee, `--arrow-color:${p(It) ?? ""}`), Te(ee, 1, `ico${p(o) && p(u) !== "closing" ? " flipped open" : " close"}${r().animation ? " animation " + p(u) : ""}`, "svelte-1jqiztq");
          }), Jr("click", xe, Vr), me(Se, xe);
        };
        ft($, (Se) => {
          p(c) && Se(W);
        });
      }
      me(m, E);
    };
    ft(ca, (m) => {
      r()["title-card"] ? m(Co) : m(Ro, -1);
    });
  }
  var ua = Pt(ca, 2);
  {
    var Io = (m) => {
      var E = ou(), $ = dt(E);
      mc($, 20, () => r().cards, (W) => W, (W, Se) => {
        {
          let xe = /* @__PURE__ */ qn(() => p(o) && i());
          Si(W, {
            get hass() {
              return n();
            },
            get preview() {
              return p(xe);
            },
            get config() {
              return Se;
            },
            get marginTop() {
              return r()["child-margin-top"];
            },
            get open() {
              return p(o);
            },
            get animation() {
              return r().animation;
            },
            get animationState() {
              return p(u);
            },
            get clearCardCss() {
              return r()["clear-children"];
            }
          });
        }
      }), Xe($), Xe(E), Qe(() => {
        Te(E, 1, `children-wrapper ${r().animation ? "animation " + p(u) : ""}${p(o) ? " open" : " close"}`, "svelte-1jqiztq"), ht($, `--expander-card-display:${r()["expander-card-display"] ?? ""};
                --gap:${(p(o) && p(u) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""};
                --child-padding:${(p(o) && p(u) !== "closing" ? r()["child-padding"] : "0px") ?? ""};`), Te($, 1, `children-container${p(o) ? " open" : " close"}${r().animation ? " animation " + p(u) : ""}`, "svelte-1jqiztq");
      }), me(m, E);
    };
    ft(ua, (m) => {
      r().cards && m(Io);
    });
  }
  var Lo = Pt(ua, 2);
  {
    var ko = (m) => {
      var E = $a(), $ = ma(E);
      wc($, () => p(D)), me(m, E);
    };
    ft(Lo, (m) => {
      p(D) && m(ko);
    });
  }
  return Xe(ln), pt(ln, (m) => O(g, m), () => p(g)), Qe(() => {
    Te(ln, 1, `expander-card${r().clear ? " clear" : ""}${p(o) ? " open" : " close"} ${p(u)}${r().animation ? " animation " + p(u) : ""}`, "svelte-1jqiztq"), ht(ln, `--expander-card-display:${r()["expander-card-display"] ?? ""};
     --gap:${(p(o) && p(u) !== "closing" ? r()["expanded-gap"] : r().gap) ?? ""}; --padding:${r().padding ?? ""};
     --expander-state:${p(o) ?? ""};
     --icon-rotate-degree:${r()["icon-rotate-degree"] ?? ""};
     --card-background:${(p(o) && p(u) !== "closing" && r()["expander-card-background-expanded"] ? r()["expander-card-background-expanded"] : r()["expander-card-background"]) ?? ""};
     --background-animation-duration:${p(b) ?? ""}s;
     --expander-card-overlay-height:${p(w) ? `${p(w)}px` : "auto"};
    `);
  }), me(t, ln), Pi(No);
}
lc(["click"]);
customElements.define("expander-card", no(uu, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    j(this, "config");
  }
  static async getConfigElement() {
    return await tl(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...Ni, ...n };
  }
}));
const du = "7.0.0";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Sr = globalThis, Ki = Sr.ShadowRoot && (Sr.ShadyCSS === void 0 || Sr.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Xi = Symbol(), Ga = /* @__PURE__ */ new WeakMap();
let uo = class {
  constructor(e, n, i) {
    if (this._$cssResult$ = !0, i !== Xi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Ki && e === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (e = Ga.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Ga.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const fu = (t) => new uo(typeof t == "string" ? t : t + "", void 0, Xi), Qi = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((i, r, a) => i + ((s) => {
    if (s._$cssResult$ === !0) return s.cssText;
    if (typeof s == "number") return s;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + s + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[a + 1], t[0]);
  return new uo(n, t, Xi);
}, hu = (t, e) => {
  if (Ki) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const i = document.createElement("style"), r = Sr.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = n.cssText, t.appendChild(i);
  }
}, Ua = Ki ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const i of e.cssRules) n += i.cssText;
  return fu(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: pu, defineProperty: vu, getOwnPropertyDescriptor: _u, getOwnPropertyNames: gu, getOwnPropertySymbols: mu, getPrototypeOf: yu } = Object, St = globalThis, za = St.trustedTypes, bu = za ? za.emptyScript : "", si = St.reactiveElementPolyfillSupport, Kn = (t, e) => t, Lr = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? bu : null;
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
} }, Zi = (t, e) => !pu(t, e), Ba = { attribute: !0, type: String, converter: Lr, reflect: !1, useDefault: !1, hasChanged: Zi };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), St.litPropertyMetadata ?? (St.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let hn = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Ba) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, n);
      r !== void 0 && vu(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, n, i) {
    const { get: r, set: a } = _u(this.prototype, e) ?? { get() {
      return this[n];
    }, set(s) {
      this[n] = s;
    } };
    return { get: r, set(s) {
      const o = r == null ? void 0 : r.call(this);
      a == null || a.call(this, s), this.requestUpdate(e, o, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ba;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Kn("elementProperties"))) return;
    const e = yu(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Kn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Kn("properties"))) {
      const n = this.properties, i = [...gu(n), ...mu(n)];
      for (const r of i) this.createProperty(r, n[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const n = litPropertyMetadata.get(e);
      if (n !== void 0) for (const [i, r] of n) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, i] of this.elementProperties) {
      const r = this._$Eu(n, i);
      r !== void 0 && this._$Eh.set(r, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const n = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) n.unshift(Ua(r));
    } else e !== void 0 && n.push(Ua(e));
    return n;
  }
  static _$Eu(e, n) {
    const i = n.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const i of n.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return hu(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((n) => {
      var i;
      return (i = n.hostConnected) == null ? void 0 : i.call(n);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((n) => {
      var i;
      return (i = n.hostDisconnected) == null ? void 0 : i.call(n);
    });
  }
  attributeChangedCallback(e, n, i) {
    this._$AK(e, i);
  }
  _$ET(e, n) {
    var a;
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const s = (((a = i.converter) == null ? void 0 : a.toAttribute) !== void 0 ? i.converter : Lr).toAttribute(n, i.type);
      this._$Em = e, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var a, s;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((a = o.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? o.converter : Lr;
      this._$Em = r;
      const c = l.fromAttribute(n, o.type);
      this[r] = c ?? ((s = this._$Ej) == null ? void 0 : s.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, n, i, r = !1, a) {
    var s;
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (a = this[e]), i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? Zi)(a, n) || i.useDefault && i.reflect && a === ((s = this._$Ej) == null ? void 0 : s.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, n, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: i, reflect: r, wrapped: a }, s) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, s ?? n ?? this[e]), a !== !0 || s !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (n = void 0), this._$AL.set(e, n)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, s] of this._$Ep) this[a] = s;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [a, s] of r) {
        const { wrapped: o } = s, l = this[a];
        o !== !0 || this._$AL.has(a) || l === void 0 || this.C(a, void 0, s, l);
      }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), (i = this._$EO) == null || i.forEach((r) => {
        var a;
        return (a = r.hostUpdate) == null ? void 0 : a.call(r);
      }), this.update(n)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(n);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var n;
    (n = this._$EO) == null || n.forEach((i) => {
      var r;
      return (r = i.hostUpdated) == null ? void 0 : r.call(i);
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
hn.elementStyles = [], hn.shadowRootOptions = { mode: "open" }, hn[Kn("elementProperties")] = /* @__PURE__ */ new Map(), hn[Kn("finalized")] = /* @__PURE__ */ new Map(), si == null || si({ ReactiveElement: hn }), (St.reactiveElementVersions ?? (St.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xn = globalThis, Va = (t) => t, kr = Xn.trustedTypes, Wa = kr ? kr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, fo = "$lit$", _t = `lit$${Math.random().toFixed(9).slice(2)}$`, ho = "?" + _t, wu = `<${ho}>`, tn = document, er = () => tn.createComment(""), tr = (t) => t === null || typeof t != "object" && typeof t != "function", ea = Array.isArray, Eu = (t) => ea(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", oi = `[ 	
\f\r]`, zn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ya = /-->/g, Ja = />/g, Mt = RegExp(`>|${oi}(?:([^\\s"'>=/]+)(${oi}*=${oi}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ka = /'/g, Xa = /"/g, po = /^(?:script|style|textarea|title)$/i, $u = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), fn = $u(1), Ln = Symbol.for("lit-noChange"), U = Symbol.for("lit-nothing"), Qa = /* @__PURE__ */ new WeakMap(), Gt = tn.createTreeWalker(tn, 129);
function vo(t, e) {
  if (!ea(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Wa !== void 0 ? Wa.createHTML(e) : e;
}
const Au = (t, e) => {
  const n = t.length - 1, i = [];
  let r, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", s = zn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let c, u, d = -1, b = 0;
    for (; b < l.length && (s.lastIndex = b, u = s.exec(l), u !== null); ) b = s.lastIndex, s === zn ? u[1] === "!--" ? s = Ya : u[1] !== void 0 ? s = Ja : u[2] !== void 0 ? (po.test(u[2]) && (r = RegExp("</" + u[2], "g")), s = Mt) : u[3] !== void 0 && (s = Mt) : s === Mt ? u[0] === ">" ? (s = r ?? zn, d = -1) : u[1] === void 0 ? d = -2 : (d = s.lastIndex - u[2].length, c = u[1], s = u[3] === void 0 ? Mt : u[3] === '"' ? Xa : Ka) : s === Xa || s === Ka ? s = Mt : s === Ya || s === Ja ? s = zn : (s = Mt, r = void 0);
    const w = s === Mt && t[o + 1].startsWith("/>") ? " " : "";
    a += s === zn ? l + wu : d >= 0 ? (i.push(c), l.slice(0, d) + fo + l.slice(d) + _t + w) : l + _t + (d === -2 ? o : w);
  }
  return [vo(t, a + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class nr {
  constructor({ strings: e, _$litType$: n }, i) {
    let r;
    this.parts = [];
    let a = 0, s = 0;
    const o = e.length - 1, l = this.parts, [c, u] = Au(e, n);
    if (this.el = nr.createElement(c, i), Gt.currentNode = this.el.content, n === 2 || n === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (r = Gt.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const d of r.getAttributeNames()) if (d.endsWith(fo)) {
          const b = u[s++], w = r.getAttribute(d).split(_t), g = /([.?@])?(.*)/.exec(b);
          l.push({ type: 1, index: a, name: g[2], strings: w, ctor: g[1] === "." ? Su : g[1] === "?" ? xu : g[1] === "@" ? Tu : Gr }), r.removeAttribute(d);
        } else d.startsWith(_t) && (l.push({ type: 6, index: a }), r.removeAttribute(d));
        if (po.test(r.tagName)) {
          const d = r.textContent.split(_t), b = d.length - 1;
          if (b > 0) {
            r.textContent = kr ? kr.emptyScript : "";
            for (let w = 0; w < b; w++) r.append(d[w], er()), Gt.nextNode(), l.push({ type: 2, index: ++a });
            r.append(d[b], er());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ho) l.push({ type: 2, index: a });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(_t, d + 1)) !== -1; ) l.push({ type: 7, index: a }), d += _t.length - 1;
      }
      a++;
    }
  }
  static createElement(e, n) {
    const i = tn.createElement("template");
    return i.innerHTML = e, i;
  }
}
function kn(t, e, n = t, i) {
  var s, o;
  if (e === Ln) return e;
  let r = i !== void 0 ? (s = n._$Co) == null ? void 0 : s[i] : n._$Cl;
  const a = tr(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== a && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), a === void 0 ? r = void 0 : (r = new a(t), r._$AT(t, n, i)), i !== void 0 ? (n._$Co ?? (n._$Co = []))[i] = r : n._$Cl = r), r !== void 0 && (e = kn(t, r._$AS(t, e.values), r, i)), e;
}
class Ou {
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
    const { el: { content: n }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? tn).importNode(n, !0);
    Gt.currentNode = r;
    let a = Gt.nextNode(), s = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (s === l.index) {
        let c;
        l.type === 2 ? c = new cr(a, a.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(a, l.name, l.strings, this, e) : l.type === 6 && (c = new Nu(a, this, e)), this._$AV.push(c), l = i[++o];
      }
      s !== (l == null ? void 0 : l.index) && (a = Gt.nextNode(), s++);
    }
    return Gt.currentNode = tn, r;
  }
  p(e) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, n), n += i.strings.length - 2) : i._$AI(e[n])), n++;
  }
}
class cr {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, i, r) {
    this.type = 2, this._$AH = U, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = kn(this, e, n), tr(e) ? e === U || e == null || e === "" ? (this._$AH !== U && this._$AR(), this._$AH = U) : e !== this._$AH && e !== Ln && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Eu(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== U && tr(this._$AH) ? this._$AA.nextSibling.data = e : this.T(tn.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var a;
    const { values: n, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = nr.createElement(vo(i.h, i.h[0]), this.options)), i);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === r) this._$AH.p(n);
    else {
      const s = new Ou(r, this), o = s.u(this.options);
      s.p(n), this.T(o), this._$AH = s;
    }
  }
  _$AC(e) {
    let n = Qa.get(e.strings);
    return n === void 0 && Qa.set(e.strings, n = new nr(e)), n;
  }
  k(e) {
    ea(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, r = 0;
    for (const a of e) r === n.length ? n.push(i = new cr(this.O(er()), this.O(er()), this, this.options)) : i = n[r], i._$AI(a), r++;
    r < n.length && (this._$AR(i && i._$AB.nextSibling, r), n.length = r);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, n); e !== this._$AB; ) {
      const r = Va(e).nextSibling;
      Va(e).remove(), e = r;
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
  constructor(e, n, i, r, a) {
    this.type = 1, this._$AH = U, this._$AN = void 0, this.element = e, this.name = n, this._$AM = r, this.options = a, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = U;
  }
  _$AI(e, n = this, i, r) {
    const a = this.strings;
    let s = !1;
    if (a === void 0) e = kn(this, e, n, 0), s = !tr(e) || e !== this._$AH && e !== Ln, s && (this._$AH = e);
    else {
      const o = e;
      let l, c;
      for (e = a[0], l = 0; l < a.length - 1; l++) c = kn(this, o[i + l], n, l), c === Ln && (c = this._$AH[l]), s || (s = !tr(c) || c !== this._$AH[l]), c === U ? e = U : e !== U && (e += (c ?? "") + a[l + 1]), this._$AH[l] = c;
    }
    s && !r && this.j(e);
  }
  j(e) {
    e === U ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Su extends Gr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === U ? void 0 : e;
  }
}
class xu extends Gr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== U);
  }
}
class Tu extends Gr {
  constructor(e, n, i, r, a) {
    super(e, n, i, r, a), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = kn(this, e, n, 0) ?? U) === Ln) return;
    const i = this._$AH, r = e === U && i !== U || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, a = e !== U && (i === U || r);
    r && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Nu {
  constructor(e, n, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    kn(this, e);
  }
}
const li = Xn.litHtmlPolyfillSupport;
li == null || li(nr, cr), (Xn.litHtmlVersions ?? (Xn.litHtmlVersions = [])).push("3.3.2");
const Cu = (t, e, n) => {
  const i = (n == null ? void 0 : n.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const a = (n == null ? void 0 : n.renderBefore) ?? null;
    i._$litPart$ = r = new cr(e.insertBefore(er(), a), a, void 0, n ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = globalThis;
class Qn extends hn {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Cu(n, this.renderRoot, this.renderOptions);
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
    return Ln;
  }
}
var ns;
Qn._$litElement$ = !0, Qn.finalized = !0, (ns = Kt.litElementHydrateSupport) == null || ns.call(Kt, { LitElement: Qn });
const ci = Kt.litElementPolyfillSupport;
ci == null || ci({ LitElement: Qn });
(Kt.litElementVersions ?? (Kt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ru = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Iu = { attribute: !0, type: String, converter: Lr, reflect: !1, hasChanged: Zi }, Lu = (t = Iu, e, n) => {
  const { kind: i, metadata: r } = n;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(n.name, t), i === "accessor") {
    const { name: s } = n;
    return { set(o) {
      const l = e.get.call(this);
      e.set.call(this, o), this.requestUpdate(s, l, t, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(s, void 0, t, o), o;
    } };
  }
  if (i === "setter") {
    const { name: s } = n;
    return function(o) {
      const l = this[s];
      e.call(this, o), this.requestUpdate(s, l, t, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function Ur(t) {
  return (e, n) => typeof n == "object" ? Lu(t, e, n) : ((i, r, a) => {
    const s = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, i), s ? Object.getOwnPropertyDescriptor(r, a) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ur(t) {
  return Ur({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ku = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Pu(t, e) {
  return (n, i, r) => {
    const a = (s) => {
      var o;
      return ((o = s.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return ku(n, i, { get() {
      return a(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Du = (t) => t ?? U, Mu = Qi`
  ha-dialog,
  ha-adaptive-dialog {
    --mdc-dialog-min-width: 400px;
    --mdc-dialog-max-width: 600px;
    --mdc-dialog-max-width: min(600px, 95vw);
    --justify-action-buttons: space-between;
    --dialog-container-padding: var(--safe-area-inset-top, 0)
      var(--safe-area-inset-right, 0) var(--safe-area-inset-bottom, 0)
      var(--safe-area-inset-left, 0);
    --dialog-surface-padding: 0px;
  }

  ha-dialog .form,
  ha-adaptive-dialog .form {
    color: var(--primary-text-color);
  }

  a {
    color: var(--primary-color);
  }

  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog,
    ha-adaptive-dialog {
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
    }
    ha-dialog {
      --ha-dialog-border-radius: var(--ha-border-radius-square);
    }
  }
  .error {
    color: var(--error-color);
  }
`, Hu = Qi`
  ha-dialog,
  ha-adaptive-dialog {
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
    --ha-dialog-max-height: calc(
      100vh - var(--dialog-surface-margin-top) - var(--ha-space-2) - var(
          --safe-area-inset-y,
          0px
        )
    );
    --ha-dialog-max-height: calc(
      100svh - var(--dialog-surface-margin-top) - var(--ha-space-2) - var(
          --safe-area-inset-y,
          0px
        )
    );
  }

  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog,
    ha-adaptive-dialog {
      /* When in fullscreen, dialog should be attached to top */
      --dialog-surface-margin-top: 0px;
      --mdc-dialog-min-height: 100vh;
      --mdc-dialog-min-height: 100svh;
      --mdc-dialog-max-height: 100vh;
      --mdc-dialog-max-height: 100svh;
      --ha-dialog-max-height: 100vh;
      --ha-dialog-max-height: 100svh;
    }
  }
`;
var ju = Object.defineProperty, Fu = Object.getOwnPropertyDescriptor, Ke = (t, e, n, i) => {
  for (var r = i > 1 ? void 0 : i ? Fu(e, n) : e, a = t.length - 1, s; a >= 0; a--)
    (s = t[a]) && (r = (i ? s(e, n, r) : s(r)) || r);
  return i && r && ju(e, n, r), r;
};
const _o = "custom:", qu = (t) => t.startsWith(_o), Gu = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Uu = (t) => t.replace(_o, "");
let _e = class extends Qn {
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
      return U;
    const t = !this._config.type || this._error || void 0;
    let e = this._params.title ?? "";
    if (this._config.type) {
      let i;
      qu(this._config.type) ? (i = (n = Gu(
        Uu(this._config.type)
      )) == null ? void 0 : n.name, i != null && i.toLowerCase().endsWith(" card") && (i = i.substring(0, i.length - 5))) : i = this.hass.localize(
        `ui.panel.lovelace.editor.card.${this._config.type}.name`
      ), e = `${e} - ${this.hass.localize(
        "ui.panel.lovelace.editor.edit_card.typed_header",
        { type: i }
      )}`;
    }
    return fn`
        <ha-dialog
            open
            scrimClickAction
            escapeKeyAction
            @keydown=${this._ignoreKeydown.bind(this)}
            @closed=${this._cancel.bind(this)}
            .heading=${e}
            .width=${this.large ? "full" : "large"}
        >
            <ha-dialog-header slot="header">
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
            <ha-dialog-footer slot="footer">
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
                        disabled=${Du(t)}
                    >
                        ${this._params.submitText || this.hass.localize("ui.common.save")}
                    </ha-button>
                </div>
                ${this._renderCardEditorActions()}
            </ha-dialog-footer>
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
      return U;
    const t = this.hass.localize(
      !this._cardEditorEl || this._cardGUIMode ? "ui.panel.lovelace.editor.edit_card.show_code_editor" : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
    );
    return fn`
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
    const t = this._error ? "blur" : "", e = this._error ? fn` <ha-spinner aria-label="Can't update card"></ha-spinner> ` : "";
    return fn`
        ${this._config.type ? fn`
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
            ` : fn`
            <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._cardConfigChanged.bind(this)}
            ></hui-card-picker>
            `}
        `;
  }
};
_e.styles = [
  Mu,
  Hu,
  Qi`
            :host {
                --code-mirror-max-height: calc(100vh - 176px);
            }

            ha-dialog {
                --dialog-z-index: 6;
                --dialog-content-padding: var(--ha-space-2);
            }

            .content {
                width: 100%;
                max-width: 100%;
            }

            @media all and (max-width: 450px), all and (max-height: 500px) {
            /* overrule the ha-style-dialog max-height on small screens */
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

            .center {
                margin-left: auto;
                margin-right: auto;
            }

            .content {
                display: flex;
                flex-direction: column;
            }

            .content hui-card {
                display: block;
                padding: 4px;
                margin: 0 auto;
                max-width: 390px;
            }
            .content hui-section {
                display: block;
                padding: 4px;
                margin: 0 auto;
                max-width: var(--ha-view-sections-column-max-width, 500px);
            }
            .content .element-editor {
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
                .content hui-section {
                    padding: 8px 10px;
                    margin: auto 0px;
                    max-width: var(--ha-view-sections-column-max-width, 500px);
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
                margin-right: auto;
                margin-inline-end: auto;
                margin-inline-start: initial;
            }
            [slot="navigationIcon"] {
                --ha-icon-display: block;
            }
        `
];
Ke([
  Ur({ attribute: !1 })
], _e.prototype, "hass", 2);
Ke([
  Ur({ type: Boolean, reflect: !0 })
], _e.prototype, "large", 2);
Ke([
  Ur({ attribute: !1 })
], _e.prototype, "lovelace", 2);
Ke([
  ur()
], _e.prototype, "_params", 2);
Ke([
  ur()
], _e.prototype, "_config", 2);
Ke([
  ur()
], _e.prototype, "_cardGUIMode", 2);
Ke([
  ur()
], _e.prototype, "_cardGUIModeAvailable", 2);
Ke([
  ur()
], _e.prototype, "_error", 2);
Ke([
  Pu("hui-card-element-editor")
], _e.prototype, "_cardEditorEl", 2);
_e = Ke([
  Ru("expander-card-title-card-edit-form")
], _e);
console.info(
  `%c  Expander-Card 
%c Version ${du}`,
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
customElements.get("expander-card-title-card-edit-form") || customElements.define("expander-card-title-card-edit-form", _e);
export {
  uu as default
};
//# sourceMappingURL=expander-card.js.map
