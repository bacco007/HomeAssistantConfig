var Uo = Object.defineProperty;
var fa = (t) => {
  throw TypeError(t);
};
var zo = (t, e, n) => e in t ? Uo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var j = (t, e, n) => zo(t, typeof e != "symbol" ? e + "" : e, n), Jr = (t, e, n) => e.has(t) || fa("Cannot " + n);
var f = (t, e, n) => (Jr(t, e, "read from private field"), n ? n.call(t) : e.get(t)), C = (t, e, n) => e.has(t) ? fa("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, n), x = (t, e, n, r) => (Jr(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n), F = (t, e, n) => (Jr(t, e, "access private method"), n);
const Bo = "5";
var ts;
typeof window < "u" && ((ts = window.__svelte ?? (window.__svelte = {})).v ?? (ts.v = /* @__PURE__ */ new Set())).add(Bo);
const Vo = {
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
}, Wo = [
  "expanded",
  "icon",
  "arrow-color",
  "title",
  "style"
];
var pr = /* @__PURE__ */ ((t) => (t.CSS = "css", t.Object = "object", t))(pr || {});
const Yo = { name: "style", label: "CSS text", selector: { text: { multiline: !0 } } }, Jo = { name: "style", label: "CSS structured object", selector: { object: {} } }, Ko = { icon: {} }, Xo = { text: {} }, Qo = { boolean: {} }, Zo = (t) => ({
  number: {
    unit_of_measurement: t
  }
}), el = (t, e) => ({
  name: t,
  label: e,
  selector: Ko
}), K = (t, e) => ({
  name: t,
  label: e,
  selector: Xo
}), ln = (t, e) => ({
  name: t,
  label: e,
  selector: Qo
}), ha = (t, e, n) => ({
  name: t,
  label: e,
  selector: Zo(n)
}), tl = [
  {
    type: "expandable",
    label: "Expander Card Settings",
    icon: "mdi:arrow-down-bold-box-outline",
    schema: [
      {
        ...K("title", "Title")
      },
      {
        ...el("icon", "Icon")
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
                ...ln("expanded", "Start expanded")
              },
              {
                ...ln("animation", "Enable animation")
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
                ...ha("min-width-expanded", "Min width expanded", "px")
              },
              {
                ...ha("max-width-expanded", "Max width expanded", "px")
              },
              {
                ...K("storage-id", "Storage ID")
              },
              {
                ...K("expander-card-id", "Expander card ID")
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
                ...K("arrow-color", "Icon color")
              },
              {
                ...K("icon-rotate-degree", "Icon rotate degree")
              },
              {
                ...K("header-color", "Header color")
              },
              {
                ...K("button-background", "Button background color")
              },
              {
                ...K("expander-card-background", "Background")
              },
              {
                ...K("expander-card-background-expanded", "Background when expanded")
              },
              {
                ...K("expander-card-display", "Expander card display")
              },
              {
                ...ln("clear", "Clear border and background")
              },
              {
                ...K("gap", "Gap")
              },
              {
                ...K("padding", "Padding")
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
                ...K("expanded-gap", "Card gap")
              },
              {
                ...K("child-padding", "Card padding")
              },
              {
                ...K("child-margin-top", "Card margin top")
              },
              {
                ...ln("clear-children", "Clear card border and background")
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
                ...ln("title-card-clickable", "Make title card clickable to expand/collapse")
              },
              {
                ...ln("title-card-button-overlay", "Overlay expand button on title card")
              },
              {
                ...K("overlay-margin", "Overlay margin")
              },
              {
                ...K("title-card-padding", "Title card padding")
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
], nl = (t, e) => new Promise((n) => {
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
            submit: (a) => {
              n(a), i && i(a);
            }
          }
        },
        bubbles: !0,
        composed: !0
      }
    )
  );
}), Gn = window;
let vr = Gn.cardHelpers;
const rl = new Promise((t) => {
  vr && t(), Gn.loadCardHelpers && Gn.loadCardHelpers().then((e) => {
    vr = e, Gn.cardHelpers = vr, t();
  });
});
async function il() {
  const t = document.querySelector("home-assistant"), e = t == null ? void 0 : t.hass;
  return e ? (await e.callWS({ type: "config/auth/list" })).filter((r) => !r.system_generated).map((r) => r.name) : void 0;
}
const al = async () => {
  const t = await rl.then(() => vr.createCardElement({ type: "vertical-stack", cards: [] })), e = await customElements.whenDefined("hui-vertical-stack-card").then(() => t.constructor.getConfigElement()), n = await il();
  return class extends e.constructor {
    constructor() {
      super(), this.showDialogCallback = (i) => {
        var s, o, l, c;
        ((l = (o = (s = i.detail) == null ? void 0 : s.dialogParams) == null ? void 0 : o.schema) == null ? void 0 : l.find((u) => u.name === "expander_card_title_card_marker")) && (i.stopPropagation(), (c = i.detail) != null && c.dialogImport && i.detail.dialogImport().then(async () => {
          var p, m, w, _, $, d, v, g;
          const u = {
            title: "Title card",
            config: this._config["title-card"] || {},
            submit: (m = (p = i.detail) == null ? void 0 : p.dialogParams) == null ? void 0 : m.submit,
            cancel: (_ = (w = i.detail) == null ? void 0 : w.dialogParams) == null ? void 0 : _.cancel,
            submitText: (d = ($ = i.detail) == null ? void 0 : $.dialogParams) == null ? void 0 : d.submitText,
            cancelText: (g = (v = i.detail) == null ? void 0 : v.dialogParams) == null ? void 0 : g.cancelText,
            lovelace: this.lovelace
          };
          await nl(
            this,
            u
          );
        }));
      }, this._computeLabelCallback = (i) => i.label ?? i.name ?? "", this._valueChanged = (i) => {
        const a = i.detail.value, s = Object.entries(Vo);
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
    setConfig(i) {
      this._config = i;
    }
    // define _schema getter to return our own schema
    get _schema() {
      const a = JSON.stringify(tl), s = this._users.map((p) => p.replace(/\\/g, "\\\\").replace(/"/g, '\\"')).join('","');
      let o = a.replace(/\[\[users\]\]/g, s);
      o = o.replace(
        /\[\[templates\]\]/g,
        // NOSONAR es2019
        Wo.filter((p) => {
          var m;
          return !((m = this._config.templates) != null && m.some((w) => w.template === p));
        }).join('","')
      );
      const c = (this._config.style && typeof this._config.style == "object" ? pr.Object : pr.CSS) === pr.CSS ? JSON.stringify(Yo) : JSON.stringify(Jo);
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
}, sl = async () => {
  for (; customElements.get("home-assistant") === void 0; )
    await new Promise((t) => Gn.setTimeout(t, 100));
  if (!customElements.get("expander-card-editor")) {
    const t = await al();
    customElements.define("expander-card-editor", t);
  }
}, ol = 1, ll = 2, cl = 16, ul = 1, dl = 2, as = "[", Ii = "[!", pa = "[?", Li = "]", Kt = {}, X = Symbol(), ss = "http://www.w3.org/1999/xhtml", fl = "http://www.w3.org/2000/svg", hl = "http://www.w3.org/1998/Math/MathML", pl = !1;
var os = Array.isArray, vl = Array.prototype.indexOf, $n = Array.prototype.includes, Hr = Array.from, Sr = Object.keys, xr = Object.defineProperty, pn = Object.getOwnPropertyDescriptor, _l = Object.getOwnPropertyDescriptors, gl = Object.prototype, ml = Array.prototype, ls = Object.getPrototypeOf, va = Object.isExtensible;
const yl = () => {
};
function bl(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function cs() {
  var t, e, n = new Promise((r, i) => {
    t = r, e = i;
  });
  return { promise: n, resolve: t, reject: e };
}
const W = 2, An = 4, jr = 8, us = 1 << 24, Ct = 16, Fe = 32, Ot = 64, fi = 128, $e = 512, V = 1024, te = 2048, We = 4096, ve = 8192, Ae = 16384, Rt = 32768, hi = 1 << 25, On = 65536, _a = 1 << 17, wl = 1 << 18, tn = 1 << 19, El = 1 << 20, at = 1 << 25, Xt = 65536, pi = 1 << 21, ki = 1 << 22, wt = 1 << 23, _r = Symbol("$state"), $l = Symbol("legacy props"), Al = Symbol(""), Ze = new class extends Error {
  constructor() {
    super(...arguments);
    j(this, "name", "StaleReactionError");
    j(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var ns;
const Ol = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!((ns = globalThis.document) != null && ns.contentType) && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
), Fr = 3, In = 8;
function Sl(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function xl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Tl(t, e, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Nl(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Cl() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Rl(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Il() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ll() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function kl() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Pl() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Dl() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ml() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function ar(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Hl() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let k = !1;
function He(t) {
  k = t;
}
let R;
function ee(t) {
  if (t === null)
    throw ar(), Kt;
  return R = t;
}
function Sn() {
  return ee(/* @__PURE__ */ qe(R));
}
function Ke(t) {
  if (k) {
    if (/* @__PURE__ */ qe(R) !== null)
      throw ar(), Kt;
    R = t;
  }
}
function jl(t = 1) {
  if (k) {
    for (var e = t, n = R; e--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ qe(n);
    R = n;
  }
}
function Tr(t = !0) {
  for (var e = 0, n = R; ; ) {
    if (n.nodeType === In) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Li) {
        if (e === 0) return n;
        e -= 1;
      } else (r === as || r === Ii || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (e += 1);
    }
    var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ qe(n)
    );
    t && n.remove(), n = i;
  }
}
function ds(t) {
  if (!t || t.nodeType !== In)
    throw ar(), Kt;
  return (
    /** @type {Comment} */
    t.data
  );
}
function fs(t) {
  return t === this.v;
}
function Fl(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function hs(t) {
  return !Fl(t, this.v);
}
let ql = !1, oe = null;
function xn(t) {
  oe = t;
}
function Pi(t, e = !1, n) {
  oe = {
    p: oe,
    i: !1,
    c: null,
    e: null,
    s: t,
    x: null,
    r: (
      /** @type {Effect} */
      I
    ),
    l: null
  };
}
function Di(t) {
  var e = (
    /** @type {ComponentContext} */
    oe
  ), n = e.e;
  if (n !== null) {
    e.e = null;
    for (var r of n)
      js(r);
  }
  return t !== void 0 && (e.x = t), e.i = !0, oe = e.p, t ?? /** @type {T} */
  {};
}
function ps() {
  return !0;
}
let jt = [];
function vs() {
  var t = jt;
  jt = [], bl(t);
}
function vn(t) {
  if (jt.length === 0 && !Un) {
    var e = jt;
    queueMicrotask(() => {
      e === jt && vs();
    });
  }
  jt.push(t);
}
function Gl() {
  for (; jt.length > 0; )
    vs();
}
function _s(t) {
  var e = I;
  if (e === null)
    return N.f |= wt, t;
  if ((e.f & Rt) === 0 && (e.f & An) === 0)
    throw t;
  yt(t, e);
}
function yt(t, e) {
  for (; e !== null; ) {
    if ((e.f & fi) !== 0) {
      if ((e.f & Rt) === 0)
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
const Ul = -7169;
function z(t, e) {
  t.f = t.f & Ul | e;
}
function Mi(t) {
  (t.f & $e) !== 0 || t.deps === null ? z(t, V) : z(t, We);
}
function gs(t) {
  if (t !== null)
    for (const e of t)
      (e.f & W) === 0 || (e.f & Xt) === 0 || (e.f ^= Xt, gs(
        /** @type {Derived} */
        e.deps
      ));
}
function ms(t, e, n) {
  (t.f & te) !== 0 ? e.add(t) : (t.f & We) !== 0 && n.add(t), gs(t.deps), z(t, V);
}
const Pt = /* @__PURE__ */ new Set();
let P = null, Q = null, vi = null, Un = !1, Kr = !1, fn = null, gr = null;
var ga = 0;
let zl = 1;
var gn, mn, yn, bn, Zn, de, Ut, et, tt, wn, ne, _i, gi, mi, yi, ys;
const Pr = class Pr {
  constructor() {
    C(this, ne);
    // for debugging. TODO remove once async is stable
    j(this, "id", zl++);
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
    C(this, gn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    C(this, mn, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    C(this, yn, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    C(this, bn, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    C(this, Zn, null);
    /**
     * The root effects that need to be flushed
     * @type {Effect[]}
     */
    C(this, de, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    C(this, Ut, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    C(this, et, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    C(this, tt, /* @__PURE__ */ new Map());
    j(this, "is_fork", !1);
    C(this, wn, !1);
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    f(this, tt).has(e) || f(this, tt).set(e, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(e) {
    var n = f(this, tt).get(e);
    if (n) {
      f(this, tt).delete(e);
      for (var r of n.d)
        z(r, te), this.schedule(r);
      for (r of n.m)
        z(r, We), this.schedule(r);
    }
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(e, n) {
    n !== X && !this.previous.has(e) && this.previous.set(e, n), (e.f & wt) === 0 && (this.current.set(e, e.v), Q == null || Q.set(e, e.v));
  }
  activate() {
    P = this;
  }
  deactivate() {
    P = null, Q = null;
  }
  flush() {
    try {
      Kr = !0, P = this, F(this, ne, gi).call(this);
    } finally {
      ga = 0, vi = null, fn = null, gr = null, Kr = !1, P = null, Q = null, Et.clear();
    }
  }
  discard() {
    for (const e of f(this, mn)) e(this);
    f(this, mn).clear(), Pt.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(e) {
    x(this, yn, f(this, yn) + 1), e && x(this, bn, f(this, bn) + 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(e, n) {
    x(this, yn, f(this, yn) - 1), e && x(this, bn, f(this, bn) - 1), !(f(this, wn) || n) && (x(this, wn, !0), vn(() => {
      x(this, wn, !1), this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(e, n) {
    for (const r of e)
      f(this, Ut).add(r);
    for (const r of n)
      f(this, et).add(r);
    e.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(e) {
    f(this, gn).add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    f(this, mn).add(e);
  }
  settled() {
    return (f(this, Zn) ?? x(this, Zn, cs())).promise;
  }
  static ensure() {
    if (P === null) {
      const e = P = new Pr();
      Kr || (Pt.add(P), Un || vn(() => {
        P === e && e.flush();
      }));
    }
    return P;
  }
  apply() {
    {
      Q = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(e) {
    var i;
    if (vi = e, (i = e.b) != null && i.is_pending && (e.f & (An | jr | us)) !== 0 && (e.f & Rt) === 0) {
      e.b.defer_effect(e);
      return;
    }
    for (var n = e; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fn !== null && n === I && (N === null || (N.f & W) === 0))
        return;
      if ((r & (Ot | Fe)) !== 0) {
        if ((r & V) === 0)
          return;
        n.f ^= V;
      }
    }
    f(this, de).push(n);
  }
};
gn = new WeakMap(), mn = new WeakMap(), yn = new WeakMap(), bn = new WeakMap(), Zn = new WeakMap(), de = new WeakMap(), Ut = new WeakMap(), et = new WeakMap(), tt = new WeakMap(), wn = new WeakMap(), ne = new WeakSet(), _i = function() {
  return this.is_fork || f(this, bn) > 0;
}, gi = function() {
  var o, l;
  if (ga++ > 1e3 && (Pt.delete(this), Bl()), !F(this, ne, _i).call(this)) {
    for (const c of f(this, Ut))
      f(this, et).delete(c), z(c, te), this.schedule(c);
    for (const c of f(this, et))
      z(c, We), this.schedule(c);
  }
  const e = f(this, de);
  x(this, de, []), this.apply();
  var n = fn = [], r = [], i = gr = [];
  for (const c of e)
    try {
      F(this, ne, mi).call(this, c, n, r);
    } catch (u) {
      throw $s(c), u;
    }
  if (P = null, i.length > 0) {
    var a = Pr.ensure();
    for (const c of i)
      a.schedule(c);
  }
  if (fn = null, gr = null, F(this, ne, _i).call(this)) {
    F(this, ne, yi).call(this, r), F(this, ne, yi).call(this, n);
    for (const [c, u] of f(this, tt))
      Es(c, u);
  } else {
    f(this, yn) === 0 && Pt.delete(this), f(this, Ut).clear(), f(this, et).clear();
    for (const c of f(this, gn)) c(this);
    f(this, gn).clear(), ma(r), ma(n), (o = f(this, Zn)) == null || o.resolve();
  }
  var s = (
    /** @type {Batch | null} */
    /** @type {unknown} */
    P
  );
  if (f(this, de).length > 0) {
    const c = s ?? (s = this);
    f(c, de).push(...f(this, de).filter((u) => !f(c, de).includes(u)));
  }
  s !== null && (Pt.add(s), F(l = s, ne, gi).call(l)), Pt.has(this) || F(this, ne, ys).call(this);
}, /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
mi = function(e, n, r) {
  e.f ^= V;
  for (var i = e.first; i !== null; ) {
    var a = i.f, s = (a & (Fe | Ot)) !== 0, o = s && (a & V) !== 0, l = o || (a & ve) !== 0 || f(this, tt).has(i);
    if (!l && i.fn !== null) {
      s ? i.f ^= V : (a & An) !== 0 ? n.push(i) : sr(i) && ((a & Ct) !== 0 && f(this, et).add(i), Nn(i));
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
yi = function(e) {
  for (var n = 0; n < e.length; n += 1)
    ms(e[n], f(this, Ut), f(this, et));
}, ys = function() {
  var l;
  for (const c of Pt) {
    var e = c.id < this.id, n = [];
    for (const [u, p] of this.current) {
      if (c.current.has(u))
        if (e && p !== c.current.get(u))
          c.current.set(u, p);
        else
          continue;
      n.push(u);
    }
    var r = [...c.current.keys()].filter((u) => !this.current.has(u));
    if (r.length === 0)
      e && c.discard();
    else if (n.length > 0) {
      c.activate();
      var i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
      for (var s of n)
        bs(s, r, i, a);
      if (f(c, de).length > 0) {
        c.apply();
        for (var o of f(c, de))
          F(l = c, ne, mi).call(l, o, [], []);
        x(c, de, []);
      }
      c.deactivate();
    }
  }
};
let St = Pr;
function be(t) {
  var e = Un;
  Un = !0;
  try {
    for (var n; ; ) {
      if (Gl(), P === null)
        return (
          /** @type {T} */
          n
        );
      P.flush();
    }
  } finally {
    Un = e;
  }
}
function Bl() {
  try {
    Il();
  } catch (t) {
    yt(t, vi);
  }
}
let Re = null;
function ma(t) {
  var e = t.length;
  if (e !== 0) {
    for (var n = 0; n < e; ) {
      var r = t[n++];
      if ((r.f & (Ae | ve)) === 0 && sr(r) && (Re = /* @__PURE__ */ new Set(), Nn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Us(r), (Re == null ? void 0 : Re.size) > 0)) {
        Et.clear();
        for (const i of Re) {
          if ((i.f & (Ae | ve)) !== 0) continue;
          const a = [i];
          let s = i.parent;
          for (; s !== null; )
            Re.has(s) && (Re.delete(s), a.push(s)), s = s.parent;
          for (let o = a.length - 1; o >= 0; o--) {
            const l = a[o];
            (l.f & (Ae | ve)) === 0 && Nn(l);
          }
        }
        Re.clear();
      }
    }
    Re = null;
  }
}
function bs(t, e, n, r) {
  if (!n.has(t) && (n.add(t), t.reactions !== null))
    for (const i of t.reactions) {
      const a = i.f;
      (a & W) !== 0 ? bs(
        /** @type {Derived} */
        i,
        e,
        n,
        r
      ) : (a & (ki | Ct)) !== 0 && (a & te) === 0 && ws(i, e, r) && (z(i, te), Hi(
        /** @type {Effect} */
        i
      ));
    }
}
function ws(t, e, n) {
  const r = n.get(t);
  if (r !== void 0) return r;
  if (t.deps !== null)
    for (const i of t.deps) {
      if ($n.call(e, i))
        return !0;
      if ((i.f & W) !== 0 && ws(
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
function Hi(t) {
  P.schedule(t);
}
function Es(t, e) {
  if (!((t.f & Fe) !== 0 && (t.f & V) !== 0)) {
    (t.f & te) !== 0 ? e.d.push(t) : (t.f & We) !== 0 && e.m.push(t), z(t, V);
    for (var n = t.first; n !== null; )
      Es(n, e), n = n.next;
  }
}
function $s(t) {
  z(t, V);
  for (var e = t.first; e !== null; )
    $s(e), e = e.next;
}
function Vl(t) {
  let e = 0, n = Qt(0), r;
  return () => {
    qi() && (h(n), Gi(() => (e === 0 && (r = Pe(() => t(() => zn(n)))), e += 1, () => {
      vn(() => {
        e -= 1, e === 0 && (r == null || r(), r = void 0, zn(n));
      });
    })));
  };
}
var Wl = On | tn;
function Yl(t, e, n, r) {
  new Jl(t, e, n, r);
}
var fe, er, Ue, zt, ae, ze, he, Le, nt, Bt, mt, En, tr, nr, rt, Dr, G, As, Os, Ss, bi, mr, yr, wi;
class Jl {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(e, n, r, i) {
    C(this, G);
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
    C(this, fe);
    /** @type {TemplateNode | null} */
    C(this, er, k ? R : null);
    /** @type {BoundaryProps} */
    C(this, Ue);
    /** @type {((anchor: Node) => void)} */
    C(this, zt);
    /** @type {Effect} */
    C(this, ae);
    /** @type {Effect | null} */
    C(this, ze, null);
    /** @type {Effect | null} */
    C(this, he, null);
    /** @type {Effect | null} */
    C(this, Le, null);
    /** @type {DocumentFragment | null} */
    C(this, nt, null);
    C(this, Bt, 0);
    C(this, mt, 0);
    C(this, En, !1);
    /** @type {Set<Effect>} */
    C(this, tr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    C(this, nr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    C(this, rt, null);
    C(this, Dr, Vl(() => (x(this, rt, Qt(f(this, Bt))), () => {
      x(this, rt, null);
    })));
    var a;
    x(this, fe, e), x(this, Ue, n), x(this, zt, (s) => {
      var o = (
        /** @type {Effect} */
        I
      );
      o.b = this, o.f |= fi, r(s);
    }), this.parent = /** @type {Effect} */
    I.b, this.transform_error = i ?? ((a = this.parent) == null ? void 0 : a.transform_error) ?? ((s) => s), x(this, ae, Ui(() => {
      if (k) {
        const s = (
          /** @type {Comment} */
          f(this, er)
        );
        Sn();
        const o = s.data === Ii;
        if (s.data.startsWith(pa)) {
          const c = JSON.parse(s.data.slice(pa.length));
          F(this, G, Os).call(this, c);
        } else o ? F(this, G, Ss).call(this) : F(this, G, As).call(this);
      } else
        F(this, G, bi).call(this);
    }, Wl)), k && x(this, fe, R);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    ms(e, f(this, tr), f(this, nr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!f(this, Ue).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(e, n) {
    F(this, G, wi).call(this, e, n), x(this, Bt, f(this, Bt) + e), !(!f(this, rt) || f(this, En)) && (x(this, En, !0), vn(() => {
      x(this, En, !1), f(this, rt) && Tn(f(this, rt), f(this, Bt));
    }));
  }
  get_effect_pending() {
    return f(this, Dr).call(this), h(
      /** @type {Source<number>} */
      f(this, rt)
    );
  }
  /** @param {unknown} error */
  error(e) {
    var n = f(this, Ue).onerror;
    let r = f(this, Ue).failed;
    if (!n && !r)
      throw e;
    f(this, ze) && (ie(f(this, ze)), x(this, ze, null)), f(this, he) && (ie(f(this, he)), x(this, he, null)), f(this, Le) && (ie(f(this, Le)), x(this, Le, null)), k && (ee(
      /** @type {TemplateNode} */
      f(this, er)
    ), jl(), ee(Tr()));
    var i = !1, a = !1;
    const s = () => {
      if (i) {
        Hl();
        return;
      }
      i = !0, a && Ml(), f(this, Le) !== null && Wt(f(this, Le), () => {
        x(this, Le, null);
      }), F(this, G, yr).call(this, () => {
        F(this, G, bi).call(this);
      });
    }, o = (l) => {
      try {
        a = !0, n == null || n(l, s), a = !1;
      } catch (c) {
        yt(c, f(this, ae) && f(this, ae).parent);
      }
      r && x(this, Le, F(this, G, yr).call(this, () => {
        try {
          return we(() => {
            var c = (
              /** @type {Effect} */
              I
            );
            c.b = this, c.f |= fi, r(
              f(this, fe),
              () => l,
              () => s
            );
          });
        } catch (c) {
          return yt(
            c,
            /** @type {Effect} */
            f(this, ae).parent
          ), null;
        }
      }));
    };
    vn(() => {
      var l;
      try {
        l = this.transform_error(e);
      } catch (c) {
        yt(c, f(this, ae) && f(this, ae).parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        o,
        /** @param {unknown} e */
        (c) => yt(c, f(this, ae) && f(this, ae).parent)
      ) : o(l);
    });
  }
}
fe = new WeakMap(), er = new WeakMap(), Ue = new WeakMap(), zt = new WeakMap(), ae = new WeakMap(), ze = new WeakMap(), he = new WeakMap(), Le = new WeakMap(), nt = new WeakMap(), Bt = new WeakMap(), mt = new WeakMap(), En = new WeakMap(), tr = new WeakMap(), nr = new WeakMap(), rt = new WeakMap(), Dr = new WeakMap(), G = new WeakSet(), As = function() {
  try {
    x(this, ze, we(() => f(this, zt).call(this, f(this, fe))));
  } catch (e) {
    this.error(e);
  }
}, /**
 * @param {unknown} error The deserialized error from the server's hydration comment
 */
Os = function(e) {
  const n = f(this, Ue).failed;
  n && x(this, Le, we(() => {
    n(
      f(this, fe),
      () => e,
      () => () => {
      }
    );
  }));
}, Ss = function() {
  const e = f(this, Ue).pending;
  e && (this.is_pending = !0, x(this, he, we(() => e(f(this, fe)))), vn(() => {
    var n = x(this, nt, document.createDocumentFragment()), r = Oe();
    n.append(r), x(this, ze, F(this, G, yr).call(this, () => we(() => f(this, zt).call(this, r)))), f(this, mt) === 0 && (f(this, fe).before(n), x(this, nt, null), Wt(
      /** @type {Effect} */
      f(this, he),
      () => {
        x(this, he, null);
      }
    ), F(this, G, mr).call(
      this,
      /** @type {Batch} */
      P
    ));
  }));
}, bi = function() {
  try {
    if (this.is_pending = this.has_pending_snippet(), x(this, mt, 0), x(this, Bt, 0), x(this, ze, we(() => {
      f(this, zt).call(this, f(this, fe));
    })), f(this, mt) > 0) {
      var e = x(this, nt, document.createDocumentFragment());
      Vi(f(this, ze), e);
      const n = (
        /** @type {(anchor: Node) => void} */
        f(this, Ue).pending
      );
      x(this, he, we(() => n(f(this, fe))));
    } else
      F(this, G, mr).call(
        this,
        /** @type {Batch} */
        P
      );
  } catch (n) {
    this.error(n);
  }
}, /**
 * @param {Batch} batch
 */
mr = function(e) {
  this.is_pending = !1, e.transfer_effects(f(this, tr), f(this, nr));
}, /**
 * @template T
 * @param {() => T} fn
 */
yr = function(e) {
  var n = I, r = N, i = oe;
  xe(f(this, ae)), le(f(this, ae)), xn(f(this, ae).ctx);
  try {
    return St.ensure(), e();
  } catch (a) {
    return _s(a), null;
  } finally {
    xe(n), le(r), xn(i);
  }
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 * @param {Batch} batch
 */
wi = function(e, n) {
  var r;
  if (!this.has_pending_snippet()) {
    this.parent && F(r = this.parent, G, wi).call(r, e, n);
    return;
  }
  x(this, mt, f(this, mt) + e), f(this, mt) === 0 && (F(this, G, mr).call(this, n), f(this, he) && Wt(f(this, he), () => {
    x(this, he, null);
  }), f(this, nt) && (f(this, fe).before(f(this, nt)), x(this, nt, null)));
};
function Kl(t, e, n, r) {
  const i = qr;
  var a = t.filter((m) => !m.settled);
  if (n.length === 0 && a.length === 0) {
    r(e.map(i));
    return;
  }
  var s = (
    /** @type {Effect} */
    I
  ), o = Xl(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((m) => m.promise)) : null;
  function c(m) {
    o();
    try {
      r(m);
    } catch (w) {
      (s.f & Ae) === 0 && yt(w, s);
    }
    Nr();
  }
  if (n.length === 0) {
    l.then(() => c(e.map(i)));
    return;
  }
  var u = xs();
  function p() {
    Promise.all(n.map((m) => /* @__PURE__ */ Ql(m))).then((m) => c([...e.map(i), ...m])).catch((m) => yt(m, s)).finally(() => u());
  }
  l ? l.then(() => {
    o(), p(), Nr();
  }) : p();
}
function Xl() {
  var t = (
    /** @type {Effect} */
    I
  ), e = N, n = oe, r = (
    /** @type {Batch} */
    P
  );
  return function(a = !0) {
    xe(t), le(e), xn(n), a && (t.f & Ae) === 0 && (r == null || r.activate(), r == null || r.apply());
  };
}
function Nr(t = !0) {
  xe(null), le(null), xn(null), t && (P == null || P.deactivate());
}
function xs() {
  var t = (
    /** @type {Boundary} */
    /** @type {Effect} */
    I.b
  ), e = (
    /** @type {Batch} */
    P
  ), n = t.is_rendered();
  return t.update_pending_count(1, e), e.increment(n), (r = !1) => {
    t.update_pending_count(-1, e), e.decrement(n, r);
  };
}
// @__NO_SIDE_EFFECTS__
function qr(t) {
  var e = W | te, n = N !== null && (N.f & W) !== 0 ? (
    /** @type {Derived} */
    N
  ) : null;
  return I !== null && (I.f |= tn), {
    ctx: oe,
    deps: null,
    effects: null,
    equals: fs,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      X
    ),
    wv: 0,
    parent: n ?? I,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Ql(t, e, n) {
  let r = (
    /** @type {Effect | null} */
    I
  );
  r === null && xl();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Qt(
    /** @type {V} */
    X
  ), s = !N, o = /* @__PURE__ */ new Map();
  return cc(() => {
    var w;
    var l = (
      /** @type {Effect} */
      I
    ), c = cs();
    i = c.promise;
    try {
      Promise.resolve(t()).then(c.resolve, c.reject).finally(Nr);
    } catch (_) {
      c.reject(_), Nr();
    }
    var u = (
      /** @type {Batch} */
      P
    );
    if (s) {
      if ((l.f & Rt) !== 0)
        var p = xs();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        (w = o.get(u)) == null || w.reject(Ze), o.delete(u);
      else {
        for (const _ of o.values())
          _.reject(Ze);
        o.clear();
      }
      o.set(u, c);
    }
    const m = (_, $ = void 0) => {
      if (p) {
        var d = $ === Ze;
        p(d);
      }
      if (!($ === Ze || (l.f & Ae) !== 0)) {
        if (u.activate(), $)
          a.f |= wt, Tn(a, $);
        else {
          (a.f & wt) !== 0 && (a.f ^= wt), Tn(a, _);
          for (const [v, g] of o) {
            if (o.delete(v), v === u) break;
            g.reject(Ze);
          }
        }
        u.deactivate();
      }
    };
    c.promise.then(m, (_) => m(null, _ || "unknown"));
  }), sc(() => {
    for (const l of o.values())
      l.reject(Ze);
  }), new Promise((l) => {
    function c(u) {
      function p() {
        u === i ? l(a) : c(i);
      }
      u.then(p, p);
    }
    c(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Mn(t) {
  const e = /* @__PURE__ */ qr(t);
  return Vs(e), e;
}
// @__NO_SIDE_EFFECTS__
function Zl(t) {
  const e = /* @__PURE__ */ qr(t);
  return e.equals = hs, e;
}
function ec(t) {
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
function tc(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & W) === 0)
      return (e.f & Ae) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function ji(t) {
  var e, n = I;
  xe(tc(t));
  try {
    t.f &= ~Xt, ec(t), e = Ks(t);
  } finally {
    xe(n);
  }
  return e;
}
function Ts(t) {
  var e = t.v, n = ji(t);
  if (!t.equals(n) && (t.wv = Ys(), (!(P != null && P.is_fork) || t.deps === null) && (t.v = n, P == null || P.capture(t, e), t.deps === null))) {
    z(t, V);
    return;
  }
  xt || (Q !== null ? (qi() || P != null && P.is_fork) && Q.set(t, n) : Mi(t));
}
function nc(t) {
  var e, n;
  if (t.effects !== null)
    for (const r of t.effects)
      (r.teardown || r.ac) && ((e = r.teardown) == null || e.call(r), (n = r.ac) == null || n.abort(Ze), r.teardown = yl, r.ac = null, Jn(r, 0), zi(r));
}
function Ns(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && Nn(e);
}
let Ei = /* @__PURE__ */ new Set();
const Et = /* @__PURE__ */ new Map();
let Cs = !1;
function Qt(t, e) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: fs,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function M(t, e) {
  const n = Qt(t);
  return Vs(n), n;
}
// @__NO_SIDE_EFFECTS__
function Rs(t, e = !1, n = !0) {
  const r = Qt(t);
  return e || (r.equals = hs), r;
}
function O(t, e, n = !1) {
  N !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!je || (N.f & _a) !== 0) && ps() && (N.f & (W | Ct | ki | _a)) !== 0 && (Se === null || !$n.call(Se, t)) && Dl();
  let r = n ? Ve(e) : e;
  return Tn(t, r, gr);
}
function Tn(t, e, n = null) {
  if (!t.equals(e)) {
    var r = t.v;
    xt ? Et.set(t, e) : Et.set(t, r), t.v = e;
    var i = St.ensure();
    if (i.capture(t, r), (t.f & W) !== 0) {
      const a = (
        /** @type {Derived} */
        t
      );
      (t.f & te) !== 0 && ji(a), Q === null && Mi(a);
    }
    t.wv = Ys(), Is(t, te, n), I !== null && (I.f & V) !== 0 && (I.f & (Fe | Ot)) === 0 && (ge === null ? dc([t]) : ge.push(t)), !i.is_fork && Ei.size > 0 && !Cs && rc();
  }
  return e;
}
function rc() {
  Cs = !1;
  for (const t of Ei)
    (t.f & V) !== 0 && z(t, We), sr(t) && Nn(t);
  Ei.clear();
}
function zn(t) {
  O(t, t.v + 1);
}
function Is(t, e, n) {
  var r = t.reactions;
  if (r !== null)
    for (var i = r.length, a = 0; a < i; a++) {
      var s = r[a], o = s.f, l = (o & te) === 0;
      if (l && z(s, e), (o & W) !== 0) {
        var c = (
          /** @type {Derived} */
          s
        );
        Q == null || Q.delete(c), (o & Xt) === 0 && (o & $e && (s.f |= Xt), Is(c, We, n));
      } else if (l) {
        var u = (
          /** @type {Effect} */
          s
        );
        (o & Ct) !== 0 && Re !== null && Re.add(u), n !== null ? n.push(u) : Hi(u);
      }
    }
}
function Ve(t) {
  if (typeof t != "object" || t === null || _r in t)
    return t;
  const e = ls(t);
  if (e !== gl && e !== ml)
    return t;
  var n = /* @__PURE__ */ new Map(), r = os(t), i = /* @__PURE__ */ M(0), a = Yt, s = (o) => {
    if (Yt === a)
      return o();
    var l = N, c = Yt;
    le(null), Ea(a);
    var u = o();
    return le(l), Ea(c), u;
  };
  return r && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(o, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && kl();
        var u = n.get(l);
        return u === void 0 ? s(() => {
          var p = /* @__PURE__ */ M(c.value);
          return n.set(l, p), p;
        }) : O(u, c.value, !0), !0;
      },
      deleteProperty(o, l) {
        var c = n.get(l);
        if (c === void 0) {
          if (l in o) {
            const u = s(() => /* @__PURE__ */ M(X));
            n.set(l, u), zn(i);
          }
        } else
          O(c, X), zn(i);
        return !0;
      },
      get(o, l, c) {
        var w;
        if (l === _r)
          return t;
        var u = n.get(l), p = l in o;
        if (u === void 0 && (!p || (w = pn(o, l)) != null && w.writable) && (u = s(() => {
          var _ = Ve(p ? o[l] : X), $ = /* @__PURE__ */ M(_);
          return $;
        }), n.set(l, u)), u !== void 0) {
          var m = h(u);
          return m === X ? void 0 : m;
        }
        return Reflect.get(o, l, c);
      },
      getOwnPropertyDescriptor(o, l) {
        var c = Reflect.getOwnPropertyDescriptor(o, l);
        if (c && "value" in c) {
          var u = n.get(l);
          u && (c.value = h(u));
        } else if (c === void 0) {
          var p = n.get(l), m = p == null ? void 0 : p.v;
          if (p !== void 0 && m !== X)
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
        if (l === _r)
          return !0;
        var c = n.get(l), u = c !== void 0 && c.v !== X || Reflect.has(o, l);
        if (c !== void 0 || I !== null && (!u || (m = pn(o, l)) != null && m.writable)) {
          c === void 0 && (c = s(() => {
            var w = u ? Ve(o[l]) : X, _ = /* @__PURE__ */ M(w);
            return _;
          }), n.set(l, c));
          var p = h(c);
          if (p === X)
            return !1;
        }
        return u;
      },
      set(o, l, c, u) {
        var b;
        var p = n.get(l), m = l in o;
        if (r && l === "length")
          for (var w = c; w < /** @type {Source<number>} */
          p.v; w += 1) {
            var _ = n.get(w + "");
            _ !== void 0 ? O(_, X) : w in o && (_ = s(() => /* @__PURE__ */ M(X)), n.set(w + "", _));
          }
        if (p === void 0)
          (!m || (b = pn(o, l)) != null && b.writable) && (p = s(() => /* @__PURE__ */ M(void 0)), O(p, Ve(c)), n.set(l, p));
        else {
          m = p.v !== X;
          var $ = s(() => Ve(c));
          O(p, $);
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
          zn(i);
        }
        return !0;
      },
      ownKeys(o) {
        h(i);
        var l = Reflect.ownKeys(o).filter((p) => {
          var m = n.get(p);
          return m === void 0 || m.v !== X;
        });
        for (var [c, u] of n)
          u.v !== X && !(c in o) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        Pl();
      }
    }
  );
}
var ya, Ls, ks, Ps;
function $i() {
  if (ya === void 0) {
    ya = window, Ls = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, n = Text.prototype;
    ks = pn(e, "firstChild").get, Ps = pn(e, "nextSibling").get, va(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), va(n) && (n.__t = void 0);
  }
}
function Oe(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function Ee(t) {
  return (
    /** @type {TemplateNode | null} */
    ks.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function qe(t) {
  return (
    /** @type {TemplateNode | null} */
    Ps.call(t)
  );
}
function ft(t, e) {
  if (!k)
    return /* @__PURE__ */ Ee(t);
  var n = /* @__PURE__ */ Ee(R);
  if (n === null)
    n = R.appendChild(Oe());
  else if (e && n.nodeType !== Fr) {
    var r = Oe();
    return n == null || n.before(r), ee(r), r;
  }
  return e && Fi(
    /** @type {Text} */
    n
  ), ee(n), n;
}
function ba(t, e = !1) {
  if (!k) {
    var n = /* @__PURE__ */ Ee(t);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ qe(n) : n;
  }
  if (e) {
    if ((R == null ? void 0 : R.nodeType) !== Fr) {
      var r = Oe();
      return R == null || R.before(r), ee(r), r;
    }
    Fi(
      /** @type {Text} */
      R
    );
  }
  return R;
}
function Dt(t, e = 1, n = !1) {
  let r = k ? R : t;
  for (var i; e--; )
    i = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ qe(r);
  if (!k)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== Fr) {
      var a = Oe();
      return r === null ? i == null || i.after(a) : r.before(a), ee(a), a;
    }
    Fi(
      /** @type {Text} */
      r
    );
  }
  return ee(r), r;
}
function Ds(t) {
  t.textContent = "";
}
function Ms() {
  return !1;
}
function Gr(t, e, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(e ?? ss, t, void 0)
  );
}
function Fi(t) {
  if (
    /** @type {string} */
    t.nodeValue.length < 65536
  )
    return;
  let e = t.nextSibling;
  for (; e !== null && e.nodeType === Fr; )
    e.remove(), t.nodeValue += /** @type {string} */
    e.nodeValue, e = t.nextSibling;
}
function Hs(t) {
  var e = N, n = I;
  le(null), xe(null);
  try {
    return t();
  } finally {
    le(e), xe(n);
  }
}
function ic(t) {
  I === null && (N === null && Rl(), Cl()), xt && Nl();
}
function ac(t, e) {
  var n = e.last;
  n === null ? e.last = e.first = t : (n.next = t, t.prev = n, e.last = t);
}
function Ye(t, e) {
  var n = I;
  n !== null && (n.f & ve) !== 0 && (t |= ve);
  var r = {
    ctx: oe,
    deps: null,
    nodes: null,
    f: t | te | $e,
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
  }, i = r;
  if ((t & An) !== 0)
    fn !== null ? fn.push(r) : St.ensure().schedule(r);
  else if (e !== null) {
    try {
      Nn(r);
    } catch (s) {
      throw ie(r), s;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & tn) === 0 && (i = i.first, (t & Ct) !== 0 && (t & On) !== 0 && i !== null && (i.f |= On));
  }
  if (i !== null && (i.parent = n, n !== null && ac(i, n), N !== null && (N.f & W) !== 0 && (t & Ot) === 0)) {
    var a = (
      /** @type {Derived} */
      N
    );
    (a.effects ?? (a.effects = [])).push(i);
  }
  return r;
}
function qi() {
  return N !== null && !je;
}
function sc(t) {
  const e = Ye(jr, null);
  return z(e, V), e.teardown = t, e;
}
function _n(t) {
  ic();
  var e = (
    /** @type {Effect} */
    I.f
  ), n = !N && (e & Fe) !== 0 && (e & Rt) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      oe
    );
    (r.e ?? (r.e = [])).push(t);
  } else
    return js(t);
}
function js(t) {
  return Ye(An | El, t);
}
function oc(t) {
  St.ensure();
  const e = Ye(Ot | tn, t);
  return () => {
    ie(e);
  };
}
function lc(t) {
  St.ensure();
  const e = Ye(Ot | tn, t);
  return (n = {}) => new Promise((r) => {
    n.outro ? Wt(e, () => {
      ie(e), r(void 0);
    }) : (ie(e), r(void 0));
  });
}
function Fs(t) {
  return Ye(An, t);
}
function cc(t) {
  return Ye(ki | tn, t);
}
function Gi(t, e = 0) {
  return Ye(jr | e, t);
}
function Xe(t, e = [], n = [], r = []) {
  Kl(r, e, n, (i) => {
    Ye(jr, () => t(...i.map(h)));
  });
}
function Ui(t, e = 0) {
  var n = Ye(Ct | e, t);
  return n;
}
function we(t) {
  return Ye(Fe | tn, t);
}
function qs(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = xt, r = N;
    wa(!0), le(null);
    try {
      e.call(null);
    } finally {
      wa(n), le(r);
    }
  }
}
function zi(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Hs(() => {
      i.abort(Ze);
    });
    var r = n.next;
    (n.f & Ot) !== 0 ? n.parent = null : ie(n, e), n = r;
  }
}
function uc(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    (e.f & Fe) === 0 && ie(e), e = n;
  }
}
function ie(t, e = !0) {
  var n = !1;
  (e || (t.f & wl) !== 0) && t.nodes !== null && t.nodes.end !== null && (Gs(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), n = !0), z(t, hi), zi(t, e && !n), Jn(t, 0);
  var r = t.nodes && t.nodes.t;
  if (r !== null)
    for (const a of r)
      a.stop();
  qs(t), t.f ^= hi, t.f |= Ae;
  var i = t.parent;
  i !== null && i.first !== null && Us(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = null;
}
function Gs(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : /* @__PURE__ */ qe(t);
    t.remove(), t = n;
  }
}
function Us(t) {
  var e = t.parent, n = t.prev, r = t.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), e !== null && (e.first === t && (e.first = r), e.last === t && (e.last = n));
}
function Wt(t, e, n = !0) {
  var r = [];
  zs(t, r, !0);
  var i = () => {
    n && ie(t), e && e();
  }, a = r.length;
  if (a > 0) {
    var s = () => --a || i();
    for (var o of r)
      o.out(s);
  } else
    i();
}
function zs(t, e, n) {
  if ((t.f & ve) === 0) {
    t.f ^= ve;
    var r = t.nodes && t.nodes.t;
    if (r !== null)
      for (const o of r)
        (o.is_global || n) && e.push(o);
    for (var i = t.first; i !== null; ) {
      var a = i.next, s = (i.f & On) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Fe) !== 0 && (t.f & Ct) !== 0;
      zs(i, e, s ? n : !1), i = a;
    }
  }
}
function Bi(t) {
  Bs(t, !0);
}
function Bs(t, e) {
  if ((t.f & ve) !== 0) {
    t.f ^= ve, (t.f & V) === 0 && (z(t, te), St.ensure().schedule(t));
    for (var n = t.first; n !== null; ) {
      var r = n.next, i = (n.f & On) !== 0 || (n.f & Fe) !== 0;
      Bs(n, i ? e : !1), n = r;
    }
    var a = t.nodes && t.nodes.t;
    if (a !== null)
      for (const s of a)
        (s.is_global || e) && s.in();
  }
}
function Vi(t, e) {
  if (t.nodes)
    for (var n = t.nodes.start, r = t.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ qe(n);
      e.append(n), n = i;
    }
}
let br = !1, xt = !1;
function wa(t) {
  xt = t;
}
let N = null, je = !1;
function le(t) {
  N = t;
}
let I = null;
function xe(t) {
  I = t;
}
let Se = null;
function Vs(t) {
  N !== null && (Se === null ? Se = [t] : Se.push(t));
}
let se = null, ue = 0, ge = null;
function dc(t) {
  ge = t;
}
let Ws = 1, Ft = 0, Yt = Ft;
function Ea(t) {
  Yt = t;
}
function Ys() {
  return ++Ws;
}
function sr(t) {
  var e = t.f;
  if ((e & te) !== 0)
    return !0;
  if (e & W && (t.f &= ~Xt), (e & We) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      t.deps
    ), r = n.length, i = 0; i < r; i++) {
      var a = n[i];
      if (sr(
        /** @type {Derived} */
        a
      ) && Ts(
        /** @type {Derived} */
        a
      ), a.wv > t.wv)
        return !0;
    }
    (e & $e) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Q === null && z(t, V);
  }
  return !1;
}
function Js(t, e, n = !0) {
  var r = t.reactions;
  if (r !== null && !(Se !== null && $n.call(Se, t)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i];
      (a.f & W) !== 0 ? Js(
        /** @type {Derived} */
        a,
        e,
        !1
      ) : e === a && (n ? z(a, te) : (a.f & V) !== 0 && z(a, We), Hi(
        /** @type {Effect} */
        a
      ));
    }
}
function Ks(t) {
  var $;
  var e = se, n = ue, r = ge, i = N, a = Se, s = oe, o = je, l = Yt, c = t.f;
  se = /** @type {null | Value[]} */
  null, ue = 0, ge = null, N = (c & (Fe | Ot)) === 0 ? t : null, Se = null, xn(t.ctx), je = !1, Yt = ++Ft, t.ac !== null && (Hs(() => {
    t.ac.abort(Ze);
  }), t.ac = null);
  try {
    t.f |= pi;
    var u = (
      /** @type {Function} */
      t.fn
    ), p = u();
    t.f |= Rt;
    var m = t.deps, w = P == null ? void 0 : P.is_fork;
    if (se !== null) {
      var _;
      if (w || Jn(t, ue), m !== null && ue > 0)
        for (m.length = ue + se.length, _ = 0; _ < se.length; _++)
          m[ue + _] = se[_];
      else
        t.deps = m = se;
      if (qi() && (t.f & $e) !== 0)
        for (_ = ue; _ < m.length; _++)
          (($ = m[_]).reactions ?? ($.reactions = [])).push(t);
    } else !w && m !== null && ue < m.length && (Jn(t, ue), m.length = ue);
    if (ps() && ge !== null && !je && m !== null && (t.f & (W | We | te)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      ge.length; _++)
        Js(
          ge[_],
          /** @type {Effect} */
          t
        );
    if (i !== null && i !== t) {
      if (Ft++, i.deps !== null)
        for (let d = 0; d < n; d += 1)
          i.deps[d].rv = Ft;
      if (e !== null)
        for (const d of e)
          d.rv = Ft;
      ge !== null && (r === null ? r = ge : r.push(.../** @type {Source[]} */
      ge));
    }
    return (t.f & wt) !== 0 && (t.f ^= wt), p;
  } catch (d) {
    return _s(d);
  } finally {
    t.f ^= pi, se = e, ue = n, ge = r, N = i, Se = a, xn(s), je = o, Yt = l;
  }
}
function fc(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var r = vl.call(n, t);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = e.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (e.f & W) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (se === null || !$n.call(se, e))) {
    var a = (
      /** @type {Derived} */
      e
    );
    (a.f & $e) !== 0 && (a.f ^= $e, a.f &= ~Xt), Mi(a), nc(a), Jn(a, 0);
  }
}
function Jn(t, e) {
  var n = t.deps;
  if (n !== null)
    for (var r = e; r < n.length; r++)
      fc(t, n[r]);
}
function Nn(t) {
  var e = t.f;
  if ((e & Ae) === 0) {
    z(t, V);
    var n = I, r = br;
    I = t, br = !0;
    try {
      (e & (Ct | us)) !== 0 ? uc(t) : zi(t), qs(t);
      var i = Ks(t);
      t.teardown = typeof i == "function" ? i : null, t.wv = Ws;
      var a;
      pl && ql && (t.f & te) !== 0 && t.deps;
    } finally {
      br = r, I = n;
    }
  }
}
function h(t) {
  var e = t.f, n = (e & W) !== 0;
  if (N !== null && !je) {
    var r = I !== null && (I.f & Ae) !== 0;
    if (!r && (Se === null || !$n.call(Se, t))) {
      var i = N.deps;
      if ((N.f & pi) !== 0)
        t.rv < Ft && (t.rv = Ft, se === null && i !== null && i[ue] === t ? ue++ : se === null ? se = [t] : se.push(t));
      else {
        (N.deps ?? (N.deps = [])).push(t);
        var a = t.reactions;
        a === null ? t.reactions = [N] : $n.call(a, N) || a.push(N);
      }
    }
  }
  if (xt && Et.has(t))
    return Et.get(t);
  if (n) {
    var s = (
      /** @type {Derived} */
      t
    );
    if (xt) {
      var o = s.v;
      return ((s.f & V) === 0 && s.reactions !== null || Qs(s)) && (o = ji(s)), Et.set(s, o), o;
    }
    var l = (s.f & $e) === 0 && !je && N !== null && (br || (N.f & $e) !== 0), c = (s.f & Rt) === 0;
    sr(s) && (l && (s.f |= $e), Ts(s)), l && !c && (Ns(s), Xs(s));
  }
  if (Q != null && Q.has(t))
    return Q.get(t);
  if ((t.f & wt) !== 0)
    throw t.v;
  return t.v;
}
function Xs(t) {
  if (t.f |= $e, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ?? (e.reactions = [])).push(t), (e.f & W) !== 0 && (e.f & $e) === 0 && (Ns(
        /** @type {Derived} */
        e
      ), Xs(
        /** @type {Derived} */
        e
      ));
}
function Qs(t) {
  if (t.v === X) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (Et.has(e) || (e.f & W) !== 0 && Qs(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Pe(t) {
  var e = je;
  try {
    return je = !0, t();
  } finally {
    je = e;
  }
}
const qt = Symbol("events"), Zs = /* @__PURE__ */ new Set(), Ai = /* @__PURE__ */ new Set();
function Xr(t, e, n) {
  (e[qt] ?? (e[qt] = {}))[t] = n;
}
function hc(t) {
  for (var e = 0; e < t.length; e++)
    Zs.add(t[e]);
  for (var n of Ai)
    n(t);
}
let $a = null;
function Aa(t) {
  var d, v;
  var e = this, n = (
    /** @type {Node} */
    e.ownerDocument
  ), r = t.type, i = ((d = t.composedPath) == null ? void 0 : d.call(t)) || [], a = (
    /** @type {null | Element} */
    i[0] || t.target
  );
  $a = t;
  var s = 0, o = $a === t && t[qt];
  if (o) {
    var l = i.indexOf(o);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t[qt] = e;
      return;
    }
    var c = i.indexOf(e);
    if (c === -1)
      return;
    l <= c && (s = l);
  }
  if (a = /** @type {Element} */
  i[s] || t.target, a !== e) {
    xr(t, "currentTarget", {
      configurable: !0,
      get() {
        return a || n;
      }
    });
    var u = N, p = I;
    le(null), xe(null);
    try {
      for (var m, w = []; a !== null; ) {
        var _ = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var $ = (v = a[qt]) == null ? void 0 : v[r];
          $ != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === a) && $.call(a, t);
        } catch (g) {
          m ? w.push(g) : m = g;
        }
        if (t.cancelBubble || _ === e || _ === null)
          break;
        a = _;
      }
      if (m) {
        for (let g of w)
          queueMicrotask(() => {
            throw g;
          });
        throw m;
      }
    } finally {
      t[qt] = e, delete t.currentTarget, le(u), xe(p);
    }
  }
}
var rs;
const Qr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  ((rs = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : rs.trustedTypes) && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function pc(t) {
  return (
    /** @type {string} */
    (Qr == null ? void 0 : Qr.createHTML(t)) ?? t
  );
}
function vc(t) {
  var e = Gr("template");
  return e.innerHTML = pc(t.replaceAll("<!>", "<!---->")), e.content;
}
function ot(t, e) {
  var n = (
    /** @type {Effect} */
    I
  );
  n.nodes === null && (n.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function lt(t, e) {
  var n = (e & ul) !== 0, r = (e & dl) !== 0, i, a = !t.startsWith("<!>");
  return () => {
    if (k)
      return ot(R, null), R;
    i === void 0 && (i = vc(a ? t : "<!>" + t), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Ee(i)));
    var s = (
      /** @type {TemplateNode} */
      r || Ls ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ee(s)
      ), l = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      ot(o, l);
    } else
      ot(s, s);
    return s;
  };
}
function Oa() {
  if (k)
    return ot(R, null), R;
  var t = document.createDocumentFragment(), e = document.createComment(""), n = Oe();
  return t.append(e, n), ot(e, n), t;
}
function me(t, e) {
  if (k) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      I
    );
    ((n.f & Rt) === 0 || n.nodes.end === null) && (n.nodes.end = R), Sn();
    return;
  }
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
const _c = ["touchstart", "touchmove"];
function gc(t) {
  return _c.includes(t);
}
function mc(t, e) {
  var n = e == null ? "" : typeof e == "object" ? `${e}` : e;
  n !== (t.__t ?? (t.__t = t.nodeValue)) && (t.__t = n, t.nodeValue = `${n}`);
}
function eo(t, e) {
  return to(t, e);
}
function yc(t, e) {
  $i(), e.intro = e.intro ?? !1;
  const n = e.target, r = k, i = R;
  try {
    for (var a = /* @__PURE__ */ Ee(n); a && (a.nodeType !== In || /** @type {Comment} */
    a.data !== as); )
      a = /* @__PURE__ */ qe(a);
    if (!a)
      throw Kt;
    He(!0), ee(
      /** @type {Comment} */
      a
    );
    const s = to(t, { ...e, anchor: a });
    return He(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s instanceof Error && s.message.split(`
`).some((o) => o.startsWith("https://svelte.dev/e/")))
      throw s;
    return s !== Kt && console.warn("Failed to hydrate: ", s), e.recover === !1 && Ll(), $i(), Ds(n), He(!1), eo(t, e);
  } finally {
    He(r), ee(i);
  }
}
const dr = /* @__PURE__ */ new Map();
function to(t, { target: e, anchor: n, props: r = {}, events: i, context: a, intro: s = !0, transformError: o }) {
  $i();
  var l = void 0, c = lc(() => {
    var u = n ?? e.appendChild(Oe());
    Yl(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (w) => {
        Pi({});
        var _ = (
          /** @type {ComponentContext} */
          oe
        );
        if (a && (_.c = a), i && (r.$$events = i), k && ot(
          /** @type {TemplateNode} */
          w,
          null
        ), l = t(w, r) || {}, k && (I.nodes.end = R, R === null || R.nodeType !== In || /** @type {Comment} */
        R.data !== Li))
          throw ar(), Kt;
        Di();
      },
      o
    );
    var p = /* @__PURE__ */ new Set(), m = (w) => {
      for (var _ = 0; _ < w.length; _++) {
        var $ = w[_];
        if (!p.has($)) {
          p.add($);
          var d = gc($);
          for (const b of [e, document]) {
            var v = dr.get(b);
            v === void 0 && (v = /* @__PURE__ */ new Map(), dr.set(b, v));
            var g = v.get($);
            g === void 0 ? (b.addEventListener($, Aa, { passive: d }), v.set($, 1)) : v.set($, g + 1);
          }
        }
      }
    };
    return m(Hr(Zs)), Ai.add(m), () => {
      var d;
      for (var w of p)
        for (const v of [e, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            dr.get(v)
          ), $ = (
            /** @type {number} */
            _.get(w)
          );
          --$ == 0 ? (v.removeEventListener(w, Aa), _.delete(w), _.size === 0 && dr.delete(v)) : _.set(w, $);
        }
      Ai.delete(m), u !== n && ((d = u.parentNode) == null || d.removeChild(u));
    };
  });
  return Oi.set(l, c), l;
}
let Oi = /* @__PURE__ */ new WeakMap();
function bc(t, e) {
  const n = Oi.get(t);
  return n ? (Oi.delete(t), n(e)) : Promise.resolve();
}
var ke, Be, pe, Vt, rr, ir, Mr;
class wc {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, n = !0) {
    /** @type {TemplateNode} */
    j(this, "anchor");
    /** @type {Map<Batch, Key>} */
    C(this, ke, /* @__PURE__ */ new Map());
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
    C(this, Be, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    C(this, pe, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    C(this, Vt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    C(this, rr, !0);
    /**
     * @param {Batch} batch
     */
    C(this, ir, (e) => {
      if (f(this, ke).has(e)) {
        var n = (
          /** @type {Key} */
          f(this, ke).get(e)
        ), r = f(this, Be).get(n);
        if (r)
          Bi(r), f(this, Vt).delete(n);
        else {
          var i = f(this, pe).get(n);
          i && (f(this, Be).set(n, i.effect), f(this, pe).delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
        }
        for (const [a, s] of f(this, ke)) {
          if (f(this, ke).delete(a), a === e)
            break;
          const o = f(this, pe).get(s);
          o && (ie(o.effect), f(this, pe).delete(s));
        }
        for (const [a, s] of f(this, Be)) {
          if (a === n || f(this, Vt).has(a)) continue;
          const o = () => {
            if (Array.from(f(this, ke).values()).includes(a)) {
              var c = document.createDocumentFragment();
              Vi(s, c), c.append(Oe()), f(this, pe).set(a, { effect: s, fragment: c });
            } else
              ie(s);
            f(this, Vt).delete(a), f(this, Be).delete(a);
          };
          f(this, rr) || !r ? (f(this, Vt).add(a), Wt(s, o, !1)) : o();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    C(this, Mr, (e) => {
      f(this, ke).delete(e);
      const n = Array.from(f(this, ke).values());
      for (const [r, i] of f(this, pe))
        n.includes(r) || (ie(i.effect), f(this, pe).delete(r));
    });
    this.anchor = e, x(this, rr, n);
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
    ), i = Ms();
    if (n && !f(this, Be).has(e) && !f(this, pe).has(e))
      if (i) {
        var a = document.createDocumentFragment(), s = Oe();
        a.append(s), f(this, pe).set(e, {
          effect: we(() => n(s)),
          fragment: a
        });
      } else
        f(this, Be).set(
          e,
          we(() => n(this.anchor))
        );
    if (f(this, ke).set(r, e), i) {
      for (const [o, l] of f(this, Be))
        o === e ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [o, l] of f(this, pe))
        o === e ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(f(this, ir)), r.ondiscard(f(this, Mr));
    } else
      k && (this.anchor = R), f(this, ir).call(this, r);
  }
}
ke = new WeakMap(), Be = new WeakMap(), pe = new WeakMap(), Vt = new WeakMap(), rr = new WeakMap(), ir = new WeakMap(), Mr = new WeakMap();
function no(t) {
  oe === null && Sl(), _n(() => {
    const e = Pe(t);
    if (typeof e == "function") return (
      /** @type {() => void} */
      e
    );
  });
}
function ht(t, e, n = !1) {
  var r;
  k && (r = R, Sn());
  var i = new wc(t), a = n ? On : 0;
  function s(o, l) {
    if (k) {
      var c = ds(
        /** @type {TemplateNode} */
        r
      );
      if (o !== parseInt(c.substring(1))) {
        var u = Tr();
        ee(u), i.anchor = u, He(!1), i.ensure(o, l), He(!0);
        return;
      }
    }
    i.ensure(o, l);
  }
  Ui(() => {
    var o = !1;
    e((l, c = 0) => {
      o = !0, s(c, l);
    }), o || s(-1, null);
  }, a);
}
function Ec(t, e, n) {
  for (var r = [], i = e.length, a, s = e.length, o = 0; o < i; o++) {
    let p = e[o];
    Wt(
      p,
      () => {
        if (a) {
          if (a.pending.delete(p), a.done.add(p), a.pending.size === 0) {
            var m = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            Si(t, Hr(a.done)), m.delete(a), m.size === 0 && (t.outrogroups = null);
          }
        } else
          s -= 1;
      },
      !1
    );
  }
  if (s === 0) {
    var l = r.length === 0 && n !== null;
    if (l) {
      var c = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        c.parentNode
      );
      Ds(u), u.append(c), t.items.clear();
    }
    Si(t, e, !l);
  } else
    a = {
      pending: new Set(e),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ?? (t.outrogroups = /* @__PURE__ */ new Set())).add(a);
}
function Si(t, e, n = !0) {
  var r;
  if (t.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const s of t.pending.values())
      for (const o of s)
        r.add(
          /** @type {EachItem} */
          t.items.get(o).e
        );
  }
  for (var i = 0; i < e.length; i++) {
    var a = e[i];
    if (r != null && r.has(a)) {
      a.f |= at;
      const s = document.createDocumentFragment();
      Vi(a, s);
    } else
      ie(e[i], n);
  }
}
var Sa;
function $c(t, e, n, r, i, a = null) {
  var s = t, o = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      t
    );
    s = k ? ee(/* @__PURE__ */ Ee(l)) : l.appendChild(Oe());
  }
  k && Sn();
  var c = null, u = /* @__PURE__ */ Zl(() => {
    var g = n();
    return os(g) ? g : g == null ? [] : Hr(g);
  }), p, m = /* @__PURE__ */ new Map(), w = !0;
  function _(g) {
    (v.effect.f & Ae) === 0 && (v.pending.delete(g), v.fallback = c, Ac(v, p, s, e, r), c !== null && (p.length === 0 ? (c.f & at) === 0 ? Bi(c) : (c.f ^= at, qn(c, null, s)) : Wt(c, () => {
      c = null;
    })));
  }
  function $(g) {
    v.pending.delete(g);
  }
  var d = Ui(() => {
    p = /** @type {V[]} */
    h(u);
    var g = p.length;
    let b = !1;
    if (k) {
      var T = ds(s) === Ii;
      T !== (g === 0) && (s = Tr(), ee(s), He(!1), b = !0);
    }
    for (var S = /* @__PURE__ */ new Set(), L = (
      /** @type {Batch} */
      P
    ), D = Ms(), H = 0; H < g; H += 1) {
      k && R.nodeType === In && /** @type {Comment} */
      R.data === Li && (s = /** @type {Comment} */
      R, b = !0, He(!1));
      var Y = p[H], It = r(Y, H), ce = w ? null : o.get(It);
      ce ? (ce.v && Tn(ce.v, Y), ce.i && Tn(ce.i, H), D && L.unskip_effect(ce.e)) : (ce = Oc(
        o,
        w ? s : Sa ?? (Sa = Oe()),
        Y,
        It,
        H,
        i,
        e,
        n
      ), w || (ce.e.f |= at), o.set(It, ce)), S.add(It);
    }
    if (g === 0 && a && !c && (w ? c = we(() => a(s)) : (c = we(() => a(Sa ?? (Sa = Oe()))), c.f |= at)), g > S.size && Tl(), k && g > 0 && ee(Tr()), !w)
      if (m.set(L, S), D) {
        for (const [ur, an] of o)
          S.has(ur) || L.skip_effect(an.e);
        L.oncommit(_), L.ondiscard($);
      } else
        _(L);
    b && He(!0), h(u);
  }), v = { effect: d, items: o, pending: m, outrogroups: null, fallback: c };
  w = !1, k && (s = R);
}
function Hn(t) {
  for (; t !== null && (t.f & Fe) === 0; )
    t = t.next;
  return t;
}
function Ac(t, e, n, r, i) {
  var H;
  var a = e.length, s = t.items, o = Hn(t.effect.first), l, c = null, u = [], p = [], m, w, _, $;
  for ($ = 0; $ < a; $ += 1) {
    if (m = e[$], w = i(m, $), _ = /** @type {EachItem} */
    s.get(w).e, t.outrogroups !== null)
      for (const Y of t.outrogroups)
        Y.pending.delete(_), Y.done.delete(_);
    if ((_.f & ve) !== 0 && Bi(_), (_.f & at) !== 0)
      if (_.f ^= at, _ === o)
        qn(_, null, n);
      else {
        var d = c ? c.next : o;
        _ === t.effect.last && (t.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ut(t, c, _), ut(t, _, d), qn(_, d, n), c = _, u = [], p = [], o = Hn(c.next);
        continue;
      }
    if (_ !== o) {
      if (l !== void 0 && l.has(_)) {
        if (u.length < p.length) {
          var v = p[0], g;
          c = v.prev;
          var b = u[0], T = u[u.length - 1];
          for (g = 0; g < u.length; g += 1)
            qn(u[g], v, n);
          for (g = 0; g < p.length; g += 1)
            l.delete(p[g]);
          ut(t, b.prev, T.next), ut(t, c, b), ut(t, T, v), o = v, c = T, $ -= 1, u = [], p = [];
        } else
          l.delete(_), qn(_, o, n), ut(t, _.prev, _.next), ut(t, _, c === null ? t.effect.first : c.next), ut(t, c, _), c = _;
        continue;
      }
      for (u = [], p = []; o !== null && o !== _; )
        (l ?? (l = /* @__PURE__ */ new Set())).add(o), p.push(o), o = Hn(o.next);
      if (o === null)
        continue;
    }
    (_.f & at) === 0 && u.push(_), c = _, o = Hn(_.next);
  }
  if (t.outrogroups !== null) {
    for (const Y of t.outrogroups)
      Y.pending.size === 0 && (Si(t, Hr(Y.done)), (H = t.outrogroups) == null || H.delete(Y));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (o !== null || l !== void 0) {
    var S = [];
    if (l !== void 0)
      for (_ of l)
        (_.f & ve) === 0 && S.push(_);
    for (; o !== null; )
      (o.f & ve) === 0 && o !== t.fallback && S.push(o), o = Hn(o.next);
    var L = S.length;
    if (L > 0) {
      var D = a === 0 ? n : null;
      Ec(t, S, D);
    }
  }
}
function Oc(t, e, n, r, i, a, s, o) {
  var l = (s & ol) !== 0 ? (s & cl) === 0 ? /* @__PURE__ */ Rs(n, !1, !1) : Qt(n) : null, c = (s & ll) !== 0 ? Qt(i) : null;
  return {
    v: l,
    i: c,
    e: we(() => (a(e, l ?? n, c ?? i, o), () => {
      t.delete(r);
    }))
  };
}
function qn(t, e, n) {
  if (t.nodes)
    for (var r = t.nodes.start, i = t.nodes.end, a = e && (e.f & at) === 0 ? (
      /** @type {EffectNodes} */
      e.nodes.start
    ) : n; r !== null; ) {
      var s = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ qe(r)
      );
      if (a.before(r), r === i)
        return;
      r = s;
    }
}
function ut(t, e, n) {
  e === null ? t.effect.first = n : e.next = n, n === null ? t.effect.last = e : n.prev = e;
}
function Sc(t, e, n = !1, r = !1, i = !1, a = !1) {
  var s = t, o = "";
  if (n) {
    var l = (
      /** @type {Element} */
      t
    );
    k && (s = ee(/* @__PURE__ */ Ee(l)));
  }
  Xe(() => {
    var c = (
      /** @type {Effect} */
      I
    );
    if (o === (o = e() ?? "")) {
      k && Sn();
      return;
    }
    if (n && !k) {
      c.nodes = null, l.innerHTML = /** @type {string} */
      o, o !== "" && ot(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ee(l),
        /** @type {TemplateNode} */
        l.lastChild
      );
      return;
    }
    if (c.nodes !== null && (Gs(
      c.nodes.start,
      /** @type {TemplateNode} */
      c.nodes.end
    ), c.nodes = null), o !== "") {
      if (k) {
        R.data;
        for (var u = Sn(), p = u; u !== null && (u.nodeType !== In || /** @type {Comment} */
        u.data !== ""); )
          p = u, u = /* @__PURE__ */ qe(u);
        if (u === null)
          throw ar(), Kt;
        ot(R, p), s = ee(u);
        return;
      }
      var m = r ? fl : i ? hl : void 0, w = (
        /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
        Gr(r ? "svg" : i ? "math" : "template", m)
      );
      w.innerHTML = /** @type {any} */
      o;
      var _ = r || i ? w : (
        /** @type {HTMLTemplateElement} */
        w.content
      );
      if (ot(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ee(_),
        /** @type {TemplateNode} */
        _.lastChild
      ), r || i)
        for (; /* @__PURE__ */ Ee(_); )
          s.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ee(_)
          );
      else
        s.before(_);
    }
  });
}
function ro(t, e) {
  Fs(() => {
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
      const i = Gr("style");
      i.id = e.hash, i.textContent = e.code, r.appendChild(i);
    }
  });
}
function xc(t, e, n) {
  var r = t == null ? "" : "" + t;
  return e && (r = r ? r + " " + e : e), r === "" ? null : r;
}
function Tc(t, e) {
  return t == null ? null : String(t);
}
function Ce(t, e, n, r, i, a) {
  var s = t.__className;
  if (k || s !== n || s === void 0) {
    var o = xc(n, r);
    (!k || o !== t.getAttribute("class")) && (o == null ? t.removeAttribute("class") : t.className = o), t.__className = n;
  }
  return a;
}
function pt(t, e, n, r) {
  var i = t.__style;
  if (k || i !== e) {
    var a = Tc(e);
    (!k || a !== t.getAttribute("style")) && (a == null ? t.removeAttribute("style") : t.style.cssText = a), t.__style = e;
  }
  return r;
}
const Nc = Symbol("is custom element"), Cc = Symbol("is html"), Rc = Ol ? "link" : "LINK";
function io(t, e, n, r) {
  var i = Ic(t);
  k && (i[e] = t.getAttribute(e), e === "src" || e === "srcset" || e === "href" && t.nodeName === Rc) || i[e] !== (i[e] = n) && (e === "loading" && (t[Al] = n), n == null ? t.removeAttribute(e) : typeof n != "string" && ao(t).includes(e) ? t[e] = n : t.setAttribute(e, n));
}
function xa(t, e, n) {
  var r = N, i = I;
  let a = k;
  k && He(!1), le(null), xe(null);
  try {
    // `style` should use `set_attribute` rather than the setter
    e !== "style" && // Don't compute setters for custom elements while they aren't registered yet,
    // because during their upgrade/instantiation they might add more setters.
    // Instead, fall back to a simple "an object, then set as property" heuristic.
    (xi.has(t.getAttribute("is") || t.nodeName) || // customElements may not be available in browser extension contexts
    !customElements || customElements.get(t.getAttribute("is") || t.nodeName.toLowerCase()) ? ao(t).includes(e) : n && typeof n == "object") ? t[e] = n : io(t, e, n == null ? n : String(n));
  } finally {
    le(r), xe(i), a && He(!0);
  }
}
function Ic(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ?? (t.__attributes = {
      [Nc]: t.nodeName.includes("-"),
      [Cc]: t.namespaceURI === ss
    })
  );
}
var xi = /* @__PURE__ */ new Map();
function ao(t) {
  var e = t.getAttribute("is") || t.nodeName, n = xi.get(e);
  if (n) return n;
  xi.set(e, n = []);
  for (var r, i = t, a = Element.prototype; a !== i; ) {
    r = _l(i);
    for (var s in r)
      r[s].set && n.push(s);
    i = ls(i);
  }
  return n;
}
function Ta(t, e) {
  return t === e || (t == null ? void 0 : t[_r]) === e;
}
function vt(t = {}, e, n, r) {
  var i = (
    /** @type {ComponentContext} */
    oe.r
  ), a = (
    /** @type {Effect} */
    I
  );
  return Fs(() => {
    var s, o;
    return Gi(() => {
      s = o, o = [], Pe(() => {
        t !== n(...o) && (e(t, ...o), s && Ta(n(...s), t) && e(null, ...s));
      });
    }), () => {
      let l = a;
      for (; l !== i && l.parent !== null && l.parent.f & hi; )
        l = l.parent;
      const c = () => {
        o && Ta(n(...o), t) && e(null, ...o);
      }, u = l.teardown;
      l.teardown = () => {
        c(), u == null || u();
      };
    };
  }), t;
}
function Ie(t, e, n, r) {
  var i = (
    /** @type {V} */
    r
  ), a = !0, s = () => (a && (a = !1, i = /** @type {V} */
  r), i), o;
  o = /** @type {V} */
  t[e], o === void 0 && r !== void 0 && (o = s());
  var l;
  l = () => {
    var m = (
      /** @type {V} */
      t[e]
    );
    return m === void 0 ? s() : (a = !0, m);
  };
  var c = !1, u = /* @__PURE__ */ qr(() => (c = !1, l())), p = (
    /** @type {Effect} */
    I
  );
  return (
    /** @type {() => V} */
    function(m, w) {
      if (arguments.length > 0) {
        const _ = w ? h(u) : m;
        return O(u, _), c = !0, i !== void 0 && (i = _), m;
      }
      return xt && c || (p.f & Ae) !== 0 ? u.v : h(u);
    }
  );
}
function Lc(t) {
  return new kc(t);
}
var it, ye;
class kc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(e) {
    /** @type {any} */
    C(this, it);
    /** @type {Record<string, any>} */
    C(this, ye);
    var a;
    var n = /* @__PURE__ */ new Map(), r = (s, o) => {
      var l = /* @__PURE__ */ Rs(o, !1, !1);
      return n.set(s, l), l;
    };
    const i = new Proxy(
      { ...e.props || {}, $$events: {} },
      {
        get(s, o) {
          return h(n.get(o) ?? r(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === $l ? !0 : (h(n.get(o) ?? r(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, l) {
          return O(n.get(o) ?? r(o, l), l), Reflect.set(s, o, l);
        }
      }
    );
    x(this, ye, (e.hydrate ? yc : eo)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: i,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
      transformError: e.transformError
    })), (!((a = e == null ? void 0 : e.props) != null && a.$$host) || e.sync === !1) && be(), x(this, it, i.$$events);
    for (const s of Object.keys(f(this, ye)))
      s === "$set" || s === "$destroy" || s === "$on" || xr(this, s, {
        get() {
          return f(this, ye)[s];
        },
        /** @param {any} value */
        set(o) {
          f(this, ye)[s] = o;
        },
        enumerable: !0
      });
    f(this, ye).$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, f(this, ye).$destroy = () => {
      bc(f(this, ye));
    };
  }
  /** @param {Record<string, any>} props */
  $set(e) {
    f(this, ye).$set(e);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(e, n) {
    f(this, it)[e] = f(this, it)[e] || [];
    const r = (...i) => n.call(this, ...i);
    return f(this, it)[e].push(r), () => {
      f(this, it)[e] = f(this, it)[e].filter(
        /** @param {any} fn */
        (i) => i !== r
      );
    };
  }
  $destroy() {
    f(this, ye).$destroy();
  }
}
it = new WeakMap(), ye = new WeakMap();
let so;
typeof HTMLElement == "function" && (so = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(e, n, r) {
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
        return (a) => {
          const s = Gr("slot");
          i !== "default" && (s.name = i), me(a, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = Pc(this);
      for (const i of this.$$s)
        i in r && (i === "default" && !this.$$d.children ? (this.$$d.children = e(i), n.default = !0) : n[i] = e(i));
      for (const i of this.attributes) {
        const a = this.$$g_p(i.name);
        a in this.$$d || (this.$$d[a] = wr(a, i.value, this.$$p_d, "toProp"));
      }
      for (const i in this.$$p_d)
        !(i in this.$$d) && this[i] !== void 0 && (this.$$d[i] = this[i], delete this[i]);
      this.$$c = Lc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = oc(() => {
        Gi(() => {
          var i;
          this.$$r = !0;
          for (const a of Sr(this.$$c)) {
            if (!((i = this.$$p_d[a]) != null && i.reflect)) continue;
            this.$$d[a] = this.$$c[a];
            const s = wr(
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
  var a;
  const i = (a = n[t]) == null ? void 0 : a.type;
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
function Pc(t) {
  const e = {};
  return t.childNodes.forEach((n) => {
    e[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), e;
}
function oo(t, e, n, r, i, a) {
  let s = class extends so {
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
    xr(s.prototype, o, {
      get() {
        return this.$$c && o in this.$$c ? this.$$c[o] : this.$$d[o];
      },
      set(l) {
        var p;
        l = wr(o, l, e), this.$$d[o] = l;
        var c = this.$$c;
        if (c) {
          var u = (p = pn(c, o)) == null ? void 0 : p.get;
          u ? c[o] = l : c.$set({ [o]: l });
        }
      }
    });
  }), r.forEach((o) => {
    xr(s.prototype, o, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[o];
      }
    });
  }), a && (s = a(s)), t.element = /** @type {any} */
  s, s;
}
class Wi extends Error {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(e, ...n) {
    super(...n), Error.captureStackTrace && Error.captureStackTrace(this, Wi), this.name = "TimeoutError", this.timeout = e, this.message = `Timed out in ${e} ms.`;
  }
}
const Dc = (t, e) => {
  const n = new Promise((r, i) => {
    setTimeout(() => {
      i(new Wi(t));
    }, t);
  });
  return Promise.race([e, n]);
}, lo = (t) => {
  if (typeof t.getCardSize == "function")
    try {
      return Dc(500, t.getCardSize()).catch(
        () => 1
      );
    } catch {
      return 1;
    }
  return customElements.get(t.localName) ? 1 : customElements.whenDefined(t.localName).then(() => lo(t));
};
var Mc = /* @__PURE__ */ lt('<span class="loading svelte-lv9s7p">Loading...</span>'), Hc = /* @__PURE__ */ lt("<div><!></div>");
const jc = {
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
function Ti(t, e) {
  Pi(e, !0), ro(t, jc);
  const n = Ie(e, "config"), r = Ie(e, "hass"), i = Ie(e, "preview"), a = Ie(e, "marginTop", 7, "0px"), s = Ie(e, "open"), o = Ie(e, "animation", 7, !0), l = Ie(e, "animationState"), c = Ie(e, "clearCardCss", 7, !1);
  let u = null, p = /* @__PURE__ */ M(null), m = /* @__PURE__ */ M(!0), w = /* @__PURE__ */ M(0);
  const _ = Pe(() => JSON.parse(JSON.stringify(n())));
  _n(() => {
    h(p) && (h(p).hass = r());
  }), _n(() => {
    h(p) && i() !== void 0 && (h(p).preview = i());
  }), _n(() => {
    var b;
    h(p) && (_.disabled = !s(), (b = h(p)._element) == null || b.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: s() }, bubbles: !0, composed: !1 })));
  }), no(async () => {
    const b = document.createElement("hui-card");
    b.hass = r(), b.preview = i(), _.disabled = !s(), b.config = _, b.load(), u == null || u.appendChild(b), O(p, b, !0), O(m, !1), h(p).addEventListener(
      "ll-upgrade",
      (T) => {
        var S;
        T.stopPropagation(), (S = h(p)) != null && S._element && r() && (h(p)._element.hass = r());
      },
      { capture: !0 }
    ), c() && (b.style.setProperty("--ha-card-background", "transparent"), b.style.setProperty("--ha-card-box-shadow", "none"), b.style.setProperty("--ha-card-border-color", "transparent"), b.style.setProperty("--ha-card-border-width", "0px"), b.style.setProperty("--ha-card-backdrop-filter", "none")), o() && (O(w, await lo(b) * 56), u && O(w, h(w) + (window.getComputedStyle(u).marginTop ? parseFloat(window.getComputedStyle(u).marginTop) : 0)), new ResizeObserver((S) => {
      for (const L of S)
        if (L.contentBoxSize) {
          const D = Array.isArray(L.contentBoxSize) ? L.contentBoxSize[0] : L.contentBoxSize;
          D.blockSize && (O(w, D.blockSize, !0), h(p) && O(w, h(w) + (window.getComputedStyle(h(p)).marginTop ? parseFloat(window.getComputedStyle(h(p)).marginTop) : 0)));
        } else L.contentRect && (O(w, L.contentRect.height, !0), h(p) && O(w, h(w) + (window.getComputedStyle(h(p)).marginTop ? parseFloat(window.getComputedStyle(h(p)).marginTop) : 0)));
    }).observe(b));
  });
  var $ = {
    get config() {
      return n();
    },
    set config(b) {
      n(b), be();
    },
    get hass() {
      return r();
    },
    set hass(b) {
      r(b), be();
    },
    get preview() {
      return i();
    },
    set preview(b) {
      i(b), be();
    },
    get marginTop() {
      return a();
    },
    set marginTop(b = "0px") {
      a(b), be();
    },
    get open() {
      return s();
    },
    set open(b) {
      s(b), be();
    },
    get animation() {
      return o();
    },
    set animation(b = !0) {
      o(b), be();
    },
    get animationState() {
      return l();
    },
    set animationState(b) {
      l(b), be();
    },
    get clearCardCss() {
      return c();
    },
    set clearCardCss(b = !1) {
      c(b), be();
    }
  }, d = Hc(), v = ft(d);
  {
    var g = (b) => {
      var T = Mc();
      me(b, T);
    };
    ht(v, (b) => {
      h(m) && b(g);
    });
  }
  return Ke(d), vt(d, (b) => u = b, () => u), Xe(() => {
    Ce(d, 1, `outer-container${s() ? " open" : " close"}${o() ? " animation " + l() : ""}`, "svelte-lv9s7p"), pt(d, `--child-card-margin-top: ${(s() ? a() : "0px") ?? ""};${h(w) ? ` --expander-animation-height: -${h(w)}px;` : ""}`);
  }), me(t, d), Di($);
}
customElements.define("expander-sub-card", oo(
  Ti,
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
const Fc = (t, e) => {
  var n;
  (n = t.dispatchEvent) == null || n.call(
    t,
    new CustomEvent(
      "haptic",
      { detail: e, bubbles: !0, composed: !0 }
    )
  );
};
var or = function(t, e, n) {
  var r;
  n === void 0 && (n = {});
  var i = n.retries, a = i === void 0 ? 10 : i, s = n.delay, o = s === void 0 ? 10 : s, l = n.shouldReject, c = l === void 0 || l, u = (r = n.rejectMessage) !== null && r !== void 0 ? r : "Could not get the result after {{ retries }} retries";
  return new Promise(function(p, m) {
    var w = 0, _ = function() {
      var $ = t();
      e($) ? p($) : ++w < a ? setTimeout(_, o) : c ? m(new Error(u.replace(/\{\{\s*retries\s*\}\}/g, "".concat(a)))) : p($);
    };
    _();
  });
}, Cr = function() {
  return Cr = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, Cr.apply(this, arguments);
};
function Zr(t, e, n) {
  if (arguments.length === 2) for (var r, i = 0, a = e.length; i < a; i++) !r && i in e || (r || (r = Array.prototype.slice.call(e, 0, i)), r[i] = e[i]);
  return t.concat(r || Array.prototype.slice.call(e));
}
var Rr, hn, De, _t, ei = "[home-assistant-javascript-templates]", qc = /^([a-z_]+)\.(\w+)$/;
(function(t) {
  t.UNKNOWN = "unknown", t.UNAVAILABLE = "unavailable";
})(Rr || (Rr = {})), function(t) {
  t.AREA_ID = "area_id", t.NAME = "name";
}(hn || (hn = {})), function(t) {
  t.PANEL_URL = "panel_url", t.LANG = "lang";
}(De || (De = {})), function(t) {
  t.LOCATION_CHANGED = "location-changed", t.TRANSLATIONS_UPDATED = "translations-updated", t.POPSTATE = "popstate", t.SUBSCRIBE_EVENTS = "subscribe_events", t.STATE_CHANGE_EVENT = "state_changed";
}(_t || (_t = {}));
var Na = function(t) {
  return t.reduce(function(e, n) {
    var r = n[0], i = n[1];
    return e[r.replace(qc, "$2")] = i, e;
  }, {});
}, dt = function(t) {
  return t.includes(".");
}, Er = "ref", Mt = "value", Ca = "toJSON", Ra = function(t) {
  return "".concat(Er, ".").concat(t);
};
function Gc(t, e, n) {
  var r = function() {
    return Object.entries(t.hass.areas);
  }, i = function() {
    return Object.entries(t.hass.devices);
  }, a = function() {
    return Object.entries(t.hass.entities);
  }, s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), l = function(d, v) {
    n && console.warn("".concat(d, " ").concat(v, " used in a JavaScript template doesn't exist"));
  }, c = function(d) {
    return l("Entity", d);
  }, u = function(d) {
    return l("Domain", d);
  }, p = function(d) {
    var v = new SyntaxError(d);
    if (e) throw v;
    n && console.warn(v);
  }, m = function(d) {
    t.hass.states[d] ? s.add(d) : c(d);
  }, w = function(d) {
    s.add(d);
  }, _ = function(d, v) {
    var g = v.with_unit, b = g !== void 0 && g, T = v.rounded, S = T !== void 0 && T;
    if (d) {
      var L = d.state, D = d.attributes.unit_of_measurement, H = Number(S), Y = S === !1 || isNaN(Number(L)) ? L : new Intl.NumberFormat(t.hass.language, { minimumFractionDigits: H, maximumFractionDigits: H }).format(Number(L));
      return b && D ? "".concat(Y, " ").concat(D) : Y;
    }
  }, $ = function(d) {
    return new Proxy(d, { get: function(v, g) {
      return g === "state_with_unit" ? _(v, { rounded: !0, with_unit: !0 }) : v[g];
    } });
  };
  return { get hass() {
    return t.hass;
  }, states: new Proxy(function(d, v) {
    if (v === void 0 && (v = {}), dt(d)) return m(d), _(t.hass.states[d], v);
    throw SyntaxError("".concat(ei, ": states method cannot be used with a domain, use it as an object instead."));
  }, { get: function(d, v) {
    if (dt(v)) return m(v), $(t.hass.states[v]);
    var g = Object.entries(t.hass.states).filter(function(b) {
      return b[0].startsWith(v);
    });
    return g.length || u(v), new Proxy(Na(g), { get: function(b, T) {
      return m("".concat(v, ".").concat(T)), $(b[T]);
    } });
  } }), state_translated: function(d) {
    if (m(d), t.hass.states[d]) return t.hass.formatEntityState(t.hass.states[d]);
  }, is_state: function(d, v) {
    var g;
    return m(d), Array.isArray(v) ? v.some(function(b) {
      var T;
      return ((T = t.hass.states[d]) === null || T === void 0 ? void 0 : T.state) === b;
    }) : ((g = t.hass.states[d]) === null || g === void 0 ? void 0 : g.state) === v;
  }, state_attr: function(d, v) {
    var g, b;
    return m(d), (b = (g = t.hass.states[d]) === null || g === void 0 ? void 0 : g.attributes) === null || b === void 0 ? void 0 : b[v];
  }, is_state_attr: function(d, v, g) {
    return this.state_attr(d, v) === g;
  }, has_value: function(d) {
    return this.states(d) ? !(this.is_state(d, Rr.UNKNOWN) || this.is_state(d, Rr.UNAVAILABLE)) : (c(d), !1);
  }, entities: new Proxy(function(d) {
    if (d === void 0) return t.hass.entities;
    if (dt(d)) return m(d), t.hass.entities[d];
    var v = a().filter(function(g) {
      return g[0].startsWith(d);
    });
    return v.length || u(d), new Proxy(Na(v), { get: function(g, b) {
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
    if (dt(d)) throw SyntaxError("".concat(ei, ": devices method cannot be used with an entity id, you should use a device id instead."));
    return t.hass.devices[d];
  }, { get: function(d, v) {
    if (dt(v)) throw SyntaxError("".concat(ei, ": devices cannot be accesed using an entity id, you should use a device id instead."));
    return t.hass.devices[v];
  } }), device_attr: function(d, v) {
    var g, b, T;
    if (dt(d)) {
      m(d);
      var S = (g = t.hass.entities[d]) === null || g === void 0 ? void 0 : g.device_id;
      return (b = t.hass.devices[S]) === null || b === void 0 ? void 0 : b[v];
    }
    return (T = t.hass.devices[d]) === null || T === void 0 ? void 0 : T[v];
  }, is_device_attr: function(d, v, g) {
    return this.device_attr(d, v) === g;
  }, device_id: function(d) {
    var v;
    if (dt(d)) return m(d), (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    var g = i().find(function(b) {
      return b[1].name === d;
    });
    return g == null ? void 0 : g[0];
  }, device_name: function(d) {
    var v, g, b;
    if (dt(d)) {
      m(d);
      var T = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
      return (g = t.hass.devices[T]) === null || g === void 0 ? void 0 : g.name;
    }
    return (b = t.hass.devices[d]) === null || b === void 0 ? void 0 : b.name;
  }, areas: function() {
    return r().map(function(d) {
      return d[1].area_id;
    });
  }, area_id: function(d) {
    var v, g;
    if (d in t.hass.devices) return this.device_attr(d, hn.AREA_ID);
    var b = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    if (b) return this.device_attr(b, hn.AREA_ID);
    var T = r().find(function(S) {
      return S[1].name === d;
    });
    return (g = T == null ? void 0 : T[1]) === null || g === void 0 ? void 0 : g.area_id;
  }, area_name: function(d) {
    var v, g, b;
    d in t.hass.devices && (b = this.device_attr(d, hn.AREA_ID));
    var T = (v = t.hass.entities[d]) === null || v === void 0 ? void 0 : v.device_id;
    T && (b = this.device_attr(T, hn.AREA_ID));
    var S = r().find(function(L) {
      var D = L[1];
      return D.area_id === d || D.area_id === b;
    });
    return (g = S == null ? void 0 : S[1]) === null || g === void 0 ? void 0 : g.name;
  }, area_entities: function(d) {
    var v = r().find(function(g) {
      var b = g[1];
      return b.area_id === d || b.name === d;
    });
    return v ? a().filter(function(g) {
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
    return s;
  }, cleanTracked: function() {
    s.clear();
  }, ref: function(d, v, g) {
    var b;
    g === void 0 && (g = void 0);
    var T = Ra(v);
    if (o.has(v)) return o.get(v);
    var S = new Proxy(((b = {})[Mt] = g, b[Ca] = function() {
      return this[Mt];
    }, b), { get: function(L, D, H) {
      if (D === Mt || D === Ca) return w(T), Reflect.get(L, D, H);
      p("".concat(D, " is not a valid ").concat(Er, " property. A ").concat(Er, ' only exposes a "').concat(Mt, '" property'));
    }, set: function(L, D, H) {
      if (D === Mt) {
        var Y = L[Mt];
        return L[Mt] = H, d({ event_type: _t.STATE_CHANGE_EVENT, data: { entity_id: T, old_state: { state: JSON.stringify(Y) }, new_state: { state: JSON.stringify(H) } } }), !0;
      }
      return p('property "'.concat(D, '" cannot be set in a ').concat(Er)), !1;
    } });
    return o.set(v, S), S;
  }, unref: function(d, v) {
    var g = Ra(v);
    o.has(v) ? (o.delete(v), d(g)) : p("".concat(v, " is not a ref or it has been unrefed already"));
  }, refs: function(d, v, g) {
    g === void 0 && (g = {});
    var b = this.ref, T = this.unref, S = new Proxy(g, { get: function(L, D) {
      return b(d, D).value;
    }, set: function(L, D, H) {
      return b(d, D).value = H, !0;
    } });
    return Object.entries(g).forEach(function(L) {
      var D = L[0], H = L[1];
      o.has(D) && T(v, D), b(d, D, H);
    }), S;
  }, cleanRefs: function(d) {
    var v = this;
    Array.from(o.keys()).forEach(function(g) {
      v.unref(d, g);
    });
  }, clientSideProxy: new Proxy({}, { get: function(d, v) {
    switch (Object.values(De).includes(v) && w(v), v) {
      case De.PANEL_URL:
        return window.location.pathname;
      case De.LANG:
        return t.hass.language;
    }
    n && console.warn("clientSideProxy should only be used to access these variables: ".concat(Object.values(De).join(", ")));
  } }) };
}
var Uc = function() {
  function t(e, n) {
    var r = n.throwErrors, i = r !== void 0 && r, a = n.throwWarnings, s = a === void 0 || a, o = n.variables, l = o === void 0 ? {} : o, c = n.refs, u = c === void 0 ? {} : c, p = n.refsVariableName, m = p === void 0 ? "refs" : p, w = n.autoReturn, _ = w === void 0 || w;
    this._throwErrors = i, this._throwWarnings = s, this._variables = l, this._refsVariableName = m, this._autoReturn = _, this._subscriptions = /* @__PURE__ */ new Map(), this._clientSideEntitiesRegExp = new RegExp("(^|[ \\?(+:\\{\\[><,])(".concat(Object.values(De).join("|"), ")($|[ \\?)+:\\}\\]><.,])"), "gm"), this._scopped = Gc(e, i, s), this.refs = u, this._watchForPanelUrlChange(), this._watchForEntitiesChange(), this._watchForLanguageChange();
  }
  return t.prototype._executeRenderingFunctions = function(e) {
    var n = this;
    this._subscriptions.get(e).forEach(function(r, i) {
      r.forEach(function(a, s) {
        n.trackTemplate(i, s, a);
      });
    });
  }, t.prototype._watchForPanelUrlChange = function() {
    var e = this;
    window.addEventListener(_t.LOCATION_CHANGED, function() {
      e._panelUrlWatchCallback();
    }), window.addEventListener(_t.POPSTATE, function() {
      e._panelUrlWatchCallback();
    });
  }, t.prototype._panelUrlWatchCallback = function() {
    this._subscriptions.has(De.PANEL_URL) && this._executeRenderingFunctions(De.PANEL_URL);
  }, t.prototype._watchForEntitiesChange = function() {
    var e = this;
    window.hassConnection.then(function(n) {
      n.conn.subscribeMessage(function(r) {
        return e._entityWatchCallback(r);
      }, { type: _t.SUBSCRIBE_EVENTS, event_type: _t.STATE_CHANGE_EVENT });
    });
  }, t.prototype._watchForLanguageChange = function() {
    var e = this;
    window.addEventListener(_t.TRANSLATIONS_UPDATED, function() {
      e._subscriptions.has(De.LANG) && e._executeRenderingFunctions(De.LANG);
    });
  }, t.prototype._entityWatchCallback = function(e) {
    if (this._subscriptions.size) {
      var n = e.data.entity_id;
      this._subscriptions.has(n) && this._executeRenderingFunctions(n);
    }
  }, t.prototype._storeTracked = function(e, n, r) {
    var i = this;
    this._scopped.tracked.forEach(function(a) {
      var s = [n, r];
      if (i._subscriptions.has(a)) {
        var o = i._subscriptions.get(a);
        if (o.has(e)) {
          var l = o.get(e);
          l.has(n) || l.set.apply(l, s);
        } else o.set(e, new Map([s]));
      } else i._subscriptions.set(a, /* @__PURE__ */ new Map([[e, new Map([s])]]));
    });
  }, t.prototype._untrackTemplate = function(e, n) {
    var r = this;
    this._subscriptions.forEach(function(i, a) {
      if (i.has(e)) {
        var s = i.get(e);
        s.delete(n), s.size === 0 && (i.delete(e), i.size === 0 && r._subscriptions.delete(a));
      }
    });
  }, t.prototype.renderTemplate = function(e, n) {
    n === void 0 && (n = {});
    try {
      var r = n.variables, i = r === void 0 ? {} : r, a = n.refs, s = a === void 0 ? {} : a, o = new Map(Object.entries(Cr(Cr({}, this._variables), i))), l = e.trim().replace(this._clientSideEntitiesRegExp, "$1clientSide.$2$3"), c = l.includes("return") || !this._autoReturn ? l : "return ".concat(l);
      return new (Function.bind.apply(Function, Zr(Zr([void 0, "hass", "states", "state_translated", "is_state", "state_attr", "is_state_attr", "has_value", "entities", "entity_prop", "is_entity_prop", "devices", "device_attr", "is_device_attr", "device_id", "device_name", "areas", "area_id", "area_name", "area_entities", "area_devices", "user_name", "user_is_admin", "user_is_owner", "user_agent", "clientSide", "ref", "unref", this._refsVariableName], Array.from(o.keys()), !1), ["".concat('"use strict";', " ").concat(c)], !1)))().apply(void 0, Zr([this._scopped.hass, this._scopped.states, this._scopped.state_translated.bind(this._scopped), this._scopped.is_state.bind(this._scopped), this._scopped.state_attr.bind(this._scopped), this._scopped.is_state_attr.bind(this._scopped), this._scopped.has_value.bind(this._scopped), this._scopped.entities, this._scopped.entity_prop, this._scopped.is_entity_prop.bind(this._scopped), this._scopped.devices, this._scopped.device_attr.bind(this._scopped), this._scopped.is_device_attr.bind(this._scopped), this._scopped.device_id.bind(this._scopped), this._scopped.device_name.bind(this._scopped), this._scopped.areas.bind(this._scopped), this._scopped.area_id.bind(this._scopped), this._scopped.area_name.bind(this._scopped), this._scopped.area_entities.bind(this._scopped), this._scopped.area_devices.bind(this._scopped), this._scopped.user_name, this._scopped.user_is_admin, this._scopped.user_is_owner, this._scopped.user_agent, this._scopped.clientSideProxy, this._scopped.ref.bind(this._scopped, this._entityWatchCallback.bind(this)), this._scopped.unref.bind(this._scopped, this.cleanTracked.bind(this)), this._scopped.refs(this._entityWatchCallback.bind(this), this.cleanTracked.bind(this), s)], Array.from(o.values()), !1));
    } catch (u) {
      if (this._throwErrors) throw u;
      return void (this._throwWarnings && console.warn(u));
    }
  }, t.prototype.trackTemplate = function(e, n, r) {
    var i = this;
    r === void 0 && (r = {}), this._scopped.cleanTracked();
    var a = this.renderTemplate(e, r);
    return this._storeTracked(e, n, r), n(a), function() {
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
}(), zc = function() {
  function t(e, n) {
    n === void 0 && (n = {}), this._renderer = or(function() {
      return e.hass;
    }, function(r) {
      return !!(r && r.areas && r.devices && r.entities && r.states && r.user);
    }, { retries: 100, delay: 50, rejectMessage: "The provided element doesn't contain a proper or initialised hass object" }).then(function() {
      return new Uc(e, n);
    });
  }
  return t.prototype.getRenderer = function() {
    return this._renderer;
  }, t;
}();
function Bc(t = {}, e = {}) {
  return new zc(
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
function Ia(t, e, n, r = {}) {
  if (!$r(n))
    throw new Error("Not a valid JS template");
  return n = String(n).trim().slice(3, -3), t.then((i) => i.trackTemplate(n, e, { variables: r }));
}
function La(t, e, n) {
  t.then((r) => {
    r.refs[e] = n;
  });
}
function Vc(t, e) {
  t.then((n) => {
    const r = e.detail;
    Object.keys(r).forEach((i) => {
      const a = r[i].property, s = r[i].value, o = `${i}_${a}`;
      n.refs[o] = s;
    });
  });
}
function Wc(t, e) {
  const n = Vc.bind(null, t);
  return document.addEventListener(e, n), () => {
    document.removeEventListener(e, n);
  };
}
var Ir = function() {
  return Ir = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, Ir.apply(this, arguments);
};
function nn(t, e, n, r) {
  return new (n || (n = Promise))(function(i, a) {
    function s(c) {
      try {
        l(r.next(c));
      } catch (u) {
        a(u);
      }
    }
    function o(c) {
      try {
        l(r.throw(c));
      } catch (u) {
        a(u);
      }
    }
    function l(c) {
      var u;
      c.done ? i(c.value) : (u = c.value, u instanceof n ? u : new n(function(p) {
        p(u);
      })).then(s, o);
    }
    l((r = r.apply(t, [])).next());
  });
}
function rn(t, e) {
  var n, r, i, a = { label: 0, sent: function() {
    if (1 & i[0]) throw i[1];
    return i[1];
  }, trys: [], ops: [] }, s = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return s.next = o(0), s.throw = o(1), s.return = o(2), typeof Symbol == "function" && (s[Symbol.iterator] = function() {
    return this;
  }), s;
  function o(l) {
    return function(c) {
      return function(u) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; s && (s = 0, u[0] && (a = 0)), a; ) try {
          if (n = 1, r && (i = 2 & u[0] ? r.return : u[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, u[1])).done) return i;
          switch (r = 0, i && (u = [2 & u[0], i.value]), u[0]) {
            case 0:
            case 1:
              i = u;
              break;
            case 4:
              return a.label++, { value: u[1], done: !1 };
            case 5:
              a.label++, r = u[1], u = [0];
              continue;
            case 7:
              u = a.ops.pop(), a.trys.pop();
              continue;
            default:
              if (i = a.trys, !((i = i.length > 0 && i[i.length - 1]) || u[0] !== 6 && u[0] !== 2)) {
                a = 0;
                continue;
              }
              if (u[0] === 3 && (!i || u[1] > i[0] && u[1] < i[3])) {
                a.label = u[1];
                break;
              }
              if (u[0] === 6 && a.label < i[1]) {
                a.label = i[1], i = u;
                break;
              }
              if (i && a.label < i[2]) {
                a.label = i[2], a.ops.push(u);
                break;
              }
              i[2] && a.ops.pop(), a.trys.pop();
              continue;
          }
          u = e.call(t, a);
        } catch (p) {
          u = [6, p], r = 0;
        } finally {
          n = i = 0;
        }
        if (5 & u[0]) throw u[1];
        return { value: u[0] ? u[1] : void 0, done: !0 };
      }([l, c]);
    };
  }
}
var Zt = "$", co = ":host", Yi = "invalid selector", Tt = 10, Nt = 10, Ji = function(t) {
  var e, n = t[0], r = t[1];
  return (e = n) && (e instanceof Document || e instanceof Element || e instanceof ShadowRoot) && typeof r == "string";
};
function Ki(t, e) {
  return function(n) {
    return n.split(",").map(function(r) {
      return r.trim();
    });
  }(t).map(function(n) {
    var r = function(i) {
      return i.split(Zt).map(function(a) {
        return a.trim();
      });
    }(n);
    return e(r);
  });
}
function uo(t, e) {
  var n = e ? " If you want to select a shadowRoot, use ".concat(e, " instead.") : "";
  return "".concat(t, " cannot be used with a selector ending in a shadowRoot (").concat(Zt, ").").concat(n);
}
function cn(t) {
  return t instanceof Promise ? t : Promise.resolve(t);
}
function fo() {
  return "You can not select a shadowRoot (".concat(Zt, ") of the document.");
}
function ho() {
  return "You can not select a shadowRoot (".concat(Zt, ") of a shadowRoot.");
}
function Xi(t, e) {
  for (var n, r, i = null, a = t.length, s = 0; s < a; s++) {
    if (s === 0) if (t[s].length) i = e.querySelector(t[s]);
    else {
      if (e instanceof Document) throw new SyntaxError(fo());
      if (e instanceof ShadowRoot) throw new SyntaxError(ho());
      i = ((n = e.shadowRoot) === null || n === void 0 ? void 0 : n.querySelector(t[++s])) || null;
    }
    else i = ((r = i.shadowRoot) === null || r === void 0 ? void 0 : r.querySelector("".concat(co, " ").concat(t[s]))) || null;
    if (i === null) return null;
  }
  return i;
}
function Yc(t, e) {
  var n, r = function(s, o, l) {
    for (var c, u = 0, p = o.length; u < p; u++) !c && u in o || (c || (c = Array.prototype.slice.call(o, 0, u)), c[u] = o[u]);
    return s.concat(c || Array.prototype.slice.call(o));
  }([], t), i = r.pop();
  if (!r.length) return e.querySelectorAll(i);
  var a = Xi(r, e);
  return ((n = a == null ? void 0 : a.shadowRoot) === null || n === void 0 ? void 0 : n.querySelectorAll("".concat(co, " ").concat(i))) || null;
}
function Jc(t, e) {
  if (t.length === 1 && !t[0].length) {
    if (e instanceof Document) throw new SyntaxError(fo());
    if (e instanceof ShadowRoot) throw new SyntaxError(ho());
    return e.shadowRoot;
  }
  var n = Xi(t, e);
  return (n == null ? void 0 : n.shadowRoot) || null;
}
function Kc(t, e, n, r) {
  for (var i = Ki(t, function(l) {
    if (!l[l.length - 1].length) throw new SyntaxError(uo(n, r));
    return l;
  }), a = i.length, s = 0; s < a; s++) {
    var o = Xi(i[s], e);
    if (o) return o;
  }
  return null;
}
function Xc(t, e, n) {
  for (var r = Ki(t, function(o) {
    if (!o[o.length - 1].length) throw new SyntaxError(uo(n));
    return o;
  }), i = r.length, a = 0; a < i; a++) {
    var s = Yc(r[a], e);
    if (s != null && s.length) return s;
  }
  return document.querySelectorAll(Yi);
}
function Qc(t, e, n, r) {
  for (var i = Ki(t, function(l) {
    if (l.pop().length) throw new SyntaxError(function(c, u) {
      return "".concat(c, " must be used with a selector ending in a shadowRoot (").concat(Zt, "). If you don't want to select a shadowRoot, use ").concat(u, " instead.");
    }(n, r));
    return l;
  }), a = i.length, s = 0; s < a; s++) {
    var o = Jc(i[s], e);
    if (o) return o;
  }
  return null;
}
function ka(t, e, n, r) {
  return nn(this, void 0, void 0, function() {
    return rn(this, function(i) {
      return [2, or(function() {
        return Kc(t, e, "asyncQuerySelector", "asyncShadowRootQuerySelector");
      }, function(a) {
        return !!a;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function Pa(t, e, n, r) {
  return nn(this, void 0, void 0, function() {
    return rn(this, function(i) {
      return [2, or(function() {
        return Xc(t, e, "asyncQuerySelectorAll");
      }, function(a) {
        return !!a.length;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
function Da(t, e, n, r) {
  return nn(this, void 0, void 0, function() {
    return rn(this, function(i) {
      return [2, or(function() {
        return Qc(t, e, "asyncShadowRootQuerySelector", "asyncQuerySelector");
      }, function(a) {
        return !!a;
      }, { retries: n, delay: r, shouldReject: !1 })];
    });
  });
}
var Ni = function(t, e) {
  var n = t.querySelectorAll(e);
  if (n.length) return n;
  if (t instanceof Element && t.shadowRoot) {
    var r = Ni(t.shadowRoot, e);
    if (r.length) return r;
  }
  for (var i = 0, a = Array.from(t.querySelectorAll("*")); i < a.length; i++) {
    var s = a[i], o = Ni(s, e);
    if (o.length) return o;
  }
  return document.querySelectorAll(Yi);
}, Ma = function(t, e, n, r) {
  return or(function() {
    return Ni(t, e);
  }, function(i) {
    return !!i.length;
  }, { retries: n, delay: r, shouldReject: !1 });
};
function Ha() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return nn(this, void 0, void 0, function() {
    var n, r, i, a, s;
    return rn(this, function(o) {
      switch (o.label) {
        case 0:
          return Ji(t) ? (n = t[0], r = t[1], i = t[2], [4, ka(r, n, (i == null ? void 0 : i.retries) || Tt, (i == null ? void 0 : i.delay) || Nt)]) : [3, 2];
        case 1:
        case 3:
          return [2, o.sent()];
        case 2:
          return a = t[0], s = t[1], [4, ka(a, document, (s == null ? void 0 : s.retries) || Tt, (s == null ? void 0 : s.delay) || Nt)];
      }
    });
  });
}
function ja() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return nn(this, void 0, void 0, function() {
    var n, r, i, a, s;
    return rn(this, function(o) {
      switch (o.label) {
        case 0:
          return Ji(t) ? (n = t[0], r = t[1], i = t[2], [4, Pa(r, n, (i == null ? void 0 : i.retries) || Tt, (i == null ? void 0 : i.delay) || Nt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return a = t[0], s = t[1], [2, Pa(a, document, (s == null ? void 0 : s.retries) || Tt, (s == null ? void 0 : s.delay) || Nt)];
      }
    });
  });
}
function Fa() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  return nn(this, void 0, void 0, function() {
    var n, r, i, a, s;
    return rn(this, function(o) {
      switch (o.label) {
        case 0:
          return Ji(t) ? (n = t[0], r = t[1], i = t[2], [4, Da(r, n, (i == null ? void 0 : i.retries) || Tt, (i == null ? void 0 : i.delay) || Nt)]) : [3, 2];
        case 1:
          return [2, o.sent()];
        case 2:
          return a = t[0], s = t[1], [2, Da(a, document, (s == null ? void 0 : s.retries) || Tt, (s == null ? void 0 : s.delay) || Nt)];
      }
    });
  });
}
var Zc = function() {
  function t(e, n) {
    e instanceof Node || e instanceof Promise ? (this._element = e, this._asyncParams = Ir({ retries: Tt, delay: Nt }, n || {})) : (this._element = document, this._asyncParams = Ir({ retries: Tt, delay: Nt }, e || {}));
  }
  return Object.defineProperty(t.prototype, "element", { get: function() {
    return cn(this._element).then(function(e) {
      return e instanceof NodeList ? e[0] || null : e;
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "$", { get: function() {
    var e = this;
    return new t(cn(this._element).then(function(n) {
      return n instanceof Document || n instanceof ShadowRoot || n === null || n instanceof NodeList && n.length === 0 ? null : n instanceof NodeList ? Fa(n[0], Zt, e._asyncParams) : Fa(n, Zt, e._asyncParams);
    }), this._asyncParams);
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "all", { get: function() {
    return cn(this._element).then(function(e) {
      return e instanceof NodeList ? e : document.querySelectorAll(Yi);
    });
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "asyncParams", { get: function() {
    return this._asyncParams;
  }, enumerable: !1, configurable: !0 }), t.prototype.eq = function(e) {
    return nn(this, void 0, void 0, function() {
      return rn(this, function(n) {
        return [2, cn(this._element).then(function(r) {
          return r instanceof NodeList && r[e] || null;
        })];
      });
    });
  }, t.prototype.query = function(e) {
    var n = this;
    return new t(cn(this._element).then(function(r) {
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? ja(r[0], e, n._asyncParams) : ja(r, e, n._asyncParams);
    }), this._asyncParams);
  }, t.prototype.deepQuery = function(e) {
    var n = this;
    return new t(cn(this._element).then(function(r) {
      return r === null || r instanceof NodeList && r.length === 0 ? null : r instanceof NodeList ? Promise.race(Array.from(r).map(function(i) {
        return Ma(i, e, n._asyncParams.retries, n._asyncParams.delay);
      })) : Ma(r, e, n._asyncParams.retries, n._asyncParams.delay);
    }), this._asyncParams);
  }, t;
}(), Ci = function(t, e) {
  return Ci = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Ci(t, e);
}, st = function() {
  return st = Object.assign || function(t) {
    for (var e, n = 1, r = arguments.length; n < r; n++) for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
    return t;
  }, st.apply(this, arguments);
};
var Me, bt, B, Qe, qa, ti, ni, fr, Ga, ri, hr, ii, ai, si, jn, q, $t = "$", eu = { retries: 100, delay: 50, eventThreshold: 450 };
(function(t) {
  t.HOME_ASSISTANT = "HOME_ASSISTANT", t.HOME_ASSISTANT_MAIN = "HOME_ASSISTANT_MAIN", t.HA_DRAWER = "HA_DRAWER", t.HA_SIDEBAR = "HA_SIDEBAR", t.PARTIAL_PANEL_RESOLVER = "PARTIAL_PANEL_RESOLVER";
})(Me || (Me = {})), function(t) {
  t.HA_PANEL_LOVELACE = "HA_PANEL_LOVELACE", t.HUI_ROOT = "HUI_ROOT", t.HEADER = "HEADER", t.HUI_VIEW = "HUI_VIEW";
}(bt || (bt = {})), function(t) {
  t.HA_MORE_INFO_DIALOG = "HA_MORE_INFO_DIALOG", t.HA_DIALOG = "HA_DIALOG", t.HA_DIALOG_CONTENT = "HA_DIALOG_CONTENT", t.HA_MORE_INFO_DIALOG_INFO = "HA_MORE_INFO_DIALOG_INFO", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK", t.HA_DIALOG_MORE_INFO_SETTINGS = "HA_DIALOG_MORE_INFO_SETTINGS";
}(B || (B = {})), function(t) {
  t.ON_LISTEN = "onListen", t.ON_PANEL_LOAD = "onPanelLoad", t.ON_LOVELACE_PANEL_LOAD = "onLovelacePanelLoad", t.ON_MORE_INFO_DIALOG_OPEN = "onMoreInfoDialogOpen", t.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN = "onHistoryAndLogBookDialogOpen", t.ON_SETTINGS_DIALOG_OPEN = "onSettingsDialogOpen";
}(Qe || (Qe = {})), function(t) {
  t.HOME_ASSISTANT = "home-assistant", t.HOME_ASSISTANT_MAIN = "home-assistant-main", t.HA_DRAWER = "ha-drawer", t.HA_SIDEBAR = "ha-sidebar", t.PARTIAL_PANEL_RESOLVER = "partial-panel-resolver", t.HA_PANEL_LOVELACE = "ha-panel-lovelace", t.HUI_ROOT = "hui-root", t.HEADER = ".header", t.HUI_VIEW = "hui-view", t.HA_MORE_INFO_DIALOG = "ha-more-info-dialog", t.HA_DIALOG = "ha-adaptive-dialog, ha-dialog", t.HA_DIALOG_CONTENT = ".content", t.HA_MORE_INFO_DIALOG_INFO = "ha-more-info-info", t.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK = "ha-more-info-history-and-logbook", t.HA_DIALOG_MORE_INFO_SETTINGS = "ha-more-info-settings";
}(q || (q = {}));
var tu = ((qa = {})[Me.HOME_ASSISTANT] = { selector: q.HOME_ASSISTANT, children: { shadowRoot: { selector: $t, children: (ti = {}, ti[Me.HOME_ASSISTANT_MAIN] = { selector: q.HOME_ASSISTANT_MAIN, children: { shadowRoot: { selector: $t, children: (ni = {}, ni[Me.HA_DRAWER] = { selector: q.HA_DRAWER, children: (fr = {}, fr[Me.HA_SIDEBAR] = { selector: q.HA_SIDEBAR, children: { shadowRoot: { selector: $t } } }, fr[Me.PARTIAL_PANEL_RESOLVER] = { selector: q.PARTIAL_PANEL_RESOLVER }, fr) }, ni) } } }, ti) } } }, qa), nu = ((Ga = {})[bt.HA_PANEL_LOVELACE] = { selector: q.HA_PANEL_LOVELACE, children: { shadowRoot: { selector: $t, children: (ri = {}, ri[bt.HUI_ROOT] = { selector: q.HUI_ROOT, children: { shadowRoot: { selector: $t, children: (hr = {}, hr[bt.HEADER] = { selector: q.HEADER }, hr[bt.HUI_VIEW] = { selector: q.HUI_VIEW }, hr) } } }, ri) } } }, Ga), ru = { shadowRoot: { selector: $t, children: (ii = {}, ii[B.HA_MORE_INFO_DIALOG] = { selector: q.HA_MORE_INFO_DIALOG, children: { shadowRoot: { selector: $t, children: (ai = {}, ai[B.HA_DIALOG] = { selector: q.HA_DIALOG, children: (si = {}, si[B.HA_DIALOG_CONTENT] = { selector: q.HA_DIALOG_CONTENT, children: (jn = {}, jn[B.HA_MORE_INFO_DIALOG_INFO] = { selector: q.HA_MORE_INFO_DIALOG_INFO }, jn[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = { selector: q.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK }, jn[B.HA_DIALOG_MORE_INFO_SETTINGS] = { selector: q.HA_DIALOG_MORE_INFO_SETTINGS }, jn) }, si) }, ai) } } }, ii) } }, Bn = function(t, e, n, r) {
  return n === void 0 && (n = null), r === void 0 && (r = !1), Object.entries(e || {}).reduce(function(i, a) {
    var s = a[0], o = a[1];
    if (o.selector === $t && n) return o.children ? st(st({}, i), Bn(t, o.children, n, !0)) : i;
    var l = n ? n.then(function(c) {
      return c ? Ha(c, (u = o.selector, r ? "$ " + u : u), t) : null;
      var u;
    }) : Ha(o.selector, t);
    return i[s] = { element: l, children: Bn(t, o.children, l), selector: new Zc(l, t) }, i;
  }, {});
}, po = function(t, e) {
  for (var n = 0, r = Object.entries(e); n < r.length; n++) {
    var i = r[n];
    if (i[0] === t) return i[1];
    var a = po(t, i[1].children);
    if (a) return a;
  }
}, oi = function(t, e) {
  return Object.keys(t).reduce(function(n, r) {
    var i = po(r, e);
    i.children;
    var a = function(s, o) {
      var l = {};
      for (var c in s) Object.prototype.hasOwnProperty.call(s, c) && o.indexOf(c) < 0 && (l[c] = s[c]);
      if (s != null && typeof Object.getOwnPropertySymbols == "function") {
        var u = 0;
        for (c = Object.getOwnPropertySymbols(s); u < c.length; u++) o.indexOf(c[u]) < 0 && Object.prototype.propertyIsEnumerable.call(s, c[u]) && (l[c[u]] = s[c[u]]);
      }
      return l;
    }(i, ["children"]);
    return n[r] = st({}, a), n;
  }, {});
}, iu = function() {
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
}(), au = function(t) {
  function e(n) {
    n === void 0 && (n = {});
    var r = t.call(this) || this;
    return r._config = st(st({}, eu), n), r._timestaps = {}, r;
  }
  return function(n, r) {
    if (typeof r != "function" && r !== null) throw new TypeError("Class extends value " + String(r) + " is not a constructor or null");
    function i() {
      this.constructor = n;
    }
    Ci(n, r), n.prototype = r === null ? Object.create(r) : (i.prototype = r.prototype, new i());
  }(e, t), e.prototype._dispatchEvent = function(n, r) {
    var i = Date.now();
    i - this._timestaps[n] < this._config.eventThreshold || (this._timestaps[n] = i, this.dispatchEvent(new CustomEvent(n, { detail: r })));
  }, e.prototype._updateDialogElements = function(n) {
    var r, i = this;
    n === void 0 && (n = B.HA_MORE_INFO_DIALOG_INFO), this._dialogTree = Bn(this._config, ru, this._haRootElements.HOME_ASSISTANT.element);
    var a = oi(B, this._dialogTree);
    a.HA_DIALOG_CONTENT.element.then(function(o) {
      i._dialogsContentObserver.disconnect(), i._dialogsContentObserver.observe(o, { childList: !0 });
    }), this._haDialogElements = function(o, l) {
      return [B.HA_MORE_INFO_DIALOG, B.HA_DIALOG, B.HA_DIALOG_CONTENT, l].reduce(function(c, u) {
        return c[u] = o[u], c;
      }, {});
    }(a, n);
    var s = ((r = {})[B.HA_MORE_INFO_DIALOG_INFO] = Qe.ON_MORE_INFO_DIALOG_OPEN, r[B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = Qe.ON_HISTORY_AND_LOGBOOK_DIALOG_OPEN, r[B.HA_DIALOG_MORE_INFO_SETTINGS] = Qe.ON_SETTINGS_DIALOG_OPEN, r);
    this._dispatchEvent(s[n], this._haDialogElements);
  }, e.prototype._updateRootElements = function() {
    var n = this;
    this._homeAssistantRootTree = Bn(this._config, tu), this._haRootElements = oi(Me, this._homeAssistantRootTree), this._haRootElements[Me.HOME_ASSISTANT].selector.$.element.then(function(r) {
      n._dialogsObserver.disconnect(), n._dialogsObserver.observe(r, { childList: !0 });
    }), this._haRootElements[Me.PARTIAL_PANEL_RESOLVER].element.then(function(r) {
      n._panelResolverObserver.disconnect(), r && n._panelResolverObserver.observe(r, { subtree: !0, childList: !0 });
    }), this._dispatchEvent(Qe.ON_LISTEN, this._haRootElements), this._dispatchEvent(Qe.ON_PANEL_LOAD, this._haRootElements);
  }, e.prototype._updateLovelaceElements = function() {
    var n = this;
    this._homeAssistantResolverTree = Bn(this._config, nu, this._haRootElements[Me.HA_DRAWER].element), this._haResolverElements = oi(bt, this._homeAssistantResolverTree), this._haResolverElements[bt.HA_PANEL_LOVELACE].element.then(function(r) {
      n._lovelaceObserver.disconnect(), r && (n._lovelaceObserver.observe(r.shadowRoot, { childList: !0 }), n._dispatchEvent(Qe.ON_LOVELACE_PANEL_LOAD, st(st({}, n._haRootElements), n._haResolverElements)));
    });
  }, e.prototype._watchDialogs = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(a) {
        a.localName === q.HA_MORE_INFO_DIALOG && r._updateDialogElements();
      });
    });
  }, e.prototype._watchDialogsContent = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(a) {
        var s, o = ((s = {})[q.HA_MORE_INFO_DIALOG_INFO] = B.HA_MORE_INFO_DIALOG_INFO, s[q.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK] = B.HA_DIALOG_MORE_INFO_HISTORY_AND_LOGBOOK, s[q.HA_DIALOG_MORE_INFO_SETTINGS] = B.HA_DIALOG_MORE_INFO_SETTINGS, s);
        if (a.localName && a.localName in o) {
          var l = a.localName;
          r._updateDialogElements(o[l]);
        }
      });
    });
  }, e.prototype._watchDashboards = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(a) {
        r._dispatchEvent(Qe.ON_PANEL_LOAD, r._haRootElements), a.localName === q.HA_PANEL_LOVELACE && r._updateLovelaceElements();
      });
    });
  }, e.prototype._watchLovelace = function(n) {
    var r = this;
    n.forEach(function(i) {
      i.addedNodes.forEach(function(a) {
        a.localName === q.HUI_ROOT && r._updateLovelaceElements();
      });
    });
  }, e.prototype.listen = function() {
    this._watchDialogsBinded = this._watchDialogs.bind(this), this._watchDialogsContentBinded = this._watchDialogsContent.bind(this), this._watchDashboardsBinded = this._watchDashboards.bind(this), this._watchLovelaceBinded = this._watchLovelace.bind(this), this._dialogsObserver = new MutationObserver(this._watchDialogsBinded), this._dialogsContentObserver = new MutationObserver(this._watchDialogsContentBinded), this._panelResolverObserver = new MutationObserver(this._watchDashboardsBinded), this._lovelaceObserver = new MutationObserver(this._watchLovelaceBinded), this._updateRootElements(), this._updateLovelaceElements();
  }, e.prototype.addEventListener = function(n, r, i) {
    t.prototype.addEventListener.call(this, n, r, i);
  }, e;
}(iu);
const vo = new au();
let Ar = {};
vo.addEventListener("onLovelacePanelLoad", ({ detail: t }) => {
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
vo.listen();
const su = () => Ar, Ua = (t) => t ? typeof t == "string" ? t : Object.entries(t).map(([e, n]) => {
  if (!Array.isArray(n))
    return null;
  const r = n.map((i) => {
    if (typeof i == "string")
      return `  ${i};`;
    const [a, s] = Object.entries(i)[0];
    return `  ${a}: ${s};`;
  }).join(`
`);
  return `${e} {
${r}
}`;
}).filter((e) => e !== null).join(`
`) : null, Ri = {
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
var ou = /* @__PURE__ */ lt("<ha-ripple></ha-ripple>", 2), lu = /* @__PURE__ */ lt('<button aria-label="Toggle button"><ha-icon></ha-icon> <!></button>', 2), cu = /* @__PURE__ */ lt("<ha-ripple></ha-ripple>", 2), uu = /* @__PURE__ */ lt('<div id="id1"><div id="id2"><!></div> <!> <!></div>'), du = /* @__PURE__ */ lt("<button><div> </div> <ha-icon></ha-icon> <ha-ripple></ha-ripple></button>", 2), fu = /* @__PURE__ */ lt("<div><div></div></div>"), hu = /* @__PURE__ */ lt("<ha-card><!> <!> <!></ha-card>", 2);
const pu = {
  hash: "svelte-1jqiztq",
  code: `.expander-card.svelte-1jqiztq {display:var(--expander-card-display,block);gap:var(--gap);padding:var(--padding);background:var(--card-background,#fff);-webkit-tap-highlight-color:transparent;}.expander-card.animation.svelte-1jqiztq {transition:gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;}.children-wrapper.svelte-1jqiztq {display:flex;flex-direction:column;}.children-wrapper.animation.opening.svelte-1jqiztq,
    .children-wrapper.animation.closing.svelte-1jqiztq {overflow:hidden;}.children-container.animation.svelte-1jqiztq {transition:padding 0.35s ease, gap 0.35s ease;}.children-container.svelte-1jqiztq {padding:var(--child-padding);display:var(--expander-card-display,block);gap:var(--gap);}.clear.svelte-1jqiztq {background:none !important;background-color:transparent !important;border-style:none !important;box-shadow:none !important;}.title-card-header.svelte-1jqiztq {display:flex;align-items:center;justify-content:space-between;flex-direction:row;position:relative;}.title-card-header.clickable.svelte-1jqiztq {cursor:pointer;border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));}.title-card-header-overlay.svelte-1jqiztq {display:block;}.title-card-container.svelte-1jqiztq {width:100%;padding:var(--title-padding);}.header.svelte-1jqiztq {display:flex;flex-direction:row;align-items:center;padding:0.85em 0.85em;background:var(--button-background);border-style:none;border-radius:var(--ha-card-border-radius, var(--ha-border-radius-lg));width:var(--header-width,auto);color:var(--header-color,#fff);cursor:pointer;position:relative;font-family:var(--ha-font-family-body);font-size:var(--ha-font-size-m);}.header-overlay.svelte-1jqiztq {position:absolute;top:0;right:0;margin:var(--overlay-margin);height:var(--expander-card-overlay-height, auto);z-index:1;}.title-card-header-overlay.clickable.svelte-1jqiztq  > .header-overlay:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);justify-content:flex-end;}.title-card-header-overlay.clickable.svelte-1jqiztq > .title-card-container:where(.svelte-1jqiztq) {width:calc(100% - var(--overlay-margin) * 2);}.title.svelte-1jqiztq {width:100%;text-align:left;}.ico.animation.svelte-1jqiztq {transition-property:transform;transition-duration:0.35s;}.ico.svelte-1jqiztq {color:var(--arrow-color,var(--primary-text-color,#fff));}.flipped.svelte-1jqiztq {transform:rotate(var(--icon-rotate-degree,180deg));}`
};
function vu(t, e) {
  Pi(e, !0), ro(t, pu);
  const n = Ie(e, "hass"), r = Ie(e, "preview"), i = Ie(e, "config", 7, Ri);
  let a = /* @__PURE__ */ M(!1), s = /* @__PURE__ */ M(null), o = /* @__PURE__ */ M(Ve(!!Pe(() => r()))), l = /* @__PURE__ */ M(Ve(!!Pe(() => r()))), c = /* @__PURE__ */ M(Ve(Pe(() => r() || (Vr(i()["show-button-users"]) ?? !0)))), u = /* @__PURE__ */ M("idle"), p = /* @__PURE__ */ M(null), m = /* @__PURE__ */ M(0), w = /* @__PURE__ */ M(0), _ = /* @__PURE__ */ M(null), $ = /* @__PURE__ */ M(null), d = /* @__PURE__ */ M(null), v = /* @__PURE__ */ M(null);
  const g = {}, b = {}, T = {}, S = /* @__PURE__ */ M(Ve({}));
  let L = /* @__PURE__ */ M(Ve(su()));
  const D = /* @__PURE__ */ Mn(() => {
    const y = h(S).style, E = i().style;
    let A = null;
    return y !== void 0 ? A = typeof y == "string" ? y : typeof y == "object" && y !== null ? Ua(y) : String(y) : E && (A = Ua(E)), A ? `<style>${A}</style>` : null;
  }), H = /* @__PURE__ */ Mn(() => h(S).icon !== void 0 ? String(h(S).icon) : i().icon), Y = /* @__PURE__ */ Mn(() => h(S).title !== void 0 ? String(h(S).title) : i().title), It = /* @__PURE__ */ Mn(() => h(S)["arrow-color"] !== void 0 ? String(h(S)["arrow-color"]) : i()["arrow-color"]), ce = Pe(() => i()["storage-id"]), ur = "expander-open-" + ce;
  _n(() => {
    if (h(S).expanded === void 0 || Pe(() => r() && h(L)["preview-expanded"] !== !1))
      return;
    const y = !!h(S).expanded;
    queueMicrotask(() => {
      y !== h(o) && Lt(y);
    });
  }), _n(() => {
    if (!(r() === h(l) || r() === void 0)) {
      if (O(l, r(), !0), h(l) && h(L)["preview-expanded"] !== !1) {
        Ln(!0), O(c, !0);
        return;
      }
      if (O(c, Vr(i()["show-button-users"]) ?? !0, !0), an("expanded")) {
        const y = Pe(() => h(S).expanded);
        y !== void 0 && Lt(!!y);
        return;
      }
      ra();
    }
  });
  function an(y) {
    const E = i().templates && Array.isArray(i().templates) ? i().templates.find((A) => A.template === y) : void 0;
    if (E && $r(E.value_template))
      return E;
  }
  function Br(y) {
    if (!i()["expander-card-id"])
      return;
    const E = {};
    E[i()["expander-card-id"]] = { property: "open", value: y }, document.dispatchEvent(new CustomEvent("expander-card", { detail: E, bubbles: !0, composed: !0 }));
  }
  function Vr(y) {
    var E, A, J, Te;
    if (y !== void 0)
      return ((A = (E = n()) == null ? void 0 : E.user) == null ? void 0 : A.name) !== void 0 && y.includes((Te = (J = n()) == null ? void 0 : J.user) == null ? void 0 : Te.name);
  }
  function ra() {
    if (!an("expanded")) {
      if (Vr(i()["start-expanded-users"])) {
        ct(!0);
        return;
      }
      if (ce === void 0) {
        ia();
        return;
      }
      try {
        const y = localStorage.getItem(ur);
        if (y === null) {
          ia();
          return;
        }
        const E = y ? y === "true" : h(o);
        ct(E);
      } catch (y) {
        console.error(y), ct(!1);
      }
    }
  }
  function ia() {
    if (i().expanded !== void 0) {
      ct(i().expanded);
      return;
    }
    ct(!1);
  }
  function Lt(y) {
    h(p) && (clearTimeout(h(p)), O(p, null));
    const E = y !== void 0 ? y : !h(o);
    if (!i().animation) {
      ct(E);
      return;
    }
    if (Br(E), O(u, E ? "opening" : "closing", !0), E) {
      Ln(!0), O(
        p,
        setTimeout(
          () => {
            O(u, "idle"), O(p, null);
          },
          350
        ),
        !0
      );
      return;
    }
    O(
      p,
      setTimeout(
        () => {
          Ln(!1), O(u, "idle"), O(p, null);
        },
        350
      ),
      !0
    );
  }
  function ct(y) {
    Ln(y), Br(y);
  }
  function Ln(y) {
    if (O(o, y, !0), !r() && ce !== void 0)
      try {
        localStorage.setItem(ur, h(o) ? "true" : "false");
      } catch (E) {
        console.error(E);
      }
    h(o) && h(m) === 0 && O(m, 0.35);
  }
  function aa(y) {
    var A;
    const E = (A = y.detail) == null ? void 0 : A.rawConfig;
    E && JSON.stringify(E) !== JSON.stringify(h(L)) && O(L, E, !0);
  }
  function sa(y) {
    var A, J;
    const E = (J = (A = y.detail) == null ? void 0 : A["expander-card"]) == null ? void 0 : J.data;
    if (E != null && E["expander-card-id"] && E["expander-card-id"] === i()["expander-card-id"]) {
      if (E.action === "open" && !h(o)) {
        Lt(!0);
        return;
      }
      if (E.action === "close" && h(o)) {
        Lt(!1);
        return;
      }
      E.action === "toggle" && Lt();
    }
  }
  function Eo() {
    document.body.removeEventListener("ll-custom", sa), document.body.removeEventListener("expander-card-raw-config-updated", aa), Object.entries(T).forEach(([y, E]) => {
      E.then((A) => {
        A(), delete T[y];
      }).catch(() => {
      });
    }), Object.entries(b).forEach(([y, E]) => {
      E.then((A) => {
        A(), delete b[y];
      }).catch(() => {
      });
    }), Object.entries(g).forEach(([y, E]) => {
      E(), delete g[y];
    });
  }
  const oa = (y) => {
    i().haptic && i().haptic !== "none" && Fc(y, i().haptic);
  };
  let kn, Pn = !1, la = 0, ca = 0;
  const $o = (y) => {
    h(v) && (h(v).disabled = !0), kn = y.target, la = y.touches[0].clientX, ca = y.touches[0].clientY, Pn = !1;
  }, Ao = (y) => {
    const E = y.touches[0].clientX, A = y.touches[0].clientY;
    Pn = Math.abs(E - la) > 10 || Math.abs(A - ca) > 10;
  }, Oo = () => {
    h(v) && (h(v).disabled = !1), kn = void 0, Pn = !1;
  }, So = () => {
    h(v) && (h(v).disabled = !1);
  }, xo = (y) => {
    !Pn && kn === y.target && i()["title-card-clickable"] && (oa(kn), Lt(), O(a, !0), O(
      s,
      window.setTimeout(
        () => {
          O(a, !1), O(s, null);
        },
        100
      ),
      !0
    ), h(v) && (h(v).startPressAnimation(), h(v).endPressAnimation())), kn = void 0, Pn = !1;
  }, To = (y) => {
    for (const E of Object.values(i().variables ?? {}))
      $r(E.value_template) ? b[E.variable] = Ia(
        y,
        (A) => {
          La(y, E.variable, A);
        },
        E.value_template,
        { config: i() }
      ) : La(y, E.variable, E.value_template);
  }, No = (y) => {
    g["expander-card"] = Wc(y, "expander-card");
  }, Co = () => {
    if (!i().templates) return;
    const y = Object.values(i().variables || {}).reduce(
      (A, J) => (A[J.variable] = void 0, A),
      {}
    ), E = Bc({ config: i(), expanderCard: {} }, y);
    To(E), No(E), Object.values(i().templates || {}).forEach((A) => {
      $r(A.value_template) ? T[A.template] = Ia(
        E,
        (J) => {
          h(S)[A.template] = J;
        },
        A.value_template,
        { config: i() }
      ) : h(S)[A.template] = A.value_template;
    });
  };
  function Ro() {
    if (an("expanded"))
      return;
    const y = i()["min-width-expanded"], E = i()["max-width-expanded"], A = document.body.offsetWidth;
    if (y && E) {
      i().expanded = A >= y && A <= E;
      return;
    }
    if (y) {
      i().expanded = A >= y;
      return;
    }
    E && (i().expanded = A <= E);
  }
  function Io() {
    if (r() && h(L)["preview-expanded"] !== !1) {
      Ln(!0);
      return;
    }
    if (an("expanded")) {
      const y = Pe(() => h(S).expanded);
      ct(y !== void 0 ? !!y : !1);
    } else
      ra();
  }
  function Lo() {
    if (i()["title-card-clickable"] && !i()["title-card-button-overlay"] && h($))
      return h($);
    if (h(d))
      return h(d);
  }
  no(() => {
    Co(), Br(!1), Ro(), Io(), document.body.addEventListener("ll-custom", sa), document.body.addEventListener("expander-card-raw-config-updated", aa);
    const y = Lo();
    return y && (y.addEventListener("touchstart", $o, { passive: !0, capture: !0 }), y.addEventListener("touchmove", Ao, { passive: !0, capture: !0 }), y.addEventListener("touchcancel", Oo, { passive: !0, capture: !0 }), y.addEventListener("touchend", So, { passive: !0, capture: !0 }), y.addEventListener("touchend", xo, { passive: !1, capture: !1 })), i()["title-card-clickable"] && i()["title-card-button-overlay"] && h($) && new ResizeObserver(() => {
      if (h(d) && h($) && h(_)) {
        const A = h($).getBoundingClientRect();
        O(w, A.height - parseFloat(getComputedStyle(h(d)).marginTop) - parseFloat(getComputedStyle(h(d)).marginBottom) + parseFloat(getComputedStyle(h(_)).paddingTop) + parseFloat(getComputedStyle(h(_)).paddingBottom));
      }
    }).observe(h($)), Eo;
  });
  const Wr = (y) => {
    if (!h(a)) {
      oa(y.currentTarget), Lt();
      return;
    }
    return y.preventDefault(), y.stopImmediatePropagation(), O(a, !1), h(s) && (clearTimeout(h(s)), O(s, null)), !1;
  };
  var ko = {
    get hass() {
      return n();
    },
    set hass(y) {
      n(y), be();
    },
    get preview() {
      return r();
    },
    set preview(y) {
      r(y), be();
    },
    get config() {
      return i();
    },
    set config(y = Ri) {
      i(y), be();
    }
  }, sn = hu(), ua = ft(sn);
  {
    var Po = (y) => {
      var E = uu(), A = ft(E), J = ft(A);
      Ti(J, {
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
      }), Ke(A);
      var Te = Dt(A, 2);
      {
        var Ne = (Z) => {
          var re = lu(), Ge = ft(re);
          Xe(() => xa(Ge, "icon", h(H)));
          var Fo = Dt(Ge, 2);
          {
            var qo = (kt) => {
              var Dn = ou();
              vt(Dn, (Go) => O(v, Go), () => h(v)), me(kt, Dn);
            };
            ht(Fo, (kt) => {
              (!i()["title-card-clickable"] || i()["title-card-button-overlay"]) && kt(qo);
            });
          }
          Ke(re), vt(re, (kt) => O(d, kt), () => h(d)), Xe(() => {
            pt(re, `--overlay-margin:${i()["overlay-margin"] ?? ""}; --button-background:${i()["button-background"] ?? ""}; --header-color:${i()["header-color"] ?? ""};`), Ce(re, 1, `header ${i()["title-card-button-overlay"] ? " header-overlay" : ""}${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), pt(Ge, `--arrow-color:${h(It) ?? ""}`), Ce(Ge, 1, `ico${h(o) && h(u) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq");
          }), Xr("click", re, function(...kt) {
            var Dn;
            (Dn = !i()["title-card-clickable"] || i()["title-card-button-overlay"] ? Wr : null) == null || Dn.apply(this, kt);
          }), me(Z, re);
        };
        ht(Te, (Z) => {
          h(c) && Z(Ne);
        });
      }
      var on = Dt(Te, 2);
      {
        var Yr = (Z) => {
          var re = cu();
          vt(re, (Ge) => O(v, Ge), () => h(v)), me(Z, re);
        };
        ht(on, (Z) => {
          i()["title-card-clickable"] && !i()["title-card-button-overlay"] && Z(Yr);
        });
      }
      Ke(E), vt(E, (Z) => O($, Z), () => h($)), Xe(() => {
        Ce(E, 1, `title-card-header${i()["title-card-button-overlay"] ? "-overlay" : ""}${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}${i()["title-card-clickable"] ? " clickable" : ""}`, "svelte-1jqiztq"), io(E, "role", i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? "button" : void 0), Ce(A, 1, `title-card-container${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), pt(A, `--title-padding:${(i()["title-card-padding"] ? i()["title-card-padding"] : "0px") ?? ""};`);
      }), Xr("click", E, function(...Z) {
        var re;
        (re = i()["title-card-clickable"] && !i()["title-card-button-overlay"] ? Wr : null) == null || re.apply(this, Z);
      }), me(y, E);
    }, Do = (y) => {
      var E = Oa(), A = ba(E);
      {
        var J = (Te) => {
          var Ne = du(), on = ft(Ne), Yr = ft(on, !0);
          Ke(on);
          var Z = Dt(on, 2);
          Xe(() => xa(Z, "icon", h(H)));
          var re = Dt(Z, 2);
          vt(re, (Ge) => O(v, Ge), () => h(v)), Ke(Ne), vt(Ne, (Ge) => O(d, Ge), () => h(d)), Xe(() => {
            Ce(Ne, 1, `header${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), pt(Ne, `--header-width:100%; --button-background:${i()["button-background"] ?? ""};--header-color:${i()["header-color"] ?? ""};`), Ce(on, 1, `primary title${h(o) ? " open" : " close"}`, "svelte-1jqiztq"), mc(Yr, h(Y)), pt(Z, `--arrow-color:${h(It) ?? ""}`), Ce(Z, 1, `ico${h(o) && h(u) !== "closing" ? " flipped open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq");
          }), Xr("click", Ne, Wr), me(Te, Ne);
        };
        ht(A, (Te) => {
          h(c) && Te(J);
        });
      }
      me(y, E);
    };
    ht(ua, (y) => {
      i()["title-card"] ? y(Po) : y(Do, -1);
    });
  }
  var da = Dt(ua, 2);
  {
    var Mo = (y) => {
      var E = fu(), A = ft(E);
      $c(A, 20, () => i().cards, (J) => J, (J, Te) => {
        {
          let Ne = /* @__PURE__ */ Mn(() => h(o) && r());
          Ti(J, {
            get hass() {
              return n();
            },
            get preview() {
              return h(Ne);
            },
            get config() {
              return Te;
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
      }), Ke(A), Ke(E), Xe(() => {
        Ce(E, 1, `children-wrapper ${i().animation ? "animation " + h(u) : ""}${h(o) ? " open" : " close"}`, "svelte-1jqiztq"), pt(A, `--expander-card-display:${i()["expander-card-display"] ?? ""};
                --gap:${(h(o) && h(u) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""};
                --child-padding:${(h(o) && h(u) !== "closing" ? i()["child-padding"] : "0px") ?? ""};`), Ce(A, 1, `children-container${h(o) ? " open" : " close"}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq");
      }), me(y, E);
    };
    ht(da, (y) => {
      i().cards && y(Mo);
    });
  }
  var Ho = Dt(da, 2);
  {
    var jo = (y) => {
      var E = Oa(), A = ba(E);
      Sc(A, () => h(D)), me(y, E);
    };
    ht(Ho, (y) => {
      h(D) && y(jo);
    });
  }
  return Ke(sn), vt(sn, (y) => O(_, y), () => h(_)), Xe(() => {
    Ce(sn, 1, `expander-card${i().clear ? " clear" : ""}${h(o) ? " open" : " close"} ${h(u)}${i().animation ? " animation " + h(u) : ""}`, "svelte-1jqiztq"), pt(sn, `--expander-card-display:${i()["expander-card-display"] ?? ""};
     --gap:${(h(o) && h(u) !== "closing" ? i()["expanded-gap"] : i().gap) ?? ""}; --padding:${i().padding ?? ""};
     --expander-state:${h(o) ?? ""};
     --icon-rotate-degree:${i()["icon-rotate-degree"] ?? ""};
     --card-background:${(h(o) && h(u) !== "closing" && i()["expander-card-background-expanded"] ? i()["expander-card-background-expanded"] : i()["expander-card-background"]) ?? ""};
     --background-animation-duration:${h(m) ?? ""}s;
     --expander-card-overlay-height:${h(w) ? `${h(w)}px` : "auto"};
    `);
  }), me(t, sn), Di(ko);
}
hc(["click"]);
customElements.define("expander-card", oo(vu, { hass: {}, preview: {}, config: {} }, [], [], { mode: "open" }, (t) => class extends t {
  constructor() {
    super(...arguments);
    // re-declare props used in customClass.
    j(this, "config");
  }
  static async getConfigElement() {
    return await sl(), document.createElement("expander-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:expander-card",
      title: "Expander Card",
      cards: []
    };
  }
  setConfig(n = {}) {
    this.config = { ...Ri, ...n };
  }
}));
const _u = "7.0.3";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Or = globalThis, Qi = Or.ShadowRoot && (Or.ShadyCSS === void 0 || Or.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Zi = Symbol(), za = /* @__PURE__ */ new WeakMap();
let _o = class {
  constructor(e, n, r) {
    if (this._$cssResult$ = !0, r !== Zi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Qi && e === void 0) {
      const r = n !== void 0 && n.length === 1;
      r && (e = za.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && za.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const gu = (t) => new _o(typeof t == "string" ? t : t + "", void 0, Zi), ea = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((r, i, a) => r + ((s) => {
    if (s._$cssResult$ === !0) return s.cssText;
    if (typeof s == "number") return s;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + s + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[a + 1], t[0]);
  return new _o(n, t, Zi);
}, mu = (t, e) => {
  if (Qi) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const r = document.createElement("style"), i = Or.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = n.cssText, t.appendChild(r);
  }
}, Ba = Qi ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const r of e.cssRules) n += r.cssText;
  return gu(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: yu, defineProperty: bu, getOwnPropertyDescriptor: wu, getOwnPropertyNames: Eu, getOwnPropertySymbols: $u, getPrototypeOf: Au } = Object, At = globalThis, Va = At.trustedTypes, Ou = Va ? Va.emptyScript : "", li = At.reactiveElementPolyfillSupport, Vn = (t, e) => t, Lr = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ou : null;
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
} }, ta = (t, e) => !yu(t, e), Wa = { attribute: !0, type: String, converter: Lr, reflect: !1, useDefault: !1, hasChanged: ta };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), At.litPropertyMetadata ?? (At.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let dn = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Wa) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, n);
      i !== void 0 && bu(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, r) {
    const { get: i, set: a } = wu(this.prototype, e) ?? { get() {
      return this[n];
    }, set(s) {
      this[n] = s;
    } };
    return { get: i, set(s) {
      const o = i == null ? void 0 : i.call(this);
      a == null || a.call(this, s), this.requestUpdate(e, o, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Wa;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Vn("elementProperties"))) return;
    const e = Au(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Vn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Vn("properties"))) {
      const n = this.properties, r = [...Eu(n), ...$u(n)];
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
      for (const i of r) n.unshift(Ba(i));
    } else e !== void 0 && n.push(Ba(e));
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
    return mu(e, this.constructor.elementStyles), e;
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
    var a;
    const r = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, r);
    if (i !== void 0 && r.reflect === !0) {
      const s = (((a = r.converter) == null ? void 0 : a.toAttribute) !== void 0 ? r.converter : Lr).toAttribute(n, r.type);
      this._$Em = e, s == null ? this.removeAttribute(i) : this.setAttribute(i, s), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var a, s;
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((a = o.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? o.converter : Lr;
      this._$Em = i;
      const c = l.fromAttribute(n, o.type);
      this[i] = c ?? ((s = this._$Ej) == null ? void 0 : s.get(i)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, n, r, i = !1, a) {
    var s;
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (a = this[e]), r ?? (r = o.getPropertyOptions(e)), !((r.hasChanged ?? ta)(a, n) || r.useDefault && r.reflect && a === ((s = this._$Ej) == null ? void 0 : s.get(e)) && !this.hasAttribute(o._$Eu(e, r)))) return;
      this.C(e, n, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: r, reflect: i, wrapped: a }, s) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, s ?? n ?? this[e]), a !== !0 || s !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (n = void 0), this._$AL.set(e, n)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
        for (const [a, s] of this._$Ep) this[a] = s;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [a, s] of i) {
        const { wrapped: o } = s, l = this[a];
        o !== !0 || this._$AL.has(a) || l === void 0 || this.C(a, void 0, s, l);
      }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), (r = this._$EO) == null || r.forEach((i) => {
        var a;
        return (a = i.hostUpdate) == null ? void 0 : a.call(i);
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
dn.elementStyles = [], dn.shadowRootOptions = { mode: "open" }, dn[Vn("elementProperties")] = /* @__PURE__ */ new Map(), dn[Vn("finalized")] = /* @__PURE__ */ new Map(), li == null || li({ ReactiveElement: dn }), (At.reactiveElementVersions ?? (At.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wn = globalThis, Ya = (t) => t, kr = Wn.trustedTypes, Ja = kr ? kr.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, go = "$lit$", gt = `lit$${Math.random().toFixed(9).slice(2)}$`, mo = "?" + gt, Su = `<${mo}>`, en = document, Kn = () => en.createComment(""), Xn = (t) => t === null || typeof t != "object" && typeof t != "function", na = Array.isArray, xu = (t) => na(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", ci = `[ 	
\f\r]`, Fn = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ka = /-->/g, Xa = />/g, Ht = RegExp(`>|${ci}(?:([^\\s"'>=/]+)(${ci}*=${ci}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Qa = /'/g, Za = /"/g, yo = /^(?:script|style|textarea|title)$/i, Tu = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), un = Tu(1), Cn = Symbol.for("lit-noChange"), U = Symbol.for("lit-nothing"), es = /* @__PURE__ */ new WeakMap(), Gt = en.createTreeWalker(en, 129);
function bo(t, e) {
  if (!na(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ja !== void 0 ? Ja.createHTML(e) : e;
}
const Nu = (t, e) => {
  const n = t.length - 1, r = [];
  let i, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", s = Fn;
  for (let o = 0; o < n; o++) {
    const l = t[o];
    let c, u, p = -1, m = 0;
    for (; m < l.length && (s.lastIndex = m, u = s.exec(l), u !== null); ) m = s.lastIndex, s === Fn ? u[1] === "!--" ? s = Ka : u[1] !== void 0 ? s = Xa : u[2] !== void 0 ? (yo.test(u[2]) && (i = RegExp("</" + u[2], "g")), s = Ht) : u[3] !== void 0 && (s = Ht) : s === Ht ? u[0] === ">" ? (s = i ?? Fn, p = -1) : u[1] === void 0 ? p = -2 : (p = s.lastIndex - u[2].length, c = u[1], s = u[3] === void 0 ? Ht : u[3] === '"' ? Za : Qa) : s === Za || s === Qa ? s = Ht : s === Ka || s === Xa ? s = Fn : (s = Ht, i = void 0);
    const w = s === Ht && t[o + 1].startsWith("/>") ? " " : "";
    a += s === Fn ? l + Su : p >= 0 ? (r.push(c), l.slice(0, p) + go + l.slice(p) + gt + w) : l + gt + (p === -2 ? o : w);
  }
  return [bo(t, a + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class Qn {
  constructor({ strings: e, _$litType$: n }, r) {
    let i;
    this.parts = [];
    let a = 0, s = 0;
    const o = e.length - 1, l = this.parts, [c, u] = Nu(e, n);
    if (this.el = Qn.createElement(c, r), Gt.currentNode = this.el.content, n === 2 || n === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = Gt.nextNode()) !== null && l.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(go)) {
          const m = u[s++], w = i.getAttribute(p).split(gt), _ = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: a, name: _[2], strings: w, ctor: _[1] === "." ? Ru : _[1] === "?" ? Iu : _[1] === "@" ? Lu : Ur }), i.removeAttribute(p);
        } else p.startsWith(gt) && (l.push({ type: 6, index: a }), i.removeAttribute(p));
        if (yo.test(i.tagName)) {
          const p = i.textContent.split(gt), m = p.length - 1;
          if (m > 0) {
            i.textContent = kr ? kr.emptyScript : "";
            for (let w = 0; w < m; w++) i.append(p[w], Kn()), Gt.nextNode(), l.push({ type: 2, index: ++a });
            i.append(p[m], Kn());
          }
        }
      } else if (i.nodeType === 8) if (i.data === mo) l.push({ type: 2, index: a });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(gt, p + 1)) !== -1; ) l.push({ type: 7, index: a }), p += gt.length - 1;
      }
      a++;
    }
  }
  static createElement(e, n) {
    const r = en.createElement("template");
    return r.innerHTML = e, r;
  }
}
function Rn(t, e, n = t, r) {
  var s, o;
  if (e === Cn) return e;
  let i = r !== void 0 ? (s = n._$Co) == null ? void 0 : s[r] : n._$Cl;
  const a = Xn(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== a && ((o = i == null ? void 0 : i._$AO) == null || o.call(i, !1), a === void 0 ? i = void 0 : (i = new a(t), i._$AT(t, n, r)), r !== void 0 ? (n._$Co ?? (n._$Co = []))[r] = i : n._$Cl = i), i !== void 0 && (e = Rn(t, i._$AS(t, e.values), i, r)), e;
}
class Cu {
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
    const { el: { content: n }, parts: r } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? en).importNode(n, !0);
    Gt.currentNode = i;
    let a = Gt.nextNode(), s = 0, o = 0, l = r[0];
    for (; l !== void 0; ) {
      if (s === l.index) {
        let c;
        l.type === 2 ? c = new lr(a, a.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(a, l.name, l.strings, this, e) : l.type === 6 && (c = new ku(a, this, e)), this._$AV.push(c), l = r[++o];
      }
      s !== (l == null ? void 0 : l.index) && (a = Gt.nextNode(), s++);
    }
    return Gt.currentNode = en, i;
  }
  p(e) {
    let n = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, n), n += r.strings.length - 2) : r._$AI(e[n])), n++;
  }
}
class lr {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, r, i) {
    this.type = 2, this._$AH = U, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = r, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
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
    e = Rn(this, e, n), Xn(e) ? e === U || e == null || e === "" ? (this._$AH !== U && this._$AR(), this._$AH = U) : e !== this._$AH && e !== Cn && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : xu(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== U && Xn(this._$AH) ? this._$AA.nextSibling.data = e : this.T(en.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var a;
    const { values: n, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = Qn.createElement(bo(r.h, r.h[0]), this.options)), r);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === i) this._$AH.p(n);
    else {
      const s = new Cu(i, this), o = s.u(this.options);
      s.p(n), this.T(o), this._$AH = s;
    }
  }
  _$AC(e) {
    let n = es.get(e.strings);
    return n === void 0 && es.set(e.strings, n = new Qn(e)), n;
  }
  k(e) {
    na(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let r, i = 0;
    for (const a of e) i === n.length ? n.push(r = new lr(this.O(Kn()), this.O(Kn()), this, this.options)) : r = n[i], r._$AI(a), i++;
    i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, n); e !== this._$AB; ) {
      const i = Ya(e).nextSibling;
      Ya(e).remove(), e = i;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class Ur {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, r, i, a) {
    this.type = 1, this._$AH = U, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = a, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = U;
  }
  _$AI(e, n = this, r, i) {
    const a = this.strings;
    let s = !1;
    if (a === void 0) e = Rn(this, e, n, 0), s = !Xn(e) || e !== this._$AH && e !== Cn, s && (this._$AH = e);
    else {
      const o = e;
      let l, c;
      for (e = a[0], l = 0; l < a.length - 1; l++) c = Rn(this, o[r + l], n, l), c === Cn && (c = this._$AH[l]), s || (s = !Xn(c) || c !== this._$AH[l]), c === U ? e = U : e !== U && (e += (c ?? "") + a[l + 1]), this._$AH[l] = c;
    }
    s && !i && this.j(e);
  }
  j(e) {
    e === U ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ru extends Ur {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === U ? void 0 : e;
  }
}
class Iu extends Ur {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== U);
  }
}
class Lu extends Ur {
  constructor(e, n, r, i, a) {
    super(e, n, r, i, a), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = Rn(this, e, n, 0) ?? U) === Cn) return;
    const r = this._$AH, i = e === U && r !== U || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, a = e !== U && (r === U || i);
    i && this.element.removeEventListener(this.name, this, r), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ku {
  constructor(e, n, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Rn(this, e);
  }
}
const ui = Wn.litHtmlPolyfillSupport;
ui == null || ui(Qn, lr), (Wn.litHtmlVersions ?? (Wn.litHtmlVersions = [])).push("3.3.2");
const Pu = (t, e, n) => {
  const r = (n == null ? void 0 : n.renderBefore) ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const a = (n == null ? void 0 : n.renderBefore) ?? null;
    r._$litPart$ = i = new lr(e.insertBefore(Kn(), a), a, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Jt = globalThis;
class Yn extends dn {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Pu(n, this.renderRoot, this.renderOptions);
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
    return Cn;
  }
}
var is;
Yn._$litElement$ = !0, Yn.finalized = !0, (is = Jt.litElementHydrateSupport) == null || is.call(Jt, { LitElement: Yn });
const di = Jt.litElementPolyfillSupport;
di == null || di({ LitElement: Yn });
(Jt.litElementVersions ?? (Jt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Du = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Mu = { attribute: !0, type: String, converter: Lr, reflect: !1, hasChanged: ta }, Hu = (t = Mu, e, n) => {
  const { kind: r, metadata: i } = n;
  let a = globalThis.litPropertyMetadata.get(i);
  if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(n.name, t), r === "accessor") {
    const { name: s } = n;
    return { set(o) {
      const l = e.get.call(this);
      e.set.call(this, o), this.requestUpdate(s, l, t, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(s, void 0, t, o), o;
    } };
  }
  if (r === "setter") {
    const { name: s } = n;
    return function(o) {
      const l = this[s];
      e.call(this, o), this.requestUpdate(s, l, t, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function zr(t) {
  return (e, n) => typeof n == "object" ? Hu(t, e, n) : ((r, i, a) => {
    const s = i.hasOwnProperty(a);
    return i.constructor.createProperty(a, r), s ? Object.getOwnPropertyDescriptor(i, a) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function cr(t) {
  return zr({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ju = (t, e, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, n), n);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Fu(t, e) {
  return (n, r, i) => {
    const a = (s) => {
      var o;
      return ((o = s.renderRoot) == null ? void 0 : o.querySelector(t)) ?? null;
    };
    return ju(n, r, { get() {
      return a(this);
    } });
  };
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qu = (t) => t ?? U, Gu = ea`
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
`, Uu = ea`
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
var zu = Object.defineProperty, Bu = Object.getOwnPropertyDescriptor, Je = (t, e, n, r) => {
  for (var i = r > 1 ? void 0 : r ? Bu(e, n) : e, a = t.length - 1, s; a >= 0; a--)
    (s = t[a]) && (i = (r ? s(e, n, i) : s(i)) || i);
  return r && i && zu(e, n, i), i;
};
const wo = "custom:", Vu = (t) => t.startsWith(wo), Wu = (t) => {
  var e;
  return (e = window.customCards) == null ? void 0 : e.find((n) => n.type === t);
}, Yu = (t) => t.replace(wo, "");
let _e = class extends Yn {
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
      let r;
      Vu(this._config.type) ? (r = (n = Wu(
        Yu(this._config.type)
      )) == null ? void 0 : n.name, r != null && r.toLowerCase().endsWith(" card") && (r = r.substring(0, r.length - 5))) : r = this.hass.localize(
        `ui.panel.lovelace.editor.card.${this._config.type}.name`
      ), e = `${e} - ${this.hass.localize(
        "ui.panel.lovelace.editor.edit_card.typed_header",
        { type: r }
      )}`;
    }
    return un`
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
                        disabled=${qu(t)}
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
    return un`
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
    const t = this._error ? "blur" : "", e = this._error ? un` <ha-spinner aria-label="Can't update card"></ha-spinner> ` : "";
    return un`
        ${this._config.type ? un`
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
            ` : un`
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
  Gu,
  Uu,
  ea`
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
Je([
  zr({ attribute: !1 })
], _e.prototype, "hass", 2);
Je([
  zr({ type: Boolean, reflect: !0 })
], _e.prototype, "large", 2);
Je([
  zr({ attribute: !1 })
], _e.prototype, "lovelace", 2);
Je([
  cr()
], _e.prototype, "_params", 2);
Je([
  cr()
], _e.prototype, "_config", 2);
Je([
  cr()
], _e.prototype, "_cardGUIMode", 2);
Je([
  cr()
], _e.prototype, "_cardGUIModeAvailable", 2);
Je([
  cr()
], _e.prototype, "_error", 2);
Je([
  Fu("hui-card-element-editor")
], _e.prototype, "_cardEditorEl", 2);
_e = Je([
  Du("expander-card-title-card-edit-form")
], _e);
console.info(
  `%c  Expander-Card 
%c Version ${_u}`,
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
  vu as default
};
//# sourceMappingURL=expander-card.js.map
